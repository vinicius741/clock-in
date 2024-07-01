import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, DataTable, IconButton } from "react-native-paper";
import { TextInput } from "react-native-paper";
import { Card, Text } from "react-native-paper";
import dayjs from "dayjs";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useWorkHours } from "../context/WorkHoursContext";
import GenericTable from "../components/GenericTable";

type WorkHour = {
    start: string;
    end: string;
};
const headers = [
    { key: "total", title: "Total" },
    { key: "start", title: "Start" },
    { key: "end", title: "End" },
    { key: "delete", title: "Delete" },
];

export default function Home() {
    const { workHours, addWorkHour, deleteWorkHour } = useWorkHours();
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [workTodayHours, setWorkTodayHours] = useState<WorkHour[]>([]);
    const [totalMinutesToday, settotalMinutesToday] = useState<number>(0);
    const today = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        const currentTime = dayjs().format("HH:mm");
        setStartTime(currentTime);
    }, []);

    useEffect(() => {
        const today = dayjs().format("YYYY-MM-DD");
        const todayEntries = workHours.filter((entry) =>
            dayjs(entry.start).isSame(today, "day")
        );
        setWorkTodayHours(todayEntries);
    }, [workHours]);

    useEffect(() => {
        calculateTotalHours(workTodayHours);
    }, [workTodayHours]);

    const saveData = () => {
        const startTimeDate = dayjs(`${today}T${startTime}:00`);
        const endTimeDate = dayjs(`${today}T${endTime}:00`);
        let calculatedEndTime;

        if (!startTimeDate.isValid()) {
            Alert.alert(
                "Invalid Time",
                "Please enter a valid time in HH:MM format."
            );
            return;
        }

        const noonTimeDate = dayjs(`${today}T12:00:00`);

        if (endTimeDate.isValid() && endTime !== "") {
            calculatedEndTime = endTimeDate;
        } else if (startTimeDate.isBefore(noonTimeDate)) {
            calculatedEndTime = noonTimeDate;
        } else {
            const minutesRemaining = 480 - totalMinutesToday;
            if (totalMinutesToday >= 480) {
                calculatedEndTime = startTimeDate.add(60, "minute");
            } else {
                calculatedEndTime = startTimeDate.add(
                    minutesRemaining,
                    "minute"
                );
            }
        }

        if (startTimeDate.isAfter(calculatedEndTime)) {
            Alert.alert(
                "Invalid Time",
                "End time cannot be before start time."
            );
            return;
        }

        const newEntry = {
            start: startTimeDate.format("YYYY-MM-DDTHH:mm:ss"),
            end: calculatedEndTime.format("YYYY-MM-DDTHH:mm:ss"),
        };

        addWorkHour(newEntry);
        setStartTime("");
        setEndTime("");
    };

    const calculateTotalHours = (hours: WorkHour[]) => {
        const total = hours.reduce((sum, entry) => {
            const duration = calculateHoursWorked(entry.start, entry.end);
            return sum + duration;
        }, 0);
        settotalMinutesToday(total);
    };

    const formatDateTime = (dateTime: string) => {
        return dayjs(dateTime).format("HH:mm");
    };

    const calculateHoursWorked = (start: string, end: string) => {
        const startTime = dayjs(start);
        const endTime = dayjs(end);
        const duration = endTime.diff(startTime, "minute");
        return duration;
    };

    const formatMinutes = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const formattedHours = hours.toString().padStart(2, "0");
        const formattedMinutes = remainingMinutes.toString().padStart(2, "0");

        return `${formattedHours}:${formattedMinutes}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <ScrollView>
                <Card style={styles.card}>
                    <Card.Content>
                        <Text variant="titleLarge">Clock-in</Text>
                        <TextInput
                            mode="outlined"
                            label="Start"
                            value={startTime}
                            onChangeText={setStartTime}
                            placeholder="HH:MM"
                        />
                        <TextInput
                            mode="outlined"
                            label="End"
                            value={endTime}
                            onChangeText={setEndTime}
                            placeholder="HH:MM"
                        />
                    </Card.Content>
                    <Button
                        icon="plus"
                        mode="contained"
                        style={styles.button}
                        onPress={() => saveData()}
                    >
                        Add
                    </Button>
                </Card>

                <Card style={styles.card}>
                    <Card.Content>
                        <GenericTable
                            headers={headers}
                            data={workTodayHours}
                            renderCellComponents={[
                                (entry: WorkHour) =>
                                    formatMinutes(
                                        calculateHoursWorked(
                                            entry.start,
                                            entry.end
                                        )
                                    ),
                                (entry: WorkHour) =>
                                    formatDateTime(entry.start),
                                (entry: WorkHour) => formatDateTime(entry.end),
                                (entry: WorkHour) => (
                                    <IconButton
                                        icon={() => (
                                            <Icon
                                                style={styles.actionCell}
                                                name="trash-can"
                                                size={24}
                                                color="red"
                                            />
                                        )}
                                        onPress={() => deleteWorkHour(entry)}
                                    />
                                ),
                            ]}
                        />
                    </Card.Content>
                </Card>
                <View style={styles.totalHoursContainer}>
                    <Text>
                        Total Hours Worked Today:{" "}
                        {formatMinutes(totalMinutesToday)}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
    },
    card: {
        margin: 10,
        marginTop: 20,
    },
    button: {
        margin: 10,
    },
    actionCell: {
        marginRight: 10,
    },
    totalHoursContainer: {
        padding: 16,
        alignItems: "center",
    },
});

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
    { key: "time", title: "Time" },
    { key: "edit", title: "Edit" },
    { key: "delete", title: "Delete" },
];

export default function Home() {
    const { workHours, addWorkHour, deleteWorkHour } = useWorkHours();
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [workTodayHours, setWorkTodayHours] = useState<WorkHour[]>([]);
    const [totalHoursToday, setTotalHoursToday] = useState<number>(0);

    const today = dayjs().format("YYYY-MM-DD");
    // useEffect(() => {
    //     AsyncStorage.clear();
    // }, []);

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

    const saveData = async () => {
        const newEntry = {
            start: `${today}T${startTime}:00`,
            end: `${today}T${endTime}:00`,
        };
        if (
            !dayjs(newEntry.start).isValid() ||
            !dayjs(newEntry.end).isValid()
        ) {
            Alert.alert(
                "Invalid Time",
                "Please enter a valid time in HH:MM format."
            );
            return;
        }

        if (dayjs(newEntry.start).isAfter(dayjs(newEntry.end))) {
            Alert.alert(
                "Invalid Time",
                "End time cannot be before start time."
            );
            return;
        }
        addWorkHour(newEntry);
    };

    const calculateTotalHours = (hours: WorkHour[]) => {
        const total = hours.reduce((sum, entry) => {
            const duration = calculateHoursWorked(entry.start, entry.end);
            return sum + duration;
        }, 0);
        setTotalHoursToday(total);
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
                        <Text variant="titleLarge">Add Time</Text>
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
                                (entry: WorkHour) =>
                                    formatDateTime(entry.start),
                                (entry: WorkHour) => formatDateTime(entry.end),
                                (entry: WorkHour) =>
                                    formatMinutes(
                                        calculateHoursWorked(
                                            entry.start,
                                            entry.end
                                        )
                                    ),
                            ]}
                        />
                    </Card.Content>
                </Card>
                <View style={styles.totalHoursContainer}>
                    <Text>
                        Total Hours Worked Today:{" "}
                        {formatMinutes(totalHoursToday)}
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
        marginRight: 20,
    },
    totalHoursContainer: {
        padding: 16,
        alignItems: "center",
    },
});

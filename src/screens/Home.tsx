import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, DataTable, IconButton } from "react-native-paper";
import { TextInput } from "react-native-paper";
import { Card, Text } from "react-native-paper";
import dayjs from "dayjs";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

type WorkHour = {
    start: string;
    end: string;
};

export default function Home() {
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [workHours, setWorkHours] = useState<WorkHour[]>([]);
    const [totalHoursToday, setTotalHoursToday] = useState<number>(0);

    const today = dayjs().format("YYYY-MM-DD");
    // useEffect(() => {
    //     AsyncStorage.clear();
    // }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("@work_hours");
                const data = jsonValue != null ? JSON.parse(jsonValue) : [];
                const todayWorkHours = data.filter((entry: WorkHour) =>
                    dayjs(entry.start).isSame(today, "day")
                );
                setWorkHours(todayWorkHours);
                setWorkHours(data);
            } catch (e) {
                console.error("Failed to load the data from storage", e);
            }
        };

        loadData();
    }, []);
    useEffect(() => {
        calculateTotalHours(workHours);
    }, [workHours]);

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

        const updatedWorkHours = [...workHours, newEntry];

        try {
            const jsonValue = JSON.stringify(updatedWorkHours);
            await AsyncStorage.setItem("@work_hours", jsonValue);
            setWorkHours(updatedWorkHours);
            setStartTime("");
            setEndTime("");
            console.log("Data saved");
        } catch (e) {
            console.error("Failed to save the data to the storage", e);
        }
    };

    const deleteEntry = async (index: number) => {
        const updatedWorkHours = workHours.filter((_, i) => i !== index);
        setWorkHours(updatedWorkHours);
        try {
            const jsonValue = JSON.stringify(updatedWorkHours);
            await AsyncStorage.setItem("@work_hours", jsonValue);
            console.log("Data deleted");
        } catch (e) {
            console.error("Failed to delete the data from the storage", e);
        }
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
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Action</DataTable.Title>
                            <DataTable.Title>Start Time</DataTable.Title>
                            <DataTable.Title>End Time</DataTable.Title>
                            <DataTable.Title>Total</DataTable.Title>
                        </DataTable.Header>

                        {workHours.map((entry, index) => (
                            <DataTable.Row key={index}>
                                <DataTable.Cell>
                                    <IconButton
                                        icon={() => (
                                            <Icon
                                                style={styles.actionCell}
                                                name="trash-can"
                                                size={24}
                                                color="red"
                                            />
                                        )}
                                        onPress={() => deleteEntry(index)}
                                    />
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    {formatDateTime(entry.start)}
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    {formatDateTime(entry.end)}
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    {formatMinutes(
                                        calculateHoursWorked(
                                            entry.start,
                                            entry.end
                                        )
                                    )}
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                </Card.Content>
            </Card>
            <View style={styles.totalHoursContainer}>
                <Text>
                    Total Hours Worked Today: {formatMinutes(totalHoursToday)}
                </Text>
            </View>
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

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    DataTable,
    IconButton,
    Modal,
    Portal,
    Provider,
    Button,
    TextInput,
} from "react-native-paper";
import dayjs from "dayjs";
import { Picker } from "@react-native-picker/picker";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface WorkHour {
    start: string;
    end: string;
}

export default function Report() {
    const [workHours, setWorkHours] = useState<WorkHour[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        dayjs().format("YYYY-MM")
    );
    const [months, setMonths] = useState<string[]>([]);
    const [totalHours, setTotalHours] = useState<string>("00:00");
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [currentEdit, setCurrentEdit] = useState<WorkHour | null>(null);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem("@work_hours");
                const data: WorkHour[] =
                    jsonValue != null ? JSON.parse(jsonValue) : [];
                const uniqueMonths: string[] = Array.from(
                    new Set(
                        data.map((entry: WorkHour) =>
                            dayjs(entry.start).format("YYYY-MM")
                        )
                    )
                );
                setWorkHours(data);
                setMonths(uniqueMonths);
                filterWorkHoursByMonth(selectedMonth, data);
            } catch (e) {
                console.error("Failed to load the data from storage", e);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        filterWorkHoursByMonth(selectedMonth, workHours);
    }, [selectedMonth]);

    const filterWorkHoursByMonth = (month: string, data: WorkHour[]) => {
        const filtered = data.filter(
            (entry: WorkHour) => dayjs(entry.start).format("YYYY-MM") === month
        );
        setWorkHours(filtered);
        calculateTotalHours(filtered);
    };

    const calculateTotalHours = (hours: WorkHour[]) => {
        const totalMinutes = hours.reduce((sum, entry) => {
            const start = dayjs(entry.start);
            const end = dayjs(entry.end);
            const duration = end.diff(start, "minute");
            return sum + duration;
        }, 0);

        const totalHours = Math.floor(totalMinutes / 60);
        const totalRemainingMinutes = totalMinutes % 60;
        const formattedTotalHours = `${String(totalHours).padStart(
            2,
            "0"
        )}:${String(totalRemainingMinutes).padStart(2, "0")}`;

        setTotalHours(formattedTotalHours);
    };

    const toggleModal = (entry?: WorkHour) => {
        if (entry) {
            setCurrentEdit(entry);
            setStartTime(dayjs(entry.start).format("HH:mm"));
            setEndTime(dayjs(entry.end).format("HH:mm"));
        } else {
            setCurrentEdit(null);
            setStartTime("");
            setEndTime("");
        }
        setModalVisible(!isModalVisible);
    };

    const saveEdit = async () => {
        if (!currentEdit) return;

        const updatedWorkHours = workHours.map((entry) => {
            if (
                entry.start === currentEdit.start &&
                entry.end === currentEdit.end
            ) {
                return {
                    start:
                        dayjs(currentEdit.start).format("YYYY-MM-DD") +
                        `T${startTime}:00`,
                    end:
                        dayjs(currentEdit.end).format("YYYY-MM-DD") +
                        `T${endTime}:00`,
                };
            }
            return entry;
        });

        try {
            const jsonValue = JSON.stringify(updatedWorkHours);
            await AsyncStorage.setItem("@work_hours", jsonValue);
            setWorkHours(updatedWorkHours);
            toggleModal();
            filterWorkHoursByMonth(selectedMonth, updatedWorkHours);
        } catch (e) {
            console.error("Failed to save the edited data to storage", e);
        }
    };

    const deleteEntry = async (index: number) => {
        const updatedWorkHours = workHours.filter((_, i) => i !== index);
        setWorkHours(updatedWorkHours);
        try {
            const jsonValue = JSON.stringify(updatedWorkHours);
            await AsyncStorage.setItem("@work_hours", jsonValue);
            console.log("Data deleted");
            filterWorkHoursByMonth(selectedMonth, updatedWorkHours);
        } catch (e) {
            console.error("Failed to delete the data from the storage", e);
        }
    };

    return (
        <Provider>
            <ScrollView>
                <View style={styles.container}>
                    <Text>Select Month:</Text>
                    <Picker
                        selectedValue={selectedMonth}
                        onValueChange={(itemValue) =>
                            setSelectedMonth(itemValue)
                        }
                    >
                        {months.map((month) => (
                            <Picker.Item
                                key={month}
                                label={dayjs(month).format("MMMM YYYY")}
                                value={month}
                            />
                        ))}
                    </Picker>
                    <Text>Total Hours Worked: {totalHours}</Text>
                    <DataTable>
                        <DataTable.Header>
                            <DataTable.Title>Date</DataTable.Title>
                            <DataTable.Title>Time</DataTable.Title>
                            <DataTable.Title>Worked</DataTable.Title>
                            <DataTable.Title>Edit</DataTable.Title>
                            <DataTable.Title>Delete</DataTable.Title>
                        </DataTable.Header>

                        {workHours.map((entry, index) => (
                            <DataTable.Row key={index}>
                                <DataTable.Cell>
                                    {dayjs(entry.start).format("MM")}
                                </DataTable.Cell>
                                <DataTable.Cell>
                                    <View>
                                        <Text>
                                            {dayjs(entry.start).format("HH:mm")}
                                        </Text>
                                        <Text>
                                            {dayjs(entry.end).format("HH:mm")}
                                        </Text>
                                    </View>
                                </DataTable.Cell>

                                <DataTable.Cell>
                                    {calculateHoursWorked(
                                        entry.start,
                                        entry.end
                                    )}
                                </DataTable.Cell>
                                <DataTable.Cell style={styles.actionCell}>
                                    <IconButton
                                        icon={() => (
                                            <MaterialCommunityIcons
                                                name="pencil"
                                                size={24}
                                                color="blue"
                                            />
                                        )}
                                        onPress={() => toggleModal(entry)}
                                    />
                                </DataTable.Cell>
                                <DataTable.Cell style={styles.actionCell}>
                                    <IconButton
                                        icon={() => (
                                            <MaterialCommunityIcons
                                                name="trash-can"
                                                size={24}
                                                color="red"
                                            />
                                        )}
                                        onPress={() => deleteEntry(index)}
                                    />
                                </DataTable.Cell>
                            </DataTable.Row>
                        ))}
                    </DataTable>
                    <Portal>
                        <Modal
                            visible={isModalVisible}
                            onDismiss={toggleModal}
                            contentContainerStyle={styles.modalContent}
                        >
                            <View style={{ width: "100%" }}>
                                <Text>Edit Entry</Text>
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
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        padding: 10,
                                        width: "100%",
                                    }}
                                >
                                    <Button
                                        mode="outlined"
                                        onPress={() => toggleModal()}
                                    >
                                        Cancel
                                    </Button>
                                    <Button mode="contained" onPress={saveEdit}>
                                        Save
                                    </Button>
                                </View>
                            </View>
                        </Modal>
                    </Portal>
                </View>
            </ScrollView>
        </Provider>
    );
}

const calculateHoursWorked = (start: string, end: string) => {
    const startTime = dayjs(start);
    const endTime = dayjs(end);
    const duration = endTime.diff(startTime, "minute");
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
    )}`;
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    actionCell: {
        // justifyContent: "center",
        // alignItems: "center",
        // flexDirection: "row",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 22,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 4,
        margin: 16,
    },
});

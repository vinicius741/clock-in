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
import { useWorkHours } from "../context/WorkHoursContext";

interface WorkHour {
    start: string;
    end: string;
}

export default function Report() {
    const { workHours, editWorkHour, deleteWorkHour } = useWorkHours();
    const [workHoursFiltredByMonth, setworkHoursFiltredByMonth] = useState<
        WorkHour[]
    >([]);
    const [selectedMonth, setSelectedMonth] = useState<string>(
        dayjs().format("YYYY-MM")
    );
    const [months, setMonths] = useState<string[]>([]);
    const [totalHours, setTotalHours] = useState<string>("00:00");
    const [isModalVisible, setModalVisible] = useState<boolean>(false);
    const [currentEdit, setCurrentEdit] = useState<WorkHour | null>(null);
    const [editDate, setEditDate] = useState<string>(
        dayjs().format("YYYY-MM-DD")
    );
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");

    useEffect(() => {
        filterWorkHoursByMonth(selectedMonth, workHours);
        const uniqueMonths: string[] = Array.from(
            new Set(
                workHours.map((entry: WorkHour) =>
                    dayjs(entry.start).format("YYYY-MM")
                )
            )
        );
        setMonths(uniqueMonths);
    }, [selectedMonth, workHours]);

    const filterWorkHoursByMonth = (month: string, data: WorkHour[]) => {
        const filtered = data.filter(
            (entry: WorkHour) => dayjs(entry.start).format("YYYY-MM") === month
        );
        setworkHoursFiltredByMonth(filtered);
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
            setEditDate(dayjs(entry.start).format("YYYY-MM-DD"));
            setStartTime(dayjs(entry.start).format("HH:mm"));
            setEndTime(dayjs(entry.end).format("HH:mm"));
        } else {
            setCurrentEdit(null);
            setEditDate(dayjs().format("YYYY-MM-DD"));
            setStartTime("");
            setEndTime("");
        }
        setModalVisible(!isModalVisible);
    };

    const saveEdit = () => {
        if (!currentEdit) return;

        const updatedEntry: WorkHour = {
            start: `${editDate}T${startTime}:00`,
            end: `${editDate}T${endTime}:00`,
        };

        editWorkHour(updatedEntry, currentEdit);
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

                        {workHoursFiltredByMonth.map((entry, index) => (
                            <DataTable.Row key={index}>
                                <DataTable.Cell>
                                    {dayjs(entry.start).format("DD")}
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
                                        onPress={() => deleteWorkHour(entry)}
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

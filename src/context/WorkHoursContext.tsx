import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";

type WorkHour = {
    start: string;
    end: string;
};

type WorkHoursContextType = {
    workHours: WorkHour[];
    loadWorkHours: () => void;
    addWorkHour: (newEntry: WorkHour) => void;
    editWorkHour: (updatedEntry: WorkHour, originalEntry: WorkHour) => void;
    deleteWorkHour: (entry: WorkHour) => void;
};

const WorkHoursContext = createContext<WorkHoursContextType | undefined>(
    undefined
);

export const WorkHoursProvider: React.FC<React.PropsWithChildren<{}>> = ({
    children,
}) => {
    const [workHours, setWorkHours] = useState<WorkHour[]>([]);

    const loadWorkHours = async () => {
        try {
            const jsonValue = await AsyncStorage.getItem("@work_hours");
            const data: WorkHour[] =
                jsonValue != null ? JSON.parse(jsonValue) : [];
            setWorkHours(data);
        } catch (e) {
            console.error("Failed to load the data from storage", e);
        }
    };

    const addWorkHour = async (newEntry: WorkHour) => {
        const updatedWorkHours = [...workHours, newEntry];
        setWorkHours(updatedWorkHours);
        await AsyncStorage.setItem(
            "@work_hours",
            JSON.stringify(updatedWorkHours)
        );
    };

    const editWorkHour = async (
        updatedEntry: WorkHour,
        originalEntry: WorkHour
    ) => {
        const updatedWorkHours = workHours.map((entry) =>
            entry.start === originalEntry.start &&
            entry.end === originalEntry.end
                ? updatedEntry
                : entry
        );
        setWorkHours(updatedWorkHours);
        await AsyncStorage.setItem(
            "@work_hours",
            JSON.stringify(updatedWorkHours)
        );
    };

    const deleteWorkHour = async (entry: WorkHour) => {
        const updatedWorkHours = workHours.filter(
            (e) => e.start !== entry.start || e.end !== entry.end
        );
        setWorkHours(updatedWorkHours);
        await AsyncStorage.setItem(
            "@work_hours",
            JSON.stringify(updatedWorkHours)
        );
    };

    useEffect(() => {
        loadWorkHours();
    }, []);

    return (
        <WorkHoursContext.Provider
            value={{
                workHours,
                loadWorkHours,
                addWorkHour,
                editWorkHour,
                deleteWorkHour,
            }}
        >
            {children}
        </WorkHoursContext.Provider>
    );
};

export const useWorkHours = () => {
    const context = useContext(WorkHoursContext);
    if (context === undefined) {
        throw new Error("useWorkHours must be used within a WorkHoursProvider");
    }
    return context;
};

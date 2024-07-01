import { PaperProvider } from "react-native-paper";
import Index from "./src";
import { NavigationContainer } from "@react-navigation/native";
import { WorkHoursProvider } from "./src/context/WorkHoursContext";

export default function App() {
    return (
        <WorkHoursProvider>
            <PaperProvider>
                <NavigationContainer>
                    <Index />
                </NavigationContainer>
            </PaperProvider>
        </WorkHoursProvider>
    );
}

import { PaperProvider } from "react-native-paper";
import Index from "./src";
import { NavigationContainer } from "@react-navigation/native";

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <Index />
            </NavigationContainer>
        </PaperProvider>
    );
}

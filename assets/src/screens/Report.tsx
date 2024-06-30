import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";

export default function Report() {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Text variant="headlineMedium">Report!</Text>
            <Button mode="contained" onPress={() => console.log("Pressed")}>
                Report
            </Button>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});

import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

export default function Index() {
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <Button
                icon="camera"
                mode="contained"
                onPress={() => console.log("Pressed")}
            >
                Press me
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

import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";

// viewport height function to make life easier
const vw = w => Dimensions.get("window").width * (w/100);
const vh = h => Dimensions.get("window").height * (h/100);

const TasksScreenCard = (props) => {
    return (
        <View style={styles.body}>
            <Text>text</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        width: vw(100),
        height: vh(8),
        borderColor: "black",
        borderBottomWidth: 1,
        backgroundColor: "#f7bcbc"
    }
});

export default TasksScreenCard;
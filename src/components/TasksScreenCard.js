import React, { useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";
import { UserDataContext } from "../SessionUserData";

// viewport height function to make life easier
import { vw, vh } from "../Toolbox";

const TasksScreenCard = (props) => {
    const userContext = useContext( UserDataContext );

    if (userContext.cardSlots[props.cardName]) {
        return (
            <View style={styles.body}>
                <View style={styles.leftView}>
                    <Text style={styles.titleText}>{ (props.cardName == "daily") ? "Daily" : "Custom" } Card</Text>
                </View>
                <View style={styles.rightView}>
                    <Text>carat here</Text>
                </View>
            </View>
        );
    } else {
        return (
            <View style={styles.body}>
                <View style={styles.leftView}>
                    <Text style={styles.titleText}>no card here :(</Text>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    body: {
        width: vw(100),
        height: vh(8),
        paddingHorizontal: "2%",
        borderColor: "black",
        borderBottomWidth: 1,
        backgroundColor: "#f7bcbc",
        flexDirection: "row"
    },
    leftView: {
        flex: 0.8,
        flexDirection: "row",
        backgroundColor: "red"
    },
    titleText: {
        flex: 0.5,
        fontSize: vh(8)/3,
        backgroundColor: "blue",
        textAlignVertical: "center"
    },
    rightView: {
        flex: 0.2,
        backgroundColor: "yellow"
    }
});

export default TasksScreenCard;
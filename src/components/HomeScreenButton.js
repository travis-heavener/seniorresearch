import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

const HomeScreenButton = (props) => {
    const size = (props.flex * 100);

    return (
        <TouchableOpacity
            style={[styles.body, {height: size + "%", borderRadius: size}]}
            onPress={props.onPress}
            activeOpacity={.65}
        >
            <Text style={{textAlign: "center"}}>{props.flex}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    body: {
        aspectRatio: 1,
        borderColor: "black",
        borderWidth: 3,
        backgroundColor: "#f7bcbc",
        justifyContent: "center"
    }
});

export default HomeScreenButton;
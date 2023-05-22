import React from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { vh } from "../../config/Toolbox";

/* add require statements for preloaded image lookup (DON'T PASS IMG THRU PROPS, PASS TYPE) */

const PROFILE_SRC = require("../../../assets/media/profile_icon.png");
const TASKS_SRC = require("../../../assets/media/tasks_icon.png");
const REWARDS_SRC = require("../../../assets/media/rewards_icon.png");

const HomeScreenButton = (props) => {
    const size = (props.flex * 100);
    const height = vh(props.flex * 15);

    const src = props.type == "Profile" ? PROFILE_SRC
        : props.type == "Tasks" ? TASKS_SRC
        : props.type == "Rewards" ? REWARDS_SRC
        : null;

    return (
        <TouchableOpacity
            style={[styles.body, {height: height, borderRadius: size}]}
            onPress={props.onPress}
            activeOpacity={.65}
        >
            {/* <Text style={{textAlign: "center"}}>{props.type}</Text> */}
            <Image source={src} style={styles.image} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    body: {
        aspectRatio: 1,
        borderColor: "black",
        borderWidth: 3,
        backgroundColor: "#ddd8",
        justifyContent: "center"
    },
    image: {
        height: "90%",
        alignSelf: "center",
        aspectRatio: 1
    }
});

export default HomeScreenButton;
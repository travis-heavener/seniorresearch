import { React, useState } from "react";
import { View, StyleSheet, Text, ImageBackground, Image } from "react-native";

import { SETTINGS } from "../Settings";

// configure magnetometer updates
// import { setUpdateIntervalForType, SensorTypes, magnetometer } from "react-native-sensors";
// setUpdateIntervalForType(SensorTypes.magnetometer, 10 + (190 * SETTINGS.useBatterySaver));

import { Magnetometer } from "expo-sensors";
Magnetometer.setUpdateInterval(20);

// import images
const MEDIA_ROOT = "../../assets/media/";
const WRAPPER_SRC = require(MEDIA_ROOT + "compassWrapper.png");
const NEEDLE_SRC = require(MEDIA_ROOT + "needle.png");

const CompassWidget = (props) => {
    const [degrees, setDegrees] = useState(0);

    Magnetometer.addListener(({ x, y }) => {
        let deg = -Math.atan2(y, x) * (180 / Math.PI) + 90;
        setDegrees(Math.round(deg));
    });

    return (
        // rotating needle
        // <ImageBackground style={styles.wrapperImg} source={WRAPPER_SRC}>
        //     <Image style={[styles.needleImg, {transform: [{rotate: degrees + "deg"}]}]} source={NEEDLE_SRC} />
        // </ImageBackground>

        // rotating compass w/ counter-rotating needle
        <ImageBackground style={[styles.wrapperImg, {transform: [{rotate: degrees + "deg"}]}]} source={WRAPPER_SRC}>
            <Image style={[styles.needleImg, {transform: [{rotate: -degrees + "deg"}]}]} source={NEEDLE_SRC} />
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    wrapperImg: {
        flex: 1,
        marginRight: "2.5%",
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        // borderColor: "black",
        // borderWidth: 3,
        // backgroundColor: "#f7bcbc"
    },
    needleImg: {
        width: "75%",
        height: "75%"
    }
});

export default CompassWidget;
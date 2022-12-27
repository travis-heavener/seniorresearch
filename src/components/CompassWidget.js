import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, ImageBackground, Image } from "react-native";

import { Settings } from "../Config";

// configure magnetometer updates
import { DeviceMotion } from "expo-sensors";

// import images
const MEDIA_ROOT = "../../assets/media/";
const WRAPPER_SRC = require(MEDIA_ROOT + "compassWrapper.png");
const NEEDLE_SRC = require(MEDIA_ROOT + "needle.png");

const CompassWidget = (props) => {
    DeviceMotion.setUpdateInterval(20 + (80 * Settings.useBatterySaver));

    const [rotation, setRotation] = useState({alpha: 0, beta: 0, gamma: 0});

    useFocusEffect(
        React.useCallback(() => {
            let list = DeviceMotion.addListener(({ rotation, interval }) => {
                setRotation( rotation );
            });

            return () => list.remove();
        }, [props])
    );

    return (
        // rotating needle
        // <ImageBackground style={styles.wrapperImg} source={WRAPPER_SRC}>
        //     <Image style={[styles.needleImg, {transform: [{rotate: degrees + "deg"}]}]} source={NEEDLE_SRC} />
        // </ImageBackground>

        // rotating compass w/ counter-rotating needle
        <ImageBackground style={[styles.wrapperImg, {transform: [{rotate: rotation.alpha + "rad"}]}]} source={WRAPPER_SRC}>
            <Image style={[styles.needleImg, {transform: [{rotate: -rotation.alpha + "rad"}]}]} source={NEEDLE_SRC} />
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
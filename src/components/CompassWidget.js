import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, ImageBackground, Image, Text } from "react-native";

import { Settings } from "../config/Config";

// configure magnetometer updates
import { DeviceMotion } from "expo-sensors";
import { UserDataContext } from "../config/UserDataManager";

// import images
const MEDIA_ROOT = "../../assets/media/";
const WRAPPER_SRC = require(MEDIA_ROOT + "compassWrapper.png");
const NEEDLE_SRC = require(MEDIA_ROOT + "needle.png");

const CompassWidget = (props) => {
    const userContext = React.useContext(UserDataContext);

    const [alpha, setAlpha] = useState(null);
    const alphaRef = React.useRef();
    alphaRef.current = alpha;

    const [lastAlpha, setLastAlpha] = useState(null);
    const lastAlphaRef = React.useRef();
    lastAlphaRef.current = lastAlpha;

    const [timeSinceUpdate, setTimeSinceUpdate] = useState(Date.now());
    const timeSinceUpdateRef = React.useRef();
    timeSinceUpdateRef.current = timeSinceUpdate;

    useFocusEffect(
        React.useCallback(() => {
            let list = DeviceMotion.addListener(({ rotation }) => {
                // manage callback speed
                const rate = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].compassUpdate;
                if (Date.now() - timeSinceUpdateRef.current < rate) return;
                setTimeSinceUpdate(Date.now());

                const format = n => (n < 0 ? n + 2*Math.PI : n) % (2*Math.PI);

                if (rotation == undefined) {
                    return;
                } else if (alphaRef.current == null) {
                    setAlpha( format(rotation.alpha) );
                    return;
                } else if (lastAlphaRef.current == null) {
                    setLastAlpha( format(alphaRef.current) );
                    setAlpha( format(rotation.alpha) );
                    return;
                }

                // queue rotation
                let alpha = format(rotation.alpha);
                let initial = lastAlphaRef.current;
                let frames = 20;
                
                let delta = alpha - initial;
                if (Math.abs(delta) > Math.PI)
                delta -= 2 * Math.PI * Math.sign(delta);
                
                let step = delta / frames;
                
                if (Math.abs(delta) < 0.1) return; // ignore needless calculations

                let interval = (rate * .8) / frames;
                
                for (let i = 0; i < frames; i++) {
                    setTimeout(function() {
                        setAlpha(format(initial + step * (i+1)));
                        if (i+1 == frames) setLastAlpha(format(alphaRef.current));
                    }, i * interval);
                }
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
        <ImageBackground style={[styles.wrapperImg, {transform: [{rotate: (alphaRef.current ?? 0) + "rad"}]}]} source={WRAPPER_SRC}>
            <Image style={[styles.needleImg, {transform: [{rotate: (-alphaRef.current ?? 0) + "rad"}]}]} source={NEEDLE_SRC} />
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
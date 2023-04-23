import React, { useEffect, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, ImageBackground, Image, Text, Animated, View, Easing } from "react-native";

import { Settings } from "../config/Config";

// configure magnetometer updates
import { DeviceMotion } from "expo-sensors";
import { UserDataContext } from "../config/UserDataManager";

// import images
const MEDIA_ROOT = "../../assets/media/";
const WRAPPER_LIGHT_SRC = require(MEDIA_ROOT + "compassWrapperLight.png");
const WRAPPER_DARK_SRC = require(MEDIA_ROOT + "compassWrapperDark.png");
const NEEDLE_SRC = require(MEDIA_ROOT + "needle.png");

const CompassWidget = (props) => {
    const userContext = React.useContext(UserDataContext);

	const [lastAlpha, setLastAlpha] = useState(0);
	const lastAlphaRef = useRef();
	lastAlphaRef.current = lastAlpha;

    const [timeSinceUpdate, setTimeSinceUpdate] = useState(Date.now());
    const timeSinceUpdateRef = useRef();
    timeSinceUpdateRef.current = timeSinceUpdate;

    // loads every time screen is focused
	useFocusEffect(
        React.useCallback(() => {
            let list = DeviceMotion.addListener(({ rotation }) => {
                // manage callback speed
                const rate = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].compassUpdate;
                if (Date.now() - timeSinceUpdateRef.current < rate) return;
                setTimeSinceUpdate(Date.now());

				// calculate & queue rotation
                if (rotation == undefined) return; // prevent empty information

				// I hate this so much
				// I spent so much time with this (~8 hrs) and converting
				// to degrees was what fixed everyting.
				const deg = n => n * 180 / Math.PI;
				
				// thanks stackoverflow
				// https://stackoverflow.com/questions/19618745/css3-rotate-transition-doesnt-take-shortest-way/53416030#53416030
				let nR = deg(rotation.alpha + (rotation.alpha < 0 ? 2*Math.PI : 0)); // scale from [-pi, pi] to [0, 360]
				let rot = lastAlphaRef.current;

				let aR = rot % 360; // the apparent rotation, or how it is visibly shown (not the actual value which stores more rotations than [0,360])
				if (aR < 0) aR += 360; // convert negative values to positive
				if (aR < 180 && (nR > (aR + 180))) rot -= 360; // rotation over a 0/360 hitch
				if (aR >= 180 && (nR <= (aR - 180))) rot += 360; // rotation over a 0/360 hitch

				rot += nR - aR; // add the rotation to the previous value

				Animated.timing(rotateAnim, {
					toValue: rot,
					timing: rate * 0.75,
					easing: Easing.linear,
					useNativeDriver: true
				}).start();

				// store last rotation value
				setLastAlpha(rot);
            });

            return () => list.remove();
        }, [props.navigation.isFocused()])
    );

	const rotateAnim = useRef(new Animated.Value(0)).current;
    
	// basically this formats the input angle to a range of strings the rotation can use
	const alpha = rotateAnim.interpolate({
        inputRange: [0, 360],
		outputRange: ["0deg", "360deg"]
	});

    // toggle color based on theme
    const wrapperSrc = (userContext.selectedTheme == "dark") ? WRAPPER_LIGHT_SRC : WRAPPER_DARK_SRC;

    return (
        // rotating needle
        // <ImageBackground style={styles.wrapperImg} source={WRAPPER_SRC}>
        //     <Image style={[styles.needleImg, {transform: [{rotate: degrees + "deg"}]}]} source={NEEDLE_SRC} />
        // </ImageBackground>

        // rotating compass w/ counter-rotating needle
        // <ImageBackground style={[styles.wrapperImg, {transform: [{rotate: (alphaRef.current ?? 0) + "rad"}]}]} source={WRAPPER_SRC}>
        //     <Image style={[styles.needleImg, {transform: [{rotate: (-alphaRef.current ?? 0) + "rad"}]}]} source={NEEDLE_SRC} />
        // </ImageBackground>
		<View style={styles.top}>
			<Animated.Image style={[styles.wrapperImg, {transform: [{rotate: alpha}]}]} source={wrapperSrc} />
			<Image style={styles.needleImg} source={NEEDLE_SRC} />
		</View>
    );
};

const styles = StyleSheet.create({
    top: {
		flex: 1,
        justifyContent: "center",
        alignItems: "center"
	},
	wrapperImg: {
        width: "100%",
        height: "100%"
    },
    needleImg: {
		position: "absolute",
        width: "75%",
        height: "75%"
    }
});

export default CompassWidget;
import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { View, StyleSheet, Pressable, Image } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer, DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";

// components & modals
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";
import CardDisplayGrid from "../components/CardDisplayGrid";
import BackgroundGradient from "../components/BackgroundGradient";
import GestureWrapper from "../components/GestureWrapper";

import { PermsContext } from "../config/Config";
import { Themes } from "../config/Themes";
import { UserDataContext } from "../config/UserDataManager";
import { vh, vw } from "../config/Toolbox";
import { eventEmitter } from "../config/Main";
import SwipeNavWrapper from "../components/SwipeNavWrapper";

const SETTINGS_ICON = require("../../assets/media/settingsWheel.png");

const HomeScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].home; // select theme

    // remount
    const [__remountStatus, __setRemountStatus] = useState(0);
    const remount = () => __setRemountStatus(Math.random());
    
    // forces a remount on screen load
    useIsFocused();

    // on screen focus
    useFocusEffect(
        useCallback(
            () => {
                // event emitters
                eventEmitter.removeAllListeners("remountHome"); // remove existing listeners
                eventEmitter.addListener("remountHome", () => { // add new listener
                    remount();
                });

                // navigation listener
                eventEmitter.removeAllListeners("navigate"); // remove existing listeners
                eventEmitter.addListener("navigate", name => props.navigation.navigate(name) );

                // send users back to signup if they somehow skip it
                if (userContext.stats.isNewUser)
                    props.navigation.navigate("Signup");
            }, [props]
        )
    );

    // button functions
    const openProfile = () => props.navigation.navigate("Profile");
    const openTasks = () => props.navigation.navigate("Tasks");
    const openRewards = () => props.navigation.navigate("Rewards");
    const openSettings = () => props.navigation.navigate("Settings");

	return (
        <View style={styles.top}>
			<BackgroundGradient />
			{/* background blur -- https://github.com/Kureev/react-native-blur */}
			{/* <BlurView blurAmount={3} blurType="light" style={[styles.absolute, {display: (isBlurred ? "flex" : "none")}]} /> */}

			<View style={styles.header}>
				<Pressable onPress={openSettings}>
					<Image style={styles.settingsIcon} source={SETTINGS_ICON} />
				</Pressable>
				<View style={styles.compassWrapper}>
					<CompassWidget />
				</View>
			</View>

			<View style={styles.body}>
				<CardDisplayGrid />
			</View>

			<View style={styles.bottomButtons}>
				<HomeScreenButton type="Profile" flex={.75} onPress={openProfile} />
				<HomeScreenButton type="Tasks" flex={.95} onPress={openTasks} />
				<HomeScreenButton type="Rewards" flex={.75} onPress={openRewards} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        width: vw(100),
        height: vh(100),
        zIndex: 10000
    },
    top: {
        width: vw(100),
        height: vh(100)
    },
    header: {
        flex: 0.1,
        paddingHorizontal: "2.5%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    compassWrapper: {
        height: "100%",
        aspectRatio: 1
    },
    settingsIcon: {
        height: "87.5%",
        marginHorizontal: "5%",
        marginTop: "5%",
        marginBottom: "12.5%",
        aspectRatio: 1
    },
    body: {
        flex: 0.75,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    bottomButtons: {
        flex: .15,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center"
    }
});

export default HomeScreen;

import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { View, StyleSheet, Pressable, Image } from "react-native";

// components & modals
import HomeScreenButton from "../components/HomeScreen/HomeScreenButton";
import CompassWidget from "../components/HomeScreen/CompassWidget";
import CardDisplayGrid from "../components/HomeScreen/CardDisplayGrid";
import BackgroundGradient from "../components/HomeScreen/BackgroundGradient";

import { Themes } from "../config/Themes";
import { UserDataContext } from "../config/UserDataManager";
import { vh, vw } from "../config/Toolbox";
import { eventEmitter } from "../config/Main";

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

                // send users back to signup if they somehow skip it
                if (userContext.stats.isNewUser)
                    props.navigate("Signup");
            }, [props]
        )
    );

    // button functions
    const openProfile = () => props.navigate("Profile");
    const openTasks = () => props.navigate("Tasks");
    const openRewards = () => props.navigate("Rewards");
    const openSettings = () => props.navigate("Settings");

	return (
        <View style={styles.top}>
			<BackgroundGradient />

			<View style={styles.header}>
				<Pressable onPress={openSettings}>
					<Image style={styles.settingsIcon} source={SETTINGS_ICON} />
				</Pressable>
				<View style={styles.compassWrapper}>
					<CompassWidget />
				</View>
			</View>

			<View style={styles.body}>
				<CardDisplayGrid freezeGestures={props.freezeGestures} unfreezeGestures={props.unfreezeGestures} />
			</View>

			<View style={styles.bottomButtons}>
				<HomeScreenButton type="Profile" flex={.85} onPress={openProfile} />
				<HomeScreenButton type="Tasks" flex={1} onPress={openTasks} />
				<HomeScreenButton type="Rewards" flex={.85} onPress={openRewards} />
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
        position: "absolute",
        top: vh(1.25),
        width: vw(100),
        height: vh(10.25),
        paddingHorizontal: "2.5%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    compassWrapper: {
        height: "100%",
        aspectRatio: 1
    },
    settingsIcon: {
        height: "95%",
        marginHorizontal: "5%",
        marginTop: "5%",
        marginBottom: "12.5%",
        aspectRatio: 1
    },
    body: {
        position: "absolute",
        top: vh(14), // halfway
        width: vw(100),
        height: vh(70),
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center"
    },
    bottomButtons: {
        position: "absolute",
        bottom: vh(2.75),
        width: vw(100),
        height: vh(15),
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center"
    }
});

export default HomeScreen;

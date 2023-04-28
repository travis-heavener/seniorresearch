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

import { Settings, PermsContext } from "../config/Config";
import { Themes } from "../config/Themes";
import { exportUserData, UserDataContext } from "../config/UserDataManager";
import { generateDailySeed, vh, vw } from "../config/Toolbox";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { handleAccelerometerData, handleLocationData } from "../config/SensorsManager";
import { eventEmitter, handleAppTick } from "../config/Main";

const SETTINGS_ICON = require("../../assets/media/settingsWheel.png");

const HomeScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const permsContext = useContext( PermsContext );
    const THEME = Themes[ userContext.selectedTheme ].home; // select theme

    // remount (USE SPARINGLY)
    const [__remountStatus, __setRemountStatus] = useState(0);
    const remount = () => __setRemountStatus(Math.random());
    
    // forces a remount on screen load
    useIsFocused();

    const [hasStarted, setHasStarted] = useState(false);

    // initial, on-load events (empty triggers array to act as componentDidMount)
    useEffect(() => {
        ( async () => {
            if (hasStarted) return;

            // request permissions
            let perms = await permsContext.requestPermissions();

            // start pedometer
            if (perms.ACTIVITY_RECOGNITION) {
                Pedometer.watchStepCount( ({steps}) => userContext.metadata.setSteps(steps) );
            } else {
				console.log("Missing pedometer permissions");
			}

            // accelerometer interval
            DeviceMotion.setUpdateInterval(
                Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].deviceMotion
            );

            // verify that daily card is not null (create one if it is)
            if (userContext.cardSlots.daily == null) {
                const seed = generateDailySeed(); // create seed from Date obj
                userContext.cardSlots.daily = createBingoCard(userContext, DIFFICULTIES.NORMAL, seed);

                // focus daily card if no other card is focused
                if (userContext.selectedCard == null) userContext.selectedCard = "daily";
            }

            // send user back to signup if they manage to skip the signup screen
            if (userContext.stats.isNewUser) {
                props.navigation.navigate("Signup");
                console.log("Navigating to signup screen...");
            }

            setHasStarted(true);
        } )();
    });

    // initialize location reading (every time the screen is FOCUSED & has permissions)
    useFocusEffect(
        useCallback(
            () => {
                // prevent trying to listen before permissions granted
				if (!permsContext.hasRequestedPermissions) return () => {};

				// prevent trying to listen without permissions after requesting
				if (!permsContext.permissions.ACCESS_COARSE_LOCATION || !permsContext.permissions.ACCESS_FINE_LOCATION) {
					console.log("Missing location permissions");
					return () => {};
				}

                // initialize GPS polling
				const { delta, accuracy, minTimeElapsed } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

				let subscription;
                let getListener = async () => {
                    subscription = await Location.watchPositionAsync(
                        {accuracy: accuracy, distanceInterval: delta, timeInterval: minTimeElapsed},
                        (loc) => handleLocationData(loc, userContext)
                    );
                };
                
                getListener();

                // initialize card update interval & autosave interval
                handleAppTick(userContext); // initial all to load in immediately
                userContext.setCardUpdateInterval(
                    setInterval(
                        () => handleAppTick(userContext),
                        Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
                    )
                );

                // event emitters
                eventEmitter.removeAllListeners("remountHome"); // remove existing listeners
                eventEmitter.addListener("remountHome", () => { // add new listener
                    // console.log("remounting home");
                    remount();
                });

                const removeListeners = () => {
                    subscription.remove(); // remove GPS listener
                    userContext.clearCardUpdateInterval(); // remove card update interval
                };

                return () => { subscription && removeListeners() };
            }, [props, userContext.batterySaverStatus, permsContext.hasRequestedPermissions]
        )
    );
    
    // initialize devicemotion readings (every time the screen is FOCUSED)
    useFocusEffect(
        useCallback(() => {
			exportUserData(userContext); // save data everytime screen focuses

			// reset device accelerometer timestamp delta
			// reason: background would fade to green as if speed was really fast because timestamp recording would pause
			userContext.metadata.setAccelDelta(Date.now());
			
			let list = DeviceMotion.addListener(data => handleAccelerometerData(data, userContext));

			return () => list.remove();
		}, [props])
    );

    // button functions
    const openProfile = () => props.navigation.navigate("Profile");
    const openTasks = () => props.navigation.navigate("Tasks");
    const openRewards = () => props.navigation.navigate("Rewards");
    const openSettings = () => props.navigation.navigate("Settings");

	return (
        <GestureWrapper gestureDistance={50} angleThresh={25}
            onSwipeDown={openSettings} onSwipeLeft={openProfile} onSwipeRight={openRewards} onSwipeUp={openTasks}
        >
            <View style={styles.top}>
                <BackgroundGradient />
                {/* user profile modal instead of screen */}

                {/* background blur -- https://github.com/Kureev/react-native-blur */}
                {/* <BlurView blurAmount={3} blurType="light" style={[styles.absolute, {display: (isBlurred ? "flex" : "none")}]} /> */}

                <View style={styles.header}>
                    <Pressable onPress={openSettings}>
                        <Image style={styles.settingsIcon} source={SETTINGS_ICON} />
                    </Pressable>
                    <View style={styles.compassWrapper}>
                        <CompassWidget navigation={props.navigation} />
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
        </GestureWrapper>
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

import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";
import { View, StyleSheet, Pressable } from "react-native";

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
import { generateDailySeed, latLongDist, vh, vw } from "../config/Toolbox";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";

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
                Pedometer.watchStepCount(res => {
                    userContext.metadata.setSteps( res.steps )
                });
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
            }
            
            setHasStarted(true);
        } )();
    });

    // initialize location reading (every time the screen is FOCUSED & has permissions)
    useFocusEffect(
        useCallback(
            () => {
				if (!permsContext.hasRequestedPermissions) return () => {}; // prevent trying to listen before permissions granted

				// prevent trying to listen without permissions after requesting
				if (!permsContext.permissions.ACCESS_COARSE_LOCATION || !permsContext.permissions.ACCESS_FINE_LOCATION) {
					console.log("Missing location permissions");
					return () => {};
				}

				const { delta, accuracy, minTimeElapsed } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;
				const thresh = Settings.LOCATION_NOISE_THRESH;

				let subscription;
                let getListener = async () => {
                    subscription = await Location.watchPositionAsync({accuracy: accuracy, distanceInterval: delta, timeInterval: minTimeElapsed}, loc => {
                        // determine if new position is noisy
						if (loc.coords.accuracy > thresh) return; // console.log(loc.coords.accuracy);
						
						// if this is the first non-noisy reading, append it and stop further calculation
						let current = {lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy};
						let last = userContext.metadata.GPS.current; // this hasn't been updated, so treat the 'current' as last

						if (userContext.metadata.GPS.last.acc == -1) {
							userContext.metadata.GPS.updatePos(current);
							return;
						}

						// if there is a previous coordinate, then we have some math do to !
						let dist = latLongDist(last.lat, last.long, current.lat, current.long);

						// console.log("Delta: " + delta + "\t Distance: " + dist.toFixed(3) + "\t Acc: " + current.acc.toFixed(3));
						// console.warn("Delta: " + delta + "\t Distance: " + dist.toFixed(3) + "\t Acc: " + current.acc.toFixed(3));
						userContext.metadata.addDistance(dist);

						// overwrite last pos and set current
						userContext.metadata.GPS.updatePos(current);
                    });
                };
                
                getListener();

                // initialize card update interval & autosave interval
                userContext.setCardUpdateInterval(
                    setInterval(
                        function() {
                            // update timestamp
                            const {lastTimestamp, currentTimestamp} = userContext.setTimestamp( Date.now() ); // returns old & current
                            const lastDate = new Date(lastTimestamp), currentDate = new Date(currentTimestamp);

                            // verify that daily card is not null (create one if it is)
                            // OR the date has changed (create a new daily card based on this date)
                            if (userContext.cardSlots.daily == null || lastDate.getDate() !== currentDate.getDate()) {
                                const seed = generateDailySeed(); // create seed from Date obj
                                userContext.cardSlots.daily = createBingoCard(userContext, DIFFICULTIES.NORMAL, seed);
                            }

                            // check cards
                            for (let card of Object.values(userContext.cardSlots))
                                if (card) // if not null, run checks
                                    card.runCompletionChecks(userContext);

                            // for lazy developers ONLY
                            // userContext.metadata.addDistance(250);
                            // userContext.metadata.setSteps(userContext.metadata.steps + 1000);
                            // userContext.stats.addXP(86050);

                            // re-render card display
                            remount();

                            // export data
                            exportUserData(userContext);
                        }, Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
                    )
                );

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
			// unblur the screen
			// setBlurred(false);

			// save data everytime screen focuses
			exportUserData(userContext);

			// reset device accelerometer timestamp delta
			// reason: background would fade to green as if speed was really fast because timestamp recording would pause
			userContext.metadata.setAccelDelta(Date.now());
			
			let list = DeviceMotion.addListener(data => {
				if (data.acceleration == undefined || data.rotation == undefined) return;
				userContext.metadata.setAcceleration(data.acceleration);

				let { beta, gamma, alpha } = data.rotation; // beta -> x, gamma -> y, alpha -> z
				
				let accel = data.acceleration;
				let { accelDelta } = userContext.metadata;

				let delta = (Date.now() - accelDelta) / 1000;
				
				userContext.metadata.setAccelDelta(Date.now());
				
				// normalize local device coordinate axes to where device is flat and facing north
				let cg = Math.cos(gamma), ca = Math.cos(alpha), cb = Math.cos(beta); // to optimize calculations a bit
				let sg = Math.sin(gamma), sa = Math.sin(alpha), sb = Math.sin(beta); // to optimize calculations a bit
				
				let R = [
					[cg*sa, sb*sg*sa+cb*ca, cb*sg*sa-sb*ca],
					[cg*ca, sb*sg*ca-cb*sa, cb*sg*ca+sb*sa],
					[-sg, sb*cg, cb*cg]
				];

				// multiply matrices
				let M = [accel.x, accel.y, accel.z];
				let res = {
					x: R[0][0]*M[0] + R[0][1]*M[1] + R[0][2]*M[2],
					y: R[1][0]*M[0] + R[1][1]*M[1] + R[1][2]*M[2],
					z: R[2][0]*M[0] + R[2][1]*M[1] + R[2][2]*M[2]
				};

				// with this normalized acceleration, calculate velocity
				const format = n => Math.sign(n) * Math.floor( Math.abs(n) * 40 ) / 40; // round off a bit
				const damper = delta * 0.6; // the velocity tends to get too high and not fall -- this aims to fix that

				let current = userContext.metadata.velocity;
				let vel = {
					x: format(current.x*damper + res.x*delta),
					y: format(current.y*damper + res.y*delta),
					z: format(current.z*damper + res.z*delta)
				};
				
				userContext.metadata.setVelocity(vel);
			});
			return () => list.remove();
		}, [props])
    );

    // button functions
    const leftBtn = () => props.navigation.navigate("Profile");
    const centerBtn = () => props.navigation.navigate("Tasks");
    const rightBtn = () => props.navigation.navigate("Rewards");
    const openSettings = () => props.navigation.navigate("Settings");

	return (
        <GestureWrapper gestureDistance={50} angleThresh={25}
            onSwipeDown={openSettings} onSwipeLeft={leftBtn} onSwipeRight={rightBtn} onSwipeUp={centerBtn}
        >
            <View style={styles.top}>
                <BackgroundGradient />
                {/* user profile modal instead of screen */}

                {/* background blur -- https://github.com/Kureev/react-native-blur */}
                {/* <BlurView blurAmount={3} blurType="light" style={[styles.absolute, {display: (isBlurred ? "flex" : "none")}]} /> */}

                <View style={styles.header}>
                    <Pressable onPress={openSettings}>
                        <View style={styles.settingsIcon} />
                    </Pressable>
                    <View style={styles.compassWrapper}>
                        <CompassWidget navigation={props.navigation} />
                    </View>
                </View>

                <View style={styles.body}>
                    <CardDisplayGrid remountStatus={__remountStatus} />
                </View>

                <View style={styles.bottomButtons}>
                    <HomeScreenButton type="left" flex={.75} onPress={leftBtn} />
                    <HomeScreenButton type="center" flex={1} onPress={centerBtn} />
                    <HomeScreenButton type="right" flex={.75} onPress={rightBtn} />
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
        flex: 1
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
        height: "100%",
        aspectRatio: 1,
        backgroundColor: "red"
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

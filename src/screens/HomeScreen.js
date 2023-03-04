import React, { useState, useContext, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity, Animated } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer, DeviceMotion } from "expo-sensors";
import * as Location from "expo-location";

// components & modals
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";
import CardDisplayGrid from "../components/CardDisplayGrid";
import ProfileScreenModal from "./ProfileScreenModal";

import { Settings, SettingsContext, Themes } from "../config/Config";
import { exportUserData, UserDataContext } from "../config/UserDataManager";
import { latLongDist, vh, vw } from "../config/Toolbox";
import { BlurView } from "@react-native-community/blur";
import BackgroundGradient from "../components/BackgroundGradient";

const HomeScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const settingsContext = useContext( SettingsContext );
    const THEME = Themes[ userContext.selectedTheme ].home; // select theme

    // profile modal visibility
    const [isProfileVisible, setProfileVisibility] = useState(false);
    const closeProfileModal = () => setProfileVisibility(false);
    
    const [hasStarted, setHasStarted] = useState(false);

    // initial, on-load events (empty triggers array to act as componentDidMount)
    useEffect(() => {
        ( async () => {
            if (hasStarted) return;

            // request permissions
            let perms = await settingsContext.requestPermissions();

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
            
            setHasStarted(true);
        } )();
    });

    // handle updates to the coordinates of the player's device
    useEffect(
        () => {
            let { last, current } = userContext.metadata.GPS;
            if (last.acc != -1 && last.lat != current.lat && last.long != current.long) { // we have data!
                let dist = latLongDist(last.lat, last.long, current.lat, current.long);

                // let speed = userContext.metadata.getSpeed();
                // if (speed > 1) // if moving at least 1 m/s, append displacement

				let { delta } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

				// console.log("Delta: " + delta + "\t" + "Distance: " + dist);
				if (dist > delta)
                    userContext.metadata.addDistance(dist);
            }

            userContext.metadata.GPS.setLast(current);
        }, [userContext.metadata.GPS.current]
    );

    // initialize location reading (every time the screen is FOCUSED & has permissions)
    useFocusEffect(
        useCallback(
            () => {
				if (!settingsContext.hasRequestedPermissions) return () => {}; // prevent trying to listen before permissions granted

				// prevent trying to listen without permissions after requesting
				if (!settingsContext.permissions.ACCESS_COARSE_LOCATION || !settingsContext.permissions.ACCESS_FINE_LOCATION) {
					console.log("Missing location permissions");
					return () => {};
				}

				const { delta, accuracy } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

				let subscription;
                let getListener = async () => {
                    subscription = await Location.watchPositionAsync({accuracy: accuracy, distanceInterval: delta}, loc => {
						// console.log(loc);
                        userContext.metadata.GPS.setCurrent(
                            {lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy}
                        );
                    });
                };
                
                getListener();

                // initialize card update interval & autosave interval
                userContext.setCardUpdateInterval(
                    setInterval(
                        function() {
                            // check cards
                            userContext.cardSlots.daily  ?.runCompletionChecks(userContext);
                            userContext.cardSlots.custom1?.runCompletionChecks(userContext);
                            userContext.cardSlots.custom2?.runCompletionChecks(userContext);
                            
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
            }, [props, userContext.batterySaverStatus, settingsContext.hasRequestedPermissions]
        )
    );

    // initialize devicemotion readings (every time the screen is FOCUSED)
    useFocusEffect(
        useCallback(
            () => {
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
            }, [props]
        )
    );

    // button functions
    const leftBtn = () => setProfileVisibility(!isProfileVisible);
    const centerBtn = () => props.navigation.navigate("Tasks");
    const rightBtn = () => props.navigation.navigate("Settings");

	return (
		<View style={styles.top}>
            <BackgroundGradient />
            {/* user profile modal instead of screen */}

            <ProfileScreenModal isModalVisible={isProfileVisible} close={closeProfileModal} />
            {/* background blur -- https://github.com/Kureev/react-native-blur */}
            <BlurView blurAmount={3} blurType="light" style={[styles.absolute, {display: (isProfileVisible ? "flex" : "none")}]} />

            {/* ------------------ */}

			<View style={styles.header}>
                <View style={styles.compassWrapper}>
                    <CompassWidget navigation={props.navigation} />
                </View>
            </View>

            <View style={styles.body}>
                <CardDisplayGrid />
            </View>

            {/* <Text>Steps: {userContext.metadata.steps}</Text>
            <Text>Lifetime Steps: {userContext.metadata.lifetimeSteps}</Text>
            <Text>Speed: {userContext.metadata.getSpeed().toFixed(3)} m/s</Text>
            <Text>Traveled: {userContext.metadata.distance.toFixed(3)} m</Text>
            <Text>Lifetime Traveled: {userContext.metadata.lifetimeDistance.toFixed(3)} m</Text> */}

            <View style={styles.bottomButtons}>
                <HomeScreenButton flex={.75} onPress={leftBtn} />
                <HomeScreenButton flex={1} onPress={centerBtn} />
                <HomeScreenButton flex={.75} onPress={rightBtn} />
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
        flex: 1
    },
    header: {
        flex: 0.1,
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    compassWrapper: {
        height: "100%",
        aspectRatio: 1,
        marginRight: "2.5%"
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

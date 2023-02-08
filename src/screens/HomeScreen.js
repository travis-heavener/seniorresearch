import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer, DeviceMotion, Accelerometer } from "expo-sensors";
import * as Location from "expo-location";

import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

import { Settings, SettingsContext, Themes } from "../Config";
import { calculateGradient } from "../GradientManager";

import { exportUserData, loadUserData, UserDataContext } from "../UserDataManager";

const HomeScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].home; // select theme

    // background color
    const [backgroundCol, setBackgroundCol] = useState(styles.top.backgroundColor);
    const backgroundColRef = React.useRef();
    backgroundColRef.current = backgroundCol;

    const [backgroundDelta, setBackgroundDelta] = useState(Date.now());
    const backgroundDeltaRef = React.useRef();
    backgroundDeltaRef.current = backgroundDelta;

    const [hasStarted, setHasStarted] = useState(false);
    const context = useContext( SettingsContext );

    // initial, on-load events (empty triggers array to act as componentDidMount)
    useEffect(() => {
        ( async () => {
            if (hasStarted) return;

            let perms = await context.requestPermissions();

            // start pedometer
            if (perms.ACTIVITY_RECOGNITION) {
                Pedometer.watchStepCount(res => {
                    userContext.metadata.setSteps( res.steps )
                });
            } else {
				console.log("Missing pedometer permissions");
			}
            
            // start location tracking
			// let locPerms = {status: perms.ACCESS_FINE_LOCATION || perms.ACCESS_COARSE_LOCATION};

            // if (locPerms.status == "granted") {
            //     const { delta, accuracy } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

            //     Location.watchPositionAsync({accuracy: accuracy, distanceInterval: delta}, loc => {
            //         userContext.metadata.GPS.setCurrent(
            //             {lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy}
            //         );
            //     });
            // } else {
			// 	console.log("Missing location permissions");
			// }

            // accelerometer interval
            DeviceMotion.setUpdateInterval(
                Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].deviceMotion
            );

            // load user data
            loadUserData(userContext);
            
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

				// console.log("Acc/2: " + current.acc / 2 + "\nDistance: " + dist);
				if (current.acc / 2 <= 1000*dist)
                    userContext.metadata.addDistance(dist);
            }

            userContext.metadata.GPS.setLast(current);
        }, [userContext.metadata.GPS.current]
    );

    // initialize location reading (every time the screen is FOCUSED)
    useFocusEffect(
        useCallback(
            () => {
				if (!context.hasRequestedPermissions) return () => {}; // prevent trying to listen before permissions granted

				// prevent trying to listen without permissions after requesting
				if (!context.permissions.ACCESS_COARSE_LOCATION || !context.permissions.ACCESS_FINE_LOCATION) {
					console.log("Missing location permissions");
					return () => {};
				}

				const { delta, accuracy } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

				let subscription;
                let getListener = async () => {
                    subscription = await Location.watchPositionAsync({accuracy: accuracy, distanceInterval: delta}, loc => {
                        userContext.metadata.GPS.setCurrent(
                            {lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy}
                        );
                    });
                };
                
                getListener();

                return () => { subscription && subscription.remove() };
            }, [props, userContext.batterySaverStatus, context.hasRequestedPermissions]
        )
    );

    // initialize devicemotion readings (every time the screen is FOCUSED)
    useFocusEffect(
        useCallback(
            () => {
                // reset device accelerometer timestamp delta
                // reason: background would fade to green as if speed was really fast because timestamp recording would pause
                userContext.metadata.setAccelDelta(Date.now());
                
                let list = DeviceMotion.addListener(data => {
                    if (data.acceleration == undefined || data.rotation == undefined) return;
                    userContext.metadata.setAcceleration(data.acceleration);

                    let {beta, gamma, alpha} = data.rotation; // beta -> x, gamma -> y, alpha -> z
                    
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
                    let speed = Math.hypot(vel.x, vel.y, vel.z);

                    // ----- background color gradient shifting -----

                    let timeDelta = 500; // 500 ms between refreshes
                    if (Date.now() - backgroundDeltaRef.current < timeDelta) return;
                    setBackgroundDelta(Date.now());

                    // calculate gradient
                    let maxTime = timeDelta / 4, frames = 16, interval = maxTime / frames;

                    let shiftGrad = calculateGradient(
                        backgroundColRef.current, THEME.backgrounds.stopped, THEME.backgrounds.fast, speed, frames
                    );

                    // set timeouts
                    shiftGrad.forEach( (col, i) => {
                        setTimeout(function() {
                            setBackgroundCol( col.toString() );
                        }, i * interval);
                    });
                });
                return () => list.remove();
            }, [props]
        )
    );

    // button functions
    const leftBtn = () => props.navigation.navigate("Profile");
    const centerBtn = () => props.navigation.navigate("Tasks");
    const rightBtn = () => props.navigation.navigate("Settings");

	return (
		<View style={[styles.top, {backgroundColor: backgroundCol}]}>
			<View style={styles.body}>
                <View style={styles.compassWrapper}>
                    <CompassWidget />
                </View>
            </View>

            <Text>Steps: {userContext.metadata.steps}</Text>
            <Text>Lifetime Steps: {userContext.metadata.lifetimeSteps}</Text>
            <Text>Speed: {userContext.metadata.getSpeed().toFixed(3)} m/s</Text>
            <Text>Traveled: {userContext.metadata.distance.toFixed(3)} m</Text>
            <Text>Lifetime Traveled: {userContext.metadata.lifetimeDistance.toFixed(3)} m</Text>

            <View style={styles.bottomButtons}>
                <HomeScreenButton flex={.75} onPress={leftBtn} />
                <HomeScreenButton flex={1} onPress={centerBtn} />
                <HomeScreenButton flex={.75} onPress={rightBtn} />
            </View>
		</View>
	);
};

const latLongDist = (lat1, lon1, lat2, lon2) => {  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}

const styles = StyleSheet.create({
    top: {
        flex: 1,
        backgroundColor: "rgb(252, 170, 167)"
    },
    body: {
        flex: .85,
        flexDirection: "column"
    },
    stepsReadout: {

    },
    compassWrapper: {
        flex: .12,
        alignItems: "flex-end"
    },
    bottomButtons: {
        flex: .15,
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center"
    }
});

export default HomeScreen;

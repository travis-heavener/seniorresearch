import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer, DeviceMotion, Accelerometer } from "expo-sensors";
import * as Location from "expo-location";

import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

import { Settings, Context, Themes } from "../Config";
import { calculateGradient } from "../GradientManager";

// select theme
const THEME = Themes[ Settings.theme ].home;

const HomeScreen = (props) => {
    const [steps, setSteps] = useState(0); // pedometer

    // distance tracker
    const [distance, setDistance] = useState(0); // distance, in meters (1609.344 meters in 1 mile)
    const [lastCoords, setLastCoords] = useState({lat: null, long: null, acc: -1});
    const [coords, setCoords] = useState({lat: null, long: null, acc: -1});
    
    // accelerometer
    const [accel, setAccel] = useState({x: 0, y: 0, z: 0}); // default
    DeviceMotion.setUpdateInterval( (Settings.useBatterySaver ? 100 : 40) );

    // velocity
    const [velocity, setVelocity] = useState({x: 0, y: 0, z: 0});
    const velocityRef = React.useRef();
    velocityRef.current = velocity;

    // background color
    const [backgroundCol, setBackgroundCol] = useState(styles.top.backgroundColor);
    const backgroundColRef = React.useRef();
    backgroundColRef.current = backgroundCol;

    const [backgroundDelta, setBackgroundDelta] = useState(Date.now());
    const backgroundDeltaRef = React.useRef();
    backgroundDeltaRef.current = backgroundDelta;

    const [accelDelta, setAccelDelta] = useState(Date.now());
    const accelDeltaRef = React.useRef();
    accelDeltaRef.current = accelDelta;

    const [hasStarted, setHasStarted] = useState(false);
    const context = useContext( Context );

    // initial, on-load events (empty triggers array to act as componentDidMount)
    useEffect(() => {
        ( async () => {
            if (hasStarted) return;

            let perms = await context.requestPermissions();

            // start pedometer
            if (perms.ACTIVITY_RECOGNITION)
                Pedometer.watchStepCount(res => setSteps(res.steps));
            
            // start location tracking
            if (perms.ACCESS_FINE_LOCATION && perms.ACCESS_COARSE_LOCATION) {
                let acc = Settings.useBatterySaver ? Location.Accuracy.Low : Location.Accuracy.Highest;
                let delta = Settings.useBatterySaver ? 2 : 1;

                Location.watchPositionAsync({accuracy: acc, distanceInterval: delta}, loc => {
                    setCoords({lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy});
                });
            }

            setHasStarted(true);
        } )();
    });

    // handle updates to the coordinates of the player's device
    useEffect(
        () => {
            if (lastCoords.acc != -1 && lastCoords.lat != coords.lat && lastCoords.long != coords.long) { // we have data!
                let dist = latLongDist(lastCoords.lat, lastCoords.long, coords.lat, coords.long);
                
                let delta = Math.hypot(accel.x, accel.y, accel.z);
                if (delta > 0.15) // if device is modestly accelerating, append displacement
                    setDistance(distance + dist);
            }

            setLastCoords(coords);
        }, [coords]
    );

    // initialize devicemotion readings
    useFocusEffect(
        useCallback(
            () => {
                let list = DeviceMotion.addListener(data => {
                    if (data.acceleration == undefined || data.rotation == undefined) return;
                    setAccel(data.acceleration);

                    let {beta, gamma, alpha} = data.rotation; // beta -> x, gamma -> y, alpha -> z
                    
                    let accel = data.acceleration;
                    let delta = (Date.now() - accelDeltaRef.current) / 1000;

                    setAccelDelta(Date.now());
                    
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
                    const damper = 0.95; // the velocity tends to get too high and not fall -- this aims to fix that

                    let vel = {
                        x: format(velocityRef.current.x*damper + res.x*delta),
                        y: format(velocityRef.current.y*damper + res.y*delta),
                        z: format(velocityRef.current.z*damper + res.z*delta)
                    };

                    setVelocity(vel);
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
    const centerBtn = () => console.log("Tasks Menu");
    const rightBtn = () => props.navigation.navigate("Settings");

	return (
		<View style={[styles.top, {backgroundColor: backgroundCol}]}>
			<View style={styles.body}>
                <View style={styles.compassWrapper}>
                    <CompassWidget />
                </View>
            </View>

            <Text>Steps: {steps}</Text>
            <Text>Traveled: {distance.toFixed(3)} m</Text>
            {/* <Text>Vel.X: {Math.round(velocity.x * 10000) / 10000} m/s</Text>
            <Text>Vel.Y: {Math.round(velocity.y * 10000) / 10000} m/s</Text>
            <Text>Vel.Z: {Math.round(velocity.z * 10000) / 10000} m/s</Text> */}
            <Text>Speed: {Math.hypot(velocity.x, velocity.y, velocity.z)} m/s</Text>
            <Text>Speed: {Math.hypot(velocity.x, velocity.y, velocity.z) * 2.237} mph</Text>

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

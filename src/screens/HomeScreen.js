import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer, DeviceMotion } from "expo-sensors";
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

import * as Location from "expo-location";

import { Settings, Context, Themes } from "../Config";

// select theme
const THEME = Themes[ Settings.theme ].home;

const HomeScreen = (props) => {
    // pedometer
	const [steps, setSteps] = useState(0); // steps
    const [stepTime, setStepTime] = useState(Date.now());

    // distance tracker
    const [distance, setDistance] = useState(0); // distance, in meters (1609.344 meters in 1 mile)
    const [lastCoords, setLastCoords] = useState({lat: null, long: null, acc: -1});
    const [coords, setCoords] = useState({lat: null, long: null, acc: -1});
    
    // accelerometer
    const [accel, setAccel] = useState({x: 0, y: 0, z: -1}); // default
    DeviceMotion.setUpdateInterval(Settings.useBatterySaver ? 100 : 20);

    // background color
    const [backgroundCol, setBackgroundCol] = useState(styles.top.backgroundColor);

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

                // let avgAcc = (lastCoords.acc + coords.acc) / 2;
                // console.log("Displacement: " + dist + " m\tAccuracy: " + avgAcc + " m ");

                let delta = Math.hypot(accel.x, accel.y, accel.z);
                if (delta > 0.15) // device is modestly accelerating
                    setDistance(distance + dist);
            }

            setLastCoords(coords);
        }, [coords]
    );

    // initialize accelerometer readings
    useFocusEffect(
        useCallback(
            () => {
                let list = DeviceMotion.addListener(data => {
                    setAccel(data.acceleration);
                    // console.log("X: " + data.acceleration.x.toFixed(3) +
                    //     "\tY: " + data.acceleration.y.toFixed(3) +
                    //     "\tZ: " + data.acceleration.z.toFixed(3)
                    // );

                    let accel = data.acceleration;
                    let speed = Math.hypot(accel.x, accel.y, accel.z);
                    console.log(speed);
                    
                    // change background color
                    let col = THEME.backgrounds.stopped;

                    if (speed >= 4) col = THEME.backgrounds.slow;
                    if (speed >= 8) col = THEME.backgrounds.med;
                    if (speed >= 12) col = THEME.backgrounds.fast;

                    if (speed > 0)
                        setBackgroundCol(col);
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
        backgroundColor: "#fc9490"
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

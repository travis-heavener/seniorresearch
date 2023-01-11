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

    // distance tracker
    const [distance, setDistance] = useState(0); // distance, in meters (1609.344 meters in 1 mile)
    const [lastCoords, setLastCoords] = useState({lat: null, long: null, acc: -1});
    const [coords, setCoords] = useState({lat: null, long: null, acc: -1});
    
    // accelerometer
    const [accel, setAccel] = useState({x: 0, y: 0, z: -1}); // default
    DeviceMotion.setUpdateInterval(Settings.useBatterySaver ? 100 : 20);

    // background color
    const [backgroundCol, setBackgroundCol] = useState(styles.top.backgroundColor);
    const backgroundColRef = React.useRef();
    backgroundColRef.current = backgroundCol;

    const [backgroundDelta, setBackgroundDelta] = useState(Date.now());
    const backgroundDeltaRef = React.useRef();
    backgroundDeltaRef.current = backgroundDelta;

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
                if (delta > 0.15) // if device is modestly accelerating, append displacement
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
                    if (data.acceleration == undefined) return;
                    setAccel(data.acceleration);
                    
                    let accel = data.acceleration;
                    let speed = Math.hypot(accel.x, accel.y, accel.z);
                    
                    let timeDelta = 500; // 500 ms between refreshes
                    if (Date.now() - backgroundDeltaRef.current < timeDelta) return;
                    setBackgroundDelta(Date.now());

                    // creates an array of colors where 0 is pure start color and length-1 is pure end color
                    const createGradient = (startCol, endCol, steps) => {
                        let arr = [];
                        for (let i = 0; i < steps; i++)
                            arr.push({
                                r: Math.floor( (endCol.r - startCol.r) * i / (steps-1) + startCol.r ),
                                g: Math.floor( (endCol.g - startCol.g) * i / (steps-1) + startCol.g ),
                                b: Math.floor( (endCol.b - startCol.b) * i / (steps-1) + startCol.b )
                            });
                        return arr;
                    };

                    const breakRGB = str => {
                        // remove non-numeric characters
                        let split = str.split(",").map((item) => {
                            let comp = "";
                            item.split("").forEach(char => {
                                let code = char.charCodeAt(0);
                                if (code >= 48 && code <= 57) comp += char;
                            });
                            return parseInt(comp);
                        });
                        return {r: split[0], g: split[1], b: split[2]};
                    };

                    // what the color currently is
                    let current = breakRGB( backgroundColRef.current );
                    
                    // determine how fast device is compared to max speed
                    let maxSpeed = 12, stepCount = 100;
                    
                    let step = Math.floor(Math.min(speed, maxSpeed) / maxSpeed * 100);
                    step = Math.max(Math.min(step, stepCount-1), 0); // clamp step count
                    
                    // create gradient
                    let start = breakRGB( THEME.backgrounds.stopped );
                    let end = breakRGB( THEME.backgrounds.fast );

                    let initialGrad = createGradient(start, end, stepCount); // start-to-end color gradient
                    let target = initialGrad[step]; // target color

                    // skip making loops if the color doesn't need to change
                    if (current.r == target.r && current.g == target.g && current.b == target.b) return;

                    // set timeouts
                    let maxTime = timeDelta / 4, frames = 16, interval = maxTime / frames;
                    let shiftGrad = createGradient(current, target, frames);
                    
                    for (let i = 0; i < frames; i++) {
                        setTimeout(function() {
                            // update background color here
                            let col = shiftGrad[i];
                            setBackgroundCol( "rgb(" + col.r + "," + col.g + "," + col.b + ")" );
                        }, i * interval);
                    }
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

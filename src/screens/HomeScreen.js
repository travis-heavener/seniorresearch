import React, { useState, useContext, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer } from "expo-sensors";
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

import * as Location from "expo-location";

import { Settings, Context } from "../Config";

const HomeScreen = (props) => {
	const [steps, setSteps] = useState(0); // steps
    const [distance, setDistance] = useState(0); // distance, in meters

    const [lastCoords, setLastCoords] = useState({lat: null, long: null, acc: -1});
    const [coords, setCoords] = useState({lat: null, long: null, acc: -1});
    
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
                Location.watchPositionAsync({accuracy: acc, distanceInterval: 0.5}, loc => {
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

                let avgAcc = (lastCoords.acc + coords.acc) / 2;
                console.log("Displacement: " + dist + " m\tAccuracy: " + avgAcc + " m ");

                setDistance(distance + dist);
            }

            setLastCoords(coords);
        }, [coords]
    );

    // button functions
    const leftBtn = () => props.navigation.navigate("Profile");
    const centerBtn = () => console.log("Tasks Menu");
    const rightBtn = () => props.navigation.navigate("Settings");

	return (
		<View style={styles.top}>
			<View style={styles.body}>
                <View style={styles.compassWrapper}>
                    <CompassWidget />
                </View>
            </View>

            <Text>Steps: {steps}</Text>
            <Text>Traveled: {distance} m</Text>

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
        backgroundColor: "#ffd4d4"
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

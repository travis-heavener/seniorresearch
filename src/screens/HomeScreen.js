import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

import * as Location from "expo-location";

const HomeScreen = (props) => {
	const [location, setLocation] = useState({coords: {latitude: 0, longitude: 0}});
    const [perms, setPerms] = useState(false);
    const [distance, setDistance] = useState(0);

    const requestPermissions = async () => {
        let req = await Location.requestForegroundPermissionsAsync();

        if (req.status !== "granted") {
            console.warn("Err: Location permissions missing.");
        } else {
            console.warn("Location permissions granted.");
            setPerms(true);
        }
    };

    const get = async () => {
        if (!perms) {
            console.warn("Err: Location permissions missing.");
            return;
        }
        let start = Date.now();
        let startPos = {lat: location.coords.latitude, long: location.coords.longitude};

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        // log elapsed time
        console.warn("Elapsed: " + (loc.timestamp - start)/1000 + "s");

        let dist = measure( startPos.lat, startPos.long, loc.coords.latitude, loc.coords.longitude ).toFixed(8);
        setDistance( dist );
    };

    const measure = (lat1, lon1, lat2, lon2) => {  // generally used geo measurement function
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

    Location.watchPositionAsync({accuracy: Location.Accuracy.High, distanceInterval: 0.25}, async (loc) => {
        //console.log(loc);
        let startPos = {lat: location.coords.latitude, long: location.coords.longitude};
        
        let dist = measure( startPos.lat, startPos.long, loc.coords.latitude, loc.coords.longitude ).toFixed(8);
        console.log( dist );
        setLocation( loc );
    });

	return (
		<View>
			<Text>Lat: {location.coords.latitude + "\n"}Long: {location.coords.longitude}</Text>
            <Text>Distance Traversed (m): {distance}</Text>
            <TouchableOpacity onPress={requestPermissions}>
                <Text>Request Permissions</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={get}>
                <Text>Get Location!</Text>
            </TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({});

export default HomeScreen;

import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Pedometer } from 'expo-sensors';

import { PermissionsAndroid } from 'react-native';

const HomeScreen = (props) => {
    const epoch = new Date();
    const [ped, setPed] = useState(0);
    
    // check if pedometer features are enabled
    (async () => console.log("Pedometer Enabled: " + await Pedometer.isAvailableAsync()))();

	let request = async () => {
		try {
            // const res = await Pedometer.requestPermissionsAsync();
            let res = await PermissionsAndroid.check( PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION );
            
            if (res != PermissionsAndroid.RESULTS.GRANTED) {
                console.warn("No permissions granted yet; requesting ACTIVITY_RECOGNITION...");
                res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
                    title: "Cool Photo App Camera ACTIVITY_RECOGNITION",
                    message: "Cool Photo App needs access to your camera so you can take awesome pictures.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                });
            }

			console.log("Result? " + res);
		} catch (e) {
			console.warn(e);
		}
      };

	const updateSteps = result => {
        setPed(result.steps);
        console.log("updated steps function");
    };

    useEffect( () => {
        Pedometer.watchStepCount(updateSteps);
		// console.log(Pedometer.watchStepCount(updateSteps));
        console.log("useEffect caught");
    });

    const getSteps = () => {
        console.log(ped);
        updateSteps({steps: 0});
    };
    
    return (
        <View>
            <Text>Steps: {ped}</Text>
            <TouchableOpacity onPress={getSteps}>
                <Text>Update steps</Text>
            </TouchableOpacity>
			<TouchableOpacity onPress={request}>
                <Text>Request Permissions</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({

});

export default HomeScreen;
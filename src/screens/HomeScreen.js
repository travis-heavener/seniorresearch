import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer } from "expo-sensors";
import { PermissionsAndroid } from 'react-native';

const HomeScreen = (props) => {
	const [steps, setSteps] = useState(0);
    
    let requestPerms = async () => {
        let hasPerms = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);
        console.log("Has ACTIVITY_RECOGNITION perms? " + hasPerms);

        if (!hasPerms)
            hasPerms = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION);

        return hasPerms;
    };

	const start = async () => {
        let hasPerms = await requestPerms();

		Pedometer.watchStepCount(res => setSteps(res.steps));
	};

	return (
		<View>
			<Text>Steps: {steps}</Text>
			<TouchableOpacity onPress={start}>
				<Text>Start Recording</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
    
});

export default HomeScreen;

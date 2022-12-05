import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer } from "expo-sensors";
import { PermissionsAndroid } from 'react-native';
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

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

    // button functions
    const leftBtn = () => console.log("Profile");
    const centerBtn = () => console.log("Tasks Menu");
    const rightBtn = () => console.log("Settings");

	return (
		<View style={styles.top}>
			<View style={styles.body}>
                <View style={styles.compassWrapper}>
                    <CompassWidget />
                </View>

                <View style={{flex: .9}}>
                    <Text>Steps: {steps}</Text>
                    <TouchableOpacity onPress={start}>
                        <Text>Start Recording</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomButtons}>
                <HomeScreenButton flex={.75} onPress={leftBtn} />
                <HomeScreenButton flex={1} onPress={centerBtn} />
                <HomeScreenButton flex={.75} onPress={rightBtn} />
            </View>
		</View>
	);
};

const styles = StyleSheet.create({
    top: {
        flex: 1,
        backgroundColor: "#ffd4d4"
    },
    body: {
        flex: .85,
        flexDirection: "column"
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

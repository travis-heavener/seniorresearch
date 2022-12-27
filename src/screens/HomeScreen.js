import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

// Pedometer + necessary Android permissions imports
import { Pedometer } from "expo-sensors";
import HomeScreenButton from "../components/HomeScreenButton";
import CompassWidget from "../components/CompassWidget";

import { Settings, Context } from "../Config";

const HomeScreen = (props) => {
	const [steps, setSteps] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const context = useContext( Context );

	const start = async () => {
        if (hasStarted) return;

        let perms = await context.requestPermissions();

        if (perms.ACTIVITY_RECOGNITION)
            Pedometer.watchStepCount(res => setSteps(res.steps));
        
        setHasStarted(true);
	};

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

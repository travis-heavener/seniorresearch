import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Pedometer } from 'expo-sensors';

const HomeScreen = (props) => {
    const epoch = new Date();
    const [ped, setPed] = useState(0);
    
    // check if pedometer features are enabled
    (async () => console.log(await Pedometer.isAvailableAsync()))();

    const updateSteps = result => {
        setPed(result.steps);
        console.log("updated");
    };

    useEffect( () => {
        Pedometer.watchStepCount(updateSteps);
        console.log("effected");
    }, [updateSteps]);

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
        </View>
    );
};

const styles = StyleSheet.create({

});

export default HomeScreen;
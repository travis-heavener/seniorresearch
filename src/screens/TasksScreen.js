import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";

import { Themes, Settings } from "../Config";
import { UserDataContext } from "../SessionUserData";

import TasksScreenCard from "../components/TasksScreenCard";

import { createBingoCard, DIFFICULTIES } from "../BingoCardManager";

const TasksScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

    let card = createBingoCard(DIFFICULTIES.HARD, userContext);
    userContext.cardSlots.daily = card;
    
    // set update interval on screen load
    useEffect(
        () => {
            userContext.clearCardUpdateInterval();

            let interval = setInterval(
                function() {
                    userContext.cardSlots.daily  ?.runCompletionChecks(userContext);
                    userContext.cardSlots.custom1?.runCompletionChecks(userContext);
                    userContext.cardSlots.custom2?.runCompletionChecks(userContext);
                }, Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
            );

            userContext.setCardUpdateInterval(interval);
        }
    );

    return (
		<View style={styles.body}>
			<Text>Tasks Screen</Text>
            <TasksScreenCard></TasksScreenCard>
            <TasksScreenCard></TasksScreenCard>
            <TasksScreenCard></TasksScreenCard>
		</View>
	);
};

const styles = StyleSheet.create({
    body: {
        
    }
});

export default TasksScreen;
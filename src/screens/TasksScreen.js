import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Text } from "react-native";

import { Themes, Settings } from "../config/Config";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

import TasksScreenCard from "../components/TasksScreenCard";

import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";

const TasksScreen = (props) => {
    const userContext = useContext( UserDataContext );
    
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    
    const [__remountStatus, __setRemountStatus] = useState(false);
    const forceRemount = () => __setRemountStatus(!__remountStatus);

    // set update interval on screen load
    useEffect(
        () => {
            userContext.clearCardUpdateInterval();

            let interval = setInterval(
                function() {
                    userContext.cardSlots.daily  ?.runCompletionChecks(userContext);
                    userContext.cardSlots.custom1?.runCompletionChecks(userContext);
                    userContext.cardSlots.custom2?.runCompletionChecks(userContext);

                    // export data
                    exportUserData(userContext);
                }, Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
            );

            userContext.setCardUpdateInterval(interval);
        }
    );

    return (
		<View style={styles.body}>
			<Text>Tasks Screen</Text>
            <TasksScreenCard remount={forceRemount} cardName="daily" />
            <TasksScreenCard remount={forceRemount} cardName="custom1" />
            <TasksScreenCard remount={forceRemount} cardName="custom2" />
		</View>
	);
};

const styles = StyleSheet.create({
    body: {

    }
});

export default TasksScreen;
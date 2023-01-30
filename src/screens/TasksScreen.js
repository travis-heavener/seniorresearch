import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";

import { Themes } from "../Config";
import { UserDataContext } from "../SessionUserData";

const TasksScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

    return (
		<View>
			<Text>Tasks Screen</Text>
		</View>
	);
};

const styles = StyleSheet.create({
    
});

export default TasksScreen;
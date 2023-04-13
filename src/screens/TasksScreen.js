import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";

import { Themes } from "../config/Themes";
import { UserDataContext } from "../config/UserDataManager";

import TasksScreenCard from "../components/TasksScreenCard";

import { FlatList } from "react-native-gesture-handler";
import { vw, vh } from "../config/Toolbox";

const TasksScreen = (props) => {
    const userContext = useContext( UserDataContext );
    
    const THEME = Themes[ userContext.selectedTheme ].tasks; // select theme
    
    const [__remountStatus, __setRemountStatus] = useState(false);
    const forceRemount = () => __setRemountStatus(!__remountStatus);

    const [focusedCard, setFocusedCard] = useState(null);
    
    return (
		<View style={[styles.body, {backgroundColor: THEME.primaryAccent}]}>
            <View style={[styles.header, {backgroundColor: THEME.secondary, borderColor: THEME.secondaryAccent}]}>
                <Text style={[styles.headerText, {color: THEME.text}]}>Active Cards</Text>
            </View>
            <FlatList
                data={Object.keys(userContext.cardSlots)}
                renderItem={
                    ({item}) => <TasksScreenCard focusedCard={focusedCard} setFocusedCard={n => setFocusedCard(n)} remount={forceRemount} cardName={item} />
                }
            />
                {/* <TasksScreenCard remount={forceRemount} cardName="daily" />
                <TasksScreenCard remount={forceRemount} cardName="custom1" />
                <TasksScreenCard remount={forceRemount} cardName="custom2" /> */}
		</View>
	);
};

const styles = StyleSheet.create({
    body: {
        width: vw(100),
		height: vh(80), // 7.5 from the header, 8 + 8 for two unfocused cards & 50 from a focused card (without counting borders)
		position: "absolute",
		bottom: 0
    },
    header: {
        width: vw(100),
        height: vh(7.5),
        justifyContent: "center",
        borderTopWidth: vh(0.33),
        borderBottomWidth: vh(0.33)
    },
    headerText: {
        textAlign: "center",
        fontSize: vh(3), // shrinks to fit anyways
        fontWeight: "bold",
        marginVertical: vh(1)
    },
});

export default TasksScreen;
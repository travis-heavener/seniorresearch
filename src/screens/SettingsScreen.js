import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";

// Pedometer + necessary Android permissions imports
import SettingsSwitch from "../components/SettingsSwitch";

import { Themes } from "../config/Config";
import { clearUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vh } from "../config/Toolbox";

const SettingsScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    
    // used to refresh the display
    const [__remountStatus, __setRemountStatus] = useState(false);
    const forceRemount = () => __setRemountStatus(!__remountStatus);

    const wrapFunc = func => {
        return () => {
            func();
            forceRemount();
        };
    };

    return (
		<View style={styles.top}>
			<View style={[styles.header, {backgroundColor: THEME.secondary, borderColor: THEME.secondaryAccent}]}>
                <Text style={[styles.headerText, {color: THEME.text}]} adjustsFontSizeToFit>Settings</Text>
            </View>
            <View style={[styles.body, {backgroundColor: THEME.primary}]}>
                <SettingsSwitch
                    text="Battery Saver"
                    activityListener={() => userContext.isBatterySaverOn()}
                    toggle={wrapFunc( () => userContext.toggleBatterySaver() )}
                />
                <SettingsSwitch
                    text="Use Dark Theme"
                    activityListener={() => userContext.selectedTheme == "dark"}
                    toggle={wrapFunc( () => userContext.toggleSelectedTheme() )}
                />
                <SettingsSwitch
                    text="Reset User Data"
                    activityListener={() => false}
                    toggle={wrapFunc( () => clearUserData(userContext) )}
                />
            </View>
		</View>
	);
};

const styles = StyleSheet.create({
    top: {
        flex: 1
    },
    header: {
        flex: 0.08,
        // backgroundColor: THEME.secondary,
        // borderColor: THEME.secondaryAccent,
        borderTopWidth: vh(0.33),
        borderBottomWidth: vh(0.33)
    },
    headerText: {
        fontSize: 10000, // shrinks to fit anyways
        fontWeight: "bold",
        // color: THEME.text,
        margin: "3%"
    },
    body: {
        flex: 0.92,
        flexDirection: "column",
        justifyContent: "flex-start",
        // backgroundColor: THEME.primary
    }
});

export default SettingsScreen;
import React, { useState, useContext } from "react";
import { View, StyleSheet, Text } from "react-native";

// Pedometer + necessary Android permissions imports
import SettingsSwitch from "../components/SettingsSwitch";

import { Themes } from "../config/Themes";
import { clearUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vh, vw } from "../config/Toolbox";

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
            <View style={[styles.body, {backgroundColor: THEME.primary, borderColor: THEME.primaryAccent}]}>
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
            <View style={[styles.dropdownBubble, {borderColor: THEME.primary}]} />
		</View>
	);
};

const styles = StyleSheet.create({
    top: {
        flex: 1
    },
    header: {
        width: vw(100),
        height: vh(8),
        borderTopWidth: vh(0.33),
        borderBottomWidth: vh(0.33)
    },
    headerText: {
        textAlign: "center",
        fontSize: vh(4), // shrinks to fit anyways
        fontWeight: "bold",
        marginVertical: vh(1)
    },
    body: {
        width: vw(100),
        height: vh(57.5),
        borderBottomWidth: vh(0.5),
        flexDirection: "column",
        justifyContent: "flex-start"
    },
    dropdownBubble: {
        width: vw(10),
        aspectRatio: 1,
        marginTop: vh(-1.5),
        alignSelf: "center",
        borderRadius: vw(5),
        borderWidth: vh(1)
    }
});

export default SettingsScreen;
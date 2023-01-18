import React, { useContext } from "react";
import { View, StyleSheet, Text, Dimensions } from "react-native";

// Pedometer + necessary Android permissions imports
import SettingsSwitch from "../components/SettingsSwitch";

import { Settings, Context, Themes } from "../Config";
import { UserDataContext } from "../SessionUserData";

// viewport height function to make life easier
const vw = w => Dimensions.get("window").width * (w/100);
const vh = h => Dimensions.get("window").height * (h/100);

const SettingsScreen = (props) => {
	const context = useContext( Context );

    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

    return (
		<View style={styles.top}>
			<View style={[styles.header, {backgroundColor: THEME.secondary, borderColor: THEME.secondaryAccent}]}>
                <Text style={[styles.headerText, {color: THEME.text}]} adjustsFontSizeToFit>Settings</Text>
            </View>
            <View style={[styles.body, {backgroundColor: THEME.primary}]}>
                <SettingsSwitch text="Battery Saver" tag="useBatterySaver" />
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
import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, DevSettings, Pressable } from "react-native";

// Pedometer + necessary Android permissions imports
import SettingsSwitch from "../components/SettingsSwitch";

import { Themes } from "../config/Themes";
import { clearUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vh, vw } from "../config/Toolbox";
import SettingsButton from "../components/SettingsButton";
import TextConfirmModal from "../components/TextConfirmModal";
import { eventEmitter, restartAppTick, startAppTick, stopAppTick } from "../config/Main";
import { restartLocation } from "../config/SensorsManager";

const SettingsScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    
    // used to refresh the display
    const [__remountStatus, __setRemountStatus] = useState(false);
    const forceRemount = () => __setRemountStatus(!__remountStatus);

    const [isResetModalShown, setResetModalVisibility] = useState(false);
    const hideResetModal = () => setResetModalVisibility(false);
    const showResetModal = () => setResetModalVisibility(true);

    const toggleBatterySaver = () => {
        userContext.toggleBatterySaver();
        restartLocation(userContext);
        restartAppTick(userContext);
        forceRemount();
    };

    const toggleUnits = () => {
        userContext.togglePreferredUnits();
        eventEmitter.emit("remountHome");
        forceRemount();
    };

    const resetUserData = async () => {
        stopAppTick(); // this prevents other components from trying to update, causing an error
        hideResetModal(); // hide pop-up modal
        await clearUserData(userContext); // reset all data
        eventEmitter.emit("navigate", "Signup"); // navigate to signup screen
    };

    return (
		<View style={styles.top}>
            <Pressable style={styles.absolute} onPress={() => props.navigate("Home")} />

			<View style={[styles.header, {backgroundColor: THEME.secondary, borderColor: THEME.secondaryAccent}]}>
                <Text style={[styles.headerText, {color: THEME.text}]} adjustsFontSizeToFit>Settings</Text>
            </View>
            <View style={[styles.body, {backgroundColor: THEME.primary, borderColor: THEME.primaryAccent}]}>
                <SettingsSwitch
                    text="Battery Saver"
                    activityListener={() => userContext.isBatterySaverOn()}
                    toggle={toggleBatterySaver}
                />
                <SettingsSwitch
                    text="Use Metric units"
                    activityListener={() => userContext.preferredUnits == "Metric"}
                    toggle={toggleUnits}
                />
                <SettingsButton
                    text="Reset User Data"
                    activityListener={() => false}
                    onPress={showResetModal}
                />
            </View>
            <View style={[styles.dropdownBubble, {borderColor: THEME.primaryAccent}]} />

            <TextConfirmModal isModalVisible={isResetModalShown} confirm={resetUserData} reject={hideResetModal} />
		</View>
	);
};

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
    },
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
        fontFamily: "JosefinSans_700Bold",
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
        height: vh(3),
        marginTop: vh(0),
        alignSelf: "center",
        borderBottomLeftRadius: vw(5),
        borderBottomRightRadius: vw(5),
        borderWidth: vh(1),
        borderTopWidth: 0
    }
});

export default SettingsScreen;
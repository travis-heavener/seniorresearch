import React, { useState, useContext, useEffect, useCallback } from "react";
import { View, StyleSheet, Text, DevSettings, Pressable, TouchableOpacity } from "react-native";

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
import TermsModal from "../components/TermsModal";
import PrivacyModal from "../components/PrivacyModal";
import CreditsModal from "../components/CreditsModal";
import { useFocusEffect } from "@react-navigation/native";

const SettingsScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const { navContext } = props;
    const [THEME, setTheme] = useState( Themes[ userContext.selectedTheme ].settings ); // select theme

    // credits, privacy policy, and TOS modal controls
    const [showPP, setPPVisibility] = useState(false);
    const [showCredits, setCreditsVisibility] = useState(false);
    const [showTOS, setTOSVisibility] = useState(false);
    const confirmTOS = () => {
        setTOSVisibility(false);
        userContext.stats.setHasAcceptedTOS(true); // despite the user having to confirm TOS to use the app, it couldn't hurt to have this
    };
    
    // used to refresh the display
    const [__remountStatus, __setRemountStatus] = useState(false);
    const forceRemount = () => __setRemountStatus(!__remountStatus);

    const [isResetModalShown, setResetModalVisibility] = useState(false);
    const hideResetModal = () => setResetModalVisibility(false);
    const showResetModal = () => setResetModalVisibility(true);

    // on screen focus
    useFocusEffect(
        useCallback(
            () => {
                // event emitters
                eventEmitter.removeAllListeners("remountSettings"); // remove existing listeners
                eventEmitter.addListener("remountSettings", () => { // add new listener
                    setTheme( Themes[ userContext.selectedTheme ].settings );
                });
            }, [props]
        )
    );

    // disable swipe gestures when modals appear and vice versa
    const toggleGestures = (cond) => cond ? props.freezeGestures() : props.unfreezeGestures();

    useEffect(() => toggleGestures(showPP), [showPP]);
    useEffect(() => toggleGestures(showCredits), [showCredits]);
    useEffect(() => toggleGestures(showTOS), [showTOS]);
    useEffect(() => toggleGestures(isResetModalShown), [isResetModalShown]);

    const toggleBatterySaver = () => {
        userContext.toggleBatterySaver();
        restartLocation(userContext);
        restartAppTick(userContext, navContext);
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
        props.navigate("Signup") // navigate to signup screen
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

                <View style={styles.footer}>
                    <TermsModal isModalVisible={showTOS} confirm={confirmTOS} />
                    <PrivacyModal isModalVisible={showPP} confirm={() => setPPVisibility(false)} />
                    <CreditsModal isModalVisible={showCredits} confirm={() => setCreditsVisibility(false)} />

                    <TouchableOpacity activeOpacity={0.75} style={styles.footerButton} onPress={() => setTOSVisibility(true)}>
                        <Text style={[styles.footerText, {color: THEME.text}]}>Terms and Conditions</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.75} style={styles.footerButton} onPress={() => setPPVisibility(true)}>
                        <Text style={[styles.footerText, {color: THEME.text}]}>Privacy Policy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.75} style={styles.footerButton} onPress={() => setCreditsVisibility(true)}>
                        <Text style={[styles.footerText, {color: THEME.text}]}>Credits</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* <View style={[styles.dropdownBubble, {borderColor: THEME.primaryAccent}]} /> */}

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
    },
    footer: {
        position: "absolute",
        bottom: vh(0.33),
        width: "100%",
        height: vh(3.5),
        paddingHorizontal: vw(2),
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    footerButton: {
        width: null,
        height: "100%",
        paddingHorizontal: vw(2)
    },
    footerText: {
        flex: 1,
        textAlignVertical: "center",
        fontFamily: "Alata_400Regular",
        fontSize: vh(1.75)
    }
});

export default SettingsScreen;
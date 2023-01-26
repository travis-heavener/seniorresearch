import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";

import { Settings, Context, Themes } from "../Config";
import { UserDataContext } from "../SessionUserData";

// viewport height function to make life easier
const vw = w => Dimensions.get("window").width * (w/100);
const vh = h => Dimensions.get("window").height * (h/100);

const SettingsSwitch = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

    const [currentStatus, setCurrentStatus] = useState( false ); // default ticked value

    // const toggle = () => {
    //     props.toggle();
    //     setCurrentStatus( !currentStatus );
    // };

    return (
        <View style={[styles.body, {borderBottomColor: THEME.primaryAccent}]}>
            <Text style={[styles.desc, {color: THEME.text}]}>{props.text}</Text>
            <TouchableOpacity style={styles.switch} onPress={props.toggle} activeOpacity={1}>
                <View style={styles.switchBody}>
                    <View style={[styles.switchBlob, {alignSelf: props.activityListener() ? "flex-end" : "flex-start"}]}></View>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        width: vw(100),
        height: vh(8),
        paddingHorizontal: vw(5),
        flexDirection: "row",
        // borderBottomColor: THEME.primaryAccent,
        borderBottomWidth: 2
    },
    desc: {
        flex: 0.8,
        alignSelf: "center",
        // color: THEME.text
    },
    switch: {
        flex: 0.2,
        justifyContent: "center",
        alignItems: "center"
    },
    switchBody: {
        width: "100%",
        height: "63.5%",
        backgroundColor: "#f5f5f5",
        borderRadius: 1000,
        borderColor: "#b6b6b6",
        borderWidth: 2.5
    },
    switchBlob: {
        height: "100%",
        aspectRatio: 1,
        backgroundColor: "#75a9fa",
        borderRadius: 1000,
        borderColor: "#5a91e8",
        borderWidth: 2.5
    }
});

export default SettingsSwitch;
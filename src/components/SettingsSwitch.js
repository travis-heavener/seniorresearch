import React, { useContext, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Animated } from "react-native";

import { UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vh, vw } from "../config/Toolbox";
import { Themes } from "../config/Themes";

const SettingsSwitch = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    const MISC_THEME = Themes[ userContext.selectedTheme ].misc; // select theme

    const toggle = () => {
        // trigger animation
        Animated.timing(toggleAnim, {
            toValue: !props.activityListener() + 0,
            duration: 250,
            useNativeDriver: false
        }).start();
        
        props.toggle();
    };

    // animation (default value moves the switch to the proper position on screen load)
    const toggleAnim = useRef(new Animated.Value( props.activityListener() + 0 )).current;

    return (
        <View style={[styles.body, {borderBottomColor: THEME.primaryAccent}]}>
            <Text style={[styles.desc, {color: THEME.text}]}>{props.text}</Text>
            <TouchableOpacity style={styles.switch} onPress={toggle} activeOpacity={1}>
                <View style={styles.switchBody}>
                    <Animated.View style={{flex: toggleAnim}} />
                    <View style={[styles.switchBlob, {backgroundColor: MISC_THEME.switchColor, borderColor: MISC_THEME.switchBorderColor}]} />
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
        borderBottomWidth: vh(0.26)
    },
    desc: {
        flex: 0.8,
        fontSize: vh(1.875),
        fontWeight: "500",
        alignSelf: "center"
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
        borderRadius: vh(50),
        borderColor: "#d0d0d0",
        flexDirection: "row",
        borderWidth: vh(0.36)
    },
    switchBlob: {
        height: "100%",
        aspectRatio: 1,
        borderRadius: 1000,
        borderWidth: vh(0.36)
    }
});

export default SettingsSwitch;
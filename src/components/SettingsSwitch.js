import React, { useContext, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Animated } from "react-native";

import { UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vh, vw } from "../config/Toolbox";
import { Themes } from "../config/Themes";

const SettingsSwitch = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

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
                    <View style={styles.switchBlob} />
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
        borderBottomWidth: 2
    },
    desc: {
        flex: 0.8,
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
        borderRadius: 1000,
        borderColor: "#b6b6b6",
        flexDirection: "row",
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
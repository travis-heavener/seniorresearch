import React, { useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from "react-native";

import { Settings, Context, Themes } from "../Config";

// select theme
const THEME = Themes[ Settings.theme ].settings;

// viewport height function to make life easier
const vw = w => Dimensions.get("window").width * (w/100);
const vh = h => Dimensions.get("window").height * (h/100);

const SettingsSwitch = (props) => {
    const context = useContext( Context );
    const toggle = () => {
        Settings[ props.tag ] = !Settings[ props.tag ];
        console.log(Settings[props.tag]);
    };

    return (
        <View style={styles.body}>
            <Text style={styles.desc}>{props.text}</Text>
            <TouchableOpacity style={styles.switch} onPress={toggle}>
                <View><Text>a</Text></View>
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
        borderBottomColor: THEME.primaryAccent,
        borderBottomWidth: 2
    },
    desc: {
        flex: 0.8,
        alignSelf: "center",
        color: THEME.text
    },
    switch: {
        flex: 0.2,
        backgroundColor: "red"
    }
});

export default SettingsSwitch;
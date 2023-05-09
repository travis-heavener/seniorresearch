import { useFocusEffect } from "@react-navigation/core";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Animated } from "react-native"
import { Settings } from "../config/Config";
import { eventEmitter } from "../config/Main";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const ProgressBar = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].misc;

    const [data, setData] = useState({
        max: props.max, min: props.min, current: props.current, readout: props.readout,
        percentage: Math.max(0, Math.min(props.current / (props.max - props.min) * 100, 100))
    });
    
    // runs on a re-render
    const percentageAnim = useRef(new Animated.Value(0)).current;
    const xTranslation = percentageAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [-props.width, 0]
    });

    useEffect(() => {
        Animated.timing(percentageAnim, {
            toValue: data.percentage,
            duration: 250,
            useNativeDriver: true
        }).start();
    }, [props, data]);

    // listen to any changes
    useEffect(() => {
        const func = (_data) => {
            if (props.eventName == "remountProfile") {
                if (_data.progressBar) {
                    const newData = _data.progressBar;
                    setData({
                        max: newData.max, min: newData.min,
                        current: newData.current, readout: newData.readout,
                        percentage: Math.max(0, Math.min(newData.current / (newData.max - newData.min) * 100, 100))
                    });
                }
            }
        };

        if (props.eventName)
            eventEmitter.addListener(props.eventName, func)

        return () => {
            if (props.eventName)
                eventEmitter.removeListener(props.eventName, func);
        };
    }, [props]);

    return (
        <View style={[styles.top, {width: props.width, height: props.height}]}>
            <Animated.View style={[styles.blob, {transform: [{translateX: xTranslation}], backgroundColor: THEME.progressBarColor}]}>
                <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.readout}>{ data.readout }</Text>
            </Animated.View>
        </View>
    )
};

const styles = StyleSheet.create({
    top: {
        borderWidth: 2.5,
        borderRadius: vw(4),
        flexDirection: "row",
        overflow: "hidden", // prevents blob from overflowing
        backgroundColor: "whitesmoke"
    },
    blob: {
        // borderTopRightRadius: vw(3),
        // borderBottomRightRadius: vw(3),
        width: "100%",
        height: "100%",
        justifyContent: "center"
    },
    readout: {
        height: "100%",
        position: "absolute",
        right: 0,
        marginHorizontal: "1.25%",
        textAlignVertical: "center",
        fontSize: vh(2),
        fontFamily: "Alata_400Regular",
        color: "#f9f9f9"
    }
});

export default ProgressBar;
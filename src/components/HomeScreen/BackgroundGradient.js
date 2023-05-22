import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { Settings } from "../../config/Config";
import { Themes } from "../../config/Themes";
import { vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";
import { calculateToColor, generateAnimGradient } from "./GradientManager";

const BackgroundGradient = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].home; // select theme

    // trigger frequent remount refreshes OR battery saver turns on/off
    useFocusEffect(
        useCallback(() => {
            const interval = setInterval(
                refreshColor,
                Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].backgroundColor
            );
            return () => clearInterval(interval);
        }, [props, userContext.batterySaverStatus])
    );

    // trigger a re-render of the background gradient when speed changes
    const refreshColor = () => {
        const speed = userContext.metadata.getSpeed();
        const timeDelta = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].backgroundColor;

        // calculate gradient
        let bColor = backgroundColor ?? styles.top.backgroundColor;
        let { targetColor, step } = calculateToColor( bColor, THEME.stopped, THEME.fast, speed );

        // prevent animation from running if it doesn't need to (ie. the color is the same)
        if (targetColor == null) return;

        // start animation
        Animated.timing(backgroundAnim, {
            toValue: step,
            duration: timeDelta / 4,
            useNativeDriver: false
        }).start();
    };

    // background animation color
    const backgroundAnim = useRef(new Animated.Value(0)).current;
    const backgroundColor = backgroundAnim.interpolate(
        generateAnimGradient(THEME.stopped, THEME.fast)
    );

    return (
        <Animated.View style={[styles.top, {backgroundColor: backgroundColor}]} />
    );
};

const styles = StyleSheet.create({
    top: {
        position: "absolute",
        top: 0,
        left: 0,
        width: vw(100),
        height: vh(100),
        backgroundColor: "rgb(252, 170, 167)"
    }
});

export default BackgroundGradient;
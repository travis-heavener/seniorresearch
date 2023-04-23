import { useContext, useEffect, useRef } from "react";
import { StyleSheet, Text, View, Animated } from "react-native"
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const ProgressBar = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].misc;

    const {max, min, current} = props;
    let percentage = current / (max - min) * 100; // 0 being at min & 100 being at max
    percentage = Math.max(0, Math.min(percentage, 100)); // clamp between 0 and 100
    
    // runs on a re-render
    const percentageAnim = useRef(new Animated.Value(0)).current;
    const xTranslation = percentageAnim.interpolate({
        inputRange: [0, 100],
        outputRange: [-props.width, 0]
    });

    useEffect(() => {
        Animated.timing(percentageAnim, {
            toValue: percentage,
            duration: 250,
            useNativeDriver: true
        }).start();
    }, [props]);

    return (
        <View style={[styles.top, {width: props.width, height: props.height}]}>
            <Animated.View style={[styles.blob, {transform: [{translateX: xTranslation}], backgroundColor: THEME.progressBarColor}]}>
                <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.readout}>{ props.readout }</Text>
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
        fontWeight: "500",
        fontStyle: "italic",
        color: "whitesmoke"
    }
});

export default ProgressBar;
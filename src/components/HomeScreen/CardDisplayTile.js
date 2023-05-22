import { useContext, useRef } from "react";
import { Animated, Easing, Pressable, StyleSheet, View } from "react-native";
import { Themes } from "../../config/Themes";
import { vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";
import ScalingText from "../ScalingText";

const CardDisplayTile = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cards;
    const { onPress, row, col, obj } = props;

    const blobWidthRaw = useRef(
        new Animated.Value(
            (obj.objType == "ExploreObjective") ? (obj.targetsFound / obj.targetCount * 100) :
            (obj.objType != "FreeObjective") ? obj.getCompletionPercent(userContext) : 0
        )
    ).current;

    const blobWidth = blobWidthRaw.interpolate({
        inputRange: [0, 100],
        outputRange: [-vw(85) / 5, 0],
        extrapolate: "clamp"
    });

    Animated.timing(blobWidthRaw, {
        toValue: (obj.objType == "ExploreObjective") ? (obj.targetsFound / obj.targetCount * 100) :
            (obj.objType != "FreeObjective") ? obj.getCompletionPercent(userContext) : 0,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true
    }).start();

    // objective completion progression for background color
    const blobStyle = (obj.objType != "FreeObjective") ? {
        position: "absolute", left: 0, top: 0, bottom: 0, right: 0,
        transform: [{translateX: blobWidth}],
        backgroundColor: THEME.checkedTile
    } : {display: "none"};

    return (
        <Pressable
            key={col}
            onPress={onPress}
            style={[
                styles.tile, // default styling
                {backgroundColor: (obj.isCompleted && obj.objType == "FreeObjective") ? THEME.checkedTile : THEME.uncheckedTile}, // checked color
                (row == 0) ? {borderTopWidth: vh(0.26)} : {}, (col == 0) ? {borderLeftWidth: vh(0.26)} : {} // borders for top/left
            ]}
        >
            { <Animated.View style={blobStyle} /> }
            {/* <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.tileText}>{obj.toString()}</Text> */}
            <ScalingText maxLineLength={12}>{ obj.toString(userContext) }</ScalingText>
        </Pressable>
    );
};

export default CardDisplayTile;

const styles = StyleSheet.create({
    tile: {
        flex: 1/5,
        flexDirection: "row",
        justifyContent: "center",
        borderColor: "black",
        borderRightWidth: vh(0.26),
        borderBottomWidth: vh(0.26),
        overflow: "hidden"
    }
});
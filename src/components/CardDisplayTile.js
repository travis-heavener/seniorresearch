import { useContext } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Themes } from "../config/Themes";
import { vh } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import ScalingText from "./ScalingText";

const CardDisplayTile = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cards;
    const { onPress, row, col, obj } = props;

    return (
        <Pressable
            key={col}
            onPress={onPress}
            style={[
                styles.tile, // default styling
                {backgroundColor: obj.isCompleted ? THEME.checkedTile : THEME.uncheckedTile}, // checked color
                (row == 0) ? {borderTopWidth: vh(0.26)} : {}, (col == 0) ? {borderLeftWidth: vh(0.26)} : {} // borders for top/left
            ]}
        >
            {/* <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.tileText}>{obj.toString()}</Text> */}
            <ScalingText maxLineLength={12}>{ obj.toString(userContext) }</ScalingText>
        </Pressable>
    );
};

export default CardDisplayTile;

const styles = StyleSheet.create({
    tile: {
        flex: 1/5,
        justifyContent: "center",
        borderColor: "black",
        borderRightWidth: vh(0.26),
        borderBottomWidth: vh(0.26)
    }
});
import { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Themes";
import { toTitleCase, vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const RewardEntry = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].rewards;
    const { reqs } = props;
    
    const isUnlocked = userContext.stats.level >= reqs.level;
    const labelText = reqs.type == "theme" ? toTitleCase(reqs.id) + " Theme" :
        reqs.type == "icon" ? reqs.label + " Icon" : "null";

    const labelTextStyle = isUnlocked
        ? {...styles.labelTextUnlocked, color: THEME.unlockedText}
        : {...styles.labelTextLocked,   color: THEME.lockedText};

    return (
        <View style={[styles.top, {backgroundColor: THEME.entryBackground}]}>
            <View style={[styles.userLevelContainer, {backgroundColor: isUnlocked ? "gold" : "#999"}]}>
                <Text style={styles.userLevel} adjustsFontSizeToFit={true} numberOfLines={1}>{reqs.level}</Text>
            </View>
            <Text style={labelTextStyle}>{ labelText }</Text>
            {
                reqs.type == "icon" ? <Image style={styles.iconStyle} source={reqs.img} />
                : reqs.type == "theme" ? <View style={[styles.iconStyle, {backgroundColor: reqs.iconColor}]} />
                : null
            }
        </View>
    );
};

export default RewardEntry;

const styles = StyleSheet.create({
    top: {
        width: "100%",
        height: vh(7),
        paddingHorizontal: vw(3),
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    userLevelContainer: {
        height: vh(4.125),
        aspectRatio: 1,
        alignSelf: "center",
        borderRadius: vw(100),
        borderColor: "#000",
        borderWidth: vw(0.425)
    },
    userLevel: {
        flex: 1,
        borderRadius: vw(100),
        fontSize: vh(1.75),
        fontWeight: "600",
        color: "#222",
        textAlign: "center",
        textAlignVertical: "center"
    },
    labelTextUnlocked: {
        flex: 0.8,
        fontSize: vh(1.75),
        textAlign: "left",
        fontWeight: "500"
    },
    labelTextLocked: {
        flex: 0.8,
        fontSize: vh(1.75),
        textAlign: "left",
        fontStyle: "italic",
        fontWeight: "400"
    },
    iconStyle: {
        width: vh(7) * 0.9, // 90% of height
        aspectRatio: 1,
        borderRadius: vh(2)
    }
});
import { useContext } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Themes";
import { toTitleCase, vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const TITLE_IMG = require("../../assets/media/text_edit.png");

const RewardEntry = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].rewards;
    const { reqs } = props;
    
    const isUnlocked = userContext.stats.level >= reqs.level;
    const labelText = reqs.type == "theme" ? toTitleCase(reqs.id) + " Theme" :
        reqs.type == "icon" ? reqs.label + " Icon" :
        reqs.type == "title" ? "\"" + reqs.label + "\" Title" : "null";

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
                : reqs.type == "theme" ? <View style={[styles.iconStyle, {backgroundColor: reqs.iconColor, borderWidth: vh(0.2)}]} />
                : reqs.type == "title" ? <Image style={styles.iconStyle} source={TITLE_IMG} />
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
        fontFamily: "Alata_400Regular",
        color: "#222",
        textAlign: "center",
        textAlignVertical: "center"
    },
    labelTextUnlocked: {
        flex: 0.8,
        fontSize: vh(1.75),
        textAlign: "left",
        fontFamily: "JosefinSans_600SemiBold"
    },
    labelTextLocked: {
        flex: 0.8,
        fontSize: vh(1.75),
        textAlign: "left",
        fontFamily: "JosefinSans_400Regular_Italic"
    },
    iconStyle: {
        width: vh(7) * 0.85, // 85% of height
        aspectRatio: 1,
        borderColor: "#000",
        borderRadius: vh(1.8)
    }
});
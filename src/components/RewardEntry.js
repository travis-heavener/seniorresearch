import { StyleSheet, Text, View } from "react-native";
import { vh, vw } from "../config/Toolbox";

const RewardEntry = (props) => {
    const { reqs } = props;
    const isUnlocked = Math.floor(Math.random() * 2);

    return (
        <View style={styles.top}>
            <View style={[styles.userLevelContainer, {backgroundColor: isUnlocked ? "gold" : "#999"}]}>
                <Text style={styles.userLevel} adjustsFontSizeToFit={true} numberOfLines={1}>{reqs.level}</Text>
            </View>
            <Text>text</Text>
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
        alignItems: "center",
        borderBottomWidth: vh(0.26),
        borderColor: "whitesmoke",
        backgroundColor: "white"
    },
    userLevelContainer: {
        height: vh(4.125),
        aspectRatio: 1,
        alignSelf: "center",
        borderRadius: vw(100),
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
    }
});
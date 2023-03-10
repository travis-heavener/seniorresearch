import { useContext } from "react";
import { Animated, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Settings, Themes } from "../config/Config";
import { formatCommas, vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

import ProgressBar from "../components/ProgressBar";

const ProfileScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const generateStat = (name) => {
        const md = userContext.metadata, st = userContext.stats;
        let text = "";
        let val = "";

        if (name == "steps") {
            val = formatCommas( st.lifetimeSteps + md.steps );
            text = "Steps";
        } else if (name == "distance") {
            val = ((st.lifetimeDistance + md.distance)/1000).toFixed(1);
            val = formatCommas(val) + "km";
            text = "Traveled";
        } else if (name == "cards") {
            val = st.lifetimeCards;
            text = "Cards Completed";
        } else if (name == "bingos") {
            val = st.lifetimeBingos;
            text = "Bingos";
        } else if (name == "xp") {
            val = st.getTotalXP();
            text = "Total XP";
        }

        return (
            <View style={styles.singleStatView}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsText}>{text}:</Text>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsVariable}>{val}</Text>
            </View>
        )
    };

    const generateThemeIcon = (theme) => {
        const col = theme == "base" ? "whitesmoke" : theme == "dark" ? "#555" : "#0000";
        const onPress = () => userContext.setSelectedTheme(theme);

        return (
            <Pressable style={[styles.themeIcon, {backgroundColor: col}]} onPress={onPress} />
        )
    };

    // xp stuff
    const currentXP = userContext.stats.xp;
    const readoutXP = currentXP + " XP";
    const maxXP = Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level);

    return (
        <View style={{flex: 1}}>
            <TouchableOpacity style={styles.absolute} onPress={() => props.navigation.goBack()} activeOpacity={1} />

            {/* content itself */}
            <View style={[styles.body, {backgroundColor: THEME.body, transform: [{translateX: 0}]}]}>
                <View style={styles.userInfoView}>
                    <View style={styles.profileImage} />

                    <View style={styles.userInfoText}>
                        <View style={styles.userNameContainer}>
                            <View style={styles.userLevelContainer}>
                                <Text style={styles.userLevel} adjustsFontSizeToFit={true} numberOfLines={1}>
                                    { userContext.stats.level }
                                </Text>
                            </View>
                            <Text style={styles.userName}>My Name</Text>
                        </View>
                        {/* progress bar */}
                        <ProgressBar
                            width={vw(43)} height="33%"
                            min={0} max={maxXP} current={currentXP} readout={readoutXP}
                        />
                        <Text style={styles.xpBarSubtitle}>{maxXP} XP</Text>
                    </View>
                </View>
                <View style={styles.statsView}>
                    <Text style={styles.statsHeader}>Lifetime Stats</Text>

                    <View style={styles.statsColumnView}>
                        <View style={styles.statsColumn}>
                            { generateStat("steps") }
                            { generateStat("distance") }
                        </View>
                        <View style={styles.statsColumn}>
                            { generateStat("cards") }
                            { generateStat("bingos") }
                            { generateStat("xp") }
                        </View>
                    </View>
                </View>
                <View style={styles.themePickerView}>
                    <Text style={styles.themePickerHeader}>Available Themes</Text>

                    <View style={styles.themePicker}>
                        { generateThemeIcon("base") }
                        { generateThemeIcon("dark") }
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        width: vw(100),
        height: vh(100)
    },
    body: {
        position: "absolute",
        width: vw(100),
        height: vh(75.26), // 75vh + bottom border width
        bottom: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        borderColor: "black",
        borderTopWidth: vh(.26),
        borderRightWidth: vh(.26),
        borderLeftWidth: vh(.26)
    },
    userInfoView: {
        flex: 16, // from vh(16)
        maxHeight: vh(16),
        paddingHorizontal: vw(10),
        flexDirection: "row",
        backgroundColor: "#f55"
    },
    profileImage: {
        marginTop: -vh(5),
        height: vh(16),
        aspectRatio: 1,
        backgroundColor: "cornflowerblue",
        borderRadius: vh(16),
        borderColor: "black",
        borderWidth: 2
    },
    userInfoText: {
        flex: 1, // fill remaining space
        marginLeft: "5%",
        marginVertical: "5%",
        justifyContent: "space-evenly"
    },
    userNameContainer: {
        height: vh(4.5),
        flexDirection: "row"
    },
    userName: {
        marginLeft: "2.5%",
        fontSize: vh(3),
        fontWeight: "600",
        textAlignVertical: "center"
    },
    userLevelContainer: {
        height: vh(4.125),
        aspectRatio: 1,
        alignSelf: "center",
        borderRadius: vw(100),
        borderWidth: vw(0.425),
        backgroundColor: "gold"
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
    xpBarSubtitle: {
        textAlign: "right",
        fontSize: vh(1.5),
        fontWeight: "600"
    },
    statsView: {
        flex: 22, // from vh(24)
        maxHeight: vh(22),
        backgroundColor: "cornflowerblue"
    },
    statsHeader: {
        textAlign: "center",
        fontSize: vh(2.75),
        textDecorationLine: "underline"
    },
    statsColumnView: {
        flex: 1,
        marginVertical: "3%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "flex-start"
    },
    statsColumn: {
        flex: .425,
        backgroundColor: "white",
        borderWidth: 2,
        borderColor: "black"
    },
    singleStatView: {
        width: "100%",
        height: vh(4),
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    statsText: {
        flex: 1,
        fontSize: vh(1.75),
        textAlign: "left"
    },
    statsVariable: {
        maxWidth: "33%",
        minWidth: "25%",
        fontSize: vh(1.75),
        fontStyle: "italic",
        textAlign: "right"
    },
    themePickerView: {
        flex: 37,
        maxHeight: vh(37),
        backgroundColor: "lime"
    },
    themePickerHeader: {
        textAlign: "center",
        fontSize: vh(2.75),
        textDecorationLine: "underline"
    },
    themePicker: {
        width: "60%",
        height: vh(11),
        marginTop: vh(1/2),
        marginHorizontal: "20%",
        justifyContent: "space-evenly",
        alignItems: "center",
        flexDirection: "row",
        borderRadius: vh(2.5), // same as children
        backgroundColor: "#0001" // UNCOMMENT FOR BACKGROUND
    },
    themeIcon: {
        height: "85%",
        aspectRatio: 1,
        borderColor: "#222",
        borderWidth: vh(.26),
        borderRadius: vh(2.5) // 1/4 the height
    }
});

export default ProfileScreen;
import { useContext, useEffect, useState } from "react";
import { BackHandler, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Settings } from "../config/Config";
import { Themes } from "../config/Themes";
import { formatCommas, vh, vw } from "../config/Toolbox";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

import ProgressBar from "../components/ProgressBar";
import { getUnlockedIcons, getUnlockedThemes, iconLookup } from "../config/RewardsManager";
import { FlatList } from "react-native-gesture-handler";
import { eventEmitter } from "../config/Main";

const CHECK_IMG = require("../../assets/media/check.png");
const CARET_IMG = require("../../assets/media/caretDown.png");

const ProfileScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const [__remountStatus, __setRemountStatus] = useState(false);
    const remount = () => __setRemountStatus(!__remountStatus);

    const ThemedText = (props) => <Text {...props} style={[props.style, {color: THEME.text}]}>{props.children}</Text>

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
                <ThemedText adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsText}>{text}:</ThemedText>
                <ThemedText adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsVariable}>{val}</ThemedText>
            </View>
        )
    };

    const generateThemeIcon = (theme) => {
        const onPress = () => {
            userContext.setSelectedTheme(theme.id);
            exportUserData(userContext);
            eventEmitter.emit("remountHome");
            remount();
        };
        
        return (
            <Pressable key={Math.random()} style={[styles.themeIcon, {backgroundColor: theme.iconColor}]} onPress={onPress}>
                <Image style={[styles.checkImg, {display: userContext.selectedTheme == theme.id ? "flex" : "none"}]} source={CHECK_IMG} />
            </Pressable>
        )
    };

    const generateUserIcon = (icon) => {
        const onPress = () => {
            userContext.setSelectedIcon(icon.label);
            exportUserData(userContext);
            remount();
        };
        
        return (
            <TouchableOpacity activeOpacity={0.75} key={Math.random()} style={styles.dropdownIcon} onPress={onPress}>
                <Image style={styles.dropdownIconImg} source={icon.img} />
            </TouchableOpacity>
        )
    };

    // xp stuff
    const currentXP = userContext.stats.xp;
    const readoutXP = currentXP + " XP";
    const maxXP = Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level);

    // for auto-scrolling to selected theme (if not on screen)
    const initialThemeIndex = getUnlockedThemes(userContext.stats.level).map(t => t.id).indexOf(userContext.selectedTheme);
    const initialIconIndex = getUnlockedIcons(userContext.stats.level).map(t => t.label).indexOf(userContext.selectedIcon);

    // icon selector modal
    const [areIconsVisible, setIconsVisibility] = useState(false);
    const toggleIconDropdown = () => setIconsVisibility(!areIconsVisible);

    // android back button functionality (on screen focus)
    useEffect(() => {
        const handleBack = () => {
            setIconsVisibility(false); // either closes this or goes back, regardless
            return areIconsVisible; // if true, prevent default and only close; otherwise, allow default
        };

        BackHandler.addEventListener("hardwareBackPress", handleBack);
        return () => BackHandler.removeEventListener("hardwareBackPress", handleBack);
    }, [areIconsVisible]);

    return (
        <View style={{flex: 1}}>
            <Pressable style={styles.absolute} onPress={() => props.navigate("Home")} />

            {/* content itself */}
            <View style={[styles.body, {transform: [{translateX: 0}]}]}>
                <View style={[styles.userInfoView, {backgroundColor: THEME.userInfo}]}>
                    <View style={[styles.profileImageWrap, {backgroundColor: THEME.iconBackground}]}>
                        <Image style={styles.profileImage} source={iconLookup(userContext.selectedIcon).img} />
                        <TouchableOpacity activeOpacity={0.98} style={[styles.iconSelector, {backgroundColor: THEME.iconAccent}]} onPress={toggleIconDropdown}>
                            <Image
                                resizeMethod="scale"
                                style={[styles.iconCaret, {transform: [{rotate: (!areIconsVisible * 180) + "deg"}]}]}
                                source={CARET_IMG}
                            />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.userInfoText}>
                        <View style={styles.userNameContainer}>
                            <View style={styles.userLevelContainer}>
                                <Text style={styles.userLevel} adjustsFontSizeToFit={true} numberOfLines={1}>
                                    { userContext.stats.level }
                                </Text>
                            </View>
                            <ThemedText style={styles.userName}>{ userContext.stats.username }</ThemedText>
                            {/* TODO: add edit icon to change username */}
                        </View>
                        {/* progress bar */}
                        <ProgressBar
                            width={vw(43)} height="33%"
                            min={0} max={maxXP} current={currentXP} readout={readoutXP}
                        />
                        <ThemedText style={styles.xpBarSubtitle}>{maxXP} XP</ThemedText>
                    </View>
                </View>
                <View style={[styles.statsView, {backgroundColor: THEME.stats}]}>
                    <ThemedText style={styles.statsHeader}>Lifetime Stats</ThemedText>

                    <View style={styles.statsColumnView}>
                        <View style={[styles.statsColumn, {backgroundColor: THEME.statsColumn, borderColor: THEME.statsBorder}]}>
                            { generateStat("steps") }
                            { generateStat("distance") }
                        </View>
                        <View style={[styles.statsColumn, {backgroundColor: THEME.statsColumn, borderColor: THEME.statsBorder}]}>
                            { generateStat("cards") }
                            { generateStat("bingos") }
                            { generateStat("xp") }
                        </View>
                    </View>
                </View>
                <View style={[styles.themePickerView, {backgroundColor: THEME.themes}]}>
                    <ThemedText style={styles.themePickerHeader}>Themes</ThemedText>

                    <View style={styles.themePicker}>
                        <FlatList
                            data={getUnlockedThemes(userContext.stats.level)}
                            renderItem={({item}) => generateThemeIcon(item)}

                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{padding: "2%"}}
                            horizontal={true}

                            initialScrollIndex={initialThemeIndex}
                        />
                    </View>
                </View>

                <Pressable style={[styles.absolute, {display: areIconsVisible ? "flex" : "none"}]} onPress={() => setIconsVisibility(false)} />
                {/* icon dropdown (putting this here makes it overlay other elements w/o zIndex & elevation CSS) */}
                <View style={[styles.iconDropdown, {display: areIconsVisible ? "flex" : "none", opacity: (areIconsVisible+0)}]}>
                    <FlatList
                        data={getUnlockedIcons(userContext.stats.level)}
                        renderItem={({item}) => generateUserIcon(item)}

                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{padding: "2%"}}
                        horizontal={true}

                        initialScrollIndex={initialIconIndex}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        width: vw(100),
        height: vh(100),
        left: 0,
        top: 0,
        bottom: 0,
        right: 0
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
        flexDirection: "row"
        // backgroundColor: "#f55"
    },
    profileImageWrap: {
        marginTop: -vh(5),
        height: vh(16),
        aspectRatio: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: vh(8),
        borderColor: "black",
        borderWidth: vh(0.26)
    },
    profileImage: {
        width: "85%",
        height: "85%",
        borderRadius: vh(4)
    },
    iconSelector: {
        width: "30%",
        height: "27.5%",
        position: "absolute",
        bottom: 0,
        left: 0,
        borderRadius: vh(1.35),
        borderColor: "#222",
        borderWidth: vh(0.26),
        justifyContent: "center",
        alignItems: "center"
    },
    iconCaret: {
        width: "90%",
        height: null,
        aspectRatio: 1
    },
    iconDropdown: {
        position: "absolute",
        left: vw(10)+vh(0.39), // 10vw margin + 0.26vh border on profile image + half 0.26vh border on selector view
        // right: vw(10)+vh(0.39), // equal to left margin (fills evenly in the middle)
        top: vh(16)*0.85*0.725 + vh(0.65), // 85% of (100% - 27.5%) of the circle's height of 16vh + 2 border widths and half boroder
        width: vw(60),
        height: vh(9),
        borderWidth: vh(0.20),
        borderRadius: vh(25)/12,
        borderColor: "#333",
        backgroundColor: "#eee"
    },
    dropdownIcon: {
        flex: 1
    },
    dropdownIconImg: {
        aspectRatio: 1,
        width: null,
        height: "100%",
        marginHorizontal: vw(.75),
        borderRadius: vh(1.75),
        backgroundColor: "#0001" // UNCOMMENT FOR BACKGROUND
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
        fontFamily: "JosefinSans_600SemiBold",
        textAlignVertical: "center"
    },
    userLevelContainer: {
        height: vh(4.125),
        aspectRatio: 1,
        alignSelf: "center",
        borderRadius: vh(4.125/2),
        borderWidth: vw(0.425),
        backgroundColor: "gold"
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
    xpBarSubtitle: {
        textAlign: "right",
        fontSize: vh(1.5),
        fontFamily: "JosefinSans_600SemiBold"
    },
    statsView: {
        flex: 22, // from vh(24)
        maxHeight: vh(22)
        // backgroundColor: "cornflowerblue"
    },
    statsHeader: {
        textAlign: "center",
        fontSize: vh(2.75),
        fontFamily: "Alata_400Regular",
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
        paddingHorizontal: "1.25%",
        backgroundColor: "white",
        borderWidth: vh(0.26),
        borderRadius: vw(3)
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
        fontFamily: "JosefinSans_500Medium",
        textAlign: "left"
    },
    statsVariable: {
        maxWidth: "33%",
        minWidth: "25%",
        fontSize: vh(1.75),
        fontFamily: "JosefinSans_500Medium",
        fontStyle: "italic",
        textAlign: "right"
    },
    themePickerView: {
        flex: 37,
        maxHeight: vh(37)
        // backgroundColor: "lime"
    },
    themePickerHeader: {
        textAlign: "center",
        fontSize: vh(2.75),
        fontFamily: "Alata_400Regular",
        textDecorationLine: "underline"
    },
    themePicker: {
        width: "75%",
        height: vh(11),
        marginTop: vh(1/2),
        marginHorizontal: "12.5%",
        alignItems: "center", // centers the flatlist vertically
        flexDirection: "row",
        borderRadius: vh(2.5), // same as children
        backgroundColor: "#0001" // UNCOMMENT FOR BACKGROUND
    },
    themeIcon: {
        height: vh(8.5),
        marginHorizontal: vw(.75),
        aspectRatio: 1,
        borderColor: "#222",
        borderWidth: vh(.26),
        borderRadius: vh(2.5) // 1/4 the height
    },
    checkImg: {
        width: "60%",
        margin: "20%",
        height: "60%"
    }
});

export default ProfileScreen;
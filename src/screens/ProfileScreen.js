import { useContext, useEffect, useState } from "react";
import { BackHandler, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Settings } from "../config/Config";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

import ProgressBar from "../components/ProgressBar";
import { getUnlockedIcons, getUnlockedThemes, iconLookup } from "../config/RewardsManager";
import { FlatList } from "react-native-gesture-handler";
import { eventEmitter } from "../config/Main";
import UsernameChangeModal from "../components/ProfileScreen/UsernameChangeModal";
import ProfileStat from "../components/ProfileScreen/ProfileStat";

const CHECK_IMG = require("../../assets/media/check.png");
const CARET_IMG = require("../../assets/media/caretDown.png");
const TEXT_EDIT_IMG = require("../../assets/media/text_edit.png");

const ProfileScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const [__remountStatus, __setRemountStatus] = useState(false);
    const remount = () => __setRemountStatus(!__remountStatus);

    const [showNameModal, setShowNameModal] = useState(false);

    const ThemedText = (props) => <Text {...props} style={[props.style, {color: THEME.text}]}>{props.children}</Text>;

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

    // handle event listeners
    useEffect(() => {
        const func = ({progressBar}) => (progressBar !== null) ? setMaxXP(progressBar.max) : null;

        eventEmitter.addListener("remountProfile", func)

        return () => {
            eventEmitter.removeListener("remountProfile", func);
        };
    }, [props]);

    // xp stuff
    const [maxXP, setMaxXP] = useState(Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level));
    const currentXP = userContext.stats.xp;
    const readoutXP = currentXP + " XP";

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

    // username modal functions
    const closeUsernameModal = () => {
        props.unfreezeGestures();
        setShowNameModal(false);
    };
    // username modal functions
    const showUsernameModal = () => {
        props.freezeGestures();
        setShowNameModal(true);
    };

    return (
        <View style={{flex: 1}}>
            <Pressable style={styles.absolute} onPress={() => props.navigate("Home")} />

            <UsernameChangeModal isModalVisible={showNameModal} modalReject={closeUsernameModal} modalConfirm={closeUsernameModal} />

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
                            <Pressable onPress={showUsernameModal}>
                                <Image style={styles.textEditIcon} source={TEXT_EDIT_IMG} />
                            </Pressable>
                        </View>
                        {/* progress bar */}
                        <ProgressBar
                            eventName="remountProfile"
                            width={vw(43)} height="33%"
                            min={0} max={maxXP} current={currentXP} readout={readoutXP}
                        />
                        <View style={styles.xpBarSubtitle}>
                            <ThemedText style={[styles.xpBarText, {textAlign: "left"}]}>{userContext.stats.getLevelTitle()}</ThemedText>
                            <ThemedText style={[styles.xpBarText, {textAlign: "right"}]}>{maxXP} XP</ThemedText>
                        </View>
                    </View>
                </View>
                <View style={[styles.statsView, {backgroundColor: THEME.stats}]}>
                    <ThemedText style={styles.statsHeader}>Lifetime Stats</ThemedText>

                    <View style={styles.statsColumnView}>
                        <View style={[styles.statsColumn, {backgroundColor: THEME.statsColumn, borderColor: THEME.statsBorder}]}>
                            <ProfileStat name="steps" />
                            <ProfileStat name="distance" />
                        </View>
                        <View style={[styles.statsColumn, {backgroundColor: THEME.statsColumn, borderColor: THEME.statsBorder}]}>
                            <ProfileStat name="cards" />
                            <ProfileStat name="bingos" />
                            <ProfileStat name="xp" />
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
        top: vh(24.74),
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
        height: vh(16),
        paddingHorizontal: vw(10),
        flexDirection: "row"
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
        flexDirection: "row",
        alignItems: "center"
    },
    userName: {
        marginHorizontal: "2.5%",
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
    textEditIcon: {
        height: vh(3.25),
        aspectRatio: 1
    },
    xpBarSubtitle: {
        width: vw(43), // same as ProgressBar
        paddingHorizontal: vw(2),
        flexDirection: "row",
        justifyContent: "space-between"
    },
    xpBarText: {
        fontSize: vh(1.5),
        fontFamily: "JosefinSans_600SemiBold"
    },
    statsView: {
        height: vh(22)
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
    themePickerView: {
        height: vh(37)
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
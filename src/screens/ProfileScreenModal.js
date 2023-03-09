import { useCallback, useContext, useEffect, useRef } from "react";
import { Animated, Easing, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import { Settings, Themes } from "../config/Config";
import { formatCommas, vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

import { GestureHandlerRootView, Swipeable } from "react-native-gesture-handler";
import ProgressBar from "../components/ProgressBar";
import { BlurView } from "@react-native-community/blur";

const CLOSE_TIMEOUT = 90; // 90 ms for closing animation

const ProfileScreenModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const close = () => props.navigation.goBack();

    // on focus events
    // useEffect(
    //     () => {
    //         // console.log("IsModalVisible: " + props.isModalVisible);
    //         Animated.timing(slideAnim, {
    //             toValue: props.isModalVisible + 0, // cast boolean to number
    //             duration: 175,
	// 			easing: Easing.out( Easing.sin ),
    //             useNativeDriver: true
    //         }).start();
    //     }, [props.isModalVisible]
    // );

    const queueClose = close;
	// const queueClose = () => {
	// 	Animated.timing(slideAnim, {
	// 		toValue: 0,
	// 		duration: CLOSE_TIMEOUT,
	// 		easing: Easing.out( Easing.sin ),
	// 		useNativeDriver: true
	// 	}).start();
	// 	setTimeout(close, CLOSE_TIMEOUT); // queue the close after the animation
	// };

    // animation
    const slideAnim = useRef(new Animated.Value(0)).current;
    const slideStatus = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-vw(100), 0]
    });

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
            text = "Distance Traveled";
        } else if (name == "cards") {
            val = st.lifetimeCards;
            text = "Cards Completed";
        } else if (name == "bingos") {
            val = st.lifetimeBingos;
            text = "Bingos";
        }

        return (
            <View style={styles.singleStatView}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsText}>{text}:</Text>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsVariable}>{val}</Text>
            </View>
        )
    };

    // xp stuff
    const currentXP = userContext.stats.xp;
    const readoutXP = currentXP + " XP";
    const maxXP = Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level);

    return (
        <View style={{flex: 1}}
            // animationType="none"
            // transparent={true}
            // visible={props.isModalVisible}
            // onRequestClose={close}
        >
            <TouchableOpacity style={styles.absolute} onPress={close} activeOpacity={1} />
            {/* <BlurView blurAmount={3} blurType="light" style={styles.absolute} /> */}

            {/* content itself */}
            <Animated.View style={[styles.body, {backgroundColor: THEME.body, transform: [{translateX: 0}]}]}>
                <View style={styles.userInfoView}>
                    <View style={styles.profileImage} />

                    <View style={styles.userInfoText}>
                        <View style={styles.userNameContainer}>
                            <View style={styles.userLevelContainer}>
                                <Text
                                    style={styles.userLevel}
                                    adjustsFontSizeToFit={true}
                                    numberOfLines={1}
                                >
                                        { userContext.stats.level }
                                </Text>
                            </View>
                            <Text style={styles.userName}>My Name</Text>
                        </View>
                        {/* progress bar */}
                        <ProgressBar
                            width={vw(43)} height="33%"
                            min={0} max={maxXP}
                            current={currentXP} readout={readoutXP}
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
                        </View>
                    </View>
                </View>
            </Animated.View>
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
        height: vh(75),
        bottom: 0,
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        borderColor: "black",
        borderTopWidth: 2,
        borderRightWidth: 2,
        borderLeftWidth: 2
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
        marginLeft: "1.25%",
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
        flex: 59, // from vh(59)
        maxHeight: vh(29), // remaining space below is 30vh
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
    }
});

export default ProfileScreenModal;
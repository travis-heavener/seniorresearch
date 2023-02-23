import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Config";
import { formatCommas, vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const ProfileScreenModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const close = () => props.close();

    // on focus events
    useEffect(
        () => {
            console.log("IsModalVisible: " + props.isModalVisible);
            Animated.timing(slideAnim, {
                toValue: props.isModalVisible + 0, // cast boolean to number
                duration: 200,
                useNativeDriver: false
            }).start();
        }, [props.isModalVisible]
    );

    // animation
    const slideAnim = useRef(new Animated.Value(0)).current;
    const slideStatus = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["-100%", "0%"]
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
            val = st.lifetimeCards; // TODO -- number of cards completed
            text = "Cards Completed";
        } else if (name == "bingos") {
            val = st.lifetimeBingos; // TODO -- number of bingos
            text = "Bingos";
        }

        return (
            <View style={styles.singleStatView}>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsText}>{text}:</Text>
                <Text adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsVariable}>{val}</Text>
            </View>
        )
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={close}
        >
            <TouchableOpacity style={styles.absolute} onPress={close} activeOpacity={1} />
            
            {/* content itself */}
            <Animated.View style={[styles.body, {backgroundColor: THEME.body, left: slideStatus}]}>
                <View style={styles.userInfoView}>
                    <View style={styles.profileImage} />

                    <View style={styles.userInfoText}>
                        <Text style={styles.userName}>(99) My Name</Text>
                        {/* progress bar */}
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
        </Modal>
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
        backgroundColor: "#ff5"
    },
    userName: {
        fontSize: vh(3.125)
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
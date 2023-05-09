import { useContext, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import ProgressBar from "../components/ProgressBar";
import RewardEntry from "../components/RewardEntry";
import { Settings } from "../config/Config";
import { eventEmitter } from "../config/Main";
import { rewardsList } from "../config/RewardsManager";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const RewardsScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[userContext.selectedTheme].rewards;

    const rewardsEntries = rewardsList
        .sort((a, b) => a.level-b.level); // got this first try AND from memory (huge W)
    
    // xp stuff
    const currentXP = userContext.stats.xp;
    const readoutXP = currentXP + " XP";
    const maxXP = Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level);

    // remount
    const [__remountStatus, __setRemountStatus] = useState(0);
    const remount = () => __setRemountStatus(Math.random());

    // listen to remounts
    useEffect(() => {
        const func = (_data) => remount();

        eventEmitter.addListener("remountRewards", func);
        return () => eventEmitter.removeListener("remountRewards", func);
    }, [props]);
    
    return (
        <View style={[styles.top, {backgroundColor: THEME.background}]}>
            <Text style={[styles.headerText, {color: THEME.text}]}> Rewards </Text>

            <View style={[styles.rewardsList, {borderColor: THEME.borderColor}]}>
                <FlatList // using the react-native-gesture-handler FlatList bc it doesn't interfere with screen swipe gestures
                    data={rewardsEntries}
                    keyExtractor={Math.random} // ignores error
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <RewardEntry reqs={item} />}
                    ItemSeparatorComponent={() => <View style={[styles.flatlistSeparator, {backgroundColor: THEME.separatorColor}]} />}
                />
            </View>
            
            <View style={[styles.progressContainer, {backgroundColor: THEME.entryBackground, borderColor: THEME.borderColor}]}>
                <Text style={styles.userXPBubble}>{userContext.stats.level}</Text>
                <ProgressBar
                    eventName="remountRewards"
                    width={vw(43)} height={vh(4)}
                    min={0} max={maxXP} current={currentXP} readout={readoutXP}
                />
            </View>
        </View>
    )
};

export default RewardsScreen;

const styles = StyleSheet.create({
    top: {
        flex: 1
    },
    headerText: {
        width: vw(100),
        height: vh(12.5),
        fontSize: vh(5),
        fontFamily: "JosefinSans_600SemiBold",
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textAlign: "center",
        textAlignVertical: "bottom"
    },
    rewardsList: {
        width: vw(80),
        height: vh(75),
        marginTop: vh(2.5),
        borderWidth: vh(0.26),
        borderRadius: vh(2),
        overflow: "hidden", // prevents the 
        alignSelf: "center"
    },
    flatlistSeparator: {
        width: "100%",
        height: vh(0.225)
    },
    userXPBubble: {
        width: null,
        height: vh(4.125),
        aspectRatio: 1,

        borderRadius: vh(4.125/2),
        borderColor: "#000",
        borderWidth: vh(0.26),
        backgroundColor: "gold",
        
        fontSize: vh(1.75),
        fontFamily: "Alata_400Regular",
        color: "#222",
        textAlign: "center",
        textAlignVertical: "center"
    },
    progressContainer: {
        position: "absolute",
        width: vw(70),
        height: vh(7),
        paddingHorizontal: vw(5),
        bottom: 0,
        borderWidth: vh(0.26),
        borderBottomWidth: 0,
        borderTopLeftRadius: vh(3),
        borderTopRightRadius: vh(3),
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignSelf: "center",
        alignItems: "center"
    }
});
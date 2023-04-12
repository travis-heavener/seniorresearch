import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import RewardEntry from "../components/RewardEntry";
import { rewardsList } from "../config/RewardsManager";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const RewardsScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[userContext.selectedTheme].rewards;

    const rewardsEntries = rewardsList
        .sort((a, b) => a.level-b.level); // got this first try AND from memory (huge W)
    
    return (
        <View style={[styles.top, {backgroundColor: THEME.background}]}>
            <Text style={[styles.headerText, {color: THEME.text}]}> Rewards </Text>
            <View style={styles.rewardsList}>
                <FlatList // using the react-native-gesture-handler FlatList bc it doesn't interfere with screen swipe gestures
                    data={rewardsEntries}
                    keyExtractor={Math.random} // ignores error
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) => <RewardEntry reqs={item} />}
                    ItemSeparatorComponent={() => <View style={[styles.flatlistSeparator, {backgroundColor: THEME.separatorColor}]} />}
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
        fontWeight: "600",
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textAlign: "center",
        textAlignVertical: "bottom"
    },
    rewardsList: {
        position: "absolute",
        width: vw(80),
        height: vh(80),
        bottom: vh(5),
        borderWidth: vh(0.26),
        borderRadius: vh(2),
        overflow: "hidden", // prevents the 
        alignSelf: "center"
    },
    flatlistSeparator: {
        width: "100%",
        height: vh(0.225)
    }
});
import { StyleSheet, Text, View } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import RewardEntry from "../components/RewardEntry";
import { rewardsList } from "../config/RewardsManager";
import { vh, vw } from "../config/Toolbox";

const RewardsScreen = (props) => {
    const rewardsEntries = rewardsList
        .sort((a, b) => a.level-b.level); // got this first try AND from memory (huge W)
    
    return (
        <View style={styles.top}>
            <View style={styles.rewardsList}>
                <FlatList // using the react-native-gesture-handler FlatList bc it doesn't interfere with screen swipe gestures
                    data={rewardsEntries}
                    keyExtractor={Math.random} // ignores error
                    renderItem={({item}) => <RewardEntry reqs={item} />}
                />
            </View>
        </View>
    )
};

export default RewardsScreen;

const styles = StyleSheet.create({
    top: {
        flex: 1,
        backgroundColor: "blue"
    },
    rewardsList: {
        position: "absolute",
        width: vw(80),
        height: vh(80),
        bottom: vh(5),
        alignSelf: "center",
        backgroundColor: "whitesmoke"
    }
});
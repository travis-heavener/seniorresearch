import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { vh } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import { DIFFICULTIES } from "../objectives/BingoCardManager";

const CardSelectItem = (props) => {
    const userContext = useContext( UserDataContext );
    const { close, cardName } = props;

    const card = userContext.cardSlots[cardName];
    const diff = (card.difficulty == DIFFICULTIES.EASY) ? "Easy" : (card.difficulty == DIFFICULTIES.NORMAL) ? "Normal" : "Hard";
    const title = cardName == ("daily" ? "Daily" : diff) + " Card";
    return (
        <View style={styles.top}>
            <View style={styles.main}>
                <Text style={styles.titleText}>{ title }</Text>
            </View>
            <View style={styles.checkbox}>
                <Text>+</Text>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    top: {
        width: "100%",
        height: vh(8),
        marginBottom: vh(2),
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "red",
        borderRadius: vh(3.125)
    },
    main: {
        flex: 5,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    titleText: {
        fontSize: vh(3.5),
        textAlign: "left",
    },
    checkbox: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    }
});

export default CardSelectItem;
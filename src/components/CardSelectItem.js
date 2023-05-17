import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import { DIFFICULTIES } from "../objectives/BingoCardManager";

const CardSelectItem = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cards; // select theme

    const { cardName } = props;

	const close = () => {
		userContext.setSelectedCard(cardName);
		props.close();
	};

    const card = userContext.cardSlots[cardName];
    const diff = (card.difficulty == DIFFICULTIES.EASY) ? "Easy" : (card.difficulty == DIFFICULTIES.NORMAL) ? "Normal" : "Hard";
    const diffColor = THEME[diff.toLowerCase()];
    const title = (cardName == "daily" ? "Daily" : diff) + " Card";
    
	const completionPercent = card.getCompletionPercent();

	return (
        <TouchableOpacity style={[styles.top, {backgroundColor: diffColor}]} activeOpacity={1} onPress={close}>
            <View style={styles.main}>
                <Text style={styles.titleText}>{ title }</Text>
            </View>
			<View style={styles.completionStats}>
				<Text style={styles.percentText}>{ completionPercent }%</Text>
			</View>
        </TouchableOpacity>
    )
};

const styles = StyleSheet.create({
    top: {
        width: "100%",
        height: vh(10),
        marginBottom: vh(1),
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f5f5f5c0",
		borderColor: "black",
		borderWidth: 2,
        borderRadius: vh(3.125)
    },
    main: {
        flex: 4,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    titleText: {
		marginHorizontal: vw(5),
        fontSize: vh(3),
        textAlign: "left",
        fontFamily: "JosefinSans_400Regular_Italic"
    },
    completionStats: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
	percentText: {
		fontSize: vh(3),
		textAlign: "center",
        fontFamily: "JosefinSans_400Regular"
	}
});

export default CardSelectItem;
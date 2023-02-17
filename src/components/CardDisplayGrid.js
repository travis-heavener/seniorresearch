import { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal } from "react-native";
import { Themes } from "../config/Config";
import { vw, vh } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import { DIFFICULTIES } from "../objectives/BingoCardManager";
import CardSelectModal from "./CardSelectModal";

const CardDisplayGrid = (props) => {
    const [isModalVisible, setModalVisibility] = useState(false);

    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cardDisplay; // select theme
    
    const { cardName } = props;
    const card = userContext.cardSlots[ cardName ];

    // handle null cards with a button to display one
    const selectCard = () => {
        console.log("asdf");
        setModalVisibility(true);
    };

    if (userContext.selectedCard == null || card == null) {
        return (
            <TouchableOpacity style={styles.nullTop} activeOpacity={2/3} onPress={selectCard}>
                <Text style={styles.selectCardText}>+</Text>
                <CardSelectModal isModalVisible={isModalVisible} off={() => setModalVisibility(false)} />
            </TouchableOpacity>
        );
    }

    const difficultyName = card.difficulty == DIFFICULTIES.HARD ? "Hard" : card.difficulty == DIFFICULTIES.NORMAL ? "Normal" : "Easy";
    const difficultyColor = THEME.cards[difficultyName.toLowerCase()];
    const title = (cardName == "daily" ? "Daily" : difficultyName) + " Card";

    return (
        <View style={styles.top}>
            <View style={styles.titleWrapper}>
                <View style={[styles.difficultyIndicator, {backgroundColor: difficultyColor}]}></View>
                <Text style={styles.title}>{ title }</Text>
            </View>
            <View style={styles.grid}>
                { generateCardGrid(userContext.cardSlots[cardName], THEME) }
            </View>
        </View>
    );
};

export default CardDisplayGrid;

// generate the grid of cards
const generateRow = (r, card, THEME) => {
    let row = [];
    
    for (let c = 0; c < 5; c++) {
        let obj = card.grid[r][c];
        row.push(
            <View
                key={Math.random()} // random key just to ignore the error :)
                style={[
                    styles.tile, // default styling
                    {backgroundColor: (obj.isCompleted ? THEME.checkedTile : THEME.uncheckedTile)}, // checked color
                    (r == 0) ? {borderTopWidth: 2} : {}, (c == 0) ? {borderLeftWidth: 2} : {} // borders for top/left
                ]}
            >
                <Text numberOfLines={2} adjustsFontSizeToFit style={styles.tileText}>{obj.toString()}</Text>
            </View>
        );
    }

    return <View style={styles.row} key={Math.random()}>{row}</View>;
};

const generateCardGrid = (card, THEME) => [
    generateRow(0, card, THEME),
    generateRow(1, card, THEME),
    generateRow(2, card, THEME),
    generateRow(3, card, THEME),
    generateRow(4, card, THEME)
];

const styles = StyleSheet.create({
    nullTop: {
        width: vw(75),
        height: "35%",
        marginTop: vh(7.5),
        backgroundColor: "#0001",
        borderRadius: vw(3.5),
        borderWidth: 2.75,
        borderColor: "black",
        justifyContent: "center",
        alignItems: "center"
    },
    selectCardText: {
        fontSize: vh(4)
    },
    top: {
        width: "100%",
        justifyContent: "flex-start",
        alignItems: "center"
    },
    grid: {
        width: vw(85),
        aspectRatio: 1.2, // same as TasksScreenCard's grid
        borderColor: "black"
    },
    titleWrapper: {
        marginBottom: vh(1/2),
        flexDirection: "row",
        alignItems: "center"
    },
    difficultyIndicator: {
        height: (vw(85) / 14.4), // (width / 1.2) = height, height / 12 = width / 14.4
        aspectRatio: 1,
        marginRight: vw(1),
        borderRadius: 100000,
        borderWidth: 1.5,
        borderColor: "black"
    },
    title: {
        fontSize: (vw(85) / 14.4), // (width / 1.2) = height, height / 12 = width / 14.4
        textAlign: "center"
    },
    row: {
        flex: 1/5,
        flexDirection: "row"
    },
    tile: {
        flex: 1/5,
        borderColor: "black",
        justifyContent: "center",
        borderRightWidth: 2,
        borderBottomWidth: 2
    },
    tileText: {
        fontSize: vh(5/3),
        textAlign: "center"
    }
});
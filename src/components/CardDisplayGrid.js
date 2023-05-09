import { useIsFocused } from "@react-navigation/native";
import { useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Themes";
import { vw, vh } from "../config/Toolbox";
import { exportUserData, UserDataContext } from "../config/UserDataManager";
import { DIFFICULTIES } from "../objectives/BingoCardManager";
import CardDisplayTile from "./CardDisplayTile";
import CardSelectModal from "./CardSelectModal";
import ObjectiveConfirmModal from "./ObjectiveConfirmModal";

const CardDisplayGrid = (props) => {
    const [isModalVisible, setModalVisibility] = useState(false);

    // card objective modal
    const [objModalData, setObjModalData] = useState({isModalVisible: false, reject: null, confirm: null, obj: null});
    const closeObjModal = () => setObjModalData({isModalVisible: false, reject: null, confirm: null, obj: null});

    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cards; // select theme
    
    // triggers a remount every time the screen is refocused
    useIsFocused();

    // card selection modal
    const selectCard = () => {
        setModalVisibility(true);
        props.freezeGestures();
    };

    const modalOff = () => {
        setModalVisibility(false);
        props.unfreezeGestures();
    };
    
    // get card data
    const cardName = userContext.selectedCard;
    const card = userContext.cardSlots[ cardName ];

    // handle null cards with a button to display one
    if (userContext.selectedCard == null || card == null) {
        return (
            <TouchableOpacity style={styles.nullTop} activeOpacity={2/3} onPress={selectCard}>
                <Text style={styles.selectCardText}>+</Text>
                <CardSelectModal isModalVisible={isModalVisible} off={modalOff} />
            </TouchableOpacity>
        );
    }
    
    const diffName = card.difficulty == DIFFICULTIES.HARD ? "Hard" : card.difficulty == DIFFICULTIES.NORMAL ? "Normal" : "Easy";
    const diffColor = THEME[diffName.toLowerCase()];
    const title = (cardName == "daily" ? "Daily" : diffName) + " Card";

    // card grid generation
    // generate the grid of cards
    const generateRow = (r, card) => {
        let row = [];
        
        for (let c = 0; c < 5; c++) {
            const obj = card.grid[r][c];
            const onPress = (obj.objType == "FreeObjective") ? () => {} : () => {
                setObjModalData({
                    isModalVisible: true, obj: obj,
                    confirm: () => {
                        if (obj.triggerPlayerCompletion) obj.triggerPlayerCompletion(); // trigger player completion, if available
                        card.runCompletionChecks(userContext); // check for bingo completions
                        exportUserData(userContext); // export data because saving data is important
                        closeObjModal(); // close the modal & remount
                        props.unfreezeGestures(); // unfreeze swipe gestures
                    },
                    reject: () => {
                        closeObjModal() // just close the modal
                        props.unfreezeGestures(); // unfreeze swipe gestures
                    }
                });
                props.freezeGestures(); // freeze gestures
            };

            row.push(
                <CardDisplayTile key={c} onPress={onPress} row={r} col={c} obj={obj} />
            );
        }

        return <View style={styles.row} key={r}>{row}</View>;
    };

    const generateCardGrid = (card) => [
        generateRow(0, card), generateRow(1, card), generateRow(2, card), generateRow(3, card), generateRow(4, card)
    ];

    return (
        <View style={styles.top}>
            <ObjectiveConfirmModal {...objModalData} />

            <View style={styles.titleWrapper}>
                <View style={[styles.difficultyIndicator, {backgroundColor: diffColor}]}></View>
                <Text style={[styles.title, {color: THEME.labelText}]}>{ title }</Text>
            </View>
            <View style={styles.grid}>
                { generateCardGrid(userContext.cardSlots[cardName]) }
            </View>
        </View>
    );
};

export default CardDisplayGrid;

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
    tile: {
        flex: 1/5,
        justifyContent: "center",
        borderColor: "black",
        borderRightWidth: 2,
        borderBottomWidth: 2
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
        textAlign: "center",
        fontFamily: "Alata_400Regular"
    },
    row: {
        flex: 1/5,
        flexDirection: "row"
    }
});
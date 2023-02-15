import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Config";
import { vw, vh } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import { DIFFICULTIES } from "../objectives/BingoCardManager";

const CardDisplayGrid = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cardDisplay; // select theme

    return (
        <View style={styles.grid}>
            { generateCardGrid(userContext.cardSlots.daily, THEME) }
        </View>
    );
};

export default CardDisplayGrid;

// generate the grid of cards
const generateCardGrid = (card, THEME) => {
    // const difficultyName = card.difficulty == DIFFICULTIES.HARD ? "hard" : card.difficulty == DIFFICULTIES.NORMAL ? "normal" : "easy";
    
    const generateRow = r => {
        let row = [];

        for (let c = 0; c < 5; c++) {
            let obj = card.grid[r][c];

            row.push( // random key just to ignore the error :)
                <View
                    style={[
                        styles.objectiveTile,
                        {backgroundColor: (obj.isCompleted ? THEME.checkedTile : THEME.uncheckedTile)},
                        (r == 0) ? {borderTopWidth: 2} : {}, (c == 0) ? {borderLeftWidth: 2} : {}
                    ]}
                    key={Math.random()}
                >
                    <Text style={styles.objectiveText}>{obj.toString()}</Text>
                </View>
            );
        }
        return row;
    };

    let grid = [];
    for (let r = 0; r < 5; r++) {
        grid.push(
            <View style={styles.row} key={Math.random()}>
                { generateRow(r) }
            </View>
        );
    }

    return grid;
};

const styles = StyleSheet.create({
    grid: {
        width: vw(85),
        aspectRatio: 1.2, // same as TasksScreenCard's grid
        borderColor: "black"
    },
    row: {
        flex: 1,
        flexDirection: "row"
    },
    objectiveTile: {
        flex: 1,
        borderColor: "black",
        justifyContent: "center",
        borderRightWidth: 2,
        borderBottomWidth: 2
    },
    objectiveText: {
        fontSize: vh(8)/5.5,
        textAlign: "center"
    }
});
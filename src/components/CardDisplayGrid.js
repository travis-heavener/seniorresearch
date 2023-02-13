import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Config";
import { vw, vh } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

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
    const generateRow = r => {
        let row = [];

        for (let obj of card.grid[r]) {
            row.push( // random key just to ignore the error :)
                <View
                    style={[styles.objectiveTile, {backgroundColor: (obj.isCompleted ? THEME.checkedTile : "gray")}]}
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
        borderWidth: 2,
        borderColor: "black"
    },
    row: {
        width: "100%",
        height: "20%",
        flexDirection: "row"
    },
    objectiveTile: {
        width: "20%",
        height: "100%",
        borderColor: "black",
        justifyContent: "center",
        borderWidth: 1
    },
    objectiveText: {
        fontSize: vh(8)/5,
        textAlign: "center"
    }
});
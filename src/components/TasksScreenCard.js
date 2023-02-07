import React, { useState, useContext } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { createBingoCard, DIFFICULTIES } from "../BingoCardManager";
import { Themes } from "../Config";
import { exportUserData, UserDataContext } from "../SessionUserData";

// viewport height function to make life easier
import { vw, vh } from "../Toolbox";

// import images
const MEDIA_ROOT = "../../assets/media/";
const CARET_SRC = require(MEDIA_ROOT + "caretDown.png");

const TasksScreenCard = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].tasks; // select theme

    const [isContentOpen, setContentOpen] = useState(false);
    const toggleDisplay = () => setContentOpen(!isContentOpen);

    if (userContext.cardSlots[props.cardName]) {
        const card = userContext.cardSlots[props.cardName];
        const seed = card.randomSeed;
        const difficulty = (card.difficulty == DIFFICULTIES.EASY) ? "Easy" : (card.difficulty == DIFFICULTIES.NORMAL) ? "Normal" : "Hard";

        const generateGrid = () => {
            const generateRow = r => {
                let row = [];

                for (let obj of card.grid[r]) {
                    row.push( // random key just to ignore the error :)
                        <View style={[styles.objectiveTile, obj.isCompleted ? {backgroundColor: THEME.checkedTile} : {}]} key={Math.random()}>
                            <Text style={styles.objectiveTileText}>{obj.toString()}</Text>
                        </View>
                    );
                }

                return row;
            };

            let grid = [];
            for (let r = 0; r < 5; r++) {
                grid.push(
                    <View style={styles.objectiveRow} key={Math.random()}>
                        { generateRow(r) }
                    </View>
                );
            }
            return grid;
        };

        const removeCard = () => {
            userContext.cardSlots[props.cardName] = null;
            setContentOpen(false);
            exportUserData(userContext); // save data
            props.remount();
        };

        return (
            <View style={[styles.top, {height: isContentOpen ? vh(45) : vh(8)}]}>
                <TouchableOpacity onPress={toggleDisplay} activeOpacity={0.9} style={[styles.body, {backgroundColor: THEME.primary}]}>
                    <View style={styles.leftView}>
                        {/* <Text style={styles.titleText}>{ (props.cardName == "daily") ? "Daily" : "Custom" } Card</Text> */}
                        <Text style={styles.titleText}>{ (props.cardName == "daily") ? "Daily" : difficulty } Card</Text>
                        <Text style={styles.seedText}>#{ seed?.toString().padStart(6, "0") }</Text>
                    </View>
                    <View style={styles.rightView}>
                        <TouchableOpacity style={styles.rightBtn} onPress={removeCard}>
                            <Text style={styles.rightBtnText}>—</Text>
                        </TouchableOpacity>
                        <Image style={[styles.rightBtn, {transform: [{rotate: (180 * !isContentOpen) + "deg"}]}]} source={CARET_SRC} />
                    </View>
                </TouchableOpacity>
                <View style={[styles.cardDisplay, {backgroundColor: THEME.primaryAccent}, !isContentOpen ? {display: "none"} : {}]}>
                    <View style={styles.cardGrid}>
                        { generateGrid() }
                    </View>
                </View>
            </View>
        );
    } else {
        const addCard = () => {
            userContext.cardSlots[props.cardName] = createBingoCard(userContext); // with random difficulty
            exportUserData(userContext); // save data
            props.remount();
        };

        return (
            <View style={styles.body}>
                <View style={styles.leftView}>
                    <Text style={styles.seedText}>No Card</Text>
                </View>
                <View style={styles.rightView}>
                    <TouchableOpacity onPress={addCard} style={styles.rightBtn}>
                        <Text style={styles.rightBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
};

const styles = StyleSheet.create({
    top: {
        width: vw(100)
    },
    body: {
        width: vw(100),
        height: vh(8),
        paddingHorizontal: "2%",
        borderColor: "black",
        borderBottomWidth: 1,
        backgroundColor: "#f7bcbc",
        flexDirection: "row"
    },
    cardDisplay: {
        flex: 1,
        borderColor: "black",
        justifyContent: "center",
        borderBottomWidth: 1
    },
    cardGrid: {
        height: "90%",
        aspectRatio: 1.2,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#000"
    },
    objectiveRow: {
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
    objectiveTileText: {
        fontSize: vh(8)/5,
        textAlign: "center"
    },
    leftView: {
        flex: 0.6,
        flexDirection: "row"
    },
    titleText: {
        maxWidth: "50%",
        fontSize: vh(8)/3.75,
        color: "#111",
        textAlignVertical: "center"
    },
    seedText: {
        marginLeft: "1.5%",
        fontSize: vh(8)/4.25,
        color: "#444",
        fontStyle: "italic",
        textAlignVertical: "center"
    },
    rightBtn: {
        flex: 1/3,
        height: "75%",
        aspectRatio: 1,
        alignSelf: "center",
        justifyContent: "center"
    },
    rightBtnText: {
        fontSize: vh(8)/2,
        textAlign: "center"
    },
    rightView: {
        flex: 0.4,
        justifyContent: "flex-end",
        flexDirection: "row"
    }
});

export default TasksScreenCard;
import React, { useState, useContext, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { Themes } from "../config/Config";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vw, vh } from "../config/Toolbox";

// import images
const MEDIA_ROOT = "../../assets/media/";
const CARET_SRC = require(MEDIA_ROOT + "caretDown.png");

const TasksScreenCard = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].tasks; // select theme

    const [isContentOpen, setContentOpen] = useState(false);
    const toggleDisplay = () => {
        if (isContentOpen) closeContent();
        else openContent();
    };

    const openContent = () => {
        setContentOpen(true);
        props.setFocusedCard(props.cardName);
    };

    const closeContent = () => {
        setContentOpen(false);
        props.setFocusedCard(null);
    };

    useEffect(
        () => {
            if (props.focusedCard != props.cardName) {
                setContentOpen(false);
            }
        }, [props.focusedCard]
    );

    if (userContext.cardSlots[props.cardName]) {
        const card = userContext.cardSlots[props.cardName];
        const seed = card.randomSeed;
        const difficulty = (card.difficulty == DIFFICULTIES.EASY) ? "Easy" : (card.difficulty == DIFFICULTIES.NORMAL) ? "Normal" : "Hard";

        const generateGrid = () => {
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

        const difficultyName = card.difficulty == DIFFICULTIES.HARD ? "hard" : card.difficulty == DIFFICULTIES.NORMAL ? "normal" : "easy";

        return (
            <View style={[styles.top, {height: isContentOpen ? vh(45) : vh(8)}, {backgroundColor: THEME.cards[difficultyName]}]}>
                <TouchableOpacity
                    onPress={toggleDisplay} activeOpacity={1}
                    style={[styles.body, {backgroundColor: THEME.primary}]}
                >
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
                <View style={[styles.cardDisplay, {backgroundColor: THEME.cards[difficultyName]}, !isContentOpen ? {display: "none"} : {}]}>
                    <View style={styles.cardGrid}>
                        { generateGrid() }
                    </View>
                </View>
            </View>
        );
    } else {
        const addCard = () => {
            // daily is ALWAYS normal difficulty
            let difficulty = props.cardName == "daily" ? DIFFICULTIES.NORMAL : undefined; // undefined is overwritten by random in method
            userContext.cardSlots[props.cardName] = createBingoCard(userContext, difficulty); // with random difficulty
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
        borderColor: "#383838",
        borderBottomWidth: 2,
        backgroundColor: "#f7bcbc",
        flexDirection: "row"
    },
    cardDisplay: {
        flex: 1,
        justifyContent: "center",
        borderColor: "#383838",
        borderBottomWidth: 2
    },
    cardGrid: {
        height: "90%",
        aspectRatio: 1.2,
        backgroundColor: "black", // this fixes minor hitches in borders
        alignSelf: "center",
        borderColor: "black"
    },
    objectiveRow: {
        flex: 1,
        flexDirection: "row"
    },
    objectiveTile: {
        flex: 1,
        borderColor: "black",
        justifyContent: "center",
        backgroundColor: "#f7bcbc",
        borderRightWidth: 2,
        borderBottomWidth: 2
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
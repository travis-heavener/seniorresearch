import React, { useState, useContext, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, Animated } from "react-native";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { Themes } from "../config/Config";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vw, vh } from "../config/Toolbox";
import Checkbox from "./Checkbox";

// import images
const MEDIA_ROOT = "../../assets/media/";
const CARET_SRC = require(MEDIA_ROOT + "caretDown.png");

const TasksScreenCard = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].tasks; // select theme

    const [isSelected, setSelected] = useState(false);
    const [isContentOpen, setContentOpen] = useState(false);
    const toggleDisplay = () => {
        if (isContentOpen)
			closeContent();
        else
			openContent();
    };

    const openContent = () => {
        setContentOpen(true);
        props.setFocusedCard(props.cardName);
    };

    const closeContent = () => {
        setContentOpen(false);
        props.setFocusedCard(null);
    };

	// Animated.View animated transition
	// https://reactnative.dev/docs/animated
	const heightAnim = useRef(new Animated.Value(0)).current;
	const opacityAnim = useRef(new Animated.Value(0)).current;

	useEffect(
		() => {
			Animated.timing(heightAnim, {
				toValue: vh(8 + 42*(isContentOpen+0)),
				duration: 250,
				useNativeDriver: false
			}).start();
			Animated.timing(opacityAnim, {
				toValue: isContentOpen ? 1 : 0,
				duration: 250,
				useNativeDriver: false
			}).start();
		}, [isContentOpen]
	);

	// hide card if another card is focused in the menu
    useEffect(
        () => {
            if (props.focusedCard != props.cardName) {
                setContentOpen(false);
            }
        }, [props.focusedCard]
    );

    // uncheck selected box if modified by other card component
    useEffect(
        () => setSelected( userContext.selectedCard == props.cardName ),
        [userContext.selectedCard]
    );

    if (userContext.cardSlots[props.cardName]) {
        const card = userContext.cardSlots[props.cardName];
        const seed = card.randomSeed;
        const difficulty = (card.difficulty == DIFFICULTIES.EASY) ? "Easy" : (card.difficulty == DIFFICULTIES.NORMAL) ? "Normal" : "Hard";
        const difficultyName = difficulty.toLowerCase();

        const generateRow = r => {
            let row = [];
            
            for (let c = 0; c < 5; c++) {
                let obj = card.grid[r][c];
                row.push(
                    <View
                        key={c} // random key just to ignore the error :)
                        style={[
                            styles.objectiveTile, // default styling
                            {backgroundColor: (obj.isCompleted ? THEME.checkedTile : THEME.uncheckedTile)}, // checked color
                            (r == 0) ? {borderTopWidth: 2} : {}, (c == 0) ? {borderLeftWidth: 2} : {} // borders for top/left
                        ]}
                    >
                        <Animated.Text style={styles.objectiveTileText}>{obj.toString()}</Animated.Text>
                    </View>
                );
            }

            return <View style={styles.objectiveRow} key={r}>{row}</View>;
        };

        const generateGrid = () => [generateRow(0), generateRow(1), generateRow(2), generateRow(3), generateRow(4)];

        const removeCard = () => {
            userContext.cardSlots[props.cardName] = null;
            setContentOpen(false);

            if (userContext.selectedCard == props.cardName)
                userContext.setSelectedCard(null);

            exportUserData(userContext); // save data
            props.remount();
        };

        const selectCard = () => {
            if (userContext.selectedCard == props.cardName) {
                userContext.setSelectedCard(null);
                setSelected(false);
            } else {
                userContext.setSelectedCard(props.cardName);
                setSelected(true);
            }
        };

        return (
            <Animated.View style={[styles.top, {backgroundColor: THEME.cards[difficultyName], height: heightAnim}]}>
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
                <Animated.View style={[
					styles.cardDisplay,
					{
						backgroundColor: THEME.cards[difficultyName], display: (isContentOpen ? "flex" : "none"), opacity: opacityAnim
					}]}
				>
                    <View style={styles.cardGrid}>
                        { generateGrid() }
                    </View>
                    <TouchableOpacity style={styles.selectButton} onPress={selectCard} activeOpacity={0.75}>
                        <Text style={styles.selectButtonText}>Select Card</Text>
                        {/* checkbox here */}
                        <Checkbox isChecked={ isSelected } />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
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
        alignItems: "center",
        justifyContent: "space-evenly",
        borderColor: "#383838",
        borderBottomWidth: 2
    },
    cardGrid: {
        height: "81%",
        aspectRatio: 1.2,
        backgroundColor: "black", // this fixes minor hitches in borders
        alignSelf: "center",
        borderColor: "black"
    },
    objectiveRow: {
        flex: 1/5,
        alignItems: "stretch",
        flexDirection: "row"
    },
    objectiveTile: {
        flex: 1/5,
        borderColor: "black",
        justifyContent: "center",
        backgroundColor: "#f7bcbc",
        borderRightWidth: 2,
        borderBottomWidth: 2
    },
    objectiveTileText: {
		fontSize: vh(1.6),
        textAlign: "center"
    },
    selectButton: {
        height: "12%",
        paddingHorizontal: "3%",
        alignItems: "center",
        flexDirection: "row",
		backgroundColor: "#fff7",
		borderColor: "black",
		borderWidth: 2,
		borderRadius: 250
    },
    selectButtonText: {
        textAlign: "center",
        fontSize: vh(2.125)
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
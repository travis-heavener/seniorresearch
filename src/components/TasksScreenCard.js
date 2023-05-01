import React, { useState, useContext, useEffect, useRef } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Image, Animated } from "react-native";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { Themes } from "../config/Themes";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

// viewport height function to make life easier
import { vw, vh, generateDailySeed } from "../config/Toolbox";
import Checkbox from "./Checkbox";
import ScalingText from "./ScalingText";

// import images
const MEDIA_ROOT = "../../assets/media/";
const CARET_SRC = require(MEDIA_ROOT + "caretDown.png");

const TasksScreenCard = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].tasks; // select theme
    const CARDS_THEME = Themes[ userContext.selectedTheme ].cards; // select cards theme

    const bodyBackgroundColor = props.cardName == "custom1" ? CARDS_THEME.easy
        : props.cardName == "custom2" ? CARDS_THEME.normal
        : props.cardName == "custom3" ? CARDS_THEME.hard
        : THEME.primary; // for daily card

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

	useEffect(
		() => {
			Animated.timing(heightAnim, {
				toValue: isContentOpen ? 0 : -vh(6),
				duration: 250,
				useNativeDriver: true
			}).start();
		}, [isContentOpen]
	);

	// hide card if another card is focused in the menu
    useEffect(
        () => {
            if (props.focusedCard != props.cardName && isContentOpen)
                setContentOpen(false);
        }, [props.focusedCard]
    );

    // uncheck selected box if modified by other card component
    useEffect(
        () => {
            if (userContext.selectedCard == props.cardName && !isSelected)
                setSelected( true );
            else if (userContext.selectedCard !== props.cardName && isSelected)
                setSelected( false );
        }, [userContext.selectedCard]
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
                            {backgroundColor: (obj.isCompleted ? CARDS_THEME.checkedTile : CARDS_THEME.uncheckedTile)}, // checked color
                            // (r == 0) ? {borderTopWidth: TILE_BORDER_WIDTH} : {}, (c == 0) ? {borderLeftWidth: TILE_BORDER_WIDTH} : {} // borders for top/left
                        ]}
                    >
                        <ScalingText maxLineLength={12}>{obj.toString(userContext)}</ScalingText>
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
            <Animated.View style={[styles.top, {height: vh(7.5 + 42*(isContentOpen+0))}]}>
                <TouchableOpacity
                    onPress={toggleDisplay} activeOpacity={1}
                    style={[styles.body, {backgroundColor: bodyBackgroundColor}]}
                >
                    <View style={styles.leftView}>
                        {/* <Text style={styles.titleText}>{ (props.cardName == "daily") ? "Daily" : "Custom" } Card</Text> */}
                        <Text style={styles.titleText}>{ (props.cardName == "daily") ? "Daily" : difficulty } Card</Text>
                        <Text style={styles.seedText}>#{ seed?.toString().padStart(6, "0") }</Text>
                    </View>
                    <View style={styles.rightView}>
                        {
							(props.cardName != "daily") ? (
								<TouchableOpacity style={styles.rightBtn} onPress={removeCard}>
									<Text style={styles.rightBtnText}>—</Text>
								</TouchableOpacity>
							) : null

						}
                        <Image style={[styles.rightBtn, {transform: [{rotate: (180 * !isContentOpen) + "deg"}]}]} source={CARET_SRC} />
                    </View>
                </TouchableOpacity>
                <Animated.View style={[
					styles.cardDisplay,
					{
						backgroundColor: CARDS_THEME[difficultyName], display: (isContentOpen ? "flex" : "none"),
                        opacity: isContentOpen+0, // <-- this works in place of opacityAnim as well (hides weird circle)
                        transform: [ { translateY: heightAnim } ], zIndex: -100
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
            // daily is ALWAYS normal difficulty, custom 1-3 have difficulties now too :)
            let difficulty = props.cardName == "daily" ? DIFFICULTIES.NORMAL
            : props.cardName == "custom1" ? DIFFICULTIES.EASY
            : props.cardName == "custom2" ? DIFFICULTIES.NORMAL
            : props.cardName == "custom3" ? DIFFICULTIES.HARD
            : undefined; // undefined is overwritten by random in method

            let seed = props.cardName == "daily" ? generateDailySeed() : undefined; // undefined is overwritten by random seed
            userContext.cardSlots[props.cardName] = createBingoCard(userContext, difficulty, seed); // with random difficulty
            exportUserData(userContext); // save data
            props.remount(); // force a parent screen remount
        };

        return (
            <View style={[styles.body, {backgroundColor: bodyBackgroundColor}]}>
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
        width: vw(100),
        zIndex: 1000
    },
    body: {
        width: vw(100),
        height: vh(7.5),
        paddingHorizontal: "2%",
        borderColor: "#303030",
        borderBottomWidth: vh(0.26),
        backgroundColor: "#f7bcbc",
        flexDirection: "row"
    },
    cardDisplay: {
        flex: 1,
        marginTop: -1, // this just fixes some weird antialiasing issue with the border width of components above this
        alignItems: "center",
        justifyContent: "space-evenly",
        borderColor: "#383838",
        borderBottomWidth: vh(0.26)
    },
    cardGrid: {
        height: "82.2%", // 81% + 2x padding (0.6%)
        aspectRatio: 1.2,
        padding: "0.6%",
		backgroundColor: "black", // this fixes minor hitches in borders
		justifyContent: "space-between",
        alignSelf: "center",
        borderColor: "black"
    },
    objectiveRow: {
        flex: 0.195,
        alignItems: "stretch",
        flexDirection: "row",
		justifyContent: "space-between"
    },
    objectiveTile: {
        flex: 0.195,
        borderColor: "black",
        justifyContent: "center",
        backgroundColor: "#f7bcbc"
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
		borderWidth: vh(.26),
		borderRadius: 250
    },
    selectButtonText: {
        textAlign: "center",
        fontSize: vh(2.125),
        fontFamily: "JosefinSans_400Regular"
    },
    leftView: {
        flex: 0.6,
        flexDirection: "row"
    },
    titleText: {
        maxWidth: "50%",
        fontSize: vh(8)/3.75,
        color: "#111",
        fontFamily: "Alata_400Regular",
        textAlignVertical: "center"
    },
    seedText: {
        marginLeft: "1.5%",
        fontSize: vh(8)/4.25,
        color: "#444",
        fontFamily: "JosefinSans_400Regular_Italic",
        textAlignVertical: "center"
    },
    rightBtn: {
        flex: 1/3.25,
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
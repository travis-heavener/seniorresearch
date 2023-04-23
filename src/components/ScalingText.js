import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

/* Splits text onto two lines if the raw text exceeds props.maxLineLength */
const ScalingText = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cardDisplay;

    const rawText = props.children;
    const numOfWords = rawText.split(" ").length; // number of words
    const { maxLineLength } = props;

    // if more than x chars in the text, split on the nearest space to middle word
    const middleInd = Math.floor(rawText.length/2);
    let lines = [ rawText ];

    // if middle char isn't a space and the line is too long and there's more than one word
    if (rawText[middleInd] != " " && rawText.length > maxLineLength && numOfWords > 1) {
        // find nearest space-character index
        let rightInd = Infinity, leftInd = -Infinity;

        // check right
        rightCheck:
        for (let i = middleInd+1; i < rawText.length; i++) {
            if (rawText[i] == " ") {
                rightInd = i;
                break rightCheck;
            }
        }

        // check right
        leftCheck:
        for (let i = middleInd-1; i >= 0; i--) {
            if (rawText[i] == " ") {
                leftInd = i;
                break leftCheck;
            }
        }
        
        const rightDist = rightInd - middleInd;
        const leftDist = middleInd - leftInd;

        if (rightDist <= leftDist) {
            // split on next word
            lines = [
                rawText.substring(0, rightInd),
                rawText.substring(rightInd+1)
            ];
        } else {
            // split on prev word
            lines = [
                rawText.substring(0, leftInd),
                rawText.substring(leftInd+1)
            ];
        }
    // if middle char is a space and the line is too long and more than one word
    } else if (rawText[middleInd] == " " && rawText.length > maxLineLength && numOfWords > 1) {
        lines = [
            rawText.substring(0, middleInd),
            rawText.substring(middleInd+1)
        ];
    // if line is too long and more than one word
    } else if (rawText.length > maxLineLength && numOfWords == 1) {
        lines = [
            rawText.substring(0, middleInd) + "-", // hyphenate
            rawText.substring(middleInd+1)
        ];
    }

    const TextWrap = ({children}) => <Text adjustsFontSizeToFit={true} numberOfLines={1} style={[styles.text, {color: THEME.textColor}]}>{ children }</Text>

    return (
        <View style={styles.top}>
            {
                lines.map(l => <TextWrap key={l}>{l}</TextWrap>)
            }
        </View>
    );
};

const styles = StyleSheet.create({
    top: {
        flex: 1,
        justifyContent: "center",
        marginHorizontal: "5%"
    },
    text: {
        maxHeight: vh(10/3), // twice the preset fontSize
        textAlignVertical: "center",
        fontSize: vh(5/3),
        fontWeight: "500",
        textAlign: "center"
    }
});

export default ScalingText;
import { useFocusEffect, useIsFocused } from "@react-navigation/core";
import { useCallback, useContext, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { eventEmitter } from "../../config/Main";
import { Themes } from "../../config/Themes";
import { formatCommas, vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";

const ProfileStat = (props) => {
    const { name } = props;
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;
    
    const ThemedText = (props) => <Text {...props} style={[props.style, {color: THEME.text}]}>{props.children}</Text>;
    
    // body text
    const refreshText = () => {
        const md = userContext.metadata, st = userContext.stats;
        let text = "", val = "";

        if (name == "steps") {
            text = "Steps", val = formatCommas( st.lifetimeSteps + md.steps );
        } else if (name == "distance") {
            text = "Traveled", val = formatCommas( ((st.lifetimeDistance + md.distance)/1000).toFixed(1) ) + "km";
        } else if (name == "cards") {
            text = "Cards Completed", val = st.lifetimeCards;
        } else if (name == "bingos") {
            text = "Bingos", val = st.lifetimeBingos;
        } else if (name == "xp") {
            text = "Total XP", val = st.getTotalXP();
        }
        
        return {desc: text, val: val};
    }
    
    const [text, setText] = useState(refreshText());
    
    // on screen focus
    useFocusEffect(
        useCallback(
            () => {
                // event emitters
                const func = () => {
                    setText( refreshText() );
                };

                eventEmitter.addListener("remountProfile", func);
                return () => eventEmitter.removeListener("remountProfile", func);
            }, [props]
        )
    );

    return (
        <View style={styles.singleStatView}>
            <ThemedText adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsText}>{text.desc}:</ThemedText>
            <ThemedText adjustsFontSizeToFit={true} numberOfLines={1} style={styles.statsVariable}>{text.val}</ThemedText>
        </View>
    )
};

export default ProfileStat;

const styles = StyleSheet.create({
    singleStatView: {
        width: "100%",
        height: vh(4),
        alignItems: "center",
        justifyContent: "space-between",
        flexDirection: "row"
    },
    statsText: {
        flex: 1,
        fontSize: vh(1.75),
        fontFamily: "JosefinSans_500Medium",
        textAlign: "left"
    },
    statsVariable: {
        maxWidth: "33%",
        minWidth: "25%",
        fontSize: vh(1.75),
        fontFamily: "JosefinSans_500Medium",
        fontStyle: "italic",
        textAlign: "right"
    }
});
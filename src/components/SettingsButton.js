import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const SettingsButton = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    const MISC_THEME = Themes[ userContext.selectedTheme ].misc; // select theme

    return (
        <View style={[styles.body, {borderBottomColor: THEME.primaryAccent}]}>
            <Text style={[styles.desc, {color: THEME.text}]}>{props.text}</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, {backgroundColor: MISC_THEME.switchColor, borderColor: MISC_THEME.switchBorderColor}]}
                    onPress={props.onPress} activeOpacity={0.8}
                >
                    <Text style={styles.buttonText}>GO</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    body: {
        width: vw(100),
        height: vh(8),
        paddingHorizontal: vw(5),
        flexDirection: "row",
        borderBottomWidth: vh(0.26)
    },
    desc: {
        flex: 0.825,
        fontSize: vh(1.875),
        fontWeight: "500",
        alignSelf: "center"
    },
    buttonContainer: {
        flex: 0.175,
        backgroundColor: "#f5f5f5",
        borderRadius: vh(50),
        justifyContent: "center",
        alignSelf: "center",
        alignItems: "center"
    },
    button: {
        width: "100%",
        height: "63.5%",
        borderWidth: vh(0.36),
        borderRadius: vh(50)
    },
    buttonText: {
        flex: 1,
        textAlignVertical: "center",
        textAlign: "center",
        fontSize: vh(2),
        fontWeight: "600",
        color: "whitesmoke"
    }
});

export default SettingsButton;
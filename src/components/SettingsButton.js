import { useContext } from "react";
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const SettingsButton = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme

    return (
        <View style={[styles.body, {borderBottomColor: THEME.primaryAccent}]}>
            <TouchableOpacity activeOpacity={0.67} onPress={props.onPress}>
                <Text style={[styles.desc, {color: THEME.textButtonColor}]}>{props.text}</Text>
            </TouchableOpacity>
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
        flex: 1,
        fontSize: vh(1.875),
        textAlignVertical: "center",
        fontFamily: "JosefinSans_700Bold",
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
        fontFamily: "JosefinSans_600SemiBold"
    }
});

export default SettingsButton;
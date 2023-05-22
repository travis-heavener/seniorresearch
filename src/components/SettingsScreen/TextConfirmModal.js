import { useContext, useEffect, useState } from "react";
import { View, Modal, StyleSheet, Text, Pressable, TextInput, BackHandler } from "react-native";
import { Themes } from "../../config/Themes";
import { generateRandomString, vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";

const STRING_LENGTH = 6;

const TextConfirmModal = (props) => {
    const {reject, confirm, isModalVisible} = props;
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings; // select theme
    const MISC_THEME = Themes[ userContext.selectedTheme ].misc; // select theme

    const [fieldText, setFieldText] = useState("");
    const [randomText, setRandomText] = useState(generateRandomString(STRING_LENGTH));
    
    // regenerate text upon loading of new modal
    useEffect(() => {
        if (isModalVisible)
            setRandomText(generateRandomString(STRING_LENGTH));
    }, [isModalVisible])

    const submit = () => {
        if (fieldText == randomText)
            confirm();
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={reject}
        >
            <Pressable style={styles.absolute} onPress={reject} />

            <View style={[styles.body, {backgroundColor: THEME.modalTop, borderColor: THEME.modalBorder}]}>
                <View style={styles.top}>
                    <Text style={[styles.headerText, {color: THEME.modalText}]}>Reset User Data?</Text>
                    <Text style={[styles.descText, {color: THEME.modalText}]}>Enter the following to confirm:</Text>
                    <Text style={[styles.randomText, {color: THEME.modalText}]}>{ randomText }</Text>
                </View>
                <View style={[styles.bottom, {backgroundColor: THEME.modalBottom}]}>
                    <TextInput
                        autoCapitalize="characters" numberOfLines={1} keyboardType="default" maxLength={STRING_LENGTH}
                        style={styles.textInput} onChangeText={t => setFieldText(t)} value={fieldText} 
                    />
                    <Pressable style={[styles.submitButton, {backgroundColor: MISC_THEME.switchColor, borderColor: MISC_THEME.switchBorderColor}]} onPress={submit}>
                        <Text style={styles.submitText}>Submit</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
};

const styles = StyleSheet.create({
    absolute: {
        position: "absolute", 
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0004"
    },
    body: {
        width: vw(75),
        height: vh(33),
        marginHorizontal: vw(25/2),
        marginTop: vh(30),
        marginBottom: vh(37),
        overflow: "hidden",
        borderRadius: vh(4),
        borderWidth: vh(0.52)
    },
    top: {
        flex: 0.67,
        width: "90%",
        marginHorizontal: "5%",
        justifyContent: "center"
    },
    headerText: {
        textAlign: "center",
        fontSize: vh(3),
        marginBottom: vh(1),
        fontFamily: "JosefinSans_700Bold"
    },
    descText: {
        textAlign: "center",
        fontSize: vh(2),
        fontFamily: "JosefinSans_400Regular"
    },
    randomText: {
        textAlign: "center",
        fontSize: vh(2.25),
        letterSpacing: vw(0.25),
        fontWeight: "600"
    },
    bottom: {
        flex: 0.33,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center"
    },
    textInput: {
        flex: 0.6,
        height: vh(5.25),
        paddingHorizontal: "5%",
        borderRadius: vh(1.5),
        borderColor: "#222",
        borderWidth: vh(0.25),
        backgroundColor: "whitesmoke",
        fontSize: vh(2),
        color: "#222"
    },
    submitButton: {
        flex: 0.25,
        height: vh(5.25),
        borderWidth: vh(0.26),
        borderRadius: vh(1)
    },
    submitText: {
        flex: 1,
        fontSize: vh(2),
        fontWeight: "500",
        textAlign: "center",
        textAlignVertical: "center",
        color: "whitesmoke"
    }
});

export default TextConfirmModal;
import { useEffect, useState } from "react";
import { View, Modal, StyleSheet, Text, Pressable, TextInput, BackHandler } from "react-native";
import { generateRandomString, vh, vw } from "../config/Toolbox";

const STRING_LENGTH = 6;

const TextConfirmModal = (props) => {
    const {reject, confirm, isModalVisible} = props;

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

            <View style={styles.body}>
                <View style={styles.top}>
                    <Text>{ randomText }</Text>
                </View>
                <View style={styles.bottom}>
                    <TextInput
                        autoCapitalize="characters" numberOfLines={1} keyboardType="default" maxLength={STRING_LENGTH}
                        style={styles.textInput} onChangeText={t => setFieldText(t)} value={fieldText} 
                    />
                    <Pressable style={styles.submitButton} onPress={submit}>
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
        backgroundColor: "red"
    },
    top: {
        flex: 0.67,
        width: "100%",
        backgroundColor: "yellow"
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
        backgroundColor: "red"
    },
    submitText: {
        flex: 1,
        fontSize: vh(2),
        fontWeight: "500",
        textAlign: "center",
        textAlignVertical: "center",
        color: "whitesmoke"
    },
    bottom: {
        flex: 0.33,
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        alignItems: "center",
        backgroundColor: "blue"
    }
});

export default TextConfirmModal;
import { useContext, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Settings } from "../config/Config";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { exportUserData, UserDataContext } from "../config/UserDataManager";

const UsernameChangeModal = (props) => {
    const { modalReject, modalConfirm } = props;
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings;

    const [fieldText, setFieldText] = useState("Player");
    const textInputRef = useRef();

    const submit = async () => {
        if (fieldText.length < Settings.MIN_USERNAME_LEN || fieldText.length > Settings.MAX_USERNAME_LEN) {
            console.log("Invalid text");
            return;
        }
        
        userContext.stats.setUsername( fieldText );
        await exportUserData(userContext);

        textInputRef.current.blur();
        modalConfirm();
    };

    return (
        <Modal
            onRequestClose={modalReject}
            transparent={true}
            visible={props.isModalVisible}
        >
            <Pressable style={styles.absolute} onPress={modalReject} />

            <View style={[styles.top, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalTop}]}>
                <Text style={[styles.headerText, {color: THEME.modalText}]}>Change Name</Text>

                <View style={styles.textInputView}>
                    <TextInput
                        ref={textInputRef}
                        autoCapitalize="words" numberOfLines={1} keyboardType="default" maxLength={Settings.MAX_USERNAME_LEN}
                        style={styles.textInput} onChangeText={t => setFieldText(t)} value={fieldText} />
                    
                    <Pressable style={[styles.button, {backgroundColor: THEME.modalConfirm}]} onPress={submit}>
                        <Text style={[styles.buttonText, {color: THEME.modalText}]}>Submit</Text>
                    </Pressable>
                    </View>
            </View>
        </Modal>
    );
};

export default UsernameChangeModal;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0007"
    },
    top: {
        width: vw(75),
        height: vh(25),
        marginVertical: vh(75/2),
        alignSelf: "center",
        alignItems: "center",
        borderRadius: vh(4),
        borderWidth: vh(0.5)
    },
    headerText: {
        marginTop: vh(3),
        fontSize: vh(3.5),
        textAlign: "center",
        fontFamily: "JosefinSans_600SemiBold"
    },
    textInputView: {
        position: "absolute",
        top: vh(12.5),
        width: "85%",
        height: vh(5.25),
        justifyContent: "space-between",
        flexDirection: "row"
    },
    textInput: {
        flex: 0.7,
        height: vh(5.25),
        paddingHorizontal: "3.33%",
        borderRadius: vh(1.5),
        borderColor: "#222",
        borderWidth: vh(0.25),
        backgroundColor: "whitesmoke",
        fontFamily: "Alata_400Regular",
        fontSize: vh(2),
        color: "#222"
    },
    button: {
        flex: 0.275,
        height: vh(5.25),
        borderRadius: vh(1),
        borderWidth: vh(0.26)
    },
    buttonText: {
        flex: 1,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: vh(2),
        fontWeight: "600"
    }
});
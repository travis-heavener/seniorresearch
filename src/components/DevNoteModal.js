import { useContext } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const DevNoteModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings;

    return (
        <Modal
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={props.close}
        >
            <Pressable style={styles.absolute} onPress={props.close} />

            <View style={[styles.body, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalTop}]}>
                <Text style={[styles.header, {color: THEME.modalText}]}>Dev's Note</Text>
                <Text style={[styles.bodyText, {color: THEME.modalText}]}>
                    Exercise caution during use.{"\n"}
                    Pay attention to your surroundings and respect the privacy of others.{"\n"}
                    Do not play while operating a vehicle.
                </Text>
                <Pressable style={[styles.button, {backgroundColor: THEME.modalConfirm}]} onPress={props.close}>
                    <Text style={[styles.buttonText, {color: THEME.modalText}]}>Dismiss</Text>
                </Pressable>
            </View>
        </Modal>
    )
};

export default DevNoteModal;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#0007"
    },
    body: {
        width: vw(75),
        height: vh(27),
        marginVertical: vh(75/2),
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "space-evenly",
        borderRadius: vh(4),
        borderWidth: vh(0.5)
    },
    header: {
        textAlign: "center",
        fontSize: vh(2.5),
        fontFamily: "JosefinSans_700Bold"
    },
    bodyText: {
        textAlign: "center",
        fontSize: vh(1.75),
        fontFamily: "Alata_400Regular"
    },
    button: {
        width: vw(21),
        height: vh(5.25),
        borderRadius: vh(1),
        borderWidth: vh(0.26),
        justifyContent: "center"
    },
    buttonText: {
        textAlign: "center",
        fontSize: vh(2),
        fontFamily: "Alata_400Regular"
    }
});
import { useContext } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const PauseModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings;

    return (
        <Modal
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={props.close}
        >
            <Pressable onPress={props.close} style={styles.absolute} />
            <Pressable onPress={props.close} style={[styles.body, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalTop}]}>
                <Text style={[styles.headerText, {color: THEME.modalText}]}>Paused</Text>
                <Text style={[styles.subText, {color: THEME.modalText}]}>All sensors & features are paused</Text>
                <Text style={[styles.subText, {color: THEME.modalText}]}>Tap anywhere to resume</Text>
            </Pressable>
        </Modal>
    );
};

export default PauseModal;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#0008"
    },
    body: {
        position: "absolute",
        left: vw(15),
        right: vw(15),
        top: vh(35),
        bottom: vh(35),
        paddingHorizontal: vw(3),
        paddingTop: vh(2),
        paddingBottom: vh(7), // more bottom padding to adjust text positioning
        borderWidth: vh(0.52),
        borderRadius: vh(5),
        justifyContent: "space-evenly"
    },
    headerText: {
        fontSize: vh(4),
        textAlign: "center",
        fontFamily: "JosefinSans_600SemiBold"
    },
    subText: {
        fontSize: vh(2),
        lineHeight: vh(2.5),
        textAlign: "center",
        fontFamily: "JosefinSans_400Regular"
    }
});
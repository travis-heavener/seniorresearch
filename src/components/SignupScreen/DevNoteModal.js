import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { eventEmitter } from "../../config/Main";
import { Themes } from "../../config/Themes";
import { vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";

const DevNoteModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].settings;

    // toggle visibility with eventEmitters (faster than remounting from swipe navigator; avoid this in the future)
    const [isVisible, setVisible] = useState(false);
    
    const show = () => {
        // console.log("Showing");
        props.freezeGestures();
        setVisible(true);
    };

    const hide = () => {
        // console.log("Hiding");
        props.unfreezeGestures();
        setVisible(false);
    };

    // toggle listeners
    useFocusEffect(
        useCallback(() => {
            eventEmitter.removeAllListeners("toggleDevNote");
            eventEmitter.addListener("toggleDevNote", () => isVisible ? hide() : show());

            show(); // show on focus
        }, [props])
    );

    return (
        <Modal
            transparent={true}
            visible={isVisible}
            onRequestClose={hide}
        >
            <Pressable style={styles.absolute} onPress={hide} onTouchStart={props.freezeGestures}/>

            <View style={[styles.body, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalTop}]} onTouchStart={props.freezeGestures}>
                <Text style={[styles.header, {color: THEME.modalText}]}>Dev's Note</Text>
                <Text style={[styles.bodyText, {color: THEME.modalText}]}>
                    Exercise caution during use.{"\n"}
                    Pay attention to your surroundings and respect the privacy of others.{"\n"}
                    Do not play while operating a vehicle.
                </Text>
                <Pressable style={[styles.button, {backgroundColor: THEME.modalConfirm}]} onPress={hide}>
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
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { toTitleCase, vh, vw } from "../config/Toolbox";

const ObjectiveConfirmModal = (props) => {
    const confirm = () => {
        if (props.reject == null)
            console.warn("Modal confirmation func is null.")
        else
            props.confirm();
    };

    const reject = () => {
        if (props.reject == null)
            console.warn("Modal rejection func is null.")
        else
            props.reject();
    };

    let objText = props.obj?.toString() ?? "Text"; // the "toString" has the toTitleCase called within (see CardObjective.js)
    if (props.obj?.triggerPlayerCompletion) objText = "Find a " + objText;

    return (
        <Modal
            animationType="none"
            onRequestClose={reject}
            transparent={true}
            visible={props.isModalVisible}
        >
            <TouchableOpacity style={styles.absolute} onPress={reject} activeOpacity={1} />
            
            <View style={styles.top}>
                <Text style={styles.titleText}>Objective:</Text>
                <Text style={styles.objText}>{ objText }</Text>
            </View>
        </Modal>
    )
};

export default ObjectiveConfirmModal;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        width: vw(100),
        height: vh(100),
        backgroundColor: "#0003"
    },
    top: {
        flex: 1,
        marginHorizontal: vw(20),
        marginVertical: vh(33),
        backgroundColor: "red"
    },
    titleText: {
        fontSize: vh(3),
        textAlign: "center"
    },
    objText: {
        fontSize: vh(2),
        textAlign: "center"
    }
});
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { vh, vw } from "../config/Toolbox";

const ObjectiveConfirmModal = (props) => {
    // console.log(props.obj?.displayText);
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

    const objText = props.obj?.displayText ?? "Text";

    return (
        <Modal
            animationType="none"
            onRequestClose={reject}
            transparent={true}
            visible={props.isModalVisible}
        >
            <TouchableOpacity style={styles.absolute} onPress={reject} activeOpacity={1} />
            
            <View style={styles.top}>
                <Text style={styles.titleText}>Are you sure you'd like to complete</Text>
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
        fontSize: vh(3)
    },
    objText: {
        fontSize: vh(2)
    }
});
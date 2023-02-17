import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { vh, vw } from "../config/Toolbox";

const CardSelectModal = (props) => {
    const close = () => {
        console.log("Close requested");
        props.off();
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={close}
        >
            <TouchableOpacity style={styles.background} onPress={close}>
                <View style={styles.top}>
                    <Text>text</Text>
                </View>
            </TouchableOpacity>
        </Modal>
    )
};

const styles = StyleSheet.create({
    background: {
        position: "absolute",
        width: vw(100),
        height: vh(100),
        backgroundColor: "#0006"
    },
    top: {
        width: vw(75),
        height: vh(75),
        marginHorizontal: vw(25/2),
        marginVertical: vh(25/2),
        backgroundColor: "red"
    }
});

export default CardSelectModal;
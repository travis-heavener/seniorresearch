import { useContext } from "react";
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import CardSelectItem from "./CardSelectItem";

const CardSelectModal = (props) => {
    const userContext = useContext( UserDataContext );

    const close = () => {
        console.log("Close requested");
        props.off();
    };

    const generateCardSelectors = () => {
        const arr = [];
        for (let cardName in userContext.cardSlots) {
            if (userContext.cardSlots[cardName] == null) continue;
            arr.push(
                <CardSelectItem key={Math.random()} setFocusedCard={n => setFocusedCard(n)} close={close} cardName={cardName} />
            );
        }
        return arr;
    };

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={close}
        >
            <TouchableOpacity style={styles.background} onPress={close} activeOpacity={1} />
            <View style={styles.top}>
                { generateCardSelectors() }
            </View>
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
        marginVertical: vh(25/2)
    }
});

export default CardSelectModal;
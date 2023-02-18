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
                <CardSelectItem key={Math.random()} close={close} cardName={cardName} />
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
				<Text style={styles.titleText}>Select a Card</Text>
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
		alignItems: "center",
        marginHorizontal: vw(25/2),
        marginVertical: vh(25/2)
    },
	titleText: {
		fontSize: vh(3.75),
		textAlign: "center",
		fontWeight: "bold",
		marginBottom: vh(2)
	}
});

export default CardSelectModal;
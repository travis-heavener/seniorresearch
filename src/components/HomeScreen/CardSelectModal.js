import { useContext } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../../config/Themes";
import { vh, vw } from "../../config/Toolbox";
import { UserDataContext } from "../../config/UserDataManager";
import CardSelectItem from "./CardSelectItem";

const CardSelectModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cards; // select theme

    const close = () => {
        // console.log("Close requested");
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
				<Text style={[styles.titleText, {color: THEME.labelText}]}>Select a Card</Text>
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
        fontFamily: "JosefinSans_700Bold",
		marginBottom: vh(2)
	}
});

export default CardSelectModal;
import { useContext } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import ProgressBar from "./ProgressBar";

const ObjectiveConfirmModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cardDisplay;

	// prevent showing anything if there isn't an objective
	if (!props.isModalVisible) return null;

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

    let objText = (props.obj.constructor.name == "ExploreObjective" ? "Find a(n) " : "Walk ");
    objText += props.obj.toString(); // the "toString" has the toTitleCase called within (see CardObjective.js)

    // for progress bar
    const progressMax = props.obj.distanceGoal ?? props.obj.stepGoal;
	const progressCurrent = props.obj.getStatus ? props.obj.getStatus(userContext) : null;
	const progressReadout = props.obj.getStatusString ? props.obj.getStatusString(userContext) : null;

    return (
        <Modal animationType="none" onRequestClose={reject} transparent={true} visible={props.isModalVisible}>
            <Pressable style={styles.absolute} onPress={reject} />
            
            <View style={styles.top}>
                <View style={[styles.body, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalBackground}]}>
                    <Text style={[styles.titleText, {color: THEME.modalText}]}>Objective:</Text>
                    <Text style={[styles.objText, {color: THEME.modalText}]}>{ objText }</Text>
                </View>
                <View style={[styles.buttonContainer, {borderColor: THEME.modalBorder}]}>
                    {
                        props.obj.triggerPlayerCompletion ? ([
							// confirm & reject buttons
                            <TouchableOpacity key={1} onPress={confirm} activeOpacity={0.95} disabled={props.obj?.isCompleted} 
                                style={[styles.button, {borderColor: THEME.modalBorder,
                                    backgroundColor: ( props.obj.isCompleted ) ? "#888" : THEME.modalConfirm}]}
                            >
                                <Text adjustsFontSizeToFit={true} style={styles.buttonText}>Mark Done</Text>
                            </TouchableOpacity>,
                            <TouchableOpacity key={2} onPress={reject} activeOpacity={0.95}
                                style={[styles.button, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalReject}]}
                            >
                                <Text adjustsFontSizeToFit={true} style={[styles.buttonText, {color: THEME.modalText}]}>Close</Text>
                            </TouchableOpacity>
                        ]) : (
                            // progress bar
                            <ProgressBar
                                width={vw(55)} height="60%" readout={progressReadout}
                                max={progressMax} min={0} current={progressCurrent}
                            />
                        )
                    }
                </View>
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
        backgroundColor: "#0004"
    },
    top: {
        flex: 1,
        marginHorizontal: vw(20),
        marginVertical: vh(39)
    },
    body: {
        flex: 2/3,
        borderRadius: vw(9),
        borderWidth: 3,
        justifyContent: "space-between"
    },
    titleText: {
        flex: 0.425,
        fontSize: vh(3),
        fontWeight: "600",
        textAlignVertical: "bottom",
        textAlign: "center"
    },
    objText: {
        flex: 0.425,
        fontSize: vh(2),
        textAlignVertical: "top",
        textAlign: "center"
    },
    buttonContainer: {
        flex: 1/3,
        marginTop: "4%",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    button: {
        flex: .4,
        borderRadius: vw(5.5),
        borderWidth: 2.5
    },
    buttonText: {
        flex: 1,
        textAlign: "center",
        fontWeight: "600",
        color: "whitesmoke", // overridden where needed
        textAlignVertical: "center",
        fontSize: vh(1.875)
    }
});
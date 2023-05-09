import { useContext, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { eventEmitter } from "../config/Main";
import { Themes } from "../config/Themes";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";
import Checkbox from "./Checkbox";
import ProgressBar from "./ProgressBar";

const ObjectiveConfirmModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].cardDisplay;

	// prevent showing anything if there isn't an objective
	if (!props.isModalVisible) return null;

    const confirm = () => (props.confirm) ? props.confirm() : null;
    const reject = () => (props.reject) ? props.reject() : null;

    let objText = (props.obj.objType == "ExploreObjective" ? "Find a(n) " : "Walk ");
    objText += props.obj.toString(userContext); // the "toString" has the toTitleCase called within (see CardObjective.js)

    // determine which modal to show
    let bodyContent = null;

    if (props.obj.objType == "ExploreObjective") {
        // show progress bar if multi-completion objective
        const progressBar = (props.obj.targetCount === 1) ? null : (
            <ProgressBar
                style={{marginTop: vh(1)}}
                width={vw(55)} height={vh(3.75)} readout={props.obj.targetsFound + " Found"}
                max={props.obj.targetCount} min={0} current={props.obj.targetsFound}
            />
        );

        // show completion buttons
        bodyContent = (
            <View style={styles.subContent}>
                { progressBar }
                <View style={[styles.buttonContainer, {borderColor: THEME.modalBorder}]}>
                    { props.obj.isCompleted ? null : (
                        <TouchableOpacity key={1} onPress={confirm} activeOpacity={0.95} disabled={props.obj?.isCompleted} 
                            style={[styles.button, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalConfirm}]}
                        >
                            <Text adjustsFontSizeToFit={true} style={styles.buttonText}>Mark Done</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity key={2} onPress={reject} activeOpacity={0.95}
                        style={[styles.button, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalReject}]}
                    >
                        <Text adjustsFontSizeToFit={true} style={[styles.buttonText, {color: THEME.modalText}]}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    } else {
        // show progress bar
        const progressMax = props.obj.distanceGoal ?? props.obj.stepGoal;
        const progressCurrent = props.obj.getStatus ? props.obj.getStatus(userContext) : null;
        const progressReadout = props.obj.getStatusString ? props.obj.getStatusString(userContext) : null;

        bodyContent = (
            <View style={[styles.buttonContainer, {borderColor: THEME.modalBorder}]}>
                <ProgressBar width={vw(55)} height={vh(3.75)}
                    readout={progressReadout} max={progressMax} min={0} current={progressCurrent}
                />
            </View>
        );
    }

    return (
        <Modal animationType="none" onRequestClose={reject} transparent={true} visible={props.isModalVisible}>
            <Pressable style={styles.absolute} onPress={reject} />
            
            <View style={styles.top}>
                <View style={[styles.body, {borderColor: THEME.modalBorder, backgroundColor: THEME.modalBackground}]}>
                    <Text style={[styles.titleText, {color: THEME.modalText}]}>Objective:</Text>
                    <Text style={[styles.objText, {color: THEME.modalText}]}>{ objText }</Text>
                </View>
                { bodyContent }
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
        height: vh(44/3),
        borderRadius: vw(9),
        borderWidth: 3,
        justifyContent: "space-between"
    },
    titleText: {
        flex: 0.425,
        fontSize: vh(3),
        fontFamily: "JosefinSans_700Bold",
        textAlignVertical: "bottom",
        textAlign: "center"
    },
    objText: {
        flex: 0.425,
        fontSize: vh(2),
        textAlignVertical: "top",
        textAlign: "center",
        fontFamily: "JosefinSans_400Regular"
    },
    buttonContainer: {
        width: "100%",
        minHeight: vh(6.33),
        height: null, // fits to wrap children
        marginTop: vh(1),
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
        fontFamily: "JosefinSans_600SemiBold",
        color: "whitesmoke", // overridden where needed
        textAlignVertical: "center",
        fontSize: vh(1.875)
    },
    subContent: {
        width: "100%",
        flexDirection: "column",
        alignItems: "center"
    }
});
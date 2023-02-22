import { BlurView } from "@react-native-community/blur";
import { useContext, useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Themes } from "../config/Config";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const ProfileScreenModal = (props) => {
    const userContext = useContext( UserDataContext );
    const THEME = Themes[ userContext.selectedTheme ].profile;

    const close = () => props.close();

    useEffect(
        () => {
            console.log("asdf");
        }, [props.isModalVisible]
    );

    return (
        <Modal
            animationType="none"
            transparent={true}
            visible={props.isModalVisible}
            onRequestClose={close}
        >
            <TouchableOpacity style={styles.absolute} onPress={close} activeOpacity={1} />

            {/* content itself */}
            <View style={[styles.body, {backgroundColor: THEME.body}]}>
                <View style={styles.userInfoView}>
                    <View style={styles.profileImage} />

                    <View style={styles.userInfoText}>
                        <Text style={styles.userName}>(99) My Name</Text>
                        {/* progress bar */}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    body: {
        position: "absolute",
        bottom: 0,
        width: vw(100),
        height: vh(75)
    },
    absolute: {
        position: "absolute",
        width: vw(100),
        height: vh(100)
    },
    userInfoView: {
        width: vw(100),
        height: vh(16),
        paddingHorizontal: vw(10),
        flexDirection: "row",
        backgroundColor: "red"
    },
    profileImage: {
        marginTop: -vh(5),
        height: vh(16),
        aspectRatio: 1,
        backgroundColor: "blue",
        borderRadius: vh(16),
        borderColor: "black",
        borderWidth: 2
    },
    userInfoText: {
        flex: 1, // fill remaining space
        marginLeft: "5%",
        marginVertical: "5%",
        backgroundColor: "yellow"
    },
    userName: {
        fontSize: vh(3.125)
    }
});

export default ProfileScreenModal;
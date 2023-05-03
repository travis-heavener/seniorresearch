import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import PrivacyModal from "../components/PrivacyModal";
import TermsModal from "../components/TermsModal";
import { PermsContext, Settings } from "../config/Config";
import { handleAppLoad, stopAppTick } from "../config/Main";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const SignupScreen = (props) => {
    const userContext = useContext( UserDataContext );
    const permsContext = useContext( PermsContext );
    const [showTOS, setTOSVisibility] = useState( false );
    const [showPP, setPPVisibility] = useState( false );

    const [fieldText, setFieldText] = useState("Player");
    const textInputRef = useRef();

    // stop app tick function when this screen is focused and restart when unfocused
    useFocusEffect(
        useCallback(() => {
            stopAppTick();
        }, [props])
    );

    const submit = () => {
        if (fieldText.length < Settings.MIN_USERNAME_LEN || fieldText.length > Settings.MAX_USERNAME_LEN) {
            console.log("Invalid text");
            return;
        }

        textInputRef.current.blur();

        // now check TOS
        setTOSVisibility(true);
    };

    const confirmTOS = () => {
        setTOSVisibility(false);
        setPPVisibility(true);
    };

    const confirmPP = () => {
        setPPVisibility(false);

        userContext.stats.setUsername( fieldText );
        userContext.stats.setIsNewUser( false );
        userContext.stats.setHasAcceptedTOS( true );
        userContext.setSelectedCard("daily");

        // restart game loop & sensors
        handleAppLoad(userContext, permsContext.permissions);
        props.navigation.navigate("Main");
    };

    // android back button functionality (on screen focus)
    useEffect(() => {
        const handleBack = () => true; // prevent default

        BackHandler.addEventListener("hardwareBackPress", handleBack);
        return () => BackHandler.removeEventListener("hardwareBackPress", handleBack);
    });

    return (
        <Pressable style={styles.body} onPress={() => textInputRef.current?.blur()}>
            <TermsModal isModalVisible={showTOS} confirm={confirmTOS} />
            <PrivacyModal isModalVisible={showPP} lockout={true} confirm={confirmPP} />

            <View style={styles.signupBody}>
                <Text style={styles.headerText}> Sign-Up </Text>

                <TextInput
                    ref={textInputRef}
                    autoCapitalize="words" numberOfLines={1} keyboardType="default" maxLength={Settings.MAX_USERNAME_LEN}
                    style={styles.textInput} onChangeText={t => setFieldText(t)} value={fieldText} />

                <TouchableOpacity style={styles.submitButton} activeOpacity={0.67} onPress={submit}>
                    <Text style={styles.submitButtonText}>Begin</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    )
};

const styles = StyleSheet.create({
    body: {
        // can't use flexbox because the text window changes the flex height
        width: vw(100),
        height: vh(100),
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "cornflowerblue"
    },
    signupBody: {
        width: vw(75),
        height: vh(40),
        marginBottom: vh(10),
        padding: "5%",
        alignSelf: "center",
        alignItems: "center",
        borderRadius: vh(2.5),
        borderColor: "#0006",
        borderWidth: vh(0.4),
        backgroundColor: "#0003"
    },
    headerText: {
        position: "absolute",
        top: vh(5),
        fontFamily: "Alata_400Regular",
        fontSize: vh(5),
        textAlign: "center",
        fontWeight: "600",
        color: "whitesmoke",
        textShadowColor: "black",
        textShadowRadius: vw(0.8),
        textShadowOffset: { width: vw(0.5), height: vw(0.5) }
    },
    textInput: {
        position: "absolute",
        top: vh(15.5),
        width: "80%",
        height: vh(5.25),
        marginVertical: "5%",
        paddingHorizontal: "5%",
        borderRadius: vh(1.5),
        borderColor: "#222",
        borderWidth: vh(0.25),
        backgroundColor: "whitesmoke",
        fontSize: vh(2),
        color: "#222"
    },
    submitButton: {
        position: "absolute",
        bottom: vh(5),
        width: "42.5%",
        height: vh(6.75),
        borderColor: "#008",
        borderRadius: vh(1.5),
        borderWidth: vh(0.33),
        backgroundColor: "#4848cc"
    },
    submitButtonText: {
        flex: 1,
        fontSize: vh(3),
        fontFamily: "JosefinSans_700Bold",
        color: "whitesmoke",
        textAlign: "center",
        textAlignVertical: "center"
    }
});

export default SignupScreen;
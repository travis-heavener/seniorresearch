import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

// see https://reactnavigation.org/docs/stack-navigator/
import "react-native-gesture-handler"; // tl;dr this is important

import { loadUserData, UserDataContext } from "./src/config/UserDataManager";

import React from "react";
import { Image } from "react-native";
import SignupScreen from "./src/screens/SignupScreen";
import { handleAppLoad } from "./src/config/Main";
import { PermsContext, showDebugLogs } from "./src/config/Config";
import SwipeNavigator from "./src/screens/SwipeNavigator";
import { useFonts } from "expo-font";
import { Alata_400Regular } from "@expo-google-fonts/alata";
import { JosefinSans_400Regular, JosefinSans_400Regular_Italic, JosefinSans_500Medium, JosefinSans_600SemiBold, JosefinSans_700Bold } from "@expo-google-fonts/josefin-sans";
const LOADING_IMG = require("./assets/splash.png");

const Stack = createStackNavigator();

const CreateStack = ({initialRouteName}) => (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ unmountOnBlur: false }}>
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false, gestureEnabled: false}} />
		<Stack.Screen name="Main" component={SwipeNavigator} options={{headerShown: false, gestureEnabled: false}} />
    </Stack.Navigator>
);

const App = () => {
    // load data
    const [hasLoaded, setHasLoaded] = React.useState(false);

    const userContext = React.useContext(UserDataContext);
    const permsContext = React.useContext(PermsContext);
    const [fontsLoaded] = useFonts({
        Alata_400Regular,
        JosefinSans_400Regular, JosefinSans_400Regular_Italic,
        JosefinSans_500Medium, JosefinSans_600SemiBold,
        JosefinSans_700Bold
    });

    const debugLog = (...text) => {
        if (showDebugLogs)
            console.log("[App.js]", ...text);
    };

    // wait for data & permissions to load
    React.useEffect(() => {
        loadUserData(userContext).then(() => {
            debugLog("User Context Loaded!");
            permsContext.requestPermissions().then(() => {
                debugLog("Permissions Loaded!");
                setHasLoaded(true);
            });
        });
    }, []);

    // show loading screen while data waits to be loaded
    if (hasLoaded && fontsLoaded) {
        // start main function
        handleAppLoad(userContext, permsContext.permissions);

        return (
            <NavigationContainer>
                <CreateStack initialRouteName="Main" />
            </NavigationContainer>
        );
    } else {
        return (
            <NavigationContainer>
                <Image source={LOADING_IMG} style={{width: "100%", height: "100%", resizeMode: "cover"}} />
            </NavigationContainer>
        );
    }
};

export default App;
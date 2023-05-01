import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";

// see https://reactnavigation.org/docs/stack-navigator/
import "react-native-gesture-handler"; // tl;dr this is important

import { fromHoriz, fromVert } from "./src/screens/ScreenGesturesManager";

import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TasksScreen from "./src/screens/TasksScreen";
import { loadUserData, UserDataContext } from "./src/config/UserDataManager";

import React from "react";
import { Easing, Image } from "react-native";
import ProfileScreen from "./src/screens/ProfileScreen";
import RewardsScreen from "./src/screens/RewardsScreen";
import SignupScreen from "./src/screens/SignupScreen";
import { handleAppLoad } from "./src/config/Main";
import { PermsContext, showDebugLogs } from "./src/config/Config";
import SwipeNavigator from "./src/screens/SwipeNavigator";
const LOADING_IMG = require("./assets/splash.png");

const Stack = createStackNavigator();

const opts = {
    headerShown: false,
    gestureEnabled: true,
    gestureResponseDistance: 1000,
    gestureVelocityImpact: 0.4,
    transitionSpec: {
        open: {
            animation: "timing",
            config: {
                duration: 200,
                easing: Easing.out(Easing.ease)
            }
        },
        close: {
            animation: "timing",
            config: {
                duration: 150,
                easing: Easing.out(Easing.ease)
            }
        }
    }
};

const CreateStack = ({initialRouteName}) => (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ unmountOnBlur: false }}>
        {/* <Stack.Screen name="Home" component={HomeScreen} options={opts} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{
            ...opts, cardStyleInterpolator: fromVert, gestureDirection: "vertical-inverted", presentation: "transparentModal"
        }} />
        <Stack.Screen name="Rewards" component={RewardsScreen} options={{
            ...opts, cardStyleInterpolator: fromHoriz, gestureDirection: "horizontal"
        }} />
        <Stack.Screen name="Tasks" component={TasksScreen} options={{
            ...opts, cardStyleInterpolator: fromVert, gestureDirection: "vertical", presentation: "transparentModal"
        }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{
            ...opts, cardStyleInterpolator: fromHoriz, gestureDirection: "horizontal-inverted", presentation: "transparentModal"
        }} /> */}
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false, gestureEnabled: false}} />
		<Stack.Screen name="Main" component={SwipeNavigator} options={{headerShown: false, gestureEnabled: false}} />
    </Stack.Navigator>
);

const App = () => {
    // load data
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const [__remountStatus, __setRemountStatus] = React.useState(false);
    const remount = () => __setRemountStatus(!__remountStatus);

    const userContext = React.useContext(UserDataContext);
    const permsContext = React.useContext(PermsContext);

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

    // eventEmitter.removeAllListeners("restartApp");
    // eventEmitter.addListener("restartApp", () => {
    //     remount();
    //     debugLog("Restart");
    // });

    // show loading screen while data waits to be loaded
    if (hasLoaded) {
        // start main function
        handleAppLoad(userContext, permsContext.permissions);

        return (
            <NavigationContainer key={__remountStatus}>
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
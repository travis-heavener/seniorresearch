import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

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
    <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen name="Home" component={HomeScreen} options={opts} />
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
        }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{headerShown: false}} />
    </Stack.Navigator>
);

const App = () => {
    // load data
    const [hasLoaded, setHasLoaded] = React.useState(false);
    const userContext = React.useContext(UserDataContext);

    // wait for data to load
    React.useEffect(() => {
        loadUserData(userContext).then(() => {
            setHasLoaded(true)
        });
    }, []);

    // show loading screen while data waits to be loaded
    if (hasLoaded) {
        return (
            <NavigationContainer>
                <CreateStack initialRouteName={userContext.stats.isNewUser ? "Signup" : "Home"} />
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
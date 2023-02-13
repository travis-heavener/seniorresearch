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
import { Image } from "react-native";
const LOADING_IMG = require("./assets/splash.png");

const Stack = createStackNavigator();

const opts = {
    headerShown: false,
    gestureEnabled: true,
    gestureResponseDistance: 1000
};

const CreateStack = () => (
    <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={opts} />
        <Stack.Screen name="Settings" component={SettingsScreen}
            options={{
                ...opts, cardStyleInterpolator: fromHoriz, gestureDirection: "horizontal"
            }}
        />
        <Stack.Screen name="Profile" component={SettingsScreen}
            options={{
                ...opts, cardStyleInterpolator: fromHoriz, gestureDirection: "horizontal-inverted"
            }}
        />
        <Stack.Screen name="Tasks" component={TasksScreen}
            options={{
                ...opts, cardStyleInterpolator: fromVert, gestureDirection: "vertical"
            }}
        />
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
                <CreateStack />
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
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";

// see https://reactnavigation.org/docs/stack-navigator/
import "react-native-gesture-handler"; // tl;dr this is important

import { fromHoriz, fromVert } from "./src/screens/ScreenGesturesManager";

import HomeScreen from "./src/screens/HomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import TasksScreen from "./src/screens/TasksScreen";

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

export default () => (
	<NavigationContainer>
		<CreateStack />
	</NavigationContainer>
);
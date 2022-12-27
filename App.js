import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import HomeScreen from "./src/screens/HomeScreen.js";
import SettingsScreen from "./src/screens/SettingsScreen.js";

const Tab = createMaterialTopTabNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator initialRouteName="Home" screenOptions={{tabBarStyle: {display: "none"}}}>
				<Tab.Screen name="Profile" component={SettingsScreen} />
				<Tab.Screen name="Home" component={HomeScreen} />
				<Tab.Screen name="Settings" component={SettingsScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
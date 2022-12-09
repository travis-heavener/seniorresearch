import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import { NavigationContainer } from "@react-navigation/native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import HomeScreen from "./src/screens/HomeScreen.js";

const Tab = createMaterialTopTabNavigator();

export default function App() {
	return (
		<NavigationContainer>
			<Tab.Navigator screenOptions={{tabBarStyle: {display: "none"}}}>
				<Tab.Screen name="Home" component={HomeScreen} />
			</Tab.Navigator>
		</NavigationContainer>
	);
}
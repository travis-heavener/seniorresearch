import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";

import HomeScreen from "./src/screens/HomeScreen.js";

const navigator = createStackNavigator(
    {
		HomeScreen: HomeScreen
	},
	{
		initialRouteName: "HomeScreen",
		defaultNavigationOptions: { title: "App" }
	}
);

export default createAppContainer(navigator);
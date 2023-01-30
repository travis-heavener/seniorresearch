import { Animated } from "react-native";

export const fromHoriz = ({ current, next, inverted, layouts: { screen } }) => {
	const progress = Animated.add(
		current.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
			extrapolate: "clamp"
		}),
		next
			? next.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 1],
					extrapolate: "clamp"
			  })
			: 0
	);

	return {
		cardStyle: {
			transform: [
				{
					translateX: Animated.multiply(
						progress.interpolate({
							inputRange: [0, 1, 2],
							outputRange: [screen.width, 0, screen.width * -0.1],
							extrapolate: "clamp"
						}),
						inverted
					)
				}
			]
		}
	};
};

export const fromVert = ({ current, next, inverted, layouts: { screen } }) => {
	const progress = Animated.add(
		current.progress.interpolate({
			inputRange: [0, 1],
			outputRange: [0, 1],
			extrapolate: "clamp"
		}),
		next
			? next.progress.interpolate({
					inputRange: [0, 1],
					outputRange: [0, 1],
					extrapolate: "clamp"
			  })
			: 0
	);

	return {
		cardStyle: {
			transform: [
				{
					translateY: Animated.multiply(
						progress.interpolate({
							inputRange: [0, 1, 2],
							outputRange: [screen.height, 0, screen.height * -0.1],
							extrapolate: "clamp"
						}),
						inverted
					)
				}
			]
		}
	};
};
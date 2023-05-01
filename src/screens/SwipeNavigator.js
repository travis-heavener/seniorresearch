import { Animated, PanResponder, Pressable, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { vh, vw } from "../config/Toolbox";
import RewardsScreen from "./RewardsScreen";
import ProfileScreen from "./ProfileScreen";
import HomeScreen from "./HomeScreen";
import TasksScreen from "./TasksScreen";
import SettingsScreen from "./SettingsScreen";
import { useEffect, useRef, useState } from "react";
import GestureRecognizer from "react-native-swipe-gestures";

// touch margins
const H_MARGIN = vw(12);
const V_MARGIN = vh(12);

const TOUCH_THRESH = 10;

const SwipeNavigator = (props) => {
	const [focusedScreen, _setFocusedScreen] = useState("Center");
	const [position, setPosition] = useState(new Animated.ValueXY({x: 0, y: 0}));

	const setFocusedScreen = (screen) => {
		_setFocusedScreen(screen);
	};
	const [__remountStatus, __setRemountStatus] = useState(false);
	const remount = () => __setRemountStatus(!__remountStatus);

	const panResponderRef = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (e, {dx, dy}) => {
				return Math.abs(dx) > TOUCH_THRESH || Math.abs(dy) > TOUCH_THRESH;
			},
			onPanResponderMove: (e, gestureState) => { // handle panResponder move
				const {x0, y0, dx, dy} = gestureState;

				// determine direction of swipe
				let dir = (x0 < H_MARGIN) ? "Left" :
					(x0 > vw() - H_MARGIN) ? "Right" :
					(y0 < V_MARGIN) ? "Top" :
					(y0 > vh() - V_MARGIN) ? "Bottom" : null

				if (dir == "Left" || dir == "Right") {
					setPosition({x: dx, y: 0});
				} else if (dir == "Bottom" || dir == "Top") {
					setPosition({x: 0, y: dy});
				}
			},
			onPanResponderRelease: (e, gestureState) => { // handle panResponder release
				const {x0, y0, dx, dy} = gestureState;

				// determine direction of swipe
				let dir = (x0 < H_MARGIN) ? "Left" :
					(x0 > vw() - H_MARGIN) ? "Right" :
					(y0 < V_MARGIN) ? "Top" :
					(y0 > vh() - V_MARGIN) ? "Bottom" : null

				if (dir == "Left" && dx > vw(67)) {
					console.log("switching to left screen");
					setFocusedScreen("Left");
				} else if (dir == "Right" && dx < -vw(67)) {
					console.log("switching to right screen");
					setFocusedScreen("Right");
				} else if (dir == "Top" && dy > vh(67)) {
					console.log("switching to top screen");
					setFocusedScreen("Top");
				} else if (dir == "Bottom" && dy < -vh(67)) {
					console.log("switching to bottom screen");
					setFocusedScreen("Bottom");
				}
			}
		})
	).current;

	const OffsetWrapper = (props) => {
		const offsetX = props.offsetX ?? 0;
		const offsetY = props.offsetY ?? 0;

		const transform = [
			{
				translateX: position.x.interpolate({
					inputRange: [-vw(), 0, 2*vw()],
					outputRange: [-vw() + offsetX, offsetX, 2*vw() + offsetX],
					extrapolate: "clamp",
					useNativeDriver: true
				})
			},
			{
				translateY: position.y.interpolate({
					inputRange: [-vh(), 0, 2*vh()],
					outputRange: [-vh() + offsetY, offsetY, 2*vh() + offsetY],
					extrapolate: "clamp",
					useNativeDriver: true
				})
			}
		];
		console.log(position);

		return (
			<Animated.View style={{...styles.absolute, transform: transform, pointerEvents: "none"}}>
				{props.children}
			</Animated.View>
		);
	};

	return (
		<View style={styles.absolute} {...panResponderRef.panHandlers}>
			<HomeScreen props={props} />

			<OffsetWrapper offsetX={-vw(100)}>
				<ProfileScreen props={props} />
			</OffsetWrapper>
			
			<OffsetWrapper offsetX={vw(100)}>
				<RewardsScreen props={props} />
			</OffsetWrapper>

			<OffsetWrapper offsetY={-vh(100)}>
				<SettingsScreen props={props} />
			</OffsetWrapper>

			<OffsetWrapper offsetY={vh(100)}>
				<TasksScreen props={props} />
			</OffsetWrapper>
		</View>
	)
};

export default SwipeNavigator;

const styles = StyleSheet.create({
	absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
		pointerEvents: "none"
    }
});
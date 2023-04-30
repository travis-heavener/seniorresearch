import { Animated, PanResponder, Pressable, StyleSheet, TouchableWithoutFeedback, View } from "react-native"
import { vh, vw } from "../config/Toolbox";
import RewardsScreen from "./RewardsScreen";
import ProfileScreen from "./ProfileScreen";
import HomeScreen from "./HomeScreen";
import TasksScreen from "./TasksScreen";
import SettingsScreen from "./SettingsScreen";
import { useRef, useState } from "react";
import GestureRecognizer from "react-native-swipe-gestures";

// touch margins
const H_MARGIN = vw(12);
const V_MARGIN = vh(12);

const TOUCH_THRESH = 10;

const SwipeNavigator = (props) => {
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
					position.setValue({x: dx, y: 0});
				} else if (dir == "Bottom" || dir == "Top") {
					position.setValue({x: 0, y: dy});
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
				} else if (dir == "Right" && dx < -vw(67)) {
					console.log("switching to right screen");
				} else if (dir == "Top" && dy > vh(67)) {
					console.log("switching to top screen");
				} else if (dir == "Bottom" && dy < -vh(67)) {
					console.log("switching to bottom screen");
				}

				position.setValue({x: 0, y: 0});
			}
		})
	).current;

	const position = new Animated.ValueXY({x: 0, y: 0});

	const OffsetWrapper = (props) => {
		const offsetX = props.offsetX ?? 0;
		const offsetY = props.offsetY ?? 0;

		const transform = [
			{
				translateX: position.x.interpolate({
					inputRange: (offsetX > 0) ? [-offsetX, 0, offsetX] : [offsetX, 0, -offsetX],
					outputRange: (offsetX > 0) ? [0, offsetX, 2*offsetX] : [2*offsetX, offsetX, 0]
				})
			},
			{
				translateY: position.y.interpolate({
					inputRange: (offsetY > 0) ? [-offsetY, 0, offsetY] : [offsetY, 0, -offsetY],
					outputRange: (offsetY > 0) ? [0, offsetY, 2*offsetY] : [2*offsetY, offsetY, 0]
				})
			}
		];

		console.log(transform)

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
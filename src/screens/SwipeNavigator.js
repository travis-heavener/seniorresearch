import { Animated, BackHandler, PanResponder, StyleSheet, View } from "react-native"
import { vh, vw } from "../config/Toolbox";
import RewardsScreen from "./RewardsScreen";
import ProfileScreen from "./ProfileScreen";
import HomeScreen from "./HomeScreen";
import TasksScreen from "./TasksScreen";
import SettingsScreen from "./SettingsScreen";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/core";
import DevNoteModal from "../components/DevNoteModal";
import { eventEmitter } from "../config/Main";
import { UserDataContext } from "../config/UserDataManager";
import { Settings } from "../config/Config";

// touch margins
const H_MARGIN = vw(25); // the borders that swipe navigation gestures are picked up by
const V_MARGIN = vh(40); // the borders that swipe navigation gestures are picked up by
const SWIPE_THRESH = 15; // n% of vw/vh must be swiped across to switch to next screen on release
const TOUCH_THRESH = 10; // px, how much displacement a swipe should be considered by
const ANIM_TIMING = 100; // ms, how long animations should be when using navigate function

export const NavContext = createContext({
    focusedScreen: "center",
    getFocusedScreenName: function() {
        return (this.focusedScreen == "center") ? "Home" :
            (this.focusedScreen == "left") ? "Profile" :
            (this.focusedScreen == "right") ? "Rewards" :
            (this.focusedScreen == "top") ? "Settings" :
            (this.focusedScreen == "bottom") ? "Tasks" : "";
    },
    setFocusedScreen: function(s) {
        if (
            (this.focusedScreen == "left" && s == "right") ||
            (this.focusedScreen == "right" && s == "left") ||
            (this.focusedScreen == "top" && s == "bottom") ||
            (this.focusedScreen == "bottom" && s == "top")
        ) {
            // switch back to center screen
            this.focusedScreen = "center";
        } else if (this.focusedScreen !== s) {
            // prevent switching twice to a screen that doesn't exist
            // or switching to a horizontal screen from a vertically-offset screen (or vice versa)
            if (
                (this.focusedScreen !== s) &&
                !((this.focusedScreen == "top" || this.focusedScreen == "bottom") && (s == "left" || s == "right")) &&
                !((this.focusedScreen == "left" || this.focusedScreen == "right") && (s == "top" || s == "bottom"))
            )
            this.focusedScreen = s;
        }
    },
    getOffset: function() {
        return {
            x: (this.focusedScreen == "left") ? vw() : (this.focusedScreen == "right") ? -vw() : 0,
            y: (this.focusedScreen == "top") ? vh() : (this.focusedScreen == "bottom") ? -vh() : 0
        }
    },
    screenMap: {
        "Home": "center",
        "Profile": "left",
        "Rewards": "right",
        "Settings": "top",
        "Tasks": "bottom"
    },
    isAnimating: false, // locks screen gestures (outside of state to prevent remount)
    setIsAnimating: function(bool) {
        this.isAnimating = bool;
    }
});

const SwipeNavigator = (props) => {
    const navContext = useContext( NavContext );
    const userContext = useContext( UserDataContext );
    // keeping the position as a non-state variable prevents remounts, keeping children from excessive remounts
	const position = useRef(new Animated.ValueXY()).current;

    // child keys for mass remounts
    const [masterKey, setMasterKey] = useState(Math.random());
    const [homeKey, setHomeKey] = useState(Math.random());
    const [profileKey, setProfileKey] = useState(Math.random());
    const [rewardsKey, setRewardsKey] = useState(Math.random());
    const [settingsKey, setSettingsKey] = useState(Math.random());
    const [tasksKey, setTasksKey] = useState(Math.random());

    const remountScreen = (name) => {
        if (name == "center") setHomeKey(Math.random());
        if (name == "left") setProfileKey(Math.random());
        if (name == "right") setRewardsKey(Math.random());
        if (name == "top") setSettingsKey(Math.random());
        if (name == "bottom") setTasksKey(Math.random());
    };
    const massRemount = () => {
        setMasterKey(Math.random());
    };

    // developer note modal
    const [showDevNote, setDevNoteVisibility] = useState(true);

    // runs on screen focus
    useFocusEffect(
        useCallback(() => {
            massRemount(); // remount all screens on screen focus

            const handleBack = () => {
                if (navContext.focusedScreen == "center") {
                    return false; // close app and run default
                } else {
                    animateNav("center", true); // return home and prevent default
                    return true;
                }
            };
    
            BackHandler.addEventListener("hardwareBackPress", handleBack);

            // add screen remount listeners
            const screenNames = ["Home", "Profile", "Settings", "Rewards", "Tasks"];
            for (let screenName of screenNames) {
                eventEmitter.removeAllListeners("nav.remount." + screenName.toLowerCase());
                eventEmitter.addListener(
                    "nav.remount." + screenName.toLowerCase(),
                    () => remountScreen(navContext.screenMap[screenName])
                );
            }

            return () => BackHandler.removeEventListener("hardwareBackPress", handleBack);
        }, [props])
    );

	const panResponderRef = useRef(
		PanResponder.create({
            onStartShouldSetPanResponder: (e, {dx, dy}) => { // prevent accidental touches
				return Math.abs(dx) > TOUCH_THRESH || Math.abs(dy) > TOUCH_THRESH;
			},
			onMoveShouldSetPanResponder: (e, {dx, dy}) => { // prevent accidental touches
				return Math.abs(dx) > TOUCH_THRESH || Math.abs(dy) > TOUCH_THRESH;
			},
			onPanResponderMove: (e, gestureState) => { // handle panResponder move
                if (navContext.isAnimating) return; // prevent screen gestures while another screen is animating

                const {x0, y0, dx, dy} = gestureState;
				let dir = getSwipeOrigin(x0, y0); // determine direction of swipe

                // handle offset due to focused screen
                const offset = navContext.getOffset();
                
                // translate screen, if not already swiping past screen
                if ((dir == "left" && navContext.focusedScreen != "left") || (dir == "right" && navContext.focusedScreen != "right")) {
                    position.setValue({x: dx + offset.x, y: offset.y});
                } else if ((dir == "top" && navContext.focusedScreen != "top") || (dir == "bottom" && navContext.focusedScreen != "bottom")) {
					position.setValue({x: offset.x, y: dy + offset.y});
                }
			},
			onPanResponderRelease: (e, gestureState) => { // handle panResponder release
                if (navContext.isAnimating) return; // prevent screen gestures while another screen is animating

				const {x0, y0, dx, dy} = gestureState;

                let dir = getSwipeOrigin(x0, y0); // determine direction of swipe
                let shouldNavRemount = true; // if the new screen should cause a remount (overriden if a swipe is incomplete and doesn't nav a new screen)

				if (dir == "left" && dx > vw(SWIPE_THRESH))
					navContext.setFocusedScreen("left");
				else if (dir == "right" && dx < -vw(SWIPE_THRESH))
					navContext.setFocusedScreen("right");
				else if (dir == "top" && dy > vh(SWIPE_THRESH))
					navContext.setFocusedScreen("top");
				else if (dir == "bottom" && dy < -vh(SWIPE_THRESH))
					navContext.setFocusedScreen("bottom");
                else
                    shouldNavRemount = false;
                
                // update positional shift for components/screens
                animateNav(null, shouldNavRemount);
			}
		})
	).current;

    /** Shorthand to navigate between screens w/ animation */
    const animateNav = (screenPos, shouldRemount=true) => {
        // navigate normally to screen
        if (screenPos) navContext.setFocusedScreen(screenPos);
        navContext.setIsAnimating(true); // lock animations
        
        Animated.timing(position, {
            toValue: navContext.getOffset(),
            duration: ANIM_TIMING,
            useNativeDriver: true
        }).start();

        // manually set position after animation (prevent navigator from not recognizing screen has changed)
        setTimeout(() => {
            navContext.setIsAnimating(false);

            // remount screen that is being focused
            const xpBarData = {
                progressBar: {
                    current: userContext.stats.xp,
                    readout: userContext.stats.xp + " XP",
                    max: Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level),
                    min: 0
                }
            };

            if (shouldRemount && navContext.focusedScreen == "center") { // custom remount home
                // soft remount all (soft meaning not remounting the entire screen from this navigator)
                eventEmitter.emit("remountHome");
                eventEmitter.emit("remountTasks");
                eventEmitter.emit("remountSettings");
                eventEmitter.emit("remountProfile", xpBarData);
                eventEmitter.emit("remountRewards", xpBarData);
            } else if (shouldRemount && navContext.focusedScreen == "left")
                eventEmitter.emit("remountProfile", xpBarData);
            else if (shouldRemount && navContext.focusedScreen == "right")
                eventEmitter.emit("remountRewards", xpBarData);
        }, ANIM_TIMING);
    };

    /** Determine direction of swipe from initial points */
    const getSwipeOrigin = (x0, y0) => {
        let dir = (x0 < H_MARGIN) ? "left" :
            (x0 > vw() - H_MARGIN) ? "right" :
            (y0 < V_MARGIN) ? "top" :
            (y0 > vh() - V_MARGIN) ? "bottom" : null;

        // prevent swiping horizontally on vertical screens and vice versa
        if (
            ((dir == "left" || dir == "right") && (navContext.focusedScreen == "top" || navContext.focusedScreen == "bottom")) ||
            ((dir == "top" || dir == "bottom") && (navContext.focusedScreen == "left" || navContext.focusedScreen == "right"))
        ) {
            dir = null;
        }
        return dir;
    };

    const navigate = (screen) => {
        let screenPos = navContext.screenMap[screen]; // get corresponding direction from screen map object
        
        // switch if screen is signup
        if (screen == "Signup") {
            props.navigation.navigate("Signup"); // navigate via stack

            // reset to center (home) screen
            navContext.setFocusedScreen("center");
            position.setValue(navContext.getOffset());
        } else if (screenPos) {
            animateNav(screenPos);
        } else {
            console.warn("[SwipeNavigator.js] Screen " + screen + " does not exist");
        }
    };

	const OffsetWrapper = (props) => {
		let offsetX = props.offsetX ?? 0;
		let offsetY = props.offsetY ?? 0;

		const transform = [
			{
				translateX: position.x.interpolate({
					inputRange: [-vw(), 0, vw()],
					outputRange: [-vw() + offsetX, offsetX, vw() + offsetX],
					extrapolate: "clamp"
				})
			},
			{
				translateY: position.y.interpolate({
					inputRange: [-vh(), 0, vh()],
					outputRange: [-vh() + offsetY, offsetY, vh() + offsetY],
					extrapolate: "clamp"
				})
			}
		];

		return (
			<Animated.View style={{...styles.absolute, transform: transform, pointerEvents: "none"}}>
				{props.children}
			</Animated.View>
		);
	};

    // screen options
    const opts = {
        ...props,
        freezeGestures: () => navContext.setIsAnimating(true),
        unfreezeGestures: () => navContext.setIsAnimating(false),
        navigate: navigate,
        getFocusedScreen: () => navContext.focusedScreen,
        navContext: navContext
    };

	return (
		<View style={styles.absolute} {...panResponderRef.panHandlers} key={masterKey}>
            <DevNoteModal isModalVisible={showDevNote} close={() => setDevNoteVisibility(false)} />

			<HomeScreen {...opts} key={homeKey} />

			<OffsetWrapper offsetX={-vw(100)}>
				<ProfileScreen {...opts} key={profileKey} />
			</OffsetWrapper>
			
			<OffsetWrapper offsetX={vw(100)}>
				<RewardsScreen {...opts} key={rewardsKey} />
			</OffsetWrapper>

			<OffsetWrapper offsetY={-vh(100)}>
				<SettingsScreen {...opts} key={settingsKey} />
			</OffsetWrapper>

			<OffsetWrapper offsetY={vh(100)}>
				<TasksScreen {...opts} key={tasksKey} />
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
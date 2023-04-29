import { useNavigationState } from "@react-navigation/native";
import { CardAnimationContext, useCardAnimation } from "@react-navigation/stack";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { vh, vw } from "../config/Toolbox";

// maximum swipe distances
const HORIZ = vw(100) / 2;
const VERT = vh(100) / 3;

const SwipeNavWrapper = (props) => {
    const [startPos, setStartPos] = useState({x: null, y: null, dir: null});

    const cardAnimCtx = useCardAnimation();

    const touchStart = ({nativeEvent: {pageX, pageY}}, dir) => {
        setStartPos({x: pageX, y: pageY, dir: "from" + dir});
    };

    const touchEnd = ({nativeEvent: {pageX, pageY}}) => {
        let dx = pageX - startPos.x,
            dy = pageY - startPos.y;
        let delta = Math.hypot(dx, dy);
        let theta = Math.atan2(dy, dx) * 180 / Math.PI;
        console.log(delta);

        setStartPos({x: null, y: null, dir: null});
    };

    const touchMove = ({nativeEvent: {pageX, pageY}}) => {
        if (startPos.dir == null) return;

        let dx = pageX - startPos.x,
            dy = pageY - startPos.y;
        let dist = Math.hypot(dx, dy);

        if (
            ((startPos.dir == "fromRight" || startPos.dir == "fromLeft") && dist > HORIZ) ||
            ((startPos.dir == "fromBottom" || startPos.dir == "fromTop") && dist > VERT)
        ) { // time to switch
            console.log(startPos.dir, dist);
        } else { // keep moving
            console.log(cardAnimCtx);
            // ******************************************
            // ******************************************
            // ******************************************
            // ******************************************
            // ******************************************
            // CardAnimationContext FUTURE TRAVIS, USE THIS
            // ******************************************
            // ******************************************
            // ******************************************
            // ******************************************
            // ******************************************
        }
    };

    return (
        <View style={styles.absolute} onTouchMove={touchMove} onTouchEnd={touchEnd}>
            {/* don't forget about the children !! */}
            { props.children }

            <Pressable style={[styles.sideBar, {left: 0}]} onTouchStart={(e) => touchStart(e, "Left")}></Pressable>
            <Pressable style={[styles.sideBar, {right: 0}]} onTouchStart={(e) => touchStart(e, "Right")}></Pressable>

            <Pressable style={[styles.vertBar, {top: 0}]} onTouchStart={(e) => touchStart(e, "Top")}></Pressable>
            <Pressable style={[styles.vertBar, {bottom: 0}]} onTouchStart={(e) => touchStart(e, "Bottom")}></Pressable>
        </View>
    )
};

export default SwipeNavWrapper;

const styles = StyleSheet.create({
    absolute: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    },
    sideBar: {
        position: "absolute",
        top: 0,
        bottom: 0,
        width: vw(12),
        backgroundColor: "#f007"
    },
    vertBar: {
        position: "absolute",
        left: 0,
        right: 0,
        height: vh(8),
        backgroundColor: "#f007"
    }
});
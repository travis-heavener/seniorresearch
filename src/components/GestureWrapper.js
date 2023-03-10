import { useState } from "react";
import GestureRecognizer from "react-native-swipe-gestures";

const GestureWrapper = (props) => {
    const [gesturePos, setGesturePos] = useState({x: null, y: null});
    
    const angleThresh = props.angleThresh ?? 25; // deg in either direction of target
    const gestureDistance = props.gestureDistance ?? 150; // px in either direction to register

    const resetGesture = ({nativeEvent}) => {
        const x = nativeEvent.pageX, y = nativeEvent.pageY;

        if (gesturePos.x !== null && gesturePos.y !== null) {
            let dx = x - gesturePos.x,
                dy = y - gesturePos.y;
            let delta = Math.hypot(dx, dy);
            let theta = Math.atan2(dy, dx) * 180 / Math.PI;
            
            const dir = (-angleThresh < theta && theta < angleThresh) ? "left" :
                        (90 - angleThresh < theta && theta < 90 + angleThresh) ? "down" :
                        (180 - angleThresh < theta || theta < -180 + angleThresh) ? "right" :
                        (-90 - angleThresh < theta && theta < -90 + angleThresh) ? "up" : null;
            
            if (dir == null || delta < gestureDistance) return;
            // console.log("Delta: " + delta + " \tDir: " + dir);

            if (dir == "left")
                props.onSwipeLeft ? props.onSwipeLeft() : null;
            else if (dir == "right")
                props.onSwipeRight ? props.onSwipeRight() : null;
            else if (dir == "up")
                props.onSwipeUp ? props.onSwipeUp() : null;
            else if (dir == "down")
                props.onSwipeDown ? props.onSwipeDown() : null;
        }

        setGesturePos({x: null, y: null});
    };
    
    return (
        <GestureRecognizer
            onTouchStart={({nativeEvent}) => setGesturePos({x: nativeEvent.pageX, y: nativeEvent.pageY})}
            onTouchCancel={resetGesture}
            onTouchEnd={resetGesture}
            style={{position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "yellow"}}
        >
            {props.children}
        </GestureRecognizer>
    )
};

export default GestureWrapper;
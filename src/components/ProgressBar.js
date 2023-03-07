import { useContext, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native"
import { Settings } from "../config/Config";
import { vh, vw } from "../config/Toolbox";
import { UserDataContext } from "../config/UserDataManager";

const ProgressBar = (props) => {
	const userContext = useContext( UserDataContext );
	const [progress, setProgress] = useState({
		current: props.getCurrent(),
		readout: props.getReadout()
	});

	const [int, setInt] = useState(null);
	const intRef = useRef();
	intRef.current = int;
	
	useEffect(
		() => {
			if (int != null)
				clearInterval( int );
			
			const timeout = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck;
			const interval = setInterval(() => {
				setProgress({
					current: props.getCurrent(),
					readout: props.getReadout()
				});
			}, timeout);
			setInt( interval );
			
			return () => {
				clearInterval( intRef.current );
				setInt( null );
			}
		}, [props]
	);

    const {max, min} = props;
    let percentage = progress.current / (max - min) * 100; // 0 being at min & 100 being at max
    percentage = Math.max(0, Math.min(percentage, 100)); // clamp between 0 and 100

    return (
        <View style={[styles.top, {width: props.width, height: props.height}]}>
            <View style={[styles.blob, {transform: [{translateX: -(100-percentage)/100*props.width}]}]}>
                <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.readout}>{ progress.readout }</Text>
            </View>
        </View>
    )
};

const styles = StyleSheet.create({
    top: {
        borderWidth: 2.5,
        borderRadius: vw(4),
        flexDirection: "row",
        overflow: "hidden", // prevents blob from overflowing
        backgroundColor: "whitesmoke"
    },
    blob: {
        // borderTopRightRadius: vw(3),
        // borderBottomRightRadius: vw(3),
        width: "100%",
        height: "100%",
        justifyContent: "center",
        backgroundColor: "cornflowerblue"
    },
    readout: {
        height: "100%",
        position: "absolute",
        right: 0,
        marginHorizontal: "1.25%",
        textAlignVertical: "center",
        fontSize: vh(2),
        fontWeight: "500",
        fontStyle: "italic",
        color: "whitesmoke"
    }
});

export default ProgressBar;
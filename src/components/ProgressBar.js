import { StyleSheet, Text, View } from "react-native"
import { vh, vw } from "../config/Toolbox";

const ProgressBar = (props) => {
    const {max, min, current, readout} = props;
    let percentage = current / (max - min) * 100; // 0 being at min & 100 being at max
    percentage = Math.max(0, Math.min(percentage, 100)); // clamp between 0 and 100

    return (
        <View style={[styles.top, {width: props.width, height: props.height}]}>
            <View style={[styles.blob, {transform: [{translateX: -(100-percentage)/100*props.width}]}]}>
                <Text numberOfLines={1} adjustsFontSizeToFit={true} style={styles.readout}>{ readout }</Text>
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
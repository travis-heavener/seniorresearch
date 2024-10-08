import { View, StyleSheet, Image } from "react-native";
import { vh, vw } from "../config/Toolbox";

const CHECK_IMG = require("../../assets/media/check.png");

const Checkbox = (props) => {
    return (
        <View style={[styles.parent, props.style]}>
            <Image source={CHECK_IMG} style={[styles.check, {opacity: (0+props.isChecked)}]} />
        </View>
    );
};

const styles = StyleSheet.create({
    parent: {
        height: vh(3.125),
        aspectRatio: 1,
		marginLeft: vw(1.5),
		borderColor: "black",
		borderWidth: vh(0.2),
        borderRadius: vh(0.625)
    },
    check: {
		width: "100%",
		height: "100%"
    }
});

export default Checkbox;
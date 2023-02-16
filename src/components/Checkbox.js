import { View, StyleSheet } from "react-native";

const Checkbox = (props) => {
    return (
        <View style={[styles.parent, {backgroundColor: (props.isChecked ? "white" : "black")}]}>
            
        </View>
    );
};

const styles = StyleSheet.create({
    parent: {
        height: "100%",
        aspectRatio: 1
    },
    check: {

    }
});

export default Checkbox;
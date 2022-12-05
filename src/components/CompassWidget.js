import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";

const CompassWidget = (props) => {
    return (
        <View style={styles.body}>
            <Text>Compass</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    body: {
        flex: 1,
        marginRight: "2.5%",
        aspectRatio: 1,
        borderColor: "black",
        borderWidth: 3,
        backgroundColor: "#f7bcbc"
    }
});

export default CompassWidget;
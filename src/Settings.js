import React from "react";
import { PermissionsAndroid } from "react-native";

/* ======= settings ======= */

export const SETTINGS = {
    useBatterySaver: false // if true, decreases compass updates (10ms --> 200ms)
};

/* ======= permissions ======= */

const checkPerm = perm => {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
};

export const CONTEXT = React.createContext({
    permissions: {
        // for Pedometer
        "ACTIVITY_RECOGNITION": checkPerm("ACTIVITY_RECOGNITION"),
        // for Magnetometer
        "HIGH_SAMPLING_RATE_SENSORS": checkPerm("HIGH_SAMPLING_RATE_SENSORS")
    }
});
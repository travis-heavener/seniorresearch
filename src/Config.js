import React from "react";
import { PermissionsAndroid } from "react-native";

import * as Location from "expo-location";

/* ======= settings ======= */

export const Settings = {
    theme: "base", // selected theme
    useBatterySaver: false // if true, decreases compass updates (20ms --> 100ms)
};


/* ======= themes ======= */

export const Themes = {
    base: {
        home: {
            backgrounds: {
                stopped: "#fc9490",
                slow: "#fcc290",
                med: "#fcfc90",
                fast: "#90fc95"
            }
        },
        settings: {
            primary: "#32a852",
            primaryAccent: "#299648",
            secondary: "#248f41",
            secondaryAccent: "#1f8039",
            text: "#031c0a"
        }
    }
};

/* ======= permissions ======= */

const checkPerm = perm => {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
};

export const Context = React.createContext({
    refreshPermissions: async function() {
        for (let perm in this.permissions) {
            if (this.permissions.hasOwnProperty(perm))
                this.permissions[perm] = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
        }
    },
    requestPermissions: async function() {
        this.refreshPermissions();

        for (let perm in this.permissions) {
            if (this.permissions.hasOwnProperty(perm) && !this.permissions[perm])
                this.permissions[perm] = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS[perm]);
        }
        return this.permissions;
    },
    permissions: {
        // for Pedometer
        "ACTIVITY_RECOGNITION": false,
        // for Magnetometer
        // "HIGH_SAMPLING_RATE_SENSORS": false
        // for Location
        "ACCESS_FINE_LOCATION": false,
        "ACCESS_COARSE_LOCATION": false
    }
});
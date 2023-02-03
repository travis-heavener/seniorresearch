import React from "react";
import { PermissionsAndroid } from "react-native";

import { LocationAccuracy } from "expo-location";

/* ======= settings ======= */

export const Settings = {
    // sensor update intervals, in ms
    sensorUpdateIntervals: {
        batterySaverOff: {
            deviceMotion: 10,
            compassUpdate: 250,
            GPS: {
                accuracy: LocationAccuracy.Highest,
                delta: 1 // meters of variance before calling update
            },
            taskCompletionCheck: 1000 // how often to check for objective completion, in ms
        },
        batterySaverOn: {
            deviceMotion: 100,
            compassUpdate: 500,
            GPS: {
                accuracy: LocationAccuracy.Low,
                delta: 2 // meters of variance before calling update
            },
            taskCompletionCheck: 5000 // how often to check for objective completion, in ms
        }
    },
    BATTERY_SAVER_OFF: "batterySaverOff",
    BATTERY_SAVER_ON: "batterySaverOn"
};

/* ======= themes ======= */

export const Themes = {
    base: {
        home: {
            backgrounds: {
                stopped: "rgb(252, 170, 167)",
                fast: "rgb(109, 227, 114)"
            }
        },
        settings: {
            primary: "#f0f0f0",
            primaryAccent: "#e3e3e3",
            secondary: "#e4e4e4",
            secondaryAccent: "#d6d6d6",
            text: "#031c0a"
        }
    },
    dark: {
        home: {
            backgrounds: {
                stopped: "rgb(252, 170, 167)",
                fast: "rgb(109, 227, 114)"
            }
        },
        settings: {
            primary: "#363636",
            primaryAccent: "#2a2a2a",
            secondary: "#2f2f2f",
            secondaryAccent: "#252525",
            text: "#f5f5f5"
        }
    }
};

/* ======= permissions ======= */

const checkPerm = perm => {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
};

export const SettingsContext = React.createContext({
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
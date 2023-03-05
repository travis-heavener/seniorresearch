import React from "react";
import { PermissionsAndroid } from "react-native";

import * as Location from "expo-location";

/* ======= settings ======= */

export const Settings = {
    // sensor update intervals, in ms
    sensorUpdateIntervals: {
        batterySaverOff: {
            deviceMotion: 10,
            compassUpdate: 250,
            backgroundColor: 250,
            GPS: {
                accuracy: Location.LocationAccuracy.BestForNavigation,
                delta: 5, // meters of variance before calling update
				minTimeElapsed: 2000 // minimum time elapsed before making another call
            },
            taskCompletionCheck: 2000 // how often to check for objective completion, in ms
        },
        batterySaverOn: {
            deviceMotion: 100,
            compassUpdate: 750,
            backgroundColor: 500,
            GPS: {
                accuracy: Location.LocationAccuracy.High,
                delta: 7.5, // meters of variance before calling update
				minTimeElapsed: 5000 // minimum time elapsed before making another call
            },
            taskCompletionCheck: 5000 // how often to check for objective completion, in ms
        }
    },
	LOCATION_NOISE_THRESH: 25, // in meters, widest accuracy radius of geolocation calls, limits noise
    MAX_GRADIENT_SPEED: 3, // max speed recognized by gradient before it maxes the color
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
            primary: "#f0f0f0", primaryAccent: "#e3e3e3",
            secondary: "#e4e4e4", secondaryAccent: "#d6d6d6",
            text: "#031c0a"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696",
            checkedTile: "#7be385",
            uncheckedTile: "#f7bcbc",
            cards: {
                easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147"
            }
        },
        cardDisplay: {
            checkedTile: "#46eb57",
            uncheckedTile: "#f7bcbc",
            cards: {
                easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147"
            },
            modalBorder: "#333",
            modalBackground: "#e6e6e6",
            modalText: "#222",
            modalReject: "#fff",
            modalConfirm: "cornflowerblue"
        },
        profile: {
            body: "#f0f0f0"
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
            primary: "#363636", primaryAccent: "#2a2a2a",
            secondary: "#2f2f2f", secondaryAccent: "#252525",
            text: "#f5f5f5"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696",
            checkedTile: "#46eb57",
            uncheckedTile: "#f7bcbc",
            cards: {
                easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147"
            }
        },
        cardDisplay: {
            checkedTile: "#46eb57",
            uncheckedTile: "#f7bcbc",
            cards: {
                easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147"
            },
            modalBorder: "#111",
            modalBackground: "#333",
            modalText: "#f5f5f5",
            modalReject: "#444",
            modalConfirm: "cornflowerblue"
        },
        profile: {
            body: "#f0f0f0"
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
            if (this.permissions.hasOwnProperty(perm)) {
                if (perm == "ACCESS_FINE_LOCATION" || perm == "ACCESS_COARSE_LOCATION")
					this.permissions[perm] = (await Location.getForegroundPermissionsAsync()).status == "granted";
				else
					this.permissions[perm] = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
			}
        }
    },
    requestPermissions: async function() {
        await this.refreshPermissions();

        for (let perm in this.permissions) {
            if (this.permissions.hasOwnProperty(perm) && !this.permissions[perm])
				if (perm == "ACCESS_FINE_LOCATION" || perm == "ACCESS_COARSE_LOCATION")
					this.permissions[perm] = (await Location.requestForegroundPermissionsAsync()).status == "granted";
				else
					this.permissions[perm] = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS[perm]);
        }

		this.hasRequestedPermissions = true;

        return this.permissions;
    },
	hasRequestedPermissions: false,
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
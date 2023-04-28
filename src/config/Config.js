import React from "react";
import { PermissionsAndroid } from "react-native";

import * as Location from "expo-location";

/* ======= constants ======= */

export const showDebugLogs = true;
export const useLazyDevMode = false;

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
    XP_CONSTANTS: {
        firstBingo: 15,
        genericBingo: 10,
        completion: 50,
        maxLevel: 30, // after filling out the 30th level, there isn't a 31
        levelBase: 0, // base xp while at level 1 (to get to level 2)
        levelIncrement: 50, // xp increment per level
        calculateLevelMax: function(level) {
            return level * this.levelIncrement + this.levelBase;
        }
    },
	LOCATION_NOISE_THRESH: 25, // in meters, widest accuracy radius of geolocation calls, limits noise
    MAX_GRADIENT_SPEED: 1, // max speed recognized by gradient before it maxes the color
    BATTERY_SAVER_OFF: "batterySaverOff",
    BATTERY_SAVER_ON: "batterySaverOn"
};

/* ======= permissions ======= */

const checkPerm = perm => {
    return PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS[perm]);
};

export const PermsContext = React.createContext({
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
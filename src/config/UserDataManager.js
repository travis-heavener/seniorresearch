import React from "react";
import { Settings, showDebugLogs } from "./Config";
import { DistanceObjective, ExploreObjective, FreeObjective, StepsObjective } from "../objectives/CardObjectives";
import { BingoCard } from "../objectives/BingoCardManager";
import * as SecureStore from "expo-secure-store";
import { deflate, inflate } from "react-native-gzip";

/************* CONSTANTS *************/

const keysWhitelist = {
    "base": [
        "timestamp", "selectedTheme", "selectedIcon", "selectedCard", "batterySaverStatus", "preferredUnits"
    ],
    "metadata": [
        "steps", "distance"
    ],
    "stats": [
        "xp", "level", "lifetimeBingos", "lifetimeCards", "dailySkips", "username", "isNewUser", "hasAcceptedTOS",
    ]
};

const storageRoot = "com.heavener-sr.user-data";

/************* *************/

const generateContextDefaults = () => ({
    metadata: {
        steps: 0,
        setSteps: function(n) {  this.steps = n;  },
        
        distance: 0, // distance, in meters (1609.344 meters in 1 mile)
        setDistance: function(n) {  this.distance = n;  },
        addDistance: function(n) {  this.distance += n;  },
        
        velocity: {x: 0, y: 0, z: 0},
        setVelocity: function(n) {  this.velocity = n;  },
        getSpeed: function(n) {  return Math.hypot(this.velocity.x, this.velocity.y, this.velocity.z);  },
        
        acceleration: {x: 0, y: 0, z: 0},
        setAcceleration: function(n) {  this.acceleration = n;  },
        accelDelta: Date.now(), // ms between readings, for better velocity approximations
        setAccelDelta: function(n) {  this.accelDelta = n;  },

        GPS: {
            current: {lat: null, long: null, acc: -1},
            last: {lat: null, long: null, acc: -1},
			updatePos: function(current) {
				this.last = this.current;
				this.current = current;
				return { last: this.last, current: this.current }
			},
            setCurrent: function(n) {  this.current = n;  },
            setLast: function(n) {  this.last = n;  }
        }
    },

    stats: {
        xp: 0, // xp for user's level (not total & cumulative)
        setXP: function(n) {
            this.xp = 0;
            this.level = 1;
            this.addXP(n);
        },
        addXP: function(n) {
            this.xp += n;
            while (this.xp >= Settings.XP_CONSTANTS.calculateLevelMax(this.level) && this.level < Settings.XP_CONSTANTS.maxLevel) {
                this.xp -= Settings.XP_CONSTANTS.calculateLevelMax(this.level);
                this.level++;
            }
        },
        level: 1, // user's level
        setLevel: function(n) {  this.level = n;  },
        getTotalXP: function() {
            let total = this.xp;
            for (let i = 1; i < this.level; i++)
                total += Settings.XP_CONSTANTS.calculateLevelMax(i);
            return total;
        },

        isNewUser: true,
        setIsNewUser: function(n) {  this.isNewUser = n;  },

        hasAcceptedTOS: false,
        setHasAcceptedTOS: function(n) {  this.hasAcceptedTOS = n; },

        username: "Player",
        setUsername: function(n) {  this.username = n;  },

        dailySkips: 0, // the number of card skips the user has done today
        setDailySkips: function(n) {  this.dailySkips = n;  },
        addDailySkips: function(n) {  this.dailySkips += n;  },

        lifetimeBingos: 0,
        lifetimeCards: 0,
        
        lifetimeSteps: 0,
        setLifetimeSteps: function(n) { this.lifetimeSteps = n; },

        lifetimeDistance: 0,
        setLifetimeDistance: function(n) { this.lifetimeDistance = n; },
    },

    timestamp: Date.now(), // the last known timestamp (for determining when a date changes)
    setTimestamp: function(n) {
        const last = this.timestamp;
        this.timestamp = n;
        return {lastTimestamp: last, currentTimestamp: n};
    },

    cardSlots: {
        daily: null, custom1: null, custom2: null, custom3: null
    },
    selectedCard: "daily",
    setSelectedCard: function(n) {  this.selectedCard = n;  },
    
    selectedIcon: "Brown Panda",
    setSelectedIcon: function(n) {  this.selectedIcon = n; },
    selectedTheme: "base",
    setSelectedTheme: function(n) {  this.selectedTheme = n;  },
    
    batterySaverStatus: Settings.BATTERY_SAVER_OFF,
    isBatterySaverOn: function() {  return this.batterySaverStatus == Settings.BATTERY_SAVER_ON;  },
    toggleBatterySaver: function() {
        this.batterySaverStatus = this.isBatterySaverOn() ? Settings.BATTERY_SAVER_OFF : Settings.BATTERY_SAVER_ON;
        // console.log("Battery saver: " + (this.isBatterySaverOn() ? "ON" : "OFF"));
    },
    setBatterySaverStatus: function(n) {  this.batterySaverStatus = n;  },

    preferredUnits: "Metric",
    togglePreferredUnits: function() {
        this.preferredUnits = (this.preferredUnits == "Metric") ? "Imperial" : "Metric";
    },
    setPreferredUnits: function(n) {  this.preferredUnits = n;  }
});

// create a new context with default data
export const UserDataContext = React.createContext(generateContextDefaults());

/************* LOAD USER DATA FROM DISK, IF AVAILABLE *************/

const createObjectiveFromData = (data, userContext) => {
    let obj = null;

    if (data.label == "steps")
        obj = new StepsObjective(data.label, data.difficulty, userContext);
    else if (data.label == "distance")
        obj = new DistanceObjective(data.label, data.difficulty, userContext);
    else if (data.label == "findSomething")
        obj = new ExploreObjective(data.label, data.difficulty, userContext);
    else
        obj = new FreeObjective(data.label, data.difficulty, userContext);
    
    if (obj.loadFromDisk)
        obj.loadFromDisk(data);
    
    return obj;
};

export const loadUserData = async (userContext) => {
    // load in data
    for (let prop of Object.keys(keysWhitelist)) {
        const root = storageRoot + "." + (prop == "base" ? "" : prop + ".");
        let keys = keysWhitelist[prop];

        for (let key of keys) {
            let saved = JSON.parse(await SecureStore.getItemAsync(root + key));
            // console.log("Root:", root + key, "Saved:", saved);

            if (saved === null) // skip loading this stat if there isn't anything saved
                continue;
            else if (prop == "base") // load data to userContext
                userContext[key] = saved;
            else
                userContext[prop][key] = saved;
        }
    }

    // load cards data
    const cardNames = Object.keys(userContext.cardSlots);

    for (let cardName of cardNames) {
        const data = await SecureStore.getItemAsync(storageRoot + ".cards." + cardName);

        if (data === null) continue; // skip if no data

        let card = JSON.parse(await inflate(data)); // parse JSON and decompress (inflate) the data
        let grid = [[], [], [], [], []];

        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                grid[r].push( createObjectiveFromData(card.grid[r][c], userContext) );

        const cardObj = new BingoCard(grid, card.difficulty, card.randomSeed, card.timestamp, card.hasAwardedCompletion);
        cardObj.checkBingos(); // fills the __bingos object so that it doesn't automatically award user free xp on loading
        userContext.cardSlots[cardName] = cardObj;
    }
};

export const exportUserData = async (userContext) => {
    // export generic data
    for (let prop of Object.keys(keysWhitelist)) {
        const root = storageRoot + "." + (prop == "base" ? "" : prop + ".");
        let keys = keysWhitelist[prop];

        for (let key of keys) {
            // get existing value
            let val = (prop == "base") ? userContext[key] : userContext[prop][key];

            // append lifetime stats to current stats to become the new lifetime stats
            if (key == "steps")
                val += userContext.stats.lifetimeSteps;
            else if (key == "distance")
                val += userContext.stats.lifetimeDistance;
            
            // console.log("Saving to:", root+key, "Val:", JSON.stringify(val));
            // save value to storage
            await SecureStore.setItemAsync(root + key, JSON.stringify(val));
        }
    }

    // export active cards
    for (let cardName in userContext.cardSlots) {
        if (userContext.cardSlots[cardName]) {
            let data = userContext.cardSlots[cardName].exportToDisk(userContext);
            data = JSON.stringify(data); // stringify data
            data = await deflate(data); // compress data
            await SecureStore.setItemAsync(storageRoot + ".cards." + cardName, data);
        }
    }
};

/**
 * Literally deletes all user data, beware
 */
export const clearUserData = async (userContext) => {
    // clear local data
    for (let prop of Object.keys(keysWhitelist)) {
        const root = storageRoot + "." + (prop == "base" ? "" : prop + ".");
        
        for (let key of keysWhitelist[prop])
            await SecureStore.deleteItemAsync(root + key);
    }

    // clear local card data
    for (let cardName of Object.keys(userContext.cardSlots))
        await SecureStore.deleteItemAsync(storageRoot + ".cards." + cardName);

    if (showDebugLogs) console.log("[UserDataManager.js] Cleared SecureStore");

    // reset user data
    Object.assign(userContext, generateContextDefaults());

    if (showDebugLogs) console.log("[UserDataManager.js] User data cleared!");
};
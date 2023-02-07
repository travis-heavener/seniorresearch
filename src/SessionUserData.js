import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from "./Config";
import { DistanceObjective, ExploreObjective, FreeObjective, StepsObjective } from "./CardObjectives";
import { BingoCard } from "./BingoCardManager";

export const UserDataContext = React.createContext({
    metadata: {
        lifetimeSteps: 0,
        setLifetimeSteps: function(n) { this.lifetimeSteps = n; },
        steps: 0,
        setSteps: function(n) {  this.steps = n;  },
        
        lifetimeDistance: 0,
        setLifetimeDistance: function(n) { this.lifetimeDistance = n; },
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
            setCurrent: function(n) {  this.current = n;  },
            setLast: function(n) {  this.last = n;  }
        }
    },

    cardSlots: {
        daily: null,
        custom1: null,
        custom2: null
    },
    cardUpdateInterval: null,
    setCardUpdateInterval: function(n) {
        if (this.cardUpdateInterval !== null) {
            console.log("A card interval is already set, clearing current interval");
            this.clearCardUpdateInterval();
        }
        this.cardUpdateInterval = n;
    },
    clearCardUpdateInterval: function() {
        clearInterval(this.cardUpdateInterval);
        this.cardUpdateInterval = null;
    },
    
    selectedTheme: "base",
    setSelectedTheme: function(n) {
        this.selectedTheme = n;
        // console.log("Selected theme: " + n);
    },
    toggleSelectedTheme: function() {
        if (this.selectedTheme == "dark")
            this.setSelectedTheme("base");
        else
            this.setSelectedTheme("dark");
    },
    
    batterySaverStatus: Settings.BATTERY_SAVER_OFF,
    isBatterySaverOn: function() {  return this.batterySaverStatus == Settings.BATTERY_SAVER_ON;  },
    toggleBatterySaver: function() {
        this.batterySaverStatus = this.isBatterySaverOn() ? Settings.BATTERY_SAVER_OFF : Settings.BATTERY_SAVER_ON;
        // console.log("Battery saver: " + (this.isBatterySaverOn() ? "ON" : "OFF"));
    },
    setBatterySaverStatus: function(n) {  this.batterySaverStatus = n;  }
});

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
    let data = await AsyncStorage.getItem("com.heavener-sr.user-data");
    
    if (data == null) {
        console.log("No user data saved to disk.");
        return;
    }

    // load in data
    data = JSON.parse(data);
    
    userContext.setBatterySaverStatus(data.batterySaverStatus);
    userContext.setSelectedTheme(data.selectedTheme);

    userContext.metadata.setLifetimeSteps(data.metadata.steps);
    userContext.metadata.setLifetimeDistance(data.metadata.distance);

    // load card data
    for (let cardName in data.cardsData) {
        let card = data.cardsData[cardName];
        
        if (card == null) {
            userContext.cardSlots[cardName] = null;
            continue;
        }
        
        let grid = [];

        for (let r = 0; r < 5; r++) {
            grid.push([]);
            for (let c = 0; c < 5; c++) {
                let objective = createObjectiveFromData(card.grid[r][c], userContext);
                grid[r].push( objective );
            }
        }

        userContext.cardSlots[cardName] = new BingoCard(grid, card.difficulty, card.randomSeed);
    }
};

export const exportUserData = async (userContext) => {
    // ignore certain properties
    const keysWhitelist = ["metadata", "steps", "distance", "selectedTheme", "batterySaverStatus"];

    // use JSON.stringify(obj, whitelistedKeysArr) as it neglects including functions automatically
    // whitelistedKeysArr takes in keys that are to be included, others are omitted
    // this also works for any level of the object -- for example, if d = {e: 1, f: 2, ...}
    // and d is to be included but e and f arent, then d is saved as an empty object in the serialized string
    // additionally, if e is included but d is not then neither is included bc the parent object is omitted
    // so don't be an idiot and do this. be better
    // - past travis (11:05 AM, 2-6-23)

    // JSON format data for exporting
    let formatted = JSON.parse(JSON.stringify(userContext, keysWhitelist)); // remove unnecessary properties

    // lifetime stats update
    formatted.metadata.steps += userContext.metadata.lifetimeSteps;
    formatted.metadata.distance += userContext.metadata.lifetimeDistance;

    // export bingo cards
    let cardsData = {};

    for (let key in userContext.cardSlots) {
        if (userContext.cardSlots[key] == null)
            cardsData[key] = null;
        else
            cardsData[key] = userContext.cardSlots[key].exportToDisk(userContext);
    }

    // merge together data
    formatted.cardsData = cardsData;
    
    // save data
    try {
        await AsyncStorage.setItem("com.heavener-sr.user-data", JSON.stringify(formatted));
    } catch (e) {
        console.log(e);
    }
};

/**
 * Literally deletes all user data, beware
 */
export const clearUserData = async (userContext) => {
    await AsyncStorage.removeItem("com.heavener-sr.user-data");

    userContext.metadata.setSteps(0);
    userContext.metadata.setLifetimeSteps(0);
    userContext.metadata.setDistance(0);
    userContext.metadata.setLifetimeDistance(0);

    userContext.setSelectedTheme("base");
    userContext.setBatterySaverStatus(Settings.BATTERY_SAVER_OFF);

    userContext.cardSlots.daily = null;
    userContext.cardSlots.custom1 = null;
    userContext.cardSlots.custom2 = null;

    console.log("User data cleared!");
};
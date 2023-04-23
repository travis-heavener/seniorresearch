import React from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from "./Config";
import { DistanceObjective, ExploreObjective, FreeObjective, StepsObjective } from "../objectives/CardObjectives";
import { BingoCard } from "../objectives/BingoCardManager";

export const UserDataContext = React.createContext({
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
        setXP: function(n) {  this.xp = n;  },
        addXP: function(n) {
            this.xp += n;
            while (this.xp >= Settings.XP_CONSTANTS.calculateLevelMax(this.level)) {
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
        daily: null,
        custom1: null,
        custom2: null,
        custom3: null
    },
    selectedCard: null,
    setSelectedCard: function(n) {  this.selectedCard = n;  },
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
    // else console.log("Loading user data...");

    // load in data
    data = JSON.parse(data);
    
    userContext.setBatterySaverStatus(data.batterySaverStatus);
    userContext.setPreferredUnits(data.preferredUnits);
    userContext.setSelectedTheme(data.selectedTheme);
    userContext.setSelectedIcon(data.selectedIcon);
    userContext.setSelectedCard(data.selectedCard);

    userContext.stats.setLifetimeSteps(data.metadata.steps);
    userContext.stats.setLifetimeDistance(data.metadata.distance);

    userContext.stats.setXP(data.stats.xp);
    userContext.stats.setLevel(data.stats.level);
    userContext.stats.setUsername(data.stats.username);
    userContext.stats.setIsNewUser(data.stats.isNewUser);

    userContext.stats.dailySkips = data.stats.dailySkips;
    userContext.timestamp = data.timestamp;

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

        const cardObj = new BingoCard(grid, card.difficulty, card.randomSeed, card.timestamp, card.hasAwardedCompletion);
        cardObj.checkBingos(); // fills the __bingos object so that it doesn't automatically award user free xp on loading
        userContext.cardSlots[cardName] = cardObj;
    }
};

export const exportUserData = async (userContext) => {
    // console.log("Saving user data...");
    // ignore certain properties
    const keysWhitelist = [
        "metadata",
            "steps", "distance",
        "stats",
            "xp", "level", "lifetimeBingos", "lifetimeCards", "dailySkips", "username", "isNewUser",
        "timestamp", "selectedTheme", "selectedIcon", "selectedCard", "batterySaverStatus", "preferredUnits"
    ];

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
    formatted.metadata.steps += userContext.stats.lifetimeSteps;
    formatted.metadata.distance += userContext.stats.lifetimeDistance;

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
    try {
		await AsyncStorage.removeItem("com.heavener-sr.user-data");
        console.log("Cleared async storage");
	} catch (e) {
		console.log(e);
	}

    userContext.metadata.setSteps(0);
    userContext.stats.setLifetimeSteps(0);
    userContext.metadata.setDistance(0);
    userContext.stats.setLifetimeDistance(0);
    userContext.metadata.setAcceleration({x: 0, y: 0, z: 0});

    userContext.setSelectedTheme("base");
    userContext.setSelectedIcon("Brown Panda");
    userContext.setBatterySaverStatus(Settings.BATTERY_SAVER_OFF);
    userContext.setPreferredUnits("Metric");

    userContext.stats.setXP( 0 );
    userContext.stats.setLevel( 1 );
    userContext.stats.setDailySkips( 0 );
    userContext.stats.setIsNewUser( false );
    userContext.stats.setUsername( "Player" );

    userContext.cardSlots.daily = null;
    userContext.cardSlots.custom1 = null;
    userContext.cardSlots.custom2 = null;
    userContext.cardSlots.custom3 = null;
    userContext.selectedCard = null;

    userContext.setTimestamp( Date.now() );

    console.log("User data cleared!");
};
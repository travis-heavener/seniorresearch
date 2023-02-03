import React from "react";
import { Settings } from "./Config";

export const UserDataContext = React.createContext({
    metadata: {
        steps: 0,
        setSteps: function(n) {  this.steps = n;  },
        
        distance: 0, // distance, in meters (1609.344 meters in 1 mile)
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
        console.log("Selected theme: " + n);
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
        console.log("Battery saver: " + (this.isBatterySaverOn() ? "ON" : "OFF"));
    }
});
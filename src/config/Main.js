import EventEmitter from "eventemitter3";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { Settings } from "./Config";
import { restartDeviceMotion, restartLocation, restartPedometer } from "./SensorsManager";
import { generateDailySeed } from "./Toolbox";
import { exportUserData } from "./UserDataManager";

/********* CONSTANTS *********/

export const eventEmitter = new EventEmitter();
export const showDebugLogs = false;

const debugLog = (...text) => {
    if (showDebugLogs)
        console.log("[Main.js]", ...text);
};

/************************************/

export const handleAppLoad = async (userContext, perms) => {
    debugLog("Start-up functions run now");

    // start pedometer
    if (perms.ACTIVITY_RECOGNITION) {
        restartPedometer(userContext);
    } else {
        debugLog("Missing pedometer permissions");
    }

    // start accelerometer
    restartDeviceMotion(userContext);

    // start location polling
    restartLocation(userContext);

    // initialize app tick function
    restartAppTick(userContext);
};

let appTickInterval = null;
export const restartAppTick = (userContext) => {
    debugLog("Starting new app function");
    if (appTickInterval != null)
        clearInterval(appTickInterval);
    
    // initial call to load in immediately
    handleAppTick(userContext);
    appTickInterval = setInterval(
        () => {
            handleAppTick(userContext);
        },
        Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
    );
};

export const handleAppTick = (userContext) => {
    debugLog("Game tick elapsed", (new Date()).toTimeString());

    // send user back to signup if they manage to skip the signup screen
    if (userContext.stats.isNewUser) {
        props.navigation.navigate("Signup");
        debugLog("Navigating to signup screen...");
    }

    // update timestamp
    const {lastTimestamp, currentTimestamp} = userContext.setTimestamp( Date.now() ); // returns old & current
    const lastDate = new Date(lastTimestamp), currentDate = new Date(currentTimestamp);

    // verify that daily card is not null (create one if it is)
    // OR the date has changed (create a new daily card based on this date)
    if (userContext.cardSlots.daily == null || lastDate.getDate() !== currentDate.getDate()) {
        const seed = generateDailySeed(); // create seed from Date obj
        userContext.cardSlots.daily = createBingoCard(userContext, DIFFICULTIES.NORMAL, seed);
    }

    // check cards
    for (let card of Object.values(userContext.cardSlots))
        card?.runCompletionChecks(userContext);

    // for lazy developers ONLY
    userContext.metadata.addDistance(1000);
    // userContext.metadata.setSteps(userContext.metadata.steps + 1000);
    // userContext.stats.setXP(23250); // 23,250 is max for 30 levels

    // export data
    exportUserData(userContext);

    // re-render card display
    eventEmitter.emit("remountHome"); // for some reason, keeping this at the end of the methods makes the card grid update properly
};
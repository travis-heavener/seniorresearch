import EventEmitter from "eventemitter3";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { Settings, showDebugLogs, useLazyDevMode } from "./Config";
import { restartDeviceMotion, restartLocation, restartPedometer, stopAllSensors } from "./SensorsManager";
import { generateDailySeed } from "./Toolbox";
import { exportUserData } from "./UserDataManager";

/********* CONSTANTS *********/

export const eventEmitter = new EventEmitter();

const debugLog = (...text) => {
    if (showDebugLogs)
        console.log("[Main.js]", ...text);
};

/************************************/

export const handleAppLoad = async (userContext, perms, navContext) => {
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
    restartAppTick(userContext, navContext);
};

let appTickInterval = null;
export const restartAppTick = (userContext, navContext) => {
    debugLog("Starting new tick function");
    if (appTickInterval != null)
        clearInterval(appTickInterval);
    
    // initial call to load in immediately
    handleAppTick(userContext, navContext);
    appTickInterval = setInterval(
        () => {
            handleAppTick(userContext, navContext);
        },
        Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].taskCompletionCheck
    );
};

export const stopAppTick = () => {
    debugLog("Stopping tick function");
    clearInterval(appTickInterval);
    appTickInterval = null;

    // stop all sensor APIs
    stopAllSensors();
};

export const handleAppTick = async (userContext, navContext) => {
    debugLog("Game tick elapsed", (new Date()).toTimeString());

    // cache last snapshot of userContext
    const lastStats = Object.assign({}, userContext.stats);

    // send user back to signup if they manage to skip the signup screen
    if (userContext.stats.isNewUser) {
        debugLog("Navigating to signup screen...");
        eventEmitter.emit("navigate", "Signup");
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
    if (useLazyDevMode.xp)
        userContext.stats.setXP(23250); // 23,250 is max for 30 levels
        // userContext.stats.setXP( Math.floor(Math.random() * 10000) ); // random xp
    if (useLazyDevMode.steps)
        userContext.metadata.setSteps(userContext.metadata.steps + 1000);
    if (useLazyDevMode.gps)
        userContext.metadata.addDistance(1000);

    // export data
    await exportUserData(userContext);

    // re-render focused screen
    const focusedScreen = navContext.getFocusedScreenName();
    if (focusedScreen == "Home")
        eventEmitter.emit("remountHome");
    else if (focusedScreen == "Profile") {
        eventEmitter.emit("remountProfile", {
            progressBar: (lastStats.getTotalXP() === userContext.stats.getTotalXP()) ? null : {
                current: userContext.stats.xp,
                readout: userContext.stats.xp + " XP",
                max: Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level),
                min: 0
            }
        });
    }
};
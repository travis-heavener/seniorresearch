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

    restartDeviceMotion(userContext); // start accelerometer
    restartLocation(userContext); // start location polling
    restartAppTick(userContext, navContext); // initialize app tick function
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
    const startTime = Date.now();

    debugLog("Game tick elapsed", (new Date()).toTimeString());

    // cache last snapshot of userContext
    const lastStats = Object.assign({}, userContext.stats);
    const lastGrid = userContext.cardSlots[ userContext.selectedCard ] ? [[], [], [], [], []] : null;
    
    for (let r = 0; r < 5 && lastGrid; r++) {
        for (let c = 0; c < 5; c++) {
            const obj = userContext.cardSlots[ userContext.selectedCard ].grid[r][c];
            lastGrid[r].push(
                (obj.objType == "ExploreObjective") ? (obj.targetsFound / obj.targetCount * 100) :
                (obj.objType != "FreeObjective") ? obj.getCompletionPercent(userContext) : 0
            );
        }
    }

    // update timestamp
    const {lastTimestamp, currentTimestamp} = userContext.setTimestamp( Date.now() ); // returns old & current
    const lastDate = new Date(lastTimestamp), currentDate = new Date(currentTimestamp);

    // verify that daily card is not null (create one if it is) OR the date has changed (create a new daily card based on this date)
    if (userContext.cardSlots.daily == null || lastDate.getDate() !== currentDate.getDate())
        userContext.cardSlots.daily = createBingoCard(userContext, DIFFICULTIES.NORMAL, generateDailySeed()); // create seed from Date obj

    // check cards
    for (let card of Object.values(userContext.cardSlots)) {
        card?.runCompletionChecks(userContext);
    }

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
    if (focusedScreen == "Home") {
        const card = userContext.cardSlots[ userContext.selectedCard ];

        // only remount grid if a card is selected
        if (lastGrid && card) {
            // plot the 5x5 grid with "true" where the tile must remount and "false" where it shouldn't
            const grid = lastGrid.map((arr, r) => (
                arr.map((comp, c) => {
                    const obj = card.grid[r][c];
                    const newComp = (obj.objType == "ExploreObjective") ? (obj.targetsFound / obj.targetCount * 100) :
                        (obj.objType != "FreeObjective") ? obj.getCompletionPercent(userContext) : 0;
                    return (newComp != comp);
                })
            ));

            eventEmitter.emit("remountCardGrid", { remountGrid: grid });
        }
    } else if (focusedScreen == "Profile") {
        eventEmitter.emit("remountProfile", {
            progressBar: (lastStats.getTotalXP() === userContext.stats.getTotalXP()) ? null : {
                current: userContext.stats.xp,
                readout: userContext.stats.xp + " XP",
                max: Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level),
                min: 0,
                level: userContext.stats.level
            }
        });
    } else if (focusedScreen == "Rewards") {
        eventEmitter.emit("remountRewards", {
            progressBar: (lastStats.getTotalXP() === userContext.stats.getTotalXP()) ? null : {
                current: userContext.stats.xp,
                readout: userContext.stats.xp + " XP",
                max: Settings.XP_CONSTANTS.calculateLevelMax(userContext.stats.level),
                min: 0
            }
        });
    }

    // timestamping
    debugLog("Game tick elapsed", (Date.now() - startTime) + "ms");
};
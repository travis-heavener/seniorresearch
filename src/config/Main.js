import EventEmitter from "eventemitter3";
import { DeviceEventEmitter } from "react-native";
import { createBingoCard, DIFFICULTIES } from "../objectives/BingoCardManager";
import { generateDailySeed } from "./Toolbox";
import { exportUserData } from "./UserDataManager";

/********* EVENT EMITTERS *********/

export const eventEmitter = new EventEmitter();

/************************************/

export const handleAppLoad = (userContext) => {
    console.log("Start-up functions run now");

    // initialize app tick function
    
};

export const handleAppTick = (userContext) => {
    console.log("Game tick elapsed");

    // send user back to signup if they manage to skip the signup screen
    if (userContext.stats.isNewUser) {
        props.navigation.navigate("Signup");
        console.log("Navigating to signup screen...");
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
const ICON_PATH = "../../assets/icons/";

export const rewardsList = [
    /* theme */ {level: 1 , type: "theme", iconColor: "whitesmoke", id: "base"}, // MIN LEVEL
    /* theme */ {level: 1 , type: "theme", iconColor: "#555", id: "dark"}, // MIN LEVEL
    /* theme */ {level: 10, type: "theme", iconColor: "lime", id: "rainbow"},
    /* theme */ {level: 25, type: "theme", iconColor: "pink", id: "pink"},
    /* theme */ {level: 50, type: "theme", iconColor: "#f66", id: "red"},
    /* theme */ {level: 99, type: "theme", iconColor: "gold", id: "gold"}, // MAX LEVEL

    /* icon */ {level: 1 , type: "icon", label: "Brown Panda", img: require(ICON_PATH + "brown_panda.png")}, // MIN LEVEL
    /* icon */ {level: 5 , type: "icon", label: "Blue Panda", img: require(ICON_PATH + "blue_panda.png")},
    /* icon */ {level: 15, type: "icon", label: "Orange Panda", img: require(ICON_PATH + "orange_panda.png")},
    /* icon */ {level: 30, type: "icon", label: "Pink Panda", img: require(ICON_PATH + "pink_panda.png")},
    /* icon */ {level: 50, type: "icon", label: "Red Panda", img: require(ICON_PATH + "red_panda.png")},
    /* icon */ {level: 90, type: "icon", label: "Yellow Panda", img: require(ICON_PATH + "yellow_panda.png")}, // MAX LEVEL
];

export const rewardLookup = (type, id) => {
    for (let reward of rewardsList)
        if (reward.type == type && reward.id == id)
            return reward;
    
    return null; // if nothing else is found
};
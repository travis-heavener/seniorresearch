const iconPath = "../../assets/icons/";

export const rewardsList = [
    /* themes */
    {level: 1 , type: "theme", iconColor: "#eee", id: "base"}, // MIN LEVEL
    {level: 1 , type: "theme", iconColor: "#555", id: "dark"}, // MIN LEVEL
    {level: 7, type: "theme", iconColor: "#11c217", id: "earth"},
    {level: 14, type: "theme", iconColor: "pink", id: "pink"},
    {level: 22, type: "theme", iconColor: "#f66", id: "red"},
    {level: 27, type: "theme", iconColor: "gold", id: "gold"}, // MAX LEVEL

    /* icons */
    {level: 1 , type: "icon", label: "Brown Panda",     img: require(iconPath + "brown_panda.png")}, // MIN LEVEL
    {level: 5 , type: "icon", label: "Blue Panda",      img: require(iconPath + "blue_panda.png")},
    {level: 10, type: "icon", label: "Orange Panda",    img: require(iconPath + "orange_panda.png")},
    {level: 17, type: "icon", label: "Pink Panda",      img: require(iconPath + "pink_panda.png")},
    {level: 25, type: "icon", label: "Red Panda",       img: require(iconPath + "red_panda.png")},
    {level: 30, type: "icon", label: "Yellow Panda",    img: require(iconPath + "yellow_panda.png")}, // MAX LEVEL
];

export const getUnlockedThemes = (level) => {
    const themes = [];

    for (let reward of rewardsList) {
        if (reward.type == "theme" && reward.level <= level)
            themes.push(reward);
    }

    return themes.sort((a,b) => a.level-b.level);
};

export const getUnlockedIcons = (level) => {
    const icons = [];

    for (let reward of rewardsList) {
        if (reward.type == "icon" && reward.level <= level)
            icons.push(reward);
    }

    return icons.sort((a,b) => a.level-b.level);
};

export const themeLookup = (id) => {
    for (let reward of rewardsList)
        if (reward.type == "theme" && reward.id == id)
            return reward;
    
    return null; // if nothing else is found
};

export const iconLookup = (label) => {
    for (let reward of rewardsList)
        if (reward.type == "icon" && reward.label == label)
            return reward;
    
    return {img: null}; // if nothing else is found
};
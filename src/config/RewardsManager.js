export const rewardsList = [
    {level: 1 , type: "theme", id: "dark"}, // MIN LEVEL
    {level: 10, type: "theme", id: "rainbow"},
    {level: 25, type: "theme", id: "pink"},
    {level: 50, type: "theme", id: "gold"},
    {level: 99, type: "theme", id: "gold"}, // MAX LEVEL
];

export const rewardLookup = (type, id) => {
    for (let reward of rewardsList)
        if (reward.type == type && reward.id == id)
            return reward;
    
    return null; // if nothing else is found
};
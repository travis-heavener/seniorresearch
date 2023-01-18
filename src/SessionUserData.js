import React from "react";

export const UserDataContext = React.createContext({
    metadata: {
        steps: 0,
        distanceTraveled: 0,
        velocity: 0,
        acceleration: 0,
    },
    selectedTheme: "base"
});
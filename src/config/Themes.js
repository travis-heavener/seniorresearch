export const Themes = {
    base: {
        home: {
            stopped: "rgb(255, 196, 194)",
            fast: "rgb(109, 227, 114)"
        },
        settings: {
            primary: "#f0f0f0", primaryAccent: "#e3e3e3",
            secondary: "#e4e4e4", secondaryAccent: "#d6d6d6",
            text: "#031c0a", modalText: "#222",
            modalBorder: "#333", modalTop: "#eee", modalBottom: "#ddd",
            modalConfirm: "cornflowerblue"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696"
        },
        cards: {
            checkedTile: "#63e06e", uncheckedTile: "#e8dbcc",
            easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147",
            labelText: "#161616"
        },
        cardDisplay: {
            modalBorder: "#333", modalBackground: "#e6e6e6", modalText: "#222",
            modalReject: "#fff", modalConfirm: "cornflowerblue"
        },
        profile: {
            userInfo: "#d0d0d0", iconBackground: "cornflowerblue", iconAccent: "#b1cbfc", stats: "#e0e0e0",
            statsColumn: "#f0f0f0", statsBorder: "#d0d0d0",
            themes: "#e8e8e8", text: "#222"
        },
        rewards: {
            background: "#eee", entryBackground: "white",
            borderColor: "#222", separatorColor: "whitesmoke",
            text: "#333", unlockedText: "#111", lockedText: "#777"
        },
        misc: {
            progressBarColor: "cornflowerblue",
            switchColor: "#84b2fa", switchBorderColor: "#6194e6"
        }
    },
    dark: {
        home: {
            stopped: "rgb(66, 66, 66)",
            fast: "rgb(135, 191, 250)"
        },
        settings: {
            primary: "#363636", primaryAccent: "#2a2a2a",
            secondary: "#2f2f2f", secondaryAccent: "#252525",
            text: "#f5f5f5", modalText: "#f5f5f5",
            modalBorder: "#080808", modalTop: "#333", modalBottom: "#444",
            modalConfirm: "cornflowerblue"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696"
        },
        cards: {
            checkedTile: "#63e06e", uncheckedTile: "#e8dbcc",
            easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147",
            labelText: "#e7e7e7"
        },
        cardDisplay: {
            modalBorder: "#111", modalBackground: "#333", modalText: "#f5f5f5",
            modalReject: "#444", modalConfirm: "#db9927"
        },
        profile: {
            userInfo: "#202020", iconBackground: "#db9927", iconAccent: "#fac76e", stats: "#303030",
            statsColumn: "#505050", statsBorder: "#1a1a1a",
            themes: "#393939", text: "#eee"
        },
        rewards: {
            background: "#333", entryBackground: "#505050",
            borderColor: "#222", separatorColor: "#404040",
            text: "#f0f0f0", unlockedText: "#eee", lockedText: "#aaa"
        },
        misc: {
            progressBarColor: "#db9927",
            switchColor: "#84b2fa", switchBorderColor: "#6194e6"
        }
    }, 
    earth: {
        home: {
            stopped: "rgb(19, 148, 25)",
            fast: "rgb(69, 222, 76)"
        },
        settings: {
            primary: "#6be86e", primaryAccent: "#4db34f",
            secondary: "#188c1b", secondaryAccent: "#117314",
            text: "#031c0a", modalText: "#222",
            modalBorder: "#333", modalTop: "#eee", modalBottom: "#ddd",
            modalConfirm: "#11c217"
        },
        tasks: {
            primary: "#9cd69e", primaryAccent: "#c0f0c1",
            secondary: "#6cb86e", secondaryAccent: "#509452"
        },
        cards: {
            checkedTile: "#63e06e", uncheckedTile: "#c1e3c1",
            easy: "#44cc3f", normal: "#d6ae47", hard: "#c45147",
            labelText: "#161616"
        },
        cardDisplay: {
            modalBorder: "#333", modalBackground: "#bfb", modalText: "#222",
            modalReject: "#dfd", modalConfirm: "#11c217"
        },
        profile: {
            userInfo: "#88e088", iconBackground: "#48d948", iconAccent: "#84f084", stats: "#99e099",
            statsColumn: "#cfc", statsBorder: "#88d088",
            themes: "#aae0aa", text: "#222"
        },
        rewards: {
            background: "#aea", entryBackground: "#cfc",
            borderColor: "#252", separatorColor: "#beb",
            text: "#131", unlockedText: "#111", lockedText: "#777"
        },
        misc: {
            progressBarColor: "#28bf30",
            switchColor: "#11c217", switchBorderColor: "#0fa614"
        }
    },
    get pink() { // placeholder for theme (TBI)
        return this.base;
    },
    get red() { // placeholder for theme (TBI)
        return this.base;
    },
    get gold() { // placeholder for theme (TBI)
        return this.base;
    }
};
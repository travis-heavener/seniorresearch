export const Themes = {
    base: {
        home: {
            backgrounds: {
                stopped: "rgb(255, 196, 194)",
                fast: "rgb(109, 227, 114)"
            }
        },
        settings: {
            primary: "#f0f0f0", primaryAccent: "#e3e3e3",
            secondary: "#e4e4e4", secondaryAccent: "#d6d6d6",
            text: "#031c0a"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696"
        },
        cards: {
            checkedTile: "#63e06e",
            uncheckedTile: "#e8dbcc",
            easy: "#44cc3f",
            normal: "#d6ae47",
            hard: "#c45147"
        },
        cardDisplay: {
            modalBorder: "#333",
            modalBackground: "#e6e6e6",
            modalText: "#222",
            modalReject: "#fff",
            modalConfirm: "cornflowerblue"
        },
        profile: {
            userInfo: "#d0d0d0",
            stats: "#e0e0e0",
            statsColumn: "#f0f0f0",
            statsBorder: "#d0d0d0",
            themes: "#e8e8e8",
            text: "#222"
        },
        rewards: {
            background: "#eee",
            text: "#333",
            entryBackground: "white",
            separatorColor: "whitesmoke",
            unlockedText: "#111",
            lockedText: "#777"
        }
    },
    dark: {
        home: {
            backgrounds: {
                stopped: "rgb(66, 66, 66)",
                fast: "rgb(135, 191, 250)"
            }
        },
        settings: {
            primary: "#363636", primaryAccent: "#2a2a2a",
            secondary: "#2f2f2f", secondaryAccent: "#252525",
            text: "#f5f5f5"
        },
        tasks: {
            primary: "#f7bcbc", primaryAccent: "#fad9d9",
            secondary: "#e3a6a6", secondaryAccent: "#d39696"
        },
        cards: {
            checkedTile: "#63e06e",
            uncheckedTile: "#e8dbcc",
            easy: "#44cc3f",
            normal: "#d6ae47",
            hard: "#c45147"
        },
        cardDisplay: {
            modalBorder: "#111",
            modalBackground: "#333",
            modalText: "#f5f5f5",
            modalReject: "#444",
            modalConfirm: "cornflowerblue"
        },
        profile: {
            userInfo: "#202020",
            stats: "#303030",
            statsColumn: "#505050",
            statsBorder: "#1a1a1a",
            themes: "#393939",
            text: "#eee"
        },
        rewards: {
            background: "#333",
            text: "#f0f0f0",
            entryBackground: "#282828",
            separatorColor: "#333",
            unlockedText: "#eee",
            lockedText: "#aaa"
        }
    }, 
    get rainbow() { // placeholder for theme (TBI)
        return this.base;
    },
    get pink() { // placeholder for theme (TBI)
        return this.base;
    },
    get red() { // placeholder for theme (TBI)
        return this.base;
    }
};
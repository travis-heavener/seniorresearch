import { DistanceObjective, ExploreObjective, FreeObjective, StepsObjective } from "./CardObjectives";
import { generateSeed, Random } from "../config/Toolbox";
import { Settings } from "../config/Config";

export const DIFFICULTIES = {
    EASY: 1,
    NORMAL: 2.5,
    HARD: 5
};

export class BingoCard {
    constructor(objectivesArray, difficulty, seed, timestamp=Date.now(), hasAwardedCompletion=false) {
        this.grid = objectivesArray;
        this.difficulty = difficulty;
        this.timestamp = timestamp;

        this.hasAwardedCompletion = hasAwardedCompletion; // true once board is completed and has awarded the user

        this.randomSeed = seed;
        
        this.runCompletionChecks = function(userContext) {
            const { XP_CONSTANTS } = Settings;
            const savedBingos = JSON.parse( JSON.stringify( this.__bingos ) );

            // check cards for completion
            for (let card of this.grid.flat())
                if (card.completionCheck)
                    card.completionCheck(userContext);
            
            const newBingos = this.checkBingos(); // record which rows/cols/diags have bingos

            // handle if a new bingo appears
            const handleNewBingo = () => {
                const multiplier = this.difficulty == DIFFICULTIES.EASY ? 1
                    : this.difficulty == DIFFICULTIES.NORMAL ? 2 : 3;
                
                // award xp
                userContext.stats.addXP(
                    !this.hasFirstBingo
                    ? XP_CONSTANTS.firstBingo * multiplier
                    : XP_CONSTANTS.genericBingo * multiplier
                );
                
                // save to user stats
                // handle if card is completed
                if ( this.checkIsCompleted() && !this.hasAwardedCompletion ) {
                    userContext.stats.addXP( XP_CONSTANTS.completion * multiplier );
                    this.hasAwardedCompletion = true;
                    console.log("Board completion!");
                }

                // make sure this card knows there's been a bingo
                this.hasFirstBingo = true;
            };

            for (let r = 0; r < 5; r++)
                if (savedBingos.rows[r] != newBingos.rows[r] && newBingos.rows[r]) // new row bingo
                    handleNewBingo();
            
            for (let c = 0; c < 5; c++)
                if (savedBingos.cols[c] != newBingos.cols[c] && newBingos.cols[c]) // new column bingo
                    handleNewBingo();

            // new top left down diagonal bingo
            if (savedBingos.topLeftDownDiag != newBingos.topLeftDownDiag && newBingos.topLeftDownDiag)
                handleNewBingo();
            
            // new top right down diagonal bingo
            if (savedBingos.topRightDownDiag != newBingos.topRightDownDiag && newBingos.topRightDownDiag)
                handleNewBingo();
        }

        this.__bingos = {
            rows: [false, false, false, false, false],
            cols: [false, false, false, false, false],
            topLeftDownDiag: false,
            topRightDownDiag: false,
            hasFirstBingo: false // true once one bingo has been completed
        };
    }

    exportToDisk(userContext) {
        let cardData = {
            grid: [],
            difficulty: this.difficulty,
            randomSeed: this.randomSeed,
            timestamp: this.timestamp,
            hasAwardedCompletion: this.hasAwardedCompletion
        };
        
        for (let r = 0; r < 5; r++) {
            cardData.grid.push([]);

            for (let c = 0; c < 5; c++) {
                let data = this.grid[r][c].exportToDisk(userContext);
                cardData.grid[r].push(data);
            }
        }

        return cardData;
    }

    print() {
        let str = "BingoCard: [";
        for (let r = 0; r < 5; r++) {
            str += "\n\t";
            for (let c = 0; c < 5; c++) {
                // str += this.grid[r][c].label + (this.grid[r][c].stepGoal | 0) + (this.grid[r][c].distanceGoal | 0) + ", "
                str += this.grid[r][c].label + ", "
            }
        }
        str += "\n]";
    }

    checkIsCompleted() {
        for (let obj of this.grid.flat())
            if (!obj.isCompleted) return false;
        
        // otherwise, return true
        return true;
    }

    checkBingos() {
        let completionGrid = [[], [], [], [], []];
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                completionGrid[r].push(this.grid[r][c].isCompleted);

        // check diagonals
        if (!this.__bingos.topLeftDownDiag) {
            let topLeftDownDiag = true;
            for (let i = 0; i < 5 && topLeftDownDiag; i++)
                if (!completionGrid[i][i])
                    topLeftDownDiag = false; // if tile is false, skip diagonal checking
            this.__bingos.topLeftDownDiag = topLeftDownDiag;
        }

        if (!this.__bingos.topRightDownDiag) {
            let topRightDownDiag = true;
            for (let i = 0; i < 5 && topRightDownDiag; i++)
                if (!completionGrid[i][4-i])
                    topRightDownDiag = false; // if tile is false, skip diagonal checking
            this.__bingos.topRightDownDiag = topRightDownDiag;
        }

        // check horizontals
        for (let r = 0; r < 5; r++) {
            if (this.__bingos.rows[r]) continue; // skip row if this has a bingo

            let rowHasBingo = true;
            for (let c = 0; c < 5 && rowHasBingo; c++) {
                if (!completionGrid[r][c]) rowHasBingo = false;
            }
            this.__bingos.rows[r] = rowHasBingo;
        }

        // check verticals
        for (let c = 0; c < 5; c++) {
            if (this.__bingos.cols[c]) continue; // skip column if this has a bingo
            
            let colHasBingo = true;
            for (let r = 0; r < 5 && colHasBingo; r++) {
                if (!completionGrid[r][c]) colHasBingo = false;
            }
            this.__bingos.cols[c] = colHasBingo;
        }

        return this.__bingos;
    }

	getCompletionPercent() {
		let count = 0, total = this.grid.flat().length;
		
		for (let obj of this.grid.flat())
			count += obj.isCompleted;
		
		return Math.round(count / total * 100);
	}
}

export const createBingoCard = (currentUserContext, difficulty=-1, seed=null, timestamp=Date.now()) => {
    if (difficulty == -1) {
        let diffIndex = Math.floor(Math.random() * 3);
        difficulty = [DIFFICULTIES.EASY, DIFFICULTIES.NORMAL, DIFFICULTIES.HARD][diffIndex];
    }
    
    // generate seed at a later date to re-roll the same card
    seed = seed ?? generateSeed(); // overwrite if null value
    const random = new Random(seed);

    // different types of objectives (can't encourage speed objectives because player could feel they need to drive)
    // two types of objectives:
    // player activation (ie. find a red car, find water) and
    // automatic activation (ie. step count, distance)

    // generate 5x5 grid (w/ free space in center)
    let grid = [ new Array(5), new Array(5), new Array(5), new Array(5), new Array(5) ];
    const args = [difficulty, currentUserContext, random.next];
    const MAX_RANDOMS = 25, MAX_OCCURANCES = 1;

    // generate free space
    grid[2][2] = new FreeObjective("free", ...args);

    // generate cross pattern for steps & distance objectives
    let currentSpace = "Distance";
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (r % 2 == c % 2 && !grid[r][c]) { // if the row and column are in pattern & not a free space
                grid[r][c] = (currentSpace == "Distance")
                    ? new DistanceObjective("distance", ...args)
                    : new StepsObjective("steps", ...args);
                
                currentSpace = (currentSpace == "Distance") ? "Steps" : "Distance";
            }
        }
    }

    // fill remaining tiles with explore objectives
    const objCounts = {}; // store how many times an explore objective is displayed
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (grid[r][c]) continue; // skip over already-filled tiles
            
            const pos = {row: r, col: c};
            let n = 0;
            let obj = new ExploreObjective("findSomething", ...args);
            
            while (++n < MAX_RANDOMS && objCounts[obj.displayText] >= MAX_OCCURANCES) {
                obj = new ExploreObjective("findSomething", ...args);
            };

            // store how many times an explore objective is displayed
            if (objCounts[obj.displayText])
                objCounts[obj.displayText]++;
            else
                objCounts[obj.displayText] = 1;
            
            grid[r][c] = obj;
        }
    }

    return new BingoCard(grid, difficulty, seed, timestamp);
};
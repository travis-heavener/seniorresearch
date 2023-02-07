import { DistanceObjective, ExploreObjective, FreeObjective, StepsObjective } from "./CardObjectives";
import { generateSeed, Random } from "./Toolbox";

export const DIFFICULTIES = {
    EASY: 1,
    NORMAL: 2.5,
    HARD: 5
};

export class BingoCard {
    constructor(objectivesArray, difficulty, seed) {
        this.grid = objectivesArray;
        this.difficulty = difficulty;

        this.randomSeed = seed;
        
        this.runCompletionChecks = function(userContext) {
            for (let card of this.grid.flat())
                if (card.completionCheck)
                    card.completionCheck(userContext);
            
            this.checkBingos(); // record which rows/cols/diags have bingos
        }

        this.bingos = {
            rows: [false, false, false, false, false],
            cols: [false, false, false, false, false],
            topLeftDownDiag: false,
            topRightDownDiag: false
        };
    }

    exportToDisk(userContext) {
        let cardData = {grid: [], difficulty: this.difficulty, randomSeed: this.randomSeed};
        
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

    checkBingos() {
        let completionGrid = [[], [], [], [], []];
        for (let r = 0; r < 5; r++)
            for (let c = 0; c < 5; c++)
                completionGrid[r].push(this.grid[r][c].isCompleted);

        // check diagonals
        if (!this.bingos.topLeftDownDiag) {
            let topLeftDownDiag = true;
            for (let i = 0; i < 5 && topLeftDownDiag; i++)
                if (!completionGrid[i][i])
                    topLeftDownDiag = false; // if tile is false, skip diagonal checking
            this.bingos.topLeftDownDiag = topLeftDownDiag;
        }

        if (!this.bingos.topRightDownDiag) {
            let topRightDownDiag = true;
            for (let i = 0; i < 5 && topRightDownDiag; i++)
                if (!completionGrid[i][4-i])
                    topRightDownDiag = false; // if tile is false, skip diagonal checking
            this.bingos.topRightDownDiag = topRightDownDiag;
        }

        // check horizontals
        for (let r = 0; r < 5; r++) {
            if (this.bingos.rows[r]) continue; // skip row if this has a bingo

            let rowHasBingo = true;
            for (let c = 0; c < 5 && rowHasBingo; c++) {
                if (!completionGrid[r][c]) rowHasBingo = false;
            }
            this.bingos.rows[r] = rowHasBingo;
        }

        // check verticals
        for (let c = 0; c < 5; c++) {
            if (this.bingos.cols[c]) continue; // skip column if this has a bingo
            
            let colHasBingo = true;
            for (let r = 0; r < 5 && colHasBingo; r++) {
                if (!completionGrid[r][c]) colHasBingo = false;
            }
            this.bingos.cols[c] = colHasBingo;
        }

        return this.bingos;
    }
}

export const createBingoCard = (currentUserContext, difficulty=-1) => {
    if (difficulty == -1) {
        let diffIndex = Math.floor(Math.random() * 3);
        difficulty = [DIFFICULTIES.EASY, DIFFICULTIES.NORMAL, DIFFICULTIES.HARD][diffIndex];
    }
    
    // generate seed at a later date to re-roll the same card
    const seed = generateSeed(),
        random = new Random(seed);

    // different types of objectives (can't encourage speed objectives because player could feel they need to drive)
    // two types of objectives:
    // player activation (ie. find a red car, find water) and
    // automatic activation (ie. step count, distance)

    let objMap = [ // list objective labels and respective weights
        {label: "steps", weight: 1},
        {label: "distance", weight: 1},
        {label: "findSomething", weight: 2}
    ].map(elem => { // append all labels to an array n times, where n is the weight of each label
        let labels = [];
        for (let i = 0; i < elem.weight; i++)
            labels.push(elem.label);
        return labels;
    }).flat(); // flatten to remove arrays returned within the array

    const genRandom = () => {
        // later rely on seeds, this works for now
        let index = Math.floor( random.next() * objMap.length );
        return objMap[index];
    };

    // generate 5x5 grid (w/ free space in center)
    let grid = [];
    for (let r = 0; r < 5; r++) {
        grid.push([]);
        for (let c = 0; c < 5; c++) {
            let label = (r == 2 && c == 2) ? "free" : genRandom();
            
            let args = [label, difficulty, currentUserContext, random.next];

            if (label == "steps") {
                grid[r].push( new StepsObjective(...args) );
            } else if (label == "distance") {
                grid[r].push( new DistanceObjective(...args ) );
            } else if (label == "free") {
                grid[r].push( new FreeObjective(...args) );
            } else {
                grid[r].push( new ExploreObjective(...args) );
            }
        }
    }

    return new BingoCard(grid, difficulty, seed);
};
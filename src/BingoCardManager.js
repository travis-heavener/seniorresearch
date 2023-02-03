export const DIFFICULTIES = {
    EASY: 1,
    NORMAL: 2.5,
    HARD: 5
};

class CardObjective {
    constructor(label, difficulty, userContext) {
        this.label = label;
        this.difficulty = difficulty;

        this.isCompleted = (label == "free"); // false unless tile is a free space

        if (label == "steps") {
            // generate step goal
            let max = 1500, min = 750; // NOTE: this scales based on difficulty (ie. normal -> min: 1875/max: 3750)
            let stepGoal = difficulty * Math.floor( Math.random() * (max-min) + min );
            stepGoal = Math.round( stepGoal / 50 ) * 50; // round to nearest 50

            this.startingSteps = userContext.metadata.steps;
            this.stepGoal = stepGoal;

            // checking for completion
            this.completionCheck = (userContext) => {
                if (this.isCompleted) return true;

                this.isCompleted = (userContext.metadata.steps - this.startingSteps) >= this.stepGoal;
                return this.isCompleted;
            };
        } else {
            // handle player-triggered completion events
            this.triggerPlayerCompletion = () => this.isCompleted = true;
        }
    }
}

class BingoCard {
    constructor(objectivesArray, difficulty) {
        this.grid = objectivesArray;
        this.difficulty = difficulty;
        this.uuid = generateUUID();
        
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

export const createBingoCard = (difficulty, currentUserContext) => {
    // generate seed at a later date to re-roll the same card

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
        let index = Math.floor( Math.random() * objMap.length );
        return objMap[index];
    };

    // generate 5x5 grid (w/ free space in center)
    let grid = [];
    for (let r = 0; r < 5; r++) {
        grid.push([]);
        for (let c = 0; c < 5; c++) {
            let label = (r == 2 && c == 2) ? "free" : genRandom();
            
            grid[r].push( new CardObjective(label, difficulty, currentUserContext) );
        }
    }

    return new BingoCard(grid, difficulty);
};

/* ============ HANDY FUNCTIONS ============ */

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
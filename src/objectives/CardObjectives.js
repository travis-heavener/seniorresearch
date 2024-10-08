import { kilometersToMiles, toTitleCase } from "../config/Toolbox";

export class CardObjective {
    constructor(label, difficulty, userContext) {
        this.label = label;
        this.difficulty = difficulty;

        this.isCompleted = false;

        this.objType = "CardObjective";
    }

    exportToDisk() {
        return {
            label: this.label,
            difficulty: this.difficulty
        };
    }

    loadFromDisk(data) {
        this.label = data.label;
        this.difficulty = data.difficulty;
    }

    toString() {
        return this.label;
    }
}

export class FreeObjective extends CardObjective {
    constructor(label, difficulty, userContext, random) {
        super(label, difficulty, userContext);

        this.isCompleted = true;
        this.objType = "FreeObjective";

        this.completionCheck = () => true; // always completed bc it's a free space, duh
    }

    exportToDisk(userContext) {
        return super.exportToDisk(); // run superclass method
    }

    loadFromDisk(data) {
        super.loadFromDisk(data);
    }

    toString() {
        return "Free";
    }
}

export class DistanceObjective extends CardObjective {
    constructor(label, difficulty, userContext, random=Math.random) {
        super(label, difficulty, userContext);

        this.objType = "DistanceObjective";

        // generate distance goal
        let max = 1000, min = 500; // NOTE: this scales based on difficulty, in meters
        let distanceGoal = difficulty * Math.floor( random() * (max-min) + min );
        distanceGoal = Math.round( distanceGoal / 50 ) * 50; // round to nearest 50

        this.startingDistance = userContext.metadata.distance; // starting distance as of this app load, not from local storage
        this.distanceGoal = distanceGoal;
        this.savedDistanceRemaining = distanceGoal; // overwritten by loadFromDisk, if applicable
        
        // checking for completion
        this.completionCheck = (userContext) => {
            // if (this.isCompleted) return true;

            // counts how many steps from start to current and checks if its more than the goal minus how many were saved to the disk
            this.isCompleted = (userContext.metadata.distance - this.startingDistance) >= this.savedDistanceRemaining;
            return this.isCompleted;
        };
    }

    getCompletionPercent(userContext) {
        return Math.min(this.getStatus(userContext) / this.distanceGoal * 100, 100);
    }

    getStatus(userContext) {
        return Math.min(this.distanceGoal, this.distanceGoal - this.savedDistanceRemaining - this.startingDistance + userContext.metadata.distance);
    }

    getStatusString(userContext) {
        let dist = this.getStatus(userContext)/1000;
        if (userContext.preferredUnits == "Imperial") dist = kilometersToMiles(dist);
        return (dist).toFixed(2) + (userContext.preferredUnits == "Metric" ? " km" : " mi");
    }

    exportToDisk(userContext) {
        return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            distanceGoal: this.distanceGoal,
            distanceRemaining: this.savedDistanceRemaining - (userContext.metadata.distance - this.startingDistance),
            isCompleted: this.completionCheck(userContext)
        };
    }

    loadFromDisk(data) {
        super.loadFromDisk(data);
        this.startingDistance = 0;
        this.distanceGoal = data.distanceGoal;
        this.savedDistanceRemaining = data.distanceRemaining;
        this.isCompleted = data.isCompleted;
    }

    toString(userContext) {
        let dist = (this.distanceGoal / 1000);
        
        if (userContext.preferredUnits == "Imperial")
            dist = kilometersToMiles(dist);
        
            return dist.toFixed(2) + (userContext.preferredUnits == "Metric" ? " km" : " mi");
    }
}

export class StepsObjective extends CardObjective {
    constructor(label, difficulty, userContext, random=Math.random) {
        super(label, difficulty, userContext);
        
        this.objType = "StepsObjective";

        // generate step goal
        let max = 1500, min = 750; // NOTE: this scales based on difficulty (ie. normal -> min: 1875/max: 3750)
        let stepGoal = difficulty * Math.floor( random() * (max-min) + min );
        stepGoal = Math.round( stepGoal / 5 ) * 5; // round to nearest 50

        this.startingSteps = userContext.metadata.steps;
        this.stepGoal = stepGoal;
        this.savedStepsRemaining = stepGoal; // overwritten by loadFromDisk, if applicable

        // checking for completion
        this.completionCheck = (userContext) => {
            // if (this.isCompleted) return true;

            // counts how many steps from start to current and checks if its more than the goal minus how many were saved to the disk
            this.isCompleted = (userContext.metadata.steps - this.startingSteps) >= this.savedStepsRemaining;
            return this.isCompleted;
        };
    }

    getCompletionPercent(userContext) {
        return Math.min(this.getStatus(userContext) / this.stepGoal * 100, 100);
    }

    getStatus(userContext) {
        return Math.min(this.stepGoal, this.stepGoal - this.savedStepsRemaining - this.startingSteps + userContext.metadata.steps);
    }

    getStatusString(userContext) {
        return this.getStatus(userContext) + " steps";
    }

    exportToDisk(userContext) {
        return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            stepGoal: this.stepGoal,
            stepsRemaining: this.savedStepsRemaining - (userContext.metadata.steps - this.startingSteps),
            isCompleted: this.completionCheck(userContext)
        };
    }

    loadFromDisk(data) {
        super.loadFromDisk(data);
        this.startingSteps = 0;
        this.stepGoal = data.stepGoal;
        this.savedStepsRemaining = data.stepsRemaining;
        this.isCompleted = data.isCompleted;
    }

    toString() {
        return this.stepGoal + " steps";
    }
}

export class ExploreObjective extends CardObjective {
    constructor(label, difficulty, userContext, random=Math.random) {
        super(label, difficulty, userContext);

        this.objType = "ExploreObjective";

		this.completionCheck = () => this.isCompleted;

        // handle player-triggered completion events
        this.triggerPlayerCompletion = () => {
            this.targetsFound++; // add to the total number found
            this.isCompleted = (this.targetCount == this.targetsFound); // mark true if all objectives have been found
        };

        this.targetCount = 1; // how many of this objective MUST be found
        this.targetsFound = 0; // how many of this objective HAVE been found

        // declare objectives
        const randomObjPool = {
            easy: [
                { name: "sign", variants: ["stop", "yield", "crosswalk", "railroad", "school zone"] },
                { name: "street name", count: 5 },
                { name: "tree", variants: ["tall", "short"], count: 3 },
                { name: "car", variants: ["red", "green", "yellow", "blue", "gray", "white", "black"] },
                { name: "bush", count: 5 },
                { name: "pond" },
                { name: "dog", count: 3 },
                { name: "cat", count: 3 },
                { name: "trash can", count: 5 },
                { name: "fire hydrant", count: 2 }
            ],
            normal: [
                { name: "school bus" },
                { name: "flower bed", count: 3 },
                { name: "bicycle" },
                { name: "motorcycle" },
                { name: "skateboard" },
                { name: "scooter" },
            ],
            hard: [
                { name: "taxi" },
                { name: "public bus" },
                { name: "train" },
                { name: "limousine" },
                { name: "helicopter" },
                { name: "statue" },
            ]
        };

        // create obj pool from difficulty setting
        let objPool = randomObjPool.easy.slice(0); // shallow clone array
        
        // NOTE: THE VALUES FOR EACH DIFFICULTY ARE HARD CODED HERE TO PREVENT "REQUIRE CYCLES" WARNING
        // SEE https://stackoverflow.com/questions/55664673/require-cycles-are-allowed-but-can-result-in-uninitialized-values-consider-ref
        if (difficulty >= 2.5) objPool = objPool.concat(...randomObjPool.normal);
        if (difficulty == 5) objPool = objPool.concat(...randomObjPool.hard);

        // pick random
        const randomFromArr = arr => arr[ Math.floor(arr.length * random()) ];

        const randomType = randomFromArr( objPool );
        const randomVariant = randomType.variants ? randomFromArr( randomType.variants ) : null;

        this.displayText = (randomVariant ? randomVariant + " " : "") + randomType.name + (randomType.count > 1 ? " (" + randomType.count + ")" : "");
        this.targetCount = randomType.count ?? 1;
    }

	exportToDisk(userContext) {
		return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            isCompleted: this.isCompleted,
            displayText: this.displayText,
            targetCount: this.targetCount,
            targetsFound: this.targetsFound
        };
	}

	loadFromDisk(data) {
        super.loadFromDisk(data);
		this.isCompleted = data.isCompleted;
        this.displayText = data.displayText;
        this.targetCount = data.targetCount;
        this.targetsFound = data.targetsFound;
	}

    toString() {
        return toTitleCase( this.displayText );
    }
}
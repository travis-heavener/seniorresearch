import { toTitleCase } from "../config/Toolbox";

export class CardObjective {
    constructor(label, difficulty, userContext) {
        this.label = label;
        this.difficulty = difficulty;

        this.isCompleted = false;
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

    getRemaining(userContext) {
        return this.distanceGoal - this.savedDistanceRemaining + userContext.metadata.distance;
    }

    getStatusString(userContext) {
        return (this.getRemaining(userContext)*1000).toFixed(2) + " km";
    }

    exportToDisk(userContext) {
        return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            distanceGoal: this.distanceGoal,
            distanceRemaining: this.distanceGoal - (userContext.metadata.distance - this.startingDistance),
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

    toString() {
        return (this.distanceGoal / 1000).toFixed(2) + " km"
    }
}

export class StepsObjective extends CardObjective {
    constructor(label, difficulty, userContext, random=Math.random) {
        super(label, difficulty, userContext);

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

    getRemaining(userContext) {
        return this.stepGoal - this.savedStepsRemaining + userContext.metadata.steps;
    }

    getStatusString(userContext) {
        return this.getRemaining(userContext) + " steps";
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

		this.completionCheck = () => this.isCompleted;

        // handle player-triggered completion events
        this.triggerPlayerCompletion = () => this.isCompleted = true; // when triggered, objective is checked

        // declare objectives
        const randomObjPool = [
            { name: "tree", variants: ["tall", "short"] },
            { name: "bush" },
            { name: "flower bed" },
            { name: "school bus" },
            { name: "public bus" },
            { name: "taxi" },
            { name: "car", variants: ["red", "green", "yellow", "blue", "gray", "white", "black"] },
            { name: "bicycle" },
            { name: "motorcycle" },
            { name: "skateboard" },
            { name: "scooter" },
            { name: "sign", variants: ["stop", "yield", "crosswalk", "railroad", "school zone"] }
        ];

        // pick random
        const randomFromArr = arr => arr[ Math.floor(arr.length * random()) ];

        const randomType = randomFromArr( randomObjPool );
        const randomVariant = randomType.variants ? randomFromArr( randomType.variants ) : null;

        this.displayText = (randomVariant ? randomVariant + " " : "") + randomType.name;
    }

	exportToDisk(userContext) {
		return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            isCompleted: this.isCompleted,
            displayText: this.displayText
        };
	}

	loadFromDisk(data) {
        super.loadFromDisk(data);
		this.isCompleted = data.isCompleted;
        this.displayText = data.displayText;
	}

    toString() {
        return toTitleCase( this.displayText );
    }
}
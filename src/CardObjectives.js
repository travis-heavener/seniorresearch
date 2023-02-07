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
}

export class FreeObjective extends CardObjective {
    constructor(label, difficulty, userContext) {
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
}

export class DistanceObjective extends CardObjective {
    constructor(label, difficulty, userContext) {
        super(label, difficulty, userContext);

        // generate distance goal
        let max = 1000, min = 500; // NOTE: this scales based on difficulty, in meters
        let distanceGoal = difficulty * Math.floor( Math.random() * (max-min) + min );
        distanceGoal = Math.round( distanceGoal / 50 ) * 50; // round to nearest 50

        this.startingDistance = userContext.metadata.distance;
        this.distanceGoal = distanceGoal;

        // checking for completion
        this.completionCheck = (userContext) => {
            if (this.isCompleted) return true;

            // counts how many steps from start to current and checks if its more than the goal minus how many were saved to the disk
            this.isCompleted = (userContext.metadata.distance - this.startingDistance) >= this.distanceGoal - (this.savedDistanceRemaining | 0);
            return this.isCompleted;
        };
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
        this.savedDistanceRemaining = data.DistanceRemaining;
        this.isCompleted = data.isCompleted;
    }
}

export class StepsObjective extends CardObjective {
    constructor(label, difficulty, userContext) {
        super(label, difficulty, userContext);

        // generate step goal
        let max = 1500, min = 750; // NOTE: this scales based on difficulty (ie. normal -> min: 1875/max: 3750)
        let stepGoal = difficulty * Math.floor( Math.random() * (max-min) + min );
        stepGoal = Math.round( stepGoal / 50 ) * 50; // round to nearest 50

        this.startingSteps = userContext.metadata.steps;
        this.stepGoal = stepGoal;

        // checking for completion
        this.completionCheck = (userContext) => {
            if (this.isCompleted) return true;

            // counts how many steps from start to current and checks if its more than the goal minus how many were saved to the disk
            this.isCompleted = (userContext.metadata.steps - this.startingSteps) >= this.stepGoal - (this.savedStepsRemaining | 0);
            return this.isCompleted;
        };
    }

    exportToDisk(userContext) {
        return {
            ...super.exportToDisk(), // run superclass method

            // class specifics
            stepGoal: this.stepGoal,
            stepsRemaining: this.stepGoal - (userContext.metadata.steps - this.startingSteps),
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
}

export class ExploreObjective extends CardObjective {
    constructor(label, difficulty, userContext) {
        super(label, difficulty, userContext);

        // handle player-triggered completion events
        this.triggerPlayerCompletion = () => this.isCompleted = true; // when triggered, objective is checked
    }
}
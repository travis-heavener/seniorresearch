// creates an array of colors where 0 is pure start color and length-1 is pure end color
const createGradient = (startCol, endCol, steps) => {
    let arr = [];
    for (let i = 0; i < steps; i++)
        arr.push({
            r: Math.floor( (endCol.r - startCol.r) * i / (steps-1) + startCol.r ),
            g: Math.floor( (endCol.g - startCol.g) * i / (steps-1) + startCol.g ),
            b: Math.floor( (endCol.b - startCol.b) * i / (steps-1) + startCol.b ),
            toString: function() {
                return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
            }
        });
    return arr;
};

// split rgb string to object
const breakRGB = str => {
    // remove non-numeric characters
    let split = str.split(",").map((item) => {
        let comp = "";
        item.split("").forEach(char => {
            let code = char.charCodeAt(0);
            if (code >= 48 && code <= 57) comp += char;
        });
        return parseInt(comp);
    });
    return {r: split[0], g: split[1], b: split[2]};
};

// currentCol = backgroundColRef.current
// startCol = THEME.backgrounds.stopped
// endCol = THEME.backgrounds.fast

export function calculateGradient(currentCol, startCol, endCol, speed, frames) {
    let current = breakRGB( currentCol ),
        start = breakRGB ( startCol ),
        end = breakRGB ( endCol );

    // determine how fast device is compared to max speed (4 m/s)
    let maxSpeed = 4, stepCount = 100;
    
    let step = Math.floor(Math.min(speed, maxSpeed) / maxSpeed * 100);
    step = Math.max(Math.min(step, stepCount-1), 0); // clamp step count

    // create gradient
    let initialGrad = createGradient(start, end, stepCount); // start-to-end color gradient
    let target = initialGrad[step]; // target color

    // skip making loops if the color doesn't need to change
    if (current.r == target.r && current.g == target.g && current.b == target.b) return [];

    // create gradient for timeouts
    return createGradient(current, target, frames);
};
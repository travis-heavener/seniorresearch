import { Settings } from "./Config";
import { latLongDist } from "./Toolbox";
import * as Location from "expo-location";
import { DeviceMotion, Pedometer } from "expo-sensors";

/******** START SENSORS ********/

let locationListener = null;
let pedometerListener = null;
let deviceMotionListener = null;

export const stopLocation = () => locationListener?.remove(); // remove listener, if applicable
export const stopPedometer = () => pedometerListener?.remove(); // remove listener, if applicable
export const stopDeviceMotion = () => deviceMotionListener?.remove(); // remove listener, if applicable

export const stopAllSensors = () => {
    stopLocation();
    stopPedometer();
    stopDeviceMotion();
};

export const restartLocation = async (userContext) => {
    locationListener?.remove(); // remove listener, if applicable

    const { delta, accuracy, minTimeElapsed } = Settings.sensorUpdateIntervals[ userContext.batterySaverStatus ].GPS;

    locationListener = await Location.watchPositionAsync(
        {accuracy: accuracy, distanceInterval: delta, timeInterval: minTimeElapsed},
        (loc) => {
            handleLocationData(loc, userContext);
        }
    );

    return locationListener;
};

export const restartPedometer = (userContext) => {
    pedometerListener?.remove(); // remove listener, if applicable

    // set current steps to lifetime steps (b/c pedometer overwrites existing steps when reinitialized)
    userContext.stats.lifetimeSteps += userContext.metadata.steps;
    userContext.metadata.setSteps(0);

    pedometerListener = Pedometer.watchStepCount(({steps}) => {
        userContext.metadata.setSteps(steps);
    });

    return pedometerListener;
};

export const restartDeviceMotion = (userContext) => {
    deviceMotionListener?.remove();

    deviceMotionListener = DeviceMotion.addListener(data => {
        handleAccelerometerData(data, userContext)
    });

    return deviceMotionListener;
};

/******** HANDLE SENSOR DATA ********/

export const handleLocationData = (loc, userContext) => {
    // determine if new position is noisy
    if (loc.coords.accuracy > Settings.LOCATION_NOISE_THRESH)
        return;
                            
    // if this is the first non-noisy reading, append it and stop further calculation
    let current = {lat: loc.coords.latitude, long: loc.coords.longitude, acc: loc.coords.accuracy};
    let last = userContext.metadata.GPS.current; // this hasn't been updated, so treat the 'current' as last

    // return if no previous coordinate is stored
    if (userContext.metadata.GPS.last.acc == -1)
        return userContext.metadata.GPS.updatePos(current);
    
    // if there is a previous coordinate, then we have some math do to !
    let dist = latLongDist(last.lat, last.long, current.lat, current.long);
    userContext.metadata.addDistance(dist); // add distance
    userContext.metadata.GPS.updatePos(current); // overwrite last pos and set current
};

export const handleAccelerometerData = (data, userContext) => {
    if (data.acceleration == undefined || data.rotation == undefined) return;
    userContext.metadata.setAcceleration(data.acceleration);

    let { beta, gamma, alpha } = data.rotation; // beta -> x, gamma -> y, alpha -> z
    
    let accel = data.acceleration;
    let { accelDelta } = userContext.metadata;

    let delta = (Date.now() - accelDelta) / 1000;
    
    userContext.metadata.setAccelDelta(Date.now());
    
    // normalize local device coordinate axes to where device is flat and facing north
    let cg = Math.cos(gamma), ca = Math.cos(alpha), cb = Math.cos(beta); // to optimize calculations a bit
    let sg = Math.sin(gamma), sa = Math.sin(alpha), sb = Math.sin(beta); // to optimize calculations a bit
    
    let R = [
        [cg*sa, sb*sg*sa+cb*ca, cb*sg*sa-sb*ca],
        [cg*ca, sb*sg*ca-cb*sa, cb*sg*ca+sb*sa],
        [-sg, sb*cg, cb*cg]
    ];

    // multiply matrices
    let M = [accel.x, accel.y, accel.z];
    let res = {
        x: R[0][0]*M[0] + R[0][1]*M[1] + R[0][2]*M[2],
        y: R[1][0]*M[0] + R[1][1]*M[1] + R[1][2]*M[2],
        z: R[2][0]*M[0] + R[2][1]*M[1] + R[2][2]*M[2]
    };

    // with this normalized acceleration, calculate velocity
    const format = n => Math.sign(n) * Math.floor( Math.abs(n) * 40 ) / 40; // round off a bit
    const damper = delta * 0.6; // the velocity tends to get too high and not fall -- this aims to fix that

    let current = userContext.metadata.velocity;
    let vel = {
        x: format(current.x*damper + res.x*delta),
        y: format(current.y*damper + res.y*delta),
        z: format(current.z*damper + res.z*delta)
    };
    
    userContext.metadata.setVelocity(vel);
};
import { Dimensions } from "react-native";

export const generateUUID = () => { // Public Domain/MIT
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

export const vw = (w=100) => Dimensions.get("window").width * (w/100);
export const vh = (h=100) => Dimensions.get("window").height * (h/100);

// fit commas into text
export const formatCommas = n => {
    return n.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
};

// random numbers from seed
function mulberry32(a) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const MAX_SEED = 1000000;
export const generateSeed = () => {
    // generate random number from 0 to 999_999, inclusive
    return Math.floor(Math.random() * MAX_SEED); // removed 1_000_000 underscores to fix gradle compiling... annoying!
};

export const generateDailySeed = () => {
    const date = new Date();
    const random = new Random(123456); // new random object w/ fixed seed
    let raw = date.getDate() * (date.getMonth()+1);
    raw *= (random.next() * 10000);
    raw = Math.floor(raw);
    return raw % MAX_SEED; // clamp
};

export class Random {
    constructor(seed=generateSeed()) {
        this.seed = seed;
        this.next = mulberry32(this.seed);
    }
}

export const generateRandomString = (length) => {
    const avail = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let string = "";

    for (let i = 0; i < length; i++)
        string += avail.charAt( Math.floor(Math.random() * avail.length) );
    
    return string;
};

// 2-28-23 @ 12:14 PM -- fun one-liner I wrote and I'm strangely proud of :)
export const toTitleCase = str => str.split(" ").map(frag => frag[0].toUpperCase() + frag.substring(1)).join(" ");

/* ********** GPS ********** */

function degreesToRadians(degrees) {
	return degrees * Math.PI / 180;
}

// https://stackoverflow.com/questions/365826/calculate-distance-between-2-gps-coordinates
export function latLongDist(lat1, lon1, lat2, lon2) {
	var earthRadiusKm = 6371;

	var dLat = degreesToRadians(lat2 - lat1);
	var dLon = degreesToRadians(lon2 - lon1);

	lat1 = degreesToRadians(lat1);
	lat2 = degreesToRadians(lat2);

	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return earthRadiusKm * c * 1000; // *1000 for km -> m
}

// old, not used
const oldLatLongDist = (lat1, lon1, lat2, lon2) => {  // generally used geo measurement function
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d * 1000; // meters
}
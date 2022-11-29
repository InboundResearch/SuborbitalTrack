/*
I am using a geocentric/celestial J2000 coordinate frame with the Earth at the origin.
Stars and other elements referring to celestial J2000 RA/Dec ar to be plotted directly on the sky
sphere at the coordinates given
 */

const DAYS_PER_JULIAN_CENTURY = 36525.0;

let sol = Object.create (null);

let computeJ2000 = function (date) {
    let hours = date.getUTCHours ();
    let minutes = date.getUTCMinutes ();
    let seconds = date.getUTCSeconds ();
    let milliseconds = date.getUTCMilliseconds ();
    let h = hours + (minutes / 60) + (seconds / (60 * 60)) + (milliseconds / (1000 * 60 * 60));
    let m = date.getUTCMonth () + 1;
    let d = date.getUTCDate ();
    let y = date.getUTCFullYear ();
    let f = Math.floor;
    return 367 * y - f (7 * (y + f ((m + 9) / 12)) / 4) + f (275 * m / 9) + d - 730531.5 + (h / 24);
};

// adapted from Astro.js and updated equations found in: https://gml.noaa.gov/grad/solcalc/NOAA_Solar_Calculations_day.xls
let updateSol = function (time) {
    // cos and sin routines that work on degrees (unwraps intrinsically)
    let cos = Utility.cos;
    let sin = Utility.sin;

    // compute the julian century, time is already a J2000 date
    let julianCentury = time / DAYS_PER_JULIAN_CENTURY;

    // compute the mean longitude and mean anomaly of the sun (degrees)
    let meanLongitude = (280.46646 + julianCentury * (36000.76983 + (julianCentury * 0.0003032))) % 360;
    let meanAnomaly = 357.52911 + (julianCentury * (35999.05029 - (0.0001537 * julianCentury)));

    // compute the ecliptic longitude of the sun (degrees)
    let eclipticLongitude = meanLongitude +
        (sin(meanAnomaly) * (1.914602 - (julianCentury * (0.004817 + (0.000014 * julianCentury))))) +
        (sin(2 * meanAnomaly) * (0.019993 - (0.000101 * julianCentury))) +
        (sin(3 * meanAnomaly) * 0.000289);
    
    let apparentLongitude = eclipticLongitude - 0.00569 - (0.00478 * sin(125.04 - (1934.136 * julianCentury)));
    let sinApparentLongitude = sin(apparentLongitude);
    let meanObliqueEcliptic = 23 + (26 + ((21.448 - (julianCentury * (46.815 + (julianCentury * (0.00059 - (julianCentury * 0.001813))))))) / 60) / 60;
    let correctedObliqueEcliptic = meanObliqueEcliptic + (0.00256 * cos(125.04 - (1934.136 * julianCentury)));

    // compute the right ascension and declination
    sol.ra = Math.atan2(cos(correctedObliqueEcliptic) * sinApparentLongitude, cos(apparentLongitude));
    sol.dec = Math.asin(sin(correctedObliqueEcliptic) * sinApparentLongitude);


};

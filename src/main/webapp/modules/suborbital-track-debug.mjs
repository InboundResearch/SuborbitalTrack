// class hierarchy
// default values...
// vector manipulation macros
import "https://astro.irdev.us/modules/satellite.mjs";
import {WebGL2, LogLevel, Utility, Float2, Float3, Float4x4} from "https://webgl.irdev.us/modules/webgl.mjs";
export let SuborbitalTrack = function (mainCanvasDivId, onReadyCallback = function (suborbitalTrack) {}) {
    let $ = Object.create (null);
    let wgl = $.wgl = WebGL2();
    let ClassBase = wgl.ClassBase;
    let RollingStats = wgl.RollingStats;
    let PointerTracker = wgl.PointerTracker;
    let OnReady = wgl.OnReady;
    let Render = wgl.Render;
    let LoaderShader = wgl.LoaderShader;
    let LoaderPath = wgl.LoaderPath;
    let Texture = wgl.Texture;
    let TextFile = wgl.TextFile;
    let Loader = wgl.Loader;
    let Program = wgl.Program;
    let makeBall = wgl.makeBall;
    let makeFan = wgl.makeFan;
    let Shape = wgl.Shape;
    let Node = wgl.Node;
    let Thing = wgl.Thing;
    //LogLevel.set (LogLevel.TRACE);
/*
I am using a geocentric/celestial J2000 coordinate frame with the Earth at the origin.
Stars and other elements referring to celestial J2000 RA/Dec ar to be plotted directly on the sky
sphere at the coordinates given
 */
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
let computeGmstFromJ2000 = function (jd) {
    let jc = jd / 36525;
    let gmst = 67310.54841 + (((876600 * 60 * 60) + 8640184.812866) * jc) + (0.093104 * jc * jc) - (6.2e-6 * jc * jc * jc);
    return Utility.degreesToRadians (Utility.unwindDegrees (gmst / 240));
};
// adapted from Astro.js and updated equations found in: https://gml.noaa.gov/grad/solcalc/NOAA_Solar_Calculations_day.xls
let updateSol = function (time) {
    // cos and sin routines that work on degrees (unwraps intrinsically)
    let cos = Utility.cos;
    let sin = Utility.sin;
    // compute the julian century, time is already a J2000 date
    const DAYS_PER_JULIAN_CENTURY = 36525.0;
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
    // update the ra with the current time
    let gmst = computeGmstFromJ2000 (time);
    sol.ra = Utility.unwindRadians(sol.ra - gmst);
};
let Tle = function () {
    let _ = Object.create (ClassBase);
    // "static" function to read TLEs from a text block (as returned from celestrak, for instance)
    // and turn them into a rudimentary JSON array we can use for tracking
    _.readTle = function (tleText) {
        let lines = tleText.split(/\r?\n/);
        let elements = [];
        for (let i = 0; i < lines.length; i += 3) {
            let name = lines[i].trim();
            if (name.length > 0) elements.push({name: name, line1: lines[i + 1], line2: lines[i + 2]});
        }
        return elements;
    };
    const a = 6378.137;
    const b = 6356.7523142;
    const f = (a - b) / a;
    const e2 = 2 * f - f * f;
    let eciToGeodetic = function (eci, gmst) {
        // http://www.celestrak.com/columns/v02n03/
        // compute the latitude and iterate to polish
        let R = Math.sqrt(eci.x * eci.x + eci.y * eci.y);
        let latitude = Math.atan2(eci.z, R);
        let C;
        for (let k = 0; k < 20; ++k) {
            let sinLat = Math.sin(latitude);
            C = 1 / Math.sqrt(1 - e2 * (sinLat * sinLat));
            latitude = Math.atan2(eci.z + a * C * e2 * sinLat, R);
        }
        return { longitude: Math.atan2(eci.y, eci.x) - gmst, latitude: latitude, height: R / Math.cos(latitude) - a * C, gmst: gmst };
    };
    // time helpers
    const msPerSecond = 1.0e3;
    const secondsPerMinute = 60;
    const minutesPerHour = 60;
    const hoursPerDay = 24;
    const daysLookAhead = 0.5;
    // time steps
    const timeStep = msPerSecond * secondsPerMinute * 5;
    const timeStepCount = (msPerSecond * secondsPerMinute * minutesPerHour * hoursPerDay * daysLookAhead) / timeStep;
    const twoPi = Math.PI * 2;
    // utility functions
    let randomAngle = function () {return (Math.random () - 0.5) * Math.PI};
    let interpolate = function (a, b, t) { return a + (t * (b - a)); };
    let interpolateAngle = function (a, b, t) {
        let d = b - a;
        while (d > Math.PI) d -= twoPi;
        while (d < -Math.PI) d += twoPi;
        return a + (t * d);
    };
    _.construct = function (parameters) {
        let elements = this.elements = parameters.elements;
        this.currentElementIndex = 0;
        // do initialization and reverse indexing
        let nowTime = Date.now ();
        let elementIndex = this.elementIndex = {};
        const satelliteScale = Float4x4.scale (0.01);
        for (let i = 0, end = elements.length; i < end; ++i) {
            let element = elements[i];
            element.index = i;
            element.transform =Float4x4.chain (Float4x4.rotateX (randomAngle ()), Float4x4.rotateY (randomAngle ()), Float4x4.rotateZ (randomAngle ()), satelliteScale);
            elementIndex[element.name] = i;
            // precompute a 24-hour trajectory that we'll just linearly interpolate during normal display
            element.startTime = nowTime;
            element.positions = [];
            element.satrec = satellite.twoline2satrec(element.line1, element.line2);
            for (let j = 0; j < timeStepCount; ++j) {
                let propTime = new Date (nowTime + (j * timeStep));
                let positionAndVelocity = satellite.propagate(element.satrec, propTime);
                if ((typeof (positionAndVelocity) !== "undefined") && ("position" in positionAndVelocity) && (positionAndVelocity.position !== false)) {
                    element.positions.push(eciToGeodetic(positionAndVelocity.position, satellite.gstime(propTime)));
                } else {
                    element.positions.push({latitude: 0, longitude: 0, height: 0, gmst: 0});
                }
            }
        }
    };
    const updateClusterCount = 200;
    _.updateElements = function (nowTime, matrices, timeBudgetMs = 24) {
        let computeTransform = function (element, position) {
            //LogLevel.info("name: " + element.name + ", lat: " + Utility.radiansToDegrees(position.latitude).toFixed (3) + ", lon: " + Utility.radiansToDegrees(position.longitude).toFixed (3) + ", alt: " + position.height);
            Float4x4.copy(Float4x4.chain(
                element.transform,
                Float4x4.translate([
                    Utility.unwind2 (position.longitude, -Math.PI, Math.PI) / Math.PI,
                    Utility.unwind2 (position.latitude, -Math.PI, Math.PI) / Math.PI,
                    -0.2
                ])
                //Float4x4.rotateY(Math.PI + position.longitude + position.gmst),
            ), matrices[element.index]);
        };
        let computePosition = function (element) {
            let deltaTime = Math.max(0, nowTime.getTime() - element.startTime);
            let index = deltaTime / timeStep;
            let lowIndex = Math.floor (index);
            let maxIndex = element.positions.length - 1;
            let a = element.positions[Math.min (lowIndex, maxIndex)];
            let b = element.positions[Math.min (lowIndex + 1, maxIndex)];
            let interpolant = index - lowIndex;
            return {
                latitude: interpolate (a.latitude, b.latitude, interpolant),
                longitude: interpolateAngle (a.longitude, b.longitude, interpolant),
                height: interpolate (a.height, b.height, interpolant),
                gmst: interpolateAngle (a.gmst, b.gmst, interpolant)
            };
        };
        // loop over as many elements as we can in our time budget to update them
        let elements = this.elements;
        let elementIndex = this.currentElementIndex;
        let startTime = performance.now ();
        let stop = false;
        do {
            // do it in clusters...
            for (let i = 0; i < updateClusterCount; ++i) {
                // get the element and compute its transform
                let element = elements[elementIndex];
                let position = computePosition (element);
                computeTransform (element, position);
                // advance to the next element and check if we should stop
                elementIndex = (elementIndex + 1) % this.elements.length;
                stop = stop || (elementIndex === this.currentElementIndex);
            }
        } while (((performance.now () - startTime) < timeBudgetMs) && (! stop));
        this.currentElementIndex = elementIndex;
    };
    return _;
} ();
let tle;
$.addTle = function (idsToShow) {
    tle = null;
    let rootNode = Node.get ("root");
    rootNode.removeChild("tle");
    // get the tles...
    let elementsText = TextFile.get ("elements").text;
    let elementsTextFirstChar = elementsText.charAt(0);
    if (elementsTextFirstChar === "{") {
        elementsText = JSON.parse (elementsText).response.content;
    }
    let elements = Tle.readTle (elementsText);
    elements = elements.filter (element => {
        // 1 25544U 98067A   0
        return idsToShow.includes (element.name) || idsToShow.includes(element.line1.substring(2, 7));
    });
    if (elements.length > 0) {
        let tleNode = Node.new ({
            replace: true,
            instance: elements.length,
            state: function (standardUniforms) {
                Program.get ("basic").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = [1.00, 0.70, 0.40];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.25;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.90;
            },
            shape: "ball-small",
            children: false
        }, "tle");
        rootNode.addChild (tleNode);
        // let the full list of TLEs update
        tle = Tle.new ({ elements: elements });
        tle.updateElements (new Date (), tleNode.instanceTransforms.matrices, Number.POSITIVE_INFINITY);
    }
};
    let render;
    let scene;
    let standardUniforms = Object.create (null);
    let mainCanvasDiv;
    let visibilityState = document.visibilityState;
    document.addEventListener ("visibilitychange", function (event) {
        //console.log ("Visbility State changed to '" + document.visibilityState + "'");
        visibilityState = document.visibilityState;
        updateRunFocus ();
    });
    let windowFocusState = "focus";
    window.addEventListener ("focus", function (event) {
        windowFocusState = "focus";
        //console.log ("Window Focus");
        updateRunFocus ();
    });
    window.addEventListener ("blur", function (event) {
        windowFocusState = "blur";
        //console.log ("Window Blur");
        updateRunFocus ();
    });
    let runFocus = true;
    let updateRunFocus = function () {
        if ((visibilityState === "visible") && (windowFocusState === "focus")) {
            runFocus = true;
            mainCanvasDiv.focus ();
            window.requestAnimationFrame (drawFrame);
        } else {
            runFocus = false;
        }
    };
    let originTime = performance.now ();
    let originTimeOffset = Date.now () - originTime;
    let timeFactor = 1; //24 * 60 * 60; // one second per full day
    let currentTime;
    let drawFrame = function (timestamp) {
        if (runFocus === true) {
            let now = performance.now ();
            // draw again as fast as possible
            window.requestAnimationFrame(drawFrame);
            if (document.hidden) {
                return;
            }
            // set the clock to "now" in J2000 time, and update everything for that
            let offsetTime = originTime + originTimeOffset + (timeFactor * (now - originTime));
            let nowTime = new Date (offsetTime);
            currentTime = computeJ2000 (nowTime);
            Thing.updateAll (currentTime);
            // update the satellites - nowTime is a javascript Date
            if (tle) {
                tle.updateElements (nowTime, Node.get ("tle").instanceTransforms.matrices);
            }
            // set up the view control matrices (just an othographic projection)
            let context = wgl.getContext();
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;
            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.orthographic (-1, 1, -0.5, 0.5, 0, 2);
            standardUniforms.VIEW_MATRIX_PARAMETER = Float4x4.IDENTITY;
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;
            // draw the scene
            scene.traverse(standardUniforms);
        }
    };
    let buildScene = function () {
        let context = wgl.getContext();
        makeBall ("ball-small", 8);
        scene = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                // ordinarily, webGl will automatically present and clear when we return control to the
                // event loop from the draw function, but we overrode that to have explicit control.
                // webGl still presents the buffer automatically, but the back buffer is not cleared
                // until we do it...
                context.clearColor (0.0, 0.0, 0.0, 1.0);
                context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
                // back face culling enabled, and full z-buffer utilization
                context.enable (context.CULL_FACE);
                context.cullFace (context.BACK);
                //context.enable (context.DEPTH_TEST);
                //context.depthMask (true);
                // oh for &#^%'s sake, alpha blending should be standard
                context.blendFunc (context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
                context.enable (context.BLEND);
                // a bit of setup for lighting
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.AMBIENT_LIGHT_COLOR = [0.8, 0.8, 1.0];
                standardUniforms.LIGHT_COLOR = [1.0, 1.0, 0.8];
                standardUniforms.LIGHT_DIRECTION = Float3.normalize ([1.55, 1.75, 1.45]);
                standardUniforms.AMBIENT_CONTRIBUTION = 0.25;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.75;
                standardUniforms.SPECULAR_CONTRIBUTION = 0.05;
                standardUniforms.SPECULAR_EXPONENT = 8.0;
            }
        }, "root");
        scene.addChild (Node.new ({
            transform: Float4x4.scale ([1.0, 0.5, 1.0]),
            enabled: true,
            state: function (standardUniforms) {
                Program.get ("suborbital-earth").use ()
                    .setDayTxSampler ("earth-day")
                    .setNightTxSampler ("earth-night")
                    .setSunRaDec ([sol.ra, sol.dec])
                ;
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
            },
            shape: "square",
            children: false
        }));
        Thing.new ({
            node: "earth",
            update: function (time) {
                updateSol (time);
            }
        }, "earth");
        // get the ground stations and define the polygons around them
        let groundStations = JSON.parse (TextFile.get ("ground-stations").text);
        for (let groundStation of groundStations) {
            if (groundStation.authority === "CSpOC") {
            //if (1) {
                let pts = [];
                let centerLonLat = Float2.scale([groundStation.longitude, groundStation.latitude], Math.PI / 180.0);
                // a little math to work out a range reference
                const EARTH_RADIUS = 6378.1370;
                const EARTH_CIRCUMFERENCE = Math.PI * 2.0 * EARTH_RADIUS;
                // make a fan around the first point, adding 'radius' degrees lon/lat in a circle
                let count = 32;
                let angle = (Math.PI * 2.0) / count;
                let range = Math.min (Math.max (groundStation.max_range, 1000), 6000);
                let radius = range / EARTH_CIRCUMFERENCE;
                for (let i = 0; i < count; ++i) {
                    let currentAngle = i * angle;
                    let v = Float2.scale([Math.cos (currentAngle), Math.sin(currentAngle)], radius);
                    let pt = Float2.add (centerLonLat, v);
                    pt[0] = centerLonLat[0] + ((pt[0] - centerLonLat[0]) / Math.cos (pt[1]));
                    // XXX TODO
                    if (pt[0] > Math.PI) {
                        // this ground station needs to be mirrored to the left to show correctly
                    } else if (pt[0] < -Math.PI) {
                        // this ground station needs to be mirrored to the right to show correctly
                    }
                    // map the point back to screen space
                    pt = Float2.scale (pt, 1 / Math.PI);
                    pts.push (pt);
                    LogLevel.info ("Pt: " + i + ", currentAngle: " + currentAngle);
                }
                let fanName = "fan-" + groundStation.id;
                makeFan (fanName, pts);
                scene.addChild (Node.new ({
                    transform: Float4x4.translate ([0.0, 0.0, -0.1]),
                    state: function (standardUniforms) {
                        Program.get ("color").use ();
                        standardUniforms.MODEL_COLOR = [0.5, 1.0, 0.0];
                        standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.1;
                    },
                    shape: fanName,
                    children: false
                }));
            }
        }
    };
    // create the render object
    mainCanvasDiv = document.getElementById ("render-canvas-div");
    render = Render.new ({
        canvasDivId: "render-canvas-div",
        loaders: [
            LoaderShader.new ("shaders/@.glsl")
                .addFragmentShaders (["suborbital-earth"]),
            LoaderPath.new ({ type: Texture, path: "textures/@.png" })
                .addItems (["earth-day", "earth-night"], { generateMipMap: true }),
            LoaderPath.new ({ type: TextFile, path: "data/@.json" })
                .addItems (["ground-stations"]),
            Loader.new ()
                // proxy to get around the CORS problem
                //.addItem (TextFile, "elements", { url: "https://bedrock.brettonw.com/api?event=fetch&url=https://www.celestrak.com/NORAD/elements/gp.php%3FGROUP%3Dactive%26FORMAT%3Dtle" })
                .addItem (TextFile, "elements", { url: "data/gp.tle" })
        ],
        onReady: OnReady.new (null, function (x) {
            Program.new ({ vertexShader: "basic" }, "suborbital-earth");
            // set up the scene and go
            buildScene ();
            //$.addTle (["ISS (NAUKA)", "39440"]);
            onReadyCallback ($);
            drawFrame ();
        })
    });
    $.updateVis = function (idsToShow, timeToShow) {
        LogLevel.info ("Update Vis called with " + idsToShow.length + " elements, at " + timeToShow.toString());
        this.addTle (idsToShow);
        // set the time separately...
    };
    return $;
};
// test code would go here if needed

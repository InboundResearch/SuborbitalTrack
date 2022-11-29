// class hierarchy
// default values...
// vector manipulation macros
import {WebGL2, LogLevel, Utility, Float2, Float3, Float4x4} from "https://webgl.irdev.us/webgl-debug.mjs";
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
    let timeFactor = 1;//24 * 60; // one minute per full day
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
                context.enable (context.DEPTH_TEST);
                context.depthMask (true);
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
        //LogLevel.set (LogLevel.TRACE);
        drawFrame ();
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
                .addItem (TextFile, "elements", { url: "https://bedrock.brettonw.com/api?event=fetch&url=https://www.celestrak.com/NORAD/elements/gp.php%3FGROUP%3Dactive%26FORMAT%3Dtle" })
        ],
        onReady: OnReady.new (null, function (x) {
            Program.new ({ vertexShader: "basic" }, "suborbital-earth");
            buildScene ();
        })
    });
    $.addPoint = function (ra, dec, size) {
        /*
        let worldNode = Node.get ("world");
        worldNode.removeChild("point");

        let pointNode = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                Program.get ("earth").use ()
                    .setDayTxSampler ("earth-day")
                    .setNightTxSampler ("earth-night")
                    .setSunRaDec ([sol.ra, sol.dec])
                ;
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
            },
            shape: "square",
            children: false
        })

        worldNode.addChild (pointNode);
        */
    };
    $.updateVis = function (idsToShow, timeToShow = Date.now()) {
        LogLevel.info ("Update Vis called with " + idsToShow.length + " elements, at " + timeToShow.toString());
    };
    return $;
};
// test code would go here if needed

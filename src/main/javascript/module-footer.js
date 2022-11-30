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

        // get the ground stations and define the polygons around them
        let groundStations = JSON.parse (TextFile.get ("ground-stations").text);
        for (let groundStation of groundStations) {
            if (groundStation.authority === "CSpOC") {
                let pts = [[groundStation.longitude, groundStation.latitude]];

                // make a fan around the first point
                let count = 6;
                let angle = (Math.PI * 2.0) / count;
                let radius = groundStation.max_range
                for (let i = 0; i < count; ++i) {
                    let currentAngle = i * angle;
                    pts.push (Float2.add (pts[0], Float2.scale ([Math.cos (currentAngle), Math.sin(currentAngle)], radius)));
                }
                pts.push (pts[0]);
                let fanName = "fan-" + groundStation.id;
                makeFan (fanName, pts);
            }
        }

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

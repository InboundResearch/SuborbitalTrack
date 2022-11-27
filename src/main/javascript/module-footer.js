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


    let drawFrame = function (timestamp) {
        if (runFocus === true) {
            // draw again as fast as possible
            window.requestAnimationFrame(drawFrame);

            if (document.hidden) {
                return;
            }
            Thing.updateAll(timestamp);

            // set up the view control matrices (just an othographic projection)
            let context = wgl.getContext();
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.identity();

            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.orthographic (-1, 1, -1, 1, 0, 2);
            standardUniforms.VIEW_MATRIX_PARAMETER = Float4x4.identity ();
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.identity ();

            // draw the scene
            scene.traverse(standardUniforms);
        }
    };

    let buildScene = function () {
        let context = wgl.getContext()
        scene = Node.new ({
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
        }, "root")

            .addChild (Node.new ({
                transform: Float4x4.identity(),
                //transform: Float4x4.translate([-3, 1.5, 0]),
                state: function (standardUniforms) {
                    Program.get ("basic-texture").use ();
                    standardUniforms.TEXTURE_SAMPLER = "earth-day";
                    standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                },
                shape: "square",
                children: false
            }));

        //LogLevel.set (LogLevel.TRACE);
        drawFrame ();
    };

    // create the render object with my own texture...
    mainCanvasDiv = document.getElementById ("render-canvas-div");
    render = Render.new ({
        canvasDivId: "render-canvas-div",
        loaders: [
            LoaderPath.new ({ type: Texture, path: "textures/@.png" }).addItems ("earth-day", { generateMipMap: true })
        ],
        onReady: OnReady.new (null, buildScene)
    });

    return $;
};

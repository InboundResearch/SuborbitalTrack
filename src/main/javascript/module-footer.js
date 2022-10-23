    let mainCanvasDiv;
    let fpsDiv;

    let render;
    const msPerSecond = 1000;
    const sixtyHzMs = msPerSecond / 60;
    let fpsRefreshCap = 0;

    let deltaTimestampHistory = RollingStats.new ({ count: 60, fill: sixtyHzMs });
    let traversalMsHistory = RollingStats.new ({ count: 60, fill: sixtyHzMs });
    let deltaNowHistory = RollingStats.new ({ count: 60, fill: 0 });

    let standardUniforms = Object.create (null);

    const ORIGIN = [0, 0, 0, 1];
    let getNodeOrigin = function (nodeName) {
        let node = Node.get (nodeName);
        if (node) {
            return Float4x4.preMultiply (ORIGIN, node.getTransform ());
        } else if (tle && (nodeName in tle.elementIndex)) {
            let node = Node.get ("tle");
            if (node) {
                let matrix = node.instanceTransforms.matrices[tle.elementIndex[nodeName]];
                let transform = Float4x4.multiply (node.getTransform (), matrix);
                return Float4x4.preMultiply (ORIGIN, transform);
            }
        }
        return ORIGIN;
    };

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
            deltaTimestampHistory.reset ();
            traversalMsHistory.reset ();
            lastFrameTimeMs = 0;
        }
    };

    const ORIGIN_BOUND = [1, 0, 0, 1];
    let getNodeBound = function (nodeName) {
        let nodeTransform = Node.get (nodeName).getTransform ();
        let origin = Float4x4.preMultiply (ORIGIN, nodeTransform);
        let originBound = Float4x4.preMultiply (ORIGIN_BOUND, nodeTransform);
        let deltaVector = Float3.subtract (originBound, origin);
        return Float3.norm (deltaVector);
    };

    let monitorRefresh = { hz: 0, ms: 0 };
    let measureMonitorRefreshRate = function (onReady) {
        // assuming the animation frames fall on screen refresh boundaries, measure the actual refresh rate
        // which is either divisible by 5 or 12. It is unlikely to be less than 60.
        const sampleCount = 30;
        let sampleCounter = 0;
        let startTime = 0;
        let perfDeltaSum = 0;
        let lastTime = 0;
        let mmfrWorker = function (timestamp) {
            // ensure performance counter is the same one we get in the timestamp
            let now = performance.now ();

            // skip if it's a repeat
            if (timestamp === lastTime) {
                LogLevel.warn ("Repeated frame time");
                window.requestAnimationFrame (mmfrWorker);
                return;
            }
            lastTime = timestamp;

            // capture the first call as the current time
            if (startTime === 0) {
                startTime = timestamp;
                window.requestAnimationFrame (mmfrWorker);
                return;
            }

            // gather the deltas
            perfDeltaSum += (now - timestamp);

            // gather the samples
            if (++sampleCounter < sampleCount) {
                window.requestAnimationFrame (mmfrWorker);
            } else {
                let perfDeltaAvg = perfDeltaSum / sampleCount;
                if (perfDeltaAvg > 1) {
                    LogLevel.error ("performance counter is not aligned with frame timestamp (avg delta: " + perfDeltaAvg.toFixed (2) + " ms)");
                }
                let rawHz = msPerSecond / ((timestamp - startTime) / sampleCount);
                let hz = Math.round (rawHz);
                // check for divisibility, fallback to 60 if it's wonky
                if ((hz % 5 !== 0) && (hz % 12 !== 0)) {
                    hz = 60;
                    LogLevel.warn ("Monitor Refresh Rate is strange");
                }
                LogLevel.info ("Monitor Refresh Rate = " + hz + " Hz (" + rawHz.toFixed (3) + " Hz)");
                monitorRefresh = { hz: hz, ms: msPerSecond / hz };
                onReady ();
            }
        };
        window.requestAnimationFrame (mmfrWorker);
    };

    let originTime = performance.now ();
    let originTimeOffset = Date.now () - originTime;
    let timeFactor = 10;

    let currentTime;
    let lastFrameTimeMs = 0;
    let lastTimestamp = 0;
    let drawFrame = function (timestamp) {
        if (runFocus === true) {
            // grab the timer so we can evaluate our performance
            let now = performance.now ();
            let deltaNow = now - timestamp;
            deltaNow = deltaNowHistory.update (deltaNow).avg;

            // draw again as fast as possible
            window.requestAnimationFrame (drawFrame);

            // capture the delta, and save the timestamp for the next go around
            let deltaTimestamp = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // set the clock to "now" in J2000 time
            //let nowTime = new Date (timestamp + performanceNowDateNowDelta);
            let offsetTime = originTime + originTimeOffset + (timeFactor * (now - originTime));
            let nowTime = new Date (offsetTime);
            currentTime = computeJ2000 (nowTime);
            updateSolarSystem (currentTime);
            Thing.updateAll (currentTime);

            // update the satellites - nowTime is a javascript Date
            if (tle) {
                tle.updateElements (nowTime, Node.get ("tle").instanceTransforms.matrices);
            }

            // set up the view parameters
            let currentPosition = cameraSettings[camera.name].currentPosition;
            let viewMatrix;
            switch (camera.type) {
                case "fixed": {
                    // get the points from the requested nodes
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "skewer": {
                    // get the points from the requested nodes and set the camera at some distance
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);
                    let deltaVec = Float3.subtract (lookFromPoint, lookAtPoint);
                    let deltaLength = Float3.norm (deltaVec);
                    lookFromPoint = Float3.add (lookAtPoint, Float3.scale (deltaVec, (deltaLength + camera.distance) / deltaLength));

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "portrait":
                case "orbit": {
                    // get the look at point from the requested node
                    let lookAtPoint = getNodeOrigin (camera.at);

                    // compute a few image composition values based off ensuring a sphere is fully in view
                    let boundRadius = getNodeBound (camera.at);
                    let goalOpposite = boundRadius / ((camera.zoom * 0.9) + 0.1);
                    let sinTheta = Utility.sin (camera.fov / 2.0);
                    let distance = goalOpposite / sinTheta;
                    //console.log ("distance = " + distance);

                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply ([0, 0, 0, 1], Float4x4.chain (
                        Float4x4.translate ([distance, 0, 0]),
                        Float4x4.rotateZ (currentPosition[1] * Math.PI * 0.5),
                        Float4x4.rotateY (currentPosition[0] * Math.PI * -1),
                        Float4x4.translate (lookAtPoint)
                    ));

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, [0, 1, 0]);
                    break;
                }
                case "gimbal": {
                    // get the points from the requested nodes
                    let lookFromPoint = getNodeOrigin (camera.from);
                    let lookAtPoint = getNodeOrigin (camera.at);
                    let lookUpPoint = getNodeOrigin (camera.up);
                    let lookUpVector = Float3.normalize (Float3.subtract (lookUpPoint, lookFromPoint));

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, lookAtPoint, lookUpVector);
                    break;
                }
                case "target": {
                    // compute a central point for all the targets
                    let targets = camera.targets;
                    let centralPoint = [0, 0, 0];
                    let points = [];
                    for (let target of targets) {
                        let targetPoint = getNodeOrigin (target);
                        points.push (targetPoint);
                        centralPoint = Float3.add (centralPoint, targetPoint);
                    }
                    centralPoint = Float3.scale (centralPoint, 1.0 / targets.length);

                    // compute a bound on the system of targets
                    let hBound = 0;
                    for (let point of points) {
                        let deltaVector = Float3.subtract (centralPoint, point);
                        deltaVector[1] = 0;
                        hBound = Math.max (Float3.norm (deltaVector), hBound);
                    }

                    // compute a few image composition values based off ensuring a group is fully in view
                    let goalOpposite = hBound / ((camera.zoom * 1.8) + 0.2);
                    let tanTheta = Utility.tan (camera.fov / 2.0);
                    let distance = goalOpposite / tanTheta;
                    //console.log ("distance = " + distance);
                    //distance = 150;

                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply (ORIGIN, Float4x4.chain (
                        Float4x4.translate ([distance, 0, 0]),
                        Float4x4.rotateZ (currentPosition[1] * Math.PI * 0.5),
                        Float4x4.rotateY (currentPosition[0] * Math.PI * -1),
                        Float4x4.translate (centralPoint)
                    ));

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, centralPoint, [0, 1, 0]);
                    break;
                }
                case "ots": {
                    // get the points and bounds for the view
                    let from = getNodeOrigin (camera.from);
                    let fromBound = getNodeBound (camera.from);
                    let at = getNodeOrigin (camera.at);
                    let atBound = getNodeBound (camera.at);

                    // compute the delta vector and its length
                    let deltaVector = Float3.subtract (at, from);
                    let deltaVectorNorm = Float3.norm (deltaVector);
                    deltaVector = Float3.scale (deltaVector, 1.0 / deltaVectorNorm);

                    // compute a few image composition values based off ensuring the pair is fully in view
                    let goalOpposite = fromBound / ((camera.zoom * 0.9) + 0.1);
                    let tanTheta = Utility.tan (camera.fov / 2.0);
                    let distance = goalOpposite / tanTheta;
                    let oneMinusTanThetaSq = 1.0 - (tanTheta * tanTheta);

                    // compute the bounds in unit space, and use that to compute a central point
                    let rFromBound = fromBound / deltaVectorNorm;
                    let rAtBound = atBound / deltaVectorNorm;

                    // angle cap is the maximum left/right rotation allowed, based on the angle necessary to
                    // look right between the two objects, at a minimum
                    let left = rFromBound / rAtBound;
                    let sinPhi = left / (1 + left);
                    let phi = (Math.asin (rFromBound / sinPhi) * 2.0) / oneMinusTanThetaSq;

                    // t gets a bit of scale to account for the FOV
                    let t = Math.max (0.4 * oneMinusTanThetaSq, rFromBound);

                    // compute the actual look at point, and the distance we need to be from it to satisfy
                    // all the conditions thus far
                    let centralPoint = Float3.add (Float3.scale (from, 1.0 - t), Float3.scale (at, t));
                    distance += (t * deltaVectorNorm) + fromBound + 0.1; // the 0.1 is the clipping plane

                    // compute the allowable yOffset using t
                    let yOffset = distance * Math.sin (phi / 2.0) * 1.5;

                    // get the look from point as an orbit transformation around the look at point
                    let lookFromPoint = Float4x4.preMultiply (ORIGIN, Float4x4.chain (
                        //Float4x4.translate ([distance, 0, 0]),
                        Float4x4.translate (Float3.scale (deltaVector, -1 * distance)),
                        Float4x4.translate (Float3.scale ([0, 1, 0], currentPosition[1] * yOffset)),
                        Float4x4.rotateY (currentPosition[0] * phi * -1),
                        Float4x4.translate (centralPoint)
                    ));

                    // compute the view matrix
                    viewMatrix = Float4x4.lookFromAt (lookFromPoint, centralPoint, [0, 1, 0]);
                    break;
                }
            }

            // ordinarily, webGl will automatically present and clear when we return control to the
            // event loop from the draw function, but we overrode that to have explicit control.
            // webGl still presents the buffer automatically, but the back buffer is not cleared
            // until we do it...
            let context = wgl.getContext();
            context.clear (context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);

            // draw the stars scene
            let starsFov = 60;
            let starsViewMatrix = Float4x4.copy (viewMatrix);
            starsViewMatrix[12] = starsViewMatrix[13] = starsViewMatrix[14] = 0.0;
            standardUniforms.CAMERA_POSITION = [0, 0, 0];
            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (starsFov, context.viewportWidth / context.viewportHeight, 1000, starSphereRadius * 1.1);
            standardUniforms.VIEW_MATRIX_PARAMETER = starsViewMatrix;
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;
            starsScene.traverse (standardUniforms);

            // set up to draw the solar system
            standardUniforms.VIEW_MATRIX_PARAMETER = viewMatrix;
            standardUniforms.MODEL_MATRIX_PARAMETER = Float4x4.IDENTITY;

            // compute the camera position and set it in the standard uniforms
            let vmi = Float4x4.inverse (viewMatrix);
            standardUniforms.CAMERA_POSITION = [vmi[12], vmi[13], vmi[14]];
            //console.log ("CAMERA AT: " + Float3.str (standardUniforms.CAMERA_POSITION));

            // look at where the camera is and set the near and far planes accordingly
            // set up the projection matrix
            let cameraPositionDistance = Float3.norm (standardUniforms.CAMERA_POSITION);
            let moonR = solarSystem.moonR * 1.1;
            let nearPlane = Math.max (1.0e-1, cameraPositionDistance - moonR);
            let farPlane = cameraPositionDistance + moonR;
            standardUniforms.PROJECTION_MATRIX_PARAMETER = Float4x4.perspective (camera.fov, context.viewportWidth / context.viewportHeight, nearPlane, farPlane);
            solarSystemScene.traverse (standardUniforms);

            context.flush ();

            // capture and display the fps
            if (deltaTimestamp < (msPerSecond / 4)) {
                // capture our traversal time
                let traversalMs = performance.now () - now;
                let traversalMsStats = traversalMsHistory.update (traversalMs);

                let deltaTimestampStats = deltaTimestampHistory.update (deltaTimestamp);
                fpsDiv.innerHTML = (msPerSecond / deltaTimestampStats.avg).toFixed (1) + " / " + Utility.padNum ((monitorRefresh.hz / (fpsRefreshCap + 1)).toFixed (1), 3) + " fps" +
                    "<br>" + Utility.padNum (deltaNow.toFixed (1), 5, "&nbsp") + " / " + Utility.padNum (traversalMsStats.avg.toFixed (1), 5, "&nbsp") + " / " + Utility.padNum (deltaTimestampStats.avg.toFixed (1), 5, "&nbsp") + " ms" +
                    "<br>" + context.viewportWidth + " x " + context.viewportHeight
                ;
            }

            // busy wait until we get to the capped fps
            while ((fpsRefreshCap > 0) && ((performance.now () - now) < (monitorRefresh.ms * (fpsRefreshCap + 0.75)))) {
            }
        }
    };

    let buildScene = function () {
        makeBall ("ball", 72);
        makeBall ("ball-med", 36);
        makeBall ("ball-small", 8);
        makeBall ("ball-tiny", 5);
        Stars.make ("Bright Stars", -2, 6);
        Stars.make ("Dim Stars", 6, 8);

        let context = wgl.getContext();

        // a few common context details, clear color, backface culling, and blend modes
        context.clearColor (0.0, 0.0, 0.0, 1.0);
        context.enable (context.CULL_FACE);
        context.cullFace (context.BACK);
        context.blendFunc (context.SRC_ALPHA, context.ONE_MINUS_SRC_ALPHA);
        context.enable (context.BLEND);

        // a bit of setup for lighting
        standardUniforms.AMBIENT_LIGHT_COLOR = [1.0, 1.0, 1.0];
        standardUniforms.LIGHT_COLOR = [1.0, 1.0, 1.0];

        starsScene = Node.new ({
            //enabled: false,
            state: function (standardUniforms) {
                context.disable (context.DEPTH_TEST);
                context.depthMask (false);
            }
        });

        // stars are in their own scene so they can be drawn to track the camera
        // rotate by 180 degrees on the x-axis to account for our coordinate system, then Y by 180
        // degrees to orient correctly. then flip it inside out and scale it up
        let starsTransform = Float4x4.chain (
            Float4x4.rotateX (Math.PI),
            Float4x4.rotateY (Math.PI),
            Float4x4.scale (-starSphereRadius)
        );

        let starsAlpha = 0.66;
        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (starSphereRadius),
            state: function (standardUniforms) {
                Program.get ("vertex-color").use ();
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha;
            },
            shape: "Dim Stars"
        }, "Dim Stars"));

        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (starSphereRadius),
            state: function (standardUniforms) {
                Program.get ("vertex-color").use ();
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha;
            },
            shape: "Bright Stars"
        }, "Bright Stars"));

        starsScene.addChild (Node.new ({
            //enabled: false,
            transform: starsTransform,
            state: function (standardUniforms) {
                Program.get ("texture").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = starsAlpha * 0.5; //starAlpha;
                standardUniforms.TEXTURE_SAMPLER = "starfield";
            },
            shape: "ball",
            children: false
        }, "starfield"));

        let sunColor = Blackbody.colorAtTemperature (5800);
        let sunNode = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                Program.get ("color").use ();
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = sunColor;
            },
            shape: "ball-med",
            children: false
        }, "sun");
        starsScene.addChild (sunNode);

        Thing.new ({
            node: "sun",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);

                let R = sunDistance * solarSystem.sunR;
                let sunPosition = Float3.scale (solarSystem.sunDirection, R);

                // compute the relative scale of the sun to reflect the changing distance in our orbit
                let sunScale = (sunRadius / earthRadius) * (sunDistance / R);

                // compute the position of the sun, and update the lighting direction
                node.transform = Float4x4.multiply (Float4x4.scale (sunScale), Float4x4.translate (sunPosition));
                standardUniforms.LIGHT_DIRECTION = solarSystem.sunDirection;
            }
        }, "sun");

        // now the solar system
        solarSystemScene = Node.new ({
            state: function (standardUniforms) {
                context.enable (context.DEPTH_TEST);
                context.depthMask (true);
            }
        });

        let moonNode = Node.new ({
            transform: Float4x4.IDENTITY,
            state: function (standardUniforms) {
                Program.get ("shadowed-texture").use ()
                    .setSunPosition (solarSystem.sunPosition);
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.TEXTURE_SAMPLER = "moon";
                standardUniforms.MODEL_COLOR = [1.0, 1.0, 1.0];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.1;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.95;
                standardUniforms.SPECULAR_CONTRIBUTION = 0.05;
                standardUniforms.SPECULAR_EXPONENT = 8.0;
            },
            shape: "ball-med",
            children: false
        }, "moon");
        solarSystemScene.addChild (moonNode);

        Thing.new ({
            node: "moon",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);

                // set the moon position and orientation in transform
                node.transform = Float4x4.chain (
                    Float4x4.scale (moonScale),
                    Float4x4.rotateY (solarSystem.moonTheta),
                    //Float4x4.rotateXAxisTo (solarSystem.moonDirection),
                    Float4x4.translate (Float3.scale (solarSystem.moonDirection, solarSystem.moonR))
                );
            }
        }, "moon");

        let worldNode = Node.new ({
            transform: Float4x4.IDENTITY
        }, "world");
        solarSystemScene.addChild (worldNode);

        // add a tracking thing spinning around the earth fairly fast to pin a camera to
        worldNode.addChild (Node.new ({
            transform: Float4x4.IDENTITY,
            children: false
        }, "flyer"));
        Thing.new ({
            node: "flyer",
            update: function (time) {
                // get the node
                let node = Node.get (this.node);
                node.transform = Float4x4.chain (
                    Float4x4.scale (0.01),
                    Float4x4.translate ([50000.0 / earthRadius, 0, 0]),
                    Float4x4.rotateY (time * 4e3 * (1 / timeFactor)),
                    Float4x4.rotateZ (Utility.degreesToRadians (18))
                );
            }
        }, "flyer");

        // add a baltimore node
        /*
        worldNode.addChild (Node.new ({
            state: function (standardUniforms) {
                Program.get ("shadowed").use ().setSunPosition (solarSystem.sunPosition);
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
                standardUniforms.MODEL_COLOR = [1.00, 0.40, 0.20];
                standardUniforms.AMBIENT_CONTRIBUTION = 0.50;
                standardUniforms.DIFFUSE_CONTRIBUTION = 0.90;
            },
            transform: Float4x4.chain (
                Float4x4.scale (10),
                Float4x4.translate ([20, 0, 0]),
                Float4x4.rotateZ (Utility.degreesToRadians(39.2904)),
                Float4x4.rotateY (Math.PI + Utility.degreesToRadians(-76.6122))
            ),
            shape: "ball-small",
            children: false
        }, "baltimore"));
        */

        let earthRenderNode = Node.new ({}, "earth-parent");
        worldNode.addChild (earthRenderNode);

        earthRenderNode.addChild (Node.new ({
            state: function (standardUniforms) {
                Program.get ("earth").use ()
                    .setDayTxSampler ("earth-day")
                    .setNightTxSampler ("earth-night")
                    .setSpecularMapTxSampler ("earth-specular-map")
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 1.0;
            },
            shape: "ball",
            children: false
        }, "earth"));

        // clouds at 40km is a bit on the high side..., but it shows well
        let cloudHeight = (40 + earthRadius) / earthRadius;
        earthRenderNode.addChild (Node.new ({
            //enabled: false,
            transform: Float4x4.scale (cloudHeight),
            state: function (standardUniforms) {
                Program.get ("clouds").use ()
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.90;
                standardUniforms.TEXTURE_SAMPLER = "clouds";
            },
            shape: "ball",
            children: false
        }, "clouds"));

        // atmosphere at 160km is actually in about the right place
        let atmosphereDepth = (160 + earthRadius) / earthRadius;
        earthRenderNode.addChild (Node.new ({
            transform: Float4x4.scale (atmosphereDepth),
            state: function (standardUniforms) {
                Program.get ("atmosphere").use ()
                    .setAtmosphereDepth (atmosphereDepth - 1.0)
                    .setSunPosition (solarSystem.sunPosition)
                    .setMoonPosition (solarSystem.moonPosition)
                ;
                standardUniforms.OUTPUT_ALPHA_PARAMETER = 0.5;
            },
            shape: "ball",
            children: false
        }, "atmosphere"));

        Thing.new ({
            node: "world",
            update: function (time) {
                // get the node
                let gmst = computeGmstFromJ2000 (time);
                Node.get (this.node).transform = Float4x4.rotateY (Utility.degreesToRadians (gmst));
            }
        }, "world");
    };

    let handleMouseDeltaPosition = function (deltaPosition) {
        let settings = cameraSettings[camera.name];
        if ((deltaPosition[2] !== 0) && ("wheel" in camera)) {
            let minmax = (camera.wheel.inc > 0) ? { min: "min", max: "max" } : { min: "max", max: "min" };
            if (deltaPosition[2] > 0) {
                camera[camera.wheel.field] = Math[minmax.min] (camera[camera.wheel.field] + camera.wheel.inc, camera.wheel.limitUp);
            } else {
                camera[camera.wheel.field] = Math[minmax.max] (camera[camera.wheel.field] - camera.wheel.inc, camera.wheel.limitDown);
            }
        }

        // prepare to scale the y control to match the x control velocity based on the screen aspect ratio
        let aspect = 1;//mainCanvasDiv.clientWidth / mainCanvasDiv.clientHeight;
        switch (camera.type) {
            case "target":
            case "portrait":
            case "orbit": {
                // update the current controller position and clamp or wrap accordingly
                let currentPosition = Float2.add (settings.currentPosition, [deltaPosition[0], -aspect * deltaPosition[1]]);
                currentPosition[0] = Utility.unwind (currentPosition[0], 2);
                currentPosition[1] = Math.max (Math.min (currentPosition[1], 0.9), -0.9);
                settings.currentPosition = currentPosition;
                break;
            }
            case "ots": {
                // update the current controller position and clamp or wrap accordingly
                let currentPosition = Float2.add (settings.currentPosition, [deltaPosition[0] * 3.0, -aspect * deltaPosition[1] * 0.75]);
                currentPosition[0] = Math.max (Math.min (currentPosition[0], 1.0), -1.0);
                currentPosition[1] = Math.max (Math.min (currentPosition[1], 1.0), -1.0);
                settings.currentPosition = currentPosition;
                break;
            }
        }
    };

    let camera;
    let cameraDiv;

    let setCamera = function (cameraIndex) {
        // increment the current camera
        currentCameraIndex = cameraIndex;
        camera = cameras[currentCameraIndex];
        cameraDiv.innerHTML = camera.name;
        // make sure there is a value for the current position (once per "at")
        if (!(camera.name in cameraSettings)) {
            cameraSettings[camera.name] = { currentPosition: ("default" in camera) ? camera.default : [0, 0] };
        }
    }

    let handleCameraClick = function (event) {
        // increment the current camera index and set it
        setCamera ((currentCameraIndex + 1) % cameras.length);
    }

    let handleFpsClick = function (event) {
        // increment the current camera index and set it
        fpsRefreshCap = (fpsRefreshCap + 1) % 6;
    }

    let countdownTimeout;
    let startRendering = function () {
        clearTimeout(countdownTimeout);
        // start drawing frames
        setCamera (0);
        window.requestAnimationFrame (drawFrame);
        setTimeout (() => {
            document.getElementById (loadingDivId).style.opacity = 0;
        }, 50);
    };

    let randomNames = [
        "Andromeda", "Antlia", "Apus", "Aquarius", "Aquila", "Ara", "Aries", "Auriga", "Bootes",
        "Caelum", "Camelopardalis", "Cancer", "Canes Venatici", "Canis Major", "Canis Minor",
        "Capricornus", "Carina", "Cassiopeia", "Centaurus", "Cepheus", "Cetus", "Chamaeleon",
        "Circinus", "Columba", "Coma Berenices", "Corona Australis", "Corona Borealis",
        "Corvus", "Crater", "Crux", "Cygnus", "Delphinus", "Dorado", "Draco", "Equuleus",
        "Eridanus", "Fornax", "Gemini", "Grus", "Hercules", "Horologium", "Hydra", "Hydrus",
        "Indus", "Lacerta", "Leo", "Leo Minor", "Lepus", "Libra", "Lupus", "Lynx", "Lyra",
        "Mensa", "Microscopium", "Monoceros", "Musca", "Norma", "Octans", "Ophiuchus", "Orion",
        "Pavo", "Pegasus", "Perseus", "Phoenix", "Pictor", "Pisces", "Piscis Austrinus",
        "Puppis", "Pyxis", "Reticulum", "Sagitta", "Sagittarius", "Scorpius", "Sculptor",
        "Scutum", "Serpens", "Sextans", "Taurus", "Telescopium", "Triangulum",
        "Triangulum Australe", "Tucana", "Ursa Major", "Ursa Minor", "Vela", "Virgo", "Volans",
        "Vulpecula"
    ];
    let countdown = function (timeout) {
        countdownTimeout = setTimeout(function () {
            countdown (300);
            let randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
            document.getElementById (loadingDivId).innerHTML = "<span style=\"margin-top: 25%;text-align: center;\">" + randomName + "</span>";
        }, timeout);
    };
    countdown (2000);

    // do this when the window load finishes...
    mainCanvasDiv = document.getElementById (mainCanvasDivId);
    PointerTracker.new ({ elementId: mainCanvasDivId, onReady: OnReady.new (null, handleMouseDeltaPosition), stepSize: 0.0025 });

    // extract the divs we want to concern ourselves with
    fpsDiv = document.getElementById (fpsDivId);
    fpsDiv.addEventListener ("click", handleFpsClick);
    cameraDiv = document.getElementById (cameraDivId);
    cameraDiv.addEventListener ("click", handleCameraClick);

    // create the render context
    render = Render.new ({
        canvasDivId: mainCanvasDivId,
        loaders: [
            LoaderShader.new ("https://astro.irdev.us/shaders/@.glsl")
                .addFragmentShaders (["earth", "clouds", "atmosphere", "shadowed", "shadowed-texture", "hardlight"]),
            LoaderPath.new ({ type: Texture, path: "https://astro.irdev.us/textures/@.png" })
                .addItems (["clouds", "earth-day", "earth-night", "earth-specular-map", "moon", "satellite"], { generateMipMap: true }),
            LoaderPath.new ({ type: Texture, path: "https://astro.irdev.us/textures/@.jpg" })
                .addItems ("starfield"),
            LoaderPath.new ({ type: TextFile, path: "https://astro.irdev.us/data/@.json" })
                .addItems (["bsc5-short", "messier"]),
            Loader.new ()
                // proxy to get around the CORS problem
                .addItem (TextFile, "elements", { url: "https://bedrock.brettonw.com/api?event=fetch&url=https://www.celestrak.com/NORAD/elements/gp.php%3FGROUP%3Dactive%26FORMAT%3Dtle" })
                //.addItem (TextFile, "elements", { url: "data/gp.tle" })
        ],
        onReady: OnReady.new (null, function (x) {
            Program.new ({ vertexShader: "basic" }, "earth");
            Program.new ({ vertexShader: "basic" }, "clouds");
            Program.new ({ vertexShader: "basic" }, "atmosphere");
            Program.new ({ vertexShader: "basic" }, "shadowed");
            Program.new ({ vertexShader: "basic" }, "shadowed-texture");
            Program.new ({ vertexShader: "basic" }, "hardlight");

            // set up the scene and go
            buildScene ();
            onReadyCallback ($);
            measureMonitorRefreshRate (startRendering);
        })
    });

    return $;
};

import {SuborbitalTrack} from "./suborbital-track-debug.mjs";

let create = function (canvasDivId) {
    SuborbitalTrack (canvasDivId, suborbitalTrack => {});
};

window.addEventListener ("load", event => {
    create ("render-canvas-div");
});

import {SuborbitalTrack} from "./suborbital-track-debug.mjs";

window.addEventListener ("load", event => {
    SuborbitalTrack ("render-canvas-div", suborbitalTrack => {
        suborbitalTrack.addTle (["ISS (NAUKA)", "39440"]);
    });
});

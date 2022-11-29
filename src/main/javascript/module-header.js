export let SuborbitalTrack = function (mainCanvasDivId, onReadyCallback = function (suborbitalTrack) {}) {
    let $ = OBJ;
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

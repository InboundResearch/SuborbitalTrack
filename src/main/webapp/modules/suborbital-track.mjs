import"https://astro.irdev.us/modules/satellite.mjs";import{WebGL2,LogLevel,Utility,Float2,Float3,Float4x4}from"./webgl-debug.mjs";export let SuborbitalTrack=function(e,t=function(e){}){let l=Object.create(null);let n=l.wgl=WebGL2();let a=n.ClassBase;let r=n.RollingStats;let o=n.PointerTracker;let i=n.OnReady;let s=n.Render;let d=n.LoaderShader;let u=n.LoaderPath;let c=n.Texture;let T=n.TextFile;let E=n.Loader;let h=n.Program;let v=n.makeBall;let x=n.Shape;let I=n.Node;let R=n.Thing;const f=36525;let _=Object.create(null);let g=function(e){let t=e.getUTCHours();let l=e.getUTCMinutes();let a=e.getUTCSeconds();let n=e.getUTCMilliseconds();let r=t+l/60+a/(60*60)+n/(1e3*60*60);let o=e.getUTCMonth()+1;let i=e.getUTCDate();let s=e.getUTCFullYear();let d=Math.floor;return 367*s-d(7*(s+d((o+9)/12))/4)+d(275*o/9)+i-730531.5+r/24};let A=function(e){let t=Utility.cos;let l=Utility.sin;let a=e/f;let n=(280.46646+a*(36000.76983+a*3032e-7))%360;let r=357.52911+a*(35999.05029-1537e-7*a);let o=n+l(r)*(1.914602-a*(.004817+14e-6*a))+l(2*r)*(.019993-101e-6*a)+l(3*r)*289e-6;let i=o-.00569-.00478*l(125.04-1934.136*a);let s=l(i);let d=23+(26+(21.448-a*(46.815+a*(59e-5-a*.001813)))/60)/60;let u=d+.00256*t(125.04-1934.136*a);_.ra=Math.atan2(t(u)*s,t(i));_.dec=Math.asin(l(u)*s)};let C;let L;let O=Object.create(null);let m;let M=document.visibilityState;document.addEventListener("visibilitychange",function(e){M=document.visibilityState;w()});let F="focus";window.addEventListener("focus",function(e){F="focus";w()});window.addEventListener("blur",function(e){F="blur";w()});let U=true;let w=function(){if(M==="visible"&&F==="focus"){U=true;m.focus();window.requestAnimationFrame(D)}else{U=false}};let N=performance.now();let b=Date.now()-N;let p=10;let S;let D=function(e){if(U===true){let e=performance.now();if(document.hidden){return}let t=N+b+p*(e-N);t+=1e3*60*60*5;let l=new Date(t);S=g(l);R.updateAll(S);let a=n.getContext();O.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;O.PROJECTION_MATRIX_PARAMETER=Float4x4.orthographic(-1,1,-.5,.5,0,2);O.VIEW_MATRIX_PARAMETER=Float4x4.IDENTITY;O.MODEL_MATRIX_PARAMETER=Float4x4.IDENTITY;L.traverse(O)}};let P=function(){let t=n.getContext();L=I.new({transform:Float4x4.IDENTITY,state:function(e){t.clearColor(0,0,0,1);t.clear(t.COLOR_BUFFER_BIT|t.DEPTH_BUFFER_BIT);t.enable(t.CULL_FACE);t.cullFace(t.BACK);t.enable(t.DEPTH_TEST);t.depthMask(true);t.blendFunc(t.SRC_ALPHA,t.ONE_MINUS_SRC_ALPHA);t.enable(t.BLEND);e.OUTPUT_ALPHA_PARAMETER=1;e.AMBIENT_LIGHT_COLOR=[.8,.8,1];e.LIGHT_COLOR=[1,1,.8];e.LIGHT_DIRECTION=Float3.normalize([1.55,1.75,1.45]);e.AMBIENT_CONTRIBUTION=.25;e.DIFFUSE_CONTRIBUTION=.75;e.SPECULAR_CONTRIBUTION=.05;e.SPECULAR_EXPONENT=8}},"root");L.addChild(I.new({transform:Float4x4.scale([1,.5,1]),state:function(e){h.get("earth").use().setDayTxSampler("earth-day").setNightTxSampler("earth-night").setSunRaDec([_.ra,_.dec]);e.MODEL_COLOR=[1,1,1]},shape:"square",children:false}));R.new({node:"earth",update:function(e){A(e)}},"earth");D()};m=document.getElementById("render-canvas-div");C=s.new({canvasDivId:"render-canvas-div",loaders:[d.new("shaders/@.glsl").addFragmentShaders(["earth","hardlight","shadowed"]),u.new({type:c,path:"textures/@.png"}).addItems(["earth-day","earth-night"],{generateMipMap:true})],onReady:i.new(null,function(e){h.new({vertexShader:"basic"},"earth");P()})});return l};
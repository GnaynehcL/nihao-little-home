import{l as ie,K as k,c as ne,p as fe,F as Y}from"./index-BHf25Pes.js";const se=[[114.06446,135.04038,45.92046,.27898],[100.73942,134.04285,45.24965,.28869],[103.41241,129.86131,46.01298,.28808],[114.89074,127.05197,44.42121,.32737],[103.60466,126.79795,46.5158,.27691],[97.11763,131.63296,45.717,.30905],[103.6395,138.00965,45.02646,.27524],[101.48224,129.12715,47.73894,.28904],[99.43081,129.93355,46.7513,.30408],[99.99375,127.90398,46.18404,.27528],[107.34126,134.26675,45.73125,.28578],[101.15789,115.7694,49.28555,.28112],[100.76472,116.80792,47.14113,.29728],[96.68096,164.88758,46.85014,.27297],[152.10838,190.14831,46.35601,.25452],[180.47479,138.99539,62.42575,.36957],[228.96718,129.45401,57.758,.36248],[92.59439,135.36455,42.36877,.40118],[233.26664,133.1603,43.22191,.36678],[270.40962,135.19425,43.55479,-.33616],[410.44343,141.04078,42.08405,-.378]];function ce(r=64,t=48){if(!Number.isInteger(r)||!Number.isInteger(t)||r<1||t<1||(r+1)*(t+1)>65535)throw new Error("Invalid photo mesh resolution");const l=new Float32Array((r+1)*(t+1)*2),m=new Uint16Array(r*t*6);for(let n=0;n<=t;n++)for(let a=0;a<=r;a++){const i=(n*(r+1)+a)*2;l[i]=a/r*2-1,l[i+1]=1-n/t*2}let c=0;for(let n=0;n<t;n++)for(let a=0;a<r;a++){const i=n*(r+1)+a,p=i+r+1;m.set([i,p,i+1,i+1,p,p+1],c),c+=6}return{positions:l,indices:m}}const le=Y.slice(Y.indexOf("float e("),Y.indexOf("void main(){")),me=`precision highp float;
attribute vec2 position; varying vec2 uv;
uniform vec2 photoScale,photoOffset;
uniform float restMesh,breath,headAngle,headX,headY,earLeft,earRight,pawCurl;
${le}
void main(){
  uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);
  gl_Position=vec4(position,0.,1.);
  if(restMesh>.5){
    vec2 source=(uv-photoOffset)/photoScale;
    vec2 delta=(forwardPhoto(source)-source)*photoScale;
    gl_Position.xy+=vec2(delta.x*2.,-delta.y*2.);
  }
}`,de=`precision mediump float;
varying vec2 uv; uniform sampler2D atlas; uniform sampler2D flows; uniform sampler2D coverage;
uniform float frameA,frameB,pairIndex,pairCount,mixAmount,reverseFlow,mirrorA,mirrorB,facing;
uniform vec4 headA,headB;
vec4 sprite(float f,vec2 p){
  if(p.x<0.0||p.x>1.0||p.y<0.0||p.y>1.0)return vec4(0.);
  vec2 cell=vec2(mod(f,4.),floor(f/4.));
  vec4 c=texture2D(atlas,(cell+clamp(p,vec2(.001),vec2(.999)))/vec2(4.,6.));
  c.a=smoothstep(.25,.48,c.a)*texture2D(coverage,(cell+p)/vec2(4.,6.)).r;
  return vec4(c.rgb*c.a,c.a);
}
vec2 eyeLocal(vec2 p,vec4 h){
  vec2 q=p*vec2(512.,384.)-h.xy;
  float c=cos(h.w),s=sin(h.w);
  return vec2(q.x*c+q.y*s,-q.x*s+q.y*c)/h.z;
}
vec2 eyeMap(vec2 p,vec4 target,vec4 source){
  vec2 q=eyeLocal(p,target)*source.z;
  float c=cos(source.w),s=sin(source.w);
  return (source.xy+vec2(q.x*c-q.y*s,q.x*s+q.y*c))/vec2(512.,384.);
}
float headMask(vec2 p,vec4 h){
  vec2 q=eyeLocal(p,h);
  float radius=length(vec2(q.x/1.8,(q.y+.4)/2.2));
  return smoothstep(0.,1.,clamp((1.-radius)/.25,0.,1.));
}
vec4 mirroredSprite(float frame,vec2 p,float mirror){
  p.x=mix(p.x,1.-p.x,mirror);return sprite(frame,p);
}
float sourceHeadBoundary(float frame,vec2 p,float mirror){
  if(abs(frame-19.)>.1)return 1.;
  p.x=mix(p.x,1.-p.x,mirror);
  float y=p.y*384.,x=p.x*512.,edge;
  if(y<82.)edge=mix(260.,255.,clamp(y/82.,0.,1.));
  else if(y<90.)edge=mix(255.,194.,(y-82.)/8.);
  else if(y<105.)edge=mix(194.,198.,(y-90.)/15.);
  else if(y<125.)edge=mix(198.,209.,(y-105.)/20.);
  else if(y<145.)edge=mix(209.,217.,(y-125.)/20.);
  else if(y<175.)edge=mix(217.,223.,(y-145.)/30.);
  else if(y<195.)edge=mix(223.,244.,(y-175.)/20.);
  else if(y<210.)edge=mix(244.,260.,(y-195.)/15.);
  else if(y<240.)edge=mix(260.,275.,(y-210.)/30.);
  else edge=mix(275.,300.,clamp((y-240.)/144.,0.,1.));
  return smoothstep(edge-2.,edge+2.,x);
}

vec4 separatedSprite(float frame,vec2 bodyUV,vec2 headUV,vec4 h,float mirror){
  float bodyMask=headMask(bodyUV,h)*sourceHeadBoundary(frame,bodyUV,mirror);
  float faceMask=headMask(headUV,h)*sourceHeadBoundary(frame,headUV,mirror);
  vec4 body=mirroredSprite(frame,bodyUV,mirror)*(1.-bodyMask);
  vec4 face=mirroredSprite(frame,headUV,mirror)*faceMask;
  vec4 result=body*(1.-face.a)+face;
  float alpha=min(body.a+face.a,1.);
  return vec4(result.rgb*alpha/max(result.a,.000001),alpha);
}
void main(){
  vec2 p=uv; p.x=mix(p.x,1.-p.x,facing);
  if(pairIndex<0.){gl_FragColor=sprite(frameA,p);return;}
  vec2 fuv=vec2(clamp(p.x,.008,.992),(pairIndex+clamp(p.y,.01,.99))/pairCount);
  vec4 flow=(texture2D(flows,fuv)*255.-128.)/127.*.25;
  vec2 fa=mix(flow.rg,flow.ba,reverseFlow),fb=mix(flow.ba,flow.rg,reverseFlow);
  if(pairIndex<0.){fa=vec2(0.);fb=vec2(0.);}
  vec2 pa=p-mixAmount*fa,pb=p-(1.-mixAmount)*fb;
  if(mixAmount<=.000001){gl_FragColor=mirroredSprite(frameA,p,mirrorA);return;}
  if(mixAmount>=.999999){gl_FragColor=mirroredSprite(frameB,p,mirrorB);return;}
  vec4 middle=mix(headA,headB,mixAmount);
  vec2 ha=eyeMap(p,middle,headA),hb=eyeMap(p,middle,headB);
  vec4 a=separatedSprite(frameA,pa,ha,headA,mirrorA);
  vec4 b=separatedSprite(frameB,pb,hb,headB,mirrorB);
  gl_FragColor=mix(a,b,mixAmount);
}`;function W(r,t,l,m){const c=r.createShader(t);if(!c)throw new Error("Unable to allocate cat shader");if(m(c),r.shaderSource(c,l),r.compileShader(c),!r.getShaderParameter(c,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(c));return c}function ue(r,t,l,m,c){if(![t,l,m].every(p=>Number.isInteger(p)&&p>0)||r.length!==t*l*m*4)throw new Error("Invalid cat motion flow");const n=Math.min(t,c),a=Math.min(l,Math.floor(c/m));if(a<1)throw new Error("Cat motion flow exceeds GPU texture limit");if(n===t&&a===l)return{bytes:r,width:t,height:l*m};const i=new Uint8Array(n*a*m*4);for(let p=0;p<m;p++)for(let d=0;d<a;d++)for(let y=0;y<n;y++){const e=Math.max(0,Math.min(t-1,(y+.5)*t/n-.5)),R=Math.max(0,Math.min(l-1,(d+.5)*l/a-.5)),x=Math.floor(e),T=Math.min(t-1,x+1),f=Math.floor(R),h=Math.min(l-1,f+1),b=e-x,v=R-f,o=(g,w,_)=>r[((p*l+w)*t+g)*4+_];for(let g=0;g<4;g++)i[((p*a+d)*n+y)*4+g]=Math.round((o(x,f,g)*(1-b)+o(T,f,g)*b)*(1-v)+(o(x,h,g)*(1-b)+o(T,h,g)*b)*v)}return{bytes:i,width:n,height:a*m}}async function j(r){const t=new Image;return t.src=r,await t.decode(),t}const L=r=>r*r*(3-2*r),K=[16,15,14,13,12],he=r=>(r%1+1)%1;function Z(r){const{mood:t,progress:l=0,gaitPhase:m=0,direction:c}=r;if(r.reducedMotion)return{a:16,b:16,t:0,facing:0};if(t==="walking"){if(r.stageElapsed<160)return{a:12,b:0,t:L(r.stageElapsed/160),facing:c==="right"?1:0};if(r.stageDuration-r.stageElapsed<160)return{a:0,b:12,t:L(1-(r.stageDuration-r.stageElapsed)/160),facing:c==="right"?1:0};const n=he(m)*12;return{a:Math.floor(n),b:(Math.floor(n)+1)%12,t:n%1,facing:c==="right"?1:0}}if(t==="rising"||t==="settling"){const n=L(l)*4,a=t==="rising"?K:[...K].reverse(),i=Math.min(3,Math.floor(n));return{a:a[i],b:a[i+1],t:Math.min(1,n-i),facing:t==="rising"?0:c==="right"?1:0}}if(t==="turning"){const n=[12,17,18,19,20,12],a=L(l)*5,i=Math.min(4,Math.floor(a));return{a:n[i],b:n[i+1],t:Math.min(1,a-i),facing:0,turn:l}}return{a:16,b:16,t:0,facing:0}}function J(r,t){const m=window.innerWidth<760?{home:[0,0],near:[-12.766,2*window.innerHeight/r.offsetHeight],away:[119.149,0]}:{home:[0,0],near:[-43.4146,5.206],away:[121.2195,0]},c=m[t.fromPlace]||m.home,n=m[t.toPlace]||c,a=t.mood==="walking"?t.progress:1,i=a<.12?a*a/.2112:a>.88?1-(1-a)*(1-a)/.2112:(a-.06)/.88;r.style.transform=`translate3d(${c[0]+(n[0]-c[0])*i}%,${c[1]+(n[1]-c[1])*i}%,0)`,r.dataset.motionProgress=t.progress.toFixed(4)}function ge(r,t,l,m,c,n,a){const i=r.getContext("2d");if(!i)throw new Error("Canvas rendering unavailable");const p=t.getContext("2d"),d=p.getImageData(0,0,t.width,t.height);for(let f=3;f<d.data.length;f+=4){const h=Math.max(0,Math.min(1,(d.data[f]/255-.25)/.23)),b=(f-3)/4,v=b%t.width,o=Math.floor(b/t.width);d.data[f]=Math.round(h*h*(3-2*h)*c[Math.floor(o/4)*512+Math.floor(v/4)])}p.putImageData(d,0,0);const y=new Map(l.pairs.map(f=>[`${f.a}:${f.b}`,f]));let e=!0,R=!1;const x=new ResizeObserver(()=>{R||(e=!0,a())});try{x.observe(r)}catch(f){throw x.disconnect(),f}function T(f){if(R)return;if(f={...f,reducedMotion:f.reducedMotion||n.matches},J(m,f),e){const o=r.getBoundingClientRect(),g=Math.min(devicePixelRatio||1,1.5);r.width=Math.max(1,Math.round(o.width*g)),r.height=Math.max(1,Math.round(o.height*g)),e=!1}if(i.setTransform(1,0,0,1,0,0),i.clearRect(0,0,r.width,r.height),f.mood==="away")return;const h=Z(f),b=y.get(`${h.a}:${h.b}`),v=(o,g,w)=>{i.save(),i.globalAlpha=g,!!h.facing!=!!w&&(i.translate(r.width,0),i.scale(-1,1)),i.drawImage(t,o%4*512,Math.floor(o/4)*384,512,384,0,0,r.width,r.height),i.restore()};v(h.a,1-h.t,!1),v(h.b,h.t,b==null?void 0:b.mirrorB),r.dataset.motionFrame=`${h.a}:${h.b}`,r.dataset.motionBlend=h.t.toFixed(4)}return r.dataset.rendererType="canvas",{draw:T,dispose(){R||(R=!0,x.disconnect())}}}async function xe(r,t,{onInvalidate:l=()=>{}}={}){const[m,c,n,a,i,p]=await Promise.all([j("./assets/motion/nihao-sprites.png"),ie(),j("./assets/motion/nihao-turn.png"),fetch("./assets/motion/registration.json").then(o=>{if(!o.ok)throw new Error("Missing motion registration");return o.json()}),fetch("./assets/motion/flow.bin").then(o=>{if(!o.ok)throw new Error("Missing motion flow");return o.arrayBuffer()}),fetch("./assets/motion/coverage.bin").then(o=>{if(!o.ok)throw new Error("Missing motion material");return o.arrayBuffer()})]),d=document.createElement("canvas");d.width=2048,d.height=2304;const y=d.getContext("2d");if(!y)throw new Error("Unable to prepare cat atlas");if(p.byteLength!==512*576)throw new Error("Invalid cat motion material");a.frames.forEach((o,g)=>{const[w,_,F,N]=o.dest;y.drawImage(o.source==="curled"?c:o.source==="turn"?n:m,...o.crop,g%4*512+w,Math.floor(g/4)*384+_,F,N)});const e=r.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power",preserveDrawingBuffer:!1}),R=window.matchMedia("(prefers-reduced-motion: reduce)");if(!e)return ge(r,d,a,t,new Uint8Array(p),R,l);const x={shaders:[],textures:[],buffers:[],program:null};let T=!1,f,h=!1;const b=o=>{o.preventDefault(),l()};function v(){if(!T){T=!0,f==null||f.disconnect(),h&&(r.removeEventListener("webglcontextlost",b),h=!1);for(const o of x.textures)e.deleteTexture(o);for(const o of x.buffers)e.deleteBuffer(o);x.program&&e.deleteProgram(x.program);for(const o of x.shaders)e.deleteShader(o)}}try{let ae=function(s){if(T)return;if(e.isContextLost())throw new Error("Cat GPU context lost");if(s={...s,reducedMotion:s.reducedMotion||R.matches},e.useProgram(w),e.bindBuffer(e.ARRAY_BUFFER,O),e.enableVertexAttribArray(D),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ee),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,re),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,te),q){const A=r.getBoundingClientRect(),C=Math.min(window.devicePixelRatio||1,1.5);r.width=Math.max(1,Math.round(A.width*C)),r.height=Math.max(1,Math.round(A.height*C)),e.viewport(0,0,r.width,r.height),q=!1}if(J(t,s),s.mood==="away")return;const u=Z(s),M=$.get(`${u.a}:${u.b}`)||[-1,0,0,0],P=(A,C)=>{const I=se[A].slice();return C&&(I[0]=512-I[0],I[3]=-I[3]),I};e.uniform4fv(E.headA,P(u.a,M[2])),e.uniform4fv(E.headB,P(u.b,M[3])),e.uniform1f(E.frameA,u.a),e.uniform1f(E.frameB,u.b),e.uniform1f(E.mixAmount,u.t),e.uniform1f(E.pairIndex,M[0]),e.uniform1f(E.reverseFlow,M[1]),e.uniform1f(E.mirrorA,M[2]),e.uniform1f(E.mirrorB,M[3]),e.uniform1f(E.facing,u.facing);const S=oe.sample(s);e.uniform2f(E.photoScale,...z.scale),e.uniform2f(E.photoOffset,...z.offset);for(const A of k)e.uniform1f(E[A],S[A]);const B=u.a===16&&u.b===16&&k.some(A=>Math.abs(S[A])>1e-7);e.uniform1f(E.restMesh,B?1:0),e.clear(e.COLOR_BUFFER_BIT),B?(e.bindBuffer(e.ARRAY_BUFFER,V),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,H),e.drawElements(e.TRIANGLES,X.indices.length,e.UNSIGNED_SHORT,0)):e.drawArrays(e.TRIANGLE_STRIP,0,4),r.dataset.motionFrame=`${u.a}:${u.b}`,r.dataset.motionBlend=u.t.toFixed(4)};r.addEventListener("webglcontextlost",b),h=!0;const o=e.getParameter(e.MAX_TEXTURE_SIZE);if(!Number.isInteger(o)||o<576)throw new Error("Cat textures exceed GPU limits");const g=ue(new Uint8Array(i),a.width,a.height,a.pairs.length,o),w=e.createProgram();if(!w)throw new Error("Unable to allocate cat program");x.program=w;const _=s=>x.shaders.push(s),F=()=>{const s=e.createBuffer();if(!s)throw new Error("Unable to allocate cat buffer");return x.buffers.push(s),s},N=W(e,e.VERTEX_SHADER,me,_),Q=W(e,e.FRAGMENT_SHADER,de,_);if(e.attachShader(w,N),e.attachShader(w,Q),e.linkProgram(w),!e.getProgramParameter(w,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(w));e.useProgram(w);const O=F();e.bindBuffer(e.ARRAY_BUFFER,O),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const X=ce(),V=F(),H=F();if(e.bindBuffer(e.ARRAY_BUFFER,V),e.bufferData(e.ARRAY_BUFFER,X.positions,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,H),e.bufferData(e.ELEMENT_ARRAY_BUFFER,X.indices,e.STATIC_DRAW),e.getError()!==e.NO_ERROR)throw new Error("Unable to upload cat geometry");e.bindBuffer(e.ARRAY_BUFFER,O);const D=e.getAttribLocation(w,"position");e.enableVertexAttribArray(D),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0);const E=Object.fromEntries(["atlas","flows","coverage","frameA","frameB","pairIndex","pairCount","mixAmount","reverseFlow","mirrorA","mirrorB","facing","restMesh","photoScale","photoOffset","headA","headB",...k].map(s=>[s,e.getUniformLocation(w,s)])),G=(s,u,M,P,S=e.RGBA)=>{const B=e.createTexture();if(!B)throw new Error("Unable to allocate cat texture");x.textures.push(B),e.activeTexture(e.TEXTURE0+s),e.bindTexture(e.TEXTURE_2D,B),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),M?e.texImage2D(e.TEXTURE_2D,0,S,M,P,0,S,e.UNSIGNED_BYTE,u):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u);const A=e.getError();if(A!==e.NO_ERROR)throw new Error("Unable to upload cat texture "+s+" (WebGL "+A+")");return B};let U=d;if(d.width>o||d.height>o){const s=Math.min(.75,o/d.width,o/d.height);U=document.createElement("canvas"),U.width=Math.max(1,Math.floor(d.width*s)),U.height=Math.max(1,Math.floor(d.height*s));const u=U.getContext("2d");if(!u)throw new Error("Unable to prepare GPU cat atlas");u.drawImage(d,0,0,U.width,U.height)}const ee=G(0,U),re=G(1,g.bytes,g.width,g.height),te=G(2,new Uint8Array(p),512,576,e.LUMINANCE);e.uniform1i(E.atlas,0),e.uniform1i(E.flows,1),e.uniform1f(E.pairCount,a.pairs.length),e.uniform1i(E.coverage,2);const $=new Map;a.pairs.forEach((s,u)=>{$.set(`${s.a}:${s.b}`,[u,0,0,s.mirrorB?1:0]),$.set(`${s.b}:${s.a}`,[u,1,s.mirrorB?1:0,0])});let q=!0;f=new ResizeObserver(()=>{T||(q=!0,l())}),f.observe(r);const oe=ne(),z=fe("legacyRegistration");return r.dataset.rendererType="webgl",{draw:ae,dispose:v}}catch(o){throw v(),delete r.dataset.rendererType,o}}export{xe as createCatRenderer,Z as sampleCatPose};

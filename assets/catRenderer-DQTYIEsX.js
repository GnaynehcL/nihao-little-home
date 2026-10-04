import{l as ie,K as k,c as ne,p as fe,F as Y}from"./index-Yhw67cqt.js";const se=[[114.06446,135.04038,45.92046,.27898],[100.73942,134.04285,45.24965,.28869],[103.41241,129.86131,46.01298,.28808],[114.89074,127.05197,44.42121,.32737],[103.60466,126.79795,46.5158,.27691],[97.11763,131.63296,45.717,.30905],[103.6395,138.00965,45.02646,.27524],[101.48224,129.12715,47.73894,.28904],[99.43081,129.93355,46.7513,.30408],[99.99375,127.90398,46.18404,.27528],[107.34126,134.26675,45.73125,.28578],[101.15789,115.7694,49.28555,.28112],[100.76472,116.80792,47.14113,.29728],[96.68096,164.88758,46.85014,.27297],[152.10838,190.14831,46.35601,.25452],[180.47479,138.99539,62.42575,.36957],[228.96718,129.45401,57.758,.36248],[92.59439,135.36455,42.36877,.40118],[233.26664,133.1603,43.22191,.36678],[270.40962,135.19425,43.55479,-.33616],[410.44343,141.04078,42.08405,-.378]];function ce(r=64,t=48){if(!Number.isInteger(r)||!Number.isInteger(t)||r<1||t<1||(r+1)*(t+1)>65535)throw new Error("Invalid photo mesh resolution");const d=new Float32Array((r+1)*(t+1)*2),u=new Uint16Array(r*t*6);for(let i=0;i<=t;i++)for(let o=0;o<=r;o++){const c=(i*(r+1)+o)*2;d[c]=o/r*2-1,d[c+1]=1-i/t*2}let s=0;for(let i=0;i<t;i++)for(let o=0;o<r;o++){const c=i*(r+1)+o,f=c+r+1;u.set([c,f,c+1,c+1,f,f+1],s),s+=6}return{positions:d,indices:u}}const le=Y.slice(Y.indexOf("float e("),Y.indexOf("void main(){")),me=`precision highp float;
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
}`;function j(r,t,d,u){const s=r.createShader(t);if(!s)throw new Error("Unable to allocate cat shader");if(u(s),r.shaderSource(s,d),r.compileShader(s),!r.getShaderParameter(s,r.COMPILE_STATUS))throw new Error(r.getShaderInfoLog(s));return s}function ue(r,t,d,u,s){if(![t,d,u].every(f=>Number.isInteger(f)&&f>0)||r.length!==t*d*u*4)throw new Error("Invalid cat motion flow");const i=Math.min(t,s),o=Math.min(d,Math.floor(s/u));if(o<1)throw new Error("Cat motion flow exceeds GPU texture limit");if(i===t&&o===d)return{bytes:r,width:t,height:d*u};const c=new Uint8Array(i*o*u*4);for(let f=0;f<u;f++)for(let R=0;R<o;R++)for(let e=0;e<i;e++){const y=Math.max(0,Math.min(t-1,(e+.5)*t/i-.5)),E=Math.max(0,Math.min(d-1,(R+.5)*d/o-.5)),b=Math.floor(y),v=Math.min(t-1,b+1),l=Math.floor(E),g=Math.min(d-1,l+1),w=y-b,a=E-l,p=(m,M,U)=>r[((f*d+M)*t+m)*4+U];for(let m=0;m<4;m++)c[((f*o+R)*i+e)*4+m]=Math.round((p(b,l,m)*(1-w)+p(v,l,m)*w)*(1-a)+(p(b,g,m)*(1-w)+p(v,g,m)*w)*a)}return{bytes:c,width:i,height:o*u}}async function K(r){const t=new Image;return t.src=r,await t.decode(),t}const C=r=>r*r*(3-2*r),Z=[16,15,14,13,12],he=r=>(r%1+1)%1;function J(r){const{mood:t,progress:d=0,gaitPhase:u=0,direction:s}=r;if(r.reducedMotion)return{a:16,b:16,t:0,facing:0};if(t==="walking"){if(r.stageElapsed<160)return{a:12,b:0,t:C(r.stageElapsed/160),facing:s==="right"?1:0};if(r.stageDuration-r.stageElapsed<160)return{a:0,b:12,t:C(1-(r.stageDuration-r.stageElapsed)/160),facing:s==="right"?1:0};const i=he(u)*12;return{a:Math.floor(i),b:(Math.floor(i)+1)%12,t:i%1,facing:s==="right"?1:0}}if(t==="rising"||t==="settling"){const i=C(d)*4,o=t==="rising"?Z:[...Z].reverse(),c=Math.min(3,Math.floor(i));return{a:o[c],b:o[c+1],t:Math.min(1,i-c),facing:t==="rising"?0:s==="right"?1:0}}if(t==="turning"){const i=[12,17,18,19,20,12],o=C(d)*5,c=Math.min(4,Math.floor(o));return{a:i[c],b:i[c+1],t:Math.min(1,o-c),facing:0,turn:d}}return{a:16,b:16,t:0,facing:0}}function Q(r,t){const u=window.innerWidth<760?{home:[0,0],near:[-12.766,2*window.innerHeight/r.offsetHeight],away:[119.149,0]}:{home:[0,0],near:[-43.4146,5.206],away:[121.2195,0]},s=u[t.fromPlace]||u.home,i=u[t.toPlace]||s,o=t.mood==="walking"?t.progress:1,c=o<.12?o*o/.2112:o>.88?1-(1-o)*(1-o)/.2112:(o-.06)/.88;r.style.transform=`translate3d(${s[0]+(i[0]-s[0])*c}%,${s[1]+(i[1]-s[1])*c}%,0)`,r.dataset.motionProgress=t.progress.toFixed(4)}function ge(r,t,d,u,s,i){const o=r.getContext("2d");if(!o)throw new Error("Canvas rendering unavailable");const c=t.getContext("2d"),f=c.getImageData(0,0,t.width,t.height);for(let l=3;l<f.data.length;l+=4){const g=Math.max(0,Math.min(1,(f.data[l]/255-.25)/.23)),w=(l-3)/4,a=w%t.width,p=Math.floor(w/t.width);f.data[l]=Math.round(g*g*(3-2*g)*s[Math.floor(p/4)*512+Math.floor(a/4)])}c.putImageData(f,0,0);const R=new Map(d.pairs.map(l=>[`${l.a}:${l.b}`,l]));let e=!0,y,E=!1;const b=new ResizeObserver(()=>{E||(e=!0,y&&v(y))});try{b.observe(r)}catch(l){throw b.disconnect(),l}function v(l){if(E)return;if(l={...l,reducedMotion:l.reducedMotion||i.matches},y=l,Q(u,l),e){const p=r.getBoundingClientRect(),m=Math.min(devicePixelRatio||1,1.5);r.width=Math.max(1,Math.round(p.width*m)),r.height=Math.max(1,Math.round(p.height*m)),e=!1}if(o.setTransform(1,0,0,1,0,0),o.clearRect(0,0,r.width,r.height),l.mood==="away")return;const g=J(l),w=R.get(`${g.a}:${g.b}`),a=(p,m,M)=>{o.save(),o.globalAlpha=m,!!g.facing!=!!M&&(o.translate(r.width,0),o.scale(-1,1)),o.drawImage(t,p%4*512,Math.floor(p/4)*384,512,384,0,0,r.width,r.height),o.restore()};a(g.a,1-g.t,!1),a(g.b,g.t,w==null?void 0:w.mirrorB),r.dataset.motionFrame=`${g.a}:${g.b}`,r.dataset.motionBlend=g.t.toFixed(4)}return r.dataset.rendererType="canvas",{draw:v,dispose(){E||(E=!0,b.disconnect())}}}async function xe(r,t){const[d,u,s,i,o,c]=await Promise.all([K("./assets/motion/nihao-sprites.png"),ie(),K("./assets/motion/nihao-turn.png"),fetch("./assets/motion/registration.json").then(a=>{if(!a.ok)throw new Error("Missing motion registration");return a.json()}),fetch("./assets/motion/flow.bin").then(a=>{if(!a.ok)throw new Error("Missing motion flow");return a.arrayBuffer()}),fetch("./assets/motion/coverage.bin").then(a=>{if(!a.ok)throw new Error("Missing motion material");return a.arrayBuffer()})]),f=document.createElement("canvas");f.width=2048,f.height=2304;const R=f.getContext("2d");if(!R)throw new Error("Unable to prepare cat atlas");if(c.byteLength!==512*576)throw new Error("Invalid cat motion material");i.frames.forEach((a,p)=>{const[m,M,U,L]=a.dest;R.drawImage(a.source==="curled"?u:a.source==="turn"?s:d,...a.crop,p%4*512+m,Math.floor(p/4)*384+M,U,L)});const e=r.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power",preserveDrawingBuffer:!1}),y=window.matchMedia("(prefers-reduced-motion: reduce)");if(!e)return ge(r,f,i,t,new Uint8Array(c),y);const E={shaders:[],textures:[],buffers:[],program:null};let b=!1,v,l=!1;const g=a=>a.preventDefault();function w(){if(!b){b=!0,v==null||v.disconnect(),l&&(r.removeEventListener("webglcontextlost",g),l=!1);for(const a of E.textures)e.deleteTexture(a);for(const a of E.buffers)e.deleteBuffer(a);E.program&&e.deleteProgram(E.program);for(const a of E.shaders)e.deleteShader(a)}}try{let W=function(n){if(b)return;if(e.isContextLost())throw new Error("Cat GPU context lost");if(n={...n,reducedMotion:n.reducedMotion||y.matches},$=n,e.useProgram(m),e.bindBuffer(e.ARRAY_BUFFER,N),e.enableVertexAttribArray(F),e.vertexAttribPointer(F,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,re),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,te),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,oe),q){const A=r.getBoundingClientRect(),P=Math.min(window.devicePixelRatio||1,1.5);r.width=Math.max(1,Math.round(A.width*P)),r.height=Math.max(1,Math.round(A.height*P)),e.viewport(0,0,r.width,r.height),q=!1}if(Q(t,n),n.mood==="away")return;const h=J(n),T=G.get(`${h.a}:${h.b}`)||[-1,0,0,0],I=(A,P)=>{const D=se[A].slice();return P&&(D[0]=512-D[0],D[3]=-D[3]),D};e.uniform4fv(x.headA,I(h.a,T[2])),e.uniform4fv(x.headB,I(h.b,T[3])),e.uniform1f(x.frameA,h.a),e.uniform1f(x.frameB,h.b),e.uniform1f(x.mixAmount,h.t),e.uniform1f(x.pairIndex,T[0]),e.uniform1f(x.reverseFlow,T[1]),e.uniform1f(x.mirrorA,T[2]),e.uniform1f(x.mirrorB,T[3]),e.uniform1f(x.facing,h.facing);const S=ae.sample(n);e.uniform2f(x.photoScale,...z.scale),e.uniform2f(x.photoOffset,...z.offset);for(const A of k)e.uniform1f(x[A],S[A]);const _=h.a===16&&h.b===16&&k.some(A=>Math.abs(S[A])>1e-7);e.uniform1f(x.restMesh,_?1:0),e.clear(e.COLOR_BUFFER_BIT),_?(e.bindBuffer(e.ARRAY_BUFFER,V),e.vertexAttribPointer(F,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,H),e.drawElements(e.TRIANGLES,O.indices.length,e.UNSIGNED_SHORT,0)):e.drawArrays(e.TRIANGLE_STRIP,0,4),r.dataset.motionFrame=`${h.a}:${h.b}`,r.dataset.motionBlend=h.t.toFixed(4)};r.addEventListener("webglcontextlost",g),l=!0;const a=e.getParameter(e.MAX_TEXTURE_SIZE);if(!Number.isInteger(a)||a<576)throw new Error("Cat textures exceed GPU limits");const p=ue(new Uint8Array(o),i.width,i.height,i.pairs.length,a),m=e.createProgram();if(!m)throw new Error("Unable to allocate cat program");E.program=m;const M=n=>E.shaders.push(n),U=()=>{const n=e.createBuffer();if(!n)throw new Error("Unable to allocate cat buffer");return E.buffers.push(n),n},L=j(e,e.VERTEX_SHADER,me,M),ee=j(e,e.FRAGMENT_SHADER,de,M);if(e.attachShader(m,L),e.attachShader(m,ee),e.linkProgram(m),!e.getProgramParameter(m,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(m));e.useProgram(m);const N=U();e.bindBuffer(e.ARRAY_BUFFER,N),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const O=ce(),V=U(),H=U();if(e.bindBuffer(e.ARRAY_BUFFER,V),e.bufferData(e.ARRAY_BUFFER,O.positions,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,H),e.bufferData(e.ELEMENT_ARRAY_BUFFER,O.indices,e.STATIC_DRAW),e.getError()!==e.NO_ERROR)throw new Error("Unable to upload cat geometry");e.bindBuffer(e.ARRAY_BUFFER,N);const F=e.getAttribLocation(m,"position");e.enableVertexAttribArray(F),e.vertexAttribPointer(F,2,e.FLOAT,!1,0,0);const x=Object.fromEntries(["atlas","flows","coverage","frameA","frameB","pairIndex","pairCount","mixAmount","reverseFlow","mirrorA","mirrorB","facing","restMesh","photoScale","photoOffset","headA","headB",...k].map(n=>[n,e.getUniformLocation(m,n)])),X=(n,h,T,I,S=e.RGBA)=>{const _=e.createTexture();if(!_)throw new Error("Unable to allocate cat texture");E.textures.push(_),e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,_),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),T?e.texImage2D(e.TEXTURE_2D,0,S,T,I,0,S,e.UNSIGNED_BYTE,h):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,h);const A=e.getError();if(A!==e.NO_ERROR)throw new Error("Unable to upload cat texture "+n+" (WebGL "+A+")");return _};let B=f;if(f.width>a||f.height>a){const n=Math.min(.75,a/f.width,a/f.height);B=document.createElement("canvas"),B.width=Math.max(1,Math.floor(f.width*n)),B.height=Math.max(1,Math.floor(f.height*n));const h=B.getContext("2d");if(!h)throw new Error("Unable to prepare GPU cat atlas");h.drawImage(f,0,0,B.width,B.height)}const re=X(0,B),te=X(1,p.bytes,p.width,p.height),oe=X(2,new Uint8Array(c),512,576,e.LUMINANCE);e.uniform1i(x.atlas,0),e.uniform1i(x.flows,1),e.uniform1f(x.pairCount,i.pairs.length),e.uniform1i(x.coverage,2);const G=new Map;i.pairs.forEach((n,h)=>{G.set(`${n.a}:${n.b}`,[h,0,0,n.mirrorB?1:0]),G.set(`${n.b}:${n.a}`,[h,1,n.mirrorB?1:0,0])});let $,q=!0;v=new ResizeObserver(()=>{b||(q=!0,$&&W($))}),v.observe(r);const ae=ne(),z=fe("legacyRegistration");return r.dataset.rendererType="webgl",{draw:W,dispose:w}}catch(a){throw w(),delete r.dataset.rendererType,a}}export{xe as createCatRenderer,J as sampleCatPose};

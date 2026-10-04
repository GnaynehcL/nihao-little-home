const le=[[114.06446,135.04038,45.92046,.27898],[100.73942,134.04285,45.24965,.28869],[103.41241,129.86131,46.01298,.28808],[114.89074,127.05197,44.42121,.32737],[103.60466,126.79795,46.5158,.27691],[97.11763,131.63296,45.717,.30905],[103.6395,138.00965,45.02646,.27524],[101.48224,129.12715,47.73894,.28904],[99.43081,129.93355,46.7513,.30408],[99.99375,127.90398,46.18404,.27528],[107.34126,134.26675,45.73125,.28578],[101.15789,115.7694,49.28555,.28112],[100.76472,116.80792,47.14113,.29728],[96.68096,164.88758,46.85014,.27297],[152.10838,190.14831,46.35601,.25452],[180.47479,138.99539,62.42575,.36957],[228.96718,129.45401,57.758,.36248],[92.59439,135.36455,42.36877,.40118],[233.26664,133.1603,43.22191,.36678],[270.40962,135.19425,43.55479,-.33616],[410.44343,141.04078,42.08405,-.378]];function de(t=64,r=48){if(!Number.isInteger(t)||!Number.isInteger(r)||t<1||r<1||(t+1)*(r+1)>65535)throw new Error("Invalid photo mesh resolution");const i=new Float32Array((t+1)*(r+1)*2),d=new Uint16Array(t*r*6);for(let a=0;a<=r;a++)for(let o=0;o<=t;o++){const s=(a*(t+1)+o)*2;i[s]=o/t*2-1,i[s+1]=1-a/r*2}let c=0;for(let a=0;a<r;a++)for(let o=0;o<t;o++){const s=a*(t+1)+o,f=s+t+1;d.set([s,f,s+1,s+1,f,f+1],c),c+=6}return{positions:i,indices:d}}const J=Object.freeze([1024,768]),me=new Set(["watching","close","content","noticing","startled"]),U=Object.freeze({breath:0,headAngle:0,headX:0,headY:0,earLeft:0,earRight:0}),O=Object.keys(U),re=t=>Math.max(0,Math.min(1,t)),Q=t=>(t=re(t),t*t*t*(t*(t*6-15)+10)),V=t=>t<=0||t>=1?0:Math.sin(Math.PI*t)**2,he=(t,r,i)=>t+(r-t)*i;J[0]/J[1];function ue(t){if(t.reducedMotion||!me.has(t.mood))return{...U};const r=Math.max(0,t.activeTime||0),i=Math.max(0,t.stageElapsed||0),d=.5*(1-Math.cos(r*2*Math.PI/6200)),c=t.mood==="content",a=Number.isFinite(t.stageDuration)?Math.max(1,t.stageDuration):4500,o=c?V(i/a):0,s=["noticing","startled"].includes(t.mood)?V(i/a):0,f=V(i/1e3)*Math.sin(i*2*Math.PI/1e3);return{breath:d,headAngle:.0022*d*Math.sin(r*2*Math.PI/12400)-.0105*o+.004*s,headX:.0012*o,headY:-9e-4*o-4e-4*s,earLeft:(c?.025:.012)*f,earRight:(c?-.017:-.009)*f}}function ge(){let t={...U},r={...U},i,d=0,c=-1/0,a=0;return{sample(o,s=1){const f=Math.max(0,o.activeTime||0),b=Math.max(0,o.stageElapsed||0);(f<c||o.reducedMotion)&&(t={...U},r={...U},i=void 0,d=f),(i!==o.mood||b+.001<a)&&(r={...t},d=f,i=o.mood);let R=ue(o);const p=Number.isFinite(o.stageDuration)?Q((o.stageDuration-b)/220):1,E=Q((f-d)/220),y=re(s);for(const l of O)t[l]=he(r[l],R[l]*p,E)*y;return c=f,a=b,{...t}},reset(){t={...U},r={...U},i=void 0,d=0,c=-1/0,a=0}}}function pe(t="fullPhoto"){if(t==="fullPhoto")return{scale:[1,1],offset:[0,0]};if(t!=="legacyRegistration")throw new Error("Unknown photo mapping");const r=[81,58,864,657],i=[30.72,18.3467,450.56,342.6133];return{scale:[i[2]/r[2]*1024/512,i[3]/r[3]*768/384],offset:[(i[0]-r[0]*i[2]/r[2])/512,(i[1]-r[1]*i[3]/r[3])/384]}}const H=`precision highp float;
varying vec2 uv;uniform sampler2D photo;uniform vec2 photoScale,photoOffset;
uniform float breath,headAngle,headX,headY,earLeft,earRight;
float e(float x){x=clamp(x,0.,1.);return x*x*x*(x*(x*6.-15.)+10.);}
float ramp(float a,float b,float x){return e((x-a)/(b-a));}
float mask(vec2 p,vec2 c,vec2 r){return 1.-ramp(1.,1.48,length((p-c)/r));}
vec2 rot(vec2 p,vec2 c,float a){vec2 v=(p-c)*vec2(1.3333333333333333,1.);float co=cos(a),si=sin(a);
return vec2(co*v.x-si*v.y-v.x,si*v.x+co*v.y-v.y)/vec2(1.3333333333333333,1.);}
vec2 forwardPhoto(vec2 p){
float h=mask(p,vec2(.465,.30),vec2(.235,.29));
float b=mask(p,vec2(.64,.645),vec2(.34,.24))*(1.-h)*(1.-h)*(1.-ramp(.80,.88,p.y));
vec2 q=p+vec2(.0014*breath*b*(p.x-.62)/.34,-.0023*breath*b);
float l=mask(p,vec2(.377,.125),vec2(.065,.10))*(1.-ramp(.17,.23,p.y));
float r=mask(p,vec2(.627,.205),vec2(.079,.065))*(1.-ramp(.245,.30,p.y));
q+=l*rot(p,vec2(.388,.227),earLeft)+r*rot(p,vec2(.587,.292),earRight);
q+=h*(rot(q,vec2(.48,.50),headAngle)+vec2(headX,headY));return q;}
void main(){vec2 p=(uv-photoOffset)/photoScale;vec2 s=p;
for(int i=0;i<4;i++){s-=forwardPhoto(s)-p;}
if(s.x<0.||s.x>1.||s.y<0.||s.y>1.){gl_FragColor=vec4(0.);return;}
// Original alpha, RGB and fur edges are sampled directly, without material thresholds.
gl_FragColor=texture2D(photo,s);}`,xe=H.slice(H.indexOf("float e("),H.indexOf("void main(){")),ve=`precision highp float;
attribute vec2 position; varying vec2 uv;
uniform vec2 photoScale,photoOffset;
uniform float restMesh,breath,headAngle,headX,headY,earLeft,earRight;
${xe}
void main(){
  uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);
  gl_Position=vec4(position,0.,1.);
  if(restMesh>.5){
    vec2 source=(uv-photoOffset)/photoScale;
    vec2 delta=(forwardPhoto(source)-source)*photoScale;
    gl_Position.xy+=vec2(delta.x*2.,-delta.y*2.);
  }
}`,Ee=`precision mediump float;
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
}`;function ee(t,r,i,d){const c=t.createShader(r);if(!c)throw new Error("Unable to allocate cat shader");if(d(c),t.shaderSource(c,i),t.compileShader(c),!t.getShaderParameter(c,t.COMPILE_STATUS))throw new Error(t.getShaderInfoLog(c));return c}function we(t,r,i,d,c){if(![r,i,d].every(f=>Number.isInteger(f)&&f>0)||t.length!==r*i*d*4)throw new Error("Invalid cat motion flow");const a=Math.min(r,c),o=Math.min(i,Math.floor(c/d));if(o<1)throw new Error("Cat motion flow exceeds GPU texture limit");if(a===r&&o===i)return{bytes:t,width:r,height:i*d};const s=new Uint8Array(a*o*d*4);for(let f=0;f<d;f++)for(let b=0;b<o;b++)for(let e=0;e<a;e++){const R=Math.max(0,Math.min(r-1,(e+.5)*r/a-.5)),p=Math.max(0,Math.min(i-1,(b+.5)*i/o-.5)),E=Math.floor(R),y=Math.min(r-1,E+1),l=Math.floor(p),g=Math.min(i-1,l+1),w=R-E,n=p-l,x=(h,T,_)=>t[((f*i+T)*r+h)*4+_];for(let h=0;h<4;h++)s[((f*o+b)*a+e)*4+h]=Math.round((x(E,l,h)*(1-w)+x(y,l,h)*w)*(1-n)+(x(E,g,h)*(1-w)+x(y,g,h)*w)*n)}return{bytes:s,width:a,height:o*d}}async function z(t){const r=new Image;return r.src=t,await r.decode(),r}const L=t=>t*t*(3-2*t),te=[16,15,14,13,12],be=t=>(t%1+1)%1;function oe(t){const{mood:r,progress:i=0,gaitPhase:d=0,direction:c}=t;if(t.reducedMotion)return{a:16,b:16,t:0,facing:0};if(r==="walking"){if(t.stageElapsed<160)return{a:12,b:0,t:L(t.stageElapsed/160),facing:c==="right"?1:0};if(t.stageDuration-t.stageElapsed<160)return{a:0,b:12,t:L(1-(t.stageDuration-t.stageElapsed)/160),facing:c==="right"?1:0};const a=be(d)*12;return{a:Math.floor(a),b:(Math.floor(a)+1)%12,t:a%1,facing:c==="right"?1:0}}if(r==="rising"||r==="settling"){const a=L(i)*4,o=r==="rising"?te:[...te].reverse(),s=Math.min(3,Math.floor(a));return{a:o[s],b:o[s+1],t:Math.min(1,a-s),facing:r==="rising"?0:c==="right"?1:0}}if(r==="turning"){const a=[12,17,18,19,20,12],o=L(i)*5,s=Math.min(4,Math.floor(o));return{a:a[s],b:a[s+1],t:Math.min(1,o-s),facing:0,turn:i}}return{a:16,b:16,t:0,facing:0}}function ae(t,r){const d=window.innerWidth<760?{home:[0,0],near:[-12.766,2*window.innerHeight/t.offsetHeight],away:[119.149,0]}:{home:[0,0],near:[-43.4146,5.206],away:[121.2195,0]},c=d[r.fromPlace]||d.home,a=d[r.toPlace]||c,o=r.mood==="walking"?r.progress:1,s=o<.12?o*o/.2112:o>.88?1-(1-o)*(1-o)/.2112:(o-.06)/.88;t.style.transform=`translate3d(${c[0]+(a[0]-c[0])*s}%,${c[1]+(a[1]-c[1])*s}%,0)`,t.dataset.motionProgress=r.progress.toFixed(4)}function ye(t,r,i,d,c,a){const o=t.getContext("2d");if(!o)throw new Error("Canvas rendering unavailable");const s=r.getContext("2d"),f=s.getImageData(0,0,r.width,r.height);for(let l=3;l<f.data.length;l+=4){const g=Math.max(0,Math.min(1,(f.data[l]/255-.25)/.23)),w=(l-3)/4,n=w%r.width,x=Math.floor(w/r.width);f.data[l]=Math.round(g*g*(3-2*g)*c[Math.floor(x/4)*512+Math.floor(n/4)])}s.putImageData(f,0,0);const b=new Map(i.pairs.map(l=>[`${l.a}:${l.b}`,l]));let e=!0,R,p=!1;const E=new ResizeObserver(()=>{p||(e=!0,R&&y(R))});try{E.observe(t)}catch(l){throw E.disconnect(),l}function y(l){if(p)return;if(l={...l,reducedMotion:l.reducedMotion||a.matches},R=l,ae(d,l),e){const x=t.getBoundingClientRect(),h=Math.min(devicePixelRatio||1,1.5);t.width=Math.max(1,Math.round(x.width*h)),t.height=Math.max(1,Math.round(x.height*h)),e=!1}if(o.setTransform(1,0,0,1,0,0),o.clearRect(0,0,t.width,t.height),l.mood==="away")return;const g=oe(l),w=b.get(`${g.a}:${g.b}`),n=(x,h,T)=>{o.save(),o.globalAlpha=h,!!g.facing!=!!T&&(o.translate(t.width,0),o.scale(-1,1)),o.drawImage(r,x%4*512,Math.floor(x/4)*384,512,384,0,0,t.width,t.height),o.restore()};n(g.a,1-g.t,!1),n(g.b,g.t,w==null?void 0:w.mirrorB),t.dataset.motionFrame=`${g.a}:${g.b}`,t.dataset.motionBlend=g.t.toFixed(4)}return t.dataset.rendererType="canvas",{draw:y,dispose(){p||(p=!0,E.disconnect())}}}async function Me(t,r){const[i,d,c,a,o,s]=await Promise.all([z("./assets/motion/nihao-sprites.png"),z("./assets/nihao-curled.png"),z("./assets/motion/nihao-turn.png"),fetch("./assets/motion/registration.json").then(n=>{if(!n.ok)throw new Error("Missing motion registration");return n.json()}),fetch("./assets/motion/flow.bin").then(n=>{if(!n.ok)throw new Error("Missing motion flow");return n.arrayBuffer()}),fetch("./assets/motion/coverage.bin").then(n=>{if(!n.ok)throw new Error("Missing motion material");return n.arrayBuffer()})]),f=document.createElement("canvas");f.width=2048,f.height=2304;const b=f.getContext("2d");if(!b)throw new Error("Unable to prepare cat atlas");if(s.byteLength!==512*576)throw new Error("Invalid cat motion material");a.frames.forEach((n,x)=>{const[h,T,_,N]=n.dest;b.drawImage(n.source==="curled"?d:n.source==="turn"?c:i,...n.crop,x%4*512+h,Math.floor(x/4)*384+T,_,N)});const e=t.getContext("webgl",{alpha:!0,antialias:!1,premultipliedAlpha:!0,powerPreference:"low-power",preserveDrawingBuffer:!1}),R=window.matchMedia("(prefers-reduced-motion: reduce)");if(!e)return ye(t,f,a,r,new Uint8Array(s),R);const p={shaders:[],textures:[],buffers:[],program:null};let E=!1,y,l=!1;const g=n=>n.preventDefault();function w(){if(!E){E=!0,y==null||y.disconnect(),l&&(t.removeEventListener("webglcontextlost",g),l=!1);for(const n of p.textures)e.deleteTexture(n);for(const n of p.buffers)e.deleteBuffer(n);p.program&&e.deleteProgram(p.program);for(const n of p.shaders)e.deleteShader(n)}}try{let Z=function(m){if(E)return;if(e.isContextLost())throw new Error("Cat GPU context lost");if(m={...m,reducedMotion:m.reducedMotion||R.matches},Y=m,e.useProgram(h),e.bindBuffer(e.ARRAY_BUFFER,X),e.enableVertexAttribArray(D),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,ne),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,fe),e.activeTexture(e.TEXTURE2),e.bindTexture(e.TEXTURE_2D,ce),$){const M=t.getBoundingClientRect(),C=Math.min(window.devicePixelRatio||1,1.5);t.width=Math.max(1,Math.round(M.width*C)),t.height=Math.max(1,Math.round(M.height*C)),e.viewport(0,0,t.width,t.height),$=!1}if(ae(r,m),m.mood==="away")return;const u=oe(m),A=G.get(`${u.a}:${u.b}`)||[-1,0,0,0],P=(M,C)=>{const S=le[M].slice();return C&&(S[0]=512-S[0],S[3]=-S[3]),S};e.uniform4fv(v.headA,P(u.a,A[2])),e.uniform4fv(v.headB,P(u.b,A[3])),e.uniform1f(v.frameA,u.a),e.uniform1f(v.frameB,u.b),e.uniform1f(v.mixAmount,u.t),e.uniform1f(v.pairIndex,A[0]),e.uniform1f(v.reverseFlow,A[1]),e.uniform1f(v.mirrorA,A[2]),e.uniform1f(v.mirrorB,A[3]),e.uniform1f(v.facing,u.facing);const F=se.sample(m);e.uniform2f(v.photoScale,...K.scale),e.uniform2f(v.photoOffset,...K.offset);for(const M of O)e.uniform1f(v[M],F[M]);const I=u.a===16&&u.b===16&&O.some(M=>Math.abs(F[M])>1e-7);e.uniform1f(v.restMesh,I?1:0),e.clear(e.COLOR_BUFFER_BIT),I?(e.bindBuffer(e.ARRAY_BUFFER,W),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,j),e.drawElements(e.TRIANGLES,k.indices.length,e.UNSIGNED_SHORT,0)):e.drawArrays(e.TRIANGLE_STRIP,0,4),t.dataset.motionFrame=`${u.a}:${u.b}`,t.dataset.motionBlend=u.t.toFixed(4)};t.addEventListener("webglcontextlost",g),l=!0;const n=e.getParameter(e.MAX_TEXTURE_SIZE);if(!Number.isInteger(n)||n<576)throw new Error("Cat textures exceed GPU limits");const x=we(new Uint8Array(o),a.width,a.height,a.pairs.length,n),h=e.createProgram();if(!h)throw new Error("Unable to allocate cat program");p.program=h;const T=m=>p.shaders.push(m),_=()=>{const m=e.createBuffer();if(!m)throw new Error("Unable to allocate cat buffer");return p.buffers.push(m),m},N=ee(e,e.VERTEX_SHADER,ve,T),ie=ee(e,e.FRAGMENT_SHADER,Ee,T);if(e.attachShader(h,N),e.attachShader(h,ie),e.linkProgram(h),!e.getProgramParameter(h,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(h));e.useProgram(h);const X=_();e.bindBuffer(e.ARRAY_BUFFER,X),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const k=de(),W=_(),j=_();if(e.bindBuffer(e.ARRAY_BUFFER,W),e.bufferData(e.ARRAY_BUFFER,k.positions,e.STATIC_DRAW),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,j),e.bufferData(e.ELEMENT_ARRAY_BUFFER,k.indices,e.STATIC_DRAW),e.getError()!==e.NO_ERROR)throw new Error("Unable to upload cat geometry");e.bindBuffer(e.ARRAY_BUFFER,X);const D=e.getAttribLocation(h,"position");e.enableVertexAttribArray(D),e.vertexAttribPointer(D,2,e.FLOAT,!1,0,0);const v=Object.fromEntries(["atlas","flows","coverage","frameA","frameB","pairIndex","pairCount","mixAmount","reverseFlow","mirrorA","mirrorB","facing","restMesh","photoScale","photoOffset","headA","headB",...O].map(m=>[m,e.getUniformLocation(h,m)])),q=(m,u,A,P,F=e.RGBA)=>{const I=e.createTexture();if(!I)throw new Error("Unable to allocate cat texture");p.textures.push(I),e.activeTexture(e.TEXTURE0+m),e.bindTexture(e.TEXTURE_2D,I),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),A?e.texImage2D(e.TEXTURE_2D,0,F,A,P,0,F,e.UNSIGNED_BYTE,u):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.RGBA,e.UNSIGNED_BYTE,u);const M=e.getError();if(M!==e.NO_ERROR)throw new Error("Unable to upload cat texture "+m+" (WebGL "+M+")");return I};let B=f;if(f.width>n||f.height>n){const m=Math.min(.75,n/f.width,n/f.height);B=document.createElement("canvas"),B.width=Math.max(1,Math.floor(f.width*m)),B.height=Math.max(1,Math.floor(f.height*m));const u=B.getContext("2d");if(!u)throw new Error("Unable to prepare GPU cat atlas");u.drawImage(f,0,0,B.width,B.height)}const ne=q(0,B),fe=q(1,x.bytes,x.width,x.height),ce=q(2,new Uint8Array(s),512,576,e.LUMINANCE);e.uniform1i(v.atlas,0),e.uniform1i(v.flows,1),e.uniform1f(v.pairCount,a.pairs.length),e.uniform1i(v.coverage,2);const G=new Map;a.pairs.forEach((m,u)=>{G.set(`${m.a}:${m.b}`,[u,0,0,m.mirrorB?1:0]),G.set(`${m.b}:${m.a}`,[u,1,m.mirrorB?1:0,0])});let Y,$=!0;y=new ResizeObserver(()=>{E||($=!0,Y&&Z(Y))}),y.observe(t);const se=ge(),K=pe("legacyRegistration");return t.dataset.rendererType="webgl",{draw:Z,dispose:w}}catch(n){throw w(),delete t.dataset.rendererType,n}}export{Me as createCatRenderer,oe as sampleCatPose};

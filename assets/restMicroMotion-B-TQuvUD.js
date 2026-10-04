const d=Object.freeze([1024,768]),y=new Set(["watching","close","content","noticing","startled"]),n=Object.freeze({breath:0,headAngle:0,headX:0,headY:0,earLeft:0,earRight:0}),b=Object.keys(n),u=e=>Math.max(0,Math.min(1,e)),p=e=>(e=u(e),e*e*e*(e*(e*6-15)+10)),h=e=>e<=0||e>=1?0:Math.sin(Math.PI*e)**2,E=(e,a,t)=>e+(a-e)*t;d[0]/d[1];function R(e){if(e.reducedMotion||!y.has(e.mood))return{...n};const a=Math.max(0,e.activeTime||0),t=Math.max(0,e.stageElapsed||0),c=.5*(1-Math.cos(a*2*Math.PI/6200)),i=e.mood==="content",s=Number.isFinite(e.stageDuration)?Math.max(1,e.stageDuration):4500,o=i?h(t/s):0,l=["noticing","startled"].includes(e.mood)?h(t/s):0,r=h(t/1e3)*Math.sin(t*2*Math.PI/1e3);return{breath:c,headAngle:.0022*c*Math.sin(a*2*Math.PI/12400)-.0105*o+.004*l,headX:.0012*o,headY:-9e-4*o-4e-4*l,earLeft:(i?.025:.012)*r,earRight:(i?-.017:-.009)*r}}function O(){let e={...n},a={...n},t,c=0,i=-1/0,s=0;return{sample(o,l=1){const r=Math.max(0,o.activeTime||0),v=Math.max(0,o.stageElapsed||0);(r<i||o.reducedMotion)&&(e={...n},a={...n},t=void 0,c=r),(t!==o.mood||v+.001<s)&&(a={...e},c=r,t=o.mood);let m=R(o);const g=Number.isFinite(o.stageDuration)?p((o.stageDuration-v)/220):1,M=p((r-c)/220),x=u(l);for(const f of b)e[f]=E(a[f],m[f]*g,M)*x;return i=r,s=v,{...e}},reset(){e={...n},a={...n},t=void 0,c=0,i=-1/0,s=0}}}function P(e="fullPhoto"){if(e==="fullPhoto")return{scale:[1,1],offset:[0,0]};if(e!=="legacyRegistration")throw new Error("Unknown photo mapping");const a=[81,58,864,657],t=[30.72,18.3467,450.56,342.6133];return{scale:[t[2]/a[2]*1024/512,t[3]/a[3]*768/384],offset:[(t[0]-a[0]*t[2]/a[2])/512,(t[1]-a[1]*t[3]/a[3])/384]}}const T=`attribute vec2 position;varying vec2 uv;
void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}`,I=`precision highp float;
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
gl_FragColor=texture2D(photo,s);}`;export{I as F,b as K,T as V,O as c,P as p};

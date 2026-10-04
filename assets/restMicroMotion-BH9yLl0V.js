const x=Object.freeze([1024,768]),D=new Set(["watching","close","content","noticing","startled"]),h=Object.freeze({breath:0,headAngle:0,headX:0,headY:0,earLeft:0,earRight:0}),P=Object.keys(h),E=e=>Math.max(0,Math.min(1,e)),s=e=>(e=E(e),e*e*e*(e*(e*6-15)+10)),M=e=>e<=0||e>=1?0:Math.sin(Math.PI*e)**2,b=(e,n,t)=>e+(n-e)*t,R=e=>Math.max(-1,Math.min(1,e)),k=(e,n,t=150,r=650)=>s(e/t)*s((n-e)/r);x[0]/x[1];function Y(e){if(e.reducedMotion||!D.has(e.mood))return{...h};const n=Math.max(0,e.activeTime||0),t=Math.max(0,e.stageElapsed||0),r=.5*(1-Math.cos(n*2*Math.PI/6200)),f=e.mood==="content",i=Number.isFinite(e.stageDuration)?Math.max(1,e.stageDuration):4500,g=f?M(t/i):0,o=["noticing","startled"].includes(e.mood)?M(t/i):0,p=M(t/1e3)*Math.sin(t*2*Math.PI/1e3),l={breath:r,headAngle:.0022*r*Math.sin(n*2*Math.PI/12400)-.0105*g+.004*o,headX:.0012*g,headY:-9e-4*g-4e-4*o,earLeft:(f?.025:.012)*p,earRight:(f?-.017:-.009)*p};if(!e.interaction)return l;const d=k(t,i),u=.0022*r*Math.sin(n*2*Math.PI/12400);if(e.interaction==="pet"){const a=M((t-90)/700);return{breath:r,headAngle:u-.06*d,headX:-.006*d,headY:.004*d,earLeft:.08*a,earRight:-.055*a}}if(e.interaction==="call"){const a=k(t,i,130,500);return{breath:r,headAngle:u+.046*a,headX:.006*a,headY:-.012*a,earLeft:-.08*a,earRight:.065*a}}if(e.interaction==="toy"){const a=e.toyTarget,c=a?R((a.x-.465)/.35):b(-.8,.8,s((t-700)/1e3)),y=a?R((a.y-.36)/.33):-.35,v=e.toyTracking?s(t/100):a?s((i-t)/700):d;return{breath:r,headAngle:u+.065*c*v,headX:.01*c*v,headY:.016*y*v,earLeft:.055*c*v,earRight:-.045*c*v}}if(e.interaction==="company"){const a=s(t/140)*(1-s((t-900)/350)),c=s((t-850)/230)*(1-s((t-1750)/550));return{breath:r,headAngle:u+.025*a-.04*c,headX:.004*a-.002*c,headY:-.016*a+.01*c,earLeft:-.055*a,earRight:.045*a}}return l}function I(){let e={...h},n={...h},t,r,f=0,i=-1/0,g=0;return{sample(o,p=1){const l=Math.max(0,o.activeTime||0),d=Math.max(0,o.stageElapsed||0);(l<i||o.reducedMotion)&&(e={...h},n={...h},t=void 0,r=void 0,f=l),(t!==o.mood||r!==o.interaction||d+.001<g)&&(n={...e},f=l,t=o.mood,r=o.interaction);let a=Y(o);const c=o.interaction?160:220,y=Number.isFinite(o.stageDuration)&&!o.toyTracking?s((o.stageDuration-d)/c):1,v=s((l-f)/c),T=E(p),A=Number.isFinite(i)?1-Math.exp(-Math.max(0,l-i)/70):0;for(const m of P)e[m]=(o.toyTracking?b(e[m],a[m],A):b(n[m],a[m]*y,v))*T;return i=l,g=d,{...e}},reset(){e={...h},n={...h},t=void 0,r=void 0,f=0,i=-1/0,g=0}}}function O(e="fullPhoto"){if(e==="fullPhoto")return{scale:[1,1],offset:[0,0]};if(e!=="legacyRegistration")throw new Error("Unknown photo mapping");const n=[81,58,864,657],t=[30.72,18.3467,450.56,342.6133];return{scale:[t[2]/n[2]*1024/512,t[3]/n[3]*768/384],offset:[(t[0]-n[0]*t[2]/n[2])/512,(t[1]-n[1]*t[3]/n[3])/384]}}const X=`attribute vec2 position;varying vec2 uv;
void main(){uv=vec2((position.x+1.)*.5,(1.-position.y)*.5);gl_Position=vec4(position,0.,1.);}`,L=`precision highp float;
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
bool precise=abs(headAngle)>.018||abs(headX)>.003||abs(headY)>.0035||abs(earLeft)>.035||abs(earRight)>.035;
for(int i=0;i<6;i++){s-=forwardPhoto(s)-p;if(i==3&&!precise)break;}
if(s.x<0.||s.x>1.||s.y<0.||s.y>1.){gl_FragColor=vec4(0.);return;}
// Original alpha, RGB and fur edges are sampled directly, without material thresholds.
gl_FragColor=texture2D(photo,s);}`;export{L as F,P as K,X as V,I as c,O as p};

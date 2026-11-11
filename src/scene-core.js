(function () {
'use strict';
const T = THREE;
const canvas = document.getElementById('scene');
const container = document.getElementById('scene-wrap');
const loading = document.getElementById('loading');
const errorPanel = document.getElementById('render-error');
document.getElementById('retry').addEventListener('click', () => location.reload());
try {
const scene = new T.Scene();
const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:true, powerPreference:'high-performance', preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
renderer.outputColorSpace = T.SRGBColorSpace;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = T.PCFSoftShadowMap;
renderer.setClearColor(0x000000, 0);
const camera = new T.OrthographicCamera(-12,12,7,-7,.1,120);
const HOME = {position:new T.Vector3(10.1,13.1,19.7), target:new T.Vector3(0,4.05,0), zoom:1};
camera.position.copy(HOME.position);
const controls = new OrbitControls(camera,canvas);
controls.target.copy(HOME.target);
controls.enableDamping=true; controls.dampingFactor=.075;
controls.enablePan=false; controls.minZoom=.67; controls.maxZoom=2.65;
controls.minPolarAngle=.15; controls.maxPolarAngle=Math.PI*.482;
controls.rotateSpeed=.58; controls.zoomSpeed=.75;
controls.touches.ONE=T.TOUCH.ROTATE; controls.touches.TWO=T.TOUCH.DOLLY_PAN;
controls.update();
const staticRoot = new T.Group(); scene.add(staticRoot);
const treeGroups=[]; const lampLights=[]; const lampGlows=[]; const windowMats=[];
const flowerData=[]; const leafData=[]; const petalSources=[]; const panicleShadows=[];
const stats={trees:0,branches:0,flowers:0,leaves:0,fallingPetals:28};
function randFactory(seed){let a=seed|0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const rng = randFactory(78271);
const clamp=T.MathUtils.clamp, lerp=T.MathUtils.lerp;
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const rampData=new Uint8Array(256*4);
for(let i=0;i<256;i++){const v=Math.round(lerp(92,255,Math.pow(i/255,.76)));rampData.set([v,v,v,255],i*4);}
const ramp=new T.DataTexture(rampData,256,1,T.RGBAFormat);ramp.minFilter=T.LinearFilter;ramp.magFilter=T.LinearFilter;ramp.needsUpdate=true;
function toon(color, extra={}) {return new T.MeshToonMaterial({color,gradientMap:ramp,...extra});}
function standard(color,extra={}) {return new T.MeshStandardMaterial({color,roughness:.92,metalness:0,...extra});}
function noiseTexture(base, variation=8, size=256){
 const c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,size,size);
 const im=ctx.getImageData(0,0,size,size);const r=randFactory(5295);for(let i=0;i<im.data.length;i+=4){const d=(r()-.5)*variation;im.data[i]+=d;im.data[i+1]+=d;im.data[i+2]+=d;}
 ctx.putImageData(im,0,0);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(2,2);return tex;
}
const plaster=noiseTexture('#ffffff',8);
const M={
 cream:toon('#eadfc9',{map:plaster}), trim:toon('#f5ead5'), ledge:toon('#e1d4c0'), inset:toon('#d3c4ad'),
 roof:toon('#827c7f'), iron:standard('#594b55',{roughness:.72}), ironLight:standard('#79626f'),
 wood:toon('#788280'), woodDark:toon('#606f70'), brass:standard('#b29a69',{roughness:.52,metalness:.4}),
 base:toon('#c8bfb3'), baseLine:toon('#b6aea7'), path:toon('#d9d0bd'), curb:toon('#e5dcca'), soil:toon('#90877b'),
 road:toon('#b5b2ba',{map:noiseTexture('#ffffff',16)}), roadLine:toon('#dfd7d1'), pot:toon('#ae8e80'),
 bench:toon('#9371a4'), benchEdge:toon('#aa89ba'), paper:toon('#e8ddc9'), bark:toon('#827366'), barkLight:toon('#aa9580'), barkDark:toon('#695d59'),
 deepGreen:toon('#768571'), leaf:toon('#8d9776',{side:T.DoubleSide}), flower:toon('#ffffff',{side:T.DoubleSide}),
 glass:standard('#8e9ba0',{roughness:.45,emissive:'#ffc785',emissiveIntensity:.12}),
 lantern:standard('#f2d5a1',{emissive:'#ffd18e',emissiveIntensity:.7,roughness:.65}),
 bulb:new T.MeshBasicMaterial({color:'#ffdfa4',toneMapped:false}),
};
const cubeGeo=new T.BoxGeometry(1,1,1);
function mesh(geo,mat,parent=staticRoot,pos=null,rotation=null,scale=null){const m=new T.Mesh(geo,mat);if(pos)m.position.copy(pos);if(rotation)m.rotation.set(...rotation);if(scale)m.scale.copy(scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
function box(w,h,d,mat,parent=staticRoot,pos=V(),rotation=null){return mesh(cubeGeo,mat,parent,pos,rotation,V(w,h,d));}
function cylinder(rt,rb,h,mat,parent=staticRoot,pos=V(),segments=12){return mesh(new T.CylinderGeometry(rt,rb,h,segments),mat,parent,pos);}
function sphere(r,mat,parent=staticRoot,pos=V(),scale=null){return mesh(new T.SphereGeometry(r,12,8),mat,parent,pos,null,scale);}
function curveTube(points,radius,mat,parent=staticRoot,segments=24,sides=6){const pts=points.map(p=>p.isVector3?p:V(...p));return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),segments,radius,sides,false),mat,parent);}
function lineTube(points,radius,mat,parent=staticRoot,sides=6){const path=new T.CurvePath();for(let i=1;i<points.length;i++)path.add(new T.LineCurve3(points[i-1],points[i]));return mesh(new T.TubeGeometry(path,Math.max(points.length*2,8),radius,sides,false),mat,parent);}
function rod(a,b,radius,mat,parent=staticRoot,radiusEnd=radius,sides=8){const d=b.clone().sub(a),m=cylinder(radiusEnd,radius,d.length(),mat,parent,a.clone().add(b).multiplyScalar(.5),sides);m.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());return m;}
function taperedTube(points,r0,r1,mat,parent=staticRoot,segments=16,sides=7){
 const curve=new T.CatmullRomCurve3(points);const frames=curve.computeFrenetFrames(segments,false);const positions=[],normals=[],indices=[],uv=[];
 for(let i=0;i<=segments;i++){const t=i/segments,p=curve.getPoint(t);const r=lerp(r0,r1,Math.pow(t,.76));for(let j=0;j<=sides;j++){const a=j/sides*Math.PI*2,n=frames.normals[i].clone().multiplyScalar(Math.cos(a)).addScaledVector(frames.binormals[i],Math.sin(a));positions.push(p.x+n.x*r,p.y+n.y*r,p.z+n.z*r);normals.push(n.x,n.y,n.z);uv.push(j/sides,t);}}
 for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);stats.branches++;return mesh(g,mat,parent);
}
function horizontalExtrude(shape,depth,y,mat,parent=staticRoot,bevel=.025){const g=new T.ExtrudeGeometry(shape,{depth,steps:1,bevelEnabled:bevel>0,bevelSegments:2,bevelSize:bevel,bevelThickness:bevel,curveSegments:24});return mesh(g,mat,parent,V(0,y+depth,0),[Math.PI/2,0,0]);}
function roundRectShape(w,d,r){const s=new T.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}
function footprint(out=0){const s=new T.Shape(),xl=-2.7-out,xr=2.7+out,zb=-2.25-out,zf=1.8+out,cx=1.25,cz=.35,r=1.45+out;s.moveTo(xl,zb);s.lineTo(xr,zb);s.lineTo(xr,cz);s.absarc(cx,cz,r,0,Math.PI/2,false);s.lineTo(xl,zf);s.lineTo(xl,zb);return s;}
function archShape(w,h,dy=0){const s=new T.Shape(),r=w/2;s.moveTo(-r,dy);s.lineTo(r,dy);s.lineTo(r,dy+h-r);s.absarc(0,dy+h-r,r,0,Math.PI,false);s.lineTo(-r,dy);return s;}
function textTexture(text,{bg='#e9dfcd',ink='#605164',font='30px Georgia',width=512,height=128,sub=''}={}){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,width,height);x.fillStyle=ink;x.textAlign='center';x.textBaseline='middle';x.font=font;x.fillText(text,width/2,sub?height*.41:height*.52);if(sub){x.font='16px Arial';x.fillText(sub,width/2,height*.76);}const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;return tx;}
function sign(text,width,height,parent,pos,ry=0,opts={}){const map=textTexture(text,opts);const mat=new T.MeshStandardMaterial({map,roughness:.96});const g=new T.PlaneGeometry(width,height);return mesh(g,mat,parent,pos,[0,ry,0]);}
function radialTexture(){const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');const g=x.createRadialGradient(64,64,1,64,64,64);g.addColorStop(0,'rgba(55,42,64,.52)');g.addColorStop(.3,'rgba(68,50,74,.35)');g.addColorStop(.7,'rgba(78,67,91,.10)');g.addColorStop(1,'rgba(70,58,89,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
const shadowTexture=radialTexture();
function contactShadow(x,z,w,d,opacity=.35,y=.535){const mat=new T.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,opacity,color:'#8c758e'});const m=mesh(new T.PlaneGeometry(w,d),mat,scene,V(x,y,z),[-Math.PI/2,0,0]);m.castShadow=m.receiveShadow=false;return m;}
const ambient = new T.HemisphereLight('#fff0dc','#b3a4c8',1.55);scene.add(ambient);
const sun = new T.DirectionalLight('#ffe2b7',2.45);sun.position.set(-5,13,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=13;sun.shadow.camera.bottom=-11;sun.shadow.camera.near=.5;sun.shadow.camera.far=42;sun.shadow.normalBias=.045;sun.shadow.bias=-.00016;sun.shadow.radius=3;scene.add(sun);sun.target.position.set(0,2,0);scene.add(sun.target);
const fill = new T.DirectionalLight('#cfbdec',.65);fill.position.set(6,9,-7);scene.add(fill);

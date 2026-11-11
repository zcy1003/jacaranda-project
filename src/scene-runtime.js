// Collapse all static detail into material batches: the filigree remains real geometry.
function mergeStatic(){
 staticRoot.updateMatrixWorld(true);const groups=new Map();
 staticRoot.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;let list=groups.get(o.material);if(!list){list=[];groups.set(o.material,list);}const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);list.push(geo);});
 const result=new T.Group();result.name='Hand-built architectural and botanical detail';
 for(const [material,geos] of groups){const count=geos.reduce((s,g)=>s+g.attributes.position.count,0),position=new Float32Array(count*3),normal=new Float32Array(count*3),uv=new Float32Array(count*2);let offset=0;
  for(const g of geos){const n=g.attributes.position.count;position.set(g.attributes.position.array,offset*3);if(g.attributes.normal)normal.set(g.attributes.normal.array,offset*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,offset*2);offset+=n;g.dispose();}
  const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(position,3));geometry.setAttribute('normal',new T.BufferAttribute(normal,3));geometry.setAttribute('uv',new T.BufferAttribute(uv,2));geometry.computeBoundingSphere();const m=new T.Mesh(geometry,material);m.castShadow=true;m.receiveShadow=true;result.add(m);
 }
 const originals=new Set();staticRoot.traverse(o=>{if(o.geometry)originals.add(o.geometry);});scene.remove(staticRoot);staticRoot.clear();originals.forEach(g=>{if(g!==cubeGeo)g.dispose();});scene.add(result);
}
buildGround();buildHouse();buildBench();buildStreetlamp();buildStreetDetails();
buildTree({x:-5.15,z:-2.23,height:8.55,spread:3.22,seed:117,leanX:-.21,leanZ:-.18,crownBias:.5,arms:7});
buildTree({x:3.72,z:-2.68,height:8.85,spread:3.10,seed:327,leanX:.28,leanZ:-.35,crownBias:-.35,arms:7});
buildTree({x:-4.75,z:1.45,height:4.13,spread:1.79,seed:959,leanX:-.44,leanZ:.17,crownBias:1.8,arms:5,low:true});
buildTree({x:4.85,z:.04,height:4.65,spread:1.41,seed:548,leanX:.49,leanZ:-.18,crownBias:-.9,arms:4,low:true});
finishGarden();mergeStatic();

// Only twenty-eight petals drift through the scene at a time.
const fallingGeo=new T.SphereGeometry(1,5,3),fallingMat=toon('#c8a8dd',{side:T.DoubleSide});
const falling=new T.InstancedMesh(fallingGeo,fallingMat,stats.fallingPetals);falling.instanceMatrix.setUsage(T.DynamicDrawUsage);falling.castShadow=false;falling.receiveShadow=false;falling.frustumCulled=false;scene.add(falling);
const fallingRng=randFactory(8861),fallingState=[];const dummy=new T.Object3D();
function resetPetal(p,initial=false){const source=petalSources[Math.floor(fallingRng()*petalSources.length)]||V(-4,6,0);p.x=source.x+(fallingRng()-.5)*.45;p.y=initial?.8+fallingRng()*7:source.y;p.z=source.z+(fallingRng()-.5)*.5;p.speed=.19+fallingRng()*.22;p.phase=fallingRng()*Math.PI*2;p.scale=.037+fallingRng()*.022;}
for(let i=0;i<stats.fallingPetals;i++){const p={};resetPetal(p,true);fallingState.push(p);falling.setColorAt(i,new T.Color(flowerColors[i%flowerColors.length]));}
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let motion=!reducedMotion,elapsed=0,lastFrame=0,currentTime=.5,targetTime=.5,cameraTween=null,zoomTween=null,needsRender=true;
let activeView='house',toastTimer;
const palettes=[
 {sky:'#fff1e5',ground:'#b6acc2',amb:1.60,sun:'#fff0cf',sunPower:2.65,fill:'#c8c8e9',fillPower:.60,exposure:1.10,pos:V(-7,13,8)},
 {sky:'#e9dced',ground:'#a79cac',amb:1.43,sun:'#ffd4ae',sunPower:2.20,fill:'#b5a1d4',fillPower:.63,exposure:1.11,pos:V(-7,13,8)},
 {sky:'#a29ecc',ground:'#625573',amb:.77,sun:'#aebee8',sunPower:.83,fill:'#9a80c0',fillPower:.39,exposure:1.08,pos:V(-7,13,8)}
];
const tempColorA=new T.Color(),tempColorB=new T.Color();
function blendColor(target,a,b,t){target.copy(tempColorA.set(a)).lerp(tempColorB.set(b),t);}
function updateLight(t){
 const i=t<.5?0:1,u=t<.5?t*2:(t-.5)*2,a=palettes[i],b=palettes[i+1];
 blendColor(ambient.color,a.sky,b.sky,u);blendColor(ambient.groundColor,a.ground,b.ground,u);ambient.intensity=lerp(a.amb,b.amb,u);
 blendColor(sun.color,a.sun,b.sun,u);sun.intensity=lerp(a.sunPower,b.sunPower,u);sun.position.copy(a.pos).lerp(b.pos,u);
 blendColor(fill.color,a.fill,b.fill,u);fill.intensity=lerp(a.fillPower,b.fillPower,u);renderer.toneMappingExposure=lerp(a.exposure,b.exposure,u);
 const n=T.MathUtils.smoothstep(t,.18,.96),warm=n*n;
 for(const entry of lampLights)entry.light.intensity=entry.power*lerp(.002,1,warm);
 for(const sprite of lampGlows)sprite.material.opacity=lerp(.018,.66,warm);
 M.lantern.emissiveIntensity=lerp(.045,2.25,n);M.lantern.color.set('#edd7af');
 windowMats.forEach((mat,j)=>{const strength=mat.userData.lit;mat.emissiveIntensity=lerp(.015,.9*strength,warm);blendColor(mat.color,'#8d9da1',j%3?'#ab8c72':'#6d7282',n);});
 needsRender=true;
}
renderer.shadowMap.autoUpdate=false;
renderer.shadowMap.needsUpdate=true;
updateLight(currentTime);
function resize(){const w=container.clientWidth,h=container.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);const aspect=w/h;const vertical=Math.max(14.9,19.8/aspect);camera.left=-vertical*aspect/2;camera.right=vertical*aspect/2;camera.top=vertical/2;camera.bottom=-vertical/2;camera.updateProjectionMatrix();needsRender=true;}
new ResizeObserver(resize).observe(container);resize();
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2700);}
function setTime(t){targetTime=clamp(t,0,1);document.querySelectorAll('[data-time]').forEach(b=>{const selected=Math.abs(Number(b.dataset.time)-targetTime)<.02;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});const ix=targetTime<.25?0:targetTime<.75?1:2;document.getElementById('light-moment').textContent=['A SOFTER MORNING','LAVENDER HOUR','THE QUIET HOURS'][ix];document.getElementById('scene-clock').textContent=['10:30 AM','5:45 PM','8:15 PM'][ix];document.body.classList.toggle('is-night',targetTime>.75);if(reducedMotion){currentTime=targetTime;updateLight(currentTime);}needsRender=true;}
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>setTime(Number(b.dataset.time))));
function tweenCamera(position,target,zoom){
 cameraTween={from:camera.position.clone(),to:position.clone(),targetFrom:controls.target.clone(),targetTo:target.clone(),zoomFrom:camera.zoom,zoomTo:zoom,start:performance.now(),duration:reducedMotion?0:1450};zoomTween=null;
 if(reducedMotion){camera.position.copy(position);controls.target.copy(target);camera.zoom=zoom;camera.updateProjectionMatrix();controls.update();cameraTween=null;}needsRender=true;
}
const viewpoints={
 house:{position:V(12.1,11.8,18.3),target:V(-.45,3.5,.05),zoom:1.18,caption:'Soft curves. Quiet balconies.',index:'01'},
 bloom:{position:V(14.6,14.7,20.5),target:V(.10,5.17,-.6),zoom:1.28,caption:'A canopy with room to breathe.',index:'02'},
 bench:{position:V(11.5,8.5,20.0),target:V(1.65,2.1,2.08),zoom:1.86,caption:'All afternoon, and nowhere to be.',index:'03'}
};
function selectView(view){const v=viewpoints[view];if(!v)return;activeView=view;tweenCamera(v.position,v.target,v.zoom);document.querySelectorAll('[data-view]').forEach(b=>{const yes=b.dataset.view===view;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});document.getElementById('view-caption').textContent=v.caption;document.querySelector('.caption-index').textContent=v.index;}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>selectView(b.dataset.view)));
function resetView(){activeView='house';tweenCamera(HOME.position,HOME.target,HOME.zoom);document.getElementById('view-caption').textContent='The art of taking a pause.';document.querySelector('.caption-index').textContent='01';document.querySelectorAll('[data-view]').forEach(b=>{const yes=b.dataset.view==='house';b.classList.toggle('active',yes);b.setAttribute('aria-pressed',String(yes));});}
document.getElementById('reset-view').addEventListener('click',resetView);
document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();resetView();setTime(.5);window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'});});
document.getElementById('closer').addEventListener('click',()=>{selectView('house');if(innerWidth<701)container.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});canvas.focus({preventScroll:true});});
function zoomBy(factor){cameraTween=null;zoomTween={from:camera.zoom,to:clamp(camera.zoom*factor,controls.minZoom,controls.maxZoom),start:performance.now()};needsRender=true;}
document.getElementById('zoom-in').addEventListener('click',()=>zoomBy(1.18));document.getElementById('zoom-out').addEventListener('click',()=>zoomBy(1/1.18));
controls.addEventListener('start',()=>{cameraTween=null;zoomTween=null;canvas.focus({preventScroll:true});});controls.addEventListener('change',()=>{needsRender=true;});
function updateMotionUI(){const b=document.getElementById('motion');b.setAttribute('aria-pressed',String(!motion));b.setAttribute('aria-label',motion?'Pause falling petals':'Resume falling petals');b.title=motion?'Pause falling petals':'Resume falling petals';b.querySelector('use').setAttribute('href',motion?'#pause':'#play');}
updateMotionUI();document.getElementById('motion').addEventListener('click',()=>{motion=!motion;updateMotionUI();needsRender=true;});
document.getElementById('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(container.requestFullscreen)await container.requestFullscreen();else toast('Use your browser’s full-screen view to linger a little closer.');}catch{toast('Full screen is unavailable in this viewer. Open the HTML in your browser.');}});
document.addEventListener('fullscreenchange',()=>{const b=document.getElementById('fullscreen');b.setAttribute('aria-label',document.fullscreenElement?'Leave full screen':'Expand the scene');resize();});
canvas.addEventListener('keydown',e=>{
 if(e.key==='r'||e.key==='R'){e.preventDefault();resetView();return;}if(['1','2','3'].includes(e.key)){e.preventDefault();setTime((Number(e.key)-1)/2);return;}
 if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(1.13);return;}if(e.key==='-'||e.key==='_'){e.preventDefault();zoomBy(1/1.13);return;}
 const arrows={ArrowLeft:[-.11,0],ArrowRight:[.11,0],ArrowUp:[0,-.09],ArrowDown:[0,.09]};if(arrows[e.key]){e.preventDefault();cameraTween=null;const s=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.theta+=arrows[e.key][0];s.phi=clamp(s.phi+arrows[e.key][1],controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(s));controls.update();needsRender=true;}
});
document.getElementById('postcard').addEventListener('click',async()=>{
 const b=document.getElementById('postcard');b.disabled=true;
 try{await document.fonts.ready;renderer.render(scene,camera);const c=document.createElement('canvas');c.width=1920;c.height=1440;const ctx=c.getContext('2d');ctx.fillStyle=currentTime>.8?'#eeebf2':'#f7f5ef';ctx.fillRect(0,0,1920,1440);ctx.fillStyle='#8d7899';ctx.textAlign='center';ctx.font='18px "DM Sans", sans-serif';ctx.fillText('S L O W   C O R N E R S    /    T H E   J A C A R A N D A   E D I T',960,100);ctx.font='italic 78px "Cormorant Garamond", Georgia';ctx.fillStyle='#66506f';ctx.fillText('Where the city turns lilac.',960,204);const ratio=canvas.width/canvas.height,w=Math.min(1840,1050*ratio),h=w/ratio;ctx.drawImage(canvas,(1920-w)/2,228+(1040-h)/2,w,h);ctx.strokeStyle='#d5cadb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(110,1290);ctx.lineTo(1810,1290);ctx.stroke();ctx.font='22px "Cormorant Garamond", Georgia';ctx.textAlign='left';ctx.fillText('An imagined Sydney corner. Spring, at its own pace.',112,1346);ctx.textAlign='right';ctx.font='17px "DM Sans", sans-serif';ctx.fillText(document.getElementById('light-moment').textContent+'  /  '+document.getElementById('scene-clock').textContent,1810,1346);const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)throw Error('No image');const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='slow-corners-'+(targetTime<.25?'day':targetTime<.75?'dusk':'night')+'.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('A little piece of lilac, saved as a postcard.');}catch(e){toast('The postcard could not be saved. Please try opening this file in your browser.');console.error(e);}finally{b.disabled=false;needsRender=true;}
});
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-lastFrame)/1000||.016,.05);lastFrame=now;if(document.hidden)return;
 if(Math.abs(currentTime-targetTime)>.0002){currentTime=lerp(currentTime,targetTime,1-Math.exp(-dt*3.05));if(Math.abs(currentTime-targetTime)<.0002)currentTime=targetTime;updateLight(currentTime);}
 if(cameraTween){const t=clamp((now-cameraTween.start)/Math.max(1,cameraTween.duration),0,1),u=t*t*(3-2*t);camera.position.copy(cameraTween.from).lerp(cameraTween.to,u);controls.target.copy(cameraTween.targetFrom).lerp(cameraTween.targetTo,u);camera.zoom=lerp(cameraTween.zoomFrom,cameraTween.zoomTo,u);camera.updateProjectionMatrix();needsRender=true;if(t===1)cameraTween=null;}
 if(zoomTween){const t=clamp((now-zoomTween.start)/(reducedMotion?1:320),0,1);camera.zoom=lerp(zoomTween.from,zoomTween.to,1-Math.pow(1-t,3));camera.updateProjectionMatrix();needsRender=true;if(t===1)zoomTween=null;}
 controls.update();
 if(motion||elapsed===0){elapsed+=dt;fallingState.forEach((p,i)=>{if(motion){p.y-=p.speed*dt;p.x+=Math.sin(elapsed*.7+p.phase)*dt*.065+.018*dt;p.z+=Math.cos(elapsed*.49+p.phase)*dt*.043;if(p.y<.57)resetPetal(p);}dummy.position.set(p.x+Math.sin(elapsed+p.phase)*.09,p.y,p.z);dummy.rotation.set(elapsed*.38+p.phase,elapsed*.23+p.phase,Math.sin(elapsed*.8+p.phase)*.85);dummy.scale.set(p.scale*1.35,p.scale*.28,p.scale*.74);dummy.updateMatrix();falling.setMatrixAt(i,dummy.matrix);});falling.instanceMatrix.needsUpdate=true;needsRender=true;}
 if(needsRender){renderer.render(scene,camera);needsRender=false;}
}
renderer.render(scene,camera);canvas.classList.add('is-ready');loading.classList.add('done');setTimeout(()=>loading.hidden=true,700);requestAnimationFrame(animate);
canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();toast('The little world is resting. Reload the page to bring it back.');});
window.jacaranda={get state(){return {ready:true,time:currentTime,targetTime,motion,view:activeView,zoom:camera.zoom,camera:camera.position.toArray(),target:controls.target.toArray(),...stats,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};},setTime,reset:resetView,focus:selectView};
} catch(error){console.error('Jacaranda scene:',error);loading.hidden=true;errorPanel.hidden=false;window.jacaranda={state:{ready:false,error:String(error)}};}
})();

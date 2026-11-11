function buildGround(){
 horizontalExtrude(roundRectShape(13.3,10.7,1.22),.28,.03,M.base,staticRoot,.10);
 horizontalExtrude(roundRectShape(13.35,10.75,1.23),.045,.34,M.baseLine,staticRoot,.035);
 horizontalExtrude(roundRectShape(13.25,10.65,1.20),.08,.40,M.road,staticRoot,.035);
 const sidewalkShape=new T.Shape();sidewalkShape.moveTo(-6.30,-4.83);sidewalkShape.lineTo(5.06,-4.83);sidewalkShape.quadraticCurveTo(5.43,-4.83,5.43,-4.38);sidewalkShape.lineTo(5.43,1.84);sidewalkShape.bezierCurveTo(5.43,3.57,4.46,3.91,2.96,3.91);sidewalkShape.lineTo(-5.48,3.91);sidewalkShape.quadraticCurveTo(-6.29,3.91,-6.29,3.08);sidewalkShape.lineTo(-6.30,-4.83);
 horizontalExtrude(sidewalkShape,.095,.45,M.path,staticRoot,.025);
 // Curb stones follow the street's rounded corner.
 const curbPoints=[V(-5.73,.53,3.97),V(-2.8,.53,3.97),V(.15,.53,3.97),V(2.9,.53,3.97),V(4.4,.53,3.72),V(5.32,.53,2.97),V(5.49,.53,1.73),V(5.49,.53,-4.5)];
 const curbCurve=new T.CatmullRomCurve3(curbPoints,false,'centripetal');const length=curbCurve.getLength();
 for(let i=0;i<Math.ceil(length/.38);i++){const t=(i+.5)/Math.ceil(length/.38),p=curbCurve.getPointAt(t),tangent=curbCurve.getTangentAt(t);box(.34,.12,.12,i%5===0?M.ledge:M.curb,staticRoot,p,[0,-Math.atan2(tangent.z,tangent.x),0]);}
 // A quiet pavement grid, with irregular tone rather than repeated texture decals.
 const paverMats=['#ddd4c4','#d3cbbd','#d8d0c1','#e0d7c7','#d1c8bd'].map(c=>toon(c));
 for(let row=0;row<12;row++)for(let col=0;col<15;col++){
  const x=-5.86+col*.75+(row%2)*.375,z=-4.38+row*.72;
  if(x>5.08||z>3.7||(x>3.85&&z>3.35)||(x>4.74&&z>2.90))continue;
  box(.726,.014,.695,paverMats[Math.floor(rng()*paverMats.length)],staticRoot,V(x,.559,z));
 }
 // A pair of small street markings and a drain, kept at the perimeter.
 for(const x of [-4.5,-2.50,-.50])box(.72,.008,.047,M.roadLine,staticRoot,V(x,.503,4.54));
 box(.44,.016,.26,M.iron,staticRoot,V(4.24,.517,4.28),[0,.30,0]);
 for(let i=0;i<6;i++)box(.027,.01,.21,M.road,staticRoot,V(4.08+i*.06,.533,4.28),[0,.30,0]);
 const plate=sign('JACARANDA SEASON',2.05,.20,staticRoot,V(-1.2,.19,5.43),0,{width:1024,height:96,font:'35px Georgia',bg:'#b9b0a7',ink:'#716575'});
 contactShadow(0,0,17,14,.24,.012);contactShadow(-.8,-.1,8.4,7.8,.30,.571);
 // Small garden beds anchor the trees without enclosing their branches.
 for(const [x,z,rx,rz] of [[-4.75,1.45,.72,.82],[-5.15,-2.23,.78,.69],[3.72,-2.68,.77,.78],[4.85,.04,.53,.57]]){
  const bed=new T.Shape();bed.absellipse(0,0,rx,rz,0,Math.PI*2,false,0);const m=horizontalExtrude(bed,.026,.569,M.soil);m.position.x=x;m.position.z=z;
  const count=14;for(let i=0;i<count;i++){const a=i/count*Math.PI*2;const stone=box(.24,.06,.11,i%2?M.ledge:M.curb,staticRoot,V(x+rx*Math.cos(a),.588,z+rz*Math.sin(a)),[0,-a,0]);}
 }
}
const branchMaterials=[M.bark,M.barkLight,M.barkDark];
function addFlower(p,s,color,q){flowerData.push({p,s,color,q});}
function buildTree({x,z,height,spread,seed,leanX=0,leanZ=0,crownBias=0,arms=6,low=false}){
 const random=randFactory(seed),pick=(a,b)=>a+(b-a)*random();
 const g=new T.Group();g.position.set(x,.585,z);staticRoot.add(g);treeGroups.push(g);stats.trees++;
 const root=V(0,0,0),neck=V(leanX*.24,height*.25,leanZ*.32),fork=V(leanX*.78,height*.49,leanZ*.82);
 taperedTube([root,V(-.12,height*.12,.04),neck,V(leanX*.49,height*.36,leanZ*.65),fork],height*.037,.085,M.bark,g,23,9);
 for(let i=0;i<5;i++){const a=i*Math.PI*.4+random()*.7;const end=V(Math.cos(a)*.50,.012,Math.sin(a)*.48);taperedTube([V(.01,.15,0),V(end.x*.5,.07,end.z*.5),end],.065,.012,M.bark,g,8,7);}
 // Narrow highlights follow the twist of the wood rather than outlining it.
 taperedTube([V(-.056,.1,.09),V(neck.x-.043,neck.y,.10+neck.z),V(fork.x-.027,fork.y-.18,fork.z+.048)],.015,.006,M.barkLight,g,15,5);
 for(let arm=0;arm<arms;arm++){
  const angle=arm/arms*Math.PI*2+crownBias+pick(-.31,.31),reach=spread*pick(.79,1.15)*(low?1:.94+.10*Math.cos(angle)*Math.sign(x)),top=height*(low?pick(.79,1.0):pick(.91,1.0)-.10*(reach/spread-.8));
  const start=fork.clone().multiplyScalar(pick(.65,1.01));
  const elbow=V(leanX+Math.cos(angle)*reach*.37,top*.78,leanZ+Math.sin(angle)*reach*.38);
  const tip=V(leanX+Math.cos(angle)*reach,top,leanZ+Math.sin(angle)*reach*.77);
  const mainCurve=[start,start.clone().lerp(elbow,.55).add(V(pick(-.14,.14),.08,pick(-.08,.08))),elbow,tip];
  taperedTube(mainCurve,.09+height*.004,.020,arm%3===0?M.barkLight:M.bark,g,18,8);
  const limbCurve=new T.CatmullRomCurve3(mainCurve);
  const sprays=low?5:8;
  for(let j=0;j<sprays;j++){
   const u=(low?.36:.52)+j/sprays*(low?.62:.46),base=limbCurve.getPoint(u),side=j%2?1:-1,subAngle=angle+side*pick(.36,.97);
   const subLength=spread*pick(.23,.45)*(1-u*.27),subTip=base.clone().add(V(Math.cos(subAngle)*subLength,pick(.14,.73),Math.sin(subAngle)*subLength*.9));
   const mid=base.clone().lerp(subTip,.51).add(V(0,pick(.10,.27),0));
   taperedTube([base,mid,subTip],.028*(1-u*.32),.0055,j%3===0?M.barkLight:M.bark,g,12,6);
   const twigCurve=new T.CatmullRomCurve3([base,mid,subTip]);
   // Separated flower panicles follow the fine, rising lateral twigs.
   for(let k=0;k<5;k++){
    const v=.30+k*.135,stemBase=twigCurve.getPoint(v),swing=(k%2?1:-1)*pick(.28,.78),stemAngle=subAngle+swing;
    const stemEnd=stemBase.clone().add(V(Math.cos(stemAngle)*pick(.15,.36),pick(.09,.30),Math.sin(stemAngle)*pick(.15,.36)));
    taperedTube([stemBase,stemBase.clone().lerp(stemEnd,.58).add(V(0,.065,0)),stemEnd],.0075,.0025,M.barkLight,g,7,4);
    addPanicle(stemBase,stemEnd,g,random,height);
   }
   // A few loose terminal panicles keep the canopy silhouette lace-like.
   addPanicle(subTip,subTip.clone().add(V(Math.cos(subAngle)*.19,.10,Math.sin(subAngle)*.20)),g,random,height);
   if(random()>.32)addFern(subTip.clone().add(V(0,-.13,0)),subAngle,g,random,.48);
  }
 }
 // A low diverging branch gives every tree a recognizable, asymmetric gesture.
 const lowAngle=crownBias+1.5,lowStart=V(leanX*.29,height*.26,leanZ*.32),lowEnd=V(leanX+Math.cos(lowAngle)*spread*.72,height*.62,leanZ+Math.sin(lowAngle)*spread*.7);
 taperedTube([lowStart,lowStart.clone().lerp(lowEnd,.55).add(V(.1,.22,0)),lowEnd],.064,.012,M.bark,g,17,7);
 for(let i=0;i<6;i++){const pos=lowStart.clone().lerp(lowEnd,.52+i*.075);const end=pos.clone().add(V(pick(-.22,.32),pick(.05,.25),pick(-.23,.26)));addPanicle(pos,end,g,random,height);}
 contactShadow(x,z,spread*2.1,spread*1.5,.20,.583);
}
const flowerColors=['#bba0de','#b49bd9','#a98bd0','#c9b0e6','#9475b9','#bea1d8','#ac8fce','#c8acd9'];
function addPanicle(start,end,tree,random,height){
 const palette=new T.Color(flowerColors[Math.floor(random()*flowerColors.length)]);
 const long=end.clone().sub(start).normalize(),axis=V(0,1,0),side=V().crossVectors(long,axis).normalize();if(side.length()<.1)side.set(1,0,0);const across=V().crossVectors(long,side).normalize();
 panicleShadows.push({p:start.clone().lerp(end,.55).add(tree.position),s:V(.27,.17,.25)});
 const num=29+Math.floor(random()*18);
 for(let i=0;i<num;i++){
  const t=random(),ang=i*2.39996+random()*.6,rad=(.060+Math.sin(t*Math.PI)*.32)*Math.sqrt(random());
  const p=start.clone().lerp(end,t).addScaledVector(side,Math.cos(ang)*rad).addScaledVector(across,Math.sin(ang)*rad*.76);
  p.add(V((random()-.5)*.05,(random()-.5)*.10,(random()-.5)*.06));
  const world=p.clone().add(tree.position),s=.049+random()*.033;
  const color=palette.clone().offsetHSL((random()-.5)*.024,(random()-.5)*.05,(random()-.5)*.10);
  const dir=V(Math.cos(ang)*.42,-.75-random()*.4,Math.sin(ang)*.42).normalize();
  const q=new T.Quaternion().setFromUnitVectors(V(0,-1,0),dir);q.multiply(new T.Quaternion().setFromAxisAngle(V(0,1,0),random()*Math.PI*2));
  addFlower(world,V(s*(.85+random()*.35),s*(1.12+random()*.30),s),color,q);
 }
 if(random()<.065)petalSources.push(end.clone().add(tree.position));
}
function addFern(start,angle,tree,random,sz=.45){
 const end=start.clone().add(V(Math.cos(angle)*sz,-sz*.14,Math.sin(angle)*sz));
 taperedTube([start,start.clone().lerp(end,.6).add(V(0,.025,0)),end],.0035,.001,M.deepGreen,tree,6,4);
 for(let j=1;j<7;j++)for(const side of [-1,1]){const p=start.clone().lerp(end,j/7).add(tree.position);const leafAngle=angle+side*(.55+j*.04),scale=(1-j*.09)*sz;leafData.push({p,s:V(scale*.20,.008,scale*.075),angle:leafAngle,color:new T.Color(random()>.5?'#a1a687':'#859171')});}
}
function trumpetGeometry(){
 const pos=[],uv=[],ix=[],ring=7,radii=[.18,.37,1.0],ys=[.78,.03,-.83];
 for(let k=0;k<3;k++)for(let j=0;j<ring;j++){const a=j/ring*Math.PI*2;pos.push(Math.cos(a)*radii[k],ys[k]+(k===2?Math.cos(a*5)*.13:0),Math.sin(a)*radii[k]);uv.push(j/ring,k/2);}
 for(let k=0;k<2;k++)for(let j=0;j<ring;j++){const a=k*ring+j,b=k*ring+(j+1)%ring,c=a+ring,d=b+ring;ix.push(a,c,b,b,c,d);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ix);g.computeVertexNormals();return g;
}
function finishGarden(){
 const blossomMesh=new T.InstancedMesh(trumpetGeometry(),M.flower,flowerData.length);const tmp=new T.Object3D();
 flowerData.forEach((f,i)=>{tmp.position.copy(f.p);tmp.quaternion.copy(f.q);tmp.scale.copy(f.s);tmp.updateMatrix();blossomMesh.setMatrixAt(i,tmp.matrix);blossomMesh.setColorAt(i,f.color);});
 blossomMesh.castShadow=false;blossomMesh.receiveShadow=true;blossomMesh.instanceMatrix.needsUpdate=true;blossomMesh.instanceColor.needsUpdate=true;scene.add(blossomMesh);stats.flowers=flowerData.length;
 // Low-detail shadow geometry keeps the flower-shaped gaps, without rendering
 // every tiny trumpet seven more times into the lantern's shadow maps.
 const shadowMaterial=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});
 const shadowFlowers=new T.InstancedMesh(new T.IcosahedronGeometry(1,0),shadowMaterial,panicleShadows.length);
 panicleShadows.forEach((f,i)=>{tmp.position.copy(f.p);tmp.quaternion.identity();tmp.scale.copy(f.s);tmp.updateMatrix();shadowFlowers.setMatrixAt(i,tmp.matrix);});
 shadowFlowers.castShadow=true;shadowFlowers.receiveShadow=false;shadowFlowers.customDepthMaterial=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking});shadowFlowers.customDistanceMaterial=new T.MeshDistanceMaterial();scene.add(shadowFlowers);
 const leafGeo=new T.SphereGeometry(1,5,3);const leaves=new T.InstancedMesh(leafGeo,M.leaf,leafData.length);
 leafData.forEach((f,i)=>{tmp.position.copy(f.p);tmp.rotation.set(0,f.angle,.07);tmp.scale.copy(f.s);tmp.updateMatrix();leaves.setMatrixAt(i,tmp.matrix);leaves.setColorAt(i,f.color);});leaves.castShadow=leaves.receiveShadow=true;scene.add(leaves);stats.leaves=leafData.length;
 // Fallen petals collect near the tree wells and the curve of the curb.
 const groundPetals=[],random=randFactory(6501);
 for(let i=0;i<880;i++){
  let x,z;const which=random();if(which<.42){x=-4.7+(random()-.5)*3.5;z=1.7+(random()-.5)*3.6;}else if(which<.72){x=3.8+(random()-.5)*2.4;z=.6+(random()-.5)*5.5;}else{x=(random()-.5)*11.7;z=2.8+random()*1.9;}
  if(x>6.2||x<-6.2||z>4.96||z<-4.7)continue;
  if(x>-.9&&x<.28&&z>1.25&&z<2.12)continue;
  const y=(z>3.97||x>5.43||(x>4.65&&z>3.4))?.515:.587;
  groundPetals.push({x,y,z,r:random()*Math.PI*2,s:.026+random()*.025});
 }
 const petalMat=toon('#c0a0d4',{side:T.DoubleSide});const petals=new T.InstancedMesh(new T.SphereGeometry(1,5,3),petalMat,groundPetals.length);
 groundPetals.forEach((p,i)=>{tmp.position.set(p.x,p.y,p.z);tmp.rotation.set((random()-.5)*.15,p.r,(random()-.5)*.1);tmp.scale.set(p.s*1.25,.008,p.s*.72);tmp.updateMatrix();petals.setMatrixAt(i,tmp.matrix);petals.setColorAt(i,new T.Color(flowerColors[i%flowerColors.length]));});petals.receiveShadow=true;scene.add(petals);
}
function buildStreetDetails(){
 // A menu board and low herbs balance the large flower canopy.
 const g=new T.Group();g.position.set(-1.80,.59,2.26);g.rotation.y=-.22;staticRoot.add(g);
 for(const x of [-.18,.18]){rod(V(x,0,.16),V(x,.72,-.015),.025,M.wood,g);rod(V(x,0,-.23),V(x,.72,-.015),.025,M.wood,g);}
 box(.44,.59,.056,M.wood,g,V(0,.42,.065),[-.12,0,0]);sign('a little pause',.367,.39,g,V(0,.43,.119),0,{width:256,height:256,font:'24px Georgia',bg:'#6c7470',ink:'#f4ead4',sub:'COFFEE & GOOD COMPANY'});
 for(const [x,z,s] of [[-5.50,2.60,.13],[-5.65,2.27,.10],[-3.98,2.14,.10],[4.33,-1.53,.12],[3.03,-3.03,.13],[-4.68,-2.35,.14]]){
  const r=randFactory(Math.abs(x*190+z*100)|0);for(let i=0;i<8;i++){const a=r()*Math.PI*2;curveTube([V(x,.59,z),V(x+Math.cos(a)*s,.82+r()*.1,z+Math.sin(a)*s),V(x+Math.cos(a)*s*1.5,.93+r()*.12,z+Math.sin(a)*s*1.5)],.009,M.deepGreen,staticRoot,7,4);}
 }
 // Quiet utility details make the reverse of the diorama worth exploring.
 const bicycle=new T.Group();bicycle.position.set(-3.49,.59,-.54);bicycle.rotation.y=Math.PI/2+.1;staticRoot.add(bicycle);
 for(const x of [-.42,.42]){mesh(new T.TorusGeometry(.27,.020,6,28),M.iron,bicycle,V(x,.31,0));for(let i=0;i<12;i++){const a=i/12*Math.PI*2;rod(V(x,.31,0),V(x+Math.cos(a)*.25,.31+Math.sin(a)*.25,0),.005,M.ironLight,bicycle,.004,4);}}
 for(const [a,b] of [[[-.42,.31,0],[-.14,.70,0]],[[-.14,.70,0],[.06,.30,0]],[[.06,.30,0],[-.42,.31,0]],[[-.14,.70,0],[.34,.70,0]],[[.34,.70,0],[.06,.30,0]],[[.34,.70,0],[.42,.31,0]],[[.34,.70,0],[.30,.87,0]]])rod(V(...a),V(...b),.018,M.bench,bicycle);
 box(.19,.035,.10,M.iron,bicycle,V(-.14,.76,0));rod(V(.30,.87,-.13),V(.30,.87,.13),.013,M.iron,bicycle);
}

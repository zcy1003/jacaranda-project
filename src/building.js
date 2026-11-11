// The house is continuous through its rounded corner; the two balconies follow it.
const house=new T.Group();house.position.set(-.55,0,-.55);staticRoot.add(house);
function buildWindow(x,y,z,ry=0,w=.84,h=1.7,lit=1,shutters=false){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;house.add(g);
 const insetShape=archShape(w+.13,h+.08);mesh(new T.ShapeGeometry(insetShape),M.inset,g,V(0,-.025,.012));
 const glass=M.glass.clone();glass.color.set(lit>.5?'#889798':'#7c929a');glass.emissiveIntensity=.10;glass.userData={lit};windowMats.push(glass);
 mesh(new T.ShapeGeometry(archShape(w,h)),glass,g,V(0,0,.039));
 const outer=archShape(w+.21,h+.13,-.035);outer.holes.push(archShape(w,h,.015));
 mesh(new T.ExtrudeGeometry(outer,{depth:.085,bevelEnabled:true,bevelSegments:1,bevelSize:.016,bevelThickness:.016,curveSegments:20}),M.trim,g,V(0,0,.053));
 const r=w/2, top=h-r;
 box(.038,h-.06,.045,M.wood,g,V(0,h/2,.158));box(w,.043,.049,M.wood,g,V(0,top,.161));
 box(w,.029,.035,M.wood,g,V(0,h*.43,.161));
 for(const side of [-1,1]){box(.023,h*.68,.025,M.trim,g,V(side*w*.30,h*.39,.082));box(.042,h*.77,.019,M.paper,g,V(side*w*.37,h*.4,.071));}
 for(const a of [Math.PI/4,Math.PI/2,Math.PI*.75])rod(V(0,top,.151),V(Math.cos(a)*r,top+Math.sin(a)*r,.151),.013,M.wood,g,.011,5);
 box(w+.34,.07,.22,M.ledge,g,V(0,-.065,.11));
 const key=box(.16,.21,.13,M.trim,g,V(0,h+.07,.11));key.rotation.z=.025;
 if(shutters){for(const side of [-1,1]){const shutter=new T.Group();g.add(shutter);shutter.position.set(side*(w*.5+.18),h*.4,.11);shutter.rotation.y=side*.15;box(.25,h*.79,.044,M.wood,shutter);for(let j=0;j<12;j++)box(.2,.024,.046,M.woodDark,shutter,V(0,-h*.35+j*h*.062,.019),[.22,0,0]);}}
 if(y<1.2){box(.3,.09,.08,M.wood,g,V(-w*.23,.4,.18));box(.3,.09,.08,M.wood,g,V(w*.23,.4,.18));for(const s of [-1,1])sphere(.027,M.brass,g,V(s*.052,h*.46,.199));}
 return g;
}
function buildHouse(){
 horizontalExtrude(footprint(.10),.17,.53,M.ledge,house);
 horizontalExtrude(footprint(0),6.62,.70,M.cream,house,.012);
 horizontalExtrude(footprint(.035),.10,.79,M.trim,house);
 // Shallow rustication is confined to the ground floor.
 for(let y=.99;y<2.64;y+=.30){box(5.18,.014,.012,M.inset,house,V(-.12,y,1.812));box(.012,.014,2.60,M.inset,house,V(2.712,y,-.96));const points=[];for(let k=0;k<=24;k++){const a=k/24*Math.PI/2;points.push(V(1.25+1.459*Math.cos(a),y,.35+1.459*Math.sin(a)));}lineTube(points,.008,M.inset,house,4);}
 // Continuous belt courses and shadow lines.
 for(const y of [2.83,4.97]){horizontalExtrude(footprint(.06),.09,y-.07,M.ledge,house);horizontalExtrude(footprint(.53),.105,y,M.ledge,house,.02);horizontalExtrude(footprint(.55),.05,y+.105,M.trim,house,.02);}
 horizontalExtrude(footprint(.08),.10,7.14,M.ledge,house);
 horizontalExtrude(footprint(.20),.12,7.24,M.trim,house,.045);
 horizontalExtrude(footprint(.27),.10,7.37,M.trim,house,.032);
 horizontalExtrude(footprint(.20),.055,7.49,M.inset,house,.016);
 horizontalExtrude(footprint(.13),.08,7.54,M.trim,house,.02);
 horizontalExtrude(footprint(-.13),.05,7.58,M.roof,house,.012);
 const parapetShape=footprint(.095);const inner=footprint(-.075);parapetShape.holes.push(new T.Path(inner.getPoints(32)));
 horizontalExtrude(parapetShape,.23,7.60,M.cream,house,.02);
 const capShape=footprint(.135);capShape.holes.push(new T.Path(footprint(-.105).getPoints(32)));
 horizontalExtrude(capShape,.055,7.85,M.trim,house,.02);
 // Recessed roof details, visible when orbiting above the building.
 box(.59,.7,.64,M.cream,house,V(-1.78,7.92,-1.44));box(.73,.10,.77,M.trim,house,V(-1.78,8.28,-1.44));cylinder(.12,.14,.27,M.ledge,house,V(-1.95,8.45,-1.43),10);cylinder(.12,.14,.24,M.ledge,house,V(-1.62,8.42,-1.43),10);
 box(1.25,.16,.78,M.woodDark,house,V(.17,7.74,-.88));box(1.13,.035,.68,M.glass,house,V(.17,7.84,-.88),[.10,0,0]);
 for(const x of [-2.61,-.89]){box(.105,6.15,.075,M.trim,house,V(x,4.1,1.84));for(const y of [2.76,4.90,7.05])box(.18,.14,.13,M.ledge,house,V(x,y,1.90));}
 for(const z of [-2.16,-.72])box(.075,6.13,.105,M.trim,house,V(2.73,4.1,z));
 // Front elevation: shop window and a readable entrance, then tall balcony doors.
 buildWindow(-1.82,.87,1.817,0,.94,1.57,.55,false);
 const frontDoor=buildWindow(-.35,.80,1.817,0,.96,1.89,.95,false);
 sign('OPEN',.25,.13,frontDoor,V(0,1.05,.18),0,{font:'36px Georgia',width:256,height:128,bg:'#e8deca',ink:'#75607d'});
 buildWindow(.77,.9,1.82,0,.67,1.59,.75,false);
 buildWindow(2.72,.88,-1.47,Math.PI/2,.86,1.63,.5,true);
 buildWindow(2.72,.88,-.20,Math.PI/2,.71,1.63,.9,false);
 const a=Math.PI/4;
 buildWindow(1.25+1.46*Math.cos(a),.87,.35+1.46*Math.sin(a),Math.PI/4,.68,1.72,.75,false);
 for(const [floor,y] of [[1,3.08],[2,5.22]]){
  buildWindow(-1.80,y,1.815,0,.83,1.69,floor===1?.82:.46,true);
  buildWindow(-.30,y,1.815,0,.83,1.69,.84,false);
  buildWindow(1.02,y,1.815,0,.68,1.69,.47,false);
  buildWindow(1.25+1.463*Math.cos(a),y,.35+1.463*Math.sin(a),Math.PI/4,.69,1.69,1,false);
  buildWindow(2.715,y,-.45,Math.PI/2,.77,1.69,.63,false);
  buildWindow(2.715,y,-1.70,Math.PI/2,.77,1.69,floor===1?.85:.34,true);
 }
 // Rear and left windows make all 360 degrees a finished miniature.
 for(const y of [1.08,3.15,5.27]){
  for(const x of [-1.55,.30,1.75])buildWindow(x,y,-2.263,Math.PI,.63,1.4,.35,false);
  for(const z of [-1.23,.43])buildWindow(-2.713,y,z,-Math.PI/2,.67,1.44,.45,false);
 }
 // Two slim steps leave a generous space between the entrance and bench.
 box(1.44,.105,.65,M.ledge,house,V(-.35,.59,2.06));box(1.22,.09,.42,M.trim,house,V(-.35,.69,1.99));
 for(const y of [2.98,5.12])buildRailing(y);
 buildAwning();
 sign('THE CORNER HOUSE',2.18,.18,house,V(-.72,2.635,1.887),0,{width:1024,height:96,font:'38px Georgia',ink:'#776174',bg:'#eee3cf'});
 sign('LILAC LANE',.63,.23,house,V(2.785,2.4,-1.3),Math.PI/2,{font:'29px Georgia',width:384,height:128,bg:'#687174',ink:'#f7edd9'});
 for(const [x,z] of [[-2.42,2.11],[1.2,2.11]])buildPot(house,V(x,.70,z),.19,.35,128+x*17);
 wallLantern(house,V(.44,2.08,1.95),0);
 wallLantern(house,V(2.84,2.21,-.78),Math.PI/2);
 wallLantern(house,V(-2.40,2.10,1.95),0);
}
function balconyPath(){const points=[];points.push(V(-2.72,0,2.29),V(1.25,0,2.29));for(let i=1;i<=36;i++){const a=Math.PI/2-i/36*Math.PI/2;points.push(V(1.25+1.94*Math.cos(a),0,.35+1.94*Math.sin(a)));}points.push(V(3.19,0,-2.28));return points;}
function buildRailing(y){
 const points=balconyPath();const curve=new T.CurvePath();for(let i=1;i<points.length;i++)curve.add(new T.LineCurve3(points[i-1],points[i]));
 for(const h of [.15,.74,.81])lineTube(points.map(p=>p.clone().setY(y+h)),h===.81?.024:.014,M.iron,house,6);
 const total=curve.getLength(),n=Math.round(total/.31);
 for(let i=0;i<=n;i++){
  const t=i/n,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();rod(V(p.x,y+.14,p.z),V(p.x,y+.80,p.z),i%5===0?.018:.012,M.iron,house,.012,6);
  if(i%5===0){sphere(.03,M.ironLight,house,V(p.x,y+.84,p.z));box(.066,.037,.066,M.ironLight,house,V(p.x,y+.16,p.z));}
  if(i<n){const mid=curve.getPoint((i+.5)/n),side=tan.clone();for(const s of [-1,1]){const pts=[];for(let j=0;j<=14;j++){const angle=j/14*Math.PI*1.85;const rr=.094*(1-j/20);const dx=s*(.037+Math.sin(angle)*rr),yy=y+.46+Math.cos(angle)*rr*1.6;pts.push(V(mid.x+side.x*dx,yy,mid.z+side.z*dx));}curveTube(pts,.009,M.iron,house,16,5);}}
 }
 // Short returns into the walls at the balcony ends.
 for(const [a,b] of [[V(-2.72,y+.81,2.29),V(-2.72,y+.81,1.84)],[V(3.19,y+.81,-2.28),V(2.72,y+.81,-2.28)]])rod(a,b,.019,M.iron,house);
 for(const x of [-1.85,-.25]){const pts=[V(x,y-.07,2.22),V(x,y-.30,2.01),V(x,y-.43,1.86)];curveTube(pts,.04,M.trim,house,12,8);}
}
function buildAwning(){
 const group=new T.Group();group.position.set(-1.82,2.45,1.88);house.add(group);
 const count=11,width=1.27;
 for(let i=0;i<count;i++){const mat=i%2?M.paper:M.bench;const stripe=box(width/count,.028,.67,mat,group,V(-width/2+(i+.5)*width/count,-.11,.31),[.25,0,0]);const flap=box(width/count,.13,.031,mat,group,V(-width/2+(i+.5)*width/count,-.235,.642));const scallop=mesh(new T.CylinderGeometry(width/count*.51,width/count*.51,.031,12,1,false,0,Math.PI),mat,group,V(-width/2+(i+.5)*width/count,-.298,.642),[Math.PI/2,0,0]);}
 for(const x of [-.63,.63])rod(V(x,-.05,.02),V(x,-.24,.66),.016,M.iron,group);
}
function buildPot(parent,pos,r=.20,h=.34,seed=14){
 const g=new T.Group();g.position.copy(pos);parent.add(g);cylinder(r,r*.76,h,M.pot,g,V(0,h*.5,0),12);cylinder(r*1.06,r*1.02,.056,M.ledge,g,V(0,h,0),12);cylinder(r*.89,r*.89,.02,M.soil,g,V(0,h+.022,0),12);
 const random=randFactory(seed*172|0);for(let i=0;i<15;i++){const a=random()*Math.PI*2,l=.19+random()*.28;const points=[V(0,h,0),V(Math.cos(a)*r*.45,h+l*.58,Math.sin(a)*r*.4),V(Math.cos(a)*r*.95,h+l,Math.sin(a)*r*.9)];curveTube(points,.007,M.deepGreen,g,5,4);const leaf=mesh(new T.SphereGeometry(.04,5,3),M.leaf,g,points[2],null,V(.7,2.5,.45));leaf.rotation.z=-Math.cos(a)*.6;}
 return g;
}
function glowTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');const g=ctx.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,225,167,.7)');g.addColorStop(.14,'rgba(255,208,130,.34)');g.addColorStop(.45,'rgba(255,189,112,.08)');g.addColorStop(1,'rgba(255,190,120,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new T.CanvasTexture(c);}
const haloMap=glowTexture();
function addGlow(pos,size){const mat=new T.SpriteMaterial({map:haloMap,color:'#ffe0ac',transparent:true,depthWrite:false,opacity:.20,blending:T.AdditiveBlending,toneMapped:false});const sprite=new T.Sprite(mat);sprite.position.copy(pos);sprite.scale.set(size,size,1);scene.add(sprite);lampGlows.push(sprite);}
function lanternGeometry(parent,pos,scale=1){
 const g=new T.Group();g.position.copy(pos);g.scale.setScalar(scale);parent.add(g);
 box(.26,.055,.26,M.iron,g,V(0,-.20,0));box(.23,.32,.23,M.lantern,g,V(0,-.015,0));
 for(const x of [-.125,.125])for(const z of [-.125,.125])rod(V(x,-.20,z),V(x*.8,.17,z*.8),.014,M.iron,g,.014,6);
 box(.30,.055,.30,M.iron,g,V(0,.174,0));const top=mesh(new T.ConeGeometry(.25,.16,4),M.iron,g,V(0,.275,0),[0,Math.PI/4,0]);sphere(.04,M.brass,g,V(0,.387,0));
 sphere(.071,M.bulb,g,V(0,-.015,0));return g;
}
function wallLantern(parent,pos,rotation=0){
 const g=new T.Group();g.position.copy(pos);g.rotation.y=rotation;parent.add(g);box(.08,.24,.06,M.iron,g,V(0,-.03,0));curveTube([V(0,0,0),V(0,.10,.15),V(0,.05,.25)],.022,M.iron,g,12,6);lanternGeometry(g,V(0,-.11,.28),.66);
 parent.updateMatrixWorld(true);const world=g.localToWorld(V(0,-.11,.37));const light=new T.PointLight('#ffc77f',1,2.7,2);light.position.copy(world);scene.add(light);lampLights.push({light,power:4.7});addGlow(world,.85);
}
function buildBench(){
 const g=new T.Group();g.position.set(1.73,.53,3.06);g.rotation.y=-.08;staticRoot.add(g);
 for(const x of [-.86,.86]){
  for(const z of [-.25,.26]){const pts=[V(x,.04,z+.065),V(x,.24,z),V(x,.53,z-.01)];curveTube(pts,.042,M.iron,g,12,8);sphere(.054,M.iron,g,V(x,.04,z+.065));}
  curveTube([V(x,.51,-.30),V(x,.76,-.38),V(x,1.04,-.46)],.032,M.iron,g,14,7);
  curveTube([V(x,.68,.32),V(x,.81,.26),V(x,.83,-.12),V(x,.77,-.34)],.034,M.iron,g,18,7);
  rod(V(x,.54,.28),V(x,.73,.29),.025,M.iron,g);
  const points=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI*1.8;points.push(V(x,.38+Math.sin(a)*.13,.01+Math.cos(a)*.15));}curveTube(points,.018,M.iron,g,20,6);
 }
 for(let i=0;i<5;i++)box(2.06,.065,.093,i%2?M.bench:M.benchEdge,g,V(0,.57,-.24+i*.109),[0,0,0]);
 for(let i=0;i<3;i++)box(2.09,.122,.055,i===1?M.benchEdge:M.bench,g,V(0,.74+i*.152,-.36-i*.041),[-.22,0,0]);
 for(const x of [-.86,.86])for(let i=0;i<3;i++)sphere(.013,M.brass,g,V(x,.74+i*.152,-.323-i*.041));
 box(.36,.04,.25,M.bench,g,V(.50,.632,-.02),[0,.18,0]);box(.35,.04,.245,M.paper,g,V(.48,.667,-.01),[0,.13,0]);box(.34,.018,.245,M.woodDark,g,V(.48,.695,-.01),[0,.13,0]);
 cylinder(.055,.043,.13,M.paper,g,V(-.57,.681,.08),16);cylinder(.061,.061,.023,M.cream,g,V(-.57,.756,.08),16);
 contactShadow(1.73,3.06,2.85,1.45,.40);
}
function buildStreetlamp(){
 const p=V(3.64,.53,2.45),g=new T.Group();g.position.copy(p);staticRoot.add(g);
 cylinder(.18,.23,.10,M.iron,g,V(0,.05,0));cylinder(.095,.155,.36,M.iron,g,V(0,.26,0));cylinder(.044,.078,3.23,M.iron,g,V(0,1.98,0),12);
 for(const y of [.48,3.32]){cylinder(.072,.078,.08,M.ironLight,g,V(0,y,0),12);}
 curveTube([V(0,3.49,0),V(.05,3.71,0),V(.39,3.78,0),V(.67,3.62,0),V(.70,3.48,0)],.045,M.iron,g,24,8);
 curveTube([V(0,3.34,0),V(.25,3.45,0),V(.37,3.59,0),V(.30,3.65,0),V(.18,3.57,0)],.019,M.iron,g,18,6);
 lanternGeometry(g,V(.70,3.28,0),1.15);
 const world=p.clone().add(V(.70,3.27,0));const light=new T.PointLight('#ffc57f',5,9,2);light.position.copy(world);light.castShadow=true;light.shadow.mapSize.set(512,512);light.shadow.bias=-.001;light.shadow.normalBias=.025;light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;scene.add(light);lampLights.push({light,power:28});addGlow(world,2.2);
 // A second downward beam lets light break naturally across branches and paving.
 const down=new T.SpotLight('#ffc984',2,12,.90,.85,1.7);down.position.copy(world);down.target.position.set(3.64,.52,1.65);scene.add(down,down.target);lampLights.push({light:down,power:23});
 contactShadow(p.x,p.z,.75,.85,.42);
}

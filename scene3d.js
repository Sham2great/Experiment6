import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const host=document.getElementById('three-stage');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x081827);
scene.fog=new THREE.FogExp2(0x9bb9c5,0.004);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,500);
camera.position.set(0,24,42);
const mobileDevice=matchMedia('(max-width: 700px)').matches;
const lowEndDevice=(navigator.deviceMemory>0&&navigator.deviceMemory<=4)||(navigator.hardwareConcurrency>0&&navigator.hardwareConcurrency<=4)||!!navigator.connection?.saveData;
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,lowEndDevice?.75:mobileDevice?.95:1.2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=false;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8e8ff,0x31414a,2.1));
const moon=new THREE.DirectionalLight(0xe0efff,1.7);moon.position.set(-22,35,18);scene.add(moon);
const warm=new THREE.PointLight(0xffbd71,28,24);warm.position.set(0,8,0);scene.add(warm);
const mat=(color,roughness=.82,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const windowGlow=new THREE.MeshStandardMaterial({color:0xffcf80,emissive:0xffa94f,emissiveIntensity:1.4,roughness:.3});
const snowMat=mat(0xeaf4f5),iceMat=mat(0xa8d1db),wood=mat(0x76503e),roof=mat(0x263c4a),darkWood=mat(0x3d302e),pine=mat(0x174b43),pine2=mat(0x236052),gold=mat(0xf4d38b,.38,.35),red=mat(0x9e4547),cream=mat(0xf2e6cf);
// A softly rolling, multi-toned alpine ground instead of a featureless white platform.
const terrainGeo=new THREE.PlaneGeometry(180,180,100,100);
terrainGeo.rotateX(-Math.PI/2);
const terrainPos=terrainGeo.attributes.position,terrainColors=[];
for(let i=0;i<terrainPos.count;i++){
 const x=terrainPos.getX(i),z=terrainPos.getZ(i);
 const broad=Math.sin(x*.075+z*.035)*.055+Math.cos(z*.09-x*.04)*.045;
 const detail=Math.sin(x*.31)*Math.cos(z*.27)*.018;
 terrainPos.setY(i,broad+detail-.12);
 const patch=(Math.sin(x*.17+Math.cos(z*.11)*2)+Math.cos(z*.19-x*.08))*.5;
 const edge=Math.max(0,Math.min(1,(Math.hypot(x,z)-18)/58));
 const snow= new THREE.Color(0xd9e8e5);
 const shadow= new THREE.Color(0x8faeaa);
 const pineTint=new THREE.Color(0x567e72);
 const c=snow.clone().lerp(shadow,Math.max(0,patch-.18)*.28+edge*.12).lerp(pineTint,Math.max(0,-patch-.38)*.16+edge*.08);
 terrainColors.push(c.r,c.g,c.b);
}
terrainGeo.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));
terrainGeo.computeVertexNormals();
const ground=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
ground.receiveShadow=true;scene.add(ground);

function box(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);parent.add(o);return o}
function sphere(parent,x,y,z,r,material){const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),material);o.position.set(x,y,z);parent.add(o);return o}
function cone(parent,x,y,z,r,h,material){const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,9),material);o.position.set(x,y,z);parent.add(o);return o}
function cylinder(parent,x,y,z,r1,r2,h,material){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);o.position.set(x,y,z);parent.add(o);return o}
// Distant blue-white mountain silhouettes give the village a real landscape.
const ridgeRock=mat(0x526d78),ridgeShadow=mat(0x718d94),ridgeSnow=mat(0xdce9e4);
for(let i=0;i<14;i++){
 const a=i/14*Math.PI*2,r=54+(i%3)*4,x=Math.cos(a)*r,z=Math.sin(a)*r;
 const h=9+(i%4)*2.6,rad=7+(i%3)*2;
 const peak=cone(scene,x,h*.48,z,rad,h,i%2?ridgeRock:ridgeShadow);
 peak.rotation.y=i*.37;
 const cap=cone(scene,x,h*.83,z,rad*.43,h*.34,ridgeSnow);
 cap.rotation.y=i*.37;
}
// A small frozen pond tucked into the eastern edge of the village.
const pond=new THREE.Group();pond.position.set(28,-.045,-8);scene.add(pond);
const pondShape=new THREE.Mesh(new THREE.CircleGeometry(1,48),mat(0x78aeb7,.22,.18));
pondShape.rotation.x=-Math.PI/2;pondShape.scale.set(6.1,3.8,1);pond.add(pondShape);
const pondRim=new THREE.Mesh(new THREE.TorusGeometry(1,.13,7,48),ridgeSnow);
pondRim.rotation.x=Math.PI/2;pondRim.scale.set(6.1,3.8,1);pondRim.position.y=.035;pond.add(pondRim);
for(let i=0;i<5;i++){
 const glint=new THREE.Mesh(new THREE.BoxGeometry(.7,.018,.055),new THREE.MeshBasicMaterial({color:0xdaf5f1}));
 glint.position.set(-2.6+i*1.15,.035,Math.sin(i*1.8)*1.3);glint.rotation.y=-.3;pond.add(glint);
}
// Scattered angular stones break up the open snow between buildings and trees.
const stoneMat=mat(0x849b9a),stoneLight=mat(0xb5c9c3);
for(let i=0;i<34;i++){
 const a=i*2.399,r=13+(i%7)*3.4,x=Math.cos(a)*r,z=Math.sin(a)*r;
 if(Math.hypot(x,z+13)<9)continue;
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.35+(i%3)*.12,0),i%3?stoneMat:stoneLight);
 rock.position.set(x,.12,z);rock.rotation.set(i*.31,i*.7,i*.23);rock.scale.y=.55;scene.add(rock);
}
function makeTree(x,z,size=1,decorated=false){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,.48*size,0,.17*size,.22*size,.95*size,wood);for(let i=0;i<3;i++){const h=(1.55-i*.18)*size;cone(g,0,(.9+i*.47)*size,0,(.86-i*.13)*size,h,i===0?pine:pine2)}if(decorated){sphere(g,0,2.42*size,0,.13*size,gold);for(let i=0;i<13;i++){const a=i*2.4,y=.55+(i%9)*.55;let r=0;for(let k=0;k<3;k++){const h=(1.55-k*.18)*size,cy=(.9+k*.47)*size,base=cy-h/2;if(y>=base&&y<=cy+h/2)r=Math.max(r,(.86-k*.13)*size*(1-(y-base)/h))}sphere(g,Math.cos(a)*(r+.07),y,Math.sin(a)*(r+.07),.055*size,[gold,red,cream][i%3])}}return g}
const solidObstacles=[];
function house(x,z,scale=1,kind='cabin'){solidObstacles.push({x,z,hx:2.9*scale,hz:2.55*scale});const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);box(g,0,1.45,0,5,2.9,4.2,kind==='shop'?red:wood);const r=new THREE.Mesh(new THREE.ConeGeometry(3.55,2.25,4),roof);r.position.set(0,3.95,0);r.rotation.y=Math.PI/4;r.scale.set(1,.75,.82);r.castShadow=true;g.add(r);box(g,0,3.02,0,5.6,.18,4.8,snowMat);box(g,0,.82,2.12,.95,1.65,.12,darkWood);for(const side of [-1,1]){box(g,side*1.45,1.85,2.16,.78,.85,.1,windowGlow);box(g,side*1.45,1.85,2.23,.1,.9,.04,cream);box(g,side*1.45,1.85,2.23,.82,.08,.04,cream)}cylinder(g,1.55,4.35,-.5,.38,.42,1.15,wood);const smoke=new THREE.Group();smoke.position.set(1.55,4.95,-.5);g.add(smoke);for(let i=0;i<4;i++){const puff=sphere(smoke,Math.sin(i)*.18,i*.4,0,.22,mat(0xd8e5e7,.95));puff.userData.smoke=true}const wreath=sphere(g,0,2.3,2.23,.32,pine);sphere(g,0,2.3,2.5,.07,red);return g}
house(-12,-5,1.12,'cabin');house(12,-10,.95,'shop');house(20,6,.65,'cabin');house(-22,2,.72,'shop');house(18,-23,.8,'cabin');house(-19,-24,.7,'cabin');
makeTree(-24,-16,1.4);makeTree(-20,8,1.05);makeTree(23,-19,1.4);makeTree(26,13,1.1);makeTree(-5,-24,1.2);makeTree(6,-27,1.1);
const grandTree=makeTree(0,-13,2.25,true);

const treeDecorations=[];
function clearTreeDecorations(){
 treeDecorations.forEach(o=>{grandTree.remove(o);o.traverse?.(n=>{if(n.geometry)n.geometry.dispose();if(n.material&&!Array.isArray(n.material)&&n.userData.ownedMaterial)n.material.dispose()})});
 treeDecorations.length=0;
}
function treeSurfaceRadius(y){
 const size=2.25;let outer=0;
 for(let i=0;i<3;i++){const h=(1.55-i*.18)*size,cy=(.9+i*.47)*size,base=cy-h/2,top=cy+h/2,r=(.86-i*.13)*size;if(y>=base&&y<=top)outer=Math.max(outer,r*(1-(y-base)/h))}
 return outer;
}
function buildTreeDecoration(type,color,index){
 const material=new THREE.MeshStandardMaterial({color,metalness:.18,roughness:.3,emissive:new THREE.Color(color),emissiveIntensity:.2});
 const y=.78+(index%9)*.52,angle=index*2.399,radius=treeSurfaceRadius(y)+.105;
 if(type==='ornament'){
  const g=new THREE.Group();g.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),material);ball.userData.ownedMaterial=true;g.add(ball);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.065,8),gold);cap.position.y=.135;g.add(cap);
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='lights'){
  const g=new THREE.Group();
  for(let i=0;i<96;i++){const q=i/95,ly=.52+q*4.78,a=q*Math.PI*11+index*.5,r=treeSurfaceRadius(ly)+.12;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.045,7,6),material);bulb.position.set(Math.cos(a)*r,ly,Math.sin(a)*r);bulb.userData.ownedMaterial=true;g.add(bulb)}
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='ribbon'){
  const points=[];for(let i=0;i<=120;i++){const q=i/120,ly=.5+q*4.8,a=q*Math.PI*9+index*.25,r=treeSurfaceRadius(ly)+.09;points.push(new THREE.Vector3(Math.cos(a)*r,ly,Math.sin(a)*r))}
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),120,.055,6,false),material);mesh.userData.ownedMaterial=true;treeDecorations.push(mesh);grandTree.add(mesh);
 }else if(type==='star'){
  const g=new THREE.Group();g.position.set(0,5.48,0);const star=new THREE.Mesh(new THREE.OctahedronGeometry(.29,1),material);star.scale.set(1,1.3,.38);star.userData.ownedMaterial=true;g.add(star);treeDecorations.push(g);grandTree.add(g);
 }else if(type==='candy'){
  const g=new THREE.Group();g.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);const cane=new THREE.Mesh(new THREE.TorusGeometry(.105,.035,7,14,Math.PI*1.5),cream);cane.rotation.z=Math.PI/2;g.add(cane);
  for(let j=0;j<3;j++){const stripe=new THREE.Mesh(new THREE.SphereGeometry(.034,7,6),material);stripe.position.set((j-1)*.067,.045,0);stripe.userData.ownedMaterial=true;g.add(stripe)}
  treeDecorations.push(g);grandTree.add(g);
 }else material.dispose();
}
function restoreTree(){clearTreeDecorations();let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}saved.forEach((d,i)=>buildTreeDecoration(d.type,d.color,i))}
window.decorateTree=(type,color)=>{let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}if(type==='star')saved=saved.filter(d=>d.type!=='star');saved.push({type,color});localStorage.setItem('twains-tree-decorations',JSON.stringify(saved));restoreTree();return saved.length};
window.undoTreeDecoration=()=>{let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}saved.pop();localStorage.setItem('twains-tree-decorations',JSON.stringify(saved));restoreTree();return saved.length};
window.resetTreeDecorations=()=>{localStorage.removeItem('twains-tree-decorations');restoreTree()};
restoreTree();
window.openTreeStudio=()=>{releaseControls();document.getElementById('treeStudio').classList.add('open');document.getElementById('treeStudio').setAttribute('aria-hidden','false');cameraMode='treeStudio';yaw=0;pitch=.15;camera.position.set(0,4.6,-4.2);camera.lookAt(0,3,-13);};
window.closeTreeStudio=()=>{releaseControls();document.getElementById('treeStudio').classList.remove('open');document.getElementById('treeStudio').setAttribute('aria-hidden','true');cameraMode='follow';};

for(let i=0;i<10;i++){const a=i*2.399,r=18+(i%5)*2.2;makeTree(Math.cos(a)*r,Math.sin(a)*r,.55+(i%4)*.12,i%7===0)}
// A broad winding packed-snow road with soft darker edges.
const pathPts=[];for(let i=0;i<=50;i++){const t=i/50;pathPts.push(new THREE.Vector3(-2+Math.sin(t*Math.PI*1.45)*8,.035,18-t*37))}
const roadCurve=new THREE.CatmullRomCurve3(pathPts);
function roadStrip(width,y,material){
 const verts=[],indices=[];
 for(let i=0;i<=100;i++){
  const t=i/100,p=roadCurve.getPointAt(t),tan=roadCurve.getTangentAt(t);
  const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
  verts.push(p.x-side.x*width/2,y,p.z-side.z*width/2,p.x+side.x*width/2,y,p.z+side.z*width/2);
  if(i<100){const n=i*2;indices.push(n,n+1,n+2,n+1,n+3,n+2)}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mesh=new THREE.Mesh(geo,material);scene.add(mesh);return mesh;
}
roadStrip(4.7,.015,mat(0x879f9b));
roadStrip(3.9,.035,mat(0xc1d3ce));

function lamp(x,z){cylinder(scene,x,1.7,z,.09,.12,3.4,darkWood);box(scene,x,3.5,z,.58,.6,.58,darkWood);if(Math.abs(x)<10){const l=new THREE.PointLight(0xffc87e,4,6);l.position.set(x,3.45,z);scene.add(l)}sphere(scene,x,3.5,z,.19,gold)}
for(const [x,z] of [[-8,7],[8,5],[-7,-18],[8,-21],[-17,1],[17,0],[-17,-20],[17,-21]])lamp(x,z);

/* A fuller village square: market huts, festive arches, bunting and layered lights */
function marketStall(x,z,accent){
 const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 box(g,0,1.05,0,3.6,1.9,2.2,wood);box(g,0,2.12,0,4.1,.22,2.7,darkWood);
 for(let i=0;i<5;i++){const stripe=box(g,-1.62+i*.81,2.52,.02,.82,.72,2.78,i%2?cream:mat(accent));stripe.rotation.z=(i-2)*.025}
 box(g,0,1.55,1.15,3.2,.12,.12,gold);
 for(const side of [-1,1])cylinder(g,side*1.45,1.25,1.05,.07,.07,2.5,darkWood);
 for(let i=0;i<5;i++){const gift=new THREE.Group();gift.position.set(-1.1+i*.55,2.2,.75);box(gift,0,.16,0,.32,.32,.32,i%2?red:cream);box(gift,0,.33,0,.07,.04,.34,gold);g.add(gift)}
 const glow=new THREE.PointLight(0xffbd72,3.5,5);glow.position.set(0,2,1.5);g.add(glow);solidObstacles.push({x,z,hx:2.2,hz:1.55});
 return g;
}
marketStall(-8,-1,0x9b4147);marketStall(8,-2,0x285b52);marketStall(-16,-16,0x315d75);
function festiveArch(z){
 const g=new THREE.Group();g.position.z=z;scene.add(g);
 for(const x of [-11,11]){cylinder(g,x,3,0,.2,.24,6,darkWood);sphere(g,x,6,0,.32,gold)}
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-11,5.9,0),new THREE.Vector3(-7,8.1,0),new THREE.Vector3(0,8.8,0),new THREE.Vector3(7,8.1,0),new THREE.Vector3(11,5.9,0)]);
 g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,60,.16,8,false),pine));
 for(let i=0;i<25;i++){const p=curve.getPoint(i/24);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.14,8,7),new THREE.MeshStandardMaterial({color:i%3===0?0xffe2a0:i%3===1?0x8de2c2:0xff8791,emissive:i%3===0?0xffc76b:i%3===1?0x48c89c:0xd84d65,emissiveIntensity:1.7}));bulb.position.copy(p);bulb.position.y-=.18;g.add(bulb)}
 return g;
}
festiveArch(10);festiveArch(-1);
function stringLights(a,b,c,d,y){
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(a,y,c),new THREE.Vector3((a+b)/2,y-2,(c+d)/2),new THREE.Vector3(b,y,d)]);
 scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,45,.045,6,false),gold));
 for(let i=0;i<=8;i++){const p=curve.getPoint(i/8);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.105,8,7),new THREE.MeshStandardMaterial({color:i%2?0xffd88b:0x8be2c2,emissive:i%2?0xffb94f:0x4ac99a,emissiveIntensity:1.7}));bulb.position.copy(p);scene.add(bulb)}
}
stringLights(-13,13,5,5,9);stringLights(-13,13,-17,-17,10);stringLights(-20,20,-8,-8,12);
for(let i=0;i<8;i++){
 const a=i*2.399,r=26+(i%3)*2.2,x=Math.cos(a)*r,z=Math.sin(a)*r;
 makeTree(x,z,.8+(i%3)*.16,i%3===0);
}
// Small, separated evergreen clusters frame the square without forming a snowbank.
for(const [x,z,r] of [[-7,-9,.55],[7,-8,.62],[-6,-18,.48],[6,-19,.5],[-11,-14,.55],[11,-15,.55]]){
 const shrub=sphere(scene,x,.28,z,r,pine2);shrub.scale.set(1,.7,1);
 if(Math.abs(x)>8)sphere(scene,x,.62,z,.11,red);
}


// A welcoming village entrance and warm festive details
const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const sx=signCanvas.getContext('2d');sx.fillStyle='#233d43';sx.fillRect(0,0,1024,256);sx.strokeStyle='#e7c88d';sx.lineWidth=12;sx.strokeRect(15,15,994,226);sx.textAlign='center';sx.fillStyle='#f6e4b8';sx.font='bold 82px Georgia';sx.fillText("TWAIN'S CHRISTMAS VILLAGE",512,155);
const signTex=new THREE.CanvasTexture(signCanvas);const sign=box(scene,0,3.4,23,12,3.2,.45,wood);const signFace=new THREE.Mesh(new THREE.PlaneGeometry(11.5,2.65),new THREE.MeshBasicMaterial({map:signTex}));signFace.position.set(0,3.4,23.24);scene.add(signFace);cylinder(scene,-5.2,1.8,23,.16,.2,3.6,darkWood);cylinder(scene,5.2,1.8,23,.16,.2,3.6,darkWood);
for(let i=0;i<9;i++){const x=-4.5+i*1.125,y=5.1-Math.sin(i/8*Math.PI)*.9;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.13,8,7),new THREE.MeshStandardMaterial({color:i%2?0xffd27b:0x8be1c0,emissive:i%2?0xffb94f:0x4ac99a,emissiveIntensity:1.5}));bulb.position.set(x,y,23.1);scene.add(bulb)}
// Removed oversized snow mounds around the central tree; the ground remains clean and walkable.

// Six collectible presents hidden around the village
const hiddenGifts=[];
function placeCollectibleGift(x,z,color){
 const g=new THREE.Group();g.position.set(x,.48,z);g.userData.baseY=.48;
 const wrap=mat(color,.48,.08);box(g,0,0,0,.62,.62,.62,wrap);box(g,0,.32,0,.11,.07,.66,gold);box(g,0,.32,0,.66,.07,.11,gold);
 const bow=sphere(g,0,.42,0,.12,cream);bow.scale.set(1,.55,.7);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,5,16),gold);halo.rotation.x=Math.PI/2;halo.position.y=-.28;g.add(halo);
 scene.add(g);hiddenGifts.push(g);
}
// Six presents are guaranteed: random placement first, deterministic safe positions if needed.
const giftColors=[0x9e4547,0x236052,0x315c71,0x78608c,0xb8793f,0x8c536d],giftSpots=[];
function hitsHouseForGift(x,z){return solidObstacles.some(o=>Math.abs(x-o.x)<o.hx+1.5&&Math.abs(z-o.z)<o.hz+1.5)}
function giftSpotIsSafe(x,z,minGap=7.1){
 return x>=-29&&x<=29&&z>=-30&&z<=24&&!hitsHouseForGift(x,z)&&
 Math.hypot(x,z-12)>=7&&Math.hypot(x,z+13)>=5.8&&Math.hypot(x-28,z+8)>=7.2&&
 giftSpots.every(p=>Math.hypot(x-p.x,z-p.z)>=minGap);
}
for(let attempt=0;giftSpots.length<6&&attempt<6000;attempt++){
 const x=-27+Math.random()*54,z=-29+Math.random()*52;
 if(giftSpotIsSafe(x,z))giftSpots.push({x,z});
}
const fallbackSpots=[[-27,13],[27,12],[-27,-12],[27,-25],[-4,24],[7,-29],[-25,23],[25,22],[-28,-29],[28,-2],[0,26]];
for(const [x,z] of fallbackSpots){if(giftSpots.length===6)break;if(giftSpotIsSafe(x,z,5.8))giftSpots.push({x,z});}
giftSpots.forEach((p,i)=>placeCollectibleGift(p.x,p.z,giftColors[i]));
if(giftSpots.length!==6)console.warn('Gift placement fallback could not place all six:',giftSpots.length);
let giftsFound=0;
// A second collectible trail unlocks after the wishing-tree finale.
const hiddenSnowflakes=[];
const snowflakeSpots=[[-27,15],[27,15],[-27,-9],[27,-27],[-7,23],[8,24],[-14,-18],[15,-19]];
snowflakeSpots.forEach(([x,z],i)=>{
 const g=new THREE.Group();g.position.set(x,.82,z);g.userData.baseY=.82;g.visible=false;
 const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.34,0),new THREE.MeshStandardMaterial({color:0xc9f5ff,emissive:0x6bc9e8,emissiveIntensity:1.05,metalness:.28,roughness:.2}));
 crystal.scale.set(.72,1.25,.42);g.add(crystal);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.52,.025,5,20),gold);ring.rotation.x=Math.PI/2;g.add(ring);
 scene.add(g);hiddenSnowflakes.push(g);
});
function beginTreeFinale(){if(treeFinale.active||treeFinale.done)return;releaseControls();treeFinale.active=true;treeFinale.started=performance.now();document.body.classList.add('finale-active');cameraMode='treeFinale';keys={};drag=false;document.getElementById('treeStudio')?.classList.remove('open');document.getElementById('treeStudio')?.setAttribute('aria-hidden','true');const ui=document.getElementById('treeFinaleOverlay');if(ui){ui.classList.add('show');ui.querySelector('.finale-kicker').textContent='THE LAST PRESENT';ui.querySelector('.finale-title').textContent='One last little wonder…';ui.querySelector('.finale-copy').textContent='The village is waiting for its brightest star.'}}
const treeFinale={active:false,done:false,started:0,star:null,light:null,glow:null,particles:[],lastCaption:-1};
const finaleOverlay=document.createElement('div');finaleOverlay.id='treeFinaleOverlay';finaleOverlay.innerHTML='<div class="finale-vignette"></div><div class="finale-caption"><div class="finale-kicker">A CHRISTMAS PROMISE</div><h2 class="finale-title">One last little wonder…</h2><p class="finale-copy">The village is waiting for its brightest star.</p><div class="finale-rule"><i></i> ✦ <i></i></div></div><div class="finale-bottom">TWAIN’S CHRISTMAS · A MOMENT TO REMEMBER</div>';document.body.appendChild(finaleOverlay);
function makeFinaleStar(){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2===0?.58:.26,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y)}shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.045,bevelThickness:.035});const material=new THREE.MeshStandardMaterial({color:0xffdf8a,emissive:0xffb52e,emissiveIntensity:1.2,metalness:.35,roughness:.22});const star=new THREE.Mesh(geo,material);star.rotation.y=Math.PI;star.scale.setScalar(.85);scene.add(star);return star}
function finaleCaption(kicker,title,copy){const ui=document.getElementById('treeFinaleOverlay');if(!ui)return;ui.classList.remove('caption-in');void ui.offsetWidth;ui.querySelector('.finale-kicker').textContent=kicker;ui.querySelector('.finale-title').textContent=title;ui.querySelector('.finale-copy').textContent=copy;ui.classList.add('caption-in')}
const finaleLadders=[];
const finaleParticleGeometry=new THREE.SphereGeometry(.035,5,5);
const maxFinaleParticles=lowEndDevice?18:45;
function makeFinaleLadder(){const g=new THREE.Group(),timber=mat(0x704a32),rungMat=mat(0xc49a67);for(const x of [-.38,.38])box(g,x,3.05,0,.13,6.1,.15,timber);for(let i=0;i<11;i++)box(g,0,.38+i*.52,.025,.78,.105,.12,rungMat);scene.add(g);return g}
function makeGiftSack(){
 const sack=new THREE.Group(),cloth=mat(0x9b303d,.9),cord=mat(0xe7c77e,.4,.25),giftA=mat(0x315c71),giftB=mat(0xe4c78a);
 const body=sphere(sack,0,.48,0,.55,cloth);body.scale.set(.82,1.12,.72);
 cylinder(sack,0,1.02,0,.27,.34,.28,cloth);
 const tie=new THREE.Mesh(new THREE.TorusGeometry(.28,.045,7,20),cord);tie.rotation.x=Math.PI/2;tie.position.y=1.12;sack.add(tie);
 sphere(sack,0,1.15,0,.09,cord);
 box(sack,-.18,1.25,.02,.28,.3,.28,giftA);box(sack,.16,1.28,-.02,.28,.34,.28,giftB);
 box(sack,-.18,1.41,.02,.055,.34,.31,cord);box(sack,.16,1.45,-.02,.055,.38,.31,mat(0x9b303d));
 scene.add(sack);return sack;
}
function updateTreeFinale(now,dt){
 if(!treeFinale.active)return;
 const e=(now-treeFinale.started)/1000,treeZ=-13,baseZ=-10.45,smooth=v=>v*v*(3-2*v),clamp=THREE.MathUtils.clamp;
 const chars=[player,friends[0].obj],xs=[-1.05,1.05],starts=[-3.5,3.5];
 const villagers=[player,...friends.map(f=>f.obj)],partySpots=[[-5.8,-9.1],[-3.9,-7.8],[-1.95,-7.1],[0,-6.8],[1.95,-7.1]];
 if(!finaleLadders.length){finaleLadders.push(makeFinaleLadder(),makeFinaleLadder());finaleLadders.forEach(ladder=>{ladder.visible=false;});}
 if(!treeFinale.sack)treeFinale.sack=makeGiftSack();
 const walk=smooth(clamp(e/4.1,0,1));
 chars.forEach((ch,i)=>{ch.position.set(THREE.MathUtils.lerp(starts[i],xs[i],walk),0,THREE.MathUtils.lerp(-8.4,baseZ+.25,walk));ch.rotation.y=Math.PI;const gait=e*7.5+i*Math.PI;ch.userData.legs.forEach((leg,j)=>leg.rotation.x=e<4.1?Math.sin(gait+j*Math.PI)*.55:0);ch.userData.arms.forEach(arm=>arm.rotation.x=0)});
 const handoff=clamp((e-3.4)/1.9,0,1),handoffEase=smooth(handoff);
 const sackStart=new THREE.Vector3(player.position.x+.65,1.25,player.position.z-.1);
 const sackEnd=new THREE.Vector3(friends[0].obj.position.x-.58,1.2,friends[0].obj.position.z-.1);
 treeFinale.sack.visible=e<5.45;
 if(treeFinale.sack.visible){treeFinale.sack.position.lerpVectors(sackStart,sackEnd,handoffEase);treeFinale.sack.rotation.z=Math.sin(e*5)*.07;}
 player.userData.arms[0].rotation.x=e>3.4&&e<5.3?-1.55:0;
 friends[0].obj.userData.arms[1].rotation.x=e>4.1&&e<5.5?-1.6:0;
 const joy=e>5.45&&e<7.65,joyPulse=joy?Math.max(0,Math.sin((e-5.45)*Math.PI*2.1)):0;
 friends[0].obj.position.y=joyPulse*.82;
 friends[0].obj.userData.legs.forEach((leg,j)=>leg.rotation.x=joy?Math.sin(e*13+j*Math.PI)*.55:0);
 friends[0].obj.userData.arms.forEach((arm,j)=>{arm.rotation.x=joy?-2.2:0;arm.rotation.z=joy?(j===0?-.3:.3):0});
 if(e>=7.65)friends[0].obj.position.y=0;
 const plant=smooth(clamp((e-7.8)/1.8,0,1));
 finaleLadders.forEach((ladder,i)=>{ladder.visible=e>=7.8;ladder.position.set(THREE.MathUtils.lerp(starts[i],xs[i],walk),1.75*(1-plant),THREE.MathUtils.lerp(-8.65,baseZ,walk));ladder.rotation.set(-.22*plant,0,(Math.PI/2)*(1-plant));if(e>=7.8&&e<9.6)chars[i].userData.arms.forEach(arm=>arm.rotation.x=-1.1+plant*.7)});
 const climb=smooth(clamp((e-9.8)/7.2,0,1));
 chars.forEach((ch,i)=>{if(e<9.8)ch.position.set(xs[i],0,baseZ+.25);else if(e<17.1)ch.position.set(xs[i],.12+climb*4.75,baseZ-.12-climb*.75);else{const down=smooth(clamp((e-17.1)/4.1,0,1));ch.position.set(xs[i],4.87*(1-down),THREE.MathUtils.lerp(baseZ-.87,baseZ+.35,down))}const stepping=e>9.8&&e<17.1,gait=e*7.2+i*Math.PI;ch.userData.legs.forEach((leg,j)=>leg.rotation.x=stepping?Math.sin(gait+j*Math.PI)*.34:0);ch.userData.arms.forEach(arm=>arm.rotation.x=stepping?-.95:(e>14.6&&e<17.3?-1.75:0));ch.userData.body.position.y=stepping?Math.abs(Math.sin(gait*2))*.025:0});
 if(e>15.8&&!treeFinale.star){treeFinale.star=makeFinaleStar();treeFinale.star.position.set(-1.05,5.45,baseZ-.9)}
 if(treeFinale.star){const q=smooth(clamp((e-16)/2.1,0,1));treeFinale.star.position.lerpVectors(new THREE.Vector3(-1.05,5.45,baseZ-.9),new THREE.Vector3(0,5.72,treeZ-.04),q);treeFinale.star.rotation.z=(1-q)*Math.sin(e*2)*.07;if(q>=1&&!treeFinale.light){treeFinale.star.rotation.z=0;treeFinale.light=new THREE.PointLight(0xffd47a,0,22);treeFinale.light.position.set(0,5.8,treeZ);scene.add(treeFinale.light);treeFinale.glow=new THREE.Mesh(new THREE.SphereGeometry(.36,10,8),new THREE.MeshBasicMaterial({color:0xffe5a6,transparent:true,opacity:0,depthWrite:false}));treeFinale.glow.position.set(0,5.72,treeZ);scene.add(treeFinale.glow)}}
 if(treeFinale.light){const power=clamp((e-18.1)/1.5,0,1);treeFinale.light.intensity=power*48;treeFinale.glow.material.opacity=power*.16}
 if(e>18.3&&e<20.5&&Math.floor(e*(lowEndDevice?4:7))!==Math.floor((e-dt)*(lowEndDevice?4:7))){for(let i=0;i<(lowEndDevice?2:3)&&treeFinale.particles.length<maxFinaleParticles;i++){const p=new THREE.Mesh(finaleParticleGeometry,new THREE.MeshBasicMaterial({color:i%2?0xffe4a0:0xd8f5f0}));const angle=Math.random()*Math.PI*2,r=.8+Math.random()*1.8;p.position.set(Math.cos(angle)*r,3.8+Math.random()*2.2,treeZ+Math.sin(angle)*r);p.userData.velocity=new THREE.Vector3(-p.position.x*.2,.65+Math.random()*.45,(treeZ-p.position.z)*.2);scene.add(p);treeFinale.particles.push(p)}}
 treeFinale.particles.forEach(p=>{p.position.addScaledVector(p.userData.velocity,dt);p.material.opacity=Math.max(0,p.material.opacity-.35*dt);p.scale.multiplyScalar(.99)});treeFinale.particles=treeFinale.particles.filter(p=>{if(p.material.opacity<=.01){scene.remove(p);p.material.dispose();return false}return true});
 const celebrating=e>=22.5;
 if(celebrating){const gather=smooth(clamp((e-22.5)/2.1,0,1));villagers.forEach((ch,i)=>{const [px,pz]=partySpots[i],dance=e-24.6,phase=i*Math.PI*.65;ch.position.x=THREE.MathUtils.lerp(ch.position.x,px,gather);ch.position.z=THREE.MathUtils.lerp(ch.position.z,pz,gather);const bounce=dance>0?Math.max(0,Math.sin(dance*7.2+phase))*.42:0;ch.position.y=bounce+Math.abs(Math.sin(dance*3.6+phase))*.035;ch.rotation.y=Math.atan2(-ch.position.x,treeZ-ch.position.z);ch.userData.legs.forEach((leg,j)=>leg.rotation.x=dance>0?Math.sin(dance*7.2+phase+j*Math.PI)*.72:0);ch.userData.arms.forEach((arm,j)=>{arm.rotation.x=dance>0?-.9-Math.max(0,Math.sin(dance*7.2+phase))*1.05:0;arm.rotation.z=(j===0?-1:1)*(dance>0?.35+Math.abs(Math.sin(dance*7.2+phase))*.3:0)});ch.userData.body.position.y=bounce*.18});const catTarget=friends[0].obj.position.clone().add(new THREE.Vector3(-.8,0,.5));antoCat.position.lerp(catTarget,Math.min(1,dt*2.8));antoCat.position.y=Math.max(0,Math.sin((e-24.6)*7.2+1)*.18);antoCat.userData.tail.rotation.z=Math.sin(e*5)*.55;antoKittens.forEach((kitten,i)=>{if(kitten.visible){kitten.position.set(friends[0].obj.position.x-1.05+i*.68,.04+Math.abs(Math.sin(e*5+i*1.7))*.12,friends[0].obj.position.z+.65);kitten.rotation.y=Math.sin(e*2+i)*.15}})}
 const camP=e<7.8?new THREE.Vector3(0,7.4,treeZ+14):e<17?new THREE.Vector3(6,7,treeZ+10):celebrating?new THREE.Vector3(0,10.5,treeZ+19):new THREE.Vector3(0,9,treeZ+15);camera.position.lerp(camP,1-Math.pow(.001,dt));camera.lookAt(0,2.8,treeZ);
 if(e<1.8&&treeFinale.lastCaption!==0){finaleCaption('A CHRISTMAS PROMISE','One last little wonder…','The village is waiting for its brightest star.');treeFinale.lastCaption=0}
 if(e>3.4&&treeFinale.lastCaption!==1){finaleCaption('A GIFT FOR ANTO','Look what we found…','Twain has brought every last present home.');treeFinale.lastCaption=1}
 if(e>5.45&&treeFinale.lastCaption!==2){finaleCaption('SHE’S SO HAPPY!','Look at her go!','All of Anto’s Christmas presents are finally back.');treeFinale.lastCaption=2}
 if(e>7.8&&treeFinale.lastCaption!==3){finaleCaption('SIDE BY SIDE','Let’s set these up…','A little teamwork makes a little magic.');treeFinale.lastCaption=3}
 if(e>9.8&&treeFinale.lastCaption!==4){finaleCaption('ONE RUNG AT A TIME','Up we go…','Carefully, together, reaching for the top.');treeFinale.lastCaption=4}
 if(e>15.8&&treeFinale.lastCaption!==5){finaleCaption('THE FINAL TOUCH','For the top of our tree.','A little light for this little world.');treeFinale.lastCaption=5}
 if(e>18.3&&e<20.5&&treeFinale.lastCaption!==6){finaleCaption('THE WISHING TREE','Look how it shines.','And just like that, Christmas feels a little more magical.');treeFinale.lastCaption=6}
 if(e>=22.5&&treeFinale.lastCaption!==7){finaleCaption('TOGETHER AT LAST','MERRY CHRISTMAS!','The whole village has come together to celebrate.');treeFinale.lastCaption=7}
 if(e>22.5&&e<29.5&&Math.floor(e*6)!==Math.floor((e-dt)*6)&&treeFinale.particles.length<70){for(let i=0;i<4&&treeFinale.particles.length<70;i++){const colors=[0xffd778,0xf4f0df,0xd66b72,0x8ed6c0],p=new THREE.Mesh(new THREE.SphereGeometry(.055,5,5),new THREE.MeshBasicMaterial({color:colors[(i+Math.floor(e*6))%colors.length]}));p.position.set((Math.random()-.5)*9,2.2+Math.random()*3,treeZ+2+(Math.random()-.5)*5);p.userData.velocity=new THREE.Vector3((Math.random()-.5)*1.5,1+Math.random()*1.8,(Math.random()-.5)*.8);scene.add(p);treeFinale.particles.push(p)}}
 if(e>31){treeFinale.active=false;treeFinale.done=true;document.body.classList.remove('finale-active');document.body.classList.add('festival-unlocked');hiddenSnowflakes.forEach(g=>g.visible=true);window.dispatchEvent(new CustomEvent('winter-festival-unlocked'));cameraMode='follow';chars[0].position.set(-1.4,0,-7.8);chars[1].position.set(1.4,0,-7.8);friends.slice(1).forEach(f=>f.obj.position.copy(f.center));chars.forEach(ch=>{ch.rotation.y=0;ch.userData.body.position.y=0;ch.userData.arms.forEach(a=>a.rotation.set(0,0,0));ch.userData.legs.forEach(l=>l.rotation.set(0,0,0))});if(treeFinale.sack){scene.remove(treeFinale.sack);treeFinale.sack=null;}finaleLadders.forEach(l=>{scene.remove(l);l.traverse(o=>o.geometry?.dispose())});finaleLadders.length=0;const ui=document.getElementById('treeFinaleOverlay');ui?.classList.remove('show','caption-in');document.getElementById('sceneHint').textContent='VILLAGE FESTIVAL UNLOCKED ✦ FIND 8 MAGICAL SNOWFLAKES • EXPLORE • PLAY'}
}
let snowflakesFound=0;
const santaVisit={active:false,done:false,start:0,group:null,santa:null,reindeer:[],bells:[],lastCaption:-1,sack:null,sham:null};
function buildSantaVisit(){
 const sleigh=new THREE.Group(),sleighRed=mat(0x9d303b),trim=mat(0xf0d18b,.35,.35),runner=mat(0x4a302b);
 // Curved runners, sleigh body and gold-trimmed side panels.
 for(const side of [-1,1]){
  const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(side*.95,.18,-1.15),new THREE.Vector3(side*.95,.12,.35),new THREE.Vector3(side*.95,.42,1.15),new THREE.Vector3(side*.95,.48,1.55)]),28,.075,7,false),trim);sleigh.add(rail);
  box(sleigh,side*.83,.62,0,.13,.72,2.2,sleighRed);
  box(sleigh,side*.84,1.02,0,.15,.12,2.25,trim);
 }
 box(sleigh,0,.42,0,1.7,.32,2.15,sleighRed);
 box(sleigh,0,.88,-.68,1.7,.9,.16,sleighRed);
 box(sleigh,0,.88,.62,1.7,.9,.16,sleighRed);
 box(sleigh,0,1.36,-.68,1.75,.12,.2,trim);
 const santa=character(0x9e3039,0x9e3039,1.05,{name:'SANTA',skin:0xe7b991,hair:0xf0eee5,scarf:0xf2e6cf});
 // A full white beard and a floppy hat make Santa instantly recognizable.
 const beard=new THREE.Mesh(new THREE.SphereGeometry(.25,12,9),mat(0xf4eee3));beard.scale.set(1,.8,.58);beard.position.set(0,1.58,.39);santa.userData.body.add(beard);
 const hatTip=cone(santa.userData.body,0,2.55,-.02,.22,.58,mat(0xa62e38));hatTip.rotation.z=-.18;
 sphere(santa.userData.body,0,2.82,-.02,.11,cream);
 cylinder(santa.userData.body,0,2.29,-.02,.31,.31,.1,cream);
 santa.position.set(0,.95,-.15);sleigh.add(santa);
 const giftSack=new THREE.Group(),sackCloth=mat(0x8e2938),sackTrim=mat(0xf0d18b,.4,.25);
 const sackBody=sphere(giftSack,0,.55,0,.62,sackCloth);sackBody.scale.set(.92,1.12,.8);
 cylinder(giftSack,0,1.08,0,.34,.38,.24,sackCloth);
 const sackTie=new THREE.Mesh(new THREE.TorusGeometry(.34,.05,7,20),sackTrim);sackTie.rotation.x=Math.PI/2;sackTie.position.y=1.19;giftSack.add(sackTie);
 sphere(giftSack,0,1.22,0,.1,sackTrim);
 const sham=character(0x315c71,0x8f4149,.82,{name:'SHAM',gender:'female',hair:0x342a28,hairLong:true,scarf:0xe5c98f});
 sham.position.set(0,-.45,0);sham.scale.setScalar(.001);giftSack.add(sham);
 giftSack.position.set(0,.78,-1.2);sleigh.add(giftSack);santaVisit.sack=giftSack;santaVisit.sham=sham;
 // Reindeer line up in front of the sleigh, each with antlers and a glowing nose.
 const deerMat=mat(0x805236),antlerMat=mat(0xd6b58a),noseMat=new THREE.MeshStandardMaterial({color:0xff5555,emissive:0xff2525,emissiveIntensity:1.8});
 for(let i=0;i<3;i++){
  const deer=new THREE.Group(),z=1.75+i*.92;
  sphere(deer,0,.78,z,.42,deerMat);sphere(deer,0,1.18,z+.27,.29,deerMat);
  sphere(deer,0,1.08,z+.52,.075,noseMat);
  for(const side of [-1,1]){
   const ear=cone(deer,side*.22,1.38,z+.24,.09,.28,deerMat);ear.rotation.z=side*-.65;
   const antler=cylinder(deer,side*.2,1.64,z+.2,.035,.045,.5,antlerMat);antler.rotation.z=side*.38;
   for(let j=0;j<2;j++){const tine=cylinder(deer,side*(.3+j*.09),1.83+j*.07,z+.2,.025,.03,.25,antlerMat);tine.rotation.z=side*-.6}
   for(const legX of [-.22,.22]){const leg=cylinder(deer,legX,.42,z,.065,.075,.62,deerMat);leg.userData.leg=true;deer.add(leg)}
  }
  sleigh.add(deer);santaVisit.reindeer.push(deer);
 }
 for(let i=0;i<4;i++){const bell=sphere(sleigh,-.58+i*.38,1.5,-.9,.09,trim);santaVisit.bells.push(bell)}
 scene.add(sleigh);santaVisit.group=sleigh;santaVisit.santa=santa;
 sleigh.position.set(-43,8,-20);sleigh.rotation.y=Math.PI/2;
}
function beginSantaVisit(){
 if(santaVisit.active||santaVisit.done)return;
 releaseControls();buildSantaVisit();santaVisit.active=true;santaVisit.start=performance.now();santaVisit.lastCaption=-1;
 cameraMode='santaVisit';document.body.classList.add('santa-visit-active');
 const ui=document.getElementById('treeFinaleOverlay');
 if(ui){ui.classList.add('show');finaleCaption('A MAGICAL SURPRISE','Look up…','Someone special is on their way to the village!')}
 window.dispatchEvent(new CustomEvent('winter-santa-started'));
}
function updateSantaVisit(now,dt){
 if(!santaVisit.active)return;
 const e=(now-santaVisit.start)/1000,g=santaVisit.group;
 const approach=Math.min(e/8,1),smooth=approach*approach*(3-2*approach);
 g.position.set(THREE.MathUtils.lerp(-43,0,smooth),THREE.MathUtils.lerp(8,0,Math.min(1,Math.max(0,(e-1)/8))),-20);
 g.rotation.y=Math.PI/2;
 santaVisit.reindeer.forEach((d,i)=>{d.rotation.z=Math.sin(e*8+i)*.035;d.position.y=Math.abs(Math.sin(e*9+i))*.07});
 santaVisit.bells.forEach((b,i)=>{b.position.y=1.5+Math.sin(e*13+i)*.07;b.scale.setScalar(.9+Math.sin(e*13+i)*.08)});
 const waving=e>9&&e<17;
 santaVisit.santa.userData.arms[0].rotation.x=waving?-2.25:0;
 santaVisit.santa.userData.arms[0].rotation.z=waving?-.3:0;
 if(e>8&&santaVisit.lastCaption!==1){finaleCaption('A SPECIAL DELIVERY','Santa brought someone…','There is one very special surprise in that big red sack.');santaVisit.lastCaption=1;window.dispatchEvent(new CustomEvent('winter-santa-arrived'))}
 const pop=THREE.MathUtils.clamp((e-9.1)/2.1,0,1),popEase=pop*pop*(3-2*pop);
 santaVisit.sham.position.y=THREE.MathUtils.lerp(-.45,1.02,popEase);santaVisit.sham.scale.setScalar(.001+.82*popEase);
 santaVisit.sham.userData.arms.forEach((arm,i)=>{arm.rotation.x=pop>.65?-2.05:0;arm.rotation.z=pop>.65?(i===0?-.28:.28):0});
 if(e>11.3&&santaVisit.lastCaption!==2){finaleCaption('SURPRISE!','IT’S SHAM!','A little Christmas surprise just popped out of Santa’s sack.');santaVisit.lastCaption=2}
 if(e>15&&santaVisit.lastCaption!==3){finaleCaption('A LITTLE GIFT FOR YOU','Merry Christmas, Sham!','You helped bring Christmas back to the village.');santaVisit.lastCaption=3}
 // Santa opens his sack and sends three tiny kittens to Anto.
 const kittenReveal=THREE.MathUtils.clamp((e-12.2)/3.4,0,1),kittenEase=kittenReveal*kittenReveal*(3-2*kittenReveal);
 antoKittens.forEach((kitten,i)=>{
  if(e>12.2)kitten.visible=true;
  if(kitten.visible){
   kitten.scale.setScalar(.48);
   const startX=g.position.x+(i-1)*.48,startZ=g.position.z-1.5;
   const endX=friends[0].obj.position.x+(i-1)*.72,endZ=friends[0].obj.position.z+.72;
   kitten.position.set(THREE.MathUtils.lerp(startX,endX,kittenEase),.05+Math.abs(Math.sin(e*7+i*1.8))*.16+Math.sin(kittenReveal*Math.PI)*.55,THREE.MathUtils.lerp(startZ,endZ,kittenEase));
   kitten.rotation.y=Math.sin(e*2+i)*.2;
  }
 });
 if(e>12.2&&santaVisit.lastCaption<4){finaleCaption('THREE TINY SURPRISES','KITTENS FOR ANTO!','Santa brought Anto three little kittens to join her first cat.');santaVisit.lastCaption=4}
 const target=new THREE.Vector3(0,3.4,-12);
 const cam=new THREE.Vector3(8,8,3);
 camera.position.lerp(cam,Math.min(1,dt*1.8));camera.lookAt(target);
 if(e>23){santaVisit.active=false;santaVisit.done=true;cameraMode='follow';document.body.classList.remove('santa-visit-active');const ui=document.getElementById('treeFinaleOverlay');ui?.classList.remove('show','caption-in');document.getElementById('sceneHint').textContent='SANTA HAS VISITED THE VILLAGE ✦ MERRY CHRISTMAS!';window.dispatchEvent(new CustomEvent('winter-santa-visit-complete'))}
}
function collectSnowflake(g){g.visible=false;snowflakesFound++;window.dispatchEvent(new CustomEvent('winter-snowflake-found',{detail:{count:snowflakesFound}}));if(snowflakesFound===8){document.getElementById('sceneHint').textContent='ALL EIGHT SNOWFLAKES FOUND ✦ LOOK TO THE SKY!';window.dispatchEvent(new CustomEvent('winter-snowflake-complete'));beginSantaVisit();}}
function collectGift(g){
 g.visible=false;giftsFound++;window.dispatchEvent(new CustomEvent('winter-gift-found',{detail:{count:giftsFound}}));
 const label=document.getElementById('giftCount');if(label)label.textContent=giftsFound+' / 6 PRESENTS FOUND';
 if(giftsFound===6){beginTreeFinale();const q=document.querySelector('#giftQuest span');if(q)q.textContent='✦ DELIVERY COMPLETE';const hint=document.getElementById('sceneHint');if(hint)hint.textContent='ALL SIX PRESENTS DELIVERED — MERRY CHRISTMAS!'}
}

// Distinct village characters: different silhouettes, hair, outfits and readable name tags.
function nameTag(label){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
 const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,128);
 ctx.fillStyle='rgba(9,25,37,.82)';ctx.beginPath();ctx.roundRect(18,14,476,98,28);ctx.fill();
 ctx.strokeStyle='rgba(235,211,157,.9)';ctx.lineWidth=4;ctx.stroke();
 ctx.fillStyle='#f4e8c9';ctx.font='bold 48px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,65);
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
 const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthTest:false}));
 sprite.scale.set(2.25,.56,1);sprite.position.set(0,3.35,0);sprite.userData.nameTag=true;return sprite;
}
function character(coatColor,hatColor,scale=1,style={}){
 const root=new THREE.Group(),coat=mat(coatColor),hat=mat(hatColor),skin=mat(style.skin||0xe6b99a),boots=mat(0x352d32),scarf=mat(style.scarf||0xf1d18e),hair=mat(style.hair||0x49352f),fur=mat(0xf4eee0),zipper=mat(0xe9c987,.45,.3);
 const body=new THREE.Group();root.add(body);
 // Proper festive winter jacket with knitted trim, zipper and buttons.
 cylinder(body,0,1.08,0,.43,.49,.96,coat);
 cylinder(body,0,.61,0,.49,.49,.12,fur);cylinder(body,0,1.53,0,.43,.43,.12,fur);
 box(body,0,1.12,.485,.055,.72,.035,zipper);
 for(let b=0;b<3;b++)sphere(body,.105,1.34-b*.2,.49,.035,zipper);
 // Keep the face and neckline clean: no beard-shaped collar or facial hair.
 sphere(body,0,1.72,0,.39,skin);
 // Hair is deliberately visible beneath the hat and around both sides of the face.
 // Fuller hair silhouette: a dense scalp, broad fringe and substantial side/back volume.
 const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.414,18,12,0,Math.PI*2,0,Math.PI*.49),hair);
 hairCap.position.set(0,2.02,-.035);body.add(hairCap);
 // A small, raised fringe frames the forehead without crossing the eyes.
 const fringe=new THREE.Mesh(new THREE.SphereGeometry(.245,14,9),hair);
 fringe.scale.set(1.12,.27,.42);fringe.position.set(0,1.99,.345);body.add(fringe);
 if(style.hairLong){
  const back=new THREE.Mesh(new THREE.CapsuleGeometry(.205,.92,6,10),hair);back.position.set(0,1.36,-.29);body.add(back);
  for(const side of [-1,1]){
   const sideVolume=new THREE.Mesh(new THREE.SphereGeometry(.19,12,9),hair);
   sideVolume.scale.set(.72,1.45,.78);sideVolume.position.set(side*.355,1.49,.015);body.add(sideVolume);
   const lock=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.72,6,8),hair);
   lock.position.set(side*.39,1.38,.17);lock.rotation.z=side*-.06;body.add(lock);
  }
 }else{
  for(const side of [-1,1]){
   const sideburn=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.24,4,8),hair);
   sideburn.position.set(side*.37,1.64,.105);body.add(sideburn);
  }
 }
 // Simple eyes only; no beard, moustache, or protruding facial-hair pieces.
 for(const side of [-1,1])sphere(body,side*.125,1.78,.365,.035,boots);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.43,12,9,0,Math.PI*2,0,Math.PI*.55),hat);cap.position.set(0,2.02,0);body.add(cap);
 cylinder(body,0,1.96,0,.43,.43,.12,fur);sphere(body,0,2.38,-.015,.105,fur);
 // Rounded scarf wrap and soft hanging end instead of a square neck block.
 const scarfRing=new THREE.Mesh(new THREE.TorusGeometry(.285,.085,8,20),scarf);
 scarfRing.rotation.x=Math.PI/2;scarfRing.position.set(0,1.55,0);body.add(scarfRing);
 const scarfTail=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.34,4,8),scarf);
 scarfTail.position.set(.19,1.31,.32);scarfTail.rotation.z=-.16;body.add(scarfTail);
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const legPivot=new THREE.Group();legPivot.position.set(side*.2,.68,0);body.add(legPivot);
  cylinder(legPivot,0,-.28,0,.15,.17,.58,boots);box(legPivot,0,-.57,.13,.3,.2,.46,boots);legs.push(legPivot);
  const armPivot=new THREE.Group();armPivot.position.set(side*.43,1.48,0);body.add(armPivot);
  cylinder(armPivot,0,-.24,0,.15,.16,.56,coat);cylinder(armPivot,0,-.49,0,.155,.155,.13,fur);
  sphere(armPivot,0,-.57,.02,.13,skin);arms.push(armPivot);
 }
 if(style.name)root.add(nameTag(style.name));
 root.userData.body=body;root.userData.legs=legs;root.userData.arms=arms;root.scale.setScalar(scale);return root;
}
const player=character(0x315c71,0x8f4149,1.05,{name:'TWAIN',gender:'female',hair:0x342a28,hairLong:true,scarf:0xe5c98f});player.position.set(0,0,12);scene.add(player);
const friends=[
 {obj:character(0x9b5147,0x315c71,.82,{name:'ANTO',gender:'female',hair:0xd5a04f,hairLong:true,scarf:0xe8c98c}),center:new THREE.Vector3(-7,0,-12),radius:1.65,speed:.34,phase:0},
 {obj:character(0x477a65,0x9b5147,.8,{name:'VIV',gender:'female',hair:0x302923,scarf:0xd9b4a0}),center:new THREE.Vector3(16,0,-14),radius:1.55,speed:.3,phase:2},
 {obj:character(0x78608c,0xb47a38,.75,{name:'TASS',gender:'female',hair:0x8b5836,hairLong:true,scarf:0xe6d3a1}),center:new THREE.Vector3(-16,0,-13),radius:1.6,speed:.38,phase:4},
 {obj:character(0x3f7185,0x9a5547,.78,{name:'JORDAN',gender:'male',hair:0x382b24,scarf:0xe0c58b}),center:new THREE.Vector3(9,0,-20),radius:1.35,speed:.27,phase:1.2}
];
friends.forEach(f=>scene.add(f.obj));
// Anto's black cat with animated legs and a tiny Santa hat.
function makeAntoCat(){
 const cat=new THREE.Group(),fur=mat(0x171a20),pink=mat(0xb87579),eye=mat(0xe7c96f),hatRed=mat(0xa63f49),snow=mat(0xf4eee0);
 sphere(cat,0,.34,0,.34,fur);sphere(cat,0,.68,.12,.28,fur);
 for(const side of [-1,1]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.12,.28,5),fur);ear.position.set(side*.18,.94,.1);ear.rotation.z=side*-.22;cat.add(ear);sphere(cat,side*.105,.7,.365,.035,eye)}
 sphere(cat,0,.61,.39,.045,pink);
 const tail=new THREE.Mesh(new THREE.TorusGeometry(.22,.065,6,12,Math.PI*1.55),fur);tail.position.set(-.28,.42,-.12);tail.rotation.set(Math.PI/2,0,.7);cat.add(tail);
 const hat=new THREE.Mesh(new THREE.ConeGeometry(.19,.42,8),hatRed);hat.position.set(0,1.04,.08);hat.rotation.z=-.12;cat.add(hat);
 sphere(cat,.045,1.27,.08,.075,snow);cylinder(cat,0,.88,.08,.19,.19,.09,snow);
 const legs=[];for(const x of [-.18,.18])for(const z of [-.13,.16]){const pivot=new THREE.Group();pivot.position.set(x,.23,z);cat.add(pivot);cylinder(pivot,0,-.09,0,.065,.07,.2,fur);legs.push(pivot)}
 cat.userData.tail=tail;cat.userData.legs=legs;return cat;
}
const antoCat=makeAntoCat();scene.add(antoCat);
const antoKittens=[makeAntoCat(),makeAntoCat(),makeAntoCat()];
antoKittens.forEach((kitten,i)=>{kitten.scale.setScalar(.48);kitten.visible=false;scene.add(kitten);kitten.position.set(-7.8+i*.65,.0,-12.6)});
function hitsHouse(x,z,pad=.5){return solidObstacles.some(o=>Math.abs(x-o.x)<o.hx+pad&&Math.abs(z-o.z)<o.hz+pad)}

const snowParticles=new THREE.BufferGeometry(),count=lowEndDevice?48:mobileDevice?90:160,positions=new Float32Array(count*3),velocities=[];for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*90;positions[i*3+1]=Math.random()*34;positions[i*3+2]=(Math.random()-.5)*90;velocities.push(.025+Math.random()*.08)}snowParticles.setAttribute('position',new THREE.BufferAttribute(positions,3));const snowPoints=new THREE.Points(snowParticles,new THREE.PointsMaterial({color:0xffffff,size:.14,transparent:true,opacity:.86}));scene.add(snowPoints);

let keys={},yaw=0,pitch=.18,drag=false,dragPointerId=null,lastX=0,lastY=0,started=false,cinema=true,clock=new THREE.Clock(),cameraMode='follow',cameraTarget=new THREE.Vector3(0,1,0),introStart=performance.now();
function releaseControls(){keys={};drag=false;dragPointerId=null;document.querySelectorAll('[data-sprint]').forEach(b=>b.classList.remove('active'));}
window.addEventListener('blur',releaseControls);
window.addEventListener('pagehide',releaseControls);
document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseControls();});
// Clear only the pointer interaction that ended; camera drags and movement buttons
// must not accidentally leave one another in a held state.
function releasePointerControls(e){if(e?.pointerId===dragPointerId){drag=false;dragPointerId=null;}keys.w=keys.a=keys.s=keys.d=keys.shift=false;document.querySelectorAll('[data-sprint]').forEach(b=>b.classList.remove('active'));}
document.addEventListener('pointerup',releasePointerControls);
document.addEventListener('pointercancel',releasePointerControls);
document.addEventListener('contextmenu',releaseControls);
const forward=new THREE.Vector3(),right=new THREE.Vector3(),move=new THREE.Vector3(),sideMove=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),lookTarget=new THREE.Vector3(),cinemaLook=new THREE.Vector3();
const cinematicShots=[{p:new THREE.Vector3(0,19,39),l:new THREE.Vector3(0,2,-5)},{p:new THREE.Vector3(20,12,3),l:new THREE.Vector3(0,3,-13)},{p:new THREE.Vector3(-20,10,-1),l:new THREE.Vector3(-7,2,-5)},{p:new THREE.Vector3(0,23,-35),l:new THREE.Vector3(0,2,-7)},{p:new THREE.Vector3(0,13,24),l:new THREE.Vector3(0,2,-13)}];
const movementKeys=new Set(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift']);
addEventListener('keydown',e=>{
 const key=e.key.toLowerCase();
 if(movementKeys.has(key)){keys[key]=true;e.preventDefault();}
 if(key==='e'&&started&&cameraMode==='follow'){const spots=[['cabin',-12,-5],['workshop',12,-10],['tree',0,-13]];let nearest=null,best=5.5;spots.forEach(p=>{const d=Math.hypot(player.position.x-p[1],player.position.z-p[2]);if(d<best){best=d;nearest={place:p[0]}}});if(!nearest){const names=['ANTO','VIV','TASS','JORDAN'];friends.forEach((f,i)=>{const d=Math.hypot(player.position.x-f.obj.position.x,player.position.z-f.obj.position.z);if(d<2.8&&(!nearest||d<nearest.distance))nearest={place:'npc',name:names[i],distance:d}})}if(nearest)window.dispatchEvent(new CustomEvent('world-interact',{detail:nearest}))}
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',releaseControls);
const canvas=renderer.domElement;
canvas.style.touchAction='none';
canvas.style.webkitUserSelect='none';
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 drag=true;dragPointerId=e.pointerId;lastX=e.clientX;lastY=e.clientY;
 try{canvas.setPointerCapture(e.pointerId)}catch(_){}
});
canvas.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==dragPointerId||!started||cameraMode!=='follow')return;
 const dx=e.clientX-lastX,dy=e.clientY-lastY;
 yaw-=dx*.007;
 pitch=THREE.MathUtils.clamp(pitch+dy*.004,-.22,.9);
 lastX=e.clientX;lastY=e.clientY;
});
canvas.addEventListener('pointerup',e=>{if(e.pointerId===dragPointerId){drag=false;dragPointerId=null}});
canvas.addEventListener('pointercancel',e=>{if(e.pointerId===dragPointerId){drag=false;dragPointerId=null}});
canvas.addEventListener('lostpointercapture',e=>{if(e.pointerId===dragPointerId){drag=false;dragPointerId=null}});
document.querySelectorAll('[data-move]').forEach(btn=>{const k={forward:'w',back:'s',left:'a',right:'d'}[btn.dataset.move];btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;try{btn.setPointerCapture(e.pointerId)}catch(_){}});['pointerup','pointerleave','pointercancel','lostpointercapture'].forEach(ev=>btn.addEventListener(ev,()=>{keys[k]=false}))});
const sprintButton=document.querySelector('[data-sprint]');
if(sprintButton){sprintButton.addEventListener('pointerdown',e=>{e.preventDefault();keys.shift=true;sprintButton.classList.add('active');try{sprintButton.setPointerCapture(e.pointerId)}catch(_){}});['pointerup','pointerleave','pointercancel','lostpointercapture'].forEach(ev=>sprintButton.addEventListener(ev,()=>{keys.shift=false;sprintButton.classList.remove('active')}));}
function cinematic(){releaseControls();cameraMode='cinema';cinema=true;cinemaStart=performance.now()}
let cinemaStart=performance.now();
function focusOn(place){releaseControls();const p=place==='cabin'?new THREE.Vector3(-12,2,-5):place==='workshop'?new THREE.Vector3(12,2,-10):new THREE.Vector3(0,3,-13);cameraMode='focus';focusStart=performance.now();focusFrom=camera.position.clone();focusTo=p.clone().add(new THREE.Vector3(0,9,13));focusLook=p}
let focusStart=0,focusFrom=new THREE.Vector3(),focusTo=new THREE.Vector3(),focusLook=new THREE.Vector3();
document.getElementById('cinematicBtn').addEventListener('click',cinematic);
document.getElementById('enterWorld').addEventListener('click',()=>{releaseControls();started=true;document.getElementById('introScreen').classList.add('leave');cameraMode='cinema';cinemaStart=performance.now();document.getElementById('sceneHint').textContent='WASD MOVE  •  ARROWS TURN CAMERA  •  HOLD SHIFT TO SPRINT  •  DRAG TO LOOK  •  E TO INTERACT  •  FIND 6 PRESENTS'});
document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.place!=='tree')focusOn(b.dataset.place)}));
document.getElementById('modeBtn').addEventListener('click',()=>{const day=scene.background.getHex()===0x081827;scene.background.set(day?new THREE.Color(0x9bc6d1):new THREE.Color(0x081827));scene.fog.color.set(day?0xa8d0d4:0x9bb9c5);moon.intensity=day?1.15:2.5;warm.intensity=day?20:65});

let lastRender=0;const targetFrame=1000/(lowEndDevice?30:60);function animate(now=0){requestAnimationFrame(animate);if(document.visibilityState!=='visible'||now-lastRender<targetFrame)return;const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
hiddenGifts.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*.8;g.position.y=g.userData.baseY+Math.sin(t*2.1+i)*.1;if(started&&player.position.distanceTo(g.position)<1.45)collectGift(g)});
hiddenSnowflakes.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*(.75+i*.025);g.position.y=g.userData.baseY+Math.sin(t*2.4+i)*.13;if(treeFinale.done&&player.position.distanceTo(g.position)<1.35)collectSnowflake(g)});
const pos=snowParticles.attributes.position.array;for(let i=0;i<count;i++){pos[i*3+1]-=velocities[i];pos[i*3]+=Math.sin(t*.5+i)*.002;if(pos[i*3+1]<0){pos[i*3+1]=34;pos[i*3]=(Math.random()-.5)*90}}snowParticles.attributes.position.needsUpdate=true;
if(!treeFinale.active){
 friends.forEach((f,i)=>{
  const a=t*f.speed+f.phase,x=f.center.x+Math.cos(a)*f.radius,z=f.center.z+Math.sin(a)*f.radius;
  if(!hitsHouse(x,z,.62)){f.obj.position.set(x,Math.abs(Math.sin(t*f.speed*f.radius*5+i))*.035,z);f.obj.rotation.y=-a}
  const gait=t*f.speed*f.radius*5+i;
  f.obj.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(gait+j*Math.PI)*.58);
  f.obj.userData.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(gait+j*Math.PI+Math.PI)*.34);
  f.obj.userData.body.position.y=Math.abs(Math.sin(gait*2))*.035;
 });
 // Cat has its own eased follow movement, turning and walking beside Anto rather than being dragged.
 const ant=friends[0].obj,angle=ant.rotation.y,ox=-.85*Math.cos(angle)+.45*Math.sin(angle),oz=.85*Math.sin(angle)+.45*Math.cos(angle);
 const targetX=ant.position.x+ox,targetZ=ant.position.z+oz,dx=targetX-antoCat.position.x,dz=targetZ-antoCat.position.z;
 const stepLengthSq=dx*dx+dz*dz,blend=Math.min(1,dt*3.2);
 antoCat.position.x+=dx*blend;antoCat.position.z+=dz*blend;antoCat.position.y=.02+Math.abs(Math.sin(t*4))*.025;
 if(stepLengthSq>.00001)antoCat.rotation.y=Math.atan2(dx,dz);
 const walking=stepLengthSq>.00000225,gait=t*9.5;
 antoCat.userData.legs.forEach((leg,j)=>leg.rotation.x=walking?Math.sin(gait+(j%2)*Math.PI+(j>1?Math.PI:0))*.52:0);
 antoCat.userData.tail.rotation.z=Math.sin(t*3.5)*.3;
 antoKittens.forEach((kitten,i)=>{const side=(i-1)*.62;kitten.position.x=antoCat.position.x+side;kitten.position.z=antoCat.position.z+.58+Math.abs(side)*.16;kitten.position.y=.015+Math.abs(Math.sin(t*5+i*1.8))*.08;kitten.rotation.y=antoCat.rotation.y+Math.sin(t*1.7+i)*.16;kitten.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(t*7+i+j*Math.PI)*.18);kitten.userData.tail.rotation.z=Math.sin(t*3+i)*.22});
 }
if(santaVisit.done){
 antoKittens.forEach((kitten,i)=>{if(!kitten.visible)return;const ant=friends[0].obj,angle=ant.rotation.y,offset=(i-1)*.68;const tx=ant.position.x+offset-.35*Math.cos(angle),tz=ant.position.z+.72+.25*Math.sin(angle);kitten.position.x+=(tx-kitten.position.x)*Math.min(1,dt*3.2);kitten.position.z+=(tz-kitten.position.z)*Math.min(1,dt*3.2);kitten.position.y=.02+Math.abs(Math.sin(t*5+i*1.8))*.08;kitten.rotation.y=ant.rotation.y+Math.sin(t*1.7+i)*.16;kitten.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(t*7+i+j*Math.PI)*.18);kitten.userData.tail.rotation.z=Math.sin(t*3+i)*.22});
}
const canControl=started&&cameraMode==='follow';
const sprinting=canControl&&!!keys.shift,moving=canControl&&(keys.w||keys.s||keys.a||keys.d);
const gaitSpeed=sprinting?19:13;
player.userData.legs.forEach((leg,j)=>leg.rotation.x=moving?Math.sin(t*gaitSpeed+j*Math.PI)*(sprinting?.82:.62):0);
player.userData.arms.forEach((arm,j)=>arm.rotation.x=moving?Math.sin(t*gaitSpeed+j*Math.PI+Math.PI)*(sprinting?.58:.4):0);
player.userData.body.position.y=moving?Math.abs(Math.sin(t*gaitSpeed*2))*(sprinting?.075:.045):0;
if(canControl){
 // Arrow keys control the camera independently of WASD character movement.
 const cameraTurnSpeed=1.85*dt;
 if(keys.arrowleft)yaw-=cameraTurnSpeed;
 if(keys.arrowright)yaw+=cameraTurnSpeed;
 if(keys.arrowup)pitch=THREE.MathUtils.clamp(pitch-cameraTurnSpeed*.72,-.22,.9);
 if(keys.arrowdown)pitch=THREE.MathUtils.clamp(pitch+cameraTurnSpeed*.72,-.22,.9);
 forward.set(-Math.sin(yaw),0,-Math.cos(yaw));sideMove.set(Math.cos(yaw),0,-Math.sin(yaw));move.set(0,0,0);
 if(keys.w)move.add(forward);if(keys.s)move.sub(forward);if(keys.a)move.sub(sideMove);if(keys.d)move.add(sideMove);
 if(move.lengthSq()>0){
  move.normalize();const distance=dt*(sprinting?8.6:5.2),dx=move.x*distance,dz=move.z*distance,px=player.position.x,pz=player.position.z;
  const blockedAt=(x,z,axis)=>solidObstacles.some(o=>{
   const insideNow=Math.abs(px-o.x)<o.hx+.48&&Math.abs(pz-o.z)<o.hz+.48;
   const insideNext=Math.abs(x-o.x)<o.hx+.48&&Math.abs(z-o.z)<o.hz+.48;
   if(!insideNext)return false;if(!insideNow)return true;
   const before=axis==='x'?Math.abs(px-o.x):Math.abs(pz-o.z),after=axis==='x'?Math.abs(x-o.x):Math.abs(z-o.z);
   return after<=before;
  });
  const nx=THREE.MathUtils.clamp(px+dx,-31,31),nz=THREE.MathUtils.clamp(pz+dz,-32,27);
  const tryX=blockedAt(nx,pz,'x')?px:nx,tryZ=blockedAt(tryX,nz,'z')?pz:nz;
  player.position.set(tryX,0,tryZ);player.rotation.y=Math.atan2(move.x,move.z);
 }
}
if(cameraMode==='treeFinale'){updateTreeFinale(now,dt)}else if(cameraMode==='santaVisit'){updateSantaVisit(now,dt)}else if(cameraMode==='cinema'){const elapsed=(performance.now()-cinemaStart)/1000;const segment=Math.min(Math.floor(elapsed/2.7),cinematicShots.length-1),q=Math.min((elapsed-segment*2.7)/2.7,1),smooth=q*q*(3-2*q),from=cinematicShots[segment],to=cinematicShots[Math.min(segment+1,cinematicShots.length-1)];camera.position.lerpVectors(from.p,to.p,smooth);cinemaLook.lerpVectors(from.l,to.l,smooth);camera.lookAt(cinemaLook);if(elapsed>=cinematicShots.length*2.7){cameraMode='follow';}}
else if(cameraMode==='treeStudio'){const studioDistance=mobileDevice?10.5:9.5;desiredCamera.set(Math.sin(yaw)*studioDistance,4.5+pitch*2.4,-13+Math.cos(yaw)*studioDistance);camera.position.lerp(desiredCamera,.12);camera.lookAt(0,3,-13)}
else if(cameraMode==='focus'){const q=Math.min((performance.now()-focusStart)/1300,1),s=q*q*(3-2*q);camera.position.lerpVectors(focusFrom,focusTo,s);camera.lookAt(focusLook);if(q>=1)cameraMode='follow'}
else{desiredCamera.set(player.position.x+Math.sin(yaw)*11,player.position.y+7+pitch*5,player.position.z+Math.cos(yaw)*11);camera.position.lerp(desiredCamera,1-Math.pow(.001,dt));lookTarget.set(player.position.x,1.5,player.position.z);cameraTarget.lerp(lookTarget,.08);camera.lookAt(cameraTarget)}
renderer.render(scene,camera);lastRender=now}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,lowEndDevice?.75:mobileDevice?.95:1.2))});
document.getElementById('sceneLoading').classList.add('done');

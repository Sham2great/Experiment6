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
function house(x,z,scale=1,kind='cabin',rotation=0){
 const cs=Math.abs(Math.cos(rotation)),sn=Math.abs(Math.sin(rotation));solidObstacles.push({x,z,hx:(2.9*cs+2.55*sn)*scale,hz:(2.55*cs+2.9*sn)*scale});
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;g.scale.setScalar(scale);scene.add(g);
 const wall=kind==='shop'?mat(0x9b5147):kind==='blue'?mat(0x496b7c):kind==='green'?mat(0x55745d):wood,trimWood=mat(0x49332e),roofEdge=mat(0xe8eee5);
 box(g,0,1.45,0,5,2.9,4.2,wall);
 const r=new THREE.Mesh(new THREE.ConeGeometry(3.55,2.25,4),roof);r.position.set(0,3.95,0);r.rotation.y=Math.PI/4;r.scale.set(1,.75,.82);g.add(r);
 box(g,0,3.02,0,5.6,.18,4.8,snowMat);
 for(const side of [-1,1]){box(g,side*2.58,2.98,0,.16,.2,4.65,roofEdge);box(g,side*2.48,1.48,2.12,.16,2.85,.14,trimWood)}
 box(g,0,.82,2.15,.95,1.65,.18,darkWood);box(g,0,1.68,2.25,1.12,.12,.16,trimWood);
 for(const side of [-1,1]){
  const wx=side*1.45;box(g,wx,1.85,2.16,.82,.92,.12,windowGlow);
  box(g,wx,1.85,2.24,.085,.94,.04,cream);box(g,wx,1.85,2.24,.84,.085,.04,cream);
  box(g,wx,1.31,2.3,.96,.13,.25,trimWood);
  for(let k=0;k<3;k++)sphere(g,wx-.28+k*.28,1.43,2.34,.075,[red,pine2,gold][k]);
  box(g,wx+side*.56,2.0,2.2,.16,.23,.16,gold);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.085,8,7),new THREE.MeshStandardMaterial({color:0xffc66e,emissive:0xff9f38,emissiveIntensity:2.1}));glow.position.set(wx+side*.56,2,2.3);g.add(glow);
 }
 box(g,0,.16,2.65,1.35,.22,.72,roofEdge);box(g,0,.29,2.42,1.1,.18,.5,wood);
 const wreath=new THREE.Mesh(new THREE.TorusGeometry(.29,.075,8,20),pine);wreath.position.set(0,2.35,2.3);g.add(wreath);
 const mistletoe=mat(0x477b50);for(const side of [-1,1]){const leaf=sphere(g,.52+side*.12,2.65,2.3,.13,mistletoe);leaf.scale.set(.62,1.55,.48);leaf.rotation.z=side*.55}for(let j=0;j<3;j++)sphere(g,.52+(j-1)*.07,2.55,2.43,.045,red);
 sphere(g,0,2.35,2.39,.08,red);sphere(g,-.1,2.17,2.4,.07,gold);sphere(g,.1,2.17,2.4,.07,gold);
 const wire=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.45,3.05,2.22),new THREE.Vector3(0,2.82,2.28),new THREE.Vector3(2.45,3.05,2.22)]);
 g.add(new THREE.Mesh(new THREE.TubeGeometry(wire,24,.025,5,false),darkWood));
 for(let i=0;i<9;i++){const p=wire.getPoint(i/8),color=[0xffd27b,0x8be1c0,0xff8791][i%3];const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,8,7),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8}));bulb.position.copy(p);g.add(bulb)}
 cylinder(g,1.55,4.35,-.5,.38,.42,1.15,wood);box(g,1.55,4.96,-.5,.58,.12,.58,roofEdge);
 const smoke=new THREE.Group();smoke.position.set(1.55,5.05,-.5);g.add(smoke);
 for(let i=0;i<4;i++){const puff=sphere(smoke,Math.sin(i)*.18,i*.4,0,.22,mat(0xd8e5e7,.95));puff.userData.smoke=true}
 if(kind==='shop'){
  for(let i=0;i<5;i++){const stripe=box(g,-1.55+i*.78,2.85,2.35,.76,.42,.16,i%2?cream:red);stripe.rotation.x=-.12}
  box(g,0,3.15,2.35,2.2,.38,.12,darkWood);box(g,0,3.16,2.43,1.9,.24,.035,cream);
  for(let i=0;i<3;i++)sphere(g,-.55+i*.55,3.16,2.48,.055,[red,gold,pine2][i]);
 }
 return g;
}
house(-12,-5,1.12,'cabin',-.16);house(12,-10,.95,'shop',Math.PI*.92);house(20,6,.65,'cabin',-.65);house(-22,2,.72,'shop',.55);house(18,-23,.8,'cabin',Math.PI);house(-19,-24,.7,'cabin',-.3);
// Extra little homes form lived-in side streets rather than a ring of empty snow.
house(-30,14,.72,'blue',.48);house(15,27,.8,'green',Math.PI);house(31,8,.7,'cabin',-Math.PI/2);house(-32,-9,.76,'shop',Math.PI/2);house(27,-27,.68,'cabin',2.7);house(-13,30,.68,'green',-.3);house(4,34,.65,'blue',Math.PI);
makeTree(-43,-17,1.4);makeTree(-36,10,1.05);makeTree(35,-27,1.4);makeTree(38,13,1.1);makeTree(-10,-36,1.2);makeTree(10,-37,1.1);

// Tiny farm details beside the outer cottages: stacked straw bales, twine and a little snow.
function hayStack(x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);const straw=mat(0xb99a55),twine=mat(0x6f5935);for(let row=0;row<2;row++)for(let i=0;i<2-row;i++){const b=box(g,(i-(1-row)*.5)*.92,.42+row*.78,0,.98,.78,.78,straw);b.rotation.z=(i+row)%2?.035:-.025;for(const side of [-1,1]){const band=box(g,b.position.x+side*.27,b.position.y,.405,.045,.8,.025,twine);band.rotation.z=b.rotation.z}}solidObstacles.push({x,z,hx:1.1,hz:.75});return g}
hayStack(-27,17,.4);hayStack(19,30,-.5);hayStack(-35,-5,.8);hayStack(29,-24,-.25);
// A little woodpile, stacked firewood and a hand-painted direction sign make the lanes feel inhabited.
function woodPile(x,z){for(let i=0;i<5;i++){const log=cylinder(scene,x+(i%2)*.18,.22+Math.floor(i/2)*.25,z+(i%3)*.17,.13,.13,1.25,wood);log.rotation.z=Math.PI/2;log.rotation.y=(i%2)*.16}}
woodPile(-16,20);woodPile(24,21);
function directionSign(x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);cylinder(g,0,1.15,0,.075,.09,2.3,darkWood);for(let i=0;i<2;i++){const board=box(g,i===0?.18:-.18,1.75-i*.45,.04,.95,.28,.12,i===0?red:wood);board.rotation.y=i===0?.08:-.08;for(let j=0;j<3;j++)sphere(g,(i===0?-.12:.12)+j*.12,1.75-i*.45,.12,.025,gold)}}
directionSign(-9,13,-.2);directionSign(10,-19,.5);

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

for(let i=0;i<10;i++){const a=i*2.399,r=34+(i%5)*1.8;makeTree(Math.cos(a)*r,Math.sin(a)*r,.55+(i%4)*.12,i%7===0)}
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

function lamp(x,z){cylinder(scene,x,1.85,z,.085,.12,3.7,darkWood);cylinder(scene,x,3.55,z,.16,.2,.22,gold);const glass=new THREE.Mesh(new THREE.BoxGeometry(.48,.58,.48),new THREE.MeshStandardMaterial({color:0xffd99a,emissive:0xffb85d,emissiveIntensity:1.7,transparent:true,opacity:.82}));glass.position.set(x,3.88,z);scene.add(glass);const cap=new THREE.Mesh(new THREE.ConeGeometry(.39,.3,4),darkWood);cap.position.set(x,4.31,z);cap.rotation.y=Math.PI/4;scene.add(cap);const l=new THREE.PointLight(0xffc87e,5.5,10);l.position.set(x,3.85,z);scene.add(l);sphere(scene,x,3.54,z,.12,gold)}
// Street lamps follow the winding road, alternating sides so the road itself stays clear.
for(let i=0;i<11;i++){const t=.07+i*.086,p=roadCurve.getPointAt(t),tan=roadCurve.getTangentAt(t),side=new THREE.Vector3(-tan.z,0,tan.x).normalize(),sign=i%2===0?-1:1,offset=side.multiplyScalar(sign*4.15);lamp(p.x+offset.x,p.z+offset.z);}

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
function villageClockTower(x,z){solidObstacles.push({x,z,hx:1.9,hz:1.9});const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);box(g,0,3.4,0,3.3,6.8,3.1,mat(0x66504a));for(const side of [-1,1]){box(g,side*1.7,3.5,0,.16,7,.18,gold);box(g,0,6.8,side*1.58,3.35,.16,.18,cream)}const top=new THREE.Mesh(new THREE.ConeGeometry(2.45,2.4,4),red);top.position.y=8;top.rotation.y=Math.PI/4;g.add(top);const face=new THREE.Mesh(new THREE.CircleGeometry(.82,32),cream);face.position.set(0,5.25,1.62);g.add(face);const ring=new THREE.Mesh(new THREE.TorusGeometry(.84,.08,8,32),gold);ring.position.set(0,5.25,1.66);g.add(ring);const h=box(g,0,5.48,1.78,.055,.43,.035,darkWood);h.rotation.z=-.55;box(g,.16,5.25,1.79,.34,.055,.035,darkWood);return g}
function villageLookoutTower(x,z){solidObstacles.push({x,z,hx:1.65,hz:1.65});const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);for(const side of [-1,1])for(const depth of [-1,1])cylinder(g,side*.95,3.2,depth*.95,.12,.16,6.4,darkWood);for(let y=1.2;y<6;y+=1.35){box(g,0,y,0,2.15,.13,2.15,wood);for(const side of [-1,1])box(g,side*.95,y+.42,0,.12,.8,1.9,gold)}box(g,0,6.3,0,2.7,.28,2.7,darkWood);const roofTop=new THREE.Mesh(new THREE.ConeGeometry(2.15,1.7,4),roof);roofTop.position.y=7.35;roofTop.rotation.y=Math.PI/4;g.add(roofTop);return g}
const clockTower=villageClockTower(35,25),lookoutTower=villageLookoutTower(-36,-24);
// Warm vertical accents belong on the two landmarks, not scattered over every roof.
function towerLights(tower,w,h){for(let y=1.1;y<h;y+=.72)for(const side of [-1,1]){const bulb=new THREE.Mesh(new THREE.SphereGeometry(.075,8,7),new THREE.MeshStandardMaterial({color:0xffd58a,emissive:0xffb85c,emissiveIntensity:1.6}));bulb.position.set(side*w,y,w*.92);tower.add(bulb)}}
towerLights(clockTower,1.72,6.8);towerLights(lookoutTower,.95,6.3);
// A few evergreens wear their own delicate spiral of warm fairy lights.
function treeLightSpiral(x,z,size){for(let i=0;i<22;i++){const q=i/21,y=(.48+q*2.05)*size,r=(.78-q*.43)*size,a=q*Math.PI*7;const color=i%4===0?0x8be2c2:0xffd27b;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.052*size,7,6),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.8}));bulb.position.set(x+Math.cos(a)*r,y,z+Math.sin(a)*r);scene.add(bulb)}}
treeLightSpiral(-43,-17,1.4);treeLightSpiral(35,-27,1.4);treeLightSpiral(38,13,1.1);
 // A little village-square snowman can be dressed up in the afterglow activity.
const villageSnowman=new THREE.Group();villageSnowman.position.set(4,0,-4);scene.add(villageSnowman);
sphere(villageSnowman,0,.62,0,.62,snowMat);sphere(villageSnowman,0,1.42,0,.43,snowMat);
for(const x of [-.14,.14])sphere(villageSnowman,x,1.5,.38,.045,darkWood);
sphere(villageSnowman,0,1.34,.4,.045,red);
const carrot=cone(villageSnowman,0,1.36,.55,.09,.36,mat(0xe58c42));carrot.rotation.x=Math.PI/2;carrot.visible=false;
const snowArms=[];for(const side of [-1,1]){const arm=cylinder(villageSnowman,side*.55,1.12,0,.055,.07,.85,wood);arm.rotation.z=side*.95;snowArms.push(arm)}
const snowHat=box(villageSnowman,0,1.88,0,.72,.14,.68,darkWood);const snowHatTop=box(villageSnowman,0,2.13,0,.43,.42,.42,darkWood);snowHat.visible=false;snowHatTop.visible=false;
const snowScarf=new THREE.Mesh(new THREE.TorusGeometry(.43,.095,8,20),red);snowScarf.position.y=1.1;villageSnowman.add(snowScarf);snowScarf.visible=false;
window.decorateSnowman=part=>{if(part==='hat'){snowHat.visible=true;snowHatTop.visible=true}else if(part==='scarf')snowScarf.visible=true;else if(part==='nose')carrot.visible=true;return true};
function stringLights(a,b,c,d,y){
 const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(a,y,c),new THREE.Vector3((a+b)/2,y-2,(c+d)/2),new THREE.Vector3(b,y,d)]);
 scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,45,.045,6,false),gold));
 for(let i=0;i<=8;i++){const p=curve.getPoint(i/8);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.105,8,7),new THREE.MeshStandardMaterial({color:i%2?0xffd88b:0x8be2c2,emissive:i%2?0xffb94f:0x4ac99a,emissiveIntensity:1.7}));bulb.position.copy(p);scene.add(bulb)}
}
// No overhead light webs: the main illumination now traces the village road and selected landmarks.
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
// Keep presents well clear of house roofs, walls, and market stalls so none can spawn indoors or get hidden behind a structure.
function hitsHouseForGift(x,z){return solidObstacles.some(o=>Math.abs(x-o.x)<o.hx+2.8&&Math.abs(z-o.z)<o.hz+2.8)}
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
let finaleCaptionTimer=0;function finaleCaption(kicker,title,copy,duration=4600){const ui=document.getElementById('treeFinaleOverlay');if(!ui)return;clearTimeout(finaleCaptionTimer);ui.classList.remove('caption-in');void ui.offsetWidth;ui.querySelector('.finale-kicker').textContent=kicker;ui.querySelector('.finale-title').textContent=title;ui.querySelector('.finale-copy').textContent=copy;ui.classList.add('caption-in');if(duration>0)finaleCaptionTimer=setTimeout(()=>ui.classList.remove('caption-in'),duration)}
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
 const chars=[player,friends[0].obj],villagers=[player,...friends.map(f=>f.obj)];
 const handoffSpots=[new THREE.Vector3(-4.35,0,-5.35),new THREE.Vector3(-1.55,0,-5.35)];
 const ladderSpots=[new THREE.Vector3(-1.45,0,baseZ+.25),new THREE.Vector3(1.45,0,baseZ+.25)];
 const partySpots=[[-5.8,-9.1],[-3.9,-7.8],[-1.95,-7.1],[0,-6.8],[1.95,-7.1]];
 if(!treeFinale.stageStarts)treeFinale.stageStarts=chars.map(ch=>ch.position.clone());
 if(!finaleLadders.length){finaleLadders.push(makeFinaleLadder(),makeFinaleLadder());finaleLadders.forEach(ladder=>{ladder.visible=false;});}
 if(!treeFinale.sack)treeFinale.sack=makeGiftSack();

 // First, Twain and Anto walk in from where they were, meeting beside the tree rather than appearing in front of it.
 const approach=smooth(clamp(e/5.8,0,1));
 chars.forEach((ch,i)=>{
  ch.position.lerpVectors(treeFinale.stageStarts[i],handoffSpots[i],approach);
  ch.position.y=0;
  ch.rotation.y=i===0?Math.PI/2:-Math.PI/2;
  const gait=e*6.2+i*Math.PI;
  ch.userData.legs.forEach((leg,j)=>leg.rotation.x=e<5.8?(1-approach)*Math.sin(gait+j*Math.PI)*.42:0);
  ch.userData.arms.forEach(arm=>arm.rotation.set(0,0,0));
  ch.userData.body.position.y=0;
 });

 // Attach the sack to real hand positions throughout the exchange.
 const twain=player,anto=friends[0].obj;
 const presenting=e>7.1&&e<12.5,holding=e>=12.5&&e<19.2;
 twain.userData.arms[1].rotation.set(presenting?-1.12:0,0,presenting?-.12:0);
 anto.userData.arms[0].rotation.set(e>9.2&&e<19.2?-.98:0,0,e>9.2&&e<19.2?.12:0);
 anto.userData.arms[1].rotation.set(holding?-.98:0,0,holding?-.12:0);
 twain.updateMatrixWorld(true);anto.updateMatrixWorld(true);
 const twainHand=twain.userData.arms[1].localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
 const antoHand=anto.userData.arms[0].localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
 const antoOther=anto.userData.arms[1].localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
 const sackAt=hand=>hand.clone().add(new THREE.Vector3(0,-1.12,0));
 const sackStart=sackAt(twainHand),sackMid=sackAt(twainHand.clone().lerp(antoHand,.5));
 const sackEnd=sackAt(antoHand.clone().lerp(antoOther,.5));
 const offer=smooth(clamp((e-7.1)/2.8,0,1)),receive=smooth(clamp((e-10.1)/2.4,0,1));
 treeFinale.sack.visible=e>=7.1&&e<19.2;
 if(e<10.1)treeFinale.sack.position.lerpVectors(sackStart,sackMid,offer);
 else if(e<12.5)treeFinale.sack.position.lerpVectors(sackMid,sackEnd,receive);
 else treeFinale.sack.position.copy(sackEnd);
 treeFinale.sack.rotation.set(0,0,0);
 // Anto celebrates with a happy bounce while keeping both hands on the gift sack.
 const joy=e>15.2&&e<20.4,joyBeat=(e-15.2)*Math.PI*2.35,joyPulse=joy?Math.max(0,Math.sin(joyBeat)):0;
 anto.position.y=joyPulse*.62;
 anto.rotation.y=-Math.PI/2+Math.sin(joyBeat*.5)*.28;
 anto.userData.legs.forEach((leg,j)=>{leg.rotation.x=joy?Math.sin(joyBeat+j*Math.PI)*.72:0;leg.rotation.z=joy?(j===0?-.16:.16)*Math.sin(joyBeat):0});
 anto.userData.arms.forEach((arm,j)=>{if(joy){arm.rotation.x=-2.25+Math.sin(joyBeat+j*Math.PI)*.35;arm.rotation.z=(j===0?-.72:.72)+Math.sin(joyBeat+j*Math.PI)*.22}});
 anto.userData.body.rotation.z=joy?Math.sin(joyBeat*.5)*.12:0;
 if(e>=20.4){treeFinale.sack.visible=false;anto.position.y=0;anto.userData.body.rotation.z=0;anto.userData.arms.forEach(arm=>arm.rotation.set(0,0,0));anto.userData.legs.forEach(leg=>leg.rotation.set(0,0,0));}

 // Let the happiness land before the pair turn back to the tree and prepare the ladders.
 const moveToTree=smooth(clamp((e-21.0)/4.8,0,1));
 chars.forEach((ch,i)=>{
  ch.position.lerpVectors(handoffSpots[i],ladderSpots[i],moveToTree);
  ch.position.y=0;
  const faceTree=Math.PI;
  ch.rotation.y=THREE.MathUtils.lerp(i===0?Math.PI/2:-Math.PI/2,faceTree,moveToTree);
  const gait=e*6.5+i*Math.PI;
  ch.userData.legs.forEach((leg,j)=>leg.rotation.x=e>21.5&&e<25.7?Math.sin(gait+j*Math.PI)*(1-moveToTree)*.3:0);
  if(e>=20.4&&e<25.8)ch.userData.arms.forEach(arm=>arm.rotation.set(0,0,0));
 });

 const plant=smooth(clamp((e-26.2)/2.8,0,1));
 finaleLadders.forEach((ladder,i)=>{
  ladder.visible=e>=26.2;
  ladder.position.set(ladderSpots[i].x,1.75*(1-plant),baseZ);
  ladder.rotation.set(-.22*plant,0,(Math.PI/2)*(1-plant));
  if(e>=26.2&&e<29)chars[i].userData.arms.forEach((arm,j)=>arm.rotation.set(-.25,0,j===0?.7:-.7));
 });
 const climb=smooth(clamp((e-29.5)/8.2,0,1));
 chars.forEach((ch,i)=>{
  if(e<29.5){ch.position.copy(ladderSpots[i]);}
  else if(e<38.2)ch.position.set(ladderSpots[i].x,.12+climb*4.75,baseZ+.35);
  else{const down=smooth(clamp((e-38.2)/4.2,0,1));ch.position.set(ladderSpots[i].x,4.87*(1-down),baseZ+.35);}
  // Keep both climbers squarely facing the ladder as they ascend.
  ch.rotation.y=Math.PI;
  const stepping=e>29.5&&e<38.2,gait=e*7.2+i*Math.PI;
  ch.userData.legs.forEach((leg,j)=>leg.rotation.x=stepping?Math.sin(gait+j*Math.PI)*.34:0);
  ch.userData.arms.forEach((arm,j)=>arm.rotation.set(stepping?-.95:(e>35.4&&e<38.5?-1.25:0),0,j===0?.12:-.12));
  ch.userData.body.position.y=stepping?Math.abs(Math.sin(gait*2))*.025:0;
 });
 if(e>36.2&&!treeFinale.star){treeFinale.star=makeFinaleStar();treeFinale.star.position.set(-1.35,5.45,baseZ-.9);}
 if(treeFinale.star){
  const q=smooth(clamp((e-36.5)/3.1,0,1));
  treeFinale.star.position.lerpVectors(new THREE.Vector3(-1.35,5.45,baseZ-.9),new THREE.Vector3(0,5.72,treeZ-.04),q);
  treeFinale.star.rotation.z=(1-q)*Math.sin(e*1.5)*.07;
  if(q>=1&&!treeFinale.light){
   treeFinale.star.rotation.z=0;treeFinale.light=new THREE.PointLight(0xffd47a,0,22);treeFinale.light.position.set(0,5.8,treeZ);scene.add(treeFinale.light);
   treeFinale.glow=new THREE.Mesh(new THREE.SphereGeometry(.36,10,8),new THREE.MeshBasicMaterial({color:0xffe5a6,transparent:true,opacity:0,depthWrite:false}));treeFinale.glow.position.set(0,5.72,treeZ);scene.add(treeFinale.glow);
  }
 }
 if(treeFinale.light){const power=clamp((e-39.2)/1.8,0,1);treeFinale.light.intensity=power*48;treeFinale.glow.material.opacity=power*.16;}
 if(e>40&&e<42.5&&Math.floor(e*(lowEndDevice?4:7))!==Math.floor((e-dt)*(lowEndDevice?4:7))){
  for(let i=0;i<(lowEndDevice?2:3)&&treeFinale.particles.length<maxFinaleParticles;i++){
   const p=new THREE.Mesh(finaleParticleGeometry,new THREE.MeshBasicMaterial({color:i%2?0xffe4a0:0xd8f5f0}));
   const angle=Math.random()*Math.PI*2,r=.8+Math.random()*1.8;p.position.set(Math.cos(angle)*r,3.8+Math.random()*2.2,treeZ+Math.sin(angle)*r);
   p.userData.velocity=new THREE.Vector3(-p.position.x*.2,.65+Math.random()*.45,(treeZ-p.position.z)*.2);scene.add(p);treeFinale.particles.push(p);
  }
 }
 treeFinale.particles.forEach(p=>{p.position.addScaledVector(p.userData.velocity,dt);p.material.opacity=Math.max(0,p.material.opacity-.35*dt);p.scale.multiplyScalar(.99)});
 treeFinale.particles=treeFinale.particles.filter(p=>{if(p.material.opacity<=.01){scene.remove(p);p.material.dispose();return false}return true});

 const celebrating=e>=44.5;
 if(celebrating){
  const gather=smooth(clamp((e-44.5)/2.1,0,1));
  villagers.forEach((ch,i)=>{
   const [px,pz]=partySpots[i],dance=e-46.6,phase=i*Math.PI*.65;
   ch.position.x=THREE.MathUtils.lerp(ch.position.x,px,gather);ch.position.z=THREE.MathUtils.lerp(ch.position.z,pz,gather);
   const bounce=dance>0?Math.max(0,Math.sin(dance*7.2+phase))*.42:0;ch.position.y=bounce+Math.abs(Math.sin(dance*3.6+phase))*.035;
   ch.rotation.y=Math.atan2(-ch.position.x,treeZ-ch.position.z);
   ch.userData.legs.forEach((leg,j)=>leg.rotation.x=dance>0?Math.sin(dance*7.2+phase+j*Math.PI)*.72:0);
   ch.userData.arms.forEach((arm,j)=>{arm.rotation.x=dance>0?-.9-Math.max(0,Math.sin(dance*7.2+phase))*1.05:0;arm.rotation.z=(j===0?-1:1)*(dance>0?.35+Math.abs(Math.sin(dance*7.2+phase))*.3:0)});
   ch.userData.body.position.y=bounce*.18;
  });
  const catTarget=friends[0].obj.position.clone().add(new THREE.Vector3(-.8,0,.5));antoCat.position.lerp(catTarget,Math.min(1,dt*2.8));
  antoCat.position.y=Math.max(0,Math.sin((e-46.6)*7.2+1)*.18);antoCat.userData.tail.rotation.z=Math.sin(e*5)*.55;
  antoKittens.forEach((kitten,i)=>{if(kitten.visible){kitten.position.set(friends[0].obj.position.x-1.05+i*.68,.04+Math.abs(Math.sin(e*5+i*1.7))*.12,friends[0].obj.position.z+.65);kitten.rotation.y=Math.sin(e*2+i)*.15;}});
 }

 // Camera stays on the gift exchange for the whole handoff, then widens for the tree work.
 const camP=e<21.5?new THREE.Vector3(-2.6,6.2,1.5):e<29.5?new THREE.Vector3(1.8,7.1,1.2):e<44.5?new THREE.Vector3(5.5,7.2,1.5):new THREE.Vector3(0,10.5,treeZ+19);
 const camLook=e<21.5?new THREE.Vector3(-4,1.5,-8.1):new THREE.Vector3(0,2.8,treeZ);
 camera.position.lerp(camP,1-Math.pow(.001,dt));camera.lookAt(camLook);

 if(e<2&&treeFinale.lastCaption!==0){finaleCaption('A CHRISTMAS PROMISE','One last little wonder…','Twain and Anto have one more surprise to share.');treeFinale.lastCaption=0;}
 if(e>6.3&&treeFinale.lastCaption!==1){finaleCaption('A GIFT FOR ANTO','Something just for you…','Twain brought the presents home, and saved one special gift for Anto.');treeFinale.lastCaption=1;}
 if(e>12.5&&treeFinale.lastCaption!==2){finaleCaption('A LITTLE SURPRISE','They’re all yours!','Anto finally gets to see all the presents Twain found.');treeFinale.lastCaption=2;}
 if(e>15.2&&treeFinale.lastCaption!==3){finaleCaption('LOOK AT THAT SMILE','She loves them!','A whole lot of Christmas joy, just for Anto.');treeFinale.lastCaption=3;}
 if(e>21.5&&treeFinale.lastCaption!==4){finaleCaption('SIDE BY SIDE','Let’s decorate the tree…','Now that the gifts are home, they can finish the village tree together.');treeFinale.lastCaption=4;}
 if(e>29.5&&treeFinale.lastCaption!==5){finaleCaption('ONE RUNG AT A TIME','Up we go…','Carefully, together, reaching for the top.');treeFinale.lastCaption=5;}
 if(e>36.2&&treeFinale.lastCaption!==6){finaleCaption('THE FINAL TOUCH','For the top of our tree.','A little light for this little world.');treeFinale.lastCaption=6;}
 if(e>40&&e<42.5&&treeFinale.lastCaption!==7){finaleCaption('THE WISHING TREE','Look how it shines.','And just like that, Christmas feels a little more magical.');treeFinale.lastCaption=7;}
 if(e>=44.5&&treeFinale.lastCaption!==8){finaleCaption('TOGETHER AT LAST','MERRY CHRISTMAS!','The whole village has come together to celebrate.');treeFinale.lastCaption=8;}
 if(e>44.5&&e<51.5&&Math.floor(e*6)!==Math.floor((e-dt)*6)&&treeFinale.particles.length<70){
  for(let i=0;i<4&&treeFinale.particles.length<70;i++){
   const colors=[0xffd778,0xf4f0df,0xd66b72,0x8ed6c0],p=new THREE.Mesh(new THREE.SphereGeometry(.055,5,5),new THREE.MeshBasicMaterial({color:colors[(i+Math.floor(e*6))%colors.length]}));
   p.position.set((Math.random()-.5)*9,2.2+Math.random()*3,treeZ+2+(Math.random()-.5)*5);p.userData.velocity=new THREE.Vector3((Math.random()-.5)*1.5,1+Math.random()*1.8,(Math.random()-.5)*.8);scene.add(p);treeFinale.particles.push(p);
  }
 }
 if(e>53){
  treeFinale.active=false;treeFinale.done=true;document.body.classList.remove('finale-active');document.body.classList.add('festival-unlocked');hiddenSnowflakes.forEach(g=>g.visible=true);
  window.dispatchEvent(new CustomEvent('winter-festival-unlocked'));cameraMode='follow';
  chars[0].position.set(-1.4,0,-7.8);chars[1].position.set(1.4,0,-7.8);friends.slice(1).forEach(f=>f.obj.position.copy(f.center));
  chars.forEach(ch=>{ch.rotation.y=0;ch.userData.body.position.y=0;ch.userData.arms.forEach(a=>a.rotation.set(0,0,0));ch.userData.legs.forEach(l=>l.rotation.set(0,0,0));});
  if(treeFinale.sack){scene.remove(treeFinale.sack);treeFinale.sack=null;}
  finaleLadders.forEach(l=>{scene.remove(l);l.traverse(o=>o.geometry?.dispose())});finaleLadders.length=0;
  const ui=document.getElementById('treeFinaleOverlay');ui?.classList.remove('show','caption-in');
  document.getElementById('sceneHint').textContent='VILLAGE FESTIVAL UNLOCKED ✦ FIND 8 MAGICAL SNOWFLAKES • EXPLORE • PLAY';
 }
}
let snowflakesFound=0;
const santaVisit={active:false,done:false,start:0,group:null,santa:null,reindeer:[],bells:[],lastCaption:-1,sack:null,sackBody:null,sackNeck:null,sackTie:null,sham:null,gifts:[],giftCaptionsShown:[],crowdStarts:[],crowdTargets:[]};
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
 const sackNeck=cylinder(giftSack,0,1.08,0,.34,.38,.24,sackCloth);
 const sackTie=new THREE.Mesh(new THREE.TorusGeometry(.34,.05,7,20),sackTrim);sackTie.rotation.x=Math.PI/2;sackTie.position.y=1.19;giftSack.add(sackTie);
 sphere(giftSack,0,1.22,0,.1,sackTrim);
 const sham=character(0x315c71,0x8f4149,.82,{name:'SHAM',gender:'female',hair:0x342a28,hairStyle:'afro',hat:false,outfit:'longcoat',trim:0x20394a,scarf:0xe5c98f,accessory:'star-clip'});
 sham.position.set(0,-.45,0);sham.scale.setScalar(.001);giftSack.add(sham);
 giftSack.position.set(0,.78,-1.2);sleigh.add(giftSack);santaVisit.sack=giftSack;santaVisit.sackBody=sackBody;santaVisit.sackNeck=sackNeck;santaVisit.sackTie=sackTie;santaVisit.sham=sham;
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
 // Five individually wrapped presents, one for every member of the village group.
 const giftColors=[0x2d8c62,0xb83c49,0x416fa8,0x8a579c,0xd18a36],giftRibbons=[0xf3d58b,0xe8e2d4,0xf1d27b,0xf4e5d2,0x6b392d];
 santaVisit.gifts.length=0;
 giftColors.forEach((color,i)=>{const gift=new THREE.Group(),paper=mat(color),ribbon=mat(giftRibbons[i]);box(gift,0,0,0,.58,.48,.5,paper);box(gift,0,.25,0,.12,.035,.53,ribbon);box(gift,0,.25,0,.62,.035,.11,ribbon);const bow=sphere(gift,0,.31,0,.12,ribbon);bow.scale.set(1,.5,1);scene.add(gift);gift.visible=false;santaVisit.gifts.push(gift)});
 scene.add(sleigh);santaVisit.group=sleigh;santaVisit.santa=santa;
 sleigh.position.set(-43,8,-20);sleigh.rotation.y=0;
}
function beginSantaVisit(){
 if(santaVisit.active||santaVisit.done)return;
 releaseControls();buildSantaVisit();santaVisit.active=true;santaVisit.start=performance.now();santaVisit.lastCaption=-1;
 const crowd=[player,...friends.map(f=>f.obj)];
 santaVisit.crowdStarts=crowd.map(ch=>ch.position.clone());
 santaVisit.crowdTargets=[new THREE.Vector3(-6.8,0,-3.8),new THREE.Vector3(-3.35,0,-4.8),new THREE.Vector3(0,0,-3.5),new THREE.Vector3(3.35,0,-4.8),new THREE.Vector3(6.8,0,-3.8)];
 santaVisit.giftCaptionsShown=[];if(santaVisit.sham)santaVisit.sham.hiddenForGifts=false;cameraMode='santaVisit';document.body.classList.add('santa-visit-active');
 const ui=document.getElementById('treeFinaleOverlay');
 if(ui){ui.classList.add('show');finaleCaption('A MAGICAL SURPRISE','Look up…','Someone special is on their way to the village!')}
 window.dispatchEvent(new CustomEvent('winter-santa-started'));
}
function updateSantaVisit(now,dt){
 if(!santaVisit.active)return;
 const e=(now-santaVisit.start)/1000,g=santaVisit.group,clamp=THREE.MathUtils.clamp,smooth=v=>v*v*(3-2*v);
 // Sleigh arrives and settles at the edge of the village square.
 const arrival=smooth(clamp(e/7.5,0,1));
 g.position.set(THREE.MathUtils.lerp(-43,0,arrival),THREE.MathUtils.lerp(8,0,clamp((e-1)/7.5,0,1)),-10.5);
 g.rotation.y=0;
 santaVisit.reindeer.forEach((d,i)=>{d.rotation.z=Math.sin(e*8+i)*.025;d.position.y=Math.abs(Math.sin(e*9+i))*.055});
 santaVisit.bells.forEach((b,i)=>{b.position.y=1.5+Math.sin(e*13+i)*.06;b.scale.setScalar(.9+Math.sin(e*13+i)*.07)});
 const crowd=[player,...friends.map(f=>f.obj)],gather=smooth(clamp((e-7.5)/5.5,0,1));
 crowd.forEach((ch,i)=>{
  ch.position.lerpVectors(santaVisit.crowdStarts[i],santaVisit.crowdTargets[i],gather);
  ch.position.y=0;ch.rotation.y=Math.PI;
  ch.userData.legs.forEach(leg=>leg.rotation.x=e<13?(1-gather)*Math.sin(e*5+i)*.3:0);
  ch.userData.arms.forEach(arm=>{arm.rotation.set(0,0,0)});
  ch.userData.body.position.y=0;
 });
 // A close establishing shot of Santa, then a wide shot as the whole village gathers.
 const closePos=new THREE.Vector3(10.5,5.5,-5.8),closeLook=new THREE.Vector3(0,2.0,-7.5);
 const widePos=new THREE.Vector3(14,10.5,-2.5),wideLook=new THREE.Vector3(0,1.6,-6.2);
 let camPos=closePos,look=closeLook;
 if(e>=9&&e<14){camPos=widePos;look=wideLook}
 // Sham's surprise remains part of Santa's arrival, revealed in a close-up.
 const waving=e>8&&e<16;
 santaVisit.santa.userData.arms[0].rotation.x=waving?-2.15:0;
 santaVisit.santa.userData.arms[0].rotation.z=waving?-.28:0;
 if(e>7.5&&santaVisit.lastCaption!==1){finaleCaption('SANTA HAS ARRIVED','A little Christmas magic…','Everyone, come gather around!');santaVisit.lastCaption=1;window.dispatchEvent(new CustomEvent('winter-santa-arrived'))}
 const sackOpen=smooth(clamp((e-8.5)/6.5,0,1));
 santaVisit.sackNeck.scale.y=1-.48*sackOpen;santaVisit.sackNeck.rotation.z=-.12*sackOpen;santaVisit.sackTie.scale.setScalar(1-.28*sackOpen);santaVisit.sackBody.scale.y=1.12+.12*sackOpen;
 const pop=smooth(clamp((e-10.2)/6.8,0,1));
 if(!santaVisit.shamReleased){
  santaVisit.sham.position.y=THREE.MathUtils.lerp(-.45,1.08,pop);
  santaVisit.sham.scale.setScalar(.001+.82*pop);
  santaVisit.sham.userData.arms.forEach((arm,i)=>{arm.rotation.x=pop>.65?-2.05:0;arm.rotation.z=pop>.65?(i===0?-.28:.28):0});
  if(e>=17){
   santaVisit.sham.updateMatrixWorld(true);scene.attach(santaVisit.sham);
   santaVisit.sham.scale.setScalar(.82);santaVisit.sham.position.y=0;
   santaVisit.sham.rotation.y=Math.PI/2;
   santaVisit.shamStart=santaVisit.sham.position.clone();santaVisit.shamReleased=true;
  }
 }else{
  const walkOut=smooth(clamp((e-17)/3.6,0,1)),walkAround=smooth(clamp((e-20.6)/5.2,0,1));
  const firstStop=santaVisit.shamStart.clone().add(new THREE.Vector3(-8.5,0,1.2)),finalStop=new THREE.Vector3(-8.8,0,-7.2);
  if(e<20.6){santaVisit.sham.position.lerpVectors(santaVisit.shamStart,firstStop,walkOut);santaVisit.sham.rotation.y=Math.PI/2}
  else{santaVisit.sham.position.lerpVectors(firstStop,finalStop,walkAround);santaVisit.sham.rotation.y=Math.PI}
  const walking=e<25.8;
  santaVisit.sham.userData.legs.forEach((leg,j)=>leg.rotation.x=walking?Math.sin(e*7+j*Math.PI)*.34:0);
  santaVisit.sham.userData.arms.forEach((arm,j)=>arm.rotation.x=walking?Math.sin(e*7+j*Math.PI)*.22:0);
 }
 if(e>17.5&&santaVisit.lastCaption!==2){finaleCaption('SURPRISE!','IT’S SHAM!','Sham has climbed out of Santa’s sack!',4300);santaVisit.lastCaption=2}
 // Sham gets a moment in the spotlight, then exits the square before the gifts begin.
 if(e>=27.5&&!santaVisit.sham.hiddenForGifts){santaVisit.sham.visible=false;santaVisit.sham.hiddenForGifts=true}
 // The kittens trot over to Anto while everyone watches.
 const kittenReveal=smooth(clamp((e-23)/5,0,1));
 antoKittens.forEach((kitten,i)=>{
  if(e>23)kitten.visible=true;
  if(kitten.visible){kitten.scale.setScalar(.48);const sx=g.position.x+(i-1)*.48,sz=g.position.z+1.5,tx=santaVisit.crowdTargets[1].x+(i-1)*.62,tz=santaVisit.crowdTargets[1].z+.9;kitten.position.set(THREE.MathUtils.lerp(sx,tx,kittenReveal),.05+Math.abs(Math.sin(e*7+i*1.8))*.13+Math.sin(kittenReveal*Math.PI)*.3,THREE.MathUtils.lerp(sz,tz,kittenReveal));kitten.rotation.y=Math.PI}
 });
 // Every gift is held between the recipient's real palms, not floated at an arbitrary chest offset.
 const recipients=[player,...friends.map(f=>f.obj)],giftWindows=[[29,34.8],[35.8,41.6],[42.6,48.4],[49.4,55.2],[56.2,62]];
 santaVisit.gifts.forEach((gift,i)=>{
  const [begin,finish]=giftWindows[i],recipient=recipients[i],active=e>=begin&&e<=finish;
  const progress=clamp((e-begin)/5.8,0,1),pickup=smooth(clamp(progress/.32,0,1)),handoff=smooth(clamp((progress-.32)/.38,0,1));
  if(progress>.32)recipient.userData.arms.forEach((arm,j)=>arm.rotation.set(-1.02,0,j===0?.5:-.5));
  if(i===1&&e>=begin+4.05&&e<begin+6.8){const hop=Math.abs(Math.sin((e-(begin+4.05))*Math.PI*2.15));recipient.position.y=hop*.62;recipient.userData.body.position.y=hop*.1;recipient.userData.arms.forEach((arm,j)=>arm.rotation.set(-2.35,0,j===0?.32:-.32));recipient.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin((e-begin)*Math.PI*2+j*Math.PI)*.42)}
  recipient.updateMatrixWorld(true);
  const leftHand=recipient.userData.arms[0].localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
  const rightHand=recipient.userData.arms[1].localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
  const holdPoint=leftHand.add(rightHand).multiplyScalar(.5).add(new THREE.Vector3(0,-.14,0));
  const sackMouth=g.localToWorld(new THREE.Vector3(0,2.0,-1.2)).clone();
  const santaArm=santaVisit.santa.userData.arms[1];
  if(active&&e<begin+2.4)santaArm.rotation.set(-1.2,0,.28);else santaArm.rotation.set(0,0,0);
  santaVisit.santa.updateMatrixWorld(true);
  const santaHand=santaArm.localToWorld(new THREE.Vector3(0,-.57,.02)).clone();
  const giftStart=sackMouth.clone().lerp(santaHand,pickup);
  gift.visible=e>=begin;gift.position.copy(giftStart.lerp(holdPoint,handoff));
  gift.rotation.set(0,recipient.rotation.y+Math.sin(e*1.2+i)*.012,0);
  if(i!==1&&e>=begin+4.05&&e<begin+4.8)recipient.userData.body.position.y=.08;
  if(e>=begin&&!santaVisit.giftCaptionsShown[i]){const captions=[['A GIFT FOR TWAIN','A little thank-you','For bringing everyone together this Christmas.'],['A GIFT FOR ANTO','For the heart of this village','Your kindness makes this place feel like home. Merry Christmas, Anto.'],['A GIFT FOR VIV','A little something for you','May your winter be as bright as your smile.'],['A GIFT FOR TASS','A little surprise','For all the joy and wonder you bring.'],['A GIFT FOR JORDAN','Something special','Wishing you a warm and wonderful Christmas.']];const [kicker,title,copy]=captions[i];finaleCaption(kicker,title,copy,i===1?5600:4100);santaVisit.giftCaptionsShown[i]=true;santaVisit.lastCaption=3+i}
 });
 if(e>=64){camPos=new THREE.Vector3(13.5,10.5,1.5);look=new THREE.Vector3(0,1.5,-6);if(santaVisit.lastCaption!==8){finaleCaption('A VERY MERRY CHRISTMAS','Presents for everyone!','Santa brought a gift for Twain, Anto, Viv, Tass and Jordan.');santaVisit.lastCaption=8}}
 camera.position.lerp(camPos,Math.min(1,dt*1.15));camera.lookAt(look);
 if(e>70){santaVisit.active=false;santaVisit.done=true;cameraMode='follow';hiddenBells.forEach(b=>b.visible=true);document.body.classList.remove('santa-visit-active');const ui=document.getElementById('treeFinaleOverlay');ui?.classList.remove('show','caption-in');document.getElementById('sceneHint').textContent='SANTA HAS VISITED THE VILLAGE ✦ MERRY CHRISTMAS!';window.dispatchEvent(new CustomEvent('winter-santa-visit-complete'))}
}

// Five golden bells become collectible after Santa's visit.
const hiddenBells=[],bellSpots=[[-23,5],[23,5],[-24,-24],[24,-22],[0,24]];
bellSpots.forEach(([x,z],i)=>{const bell=new THREE.Group();bell.position.set(x,.9,z);bell.userData.baseY=.9;const metal=mat(0xf0c75e,.55,.22);const cup=new THREE.Mesh(new THREE.SphereGeometry(.22,12,9,0,Math.PI*2,0,Math.PI*.72),metal);cup.position.y=-.05;bell.add(cup);const rim=new THREE.Mesh(new THREE.TorusGeometry(.2,.035,7,16),metal);rim.position.y=-.2;bell.add(rim);cylinder(bell,0,.19,0,.045,.045,.12,metal);sphere(bell,0,-.28,0,.055,metal);bell.visible=false;scene.add(bell);hiddenBells.push(bell)});
let bellsFound=0;
function collectGoldenBell(bell){bell.visible=false;bellsFound++;window.dispatchEvent(new CustomEvent('winter-bell-found',{detail:{count:bellsFound}}));if(bellsFound===5){document.getElementById('sceneHint').textContent='ALL FIVE GOLDEN BELLS FOUND ✦ THE VILLAGE IS COMPLETE!';window.dispatchEvent(new CustomEvent('winter-bell-complete'))}}
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
 // Distinct silhouettes keep every villager recognizable at a glance.
 const hairStyle=style.hairStyle||(style.hairLong?'long':'short');
 const addLock=(x,y,z,r,len,rz=0)=>{const m=new THREE.Mesh(new THREE.CapsuleGeometry(r,len,6,10),hair);m.position.set(x,y,z);m.rotation.z=rz;body.add(m);return m};
 const backShell=new THREE.Mesh(new THREE.SphereGeometry(.395,24,18),hair);backShell.scale.set(1.04,1.08,.9);backShell.position.set(0,1.76,-.19);body.add(backShell);
 const crown=new THREE.Mesh(new THREE.SphereGeometry(.405,28,18,0,Math.PI*2,0,Math.PI*.57),hair);crown.position.set(0,2.015,-.055);body.add(crown);
 if(hairStyle==='afro'){
  body.remove(backShell);body.remove(crown);
  const afro=new THREE.Mesh(new THREE.SphereGeometry(.455,32,24),hair);afro.scale.set(1.08,1.02,.94);afro.position.set(0,2.02,-.17);body.add(afro);
  for(const side of [-1,1]){const puff=sphere(body,side*.34,1.72,-.12,.2,hair);puff.scale.set(.95,1.08,.9)}
 }else if(hairStyle==='bob'){
  const back=new THREE.Mesh(new THREE.SphereGeometry(.39,22,16),hair);back.scale.set(1.05,1.16,.95);back.position.set(0,1.72,-.17);body.add(back);
  for(const side of [-1,1]){addLock(side*.34,1.53,.04,.12,.48,side*-.06);sphere(body,side*.34,1.3,.05,.12,hair)}
  const fringe=sphere(body,0,2.015,.285,.2,hair);fringe.scale.set(1.28,.38,.58);
 }else if(hairStyle==='curls'){
  for(let i=0;i<38;i++){const a=i*2.399,r=i<20?.36:.25,y=i<20?2.12:2.29,sz=.078+(i%4)*.014;const curl=sphere(body,Math.cos(a)*r,y+(i%3)*.035,Math.sin(a)*r-.13,sz,hair);curl.scale.set(1,.98,1)}
  for(const side of [-1,1])addLock(side*.35,1.62,-.02,.09,.3,side*-.08);
 }else if(hairStyle==='braids'){
  for(const side of [-1,1]){
   addLock(side*.31,1.79,-.04,.12,.34,side*-.08);
   for(let j=0;j<9;j++){const y=1.55-j*.105,bead=sphere(body,side*(.33+(j%2)*.025),y,.12,.073,hair);bead.scale.set(.95,1.16,.95)}
   sphere(body,side*.34,.63,.12,.075,mat(style.hairTie||0xe8c98c));
  }
  const fringe=sphere(body,0,2.015,.29,.19,hair);fringe.scale.set(1.2,.3,.55);
 }else if(hairStyle==='long'){
  const curtain=new THREE.Mesh(new THREE.SphereGeometry(.34,20,16),hair);curtain.scale.set(1.15,1.42,.55);curtain.position.set(0,1.49,-.22);body.add(curtain);
  for(const side of [-1,1]){addLock(side*.34,1.48,.015,.105,.72,side*-.04);addLock(side*.34,1.38,.17,.075,.62,side*-.04)}
  const fringe=sphere(body,0,2.015,.29,.18,hair);fringe.scale.set(1.15,.28,.55);
 }else{
  for(const side of [-1,1])addLock(side*.35,1.7,.02,.07,.23,side*-.08);
  for(let i=0;i<9;i++){const a=i*2.399,curl=sphere(body,Math.cos(a)*.2,2.1+(i%2)*.035,Math.sin(a)*.2-.12,.068,hair);curl.scale.set(1,.8,1)}
  const fringe=sphere(body,0,2.015,.29,.17,hair);fringe.scale.set(1.15,.25,.52);
 }
 // Small personal accessories make the named villagers readable as different people.
 if(style.accessory==='star-clip'){const clip=new THREE.Mesh(new THREE.OctahedronGeometry(.105,0),mat(0xf2cb70));clip.position.set(.31,1.98,.31);clip.scale.set(1,.72,.35);body.add(clip)}
 else if(style.accessory==='flower-pin'){for(let p=0;p<5;p++){const a=p*Math.PI*2/5,petal=sphere(body,.32+Math.cos(a)*.075,1.91+Math.sin(a)*.075,.34,.052,mat(0xf0c77d));petal.scale.set(1,.8,.55)}sphere(body,.32,1.91,.39,.045,mat(0x9b5147))}
 else if(style.accessory==='earmuffs'){for(const side of [-1,1])sphere(body,side*.385,1.82,.015,.13,mat(0xc45b61));const band=new THREE.Mesh(new THREE.TorusGeometry(.37,.035,6,18,Math.PI),mat(0xe8c98c));band.position.set(0,1.98,0);band.rotation.z=Math.PI;body.add(band)}
 else if(style.accessory==='headband'){const band=new THREE.Mesh(new THREE.TorusGeometry(.35,.035,6,22),mat(0xb34c52));band.position.set(0,1.99,-.015);band.rotation.x=Math.PI/2;body.add(band);sphere(body,0,2.08,.27,.085,mat(0xe8c98c))}
 else if(style.accessory==='glasses'){for(const side of [-1,1]){const lens=new THREE.Mesh(new THREE.TorusGeometry(.105,.022,6,14),mat(0xe5c98c,.5,.3));lens.position.set(side*.125,1.79,.385);body.add(lens)}box(body,0,1.79,.39,.12,.025,.025,mat(0xe5c98c))}
 // Simple eyes only; no beard, moustache, or protruding facial-hair pieces.
 for(const side of [-1,1])sphere(body,side*.125,1.78,.365,.035,boots);
 if(style.hat!==false){const brim=cylinder(body,0,2.49,0,.445,.445,.13,fur);brim.scale.set(1.03,1,1.03);const cap=new THREE.Mesh(new THREE.SphereGeometry(.425,20,14,0,Math.PI*2,0,Math.PI*.56),hat);cap.position.set(0,2.56,-.015);cap.scale.set(1.04,1.02,1.04);body.add(cap);sphere(body,0,2.96,-.025,.105,fur);}
 // Tailored outfit details: no two winter coats have the same silhouette.
 const outfit=style.outfit||'classic';
 if(outfit==='longcoat'){box(body,0,1.06,.44,.62,.88,.13,mat(style.trim||0x283b49));box(body,-.2,.91,.52,.035,.52,.025,zipper);box(body,.2,.91,.52,.035,.52,.025,zipper)}
 else if(outfit==='hoodie'){const hood=new THREE.Mesh(new THREE.TorusGeometry(.29,.12,8,18),coat);hood.position.set(0,1.83,-.19);body.add(hood);for(const x of [-.12,.12])cylinder(body,x,1.17,.49,.018,.018,.38,zipper)}
 else if(outfit==='overalls'){box(body,0,.99,.51,.52,.5,.12,mat(style.trim||0x385a71));for(const x of [-.22,.22]){box(body,x,1.38,.48,.085,.48,.11,mat(style.trim||0x385a71));sphere(body,x,1.54,.55,.045,gold)}}
 else if(outfit==='knit'){for(let j=0;j<3;j++)box(body,0,.82+j*.2,.495,.7,.035,.025,mat(style.trim||0xf0d39b))}
 else if(outfit==='cape'){const cape=new THREE.Mesh(new THREE.ConeGeometry(.58,.72,8),coat);cape.position.set(0,1.14,-.24);cape.rotation.x=Math.PI;cape.scale.z=.65;body.add(cape)}
 else if(outfit==='puffer'){for(let j=0;j<3;j++){const band=new THREE.Mesh(new THREE.TorusGeometry(.43-j*.025,.045,6,18),fur);band.position.y=.82+j*.23;body.add(band)}}
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
const player=character(0x315c71,0x8f4149,.88,{name:'TWAIN',gender:'female',hair:0x342a28,hairStyle:'afro',hat:true,scarf:0xe5c98f,accessory:'star-clip'});player.position.set(0,0,12);scene.add(player);
const friends=[
 {obj:character(0x9b5147,0x315c71,.82,{name:'ANTO',gender:'female',hair:0xd5a04f,hairStyle:'bob',hat:false,outfit:'puffer',trim:0xf0c77d,scarf:0xe8c98c,accessory:'flower-pin'}),center:new THREE.Vector3(-7,0,-12),radius:1.65,speed:.34,phase:0},
 {obj:character(0x477a65,0x9b5147,.8,{name:'VIV',gender:'female',hair:0x302923,hairStyle:'curls',hat:false,outfit:'knit',trim:0xe5d3a9,scarf:0xd9b4a0,accessory:'earmuffs'}),center:new THREE.Vector3(16,0,-14),radius:1.55,speed:.3,phase:2},
 {obj:character(0x78608c,0xb47a38,.75,{name:'TASS',gender:'female',hair:0x8b5836,hairStyle:'braids',hat:false,outfit:'cape',scarf:0xe6d3a1,accessory:'headband'}),center:new THREE.Vector3(-16,0,-13),radius:1.6,speed:.38,phase:4},
 {obj:character(0x3f7185,0x9a5547,.78,{name:'JORDAN',gender:'male',hair:0x382b24,hairStyle:'short',hat:false,outfit:'hoodie',trim:0xe0c58b,scarf:0xe0c58b,accessory:'glasses'}),center:new THREE.Vector3(9,0,-20),radius:1.35,speed:.27,phase:1.2}
];
friends.forEach(f=>scene.add(f.obj));
const townsfolk=[
{obj:character(0xb66b43,0x304c62,.76,{hair:0x3b2925,hairStyle:'long',hat:false,outfit:'hoodie',trim:0x315b70,scarf:0xe5c88d}),route:[[-11,5],[-5,8],[-2,3],[-9,0]],speed:.16,phase:0},
{obj:character(0x426d8a,0x9a4c4c,.72,{hair:0x211b1a,hairStyle:'short',hat:false,outfit:'overalls',trim:0x253e57,scarf:0xd6b77c}),route:[[13,4],[17,8],[11,12],[7,7]],speed:.14,phase:1.4},
{obj:character(0x9a7b48,0x315c71,.78,{hair:0x5b3829,hairStyle:'braids',hat:false,outfit:'knit',trim:0xf0d59a,scarf:0x8eb5a7}),route:[[-22,-17],[-16,-21],[-11,-18],[-16,-13]],speed:.12,phase:2.3},
{obj:character(0x597b66,0x9b5147,.74,{hair:0x2c2422,hairStyle:'curls',hat:false,outfit:'cape',scarf:0xe8c98c}),route:[[19,-20],[24,-16],[20,-12],[15,-16]],speed:.13,phase:.6},
{obj:character(0x805c7e,0x315c71,.7,{hair:0x6b4029,hairStyle:'bob',hat:false,outfit:'puffer',trim:0xe3c7a0,scarf:0xd5a7a0}),route:[[2,18],[8,19],[11,15],[5,13]],speed:.15,phase:3.2},
{obj:character(0x9b5147,0x315c71,.75,{hair:0x34261f,hairStyle:'short',hat:false,outfit:'longcoat',trim:0x4b3a58,scarf:0xc8d8e4}),route:[[-25,15],[-20,19],[-15,15],[-20,11]],speed:.11,phase:4.1}
];townsfolk.forEach(v=>{v.obj.position.set(v.route[0][0],0,v.route[0][1]);scene.add(v.obj)});
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
const wildKittens=[makeAntoCat(),makeAntoCat()];wildKittens.forEach((k,i)=>{k.scale.setScalar(.43);k.visible=false;k.position.set(-5+i*.8,.02,-22);scene.add(k)});
const kittenNest=new THREE.Group();kittenNest.position.set(-5,.02,-22);scene.add(kittenNest);const nestRing=new THREE.Mesh(new THREE.TorusGeometry(.62,.13,8,20),wood);nestRing.rotation.x=Math.PI/2;nestRing.position.y=.22;kittenNest.add(nestRing);for(let i=0;i<4;i++){const blanket=sphere(kittenNest,Math.cos(i*1.57)*.28,.18,Math.sin(i*1.57)*.28,.24,[red,cream,gold,pine2][i]);blanket.scale.y=.18}
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
 if(movementKeys.has(key)||key===' '){keys[key]=true;e.preventDefault();}
 if(key==='e'&&started&&cameraMode==='follow'){const spots=[['cabin',-12,-5],['workshop',12,-10],['tree',0,-13],['rink',28,-8],['clocktower',20,15],['lookout',-27,-5],['kittens',-5,-22]];let nearest=null,best=5.5;spots.forEach(p=>{const d=Math.hypot(player.position.x-p[1],player.position.z-p[2]);if(d<best){best=d;nearest={place:p[0]}}});if(!nearest){const names=['ANTO','VIV','TASS','JORDAN'];friends.forEach((f,i)=>{const d=Math.hypot(player.position.x-f.obj.position.x,player.position.z-f.obj.position.z);if(d<2.8&&(!nearest||d<nearest.distance))nearest={place:'npc',name:names[i],distance:d}})}if(nearest)window.dispatchEvent(new CustomEvent('world-interact',{detail:nearest}))}
});
addEventListener('keyup',e=>{keys[e.key.toLowerCase()]=false;});
addEventListener('blur',releaseControls);
const canvas=renderer.domElement;
canvas.style.touchAction='none';
canvas.style.webkitUserSelect='none';
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0)return;
 if(cameraMode==='miniGame'&&miniGame.mode==='snowball'){throw3DSnowball(e.clientX,e.clientY);return}
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


// Playable 3D festival challenges. Both modes use the actual Three.js world and player character.
const miniGame={mode:null,group:null,obstacles:[],targets:[],projectiles:[],score:0,crashes:0,elapsed:0,last:0,origin:null,playerX:0,playerZ:0,jump:0,jumpVelocity:0,finished:false};
const miniRaycaster=new THREE.Raycaster(),miniPointer=new THREE.Vector2();
function miniStatus(message){window.dispatchEvent(new CustomEvent('winter-minigame-update',{detail:{mode:miniGame.mode,score:miniGame.score,crashes:miniGame.crashes,time:Math.max(0,Math.ceil((miniGame.mode==='sled'?35:30)-miniGame.elapsed)),message}}))}
function clearMiniGame(){
 if(miniGame.group){scene.remove(miniGame.group);miniGame.group.traverse(o=>{o.geometry?.dispose();if(o.material&&!Array.isArray(o.material))o.material.dispose()})}
 miniGame.group=null;miniGame.obstacles=[];miniGame.targets=[];miniGame.projectiles=[];miniGame.mode=null;
}
function endMiniGame(message){
 if(!miniGame.mode||miniGame.finished)return;miniGame.finished=true;
 const mode=miniGame.mode,score=miniGame.score,crashes=miniGame.crashes;
 window.dispatchEvent(new CustomEvent('winter-minigame-finished',{detail:{mode,score,crashes,message}}));
 clearMiniGame();if(miniGame.origin)player.position.copy(miniGame.origin);
 player.position.y=0;cameraMode='follow';releaseControls();
 document.getElementById('sceneHint').textContent='WASD MOVE • ARROWS TURN CAMERA • HOLD SHIFT TO SPRINT • DRAG TO LOOK • E TO INTERACT';
}
function start3DMinigame(mode){
 if(!started||!['sled','snowball'].includes(mode))return;
 releaseControls();clearMiniGame();miniGame.mode=mode;miniGame.score=0;miniGame.crashes=0;miniGame.elapsed=0;miniGame.last=performance.now();miniGame.finished=false;miniGame.origin=player.position.clone();miniGame.group=new THREE.Group();scene.add(miniGame.group);
 if(mode==='sled'){
  miniGame.playerX=0;miniGame.playerZ=18;miniGame.jump=0;miniGame.jumpVelocity=0;
  const track=new THREE.Mesh(new THREE.PlaneGeometry(13,88),mat(0x9db8ba));track.rotation.x=-Math.PI/2;track.position.set(0,.025,-19);miniGame.group.add(track);
  for(const x of [-6.45,6.45]){const rail=box(miniGame.group,x,.28,-19,.24,.5,88,mat(0x45616a));}
  const sled=new THREE.Group();box(sled,0,.22,0,1.35,.18,2.15,mat(0x8f303d));box(sled,0,.34,-.12,.12,.08,2.05,gold);
  for(const x of [-.52,.52]){const runner=cylinder(sled,x,.08,0,.055,.055,2.45,gold);runner.rotation.x=Math.PI/2}
  miniGame.sled=sled;miniGame.group.add(sled);
  for(let i=0;i<16;i++){
   const z=10-i*4.1,lane=[-3.8,0,3.8][(i*7)%3];
   if(i%4===1){const star=new THREE.Mesh(new THREE.OctahedronGeometry(.38,1),gold);star.position.set(lane,1.25,z);miniGame.group.add(star);miniGame.obstacles.push({mesh:star,type:'star',x:lane,z})}
   else{const tree=new THREE.Group();const trunk=cylinder(tree,0,.35,0,.16,.2,.7,wood);for(let k=0;k<3;k++)cone(tree,0,.85+k*.62,0,.82-k*.18,1.3,pine);tree.position.set(lane,0,z);miniGame.group.add(tree);miniGame.obstacles.push({mesh:tree,type:'tree',x:lane,z})}
  }
  const gate=new THREE.Group();for(const x of [-5.5,5.5])cylinder(gate,x,3,-49,.12,.12,6,gold);box(gate,0,5.8,-49,11.2,.18,.18,red);miniGame.group.add(gate);
  player.position.set(0,0,18);player.rotation.y=Math.PI;
  document.getElementById('sceneHint').textContent='SLED RACE • A/D OR ←/→ STEER • SPACE TO JUMP • COLLECT STARS';
 }else{
  player.position.set(0,0,15);player.rotation.y=Math.PI;
  const floor=new THREE.Mesh(new THREE.CircleGeometry(15,48),mat(0x8daeb2));floor.rotation.x=-Math.PI/2;floor.position.set(0,.025,-5);miniGame.group.add(floor);
  for(let i=0;i<8;i++){
   const x=(i%4-1.5)*3.5,z=-5-Math.floor(i/4)*8;
   const stand=cylinder(miniGame.group,x,.8,z,.19,.25,1.6,wood);
   const target=new THREE.Group();target.position.set(x,1.9,z);
   const outer=new THREE.Mesh(new THREE.CylinderGeometry(.72,.72,.16,24),mat(0xf3e9d2));outer.rotation.x=Math.PI/2;target.add(outer);
   const ring=new THREE.Mesh(new THREE.TorusGeometry(.5,.1,8,24),red);ring.position.z=.1;target.add(ring);
   const bull=sphere(target,0,0,.16,.22,gold);bull.userData.hitTarget=true;
   target.userData.bull=bull;miniGame.group.add(target);miniGame.targets.push(target);
  }
  document.getElementById('sceneHint').textContent='SNOWBALL FIGHT • TAP A TARGET TO THROW • HIT AS MANY AS YOU CAN';
 }
 cameraMode='miniGame';miniStatus(mode==='sled'?'Reach the finish and collect the golden stars.':'Hit the moving targets with snowballs.');
}
window.start3DMinigame=start3DMinigame;
window.stop3DMinigame=()=>endMiniGame('Challenge ended.');
window.throw3DSnowball=(clientX,clientY)=>{
 if(miniGame.mode!=='snowball'||miniGame.finished)return;
 const rect=renderer.domElement.getBoundingClientRect();miniPointer.x=(clientX-rect.left)/rect.width*2-1;miniPointer.y=-(clientY-rect.top)/rect.height*2+1;
 miniRaycaster.setFromCamera(miniPointer,camera);
 const direction=miniRaycaster.ray.direction.clone().normalize(),ball=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),snowMat);
 ball.position.set(player.position.x,1.45,player.position.z-.35);miniGame.group.add(ball);miniGame.projectiles.push({mesh:ball,velocity:direction.multiplyScalar(24).add(new THREE.Vector3(0,1.2,0)),life:2.2});
};
function updateMiniGame(now,dt,t){
 if(!miniGame.mode)return;
 miniGame.elapsed+=(now-miniGame.last)/1000;miniGame.last=now;
 if(miniGame.mode==='sled'){
  const steer=(keys.a||keys.arrowleft?-1:0)+(keys.d||keys.arrowright?1:0);
  miniGame.playerX=THREE.MathUtils.clamp(miniGame.playerX+steer*dt*8,-5.1,5.1);
  if(keys[' ']&&miniGame.jump<=.02)miniGame.jumpVelocity=5.8;
  miniGame.jumpVelocity-=17*dt;miniGame.jump=Math.max(0,miniGame.jump+miniGame.jumpVelocity*dt);if(miniGame.jump===0)miniGame.jumpVelocity=0;
  miniGame.playerZ-=dt*8.4;player.position.set(miniGame.playerX,miniGame.jump,miniGame.playerZ);player.rotation.y=Math.PI+steer*.12;
  miniGame.sled.position.set(miniGame.playerX,miniGame.jump*.55,miniGame.playerZ+.25);
  miniGame.obstacles.forEach(o=>{if(o.mesh.userData.passed)return;if(o.type==='star'&&Math.abs(o.z-miniGame.playerZ)<.9&&Math.abs(o.x-miniGame.playerX)<1){o.mesh.visible=false;o.mesh.userData.passed=true;miniGame.score++;miniStatus('Golden star collected!');}
   else if(o.type==='tree'&&Math.abs(o.z-miniGame.playerZ)<.8&&Math.abs(o.x-miniGame.playerX)<1.15&&miniGame.jump<.65){o.mesh.userData.passed=true;miniGame.crashes++;miniGame.playerZ+=.8;miniStatus('You clipped a tree!');}
   else if(o.z-miniGame.playerZ>1.8)o.mesh.userData.passed=true;
  });
  if(miniGame.playerZ<=-49){endMiniGame('You crossed the finish line!');return}
  if(miniGame.crashes>=3){endMiniGame('Three crashes! Try the course again.');return}
  const cam=new THREE.Vector3(player.position.x,player.position.y+5.4,player.position.z+9.5);camera.position.lerp(cam,.16);camera.lookAt(player.position.x,player.position.y+1,-(miniGame.playerZ<0?Math.min(49,-miniGame.playerZ+7):7));
  player.userData.legs.forEach((l,i)=>l.rotation.x=Math.sin(t*15+i*Math.PI)*.18);
  if(miniGame.elapsed>=35){endMiniGame('Time is up!');return}
 }else{
  miniGame.targets.forEach((target,i)=>{target.position.y=1.9+Math.sin(t*2.3+i)*.24;target.rotation.y=Math.sin(t*1.4+i)*.18});
  for(let i=miniGame.projectiles.length-1;i>=0;i--){const p=miniGame.projectiles[i];p.velocity.y-=8*dt;p.mesh.position.addScaledVector(p.velocity,dt);p.life-=dt;let hit=-1;
   miniGame.targets.forEach((target,j)=>{if(target.visible&&p.mesh.position.distanceTo(target.position.clone().add(new THREE.Vector3(0,0,.15)))<.82)hit=j});
   if(hit>=0){miniGame.targets[hit].visible=false;miniGame.score++;miniGame.group.remove(p.mesh);miniGame.projectiles.splice(i,1);miniStatus('Bullseye!');continue}
   if(p.life<=0||p.mesh.position.y<0){miniGame.group.remove(p.mesh);miniGame.projectiles.splice(i,1);miniGame.crashes++}
  }
  const cam=new THREE.Vector3(0,6.5,24);camera.position.lerp(cam,.12);camera.lookAt(0,1,-8);
  if(miniGame.targets.every(x=>!x.visible)){endMiniGame('Every target cleared!');return}
  if(miniGame.elapsed>=30){endMiniGame('Time is up!');return}
 }
 miniStatus();
}

let lastRender=0;const targetFrame=1000/(lowEndDevice?30:60);function animate(now=0){requestAnimationFrame(animate);if(document.visibilityState!=='visible'||now-lastRender<targetFrame)return;const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
hiddenGifts.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*.8;g.position.y=g.userData.baseY+Math.sin(t*2.1+i)*.1;if(started&&player.position.distanceTo(g.position)<1.45)collectGift(g)});
hiddenSnowflakes.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*(.75+i*.025);g.position.y=g.userData.baseY+Math.sin(t*2.4+i)*.13;if(treeFinale.done&&player.position.distanceTo(g.position)<1.35)collectSnowflake(g)});
hiddenBells.forEach((b,i)=>{if(!b.visible)return;b.rotation.y+=dt*.8;b.position.y=b.userData.baseY+Math.sin(t*2.8+i)*.12;if(santaVisit.done&&player.position.distanceTo(b.position)<1.5)collectGoldenBell(b)});
const pos=snowParticles.attributes.position.array;for(let i=0;i<count;i++){pos[i*3+1]-=velocities[i];pos[i*3]+=Math.sin(t*.5+i)*.002;if(pos[i*3+1]<0){pos[i*3+1]=34;pos[i*3]=(Math.random()-.5)*90}}snowParticles.attributes.position.needsUpdate=true;
if(!treeFinale.active&&cameraMode!=='santaVisit'){
 friends.forEach((f,i)=>{
  const a=t*f.speed+f.phase;let x=f.center.x+Math.cos(a)*f.radius,z=f.center.z+Math.sin(a)*f.radius;
  if(i===1){const skate=t*.34+f.phase;x=28+Math.cos(skate)*4.35;z=-8+Math.sin(skate)*2.35;f.obj.userData.arms[0].rotation.z=-.72;f.obj.userData.arms[1].rotation.z=.72;}
  if(i===0){const cycle=(t+9)%54;if(cycle>17&&cycle<39){const q=cycle<25?(cycle-17)/8:cycle<31?1:1-(cycle-31)/8,sm=q*q*(3-2*q);x=THREE.MathUtils.lerp(x,-5,sm);z=THREE.MathUtils.lerp(z,-22,sm);f.obj.userData.body.position.x=cycle>24&&cycle<34?.08:0;if(cycle>23&&cycle<36)wildKittens.forEach((k,j)=>{k.visible=true;k.position.set(-5+(j-.5)*.8,.02+Math.abs(Math.sin(t*5+j))*.07,-21.2);k.rotation.y=Math.sin(t*1.8+j)*.25;k.userData.legs.forEach((leg,n)=>leg.rotation.x=Math.sin(t*7+j+n*Math.PI)*.2)})}}
  if(!hitsHouse(x,z,.62)){f.obj.position.set(x,Math.abs(Math.sin(t*f.speed*f.radius*5+i))*.035,z);f.obj.rotation.y=i===1?Math.atan2(-Math.sin(t*.34+f.phase),Math.cos(t*.34+f.phase)):(i===0&&((t+9)%54)>17&&((t+9)%54)<39?Math.atan2(-5-x,-22-z):-a)}
  const gait=t*f.speed*f.radius*5+i;
  f.obj.userData.legs.forEach((leg,j)=>leg.rotation.x=i===1?Math.sin(t*4+j*Math.PI)*.18:Math.sin(gait+j*Math.PI)*.58);
  f.obj.userData.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(gait+j*Math.PI+Math.PI)*.34);
  f.obj.userData.body.position.y=Math.abs(Math.sin(gait*2))*.035;
 });
 townsfolk.forEach((v,i)=>{const p=v.route,phase=(t*v.speed+v.phase)%p.length,idx=Math.floor(phase),q=phase-idx,a=p[idx],b=p[(idx+1)%p.length],x=THREE.MathUtils.lerp(a[0],b[0],q),z=THREE.MathUtils.lerp(a[1],b[1],q);v.obj.position.set(x,Math.abs(Math.sin(t*5+i))*.025,z);v.obj.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);const gait=t*5+i;v.obj.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(gait+j*Math.PI)*.38);v.obj.userData.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(gait+j*Math.PI+Math.PI)*.2)});
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
if(cameraMode==='miniGame'){updateMiniGame(now,dt,t)}else if(cameraMode==='treeFinale'){updateTreeFinale(now,dt)}else if(cameraMode==='santaVisit'){updateSantaVisit(now,dt)}else if(cameraMode==='cinema'){const elapsed=(performance.now()-cinemaStart)/1000;const segment=Math.min(Math.floor(elapsed/2.7),cinematicShots.length-1),q=Math.min((elapsed-segment*2.7)/2.7,1),smooth=q*q*(3-2*q),from=cinematicShots[segment],to=cinematicShots[Math.min(segment+1,cinematicShots.length-1)];camera.position.lerpVectors(from.p,to.p,smooth);cinemaLook.lerpVectors(from.l,to.l,smooth);camera.lookAt(cinemaLook);if(elapsed>=cinematicShots.length*2.7){cameraMode='follow';}}
else if(cameraMode==='treeStudio'){const studioDistance=mobileDevice?10.5:9.5;desiredCamera.set(Math.sin(yaw)*studioDistance,4.5+pitch*2.4,-13+Math.cos(yaw)*studioDistance);camera.position.lerp(desiredCamera,.12);camera.lookAt(0,3,-13)}
else if(cameraMode==='focus'){const q=Math.min((performance.now()-focusStart)/1300,1),s=q*q*(3-2*q);camera.position.lerpVectors(focusFrom,focusTo,s);camera.lookAt(focusLook);if(q>=1)cameraMode='follow'}
else{desiredCamera.set(player.position.x+Math.sin(yaw)*11,player.position.y+7+pitch*5,player.position.z+Math.cos(yaw)*11);camera.position.lerp(desiredCamera,1-Math.pow(.001,dt));lookTarget.set(player.position.x,1.5,player.position.z);cameraTarget.lerp(lookTarget,.08);camera.lookAt(cameraTarget)}
renderer.render(scene,camera);lastRender=now}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,lowEndDevice?.75:mobileDevice?.95:1.2))});
document.getElementById('sceneLoading').classList.add('done');

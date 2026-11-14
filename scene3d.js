import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const host=document.getElementById('three-stage');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x081827);
scene.fog=new THREE.FogExp2(0x9bb9c5,0.012);
const camera=new THREE.PerspectiveCamera(52,innerWidth/innerHeight,.1,500);
camera.position.set(0,24,42);
const mobileDevice=matchMedia('(max-width: 700px)').matches;
const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,mobileDevice?0.9:1.2));
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

function box(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,x,y,z,r,material){const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cone(parent,x,y,z,r,h,material){const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,9),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,x,y,z,r1,r2,h,material){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
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
function makeTree(x,z,size=1,decorated=false){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,.48*size,0,.17*size,.22*size,.95*size,wood);for(let i=0;i<3;i++){const h=(1.55-i*.18)*size;cone(g,0,(.9+i*.47)*size,0,(.86-i*.13)*size,h,i===0?pine:pine2)}if(decorated){sphere(g,0,2.42*size,0,.13*size,gold);for(let i=0;i<13;i++){const a=i*2.4,y=(.8+(i%5)*.29)*size,r=(.66-(i%5)*.08)*size;sphere(g,Math.cos(a)*r,y,Math.sin(a)*r,.055*size,[gold,red,cream][i%3])}}return g}
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
 let outer=0;
 for(let i=0;i<3;i++){const h=1.55-i*.18,base=.9+i*.47-h/2,r=.86-i*.13;if(y>=base&&y<=base+h)outer=Math.max(outer,r*(1-(y-base)/h))}
 return outer;
}
function buildTreeDecoration(type,color,index){
 const material=new THREE.MeshStandardMaterial({color,metalness:.18,roughness:.3,emissive:new THREE.Color(color),emissiveIntensity:.2});
 const y=.48+(index%6)*.34,angle=index*2.399,radius=treeSurfaceRadius(y)+.075;
 if(type==='ornament'){
  const g=new THREE.Group();g.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.12,12,10),material);ball.userData.ownedMaterial=true;g.add(ball);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.065,8),gold);cap.position.y=.135;g.add(cap);
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='lights'){
  const g=new THREE.Group();
  for(let i=0;i<64;i++){const q=i/63,ly=.36+q*2.05,a=q*Math.PI*9+index*.5,r=treeSurfaceRadius(ly)+.09;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.045,7,6),material);bulb.position.set(Math.cos(a)*r,ly,Math.sin(a)*r);bulb.userData.ownedMaterial=true;g.add(bulb)}
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='ribbon'){
  const points=[];for(let i=0;i<=100;i++){const q=i/100,ly=.34+q*2.08,a=q*Math.PI*8+index*.25,r=treeSurfaceRadius(ly)+.065;points.push(new THREE.Vector3(Math.cos(a)*r,ly,Math.sin(a)*r))}
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,.045,6,false),material);mesh.userData.ownedMaterial=true;treeDecorations.push(mesh);grandTree.add(mesh);
 }else if(type==='star'){
  const g=new THREE.Group();g.position.set(0,2.55,0);const star=new THREE.Mesh(new THREE.OctahedronGeometry(.29,1),material);star.scale.set(1,1.3,.38);star.userData.ownedMaterial=true;g.add(star);treeDecorations.push(g);grandTree.add(g);
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
window.openTreeStudio=()=>{document.getElementById('treeStudio').classList.add('open');document.getElementById('treeStudio').setAttribute('aria-hidden','false');cameraMode='treeStudio';yaw=0;pitch=.15;camera.position.set(0,4.6,-4.2);camera.lookAt(0,3,-13);};
window.closeTreeStudio=()=>{document.getElementById('treeStudio').classList.remove('open');document.getElementById('treeStudio').setAttribute('aria-hidden','true');cameraMode='follow';};

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
// Presents are placed in three tidy pairs along the village route, not scattered randomly.
[[-5,9,0x9e4547],[-3.9,9,0x236052],[4,-3,0x315c71],[5.1,-3,0x9e4547],[-5,-23,0x78608c],[-3.9,-23,0x236052]].forEach(p=>placeCollectibleGift(p[0],p[1],p[2]));
let giftsFound=0;
function beginTreeFinale(){if(treeFinale.active||treeFinale.done)return;treeFinale.active=true;treeFinale.started=performance.now();document.body.classList.add('finale-active');cameraMode='treeFinale';keys={};drag=false;document.getElementById('treeStudio')?.classList.remove('open');document.getElementById('treeStudio')?.setAttribute('aria-hidden','true');const ui=document.getElementById('treeFinaleOverlay');if(ui){ui.classList.add('show');ui.querySelector('.finale-kicker').textContent='THE LAST PRESENT';ui.querySelector('.finale-title').textContent='One last little wonder…';ui.querySelector('.finale-copy').textContent='The village is waiting for its brightest star.'}}
const treeFinale={active:false,done:false,started:0,star:null,light:null,glow:null,particles:[],lastCaption:-1};
const finaleOverlay=document.createElement('div');finaleOverlay.id='treeFinaleOverlay';finaleOverlay.innerHTML='<div class="finale-vignette"></div><div class="finale-caption"><div class="finale-kicker">A CHRISTMAS PROMISE</div><h2 class="finale-title">One last little wonder…</h2><p class="finale-copy">The village is waiting for its brightest star.</p><div class="finale-rule"><i></i> ✦ <i></i></div></div><div class="finale-bottom">TWAIN’S CHRISTMAS · A MOMENT TO REMEMBER</div>';document.body.appendChild(finaleOverlay);
function makeFinaleStar(){const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2===0?.58:.26,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y)}shape.closePath();const geo=new THREE.ExtrudeGeometry(shape,{depth:.12,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.045,bevelThickness:.035});const material=new THREE.MeshStandardMaterial({color:0xffdf8a,emissive:0xffb52e,emissiveIntensity:1.2,metalness:.35,roughness:.22});const star=new THREE.Mesh(geo,material);star.rotation.y=Math.PI;star.scale.setScalar(.85);scene.add(star);return star}
function finaleCaption(kicker,title,copy){const ui=document.getElementById('treeFinaleOverlay');if(!ui)return;ui.classList.remove('caption-in');void ui.offsetWidth;ui.querySelector('.finale-kicker').textContent=kicker;ui.querySelector('.finale-title').textContent=title;ui.querySelector('.finale-copy').textContent=copy;ui.classList.add('caption-in')}
function updateTreeFinale(now){if(!treeFinale.active)return;const e=(now-treeFinale.started)/1000,playerStart=new THREE.Vector3(-3.4,0,-8.3),friendStart=new THREE.Vector3(3.4,0,-8.3),treeZ=-13;let climb=THREE.MathUtils.clamp((e-5.2)/4.5,0,1);const smooth=v=>v*v*(3-2*v);const cs=smooth(climb);
if(e<5.2){const q=smooth(THREE.MathUtils.clamp((e-1.7)/3.5,0,1));player.position.lerpVectors(playerStart,new THREE.Vector3(-.72,0,treeZ+1.1),q);friends[0].obj.position.lerpVectors(friendStart,new THREE.Vector3(.72,0,treeZ+1.1),q);player.rotation.y=0;friends[0].obj.rotation.y=0}
else{const angle=cs*Math.PI*1.25;player.position.set(-Math.cos(angle)*(.78-cs*.22),cs*5.05,treeZ+Math.sin(angle)*(.78-cs*.22));friends[0].obj.position.set(Math.cos(angle+Math.PI)*(.78-cs*.22),cs*5.05,treeZ+Math.sin(angle+Math.PI)*(.78-cs*.22));player.rotation.y=-angle;friends[0].obj.rotation.y=-angle-Math.PI}
[player,friends[0].obj].forEach((ch,i)=>{const gait=e<5.2?e*7:e*9;ch.userData.legs.forEach((leg,j)=>leg.rotation.x=e<9.8?Math.sin(gait+j*Math.PI)*.72:0);ch.userData.arms.forEach((arm,j)=>arm.rotation.x=e>9.1?-1.9:Math.sin(gait+j*Math.PI+Math.PI)*.48);ch.userData.body.position.y=e>9.1?Math.sin(e*5)*.04:Math.abs(Math.sin(gait*2))*.05});
if(e>9.6&&!treeFinale.star){treeFinale.star=makeFinaleStar();treeFinale.star.position.set(player.position.x,player.position.y+1.6,player.position.z+.2)}
if(treeFinale.star){const q=THREE.MathUtils.clamp((e-10.2)/2.4,0,1),v=smooth(q);treeFinale.star.position.lerpVectors(new THREE.Vector3(-.25,5.9,treeZ+.55),new THREE.Vector3(0,6.05,treeZ),v);treeFinale.star.rotation.z=Math.sin(e*2)*.08;if(q>=1){treeFinale.star.rotation.z=0;if(!treeFinale.light){treeFinale.light=new THREE.PointLight(0xffd47a,0,25);treeFinale.light.position.set(0,6.2,treeZ);scene.add(treeFinale.light);treeFinale.glow=new THREE.Mesh(new THREE.SphereGeometry(.4,12,10),new THREE.MeshBasicMaterial({color:0xffe5a6,transparent:true,opacity:.0}));treeFinale.glow.position.set(0,6,treeZ);scene.add(treeFinale.glow)}}}
if(treeFinale.light){const power=THREE.MathUtils.clamp((e-12.4)/1.8,0,1);treeFinale.light.intensity=power*95;treeFinale.glow.material.opacity=power*.24;grandTree.traverse(o=>{if(o.isMesh&&o.material&&o.material.emissive)o.material.emissiveIntensity=Math.max(o.material.emissiveIntensity||0,power*.28)})}
if(e>13&&e<16.8){for(let i=0;i<2;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.045,6,6),new THREE.MeshBasicMaterial({color:i%2?0xffe4a0:0xd8f5f0}));const a=Math.random()*Math.PI*2,r=1+Math.random()*2.2;p.position.set(Math.cos(a)*r,3+Math.random()*4,treeZ+Math.sin(a)*r);p.userData.velocity=new THREE.Vector3(-p.position.x*.25,.8+Math.random(),(treeZ-p.position.z)*.25);scene.add(p);treeFinale.particles.push(p)}}
treeFinale.particles.forEach(p=>{p.position.addScaledVector(p.userData.velocity,.035);p.material.opacity=Math.max(0,p.material.opacity-.008);p.scale.multiplyScalar(.985)});treeFinale.particles=treeFinale.particles.filter(p=>{if(p.material.opacity<=.01){scene.remove(p);p.geometry.dispose();p.material.dispose();return false}return true});
const camP=e<5.2?new THREE.Vector3(0,8.5,treeZ+17):e<10?new THREE.Vector3(9,8,treeZ+11):e<14?new THREE.Vector3(5,7.4,treeZ+10):new THREE.Vector3(0,10,treeZ+16);const look=e<10?new THREE.Vector3(0,2.8,treeZ):new THREE.Vector3(0,3.3,treeZ);camera.position.lerp(camP,.035);camera.lookAt(look);
if(e<1.8&&treeFinale.lastCaption!==0){finaleCaption('A CHRISTMAS PROMISE','One last little wonder…','The village is waiting for its brightest star.');treeFinale.lastCaption=0}
if(e>4.8&&treeFinale.lastCaption!==1){finaleCaption('TOGETHER','A little higher…','Some things are better when you reach them together.');treeFinale.lastCaption=1}
if(e>9.6&&treeFinale.lastCaption!==2){finaleCaption('THE FINAL TOUCH','For the top of our tree.','A little light for this little world.');treeFinale.lastCaption=2}
if(e>13&&treeFinale.lastCaption!==3){finaleCaption('THE WISHING TREE','Look how it shines.','And just like that, Christmas feels a little more magical.');treeFinale.lastCaption=3}
if(e>19.5){treeFinale.active=false;treeFinale.done=true;document.body.classList.remove('finale-active');cameraMode='follow';player.position.set(-1.4,0,-7.8);friends[0].obj.position.set(1.4,0,-7.8);player.rotation.y=0;friends[0].obj.rotation.y=0;const ui=document.getElementById('treeFinaleOverlay');ui?.classList.remove('show','caption-in');document.getElementById('sceneHint').textContent='THE WISHING TREE IS COMPLETE ✦ MERRY CHRISTMAS';}
}
function collectGift(g){
 g.visible=false;giftsFound++;window.dispatchEvent(new CustomEvent('winter-gift-found',{detail:{count:giftsFound}}));
 const label=document.getElementById('giftCount');if(label)label.textContent=giftsFound+' / 6 PRESENTS FOUND';
 if(giftsFound===6){beginTreeFinale();const q=document.querySelector('#giftQuest span');if(q)q.textContent='✦ DELIVERY COMPLETE';const hint=document.getElementById('sceneHint');if(hint)hint.textContent='ALL SIX PRESENTS DELIVERED — MERRY CHRISTMAS!'}
}

// Build a friendly low-poly character from actual 3D meshes
function character(coatColor,hatColor,scale=1){
 const root=new THREE.Group(),coat=mat(coatColor),hat=mat(hatColor),skin=mat(0xe6b99a),boots=mat(0x352d32),scarf=mat(0xf1d18e);
 const body=new THREE.Group();root.add(body);
 cylinder(body,0,1.08,0,.42,.48,.95,coat);sphere(body,0,1.72,0,.39,skin);sphere(body,0,2.09,0,.43,hat);cone(body,0,2.52,0,.33,.58,hat);sphere(body,0,2.83,0,.12,cream);
 box(body,0,1.58,.34,.7,.16,.12,scarf);
 const legs=[],arms=[];
 for(const side of [-1,1]){
  const legPivot=new THREE.Group();legPivot.position.set(side*.2,.68,0);body.add(legPivot);
  cylinder(legPivot,0,-.28,0,.15,.17,.58,boots);box(legPivot,0,-.57,.13,.3,.2,.46,boots);legs.push(legPivot);
  const armPivot=new THREE.Group();armPivot.position.set(side*.43,1.48,0);body.add(armPivot);
  const arm=cylinder(armPivot,0,-.24,0,.13,.15,.56,coat);arm.rotation.z=side*-.16;
  sphere(armPivot,0,-.53,.02,.13,skin);arms.push(armPivot);
  sphere(body,side*.14,1.79,.34,.045,boots);
 }
 root.userData.body=body;root.userData.legs=legs;root.userData.arms=arms;root.scale.setScalar(scale);return root;
}
const player=character(0x315c71,0x8f4149,1.05);player.position.set(0,0,12);scene.add(player);
const friends=[{obj:character(0x9b5147,0x315c71,.82),center:new THREE.Vector3(-11,0,-7),radius:2.4,speed:.48,phase:0},{obj:character(0x477a65,0x9b5147,.8),center:new THREE.Vector3(11,0,-12),radius:2.5,speed:.4,phase:2},{obj:character(0x78608c,0xb47a38,.75),center:new THREE.Vector3(3,0,-19),radius:2.2,speed:.55,phase:4}];
friends.forEach(f=>scene.add(f.obj));
const snowParticles=new THREE.BufferGeometry(),count=mobileDevice?130:240,positions=new Float32Array(count*3),velocities=[];for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*90;positions[i*3+1]=Math.random()*34;positions[i*3+2]=(Math.random()-.5)*90;velocities.push(.025+Math.random()*.08)}snowParticles.setAttribute('position',new THREE.BufferAttribute(positions,3));const snowPoints=new THREE.Points(snowParticles,new THREE.PointsMaterial({color:0xffffff,size:.14,transparent:true,opacity:.86}));scene.add(snowPoints);

let keys={},yaw=0,pitch=.18,drag=false,lastX=0,lastY=0,started=false,cinema=true,clock=new THREE.Clock(),cameraMode='follow',cameraTarget=new THREE.Vector3(0,1,0),introStart=performance.now();
const forward=new THREE.Vector3(),right=new THREE.Vector3(),move=new THREE.Vector3(),sideMove=new THREE.Vector3(),desiredCamera=new THREE.Vector3(),lookTarget=new THREE.Vector3(),cinemaLook=new THREE.Vector3();
const cinematicShots=[{p:new THREE.Vector3(0,19,39),l:new THREE.Vector3(0,2,-5)},{p:new THREE.Vector3(20,12,3),l:new THREE.Vector3(0,3,-13)},{p:new THREE.Vector3(-20,10,-1),l:new THREE.Vector3(-7,2,-5)},{p:new THREE.Vector3(0,23,-35),l:new THREE.Vector3(0,2,-7)},{p:new THREE.Vector3(0,13,24),l:new THREE.Vector3(0,2,-13)}];
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key.toLowerCase()==='e'&&started&&cameraMode==='follow'){const spots=[['cabin',-12,-5],['workshop',12,-10],['tree',0,-13]];let nearest=null,best=5.5;spots.forEach(p=>{const d=Math.hypot(player.position.x-p[1],player.position.z-p[2]);if(d<best){best=d;nearest=p[0]}});if(nearest)window.dispatchEvent(new CustomEvent('world-interact',{detail:{place:nearest}}))}});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
renderer.domElement.addEventListener('pointerdown',e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(!drag||!started)return;yaw-=(e.clientX-lastX)*.006;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.15,.8);lastX=e.clientX;lastY=e.clientY});
renderer.domElement.addEventListener('pointerup',()=>drag=false);renderer.domElement.addEventListener('pointercancel',()=>drag=false);
document.querySelectorAll('[data-move]').forEach(btn=>{const k={forward:'w',back:'s',left:'a',right:'d'}[btn.dataset.move];btn.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true});['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev,()=>keys[k]=false))});
function cinematic(){cameraMode='cinema';cinema=true;cinemaStart=performance.now()}
let cinemaStart=performance.now();
function focusOn(place){const p=place==='cabin'?new THREE.Vector3(-12,2,-5):place==='workshop'?new THREE.Vector3(12,2,-10):new THREE.Vector3(0,3,-13);cameraMode='focus';focusStart=performance.now();focusFrom=camera.position.clone();focusTo=p.clone().add(new THREE.Vector3(0,9,13));focusLook=p}
let focusStart=0,focusFrom=new THREE.Vector3(),focusTo=new THREE.Vector3(),focusLook=new THREE.Vector3();
document.getElementById('cinematicBtn').addEventListener('click',cinematic);
document.getElementById('enterWorld').addEventListener('click',()=>{started=true;document.getElementById('introScreen').classList.add('leave');cameraMode='cinema';cinemaStart=performance.now();document.getElementById('sceneHint').textContent='WASD / ARROWS MOVE  •  DRAG TO LOOK  •  E TO INTERACT  •  FIND 6 PRESENTS'});
document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.place!=='tree')focusOn(b.dataset.place)}));
document.getElementById('modeBtn').addEventListener('click',()=>{const day=scene.background.getHex()===0x081827;scene.background.set(day?new THREE.Color(0x9bc6d1):new THREE.Color(0x081827));scene.fog.color.set(day?0xa8d0d4:0x9bb9c5);moon.intensity=day?1.15:2.5;warm.intensity=day?20:65});

let lastRender=0;function animate(now=0){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
hiddenGifts.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*.8;g.position.y=g.userData.baseY+Math.sin(t*2.1+i)*.1;if(started&&player.position.distanceTo(g.position)<1.45)collectGift(g)});
const pos=snowParticles.attributes.position.array;for(let i=0;i<count;i++){pos[i*3+1]-=velocities[i];pos[i*3]+=Math.sin(t*.5+i)*.002;if(pos[i*3+1]<0){pos[i*3+1]=34;pos[i*3]=(Math.random()-.5)*90}}snowParticles.attributes.position.needsUpdate=true;
if(!treeFinale.active){friends.forEach((f,i)=>{const a=t*f.speed+f.phase;f.obj.position.set(f.center.x+Math.cos(a)*f.radius,Math.abs(Math.sin(t*f.speed*f.radius*5+i))*.035,f.center.z+Math.sin(a)*f.radius);f.obj.rotation.y=-a;const gait=t*f.speed*f.radius*5+i;f.obj.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(gait+j*Math.PI)*.58);f.obj.userData.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(gait+j*Math.PI+Math.PI)*.34);f.obj.userData.body.position.y=Math.abs(Math.sin(gait*2))*.035});}
const moving=keys.w||keys.s||keys.a||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright;player.userData.legs.forEach((leg,j)=>leg.rotation.x=moving?Math.sin(t*13+j*Math.PI)*.62:0);player.userData.arms.forEach((arm,j)=>arm.rotation.x=moving?Math.sin(t*13+j*Math.PI+Math.PI)*.4:0);player.userData.body.position.y=moving?Math.abs(Math.sin(t*13*2))*.045:0;
if(started&&cameraMode==='follow'){forward.set(-Math.sin(yaw),0,-Math.cos(yaw));sideMove.set(Math.cos(yaw),0,-Math.sin(yaw));move.set(0,0,0);if(keys.w||keys.arrowup)move.add(forward);if(keys.s||keys.arrowdown)move.sub(forward);if(keys.a||keys.arrowleft)move.sub(sideMove);if(keys.d||keys.arrowright)move.add(sideMove);if(move.lengthSq()>0){move.normalize();const step=move.clone().multiplyScalar(dt*5.2),nx=player.position.x+step.x,nz=player.position.z+step.z;const blocked=solidObstacles.some(o=>Math.abs(nx-o.x)<o.hx+.48&&Math.abs(nz-o.z)<o.hz+.48);if(!blocked){player.position.x=THREE.MathUtils.clamp(nx,-31,31);player.position.z=THREE.MathUtils.clamp(nz,-32,27)}else{const xBlocked=solidObstacles.some(o=>Math.abs(nx-o.x)<o.hx+.48&&Math.abs(player.position.z-o.z)<o.hz+.48),zBlocked=solidObstacles.some(o=>Math.abs(player.position.x-o.x)<o.hx+.48&&Math.abs(nz-o.z)<o.hz+.48);if(!xBlocked)player.position.x=THREE.MathUtils.clamp(nx,-31,31);if(!zBlocked)player.position.z=THREE.MathUtils.clamp(nz,-32,27)}player.rotation.y=Math.atan2(move.x,move.z);}}
if(cameraMode==='treeFinale'){updateTreeFinale(now)}else if(cameraMode==='cinema'){const elapsed=(performance.now()-cinemaStart)/1000;const segment=Math.min(Math.floor(elapsed/2.7),cinematicShots.length-1),q=Math.min((elapsed-segment*2.7)/2.7,1),smooth=q*q*(3-2*q),from=cinematicShots[segment],to=cinematicShots[Math.min(segment+1,cinematicShots.length-1)];camera.position.lerpVectors(from.p,to.p,smooth);cinemaLook.lerpVectors(from.l,to.l,smooth);camera.lookAt(cinemaLook);if(elapsed>=cinematicShots.length*2.7){cameraMode='follow';}}
else if(cameraMode==='treeStudio'){const studioDistance=mobileDevice?10.5:9.5;desiredCamera.set(Math.sin(yaw)*studioDistance,4.5+pitch*2.4,-13+Math.cos(yaw)*studioDistance);camera.position.lerp(desiredCamera,.12);camera.lookAt(0,3,-13)}
else if(cameraMode==='focus'){const q=Math.min((performance.now()-focusStart)/1300,1),s=q*q*(3-2*q);camera.position.lerpVectors(focusFrom,focusTo,s);camera.lookAt(focusLook);if(q>=1)cameraMode='follow'}
else{desiredCamera.set(player.position.x+Math.sin(yaw)*11,player.position.y+7+pitch*5,player.position.z+Math.cos(yaw)*11);camera.position.lerp(desiredCamera,1-Math.pow(.001,dt));lookTarget.set(player.position.x,1.5,player.position.z);cameraTarget.lerp(lookTarget,.08);camera.lookAt(cameraTarget)}
const targetFrame=mobileDevice?1000/30:1000/40;if(now-lastRender>=targetFrame){renderer.render(scene,camera);lastRender=now}}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobileDevice?0.9:1.2))});
document.getElementById('sceneLoading').classList.add('done');

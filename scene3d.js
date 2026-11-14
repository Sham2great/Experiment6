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
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),mat(0xdde9e8));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;ground.receiveShadow=true;scene.add(ground);
const floor=new THREE.Mesh(new THREE.CircleGeometry(48,96),mat(0xf5f7f1));floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
function box(parent,x,y,z,sx,sy,sz,material){const o=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function sphere(parent,x,y,z,r,material){const o=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cone(parent,x,y,z,r,h,material){const o=new THREE.Mesh(new THREE.ConeGeometry(r,h,9),material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,x,y,z,r1,r2,h,material){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
function makeTree(x,z,size=1,decorated=false){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);cylinder(g,0,.48*size,0,.17*size,.22*size,.95*size,wood);for(let i=0;i<3;i++){const h=(1.55-i*.18)*size;cone(g,0,(.9+i*.47)*size,0,(.86-i*.13)*size,h,i===0?pine:pine2)}if(decorated){sphere(g,0,2.42*size,0,.13*size,gold);for(let i=0;i<13;i++){const a=i*2.4,y=(.8+(i%5)*.29)*size,r=(.66-(i%5)*.08)*size;sphere(g,Math.cos(a)*r,y,Math.sin(a)*r,.055*size,[gold,red,cream][i%3])}}return g}
const solidObstacles=[];
function house(x,z,scale=1,kind='cabin'){solidObstacles.push({x,z,hx:2.9*scale,hz:2.55*scale});const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);scene.add(g);box(g,0,1.45,0,5,2.9,4.2,kind==='shop'?red:wood);const r=new THREE.Mesh(new THREE.ConeGeometry(3.55,2.25,4),roof);r.position.set(0,3.95,0);r.rotation.y=Math.PI/4;r.scale.set(1,.75,.82);r.castShadow=true;g.add(r);box(g,0,3.02,0,5.6,.18,4.8,snowMat);box(g,0,.82,2.12,.95,1.65,.12,darkWood);for(const side of [-1,1]){box(g,side*1.45,1.85,2.16,.78,.85,.1,windowGlow);box(g,side*1.45,1.85,2.23,.1,.9,.04,cream);box(g,side*1.45,1.85,2.23,.82,.08,.04,cream)}cylinder(g,1.55,4.35,-.5,.38,.42,1.15,wood);const smoke=new THREE.Group();smoke.position.set(1.55,4.95,-.5);g.add(smoke);for(let i=0;i<4;i++){const puff=sphere(smoke,Math.sin(i)*.18,i*.4,0,.22,mat(0xd8e5e7,.95));puff.userData.smoke=true}const wreath=sphere(g,0,2.3,2.23,.32,pine);sphere(g,0,2.3,2.5,.07,red);return g}
house(-12,-5,1.12,'cabin');house(12,-10,.95,'shop');house(20,6,.65,'cabin');house(-22,2,.72,'shop');house(18,-23,.8,'cabin');house(-19,-24,.7,'cabin');
makeTree(-24,-16,1.4);makeTree(-20,8,1.05);makeTree(23,-19,1.4);makeTree(26,13,1.1);makeTree(-5,-24,1.2);makeTree(6,-27,1.1);
const grandTree=makeTree(0,-13,2.25,true);

const treeDecorations=[];
function clearTreeDecorations(){treeDecorations.forEach(o=>{grandTree.remove(o);o.traverse?.(n=>{if(n.geometry)n.geometry.dispose();if(n.material&&!Array.isArray(n.material)&&n.material!==gold)n.material.dispose()})});treeDecorations.length=0}
function buildTreeDecoration(type,color,index){
 const material=new THREE.MeshStandardMaterial({color,metalness:.22,roughness:.28,emissive:new THREE.Color(color),emissiveIntensity:.16});
 const y=.72+(index%7)*.22;
 const radius=Math.max(.18,.78-y*.25);
 const angle=index*2.399;
 if(type==='ornament'){
  const g=new THREE.Group();g.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.105,10,8),material);g.add(ball);
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.055,7),gold);cap.position.y=.12;g.add(cap);
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='lights'){
  const g=new THREE.Group();
  for(let i=0;i<42;i++){const q=i/42,ly=.72+q*1.68,a=i*.72+index*.42,r=Math.max(.12,.78-ly*.25);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.038,6,5),material);bulb.position.set(Math.cos(a)*r,ly,Math.sin(a)*r);g.add(bulb)}
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='ribbon'){
  const points=[];for(let i=0;i<=70;i++){const q=i/70,ly=.7+q*1.72,a=q*Math.PI*8+index*.25,r=Math.max(.1,.8-ly*.25);points.push(new THREE.Vector3(Math.cos(a)*r,ly,Math.sin(a)*r))}
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),70,.035,5,false),material);treeDecorations.push(mesh);grandTree.add(mesh);
 }else if(type==='star'){
  const g=new THREE.Group();g.position.set(0,2.58,0);
  const star=new THREE.Mesh(new THREE.OctahedronGeometry(.24,1),material);star.scale.set(1,1.25,.3);g.add(star);
  treeDecorations.push(g);grandTree.add(g);
 }else if(type==='candy'){
  const g=new THREE.Group();g.position.set(Math.cos(angle)*radius,y,Math.sin(angle)*radius);
  const cane=new THREE.Mesh(new THREE.TorusGeometry(.09,.035,6,12,Math.PI*1.5),cream);cane.rotation.z=Math.PI/2;g.add(cane);
  for(let j=0;j<3;j++){const stripe=new THREE.Mesh(new THREE.SphereGeometry(.033,6,5),material);stripe.position.set((j-1)*.065,.045,0);g.add(stripe)}
  treeDecorations.push(g);grandTree.add(g);
 }
}
function restoreTree(){clearTreeDecorations();let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}saved.forEach((d,i)=>buildTreeDecoration(d.type,d.color,i))}
window.decorateTree=(type,color)=>{let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}if(type==='star')saved=saved.filter(d=>d.type!=='star');saved.push({type,color});localStorage.setItem('twains-tree-decorations',JSON.stringify(saved));restoreTree();return saved.length};
window.undoTreeDecoration=()=>{let saved=[];try{saved=JSON.parse(localStorage.getItem('twains-tree-decorations')||'[]')}catch(e){}saved.pop();localStorage.setItem('twains-tree-decorations',JSON.stringify(saved));restoreTree();return saved.length};
window.resetTreeDecorations=()=>{localStorage.removeItem('twains-tree-decorations');restoreTree()};
restoreTree();
window.openTreeStudio=()=>{document.getElementById('treeStudio').classList.add('open');document.getElementById('treeStudio').setAttribute('aria-hidden','false');cameraMode='treeStudio';yaw=0;pitch=.15;};
window.closeTreeStudio=()=>{document.getElementById('treeStudio').classList.remove('open');document.getElementById('treeStudio').setAttribute('aria-hidden','true');cameraMode='follow';};

for(let i=0;i<10;i++){const a=i*2.399,r=18+(i%5)*2.2;makeTree(Math.cos(a)*r,Math.sin(a)*r,.55+(i%4)*.12,i%7===0)}
// Curving village path
const pathPts=[];for(let i=0;i<=50;i++){const t=i/50;pathPts.push(new THREE.Vector3(-2+Math.sin(t*Math.PI*1.45)*8,.015,18-t*37))}
const path=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pathPts),100,2.25,8,false),mat(0xc5d6d5));path.position.y=.02;scene.add(path);
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
for(let i=0;i<18;i++){
 const a=i/18*Math.PI*2,r=7.2+(i%3)*.65,x=Math.cos(a)*r,z=-13+Math.sin(a)*r;
 const shrub=sphere(scene,x,.35,z,.72,pine2);shrub.scale.set(1,.65,1);
 if(i%2===0)sphere(scene,x,.9,z,.16,red);
}


// A welcoming village entrance and warm festive details
const signCanvas=document.createElement('canvas');signCanvas.width=1024;signCanvas.height=256;const sx=signCanvas.getContext('2d');sx.fillStyle='#233d43';sx.fillRect(0,0,1024,256);sx.strokeStyle='#e7c88d';sx.lineWidth=12;sx.strokeRect(15,15,994,226);sx.textAlign='center';sx.fillStyle='#f6e4b8';sx.font='bold 82px Georgia';sx.fillText("TWAIN'S CHRISTMAS VILLAGE",512,155);
const signTex=new THREE.CanvasTexture(signCanvas);const sign=box(scene,0,3.4,23,12,3.2,.45,wood);const signFace=new THREE.Mesh(new THREE.PlaneGeometry(11.5,2.65),new THREE.MeshBasicMaterial({map:signTex}));signFace.position.set(0,3.4,23.24);scene.add(signFace);cylinder(scene,-5.2,1.8,23,.16,.2,3.6,darkWood);cylinder(scene,5.2,1.8,23,.16,.2,3.6,darkWood);
for(let i=0;i<9;i++){const x=-4.5+i*1.125,y=5.1-Math.sin(i/8*Math.PI)*.9;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.13,8,7),new THREE.MeshStandardMaterial({color:i%2?0xffd27b:0x8be1c0,emissive:i%2?0xffb94f:0x4ac99a,emissiveIntensity:1.5}));bulb.position.set(x,y,23.1);scene.add(bulb)}
// Removed oversized snow mounds around the central tree; the ground remains clean and walkable.

// Gifts around the tree
for(let i=0;i<12;i++){const a=i*2.4,r=3.2+(i%3)*.8;const g=new THREE.Group();g.position.set(Math.cos(a)*r,.35, -13+Math.sin(a)*r);scene.add(g);box(g,0,0,0,.65,.65,.65,i%2?red:cream);box(g,0,.34,0,.12,.08,.68,gold);box(g,0,.34,0,.68,.08,.12,gold)}

// Six collectible presents hidden around the village
const hiddenGifts=[];
function placeCollectibleGift(x,z,color){
 const g=new THREE.Group();g.position.set(x,.48,z);g.userData.baseY=.48;
 const wrap=mat(color,.48,.08);box(g,0,0,0,.62,.62,.62,wrap);box(g,0,.32,0,.11,.07,.66,gold);box(g,0,.32,0,.66,.07,.11,gold);
 const bow=sphere(g,0,.42,0,.12,cream);bow.scale.set(1,.55,.7);
 const halo=new THREE.Mesh(new THREE.TorusGeometry(.55,.025,5,16),gold);halo.rotation.x=Math.PI/2;halo.position.y=-.28;g.add(halo);
 scene.add(g);hiddenGifts.push(g);
}
[[-7,7,0x9e4547],[7,7,0x236052],[-23,-12,0x315c71],[13,-18,0x9e4547],[-3,-28,0x78608c],[27,10,0x236052]].forEach(p=>placeCollectibleGift(p[0],p[1],p[2]));
let giftsFound=0;
function collectGift(g){
 g.visible=false;giftsFound++;
 const label=document.getElementById('giftCount');if(label)label.textContent=giftsFound+' / 6 PRESENTS FOUND';
 if(giftsFound===6){const q=document.querySelector('#giftQuest span');if(q)q.textContent='✦ DELIVERY COMPLETE';const hint=document.getElementById('sceneHint');if(hint)hint.textContent='ALL SIX PRESENTS DELIVERED — MERRY CHRISTMAS!'}
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
document.getElementById('enterWorld').addEventListener('click',()=>{started=true;document.getElementById('introScreen').classList.add('leave');cameraMode='cinema';cinemaStart=performance.now();document.getElementById('sceneHint').textContent='WASD / ARROW KEYS TO MOVE  •  DRAG TO LOOK AROUND'});
document.querySelectorAll('[data-place]').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.place!=='tree')focusOn(b.dataset.place)}));
document.getElementById('modeBtn').addEventListener('click',()=>{const day=scene.background.getHex()===0x081827;scene.background.set(day?new THREE.Color(0x9bc6d1):new THREE.Color(0x081827));scene.fog.color.set(day?0xa8d0d4:0x9bb9c5);moon.intensity=day?1.15:2.5;warm.intensity=day?20:65});

let lastRender=0;function animate(now=0){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04),t=clock.elapsedTime;
hiddenGifts.forEach((g,i)=>{if(!g.visible)return;g.rotation.y+=dt*.8;g.position.y=g.userData.baseY+Math.sin(t*2.1+i)*.1;if(started&&player.position.distanceTo(g.position)<1.45)collectGift(g)});
const pos=snowParticles.attributes.position.array;for(let i=0;i<count;i++){pos[i*3+1]-=velocities[i];pos[i*3]+=Math.sin(t*.5+i)*.002;if(pos[i*3+1]<0){pos[i*3+1]=34;pos[i*3]=(Math.random()-.5)*90}}snowParticles.attributes.position.needsUpdate=true;
friends.forEach((f,i)=>{const a=t*f.speed+f.phase;f.obj.position.set(f.center.x+Math.cos(a)*f.radius,Math.abs(Math.sin(t*f.speed*f.radius*5+i))*.035,f.center.z+Math.sin(a)*f.radius);f.obj.rotation.y=-a+Math.PI/2;const gait=t*f.speed*f.radius*5+i;f.obj.userData.legs.forEach((leg,j)=>leg.rotation.x=Math.sin(gait+j*Math.PI)*.58);f.obj.userData.arms.forEach((arm,j)=>arm.rotation.x=Math.sin(gait+j*Math.PI+Math.PI)*.34);f.obj.userData.body.position.y=Math.abs(Math.sin(gait*2))*.035});
const moving=keys.w||keys.s||keys.a||keys.d||keys.arrowup||keys.arrowdown||keys.arrowleft||keys.arrowright;player.userData.legs.forEach((leg,j)=>leg.rotation.x=moving?Math.sin(t*13+j*Math.PI)*.62:0);player.userData.arms.forEach((arm,j)=>arm.rotation.x=moving?Math.sin(t*13+j*Math.PI+Math.PI)*.4:0);player.userData.body.position.y=moving?Math.abs(Math.sin(t*13*2))*.045:0;
if(started&&cameraMode==='follow'){forward.set(-Math.sin(yaw),0,-Math.cos(yaw));sideMove.set(Math.cos(yaw),0,-Math.sin(yaw));move.set(0,0,0);if(keys.w||keys.arrowup)move.add(forward);if(keys.s||keys.arrowdown)move.sub(forward);if(keys.a||keys.arrowleft)move.sub(sideMove);if(keys.d||keys.arrowright)move.add(sideMove);if(move.lengthSq()>0){move.normalize();const step=move.clone().multiplyScalar(dt*5.2),nx=player.position.x+step.x,nz=player.position.z+step.z;const blocked=solidObstacles.some(o=>Math.abs(nx-o.x)<o.hx+.48&&Math.abs(nz-o.z)<o.hz+.48);if(!blocked){player.position.x=THREE.MathUtils.clamp(nx,-31,31);player.position.z=THREE.MathUtils.clamp(nz,-32,27)}else{const xBlocked=solidObstacles.some(o=>Math.abs(nx-o.x)<o.hx+.48&&Math.abs(player.position.z-o.z)<o.hz+.48),zBlocked=solidObstacles.some(o=>Math.abs(player.position.x-o.x)<o.hx+.48&&Math.abs(nz-o.z)<o.hz+.48);if(!xBlocked)player.position.x=THREE.MathUtils.clamp(nx,-31,31);if(!zBlocked)player.position.z=THREE.MathUtils.clamp(nz,-32,27)}player.rotation.y=Math.atan2(move.x,move.z);}}
if(cameraMode==='cinema'){const elapsed=(performance.now()-cinemaStart)/1000;const segment=Math.min(Math.floor(elapsed/2.7),cinematicShots.length-1),q=Math.min((elapsed-segment*2.7)/2.7,1),smooth=q*q*(3-2*q),from=cinematicShots[segment],to=cinematicShots[Math.min(segment+1,cinematicShots.length-1)];camera.position.lerpVectors(from.p,to.p,smooth);cinemaLook.lerpVectors(from.l,to.l,smooth);camera.lookAt(cinemaLook);if(elapsed>=cinematicShots.length*2.7){cameraMode='follow';}}
else if(cameraMode==='treeStudio'){const desired=new THREE.Vector3(Math.sin(yaw)*13,5.4+pitch*4,-13+Math.cos(yaw)*13);camera.position.lerp(desired,.07);camera.lookAt(0,3.5,-13)}
else if(cameraMode==='focus'){const q=Math.min((performance.now()-focusStart)/1300,1),s=q*q*(3-2*q);camera.position.lerpVectors(focusFrom,focusTo,s);camera.lookAt(focusLook);if(q>=1)cameraMode='follow'}
else{desiredCamera.set(player.position.x+Math.sin(yaw)*11,player.position.y+7+pitch*5,player.position.z+Math.cos(yaw)*11);camera.position.lerp(desiredCamera,1-Math.pow(.001,dt));lookTarget.set(player.position.x,1.5,player.position.z);cameraTarget.lerp(lookTarget,.08);camera.lookAt(cameraTarget)}
const targetFrame=mobileDevice?1000/30:1000/40;if(now-lastRender>=targetFrame){renderer.render(scene,camera);lastRender=now}}
animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,mobileDevice?0.9:1.2))});
document.getElementById('sceneLoading').classList.add('done');

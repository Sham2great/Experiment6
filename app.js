import * as THREE from "three";

const host = document.querySelector("#scene");
const loader = document.querySelector("#loader");
const intro = document.querySelector("#intro");
const machinePanel = document.querySelector("#machinePanel");
const worldPanel = document.querySelector("#worldPanel");
const beginButton = document.querySelector("#beginButton");
const activateButton = document.querySelector("#activateButton");
const toast = document.querySelector("#toast");

let scene, camera, renderer, core, halo, portal, portalGlow, stars, machineGroup;
let activated = false, soundOn = false, audioContext = null, oscillator = null, gain = null;
let pointerDown = false, lastX = 0, lastY = 0, targetRotation = 0, targetTilt = 0;
let scrollProgress = 0, clock = new THREE.Clock();
const worldColors = {
  eden: 0x91f0c6, inversion: 0x9c8cff, afterlight: 0xffbd87,
  resonance: 0x7bdcf5, paradox: 0xf18dca
};

function makeGlowTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,"rgba(180,245,255,1)"); g.addColorStop(.12,"rgba(115,210,255,.55)");
  g.addColorStop(.42,"rgba(90,130,255,.12)"); g.addColorStop(1,"rgba(70,100,255,0)");
  ctx.fillStyle=g;ctx.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}
function init() {
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070d, .035);
  camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, .1, 180);
  camera.position.set(0, 1.2, 12);
  renderer = new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x8796bd,.48));
  const key = new THREE.PointLight(0x8ceaff,22,28);key.position.set(0,3,5);scene.add(key);
  const rim = new THREE.PointLight(0x7864ff,18,24);rim.position.set(-5,1,-4);scene.add(rim);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(18,80),new THREE.MeshBasicMaterial({color:0x080d18,transparent:true,opacity:.65}));
  floor.rotation.x=-Math.PI/2;floor.position.y=-2.7;scene.add(floor);
  const grid = new THREE.GridHelper(36,50,0x29445c,0x152338);grid.position.y=-2.68;grid.material.transparent=true;grid.material.opacity=.23;scene.add(grid);

  machineGroup = new THREE.Group(); scene.add(machineGroup);
  const metal = new THREE.MeshStandardMaterial({color:0x27374c,metalness:.9,roughness:.24});
  const darkMetal = new THREE.MeshStandardMaterial({color:0x0c1421,metalness:.85,roughness:.3});
  const glow = new THREE.MeshStandardMaterial({color:0x8feaff,emissive:0x2d9ac7,emissiveIntensity:2.4,metalness:.35,roughness:.2});
  const ringGeo = new THREE.TorusGeometry(1.8,.055,12,120);
  for(let i=0;i<3;i++){
    const ring = new THREE.Mesh(ringGeo,i===1?glow:metal);
    ring.rotation.x = Math.PI/2 + (i-1)*.36;
    ring.rotation.y = i*.62;
    ring.scale.setScalar(1+i*.16);
    ring.userData.spin = (i%2?-.16:.12);
    machineGroup.add(ring);
  }
  const outer = new THREE.Mesh(new THREE.TorusGeometry(2.55,.018,8,160),new THREE.MeshBasicMaterial({color:0x86dff4,transparent:true,opacity:.42}));
  outer.rotation.x=Math.PI/2;machineGroup.add(outer);
  const coreGeo = new THREE.IcosahedronGeometry(.72,4);
  core = new THREE.Mesh(coreGeo,new THREE.MeshPhysicalMaterial({color:0x8ceeff,emissive:0x1677a7,emissiveIntensity:1.3,metalness:.2,roughness:.12,transmission:.22,thickness:1.4}));
  machineGroup.add(core);
  const innerCore = new THREE.Mesh(new THREE.IcosahedronGeometry(.32,3),new THREE.MeshBasicMaterial({color:0xd9fbff}));
  machineGroup.add(innerCore);
  halo = new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture(),color:0x74dfff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:.7}));
  halo.scale.set(8,8,1);halo.position.z=-.25;machineGroup.add(halo);
  for(let i=0;i<8;i++){
    const bead = new THREE.Mesh(new THREE.SphereGeometry(.055,12,12),glow);
    const a=i/8*Math.PI*2;bead.position.set(Math.cos(a)*2.18,Math.sin(a)*2.18,0);
    bead.userData.orbit=a;bead.userData.radius=2.18;machineGroup.add(bead);
  }

  portal = new THREE.Group();portal.position.set(0,0,-7);scene.add(portal);
  const portalRing = new THREE.Mesh(new THREE.TorusGeometry(2.1,.11,18,140),new THREE.MeshStandardMaterial({color:0x83e8ff,emissive:0x39bfe7,emissiveIntensity:2,metalness:.5,roughness:.18}));
  portal.add(portalRing);
  const portalInner = new THREE.Mesh(new THREE.CircleGeometry(1.98,96),new THREE.MeshBasicMaterial({color:0x132b52,transparent:true,opacity:.0,side:THREE.DoubleSide}));
  portal.add(portalInner);
  portalGlow = new THREE.Sprite(new THREE.SpriteMaterial({map:makeGlowTexture(),color:0x8a9aff,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,opacity:0}));
  portalGlow.scale.set(9,9,1);portal.add(portalGlow);
  portal.scale.setScalar(.001);

  const count=1800, positions=new Float32Array(count*3), sizes=new Float32Array(count);
  for(let i=0;i<count;i++){positions[i*3]=(Math.random()-.5)*90;positions[i*3+1]=(Math.random()-.5)*55;positions[i*3+2]=-Math.random()*90;sizes[i]=Math.random();}
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute("position",new THREE.BufferAttribute(positions,3));starGeo.setAttribute("aSize",new THREE.BufferAttribute(sizes,1));
  stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xb8d8ff,size:.045,transparent:true,opacity:.8,sizeAttenuation:true}));scene.add(stars);
  animate();
}
function animate(){
  requestAnimationFrame(animate);
  const t=clock.getElapsedTime();
  if(machineGroup){
    machineGroup.rotation.y += (targetRotation-machineGroup.rotation.y)*.045;
    machineGroup.rotation.x += (targetTilt-machineGroup.rotation.x)*.045;
    machineGroup.position.y=Math.sin(t*.65)*.12;
    machineGroup.children.forEach((obj)=>{
      if(obj.userData.spin)obj.rotation.z+=obj.userData.spin*.006;
      if(obj.userData.orbit!==undefined){obj.userData.orbit+=.003;obj.position.set(Math.cos(obj.userData.orbit)*obj.userData.radius,Math.sin(obj.userData.orbit)*obj.userData.radius,Math.sin(obj.userData.orbit*2)*.18);}
    });
    core.rotation.x=t*.12;core.rotation.y=t*.22;
    const pulse=1+Math.sin(t*1.7)*.035;core.scale.setScalar(pulse);
    halo.material.opacity=.52+Math.sin(t*1.5)*.16;
  }
  if(portal){portal.rotation.z=Math.sin(t*.25)*.04;portal.children[0].rotation.z=t*.08;}
  if(stars)stars.rotation.y=t*.002;
  camera.position.x += ((Math.sin(t*.12)*.24)-camera.position.x)*.01;
  camera.position.y += ((1.2+Math.sin(t*.3)*.07)-camera.position.y)*.02;
  camera.lookAt(0,0,-1.1);
  if(activated){
    const s=Math.min(1,(t-activationTime)/1.5);
    portal.scale.setScalar(THREE.MathUtils.lerp(.001,1.0,THREE.MathUtils.smoothstep(s,0,1)));
    portalGlow.material.opacity=THREE.MathUtils.lerp(0,.75,s);
  }
  renderer.render(scene,camera);
}
let activationTime=0;
function showToast(message){
  toast.textContent=message;toast.classList.add("show");
  clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>toast.classList.remove("show"),2600);
}
function reveal(el){el.classList.add("visible");}
beginButton.addEventListener("click",()=>{
  reveal(machinePanel);machinePanel.scrollIntoView({behavior:"smooth",block:"center"});
  showToast("THRESHOLD DETECTED — APPROACH THE MACHINE");
});
activateButton.addEventListener("click",()=>{
  if(activated){worldPanel.scrollIntoView({behavior:"smooth"});return;}
  activated=true;activationTime=clock.getElapsedTime();
  activateButton.innerHTML="GATEWAY OPEN <span>↗</span>";
  document.querySelector(".panel-status").innerHTML="<i></i> CONNECTION ESTABLISHED";
  reveal(worldPanel);
  setTimeout(()=>worldPanel.scrollIntoView({behavior:"smooth",block:"start"}),650);
  showToast("REALITY BREACH DETECTED — FIVE DESTINATIONS AVAILABLE");
  if(soundOn)playTone(110,.7);
});
document.querySelectorAll(".world-card").forEach(card=>{
  card.addEventListener("click",()=>{
    const id=card.dataset.world;
    document.querySelectorAll(".world-card").forEach(c=>c.classList.toggle("active",c===card));
    const color=worldColors[id];
    core.material.color.setHex(color);core.material.emissive.setHex(color);
    halo.material.color.setHex(color);portal.children[0].material.color.setHex(color);
    portal.children[0].material.emissive.setHex(color);
    portalGlow.material.color.setHex(color);
    document.querySelector("#worldReadout").textContent="CURRENT DESTINATION: "+id.toUpperCase();
    showToast(id.toUpperCase()+" SELECTED — REALITY SHARD SYNCHRONIZED");
    if(soundOn)playTone(160+Object.keys(worldColors).indexOf(id)*35,.35);
  });
});
host.addEventListener("pointerdown",e=>{pointerDown=true;lastX=e.clientX;lastY=e.clientY;host.setPointerCapture?.(e.pointerId);});
host.addEventListener("pointermove",e=>{if(!pointerDown)return;targetRotation+=(e.clientX-lastX)*.006;targetTilt=THREE.MathUtils.clamp(targetTilt+(e.clientY-lastY)*.004,-.55,.55);lastX=e.clientX;lastY=e.clientY;});
host.addEventListener("pointerup",()=>pointerDown=false);
host.addEventListener("pointercancel",()=>pointerDown=false);
window.addEventListener("scroll",()=>{
  const y=window.scrollY;
  if(y>innerHeight*.42)reveal(machinePanel);
  if(activated&&y>innerHeight*1.15)reveal(worldPanel);
});
window.addEventListener("resize",()=>{
  if(!camera||!renderer)return;
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
});
function playTone(freq,duration){
  if(!audioContext)return;
  const o=audioContext.createOscillator(),g=audioContext.createGain();
  o.type="sine";o.frequency.value=freq;g.gain.setValueAtTime(.0001,audioContext.currentTime);
  g.gain.exponentialRampToValueAtTime(.045,audioContext.currentTime+.04);
  g.gain.exponentialRampToValueAtTime(.0001,audioContext.currentTime+duration);
  o.connect(g);g.connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration+.03);
}
document.querySelector("#soundToggle").addEventListener("click",()=>{
  soundOn=!soundOn;document.querySelector("#soundLabel").textContent=soundOn?"SOUND ON":"SOUND OFF";
  if(soundOn){
    audioContext=audioContext||new (window.AudioContext||window.webkitAudioContext)();
    if(audioContext.state==="suspended")audioContext.resume();
    playTone(220,.5);showToast("AUDIO CHANNEL ENABLED");
  }else showToast("AUDIO CHANNEL MUTED");
});
init();
window.addEventListener("load",()=>setTimeout(()=>loader.classList.add("done"),550));

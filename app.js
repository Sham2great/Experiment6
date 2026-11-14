(() => {
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
function updateCountdown(){
 const now=new Date();
 let target=new Date(now.getFullYear(),11,25,0,0,0,0);
 if(target<=now)target=new Date(now.getFullYear()+1,11,25,0,0,0,0);
 const ms=Math.max(0,target-now);
 const values=[Math.floor(ms/86400000),Math.floor(ms/3600000)%24,Math.floor(ms/60000)%60,Math.floor(ms/1000)%60];
 ['days','hours','minutes','seconds'].forEach((id,i)=>{const el=$(id);if(el)el.textContent=pad(values[i])});
 const label=document.querySelector('.count-label');if(label)label.textContent='UNTIL CHRISTMAS MORNING';
}
updateCountdown();setInterval(updateCountdown,1000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateCountdown()});
const backdrop=$('modalBackdrop'),content=$('modalContent');
function openModal(html){content.innerHTML=html;backdrop.classList.add('open')}
function closeModal(){backdrop.classList.remove('open')}
$('closeModal').addEventListener('click',closeModal);
backdrop.addEventListener('click',e=>{if(e.target===backdrop)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();if(window.closeTreeStudio)window.closeTreeStudio()}});
document.querySelectorAll('[data-place]').forEach(btn=>btn.addEventListener('click',()=>{
 const place=btn.dataset.place;
 if(place==='tree'){if(window.openTreeStudio)window.openTreeStudio();return}
 if(place==='cabin')openModal('<div class="modal-kicker">A WARM LITTLE WELCOME</div><h2>Come in, get cozy.</h2><p>The fire is crackling, the cocoa is warm, and there is always room for one more by the tree.</p><p>✦ A little reminder: Christmas feels brightest when it is shared.</p><button class="action" id="cocoa">Make a little wish</button>');
 if(place==='workshop')openModal('<div class="modal-kicker">ELF TRAINING • LEVEL 1</div><h2>Catch the presents!</h2><p>Move your sleigh with your finger or mouse. Catch as many gifts as you can in 20 seconds.</p><div class="game-area"><canvas id="game" width="420" height="260"></canvas></div><p id="scoreline">Gifts caught: 0 · 20 seconds</p><button class="action" id="startGame">Start game</button>');
}));
$('postcardBtn').addEventListener('click',()=>openModal('<div class="modal-kicker">A NOTE FROM YOUR LITTLE WINTER WORLD</div><h2>Your holiday postcard</h2><label class="hint">WHO IS IT FOR?</label><input class="field" id="toName" placeholder="Someone special"><label class="hint">YOUR MESSAGE</label><textarea class="field" id="message" rows="3" placeholder="Wishing you a little magic this Christmas..."></textarea><div class="postcard" id="card"><div>❄ ✦ ❄</div><h3>Merry Christmas</h3><p id="cardMessage">Wishing you a little magic this Christmas.</p><small id="cardTo">TO SOMEONE SPECIAL</small></div><button class="action" id="downloadCard">Download postcard PNG</button><button class="action" id="shareCard">Share postcard</button>'));
let selectedType='ornament',selectedColor='#e84c59';
document.querySelectorAll('[data-deco]').forEach(b=>b.addEventListener('click',()=>{selectedType=b.dataset.deco;document.querySelectorAll('[data-deco]').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelectorAll('[data-color]').forEach(b=>b.addEventListener('click',()=>{selectedColor=b.dataset.color;document.querySelectorAll('[data-color]').forEach(x=>x.classList.toggle('active',x===b));}));
document.querySelector('[data-color="#e84c59"]')?.classList.add('active');
$('addDecoration').addEventListener('click',()=>{if(!window.decorateTree)return;const n=window.decorateTree(selectedType,selectedColor);$('studioNote').textContent='Beautiful! '+n+' decorations on your tree. Your tree is saved on this device.'});
$('undoDecoration').addEventListener('click',()=>{const n=window.undoTreeDecoration?.()??0;$('studioNote').textContent=n?'Last decoration removed. '+n+' left on your tree.':'Your tree is ready for its first decoration.'});
$('resetTree').addEventListener('click',()=>{window.resetTreeDecorations?.();$('studioNote').textContent='A fresh tree! Start decorating again.'});
$('closeStudio').addEventListener('click',()=>window.closeTreeStudio?.());
let audioContext=null,oscillator=null,gain=null,soundOn=false;
$('soundBtn').addEventListener('click',async()=>{const label=$('#soundBtn span');if(!soundOn){const AC=window.AudioContext||window.webkitAudioContext;if(!AC){label.textContent='Sound unavailable';return}audioContext=audioContext||new AC();await audioContext.resume();oscillator=audioContext.createOscillator();gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=58;gain.gain.value=.018;oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start();soundOn=true;label.textContent='Sound on'}else{oscillator?.stop();oscillator=null;soundOn=false;label.textContent='Sound off'}});
$('modeBtn').addEventListener('click',()=>{document.body.classList.toggle('day-mode');const b=$('modeBtn');b.innerHTML=document.body.classList.contains('day-mode')?'☀ <span>Day mode</span>':'☾ <span>Night mode</span>';});
$('auroraBtn').addEventListener('click',()=>{const a=$('aurora');a.classList.toggle('off');$('auroraBtn').innerHTML=a.classList.contains('off')?'✧ <span>Aurora off</span>':'✧ <span>Aurora on</span>'});
$('cinematicBtn').addEventListener('click',()=>{const b=$('cinematicBtn');b.classList.add('active');setTimeout(()=>b.classList.remove('active'),1800);});
$('enterWorld').addEventListener('click',()=>{const intro=$('introScreen');intro.classList.add('leave');});
document.addEventListener('click',e=>{
 if(e.target.id==='cocoa'){e.target.textContent='✦ Wish sent into the winter sky';e.target.disabled=true}
 if(e.target.id==='startGame')startGame();
 if(e.target.id==='downloadCard')downloadPostcard();
 if(e.target.id==='shareCard')sharePostcard();
});
document.addEventListener('input',e=>{if(e.target.id==='toName'||e.target.id==='message'){const n=$('cardTo'),m=$('cardMessage');if(n)n.textContent='TO '+($('toName').value||'SOMEONE SPECIAL').toUpperCase();if(m)m.textContent=$('message').value||'Wishing you a little magic this Christmas.'}});
function startGame(){const c=$('game'),x=c.getContext('2d'),line=$('scoreline');let sleigh=210,items=[],score=0,time=20,active=true,last=0;function move(e){const r=c.getBoundingClientRect();sleigh=(e.clientX-r.left)/r.width*c.width}c.onpointermove=move;function draw(t){if(!active)return;if(t-last>30){last=t;x.clearRect(0,0,420,260);x.fillStyle='#f5d99b';x.font='26px sans-serif';x.fillText('🛷',sleigh-15,244);items.forEach(it=>{it.y+=it.v;x.fillStyle='#fff';x.fillText('🎁',it.x,it.y);if(it.y>220&&Math.abs(it.x-sleigh)<31){it.y=300;score++}});items=items.filter(it=>it.y<275);if(Math.random()<.07)items.push({x:20+Math.random()*380,y:-10,v:2+Math.random()*2});line.textContent='Gifts caught: '+score+' · '+time+' seconds'}requestAnimationFrame(draw)}requestAnimationFrame(draw);const timer=setInterval(()=>{time--;if(time<=0){clearInterval(timer);active=false;line.textContent='Time! You caught '+score+' gifts. Well done!'}},1000)}
function makeCard(){const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,1200,800);g.addColorStop(0,'#163e50');g.addColorStop(1,'#071522');x.fillStyle=g;x.fillRect(0,0,1200,800);for(let i=0;i<150;i++){x.fillStyle='rgba(255,255,255,'+(.2+Math.random()*.7)+')';x.beginPath();x.arc(Math.random()*1200,Math.random()*800,1+Math.random()*2,0,7);x.fill()}x.textAlign='center';x.fillStyle='#f5d99b';x.font='32px Georgia';x.fillText('❄  ✦  ❄',600,170);x.font='bold 92px Georgia';x.fillText('Merry Christmas',600,330);x.fillStyle='#f5f4ec';x.font='34px Georgia';const msg=$('message')?.value||'Wishing you a little magic this Christmas.';x.fillText(msg.slice(0,55),600,450);x.font='24px Arial';x.fillStyle='#d9c18e';x.fillText('TO '+($('toName')?.value||'SOMEONE SPECIAL').toUpperCase(),600,690);return c}
function downloadPostcard(){const a=document.createElement('a');a.download='twains-christmas-postcard.png';a.href=makeCard().toDataURL('image/png');a.click()}
async function sharePostcard(){const c=makeCard();c.toBlob(async blob=>{const file=new File([blob],'twains-christmas-postcard.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Merry Christmas'})}catch(e){}}else downloadPostcard()})}
})();
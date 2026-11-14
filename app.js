(() => {
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
// Two-part soundtrack: opening theme carries through the gift hunt, then the
// Christmas celebration track takes over as soon as all six presents are found.
const openingMusic=new Audio('./settings%20(2).mp3');
const celebrationMusic=new Audio('./Brenda%20Lee%20-%20Rockin%20Around%20The%20Christmas%20Tree%20(Official%20Lyric%20Video)%20(1).mp3');
openingMusic.loop=true;openingMusic.preload='auto';openingMusic.volume=.58;
celebrationMusic.loop=true;celebrationMusic.preload='auto';celebrationMusic.volume=.62;
let musicEnabled=true,celebrationStarted=false,currentMusic=openingMusic;
async function startCurrentMusic(){
 if(!musicEnabled||!currentMusic)return;
 try{await currentMusic.play();const label=$('soundBtn')?.querySelector('span');if(label)label.textContent='Sound on'}catch(e){/* Browsers may wait for a user gesture before allowing audio. */}
}
function switchToCelebrationMusic(){
 if(celebrationStarted)return;celebrationStarted=true;
 openingMusic.pause();openingMusic.currentTime=0;currentMusic=celebrationMusic;
 if(musicEnabled){celebrationMusic.currentTime=0;startCurrentMusic()}
}
startCurrentMusic();
document.addEventListener('pointerdown',()=>{if(musicEnabled&&currentMusic.paused)startCurrentMusic()},{once:true});
window.addEventListener('winter-gift-found',e=>{if(Number(e.detail?.count)>=6)switchToCelebrationMusic()});

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
window.addEventListener('world-interact',e=>{
 const place=e.detail?.place;
 if(place==='tree'){window.openTreeStudio?.();return}
 if(place==='cabin')openModal('<div class="modal-kicker">THE LITTLE CABIN</div><h2>Come in, get cozy.</h2><p>The fire is crackling, the cocoa is warm, and the snow is falling softly outside. Take a moment to rest before exploring again.</p><p>✦ You found a little pocket of Christmas warmth.</p><button class="action" id="cocoa">Make a little wish</button>');
 if(place==='workshop')openModal('<div class="modal-kicker">THE NORTH POLE WORKSHOP</div><h2>Elf training begins!</h2><p>Catch the falling presents before they hit the snow. Move your sleigh with your finger or mouse.</p><div class="game-area"><canvas id="game" width="420" height="260"></canvas></div><p id="scoreline">Gifts caught: 0 · 20 seconds</p><button class="action" id="startGame">Start game</button>');
});

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
$('soundBtn').addEventListener('click',async()=>{
 const label=$('#soundBtn span');
 musicEnabled=!musicEnabled;
 if(musicEnabled){await startCurrentMusic();label.textContent='Sound on'}
 else{openingMusic.pause();celebrationMusic.pause();label.textContent='Sound off'}
});
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
function startGame(){
 const c=$('game'),x=c.getContext('2d'),line=$('scoreline');
 let sleigh=210,targetSleigh=210,items=[],score=0,remaining=20,active=true,last=0,spawn=0,raf=0;
 const W=c.width,H=c.height;
 function move(e){const r=c.getBoundingClientRect();targetSleigh=Math.max(24,Math.min(W-24,(e.clientX-r.left)/r.width*W))}
 c.onpointermove=move;c.onpointerdown=e=>{c.setPointerCapture?.(e.pointerId);move(e)};c.style.touchAction='none';
 function draw(t){
  if(!active)return;
  const dt=last?Math.min((t-last)/1000,.04):0;last=t;remaining=Math.max(0,remaining-dt);
  sleigh+=(targetSleigh-sleigh)*Math.min(1,dt*24);spawn+=dt;
  if(spawn>=.42){spawn=0;items.push({x:22+Math.random()*(W-44),y:-24,v:255+Math.random()*125,spin:Math.random()*6.28})}
  x.clearRect(0,0,W,H);
  x.strokeStyle='rgba(255,255,255,.22)';x.lineWidth=1;
  for(let i=0;i<10;i++){const sy=(i*31+t*.12)%H;x.beginPath();x.moveTo((i*47)%W,sy);x.lineTo((i*47)%W-3,sy+9);x.stroke()}
  for(const it of items){
   it.y+=it.v*dt;it.spin+=dt*2;
   x.save();x.translate(it.x,it.y);x.rotate(Math.sin(it.spin)*.08);x.font='27px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🎁',0,0);x.restore();
   if(it.y>H-43&&it.y<H-7&&Math.abs(it.x-sleigh)<36){it.caught=true;score++}
  }
  items=items.filter(it=>!it.caught&&it.y<H+28);
  x.font='34px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('🛷',sleigh,H-22);
  line.textContent='Gifts caught: '+score+' · '+Math.ceil(remaining)+' seconds';
  if(remaining<=0){active=false;line.textContent='Time! You caught '+score+' gifts. Well done!';return}
  raf=requestAnimationFrame(draw);
 }
 cancelAnimationFrame(raf);requestAnimationFrame(draw);
}
function makeCard(){const c=document.createElement('canvas');c.width=1200;c.height=800;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,1200,800);g.addColorStop(0,'#163e50');g.addColorStop(1,'#071522');x.fillStyle=g;x.fillRect(0,0,1200,800);for(let i=0;i<150;i++){x.fillStyle='rgba(255,255,255,'+(.2+Math.random()*.7)+')';x.beginPath();x.arc(Math.random()*1200,Math.random()*800,1+Math.random()*2,0,7);x.fill()}x.textAlign='center';x.fillStyle='#f5d99b';x.font='32px Georgia';x.fillText('❄  ✦  ❄',600,170);x.font='bold 92px Georgia';x.fillText('Merry Christmas',600,330);x.fillStyle='#f5f4ec';x.font='34px Georgia';const msg=$('message')?.value||'Wishing you a little magic this Christmas.';x.fillText(msg.slice(0,55),600,450);x.font='24px Arial';x.fillStyle='#d9c18e';x.fillText('TO '+($('toName')?.value||'SOMEONE SPECIAL').toUpperCase(),600,690);return c}
function downloadPostcard(){const a=document.createElement('a');a.download='twains-christmas-postcard.png';a.href=makeCard().toDataURL('image/png');a.click()}
async function sharePostcard(){const c=makeCard();c.toBlob(async blob=>{const file=new File([blob],'twains-christmas-postcard.png',{type:'image/png'});if(navigator.canShare?.({files:[file]})){try{await navigator.share({files:[file],title:'Merry Christmas'})}catch(e){}}else downloadPostcard()})}
})();
/* OTHERWORLD expansion: a living companion, story journal and unlockable finale */
(()=>{
 const style=document.createElement('style');style.textContent='';
 const journal=document.createElement('button');journal.id='storyJournal';journal.innerHTML='<span>✧</span><b>FIELD JOURNAL</b><small>YOUR STORY SO FAR</small>';
 const companion=document.createElement('button');companion.id='winterCompanion';companion.setAttribute('aria-label','Talk to Pip the snow fox');companion.innerHTML='<span class="pip-tail"></span><span class="pip-ear e1"></span><span class="pip-ear e2"></span><span class="pip-face">•ᴗ•</span><span class="pip-scarf"></span><i>✦</i>';
 const bubble=document.createElement('div');bubble.id='pipBubble';bubble.innerHTML='<b>PIP</b><span>Hey, Twain! I have a feeling there are secrets hidden around here...</span>';
 document.body.append(journal,companion,bubble);
 const showStoryModal=html=>{const box=document.getElementById('modalContent'),back=document.getElementById('modalBackdrop');if(box&&back){box.innerHTML=html;back.classList.add('open')}};
 let found=0;
 function renderJournal(){
  const chapters=[['01','A WORLD ASLEEP','Enter the winter village and find your way around.','Complete'],['02','THE LOST DELIVERIES','Find all six missing presents scattered through the snow.',found+'/6 presents'],['03','A TREE OF WISHES','Decorate the wishing tree until it feels like yours.','Explore the tree'],['04','THE LAST STAR','A final little surprise waits when every present is home.',''+(found===6?'UNLOCKED':'LOCKED')]];
  const rows=chapters.map((x,i)=>'<div class="journal-row"><span class="journal-number">'+x[0]+'</span><div><b>'+x[1]+'</b><p>'+x[2]+'</p><small>'+x[3]+'</small></div><i>'+(i===1&&found===6||i===3&&found===6?'✦':'◇')+'</i></div>').join('');
  showStoryModal('<div class="modal-kicker">A RECORD OF YOUR ADVENTURE</div><h2>The winter <em>journal.</em></h2><p>Every little discovery brings this world a little more to life.</p><div class="journal-progress"><span>YOUR CHRISTMAS STORY</span><b>'+found+' / 6</b><div><i style="width:'+(found/6*100)+'%"></i></div></div>'+rows+(found===6?'<div class="journal-unlock">✦ THE FINAL STAR IS AWAKE <p>All six presents are home. Return to the wishing tree for your surprise.</p></div>':''));
 }
 journal.addEventListener('click',renderJournal);
 const lines=['Psst... I saw something sparkle near the trees.','The village gets prettier every time you find a present.','I think the wishing tree has a surprise for you.','If you get lost, just follow the little lights.','You know what makes this place magical? You being here.'];
 let line=0,timer;
 function speak(){bubble.classList.add('show');bubble.querySelector('span').textContent=lines[line++%lines.length];clearTimeout(timer);timer=setTimeout(()=>bubble.classList.remove('show'),4800)}
 companion.addEventListener('click',speak);
 window.addEventListener('world-interact',e=>{if(e.detail?.place==='cabin'){setTimeout(()=>{bubble.querySelector('span').textContent='This cabin feels like the perfect place to make a memory.';bubble.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>bubble.classList.remove('show'),4800)},150)}});
 window.addEventListener('winter-gift-found',()=>{found=Math.min(6,found+1);if(found===6){bubble.querySelector('span').textContent='YOU DID IT! All the presents are home. Go see the wishing tree!';bubble.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>bubble.classList.remove('show'),7000)}});
 document.getElementById('enterWorld')?.addEventListener('click',()=>setTimeout(speak,1800));
})();


/* THE MISSING GIFTS — opening story cinematic */
(()=>{
 const intro=document.getElementById('introScreen');
 if(!intro)return;
 const frame=intro.querySelector('.intro-frame');
 const story=document.createElement('div');
 story.id='openingStory';
 story.className='opening-story';
 story.innerHTML=`
  <div class="story-sky-glow"></div>
  <div class="story-landscape"><i class="story-mountain m-one"></i><i class="story-mountain m-two"></i><div class="story-houses"><i class="story-house h-one"></i><i class="story-house h-two"></i><i class="story-house h-three"></i><i class="story-house h-four"></i></div><div class="story-string-lights"><i></i><i></i><i></i><i></i><i></i><i></i></div><i class="story-pine p-one"></i><i class="story-pine p-two"></i><i class="story-lamp"></i></div>
  <div class="story-character" aria-hidden="true"><span class="anto-name-tag">ANTO</span><i class="anto-hair"></i><i class="anto-hat"></i><i class="anto-head"><b></b></i><i class="anto-scarf"></i><i class="anto-coat"></i><i class="anto-arm"></i><i class="anto-leg leg-one"></i><i class="anto-leg leg-two"></i></div>
  <div class="story-cat" aria-hidden="true"><i class="cat-body"></i><i class="cat-head"><b></b></i><i class="cat-ear cat-ear-one"></i><i class="cat-ear cat-ear-two"></i><i class="cat-tail"></i><i class="cat-hat"></i><i class="cat-hat-trim"></i></div>
  <div class="story-gifts" aria-hidden="true"><i>🎁</i><i>🎁</i><i>🎁</i></div>
  <div class="story-copy"><small> A LITTLE CHRISTMAS STORY </small><h2 id="storyLine">Christmas was almost here…</h2><p id="storySubline">And Anto could hardly wait.</p></div>
  <button class="story-skip" type="button">SKIP STORY ↗</button>
  <div class="story-progress"><i></i></div>`;
 intro.appendChild(story);
 intro.classList.add('story-running');
 const lines=[
  ['Christmas was almost here…','And Anto could hardly wait.'],
  ['But something was wrong.','Her presents had disappeared from their usual place.'],
  ['She searched high and low…','Past the little houses, through the snow, and around the village.'],
  ['Not a single gift.','Anto was starting to feel a little sad.'],
  ['Maybe you can help?','Six missing presents are hidden somewhere in the village.']
 ];
 let step=0,finished=false,timers=[];
 const finish=()=>{
  if(finished)return;finished=true;timers.forEach(clearTimeout);
  intro.classList.remove('story-running');intro.classList.add('story-finished');
  frame.querySelector('h1').innerHTML='Twain\'s<br><em>Christmas</em>';
  const copy=frame.querySelector('.intro-copy');if(copy)copy.innerHTML='Anto can’t find her Christmas presents.<br>Will you help her find all six?';
  const button=document.getElementById('enterWorld');if(button)button.innerHTML='<span>HELP ANTO FIND HER GIFTS</span><b>↗</b>';
  const kicker=frame.querySelector('.intro-kicker');if(kicker)kicker.textContent='A LITTLE CHRISTMAS MYSTERY';
  const overline=frame.querySelector('.intro-overline');if(overline)overline.innerHTML='<span></span> THE VILLAGE NEEDS A LITTLE HELP <span></span>';
  story.classList.add('story-done');
 };
 const show=(i)=>{
  if(finished)return;
  step=i;
  const [title,sub]=lines[i];
  const heading=document.getElementById('storyLine'),paragraph=document.getElementById('storySubline');
  heading.classList.remove('story-text-in');paragraph.classList.remove('story-text-in');
  void heading.offsetWidth;
  heading.textContent=title;paragraph.textContent=sub;
  heading.classList.add('story-text-in');paragraph.classList.add('story-text-in');
  story.dataset.scene=String(i);
  if(i===1)story.classList.add('gifts-vanish');
  if(i===3)story.classList.add('anto-sad');
  if(i===4){story.classList.add('story-final');const skip=story.querySelector('.story-skip');skip.textContent='CONTINUE ↗';}
  if(i<lines.length-1)timers.push(setTimeout(()=>show(i+1),2600));
  else timers.push(setTimeout(finish,2500));
 };
 story.querySelector('.story-skip').addEventListener('click',finish);
 show(0);
})();
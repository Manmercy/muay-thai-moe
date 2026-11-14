// ================= MUAY THAI MOE v1.3 — UI =================
const VERSION="1.80.12";
const CUR_LANG=(typeof window!=="undefined"&&window.LANG)||"th";
const TH_LABEL=String.fromCharCode(3652,3607,3618);
function langSwitch(cls){return `<div class="langsw ${cls||""}" role="group" aria-label="Language">${[["th",TH_LABEL],["en","EN"]].map(([k,l])=>`<button class="lsb ${CUR_LANG===k?"on":""}" data-act="setlang" data-v="${k}" aria-pressed="${CUR_LANG===k}">${l}</button>`).join("")}</div>`;}
const SAVE_KEY="mtm-save-v13";
const CANON_IDS=["kati","mali","rin","ploy","fah"];
let G=null;
const UI={tab:"home",scene:null,fight:null,modal:null,creator:null,ending:null,montage:null,speed:1,title:"tap",fsub:"offers",rdiv:"A",ptab:"over",tipIdx:0,advCache:{},toast:null,look:"fight"};
const $app=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const val=(x,...a)=>typeof x==="function"?x(G,...a):x;
// v1.5: the big portrait carries the emotion. fight: happy/sad/flustered/angry · casual: normal/flustered/pout · train: normal only (other moods fall back to the main fight outfit)
// v1.9: the fight art has no blush face — its "flustered" art is a startled face, so only real surprises use it
const SURPRISE=/^(…)?\s*(Who|Huh|What[!?]|Eh|Wait|Whoa|Eek|Really\?|ใครน่ะ|ห้ะ|หา[!?]|เอ๊ะ|อ๊ะ|อะไรนะ|จริงเหรอ|ตะ… |เดี๋ยว|ว้าย|อุ๊ย)/;
const moodFor=(mood,look,text)=>{if(mood==="surprised")return look==="casual"?"flustered":"surprised";
  if(look!=="casual"&&mood==="flustered")return SURPRISE.test(text||"")?"surprised":"happy";return mood;};
const FMOOD=m=>m==="surprised"?"flustered":m==="pout"?"sad":["happy","sad","angry"].includes(m)?m:"happy";
const stand=(id,look,mood)=>{if(id==="coach")return `${ASSET}coach.webp`;
  if(look==="casual"){const v=mood==="flustered"?"_flustered":["pout","angry","sad"].includes(mood)?"_pout":"";return `${ASSET}${id}_casual${v}.webp`;}
  // v1.8: one main outfit — training scenes use the fight outfit too, so clothes never flip mid-scene
  return `${ASSET}${id}_fight_${FMOOD(mood)}.webp`;};
const faceSrc=(id,mood,look)=>id==="coach"?`${ASSET}coach_face.webp`:look&&look!=="fight"?`${ASSET}${id}_${look}_face.webp`:`${ASSET}${id}_${["happy","sad","flustered"].includes(mood)?mood:"happy"}_face.webp`;
const BGIMG={camp:"bg_camp.webp",night:"bg_camp.webp",bus:"bg_bus_rain.webp",letter:"bg_grandpa_letter.webp",fair:"bg_fair.webp",local:"bg_local.webp",district:"bg_district.webp",ring:"bg_local.webp",final:"bg_final.webp",hall:"bg_hall.webp",gym:null,gymdusk:"gym1.webp",food:"bg_food.webp",temple:"bg_temple.webp",cafe:"bg_cafe.webp",river:"bg_river.webp",market:"bg_market.webp",rooster:"bg_rooster.webp",farm:"bg_farm.webp"};
const cardFaceSrc=C=>{const scene=(C.steps||[]).find(s=>s.n===C.c)||{},mood=scene.f||"happy",look=scene.l||"casual";
  if(look==="train")return `${ASSET}${C.c}_train_face.webp`;
  if(look==="fight")return `${ASSET}${C.c}_${["happy","sad","flustered","angry"].includes(mood)?mood:"happy"}_face.webp`;
  const suffix=["pout","sad","angry"].includes(mood)?"_pout":["flustered","surprised"].includes(mood)?"_flustered":"";
  return `${ASSET}${C.c}_casual${suffix}_face.webp`;};
const cardArtHTML=(C,lazy=false)=>`<span class="card-art" style="--card-scene:url('${ASSET}${BGIMG[C.bg]||BGIMG.camp}')"><img src="${cardFaceSrc(C)}" alt="" ${lazy?'loading="lazy" decoding="async"':""}></span>`;
// v1.34: portraits for the market and helmet-gang side characters (matched by speaker name, or st.img)
const NPC_IMG=[[/แม่ค้า|ป้าศรี|Auntie Sri|vendor/,"vendor_green"],[/ป้าแต๋ว|เจ๊หมวย|ป้าขาย|Auntie Taew|Jae Muay/,"vendor_red"],[/เสี่ยหมวกทองคำ|Big Boss Golden Helmet/,"gang_boss"],[/หมวก|แจ็กเก็ต|Helmet|Jacket/,"gang_group"],[/ยาย|Grandma/,"grandma"]];
const npcImg=st=>st.img||(st.who&&(NPC_IMG.find(([r])=>r.test(st.who))||[])[1])||null;
const TIER_BG={evloy:"bg_river.webp",pro:"bg_fair.webp",semi:"bg_hall.webp",local:"bg_local.webp",district:"bg_district.webp",final:"bg_final.webp",exhibition:"bg_fair.webp",special:"bg_district.webp",quest:"bg_food.webp",beast:"bg_fair.webp",dm:"bg_hall.webp"};
const gymBg=()=>`gym${G?campLevel(G):1}.webp`;
// v1.13 pixel icons — no emoji in the fight UI
function pxIcon(rows,pal){const h=rows.length,w=rows[0].length;let r="";rows.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!=="."&&pal[c])r+=`<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${pal[c]}"/>`;}));
  return `<svg class="pxi" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;}
// v1.69.1: pixel gamepad for minigame tags (no emoji)
const JOY_PX=pxIcon(["..kkkkkkkk..",".kggggggggk.","kggwggggrggk","kgwwwgggggrk","kggwggggrggk","kgggkkkkgggk",".kgk....kgk.","..k......k.."],{k:"#1b1530",g:"#8f86b0",w:"#ffffff",r:"#ffd34a"}).replace('class="pxi"','class="pxi joypx"');
const PIX={
  sk_atk:pxIcon(["..........",".kkkkkkk..","kydydydyk.","kyyyyyyyk.","kyyyyyyykk","kyyyyyyyyk",".kyyyyyyk.",".kyyyyyk..","..kyyyk...","..kkkkk..."],{k:"#4a1020",y:"#ff6a4d",d:"#b8322a"}),
  sk_def:pxIcon([".kkkkkkkk.",".kbbbbbbk.",".kbwbbbbk.",".kbwbbbbk.",".kbbbbbbk.",".kbbbbbbk.","..kbbbbk..","..kbbbbk..","...kbbk...","....kk...."],{k:"#16264a",b:"#4a8fe8",w:"#bfe0ff"}),
  sk_rec:pxIcon(["..........",".kk...kk..","kggk.kggk.","kgwgkgggk.","kgggggggk.",".kgggggk..","..kgggk...","...kgk....","....k.....",".........."],{k:"#123a22",g:"#3fd17a",w:"#c8ffd9"}),
  water:pxIcon(["....kk....","...kbbk...","..kbbbbk..","..kbwbbk..",".kbwbbbbk.",".kbbbbbbk.",".kbbbbbdk.","..kbbbdk..","...kkkk...",".........."],{k:"#16324f",b:"#4aa8ff",w:"#d8f0ff",d:"#2a6fc4"}),
  rub:pxIcon(["...kkkk...","...kyyk...","....kk....","...kooк...".replace("к","k"),"..koooook.","..kowoook.","..kowoook.","..koooook.","..kddddok.","...kkkkk.."],{k:"#3a2412",o:"#e8a23a",w:"#fff1c4",y:"#f7d24a",d:"#b06a1a"}),
  gift:pxIcon(["..k....k..",".kyk..kyk.","..kykkyk..","kkkkkkkkkk","krrrryrrrk","kkkkkkkkkk",".krrryrrk.",".krrryrrk.",".krrryrrk.",".kkkkkkkk."],{k:"#3a1420",r:"#e23b4e",y:"#f7d24a"}),
  wipe:pxIcon(["..........","..kkkkkk..",".kwwwwwwk.",".kwwwwwwk.",".kbbbbbbk.",".kwwwwwwk.",".kwwwwwwk.",".kwwwwwwk.",".kgwgwgwk.","..kkkkkk.."],{k:"#3a3550",w:"#f4f1ea",b:"#4a7fe0",g:"#c9c3b8"}),
  cheer:pxIcon(["..........",".kkk..kkk.","krrrkkrrrk","krwrrrrrrk","krwrrrrrrk","krrrrrrrrk",".krrrrrrk.","..krrrrk..","...krrk...","....kk...."],{k:"#4a1020",r:"#ff4d6d",w:"#ffd0da"}),
  thumb:pxIcon(["....kk....","...kssk...","...kssk...","..kkssk...",".kssssskk.",".ksssssssk",".ksssssssk",".ksssssssk","..kssssskk","...kkkkk.."],{k:"#3a2412",s:"#f7d24a"}),
  flag:pxIcon(["k.........","kwwwwww...","kwwwwwww..","kwwwwww...","kwwwwwww..","k.........","k.........","k.........","k.........","kk........"],{k:"#3a3550",w:"#f4f1ea"}),
  coach:pxIcon(["..gggggg..",".gggggggg.",".gsssssss.",".skssskss.",".sssssssss".slice(0,10),".ssgggsss.","..sgggss..","..rwwwwr..",".rrwwwwrr.",".rrrrrrrr."],{g:"#cfd3da",s:"#e2a978",k:"#2a1a10",r:"#c8283c",w:"#ffffff"})};
const coachOn=()=>SETTINGS.coach&&!(G&&G.coachAway&&G.week<G.coachAway);

// v1.6: three save slots (the old single save moves into slot 1)
const SLOTS=3;const slotKey=i=>`${SAVE_KEY}-s${i}`;
try{const old=localStorage.getItem(SAVE_KEY);if(old&&!localStorage.getItem(slotKey(1))){localStorage.setItem(slotKey(1),old);}if(old)localStorage.removeItem(SAVE_KEY);}catch(e){}
// v1.29.1: every save carries the game version; before an older save is upgraded, the untouched copy is kept as a backup
const bakKey=i=>`${slotKey(i)}-bak`;
function backupSlot(i){try{const raw=localStorage.getItem(slotKey(i));if(!raw)return;const o=JSON.parse(raw);if(o.ver===VERSION)return;
  localStorage.setItem(bakKey(i),JSON.stringify({ver:o.ver||"?",week:o.week,at:Date.now(),raw}));}catch(e){}}
function bakInfo(i){try{const b=JSON.parse(localStorage.getItem(bakKey(i))||"null");return b&&b.raw?b:null;}catch(e){return null;}}
function safeFix(s){try{return fixSave(s);}catch(e){console.error(e);return null;}}
function save(){try{if(G&&UI.slot){G.savedAt=Date.now();G._lang=CUR_LANG;G.ver=VERSION;localStorage.setItem(slotKey(UI.slot),JSON.stringify(G));cloudPush(UI.slot);}}catch(e){}}
// v1.19 cloud save: browser storage can be wiped (other browser/device, private mode, cleared data), so each slot is
// mirrored to this viewer's private space in the artifact's database; on open, whichever copy is newer wins
const CLOUD={db:null,uid:null,ready:false,state:"off",timer:null,busy:false,again:new Set()};
const cloudDoc=i=>CLOUD.db.collection("data/users/"+CLOUD.uid).doc("slot"+i);
function cloudPush(i){if(!CLOUD.ready||!i)return;CLOUD.again.add(i);clearTimeout(CLOUD.timer);CLOUD.timer=setTimeout(cloudFlush,2500);}
async function cloudFlush(){if(CLOUD.busy){CLOUD.timer=setTimeout(cloudFlush,1500);return;}CLOUD.busy=true;
  for(const i of [...CLOUD.again]){CLOUD.again.delete(i);const raw=localStorage.getItem(slotKey(i));
    try{if(raw){const s=JSON.parse(raw);await cloudDoc(i).set({json:raw,savedAt:s.savedAt||Date.now(),v:VERSION});}else await cloudDoc(i).delete();CLOUD.state="ok";}catch(e){CLOUD.state="err";}}
  CLOUD.busy=false;}
async function cloudInit(){try{if(!window.claude||!window.claude.use)return;const db=await window.claude.use("db"),user=await window.claude.use("user");if(!db||!user)return;
  const uid=await user.id();if(!uid)return;CLOUD.db=db;CLOUD.uid=uid;let pulled=0;
  for(let i=1;i<=SLOTS;i++){const snap=await cloudDoc(i).get();const d=snap.exists?snap.data():null;const loc=loadSlot(i);
    if(d&&typeof d.json==="string"&&(!loc||(d.savedAt||0)>(loc.savedAt||0))){try{localStorage.setItem(slotKey(i),d.json);pulled++;}catch(e){}}
    else if(loc&&(!d||(loc.savedAt||0)>(d.savedAt||0)))CLOUD.again.add(i);}
  CLOUD.ready=true;CLOUD.state="ok";if(CLOUD.again.size)cloudPush([...CLOUD.again][0]);if(pulled&&!G)render();}catch(e){CLOUD.state="err";}}
setTimeout(cloudInit,0);
function exportSave(){if(!G)return;const data=JSON.stringify(G),fn=`muaythaimoe-slot${UI.slot}-wk${G.week}.json`;
  (async()=>{try{const dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;if(dl){await dl.save({filename:fn,data});toast("Save exported");return;}}catch(e){if(e&&e.code==="declined")return;}
    try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();toast("Save exported");}catch(e){toast("Export failed");}})();}
function importSave(file){const r=new FileReader();r.onload=()=>{try{let s=JSON.parse(r.result);if(!s||!s.F||!s.week)throw 0;if(typeof I18N_FIX==="function")s=I18N_FIX(s);const i=UI.slot||1;fixSave(s);G=s;UI.slot=i;save();UI.modal=null;UI.title=null;UI.tab="home";AU.startMusic("hub");render();toast(`Imported save into slot ${i}`);}catch(e){toast("Invalid save file");}};r.readAsText(file);}
function loadSlot(i){try{const s=localStorage.getItem(slotKey(i));return s?(typeof I18N_FIX==="function"?I18N_FIX(JSON.parse(s)):JSON.parse(s)):null;}catch(e){return null;}}
function loadSave(){for(let i=1;i<=SLOTS;i++){if(loadSlot(i))return loadSlot(i);}return null;}
function clearSave(i=UI.slot){try{if(i)localStorage.removeItem(slotKey(i));}catch(e){}}
function slotInfo(s){if(!s)return "Empty";const d=s.savedAt?new Date(s.savedAt):null;
  return `${esc(s.player.name)} · Week ${Math.min(s.week,52)} · ${fmt(s.cash)} · Camp Lv.${campLevel(s)}${d?` · ${d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})} ${d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}`:""}`;}
function slotsHTML(mode){const rows=[];for(let i=1;i<=SLOTS;i++){const s=loadSlot(i);
    rows.push(`<div class="slot ${s?"":"empty"}"><div class="sl-i">${i}</div><div class="sl-t"><b>Save slot ${i}</b><small>${slotInfo(s)}</small></div>
     ${mode==="load"?(s?`<button class="btn sm gold" data-act="loadslot" data-v="${i}">Load</button><button class="btn sm ghost" data-act="askdelslot" data-v="${i}" aria-label="Delete slot ${i}">Delete</button>`:""):
       `<button class="btn sm ${s?"":"primary"}" data-act="pickslot" data-v="${i}">${s?"Overwrite":"Select"}</button>`}</div>`);}
  const del=UI.delSlot?`<div class="confirm px"><b>Delete save slot ${UI.delSlot}?</b><p class="meta">This can't be undone</p><div class="mfoot"><button class="btn ghost" data-act="canceldel">Cancel</button><button class="btn primary" data-act="delslot">Delete</button></div></div>`:"";
  const ow=UI.owSlot?`<div class="confirm px"><b>Overwrite save slot ${UI.owSlot}?</b><p class="meta">The old game in this slot will be lost</p><div class="mfoot"><button class="btn ghost" data-act="cancelow">Cancel</button><button class="btn primary" data-act="confirmow">Start a new game here</button></div></div>`:"";
  return `<h2>${mode==="load"?"Load game":"Choose a save slot for the new game"}</h2><div class="slots">${rows.join("")}</div>${del}${ow}`;}

// ---------- small components ----------
function faceImg(f,cls=""){return f.canon?`<img class="face ${cls}" style="--c:${f.color}" src="${faceSrc(f.id,"happy")}" alt="${esc(f.name)}">`:
  `<canvas class="face npcface ${cls}" width="96" height="96" data-sprite="${f.id}" data-mode="guard" style="--c:${f.color}" aria-label="${esc(f.name)}"></canvas>`;}
function hearts(b){const v=Math.max(0,Math.min(100,b||0));let h="";for(let k=0;k<10;k++){const p=Math.max(0,Math.min(1,(v-k*10)/10));h+=`<i class="hp" style="--p:${p}"></i>`;}
  const tier=v>=85?"Deeply bonded":v>=65?"Close":v>=45?"Friends":v>=25?"Getting familiar":"Acquaintance";return `<span class="hearts" title="Bond ${Math.round(v)}/100">${h}<small>${tier}</small></span>`;}
function bar(label,v,color,txt){return `<div class="bar"><span>${label}</span><i style="--v:${clamp(v,0,100)}%;--bc:${color}"></i><b class="num">${txt??Math.round(v)}</b></div>`;}
function mini(v,color){return `<i class="mini" style="--v:${clamp(v,0,100)}%;--bc:${color}"></i>`;}
function xpBar(f){const need=xpNeed(f.lvl);return `<div class="xp"><span class="lv">Lv.${f.lvl}</span><i style="--v:${f.lvl>=10?100:clamp(f.xp/need*100,0,100)}%"></i><span class="num dim">${f.lvl>=10?"MAX":`${Math.round(f.xp)}/${need}`}</span>${f.sp>0&&f.camp==="player"?`<button class="spchip" data-act="ptab" data-v="skill">★ ${f.sp} skill pts</button>`:""}</div>`;}
function formHTML(f){return `<span class="form">${f.form.map(r=>`<i class="${r}">${r==="W"?"W":r==="L"?"L":"D"}</i>`).join("")||'<span class="dim">—</span>'}</span>`;}
const rec=f=>`${f.rec.w}-${f.rec.l}-${f.rec.d}`;
const condColor=c=>c>=70?"var(--green)":c>=45?"var(--warn)":"var(--red)";
const stageLabel=()=>STAGE_NAME[stageOf(G.week)];
function toast(msg){UI.toast={msg,t:Date.now()};render();setTimeout(()=>{if(UI.toast&&Date.now()-UI.toast.t>2300){UI.toast=null;render();}},2500);}
const ICON={home:'<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',train:'<path d="M2 10h3v4H2zM19 10h3v4h-3zM5 8h3v8H5zM16 8h3v8h-3zM8 11h8v2H8z"/>',
  fights:'<path d="M4 4h6l2 3v6l-2 2H6l-2-2zM14 9h6v6l-2 3h-4l-1-3z"/>',people:'<path d="M8 4a4 4 0 110 8 4 4 0 010-8zM2 21c0-4 3-7 6-7s6 3 6 7zM17 6a3 3 0 110 6 3 3 0 010-6zM15 14c4 0 7 2 7 7h-6"/>',
  camp:'<path d="M2 11 12 3l10 8v2h-2v8H4v-8H2zM9 21v-6h6v6"/>',gear:'<path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v2l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-2L1 9l2-4 3 1 3-1zM12 8a4 4 0 100 8 4 4 0 000-8z"/>',
  up:'<path d="M12 4l7 8h-4v8H9v-8H5z"/>',down:'<path d="M12 20l-7-8h4V4h6v8h4z"/>'};
const icon=k=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const moveIcon=m=>!m?'<span class="mv eq">–</span>':m>0?`<span class="mv up">▲${m}</span>`:`<span class="mv dn">▼${-m}</span>`;

// ---------- root render ----------
function render(){
  document.documentElement.classList.toggle("vnopen",!!(UI&&(UI.scene||UI.fight)));
  let h="";
  if(!G)h=UI.creator?creatorHTML():titleHTML();
  else if(UI.ending)h=endingHTML();
  else h=`<div class="shell">${hubHTML()}</div>`;
  if(G&&UI.petName!=null&&!UI.scene&&!UI.fight){if(UI.modal&&UI.modal.type!=="petname")UI.modalQ=UI.modal;UI.modal={type:"petname",i:UI.petName};UI.petName=null;} /* v1.80: naming comes first, whatever else is waiting */
  if(UI.modal)h+=modalHTML();
  if(G&&UI.montage)h+=montageHTML();
  if(G&&UI.fight)h+=fightHTML();
  if(UI.scene)h+=sceneHTML();
  if(UI.toast)h+=`<div class="toast" role="status">${esc(UI.toast.msg)}</div>`;
  const keep={};document.querySelectorAll(".pxscroll[data-sk]").forEach(e=>keep[e.dataset.sk]=e.scrollTop);const fsEl=document.querySelector(".fight"),fsTop=fsEl?fsEl.scrollTop:0;
  const albumTop=document.querySelector(".m-album")?.parentElement.scrollTop||0;
  $app.innerHTML=h;
  document.querySelectorAll(".pxscroll[data-sk]").forEach(e=>{const k=e.dataset.sk;if(keep[k]!=null&&!UI.resetScroll)e.scrollTop=keep[k];});{const f2=document.querySelector(".fight");if(f2&&fsTop)f2.scrollTop=fsTop;} /* v1.80: the fight screen re-renders every beat; keep its scroll put */UI.resetScroll=false;{const cb=document.querySelector(".cbody");if(cb)cb.scrollTop=cb.scrollHeight;}
  if(albumTop&&UI.modal?.type==="album"){const modal=document.querySelector(".m-album");if(modal)modal.parentElement.scrollTop=albumTop;}
  const fc=document.getElementById("fstage");if(fc)FS.attach(fc);
  const lg=document.querySelector(".flog");if(lg)lg.scrollTop=lg.scrollHeight;
  mountCanvases();if(typeof mountQSprites==="function")mountQSprites();pxBars();spotPaint();
  if(typeof newsSync==="function")newsSync();
}
// v1.12.1 spotlight intro: dim the screen and teach one part of it at a time
const SPOT=[
  {sel:".hud .stats",t:"These are your <b>cash</b> and <b>fame</b>. Run out of cash and the camp closes! A flashing ⚠ means money is about to run out"},
  {sel:".hud .wk",t:"A season has <b>52 weeks</b>. First goal: reach the <b>subdistrict top 4</b> by week 20"},
  {sel:".campact",t:"Choose one <b>camp activity</b> per week. A <b>special class</b> earns money; if you don't want to spend, choose <b>camp day off</b>"},
  {sel:".fgrid",t:"<b>Fighter cards</b>: tap to see stats, skills and relationships. The green bar is <b>readiness</b>, the orange bar is <b>fatigue</b>"},
  {sel:'.tabs [data-v="train"]',t:"<b>Train</b>: set the training program. Over <b>50</b> fatigue, rest and recover"},
  {sel:'.tabs [data-v="fights"]',t:"<b>Fights</b>: accept fight offers. <b>Scout tapes</b> first to know what <b>counter-training</b> to do"},
  {sel:'.tabs [data-v="people"]',t:"<b>Characters</b>: use free time to take fighters out. The <b>closer</b> you are, the harder they fight"},
  {sel:'.tabs [data-v="camp"]',t:"<b>Camp</b>: finances, hire coaches, upgrade the camp, sign new fighters"},
  {sel:".endweek",t:"When you're done, press <b>End week</b>. Let's go!"}];
function spotPaint(){document.querySelectorAll(".spot-ov").forEach(e=>e.remove());if(UI.spot==null||!G||UI.scene||UI.fight||UI.modal||!document.querySelector(".hud"))return;
  const st=SPOT[UI.spot];if(!st){UI.spot=null;G.seen.spot=true;save();return;}const el=document.querySelector(st.sel);if(!el){UI.spot++;spotPaint();return;}
  const main=document.querySelector("main");if(main&&main.contains(el)){const r0=el.getBoundingClientRect(),m0=main.getBoundingClientRect();if(r0.bottom>innerHeight-150||r0.top<m0.top)main.scrollTop+=r0.top-m0.top-60;}
  const r=el.getBoundingClientRect(),pad=6,ov=document.createElement("div");ov.className="spot-ov";
  const below=r.top+r.height/2<innerHeight/2;
  ov.innerHTML=`<div class="spot-hole" style="left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>
   <div class="spot-box px" style="${below?`top:${Math.min(innerHeight-190,r.bottom+pad+12)}px`:`bottom:${Math.min(innerHeight-190,innerHeight-r.top+pad+12)}px`}">
    <div class="spot-ic" aria-hidden="true"></div><p>${st.t}</p>
    <div class="spot-ft"><span class="meta">${UI.spot+1}/${SPOT.length}</span><button class="btn sm ghost" data-act="spotskip">Skip</button><button class="btn sm primary" data-act="spotnext">${UI.spot===SPOT.length-1?"Let's go!":"Next ▸"}</button></div></div>`;
  document.body.appendChild(ov);}

// v1.11: retro pixel scrollbars — the page stays put, panels scroll inside themselves
function pxBars(){document.querySelectorAll(".pxbar").forEach(b=>b.remove());if(UI.fight||UI.scene)return; /* v1.80: no hub scrollbar flickering over the fight */
  document.querySelectorAll(".pxscroll").forEach(el=>{if(el.scrollHeight<=el.clientHeight+4)return;const bar=document.createElement("div");bar.className="pxbar";bar.innerHTML="<i></i>";document.body.appendChild(bar);
    let hide=0;const upd=show=>{if(!el.isConnected){bar.remove();return;}const r=el.getBoundingClientRect();const top=Math.max(r.top,0),bot=Math.min(r.bottom,innerHeight);
      bar.style.top=(top+6)+"px";bar.style.height=Math.max(0,bot-top-12)+"px";bar.style.left=(r.right-12)+"px";
      const h=Math.max(.12,el.clientHeight/el.scrollHeight),p=el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight);
      bar.firstChild.style.height=(h*100)+"%";bar.firstChild.style.top=(p*(1-h)*100)+"%";
      if(show){bar.classList.add("on");clearTimeout(hide);hide=setTimeout(()=>bar.classList.remove("on"),1100);}};
    upd(false);el.addEventListener("scroll",()=>upd(true),{passive:true});});}
addEventListener("resize",()=>pxBars());
setInterval(()=>{try{AU.watch();if(G&&SETTINGS.music&&!AU.playing&&!UI.fight)AU.startMusic(UI.scene&&UI.scene.music||"hub");}catch(e){}},2000);

// ---------- title ----------
function titleHTML(){const sv=loadSave();
  return `<div class="title ${UI.title==="tap"?"t-tap":"t-menu"}" ${UI.title==="tap"?'data-act="tapstart"':""}>
   <picture class="tart" aria-hidden="true"><source media="(orientation:portrait)" srcset="${ASSET}poster_m.webp"><img src="${ASSET}poster_d.webp" alt=""></picture>
   <div class="tshade" aria-hidden="true"></div>
   <div class="sparks" aria-hidden="true">${Array.from({length:16},(_,i)=>`<i style="--x:${(i*37)%100}%;--d:${(i*0.7)%6}s;--s:${6+(i*13)%7}s"></i>`).join("")}</div>
   <div class="tfront"><h1 class="tlogo"><img src="${ASSET}logo.webp" alt="Muay Thai Moe — The Women's Muay Thai Management Simulator"></h1>
   <div class="tmid">${UI.title==="tap"?`<button class="tapstart" data-act="tapstart">TAP TO START</button><p class="tsub">Tap to begin</p>`:
   `<nav class="px tmenu" aria-label="Main menu">
     <button class="btn primary" data-act="newgame">New game</button>
     <button class="btn gold" data-act="openload" ${sv?"":"disabled"}>Load game<small>${sv?`${[1,2,3].filter(i=>loadSlot(i)).length}/3 slots used`:"No saves yet"}</small></button>
     <button class="btn" data-act="settings">Settings</button></nav>`}</div></div>
   ${langSwitch("tlang")}<div class="version">© 2026 Muay Thai Moe${UI.title==="tap"?"":` · <a class="tdisc" href="${GATE.url}" target="_blank" rel="noopener">Discord</a>`} · v${VERSION}</div></div>`;}
// v1.48: shareable world seeds — digits are used as-is, words are hashed
function seedFrom(v){v=String(v||"").trim();if(!v)return undefined;if(/^\d{1,10}$/.test(v))return Number(v)>>>0;let h=2166136261;for(const ch of v.toLowerCase()){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function crSeed(){const e=document.getElementById("pseed");if(e&&UI.creator)UI.creator.seed=e.value.trim();}
const seedHTML=()=>G?`<div class="set"><span><b>This world's seed</b><small>Share it so friends get the same world · include it (with the week) when reporting bugs</small></span><span class="obtns"><code class="seedv">${esc(G.seedText||String(G.seed))}</code><button class="btn sm" data-act="copyseed">Copy</button></span></div>`:"";
function settingsHTML(){const t=(k,label,desc)=>`<label class="set"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" data-act="setopt" data-k="${k}" ${SETTINGS[k]?"checked":""}></label>`;
  return `<h2>Settings</h2><div class="sets"><div class="set"><span><b>Language · ภาษา</b><small>Switching reloads the game. Your saves are kept</small></span>${langSwitch()}</div>${t("music","Music","Pi chawa, khaek drums and ching during fights")}${t("sfx","Sound effects","Punches, kicks, bells, cheering")}${t("coach","Coach Daeng's tips","Coach guides you on the camp screen, fight offers and between rounds")}${t("quick","Fast mode","Skip the training scenes at week's end and go straight to the summary")}${seedHTML()}</div>
   ${!G&&loadSave()?`<div class="set danger"><span><b>Manage save slots</b><small>View, load or delete each slot</small></span><button class="btn sm" data-act="openload">Open</button></div>`:""}${G?`<p class="meta">Playing save slot ${UI.slot} · autosaves whenever you make progress ${CLOUD.ready?" · backed up to the cloud":" · not connected to the cloud (saved in this browser only)"}</p>
   ${G&&UI.slot&&bakInfo(UI.slot)?`<div class="set"><span><b>Pre-update save</b><small>Kept when the game updated · v${esc(String(bakInfo(UI.slot).ver))} week ${bakInfo(UI.slot).week}</small></span><button class="btn sm" data-act="bakrestore">Restore</button></div>`:""}
   <div class="set"><span><b>Enter code</b><small>Event or continue codes from the game page and Discord</small></span><span class="obtns redeem"><input id="redeemcode" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Code" aria-label="Code"><button class="btn sm primary" data-act="redeem">Redeem</button></span></div>
   <div class="set"><span><b>Back up save to file</b><small>Keep the file yourself; import it on another device or browser</small></span><span class="obtns"><button class="btn sm" data-act="exportsave">Export</button><label class="btn sm">Import<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></span></div>`:`<div class="set"><span><b>Import a save file</b><small>A previously exported file goes into slot 1</small></span><label class="btn sm">Import<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></div>`}
   <details class="gloss"><summary><b>Game glossary</b></summary><dl>${GLOSS.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></details>
   <p class="meta">Muay Thai Moe v${VERSION}</p>`;}
const GLOSS=[["Readiness","Condition on fight day. The higher, the better she fights. Drops with fatigue or injury"],["Fatigue","Builds up from training. Over 65 risks injury. Reduce with recovery, the recovery room, the kitchen"],
 ["Morale","Higher morale means sharper strikes. Rises with wins, dates, merit-making; drops with losses or overtraining"],["Bond","Her closeness to you. Unlocks special scenes, the signature move at 60, and raises the chance of blood-boil mode"],
 ["Trust","How much a fighter trusts your orders. Higher trust makes corner orders work better (up to +4% accuracy); at 60 losses hurt morale less, and it affects confession scenes · raise it with merit-making scenes, wai khru, not overtraining, and a camp out of debt"],["Fame","How well-known the camp is. The higher, the more students come"],
 ["Skill points","Earned every level-up, spent on the ancient techniques of the fighter's school"],["Counter-training","After scouting a tape, train the program that counters the opponent's main weapon in the week before the fight for a fight-day bonus"],
 ["Blood-boil mode","When badly hurt or behind on points, a fighter may 'change eyes' for a moment: stronger counters, easier criticals. Once per fight"],["Wai khru ram muay","Ritual before the first fight, canon matchups, and major bouts. Choose a dance; each gives a different effect"]];

// ---------- creator (manager look) ----------
function creatorHTML(){const c=UI.creator,O=CHIBI.OPT;
  const sw=(prop,list)=>`<div class="sw">${list.map(v=>`<button style="background:${v}" aria-label="${v}" aria-pressed="${c[prop]===v}" data-act="cset" data-k="${prop}" data-v="${v}"></button>`).join("")}</div>`;
  const seg=(prop,list)=>`<div class="seg">${list.map(([v,t])=>`<button data-act="cset" data-k="${prop}" data-v="${v}" aria-pressed="${c[prop]===v}">${t}</button>`).join("")}</div>`;
  const F=(label,inner)=>`<div class="field"><span class="lb">${label}</span>${inner}</div>`;
  const tab=c.tab||"base";
  const T={base:F("Gender (affects dialogue)",seg("gender",[["m","Male"],["f","Female"]]))+F("Difficulty",seg("diff",[["easy","Easy"],["normal","Normal"],["hard","Hard"]]))+`<p class="meta">${{easy:"Rivals grow slower, more class income. For players who want the story",normal:"Balanced as designed",hard:"Ploy and Fah are tougher, use stronger skills, money is tighter"}[c.diff||"normal"]}</p>`+F("Seed (optional)",`<input id="pseed" maxlength="20" value="${esc(c.seed||"")}" autocomplete="off" placeholder="Leave blank = random world">`)+`<p class="meta">Use the same seed as a friend to get the same world: rival fighters, fight offers and random events all match. Numbers or words both work.</p>`,
   face:F("Hairstyle",seg("hairStyle",O.hairStyle))+F("Hair color",sw("hair",O.hair))+`<div class="two">${F("Skin tone",sw("skin",O.skin))}${F("Eye color",sw("eyes",O.eyes))}</div>`,
   wear:F("Outfit",seg("outfit",[["tee","T-shirt"],["polo","Polo"],["suit","Suit"],["hoodie","Hoodie"]])+sw("outfitColor",O.cloth))+F("Pants",seg("pants",[["long","Long"],["shorts","Shorts"]])+sw("pantsColor",["#1f1f24","#2c3e6b","#5a4a3a","#8a8f99","#e8dcc0"])),
   acc:F("Hat",seg("hat",[["none","None"],["cap","Cap"],["bucket","Bucket"]]))+(c.hat!=="none"?F("Hat color",sw("hatColor",O.cloth)):"")+F("Glasses",seg("glasses",[["none","None"],["glasses","Prescription"],["sun","Sunglasses"]]))};
  return `<div class="creator v2"><div class="cr-in">
   <header class="cr-head"><h1>The new camp owner</h1><p class="lead">You are Grandpa Chai's grandchild, heir to Sirichai Camp</p></header>
   <div class="px cr-top"><div class="cr-stage"><canvas width="240" height="320" data-chibi="creator" aria-label="Character preview"></canvas></div>
     <div class="cr-id"><div class="field"><label for="pname">Name</label><input id="pname" maxlength="14" value="${esc(c.name||"")}" autocomplete="off" placeholder="${c.gender==="m"?"Start":"Dao"}"></div>
      <button class="btn sm" data-act="crand">Randomize all</button></div></div>
   <div class="seg cr-tabs" role="tablist">${[["base","Basics"],["face","Hair · Face"],["wear","Outfit"],["acc","Extras"]].map(([k,t])=>`<button role="tab" data-act="ctab" data-v="${k}" aria-pressed="${tab===k}">${t}</button>`).join("")}</div>
   <div class="px cr-opts">${T[tab]}</div>
   <div class="cr-foot"><button class="btn ghost" data-act="cancelCreate">Back</button><button class="btn primary" data-act="startGame">Inherit the camp ▸</button></div>
  </div></div>`;}

// ---------- hub ----------
const TABS=[["home","Camp"],["train","Train"],["fights","Fights"],["people","People"],["camp","Manage"]];
// v1.12: warn before the money runs out, not after
function weeksLeft(){const net=weeklyNet(G)-(G.debt>0?Math.min(5000,G.debt)/4:0);if(net>=0)return 99;return Math.max(0,Math.floor(G.cash/-net));}
// v1.13 news ticker — boxing world, rival camps, our camp
// v1.22: the ticker is mostly silly local news — it slides through once and is gone
const FUNNY_NEWS=["Uncle Wang the motorbike taxi announces 'Cut the queue, meet a Chaiya knee.' The new driver has moved to another street","Auntie Taew launches 'Kati-level spicy' som tam; the entire shop in tears","The fighting rooster next to Sirichai pecked a heavy bag open. Owner insists 'he's training'",
 "The camp's orange cat gained 2 kilos. The culprit: the bag of khanom khrok that vanishes every night","Coach Daeng was spotted smiling at the corner of his mouth for the first time in ten years. Witnesses still in shock","Tourist wears a mongkhon around a mall; people bow so much the mall makes a PA announcement",
 "The temple near camp holds a fair; the balloon-shooting stall takes heavy losses after a girl in glasses pops ten in a row","Golden Tiger's boss buys a brand-new van painted entirely gold. Villagers mistake it for a parade float","Survey: 8 in 10 villagers hear Sirichai's heavy bags at 5 a.m. and have never slept in since",
 "Landlady Jae Muay travels to Japan, leaves green-tea KitKats for the whole street","The karaoke bar next to camp pleads: 'No fighters singing luk thung after 10 p.m.'","Neighbor kid opens a wai khru class for dolls. Tuition paid in candy",
 "Longan orchard tycoon announces 'Any KO win gets a ton of longan.' Fight camps across the province tremble","The district stadium installs new air conditioning, but forgets the fighters' rooms","A Muay Thai judge insists 'I wasn't asleep, I was listening to the punches with my eyes closed'",
 "The motorbike taxi outside camp launches 'Fighter to the ring in 5 minutes.' Fare paid in autographs","Golden Tiger's glove-sale livestream crashes because everyone only asks 'What does Ploy eat?'","The grilled-pork auntie outside the stadium swears 'Every fighter who buys my pork wins' (except the ones who lose)"];
function funnyNews(n){const o=[];for(let i=0;i<n;i++)o.push(FUNNY_NEWS[(G.week*7+i*5+(G.seed%11))%FUNNY_NEWS.length]);return o;}
function newsItems(){const N=[...(G.lvNews||[]).slice(0,1)],st=standings(G,"A").slice(0,3),R=roster(G);
  if(st[0])N.push(`Div A table: ${G.F[st[0].id].name} leads in 1st place`);
  const rv=Object.values(G.F).filter(f=>f.camp==="rival");if(rv.length)N.push(`Golden Tiger enters ${rv.length} fighters. The boss declares "This year the title is ours"`);
  for(const f of R){const h=f.rec||{w:0,l:0};if(h.w>=3)N.push(`${f.name} of Sirichai is on fire, already won ${h.w} fights`);}
  if(G.rep>=10)N.push(`Sirichai Muay Thai Camp is being talked about again after years of silence`);
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];if(nb)N.push(`Week ${nb.week}: ${G.F[nb.a].name} vs ${G.F[nb.b].name}`);
  N.unshift(...funnyNews(2));
  if(typeof bdayWeek==="function")for(const id of ["kati","mali","rin","ploy","fah"]){const f=G.F[id];if(!f||!(f.camp==="player"||f.met))continue;const d=bdayWeek(id)-G.week;if(d>=0&&d<=2)N.unshift(d===0?`🎂 This week: birthday of ${f.name}!`:`🎂 In ${d} weeks: birthday of ${f.name}`);}
  N.push(["Muay oil prices up 5 baht. Vendor says 'business is good lately'","The district stadium installs new air con. No more fanning for spectators","An 80-year-old Korat coach still teaches the buffalo swing every morning","Women's Muay Thai is booming; attendance nearly doubled","Foreigners flock to learn Muay Thai in high season"][G.week%5]);
  return N;}
function weekTodo(){const R=roster(G),todo=[];if(R.some(f=>!f.injury&&!trLocked(f)))todo.push("Some training programs aren't confirmed yet");if(!G.campUsed)todo.push("No camp activity chosen yet");
  if(G.offers.length&&!G.bookings.some(b=>G.F[b.a].camp==="player"))todo.push("No fights scheduled yet");return todo;}
// v1.15: what reputation actually does, and what it unlocks next
function repSteps(){const L=Object.values(CAMP_ACTIONS).filter(a=>a.rep&&!a.fac).map(a=>[a.rep,"Activity: "+a.name]);L.push([14,"Local TV asks to film the camp (event)"],[20,"District paper covers the camp · more students"],[30,"Fight offers rise to 3 per fighter"],[36,"Provincial TV interviews the manager"],[50,"Regular sponsor ฿1,500/week"],[60,"Province's famous-camp sign"]);return L.sort((a,b)=>a[0]-b[0]);}
function repInfoHTML(){const r=G.rep;
  return `<h2>Camp fame ${r.toFixed(1)}</h2><ul class="fp-list"><li>Higher fame brings more students (steady income)</li><li>Higher fight purses (up to +20%)</li><li>The camp looks better on the camp screen</li></ul>
   <h3>Earned from</h3><p class="meta">Winning fights (higher rounds give more) · camp activities · hosting fight nights · some events (bad choices can lower it)</p>
   <h3>Unlocks</h3><div class="replist">${repSteps().map(([n,t])=>`<div class="${r>=n?"on":""}"><b>${r>=n?"✓":n}</b><span>${t}</span></div>`).join("")}</div>`;}
function newsHTML(){if(UI.newsWeek===G.week)return "";const N=newsItems();if(!N.length)return "";const n=N.slice(0,3).join("   ◆   ");const dur=Math.min(24,Math.max(12,Math.round(n.length/7)));
  return `<div class="newspop" role="status" style="--d:${dur} s"><b class="nlab">Fight news</b><div class="ntrack"><span class="ncrawl">${esc(n)}</span></div><button class="nclose" data-act="newsoff" aria-label="Close news">×</button></div>`;}
function rinBrief(){const r=G.F.rin;if(!r||r.camp!=="player"||G.week%3!==0)return "";const R=roster(G);
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];let t;
  if(nb){const op=G.F[nb.b];t=`${G.F[nb.a].name}'s opponent in week ${nb.week} favors ${{punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"}[oppTop(op)]} ${scouted(op.id)?`Training "${PRESETS[counterPreset(op)].name}" counters it`:"I've scouted the tape for free. Check the fight plan"}`;}
  else{const w=R.map(f=>[f,RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0]]).sort((a,b)=>a[1][1]-b[1][1])[0];t=`The weakest spot in the team right now is ${w[1][0]} of ${w[0].name}. Fix it and the win rate should rise a lot`;}
  return `<div class="px rinnote"><img src="${faceSrc("rin","happy")}" alt=""><span><b>Rin's report</b>${t}</span></div>`;}
function hubHTML(){
  const dots={fights:G.offers.some(o=>!G.bookings.some(b=>b.a===o.a))||dmOfferOn(G),people:(typeof canChat==="function"&&CANON_IDS.some(id=>canChat(G.F[id]))),home:!G.campUsed,train:roster(G).some(f=>!f.injury&&!trLocked(f))};
  return `<header class="hud"><div class="hud-in">
    <div class="brand">MUAY THAI <b>MOE</b></div>
    <div class="wk"><strong class="num">Week ${Math.min(G.week,52)}<small> / Year ${G.season||1}</small></strong><span>${stageLabel()}</span></div>
    <div class="stats"><button class="stat cashbtn" data-act="cashflow"><span>Cash ▸</span><b class="num ${G.cash<0||weeksLeft()<=4?"neg":""}">${fmt(G.cash)}${weeksLeft()<=6?`<i class="cashwarn" title="Money runs out in about ${weeksLeft()} weeks">⚠</i>`:""}</b></button><button class="stat repbtn" data-act="repgraph"><span>Fame ▸</span><b class="num">${G.rep.toFixed(1)}</b></button></div>
    <div class="hbtns"><button class="iconbtn mailbtn ${mailBadge()?"has":""}" data-act="mail" aria-label="Mailbox ${mailBadge()?`, ${mailBadge()} new`:""}">${MAILBOX_PX}${mailBadge()?`<i class="mbadge">${mailBadge()}</i>`:""}</button><button class="iconbtn" data-act="settings" aria-label="Settings">${icon("gear")}</button></div>
    <button class="btn primary endweek ${weekTodo().length?"":"ready"}" data-act="endweek">${weekTodo().length?`End week ▸ <small>(${weekTodo().length} left)</small>`:"Ready · End week ▸"}</button>
  </div>
  <nav class="tabs" aria-label="Menu">${TABS.map(([k,t])=>`<button data-act="tab" data-v="${k}" ${UI.tab===k?'aria-current="page"':""}>${icon(k)}<span>${t}</span>${dots[k]?'<i class="dot" aria-hidden="true"></i>':""}</button>`).join("")}</nav></header>
  <main class="pxscroll" data-sk="main-${UI.tab}">${({home:homeHTML,train:trainHTML,fights:fightsHTML,people:peopleHTML,camp:campHTML})[UI.tab]()}</main>`;}

const DONE_LINES=["Everything's handled this week. Go ahead and end the week","All done. Go grab some sticky rice and grilled pork, then end the week","Everything's ready, Coach has nothing to nitpick. End the week","Work done, training done, plans done. Let's end the week"];
const pickDone=()=>DONE_LINES[G.week%DONE_LINES.length];
function coachTips(force){const T=[],R=roster(G);if(!coachOn()&&!force)return T;
  for(const f of R){const b=G.bookings.find(x=>x.a===f.id);
    if(f.injury)T.push({p:9,t:`${f.name} is injured for ${f.injury} more weeks. The body rests automatically. Don't book fights yet`});
    else if(f.fatigue>=52&&f.plan.preset!=="rest"&&!trLocked(f))T.push({p:9,t:`${f.name}'s fatigue is ${Math.round(f.fatigue)} already. Let her recover this week`,act:{k:"setrest",id:f.id,label:"Go to training"}});
    if(b&&b.week-G.week<=1&&f.plan.preset!=="prep"&&!f.injury&&!trLocked(f))T.push({p:7,t:`${f.name} has a fight in week ${b.week} vs ${G.F[b.b].name}. Switch to fight prep?`,act:{k:"setprep",id:f.id,label:"Go to training"}});
    if(b&&scouted(b.b)){const cp=counterPreset(G.F[b.b]);if(cp&&f.plan.preset!==cp&&b.week-G.week>1&&!trLocked(f))T.push({p:4,t:`The opponent of ${f.name}${COUNTER_WHY[cp]} Train "${PRESETS[cp].name}" to counter for a fight-day bonus`,act:{k:"setprep",id:f.id,label:"Set the program"}});}
    if(b&&!scouted(b.b)&&G.cash>=scoutCost())T.push({p:5,t:`Haven't scouted ${G.F[b.b].name}, the opponent of ${f.name}. Scout first to find the counter`,act:{k:"tab",v:"fights",label:"Scout the tape"}});
    if(b&&!b.planSet)T.push({p:5,t:`No fight plan set for ${f.name} (week ${b.week})`,act:{k:"tab",v:"train",label:"Set the plan"}});
    if(skReady(f))T.push({p:6,t:`${f.name} has ${f.sp} skill point(s), go pick a skill`,act:{k:"fighter",id:f.id,v:"skill",label:"Pick skills"}});
    if(f.plan.preset==="rest"&&f.fatigue<20&&!f.injury&&!trLocked(f))T.push({p:7,t:`${f.name} has recovered (fatigue ${Math.round(f.fatigue)}) but is still set to rest. Resting again wastes a training week`,act:{k:"tab",v:"train",label:"Set the program"}});
    if(f.plan.intensity==="heavy"&&f.fatigue>50)T.push({p:5,t:`${f.name}: long stretch of hard training, watch for injuries`});}
  if(!G.bookings.some(b=>G.F[b.a].camp==="player")&&G.offers.length)T.push({p:5,t:"No fights scheduled. Coach has checked the offers; colors show which are easy or risky",act:{k:"tab",v:"fights",label:"See offers"}});
  if(G.loan>0)T.push({p:G.cash>=G.loan?8:4,t:`Still owe the Gold Helmet loan ${fmt(G.loan)} Interest grows 10% every 4 weeks, and they'll hang around the market more often.${G.cash>=G.loan?" You have enough to repay it now":""}`,act:{k:"tab",v:"camp",label:"Go to finance"}});
  if(loanOk(G))T.push({p:11,t:"There won't be enough money soon. If you're truly desperate there's a quick loan, but Coach hates it: steep interest, and the helmet gang will cause trouble",act:{k:"loan",label:"See quick loan"}});
  if(weeksLeft()<=6){if(true)T.push({p:10,t:`⚠ At this rate, money runs out in about ${weeksLeft()} weeks! Take fights, teach special classes, or cut wages`,act:{k:"tab",v:"fights",label:"See fights"}});}
  else if(weeksLeft()<=10)T.push({p:7,t:`Coach's heads-up: at this income, the money runs out in about ${weeksLeft()} weeks. Take more fights or check the mail for money waiting`,act:{k:"tab",v:"fights",label:"See offers"}});
  else if(weeklyNet(G)<0){const full=studentDemand(G)>studentCap(G);T.push({p:6,t:full?`Spending exceeds income by ${fmt(-weeklyNet(G))}/wk. More people want to learn than we can hold; hiring an assistant coach or expanding the class yard brings more money`:`Spending exceeds income by ${fmt(-weeklyNet(G))}/wk. Try a special class or more fights`,act:full?{k:"tab",v:"camp",sub:"staff",label:"Hire an assistant coach"}:{k:"campacts",label:"Choose a camp activity"}});}
  if(G.cash<0)T.push({p:10,t:`In the red for ${G.negWeeks} weeks. In the red 4 weeks and below ฿10,000, the camp goes bankrupt`});
  if(studentDemand(G)>studentCap(G)+2)T.push({p:5,t:`Classes are full and ${studentDemand(G)-studentCap(G)} more people want to join. Upgrading the class yard holds 3 more each level`,act:{k:"tab",v:"camp",sub:"fac",label:"Upgrade the class yard"}});
  {const un=(G.losses||[]).filter(l=>!l.watched&&G.F[l.b]&&G.F[l.b].camp!=="quest"&&G.week-l.wk<=6);if(un.length)T.push({p:4,t:`Haven't reviewed the fight ${G.F[un[un.length-1].a].name} lost. Watch it with the team for EXP and a read on that opponent`,act:{k:"lossrev",label:"Review fight"}});}
  if(G.disaster&&G.week<G.disaster.until)T.push({p:9,t:`${G.disaster.name} isn't over. Students can ${G.disaster.inc?"only come half the time":"not come at all"} for ${G.disaster.until-G.week} more weeks. Take fights to keep the money going`,act:{k:"tab",v:"fights",label:"See offers"}});
  if(dmOfferOn(G))T.push({p:8,t:"A promoter invites us to an 8-fighter cross-division Death Match, all fought this week. The champion takes ฿40,000!",act:{k:"tab",v:"fights",label:"See offers"}});
  if(!G.campUsed)T.push({p:3,t:"No camp activity chosen this week",act:{k:"campacts",label:"Choose activity"}});
  if(!G.freeUsed)T.push({p:2,t:"Don't forget free time with your fighters. Bond helps morale",act:{k:"tab",v:"people",label:"See characters"}});
  if(G.flags.maliRecruit&&G.F.mali.camp==="free")T.push({p:6,t:"Mali is ready to sign",act:{k:"tab",v:"camp",sub:"staff",label:"Go sign"}});
  if(G.flags.rinRecruit&&G.F.rin.camp==="free")T.push({p:6,t:"Rin is ready to sign",act:{k:"tab",v:"camp",sub:"staff",label:"Go sign"}});
  if(R.some(f=>!f.injury&&!trLocked(f)))T.push({p:4,t:"Some fighters haven't confirmed this week's training",act:{k:"tab",v:"train",label:"Go to training"}});
  // v1.21: once everything is handled, say so instead of repeating old advice
  if(!T.length&&!weekTodo().length)T.push({p:1,t:pickDone(),act:{k:"endweek",label:"End week"}});
  if(!T.length){const f=R[0];const w=RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0];T.push({p:1,t:`The weak spot of ${f.name} right now is ${w[0]}. Try strengthening it`});}
  return T.sort((a,b)=>b.p-a.p);}
function adviseCached(a,b,rounds){const k=`${G.week}_${a}_${b}_${rounds}`;if(!UI.advCache[k])UI.advCache[k]=advise(G,a,b,rounds,30);return UI.advCache[k];}
// v1.14: offer advice reads fatigue, schedule, tape and money, not just the sim win-rate
function offerTipHTML(o){const me=G.F[o.a],op=G.F[o.b];const A=adviseCached(o.a,o.b,o.rounds||3);const v=verdictOf(A.bestRate);const L=[];
  const pct=Math.round(A.bestRate*20)*5;L.push(`About ${pct}% chance to win with the right plan`);
  const pf=Math.round(projFatigue(me));if(me.injury)L.push(`${me.name} is still injured for ${me.injury} weeks, risk of re-injury`);else if(pf>55)L.push(`Fatigue is around ${pf}. If you accept, ease off training before fight day`);
  const near=G.bookings.find(b=>b.a===me.id&&Math.abs(b.week-o.week)<=2);if(near)L.push(`Already has a fight in wk ${near.week}. Fighting too often, the body won't recover`);
  if(!scouted(op.id)&&op.camp!=="quest")L.push(`Tape not scouted, weakness unknown ${op.name}`);
  if(op.camp==="rival")L.push("Beating a Golden Tiger fighter brings big fame");
  if(G.cash<8000)L.push(`Money is tight. The purse of ${fmt(o.lose)} is guaranteed, even in a loss`);
  const go=me.injury||near?"Coach says better to wait for the next fight":A.bestRate>=.6?"Take it, an easy win":A.bestRate>=.4?"Take it, if you counter-train first":"Too early, unless you want to gamble for a big purse";
  return `<h2>What Coach Daeng says</h2><div class="meta">${esc(me.name)} vs ${esc(op.name)} · <b class="${v.c}t">${v.t}</b></div>
   <ul class="fp-list">${L.map(t=>`<li>${t}</li>`).join("")}</ul><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>${go}</b></span></div>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">Got it</button></div>`;}
function verdictOf(rate){return rate>=.6?{c:"green",t:"Weaker",say:"Easy win, but a small purse"}:rate>=.4?{c:"gold",t:"Even",say:"Interesting. Preparation decides it"}:{c:"red",t:"Stronger",say:"Risky, but a big purse and lots of EXP"};}

function rinNoteHTML(){const n=G.rinNote;if(!n||!G.F.rin||G.F.rin.camp!=="player")return "";
  return `<button class="px rinnote" data-act="rinread"><img src="${faceSrc("rin")}" alt=""><span><b>Rin sent a report</b><small>3-week summary · tap to read</small></span><i class="tdot2"></i></button>`;}
// v1.51: pets on the home card — tap once a week to play
function petsRowHTML(){const P=G.pets||[];if(!P.length)return "";return `<div class="petrow">${P.map((p,i)=>{const done=p.wk===G.week;
  return `<span class="petg"><button class="petchip ${done?"done":""}" data-act="petplay" data-v="${i}" ${done?"disabled":""} title="${esc(PETS[p.k].eff)}"><img class="peti" src="${petIcon(p.k)}" alt=""><span><b>${esc(p.name)}</b><small>${done?"Played ✓":"Play"}</small></span></button><button class="btn sm petren" data-act="petren" data-v="${i}" aria-label="Rename ${esc(p.name)}">Rename</button></span>`;}).join("")}</div>`;}
function homeHTML(){const R=roster(G);
  let guide="";
  if(coachOn()&&G.guideHidden!==G.week&&G.week<=2&&!(G.season>1)){
    guide=`<section class="px guide"><img class="gface" src="${faceSrc("coach")}" alt="Coach Daeng"><div class="gtxt"><b>Coach Daeng · what to do this week</b>${tutorialHTML()}</div><button class="xbtn" data-act="hideguide" aria-label="Hide this week's tips">✕</button></section>`;}
  else if(coachOn()&&G.guideHidden!==G.week){const T=coachTips();const i=UI.tipIdx%T.length;const t=T[i];
    guide=`<section class="px guide"><img class="gface" src="${faceSrc("coach")}" alt="Coach Daeng"><div class="gtxt"><b>Coach Daeng</b><p>${esc(t.t)}</p>
      <div class="gact">${t.act?`<button class="btn sm gold" data-act="tipact" data-k="${t.act.k}" data-id="${t.act.id||""}" data-v="${t.act.v||""}">${t.act.label}</button>`:""}${T.length>1?`<button class="btn sm" data-act="tipnext">Next ${i+1}/${T.length} ▸</button>`:""}</div></div>
      <button class="xbtn" data-act="hideguide" aria-label="Hide this week's tips">✕</button></section>`;}
  // v1.39: while Kru Daeng is on leave, Kati "runs" the camp and it shows
  if(G.coachAway&&G.week<G.coachAway&&G.guideHidden!==G.week&&rinIn()){const T=coachTips(true).filter(t=>t.p>=4);const t=T.length?T[G.week%Math.min(2,T.length)]:null;
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("rin","happy")}" alt="Rin"><div class="gtxt"><b>Rin's observations · Coach Daeng back in week ${G.coachAway}</b><p>${t?esc("According to my data: "+t.t):"The data looks normal this week. Nothing to worry about"}</p><p class="meta">No coach to help decide; Rin can only point things out</p></div><button class="xbtn" data-act="hideguide" aria-label="Close">✕</button></section>`;}
  else if(G.coachAway&&G.week<G.coachAway&&G.guideHidden!==G.week){const KS=["Coach Daeng's away, so I made everyone run three extra laps …I ran too!","I tried blowing the whistle like Coach Daeng. It came out like a duck","Coach Daeng called to ask if everyone's eaten. Four times today","Mali secretly switched the gym music to luk thung. I didn't stop her… because it's actually great","Coach Daeng's training schedule is on the wall, but I can't read his handwriting at all"];
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("kati","happy")}" alt="Kati"><div class="gtxt"><b>Kati (acting coach · Coach Daeng back in week ${G.coachAway})</b><p>${esc(KS[G.week%KS.length])}</p><p class="meta">No coach advice for now; you make every call yourself</p></div><button class="xbtn" data-act="hideguide" aria-label="Close">✕</button></section>`;}
  const lv=campLevel(G);
  return `${rinNoteHTML()}<div class="homegrid">${(()=>{const r=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
     return r.length?`<button class="px newfighter" data-act="tab" data-v="camp" data-sub="staff"><span class="newb">NEW!</span>${r.map(([id])=>`<img src="${faceSrc(id,"happy")}" alt="">`).join("")}<span><b>${r.map(([id])=>esc(G.F[id].name)).join(" and ")} wants to join</b><small>Tap to see the contract</small></span><span class="chev">▸</span></button>`:"";})()}<section class="px camp-wrap"><div class="cvbox"><canvas class="campcv" width="640" height="360" data-camp="1" aria-label="Sirichai Gym overview"></canvas>
    ${goalHidden()?`<button class="goal ov mini" data-act="goaltog" aria-label="Show goal">Goal ▾</button>`:`<button class="goal ov" data-act="goaltog" aria-label="Hide goal">${goalText()}<span class="gx">▴ Hide</span></button>`}</div>
    ${G.campUsed?`<button class="campact done" data-act="campacts"><span class="ci">✓</span><span><small>This week's camp activity</small><b>${esc(CAMP_ACTIONS[G.campUsed].name)}</b></span></button>`
      :`<button class="campact" data-act="campacts"><span class="ci"></span><span><small>This week's camp activity · not chosen</small><b>Choose a camp activity</b></span><span class="chev">▸</span></button>`}
    ${petsRowHTML()}
    <div class="camp-info"><button class="cinfo" data-act="tab" data-v="camp"><small>Camp level</small><b>Lv.${lv} ${CAMP_LV_NAME[lv]}</b></button><button class="cinfo" data-act="studinfo"><small>Students</small><b>${students(G)}/${studentCap(G)}</b></button></div></section>
   <div class="side">${guide}<div class="fgrid">${R.map(fighterChip).join("")}</div></div></div>`;}
function fighterMini(f){const c=condition(f);const nb=nextBooking(f);
  return `<button class="px fmini" data-act="fighter" data-id="${f.id}" aria-label="See status and info of ${esc(f.name)}">${faceImg(f)}<b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b>
    <div class="minis"><span>Ready</span>${mini(c,condColor(c))}<span>Fatigue</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <span class="meta">${f.injury?"<span class=\"redt\">Injured</span>":nb?`Fight wk ${nb.week}`:"Empty"}${skReady(f)?" · <span class=\"goldt\">Skill!</span>":""}</span><span class="fmore">▸</span></button>`;}
function fighterChip(f){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id);
  return `<button class="px fchip" data-act="fighter" data-id="${f.id}" aria-label="See status and info of ${esc(f.name)}"><span class="fmore">▸</span>${faceImg(f)}<div class="fci"><div class="nm">${esc(f.name)} <span class="lv">Lv.${f.lvl}</span>${f.sp>0?"<span class=\"pill gold\">Skill</span>":""}${f.injury?"<span class=\"pill red\">Hurt</span>":""}</div>
    <div class="meta">${f.injury?"Recovering":PRESETS[f.plan.preset].name} · ${rec(f)}</div>
    <div class="minis"><span>Ready</span>${mini(c,condColor(c))}<span>Fatigue</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <div class="meta">${nb?`Fight wk ${nb.week} vs ${esc(G.F[nb.b].name)}`:"No fight yet"}</div></div></button>`;}

function projFatigue(f){return fatigueAfter(G,f,f.plan.preset,f.plan.intensity);}
function attrsHTML(f,showGain){return `<div class="attrs">${ATTR_GROUPS.map(([g,ks])=>`<h4>${g}</h4>`+ks.map(k=>{const v=f.a[k],gn=f.gains&&f.gains[k];
  return `<div class="attr"><span>${ATTR_LABEL[k]}</span><i style="--v:${v/20*100}%"></i><b class="num">${v.toFixed(1)}${showGain&&gn>=.05?`<span class="up">+${gn.toFixed(1)}</span>`:""}</b></div>`;}).join("")).join("")}</div>`;}
function presetPicker(f){return `<div class="tgrid">${Object.entries(PRESETS).map(([k,p])=>`<button data-act="preset" data-f="${f.id}" data-v="${k}" ${trLocked(f)?"disabled":""} aria-pressed="${f.plan.preset===k}" title="${p.desc}">${p.name}</button>`).join("")}</div>
  <div class="tgrid three" role="group" aria-label="Intensity">${Object.entries(INTENSITY).map(([k,i])=>`<button data-act="intensity" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.intensity===k}">${i.name}</button>`).join("")}</div>`;}
const AX_PRESET={"Punch":"punch","Kick":"kick","Knee-Elbow":"knee","Defense":"defense","Body":"cond","Mind":"defense"};
// v1.14: advice follows the engine's real bonuses (prep in fight week, counter preset before it) and picks a safe intensity
function projF(f,p,i){return fatigueAfter(G,f,p,i);}
function safeInt(f,p,cap){for(const i of ["heavy","normal","light"])if(INTENSITY[i]&&projF(f,p,i)<=cap)return i;return "light";}
function trainAdvice(f){const b=nextBooking(f);const wk=b?b.week-G.week:99;const op=b?G.F[b.b]:null;const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};
  if(f.injury)return {p:"rest",i:"light",why:`Still injured for ${f.injury} weeks. Rest first`};
  if(f.fatigue>=52||projF(f,"cond","light")>68)return {p:"rest",i:"light",why:`Fatigue ${Math.round(f.fatigue)} already. Pushing on risks injury, rest this week`};
  if(b&&wk===0)return {p:"prep",i:safeInt(f,"prep",45),why:`Fighting this week: "Fight prep" gives a readiness bonus ${f.counterPrep?" and keeps the counter-training bonus":""}`};
  // v1.19.2: the week before a fight, stepping into the ring fresh matters more than one more hard session
  if(b&&wk===1&&projF(f,"prep","light")>30)return {p:"rest",i:"light",why:`Fighting next week, fatigue ${Math.round(f.fatigue)} is still high. Fighting tired drains energy fast. Rest up first`};
  if(b&&wk<=2){const cp=counterPreset(op),cap=wk===1?30:50;
    if(scouted(op.id))return {p:cp,i:safeInt(f,cp,cap),why:`${op.name}${COUNTER_WHY[cp]} Train "${PRESETS[cp].name}" for the counter bonus, then fight prep in the fight week`};
    const [w,p]=weakPick(f);
    return {p,i:safeInt(f,p,cap),why:`Don't know ${op.name} yet. Scout the tape before counter-training. Meanwhile, work on ${w[0]}`};}
  const [w,p,rot]=weakPick(f);const i=safeInt(f,p,b?58:65);
  // v1.18: no fight close → coach lays out two roads (own style vs patch the hole) and lets the player choose
  const ms=mainStyle(f);if(ms!==p){const si=safeInt(f,ms,b?58:65);
    return {p,i,two:{weak:{p,i,w:w[0],v:w[1],rot},strong:{p:ms,i:si}},why:`No fights coming up soon. There are two roads, your call`};}
  return {p,i,why:rot?`Training "${PRESETS[f.plan.preset].name}" for several weeks in a row now. Switch to working on ${w[0]} for a while ${i==="heavy"?" Still fresh, can train hard":""}`:`The weak spot right now is ${w[0]}, work on it first ${i==="heavy"?" Still fresh, can train hard":""}`};}
// v1.17: pick the preset that actually trains the weak spot (knee vs elbow), and rotate after 2 weeks on the same thing
function weakPick(f){const a=f.a;const ax=RADAR_AX.map(([n,fn])=>[n,fn(a)]).sort((x,y)=>x[1]-y[1]);
  const pre=n=>n==="Knee-Elbow"?((a.knee+a.clinch)/2<=a.elbow?"knee":"elbow"):n==="Mind"?"defense":AX_PRESET[n];
  let k=0;const streak=(f.trainLog||[]).slice(-2);if(streak.length===2&&streak.every(x=>x===pre(ax[0][0])))k=1;
  return [ax[k],pre(ax[k][0]),k===1];}
function planTip(f){const b=nextBooking(f);if(!b||f.injury)return "";const op=G.F[b.b];
  if(!scouted(op.id))return `<div class="kv-row"><span>Fight plan wk ${b.week}</span><b class="dim">Scout ${op.name} first, then Coach can suggest a plan</b></div>`;
  const A=adviseCached(f.id,op.id,b.rounds||3);const a=op.a;const tg=a.stamina<=Math.min(a.foot,a.guard)?"body":a.foot<=a.guard?"legs":"head";
  return `<div class="kv-row"><span>Fight plan wk ${b.week}</span><b class="goldt">${PLANS[A.best].name} · ${TGT[tg]}</b></div><p class="meta">${op.name}'s weak spot is ${oppIntel(op).weak} · use "Fight prep" in the fight week for a readiness bonus</p>`;}
function masteryLine(f){const s=mainStyle(f),v=styleVal(f,s),m=mastery(f);
  return m?`Mastery: ${STYLE_NAME[s]} ${Math.round(m*100)}%`:`${STYLE_NAME[s]} ${v.toFixed(1)}/${MASTERY_AT}, not yet mastered`;}
function twoRoads(f,T){const s=T.strong,w=T.weak,m=mastery(f),v=styleVal(f,s.p);const cur=f.plan.preset;
  const pro=m>=1?`Fully mastered. Stats still rise with more training`:m?`Main weapons hit sharper and harder (now ${Math.round(m*100)}%)`:`${(MASTERY_AT-v).toFixed(1)} more points unlocks "Mastery" of ${STYLE_NAME[s.p]}: sharper and stronger`;
  return `<div class="roads">
   <div class="road ${cur===s.p?"on":""}"><b>Road 1 · Build your strengths</b><span class="rp">${planName(s.p,s.i)}</span>
    <span class="up">+ ${pro}</span><span class="up">+ Your own style caps out slower</span><span class="dn">− ${esc(w.w)} remains an opening for opponents</span></div>
   <div class="road ${cur===w.p?"on":""}"><b>Road 2 · Patch the weakness</b><span class="rp">${planName(w.p,w.i)}</span>
    <span class="up">+ ${esc(w.w)} is lowest (${w.v.toFixed(1)}) low stats rise fast</span><span class="up">+ Harder for opponents to find holes</span><span class="dn">− Main weapons don't get sharper</span></div></div>`;}
const DRILL_ROW={punch:"punch",elbow:"punch",defense:"punch",balanced:"punch",kick:"knee",knee:"knee",cond:"knee"};
const DRILL_Q={perfect:"Perfect!",good:"Good",ok:"Okay"};
function drillHTML(){const D=UI.drill;if(!D)return "";const f=G.F[D.id],P=PRESETS[f.plan.preset];
  const at=Object.keys(P.w).map(k=>ATTR_LABEL[k]).filter(Boolean).slice(0,4).join(" · ");
  const res=D.done?`<div class="dres"><b class="${D.bonus>=8?"goldt":""}">${D.bonus>=10?"Excellent session!":D.bonus>=6?"Good session":"Got through it"}</b>
     <span>Training bonus this week <b class="goldt">+${D.bonus}%</b></span><span class="meta">${esc(planName(f.plan.preset,f.plan.intensity))} → ${at}</span>
     <div class="mfoot"><button class="btn primary" data-act="dskip">OK</button></div></div>`
   :`<div class="dctl"><span class="dpips">${Array.from({length:D.need},(_,i)=>`<i class="${D.res[i]||""}">${D.res[i]?DRILL_Q[D.res[i]]:""}</i>`).join("")}</span>
     <button class="btn primary big dtap" data-act="dtap" ${D.taps>=D.need?"disabled":""}>${DRILL_ROW[f.plan.preset]==="knee"?"Kick!":"Punch!"}</button><button class="btn sm ghost" data-act="dskip">Skip</button></div>`;
  return `<h2>Training ${esc(P.name)} · ${esc(f.name)}</h2><p class="meta">Tap to have ${esc(f.name)}${DRILL_ROW[f.plan.preset]==="knee"?"Kick":"Punch"} the bag ${D.need} times for a training bonus</p>
   <div class="drillstage" style="background-image:url(${ASSET}${gymBg()})"><canvas width="360" height="200" data-drill="${f.id}"></canvas></div>${res}`;}
function adviceHTML(id){const f=G.F[id],A=trainAdvice(f);const same=f.plan.preset===A.p&&(A.p==="rest"||f.plan.intensity===A.i);
  if(A.two)return `<h2>Coach Daeng's advice · ${esc(f.name)}</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span>${esc(A.why)}</span></div>
   <div class="kv-row"><span>Now</span><b>${planName(f.plan.preset,f.plan.intensity)}</b></div>${twoRoads(f,A.two)}
   ${planTip(f)}<p class="meta">${masteryLine(f)} · Coach only advises, you decide</p>
   <div class="mfoot roadbtns"><span class="meta">Set the program yourself with the "Training program" button</span><button class="btn primary" data-act="closeModal">Close</button></div>`;
  return `<h2>Coach Daeng's advice · ${esc(f.name)}</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span>${esc(A.why)}</span></div>
   <div class="kv-row"><span>Now</span><b>${planName(f.plan.preset,f.plan.intensity)}</b></div>
   <div class="kv-row"><span>Coach suggests</span><b class="goldt">${planName(A.p,A.i)}</b></div>
   ${planTip(f)}<p class="meta">${same?"It's already set the way Coach would":"Coach only advises, you decide"}</p>
   <div class="mfoot roadbtns"><button class="btn primary" data-act="closeModal">Close</button></div>`;}
const trLocked=f=>f?f.lockWeek===G.week:false;
const planName=(p,i)=>PRESETS[p].name+(p==="rest"||!INTENSITY[i]?"":" · "+INTENSITY[i].name);
function trainHTML(){const R=roster(G);if(!R.length)return "";
  // v1.13: each fighter gets her own card with the big training animation; programmes are picked in a sheet, then the week is locked in
  return `<div class="tcards">${R.map(f=>tcard(f,trLocked(f))).join("")}</div>`;}
function tcard(f,L){const pf=projFatigue(f),rest=f.plan.preset==="rest";const tired=!f.injury&&f.fatigue>=55&&!rest;
  return `<section class="px tcard ${L?"locked":""}">${!L&&!f.injury?"<i class=\"tdot\" aria-label=\"Program not confirmed\"></i>":""}<div class="tc-anim" role="button" tabindex="0" data-act="fighter" data-id="${f.id}" data-v="train" aria-label="Info ${esc(f.name)}" style="background-image:url(${ASSET}${gymBg()})"><canvas width="220" height="190" data-sprite="${f.id}" data-floor="1"></canvas>
     <span class="tr-pre">${f.injury?"Recovering":PRESETS[f.plan.preset].name}</span></div>
   <div class="tc-body"><div class="tc-h"><b class="nm">${esc(f.name)}</b><span class="lv">Lv.${f.lvl}</span>${prepLine(f)}</div>
    <div class="fatg"><span>Fatigue <b class="num">${Math.round(f.fatigue)}</b> → <b class="num">${Math.round(pf)}</b></span><i class="fgbar" style="--now:${clamp(f.fatigue,0,100)}%;--next:${clamp(pf,0,100)}%;--bc:${pf>70?"var(--red)":pf>55?"var(--warn)":"var(--green)"}"><s></s></i></div>
    ${tired?`<p class="warnchip">Very tired, should recover this week</p>`:""}
    ${skReady(f)?`<button class="spchip" data-act="fighter" data-id="${f.id}" data-v="skill">★ Skills ready</button>`:""}<div class="tc-prog"><span class="pill ${L?"":"gold"}">${f.injury?"Recovering":PRESETS[f.plan.preset].name+(rest?"":" · "+INTENSITY[f.plan.intensity].name)}</span></div>
    ${f.injury?"":`<div class="tc-btns">${L?"":`<button class="btn sm" data-act="tpick" data-id="${f.id}">Program</button>`}${coachOn()&&!L?`<button class="btn sm" data-act="advice" data-id="${f.id}">Coach's advice</button>`:""}
     ${L?`<span class="tc-ok">✓ Program confirmed</span>`:`<button class="btn sm gold tc-go" data-act="tlock" data-id="${f.id}">Confirm program</button>`}</div>`}
</div></section>`;}
// programme sheet: 4 columns, intensity hidden for rest
function tpickHTML(id){const f=G.F[id],rest=f.plan.preset==="rest";
  return `<h2>Training program · ${esc(f.name)}</h2><div class="tgrid four">${Object.entries(PRESETS).map(([k,p])=>`<button data-act="preset" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.preset===k}" title="${esc(p.desc)}">${p.name}</button>`).join("")}</div>
   <p class="meta tdesc">${esc(PRESETS[f.plan.preset].desc)}</p>
   ${rest?`<p class="meta">Recovery has no intensity; the body rests fully</p>`:`<h3>Intensity</h3><div class="tgrid three">${Object.entries(INTENSITY).map(([k,i])=>`<button data-act="intensity" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.intensity===k}">${i.name}</button>`).join("")}</div>`}
   <div class="mfoot"><button class="btn primary" data-act="closeModal">Done</button></div>`;}
const TGT={head:"Head",body:"Body",legs:"Legs"};
function nextBooking(f){return G.bookings.filter(b=>b.a===f.id).sort((x,y)=>x.week-y.week)[0];}
// fight plan folds to one line; the sheet holds the choices and a confirm
function prepLine(f){const b=nextBooking(f);if(!b||f.injury)return "";const op=G.F[b.b];
  return `<button class="fpbtn ${b.planSet?"set":""}" data-act="fplan" data-id="${b.id}" aria-label="Fight plan week ${b.week} vs ${esc(op.name)}"><b>${b.planSet?"✓ Fight plan":"Set fight plan"}</b><small>wk ${b.week}</small></button>`;}
function fplanHTML(bid){const b=G.bookings.find(x=>x.id===bid);if(!b)return "";const f=G.F[b.a],op=G.F[b.b];const pl=UI.fpDraft.plan,tg=UI.fpDraft.target;const cp=scouted(op.id)?counterPreset(op):null;
  return `<h2>Fight plan · ${esc(f.name)} vs ${esc(op.name)}</h2>
   <div class="fp-h">${scouted(op.id)?`<span class="pill">${styleOf(op.a)}</span>${(()=>{const I=oppIntel(op);return `<span class="meta">Favors ${I.top}</span>`;})()}`:`<button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>Scout ${fmt(scoutCost())}</button><span class="meta">Scout to learn the weak spot</span>`}</div>
   <h3>Plan</h3><div class="tgrid three">${Object.entries(PLANS).map(([k,p])=>`<button data-act="fpd" data-k="plan" data-v="${k}" aria-pressed="${pl===k}">${p.name}</button>`).join("")}</div><p class="meta tdesc">${esc(PLANS[pl].desc)}</p>
   <h3>Target</h3><div class="tgrid three">${Object.entries(TGT).map(([k,t])=>`<button data-act="fpd" data-k="target" data-v="${k}" aria-pressed="${tg===k}">${t}</button>`).join("")}</div>
   ${cp&&!trLocked(f)?`<button class="cprep ${f.plan.preset===cp?"on":""}" data-act="preset" data-f="${f.id}" data-v="${cp}">${f.plan.preset===cp?"✓ Counter-training this week":"💡 Counter-train: "+PRESETS[cp].name}<small>${op.name}${COUNTER_WHY[cp]}</small></button>`:""}
   <div class="mfoot"><button class="btn ghost" data-act="closeModal">Cancel</button><button class="btn primary" data-act="fpok" data-id="${b.id}">Confirm plan</button></div>`;}
function fightsHTML(){
  const sub=UI.fsub;
  return `<div class="seg subtabs"><button data-act="fsub" data-v="offers" aria-pressed="${sub==="offers"}">Offers & schedule</button><button data-act="fsub" data-v="rank" aria-pressed="${sub==="rank"}">Rankings</button></div>`+(sub==="rank"?rankHTML():offersHTML());}
// v1.7 scouting: watch tape to see the opponent's tendencies (free when Rin is in the camp)
// v1.21: tape is always a deliberate step again — Rin (or the analyst) just makes it free
const SCOUT_COST=400;const rinIn=()=>G.F.rin.camp==="player";const RIN_GAP=3;const rinFree=()=>rinIn()&&!(G.rinTapeWk!=null&&G.week-G.rinTapeWk<RIN_GAP); // v1.38: Rin studies one tape for free every 3 weeks
const scoutCost=()=>rinFree()||(G.staff||[]).includes("wit")?0:(G.fac.video||0)>=1?200:SCOUT_COST;
const scoutLabel=()=>rinFree()?"Let Rin study the tape (free every 3 weeks)":scoutCost()?`Scout ${fmt(scoutCost())}`:"Scout (free)";
const scouted=id=>G.scout&&G.scout[id]!=null&&G.week-G.scout[id]<=8;
function oppIntel(op){const a=op.a;const wp=[["Punch",a.punch],["Kick",a.kick],["Knee",a.knee],["Elbow",a.elbow]].sort((x,y)=>y[1]-x[1]);
  const weak=[["guard","Loose guard · head shots work"],["stamina","Low power · body shots drain her"],["foot","Slow footwork · leg kicks slow her more"],["clinch","Weak clinch · inside fighting has the edge"],["dur","Can't take much punishment"]].sort((x,y)=>a[x[0]]-a[y[0]])[0];
  return {top:`${wp[0][0]} (${wp[0][1].toFixed(0)}) and ${wp[1][0]} (${wp[1][1].toFixed(0)})`,weak:weak[1]};}
function h2hText(op){const h=G.h2h&&G.h2h[op.id];return h&&(h.w+h.l+h.d)?`Met before ${h.w+h.l+h.d} times · won ${h.w} lost ${h.l}${h.d?` drew ${h.d}`:""}`:"";}
// v1.35: trust finally does something you can see: corner orders land better, losses hurt less
const trustBonus=f=>f&&f.camp==="player"?clamp(((f.trust||0)-40)/1000,-.02,.04):0;
function trustText(f){const t=Math.round(f.trust||0),b=Math.round(trustBonus(f)*1000)/10;
  return `Trust ${t}: ${b>0?`follows corner orders well, accuracy +${b}%`:b<0?`still hesitant with corner orders, accuracy ${b}%`:"follows orders as usual"}${t>=60?" · losses hurt morale less":" · at 60, losses won't crush her spirit"}`;}
function personaOf(op){return !op.canon&&typeof PERSONA!=="undefined"?PERSONA[op.name]:null;}
function intelHTML(op){if(!scouted(op.id))return `<div class="intel locked"><span>Tape not scouted · only the style is known: ${styleOf(op.a)}</span><button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button></div>`;
  const I=oppIntel(op);return `<div class="intel"><b>${G.F.rin.camp==="player"?"Rin's analysis":"From the tape"}</b><span>Main weapon: ${I.top}</span><span>Weak spot: ${I.weak}</span></div>`;}
function offersHTML(){const mine=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week);
  return `${mine.length?`<section class="px card"><h3>Booked fights</h3><div class="list">${mine.map(b=>{const o=G.F[b.b],me=G.F[b.a];
     return `<div class="bookcard"><div class="vsstage"><canvas width="150" height="150" data-sprite="${me.id}" data-mode="guard"></canvas><b class="vsx">VS</b><canvas width="150" height="150" data-sprite="${o.id}" data-mode="guard" data-flip="1"></canvas></div>
       <div class="bk-info"><div class="t">${esc(me.name)} vs ${esc(o.name)}</div><div class="meta">Week ${b.week} · ${TIER[b.tier].name} · ${b.rounds} rounds ${b.win?` · purse ${fmt(b.lose)} (+${fmt(b.win-b.lose)} if win)`:""}</div>
       <span class="pill ${b.week===G.week?"red":"gold"}">${b.week===G.week?"This week":`${b.week-G.week} wk`}</span>${(()=>{const v=verdictOf(adviseCached(me.id,o.id,b.rounds||3).bestRate);return `<span class="pill dtag ${v.c}">${v.t}</span>`;})()}</div><div class="bk-btns">${b.planSet?`<button class="btn sm done" data-act="fplan" data-id="${b.id}">✓ Plan: ${PLANS[b.plan||"balanced"].name}</button>`:`<button class="btn sm red" data-act="fplan" data-id="${b.id}">Set fight plan</button>`}${scouted(o.id)?`<button class="btn sm done" disabled>${G.F.rin.camp==="player"?"✓ Rin analyzed":"✓ Scouted"}</button>`:`<button class="btn sm" data-act="scout" data-v="${o.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button>`}</div></div>`;}).join("")}</div></section>`:""}
   ${dmCardHTML()}<section class="px card"><div class="card-h"><h3>This week's offers</h3>${G.losses&&G.losses.length?`<button class="btn sm" data-act="lossrev">Review the loss</button>`:`<span class="legend"><i class="dot green"></i>Weaker <i class="dot gold"></i>Even <i class="dot red"></i>Stronger</span>`}</div><div class="list">${
     [...G.offers].sort((x,y)=>(y.rv||y.beast||y.hard||y.tier==="special"?1:0)-(x.rv||x.beast||x.hard||x.tier==="special"?1:0)).map(o=>{const op=G.F[o.b],me=G.F[o.a];const A=adviseCached(o.a,o.b,3);const v=verdictOf(A.bestRate);
       const sp=o.rv?["rv","Grudge match · the whole province is watching"]:o.beast?["beast",QK[o.beast].grp==="rooster"?"Wild bout · Human vs fighting rooster":"Wild bout · Bull wrestling, Muay Thai edition"]:o.tier==="special"?["sp","Special cross-division bout"]:o.hard?["hard","Punch up · purse ×1.5"]:o.fair?["fair",o.cross?"Temple fair · cross-division star!":"Temple fair bout · not ranked"]:null;
       return `<div class="item offer ${v.c} ${sp?"spx "+sp[0]:""}">${sp?`<span class="ribbon">${sp[1]}</span>`:""}<button class="oxbtn" data-act="declo" data-v="${o.id}" aria-label="Decline this offer">✕</button><div class="l"><span class="vdot ${v.c}" aria-label="${v.t}"></span>${faceImg(op,"sm")}<div>
       <div class="t">${esc(me.name)} vs ${esc(op.name)}</div>
       <div class="meta">Wk ${o.week} · ${TIER[o.tier].name}${o.beast?" · off the record":""}${o.fair?" · not ranked · purse paid by mail":""} · ${styleOf(op.a)}${op.camp==="rival"?" · Golden Tiger":""}${personaOf(op)?` · ${personaOf(op).tag}`:""}</div>${h2hText(op)?`<div class="meta goldt">${h2hText(op)}</div>`:""}
       <div class="meta">Purse ${fmt(o.lose)} · <b class="goldt">win +${fmt(o.win-o.lose)}</b> · <b class="${v.c}t">${v.t}</b>${ovr(op.a)-ovr(me.a)>.4?` · <b class="goldt">Win for bonus points/fame</b>`:ovr(op.a)-ovr(me.a)<-.6?` · <span class="mutt">Beating a weaker fighter earns little fame</span>`:""}</div>
       </div></div>
       <div class="obtns3"><button class="btn sm" data-act="consider" data-v="${o.id}">${scouted(o.b)?"Opponent info":"Scout"}</button>${coachOn()?`<button class="btn sm" data-act="otip" data-v="${o.id}">Coach's advice</button>`:""}<button class="btn sm gold" data-act="accept" data-v="${o.id}">Accept</button></div></div>`;}).join("")||`<p class="lead">${G.bookings.length?"Fight booked. New offers arrive next week":"No offers (injured, or season over)"}</p>`}</div></section>`;}
function rankHTML(){const st=stageOf(G.week),cut=st==="local"?4:st==="district"?4:0,d=UI.rdiv;const rows=standings(G,d);const mv=(G.rankMove&&G.rankMove[d])||{};
  return `<section class="px card"><div class="card-h"><div class="seg sm"><button data-act="rdiv" data-v="A" aria-pressed="${d==="A"}">Div A</button><button data-act="rdiv" data-v="B" aria-pressed="${d==="B"}">Div B</button></div>${G.champ[d]?`<span class="pill gold">Champion: ${esc(G.F[G.champ[d]].name)}</span>`:""}</div>
   <div class="rkhelp"><p class="meta">${st==="local"?"Top 4 (gold line) advance to the district round · cut at wk 20":st==="district"?"Top 4 (gold line) advance to the provincial semis · cut at wk 40":"Semis wk 44 · Final wk 49"} · win = 3 pts</p><button class="btn sm" data-act="rankhelp">How do rankings work?</button></div>
   ${st==="final"||st==="off"?`<p class="meta">Semis (wk 44): ${(()=>{const t=(G.semis||{})[d]||[];return t.length===4?`<b>${esc(G.F[t[0]].name)}</b> vs <b>${esc(G.F[t[3]].name)}</b> · <b>${esc(G.F[t[1]].name)}</b> vs <b>${esc(G.F[t[2]].name)}</b>`:"—";})()}<br>Final (wk 49): ${G.finalists[d].map(id=>`<b>${esc(G.F[id].name)}</b>`).join(" vs ")||"Awaiting semifinal results"}</p>`:""}
   <div class="tbl-wrap"><table><thead><tr><th>#</th><th></th><th>Fighter</th><th>Pts</th><th>W-L-D</th><th>Form</th></tr></thead><tbody>
   ${rows.map((r,i)=>`<tr class="${r.f.camp==="player"?"me":r.f.camp==="rival"?"rival":""} ${cut&&i<cut?"zone":""} ${cut&&i===cut-1?"cut":""}"><td class="num">${i+1}</td><td>${moveIcon(mv[r.id])}</td><td>${esc(r.f.name)}</td><td class="num"><b>${r.pts}</b></td><td class="num">${r.w}-${r.l}-${r.d}</td><td>${formHTML(r.f)}</td></tr>`).join("")}
   </tbody></table></div></section>${calendarHTML()}`;}

function peopleHTML(){const met=CANON_IDS.map(id=>G.F[id]).filter(f=>f.met);
  return `<div class="card-h"><p class="meta">Spend time with one person per week · Once you are close, they will sometimes text you first</p><button class="btn sm gold albbtn" data-act="album">🃏 Card album ${Object.keys(G.cards||{}).length}/${Object.keys(CARDS).length}${Object.values(G.cards||{}).some(c=>!c.seen)?'<i class="ndot"></i>':""}</button>${G.freeUsed?"<span class=\"pill\">Free time: used</span>":"<span class=\"pill gold\">Free time: 1 left</span>"}</div>
   <div class="plist">${met.map(f=>`<section class="px pcard"><button class="pthumb" data-act="fighter" data-id="${f.id}" data-v="rel" aria-label="View profile of ${esc(f.name)}"><img src="${stand(f.id,"casual")}" alt="" loading="lazy"></button>
     <div class="pbody"><div class="pnm"><b class="nm">${esc(f.name)}</b><span class="meta">${f.camp==="player"?"Sirichai Camp":f.camp==="rival"?"Golden Tiger":"Independent"}${G.romance===f.id?" · Sweetheart ♥":G.promise&&G.promise[f.id]!=null?" · Promised ♡":""}</span></div>${hearts(f.bond)}
      <div class="pbtns"><button class="btn sm" data-act="fighter" data-id="${f.id}" data-v="rel">Profile</button><button class="btn sm primary" data-act="hang" data-id="${f.id}" ${G.freeUsed?"disabled":""}>Hang out</button><button class="btn sm gold giftb" data-act="giftpick" data-id="${f.id}" ${f.giftWeek===G.week?"disabled":""}>${PIX.gift}<span>${f.giftWeek===G.week?"Given":"Gift"}</span></button><button class="btn sm chatb" data-act="chat" data-id="${f.id}" ${canChat(f)?"":"disabled"}>${CHAT_PX}<span>${canChat(f)?"New chat":(f.bond||0)<CHAT_BOND?"Not close yet":"No messages"}</span>${canChat(f)?'<i class="dot"></i>':""}</button></div></div></section>`).join("")}</div>`;}
function hangHTML(id){const f=G.F[id];const pref=k=>f.know["act_"+k]==="like"?"<i class=\"likeb\">Likes</i>":f.know["act_"+k]==="dislike"?"<i class=\"disb\">Dislikes</i>":"";
  return `<h2>Time with ${esc(f.name)}</h2><p class="meta">Choose where to go together</p><div class="acts">${Object.entries(ACTIVITIES).filter(([k,a])=>!a.campOnly||f.camp==="player").map(([k,a])=>`<button class="actbtn" data-act="date" data-id="${f.id}" data-v="${k}" ${G.freeUsed||G.cash<a.cost?"disabled":""}><b>${a.name}${pref(k)}</b><small>${a.cost?fmt(a.cost):"Free"}</small></button>`).join("")}</div>`;}
// v1.33: what each camp level brings, so upgrades feel like a goal
function campLvHTML(){const lv=campLevel(G),t=facTotal(G),need=[0,0,5,13];
  const unlock=L=>[...Object.entries(FACILITIES).filter(([k,F])=>F.req&&F.req.lv===L).map(([k,F])=>F.name),...Object.entries(STAFF).filter(([k,S])=>S.req&&S.req.lv===L).map(([k,S])=>S.name)];
  return `<h2>Camp level</h2><p class="meta">Any upgrade counts; reach the total and the camp levels up · Now ${t} upgrades</p><div class="clv">${[1,2,3].map(L=>{const u=unlock(L);return `<div class="clvrow px ${L===lv?"now":L<lv?"done":"lock"}" style="background-image:linear-gradient(90deg,rgba(20,16,32,.94),rgba(20,16,32,.55)),url(${ASSET}gym${L}.webp)">
    <div class="clvh"><b>Lv.${L} ${CAMP_LV_NAME[L]}</b><span class="pill ${L<=lv?"green":""}">${L<lv?"Done":L===lv?"Right now ":`Needs ${need[L]} upgrades (${need[L]-t})`}</span></div>
    <ul><li>Class fees ${L>1?`+${(L-1)*20}%`:"Normal"}</li><li>People wanting to join +${L*2}</li><li>Assistant coach slots: ${1+L}</li>${L>1?"<li>Gym gets a makeover</li>":""}${u.length?`<li class="goldt">Unlocks: ${u.join(", ")}</li>`:""}</ul></div>`;}).join("")}</div>
   <button class="btn primary" data-act="gofac">Go to camp upgrades</button>`;}
// v1.50: the camp's hall of fame — one row per finished year, plus belts held now
function hallHTML(){const T=(G.titles||[]).slice().reverse(),belts=Object.entries(G.belt||{}).filter(([d,b])=>G.F[b.id]&&G.F[b.id].camp==="player");
  const yr=t=>{const res=t.res||Object.entries(t.champ||{}).filter(([d,id])=>G.F[id]&&G.F[id].camp==="player").map(([d,id])=>({name:G.F[id].name,d,t:"Provincial champion",c:"gold"}));
    return `<div class="hall-y"><b>Year ${t.season}</b>${res.length?res.map(r=>`<div class="kv-row"><span>${esc(r.name)} · Div ${r.d}</span><span class="pill ${r.c||""}">${r.t}</span></div>`).join(""):"<p class=\"meta\">That year nobody got past the subdistrict round, but the whole camp stayed together</p>"}</div>`;};
  return `${belts.length?`<div class="hall-y"><b>Belts held</b>${belts.map(([d,b])=>`<div class="kv-row"><span>${esc(G.F[b.id].name)} · Div ${d}</span><span class="pill gold">🏆 Tha Phae Stadium champion · defended ${b.def} times</span></div>`).join("")}</div>`:""}
   ${T.length?T.map(yr).join(""):`<p class="meta">The first year isn't over yet · when it ends, everyone's results land here, one row per year</p>`}`;}
function campHTML(){const inc=classIncome(G),up=upkeep(G),wg=wages(G),lv=campLevel(G),cs=UI.csub||"money";
  const recs=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
  const dots=(n,m)=>`<span class="pips">${Array.from({length:m},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`;
  return `<section class="px card camphead" style="background-image:linear-gradient(90deg,rgba(20,16,32,.95),rgba(20,16,32,.6)),url(${ASSET}${gymBg()})"><div><button class="pill gold lvbtn" data-act="camplv">Camp Lv.${lv} ▸</button><h3>${CAMP_LV_NAME[lv]}</h3>
    <p class="meta">Total upgrades ${facTotal(G)} levels · ${lv<3?`${lv===1?5-facTotal(G):13-facTotal(G)} levels to reach Lv.${lv+1} · tap to see what you get`:"Max level for the demo"}</p></div></section>
   <div class="seg subtabs csubs"><button data-act="csub" data-v="money" aria-pressed="${cs==="money"}">Finance</button><button data-act="csub" data-v="staff" aria-pressed="${cs==="staff"}">Coaches & fighters</button><button data-act="csub" data-v="fac" aria-pressed="${cs==="fac"}">Upgrades</button><button data-act="csub" data-v="hall" aria-pressed="${cs==="hall"}">Hall of fame</button></div>
   ${recruitHTML(recs)}
   <div class="grid g2">
   <section class="px card cpane ${cs==="money"?"on":""}"><h3>Weekly income & expenses</h3>
    <div class="kv-row"><span>Students ${students(G)} × ${fmt(studentFee(G))}</span><b class="num pos">+${fmt(inc)}</b></div>
    <div class="kv-row"><span>Camp upkeep</span><b class="num neg">-${fmt(up)}</b></div>
    <div class="kv-row"><span>Fighter & assistant wages</span><b class="num neg">-${fmt(wg)}</b></div>
    <div class="kv-row"><b>Net</b><b class="num ${weeklyNet(G)<0?"neg":"pos"}">${fmt(weeklyNet(G))}</b></div>
    <div class="kv-row"><span>Debt ${fmt(G.debt)} · paid every 4 weeks ${fmt(Math.min(5000,G.debt))}</span><button class="btn sm" data-act="paydebt" ${G.cash<10000||G.debt<=0?"disabled":""}>Pay ฿10,000</button></div>
    ${G.loan>0?`<div class="kv-row loanrow"><span>Gold Helmet loan ${fmt(G.loan)} · 10% interest every 4 weeks</span><button class="btn sm gold" data-act="repayloan" ${G.cash<G.loan?"disabled":""}>Repay all</button></div>`:loanOk(G)?`<div class="kv-row loanrow"><span>Cash is running out · a quick loan is available</span><button class="btn sm red" data-act="loan">See loan</button></div>`:""}</section>
   <section class="px card cpane ${cs==="staff"?"on":""}"><h3>Coaches & students</h3>
    <div class="kv-row"><span>Want to join ${studentDemand(G)}· capacity ${studentCap(G)}</span><b class="${studentDemand(G)>studentCap(G)?"goldt":""}">${studentDemand(G)>studentCap(G)?"Over!":"Just right"}</b></div>
    <div class="item nw"><div class="l"><img class="face sm" src="${faceSrc("coach")}" alt=""><div><div class="t">Coach Daeng Lv.${G.fac.daeng}</div><div class="meta">Students +${(G.fac.daeng-1)*2} · fees +12%/lv · training +5%/lv</div></div></div>
     ${G.fac.daeng<3?`<button class="btn sm gold" data-act="daeng" ${G.cash<DAENG_COST[G.fac.daeng]?"disabled":""}>Train up ${fmt(DAENG_COST[G.fac.daeng])}</button>`:"<span class=\"pill green\">Max</span>"}</div>
    ${staffHTML()}</section>
   </div>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>Facilities</h3><div class="facs">${(()=>{const E=Object.entries(FACILITIES),lk=E.filter(([k])=>facLocked(G,k));return [...E.filter(([k])=>!facLocked(G,k)),...lk.slice(0,1)];})().map(([k,F])=>{const l=G.fac[k]||0,m=F.cost.length,lk=facLocked(G,k);
     return `<div class="item fac ${lk?"locked":""}"><div><div class="t">${F.name} ${dots(l,m)}${F.req&&!l&&!lk?" <span class=\"newb sm\">New</span>":""}</div><div class="meta">${F.desc}</div></div>${lk?`<span class="pill">Unlocks: ${lk}</span>`:l<m?`<button class="btn sm gold" data-act="buyfac" data-v="${k}" ${G.cash<F.cost[l]?"disabled":""}>${fmt(F.cost[l])}</button>`:"<span class=\"pill green\">Max</span>"}</div>`;}).join("")}</div></section>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>Special investments</h3>
    <div class="item nw"><div><div class="t">Invite an old-school master to teach</div><div class="meta">${fmt(18000)} · fighter gains +1 skill point and school stats · once per fighter per season · opens week 16</div></div><button class="btn sm gold" data-act="mastersOpen" ${G.week<16?"disabled":""}>Choose</button></div>
    <div class="item nw"><div><div class="t">Host a fight night at Sirichai</div><div class="meta">${fmt(SHOW_COST)} · fame +3, camp looks better, everyone's morale +8 · once per round</div></div><button class="btn sm gold" data-act="hostshow" ${G.cash<SHOW_COST||G.week<10||G.flags["show_"+stageOf(G.week)]?"disabled":""}>${G.flags["show_"+stageOf(G.week)]?"Hosted":"Host"}</button></div>
    <div class="item nw"><div><div class="t">Pay off Grandpa Chai's debt</div><div class="meta">${G.debt>0?`Remaining ${fmt(G.debt)} · paying it off gives fame +2 and a special scene`:"Debt fully paid"}</div></div>${G.debt>0?`<button class="btn sm gold" data-act="cleardebt" ${G.cash<G.debt?"disabled":""}>Pay off</button>`:"<span class=\"pill green\">Done</span>"}</div></section>
   <section class="px card cpane ${cs==="hall"?"on":""}"><h3>Hall of fame</h3>${hallHTML()}</section>
`;}

// v1.18: hired trainers with their own pixel sprite
function staffHTML(){const st=G.staff||[],n=staffSlots(G);
  return `<div class="kv-row"><span>Coaching staff</span><b>${st.length}/${n} slots</b></div><p class="meta">Slots grow with camp level and the standard ring · each coach adds +1 student capacity and +2% training</p>
   <div class="staffs">${Object.entries(STAFF).map(([k,S])=>{const h=st.includes(k),lk=staffLocked(G,k);
    return `<div class="staff ${h?"on":""} ${lk?"locked":""}"><canvas width="84" height="84" data-staff="${k}" aria-label="${S.name}"></canvas>
     <div class="sinfo"><b>${S.name}</b><span class="role">${S.role}</span><span class="meta">${S.desc}</span><span class="meta">Wage ${fmt(S.wage)}/wk ${h?"":` · signing fee ${fmt(S.fee)}`}</span></div>
     ${h?`<button class="btn sm" data-act="firestaff" data-v="${k}">Dismiss</button>`:lk?`<span class="pill">Unlocks: ${lk}</span>`:`<button class="btn sm gold" data-act="hirestaff" data-v="${k}" ${G.cash<S.fee||st.length>=n?"disabled":""}>${st.length>=n?"Full":"Hire"}</button>`}</div>`;}).join("")}</div>`;}
// v1.9: a fighter who wants to join is the headline of the camp tab
function recruitHTML(recs){if(!recs.length)return "";
  return `<section class="px card recruit"><h3><span class="newb">NEW!</span> Fighters want to join</h3>${recs.map(([id])=>{const f=G.F[id];
    return `<div class="rcard"><button class="rface" data-act="fighter" data-id="${id}" aria-label="View info ${esc(f.name)}"><img src="${faceSrc(id,"happy")}" alt=""></button>
     <div class="rinfo"><b>${esc(f.full||f.name)}</b><span class="meta">Div ${f.div} · ${styleOf(f.a)}</span><span class="meta">Signing fee ${fmt(f.fee)} · wage ${fmt(f.wage)}/wk</span></div>
     <div class="rbtns"><button class="btn sm" data-act="fighter" data-id="${id}">Info</button><button class="btn sm gold" data-act="sign" data-v="${id}" ${G.cash<f.fee?"disabled":""}>Sign</button></div></div>`;}).join("")}
   <p class="meta">Wages are a weekly expense. Make sure the cash can handle it before signing</p></section>`;}
// ---------- fighter popup (tabs) ----------
function fighterHTML(f){const mine=f.camp==="player";const P=PROFILES[f.id];
  const tabs=mine?[["rel","Profile"],["over","Stats"],["skill","Skills"]].concat(f.canon&&KIT_MASK[f.id]?[["look","Outfit"]]:[]):[["rel","Profile"],["over","Stats"]];
  let t=UI.ptab;if(!tabs.some(x=>x[0]===t))t="over";
  const head=`<div class="fp-head">${faceImg(f)}<div><h2>${esc(f.full)}</h2><div class="meta">${P?P.age+" yrs · ":""}${f.camp==="player"?"Sirichai Camp":f.camp==="rival"?"Golden Tiger Camp":"Free agent"} · Div ${f.div} · ${styleOf(f.a)} · ${rec(f)}</div>${G.belt&&Object.values(G.belt).some(x=>x.id===f.id)?`<div class="beltb">🏆 Tha Phae Stadium champion</div>`:f.belts?`<div class="beltb old">Former Tha Phae Stadium champion</div>`:""}${xpBar(f)}</div></div>
   <div class="seg ptabs">${tabs.map(([k,n])=>`<button data-act="ptab" data-v="${k}" aria-pressed="${t===k}">${n}${k==="skill"&&skReady(f)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>`;
  let body="";
  if(t==="look"){const cur=f.outfit||"base";
    body=`<div class="olook"><canvas width="170" height="160" data-sprite="${f.id}" data-floor="1" data-mode="guard" aria-label="${esc(f.name)}"></canvas><div class="olist">${Object.entries(OUTFITS).map(([k,O])=>{const ok=k==="base"||outfitOk(G,f,k);
      return `<button class="obtn ${cur===k?"on":""}" data-act="outfit" data-id="${f.id}" data-v="${k}" ${ok?"":"disabled"}><i style="background:${O.sw||"transparent"}" class="${O.sw?"":"base"}"></i><span><b>${ok?esc(O.name):"???"}</b><small>${cur===k?"Wearing":ok?"Tap to wear":"Unlocks: "+esc(O.hint)}</small></span></button>`;}).join("")}</div></div>
      <p class="meta center">Outfits only change the pixel sprite in camp, training and fights · no effect on stats</p>`;}
  if(t==="over"){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id||b.b===f.id);
    body=`<div class="fp-over">${radarSVG(f,240)}<div><div class="bars">${bar("Readiness",c,condColor(c))}${bar("Fatigue",f.fatigue,"var(--warn)")}${bar("Morale",f.morale,"var(--blue)")}</div>
      ${mine?`<p class="meta goldt">${masteryLine(f)}</p>`:""}<p class="meta">Form ${formHTML(f)}${nb?` · next fight week ${nb.week}`:""}</p><details><summary>Detailed stats</summary>${attrsHTML(f,mine)}</details></div></div>`;}
  if(t==="train"){body=`<div class="fp-train"><div class="tr-anim big" style="background-image:url(${ASSET}${gymBg()})"><canvas width="260" height="200" data-sprite="${f.id}" data-floor="1"></canvas><span class="tr-tag">${PRESETS[f.plan.preset].name}</span></div>
     <div><p class="meta">${PRESETS[f.plan.preset].desc} · fatigue next week ${Math.round(projFatigue(f))}</p>${presetPicker(f)}${radarSVG(f,200)}</div></div>`;}
  if(t==="skill"&&hasTree(f.id))body=skillGrid(f,mine);else if(t==="skill")body=skillGrid(f,mine)+(SIGNATURE[f.id]?`<details class="sigcard ${hasSignature(f)?"on":""}"><summary><b>${hasSignature(f)?"✦":"🔒"} Signature move: ${SIGNATURE[f.id].name}</b></summary><span class="meta">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · bond now ${Math.round(f.bond||0)}/60`}</span></details>`:"")+`<details class="skhelp"><summary>How do skills work?</summary><p class="meta">1 skill point per level-up · new moves unlock by level · each move upgrades 3 times · in a fight you can only use the 3 moves marked "Use" · tap a move's name for details</p></details>`;
  if(t==="rel")body=relHTML(f);
  return head+`<div class="fp-body">${body}</div>`;}
const SK_AN=Object.fromEntries(ATTRS);
const SK_LINES={kati:["Shin line","Punch & elbow line","Guard & heart line"],mali:["Elbow line","Kick & speed line","Defense line"],rin:["Counter line","Ring-IQ line","Range line"]};
const SK_ROWN=["Basics","Mid tier","Mid tier · passive","High tier"];
const skReady=f=>f.sp>0&&(hasTree(f.id)?(SKILLS[f.id]||[]).some(k=>!skillBlock(f,k.id).length):true);
const fmtA=v=>(Math.floor(v*10)/10).toFixed(1).replace(/\.0$/,"");
// v1.31: skill screen — points up top, one line (สาย) at a time, a scrollable list of pixel cards with the upgrade button on each card
const skState=(f,s,mine)=>{const r=(f.skills&&f.skills[s.id])||0;if(!mine)return {r,st:r?"has":"lock"};const B=skillBlock(f,s.id);
  if(r>=3)return {r,st:"max"};if(!B.length)return {r,st:"can"};const nb=B.filter(b=>b.t!=="sp");if(!nb.length)return {r,st:"nosp"};return {r,st:"lock",B:nb};};
function skillTree(f,mine){const L=SKILLS[f.id],eqd=equipped(f),sc=SCHOOLS[L[0].school]||{name:""};
  const lines=SK_LINES[f.id]||["Line 1","Line 2","Line 3"];const can=li=>mine&&L.some(s=>s.line===li&&skState(f,s,mine).st==="can");
  let li=UI.skLine&&UI.skLine.id===f.id?UI.skLine.li:[0,1,2].find(can);if(li==null)li=0;
  const nCan=L.filter(s=>skState(f,s,mine).st==="can").length;
  const why=st=>st.B.map(b=>b.t==="pre"?`Needs "${skillDef(f.id,b.id).name}" first`:b.t==="lv"?`Needs Lv.${b.v}`:b.t==="stat"?`${SK_AN[b.k]} ${fmtA(b.have)}/${fmtA(b.v)}`:"").filter(Boolean).join(" · ");
  const card=s=>{const st=skState(f,s,mine),eq=eqd.includes(s.id),k=skillKind(s);
    return `<div class="skc ${st.st} ${eq?"eq":""}"><div class="skc-ic">${s.passive?PIX.sk_rec:PIX["sk_"+k.k]}</div>
     <div class="skc-m"><div class="skc-h"><b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=st.r?"on":""}"></i>`).join("")}</span></div>
      <small class="skc-t">${SK_ROWN[s.row]}${eq?" · <span class=\"goldt\">Equipped</span>":""}</small>
      <p class="skc-d">${s.desc}</p>
      <p class="skc-s">${st.st==="can"?`<span class="ok">Can upgrade → rank ${st.r+1}</span>`:st.st==="max"?"<span class=\"goldt\">Maxed out</span>":st.st==="nosp"?"<span class=\"dim\">No skill points · wait for a level up</span>":`<span class="no">Can't upgrade yet: ${why(st)}</span>`}</p></div>
     ${mine?`<div class="skc-b">${st.st==="can"?`<button class="btn sm gold" data-act="learn" data-id="${f.id}" data-v="${s.id}" aria-label="Upgrade ${s.name}">+ Up</button>`:""}${st.r&&!s.passive?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"Remove":"Equip"}</button>`:""}</div>`:""}</div>`;};
  return `<div class="skwrap">${mine?`<div class="skbar3"><div class="sppx"><small>Skill points</small><b class="num">★ ${f.sp}</b></div>
     <div class="sk-info"><span>${f.sp?nCan?`Can upgrade now: <b class="ok">${nCan}</b> moves`:"Nothing to upgrade yet. Train stats higher":"3 points every level up"}</span>
      <span class="sk-eq">Equipped ${[0,1,2].map(i=>{const s=eqd[i]&&skillDef(f.id,eqd[i]);return `<i class="${s?"on":""}" title="${s?s.name:"Empty"}">${s?PIX["sk_"+skillKind(s).k]:""}</i>`;}).join("")}</span></div></div>`:""}
   <div class="seg sklines">${lines.map((n,i)=>`<button data-act="skline" data-id="${f.id}" data-v="${i}" aria-pressed="${li===i}">${n}${can(i)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>
   <div class="sklist pxscroll">${[0,1,2,3].map(row=>L.find(s=>s.line===li&&s.row===row)).filter(Boolean).map(card).join('<i class="skarrow" aria-hidden="true"></i>')}
     ${SIGNATURE[f.id]?`<div class="skc sig ${hasSignature(f)?"has":"lock"}"><div class="skc-m"><div class="skc-h"><b>✦ Signature: ${SIGNATURE[f.id].name}</b></div><p class="skc-d">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · unlocks at bond 60 (now ${Math.round(f.bond||0)})`}</p></div></div>`:""}</div>
   ${mine?`<div class="skfoot"><button class="btn sm" data-act="skauto" data-id="${f.id}" data-v="${li}" ${[0,1,2,3].some(r=>{const s=L.find(x=>x.line===li&&x.row===r);return s&&skState(f,s,mine).st==="can";})?"":"disabled"}>Auto-upgrade · ${lines[li]}</button><span class="meta">Equip up to ${MAX_EQUIP} moves · passives work on their own, no slot needed</span></div>`:""}</div>`;}
function skillGrid(f,mine){if(hasTree(f.id))return skillTree(f,mine);const L=SKILLS[f.id]||[];const sc=SCHOOLS[L[0]&&L[0].school]||{name:"",motto:""};
  // v1.23: compact — unlocked moves as short rows (tap the name for details), locked ones folded away
  const op=L.filter(s=>(s.lv||1)<=f.lvl),lk=L.filter(s=>(s.lv||1)>f.lvl),eqd=equipped(f);
  const row=s=>{const r=f.skills[s.id]||0,eq=eqd.includes(s.id),k=skillKind(s),o=UI.skOpen===f.id+s.id;
    return `<div class="skrow ${r?"has":""} ${eq?"eq":""}"><button class="skn" data-act="skdesc" data-v="${f.id+s.id}" aria-expanded="${o}">${PIX["sk_"+k.k]}<b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=r?"on":""}"></i>`).join("")}</span></button>
     ${mine?`<span class="skb">${r?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"In use":"Use"}</button>`:""}<button class="plus" data-act="learn" data-id="${f.id}" data-v="${s.id}" ${f.sp<1||r>=3?"disabled":""} aria-label="Upgrade ${s.name}">${r>=3?"MAX":"+"}</button></span>`:""}
     ${o?`<small class="skd">${s.desc}</small>`:""}</div>`;};
  return `<div class="school sm" style="--c:${sc.color}"><b>${sc.name}</b>${mine?`<span class="pill ${f.sp>0?"gold":""}">Skill points ${f.sp}</span><span class="pill">In the fight ${eqd.length}/${MAX_EQUIP}</span>`:""}</div>
   <div class="sklist">${op.map(row).join("")||`<p class="meta">No moves unlocked yet</p>`}</div>
   ${lk.length?`<details class="sklock"><summary>Locked moves ${lk.length} · next Lv.${lk[0].lv}</summary>${lk.map(s=>`<div class="sklk"><span>Lv.${s.lv}</span><b>${s.name}</b><small>${s.desc}</small></div>`).join("")}</details>`:""}`;}
// v1.41: visible relationship stages — each one changes how she treats you
const REL_TIERS=[[0,"Acquaintance","Still calls you \"Manager\", a bit stiffly"],[20,"Teammate","Jokes around, texts about everyday things"],[40,"Close","Sometimes lets your name slip · shares personal stories"],[75,"Special","Always calls you by name"]];
const relTier=b=>{let i=0;REL_TIERS.forEach((t,k)=>{if((b||0)>=t[0])i=k;});return i;};
function relTierCheck(){if(!G)return;G.relT=G.relT||{};for(const f of Object.values(G.F)){if(!(f.camp==="player"||f.met))continue;const t=relTier(f.bond),o=G.relT[f.id];if(o===undefined){G.relT[f.id]=t;continue;}
  if(t>o){G.relT[f.id]=t;UI.relUp=UI.relUp||[];UI.relUp.push(`${f.name} · ${REL_TIERS[t][1]} — ${REL_TIERS[t][2]}`);}}}
function relHTML(f){const P=PROFILES[f.id],b=f.bond;
  const L=(ok,need,v)=>ok?esc(v):`<span class="lock">🔒 Bond ${need}</span>`;
  const chips=(arr,pre,all)=>arr.map((x,i)=>f.know[pre+i]||b>=all?`<span class="tchip">${esc(x)}</span>`:`<span class="tchip lock">???</span>`).join("");
  const gifts=Object.entries(f.know).filter(([k])=>k.startsWith("gift_")).map(([k,v])=>`<span class="tchip ${v}">${GIFTS[k.slice(5)].name}${v==="love"?" ♥♥":v==="like"?" ♥":v==="dislike"?" ✕":""}</span>`).join("");
  const looks=[["fight","Fight gear"],["train","Training gear"],["casual","Casual"]];
  return `<div class="pf2"><div class="pf-art"><img src="${UI.look==="train"?`${ASSET}${f.id}_train.webp`:stand(f.id,UI.look,"happy")}" alt=""><div class="seg sm">${looks.map(([k,t])=>`<button data-act="plook" data-v="${k}" aria-pressed="${UI.look===k}">${t}</button>`).join("")}</div></div>
   <div class="pf-side">${hearts(b)}${typeof missGap==="function"&&missGap(G,f.id)>=3?`<div class="missb">💭 Missing you · haven't met in ${missGap(G,f.id)} weeks ${f.bond>(REL_FLOOR[(G.relT||{})[f.id]||0]||0)?" · bond starting to fade":""}</div>`:""}<div class="reltier"><b>${REL_TIERS[relTier(b)][1]}</b><small>${REL_TIERS[relTier(b)][2]}</small></div><div class="bars">${bar("Friends",b,"var(--red)")}${bar("Trust",f.trust,"var(--gold)")}</div>${f.camp==="player"?`<p class="meta trustx">${trustText(f)}</p>`:""}
    <div class="info"><div><span>Height</span><b>${P.height}</b></div><div><span>Blood type</span><b>${L(b>=UNLOCK.blood||f.know.blood,UNLOCK.blood,P.blood)}</b></div>
     <div><span>Birthday</span><b>${L(b>=UNLOCK.bday||f.know.bday,UNLOCK.bday,P.bday)}</b></div><div><span>Style</span><b>${esc(P.heritage)}</b></div></div></div></div>
   <div class="pf-sec"><h4>Personality</h4><p>${L(b>=UNLOCK.personality,UNLOCK.personality,P.personality)}</p></div>
   <div class="pf-two"><div class="pf-sec"><h4>Likes</h4><div class="tchips">${chips(P.likes,"like",UNLOCK.likesAll)}</div></div><div class="pf-sec"><h4>Dislikes</h4><div class="tchips">${chips(P.dislikes,"dislike",UNLOCK.dislikesAll)}</div></div></div>
   ${(()=>{const L=Object.keys(f.know||{}).filter(k=>k.startsWith("gift_")&&GIFTS[k.slice(5)]);return L.length?`<div class="pf-sec"><h4>Gifts given</h4><div class="tchips">${L.map(k=>{const t=f.know[k];return `<span class="tchip gk-${t}">${t==="love"?"♥♥":t==="like"?"♥":t==="dislike"?"✕":"·"} ${esc(GIFTS[k.slice(5)].name)}</span>`;}).join("")}</div></div>`:"";})()}
   ${gifts?`<div class="pf-sec"><h4>Known gifts</h4><div class="tchips">${gifts}</div></div>`:""}
   <div class="pf-two"><div class="pf-sec"><h4>Hometown</h4><p>${esc(P.home)}</p></div><div class="pf-sec"><h4>Hobby</h4><p>${L(b>=UNLOCK.hobby||f.know.hobby,UNLOCK.hobby,P.hobby)}</p></div></div>
   <details class="pf-sec"><summary>Story & secrets</summary><h4>Story</h4><p>${L(b>=UNLOCK.story,UNLOCK.story,P.story)}</p><h4>Secret</h4><p>${L(b>=UNLOCK.secret,UNLOCK.secret,P.secret)}</p></details>`;}
function giftHTML(id){const f=G.F[id];
  const E=giftsFor(id).map(k=>[k,{...GIFTS[k],bond:giftBond(id,k)}]).sort((x,y)=>(x[1].bond||0)-(y[1].bond||0)||(x[1].only?1:0)-(y[1].only?1:0));
  {const lk=E.filter(([k,g])=>(g.bond||0)>(f.bond||0));const nx=lk[0];const hid=lk.length-(nx?1:0);E.splice(0,E.length,...E.filter(([k,g])=>(g.bond||0)<=(f.bond||0)),...(nx?[nx]:[]));E.hidden=hid;}
  return `<h2>A gift for ${esc(f.name)}</h2><p class="meta">Bought and given right away · 1 per person per week · the closer you are, the more to choose ${E.hidden?` (${E.hidden} more hidden)`:""} · cash ${fmt(G.cash)}</p><div class="gifts">${E.map(([k,g])=>{const kn=f.know["gift_"+k],lk=(g.bond||0)>(f.bond||0);
   if(lk)return `<div class="giftbtn lockg"><b>???</b><small>Unlocks at bond ${g.bond}</small></div>`;
   const lw=f.giftL&&f.giftL[k],cd=lw&&G.week-lw<6&&(f.giftN||{})[k]?6-(G.week-lw):0;
   return `<button class="giftbtn" data-act="give" data-id="${id}" data-v="${k}" ${G.cash<g.price?"disabled":""}><b>${g.name}</b><small>${fmt(g.price)}${cd?` · given recently`:""}</small></button>`;}).join("")}</div>
   <p class="meta glegend">Watch how she reacts when you give it, or check her profile for what you've given before</p>`;}
function considerHTML(o){const me=G.F[o.a],op=G.F[o.b];const A=adviseCached(o.a,o.b,3);const pct=x=>Math.round(x*100);const v=verdictOf(A.bestRate);const sc=scouted(op.id);const P=personaOf(op);
  return `<h2>Fight info</h2><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b><span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b><span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
   ${P?`<p class="quote">“${esc(P.line)}” <span class="meta">— ${esc(P.tag)}</span></p>`:""}${h2hText(op)?`<p class="meta goldt">${h2hText(op)}</p>`:""}
   ${intelHTML(op)}
   ${sc?`<div class="planbars">${Object.entries(A.rates).sort((a,b)=>b[1]-a[1]).map(([k,x])=>`<div class="bar"><span>${PLANS[k].name}</span><i style="--v:${pct(x)}%;--bc:${k===A.best?"var(--gold)":"var(--blue)"}"></i><b class="num">${pct(x)}%</b></div>`).join("")}</div>`:`<p class="meta">Scout the tape to see the favorable plan</p>`}
   <p class="meta">Week ${o.week} · ${TIER[o.tier].name} · purse ${fmt(o.lose)} · win bonus ${fmt(o.win-o.lose)}</p>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">Close</button></div>`;}
function actNear(a){let s=0;if(a.rep)s+=Math.max(0,a.rep-G.rep)*2;if(a.week)s+=Math.max(0,a.week-G.week);if(a.fac)s+=20;if(a.lv)s+=15;return s;}
function campActsHTML(){const pk=UI.modal.pick;if(pk){const a=CAMP_ACTIONS[pk];return `<h2>Confirm activity?</h2><div class="px confirm"><b>${a.name}</b><p class="meta">${a.desc}${a.cost?` · cost ${fmt(a.cost)}`:""}</p><p class="meta">One per week</p>${a.mg?`<p class="meta">Play the minigame yourself for a skill-based result · or skip for an average one: ${a.skip}</p>`:""}</div><div class="mfoot"><button class="btn ghost" data-act="campback">Back</button>${a.mg?`<button class="btn" data-act="campok">Skip (average result)</button><button class="btn primary" data-act="campmg">${JOY_PX} Play it</button>`:`<button class="btn primary" data-act="campok">Confirm</button>`}</div>`;}
  // v1.23: locked activities stay hidden except the next one to open, so the list stays short
  const all=Object.entries(CAMP_ACTIONS).filter(([k,a])=>!a.hidden),open=all.filter(([k,a])=>!campActLocked(G,a)),lockd=all.filter(([k,a])=>campActLocked(G,a));
  const nx=lockd.sort((x,y)=>actNear(x[1])-actNear(y[1]))[0];
  return `<h2>This week's camp activity</h2><p class="meta">Choose 1 per week ${lockd.length>1?` · ${lockd.length-1} more activities hidden`:""}</p><div class="acts">${[...open,...(nx?[nx]:[])].map(([k,a])=>{const lock=campActLocked(G,a);return `<button class="actbtn ${lock?"lockd":""} ${a.mg?"mg":""}" data-act="campick" data-v="${k}" ${lock||G.campUsed||G.cash<a.cost?"disabled":""}>${a.mg?`<span class="mgtag">${JOY_PX}MINIGAME</span>`:""}<b>${a.name}</b><small>${lock?`Unlocks: ${lock}`:a.desc+(a.cost?` · ${fmt(a.cost)}`:"")}</small></button>`;}).join("")}</div>`;}
function studInfoHTML(){const n=students(G),cap=studentCap(G),d=studentDemand(G),fee=studentFee(G);
  return `<h2>Muay Thai class students</h2><div class="px confirm"><img class="face sm" src="${faceSrc("coach")}" alt="" style="float:left;margin:0 10px 4px 0">
   <p>Tourists and local kids who take Muay Thai lessons with Coach Daeng. They don't fight, but they're <b>the camp's main income</b>, paying fees every week</p></div>
   <div class="kv-row"><span>Currently enrolled</span><b class="num">${n}</b></div>
   <div class="kv-row"><span>Fee per student/week</span><b class="num">${fmt(fee)}</b></div>
   <div class="kv-row"><span>Weekly income</span><b class="num pos">+${fmt(n*fee)}</b></div>
   <p class="meta">Students join 1–2 per week until reaching how many want to learn or what the camp can hold. A fully built camp holds ${STU_MAX}</p>
   <h3>${d} people want to learn, thanks to</h3><ul class="mlist"><li>Fame · camp signs · songthaew shuttle · standard ring · camp level</li></ul>
   <h3>Max capacity ${cap}</h3><ul class="mlist"><li>Base 6 · class yard +3/lv · Coach Daeng +2/lv · hired coaches +1 each (max 5)</li></ul>
   ${d>cap?`<p class="meta goldt">${d} want to learn, but capacity is ${cap} · upgrade the class yard in Manage</p>`:n<Math.min(d,cap)?`<p class="meta">On the way: ${Math.min(d,cap)-n}</p>`:""}`;}
function weekCards(r){const R=roster(G);if(!R.length)return "";const P={};(r.prog||[]).forEach(p=>P[p.id]=p);
  return `<div class="wkcards">${R.map(f=>{const p=P[f.id];const nb=nextBooking(f);return `<div class="wkc px">${faceImg(f,"sm")}<b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b>
    <div class="minis"><span>EXP</span>${mini(f.xp/Math.max(1,xpNeed(f))*100,"var(--gold)")}<span>Fatigue</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    ${p?radarSVG(f,110,p.before):""}<span class="meta">${f.injury?`<span class="redt">Hurt ${f.injury} wk</span>`:nb?`Fight wk ${nb.week}`:"No fight yet"}${f.sp>0?" · <span class=\"goldt\">Skill points</span>":""}</span></div>`;}).join("")}</div>`;}
function reportHTML(){const r=G.lastReport;const ann=[];
  for(const d of ["A","B"])for(const [id,pos] of Object.entries(r.rank[d]||{})){const f=G.F[id];if(!f||(f.camp!=="player"&&f.camp!=="rival"))continue;
    const m=(r.move&&r.move[d]&&r.move[d][id])||0;ann.push({f,pos,m,d});}
  ann.sort((a,b)=>(b.f.camp==="player")-(a.f.camp==="player"));
  const cut=r.stage==="local"?4:r.stage==="district"?4:0;
  return `<h2>Week ${r.week}</h2><p class="goal">${goalText()}</p>
   ${ann.length&&cut?`<div class="announce"><div class="ann-h">Rankings · ${STAGE_NAME[r.stage]}</div>${ann.map(a=>`<div class="ann ${a.f.camp==="player"?"me":""}">${faceImg(a.f,"sm")}<b>${esc(a.f.name)}</b><span class="meta">Div ${a.d}</span><span class="rk">Rank ${a.pos}</span>${moveIcon(a.m)}${cut?`<span class="pill ${a.pos<=cut?"green":"red"}">${a.pos<=cut?"In the qualifying zone":"Outside the zone"}</span>`:""}</div>`).join("")}</div>`:""}
   ${r.prog?`<details class="prog"><summary class="ann-h">4-week progress chart (tap to view)</summary><div class="progrow">${r.prog.filter(p=>G.F[p.id]).map(p=>{const f=G.F[p.id];const sum=Object.keys(p.before).reduce((s,k)=>s+(f.a[k]-p.before[k]),0);
     return `<div class="pcell">${radarSVG(f,150,p.before)}<b>${esc(f.name)}</b><span class="meta">Overall ${sum>=0?"+":""}${sum.toFixed(1)}</span></div>`;}).join("")}</div></details>`:""}
   <div class="chips3"><span class="chip"><small>Students</small><b class="num pos">+${fmt(r.inc)}</b></span><span class="chip"><small>Expenses</small><b class="num neg">-${fmt(r.up+r.wg+(r.debtPay||0))}</b></span><span class="chip"><small>Cash</small><b class="num ${r.cash<0?"neg":""}">${fmt(r.cash)}</b></span></div>
   <details><summary>Results around the circuit (${r.log.length})</summary><div class="log">${r.log.map(l=>`<div>${esc(l)}</div>`).join("")||"<div>All quiet</div>"}</div></details>`;}
function modalHTML(){const m=UI.modal;let body="",foot=true;
  if(m.type==="fighter"){body=fighterHTML(G.F[m.id]);foot=false;}
  if(m.type==="consider"){const o=G.offers.find(x=>x.id===m.id);if(!o){UI.modal=null;return "";}body=considerHTML(o);foot=false;}
  if(m.type==="report")body=reportHTML();
  if(m.type==="repinfo")body=repInfoHTML();
  if(m.type==="otip"){const o=G.offers.find(x=>x.id===m.id);if(!o){UI.modal=null;return "";}body=offerTipHTML(o);foot=false;}
  if(m.type==="lossrev")body=lossRevHTML();
  if(m.type==="settings")body=settingsHTML();if(m.type==="gaunt"){body=gauntHTML();foot=false;}
  if(m.type==="slots")body=slotsHTML(m.mode);
  if(m.type==="campacts"){body=campActsHTML();foot=!m.pick;}
  if(m.type==="studinfo"){body=studInfoHTML();}
  if(m.type==="gift")body=giftHTML(m.id);
  if(m.type==="petname"){const p=(G.pets||[])[m.i];if(!p){UI.modal=null;return "";}body=`<h2>Name the ${esc(PETS[p.k].name)}</h2><div class="petnm"><img class="peti" src="${petIcon(p.k)}" alt=""><input id="petname" maxlength="12" value="${esc(p.name)}" autocomplete="off"></div><p class="meta">This name shows up in camp scenes</p><button class="btn primary" id="petnamebtn" data-act="petnamesave" data-v="${m.i}">Name</button>`;}
  if(m.type==="album"){const byC={};for(const id in CARDS)(byC[CARDS[id].c]=byC[CARDS[id].c]||[]).push(id);const own=G.cards||{};
    body=`<h2>Card album</h2><p class="meta">Collected ${Object.keys(own).length}/${Object.keys(CARDS).length} cards · tap a card to view its story · cards you don't have yet show as a silhouette with a hint</p>
     <div class="gacha"><span><b class="goldt">✦ ${G.dust||0}</b> stardust<small>Earned from wins, new cards and duplicates · guaranteed SSR in ${GACHA_PITY-(G.pity||0)} more</small></span><button class="btn sm gold" data-act="gacha" ${(G.dust||0)<GACHA_COST?"disabled":""}>Pull a card ${GACHA_COST}✦</button></div>
     ${CANON_IDS.filter(c=>byC[c]).map(c=>`<h4 class="albh">${esc(G.F[c].name)}</h4><div class="albg">${byC[c].map(id=>{const C=CARDS[id],o=own[id],R=CARD_R[C.r];
       return o?`<button class="ccard pxc" data-rarity="${C.r}" style="--rc:${R.c}" data-act="cardplay" data-v="${id}" title="${esc(C.t)}">${!o.seen?'<i class="ndot"></i>':""}${cardArtHTML(C,true)}<i class="rr">${C.r}${(o.lv||1)>1?`<u>${o.lv}</u>`:""}</i><span class="tstar">${"★".repeat(R.s)}</span><b>${esc(C.t)}</b></button>`
         :`<button class="ccard pxc lock" data-rarity="${C.r}" style="--rc:#77747d" data-act="cardhint" data-v="${id}" aria-label="Card not yet collected">${cardArtHTML(C,true)}<i class="rr">${C.r}</i><span class="tstar">${"★".repeat(R.s)}</span><b>???</b></button>`;}).join("")}</div>`).join("")}<p class="meta center">Tap a shadow card to see how to get it</p>`;}
  if(m.type==="cardnew"){const P=G.cardPend||[];const id=P[0];const C=CARDS[id];if(!C){G.cardPend=[];UI.modal=null;return "";}const RR=CARD_R[C.r];body=`<h2>New card!</h2><div class="gres" style="--rc: ${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center meta">${C.hint?esc(C.hint)+" · ":""} Stardust <b class="goldt">✦ 5</b>${P.length>1?` · new cards left: ${P.length-1} more`:""}</p></div>
    <div class="mfoot roadbtns"><button class="btn primary" data-act="cardplay" data-v="${id}" data-from="new">View story now</button><button class="btn" data-act="cardlater">Save for later</button></div>`;foot=false;}
  if(m.type==="gacha"){const R=m.res,C=CARDS[R.id],RR=CARD_R[C.r];body=`<h2>Pull result</h2><div class="gres" style="--rc: ${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center">${R.isNew?"<b class=\"goldt\">New card!</b>":R.up?`Duplicate · upgraded to <b>Lv.${R.up}</b> · Bond +`:`Card already maxed · converted to <b class="goldt">✦ ${R.dust}</b>`}</p></div>
    <div class="mfoot roadbtns">${R.isNew?`<button class="btn" data-act="cardplay" data-v="${R.id}">View story</button>`:""}<button class="btn gold" data-act="gacha" ${(G.dust||0)<GACHA_COST?"disabled":""}>Pull again ${GACHA_COST}✦ (have ${G.dust||0})</button><button class="btn primary" data-act="album">Back to album</button></div>`;foot=false;}
  if(m.type==="masters"){body=`<h2>Invite an old-school master</h2><p class="meta">${fmt(18000)} per session · each fighter can learn once per season</p><div class="mlist">${Object.entries(MASTERS).map(([k,M])=>`<div class="mrow"><b>${M.name}</b><small>Boosts ${M.attrs.map(a=>ATTR_LABEL[a]).join(" · ")}</small><div class="obtns">${roster(G).map(f=>`<button class="btn sm" data-act="hiremaster" data-id="${f.id}" data-v="${k}" ${G.cash<M.cost||f.masterSeason===(G.season||1)?"disabled":""}>${esc(f.name)}</button>`).join("")}</div></div>`).join("")}</div>`;}
  if(m.type==="advice"){body=adviceHTML(m.id);foot=false;}
  if(m.type==="drill"){body=drillHTML();foot=false;}
  if(m.type==="tpick"){body=tpickHTML(m.id);foot=false;}
  if(m.type==="fplan"){body=fplanHTML(m.id);foot=false;}
  if(m.type==="hang"){body=hangHTML(m.id);}
  if(m.type==="dm"){foot=false;body=dmBracketHTML();}
  if(m.type==="dmpick"){foot=false;body=dmPickHTML();}
  if(m.type==="camplv"){foot=false;body=campLvHTML();}
  if(m.type==="loan"){foot=false;body=`<h2>Quick loan</h2><div class="loanbox px"><p>A Gold Helmet goon hands over a gold business card: "Quick cash. No guarantor. No waiting."</p></div>
    <div class="kv-row"><span>Borrow</span><b class="num pos">${fmt(LOAN_AMT)}</b></div><div class="kv-row"><span>Interest</span><b class="num neg">10% every 4 weeks (compounding)</b></div><div class="kv-row"><span>Side effect</span><b class="warnt">The helmet gang will challenge you at the market more often</b></div>
    <p class="meta">Repay it all at once on the finance page when you have the cash · Coach Daeng: "Grandpa Chai got burned by these people"</p>
    <div class="row2"><button class="btn" data-act="closeModal">Better not</button><button class="btn red" data-act="loanyes">Borrow ${fmt(LOAN_AMT)}</button></div>`;}
  if(m.type==="campres"){foot=false;const a=CAMP_ACTIONS[m.k];const C=CFX[m.k];body=`<div class="campres ${m.skip?"skip":""}">${C?`<div class="cfxwrap" data-act="cfxskip" role="button" aria-label="Skip scene"><canvas width="320" height="180" data-campfx="${m.k}"></canvas><span class="cfxcap">${esc(C.cap)}</span><i class="cfxbar"></i></div>`:""}
   <div class="cr-res"><h2>${esc(a.name)}</h2><p class="cr-note">${esc(m.note)}</p>${a.cost?`<p class="meta">Costs ${fmt(a.cost)}</p>`:""}<div class="mfoot"><button class="btn primary" data-act="closeModal">Great!</button></div></div></div>`;}
  if(m.type==="endwarn"){foot=false;body=`<h2>End the week now?</h2><ul class="mlist">${m.todo.map(t=>`<li>${t}</li>`).join("")}</ul><p class="meta">You can skip without penalty, but you might miss chances this week</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">Go back</button><button class="btn primary" data-act="endgo">End week now</button></div>`;}
  if(m.type==="signwarn"){const f=G.F[m.id],net=weeklyNet(G)-f.wage;foot=false;
    body=`<h2>Sign ${esc(f.name)}?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>Coach Daeng warns:</b> ${net<0?`If you sign now, the camp runs a deficit of ${fmt(-net)} every week and must rely on fight purses. In the red 4 weeks and below ฿10,000, the camp goes bankrupt`:`The signing fee of ${fmt(f.fee)} leaves only ${fmt(G.cash-f.fee)}. Keep an emergency fund too`}</span></div>
     <div class="kv-row"><span>Signing fee</span><b class="num">${fmt(f.fee)}</b></div><div class="kv-row"><span>Wage</span><b class="num">${fmt(f.wage)}/wk</b></div><div class="kv-row"><span>Weekly net after signing</span><b class="num ${net<0?"neg":"pos"}">${fmt(net)}</b></div>
     <div class="mfoot"><button class="btn ghost" data-act="closeModal">Wait</button><button class="btn primary" data-act="sign" data-v="${f.id}" data-ok="1">Sign now</button></div>`;}
  if(m.type==="levelup"){body=`<h2 class="lvup">LEVEL UP!</h2>${m.ids.map(id=>{const f=G.F[id];return `<div class="lvrow"><div class="l">${faceImg(f,"sm")}<b>${esc(f.name)} Lv.${f.lvl}</b></div>${coachOn()&&f.sp>0&&!hasTree(f.id)?`<p class="hinttxt"><img src="${faceSrc("coach")}" alt=""><span>${skillTip(f)}</span></p>`:""}${skillGrid(f,true)}</div>`;}).join("")}`;}
  if(typeof XMODAL!=="undefined"&&XMODAL[m.type]){const r=XMODAL[m.type](m);body=r.body;foot=r.foot;}
  return `<div class="overlay" data-act="closeModalBg"><div class="px modal pxscroll m-${m.type}${m.type==="fighter"?" fpm t-"+(UI.ptab||"over"):""}" data-sk="modal-${m.type}" role="dialog" aria-modal="true"><button class="xbtn" data-act="closeModal" aria-label="Close">✕</button>${body}
    ${foot?`<div class="mfoot"><button class="btn primary" data-act="closeModal">${m.type==="report"||m.type==="levelup"?"Continue ▸":"Close"}</button></div>`:""}</div></div>`;}

// ---------- montage ----------
function montageHTML(){const M=UI.montage;
  return `<div class="montage" role="dialog" aria-label="Weekly training"><div class="mt-bg" style="background-image:url(${ASSET}${gymBg()})"></div>
   <h2 class="mt-h">Training · week ${M.week}</h2><div class="mt-row pxscroll">${M.items.map((g,i)=>{const f=G.F[g.id];const top=Object.entries(g.gains).sort((a,b)=>b[1]-a[1]).slice(0,3).filter(x=>x[1]>=.05);
     const need=xpNeed(f.lvl),pct=f.lvl>=10?100:clamp(f.xp/need*100,0,100),gp=f.lvl>=10?0:clamp(g.xp/need*100,0,pct);
     return `<div class="mt-col px" style="--d:${i*.2}s"><canvas width="160" height="150" data-sprite="${f.id}" data-floor="1"></canvas>
      <div class="mt-info"><b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b><span class="pill">${g.injury?"Recovering":PRESETS[g.preset].name}</span>
      <div class="pops">${top.map(([k,v],j)=>`<span style="--d:${i*.2+.3+j*.2}s">${ATTR_LABEL[k]} +${v.toFixed(1)}</span>`).join("")||"<span class=\"dim\">Recovering</span>"}</div>
      <div class="mt-xp"><i style="--v:${pct}%;--g:${gp}%;--d:${i*.2+.8}s"></i><small>EXP +${g.xp}${f.lvl<10?` · ${Math.round(f.xp)}/${need}`:" · MAX"}</small></div></div></div>`;}).join("")}</div>
   <button class="btn primary mt-go" data-act="montageDone">${M.fights?"To the fight ▸":"Continue ▸"}</button></div>`;}

// ---------- VN scene ----------
// v1.8: warm portraits before they are needed so scenes don't pop in late
const WARMED={};function warm(src){if(!src||WARMED[src])return;const i=new Image();i.src=src;WARMED[src]=i;}
function warmChar(id,look){if(id==="coach"){warm(`${ASSET}coach.webp`);return;}if(!CANON_IDS.includes(id))return;
  (look==="casual"?["happy","flustered","pout"]:["happy","sad","surprised","angry"]).forEach(m=>warm(stand(id,look,m)));}
function warmSteps(steps,look){const walk=list=>(list||[]).forEach(st=>{if(!st)return;const n=typeof st.n==="function"?null:st.n;if(n)warmChar(n,st.l==="casual"?"casual":look==="casual"&&!st.l?"casual":"fight");
  if(st.with)warmChar(st.with,look==="casual"?"casual":"fight");if(st.bg&&BGIMG[st.bg])warm(ASSET+BGIMG[st.bg]);if(st.choice)st.choice.forEach(c=>walk(c.then));});walk(steps);}
function playScene(steps,done,opts={}){warmSteps(steps,opts.look||"fight");if(opts.bg&&BGIMG[opts.bg])warm(ASSET+BGIMG[opts.bg]);UI.scene={steps:[...steps],i:0,done,bg:opts.bg||"night",look:opts.look||"fight",cur:null,cast:[],coachOK:!!opts.coachOK};sceneNext();}
function sceneNext(){const S=UI.scene;if(!S)return;
  while(S.i<S.steps.length){const st=S.steps[S.i];
    if(st.inject){const more=st.inject(G)||[];S.steps.splice(S.i,1,...more);continue;}
    if(st.bg)S.bg=st.bg;
    if(st.fx&&!st.n&&!st.choice&&!st.choiceFn){st.fx(G);S.i++;continue;}
    if(st.choice||st.choiceFn){S.cur={choice:(st.choice||st.choiceFn(G))};render();return;}
    const n=val(st.n);S.lookOf=S.lookOf||{};
    // v1.8: each character keeps one outfit for the whole scene
    const look=CANON_IDS.includes(n)?(S.lookOf[n]=S.lookOf[n]||(st.l==="train"?"fight":st.l)||S.look):(st.l||S.look);
    S.cur={n,f:val(st.f)||"happy",t:nameCall(n,val(st.t)),look,who:st.who,tel:n==="coach"&&!S.coachOK&&!!(G&&G.coachAway&&G.week<G.coachAway)};
    if(st.show)S.cast=st.show.map(x=>({id:x.id,f:x.f||"happy",look:S.lookOf[x.id]||x.l||look,back:!!x.back}));
    if(n==="npc"){const im=npcImg(st);if(im)S.cast=[{id:"npc:"+im,f:"happy",look}];}
    if(n==="coach"){S.cast=[{id:"coach",f:"happy",look}];}           // the coach always stands alone
    else if(CANON_IDS.includes(n)){const w=st.with&&st.with!=="coach"?st.with:null;let cast=S.cast.filter(c=>c.id!==n&&c.id!=="coach");
      if(w){cast=cast.filter(c=>c.id===w);if(!cast.length)cast=[{id:w,f:"happy",look:S.lookOf[w]||look}];}
      else if(cast.length>1)cast=cast.slice(-1);
      cast.push({id:n,f:S.cur.f,look});S.cast=cast.slice(-2);}
    S.i++;render();return;}
  const d=S.done;UI.scene=null;save();render();if(d)d();}
// v1.35: once she is close she calls you by name, not by title
function nameCall(n,t){if(typeof t!=="string"||!G||!G.F[n]||!G.F[n].canon||(G.F[n].bond||0)<25)return t;const nm=G.player.name;return t.replace(/^ผู้จัดการ(?=คะ|ครับ|!|…| )/,""+nm).replace(/^Manager(?=[,!…. ])/,nm);}
function sceneChoose(k){const S=UI.scene,c=S.cur.choice[k];AU.sfx("ui");if(c.fx)c.fx(G);S.steps.splice(S.i+1,0,...(c.then||[]));S.i++;sceneNext();}
function sceneHTML(){const S=UI.scene,c=S.cur||{};const sp=c.n==="coach"?{name:c.tel?"Coach Daeng (on the phone)":"Coach Daeng",color:"#d98a4a"}:c.n==="npc"?{name:c.who||"",color:"#8fbf6a"}:(SPK[c.n]||{name:""});
  const who=c.n==="me"?esc(G.player.name):c.n==="nar"?"":esc(sp.name||"");
  const spk=c.n||S.lastN;if(c.n)S.lastN=c.n;
  const bgKey=(S.bg==="gym"||S.bg==="camp")?gymBg():BGIMG[S.bg];
  const cast=S.cast.map((m,i)=>{const active=m.id===spk||(c.choice&&i===S.cast.length-1);const pos=S.cast.length===1?"c":i===0?"l":"r";
    return `<img class="stand ${pos} ${active&&!m.back?"on":"off"}${m.back?" back":""}" src="${m.id.startsWith("npc:")?`${ASSET}npc_${m.id.slice(4)}.webp`:m.back?`${ASSET}${m.id}_back.webp`:stand(m.id,m.look,active?moodFor(c.f,m.look,c.t):moodFor(m.f,m.look,""))}" alt="">`;}).join("");
  const tag="";
  return `<div class="vn" role="dialog" aria-label="Story scene"><div class="vbg bg-${S.bg==="camp"?"gym":S.bg}" ${bgKey?`style="background-image:url(${ASSET}${bgKey})"`:""}></div>${S.bg==="night"?'<div class="vnight"></div>':""}
   <div class="cast ${(S.cast||[]).length>1?"duo":""}">${cast}</div>
   ${c.choice?"":`<button class="vtap" data-act="vnext" aria-label="Continue"></button>`}
   <div class="vbox px" data-act="${c.choice?"":"vnext"}" style="--c:${sp.color||"var(--gold)"}">
    ${c.choice?`<div class="choices">${(UI._ck!==c?(UI._ck=c,UI._ct=Date.now()):0,"")}${c.choice.map((o,i)=>{const t=val(o.t),m0=t.match(/^(.*?)\s*\(([^()]*)\)\s*$/),m=m0&&m0[1].trim()?m0:null,act=m0&&!m0[1].trim();return `<button data-act="vchoose" data-v="${i}" ${act?'class="cact"':""}>${esc(act?m0[2]:m?m[1]:t)}${m?`<small class="cfx">${esc(m[2])}</small>`:""}</button>`;}).join("")}</div>`:
     `${who?`<div class="who">${tag}<b>${who}</b></div>`:""}<div class="txt ${c.n==="nar"?"nar":""}">${esc(c.t||"")}</div><div class="nextc">Tap to continue ▸</div>`}
   </div><button class="btn sm vskip" data-act="vskip">Skip scene</button></div>`;}
function sceneSkip(){let g=0;while(UI.scene&&g++<300){const s=UI.scene;if(s.cur&&s.cur.choice)sceneChoose(0);else sceneNext();}}

// ---------- week-1 guide ----------
const TUTORIAL=()=>[
  {n:"coach",bg:"gym",t:`All right, ${G.player.name}, let me tell you what a camp owner does in a week`},
  {n:"coach",t:"One: in the 'Train' tab, pick Kati's program. Hard training gains more but tires fast. Over 65 fatigue, let her recover"},
  {n:"coach",t:"Two: the 'Fights' tab has fight offers. I color them: green is weaker, yellow is even, red is stronger. Stronger pays more. To know an opponent in detail, scout the tape first"},
  {n:"coach",t:"Before a fight you pick the plan and tactics. Between rounds I'll report what happened, but the decisions are yours"},
  {n:"coach",t:"Three: the gold 'Choose camp activity' button under the camp picture, one per week. Some earn money, some cost money. Don't want to spend? Choose 'Camp day off'"},
  {n:"coach",t:"Four: the fighter cards below. Tap to see stats, skills and relationships. Use free time to take fighters out; bond gives them fighting heart"},
  {n:"coach",t:"Money comes from class students and fight purses. Early on, nobody knows our camp, so spend carefully. Grandpa's debt is still a hundred and twenty thousand"},
  {n:"coach",t:"When you're done, press 'End week' at the top right. I'll whisper tips at the top of the camp screen; if it bugs you, close it, or turn it off for good in Settings"},
  {n:"kati",f:"happy",l:"train",with:"coach",t:"That's the longest Coach Daeng has talked all year! I'm in your hands, boss!"}];
function tutorialHTML(){const T=G.tut||{};const items=[["train","Set training",T.train,"train"],["fights","See fight offers",T.fights,"fights"],["camp","Choose a camp activity",!!G.campUsed,"campacts"],["free","Take a fighter out",G.freeUsed,"people"]];
  const done=items.filter(i=>i[2]).length;
  return `<div class="tut">${items.map(([k,t,ok,go])=>`<button class="tutb ${ok?"ok":""}" data-act="tipact" data-k="${go==="campacts"?"campacts":"tab"}" data-v="${go}">${ok?"☑":"☐"} ${t}</button>`).join("")}</div>
   ${done===4?`<p class="meta">All done! Press 'End week'</p>`:""}`;}
function goalText(){const st=stageOf(G.week),me=roster(G);const best=d=>{const rows=standings(G,d);const i=rows.findIndex(r=>r.f.camp==="player");return i<0?null:{i:i+1,f:rows[i].f};};
  const a=best("A");
  if(st==="local")return `Goal: subdistrict top 4 by week 20${a?` · ${a.f.name} is ranked #${a.i}`:""}`;
  if(st==="district"){const inQ=[...G.qual.A,...G.qual.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inQ?`Goal: district top 4 by week 40 to reach the provincial semis ${a?` · ${a.f.name} rank ${a.i}`:""}`:"Goal: missed the district round this year. Strengthen the camp and save money for next season";}
  if(st==="final"&&G.week<=44&&[...((G.semis||{}).A||[]),...((G.semis||{}).B||[])].some(id=>G.F[id]&&G.F[id].camp==="player")&&!G.finalists.A.concat(G.finalists.B).some(id=>G.F[id]&&G.F[id].camp==="player"))return "Goal: win the provincial semifinal, week 44";
  if(st==="final"){const inF=[...G.finalists.A,...G.finalists.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inF?"Goal: the provincial final, week 49, five rounds":"Goal: look after the camp until the season ends";}
  return "Year end · preparing for next year";}

// ---------- events / extras ----------
// v1.49: annual events can play once per year
const evSeen=e=>e.annual?((G.seenY||{})[e.id]===(G.season||1)):!!G.seen[e.id];
function pendingEvents(){return EVENTS.filter(e=>e.when&&!evSeen(e)&&e.when(G));}
// v1.41: at most two optional story scenes a week — the rest wait for next week (main story / finals always play)
const EV_MUST=/^(prologue|daeng_leave|pre_qual|qual_result|final_result|semi_result|night_final|lover_final|ploy_prefinal|fah_prefinal|first_win|first_loss)/,EV_CAP=2;
function runEvents(done){const list=pendingEvents().sort((a,b)=>(b.pri||0)-(a.pri||0));let played=0,opt=0;/* time-limited scenes go first */
  const step=()=>{const e=list.shift();if(!e||G.ended){done&&done(played);return;}if(evSeen(e)||!e.when(G)){step();return;}
    if(G.coachAway&&G.week<G.coachAway&&!EV_MUST.test(e.id)&&!/daeng|coach/.test(e.id)&&e.steps.some(x=>x.n==="coach")){step();return;}/* v1.60: scenes where Kru Daeng talks wait until he is back */
    if(!EV_MUST.test(e.id)&&G.week<47){if(opt>=EV_CAP){step();return;}opt++;}
    if(e.annual){G.seenY=G.seenY||{};G.seenY[e.id]=G.season||1;}else G.seen[e.id]=true;G.seenWk=G.seenWk||{};G.seenWk[e.id]=G.week;played++;playScene(e.steps,step,{bg:e.bg,look:e.look,coachOK:/daeng|coach/.test(e.id)});};step();}
function weeklyExtra(done){const rng=mulberry32(G.seed+G.week*313);if(typeof questExtra==="function"&&questExtra(done,mulberry32(G.seed+G.week*59)))return;
  const dil=(typeof DILEMMAS!=="undefined"?DILEMMAS:[]).filter(d=>!G.seen[d.id]&&G.week>=d.from&&G.week<=d.to&&d.need(G));
  const sinceD=G.week-(G.lastDilemma||0);
  // v1.21: something happens most weeks — a decision every couple of weeks, chatter or a happening in between
  if(dil.length&&sinceD>=2&&rng()<.62){const d=dil[Math.floor(rng()*dil.length)];G.seen[d.id]=true;G.lastDilemma=G.week;
    playScene([{n:"nar",t:"— Decisions to make —"},...d.steps],done,{bg:d.bg==="camp"?"gym":d.bg,look:d.look||"train"});return;}
  const chats=CHATTER.filter(c=>!G.seen[c.id]&&c.need(G));const haps=HAPPENINGS.filter(h=>!G.seen[h.id]);
  const chats2=chats.filter(c=>!c.need2||c.need2(G)),haps2=haps.filter(h=>!h.need||h.need(G));
  let pick=null;if(chats2.length&&rng()<.6)pick=chats2[Math.floor(rng()*chats2.length)];else if(haps2.length&&rng()<.7)pick=haps2[Math.floor(rng()*haps2.length)];
  if(!pick){done();return;}G.seen[pick.id]=true;playScene(pick.steps,done,{bg:pick.bg==="camp"?"gym":pick.bg,look:pick.look||"train"});}
function afterWeekFlow(){if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);}}if(typeof mailWeekly==="function"&&!G.ended)mailWeekly(G);if(typeof chatWeekly==="function"&&!G.ended)chatWeekly(G);runEvents(played=>{const fin=()=>{if(G.ended){startEnding();return;}
    if(typeof cardCheck==="function"){const g2=cardCheck(G);if(g2.length)G.cardPend=(G.cardPend||[]).concat(g2);}relTierCheck();if(typeof OUTFITS!=="undefined"){G.outSeen=G.outSeen||{};const nu=Object.keys(OUTFITS).filter(k=>k!=="base"&&k!=="heart"&&!G.outSeen[k]&&outfitOk(G,null,k));nu.forEach(k=>G.outSeen[k]=1);if(nu.length)setTimeout(()=>toast(`New outfit unlocked: ${nu.map(k=>OUTFITS[k].name).join(", ")} · change it in the fighter profile, "Outfit" tab`),400);}if(UI.relUp&&UI.relUp.length){const m=UI.relUp.join(" / ");UI.relUp=[];setTimeout(()=>toast("♥ "+m),300);}
    if(G.levelUps&&G.levelUps.length){const ids=[...new Set(G.levelUps)];G.levelUps=[];AU.sfx("level");UI.modal={type:"levelup",ids};}else if((G.cardPend||[]).length){AU.sfx&&AU.sfx("level");UI.modal={type:"cardnew"};}render();};
    const go=()=>coachBackScene(()=>aftermathScene(()=>tiredScene(()=>rinScene(fin))));if(played)go();else weeklyExtra(go);});}
// v1.15: a worn-out fighter asks for a rest week herself
function tiredScene(done){G.tiredAt=G.tiredAt||{};const f=roster(G).find(x=>!x.injury&&x.fatigue>=58&&x.plan.preset!=="rest"&&(G.tiredAt[x.id]||-9)<G.week-3);if(!f||!coachOn()&&f.fatigue<70){done();return;}
  G.tiredAt[f.id]=G.week;const ask=vary("tired_"+f.id,({kati:["Coach… my legs feel so heavy. Can I rest for a week?","My run this morning was even slower than yesterday… can I rest a little?","My shoulders won't lift anymore, Coach… I can still go, but…"],mali:["Waah… Mali can't lift her kicks anymore. Let me sleep for a whole week~","Mali fell asleep twice while stretching… can I rest?","Mali's legs are wobbling like jelly~ can I sleep today?"],rin:["My morning heart rate is abnormally high… my body needs rest","My fatigue graph has shot past the red line. I need a week off","I made three typos in my spreadsheet this morning… my body is warning me"]})[f.id]||["Can I rest a little?"]);
  playScene([{n:f.id,f:"sad",l:"fight",t:ask},...(coachOn()?[{n:"coach",t:`Fatigue ${Math.round(f.fatigue)} already. Pushing on risks injury, Coach says recover this week`}]:[]),
    {choice:[{t:"Rest this week",fx:()=>{if(!trLocked(f))f.plan.preset="rest";f.morale=Math.min(100,f.morale+4);},then:[{n:f.id,f:"happy",l:"fight",t:{kati:"Thank you! Next week I'll be back at a hundred percent",mali:"Yay~ hugging Little Coach in bed all day!",rin:"Thank you. I'll use the rest day to review tapes"}[f.id]||"Thank you!"}]},
     {t:"Hang in there a bit longer, the fight is close",fx:()=>{f.morale=Math.max(0,f.morale-5);},then:[{n:f.id,f:"sad",l:"fight",t:{kati:"…Okay. I'll try",mali:"Waah… okay, but don't scold Mali if she's slow",rin:"…Understood. I'll note down why we're pushing through"}[f.id]||"…Okay"}]}]}],()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"fight"});}
function aftermathScene(done){const L=G.lastBig;if(!L||L.shown||G.week-L.wk>1){done();return;}L.shown=true;const me=G.F[L.a];if(!me||me.camp!=="player"){done();return;}
  playScene(aftermathSteps(G,L),()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"train"});}
// v1.15: Kru Daeng comes back from his leave and checks on everyone
function coachBackScene(done){if(!G.coachAway||G.week<G.coachAway||(G.flags&&G.flags.coachBack)){done();return;}G.flags=G.flags||{};G.flags.coachBack=true;const R=roster(G);const k=R[0];
  const tired=R.filter(f=>f.fatigue>=50).map(f=>f.name);
  playScene([{n:"nar",t:"Monday morning, an old motorbike pulls up at the camp gate"},{n:"coach",t:"I'm back! Two weeks away, the camp didn't fall apart, did it? Haha"},
    ...(k?[{n:k.id,f:"happy",l:"train",t:k.id==="kati"?"Coach Daeng! I missed you so much! Nobody yelled at us in the morning, it was so quiet":"Welcome back, Coach!"}]:[]),
    {n:"coach",t:tired.length?`Coach looks at ${tired.join(", ")} and says you're all too tired. This week Coach takes charge of the program`:"Everyone looks fit. The manager did a good job. Then back to full training!"},
    {n:"nar",t:"Coach's advice is available again"}],()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"train"});}
// v1.15: Rin drops by every 3 weeks with a plain-language briefing: next fight, training, money
function rinScene(done){const r=G.F.rin;if(!r||r.camp!=="player"||G.week%3!==0||G.rinSeen===G.week){done();return;}G.rinSeen=G.week;const R=roster(G);const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};const L=[];
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];
  if(nb){const op=G.F[nb.b],me=G.F[nb.a];L.push(`Next fight: ${me.name} vs ${op.name} week ${nb.week}: she ${COUNTER_WHY[counterPreset(op)]}`);L.push([`Simple. Before fight day, train "${PRESETS[counterPreset(op)].name}", then switch to "Fight prep" in the fight week`,`Once scouted, training "${PRESETS[counterPreset(op)].name}" gives the counter bonus. Don't forget fight prep in the fight week`,`My formula: "${PRESETS[counterPreset(op)].name}" first, then "Fight prep" close to the fight`][Math.floor(G.week/3)%3]);}
  const tired=R.filter(f=>f.fatigue>=50);const w=R.map(f=>[f,RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0]]).sort((a,b)=>a[1][1]-b[1][1])[0];
  // v1.22.1: rotate whose weakness Rin talks about, and how she says it
  const rf=R[Math.floor(G.week/3)%R.length],rw=RADAR_AX.map(([n,fn])=>[n,fn(rf.a)]).sort((a,b)=>a[1]-b[1]);const rpick=rw[Math.floor(G.week/6)%2]||rw[0];
  const RW=[`This time I'll talk about ${rf.name}. ${rpick[0]} is still her lowest stat. A little more training will show results`,`${rf.name} still leaves an opening in ${rpick[0]}. Opponents who read the game will target it`,`If I had to pick one thing to fix right now, I'd pick ${rpick[0]} of ${rf.name}`];
  L.push(tired.length?`${tired.map(f=>f.name).join(", ")} is over half fatigued. Give her a recovery week and she'll come back stronger`:RW[Math.floor(G.week/3)%RW.length]);
  const net=weeklyNet(G),wl=weeksLeft();
  L.push(net<0?`Money: we're losing ${fmt(-net)} per week. In about ${wl} weeks the money runs out. More fights or the special-class activity will help`:G.cash>40000?`Money: we have ${fmt(G.cash)} to spare. Try upgrading the camp or sending Coach Daeng to train. It pays off more than saving it`:`Money: we profit ${fmt(net)} per week. We're okay, but don't spend much yet`);
  G.rinNote={wk:G.week,steps:[{n:"rin",f:"happy",l:"casual",t:["Manager, I've summarized three weeks of data for you","This round's report. A three-minute read… if you read fast","Manager, new charts are in. It's short, I promise","I stayed up late making this table. …Not that I want praise","The last three weeks of data. One piece of good news, one thing to watch"][Math.floor(G.week/3)%5]},...L.map(t=>({n:"rin",f:"happy",l:"casual",t})),{n:"rin",f:"flustered",l:"casual",t:["…That's all. Use it if it helps","End of report. Questions welcome. …None is fine too","I've printed a summary on the board outside the gym","If we follow this, I estimate we'll definitely improve"][Math.floor(G.week/3)%4]}]};done();}

// ---------- week flow ----------
function endWeek(){if(UI.scene||UI.fight||UI.montage)return;AU.resume();UI.tipIdx=0;
  weekTrain(G);
  for(const b of G.bookings.filter(b=>b.week===G.week&&b.npc)){const F=quickFight(G.F[b.a],G.F[b.b],G.seed+G.week*97+b.id.length,b.rounds);finishBracket(G,b,F);applyResult(G,F,b);
    G.log.push(`${TIER[b.tier].name} Div ${G.F[b.a].div}: ${G.F[b.a].name} ${F.result.win==="A"?"Win":"Loss"} ${G.F[b.b].name} (${F.result.type})`);}
  const queue=G.bookings.filter(b=>b.week===G.week&&!b.npc);
  UI.montage={week:G.week,items:roster(G).map(f=>({id:f.id,gains:{...f.gains},xp:f.xpGain||0,preset:f.plan.preset,injury:f.injury})),fights:queue.length,queue};if(SETTINGS.quick){montageDone();return;}render();}
function montageDoneQuick(){return SETTINGS.quick;}
function montageDone(){const q=[...UI.montage.queue];UI.montage=null;const next=()=>{const b=q.shift();if(!b){finishWeek();return;}openFight(b,next);};next();}
function finishWeek(){G.bookings=G.bookings.filter(b=>b.week!==G.week);weekFinish(G);G.campNote=null;save();
  if(G.ended){startEnding();return;}UI.modal={type:"report",after:afterWeekFlow};render();}
function startEnding(){const E=endingScene(G);UI.modal=null;UI.fight=null;UI.montage=null;playScene(E.steps,()=>{UI.ending=E;if(G.ended==="bankrupt"||DEMO)clearSave();else save();render();},{bg:E.steps[0].bg||"camp",look:"casual"});}
const DEMO=false; // v1.50: the camp carries on into year 2+ (save is kept)
function seasonResult(){const p=id=>G.F[id]&&G.F[id].camp==="player";const out=[];
  for(const d of ["A","B"]){const ids=new Set([...(G.qual[d]||[]),...((G.semis||{})[d]||[]),...G.finalists[d]]);
    for(const id of ids){if(!p(id))continue;const f=G.F[id];
      out.push({f,d,t:G.champ[d]===id?"Provincial champion":G.finalists[d].includes(id)?"Provincial runner-up":((G.semis||{})[d]||[]).includes(id)?"Provincial semifinal":"District round",c:G.champ[d]===id?"gold":G.finalists[d].includes(id)?"green":""});}}
  return out;}
/* v1.72: the public demo stops after year 1 until the player enters the code from the game's Discord. One code opens every slot on this device; saves already past year 1 stay open */
const GATE={code:"U0lSSUNIQUky",url:"https://discord.gg/pgBG3cd9HD",key:"mtm-unlock"};
function gateOpen(){try{if(localStorage.getItem(GATE.key)==="1")return true;}catch(e){}return !!(G&&(G.unlocked||(G.season||1)>=2));}
function gateHTML(){return `<section class="px card gate"><span class="pill gold">Demo complete · Year 1</span><h3>Thank you for playing this far!</h3>
  <p>To keep playing Year 2, join the game Discord and get the code in #continue-code. Your save is kept, so enter the code any time and carry on.</p>
  <a class="btn gatelink" href="${GATE.url}" target="_blank" rel="noopener">Join the game Discord ▸</a>
  <div class="gatein"><input id="gatecode" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Enter code here" aria-label="Continue code"><button class="btn primary" data-act="gatego">Unlock</button></div>
  ${UI.gateErr?"<p class=\"meta redt\">That code isn't right. Check the spelling and try again</p>":""}</section>`;}
function endingHTML(){const E=UI.ending,all=roster(G),res=seasonResult();
  return `<main class="endpage"><section class="px card end-hero"><img class="endlogo" src="${ASSET}logo.webp" alt="Muay Thai Moe">
    <span class="pill gold">${G.ended==="bankrupt"?"Camp closed":(G.season||1)>=2?`End of Year ${G.season}`:"End of Chapter 1 · Year 1"}</span><h1>${(G.season||1)>=2&&G.ended!=="bankrupt"?esc(E.title):`Ending: ${E.title}`}</h1>
    <p class="lead">${(G.season||1)>=2&&G.ended!=="bankrupt"?`Year ${G.season} is over. ${esc(G.player.name)} and Sirichai Camp carry on`:`Thank you for playing <b>Muay Thai Moe</b>! ${esc(G.player.name)} brought Sirichai Camp this far`}</p></section>
   <section class="px card"><h3>This year's results</h3>${res.length?res.map(r=>`<div class="kv-row"><span>${faceImg(r.f,"sm")} ${esc(r.f.name)} · Div ${r.d}</span><span class="pill ${r.c}">${r.t}</span></div>`).join(""):"<p class=\"meta\">No fighter passed the subdistrict round this year</p>"}</section>
   <div class="grid g3"><section class="px card"><h3>Camp</h3><div class="kv-row"><span>Camp level</span><b>Lv.${campLevel(G)} ${CAMP_LV_NAME[campLevel(G)]}</b></div><div class="kv-row"><span>Cash</span><b class="num">${fmt(G.cash)}</b></div><div class="kv-row"><span>Remaining debt</span><b class="num">${fmt(G.debt)}</b></div><div class="kv-row"><span>Students</span><b class="num">${students(G)}</b></div><div class="kv-row"><span>Fame</span><b class="num">${G.rep.toFixed(1)}</b></div></section>
   <section class="px card"><h3>Camp fighters</h3>${all.map(f=>`<div class="kv-row"><span>${esc(f.name)} Lv.${f.lvl}</span><span class="num">${rec(f)}</span></div>`).join("")}</section>
   <section class="px card"><h3>Relationships</h3>${CANON_IDS.map(id=>G.F[id]).filter(f=>f.met).map(f=>`<div class="kv-row"><span>${esc(f.name)}${G.romance===f.id?" ♥ Sweetheart":G.promise&&G.promise[f.id]!=null?" ♡ Promised":""}</span>${hearts(f.bond)}</div>`).join("")}</section></div>
   <section class="px card teaser"><span class="pill red">Next chapter · coming soon</span><h3>The road to the regional stage</h3>
    <ul><li>Golden Tiger poaches a Bangkok trainer, and Fah won't be the same anymore</li><li>New fighters from the Tha Sao and Korat styles are looking for a camp</li><li>Grandpa Chai's debt still hides a secret Kati hasn't told</li></ul></section>
   <p class="meta center">Seed ${esc(G.seedText||String(G.seed))} · Year ${G.season||1}</p>${!DEMO&&G.ended==="season"&&!gateOpen()?gateHTML():""}<div class="center endbtns">${!DEMO&&G.ended==="season"&&gateOpen()?`<button class="btn primary" data-act="newseason">Continue to Year ${(G.season||1)+1} ▸</button><p class="meta center">The camp, fighters and relationships all carry over · the rivals trained harder too</p>`:""}<button class="btn primary" data-act="replay">Play again</button><button class="btn" data-act="restart">Back to title</button></div></main>`;}

// ---------- FIGHT ----------
function fightFaceoff(b){const me=G.F[b.a],op=G.F[b.b],key=`${b.a}_${b.b}`,h=G.h2h&&G.h2h[op.id],s=G.faceoffStats&&G.faceoffStats[key],last=G.faceoffLast&&G.faceoffLast[key];
  const met=h&&(h.w+h.l+h.d)>0;
  const tally=s&&(s.w+s.l+s.d)>=2?` We've met ${s.w+s.l+s.d} times now: you've won ${s.w}, I've won ${s.l}${s.d?`, with ${s.d} draws`:""}`:"";
  const rival={ploy:"Let's see if you can read me this time",fah:"Come on! I've been waiting for this bout",kati:"I won't back down",mali:"I'll make this a beautiful fight~",rin:"I've studied the way you fight"};
  const opener=last?(last.win==="A"?"You beat me last time. I've trained to counter you":last.win==="B"?"I won last time, but you look different today":"We drew last time. Today there'll be a winner")+tally
    :s?`We've met ${s.w+s.l+s.d} times. You've won ${s.w}, I've won ${s.l}${s.d?`, with ${s.d} draws`:""}. Let's see what happens today`
    :met?"We've met before. Let's see who prepared better this time"
    :rival[op.id];
  const reply=last?(last.win==="A"?"I won last time, but I won't underestimate you":last.win==="B"?"I lost last time. I'm here for a rematch":"Last time settled nothing. Let's finish it today")
    :({kati:"Sirichai Camp is back. I'll give this everything I've got!",mali:"All right~ I'm ready!",rin:"I've got the data in my head. Let's begin",ploy:"I'll give you my answer in the ring",fah:"Good! I like someone who fights back"})[me.id]||"I'm ready. Let's begin";
  return [{n:"nar",t:`${me.name} and ${op.name} meet at center ring before the pi chawa begins`},
    {n:op.id,f:"angry",l:"fight",t:opener},
    {n:me.id,f:"angry",l:"fight",with:op.id,t:reply}];}
function openFight(b,done){const op=G.F[b.b],k=`taunt_${b.a}_${b.b}_${stageOf(G.week)}`;
  if(!op.canon){openFight2(b,done);return;}
  let sc=null;const key=`${b.a}_${b.b}`;
  if(op.canon&&!G.seen[k]&&!(G.faceoffLast&&G.faceoffLast[key])&&!(b.tier==="final"&&(G.seen.ploy_prefinal||G.seen.fah_prefinal))){sc=tauntScene(G,b.a,b.b);if(sc)G.seen[k]=true;}
  playScene(sc||fightFaceoff(b),()=>openFight2(b,done),{bg:TIER_BG[b.tier]?TIER_BG[b.tier].replace(/^bg_|\.webp$/g,""):"local",look:"fight"});}
// Wai khru opens the first bout, canon matchups, and major bouts.
const RAM={phrom:{name:"Four-Faced Brahma",hint:"Bow to all four directions · calm mind, sharper in round one"},hong:{name:"Soaring Swan",hint:"Graceful as a swan · morale +6"},
  phra:{name:"Rama Draws His Bow",hint:"Drawing the bow · aggressive first round"}};
function waiKhruScene(b){const me=G.F[b.a],first=!(G.flags&&G.flags.waiSeen);const away=!!(G.coachAway&&G.week<G.coachAway);
  const own=vary("own_"+me.id,{kati:["Grandpa… I'm dedicating this wai khru to you","Grandpa, watch me. I'll dance every move just like you taught me","I practiced the dance every morning, Grandpa. No mistakes today!"],mali:["Mom, Mali will dance the most beautiful one ever","Is Mom watching live~? Mali will wave at the end of the dance!","Once the dance is done Mali won't be nervous anymore… probably~"],rin:["Wai khru isn't just ritual, it's focus… I'm ready","During the dance I'll observe how my opponent stands… Coach doesn't mind, right?","My pulse drops from 112 to 88 every time I finish the dance. Very interesting"],ploy:["Coach taught me: before you beat others, beat yourself"],fah:["I'll dance so the crowd remembers. Watch!"]}[me.id]||["Let me pay respects first"]);
  return [{n:"nar",t:vary("wai1",["The pi chawa rises in a long shrill note, the khaek drums beat slowly, the ching rings out. Time for the \"wai khru ram muay\"","The pi chawa sounds and the crowd hushes on its own. Time for the wai khru","The khaek drums begin slowly; the whole ring falls quiet as the fighter steps through the ropes","The cymbals ring three times and the wai khru music begins, a cool breeze sweeping the ring"])},
    ...(first&&!away?[{n:"coach",t:"Wai khru honors one's teachers, parents and the sacred. The fighter first walks around the ring to \"seal the ring\", then dances"}]:[]),
    {n:"nar",t:vary("wai2_"+me.id,({kati:[`Kati puts on the mongkhon, ties the prajiad on her arm, and bows three times in the center of the ring`,`Kati circles the ring faster than anyone, long strides making her prajiad snap, then bows three solid times`,`Before bowing, Kati touches Grandpa Chai's prajiad tied on her arm and smiles to herself`],
      mali:[`Mali puts on the mongkhon, smiles at the camera her mom is watching through, and bows slowly three times`,`Mali dances the Chaiya style her mom taught her, hands soft as classical dance; the crowd claps before she even finishes`,`Mali breaks into a huge grin mid-dance, remembers, puts on a serious face… and grins again anyway`],
      rin:[`Rin hands her glasses to Coach Daeng, puts on the mongkhon, and bows three precise times`,`Rin walks the ring counting steps in her head: exactly twelve to every corner`,`Rin dances with her eyes closed, never glancing at the crowd; her focus is so still the ringside goes quiet too`]})[me.id]||[`${me.name} The mongkhon on her head, the prajiad on her arm, she bows three times at center ring`])},
    {n:me.id,f:"happy",l:"fight",t:own},
    {choice:Object.entries(RAM).map(([k,r])=>({t:`She dances the ${r.name} — ${r.hint}`,fx:()=>{b.wai=k;if(k==="hong")me.morale=Math.min(100,me.morale+6);}}))},
    ...(away?[{n:"nar",t:"The dance ends. Coach Daeng is on leave, so you remove the mongkhon from her head yourself"}]:[{n:"nar",t:vary("wai3",["The dance ends. Coach Daeng removes the mongkhon, blows softly on the crown of her head, and pats her shoulder once","Coach Daeng removes the mongkhon and whispers a short blessing in her ear","Coach Daeng offers a sip of water, then slowly lifts the mongkhon off"])},
    {n:"coach",t:vary("wai4_"+me.id,({kati:["Go on. Coach is in this corner the whole time","Hot-headed is fine, but that guard never drops. Remember","Grandpa Chai is watching. Go, kiddo"],mali:["Smile all you want, just not while getting punched","Your legs are your weapons. Don't spend them all in round one","Your mom's watching. Fight as beautifully as you danced"],rin:["The data's in your head already. The rest is heart","Don't overthink it. Trust yourself a little","No glasses, but your coach has sharp eyes right here in the corner"]})[me.id]||["Go on. Coach is in this corner the whole time"])}]),
    {n:me.id,f:"happy",l:"fight",t:({kati:"…Before I go in, say something to me",mali:"Manager~ say something to fire Mali up",rin:"…Anything to tell me before I step in?"})[me.id]||"Say something, please"},
    {choice:cheerLines(me).map(([t,rep,best])=>({t,fx:()=>{me.morale=Math.min(100,me.morale+(best?8:3));b.cheer=best?2:1;},then:[{n:me.id,f:best?"flustered":"happy",l:"fight",t:rep}]}))}];}
const CHEER={kati:[["Grandpa Chai is watching. Make him proud","…Yes! I'll fight so Grandpa hears the cheers all the way up there!",1],["Win and we'll go eat moo kratha","Haha, it's a promise! I'm ordering a lot",0],["Stay calm, follow the plan","Mm… the plan, the plan",0]],
  mali:[["Go show the whole arena that kick!","You got it~ Mali's kicks will be the loudest tonight!",1],["Your mom must be proud","…Thank you. Mali won't cry before a fight",0],["Don't get careless","I know, I know~",0]],
  rin:[["Trust the data you analyzed","…Yes. It's all in my head. Now I just have to do it",1],["Go get 'em, Rin!","Thank you… I'll try",0],["Have fun out there","Fun… I'll try",0]]};
function cheerLines(f){return CHEER[f.id]||[["You can do it!","Yes!",1],["Follow the plan","Understood",0],["Don't get hurt","",0]];}
function openFight2(b,done){UI.fight={b,done,stage:"pre",plan:b.plan||"balanced",tac:{focus:"auto",pace:"steady",target:(b.tac&&b.tac.target)||"body"},F:null,shown:[],pending:[],timer:null,res:null,caption:null};render();}
// v1.46: side-by-side numbers before the bell (opponent hidden until scouted)
function preCompare(me,op,b){const sc=scouted(op.id)||op.camp==="player";const v=verdictOf(adviseCached(me.id,op.id,b.rounds||3).bestRate);
  const rows=[["Punch",a=>a.punch],["Kick",a=>a.kick],["Knee/Elbow",a=>(a.knee+a.elbow)/2],["Guard",a=>(a.guard+a.counter)/2],["Stamina",a=>(a.stamina+a.dur)/2]];
  return `<div class="pcmp"><div class="pcmp-h"><span class="pill dtag ${v.c}">${v.t}</span>${sc?"":`<small class="mutt">Not scouted · opponent stats hidden</small>`}</div>${rows.map(([n,g])=>{const x=g(me.a),y=g(op.a);
    return `<div class="pcr"><b class="num ${sc&&x>y+.4?"goldt":""}">${x.toFixed(1)}</b><i class="pb l" style="--v:${clamp(x/20*100,0,100)}%"></i><span>${n}</span><i class="pb r" style="--v:${sc?clamp(y/20*100,0,100):0}%"></i><b class="num ${sc&&y>x+.4?"redt":""}">${sc?y.toFixed(1):"?"}</b></div>`;}).join("")}</div>`;}
function fightHTML(){const U=UI.fight,b=U.b,me=G.F[b.a],op=G.F[b.b],F=U.F;
  const last=U.shown.filter(x=>x.ha!=null).slice(-1)[0];const sv=(s,k)=>F?(last?last[k]:s):100;
  const side=(f,cls,hp,sta)=>`<div class="fside ${cls}"><div class="fn">${f.canon?`<img class="face sm" src="${faceSrc(f.id,"happy")}" alt="">`:""}<b>${esc(f.name)}</b><span class="meta">Lv.${f.lvl}</span></div>
    <div class="meter"><i style="--v:${clamp(hp,0,100)}%;--bc:${hp>50?"var(--green)":hp>25?"var(--warn)":"var(--red)"}"></i></div><div class="meter thin"><i style="--v:${clamp(sta,0,100)}%;--bc:var(--gold)"></i></div></div>`;
  const hpA=F?sv(F.A.hp,"ha"):100,hpB=F?sv(F.B.hp,"hb"):100,stA=F?sv(F.A.sta,"sa"):100,stB=F?sv(F.B.sta,"sb"):100;
  let mid="";
  if(U.stage==="pre"){const c=condition(me);const P=personaOf(op);
    mid=`<div class="pre px"><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b><span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b><span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
     ${P?`<p class="quote">“${esc(P.line)}”</p>`:""}${h2hText(op)?`<p class="meta goldt center">${h2hText(op)}</p>`:""}${op.id==="ploy"&&(op.aura||0)>=.1?`<p class="meta redt center">👑 Undefeated genius · nobody has beaten her this year. She reads the fight better than anyone</p>`:""}
     <div class="prebox"><div><small>Plan</small><b>${PLANS[U.plan].name}</b></div><div><small>Target</small><b>${TGT[U.tac.target]}</b></div><div><small>Readiness</small><b class="num">${c}</b></div></div>
     ${me.fatigue>25?`<p class="meta center warnt">Fatigue ${Math.round(me.fatigue)} · entering the ring at ${Math.round(clamp(100-me.fatigue*.4,40,100))}% energy and tiring faster than usual</p>`:""}
     ${preCompare(me,op,b)}
     <p class="meta center">${me.prepBonus?"Plan drilled · ":""}${me.injury?"Injured! · ":""}Change the plan in the Train tab before fight day</p>
     <div class="ctrl">${me.injury?`<button class="btn" data-act="withdraw">Withdraw</button>`:""}<button class="btn primary big" data-act="fstart">Fight! ▸</button></div></div>`;}
  else{const cap=U.caption;
    mid=`<div class="stagewrap px"><canvas id="fstage" width="960" height="540" aria-label="Muay Thai ring"></canvas>
      <div class="rnd">${F.round?`Round ${F.round}/${F.rounds}`:""}</div><div class="cards">${U.stage!=="done"?"":F.cards.map((c,i)=>`<span class="num">R${i+1} ${c[0]}–${c[1]}</span>`).join("")}</div>
      ${U.stage==="done"&&U.bubble?`<div class="obub ${U.F.result.win==="B"?"taunt":"sulk"}" role="note"><b>${esc(U.F.B.name)}</b>${esc(U.bubble)}</div>`:""}
      ${U.stage==="corner"?"":`<div class="caption ov ${cap?cap.side:""} ${cap&&cap.heat?"heat"+cap.heat:""}" aria-live="polite">${cap?esc(cap.text):"…"}</div>`}</div>
     ${U.cutin?(U.cutin.skill?`<div class="cutin sk ${U.cutin.kind} ${U.cutin.side}" aria-live="assertive"><div class="cut-band"><img src="${ASSET}${U.cutin.id}_fight_angry.webp" alt=""></div><b>${esc(U.cutin.skill)}</b><span>${esc(U.cutin.name)} · ${U.cutin.kind==="atk"?`${WNAME[U.cutin.w]}: sharper and harder for a while`:U.cutin.kind==="def"?"Better evasion and counters for a while":"Energy recovered"}</span></div>`:`<div class="cutin ${U.cutin.side}" aria-live="assertive"><div class="cut-band"><img src="${ASSET}${U.cutin.id}_fight_angry.webp" alt=""></div><b>Blood-boil mode!</b><span>${esc(U.cutin.name)} changes eyes · stronger counters, easier criticals</span></div>`):""}
     ${U.stage==="corner"?"":liveStats()}`;
    // v1.21: one compact row — speed, then the 3 carried skills
    if(U.stage==="playing")mid+=`<div class="fctl2"><div class="seg sm">${[["1","x1"],["2","x2"]].map(([v,t])=>`<button data-act="fspeed" data-v="${v}" aria-pressed="${String(UI.speed)===v}" aria-label="Speed ${t}">${t}</button>`).join("")}</div>${skillBarHTML()}</div>`;
    if(U.stage==="corner")mid+=cornerHTML(F);
    if(U.stage==="done")mid+=resultHTML();
    mid+=`<details class="logd" ${UI.logOpen?"open":""} ontoggle="UI.logOpen=this.open"><summary>Full fight log</summary><div class="flog">${U.shown.map(l=>l.rd?`<div class="rd">${l.rd}</div>`:`<div class="${l.s}">${esc(l.t||"")}</div>`).join("")}</div></details>`;}
  const tw=UI.confirmTowel?`<div class="tconfirm" role="alertdialog"><div class="px"><h3>🏳️ Throw in the towel?</h3><p>This fight counts as a loss immediately, but your fighter won't get hurt any worse</p><div class="ctrl"><button class="btn" data-act="towelno">Keep fighting</button><button class="btn primary" data-act="towelyes">Surrender</button></div></div></div>`:"";
  return `${tw}${fpopHTML()}<div class="fight pxscroll ${U.stage==="corner"?"incorner":U.stage==="done"?"isdone":""}" data-sk="fight" role="dialog" aria-label="Fight"><div class="fight-in"><div class="fhead">${side(me,"a",hpA,stA)}<div class="vsmid"><b>${TIER[b.tier].name}</b>${U.F&&U.F.round&&U.stage==="playing"?(()=>{const s=Math.max(0,Math.round(180*(1-Math.min(U.F.ex||0,EX_PER_ROUND)/EX_PER_ROUND)));return `<span class="meta">Rd ${U.F.round}/${b.rounds}</span><span class="rclock num">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span><i class="rcbar" style="--v:${Math.round(s/1.8)}%"></i>`;})():`<span class="meta">${b.rounds} rds</span>`}</div>${side(op,"b",hpB,stB)}</div>${mid}</div></div>`;}
function liveStats(){const U=UI.fight,F=U.F;if(!F)return "";let la=0,lb=0;
  for(const e of U.shown){if(!e.ev)continue;const sd=sideOf(e,F);if(e.ev==="hit"||e.ev==="counter"){if(sd==="A")la++;else lb++;}}
  const ctl=la+lb?Math.round(la/(la+lb)*100):50;
  return `<div class="live px"><span>Landed <b class="num">${la}</b> – <b class="num">${lb}</b></span><span class="ctlbar" style="--v:${ctl}%"><i></i></span><span>Control <b class="num">${ctl}%</b></span><span>Opp. legs ${F.B.legs>25?"Very heavy":F.B.legs>12?"Getting heavy":"Normal"}</span></div>`;}
// v1.10 corner: tiny care puzzle + pick an order, then confirm
function cornerHTML(F){const U=UI.fight,C=U.care,A=F.A,B=F.B,c=F.cards[F.cards.length-1]||[10,10];const rec=aiCorner(F,A,B);
  const note=B.sta<40?"Opponent is fading":A.sta<40?"We're low on energy":A.rlanded<B.rlanded-2?"We took a lot this round":B.legs>20?"Opponent's legs getting heavy":A.rage?"Still in blood-boil!":"";
  const slots=C.need.map((k,i)=>{const g=C.got[i];return `<span class="cslot ${g==null?"":g===k?"ok":"bad"}">${PIX[k]}</span>`;}).join('<i class="arr">›</i>');
  return `<div class="corner px"><div class="chead"><b>Break · round ${F.round}</b><button class="chip cardbtn" data-act="cshow" aria-pressed="${!!U.cshow}">${U.cshow?F.cards.map((c,i)=>`R${i+1} ${c[0]}–${c[1]}`).join(" · "):"See previous round scores ▸"}</button><span class="chip">Landed ${A.rlanded}–${B.rlanded}</span>${note?`<span class="chip warn">${note}</span>`:""}</div>
   <div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>${C.done?(C.q>=1?"Fully refreshed!":C.q>0?"A little better":"Not much better"):"Do it in this order"}</span><div class="cslots">${slots}</div></div>
    <div class="carebtns">${Object.entries(CARE).map(([k,v])=>{const o=C.got.indexOf(k);return `<button data-act="care" data-v="${k}" ${C.done||o>=0?"disabled":""} class="${o>=0?"picked":""}">${o>=0?`<i class="ord">${o+1}</i>`:""}${PIX[k]}<small>${v.name}</small></button>`;}).join("")}</div></div>
   <div class="ohead"><b>Orders for next round</b>${coachOn()?`<button class="btn sm" data-act="chint">Coach's tip</button>`:""}</div>
   <div class="opts">${Object.entries(CORNER).map(([k,o])=>`<button data-act="cpick" data-v="${k}" aria-pressed="${U.pick===k}">${o.name}</button>`).join("")}</div>
   <div class="cfoot"><button class="towel" data-act="towel" aria-label="Throw in the towel">${PIX.flag}<span>Towel</span></button><button class="btn primary" data-act="cgo" ${U.pick?"":"disabled"}>Start round ${F.round+1} ▸</button></div>
</div>`;}
// v1.13: the coach reads the actual fight (cards, stamina, what landed) before giving a hint
// v1.21: only suggest what can actually be learned now, favour the carried 3, flag fresh unlocks, and vary the pick
function skillTip(f){if(hasTree(f.id)){const L=SKILLS[f.id],eq=equipped(f);const ok=L.filter(k=>!skillBlock(f,k.id).length);
    if(ok.length){const pick=ok.slice().sort((a,b)=>(eq.includes(b.id)?2:0)+b.row-((eq.includes(a.id)?2:0)+a.row))[0];return `You can raise "${pick.name}" now (rank ${(f.skills[pick.id]||0)+1}/3)`;}
    let best=null;for(const k of L){const B=skillBlock(f,k.id).filter(b=>b.t!=="sp");if(B.length!==1||B[0].t!=="stat")continue;const gap=B[0].v-B[0].have;if(!best||gap<best.gap)best={k,gap,st:B[0].k};}
    return best?`Train ${SK_AN[best.st]}${fmtA(Math.ceil(best.gap*10)/10)} more to raise "${best.k.name}"`:"The next moves need higher stats. Tap a move to see its requirements";}
  const all=SKILLS[f.id]||[],eq=equipped(f);const ok=all.filter(k=>(k.lv||1)<=f.lvl&&(f.skills[k.id]||0)<3);
  const nxt=all.filter(k=>(k.lv||1)>f.lvl).sort((a,b)=>a.lv-b.lv)[0];const tail=nxt?` · Lv.${nxt.lv} will unlock "${nxt.name}"`:"";
  if(!ok.length)return nxt?`All upgradable moves are maxed. Save your points ${tail.slice(3)}`:"All skills maxed";
  const fresh=ok.find(k=>(k.lv||1)===f.lvl&&!(f.skills[k.id]>0));if(fresh)return `Just unlocked "${fresh.name}". Try upgrading and equipping it ${tail}`;
  const top=[["punch","Punch"],["kick","Kick"],["knee","Knee"],["elbow","Elbow"]].sort((a,b)=>f.a[b[0]]-f.a[a[0]])[0];
  const sc=k=>(eq.includes(k.id)?3:0)+(k.desc.includes(top[1])?2:0)-(f.skills[k.id]||0)*1.2+((f.lvl+k.id.length)%3)*.3;
  const pick=ok.slice().sort((a,b)=>sc(b)-sc(a))[0];const why=eq.includes(pick.id)?"is a move she's carrying into the ring":pick.desc.includes(top[1])?`${f.name} favors ${top[1]}`:"fills a gap";
  return `${why} Try upgrading "${pick.name}" (level ${(f.skills[pick.id]||0)+1}/3)${tail}`;}
function popToast(t,kind){const el=document.createElement("div");el.className="gtoast "+(kind||"");el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),1800);}
// v1.15: the coach rates every order for this moment (green/gold/red) with a reason; several can be green
function cornerRate(F){const A=F.A,B=F.B,fa=A.f.a,fb=B.f.a,left=F.rounds-F.round;const diff=F.cards.reduce((x,c)=>x+c[0]-c[1],0);
  const kickH=(B.wl.kick||0)>=(B.wl.knee||0)+(B.wl.elbow||0)&&(B.wl.kick||0)>=2,inH=(B.wl.knee||0)+(B.wl.elbow||0)>(B.wl.kick||0)+1;
  const tired=A.sta<38,fresh=A.sta>=55,oppT=B.sta<42,ahead=diff>0,behind=diff<0,last=left<=1;const R={};
  R.push=tired?["r","Not enough energy to attack"]:inH&&fb.clinch>=fa.clinch?["y","Could chase points, but walks into her knees and elbows"]:behind&&fresh?["g","Need to chase points, and still have energy"]:oppT&&fresh?["g","Opponent is out of gas, time to press"]:ahead&&last?["r","Ahead; attacking risks counters"]:["y","More points, but costs energy"];
  R.counter=B.landed>A.landed+2?["g","Opponent is attacking a lot, can wait and counter"]:behind&&last?["r","Final round, waiting alone won't be enough"]:tired?["y","Saves energy, but points come slowly"]:["y","Safe, but fewer strikes"];
  R.range=inH&&fa.kick>=fb.clinch-1?["g","Opponent likes the inside, stand off and kick"]:kickH&&fb.kick>fa.kick?["r","She kicks better, standing off is a disadvantage"]:["y","Works if our kicks are better"];
  R.clinch=kickH&&(fa.knee+fa.clinch)/2>=fb.kick-1?["g","She controls range with kicks, close in and smother them"]:fb.clinch>fa.clinch+2?["r","Her clinch is stronger than ours"]:["y","Works if our knees are good"];
  R.defend=tired?["g","Recover energy first, then push next round"]:ahead&&last?["g","Ahead in the last round, close it out"]:behind?["r","Behind, defending alone will surely lose"]:["y","Safe, but no more points"];
  R.none=behind&&last?["r","Behind, the current plan may not be enough"]:!behind&&!tired?["g","The current plan is still working"]:["y","Change nothing"];
  return R;}
// v1.32: the coach also guesses a win chance per order; how close the guess is depends on his training level
const ODDS_ERR=[0,15,10,6],ODDS_W=[0,30,20,12];
function cornerPct(F){const U=UI.fight;U.odds=U.odds||{};if(!U.odds[F.round]){const o=typeof cornerOdds==="function"?cornerOdds(F):null;if(!o)return null;
    const err=ODDS_ERR[G.fac.daeng||1]||14,r=mulberry32((F.seed||1)+F.round*101);U.odds[F.round]=Object.fromEntries(Object.entries(o).map(([k,v])=>[k,clamp(Math.round(v*100+(r()*2-1)*err),1,99)]));}
  return U.odds[F.round];}
function pctRange(c){const w=ODDS_W[G.fac.daeng||1]||30,r5=v=>Math.round(v/5)*5,lo=clamp(r5(c-w/2),5,95),hi=clamp(r5(c+w/2),5,95);return lo>=85?"85%+":hi<=15?"<15%":`${lo}-${hi}%`;}
function cornerThinkHTML(F){const A=F.A,B=F.B;const diff=F.cards.reduce((x,c)=>x+c[0]-c[1],0),left=F.rounds-F.round;const R=cornerRate(F);const P=cornerPct(F),err=ODDS_ERR[G.fac.daeng||1]||14;
  const first=!(G.flags&&G.flags.pctSeen);if(first){G.flags=G.flags||{};G.flags.pctSeen=true;}
  const read=diff>1?"Coach thinks we're ahead":diff<-1?"Coach thinks we're behind":"Coach thinks it's even";
  const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};const top=o=>{const e=Object.entries(o).sort((x,y)=>y[1]-x[1])[0];return e&&e[1]?e:null;};const bt=top(B.wl),at=top(A.wl);const T=[];
  T.push(diff>1?`Listen, we scored well last round. ${left<=1?"One round left, think carefully whether the risk is worth it":"But don't relax yet"}`:diff<-1?`Deep breath… we're behind right now. ${left<=1?"Final round. If nothing changes, it ends like this":`Still ${left} rounds left, still time to turn it around`}`:"Still even, the judges aren't leaning either way");
  if(bt)T.push(`She's scoring most with ${W[bt[0]]}, ${bt[1]} times already ${bt[0]==="kick"?". If we let her keep kicking from range, we're in trouble":bt[0]==="knee"||bt[0]==="elbow"?". She likes to get inside":""}`);
  T.push(A.sta<40?`You're under half energy, ${Math.round(A.sta)}%. Coach can see the guard dropping`:B.sta<45?`Look at her, she's gasping, about ${Math.round(B.sta)}% energy left, but we still have ${Math.round(A.sta)}%`:at?`${W[at[0]]} is landing well for you, ${at[1]} times`:"Nothing is landing cleanly yet");
  return `<div class="fpop" role="dialog" aria-label="Coach's tip"><div class="fpop-in px"><div class="fp-h"><img src="${faceSrc("coach")}" alt=""><div><b>Coach Daeng</b><div class="meta">${read} · ${left} rounds left · energy ${Math.round(A.sta)}% / ${Math.round(B.sta)}%</div></div></div>
   <div class="ctalk">${T.map(t=>`<p>“${t}”</p>`).join("")}</div>
   ${first?`<p class="pctintro">The coach estimates how likely we are to win with each order. It's only a guess from experience; send him to training and he'll guess better.</p>`:""}
   <div class="rate">${Object.entries(CORNER).map(([k,o])=>`<div class="rt ${R[k][0]}"><i></i><b>${o.name}</b>${P?`<span class="pct num">${pctRange(P[k])}</span>`:""}<small>${R[k][1]}</small></div>`).join("")}</div>
   <p class="meta">Green = good now · Yellow = okay · Red = not advised ${P?` · % = coach's guessed win range ${(G.fac.daeng||1)<3?" · send the coach to training to narrow the range":""}`:""}</p>
   <button class="btn primary" data-act="chint">Got it</button></div></div>`;}
function roundReport(F){const A=F.A,B=F.B,c=F.cards[F.cards.length-1]||[10,10];const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};
  const top=s=>{const e=Object.entries(s.rw||{}).sort((a,b)=>b[1]-a[1])[0];return e&&e[1]?`${W[e[0]]} ${e[1]} times`:"None";};
  const notes=[];if(B.legs>20)notes.push("The opponent's legs are getting heavy, she's moving slower");if(B.sta<40)notes.push(`Opponent's energy is about ${Math.round(B.sta)}%`);if(A.sta<40)notes.push(`Our energy is about ${Math.round(A.sta)}%, careful in the late rounds`);
  if(A.rlanded<B.rlanded-2)notes.push("We clearly took more this round");if(A.rage)notes.push("Still in blood-boil mode!");
  return `<div class="rreport"><div><b>This round</b> ${c[0]}–${c[1]}</div><div>We landed <b>${A.rlanded}/${A.rthrown}</b> · most effective: ${top(A)}</div><div>Took <b>${B.rlanded}</b> · her best weapon: ${top(B)}</div>${notes.map(n=>`<div class="note">• ${n}</div>`).join("")}</div>`;}
function cornerAdvice(F){const A=F.A,B=F.B;const lead=F.cards.reduce((s,c)=>s+c[0]-c[1],0);
  if(A.sta<35)return "Low energy. Use 'Defend, protect the lead' to recover first";
  if(lead>=2)return "Ahead. Don't get careless, bank the points safely";
  if(lead<=-2)return "Behind now. Push the pressure!";
  if(B.wl.kick>B.wl.knee+2)return "She's landing a lot of kicks. Clinch to close the distance";
  if(B.wl.knee+B.wl.elbow>B.wl.kick+3)return "She's good inside. Keep range, use kicks";
  return "Even. Stick to the plan, or wait to counter";}
// v1.12: one line that tells the player WHY the fight went the way it did
function fightInsight(F,U){const A=F.A,B=F.B,win=F.result.win==="A",W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};const out=[];
  const best=Object.entries(A.wl).sort((x,y)=>y[1]-x[1])[0];const tg=A.tac&&A.tac.target;
  if(tg==="legs"&&B.legs>18)out.push(["+",`Leg kicks are working, her legs are heavy and slow`]);
  else if(tg==="body"&&B.sta<45)out.push(["+",`Body work is paying off, she's tiring fast`]);
  else if(tg==="head"&&A.landed>B.landed)out.push(["+",`Head shots are landing, she's under pressure`]);
  else if(tg)out.push(["−",`The target "${TGT[tg]}" isn't working well against this opponent`]);
  if(best&&best[1]>=3)out.push(["+",`Most effective weapon: ${W[best[0]]} ${best[1]} times`]);
  if(A.counterPrep)out.push(["+","Counter-trained for this opponent, an edge from round one"]);
  if(U.careOK)out.push(["+",`Good corner work ${U.careOK} times, energy came back well`]);
  if(A.rageUsed)out.push(["+","Blood-boil mode turned the fight"]);
  if(A.sta<25)out.push(["−","Ran out of energy before the end. Try a more economical pace"]);
  if(B.landed>A.landed+4)out.push(["−","Clearly took more. Try waiting to counter or controlling range"]);
  if(!win&&!scouted(B.f.id)&&B.f.camp!=="quest")out.push(["−","Went in without knowing her game. Next time scout and counter-train"]);
  if(!win&&B.f.a&&A.f.a&&ovr(B.f)>ovr(A.f)+3)out.push(["−","The opponent's stats are quite a bit higher. Train a bit more before facing this level"]);
  const pick=win?out.filter(x=>x[0]==="+").concat(out.filter(x=>x[0]==="−")):out.filter(x=>x[0]==="−").concat(out.filter(x=>x[0]==="+"));
  return pick.slice(0,2).map(([k,t])=>`<li class="${k==="+"?"pos":"neg"}">${k==="+"?"▲":"▼"} ${t}</li>`).join("");}
function resultHTML(){const U=UI.fight,F=U.F,r=F.result;const win=r.win==="A",draw=r.win==="D";const me=G.F[U.b.a];
  const acc=s=>s.thrown?Math.round(s.landed/s.thrown*100)+"%":"—";
  return `<div class="result px"><div class="big ${win?"win":draw?"":"lose"}">${win?"Win!":draw?"Draw":"Loss"}</div>
   <div>${esc(r.type)}${r.score?` · ${r.score}`:""} · R${r.round}</div>${U.res?`<div class="meta">${U.res.pay||!TIER[U.b.tier].off?`Purse to the camp ${fmt(U.res.pay)}`:"Off the record · any reward arrives by mail"} · EXP gained</div>`:""}
   <ul class="insight">${fightInsight(F,U)}</ul>
   <div class="statgrid"><b class="r num">${F.A.landed}/${F.A.thrown}</b><span class="c">Landed</span><b class="num">${F.B.landed}/${F.B.thrown}</b>
     <b class="r num">${acc(F.A)}</b><span class="c">Accuracy</span><b class="num">${acc(F.B)}</b><b class="r num">${F.A.kd}</b><span class="c">Counted</span><b class="num">${F.B.kd}</b></div>
   ${coachOn()?`<div class="ctip"><img src="${faceSrc("coach")}" alt=""><span><b>Coach Daeng:</b> ${coachNote(F,me)}</span></div>`:""}
   ${G.F.rin.camp==="player"&&me.id!=="rin"?`<div class="ctip"><img src="${faceSrc("rin","happy")}" alt=""><span><b>Rin:</b> ${rinNote(F)}</span></div>`:""}
   <div class="ctrl">${r.win==="B"&&G.losses&&G.losses.length?`<button class="btn" data-act="frev">Review the loss</button>`:""}<button class="btn primary" data-act="fdone">Continue ▸</button></div>
</div>`;}
function fpopHTML(){const U=UI.fight;if(!U||!U.F)return "";if(U.stage==="corner"&&U.hint)return cornerThinkHTML(U.F);
  if(U.stage==="done"&&U.rev&&G.losses)return `<div class="fpop"><div class="fpop-in px">${lossBody(G.losses[G.losses.length-1])}<button class="btn primary" data-act="frev">Close</button></div></div>`;return "";}
// v1.14 loss review: Kru Daeng on the mindset/training, Rin on the numbers
function lossBody(L){const me=G.F[L.a],op=G.F[L.b];if(!me||!op)return "";const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0];
  const bt=top(L.B.wl),at=top(L.A.wl);const cp=counterPreset(op);const fix=PRESETS[cp].name;
  const ring={punch:"In the ring, keep the guard high and wait to counter. Don't trade punches with her",kick:"In the ring, close the distance. Don't stand in her kicking range",knee:"In the ring, don't charge into her inside game. Use kicks to control range",elbow:"In the ring, don't charge into her inside game. Use kicks to control range"}[bt[0]];
  const kru=L.od>4?`${op.name} is clearly better than us. No shame losing like this. Raise the overall a bit before taking this level`
    :L.A.sta<30?`Ran out of gas before the end. Add conditioning, and when ahead, order banking points`
    :!L.sc&&op.camp!=="quest"?`We went in knowing nothing about her. Next time scout first, then counter-train`
    :`She won with ${W[bt[0]]} ${ring}. Before you meet again, train "${fix}" for 1–2 weeks to counter it`;
  const rin=G.F.rin.camp==="player"?`The round we lost worst was round ${L.cards.reduce((m,c,i,a)=>c[1]-c[0]>a[m][1]-a[m][0]?i:m,0)+1} · we landed ${L.A.landed}/${L.A.thrown} she landed ${L.B.landed}/${L.B.thrown} · ${W[bt[0]]} landed for her ${bt[1]} times ${at&&at[1]?` times, while our ${W[at[0]]} worked best (${at[1]})`:""}`:null;
  return `<h3>Review: ${esc(me.name)} vs ${esc(op.name)}</h3><div class="meta">Wk ${L.wk} · lost ${esc(L.type)} round ${L.round} · round scores ${L.cards.map(c=>`${c[0]}-${c[1]}`).join(" / ")}</div>
   <div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>Coach Daeng:</b> ${kru}</span></div>
   ${rin?`<div class="ctip big"><img src="${faceSrc("rin","happy")}" alt=""><span><b>Rin:</b> ${rin}</span></div>`:`<p class="meta dim">Hire Rin for detailed numerical analysis</p>`}`;}
function lossRevHTML(){const L=(G.losses||[]).slice().reverse();const i=clamp(UI.revIdx||0,0,Math.max(0,L.length-1));
  return `<h2>Review the loss</h2>${L.length>1?`<div class="seg sm wrap">${L.map((x,k)=>`<button data-act="revpick" data-v="${k}" aria-pressed="${k===i}">Wk ${x.wk} ${esc((G.F[x.a]||{}).name||"")}</button>`).join("")}</div>`:""}${L.length?lossBody(L[i])+lossTapeBtn(L[i]):"<p class=\"lead\">No losses yet</p>"}`;}
// v1.34: watch the lost fight with the team: EXP, and she reads that opponent a little better next time
function lossTapeBtn(L){const op=G.F[L.b],me=G.F[L.a];if(!op||!me||op.camp==="quest")return "";const k=G.losses.indexOf(L);
  return L.watched?`<p class="meta goldt center">✓ Watched with the team · ${esc(me.name)} reads ${esc(op.name)} better</p>`:`<button class="btn gold tapebtn" data-act="losstape" data-v="${k}">Watch this fight with the team · EXP +25 · learn the opponent</button>`;}
const TAPE_LINE={kati:"I see it now… I rushed back then. Next round I won't make that mistake again",mali:"Ah, Mali sees it! She shifts her shoulder before every strike. Next time Mali will catch it!",rin:"Recorded. The pattern repeated three times. Next time I'll use it against her"};
function coachNote(F,me){const A=F.A,B=F.B,r=F.result,w=r.win==="A";
  if(w&&/KO|TKO/.test(r.type))return `Beautiful, ${me.name}! But your body took a lot of punishment. Rest next week`;
  if(w&&B.kd>0)return "Controlled the whole fight. Coach is proud";
  if(w)return "A win, but there's still work to do. Check the accuracy and pick the next program";
  if(A.sta<30)return "Ran out of energy late. Add conditioning, or order banking points when ahead";
  if(B.wl.kick>=A.wl.kick+3)return "Got kicked from range all fight. Train knee-clinch to get inside";
  if(B.wl.knee+B.wl.elbow>A.wl.knee+A.wl.elbow+3)return "Lost the inside game. Train kicks to keep range, or strengthen the clinch";
  if(B.landed>A.landed*1.3)return "The guard is still open too often. Try the defense-counter program";
  return "A loss isn't the end. Coach still believes in you. Adjust the plan and come back";}
function rinNote(F){const A=F.A;const best=Object.entries(A.wl).sort((a,b)=>b[1]-a[1])[0];return `Landed ${A.landed}/${A.thrown} times, most effective weapon: ${WNAME[best[0]]} (${best[1]} times)`;}
let LASTF=null; /* v1.80: the last fight, read by the gauntlet to carry HP between bouts */
function fightStart(quick){const U=UI.fight,b=U.b;AU.resume();
  U.F=newFight(G.F[b.a],G.F[b.b],{seed:(G.seed+G.week*131+b.b.length*7)>>>0,rounds:b.rounds,tier:b.tier,planA:U.plan,forceRage:!quick&&!(G.flags&&G.flags.rageShown)});U.F.dai=(DIFF[G.diff||"normal"]||DIFF.normal).ai;
  if(b.wai==="phrom")U.F.A.careMor=.02;if(b.wai==="phra")U.F.A.careMor=.01;if(b.cheer)U.F.A.mor+=b.cheer*.01;U.F.A.mor+=trustBonus(G.F[b.a]);{const fam=(G.fam||{})[b.b]||0;if(fam)U.F.A.mor+=fam*.015;}setTactics(U.F,U.tac);if(b.carry){U.F.A.hp=Math.min(U.F.A.hp,b.carry.hp);U.F.A.sta=Math.min(U.F.A.sta,b.carry.sta);}LASTF=U.F;
  if(quick){FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);const F=U.F;while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);const lg=fightRound(F);U.shown.push({rd:`Round ${F.round}`},...lg);}fightEnd();return;}
  FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);AU.setTempo(126);AU.startMusic();playRound();}
function playRound(){const U=UI.fight,F=U.F;AU.setTempo(126+F.round*10);F.B.instr=aiCorner(F,F.B,F.A);F.A.autoSkill=false;roundBegin(F);
  const rng=mulberry32(F.seed+F.round);U.rng=rng;U.tiredShown=false;
  F.tier=F.tier||U.b.tier;const sl=startLine(F,rng);U.pending=[{rd:`Round ${F.round}`,cap:{text:sl.text,side:"",heat:sl.heat},bell:true}];
  U.stage="playing";AU.setTempo(126+F.round*8);render();tick();}
// v1.19: pull the next exchange only when the last one has been shown, so a skill pressed now shapes what follows
function feedRound(){const U=UI.fight,F=U.F;
  while(!U.pending.length&&!roundDone(F)){U.pending.push(...fightEx(F));
    if(!U.tiredShown&&F.ex>=8){for(const s of [F.A,F.B])if(s.sta<30){U.pending.push({tired:true,cap:{text:COM.tired[Math.floor(U.rng()*2)].replace("{x}",s.name),side:""}});U.tiredShown=true;}}}
  return U.pending.length>0;}
function fskill(id){const U=UI.fight;if(!U||U.stage!=="playing")return;const e=useSkill(U.F,U.F.A,id);if(!e)return;U.pending.unshift(e);clearTimeout(U.timer);tick();}
function skillBarHTML(){const U=UI.fight,F=U.F;const L=fightSkills(F.A);const used=F.A.skUsed||{};if(!L.length)return `<span class="meta skhint">No skills yet · level up, then upgrade skills in the fighter info</span>`;const slots=[0,1,2].map(i=>L[i]);
  return `<div class="skbar2" role="group" aria-label="Skills ${F.A.skRound?" (used this round)":""}">${slots.map(k=>k?`<button class="skbtn2 ${k.k}" data-act="fskill" data-v="${k.id}" ${used[k.id]||F.A.skRound||F.over?"disabled":""} title="${esc(k.name)} · ${esc(SKILL_KIND_NAME[k.k])}">${PIX["sk_"+k.k]}<b>${esc(k.name)}</b></button>`:`<span class="skbtn2 empty">Empty</span>`).join("")}</div>`;}function sideOf(e,F){if(e.s==="A"||e.s==="B")return e.s;if(e.mside)return e.mside;return e.an===F.A.name?"A":"B";}
function tick(){const U=UI.fight;if(!U||U.stage!=="playing")return;
  if(!U.pending.length&&!feedRound()){roundFinish(U.F);roundEnd();return;}
  const e=U.pending.shift();U.shown.push(e);const F=U.F;const now=performance.now();let wait=1500;
  if(e.bell){AU.sfx("bell");U.caption=e.cap;}
  else if(e.tired){U.caption=e.cap;wait=1300;}
  else if(e.ev){const sd=sideOf(e,F);FS.play({...e,side:sd},now);U.caption={text:comLine(e,F,U.rng),side:e.ev==="miss"?"":sd,heat:fightHeat(F)};
    if(e.ev==="hit"||e.ev==="counter"){AU.sfx(e.w||"punch");if(e.crit)AU.cheer(.8);}
    if(e.ev==="miss"){AU.sfx("miss");wait=1150;}
    if(e.ev==="kd"){AU.sfx("kd");wait=2300;}
    if(e.ev==="ko"){AU.sfx("kd");AU.cheer(1);wait=2600;}
    if(e.ev==="cut")wait=1700;
    if(e.ev==="wake"){AU.sfx("kd");AU.cheer(.9);wait=2200;}
    if(e.ev==="skill"){U.cutin={id:e.rid,name:e.an,side:sd,t:now,skill:e.skn,kind:e.skk,w:e.w};AU.sfx(e.skk==="rec"?"level":"kd");AU.cheer(.7);wait=2000;setTimeout(()=>{if(UI.fight&&UI.fight.cutin&&UI.fight.cutin.t===now){UI.fight.cutin=null;render();}},1900);}
    if(e.ev==="rage"){if(sd==="A"){G.flags=G.flags||{};G.flags.rageShown=true;}U.cutin={id:e.rid,name:e.an,side:sd,t:now};AU.sfx("kd");AU.cheer(1);wait=2200;setTimeout(()=>{if(UI.fight&&UI.fight.cutin&&UI.fight.cutin.t===now){UI.fight.cutin=null;render();}},2000);}}
  render();U.timer=setTimeout(tick,(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?400:wait)/(UI.speed===2?2:1));}
function fskip(){const U=UI.fight;clearTimeout(U.timer);while(!roundDone(U.F))U.pending.push(...fightEx(U.F));const rest=U.pending.filter(x=>!x.bell&&!x.tired);U.shown.push(...rest);U.pending=[];
  const ko=rest.find(x=>x.ev==="ko");if(ko)FS.play({...ko,side:sideOf(ko,U.F)},performance.now());roundFinish(U.F);roundEnd();}
function roundEnd(){const U=UI.fight;clearTimeout(U.timer);const F=U.F;
  if(F.over){fightEnd();return;}AU.sfx("bell1");U.caption={text:COM.end[Math.floor(Math.random()*2)],side:""};U.stage="corner";U.care={need:careNeeds(F),got:[],done:false};U.pick=null;U.hint=false;render();}
function fightEnd(){const U=UI.fight;U.stage="done";{const w=U.F.result.win;U.bubble=postBubble(U.F.B.f,w==="A"?"lose":w==="B"?"win":"draw",(U.F.seed>>>3)+G.week+[...U.F.B.f.id].reduce((a,c)=>a*31+c.charCodeAt(0)|0,0)+(G.cal||[]).length*7);}AU.startMusic("hub");setTimeout(()=>AU.sfx(U.F.result.win==="A"?"win":U.F.result.win==="B"?"lose":"bell1"),200);
  const me=G.F[U.b.a];if(me.injury)me.trust=clamp(me.trust-12,0,100);
  U.res=applyResult(G,U.F,U.b);if(U.b.dm)U.b.result=dmWinFrom(U.F);me.prepBonus=false;if(U.b.tier==="final"||U.b.tier==="semi")finishBracket(G,U.b,U.F);
  const r=U.F.result;if(FS.A){if(r.win==="A"){FS.A.win=true;FS.A.anim="win";}else if(r.win==="B"){FS.B.win=true;FS.B.anim="win";}}
  AU.cheer(r.win==="A"?1:.4);
  U.caption={text:r.win==="A"?`${me.name} wins! ${r.type}`:r.win==="D"?"A draw":`${G.F[U.b.b].name} wins · ${r.type}`,side:r.win==="A"?"A":"B"};
  G.log.push(`${me.name} ${r.win==="A"?"Win":r.win==="B"?"Loss":"Draw"} ${G.F[U.b.b].name} (${r.type})`);
  if(G.F[U.b.b].canon){G.faceoffLast=G.faceoffLast||{};G.faceoffLast[`${U.b.a}_${U.b.b}`]={win:r.win,week:G.week};
    G.faceoffStats=G.faceoffStats||{};const key=`${U.b.a}_${U.b.b}`,s=G.faceoffStats[key]=G.faceoffStats[key]||{w:0,l:0,d:0};s[r.win==="A"?"w":r.win==="B"?"l":"d"]++;}
  {const op=G.F[U.b.b];if(r.win!=="D"&&!TIER[U.b.tier].off&&(op.canon||U.b.tier==="semi"||U.b.tier==="final"||/KO/.test(r.type)))G.lastBig={a:me.id,b:op.id,win:r.win,wk:G.week,shown:false};}
  if(r.win==="B"){const F=U.F,st=s=>({landed:s.landed,thrown:s.thrown,wl:{...s.wl},sta:Math.round(s.sta),kd:s.kd,legs:Math.round(s.legs)});
    G.losses=(G.losses||[]).concat([{wk:G.week,a:me.id,b:U.b.b,type:r.type,round:r.round,cards:F.cards.map(c=>[...c]),A:st(F.A),B:st(F.B),sc:scouted(U.b.b),od:Math.round(ovr(G.F[U.b.b])-ovr(me)),plan:U.plan||"balanced",tg:(F.A.tac&&F.A.tac.target)||"",care:U.careOK||0}]).slice(-6);}
  save();render();}

// ---------- actions ----------
function giftScene(id,res){const f=G.F[id];const mood=res.t==="dislike"?"pout":res.t==="love"?"flustered":"happy";
  playScene([{n:id,f:mood,l:"casual",t:(res.n&&res.t!=="dislike"&&giftAgainLine(id,res.t,res.n,res.g))||(GIFT_TALK_PERSONAL[id]&&GIFT_TALK_PERSONAL[id][res.g])||((GIFT_TALK[id]&&GIFT_TALK[id][res.g])||GIFT_LINES[id][res.t])},{n:"nar",t:res.gain>0?(res.n>=2?`Bond with ${f.name} +${res.gain} · a bit too often, so it rises less`:`Bond with ${f.name} +${res.gain}`)
      :res.t==="dislike"?`${f.name} accepts it with a smile, but it may not be a favorite · Bond unchanged`:f.bond>=100?`${f.name} is thrilled · Bond is already maxed`:`${f.name} is happy, but has been getting this a lot lately. Try mixing it up.`},
    ...((()=>{const k=f.giftTot===5?0:f.giftTot===10?1:-1;if(k<0||!GIFT_FREQ[id]||(f.giftFreq||0)>k)return [];f.giftFreq=k+1;
      return [...GIFT_FREQ[id][k].map(s=>({...s,l:"casual"})),k===1?{inject:G2=>{add(G2,id,"bond",3);G2.F[id].morale=Math.min(100,G2.F[id].morale+8);return [{n:"nar",t:`A gift in return from ${f.name} · Bond +3 · Morale: ${f.name} +8`}];}}:{inject:()=>[]}];})())],()=>{AU.startMusic("hub");render();},{bg:f.camp==="player"?"gym":"fair",look:"casual"});}
function goalHidden(){try{return localStorage.getItem("mtm-goalhide")==="1"}catch(e){return !!UI.goalHide}}
function beginFight(quick){const b=UI.fight.b,op=G.F[b.b],first=!(G.flags&&G.flags.waiSeen);
  if(!b.waiDone&&(first||b.tier==="semi"||b.tier==="final"||op.canon||op.camp==="rival")){b.waiDone=true;
    const sc=waiKhruScene(b);G.flags=G.flags||{};G.flags.waiSeen=true;const keep=UI.fight;UI.fight=null;AU.startMusic("waikhru");
    playScene(sc,()=>{UI.fight=keep;fightStart(quick);},{bg:(TIER_BG[b.tier]||"bg_local.webp").replace(/^bg_|\.webp$/g,""),look:"fight"});return;}
  fightStart(quick);}
const ACT={
  goaltog:()=>{const h=!goalHidden();UI.goalHide=h;try{localStorage.setItem("mtm-goalhide",h?"1":"0")}catch(e){}render();},
  spotnext:()=>{UI.spot++;if(UI.spot>=SPOT.length){UI.spot=null;G.seen.spot=true;save();}render();},
  spotskip:()=>{UI.spot=null;G.seen.spot=true;save();render();},
  tapstart:()=>{AU.resume();AU.sfx("level");AU.startMusic("title");UI.title="menu";render();},
  newgame:()=>{UI.delSlot=null;UI.owSlot=null;UI.modal={type:"slots",mode:"new"};render();},
  pickslot:d=>{const i=+d.v;if(loadSlot(i)){UI.owSlot=i;render();return;}ACT.beginNew(i);},
  confirmow:()=>{const i=UI.owSlot;UI.owSlot=null;ACT.beginNew(i);},cancelow:()=>{UI.owSlot=null;render();},
  openload:()=>{UI.delSlot=null;UI.owSlot=null;UI.modal={type:"slots",mode:"load"};render();},
  loadslot:d=>{backupSlot(+d.v);const s0=loadSlot(+d.v);if(!s0)return;const s=safeFix(s0);if(!s){toast("This save can't be opened in this version. Nothing was deleted");return;}G=s;const pk=G.F.ploy&&G.F.ploy.skills;if(pk&&pk.korat){G.F.ploy.skills={kr_swing:2,captain:1};}UI.slot=+d.v;UI.tab="home";UI.modal=null;UI.advCache={};AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}render();},
  askdelslot:d=>{UI.delSlot=+d.v;render();},canceldel:()=>{UI.delSlot=null;render();},
  delslot:()=>{clearSave(UI.delSlot);UI.delSlot=null;if(!loadSave())UI.modal=null;render();},
  beginNew:i=>{UI.slot=i;UI.modal=null;AU.startMusic("hub");UI.creator={name:"",...CHIBI.randomManager(Math.random),gender:"m",diff:"normal",outfit:"tee",hat:"none",glasses:"none"};UI.modal=null;render();},
  copyseed:()=>{const v=G.seedText||String(G.seed);const ok=()=>toast("Seed copied: "+v);try{navigator.clipboard.writeText(v).then(ok,()=>toast("seed: "+v));}catch(e){toast("seed: "+v);}},
  petplay:d=>{const i=+d.v,p=(G.pets||[])[i];if(!p||!petPlay(G,i))return;AU.sfx&&AU.sfx("ui");const PL={cat:"rolls over for belly rubs",dog:"chases a ball around the ring",rooster:"crows a show-off crow and makes everyone laugh",turtle:"pokes its head out for a slow pat"};
    toast(`${p.name} ${PL[p.k]} · ${PETS[p.k].eff}`);save();render();},
  petnamesave:d=>{const p=(G.pets||[])[+d.v];const v=((document.getElementById("petname")||{}).value||"").trim();if(p&&v){p.name=v.slice(0,12);toast(`Name it "${p.name}"`);}UI.modal=UI.modalQ||null;UI.modalQ=null;save();render();},
  cardhint:d=>{const C=CARDS[d.v];if(C)toast(C.g?"This card comes from the gacha":`How to get it: ${C.hint||"keep following the story"}`);},
  petren:d=>{UI.modal={type:"petname",i:+d.v};render();setTimeout(()=>{const el=document.getElementById("petname");if(el){el.focus();el.select();}},60);},
  gacha:()=>{const r=gachaPull(G);if(!r)return;AU.sfx&&AU.sfx(CARDS[r.id].r==="SSR"||CARDS[r.id].r==="SR"?"level":"ui");save();UI.modal={type:"gacha",res:r};render();},
  album:()=>{UI.modal={type:"album"};render();},
  cardplay:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o)return;o.seen=true;G.cardPend=(G.cardPend||[]).filter(x=>x!==d.v);save();UI.modal=null;const nw=d.from==="new";playScene(C.steps,()=>{UI.modal=nw?((G.cardPend||[]).length?{type:"cardnew"}:null):{type:"album"};render();},{bg:C.bg,look:"casual"});},
  cardlater:()=>{(G.cardPend||[]).shift();save();UI.modal=(G.cardPend||[]).length?{type:"cardnew"}:null;render();},
  cancelCreate:()=>{AU.startMusic("title");UI.creator=null;render();},
  cset:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator[d.k]=d.v;render();},
  crand:()=>{const n=(document.getElementById("pname")||{}).value||"",o=UI.creator||{};crSeed();UI.creator={...CHIBI.randomManager(Math.random),name:n,diff:o.diff||"normal",gender:o.gender||"m",tab:o.tab,seed:o.seed};render();},
  ctab:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator.tab=d.v;render();},
  startGame:()=>{const c=UI.creator;c.name=((document.getElementById("pname")||{}).value||"").trim()||(c.gender==="m"?"Start":"Dao");
    crSeed();const {name,diff,seed,...look}=c;G=newGame({name,gender:c.gender,diff:diff||"normal",avatar:look,seed:seedFrom(seed)});if(seed&&!/^\d{1,10}$/.test(seed))G.seedText=seed;genOffers(G);UI.creator=null;UI.tab="home";G.seen.prologue=true;AU.resume();AU.startMusic("date");
    playScene(EVENTS[0].steps,()=>{save();UI.tab="home";UI.spot=0;AU.startMusic("hub");render();},{bg:"bus",look:"train"});},
  continue:()=>{let si=0;for(let i=1;i<=SLOTS;i++)if(loadSlot(i)){si=i;break;}if(!si)return;backupSlot(si);const s=safeFix(loadSlot(si));if(!s){toast("This save can't be opened in this version. Nothing was deleted");return;}G=s;UI.slot=si;UI.tab="home";UI.modal=null;AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}render();},
  exportsave:()=>exportSave(),
  bakrestore:()=>{const b=bakInfo(UI.slot);if(!b)return;UI.modal={type:"confirm",title:"Restore the pre-update save?",text:`This goes back to week ${b.week} (v${b.ver}). Progress after that in this slot will be lost`,yes:"bakyes"};render();},
  bakyes:()=>{const b=bakInfo(UI.slot);if(!b)return;try{const i=UI.slot;const cur=localStorage.getItem(slotKey(i));localStorage.setItem(slotKey(i),b.raw);const s=safeFix(loadSlot(i));if(!s){localStorage.setItem(slotKey(i),cur);toast("Restore failed. Your current save is untouched");return;}G=s;UI.modal=null;UI.tab="home";save();render();toast("Save restored");}catch(e){}},
  setlang:(d)=>{const v=d.v;if(v===CUR_LANG)return;try{if(G)save();localStorage.setItem("mtm_lang",v);}catch(e){}try{location.hash="lang="+v;}catch(e){}location.reload();},
  settings:()=>{UI.confirmDel=false;UI.modal={type:"settings"};render();},
  setopt:d=>{SETTINGS[d.k]=!SETTINGS[d.k];saveSettings();if(d.k==="music"){if(!SETTINGS.music)AU.stopMusic();else AU.startMusic(!G?"title":UI.fight&&UI.fight.stage==="playing"?"fight":"hub");}render();},
  askdel:()=>{UI.confirmDel=true;render();},
  delsave:()=>{clearSave();UI.confirmDel=false;UI.modal=null;G=null;UI.title="menu";render();},
  trsel:d=>{UI.trSel=d.v;render();},
  tab:d=>{UI.tab=d.v;if(d.sub)UI.csub=d.sub;if(G&&(d.v==="train"||d.v==="fights")){G.tut=G.tut||{};G.tut[d.v]=true;}UI.resetScroll=true;render();window.scrollTo(0,0);},
  endweek:()=>{if(G.dm&&!G.dm.done&&G.dm.wk===G.week){toast("The Death Match isn't over yet. Finish it first");UI.modal={type:"dm"};render();return;}const todo=weekTodo();
    if(todo.length&&!UI.skipWarn){UI.modal={type:"endwarn",todo};render();return;}UI.skipWarn=false;endWeek();},
  endgo:()=>{UI.modal=null;UI.skipWarn=true;ACT.endweek();},
  fighter:d=>{UI.ptab=d.v||"over";UI.look=G.F[d.id].camp==="player"?"train":"fight";UI.modal={type:"fighter",id:d.id};render();},
  ptab:d=>{UI.ptab=d.v;render();},
  plook:d=>{UI.look=d.v;render();},
  learn:d=>{const sl=document.querySelector(".sklist"),y=sl?sl.scrollTop:0;if(learnSkill(G,d.id,d.v)){AU.sfx("level");save();render();const n=document.querySelector(".sklist");if(n)n.scrollTop=y;}},
  rinread:()=>{const n=G.rinNote;if(!n)return;G.rinNote=null;save();playScene(n.steps,()=>{save();render();},{bg:"gym",look:"casual"});},
  skline:d=>{UI.skLine={id:d.id,li:+d.v};AU.sfx("ui");render();},
  skauto:d=>{const f=G.F[d.id],li=+d.v;let n=0;for(let guard=0;guard<30&&f.sp>0;guard++){const s=(SKILLS[f.id]||[]).filter(x=>x.line===li).sort((a,b)=>a.row-b.row||(f.skills[a.id]||0)-(f.skills[b.id]||0)).find(x=>!skillBlock(f,x.id).length);if(!s||!learnSkill(G,f.id,s.id))break;n++;}
    if(n){AU.sfx("level");save();toast(`Up ${(SK_LINES[f.id]||[])[li]||""} ${n} times`);}render();},
  sksel:d=>{UI.skSel=d.id+":"+d.v;AU.sfx("ui");render();},
  closeModal:()=>{const m=UI.modal;UI.modal=null;render();if(m&&m.after)m.after();},
  closeModalBg:(d,e)=>{if(e.target.classList.contains("overlay")&&UI.modal&&!["report","levelup"].includes(UI.modal.type)){UI.modal=null;render();}},
  preset:d=>{if(trLocked(G.F[d.f]))return;const f=G.F[d.f];f.plan.preset=d.v;if(d.v==="rest")f.plan.intensity="normal";save();render();},
  intensity:d=>{if(trLocked(G.F[d.f]))return;G.F[d.f].plan.intensity=d.v;save();render();},
  consider:d=>{UI.modal={type:"consider",id:d.v};render();},
  accept:d=>{const o=G.offers.find(x=>x.id===d.v);if(!o)return;const A=adviseCached(o.a,o.b,3);acceptOffer(G,d.v);UI.modal=null;save();toast(`Fight booked: ${G.F[o.a].name} vs ${G.F[o.b].name} week ${o.week}`);},
  fsub:d=>{UI.fsub=d.v;if(d.v==="rank"&&G&&!(G.flags&&G.flags.rankGuide)){G.flags.rankGuide=1;UI.modal={type:"rankhelp"};save();}render();},csub:d=>{UI.csub=d.v;render();},rdiv:d=>{UI.rdiv=d.v;render();},
  tipnext:()=>{UI.tipIdx++;render();},hideguide:()=>{G.guideHidden=G.week;save();render();},
  tipact:d=>{if(d.k==="setrest"||d.k==="setprep"){ACT.tab({v:"train"});if(!trLocked(G.F[d.id])){UI.modal={type:"tpick",id:d.id};render();}}
    else if(d.k==="tab"&&d.sub){UI.csub=d.sub;ACT.tab({v:d.v});}
    else if(d.k==="fighter")ACT.fighter({id:d.id,v:d.v});else if(d.k==="tab")ACT.tab({v:d.v});else if(d.k==="campacts")ACT.campacts();else if(d.k==="loan")ACT.loan();else if(d.k==="lossrev")ACT.lossrev();else if(d.k==="endweek")ACT.endweek();},
  newsoff:()=>{UI.newsWeek=G.week;const el=document.querySelector(".newspop");if(el)el.remove();},
  hang:d=>{UI.modal={type:"hang",id:d.id};render();},
  gofac:()=>{UI.modal=null;UI.csub="fac";ACT.tab({v:"camp"});},
  camplv:()=>{UI.modal={type:"camplv"};render();},
  loan:()=>{if(!loanOk(G)){toast(G.loan>0?"You still have a loan outstanding":"Not desperate enough to borrow yet");return;}UI.modal={type:"loan"};render();},
  loanyes:()=>{if(!takeLoan(G))return;UI.modal=null;save();AU.sfx("coin");playScene([{n:"npc",who:"Gold Helmet's goon",t:"Thanks for your business, boss. Interest goes up every four weeks. We'll drop by the market to visit often"},{n:"coach",t:"…Fine. You've got the money, now find a way to pay it back fast before it snowballs"}],()=>render(),{bg:"food",look:"casual"});},
  repayloan:()=>{if(repayLoan(G)){save();AU.sfx("level");toast("Gold Helmet loan fully repaid. You can breathe again");render();}},
  advice:d=>{UI.modal={type:"advice",id:d.id};render();},
  mastersOpen:()=>{UI.modal={type:"masters"};render();},
  hiremaster:d=>{if(hireMaster(G,d.id,d.v)){AU.sfx("level");UI.modal=null;save();toast(`${G.F[d.id].name} learned from ${MASTERS[d.v].name} · skill point +1`);}},
  hostshow:()=>{if(hostShow(G)){AU.cheer(1);save();toast("Sirichai's fight night packed the yard! Fame +3");}},
  cleardebt:()=>{if(clearDebt(G)){save();playScene(DEBT_CLEAR_SCENE,()=>{add(G,"kati","bond",5);render();},{bg:"gym",look:"casual"});}},
  campacts:()=>{UI.modal={type:"campacts"};render();},
  studinfo:()=>{UI.modal={type:"studinfo"};render();},
  campick:d=>{UI.modal.pick=d.v;render();},campback:()=>{UI.modal.pick=null;render();},
  campok:()=>{ACT.campact({v:UI.modal.pick});},
  outfit:d=>{const f=G.F[d.id];if(!f||f.camp!=="player")return;if(d.v!=="base"&&!outfitOk(G,f,d.v))return;f.outfit=d.v;AU.sfx&&AU.sfx("ui");save();render();},
  campmg:()=>{const k=UI.modal.pick,a=CAMP_ACTIONS[k];if(!a||!a.mg||G.campUsed)return;UI.modal=null;render();BAG.openMode(a.mg,k);},
  cfxskip:()=>{if(UI.modal&&UI.modal.type==="campres"&&!UI.modal.skip){UI.modal.skip=true;const el=document.querySelector(".campres");if(el)el.classList.add("skip");}},
  campact:d=>{const note=doCampAction(G,d.v);if(note==null)return;G.campNote=note;AU.sfx("level");UI.modal={type:"campres",k:d.v,note};save();render();},
  date:d=>{UI.modal=null;UI.tab="people";const steps=dateScene(G,d.id,d.v);AU.startMusic("date");playScene(steps,()=>{AU.startMusic("hub");render();},{bg:ACTIVITIES[d.v].bg==="camp"?"gym":ACTIVITIES[d.v].bg,look:"casual"});},
  giftpick:d=>{UI.modal={type:"gift",id:d.id};render();},
  give:d=>{const r=giveGift(G,d.id,d.v);if(!r)return;UI.modal=null;UI.tab="people";save();AU.startMusic("date");giftScene(d.id,r);},
  buyfac:d=>{const before=campLevel(G);if(buyFacility(G,d.v)){save();const after=campLevel(G);AU.sfx("level");toast(after>before?`The camp rose to Lv.${after}: ${CAMP_LV_NAME[after]}!`:`Upgraded ${FACILITIES[d.v].name}`);}},
  daeng:()=>{if(upgradeDaeng(G)){save();toast(`Coach Daeng completed training Lv.${G.fac.daeng}`);}},
  useroad:d=>{const f=G.F[d.id];if(!f||trLocked(f)||!PRESETS[d.p])return;f.plan={...f.plan,preset:d.p,intensity:d.i};UI.modal=null;save();toast(`Set ${f.name}: ${planName(d.p,d.i)}. Don't forget to confirm`);},
  equip:d=>{if(toggleEquip(G,d.id,d.v)){AU.sfx("ui");save();render();}else toast(`You can equip at most ${MAX_EQUIP} skills. Remove one first`);},
  hirestaff:d=>{if(hireStaff(G,d.v)){AU.sfx("level");save();toast(`${STAFF[d.v].name} joined the camp`);render();}},
  firestaff:d=>{fireStaff(G,d.v);save();toast(`Dismissed ${STAFF[d.v].name}`);render();},
  paydebt:()=>{const p=Math.min(10000,G.debt);G.cash-=p;G.debt-=p;save();render();},
  sign:d=>{const f=G.F[d.v];if(G.cash<f.fee)return;
    if(!d.ok&&(weeklyNet(G)-f.wage<0||G.cash-f.fee<15000)){UI.modal={type:"signwarn",id:f.id};render();return;}UI.modal=null;G.cash-=f.fee;f.camp="player";f.met=true;add(G,f.id,"trust",5);
    if(stageOf(G.week)==="local")G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};genOffers(G);save();
    playScene([{n:f.id,f:"happy",l:"train",t:f.id==="mali"?"Pleased to be here! I'll kick Sirichai's name across the whole province~":"Contract done. I'll send the first week's training plan tonight"},
      {n:"kati",f:"happy",l:"train",with:f.id,t:f.id==="mali"?"Welcome, Mali! Our camp won't be lonely anymore!":"Welcome, Rin! …Please don't count how many times my guard drops"}],()=>render(),{bg:"gym",look:"train"});},
  vnext:()=>sceneNext(),vchoose:d=>{if(Date.now()-(UI._ct||0)<500)return;sceneChoose(+d.v);},vskip:()=>sceneSkip(),
  montageDone:()=>montageDone(),
  plan:d=>{UI.fight.plan=d.v;render();},
  fstart:()=>beginFight(false),fquick:()=>beginFight(true),fskip:()=>fskip(),fskill:d=>fskill(d.v),
  fspeed:d=>{UI.speed=+d.v===2?2:1;render();},
  tac:d=>{UI.fight.tac[d.k]=d.v;render();},
  tpick:d=>{if(trLocked(G.F[d.id]))return;UI.modal={type:"tpick",id:d.id};render();},
  tlock:d=>{const f=G.F[d.id];if(!f)return;f.lockWeek=G.week;f.drillBonus=0;AU.sfx("level");save();
    // v1.19.1: a short drill scene — tap to make her strike, then see how the session went
    const pr=f.plan.preset;if(!f.injury&&pr!=="rest"&&pr!=="prep"){UI.drill={id:f.id,taps:0,need:f.plan.intensity==="light"?2:3,res:[],hitT:0};UI.modal={type:"drill",id:f.id};}else UI.modal=null;render();},
  dtap:()=>{const D=UI.drill;if(!D||D.taps>=D.need)return;const r=srand(G,D.taps*31+D.need*7+(G.campUsed?3:0));const q=r<.3?"perfect":r<.85?"good":"ok";D.res.push(q);D.taps++;D.hitT=performance.now();D.q=q;
    AU.sfx(DRILL_ROW[G.F[D.id].plan.preset]==="knee"?"kick":"punch");
    if(D.taps>=D.need){const b=D.res.reduce((x,q)=>x+(q==="perfect"?4:q==="good"?2:0),0);G.F[D.id].drillBonus=b/100;D.bonus=b;save();setTimeout(()=>{if(UI.drill===D){D.done=true;AU.sfx(b>=8?"level":"ui");render();}},700);}
    render();},
  dskip:()=>{UI.drill=null;UI.modal=null;render();},
  fplan:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;UI.fpDraft={plan:b.plan||"balanced",target:(b.tac&&b.tac.target)||"body"};UI.modal={type:"fplan",id:d.id};render();},
  fpd:d=>{UI.fpDraft[d.k]=d.v;render();},
  fpok:d=>{const b=G.bookings.find(x=>x.id===d.id);if(b){b.plan=UI.fpDraft.plan;b.tac={...(b.tac||{}),target:UI.fpDraft.target};b.planSet=true;save();}UI.modal=null;render();},
  bplanb:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;b.plan=d.v;save();render();},
  btgt:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;b.tac={...(b.tac||{}),target:d.v};save();render();},ctac:d=>{UI.fight.F.A.tac[d.k]=d.v;render();},
  scout:d=>{if(G.cash<scoutCost()||scouted(d.v))return;const free=rinFree();G.cash-=scoutCost();G.scout=G.scout||{};G.scout[d.v]=G.week;if(free)G.rinTapeWk=G.week;save();if(free){toast(`Rin scouted ${G.F[d.v].name} (next free tape: week ${G.week+RIN_GAP})`);render();return;}toast("Tape scouted, Coach has noted the weak spots");render();},
  corner:d=>{AU.sfx("ui");UI.fight.F.A.instr=d.v;playRound();},
  chint:()=>{UI.fight.hint=!UI.fight.hint;render();},
  repinfo:()=>{UI.modal={type:"repinfo"};render();},
  skdesc:d=>{UI.skOpen=UI.skOpen===d.v?null:d.v;render();},
  cshow:()=>{UI.fight.cshow=!UI.fight.cshow;render();},
  frev:()=>{UI.fight.rev=!UI.fight.rev;render();},
  otip:d=>{UI.modal={type:"otip",id:d.v};render();},
  losstape:d=>{const L=G.losses[+d.v];if(!L||L.watched)return;const me=G.F[L.a],op=G.F[L.b];const W={punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"};const bt=Object.entries(L.B.wl||{}).sort((a,b)=>b[1]-a[1])[0];
    L.watched=true;UI.modal=null;
    playScene([{n:"nar",t:`That night the whole camp gathers around the old TV, replaying the fight where ${me.name} lost to ${op.name}, with sticky rice and moo ping in the middle of the circle`},
      {n:"coach",t:`Stop here. Look closely: ${op.name} throws ${bt?W[bt[0]]:"Weapons"} every time we step back. ${G.player.name}, see it?`},
      {n:L.a,f:"sad",l:"casual",t:TAPE_LINE[L.a]||"I see it now. Next time I won't slip up like that"},
      {inject:G2=>{gainXP(G2,me,25);G2.fam=G2.fam||{};G2.fam[L.b]=Math.min(2,(G2.fam[L.b]||0)+1);save();return [{n:"nar",t:`${me.name} EXP +25 · reads ${op.name} better. Next time they meet, her strikes land a little more often`}];}}],()=>render(),{bg:"gym",look:"casual"});},
  lossrev:()=>{UI.revIdx=0;UI.modal={type:"lossrev"};render();},
  revpick:d=>{UI.revIdx=+d.v;render();},
  cpick:d=>{UI.fight.pick=d.v;render();},
  cgo:()=>{const U=UI.fight;if(!U.pick)return;const C=U.care;if(C&&!C.done){C.q=0;applyCare(U.F,0);}AU.sfx("bell1");U.F.A.instr=U.pick;U.pick=null;playRound();},
  care:d=>{const U=UI.fight,C=U.care;if(!C||C.done)return;const i=C.got.length;C.got.push(d.v);const ok=C.need[i]===d.v;AU.sfx(ok?"ui":"miss");
    if(C.got.length>=C.need.length){C.done=true;const n=C.got.filter((g,k)=>g===C.need[k]).length;C.q=n===3?1:n===2?.5:0;if(C.q>=1)U.careOK=(U.careOK||0)+1;applyCare(U.F,C.q);if(C.q>=1){AU.sfx("level");const me=G.F[U.b.a];popToast({kati:"So refreshing!",mali:"Not tired anymore! Let's go!",rin:"Body back to 90%",ploy:"Thank you, my heart's in it",fah:"Okay! Ready to go hard!"}[me.id]||"Refreshed!","good");}}render();},
  towel:()=>{UI.confirmTowel=true;render();},
  towelno:()=>{UI.confirmTowel=false;render();},
  towelyes:()=>{UI.confirmTowel=false;const U=UI.fight;throwTowel(U.F);U.shown.push({s:"x",t:`${G.F[U.b.a].name}'s corner throws in the towel`});fightEnd();},
  withdraw:()=>{const U=UI.fight;G.bookings=G.bookings.filter(x=>x!==U.b);G.rep=Math.max(0,G.rep-1);add(G,U.b.a,"trust",3);
    G.log.push(`${G.F[U.b.a].name} withdraws due to injury`);const done=U.done;UI.fight=null;render();done();},
  fdone:()=>{const done=UI.fight.done;AU.startMusic("hub");UI.fight=null;render();done();},
  gatego:()=>{const v=((document.getElementById("gatecode")||{}).value||"").toUpperCase().replace(/\s+/g,"");let ok=false;try{ok=btoa(v)===GATE.code;}catch(e){}
    if(ok){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}UI.gateErr=false;save();AU.sfx("level");toast("Unlocked! Year 2 is ready to play");}else{UI.gateErr=true;AU.sfx("miss");}render();},
  newseason:()=>{if(!gateOpen())return;const res=seasonResult().map(r=>({id:r.f.id,name:r.f.name,d:r.d,t:r.t,c:r.c}));newSeason(G);const T=G.titles[G.titles.length-1];if(T)T.res=res;UI.ending=null;UI.tab="home";UI.advCache={};save();AU.startMusic("hub");
    playScene([{n:"coach",bg:"gym",t:`A new season is here, ${G.player.name}. Rankings reset for everyone, but our camp isn't starting from zero anymore`},
      {n:"kati",f:"happy",l:"train",with:"coach",t:"This year I won't let anyone pass me! Let's go!"}],()=>render(),{bg:"gym",look:"train"});},
  replay:()=>{const i=UI.slot;ACT.restart();ACT.beginNew(i);},
  restart:()=>{AU.startMusic("title");G=null;UI.ending=null;UI.creator=null;UI.tab="home";UI.title="menu";render();},
};
const QUIET_ACTS=new Set(["vnext","vchoose","corner","tapstart","fspeed","care","cgo"]);
document.addEventListener("click",e=>{AU.resume();const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act;if(!a||!ACT[a])return;if(el.disabled)return;
  if(el.classList.contains("title")&&e.target.closest("button"))return;if(a==="vnext")AU.sfx("tick");else if(a==="vchoose")AU.sfx("choose");else if(!QUIET_ACTS.has(a))AU.sfx("ui");ACT[a](el.dataset,e);});
["pointerdown","touchend","keydown"].forEach(t=>document.addEventListener(t,()=>AU.resume(),{passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)AU.resume();});
document.addEventListener("change",e=>{const el=e.target;if(el.dataset&&el.dataset.act==="importsave"&&el.files&&el.files[0]){if(!G)UI.slot=1;importSave(el.files[0]);return;}if(el.dataset&&el.dataset.act==="bplan"){const b=G.bookings.find(x=>x.id===el.dataset.id);if(b){b.plan=el.value;save();AU.sfx("ui");render();}}});
document.addEventListener("keydown",e=>{
  if(!G&&UI.title==="tap"&&(e.key===" "||e.key==="Enter")){e.preventDefault();ACT.tapstart();return;}
  if(UI.scene&&!(UI.scene.cur&&UI.scene.cur.choice)&&(e.key===" "||e.key==="Enter")){e.preventDefault();sceneNext();return;}
  if(e.key==="Enter"&&e.target&&e.target.id){const b={petname:"petnamebtn",redeemcode:null,gatecode:null}[e.target.id];const el=b?document.getElementById(b):e.target.id==="redeemcode"?document.querySelector("[data-act=redeem]"):e.target.id==="gatecode"?document.querySelector("[data-act=gatego]"):null;if(el){e.preventDefault();el.click();}}});
preloadCore();["happy","surprised","sad"].forEach(m=>warm(stand("kati","fight",m)));warm(`${ASSET}coach.webp`);render();

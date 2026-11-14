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
const SURPRISE=/^(…)?\s*(ใครน่ะ|ห้ะ|หา[!?]|เอ๊ะ|อ๊ะ|อะไรนะ|จริงเหรอ|ตะ… |เดี๋ยว|ว้าย|อุ๊ย)/;
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
  (async()=>{try{const dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;if(dl){await dl.save({filename:fn,data});toast("ส่งออกเซฟแล้ว");return;}}catch(e){if(e&&e.code==="declined")return;}
    try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type:"application/json"}));a.download=fn;document.body.appendChild(a);a.click();a.remove();toast("ส่งออกเซฟแล้ว");}catch(e){toast("ส่งออกไม่สำเร็จ");}})();}
function importSave(file){const r=new FileReader();r.onload=()=>{try{let s=JSON.parse(r.result);if(!s||!s.F||!s.week)throw 0;if(typeof I18N_FIX==="function")s=I18N_FIX(s);const i=UI.slot||1;fixSave(s);G=s;UI.slot=i;save();UI.modal=null;UI.title=null;UI.tab="home";AU.startMusic("hub");render();toast(`นำเข้าเซฟลงช่อง ${i} แล้ว`);}catch(e){toast("ไฟล์เซฟไม่ถูกต้อง");}};r.readAsText(file);}
function loadSlot(i){try{const s=localStorage.getItem(slotKey(i));return s?(typeof I18N_FIX==="function"?I18N_FIX(JSON.parse(s)):JSON.parse(s)):null;}catch(e){return null;}}
function loadSave(){for(let i=1;i<=SLOTS;i++){if(loadSlot(i))return loadSlot(i);}return null;}
function clearSave(i=UI.slot){try{if(i)localStorage.removeItem(slotKey(i));}catch(e){}}
function slotInfo(s){if(!s)return "ว่าง";const d=s.savedAt?new Date(s.savedAt):null;
  return `${esc(s.player.name)} · สัปดาห์ ${Math.min(s.week,52)} · ${fmt(s.cash)} · ค่าย Lv.${campLevel(s)}${d?` · ${d.toLocaleDateString("th-TH",{day:"numeric",month:"short"})} ${d.toLocaleTimeString("th-TH",{hour:"2-digit",minute:"2-digit"})}`:""}`;}
function slotsHTML(mode){const rows=[];for(let i=1;i<=SLOTS;i++){const s=loadSlot(i);
    rows.push(`<div class="slot ${s?"":"empty"}"><div class="sl-i">${i}</div><div class="sl-t"><b>ช่องเซฟ ${i}</b><small>${slotInfo(s)}</small></div>
     ${mode==="load"?(s?`<button class="btn sm gold" data-act="loadslot" data-v="${i}">โหลด</button><button class="btn sm ghost" data-act="askdelslot" data-v="${i}" aria-label="ลบช่อง ${i}">ลบ</button>`:""):
       `<button class="btn sm ${s?"":"primary"}" data-act="pickslot" data-v="${i}">${s?"เขียนทับ":"เลือก"}</button>`}</div>`);}
  const del=UI.delSlot?`<div class="confirm px"><b>ลบช่องเซฟ ${UI.delSlot}?</b><p class="meta">ลบแล้วกู้คืนไม่ได้</p><div class="mfoot"><button class="btn ghost" data-act="canceldel">ยกเลิก</button><button class="btn primary" data-act="delslot">ลบเลย</button></div></div>`:"";
  const ow=UI.owSlot?`<div class="confirm px"><b>เขียนทับช่องเซฟ ${UI.owSlot}?</b><p class="meta">เกมเดิมในช่องนี้จะหายไป</p><div class="mfoot"><button class="btn ghost" data-act="cancelow">ยกเลิก</button><button class="btn primary" data-act="confirmow">เริ่มเกมใหม่ที่ช่องนี้</button></div></div>`:"";
  return `<h2>${mode==="load"?"โหลดเกม":"เลือกช่องเซฟสำหรับเกมใหม่"}</h2><div class="slots">${rows.join("")}</div>${del}${ow}`;}

// ---------- small components ----------
function faceImg(f,cls=""){return f.canon?`<img class="face ${cls}" style="--c:${f.color}" src="${faceSrc(f.id,"happy")}" alt="${esc(f.name)}">`:
  `<canvas class="face npcface ${cls}" width="96" height="96" data-sprite="${f.id}" data-mode="guard" style="--c:${f.color}" aria-label="${esc(f.name)}"></canvas>`;}
function hearts(b){const v=Math.max(0,Math.min(100,b||0));let h="";for(let k=0;k<10;k++){const p=Math.max(0,Math.min(1,(v-k*10)/10));h+=`<i class="hp" style="--p:${p}"></i>`;}
  const tier=v>=85?"ผูกพันลึก":v>=65?"ใกล้ชิด":v>=45?"สนิท":v>=25?"เริ่มคุ้น":"คนรู้จัก";return `<span class="hearts" title="ความสนิท ${Math.round(v)}/100">${h}<small>${tier}</small></span>`;}
function bar(label,v,color,txt){return `<div class="bar"><span>${label}</span><i style="--v:${clamp(v,0,100)}%;--bc:${color}"></i><b class="num">${txt??Math.round(v)}</b></div>`;}
function mini(v,color){return `<i class="mini" style="--v:${clamp(v,0,100)}%;--bc:${color}"></i>`;}
function xpBar(f){const need=xpNeed(f.lvl);return `<div class="xp"><span class="lv">Lv.${f.lvl}</span><i style="--v:${f.lvl>=10?100:clamp(f.xp/need*100,0,100)}%"></i><span class="num dim">${f.lvl>=10?"MAX":`${Math.round(f.xp)}/${need}`}</span>${f.sp>0&&f.camp==="player"?`<button class="spchip" data-act="ptab" data-v="skill">★ ${f.sp} แต้มสกิล</button>`:""}</div>`;}
function formHTML(f){return `<span class="form">${f.form.map(r=>`<i class="${r}">${r==="W"?"ช":r==="L"?"พ":"ส"}</i>`).join("")||'<span class="dim">—</span>'}</span>`;}
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
  {sel:".hud .stats",t:"ตรงนี้คือ<b>เงินสด</b>กับ<b>ชื่อเสียง</b> เงินหมดเมื่อไหร่ค่ายปิด! ถ้าเห็น ⚠ กระพริบ แปลว่าเงินกำลังจะหมด"},
  {sel:".hud .wk",t:"ฤดูกาลมี <b>52 สัปดาห์</b> เป้าแรก: ติด<b>ท็อป 4 รอบตำบล</b>ภายในสัปดาห์ 20"},
  {sel:".campact",t:"เลือก<b>กิจกรรมค่าย</b>ได้สัปดาห์ละ 1 อย่าง <b>สอนคลาสพิเศษ</b>ได้เงิน ไม่อยากจ่ายก็เลือก<b>วันหยุดค่าย</b>"},
  {sel:".fgrid",t:"<b>การ์ดนักมวย</b> แตะเพื่อดูค่าพลัง สกิล และความสัมพันธ์ แถบเขียวคือ<b>ความพร้อม</b> แถบส้มคือ<b>ความล้า</b>"},
  {sel:'.tabs [data-v="train"]',t:"<b>ฝึก</b> ตั้งโปรแกรมซ้อม ล้าเกิน <b>50</b> ควรพักฟื้น"},
  {sel:'.tabs [data-v="fights"]',t:"<b>ไฟต์</b> รับข้อเสนอชก <b>ดูเทป</b>คู่ชกก่อน จะรู้ว่าควร<b>ฝึกแก้ทาง</b>อะไร"},
  {sel:'.tabs [data-v="people"]',t:"<b>ตัวละคร</b> ใช้เวลาว่างชวนนักมวยไปเที่ยว ยิ่ง<b>สนิท</b> ยิ่งสู้ไม่ถอย"},
  {sel:'.tabs [data-v="camp"]',t:"<b>จัดการค่าย</b> ดูการเงิน จ้างครู อัปเกรดค่าย รับนักมวยใหม่"},
  {sel:".endweek",t:"ทำเสร็จแล้วกด<b>จบสัปดาห์</b> ลุยกันเลย!"}];
function spotPaint(){document.querySelectorAll(".spot-ov").forEach(e=>e.remove());if(UI.spot==null||!G||UI.scene||UI.fight||UI.modal||!document.querySelector(".hud"))return;
  const st=SPOT[UI.spot];if(!st){UI.spot=null;G.seen.spot=true;save();return;}const el=document.querySelector(st.sel);if(!el){UI.spot++;spotPaint();return;}
  const main=document.querySelector("main");if(main&&main.contains(el)){const r0=el.getBoundingClientRect(),m0=main.getBoundingClientRect();if(r0.bottom>innerHeight-150||r0.top<m0.top)main.scrollTop+=r0.top-m0.top-60;}
  const r=el.getBoundingClientRect(),pad=6,ov=document.createElement("div");ov.className="spot-ov";
  const below=r.top+r.height/2<innerHeight/2;
  ov.innerHTML=`<div class="spot-hole" style="left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+pad*2}px;height:${r.height+pad*2}px"></div>
   <div class="spot-box px" style="${below?`top:${Math.min(innerHeight-190,r.bottom+pad+12)}px`:`bottom:${Math.min(innerHeight-190,innerHeight-r.top+pad+12)}px`}">
    <div class="spot-ic" aria-hidden="true"></div><p>${st.t}</p>
    <div class="spot-ft"><span class="meta">${UI.spot+1}/${SPOT.length}</span><button class="btn sm ghost" data-act="spotskip">ข้าม</button><button class="btn sm primary" data-act="spotnext">${UI.spot===SPOT.length-1?"เริ่มเลย!":"ต่อไป ▸"}</button></div></div>`;
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
   <div class="tmid">${UI.title==="tap"?`<button class="tapstart" data-act="tapstart">TAP TO START</button><p class="tsub">แตะเพื่อเริ่ม</p>`:
   `<nav class="px tmenu" aria-label="เมนูหลัก">
     <button class="btn primary" data-act="newgame">เริ่มเกมใหม่</button>
     <button class="btn gold" data-act="openload" ${sv?"":"disabled"}>โหลดเกม<small>${sv?`${[1,2,3].filter(i=>loadSlot(i)).length} ช่องที่มีเซฟ`:"ยังไม่มีเซฟ"}</small></button>
     <button class="btn" data-act="settings">ตั้งค่า</button></nav>`}</div></div>
   ${langSwitch("tlang")}<div class="version">© 2026 Muay Thai Moe${UI.title==="tap"?"":` · <a class="tdisc" href="${GATE.url}" target="_blank" rel="noopener">Discord</a>`} · v${VERSION}</div></div>`;}
// v1.48: shareable world seeds — digits are used as-is, words are hashed
function seedFrom(v){v=String(v||"").trim();if(!v)return undefined;if(/^\d{1,10}$/.test(v))return Number(v)>>>0;let h=2166136261;for(const ch of v.toLowerCase()){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function crSeed(){const e=document.getElementById("pseed");if(e&&UI.creator)UI.creator.seed=e.value.trim();}
const seedHTML=()=>G?`<div class="set"><span><b>Seed ของโลกนี้</b><small>แชร์ให้เพื่อนใส่ตอนสร้างตัว จะได้โลกเดียวกัน · แจ้งบั๊กพร้อม seed กับสัปดาห์ได้เลย</small></span><span class="obtns"><code class="seedv">${esc(G.seedText||String(G.seed))}</code><button class="btn sm" data-act="copyseed">คัดลอก</button></span></div>`:"";
function settingsHTML(){const t=(k,label,desc)=>`<label class="set"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" data-act="setopt" data-k="${k}" ${SETTINGS[k]?"checked":""}></label>`;
  return `<h2>ตั้งค่า</h2><div class="sets"><div class="set"><span><b>ภาษา · Language</b><small>สลับแล้วเกมจะโหลดใหม่ เซฟยังอยู่</small></span>${langSwitch()}</div>${t("music","เพลงประกอบ","ปี่ชวา กลองแขก ฉิ่ง ระหว่างชก")}${t("sfx","เอฟเฟกต์เสียง","เสียงต่อย เตะ ระฆัง เสียงเชียร์")}${t("coach","ครูแดงแนะนำ","ครูคอยไกด์ในหน้าค่าย ข้อเสนอไฟต์ และช่วงพักยก")}${t("quick","เล่นเร็ว","ข้ามฉากฝึกซ้อมตอนจบสัปดาห์ ไปสรุปผลทันที")}${seedHTML()}</div>
   ${!G&&loadSave()?`<div class="set danger"><span><b>จัดการช่องเซฟ</b><small>ดู โหลด หรือลบเซฟแต่ละช่อง</small></span><button class="btn sm" data-act="openload">เปิด</button></div>`:""}${G?`<p class="meta">กำลังเล่นช่องเซฟ ${UI.slot} · บันทึกอัตโนมัติทุกครั้งที่มีความคืบหน้า${CLOUD.ready?" · สำรองบนคลาวด์แล้ว":" · ยังไม่ได้เชื่อมคลาวด์ (เซฟอยู่ในเบราว์เซอร์นี้เท่านั้น)"}</p>
   ${G&&UI.slot&&bakInfo(UI.slot)?`<div class="set"><span><b>เซฟก่อนอัปเดต</b><small>เก็บไว้ตอนเกมอัปเดต · v${esc(String(bakInfo(UI.slot).ver))} สัปดาห์ ${bakInfo(UI.slot).week}</small></span><button class="btn sm" data-act="bakrestore">กู้คืน</button></div>`:""}
   <div class="set"><span><b>ใส่โค้ด</b><small>โค้ดอีเวนต์หรือโค้ดเล่นต่อ จากเพจและ Discord ของเกม</small></span><span class="obtns redeem"><input id="redeemcode" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="โค้ด" aria-label="โค้ด"><button class="btn sm primary" data-act="redeem">ใช้โค้ด</button></span></div>
   <div class="set"><span><b>สำรองเซฟเป็นไฟล์</b><small>เก็บไฟล์ไว้เอง ย้ายเครื่องหรือเบราว์เซอร์ก็นำเข้าได้</small></span><span class="obtns"><button class="btn sm" data-act="exportsave">ส่งออก</button><label class="btn sm">นำเข้า<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></span></div>`:`<div class="set"><span><b>นำเข้าเซฟจากไฟล์</b><small>ไฟล์ที่เคยส่งออกไว้ จะลงช่อง 1</small></span><label class="btn sm">นำเข้า<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></div>`}
   <details class="gloss"><summary><b>คำศัพท์ในเกม</b></summary><dl>${GLOSS.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></details>
   <p class="meta">Muay Thai Moe v${VERSION}</p>`;}
const GLOSS=[["ความพร้อม","สภาพร่างกายวันชก ยิ่งสูงยิ่งชกได้เต็มที่ ลดลงเมื่อล้าหรือบาดเจ็บ"],["ความล้า","สะสมจากการซ้อม เกิน 65 เริ่มเสี่ยงบาดเจ็บ ลดได้ด้วยพักฟื้น ห้องฟื้นฟู ครัว"],
 ["กำลังใจ","ยิ่งสูงยิ่งชกแม่น ขึ้นจากชนะ เดต ทำบุญ ลดเมื่อแพ้หรือซ้อมหนักเกิน"],["ความสนิท","ความผูกพันกับคุณ ปลดฉากพิเศษ ท่าไม้ตายที่ 60 และเพิ่มโอกาสโหมดเลือดเดือด"],
 ["ความเชื่อใจ","นักมวยเชื่อคำสั่งของคุณแค่ไหน ยิ่งสูง คำสั่งจากมุมเวทีได้ผลดีขึ้น (สูงสุด +4% ความแม่น) ถึง 60 แพ้แล้วกำลังใจลดน้อยลง และมีผลกับฉากสารภาพใจ · เพิ่มได้จากฉากทำบุญ ไหว้ครู ไม่ซ้อมหนักเกินไป และค่ายที่ไม่ติดหนี้"],["ชื่อเสียง","คนรู้จักค่ายแค่ไหน ยิ่งสูงนักเรียนยิ่งมาเรียน"],
 ["แต้มสกิล","ได้ทุกเลเวลอัป ใช้อัปท่ามวยโบราณตามสำนักของนักมวย"],["ฝึกแก้ทาง","ดูเทปคู่ชกแล้ว ฝึกโปรแกรมที่แก้อาวุธหลักของคู่ชกในสัปดาห์ก่อนชก ได้โบนัสวันชก"],
 ["โหมดเลือดเดือด","เมื่อเจ็บหนักหรือตามคะแนน นักมวยอาจ 'ตาเปลี่ยน' ชั่วครู่ สวนแรงและคริติคอลง่าย ไฟต์ละครั้ง"],["ไหว้ครูรำมวย","พิธีก่อนชกไฟท์แรก ไฟท์กับตัวละครหลัก และไฟท์สำคัญ เลือกท่ารำได้ แต่ละท่าให้ผลต่างกัน"]];

// ---------- creator (manager look) ----------
function creatorHTML(){const c=UI.creator,O=CHIBI.OPT;
  const sw=(prop,list)=>`<div class="sw">${list.map(v=>`<button style="background:${v}" aria-label="${v}" aria-pressed="${c[prop]===v}" data-act="cset" data-k="${prop}" data-v="${v}"></button>`).join("")}</div>`;
  const seg=(prop,list)=>`<div class="seg">${list.map(([v,t])=>`<button data-act="cset" data-k="${prop}" data-v="${v}" aria-pressed="${c[prop]===v}">${t}</button>`).join("")}</div>`;
  const F=(label,inner)=>`<div class="field"><span class="lb">${label}</span>${inner}</div>`;
  const tab=c.tab||"base";
  const T={base:F("เพศ (มีผลกับบทพูด)",seg("gender",[["m","ชาย"],["f","หญิง"]]))+F("ความยาก",seg("diff",[["easy","ง่าย"],["normal","ปกติ"],["hard","ยาก"]]))+`<p class="meta">${{easy:"คู่แข่งพัฒนาช้าลง รายได้คลาสมากขึ้น เหมาะกับคนอยากเล่นเนื้อเรื่อง",normal:"สมดุลตามที่ออกแบบไว้",hard:"พลอยกับฟ้าโหดขึ้น ใช้สกิลแรงขึ้น เงินตึงขึ้น"}[c.diff||"normal"]}</p>`+F("Seed (ไม่บังคับ)",`<input id="pseed" maxlength="20" value="${esc(c.seed||"")}" autocomplete="off" placeholder="เว้นว่าง = สุ่มโลกใหม่">`)+`<p class="meta">ใส่ seed เดียวกับเพื่อน จะได้โลกเดียวกัน: นักมวยคู่แข่ง ข้อเสนอไฟต์ และเหตุการณ์สุ่มตรงกัน ใส่เป็นตัวเลขหรือคำก็ได้</p>`,
   face:F("ทรงผม",seg("hairStyle",O.hairStyle))+F("สีผม",sw("hair",O.hair))+`<div class="two">${F("สีผิว",sw("skin",O.skin))}${F("สีตา",sw("eyes",O.eyes))}</div>`,
   wear:F("ชุด",seg("outfit",[["tee","เสื้อยืด"],["polo","โปโล"],["suit","สูท"],["hoodie","ฮู้ด"]])+sw("outfitColor",O.cloth))+F("กางเกง",seg("pants",[["long","ขายาว"],["shorts","ขาสั้น"]])+sw("pantsColor",["#1f1f24","#2c3e6b","#5a4a3a","#8a8f99","#e8dcc0"])),
   acc:F("หมวก",seg("hat",[["none","ไม่ใส่"],["cap","แก๊ป"],["bucket","บักเก็ต"]]))+(c.hat!=="none"?F("สีหมวก",sw("hatColor",O.cloth)):"")+F("แว่น",seg("glasses",[["none","ไม่ใส่"],["glasses","สายตา"],["sun","กันแดด"]]))};
  return `<div class="creator v2"><div class="cr-in">
   <header class="cr-head"><h1>เจ้าของค่ายคนใหม่</h1><p class="lead">คุณคือหลานของปู่ชัย ผู้รับช่วงค่ายมวยศิริชัย</p></header>
   <div class="px cr-top"><div class="cr-stage"><canvas width="240" height="320" data-chibi="creator" aria-label="ตัวอย่างตัวละคร"></canvas></div>
     <div class="cr-id"><div class="field"><label for="pname">ชื่อ</label><input id="pname" maxlength="14" value="${esc(c.name||"")}" autocomplete="off" placeholder="${c.gender==="m"?"ต้น":"ดาว"}"></div>
      <button class="btn sm" data-act="crand">สุ่มทั้งหมด</button></div></div>
   <div class="seg cr-tabs" role="tablist">${[["base","พื้นฐาน"],["face","ผม · หน้า"],["wear","ชุด"],["acc","ของเสริม"]].map(([k,t])=>`<button role="tab" data-act="ctab" data-v="${k}" aria-pressed="${tab===k}">${t}</button>`).join("")}</div>
   <div class="px cr-opts">${T[tab]}</div>
   <div class="cr-foot"><button class="btn ghost" data-act="cancelCreate">ย้อนกลับ</button><button class="btn primary" data-act="startGame">รับมรดกค่าย ▸</button></div>
  </div></div>`;}

// ---------- hub ----------
const TABS=[["home","หน้าค่าย"],["train","ฝึก"],["fights","ไฟต์"],["people","ตัวละคร"],["camp","จัดการค่าย"]];
// v1.12: warn before the money runs out, not after
function weeksLeft(){const net=weeklyNet(G)-(G.debt>0?Math.min(5000,G.debt)/4:0);if(net>=0)return 99;return Math.max(0,Math.floor(G.cash/-net));}
// v1.13 news ticker — boxing world, rival camps, our camp
// v1.22: the ticker is mostly silly local news — it slides through once and is gone
const FUNNY_NEWS=["ลุงหวังวินมอไซค์ประกาศ 'ใครแซงคิว เจอเข่าโค้งไชยา' วินเจ้าใหม่ย้ายซอยหนีแล้ว","ป้าแต๋วเปิดเมนูส้มตำ 'เผ็ดระดับกะทิ' ลูกค้าน้ำตาไหลยกร้าน","ไก่ชนข้างค่ายศิริชัยจิกกระสอบทรายขาด เจ้าของยืนยัน 'มันซ้อมอยู่'",
 "แมวส้มประจำค่ายน้ำหนักขึ้น 2 กิโล ตัวการคือถุงขนมครกที่หายไปทุกคืน","ครูแดงถูกพบยิ้มมุมปากเป็นครั้งแรกในรอบสิบปี พยานยังช็อก","นักท่องเที่ยวใส่มงคลเดินห้าง คนไหว้ตลอดทางจนห้างต้องประกาศเสียงตามสาย",
 "วัดใกล้ค่ายจัดงานวัด ซุ้มยิงลูกโป่งขาดทุนหนักหลังมีสาวแว่นยิงแตกสิบนัดติด","เถ้าแก่ค่ายพยัคฆ์ทองซื้อรถตู้ใหม่สีทองทั้งคัน ชาวบ้านนึกว่ารถแห่","ผลสำรวจ: ชาวบ้าน 8 ใน 10 ได้ยินเสียงกระสอบทรายจากค่ายศิริชัยตอนตีห้า และไม่เคยได้นอนตื่นสายอีกเลย",
 "เจ๊หมวยเจ้าของที่ดินเดินทางไปญี่ปุ่น ฝากคิทแคทชาเขียวไว้ทั้งซอย","ร้านคาราโอเกะข้างค่ายขอร้อง 'ห้ามนักมวยร้องเพลงลูกทุ่งหลังสี่ทุ่ม'","เด็กข้างบ้านเปิดคลาสสอนไหว้ครูให้ตุ๊กตา ค่าเรียนเป็นลูกอม",
 "เสี่ยสวนลำไยประกาศ 'ใครชนะน็อก แถมลำไยตันนึง' ค่ายมวยทั่วจังหวัดสั่นสะเทือน","สนามมวยอำเภอติดแอร์ใหม่ แต่ลืมติดตั้งในห้องพักนักมวย","กรรมการมวยท่านหนึ่งยืนยัน 'ผมไม่ได้หลับ ผมแค่หลับตาฟังเสียงหมัด'",
 "วินมอไซค์หน้าค่ายเปิดบริการ 'ส่งนักมวยถึงเวทีใน 5 นาที' ค่าโดยสารเป็นลายเซ็น","ไลฟ์ขายนวมของค่ายพยัคฆ์ทองล่ม เพราะคนเข้าไปถามแต่ว่า 'พลอยกินอะไร'","ป้าขายหมูปิ้งหน้าสนามยืนยัน 'นักมวยที่ซื้อหมูปิ้งป้าชนะทุกคน' (ยกเว้นคนที่แพ้)"];
function funnyNews(n){const o=[];for(let i=0;i<n;i++)o.push(FUNNY_NEWS[(G.week*7+i*5+(G.seed%11))%FUNNY_NEWS.length]);return o;}
function newsItems(){const N=[...(G.lvNews||[]).slice(0,1)],st=standings(G,"A").slice(0,3),R=roster(G);
  if(st[0])N.push(`ตารางรุ่น A: ${G.F[st[0].id].name} นำเป็นอันดับ 1`);
  const rv=Object.values(G.F).filter(f=>f.camp==="rival");if(rv.length)N.push(`ค่ายพยัคฆ์ทองส่งนักมวยลงแข่ง ${rv.length} คน เถ้าแก่ประกาศ "ปีนี้แชมป์ต้องเป็นของเรา"`);
  for(const f of R){const h=f.rec||{w:0,l:0};if(h.w>=3)N.push(`${f.name} ค่ายศิริชัย ฟอร์มแรง ชนะแล้ว ${h.w} ไฟต์`);}
  if(G.rep>=10)N.push(`ค่ายมวยศิริชัยกลับมาเป็นที่พูดถึงอีกครั้ง หลังเงียบไปหลายปี`);
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];if(nb)N.push(`โปรแกรมสัปดาห์ ${nb.week}: ${G.F[nb.a].name} ปะทะ ${G.F[nb.b].name}`);
  N.unshift(...funnyNews(2));
  if(typeof bdayWeek==="function")for(const id of ["kati","mali","rin","ploy","fah"]){const f=G.F[id];if(!f||!(f.camp==="player"||f.met))continue;const d=bdayWeek(id)-G.week;if(d>=0&&d<=2)N.unshift(d===0?`🎂 สัปดาห์นี้วันเกิด${f.name}!`:`🎂 อีก ${d} สัปดาห์ วันเกิด${f.name}`);}
  N.push(["ราคาน้ำมันมวยปรับขึ้น 5 บาท แม่ค้าบอก 'ช่วงนี้ขายดี'","สนามมวยอำเภอติดแอร์ใหม่ คนดูไม่ต้องพัดวีแล้ว","ครูมวยโคราชวัย 80 ยังสอนหมัดเหวี่ยงควายทุกเช้า","มวยหญิงได้รับความนิยมขึ้น ผู้ชมเพิ่มเกือบเท่าตัว","ชาวต่างชาติแห่เรียนมวยไทยช่วงไฮซีซัน"][G.week%5]);
  return N;}
function weekTodo(){const R=roster(G),todo=[];if(R.some(f=>!f.injury&&!trLocked(f)))todo.push("ยังไม่ได้ยืนยันโปรแกรมฝึกบางคน");if(!G.campUsed)todo.push("ยังไม่ได้เลือกกิจกรรมค่าย");
  if(G.offers.length&&!G.bookings.some(b=>G.F[b.a].camp==="player"))todo.push("ยังไม่มีไฟต์ในตาราง");return todo;}
// v1.15: what reputation actually does, and what it unlocks next
function repSteps(){const L=Object.values(CAMP_ACTIONS).filter(a=>a.rep&&!a.fac).map(a=>[a.rep,"กิจกรรม: "+a.name]);L.push([14,"ทีวีท้องถิ่นขอมาถ่ายทำค่าย (เหตุการณ์)"],[20,"หนังสือพิมพ์อำเภอลงข่าวค่าย · นักเรียนเพิ่ม"],[30,"ข้อเสนอไฟต์เพิ่มเป็น 3 คู่ต่อคน"],[36,"ทีวีจังหวัดสัมภาษณ์ผู้จัดการ"],[50,"สปอนเซอร์ประจำ ฿1,500/สัปดาห์"],[60,"ป้ายค่ายมวยดังประจำจังหวัด"]);return L.sort((a,b)=>a[0]-b[0]);}
function repInfoHTML(){const r=G.rep;
  return `<h2>ชื่อเสียงค่าย ${r.toFixed(1)}</h2><ul class="fp-list"><li>ยิ่งสูง คนมาเรียนยิ่งเยอะ (รายได้ประจำ)</li><li>ค่าตัวไฟต์สูงขึ้น (ถึง +20%)</li><li>ค่ายดูดีขึ้นในฉากหน้าค่าย</li></ul>
   <h3>ได้มาจาก</h3><p class="meta">ชนะไฟต์ (รอบสูงได้มาก) · กิจกรรมค่าย · จัดศึกที่ค่าย · บางเหตุการณ์ (ทางเลือกที่ไม่ดีทำให้ลดได้)</p>
   <h3>ปลดล็อก</h3><div class="replist">${repSteps().map(([n,t])=>`<div class="${r>=n?"on":""}"><b>${r>=n?"✓":n}</b><span>${t}</span></div>`).join("")}</div>`;}
function newsHTML(){if(UI.newsWeek===G.week)return "";const N=newsItems();if(!N.length)return "";const n=N.slice(0,3).join("   ◆   ");const dur=Math.min(24,Math.max(12,Math.round(n.length/7)));
  return `<div class="newspop" role="status" style="--d:${dur}s"><b class="nlab">ข่าวมวย</b><div class="ntrack"><span class="ncrawl">${esc(n)}</span></div><button class="nclose" data-act="newsoff" aria-label="ปิดข่าว">×</button></div>`;}
function rinBrief(){const r=G.F.rin;if(!r||r.camp!=="player"||G.week%3!==0)return "";const R=roster(G);
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];let t;
  if(nb){const op=G.F[nb.b];t=`คู่ชกของ${G.F[nb.a].name}สัปดาห์ ${nb.week} ถนัด${{punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"}[oppTop(op)]} ${scouted(op.id)?`ฝึก "${PRESETS[counterPreset(op)].name}" แก้ทางได้`:"ฉันดูเทปให้ฟรีแล้ว ไปดูในแผนไฟต์ได้เลย"}`;}
  else{const w=R.map(f=>[f,RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0]]).sort((a,b)=>a[1][1]-b[1][1])[0];t=`จุดอ่อนที่สุดในทีมตอนนี้คือ${w[1][0]}ของ${w[0].name} ถ้าแก้ได้ อัตราชนะน่าจะขึ้นอีกเยอะ`;}
  return `<div class="px rinnote"><img src="${faceSrc("rin","happy")}" alt=""><span><b>รินสรุปข้อมูล</b>${t}</span></div>`;}
function hubHTML(){
  const dots={fights:G.offers.some(o=>!G.bookings.some(b=>b.a===o.a))||dmOfferOn(G),people:(typeof canChat==="function"&&CANON_IDS.some(id=>canChat(G.F[id]))),home:!G.campUsed,train:roster(G).some(f=>!f.injury&&!trLocked(f))};
  return `<header class="hud"><div class="hud-in">
    <div class="brand">MUAY THAI <b>MOE</b></div>
    <div class="wk"><strong class="num">สัปดาห์ ${Math.min(G.week,52)}<small> / ปีที่ ${G.season||1}</small></strong><span>${stageLabel()}</span></div>
    <div class="stats"><button class="stat cashbtn" data-act="cashflow"><span>เงินสด ▸</span><b class="num ${G.cash<0||weeksLeft()<=4?"neg":""}">${fmt(G.cash)}${weeksLeft()<=6?`<i class="cashwarn" title="เงินจะหมดในราว ${weeksLeft()} สัปดาห์">⚠</i>`:""}</b></button><button class="stat repbtn" data-act="repgraph"><span>ชื่อเสียง ▸</span><b class="num">${G.rep.toFixed(1)}</b></button></div>
    <div class="hbtns"><button class="iconbtn mailbtn ${mailBadge()?"has":""}" data-act="mail" aria-label="ตู้จดหมาย${mailBadge()?` มี ${mailBadge()} ฉบับใหม่`:""}">${MAILBOX_PX}${mailBadge()?`<i class="mbadge">${mailBadge()}</i>`:""}</button><button class="iconbtn" data-act="settings" aria-label="ตั้งค่า">${icon("gear")}</button></div>
    <button class="btn primary endweek ${weekTodo().length?"":"ready"}" data-act="endweek">${weekTodo().length?`จบสัปดาห์ ▸ <small>(เหลือ ${weekTodo().length} อย่าง)</small>`:"พร้อมแล้ว · จบสัปดาห์ ▸"}</button>
  </div>
  <nav class="tabs" aria-label="เมนู">${TABS.map(([k,t])=>`<button data-act="tab" data-v="${k}" ${UI.tab===k?'aria-current="page"':""}>${icon(k)}<span>${t}</span>${dots[k]?'<i class="dot" aria-hidden="true"></i>':""}</button>`).join("")}</nav></header>
  <main class="pxscroll" data-sk="main-${UI.tab}">${({home:homeHTML,train:trainHTML,fights:fightsHTML,people:peopleHTML,camp:campHTML})[UI.tab]()}</main>`;}

const DONE_LINES=["สัปดาห์นี้จัดการครบแล้ว กดจบสัปดาห์ได้เลย","เรียบร้อยหมดแล้ว ไปพักกินข้าวเหนียวหมูปิ้งกันเถอะ แล้วค่อยจบสัปดาห์","ทุกอย่างพร้อม ครูไม่มีอะไรจะติแล้ว จบสัปดาห์ได้","งานครบ ซ้อมครบ วางแผนครบ ไปจบสัปดาห์กันเลย"];
const pickDone=()=>DONE_LINES[G.week%DONE_LINES.length];
function coachTips(force){const T=[],R=roster(G);if(!coachOn()&&!force)return T;
  for(const f of R){const b=G.bookings.find(x=>x.a===f.id);
    if(f.injury)T.push({p:9,t:`${f.name}บาดเจ็บอีก ${f.injury} สัปดาห์ ร่างกายพักเองอัตโนมัติ อย่าเพิ่งรับไฟต์`});
    else if(f.fatigue>=52&&f.plan.preset!=="rest"&&!trLocked(f))T.push({p:9,t:`${f.name} ล้า ${Math.round(f.fatigue)} แล้ว สัปดาห์นี้ให้พักฟื้นเถอะ`,act:{k:"setrest",id:f.id,label:"ไปหน้าฝึก"}});
    if(b&&b.week-G.week<=1&&f.plan.preset!=="prep"&&!f.injury&&!trLocked(f))T.push({p:7,t:`${f.name}มีไฟต์สัปดาห์ ${b.week} กับ${G.F[b.b].name} เปลี่ยนเป็นเตรียมไฟต์ดีไหม`,act:{k:"setprep",id:f.id,label:"ไปหน้าฝึก"}});
    if(b&&scouted(b.b)){const cp=counterPreset(G.F[b.b]);if(cp&&f.plan.preset!==cp&&b.week-G.week>1&&!trLocked(f))T.push({p:4,t:`คู่ชกของ${f.name}${COUNTER_WHY[cp]} ฝึก "${PRESETS[cp].name}" แก้ทางจะได้โบนัสวันชก`,act:{k:"setprep",id:f.id,label:"ไปตั้งโปรแกรม"}});}
    if(b&&!scouted(b.b)&&G.cash>=scoutCost())T.push({p:5,t:`ยังไม่ได้ดูเทป${G.F[b.b].name} คู่ชกของ${f.name} ดูก่อนจะได้รู้ทางแก้`,act:{k:"tab",v:"fights",label:"ไปดูเทป"}});
    if(b&&!b.planSet)T.push({p:5,t:`ยังไม่ได้ตั้งแผนไฟต์ของ${f.name} (สัปดาห์ ${b.week})`,act:{k:"tab",v:"train",label:"ไปตั้งแผน"}});
    if(skReady(f))T.push({p:6,t:`${f.name}มีแต้มสกิล ${f.sp} แต้ม ไปเลือกสกิลได้เลย`,act:{k:"fighter",id:f.id,v:"skill",label:"เลือกสกิล"}});
    if(f.plan.preset==="rest"&&f.fatigue<20&&!f.injury&&!trLocked(f))T.push({p:7,t:`${f.name}หายล้าแล้ว (ล้า ${Math.round(f.fatigue)}) ยังตั้งเป็นพักฟื้นอยู่ ถ้าพักต่อจะเสียสัปดาห์ซ้อมไปเปล่า ๆ`,act:{k:"tab",v:"train",label:"ไปตั้งโปรแกรม"}});
    if(f.plan.intensity==="heavy"&&f.fatigue>50)T.push({p:5,t:`${f.name}ซ้อมหนักต่อเนื่อง ระวังบาดเจ็บนะ`});}
  if(!G.bookings.some(b=>G.F[b.a].camp==="player")&&G.offers.length)T.push({p:5,t:"ยังไม่มีไฟต์ในตาราง ครูดูข้อเสนอให้แล้ว มีสีบอกว่าคู่ไหนง่ายหรือเสี่ยง",act:{k:"tab",v:"fights",label:"ดูข้อเสนอ"}});
  if(G.loan>0)T.push({p:G.cash>=G.loan?8:4,t:`ยังติดเงินกู้หมวกทอง ${fmt(G.loan)} ดอกขึ้น 10% ทุก 4 สัปดาห์ และพวกมันจะมาวนเวียนแถวตลาดบ่อยขึ้น${G.cash>=G.loan?" ตอนนี้มีเงินพอคืนแล้วนะ":""}`,act:{k:"tab",v:"camp",label:"ไปหน้าการเงิน"}});
  if(loanOk(G))T.push({p:11,t:"เงินจะไม่พอจ่ายแล้ว ถ้าจำเป็นจริง ๆ ยังมีเงินกู้ด่วน แต่ครูไม่ชอบเลย ดอกแพงและพวกหมวกกันน็อกจะมาวุ่นวาย",act:{k:"loan",label:"ดูเงินกู้ด่วน"}});
  if(weeksLeft()<=6){if(true)T.push({p:10,t:`⚠ ถ้ารายรับเท่าเดิม เงินจะหมดในราว ${weeksLeft()} สัปดาห์! รับไฟต์ สอนคลาสพิเศษ หรือลดค่าจ้าง`,act:{k:"tab",v:"fights",label:"ดูไฟต์"}});}
  else if(weeksLeft()<=10)T.push({p:7,t:`ครูเตือนไว้ก่อน: ถ้ารายรับเท่านี้ เงินจะหมดในราว ${weeksLeft()} สัปดาห์ ลองรับไฟต์เพิ่มหรือดูจดหมายที่มีเงินรออยู่`,act:{k:"tab",v:"fights",label:"ดูข้อเสนอ"}});
  else if(weeklyNet(G)<0){const full=studentDemand(G)>studentCap(G);T.push({p:6,t:full?`รายจ่ายมากกว่ารายรับ ${fmt(-weeklyNet(G))}/สัปดาห์ คนอยากเรียนเกินที่รับไหว จ้างผู้ช่วยครูหรือขยายลานสอนจะได้เงินเพิ่ม`:`รายจ่ายมากกว่ารายรับ ${fmt(-weeklyNet(G))}/สัปดาห์ ลองสอนคลาสพิเศษหรือรับไฟต์เพิ่ม`,act:full?{k:"tab",v:"camp",sub:"staff",label:"ไปจ้างผู้ช่วยครู"}:{k:"campacts",label:"เลือกกิจกรรมค่าย"}});}
  if(G.cash<0)T.push({p:10,t:`เงินติดลบมา ${G.negWeeks} สัปดาห์ ถ้าติดลบ 4 สัปดาห์จนเกิน ฿10,000 ค่ายจะล้มละลาย`});
  if(studentDemand(G)>studentCap(G)+2)T.push({p:5,t:`นักเรียนเต็มค่ายแล้ว ยังมีคนอยากเรียนอีก ${studentDemand(G)-studentCap(G)} คน อัปลานสอนคอร์สจะรับเพิ่มได้ทีละ 3 คน`,act:{k:"tab",v:"camp",sub:"fac",label:"ไปอัปลานสอน"}});
  {const un=(G.losses||[]).filter(l=>!l.watched&&G.F[l.b]&&G.F[l.b].camp!=="quest"&&G.week-l.wk<=6);if(un.length)T.push({p:4,t:`ยังไม่ได้ดูเทปไฟต์ที่${G.F[un[un.length-1].a].name}แพ้ ดูกับทีมแล้วได้ EXP และรู้ทางคู่ชกคนนั้น`,act:{k:"lossrev",label:"ทบทวนไฟต์"}});}
  if(G.disaster&&G.week<G.disaster.until)T.push({p:9,t:`${G.disaster.name}ยังไม่หาย นักเรียนมาเรียนได้${G.disaster.inc?"แค่ครึ่งเดียว":"ไม่ได้เลย"} อีก ${G.disaster.until-G.week} สัปดาห์ รับไฟต์ช่วยประคองเงินไปก่อน`,act:{k:"tab",v:"fights",label:"ดูข้อเสนอ"}});
  if(dmOfferOn(G))T.push({p:8,t:"โปรโมเตอร์ชวนลงศึก Death Match 8 คนข้ามรุ่น ชกรวดเดียวจบในสัปดาห์นี้ แชมป์รับ ฿40,000!",act:{k:"tab",v:"fights",label:"ไปดูข้อเสนอ"}});
  if(!G.campUsed)T.push({p:3,t:"ยังไม่ได้เลือกกิจกรรมค่ายสัปดาห์นี้",act:{k:"campacts",label:"เลือกกิจกรรม"}});
  if(!G.freeUsed)T.push({p:2,t:"อย่าลืมใช้เวลาว่างกับนักมวย ความสนิทช่วยเรื่องกำลังใจ",act:{k:"tab",v:"people",label:"ไปหาตัวละคร"}});
  if(G.flags.maliRecruit&&G.F.mali.camp==="free")T.push({p:6,t:"มะลิพร้อมเซ็นสัญญาแล้ว",act:{k:"tab",v:"camp",sub:"staff",label:"ไปเซ็นสัญญา"}});
  if(G.flags.rinRecruit&&G.F.rin.camp==="free")T.push({p:6,t:"รินพร้อมเซ็นสัญญาแล้ว",act:{k:"tab",v:"camp",sub:"staff",label:"ไปเซ็นสัญญา"}});
  if(R.some(f=>!f.injury&&!trLocked(f)))T.push({p:4,t:"ยังมีนักมวยที่ยังไม่ได้ยืนยันโปรแกรมฝึกสัปดาห์นี้",act:{k:"tab",v:"train",label:"ไปหน้าฝึก"}});
  // v1.21: once everything is handled, say so instead of repeating old advice
  if(!T.length&&!weekTodo().length)T.push({p:1,t:pickDone(),act:{k:"endweek",label:"จบสัปดาห์"}});
  if(!T.length){const f=R[0];const w=RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0];T.push({p:1,t:`จุดอ่อนของ${f.name}ตอนนี้คือ${w[0]} ลองเสริมด้านนี้ดู`});}
  return T.sort((a,b)=>b.p-a.p);}
function adviseCached(a,b,rounds){const k=`${G.week}_${a}_${b}_${rounds}`;if(!UI.advCache[k])UI.advCache[k]=advise(G,a,b,rounds,30);return UI.advCache[k];}
// v1.14: offer advice reads fatigue, schedule, tape and money, not just the sim win-rate
function offerTipHTML(o){const me=G.F[o.a],op=G.F[o.b];const A=adviseCached(o.a,o.b,o.rounds||3);const v=verdictOf(A.bestRate);const L=[];
  const pct=Math.round(A.bestRate*20)*5;L.push(`โอกาสชนะราว ${pct}% ถ้าเตรียมแผนถูก`);
  const pf=Math.round(projFatigue(me));if(me.injury)L.push(`${me.name}ยังเจ็บอยู่ ${me.injury} สัปดาห์ เสี่ยงเจ็บซ้ำ`);else if(pf>55)L.push(`ตอนนี้ล้าราว ${pf} ถ้ารับ ควรลดความหนักการฝึกก่อนวันชก`);
  const near=G.bookings.find(b=>b.a===me.id&&Math.abs(b.week-o.week)<=2);if(near)L.push(`มีไฟต์ สด.${near.week} อยู่แล้ว ชกถี่ไปร่างกายจะไม่ฟื้น`);
  if(!scouted(op.id)&&op.camp!=="quest")L.push(`ยังไม่ได้ดูเทป ไม่รู้จุดอ่อน${op.name}`);
  if(op.camp==="rival")L.push("ชนะคนของพยัคฆ์ทอง ชื่อเสียงขึ้นมาก");
  if(G.cash<8000)L.push(`เงินตึงอยู่ ค่าตัว ${fmt(o.lose)} ได้แน่ แม้แพ้`);
  const go=me.injury||near?"ครูว่ารอไฟต์หน้าดีกว่า":A.bestRate>=.6?"รับได้ เก็บชัยง่าย ๆ":A.bestRate>=.4?"รับได้ ถ้าซ้อมแก้ทางก่อน":"ยังเร็วไป เว้นแต่อยากลุ้นค่าตัวสูง";
  return `<h2>ครูแดงว่าไง</h2><div class="meta">${esc(me.name)} vs ${esc(op.name)} · <b class="${v.c}t">${v.t}</b></div>
   <ul class="fp-list">${L.map(t=>`<li>${t}</li>`).join("")}</ul><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>${go}</b></span></div>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">เข้าใจแล้ว</button></div>`;}
function verdictOf(rate){return rate>=.6?{c:"green",t:"อ่อนกว่า",say:"ชนะได้ไม่ยาก แต่ค่าตัวน้อย"}:rate>=.4?{c:"gold",t:"สูสี",say:"น่าสนใจ ผลอยู่ที่การเตรียมตัว"}:{c:"red",t:"เก่งกว่า",say:"เสี่ยง แต่ค่าตัวสูงและได้ EXP เยอะ"};}

function rinNoteHTML(){const n=G.rinNote;if(!n||!G.F.rin||G.F.rin.camp!=="player")return "";
  return `<button class="px rinnote" data-act="rinread"><img src="${faceSrc("rin")}" alt=""><span><b>รินส่งรายงานมา</b><small>สรุป 3 สัปดาห์ · แตะเพื่ออ่าน</small></span><i class="tdot2"></i></button>`;}
// v1.51: pets on the home card — tap once a week to play
function petsRowHTML(){const P=G.pets||[];if(!P.length)return "";return `<div class="petrow">${P.map((p,i)=>{const done=p.wk===G.week;
  return `<span class="petg"><button class="petchip ${done?"done":""}" data-act="petplay" data-v="${i}" ${done?"disabled":""} title="${esc(PETS[p.k].eff)}"><img class="peti" src="${petIcon(p.k)}" alt=""><span><b>${esc(p.name)}</b><small>${done?"เล่นแล้ว ✓":"เล่นด้วย"}</small></span></button><button class="btn sm petren" data-act="petren" data-v="${i}" aria-label="ตั้งชื่อ${esc(p.name)}ใหม่">ตั้งชื่อ</button></span>`;}).join("")}</div>`;}
function homeHTML(){const R=roster(G);
  let guide="";
  if(coachOn()&&G.guideHidden!==G.week&&G.week<=2&&!(G.season>1)){
    guide=`<section class="px guide"><img class="gface" src="${faceSrc("coach")}" alt="ครูแดง"><div class="gtxt"><b>ครูแดง · สิ่งที่ควรทำในหนึ่งสัปดาห์</b>${tutorialHTML()}</div><button class="xbtn" data-act="hideguide" aria-label="ปิดคำแนะนำสัปดาห์นี้">✕</button></section>`;}
  else if(coachOn()&&G.guideHidden!==G.week){const T=coachTips();const i=UI.tipIdx%T.length;const t=T[i];
    guide=`<section class="px guide"><img class="gface" src="${faceSrc("coach")}" alt="ครูแดง"><div class="gtxt"><b>ครูแดง</b><p>${esc(t.t)}</p>
      <div class="gact">${t.act?`<button class="btn sm gold" data-act="tipact" data-k="${t.act.k}" data-id="${t.act.id||""}" data-v="${t.act.v||""}">${t.act.label}</button>`:""}${T.length>1?`<button class="btn sm" data-act="tipnext">ถัดไป ${i+1}/${T.length} ▸</button>`:""}</div></div>
      <button class="xbtn" data-act="hideguide" aria-label="ปิดคำแนะนำสัปดาห์นี้">✕</button></section>`;}
  // v1.39: while Kru Daeng is on leave, Kati "runs" the camp and it shows
  if(G.coachAway&&G.week<G.coachAway&&G.guideHidden!==G.week&&rinIn()){const T=coachTips(true).filter(t=>t.p>=4);const t=T.length?T[G.week%Math.min(2,T.length)]:null;
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("rin","happy")}" alt="ริน"><div class="gtxt"><b>ข้อสังเกตของริน · ครูแดงกลับสัปดาห์ ${G.coachAway}</b><p>${t?esc("ตามข้อมูลที่ฉันเก็บไว้: "+t.t):"ข้อมูลสัปดาห์นี้ปกติดีค่ะ ไม่มีอะไรน่ากังวล"}</p><p class="meta">ไม่มีครูช่วยตัดสินใจ รินบอกได้แค่ข้อสังเกต</p></div><button class="xbtn" data-act="hideguide" aria-label="ปิด">✕</button></section>`;}
  else if(G.coachAway&&G.week<G.coachAway&&G.guideHidden!==G.week){const KS=["ครูแดงไม่อยู่ หนูให้ทุกคนวิ่งเพิ่มคนละสามรอบค่ะ …หนูก็วิ่งด้วยนะ","หนูลองเป่านกหวีดแบบครูแดงแล้ว เสียงออกมาเหมือนเป็ดเลยค่ะ","ครูแดงโทรมาถามว่าทุกคนกินข้าวหรือยัง วันละสี่รอบแล้วค่ะ","มะลิแอบเปลี่ยนเพลงในห้องซ้อมเป็นเพลงลูกทุ่ง หนูไม่ได้ห้าม… เพราะมันมันส์ดี","ตารางซ้อมของครูแดงติดอยู่ที่ผนัง แต่ลายมือครูอ่านไม่ออกเลยค่ะ"];
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("kati","happy")}" alt="กะทิ"><div class="gtxt"><b>กะทิ (รักษาการครูแดง · ครูกลับสัปดาห์ ${G.coachAway})</b><p>${esc(KS[G.week%KS.length])}</p><p class="meta">ช่วงนี้ไม่มีคำแนะนำจากครู ต้องตัดสินใจเองทั้งหมด</p></div><button class="xbtn" data-act="hideguide" aria-label="ปิด">✕</button></section>`;}
  const lv=campLevel(G);
  return `${rinNoteHTML()}<div class="homegrid">${(()=>{const r=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
     return r.length?`<button class="px newfighter" data-act="tab" data-v="camp" data-sub="staff"><span class="newb">NEW!</span>${r.map(([id])=>`<img src="${faceSrc(id,"happy")}" alt="">`).join("")}<span><b>${r.map(([id])=>esc(G.F[id].name)).join(" และ ")} อยากเข้าค่าย</b><small>แตะเพื่อดูสัญญา</small></span><span class="chev">▸</span></button>`:"";})()}<section class="px camp-wrap"><div class="cvbox"><canvas class="campcv" width="640" height="360" data-camp="1" aria-label="ภาพรวมค่ายมวยศิริชัย"></canvas>
    ${goalHidden()?`<button class="goal ov mini" data-act="goaltog" aria-label="แสดงเป้าหมาย">เป้าหมาย ▾</button>`:`<button class="goal ov" data-act="goaltog" aria-label="ซ่อนเป้าหมาย">${goalText()}<span class="gx">▴ ซ่อน</span></button>`}</div>
    ${G.campUsed?`<button class="campact done" data-act="campacts"><span class="ci">✓</span><span><small>กิจกรรมค่ายสัปดาห์นี้</small><b>${esc(CAMP_ACTIONS[G.campUsed].name)}</b></span></button>`
      :`<button class="campact" data-act="campacts"><span class="ci"></span><span><small>กิจกรรมค่ายสัปดาห์นี้ · ยังไม่ได้เลือก</small><b>เลือกกิจกรรมค่าย</b></span><span class="chev">▸</span></button>`}
    ${petsRowHTML()}
    <div class="camp-info"><button class="cinfo" data-act="tab" data-v="camp"><small>ระดับค่าย</small><b>Lv.${lv} ${CAMP_LV_NAME[lv]}</b></button><button class="cinfo" data-act="studinfo"><small>นักเรียน</small><b>${students(G)}/${studentCap(G)} คน</b></button></div></section>
   <div class="side">${guide}<div class="fgrid">${R.map(fighterChip).join("")}</div></div></div>`;}
function fighterMini(f){const c=condition(f);const nb=nextBooking(f);
  return `<button class="px fmini" data-act="fighter" data-id="${f.id}" aria-label="ดูสถานะและข้อมูล ${esc(f.name)}">${faceImg(f)}<b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b>
    <div class="minis"><span>พร้อม</span>${mini(c,condColor(c))}<span>ล้า</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <span class="meta">${f.injury?'<span class="redt">บาดเจ็บ</span>':nb?`ชก สด.${nb.week}`:"ว่าง"}${skReady(f)?' · <span class="goldt">สกิล!</span>':""}</span><span class="fmore">▸</span></button>`;}
function fighterChip(f){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id);
  return `<button class="px fchip" data-act="fighter" data-id="${f.id}" aria-label="ดูสถานะและข้อมูล ${esc(f.name)}"><span class="fmore">▸</span>${faceImg(f)}<div class="fci"><div class="nm">${esc(f.name)} <span class="lv">Lv.${f.lvl}</span>${f.sp>0?'<span class="pill gold">สกิล</span>':""}${f.injury?'<span class="pill red">เจ็บ</span>':""}</div>
    <div class="meta">${f.injury?"พักรักษาตัว":PRESETS[f.plan.preset].name} · ${rec(f)}</div>
    <div class="minis"><span>พร้อม</span>${mini(c,condColor(c))}<span>ล้า</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <div class="meta">${nb?`ไฟต์ สด.${nb.week} vs ${esc(G.F[nb.b].name)}`:"ยังไม่มีไฟต์"}</div></div></button>`;}

function projFatigue(f){return fatigueAfter(G,f,f.plan.preset,f.plan.intensity);}
function attrsHTML(f,showGain){return `<div class="attrs">${ATTR_GROUPS.map(([g,ks])=>`<h4>${g}</h4>`+ks.map(k=>{const v=f.a[k],gn=f.gains&&f.gains[k];
  return `<div class="attr"><span>${ATTR_LABEL[k]}</span><i style="--v:${v/20*100}%"></i><b class="num">${v.toFixed(1)}${showGain&&gn>=.05?`<span class="up">+${gn.toFixed(1)}</span>`:""}</b></div>`;}).join("")).join("")}</div>`;}
function presetPicker(f){return `<div class="tgrid">${Object.entries(PRESETS).map(([k,p])=>`<button data-act="preset" data-f="${f.id}" data-v="${k}" ${trLocked(f)?"disabled":""} aria-pressed="${f.plan.preset===k}" title="${p.desc}">${p.name}</button>`).join("")}</div>
  <div class="tgrid three" role="group" aria-label="ความหนัก">${Object.entries(INTENSITY).map(([k,i])=>`<button data-act="intensity" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.intensity===k}">${i.name}</button>`).join("")}</div>`;}
const AX_PRESET={"หมัด":"punch","เตะ":"kick","เข่า-ศอก":"knee","ป้องกัน":"defense","ร่างกาย":"cond","จิตใจ":"defense"};
// v1.14: advice follows the engine's real bonuses (prep in fight week, counter preset before it) and picks a safe intensity
function projF(f,p,i){return fatigueAfter(G,f,p,i);}
function safeInt(f,p,cap){for(const i of ["heavy","normal","light"])if(INTENSITY[i]&&projF(f,p,i)<=cap)return i;return "light";}
function trainAdvice(f){const b=nextBooking(f);const wk=b?b.week-G.week:99;const op=b?G.F[b.b]:null;const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};
  if(f.injury)return {p:"rest",i:"light",why:`ยังเจ็บอีก ${f.injury} สัปดาห์ พักก่อน`};
  if(f.fatigue>=52||projF(f,"cond","light")>68)return {p:"rest",i:"light",why:`ล้า ${Math.round(f.fatigue)} แล้ว ฝืนต่อเสี่ยงเจ็บ พักสัปดาห์นี้`};
  if(b&&wk===0)return {p:"prep",i:safeInt(f,"prep",45),why:`ขึ้นชกสัปดาห์นี้ "เตรียมไฟต์" ได้โบนัสความพร้อม${f.counterPrep?" และยังเก็บโบนัสแก้ทางไว้":""}`};
  // v1.19.2: the week before a fight, stepping into the ring fresh matters more than one more hard session
  if(b&&wk===1&&projF(f,"prep","light")>30)return {p:"rest",i:"light",why:`สัปดาห์หน้าขึ้นชกแล้ว ล้า ${Math.round(f.fatigue)} ยังสูง ขึ้นเวทีตอนล้าแรงจะหมดเร็ว พักให้สดก่อน`};
  if(b&&wk<=2){const cp=counterPreset(op),cap=wk===1?30:50;
    if(scouted(op.id))return {p:cp,i:safeInt(f,cp,cap),why:`${op.name}${COUNTER_WHY[cp]} ซ้อม "${PRESETS[cp].name}" ได้โบนัสแก้ทาง แล้วสัปดาห์ชกค่อยเตรียมไฟต์`};
    const [w,p]=weakPick(f);
    return {p,i:safeInt(f,p,cap),why:`ยังไม่รู้ทาง${op.name} ดูเทปก่อนจะซ้อมแก้ทางได้ ระหว่างนี้เสริม${w[0]}`};}
  const [w,p,rot]=weakPick(f);const i=safeInt(f,p,b?58:65);
  // v1.18: no fight close → coach lays out two roads (own style vs patch the hole) and lets the player choose
  const ms=mainStyle(f);if(ms!==p){const si=safeInt(f,ms,b?58:65);
    return {p,i,two:{weak:{p,i,w:w[0],v:w[1],rot},strong:{p:ms,i:si}},why:`ช่วงนี้ไม่มีไฟต์ใกล้ ๆ มีสองทางให้เลือก ตัดสินใจเองนะ`};}
  return {p,i,why:rot?`ฝึก "${PRESETS[f.plan.preset].name}" ติดกันมาหลายสัปดาห์แล้ว เปลี่ยนไปเสริม${w[0]}บ้าง${i==="heavy"?" ยังสดอยู่ ซ้อมหนักได้":""}`:`จุดอ่อนตอนนี้คือ${w[0]} เสริมก่อน${i==="heavy"?" ยังสดอยู่ ซ้อมหนักได้":""}`};}
// v1.17: pick the preset that actually trains the weak spot (knee vs elbow), and rotate after 2 weeks on the same thing
function weakPick(f){const a=f.a;const ax=RADAR_AX.map(([n,fn])=>[n,fn(a)]).sort((x,y)=>x[1]-y[1]);
  const pre=n=>n==="เข่า-ศอก"?((a.knee+a.clinch)/2<=a.elbow?"knee":"elbow"):n==="จิตใจ"?"defense":AX_PRESET[n];
  let k=0;const streak=(f.trainLog||[]).slice(-2);if(streak.length===2&&streak.every(x=>x===pre(ax[0][0])))k=1;
  return [ax[k],pre(ax[k][0]),k===1];}
function planTip(f){const b=nextBooking(f);if(!b||f.injury)return "";const op=G.F[b.b];
  if(!scouted(op.id))return `<div class="kv-row"><span>แผนไฟต์ สด.${b.week}</span><b class="dim">ดูเทป${op.name}ก่อน ครูถึงบอกแผนได้</b></div>`;
  const A=adviseCached(f.id,op.id,b.rounds||3);const a=op.a;const tg=a.stamina<=Math.min(a.foot,a.guard)?"body":a.foot<=a.guard?"legs":"head";
  return `<div class="kv-row"><span>แผนไฟต์ สด.${b.week}</span><b class="goldt">${PLANS[A.best].name} · ${TGT[tg]}</b></div><p class="meta">${op.name}จุดอ่อนคือ${oppIntel(op).weak} · สัปดาห์ชกใช้ "เตรียมไฟต์" ได้โบนัสความพร้อม</p>`;}
function masteryLine(f){const s=mainStyle(f),v=styleVal(f,s),m=mastery(f);
  return m?`เชี่ยวชาญสาย${STYLE_NAME[s]} ${Math.round(m*100)}%`:`สาย${STYLE_NAME[s]} ${v.toFixed(1)}/${MASTERY_AT} ยังไม่ถึงขั้นเชี่ยวชาญ`;}
function twoRoads(f,T){const s=T.strong,w=T.weak,m=mastery(f),v=styleVal(f,s.p);const cur=f.plan.preset;
  const pro=m>=1?`เชี่ยวชาญเต็มขั้นแล้ว ฝึกต่อค่าก็ยังขึ้นเรื่อย ๆ`:m?`อาวุธหลักยิ่งแม่นและแรงขึ้น (ตอนนี้ ${Math.round(m*100)}%)`:`อีก ${(MASTERY_AT-v).toFixed(1)} แต้มจะปลด "เชี่ยวชาญสาย" ${STYLE_NAME[s.p]}แม่นและแรงขึ้น`;
  return `<div class="roads">
   <div class="road ${cur===s.p?"on":""}"><b>ทางที่ 1 · เสริมจุดแข็งตามสาย</b><span class="rp">${planName(s.p,s.i)}</span>
    <span class="up">+ ${pro}</span><span class="up">+ สายตัวเองฝึกแล้วค่าตันช้ากว่า</span><span class="dn">− ${esc(w.w)}ยังเป็นช่องให้คู่ชกเล่น</span></div>
   <div class="road ${cur===w.p?"on":""}"><b>ทางที่ 2 · อุดจุดอ่อน</b><span class="rp">${planName(w.p,w.i)}</span>
    <span class="up">+ ${esc(w.w)}ต่ำสุด (${w.v.toFixed(1)}) ค่าต่ำฝึกขึ้นไว</span><span class="up">+ คู่ชกหาช่องโหว่ยากขึ้น</span><span class="dn">− อาวุธหลักไม่คมขึ้น</span></div></div>`;}
const DRILL_ROW={punch:"punch",elbow:"punch",defense:"punch",balanced:"punch",kick:"knee",knee:"knee",cond:"knee"};
const DRILL_Q={perfect:"เป๊ะ!",good:"ดี",ok:"พอใช้"};
function drillHTML(){const D=UI.drill;if(!D)return "";const f=G.F[D.id],P=PRESETS[f.plan.preset];
  const at=Object.keys(P.w).map(k=>ATTR_LABEL[k]).filter(Boolean).slice(0,4).join(" · ");
  const res=D.done?`<div class="dres"><b class="${D.bonus>=8?"goldt":""}">${D.bonus>=10?"ซ้อมได้ยอดเยี่ยม!":D.bonus>=6?"ซ้อมได้ดี":"ซ้อมผ่านไปได้"}</b>
     <span>โบนัสผลการฝึกสัปดาห์นี้ <b class="goldt">+${D.bonus}%</b></span><span class="meta">${esc(planName(f.plan.preset,f.plan.intensity))} → ${at}</span>
     <div class="mfoot"><button class="btn primary" data-act="dskip">ตกลง</button></div></div>`
   :`<div class="dctl"><span class="dpips">${Array.from({length:D.need},(_,i)=>`<i class="${D.res[i]||""}">${D.res[i]?DRILL_Q[D.res[i]]:""}</i>`).join("")}</span>
     <button class="btn primary big dtap" data-act="dtap" ${D.taps>=D.need?"disabled":""}>${DRILL_ROW[f.plan.preset]==="knee"?"เตะ!":"ต่อย!"}</button><button class="btn sm ghost" data-act="dskip">ข้าม</button></div>`;
  return `<h2>ซ้อม${esc(P.name)} · ${esc(f.name)}</h2><p class="meta">กดให้${esc(f.name)}${DRILL_ROW[f.plan.preset]==="knee"?"เตะ":"ต่อย"}กระสอบ ${D.need} ครั้ง ลุ้นโบนัสการฝึก</p>
   <div class="drillstage" style="background-image:url(${ASSET}${gymBg()})"><canvas width="360" height="200" data-drill="${f.id}"></canvas></div>${res}`;}
function adviceHTML(id){const f=G.F[id],A=trainAdvice(f);const same=f.plan.preset===A.p&&(A.p==="rest"||f.plan.intensity===A.i);
  if(A.two)return `<h2>ครูแดงแนะนำ · ${esc(f.name)}</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span>${esc(A.why)}</span></div>
   <div class="kv-row"><span>ตอนนี้</span><b>${planName(f.plan.preset,f.plan.intensity)}</b></div>${twoRoads(f,A.two)}
   ${planTip(f)}<p class="meta">${masteryLine(f)} · ครูแค่ให้ความเห็น ตัดสินใจเองนะ</p>
   <div class="mfoot roadbtns"><span class="meta">ตั้งโปรแกรมเองได้ที่ปุ่ม "โปรแกรมฝึก"</span><button class="btn primary" data-act="closeModal">ปิด</button></div>`;
  return `<h2>ครูแดงแนะนำ · ${esc(f.name)}</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span>${esc(A.why)}</span></div>
   <div class="kv-row"><span>ตอนนี้</span><b>${planName(f.plan.preset,f.plan.intensity)}</b></div>
   <div class="kv-row"><span>ครูแนะนำ</span><b class="goldt">${planName(A.p,A.i)}</b></div>
   ${planTip(f)}<p class="meta">${same?"ตอนนี้ตั้งตรงกับที่ครูคิดไว้แล้ว":"ครูแค่ให้ความเห็น ตัดสินใจเองนะ"}</p>
   <div class="mfoot roadbtns"><button class="btn primary" data-act="closeModal">ปิด</button></div>`;}
const trLocked=f=>f?f.lockWeek===G.week:false;
const planName=(p,i)=>PRESETS[p].name+(p==="rest"||!INTENSITY[i]?"":" · "+INTENSITY[i].name);
function trainHTML(){const R=roster(G);if(!R.length)return "";
  // v1.13: each fighter gets her own card with the big training animation; programmes are picked in a sheet, then the week is locked in
  return `<div class="tcards">${R.map(f=>tcard(f,trLocked(f))).join("")}</div>`;}
function tcard(f,L){const pf=projFatigue(f),rest=f.plan.preset==="rest";const tired=!f.injury&&f.fatigue>=55&&!rest;
  return `<section class="px tcard ${L?"locked":""}">${!L&&!f.injury?'<i class="tdot" aria-label="ยังไม่ได้ยืนยันโปรแกรม"></i>':""}<div class="tc-anim" role="button" tabindex="0" data-act="fighter" data-id="${f.id}" data-v="train" aria-label="ข้อมูล ${esc(f.name)}" style="background-image:url(${ASSET}${gymBg()})"><canvas width="220" height="190" data-sprite="${f.id}" data-floor="1"></canvas>
     <span class="tr-pre">${f.injury?"พักรักษา":PRESETS[f.plan.preset].name}</span></div>
   <div class="tc-body"><div class="tc-h"><b class="nm">${esc(f.name)}</b><span class="lv">Lv.${f.lvl}</span>${prepLine(f)}</div>
    <div class="fatg"><span>ล้า <b class="num">${Math.round(f.fatigue)}</b> → <b class="num">${Math.round(pf)}</b></span><i class="fgbar" style="--now:${clamp(f.fatigue,0,100)}%;--next:${clamp(pf,0,100)}%;--bc:${pf>70?"var(--red)":pf>55?"var(--warn)":"var(--green)"}"><s></s></i></div>
    ${tired?`<p class="warnchip">ล้ามาก ควรพักฟื้นสัปดาห์นี้</p>`:""}
    ${skReady(f)?`<button class="spchip" data-act="fighter" data-id="${f.id}" data-v="skill">★ อัปสกิลได้</button>`:""}<div class="tc-prog"><span class="pill ${L?"":"gold"}">${f.injury?"พักรักษาตัว":PRESETS[f.plan.preset].name+(rest?"":" · "+INTENSITY[f.plan.intensity].name)}</span></div>
    ${f.injury?"":`<div class="tc-btns">${L?"":`<button class="btn sm" data-act="tpick" data-id="${f.id}">โปรแกรมฝึก</button>`}${coachOn()&&!L?`<button class="btn sm" data-act="advice" data-id="${f.id}">คำแนะนำครู</button>`:""}
     ${L?`<span class="tc-ok">✓ ยืนยันโปรแกรมแล้ว</span>`:`<button class="btn sm gold tc-go" data-act="tlock" data-id="${f.id}">ยืนยันโปรแกรม</button>`}</div>`}
</div></section>`;}
// programme sheet: 4 columns, intensity hidden for rest
function tpickHTML(id){const f=G.F[id],rest=f.plan.preset==="rest";
  return `<h2>โปรแกรมฝึก · ${esc(f.name)}</h2><div class="tgrid four">${Object.entries(PRESETS).map(([k,p])=>`<button data-act="preset" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.preset===k}" title="${esc(p.desc)}">${p.name}</button>`).join("")}</div>
   <p class="meta tdesc">${esc(PRESETS[f.plan.preset].desc)}</p>
   ${rest?`<p class="meta">พักฟื้นไม่มีหนัก-เบา ร่างกายได้พักเต็มที่</p>`:`<h3>ความหนัก</h3><div class="tgrid three">${Object.entries(INTENSITY).map(([k,i])=>`<button data-act="intensity" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.intensity===k}">${i.name}</button>`).join("")}</div>`}
   <div class="mfoot"><button class="btn primary" data-act="closeModal">เลือกแล้ว</button></div>`;}
const TGT={head:"เล่นหัว",body:"เล่นลำตัว",legs:"เตะขา"};
function nextBooking(f){return G.bookings.filter(b=>b.a===f.id).sort((x,y)=>x.week-y.week)[0];}
// fight plan folds to one line; the sheet holds the choices and a confirm
function prepLine(f){const b=nextBooking(f);if(!b||f.injury)return "";const op=G.F[b.b];
  return `<button class="fpbtn ${b.planSet?"set":""}" data-act="fplan" data-id="${b.id}" aria-label="แผนไฟต์ สัปดาห์ ${b.week} พบ ${esc(op.name)}"><b>${b.planSet?"✓ แผนไฟต์":"ตั้งแผนไฟต์"}</b><small>สด.${b.week}</small></button>`;}
function fplanHTML(bid){const b=G.bookings.find(x=>x.id===bid);if(!b)return "";const f=G.F[b.a],op=G.F[b.b];const pl=UI.fpDraft.plan,tg=UI.fpDraft.target;const cp=scouted(op.id)?counterPreset(op):null;
  return `<h2>แผนไฟต์ · ${esc(f.name)} vs ${esc(op.name)}</h2>
   <div class="fp-h">${scouted(op.id)?`<span class="pill">${styleOf(op.a)}</span>${(()=>{const I=oppIntel(op);return `<span class="meta">ถนัด ${I.top}</span>`;})()}`:`<button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>ดูเทป ${fmt(scoutCost())}</button><span class="meta">ดูเทปก่อนจะรู้จุดอ่อน</span>`}</div>
   <h3>แผน</h3><div class="tgrid three">${Object.entries(PLANS).map(([k,p])=>`<button data-act="fpd" data-k="plan" data-v="${k}" aria-pressed="${pl===k}">${p.name}</button>`).join("")}</div><p class="meta tdesc">${esc(PLANS[pl].desc)}</p>
   <h3>เป้าหมาย</h3><div class="tgrid three">${Object.entries(TGT).map(([k,t])=>`<button data-act="fpd" data-k="target" data-v="${k}" aria-pressed="${tg===k}">${t}</button>`).join("")}</div>
   ${cp&&!trLocked(f)?`<button class="cprep ${f.plan.preset===cp?"on":""}" data-act="preset" data-f="${f.id}" data-v="${cp}">${f.plan.preset===cp?"✓ สัปดาห์นี้ฝึกแก้ทางอยู่":"💡 ฝึกแก้ทาง: "+PRESETS[cp].name}<small>${op.name}${COUNTER_WHY[cp]}</small></button>`:""}
   <div class="mfoot"><button class="btn ghost" data-act="closeModal">ยกเลิก</button><button class="btn primary" data-act="fpok" data-id="${b.id}">ยืนยันแผน</button></div>`;}
function fightsHTML(){
  const sub=UI.fsub;
  return `<div class="seg subtabs"><button data-act="fsub" data-v="offers" aria-pressed="${sub==="offers"}">ข้อเสนอ & ตาราง</button><button data-act="fsub" data-v="rank" aria-pressed="${sub==="rank"}">อันดับ</button></div>`+(sub==="rank"?rankHTML():offersHTML());}
// v1.7 scouting: watch tape to see the opponent's tendencies (free when Rin is in the camp)
// v1.21: tape is always a deliberate step again — Rin (or the analyst) just makes it free
const SCOUT_COST=400;const rinIn=()=>G.F.rin.camp==="player";const RIN_GAP=3;const rinFree=()=>rinIn()&&!(G.rinTapeWk!=null&&G.week-G.rinTapeWk<RIN_GAP); // v1.38: Rin studies one tape for free every 3 weeks
const scoutCost=()=>rinFree()||(G.staff||[]).includes("wit")?0:(G.fac.video||0)>=1?200:SCOUT_COST;
const scoutLabel=()=>rinFree()?"ให้รินดูเทป (ฟรี ทุก 3 สัปดาห์)":scoutCost()?`ดูเทป ${fmt(scoutCost())}`:"ดูเทป (ฟรี)";
const scouted=id=>G.scout&&G.scout[id]!=null&&G.week-G.scout[id]<=8;
function oppIntel(op){const a=op.a;const wp=[["หมัด",a.punch],["เตะ",a.kick],["เข่า",a.knee],["ศอก",a.elbow]].sort((x,y)=>y[1]-x[1]);
  const weak=[["guard","การ์ดหลวม · เล่นหัวได้ผล"],["stamina","แรงน้อย · เล่นลำตัวดูดแรง"],["foot","ฟุตเวิร์กช้า · เตะขาให้ช้าลงอีก"],["clinch","คลินช์อ่อน · เข้าวงในได้เปรียบ"],["dur","ทนแรงกระแทกได้น้อย"]].sort((x,y)=>a[x[0]]-a[y[0]])[0];
  return {top:`${wp[0][0]} (${wp[0][1].toFixed(0)}) และ${wp[1][0]} (${wp[1][1].toFixed(0)})`,weak:weak[1]};}
function h2hText(op){const h=G.h2h&&G.h2h[op.id];return h&&(h.w+h.l+h.d)?`เคยเจอกัน ${h.w+h.l+h.d} ครั้ง · ชนะ ${h.w} แพ้ ${h.l}${h.d?` เสมอ ${h.d}`:""}`:"";}
// v1.35: trust finally does something you can see: corner orders land better, losses hurt less
const trustBonus=f=>f&&f.camp==="player"?clamp(((f.trust||0)-40)/1000,-.02,.04):0;
function trustText(f){const t=Math.round(f.trust||0),b=Math.round(trustBonus(f)*1000)/10;
  return `เชื่อใจ ${t}: ${b>0?`ทำตามคำสั่งจากมุมเวทีได้ดี ความแม่น +${b}%`:b<0?`ยังลังเลกับคำสั่งจากมุม ความแม่น ${b}%`:"ทำตามคำสั่งตามปกติ"}${t>=60?" · แพ้แล้วกำลังใจลดน้อยลง":" · ถึง 60 แพ้แล้วใจไม่ห่อเหี่ยว"}`;}
function personaOf(op){return !op.canon&&typeof PERSONA!=="undefined"?PERSONA[op.name]:null;}
function intelHTML(op){if(!scouted(op.id))return `<div class="intel locked"><span>ยังไม่ได้ดูเทปคู่ชก · รู้แค่สายมวย ${styleOf(op.a)}</span><button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button></div>`;
  const I=oppIntel(op);return `<div class="intel"><b>${G.F.rin.camp==="player"?"รินวิเคราะห์ให้":"ข้อมูลจากเทป"}</b><span>อาวุธหลัก: ${I.top}</span><span>จุดอ่อน: ${I.weak}</span></div>`;}
function offersHTML(){const mine=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week);
  return `${mine.length?`<section class="px card"><h3>ไฟต์ที่รับแล้ว</h3><div class="list">${mine.map(b=>{const o=G.F[b.b],me=G.F[b.a];
     return `<div class="bookcard"><div class="vsstage"><canvas width="150" height="150" data-sprite="${me.id}" data-mode="guard"></canvas><b class="vsx">VS</b><canvas width="150" height="150" data-sprite="${o.id}" data-mode="guard" data-flip="1"></canvas></div>
       <div class="bk-info"><div class="t">${esc(me.name)} vs ${esc(o.name)}</div><div class="meta">สัปดาห์ ${b.week} · ${TIER[b.tier].name} · ${b.rounds} ยก${b.win?` · ค่าตัว ${fmt(b.lose)} (+${fmt(b.win-b.lose)} ถ้าชนะ)`:""}</div>
       <span class="pill ${b.week===G.week?"red":"gold"}">${b.week===G.week?"สัปดาห์นี้":`อีก ${b.week-G.week} สด.`}</span>${(()=>{const v=verdictOf(adviseCached(me.id,o.id,b.rounds||3).bestRate);return `<span class="pill dtag ${v.c}">${v.t}</span>`;})()}</div><div class="bk-btns">${b.planSet?`<button class="btn sm done" data-act="fplan" data-id="${b.id}">✓ แผน: ${PLANS[b.plan||"balanced"].name}</button>`:`<button class="btn sm red" data-act="fplan" data-id="${b.id}">ตั้งแผนไฟต์</button>`}${scouted(o.id)?`<button class="btn sm done" disabled>${G.F.rin.camp==="player"?"✓ รินวิเคราะห์แล้ว":"✓ ดูเทปแล้ว"}</button>`:`<button class="btn sm" data-act="scout" data-v="${o.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button>`}</div></div>`;}).join("")}</div></section>`:""}
   ${dmCardHTML()}<section class="px card"><div class="card-h"><h3>ข้อเสนอสัปดาห์นี้</h3>${G.losses&&G.losses.length?`<button class="btn sm" data-act="lossrev">ทบทวนความพ่ายแพ้</button>`:`<span class="legend"><i class="dot green"></i>อ่อนกว่า <i class="dot gold"></i>สูสี <i class="dot red"></i>เก่งกว่า</span>`}</div><div class="list">${
     [...G.offers].sort((x,y)=>(y.rv||y.beast||y.hard||y.tier==="special"?1:0)-(x.rv||x.beast||x.hard||x.tier==="special"?1:0)).map(o=>{const op=G.F[o.b],me=G.F[o.a];const A=adviseCached(o.a,o.b,3);const v=verdictOf(A.bestRate);
       const sp=o.rv?["rv","ศึกล้างตา · ทั้งจังหวัดรอดู"]:o.beast?["beast",QK[o.beast].grp==="rooster"?"ศึกพิสดาร · คนปะทะไก่ชน":"ศึกพิสดาร · ล้มวัวฉบับมวยไทย"]:o.tier==="special"?["sp","ศึกพิเศษข้ามรุ่น"]:o.hard?["hard","ท้าชนคู่เหนือชั้น · ค่าตัว ×1.5"]:o.fair?["fair",o.cross?"งานวัด · ดาราข้ามรุ่น!":"ไฟต์งานวัด · ไม่นับอันดับ"]:null;
       return `<div class="item offer ${v.c} ${sp?"spx "+sp[0]:""}">${sp?`<span class="ribbon">${sp[1]}</span>`:""}<button class="oxbtn" data-act="declo" data-v="${o.id}" aria-label="ปฏิเสธข้อเสนอนี้">✕</button><div class="l"><span class="vdot ${v.c}" aria-label="${v.t}"></span>${faceImg(op,"sm")}<div>
       <div class="t">${esc(me.name)} vs ${esc(op.name)}</div>
       <div class="meta">สด.${o.week} · ${TIER[o.tier].name}${o.beast?" · ไม่นับสถิติ":""}${o.fair?" · ไม่นับอันดับ · ค่าตัวส่งทางจดหมาย":""} · ${styleOf(op.a)}${op.camp==="rival"?" · พยัคฆ์ทอง":""}${personaOf(op)?` · ${personaOf(op).tag}`:""}</div>${h2hText(op)?`<div class="meta goldt">${h2hText(op)}</div>`:""}
       <div class="meta">ค่าตัว ${fmt(o.lose)} · <b class="goldt">ชนะ +${fmt(o.win-o.lose)}</b> · <b class="${v.c}t">${v.t}</b>${ovr(op.a)-ovr(me.a)>.4?` · <b class="goldt">ชนะได้โบนัสแต้ม/ชื่อเสียง</b>`:ovr(op.a)-ovr(me.a)<-.6?` · <span class="mutt">ชนะคู่อ่อนได้ชื่อเสียงน้อย</span>`:""}</div>
       </div></div>
       <div class="obtns3"><button class="btn sm" data-act="consider" data-v="${o.id}">${scouted(o.b)?"ข้อมูลคู่ชก":"ดูเทป"}</button>${coachOn()?`<button class="btn sm" data-act="otip" data-v="${o.id}">คำแนะนำครู</button>`:""}<button class="btn sm gold" data-act="accept" data-v="${o.id}">รับไฟต์</button></div></div>`;}).join("")||`<p class="lead">${G.bookings.length?"รับไฟต์แล้ว ข้อเสนอใหม่จะเข้ามาสัปดาห์หน้า":"ไม่มีข้อเสนอ (บาดเจ็บ หรือหมดฤดูกาล)"}</p>`}</div></section>`;}
function rankHTML(){const st=stageOf(G.week),cut=st==="local"?4:st==="district"?4:0,d=UI.rdiv;const rows=standings(G,d);const mv=(G.rankMove&&G.rankMove[d])||{};
  return `<section class="px card"><div class="card-h"><div class="seg sm"><button data-act="rdiv" data-v="A" aria-pressed="${d==="A"}">รุ่น A</button><button data-act="rdiv" data-v="B" aria-pressed="${d==="B"}">รุ่น B</button></div>${G.champ[d]?`<span class="pill gold">แชมป์: ${esc(G.F[G.champ[d]].name)}</span>`:""}</div>
   <div class="rkhelp"><p class="meta">${st==="local"?"ท็อป 4 (เส้นทอง) ไปรอบอำเภอ · ตัดรอบ สด.20":st==="district"?"ท็อป 4 (เส้นทอง) ไปรองชิงจังหวัด · ตัดรอบ สด.40":"รองชิง สด.44 · ชิงแชมป์ สด.49"} · ชนะ 3 แต้ม</p><button class="btn sm" data-act="rankhelp">อันดับมีผลยังไง?</button></div>
   ${st==="final"||st==="off"?`<p class="meta">รองชิง (สด.44): ${(()=>{const t=(G.semis||{})[d]||[];return t.length===4?`<b>${esc(G.F[t[0]].name)}</b> vs <b>${esc(G.F[t[3]].name)}</b> · <b>${esc(G.F[t[1]].name)}</b> vs <b>${esc(G.F[t[2]].name)}</b>`:"—";})()}<br>ชิงแชมป์ (สด.49): ${G.finalists[d].map(id=>`<b>${esc(G.F[id].name)}</b>`).join(" vs ")||"รอผลรองชิง"}</p>`:""}
   <div class="tbl-wrap"><table><thead><tr><th>#</th><th></th><th>นักมวย</th><th>แต้ม</th><th>ช-พ-ส</th><th>ฟอร์ม</th></tr></thead><tbody>
   ${rows.map((r,i)=>`<tr class="${r.f.camp==="player"?"me":r.f.camp==="rival"?"rival":""} ${cut&&i<cut?"zone":""} ${cut&&i===cut-1?"cut":""}"><td class="num">${i+1}</td><td>${moveIcon(mv[r.id])}</td><td>${esc(r.f.name)}</td><td class="num"><b>${r.pts}</b></td><td class="num">${r.w}-${r.l}-${r.d}</td><td>${formHTML(r.f)}</td></tr>`).join("")}
   </tbody></table></div></section>${calendarHTML()}`;}

function peopleHTML(){const met=CANON_IDS.map(id=>G.F[id]).filter(f=>f.met);
  return `<div class="card-h"><p class="meta">ใช้เวลาด้วยกันสัปดาห์ละ 1 คน · พอสนิทกัน เธอจะทักแชทมาเองเป็นครั้งคราว</p><button class="btn sm gold albbtn" data-act="album">🃏 อัลบั้มการ์ด ${Object.keys(G.cards||{}).length}/${Object.keys(CARDS).length}${Object.values(G.cards||{}).some(c=>!c.seen)?'<i class="ndot"></i>':""}</button>${G.freeUsed?'<span class="pill">เวลาว่าง: ใช้แล้ว</span>':'<span class="pill gold">เวลาว่าง: เหลือ 1</span>'}</div>
   <div class="plist">${met.map(f=>`<section class="px pcard"><button class="pthumb" data-act="fighter" data-id="${f.id}" data-v="rel" aria-label="ดูโปรไฟล์${esc(f.name)}"><img src="${stand(f.id,"casual")}" alt="" loading="lazy"></button>
     <div class="pbody"><div class="pnm"><b class="nm">${esc(f.name)}</b><span class="meta">${f.camp==="player"?"ค่ายศิริชัย":f.camp==="rival"?"พยัคฆ์ทอง":"อิสระ"}${G.romance===f.id?" · คนรัก ♥":G.promise&&G.promise[f.id]!=null?" · สัญญาไว้ ♡":""}</span></div>${hearts(f.bond)}
      <div class="pbtns"><button class="btn sm" data-act="fighter" data-id="${f.id}" data-v="rel">ประวัติ</button><button class="btn sm primary" data-act="hang" data-id="${f.id}" ${G.freeUsed?"disabled":""}>ใช้เวลาด้วยกัน</button><button class="btn sm gold giftb" data-act="giftpick" data-id="${f.id}" ${f.giftWeek===G.week?"disabled":""}>${PIX.gift}<span>${f.giftWeek===G.week?"ให้แล้ว":"ของขวัญ"}</span></button><button class="btn sm chatb" data-act="chat" data-id="${f.id}" ${canChat(f)?"":"disabled"}>${CHAT_PX}<span>${canChat(f)?"แชทใหม่":(f.bond||0)<CHAT_BOND?"ยังไม่สนิท":"ไม่มีข้อความ"}</span>${canChat(f)?'<i class="dot"></i>':""}</button></div></div></section>`).join("")}</div>`;}
function hangHTML(id){const f=G.F[id];const pref=k=>f.know["act_"+k]==="like"?'<i class="likeb">ชอบ</i>':f.know["act_"+k]==="dislike"?'<i class="disb">ไม่ชอบ</i>':"";
  return `<h2>ใช้เวลากับ${esc(f.name)}</h2><p class="meta">เลือกที่ที่อยากไปด้วยกัน</p><div class="acts">${Object.entries(ACTIVITIES).filter(([k,a])=>!a.campOnly||f.camp==="player").map(([k,a])=>`<button class="actbtn" data-act="date" data-id="${f.id}" data-v="${k}" ${G.freeUsed||G.cash<a.cost?"disabled":""}><b>${a.name}${pref(k)}</b><small>${a.cost?fmt(a.cost):"ฟรี"}</small></button>`).join("")}</div>`;}
// v1.33: what each camp level brings, so upgrades feel like a goal
function campLvHTML(){const lv=campLevel(G),t=facTotal(G),need=[0,0,5,13];
  const unlock=L=>[...Object.entries(FACILITIES).filter(([k,F])=>F.req&&F.req.lv===L).map(([k,F])=>F.name),...Object.entries(STAFF).filter(([k,S])=>S.req&&S.req.lv===L).map(([k,S])=>S.name)];
  return `<h2>ระดับค่าย</h2><p class="meta">อัปเกรดอะไรก็ได้ในค่าย ครบจำนวนขั้นแล้วค่ายจะเลื่อนระดับ · ตอนนี้ ${t} ขั้น</p><div class="clv">${[1,2,3].map(L=>{const u=unlock(L);return `<div class="clvrow px ${L===lv?"now":L<lv?"done":"lock"}" style="background-image:linear-gradient(90deg,rgba(20,16,32,.94),rgba(20,16,32,.55)),url(${ASSET}gym${L}.webp)">
    <div class="clvh"><b>Lv.${L} ${CAMP_LV_NAME[L]}</b><span class="pill ${L<=lv?"green":""}">${L<lv?"ผ่านแล้ว":L===lv?"ตอนนี้":`ต้องอัป ${need[L]} ขั้น (อีก ${need[L]-t})`}</span></div>
    <ul><li>ค่าเรียน ${L>1?`+${(L-1)*20}%`:"ปกติ"}</li><li>คนอยากมาเรียน +${L*2}</li><li>จ้างครูผู้ช่วยได้ ${1+L} คน</li>${L>1?"<li>ห้องซ้อมเปลี่ยนโฉม</li>":""}${u.length?`<li class="goldt">ปลดล็อก: ${u.join(", ")}</li>`:""}</ul></div>`;}).join("")}</div>
   <button class="btn primary" data-act="gofac">ไปหน้าอัปเกรดค่าย</button>`;}
// v1.50: the camp's hall of fame — one row per finished year, plus belts held now
function hallHTML(){const T=(G.titles||[]).slice().reverse(),belts=Object.entries(G.belt||{}).filter(([d,b])=>G.F[b.id]&&G.F[b.id].camp==="player");
  const yr=t=>{const res=t.res||Object.entries(t.champ||{}).filter(([d,id])=>G.F[id]&&G.F[id].camp==="player").map(([d,id])=>({name:G.F[id].name,d,t:"แชมป์จังหวัด",c:"gold"}));
    return `<div class="hall-y"><b>ปีที่ ${t.season}</b>${res.length?res.map(r=>`<div class="kv-row"><span>${esc(r.name)} · รุ่น ${r.d}</span><span class="pill ${r.c||""}">${r.t}</span></div>`).join(""):'<p class="meta">ปีนั้นยังไม่ผ่านรอบตำบล แต่ค่ายยังอยู่ครบ</p>'}</div>`;};
  return `${belts.length?`<div class="hall-y"><b>เข็มขัดที่ครองอยู่</b>${belts.map(([d,b])=>`<div class="kv-row"><span>${esc(G.F[b.id].name)} · รุ่น ${d}</span><span class="pill gold">🏆 แชมป์เวทีท่าแพ · ป้องกัน ${b.def} ครั้ง</span></div>`).join("")}</div>`:""}
   ${T.length?T.map(yr).join(""):`<p class="meta">ยังไม่ครบปีแรก · จบปีแล้วผลงานของทุกคนจะมาอยู่ที่นี่ ปีละหนึ่งแถว</p>`}`;}
function campHTML(){const inc=classIncome(G),up=upkeep(G),wg=wages(G),lv=campLevel(G),cs=UI.csub||"money";
  const recs=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
  const dots=(n,m)=>`<span class="pips">${Array.from({length:m},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`;
  return `<section class="px card camphead" style="background-image:linear-gradient(90deg,rgba(20,16,32,.95),rgba(20,16,32,.6)),url(${ASSET}${gymBg()})"><div><button class="pill gold lvbtn" data-act="camplv">ค่าย Lv.${lv} ▸</button><h3>${CAMP_LV_NAME[lv]}</h3>
    <p class="meta">อัปเกรดรวม ${facTotal(G)} ขั้น · ${lv<3?`อีก ${lv===1?5-facTotal(G):13-facTotal(G)} ขั้นจะเลื่อนเป็น Lv.${lv+1} · กดดูว่าได้อะไร`:"ระดับสูงสุดของเดโม"}</p></div></section>
   <div class="seg subtabs csubs"><button data-act="csub" data-v="money" aria-pressed="${cs==="money"}">การเงิน</button><button data-act="csub" data-v="staff" aria-pressed="${cs==="staff"}">ครู & นักมวย</button><button data-act="csub" data-v="fac" aria-pressed="${cs==="fac"}">อัปเกรดค่าย</button><button data-act="csub" data-v="hall" aria-pressed="${cs==="hall"}">เกียรติยศ</button></div>
   ${recruitHTML(recs)}
   <div class="grid g2">
   <section class="px card cpane ${cs==="money"?"on":""}"><h3>รายรับ-รายจ่ายต่อสัปดาห์</h3>
    <div class="kv-row"><span>นักเรียน ${students(G)} คน × ${fmt(studentFee(G))}</span><b class="num pos">+${fmt(inc)}</b></div>
    <div class="kv-row"><span>ค่าใช้จ่ายค่าย</span><b class="num neg">-${fmt(up)}</b></div>
    <div class="kv-row"><span>ค่าจ้างนักมวยและผู้ช่วยครู</span><b class="num neg">-${fmt(wg)}</b></div>
    <div class="kv-row"><b>สุทธิ</b><b class="num ${weeklyNet(G)<0?"neg":"pos"}">${fmt(weeklyNet(G))}</b></div>
    <div class="kv-row"><span>หนี้ ${fmt(G.debt)} · ผ่อนทุก 4 สัปดาห์ ${fmt(Math.min(5000,G.debt))}</span><button class="btn sm" data-act="paydebt" ${G.cash<10000||G.debt<=0?"disabled":""}>โปะ ฿10,000</button></div>
    ${G.loan>0?`<div class="kv-row loanrow"><span>เงินกู้หมวกทอง ${fmt(G.loan)} · ดอก 10% ทุก 4 สัปดาห์</span><button class="btn sm gold" data-act="repayloan" ${G.cash<G.loan?"disabled":""}>คืนทั้งหมด</button></div>`:loanOk(G)?`<div class="kv-row loanrow"><span>เงินใกล้หมด · มีเงินกู้ด่วนให้ยืม</span><button class="btn sm red" data-act="loan">ดูเงินกู้</button></div>`:""}</section>
   <section class="px card cpane ${cs==="staff"?"on":""}"><h3>ครูและนักเรียน</h3>
    <div class="kv-row"><span>คนอยากเรียน ${studentDemand(G)} · รับได้ ${studentCap(G)}</span><b class="${studentDemand(G)>studentCap(G)?"goldt":""}">${studentDemand(G)>studentCap(G)?"ล้น!":"พอดี"}</b></div>
    <div class="item nw"><div class="l"><img class="face sm" src="${faceSrc("coach")}" alt=""><div><div class="t">ครูแดง Lv.${G.fac.daeng}</div><div class="meta">รับนักเรียน +${(G.fac.daeng-1)*2} คน · ค่าเรียน +12%/ระดับ · ฝึก +5%/ระดับ</div></div></div>
     ${G.fac.daeng<3?`<button class="btn sm gold" data-act="daeng" ${G.cash<DAENG_COST[G.fac.daeng]?"disabled":""}>ส่งอบรม ${fmt(DAENG_COST[G.fac.daeng])}</button>`:'<span class="pill green">สูงสุด</span>'}</div>
    ${staffHTML()}</section>
   </div>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>สิ่งอำนวยความสะดวก</h3><div class="facs">${(()=>{const E=Object.entries(FACILITIES),lk=E.filter(([k])=>facLocked(G,k));return [...E.filter(([k])=>!facLocked(G,k)),...lk.slice(0,1)];})().map(([k,F])=>{const l=G.fac[k]||0,m=F.cost.length,lk=facLocked(G,k);
     return `<div class="item fac ${lk?"locked":""}"><div><div class="t">${F.name} ${dots(l,m)}${F.req&&!l&&!lk?' <span class="newb sm">ใหม่</span>':""}</div><div class="meta">${F.desc}</div></div>${lk?`<span class="pill">ปลดล็อก: ${lk}</span>`:l<m?`<button class="btn sm gold" data-act="buyfac" data-v="${k}" ${G.cash<F.cost[l]?"disabled":""}>${fmt(F.cost[l])}</button>`:'<span class="pill green">สูงสุด</span>'}</div>`;}).join("")}</div></section>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>ลงทุนพิเศษ</h3>
    <div class="item nw"><div><div class="t">เชิญครูมวยโบราณมาสอน</div><div class="meta">${fmt(18000)} · นักมวยได้แต้มสกิล +1 และค่าสถานะตามสำนัก · คนละครั้งต่อฤดูกาล · เปิดสัปดาห์ 16</div></div><button class="btn sm gold" data-act="mastersOpen" ${G.week<16?"disabled":""}>เลือก</button></div>
    <div class="item nw"><div><div class="t">จัดศึกมวยที่ค่ายศิริชัย</div><div class="meta">${fmt(SHOW_COST)} · ชื่อเสียง +3 ค่ายสวยขึ้น กำลังใจทุกคน +8 · รอบละครั้ง</div></div><button class="btn sm gold" data-act="hostshow" ${G.cash<SHOW_COST||G.week<10||G.flags["show_"+stageOf(G.week)]?"disabled":""}>${G.flags["show_"+stageOf(G.week)]?"จัดแล้ว":"จัดงาน"}</button></div>
    <div class="item nw"><div><div class="t">ปิดหนี้ปู่ชัยทั้งหมด</div><div class="meta">${G.debt>0?`คงเหลือ ${fmt(G.debt)} · ปิดแล้วชื่อเสียง +2 และมีฉากพิเศษ`:"ปิดหนี้เรียบร้อยแล้ว"}</div></div>${G.debt>0?`<button class="btn sm gold" data-act="cleardebt" ${G.cash<G.debt?"disabled":""}>ปิดหนี้</button>`:'<span class="pill green">เรียบร้อย</span>'}</div></section>
   <section class="px card cpane ${cs==="hall"?"on":""}"><h3>มุมเกียรติยศ</h3>${hallHTML()}</section>
`;}

// v1.18: hired trainers with their own pixel sprite
function staffHTML(){const st=G.staff||[],n=staffSlots(G);
  return `<div class="kv-row"><span>ทีมครูฝึก</span><b>${st.length}/${n} ตำแหน่ง</b></div><p class="meta">ตำแหน่งเพิ่มตามระดับค่าย และเวทีมาตรฐาน · ครูแต่ละคนรับนักเรียน +1 ฝึก +2%</p>
   <div class="staffs">${Object.entries(STAFF).map(([k,S])=>{const h=st.includes(k),lk=staffLocked(G,k);
    return `<div class="staff ${h?"on":""} ${lk?"locked":""}"><canvas width="84" height="84" data-staff="${k}" aria-label="${S.name}"></canvas>
     <div class="sinfo"><b>${S.name}</b><span class="role">${S.role}</span><span class="meta">${S.desc}</span><span class="meta">ค่าจ้าง ${fmt(S.wage)}/สัปดาห์${h?"":` · ค่าเซ็น ${fmt(S.fee)}`}</span></div>
     ${h?`<button class="btn sm" data-act="firestaff" data-v="${k}">เลิกจ้าง</button>`:lk?`<span class="pill">ปลดล็อก: ${lk}</span>`:`<button class="btn sm gold" data-act="hirestaff" data-v="${k}" ${G.cash<S.fee||st.length>=n?"disabled":""}>${st.length>=n?"เต็ม":"จ้าง"}</button>`}</div>`;}).join("")}</div>`;}
// v1.9: a fighter who wants to join is the headline of the camp tab
function recruitHTML(recs){if(!recs.length)return "";
  return `<section class="px card recruit"><h3><span class="newb">NEW!</span> นักมวยอยากเข้าค่าย</h3>${recs.map(([id])=>{const f=G.F[id];
    return `<div class="rcard"><button class="rface" data-act="fighter" data-id="${id}" aria-label="ดูข้อมูล ${esc(f.name)}"><img src="${faceSrc(id,"happy")}" alt=""></button>
     <div class="rinfo"><b>${esc(f.full||f.name)}</b><span class="meta">รุ่น ${f.div} · ${styleOf(f.a)}</span><span class="meta">ค่าเซ็น ${fmt(f.fee)} · ค่าจ้าง ${fmt(f.wage)}/สัปดาห์</span></div>
     <div class="rbtns"><button class="btn sm" data-act="fighter" data-id="${id}">ดูข้อมูล</button><button class="btn sm gold" data-act="sign" data-v="${id}" ${G.cash<f.fee?"disabled":""}>เซ็นสัญญา</button></div></div>`;}).join("")}
   <p class="meta">ค่าจ้างเป็นรายจ่ายทุกสัปดาห์ ดูเงินสดให้ไหวก่อนเซ็น</p></section>`;}
// ---------- fighter popup (tabs) ----------
function fighterHTML(f){const mine=f.camp==="player";const P=PROFILES[f.id];
  const tabs=mine?[["rel","ประวัติ"],["over","ค่าพลัง"],["skill","สกิล"]].concat(f.canon&&KIT_MASK[f.id]?[["look","ชุด"]]:[]):[["rel","ประวัติ"],["over","ค่าพลัง"]];
  let t=UI.ptab;if(!tabs.some(x=>x[0]===t))t="over";
  const head=`<div class="fp-head">${faceImg(f)}<div><h2>${esc(f.full)}</h2><div class="meta">${P?P.age+" ปี · ":""}${f.camp==="player"?"ค่ายศิริชัย":f.camp==="rival"?"ค่ายพยัคฆ์ทอง":"นักมวยอิสระ"} · รุ่น ${f.div} · ${styleOf(f.a)} · ${rec(f)}</div>${G.belt&&Object.values(G.belt).some(x=>x.id===f.id)?`<div class="beltb">🏆 แชมป์เวทีท่าแพ</div>`:f.belts?`<div class="beltb old">อดีตแชมป์เวทีท่าแพ</div>`:""}${xpBar(f)}</div></div>
   <div class="seg ptabs">${tabs.map(([k,n])=>`<button data-act="ptab" data-v="${k}" aria-pressed="${t===k}">${n}${k==="skill"&&skReady(f)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>`;
  let body="";
  if(t==="look"){const cur=f.outfit||"base";
    body=`<div class="olook"><canvas width="170" height="160" data-sprite="${f.id}" data-floor="1" data-mode="guard" aria-label="${esc(f.name)}"></canvas><div class="olist">${Object.entries(OUTFITS).map(([k,O])=>{const ok=k==="base"||outfitOk(G,f,k);
      return `<button class="obtn ${cur===k?"on":""}" data-act="outfit" data-id="${f.id}" data-v="${k}" ${ok?"":"disabled"}><i style="background:${O.sw||"transparent"}" class="${O.sw?"":"base"}"></i><span><b>${ok?esc(O.name):"???"}</b><small>${cur===k?"ใส่อยู่":ok?"แตะเพื่อใส่":"ปลดล็อก: "+esc(O.hint)}</small></span></button>`;}).join("")}</div></div>
      <p class="meta center">ชุดเปลี่ยนแค่ตัวพิกเซลในค่าย ตอนซ้อม และตอนชก · ไม่มีผลกับค่าพลัง</p>`;}
  if(t==="over"){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id||b.b===f.id);
    body=`<div class="fp-over">${radarSVG(f,240)}<div><div class="bars">${bar("ความพร้อม",c,condColor(c))}${bar("ความล้า",f.fatigue,"var(--warn)")}${bar("กำลังใจ",f.morale,"var(--blue)")}</div>
      ${mine?`<p class="meta goldt">${masteryLine(f)}</p>`:""}<p class="meta">ฟอร์ม ${formHTML(f)}${nb?` · ไฟต์ถัดไปสัปดาห์ ${nb.week}`:""}</p><details><summary>ค่าสถานะละเอียด</summary>${attrsHTML(f,mine)}</details></div></div>`;}
  if(t==="train"){body=`<div class="fp-train"><div class="tr-anim big" style="background-image:url(${ASSET}${gymBg()})"><canvas width="260" height="200" data-sprite="${f.id}" data-floor="1"></canvas><span class="tr-tag">${PRESETS[f.plan.preset].name}</span></div>
     <div><p class="meta">${PRESETS[f.plan.preset].desc} · ความล้าสัปดาห์หน้า ${Math.round(projFatigue(f))}</p>${presetPicker(f)}${radarSVG(f,200)}</div></div>`;}
  if(t==="skill"&&hasTree(f.id))body=skillGrid(f,mine);else if(t==="skill")body=skillGrid(f,mine)+(SIGNATURE[f.id]?`<details class="sigcard ${hasSignature(f)?"on":""}"><summary><b>${hasSignature(f)?"✦":"🔒"} ท่าไม้ตาย: ${SIGNATURE[f.id].name}</b></summary><span class="meta">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · ตอนนี้ความสนิท ${Math.round(f.bond||0)}/60`}</span></details>`:"")+`<details class="skhelp"><summary>สกิลทำงานยังไง?</summary><p class="meta">ได้แต้มสกิล 1 แต้มทุกเลเวลอัป · ท่าใหม่ปลดล็อกตามเลเวล · แต่ละท่าอัปได้ 3 ขั้น · ตอนชกกดใช้ได้เฉพาะ 3 ท่าที่ "ใช้" · แตะชื่อท่าเพื่อดูรายละเอียด</p></details>`;
  if(t==="rel")body=relHTML(f);
  return head+`<div class="fp-body">${body}</div>`;}
const SK_AN=Object.fromEntries(ATTRS);
const SK_LINES={kati:["สายแข้ง","สายหมัดศอก","สายการ์ดและใจ"],mali:["สายศอก","สายเตะและความไว","สายป้องกัน"],rin:["สายสวนกลับ","สายอ่านเกม","สายคุมระยะ"]};
const SK_ROWN=["พื้นฐาน","ระดับกลาง","ระดับกลาง · ติดตัว","ระดับสูง"];
const skReady=f=>f.sp>0&&(hasTree(f.id)?(SKILLS[f.id]||[]).some(k=>!skillBlock(f,k.id).length):true);
const fmtA=v=>(Math.floor(v*10)/10).toFixed(1).replace(/\.0$/,"");
// v1.31: skill screen — points up top, one line (สาย) at a time, a scrollable list of pixel cards with the upgrade button on each card
const skState=(f,s,mine)=>{const r=(f.skills&&f.skills[s.id])||0;if(!mine)return {r,st:r?"has":"lock"};const B=skillBlock(f,s.id);
  if(r>=3)return {r,st:"max"};if(!B.length)return {r,st:"can"};const nb=B.filter(b=>b.t!=="sp");if(!nb.length)return {r,st:"nosp"};return {r,st:"lock",B:nb};};
function skillTree(f,mine){const L=SKILLS[f.id],eqd=equipped(f),sc=SCHOOLS[L[0].school]||{name:""};
  const lines=SK_LINES[f.id]||["สาย 1","สาย 2","สาย 3"];const can=li=>mine&&L.some(s=>s.line===li&&skState(f,s,mine).st==="can");
  let li=UI.skLine&&UI.skLine.id===f.id?UI.skLine.li:[0,1,2].find(can);if(li==null)li=0;
  const nCan=L.filter(s=>skState(f,s,mine).st==="can").length;
  const why=st=>st.B.map(b=>b.t==="pre"?`ต้องมี "${skillDef(f.id,b.id).name}" ก่อน`:b.t==="lv"?`ต้อง Lv.${b.v}`:b.t==="stat"?`${SK_AN[b.k]} ${fmtA(b.have)}/${fmtA(b.v)}`:"").filter(Boolean).join(" · ");
  const card=s=>{const st=skState(f,s,mine),eq=eqd.includes(s.id),k=skillKind(s);
    return `<div class="skc ${st.st} ${eq?"eq":""}"><div class="skc-ic">${s.passive?PIX.sk_rec:PIX["sk_"+k.k]}</div>
     <div class="skc-m"><div class="skc-h"><b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=st.r?"on":""}"></i>`).join("")}</span></div>
      <small class="skc-t">${SK_ROWN[s.row]}${eq?' · <span class="goldt">ใช้ขึ้นชกอยู่</span>':""}</small>
      <p class="skc-d">${s.desc}</p>
      <p class="skc-s">${st.st==="can"?`<span class="ok">อัปได้ → ขั้น ${st.r+1}</span>`:st.st==="max"?'<span class="goldt">อัปเต็มแล้ว</span>':st.st==="nosp"?'<span class="dim">ไม่มีแต้มสกิล · รอเลเวลอัป</span>':`<span class="no">ยังอัปไม่ได้: ${why(st)}</span>`}</p></div>
     ${mine?`<div class="skc-b">${st.st==="can"?`<button class="btn sm gold" data-act="learn" data-id="${f.id}" data-v="${s.id}" aria-label="อัป ${s.name}">+ อัป</button>`:""}${st.r&&!s.passive?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"ถอด":"ใส่"}</button>`:""}</div>`:""}</div>`;};
  return `<div class="skwrap">${mine?`<div class="skbar3"><div class="sppx"><small>แต้มสกิล</small><b class="num">★ ${f.sp}</b></div>
     <div class="sk-info"><span>${f.sp?nCan?`อัปได้ตอนนี้ <b class="ok">${nCan}</b> ท่า`:"ยังไม่มีท่าที่อัปได้ ฝึกค่าพลังเพิ่ม":"ได้ 3 แต้มทุกเลเวลอัป"}</span>
      <span class="sk-eq">ใช้ขึ้นชก ${[0,1,2].map(i=>{const s=eqd[i]&&skillDef(f.id,eqd[i]);return `<i class="${s?"on":""}" title="${s?s.name:"ว่าง"}">${s?PIX["sk_"+skillKind(s).k]:""}</i>`;}).join("")}</span></div></div>`:""}
   <div class="seg sklines">${lines.map((n,i)=>`<button data-act="skline" data-id="${f.id}" data-v="${i}" aria-pressed="${li===i}">${n}${can(i)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>
   <div class="sklist pxscroll">${[0,1,2,3].map(row=>L.find(s=>s.line===li&&s.row===row)).filter(Boolean).map(card).join('<i class="skarrow" aria-hidden="true"></i>')}
     ${SIGNATURE[f.id]?`<div class="skc sig ${hasSignature(f)?"has":"lock"}"><div class="skc-m"><div class="skc-h"><b>✦ ท่าไม้ตาย: ${SIGNATURE[f.id].name}</b></div><p class="skc-d">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · ปลดเมื่อความสนิทถึง 60 (ตอนนี้ ${Math.round(f.bond||0)})`}</p></div></div>`:""}</div>
   ${mine?`<div class="skfoot"><button class="btn sm" data-act="skauto" data-id="${f.id}" data-v="${li}" ${[0,1,2,3].some(r=>{const s=L.find(x=>x.line===li&&x.row===r);return s&&skState(f,s,mine).st==="can";})?"":"disabled"}>อัปอัตโนมัติ · ${lines[li]}</button><span class="meta">ใส่ขึ้นชกได้ ${MAX_EQUIP} ท่า · ท่าติดตัวทำงานเองไม่ใช้ช่อง</span></div>`:""}</div>`;}
function skillGrid(f,mine){if(hasTree(f.id))return skillTree(f,mine);const L=SKILLS[f.id]||[];const sc=SCHOOLS[L[0]&&L[0].school]||{name:"",motto:""};
  // v1.23: compact — unlocked moves as short rows (tap the name for details), locked ones folded away
  const op=L.filter(s=>(s.lv||1)<=f.lvl),lk=L.filter(s=>(s.lv||1)>f.lvl),eqd=equipped(f);
  const row=s=>{const r=f.skills[s.id]||0,eq=eqd.includes(s.id),k=skillKind(s),o=UI.skOpen===f.id+s.id;
    return `<div class="skrow ${r?"has":""} ${eq?"eq":""}"><button class="skn" data-act="skdesc" data-v="${f.id+s.id}" aria-expanded="${o}">${PIX["sk_"+k.k]}<b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=r?"on":""}"></i>`).join("")}</span></button>
     ${mine?`<span class="skb">${r?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"ใช้อยู่":"ใช้"}</button>`:""}<button class="plus" data-act="learn" data-id="${f.id}" data-v="${s.id}" ${f.sp<1||r>=3?"disabled":""} aria-label="อัป ${s.name}">${r>=3?"MAX":"+"}</button></span>`:""}
     ${o?`<small class="skd">${s.desc}</small>`:""}</div>`;};
  return `<div class="school sm" style="--c:${sc.color}"><b>${sc.name}</b>${mine?`<span class="pill ${f.sp>0?"gold":""}">แต้มสกิล ${f.sp}</span><span class="pill">ใช้ขึ้นชก ${eqd.length}/${MAX_EQUIP}</span>`:""}</div>
   <div class="sklist">${op.map(row).join("")||`<p class="meta">ยังไม่มีท่าที่ปลดล็อก</p>`}</div>
   ${lk.length?`<details class="sklock"><summary>ท่าที่ยังล็อก ${lk.length} ท่า · ถัดไป Lv.${lk[0].lv}</summary>${lk.map(s=>`<div class="sklk"><span>Lv.${s.lv}</span><b>${s.name}</b><small>${s.desc}</small></div>`).join("")}</details>`:""}`;}
// v1.41: visible relationship stages — each one changes how she treats you
const REL_TIERS=[[0,"คนรู้จัก","ยังเรียกคุณว่าผู้จัดการแบบเกร็ง ๆ"],[20,"เพื่อนร่วมค่าย","เริ่มคุยเล่น ทักแชตเรื่องทั่วไป"],[40,"คนสนิท","บางทีก็หลุดเรียกชื่อคุณ · มีเรื่องส่วนตัวมาเล่า"],[75,"คนพิเศษ","เรียกชื่อคุณตลอด"]];
const relTier=b=>{let i=0;REL_TIERS.forEach((t,k)=>{if((b||0)>=t[0])i=k;});return i;};
function relTierCheck(){if(!G)return;G.relT=G.relT||{};for(const f of Object.values(G.F)){if(!(f.camp==="player"||f.met))continue;const t=relTier(f.bond),o=G.relT[f.id];if(o===undefined){G.relT[f.id]=t;continue;}
  if(t>o){G.relT[f.id]=t;UI.relUp=UI.relUp||[];UI.relUp.push(`${f.name} · ${REL_TIERS[t][1]} — ${REL_TIERS[t][2]}`);}}}
function relHTML(f){const P=PROFILES[f.id],b=f.bond;
  const L=(ok,need,v)=>ok?esc(v):`<span class="lock">🔒 สนิท ${need}</span>`;
  const chips=(arr,pre,all)=>arr.map((x,i)=>f.know[pre+i]||b>=all?`<span class="tchip">${esc(x)}</span>`:`<span class="tchip lock">???</span>`).join("");
  const gifts=Object.entries(f.know).filter(([k])=>k.startsWith("gift_")).map(([k,v])=>`<span class="tchip ${v}">${GIFTS[k.slice(5)].name}${v==="love"?" ♥♥":v==="like"?" ♥":v==="dislike"?" ✕":""}</span>`).join("");
  const looks=[["fight","ชุดชก"],["train","ชุดซ้อม"],["casual","ลำลอง"]];
  return `<div class="pf2"><div class="pf-art"><img src="${UI.look==="train"?`${ASSET}${f.id}_train.webp`:stand(f.id,UI.look,"happy")}" alt=""><div class="seg sm">${looks.map(([k,t])=>`<button data-act="plook" data-v="${k}" aria-pressed="${UI.look===k}">${t}</button>`).join("")}</div></div>
   <div class="pf-side">${hearts(b)}${typeof missGap==="function"&&missGap(G,f.id)>=3?`<div class="missb">💭 คิดถึง · ไม่ได้เจอกัน ${missGap(G,f.id)} สัปดาห์${f.bond>(REL_FLOOR[(G.relT||{})[f.id]||0]||0)?" · ความสนิทเริ่มจางลง":""}</div>`:""}<div class="reltier"><b>${REL_TIERS[relTier(b)][1]}</b><small>${REL_TIERS[relTier(b)][2]}</small></div><div class="bars">${bar("สนิท",b,"var(--red)")}${bar("เชื่อใจ",f.trust,"var(--gold)")}</div>${f.camp==="player"?`<p class="meta trustx">${trustText(f)}</p>`:""}
    <div class="info"><div><span>ส่วนสูง</span><b>${P.height}</b></div><div><span>กรุ๊ปเลือด</span><b>${L(b>=UNLOCK.blood||f.know.blood,UNLOCK.blood,P.blood)}</b></div>
     <div><span>วันเกิด</span><b>${L(b>=UNLOCK.bday||f.know.bday,UNLOCK.bday,P.bday)}</b></div><div><span>สายมวย</span><b>${esc(P.heritage)}</b></div></div></div></div>
   <div class="pf-sec"><h4>นิสัย</h4><p>${L(b>=UNLOCK.personality,UNLOCK.personality,P.personality)}</p></div>
   <div class="pf-two"><div class="pf-sec"><h4>ชอบ</h4><div class="tchips">${chips(P.likes,"like",UNLOCK.likesAll)}</div></div><div class="pf-sec"><h4>ไม่ชอบ</h4><div class="tchips">${chips(P.dislikes,"dislike",UNLOCK.dislikesAll)}</div></div></div>
   ${(()=>{const L=Object.keys(f.know||{}).filter(k=>k.startsWith("gift_")&&GIFTS[k.slice(5)]);return L.length?`<div class="pf-sec"><h4>ของขวัญที่เคยให้</h4><div class="tchips">${L.map(k=>{const t=f.know[k];return `<span class="tchip gk-${t}">${t==="love"?"♥♥":t==="like"?"♥":t==="dislike"?"✕":"·"} ${esc(GIFTS[k.slice(5)].name)}</span>`;}).join("")}</div></div>`:"";})()}
   ${gifts?`<div class="pf-sec"><h4>ของขวัญที่รู้แล้ว</h4><div class="tchips">${gifts}</div></div>`:""}
   <div class="pf-two"><div class="pf-sec"><h4>บ้านเกิด</h4><p>${esc(P.home)}</p></div><div class="pf-sec"><h4>งานอดิเรก</h4><p>${L(b>=UNLOCK.hobby||f.know.hobby,UNLOCK.hobby,P.hobby)}</p></div></div>
   <details class="pf-sec"><summary>เรื่องราว & ความลับ</summary><h4>เรื่องราว</h4><p>${L(b>=UNLOCK.story,UNLOCK.story,P.story)}</p><h4>ความลับ</h4><p>${L(b>=UNLOCK.secret,UNLOCK.secret,P.secret)}</p></details>`;}
function giftHTML(id){const f=G.F[id];
  const E=giftsFor(id).map(k=>[k,{...GIFTS[k],bond:giftBond(id,k)}]).sort((x,y)=>(x[1].bond||0)-(y[1].bond||0)||(x[1].only?1:0)-(y[1].only?1:0));
  {const lk=E.filter(([k,g])=>(g.bond||0)>(f.bond||0));const nx=lk[0];const hid=lk.length-(nx?1:0);E.splice(0,E.length,...E.filter(([k,g])=>(g.bond||0)<=(f.bond||0)),...(nx?[nx]:[]));E.hidden=hid;}
  return `<h2>ของขวัญให้${esc(f.name)}</h2><p class="meta">ซื้อแล้วให้ทันที · คนละ 1 ชิ้นต่อสัปดาห์ · ยิ่งสนิทยิ่งมีของให้เลือก${E.hidden?` (ยังซ่อนอีก ${E.hidden} ชิ้น)`:""} · เงินสด ${fmt(G.cash)}</p><div class="gifts">${E.map(([k,g])=>{const kn=f.know["gift_"+k],lk=(g.bond||0)>(f.bond||0);
   if(lk)return `<div class="giftbtn lockg"><b>???</b><small>ปลดล็อกเมื่อสนิท ${g.bond}</small></div>`;
   const lw=f.giftL&&f.giftL[k],cd=lw&&G.week-lw<6&&(f.giftN||{})[k]?6-(G.week-lw):0;
   return `<button class="giftbtn" data-act="give" data-id="${id}" data-v="${k}" ${G.cash<g.price?"disabled":""}><b>${g.name}</b><small>${fmt(g.price)}${cd?` · เพิ่งให้ไป`:""}</small></button>`;}).join("")}</div>
   <p class="meta glegend">สังเกตท่าทีตอนให้ หรือดูในประวัติว่าเคยให้อะไรไปแล้วบ้าง</p>`;}
function considerHTML(o){const me=G.F[o.a],op=G.F[o.b];const A=adviseCached(o.a,o.b,3);const pct=x=>Math.round(x*100);const v=verdictOf(A.bestRate);const sc=scouted(op.id);const P=personaOf(op);
  return `<h2>ข้อมูลไฟต์</h2><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b><span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b><span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
   ${P?`<p class="quote">“${esc(P.line)}” <span class="meta">— ${esc(P.tag)}</span></p>`:""}${h2hText(op)?`<p class="meta goldt">${h2hText(op)}</p>`:""}
   ${intelHTML(op)}
   ${sc?`<div class="planbars">${Object.entries(A.rates).sort((a,b)=>b[1]-a[1]).map(([k,x])=>`<div class="bar"><span>${PLANS[k].name}</span><i style="--v:${pct(x)}%;--bc:${k===A.best?"var(--gold)":"var(--blue)"}"></i><b class="num">${pct(x)}%</b></div>`).join("")}</div>`:`<p class="meta">ดูเทปเพื่อเห็นแผนที่ได้เปรียบ</p>`}
   <p class="meta">สัปดาห์ ${o.week} · ${TIER[o.tier].name} · ค่าตัว ${fmt(o.lose)} · ชนะได้เพิ่ม ${fmt(o.win-o.lose)}</p>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">ปิด</button></div>`;}
function actNear(a){let s=0;if(a.rep)s+=Math.max(0,a.rep-G.rep)*2;if(a.week)s+=Math.max(0,a.week-G.week);if(a.fac)s+=20;if(a.lv)s+=15;return s;}
function campActsHTML(){const pk=UI.modal.pick;if(pk){const a=CAMP_ACTIONS[pk];return `<h2>ยืนยันกิจกรรม?</h2><div class="px confirm"><b>${a.name}</b><p class="meta">${a.desc}${a.cost?` · ค่าใช้จ่าย ${fmt(a.cost)}`:""}</p><p class="meta">ทำได้สัปดาห์ละ 1 อย่าง</p>${a.mg?`<p class="meta">เล่นมินิเกมเองได้ผลตามฝีมือ · หรือข้ามแล้วรับผลกลาง ๆ: ${a.skip}</p>`:""}</div><div class="mfoot"><button class="btn ghost" data-act="campback">ย้อนกลับ</button>${a.mg?`<button class="btn" data-act="campok">ข้าม (ผลกลาง ๆ)</button><button class="btn primary" data-act="campmg">${JOY_PX}เล่นเอง</button>`:`<button class="btn primary" data-act="campok">ยืนยัน</button>`}</div>`;}
  // v1.23: locked activities stay hidden except the next one to open, so the list stays short
  const all=Object.entries(CAMP_ACTIONS).filter(([k,a])=>!a.hidden),open=all.filter(([k,a])=>!campActLocked(G,a)),lockd=all.filter(([k,a])=>campActLocked(G,a));
  const nx=lockd.sort((x,y)=>actNear(x[1])-actNear(y[1]))[0];
  return `<h2>กิจกรรมค่ายสัปดาห์นี้</h2><p class="meta">เลือกได้ 1 อย่างต่อสัปดาห์${lockd.length>1?` · ยังมีอีก ${lockd.length-1} กิจกรรมที่ซ่อนอยู่`:""}</p><div class="acts">${[...open,...(nx?[nx]:[])].map(([k,a])=>{const lock=campActLocked(G,a);return `<button class="actbtn ${lock?"lockd":""} ${a.mg?"mg":""}" data-act="campick" data-v="${k}" ${lock||G.campUsed||G.cash<a.cost?"disabled":""}>${a.mg?`<span class="mgtag">${JOY_PX}MINIGAME</span>`:""}<b>${a.name}</b><small>${lock?`ปลดล็อก: ${lock}`:a.desc+(a.cost?` · ${fmt(a.cost)}`:"")}</small></button>`;}).join("")}</div>`;}
function studInfoHTML(){const n=students(G),cap=studentCap(G),d=studentDemand(G),fee=studentFee(G);
  return `<h2>นักเรียนคอร์สมวย</h2><div class="px confirm"><img class="face sm" src="${faceSrc("coach")}" alt="" style="float:left;margin:0 10px 4px 0">
   <p>นักท่องเที่ยวกับเด็กแถวค่ายที่มาเรียนมวยกับครูแดง ไม่ใช่นักมวยที่ขึ้นชก แต่เป็น<b>รายได้หลักของค่าย</b> จ่ายค่าเรียนทุกสัปดาห์</p></div>
   <div class="kv-row"><span>ตอนนี้มาเรียน</span><b class="num">${n} คน</b></div>
   <div class="kv-row"><span>ค่าเรียนต่อคน/สัปดาห์</span><b class="num">${fmt(fee)}</b></div>
   <div class="kv-row"><span>รายได้ต่อสัปดาห์</span><b class="num pos">+${fmt(n*fee)}</b></div>
   <p class="meta">นักเรียนมาเพิ่มทีละ 1–2 คนต่อสัปดาห์ จนถึงจำนวนที่อยากเรียนหรือที่ค่ายรับไหว ค่ายเต็มที่สุดรับได้ ${STU_MAX} คน</p>
   <h3>คนอยากเรียน ${d} คน มาจาก</h3><ul class="mlist"><li>ชื่อเสียง · ป้ายค่าย · รถสองแถว · เวทีมาตรฐาน · ระดับค่าย</li></ul>
   <h3>รับได้สูงสุด ${cap} คน</h3><ul class="mlist"><li>เริ่มต้น 6 · ลานสอน +3/ระดับ · อัปครูแดง +2/ระดับ · ครูที่จ้าง +1/คน (สูงสุด 5)</li></ul>
   ${d>cap?`<p class="meta goldt">อยากเรียน ${d} คน แต่รับได้ ${cap} · อัปลานสอนที่จัดการค่าย</p>`:n<Math.min(d,cap)?`<p class="meta">กำลังมาเพิ่ม: อีก ${Math.min(d,cap)-n} คน</p>`:""}`;}
function weekCards(r){const R=roster(G);if(!R.length)return "";const P={};(r.prog||[]).forEach(p=>P[p.id]=p);
  return `<div class="wkcards">${R.map(f=>{const p=P[f.id];const nb=nextBooking(f);return `<div class="wkc px">${faceImg(f,"sm")}<b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b>
    <div class="minis"><span>EXP</span>${mini(f.xp/Math.max(1,xpNeed(f))*100,"var(--gold)")}<span>ล้า</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    ${p?radarSVG(f,110,p.before):""}<span class="meta">${f.injury?`<span class="redt">เจ็บ ${f.injury} สด.</span>`:nb?`ไฟต์ สด.${nb.week}`:"ยังไม่มีไฟต์"}${f.sp>0?' · <span class="goldt">มีแต้มสกิล</span>':""}</span></div>`;}).join("")}</div>`;}
function reportHTML(){const r=G.lastReport;const ann=[];
  for(const d of ["A","B"])for(const [id,pos] of Object.entries(r.rank[d]||{})){const f=G.F[id];if(!f||(f.camp!=="player"&&f.camp!=="rival"))continue;
    const m=(r.move&&r.move[d]&&r.move[d][id])||0;ann.push({f,pos,m,d});}
  ann.sort((a,b)=>(b.f.camp==="player")-(a.f.camp==="player"));
  const cut=r.stage==="local"?4:r.stage==="district"?4:0;
  return `<h2>สรุปสัปดาห์ที่ ${r.week}</h2><p class="goal">${goalText()}</p>
   ${ann.length&&cut?`<div class="announce"><div class="ann-h">ประกาศอันดับ · ${STAGE_NAME[r.stage]}</div>${ann.map(a=>`<div class="ann ${a.f.camp==="player"?"me":""}">${faceImg(a.f,"sm")}<b>${esc(a.f.name)}</b><span class="meta">รุ่น ${a.d}</span><span class="rk">อันดับ ${a.pos}</span>${moveIcon(a.m)}${cut?`<span class="pill ${a.pos<=cut?"green":"red"}">${a.pos<=cut?"อยู่ในโซนเข้ารอบ":"นอกโซน"}</span>`:""}</div>`).join("")}</div>`:""}
   ${r.prog?`<details class="prog"><summary class="ann-h">กราฟพัฒนาการ 4 สัปดาห์ (แตะเพื่อดู)</summary><div class="progrow">${r.prog.filter(p=>G.F[p.id]).map(p=>{const f=G.F[p.id];const sum=Object.keys(p.before).reduce((s,k)=>s+(f.a[k]-p.before[k]),0);
     return `<div class="pcell">${radarSVG(f,150,p.before)}<b>${esc(f.name)}</b><span class="meta">ค่ารวม ${sum>=0?"+":""}${sum.toFixed(1)}</span></div>`;}).join("")}</div></details>`:""}
   <div class="chips3"><span class="chip"><small>นักเรียน</small><b class="num pos">+${fmt(r.inc)}</b></span><span class="chip"><small>ค่าใช้จ่าย</small><b class="num neg">-${fmt(r.up+r.wg+(r.debtPay||0))}</b></span><span class="chip"><small>เงินสด</small><b class="num ${r.cash<0?"neg":""}">${fmt(r.cash)}</b></span></div>
   <details><summary>ผลการชกในวงการ (${r.log.length})</summary><div class="log">${r.log.map(l=>`<div>${esc(l)}</div>`).join("")||"<div>เงียบสงบ</div>"}</div></details>`;}
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
  if(m.type==="petname"){const p=(G.pets||[])[m.i];if(!p){UI.modal=null;return "";}body=`<h2>ตั้งชื่อ${esc(PETS[p.k].name)}</h2><div class="petnm"><img class="peti" src="${petIcon(p.k)}" alt=""><input id="petname" maxlength="12" value="${esc(p.name)}" autocomplete="off"></div><p class="meta">ชื่อนี้จะโผล่ในฉากต่าง ๆ ของค่าย</p><button class="btn primary" id="petnamebtn" data-act="petnamesave" data-v="${m.i}">ตั้งชื่อ</button>`;}
  if(m.type==="album"){const byC={};for(const id in CARDS)(byC[CARDS[id].c]=byC[CARDS[id].c]||[]).push(id);const own=G.cards||{};
    body=`<h2>อัลบั้มการ์ด</h2><p class="meta">เก็บได้ ${Object.keys(own).length}/${Object.keys(CARDS).length} ใบ · แตะการ์ดเพื่อดูเรื่องราว · ใบที่ยังไม่ได้แสดงเป็นเงาพร้อมคำใบ้</p>
     <div class="gacha"><span><b class="goldt">✦ ${G.dust||0}</b> เศษดาว<small>ได้จากชนะไฟต์ การ์ดใหม่ และการ์ดซ้ำ · การันตี SSR อีก ${GACHA_PITY-(G.pity||0)} ครั้ง</small></span><button class="btn sm gold" data-act="gacha" ${(G.dust||0)<GACHA_COST?"disabled":""}>สุ่มการ์ด ${GACHA_COST}✦</button></div>
     ${CANON_IDS.filter(c=>byC[c]).map(c=>`<h4 class="albh">${esc(G.F[c].name)}</h4><div class="albg">${byC[c].map(id=>{const C=CARDS[id],o=own[id],R=CARD_R[C.r];
       return o?`<button class="ccard pxc" data-rarity="${C.r}" style="--rc:${R.c}" data-act="cardplay" data-v="${id}" title="${esc(C.t)}">${!o.seen?'<i class="ndot"></i>':""}${cardArtHTML(C,true)}<i class="rr">${C.r}${(o.lv||1)>1?`<u>${o.lv}</u>`:""}</i><span class="tstar">${"★".repeat(R.s)}</span><b>${esc(C.t)}</b></button>`
         :`<button class="ccard pxc lock" data-rarity="${C.r}" style="--rc:#77747d" data-act="cardhint" data-v="${id}" aria-label="การ์ดที่ยังไม่ได้">${cardArtHTML(C,true)}<i class="rr">${C.r}</i><span class="tstar">${"★".repeat(R.s)}</span><b>???</b></button>`;}).join("")}</div>`).join("")}<p class="meta center">แตะการ์ดเงาเพื่อดูวิธีได้</p>`;}
  if(m.type==="cardnew"){const P=G.cardPend||[];const id=P[0];const C=CARDS[id];if(!C){G.cardPend=[];UI.modal=null;return "";}const RR=CARD_R[C.r];body=`<h2>ได้การ์ดใหม่!</h2><div class="gres" style="--rc:${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center meta">${C.hint?esc(C.hint)+" · ":""}ได้เศษดาว <b class="goldt">✦ 5</b>${P.length>1?` · ยังมีการ์ดใหม่อีก ${P.length-1} ใบ`:""}</p></div>
    <div class="mfoot roadbtns"><button class="btn primary" data-act="cardplay" data-v="${id}" data-from="new">ดูเรื่องราวเลย</button><button class="btn" data-act="cardlater">เก็บไว้ดูทีหลัง</button></div>`;foot=false;}
  if(m.type==="gacha"){const R=m.res,C=CARDS[R.id],RR=CARD_R[C.r];body=`<h2>ผลการสุ่ม</h2><div class="gres" style="--rc:${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center">${R.isNew?"<b class=\"goldt\">การ์ดใหม่!</b>":R.up?`การ์ดซ้ำ · อัปเกรดเป็น <b>Lv.${R.up}</b> · ความสนิท +`:`การ์ดเต็มระดับแล้ว · ย่อยเป็น <b class="goldt">✦ ${R.dust}</b>`}</p></div>
    <div class="mfoot roadbtns">${R.isNew?`<button class="btn" data-act="cardplay" data-v="${R.id}">ดูเรื่องราว</button>`:""}<button class="btn gold" data-act="gacha" ${(G.dust||0)<GACHA_COST?"disabled":""}>สุ่มอีก ${GACHA_COST}✦ (มี ${G.dust||0})</button><button class="btn primary" data-act="album">กลับอัลบั้ม</button></div>`;foot=false;}
  if(m.type==="masters"){body=`<h2>เชิญครูมวยโบราณ</h2><p class="meta">${fmt(18000)} ต่อครั้ง · นักมวยแต่ละคนเรียนได้ครั้งเดียวต่อฤดูกาล</p><div class="mlist">${Object.entries(MASTERS).map(([k,M])=>`<div class="mrow"><b>${M.name}</b><small>เสริม ${M.attrs.map(a=>ATTR_LABEL[a]).join(" · ")}</small><div class="obtns">${roster(G).map(f=>`<button class="btn sm" data-act="hiremaster" data-id="${f.id}" data-v="${k}" ${G.cash<M.cost||f.masterSeason===(G.season||1)?"disabled":""}>${esc(f.name)}</button>`).join("")}</div></div>`).join("")}</div>`;}
  if(m.type==="advice"){body=adviceHTML(m.id);foot=false;}
  if(m.type==="drill"){body=drillHTML();foot=false;}
  if(m.type==="tpick"){body=tpickHTML(m.id);foot=false;}
  if(m.type==="fplan"){body=fplanHTML(m.id);foot=false;}
  if(m.type==="hang"){body=hangHTML(m.id);}
  if(m.type==="dm"){foot=false;body=dmBracketHTML();}
  if(m.type==="dmpick"){foot=false;body=dmPickHTML();}
  if(m.type==="camplv"){foot=false;body=campLvHTML();}
  if(m.type==="loan"){foot=false;body=`<h2>เงินกู้ด่วน</h2><div class="loanbox px"><p>ลูกน้องหมวกทองยื่นนามบัตรสีทองมาให้ "เงินด่วน ไม่ต้องค้ำ ไม่ต้องรอ"</p></div>
    <div class="kv-row"><span>ยืม</span><b class="num pos">${fmt(LOAN_AMT)}</b></div><div class="kv-row"><span>ดอกเบี้ย</span><b class="num neg">10% ทุก 4 สัปดาห์ (ทบต้น)</b></div><div class="kv-row"><span>ผลข้างเคียง</span><b class="warnt">พวกหมวกกันน็อกจะมาท้าที่ตลาดบ่อยขึ้น</b></div>
    <p class="meta">คืนได้ทั้งก้อนที่หน้าการเงินเมื่อมีเงินพอ · ครูแดง: "กู้เงินพวกนี้ ปู่ชัยเคยเจ็บมาแล้วนะ"</p>
    <div class="row2"><button class="btn" data-act="closeModal">ไม่เอาดีกว่า</button><button class="btn red" data-act="loanyes">กู้ ${fmt(LOAN_AMT)}</button></div>`;}
  if(m.type==="campres"){foot=false;const a=CAMP_ACTIONS[m.k];const C=CFX[m.k];body=`<div class="campres ${m.skip?"skip":""}">${C?`<div class="cfxwrap" data-act="cfxskip" role="button" aria-label="ข้ามฉาก"><canvas width="320" height="180" data-campfx="${m.k}"></canvas><span class="cfxcap">${esc(C.cap)}</span><i class="cfxbar"></i></div>`:""}
   <div class="cr-res"><h2>${esc(a.name)}</h2><p class="cr-note">${esc(m.note)}</p>${a.cost?`<p class="meta">ใช้เงิน ${fmt(a.cost)}</p>`:""}<div class="mfoot"><button class="btn primary" data-act="closeModal">เยี่ยม!</button></div></div></div>`;}
  if(m.type==="endwarn"){foot=false;body=`<h2>จบสัปดาห์เลยไหม?</h2><ul class="mlist">${m.todo.map(t=>`<li>${t}</li>`).join("")}</ul><p class="meta">ข้ามได้ ไม่มีโทษ แต่อาจเสียโอกาสในสัปดาห์นี้</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">กลับไปทำต่อ</button><button class="btn primary" data-act="endgo">จบสัปดาห์เลย</button></div>`;}
  if(m.type==="signwarn"){const f=G.F[m.id],net=weeklyNet(G)-f.wage;foot=false;
    body=`<h2>เซ็นสัญญา${esc(f.name)}?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดงเตือน:</b> ${net<0?`ถ้าเซ็นตอนนี้ ค่ายจะติดลบ ${fmt(-net)} ทุกสัปดาห์ ต้องพึ่งค่าตัวไฟต์ ถ้าเงินติดลบ 4 สัปดาห์จนเกิน ฿10,000 ค่ายจะล้มละลาย`:`ค่าเซ็น ${fmt(f.fee)} จะทำให้เงินสดเหลือแค่ ${fmt(G.cash-f.fee)} เผื่อเงินฉุกเฉินไว้ด้วย`}</span></div>
     <div class="kv-row"><span>ค่าเซ็น</span><b class="num">${fmt(f.fee)}</b></div><div class="kv-row"><span>ค่าจ้าง</span><b class="num">${fmt(f.wage)}/สัปดาห์</b></div><div class="kv-row"><span>สุทธิต่อสัปดาห์หลังเซ็น</span><b class="num ${net<0?"neg":"pos"}">${fmt(net)}</b></div>
     <div class="mfoot"><button class="btn ghost" data-act="closeModal">รอก่อน</button><button class="btn primary" data-act="sign" data-v="${f.id}" data-ok="1">เซ็นเลย</button></div>`;}
  if(m.type==="levelup"){body=`<h2 class="lvup">LEVEL UP!</h2>${m.ids.map(id=>{const f=G.F[id];return `<div class="lvrow"><div class="l">${faceImg(f,"sm")}<b>${esc(f.name)} Lv.${f.lvl}</b></div>${coachOn()&&f.sp>0&&!hasTree(f.id)?`<p class="hinttxt"><img src="${faceSrc("coach")}" alt=""><span>${skillTip(f)}</span></p>`:""}${skillGrid(f,true)}</div>`;}).join("")}`;}
  if(typeof XMODAL!=="undefined"&&XMODAL[m.type]){const r=XMODAL[m.type](m);body=r.body;foot=r.foot;}
  return `<div class="overlay" data-act="closeModalBg"><div class="px modal pxscroll m-${m.type}${m.type==="fighter"?" fpm t-"+(UI.ptab||"over"):""}" data-sk="modal-${m.type}" role="dialog" aria-modal="true"><button class="xbtn" data-act="closeModal" aria-label="ปิด">✕</button>${body}
    ${foot?`<div class="mfoot"><button class="btn primary" data-act="closeModal">${m.type==="report"||m.type==="levelup"?"ไปต่อ ▸":"ปิด"}</button></div>`:""}</div></div>`;}

// ---------- montage ----------
function montageHTML(){const M=UI.montage;
  return `<div class="montage" role="dialog" aria-label="ฝึกซ้อมประจำสัปดาห์"><div class="mt-bg" style="background-image:url(${ASSET}${gymBg()})"></div>
   <h2 class="mt-h">ฝึกซ้อม · สัปดาห์ที่ ${M.week}</h2><div class="mt-row pxscroll">${M.items.map((g,i)=>{const f=G.F[g.id];const top=Object.entries(g.gains).sort((a,b)=>b[1]-a[1]).slice(0,3).filter(x=>x[1]>=.05);
     const need=xpNeed(f.lvl),pct=f.lvl>=10?100:clamp(f.xp/need*100,0,100),gp=f.lvl>=10?0:clamp(g.xp/need*100,0,pct);
     return `<div class="mt-col px" style="--d:${i*.2}s"><canvas width="160" height="150" data-sprite="${f.id}" data-floor="1"></canvas>
      <div class="mt-info"><b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b><span class="pill">${g.injury?"พักรักษาตัว":PRESETS[g.preset].name}</span>
      <div class="pops">${top.map(([k,v],j)=>`<span style="--d:${i*.2+.3+j*.2}s">${ATTR_LABEL[k]} +${v.toFixed(1)}</span>`).join("")||'<span class="dim">ฟื้นร่างกาย</span>'}</div>
      <div class="mt-xp"><i style="--v:${pct}%;--g:${gp}%;--d:${i*.2+.8}s"></i><small>EXP +${g.xp}${f.lvl<10?` · ${Math.round(f.xp)}/${need}`:" · MAX"}</small></div></div></div>`;}).join("")}</div>
   <button class="btn primary mt-go" data-act="montageDone">${M.fights?"ไปขึ้นชก ▸":"ไปต่อ ▸"}</button></div>`;}

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
function nameCall(n,t){if(typeof t!=="string"||!G||!G.F[n]||!G.F[n].canon||(G.F[n].bond||0)<25)return t;const nm=G.player.name;return t.replace(/^ผู้จัดการ(?=คะ|ครับ|!|…| )/,"คุณ"+nm).replace(/^Manager(?=[,!…. ])/,nm);}
function sceneChoose(k){const S=UI.scene,c=S.cur.choice[k];AU.sfx("ui");if(c.fx)c.fx(G);S.steps.splice(S.i+1,0,...(c.then||[]));S.i++;sceneNext();}
function sceneHTML(){const S=UI.scene,c=S.cur||{};const sp=c.n==="coach"?{name:c.tel?"ครูแดง (โทรมา)":"ครูแดง",color:"#d98a4a"}:c.n==="npc"?{name:c.who||"",color:"#8fbf6a"}:(SPK[c.n]||{name:""});
  const who=c.n==="me"?esc(G.player.name):c.n==="nar"?"":esc(sp.name||"");
  const spk=c.n||S.lastN;if(c.n)S.lastN=c.n;
  const bgKey=(S.bg==="gym"||S.bg==="camp")?gymBg():BGIMG[S.bg];
  const cast=S.cast.map((m,i)=>{const active=m.id===spk||(c.choice&&i===S.cast.length-1);const pos=S.cast.length===1?"c":i===0?"l":"r";
    return `<img class="stand ${pos} ${active&&!m.back?"on":"off"}${m.back?" back":""}" src="${m.id.startsWith("npc:")?`${ASSET}npc_${m.id.slice(4)}.webp`:m.back?`${ASSET}${m.id}_back.webp`:stand(m.id,m.look,active?moodFor(c.f,m.look,c.t):moodFor(m.f,m.look,""))}" alt="">`;}).join("");
  const tag="";
  return `<div class="vn" role="dialog" aria-label="ฉากเนื้อเรื่อง"><div class="vbg bg-${S.bg==="camp"?"gym":S.bg}" ${bgKey?`style="background-image:url(${ASSET}${bgKey})"`:""}></div>${S.bg==="night"?'<div class="vnight"></div>':""}
   <div class="cast ${(S.cast||[]).length>1?"duo":""}">${cast}</div>
   ${c.choice?"":`<button class="vtap" data-act="vnext" aria-label="ไปต่อ"></button>`}
   <div class="vbox px" data-act="${c.choice?"":"vnext"}" style="--c:${sp.color||"var(--gold)"}">
    ${c.choice?`<div class="choices">${(UI._ck!==c?(UI._ck=c,UI._ct=Date.now()):0,"")}${c.choice.map((o,i)=>{const t=val(o.t),m0=t.match(/^(.*?)\s*\(([^()]*)\)\s*$/),m=m0&&m0[1].trim()?m0:null,act=m0&&!m0[1].trim();return `<button data-act="vchoose" data-v="${i}" ${act?'class="cact"':""}>${esc(act?m0[2]:m?m[1]:t)}${m?`<small class="cfx">${esc(m[2])}</small>`:""}</button>`;}).join("")}</div>`:
     `${who?`<div class="who">${tag}<b>${who}</b></div>`:""}<div class="txt ${c.n==="nar"?"nar":""}">${esc(c.t||"")}</div><div class="nextc">แตะเพื่อไปต่อ ▸</div>`}
   </div><button class="btn sm vskip" data-act="vskip">ข้ามฉาก</button></div>`;}
function sceneSkip(){let g=0;while(UI.scene&&g++<300){const s=UI.scene;if(s.cur&&s.cur.choice)sceneChoose(0);else sceneNext();}}

// ---------- week-1 guide ----------
const TUTORIAL=()=>[
  {n:"coach",bg:"gym",t:`เอาล่ะ ${G.player.name} ครูจะเล่าให้ฟังว่าหนึ่งสัปดาห์ของเจ้าของค่ายต้องทำอะไรบ้าง`},
  {n:"coach",t:"หนึ่ง: ไปที่แท็บ 'ฝึก' เลือกโปรแกรมให้กะทิ ซ้อมหนักได้ของเยอะแต่ล้าเร็ว ถ้าความล้าเกิน 65 ให้พักฟื้น"},
  {n:"coach",t:"สอง: แท็บ 'ไฟต์' มีข้อเสนอให้ชก ครูจะติดสีให้ เขียวคือคู่อ่อนกว่า เหลืองคือสูสี แดงคือเก่งกว่า เก่งกว่าค่าตัวก็สูงกว่า อยากรู้ทางคู่ชกละเอียดต้องดูเทปก่อน"},
  {n:"coach",t:"ก่อนขึ้นชกเลือกแผนกับแทคติกเอง ระหว่างพักยกครูจะรายงานว่ายกนั้นเกิดอะไรขึ้น ส่วนการตัดสินใจเป็นของเรา"},
  {n:"coach",t:"สาม: ปุ่มสีทอง 'เลือกกิจกรรมค่าย' ใต้ภาพค่าย เลือกได้สัปดาห์ละอย่าง บางอย่างได้เงิน บางอย่างเสียเงิน ไม่อยากจ่ายก็เลือก 'วันหยุดค่าย' ได้"},
  {n:"coach",t:"สี่: การ์ดนักมวยด้านล่าง แตะเพื่อดูค่าพลัง สกิล และความสัมพันธ์ ส่วนเวลาว่างก็ใช้ชวนนักมวยออกไปข้างนอก ความสนิททำให้ใจสู้"},
  {n:"coach",t:"เงินมาจากนักเรียนคอร์สมวยกับค่าตัวไฟต์ ช่วงแรกคนยังไม่รู้จักค่ายเรา ใช้เงินระวังหน่อย หนี้ปู่ยังเหลือแสนสอง"},
  {n:"coach",t:"ทำครบแล้วกด 'จบสัปดาห์' มุมบนขวา ครูจะคอยกระซิบอยู่ด้านบนหน้าค่าย ถ้ารำคาญก็กดปิดได้ หรือปิดถาวรในตั้งค่า"},
  {n:"kati",f:"happy",l:"train",with:"coach",t:"ครูแดงพูดยาวที่สุดในรอบปีเลยค่ะ! ฝากตัวด้วยนะคะ เจ้าของค่าย!"}];
function tutorialHTML(){const T=G.tut||{};const items=[["train","ตั้งโปรแกรมฝึก",T.train,"train"],["fights","ดูข้อเสนอไฟต์",T.fights,"fights"],["camp","เลือกกิจกรรมค่าย",!!G.campUsed,"campacts"],["free","ชวนนักมวยออกไป",G.freeUsed,"people"]];
  const done=items.filter(i=>i[2]).length;
  return `<div class="tut">${items.map(([k,t,ok,go])=>`<button class="tutb ${ok?"ok":""}" data-act="tipact" data-k="${go==="campacts"?"campacts":"tab"}" data-v="${go}">${ok?"☑":"☐"} ${t}</button>`).join("")}</div>
   ${done===4?`<p class="meta">ครบแล้ว! กด 'จบสัปดาห์' ได้เลย</p>`:""}`;}
function goalText(){const st=stageOf(G.week),me=roster(G);const best=d=>{const rows=standings(G,d);const i=rows.findIndex(r=>r.f.camp==="player");return i<0?null:{i:i+1,f:rows[i].f};};
  const a=best("A");
  if(st==="local")return `เป้าหมาย: ติดท็อป 4 รอบตำบลภายในสัปดาห์ 20${a?` · ${a.f.name}อยู่อันดับ ${a.i}`:""}`;
  if(st==="district"){const inQ=[...G.qual.A,...G.qual.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inQ?`เป้าหมาย: ติดท็อป 4 รอบอำเภอภายในสัปดาห์ 40 เพื่อไปรองชิงจังหวัด${a?` · ${a.f.name}อันดับ ${a.i}`:""}`:"เป้าหมาย: ปีนี้พลาดรอบอำเภอ สร้างค่ายให้แกร่งและเก็บเงินรอฤดูกาลหน้า";}
  if(st==="final"&&G.week<=44&&[...((G.semis||{}).A||[]),...((G.semis||{}).B||[])].some(id=>G.F[id]&&G.F[id].camp==="player")&&!G.finalists.A.concat(G.finalists.B).some(id=>G.F[id]&&G.F[id].camp==="player"))return "เป้าหมาย: ชนะรอบรองชิงจังหวัด สัปดาห์ 44";
  if(st==="final"){const inF=[...G.finalists.A,...G.finalists.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inF?"เป้าหมาย: ชิงแชมป์จังหวัด สัปดาห์ 49 ห้ายก":"เป้าหมาย: ดูแลค่ายจนจบฤดูกาล";}
  return "ปิดปี · เตรียมตัวสำหรับปีหน้า";}

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
    playScene([{n:"nar",t:"— เรื่องที่ต้องตัดสินใจ —"},...d.steps],done,{bg:d.bg==="camp"?"gym":d.bg,look:d.look||"train"});return;}
  const chats=CHATTER.filter(c=>!G.seen[c.id]&&c.need(G));const haps=HAPPENINGS.filter(h=>!G.seen[h.id]);
  const chats2=chats.filter(c=>!c.need2||c.need2(G)),haps2=haps.filter(h=>!h.need||h.need(G));
  let pick=null;if(chats2.length&&rng()<.6)pick=chats2[Math.floor(rng()*chats2.length)];else if(haps2.length&&rng()<.7)pick=haps2[Math.floor(rng()*haps2.length)];
  if(!pick){done();return;}G.seen[pick.id]=true;playScene(pick.steps,done,{bg:pick.bg==="camp"?"gym":pick.bg,look:pick.look||"train"});}
function afterWeekFlow(){if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);}}if(typeof mailWeekly==="function"&&!G.ended)mailWeekly(G);if(typeof chatWeekly==="function"&&!G.ended)chatWeekly(G);runEvents(played=>{const fin=()=>{if(G.ended){startEnding();return;}
    if(typeof cardCheck==="function"){const g2=cardCheck(G);if(g2.length)G.cardPend=(G.cardPend||[]).concat(g2);}relTierCheck();if(typeof OUTFITS!=="undefined"){G.outSeen=G.outSeen||{};const nu=Object.keys(OUTFITS).filter(k=>k!=="base"&&k!=="heart"&&!G.outSeen[k]&&outfitOk(G,null,k));nu.forEach(k=>G.outSeen[k]=1);if(nu.length)setTimeout(()=>toast(`ปลดล็อกชุดใหม่: ${nu.map(k=>OUTFITS[k].name).join(", ")} · เปลี่ยนได้ที่โปรไฟล์นักมวย แท็บ "ชุด"`),400);}if(UI.relUp&&UI.relUp.length){const m=UI.relUp.join(" / ");UI.relUp=[];setTimeout(()=>toast("♥ "+m),300);}
    if(G.levelUps&&G.levelUps.length){const ids=[...new Set(G.levelUps)];G.levelUps=[];AU.sfx("level");UI.modal={type:"levelup",ids};}else if((G.cardPend||[]).length){AU.sfx&&AU.sfx("level");UI.modal={type:"cardnew"};}render();};
    const go=()=>coachBackScene(()=>aftermathScene(()=>tiredScene(()=>rinScene(fin))));if(played)go();else weeklyExtra(go);});}
// v1.15: a worn-out fighter asks for a rest week herself
function tiredScene(done){G.tiredAt=G.tiredAt||{};const f=roster(G).find(x=>!x.injury&&x.fatigue>=58&&x.plan.preset!=="rest"&&(G.tiredAt[x.id]||-9)<G.week-3);if(!f||!coachOn()&&f.fatigue<70){done();return;}
  G.tiredAt[f.id]=G.week;const ask=vary("tired_"+f.id,({kati:["ครูคะ… ขามันหนักไปหมดเลย ขอพักสักสัปดาห์ได้ไหมคะ","หนูวิ่งเช้านี้ช้ากว่าเมื่อวานอีกค่ะ… ขอพักสักหน่อยนะคะ","ไหล่หนูยกไม่ขึ้นแล้วค่ะ ครู… หนูยังไหวนะ แต่…"],mali:["ฮือ… มะลิเตะไม่ขึ้นแล้วอ่ะ ขอนอนยาว ๆ สักอาทิตย์นะ~","มะลิหลับในตอนยืดเส้นไปแล้วสองรอบ… ขอพักนะคะ","ขามะลิสั่นเหมือนเยลลี่เลยอ่ะ~ วันนี้ขอนอนได้ไหม"],rin:["ตัวเลขชีพจรตอนเช้าฉันสูงผิดปกติ… ร่างกายต้องการพักค่ะ","กราฟความล้าของฉันพุ่งเกินเส้นแดงแล้วค่ะ ขอพักหนึ่งสัปดาห์","ฉันพิมพ์ผิดในสเปรดชีตสามครั้งเช้านี้… ร่างกายเตือนแล้วค่ะ"]})[f.id]||["ขอพักสักหน่อยได้ไหมคะ"]);
  playScene([{n:f.id,f:"sad",l:"fight",t:ask},...(coachOn()?[{n:"coach",t:`ล้า ${Math.round(f.fatigue)} แล้ว ฝืนต่อเสี่ยงเจ็บ ครูว่าพักฟื้นสัปดาห์นี้`}]:[]),
    {choice:[{t:"ให้พักฟื้นสัปดาห์นี้",fx:()=>{if(!trLocked(f))f.plan.preset="rest";f.morale=Math.min(100,f.morale+4);},then:[{n:f.id,f:"happy",l:"fight",t:{kati:"ขอบคุณค่ะ! สัปดาห์หน้าหนูจะกลับมาเต็มร้อย",mali:"เย้~ นอนกอดเจ้าโค้ชทั้งวันเลย!",rin:"ขอบคุณค่ะ ฉันจะใช้วันพักทบทวนเทปไปด้วย"}[f.id]||"ขอบคุณค่ะ!"}]},
     {t:"อดทนอีกนิด ไฟต์ใกล้แล้ว",fx:()=>{f.morale=Math.max(0,f.morale-5);},then:[{n:f.id,f:"sad",l:"fight",t:{kati:"…ค่ะ หนูจะพยายาม",mali:"งื้อ… ได้ค่ะ แต่ห้ามดุนะถ้ามะลิช้า",rin:"…รับทราบค่ะ ฉันจะบันทึกไว้ว่าฝืนเพราะอะไร"}[f.id]||"…ค่ะ"}]}]}],()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"fight"});}
function aftermathScene(done){const L=G.lastBig;if(!L||L.shown||G.week-L.wk>1){done();return;}L.shown=true;const me=G.F[L.a];if(!me||me.camp!=="player"){done();return;}
  playScene(aftermathSteps(G,L),()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"train"});}
// v1.15: Kru Daeng comes back from his leave and checks on everyone
function coachBackScene(done){if(!G.coachAway||G.week<G.coachAway||(G.flags&&G.flags.coachBack)){done();return;}G.flags=G.flags||{};G.flags.coachBack=true;const R=roster(G);const k=R[0];
  const tired=R.filter(f=>f.fatigue>=50).map(f=>f.name);
  playScene([{n:"nar",t:"เช้าวันจันทร์ เสียงรถมอเตอร์ไซค์คันเก่าจอดหน้าค่าย"},{n:"coach",t:"ครูกลับมาแล้ว! ไม่อยู่สองอาทิตย์ ค่ายยังไม่พังใช่ไหม ฮ่า ๆ"},
    ...(k?[{n:k.id,f:"happy",l:"train",t:k.id==="kati"?"ครูแดง! คิดถึงที่สุดเลยค่ะ ไม่มีใครตะโกนใส่ตอนเช้า มันเงียบไปหมด":"ยินดีต้อนรับกลับค่ะครู!"}]:[]),
    {n:"coach",t:tired.length?`ครูดูหน้า${tired.join(", ")}แล้ว ล้ากันเกินไปนะ สัปดาห์นี้ครูจะคุมโปรแกรมให้เอง`:"ทุกคนดูฟิตดี ผู้จัดการดูแลได้ดีนี่ งั้นกลับมาซ้อมเต็มที่กัน!"},
    {n:"nar",t:"คำแนะนำครูกลับมาใช้ได้อีกครั้ง"}],()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"train"});}
// v1.15: Rin drops by every 3 weeks with a plain-language briefing: next fight, training, money
function rinScene(done){const r=G.F.rin;if(!r||r.camp!=="player"||G.week%3!==0||G.rinSeen===G.week){done();return;}G.rinSeen=G.week;const R=roster(G);const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};const L=[];
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];
  if(nb){const op=G.F[nb.b],me=G.F[nb.a];L.push(`ไฟต์ถัดไป: ${me.name} เจอ${op.name} สัปดาห์ ${nb.week} เขา${COUNTER_WHY[counterPreset(op)]}`);L.push([`ง่าย ๆ เลยค่ะ ก่อนวันชกให้ฝึก "${PRESETS[counterPreset(op)].name}" แล้วสัปดาห์ที่ชกเปลี่ยนเป็น "เตรียมไฟต์"`,`ถ้าดูเทปแล้ว ฝึก "${PRESETS[counterPreset(op)].name}" จะได้โบนัสแก้ทางค่ะ อย่าลืมเตรียมไฟต์สัปดาห์ที่ชก`,`สูตรของฉันคือ "${PRESETS[counterPreset(op)].name}" ก่อน แล้ว "เตรียมไฟต์" ตอนใกล้ชกค่ะ`][Math.floor(G.week/3)%3]);}
  const tired=R.filter(f=>f.fatigue>=50);const w=R.map(f=>[f,RADAR_AX.map(([n,fn])=>[n,fn(f.a)]).sort((a,b)=>a[1]-b[1])[0]]).sort((a,b)=>a[1][1]-b[1][1])[0];
  // v1.22.1: rotate whose weakness Rin talks about, and how she says it
  const rf=R[Math.floor(G.week/3)%R.length],rw=RADAR_AX.map(([n,fn])=>[n,fn(rf.a)]).sort((a,b)=>a[1]-b[1]);const rpick=rw[Math.floor(G.week/6)%2]||rw[0];
  const RW=[`รอบนี้ขอพูดถึง${rf.name}ค่ะ ${rpick[0]}ยังต่ำสุดในตัวเธอ ฝึกเพิ่มนิดเดียวก็เห็นผล`,`${rf.name}ยังเปิดช่องที่${rpick[0]}อยู่ค่ะ คู่ชกที่อ่านเกมเป็นจะเล็งตรงนั้น`,`ถ้าให้เลือกจุดเดียวที่ควรแก้ตอนนี้ ฉันเลือก${rpick[0]}ของ${rf.name}ค่ะ`];
  L.push(tired.length?`${tired.map(f=>f.name).join(", ")}ล้าเกินครึ่งแล้ว ให้พักฟื้นสักสัปดาห์ จะกลับมาแรงกว่าเดิม`:RW[Math.floor(G.week/3)%RW.length]);
  const net=weeklyNet(G),wl=weeksLeft();
  L.push(net<0?`เรื่องเงิน: ตอนนี้ขาดทุนสัปดาห์ละ ${fmt(-net)} อีกราว ${wl} สัปดาห์เงินจะหมด รับไฟต์เพิ่ม หรือเลือกกิจกรรมสอนคลาสพิเศษช่วยได้ค่ะ`:G.cash>40000?`เรื่องเงิน: มีเงินเหลือ ${fmt(G.cash)} ลองอัปเกรดค่ายหรือส่งครูแดงไปอบรม ระยะยาวคุ้มกว่าเก็บไว้ค่ะ`:`เรื่องเงิน: ได้กำไรสัปดาห์ละ ${fmt(net)} ยังไหวค่ะ แต่อย่าเพิ่งใช้จ่ายเยอะ`);
  G.rinNote={wk:G.week,steps:[{n:"rin",f:"happy",l:"casual",t:["ผู้จัดการคะ ฉันสรุปข้อมูลสามสัปดาห์มาให้แล้วค่ะ","รายงานประจำรอบค่ะ อ่านจบในสามนาที …ถ้าอ่านเร็ว","ผู้จัดการคะ กราฟใหม่มาแล้วค่ะ ไม่ยาว สัญญาค่ะ","ฉันนอนดึกทำตารางนี้ค่ะ …ไม่ได้อยากให้ชมนะคะ","ข้อมูลสามสัปดาห์ล่าสุดค่ะ มีข่าวดีหนึ่ง ข่าวต้องระวังหนึ่ง"][Math.floor(G.week/3)%5]},...L.map(t=>({n:"rin",f:"happy",l:"casual",t})),{n:"rin",f:"flustered",l:"casual",t:["…แค่นี้แหละค่ะ ใช้ได้ก็ใช้นะ","จบรายงานค่ะ คำถามเชิญได้ …ไม่มีก็ดีค่ะ","ฉันพิมพ์สรุปไว้บนบอร์ดหน้าห้องซ้อมแล้วนะคะ","ถ้าทำตามนี้ ฉันประเมินว่าเราจะดีขึ้นแน่นอนค่ะ"][Math.floor(G.week/3)%4]}]};done();}

// ---------- week flow ----------
function endWeek(){if(UI.scene||UI.fight||UI.montage)return;AU.resume();UI.tipIdx=0;
  weekTrain(G);
  for(const b of G.bookings.filter(b=>b.week===G.week&&b.npc)){const F=quickFight(G.F[b.a],G.F[b.b],G.seed+G.week*97+b.id.length,b.rounds);finishBracket(G,b,F);applyResult(G,F,b);
    G.log.push(`${TIER[b.tier].name} รุ่น ${G.F[b.a].div}: ${G.F[b.a].name} ${F.result.win==="A"?"ชนะ":"แพ้"} ${G.F[b.b].name} (${F.result.type})`);}
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
      out.push({f,d,t:G.champ[d]===id?"แชมป์จังหวัด":G.finalists[d].includes(id)?"รองแชมป์จังหวัด":((G.semis||{})[d]||[]).includes(id)?"รอบรองชิงจังหวัด":"รอบอำเภอ",c:G.champ[d]===id?"gold":G.finalists[d].includes(id)?"green":""});}}
  return out;}
/* v1.72: the public demo stops after year 1 until the player enters the code from the game's Discord. One code opens every slot on this device; saves already past year 1 stay open */
const GATE={code:"U0lSSUNIQUky",url:"https://discord.gg/pgBG3cd9HD",key:"mtm-unlock"};
function gateOpen(){try{if(localStorage.getItem(GATE.key)==="1")return true;}catch(e){}return !!(G&&(G.unlocked||(G.season||1)>=2));}
function gateHTML(){return `<section class="px card gate"><span class="pill gold">เดโมจบปีที่ 1</span><h3>ขอบคุณที่เล่นมาถึงตรงนี้!</h3>
  <p>อยากเล่นต่อปีที่ 2 เข้า Discord ของเกม แล้วรับโค้ดในห้อง #โค้ดเล่นต่อ เซฟของคุณเก็บไว้ครบ ใส่โค้ดเมื่อไหร่ก็เล่นต่อได้ทันที</p>
  <a class="btn gatelink" href="${GATE.url}" target="_blank" rel="noopener">เข้า Discord ของเกม ▸</a>
  <div class="gatein"><input id="gatecode" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ใส่โค้ดตรงนี้" aria-label="โค้ดเล่นต่อ"><button class="btn primary" data-act="gatego">ปลดล็อก</button></div>
  ${UI.gateErr?'<p class="meta redt">โค้ดไม่ถูก ลองเช็กตัวสะกดอีกครั้ง</p>':""}</section>`;}
function endingHTML(){const E=UI.ending,all=roster(G),res=seasonResult();
  return `<main class="endpage"><section class="px card end-hero"><img class="endlogo" src="${ASSET}logo.webp" alt="Muay Thai Moe">
    <span class="pill gold">${G.ended==="bankrupt"?"ค่ายปิดตัว":(G.season||1)>=2?`จบปีที่ ${G.season}`:"จบบทที่ 1 · ปีที่ 1"}</span><h1>${(G.season||1)>=2&&G.ended!=="bankrupt"?esc(E.title):`ฉากจบ: ${E.title}`}</h1>
    <p class="lead">${(G.season||1)>=2&&G.ended!=="bankrupt"?`ปีที่ ${G.season} ผ่านไปแล้ว ${esc(G.player.name)} กับค่ายศิริชัยยังเดินหน้าต่อ`:`ขอบคุณที่เล่น <b>Muay Thai Moe</b>! ${esc(G.player.name)} พาค่ายศิริชัยมาได้ถึงตรงนี้แล้ว`}</p></section>
   <section class="px card"><h3>ผลงานปีนี้</h3>${res.length?res.map(r=>`<div class="kv-row"><span>${faceImg(r.f,"sm")} ${esc(r.f.name)} · รุ่น ${r.d}</span><span class="pill ${r.c}">${r.t}</span></div>`).join(""):'<p class="meta">ปีนี้ยังไม่มีนักมวยผ่านรอบตำบล</p>'}</section>
   <div class="grid g3"><section class="px card"><h3>ค่าย</h3><div class="kv-row"><span>ระดับค่าย</span><b>Lv.${campLevel(G)} ${CAMP_LV_NAME[campLevel(G)]}</b></div><div class="kv-row"><span>เงินสด</span><b class="num">${fmt(G.cash)}</b></div><div class="kv-row"><span>หนี้คงเหลือ</span><b class="num">${fmt(G.debt)}</b></div><div class="kv-row"><span>นักเรียน</span><b class="num">${students(G)} คน</b></div><div class="kv-row"><span>ชื่อเสียง</span><b class="num">${G.rep.toFixed(1)}</b></div></section>
   <section class="px card"><h3>นักมวยในค่าย</h3>${all.map(f=>`<div class="kv-row"><span>${esc(f.name)} Lv.${f.lvl}</span><span class="num">${rec(f)}</span></div>`).join("")}</section>
   <section class="px card"><h3>ความสัมพันธ์</h3>${CANON_IDS.map(id=>G.F[id]).filter(f=>f.met).map(f=>`<div class="kv-row"><span>${esc(f.name)}${G.romance===f.id?" ♥ คนรัก":G.promise&&G.promise[f.id]!=null?" ♡ สัญญาไว้":""}</span>${hearts(f.bond)}</div>`).join("")}</section></div>
   <section class="px card teaser"><span class="pill red">บทต่อไป · เร็ว ๆ นี้</span><h3>เส้นทางสู่เวทีระดับภาค</h3>
    <ul><li>ค่ายพยัคฆ์ทองดึงเทรนเนอร์จากกรุงเทพฯ และฟ้าจะไม่ใช่คนเดิมอีกต่อไป</li><li>นักมวยหน้าใหม่จากมวยท่าเสาและมวยโคราชกำลังมองหาค่าย</li><li>หนี้ของปู่ชัยยังมีความลับที่กะทิไม่ได้เล่าทั้งหมด</li></ul></section>
   <p class="meta center">Seed ${esc(G.seedText||String(G.seed))} · ปีที่ ${G.season||1}</p>${!DEMO&&G.ended==="season"&&!gateOpen()?gateHTML():""}<div class="center endbtns">${!DEMO&&G.ended==="season"&&gateOpen()?`<button class="btn primary" data-act="newseason">เล่นต่อ ปีที่ ${(G.season||1)+1} ▸</button><p class="meta center">ค่าย นักมวย และความสัมพันธ์ไปต่อทั้งหมด · คู่แข่งก็ซ้อมหนักขึ้นเหมือนกัน</p>`:""}<button class="btn primary" data-act="replay">เล่นใหม่อีกรอบ</button><button class="btn" data-act="restart">กลับหน้าแรก</button></div></main>`;}

// ---------- FIGHT ----------
function fightFaceoff(b){const me=G.F[b.a],op=G.F[b.b],key=`${b.a}_${b.b}`,h=G.h2h&&G.h2h[op.id],s=G.faceoffStats&&G.faceoffStats[key],last=G.faceoffLast&&G.faceoffLast[key];
  const met=h&&(h.w+h.l+h.d)>0;
  const tally=s&&(s.w+s.l+s.d)>=2?` ตอนนี้เราเจอกัน ${s.w+s.l+s.d} ครั้ง เธอชนะ ${s.w} ฉันชนะ ${s.l}${s.d?` เสมอ ${s.d}`:""}`:"";
  const rival={ploy:"คราวนี้ฉันจะดูว่าเธออ่านเกมฉันออกไหม",fah:"ขึ้นมาเลย! ฉันรอไฟท์นี้อยู่",kati:"หนูไม่ยอมถอยหรอกนะคะ",mali:"วันนี้มะลิจะชกให้สวยเลย~",rin:"ฉันวิเคราะห์ทางชกของเธอมาแล้วค่ะ"};
  const opener=last?(last.win==="A"?`คราวก่อนเธอชนะฉัน ไฟท์นี้ฉันเตรียมแก้ทางมาแล้ว`:last.win==="B"?`คราวก่อนฉันชนะ แต่วันนี้เธอดูไม่เหมือนเดิม`:"คราวก่อนเสมอกัน วันนี้ต้องมีคนชนะ")+tally
    :s?`เราเจอกันมา ${s.w+s.l+s.d} ครั้งแล้ว เธอชนะ ${s.w} ฉันชนะ ${s.l}${s.d?` เสมอ ${s.d}`:""} วันนี้มาดูกันอีกที`
    :met?"เราเคยเจอกันมาแล้ว วันนี้มาดูกันว่าใครเตรียมตัวมาดีกว่า"
    :rival[op.id];
  const reply=last?(last.win==="A"?`ครั้งก่อนฉันชนะ แต่วันนี้จะไม่ประมาทเธอ`:last.win==="B"?`ครั้งก่อนฉันแพ้ วันนี้ฉันกลับมาแก้มือ`:"คราวก่อนยังไม่รู้ผล วันนี้ชกให้ชัดไปเลย")
    :({kati:"ค่ายศิริชัยกลับมาแล้วค่ะ หนูจะชกให้เต็มที่!",mali:"ได้เลย~ มะลิพร้อมแล้ว!",rin:"ข้อมูลอยู่ในหัวแล้วค่ะ มาเริ่มกันเลย",ploy:"ฉันจะให้คำตอบบนเวที",fah:"ดี! ฉันชอบคนที่กล้าสู้"})[me.id]||"ฉันพร้อมแล้ว มาเริ่มกันเลย";
  return [{n:"nar",t:`${me.name}กับ${op.name}เดินมาพบกันกลางเวทีก่อนเสียงปี่ชวา`},
    {n:op.id,f:"angry",l:"fight",t:opener},
    {n:me.id,f:"angry",l:"fight",with:op.id,t:reply}];}
function openFight(b,done){const op=G.F[b.b],k=`taunt_${b.a}_${b.b}_${stageOf(G.week)}`;
  if(!op.canon){openFight2(b,done);return;}
  let sc=null;const key=`${b.a}_${b.b}`;
  if(op.canon&&!G.seen[k]&&!(G.faceoffLast&&G.faceoffLast[key])&&!(b.tier==="final"&&(G.seen.ploy_prefinal||G.seen.fah_prefinal))){sc=tauntScene(G,b.a,b.b);if(sc)G.seen[k]=true;}
  playScene(sc||fightFaceoff(b),()=>openFight2(b,done),{bg:TIER_BG[b.tier]?TIER_BG[b.tier].replace(/^bg_|\.webp$/g,""):"local",look:"fight"});}
// Wai khru opens the first bout, canon matchups, and major bouts.
const RAM={phrom:{name:"พรหมสี่หน้า",hint:"ไหว้ครบสี่ทิศ · ใจนิ่ง แม่นขึ้นยกแรก"},hong:{name:"หงส์เหิน",hint:"สง่างามดั่งหงส์ · กำลังใจ +6"},
  phra:{name:"พระรามแผลงศร",hint:"น้าวคันศร · ยกแรกออกอาวุธดุดัน"}};
function waiKhruScene(b){const me=G.F[b.a],first=!(G.flags&&G.flags.waiSeen);const away=!!(G.coachAway&&G.week<G.coachAway);
  const own=vary("own_"+me.id,{kati:["คุณปู่คะ… ไฟต์นี้หนูไหว้ครูให้คุณปู่นะคะ","ปู่คะ ดูหนูนะ หนูจะรำให้เหมือนที่ปู่สอนทุกท่าเลย","หนูซ้อมท่ารำทุกเช้าเลยนะคะปู่ วันนี้ไม่พลาดแน่!"],mali:["แม่จ๋า มะลิจะรำให้สวยที่สุดเลย","แม่ดูไลฟ์อยู่ไหมน้า~ มะลิจะโบกมือให้ตอนรำท่าสุดท้าย!","รำเสร็จแล้วมะลิจะได้หายตื่นเต้น… มั้งนะ~"],rin:["ไหว้ครูไม่ใช่แค่พิธี มันคือการตั้งสมาธิ… ฉันพร้อมแล้ว","ระหว่างรำฉันจะสังเกตการยืนของคู่ชก …ครูไม่ว่าใช่ไหมคะ","ชีพจรฉันลดจาก 112 เหลือ 88 ทุกครั้งที่รำจบ น่าสนใจมากค่ะ"],ploy:["ครูสอนว่าก่อนชนะคนอื่น ต้องชนะใจตัวเองก่อน"],fah:["รำให้คนดูจำได้เลย คอยดูนะ!"]}[me.id]||["ขอไหว้ครูก่อนนะคะ"]);
  return [{n:"nar",t:vary("wai1",["ปี่ชวาขึ้นเสียงแหลมยาว กลองแขกตีเป็นจังหวะช้า ฉิ่งดังกังวาน ถึงเวลา \"ไหว้ครูรำมวย\"","เสียงปี่ชวาดังขึ้น คนดูลดเสียงลงเอง ถึงเวลาไหว้ครู","กลองแขกเริ่มตีช้า ๆ ทั้งเวทีเงียบลง นักมวยค่อย ๆ ก้าวขึ้นเชือก","ฉิ่งดังสามที เพลงไหว้ครูเริ่มขึ้น ลมเย็นพัดผ่านเวทีพอดี"])},
    ...(first&&!away?[{n:"coach",t:"ไหว้ครูคือการระลึกถึงครูบาอาจารย์ พ่อแม่ และสิ่งศักดิ์สิทธิ์ นักมวยจะเดินรอบเวที \"ปิดเวที\" ก่อน แล้วค่อยรำ"}]:[]),
    {n:"nar",t:vary("wai2_"+me.id,({kati:[`กะทิสวมมงคลบนศีรษะ ผูกประเจียดที่ต้นแขน ก้มกราบสามครั้งกลางเวที`,`กะทิเดินปิดเวทีเร็วกว่าทุกคน ก้าวยาวจนผ้าประเจียดสะบัด แล้วกราบหนักแน่นสามที`,`ก่อนกราบ กะทิแตะประเจียดของปู่ชัยที่ผูกต้นแขนอยู่ แล้วยิ้มกับตัวเอง`],
      mali:[`มะลิสวมมงคล ยิ้มให้กล้องที่แม่ดูอยู่ แล้วก้มกราบช้า ๆ สามครั้ง`,`มะลิรำท่าแบบสายไชยาที่แม่สอน มือนุ่มเหมือนรำละคร คนดูปรบมือก่อนรำจบ`,`มะลิเผลอยิ้มแป้นตอนรำ พอนึกได้ก็รีบทำหน้าขรึม แต่ก็ยิ้มอีกอยู่ดี`],
      rin:[`รินถอดแว่นยื่นให้ครูแดง สวมมงคล แล้วกราบสามครั้งอย่างเป็นระเบียบ`,`รินเดินปิดเวทีนับก้าวในใจ ทุกมุมเท่ากันเป๊ะสิบสองก้าว`,`รินหลับตารำ ไม่เหลียวมองคนดูเลยสักครั้ง สมาธิแน่นิ่งจนคนรอบเวทีเงียบตาม`]})[me.id]||[`${me.name}สวมมงคลบนศีรษะ ผูกประเจียดที่ต้นแขน ก้มกราบสามครั้งกลางเวที`])},
    {n:me.id,f:"happy",l:"fight",t:own},
    {choice:Object.entries(RAM).map(([k,r])=>({t:`รำท่า${r.name} — ${r.hint}`,fx:()=>{b.wai=k;if(k==="hong")me.morale=Math.min(100,me.morale+6);}}))},
    ...(away?[{n:"nar",t:"จบท่ารำ ครูแดงลาพักอยู่ คุณจึงเป็นคนถอดมงคลออกจากศีรษะให้เอง"}]:[{n:"nar",t:vary("wai3",["จบท่ารำ ครูแดงถอดมงคลออกจากศีรษะ เป่ากระหม่อมเบา ๆ แล้วตบไหล่หนึ่งที","ครูแดงถอดมงคลออก กระซิบคาถาสั้น ๆ ข้างหู","ครูแดงยื่นน้ำให้หนึ่งอึก แล้วถอดมงคลออกอย่างช้า ๆ"])},
    {n:"coach",t:vary("wai4_"+me.id,({kati:["ไปเลย ครูอยู่ตรงมุมนี้ตลอด","ใจร้อนได้ แต่การ์ดห้ามตก จำไว้","ปู่ชัยดูอยู่ ไปเลยหลาน"],mali:["ยิ้มได้ แต่ห้ามยิ้มตอนโดนต่อย","ขาเธอคืออาวุธ อย่าเพิ่งใช้หมดในยกแรก","แม่ดูอยู่ ชกให้สวยเหมือนรำเมื่อกี้"],rin:["ข้อมูลอยู่ในหัวเธอแล้ว ที่เหลือคือใจ","อย่าคิดนานเกินไป เชื่อตัวเองบ้าง","ไม่มีแว่น ก็ยังมีครูตาดีอยู่ตรงมุม"]})[me.id]||["ไปเลย ครูอยู่ตรงมุมนี้ตลอด"])}]),
    {n:me.id,f:"happy",l:"fight",t:({kati:"…ก่อนขึ้นเวที ช่วยพูดอะไรกับหนูหน่อยสิคะ",mali:"ผู้จัดการ~ พูดอะไรให้มะลิฮึดหน่อยสิ",rin:"…มีอะไรจะบอกฉันก่อนขึ้นเวทีไหมคะ"})[me.id]||"ช่วยพูดอะไรหน่อยสิคะ"},
    {choice:cheerLines(me).map(([t,rep,best])=>({t,fx:()=>{me.morale=Math.min(100,me.morale+(best?8:3));b.cheer=best?2:1;},then:[{n:me.id,f:best?"flustered":"happy",l:"fight",t:rep}]}))}];}
const CHEER={kati:[["ปู่ชัยดูอยู่นะ ชกให้ท่านภูมิใจ","…ค่ะ! หนูจะชกให้ปู่ได้ยินเสียงเชียร์ถึงข้างบนเลย!",1],["ชนะแล้วไปกินหมูกระทะกัน","ฮ่า ๆ สัญญาแล้วนะ! หนูสั่งเยอะแน่",0],["ใจเย็น ๆ ทำตามแผน","อื้อ… ตามแผน ๆ",0]],
  mali:[["ไปโชว์ลูกเตะให้ทั้งเวทีเห็นเลย!","ได้เลย~ มะลิจะเตะให้เสียงดังที่สุดในคืนนี้!",1],["แม่เธอต้องภูมิใจแน่","…ขอบคุณนะ มะลิจะไม่ร้องไห้ก่อนชกหรอก",0],["อย่าประมาทล่ะ","รู้แล้วน่า~",0]],
  rin:[["เชื่อในข้อมูลที่เธอวิเคราะห์มา","…ค่ะ ทุกอย่างอยู่ในหัวแล้ว เหลือแค่ทำให้ได้",1],["สู้ ๆ นะริน!","ขอบคุณค่ะ… ฉันจะพยายาม",0],["ชกให้สนุกนะ","สนุก… จะลองดูค่ะ",0]]};
function cheerLines(f){return CHEER[f.id]||[["เธอทำได้!","ค่ะ!",1],["ตามแผนนะ","รับทราบ",0],["อย่าเจ็บตัวล่ะ","ค่ะ",0]];}
function openFight2(b,done){UI.fight={b,done,stage:"pre",plan:b.plan||"balanced",tac:{focus:"auto",pace:"steady",target:(b.tac&&b.tac.target)||"body"},F:null,shown:[],pending:[],timer:null,res:null,caption:null};render();}
// v1.46: side-by-side numbers before the bell (opponent hidden until scouted)
function preCompare(me,op,b){const sc=scouted(op.id)||op.camp==="player";const v=verdictOf(adviseCached(me.id,op.id,b.rounds||3).bestRate);
  const rows=[["หมัด",a=>a.punch],["เตะ",a=>a.kick],["เข่า/ศอก",a=>(a.knee+a.elbow)/2],["การ์ด",a=>(a.guard+a.counter)/2],["แรง",a=>(a.stamina+a.dur)/2]];
  return `<div class="pcmp"><div class="pcmp-h"><span class="pill dtag ${v.c}">${v.t}</span>${sc?"":`<small class="mutt">ยังไม่ได้ดูเทป · ไม่เห็นค่าพลังคู่ชก</small>`}</div>${rows.map(([n,g])=>{const x=g(me.a),y=g(op.a);
    return `<div class="pcr"><b class="num ${sc&&x>y+.4?"goldt":""}">${x.toFixed(1)}</b><i class="pb l" style="--v:${clamp(x/20*100,0,100)}%"></i><span>${n}</span><i class="pb r" style="--v:${sc?clamp(y/20*100,0,100):0}%"></i><b class="num ${sc&&y>x+.4?"redt":""}">${sc?y.toFixed(1):"?"}</b></div>`;}).join("")}</div>`;}
function fightHTML(){const U=UI.fight,b=U.b,me=G.F[b.a],op=G.F[b.b],F=U.F;
  const last=U.shown.filter(x=>x.ha!=null).slice(-1)[0];const sv=(s,k)=>F?(last?last[k]:s):100;
  const side=(f,cls,hp,sta)=>`<div class="fside ${cls}"><div class="fn">${f.canon?`<img class="face sm" src="${faceSrc(f.id,"happy")}" alt="">`:""}<b>${esc(f.name)}</b><span class="meta">Lv.${f.lvl}</span></div>
    <div class="meter"><i style="--v:${clamp(hp,0,100)}%;--bc:${hp>50?"var(--green)":hp>25?"var(--warn)":"var(--red)"}"></i></div><div class="meter thin"><i style="--v:${clamp(sta,0,100)}%;--bc:var(--gold)"></i></div></div>`;
  const hpA=F?sv(F.A.hp,"ha"):100,hpB=F?sv(F.B.hp,"hb"):100,stA=F?sv(F.A.sta,"sa"):100,stB=F?sv(F.B.sta,"sb"):100;
  let mid="";
  if(U.stage==="pre"){const c=condition(me);const P=personaOf(op);
    mid=`<div class="pre px"><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b><span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b><span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
     ${P?`<p class="quote">“${esc(P.line)}”</p>`:""}${h2hText(op)?`<p class="meta goldt center">${h2hText(op)}</p>`:""}${op.id==="ploy"&&(op.aura||0)>=.1?`<p class="meta redt center">👑 อัจฉริยะไร้พ่าย · ปีนี้ยังไม่มีใครล้มเธอได้ เธออ่านเกมขาดกว่าทุกคน</p>`:""}
     <div class="prebox"><div><small>แผน</small><b>${PLANS[U.plan].name}</b></div><div><small>เป้าหมาย</small><b>${TGT[U.tac.target]}</b></div><div><small>ความพร้อม</small><b class="num">${c}</b></div></div>
     ${me.fatigue>25?`<p class="meta center warnt">ล้า ${Math.round(me.fatigue)} · ขึ้นเวทีด้วยแรง ${Math.round(clamp(100-me.fatigue*.4,40,100))}% และหมดแรงเร็วกว่าปกติ</p>`:""}
     ${preCompare(me,op,b)}
     <p class="meta center">${me.prepBonus?"ซ้อมแผนมาแล้ว · ":""}${me.injury?"บาดเจ็บอยู่! · ":""}เปลี่ยนแผนได้ที่แท็บฝึกก่อนวันชก</p>
     <div class="ctrl">${me.injury?`<button class="btn" data-act="withdraw">ถอนตัว</button>`:""}<button class="btn primary big" data-act="fstart">ขึ้นชก! ▸</button></div></div>`;}
  else{const cap=U.caption;
    mid=`<div class="stagewrap px"><canvas id="fstage" width="960" height="540" aria-label="เวทีมวย"></canvas>
      <div class="rnd">${F.round?`ยก ${F.round}/${F.rounds}`:""}</div><div class="cards">${U.stage!=="done"?"":F.cards.map((c,i)=>`<span class="num">ย${i+1} ${c[0]}–${c[1]}</span>`).join("")}</div>
      ${U.stage==="done"&&U.bubble?`<div class="obub ${U.F.result.win==="B"?"taunt":"sulk"}" role="note"><b>${esc(U.F.B.name)}</b>${esc(U.bubble)}</div>`:""}
      ${U.stage==="corner"?"":`<div class="caption ov ${cap?cap.side:""} ${cap&&cap.heat?"heat"+cap.heat:""}" aria-live="polite">${cap?esc(cap.text):"…"}</div>`}</div>
     ${U.cutin?(U.cutin.skill?`<div class="cutin sk ${U.cutin.kind} ${U.cutin.side}" aria-live="assertive"><div class="cut-band"><img src="${ASSET}${U.cutin.id}_fight_angry.webp" alt=""></div><b>${esc(U.cutin.skill)}</b><span>${esc(U.cutin.name)} · ${U.cutin.kind==="atk"?`${WNAME[U.cutin.w]}แม่นและแรงขึ้นช่วงหนึ่ง`:U.cutin.kind==="def"?"หลบและสวนกลับดีขึ้นช่วงหนึ่ง":"เรียกแรงกลับมา"}</span></div>`:`<div class="cutin ${U.cutin.side}" aria-live="assertive"><div class="cut-band"><img src="${ASSET}${U.cutin.id}_fight_angry.webp" alt=""></div><b>โหมดเลือดเดือด!</b><span>${esc(U.cutin.name)} ตาเปลี่ยน · สวนกลับแรงขึ้น คริติคอลง่ายขึ้น</span></div>`):""}
     ${U.stage==="corner"?"":liveStats()}`;
    // v1.21: one compact row — speed, then the 3 carried skills
    if(U.stage==="playing")mid+=`<div class="fctl2"><div class="seg sm">${[["1","x1"],["2","x2"]].map(([v,t])=>`<button data-act="fspeed" data-v="${v}" aria-pressed="${String(UI.speed)===v}" aria-label="ความเร็ว ${t}">${t}</button>`).join("")}</div>${skillBarHTML()}</div>`;
    if(U.stage==="corner")mid+=cornerHTML(F);
    if(U.stage==="done")mid+=resultHTML();
    mid+=`<details class="logd" ${UI.logOpen?"open":""} ontoggle="UI.logOpen=this.open"><summary>บันทึกการชกทั้งหมด</summary><div class="flog">${U.shown.map(l=>l.rd?`<div class="rd">${l.rd}</div>`:`<div class="${l.s}">${esc(l.t||"")}</div>`).join("")}</div></details>`;}
  const tw=UI.confirmTowel?`<div class="tconfirm" role="alertdialog"><div class="px"><h3>🏳️ โยนผ้ายอมแพ้?</h3><p>ไฟต์นี้จะนับเป็นแพ้ทันที แต่นักมวยจะไม่เจ็บหนักกว่านี้</p><div class="ctrl"><button class="btn" data-act="towelno">ชกต่อ</button><button class="btn primary" data-act="towelyes">ยอมแพ้</button></div></div></div>`:"";
  return `${tw}${fpopHTML()}<div class="fight pxscroll ${U.stage==="corner"?"incorner":U.stage==="done"?"isdone":""}" data-sk="fight" role="dialog" aria-label="การชก"><div class="fight-in"><div class="fhead">${side(me,"a",hpA,stA)}<div class="vsmid"><b>${TIER[b.tier].name}</b>${U.F&&U.F.round&&U.stage==="playing"?(()=>{const s=Math.max(0,Math.round(180*(1-Math.min(U.F.ex||0,EX_PER_ROUND)/EX_PER_ROUND)));return `<span class="meta">ยก ${U.F.round}/${b.rounds}</span><span class="rclock num">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span><i class="rcbar" style="--v:${Math.round(s/1.8)}%"></i>`;})():`<span class="meta">${b.rounds} ยก</span>`}</div>${side(op,"b",hpB,stB)}</div>${mid}</div></div>`;}
function liveStats(){const U=UI.fight,F=U.F;if(!F)return "";let la=0,lb=0;
  for(const e of U.shown){if(!e.ev)continue;const sd=sideOf(e,F);if(e.ev==="hit"||e.ev==="counter"){if(sd==="A")la++;else lb++;}}
  const ctl=la+lb?Math.round(la/(la+lb)*100):50;
  return `<div class="live px"><span>เข้าเป้า <b class="num">${la}</b> – <b class="num">${lb}</b></span><span class="ctlbar" style="--v:${ctl}%"><i></i></span><span>คุมเกม <b class="num">${ctl}%</b></span><span>ขาคู่ชก ${F.B.legs>25?"หนักมาก":F.B.legs>12?"เริ่มหนัก":"ปกติ"}</span></div>`;}
// v1.10 corner: tiny care puzzle + pick an order, then confirm
function cornerHTML(F){const U=UI.fight,C=U.care,A=F.A,B=F.B,c=F.cards[F.cards.length-1]||[10,10];const rec=aiCorner(F,A,B);
  const note=B.sta<40?"คู่ชกเริ่มหมดแรง":A.sta<40?"เราแรงเหลือน้อย":A.rlanded<B.rlanded-2?"ยกนี้เราโดนเยอะ":B.legs>20?"ขาคู่ชกเริ่มหนัก":A.rage?"ยังเลือดเดือดอยู่!":"";
  const slots=C.need.map((k,i)=>{const g=C.got[i];return `<span class="cslot ${g==null?"":g===k?"ok":"bad"}">${PIX[k]}</span>`;}).join('<i class="arr">›</i>');
  return `<div class="corner px"><div class="chead"><b>พักยก ${F.round}</b><button class="chip cardbtn" data-act="cshow" aria-pressed="${!!U.cshow}">${U.cshow?F.cards.map((c,i)=>`ย${i+1} ${c[0]}–${c[1]}`).join(" · "):"ดูคะแนนยกที่ผ่านมา ▸"}</button><span class="chip">เข้าเป้า ${A.rlanded}–${B.rlanded}</span>${note?`<span class="chip warn">${note}</span>`:""}</div>
   <div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>${C.done?(C.q>=1?"สดชื่นเต็มที่!":C.q>0?"ดีขึ้นนิดหน่อย":"ยังไม่ค่อยดีขึ้น"):"ทำตามลำดับนี้"}</span><div class="cslots">${slots}</div></div>
    <div class="carebtns">${Object.entries(CARE).map(([k,v])=>{const o=C.got.indexOf(k);return `<button data-act="care" data-v="${k}" ${C.done||o>=0?"disabled":""} class="${o>=0?"picked":""}">${o>=0?`<i class="ord">${o+1}</i>`:""}${PIX[k]}<small>${v.name}</small></button>`;}).join("")}</div></div>
   <div class="ohead"><b>คำสั่งยกถัดไป</b>${coachOn()?`<button class="btn sm" data-act="chint">คำแนะนำครู</button>`:""}</div>
   <div class="opts">${Object.entries(CORNER).map(([k,o])=>`<button data-act="cpick" data-v="${k}" aria-pressed="${U.pick===k}">${o.name}</button>`).join("")}</div>
   <div class="cfoot"><button class="towel" data-act="towel" aria-label="โยนผ้ายอมแพ้">${PIX.flag}<span>ผ้าขาว</span></button><button class="btn primary" data-act="cgo" ${U.pick?"":"disabled"}>เริ่มยก ${F.round+1} ▸</button></div>
</div>`;}
// v1.13: the coach reads the actual fight (cards, stamina, what landed) before giving a hint
// v1.21: only suggest what can actually be learned now, favour the carried 3, flag fresh unlocks, and vary the pick
function skillTip(f){if(hasTree(f.id)){const L=SKILLS[f.id],eq=equipped(f);const ok=L.filter(k=>!skillBlock(f,k.id).length);
    if(ok.length){const pick=ok.slice().sort((a,b)=>(eq.includes(b.id)?2:0)+b.row-((eq.includes(a.id)?2:0)+a.row))[0];return `ตอนนี้อัป "${pick.name}" ได้ (ขั้น ${(f.skills[pick.id]||0)+1}/3)`;}
    let best=null;for(const k of L){const B=skillBlock(f,k.id).filter(b=>b.t!=="sp");if(B.length!==1||B[0].t!=="stat")continue;const gap=B[0].v-B[0].have;if(!best||gap<best.gap)best={k,gap,st:B[0].k};}
    return best?`ฝึก${SK_AN[best.st]}อีก ${fmtA(Math.ceil(best.gap*10)/10)} จะอัป "${best.k.name}" ได้`:"ท่าถัดไปต้องฝึกค่าพลังเพิ่ม แตะที่ท่าเพื่อดูเงื่อนไข";}
  const all=SKILLS[f.id]||[],eq=equipped(f);const ok=all.filter(k=>(k.lv||1)<=f.lvl&&(f.skills[k.id]||0)<3);
  const nxt=all.filter(k=>(k.lv||1)>f.lvl).sort((a,b)=>a.lv-b.lv)[0];const tail=nxt?` · Lv.${nxt.lv} จะปลดล็อก "${nxt.name}"`:"";
  if(!ok.length)return nxt?`ท่าที่อัปได้ตอนนี้เต็มหมดแล้ว เก็บแต้มไว้รอ${tail.slice(3)}`:"สกิลเต็มหมดแล้ว";
  const fresh=ok.find(k=>(k.lv||1)===f.lvl&&!(f.skills[k.id]>0));if(fresh)return `เพิ่งปลดล็อก "${fresh.name}" ลองอัปแล้วเลือกใช้ดู${tail}`;
  const top=[["punch","หมัด"],["kick","เตะ"],["knee","เข่า"],["elbow","ศอก"]].sort((a,b)=>f.a[b[0]]-f.a[a[0]])[0];
  const sc=k=>(eq.includes(k.id)?3:0)+(k.desc.includes(top[1])?2:0)-(f.skills[k.id]||0)*1.2+((f.lvl+k.id.length)%3)*.3;
  const pick=ok.slice().sort((a,b)=>sc(b)-sc(a))[0];const why=eq.includes(pick.id)?"เป็นท่าที่พกขึ้นเวทีอยู่":pick.desc.includes(top[1])?`${f.name}ถนัด${top[1]}`:"เสริมจุดที่ยังไม่มี";
  return `${why} ลองอัป "${pick.name}" (ขั้น ${(f.skills[pick.id]||0)+1}/3)${tail}`;}
function popToast(t,kind){const el=document.createElement("div");el.className="gtoast "+(kind||"");el.textContent=t;document.body.appendChild(el);setTimeout(()=>el.remove(),1800);}
// v1.15: the coach rates every order for this moment (green/gold/red) with a reason; several can be green
function cornerRate(F){const A=F.A,B=F.B,fa=A.f.a,fb=B.f.a,left=F.rounds-F.round;const diff=F.cards.reduce((x,c)=>x+c[0]-c[1],0);
  const kickH=(B.wl.kick||0)>=(B.wl.knee||0)+(B.wl.elbow||0)&&(B.wl.kick||0)>=2,inH=(B.wl.knee||0)+(B.wl.elbow||0)>(B.wl.kick||0)+1;
  const tired=A.sta<38,fresh=A.sta>=55,oppT=B.sta<42,ahead=diff>0,behind=diff<0,last=left<=1;const R={};
  R.push=tired?["r","แรงเราไม่พอจะบุก"]:inH&&fb.clinch>=fa.clinch?["y","ไล่คะแนนได้ แต่เดินเข้าไปเจอเข่า-ศอกเขา"]:behind&&fresh?["g","ต้องไล่คะแนน และยังมีแรง"]:oppT&&fresh?["g","คู่ชกแรงหมด จังหวะกดดัน"]:ahead&&last?["r","นำอยู่ บุกแล้วเสี่ยงโดนสวน"]:["y","ได้แต้มเพิ่ม แต่กินแรง"];
  R.counter=B.landed>A.landed+2?["g","คู่ชกบุกเข้ามาเยอะ รอสวนได้"]:behind&&last?["r","ยกสุดท้ายแล้ว รออย่างเดียวไม่ทัน"]:tired?["y","ประหยัดแรง แต่แต้มขึ้นช้า"]:["y","ปลอดภัย แต่ออกอาวุธน้อยลง"];
  R.range=inH&&fa.kick>=fb.clinch-1?["g","คู่ชกชอบวงใน ยืนไกลแล้วเตะ"]:kickH&&fb.kick>fa.kick?["r","เขาเตะเก่งกว่า ยืนไกลเสียเปรียบ"]:["y","ใช้ได้ถ้าเตะเราดีกว่า"];
  R.clinch=kickH&&(fa.knee+fa.clinch)/2>=fb.kick-1?["g","เขาเตะคุมระยะ เข้าประชิดตัดลูกเตะ"]:fb.clinch>fa.clinch+2?["r","คลินช์เขาแน่นกว่าเรา"]:["y","ได้ผลถ้าเข่าเราดี"];
  R.defend=tired?["g","ฟื้นแรงก่อน ค่อยไปต่อยกหน้า"]:ahead&&last?["g","นำอยู่ ยกสุดท้าย เก็บให้จบ"]:behind?["r","ตามอยู่ ป้องกันอย่างเดียวแพ้แน่"]:["y","ปลอดภัย แต่แต้มไม่เพิ่ม"];
  R.none=behind&&last?["r","ตามอยู่ แผนเดิมอาจไม่พอ"]:!behind&&!tired?["g","แผนเดิมยังได้ผล"]:["y","ไม่เปลี่ยนอะไร"];
  return R;}
// v1.32: the coach also guesses a win chance per order; how close the guess is depends on his training level
const ODDS_ERR=[0,15,10,6],ODDS_W=[0,30,20,12];
function cornerPct(F){const U=UI.fight;U.odds=U.odds||{};if(!U.odds[F.round]){const o=typeof cornerOdds==="function"?cornerOdds(F):null;if(!o)return null;
    const err=ODDS_ERR[G.fac.daeng||1]||14,r=mulberry32((F.seed||1)+F.round*101);U.odds[F.round]=Object.fromEntries(Object.entries(o).map(([k,v])=>[k,clamp(Math.round(v*100+(r()*2-1)*err),1,99)]));}
  return U.odds[F.round];}
function pctRange(c){const w=ODDS_W[G.fac.daeng||1]||30,r5=v=>Math.round(v/5)*5,lo=clamp(r5(c-w/2),5,95),hi=clamp(r5(c+w/2),5,95);return lo>=85?"85%+":hi<=15?"<15%":`${lo}-${hi}%`;}
function cornerThinkHTML(F){const A=F.A,B=F.B;const diff=F.cards.reduce((x,c)=>x+c[0]-c[1],0),left=F.rounds-F.round;const R=cornerRate(F);const P=cornerPct(F),err=ODDS_ERR[G.fac.daeng||1]||14;
  const first=!(G.flags&&G.flags.pctSeen);if(first){G.flags=G.flags||{};G.flags.pctSeen=true;}
  const read=diff>1?"ครูว่าเรานำอยู่":diff<-1?"ครูว่าเราตามอยู่":"ครูว่ายังสูสี";
  const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};const top=o=>{const e=Object.entries(o).sort((x,y)=>y[1]-x[1])[0];return e&&e[1]?e:null;};const bt=top(B.wl),at=top(A.wl);const T=[];
  T.push(diff>1?`ฟังนะ ยกที่ผ่านมาเราเก็บคะแนนได้ดี ${left<=1?"เหลือยกเดียวแล้ว คิดดี ๆ ว่าคุ้มจะเสี่ยงไหม":"แต่อย่าเพิ่งวางใจ"}`:diff<-1?`หายใจลึก ๆ… ตอนนี้เราเป็นรอง ${left<=1?"ยกสุดท้ายแล้ว ถ้าไม่เปลี่ยนอะไรก็จบแบบนี้":`ยังเหลือ ${left} ยก ยังพลิกได้`}`:"ยังสูสีอยู่ กรรมการยังไม่เอียงไปทางไหน");
  if(bt)T.push(`เขาทำแต้มด้วย${W[bt[0]]}มากที่สุด ${bt[1]} ครั้งแล้ว${bt[0]==="kick"?" ถ้าปล่อยให้ยืนระยะเตะต่อไป เราลำบากแน่":bt[0]==="knee"||bt[0]==="elbow"?" เขาชอบเข้ามาวงใน":""}`);
  T.push(A.sta<40?`แรงเธอเหลือไม่ถึงครึ่ง ${Math.round(A.sta)}% ครูเห็นการ์ดเริ่มตกแล้ว`:B.sta<45?`ดูเขาสิ หอบแล้ว แรงเหลือราว ${Math.round(B.sta)}% แต่เรายังมี ${Math.round(A.sta)}%`:at?`${W[at[0]]}ของเธอเข้าเป้าดี ${at[1]} ครั้ง`:"ยังไม่มีอาวุธไหนเข้าเป้าชัด ๆ");
  return `<div class="fpop" role="dialog" aria-label="คำแนะนำครู"><div class="fpop-in px"><div class="fp-h"><img src="${faceSrc("coach")}" alt=""><div><b>ครูแดง</b><div class="meta">${read} · เหลือ ${left} ยก · แรง ${Math.round(A.sta)}% / ${Math.round(B.sta)}%</div></div></div>
   <div class="ctalk">${T.map(t=>`<p>“${t}”</p>`).join("")}</div>
   ${first?`<p class="pctintro">ครูลองคิดล่วงหน้าว่าถ้าสั่งแต่ละแบบ เราน่าจะชนะกี่เปอร์เซ็นต์ เป็นแค่การเดาจากประสบการณ์ ส่งครูไปอบรมแล้วจะเดาแม่นขึ้น</p>`:""}
   <div class="rate">${Object.entries(CORNER).map(([k,o])=>`<div class="rt ${R[k][0]}"><i></i><b>${o.name}</b>${P?`<span class="pct num">${pctRange(P[k])}</span>`:""}<small>${R[k][1]}</small></div>`).join("")}</div>
   <p class="meta">เขียว = เหมาะตอนนี้ · เหลือง = พอได้ · แดง = ไม่แนะนำ${P?` · % = ช่วงโอกาสชนะที่ครูเดา${(G.fac.daeng||1)<3?" · ส่งครูอบรม ช่วงจะแคบลง":""}`:""}</p>
   <button class="btn primary" data-act="chint">เข้าใจแล้ว</button></div></div>`;}
function roundReport(F){const A=F.A,B=F.B,c=F.cards[F.cards.length-1]||[10,10];const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};
  const top=s=>{const e=Object.entries(s.rw||{}).sort((a,b)=>b[1]-a[1])[0];return e&&e[1]?`${W[e[0]]} ${e[1]} ครั้ง`:"ไม่มี";};
  const notes=[];if(B.legs>20)notes.push("ขาของคู่ชกเริ่มหนัก เคลื่อนที่ช้าลง");if(B.sta<40)notes.push(`คู่ชกแรงเหลือราว ${Math.round(B.sta)}%`);if(A.sta<40)notes.push(`เราแรงเหลือราว ${Math.round(A.sta)}% ระวังยกท้าย`);
  if(A.rlanded<B.rlanded-2)notes.push("ยกนี้เราโดนมากกว่าชัดเจน");if(A.rage)notes.push("ยังอยู่ในโหมดเลือดเดือด!");
  return `<div class="rreport"><div><b>ยกนี้</b> ${c[0]}–${c[1]}</div><div>เราเข้าเป้า <b>${A.rlanded}/${A.rthrown}</b> · ได้ผลสุด: ${top(A)}</div><div>โดน <b>${B.rlanded}</b> ครั้ง · อาวุธที่โดนมากสุด: ${top(B)}</div>${notes.map(n=>`<div class="note">• ${n}</div>`).join("")}</div>`;}
function cornerAdvice(F){const A=F.A,B=F.B;const lead=F.cards.reduce((s,c)=>s+c[0]-c[1],0);
  if(A.sta<35)return "แรงเหลือน้อย ใช้ 'ป้องกัน เก็บคะแนน' ฟื้นแรงก่อน";
  if(lead>=2)return "นำอยู่ อย่าประมาท เก็บคะแนนให้ปลอดภัย";
  if(lead<=-2)return "ตามหลังแล้ว ต้องบุกเพิ่มแรงกดดัน!";
  if(B.wl.kick>B.wl.knee+2)return "อีกฝ่ายเตะเข้าบ่อย เข้าคลินช์ตัดระยะเลย";
  if(B.wl.knee+B.wl.elbow>B.wl.kick+3)return "อีกฝ่ายถนัดวงใน รักษาระยะ ใช้ลูกเตะ";
  return "สูสี ทำตามแผนเดิมไปก่อน หรือรอดักสวน";}
// v1.12: one line that tells the player WHY the fight went the way it did
function fightInsight(F,U){const A=F.A,B=F.B,win=F.result.win==="A",W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};const out=[];
  const best=Object.entries(A.wl).sort((x,y)=>y[1]-x[1])[0];const tg=A.tac&&A.tac.target;
  if(tg==="legs"&&B.legs>18)out.push(["+",`เตะขาได้ผล คู่ชกขาหนักจนช้าลง`]);
  else if(tg==="body"&&B.sta<45)out.push(["+",`เล่นลำตัวได้ผล คู่ชกแรงหมดเร็ว`]);
  else if(tg==="head"&&A.landed>B.landed)out.push(["+",`เล่นหัวเข้าเป้า กดดันคู่ชกได้`]);
  else if(tg)out.push(["−",`เป้าหมาย "${TGT[tg]}" ยังไม่ค่อยได้ผลกับคู่นี้`]);
  if(best&&best[1]>=3)out.push(["+",`อาวุธที่ได้ผลที่สุด: ${W[best[0]]} ${best[1]} ครั้ง`]);
  if(A.counterPrep)out.push(["+","ซ้อมแก้ทางคู่ชกมา ได้เปรียบตั้งแต่ยกแรก"]);
  if(U.careOK)out.push(["+",`ดูแลมุมเวทีถูก ${U.careOK} ครั้ง แรงกลับมาดี`]);
  if(A.rageUsed)out.push(["+","โหมดเลือดเดือดพลิกเกม"]);
  if(A.sta<25)out.push(["−","แรงหมดก่อนจบไฟต์ ลองจังหวะที่ประหยัดแรงกว่านี้"]);
  if(B.landed>A.landed+4)out.push(["−","โดนเยอะกว่าชัดเจน ลองแผนรอสวนหรือคุมระยะ"]);
  if(!win&&!scouted(B.f.id)&&B.f.camp!=="quest")out.push(["−","ไม่รู้ทางคู่ชกมาก่อน ไฟต์หน้าลองดูเทปแล้วฝึกแก้ทาง"]);
  if(!win&&B.f.a&&A.f.a&&ovr(B.f)>ovr(A.f)+3)out.push(["−","คู่ชกค่าพลังสูงกว่าพอสมควร ฝึกเพิ่มอีกนิดก่อนเจอระดับนี้"]);
  const pick=win?out.filter(x=>x[0]==="+").concat(out.filter(x=>x[0]==="−")):out.filter(x=>x[0]==="−").concat(out.filter(x=>x[0]==="+"));
  return pick.slice(0,2).map(([k,t])=>`<li class="${k==="+"?"pos":"neg"}">${k==="+"?"▲":"▼"} ${t}</li>`).join("");}
function resultHTML(){const U=UI.fight,F=U.F,r=F.result;const win=r.win==="A",draw=r.win==="D";const me=G.F[U.b.a];
  const acc=s=>s.thrown?Math.round(s.landed/s.thrown*100)+"%":"—";
  return `<div class="result px"><div class="big ${win?"win":draw?"":"lose"}">${win?"ชนะ!":draw?"เสมอ":"แพ้"}</div>
   <div>${esc(r.type)}${r.score?` · ${r.score}`:""} · ยก ${r.round}</div>${U.res?`<div class="meta">${U.res.pay||!TIER[U.b.tier].off?`ค่าตัวเข้าค่าย ${fmt(U.res.pay)}`:"ไม่นับสถิติ · ค่าตอบแทน (ถ้ามี) ส่งมาทางตู้จดหมาย"} · EXP เพิ่มขึ้น</div>`:""}
   <ul class="insight">${fightInsight(F,U)}</ul>
   <div class="statgrid"><b class="r num">${F.A.landed}/${F.A.thrown}</b><span class="c">เข้าเป้า</span><b class="num">${F.B.landed}/${F.B.thrown}</b>
     <b class="r num">${acc(F.A)}</b><span class="c">ความแม่น</span><b class="num">${acc(F.B)}</b><b class="r num">${F.A.kd}</b><span class="c">ถูกนับ</span><b class="num">${F.B.kd}</b></div>
   ${coachOn()?`<div class="ctip"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดง:</b> ${coachNote(F,me)}</span></div>`:""}
   ${G.F.rin.camp==="player"&&me.id!=="rin"?`<div class="ctip"><img src="${faceSrc("rin","happy")}" alt=""><span><b>ริน:</b> ${rinNote(F)}</span></div>`:""}
   <div class="ctrl">${r.win==="B"&&G.losses&&G.losses.length?`<button class="btn" data-act="frev">ทบทวนความพ่ายแพ้</button>`:""}<button class="btn primary" data-act="fdone">ไปต่อ ▸</button></div>
</div>`;}
function fpopHTML(){const U=UI.fight;if(!U||!U.F)return "";if(U.stage==="corner"&&U.hint)return cornerThinkHTML(U.F);
  if(U.stage==="done"&&U.rev&&G.losses)return `<div class="fpop"><div class="fpop-in px">${lossBody(G.losses[G.losses.length-1])}<button class="btn primary" data-act="frev">ปิด</button></div></div>`;return "";}
// v1.14 loss review: Kru Daeng on the mindset/training, Rin on the numbers
function lossBody(L){const me=G.F[L.a],op=G.F[L.b];if(!me||!op)return "";const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0];
  const bt=top(L.B.wl),at=top(L.A.wl);const cp=counterPreset(op);const fix=PRESETS[cp].name;
  const ring={punch:"บนเวทีตั้งการ์ดสูงแล้วรอสวน อย่าแลกหมัดกับเขา",kick:"บนเวทีต้องเข้าประชิด อย่ายืนในระยะเตะเขา",knee:"บนเวทีอย่าบุกเข้าวงในเขา ใช้ลูกเตะคุมระยะ",elbow:"บนเวทีอย่าบุกเข้าวงในเขา ใช้ลูกเตะคุมระยะ"}[bt[0]];
  const kru=L.od>4?`${op.name}เก่งกว่าเราชัดเจน แพ้แบบนี้ไม่ต้องอาย ฝึกให้ค่ารวมขึ้นอีกหน่อยแล้วค่อยรับคู่ระดับนี้`
    :L.A.sta<30?`หมดแรงตั้งแต่ก่อนจบ เพิ่มฟิตร่างกาย และพอนำแล้วสั่งเก็บคะแนนบ้าง`
    :!L.sc&&op.camp!=="quest"?`เราเข้าไปโดยไม่รู้ทางเขาเลย คราวหน้าดูเทปก่อน แล้วซ้อมแก้ทาง`
    :`เขาชนะด้วย${W[bt[0]]} ${ring} แล้วก่อนเจอกันอีก ซ้อม "${fix}" แก้ทางสัก 1-2 สัปดาห์`;
  const rin=G.F.rin.camp==="player"?`ยกที่เสียคะแนนหนักสุดคือยก ${L.cards.reduce((m,c,i,a)=>c[1]-c[0]>a[m][1]-a[m][0]?i:m,0)+1} · เราเข้าเป้า ${L.A.landed}/${L.A.thrown} เขา ${L.B.landed}/${L.B.thrown} · ${W[bt[0]]}ของเขาเข้า ${bt[1]} ครั้ง${at&&at[1]?` ส่วน${W[at[0]]}ของเราได้ผลสุด (${at[1]})`:""}`:null;
  return `<h3>ทบทวน: ${esc(me.name)} vs ${esc(op.name)}</h3><div class="meta">สด.${L.wk} · แพ้${esc(L.type)} ยก ${L.round} · คะแนนรายยก ${L.cards.map(c=>`${c[0]}-${c[1]}`).join(" / ")}</div>
   <div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดง:</b> ${kru}</span></div>
   ${rin?`<div class="ctip big"><img src="${faceSrc("rin","happy")}" alt=""><span><b>ริน:</b> ${rin}</span></div>`:`<p class="meta dim">จ้างรินเข้าค่าย จะได้บทวิเคราะห์ตัวเลขละเอียด</p>`}`;}
function lossRevHTML(){const L=(G.losses||[]).slice().reverse();const i=clamp(UI.revIdx||0,0,Math.max(0,L.length-1));
  return `<h2>ทบทวนความพ่ายแพ้</h2>${L.length>1?`<div class="seg sm wrap">${L.map((x,k)=>`<button data-act="revpick" data-v="${k}" aria-pressed="${k===i}">สด.${x.wk} ${esc((G.F[x.a]||{}).name||"")}</button>`).join("")}</div>`:""}${L.length?lossBody(L[i])+lossTapeBtn(L[i]):'<p class="lead">ยังไม่เคยแพ้เลย</p>'}`;}
// v1.34: watch the lost fight with the team: EXP, and she reads that opponent a little better next time
function lossTapeBtn(L){const op=G.F[L.b],me=G.F[L.a];if(!op||!me||op.camp==="quest")return "";const k=G.losses.indexOf(L);
  return L.watched?`<p class="meta goldt center">✓ ดูเทปไฟต์นี้กับทีมแล้ว · ${esc(me.name)}รู้ทาง${esc(op.name)}มากขึ้น</p>`:`<button class="btn gold tapebtn" data-act="losstape" data-v="${k}">ดูเทปไฟต์นี้กับทีม · EXP +25 · รู้ทางคู่ชก</button>`;}
const TAPE_LINE={kati:"หนูเห็นแล้วค่ะ… ตอนนั้นหนูรีบเกินไป รอบหน้าหนูไม่พลาดแบบนี้อีกแน่",mali:"อ๊ะ มะลิเห็นแล้ว! เขาชอบขยับไหล่ก่อนออกอาวุธ ทีหลังมะลิจะดักให้!",rin:"บันทึกแล้วค่ะ รูปแบบซ้ำสามครั้ง ครั้งหน้าฉันจะใช้มันกลับ"};
function coachNote(F,me){const A=F.A,B=F.B,r=F.result,w=r.win==="A";
  if(w&&/KO|TKO/.test(r.type))return `สวยมาก ${me.name}! แต่ร่างกายรับแรงกระแทกมาเยอะ สัปดาห์หน้าพักก่อน`;
  if(w&&B.kd>0)return "คุมเกมได้ทั้งไฟต์ ครูภูมิใจ";
  if(w)return "ชนะแล้ว แต่ยังมีจุดให้แก้ ดูความแม่นแล้วเลือกโปรแกรมซ้อมต่อ";
  if(A.sta<30)return "หมดแรงช่วงท้าย เพิ่มโปรแกรมฟิตร่างกาย หรือสั่งเก็บคะแนนเมื่อนำ";
  if(B.wl.kick>=A.wl.kick+3)return "โดนเตะคุมระยะทั้งไฟต์ ฝึกเข่า-คลินช์เพื่อตัดเข้าวงใน";
  if(B.wl.knee+B.wl.elbow>A.wl.knee+A.wl.elbow+3)return "แพ้วงใน ฝึกเตะรักษาระยะ หรือเสริมคลินช์";
  if(B.landed>A.landed*1.3)return "การ์ดยังเปิดบ่อย ลองโปรแกรมป้องกัน-สวน";
  return "แพ้ไม่ใช่จุดจบ ครูยังเชื่อในตัวเธอ ปรับแผนแล้วกลับมาใหม่";}
function rinNote(F){const A=F.A;const best=Object.entries(A.wl).sort((a,b)=>b[1]-a[1])[0];return `เข้าเป้า ${A.landed}/${A.thrown} ครั้ง อาวุธที่ได้ผลที่สุดคือ${WNAME[best[0]]} (${best[1]} ครั้ง)`;}
let LASTF=null; /* v1.80: the last fight, read by the gauntlet to carry HP between bouts */
function fightStart(quick){const U=UI.fight,b=U.b;AU.resume();
  U.F=newFight(G.F[b.a],G.F[b.b],{seed:(G.seed+G.week*131+b.b.length*7)>>>0,rounds:b.rounds,tier:b.tier,planA:U.plan,forceRage:!quick&&!(G.flags&&G.flags.rageShown)});U.F.dai=(DIFF[G.diff||"normal"]||DIFF.normal).ai;
  if(b.wai==="phrom")U.F.A.careMor=.02;if(b.wai==="phra")U.F.A.careMor=.01;if(b.cheer)U.F.A.mor+=b.cheer*.01;U.F.A.mor+=trustBonus(G.F[b.a]);{const fam=(G.fam||{})[b.b]||0;if(fam)U.F.A.mor+=fam*.015;}setTactics(U.F,U.tac);if(b.carry){U.F.A.hp=Math.min(U.F.A.hp,b.carry.hp);U.F.A.sta=Math.min(U.F.A.sta,b.carry.sta);}LASTF=U.F;
  if(quick){FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);const F=U.F;while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);const lg=fightRound(F);U.shown.push({rd:`ยกที่ ${F.round}`},...lg);}fightEnd();return;}
  FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);AU.setTempo(126);AU.startMusic();playRound();}
function playRound(){const U=UI.fight,F=U.F;AU.setTempo(126+F.round*10);F.B.instr=aiCorner(F,F.B,F.A);F.A.autoSkill=false;roundBegin(F);
  const rng=mulberry32(F.seed+F.round);U.rng=rng;U.tiredShown=false;
  F.tier=F.tier||U.b.tier;const sl=startLine(F,rng);U.pending=[{rd:`ยกที่ ${F.round}`,cap:{text:sl.text,side:"",heat:sl.heat},bell:true}];
  U.stage="playing";AU.setTempo(126+F.round*8);render();tick();}
// v1.19: pull the next exchange only when the last one has been shown, so a skill pressed now shapes what follows
function feedRound(){const U=UI.fight,F=U.F;
  while(!U.pending.length&&!roundDone(F)){U.pending.push(...fightEx(F));
    if(!U.tiredShown&&F.ex>=8){for(const s of [F.A,F.B])if(s.sta<30){U.pending.push({tired:true,cap:{text:COM.tired[Math.floor(U.rng()*2)].replace("{x}",s.name),side:""}});U.tiredShown=true;}}}
  return U.pending.length>0;}
function fskill(id){const U=UI.fight;if(!U||U.stage!=="playing")return;const e=useSkill(U.F,U.F.A,id);if(!e)return;U.pending.unshift(e);clearTimeout(U.timer);tick();}
function skillBarHTML(){const U=UI.fight,F=U.F;const L=fightSkills(F.A);const used=F.A.skUsed||{};if(!L.length)return `<span class="meta skhint">ยังไม่มีสกิล · เลเวลอัปแล้วไปอัปสกิลที่ข้อมูลนักมวย</span>`;const slots=[0,1,2].map(i=>L[i]);
  return `<div class="skbar2" role="group" aria-label="สกิล${F.A.skRound?" (ยกนี้ใช้แล้ว)":""}">${slots.map(k=>k?`<button class="skbtn2 ${k.k}" data-act="fskill" data-v="${k.id}" ${used[k.id]||F.A.skRound||F.over?"disabled":""} title="${esc(k.name)} · ${esc(SKILL_KIND_NAME[k.k])}">${PIX["sk_"+k.k]}<b>${esc(k.name)}</b></button>`:`<span class="skbtn2 empty">ว่าง</span>`).join("")}</div>`;}function sideOf(e,F){if(e.s==="A"||e.s==="B")return e.s;if(e.mside)return e.mside;return e.an===F.A.name?"A":"B";}
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
  U.caption={text:r.win==="A"?`${me.name} ชนะ! ${r.type}`:r.win==="D"?"เสมอกันไป":`${G.F[U.b.b].name} ชนะ ${r.type}`,side:r.win==="A"?"A":"B"};
  G.log.push(`${me.name} ${r.win==="A"?"ชนะ":r.win==="B"?"แพ้":"เสมอ"} ${G.F[U.b.b].name} (${r.type})`);
  if(G.F[U.b.b].canon){G.faceoffLast=G.faceoffLast||{};G.faceoffLast[`${U.b.a}_${U.b.b}`]={win:r.win,week:G.week};
    G.faceoffStats=G.faceoffStats||{};const key=`${U.b.a}_${U.b.b}`,s=G.faceoffStats[key]=G.faceoffStats[key]||{w:0,l:0,d:0};s[r.win==="A"?"w":r.win==="B"?"l":"d"]++;}
  {const op=G.F[U.b.b];if(r.win!=="D"&&!TIER[U.b.tier].off&&(op.canon||U.b.tier==="semi"||U.b.tier==="final"||/KO/.test(r.type)))G.lastBig={a:me.id,b:op.id,win:r.win,wk:G.week,shown:false};}
  if(r.win==="B"){const F=U.F,st=s=>({landed:s.landed,thrown:s.thrown,wl:{...s.wl},sta:Math.round(s.sta),kd:s.kd,legs:Math.round(s.legs)});
    G.losses=(G.losses||[]).concat([{wk:G.week,a:me.id,b:U.b.b,type:r.type,round:r.round,cards:F.cards.map(c=>[...c]),A:st(F.A),B:st(F.B),sc:scouted(U.b.b),od:Math.round(ovr(G.F[U.b.b])-ovr(me)),plan:U.plan||"balanced",tg:(F.A.tac&&F.A.tac.target)||"",care:U.careOK||0}]).slice(-6);}
  save();render();}

// ---------- actions ----------
function giftScene(id,res){const f=G.F[id];const mood=res.t==="dislike"?"pout":res.t==="love"?"flustered":"happy";
  playScene([{n:id,f:mood,l:"casual",t:(res.n&&res.t!=="dislike"&&giftAgainLine(id,res.t,res.n,res.g))||(GIFT_TALK_PERSONAL[id]&&GIFT_TALK_PERSONAL[id][res.g])||((GIFT_TALK[id]&&GIFT_TALK[id][res.g])||GIFT_LINES[id][res.t])},{n:"nar",t:res.gain>0?(res.n>=2?`ความสนิทกับ${f.name} +${res.gain} · ได้บ่อยไปนิด เลยขึ้นน้อยลง`:`ความสนิทกับ${f.name} +${res.gain}`)
      :res.t==="dislike"?`${f.name}รับไว้ด้วยรอยยิ้ม แต่อาจยังไม่ใช่ของโปรด · ความสนิทไม่เปลี่ยน`:f.bond>=100?`${f.name}ดีใจมาก · ความสนิทเต็มหลอดแล้ว`:`${f.name}ดีใจ แต่ช่วงนี้ได้ของชิ้นนี้บ่อยไปนิด ลองสลับของดูนะ`},
    ...((()=>{const k=f.giftTot===5?0:f.giftTot===10?1:-1;if(k<0||!GIFT_FREQ[id]||(f.giftFreq||0)>k)return [];f.giftFreq=k+1;
      return [...GIFT_FREQ[id][k].map(s=>({...s,l:"casual"})),k===1?{inject:G2=>{add(G2,id,"bond",3);G2.F[id].morale=Math.min(100,G2.F[id].morale+8);return [{n:"nar",t:`ได้ของตอบแทนจาก${f.name} · ความสนิท +3 · กำลังใจ${f.name} +8`}];}}:{inject:()=>[]}];})())],()=>{AU.startMusic("hub");render();},{bg:f.camp==="player"?"gym":"fair",look:"casual"});}
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
  loadslot:d=>{backupSlot(+d.v);const s0=loadSlot(+d.v);if(!s0)return;const s=safeFix(s0);if(!s){toast("เซฟนี้เปิดกับเวอร์ชันนี้ไม่ได้ ข้อมูลยังอยู่ครบ ไม่ถูกลบ");return;}G=s;const pk=G.F.ploy&&G.F.ploy.skills;if(pk&&pk.korat){G.F.ploy.skills={kr_swing:2,captain:1};}UI.slot=+d.v;UI.tab="home";UI.modal=null;UI.advCache={};AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}render();},
  askdelslot:d=>{UI.delSlot=+d.v;render();},canceldel:()=>{UI.delSlot=null;render();},
  delslot:()=>{clearSave(UI.delSlot);UI.delSlot=null;if(!loadSave())UI.modal=null;render();},
  beginNew:i=>{UI.slot=i;UI.modal=null;AU.startMusic("hub");UI.creator={name:"",...CHIBI.randomManager(Math.random),gender:"m",diff:"normal",outfit:"tee",hat:"none",glasses:"none"};UI.modal=null;render();},
  copyseed:()=>{const v=G.seedText||String(G.seed);const ok=()=>toast("คัดลอก seed แล้ว: "+v);try{navigator.clipboard.writeText(v).then(ok,()=>toast("seed: "+v));}catch(e){toast("seed: "+v);}},
  petplay:d=>{const i=+d.v,p=(G.pets||[])[i];if(!p||!petPlay(G,i))return;AU.sfx&&AU.sfx("ui");const PL={cat:"นอนหงายให้เกาพุง",dog:"วิ่งไล่ลูกบอลรอบเวที",rooster:"ขันโชว์จนทุกคนหัวเราะ",turtle:"ยื่นหัวออกมาให้ลูบช้า ๆ"};
    toast(`${p.name} ${PL[p.k]} · ${PETS[p.k].eff}`);save();render();},
  petnamesave:d=>{const p=(G.pets||[])[+d.v];const v=((document.getElementById("petname")||{}).value||"").trim();if(p&&v){p.name=v.slice(0,12);toast(`ตั้งชื่อว่า "${p.name}" แล้ว`);}UI.modal=UI.modalQ||null;UI.modalQ=null;save();render();},
  cardhint:d=>{const C=CARDS[d.v];if(C)toast(C.g?"การ์ดใบนี้ได้จากตู้กาชา":`วิธีได้: ${C.hint||"ติดตามเนื้อเรื่องไปเรื่อย ๆ"}`);},
  petren:d=>{UI.modal={type:"petname",i:+d.v};render();setTimeout(()=>{const el=document.getElementById("petname");if(el){el.focus();el.select();}},60);},
  gacha:()=>{const r=gachaPull(G);if(!r)return;AU.sfx&&AU.sfx(CARDS[r.id].r==="SSR"||CARDS[r.id].r==="SR"?"level":"ui");save();UI.modal={type:"gacha",res:r};render();},
  album:()=>{UI.modal={type:"album"};render();},
  cardplay:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o)return;o.seen=true;G.cardPend=(G.cardPend||[]).filter(x=>x!==d.v);save();UI.modal=null;const nw=d.from==="new";playScene(C.steps,()=>{UI.modal=nw?((G.cardPend||[]).length?{type:"cardnew"}:null):{type:"album"};render();},{bg:C.bg,look:"casual"});},
  cardlater:()=>{(G.cardPend||[]).shift();save();UI.modal=(G.cardPend||[]).length?{type:"cardnew"}:null;render();},
  cancelCreate:()=>{AU.startMusic("title");UI.creator=null;render();},
  cset:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator[d.k]=d.v;render();},
  crand:()=>{const n=(document.getElementById("pname")||{}).value||"",o=UI.creator||{};crSeed();UI.creator={...CHIBI.randomManager(Math.random),name:n,diff:o.diff||"normal",gender:o.gender||"m",tab:o.tab,seed:o.seed};render();},
  ctab:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator.tab=d.v;render();},
  startGame:()=>{const c=UI.creator;c.name=((document.getElementById("pname")||{}).value||"").trim()||(c.gender==="m"?"ต้น":"ดาว");
    crSeed();const {name,diff,seed,...look}=c;G=newGame({name,gender:c.gender,diff:diff||"normal",avatar:look,seed:seedFrom(seed)});if(seed&&!/^\d{1,10}$/.test(seed))G.seedText=seed;genOffers(G);UI.creator=null;UI.tab="home";G.seen.prologue=true;AU.resume();AU.startMusic("date");
    playScene(EVENTS[0].steps,()=>{save();UI.tab="home";UI.spot=0;AU.startMusic("hub");render();},{bg:"bus",look:"train"});},
  continue:()=>{let si=0;for(let i=1;i<=SLOTS;i++)if(loadSlot(i)){si=i;break;}if(!si)return;backupSlot(si);const s=safeFix(loadSlot(si));if(!s){toast("เซฟนี้เปิดกับเวอร์ชันนี้ไม่ได้ ข้อมูลยังอยู่ครบ ไม่ถูกลบ");return;}G=s;UI.slot=si;UI.tab="home";UI.modal=null;AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}render();},
  exportsave:()=>exportSave(),
  bakrestore:()=>{const b=bakInfo(UI.slot);if(!b)return;UI.modal={type:"confirm",title:"กู้เซฟก่อนอัปเดต?",text:`จะย้อนกลับไปสัปดาห์ ${b.week} (v${b.ver}) ความคืบหน้าหลังจากนั้นในช่องนี้จะหายไป`,yes:"bakyes"};render();},
  bakyes:()=>{const b=bakInfo(UI.slot);if(!b)return;try{const i=UI.slot;const cur=localStorage.getItem(slotKey(i));localStorage.setItem(slotKey(i),b.raw);const s=safeFix(loadSlot(i));if(!s){localStorage.setItem(slotKey(i),cur);toast("กู้คืนไม่สำเร็จ เซฟปัจจุบันยังอยู่");return;}G=s;UI.modal=null;UI.tab="home";save();render();toast("กู้คืนเซฟแล้ว");}catch(e){}},
  setlang:(d)=>{const v=d.v;if(v===CUR_LANG)return;try{if(G)save();localStorage.setItem("mtm_lang",v);}catch(e){}try{location.hash="lang="+v;}catch(e){}location.reload();},
  settings:()=>{UI.confirmDel=false;UI.modal={type:"settings"};render();},
  setopt:d=>{SETTINGS[d.k]=!SETTINGS[d.k];saveSettings();if(d.k==="music"){if(!SETTINGS.music)AU.stopMusic();else AU.startMusic(!G?"title":UI.fight&&UI.fight.stage==="playing"?"fight":"hub");}render();},
  askdel:()=>{UI.confirmDel=true;render();},
  delsave:()=>{clearSave();UI.confirmDel=false;UI.modal=null;G=null;UI.title="menu";render();},
  trsel:d=>{UI.trSel=d.v;render();},
  tab:d=>{UI.tab=d.v;if(d.sub)UI.csub=d.sub;if(G&&(d.v==="train"||d.v==="fights")){G.tut=G.tut||{};G.tut[d.v]=true;}UI.resetScroll=true;render();window.scrollTo(0,0);},
  endweek:()=>{if(G.dm&&!G.dm.done&&G.dm.wk===G.week){toast("ศึก Death Match ยังไม่จบ ชกให้จบก่อนนะ");UI.modal={type:"dm"};render();return;}const todo=weekTodo();
    if(todo.length&&!UI.skipWarn){UI.modal={type:"endwarn",todo};render();return;}UI.skipWarn=false;endWeek();},
  endgo:()=>{UI.modal=null;UI.skipWarn=true;ACT.endweek();},
  fighter:d=>{UI.ptab=d.v||"over";UI.look=G.F[d.id].camp==="player"?"train":"fight";UI.modal={type:"fighter",id:d.id};render();},
  ptab:d=>{UI.ptab=d.v;render();},
  plook:d=>{UI.look=d.v;render();},
  learn:d=>{const sl=document.querySelector(".sklist"),y=sl?sl.scrollTop:0;if(learnSkill(G,d.id,d.v)){AU.sfx("level");save();render();const n=document.querySelector(".sklist");if(n)n.scrollTop=y;}},
  rinread:()=>{const n=G.rinNote;if(!n)return;G.rinNote=null;save();playScene(n.steps,()=>{save();render();},{bg:"gym",look:"casual"});},
  skline:d=>{UI.skLine={id:d.id,li:+d.v};AU.sfx("ui");render();},
  skauto:d=>{const f=G.F[d.id],li=+d.v;let n=0;for(let guard=0;guard<30&&f.sp>0;guard++){const s=(SKILLS[f.id]||[]).filter(x=>x.line===li).sort((a,b)=>a.row-b.row||(f.skills[a.id]||0)-(f.skills[b.id]||0)).find(x=>!skillBlock(f,x.id).length);if(!s||!learnSkill(G,f.id,s.id))break;n++;}
    if(n){AU.sfx("level");save();toast(`อัป${(SK_LINES[f.id]||[])[li]||""} ${n} ครั้ง`);}render();},
  sksel:d=>{UI.skSel=d.id+":"+d.v;AU.sfx("ui");render();},
  closeModal:()=>{const m=UI.modal;UI.modal=null;render();if(m&&m.after)m.after();},
  closeModalBg:(d,e)=>{if(e.target.classList.contains("overlay")&&UI.modal&&!["report","levelup"].includes(UI.modal.type)){UI.modal=null;render();}},
  preset:d=>{if(trLocked(G.F[d.f]))return;const f=G.F[d.f];f.plan.preset=d.v;if(d.v==="rest")f.plan.intensity="normal";save();render();},
  intensity:d=>{if(trLocked(G.F[d.f]))return;G.F[d.f].plan.intensity=d.v;save();render();},
  consider:d=>{UI.modal={type:"consider",id:d.v};render();},
  accept:d=>{const o=G.offers.find(x=>x.id===d.v);if(!o)return;const A=adviseCached(o.a,o.b,3);acceptOffer(G,d.v);UI.modal=null;save();toast(`รับไฟต์แล้ว: ${G.F[o.a].name} vs ${G.F[o.b].name} สัปดาห์ ${o.week}`);},
  fsub:d=>{UI.fsub=d.v;if(d.v==="rank"&&G&&!(G.flags&&G.flags.rankGuide)){G.flags.rankGuide=1;UI.modal={type:"rankhelp"};save();}render();},csub:d=>{UI.csub=d.v;render();},rdiv:d=>{UI.rdiv=d.v;render();},
  tipnext:()=>{UI.tipIdx++;render();},hideguide:()=>{G.guideHidden=G.week;save();render();},
  tipact:d=>{if(d.k==="setrest"||d.k==="setprep"){ACT.tab({v:"train"});if(!trLocked(G.F[d.id])){UI.modal={type:"tpick",id:d.id};render();}}
    else if(d.k==="tab"&&d.sub){UI.csub=d.sub;ACT.tab({v:d.v});}
    else if(d.k==="fighter")ACT.fighter({id:d.id,v:d.v});else if(d.k==="tab")ACT.tab({v:d.v});else if(d.k==="campacts")ACT.campacts();else if(d.k==="loan")ACT.loan();else if(d.k==="lossrev")ACT.lossrev();else if(d.k==="endweek")ACT.endweek();},
  newsoff:()=>{UI.newsWeek=G.week;const el=document.querySelector(".newspop");if(el)el.remove();},
  hang:d=>{UI.modal={type:"hang",id:d.id};render();},
  gofac:()=>{UI.modal=null;UI.csub="fac";ACT.tab({v:"camp"});},
  camplv:()=>{UI.modal={type:"camplv"};render();},
  loan:()=>{if(!loanOk(G)){toast(G.loan>0?"ยังมีเงินกู้ค้างอยู่":"ยังไม่ถึงขั้นต้องกู้");return;}UI.modal={type:"loan"};render();},
  loanyes:()=>{if(!takeLoan(G))return;UI.modal=null;save();AU.sfx("coin");playScene([{n:"npc",who:"ลูกน้องหมวกทอง",t:"ขอบคุณที่ใช้บริการครับเฮีย ครบสี่อาทิตย์ดอกขึ้นนะ เดี๋ยวพวกเราแวะไปเยี่ยมแถวตลาดบ่อย ๆ"},{n:"coach",t:"…เอาเถอะ ได้เงินมาแล้วก็รีบหาทางคืน อย่าให้มันพอกหางหมู"}],()=>render(),{bg:"food",look:"casual"});},
  repayloan:()=>{if(repayLoan(G)){save();AU.sfx("level");toast("คืนเงินกู้หมวกทองครบแล้ว หายใจโล่ง");render();}},
  advice:d=>{UI.modal={type:"advice",id:d.id};render();},
  mastersOpen:()=>{UI.modal={type:"masters"};render();},
  hiremaster:d=>{if(hireMaster(G,d.id,d.v)){AU.sfx("level");UI.modal=null;save();toast(`${G.F[d.id].name}ได้เรียนกับ${MASTERS[d.v].name} · แต้มสกิล +1`);}},
  hostshow:()=>{if(hostShow(G)){AU.cheer(1);save();toast("ศึกมวยค่ายศิริชัยคนดูแน่นลาน! ชื่อเสียง +3");}},
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
  buyfac:d=>{const before=campLevel(G);if(buyFacility(G,d.v)){save();const after=campLevel(G);AU.sfx("level");toast(after>before?`ค่ายเลื่อนเป็น Lv.${after}: ${CAMP_LV_NAME[after]}!`:`อัปเกรด${FACILITIES[d.v].name}แล้ว`);}},
  daeng:()=>{if(upgradeDaeng(G)){save();toast(`ครูแดงผ่านการอบรม Lv.${G.fac.daeng}`);}},
  useroad:d=>{const f=G.F[d.id];if(!f||trLocked(f)||!PRESETS[d.p])return;f.plan={...f.plan,preset:d.p,intensity:d.i};UI.modal=null;save();toast(`ตั้ง${f.name}: ${planName(d.p,d.i)} แล้ว อย่าลืมกดยืนยัน`);},
  equip:d=>{if(toggleEquip(G,d.id,d.v)){AU.sfx("ui");save();render();}else toast(`เลือกได้สูงสุด ${MAX_EQUIP} สกิล เอาออกก่อน 1 ท่า`);},
  hirestaff:d=>{if(hireStaff(G,d.v)){AU.sfx("level");save();toast(`${STAFF[d.v].name}เข้าร่วมค่ายแล้ว`);render();}},
  firestaff:d=>{fireStaff(G,d.v);save();toast(`เลิกจ้าง${STAFF[d.v].name}แล้ว`);render();},
  paydebt:()=>{const p=Math.min(10000,G.debt);G.cash-=p;G.debt-=p;save();render();},
  sign:d=>{const f=G.F[d.v];if(G.cash<f.fee)return;
    if(!d.ok&&(weeklyNet(G)-f.wage<0||G.cash-f.fee<15000)){UI.modal={type:"signwarn",id:f.id};render();return;}UI.modal=null;G.cash-=f.fee;f.camp="player";f.met=true;add(G,f.id,"trust",5);
    if(stageOf(G.week)==="local")G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};genOffers(G);save();
    playScene([{n:f.id,f:"happy",l:"train",t:f.id==="mali"?"ฝากตัวด้วยนะคะ! หนูจะเตะให้ค่ายศิริชัยดังไปทั้งจังหวัดเลย~":"สัญญาเรียบร้อยค่ะ ฉันจะส่งแผนการซ้อมสัปดาห์แรกให้ภายในคืนนี้"},
      {n:"kati",f:"happy",l:"train",with:f.id,t:f.id==="mali"?"ยินดีต้อนรับนะมะลิ! ค่ายเราไม่เหงาแล้ว!":"ยินดีต้อนรับค่ะริน! …ขออย่านับว่าหนูการ์ดตกกี่ครั้งเลยนะ"}],()=>render(),{bg:"gym",look:"train"});},
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
  scout:d=>{if(G.cash<scoutCost()||scouted(d.v))return;const free=rinFree();G.cash-=scoutCost();G.scout=G.scout||{};G.scout[d.v]=G.week;if(free)G.rinTapeWk=G.week;save();if(free){toast(`รินดูเทป${G.F[d.v].name}แล้ว (ดูฟรีได้อีกครั้งสัปดาห์ ${G.week+RIN_GAP})`);render();return;}toast("ดูเทปคู่ชกแล้ว ครูจดจุดอ่อนไว้ให้");render();},
  corner:d=>{AU.sfx("ui");UI.fight.F.A.instr=d.v;playRound();},
  chint:()=>{UI.fight.hint=!UI.fight.hint;render();},
  repinfo:()=>{UI.modal={type:"repinfo"};render();},
  skdesc:d=>{UI.skOpen=UI.skOpen===d.v?null:d.v;render();},
  cshow:()=>{UI.fight.cshow=!UI.fight.cshow;render();},
  frev:()=>{UI.fight.rev=!UI.fight.rev;render();},
  otip:d=>{UI.modal={type:"otip",id:d.v};render();},
  losstape:d=>{const L=G.losses[+d.v];if(!L||L.watched)return;const me=G.F[L.a],op=G.F[L.b];const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"};const bt=Object.entries(L.B.wl||{}).sort((a,b)=>b[1]-a[1])[0];
    L.watched=true;UI.modal=null;
    playScene([{n:"nar",t:`คืนนั้นทั้งค่ายนั่งล้อมทีวีเครื่องเก่า เปิดเทปไฟต์ที่${me.name}แพ้ให้${op.name} มีข้าวเหนียวหมูปิ้งวางกลางวง`},
      {n:"coach",t:`หยุดตรงนี้ ดูดี ๆ ${op.name}ออก${bt?W[bt[0]]:"อาวุธ"}ทุกครั้งที่เราถอยหลัง ${G.player.name}เห็นไหม`},
      {n:L.a,f:"sad",l:"casual",t:TAPE_LINE[L.a]||"เห็นแล้วค่ะ ครั้งหน้าจะไม่พลาดแบบนี้"},
      {inject:G2=>{gainXP(G2,me,25);G2.fam=G2.fam||{};G2.fam[L.b]=Math.min(2,(G2.fam[L.b]||0)+1);save();return [{n:"nar",t:`${me.name} EXP +25 · รู้ทาง${op.name}มากขึ้น ไฟต์หน้าที่เจอกันจะออกอาวุธแม่นขึ้นเล็กน้อย`}];}}],()=>render(),{bg:"gym",look:"casual"});},
  lossrev:()=>{UI.revIdx=0;UI.modal={type:"lossrev"};render();},
  revpick:d=>{UI.revIdx=+d.v;render();},
  cpick:d=>{UI.fight.pick=d.v;render();},
  cgo:()=>{const U=UI.fight;if(!U.pick)return;const C=U.care;if(C&&!C.done){C.q=0;applyCare(U.F,0);}AU.sfx("bell1");U.F.A.instr=U.pick;U.pick=null;playRound();},
  care:d=>{const U=UI.fight,C=U.care;if(!C||C.done)return;const i=C.got.length;C.got.push(d.v);const ok=C.need[i]===d.v;AU.sfx(ok?"ui":"miss");
    if(C.got.length>=C.need.length){C.done=true;const n=C.got.filter((g,k)=>g===C.need[k]).length;C.q=n===3?1:n===2?.5:0;if(C.q>=1)U.careOK=(U.careOK||0)+1;applyCare(U.F,C.q);if(C.q>=1){AU.sfx("level");const me=G.F[U.b.a];popToast({kati:"สดชื่นจังเลยค่ะ!",mali:"หายเหนื่อยแล้ว! ลุยต่อ!",rin:"สภาพร่างกายกลับมา 90%",ploy:"ขอบคุณค่ะ ใจมาแล้ว",fah:"โอเค! พร้อมจัดหนัก!"}[me.id]||"สดชื่นแล้ว!","good");}}render();},
  towel:()=>{UI.confirmTowel=true;render();},
  towelno:()=>{UI.confirmTowel=false;render();},
  towelyes:()=>{UI.confirmTowel=false;const U=UI.fight;throwTowel(U.F);U.shown.push({s:"x",t:`มุม${G.F[U.b.a].name}โยนผ้าขาวยอมแพ้`});fightEnd();},
  withdraw:()=>{const U=UI.fight;G.bookings=G.bookings.filter(x=>x!==U.b);G.rep=Math.max(0,G.rep-1);add(G,U.b.a,"trust",3);
    G.log.push(`${G.F[U.b.a].name} ถอนตัวเพราะบาดเจ็บ`);const done=U.done;UI.fight=null;render();done();},
  fdone:()=>{const done=UI.fight.done;AU.startMusic("hub");UI.fight=null;render();done();},
  gatego:()=>{const v=((document.getElementById("gatecode")||{}).value||"").toUpperCase().replace(/\s+/g,"");let ok=false;try{ok=btoa(v)===GATE.code;}catch(e){}
    if(ok){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}UI.gateErr=false;save();AU.sfx("level");toast("ปลดล็อกแล้ว! เล่นต่อปีที่ 2 ได้เลย");}else{UI.gateErr=true;AU.sfx("miss");}render();},
  newseason:()=>{if(!gateOpen())return;const res=seasonResult().map(r=>({id:r.f.id,name:r.f.name,d:r.d,t:r.t,c:r.c}));newSeason(G);const T=G.titles[G.titles.length-1];if(T)T.res=res;UI.ending=null;UI.tab="home";UI.advCache={};save();AU.startMusic("hub");
    playScene([{n:"coach",bg:"gym",t:`ฤดูกาลใหม่มาแล้ว ${G.player.name} อันดับเริ่มนับใหม่ทุกคน แต่ค่ายเราไม่ได้เริ่มจากศูนย์อีกแล้ว`},
      {n:"kati",f:"happy",l:"train",with:"coach",t:"ปีนี้หนูจะไม่ยอมให้ใครแซงแน่ค่ะ! ไปกันเลย!"}],()=>render(),{bg:"gym",look:"train"});},
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

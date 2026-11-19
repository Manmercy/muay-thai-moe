// ================= MUAY THAI MOE v1.3 — UI =================
const VERSION="1.91.21";
const CUR_LANG=(typeof window!=="undefined"&&window.LANG)||"th";
const TH_LABEL=String.fromCharCode(3652,3607,3618);
function langSwitch(cls){return `<div class="langsw ${cls||""}" role="group" aria-label="Language">${[["th",TH_LABEL],["en","EN"]].map(([k,l])=>`<button class="lsb ${CUR_LANG===k?"on":""}" data-act="setlang" data-v="${k}" aria-pressed="${CUR_LANG===k}">${l}</button>`).join("")}</div>`;}
const SAVE_KEY="mtm-save-v13";
const CANON_IDS=["kati","mali","rin","ploy","fah"];
const CHAMP_IDS=["baibua","tabtim","alicia","chaba","lada"];/* v1.89.14: Lada (Naka) joins the scene cast */ /* v1.90 (hidden): the four regional champions — full portraits in scenes like the heroines */
const castId=id=>CANON_IDS.includes(id)||CHAMP_IDS.includes(id);
let G=null;
const UI={tab:"home",scene:null,fight:null,modal:null,creator:null,ending:null,montage:null,speed:1,title:"tap",fsub:"offers",rdiv:"A",ptab:"over",tipIdx:0,advCache:{},toast:null,look:"fight"};
const $app=document.getElementById("app");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const val=(x,...a)=>typeof x==="function"?x(G,...a):x;
// v1.5: the big portrait carries the emotion. fight: happy/sad/flustered/angry · casual: normal/flustered/pout · train: normal only (other moods fall back to the main fight outfit)
// v1.9: the fight art has no blush face — its "flustered" art is a startled face, so only real surprises use it
const SURPRISE=/^(…)?\s*(ใครน่ะ|ห้ะ|หา[!?]|เอ๊ะ|อ๊ะ|อะไรนะ|จริงเหรอ|ตะ… |เดี๋ยว|ว้าย|อุ๊ย)/;
const moodFor=(mood,look,text)=>{if(look==="thai")return mood;if(mood==="surprised")return look==="casual"?"flustered":"surprised";
  if(look!=="casual"&&mood==="flustered")return SURPRISE.test(text||"")?"surprised":"happy";return mood;};
const FMOOD=m=>m==="surprised"?"flustered":m==="pout"?"sad":["happy","sad","angry"].includes(m)?m:"happy";
const stand=(id,look,mood)=>{if(id==="coach")return `${ASSET}coach.webp`;
  // v1.81: Loy Krathong Thai dress — happy + flustered art only; gold-tier players can dress the girls in it off-stage
  if(look==="casual"&&THAI_IDS.includes(id)&&typeof G!=="undefined"&&G&&G.ev&&G.ev.loy&&G.ev.loy.dressOn&&G.ev.loy.tiers&&G.ev.loy.tiers.gold)look="thai";
  if(look==="thai"&&THAI_IDS.includes(id))return `${ASSET}${id}_thai${["flustered","surprised","pout","sad","angry"].includes(mood)?"_fl":""}.webp`;
if(id==="pailin")return `${ASSET}pailin_fight_${mood==="surprised"||mood==="flustered"?"surprised":FMOOD(mood)}.webp`;
  if(look==="casual"){const v=mood==="flustered"?"_flustered":["pout","angry","sad"].includes(mood)?"_pout":"";return `${ASSET}${id}_casual${v}.webp`;}
  // v1.8: one main outfit — training scenes use the fight outfit too, so clothes never flip mid-scene
  return `${ASSET}${id}_fight_${FMOOD(mood)}.webp`;};
const THAI_IDS=["kati","mali","rin","ploy","fah"];
const faceSrc=(id,mood,look)=>id==="coach"?`${ASSET}coach_face.webp`:id==="pailin"?`${ASSET}pailin_face.webp`:look&&look!=="fight"&&look!=="thai"?`${ASSET}${id}_${look}_face.webp`:`${ASSET}${id}_${["happy","sad","flustered"].includes(mood)?mood:"happy"}_face.webp`;
const BGIMG={river_dawn:"bg_river_dawn.webp",gang_hq:"bg_gang_hq.webp",gang_hideout:"bg_gang_hideout.webp",loy_ring:"bg_loy_ring.webp",market_morning:"bg_market_morning.webp",camp:"bg_camp.webp",night:"bg_camp_night.webp",bus:"bg_bus_rain.webp",letter:"bg_grandpa_letter.webp",fair:"bg_fair.webp",local:"bg_local.webp",district:"bg_district.webp",ring:"bg_local.webp",final:"bg_final.webp",hall:"bg_hall.webp",gym:null,gymdusk:"gym1.webp",food:"bg_food.webp",temple:"bg_temple.webp",cafe:"bg_cafe.webp",river:"bg_river.webp",market:"bg_market.webp",rooster:"bg_rooster.webp",farm:"bg_farm.webp",sea:"bg_sea.webp",mountain:"bg_mountain.webp",ayutthaya:"bg_ayutthaya.webp",amphawa:"bg_amphawa.webp",
  /* v1.89.7: new scenes, ready to use */camp_night:"bg_camp_night.webp",camp_rain:"bg_camp_rain.webp",songkran:"bg_songkran.webp",newyear:"bg_newyear.webp",kitchen:"bg_kitchen.webp",hill:"bg_hill.webp",tvstudio:"bg_tvstudio.webp",live_corner:"bg_live_corner.webp",hospital:"bg_hospital.webp",vector_lab:"bg_vector_lab.webp",loy_night:"bg_loy_night.webp",sportsday:"bg_sportsday.webp",dorm_room:"bg_dorm_room.webp"};
const cardFaceSrc=C=>{if(C.face)return `${ASSET}${C.face}.webp`;const scene=(C.steps||[]).find(s=>s.n===C.c)||{},mood=scene.f||"happy",look=scene.l||"casual";
  if(look==="train")return `${ASSET}${C.c}_train_face.webp`;
  if(look==="thai"&&THAI_IDS.includes(C.c))return `${ASSET}${C.c}_thai${["flustered","surprised","pout","sad","angry"].includes(mood)?"_fl":""}_face.webp`;
  if(look==="fight")return `${ASSET}${C.c}_${["happy","sad","flustered","angry"].includes(mood)?mood:"happy"}_face.webp`;
  const suffix=["pout","sad","angry"].includes(mood)?"_pout":["flustered","surprised"].includes(mood)?"_flustered":"";
  return `${ASSET}${C.c}_casual${suffix}_face.webp`;};
const cardArtHTML=(C,lazy=false)=>`<span class="card-art" style="--card-scene:url('${ASSET}${BGIMG[C.bg]||BGIMG.camp}')"><img src="${cardFaceSrc(C)}" alt="" ${lazy?'loading="lazy" decoding="async"':""}></span>`;
// v1.34: portraits for the market and helmet-gang side characters (matched by speaker name, or st.img)
const NPC_IMG=[[/ใบหยก|Baiyok/,()=>typeof byFree==="function"&&byFree(G)?"baiyok":"baiyok_black"],[/เพชรา|Petcha/,"petchara"],[/เถ้าแก่เสือ|เถ้าแก่พยัคฆ์ทอง|Boss Suea|Golden Tiger owner/,"tiger_boss"],[/เกริก|Krerk/,"krerk"],[/นายอำเภอ|District Chief/,"nai"],[/แม่ค้า|ป้าศรี|Auntie Sri|vendor/,"vendor_green"],[/ป้าแต๋ว|เจ๊หมวย|ป้าขาย|Auntie Taew|Jae Muay/,"vendor_red"],[/ไอ้ตุ๋ย|Tuy the Red Mask/,"thief2"],[/ไอ้ตุ่ม|โจรงมกระทง|Krathong Thief/,"thief"],[/เสี่ยหมวกทองคำ|Big Boss Golden Helmet/,"gang_boss"],[/หมวกเงิน|Silver Helmet/,"gang_silver"],[/หมวกทองดำ|ลูกน้องหมวกทอง|Gold-Black Helmet|Golden Helmet's (man|men)|Gold Helmet/,"gang_goldblack"],[/หมวก|แจ็กเก็ต|Helmet|Jacket/,"gang_group"],[/ยาย|Grandma/,"grandma"]];
const npcImg=st=>{const v=st.img||(st.who&&(NPC_IMG.find(([r])=>r.test(st.who))||[])[1])||null;return typeof v==="function"?v():v;};
const TIER_BG={evloy:"bg_river.webp",pro:"bg_fair.webp",semi:"bg_hall.webp",local:"bg_local.webp",district:"bg_district.webp",final:"bg_final.webp",exhibition:"bg_fair.webp",special:"bg_district.webp",lab:"bg_hall.webp",quest:"bg_food.webp",beast:"bg_fair.webp",dm:"bg_hall.webp"};
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
/* v1.88 corner games — pixel icons */
Object.assign(PIX,{
  cback:pxIcon([".kkkkkkkk.","kppppppppk","kpykppykpk","kppppppppk","kpkyppkypk","kppppppppk","kpykppykpk","kppppppppk","kpkyppkypk",".kkkkkkkk."],{k:"#2a1d40",p:"#5a3b8a",y:"#e7b443"}),
  star:pxIcon(["....kk....","....ky....","...kyyk...","kkkyyyykkk","kyyywyyyyk",".kyywyyyk.","..kyyyyk..",".kyykkyyk.",".kyk..kyk.",".kk....kk."],{k:"#5a3a10",y:"#f7d24a",w:"#fff6c8"}),
  cramp:pxIcon(["......kk..",".....krk..","....krrk..","...krrk...","..krrrrrk.","..kkkrrk..","...krrk...","..krrk....","..krk.....","..kk......"],{k:"#4a1020",r:"#ff5a4a"}),
  oilhand:pxIcon(["..kkkkk...",".kssssskk.",".kssssssk.","kksssssssk","kssssssssk","ksssyysssk",".kssyysssk",".ksssssk..","..kkkkkk..",".........."],{k:"#3a2412",s:"#e8b088",y:"#f2c94c"})});
/* v1.87: pixel icons for the innate traits */
const TRAIT_PX={grit:pxIcon(["....k.......", "...kok......", "...koyk..k..", "..koyyk.kok.", "..koyyokoyk.", ".koyywyooyk.", ".koyywwyoyk.", "koyyywwyyok.", "koyyywwyyok.", ".koyyyyyyok.", "..kooooook..", "...kkkkkk..."],{"k": "#4a1020", "o": "#e8432e", "y": "#ffb02e", "w": "#fff2b0"}),surge:pxIcon(["......kkkk..", ".....kyyyk..", "....kyyyk...", "...kyyyk....", "..kyyyyyyk..", "..kkkkyyyk..", "....kyyyk...", "...kyyyk....", "..kyyyk.....", "..kyyk......", "..kyk.......", "..kk........"],{"k": "#4a1020", "y": "#ffd34a"}),flow:pxIcon(["......k.....", ".....kbk....", ".....kbk....", "....kbbbk...", "...kbwbbbk..", "ll.kbwbbbk..", "..kbwbbbbbk.", "l.kbbbbbbbk.", "..kbbbbbbdk.", "...kbbbbdk..", "....kkkkk...", "............"],{"k": "#16324f", "b": "#4aa8ff", "w": "#d8f0ff", "d": "#2a6fc4", "l": "#4aa8ff"}),wits:pxIcon(["....kkkk....", "...kyyyyk...", "..kywwyyyk..", "..kywyyyyk..", "..kyyyyyyk..", "..kyyyyyyk..", "...kyyyyk...", "....kyyk....", "....kggk....", "....kggk....", ".....kk.....", "............"],{"k": "#16324f", "y": "#ffe27a", "w": "#ffffff", "g": "#8fa3c8"}),eye:pxIcon(["............", "............", "...kkkkkk...", "..kwwwwwwk..", ".kwwkggkwwk.", "kwwkgkkgkwwk", "kwwkgkkgkwwk", ".kwwkggkwwk.", "..kwwwwwwk..", "...kkkkkk...", "............", "............"],{"k": "#123a22", "w": "#e8fff0", "g": "#3fd17a"}),lib:pxIcon(["............", ".kkkk..kkkk.", "kwwwwkkwwwwk", "kwggwkkwggwk", "kwwwwkkwwwwk", "kwggwkkwggwk", "kwwwwkkwwwwk", "kwggwkkwggwk", "kwwwwkkwwwwk", ".kkkkggkkkk.", "....kkkk....", "............"],{"k": "#123a22", "w": "#e8fff0", "g": "#3fd17a"}),fury:pxIcon(["............", ".kkk...kkk..", "krrrk.krrrk.", "krwrrkrrrrrk", "krwrrkrrrrrk", "krrrrk.krrrk", ".krrrk.krrk.", "..krrk.krk..", "...krkkrk...", "....krrk....", ".....kk.....", "............"],{"k": "#4a1020", "r": "#ff4d6d", "w": "#ffd0da"}),rock:pxIcon(["............", "....kkkk....", "..kkggwgkk..", ".kgggwggggk.", ".kgggggggdk.", "kggggggggddk", "kgggdgggggdk", "kggggggggddk", ".kgggggdddk.", "..kkdddddk..", "....kkkkk...", "............"],{"k": "#2a2630", "g": "#9a94a8", "w": "#e8e4f0", "d": "#6a6478"}),talent:pxIcon([".....kk.....", ".....kyk....", "....kyyk....", "kkkkkyyykkkk", "kyyyyywyyyyk", ".kyyyywyyyk.", "..kyyyyyyk..", "..kyyyyyyk..", ".kyyykkyyyk.", ".kyyk..kyyk.", ".kkk....kkk.", "............"],{"k": "#3a1450", "y": "#c98aff", "w": "#ffffff"}),tempo:pxIcon(["......kkk...", "......kppk..", "......kpppk.", "......kkppk.", "......k..kk.", "......k.....", "..kkkkk.....", ".kpppppk....", "kpwppppk....", "kpppppk.....", ".kkkkk......", "............"],{"k": "#3a1450", "p": "#c98aff", "w": "#ffffff"})};
const coachOn=()=>SETTINGS.coach&&!(G&&G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs);

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
  return `<h2>${mode==="load"?"โหลดเกม":"เลือกช่องเซฟสำหรับเกมใหม่"}</h2><div class="slots">${rows.join("")}</div>${del}${ow}${mode==="load"?`<div style="margin-top:14px;text-align:left"><a class="btn sm ghost" href="./rescue-save.html">ย้ายรหัสเซฟ</a></div>`:""}`;}

// ---------- small components ----------
function faceImg(f,cls=""){return f.canon||f.id==="pailin"?`<img class="face ${cls}" style="--c:${f.color}" src="${faceSrc(f.id,"happy")}" alt="${esc(f.name)}">`:
  `<canvas class="face npcface ${cls}" width="96" height="96" data-sprite="${f.id}" data-mode="guard" style="--c:${f.color}" aria-label="${esc(f.name)}"></canvas>`;}
// v1.86: heart level — one heart, the level number, a gauge to the next level
function hearts(b,f){f=f||{bond:b};const H=heartLv(f),cap=!H.max&&!!(G&&f.id&&heartCapped(G,f)),pct=H.max||cap?100:Math.round(H.into/H.need*100),left=Math.max(0,Math.ceil((H.need-H.into)*2)/2);
  return `<span class="hearts hlv${cap?" hcap":""}" title="ความสนิท ${Math.round(H.total)} · ${H.max?"เต็มแล้ว":cap?`หัวใจเต็มขั้นของบทนี้แล้ว (สูงสุด Lv.${heartCapLv(G)})`:`อีก ${left} ถึง Lv.${H.lv+1}`}"><i class="hp" style="--p:1"></i><b class="hlvn">Lv.${H.lv}</b><i class="hgauge"><i style="width:${pct}%"></i></i><small class="${G&&f.id&&relIsStatus(G,f)?"hstat":""}">${G&&f.id?relLabel(G,f,H.lv,true):heartTier(H.lv)}</small></span>`;}
function bar(label,v,color,txt){return `<div class="bar"><span>${label}</span><i style="--v:${clamp(v,0,100)}%;--bc:${color}"></i><b class="num">${txt??Math.round(v)}</b></div>`;}
function mini(v,color){return `<i class="mini" style="--v:${clamp(v,0,100)}%;--bc:${color}"></i>`;}
/* v1.88: an opponent shows her strength level, coloured against our best fighter in her division (red = stronger) */
function lvTone(f){if(!G||!f||f.camp==="player")return null;const I=lvInfo(f);if(I.rate==null)return null;
  return I.rate<.4?{c:"red",t:"เก่งกว่าค่ายเรา"}:I.rate>=.6?{c:"green",t:"อ่อนกว่าค่ายเรา"}:{c:"gold",t:"สูสีกับค่ายเรา"};}
function xpBar(f){if(f.camp!=="player"&&!f.canon){const t=lvTone(f);return `<div class="xp"><span class="lv${t?" lt-"+t.c:""}">Lv.${lvOf(f)}</span>${t?`<span class="pill ${t.c}">${t.t}</span>`:""}</div>`;}const need=xpNeed(f.lvl);return `<div class="xp"><span class="lv">Lv.${f.lvl}</span><i style="--v:${f.lvl>=MAX_LV?100:clamp(f.xp/need*100,0,100)}%"></i><span class="num dim">${f.lvl>=MAX_LV?"MAX":`${Math.round(f.xp)}/${need}`}</span>${f.sp>0&&f.camp==="player"?`<button class="spchip" data-act="ptab" data-v="skill">★ ${f.sp} แต้มสกิล</button>`:""}</div>`;}
function formHTML(f){return `<span class="form">${f.form.map(r=>`<i class="${r}">${r==="W"?"ช":r==="L"?"พ":"ส"}</i>`).join("")||'<span class="dim">—</span>'}</span>`;}
const rec=f=>`${f.rec.w}-${f.rec.l}-${f.rec.d}`;
const condColor=c=>c>=70?"var(--green)":c>=45?"var(--warn)":"var(--red)";
const stageLabel=()=>STAGE_NAME[stageOf(G.week)];
function toast(msg){UI.toast={msg,t:Date.now()};try{const L=document.getElementById("live");if(L){L.textContent="";setTimeout(()=>{L.textContent=String(msg).replace(/<[^>]+>/g,"");},30);}}catch(e){}render();setTimeout(()=>{if(UI.toast&&Date.now()-UI.toast.t>2300){UI.toast=null;render();}},2500);}
const ICON={home:'<path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z"/>',train:'<path d="M2 10h3v4H2zM19 10h3v4h-3zM5 8h3v8H5zM16 8h3v8h-3zM8 11h8v2H8z"/>',
  fights:'<path d="M4 4h6l2 3v6l-2 2H6l-2-2zM14 9h6v6l-2 3h-4l-1-3z"/>',people:'<path d="M8 4a4 4 0 110 8 4 4 0 010-8zM2 21c0-4 3-7 6-7s6 3 6 7zM17 6a3 3 0 110 6 3 3 0 010-6zM15 14c4 0 7 2 7 7h-6"/>',
  camp:'<path d="M2 11 12 3l10 8v2h-2v8H4v-8H2zM9 21v-6h6v6"/>',gear:'<path d="M10 2h4l1 3 3 1 3-1 2 4-2 2v2l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-2L1 9l2-4 3 1 3-1zM12 8a4 4 0 100 8 4 4 0 000-8z"/>',
  up:'<path d="M12 4l7 8h-4v8H9v-8H5z"/>',down:'<path d="M12 20l-7-8h4V4h6v8h4z"/>'};
const icon=k=>`<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
const moveIcon=m=>!m?'<span class="mv eq">–</span>':m>0?`<span class="mv up">▲${m}</span>`:`<span class="mv dn">▼${-m}</span>`;

// ---------- root render ----------
/* v1.87: a loading screen when a save opens — the art this save needs downloads first, then the rest trickles in */
const LOAD_TIPS=["ซ้อมแก้ทางก่อนชก วันชกอาวุธหลักของคู่ชกจะโดนยากขึ้น","ดูเทปคู่ชกก่อน จะรู้ว่าควรซ้อมแก้ทางแบบไหน","แต่ละคนมีพลังแฝง 2 แบบ สลับได้ในหน้าสกิล",
  "การ์ดซ้ำเอาไปอัปขั้น หรือย่อยเป็นเศษดาวได้ที่หน้าการ์ด","ของตกแต่งที่ตรงสีมงคลประจำปี ได้คะแนนประกวดค่ายสวยเพิ่ม","สนิทถึง ♥ Lv.7 ปลดท่าไม้ตายประจำตัว",
  "นักมวยล้าเกิน 70 เสี่ยงบาดเจ็บตอนซ้อม ให้พักบ้างนะ","แตะช่องในปฏิทินเพื่อดูวันเกิดและเทศกาล"];
function saveArt(){const S=new Set(),add=u=>{if(u)S.add(u);};
  /* only what the camp screen shows first: faces, the camp sprites of girls in the camp, the gym and the camp */
  add(`${ASSET}coach_face.webp`);add(ASSET+gymBg());add(`${ASSET}bg_camp.webp`);
  for(const id of CANON_IDS){const f=G.F[id];if(!f||!(f.camp==="player"||f.met))continue;add(`${ASSET}${id}_happy_face.webp`);add(`${ASSET}${id}_casual_face.webp`);if(f.camp==="player")add(`${ASSET}${id}_sheet.webp`);}
  return [...S];}
function loadScrHTML(){const L=UI.loadScr,pc=L.total?Math.round(L.n/L.total*100):100;
  const lg=WARMED[`${ASSET}logo.webp`]||IMGS["logo.webp"];return `<div class="ldscr"><div class="ldbox">${lg&&lg.complete&&lg.naturalWidth?`<img src="${ASSET}logo.webp" alt="Muay Thai Moe">`:`<h2>MUAY THAI MOE</h2>`}<div class="ldbar"><i style="width:${pc}%"></i></div><p class="ldn">กำลังเตรียมค่าย… <span>${L.n}/${L.total}</span></p><p class="ldtip">💡 ${esc(L.tip)}</p></div></div>`;}
function withArt(done){warm(`${ASSET}logo.webp`);const list=saveArt(),total=list.length;let n=0,fin=false;
  const finish=()=>{if(fin)return;fin=true;clearTimeout(to);clearTimeout(sh);UI.loadScr=null;done();setTimeout(prefetchArt,1500);};
  const sh=setTimeout(()=>{if(fin)return;UI.loadScr={n,total,tip:LOAD_TIPS[Math.floor(Math.random()*LOAD_TIPS.length)]};render();},150);
  const to=setTimeout(finish,6000);
  const tick=()=>{n++;if(UI.loadScr){UI.loadScr.n=n;const b=document.querySelector(".ldbar i"),c=document.querySelector(".ldn span");if(b)b.style.width=Math.round(n/total*100)+"%";if(c)c.textContent=`${n}/${total}`;}if(n>=total)setTimeout(finish,UI.loadScr?250:0);};
  list.forEach(u=>{if(WARMED[u]&&WARMED[u].complete){tick();return;}const i=new Image();i.decoding="async";i.onload=tick;i.onerror=tick;i.src=u;WARMED[u]=i;});
  if(!total)finish();}
/* after the camp is open, quietly fetch backgrounds and the girls' other looks — skipped on data saver or 2G */
let PREF=false;
function prefetchArt(){if(PREF||!G)return;PREF=true;const c=navigator.connection||{};if(c.saveData||/2g/.test(c.effectiveType||""))return;
  const S=new Set();Object.values(BGIMG).forEach(b=>{if(b)S.add(ASSET+b);});
  SHEET_IDS.forEach(id=>S.add(`${ASSET}${id}_sheet.webp`));S.add(`${ASSET}coach.webp`);for(const id of CANON_IDS){const f=G.F[id];if(!f||!(f.camp==="player"||f.met))continue;for(const l of ["casual","fight","train"])for(const m of ["happy","flustered","pout","sad"])S.add(stand(id,l,m));}
  const q=[...S].filter(u=>!WARMED[u]);let busy=0;const next=()=>{while(busy<2&&q.length){const u=q.shift();busy++;const i=new Image();i.decoding="async";i.onload=i.onerror=()=>{busy--;setTimeout(next,60);};i.src=u;WARMED[u]=i;}};
  (window.requestIdleCallback||((f)=>setTimeout(f,300)))(next);}
function render(){
  try{if(typeof G!=="undefined"&&G&&!G.ended)autoPlans();}catch(e){}
  try{if(typeof G!=="undefined"&&G&&G.region&&typeof REGION==="undefined"&&regionOn())regionLoad().then(R=>{if(R.flush&&G)R.flush(G);render();}).catch(()=>{});}catch(e){}
  document.documentElement.classList.toggle("vnopen",!!(UI&&(UI.scene||UI.fight)));
  let h="";
  if(UI.loadScr){$app.innerHTML=loadScrHTML();return;}
  if(!G)h=UI.creator?creatorHTML():titleHTML();
  else if(UI.ending)h=endingHTML();
  else h=`<div class="shell">${hubHTML()}</div>`;
  if(G&&UI.petName!=null&&!UI.scene&&!UI.fight){if(UI.modal&&UI.modal.type!=="petname")UI.modalQ=UI.modal;UI.modal={type:"petname",i:UI.petName};UI.petName=null;} /* v1.80: naming comes first, whatever else is waiting */
  if(G&&!UI.ending&&!UI.modal&&!UI.scene&&!UI.fight&&!UI.montage&&typeof lottoPending==="function"){const L=lottoPending(G);if(L)UI.modal=L;} /* v1.88 lottery */
  if(UI.modal)h+=modalHTML();
  if(G&&UI.montage)h+=montageHTML();
  if(G&&UI.fight)h+=fightHTML();
  if(UI.scene)h+=sceneHTML();
  if(UI.toast)h+=`<div class="toast" aria-hidden="true">${esc(UI.toast.msg)}</div>`;
  const keep={};document.querySelectorAll("[data-sk]").forEach(e=>keep[e.dataset.sk]=e.scrollTop);const fsEl=document.querySelector(".fight"),fsTop=fsEl?fsEl.scrollTop:0;
  const albumTop=document.querySelector(".m-album")?.parentElement.scrollTop||0;
  $app.innerHTML=h;
  {const pp=document.querySelector(".modal .skpop-ov");if(pp)$app.appendChild(pp);} /* v1.89.2: skill details pop up in the middle of the screen, outside the scrolling modal */
  document.querySelectorAll("[data-sk]").forEach(e=>{const k=e.dataset.sk;if(keep[k]!=null&&!UI.resetScroll)e.scrollTop=keep[k];});{const f2=document.querySelector(".fight");if(f2&&fsTop)f2.scrollTop=fsTop;} /* v1.80: the fight screen re-renders every beat; keep its scroll put */UI.resetScroll=false;{const cb=document.querySelector(".cbody");if(cb)cb.scrollTop=cb.scrollHeight;}
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
/* v1.89.28: full screen — Android/desktop get a button; iPhone Safari can't do page full screen, so it gets the Home-screen tip (manifest.webmanifest opens the installed game full screen) */
const fsOn=()=>typeof document!=="undefined"&&!!(document.fullscreenElement||document.webkitFullscreenElement);
const fsCan=()=>typeof document!=="undefined"&&!!(document.fullscreenEnabled||document.webkitFullscreenEnabled);
const fsApp=()=>{try{return matchMedia("(display-mode: fullscreen)").matches||matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;}catch(e){return false;}};
function fsHTML(){if(fsApp())return "";
  if(fsCan())return `<label class="set"><span><b>เต็มจอ</b><small>ซ่อนแถบเบราว์เซอร์ · อยากเปิดเต็มจอทุกครั้ง กด ⋮ ของเบราว์เซอร์ แล้ว "เพิ่มลงในหน้าจอหลัก"</small></span><input type="checkbox" data-act="fullscreen" ${fsOn()?"checked":""}></label>`;
  return `<div class="set"><span><b>เต็มจอ</b><small>iPhone: กดปุ่มแชร์ แล้ว "เพิ่มไปยังหน้าจอโฮม" เปิดเกมจากไอคอนนั้นจะไม่มีแถบเบราว์เซอร์ · เซฟใน Safari ไม่ตามไปเอง ส่งออกเซฟก่อนแล้วนำเข้าในไอคอนใหม่</small></span></div>`;}
if(typeof document!=="undefined")["fullscreenchange","webkitfullscreenchange"].forEach(ev=>document.addEventListener(ev,()=>{if(UI.modal&&UI.modal.type==="settings")render();}));
function settingsHTML(){const t=(k,label,desc)=>`<label class="set"><span><b>${label}</b><small>${desc}</small></span><input type="checkbox" data-act="setopt" data-k="${k}" ${SETTINGS[k]?"checked":""}></label>`;
  return `<h2>ตั้งค่า</h2><div class="sets"><div class="set"><span><b>ภาษา · Language</b><small>สลับแล้วเกมจะโหลดใหม่ เซฟยังอยู่</small></span>${langSwitch()}</div>${fsHTML()}${G?`<div class="set"><span><b>ใส่โค้ด</b><small>รับโค้ดอีเวนต์ได้ใน Discord ของเกม (ปุ่มด้านล่าง)</small></span><span class="obtns redeem"><input id="redeemcode" maxlength="24" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="โค้ด" aria-label="โค้ด"><button class="btn sm primary" data-act="redeem">ใช้โค้ด</button></span></div>${commHTML()}${typeof codeContentHTML==="function"?codeContentHTML():""}`:commHTML()}${t("music","เพลงประกอบ","ปี่ชวา กลองแขก ฉิ่ง ระหว่างชก")}${t("sfx","เอฟเฟกต์เสียง","เสียงต่อย เตะ ระฆัง เสียงเชียร์")}${t("coach","ครูแดงแนะนำ","ครูคอยไกด์ในหน้าค่าย ข้อเสนอไฟต์ และช่วงพักยก")+t("askEnd","ถามก่อนจบสัปดาห์","เตือนเมื่อยังมีสิ่งที่ยังไม่ได้ทำในสัปดาห์นี้")}${t("quick","เล่นเร็ว","ข้ามฉากฝึกซ้อมตอนจบสัปดาห์ ไปสรุปผลทันที")}</div>
   ${!G&&loadSave()?`<div class="set danger"><span><b>จัดการช่องเซฟ</b><small>ดู โหลด หรือลบเซฟแต่ละช่อง</small></span><button class="btn sm" data-act="openload">เปิด</button></div>`:""}${G?`<p class="meta">กำลังเล่นช่องเซฟ ${UI.slot} · บันทึกอัตโนมัติทุกครั้งที่มีความคืบหน้า${CLOUD.ready?" · สำรองบนคลาวด์แล้ว":" · ยังไม่ได้เชื่อมคลาวด์ (เซฟอยู่ในเบราว์เซอร์นี้เท่านั้น)"}</p>
   ${G&&UI.slot&&bakInfo(UI.slot)?`<div class="set"><span><b>เซฟก่อนอัปเดต</b><small>เก็บไว้ตอนเกมอัปเดต · v${esc(String(bakInfo(UI.slot).ver))} สัปดาห์ ${bakInfo(UI.slot).week}</small></span><button class="btn sm" data-act="bakrestore">กู้คืน</button></div>`:""}
   <div class="set"><span><b>สำรองเซฟเป็นไฟล์</b><small>เก็บไฟล์ไว้เอง ย้ายเครื่องหรือเบราว์เซอร์ก็นำเข้าได้</small></span><span class="obtns"><button class="btn sm" data-act="exportsave">ส่งออก</button><label class="btn sm">นำเข้า<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></span></div>`:`<div class="set"><span><b>นำเข้าเซฟจากไฟล์</b><small>ไฟล์ที่เคยส่งออกไว้ จะลงช่อง 1</small></span><label class="btn sm">นำเข้า<input type="file" accept=".json,application/json" data-act="importsave" hidden></label></div>`}
   <div class="set"><span><b>ย้ายรหัสเซฟ</b><small>ย้ายเซฟระหว่าง Facebook กับ Safari</small></span><a class="btn sm" href="./rescue-save.html">ย้ายรหัสเซฟ</a></div>
   <details class="gloss"><summary><b>คำศัพท์ในเกม</b></summary><dl>${GLOSS.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></details>
   <p class="meta">Muay Thai Moe v${VERSION}</p>`;}
const GLOSS=[["ความพร้อม","สภาพร่างกายวันชก ยิ่งสูงยิ่งชกได้เต็มที่ ลดลงเมื่อล้าหรือบาดเจ็บ"],["ความล้า","สะสมจากการซ้อม เกิน 65 เริ่มเสี่ยงบาดเจ็บ ลดได้ด้วยพักฟื้น ห้องฟื้นฟู ครัว"],
 ["กำลังใจ","ยิ่งสูงยิ่งชกแม่น ขึ้นจากชนะ เดต ทำบุญ ลดเมื่อแพ้หรือซ้อมหนักเกิน"],["ความสนิท","ความผูกพันกับคุณ ปลดฉากพิเศษ ท่าไม้ตายที่ 60 และเพิ่มโอกาสโหมดเลือดเดือด"],
 ["ความเชื่อใจ","นักมวยเชื่อคำสั่งของคุณแค่ไหน ยิ่งสูง คำสั่งจากมุมเวทีได้ผลดีขึ้น (สูงสุด +4% ความแม่น) ถึง 60 แพ้แล้วกำลังใจลดน้อยลง และมีผลกับฉากสารภาพใจ · เพิ่มได้จากฉากทำบุญ ไหว้ครู ไม่ซ้อมหนักเกินไป และค่ายที่ไม่ติดหนี้"],["ชื่อเสียง","คนรู้จักค่ายแค่ไหน ยิ่งสูงนักเรียนยิ่งมาเรียน"],
 ["แต้มสกิล","ได้ทุกเลเวลอัป ใช้อัปท่ามวยโบราณตามสำนักของนักมวย"],["ฝึกแก้ทาง","ดูเทปคู่ชกแล้ว ฝึกโปรแกรมที่แก้อาวุธหลักของคู่ชกในสัปดาห์ก่อนชก วันชกอาวุธหลักของเขาจะโดนยากขึ้น และเราอ่านเกมเขาขาดกว่า"],
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
  const rv=Object.values(G.F).filter(f=>f.camp==="rival"&&!f.lab&&!f.indie);if(rv.length)N.push(`ค่ายพยัคฆ์ทองส่งนักมวยลงแข่ง ${rv.length} คน เถ้าแก่ประกาศ "ปีนี้แชมป์ต้องเป็นของเรา"`);
  if((G.season||1)>=4&&G.F.pailin)N.push((G.season||1)>=5?"ไพลินนำค่ายเวกเตอร์จากกรุงเทพฯ พร้อมไนท์และเวกาขึ้นเวที":"ไพลิน พี่สาวพลอย นำค่ายเวกเตอร์มาท้าศิริชัย");
  for(const f of R){const h=f.rec||{w:0,l:0};if(h.w>=3)N.push(`${f.name} ค่ายศิริชัย ฟอร์มแรง ชนะแล้ว ${h.w} ไฟต์`);}
  if(G.rep>=10)N.push(`ค่ายมวยศิริชัยกลับมาเป็นที่พูดถึงอีกครั้ง หลังเงียบไปหลายปี`);
  const nb=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week)[0];if(nb)N.push(`โปรแกรมสัปดาห์ ${nb.week}: ${G.F[nb.a].name} ปะทะ ${G.F[nb.b].name}`);
  N.unshift(...funnyNews(2));
  if(typeof bdayWeek==="function")for(const id of ["kati","mali","rin","ploy","fah"]){const f=G.F[id];if(!f||!(f.camp==="player"||f.met))continue;const d=bdayWeek(id)-G.week;if(d>=0&&d<=2)N.unshift(d===0?`🎂 สัปดาห์นี้วันเกิด${f.name}!`:`🎂 อีก ${d} สัปดาห์ วันเกิด${f.name}`);}
  N.push(["ราคาน้ำมันมวยปรับขึ้น 5 บาท แม่ค้าบอก 'ช่วงนี้ขายดี'","สนามมวยอำเภอติดแอร์ใหม่ คนดูไม่ต้องพัดวีแล้ว","ครูมวยโคราชวัย 80 ยังสอนหมัดเหวี่ยงควายทุกเช้า","มวยหญิงได้รับความนิยมขึ้น ผู้ชมเพิ่มเกือบเท่าตัว","ชาวต่างชาติแห่เรียนมวยไทยช่วงไฮซีซัน"][G.week%5]);
  return N;}
/* v1.88 yearly theme chip on the camp page; tap for what it means this year */
function ytChipHTML(){const k=typeof ytKey==="function"&&ytKey(G);if(!k)return "";const T=YEAR_THEMES[k];const on=T.from==null||ytIn(G,k);
  return `<button class="ytchip ${on?"on":""}" data-act="ytinfo"><span>${T.ic}</span><b>${T.name}</b><small>${T.from!=null?(on?"ตอนนี้":`สด.${T.from}–${T.to}`):k==="sponsor"&&!G.yt.acc?"ไม่ได้รับข้อเสนอ":"ทั้งปี"}</small><i>▸</i></button>`;}
function ytInfoHTML(){const k=ytKey(G);if(!k)return "";const T=YEAR_THEMES[k];let st="";
  if(k==="sponsor")st=G.yt.acc?(G.week<=40?`ชนะแล้ว ${ytSponsorWins(G)}/8 ไฟต์ · ได้ ฿2,000 ทุกสัปดาห์ถึงสัปดาห์ 40`:`ปีนี้ชนะ ${ytSponsorWins(G)} ไฟต์ก่อนตัดยอด`):"ปีนี้ไม่ได้รับข้อเสนอสปอนเซอร์";
  if(k==="pm25")st=G.fac.airgym?"มีห้องซ้อมกรองฝุ่นแล้ว ซ้อมได้เต็มที่":`ห้องซ้อมในร่มกรองฝุ่น ${fmt(FACILITIES.airgym.cost[0])} · ดูได้ที่หน้าจัดการค่าย`;
  if(k==="flood")st=ytIn(G,"flood")?"ตอนนี้น้ำยังท่วมค่ายอยู่":G.week<T.from?`น้ำจะมาราวสัปดาห์ ${T.from}`:"น้ำลดแล้ว";
  return `<h2>${T.ic} ${esc(T.name)}</h2><p class="lead">${esc(T.desc)}</p>${st?`<p class="meta goldt">${esc(st)}</p>`:""}<p class="meta">ธีมประจำปีจะสุ่มใหม่ทุกต้นปี</p>`;}
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
  <main class="pxscroll" data-sk="main-${UI.tab}"><h1 class="sr">${(TABS.find(t=>t[0]===UI.tab)||["",""])[1]} · สัปดาห์ ${Math.min(G.week,52)}</h1>${({home:homeHTML,train:trainHTML,fights:fightsHTML,people:peopleHTML,camp:campHTML})[UI.tab]()}</main>`;}

const DONE_LINES=["สัปดาห์นี้จัดการครบแล้ว กดจบสัปดาห์ได้เลย","เรียบร้อยหมดแล้ว ไปพักกินข้าวเหนียวหมูปิ้งกันเถอะ แล้วค่อยจบสัปดาห์","ทุกอย่างพร้อม ครูไม่มีอะไรจะติแล้ว จบสัปดาห์ได้","งานครบ ซ้อมครบ วางแผนครบ ไปจบสัปดาห์กันเลย"];
const pickDone=()=>DONE_LINES[G.week%DONE_LINES.length];
function coachTips(force){const T=[],R=roster(G);if(!coachOn()&&!force)return T;
  for(const f of R){const b=G.bookings.find(x=>x.a===f.id);
    if(f.injury)T.push({p:9,t:`${f.name}บาดเจ็บอีก ${f.injury} สัปดาห์ ร่างกายพักเองอัตโนมัติ อย่าเพิ่งรับไฟต์`});
    else if(f.fatigue>=52&&f.plan.preset!=="rest"&&!handLocked(f))T.push({p:9,t:`${f.name} ล้า ${Math.round(f.fatigue)} แล้ว สัปดาห์นี้ให้พักฟื้นเถอะ`,act:{k:"setrest",id:f.id,label:"ไปหน้าฝึก"}});
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
  {const un=(G.losses||[]).filter(l=>!l.watched&&G.F[l.b]&&G.F[l.b].camp!=="quest"&&l.absWeek!=null&&gameWeek(G)-l.absWeek<=6);if(un.length)T.push({p:4,t:`ยังไม่ได้ดูเทปไฟต์ที่${G.F[un[un.length-1].a].name}แพ้ ดูกับทีมแล้วได้ EXP และรู้ทางคู่ชกคนนั้น`,act:{k:"lossrev",label:"ทบทวนไฟต์"}});}
  if(G.disaster&&gameWeek(G)<G.disaster.untilAbs)T.push({p:9,t:`${G.disaster.name}ยังไม่หาย นักเรียนมาเรียนได้${G.disaster.inc?"แค่ครึ่งเดียว":"ไม่ได้เลย"} อีก ${G.disaster.untilAbs-gameWeek(G)} สัปดาห์ รับไฟต์ช่วยประคองเงินไปก่อน`,act:{k:"tab",v:"fights",label:"ดูข้อเสนอ"}});
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
  if(op.camp==="rival")L.push(op.lab?"ชนะนักมวยค่ายเวกเตอร์ ชื่อเสียงขึ้นมาก":op.indie?"ชนะใบหยก นักมวยอิสระที่ทั้งวงการจับตา ชื่อเสียงขึ้นมาก":"ชนะคนของพยัคฆ์ทอง ชื่อเสียงขึ้นมาก");
  if(G.cash<8000)L.push(`เงินตึงอยู่ ค่าตัว ${fmt(o.lose)} ได้แน่ แม้แพ้`);
  // v1.82.6: the verdict now weighs why; a much weaker opponent is never "wait for the next one" without saying why
  const r=A.bestRate,gap=near?Math.abs(near.week-o.week):9,sc=scouted(op.id)||op.camp==="quest";
  const go=me.injury&&me.injury>=o.week-G.week?`ยังไม่หายเจ็บ ครูไม่ให้รับ รอให้หายก่อน`
    :me.injury?(r>=.6?`จะหายเจ็บก่อนวันชก รับได้ ถ้าพักให้หายดีก่อน`:`จะหายทันวันชกพอดี แต่ร่างกายยังไม่เต็มร้อย ข้ามไปก่อนดีกว่า`)
    :near&&gap<=1?(r>=.6?`คู่นี้อ่อนกว่าก็จริง แต่ชกติดกับไฟต์ สด.${near.week} ร่างกายไม่ทันฟื้น ครูว่าข้ามไปก่อน`:`ชนไฟต์ สด.${near.week} แถมไม่ใช่คู่ง่าย ข้ามไปก่อน`)
    :near?(r>=.6?`คู่อ่อน รับได้ แต่ห่างไฟต์ สด.${near.week} แค่ ${gap} สัปดาห์ ระหว่างนั้นซ้อมเบา ๆ`:`ห่างไฟต์ สด.${near.week} แค่ ${gap} สัปดาห์ ถ้าไม่จำเป็นรอไฟต์หลังจากนั้นดีกว่า`)
    :pf>70?(r>=.6?`คู่อ่อน แต่ตอนนี้ล้ามาก รับได้ถ้าให้พักก่อนวันชก`:`ตอนนี้ล้ามาก ไม่ควรรับคู่ระดับนี้`)
    :r>=.6?"รับได้ เก็บชัยง่าย ๆ"
    :r>=.4?(sc?"รับได้ ถ้าซ้อมแก้ทางก่อน":"รับได้ แต่ดูเทปก่อน แล้วซ้อมแก้ทาง")
    :G.cash<8000?"เสี่ยงแพ้ แต่ค่าตัวช่วยเรื่องเงินได้ ถ้ารับ อย่าหวังชนะ":"ยังเร็วไป เว้นแต่อยากลุ้นค่าตัวสูง";
  return `<h2>ครูแดงว่าไง</h2><div class="meta">${esc(me.name)} vs ${esc(op.name)} · <b class="${v.c}t">${v.t}</b></div>
   <ul class="fp-list">${L.map(t=>`<li>${t}</li>`).join("")}</ul><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>${go}</b></span></div>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">เข้าใจแล้ว</button></div>`;}
function verdictOf(rate){return rate>=.6?{c:"green",t:"อ่อนกว่า",say:"ชนะได้ไม่ยาก แต่ค่าตัวน้อย"}:rate>=.4?{c:"gold",t:"สูสี",say:"น่าสนใจ ผลอยู่ที่การเตรียมตัว"}:{c:"red",t:"เก่งกว่า",say:"เสี่ยง แต่ค่าตัวสูงและได้ EXP เยอะ"};}

function rinNoteHTML(){const n=G.rinNote;if(!n||!G.F.rin||G.F.rin.camp!=="player")return "";
  return `<button class="px rinnote" data-act="rinread"><img src="${faceSrc("rin")}" alt=""><span><b>รินส่งรายงานมา</b><small>สรุป 3 สัปดาห์ · แตะเพื่ออ่าน</small></span><i class="tdot2"></i></button>`;}
// v1.51: pets on the home card — tap once a week to play
function petsRowHTML(){const P=G.pets||[];if(!P.length)return "";return `<div class="petrow">${P.map((p,i)=>{const done=p.wk===gameWeek(G);
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
  if(G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs&&G.guideHidden!==G.week&&rinIn()){const T=coachTips(true).filter(t=>t.p>=4);const t=T.length?T[G.week%Math.min(2,T.length)]:null;
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("rin","happy")}" alt="ริน"><div class="gtxt"><b>ข้อสังเกตของริน · ครูแดงกลับสัปดาห์ ${((G.coachAwayAbs-1)%52)+1}</b><p>${t?esc("ตามข้อมูลที่ฉันเก็บไว้: "+t.t):"ข้อมูลสัปดาห์นี้ปกติดีค่ะ ไม่มีอะไรน่ากังวล"}</p><p class="meta">ไม่มีครูช่วยตัดสินใจ รินบอกได้แค่ข้อสังเกต</p></div><button class="xbtn" data-act="hideguide" aria-label="ปิด">✕</button></section>`;}
  else if(G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs&&G.guideHidden!==G.week){const KS=["ครูแดงไม่อยู่ หนูให้ทุกคนวิ่งเพิ่มคนละสามรอบค่ะ …หนูก็วิ่งด้วยนะ","หนูลองเป่านกหวีดแบบครูแดงแล้ว เสียงออกมาเหมือนเป็ดเลยค่ะ","ครูแดงโทรมาถามว่าทุกคนกินข้าวหรือยัง วันละสี่รอบแล้วค่ะ","มะลิแอบเปลี่ยนเพลงในห้องซ้อมเป็นเพลงลูกทุ่ง หนูไม่ได้ห้าม… เพราะมันมันส์ดี","ตารางซ้อมของครูแดงติดอยู่ที่ผนัง แต่ลายมือครูอ่านไม่ออกเลยค่ะ"];
    guide=`<section class="px guide away"><img class="gface" src="${faceSrc("kati","happy")}" alt="กะทิ"><div class="gtxt"><b>กะทิ (รักษาการครูแดง · ครูกลับสัปดาห์ ${((G.coachAwayAbs-1)%52)+1})</b><p>${esc(KS[G.week%KS.length])}</p><p class="meta">ช่วงนี้ไม่มีคำแนะนำจากครู ต้องตัดสินใจเองทั้งหมด</p></div><button class="xbtn" data-act="hideguide" aria-label="ปิด">✕</button></section>`;}
  const lv=campLevel(G);
  return `${rinNoteHTML()}<div class="homegrid">${(()=>{const r=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
     return r.length?`<button class="px newfighter" data-act="tab" data-v="camp" data-sub="staff"><span class="newb">NEW!</span>${r.map(([id])=>`<img src="${faceSrc(id,"happy")}" alt="">`).join("")}<span><b>${r.map(([id])=>esc(G.F[id].name)).join(" และ ")} อยากเข้าค่าย</b><small>แตะเพื่อดูสัญญา</small></span><span class="chev">▸</span></button>`:"";})()}<section class="px camp-wrap"><div class="cvbox"><canvas class="campcv" width="640" height="360" data-camp="1" aria-label="ภาพรวมค่ายมวยศิริชัย"></canvas>
    ${goalHidden()?`<button class="goal ov mini" data-act="goaltog" aria-label="แสดงเป้าหมาย">เป้าหมาย ▾</button>`:`<button class="goal ov" data-act="goaltog" aria-label="ซ่อนเป้าหมาย">${goalText()}<span class="gx">▴ ซ่อน</span></button>`}</div>
    ${G.campUsed?`<button class="campact done" data-act="campacts"><span class="ci">✓</span><span><small>กิจกรรมค่ายสัปดาห์นี้</small><b>${esc(CAMP_ACTIONS[G.campUsed].name)}</b></span></button>`
      :`<button class="campact" data-act="campacts"><span class="ci"></span><span><small>กิจกรรมค่ายสัปดาห์นี้ · ยังไม่ได้เลือก</small><b>เลือกกิจกรรมค่าย</b></span><span class="chev">▸</span></button>`}
    ${ytChipHTML()}${petsRowHTML()}
    <div class="camp-info"><button class="cinfo" data-act="tab" data-v="camp"><small>ระดับค่าย</small><b>Lv.${lv} ${CAMP_LV_NAME[lv]}</b></button><button class="cinfo" data-act="studinfo"><small>นักเรียน</small><b>${students(G)}/${studentCap(G)} คน</b></button></div></section>
   <div class="side">${guide}<div class="fgrid">${R.map(fighterChip).join("")}</div></div></div>`;}
function fighterMini(f){const c=condition(f);const nb=nextBooking(f);
  return `<button class="px fmini" data-act="fighter" data-id="${f.id}" aria-label="ดูสถานะและข้อมูล ${esc(f.name)}">${faceImg(f)}<b>${esc(f.name)} <span class="lv">Lv.${lvOf(f)}</span></b>
    <div class="minis"><span>พร้อม</span>${mini(c,condColor(c))}<span>ล้า</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <span class="meta">${f.injury?'<span class="redt">บาดเจ็บ</span>':nb?`ชก สด.${nb.week}`:"ว่าง"}${skReady(f)?' · <span class="goldt">สกิล!</span>':""}</span><span class="fmore">▸</span></button>`;}
function fighterChip(f){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id);
  return `<button class="px fchip" data-act="fighter" data-id="${f.id}" aria-label="ดูสถานะและข้อมูล ${esc(f.name)}"><span class="fmore">▸</span>${faceImg(f)}<div class="fci"><div class="nm">${esc(f.name)} <span class="lv">Lv.${f.lvl}</span>${f.sp>0?'<span class="pill gold">สกิล</span>':""}${f.injury?'<span class="pill red">เจ็บ</span>':""}</div>
    <div class="meta">${f.injury?"พักรักษาตัว":PRESETS[f.plan.preset].name} · ${rec(f)}</div>
    <div class="minis"><span>พร้อม</span>${mini(c,condColor(c))}<span>ล้า</span>${mini(f.fatigue,f.fatigue>=52?"var(--red)":"var(--warn)")}</div>
    <div class="meta">${nb?`ไฟต์ สด.${nb.week} vs ${esc(G.F[nb.b].name)}`:"ยังไม่มีไฟต์"}</div></div></button>`;}

function projFatigue(f){return fatigueAfter(G,f,f.plan.preset,f.plan.intensity);}
function attrsHTML(f,showGain){const cap=stCap(f);return `<div class="attrs">${cap>20?`<p class="meta goldt lbcap">ขีดจำกัดค่าพลัง ${cap} · ส่วนที่เกิน 20 เป็นสีทอง</p>`:""}${ATTR_GROUPS.map(([g,ks])=>`<h4>${g}</h4>`+ks.map(k=>{const v=f.a[k],gn=f.gains&&f.gains[k];
  return `<div class="attr${cap>20?" lb":""}"><span>${ATTR_LABEL[k]}</span><i style="--v:${v/cap*100}%;--m:${20/cap*100}%;--c:${v>20?20/v*100:100}%"></i><b class="num">${v.toFixed(1)}${showGain&&gn>=.05?`<span class="up">+${gn.toFixed(1)}</span>`:""}</b></div>`;}).join("")).join("")}</div>`;}
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
    const bk=oppKnown(G,op.id);if(bk&&bk.last.cp)return {p:bk.last.cp,i:safeInt(f,bk.last.cp,cap),why:`ครูยังจำ${op.name}ได้จากปีที่ ${bk.last.season} สัปดาห์ ${bk.last.wk} ตอนนั้น${COUNTER_WHY[bk.last.cp]} ซ้อม "${PRESETS[bk.last.cp].name}" ไว้ก่อน แต่เขาอาจมีท่าใหม่ ดูเทปจะชัวร์กว่า`};
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
  if(!scouted(op.id)){const bk=oppKnown(G,op.id);return `<div class="kv-row"><span>แผนไฟต์ สด.${b.week}</span><b class="dim">${bk?`จากไฟต์ครั้งก่อน ${op.name}ถนัด${attrName(bk.last.top)} · ดูเทปเพื่ออัปเดต`:`ดูเทป${op.name}ก่อน ครูถึงบอกแผนได้`}</b></div>`;}
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
/* v1.88: "keep this programme for 4 weeks" — a quiet per-fighter tick in the programme sheet; while on, the week counts as confirmed
   and her fight plan is filled with the coach's pick, so nothing asks to be confirmed. Untick any time. */
const autoOn=f=>!!(f&&f.autoTr&&gameWeek(G)<=f.autoTr);
const autoLeft=f=>autoOn(f)?f.autoTr-gameWeek(G)+1:0;
const trLocked=f=>f?(f.lockWeek===gameWeek(G)||autoOn(f)||isAway(G,f.id)):false;
const handLocked=f=>!!f&&f.lockWeek===gameWeek(G)&&!autoOn(f);
function autoPlans(){if(!G||!G.bookings)return;for(const b of G.bookings){const f=G.F[b.a];if(!f||f.camp!=="player"||b.planSet||!autoOn(f))continue;
  let pl="balanced";try{if(scouted(b.b))pl=adviseCached(b.a,b.b,b.rounds||3).best||"balanced";}catch(e){}b.plan=pl;b.planSet=true;b.autoPlan=true;}}
const planName=(p,i)=>PRESETS[p].name+(p==="rest"||!INTENSITY[i]?"":" · "+INTENSITY[i].name);
function trainHTML(){const R=roster(G);if(!R.length)return "";
  // v1.13: each fighter gets her own card with the big training animation; programmes are picked in a sheet, then the week is locked in
  return `<div class="tcards">${R.map(f=>tcard(f,trLocked(f))).join("")}</div>`;}
function tcard(f,L){const pf=projFatigue(f),rest=f.plan.preset==="rest";const tired=!f.injury&&f.fatigue>=55&&!rest;
  return `<section class="px tcard ${L?"locked":""}">${!L&&!f.injury?'<i class="tdot" aria-label="ยังไม่ได้ยืนยันโปรแกรม"></i>':""}<div class="tc-anim" role="button" tabindex="0" data-act="fighter" data-id="${f.id}" data-v="train" aria-label="ข้อมูล ${esc(f.name)}" style="background-image:url(${ASSET}${gymBg()})"><canvas width="220" height="190" data-sprite="${f.id}" data-floor="1"></canvas>
     <span class="tr-pre">${isAway(G,f.id)?"ไม่อยู่ค่าย":f.injury?"พักรักษา":PRESETS[f.plan.preset].name}</span></div>
   <div class="tc-body"><div class="tc-h"><b class="nm">${esc(f.name)}</b><span class="lv">Lv.${f.lvl}</span>${prepLine(f)}</div>
    <div class="fatg"><span>ล้า <b class="num">${Math.round(f.fatigue)}</b> → <b class="num">${Math.round(pf)}</b></span><i class="fgbar" style="--now:${clamp(f.fatigue,0,100)}%;--next:${clamp(pf,0,100)}%;--bc:${pf>70?"var(--red)":pf>55?"var(--warn)":"var(--green)"}"><s></s></i></div>
    ${tired?`<p class="warnchip">ล้ามาก ควรพักฟื้นสัปดาห์นี้</p>`:""}
    ${skReady(f)?`<button class="spchip" data-act="fighter" data-id="${f.id}" data-v="skill">★ อัปสกิลได้</button>`:""}<div class="tc-prog"><span class="pill ${L?"":"gold"}">${isAway(G,f.id)?`ไม่อยู่ค่าย · กลับในอีก ${awayLeft(G,f.id)} สัปดาห์`:f.injury?"พักรักษาตัว":PRESETS[f.plan.preset].name+(rest?"":" · "+INTENSITY[f.plan.intensity].name)}</span></div>
    ${f.injury?"":`<div class="tc-btns">${L&&!autoOn(f)?"":`<button class="btn sm" data-act="tpick" data-id="${f.id}">โปรแกรมฝึก</button>`}${coachOn()&&!L?`<button class="btn sm" data-act="advice" data-id="${f.id}">คำแนะนำครู</button>`:""}
     ${isAway(G,f.id)?`<span class="tc-ok auto">ไม่อยู่ค่าย · พักซ้อม</span>`:autoOn(f)?`<span class="tc-ok auto">↻ ซ้อมแผนเดิมอีก ${autoLeft(f)} สัปดาห์</span>`:L?`<span class="tc-ok">✓ ยืนยันโปรแกรมแล้ว</span>`:`<button class="btn sm gold tc-go" data-act="tlock" data-id="${f.id}">ยืนยันโปรแกรม</button>`}</div>`}
</div></section>`;}
// programme sheet: 4 columns, intensity hidden for rest
function tpickHTML(id){const f=G.F[id],rest=f.plan.preset==="rest";
  return `<h2>โปรแกรมฝึก · ${esc(f.name)}</h2><div class="tgrid four">${Object.entries(PRESETS).map(([k,p])=>`<button data-act="preset" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.preset===k}" title="${esc(p.desc)}">${p.name}</button>`).join("")}</div>
   <p class="meta tdesc">${esc(PRESETS[f.plan.preset].desc)}</p>
   ${rest?`<p class="meta">พักฟื้นไม่มีหนัก-เบา ร่างกายได้พักเต็มที่</p>`:`<h3>ความหนัก</h3><div class="tgrid three">${Object.entries(INTENSITY).map(([k,i])=>`<button data-act="intensity" data-f="${f.id}" data-v="${k}" aria-pressed="${f.plan.intensity===k}">${i.name}</button>`).join("")}</div>`}
   <label class="autotr"><input type="checkbox" data-act="autotr" data-id="${f.id}" ${autoOn(f)?"checked":""}><span>ซ้อมแผนนี้ต่อ 4 สัปดาห์<small>${autoOn(f)?`เหลืออีก ${autoLeft(f)} สัปดาห์ · `:""}ไม่ต้องยืนยันทุกสัปดาห์ แผนไฟต์ใช้ตามที่ครูแนะนำ เอาติ๊กออกได้ทุกเมื่อ</small></span></label>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">เลือกแล้ว</button></div>`;}
const TGT={head:"เล่นหัว",body:"เล่นลำตัว",legs:"เตะขา"};
function nextBooking(f){return G.bookings.filter(b=>b.a===f.id).sort((x,y)=>x.week-y.week)[0];}
// fight plan folds to one line; the sheet holds the choices and a confirm
function prepLine(f){const b=nextBooking(f);if(!b||f.injury)return "";const op=G.F[b.b];
  return `<button class="fpbtn ${b.planSet?"set":""}" data-act="fplan" data-id="${b.id}" aria-label="แผนไฟต์ สัปดาห์ ${b.week} พบ ${esc(op.name)}"><b>${b.planSet?"✓ แผนไฟต์":"ตั้งแผนไฟต์"}</b><small>สด.${b.week}</small></button>`;}
/* v1.89.5: fights that come by letter (belts, challenges, gang, odd jobs) start the same day — set the plan first, like a booked fight */
function questPlan(b,go){let best="balanced";try{if(scouted(b.b))best=adviseCached(b.a,b.b,b.rounds||3).best||"balanced";}catch(e){}
  UI.qb=b;UI.fpDraft={plan:best,target:"body"};
  UI.modal={type:"fplan",id:b.id,after:()=>{if(!b.planSet){b.plan=UI.fpDraft.plan;b.tac={...(b.tac||{}),target:UI.fpDraft.target};b.planSet=true;}UI.qb=null;go();}};render();}
const fpBooking=id=>(G.bookings||[]).find(x=>x.id===id)||(UI.qb&&UI.qb.id===id?UI.qb:null);
function fplanHTML(bid){const b=fpBooking(bid);if(!b)return "";const q=b===UI.qb;const f=G.F[b.a],op=G.F[b.b];const pl=UI.fpDraft.plan,tg=UI.fpDraft.target;const cp=scouted(op.id)?counterPreset(op):null;
  return `<h2>แผนไฟต์ · ${esc(f.name)} vs ${esc(op.name)}</h2>
   <div class="fp-h">${scouted(op.id)?`<span class="pill">${styleOf(op.a)}</span>${(()=>{const I=oppIntel(op);return `<span class="meta">ถนัด ${I.top}</span>`;})()}`:`<button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>ดูเทป ${fmt(scoutCost())}</button><span class="meta">ดูเทปก่อนจะรู้จุดอ่อน</span>`}</div>
   ${(()=>{if(!scouted(op.id))return "";const A=adviseCached(f.id,op.id,b.rounds||3);return `<div class="ctip"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแนะนำ:</b> แผน "${PLANS[A.best].name}" โอกาสชนะราว ${Math.round(A.bestRate*20)*5}%${A.best!=="balanced"&&A.rates.balanced<A.bestRate-.05?` (สมดุลได้ราว ${Math.round(A.rates.balanced*20)*5}%)`:""}</span></div>`;})()}
   <h3>แผน</h3><div class="tgrid three">${Object.entries(PLANS).map(([k,p])=>{const rec=scouted(op.id)&&adviseCached(f.id,op.id,b.rounds||3).best===k;return `<button data-act="fpd" data-k="plan" data-v="${k}" aria-pressed="${pl===k}">${rec?"★ ":""}${p.name}</button>`;}).join("")}</div><p class="meta tdesc">${esc(PLANS[pl].desc)}</p>
   <h3>เป้าหมาย</h3><div class="tgrid three">${Object.entries(TGT).map(([k,t])=>`<button data-act="fpd" data-k="target" data-v="${k}" aria-pressed="${tg===k}">${t}</button>`).join("")}</div>
   ${cp&&!q&&!trLocked(f)?`<button class="cprep ${f.plan.preset===cp?"on":""}" data-act="preset" data-f="${f.id}" data-v="${cp}">${f.plan.preset===cp?"✓ สัปดาห์นี้ฝึกแก้ทางอยู่":"💡 ฝึกแก้ทาง: "+PRESETS[cp].name}<small>${op.name}${COUNTER_WHY[cp]}</small></button>`:""}
   ${q?`<p class="meta center">ไฟต์จากจดหมายขึ้นชกทันที ตั้งแผนแล้วไปต่อได้เลย</p>`:""}
   <div class="mfoot">${q?(scouted(op.id)?`<button class="btn ghost" data-act="fpbest" data-id="${b.id}">ใช้แผนครูแนะนำ</button>`:""):`<button class="btn ghost" data-act="closeModal">ยกเลิก</button>`}<button class="btn primary" data-act="fpok" data-id="${b.id}">${q?"ยืนยันแผน · ขึ้นชก":"ยืนยันแผน"}</button></div>`;}
function fightsHTML(){
  const sub=UI.fsub;
  const rg=regionOn()&&(!!G.region||REGION_LIVE===false); /* v1.90 (hidden): the regional chapter tab — players see it once the letter came; testers (#regiondev) always */
  return `<div class="seg subtabs"><button data-act="fsub" data-v="offers" aria-pressed="${sub==="offers"}">ข้อเสนอ & ตาราง</button><button data-act="fsub" data-v="rank" aria-pressed="${sub==="rank"}">อันดับ</button>${rg?`<button data-act="fsub" data-v="region" aria-pressed="${sub==="region"}">ศึกชิงเจ้าสี่ภาค</button>`:""}</div>`+(sub==="rank"?rankHTML():sub==="region"&&rg?regionTabHTML():offersHTML());}
function regionTabHTML(){if(typeof REGION!=="undefined")return REGION.html();
  regionLoad().then(()=>render()).catch(()=>{UI.rgErr=1;render();});
  return `<section class="px card"><p class="meta center">${UI.rgErr?"โหลดศึกชิงเจ้าสี่ภาคไม่สำเร็จ ลองเปิดหน้านี้ใหม่":"กำลังโหลดศึกชิงเจ้าสี่ภาค…"}</p></section>`;}
// v1.7 scouting: watch tape to see the opponent's tendencies (free when Rin is in the camp)
// v1.21: tape is always a deliberate step again — Rin (or the analyst) just makes it free
const SCOUT_COST=400;const rinIn=()=>G.F.rin.camp==="player";const RIN_GAP=3;const rinFree=()=>rinIn()&&!(G.rinTapeAbs!=null&&gameWeek(G)>=G.rinTapeAbs&&gameWeek(G)-G.rinTapeAbs<RIN_GAP); // v1.38: Rin studies one tape for free every 3 weeks
const scoutCost=()=>rinFree()||(G.staff||[]).includes("wit")?0:(G.fac.video||0)>=1?200:SCOUT_COST;
const scoutLabel=()=>rinFree()?"ให้รินดูเทป (ฟรี ทุก 3 สัปดาห์)":scoutCost()?`ดูเทป ${fmt(scoutCost())}`:"ดูเทป (ฟรี)";
const scouted=id=>G.scoutAbs&&G.scoutAbs[id]!=null&&gameWeek(G)>=G.scoutAbs[id]&&gameWeek(G)-G.scoutAbs[id]<=8;
function oppIntel(op){const a=op.a;const wp=[["หมัด",a.punch],["เตะ",a.kick],["เข่า",a.knee],["ศอก",a.elbow]].sort((x,y)=>y[1]-x[1]);
  const weak=[["guard","การ์ดหลวม · เล่นหัวได้ผล"],["stamina","แรงน้อย · เล่นลำตัวดูดแรง"],["foot","ฟุตเวิร์กช้า · เตะขาให้ช้าลงอีก"],["clinch","คลินช์อ่อน · เข้าวงในได้เปรียบ"],["dur","ทนแรงกระแทกได้น้อย"]].sort((x,y)=>a[x[0]]-a[y[0]])[0];
  return {top:`${wp[0][0]} (${wp[0][1].toFixed(0)}) และ${wp[1][0]} (${wp[1][1].toFixed(0)})`,weak:weak[1]};}
function h2hText(op){const h=G.h2h&&G.h2h[op.id];return h&&(h.w+h.l+h.d)?`เคยเจอกัน ${h.w+h.l+h.d} ครั้ง · ชนะ ${h.w} แพ้ ${h.l}${h.d?` เสมอ ${h.d}`:""}`:"";}
// v1.35: trust finally does something you can see: corner orders land better, losses hurt less
const trustBonus=f=>f&&f.camp==="player"?clamp(((f.trust||0)-40)/1000,-.02,.04):0;
function trustText(f){const t=Math.round(f.trust||0),b=Math.round(trustBonus(f)*1000)/10;
  return `เชื่อใจ ${t}: ${b>0?`ทำตามคำสั่งจากมุมเวทีได้ดี ความแม่น +${b}%`:b<0?`ยังลังเลกับคำสั่งจากมุม ความแม่น ${b}%`:"ทำตามคำสั่งตามปกติ"}${t>=60?" · แพ้แล้วกำลังใจลดน้อยลง":" · ถึง 60 แพ้แล้วใจไม่ห่อเหี่ยว"}`;}
function personaOf(op){return !op.canon&&typeof PERSONA!=="undefined"?PERSONA[op.name]:null;}
function oppMemoHTML(op,bk){const L=bk.last,dv=+(ovr(op.a)-L.ovr).toFixed(1);
  return `<div class="memo"><b>📒 สมุดครูแดง</b><span>เคยเจอ ${bk.n} ครั้ง · ล่าสุดปีที่ ${L.season} สัปดาห์ ${L.wk} (${L.res==="W"?"เราชนะ":L.res==="L"?"เราแพ้":"เสมอ"}${L.type?` ${esc(L.type)}`:""})</span><span>ตอนนั้นอาวุธหลัก: ${attrName(L.top)} · แผนแก้ทางเดิม: ซ้อม "${PRESETS[L.cp]?PRESETS[L.cp].name:"-"}"</span><span class="dim">${dv>=.8?`ดูฟิตขึ้นกว่าครั้งก่อนมาก`:dv>=.3?`ดูเก่งขึ้นจากครั้งก่อนนิดหน่อย`:"ฝีมือพอ ๆ กับครั้งก่อน"} · ข้อมูลเก่า อาจมีท่าใหม่</span></div>`;}
function intelHTML(op){const bk=oppKnown(G,op.id);if(!scouted(op.id))return `${bk?oppMemoHTML(op,bk):""}<div class="intel locked"><span>${bk?"ดูเทปใหม่เพื่อเช็กว่ามีอะไรเปลี่ยนไป":"ยังไม่ได้ดูเทปคู่ชก"} · รู้แค่สายมวย ${styleOf(op.a)}</span><button class="btn sm" data-act="scout" data-v="${op.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button></div>`;
  const I=oppIntel(op),nt=bk&&bk.trick?`<span class="newtrick">⚠️ ท่าใหม่: ฝึก${attrName(bk.trick.k)}เพิ่มมาหลังเจอกันครั้งก่อน</span>`:bk&&topWeapon(op.a)!==bk.last.top?`<span class="newtrick">⚠️ เปลี่ยนอาวุธหลักจาก${attrName(bk.last.top)}เป็น${attrName(topWeapon(op.a))}</span>`:"";return `<div class="intel"><b>${G.F.rin.camp==="player"?"รินวิเคราะห์ให้":"ข้อมูลจากเทป"}</b><span>อาวุธหลัก: ${I.top}</span><span>จุดอ่อน: ${I.weak}</span>${nt}${bk?`<span class="dim">เคยเจอ ${bk.n} ครั้ง</span>`:""}</div>`;}
function offersHTML(){const mine=G.bookings.filter(b=>G.F[b.a].camp==="player").sort((a,b)=>a.week-b.week);
  return `${mine.length?`<section class="px card"><h3>ไฟต์ที่รับแล้ว</h3><div class="list">${mine.map(b=>{const o=G.F[b.b],me=G.F[b.a];
     return `<div class="bookcard"><div class="vsstage"><canvas width="150" height="150" data-sprite="${me.id}" data-mode="guard"></canvas><b class="vsx">VS</b><canvas width="150" height="150" data-sprite="${o.id}" data-mode="guard" data-flip="1"></canvas></div>
       <div class="bk-info"><div class="t">${esc(me.name)} vs ${esc(o.name)}</div><div class="meta">สัปดาห์ ${b.week} · ${TIER[b.tier].name} · ${b.rounds} ยก${b.win?` · ค่าตัว ${fmt(b.lose)} (+${fmt(b.win-b.lose)} ถ้าชนะ)`:""}</div>
       <span class="pill ${b.week===G.week?"red":"gold"}">${b.week===G.week?"สัปดาห์นี้":`อีก ${b.week-G.week} สด.`}</span>${(()=>{const v=verdictOf(adviseCached(me.id,o.id,b.rounds||3).bestRate);return `<span class="pill dtag ${v.c}">${v.t}</span>`;})()}</div><div class="bk-btns">${b.planSet?`<button class="btn sm done" data-act="fplan" data-id="${b.id}">✓ แผน: ${PLANS[b.plan||"balanced"].name}</button>`:`<button class="btn sm red" data-act="fplan" data-id="${b.id}">ตั้งแผนไฟต์</button>`}${scouted(o.id)?`<button class="btn sm done" disabled>${G.F.rin.camp==="player"?"✓ รินวิเคราะห์แล้ว":"✓ ดูเทปแล้ว"}</button>`:`<button class="btn sm" data-act="scout" data-v="${o.id}" ${G.cash<scoutCost()?"disabled":""}>${scoutLabel()}</button>`}</div></div>`;}).join("")}</div></section>`:""}
   ${dmCardHTML()}<section class="px card"><div class="card-h"><h3>ข้อเสนอสัปดาห์นี้</h3>${G.losses&&G.losses.length?`<button class="btn sm" data-act="lossrev">ทบทวนความพ่ายแพ้</button>`:`<span class="legend"><i class="dot green"></i>อ่อนกว่า <i class="dot gold"></i>สูสี <i class="dot red"></i>เก่งกว่า</span>`}</div><div class="list">${
     [...G.offers].sort((x,y)=>(y.rv||y.beast||y.hard||y.tier==="special"?1:0)-(x.rv||x.beast||x.hard||x.tier==="special"?1:0)).map(o=>{const op=G.F[o.b],me=G.F[o.a];const A=adviseCached(o.a,o.b,o.rounds||3);const v=verdictOf(A.bestRate);
       const sp=o.by?["rv","จดหมายนัดล้างตาจากใบหยก"]:o.pc?["rv","จดหมายท้าจากเพชรา"]:o.rv?["rv","ศึกล้างตา · ทั้งจังหวัดรอดู"]:o.beast?["beast",QK[o.beast].grp==="rooster"?"ศึกพิสดาร · คนปะทะไก่ชน":"ศึกพิสดาร · ล้มวัวฉบับมวยไทย"]:o.tier==="special"?["sp","ศึกพิเศษข้ามรุ่น"]:o.hard?["hard","ท้าชนคู่เหนือชั้น · ค่าตัว ×1.5"]:o.fair?["fair",o.cross?"งานวัด · ดาราข้ามรุ่น!":"ไฟต์งานวัด · ไม่นับอันดับ"]:null;
       return `<div class="item offer ${v.c} ${sp?"spx "+sp[0]:""}">${sp?`<span class="ribbon">${sp[1]}</span>`:""}<button class="oxbtn" data-act="declo" data-v="${o.id}" aria-label="ปฏิเสธข้อเสนอนี้">✕</button><div class="l"><span class="vdot ${v.c}" aria-label="${v.t}"></span>${faceImg(op,"sm")}<div>
       <div class="t">${esc(me.name)} vs ${esc(op.name)} ${tierChip(op,1)}</div>
       <div class="meta">สด.${o.week} · ${TIER[o.tier].name}${o.beast?" · ไม่นับสถิติ":""}${o.fair?" · ไม่นับอันดับ · ค่าตัวส่งทางจดหมาย":""}${o.tier==="lab"?" · ไม่นับอันดับ":""} · ${styleOf(op.a)}${op.camp==="rival"?op.lab?" · เวกเตอร์ กรุงเทพฯ":op.indie?" · อิสระ":" · พยัคฆ์ทอง":""}${personaOf(op)?` · ${personaOf(op).tag}`:""}</div>${h2hText(op)?`<div class="meta goldt">${h2hText(op)}</div>`:""}
       <div class="meta">ค่าตัว ${fmt(o.lose)} · <b class="goldt">ชนะ +${fmt(o.win-o.lose)}</b> · <b class="${v.c}t">${v.t}</b>${effGap(G,me,op)>.4?` · <b class="goldt">ชนะได้โบนัสแต้ม/ชื่อเสียง</b>`:effGap(G,me,op)<-.6?` · <span class="mutt">ชนะคู่อ่อนได้ชื่อเสียงน้อย</span>`:""}</div>
       </div></div>
       <div class="obtns3"><button class="btn sm" data-act="consider" data-v="${o.id}">${scouted(o.b)?"ข้อมูลคู่ชก":"ดูเทป"}</button>${coachOn()?`<button class="btn sm" data-act="otip" data-v="${o.id}">คำแนะนำครู</button>`:""}<button class="btn sm gold" data-act="accept" data-v="${o.id}" ${o.status==="conflict"?"disabled title=\""+esc(o.reason)+"\"":""}>รับไฟต์</button>${o.status==="conflict"?`<span class="meta">${esc(o.reason)}</span>`:""}</div></div>`;}).join("")||`<p class="lead">${G.bookings.length?"รับไฟต์แล้ว ข้อเสนอใหม่จะเข้ามาสัปดาห์หน้า":"ไม่มีข้อเสนอ (บาดเจ็บ หรือหมดฤดูกาล)"}</p>`}</div></section>`;}
// v1.84: career tier chips
function tierChip(f,full){const t=tierOf(f);return full?`<span class="tchip t-${t.k}">${t.ic} <b>${t.n}</b></span>`:`<span class="tchip sm t-${t.k}" title="${t.n}" aria-label="ระดับ ${t.n}">${t.ic}</span>`;}
function tierYearNote(f){if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);const k=G.tierStart.t[f.id];if(!k)return "";const t=tierOf(f),a=TIER_BY[k];
  return a.k===t.k?"":`<span class="meta">ต้นปี ${a.ic} ${a.n} → <b class="${t.i>a.i?"goldt":"mutt"}">${t.ic} ${t.n}</b></span>`;}
function careerHTML(d){const list=Object.values(G.F).filter(f=>f.div===d&&f.camp!=="free"&&f.camp!=="quest").sort((x,y)=>ratingOf(y)-ratingOf(x));
  const mv=tierMoves(G).filter(m=>m.f.div===d);if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);
  return `${mv.length?`<div class="tmoves"><div class="ann-h">ความเคลื่อนไหวปีนี้</div>${mv.slice(0,8).map(m=>`<div class="tmv ${m.f.camp==="player"?"me":""}">${faceImg(m.f,"sm")}<b>${esc(m.f.name)}</b><span class="meta">${m.from.ic} ${m.from.n}</span><span class="${m.up?"goldt":"mutt"}">${m.up?"▲":"▼"}</span>${tierChip(m.f,1)}</div>`).join("")}</div>`:`<p class="meta">ปีนี้ยังไม่มีใครเปลี่ยนระดับ</p>`}
   <div class="tbl-wrap"><table><thead><tr><th>#</th><th>ระดับ</th><th>นักมวย</th><th>เรตติ้ง</th><th>ปีนี้</th></tr></thead><tbody>
   ${list.map((f,i)=>{const k=G.tierStart.t[f.id],t=tierOf(f),dd=k?t.i-TIER_BY[k].i:0;return `<tr class="${f.camp==="player"?"me":f.camp==="rival"?"rival":""}"><td class="num">${i+1}</td><td>${tierChip(f,1)}</td><td>${esc(f.name)}</td><td class="num"><b>${ratingOf(f)}</b></td><td>${dd>0?'<span class="goldt">▲</span>':dd<0?'<span class="mutt">▼</span>':k?"":'<span class="meta">ใหม่</span>'}</td></tr>`;}).join("")}
   </tbody></table></div>
   <p class="meta tlegend">${TIERS.map(t=>`${t.ic} ${t.n} ${t.min||""}${t.min?"+":""}`).join(" · ")}</p>
   <p class="meta">เรตติ้งขึ้นลงทุกไฟต์ที่นับสถิติ ชนะคนที่เรตติ้งสูงกว่าได้เยอะ ชนะคนที่ต่ำกว่าได้น้อย ไฟต์รองชิงและชิงแชมป์มีผลมากกว่าปกติ</p>`;}
// v1.85: card detail page — rarity, copies, a teaser line, read the story or break spare copies into stardust
function cardBlurb(C){if(C.blurb)return C.blurb;const st=(C.steps||[]).find(x=>x&&typeof x.t==="string"&&x.n!=="nar")||(C.steps||[]).find(x=>x&&typeof x.t==="string");if(!st)return "";const t=st.t;return t.length>72?t.slice(0,70)+"…":t;}
/* v1.87: some cards continue another card's story — once both are owned, the card page links them */
const CARD_SEQ={h_mali:"g_mali_sr",h_rin:"g_rin_sr",h_fah:"g_fah_sr",g_mali_ssr:"h_mali",g_ploy_ssr:"g_ploy_sr",g_kati_ssr:"g_kati_sr"};
function cardLinkHTML(id){const own=G.cards||{},out=[];const pv=CARD_SEQ[id];if(pv&&own[pv]&&CARDS[pv])out.push(`↩ เรื่องต่อจาก <button class="clinkb" data-act="cardinfo" data-v="${pv}">${esc(CARDS[pv].t)}</button>`);
  Object.keys(CARD_SEQ).filter(k=>CARD_SEQ[k]===id&&own[k]&&CARDS[k]).forEach(k=>out.push(`↪ มีเรื่องต่อใน <button class="clinkb" data-act="cardinfo" data-v="${k}">${esc(CARDS[k].t)}</button>`));
  return out.length?`<p class="clink">${out.join("<br>")}</p>`:"";}
// v1.87.2: the album keeps its scroll position when a card or the gacha is opened from it and closed again
function albKeep(){try{const o=document.querySelector(".overlay");if(UI.modal&&UI.modal.type==="album"&&o)UI.albY=o.scrollTop;}catch(e){}}
function albRestore(){const y=UI.albY||0;if(!y)return;const go=()=>{const o=document.querySelector(".overlay");if(o)o.scrollTop=y;};go();requestAnimationFrame(go);}
function cardInfoHTML(id){const C=CARDS[id];if(!C)return "";const o=(G.cards||{})[id],R=CARD_R[C.r],who=G.F[C.c]?G.F[C.c].name:"",src=C.lg?"ตู้ลอยกระทง (ช่วงเทศกาล)":C.g?"ตู้สุ่มการ์ด":`${C.hint||"ติดตามเนื้อเรื่องไปเรื่อย ๆ"}`;
  if(!o)return `<h2>การ์ดที่ยังไม่ได้</h2><div class="cdet" style="--rc:#77747d"><div class="ccard big lock" data-rarity="${C.r}">${cardArtHTML(C,true)}<span class="tstar">${"★".repeat(R.s)}</span><b>???</b><small>${C.r}</small></div>
    <div class="cdinfo"><div class="cdtop"><span class="pill">${C.r} ${"★".repeat(R.s)}</span><span class="meta">${esc(who)}</span></div><p class="meta"><b>วิธีได้:</b> ${esc(src)}</p></div></div>
    <div class="mfoot roadbtns"><button class="btn primary" data-act="album">‹ กลับอัลบั้ม</button></div>`;
  const sp=o.spare||0,per=DUST_OF[C.r],fresh=cardFresh(id,o),lv=o.lv||1,up=cardCanUp(id,o),fx=UI.cardFx===id;UI.cardFx=null;
  return `<h2>${esc(C.t)}</h2><div class="cdet" style="--rc:${R.c}"><div class="ccard big ${fx?"lvfx":""}" data-rarity="${C.r}" style="--rc:${R.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(R.s)}</span><b>${esc(C.t)}</b><small>${C.r} · Lv.${lv}</small></div>
    <div class="cdinfo"><div class="cdtop"><span class="pill" style="box-shadow:inset 0 0 0 2px ${R.c};color:${R.c}">${C.r} ${"★".repeat(R.s)}</span><span class="meta">${esc(who)}</span>${fresh&&o.seen?'<span class="cnew">✦ ใหม่ในอัปเดตนี้</span>':""}</div>
    ${cardBlurb(C)?`<p class="cblurb">“${esc(cardBlurb(C))}”</p>`:""}${cardLinkHTML(id)}
    <div class="kv-row"><span>ขั้นการ์ด</span><b>${"◆".repeat(lv)}${"◇".repeat(CARD_MAX_LV-lv)} Lv.${lv}/${CARD_MAX_LV}</b></div><div class="kv-row"><span>ได้มาทั้งหมด</span><b>${o.n||1} ใบ</b></div><div class="kv-row"><span>ใบซ้ำที่เก็บไว้</span><b>${sp} ใบ</b></div>
    ${C.lv2?`<div class="cdlv"><span class="${lv>=2?"on":""}">${lv>=2?"✓":"🔒"} ◆◆ Lv.2 · บทส่งท้าย</span><span class="${lv>=3?"on":""}">${lv>=3?"✓":"🔒"} ◆◆◆ Lv.3 · ฉากพิเศษ "${esc(C.lv3t||"")}"${C.mg?" + มินิเกม":""}</span></div>`:""}
    <p class="meta">ได้จาก: ${esc(src)}</p><p class="meta">ใบซ้ำใช้อัปขั้นการ์ด (สูงสุด Lv.${CARD_MAX_LV} · ความสนิทกับ${esc(who)}เพิ่มทุกขั้น) หรือย่อยเป็นเศษดาว ใบละ ✦ ${per}</p></div></div>
    <div class="cdacts"><button class="btn primary cdread" data-act="cardplay" data-v="${id}">ดูเรื่องราว${lv>=2&&C.lv2?" + บทส่งท้าย":""} ▸</button>
     ${C.lv3?`<button class="btn gold cdsp" data-act="cardspecial" data-v="${id}" ${lv>=3?"":"disabled"}>${lv>=3?`✦ ฉากพิเศษ: ${esc(C.lv3t||"")}${(o.lvSeen||1)<3?" · ใหม่":""}`:`🔒 ฉากพิเศษ ปลดที่ Lv.3`}</button>`:""}
     ${C.mg&&lv>=3?`<button class="btn cdmg" data-act="cardmg" data-v="${id}">${(MG_MODES[C.mg]||{}).icon||"🥁"} มินิเกม: ${esc(C.mgt||"")}<small>${o.mgDone?`เกรดล่าสุด ${o.mgGrade||"-"} · เล่นซ้อมได้`:"เล่นครั้งแรกได้เศษดาว"}</small></button>`:""}
     <div class="cdsub">${lv<CARD_MAX_LV?`<button class="btn" data-act="cardup" data-v="${id}" ${up?"":"disabled"}>⬆ อัปเป็น Lv.${lv+1}<small>${up?"ใช้ใบซ้ำ 1 ใบ":"ต้องมีใบซ้ำ"}</small></button>`:`<button class="btn" disabled>◆ เต็มขั้นแล้ว<small>Lv.${CARD_MAX_LV}</small></button>`}<button class="btn" data-act="carddust" data-v="${id}" data-n="1" ${sp?"":"disabled"}>ย่อย 1 ใบ<small>+✦${per}</small></button></div><button class="btn ghost cdback" data-act="album">‹ กลับอัลบั้ม</button></div>`;}
function rankHTML(){const st=stageOf(G.week),cut=st==="local"?4:st==="district"?4:0,d=UI.rdiv;const rows=standings(G,d);const mv=(G.rankMove&&G.rankMove[d])||{};
  if(UI.rview==="career")return `<section class="px card"><div class="card-h"><div class="seg sm"><button data-act="rdiv" data-v="A" aria-pressed="${d==="A"}">รุ่น A</button><button data-act="rdiv" data-v="B" aria-pressed="${d==="B"}">รุ่น B</button></div><div class="seg sm"><button data-act="rview" data-v="season" aria-pressed="false">อันดับฤดูนี้</button><button data-act="rview" data-v="career" aria-pressed="true">ระดับนักมวย</button></div></div>${careerHTML(d)}</section>`;
  return `<section class="px card"><div class="card-h"><div class="seg sm"><button data-act="rview" data-v="season" aria-pressed="true">อันดับฤดูนี้</button><button data-act="rview" data-v="career" aria-pressed="false">ระดับนักมวย</button></div></div><div class="card-h"><div class="seg sm"><button data-act="rdiv" data-v="A" aria-pressed="${d==="A"}">รุ่น A</button><button data-act="rdiv" data-v="B" aria-pressed="${d==="B"}">รุ่น B</button></div>${G.champ[d]?`<span class="pill gold">แชมป์: ${esc(G.F[G.champ[d]].name)}</span>`:""}</div>
   <div class="rkhelp"><p class="meta">${st==="local"?"ท็อป 4 (เส้นทอง) ไปรอบอำเภอ · ตัดรอบ สด.20":st==="district"?"ท็อป 4 (เส้นทอง) ไปรองชิงจังหวัด · ตัดรอบ สด.40":"รองชิง สด.44 · ชิงแชมป์ สด.49"} · ชนะ 3 แต้ม</p><button class="btn sm" data-act="rankhelp">อันดับมีผลยังไง?</button></div>
   ${st==="final"||st==="off"?`<p class="meta">รองชิง (สด.44): ${(()=>{const t=(G.semis||{})[d]||[];return t.length===4?`<b>${esc(G.F[t[0]].name)}</b> vs <b>${esc(G.F[t[3]].name)}</b> · <b>${esc(G.F[t[1]].name)}</b> vs <b>${esc(G.F[t[2]].name)}</b>`:"—";})()}<br>ชิงแชมป์ (สด.49): ${G.finalists[d].map(id=>`<b>${esc(G.F[id].name)}</b>`).join(" vs ")||"รอผลรองชิง"}</p>`:""}
   <div class="tbl-wrap"><table><thead><tr><th>#</th><th></th><th>นักมวย</th><th>แต้ม</th><th>ช-พ-ส</th><th>ฟอร์ม</th></tr></thead><tbody>
   ${rows.map((r,i)=>`<tr class="${r.f.camp==="player"?"me":r.f.camp==="rival"?"rival":""} ${cut&&i<cut?"zone":""} ${cut&&i===cut-1?"cut":""}"><td class="num">${i+1}</td><td>${moveIcon(mv[r.id])}</td><td>${tierChip(r.f)} ${esc(r.f.name)}</td><td class="num"><b>${r.pts}</b></td><td class="num">${r.w}-${r.l}-${r.d}</td><td>${formHTML(r.f)}</td></tr>`).join("")}
   </tbody></table></div></section>${calendarHTML()}`;}

function peopleHTML(){const met=CANON_IDS.map(id=>G.F[id]).filter(f=>f.met);
  return `<div class="card-h"><p class="meta">ใช้เวลาด้วยกันสัปดาห์ละ 1 คน · พอสนิทกัน เธอจะทักแชทมาเองเป็นครั้งคราว</p><button class="btn sm gold albbtn" data-act="album">🃏 อัลบั้มการ์ด ${Object.keys(G.cards||{}).length}/${Object.keys(CARDS).length}${Object.entries(G.cards||{}).some(([k,c])=>cardFresh(k,c)||cardCanUp(k,c))?'<i class="ndot"></i>':""}</button>${G.freeUsed?'<span class="pill">เวลาว่าง: ใช้แล้ว</span>':'<span class="pill gold">เวลาว่าง: เหลือ 1</span>'}</div>
   <div class="plist">${met.map(f=>`<section class="px pcard"><button class="pthumb" data-act="fighter" data-id="${f.id}" data-v="rel" aria-label="ดูโปรไฟล์${esc(f.name)}"><img src="${stand(f.id,"casual")}" alt="" loading="lazy"></button>
     <div class="pbody"><div class="pnm"><b class="nm">${esc(f.name)}</b><span class="meta">${f.camp==="player"?"ค่ายศิริชัย":f.camp==="rival"&&!f.indie?"พยัคฆ์ทอง":"อิสระ"}${relTag(G,f)}</span></div>${hearts(f.bond,f)}
      <div class="pbtns"><button class="btn sm" data-act="fighter" data-id="${f.id}" data-v="rel">ประวัติ</button><button class="btn sm primary" data-act="hang" data-id="${f.id}" ${G.freeUsed||isAway(G,f.id)?"disabled":""}>${isAway(G,f.id)?"ไม่อยู่":"ใช้เวลาด้วยกัน"}</button><button class="btn sm gold giftb" data-act="giftpick" data-id="${f.id}" ${f.giftWeek===gameWeek(G)||isAway(G,f.id)?"disabled":""}>${PIX.gift}<span>${f.giftWeek===gameWeek(G)?"ให้แล้ว":"ของขวัญ"}</span></button><button class="btn sm chatb" data-act="chat" data-id="${f.id}" ${canChat(f)||canChatLov(f)?"":"disabled"}>${CHAT_PX}<span>${canChat(f)?"แชทใหม่":isAway(G,f.id)?"ไม่ตอบแชท":canChatLov(f)?"แชท":(f.bond||0)<CHAT_BOND?"ยังไม่สนิท":"ไม่มีข้อความ"}</span>${canChat(f)?'<i class="dot"></i>':""}</button></div></div></section>`).join("")}</div>`;}
function hangHTML(id){const f=G.F[id],hlv=heartLv(f).lv;const pref=k=>f.know["act_"+k]==="like"?'<i class="likeb">ชอบ</i>':f.know["act_"+k]==="dislike"?'<i class="disb">ไม่ชอบ</i>':"";
  return `<h2>ใช้เวลากับ${esc(f.name)}</h2><p class="meta">เลือกที่ที่อยากไปด้วยกัน</p><div class="acts">${Object.entries(ACTIVITIES).filter(([k,a])=>(!a.campOnly||f.camp==="player")&&(!a.heart||hlv>=10)).map(([k,a])=>{const lock=a.heart&&hlv<a.heart;return `<button class="actbtn${lock?" lockd":a.heart?" hspot":""}" data-act="date" data-id="${f.id}" data-v="${k}" ${lock||G.freeUsed||G.cash<a.cost?"disabled":""}><b>${a.heart?"♥ ":""}${a.name}${lock?"":pref(k)}</b><small>${lock?`🔒 ปลดที่ ♥Lv.${a.heart}`:a.cost?fmt(a.cost):"ฟรี"}</small></button>`;}).join("")}</div>`;}
// v1.33: what each camp level brings, so upgrades feel like a goal
function campLvHTML(){const lv=campLevel(G),t=facTotal(G),need=[0,0,5,13];
  const unlock=L=>[...Object.entries(FACILITIES).filter(([k,F])=>F.req&&F.req.lv===L).map(([k,F])=>F.name),...Object.entries(STAFF).filter(([k,S])=>S.req&&S.req.lv===L).map(([k,S])=>S.name)];
  return `<h2>ระดับค่าย</h2><p class="meta">อัปเกรดอะไรก็ได้ในค่าย ครบจำนวนขั้นแล้วค่ายจะเลื่อนระดับ · ตอนนี้ ${t} ขั้น</p><div class="clv">${[1,2,3].map(L=>{const u=unlock(L);return `<div class="clvrow px ${L===lv?"now":L<lv?"done":"lock"}" style="background-image:linear-gradient(90deg,rgba(20,16,32,.94),rgba(20,16,32,.55)),url(${ASSET}gym${L}.webp)">
    <div class="clvh"><b>Lv.${L} ${CAMP_LV_NAME[L]}</b><span class="pill ${L<=lv?"green":""}">${L<lv?"ผ่านแล้ว":L===lv?"ตอนนี้":`ต้องอัป ${need[L]} ขั้น (อีก ${need[L]-t})`}</span></div>
    <ul><li>ค่าเรียน ${L>1?`+${(L-1)*20}%`:"ปกติ"}</li><li>คนอยากมาเรียน +${L*2}</li><li>จ้างครูผู้ช่วยได้ ${1+L} คน</li>${L>1?"<li>ห้องซ้อมเปลี่ยนโฉม</li>":""}${u.length?`<li class="goldt">ปลดล็อก: ${u.join(", ")}</li>`:""}</ul></div>`;}).join("")}</div>
   <button class="btn primary" data-act="gofac">ไปหน้าอัปเกรดค่าย</button>`;}
// v1.50: the camp's hall of fame — one row per finished year, plus belts held now
// v1.82.4: trophy room — trophies, belts and certificates as pixel items on shelves; tap one for its story
const TROPHY_PX={
 cup:["..aaaaaaaaaa..","aa.abbbbbbba.aa","a..abbbbbbba..a","a..abbbbbbba..a",".a.abbbbbbba.a.","..aabbbbbbbaa..","...aabbbbbaa...",".....abbba.....","......aba......","......aba......",".....aaaaa.....","....acccccca...","....acccccca...","....aaaaaaaa..."],
 medal:["..dd.....dd..","...dd...dd...","....dd.dd....",".....ddd.....","....aaaaa....","...abbbbba...","..abbbabbba..","..abbaaabba..","..abbbabbba..","...abbbbba...","....aaaaa...."],
 belt:["..............................","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","accccccccaaaaaaaaaaaaacccccccca","accccccaabbbbbbbbbbbbaaccccccca","acccccabbbbbbaabbbbbbbacccccca","acccccabbbbbaddabbbbbbacccccca","acccccabbbbbaddabbbbbbacccccca","acccccabbbbbbaabbbbbbbacccccca","accccccaabbbbbbbbbbbbaaccccccca","accccccccaaaaaaaaaaaaacccccccca","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
 cert:["aaaaaaaaaaaaaaa","abbbbbbbbbbbbba","abccccccccccbba","abbbbbbbbbbbbba","abccccccccbbbba","abbbbbbbbbbbbba","abcccccccccbbba","abbbbbbbbbbbbba","abbbbbbbbbdddba","abbbbbbbbbdddba","abbbbbbbbbbdbba","aaaaaaaaaaaaaaa"]};
function trophySVG(kind,pal,dim){const rows=TROPHY_PX[kind],w=Math.max(...rows.map(r=>r.length)),h=rows.length;let r="";
  rows.forEach((row,y)=>[...row].forEach((ch,x)=>{if(ch!==".")r+=`<rect x="${x}" y="${y}" width="1" height="1" fill="${dim?"#3a3150":pal[ch]||"#fff"}"/>`;}));
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;}
const BELT_PAL={tha:{a:"#2a1d10",b:"#f1c232",c:"#c8283c",d:"#c8283c"},ping:{a:"#10202a",b:"#f1c232",c:"#2c5fb3",d:"#2c5fb3"},lanna:{a:"#14261a",b:"#f1c232",c:"#2f8a4f",d:"#2f8a4f"}};
const CUP_PAL={province:{a:"#7a5a10",b:"#f1c232",c:"#5a3a2a"},district:{a:"#5d6168",b:"#d7dde4",c:"#4a3a2a"},local:{a:"#6b3d1c",b:"#d08a4a",c:"#4a3a2a"},
  rg_north:{a:"#7a2a4e",b:"#f2a2c4",c:"#4a2a3a"},rg_isan:{a:"#6a1420",b:"#e8505e",c:"#3a1a1a"},rg_central:{a:"#14306a",b:"#f1c232",c:"#1a2a4a"},rg_south:{a:"#0c4a3a",b:"#5fd0b0",c:"#1a3a2a"}};
function trophyItems(){const H=G.honors||[],items=[];
  for(const h of H){const who=esc(G.F[h.id]?.name||h.id),when=h.season?`ปีที่ ${h.season} สัปดาห์ ${h.week}`:"ก่อนอัปเดต";
    if(h.kind==="rgbelt"){const D=typeof ROAD_DEST!=="undefined"&&ROAD_DEST[h.venue],col=D&&typeof RG!=="undefined"&&RG[D.r]?RG[D.r].col:"#c8283c";items.push({kind:"belt",pal:{a:"#2a1d10",b:"#f1c232",c:col,d:col},title:honorLabel(h.kind,h.venue),sub:`${who} · รุ่น ${h.div}`,when,shelf:"belt"});continue;}
    if(h.kind==="belt"||h.kind==="defense"){const v=h.venue||"tha";items.push({kind:"belt",pal:BELT_PAL[v]||BELT_PAL.tha,title:honorLabel(h.kind,h.venue),sub:`${who} · รุ่น ${h.div}`,when,shelf:"belt"});}
    else if(h.kind==="dm")items.push({kind:"medal",pal:{a:"#5a1a22",b:"#d23246",d:"#3a6fd0"},title:"แชมป์ Death Match",sub:`${who} · รุ่น ${h.div}`,when,shelf:"cup"});
    else items.push({kind:"cup",pal:CUP_PAL[h.kind]||CUP_PAL.local,title:honorLabel(h.kind,h.venue),sub:`${who} · รุ่น ${h.div}`,when,shelf:"cup"});}
  for(const a of (G.campAwards||[])){const A=CAMP_AWARDS[a.id];if(!A)continue;items.push({kind:"cert",pal:{a:"#c9961c",b:"#f4ead8",c:"#8a7a6a",d:"#c8283c"},title:A.name,sub:`มอบโดย ${A.from}`,when:`ปีที่ ${a.season} สัปดาห์ ${a.week}`,shelf:"cert"});}
  return items;}
function trophyRoomHTML(){const it=trophyItems(),sel=UI.trophySel!=null?it[UI.trophySel]:null;
  const shelf=(key,label,empty)=>{const L=it.map((x,i)=>[x,i]).filter(([x])=>x.shelf===key);
    return `<div class="tshelf ${key}"><span class="tlbl">${label} <b>${L.length}</b></span><div class="trow">${L.length?L.map(([x,i])=>`<button class="tit ${x.kind} ${UI.trophySel===i?"on":""}" data-act="trophy" data-v="${i}" aria-label="${esc(x.title)}">${trophySVG(x.kind,x.pal)}</button>`).join(""):empty.map(k=>`<span class="tit ghost ${k}">${trophySVG(k,{},true)}</span>`).join("")}</div></div>`;};
  const certLeft=Object.entries(CAMP_AWARDS).filter(([id])=>!(G.campAwards||[]).some(a=>a.id===id));
  return `<div class="troom">${shelf("cup","ถ้วยรางวัล",["cup","cup","medal"])}${shelf("belt","เข็มขัดแชมป์",["belt"])}${shelf("cert","เกียรติบัตรของค่าย",["cert","cert"])}
    <div class="tdetail">${sel?`<b>${esc(sel.title)}</b><span>${sel.sub}</span><small>${sel.when}</small>`:`<span class="meta">แตะของบนชั้นเพื่อดูว่าได้มาจากไฟต์ไหน · ครบทุกชิ้นแล้ว ถ่ายรูปค่ายไว้อวดได้</span>`}</div>
    ${certLeft.length?`<details class="tnext"><summary>เกียรติบัตรที่ยังไม่ได้ (${certLeft.length})</summary>${certLeft.map(([id,A])=>`<div class="kv-row"><span>📜 ${A.name}</span><span class="meta">${A.hint}</span></div>`).join("")}</details>`:""}
    <button class="btn sm gold" data-act="showcase">📸 ถ่ายรูปค่ายไว้อวด</button></div>`;}
function showcaseHTML(){const R=roster(G),H=(G.honors||[]).length,C=(G.campAwards||[]).length;
  return `<h2>ค่ายมวยศิริชัย · ปีที่ ${G.season||1}</h2><div class="px card"><canvas class="campcv" width="640" height="360" data-camp="1" aria-label="ภาพค่ายปัจจุบัน"></canvas></div>
   <p class="meta center">${esc(G.player.name)} · ค่าย Lv.${campLevel(G)} · นักมวย ${R.length} คน · นักเรียน ${students(G)} คน · เกียรติยศ ${H} · เกียรติบัตร ${C}</p>
   <div class="mfoot"><button class="btn primary" data-act="showcaseSave">💾 บันทึกเป็นรูป</button></div>`;}
function hallHTML(){const T=(G.titles||[]).slice().reverse(),H=(G.honors||[]).slice().reverse(),belts=Object.entries(G.belt||{}).filter(([d,b])=>G.F[b.id]&&G.F[b.id].camp==="player"),venueBelts=Object.entries(G.venueBelts||{}).flatMap(([v,ds])=>Object.entries(ds).filter(([d,b])=>G.F[b.id]?.camp==="player").map(([d,b])=>({v,d,b})));
  const yr=t=>{const res=t.res||Object.entries(t.champ||{}).filter(([d,id])=>G.F[id]&&G.F[id].camp==="player").map(([d,id])=>({name:G.F[id].name,d,t:"แชมป์จังหวัด",c:"gold"}));
    return `<div class="hall-y"><b>ปีที่ ${t.season}</b>${res.length?res.map(r=>`<div class="kv-row"><span>${esc(r.name)} · รุ่น ${r.d}</span><span class="pill ${r.c||""}">${r.t}</span></div>`).join(""):'<p class="meta">ปีนั้นยังไม่ผ่านรอบตำบล แต่ค่ายยังอยู่ครบ</p>'}</div>`;};
  return `${trophyRoomHTML()}${H.length?`<details class="hall-y hall-list"><summary><b>รายการชัยชนะสำคัญ (${H.length})</b></summary>${H.map(h=>`<div class="kv-row"><span>${esc(G.F[h.id]?.name||h.id)} · รุ่น ${h.div} · ${h.season?`ปี ${h.season} สัปดาห์ ${h.week}`:"ผลงานก่อนอัปเดต"}</span><span class="pill gold">🏆 ${honorLabel(h.kind,h.venue)}</span></div>`).join("")}</details>`:""}
   ${belts.length||venueBelts.length?`<div class="hall-y"><b>เข็มขัดที่ครองอยู่</b>${belts.map(([d,b])=>`<div class="kv-row"><span>${esc(G.F[b.id].name)} · รุ่น ${d}</span><span class="pill gold">🏆 แชมป์เวทีท่าแพ · ป้องกัน ${b.def} ครั้ง</span></div>`).join("")}${venueBelts.map(({v,d,b})=>`<div class="kv-row"><span>${esc(G.F[b.id].name)} · รุ่น ${d}</span><span class="pill gold">🏆 แชมป์${STADIUMS[v].name} · ป้องกัน ${b.def} ครั้ง</span></div>`).join("")}</div>`:""}
   ${(()=>{const C=Object.values(G.contests||{}).sort((a,b)=>b.season-a.season);return C.length?`<div class="hall-y"><b>ประกวดค่ายสวยประจำปี</b>${C.map(c=>`<div class="kv-row"><span>ปีที่ ${c.season} · ${(YEAR_COLORS.find(y=>y.k===c.color)||{}).n||""} · ${c.total}/70</span><span class="pill ${c.rank===1?"gold":""}">${c.rank===1?"🏆 ค่ายสวยประจำปี":`อันดับ ${c.rank}`}</span></div>`).join("")}</div>`:"";})()}
   ${T.length?T.map(yr).join(""):`<p class="meta">ยังไม่ครบปีแรก · จบปีแล้วผลงานของทุกคนจะมาอยู่ที่นี่ ปีละหนึ่งแถว</p>`}`;}
const DECOR_STARS={N:1,R:2,SR:3,SSR:4,SS:5};
const DECOR_SHORT={tree:"ต้นไม้",gate:"ซุ้ม",ring:"เวที",track:"ลู่วิ่ง",vehicle:"รถค่าย",bags:"กระสอบ"};
const DECOR_ICON={tree:"🌳",gate:"⛩️",ring:"🥊",track:"🏃",vehicle:"🚐",bags:"🎯"};
function decorHTML(){let total=0,owned=0;const slots=Object.entries(CAMP_DECOR);const cur=CAMP_DECOR[UI.decorSlot]?UI.decorSlot:"tree";
 const chips=slots.map(([slot,D])=>{const keys=Object.keys(D.items),have=keys.filter(k=>!decorUnlockReason(G,slot,k)).length;total+=keys.length;owned+=have;const pick=D.items[decorChoice(G,slot)];
   return `<button class="dchip ${slot===cur?"on":""}" data-act="decorslot" data-v="${slot}" aria-pressed="${slot===cur}"><span class="dic">${DECOR_ICON[slot]||"✦"}</span><b>${DECOR_SHORT[slot]||D.name}</b><small>${esc(pick?pick.name:"")}</small><i>${have}/${keys.length}</i></button>`;}).join("");
 const D=CAMP_DECOR[cur],on=decorChoice(G,cur);
 const tiles=Object.entries(D.items).map(([key,item])=>{const reason=decorUnlockReason(G,cur,key),sel=on===key;
   const price=reason?decorPrice(G,cur,key):0;
   return `<button class="dtile r-${item.r} ${sel?"on":""} ${reason?"lock":""} ${price?"buy":""}" data-act="${price?"decorbuy":"decor"}" data-k="${cur}" data-v="${key}" ${reason&&(!price||G.cash<price)?"disabled":""} aria-pressed="${sel}">
     <span class="dstars" aria-label="ระดับ ${item.r}">${"★".repeat(DECOR_STARS[item.r])}</span>${decorColor(cur,key)?`<span class="dcol${decorColor(cur,key)===yearColor(G).k?" yc":""}" style="--c:${COLOR_HEX[decorColor(cur,key)]}" title="${COLOR_NAME[decorColor(cur,key)]}">${decorColor(cur,key)===yearColor(G).k?"สีปี +2":""}</span>`:""}<b>${esc(item.name)}</b>
     <small>${sel?"✓ ใช้อยู่":price?`🛒 ซื้อ ${fmt(price)}`:reason?"🔒 "+esc(reason):"แตะเพื่อใช้"}</small></button>`;}).join("");
 const ready=goldRematchReady(G);
 const yc=yearColor(G),cr=(G.contests||{})[G.season||1];
 const ctBox=`<div class="ctbox" style="--yc:${yc.hex}"><span class="ycdot"></span><div><b>สีมงคลปีนี้: ${yc.n}</b><small>${cr?`ประกวดปีนี้จบแล้ว · อันดับ ${cr.rank} (${cr.total}/70)`:G.week>40?"ประกวดปีนี้ผ่านไปแล้ว":`ประกวดค่ายสวย สัปดาห์ที่ ${CONTEST_WEEK} · ตอนนี้ได้ราว ${beautyTotal(G)}/70`} · ของตกแต่งสีตรงได้ +2</small></div></div>`;
 return `<section class="px card cpane decorpane ${(UI.csub||"money")==="decor"?"on":""}"><h3>ตกแต่งค่าย <span class="pill">${owned}/${total} แบบ</span></h3>${ctBox}
  <div class="dprev"><canvas class="campcv" width="640" height="360" data-camp="1" aria-label="ตัวอย่างค่ายหลังตกแต่ง"></canvas></div>
  <div class="dchips">${chips}</div>
  <div class="dtiles">${tiles}</div>
  <p class="meta">ดาว ★ ยิ่งมาก ยิ่งได้ยาก · ชิ้นที่มี 🔒 ได้จากผลงานเท่านั้น · ชิ้นที่มีป้ายราคา ซื้อจากร้านได้ · ของตกแต่งเปลี่ยนแค่หน้าตาค่าย</p>
  ${cur==="vehicle"?`<div class="dgold"><p class="meta">รถตู้สีทอง: ชนะเสี่ยหมวกทองคำ 10 ครั้ง (ชนะครั้งแรกแล้ว ท้าชิงซ้ำได้ทุก 4 สัปดาห์)</p>
  <button class="btn sm gold" data-act="goldrematch" ${ready?"":"disabled"}>ท้าชิงเสี่ยหมวกทองคำอีกครั้ง${!ready&&G.gangRematchAt?" · "+goldRematchLabel(G):""}</button></div>`:""}</section>`;}
function campHTML(){const inc=classIncome(G),up=upkeep(G),wg=wages(G),lv=campLevel(G),cs=UI.csub||"money";
  const recs=[["mali",G.flags.maliRecruit],["rin",G.flags.rinRecruit]].filter(([id,ok])=>ok&&G.F[id].camp==="free");
  const dots=(n,m)=>`<span class="pips">${Array.from({length:m},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</span>`;
  return `<section class="px card camphead" style="background-image:linear-gradient(90deg,rgba(20,16,32,.95),rgba(20,16,32,.6)),url(${ASSET}${gymBg()})"><div><button class="pill gold lvbtn" data-act="camplv">ค่าย Lv.${lv} ▸</button><h3>${CAMP_LV_NAME[lv]}</h3>
    <p class="meta">อัปเกรดรวม ${facTotal(G)} ขั้น · ${lv<3?`อีก ${lv===1?5-facTotal(G):13-facTotal(G)} ขั้นจะเลื่อนเป็น Lv.${lv+1} · กดดูว่าได้อะไร`:"ระดับสูงสุดของเดโม"}</p></div></section>
   <div class="seg subtabs csubs"><button data-act="csub" data-v="money" aria-pressed="${cs==="money"}">การเงิน</button><button data-act="csub" data-v="staff" aria-pressed="${cs==="staff"}">ครู & นักมวย</button><button data-act="csub" data-v="fac" aria-pressed="${cs==="fac"}">อัปเกรดค่าย</button><button data-act="csub" data-v="decor" aria-pressed="${cs==="decor"}">ตกแต่ง</button><button data-act="csub" data-v="hall" aria-pressed="${cs==="hall"}">ถ้วยรางวัล</button></div>
   ${recruitHTML(recs)}
   <div class="grid g2">
   <section class="px card cpane ${cs==="money"?"on":""}"><h3>รายรับ-รายจ่ายต่อสัปดาห์</h3>
    <div class="kv-row"><span>นักเรียน ${students(G)} คน × ${fmt(studentFee(G))}</span><b class="num pos">+${fmt(inc)}</b></div>${incNote(G)}
    ${kvDetails("ค่าใช้จ่ายค่าย",up,upkeepParts(G))}
    ${kvDetails("ค่าจ้างนักมวยและผู้ช่วยครู",wg,wageParts(G))}
    <div class="kv-row"><b>สุทธิ</b><b class="num ${weeklyNet(G)<0?"neg":"pos"}">${fmt(weeklyNet(G))}</b></div>
    <div class="kv-row"><span>หนี้ ${fmt(G.debt)} · ผ่อนทุก 4 สัปดาห์ ${fmt(Math.min(5000,G.debt))}</span><button class="btn sm" data-act="paydebt" ${G.cash<10000||G.debt<=0?"disabled":""}>โปะ ฿10,000</button></div>
    ${G.loan>0?`<div class="kv-row loanrow"><span>เงินกู้หมวกทอง ${fmt(G.loan)} · ดอก 10% ทุก 4 สัปดาห์</span><button class="btn sm gold" data-act="repayloan" ${G.cash<G.loan?"disabled":""}>คืนทั้งหมด</button></div>`:loanOk(G)?`<div class="kv-row loanrow"><span>เงินใกล้หมด · มีเงินกู้ด่วนให้ยืม</span><button class="btn sm red" data-act="loan">ดูเงินกู้</button></div>`:""}</section>
   <section class="px card cpane ${cs==="staff"?"on":""}"><h3>ครูและนักเรียน</h3>
    <div class="kv-row"><span>คนอยากเรียน ${studentDemand(G)} · รับได้ ${studentCap(G)}</span><b class="${studentDemand(G)>studentCap(G)?"goldt":""}">${studentDemand(G)>studentCap(G)?"ล้น!":"พอดี"}</b></div>
    <div class="item nw"><div class="l"><img class="face sm" src="${faceSrc("coach")}" alt=""><div><div class="t">ครูแดง Lv.${G.fac.daeng}</div><div class="meta">รับนักเรียน +${(G.fac.daeng-1)*2} คน · ค่าเรียน +12%/ระดับ · ฝึก +5%/ระดับ</div></div></div>
     ${G.fac.daeng<3?`<button class="btn sm gold" data-act="daeng" ${G.cash<DAENG_COST[G.fac.daeng]?"disabled":""}>ส่งอบรม ${fmt(DAENG_COST[G.fac.daeng])}</button>`:'<span class="pill green">สูงสุด</span>'}</div>
    ${staffHTML()}</section>
   </div>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>สิ่งอำนวยความสะดวก</h3><div class="facs">${(()=>{const E=Object.entries(FACILITIES),lk=E.filter(([k])=>facLocked(G,k));return [...E.filter(([k])=>!facLocked(G,k)),...lk.slice(0,1)];})().map(([k,F])=>{const l=G.fac[k]||0,m=facMax(G,k),lk=facLocked(G,k);
     return `<div class="item fac ${lk?"locked":""}"><div><div class="t">${F.name} ${dots(l,m)}${F.req&&!l&&!lk?' <span class="newb sm">ใหม่</span>':""}</div><div class="meta">${F.desc}${k==="dorm"&&G.region?` · ห้องพักตัวละครหลัก ${dormRooms(G)} ห้อง`:""}</div></div>${lk?`<span class="pill">ปลดล็อก: ${lk}</span>`:l<m?`<button class="btn sm gold" data-act="buyfac" data-v="${k}" ${G.cash<F.cost[l]?"disabled":""}>${fmt(F.cost[l])}</button>`:'<span class="pill green">สูงสุด</span>'}</div>`;}).join("")}</div></section>
   <section class="px card cpane ${cs==="fac"?"on":""}"><h3>ลงทุนพิเศษ</h3>
    <div class="item nw"><div><div class="t">เชิญครูมวยโบราณมาสอน</div><div class="meta">${fmt(18000)} · นักมวยได้แต้มสกิล +1 และค่าสถานะตามสำนัก · คนละครั้งต่อฤดูกาล · เปิดสัปดาห์ 16</div></div><button class="btn sm gold" data-act="mastersOpen" ${G.week<16?"disabled":""}>เลือก</button></div>
    <div class="item nw"><div><div class="t">จัดศึกมวยที่ค่ายศิริชัย</div><div class="meta">${fmt(SHOW_COST)} · ชื่อเสียง +3 ค่ายสวยขึ้น กำลังใจทุกคน +8 · รอบละครั้ง</div></div><button class="btn sm gold" data-act="hostshow" ${G.cash<SHOW_COST||G.week<10||G.flags["show_"+stageOf(G.week)]?"disabled":""}>${G.flags["show_"+stageOf(G.week)]?"จัดแล้ว":"จัดงาน"}</button></div>
    <div class="item nw"><div><div class="t">ปิดหนี้ปู่ชัยทั้งหมด</div><div class="meta">${G.debt>0?`คงเหลือ ${fmt(G.debt)} · ปิดแล้วชื่อเสียง +2 และมีฉากพิเศษ`:"ปิดหนี้เรียบร้อยแล้ว"}</div></div>${G.debt>0?`<button class="btn sm gold" data-act="cleardebt" ${G.cash<G.debt?"disabled":""}>ปิดหนี้</button>`:'<span class="pill green">เรียบร้อย</span>'}</div></section>
   ${decorHTML()}<section class="px card cpane ${cs==="hall"?"on":""}"><h3>ห้องถ้วยรางวัล</h3>${hallHTML()}</section>
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
  const head=`<div class="fp-head">${faceImg(f)}<div><h2>${esc(f.full)}</h2><div class="meta">${f.age!=null?f.age+" ปี · ":""}${f.camp==="player"?"ค่ายศิริชัย":f.lab?"ค่ายเวกเตอร์ กรุงเทพฯ":f.camp==="rival"&&!f.indie?"ค่ายพยัคฆ์ทอง":"นักมวยอิสระ"} · รุ่น ${f.div} · ${styleOf(f.a)} · ${rec(f)}</div>${G.belt&&Object.values(G.belt).some(x=>x.id===f.id)?`<div class="beltb">🏆 แชมป์เวทีท่าแพ</div>`:Object.entries(G.venueBelts||{}).some(([v,ds])=>Object.values(ds).some(b=>b.id===f.id))?`<div class="beltb">🏆 แชมป์${STADIUMS[Object.entries(G.venueBelts).find(([v,ds])=>Object.values(ds).some(b=>b.id===f.id))[0]].name}</div>`:f.belts?`<div class="beltb old">อดีตแชมป์เวที</div>`:""}<div class="tierline">${tierChip(f,1)}<span class="meta">เรตติ้ง <b>${ratingOf(f)}</b></span>${tierYearNote(f)}</div>${xpBar(f)}</div></div>
   <div class="seg ptabs">${tabs.map(([k,n])=>`<button data-act="ptab" data-v="${k}" aria-pressed="${t===k}">${n}${k==="skill"&&skReady(f)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>`;
  let body="";
  if(t==="look"){const cur=f.outfit||"base";
    body=`<div class="olook"><canvas width="170" height="160" data-sprite="${f.id}" data-floor="1" data-mode="guard" aria-label="${esc(f.name)}"></canvas><div class="olist">${Object.entries(OUTFITS).map(([k,O])=>{const ok=k==="base"||outfitOk(G,f,k);
      return `<button class="obtn ${cur===k?"on":""}" data-act="outfit" data-id="${f.id}" data-v="${k}" ${ok?"":"disabled"}><i style="background:${O.sw||"transparent"}" class="${O.sw?"":"base"}"></i><span><b>${ok?esc(O.name):"???"}</b><small>${cur===k?"ใส่อยู่":ok?"แตะเพื่อใส่":"ปลดล็อก: "+esc(O.hint)}</small></span></button>`;}).join("")}</div></div>
      <p class="meta center">ชุดเปลี่ยนแค่ตัวพิกเซลในค่าย ตอนซ้อม และตอนชก · ไม่มีผลกับค่าพลัง</p>`;}
  if(t==="over"){const c=condition(f);const nb=G.bookings.find(b=>b.a===f.id||b.b===f.id);
    body=`${mine&&typeof lbCardHTML==="function"?lbCardHTML(f):""}${styleCardHTML(f)}${hotStreakLine(f)}<div class="fp-over">${radarSVG(f,240)}<div><div class="bars">${bar("ความพร้อม",c,condColor(c))}${bar("ความล้า",f.fatigue,"var(--warn)")}${bar("กำลังใจ",f.morale,"var(--blue)")}</div>
      ${mine?`<p class="meta goldt">${masteryLine(f)}</p>`:""}${TRAITS[f.id]?`<p class="meta trov">${TRAIT_PX[traitOf(f)]||""} พลังแฝง: <b>${TRAITS[f.id].find(t=>t.id===traitOf(f)).name}</b></p>`:""}<p class="meta">ฟอร์ม ${formHTML(f)}${nb?` · ไฟต์ถัดไปสัปดาห์ ${nb.week}`:""}</p><details><summary>ค่าสถานะละเอียด</summary>${attrsHTML(f,mine)}</details></div></div>`;}
  if(t==="train"){body=`<div class="fp-train"><div class="tr-anim big" style="background-image:url(${ASSET}${gymBg()})"><canvas width="260" height="200" data-sprite="${f.id}" data-floor="1"></canvas><span class="tr-tag">${PRESETS[f.plan.preset].name}</span></div>
     <div><p class="meta">${PRESETS[f.plan.preset].desc} · ความล้าสัปดาห์หน้า ${Math.round(projFatigue(f))}</p>${presetPicker(f)}${radarSVG(f,200)}</div></div>`;}
  if(t==="skill"&&hasTree(f.id))body=skillGrid(f,mine);else if(t==="skill")body=skillGrid(f,mine)+(SIGNATURE[f.id]?`<details class="sigcard ${hasSignature(f)?"on":""}"><summary><b>${hasSignature(f)?"✦":"🔒"} ท่าไม้ตาย: ${SIGNATURE[f.id].name}</b></summary><span class="meta">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · ตอนนี้ ♥ Lv.${heartLv(f).lv}/7`}</span></details>`:"")+`<details class="skhelp"><summary>สกิลทำงานยังไง?</summary><p class="meta">ได้แต้มสกิล 1 แต้มทุกเลเวลอัป · ท่าใหม่ปลดล็อกตามเลเวล · แต่ละท่าอัปได้ 3 ขั้น · ตอนชกกดใช้ได้เฉพาะ 3 ท่าที่ "ใช้" · แตะชื่อท่าเพื่อดูรายละเอียด</p></details>`;
  if(t==="skill")body=traitHTML(f,mine)+body;
  if(t==="rel")body=relHTML(f);
  return head+`<div class="fp-body"${t==="skill"?' data-sk="fpb"':""}>${body}</div>`;}
const SK_AN=Object.fromEntries(ATTRS);
const SK_LINES={kati:["สายแข้ง","สายหมัดศอก","สายการ์ดและใจ"],mali:["สายศอก","สายเตะและความไว","สายป้องกัน"],rin:["สายสวนกลับ","สายอ่านเกม","สายคุมระยะ"],ploy:["สายหมัดโคราช","สายเตะคอขาด","สายกำแพงพยัคฆ์"],fah:["สายศอกพยัคฆ์","สายบุกบ้าบิ่น","สายยิ้มเยาะ"]};
const SK_SHARED=["ปั้นนักน็อก","ปั้นเก็บแต้ม","ปั้นถึกอึด"];const SK_RESET_COST=10000;
const SK_ROWN=["พื้นฐาน","ระดับกลาง","ระดับกลาง · ติดตัว","ระดับสูง","ท่าไม้ตาย · Lv.14","ขั้นปรมาจารย์ · Lv.22"];
const skReady=f=>f.sp>0&&(hasTree(f.id)?skillList(f.id).some(k=>!skillBlock(f,k.id).length):true);
const fmtA=v=>(Math.floor(v*10)/10).toFixed(1).replace(/\.0$/,"");
// v1.31: skill screen — points up top, one line (สาย) at a time, a scrollable list of pixel cards with the upgrade button on each card
const skState=(f,s,mine)=>{const r=(f.skills&&f.skills[s.id])||0;if(!mine)return {r,st:r?"has":"lock"};const B=skillBlock(f,s.id);
  if(r>=3)return {r,st:"max"};if(!B.length)return {r,st:"can"};const nb=B.filter(b=>b.t!=="sp");if(!nb.length)return {r,st:"nosp"};return {r,st:"lock",B:nb};};
function skillTree(f,mine){const L=skillList(f.id),eqd=equipped(f),sc=SCHOOLS[L[0].school]||{name:""};
  const lines=(SK_LINES[f.id]||["สาย 1","สาย 2","สาย 3"]).concat(SK_SHARED);const can=li=>mine&&L.some(s=>s.line===li&&skState(f,s,mine).st==="can");
  let li=UI.skLine&&UI.skLine.id===f.id?UI.skLine.li:[0,1,2,3,4,5].find(can);if(li==null)li=0;const path=sharedPathOf(f);
  const nCan=L.filter(s=>skState(f,s,mine).st==="can").length;
  const why=st=>st.B.map(b=>b.t==="pre"?`ต้องมี "${skillDef(f.id,b.id).name}" ก่อน`:b.t==="lv"?`ต้อง Lv.${b.v}`:b.t==="stat"?`${SK_AN[b.k]} ${fmtA(b.have)}/${fmtA(b.v)}`:b.t==="path"?`เลือก "${SK_SHARED[path-3]}" ไปแล้ว (ปั้นได้ทีละสาย)`:"").filter(Boolean).join(" · ");
  const card=s=>{const st=skState(f,s,mine),eq=eqd.includes(s.id),k=skillKind(s);
    return `<div class="skc ${st.st} ${eq?"eq":""}"><div class="skc-ic">${s.passive?PIX.sk_rec:PIX["sk_"+k.k]}</div>
     <div class="skc-m"><div class="skc-h"><b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=st.r?"on":""}"></i>`).join("")}</span></div>
      <small class="skc-t">${SK_ROWN[s.row]}${eq?' · <span class="goldt">ใช้ขึ้นชกอยู่</span>':""}</small>
      <p class="skc-d">${s.desc}</p>
      <p class="skc-s">${st.st==="can"?`<span class="ok">อัปได้ → ขั้น ${st.r+1}</span>`:st.st==="max"?'<span class="goldt">อัปเต็มแล้ว</span>':st.st==="nosp"?'<span class="dim">ไม่มีแต้มสกิล · รอเลเวลอัป</span>':`<span class="no">ยังอัปไม่ได้: ${why(st)}</span>`}</p></div>
     ${mine?`<div class="skc-b">${st.st==="can"?`<button class="btn sm gold" data-act="learn" data-id="${f.id}" data-v="${s.id}" aria-label="อัป ${s.name}">+ อัป</button>`:""}${st.r&&!s.passive?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"ถอด":"ใส่"}</button>`:""}</div>`:""}</div>`;};
  return `<div class="skwrap">${mine?`<div class="skbar3"><div class="sppx"><small>แต้มสกิล</small><b class="num">★ ${f.sp}</b></div>
     ${skResetBtn(f)}<div class="sk-info"><span>${f.sp?nCan?`อัปได้ตอนนี้ <b class="ok">${nCan}</b> ท่า`:"ยังไม่มีท่าที่อัปได้ ฝึกค่าพลังเพิ่ม":"ได้ 3 แต้มทุกเลเวลอัป"}</span>
      <span class="sk-eq">ใช้ขึ้นชก ${[0,1,2].map(i=>{const s=eqd[i]&&skillDef(f.id,eqd[i]);return `<i class="${s?"on":""}" title="${s?s.name:"ว่าง"}">${s?skIcon(s,f.id):""}</i>`;}).join("")}</span></div></div>`:""}
   <div class="sknav"><div class="seg sklines"><span class="sklbl">สายสำนัก</span>${lines.slice(0,3).map((n,i)=>`<button data-act="skline" data-id="${f.id}" data-v="${i}" aria-pressed="${li===i}" aria-label="${n}" class="${skShort(n).length>10?"lng":""}">${skShort(n)}${can(i)?'<i class="tdot2"></i>':""}</button>`).join("")}</div>
   <div class="seg sklines shared"><span class="sklbl" title="เลือกปั้นได้ทีละ 1 สาย">สายปั้น</span>${lines.slice(3).map((n,j)=>{const i=j+3;return `<button data-act="skline" data-id="${f.id}" data-v="${i}" aria-pressed="${li===i}" aria-label="${n}" class="${path!=null&&path!==i?"off":""}">${path===i?"✓ ":""}${skShort(n)}${can(i)?'<i class="tdot2"></i>':""}</button>`;}).join("")}</div>
   ${li>=3&&path==null?`<p class="meta skpath">เลือกปั้นได้ 1 สาย · อัปสกิลแรกของสายไหน อีก 2 สายจะปิดจนกว่าจะรีเซ็ตสกิล</p>`:li>=3&&path!==li?`<p class="meta skpath">ดูได้ แต่อัปไม่ได้ · ตอนนี้ปั้น "${SK_SHARED[path-3]}" อยู่ รีเซ็ตสกิลก่อนถึงจะเปลี่ยนสายปั้นได้</p>`:""}</div>
   ${skTreeHTML(f,li,mine,lines,path)}</div>`;}
// v1.89: the skill tab is a tree — small nodes in three columns (trunk in the middle, the two roots split left and right);
// tapping a node opens its details in the panel pinned to the bottom, where the upgrade and equip buttons live
const skShort=n=>String(n).replace(/ (line|build)$/i,"").replace(/^(\u0e2a\u0e32\u0e22|\u0e1b\u0e31\u0e49\u0e19)/,""); // v1.89.1: "สายแข้ง"→"แข้ง", "Shin line"→"Shin" on the buttons
const skKindTag=s=>s.br==null?SK_ROWN[s.row]:s.nd===5?`ขั้นตำนาน · Lv.${s.lv}`:s.nd===4?"ติดตัว · หนุนสาย":s.nd===2?`ติดตัว · Lv.${s.lv}`:`Lv.${s.lv}`;
// v1.89.3: skills keep the original three icons (fist = attack, shield = guard, heart = recovery/always-on);
// each skill only adds a tiny mark or two in the corners so no two skills of one fighter look exactly alike
const SKO={atk:{r:["..........",".kkkkkkk..","kydydydyk.","kyyyyyyyk.","kyyyyyyykk","kyyyyyyyyk",".kyyyyyyk.",".kyyyyyk..","..kyyyk...","..kkkkk..."],p:{k:"#4a1020",y:"#ff6a4d",d:"#b8322a"}},
 def:{r:[".kkkkkkkk.",".kbbbbbbk.",".kbwbbbbk.",".kbwbbbbk.",".kbbbbbbk.",".kbbbbbbk.","..kbbbbk..","..kbbbbk..","...kbbk...","....kk...."],p:{k:"#16264a",b:"#4a8fe8",w:"#bfe0ff"}},
 rec:{r:["..........",".kk...kk..","kggk.kggk.","kgwgkgggk.","kgggggggk.",".kgggggk..","..kgggk...","...kgk....","....k.....",".........."],p:{k:"#123a22",g:"#3fd17a",w:"#c8ffd9"}}};
const SKM={tl:[[0,0],[1,0],[0,1]],tr:[[11,0],[10,0],[11,1]],bl:[[0,11],[1,11],[0,10]],br:[[11,11],[10,11],[11,10]],tm:[[5,0],[6,0]],bm:[[5,11],[6,11]],lm:[[0,5],[0,6]],rm:[[11,5],[11,6]]};
const SKM_POOL=[];for(const c of ["e","w"])for(const k of Object.keys(SKM))SKM_POOL.push(k+":"+c);
let SK_ICONS=null;
function skGrid(I){const N=12,grid=[...Array(N)].map(()=>Array(N).fill("."));
  SKO[I.g].r.forEach((row,y)=>[...row].forEach((c,x)=>{if(c!==".")grid[y+1][x+1]=c;}));
  for(const m of I.mk){const [k,c]=m.split(":");for(const [x,y] of SKM[k])if(grid[y][x]===".")grid[y][x]=c;}
  return grid.map(r=>r.join(""));}
function skBuildIcons(){SK_ICONS={};const all=[];for(const fid of CANON_IDS)for(const s of SKILLS[fid]||[])all.push([fid,s]);for(const s of SHARED_SKILLS)all.push(["build",s]);
  const used={};let n=0;
  for(const [fid,s] of all){const g=s.passive?"rec":skillKind(s).k;const tag=s.nd===5?"tr:e":s.row===5&&s.br==null?"tm:e":s.feed!=null?"br:g":null;
    const scope=s.shared?"build":fid;used[scope]=used[scope]||{};let pick=null;const P=SKM_POOL.length,st=(n++*5)%P;
    const tries=[[]];for(let a=0;a<P;a++)tries.push([SKM_POOL[(st+a)%P]]);for(let a=0;a<P;a++)for(let b=a+1;b<P;b++)tries.push([SKM_POOL[(st+a)%P],SKM_POOL[(st+b)%P]]);
    for(const t of tries){const mk=[tag].concat(t).filter(Boolean);if(new Set(mk.map(x=>x.split(":")[0])).size<mk.length)continue;const I={g,mk};const k=skGrid(I).join("");if(!used[scope][k]){used[scope][k]=1;pick=I;break;}}
    SK_ICONS[(s.shared?"":fid+":")+s.id]=pick||{g,mk:[]};}}
function skIconSVG(fid,s){if(!SK_ICONS)skBuildIcons();const I=SK_ICONS[(s.shared?"":fid+":")+s.id];if(!I)return PIX.sk_rec;
  return pxIcon(skGrid(I),Object.assign({e:"#ffd65a",w:"#fff6e8",g:"#5fe39a"},SKO[I.g].p));}
const skIcon=(s,fid)=>`<span class="ic">${skIconSVG(fid||skOwner(s),s)}</span>`;
const skOwner=s=>{for(const id of CANON_IDS)if((SKILLS[id]||[]).includes(s))return id;return "kati";};
function skTreeHTML(f,li,mine,lines,path){const L=skillList(f.id).filter(s=>s.line===li),eqd=equipped(f);
  const st=s=>skState(f,s,mine);
  let sel=UI.skSel&&UI.skSel.startsWith(f.id+":")?L.find(s=>s.id===UI.skSel.slice(f.id.length+1)):null;
  // v1.89.1: the original moves stay one per row down the middle (as before); only the new roots split into two columns
  const trunk=L.filter(s=>s.br==null).sort((a,b)=>a.row-b.row),last=trunk.length,ocol=0;
  const pos=s=>s.br==null?[trunk.indexOf(s)+1,"1/-1",(trunk.indexOf(s)?"up":"")+" wide"]:[last+1+s.nd,s.br?2:1,s.nd>1?"up":""];
  const tag=s=>{const t=st(s);if(t.st==="can")return '<small class="tg ok">อัปได้</small>';if(t.st==="max")return '<small class="tg gold">เต็ม</small>';
    if(t.st==="lock"&&t.B){const lv=t.B.find(b=>b.t==="lv");if(lv)return `<small class="tg">Lv.${lv.v}</small>`;return "";}
    return "";};
  const R=(SK_ROOTS[li<3?f.id:"build"]||[])[li<3?li:li-3];
  // v1.89.3: description sits on the row again (no i / popup); equip is a pixel toggle — yellow while equipped, grey when not
  const sdesc=s=>{const rn=s.br!=null&&R?R[s.br].n:null;return s.desc.split(" · ").filter(x=>!/^Lv\.\d+$/.test(x)&&x!==rn).join(" · ");};
  const node=s=>{const t=st(s),[r,c,cn]=pos(s),eq=eqd.includes(s.id);
    const lockTxt=mine&&t.st==="lock"&&t.B?`<p class="skwhy">${why(t)}</p>`:"";
    const cls=t.st==="lock"&&t.r?"has":t.st;
    return `<div class="skn2 ${cls}${s.passive?" pas":""}${s.feed!=null?" feed":""}${s.nd===5?" leg":""}${eq?" eq":""}${cn?" "+cn:""}" style="grid-row:${r};grid-column:${c}">
      ${skIcon(s,f.id)}<b class="nm">${s.name}${s.br==null?`<small class="tier">${skKindTag(s)}</small>`:""}<span class="pips" aria-label="ขั้น ${t.r}/3">${[1,2,3].map(i=>`<i class="${i<=t.r?"on":""}"></i>`).join("")}</span></b>
      <div class="sktx"><p class="skds">${sdesc(s)}</p>${lockTxt}</div>
      <span class="ctl">${mine&&t.r&&!s.passive?`<button class="skeq${eq?" on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" aria-pressed="${eq}" aria-label="${eq?"ถอด":"ใส่"} ${s.name}">${eq?"ถอด":"ใส่"}</button>`:""}${mine&&t.st==="can"?`<button class="skplus" data-act="learn" data-id="${f.id}" data-v="${s.id}" aria-label="อัป ${s.name} เป็นขั้น ${t.r+1}">+</button>`:""}</span>${tag(s)}${eq?'<i class="eqm" aria-hidden="true">E</i>':""}</div>`;};
  const split=R&&L.some(s=>s.br!=null)?`<div class="sksplit" style="grid-row:${last+1}" aria-hidden="false"><svg viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden="true"><path d="M150 0V8H73V20M150 8H227V20"/></svg>
    <span class="rt a"><b>${R[0].n}</b><small>${R[0].m}</small></span><span class="rt b"><b>${R[1].n}</b><small>${R[1].m}</small></span></div>`:"";
  const why=t=>t.B.map(b=>b.t==="pre"?`ต้องมี "${skillDef(f.id,b.id).name}" ก่อน`:b.t==="lv"?`ต้อง Lv.${b.v}`:b.t==="stat"?`${SK_AN[b.k]} ${fmtA(b.have)}/${fmtA(b.v)}`:b.t==="path"?`เลือก "${SK_SHARED[path-3]}" ไปแล้ว (ปั้นได้ทีละสาย)`:"").filter(Boolean).join(" · ");
  let det="";if(sel){const t=st(sel),eq=eqd.includes(sel.id);
    const ftxt=sel.feed!=null?`<p class="skfeed">↗ หนุน${sel.feed==="school"?"สายสำนักทุกสาย":`"${lines[sel.feed]}"`} · ทำงานเองตลอด ไม่ใช้ช่องขึ้นชก</p>`:"";
    // v1.89.1: details open as a popup in the middle of the screen; upgrading stays on the + of each row
    det=`<div class="skpop-ov" data-act="skpopbg"><div class="px skpop" role="dialog" aria-modal="true" aria-label="${sel.name}"><div class="skdet-h">${skIcon(sel,f.id)}<div><b>${sel.name}</b><small>${skKindTag(sel)} · ${sel.passive?"ติดตัว ทำงานเองไม่ใช้ช่อง":eq?'<span class="goldt">ใช้ขึ้นชกอยู่</span>':"แอคทีฟ ใส่ขึ้นชกได้"}</small></div><button class="skx" data-act="skselx" aria-label="ปิดรายละเอียด">✕</button></div>
      <div class="skpop-r"><span class="pips">${[1,2,3].map(i=>`<i class="${i<=t.r?"on":""}"></i>`).join("")}</span><small>ขั้น ${t.r}/3</small></div>
      <p class="skc-d">${sel.desc}</p>${ftxt}
      <p class="skc-s">${t.st==="can"?`<span class="ok">อัปได้ · กด + ที่แถบสกิล</span>`:t.st==="max"?'<span class="goldt">อัปเต็มแล้ว</span>':t.st==="nosp"?'<span class="dim">ไม่มีแต้มสกิล · รอเลเวลอัป</span>':t.st==="has"?"":t.B?`<span class="no">ยังอัปไม่ได้: ${why(t)}</span>`:""}</p>
      ${mine&&t.r&&!sel.passive?`<div class="skdet-b"><button class="btn eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${sel.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"ถอดออกจากช่องขึ้นชก":"ใส่ขึ้นชก"}</button></div>`:""}</div></div>`;}
  const sig=SIGNATURE[f.id]?`<div class="skc sig ${hasSignature(f)?"has":"lock"}"><div class="skc-m"><div class="skc-h"><b>✦ ท่าไม้ตาย: ${SIGNATURE[f.id].name}</b></div><p class="skc-d">${SIGNATURE[f.id].desc}${hasSignature(f)?"":` · ปลดเมื่อความสนิทถึง 60 (ตอนนี้ ${Math.round(f.bond||0)})`}</p></div></div>`:"";
  return `<div class="sktree">${L.map(node).join("")}${split}</div>${sig}`;}
/* v1.87: innate traits — two per girl, pick one */
function traitHTML(f,mine){const L=TRAITS[f.id];if(!L)return "";const cur=traitOf(f),T=L.find(t=>t.id===cur);
  const extra=cur==="grit"&&f.grit?` <span class="goldt">· สะสมแล้ว +${Math.round(f.grit*100)}%</span>`:"";
  return `<div class="trbox"><div class="trh"><b>พลังแฝง</b>${mine?`<div class="seg trseg" role="group" aria-label="เลือกพลังแฝง">${L.map(t=>`<button data-act="trait" data-id="${f.id}" data-v="${t.id}" aria-pressed="${cur===t.id}">${TRAIT_PX[t.id]||""}<span>${t.name}</span></button>`).join("")}</div>`:`<span class="trone">${TRAIT_PX[T.id]||""}${T.name}</span>`}</div>
   <div class="trdesc">${L.map(t=>`<p class="${t.id===cur?"on":""}" ${t.id===cur?"":`aria-hidden="true"`}>${t.desc}${t.id===cur?extra:""}</p>`).join("")}</div></div>`;}
function skResetBtn(f){const n=skPointsSpent(f);if(!n)return "";const c=skResetCost(f);
  return `<button class="btn sm skrbtn" data-act="skresetask" data-id="${f.id}" ${c&&G.cash<c?"disabled":""} aria-label="รีเซ็ตสกิล คืน ${n} แต้ม" title="รีเซ็ตสกิล · คืน ${n} แต้ม · ${c?fmt(c):"ครั้งแรกฟรี"}">↺ รีเซ็ต</button>`;}
function skResetRow(f){const n=skPointsSpent(f);if(!n)return "";const c=skResetCost(f);
  return `<div class="skreset"><span><b>รีเซ็ตสกิลทั้งหมด</b><small>คืน ${n} แต้ม แล้วเลือกสายใหม่ได้ · ${c?`ค่าใช้จ่าย ${fmt(c)}`:"ครั้งแรกฟรี"}</small></span><button class="btn sm" data-act="skresetask" data-id="${f.id}" ${c&&G.cash<c?"disabled":""}>รีเซ็ต</button></div>`;}
function skillGrid(f,mine){if(hasTree(f.id))return skillTree(f,mine);const L=SKILLS[f.id]||[];const sc=SCHOOLS[L[0]&&L[0].school]||{name:"",motto:""};
  // v1.23: compact — unlocked moves as short rows (tap the name for details), locked ones folded away
  const op=L.filter(s=>(s.lv||1)<=f.lvl),lk=L.filter(s=>(s.lv||1)>f.lvl),eqd=equipped(f);
  const row=s=>{const r=f.skills[s.id]||0,eq=eqd.includes(s.id),k=skillKind(s),o=UI.skOpen===f.id+s.id;
    return `<div class="skrow ${r?"has":""} ${eq?"eq":""}"><button class="skn" data-act="skdesc" data-v="${f.id+s.id}" aria-expanded="${o}">${PIX["sk_"+k.k]}<b>${s.name}</b><span class="pips">${[1,2,3].map(i=>`<i class="${i<=r?"on":""}"></i>`).join("")}</span></button>
     ${mine?`<span class="skb">${r?`<button class="btn sm eqbtn ${eq?"on":""}" data-act="equip" data-id="${f.id}" data-v="${s.id}" ${!eq&&eqd.length>=MAX_EQUIP?"disabled":""}>${eq?"ใช้อยู่":"ใช้"}</button>`:""}<button class="plus" data-act="learn" data-id="${f.id}" data-v="${s.id}" ${f.sp<1||r>=3?"disabled":""} aria-label="อัป ${s.name}">${r>=3?"MAX":"+"}</button></span>`:""}
     ${o?`<small class="skd">${s.desc}</small>`:""}</div>`;};
  return `<div class="school sm" style="--c:${sc.color}"><b>${sc.name}</b>${mine?`<span class="pill ${f.sp>0?"gold":""}">แต้มสกิล ${f.sp}</span><span class="pill">ใช้ขึ้นชก ${eqd.length}/${MAX_EQUIP}</span>${skResetBtn(f)}`:""}</div>
   <div class="sklist">${op.map(row).join("")||`<p class="meta">ยังไม่มีท่าที่ปลดล็อก</p>`}</div>
   ${lk.length?`<details class="sklock"><summary>ท่าที่ยังล็อก ${lk.length} ท่า · ถัดไป Lv.${lk[0].lv}</summary>${lk.map(s=>`<div class="sklk"><span>Lv.${s.lv}</span><b>${s.name}</b><small>${s.desc}</small></div>`).join("")}</details>`:""}`;}
// v1.41: visible relationship stages — each one changes how she treats you
const REL_TIERS=[[0,"คนรู้จัก","ยังเรียกคุณว่าผู้จัดการแบบเกร็ง ๆ"],[20,"เพื่อนร่วมค่าย","เริ่มคุยเล่น ทักแชตเรื่องทั่วไป"],[40,"คนสนิท","บางทีก็หลุดเรียกชื่อคุณ · มีเรื่องส่วนตัวมาเล่า"],[75,"คนพิเศษ","เรียกชื่อคุณตลอด"]];
const relTier=b=>{let i=0;REL_TIERS.forEach((t,k)=>{if((b||0)>=t[0])i=k;});return i;};
function relTierCheck(){if(!G)return;G.relT=G.relT||{};for(const f of Object.values(G.F)){if(!(f.camp==="player"||f.met))continue;const t=relTier(f.bond),o=G.relT[f.id];if(o===undefined){G.relT[f.id]=t;continue;}
  if(t>o){G.relT[f.id]=t;UI.relUp=UI.relUp||[];UI.relUp.push(`${f.name} · ${REL_TIERS[t][1]} — ${REL_TIERS[t][2]}`);}}}
function relHTML(f){const P=PROFILES[f.id],b=f.bond;
  const L=(ok,need,v)=>ok?esc(v):`<span class="lock">🔒 ♥ Lv.${1+Math.floor(Math.min(100,need)/10)}</span>`;
  const chips=(arr,pre,all)=>arr.map((x,i)=>f.know[pre+i]||b>=all?`<span class="tchip">${esc(x)}</span>`:`<span class="tchip lock">???</span>`).join("");
  const gifts=Object.entries(f.know).filter(([k])=>k.startsWith("gift_")).map(([k,v])=>`<span class="tchip ${v}">${GIFTS[k.slice(5)].name}${v==="love"?" ♥♥":v==="like"?" ♥":v==="dislike"?" ✕":""}</span>`).join("");
  const looks=[["fight","ชุดชก"],["train","ชุดซ้อม"],["casual","ลำลอง"],...(typeof loyThaiLook==="function"&&loyThaiLook(G)&&THAI_IDS.includes(f.id)?[["thai","ชุดไทย"]]:[])];
  return `<div class="pf2"><div class="pf-art"><img src="${UI.look==="train"?`${ASSET}${f.id}_train.webp`:stand(f.id,UI.look,"happy")}" alt=""><div class="seg sm">${looks.map(([k,t])=>`<button data-act="plook" data-v="${k}" aria-pressed="${UI.look===k}">${t}</button>`).join("")}</div></div>
   <div class="pf-side">${hearts(b,f)}${typeof missGap==="function"&&missGap(G,f.id)>=3?`<div class="missb">💭 คิดถึง · ไม่ได้เจอกัน ${missGap(G,f.id)} สัปดาห์${!(f.bondX>0)&&f.bond>(REL_FLOOR[(G.relT||{})[f.id]||0]||0)?" · ความสนิทเริ่มจางลง":""}</div>`:""}${relLadderHTML(f)}<div class="bars">${(()=>{const H=heartLv(f);return bar("สนิท",H.max||heartCapped(G,f)?100:H.into/H.need*100,H.max||heartCapped(G,f)?"var(--gold)":"var(--red)",`${Math.round(H.total)}`);})()}${bar("เชื่อใจ",f.trust,"var(--gold)")}</div>${f.camp==="player"?`<p class="meta trustx">${trustText(f)}</p>`:""}
    <div class="info"><div><span>ส่วนสูง</span><b>${P.height}</b></div><div><span>กรุ๊ปเลือด</span><b>${L(b>=UNLOCK.blood||f.know.blood,UNLOCK.blood,P.blood)}</b></div>
     <div><span>วันเกิด</span><b>${L(b>=UNLOCK.bday||f.know.bday,UNLOCK.bday,P.bday)}</b></div><div><span>สายมวย</span><b>${esc(P.heritage)}</b></div></div></div></div>
   <div class="pf-sec"><h4>นิสัย</h4><p>${L(b>=UNLOCK.personality,UNLOCK.personality,P.personality)}</p></div>
   <div class="pf-two"><div class="pf-sec"><h4>ชอบ</h4><div class="tchips">${chips(P.likes,"like",UNLOCK.likesAll)}</div></div><div class="pf-sec"><h4>ไม่ชอบ</h4><div class="tchips">${chips(P.dislikes,"dislike",UNLOCK.dislikesAll)}</div></div></div>
   ${(()=>{const L=Object.keys(f.know||{}).filter(k=>k.startsWith("gift_")&&GIFTS[k.slice(5)]);return L.length?`<div class="pf-sec"><h4>ของขวัญที่เคยให้</h4><div class="tchips">${L.map(k=>{const t=f.know[k];return `<span class="tchip gk-${t}">${t==="love"?"♥♥":t==="like"?"♥":t==="dislike"?"✕":"·"} ${esc(GIFTS[k.slice(5)].name)}</span>`;}).join("")}</div></div>`:"";})()}
   ${gifts?`<div class="pf-sec"><h4>ของขวัญที่รู้แล้ว</h4><div class="tchips">${gifts}</div></div>`:""}
   <div class="pf-two"><div class="pf-sec"><h4>บ้านเกิด</h4><p>${esc(P.home)}</p></div><div class="pf-sec"><h4>งานอดิเรก</h4><p>${L(b>=UNLOCK.hobby||f.know.hobby,UNLOCK.hobby,P.hobby)}</p></div></div>
   <details class="pf-sec"><summary>เรื่องราว & ความลับ</summary><h4>เรื่องราว</h4><p>${L(b>=UNLOCK.story,UNLOCK.story,P.story)}</p><h4>ความลับ</h4><p>${L(b>=UNLOCK.secret,UNLOCK.secret,P.secret)}</p></details>`;}
/* v1.89.11: the relationship ladder — the same label as under the hearts, the current step lit */
function relLadderHTML(f){const H=heartLv(f).lv,cur=relLabel(G,f,H),k=relKind(G,f),away=isAway(G,f.id),T=k==="lover"?LOVER_TIERS:HEART_TIERS,tierNow=heartTier(H,k==="lover"||k==="promise"||k==="ex"?f.id:undefined);
  const lit=T.reduce((a,[lv],i)=>H>=lv?i:a,0),key=k==="friend"?"เพื่อนสนิท":tierNow;
  return `<div class="reltier rlad"><b class="${relIsStatus(G,f)?"hstat":""}">${esc(cur)}</b><small>${esc(away?"กลับมาแล้วป้ายจะเปลี่ยนกลับเอง":REL_DESC[key]||"")}</small>
   <ol class="rsteps">${T.map(([lv,n],i)=>`<li class="${i===lit&&k!=="friend"&&k!=="ex"?"on":H>=lv?"done":""}"><i>Lv.${lv}</i>${esc(n)}</li>`).join("")}</ol>
   ${(()=>{const T=typeof loveTitle==="function"?loveTitle(G,f):null;return T?`<div class="ltitle"><b>✦ ${esc(T.t)}</b><small>${esc(T.d)}</small></div>`:"";})()}
   <p class="meta rcap">บทนี้หัวใจสูงสุด Lv.${heartCapLv(G)}${HEART_NEXT[heartCapLv(G)]?` · ${HEART_NEXT[heartCapLv(G)]}`:""}</p>
   <div class="rbranch"><small>ตอนสารภาพรัก (สนิท 75 + เชื่อใจ 40)</small><div>${REL_BRANCH.map(([kk,n])=>`<span class="${kk===k?"on":""}">${esc(n)}</span>`).join("")}</div></div></div>`;}
function giftHTML(id){const f=G.F[id];
  const E=giftsFor(id).map(k=>[k,{...GIFTS[k],bond:giftBond(id,k)}]).sort((x,y)=>(x[1].bond||0)-(y[1].bond||0)||(x[1].only?1:0)-(y[1].only?1:0));
  {const lk=E.filter(([k,g])=>(g.bond||0)>(f.bond||0));const nx=lk[0];const hid=lk.length-(nx?1:0);E.splice(0,E.length,...E.filter(([k,g])=>(g.bond||0)<=(f.bond||0)),...(nx?[nx]:[]));E.hidden=hid;}
  return `<h2>ของขวัญให้${esc(f.name)}</h2><p class="meta">ซื้อแล้วให้ทันที · คนละ 1 ชิ้นต่อสัปดาห์ · ยิ่งสนิทยิ่งมีของให้เลือก${E.hidden?` (ยังซ่อนอีก ${E.hidden} ชิ้น)`:""} · เงินสด ${fmt(G.cash)}</p>${souvHTML(id)}<div class="gifts">${E.map(([k,g])=>{const kn=f.know["gift_"+k],lk=(g.bond||0)>(f.bond||0);
   if(lk)return `<div class="giftbtn lockg"><b>???</b><small>ปลดล็อกเมื่อ ♥ Lv.${1+Math.floor(Math.min(100,g.bond)/10)}</small></div>`;
   const lw=f.giftL&&f.giftL[k],cd=lw&&gameWeek(G)-lw<6&&(f.giftN||{})[k]?6-(gameWeek(G)-lw):0;
   return `<button class="giftbtn" data-act="give" data-id="${id}" data-v="${k}" ${G.cash<g.price?"disabled":""}><b>${g.name}</b><small>${fmt(g.price)}${cd?` · เพิ่งให้ไป`:""}</small></button>`;}).join("")}</div>
   <p class="meta glegend">สังเกตท่าทีตอนให้ หรือดูในประวัติว่าเคยให้อะไรไปแล้วบ้าง</p>`;}
/* v1.89.23: souvenirs bought on regional trips — free to give, one gift a week like the rest */
function souvHTML(id){const S=G.souv||{},L=SOUV_IDS.filter(k=>S[k]>0);if(!L.length)return "";
  return `<h3 class="souvh">ของฝากที่ซื้อมาจากทริป</h3><div class="gifts souvg">${L.map(k=>`<button class="giftbtn souv" data-act="give" data-id="${id}" data-v="${k}"><b>${esc(GIFTS[k].name)}</b><small>ของฝาก${SOUV_RN[GIFTS[k].souv]} · มี ${S[k]} ชิ้น</small></button>`).join("")}</div>`;}
function considerHTML(o){const me=G.F[o.a],op=G.F[o.b];const A=adviseCached(o.a,o.b,o.rounds||3);const pct=x=>Math.round(x*100);const v=verdictOf(A.bestRate);const sc=scouted(op.id);const P=personaOf(op);
  return `<h2>ข้อมูลไฟต์</h2><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b>${hotBadge(me,1)}<span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b>${hotBadge(op,1)}<span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
   ${P?`<p class="quote">“${esc(P.line)}” <span class="meta">— ${esc(P.tag)}</span></p>`:""}${h2hText(op)?`<p class="meta goldt">${h2hText(op)}</p>`:""}
   ${intelHTML(op)}
   ${sc?`<div class="planbars">${Object.entries(A.rates).sort((a,b)=>b[1]-a[1]).map(([k,x])=>`<div class="bar"><span>${PLANS[k].name}</span><i style="--v:${pct(x)}%;--bc:${k===A.best?"var(--gold)":"var(--blue)"}"></i><b class="num">${pct(x)}%</b></div>`).join("")}</div>`:`<p class="meta">ดูเทปเพื่อเห็นแผนที่ได้เปรียบ</p>`}
   <p class="meta">สัปดาห์ ${o.week} · ${TIER[o.tier].name} · ค่าตัว ${fmt(o.lose)} · ชนะได้เพิ่ม ${fmt(o.win-o.lose)}</p>
   <div class="mfoot"><button class="btn primary" data-act="closeModal">ปิด</button></div>`;}
function actNear(a){let s=0;if(a.rep)s+=Math.max(0,a.rep-G.rep)*2;if(a.week)s+=Math.max(0,a.week-G.week);if(a.fac)s+=20;if(a.lv)s+=15;return s;}
function campActsHTML(){const pk=UI.modal.pick;if(pk){const a=CAMP_ACTIONS[pk];return `<h2>ยืนยันกิจกรรม?</h2><div class="px confirm"><b>${a.name}</b><p class="meta">${a.desc}${a.cost?` · ค่าใช้จ่าย ${fmt(a.cost)}`:""}</p><p class="meta">ทำได้สัปดาห์ละ 1 อย่าง</p>${a.mg?`<p class="meta">เล่นมินิเกมเองได้ผลตามฝีมือ · หรือข้ามแล้วรับผลกลาง ๆ: ${a.skip}</p>`:""}</div><div class="mfoot"><button class="btn ghost" data-act="campback">ย้อนกลับ</button>${a.mg?`<button class="btn" data-act="campok">ข้าม (ผลกลาง ๆ)</button><button class="btn primary" data-act="campmg">${JOY_PX}เล่นเอง</button>`:`<button class="btn primary" data-act="campok">ยืนยัน</button>`}</div>`;}
  // v1.23: locked activities stay hidden except the next one to open, so the list stays short
  const all=Object.entries(CAMP_ACTIONS).filter(([k,a])=>!a.hidden&&!(a.yt&&!ytIn(G,a.yt))),open=all.filter(([k,a])=>!campActLocked(G,a)),lockd=all.filter(([k,a])=>campActLocked(G,a));
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
/* v1.90.7: the money tab says where the weekly costs come from (players could not tell what "camp upkeep" was) */
function upkeepParts(G){const t=facTotal(G),lv=campLevel(G),pf=petFood(G),P=[["ค่าดูแลค่ายพื้นฐาน",1800],[`อัปเกรดค่ายรวม ${t} ระดับ × ฿220`,t*220]];
  if(lv>1)P.push([`ค่ายใหญ่ขึ้น (ค่าย Lv.${lv})`,[0,0,800,1800][lv]]);if(pf)P.push([`อาหารสัตว์เลี้ยง (${(G.pets||[]).length} ตัว)`,pf]);return P;}
function wageParts(G){const P=roster(G).map(f=>[`${f.name} (Lv.${f.lvl||1})`,wageOf(f)]).filter(x=>x[1]>0);
  if(G.staff)G.staff.forEach(k=>STAFF[k]&&P.push([`${STAFF[k].name} · ${STAFF[k].role}`,STAFF[k].wage]));else if(G.fac.assistants)P.push([`ผู้ช่วยครู ${G.fac.assistants} คน`,G.fac.assistants*2500]);return P;}
const kvDetails=(label,total,parts)=>`<details class="kvd"><summary class="kv-row"><span>${label} <small class="meta">(แตะดูรายละเอียด)</small></span><b class="num neg">-${fmt(total)}</b></summary><div class="kv-sub">${parts.map(([n,v])=>`<div><span>${esc(n)}</span><span class="num">-${fmt(v)}</span></div>`).join("")}</div></details>`;
function incNote(G){const L=[];if(ytKey(G)==="tourist")L.push("ธีมปีนี้นักท่องเที่ยวเยอะ รายได้นักเรียน ×1.2");if(G.disaster&&gameWeek(G)<G.disaster.untilAbs)L.push(`${G.disaster.name} รายได้นักเรียนเหลือ ${Math.round((G.disaster.inc||0)*100)}% (อีก ${G.disaster.untilAbs-gameWeek(G)} สัปดาห์)`);
  return L.length?`<div class="kv-sub">${L.map(t=>`<div><span>${esc(t)}</span></div>`).join("")}</div>`:"";}
function reportHTML(){const r=G.lastReport;const ann=[];
  for(const d of ["A","B"])for(const [id,pos] of Object.entries(r.rank[d]||{})){const f=G.F[id];if(!f||(f.camp!=="player"&&f.camp!=="rival"))continue;
    const m=(r.move&&r.move[d]&&r.move[d][id])||0;ann.push({f,pos,m,d});}
  ann.sort((a,b)=>(b.f.camp==="player")-(a.f.camp==="player"));
  const cut=r.stage==="local"?4:r.stage==="district"?4:0;
  const tu=(r.tierUp||[]).filter(x=>G.F[x.id]),hu=(r.heartUp||[]).filter(x=>G.F[x.id]);
  return `<h2>สรุปสัปดาห์ที่ ${r.week}</h2><p class="goal">${goalText()}</p>
   ${hu.length?`<div class="heartup">${hu.map(x=>`<div class="hu">${faceImg(G.F[x.id],"sm")}<span>ความสนิทกับ <b>${esc(G.F[x.id].name)}</b> ขึ้นเป็น <b class="hlvn">♥ Lv.${x.lv}</b><small class="meta">${relLabel(G,G.F[x.id],x.lv,true)}</small></span></div>`).join("")}</div>`:""}
   ${tu.length?`<div class="tierup">${tu.map(x=>{const f=G.F[x.id],a=TIER_BY[x.from],b=TIER_BY[x.to],up=b.i>a.i;return `<div class="tu ${up?"up":"down"}">${faceImg(f,"sm")}<span><b>${esc(f.name)}</b> ${up?"เลื่อนขึ้นเป็น":"ตกลงเป็น"} <b>${b.ic} ${b.n}</b><small class="meta">จาก ${a.ic} ${a.n}</small></span></div>`;}).join("")}</div>`:""}
   ${ann.length&&cut?`<div class="announce"><div class="ann-h">ประกาศอันดับ · ${STAGE_NAME[r.stage]}</div>${ann.map(a=>`<div class="ann ${a.f.camp==="player"?"me":""}">${faceImg(a.f,"sm")}<b>${esc(a.f.name)}</b><span class="meta">รุ่น ${a.d}</span><span class="rk">อันดับ ${a.pos}</span>${moveIcon(a.m)}${cut?`<span class="pill ${a.pos<=cut?"green":"red"}">${a.pos<=cut?"อยู่ในโซนเข้ารอบ":"นอกโซน"}</span>`:""}</div>`).join("")}</div>`:""}
   ${r.prog?`<details class="prog"><summary class="ann-h">กราฟพัฒนาการ 4 สัปดาห์ (แตะเพื่อดู)</summary><div class="progrow">${r.prog.filter(p=>G.F[p.id]).map(p=>{const f=G.F[p.id];const sum=Object.keys(p.before).reduce((s,k)=>s+(f.a[k]-p.before[k]),0);
     return `<div class="pcell">${radarSVG(f,150,p.before)}<b>${esc(f.name)}</b><span class="meta">ค่ารวม ${sum>=0?"+":""}${sum.toFixed(1)}</span></div>`;}).join("")}</div></details>`:""}
   <div class="chips3"><span class="chip"><small>นักเรียน</small><b class="num pos">+${fmt(r.inc)}</b></span><span class="chip"><small>ค่าใช้จ่าย</small><b class="num neg">-${fmt(r.up+r.wg+(r.debtPay||0))}</b></span><span class="chip"><small>เงินสด</small><b class="num ${r.cash<0?"neg":""}">${fmt(r.cash)}</b></span></div>
   <details><summary>ผลการชกในวงการ (${r.log.length})</summary><div class="log">${r.log.map(l=>`<div>${esc(l)}</div>`).join("")||"<div>เงียบสงบ</div>"}</div></details>`;}
// v1.81.1: "what's new" popup — shows once per save after loading, for players who started before this update
/* v1.87: gacha machine popup */
const GB_RATES={n:[["SSR",3],["SR",27],["N",70]],loy:[["SSR",4],["SR",23],["R",38],["N",35]]};
function gbPreload(){if(GB.pre&&GB.pre[GB.box])return;GB.pre=GB.pre||{};GB.pre[GB.box]=1;const L=Object.keys(CARDS).filter(k=>CARDS[k].r==="SSR"&&(GB.box==="loy"?CARDS[k].lg:CARDS[k].g));
  L.forEach(k=>{const C=CARDS[k];const srcs=/team/.test(k)?["mali","rin","kati","ploy","fah"].map(c=>`${ASSET}${c}_${C.lg?"thai":"casual"}.webp`):[`${ASSET}${C.ci||C.c+"_casual"}.webp`];srcs.forEach(u=>{const im=new Image();im.src=u;});});}
function gbCost(){return GB.box==="loy"?LG_COST:GACHA_COST;}
function gbPityLeft(){return GB.box==="loy"?Math.max(1,LG_PITY-(G.lgPity||0)):Math.max(1,GACHA_PITY-(G.pity||0));}
function gbCutHTML(s){const C=CARDS[s.id];const team=/team/.test(s.id)?["mali","rin","kati","ploy","fah"]:null;
  const ims=team?team.map(c=>`${ASSET}${c}_${C.lg?"thai":"casual"}.webp`):[`${ASSET}${C.ci||C.c+"_casual"}.webp`];const n=ims.length;
  return `<div class="gbglow"></div><div class="gbrays"></div><div class="gbteam">${ims.map((src,i)=>{const off=i-(n-1)/2,h=n>1?74-Math.abs(off)*6:92;
    return `<div class="m" style="left:${50+off*21}%;z-index:${10-Math.abs(off)}"><img src="${src}" alt="" style="height:${h}%;animation-delay:${.12*Math.abs(off)+.05}s"></div>`;}).join("")}</div>
    <div class="gbssr"><b>SSR</b><span>${esc(C.t)}</span></div>`;}
function gbRevealHTML(s){const C=CARDS[s.id],RR=CARD_R[C.r],res=s.res,o=(G.cards||{})[s.id]||{},d0=.45+RR.s*.14,who=G.F[C.c]?G.F[C.c].name:"";
  const q=(C.r==="SR"||C.r==="SSR")?(C.q||cardBlurb(C)):"";
  return `<div class="ccard big gbcard" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${Array.from({length:RR.s},(_,i)=>`<i style="animation-delay:${.45+i*.14}s">★</i>`).join("")}</span><b>${esc(C.t)}</b><small>${C.r} · ${esc(who)}</small></div>
    <span class="gbtag ${res.isNew?"new":"dup"}" style="animation-delay:${d0}s">${res.isNew?"การ์ดใหม่!":res.canUp?"ได้ใบซ้ำ! อัปขั้นได้แล้ว":"ได้ใบซ้ำ! เก็บไว้ย่อยเป็นเศษดาว"}</span>
    ${q?`<p class="gbq" style="animation-delay:${d0+.25}s">“${esc(q)}” <em>— ${esc(who)}</em></p>`:""}
    <div class="gbacts" style="animation-delay:${d0+.4}s">${res.isNew?`<button class="btn" data-act="cardplay" data-v="${s.id}">ดูเรื่องราว</button>`:`<button class="btn" data-act="cardinfo" data-v="${s.id}">${res.canUp?"⬆ ไปอัปขั้น":"หน้าการ์ด"}</button>`}<button class="btn gold" data-act="gok">ตกลง</button></div>`;}
function gboxHTML(){const loy=GB.box==="loy",s=GB.st,cost=gbCost(),ok=(G.dust||0)>=cost;
  const rates=GB_RATES[GB.box].map(([r,p])=>`<span class="rr" style="color:${CARD_R[r].c}">${r}</span><span class="bar" style="color:${CARD_R[r].c}"><i style="width:${p}%"></i></span><span class="pc">${p}%</span>`).join("");
  const pity=loy?LG_PITY:GACHA_PITY,left=gbPityLeft();
  return `<div class="gbhead"><h2>${loy?"ตู้ลอยกระทง":"ตู้กาชาค่ายศิริชัย"}</h2><span class="gbdust">✦ ${G.dust||0}</span><button class="gbq-btn" data-act="gboxq" aria-label="อัตราออกและการันตี">?</button></div>
  <div class="gbstage ${loy?"loy":""}" data-act="gskip">
   <canvas width="180" height="240" data-gbox="1"></canvas>
   ${s?"":`<button class="gbhit" data-act="gpull" aria-label="หมุนตู้ ใช้ ${cost} เศษดาว"></button>`}
   <div class="gbcut ${s&&s.fired.cut&&!s.shown?"on":""}">${s&&s.fired.cut&&!s.shown?gbCutHTML(s):""}</div>
   <div class="gbrev ${s&&s.shown?"on still":""}">${s&&s.shown?gbRevealHTML(s):""}</div>
   <div class="gbflash"></div>
   <div class="gbhint ${s||ok?"blink":""}" ${s&&s.shown?'style="display:none"':""}>${s?"แตะเพื่อข้าม":ok?`แตะตู้เพื่อหมุน · ${cost}✦`:`เศษดาวไม่พอ · ต้องใช้ ${cost}✦`}</div>
   ${UI.gq?`<div class="gbsheet"><div class="gbsbox"><h3>อัตราออกการ์ด</h3><div class="gbrt">${rates}</div>
     <div class="gbpity">การันตี SSR ทุก ${pity} ครั้ง · ได้ใบที่ยังไม่มี<br>อีก <b>${left}</b> ครั้ง ได้ SSR แน่นอน<div class="gbmeter"><i style="width:${Math.min(100,(pity-left)/pity*100)}%"></i></div></div>
     <p>${loy?"ตู้นี้เปิดเฉพาะช่วงเทศกาลลอยกระทง ":""}ได้การ์ดที่มีแล้วจะเก็บเป็นใบซ้ำ ใช้อัปขั้นการ์ด หรือย่อยเป็นเศษดาวได้ที่หน้าการ์ด</p>
     <button class="btn" data-act="gboxq">ปิด</button></div></div>`:""}
  </div>`;}
const PATCH={id:"1.90.0",ver:"Muay Thai Moe v1.90",title:"คืนลอยกระทงที่ค่ายศิริชัย",lead:"ศึกริมน้ำคืนลอยกระทง แก๊งหมวกโฉมใหม่ ชุดไทยใส่ได้จริง ไหว้ครูประจำปี และรวมทุกอย่างที่อัปเดตเงียบ ๆ ตั้งแต่ v1.88 ค่ะ",items:[
 ["🏮","ศึกริมน้ำคืนลอยกระทง","ใส่โค้ด LOYKRATHONG69 ในหน้าตั้งค่า (ใส่ได้ตลอด) ส่งสาว 3 คนชกแก๊งหมวก 9 ไฟต์ไม่มีพัก ฉากจบ 3 แบบตามคะแนน (ทองแดง 400 · เงิน 800 · ทอง 1,200 + ล้มเสี่ย) ทุกคนชกในชุดลอยกระทงพิกเซล มีบทระหว่างไฟต์ และพลอยกับฟ้ามาเป็นแขกรับเชิญได้ ไฟต์ในศึกนี้ไม่บาดเจ็บ ไม่นับสถิติ"],
 ["👘","ชุดไทยใส่ได้จริง","สาวคนไหนชนะในศึกริมน้ำได้ ป้าแต๋วจะส่งชุดไทยของเธอมาทางจดหมาย กดรับแล้วเลือกใส่ได้ที่ตู้เสื้อผ้า ใส่ในค่าย ตอนซ้อม และบนเวทีจริง (เป็นแค่หน้าตา ไม่มีผลกับค่าพลัง)"],
 ["🪷","ลอยกระทงกับ 5 สาว","หลังดูฉากจบ ห้าสาวลอยกระทงที่ท่าน้ำ ผู้จัดการอธิษฐานได้ 4 แบบ แต่ละคนตอบไม่เหมือนกัน แล้วเช้าวันรุ่งขึ้น… ลองดูตู้จดหมาย"],
 ["🦝","ไอ้ตุ่ม โจรงมกระทง","มาทางจดหมายป้าแต๋ว 2 ช่วง: ทุกสัปดาห์ 4 สัปดาห์แรกหลังเริ่มศึกริมน้ำ · ช่วงลอยกระทงในเกม (สัปดาห์ 24–27 ทุกปี) จับได้ได้ EXP กับเศษดาว ยิ่งค่ายเก่ง ไอ้ตุ่มก็เก่งตาม ส่วนลูกนากจากงานลอยกระทงช่วยลดความล้าตอนเล่นด้วย"],
 ["🎭","ไอ้ตุ๋ย หน้ากากแดง","น้องชายไอ้ตุ่ม มาทางจดหมายป้าแต๋ววันละครั้งเฉพาะ 20–23 พ.ย. 2569 (วันจริง) ไฟต์ 3 ยก เก่งกว่าไอ้ตุ่ม ได้ EXP กับเศษดาวมากกว่า ชนะได้เงินค่าน้ำร้อนน้ำชาจากชาวบ้านด้วย แพ้ก็ได้เศษดาวปลอบใจ ถ้าช่วงไหนไอ้ตุ่มมาด้วยก็จับได้ทั้งสองตัว"],
 ["🪖","แก๊งหมวกโฉมใหม่","หัวหน้าหมวกเงินมีสไปร์ตของตัวเอง มือขวาหมวกทองดำโผล่ตั้งแต่ปี 2 ทุกหมวกมีภาพในฉาก และชนะแก๊งครบ 3 ครั้งจะมีจดหมายท้าให้ไปชกที่โกดังของมัน ชนะได้ค่าเหนื่อย"],
 ["🙏","ไหว้ครูประจำปี","สัปดาห์ 37 (วันมวยไทย) ทุกปี เลือกชุดเครื่องไหว้ ทั้งค่ายคุกเข่ากราบครูสามครั้ง ครูแดงสวมมงคล คนใหม่ได้ครอบครู ได้กำลังใจและพรครูลดการบาดเจ็บช่วงหนึ่ง"],
 ["🥁","เวทีคึกขึ้น","ดนตรีปี่กลองเร่งตามยก ยกตัดสินเร็วสุด มีบทพากย์ใหม่กว่า 115 บรรทัด และสกิลที่ตรงกับแม่ไม้มวยไทยใช้ชื่อแม่ไม้จริง โฆษกเรียกชื่อท่าตอนออก"],
 ["🌳","สกิลแตกราก","ทุกสายสกิลแตกเป็น 2 รากหลัง Lv.22 (สายสำนัก) และ Lv.10 (สายปั้น) รากละ 5 ขั้น ติดตัวบางตัวหนุนสายอื่น ดูเป็นแผนผังได้ในแท็บสกิล"],
 ["💞","ความสัมพันธ์บันไดเดียว","ชื่อระดับเหมือนกันทุกที่ คนรู้จัก → เพื่อนร่วมค่าย → คนสนิท → คนพิเศษ ไปถึง ♥30 คบกันแล้วมีบันไดคนรักแยก รวมถึงวาเลนไทน์ การคบซ้อน เลิกกัน และเส้นทางฮาเร็ม แก้บั๊กความสนิท +0 หลัง ♥10 แล้ว"],
 ["🏃","กีฬาสีอำเภอ","ทุกปีตั้งแต่สัปดาห์ 24 แข่งวิ่ง 100 เมตร ชักเย่อ และวิ่งผลัดกับสีอื่น ๆ ในอำเภอ"],
 ["🐯","ใบหยกกับเพชรา","สองเด็กพยัคฆ์ทองมีภาพใหม่ ใบหยกออกจากค่ายพยัคฆ์ทองแล้วชกในชุดขาว แวะกลับมาเรื่อย ๆ คู่แข่งในเนื้อเรื่องจะเช็กค่ายเราต้นปี กลางปี และปลายปี"],
 ["📜","วางแผนก่อนไฟต์จดหมาย","ไฟต์ชิงเข็มขัด คำท้า แก๊งหมวก และงานแปลก ๆ จากจดหมาย เปิดหน้าแผนชกได้ก่อนระฆังแล้ว"],
 ["🖼️","ฉากใหม่เกือบ 60 ฉาก","ฉากเนื้อเรื่องใหม่ 49 ภาพ ตลาดเช้า โกดังแก๊ง เวทีริมน้ำกลางคืน และท่าน้ำยามเช้า"],
 ["📱","เล่นเต็มจอ","เปิดโหมดเต็มจอได้ในตั้งค่า (Android/คอม) หรือกด 'เพิ่มไปยังหน้าจอโฮม' ให้เกมเปิดแบบแอป"],
 ["🛠️","แก้ไขอื่น ๆ","มุมพักยกกลับเป็นเรียงลำดับแบบเดิม แท็บสกิลบนมือถือเลื่อนได้ทั้งหน้า พื้นหลังฉากไม่ลูปซ้อนบนจอสูง รูปอีเวนต์โหลดล่วงหน้าให้ขึ้นเร็วขึ้น อารมณ์ตัวละครไม่เปลี่ยนเองตอนมีตัวเลือก"]],
 foot:"ขอให้กระทงของทุกคนลอยไปถึงที่ที่อยากให้ไปนะคะ ✦"};
function maybeWhatsNew(){if(!G||G.ended||UI.scene)return;if(G.newsSeen===PATCH.id)return;UI.modal={type:"whatsnew"};}
function whatsNewHTML(){return `<div class="wnew"><span class="pill gold">อัปเดต · ${esc(PATCH.ver)}</span><h2>🥊 ${esc(PATCH.title)}</h2><p class="lead">${esc(PATCH.lead)}</p>
  <div class="wnlist">${PATCH.items.map(([ic,t,b])=>`<details class="wnitem"><summary><span class="wnic">${ic}</span><b>${esc(t)}</b><i>▸</i></summary><p>${esc(b)}</p></details>`).join("")}</div><p class="meta wnhint">แตะหัวข้อเพื่ออ่านรายละเอียด</p>
  <p class="meta center">${esc(PATCH.foot)}</p></div><div class="mfoot"><button class="btn primary" data-act="newsok">เข้าค่ายเลย ▸</button></div>`;}
function modalHTML(){const m=UI.modal;let body="",foot=true;
  if(m.type==="fighter"){body=fighterHTML(G.F[m.id]);foot=false;}
  if(m.type==="consider"){const o=G.offers.find(x=>x.id===m.id);if(!o){UI.modal=null;return "";}body=considerHTML(o);foot=false;}
  if(m.type==="whatsnew"){body=whatsNewHTML();foot=false;}
  if(m.type==="skresetask"){const f=G.F[m.id],n=skPointsSpent(f),c=skResetCost(f);foot=false;
    body=`<h2>รีเซ็ตสกิลของ${esc(f.name)}?</h2><p>สกิลที่อัปไว้ทั้งหมดจะหายไป และได้คืน <b class="goldt">${n} แต้ม</b> เอาไปอัปสายไหนก็ได้ใหม่ ท่าที่ใส่ขึ้นชกจะถูกถอดออก</p>
     <p class="meta">${c?`ค่าใช้จ่าย ${fmt(c)} (ครั้งถัดไป ${fmt(Math.min(3,(f.skReset||0)+1)*10000)})`:"ครั้งแรกฟรี ครั้งต่อไป ฿10,000"}</p>
     <div class="mfoot"><button class="btn ghost" data-act="skresetno">ยกเลิก</button><button class="btn primary" data-act="skresetgo">รีเซ็ตสกิล${esc(f.name)}</button></div>`;}
  if(m.type==="showcase"){body=showcaseHTML();foot=false;}
  if(m.type==="report")body=reportHTML();
  if(m.type==="repinfo")body=repInfoHTML();
  if(m.type==="otip"){const o=G.offers.find(x=>x.id===m.id);if(!o){UI.modal=null;return "";}body=offerTipHTML(o);foot=false;}
  if(m.type==="lossrev")body=lossRevHTML();
  if(m.type==="settings")body=settingsHTML();if(m.type==="gaunt"){body=gauntHTML();foot=false;}if(m.type==="thief"){body=thiefHTML();foot=false;}if(m.type==="loywish"){body=loyWishHTML();foot=false;}if(m.type==="loyrules"){body=loyRulesHTML();foot=false;}if(m.type==="loyhub"){body=loyHubHTML();}
  if(m.type==="slots")body=slotsHTML(m.mode);
  if(m.type==="campacts"){body=campActsHTML();foot=!m.pick;}
  if(m.type==="studinfo"){body=studInfoHTML();}
  if(m.type==="gift")body=giftHTML(m.id);
  if(m.type==="petname"){const p=(G.pets||[])[m.i];if(!p){UI.modal=null;return "";}body=`<h2>ตั้งชื่อ${esc(PETS[p.k].name)}</h2><div class="petnm"><img class="peti" src="${petIcon(p.k)}" alt=""><input id="petname" maxlength="12" value="${esc(p.name)}" autocomplete="off"></div><p class="meta">ชื่อนี้จะโผล่ในฉากต่าง ๆ ของค่าย</p><button class="btn primary" id="petnamebtn" data-act="petnamesave" data-v="${m.i}">ตั้งชื่อ</button>`;}
  if(m.type==="card"){body=cardInfoHTML(m.id);foot=false;}
  if(m.type==="contest"){body=contestHTML();foot=false;}
  if(m.type==="waikhru"){body=waiKhruHTML();foot=false;}
  if(m.type==="gbox"){body=gboxHTML();foot=false;}
  if(m.type==="album"){const byC={};for(const id in CARDS)(byC[CARDS[id].c]=byC[CARDS[id].c]||[]).push(id);const own=G.cards||{};
    body=`<h2>อัลบั้มการ์ด</h2><p class="meta">เก็บได้ ${Object.keys(own).filter(k=>CARDS[k]).length}/${Object.keys(CARDS).filter(k=>!CARDS[k].rg||G.region).length} ใบ · แตะการ์ดเพื่อดูรายละเอียด</p>
     <div class="gacha"><span><b class="goldt">✦ ${G.dust||0}</b> เศษดาว<small>ได้จากชนะไฟต์ การ์ดใหม่ และการ์ดซ้ำ · การันตี SSR อีก ${Math.max(1,GACHA_PITY-(G.pity||0))} ครั้ง</small></span><button class="btn sm gold" data-act="gopen" data-v="n">🎰 ตู้กาชา ${GACHA_COST}✦</button></div>${typeof loyGachaHTML==="function"?loyGachaHTML():""}
     ${[...CANON_IDS,...(G.region?CHAMP_IDS:[])].filter(c=>G.F[c]&&byC[c]&&(UI.albAll||byC[c].some(id=>own[id]))).map(c=>`<h4 class="albh">${esc(G.F[c].name)} <small>${byC[c].filter(id=>own[id]).length}/${byC[c].length}</small></h4><div class="albg">${byC[c].filter(id=>UI.albAll||own[id]).map(id=>{const C=CARDS[id],o=own[id],R=CARD_R[C.r];
       return o?`<button class="ccard pxc" data-rarity="${C.r}" style="--rc:${R.c}" data-act="cardinfo" data-v="${id}" title="${esc(C.t)}">${!o.seen?'<i class="ndot"></i>':cardFresh(id,o)?'<i class="cnew">✦ใหม่</i>':""}${o.spare?`<i class="cdup">${cardCanUp(id,o)?"⬆ ":""}×${o.spare}</i>`:""}${cardArtHTML(C,true)}<i class="rr">${C.r}${(o.lv||1)>1?`<u>${o.lv}</u>`:""}</i><span class="tstar">${"★".repeat(R.s)}</span><b>${esc(C.t)}</b></button>`
         :`<button class="ccard pxc lock" data-rarity="${C.r}" style="--rc:#77747d" data-act="cardinfo" data-v="${id}" aria-label="การ์ดที่ยังไม่ได้">${cardArtHTML(C,true)}<i class="rr">${C.r}</i><span class="tstar">${"★".repeat(R.s)}</span><b>???</b></button>`;}).join("")}</div>`).join("")}<div class="center"><button class="btn sm" data-act="albtog">${UI.albAll?"ซ่อนการ์ดที่ยังไม่ได้":"แสดงการ์ดที่ยังไม่ได้ (ดูคำใบ้)"}</button></div>`;}
  if(m.type==="cardnew"){const P=G.cardPend||[];const id=P[0];const C=CARDS[id];if(!C){G.cardPend=[];UI.modal=null;return "";}const RR=CARD_R[C.r];body=`<h2>ได้การ์ดใหม่!</h2><div class="gres" style="--rc:${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center meta">${C.hint?esc(C.hint)+" · ":""}ได้เศษดาว <b class="goldt">✦ 5</b>${P.length>1?` · ยังมีการ์ดใหม่อีก ${P.length-1} ใบ`:""}</p></div>
    <div class="mfoot roadbtns"><button class="btn primary" data-act="cardplay" data-v="${id}" data-from="new">ดูเรื่องราวเลย</button><button class="btn" data-act="cardlater">เก็บไว้ดูทีหลัง</button></div>`;foot=false;}
  if(m.type==="gacha"){const R=m.res,C=CARDS[R.id],RR=CARD_R[C.r];body=`<h2>ผลการสุ่ม</h2><div class="gres" style="--rc:${RR.c}"><div class="ccard big" data-rarity="${C.r}" style="--rc:${RR.c}">${cardArtHTML(C)}<span class="tstar">${"★".repeat(RR.s)}</span><b>${esc(C.t)}</b><small>${C.r}</small></div>
    <p class="center">${R.isNew?"<b class=\"goldt\">การ์ดใหม่!</b>":R.canUp?`<b class="goldt">ได้ใบซ้ำ!</b> อัปขั้นการ์ดได้แล้ว (ใบซ้ำ ${R.spare} ใบ)`:`การ์ดเต็มขั้นแล้ว · เก็บเป็นใบซ้ำ (มี ${R.spare} ใบ) <small class="meta">ย่อยเป็นเศษดาวได้ที่หน้าการ์ด</small>`}</p></div>
    <div class="mfoot roadbtns">${R.isNew?`<button class="btn" data-act="cardplay" data-v="${R.id}">ดูเรื่องราว</button>`:`<button class="btn" data-act="cardinfo" data-v="${R.id}">${R.canUp?"⬆ ไปอัปขั้น":"หน้าการ์ด"}</button>`}<button class="btn gold" data-act="${R.loy?"loygacha":"gacha"}" ${(G.dust||0)<(R.loy?LG_COST:GACHA_COST)||(R.loy&&!loyFest())?"disabled":""}>สุ่มอีก ${GACHA_COST}✦ (มี ${G.dust||0})</button><button class="btn primary" data-act="album">กลับอัลบั้ม</button></div>`;foot=false;}
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
  if(m.type==="campres"){foot=false;const a=CAMP_ACTIONS[m.k]||{name:m.title,cost:m.cost};const C=CFX[m.k];body=`<div class="campres ${m.skip?"skip":""}">${C?`<div class="cfxwrap" data-act="cfxskip" role="button" aria-label="ข้ามฉาก"><canvas width="320" height="180" data-campfx="${m.k}"></canvas><span class="cfxcap">${esc(m.cap||C.cap)}</span><i class="cfxbar"></i></div>`:""}
   <div class="cr-res"><h2>${esc(a.name)}</h2><p class="cr-note">${esc(m.note)}</p>${a.cost?`<p class="meta">ใช้เงิน ${fmt(a.cost)}</p>`:""}<div class="mfoot"><button class="btn primary" data-act="closeModal">เยี่ยม!</button></div></div></div>`;}
  if(m.type==="endwarn"){foot=false;body=`<h2>จบสัปดาห์เลยไหม?</h2><ul class="mlist">${m.todo.map(t=>`<li>${t}</li>`).join("")}</ul><p class="meta">ข้ามได้ ไม่มีโทษ แต่อาจเสียโอกาสในสัปดาห์นี้</p><label class="endwarn-opt"><input type="checkbox" data-act="noaskend"> ไม่ต้องถามอีก (เปิดคืนได้ในตั้งค่า)</label><div class="mfoot"><button class="btn ghost" data-act="closeModal">กลับไปทำต่อ</button><button class="btn primary" data-act="endgo">จบสัปดาห์เลย</button></div>`;}
  if(m.type==="signwarn"){const f=G.F[m.id],net=weeklyNet(G)-f.wage;foot=false;
    body=`<h2>เซ็นสัญญา${esc(f.name)}?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดงเตือน:</b> ${net<0?`ถ้าเซ็นตอนนี้ ค่ายจะติดลบ ${fmt(-net)} ทุกสัปดาห์ ต้องพึ่งค่าตัวไฟต์ ถ้าเงินติดลบ 4 สัปดาห์จนเกิน ฿10,000 ค่ายจะล้มละลาย`:`ค่าเซ็น ${fmt(f.fee)} จะทำให้เงินสดเหลือแค่ ${fmt(G.cash-f.fee)} เผื่อเงินฉุกเฉินไว้ด้วย`}</span></div>
     <div class="kv-row"><span>ค่าเซ็น</span><b class="num">${fmt(f.fee)}</b></div><div class="kv-row"><span>ค่าจ้าง</span><b class="num">${fmt(f.wage)}/สัปดาห์</b></div><div class="kv-row"><span>สุทธิต่อสัปดาห์หลังเซ็น</span><b class="num ${net<0?"neg":"pos"}">${fmt(net)}</b></div>
     <div class="mfoot"><button class="btn ghost" data-act="closeModal">รอก่อน</button><button class="btn primary" data-act="sign" data-v="${f.id}" data-ok="1">เซ็นเลย</button></div>`;}
  if(m.type==="levelup"){body=`<h2 class="lvup">LEVEL UP!</h2>${m.ids.map(id=>{const f=G.F[id];return `<div class="lvrow"><div class="l">${faceImg(f,"sm")}<b>${esc(f.name)} Lv.${f.lvl}</b></div>${coachOn()&&f.sp>0&&!hasTree(f.id)?`<p class="hinttxt"><img src="${faceSrc("coach")}" alt=""><span>${skillTip(f)}</span></p>`:""}${skillGrid(f,true)}</div>`;}).join("")}`;}
  if(m.type==="ytinfo"){body=ytInfoHTML();foot=true;}
  if(typeof XMODAL!=="undefined"&&XMODAL[m.type]){const r=XMODAL[m.type](m);body=r.body;foot=r.foot;}
  return `<div class="overlay" data-act="closeModalBg" data-sk="ov-${m.type}"><div class="px modal pxscroll m-${m.type}${m.type==="fighter"?" fpm t-"+(UI.ptab||"over"):""}" data-sk="modal-${m.type}" role="dialog" aria-modal="true"><button class="xbtn" data-act="closeModal" aria-label="ปิด">✕</button>${body}
    ${foot?`<div class="mfoot"><button class="btn primary" data-act="closeModal">${m.type==="report"||m.type==="levelup"?"ไปต่อ ▸":"ปิด"}</button></div>`:""}</div></div>`;}

// ---------- montage ----------
function montageHTML(){const M=UI.montage;
  return `<div class="montage" role="dialog" aria-label="ฝึกซ้อมประจำสัปดาห์"><div class="mt-bg" style="background-image:url(${ASSET}${gymBg()})"></div>
   <h2 class="mt-h">ฝึกซ้อม · สัปดาห์ที่ ${M.week}</h2><div class="mt-row pxscroll">${M.items.map((g,i)=>{const f=G.F[g.id];const top=Object.entries(g.gains).sort((a,b)=>b[1]-a[1]).slice(0,3).filter(x=>x[1]>=.05);
     const need=xpNeed(f.lvl),pct=f.lvl>=MAX_LV?100:clamp(f.xp/need*100,0,100),gp=f.lvl>=MAX_LV?0:clamp(g.xp/need*100,0,pct);
     return `<div class="mt-col px" style="--d:${i*.2}s"><canvas width="160" height="150" data-sprite="${f.id}" data-floor="1"></canvas>
      <div class="mt-info"><b>${esc(f.name)} <span class="lv">Lv.${f.lvl}</span></b><span class="pill">${g.injury?"พักรักษาตัว":PRESETS[g.preset].name}</span>
      <div class="pops">${top.map(([k,v],j)=>`<span style="--d:${i*.2+.3+j*.2}s">${ATTR_LABEL[k]} +${v.toFixed(1)}</span>`).join("")||'<span class="dim">ฟื้นร่างกาย</span>'}</div>
      <div class="mt-xp"><i style="--v:${pct}%;--g:${gp}%;--d:${i*.2+.8}s"></i><small>EXP +${g.xp}${f.lvl<MAX_LV?` · ${Math.round(f.xp)}/${need}`:" · MAX"}</small></div></div></div>`;}).join("")}</div>
   <button class="btn primary mt-go" data-act="montageDone">${M.fights?"ไปขึ้นชก ▸":"ไปต่อ ▸"}</button></div>`;}

// ---------- VN scene ----------
// v1.8: warm portraits before they are needed so scenes don't pop in late
const WARMED={};function warm(src){if(!src||WARMED[src])return;const i=new Image();i.src=src;WARMED[src]=i;}
function warmChar(id,look){if(id==="coach"){warm(`${ASSET}coach.webp`);return;}if(!castId(id)&&id!=="pailin")return;
  (look==="casual"||look==="thai"?["happy","flustered","pout"]:["happy","sad","surprised","angry"]).forEach(m=>warm(stand(id,look,m)));}
function warmSteps(steps,look){const walk=list=>(list||[]).forEach(st=>{if(!st)return;const n=typeof st.n==="function"?null:st.n;if(n==="npc"){const im=npcImg(st);if(im)warm(`${ASSET}npc_${im}.webp`);}else if(n)warmChar(n,st.l==="casual"||st.l==="thai"?st.l:(look==="casual"||look==="thai")&&!st.l?look:"fight");
  if(st.with)warmChar(st.with,look==="casual"||look==="thai"?look:"fight");if(st.bg&&BGIMG[st.bg])warm(ASSET+BGIMG[st.bg]);if(st.choice)st.choice.forEach(c=>walk(c.then));});walk(steps);}
function playScene(steps,done,opts={}){warmSteps(steps,opts.look||"fight");if(opts.bg&&BGIMG[opts.bg])warm(ASSET+BGIMG[opts.bg]);UI.scene={steps:[...steps],i:0,done,bg:opts.bg||"night",look:opts.look||"fight",cur:null,cast:[],coachOK:!!opts.coachOK,award:opts.award||null};sceneNext();}
function playHonorQueue(done){while((G.awards||[]).length&&!(G.F[G.awards[0].id]))G.awards.shift();const h=(G.awards||[])[0];if(!h){AU.startMusic("hub");if(done)done();return;}AU.startMusic("victory");AU.sfx("champ");
  playScene(honorSteps(G,h),()=>{G.awards.shift();save();playHonorQueue(done);},{bg:h.kind==="rgbelt"&&BGIMG["rgring_"+h.venue]?"rgring_"+h.venue:"hall",look:"fight",award:h});
  [500,1100,1900,2900,4200,5600].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===h)AU.sfx("pop");},ms));} /* v1.91.14: fireworks pop over the ceremony */
function sceneNext(){const S=UI.scene;if(!S)return;
  while(S.i<S.steps.length){const st=S.steps[S.i];
    if(st.inject){let more=[];try{more=st.inject(G)||[];}catch(e){console.error("scene inject",e);}S.steps.splice(S.i,1,...more);continue;}/* v1.81.1: a broken step never freezes the week */
    if(st.brawl){S.i++;UI.scene=null;openBrawl(st.brawl.a,st.brawl.b,st.brawl.hard,res=>{UI.scene=S;let more=[];try{more=st.after?st.after(G,res)||[]:[];}catch(e){console.error("brawl after",e);}S.steps.splice(S.i,0,...more);sceneNext();});return;}/* v1.89.11: a live bout inside a scene */
    if(st.bg)S.bg=st.bg;
    if(st.n&&("t" in st)&&st.t==null&&!st.choice&&!st.choiceFn&&!st.fx){S.i++;continue;}/* v1.90.13: a character with no line in this scene (one added later) is skipped, not shown as "undefined" */
    if(st.fx&&!st.n&&!st.choice&&!st.choiceFn){try{st.fx(G);}catch(e){console.error("scene fx",e);}S.i++;continue;}
    if((st.choice||st.choiceFn)&&st.t!=null&&!st._ask){const {choice,choiceFn,...line}=st;S.steps.splice(S.i,1,line,{choice,choiceFn,_ask:1});continue;} /* v1.90: a line that carries a choice is shown first, then the options */
    if(st.choice||st.choiceFn){S.cur={choice:(st.choice||st.choiceFn(G))};render();return;}
    const n=val(st.n);S.lookOf=S.lookOf||{};
    // v1.8: each character keeps one outfit for the whole scene
    const look=castId(n)?(S.lookOf[n]=S.lookOf[n]||(st.l==="train"?"fight":st.l)||S.look):(st.l||S.look);
    S.cur={n,f:val(st.f)||"happy",t:nameCall(n,val(st.t)),look,who:st.who,tel:n==="coach"&&!S.coachOK&&!!(G&&G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs)};
    if(st.show)S.cast=st.show.map(x=>({id:x.id,f:x.f||"happy",look:S.lookOf[x.id]||x.l||look,back:!!x.back}));
    if(n==="npc"){const im=npcImg(st);if(im)S.cast=[{id:"npc:"+im,f:"happy",look}];}
    if(n==="coach"){S.cast=[{id:"coach",f:"happy",look}];}           // the coach always stands alone
    else if(castId(n)||n==="pailin"){const w=st.with&&st.with!=="coach"?st.with:null;let cast=S.cast.filter(c=>c.id!==n&&c.id!=="coach");
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
    return `<img class="stand ${pos} ${active&&!m.back?"on":"off"}${m.back?" back":""}" src="${m.id.startsWith("npc:")?`${ASSET}npc_${m.id.slice(4)}.webp`:m.back?`${ASSET}${m.id}_back.webp`:stand(m.id,m.look,active&&!c.choice?moodFor(c.f,m.look,c.t):moodFor(m.f,m.look,""))}" alt="">`;}).join("");
  const tag="";
  return `<div class="vn" role="dialog" aria-label="ฉากเนื้อเรื่อง"><div class="vbg bg-${S.bg==="camp"?"gym":S.bg}" ${bgKey?`style="background-image:url(${ASSET}${bgKey})"`:""}></div>
   <div class="cast ${(S.cast||[]).length>1?"duo":""}">${cast}</div>
   ${S.award?`<div class="awardfx" aria-hidden="true">${Array.from({length:24},(_,i)=>`<i style="--i:${i}"></i>`).join("")}${[["14%","22%","0s","#ffd45a"],["78%","16%","-.8s","#ff6b6b"],["50%","30%","-1.6s","#8fd3ff"],["30%","12%","-1.2s","#c785e6"],["66%","34%","-.4s","#9dffb0"]].map(([x,y,d,c])=>`<span class="fw" style="--x:${x};--y:${y};--d:${d};--c:${c}">${Array.from({length:12},(_,a)=>`<b style="--a:${a}"></b>`).join("")}</span>`).join("")}<div class="awardbelt"><span class="strap"></span><span class="seal">★</span><span class="strap"></span></div><div class="awardname">${esc(honorLabel(S.award.kind,S.award.venue))}</div></div>`:""}
   ${c.choice?"":`<button class="vtap" data-act="vnext" aria-label="ไปต่อ"></button>`}
   <div class="vbox px" data-act="${c.choice?"":"vnext"}" style="--c:${sp.color||"var(--gold)"}">
    ${c.choice?`<div class="choices">${(UI._ck!==c?(UI._ck=c,UI._ct=Date.now()):0,"")}${c.choice.map((o,i)=>{const t=val(o.t),m0=t.match(/^(.*?)\s*\(([^()]*)\)\s*$/),m=m0&&m0[1].trim()?m0:null,act=m0&&!m0[1].trim();return `<button data-act="vchoose" data-v="${i}" ${act?'class="cact"':""}>${esc(act?m0[2]:m?m[1]:t)}${m?`<small class="cfx">${esc(m[2])}</small>`:""}</button>`;}).join("")}</div>`:
     `${who?`<div class="who">${tag}<b>${who}</b></div>`:""}<div class="txt ${c.n==="nar"?"nar":""}">${esc(c.t||"")}</div><div class="nextc">แตะเพื่อไปต่อ ▸</div>`}
   </div><button class="btn sm vskip" data-act="vskip">ข้ามฉาก</button></div>`;}
function sceneSkip(){let g=0;while(UI.scene&&g++<300){const s=UI.scene;if(s.cur&&s.cur.choice){render();return;}sceneNext();}} /* v1.90.15: skip fast-forwards to the next choice and stops there — it used to pick the first option for you (a skipped confession meant yes) */

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
  if(st==="local")return `🎯 ท็อป 4 ตำบล ก่อน สด.20${a?` · ${a.f.name} (อันดับ ${a.i})`:""}`;
  if(st==="district"){const inQ=[...G.qual.A,...G.qual.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inQ?`🎯 ท็อป 4 อำเภอ ก่อน สด.40 ไปรองชิงจังหวัด${a?` · ${a.f.name} (อันดับ ${a.i})`:""}`:"🎯 พลาดรอบอำเภอปีนี้ · สร้างค่ายรอปีหน้า";}
  if(st==="final"&&G.week<=44&&[...((G.semis||{}).A||[]),...((G.semis||{}).B||[])].some(id=>G.F[id]&&G.F[id].camp==="player")&&!G.finalists.A.concat(G.finalists.B).some(id=>G.F[id]&&G.F[id].camp==="player"))return "🎯 ชนะรองชิงจังหวัด สด.44";
  if(st==="final"){const inF=[...G.finalists.A,...G.finalists.B].some(id=>G.F[id]&&G.F[id].camp==="player");return inF?"🎯 ชิงแชมป์จังหวัด สด.49 ห้ายก":"🎯 ดูแลค่ายจนจบฤดูกาล";}
  return "ปิดปี · เตรียมตัวสำหรับปีหน้า";}

// ---------- events / extras ----------
// v1.49: annual events can play once per year
const evSeen=e=>e.annual?((G.seenY||{})[e.id]===(G.season||1)):!!G.seen[e.id];
function pendingEvents(){return EVENTS.filter(e=>{try{return e.when&&!evSeen(e)&&e.when(G);}catch(err){console.error("event when",e.id,err);return false;}});}
// v1.41: at most two optional story scenes a week — the rest wait for next week (main story / finals always play)
const EV_MUST=/^(lv_val|lv_harem|lv_back|prologue|daeng_leave|pre_qual|qual_result|final_result|semi_result|night_final|lover_final|ploy_prefinal|fah_prefinal|first_win|first_loss)/,EV_CAP=2;
function runEvents(done){const list=pendingEvents().sort((a,b)=>(b.pri||0)-(a.pri||0));let played=0,opt=0;/* time-limited scenes go first */
  const step=()=>{const e=list.shift();if(!e||G.ended){done&&done(played);return;}if(evSeen(e)||!(()=>{try{return e.when(G);}catch(x){return false;}})()){step();return;}
    if(G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs&&!EV_MUST.test(e.id)&&!/daeng|coach/.test(e.id)&&e.steps.some(x=>x.n==="coach")){step();return;}/* v1.60: scenes where Kru Daeng talks wait until he is back */
    if(!EV_MUST.test(e.id)&&!/^lv_/.test(e.id)&&awaySpeaks(G,e.steps)){step();return;}/* v1.89.11: scenes with a girl who left camp wait until she is back */
    if(!EV_MUST.test(e.id)){if(opt>=((G.season||1)>=2&&(G.week===44||G.week===49)?0:EV_CAP)){step();return;}opt++;}
    if(e.annual){G.seenY=G.seenY||{};G.seenY[e.id]=G.season||1;}else G.seen[e.id]=true;G.seenWk=G.seenWk||{};G.seenWk[e.id]=G.week;G.seenAbs=G.seenAbs||{};G.seenAbs[e.id]=gameWeek(G);played++;playScene(e.steps,step,{bg:e.bg,look:e.look,coachOK:/daeng|coach/.test(e.id)});};step();}
function weeklyExtra(done){const rng=mulberry32(G.seed+G.week*313);if(typeof questExtra==="function"&&questExtra(done,mulberry32(G.seed+G.week*59)))return;
  const dil=(typeof DILEMMAS!=="undefined"?DILEMMAS:[]).filter(d=>!G.seen[d.id]&&G.week>=d.from&&G.week<=d.to&&d.need(G)&&!awaySpeaks(G,d.steps));
  const sinceD=gameWeek(G)-(G.lastDilemma||0);
  // v1.21: something happens most weeks — a decision every couple of weeks, chatter or a happening in between
  if(dil.length&&sinceD>=2&&rng()<.62){const d=dil[Math.floor(rng()*dil.length)];G.seen[d.id]=true;G.lastDilemma=gameWeek(G);
    playScene([{n:"nar",t:"— เรื่องที่ต้องตัดสินใจ —"},...d.steps],done,{bg:d.bg==="camp"?"gym":d.bg,look:d.look||"train"});return;}
  const chats=CHATTER.filter(c=>!G.seen[c.id]&&c.need(G));const haps=HAPPENINGS.filter(h=>!G.seen[h.id]);
  const chats2=chats.filter(c=>(!c.need2||c.need2(G))&&!awaySpeaks(G,c.steps)),haps2=haps.filter(h=>(!h.need||h.need(G))&&!awaySpeaks(G,h.steps));
  let pick=null;if(chats2.length&&rng()<.6)pick=chats2[Math.floor(rng()*chats2.length)];else if(haps2.length&&rng()<.7)pick=haps2[Math.floor(rng()*haps2.length)];
  if(!pick){done();return;}G.seen[pick.id]=true;playScene(pick.steps,done,{bg:pick.bg==="camp"?"gym":pick.bg,look:pick.look||"train"});}
function afterWeekFlow(){playHonorQueue(afterWeekFlowMain);}
function afterWeekFlowMain(){if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);}}if(typeof mailWeekly==="function"&&!G.ended)mailWeekly(G);if(typeof chatWeekly==="function"&&!G.ended)chatWeekly(G);runEvents(played=>{const fin=()=>{if(G.ended){startEnding();return;}
    if(typeof cardCheck==="function"){const g2=cardCheck(G);if(g2.length)G.cardPend=(G.cardPend||[]).concat(g2);}relTierCheck();if((G.newCerts||[]).length){const n=G.newCerts.map(k=>CAMP_AWARDS[k]?CAMP_AWARDS[k].name:k);G.newCerts=[];setTimeout(()=>toast(`📜 ได้รับเกียรติบัตร: ${n.join(", ")} · ดูได้ที่ห้องถ้วยรางวัล`),600);}if(typeof OUTFITS!=="undefined"){G.outSeen=G.outSeen||{};const nu=Object.keys(OUTFITS).filter(k=>k!=="base"&&k!=="heart"&&!G.outSeen[k]&&outfitOk(G,null,k));nu.forEach(k=>G.outSeen[k]=1);if(nu.length)setTimeout(()=>toast(`ปลดล็อกชุดใหม่: ${nu.map(k=>OUTFITS[k].name).join(", ")} · เปลี่ยนได้ที่โปรไฟล์นักมวย แท็บ "ชุด"`),400);}if(UI.relUp&&UI.relUp.length){const m=UI.relUp.join(" / ");UI.relUp=[];setTimeout(()=>toast("♥ "+m),300);}
    if(G.levelUps&&G.levelUps.length){const ids=[...new Set(G.levelUps)];G.levelUps=[];AU.sfx("level");UI.modal={type:"levelup",ids};}else if((G.cardPend||[]).length){AU.sfx&&AU.sfx("level");UI.modal={type:"cardnew"};}render();};
    const go=()=>coachBackScene(()=>aftermathScene(()=>tiredScene(()=>rinScene(()=>contestScene(()=>regionScenes(()=>sportsDayYear(()=>waiKhruYear(fin))))))));if(played)go();else weeklyExtra(go);});}
// v1.90 (hidden): regional chapter story beats that land at the end of a week (gala, contract…) — region.js loads on demand
function regionScenes(done){if(G.ended||!G.region||!regionOn()){done();return;}regionLoad().then(R=>{if(R.weekScene)R.weekScene(G,done);else done();},()=>done());}
// v1.90: week 37 — the camp's annual wai kru; pick the offering, then watch the rite
function waiKhruYear(done){const S=G.season||1;if(G.ended||G.week<WAIKHRU_WEEK||G.week>48||(G.waikhru||{})[S]||!roster(G).length){done();return;}
  UI.wkDone=done;UI.wkSkip=false;UI.modal={type:"waikhru",ph:"pick"};AU.startMusic&&AU.startMusic("waikhru");render();}
function waiKhruHTML(){const S=G.season||1,R=(G.waikhru||{})[S],first=!Object.keys(G.waikhru||{}).length;
  if(UI.modal.ph==="pick")return `<h2>ไหว้ครูประจำปี ${S}</h2>
   <div class="ctip"><img src="${faceSrc("coach")}" alt=""><span>${first?"ค่ายศิริชัยไม่ได้จัดไหว้ครูมาสิบปีแล้ว ปีนี้ครูอยากให้เด็ก ๆ ได้กราบปู่ชัยกับครูบาอาจารย์ให้ถูกต้อง":"ถึงวันไหว้ครูอีกปีแล้ว ใครเข้าค่ายใหม่ ปีนี้ครูจะครอบครูรับเป็นศิษย์"} จะจัดแบบไหนดี</span></div>
   <div class="wkset">${Object.entries(WAI_SET).map(([k,W])=>`<button class="wkopt" data-act="waipick" data-v="${k}" ${G.cash<W.cost?"disabled":""}><b>${W.n}</b><small>${W.d}</small><span class="meta">${W.cost?fmt(W.cost):"ไม่มีค่าใช้จ่าย"} · กำลังใจทุกคน +${W.mor}${W.bless?` · พรครู ${W.bless} สัปดาห์ (บาดเจ็บจากการซ้อมน้อยลงครึ่งหนึ่ง)`:""}${W.rep?" · ชื่อเสียง +"+W.rep:""}</span></button>`).join("")}</div>`;
  if(!R)return "";const now=UI.wkSkip?" now":"",T=WK_TL(R.ids.length),nm=id=>esc(G.F[id]?G.F[id].name:id);
  const rows=[["จุดธูปเทียนบูชาครู","ปี่ชวาเป่าเพลงไหว้ครูเบา ๆ",T.t1],["ทุกคนคุกเข่า กราบครูสามครั้ง",R.ids.map(nm).join(" · "),T.t3],
    [R.krob.length?"ครอบครู รับเป็นศิษย์ค่ายศิริชัย":"ครูแดงสวมมงคล เป่ากระหม่อมทีละคน",R.krob.length?R.krob.map(nm).join(" · "):"ทุกคนเป็นศิษย์ค่ายนี้แล้ว",T.t4-400],
    ["พรครู",`กำลังใจทุกคน +${R.mor}${R.bless?` · บาดเจ็บจากการซ้อมน้อยลงครึ่งหนึ่ง ${R.bless} สัปดาห์`:""}`,T.t4+200]];
  return `<h2>ไหว้ครูประจำปี ${S}</h2><div class="cfxwrap ctwrap" data-act="waiskip" role="button" aria-label="ข้ามฉาก"><canvas class="campcv" width="640" height="360" data-waikhru="1"></canvas></div>
   <div class="ctscore">${rows.map(([a,b,d])=>`<div class="ctrow wkrow${now}" style="--d:${d}ms"><span>${a}<small>${b}</small></span></div>`).join("")}</div>
   <div class="mfoot"><button class="btn primary wkgo${now}" style="${"--d:"+T.end+"ms"}" data-act="waidone">ไปต่อ</button></div>`;}
// v1.86: week 30 — the district chief judges the camp, then the results night at the district office
function contestScene(done){const S=G.season||1;if(G.ended||G.week<CONTEST_WEEK||G.week>40||(G.contests||{})[S]){done();return;}
  runContest(G);save();UI.contestDone=done;UI.ctSkip=false;UI.ctT0=performance.now();UI.modal={type:"contest",ph:"walk"};AU.sfx&&AU.sfx("bell");render();}
function contestHTML(){const S=G.season||1,R=(G.contests||{})[S];if(!R)return "";const yc=YEAR_COLORS.find(c=>c.k===R.color)||YEAR_COLORS[0],now=UI.ctSkip?" now":"";
  if(UI.modal.ph==="walk")return `<h2>ประกวดค่ายสวยประจำปี ${S}</h2><p class="meta">นายอำเภอเดินดูค่ายด้วยตัวเอง · สีมงคลปีนี้ <b style="color:${yc.hex}">● ${yc.n}</b> ของตกแต่งสีตรงได้ +2</p>
    <div class="cfxwrap ctwrap" data-act="contestskip" role="button" aria-label="ข้ามฉาก"><canvas class="campcv" width="640" height="360" data-contest="walk"></canvas></div>
    <div class="ctscore">${R.areas.map((a,i)=>`<div class="ctrow${now}" style="--d:${CT_START+i*CT_STEP+CT_WALK+200}ms"><span>${esc(a.n)}<small>${esc(a.item)}${a.match?` · <b style="color:${yc.hex}">สีปี +2</b>`:""}</small></span><i class="ctbar"><i style="width:${a.score*10}%"></i></i><b>${a.score}/10</b></div>`).join("")}
     <div class="ctrow tot${now}" style="--d:${CT_START+R.areas.length*CT_STEP}ms"><span>รวม</span><i></i><b>${R.total}/70</b></div></div>
    <div class="mfoot"><button class="btn primary" data-act="contestaward">ไปฟังประกาศผล ▸</button></div>`;
  const ord=[2,1,0].filter(k=>R.field[k]),me=R.field.find(f=>f.me);
  return `<h2>ประกาศผลค่ายสวยประจำปี ${S}</h2><div class="cfxwrap ctwrap" data-act="contestskip" role="button" aria-label="ข้ามฉาก"><canvas class="campcv" width="640" height="360" data-contest="award"></canvas></div>
    <div class="ctscore">${ord.map((k,j)=>{const f=R.field[k];return `<div class="ctrow rk${k+1}${f.me?" me":""}${now}" style="--d:${[1600,4200,6800][j]}ms"><span>${["🥇","🥈","🥉"][k]} อันดับ ${k+1} · ${esc(f.name)}</span><i></i><b>${f.score}/70</b></div>`;}).join("")}
     <div class="ctrow tot${now}" style="--d:7600ms"><span>${R.rank===1?"🏆 ค่ายศิริชัยชนะเลิศ!":`ค่ายศิริชัยได้อันดับ ${R.rank} จาก ${R.field.length} ค่าย`}<small>${R.prize?`รางวัล ${fmt(R.prize)} · `:""}ชื่อเสียง +${R.rep}${R.unlock?` · ปลดล็อกของตกแต่ง "${esc(R.unlock)}"`:""}</small></span><i></i><b>${me?me.score:R.total}/70</b></div></div>
    <div class="mfoot"><button class="btn primary" data-act="contestdone">ไปต่อ ▸</button></div>`;}
// v1.15: a worn-out fighter asks for a rest week herself
function tiredScene(done){G.tiredAt=G.tiredAt||{};const f=roster(G).find(x=>!x.injury&&x.fatigue>=58&&x.plan.preset!=="rest"&&(G.tiredAt[x.id]??-9)<gameWeek(G)-3);if(!f||!coachOn()&&f.fatigue<70){done();return;}
  G.tiredAt[f.id]=gameWeek(G);const ask=vary("tired_"+f.id,({kati:["ครูคะ… ขามันหนักไปหมดเลย ขอพักสักสัปดาห์ได้ไหมคะ","หนูวิ่งเช้านี้ช้ากว่าเมื่อวานอีกค่ะ… ขอพักสักหน่อยนะคะ","ไหล่หนูยกไม่ขึ้นแล้วค่ะ ครู… หนูยังไหวนะ แต่…"],mali:["ฮือ… มะลิเตะไม่ขึ้นแล้วอ่ะ ขอนอนยาว ๆ สักอาทิตย์นะ~","มะลิหลับในตอนยืดเส้นไปแล้วสองรอบ… ขอพักนะคะ","ขามะลิสั่นเหมือนเยลลี่เลยอ่ะ~ วันนี้ขอนอนได้ไหม"],rin:["ตัวเลขชีพจรตอนเช้าฉันสูงผิดปกติ… ร่างกายต้องการพักค่ะ","กราฟความล้าของฉันพุ่งเกินเส้นแดงแล้วค่ะ ขอพักหนึ่งสัปดาห์","ฉันพิมพ์ผิดในสเปรดชีตสามครั้งเช้านี้… ร่างกายเตือนแล้วค่ะ"]})[f.id]||["ขอพักสักหน่อยได้ไหมคะ"]);
  playScene([{n:f.id,f:"sad",l:"fight",t:ask},...(coachOn()?[{n:"coach",t:`ล้า ${Math.round(f.fatigue)} แล้ว ฝืนต่อเสี่ยงเจ็บ ครูว่าพักฟื้นสัปดาห์นี้`}]:[]),
    {choice:[{t:"ให้พักฟื้นสัปดาห์นี้",fx:()=>{if(!trLocked(f))f.plan.preset="rest";f.morale=Math.min(100,f.morale+4);},then:[{n:f.id,f:"happy",l:"fight",t:{kati:"ขอบคุณค่ะ! สัปดาห์หน้าหนูจะกลับมาเต็มร้อย",mali:"เย้~ นอนกอดเจ้าโค้ชทั้งวันเลย!",rin:"ขอบคุณค่ะ ฉันจะใช้วันพักทบทวนเทปไปด้วย"}[f.id]||"ขอบคุณค่ะ!"}]},
     {t:"อดทนอีกนิด ไฟต์ใกล้แล้ว",fx:()=>{f.morale=Math.max(0,f.morale-5);},then:[{n:f.id,f:"sad",l:"fight",t:{kati:"…ค่ะ หนูจะพยายาม",mali:"งื้อ… ได้ค่ะ แต่ห้ามดุนะถ้ามะลิช้า",rin:"…รับทราบค่ะ ฉันจะบันทึกไว้ว่าฝืนเพราะอะไร"}[f.id]||"…ค่ะ"}]}]}],()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"fight"});}
function aftermathScene(done){const L=G.lastBig;if(!L||L.shown||L.absWeek==null||gameWeek(G)-L.absWeek>1){done();return;}L.shown=true;const me=G.F[L.a];if(!me||me.camp!=="player"){done();return;}
  playScene(aftermathSteps(G,L),()=>{AU.startMusic("hub");save();done();},{bg:"gym",look:"train"});}
// v1.15: Kru Daeng comes back from his leave and checks on everyone
function coachBackScene(done){if(!G.coachAwayAbs||gameWeek(G)<G.coachAwayAbs||(G.flags&&G.flags.coachBack)){done();return;}G.flags=G.flags||{};G.flags.coachBack=true;const R=roster(G);const k=R[0];
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
function montageDone(){const q=[...UI.montage.queue];UI.montage=null;const next=()=>{const b=q.shift();if(!b){finishWeek();return;}
  if(b.region&&typeof REGION!=="undefined"&&REGION.trip){REGION.trip(b,next);return;} /* v1.90 (hidden): regional trip = drive → bout → hotel */
  openFight(b,next);};next();}
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
/* v1.90.1: community links in settings — event codes are handed out only in Discord */
const COMM={fb:"https://www.facebook.com/share/1TAk6M7Ahy/"};
function commHTML(){return `<div class="set comm"><span><b>ชุมชนของเกม</b><small>ข่าวอัปเดต โค้ดอีเวนต์ แจ้งบั๊ก คุยกับผู้เล่นคนอื่น</small></span><span class="obtns"><a class="btn sm" href="${GATE.url}" target="_blank" rel="noopener">💬 Discord</a><a class="btn sm" href="${COMM.fb}" target="_blank" rel="noopener">📘 Facebook</a></span></div>`;}
const GATE={code:"U0lSSUNIQUky",url:"https://discord.gg/pgBG3cd9HD",key:"mtm-unlock"};
function gateOpen(){try{if(localStorage.getItem(GATE.key)==="1")return true;}catch(e){}return !!(G&&(G.unlocked||(G.season||1)>=2));}
function gateHTML(){return `<section class="px card gate"><span class="pill gold">เดโมจบปีที่ 1</span><h3>ขอบคุณที่เล่นมาถึงตรงนี้!</h3>
  <p>อยากเล่นต่อปีที่ 2 เข้า Discord ของเกม แล้วรับโค้ดในห้อง #โค้ดเล่นต่อ เซฟของคุณเก็บไว้ครบ ใส่โค้ดเมื่อไหร่ก็เล่นต่อได้ทันที</p>
  <a class="btn gatelink" href="${GATE.url}" target="_blank" rel="noopener">เข้า Discord ของเกม ▸</a>
  <div class="gatein"><input id="gatecode" maxlength="20" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ใส่โค้ดตรงนี้" aria-label="โค้ดเล่นต่อ"><button class="btn primary" data-act="gatego">ปลดล็อก</button></div>
  ${UI.gateErr?'<p class="meta redt">โค้ดไม่ถูก ลองเช็กตัวสะกดอีกครั้ง</p>':""}</section>`;}
// v1.81.1: year 1 teases the next chapter, year 5 closes the main story (demo), later years are free mode
function endTeaserHTML(){const y=G.season||1;if(G.ended==="bankrupt")return "";
  if(y===5)return `<section class="px card teaser demo-done"><span class="pill gold">จบเนื้อเรื่องหลัก</span><h3>ขอบคุณที่ทดสอบเดโม Muay Thai Moe!</h3>
    <p>เนื้อเรื่องหลักของเดโมจบที่ปีที่ 5 หลังจากนี้เป็น<b>โหมดอิสระ</b> เล่นต่อได้ไม่จำกัด คู่แข่งจะเก่งขึ้นทุกปี และไพลินกับค่ายเวกเตอร์จะกลับมาท้าทุกปี</p>
    <p class="meta">โปรดติดตามเนื้อหาเพิ่มเติมในอนาคต เรามีแผนเพิ่มเนื้อเรื่อง ตัวละคร และเวทีใหม่เรื่อย ๆ ครับ</p></section>`;
  if(y>=6)return `<section class="px card teaser"><span class="pill red">โหมดอิสระ</span><h3>ปีที่ ${y+1} คู่แข่งซ้อมหนักขึ้นอีก</h3><p class="meta">เนื้อเรื่องใหม่กำลังทำอยู่ เซฟนี้จะเล่นต่อได้เมื่อบทใหม่มาถึง</p></section>`;
  if(y===1)return `<section class="px card teaser"><span class="pill red">บทต่อไป · เร็ว ๆ นี้</span><h3>เส้นทางสู่เวทีระดับภาค</h3>
    <ul><li>ค่ายพยัคฆ์ทองดึงเทรนเนอร์จากกรุงเทพฯ และฟ้าจะไม่ใช่คนเดิมอีกต่อไป</li><li>นักมวยหน้าใหม่จากมวยท่าเสาและมวยโคราชกำลังมองหาค่าย</li><li>หนี้ของปู่ชัยยังมีความลับที่กะทิไม่ได้เล่าทั้งหมด</li></ul></section>`;
  return "";}
function endingHTML(){const E=UI.ending,all=roster(G),res=seasonResult();
  return `<main class="endpage"><section class="px card end-hero"><img class="endlogo" src="${ASSET}logo.webp" alt="Muay Thai Moe">
    <span class="pill gold">${G.ended==="bankrupt"?"ค่ายปิดตัว":(G.season||1)>=2?`จบปีที่ ${G.season}`:"จบบทที่ 1 · ปีที่ 1"}</span><h1>${(G.season||1)>=2&&G.ended!=="bankrupt"?esc(E.title):`ฉากจบ: ${E.title}`}</h1>
    <p class="lead">${(G.season||1)>=2&&G.ended!=="bankrupt"?`ปีที่ ${G.season} ผ่านไปแล้ว ${esc(G.player.name)} กับค่ายศิริชัยยังเดินหน้าต่อ`:`ขอบคุณที่เล่น <b>Muay Thai Moe</b>! ${esc(G.player.name)} พาค่ายศิริชัยมาได้ถึงตรงนี้แล้ว`}</p></section>
   ${(()=>{const mv=tierMoves(G);if(!mv.length)return "";const mine=mv.filter(m=>m.f.camp==="player"),oth=mv.filter(m=>m.f.camp!=="player"&&m.up).slice(0,6);
     return `<section class="px card"><h3>ใครขึ้นระดับปีนี้</h3>${mine.concat(oth).map(m=>`<div class="kv-row"><span>${faceImg(m.f,"sm")} ${esc(m.f.name)} · รุ่น ${m.f.div}${m.f.camp==="player"?" · ค่ายเรา":""}</span><span>${m.from.ic} ${m.from.n} <b class="${m.up?"goldt":"mutt"}">${m.up?"▲":"▼"}</b> ${tierChip(m.f,1)}</span></div>`).join("")}</section>`;})()}
   <section class="px card"><h3>ผลงานปีนี้</h3>${res.length?res.map(r=>`<div class="kv-row"><span>${faceImg(r.f,"sm")} ${esc(r.f.name)} · รุ่น ${r.d}</span><span class="pill ${r.c}">${r.t}</span></div>`).join(""):'<p class="meta">ปีนี้ยังไม่มีนักมวยผ่านรอบตำบล</p>'}</section>
   <div class="grid g3"><section class="px card"><h3>ค่าย</h3><div class="kv-row"><span>ระดับค่าย</span><b>Lv.${campLevel(G)} ${CAMP_LV_NAME[campLevel(G)]}</b></div><div class="kv-row"><span>เงินสด</span><b class="num">${fmt(G.cash)}</b></div><div class="kv-row"><span>หนี้คงเหลือ</span><b class="num">${fmt(G.debt)}</b></div><div class="kv-row"><span>นักเรียน</span><b class="num">${students(G)} คน</b></div><div class="kv-row"><span>ชื่อเสียง</span><b class="num">${G.rep.toFixed(1)}</b></div></section>
   <section class="px card"><h3>นักมวยในค่าย</h3>${all.map(f=>`<div class="kv-row"><span>${esc(f.name)} Lv.${f.lvl}</span><span class="num">${rec(f)}</span></div>`).join("")}</section>
   <section class="px card"><h3>ความสัมพันธ์</h3>${CANON_IDS.map(id=>G.F[id]).filter(f=>f.met).map(f=>`<div class="kv-row"><span>${esc(f.name)}${relTag(G,f).replace(/^ · /," ")}</span>${hearts(f.bond,f)}</div>`).join("")}</section></div>
   ${endTeaserHTML()}
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
  const lab=vectorFightScene(G,b);if(lab){playScene(lab,()=>openFight2(b,done),{bg:"vector_lab",look:"fight"});return;}
  const prod=prodigyFightScene(G,b);if(prod){playScene(prod,()=>openFight2(b,done),{bg:"ring",look:"fight"});return;}
  if(!op.canon){openFight2(b,done);return;}
  let sc=null;const key=`${b.a}_${b.b}`;
  if(op.canon&&!G.seen[k]&&!(G.faceoffLast&&G.faceoffLast[key])&&!(b.tier==="final"&&(G.seen.ploy_prefinal||G.seen.fah_prefinal))){sc=tauntScene(G,b.a,b.b);if(sc)G.seen[k]=true;}
  playScene(sc||fightFaceoff(b),()=>openFight2(b,done),{bg:TIER_BG[b.tier]?TIER_BG[b.tier].replace(/^bg_|\.webp$/g,""):"local",look:"fight"});}
// Wai khru opens the first bout, canon matchups, and major bouts.
const RAM={phrom:{name:"พรหมสี่หน้า",hint:"ไหว้ครบสี่ทิศ · ใจนิ่ง แม่นขึ้นยกแรก"},hong:{name:"หงส์เหิน",hint:"สง่างามดั่งหงส์ · กำลังใจ +6"},
  phra:{name:"พระรามแผลงศร",hint:"น้าวคันศร · ยกแรกออกอาวุธดุดัน"}};
function waiKhruScene(b){const me=G.F[b.a],first=!(G.flags&&G.flags.waiSeen);const away=!!(G.coachAwayAbs&&gameWeek(G)<G.coachAwayAbs);
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
/* v1.91.0: the fighter's style and the wheel, on her profile — the main heroines can change it with the school line they build */
/* v1.91.5 hot-form title badge (win HOT_AT in a row) */
function hotBadge(f,sm){if(typeof hotForm!=="function"||!hotForm(f))return "";const T=hotTitle(f);return `<span class="pill hotb${sm?" sm":""}" title="${esc(T.desc)}">🔥 ${esc(T.name)}</span>`;}
function hotStreakLine(f){if(!f||f.camp!=="player")return "";const w=f.wst||0;if(hotForm(f)){const T=hotTitle(f);return `<p class="meta hotl">🔥 ฉายา <b>${esc(T.name)}</b> · ชนะติดกัน ${w} ไฟต์ · ${esc(T.desc)} · แพ้หรือเสมอเมื่อไรฉายาหาย</p>`;}
  return w>=2?`<p class="meta hotl">ชนะติดกัน ${w} ไฟต์ · อีก ${HOT_AT-w} ไฟต์ได้ฉายา</p>`:"";}
function styleCardHTML(f){const st=fightStyle(f),home=HOME_STYLE[f.id];
  return `<p class="meta styline">สไตล์ในไฟต์ <b>${FSTYLE[st]}</b>${home&&home!==st?` · ตัวตนเดิม ${FSTYLE[home]}`:""}${home?" · เปลี่ยนได้ด้วยสายสำนักที่อัปมากที่สุด":""}</p>`;}
function preCompare(me,op,b){const sc=scouted(op.id)||op.camp==="player";const v=verdictOf(adviseCached(me.id,op.id,b.rounds||3).bestRate);
  const rows=[["หมัด",a=>a.punch],["เตะ",a=>a.kick],["เข่า/ศอก",a=>(a.knee+a.elbow)/2],["การ์ด",a=>(a.guard+a.counter)/2],["แรง",a=>(a.stamina+a.dur)/2]];
  /* v1.91.0 style wheel line — your build decides your style; the opponent's comes from her best weapon */
    const sty=""; /* v1.91.2 (Man): nothing about styles before the fight — a build can change any time */
  /* v1.91.10 (Man): regional opponents show their real strength — ring craft (vet) on top of the 20 stat ceiling, the part past 20 in gold.
     Main-game NPCs stay as before: your own skill edge is hidden there too, so adding only theirs would mislead */
  const oX=(op.rg||op.nl||op.camp==="region")?(op.vet||0):0,vals=rows.map(([,g])=>[g(me.a),g(op.a)+oX]),S=Math.max(20,...vals.flat().map(Math.ceil));
  const bar=(cls,val,on)=>`<i class="pb ${cls}${val>20.05?" ov":""}" style="--v:${on?clamp(val/S*100,0,100):0}%;--g:${clamp(20/Math.max(val,.1)*100,0,100)}%"></i>`;
  return sty+`<div class="pcmp"><div class="pcmp-h"><span class="pill dtag ${v.c}">${v.t}</span>${sc?"":`<small class="mutt">ยังไม่ได้ดูเทป · ไม่เห็นค่าพลังคู่ชก</small>`}</div>${rows.map(([n],i)=>{const [x,y]=vals[i];
    return `<div class="pcr"><b class="num ${sc&&x>y+.4?"goldt":""}">${x.toFixed(1)}</b>${bar("l",x,1)}<span>${n}</span>${bar("r",y,sc)}<b class="num ${sc&&y>x+.4?"redt":""}">${sc?y.toFixed(1):"?"}</b></div>`;}).join("")}</div>`;}
function fightHTML(){const U=UI.fight,b=U.b,me=G.F[b.a],op=G.F[b.b],F=U.F;
  const last=U.shown.filter(x=>x.ha!=null).slice(-1)[0];const sv=(s,k)=>F?(last?last[k]:s):100;
  const side=(f,cls,hp,sta)=>`<div class="fside ${cls}"><div class="fn">${f.canon||f.id==="pailin"?`<img class="face sm" src="${faceSrc(f.id,"happy")}" alt="">`:""}<b>${esc(f.name)}</b><span class="meta">Lv.${f.lvl}</span>${hotBadge(f,1)}</div>
    <div class="meter"><i style="--v:${clamp(hp,0,100)}%;--bc:${hp>50?"var(--green)":hp>25?"var(--warn)":"var(--red)"}"></i></div><div class="meter thin"><i style="--v:${clamp(sta,0,100)}%;--bc:var(--gold)"></i></div></div>`;
  const hpN=(S,v)=>S&&S.f.hpX?v*100/(S.hp0||100):v; /* v1.90.13: a boss with extra hp shows her bar as a share of her own max */
  const hpA=F?hpN(F.A,sv(F.A.hp,"ha")):100,hpB=F?hpN(F.B,sv(F.B.hp,"hb")):100,stA=F?sv(F.A.sta,"sa"):100,stB=F?sv(F.B.sta,"sb"):100;
  let mid="";
  if(U.stage==="pre"){const c=condition(me);const P=personaOf(op);
    mid=`<div class="pre px"><div class="vsrow"><div class="vsc">${faceImg(me)}<b>${esc(me.name)}</b>${hotBadge(me,1)}<span class="meta">${styleOf(me.a)}</span></div><span class="vs">VS</span><div class="vsc">${faceImg(op)}<b>${esc(op.name)}</b>${hotBadge(op,1)}<span class="meta">${styleOf(op.a)} · ${rec(op)}</span></div></div>
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
    if(U.stage==="playing")mid+=`<div class="fctl2"><div class="seg sm">${[["1","x1"],["2","x2"]].map(([v,t])=>`<button data-act="fspeed" data-v="${v}" aria-pressed="${String(UI.speed)===v}" aria-label="ความเร็ว ${t}">${t}</button>`).join("")}</div>${U.brawl?`<span class="meta skhint">ดูอยู่ข้างเวที · ทั้งคู่ชกกันเอง</span>`:skillBarHTML()}</div>`; /* v1.89.3: speed and skills share one row right under the live stats again (as before v1.83 pinned them to the bottom) */
    if(U.stage==="corner")mid+=cornerHTML(F);
    if(U.stage==="talk")mid+=brawlTalkHTML();
    if(U.stage==="done")mid+=U.brawl?brawlDoneHTML():resultHTML();
    mid+=`<details class="logd" ${UI.logOpen?"open":""} ontoggle="UI.logOpen=this.open"><summary>บันทึกการชกทั้งหมด</summary><div class="flog">${U.shown.map(l=>l.rd?`<div class="rd">${l.rd}</div>`:`<div class="${l.s}">${esc(l.t||"")}</div>`).join("")}</div></details>`;}
  const tw=UI.confirmTowel?`<div class="tconfirm" role="alertdialog"><div class="px">${UI.towelCoach?`<div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดง:</b> ${esc(me.name)}เจ็บหนักแล้ว เลือดเหลือแค่ ${Math.max(1,Math.round(U.F.A.hp))} ถ้าชกต่อแล้วโดนน็อก ต้องพักหลายสัปดาห์ จะโยนผ้าไหม</span></div>`:""}<h3>🏳️ โยนผ้ายอมแพ้?</h3><p>ไฟต์นี้จะนับเป็นแพ้ทันที แต่นักมวยจะไม่เจ็บหนักกว่านี้ (กำลังใจลดลง)</p><div class="ctrl"><button class="btn" data-act="towelno">ชกต่อ</button><button class="btn primary" data-act="towelyes">ยอมแพ้</button></div></div></div>`:"";
  return `${tw}${fpopHTML()}<div class="fight pxscroll ${U.stage==="corner"?"incorner":U.stage==="done"?"isdone":""}" data-sk="fight" role="dialog" aria-label="การชก"><div class="fight-in"><div class="fhead">${side(me,"a",hpA,stA)}<div class="vsmid"><b>${b.brawl?"เคลียร์กันบนเวที":TIER[b.tier].name}</b>${U.F&&U.F.round&&U.stage==="playing"?(()=>{const s=Math.max(0,Math.round(180*(1-Math.min(U.F.ex||0,EX_PER_ROUND)/EX_PER_ROUND)));return `<span class="meta">ยก ${U.F.round}/${b.rounds}</span><span class="rclock num">${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}</span><i class="rcbar" style="--v:${Math.round(s/1.8)}%"></i>`;})():`<span class="meta">${b.rounds} ยก</span>`}</div>${side(op,"b",hpB,stB)}</div>${mid}</div></div>`;}
function liveStats(){const U=UI.fight,F=U.F;if(!F)return "";let la=0,lb=0;
  for(const e of U.shown){if(!e.ev)continue;const sd=sideOf(e,F);if(e.ev==="hit"||e.ev==="counter"){if(sd==="A")la++;else lb++;}}
  const ctl=la+lb?Math.round(la/(la+lb)*100):50;
  return `<div class="live px"><span>เข้าเป้า <b class="num">${la}</b> – <b class="num">${lb}</b></span><span class="ctlbar" style="--v:${ctl}%"><i></i></span><span>คุมเกม <b class="num">${ctl}%</b></span><span>ขาคู่ชก ${F.B.legs>25?"หนักมาก":F.B.legs>12?"เริ่มหนัก":"ปกติ"}</span></div>`;}
// v1.10 corner: tiny care puzzle + pick an order, then confirm
const CARD_FACE={1.4:["star","ฟื้นเต็มที่!"],1:["water","ฟื้นปกติ"],.6:["thumb","พอไหว"],"-0.3":["cramp","ตะคริว!"]};
const careSum=C=>C.gain?`เลือด ${C.gain.hp>=0?"+":""}${C.gain.hp} · ${C.gain.sta?`แรง ${C.gain.sta>0?"+":""}${C.gain.sta}`:C.q>0?"แรงเต็มแล้ว":"แรงไม่ขึ้น"}`:"";
/* five cards: shown face up, flipped, shuffled around, then the player picks one */
function careCardHTML(A,C){const ph=C.phase;const msg=C.done?`${esc(CARD_FACE[String(C.q)][1])} · ${careSum(C)}`:ph==="show"?"จำไพ่ไว้นะ…":ph==="pick"?"เลือกไพ่ 1 ใบ":"สับไพ่…";
  return `<div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>${msg}</span></div>
  <div class="cshuf ${ph==="shuffle"?"spin":""}">${C.deck.map((q,k)=>{const F=CARD_FACE[String(q)],up=ph==="show"||C.done,mine=C.flip===k;
    return `<button class="cshc ${up?"up":""} ${mine?"picked":""} ${C.done&&!mine?"dim":""}" data-k="${k}" data-act="ccard" data-v="${k}" style="left:${C.pos[k]*20}%" ${ph!=="pick"||C.done?"disabled":""}><span class="cb">${PIX.cback}</span><span class="cf">${PIX[F[0]]}<small>${esc(F[1])}</small></span></button>`;}).join("")}</div></div>`;}
function cardSeq(C){const live=()=>UI.fight&&UI.fight.care===C;const q=s=>document.querySelector(s);
  setTimeout(()=>{if(!live())return;C.phase="hide";document.querySelectorAll(".cshc").forEach(e=>e.classList.remove("up"));const m=q(".care .need span");if(m)m.textContent="สับไพ่…";AU.sfx("ui");
    setTimeout(()=>{if(!live())return;C.phase="shuffle";const box=q(".cshuf");if(box)box.classList.add("spin");let n=0;
      const swap=()=>{if(!live())return;if(n++>=6){C.phase="pick";render();return;}let a=Math.floor(Math.random()*5),b=(a+1+Math.floor(Math.random()*4))%5;
        const ka=C.pos.indexOf(a),kb=C.pos.indexOf(b);C.pos[ka]=b;C.pos[kb]=a;for(const k of [ka,kb]){const e=q(`.cshc[data-k="${k}"]`);if(e)e.style.left=(C.pos[k]*20)+"%";}AU.sfx("miss");setTimeout(swap,320);};swap();},500);},2300);}
/* oil massage, two steps: slide the bottle all the way to pour the boxing oil, then tap the button as fast as you can before time runs out */
function careOilHTML(A,C){const left=C.done?0:C.t0?Math.max(0,Math.ceil(C.secs-(performance.now()-C.t0)/1000)):C.secs;const pour=C.phase==="pour";
  return `<div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>${C.done?`นวดได้ ${C.taps} ครั้ง · ${careSum(C)}`:pour?"ลากขวดไปทางขวาเพื่อราดน้ำมันมวย":"กดรัว ๆ เพื่อนวด ก่อนหมดเวลา!"}</span><div class="cslots"><span class="cslot oilcombo"><b class="num">${C.taps}</b></span><span class="cslot oiltime"><b class="num">${left}</b><small>วิ</small></span></div></div>
  ${pour?`<div class="oiltrack" data-oil="1"><span class="oilhint">▸ ▸ ▸</span><i class="oilend r">${PIX.water}</i><button class="oilknob" aria-label="ลากเพื่อราดน้ำมันมวย">${PIX.rub}</button></div>`
   :`<div class="carebtns one"><button class="oilrub ${C.done?"":"go"}" data-act="coil" ${C.done?"disabled":""}>${PIX.oilhand}<small>${C.done?`นวดได้ ${C.taps} ครั้ง`:"นวด!"}</small></button></div>`}</div>`;}
/* apply a corner result and remember how much it gave back, for the summary line */
function careApply(U,C){const A=U.F.A,s0=A.sta,h0=A.hp;applyCare(U.F,C.q);C.gain={sta:Math.round(A.sta-s0),hp:Math.round(A.hp-h0)};if(C.q>=1)U.careOK=(U.careOK||0)+1;}
function oilFinish(){const U=UI.fight,C=U&&U.care;if(!C||C.mode!=="oil"||C.done)return;C.done=true;const target=C.secs*2.6;C.q=Math.max(.15,Math.min(1.3,C.taps/target));careApply(U,C);AU.sfx(C.q>=1?"level":"ui");render();}
function oilTick(){const U=UI.fight,C=U&&U.care;if(!C||C.mode!=="oil"||C.done||!C.t0)return;const left=Math.max(0,Math.ceil(C.secs-(performance.now()-C.t0)/1000));const el=document.querySelector(".oiltime b");if(el)el.textContent=left;if(left<=0){oilFinish();return;}setTimeout(oilTick,150);}
function oilPoured(C){C.phase="rub";C.t0=performance.now();AU.sfx("level");render();setTimeout(oilTick,150);}
(function(){let drag=null;
  const pos=e=>{const t=document.querySelector(".oiltrack");if(!t)return null;const r=t.getBoundingClientRect();return Math.max(0,Math.min(1,(e.clientX-r.left-28)/(r.width-56)));};
  document.addEventListener("pointerdown",e=>{const k=e.target.closest&&e.target.closest(".oilknob");if(!k)return;const C=UI.fight&&UI.fight.care;if(!C||C.mode!=="oil"||C.phase!=="pour")return;e.preventDefault();drag=true;});
  document.addEventListener("pointermove",e=>{if(!drag)return;const C=UI.fight&&UI.fight.care;if(!C||C.phase!=="pour"){drag=null;return;}const x=pos(e);if(x==null)return;
    const k=document.querySelector(".oilknob");if(k)k.style.left=`calc(${(x*100).toFixed(1)}% - ${(x*56).toFixed(1)}px + 6px)`;if(x>=.95){drag=null;oilPoured(C);}});
  const up=()=>{if(!drag)return;drag=null;const k=document.querySelector(".oilknob");if(k){k.style.transition="left .2s";k.style.left="6px";setTimeout(()=>{if(k)k.style.transition="";},220);}};
  document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up);})();
function cornerHTML(F){const U=UI.fight,C=U.care,A=F.A,B=F.B,c=F.cards[F.cards.length-1]||[10,10];const rec=aiCorner(F,A,B);
  const note=B.sta<40?"คู่ชกเริ่มหมดแรง":A.sta<40?"เราแรงเหลือน้อย":A.rlanded<B.rlanded-2?"ยกนี้เราโดนเยอะ":B.legs>20?"ขาคู่ชกเริ่มหนัก":A.rage?"ยังเลือดเดือดอยู่!":"";
  const slots=(C.need||[]).map((k,i)=>{const g=C.got[i];return `<span class="cslot ${g==null?"":g===k?"ok":"bad"}">${PIX[k]}</span>`;}).join('<i class="arr">›</i>');
  return `<div class="corner px"><div class="chead"><b>พักยก ${F.round}</b><button class="chip cardbtn" data-act="cshow" aria-pressed="${!!U.cshow}">${U.cshow?F.cards.map((c,i)=>`ย${i+1} ${c[0]}–${c[1]}`).join(" · "):"ดูคะแนนยกที่ผ่านมา ▸"}</button><span class="chip">เข้าเป้า ${A.rlanded}–${B.rlanded}</span>${note?`<span class="chip warn">${note}</span>`:""}</div>
   ${C.mode==="off"?"":C.auto?`<div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>ครูแดงจัดการให้แล้ว · ${careSum(C)}</span></div></div>`:C.mode==="card"?careCardHTML(A,C):C.mode==="oil"?careOilHTML(A,C):`<div class="care"><div class="need"><img class="face sm" src="${faceSrc(A.f.id,"happy")}" alt=""><span>${C.done?(C.q>=1?"สดชื่นเต็มที่!":C.q>0?"ดีขึ้นนิดหน่อย":"ยังไม่ค่อยดีขึ้น"):"ทำตามลำดับนี้"}</span><div class="cslots">${slots}</div></div>
    <div class="carebtns">${Object.entries(CARE).map(([k,v])=>{const o=C.got.indexOf(k);return `<button data-act="care" data-v="${k}" ${C.done||o>=0?"disabled":""} class="${o>=0?"picked":""}">${o>=0?`<i class="ord">${o+1}</i>`:""}${PIX[k]}<small>${v.name}</small></button>`;}).join("")}</div></div>`}
   <div class="ohead"><b>คำสั่งยกถัดไป</b>${coachOn()?`<button class="btn sm" data-act="chint">คำแนะนำครู</button>`:""}</div>
   <div class="opts">${Object.entries(CORNER).map(([k,o])=>`<button data-act="cpick" data-v="${k}" aria-pressed="${U.pick===k}">${o.name}</button>`).join("")}</div>
   <div class="cfoot"><button class="towel" data-act="towel" aria-label="โยนผ้ายอมแพ้">${PIX.flag}<span>ผ้าขาว</span></button><button class="btn primary" data-act="cgo" ${U.pick?"":"disabled"}>เริ่มยก ${F.round+1} ▸</button></div>
</div>`;}
// v1.13: the coach reads the actual fight (cards, stamina, what landed) before giving a hint
// v1.21: only suggest what can actually be learned now, favour the carried 3, flag fresh unlocks, and vary the pick
function skillTip(f){if(hasTree(f.id)){const L=skillList(f.id),eq=equipped(f);const ok=L.filter(k=>!skillBlock(f,k.id).length);
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
function cornerRateH(F){const A=F.A,B=F.B,fa=A.f.a,fb=B.f.a,left=F.rounds-F.round;const diff=F.cards.reduce((x,c)=>x+c[0]-c[1],0);
  const kickH=(B.wl.kick||0)>=(B.wl.knee||0)+(B.wl.elbow||0)&&(B.wl.kick||0)>=2,inH=(B.wl.knee||0)+(B.wl.elbow||0)>(B.wl.kick||0)+1;
  const tired=A.sta<38,fresh=A.sta>=55,oppT=B.sta<42,ahead=diff>0,behind=diff<0,last=left<=1;const R={};
  R.push=tired?["r","แรงเราไม่พอจะบุก"]:inH&&fb.clinch>=fa.clinch?["y","ไล่คะแนนได้ แต่เดินเข้าไปเจอเข่า-ศอกเขา"]:behind&&fresh?["g","ต้องไล่คะแนน และยังมีแรง"]:oppT&&fresh?["g","คู่ชกแรงหมด จังหวะกดดัน"]:ahead&&last?["r","นำอยู่ บุกแล้วเสี่ยงโดนสวน"]:["y","ได้แต้มเพิ่ม แต่กินแรง"];
  R.counter=B.landed>A.landed+2?["g","คู่ชกบุกเข้ามาเยอะ รอสวนได้"]:behind&&last?["r","ยกสุดท้ายแล้ว รออย่างเดียวไม่ทัน"]:tired?["y","ประหยัดแรง แต่แต้มขึ้นช้า"]:["y","ปลอดภัย แต่ออกอาวุธน้อยลง"];
  R.range=inH&&fa.kick>=fb.clinch-1?["g","คู่ชกชอบวงใน ยืนไกลแล้วเตะ"]:kickH&&fb.kick>fa.kick?["r","เขาเตะเก่งกว่า ยืนไกลเสียเปรียบ"]:["y","ใช้ได้ถ้าเตะเราดีกว่า"];
  R.clinch=kickH&&(fa.knee+fa.clinch)/2>=fb.kick-1?["g","เขาเตะคุมระยะ เข้าประชิดตัดลูกเตะ"]:fb.clinch>fa.clinch+2?["r","คลินช์เขาแน่นกว่าเรา"]:["y","ได้ผลถ้าเข่าเราดี"];
  R.defend=tired?["g","ฟื้นแรงก่อน ค่อยไปต่อยกหน้า"]:ahead&&last?["g","นำอยู่ ยกสุดท้าย เก็บให้จบ"]:behind?["r","ตามอยู่ ป้องกันอย่างเดียวแพ้แน่"]:["y","ปลอดภัย แต่แต้มไม่เพิ่ม"];
  R.none=behind&&last?["r","ตามอยู่ แผนเดิมอาจไม่พอ"]:!behind&&!tired?["g","แผนเดิมยังได้ผล"]:["y","ไม่เปลี่ยนอะไร"];
  return R;}
// v1.82.6: colours come from simulating each order to the end; the rule-of-thumb reason is kept only when it agrees
function cornerTrue(F){const U=UI.fight;U.otrue=U.otrue||{};if(!U.otrue[F.round]){const o=typeof cornerOdds==="function"?cornerOdds(F,48):null;U.otrue[F.round]=o;}return U.otrue[F.round];}
function cornerRate(F){const H=cornerRateH(F),O=cornerTrue(F);if(!O)return H;const ks=Object.keys(O),best=Math.max(...ks.map(k=>O[k])),worst=Math.min(...ks.map(k=>O[k]));const R={};
  const flat=best-worst<.08;
  const top=ks.find(k=>O[k]===best); /* v1.89.3: when all orders are about the same, only the best one is green (was: everything green) */
  for(const k of ks){const d=best-O[k],c=flat?(k===top?"g":"y"):d<=.05?"g":d<=.15?"y":"r";
    const why=flat&&c==="y"?"ได้ผลใกล้เคียงทางที่ดีที่สุด เลือกทางนี้ก็ไม่เสียหาย":H[k]&&H[k][0]===c?H[k][1]:c==="g"?(flat?"ทุกทางใกล้เคียงกัน ทางนี้ดีที่สุดนิดหน่อย":H[k]&&H[k][0]!=="r"?H[k][1]:"ครูลองคิดหลายทางแล้ว ทางนี้โอกาสดีที่สุด")
      :c==="r"?(H[k]&&H[k][0]==="y"?H[k][1]+" · ครูคิดแล้วเสียเปรียบชัด":"ครูลองคิดแล้ว ทางนี้โอกาสต่ำกว่าทางอื่นชัดเจน")
      :(H[k]&&H[k][0]==="g"?"ฟังดูดี แต่ครูคิดแล้วยังไม่ใช่ทางที่ดีที่สุด":H[k]?H[k][1]:"พอได้");
    R[k]=[c,why];}
  return R;}
// v1.32: the coach also guesses a win chance per order; how close the guess is depends on his training level
const ODDS_ERR=[0,15,10,6],ODDS_W=[0,30,20,12];
function cornerPct(F){const U=UI.fight;U.odds=U.odds||{};if(!U.odds[F.round]){const o=cornerTrue(F);if(!o)return null;
    const err=ODDS_ERR[G.fac.daeng||1]||14,r=mulberry32((F.seed||1)+F.round*101);const ks=Object.keys(o),noisy=ks.map(k=>clamp(Math.round(o[k]*100+(r()*2-1)*err),1,99)).sort((x,y)=>y-x),order=ks.slice().sort((x,y)=>o[y]-o[x]);U.odds[F.round]=Object.fromEntries(order.map((k,i)=>[k,noisy[i]]));}
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
function coachNote(F,me){const A=F.A,B=F.B,r=F.result,w=r.win==="A",d=r.win==="D",gap=(B.f.a&&A.f.a)?ovr(B.f)-ovr(A.f):0;
  // v1.82.6: draws are not losses, a clean KO is not "took a beating", and the fix names a real training program
  const W={punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"},bt=Object.entries(B.wl).sort((x,y)=>y[1]-x[1])[0],cp=typeof counterPreset==="function"?counterPreset(B.f):null,fix=cp&&PRESETS[cp]?` ลองซ้อม "${PRESETS[cp].name}"`:"";
  if(w&&/KO|TKO/.test(r.type))return A.hp<55?`สวยมาก ${me.name}! แต่โดนไปไม่น้อย สัปดาห์หน้าพักฟื้นก่อน`:`จบสวยมาก ${me.name}! แทบไม่เจ็บตัวเลย ซ้อมต่อได้ตามปกติ`;
  if(w&&gap>3)return `ชนะคู่ที่เก่งกว่าเราได้ ครูภูมิใจมาก ${me.name}!`;
  if(w&&F.cards.every(c=>c[0]>=c[1]))return "คุมเกมได้ทุกยก ครูภูมิใจ";
  if(w)return A.sta<30?"ชนะแล้ว แต่แรงเกือบหมดช่วงท้าย เพิ่มฟิตร่างกายอีกหน่อย":B.landed>A.landed?"ชนะแต่โดนเยอะกว่า การ์ดยังต้องแน่นกว่านี้":"ชนะแล้ว ดูอาวุธที่ได้ผลแล้วซ้อมต่อจากตรงนั้น";
  if(d)return "เสมอ ไม่แพ้ไม่ชนะ ยกที่เสียคะแนนคือจุดที่ต้องแก้ ไฟต์หน้าเอาคืน";
  if(gap>4)return `${B.f.name}เก่งกว่าเราชัดเจน แพ้แบบนี้ไม่ต้องอาย ฝึกให้ค่ารวมขึ้นอีกหน่อยค่อยเจอระดับนี้`;
  if(A.sta<30)return "หมดแรงช่วงท้าย เพิ่มโปรแกรมฟิตร่างกาย และพอนำแล้วสั่งเก็บคะแนนบ้าง";
  if(!scouted(B.f.id)&&B.f.camp!=="quest")return `เราไม่รู้ทาง${B.f.name}มาก่อน คราวหน้าดูเทป แล้วซ้อมแก้ทาง${fix}`;
  if(bt&&bt[1]>=3)return `โดน${W[bt[0]]}ของเขาเข้าไป ${bt[1]} ครั้ง ต้องแก้ทางนี้${fix}`;
  if(B.landed>A.landed*1.3)return `โดนมากกว่าชัดเจน บนเวทีลองสั่งรอสวนหรือคุมระยะ${fix}`;
  return "แพ้ไม่ใช่จุดจบ ครูยังเชื่อในตัวเธอ ปรับแผนแล้วกลับมาใหม่";}
function rinNote(F){const A=F.A;const best=Object.entries(A.wl).sort((a,b)=>b[1]-a[1])[0];return `เข้าเป้า ${A.landed}/${A.thrown} ครั้ง อาวุธที่ได้ผลที่สุดคือ${WNAME[best[0]]} (${best[1]} ครั้ง)`;}
let LASTF=null; /* v1.80: the last fight, read by the gauntlet to carry HP between bouts */
function fightStart(quick){const U=UI.fight,b=U.b;AU.resume();
  U.F=newFight(b.ev&&typeof loyBoost==="function"?loyBoost(G.F[b.a]):G.F[b.a],G.F[b.b],{seed:(G.seed+G.week*131+b.b.length*7)>>>0,rounds:b.rounds,tier:b.tier,planA:U.plan,gprepA:b.gprep||null,forceRage:!quick&&!(G.flags&&G.flags.rageShown)});U.F.dai=(DIFF[G.diff||"normal"]||DIFF.normal).ai;if(b.ev)U.F.ev=1;U.F.live=!quick;
  if(b.wai==="phrom")U.F.A.careMor=.02;if(b.wai==="phra")U.F.A.careMor=.01;if(b.cheer)U.F.A.mor+=b.cheer*.01;U.F.A.mor+=trustBonus(G.F[b.a]);{const fam=(G.fam||{})[b.b]||0;if(fam)U.F.A.mor+=fam*.015;}setTactics(U.F,U.tac);if(b.ev)U.F.A.sta=100; /* v1.89.31: event bouts ignore camp fatigue — the ladder shows full stamina, so start from it */if(b.carry){U.F.A.hp=Math.min(U.F.A.hp,b.carry.hp);U.F.A.sta=Math.min(U.F.A.sta,b.carry.sta);}LASTF=U.F;
  if(quick){FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);const F=U.F;while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);const lg=fightRound(F);U.shown.push({rd:`ยกที่ ${F.round}`},...lg);}fightEnd();return;}
  FS.init(null,b.bg||TIER_BG[b.tier]||"bg_local.webp",G.F[b.a],G.F[b.b]);AU.setTempo(104);AU.setHeat&&AU.setHeat(0);AU.startMusic();playRound();}
function playRound(){const U=UI.fight,F=U.F;if(FS.ground)FS.ground();fightMusic(F);F.B.instr=aiCorner(F,F.B,F.A);F.A.autoSkill=false;if(U.brawl){F.A.instr=aiCorner(F,F.A,F.B);F.A.autoSkill=true;}roundBegin(F);
  const rng=mulberry32(F.seed+F.round);U.rng=rng;U.tiredShown=false;
  F.tier=F.tier||U.b.tier;const sl=startLine(F,rng);U.pending=[{rd:`ยกที่ ${F.round}`,cap:{text:sl.text,side:"",heat:sl.heat},bell:true}];
  U.stage="playing";fightMusic(F);render();tick();}
// v1.19: pull the next exchange only when the last one has been shown, so a skill pressed now shapes what follows
function feedRound(){const U=UI.fight,F=U.F;
  while(!U.pending.length&&!roundDone(F)){U.pending.push(...fightEx(F));
    if(!U.tiredShown&&F.ex>=8){for(const s of [F.A,F.B])if(s.sta<30){U.pending.push({tired:true,cap:{text:COM.tired[Math.floor(U.rng()*2)].replace("{x}",s.name),side:""}});U.tiredShown=true;}}}
  return U.pending.length>0;}
function fskill(id){const U=UI.fight;if(!U||U.stage!=="playing")return;const e=useSkill(U.F,U.F.A,id);if(!e)return;U.pending.unshift(e);clearTimeout(U.timer);tick();}
function skillBarHTML(){const U=UI.fight,F=U.F;const L=fightSkills(F.A);const used=F.A.skUsed||{};if(!L.length)return `<span class="meta skhint">ยังไม่มีสกิล · เลเวลอัปแล้วไปอัปสกิลที่ข้อมูลนักมวย</span>`;const slots=[0,1,2].map(i=>L[i]);
  return `<div class="skbar2" role="group" aria-label="สกิล${F.A.skRound?" (ยกนี้ใช้แล้ว)":""}">${slots.map(k=>k?`<button class="skbtn2 ${k.k}" data-act="fskill" data-v="${k.id}" ${used[k.id]||F.A.skRound||F.over?"disabled":""} title="${esc(k.name)} · ${esc(SKILL_KIND_NAME[k.k])}">${PIX["sk_"+k.k]}<b>${esc(k.name)}</b></button>`:`<span class="skbtn2 empty">ว่าง</span>`).join("")}</div>`;}function sideOf(e,F){if(e.s==="A"||e.s==="B")return e.s;if(e.mside)return e.mside;return e.an===F.A.name?"A":"B";}
/* v1.89.8: sarama follows the fight — slow feeling-out in round 1, fastest in the deciding round, a surge late in each round and after a knockdown.
   5-round bouts keep the stadium shape: 3–4 hottest, 5 eases off when someone is clearly ahead (dancing the round out). */
function fightMusic(F,surge){if(!F||!AU.setTempo)return;const R=Math.max(1,F.rounds||3),r=Math.min(F.round||1,R);
  let p=R<=1?1:(r-1)/(R-1);if(R>=5){const sc=F.cards.reduce((x,c)=>x+c[0]-c[1],0);p=[0,.25,.75,1,Math.abs(sc)>=2?.45:1][r-1];}
  const late=(F.ex||0)>=EX_PER_ROUND*.7?1:0,kd=F.musicKd&&performance.now()-F.musicKd<9000?1:0;
  AU.setTempo(Math.round(104+p*54+late*8+kd*10+(surge||0)*4));AU.setHeat&&AU.setHeat(Math.round(p*2)+(late||kd?1:0));}
function tick(){const U=UI.fight;if(!U||U.stage!=="playing")return;
  if(U.brawl&&U.brawl.asked<BRAWL_AT.length&&(U.F.ex||0)>=BRAWL_AT[U.brawl.asked]){U.stage="talk";U.brawl.q=brawlPrompt(U);AU.sfx("ui");render();return;}
  if(!U.pending.length&&!feedRound()){roundFinish(U.F);roundEnd();return;}
  const e=U.pending.shift();U.shown.push(e);const F=U.F;const now=performance.now();let wait=1500;
  if(e.bell){AU.sfx("bell");U.caption=e.cap;}
  else if(e.tired){U.caption=e.cap;wait=1300;}
  else if(e.ev){const sd=sideOf(e,F);FS.play({...e,side:sd},now);U.caption={text:comLine(e,F,U.rng),side:e.ev==="miss"?"":sd,heat:fightHeat(F)};
    if(e.ev!=="skill"){const sp=spPick({...e},sd,F,U.rng);if(sp){FS.special(sp,F.round||1,now);const n=F[sp.side].f.name,R=[`ท่าไม้ตายมาแล้วครับ!! ${sp.name}!!`,`${n} ปล่อย${sp.name}!! คนดูลุกทั้งสนาม!`,`นี่แหละ${sp.name}!! ของจริงครับท่านผู้ชม!!`];
      U.caption={text:R[Math.floor(U.rng()*R.length)],side:sp.side,heat:fightHeat(F)};AU.cheer(1);U.spWait=1900;}}
    if(e.ev==="hit"||e.ev==="counter"){AU.sfx(e.w||"punch");if(e.crit)AU.cheer(.8);}
    if(e.ev==="miss"){AU.sfx("miss");wait=1150;}
    if(e.ev==="kd"){AU.sfx("kd");wait=2300;F.musicKd=performance.now();}
    if(e.ev)fightMusic(F);
    if(e.ev==="ko"){AU.sfx("kd");AU.cheer(1);wait=2600;}
    if(e.ev==="cut")wait=1700;
    if(e.ev==="wake"){AU.sfx("kd");AU.cheer(.9);wait=2200;}
    if(e.ev==="skill"&&e.skrow>=4&&SPECIALS[e.rid]){/* v1.88: a Lv.14/Lv.22 move pressed (or used by the AI) plays the heroine's special sheet */
      const mv=e.skk==="atk"?spSheet(e.rid,e.w):e.skk==="def"?spSheet(e.rid,null,"def"):null;FS.special({side:sd,mv,w:e.w,kind:e.skk,name:e.skn},F.round||1,now);
      U.caption={text:`${e.an} ใช้ท่าไม้ตาย "${e.skn}"!!`,side:sd,heat:fightHeat(F)};AU.sfx("kd");AU.cheer(1);wait=2000;}
    else if(e.ev==="skill"){U.cutin={id:e.rid,name:e.an,side:sd,t:now,skill:e.skn,kind:e.skk,w:e.w};AU.sfx(e.skk==="rec"?"level":"kd");AU.cheer(.7);wait=2000;setTimeout(()=>{if(UI.fight&&UI.fight.cutin&&UI.fight.cutin.t===now){UI.fight.cutin=null;render();}},1900);}
    if(e.ev==="rage"){if(sd==="A"){G.flags=G.flags||{};G.flags.rageShown=true;}U.cutin={id:e.rid,name:e.an,side:sd,t:now};AU.sfx("kd");AU.cheer(1);wait=2200;setTimeout(()=>{if(UI.fight&&UI.fight.cutin&&UI.fight.cutin.t===now){UI.fight.cutin=null;render();}},2000);}}
  if(U.spWait){wait=Math.max(wait,U.spWait);U.spWait=0;}
  render();U.timer=setTimeout(tick,(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches?400:wait)/(UI.speed===2?2:1));}
function fskip(){const U=UI.fight;clearTimeout(U.timer);while(!roundDone(U.F))U.pending.push(...fightEx(U.F));const rest=U.pending.filter(x=>!x.bell&&!x.tired);U.shown.push(...rest);U.pending=[];
  const ko=rest.find(x=>x.ev==="ko");if(ko)FS.play({...ko,side:sideOf(ko,U.F)},performance.now());roundFinish(U.F);roundEnd();}
function roundEnd(){const U=UI.fight;clearTimeout(U.timer);const F=U.F;if(U.brawl){brawlEnd();return;}
  if(F.over){fightEnd();return;}AU.sfx("bell1");U.caption={text:COM.end[Math.floor(Math.random()*2)],side:""};U.stage="corner";U.care={mode:"order",need:careNeeds(F),got:[],done:false}; /* v1.89.1: only the order puzzle, as before v1.87.6; card / oil games stay in the code for an outside mini-game later */ /* v1.89.1: corner mini-games are off for now (too tiring every break) — coach Daeng gives a normal corner; newCare/cardSeq/oil stay for an outside mini-game later */U.pick=null;U.hint=false;if(F.A.hp<35&&!U.towelAsked&&F.round<F.rounds){U.towelAsked=true;UI.confirmTowel=true;UI.towelCoach=true;AU.sfx("miss");}render();}
/* v1.88 corner care comes in three flavours: the order puzzle, a face-down card, or a fast oil massage */
function newCare(F){const r=Math.random(),mode=r<.5?"order":r<.75?"card":"oil";
  if(mode==="card")return {mode,deck:[1.4,1,1,.6,-.3],pos:[0,1,2,3,4],phase:"show",flip:-1,done:false};
  if(mode==="oil")return {mode,taps:0,t0:0,done:false,secs:F.round<=1?10:F.round===2?9:8,phase:"pour"};return {mode,need:careNeeds(F),got:[],done:false};}
/* v1.88: after the towel — she is safe, but it hurts her pride (morale −8 is applied in applyResult) */
function towelScene(f){const L={kati:["หนูยังยืนได้นะคะครู… ปู่ไม่เคยโยนผ้า","sad"],mali:["มะลิยังไหวค่ะ! …ทำไมโยนล่ะคะ","sad"],rin:["ข้อมูลบอกว่าฉันยังมีโอกาสสิบสองเปอร์เซ็นต์ …ฉันเข้าใจค่ะ แต่ไม่ได้แปลว่าฉันชอบ","sad"],ploy:["…ครั้งแรกในชีวิตที่มีคนโยนผ้าให้พี่ จำไว้นะ","angry"],fah:["ฟ้ายังไม่แพ้!! ใครโยนผ้า!! …ครูเหรอ ฟ้าโกรธครูสามวัน","angry"]}[f.id];
  const R={kati:"ปู่ไม่เคยมีหลานให้ห่วงแบบนี้ไง",mali:"เพราะครูอยากเห็นมะลิยิ้มได้พรุ่งนี้ ไม่ใช่นอนโรงพยาบาล",rin:"ไม่ต้องชอบ แค่หายเจ็บก่อนแล้วค่อยมาเถียงครู",ploy:"จำไว้เลย ครูก็จะจำว่าพลอยยังยืนอยู่",fah:"สามวันพอ วันที่สี่มาซ้อมด้วย"}[f.id]||"ไม่เป็นไรนะ ไฟต์หน้ายังมี";
  const me=L?{n:f.id,f:L[1],l:"fight",t:L[0]}:{n:"npc",who:f.name,t:"หนูยังไหว… แต่ก็ขอบคุณค่ะ"};
  return [{n:"coach",t:`ครูขอโทษนะ ${f.name} ครูไม่อยากเห็นหนูล้มลงไปมากกว่านี้`},me,{n:"coach",t:R},{n:"nar",t:`${f.name} ไม่บาดเจ็บหนักเพิ่ม แต่กำลังใจลดลง 8`}];}
/* v1.89.11: Valentine brawl — both sides on auto for one round; three times the player can shout from ringside */
const BRAWL_AT=[2,6,9];
function openBrawl(a,b,hard,done){AU.resume&&AU.resume();UI.modal=null;
  UI.fight={b:{a,b,tier:"exhibition",rounds:1,brawl:true,hard,bg:gymBg()},done,stage:"pre",plan:"balanced",tac:{focus:"auto",pace:"steady",target:"body"},F:null,shown:[],pending:[],timer:null,res:null,caption:null,brawl:{sc:0,asked:0,q:null,stopped:false}};
  fightStart(false);}
function brawlPrompt(U){const k=U.brawl.asked,T=BRAWL_TALK[k],who=k===0?U.b.a:k===1?U.b.b:null,rng=mulberry32((U.F.seed||1)+k*97);
  return {ctx:T[0],who,line:who?vx(G,who,BRAWL_MID):"",opts:[...T[1]].sort(()=>rng()-.5)};}
function brawlTalkHTML(){const U=UI.fight,q=U.brawl&&U.brawl.q;if(!q)return "";
  return `<div class="btalk px" role="dialog" aria-label="ตะโกนห้าม"><p class="meta">${esc(q.ctx)}</p>${q.who?`<div class="btline"><img class="face sm" src="${faceSrc(q.who,"angry")}" alt=""><span><b>${esc(G.F[q.who].name)}</b>${esc(q.line)}</span></div>`:""}
   <small class="meta">ตะโกนจากข้างเวที (${U.brawl.asked+1}/${BRAWL_AT.length})</small><div class="btopts">${q.opts.map((o,i)=>`<button class="copt" data-act="fbrawl" data-v="${i}">${esc(o[0])}</button>`).join("")}</div></div>`;}
function brawlPick(i){const U=UI.fight;if(!U||!U.brawl||!U.brawl.q)return;const o=U.brawl.q.opts[i];if(!o)return;
  U.brawl.sc+=o[1];U.brawl.q=null;U.brawl.asked++;U.caption={text:o[2],side:""};AU.sfx(o[1]>=2?"level":"ui");if(o[1]<0)AU.cheer(.8);
  if(U.brawl.asked>=BRAWL_AT.length&&U.brawl.sc>=5){U.brawl.stopped=true;U.stage="playing";render();U.timer=setTimeout(brawlEnd,1800);return;}
  U.stage="playing";render();U.timer=setTimeout(tick,1600/(UI.speed===2?2:1));}
function brawlEnd(){const U=UI.fight;if(!U||U.stage==="done")return;clearTimeout(U.timer);U.stage="done";const F=U.F;AU.sfx("bell1");
  U.caption={text:U.brawl.stopped?"ทั้งคู่ลดการ์ดลงพร้อมกัน ยกนี้จบแค่นี้":"หมดยก! ไม่มีใครยอมใคร",side:""};render();}
function brawlDoneHTML(){const U=UI.fight,B=U.brawl;
  return `<div class="res px brawlres"><h3>${B.sc>=5?"ห้ามทัน":"ห้ามไม่อยู่"}</h3><p class="meta">${B.sc>=5?"คำพูดของคุณทำให้ทั้งคู่ใจเย็นลง":"ทั้งคู่ไม่ฟังคุณเลย"} · ไฟต์นี้ไม่นับผล ไม่มีใครบาดเจ็บ</p>
   <button class="btn primary big" data-act="fbrawldone">ไปต่อ ▸</button></div>`;}
function fightEnd(){const U=UI.fight;if(U.brawl){brawlEnd();return;}U.stage="done";{const w=U.F.result.win;U.bubble=postBubble(U.F.B.f,w==="A"?"lose":w==="B"?"win":"draw",(U.F.seed>>>3)+G.week+[...U.F.B.f.id].reduce((a,c)=>a*31+c.charCodeAt(0)|0,0)+(G.cal||[]).length*7,U.F.A.f);}AU.startMusic("hub");setTimeout(()=>AU.sfx(U.F.result.win==="A"?"win":U.F.result.win==="B"?"lose":"bell1"),200);
  const me=G.F[U.b.a];if(me.injury&&!U.b.ev)me.trust=clamp(me.trust-12,0,100);
  U.res=applyResult(G,U.F,U.b);if(U.b.dm)U.b.result=dmWinFrom(U.F);if(!U.b.ev)me.prepBonus=false;if(U.b.tier==="final"||U.b.tier==="semi")finishBracket(G,U.b,U.F);
  const r=U.F.result;if(FS.A){if(r.win==="A"){FS.A.win=true;FS.A.anim="win";}else if(r.win==="B"){FS.B.win=true;FS.B.anim="win";}}
  AU.cheer(r.win==="A"?1:.4);
  U.caption={text:r.win==="A"?`${me.name} ชนะ! ${r.type}`:r.win==="D"?"เสมอกันไป":`${G.F[U.b.b].name} ชนะ ${r.type}`,side:r.win==="A"?"A":"B"};
  if(!U.b.ev)G.log.push(`${me.name} ${r.win==="A"?"ชนะ":r.win==="B"?"แพ้":"เสมอ"} ${G.F[U.b.b].name} (${r.type})`);
  if(G.F[U.b.b].canon){G.faceoffLast=G.faceoffLast||{};G.faceoffLast[`${U.b.a}_${U.b.b}`]={win:r.win,week:G.week};
    G.faceoffStats=G.faceoffStats||{};const key=`${U.b.a}_${U.b.b}`,s=G.faceoffStats[key]=G.faceoffStats[key]||{w:0,l:0,d:0};s[r.win==="A"?"w":r.win==="B"?"l":"d"]++;}
  {const op=G.F[U.b.b];if(r.win!=="D"&&!TIER[U.b.tier].off&&(op.canon||U.b.tier==="semi"||U.b.tier==="final"||/KO/.test(r.type)))G.lastBig={a:me.id,b:op.id,win:r.win,wk:G.week,absWeek:gameWeek(G),shown:false};}
  if(r.win==="B"&&!U.b.ev){const F=U.F,st=s=>({landed:s.landed,thrown:s.thrown,wl:{...s.wl},sta:Math.round(s.sta),kd:s.kd,legs:Math.round(s.legs)});
    G.losses=(G.losses||[]).concat([{wk:G.week,absWeek:gameWeek(G),a:me.id,b:U.b.b,type:r.type,round:r.round,cards:F.cards.map(c=>[...c]),A:st(F.A),B:st(F.B),sc:scouted(U.b.b),od:Math.round(ovr(G.F[U.b.b])-ovr(me)),plan:U.plan||"balanced",tg:(F.A.tac&&F.A.tac.target)||"",care:U.careOK||0}]).slice(-6);}
  U.afterScene=r.towel?towelScene(me):(prodigyResultScene(G,U.b,r.win)||vectorResultScene(G,U.b,r.win));
  save();render();}

// ---------- actions ----------
function giftScene(id,res){const f=G.F[id];const mood=res.t==="dislike"?"pout":res.t==="love"?"flustered":"happy";
  playScene([{n:id,f:mood,l:"casual",t:(res.n&&res.t!=="dislike"&&giftAgainLine(id,res.t,res.n,res.g))||(GIFTS[res.g].souv&&souvLine(id,res.g,res.t))||(GIFT_TALK_PERSONAL[id]&&GIFT_TALK_PERSONAL[id][res.g])||((GIFT_TALK[id]&&GIFT_TALK[id][res.g])||GIFT_LINES[id][res.t])},{n:"nar",t:res.gain>0?(res.n>=2?`ความสนิทกับ${f.name} +${res.gain} · ได้บ่อยไปนิด เลยขึ้นน้อยลง`:`ความสนิทกับ${f.name} +${res.gain}`)
      :res.t==="dislike"?`${f.name}รับไว้ด้วยรอยยิ้ม แต่อาจยังไม่ใช่ของโปรด · ความสนิทไม่เปลี่ยน`:heartCapped(G,f)?`${f.name}ดีใจมาก · หัวใจเต็มขั้นของบทนี้แล้ว`:f.bond>=100?`${f.name}ดีใจมาก · ความสนิทเต็มหลอดแล้ว`:`${f.name}ดีใจ แต่ช่วงนี้ได้ของชิ้นนี้บ่อยไปนิด ลองสลับของดูนะ`},
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
  loadslot:d=>{backupSlot(+d.v);const s0=loadSlot(+d.v);if(!s0)return;const s=safeFix(s0);if(!s){toast("เซฟนี้เปิดกับเวอร์ชันนี้ไม่ได้ ข้อมูลยังอยู่ครบ ไม่ถูกลบ");return;}G=s;const pk=G.F.ploy&&G.F.ploy.skills;if(pk&&pk.korat){G.F.ploy.skills={kr_swing:2,captain:1};}UI.slot=+d.v;UI.tab="home";UI.modal=null;UI.advCache={};withArt(()=>{AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}maybeWhatsNew();render();});},
  askdelslot:d=>{UI.delSlot=+d.v;render();},canceldel:()=>{UI.delSlot=null;render();},
  delslot:()=>{clearSave(UI.delSlot);UI.delSlot=null;if(!loadSave())UI.modal=null;render();},
  beginNew:i=>{UI.slot=i;UI.modal=null;AU.startMusic("hub");UI.creator={name:"",...CHIBI.randomManager(Math.random),gender:"m",diff:"normal",outfit:"tee",hat:"none",glasses:"none"};UI.modal=null;render();},
  fullscreen:()=>{const d=document,e=d.documentElement,no=()=>toast("เบราว์เซอร์นี้เปิดเต็มจอไม่ได้ ลองเพิ่มเกมลงหน้าจอหลักแทน");
    try{if(fsOn()){(d.exitFullscreen||d.webkitExitFullscreen).call(d);}else{const r=(e.requestFullscreen||e.webkitRequestFullscreen).call(e,{navigationUI:"hide"});if(r&&r.catch)r.catch(no);}}catch(x){no();}},
  copyseed:()=>{const v=G.seedText||String(G.seed);const ok=()=>toast("คัดลอก seed แล้ว: "+v);try{navigator.clipboard.writeText(v).then(ok,()=>toast("seed: "+v));}catch(e){toast("seed: "+v);}},
  petplay:d=>{const i=+d.v,p=(G.pets||[])[i];if(!p||!petPlay(G,i))return;AU.sfx&&AU.sfx("ui");const PL={cat:"นอนหงายให้เกาพุง",dog:"วิ่งไล่ลูกบอลรอบเวที",rooster:"ขันโชว์จนทุกคนหัวเราะ",turtle:"ยื่นหัวออกมาให้ลูบช้า ๆ"};
    toast(`${p.name} ${PL[p.k]} · ${PETS[p.k].eff}`);save();render();},
  petnamesave:d=>{const p=(G.pets||[])[+d.v];const v=((document.getElementById("petname")||{}).value||"").trim();if(p&&v){p.name=v.slice(0,12);toast(`ตั้งชื่อว่า "${p.name}" แล้ว`);}UI.modal=UI.modalQ||null;UI.modalQ=null;save();render();},
  cardhint:d=>{const C=CARDS[d.v];if(C)toast(C.g?"การ์ดใบนี้ได้จากตู้กาชา":`วิธีได้: ${C.hint||"ติดตามเนื้อเรื่องไปเรื่อย ๆ"}`);},
  petren:d=>{UI.modal={type:"petname",i:+d.v};render();setTimeout(()=>{const el=document.getElementById("petname");if(el){el.focus();el.select();}},60);},
  gacha:()=>{const r=gachaPull(G);if(!r)return;AU.sfx&&AU.sfx(CARDS[r.id].r==="SSR"||CARDS[r.id].r==="SR"?"level":"ui");save();UI.modal={type:"gacha",res:r};render();},
  album:()=>{const from=UI.modal&&UI.modal.type;if(from!=="card"&&from!=="gbox")UI.albY=0;UI.modal={type:"album"};render();albRestore();},
  waipick:d=>{const R=runWaiKhru(G,d.v);if(!R)return;save();UI.wkSkip=false;UI.wkT0=performance.now();UI.modal={type:"waikhru",ph:"rite"};AU.sfx&&AU.sfx("bell");render();},
  waiskip:()=>{UI.wkSkip=true;document.querySelectorAll(".wkrow,.wkgo").forEach(e=>e.classList.add("now"));},
  waidone:()=>{UI.modal=null;UI.wkSkip=false;AU.startMusic&&AU.startMusic("hub");const d=UI.wkDone;UI.wkDone=null;save();if(d)d();else render();},
  contestskip:()=>{UI.ctSkip=true;document.querySelectorAll(".ctrow").forEach(e=>e.classList.add("now"));},
  contestaward:()=>{const R=(G.contests||{})[G.season||1];UI.ctSkip=false;UI.ctT0=performance.now();UI.modal={type:"contest",ph:"award"};render();
    if(R&&R.rank===1){setTimeout(()=>{if(UI.modal&&UI.modal.type==="contest"&&UI.modal.ph==="award"&&!UI.ctSkip)AU.sfx&&AU.sfx("champ");},6800);for(let i=0;i<6;i++)setTimeout(()=>{if(UI.modal&&UI.modal.type==="contest"&&UI.modal.ph==="award")AU.sfx&&AU.sfx("pop");},7200+i*1150);}
    else setTimeout(()=>{if(UI.modal&&UI.modal.type==="contest")AU.sfx&&AU.sfx("ui");},6800);},
  contestdone:()=>{const R=(G.contests||{})[G.season||1];UI.modal=null;UI.ctSkip=false;if(R&&R.rank===1)AU.sfx&&AU.sfx("level");const d=UI.contestDone;UI.contestDone=null;save();if(d)d();else render();},
  cardinfo:d=>{if(!CARDS[d.v])return;AU.sfx&&AU.sfx("ui");const fromAlb=UI.modal&&UI.modal.type==="album";albKeep();UI.modal={type:"card",id:d.v,back:fromAlb?"album":null};render();},
  carddust:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o)return;const k=Math.min(+d.n||1,o.spare||0);if(!k)return;
    UI.modal={type:"confirm",title:"ย่อยการ์ดเป็นเศษดาว?",ok:`ย่อย +✦${DUST_OF[C.r]*k}`,no:"ยกเลิก",noAct:"cardinfo",noV:d.v,yes:"carddustok",id:d.v,k,
      html:`<div class="px confirm"><b>${esc(C.t)} ×${k}</b><p class="meta">ได้เศษดาว ✦ ${DUST_OF[C.r]*k} · ใบซ้ำเหลือ ${(o.spare||0)-k} ใบ</p><p class="meta">การ์ดใบหลัก ขั้นการ์ด และเรื่องราวยังอยู่ครบ ย่อยแล้วเอาคืนไม่ได้</p>${(o.lv||1)<CARD_MAX_LV?`<p class="meta goldt">การ์ดนี้ยังอัปขั้นได้อีก ${CARD_MAX_LV-(o.lv||1)} ขั้น ด้วยใบซ้ำ</p>`:""}</div>`};render();},
  cardup:d=>{const C=CARDS[d.v],F=G.F[C.c],b0=F?F.bond||0:0;const lv=levelCard(G,d.v);if(!lv)return;const db=F?Math.round(((F.bond||0)-b0)*10)/10:0;AU.sfx&&AU.sfx("level");save();UI.cardFx=d.v;toast(`${C.t} อัปเป็น Lv.${lv}${db>0?` · ${F.name} ความสนิท +${db}`:""}`);UI.modal={type:"card",id:d.v};render();},
  carddustok:()=>{const m=UI.modal;if(!m||m.yes!=="carddustok")return;const d=dustCard(G,m.id,m.k);if(d){AU.sfx&&AU.sfx("level");save();toast(`ได้เศษดาว ✦ ${d}`);}UI.modal={type:"card",id:m.id};render();},
  cardplay:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o)return;o.seen=true;o.rev=C.rev||0;const ep=(o.lv||1)>=2&&C.lv2;if(ep)o.lvSeen=Math.max(o.lvSeen||1,2);G.cardPend=(G.cardPend||[]).filter(x=>x!==d.v);save();UI.modal=null;const nw=d.from==="new";
    playScene(ep?C.steps.concat([{n:"nar",t:"✦ บทส่งท้าย · Lv.2"}],C.lv2):C.steps,()=>{UI.modal=nw?((G.cardPend||[]).length?{type:"cardnew"}:null):{type:"card",id:d.v};render();},{bg:C.bg,look:"casual"});},
  cardspecial:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o||!C.lv3||(o.lv||1)<3)return;o.lvSeen=3;save();UI.modal=null;playScene([{n:"nar",t:`✦ ฉากพิเศษ · ${C.lv3t||""}`}].concat(C.lv3),()=>{UI.modal={type:"card",id:d.v};render();},{bg:C.bg,look:"casual"});},
  cardmg:d=>{const C=CARDS[d.v],o=(G.cards||{})[d.v];if(!C||!o||!C.mg||(o.lv||1)<3)return;BAG.openCard(C.mg,d.v);},
  cardlater:()=>{(G.cardPend||[]).shift();save();UI.modal=(G.cardPend||[]).length?{type:"cardnew"}:null;render();},
  cancelCreate:()=>{AU.startMusic("title");UI.creator=null;render();},
  cset:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator[d.k]=d.v;render();},
  crand:()=>{const n=(document.getElementById("pname")||{}).value||"",o=UI.creator||{};crSeed();UI.creator={...CHIBI.randomManager(Math.random),name:n,diff:o.diff||"normal",gender:o.gender||"m",tab:o.tab,seed:o.seed};render();},
  ctab:d=>{UI.creator.name=(document.getElementById("pname")||{}).value||UI.creator.name;crSeed();UI.creator.tab=d.v;render();},
  startGame:()=>{const c=UI.creator;c.name=((document.getElementById("pname")||{}).value||"").trim()||(c.gender==="m"?"ต้น":"ดาว");
    crSeed();const {name,diff,seed,...look}=c;G=newGame({name,gender:c.gender,diff:diff||"normal",avatar:look,seed:seedFrom(seed)});if(seed&&!/^\d{1,10}$/.test(seed))G.seedText=seed;G.newsSeen=PATCH.id;genOffers(G);UI.creator=null;UI.tab="home";G.seen.prologue=true;AU.resume();AU.startMusic("date");
    playScene(EVENTS[0].steps,()=>{save();UI.tab="home";UI.spot=0;AU.startMusic("hub");render();},{bg:"bus",look:"train"});},
  continue:()=>{let si=0;for(let i=1;i<=SLOTS;i++)if(loadSlot(i)){si=i;break;}if(!si)return;backupSlot(si);const s=safeFix(loadSlot(si));if(!s){toast("เซฟนี้เปิดกับเวอร์ชันนี้ไม่ได้ ข้อมูลยังอยู่ครบ ไม่ถูกลบ");return;}G=s;UI.slot=si;UI.tab="home";UI.modal=null;withArt(()=>{AU.startMusic("hub");if(G.ended){UI.ending=endingScene(G);}maybeWhatsNew();render();});},
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
    if(todo.length&&!UI.skipWarn&&SETTINGS.askEnd!==false){UI.modal={type:"endwarn",todo};render();return;}UI.skipWarn=false;endWeek();},
  endgo:()=>{UI.modal=null;UI.skipWarn=true;ACT.endweek();},
  noaskend:d=>{const el=document.querySelector("[data-act=noaskend]");SETTINGS.askEnd=!(el&&el.checked);saveSettings();},
  fighter:d=>{UI.ptab=d.v||"over";UI.look=G.F[d.id].camp==="player"?"train":"fight";UI.modal={type:"fighter",id:d.id};render();},
  ptab:d=>{UI.ptab=d.v;render();},
  plook:d=>{UI.look=d.v;render();},
  albtog:()=>{UI.albAll=!UI.albAll;render();},
  learn:d=>{const sl=document.querySelector(".sklist"),y=sl?sl.scrollTop:0;if(learnSkill(G,d.id,d.v)){AU.sfx("level");save();render();const n=document.querySelector(".sklist");if(n)n.scrollTop=y;}},
  rinread:()=>{const n=G.rinNote;if(!n)return;G.rinNote=null;save();playScene(n.steps,()=>{save();render();},{bg:"gym",look:"casual"});},
  skline:d=>{UI.skLine={id:d.id,li:+d.v};UI.skSel=null;AU.sfx("ui");render();},
  skresetask:d=>{const f=G.F[d.id];if(!f)return;UI.modal={type:"skresetask",id:d.id,back:UI.modal};render();},
  skresetgo:()=>{const m=UI.modal;if(!m)return;const f=G.F[m.id];const c=skResetCost(f);if(c&&G.cash<c)return;const n=resetAllSkills(G,m.id);if(!n){UI.modal=m.back||null;render();return;}G.cash-=c;save();UI.modal=m.back||null;toast(`คืนแต้มสกิล ${n} แต้มให้${f.name} เลือกสายใหม่ได้เลย`);render();},
  skresetno:()=>{const m=UI.modal;UI.modal=m&&m.back||null;render();},
  skreset:d=>{const f=G.F[d.id];if(!f||G.cash<SK_RESET_COST)return;const n=resetSharedPath(G,d.id);if(!n)return;G.cash-=SK_RESET_COST;save();toast(`คืนแต้มสกิล ${n} แต้ม เลือกสายปั้นใหม่ได้แล้ว`);render();},
  skauto:d=>{const f=G.F[d.id],li=+d.v;let n=0;for(let guard=0;guard<30&&f.sp>0;guard++){const s=skillList(f.id).filter(x=>x.line===li).sort((a,b)=>a.row-b.row||(f.skills[a.id]||0)-(f.skills[b.id]||0)).find(x=>!skillBlock(f,x.id).length);if(!s||!learnSkill(G,f.id,s.id))break;n++;}
    if(n){AU.sfx("level");save();toast(`อัป${(SK_LINES[f.id]||[])[li]||""} ${n} ครั้ง`);}render();},
  sksel:d=>{const k=d.id+":"+d.v;UI.skSel=UI.skSel===k?null:k;AU.sfx("ui");render();},
  skselx:()=>{UI.skSel=null;render();},
  skpopbg:(d,e)=>{if(e.target.classList.contains("skpop-ov")){UI.skSel=null;render();}},
  newsok:()=>{G.newsSeen=PATCH.id;UI.modal=null;save();render();},
  closeModal:()=>{const m=UI.modal;if(m&&m.type==="loywish"){ACT.lwclose();return;}if(m&&m.type==="waikhru"){if(m.ph==="pick")runWaiKhru(G,"s");ACT.waidone();return;}if(m&&m.type==="lotto"&&typeof ACT.lottoskip==="function"){ACT.lottoskip();return;} /* closing the ticket sheet skips the draw */if(m&&m.back==="album"&&G){ACT.album();return;}if(m&&m.type==="contest"){ACT.contestdone();return;}if(m&&m.type==="whatsnew"&&G){G.newsSeen=PATCH.id;save();}UI.modal=null;render();if(m&&m.after)m.after();},
  trait:d=>{const f=G.F[d.id],L=TRAITS[d.id];if(!f||!L||f.camp!=="player")return;const t=L.find(x=>x.id===d.v);if(!t||traitOf(f)===t.id)return;f.trait=t.id;save();render();toast(`${f.name}ใช้พลังแฝง "${t.name}"`);},
  gopen:d=>{GB.box=d.v==="loy"?"loy":"n";if(GB.box==="loy"&&!loyFest()){toast(loySoon()?"ตู้ลอยกระทงเปิด 18 พ.ย. เวลา 00:00":"ตู้ลอยกระทงปิดแล้ว ไว้เจอกันเทศกาลหน้า");return;}const fromAlb=UI.modal&&UI.modal.type==="album";if(fromAlb)albKeep();GB.st=null;GB.ps=[];UI.gq=false;UI.modal={type:"gbox",back:fromAlb?"album":null};render();gbPreload();},
  gpull:()=>{if(GB.st)return;const cost=gbCost();if((G.dust||0)<cost){AU.sfx("ui");toast(`เศษดาวไม่พอ ต้องใช้ ${cost}✦ · ได้จากชนะไฟต์ การ์ดใหม่ และย่อยใบซ้ำ`);return;}
    const r=GB.box==="loy"?loyPull(G):gachaPull(G);if(!r)return;save();const rr=CARDS[r.id].r;
    GB.st={res:r,id:r.id,r:rr,T:gbTimeline(rr),t0:performance.now(),fired:{},upg:rr==="SSR"&&Math.random()<.5};GB.ps=[];UI.gq=false;
    if(RM&&RM.matches)GB.st.t0-=GB.st.T.card;render();},
  gskip:()=>{const s=GB.st;if(!s||s.shown||UI.gq)return;const now=performance.now(),t=now-s.t0;if(s.T.cut&&t<s.T.cut)s.t0=now-s.T.cut;else s.t0=now-s.T.card;},
  gok:()=>{GB.st=null;GB.ps=[];render();},
  gboxq:()=>{UI.gq=!UI.gq;render();},
  closeModalBg:(d,e)=>{if(e.target.classList.contains("overlay")&&UI.modal&&!["report","levelup","contest"].includes(UI.modal.type)){UI.modal=null;render();}},
  ytinfo:()=>{UI.modal={type:"ytinfo"};render();},
  autotr:d=>{const f=G.F[d.id];if(!f||f.camp!=="player")return;if(autoOn(f)){delete f.autoTr;for(const b of G.bookings)if(b.a===f.id&&b.autoPlan){b.planSet=false;delete b.autoPlan;}}else{f.autoTr=gameWeek(G)+3;autoPlans();}AU.sfx("ui");save();render();},
  preset:d=>{if(handLocked(G.F[d.f]))return;const f=G.F[d.f];f.plan.preset=d.v;if(d.v==="rest")f.plan.intensity="normal";save();render();},
  intensity:d=>{if(handLocked(G.F[d.f]))return;G.F[d.f].plan.intensity=d.v;save();render();},
  consider:d=>{UI.modal={type:"consider",id:d.v};render();},
  accept:d=>{const o=G.offers.find(x=>x.id===d.v),result=acceptOffer(G,d.v);UI.modal=null;save();if(!result.ok){toast(result.reason);render();return;}toast(`รับไฟต์แล้ว: ${G.F[o.a].name} vs ${G.F[o.b].name} สัปดาห์ ${o.week}`);render();},
  fsub:d=>{UI.fsub=d.v;if(d.v==="rank"&&G&&!(G.flags&&G.flags.rankGuide)){G.flags.rankGuide=1;UI.modal={type:"rankhelp"};save();}render();},csub:d=>{UI.csub=d.v;render();},rview:d=>{UI.rview=d.v;AU.sfx&&AU.sfx("ui");render();},rdiv:d=>{UI.rdiv=d.v;render();},
  tipnext:()=>{UI.tipIdx++;render();},hideguide:()=>{G.guideHidden=G.week;save();render();},
  tipact:d=>{if(d.k==="setrest"||d.k==="setprep"){ACT.tab({v:"train"});if(!handLocked(G.F[d.id])){UI.modal={type:"tpick",id:d.id};render();}}
    else if(d.k==="tab"&&d.sub){UI.csub=d.sub;ACT.tab({v:d.v});}
    else if(d.k==="fighter")ACT.fighter({id:d.id,v:d.v});else if(d.k==="tab")ACT.tab({v:d.v});else if(d.k==="campacts")ACT.campacts();else if(d.k==="loan")ACT.loan();else if(d.k==="lossrev")ACT.lossrev();else if(d.k==="endweek")ACT.endweek();},
  newsoff:()=>{UI.newsWeek=G.week;const el=document.querySelector(".newspop");if(el)el.remove();},
  hang:d=>{UI.modal={type:"hang",id:d.id};render();},
  gofac:()=>{UI.modal=null;UI.csub="fac";ACT.tab({v:"camp"});},
  camplv:()=>{UI.modal={type:"camplv"};render();},
  loan:()=>{if(!loanOk(G)){toast(G.loan>0?"ยังมีเงินกู้ค้างอยู่":"ยังไม่ถึงขั้นต้องกู้");return;}UI.modal={type:"loan"};render();},
  loanyes:()=>{if(!takeLoan(G))return;for(const m of G.mail||[])if(m.kind==="loan"&&!m.done){m.done=true;m.took=true;}UI.modal=null;save();AU.sfx("coin");playScene([{n:"npc",who:"ลูกน้องหมวกทอง",t:"ขอบคุณที่ใช้บริการครับเฮีย ครบสี่อาทิตย์ดอกขึ้นนะ เดี๋ยวพวกเราแวะไปเยี่ยมแถวตลาดบ่อย ๆ"},{n:"coach",t:"…เอาเถอะ ได้เงินมาแล้วก็รีบหาทางคืน อย่าให้มันพอกหางหมู"}],()=>render(),{bg:"food",look:"casual"});},
  repayloan:()=>{if(repayLoan(G)){save();AU.sfx("level");toast("คืนเงินกู้หมวกทองครบแล้ว หายใจโล่ง");render();}},
  advice:d=>{UI.modal={type:"advice",id:d.id};render();},
  mastersOpen:()=>{UI.modal={type:"masters"};render();},
  hiremaster:d=>{if(hireMaster(G,d.id,d.v)){AU.sfx("level");const f=G.F[d.id],M=MASTERS[d.v];UI.cfxIds=[d.id];save();
    UI.modal={type:"campres",k:"master",title:`เชิญ${M.name}มาสอน`,cost:M.cost,cap:`${M.name}ถ่ายทอดวิชาให้${f.name}`,note:`${f.name}ได้เรียนกับ${M.name} · แต้มสกิล +1 · ${M.attrs.map(k=>(ATTRS.find(a=>a[0]===k)||[k,k])[1]).join(" ")} เพิ่มขึ้น · กำลังใจ +6`};render();}},
  hostshow:()=>{if(hostShow(G)){AU.cheer(1);UI.cfxIds=null;save();UI.modal={type:"campres",k:"hostshow",title:"จัดศึกมวยที่ค่ายศิริชัย",cost:SHOW_COST,note:"คนดูแน่นลานทั้งคืน · ชื่อเสียง +3 · ค่ายสวยขึ้น · กำลังใจทุกคน +8"};render();}},
  cleardebt:()=>{if(clearDebt(G)){save();playScene(DEBT_CLEAR_SCENE,()=>{add(G,"kati","bond",5);render();},{bg:"gym",look:"casual"});}},
  campacts:()=>{UI.modal={type:"campacts"};render();},
  studinfo:()=>{UI.modal={type:"studinfo"};render();},
  campick:d=>{UI.modal.pick=d.v;render();},campback:()=>{UI.modal.pick=null;render();},
  campok:()=>{ACT.campact({v:UI.modal.pick});},
  outfit:d=>{const f=G.F[d.id];if(!f||f.camp!=="player")return;if(d.v!=="base"&&!outfitOk(G,f,d.v))return;f.outfit=d.v;AU.sfx&&AU.sfx("ui");save();render();},
  campmg:()=>{const k=UI.modal.pick,a=CAMP_ACTIONS[k];if(!a||!a.mg||G.campUsed)return;UI.modal=null;render();BAG.openMode(a.mg,k);},
  cfxskip:()=>{if(UI.modal&&UI.modal.type==="campres"&&!UI.modal.skip){UI.modal.skip=true;const el=document.querySelector(".campres");if(el)el.classList.add("skip");}},
  campact:d=>{UI.cfxIds=null;const note=doCampAction(G,d.v);if(note==null)return;G.campNote=note;AU.sfx("level");UI.modal={type:"campres",k:d.v,note};save();render();},
  date:d=>{UI.modal=null;UI.tab="people";const steps=dateScene(G,d.id,d.v);AU.startMusic("date");playScene(steps,()=>{AU.startMusic("hub");render();},{bg:ACTIVITIES[d.v].bg==="camp"?"gym":ACTIVITIES[d.v].bg,look:"casual"});},
  giftpick:d=>{UI.modal={type:"gift",id:d.id};render();},
  give:d=>{const r=giveGift(G,d.id,d.v);if(!r)return;UI.modal=null;UI.tab="people";save();AU.startMusic("date");giftScene(d.id,r);},
  decor:d=>{if(chooseDecor(G,d.k,d.v)){AU.sfx&&AU.sfx("ui");save();render();}},
  decorbuy:d=>{const c=decorPrice(G,d.k,d.v),it=CAMP_DECOR[d.k]&&CAMP_DECOR[d.k].items[d.v];if(!c||!it)return;AU.sfx&&AU.sfx("ui");
    UI.modal={type:"confirm",title:"ซื้อของตกแต่งนี้?",ok:`ซื้อ ${fmt(c)}`,no:"ยกเลิก",yes:"decorbuyok",k:d.k,v:d.v,
      html:`<div class="px confirm"><b>${esc(it.name)}</b><p class="meta">${esc(CAMP_DECOR[d.k].name)} · ราคา ${fmt(c)} · เหลือเงิน ${fmt(G.cash-c)}</p><p class="meta">ซื้อแล้วใช้ได้ตลอด สลับกลับเป็นแบบเดิมได้ทุกเมื่อ</p></div>`};render();},
  decorbuyok:()=>{const m=UI.modal;if(!m||m.yes!=="decorbuyok")return;const d={k:m.k,v:m.v};UI.modal=null;const c=decorPrice(G,d.k,d.v);if(buyDecor(G,d.k,d.v)){AU.sfx&&AU.sfx("level");save();toast(`ซื้อ "${CAMP_DECOR[d.k].items[d.v].name}" แล้ว ${fmt(c)}`);}render();},
  trophy:d=>{UI.trophySel=UI.trophySel===+d.v?null:+d.v;AU.sfx&&AU.sfx("ui");render();},
  showcase:()=>{UI.modal={type:"showcase"};render();},
  showcaseSave:()=>{const src=document.querySelector(".m-showcase canvas[data-camp]");if(!src)return;const W=640,cv=document.createElement("canvas");cv.width=W;cv.height=470;const x=cv.getContext("2d");x.imageSmoothingEnabled=false;
    x.fillStyle="#141020";x.fillRect(0,0,W,470);x.drawImage(src,0,0,W,360);x.fillStyle="#f1c232";x.font='bold 26px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.fillText(`ค่ายมวยศิริชัย · ปีที่ ${G.season||1}`,20,400);
    x.fillStyle="#e8e0f0";x.font='16px "IBM Plex Sans Thai",sans-serif';x.fillText(`${G.player.name} · ค่าย Lv.${campLevel(G)} · นักมวย ${roster(G).length} คน · เกียรติยศ ${(G.honors||[]).length} · เกียรติบัตร ${(G.campAwards||[]).length}`,20,430);
    x.fillStyle="#9a8fb0";x.font='14px "IBM Plex Sans Thai",sans-serif';x.fillText("Muay Thai Moe",20,456);
    try{const a=document.createElement("a");a.href=cv.toDataURL("image/png");a.download=`muay-thai-moe-camp-y${G.season||1}.png`;document.body.appendChild(a);a.click();a.remove();toast("บันทึกรูปค่ายแล้ว");}catch(e){toast("บันทึกรูปไม่ได้ในเบราว์เซอร์นี้ ลองแคปหน้าจอแทนนะ");}},
  decorslot:d=>{UI.decorSlot=d.v;AU.sfx&&AU.sfx("ui");render();},
  buyfac:d=>{const before=campLevel(G);if(buyFacility(G,d.v)){save();const after=campLevel(G);AU.sfx("level");toast(after>before?`ค่ายเลื่อนเป็น Lv.${after}: ${CAMP_LV_NAME[after]}!`:`อัปเกรด${FACILITIES[d.v].name}แล้ว`);}},
  daeng:()=>{if(upgradeDaeng(G)){save();toast(`ครูแดงผ่านการอบรม Lv.${G.fac.daeng}`);}},
  useroad:d=>{const f=G.F[d.id];if(!f||trLocked(f)||!PRESETS[d.p])return;f.plan={...f.plan,preset:d.p,intensity:d.i};UI.modal=null;save();toast(`ตั้ง${f.name}: ${planName(d.p,d.i)} แล้ว อย่าลืมกดยืนยัน`);},
  equip:d=>{if(toggleEquip(G,d.id,d.v)){AU.sfx("ui");save();render();}else toast(`เลือกได้สูงสุด ${MAX_EQUIP} สกิล เอาออกก่อน 1 ท่า`);},
  hirestaff:d=>{if(hireStaff(G,d.v)){AU.sfx("level");save();toast(`${STAFF[d.v].name}เข้าร่วมค่ายแล้ว`);render();}},
  firestaff:d=>{fireStaff(G,d.v);save();toast(`เลิกจ้าง${STAFF[d.v].name}แล้ว`);render();},
  paydebt:()=>{const p=Math.min(10000,G.debt);G.cash-=p;G.debt-=p;save();render();},
  sign:d=>{const f=G.F[d.v];if(G.cash<f.fee)return;
    if(!d.ok&&(weeklyNet(G)-f.wage<0||G.cash-f.fee<15000)){UI.modal={type:"signwarn",id:f.id};render();return;}UI.modal=null;G.cash-=f.fee;f.camp="player";f.met=true;if(f.id==="mali"){G.flags.maliIn=G.week;G.flags.maliInAbs=gameWeek(G);}add(G,f.id,"trust",5);
    if(stageOf(G.week)==="local")G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};genOffers(G,{midweek:true});save();
    playScene([{n:f.id,f:"happy",l:"train",t:f.id==="mali"?"ฝากตัวด้วยนะคะ! หนูจะเตะให้ค่ายศิริชัยดังไปทั้งจังหวัดเลย~":"สัญญาเรียบร้อยค่ะ ฉันจะส่งแผนการซ้อมสัปดาห์แรกให้ภายในคืนนี้"},
      {n:"kati",f:"happy",l:"train",with:f.id,t:f.id==="mali"?"ยินดีต้อนรับนะมะลิ! ค่ายเราไม่เหงาแล้ว!":"ยินดีต้อนรับค่ะริน! …ขออย่านับว่าหนูการ์ดตกกี่ครั้งเลยนะ"}],()=>render(),{bg:"gym",look:"train"});},
  vnext:()=>sceneNext(),vchoose:d=>{if(Date.now()-(UI._ct||0)<500)return;sceneChoose(+d.v);},vskip:()=>sceneSkip(),
  montageDone:()=>montageDone(),
  plan:d=>{UI.fight.plan=d.v;render();},
  fstart:()=>beginFight(false),fquick:()=>beginFight(true),fskip:()=>fskip(),fskill:d=>fskill(d.v),
  fspeed:d=>{UI.speed=+d.v===2?2:1;render();},
  tac:d=>{UI.fight.tac[d.k]=d.v;render();},
  tpick:d=>{if(handLocked(G.F[d.id]))return;UI.modal={type:"tpick",id:d.id};render();},
  tlock:d=>{const f=G.F[d.id];if(!f)return;f.lockWeek=gameWeek(G);f.drillBonus=0;AU.sfx("level");save();
    // v1.19.1: a short drill scene — tap to make her strike, then see how the session went
    const pr=f.plan.preset;if(!f.injury&&pr!=="rest"&&pr!=="prep"){UI.drill={id:f.id,taps:0,need:f.plan.intensity==="light"?2:3,res:[],hitT:0};UI.modal={type:"drill",id:f.id};}else UI.modal=null;render();},
  dtap:()=>{const D=UI.drill;if(!D||D.taps>=D.need)return;const r=srand(G,D.taps*31+D.need*7+(G.campUsed?3:0));const q=r<.3?"perfect":r<.85?"good":"ok";D.res.push(q);D.taps++;D.hitT=performance.now();D.q=q;
    AU.sfx(DRILL_ROW[G.F[D.id].plan.preset]==="knee"?"kick":"punch");
    if(D.taps>=D.need){const b=D.res.reduce((x,q)=>x+(q==="perfect"?4:q==="good"?2:0),0);G.F[D.id].drillBonus=b/100;D.bonus=b;save();setTimeout(()=>{if(UI.drill===D){D.done=true;AU.sfx(b>=8?"level":"ui");render();}},700);}
    render();},
  dskip:()=>{UI.drill=null;UI.modal=null;render();},
  fplan:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;UI.fpDraft={plan:b.plan||"balanced",target:(b.tac&&b.tac.target)||"body"};UI.modal={type:"fplan",id:d.id};render();},
  fpd:d=>{UI.fpDraft[d.k]=d.v;render();},
  fpok:d=>{const b=fpBooking(d.id);if(b){b.plan=UI.fpDraft.plan;b.tac={...(b.tac||{}),target:UI.fpDraft.target};b.planSet=true;if(b!==UI.qb)save();}const m=UI.modal;UI.modal=null;render();if(m&&m.after)m.after();},
  fpbest:d=>{const b=fpBooking(d.id);if(!b)return;try{UI.fpDraft.plan=adviseCached(b.a,b.b,b.rounds||3).best||"balanced";}catch(e){}ACT.fpok(d);},
  bplanb:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;b.plan=d.v;save();render();},
  btgt:d=>{const b=G.bookings.find(x=>x.id===d.id);if(!b)return;b.tac={...(b.tac||{}),target:d.v};save();render();},ctac:d=>{UI.fight.F.A.tac[d.k]=d.v;render();},
  scout:d=>{if(G.cash<scoutCost()||scouted(d.v))return;const free=rinFree();G.cash-=scoutCost();G.scoutAbs=G.scoutAbs||{};G.scoutAbs[d.v]=gameWeek(G);if(free)G.rinTapeAbs=gameWeek(G);save();if(free){toast(`รินดูเทป${G.F[d.v].name}แล้ว (ดูฟรีได้อีกครั้งสัปดาห์ ${((G.week+RIN_GAP-1)%52)+1})`);render();return;}toast("ดูเทปคู่ชกแล้ว ครูจดจุดอ่อนไว้ให้");render();},
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
  cauto:()=>{const U=UI.fight,C=U&&U.care;if(!C||C.done)return;C.done=true;C.auto=true;C.q=.99;careApply(U,C);AU.sfx("ui");render();},
  cgo:()=>{const U=UI.fight;if(!U.pick)return;const C=U.care;if(C&&!C.done){C.q=0;C.done=true;applyCare(U.F,0);}AU.sfx("bell1");U.F.A.instr=U.pick;U.pick=null;playRound();},
  coil:()=>{const U=UI.fight,C=U&&U.care;if(!C||C.mode!=="oil"||C.phase!=="rub"||C.done)return;if(performance.now()-C.t0>C.secs*1000){oilFinish();return;}C.taps++;AU.sfx("ui");
    const b=document.querySelector(".oilcombo b");if(b){b.textContent=C.taps;const p=b.parentElement;p.classList.remove("pop");void p.offsetWidth;p.classList.add("pop");}},
  ccard:d=>{const U=UI.fight,C=U.care;if(!C||C.mode!=="card"||C.done)return;const i=+d.v;C.flip=i;C.q=C.deck[i];C.done=true;careApply(U,C);AU.sfx(C.q>1?"level":C.q<0?"miss":"ui");render();},
  care:d=>{const U=UI.fight,C=U.care;if(!C||C.done)return;const i=C.got.length;C.got.push(d.v);const ok=C.need[i]===d.v;AU.sfx(ok?"ui":"miss");
    if(C.got.length>=C.need.length){C.done=true;const n=C.got.filter((g,k)=>g===C.need[k]).length;C.q=n===3?1:n===2?.5:0;if(C.q>=1)U.careOK=(U.careOK||0)+1;applyCare(U.F,C.q);if(C.q>=1){AU.sfx("level");const me=G.F[U.b.a];popToast({kati:"สดชื่นจังเลยค่ะ!",mali:"หายเหนื่อยแล้ว! ลุยต่อ!",rin:"สภาพร่างกายกลับมา 90%",ploy:"ขอบคุณค่ะ ใจมาแล้ว",fah:"โอเค! พร้อมจัดหนัก!"}[me.id]||"สดชื่นแล้ว!","good");}}render();},
  towel:()=>{UI.confirmTowel=true;render();},
  towelno:()=>{UI.confirmTowel=false;UI.towelCoach=false;render();},
  towelyes:()=>{UI.confirmTowel=false;UI.towelCoach=false;const U=UI.fight;throwTowel(U.F);U.shown.push({s:"x",t:`มุม${G.F[U.b.a].name}โยนผ้าขาวยอมแพ้`});fightEnd();},
  withdraw:()=>{const U=UI.fight;G.bookings=G.bookings.filter(x=>x!==U.b);G.rep=Math.max(0,G.rep-1);add(G,U.b.a,"trust",3);
    G.log.push(`${G.F[U.b.a].name} ถอนตัวเพราะบาดเจ็บ`);const done=U.done;UI.fight=null;render();done();},
  fbrawl:d=>brawlPick(+d.v),
  fbrawldone:()=>{const U=UI.fight;if(!U||!U.brawl)return;const F=U.F,res={sc:U.brawl.sc,stopped:U.brawl.stopped,hpA:Math.round(F.A.hp),hpB:Math.round(F.B.hp)};const done=U.done;UI.fight=null;AU.startMusic("hub");render();if(done)done(res);},
  fdone:()=>{const done=UI.fight.done,after=UI.fight.afterScene;UI.fight=null;render();playHonorQueue(()=>{if(after)playScene(after,done,{bg:"ring",look:"fight"});else done();});},
  gatego:()=>{const v=((document.getElementById("gatecode")||{}).value||"").toUpperCase().replace(/\s+/g,"");let ok=false;try{ok=btoa(v)===GATE.code;}catch(e){}
    if(ok){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}UI.gateErr=false;save();AU.sfx("level");toast("ปลดล็อกแล้ว! เล่นต่อปีที่ 2 ได้เลย");}else{UI.gateErr=true;AU.sfx("miss");}render();},
  newseason:()=>{if(!gateOpen())return;const res=seasonResult().map(r=>({id:r.f.id,name:r.f.name,d:r.d,t:r.t,c:r.c}));const snap=JSON.stringify(G);try{newSeason(G);}catch(e){console.error("newSeason",e);G=JSON.parse(snap);toast("ขึ้นปีใหม่ไม่สำเร็จ เซฟยังอยู่ครบ ลองอีกครั้งหรือแจ้งทีมงานใน Discord");render();return;}const T=G.titles[G.titles.length-1];if(T)T.res=res;UI.ending=null;UI.tab="home";UI.advCache={};save();AU.startMusic("hub");
    playScene([{n:"coach",bg:"gym",t:`ฤดูกาลใหม่มาแล้ว ${G.player.name} อันดับเริ่มนับใหม่ทุกคน แต่ค่ายเราไม่ได้เริ่มจากศูนย์อีกแล้ว`},
      {n:"kati",f:"happy",l:"train",with:"coach",t:"ปีนี้หนูจะไม่ยอมให้ใครแซงแน่ค่ะ! ไปกันเลย!"}],()=>render(),{bg:"gym",look:"train"});},
  replay:()=>{const i=UI.slot;ACT.restart();ACT.beginNew(i);},
  restart:()=>{AU.startMusic("title");G=null;UI.ending=null;UI.creator=null;UI.tab="home";UI.title="menu";render();},
};
const QUIET_ACTS=new Set(["gpull","gskip","vnext","vchoose","corner","tapstart","fspeed","care","cgo"]);
document.addEventListener("click",e=>{AU.resume();const el=e.target.closest("[data-act]");if(!el)return;const a=el.dataset.act;if(!a||!ACT[a])return;if(el.disabled)return;
  if(el.classList.contains("title")&&e.target.closest("button"))return;if(a==="vnext")AU.sfx("tick");else if(a==="vchoose")AU.sfx("choose");else if(!QUIET_ACTS.has(a))AU.sfx("ui");ACT[a](el.dataset,e);});
["pointerdown","touchend","keydown"].forEach(t=>document.addEventListener(t,()=>AU.resume(),{passive:true}));
document.addEventListener("visibilitychange",()=>{if(!document.hidden)AU.resume();});
document.addEventListener("change",e=>{const el=e.target;if(el.dataset&&el.dataset.act==="importsave"&&el.files&&el.files[0]){if(!G)UI.slot=1;const f0=el.files[0];/* v1.87: a save from the other language needs the dictionary first */(window.MTM_DICT?window.MTM_DICT().catch(()=>{}):Promise.resolve()).then(()=>importSave(f0));return;}if(el.dataset&&el.dataset.act==="bplan"){const b=G.bookings.find(x=>x.id===el.dataset.id);if(b){b.plan=el.value;save();AU.sfx("ui");render();}}});
document.addEventListener("keydown",e=>{
  if(!G&&UI.title==="tap"&&(e.key===" "||e.key==="Enter")){e.preventDefault();ACT.tapstart();return;}
  if(UI.scene&&!(UI.scene.cur&&UI.scene.cur.choice)&&(e.key===" "||e.key==="Enter")){e.preventDefault();sceneNext();return;}
  if(e.key==="Enter"&&e.target&&e.target.id){const b={petname:"petnamebtn",redeemcode:null,gatecode:null}[e.target.id];const el=b?document.getElementById(b):e.target.id==="redeemcode"?document.querySelector("[data-act=redeem]"):e.target.id==="gatecode"?document.querySelector("[data-act=gatego]"):null;if(el){e.preventDefault();el.click();}}});
preloadCore();setTimeout(()=>{if(!G){["happy","surprised","sad"].forEach(m=>warm(stand("kati","fight",m)));warm(`${ASSET}coach.webp`);}},4000);render();

// ================= MUAY THAI MOE v1.23 — MAILBOX, SIDE QUESTS, ODD FIGHTS, CALENDAR, GRAPHS, NEWS BAR =================
// ---------- odd opponents (sprite sheets in a/<sprite>_sheet.webp, same 6-row layout as the girls) ----------
const QK={
  gang1:{fst:"pressure",name:"ลูกกระจ๊อกหมวกแดง",sprite:"gang1",lvl:-1.6,tilt:{punch:1.5,power:1,iq:-2,guard:-1.5,comp:-1},color:"#c8283c",grp:"gang"},
  gang2:{fst:"pressure",name:"ไอ้แจ็กเก็ตดำ หมวกแดง",sprite:"gang2",lvl:-.8,tilt:{punch:1.5,kick:1,iq:-1.5,comp:-1},color:"#a01f2f",grp:"gang"},
  gang3:{fst:"inside",name:"รองหัวหน้าหมวกดำแดง",sprite:"gang3",lvl:.1,tilt:{punch:1.5,knee:1,power:1,iq:-1},color:"#5a1420",grp:"gang"},
  gang4:{fst:"power",name:"หัวหน้าหมวกเงิน",sprite:"gangsilver",lvl:.8,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#c9ced8",grp:"gang"}, /* v1.89.24: the silver chief gets his own silver sprite */
  gang6:{fst:"power",name:"มือขวาหมวกทองดำ",sprite:"gang4",lvl:1.2,tilt:{power:2,kick:1.5,guard:1,dur:1,foot:-1},color:"#d9a520",grp:"gang"}, /* v1.89.24: the boss's gold-and-black right hand (the old gang4 sheet) */
  gang5:{fst:"inside",name:"เสี่ยหมวกทองคำ",sprite:"gang5",lvl:1.6,tilt:{power:2,punch:2,dur:1.5,comp:1,foot:-1},color:"#f7d24a",grp:"gang"},
  rooster1:{fst:"pressure",name:"ไก่แจ้หัวร้อน",sprite:"rooster1",lvl:-.9,tilt:{speed:2.5,kick:2,dur:-2,power:-1},color:"#e8a23a",grp:"rooster"},
  rooster2:{fst:"footwork",name:"ไก่เทาสิงห์บุรี",sprite:"rooster2",lvl:-.2,tilt:{speed:2,kick:2,foot:1,dur:-1.5},color:"#8a8f9a",grp:"rooster"},
  rooster3:{fst:"counter",name:"ไก่ขาวมวยวัด",sprite:"rooster3",lvl:.4,tilt:{speed:2,kick:2.5,counter:1,dur:-1.5},color:"#f4f1ea",grp:"rooster"},
  rooster4:{fst:"footwork",name:"เจ้าดำหางแดง",sprite:"rooster4",lvl:.9,tilt:{speed:2,kick:2,power:1,guard:1,dur:-1},color:"#c8283c",grp:"rooster"},
  rooster5:{fst:"counter",name:"พญาไก่ทองนักเลง",sprite:"rooster5",lvl:1.5,tilt:{speed:2,kick:2.5,power:1.5,comp:1,dur:-.5},color:"#f7d24a",grp:"rooster"},
  bull1:{fst:"inside",name:"แม่นมสด วัวหลุดฟาร์ม",sprite:"bull1",lvl:-.6,tilt:{power:2,dur:2.5,clinch:1,speed:-2,iq:-1},color:"#f4f1ea",grp:"bull"},
  bull2:{fst:"pressure",name:"เจ้าแดงเขาโค้ง",sprite:"bull2",lvl:.7,tilt:{power:2.5,dur:2,knee:1.5,speed:-1.5},color:"#a0522d",grp:"bull"},
  bull3:{fst:"inside",name:"ไอ้ทุยมาเฟีย",sprite:"bull3",lvl:1.4,tilt:{power:3,dur:2.5,clinch:2,speed:-1.5,foot:-1},color:"#2b2530",grp:"bull"},
};
const BELT_WEEKS=[10,18,26,34,42];
const STADIUMS={
 tha:{name:"เวทีท่าแพ",scene:"district",bg:"bg_district.webp",weeks:[10,18,26,34,42],minYear:1,win:15000,defend:10000},
 ping:{name:"เวทีริมปิง",scene:"loy_ring",bg:"bg_loy_ring.webp",weeks:[15,30,45],minYear:2,win:18000,defend:12000},
 lanna:{name:"เวทีล้านนา",scene:"hall",bg:"bg_hall.webp",weeks:[22,38,48],minYear:3,win:22000,defend:14000}
};
function beltStore(G,venue="tha"){if(venue==="tha")return G.belt=G.belt||{};G.venueBelts=G.venueBelts||{};return G.venueBelts[venue]=G.venueBelts[venue]||{};}

function beltHolder(G,div,venue="tha"){const B=beltStore(G,venue);if(!B[div]||!G.F[B[div].id]){const c=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&!f.canon&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));const chosen=c[Math.min(venue==="tha"?0:venue==="ping"?1:2,c.length-1)];if(!chosen)return null;B[div]={id:chosen.id,def:2,since:G.week};}return G.F[B[div].id];}
function beltChallenger(G,div,not){let ids=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.camp!=="quest"&&f.id!==not&&!f.injury&&!isBooked(G,f.id,G.week)).sort((a,b)=>ovr(b.a)-ovr(a.a)).slice(0,8).map(f=>f.id);let round=0;
  while(ids.length>1){const next=[];for(let i=0;i<ids.length;i+=2){if(!ids[i+1]){next.push(ids[i]);continue;}const F=quickFight(G.F[ids[i]],G.F[ids[i+1]],G.seed+gameWeek(G)*313+round*17+i,5);next.push(dmWinFrom(F)==="A"?ids[i]:ids[i+1]);}ids=next;round++;}return G.F[ids[0]]||null;}
// A title is earned through the division bracket; defenses remain one bout.
function beltTournament(G,m,fid){if(G.dm&&!G.dm.done)return null;const me=G.F[fid],venue=m.venue||"tha",holder=beltHolder(G,m.div,venue);
  if(!me||me.div!==m.div||!holder||holder.camp==="player"||!dmCanEnter(me)||isBooked(G,holder.id,G.week))return null;
  const pool=Object.values(G.F).filter(f=>f.id!==fid&&f.div===m.div&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&!isBooked(G,f.id,G.week));
  const ids=[holder.id,...pool.filter(f=>f.id!==holder.id).sort((a,b)=>ovr(b.a)-ovr(a.a)).slice(0,6).map(f=>f.id)];
  const slots=Array(8).fill(null);slots[0]=fid;slots[7]=holder.id;[1,2,3,4,5,6].forEach((slot,i)=>slots[slot]=ids[i+1]||null);
  return {wk:G.week,absWeek:gameWeek(G),slots,w:[[],[],[]],r:0,mine:[fid],out:{},done:false,belt:{venue,div:m.div,pay:m.pay||STADIUMS[venue].win,holder:holder.id}};}
function beltTournamentFinish(D){const S=D.belt,champ=D.champ,won=dmMine(champ);beltStore(G,S.venue)[S.div]={id:champ,def:0,since:G.week};D.best=won?4:(D.out[D.mine[0]]||1);D.prize=won?S.pay:0;
  if(won){G.cash+=D.prize;G.wkFight=(G.wkFight||0)+D.prize;G.rep+=3;G.F[champ].belts=(G.F[champ].belts||0)+1;const rival=D.w[1].find(id=>id!==champ);recordHonor(G,"belt",champ,S.div,D.wk,S.venue==="tha"?null:S.venue,G.F[rival]?.name,rival);}save();}
function beltBracketHTML(D){const title=STADIUMS[D.belt.venue].name+" · "+D.belt.div,nm=id=>esc(G.F[id]?.name||"—"),nx=dmNextMatch();
  const columns=[D.slots,D.w[0],D.w[1],D.w[2]].map((L,r)=>`<div class="dmcol"><h4>${["8","4","2","🏆"][r]}</h4>${L.map(id=>`<div class="dmc ${dmMine(id)?"mine":""}">${nm(id)}</div>`).join("")}</div>`).join("");
  const action=D.done?`<p class="center goldt">🏆 ${nm(D.champ)} · ${fmt(D.prize||0)}</p><button class="btn primary" data-act="dmclose">กลับค่าย</button>`:nx?`<button class="btn primary" data-act="dmgo" data-id="${dmMine(nx[0])?nx[0]:nx[1]}" data-v="${dmMine(nx[0])?nx[1]:nx[0]}">${nm(nx[0])} vs ${nm(nx[1])} ▸</button>`:"";
  return `<h2>ทัวร์นาเมนต์ชิงเข็มขัด ${title}</h2><p class="meta">รุ่นเดียวกัน · แพ้คัดออก · ชกไฟต์ละห้ายก</p><div class="dmb">${columns}</div>${action}`;}
const QGRP_BG={gang:"bg_market.webp",rooster:"bg_rooster.webp",bull:"bg_farm.webp"};
/* v1.91.83 (Man): the quest foes kept pace with her stats only, so a late-game girl with a full skill tree outgrew even the bosses.
   They now read a fifth of her hidden edge (the season bonus halved to make room) (skills, perks, level) like the Loy thief, carry whatever the stat ceiling cannot hold as ring craft,
   and fight with their own signature skills (cut-in + burst, like the Naka League) — minions one, lieutenants two, bosses three */
const Q_EDGE=.35,Q_VET_MAX=12; /* v1.91.112 (Man): a little easier than .5; past 2 points the edge counts half — the mirror test rates Mali's kit higher than it plays against these lopsided foes, so a straight read doubled her penalty */
const qEdge=e=>e<=2?e:2+(e-2)*.5;
const QSK={
  gang:[{id:"q_g_debt",name:"หมัดทวงหนี้",k:"atk",w:"punch"},{id:"q_g_guard",name:"การ์ดลูกพี่",k:"def"},{id:"q_g_knee",name:"เข่าเก็บค่าคุ้มครอง",k:"atk",w:"knee"}],
  rooster:[{id:"q_r_spur",name:"แข้งเดือยไก่ชน",k:"atk",w:"kick"},{id:"q_r_flap",name:"กระพือปีกหลบ",k:"def"},{id:"q_r_peck",name:"ศอกจิกหัว",k:"atk",w:"elbow"}],
  bull:[{id:"q_b_horn",name:"ขวิดเขากระทิงดุ",k:"atk",w:"knee"},{id:"q_b_hide",name:"หนังหนาวัวควาย",k:"def"},{id:"q_b_cud",name:"เคี้ยวเอื้องเรียกแรง",k:"rec"}]};
const qSkN=K=>K.lvl<-.3?1:K.lvl<1?2:3;
function qTarget(G,fid){const f=fid&&G.F[fid];if(f)return ovr(f.a)+(f.camp==="player"&&typeof hiddenEdge==="function"?Q_EDGE*qEdge(hiddenEdge(f)):0);const R=roster(G);return R.length?R.reduce((s,x)=>s+ovr(x.a),0)/R.length:9;}
function makeQ(G,kind,fid,tag){const K=QK[kind],t=qTarget(G,fid)+K.lvl+Math.min(.75,((G.season||1)-1)*.125),rng=mulberry32((G.seed^(G.week*977))+kind.length*31);const a={};
  for(const [k] of ATTRS)a[k]=clamp(t+(K.tilt[k]||0)+(rng()*1.6-.8),3,19.5);
  const d=t-ovr(a);for(const [k] of ATTRS)a[k]=clamp(a[k]+d,3,19.5);
  const id=`q_${kind}_${tag||G.week}`;const f=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  {const short=t-ovr(a);if(short>.05)f.vet=+Math.min(Q_VET_MAX,short).toFixed(2);} /* past the stat ceiling: ring craft */
  if(QSK[K.grp])f.nlsk=QSK[K.grp].slice(0,qSkN(K));
  if(K.fst)f.fstyle=K.fst; /* v1.91.112 (Man): every quest foe fights in its own style — thugs, bulls and the gold boss rush or clinch (Mali's footwork beats them), the silver chief and his right hand hit heavy and the temple roosters wait to counter (Kati's inside game beats them) */
  f.sprite=K.sprite;f.kind=kind;f.grp=K.grp;f.lvl=clamp(Math.round(t-6),1,10);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;}
function qCleanup(G){const keep=new Set([...G.bookings.map(b=>b.b),...G.offers.map(o=>o.b),...(G.mail||[]).filter(m=>!m.done&&m.qid).map(m=>m.qid)]);
  for(const id of Object.keys(G.F))if(id.startsWith("q_")&&!keep.has(id)&&(G.F[id].lastFightAbs==null||gameWeek(G)-G.F[id].lastFightAbs>2))delete G.F[id];}

// ---------- mail ----------
let MAILN=0;
function addMail(G,m){G.mail=G.mail||[];m.id="m"+G.week+"_"+(++MAILN)+"_"+Math.floor(Math.random()*1e4);m.wk=G.week;m.season=G.season||1;if(m.exp!=null)m.expAbs=gameWeek(G)+(m.exp-G.week);m.read=false;G.mail.unshift(m);for(let i=G.mail.length-1;G.mail.length>40&&i>=0;i--)if(!mailKeep(G.mail[i]))G.mail.splice(i,1);if(G.mail.length>60)G.mail=G.mail.slice(0,60);return m;}
/* v1.91.165 (Man): a daily/weekly event letter whose fight can no longer be taken (played today, or the event window has closed) settles as done — no blinking frame, no red dot, no badge */
function evSettle(m){if(m&&!m.done&&m.kind==="event"&&((m.ev==="tuy"&&typeof tuyReady==="function"&&!tuyReady(G))||(m.ev==="thief"&&typeof thiefReady==="function"&&!thiefReady(G))))m.done=true;return m;}
const mailOpen=m=>(evSettle(m),!m.done)&&!m.expired&&(["take","pay","quiz","quest"].includes(m.kind)||(m.kind==="event"&&(m.ev==="kongka"||m.ev==="thief"||m.ev==="tuy"||m.ev==="dress"||m.ev==="qshow")));
/* v1.91.32: the player may delete letters — never an event invitation, and only once a letter no longer waits on an answer */
function mailKeep(m){if(!m)return "";evSettle(m);if(m.kind==="event"&&m.ev==="loy")return "event";if(m.bk&&!m.done)return "event";if(m.lg)return "event";if(m.done||m.expired)return "";if(mailOpen(m))return "act";
  if(m.kind==="lotto"){try{const [s,i]=String(m.draw).split("_").map(Number),d=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);return d&&d.res&&!d.done?"act":"";}catch(e){return "";}}
  if(m.kind==="loan")return typeof loanOk==="function"&&loanOk(G)?"act":"";if(m.kind==="job"||m.kind==="event")return "act";return "";}
const mailDelN=()=>(G.mail||[]).filter(m=>m.read&&!mailKeep(m)).length;
function mailDel(ids){const S=new Set(ids);const n0=(G.mail||[]).length;G.mail=(G.mail||[]).filter(m=>!S.has(m.id)||mailKeep(m));return n0-G.mail.length;}
function mailBadge(){if(!G||!G.mail)return 0;return G.mail.filter(m=>!m.read||mailOpen(m)).length;}
const MAILBOX_PX=pxIcon(["....kkkk....","...kffffk...","..krrrrrrk..",".krrrrrrrrk.",".krwwwwwwrk.",".krwkkkkwrk.",".krwwwwwwrk.",".krrrrrrrrk.",".kkkkkkkkkk.",".....kk.....",".....kk.....","....kkkk...."],{k:"#2a1a10",r:"#c8283c",w:"#f4ead8",f:"#f7d24a"});
const BILLS=[["เทศบาลตำบล",G=>`ค่าปรับ: ${petIntro(G,"rooster")}ขันเสียงดังเกินเกณฑ์ตอนตีสี่ (ร้องเรียน 14 ราย)`,300,G=>hasPet(G,"rooster")],
 ["ลุงหวังวินมอไซค์","ค่าซ่อมกระจกหน้ารถ ลูกเตะหลุดจากกระสอบลอยข้ามรั้วมา",800],
 ["ร้านข้าวมันไก่เจ๊ติ๋ม","ใบแจ้งหนี้: นักมวยค่ายท่านกินเชื่อไว้ 46 จาน (มีลายเซ็นครูแดงกำกับ)",1840],
 ["สหกรณ์น้ำแข็งหลอด","ค่าน้ำแข็งเดือนนี้ — อ่างน้ำแข็งของท่านใช้มากกว่าโรงงานปลาทั้งอำเภอ",900],
 ["ป้าแต๋ว ส้มตำ","ค่าครกแตก: มีคนในค่ายท่าน 'สาธิตศอกกลับ' ใส่ครกป้า",450],
 ["สำนักงานป้ายโฆษณา","ภาษีป้าย: ป้ายค่ายท่านใหญ่กว่าป้ายวัด ต้องเสียเพิ่ม",600,G=>G.fac.brand>=1],
 ["การไฟฟ้าส่วนภูมิภาค","ค่าไฟพิเศษ: สปอตไลท์ค่ายท่านสว่างจนนกบินผิดทาง",1200,G=>(G.fac.lights||0)>=1],
 ["สมาคมสองแถวสายวัด","ค่าธรรมเนียมจอดสองแถวหน้าวัด (มีนักเรียนท่านตะโกนเชียร์ในรถ)",350,G=>(G.fac.van||0)>=1],
 ["คลินิกสัตว์ ตำบล",G=>`ค่ารักษา${petIntro(G,"cat").trim()}: กินขนมครกมากเกินไป`,500,G=>hasPet(G,"cat")],
 /* v1.91.208 (Man: more pet trouble, it's funny) — each only arrives if the camp has that pet */
 ["ร้านปลาทูแม่กลอง ตลาดเช้า",G=>`ค่าปลาทู 1 เข่ง: ${petIntro(G,"cat")}มานั่งหน้าแผงทำตาแป๋ว ลูกค้าเลยซื้อให้… ลงบัญชีค่ายท่าน`,380,G=>hasPet(G,"cat")],
 ["ร้านซ่อมมอไซค์ช่างเปี๊ยก",G=>`ค่ากระจกมองข้าง 3 บาน: ${petIntro(G,"rooster")}เห็นตัวเองในกระจกแล้วตีจนแตก`,540,G=>hasPet(G,"rooster")],
 ["ร้านหมูปิ้งหน้าโรงเรียน",G=>`ค่าหมูปิ้ง 23 ไม้: ${petIntro(G,"dog")}คาบไปทั้งถาดตอนป้าหันไปทอนเงิน`,460,G=>hasPet(G,"dog")],
 ["ไปรษณีย์ตำบล",G=>`ค่าชดเชยกางเกงบุรุษไปรษณีย์: ${petIntro(G,"dog")}วิ่งไล่ตั้งแต่ปากซอยถึงหน้าค่าย (ขาดไปหนึ่งขา)`,350,G=>hasPet(G,"dog")],
 ["วัดประจำตำบล",G=>`ค่าบัวสระวัด: ${petIntro(G,"turtle")}แอบลงไปกินบัวที่ปลูกไว้ถวายพระจนหมดสระ`,400,G=>hasPet(G,"turtle")],
 ["อบต. ฝ่ายจราจร",G=>`ค่าเจ้าหน้าที่โบกรถ: ${petIntro(G,"turtle")}เดินข้ามถนนหน้าค่าย ใช้เวลา 40 นาที รถติดยาวถึงหน้าวัด`,300,G=>hasPet(G,"turtle")],
 ["บ่อปลาลุงเหม",G=>`ค่าปลานิล 9 ตัว: ${petIntro(G,"otter")}ลงบ่อตอนตีสาม ขึ้นมาพร้อมพุงกลม ๆ`,650,G=>hasPet(G,"otter")],
 ["ร้านซักรีดป้าจุ๋ม",G=>`ค่าซักใหม่ทั้งกอง: ${petIntro(G,"otter")}ขึ้นจากคลองแล้วไปกลิ้งบนผ้าขาวที่เพิ่งรีดเสร็จ`,300,G=>hasPet(G,"otter")]];
const QUIZ=[["ก่อนขึ้นชก นักมวยไทยทำพิธีอะไรบนเวที?",["ไหว้ครูรำมวย","ร้องเพลงชาติ","วิดพื้นโชว์"],0],
 ["มวยไทยได้ชื่อว่าเป็นศิลปะแห่งกี่อาวุธ?",["หกอาวุธ","แปดอาวุธ","สิบอาวุธ"],1],
 ["เครื่องสวมศีรษะที่นักมวยใส่ตอนไหว้ครู เรียกว่าอะไร?",["มงคล","ประเจียด","ผ้าคาดผม"],0],
 ["ผ้าที่ผูกต้นแขนนักมวย เรียกว่าอะไร?",["มงคล","ประเจียด","สายสิญจน์"],1],
 ["ตามกลอนมวยไทย 'หมัดหนักโคราช ฉลาดลพบุรี ท่าดีไชยา…' มวยเมืองไหนขึ้นชื่อเรื่องฉลาด?",["โคราช","ลพบุรี","ไชยา"],1],
 ["นักมวยไทยในตำนานที่ถูกจับไปพม่า แล้วชกชนะนักมวยพม่าหลายคน คือใคร?",["นายขนมต้ม","นายขนมครก","นายขนมชั้น"],0],
 ["วงดนตรีที่บรรเลงระหว่างชกมวยไทย ใช้เครื่องดนตรีอะไรเป็นหลัก?",["ปี่ชวา กลองแขก ฉิ่ง","กีตาร์ กลองชุด","ระนาด ขิม"],0],
 ["มวยไทยอาชีพตามมาตรฐานทั่วไป ชกกันกี่ยก?",["3 ยก","5 ยก","12 ยก"],1],
 ["คนบนเวทีที่ดูแลให้ชกตามกติกา เรียกว่าอะไร?",["กรรมการห้ามมวย","พี่เลี้ยง","โปรโมเตอร์"],0],
 ["วันมวยไทยตรงกับวันที่เท่าไร?",["6 กุมภาพันธ์","17 มีนาคม","1 เมษายน"],1],
 ["อาวุธ 'ศอก' ในมวยไทย ใช้ส่วนไหนของร่างกาย?",["ข้อศอก","หัวเข่า","ส้นเท้า"],0],
 ["น้ำมันที่ทาตัวนักมวยก่อนขึ้นชก เรียกกันว่าอะไร?",["น้ำมันมวย","น้ำมันมะพร้าว","น้ำมันพืช"],0],
 ["ท่า 'จระเข้ฟาดหาง' คือการออกอาวุธแบบไหน?",["หมุนตัวเตะกลับหลัง","กระโดดเข่า","หมัดตรง"],0],
 ["ในมวยไทย การจับคอคู่ชกแล้วตีเข่า เรียกว่าอะไร?",["ปล้ำ","ทุ่ม","ล็อกแขน"],0],
 ["มวยไทยบนเวทีอาชีพ นักมวยสวมอะไรที่มือ?",["นวม","ถุงเท้า","ถุงมือผ้าห่ม"],0],
 ["ครูแดงบอกว่าอะไรสำคัญที่สุดก่อนวันชก?",["นอนให้พอ","กินหมูกระทะ","ดูละครหลังข่าว"],0],
 ["แมวส้มประจำค่ายศิริชัยชอบกินอะไรที่สุด? (คำถามจากแฟนรายการ)",["ขนมครก","ปลาทู","ข้าวมันไก่"],0],
 ["พระมหากษัตริย์ที่เลื่องลือว่าปลอมพระองค์ไปชกมวยกับชาวบ้าน คือพระองค์ใด?",["พระเจ้าเสือ","พระเจ้าช้างเผือก","พระเจ้าปราสาททอง"],0]];

const WIN_BONUS=[
 ["ร้านข้าวมันไก่เจ๊ติ๋ม","โบนัสชนะ!","เมื่อคืนลูกค้าเชียร์ค่ายคุณจนลืมจ่ายเงิน แต่วันนี้ขายดีเป็นประวัติการณ์ เจ๊แบ่งให้ค่ายส่วนหนึ่ง (หนี้ 46 จานยังอยู่นะ)"],
 ["ปั๊มน้ำมันประจำอำเภอ","รางวัลนักมวยชนะประจำสัปดาห์","ทางปั๊มมอบโบนัสให้ค่ายที่ชนะเมื่อวาน แถมคูปองล้างรถหนึ่งใบ (ใช้ได้เฉพาะวันอังคาร)"],
 ["แฟนคลับมวยหญิงบ้านเรา","เรี่ยไรให้ค่ายคนชนะ","ทุกคนในกลุ่มไลน์ลงขันคนละนิด ดีใจที่เห็นค่ายเล็ก ๆ ชนะได้ อย่าลืมไลฟ์ให้ดูบ้างนะ"],
 ["ร้านส้มตำป้าแต๋ว","ส่วนแบ่งยอดขาย","ลูกค้าแห่มาสั่ง 'ส้มตำเผ็ดระดับนักมวย' หลังไฟต์เมื่อวาน ป้าแบ่งกำไรให้ค่าย ครกใหม่ยังไม่ได้ซื้อนะ"],
 ["วินมอเตอร์ไซค์หน้าตลาด","พี่วินลงขัน","พวกพี่แทงข้างค่ายคุณแล้วได้ ขอแบ่งให้ค่ายหน่อย ถือว่าค่าน้ำมันใจ"],
 ["สหกรณ์น้ำแข็งหลอด","คืนเงินค่าน้ำแข็ง","ยินดีด้วยกับชัยชนะ สหกรณ์คืนเงินค่าน้ำแข็งเดือนนี้บางส่วน เพราะค่ายคุณทำให้คนในอำเภอหันมาแช่น้ำแข็งตาม"]];
const GIG_WEEKS=[10,15,20,25,30,35];
const GIGS=[
 ["ร้านสะดวกซื้อเปิดใหม่","ค่าตัวงานตัดริบบิ้น","ขอบคุณนักมวยค่ายศิริชัยที่มาเตะกระสอบโชว์หน้าร้าน ลูกค้ามุงจนรถติดหน้าปากซอย นี่คือค่าตัวตามตกลงค่ะ"],
 ["โรงเรียนบ้านหนองแฝก","ค่าสาธิตป้องกันตัว","เด็ก ๆ ชอบมาก ตอนนี้ทั้งโรงเรียนเดินไหว้ครูกันทั้งวัน ครูใหญ่ฝากค่าตอบแทนมาให้ค่าย"],
 ["งานกาชาดจังหวัด","ค่าตัวขึ้นเวทีโชว์","โชว์รำมวยของค่ายคุณมีคนดูมากกว่าประกวดนางงาม คณะกรรมการจัดงานขอบคุณมาก"],
 ["ช่องยูทูบ 'กินกับมวย'","ค่าโฆษณาคลิปไวรัล","คลิปนักมวยค่ายคุณกินหมูกระทะหลังซ้อมได้ล้านวิว นี่คือส่วนแบ่งค่าโฆษณา (หมูหมดร้านจริง)"],
 ["โรงแรมริมปิง","ค่าคลาสมวยไทยให้นักท่องเที่ยว","แขกต่างชาติติดใจ ขอจองคลาสอีกรอบ และขอถ่ายรูปกับแมวส้มด้วย"],
 ["ทีมฟุตบอลประจำจังหวัด","ค่าเทรนความฟิต","นักเตะทั้งทีมขาสั่นไปสามวันหลังซ้อมกับค่ายคุณ โค้ชบอกว่าคุ้มทุกบาท"]];
// story & flavour letters (once each)
const STORY_MAIL=[
 {id:"ml_landlord",when:G=>G.week>=3,from:"เจ๊หมวย (เจ้าของที่ดิน)",title:"เรื่องหนี้ค่าย",body:"ถึงผู้จัดการคนใหม่ หนี้ของปู่ชัยยังเหลืออยู่นะจ๊ะ ระบบจะหักเองทุก 4 สัปดาห์ ไม่ต้องตกใจ ป.ล. ครั้งหน้ามาจ่ายที่บ้าน ช่วยหิ้วคิทแคทชาเขียวมาด้วยห่อนึง ไม่ได้บังคับ (บังคับ)"},
 {id:"ml_kidfan",when:G=>G.flags&&G.flags.firstWin,from:"ด.ญ.น้ำหวาน ป.3",title:"ถึงพี่นักมวย",body:"พี่ค่ะ หนูดูพี่ชกที่งานวัด พี่เก่งมากเลย หนูวาดรูปพี่มาให้ด้วย (รูปติดมากับซอง: นักมวยตัวกลมมีเขา…น่าจะเป็นมงคล) โตขึ้นหนูจะเป็นนักมวยเหมือนพี่ หรือไม่ก็เป็นแม่ค้าขายลูกชิ้น"},
 {id:"ml_district",when:G=>G.week>=21&&G.flags.qualDone,from:"สมาคมมวยอำเภอ",title:"ยินดีต้อนรับสู่รอบอำเภอ",body:"ขอแสดงความยินดีที่ผ่านรอบตำบล รอบอำเภอแต้มเริ่มนับใหม่ ท็อป 4 ได้ไปรองชิงจังหวัดสัปดาห์ 44 กรุณาแต่งกายสุภาพ ห้ามนำไก่ชนเข้าสนาม (เราจำได้นะ)"},
 {id:"ml_ploy",when:G=>G.flags&&G.flags.beat_ploy>=1,from:"พลอย ค่ายพยัคฆ์ทอง",title:"(ลายมือเรียบร้อยมาก)",body:"ยินดีด้วยนะคะ ครั้งนี้เป็นของกะทิ ฉันยอมรับ แต่ฉันขอบคุณด้วย…ไม่มีใครทำให้ฉันกลัวแพ้มานานแล้ว ตั้งแต่คืนนี้ฉันจะซ้อมเหมือนคนที่ยังไม่เคยชนะ เจอกันที่นัดชิงค่ะ — พลอย"},
 {id:"ml_fah",when:G=>G.flags&&G.flags.beat_fah>=1,from:"ฟ้า ค่ายพยัคฆ์ทอง",title:"อ่านด้วย!!",body:"ฟลุคย่ะ!! (ขีดฆ่า) …ก็ได้ เก่งจริง แต่ฟ้าจะวิ่งขึ้นเขาทุกเช้าจนกว่าจะชนะคืน บอกมะลิด้วยว่าอย่าเพิ่งดีใจ!! ป.ล. ขนมที่ฝากมาอร่อย (ไม่ได้ชม)"},
 {id:"ml_semis",when:G=>G.week>=41&&G.flags.finalDone,from:"สมาคมมวยจังหวัด",title:"บัตรเชิญศึกรองชิงจังหวัด",body:"ขอเชิญเข้าร่วมศึกรองชนะเลิศระดับจังหวัด สัปดาห์ที่ 44 ผู้ชนะชิงเข็มขัดสัปดาห์ที่ 49 ถ่ายทอดสดทางเพจสมาคม (ยอดวิวปีที่แล้ว 312 วิว ปีนี้ตั้งเป้า 400)"},
 {id:"ml_grandpa_fan",when:G=>G.rep>=20,from:"ลุงชาญ เพื่อนเก่าปู่ชัย",title:"ข่าวค่ายถึงหูลุงแล้ว",body:"ลุงอ่านข่าวในกลุ่มไลน์ผู้สูงอายุ ค่ายศิริชัยกลับมาแล้วจริง ๆ ปู่ชัยคงยิ้มอยู่ข้างบน ลุงไม่มีเงินช่วย แต่ส่งพระเครื่องมาให้องค์นึง เขาว่าดีทางแคล้วคลาด (ลุงไม่แน่ใจ)"}];
// earned money — sponsors only write after real results
const SPONSOR_MAIL=[
 {id:"sp_moo",when:G=>roster(G).some(f=>f.form&&f.form.slice(0,3).join("")==="WWW"),from:"ร้านหมูปิ้งป้าศรี",title:"ขอเป็นสปอนเซอร์เล็ก ๆ",body:"เห็นนักมวยค่ายชนะสามไฟต์ติด ป้าขอแปะป้ายร้านที่มุมเวทีค่ายได้ไหม ป้ามีให้เท่านี้นะ",amt:1500},
 {id:"sp_oil",when:G=>(G.cal||[]).filter(c=>c.res==="W").length>=8,from:"น้ำมันมวยตราช้างสามเศียร",title:"ข้อเสนอสปอนเซอร์",body:"ทางบริษัทขอสนับสนุนค่ายที่ชนะต่อเนื่อง แลกกับให้นักมวยทาน้ำมันมวยตราเราออกสื่อ (กลิ่นแรง ขออภัยล่วงหน้า)",amt:4000},
 {id:"sp_pump",when:G=>G.week>=41&&[...((G.semis||{}).A||[]),...((G.semis||{}).B||[])].some(id=>G.F[id]&&G.F[id].camp==="player"),from:"ปั๊มน้ำมันหน้าอำเภอ",title:"ร่วมเชียร์ค่ายเข้ารองชิง",body:"ทางปั๊มขอสนับสนุนค่ายตัวแทนอำเภอ เติมน้ำมันครบ 500 รับน้ำดื่มฟรี (สำหรับลูกค้า) ส่วนค่ายรับเงินสนับสนุนตามนี้ครับ",amt:8000},
 {id:"sp_beatploy",when:G=>G.flags&&G.flags.beat_ploy>=1,from:"สมาคมแฟนมวยหญิง",title:"รางวัลล้มยักษ์",body:"ขอมอบเงินรางวัลให้ค่ายที่ล้มพลอยได้ เป็นครั้งแรกในรอบสองฤดูกาล กองเชียร์ลงขันกันมาค่ะ",amt:5000}];

/* v1.91.198 (Man: give the runners more story) — Suea Dam keeps score. His letters answer the last result; three wins over him bring a last dare at full tilt,
   and once he is beaten in that one he tips his cap and turns up at sports day as Golden Tiger's anchor instead. */
const RUN_DARE={first:["ท้าวิ่ง 100 เมตร","ได้ยินว่าค่ายศิริชัยซ้อมวิ่งทุกอาทิตย์ ลองมาวิ่งกับฉันที่ลานวัดสักเที่ยวไหม แพ้ก็ไม่ต้องอาย ใครก็แพ้ฉันทั้งนั้น"],
  won:[["อีกสักตาไหม","ตาที่แล้วขาฉันยังไม่ตื่น ไม่นับ ๆ วันเสาร์นี้ลานวัดเหมือนเดิม ตอนนี้ {w} ต่อ {l} ฉันยังไม่ยอมนะ"],["ฉันซ้อมออกตัวมาแล้ว","เสี่ยต๋องตั้งรางวัลน้ำแดงหนึ่งลังให้คนชนะ ฉันซ้อมออกตัวทุกเช้ามาทั้งอาทิตย์ สกอร์ {w} ต่อ {l} คราวนี้ฉันเอาคืนแน่"]],
  lost:[["ลานวัดคึกคักอีกแล้ว","คนแถววัดยังพูดถึงตาที่แล้วไม่หยุด {l} ต่อ {w} ให้ฉันนำ จะมาแก้มือไหม ป้าแต๋วตั้งโต๊ะส้มตำรอแล้ว"],["ยังกล้ามาไหม","ได้ยินว่าครูแดงให้วิ่งเพิ่มทุกเช้า ไม่ช่วยหรอก ขาเสือดำไม่มีวันแพ้นักมวย ตอนนี้ฉันนำ {l} ต่อ {w}"]],
  final:["คำท้าครั้งสุดท้าย","แพ้มาสามครั้งแล้ว ครั้งนี้ฉันวิ่งเต็มขาไม่มีกั๊ก ถ้าแพ้อีก ฉันจะไม่เขียนมาอีกแล้ว แต่ถ้าฉันชนะ… เตรียมใจไว้ได้เลย"]};
function runDareLetter(){const D=G.dare=G.dare||{w:0,l:0,n:0};const f=t=>t.replace("{w}",D.w).replace("{l}",D.l);
  if(!D.n)return {t:RUN_DARE.first[0],b:RUN_DARE.first[1]};if(D.w>=3)return {t:RUN_DARE.final[0],b:RUN_DARE.final[1],final:1};
  const P=D.last==="W"?RUN_DARE.won:RUN_DARE.lost,x=P[D.n%P.length];return {t:x[0],b:f(x[1])};}
/* always Suea Dam, the one who wrote the letter — a touch quicker than our quickest, a little more on the last dare */
function runDareRival(final){const R=roster(G).slice().sort((a,b)=>runVmax(b)-runVmax(a))[0],y=G.season||1;
  const base=R?Math.min(21.5,(R.a.speed||10)+1.2+(final?.6:0)):12;return runNpc("dare_suea","เสือดำ พยัคฆ์ทอง",base,Math.min(20,12+y),46);}
const TAM_MAIL=[["ร้านคนแน่น มาช่วยหน่อย!","สุดสัปดาห์นี้มีงานวัด ลูกค้าต่อคิวยาวถึงหน้าโบสถ์ ป้าตำคนเดียวไม่ทัน ส่งนักมวยมือหนัก ๆ มาช่วยสักคนนะลูก ค่าจ้างตามฝีมือ แถมส้มตำกลับบ้าน"],
 ["รถทัวร์ลงร้านป้า!","นักท่องเที่ยวลงรถทัวร์มาสามคันรวด สั่งส้มตำไทยไม่เผ็ดกันทั้งคัน ป้าแขนจะหลุดแล้ว มาช่วยหน่อยเถอะ"],
 ["ลูกจ้างป้าลาป่วย","น้องที่ช่วยป้าตำไข้ขึ้น ร้านยังต้องเปิด ใครว่างแวะมาช่วยครึ่งวัน ป้าให้ค่าแรงงาม ๆ เลย"],
 ["ส้มตำปูปลาร้าเมนูใหม่","ป้าคิดเมนูใหม่ได้ อยากให้นักมวยค่ายศิริชัยมาช่วยตำเปิดตัว คนดูเยอะ ได้โปรโมทค่ายไปด้วยนะ"]];
const LOAN_MAIL=[
 ["ลูกน้องหมวกทอง","เงินด่วน ไม่ต้องค้ำ ไม่ต้องรอ","นามบัตรสีทองเสียบมาในตู้จดหมาย \"ค่ายมวยเงินช็อต? หมวกทองช่วยได้! ยืม ฿20,000 วันนี้ ดอกแค่ 10% ทุกสี่อาทิตย์ โทรเลย\""],
 ["ลูกน้องหมวกทอง","ได้ข่าวว่าช่วงนี้เงินตึงมือ","ใบปลิวพับสี่เขียนลายมือหวัด ๆ \"เห็นค่ายเงียบ ๆ ไปนะเฮีย เงินสดสองหมื่นรออยู่ เรื่องดอกไว้ค่อยคุย ค่อยคุยจริง ๆ\""],
 ["เสี่ยหมวกทองคำ (ฝ่ายการตลาด)","โปรโมชันพิเศษสำหรับค่ายมวย","แผ่นพับมันวาวพิมพ์สี่สี รูปเสี่ยยิ้มชูนิ้วโป้ง \"สมาชิกใหม่ กู้ง่าย คืนเมื่อไหร่ก็ได้* (*ดอกขึ้นทุกสี่อาทิตย์)\""],
 ["ลูกน้องหมวกทอง","ฝากถึงผู้จัดการค่ายศิริชัย","ซองสีน้ำตาลมีคราบน้ำมันเครื่อง \"รู้นะว่าค่าไฟเดือนนี้ยังไม่จ่าย เรามีเงินสองหมื่น ไม่ต้องค้ำ ไม่ถามเยอะ ถามแค่ว่าจะคืนเมื่อไหร่\""],
 ["ลูกน้องหมวกทอง","คูปองเงินกู้ (ตัดเก็บไว้)","กระดาษตัดเป็นรูปคูปอง ขอบหยัก ๆ เหมือนตัดด้วยกรรไกรตัดเล็บ \"แลกเงินสด ฿20,000 ได้ทันที ไม่มีวันหมดอายุ แต่ดอกมีวันขึ้น\""]];
const LOAN_COACH=["อย่าเพิ่ง ลองดูจดหมายงานจ้างกับไฟต์งานวัดก่อน","ปู่ชัยก็เคยได้นามบัตรใบนี้ ใบเดียวกันเป๊ะ","ถ้าจำเป็นจริง ๆ ก็กู้ แต่รีบคืน ดอกมันโตเร็วกว่ากะทิอีก","ครูเก็บไว้ให้ดู ไม่ได้บอกให้โทรนะ","อ่านตัวเล็ก ๆ ตรงดอกจันด้วย"];
function mailWeekly(G){G.mail=G.mail||[];if(typeof thiefMail==="function"){thiefMail(G);tuyMail(G);}if(typeof regionWeek==="function")regionWeek(G);G.gang=G.gang||{st:0,next:0};G.mailSeen=G.mailSeen||{};const rng=mulberry32(G.seed+G.week*4441);
  if(typeof lottoWeekly==="function")lottoWeekly(G);
  for(const m of G.mail)if(m.expAbs!=null&&gameWeek(G)>m.expAbs&&!m.done)m.expired=true;
  // v1.88: every time cash dips low, the helmet gang slips a gold card into the mailbox
  if(typeof loanOk==="function"){const low=loanOk(G);
    if(low&&!G.loanMailArm){G.loanMailArm=1;const n=G.loanMailN=(G.loanMailN||0)+1,L=LOAN_MAIL[(n-1)%LOAN_MAIL.length],C=LOAN_COACH[(n-1)%LOAN_COACH.length];
      addMail(G,{kind:"loan",from:L[0],title:L[1],body:`${L[2]} (หลังซองมีลายมือครูแดงเขียนไว้: "${C}")`});}
    else if(!low&&(G.loan>0||G.cash>=LOAN_LOW+4000))G.loanMailArm=0;}
  for(const M of STORY_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"letter",from:M.from,title:M.title,body:M.body});}
  for(const M of SPONSOR_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"take",from:M.from,title:M.title,body:M.body,amt:M.amt});}
  // v1.89.24: win against the gang often enough and they call you out to their own warehouse
  if((G.gang.beat||0)-(G.gang.hqAt||0)>=3&&G.week<=48&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){const i=G.gang.hqN||0,k=["gang4","gang6","gang3"][i%3],year=G.season||1;G.gang.hqN=i+1;G.gang.hqAt=G.gang.beat;
    addMail(G,{kind:"quest",q:"gang",qk:k,hq:1,from:"แก๊งหมวกกันน็อก (สอดมาใต้ประตู)",title:"จดหมายท้า: มาเจอกันที่โกดัง",
      body:`กระดาษสีแดงลายมือหวัด ๆ: "ค่ายศิริชัยล้มลูกน้องข้าไปหลายรอบแล้ว ถ้าแน่จริงมาที่โกดังหลังตลาดเช้า ${QK[k].name}รออยู่ ชนะได้ข้าจ่ายค่าเหนื่อยให้ แพ้ก็อย่ามาเหยียบตลาดอีก"`,exp:G.week+3,pay:4000+year*1000});}
  // gang: after the first market fight, the next tier writes in every few weeks
  if(G.gang.st>=1&&G.gang.st<5&&gameWeek(G)>=(G.gang.nextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)&&G.week<=48){const early=G.gang.st===3&&G.loan>0,k=early?"gang5":"gang"+(G.gang.st+1);
    if(early){addMail(G,{kind:"quest",q:"gang",qk:k,early:1,from:"แม่ค้าตลาดเช้า (ไม่ลงชื่อ)",title:"เสี่ยหมวกทองคำลงมาเอง!",body:`ลูกน้องมันแพ้ค่ายศิริชัยมาสามรอบติด เสี่ยหมวกทองคำเสียหน้าหนัก เลยลงมาคุมตลาดเอง แถมรู้ว่าค่ายติดหนี้มันอยู่ เขาลือกันว่าถ้าใครล้มเสี่ยได้ หนี้ทั้งตลาดก็จบ`,exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
    else addMail(G,{kind:"quest",q:"gang",qk:k,from:"แม่ค้าตลาดเช้า (ไม่ลงชื่อ)",title:G.gang.st>=4?"เสี่ยหมวกทองคำมาเอง!":"พวกหมวกกันน็อกกลับมาอีกแล้ว",
      body:[`พวกมันกลับมาเก็บดอกอีกแล้ว คราวนี้มี "${QK[k].name}" มาคุม ใครไม่จ่ายร้อยละยี่สิบ โดนพังแผง ช่วยพวกเราอีกครั้งได้ไหม`,`ไอ้${QK[k].name}มันขู่ว่าจะยึดรถเข็นลูกชิ้นของยายแหวว ถ้าค่ายศิริชัยยังไม่หยุดมันก็ไม่มีใครหยุดได้แล้ว`,`ตลาดทั้งตลาดเงียบหมด เพราะ "${QK[k].name}" มานั่งเฝ้าตั้งแต่ตีห้า ขอร้องล่ะ`,`เขาว่าหัวหน้าใหญ่ "${QK[k].name}" จะมาเก็บเงินเอง ทั้งตลาดเป็นหนี้มันหมด ถ้าล้มตัวนี้ได้ แก๊งจบแน่`][G.gang.st-1],exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
  // The helmet gang keeps returning; escaped-animal challenges are sent by mail below.
  if(G.week>=7&&G.week<=50){const year=G.season||1;
    if(G.gang.st>=5&&gameWeek(G)>=(G.gang.loopNextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){
      const i=G.gang.loopN||0,k=["gang2","gang3","gang4","gang6","gang5"][i%5];G.gang.loopN=i+1;G.gang.loopNextAbs=gameWeek(G)+Math.max(3,10-year);
      addMail(G,{kind:"quest",q:"gang",qk:k,repeat:1,from:"ป้าศรี ตลาดเช้า",title:"แก๊งหมวกกันน็อกกลับมาอีก",body:`${QK[k].name} กลับมาก่อเรื่องที่ตลาดอีกแล้ว คราวนี้พวกมันซ้อมมาหนักกว่าเดิม ช่วยมาจัดการให้หน่อยได้ไหม`,exp:G.week+3,pay:3000+year*500});}}
  // Stadium titles: Tha Phae saves keep their original G.belt slots.
  for(const [venue,V] of Object.entries(STADIUMS))if((G.season||1)>=V.minYear&&V.weeks.includes(G.week))
    for(const div of [...new Set(roster(G).map(f=>f.div))]){const h=beltHolder(G,div,venue);if(!h)continue;
      const ours=h.camp==="player",op=ours?beltChallenger(G,div,h.id):h;if(!op)continue;const B=beltStore(G,venue)[div];
      addMail(G,{kind:"quest",q:"belt",venue,bg:V.bg,npc:op.id,div,defend:ours?h.id:null,from:`โปรโมเตอร์${V.name}`,title:ours?`ป้องกันเข็มขัด${V.name} รุ่น ${div}`:`ชิงเข็มขัด${V.name} รุ่น ${div}`,
        body:ours?`${op.name} ผ่านสายคัดเลือกมาท้าชิงเข็มขัดของ${h.name}ที่${V.name} ป้องกันหนึ่งไฟต์ ห้ายก รับภายในสองสัปดาห์ ชนะรับ ${fmt(V.defend)}`:`${V.name} เปิดทัวร์นาเมนต์รุ่น ${div} รวมแชมป์ ${op.name} แพ้คัดออก ชกไฟต์ละห้ายก ผู้ชนะรับ ${fmt(V.win)} พร้อมเข็มขัด หากเสียเข็มขัดต้องกลับมาแข่งรายการใหม่`,exp:G.week+2,pay:ours?V.defend:V.win});}
  // v1.69: Auntie Taew writes in for help at her som tam stall every few weeks (a minigame that does not use the camp activity)
  if(G.week>=4&&G.week<=49&&gameWeek(G)>=(G.tamNextAbs||4)&&!G.mail.some(m=>m.kind==="job"&&!m.done&&!m.expired)){G.tamNextAbs=gameWeek(G)+3+Math.floor(rng()*2);
    const T=TAM_MAIL[(G.mailN_tam=(G.mailN_tam||0)+1)%TAM_MAIL.length];addMail(G,{kind:"job",job:"somtam",exp:G.week+1,from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:T[0],body:T[1]});}
  // v1.91.195 (Man): a runner from Golden Tiger turns up to challenge the camp to a 100 m race now and then — stakes are pride, morale and a little fame
  if(G.week>=10&&G.week<=48&&gameWeek(G)>=(G.runDuelNextAbs||10+Math.floor(rng()*4))&&roster(G).length&&!(G.dare&&G.dare.done)&&!G.mail.some(m=>m.job==="run"&&!m.done&&!m.expired)){G.runDuelNextAbs=gameWeek(G)+7+Math.floor(rng()*4);
    const L=runDareLetter();addMail(G,{kind:"job",job:"run",exp:G.week+2,from:"เสือดำ ค่ายพยัคฆ์ทอง",title:L.t,body:L.b,final:L.final||0});}
  // First escaped-animal letters; later escapes use the same mailbox route.
  if(!G.mailSeen.cow&&G.week>=9&&rng()<.6){G.mailSeen.cow=1;addMail(G,{kind:"quest",q:"cow",qk:"bull1",from:"ลุงเฉลิม ฟาร์มโคนม",title:"ช่วยด้วย! วัวหลุด!!",body:"แม่นมสดวัวที่ดุที่สุดในฟาร์มหลุดคอก มันดูมวยทางทีวีทุกคืนจนตั้งการ์ดเป็น! ตอนนี้ยืนขวางถนนหน้าตลาด ใครเข้าใกล้โดนถีบหมด ส่งนักมวยมาช่วยที ลุงให้ค่าเหนื่อยพร้อมนมสดอีกหนึ่งถัง",exp:G.week+2,pay:1500});}
  if(!G.mailSeen.rooster&&G.week>=5&&rng()<.6){G.mailSeen.rooster=1;addMail(G,{kind:"quest",q:"rooster",qk:"rooster1",from:"เสี่ยต๋อง สนามไก่",title:"ไก่ผมหลุดเข้าค่ายคุณ",body:"ไก่แจ้หัวร้อนของผมบินข้ามรั้วไปจิกกระสอบทรายค่ายคุณตั้งแต่เช้า ใครเข้าใกล้มันตั้งท่ามวยใส่ ช่วยจับให้ทีครับ ผมให้ค่าจ้างและไข่ไก่สองแผง",exp:G.week+2,pay:1000});}
  G.runawayNext=G.runawayNext||{};
  if(G.runawayCadence!==3){for(const q of ["rooster","cow"])if(G.runawayNext[q]!=null){const last=G.mail.find(m=>m.q===q);G.runawayNext[q]=Math.min(G.runawayNext[q],last?.expAbs!=null?last.expAbs+1:gameWeek(G)+2);}G.runawayCadence=3;}
  for(const q of ["rooster","cow"])if(G.mailSeen[q]&&G.runawayNext[q]==null){const first=G.mail.find(m=>m.q===q&&!m.repeat);G.runawayNext[q]=first?.expAbs!=null?first.expAbs+1:gameWeek(G)+2;}
  if(G.week>=5&&G.week<=48)for(const q of ["rooster","cow"]){
    if(!G.mailSeen[q]||gameWeek(G)<G.runawayNext[q]||G.mail.some(m=>m.q===q&&!m.done&&!m.expired))continue;
    const cow=q==="cow",year=G.season||1;
    const k=cow?(year>=4?"bull3":"bull2"):(year>=4?"rooster5":"rooster3");
    G.runawayNext[q]=gameWeek(G)+3;
    addMail(G,{kind:"quest",q,qk:k,repeat:1,from:cow?"ลุงเฉลิม ฟาร์มโคนม":"เสี่ยต๋อง สนามไก่",title:cow?"วัวหลุดอีกแล้ว!":"ไก่หลุดอีกแล้ว!",body:cow?`ลุงปิดคอกแน่นแล้วแท้ ๆ แต่เจ้า${QK[k].name}ถีบประตูออกมาขวางทางตลาดอีกแล้ว ช่วยส่งนักมวยมาหยุดมันที`:`เจ้า${QK[k].name}หลุดจากสนามไก่มาจิกกระสอบทรายค่ายอีกแล้ว คราวนี้ตั้งการ์ดหลบคนจับเก่งขึ้น ช่วยทีครับ`,exp:G.week+2,pay:(cow?1500:1000)+Math.min(1000,(year-1)*200)});}
  // rivals we keep ignoring write in to taunt us
  const sn=Object.entries(G.snub||{}).filter(([id,n])=>n>=3&&G.F[id]&&!G.F[id].injury&&!G.F[id].canon&&(G.F[id].camp==="npc"||G.F[id].camp==="rival")&&!G.mailSeen["ch_"+(G.season||1)+"_"+id]&&!isBooked(G,id)).sort((a,b)=>b[1]-a[1])[0];
  if(sn&&rng()<.5&&G.week<=46){const op=G.F[sn[0]];G.mailSeen["ch_"+(G.season||1)+"_"+op.id]=1;
    addMail(G,{kind:"quest",q:"challenge",npc:op.id,from:op.name,title:"ทำไมไม่รับไฟต์ฉัน?",body:[`ส่งข้อเสนอไปตั้ง ${sn[1]} ครั้ง ค่ายศิริชัยไม่รับสักที กลัวเหรอ? ถ้าแน่จริงมาเจอกันหลังตลาดสด ไม่มีกรรมการ ไม่มีแต้ม มีแต่ศักดิ์ศรี`,`ได้ข่าวว่าค่ายพวกเธอเลือกคู่ชกเก่งนะ เลือกแต่คนที่ชนะได้ ฉันท้าตรงนี้เลย ไฟต์โชว์หน้าวัด คนดูเต็ม ถ้าไม่มาฉันจะบอกทั้งตำบลว่าพวกเธอหนี`,`ฉันอยู่ในลิสต์ข้อเสนอเธอมา ${sn[1]} สัปดาห์ เหมือนเมนูที่ไม่มีใครสั่ง วันนี้ฉันสั่งเอง: ไฟต์โชว์ กับใครก็ได้ในค่ายเธอ`][sn[1]%3],exp:G.week+3,pay:1500});}
  // v1.33: temple-fair purses arrive by mail the week after
  for(const p of (G.fairPay||[]))addMail(G,{kind:"take",from:"กรรมการงานวัด",title:p.res==="W"?"ค่าตัวไฟต์งานวัด (ชนะ)":"ค่าตัวไฟต์งานวัด",body:p.res==="W"?`ซองค่าตัวจากงานวัด ชนะ${p.op}มา คนดูชอบใจ ใส่ซองเพิ่มให้นิดหน่อย`:`ซองค่าตัวจากงานวัด แม้จะแพ้${p.op} แต่คนดูก็ปรบมือให้`,amt:p.amt});
  G.fairPay=[];
  // quiz from the community radio
  // v1.26: mid-season income — sponsors reward a win, paid appearances every few weeks
  const won=(G.cal||[]).some(c=>c.absWeek!=null&&c.absWeek>=gameWeek(G)-1&&c.res==="W"&&G.F[c.a]&&G.F[c.a].camp==="player"&&!(TIER[c.tier]&&TIER[c.tier].off));
  if(won&&G.week>=6&&G.week<=42&&rng()<.2){const B=WIN_BONUS[(G.week+G.seed)%WIN_BONUS.length];addMail(G,{kind:"take",from:B[0],title:B[1],body:B[2],amt:Math.round((300+G.week*10)/50)*50});}
  const gi=GIG_WEEKS.indexOf(G.week);if(gi>=0&&G.campUsed===["promo","kids","fightnight","clip","tourist","class"][gi]){const g=GIGS[gi%GIGS.length];addMail(G,{kind:"take",from:g[0],title:g[1],body:g[2],amt:Math.round((500+G.week*15)/50)*50});}
  if(G.week%3===1&&G.week>=4&&G.week<=49){const q=QUIZ[(Math.floor(G.week/3)+G.seed)%QUIZ.length];addMail(G,{kind:"quiz",from:"วิทยุชุมชน 'มวยบ้านเรา'",title:"ชิงรางวัลประจำสัปดาห์",body:"ตอบถูกรับเงินรางวัลจากผู้สนับสนุนรายการ (ตอบได้ครั้งเดียว)",q:q[0],opts:q[1],ans:q[2],amt:Math.round((800+Math.min(2200,G.week*45))/10)*10,exp:G.week+2});}
  // odd bills
  if(G.week>=5&&rng()<.22){const L=BILLS.filter(b=>!b[3]||b[3](G));const b=L[Math.floor(rng()*L.length)];addMail(G,{kind:"pay",from:b[0],title:"ใบแจ้งหนี้",body:typeof b[1]==="function"?b[1](G):b[1],amt:Math.round(b[2]*(1+G.week/60)/10)*10,exp:G.week+2});}
  // odd fights posted to the offers board (rare, pays well)
  beastOffer(G,rng);
  qCleanup(G);}
const BEAST_WEEKS=[7,11,15,19,23,27,31,35,39,43,47];
function beastOffer(G,rng){const year=G.season||1,gap=Math.max(2,5-year);if(year===1?!BEAST_WEEKS.includes(G.week):G.week<5||G.week>49||(G.week-5)%gap!==0)return;const R=roster(G).filter(f=>!f.injury);if(!R.length)return;
  const i=year===1?BEAST_WEEKS.indexOf(G.week):Math.floor((G.week-5)/gap);const kinds=["rooster2","bull2","rooster3","bull2","rooster4","bull3","rooster4","rooster5","bull3","rooster5","bull3"];const kind=year>=4?["rooster4","bull3","rooster5","bull2","rooster3","bull3"][i%6]:kinds[i%kinds.length];const f=R[Math.floor(rng()*R.length)];
  const wk=G.week+2;if(G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-wk)<=1))return;const qid=makeQ(G,kind,f.id,"o"+G.week);const K=QK[kind];
  const win=Math.round((6000+G.week*180)*(1+K.lvl*.2)/100)*100,lose=Math.round(win*.35/100)*100;
  G.offers.unshift({id:`ob${G.week}_${f.id}`,a:f.id,b:qid,week:wk,tier:"beast",beast:kind,bg:QGRP_BG[K.grp],win,lose});
  const ev=K.grp==="rooster"?["งานวัดบ้านโป่ง","ศึกคนปะทะไก่ชน"]:["งานประจำปีอำเภอ","ศึกล้มวัว (ฉบับมวยไทย)"];
  addMail(G,{kind:"letter",from:ev[0],title:`เชิญร่วม "${ev[1]}"`,body:`ขอเชิญ${f.name}ขึ้นเวทีพิเศษกับ "${K.name}" สัปดาห์ ${wk} ค่าตัวดีกว่าไฟต์ปกติ (ไม่มีผลต่อสถิติและอันดับ) ข้อเสนออยู่ที่หน้าไฟต์แล้ว รับภายในสัปดาห์นี้นะครับ`});}

// ---------- quest fights ----------
function questFighters(){return roster(G).filter(f=>!f.injury);}
function startQuest(spec,fid,done){const f=G.F[fid];if(!f){done&&done();return;}
  const opp=spec.npc||makeQ(G,spec.qk,fid,spec.tag||("w"+G.week));const tier="quest";
  const b={id:"q"+G.week+"_"+fid+"_"+Math.floor(Math.random()*1e4),a:fid,b:opp,week:G.week,tier,rounds:spec.rounds||3,win:spec.purse||0,lose:0,quest:spec};
  b.title=spec.q==="belt"?STADIUMS[spec.venue||"tha"].name+" · "+spec.div:spec.q==="gang"?"ศึกแผงตลาด":spec.q==="rooster"||spec.q==="cow"||spec.q==="bull"?"ศึกพิสดาร":null;
  b.bg=spec.bg||(spec.rematch||spec.hq?"bg_gang_hideout.webp":spec.q==="belt"?STADIUMS[spec.venue||"tha"].bg:spec.npc?"bg_food.webp":QGRP_BG[QK[spec.qk].grp]);
  if(typeof questPlan==="function"){questPlan(b,()=>openFight(b,()=>questAfter(b,done)));return;}
  openFight(b,()=>questAfter(b,done));}
const GANG_HQ_TAUNT={gang3:"ที่ตลาดแกเก่ง แต่ที่นี่ถิ่นข้า!",gang4:"มาจนได้! ที่นี่ไม่มีแม่ค้าคอยเชียร์แล้วนะ หมวกเงินจะสอนมารยาทให้เอง",gang6:"เสี่ยสั่งมาว่าห้ามให้แกเดินออกจากโกดังนี้ไปง่าย ๆ"};
function questAfter(b,done){const S=b.quest,res=(G.cal||[]).slice(-1)[0];const win=res&&res.b===b.b&&res.res==="W";const me=G.F[b.a],op=G.F[b.b]||{name:"คู่ชก"};
  const fin=()=>{save();render();done&&done();};
  if(S.q==="gang"){G.gang=G.gang||{st:0,next:0};if(win)G.gang.beat=(G.gang.beat||0)+1;
    if(S.hq){if(win){G.rep+=.4;addMail(G,{kind:"take",from:"แก๊งหมวกกันน็อก",title:"ค่าเหนื่อยจากโกดัง",body:"ซองสีแดงยับ ๆ โยนมาทางหน้าต่าง: \"ข้าพูดคำไหนคำนั้น …อย่าบอกเสี่ยนะว่าแพ้\"",amt:S.pay||5000});}
      playScene(win?[{n:"npc",who:op.name,t:"…เอาไป ค่าเหนื่อย! ข้าพูดคำไหนคำนั้น แต่อย่าบอกเสี่ยนะว่าแพ้"},{n:b.a,f:"happy",l:"fight",t:"ขอบคุณค่ะ! ครั้งหน้าก็ไม่แพ้ค่ะ"}]:[{n:"npc",who:op.name,t:"ฮ่า! ถิ่นข้าก็ต้องเป็นของข้า!"},{n:b.a,f:"sad",l:"fight",t:"คราวหน้าหนูจะกลับมาใหม่ค่ะ"}],fin,{bg:"gang_hideout",look:"fight"});return;}
    if(S.rematch){if(win){G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.rep+=.2;}playScene([{n:"npc",who:"เสี่ยหมวกทองคำ",t:win?"คราวนี้ก็แพ้อีก! ครั้งหน้าจะมาใหม่":"ครั้งนี้ฉันชนะ! แต่ค่ายแกเก่งขึ้นเยอะ"},{n:b.a,f:win?"happy":"sad",l:"fight",t:win?"ค่ายศิริชัยพร้อมเสมอค่ะ":"ครั้งหน้าจะชนะให้ได้ค่ะ"}],fin,{bg:"gang_hideout",look:"fight"});return;}if(win){if(S.qk==="gang5")G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.gang.st=Math.max(G.gang.st,+S.qk.slice(4));G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);if(S.qk==="gang5"&&G.loan>0){G.loan=0;G.flags.loanWiped=1;}G.rep+=S.qk==="gang5"?2:.5;
      const amt=S.qk==="gang5"?12000:S.qk==="gang6"?8000:S.qk==="gang4"?5000:S.qk==="gang3"?2000:200+Math.floor(srand(G,7)*7)*50;
      addMail(G,{kind:"take",from:"(ไม่ระบุชื่อผู้ส่ง)",title:S.qk==="gang5"?"ตลาดเช้าขอบคุณค่ายศิริชัย":"ซองสีน้ำตาลไม่มีชื่อ",body:S.qk==="gang5"?"แก๊งหมวกกันน็อกยุบแล้ว หนี้นอกระบบของทั้งตลาดเป็นโมฆะ แม่ค้าทุกแผงลงขันกันมาให้ค่าย ขอบคุณที่ไม่ยืนดูเฉย ๆ":"ข้างในมีเงินกับกระดาษโน้ตลายมือสั่น ๆ: 'ขอบคุณที่ช่วยตลาด วันนี้ขายได้เต็มแผงเลย'",amt});
      playScene([{n:"npc",who:"ป้าศรี แม่ค้าผัก",t:S.qk==="gang5"?(G.flags.loanWiped===1?(G.flags.loanWiped=2,"เสี่ยหมวกทองคำล้มแล้ว!! ทั้งตลาดเป็นอิสระแล้วจ้า! สมุดหนี้ของมันโดนเผาทิ้งหมด หนี้ที่ค่ายกู้ไว้ก็หายไปด้วยนะ!"):"เสี่ยหมวกทองคำล้มแล้ว!! ทั้งตลาดเป็นอิสระแล้วจ้า!"):"ไปแล้ว! พวกมันขี่มอไซค์หนีไปแล้ว! ขอบใจนะหนู"},{n:b.a,f:"happy",l:"fight",t:S.qk==="gang5"?"ตลาดนี้มีคนคุ้มครองแล้วค่ะ ชื่อค่ายศิริชัย!":"ใครรังแกตลาดนี้ ต้องผ่านค่ายศิริชัยก่อนค่ะ!"},{n:"nar",t:"ตกเย็นมีซองสีน้ำตาลไม่มีชื่อผู้ส่งเสียบอยู่ที่ตู้จดหมายค่าย"}],fin,{bg:"market_morning",look:"fight"});return;}
    playScene([{n:"npc",who:op.name,t:"ฮ่า! ค่ายมวยก็แค่นี้! บอกแม่ค้าให้เตรียมดอกไว้!"},{n:b.a,f:"sad",l:"fight",t:"…ขอโทษนะคะ ป้า คราวหน้าหนูไม่แพ้แล้ว"},{n:"nar",t:"แม่ค้าบอกว่าไม่เป็นไร พวกมันจะกลับมาอีก และค่ายจะมีโอกาสอีกครั้ง"}],()=>{G.gang.nextAbs=gameWeek(G)+3;fin();},{bg:"market_morning",look:"fight"});return;}
  if(win&&S.pay){addMail(G,{kind:"take",from:S.from||"ผู้ว่าจ้าง",title:"ค่าเหนื่อยตามสัญญา",body:S.q==="cow"?"ค่าเหนื่อยพร้อมนมสดหนึ่งถัง (นมถูกดื่มหมดภายในสิบนาทีโดยนักมวยในค่าย)":S.q==="rooster"?"ค่าจ้างพร้อมไข่สองแผง ไก่แจ้กลับบ้านไปนอนซึม เจ้าของบอกว่ามันไม่เคยแพ้ใครมาก่อน":"เดิมพันข้างเวทีที่คนดูลงขันกัน ทั้งตำบลพูดถึงไฟต์นี้",amt:S.pay});G.rep+=.6;}
  if(S.q==="challenge")op&&(win?G.rep+=1:0);
  if(S.q==="belt"){const venue=S.venue||"tha",V=STADIUMS[venue],slot=beltStore(G,venue),B=slot[S.div];
    if(win&&!S.defend){slot[S.div]={id:me.id,def:0,since:G.week};G.rep+=3;me.belts=(me.belts||0)+1;
      recordHonor(G,"belt",me.id,S.div,G.week,venue==="tha"?null:venue,op?op.name:null,op?op.id:null);playHonorQueue(fin);return;}
    if(win&&S.defend){B.def++;G.rep+=1.5;recordHonor(G,"defense",me.id,S.div,G.week,venue==="tha"?null:venue,op?op.name:null,op?op.id:null);playHonorQueue(fin);return;}
    if(!win&&S.defend){slot[S.div]={id:op.id,def:0,since:G.week};playScene([{n:"nar",t:`เข็มขัด${V.name}เปลี่ยนมือไปอยู่กับ${op.name}`},{n:me.id,f:"sad",l:"fight",t:"…ขอโทษนะคะ หนูจะเอาคืนมาให้ได้"}],fin,{bg:V.scene,look:"fight"});return;}
    if(!win&&!S.defend&&B)B.def++;}
  fin();}

// first time — the market scene, then straight into the ring
function gangEventSteps(){const R=questFighters();const steps=[{n:"nar",t:"เช้าวันเสาร์ ตลาดสดหน้าวัด เสียงโวยวายดังมาจากแผงผัก"},
  {n:"npc",who:"ป้าศรี แม่ค้าผัก",t:"ไม่มีจริง ๆ จ้ะพ่อหนุ่ม เดือนนี้ผักเน่าไปครึ่งแผง ขอผ่อนอีกอาทิตย์นะ…"},
  {n:"npc",who:"ลูกกระจ๊อกหมวกแดง",t:"ดอกร้อยละยี่สิบต่อเดือนนะป้า! ไม่จ่ายวันนี้ แผงนี้พรุ่งนี้หายทั้งแผง!"},
  {n:"coach",t:"แก๊งหมวกกันน็อก… ปล่อยเงินกู้นอกระบบ ดอกร้อยละยี่สิบต่อเดือน ดูดเลือดชาวตลาดมาหลายปีแล้ว"},
  {n:"kati",f:"angry",l:"train",t:"ผู้จัดการคะ! ปู่ชัยสอนว่ามวยมีไว้ปกป้องคนที่สู้ไม่ได้ เราจะยืนดูเฉย ๆ ไม่ได้นะคะ!"},
  {choice:[...R.slice(0,3).map(f=>({t:`ส่ง${f.name}ไปจัดการ (ชกทันที · ล้า ${Math.round(f.fatigue)})`,fx:()=>{UI.qpend={q:"gang",qk:"gang1",fid:f.id};},then:[{n:"npc",who:"ลูกกระจ๊อกหมวกแดง",t:`ห๊ะ? นักมวยผู้หญิง? ${f.name}งั้นเหรอ มาเลย จะได้รู้ว่าหมวกกันน็อกไม่ได้ใส่ไว้โชว์!`}]})),
    {t:"แจ้งตำรวจแทน (ไม่ชก)",fx:()=>{UI.qpend=null;G.gang={st:0,nextAbs:gameWeek(G)+6,skip:1};},then:[{n:"nar",t:"ตำรวจมาถึงช้าไปสิบห้านาที พวกหมวกกันน็อกหายไปแล้ว ป้าศรีถอนหายใจยาว"},{n:"kati",f:"sad",l:"train",t:"…ครั้งหน้าถ้าเจออีก หนูไม่ยอมแล้วนะคะ"}]}]}];return steps;}
function questExtra(done,rng){if(!G||G.ended)return false;G.gang=G.gang||{st:0,next:0};
  const again=G.gang.skip&&G.gang.st===0&&!G.seen.q_gang_again&&gameWeek(G)>=(G.gang.nextAbs||0);
  const ok=(!G.seen.q_gang_first||again)&&G.week>=6&&G.week<=44&&questFighters().length;
  if(!ok||rng()>=(G.loan>0?.5:.2))return false;if(G.seen.q_gang_first)G.seen.q_gang_again=true;G.seen.q_gang_first=true;
  UI.qpend=null;playScene(gangEventSteps(),()=>{const p=UI.qpend;UI.qpend=null;if(!p){done();return;}G.gang.st=Math.max(G.gang.st,0);startQuest({q:"gang",qk:"gang1"},p.fid,done);},{bg:"market_morning",look:"train"});return true;}

// ---------- modals ----------
/* v1.89.24: the Loy Krathong invitation glows green until it is read and the gauntlet has been played once */
function loyMailHot(m){evSettle(m);if(m.kind==="event"&&(m.ev==="kongka"||m.ev==="thief"||m.ev==="tuy"||m.ev==="dress"||m.ev==="qshow"))return !m.done&&!m.expired;return m.kind==="event"&&m.ev==="loy";} /* v1.90.4: the Loy invitation always glows green so it is easy to find again */
/* v1.91.72 (Man): Naka League letters are green with a blinking green frame, regional letters have a blinking blue frame, the black card is black with a blinking red frame */
function mailTone(m){if(m.tone)return m.tone;const f=String(m.from||"");if(/ไม่มีชื่อผู้ส่ง|no sender/i.test(f))return "black";if(/นาคา|Naka|ไม่ลงชื่อ|Unsigned/i.test(f))return "naka";if(/แชมป์ภาค|regional champ/i.test(f))return "region";return "";}
function mailListHTML(){const L=G.mail||[];
  const nd=mailDelN();const bulk=!nd?"":UI.mdelAll?`<div class="mdelask"><span>ลบจดหมายที่อ่านแล้ว ${nd} ฉบับ? กู้คืนไม่ได้</span><button class="btn sm" data-act="mdelno">ไม่ลบ</button><button class="btn sm red" data-act="mdelallok">ลบ ${nd} ฉบับ</button></div>`:`<div class="mdelbar"><small>🔒 จดหมายอีเวนต์และจดหมายที่ยังไม่ได้ตอบจะไม่ถูกลบ</small><button class="btn sm ghost" data-act="mdelall">🗑 ลบที่อ่านแล้ว (${nd})</button></div>`;
  return `<h2 class="mailh">${MAILBOX_PX}ตู้จดหมาย</h2>${bulk}${L.length?`<div class="mlist2">${L.map(m=>`<button class="mrow2 ${m.read?"":"unread"} ${mailOpen(m)?"act":""} ${m.done||m.expired?"old":""} ${loyMailHot(m)?"loyev"+(m.ev==="loy"&&(loyOf(G)||{}).runs?" calm":""):""} ${(t=>t?"t"+t+(t==="black"&&!m.done?" hot":""):"")(mailTone(m))}" data-act="mopen" data-v="${m.id}"><span class="mk ${m.kind}">${{letter:"จดหมาย",take:"เงินเข้า",pay:"ใบแจ้งหนี้",quiz:"ตอบคำถาม",quest:"ขอความช่วยเหลือ",job:"งานจ้าง",event:"อีเวนต์",loan:"เงินกู้",lotto:"สลาก"}[m.kind]||"จดหมาย"}</span><span class="mt"><b>${esc(m.title)}</b><small>${esc(m.from)} · สด.${m.wk}${m.expired?" · หมดเวลา":m.done?" · จัดการแล้ว":m.expAbs!=null?` · ภายใน สด.${((m.expAbs-1)%52)+1}`:""}</small></span>${mailOpen(m)?'<i class="dot"></i>':""}</button>`).join("")}</div>`:`<p class="lead">ยังไม่มีจดหมาย</p>`}`;}
function letterHTML(m){m.read=true;let act="";
  if(m.kind==="take")act=m.done?`<p class="meta center">รับแล้ว ${fmt(m.amt)}</p>`:`<button class="btn primary" data-act="mtake" data-v="${m.id}">รับเงิน ${fmt(m.amt)}</button>`;
  if(m.kind==="pay")act=m.done?`<p class="meta center">${m.paid?"จ่ายแล้ว":"ไม่จ่าย (ชื่อเสียง −0.3)"}</p>`:m.expired?"":`<button class="btn" data-act="mskip" data-v="${m.id}">ไม่จ่าย (ชื่อเสียง −0.3)</button><button class="btn primary" data-act="mpay" data-v="${m.id}" ${G.cash<m.amt?"disabled":""}>จ่าย ${fmt(m.amt)}</button>`;
  if(m.kind==="quiz")act=m.done?`<p class="meta center">${m.ok?`ตอบถูก! ได้ ${fmt(m.amt)}`:`ผิดจ้า คำตอบคือ "${esc(m.opts[m.ans])}"`}</p>`:m.expired?"":`<p class="qz"><b>${esc(m.q)}</b></p><div class="qopts">${m.opts.map((o,i)=>`<button class="btn" data-act="mquiz" data-v="${m.id}" data-k="${i}">${esc(o)}</button>`).join("")}</div>`;
  if(m.kind==="job"&&m.job==="run")act=m.done?`<p class="meta center">${m.declined?"ไม่ได้รับคำท้า":m.won?"ชนะเสือดำที่ลานวัด!":"แพ้ไปที่ลานวัด"}</p>`:m.expired?`<p class="meta center">หมดเวลาแล้ว</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mrdecl" data-v="${m.id}">ไม่รับคำท้า</button><button class="btn primary" data-act="mrplay" data-v="${m.id}">${JOY_PX}รับคำท้า</button>`;
  else if(m.kind==="job")act=m.done?`<p class="meta center">${m.declined?"ไม่ได้ไปช่วย":m.grade?`ไปช่วยแล้ว · เกรด ${m.grade}`:"ส่งคนไปช่วยแล้ว ได้ ฿550"}</p>`:m.expired?`<p class="meta center">หมดเวลาแล้ว</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mjdecl" data-v="${m.id}">ไม่ว่าง</button><button class="btn" data-act="mjskip" data-v="${m.id}">ส่งคนไปช่วย (฿550)</button><button class="btn primary" data-act="mjplay" data-v="${m.id}">${JOY_PX}ไปช่วยเอง</button>`;
  if(m.kind==="event")act=evMailAct(m);
  if((m.bk||m.lg)&&typeof REGION!=="undefined"&&REGION.letterAct)act=REGION.letterAct(m); /* v1.91.72: Krerk's black card is the way into the warehouse */
  if(m.kind==="loan")act=m.done?`<p class="meta center">${m.took?"กู้ไปแล้ว":"ทิ้งนามบัตรลงถังแล้ว"}</p>`:!loanOk(G)?`<p class="meta center">${G.loan>0?"ยังมีเงินกู้หมวกทองค้างอยู่ กู้ซ้ำไม่ได้":"เงินพ้นขั้นวิกฤตแล้ว ไม่ต้องพึ่งนามบัตรนี้"}</p>`:`<button class="btn" data-act="mloanno" data-v="${m.id}">ทิ้งนามบัตร</button><button class="btn red" data-act="mloan" data-v="${m.id}">ดูเงินกู้ ${fmt(LOAN_AMT)}</button>`;
  if(m.kind==="lotto")act=lottoLetterAct(m);
  if(m.kind==="quest")act=m.done?`<p class="meta center">${m.declined?"ปฏิเสธแล้ว":"ส่งนักมวยไปแล้ว"}</p>`:m.expired?`<p class="meta center">หมดเวลาแล้ว</p>`:`<button class="btn" data-act="mdecl" data-v="${m.id}">ไม่ไป</button><button class="btn primary" data-act="macc" data-v="${m.id}">รับงาน · เลือกนักมวย</button>`;
  const opp=m.qk?QK[m.qk]:m.npc?G.F[m.npc]:null;
  const kp=mailKeep(m);const del=UI.mdelAsk===m.id?`<span class="mdelask"><span>ลบฉบับนี้? กู้คืนไม่ได้</span><button class="btn sm" data-act="mdelno">ไม่ลบ</button><button class="btn sm red" data-act="mdelok" data-v="${m.id}">ลบ</button></span>`:kp?`<small class="mlock">🔒 ${kp==="event"?"จดหมายอีเวนต์ ลบไม่ได้":"ลบได้หลังจัดการจดหมายนี้แล้ว"}</small>`:`<button class="btn sm ghost" data-act="mdel" data-v="${m.id}">🗑 ลบ</button>`;
  return `<button class="btn sm ghost mback" data-act="mail">◂ ตู้จดหมาย</button><div class="letter px ${(t=>t?"tl-"+t:"")(mailTone(m))}"><div class="lhead"><small>จาก</small><b>${esc(m.from)}</b><small>สัปดาห์ ${m.wk}</small></div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>
   ${m.kind==="take"||m.kind==="pay"?`<p class="lamt ${m.kind}">${m.kind==="take"?"+":"−"}${fmt(m.amt)}</p>`:""}
   ${opp&&m.kind==="quest"?`<div class="qopp">${m.qk?`<canvas width="96" height="96" data-qsprite="${QK[m.qk].sprite}"></canvas>`:faceImg(opp)}<span><b>${esc(opp.name)}</b><small>${m.q==="belt"?`ห้ายก · พลังคู่ชก ${ovr(opp.a).toFixed(1)}`:m.q==="challenge"?"ไฟต์โชว์ ไม่นับสถิติ":"ชกทันที · ไม่นับสถิติและอันดับ · นักมวยล้าเพิ่ม"}${m.pay?` · ค่าเหนื่อย ${fmt(m.pay)}`:m.q==="gang"?" · ค่าตอบแทนมาทางตู้จดหมาย":""}</small></span></div>`:""}</div>
   <div class="mfoot lact">${act}</div><div class="mdelrow">${del}</div>`;}
/* v1.91.126 (player report): a belt defense always lists its holder, even one whose division no longer matches the belt (old saves let a fighter take another division's belt); fighters who cannot go now are greyed with the reason instead of tapping to nothing */
const qpickOK=(m,f)=>!m||m.q!=="belt"||(m.defend?m.defend===f.id:f.div===m.div);
function qpickWhy(f){return f.injury?`บาดเจ็บ ${f.injury} สด.`:isBooked(G,f.id,G.week)?"ติดไฟต์สัปดาห์นี้":"";}
function qpickHTML(mid){const m=(G.mail||[]).find(x=>x.id===mid);const R=roster(G).filter(f=>qpickOK(m,f));
  return `<h2>ส่งใครไป?</h2><p class="meta">${m?esc(m.title):""} · ชกทันทีสัปดาห์นี้ ล้าเพิ่ม ไม่นับสถิติ</p><div class="qpick">${R.length?R.map(f=>{const why=qpickWhy(f);return `<button class="qpf px" data-act="qsend" data-id="${f.id}" data-v="${mid}" ${why?"disabled":""}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${why||`ล้า ${Math.round(f.fatigue)} · ความพร้อม ${condition(f)}`}</small></span></button>`;}).join(""):`<p class="meta">${m&&m.defend?"เจ้าของเข็มขัดไม่ได้อยู่ในค่ายแล้ว กด \"ไม่ไป\" ที่จดหมายได้เลย":m&&m.q==="belt"?`ค่ายยังไม่มีนักมวยรุ่น ${esc(m.div)}`:"ยังไม่มีนักมวยที่ส่งไปได้"}</p>`}</div>`;}
// cash flow & fame graphs
function lineSVG(pts,key,col,fmtY){if(pts.length<2)return `<p class="meta">ยังไม่มีข้อมูลพอ เล่นต่ออีกสักสัปดาห์</p>`;const W=320,H=130,P=26;const ys=pts.map(p=>p[key]);let mn=Math.min(0,...ys),mx=Math.max(...ys);if(mx===mn)mx=mn+1;
  const x=i=>P+(W-P-6)*i/(pts.length-1),y=v=>H-16-(H-28)*(v-mn)/(mx-mn);const d=pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
  const z=mn<0?`<line x1="${P}" x2="${W-6}" y1="${y(0)}" y2="${y(0)}" class="g0"/>`:"";
  return `<svg class="lsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="กราฟ"><line x1="${P}" x2="${W-6}" y1="${H-16}" y2="${H-16}" class="gax"/>${z}<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
   ${pts.map((p,i)=>`<rect x="${x(i)-2}" y="${y(p[key])-2}" width="4" height="4" fill="${col}"><title>สด.${p.w}: ${fmtY(p[key])}</title></rect>`).join("")}
   <text x="${P-4}" y="${y(mx)+4}" text-anchor="end" class="gt">${fmtY(mx)}</text><text x="${P-4}" y="${y(mn)+4}" text-anchor="end" class="gt">${fmtY(mn)}</text>
   <text x="${x(0)}" y="${H-3}" class="gt">สด.${pts[0].w}</text><text x="${x(pts.length-1)}" y="${H-3}" text-anchor="end" class="gt">สด.${pts[pts.length-1].w}</text></svg>`;}
const kfmt=v=>Math.abs(v)>=1000?(v<0?"-":"")+"฿"+(Math.abs(v)/1000).toFixed(Math.abs(v)>=10000?0:1)+"k":fmt(v);
function cashflowHTML(){const H=(G.history||[]);const inc=classIncome(G),up=upkeep(G),wg=wages(G),sp=G.sponsorWk||0,debt=G.debt>0&&(G.week%4===0)?Math.min(5000,G.debt):0,net=inc+sp-up-wg;
  const tip=net<0?(G.cash/-net<6?`รายจ่ายประจำมากกว่ารายรับ เงินพอใช้อีกราว ${Math.max(1,Math.floor(G.cash/-net))} สัปดาห์ ควรรับไฟต์หรือเปิดตู้จดหมายหารายได้`:`รายจ่ายประจำมากกว่ารายรับ ต้องอาศัยค่าตัวไฟต์ เพิ่มนักเรียน หรือลดค่าจ้าง`):`รายรับประจำพอจ่ายแล้ว เหลือสัปดาห์ละ ${fmt(net)} เก็บไว้อัปเกรดค่ายได้`;
  const full=studentDemand(G)>studentCap(G),dis=G.disaster&&G.disaster.untilAbs!=null&&gameWeek(G)<G.disaster.untilAbs;
  const why=dis?`รายได้ค่าเรียนลดเพราะ${esc(G.disaster.name)}`:full?`คนอยากเรียน ${studentDemand(G)} คน แต่ค่ายรับได้ ${studentCap(G)} คน · ขยายลานสอนจะได้นักเรียนเพิ่ม`:`ค่าเรียนคนละ ${fmt(studentFee(G))} ต่อสัปดาห์`;
  const row=(l,v)=>v?`<div class="kv-row"><span>${l}</span><b class="num ${v<0?"neg":"pos"}">${v<0?"−":"+"}${fmt(Math.abs(Math.round(v)))}</b></div>`:"";
  const R=H.slice(-5).map((h,i,a)=>i?{...h,d:h.cash-a[i-1].cash}:null).filter(Boolean).reverse();
  return `<h2>การเงิน</h2><div class="bigcash"><small>เงินสดตอนนี้</small><b class="num">${fmt(G.cash)}</b><span class="num ${net<0?"negt":"post"}">${net<0?"−":"+"}${fmt(Math.abs(net))} ต่อสัปดาห์</span></div>
   <div class="ctip"><img src="${ASSET}coach.webp" alt=""><span>${tip}</span></div>
   <h3>เงินประจำทุกสัปดาห์</h3>${row(`นักเรียน ${students(G)} คนจ่ายค่าเรียน`,inc)}${row("ผู้สนับสนุน",sp)}${row("ค่าดูแลค่าย",-up)}${row("ค่าจ้างนักมวยและครู",-wg)}${debt?row("ผ่อนหนี้ปู่ชัย (ทุก 4 สัปดาห์)",-debt):""}
   <p class="meta">${why} · ค่าดูแลเพิ่มตามจำนวนอัปเกรด · ค่าตัวไฟต์และกิจกรรมคิดตอนเกิดขึ้นจริง</p>
   <h3>ย้อนดู 4 สัปดาห์ล่าสุด</h3>${R.length?R.map(h=>`<details class="cfw"><summary><span>สัปดาห์ ${h.w}${h.fight?" · มีค่าตัวไฟต์":""}</span><b class="num ${h.d<0?"negt":"post"}">${h.d<0?"−":"+"}${fmt(Math.abs(Math.round(h.d)))}</b></summary>
     ${row("ค่าเรียน",h.inc)}${row("ผู้สนับสนุน",h.sponsor||0)}${row("ค่าตัวไฟต์",h.fight||0)}${row("ค่าดูแลค่าย",-(h.up||0))}${row("ค่าจ้าง",-(h.wg||0))}${row("ผ่อนหนี้",-(h.debt||0))}${row("กิจกรรม อัปเกรด และอื่น ๆ",h.oth||0)}</details>`).join(""):`<p class="meta">ยังไม่มีประวัติ จบสัปดาห์แรกแล้วจะเห็นรายการ</p>`}`;}
function repgraphHTML(){const r=G.rep,S=repSteps();const nx=S.find(([n])=>r<n),pv=[...S].reverse().find(([n])=>r>=n);const lo=pv?pv[0]:0,hi=nx?nx[0]:Math.max(lo+1,r);
  return `<h2>ชื่อเสียงค่าย</h2><div class="repg"><div class="repg-h"><b class="num">${r.toFixed(1)}</b><span>${nx?`อีก ${(nx[0]-r).toFixed(1)} ปลดล็อก: ${nx[1]}`:"ปลดล็อกครบทุกขั้นแล้ว"}</span></div>
    <div class="gauge" role="img" aria-label="ชื่อเสียง ${r.toFixed(1)}"><i style="width:${Math.round(100*Math.min(1,(r-lo)/(hi-lo)))}%"></i></div><div class="repg-f"><small class="num">${lo}</small><small class="num">${nx?hi:""}</small></div></div>
   <p class="meta">ได้จากชนะไฟต์ กิจกรรมค่าย และจัดศึกที่ค่าย · ยิ่งสูง นักเรียนและค่าตัวไฟต์ยิ่งมาก${r>55?" · เกิน 55 จะค่อย ๆ ลดเอง ต้องชนะต่อเนื่อง":""}</p>
   <div class="replist">${S.map(([n,t])=>`<div class="${r>=n?"on":""}"><b>${r>=n?"✓":n}</b><span>${t}</span></div>`).join("")}</div>`;}
// fight calendar under the rankings
/* v1.87: the calendar also shows birthdays, festivals and the camp beauty contest */
function calEvents(w){const E=[],S=G.season||1;
  for(const id of (typeof BDAY_DM!=="undefined"?Object.keys(BDAY_DM):["kati","mali","rin","ploy","fah"])){const f=G.F[id];if(f&&(f.camp==="player"||f.met)&&typeof bdayWeek==="function"&&bdayWeek(id)===w)E.push({ic:"🎂",t:`วันเกิด${f.name}`});}
  const FE={26:["🏮","ลอยกระทง"],32:["🎆","ปีใหม่"],37:["🙏","ไหว้ครูประจำปี"],47:["💦","สงกรานต์"]};if(FE[w])E.push({ic:FE[w][0],t:FE[w][1]});if(typeof LOTTO_WK!=="undefined"&&LOTTO_WK.some(x=>x+2===w))E.push({ic:"🎟️",t:"ผลสลากออก"});
  /* v1.88 yearly theme marks */const yk=typeof ytKey==="function"&&ytKey(G);if(yk){const T=YEAR_THEMES[yk];if(T.from!=null&&w>=T.from&&w<=T.to)E.push({ic:T.ic,t:T.name});
    if(yk==="sponsor"&&G.yt.acc&&w===40)E.push({ic:"💼",t:"ตัดยอดชนะ 8 ไฟต์ของสปอนเซอร์"});}
  if(typeof CONTEST_WEEK!=="undefined"&&w===CONTEST_WEEK){const c=G.contests&&G.contests[S];E.push({ic:"🌸",t:c&&c.rank?`ประกวดค่ายสวย · ได้อันดับ ${c.rank}`:"ประกวดค่ายสวย นายอำเภอมาตรวจค่าย"});}
  return E;}
function calendarHTML(){const past={},next={};for(const c of G.cal||[])if(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)(past[c.wk]=past[c.wk]||[]).push(c);for(const b of G.bookings)if(G.F[b.a]&&G.F[b.a].camp==="player")(next[b.week]=next[b.week]||[]).push(b);
  const mark={20:"ตัดรอบตำบล",40:"ตัดรอบอำเภอ",44:"รองชิง",49:"ชิงแชมป์"};
  return `<section class="px card cal"><div class="card-h"><h3>ปฏิทินปีที่ ${G.season||1}</h3><span class="legend"><i class="cw"></i>ชนะ <i class="cl"></i>แพ้ <i class="cn"></i>นัดถัดไป</span></div>
   <div class="calg">${Array.from({length:52},(_,i)=>i+1).map(w=>{const p=past[w],n=next[w];const r=p?(p.some(c=>c.res==="W")?(p.every(c=>c.res==="W")?"w":"m"):p.some(c=>c.res==="D")?"d":"l"):"";
     const ev=calEvents(w);return `<button class="cday ${w<G.week?"gone":""} ${w===G.week?"now":""} ${p?"has "+r:""} ${n?"nx":""} ${mark[w]?"mk":""} ${ev.length?"ev":""}" data-act="calday" data-v="${w}" ${p||n||ev.length?"":"tabindex=\"-1\""} title="${[mark[w]||""].concat(ev.map(e=>e.t)).filter(Boolean).join(" · ")}" aria-label="สัปดาห์ ${w}${p?" มีผลไฟต์":n?" มีนัดชก":""}${ev.map(e=>" "+e.t).join("")}">${ev.length?`<u>${ev.slice(0,2).map(e=>e.ic).join("")}</u>`:""}<b>${w}</b>${p||n?`<i>${p?p.length:""}${n?"●":""}</i>`:""}${mark[w]?`<s></s>`:""}</button>`;}).join("")}</div>
   <p class="meta">แตะช่องเพื่อดูผลไฟต์และกิจกรรม · 🎂 วันเกิด · 🏮🎆💦 เทศกาล · 🌸 ประกวดค่ายสวย · ขีดทอง = สัปดาห์ตัดรอบ (20, 40) และรองชิง/ชิง (44, 49)</p></section>`;}
function caldayHTML(w){const p=(G.cal||[]).filter(c=>c.wk===w&&(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)),n=G.bookings.filter(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player");
  const ev=calEvents(w);return `<h2>สัปดาห์ ${w}${typeof weekDateLabel==="function"?` <small class="meta">· ${weekDateLabel(w)}</small>`:""}</h2>${ev.map(e=>`<div class="calres px ev"><b>${e.ic} ${esc(e.t)}</b></div>`).join("")}${p.map(c=>{const me=G.F[c.a];return `<div class="calres px ${c.res==="W"?"w":c.res==="L"?"l":"d"}"><b>${esc(me?me.name:c.a)} ${c.res==="W"?"ชนะ":c.res==="L"?"แพ้":"เสมอ"} ${esc(c.bn)}</b><span class="meta">${TIER[c.tier]?(c.tierName||TIER[c.tier].name):""} · ${esc(c.type||"")} · ได้ ${fmt(c.pay||0)}</span><span class="cards">${(c.cards||[]).map((k,i)=>`<i>ย${i+1} ${k[0]}–${k[1]}</i>`).join("")}</span></div>`;}).join("")}
   ${n.map(b=>`<div class="calres px nx"><b>${esc(G.F[b.a].name)} vs ${esc(G.F[b.b].name)}</b><span class="meta">นัดชก · ${(b.tierName||TIER[b.tier].name)} · ${b.rounds} ยก</span></div>`).join("")}${!p.length&&!n.length?`<p class="meta">ไม่มีไฟต์ของค่ายในสัปดาห์นี้</p>`:""}`;}
const RANK_HELP=`<ul class="fp-list"><li><b>ชนะ 3 แต้ม</b> (ล้มคนที่เก่งกว่า +1) · เสมอ 1 · แพ้ 0 — นับเฉพาะไฟต์ "ระดับตำบล/อำเภอ"</li><li><b>สัปดาห์ 1–20 รอบตำบล:</b> ท็อป 4 ของรุ่นได้ไปรอบอำเภอ</li><li><b>สัปดาห์ 21–40 รอบอำเภอ:</b> แต้มเริ่มใหม่ ท็อป 4 ได้ไปรองชิงจังหวัด</li><li><b>สัปดาห์ 44 รองชิง · 49 ชิงแชมป์จังหวัด</b> เงินรางวัลก้อนใหญ่และชื่อเสียงสูงสุด</li><li>ไฟต์งานวัด ไฟต์พิเศษ และไฟต์นอกตาราง <b>ไม่ได้แต้ม</b> แต่ได้เงิน EXP และชื่อเสียง</li></ul>`;
const XMODAL={
  mail:()=>({body:mailListHTML(),foot:true}),
  letter:m=>{const x=(G.mail||[]).find(y=>y.id===m.id);return x?{body:letterHTML(x),foot:false}:{body:mailListHTML(),foot:true};},
  qpick:m=>({body:qpickHTML(m.id),foot:true}),
  cashflow:()=>({body:cashflowHTML(),foot:true}),
  repgraph:()=>({body:repgraphHTML(),foot:true}),
  calday:m=>({body:caldayHTML(m.w),foot:true}),
  rankhelp:()=>({body:`<h2>อันดับมีผลยังไง?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดง:</b> เป้าหมายฤดูกาลนี้คือพากะทิ${G.F.mali.camp==="player"?"กับมะลิ":""}ขึ้นไป<b>ท็อป 4</b> ของรุ่น ผ่านสองด่านให้ได้ แล้วไปเจอพยัคฆ์ทองที่นัดชิง</span></div>${RANK_HELP}`,foot:true}),
  declo:m=>{const o=G.offers.find(x=>x.id===m.id);if(!o)return {body:"",foot:true};return {body:`<h2>ปฏิเสธข้อเสนอนี้?</h2><p>${esc(G.F[o.a].name)} vs ${esc(G.F[o.b].name)} · สด.${o.week} · ${(o.tierName||TIER[o.tier].name)}</p><p class="meta">ข้อเสนอจะหายไปจากรายการ (ถ้าปฏิเสธคนเดิมบ่อย ๆ เขาอาจเขียนจดหมายมาท้า)</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">ไม่ใช่</button><button class="btn primary" data-act="declyes" data-v="${o.id}">ปฏิเสธเลย</button></div>`,foot:false};}};
Object.assign(ACT,{
  mail:()=>{UI.mdelAsk=null;UI.mdelAll=0;UI.modal={type:"mail"};render();},
  mopen:d=>{UI.mdelAsk=null;UI.mdelAll=0;UI.modal={type:"letter",id:d.v};render();save();},
  mdel:d=>{UI.mdelAsk=d.v;render();},
  mdelno:()=>{UI.mdelAsk=null;UI.mdelAll=0;render();},
  mdelok:d=>{UI.mdelAsk=null;if(mailDel([d.v])){toast("ลบจดหมายแล้ว");}UI.modal={type:"mail"};render();save();},
  mdelall:()=>{UI.mdelAll=1;render();},
  mdelallok:()=>{UI.mdelAll=0;const n=mailDel((G.mail||[]).filter(m=>m.read).map(m=>m.id));toast(`ลบจดหมายแล้ว ${n} ฉบับ`);render();save();},
  mtake:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.cash+=m.amt;m.done=true;AU.sfx("level");toast(`ได้รับ ${fmt(m.amt)}`);save();render();},
  mpay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||G.cash<m.amt)return;G.cash-=m.amt;m.done=true;m.paid=true;AU.sfx("ui");save();render();},
  mskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.rep=Math.max(0,G.rep-.3);m.done=true;save();render();},
  mquiz:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.ok=+d.k===m.ans;if(m.ok){G.cash+=m.amt;AU.sfx("level");}else AU.sfx("miss");save();render();},
  mjdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mjskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;G.cash+=550;G.dust=(G.dust||0)+1;roster(G).forEach(f=>f.morale=clamp(f.morale+3,0,100));AU.sfx("ui");toast("ป้าแต๋วฝากขอบคุณ ได้ ฿550 · ✦ +1");save();render();},
  mrdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mrplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();const o=runDareRival(m.final);
    BAG.st={phase:"run",mode:"run",practice:true};BAG.mount();
    RUN.pick({race:{canBack:true,label:"ท้าวิ่งที่ลานวัด",intro:m.final?"เสือดำ: \"ครั้งสุดท้ายแล้ว ไม่มีกั๊ก!\"":"เสือดำ: \"มาแล้วเหรอ เริ่มเลย!\"",say:won=>({n:"เสือดำ",t:m.final?(won?"…ยอมแล้ว ขาพวกเธอของจริง งานกีฬาสีปีนี้ฉันลงสีเหลือง เจอกันที่ลู่นะ":"ว่าแล้ว! เสือดำไม่มีวันแพ้นักมวยสามครั้งติดหรอก"):(won?"ฟลุค! ครั้งหน้าไม่ได้ง่ายแบบนี้แล้ว":"อย่างที่บอก ใครก็แพ้ฉันทั้งนั้น")}),note:`${m.final?"คำท้าครั้งสุดท้าย · ":""}${o.name} จากค่ายพยัคฆ์ทองมาท้า 100 เมตร · ชนะ = ชื่อเสียง +1 กำลังใจทั้งค่าย · แพ้ = กำลังใจคนวิ่งลดนิดหน่อย`,dist:100,
      lanes:me=>[runLane(o,{c:"#e8b62c",eff:.99,react:.13}),runLane(me,{me:true,c:"#e2443c"})],
      cb:res=>{m.done=true;m.won=res.win;const D=G.dare=G.dare||{w:0,l:0,n:0};D.n++;if(res.win)D.w++;else D.l++;D.last=res.win?"W":"L";if(m.final&&res.win)D.done=true;const f=RUN.runner(),out=[];if(res.win){G.rep=(G.rep||0)+1;roster(G).forEach(x=>x.morale=clamp((x.morale||0)+4,0,100));G.dust=(G.dust||0)+3;out.push("ชื่อเสียง +1 · กำลังใจทั้งค่าย +4 · ✦ +3");G.flags.runDareW=(G.flags.runDareW||0)+1;}
        else if(f&&G.F[f.id]){f.morale=clamp((f.morale||0)-3,0,100);out.push(`กำลังใจ${f.name} -3`);}
        if(f&&G.F[f.id])f.fatigue=Math.min(100,(f.fatigue||0)+5);RUN.st.res.rw=`<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;save();},
      next:()=>BAG.close()}});},
  mjplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();BAG.openMode("somtam",null,m.id);},
  mloan:d=>{ACT.loan();},
  mloanno:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;save();render();toast("ครูแดงพยักหน้าเงียบ ๆ");},
  mdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m)return;m.done=true;m.declined=true;if(m.q==="gang"&&G.gang)G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);save();render();},
  macc:d=>{UI.modal={type:"qpick",id:d.v};render();},
  qsend:d=>{const m=G.mail.find(x=>x.id===d.v),f=G.F[d.id];if(!m||m.done||m.expired||!f||f.camp!=="player")return;{const why=qpickWhy(f);if(why){toast(`${f.name} ${why}`);return;}}if(!qpickOK(m,f))return;if(m.q==="belt"&&!m.defend){const D=beltTournament(G,m,d.id);if(!D)return;G.dm=D;m.done=true;UI.modal={type:"dm"};dmAdvance();save();render();return;}if(m.q==="belt"&&m.defend&&beltHolder(G,m.div,m.venue||"tha")?.id!==d.id)return;if(m.q==="belt"&&m.defend&&(!G.F[m.npc]||G.F[m.npc].div!==m.div||G.F[m.npc].injury||isBooked(G,m.npc,G.week))){const nc=beltChallenger(G,m.div,m.defend);if(!nc){toast("ผู้ท้าชิงยังไม่พร้อมชกสัปดาห์นี้ ลองใหม่สัปดาห์หน้า");return;}m.npc=nc.id;}m.done=true;UI.modal=null;
    const spec=m.q==="belt"?{q:"belt",npc:m.npc,pay:m.pay,from:m.from,div:m.div,defend:m.defend,venue:m.venue||"tha",bg:STADIUMS[m.venue||"tha"].bg,rounds:5}:m.q==="challenge"?{q:"challenge",npc:m.npc,pay:m.pay,from:m.from}:{q:m.q,qk:m.qk,hq:m.hq,pay:m.pay,from:m.from,rounds:m.qk==="gang5"?4:3};
    const intro=m.q==="gang"&&m.hq?[{n:"nar",t:"โกดังหลังตลาดเช้า ไฟสลัว ลูกน้องหมวกแดงนั่งล้อมโต๊ะแผนที่ พอเห็นค่ายศิริชัยเดินเข้ามา ทุกคนลุกพรวด"},{n:"npc",who:QK[m.qk].name,t:GANG_HQ_TAUNT[m.qk]||"มาจนได้! ที่นี่ไม่มีแม่ค้าคอยเชียร์แล้วนะ"},{n:d.id,f:"angry",l:"fight",t:"มาตามนัดแล้วค่ะ!"}]
      :m.q==="gang"?[{n:"nar",t:"ตลาดเช้า… มอเตอร์ไซค์สิบกว่าคันจอดเรียงหน้าแผงผัก"},{n:"npc",who:QK[m.qk].name,t:m.early?"ลูกน้องฉันแพ้เธอซ้ำแล้วซ้ำเล่า เสียชื่อหมด! แถมค่ายเธอยังติดหนี้ฉันอยู่ วันนี้ฉันจัดการเอง!":m.qk==="gang5"?"ได้ยินว่ามีค่ายมวยมาเกะกะธุรกิจฉัน วันนี้หัวหน้าใหญ่ลงมาเอง!":m.qk==="gang4"?"ลูกน้องหมวกแดงของฉันโดนเด็กค่ายมวยไล่ตะเพิดเหรอ? หมวกเงินคนนี้จะสอนมารยาทให้เอง":m.qk==="gang6"?"เสี่ยไม่ต้องลงมาเปลืองแรงหรอก มือขวาอย่างฉันจัดการแทนได้":"ไหนใครที่ไล่ลูกน้องฉัน ออกมาเลย!"},{n:d.id,f:"angry",l:"fight",t:"ฉันเอง!"}]
      :m.q==="belt"?[{n:"nar",t:`${STADIUMS[m.venue||"tha"].name} ไฟสปอตไลต์ส่องลงกลางเวที โฆษกประกาศชื่อทั้งสองมุม`},{n:"npc",who:G.F[m.npc].name,t:m.defend?"เข็มขัดเส้นนั้นควรเป็นของฉัน วันนี้ฉันมาเอาคืน":"อยากได้เข็มขัดเหรอ? ต้องข้ามศพฉันไปก่อน"},{n:d.id,f:"angry",l:"fight",t:m.defend?"มาเอาให้ได้สิ!":"หนูมาเพื่อสิ่งนั้นแหละ!"}]
      :m.q==="challenge"?[{n:"nar",t:"ลานหลังตลาดสด คนมามุงเต็มสองฝั่ง มีคนตั้งโต๊ะรับพนันน้ำแดง"},{n:"npc",who:G.F[m.npc].name,t:"มาจนได้นะ นึกว่าจะหนีตลอดฤดูกาล"},{n:d.id,f:"angry",l:"fight",t:"ไม่ได้หนี แค่ยังไม่ว่าง ตอนนี้ว่างแล้ว!"}]
      :(m.q==="cow"||m.q==="rooster")?runawayIntro(G,m,d.id)
      :[{n:"nar",t:"ไก่แจ้ตัวเล็กยืนบนกระสอบทราย อกพองโต ขนคอตั้งชัน"},{n:"npc",who:"เสี่ยต๋อง",t:"อย่าดูถูกมันนะครับ มันเคยไล่สุนัขพันธุ์ใหญ่ทั้งซอยมาแล้ว"},{n:d.id,f:"happy",l:"fight",t:"มาเลยเจ้าไก่! หนูไม่ใช่สุนัขนะ!"}];
    playScene(intro,()=>startQuest(spec,d.id,()=>{}),{bg:m.q==="gang"?(m.hq?"gang_hq":"market_morning"):m.q==="belt"?STADIUMS[m.venue||"tha"].scene:m.q==="challenge"?"food":m.q==="rooster"?"rooster":m.q==="cow"||m.q==="bull"?"farm":"fair",look:"fight"});},
  cashflow:()=>{UI.modal={type:"cashflow"};render();},
  repgraph:()=>{UI.modal={type:"repgraph"};render();},
  calday:d=>{const w=+d.v;if(!(G.cal||[]).some(c=>c.wk===w&&(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1))&&!G.bookings.some(b=>b.week===w)&&!calEvents(w).length)return;UI.modal={type:"calday",w};render();},
  rankhelp:()=>{UI.modal={type:"rankhelp"};render();},
  declo:d=>{UI.modal={type:"declo",id:d.v};render();},
  declyes:d=>{const o=G.offers.find(x=>x.id===d.v);if(o){G.offers=G.offers.filter(x=>x.id!==o.id);if(!o.beast&&!o.fair&&!o.lab&&o.status!=="conflict"&&!isBooked(G,o.b)){G.snub=G.snub||{};G.snub[o.b]=(G.snub[o.b]||0)+1;}}UI.modal=null;save();render();},
});
// a quest sprite preview canvas (in letters)
function mountQSprites(){document.querySelectorAll("canvas[data-qsprite]").forEach(cv=>{const x=cv.getContext("2d");const sh=img(cv.dataset.qsprite+"_sheet.webp");
  LOOPS.add(t=>{if(!cv.isConnected)return;x.clearRect(0,0,cv.width,cv.height);const fr=Math.floor(t/200)%4;x.imageSmoothingEnabled=true;drawFrame(x,sh,ROW.guard,fr,cv.width/2,cv.height*.97,cv.height*.95,true);});});startLoops();}

// ---------- news bar: home only, one item at a time, slides through once, then gone ----------
var NEWS={el:null,q:[],i:0,wk:0};
function newsSync(){if(!NEWS)return;const want=G&&!UI.ending&&UI.tab==="home"&&!UI.scene&&!UI.fight&&!UI.montage&&!UI.modal&&UI.spot==null&&UI.newsWeek!==G.week&&!!document.querySelector(".hud");
  if(!want){if(NEWS.el&&G&&UI.tab!=="home"){UI.newsWeek=G.week;}if(NEWS.el){NEWS.el.remove();NEWS.el=null;}document.body.classList.remove("hasnews");return;}
  const hud=document.querySelector(".hud");const top=Math.round(hud.getBoundingClientRect().bottom)+6;
  if(NEWS.el){NEWS.el.style.top=top+"px";document.body.classList.add("hasnews");return;}
  if(NEWS.wk!==G.week){NEWS.wk=G.week;NEWS.q=newsItems().slice(0,3);NEWS.i=0;}if(!NEWS.q.length||NEWS.i>=NEWS.q.length){UI.newsWeek=G.week;return;}
  const el=document.createElement("div");el.className="newsbar";el.setAttribute("role","status");el.style.top=top+"px";
  el.innerHTML=`<b class="nlab">ข่าวมวย</b><div class="ntrack"><span class="ncr"></span></div><button class="nclose" aria-label="ปิดข่าว">×</button>`;document.body.appendChild(el);NEWS.el=el;document.body.classList.add("hasnews");
  el.querySelector(".nclose").onclick=()=>{UI.newsWeek=G.week;el.classList.add("out");setTimeout(()=>{el.remove();if(NEWS.el===el)NEWS.el=null;document.body.classList.remove("hasnews");},300);};
  const show=()=>{if(!el.isConnected)return;if(NEWS.i>=NEWS.q.length){UI.newsWeek=G.week;el.classList.add("out");setTimeout(()=>{el.remove();if(NEWS.el===el)NEWS.el=null;document.body.classList.remove("hasnews");},400);return;}
    const sp=el.querySelector(".ncr");const t=NEWS.q[NEWS.i];sp.textContent=t;sp.style.animation="none";void sp.offsetWidth;
    const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;const dur=reduce?4:Math.min(16,Math.max(7,t.length/6));sp.style.animation=reduce?"none":`ncr ${dur}s linear 1 forwards`;
    clearTimeout(NEWS.tm);NEWS.tm=setTimeout(()=>{NEWS.i++;show();},dur*1000);};show();}

// ---------- rivals answer a loss: one scene each, then the surge shows up in their growth ----------
EVENTS.push(
 {id:"ploy_surge",look:"fight",bg:"night",when:G=>G.flags&&G.flags.beat_ploy>=1&&G.F.ploy.camp==="rival",steps:[
  {n:"nar",t:"ห้าทุ่ม ค่ายพยัคฆ์ทองดับไฟหมดแล้ว เหลือแค่โรงยิมหลังเดียวที่ไฟยังเปิด"},
  {n:"nar",t:"เสียงกระสอบทรายดังเป็นจังหวะเดียวกันมาสามชั่วโมง ไม่ช้าลงเลยสักนิด"},
  {n:"ploy",f:"sad",t:"…แพ้แล้วเจ็บแบบนี้เองสินะ ไม่ได้รู้สึกมานานจนลืมไปแล้ว"},
  {n:"ploy",f:"angry",t:"ขอบคุณนะ กะทิ ตั้งแต่คืนนี้ฉันไม่ใช่อัจฉริยะอีกต่อไป ฉันจะเป็นคนที่ซ้อมหนักที่สุดในจังหวัด"},
  {n:"coach",t:"(ข่าวจากคนในวงการ) พลอยขอเถ้าแก่ย้ายไปนอนในค่าย ซ้อมสามรอบต่อวัน …นัดชิงนี้ไม่ง่ายแล้ว"},
  {fx:G=>{G.F.ploy.morale=Math.min(100,G.F.ploy.morale+20);}}]},
 {id:"fah_surge",look:"fight",bg:"night",when:G=>G.flags&&G.flags.beat_fah>=1&&G.F.fah.camp==="rival",steps:[
  {n:"nar",t:"ตีห้า ทางขึ้นเขาหลังค่ายพยัคฆ์ทอง มีเงาคนหนึ่งวิ่งขึ้นลงเป็นรอบที่สิบ"},
  {n:"fah",f:"angry",t:"ฮึก… อีกรอบ! ใครบอกให้หยุด! ฟ้าไม่ได้แพ้เพราะฟ้าอ่อน ฟ้าแพ้เพราะฟ้าขี้เกียจ!"},
  {n:"fah",f:"sad",t:"…ไว้เจอกันอีกที จะไม่ให้แตะตัวได้สักหมัดเลย คอยดู"},
  {n:"coach",t:"ได้ข่าวว่าฟ้าเปลี่ยนเป็นคนละคน ตื่นก่อนทุกคนในค่ายพยัคฆ์ทอง ระวังให้ดี"}]},
 {id:"ploy_surge2",look:"fight",bg:"final",when:G=>G.flags&&G.flags.beat_ploy>=2&&G.F.ploy.camp==="rival",steps:[
  {n:"ploy",f:"angry",t:"สองครั้งแล้วนะคะ… ครั้งที่สามจะเป็นนัดชิง และฉันจะไม่เหลืออะไรให้เสียใจอีก"},
  {n:"kati",f:"angry",t:"หนูก็เหมือนกัน! ครั้งนี้หนูจะชนะพี่พลอยในวันที่พี่เก่งที่สุด!"}]});

// =====================================================================================
// v1.36 DEATH MATCH — a special 8-fighter knockout offer every ~10 weeks, all divisions mixed,
// fought back to back the same week. The player runs every one of the camp's fights.
// =====================================================================================
const DM_WEEKS=[6,10,14,18,22,26,30,34,38,42,46,50];
const DM_PRIZE=[0,3000,8000,18000,40000];   // by how far our best fighter got: out in QF / SF / final / champion
const DM_STAGE=["รอบ 8 คน","รอบรองชนะเลิศ","รอบชิงชนะเลิศ"];
const dmOfferOn=G=>!(G.dm&&!G.dm.done)&&DM_WEEKS.includes(G.week)&&!(G.dmSeenSeason===(G.season||1)&&(G.dmSeen||{})[G.week])&&!G.ended;
const dmMine=id=>G.F[id]&&G.F[id].camp==="player";
const dmCanEnter=f=>!!f&&f.camp==="player"&&!f.injury&&!isBooked(G,f.id,G.week);
function dmBuild(G,mine){mine=[...new Set(mine)].filter(id=>G.F[id]&&G.F[id].camp==="player"&&!G.F[id].injury&&!isBooked(G,id,G.week)).slice(0,3);if(!mine.length)return null;const pool=Object.values(G.F).filter(f=>!mine.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&f.div!=="X"&&!isBooked(G,f.id,G.week));
  const avg=mine.reduce((s,id)=>s+ovr(G.F[id].a),0)/mine.length;
  const stars=["ploy","fah"].filter(id=>pool.some(f=>f.id===id));
  const rest=pool.filter(f=>!stars.includes(f.id)).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);
  let others=[...stars,...rest].slice(0,8-mine.length);

  const slots=Array(8).fill(null);[0,4,2,6].slice(0,mine.length).forEach((p,i)=>slots[p]=mine[i]);
  const order=[7,3,5,1,6,2,4,0].filter(p=>!slots[p]);others.forEach((id,i)=>slots[order[i]]=id);
  return {wk:G.week,absWeek:gameWeek(G),slots,w:[[],[],[]],r:0,mine:[...mine],out:{},done:false};}
const dmList=D=>D.r===0?D.slots:D.w[D.r-1];
function dmWinFrom(F){const r=F.result;if(r.win==="A"||r.win==="B")return r.win;const s=F.cards.reduce((x,c)=>x+c[0]-c[1],0);return s>0?"A":s<0?"B":(F.A.landed>=F.B.landed?"A":"B");}
// play every match until it is one of ours, then stop and let the player fight it
function dmAdvance(){const D=G.dm;if(!D||D.done)return;
  while(D.r<3){const L=dmList(D);const m=D.w[D.r].length;if(m*2>=L.length){D.r++;if(D.r<3)for(const id of D.w[D.r-1])if(dmMine(id))G.F[id].fatigue=Math.max(0,G.F[id].fatigue-6);continue;}
    const a=L[m*2],b=L[m*2+1];
    if(!G.F[a]||!G.F[b]){D.w[D.r].push(G.F[a]?a:G.F[b]?b:a);continue;}/* bye */
    if(dmMine(a)||dmMine(b)){save();return;}
    const F=quickFight(G.F[a],G.F[b],(G.seed^(G.week*313))+D.r*17+m,3);D.w[D.r].push(dmWinFrom(F)==="A"?a:b);}
  D.done=true;dmFinish();}
function dmNextMatch(){const D=G.dm;if(!D||D.done||D.r>=3)return null;const L=dmList(D),m=D.w[D.r].length;return [L[m*2],L[m*2+1]];}
function dmFight(meId,opId){const D=G.dm;if(!D||D.done)return;const next=dmNextMatch();if(!next||!next.includes(meId)||!next.includes(opId)||!dmMine(meId))return;if(!G.F[opId]){D.w[D.r].push(meId);dmAdvance();UI.modal={type:"dm"};save();render();return;}const b={id:"dm"+G.week+"_"+D.r+"_"+meId,a:meId,b:opId,week:G.week,tier:"dm",rounds:D.belt?5:3,win:0,lose:0,dm:1,title:D.belt?STADIUMS[D.belt.venue].name+" · "+D.belt.div:null,bg:D.belt?STADIUMS[D.belt.venue].bg:"bg_hall.webp"};
  UI.modal=null;openFight(b,()=>{const w=b.result;const winner=w==="A"?meId:opId,loser=w==="A"?opId:meId;D.w[D.r].push(winner);if(dmMine(loser))D.out[loser]=D.r+1;
    dmAdvance();UI.modal={type:"dm"};save();render();});}
function dmFinish(){const D=G.dm;if(!D||D.paid)return;const champ=D.w[2][0];if(!champ||!G.F[champ]){D.done=true;D.paid=true;D.prize=0;save();return;}D.champ=champ;D.paid=true;if(D.belt){beltTournamentFinish(D);return;}
  let best=0;for(const id of D.mine){const lv=id===champ?4:(D.out[id]||1);best=Math.max(best,lv);}D.best=best;
  const prize=DM_PRIZE[best]||0;G.cash+=prize;G.wkFight=(G.wkFight||0)+prize;D.prize=prize;
  if(best===4){G.rep+=4;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+10));recordHonor(G,"dm",champ,G.F[champ].div,D.wk,null,null,D.w[1].find(id=>id!==champ));}else if(best===3)G.rep+=1.5;
  G.dmLog=(G.dmLog||[]).concat([{wk:D.wk,champ,best,prize}]);save();}
function dmBracketHTML(){const D=G.dm;if(!D)return "";if(D.belt)return beltBracketHTML(D);const nm=id=>id&&G.F[id]?esc(G.F[id].name):"…";
  const cell=(id,r)=>{if(!id||!G.F[id])return `<div class="dmc tbd">…</div>`;const won=(D.w[r]||[]).includes(id),lost=r<3&&D.w[r]&&D.w[r].length*2>((r===0?D.slots:D.w[r-1]).indexOf(id))&&!won;
    return `<div class="dmc ${dmMine(id)?"mine":""} ${won?"won":""} ${lost?"lost":""}">${G.F[id].canon?`<img src="${faceSrc(id,"happy")}" alt="">`:""}<b>${nm(id)}</b><small>${G.F[id].div==="A"?"รุ่น A":"รุ่น B"}</small></div>`;};
  const col=(L,r,title)=>`<div class="dmcol"><h4>${title}</h4>${Array.from({length:L.length/2},(_,i)=>`<div class="dmm">${cell(L[i*2],r)}${cell(L[i*2+1],r)}</div>`).join("")}</div>`;
  const pad=(L,n)=>[...L.slice(0,n),...Array(Math.max(0,n-L.length)).fill(null)];
  const nx=dmNextMatch();let foot="";
  if(D.done){const lab=["","ตกรอบ 8 คน","ตกรอบรองฯ","ได้รองแชมป์","แชมป์!"][D.best];
    foot=`<div class="dmend ${D.best===4?"champ":""}"><b>${D.best===4?`🏆 ${nm(D.champ)} คว้าแชมป์ Death Match!`:`แชมป์คือ ${nm(D.champ)} · ค่ายเรา${lab}`}</b><span>เงินรางวัล ${fmt(D.prize||0)}${D.best===4?" · ชื่อเสียง +4 · กำลังใจทั้งค่าย +10":D.best===3?" · ชื่อเสียง +1.5":""}</span></div><button class="btn primary big" data-act="dmclose">กลับค่าย</button>`;}
  else if(nx){const [a,b]=nx;const both=dmMine(a)&&dmMine(b);
    foot=both?`<p class="meta center">นักมวยค่ายเราเจอกันเอง! เลือกว่าจะคุมใคร อีกคนครูแดงจะคุมให้</p><div class="row2"><button class="btn gold" data-act="dmgo" data-id="${a}" data-v="${b}">คุม${nm(a)}</button><button class="btn gold" data-act="dmgo" data-id="${b}" data-v="${a}">คุม${nm(b)}</button></div>`
      :`<button class="btn primary big" data-act="dmgo" data-id="${dmMine(a)?a:b}" data-v="${dmMine(a)?b:a}">ขึ้นชก! ${nm(dmMine(a)?a:b)} vs ${nm(dmMine(a)?b:a)} ▸</button><p class="meta center">${DM_STAGE[D.r]} · แรงที่เสียไปจะติดตัวไปรอบถัดไป</p>`;}
  return `<h2>ศึก Death Match</h2><p class="meta">8 คน ข้ามรุ่น แพ้คัดออก · ไม่นับอันดับ · ชกรวดเดียวจบในสัปดาห์นี้</p>
   <div class="dmb">${col(D.slots,0,"8 คน")}${col(pad(D.w[0],4),1,"รองฯ")}${col(pad(D.w[1],2),2,"ชิง")}<div class="dmcol"><h4>แชมป์</h4><div class="dmm">${D.w[2][0]?cell(D.w[2][0],3):'<div class="dmc tbd">?</div>'}</div></div></div>${foot}`;}
function dmPickHTML(){const R=roster(G);const sel=UI.dmSel||[];
  return `<h2>ศึก Death Match</h2><p class="meta">โปรโมเตอร์รวมนักมวยเก่ง ๆ ทุกรุ่น 8 คน ชกแพ้คัดออกจบในวันเดียว ค่าย${"ศิริชัย"}จะส่งใครลงบ้าง? (สูงสุด 3 คน)</p>
   <div class="dmprize"><span>ตกรอบแรก ${fmt(DM_PRIZE[1])}</span><span>ตกรองฯ ${fmt(DM_PRIZE[2])}</span><span>รองแชมป์ ${fmt(DM_PRIZE[3])}</span><b>แชมป์ ${fmt(DM_PRIZE[4])}</b></div>
   <div class="list">${R.map(f=>`<button class="dmpick ${sel.includes(f.id)?"on":""}" data-act="dmsel" data-id="${f.id}" ${dmCanEnter(f)?"":"disabled"}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?"บาดเจ็บ":isBooked(G,f.id,G.week)?"ติดไฟต์สัปดาห์นี้":`ล้า ${Math.round(f.fatigue)} · กำลังใจ ${Math.round(f.morale)}`}</small></span><i>${sel.includes(f.id)?"✓":""}</i></button>`).join("")}</div>
   <div class="row2"><button class="btn" data-act="dmno">ไม่ร่วม</button><button class="btn primary" data-act="dmstart" ${sel.length?"":"disabled"}>ลงแข่ง ${sel.length} คน ▸</button></div>`;}
function dmCardHTML(){if(G.dm&&!G.dm.done&&G.dm.belt)return `<section class="px card dmcard"><b>${STADIUMS[G.dm.belt.venue].name} · ${G.dm.belt.div}</b><button class="btn primary" data-act="dmopen">▸</button></section>`;if(G.dm&&!G.dm.done&&G.dm.wk===G.week)return `<section class="px card dmcard"><div><b>ศึก Death Match กำลังดำเนินอยู่</b><span class="meta">${DM_STAGE[Math.min(2,G.dm.r)]}</span></div><button class="btn primary" data-act="dmopen">ไปต่อ ▸</button></section>`;
  if(!dmOfferOn(G))return "";return `<section class="px card dmcard"><span class="ribbon">ข้อเสนอพิเศษ</span><div><b>ศึก Death Match 8 คน ข้ามรุ่น</b><span class="meta">ชกรวดเดียวจบในสัปดาห์นี้ · ไม่นับอันดับ · แชมป์ ${fmt(DM_PRIZE[4])}</span></div><button class="btn gold" data-act="dmpick">ดูรายละเอียด</button></section>`;}
Object.assign(ACT,{
  dmpick:()=>{UI.dmSel=roster(G).filter(dmCanEnter).slice(0,1).map(f=>f.id);UI.modal={type:"dmpick"};render();},
  dmsel:d=>{const s=UI.dmSel||[];UI.dmSel=s.includes(d.id)?s.filter(x=>x!==d.id):s.length<3?[...s,d.id]:s;render();},
  dmno:()=>{if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;UI.modal=null;save();render();},
  dmstart:()=>{const sel=(UI.dmSel||[]).filter(id=>dmMine(id)&&dmCanEnter(G.F[id]));if(!sel.length)return;if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;
    G.dm=dmBuild(G,sel);UI.modal=null;save();
    playScene([{n:"npc",who:"โฆษกสนาม",img:"caster_shout",t:vary("dm1",["ท่านผู้ชมครับ! คืนนี้ไม่มีพรุ่งนี้! แปดนักชกจากทุกรุ่น ชกจนเหลือคนสุดท้าย! ศึก Death Match!!","กลับมาอีกครั้งครับ! ศึกที่ไม่มีคำว่าพัก! แปดคนเข้า หนึ่งคนออก! Death Match!!","ใครเหนื่อยกลับบ้านไปได้เลยครับ! คืนนี้ชกรวดเดียวจนได้แชมป์! Death Match!!","คนดูแน่นจนเต็นท์จะพัง! แปดยอดมวยหญิงทุกรุ่น ศึก Death Match มาแล้วครับ!!"])},
      {n:"coach",t:G=>`${ME(G)} ฟังนะ ชนะแล้วต้องชกต่อเลย แรงที่เสียไปไม่กลับมาทันหรอก ยกแรก ๆ อย่าเปลืองแรง`},
      {n:sel[0],f:"angry",l:"fight",t:"ทุกคนเก่งหมดเลย… แต่ค่ายเรามาเพื่อชนะค่ะ!"}],()=>{dmAdvance();UI.modal={type:"dm"};render();},{bg:"hall",look:"fight"});},
  dmopen:()=>{dmAdvance();UI.modal={type:"dm"};render();},
  dmgo:d=>dmFight(d.id,d.v),
  dmclose:()=>{UI.modal=null;playHonorQueue(()=>render());},
});

// ===== v1.64: MINIGAME — kick the heavy bag to the khong khaek drum (rhythm, taiko-style) =====
// self-contained overlay: its own DOM + animation loop, so the main render() never touches it mid-song
const BAG_DIFF={easy:{name:"ง่าย",bpm:92,bars:8,dens:0,mul:1},normal:{name:"ปกติ",bpm:108,bars:10,dens:1,mul:1.25},hard:{name:"ยาก",bpm:124,bars:12,dens:2,mul:1.6}};
const BAG_PAT=[["L...L...","L...R...","R...R...","L.L.R...","L...R.R.","R...L..."],["L.R.L.R.","LLR.L...","L.RRL...","R.L.R.L.","L.L.RR.."],["LRLRL.R.","L.LRR.L.","RRL.RRL.","LLRRL.R.","LRRLLRR."]];
const BAG_WIN={perfect:.06,great:.12,ok:.19};
function bagChart(G,dk,salt=0,song=null){const D0=BAG_DIFF[dk],D=song?{...D0,bpm:song.bpm,bars:song.bars}:D0,beat=60/D.bpm,half=beat/2,N=[];let t=4*beat;/* one bar of count-in */
  const R=song?mulberry32(song.seed*7919):null;
  for(let b=0;b<D.bars;b++){const pool=[].concat(...BAG_PAT.slice(0,D.dens+1));const p=b===D.bars-1?"L.......":pool[Math.floor((R?R():srand(G,700+salt+b*13+D.dens*101+G.week))*pool.length)];
    for(let i=0;i<8;i++){if(p[i]!==".")N.push({t:t+i*half,k:p[i],j:null});}t+=4*beat;}
  return {notes:N,end:t+beat,beat};}
/* v1.91.188 (Man: the bag drill and the somtam stall need new songs — easy/normal/hard, 3–4 each, own backgrounds, rotating, a best score per song to chase).
   Nine songs, each a fixed chart (same notes every time, so a score means something) and its own backing track synthesised in the browser:
   a phin/pi lead in a Thai pentatonic, a bass line, ching on the beat, klong accents — slow and airy on easy, driving with arpeggios on hard. */
const BAG_SONGS=[
 {id:"ping",dk:"easy",n:"ลมเย็นริมปิง",sub:"เพลงช้า ๆ ริมน้ำยามเช้า",bpm:88,bars:8,bg:"bg_river_dawn.webp",root:62,prog:[0,4,5,3],seed:11,lead:"triangle",col:"#7fd4ff"},
 {id:"talat",dk:"easy",n:"ตลาดเช้าวันพระ",sub:"แม่ค้าร้องเพลงไปทอนเงินไป",bpm:96,bars:8,bg:"bg_market_morning.webp",root:60,prog:[0,5,3,4],seed:23,lead:"square",col:"#ffd36a"},
 {id:"waikru",dk:"easy",n:"รำไหว้ครูยามสาย",sub:"ปี่ชวาเป่านำ กลองแขกตาม",bpm:92,bars:8,bg:"bg_camp_day.webp",root:57,prog:[0,3,0,4],seed:37,lead:"square",col:"#ffb3c8"},
 {id:"ngarnwat",dk:"normal",n:"กลองแขกงานวัด",sub:"เวทีมวยกลางงานวัดคืนเดือนเพ็ญ",bpm:108,bars:10,bg:"bg_fair.webp",root:62,prog:[0,4,5,4],seed:41,lead:"square",col:"#ff8a5a"},
 {id:"samlor",dk:"normal",n:"สามล้อซิ่งถนนคนเดิน",sub:"แสงไฟ ร้านริมทาง ลมหนาว",bpm:114,bars:10,bg:"bg_night_north.webp",root:59,prog:[0,5,3,4],seed:53,lead:"square",col:"#c89bff"},
 {id:"fontok",dk:"normal",n:"ฝนตกที่ค่าย",sub:"ซ้อมใต้หลังคาสังกะสี",bpm:110,bars:10,bg:"bg_camp_rain.webp",root:57,prog:[0,3,4,0],seed:67,lead:"triangle",col:"#7ab4ff"},
 {id:"songkran",dk:"hard",n:"สงกรานต์สาดไม่ยั้ง",sub:"ปืนฉีดน้ำ เสียงเบส ดินสอพอง",bpm:126,bars:12,bg:"bg_songkran.webp",root:62,prog:[0,4,5,3],seed:71,lead:"square",col:"#5ad8ff"},
 {id:"loy",dk:"hard",n:"ลอยกระทงกลองรัว",sub:"โคมลอยเต็มฟ้า กลองไม่ยอมหยุด",bpm:132,bars:12,bg:"bg_loy_night.webp",root:60,prog:[0,5,3,4],seed:83,lead:"square",col:"#ffcf5a"},
 {id:"final",dk:"hard",n:"คืนชิงแชมป์",sub:"เสียงเชียร์ทั้งสนาม · ยกสุดท้าย",bpm:140,bars:12,bg:"bg_final.webp",root:57,prog:[0,4,3,4],seed:97,lead:"sawtooth",col:"#ff5a6a"}];
const BAG_SCALE=[0,2,4,7,9];
function songsOf(dk){return BAG_SONGS.filter(x=>x.dk===dk);}
function songBest(G,mode,id){return ((G.mini||{}).song||{})[mode+":"+id]||null;}
/* the song of the week: rotates through each difficulty so there is always a "new" one to try */
function songPickDefault(G,dk){const L=songsOf(dk);return L[((G.week||1)+(G.season||1)*3)%L.length];}
const MG_MODES={
 bag:{icon:"🥁",title:"เตะกระสอบตามกลองแขก",L:"ตุ๊บ",R:"ติ๊ง",Ls:"เตะ",Rs:"หมัด",note:"ฝึกจังหวะเตะ/หมัด · ได้ค่าพลัง กำลังใจ เศษดาว",open:G=>G.week>=2},
 somtam:{icon:"🥗",title:"ตำส้มตำร้านป้าแต๋ว",L:"ตำ",R:"คลุก",Ls:"สาก",Rs:"ช้อน",note:"ช่วยร้านป้าแต๋วตอนลูกค้าแน่น · ได้ค่าจ้าง ชื่อเสียงนิดหน่อย",open:G=>G.week>=4}};
const MG_ACT={bag:"drum",somtam:"somtam",live:"live"};
function mgPlayed(G,m){return !!G.campUsed;}/* v1.68: a minigame is the week's camp activity — once one is used, replays are practice */
function bagPlayed(G){return mgPlayed(G,"bag");}
function mgChipText(G){return Object.entries(MG_MODES).filter(([k,M])=>M.open(G)).map(([k,M])=>M.icon+(mgPlayed(G,k)?"✓":"")).join(" ");}
function bagFighters(G){return roster(G).filter(f=>f.camp==="player"&&!f.injury);}
const BAG={st:null,
  clock(){return AU.ctx?AU.ctx.currentTime:performance.now()/1000;},
  drum(k,t){if(!AU.ctx||AU.muted)return;try{if(k==="L"){AU.tone(t,{f:150,to:55,type:"sine",dur:.28,peak:.9,bus:AU.sfxBus});AU.noiseHit(t,{f:420,dur:.08,peak:.5});}
    else{AU.noiseHit(t,{f:2600,type:"bandpass",q:2.2,dur:.07,peak:.7});AU.tone(t,{f:340,to:300,type:"triangle",dur:.09,peak:.35,bus:AU.sfxBus});}}catch(e){}},
  wood(k,t){if(!AU.ctx||AU.muted)return;try{if(k==="L"){AU.noiseHit(t,{f:700,dur:.06,peak:.8});AU.tone(t,{f:240,to:120,type:"triangle",dur:.12,peak:.6,bus:AU.sfxBus});}
    else{AU.noiseHit(t,{f:5200,type:"highpass",q:.7,dur:.09,peak:.35,sweep:.6});}}catch(e){}},
  ching(t,open){if(!AU.ctx||AU.muted)return;try{AU.tone(t,{f:open?2350:2100,type:"sine",dur:open?.5:.08,peak:open?.16:.12,bus:AU.sfxBus});AU.tone(t,{f:open?3130:2900,type:"sine",dur:open?.35:.06,peak:.07,bus:AU.sfxBus});}catch(e){}},
  /* backing track for a song, scheduled up front on its own bus so it can be cut when the drill ends */
  music(song,t0,beat,bars){if(!AU.ctx||AU.muted)return;try{const c=AU.ctx,bus=c.createGain();bus.gain.value=.8;bus.connect(AU.sfxBus);this.st.bus=bus;
    const R=mulberry32(song.seed),dk=song.dk,hz=m=>440*Math.pow(2,(m-69)/12),sc=d=>song.root+12+BAG_SCALE[((d%5)+5)%5]+12*Math.floor(d/5);
    const T=(t,o)=>AU.tone(t,{...o,bus});
    /* a 2-bar motif from the song's seed, answered by a variation — the tune repeats so it is learnable */
    const mot=[];let d=4;for(let i=0;i<16;i++){const rest=R()<(dk==="easy"?.4:dk==="normal"?.28:.18);if(rest){mot.push(null);continue;}d=Math.max(0,Math.min(9,d+[-2,-1,-1,0,1,1,2][Math.floor(R()*7)]));mot.push(d);}
    const var2=mot.map((x,i)=>x==null?null:i>=12?Math.max(0,x-((i%2)+1)):x);
    for(let b=0;b<bars+1;b++){const bt=t0+b*4*beat,ch=song.prog[b%song.prog.length],rootHz=hz(song.root-12+BAG_SCALE[ch%5]+(ch>=5?12:0));
      for(let q=0;q<4;q++){const tq=bt+q*beat;
        T(tq,{f:q%2?2100:2350,type:"sine",dur:q%2?.08:.4,peak:q%2?.1:.13});
        if(b>0){T(tq,{f:rootHz,type:"triangle",dur:beat*.45,peak:.32});T(tq+beat/2,{f:rootHz*2,type:"triangle",dur:beat*.35,peak:.2});
          if(q===0||q===2)T(tq,{f:120,to:50,type:"sine",dur:.18,peak:.28});
          if(dk!=="easy"&&q===3)AU.noiseHit(tq+beat/2,{f:1800,type:"bandpass",q:1.5,dur:.05,peak:.18,bus});
          if(dk==="hard")for(let k=0;k<4;k++)T(tq+k*beat/4,{f:rootHz*[2,3,4,3][k],type:"square",dur:beat/4*.8,peak:.035});}}
      if(b>=1&&b<bars){const M=(b%4===3)?var2:mot;const half=beat/2;for(let i=0;i<8;i++){const n=M[(b%2)*8+i];if(n==null)continue;const tt=bt+i*half;
        T(tt,{f:hz(sc(n)),type:song.lead,dur:half*(i%2?0.8:1.4),peak:song.lead==="triangle"?.22:.09});}}}
    /* last hit */const te=t0+bars*4*beat;T(te,{f:hz(song.root),type:"triangle",dur:1.2,peak:.3});T(te,{f:2350,type:"sine",dur:.8,peak:.16});}catch(e){}},
  /* v1.91.188 live calls: Auntie Taew at the stall (with a rival stall across the lane racing for customers), Kru Daeng at the bag */
  say(t){const e=document.getElementById("mbcomt");if(!e||e.textContent===t)return;e.textContent=t;const b=document.getElementById("mbcom");if(b){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");}},
  calls(t){const S=this.st;if(S.duel)return;const tam=S.mode==="somtam",P=tam?"ป้าแต๋ว: ":"ครูแดง: ",F=S.cf=S.cf||{},once=(k,x)=>{if(!F[k]){F[k]=1;this.say(P+x);}};
    const pass=S.notes.filter(n=>n.t<t).length,tot=S.notes.length;
    if(tam){S.rival=pass*72;const me=Math.floor(S.score/220),op=Math.floor(S.rival/220),a=document.getElementById("tamme"),b=document.getElementById("tamop"),u=document.querySelector("#tambar u");
      if(a)a.textContent=me;if(b)b.textContent=op;if(u)u.style.width=Math.round(100*(S.score+200)/(S.score+S.rival+400))+"%";
      const lead=S.score>=S.rival?1:-1;if(pass>6&&S.lead&&lead!==S.lead&&t-(S.leadT||0)>2.5){S.leadT=t;this.say(P+(lead>0?"ลูกค้าย้ายมาฝั่งเราแล้ว! เจ๊ปลาหน้าเสียเลย":"ร้านเจ๊ปลาแย่งคิวไปแล้ว! เร็วเข้าลูก!"));}S.lead=lead;}
    if(S.combo>=10)once("c10",tam?"มือขึ้นแล้ว! เสียงครกดังไปทั้งตลาด":"ดี! จังหวะเข้าแล้ว อย่าหลุด");
    if(S.combo>=20)once("c20",tam?"ยี่สิบครกไม่พลาด! ลูกค้าต่อคิวยาวเลย":"ยี่สิบติด! นี่แหละขาของนักมวย");
    S.mstreak=S.lastMiss!==S.c.miss?(S.mstreak||0)+(S.c.miss-(S.lastMiss||0)):S.mstreak;S.lastMiss=S.c.miss;
    if(S.c.miss>0&&S.combo===0&&S.mstreak>=3&&t-(S.missT||0)>3){S.missT=t;S.mstreak=0;this.say(P+(tam?"เบา ๆ ลูก มะละกอกระเด็นออกนอกครกแล้ว":"หลุดแล้ว! ฟังฉิ่ง นับหนึ่งใหม่"));}
    if(S.combo>0)S.mstreak=0;
    if(pass>=tot/2)once("half",tam?"ครึ่งทางแล้ว ลูกค้ายังมาเรื่อย ๆ":"ครึ่งทางแล้ว ขาอย่าแผ่ว");
    if(tot-pass<=8&&pass>8)once("last",tam?"จานสุดท้าย! ตำให้สุดแรง!":"ชุดสุดท้าย! ใส่ให้หมด!");},
  stopMusic(){const S=this.st;if(S&&S.bus){try{const g=S.bus;g.gain.setTargetAtTime(0,AU.ctx.currentTime,.05);setTimeout(()=>{try{g.disconnect()}catch(_){}},400);}catch(e){}S.bus=null;}},
  open(){const F=bagFighters(G);if(!F.length){toast("ไม่มีนักมวยที่พร้อมซ้อม");return;}
    const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"hub",mode:"bag",id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();this.draw();},
  openMode(m,act,mail){const F=bagFighters(G);if(!F.length){toast("ไม่มีนักมวยที่พร้อมซ้อม");return;}const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"pick",mode:m,act,mail,id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();if(m==="live"){LIVE.pick();LIVE.st.practice=false;LIVE.st.act=act;LIVE.draw();}else if(m==="run"){RUN.pick();RUN.st.practice=false;RUN.st.act=act;RUN.draw();}else this.draw();},
  mount(){let el=document.getElementById("minibag");if(!el){el=document.createElement("div");el.id="minibag";el.className="mgame";document.body.appendChild(el);}
    el.onclick=e=>{const lv=e.target.closest("[data-lv]");if(lv&&typeof LIVE!=="undefined"){LIVE.act(lv.dataset.lv,lv.dataset.v);return;}const rn=e.target.closest("[data-rn]");if(rn&&typeof RUN!=="undefined"){if(rn.dataset.rn!=="L"&&rn.dataset.rn!=="R")RUN.act(rn.dataset.rn,rn.dataset.v);return;}const sp=e.target.closest("[data-sp]");if(sp&&typeof SPORTS!=="undefined"){SPORTS.act(sp.dataset.sp);return;}const du=e.target.closest("[data-du]");if(du&&typeof DUEL!=="undefined"){DUEL.act(du.dataset.du,du.dataset.v);return;}const b=e.target.closest("[data-mb]");if(!b)return;const a=b.dataset.mb,v=b.dataset.v;
      if(a==="mode"&&MG_MODES[v]&&MG_MODES[v].custom){this.st.mode=v;if(v==="run")RUN.pick();else LIVE.pick();}else if(a==="mode"){this.st.mode=v;this.st.phase="pick";this.st.practice=mgPlayed(G,v);this.draw();}else if(a==="hub"){this.st.phase="hub";this.draw();}else if(a==="pick"){this.st.id=v;this.draw();}else if(a==="dk"){this.st.dk=v;this.st.song=null;this.draw();}else if(a==="song"){const sg=BAG_SONGS.find(x=>x.id===v);if(sg){this.st.song=v;this.st.dk=sg.dk;}this.draw();}else if(a==="go")this.start();else if(a==="close")this.close();else if(a==="claim")this.claim();else if(a==="again"){this.st.phase="pick";this.st.practice=true;this.draw();}};
    if(!this.keyH){this.keyH=e=>{if(!e.repeat&&typeof TUG!=="undefined"&&TUG.st&&!TUG.st.done){const k=e.key.toLowerCase();if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();TUG.tap();return;}if(k==="j"||k==="k"||k==="arrowright"||k===" "){e.preventDefault();TUG.heave();return;}}if(!e.repeat&&typeof RELAY!=="undefined"&&RELAY.st&&(e.key===" "||/^[jk]$/i.test(e.key)||e.key==="ArrowRight")){e.preventDefault();RELAY.pass();return;}if(typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"&&/^[123]$/.test(e.key)){const d=LIVE.st.cur;if(d){e.preventDefault();LIVE.answer(d.ord[+e.key-1]);}return;}if(typeof RUN!=="undefined"&&RUN.st&&(RUN.st.phase==="race"||RUN.st.phase==="set")){const k=e.key.toLowerCase();if(e.repeat)return;if(k==="enter"||k==="arrowup"){e.preventDefault();RUN.pass();return;}if(k==="f"||k==="d"||k==="arrowleft"||k==="j"||k==="k"||k==="arrowright"||k===" "){e.preventDefault();RUN.tap("L");}return;}
      if(!this.st||this.st.phase!=="play")return;const k=e.key.toLowerCase();if(e.repeat)return;
      if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();this.hit("L");}else if(k==="j"||k==="k"||k==="arrowright"){e.preventDefault();this.hit("R");}else if(k==="escape")this.close();};
      document.addEventListener("keydown",this.keyH);
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"){LIVE.st.dur=0;}if(document.hidden&&this.st&&this.st.phase==="play"){this.stopMusic();this.st.phase="abort";cancelAnimationFrame(this.raf);this.draw();}if(document.hidden&&typeof RUN!=="undefined"&&RUN.st&&(RUN.st.phase==="race"||RUN.st.phase==="set")){RUN.stop();RUN.st.phase="pick";RUN.draw();}});}},
  close(){cancelAnimationFrame(this.raf);this.stopMusic&&this.stopMusic();if(typeof LIVE!=="undefined"&&LIVE.st){cancelAnimationFrame(LIVE.raf);LIVE.st=null;}if(typeof SPORTS!=="undefined"&&SPORTS.st){SPORTS.close();return;}if(typeof RUN!=="undefined"&&RUN.st){RUN.stop();RUN.st=null;}const dz=typeof DUEL!=="undefined"&&DUEL.st;if(dz){DUEL.abort();}const el=document.getElementById("minibag");if(el)el.remove();this.st=null;try{AU.startMusic("hub");}catch(e){}if((G.cardPend||[]).length&&!UI.modal)UI.modal={type:"cardnew"};render();},
  draw(){const S=this.st,el=document.getElementById("minibag");if(!S||!el)return;if(S.phase==="live")return LIVE.draw();if(S.phase==="run")return RUN.draw();if(S.phase==="duel"&&typeof DUEL!=="undefined")return DUEL.draw();if(S.phase==="sports"&&typeof SPORTS!=="undefined")return SPORTS.draw();const F=bagFighters(G),f=G.F[S.id];
    const M=MG_MODES[S.mode];
    if(S.phase==="hub"){el.innerHTML=`<div class="mbox px"><h2>${JOY_PX}มินิเกม</h2><p class="meta center">แต่ละเกมได้รางวัลสัปดาห์ละครั้ง · เล่นซ้ำเป็นโหมดซ้อมได้ไม่จำกัด</p>
       <div class="mghub">${Object.entries(MG_MODES).map(([k,X])=>{const op=X.open(G),pl=mgPlayed(G,k);return `<button class="mgitem ${pl?"done":""}" data-mb="mode" data-v="${k}" ${op?"":"disabled"}><span class="mi">${X.icon}</span><span><b>${X.title}</b><small>${op?(pl?"รับรางวัลแล้วสัปดาห์นี้ ✓":X.note):"ยังไม่เปิด"}</small></span><span class="chev">▸</span></button>`;}).join("")}</div>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">กลับค่าย</button></div></div>`;return;}
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{})[S.mode]||{};
      el.innerHTML=`<div class="mbox px"><h2>${M.icon} ${M.title}</h2>
       <p class="meta">กดตามโน้ตตอนที่ลอยมาถึงวงกลม · <b class="mbL">${M.L}</b> = ${M.Ls} (ปุ่มซ้าย / F) · <b class="mbR">${M.R}</b> = ${M.Rs} (ปุ่มขวา / J)</p>
       <div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-mb="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <div class="sgtabs">${Object.entries(BAG_DIFF).map(([k,d])=>`<button class="${k===S.dk?"on":""}" data-mb="dk" data-v="${k}">${d.name}</button>`).join("")}</div>
       <div class="songs">${songsOf(S.dk).map(x=>{const b=songBest(G,S.mode,x.id),on=(S.song||songPickDefault(G,S.dk).id)===x.id,rec=songPickDefault(G,S.dk).id===x.id;
         return `<button class="songc ${on?"on":""}" data-mb="song" data-v="${x.id}" style="--bg:url(a/${x.bg});--sc:${x.col}"><span class="sgt"><b>${esc(x.n)}</b><small>${esc(x.sub)}</small><em>${x.bpm} BPM${rec?` · <i>เพลงประจำสัปดาห์</i>`:""}</em></span>
           <span class="sgb">${b?`<b class="g${b.g}">${b.g}</b><small>${b.s.toLocaleString()}</small>${b.fc?`<i>FC</i>`:""}`:`<small>ยังไม่เคยเล่น</small>`}</span></button>`;}).join("")}</div>
       <p class="meta center">${S.card?(S.practice?"มินิเกมของการ์ด · เล่นซ้อมได้ไม่จำกัด":"มินิเกมของการ์ด · เล่นจบครั้งแรกได้เศษดาว ✦ ตามเกรด"):S.practice?"สัปดาห์นี้เล่นไปแล้ว · รอบนี้เป็นโหมดซ้อม ไม่มีรางวัล":S.mode==="bag"?"รางวัลสัปดาห์ละครั้ง: ค่าเตะ/หมัด · กำลังใจ · เศษดาว ✦ · เกรด S ปลดการ์ด":"รางวัลสัปดาห์ละครั้ง: ค่าจ้างจากป้าแต๋ว · ชื่อเสียง · เศษดาว ✦ · เกรด S ปลดการ์ด"}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ไว้ก่อน</button><button class="btn primary" data-mb="go">เริ่ม! ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mplay"><div class="mhud"><b>${esc(f.name)}</b><span>คอมโบ <b id="mbc">0</b></span><span>คะแนน <b id="mbs">0</b></span><button class="xbtn" data-mb="close" aria-label="ออก">✕</button></div>
       ${S.songObj?`<div class="mbsong" style="--sc:${S.songObj.col}"><b>${esc(S.songObj.n)}</b><small>${BAG_DIFF[S.songObj.dk].name} · ${S.songObj.bpm} BPM</small></div>`:""}
       ${S.mode==="somtam"&&!S.duel?`<div class="tamvs"><span class="me">ร้านป้าแต๋ว <b id="tamme">0</b> จาน</span><i id="tambar"><u style="width:50%"></u></i><span class="op"><b id="tamop">0</b> จาน ร้านเจ๊ปลา</span></div>`:""}
       <canvas id="mbcv" width="360" height="300"></canvas>
       ${S.duel?"":`<div class="rncom" id="mbcom"><img src="${S.mode==="somtam"?"a/npc_vendor_red.webp":faceSrc("coach")}" alt="" class="${S.mode==="somtam"?"tall":""}"><span id="mbcomt">${S.mode==="somtam"?"ป้าแต๋ว: ลูกค้ามาแล้ว! ตำให้ทันนะลูก":"ครูแดง: ฟังกลองให้ดี แล้วเตะตาม"}</span></div>`}
       <div class="mbtns"><button class="mbtn L ${S.mode}" id="mbL"><b>${M.L}</b><small>${M.Ls} · F</small></button><button class="mbtn R ${S.mode}" id="mbR"><b>${M.R}</b><small>${M.Rs} · J</small></button></div></div>`;
      const pd=k=>e=>{e.preventDefault();this.hit(k);};document.getElementById("mbL").addEventListener("pointerdown",pd("L"));document.getElementById("mbR").addEventListener("pointerdown",pd("R"));return;}
    if(S.phase==="abort"){el.innerHTML=`<div class="mbox px"><h2>หยุดกลางคัน</h2><p class="meta center">สลับแอปหรือปิดหน้าจอระหว่างเล่น เพลงเลยหยุด · ยังไม่เสียสิทธิ์รางวัลสัปดาห์นี้</p><div class="mfoot roadbtns"><button class="btn" data-mb="close">ปิด</button><button class="btn primary" data-mb="again">เล่นใหม่</button></div></div>`;return;}
    if(S.phase==="result"){const R=S.res,sb=R.song?songBest(G,S.mode,R.song.id):null;
      el.innerHTML=`<div class="mbox px mres">${R.song?`<div class="mbsong big" style="--sc:${R.song.col};--bg:url(a/${R.song.bg})"><b>${esc(R.song.n)}</b><small>${BAG_DIFF[R.song.dk].name} · ${R.song.bpm} BPM</small></div>`:`<h2>ผลการซ้อม</h2>`}
       ${S.mode==="somtam"&&R.rival!=null?`<p class="center tamres">${R.score>=R.rival?`<b class="goldt">ชนะร้านเจ๊ปลา!</b>&nbsp; ขายได้ ${Math.floor(R.score/220)} จาน ต่อ ${Math.floor(R.rival/220)}`:`ร้านเจ๊ปลาขายได้มากกว่า · ${Math.floor(R.score/220)} ต่อ ${Math.floor(R.rival/220)} จาน`}</p>`:""}
       ${R.songBest&&R.prev&&R.prev.s?`<p class="center"><b class="newrec">สถิติใหม่ของเพลงนี้!</b> เดิม ${R.prev.s.toLocaleString()}</p>`:R.song&&sb&&!R.songBest?`<p class="center meta">สถิติเพลงนี้ ${sb.s.toLocaleString()} · เกรด ${sb.g||"-"}</p>`:""}<div class="mgrade g${R.grade}">${R.grade}</div>
       ${R.c.miss===0&&R.maxc>0?`<div class="fullcombo">FULL COMBO!</div>`:""}<p class="center"><b>${R.score}</b> คะแนน · คอมโบสูงสุด ${R.maxc} · แม่นยำ ${Math.round(R.acc*100)}%</p>
       <p class="center meta">เพอร์เฟกต์ ${R.c.perfect} · ดี ${R.c.great} · พอได้ ${R.c.ok} · พลาด ${R.c.miss}${R.best?" · <b class=\"goldt\">สถิติใหม่!</b>":""}</p>
       ${S.practice?`<p class="center meta">โหมดซ้อม · ไม่มีรางวัล</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-mb="again">เล่นอีกรอบ (ซ้อม)</button><button class="btn primary" data-mb="close">กลับค่าย</button></div></div>`;}},
  start(){const S=this.st;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}
    G.mini=G.mini||{};G.mini.bagLast=S.id;G.mini.bagDk=S.dk;
    const song=S.duel?null:(BAG_SONGS.find(x=>x.id===S.song)||songPickDefault(G,S.dk));S.songObj=song;const C=bagChart(G,S.dk,S.mode==="somtam"?5000:0,song);if(S.duel){const cut=C.beat*4*(1+S.duel.bars);C.notes=C.notes.filter(n=>n.t<cut);C.end=cut+C.beat;}S.notes=C.notes;S.end=C.end;S.beat=C.beat;S.phase="play";S.cf={};S.lead=0;S.mstreak=0;S.lastMiss=0;S.missT=0;S.leadT=0;S.score=0;S.combo=0;S.maxc=0;S.c={perfect:0,great:0,ok:0,miss:0};S.fx=[];S.hitT=-9;S.hitK="L";
    this.draw();S.t0=this.clock()+.6;if(song){this.music(song,S.t0,S.beat,Math.round((S.end-S.beat)/(4*S.beat)));if(song.bg)S.bgImg=img(song.bg);}else{const nb=Math.round(S.end/S.beat);for(let i=0;i<nb;i++)this.ching(S.t0+i*S.beat,i%2===0);}
    const cv=document.getElementById("mbcv");S.x=cv.getContext("2d");S.x.imageSmoothingEnabled=false;const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.frame();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  now(){return this.clock()-this.st.t0;},
  judge(n,q){const S=this.st;n.j=q;S.c[q]++;if(q==="miss"){S.combo=0;}else{S.combo++;S.maxc=Math.max(S.maxc,S.combo);S.score+=({perfect:100,great:70,ok:40})[q]+Math.min(50,S.combo*2);}
    S.fx.push({q,t:this.now()});if(q!=="miss"){(S.rings=S.rings||[]).push({q,t:this.now()});if(S.combo>=10&&S.combo%10===0)S.cpop={n:S.combo,t:this.now()};}else S.shk=this.now();const c=document.getElementById("mbc"),s=document.getElementById("mbs");if(c){c.textContent=S.combo;c.classList.remove("cb");void c.offsetWidth;if(S.combo>1)c.classList.add("cb");}if(s)s.textContent=S.score;},
  hit(k){const S=this.st;if(!S||S.phase!=="play")return;const t=this.now();if(S.mode==="somtam")this.wood(k,this.clock());else this.drum(k,this.clock());S.hitT=t;S.hitK=k;
    const btn=document.getElementById(k==="L"?"mbL":"mbR");if(btn){btn.classList.remove("hit");void btn.offsetWidth;btn.classList.add("hit");}
    let best=null,bd=9;for(const n of S.notes){if(n.j)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}if(n.t-t>BAG_WIN.ok)break;}
    if(!best||bd>BAG_WIN.ok)return;/* stray tap: no penalty */
    if(best.k!==k){this.judge(best,"miss");return;}
    this.judge(best,bd<=BAG_WIN.perfect?"perfect":bd<=BAG_WIN.great?"great":"ok");},
  frame(){const S=this.st,x=S.x,W=360,H=300,t=this.now(),f=G.F[S.id];
    for(const n of S.notes){if(!n.j&&t-n.t>BAG_WIN.ok)this.judge(n,"miss");}
    if(t>S.end+.4){this.finish();return;}
    if(t>0)this.calls(t);
    /* v1.91.185 rhythm juice (from the 4-lane rhythm demo): the whole screen pulses on the beat, a miss jolts it, the drum lights up when pressed,
       good hits burst a ring at the drum, PERFECT/GREAT pop big and settle, every 10 in a row a combo pop-up, full combo celebrated at the end */
    const RM=typeof matchMedia!=="undefined"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    x.save();if(!RM&&S.shk!=null&&t-S.shk<.18){const k2=1-(t-S.shk)/.18;x.translate((Math.random()-.5)*8*k2,(Math.random()-.5)*6*k2);}
    x.clearRect(-10,-10,W+20,H+20);const bph=t>0?((t%S.beat)/S.beat):1,pul=RM?0:Math.pow(1-bph,3);x.fillStyle="#1b1530";x.fillRect(-10,-10,W+20,H+20);{const bi=S.bgImg;if(bi&&bi.complete&&bi.naturalWidth){const sc2=Math.max(W/bi.naturalWidth,222/bi.naturalHeight),bw=bi.naturalWidth*sc2,bh=bi.naturalHeight*sc2;x.imageSmoothingEnabled=true;x.drawImage(bi,(W-bw)/2,(222-bh)*.6,bw,bh);x.imageSmoothingEnabled=false;const gr=x.createLinearGradient(0,0,0,222);gr.addColorStop(0,"rgba(16,10,30,.15)");gr.addColorStop(1,"rgba(16,10,30,.75)");x.fillStyle=gr;x.fillRect(0,0,W,222);}}
    if(pul>0){x.fillStyle=`rgba(255,211,74,${.10*pul})`;x.fillRect(0,0,W,H);}
    // fighter + heavy bag (same drawing as the training drill)
    const dt=(t-S.hitT)*1000,hit=dt>=0&&dt<450;const row=hit?(S.mode==="somtam"?"punch":S.hitK==="L"?"knee":"punch"):(S.mode==="somtam"?"idle":"guard");const fr=hit?Math.min(3,Math.floor(dt/90)):Math.floor(performance.now()/260)%4;
    x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.ellipse(W*.4,196,40,6,0,0,7);x.fill();
    if(S.mode==="somtam"&&!S.duel){/* the rival stall across the lane: green awning, Jae Pla pounding on the beat */const rx=6,ry=66;x.fillStyle="#1d5a32";x.fillRect(rx,ry,92,12);for(let i=0;i<6;i++){x.fillStyle=i%2?"#e8f3ea":"#2f8a50";x.fillRect(rx+i*15.3,ry+12,15.3,8);}
      x.fillStyle="#5a3e24";x.fillRect(rx+4,ry+20,4,70);x.fillRect(rx+84,ry+20,4,70);x.fillStyle="#6b4a2b";x.fillRect(rx,ry+66,92,7);
      const vg=img("npc_vendor_green.webp");if(vg.complete&&vg.naturalWidth){const bob=Math.max(0,Math.sin((t/S.beat)*Math.PI))*3;x.imageSmoothingEnabled=true;x.drawImage(vg,0,0,vg.naturalWidth,vg.naturalHeight*.55,rx+22,ry+20+bob,46,46*vg.naturalHeight*.55/vg.naturalWidth);x.imageSmoothingEnabled=false;}
      x.fillStyle="#6b4a2b";x.fillRect(rx,ry+66,92,7);x.fillStyle="#b5653a";x.fillRect(rx+56,ry+56,20,12);
      x.fillStyle="#fff";x.font="bold 10px sans-serif";x.textAlign="center";x.fillText("ส้มตำเจ๊ปลา",rx+46,ry+9);}
    if(S.mode==="somtam"){/* stall table, clay mortar, wooden pestle */const mx=W*.62;x.fillStyle="#6b4a2b";x.fillRect(W*.42,150,W*.5,10);x.fillStyle="#4a3220";x.fillRect(W*.45,160,6,40);x.fillRect(W*.86,160,6,40);
      x.fillStyle="#2a1a10";x.fillRect(mx-30,112,60,40);x.fillStyle="#b5653a";x.fillRect(mx-28,114,56,36);x.fillStyle="#d07a48";x.fillRect(mx-28,114,10,36);x.fillStyle="#7a3d20";x.fillRect(mx-24,114,48,6);
      x.fillStyle="#9fd36a";for(let i=0;i<5;i++)x.fillRect(mx-20+i*9,108+(i%2)*2,6,6);x.fillStyle="#e84a3a";x.fillRect(mx-8,106,4,4);x.fillRect(mx+10,107,4,4);
      const py=hit&&S.hitK==="L"?Math.min(1,dt/70)*26*Math.max(0,1-(dt-70)/300):0,pr=hit&&S.hitK==="R"?Math.sin(dt/40)*8*Math.max(0,1-dt/400):0;
      x.fillStyle="#2a1a10";x.fillRect(mx-6+pr,56+py,12,58);x.fillStyle="#c89a62";x.fillRect(mx-4+pr,58+py,8,54);x.fillStyle="#e0b67e";x.fillRect(mx-4+pr,58+py,3,54);
      x.fillStyle="#fff";x.font='bold 12px sans-serif';x.textAlign="center";x.fillText("ร้านป้าแต๋ว",mx,176);}
    else{const sw=hit?Math.sin(dt/80)*Math.max(0,1-dt/450)*9:Math.sin(performance.now()/700)*1.2,bx=W*.6+sw,by=34;
    x.fillStyle="#555";x.fillRect(W*.6-1,0,2,by);x.fillStyle="#2b2530";x.fillRect(bx-19,by-2,38,124);x.fillStyle="#c8283c";x.fillRect(bx-17,by,34,120);x.fillStyle="#e23b4e";x.fillRect(bx-17,by,7,120);
    x.fillStyle="#1f1f24";x.fillRect(bx-17,by+20,34,4);x.fillRect(bx-17,by+92,34,4);}
    try{drawFrame(x,sheetFor(f),ROW[row],fr,W*.38,198,180,false);}catch(e){}
    // judgement pop
    const last=S.fx[S.fx.length-1];if(last&&t-last.t<.6){const a=(t-last.t)/.6,p=Math.min(1,(t-last.t)/.12),sc=last.q==="miss"?1:1+.6*(1-p)+.08*Math.sin(p*Math.PI);x.save();x.globalAlpha=Math.max(0,1-Math.max(0,a-.5)*2);
      x.translate(W*.6,34-a*8);x.scale(sc,sc);x.font=`900 ${last.q==="perfect"?30:24}px "Chakra Petch","Pixelify Sans",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=6;x.lineJoin="round";x.strokeStyle="#000";
      const T={perfect:["PERFECT!","#ffd34a"],great:["GREAT!","#8ef0a0"],ok:["OK","#fff"],miss:["MISS","#ff6a6a"]}[last.q];x.strokeText(T[0],0,0);x.fillStyle=T[1];x.fillText(T[0],0,0);x.restore();}
    if(S.cpop&&t-S.cpop.t<.9){const a=(t-S.cpop.t)/.9,p=Math.min(1,(t-S.cpop.t)/.15);x.save();x.globalAlpha=Math.max(0,1-Math.max(0,a-.6)/.4);x.translate(W*.24,70);x.rotate(-.12);x.scale(1+.7*(1-p),1+.7*(1-p));
      x.font='900 30px "Chakra Petch",sans-serif';x.textAlign="center";x.lineWidth=7;x.lineJoin="round";x.strokeStyle="#4a0a18";x.strokeText(S.cpop.n+" COMBO!",0,0);x.fillStyle="#ff7a3a";x.fillText(S.cpop.n+" COMBO!",0,0);x.restore();}
    // note lane (taiko style: notes slide in from the right to the drum circle)
    const ly=252,hx=46,sp=210;x.fillStyle="#120e22";x.fillRect(0,ly-30,W,60);x.fillStyle="#2c2448";x.fillRect(0,ly-30,W,3);x.fillRect(0,ly+27,W,3);
    const bt=S.beat;for(let b=Math.ceil((t-.5)/bt)*bt;b<t+1.8;b+=bt){const bx2=hx+(b-t)*sp;if(bx2>0&&bx2<W){x.fillStyle="rgba(255,255,255,.08)";x.fillRect(bx2,ly-26,2,52);}}
    {const pr=(t-S.hitT);if(pr>=0&&pr<.15){x.fillStyle=S.hitK==="L"?`rgba(226,68,60,${.55*(1-pr/.15)})`:`rgba(60,139,226,${.55*(1-pr/.15)})`;x.fillRect(0,ly-27,W,54);x.beginPath();x.arc(hx,ly,26,0,7);x.fill();}}
    x.lineWidth=3+2*pul;x.strokeStyle="#ffd34a";x.beginPath();x.arc(hx,ly,22+2*pul,0,7);x.stroke();x.strokeStyle="rgba(255,211,74,.35)";x.beginPath();x.arc(hx,ly,15,0,7);x.stroke();
    S.rings=(S.rings||[]).filter(r=>t-r.t<.4);for(const r of S.rings){const e=(t-r.t)/.4;x.strokeStyle=r.q==="perfect"?`rgba(255,211,74,${1-e})`:r.q==="great"?`rgba(142,240,160,${1-e})`:`rgba(255,255,255,${.7*(1-e)})`;x.lineWidth=4*(1-e)+1;x.beginPath();x.arc(hx,ly,22+e*34,0,7);x.stroke();
      if(r.q==="perfect")for(let i=0;i<8;i++){const a=i/8*6.283;x.fillStyle=`rgba(255,240,170,${1-e})`;x.fillRect(hx+Math.cos(a)*(26+e*40)-2,ly+Math.sin(a)*(26+e*40)-2,4,4);}}
    for(let i=S.notes.length-1;i>=0;i--){const n=S.notes[i];if(n.j&&n.j!=="miss")continue;const nx=hx+(n.t-t)*sp;if(nx<-30||nx>W+30)continue;
      const L=n.k==="L",r=L?18:14;x.globalAlpha=n.j==="miss"?.35:1;x.fillStyle="#000";x.beginPath();x.arc(nx,ly,r+3,0,7);x.fill();x.fillStyle=L?"#e2443c":"#3c8be2";x.beginPath();x.arc(nx,ly,r,0,7);x.fill();
      x.fillStyle="rgba(255,255,255,.35)";x.beginPath();x.arc(nx-r*.3,ly-r*.35,r*.35,0,7);x.fill();x.fillStyle="#fff";x.font=`bold ${L?13:11}px sans-serif`;x.textAlign="center";x.fillText(L?MG_MODES[S.mode].L:MG_MODES[S.mode].R,nx,ly+4);x.globalAlpha=1;}
    // count-in
    if(t<4*bt){const n=4-Math.floor(Math.max(0,t)/bt);x.font='bold 40px "Pixelify Sans",sans-serif';x.textAlign="center";x.fillStyle="#fff";x.strokeStyle="#000";x.lineWidth=5;const s=t<0?"พร้อม":String(n);x.strokeText(s,W/2,120);x.fillText(s,W/2,120);}
    x.restore();
    // progress
    x.fillStyle="#2c2448";x.fillRect(0,H-4,W,4);x.fillStyle="#ffd34a";x.fillRect(0,H-4,W*Math.min(1,Math.max(0,t/S.end)),4);},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);this.stopMusic();S.phase="result";const n=S.notes.length,c=S.c;
    const acc=(c.perfect+c.great*.75+c.ok*.4)/Math.max(1,n);const grade=acc>=.92&&c.miss===0?"S":acc>=.78?"A":acc>=.6?"B":"C";
    if(S.duel&&typeof DUEL!=="undefined"){S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:false,rw:""};DUEL.done({score:acc,win:null},S);return;}
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number"){G.mini.best={bag:G.mini.best};}const B=G.mini.best[S.mode]=G.mini.best[S.mode]||{};const isBest=S.score>(B[S.dk]||0);if(isBest)B[S.dk]=S.score;
    let sb=null,songBestNew=false;if(S.songObj){const key=S.mode+":"+S.songObj.id;G.mini.song=G.mini.song||{};const o=G.mini.song[key]||{s:0,g:null,a:0,fc:false,n:0};sb={...o};o.n=(o.n||0)+1;if(S.score>o.s){o.s=S.score;o.g=grade;o.a=Math.round(acc*1000)/1000;songBestNew=true;}if(c.miss===0)o.fc=true;G.mini.song[key]=o;}
    S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:isBest,rw:"",song:S.songObj,prev:sb,songBest:songBestNew,rival:S.mode==="somtam"?S.notes.length*72:null};
    if(!S.practice)S.res.rw=this.reward(grade,acc);save();this.draw();AU.sfx&&AU.sfx(grade==="S"||grade==="A"?"level":"ui");},
  /* v1.86: a card's Lv.3 minigame — rewards on the first clear only, then free practice */
  openCard(m,cid){const o=(G.cards||{})[cid];if(!o)return;this.openMode(m,null,null);if(this.st){this.st.card=cid;this.st.practice=!!o.mgDone;this.draw();}},
  rewardCard(grade){const S=this.st,o=(G.cards||{})[S.card],C=CARDS[S.card];if(!o)return "";o.mgDone=1;o.mgGrade=grade;const du={S:8,A:6,B:4,C:2}[grade]||2;G.dust=(G.dust||0)+du;return `<b class="goldt">✦ +${du}</b> · ${esc(C?C.t:"")}`;},
  reward(grade,acc){const S=this.st;if(S.card)return this.rewardCard(grade);if(S.mail){const ml=(G.mail||[]).find(x=>x.id===S.mail);if(ml){ml.done=true;ml.grade=grade;}}else{G.campUsed=S.act||MG_ACT[S.mode];G.campNote=`${CAMP_ACTIONS[G.campUsed].name} · เกรด ${grade}`;}return S.mode==="somtam"?this.rewardTam(grade,acc):this.rewardBag(grade,acc);},
  rewardTam(grade,acc){const S=this.st,f=G.F[S.id],D=BAG_DIFF[S.dk],out=[];
    const pay=Math.round({S:1200,A:850,B:550,C:250}[grade]*D.mul/50)*50;G.cash+=pay;out.push(`<b class="goldt">฿${pay.toLocaleString()}</b>`);
    if(grade==="S"||grade==="A"){G.rep=Math.round(((G.rep||0)+(grade==="S"?.3:.15))*100)/100;out.push(`ชื่อเสียง +${grade==="S"?.3:.15}`);}
    f.fatigue=Math.min(100,(f.fatigue||0)+2);f.morale=Math.min(100,(f.morale||0)+3);out.push("กำลังใจ +3");
    const du=Math.max(1,Math.round({S:3,A:2,B:1,C:1}[grade]*D.mul));G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    out.push(esc(TAM_LINE[grade]));
    if(grade==="S"){G.flags.tamS=(G.flags.tamS||0)+1;}
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 การ์ดใหม่ ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;},
  rewardBag(grade,acc){const S=this.st,f=G.F[S.id],D=BAG_DIFF[S.dk],out=[];
    const g=Math.round(acc*.3*D.mul*100)/100;const up=k=>{const cap=Math.min(stCap(f),(f.potential||14)+1.5);const before=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g/2)*100)/100);return f.a[k]>before;};
    if(g>0){const a=up("kick"),b=up("punch");if(a||b)out.push(`เตะ/หมัด +${(g/2).toFixed(2)}`);else out.push("ค่าเตะ/หมัดเต็มศักยภาพแล้ว");}
    const mo={S:8,A:5,B:3,C:1}[grade];f.morale=Math.min(100,(f.morale||0)+mo);out.push(`กำลังใจ +${mo}`);
    f.fatigue=Math.min(100,(f.fatigue||0)+4);out.push("ล้า +4");
    const du=Math.max(1,Math.round({S:6,A:4,B:2,C:1}[grade]*D.mul));G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(grade==="S"||grade==="A"){add(G,f.id,"bond",2);out.push(`${esc(f.name)}สนิทขึ้น`);}
    if(grade==="S"){G.flags.bagS=(G.flags.bagS||0)+1;if(S.dk==="hard")G.flags.bagSH=(G.flags.bagSH||0)+1;}
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 การ์ดใหม่ ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;},
  claim(){this.close();}};
Object.assign(ACT,{minibag:()=>BAG.open()});
const TAM_LINE={S:"ป้าแต๋ว: \"มือหนักแต่แม่น! มาช่วยป้าทุกอาทิตย์เลยนะลูก\"",A:"ป้าแต๋ว: \"ใช้ได้ ๆ ลูกค้าชมว่าเส้นไม่เละ\"",B:"ป้าแต๋ว: \"ครกยังอยู่ครบ ถือว่าผ่าน\"",C:"ป้าแต๋ว: \"มะละกอกระเด็นไปครึ่งครก …ไม่เป็นไร ค่อย ๆ ฝึก\""};
Object.assign(CARDS,{
 m_bag:{c:"kati",r:"R",t:"จังหวะเดียวกับปู่",hint:"ได้เกรด S ในมินิเกมเตะกระสอบตามกลองแขก",bg:"camp",need:G=>(G.flags.bagS||0)>=1,steps:[
  {n:"nar",t:"เสียงกลองแขกจากลำโพงเก่าดังไปทั้งค่าย กะทิเตะกระสอบตามจังหวะได้ครบทุกโน้ตไม่พลาดสักครั้ง"},
  {n:"coach",t:"เพลงนี้ปู่ชัยเปิดให้ซ้อมทุกเช้า สมัยครูยังหนุ่ม ครูเตะตามไม่เคยทันสักรอบ"},
  {n:"kati",f:"happy",l:"fight",t:"หนูได้ยินเพลงนี้ตั้งแต่ยังเดินไม่คล่องเลยค่ะ ตุ๊บ ติ๊ง ตุ๊บ ตุ๊บ ติ๊ง …ตัวมันจำได้เอง"},
  {n:"kati",f:"flustered",l:"fight",t:"ผู้จัดการเห็นไหมคะ ครบทุกจังหวะ! …ถ้าปู่อยู่ ปู่คงตีกลองให้เองแล้ว"}]},
 m_tam:{c:"mali",r:"R",t:"ส้มตำครกที่ร้อย",hint:"ได้เกรด S ในมินิเกมตำส้มตำร้านป้าแต๋ว",bg:"market",need:G=>(G.flags.tamS||0)>=1,steps:[
  {n:"nar",t:"เย็นวันศุกร์ ร้านป้าแต๋วคิวยาวถึงหน้าวัด ครกวันนี้ตำไปเกือบร้อยครกแล้ว"},
  {n:"mali",f:"happy",l:"casual",t:"ตำแบบนี้เหมือนแม่เลยค่ะ ตำสามที คลุกหนึ่ง ตำสามที คลุกหนึ่ง …หนูโตมากับเสียงนี้"},
  {n:"nar",t:"ป้าแต๋วยื่นจานพิเศษมาให้ ปูม้าเต็มจาน ไม่มีในเมนู"},
  {n:"mali",f:"flustered",l:"casual",t:"ผู้จัดการกินก่อนเลยค่ะ ครกนี้หนูตำเอง …เผ็ดไหมคะ? หนูใส่พริกแค่เจ็ดเม็ดเองนะ~"}]},
 m_baghard:{c:"rin",r:"SR",t:"สถิติที่ไม่มีช่องว่าง",hint:"ได้เกรด S ในระดับยาก",bg:"camp",need:G=>(G.flags.bagSH||0)>=1,steps:[
  {n:"nar",t:"รินยืนถือคลิปบอร์ดอยู่ข้างกระสอบตลอดรอบ ปากกาสามสีไม่ได้ขยับเลยสักครั้ง"},
  {n:"rin",f:"surprised",l:"casual",t:"…จังหวะร้อยยี่สิบสี่ ทุกโน้ต ไม่มีช่องให้ฉันจดข้อผิดพลาดเลย"},
  {n:"rin",f:"pout",l:"casual",t:"ปกติฉันชอบตารางที่เต็ม แต่วันนี้ตารางว่างทั้งแผ่น แล้วฉันกลับชอบมากกว่า"},
  {n:"rin",f:"flustered",l:"casual",t:"ไม่ต้องยิ้มแบบนั้นค่ะผู้จัดการ …ฉันจะแปะหน้านี้ไว้บนผนังห้อง ไม่ได้แปลว่าภูมิใจนะ แค่… ภูมิใจนิดหน่อย"}]}});

// ===== v1.67: MINIGAME — camp merch live stream (answer comments in time) =====
const LIVE_ITEMS=[
 {k:"shirt",name:"เสื้อค่ายศิริชัย",price:290,margin:120,open:G=>true},
 {k:"wrap",name:"ผ้าพันมือลายค่าย",price:150,margin:60,open:G=>true},
 {k:"oil",name:"น้ำมันมวยสูตรปู่ชัย",price:120,margin:55,open:G=>G.week>=12||(G.season||1)>=2},
 {k:"key",name:"พวงกุญแจสัตว์เลี้ยงค่าย",price:89,margin:40,open:G=>(G.pets||[]).length>0},
 {k:"shorts",name:"กางเกงมวยลายค่าย",price:450,margin:180,open:G=>(typeof campLevel==="function"&&campLevel(G)>=3)||(G.season||1)>=2}];
const LIVE_HOST={kati:"ลูกค้าประจำใจดีกับกะทิ · ตอบถูกได้คนดูเพิ่ม",mali:"พูดหวาน ปิดการขายเก่ง · ยอดขาย +20%",rin:"ตอบคำถามไว · เวลาตอบ +1.5 วินาที",fah:"ดาวติ๊กต็อก · คนดูเยอะขึ้น 40%",ploy:"นิ่งใส่ดราม่า · คอมเมนต์ป่วนไม่ทำให้คนดูลด"};
const LIVE_NAMES=["น้องแพรว","ลุงเขียว","แฟนคลับกะทิ#1","ป้าแต๋ว","นักเรียนค่าย","สาวออฟฟิศ","บัญชีปลอม123","ลุงหมวกทอง","แม่ค้าตลาด","เด็กช่างกล"];
/* each comment: kind, text, answers [label, score] — score 1 = right, 0 = meh, -1 = wrong. "sale" adds orders when answered well */
const LIVE_POOL=[
 {k:"price",t:"ITEM ราคาเท่าไหร่คะ",a:[["บอกราคาชัด ๆ พร้อมส่งฟรี",1],["ทักแชทนะคะ",0],["แพงแต่คุ้มค่ะ",-1]],sale:1},
 {k:"size",t:"มีไซซ์ไหนบ้าง ตัวใหญ่ใส่ได้ไหม",a:[["มี S–XXL วัดตัวให้ดูเลย",1],["ไซซ์เดียวใส่ได้ทุกคน",-1],["ไม่แน่ใจค่ะ",0]],sale:1},
 {k:"ship",t:"ส่งต่างจังหวัดไหมคะ อยู่ภูเก็ต",a:[["ส่งทั่วไทย 2–3 วันถึง",1],["มารับเองที่ค่ายนะคะ",-1],["เดี๋ยวถามครูก่อน",0]],sale:1},
 {k:"order",t:"CF 2 ชิ้นค่ะ!!",a:[["ขอบคุณค่ะ ทักแชทยืนยันนะ",1],["เดี๋ยวก่อนนะคะ",0],["ลืมจดไปแล้ว",-1]],sale:2},
 {k:"order",t:"เอาสามชิ้น ส่งให้หลานด้วย",a:[["รับออเดอร์ แถมสติกเกอร์ให้",1],["สามชิ้นเยอะไปไหมคะ",-1],["ได้ค่ะ… มั้ง",0]],sale:3},
 {k:"bargain",t:"ลดได้ไหม ซื้อสองชิ้น",a:[["แถมพวงกุญแจแทนนะคะ",1],["ลดครึ่งราคาเลย!",-1],["ไม่ลดค่ะ",0]],sale:2},
 {k:"hype",t:"ใส่แล้วเตะแรงขึ้นไหม 555",a:[["เตะกระสอบโชว์ให้ดูเลย!",1],["ไม่หรอกค่ะ",0],["ขึ้นอยู่กับดวง",-1]]},
 {k:"hype",t:"ขอดูท่าไหว้ครูหน่อย!",a:[["รำไหว้ครูให้ดูสั้น ๆ",1],["ไว้วันหลังนะ",0],["เขินค่ะ ไม่เอา",-1]]},
 {k:"fan",t:"รักHOSTค่ะ!! มาจากไฟต์งานวัด",a:[["ขอบคุณค่ะ ส่งหัวใจให้เลย",1],["(เมินไปขายต่อ)",-1],["เขิน… ไม่ตอบ",0]]},
 {k:"fan",t:"ไฟต์ที่แล้วสุดยอดมาก!",a:[["เล่าไฟต์ให้ฟังพร้อมชวนซื้อ",1],["ฟลุกค่ะ",0],["ใครคะ",-1]]},
 {k:"troll",t:"ค่ายเล็ก ๆ จะขายอะไรได้",a:[["ขอบคุณที่แวะมาดูนะคะ 🙏",1],["เถียงกลับยาว ๆ",-1],["ปิดไลฟ์หนี",-1]],troll:1},
 {k:"troll",t:"เสื้อสีนี้ใครจะใส่ 555",a:[["ใส่เดินโชว์ให้ดูเลยค่ะ",1],["นอยด์ เงียบไปนาน",-1],["ก็คุณไงคะ",0]],troll:1},
 {k:"drama",t:"ได้ข่าวว่าโดนค่ายใหญ่ดึงตัว??",a:[["หัวเราะ: ไม่ไปไหน ที่นี่บ้าน",1],["เงียบใส่",0],["ด่าค่ายนั้นกลับ",-1]],troll:1},
 {k:"drama",t:"ทำไมเมื่อวานแพ้คะ ผิดหวัง",a:[["ขอบคุณที่เชียร์ จะกลับมาใหม่",1],["กรรมการโกงค่ะ",-1],["ไม่อยากพูด",0]],troll:1},
 {k:"pet",t:"ขอดูน้องหมาค่ายหน่อย!",a:[["อุ้มมาโชว์หน้ากล้อง",1],["ไม่ได้ค่ะ",-1],["เดี๋ยวนะ",0]],need:G=>(G.pets||[]).some(p=>p.k==="dog")},
 {k:"pet",t:"แมวส้มอยู่ไหน!!",a:[["ไปตามมาโชว์",1],["มันหลับอยู่ค่ะ",0],["แมวอะไร",-1]],need:G=>(G.pets||[]).some(p=>p.k==="cat")},
 {k:"coach",t:"ครูแดงออกมาโชว์หน่อย",a:[["ลากครูมาโบกมือ",1],["ครูไม่ว่างค่ะ",0],["ครูขี้เขิน",0]]},
 {k:"q",t:"ITEM ซักเครื่องได้ไหม",a:[["ได้ค่ะ น้ำเย็น กลับด้าน",1],["ไม่รู้เหมือนกัน",-1],["ซักมือดีกว่า",0]],sale:1}];
const LIVE={st:null,
  played(G){return mgPlayed(G,"live");},
  items(G){return LIVE_ITEMS.filter(i=>i.open(G));},
  pick(){const S=BAG.st;const F=bagFighters(G).filter(f=>f.canon);const host=(G.mini&&G.mini.liveHost&&F.find(f=>f.id===G.mini.liveHost))||F[0];
    this.st={phase:"pick",host:host?host.id:"kati",item:(G.mini&&G.mini.liveItem)||"shirt",practice:this.played(G)};if(!this.items(G).some(i=>i.k===this.st.item))this.st.item="shirt";S.phase="live";this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="host"){S.host=v;this.draw();}else if(a==="item"){S.item=v;this.draw();}else if(a==="go")this.start();
    else if(a==="ans")this.answer(+v);else if(a==="again"){S.phase="pick";S.practice=true;this.draw();}
    else if(a==="hub"){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.st=null;BAG.st.phase="hub";BAG.draw();}},
  el(){return document.getElementById("minibag");},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const F=bagFighters(G).filter(f=>f.canon);
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{}).live||0;
      el.innerHTML=`<div class="mbox px"><h2>📱 ไลฟ์ขายของค่าย</h2>
       <p class="meta">คอมเมนต์จะเด้งขึ้นทีละอัน เลือกคำตอบที่ดีที่สุดให้ทันเวลา (ปุ่ม 1/2/3 ก็ได้) · ตอบดีคนดูเพิ่ม ยอดขายขึ้น · ตอบพลาดคนดูหนี</p>
       <b class="meta">ใครไลฟ์</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.host?"on":""}" data-lv="host" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <p class="meta center">${esc(LIVE_HOST[S.host]||"")}</p>
       <b class="meta">ขายอะไร</b><div class="lvitems">${this.items(G).map(i=>`<button class="btn sm ${i.k===S.item?"primary":""}" data-lv="item" data-v="${i.k}">${i.name} ฿${i.price}</button>`).join("")}</div>
       <p class="meta center">${S.practice?"สัปดาห์นี้ไลฟ์ไปแล้ว · รอบนี้เป็นโหมดซ้อม ไม่มีรายได้":"ไลฟ์ได้สัปดาห์ละครั้ง · ได้กำไรจากยอดขาย · ชื่อเสียง · เศษดาว"}${best?` · ยอดขายสูงสุด ${best} ชิ้น`:""}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ไว้ก่อน</button><button class="btn primary" data-lv="go">เริ่มไลฟ์! ▸</button></div></div>`;return;}
    if(S.phase==="play"){const h=G.F[S.host];
      el.innerHTML=`<div class="mplay lv"><div class="lvphone"><img class="lvface" src="${faceSrc(S.host,"happy")}" alt="">
        <div class="lvtop"><span class="lvlive">● LIVE</span><span>👁 <b id="lvv">0</b></span><span>🛒 <b id="lvs">0</b></span><span id="lvt">45</span></div>
        <div class="lvname">${esc(h.name)} · ${esc(this.item().name)}</div><div class="lvhearts" id="lvh"></div>
        <div class="lvfeed" id="lvfeed"></div></div>
        <div class="lvq" id="lvq"></div></div>`;this.showQ();return;}
    if(S.phase==="result"){const R=S.res;
      el.innerHTML=`<div class="mbox px"><h2>จบไลฟ์</h2><div class="mgrade g${R.grade}">${R.grade}</div>
       <p class="center">ขายได้ <b>${S.sold}</b> ชิ้น · คนดูสูงสุด ${S.peak} คน · ตอบดี ${S.good}/${S.asked}${R.best?" · <b class=\"goldt\">สถิติใหม่!</b>":""}</p>
       ${S.practice?`<p class="center meta">โหมดซ้อม · ไม่มีรายได้</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-lv="again">ไลฟ์อีกรอบ (ซ้อม)</button><button class="btn primary" data-mb="close">กลับค่าย</button></div></div>`;}},
  item(){return LIVE_ITEMS.find(i=>i.k===this.st.item)||LIVE_ITEMS[0];},
  start(){const S=this.st;AU.resume&&AU.resume();G.mini=G.mini||{};G.mini.liveHost=S.host;G.mini.liveItem=S.item;
    const pool=LIVE_POOL.filter(c=>!c.need||c.need(G));const R=(i)=>srand(G,3100+i*17+(G.mini.liveN||0)*7);
    S.deck=[];for(let i=0;i<40;i++){const c=pool[Math.floor(R(i)*pool.length)];const ord=[0,1,2].sort((a,b)=>R(i*3+a+50)-R(i*3+b+50));S.deck.push({c,ord,who:LIVE_NAMES[Math.floor(R(i+200)*LIVE_NAMES.length)]});}
    S.i=0;S.view=Math.round(25+(G.rep||5)*3)*(S.host==="fah"?1.4:1);S.peak=S.view;S.sold=0;S.good=0;S.asked=0;S.feed=[];S.cur=null;S.phase="play";S.t0=performance.now();S.dur=S.duel?30000:45000;
    this.draw();const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.tick();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  qTime(){return (this.st.host==="rin"?6000:4500);},
  showQ(){const S=this.st;const q=document.getElementById("lvq");if(!q)return;if(!S.cur){q.innerHTML=`<p class="meta center">รอคอมเมนต์ถัดไป…</p>`;return;}
    const d=S.cur,c=d.c,txt=c.t.replace("ITEM",this.item().name).replace("HOST",G.F[S.host].name);
    q.innerHTML=`<div class="lvc"><b>${esc(d.who)}</b><span>${esc(txt)}</span><div class="lvbar"><i id="lvbar"></i></div></div>
      <div class="lvans">${d.ord.map((ai,j)=>`<button class="btn" data-lv="ans" data-v="${ai}"><small>${j+1}</small> ${esc(c.a[ai][0])}</button>`).join("")}</div>`;},
  pushFeed(t,cls){const S=this.st;S.feed.push({t,cls});if(S.feed.length>5)S.feed.shift();const f=document.getElementById("lvfeed");if(f)f.innerHTML=S.feed.map(x=>`<div class="${x.cls||""}">${x.t}</div>`).join("");},
  heart(){const h=document.getElementById("lvh");if(!h)return;const s=document.createElement("i");s.textContent=["❤","💖","🔥","👏"][Math.floor(Math.random()*4)];s.style.left=(60+Math.random()*30)+"%";h.appendChild(s);setTimeout(()=>s.remove(),1200);},
  answer(ai){const S=this.st;if(!S||S.phase!=="play"||!S.cur)return;const d=S.cur,c=d.c,sc=c.a[ai][1];S.asked++;
    const txt=c.a[ai][0];this.pushFeed(`<b>${esc(G.F[S.host].name)}:</b> ${esc(txt)}`,"me");
    if(sc>0){S.good++;const gain=Math.round((8+Math.random()*7)*(S.host==="kati"?1.3:1)*(S.host==="fah"?1.2:1));S.view+=gain;
      if(c.sale){const n=Math.max(1,Math.round(c.sale*(S.host==="mali"?1.2:1)+S.view/120));S.sold+=n;this.pushFeed(`🛒 +${n} ชิ้น`,"sale");}
      for(let i=0;i<3;i++)setTimeout(()=>this.heart(),i*120);AU.sfx&&AU.sfx("ui");}
    else if(sc<0){if(!(c.troll&&S.host==="ploy"))S.view=Math.max(5,Math.round(S.view*.85));this.pushFeed("💨 คนดูออกไปบางส่วน","bad");}
    else{S.view=Math.max(5,Math.round(S.view*.97));}
    S.cur=null;S.next=performance.now()+700;this.showQ();},
  tick(){const S=this.st,now=performance.now(),el=now-S.t0;
    if(el>=S.dur&&!S.cur){this.finish();return;}
    if(!S.cur&&(!S.next||now>=S.next)&&el<S.dur-1500){const d=S.deck[S.i++%S.deck.length];S.cur=d;S.qT=now;this.pushFeed(`<b>${esc(d.who)}:</b> ${esc(d.c.t.replace("ITEM",this.item().name).replace("HOST",G.F[S.host].name))}`);this.showQ();}
    if(S.cur){const left=1-(now-S.qT)/this.qTime();const b=document.getElementById("lvbar");if(b)b.style.width=Math.max(0,left*100)+"%";
      if(left<=0){S.asked++;S.view=Math.max(5,Math.round(S.view*.93));this.pushFeed("⌛ ตอบไม่ทัน","bad");S.cur=null;S.next=now+500;this.showQ();}}
    /* passive trickle of orders from a big audience */
    if(!S.pt||now-S.pt>3000){S.pt=now;if(Math.random()<Math.min(.8,S.view/150)){S.sold++;this.pushFeed("🛒 +1 ชิ้น","sale");}}
    S.peak=Math.max(S.peak,S.view);
    const v=document.getElementById("lvv"),s=document.getElementById("lvs"),t=document.getElementById("lvt");if(v)v.textContent=Math.round(S.view);if(s)s.textContent=S.sold;if(t)t.textContent=Math.max(0,Math.ceil((S.dur-el)/1000));},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);S.phase="result";const acc=S.good/Math.max(1,S.asked);
    if(S.duel&&typeof DUEL!=="undefined"){S.res={grade:"",best:false,rw:""};DUEL.done({score:S.sold+acc,win:null},S);return;}
    const grade=S.sold>=30&&acc>=.85?"S":S.sold>=20&&acc>=.7?"A":S.sold>=10?"B":"C";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number")G.mini.best={bag:G.mini.best};G.mini.liveN=(G.mini.liveN||0)+1;
    const isBest=S.sold>(G.mini.best.live||0);if(isBest)G.mini.best.live=S.sold;
    S.res={grade,best:isBest,rw:""};if(!S.practice)S.res.rw=this.reward(grade);save();this.draw();AU.sfx&&AU.sfx(grade==="S"||grade==="A"?"level":"ui");},
  reward(grade){const S=this.st,it=this.item(),f=G.F[S.host],out=[];G.campUsed=S.act||"live";G.campNote=`${CAMP_ACTIONS.live.name} · เกรด ${grade}`;
    const pay=Math.round(S.sold*it.margin*.7/10)*10;G.cash+=pay;out.push(`กำไร <b class="goldt">฿${pay.toLocaleString()}</b>`);
    const rp={S:.4,A:.25,B:.1,C:0}[grade];if(rp){G.rep=Math.round(((G.rep||0)+rp)*100)/100;out.push(`ชื่อเสียง +${rp}`);}
    const du={S:5,A:3,B:2,C:1}[grade];G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(grade==="S"||grade==="A"){add(G,f.id,"bond",2);out.push(`${esc(f.name)}สนิทขึ้น`);}
    f.morale=Math.min(100,(f.morale||0)+3);out.push("กำลังใจ +3");
    G.flags.liveN=(G.flags.liveN||0)+1;if(grade==="S")G.flags.liveS=(G.flags.liveS||0)+1;
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 การ์ดใหม่ ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;}};
MG_MODES.live={icon:"📱",title:"ไลฟ์ขายของค่าย",note:"ตอบคอมเมนต์ให้ทัน · ได้กำไรจากยอดขาย ชื่อเสียง",open:G=>G.week>=8||(G.season||1)>=2,custom:true};

// ===== v1.89.13: MINIGAME — 1:1 sprint, 100 m (also the regional champions' duel and, later, the district sports day) =====
/* Drag the runner into the blocks, wait for the gun, then alternate left/right as fast as you can.
   Same side twice = a stumble · tapping before the gun = a false start (the second one loses the race). */
/* v1.91.195 (Man: line the races up — a time trial on your own, a one-on-one, 400 m with four, and the sports day with lanes and a 4×100 relay where the baton is handed over by tapping in time;
   the rivals are the people of the district, and how fast anyone runs comes from their stats).
   One engine runs them all. Every runner has a top speed (from SPEED, a little less when tired) and a tank (from STAMINA):
   running near the top drains the tank, cruising refills it a little, an empty tank caps you at 78 % of top speed.
   The player's thumb sets the effort — about eight taps a second reaches top speed, faster does nothing, slower runs slower —
   so the stats decide what is possible and the thumb decides how much of it you get. Over 100 m only a weak tank fades;
   over 400 m flooring it from the gun empties the tank by the last bend, and holding the green "cruise" band until 120 m out wins. */
const RUN_LEN=100,RUN_STRIDE=1.1;
const hz2=m=>440*Math.pow(2,(m-69)/12);
const runVmax=f=>{if(!f||!f.a)return 8.6;const sp=f.a.speed||10,fa=f.fatigue||0;return (7.3+.105*sp)*(1-Math.min(.08,fa/1000));};
const runCap=f=>f&&f.a?16+.9*(f.a.stamina||10):25;
const runMult=f=>f?runVmax(f)/8.35:1; /* kept for old callers */
const RUN_LINE={S:"ครูแดงกดนาฬิกาจับเวลาแล้วเงียบไปสองวินาที \"…ลมส่งหรือเปล่าวะเนี่ย\"",A:"ครูแดงพยักหน้า \"ขาดีวันนี้ ไปเตะกระสอบต่อได้แล้ว\"",B:"\"วิ่งได้ แต่ช่วงกลางอย่าแผ่วสิ\" ครูแดงหัวเราะ",C:"\"ขาไม่หยุดนะเว้ย! กดให้สุดจนถึงเส้น!\" ครูแดงตะโกนจากข้างลู่"};
const RUN_MODES={solo:{n:"จับเวลา 100 ม.",d:"วิ่งคนเดียวแข่งกับเงาสถิติดีสุดของตัวเอง",dist:100},
  duel:{n:"ดวล 1 ต่อ 1",d:"วิ่ง 100 เมตรตัวต่อตัว · ท้าเพื่อนในค่าย หรือไต่บันไดท้าคนในอำเภอ 5 คน",dist:100},
  m400:{n:"400 ม. 4 คน",d:"วิ่งรอบสนาม ต้องคุมแรง · ประคองในแถบเขียว แล้วค่อยเร่งช่วง 120 เมตรสุดท้าย",dist:400}};
const RACE_TEAMS={me:{c:"#e2443c",n:"สีแดง",hue:0},tiger:{c:"#e8b62c",n:"สีเหลือง",hue:46},teach:{c:"#3a8ee0",n:"สีฟ้า",hue:214},obt:{c:"#3aa65a",n:"สีเขียว",hue:128}};
/* people of the district who turn up to run: the morning running club, the school, the sub-district office */
const RUN_LOCALS=[["loc_ton","พี่ต้น ชมรมวิ่งเช้า",13,15],["loc_praew","น้องแพรว",11,10],["loc_wang","ลุงหวังวินมอไซค์",9,13],["loc_fai","น้องฝ้าย นักกีฬาโรงเรียน",14,11]];
/* v1.91.198 each colour keeps its anchor every year (they get quicker), the rest of the team changes year to year */
const SP_SQUADS={teach:[["sp_t1","ครูนุ้ย ครูพละ"],["sp_t2","ครูสมชาย"],["sp_t3","ครูแอน"],["sp_t4","ผอ.ประยูร"],["sp_t5","ครูเบียร์ ครูบรรจุใหม่"],["sp_t6","ครูจุ๋ม ภาษาไทย"],["sp_t7","ครูโอ๊ต คอมพิวเตอร์"],["sp_t8","ลุงเชิด ภารโรง"]],
  obt:[["sp_o1","ปลัดต้น"],["sp_o2","จ่าเอกสมบัติ"],["sp_o3","น้องเฟิร์น อบต."],["sp_o4","ผู้ใหญ่บ้านเฉลิม"],["sp_o5","นายก อบต.สมศักดิ์"],["sp_o6","พี่เอ็ม กู้ภัย"],["sp_o7","ป้าบุญมี อสม."],["sp_o8","ลุงจ้อย รถขยะ"]]};
/* v1.91.198 (Man: more people to race) — the district ladder: five runners from the slow to the fast, each with a way of running and something to say.
   fast = flies off the line and fades after 60 m · steady = the same all the way · kick = starts slow and finishes like a train */
const RUN_LADDER=[
 {id:"loc_wang",n:"ลุงหวังวินมอไซค์",sp:8,st:8,style:"fast",react:.1,hue:30,tag:"ออกตัวไว ปลายแผ่ว",pre:"ลุงขี่วินทั้งวัน แต่ขายังไวอยู่นะหนู ระวังตอนออกตัวล่ะ",win:"ฮ่า ๆ ออกตัวสำคัญที่สุด! จำไว้นะหนู",lose:"เหนื่อยแล้ว… ลุงขอไปนั่งพักที่วินก่อนนะ"},
 {id:"loc_praew",n:"น้องแพรว",sp:11,st:10,style:"steady",hue:280,tag:"วิ่งสม่ำเสมอ",pre:"พี่ ๆ ห้ามออมมือนะคะ แพรวซ้อมกับครูนุ้ยมาทั้งเทอม",win:"แพรวชนะพี่นักมวยได้! พรุ่งนี้จะไปอวดเพื่อนทั้งห้อง",lose:"ปีหน้าแพรวจะสูงกว่านี้ค่ะ! แล้วจะกลับมาท้าใหม่"},
 {id:"loc_ton",n:"พี่ต้น ชมรมวิ่งเช้า",sp:13,st:15,style:"steady",hue:190,tag:"อึด ไม่มีแผ่ว",pre:"ชมรมเราวิ่งรอบคูเมืองทุกเช้าตีห้าครึ่ง ใครไม่ตื่นไม่ต้องมา",win:"จังหวะหายใจคือทุกอย่าง มาวิ่งกับชมรมสิ",lose:"โอเค ๆ ขาพวกนักมวยนี่ของจริง ยอมรับเลย"},
 {id:"loc_fai",n:"น้องฝ้าย นักกีฬาโรงเรียน",sp:15,st:13,style:"kick",react:.24,hue:330,tag:"ออกตัวช้า ปลายพุ่ง",pre:"ฝ้ายเป็นตัวแทนอำเภอวิ่ง 100 เมตรค่ะ ช่วงท้ายฝ้ายไม่เคยแพ้ใคร",win:"ทางตรงสุดท้ายเป็นของฝ้ายค่ะ",lose:"…ขอเบอร์ครูแดงได้ไหมคะ ฝ้ายอยากมาซ้อมที่ค่ายด้วย"},
 {id:"dare_suea",n:"เสือดำ พยัคฆ์ทอง",sp:16,st:13,style:"fast",react:.11,hue:46,tag:"ไวทั้งต้นทั้งปลาย",suea:true,pre:"ขึ้นบันไดมาถึงฉันได้ไม่ใช่เล่น แต่จบแค่นี้แหละ",win:"อย่างที่บอก ใครก็แพ้ฉันทั้งนั้น",lose:"…ไม่เลว เดี๋ยวฉันกลับมาใหม่"}];
function ladderNpc(i){const L=RUN_LADDER[i],y=(G.season||1)-1,R=roster(G).slice().sort((a,b)=>runVmax(b)-runVmax(a))[0];
  const sp=L.suea?Math.min(21,Math.max(L.sp+y*.5,R?(R.a.speed||10)+1:L.sp)):Math.min(19,L.sp+y*.5);return runNpc(L.id,L.n,sp,Math.min(20,L.st+y*.5),L.hue);}
function runNpc(key,name,sp,st,hue){return {id:key,name,a:{speed:sp,stamina:st},sprite:npcBase(key).base,tintHue:hue,fake:true,fatigue:0};}
function runLocal(i){const L=RUN_LOCALS[i%RUN_LOCALS.length];return runNpc(L[0],L[1],L[2],L[3],[30,280,190,330][i%4]);}
/* a runner on the track */
function runLane(f,o={}){return {f,name:(f&&f.name)||o.name||"",team:o.team||null,c:o.c||(o.team?RACE_TEAMS[o.team].c:"#ffffff"),me:!!o.me,ai:!o.me,ghost:o.ghost||null,
  vmax:o.vmax||runVmax(f),cap:o.cap||runCap(f),react:o.react??(.13+Math.random()*.13),eff:o.eff??(.94+Math.random()*.06),cruise:o.cruise??(.84+Math.random()*.05),
  style:o.style||null,legs:o.legs||null,leg:0,legX:0,x:0,v:0,sta:1,done:false,t:0,wait:0,passQ:null};}
/* what a runner would clock flat out (100 m) or well paced (400 m) — the "par" a grade is measured against */
function runPar(f,dist){const L=runLane(f,{react:.18,eff:1});const c=runCruise(L,dist);let t=0;const dt=.02;while(L.x<dist&&t<120){runStep(L,dist<=100?1:(L.x<dist-120?c:1),dt);t+=dt;}return t+.18;}
/* the fastest steady effort this runner's tank can hold until the last 120 m, keeping a quarter for the kick — the green band on the 400 m pace meter */
function runCruise(L,dist){const rem=Math.max(0,dist-120-L.x);if(rem<=0)return 1;let best=.78;for(let q=.78;q<=1.001;q+=.01){const cost=Math.pow(Math.max(0,q-.72)/.28,3)/L.cap*(rem/(q*L.vmax));if(cost<=L.sta-.25)best=q;}return best;}
function runStep(L,e,dt){let want=L.vmax*Math.pow(Math.max(0,Math.min(1,e)),.85);if(L.sta<=0)want=Math.min(want,L.vmax*.78);
  const q=want/L.vmax;if(q>.72)L.sta=Math.max(0,L.sta-Math.pow((q-.72)/.28,3)/L.cap*dt);else L.sta=Math.min(1,L.sta+(.72-q)*.06*dt);
  L.v+=(want-L.v)*Math.min(1,dt*(L.v<want?2.4:3));L.x+=L.v*dt;}
const RUN={st:null,
  el(){return document.getElementById("minibag");},
  played(G){return mgPlayed(G,"run");},
  /* opts.duel = {opp:{id,name,f,pace}, label, note, cb, next} — the regional duel; opts.race = a ready race (sports day, story challenge) */
  pick(opts){const F=bagFighters(G);const me=(G.mini&&G.mini.runLast&&F.find(f=>f.id===G.mini.runLast))||F[0];
    const lad=(G.mini&&G.mini.ladder)||0;const S={phase:"pick",dsub:"camp",rung:Math.min(lad,RUN_LADDER.length-1),md:(G.mini&&G.mini.runMd)||"solo",id:me?me.id:null,opp:null,practice:this.played(G),duel:null,race:null,act:null,...(opts||{})};
    if(S.duel||S.race)S.md="duel";if(F.length<2)S.dsub="town";
    if(!S.duel&&!S.race){const o=F.find(f=>f.id!==S.id);S.opp=o?o.id:null;}
    this.st=S;if(BAG.st)BAG.st.phase="run";this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="me"){S.id=v;if(S.opp===v)S.opp=(bagFighters(G).find(f=>f.id!==v)||{}).id||null;this.draw();}
    else if(a==="opp"){S.opp=v;this.draw();}
    else if(a==="dsub"){S.dsub=v;this.draw();}
    else if(a==="rung"){const i=+v;if(i<=((G.mini||{}).ladder||0)){S.rung=i;this.draw();}}
    else if(a==="md"){S.md=v;G.mini=G.mini||{};G.mini.runMd=v;this.draw();}
    else if(a==="go")this.set();
    else if(a==="pass")this.pass();
    else if(a==="again"){S.phase="pick";S.practice=true;this.draw();}
    else if(a==="next"&&(S.duel||S.race)){const nx=(S.duel||S.race).next;if(nx)nx();else if(typeof DUEL!=="undefined")DUEL.next();}
    else if(a==="hub"){this.stop();this.st=null;BAG.st.phase="hub";BAG.draw();}},
  stop(){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.musStop&&this.musStop(false);},
  runner(){return G.F[this.st.id]||(this.st.race&&this.st.race.me)||null;},
  /* the field for the camp modes */
  field(){const S=this.st,me=this.runner(),F=bagFighters(G).filter(f=>f.id!==S.id);
    if(S.race)return S.race.lanes(me);
    if(S.duel){const O=S.duel.opp,of=O.f||(O.id&&G.F[O.id])||runNpc(O.id||"duel_opp",O.name,14,14,200);
      return [runLane(of,{name:O.name,c:"#ffd34a",vmax:O.pace?O.pace*1.32:undefined,eff:.97}),runLane(me,{me:true,c:"#e2443c"})];}
    if(S.md==="solo"){const g=((G.mini||{}).runGhost||{})[S.id];const L=[runLane(me,{me:true,c:"#e2443c"})];if(g)L.unshift(runLane(me,{name:"เงาสถิติ",ghost:g,c:"#9fd8ff"}));return L;}
    if(S.md==="duel"&&S.dsub==="town"){const i=Math.min(S.rung||0,RUN_LADDER.length-1),L=RUN_LADDER[i];return [runLane(ladderNpc(i),{c:"#ffd34a",style:L.style,react:L.react??.17,eff:.99}),runLane(me,{me:true,c:"#e2443c"})];}
    if(S.md==="duel"){const o=G.F[S.opp]||runLocal(0);return [runLane(o,{c:"#ffd34a"}),runLane(me,{me:true,c:"#e2443c"})];}
    /* 400 m: camp mates first, then whoever from the morning club turns up */
    const O=F.slice().sort((a,b)=>runVmax(b)-runVmax(a)).slice(0,3);let i=0;while(O.length<3)O.push(runLocal(i++));
    return [...O.map((f,k)=>runLane(f,{c:["#ffd34a","#5ab0ff","#7be08a"][k]})),runLane(me,{me:true,c:"#e2443c"})];},
  dist(){const S=this.st;return S.race?S.race.dist:S.duel?100:RUN_MODES[S.md].dist;},
  /* stars for the pick screen: how this runner compares with ours over this distance */
  vsTag(f){const me=this.runner();if(!me||!f)return "";const d=this.dist(),a=runPar(me,d),b=runPar(f,d),r=b/a;
    return r<.985?`<em class="rk hard">เร็วกว่าเรา</em>`:r<1.015?`<em class="rk even">สูสี</em>`:`<em class="rk easy">ช้ากว่าเรา</em>`;},
  ladderHTML(){const S=this.st,got=(G.mini||{}).ladder||0;
    return `<b class="meta">บันไดท้าวิ่งในอำเภอ · ชนะแล้ว ${got}/${RUN_LADDER.length}</b><div class="rladder">${RUN_LADDER.map((L,i)=>{const open=i<=got,f=open?ladderNpc(i):null;
      return `<button class="rrung ${i===S.rung?"on":""} ${i<got?"beat":""}" data-rn="rung" data-v="${i}" ${open?"":"disabled"} style="--hc:hsl(${L.hue} 70% 55%)"><i>${i+1}</i><span><b>${open?esc(L.n):"???"}</b><small>${open?esc(L.tag):`ชนะ ${esc(RUN_LADDER[i-1].n)} ก่อน`}</small></span>${open?this.vsTag(f):""}${i<got?`<em class="rk beat">ชนะแล้ว</em>`:""}</button>`;}).join("")}</div>
      ${RUN_LADDER[S.rung]?`<div class="rsay"><b>${esc(RUN_LADDER[S.rung].n)}:</b> "${esc(RUN_LADDER[S.rung].pre)}"</div>`:""}`;},
  /* relay: whole squads against each other, leg by leg */
  vsTeam(L,M){if(!M||!M.legs)return "";const sum=X=>X.legs.reduce((t,g)=>t+runPar(g.f,100),0),r=sum(L)/sum(M);
    return r<.985?`<em class="rk hard">เร็วกว่าเรา</em>`:r<1.015?`<em class="rk even">สูสี</em>`:`<em class="rk easy">ช้ากว่าเรา</em>`;},
  statBar(f){const v=runVmax(f),c=runCap(f),sv=Math.max(1,Math.min(5,Math.round((v-7.6)/.38))),sc=Math.max(1,Math.min(5,Math.round((c-11)/2.2)));
    const pip=(n)=>[0,1,2,3,4].map(i=>`<b class="${i<n?"on":""}"></b>`).join("");return `<span class="rstat"><i>เร็ว</i>${pip(sv)}</span><span class="rstat"><i>อึด</i>${pip(sc)}</span>`;},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const F=bagFighters(G),me=this.runner();
    if(S.phase==="pick"){const B=(G.mini&&G.mini.best)||{},M=RUN_MODES[S.md],ext=S.duel||S.race;
      const card=(x,on,act)=>`<button class="mbf rcard ${on?"on":""}" data-rn="${act}" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small>${this.statBar(x)}${act==="opp"?this.vsTag(x):""}</button>`;
      const lanes=me?this.field():[];
      el.innerHTML=`<div class="mbox px rnpick"><h2>🏃 ${ext?esc((S.duel||S.race).label||"วิ่งแข่ง"):"ลู่วิ่งค่ายศิริชัย"}</h2>
       ${ext?"":`<div class="sgtabs">${Object.entries(RUN_MODES).map(([k,m])=>`<button class="${k===S.md?"on":""}" data-rn="md" data-v="${k}" >${m.n}</button>`).join("")}</div>
       <p class="meta">${M.d}${S.md==="solo"?` · สถิติ 100 ม. ${B.run?`<b class="goldt">${B.run.toFixed(2)} วิ</b>`:"ยังไม่มี"}`:S.md==="m400"?` · สถิติ 400 ม. ${B.run400?`<b class="goldt">${B.run400.toFixed(2)} วิ</b>`:"ยังไม่มี"}`:""}</p>`}
       ${ext&&(S.duel||S.race).note?`<p class="meta center">${esc((S.duel||S.race).note)}</p>`:""}
       ${S.race&&S.race.fixedMe?"":`<b class="meta">ใครวิ่ง</b><div class="mbpick">${F.map(x=>card(x,x.id===S.id,"me")).join("")}</div>`}
       ${!ext&&S.md==="duel"?`<div class="sgtabs sub"><button class="${S.dsub!=="town"?"on":""}" data-rn="dsub" data-v="camp" ${F.length<2?"disabled":""}>เพื่อนในค่าย</button><button class="${S.dsub==="town"?"on":""}" data-rn="dsub" data-v="town">คนในอำเภอ</button></div>`:""}
       ${!ext&&S.md==="duel"&&S.dsub!=="town"?`<b class="meta">ท้าใคร</b><div class="mbpick">${F.filter(x=>x.id!==S.id).map(x=>card(x,x.id===S.opp,"opp")).join("")}</div>`:""}
       ${!ext&&S.md==="duel"&&S.dsub==="town"?this.ladderHTML():""}
       ${me&&(ext||S.md!=="duel")&&!(S.md==="duel"&&S.dsub==="town")?`<div class="rfield">${lanes.filter(l=>!l.me).map(l=>`<span style="--tc:${l.c}"><b>${esc(l.ghost?"เงาสถิติ":l.legs?l.teamName:l.name)}</b>${l.ghost?`<small>${l.ghost.t.toFixed(2)} วิ</small>`:l.legs?this.vsTeam(l,lanes.find(q=>q.me)):this.vsTag(l.f)}</span>`).join("")||`<span><b>วิ่งคนเดียว</b><small>ยังไม่มีเงาสถิติ</small></span>`}</div>`:""}
       <p class="meta center">${ext?"":S.practice?"สัปดาห์นี้เล่นไปแล้ว · รอบนี้เป็นโหมดซ้อม ไม่มีรางวัล":"รางวัลสัปดาห์ละครั้ง: ความเร็ว/ความอึด · กำลังใจ · เศษดาว"}</p>
       <div class="mfoot roadbtns">${ext&&!(S.race&&S.race.canBack)?"":`<button class="btn" data-mb="close">ไว้ก่อน</button>`}<button class="btn primary" data-rn="go" ${me?"":"disabled"}>ไปที่เส้นเริ่ม ▸</button></div></div>`;return;}
    if(S.phase==="set"||S.phase==="race"){const L=this.meLane(),cur=L?this.legF(L):me;
      el.innerHTML=`<div class="mplay rn"><div class="mhud"><b>${esc((cur||me||{}).name||"")}</b><span id="rnmsg">${S.phase==="set"&&!S.armed?"กดเข้าเส้นเตรียม":""}</span><span><b id="rnt">0.00</b> วิ</span><button class="xbtn" data-mb="close" aria-label="ออก">✕</button></div>
       <canvas id="rncv" width="360" height="${S.lanes.length>2?300:236}"></canvas>
       <div class="rncom" id="rncom"><img src="a/npc_caster.webp" alt=""><span id="rncomt">${S.com||"นักพากย์ประจำสนามพร้อมแล้วครับ!"}</span></div>
       <div class="mbtns ${S.relay&&!(S.phase==="set"&&!S.armed)?"two":"one"}">${S.phase==="set"&&!S.armed?`<button class="mbtn ready" id="rnready"><img src="${faceSrc((cur||me).id,"happy")}" alt=""><b>เข้าเส้นเตรียม</b><small>แตะเมื่อพร้อม</small></button>`:S.relay?`<button class="mbtn L run" id="rnL"><b>วิ่ง!</b><small>กดรัว ๆ · Space</small></button><button class="mbtn pass" id="rnP"><b>ส่งไม้!</b><small>ตอนวงกลมหดพอดี · Enter</small></button>`:`<button class="mbtn L run" id="rnL"><b>วิ่ง!</b><small>กดรัว ๆ · Space</small></button>`}</div></div>`;
      const rb=document.getElementById("rnready");if(rb)rb.addEventListener("pointerdown",e=>{e.preventDefault();this.arm();});
      const bl=document.getElementById("rnL");if(bl)bl.addEventListener("pointerdown",e=>{e.preventDefault();this.tap("L");});
      const bp=document.getElementById("rnP");if(bp)bp.addEventListener("pointerdown",e=>{e.preventDefault();this.pass();});
      const cv=document.getElementById("rncv");if(cv&&S.relay)cv.addEventListener("pointerdown",e=>{e.preventDefault();this.pass();});
      this.paint();return;}
    if(S.phase==="result"){const R=S.res,ext=S.duel||S.race;
      el.innerHTML=`<div class="mbox px rnres"><h2>${R.dq?"ฟาวล์!":R.place===1?(S.lanes.length>1?"เข้าเส้นที่ 1!":"เข้าเส้นแล้ว!"):`เข้าเส้นอันดับ ${R.place}`}</h2>${R.grade?`<div class="mgrade g${R.grade}">${R.grade}</div>`:""}
       <div class="rtable">${R.order.map((l,i)=>`<div class="${l.me?"me":""}" style="--tc:${l.c}"><b>${i+1}</b><span>${esc(l.team?RACE_TEAMS[l.team].n+" · ":"")}${esc(l.ghost?"เงาสถิติ":l.legs?(l.teamName||l.name):l.name)}</span><em>${l.me&&R.dq?"ฟาวล์":l.t.toFixed(2)+" วิ"}</em></div>`).join("")}</div>
       ${R.best?`<p class="center"><b class="newrec">สถิติใหม่!</b>${R.prev?` เดิม ${R.prev.toFixed(2)} วิ`:""}</p>`:""}
       ${R.say?`<div class="rsay"><b>${esc(R.say.n)}:</b> "${esc(R.say.t)}"</div>`:""}
       ${R.ladUp?`<p class="center"><b class="newrec">${(G.mini.ladder||0)>=RUN_LADDER.length?"พิชิตบันไดท้าวิ่งครบทั้ง 5 คน!":`ปลดล็อกคู่ท้าคนต่อไป: ${esc(RUN_LADDER[G.mini.ladder].n)}`}</b> · ✦ +2</p>`:""}
       ${R.p4&&!R.dq?`<p class="center">คุมจังหวะในแถบเขียว <b class="goldt">${R.band.toFixed(1)} วิ</b>${R.empty!=null?` · แรงหมดที่ <b class="redt">${Math.round(R.empty)} ม.</b>`:""}</p>${!R.win&&R.empty!=null?`<p class="center meta">ลองกดให้เข็มอยู่ในแถบเขียวก่อน แล้วค่อยกดรัวสุดแรงตอนถึงป้าย "เร่ง! 120 ม."</p>`:""}`:R.chain?`<p class="center">กดรัวติดกันสูงสุด <b class="goldt">${R.chain} ครั้ง</b></p>`:""}
       <p class="center meta">ออกตัว ${R.react.toFixed(2)} วิ${R.passes?` · ส่งไม้ ${R.passes}`:""}${R.fs?` · ฟาวล์ ${R.fs} ครั้ง`:""}${R.par?` · เวลาเป้าของ${esc(me?me.name:"")} ${R.par.toFixed(2)} วิ`:""}</p>
       ${ext?(R.rw?`<p class="center">${R.rw}</p>`:""):S.practice?`<p class="center meta">โหมดซ้อม · ไม่มีรางวัล</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns">${ext?`<button class="btn primary" data-rn="next">ต่อไป ▸</button>`:`<button class="btn" data-rn="again">วิ่งอีกรอบ (ซ้อม)</button><button class="btn primary" data-mb="close">กลับค่าย</button>`}</div></div>`;}},
  /* v1.91.204 (Man: mashed the whole 400 m, ran out of legs and lost) — the pace read for the 400 m: ok = inside the green cruise band,
     hot = faster than the tank can hold, slow = under it, kick = the last 120 m where mashing is right. null for the sprints and the relay. */
  pace(S,L){if(!S||!L||L.done||S.relay||S.dist<400||S.phase!=="race")return null;if(L.x>=S.dist-120)return "kick";
    const cq=runCruise(L,S.dist),b0=Math.max(.72,cq-.05),q=L.v/Math.max(1,L.vmax);return q>cq+.025?"hot":q<b0-.03?"slow":"ok";},
  meLane(){const S=this.st;return S&&S.lanes&&S.lanes.find(l=>l.me);},
  legF(L){return L.legs?L.legs[Math.min(L.leg,L.legs.length-1)].f:L.f;},
  set(){const S=this.st,me=this.runner();if(!me)return;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}G.mini=G.mini||{};if(!S.race)G.mini.runLast=S.id;
    const lanes=this.field(),dist=this.dist();
    /* relay lanes: each leg's runner keeps its own top speed and tank */
    for(const L of lanes)if(L.legs){L.legs=L.legs.map(g=>({f:g.f,vmax:runVmax(g.f),cap:runCap(g.f)}));L.vmax=L.legs[0].vmax;L.cap=L.legs[0].cap;}
    Object.assign(S,{phase:"set",armed:false,gun:0,fs:S.fs||0,lanes,dist,relay:lanes.some(l=>l.legs),rate:0,lastT:0,stumble:0,done:false,t:0,react:0,com:"",cf:{},fadeT:0,
      chain:0,maxChain:0,lastTap:0,chainT:0,mile:null,shk:0,mbus:null,path:[],pathT:0,passes:[],passMsg:null});
    if(S.race&&S.race.intro)S.com=S.race.intro;else if(S.md==="duel"&&S.dsub==="town"&&!S.race&&!S.duel){const L=RUN_LADDER[S.rung];S.com=`${L.n}: "${L.pre}"`;}
    this.draw();this.loop();},
  /* v1.91.185 one tap to get on the blocks, three red lights, then green */
  arm(){const S=this.st;if(!S||S.phase!=="set"||S.armed)return;S.armed=true;S.lights=0;S.green=0;S.com="นักวิ่งเข้าเส้นเตรียมแล้วครับ!";AU.sfx&&AU.sfx("ui");this.draw();
    const m=document.getElementById("rnmsg");if(m)m.textContent="เข้าที่…";
    const on=i=>{if(!this.st||this.st.phase!=="set"||!S.armed)return;S.lights=i;S.lightT=performance.now();if(i===1)this.say("เข้าที่… ระวัง…");AU.tone&&AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:440,type:"square",dur:.12,peak:.14});
      if(i<3)this.to=setTimeout(()=>on(i+1),750);
      else this.to=setTimeout(()=>{if(!this.st||this.st.phase!=="set"||!S.armed)return;S.phase="race";S.gun=performance.now();S.green=S.gun;S.started=true;
        const m3=document.getElementById("rnmsg");if(m3)m3.textContent="ไป!";this.musStart();AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:880,type:"square",dur:.35,peak:.18});AU.sfx&&AU.sfx("bell");try{navigator.vibrate&&navigator.vibrate(40)}catch(_){} },500+Math.random()*900);};
    this.to=setTimeout(()=>on(1),600);},
  tap(k){const S=this.st;if(!S)return;const b=document.getElementById("rnL");if(b){b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");}
    if(S.phase==="set"){if(!S.armed){this.arm();return;}S.fs++;clearTimeout(this.to);AU.sfx&&AU.sfx("ui");
      if(S.fs>=2){this.finish(true);return;}
      S.armed=false;S.lights=0;S.com="ฟาวล์ครับ! ออกตัวก่อนไฟเขียว!";this.draw();const mm=document.getElementById("rnmsg");if(mm)mm.textContent="ฟาวล์! ออกตัวก่อนไฟเขียว · อีกครั้งเดียวนะ";return;}
    const L=this.meLane();if(S.phase!=="race"||!L||L.done)return;const now=performance.now();
    if(!S.react)S.react=(now-S.gun)/1000;
    const dt=S.lastT?(now-S.lastT)/1000:.25;S.lastT=now;S.rate=Math.min(12,S.rate*.6+(1/Math.max(.07,dt))*.4);
    if(S.lastTap&&now-S.lastTap>550)S.chain=0;S.lastTap=now;S.chain=(S.chain||0)+1;S.maxChain=Math.max(S.maxChain||0,S.chain);S.chainT=now;
    const pz0=this.pace(S,L);if(S.chain%25===0&&(!pz0||pz0==="kick")){S.mile={n:S.chain,t:now};S.shk=now;try{navigator.vibrate&&navigator.vibrate(25)}catch(_){}AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:1320,type:"square",dur:.12,peak:.1});}
    S.dust=(S.dust||[]).concat([{t:now}]).slice(-6);},
  /* relay: tap the track when the incoming runner is in the box — late in the box is a flying start, early drops the baton */
  pass(){const S=this.st;if(!S||S.phase!=="race"||!S.relay)return;const L=this.meLane();if(!L||L.done||L.leg>=L.legs.length-1||L.wait>0)return;
    const z=L.legX;if(z<78){this.passMsg("ยังไม่ถึงเขตส่งไม้!",false);return;}
    const q=z>=92?"perfect":z>=86?"good":"early";this.handover(L,q);},
  passMsg(t,good){const S=this.st;S.passMsg={t,good,at:performance.now()};this.say(t);},
  handover(L,q){const S=this.st,nx=L.legs[L.leg+1],carry=L.legX-100;L.leg++;L.legX=Math.max(0,carry);L.vmax=nx.vmax;L.cap=nx.cap;L.sta=1;
    L.v=L.v*({perfect:.92,good:.72,early:.4,late:.15,ai:.8}[q]);if(q==="early")L.wait=.45;if(q==="late")L.wait=.5;
    if(L.me){S.passes.push(q);this.passMsg({perfect:"ส่งไม้เนียนกริบ!",good:"ส่งไม้ได้!",early:"เร็วไป! ไม้เกือบหล่น",late:"ลืมส่งไม้! ต้องออกตัวใหม่"}[q],q==="perfect"||q==="good");
      AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:q==="perfect"?1760:q==="good"?1320:330,type:"square",dur:.14,peak:.12});if(q==="perfect"){S.shk=performance.now();try{navigator.vibrate&&navigator.vibrate(30)}catch(_){}}
      const h=document.querySelector(".mhud b");if(h)h.textContent=nx.f.name;}},
  /* v1.91.194 (Man: the sprint needs a pumping track and effects) — a 152 BPM race loop scheduled a little ahead each frame:
     kick on every beat, clap on 2 and 4, 8th hats, a driving bass and a Thai-pentatonic riff on a square lead.
     It thickens as you mash (fever adds 16th arps) and on the final 25 m, and stops dead when the race ends. */
  musStart(){const S=this.st;if(!AU.init||!AU.init()||AU.muted)return;try{const c=AU.ctx,bus=c.createGain();bus.gain.value=.75;bus.connect(AU.sfxBus);S.mbus=bus;S.mT0=c.currentTime+.02;S.mNext=0;S.mBeat=60/152;
      AU.noiseHit(S.mT0,{f:5000,type:"highpass",q:.7,dur:.9,peak:.35,bus});}catch(e){}},
  musPump(){const S=this.st;if(!S||!S.mbus||!AU.ctx)return;const c=AU.ctx,bus=S.mbus,B=S.mBeat,ahead=c.currentTime+.35,T=(t,o)=>AU.tone(t,{...o,bus}),N=(t,o)=>AU.noiseHit(t,{...o,bus});
    const riff=[0,2,4,2,5,4,2,4, 0,2,4,5,7,5,4,2],prog=[0,0,5,3, 0,0,4,4],hz=m=>440*Math.pow(2,(m-69)/12),sc=d=>62+[0,2,4,7,9][d%5]+12*Math.floor(d/5);
    while(S.mT0+S.mNext*B/2<ahead){const i=S.mNext,t=S.mT0+i*B/2,beat=i>>1,bar=beat>>2,off=i%2,fever=S.rate>8.5,fin=S.lanes&&Math.max(...S.lanes.map(l=>l.x))>=S.dist-25;
      const root=hz(38+[0,2,4,7,9,5][prog[bar%8]%6]);
      if(!off){T(t,{f:150,to:42,type:"sine",dur:.16,peak:.5});if(beat%2)N(t,{f:1500,type:"bandpass",q:1.2,dur:.09,peak:.3});}
      N(t+(off?0:0),{f:8000,type:"highpass",q:.6,dur:.03,peak:off?.14:.08});
      T(t,{f:root*(off?2:1),type:"sawtooth",dur:B/2*.8,peak:.07});
      const n=riff[(i%16)];if(bar>=1)T(t,{f:hz(sc(n+(fin?2:0))),type:"square",dur:B/2*.75,peak:.055});
      if(fever||fin)for(let k=0;k<2;k++)T(t+k*B/4,{f:hz(sc(n+[0,4][k])+12),type:"triangle",dur:B/4*.8,peak:.06});
      if(fin&&!off)N(t,{f:3000,type:"highpass",q:.7,dur:.12,peak:.12});
      S.mNext++;}},
  musStop(end){const S=this.st;if(!S||!S.mbus)return;try{const c=AU.ctx,g=S.mbus;if(end){AU.tone(c.currentTime+.01,{f:hz2(62),type:"square",dur:.5,peak:.12,bus:g});AU.noiseHit(c.currentTime+.01,{f:4000,type:"highpass",q:.7,dur:1,peak:.3,bus:g});}
      g.gain.setTargetAtTime(0,c.currentTime+(end?.6:0),.08);setTimeout(()=>{try{g.disconnect()}catch(_){}},1500);}catch(e){}S.mbus=null;},
  /* v1.91.186 commentator */
  say(txt){const S=this.st;if(!S)return;S.com=txt;const e=document.getElementById("rncomt");if(e){e.textContent=txt;const b=document.getElementById("rncom");if(b){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");}}},
  call(el,now){const S=this.st;if(!S||S.phase!=="race")return;const L=this.meLane();if(!L)return;const D=S.dist,me=this.legF(L).name,F=S.cf=S.cf||{};
    const others=S.lanes.filter(l=>!l.me&&!l.ghost),lead=S.lanes.filter(l=>!l.ghost).slice().sort((a,b)=>b.x-a.x)[0],nm=l=>l.legs?(l.teamName||this.legF(l).name):l.name;
    const gap=others.length?L.x-Math.max(...others.map(l=>l.x)):0,once=(k,f)=>{if(!F[k]){F[k]=1;this.say(f());}};
    if(S.react&&!F.go)once("go",()=>S.react<.2?`ปล่อยตัวแล้วครับ! ${me} ออกตัวไวเหมือนกระสุน!`:S.react>.4?`ปล่อยตัวแล้ว! ${me} ออกตัวช้าไปจังหวะนึงครับ!`:`ปล่อยตัวแล้วครับ! ทุกคนพุ่งออกจากเส้น!`);
    if(!S.react&&el>.6&&!F.slow)once("slow",()=>`ไฟเขียวแล้วครับ! ${me} ยังไม่ขยับเลย!`);
    const mk=lead?lead.x:L.x,q=D/4;
    if(!others.length){if(L.x>=D/2)once("q2",()=>L.ghost?"ครึ่งทางแล้ว ไล่เงาสถิติไปติด ๆ!":`ครึ่งทางแล้ว ${me} ยังไม่แผ่วครับ!`);}
    else{if(mk>=q)once("q1",()=>Math.abs(gap)<1.5?`${D/4} เมตร! ไหล่ชนไหล่ครับท่านผู้ชม!`:`${D/4} เมตร ${nm(lead)} นำอยู่ครับ!`);
      if(mk>=D/2)once("q2",()=>Math.abs(gap)<1.5?`ครึ่งทางแล้ว! ยังตัดสินไม่ได้เลยครับ!`:gap>8?`ครึ่งทาง ${me} ทิ้งห่างไปไกลแล้ว!`:gap>0?`ครึ่งทาง ${me} นำอยู่!`:`ครึ่งทาง ${nm(lead)} นำ ${me} ไล่ตามมา!`);
      if(mk>=D*.75)once("q3",()=>Math.abs(gap)<2?`ทางตรงสุดท้าย! หัวชนหัวครับ!`:gap<0?`ทางตรงสุดท้าย ${me} ต้องเร่งแล้วครับ!`:`ทางตรงสุดท้าย ${me} ยังนำอยู่!`);
      if(mk>=D-10&&Math.abs(gap)<1.2)once("photo",()=>`สูสีมาก! อาจต้องดูภาพเส้นชัย!`);}
    if(D>=400&&!S.relay&&!L.done){if((S.hotT||0)>1.2&&L.x<D-150&&(F.hotN||0)<2&&(!F.hotAt||now-F.hotAt>6000)){F.hotN=(F.hotN||0)+1;F.hotAt=now;this.say(`${me} ออกแรงเยอะไป ระวังหมดแรงก่อนโค้งสุดท้ายนะครับ!`);}
      if(L.x>=D-120)once("kick",()=>`120 เมตรสุดท้าย! ปล่อยหมดหน้าตักเลย ${me}!`);}
    if(D>=400&&L.sta<.15&&!L.done)once("empty",()=>`${me} แรงหมดแล้วครับ! ขาเริ่มหนัก!`);
    if(S.relay&&L.legX>=78&&L.leg<L.legs.length-1&&!F["z"+L.leg]){F["z"+L.leg]=1;this.say(`เข้าเขตส่งไม้! แตะลู่วิ่งส่งให้${L.legs[L.leg+1].f.name}!`);}
    if(S.lastT&&now-S.lastT>700&&!L.done&&(!S.fadeT||now-S.fadeT>2500)&&el>1){S.fadeT=now;this.say(`${me} แผ่วลงแล้วครับ! สู้ต่ออีกนิด!`);}},
  loop(){const step=()=>{if(!this.st||(this.st.phase!=="set"&&this.st.phase!=="race"))return;this.tick();this.musPump();this.paint();this.raf=requestAnimationFrame(step);};cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(step);},
  tick(){const S=this.st,now=performance.now();if(S.phase!=="race")return;const el=(now-S.gun)/1000,dt=Math.min(.05,S.prev?(now-S.prev)/1000:.016);S.prev=now;const D=S.dist;
    if(S.lastT&&now-S.lastT>350)S.rate*=Math.pow(.2,dt);
    for(const L of S.lanes){if(L.done)continue;
      if(L.ghost){const p=L.ghost.p,i=el*10;L.x=i>=p.length-1?D:p[Math.floor(i)]+(p[Math.min(p.length-1,Math.floor(i)+1)]-p[Math.floor(i)])*(i%1);if(L.x>=D){L.done=true;L.t=L.ghost.t;}continue;}
      if(L.wait>0){L.wait-=dt;continue;}
      let e;if(L.me)e=S.react&&now>=S.stumble?S.rate/7.5:0;
      else{if(el<L.react)continue;const lx=L.legs?L.legX:L.x,ld=L.legs?100:D;e=ld>=400&&lx<ld-120?(L.cq??=Math.min(1,runCruise(L,ld)+(L.cruise-.87))):L.eff*(1+.03*Math.sin(el*2.3+L.react*9));
        if(ld<400&&L.style){const fr=lx/ld;if(L.style==="fast")e=fr<.6?1:.9;else if(L.style==="kick"){if(fr<.65)e=.92;else{e=1;if(!L.kicked){L.kicked=1;L.vmax*=1.045;}}}}}
      const x0=L.x;runStep(L,e,dt);if(L.legs){L.legX+=L.x-x0;
        if(L.legX>=100&&L.leg<L.legs.length-1){if(L.me)this.handover(L,"late");else this.handover(L,"ai");}}
      if(L.x>=D){L.x=D;L.done=true;L.t=el;}}
    const L=this.meLane();
    {const pz=this.pace(S,L);if(pz){if(pz==="ok")S.bandT=(S.bandT||0)+dt;S.hotT=pz==="hot"?(S.hotT||0)+dt:0;}
     if(L&&!L.done&&S.dist>=400&&!S.relay&&L.sta<=0&&S.emptyAt==null)S.emptyAt=L.x;
     if(pz!==S.pz){if(pz==="kick")S.chain=0;S.pz=pz;const b=document.getElementById("rnL");if(b){b.classList.remove("pz-ok","pz-hot","pz-slow","pz-kick");if(pz)b.classList.add("pz-"+pz);
       const bt=b.querySelector("b"),sm=b.querySelector("small");if(bt)bt.textContent=pz==="ok"?"รักษาจังหวะ":pz==="hot"?"ช้าลง!":pz==="kick"?"เร่ง!!":"วิ่ง!";
       if(sm)sm.textContent=pz==="kick"?"กดรัวสุดแรง · Space":pz?"กดให้เข็มอยู่ในแถบเขียว · Space":"กดรัว ๆ · Space";}}}
    if(L&&!L.done&&now-S.pathT>=100){S.pathT=now;S.path.push(Math.round(L.x*10)/10);}
    const t=document.getElementById("rnt");if(t)t.textContent=el.toFixed(2);this.call(el,now);
    const live=S.lanes.filter(l=>!l.ghost);
    if(L&&L.done&&(live.every(l=>l.done)||el>L.t+2.5)){for(const l of live)if(!l.done){l.t=el+(D-l.x)/Math.max(1,l.v);}this.finish(false);}},
  paint(){const S=this.st,cv=document.getElementById("rncv");if(!S||!cv)return;const x=cv.getContext("2d");x.imageSmoothingEnabled=false;const W=cv.width,H=cv.height,now=performance.now(),RM=typeof JUICE_RM==="function"?JUICE_RM():false;
    const D=S.dist,me=this.meLane();x.save();if(!RM&&S.shk&&now-S.shk<220){const a=(1-(now-S.shk)/220)*4;x.translate((Math.random()-.5)*a,(Math.random()-.5)*a);}
    const sky=H*(S.lanes.length>2?.36:.46),bg=img("bg_sportsday.webp");if(bg.complete&&bg.naturalWidth){const sw=bg.naturalWidth,sh=bg.naturalHeight*.55,par=me?(me.x*.6)%(sw*.3):0;x.drawImage(bg,par*0,0,sw,sh,0,0,W,sky);}else{x.fillStyle="#7fb6e6";x.fillRect(0,0,W,sky);}
    /* track: one lane per runner, ours nearest the camera */
    const n=S.lanes.length,top=sky,lh=(H-top)/n,ly=i=>top+(i+1)*lh-3,lead=Math.max(...S.lanes.map(l=>l.x)),camX=me?me.x:lead;
    const cam=Math.max(0,Math.min(D-28,camX-12)),px=m=>(m-cam)*(W/36)+40;
    x.fillStyle="#c8553d";x.fillRect(0,top,W,H-top);x.fillStyle="#b4482f";x.fillRect(0,top,W,4);
    for(let i=0;i<n;i++){x.fillStyle=i%2?"rgba(0,0,0,.05)":"rgba(255,255,255,.03)";x.fillRect(0,top+i*lh,W,lh);x.fillStyle="#f3e9dc";x.fillRect(0,top+(i+1)*lh-1,W,2);}
    for(let m=0;m<=D;m+=10){const X=px(m);if(X<-10||X>W+10)continue;x.fillStyle="rgba(255,255,255,.55)";x.fillRect(X,top+2,2,H-top);if(m%50===0||D<=100){x.fillStyle="#fff";x.font="bold 10px sans-serif";x.textAlign="left";x.fillText(m+"",X+3,top+11);}}
    if(S.relay)for(let k=1;k<4;k++){const a=px(k*100-22),b=px(k*100);if(b<-10||a>W+10)continue;x.fillStyle="rgba(255,211,74,.28)";x.fillRect(a,top,b-a,H-top);x.fillStyle="#ffd34a";x.fillRect(b-2,top,3,H-top);}
    if(D>=400&&!S.relay){const kx=px(D-120);if(kx>-30&&kx<W+10){x.fillStyle="#ffd34a";x.fillRect(kx-1,top,3,H-top);x.font='900 13px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.textAlign="left";x.lineWidth=4;x.strokeStyle="#140a1e";x.strokeText("เร่ง! 120 ม.",kx+5,top+26);x.fillStyle="#ffd34a";x.fillText("เร่ง! 120 ม.",kx+5,top+26);}}
    const fx=px(D);if(fx<W+10){for(let i=0;i<Math.ceil((H-top)/9.5);i++){x.fillStyle=i%2?"#000":"#fff";x.fillRect(fx,top+i*9.5,6,9.5);}}
    const fr=v=>v>.5?Math.floor(now/Math.max(70,260-v*18))%4:0,sh=Math.min(62,lh*1.55);
    const drawR=(f,m,v,footY,stum,al=1)=>{if(!f)return;const s=sheetFor(f);if(!s||!(s.complete||s.width))return;const bob=v>.5?Math.abs(Math.sin(now/90))*3:0;drawFrame(x,s,stum?ROW.guard:ROW.walk,fr(v),px(m),footY-bob,sh,false,al);};
    S.lanes.forEach((L,i)=>{const fy=ly(i),f=this.legF(L);
      if(L.legs&&L.leg<L.legs.length-1&&!L.done){const nx=L.legs[L.leg+1].f,wx=(L.leg+1)*100;drawR(nx,wx,0,fy,false,.9);}
      const fever=L.me&&S.phase==="race"&&!L.done&&S.rate>8.5;
      if(fever&&!RM){x.save();const gx=px(L.x),gr=x.createRadialGradient(gx,fy,4,gx,fy,46);gr.addColorStop(0,"rgba(255,214,80,.55)");gr.addColorStop(1,"rgba(255,214,80,0)");x.fillStyle=gr;x.fillRect(gx-50,fy-26,100,30);x.restore();
        for(let k=2;k>=1;k--)drawR(f,L.x-k*2.6,L.v,fy,false,k===2?.14:.3);}
      drawR(f,L.x,L.v,fy,L.me&&now<S.stumble,L.ghost?.38:1);
      if(L.me&&!RM)for(const d of S.dust||[]){const e=(now-d.t)/400;if(e>1)continue;x.fillStyle=`rgba(240,220,190,${.6*(1-e)})`;x.beginPath();x.arc(px(L.x)-14-e*18,fy-e*6,3+e*6,0,7);x.fill();}
      /* lane tag */
      x.fillStyle=L.c;x.fillRect(0,top+i*lh+3,4,lh-6);if(L.me){x.fillStyle="rgba(255,255,255,.9)";x.font="bold 9px sans-serif";x.textAlign="left";x.fillText("▶",6,top+i*lh+12);}});
    if(S.phase==="race"&&me&&me.v>6){x.save();x.globalAlpha=Math.min(.45,(me.v-6)/10);x.strokeStyle="#fff";x.lineWidth=2;for(let i=0;i<7;i++){const yy=top+((i*37)%(H-top)),xx=(W-((now*.9+i*61)%(W+80)));x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+40,yy);x.stroke();}x.restore();}
    /* relay (v1.91.197, Man: couldn't see where to tap): a ring closes in on the next runner; tap when it meets the inner circle */
    {const bp=document.getElementById("rnP"),zone=S.relay&&me&&!me.done&&me.leg<me.legs.length-1&&me.legX>=72&&me.wait<=0;
     if(bp){bp.classList.toggle("live",!!zone);bp.classList.toggle("now",!!zone&&me.legX>=92);}
     if(zone){const fy=ly(n-1),cx=px((me.leg+1)*100),cy=fy-sh*.45,r0=22,k=Math.max(0,(95-me.legX)/23),r=r0+k*70,ok=me.legX>=92,mid=me.legX>=86;
      const zx=px(me.leg*100+78),zx2=px(me.leg*100+100);x.save();x.fillStyle="rgba(255,211,74,.22)";x.fillRect(zx,top,zx2-zx,H-top);
      x.lineWidth=4;x.strokeStyle="#140a1e";x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();x.lineWidth=3;x.strokeStyle="#ffffff";x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();
      x.lineWidth=6;x.strokeStyle=ok?"#5dff7a":mid?"#ffd34a":"#ff8a3a";x.globalAlpha=.9;x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();x.globalAlpha=1;
      x.font='900 18px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.textAlign="center";x.lineWidth=5;x.strokeStyle="#140a1e";const tx=ok?"แตะ!":"ส่งไม้…";
      x.strokeText(tx,cx,cy-r0-12);x.fillStyle=ok?"#5dff7a":"#ffd34a";x.fillText(tx,cx,cy-r0-12);x.restore();}}
    if(S.passMsg&&now-S.passMsg.at<900){const e=(now-S.passMsg.at)/900;x.save();x.globalAlpha=1-e;x.textAlign="center";x.font='900 24px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=6;x.strokeStyle="#140a1e";x.strokeText(S.passMsg.t,W/2,sky-10-e*14);x.fillStyle=S.passMsg.good?"#7dff8f":"#ff8a6a";x.fillText(S.passMsg.t,W/2,sky-10-e*14);x.restore();}
    /* start lights */
    if(S.phase==="set"&&S.armed||S.phase==="race"&&now-S.gun<900){const g=S.phase==="race",cx=W/2,cy=H*.24;x.save();x.fillStyle="#141018";x.fillRect(cx-74,cy-24,148,48);x.strokeStyle="#000";x.lineWidth=3;x.strokeRect(cx-74,cy-24,148,48);
      for(let i=0;i<3;i++){const lit=g||S.lights>i,col=g?"#3dff6a":"#ff2a2a";const lx=cx-46+i*46;x.fillStyle=lit?col:"#3a2a30";x.beginPath();x.arc(lx,cy,16,0,7);x.fill();if(lit){x.globalAlpha=.35;x.beginPath();x.arc(lx,cy,24,0,7);x.fill();x.globalAlpha=1;}}
      if(!g&&S.lights>0){const e=(now-S.lightT)/300,sc=1+.6*Math.max(0,1-e);x.font=`900 ${Math.round(54*sc)}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=8;x.strokeStyle="#000";x.strokeText(String(4-S.lights),cx,cy+66);x.fillStyle="#fff";x.fillText(String(4-S.lights),cx,cy+66);}
      if(g){const e=(now-S.gun)/900,sc=1.8-.8*Math.min(1,e*3);x.globalAlpha=Math.max(0,1-Math.max(0,e-.6)/.4);x.font=`900 ${Math.round(64*sc)}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=10;x.strokeStyle="#0a3a14";x.strokeText("ไป!",cx,cy+70);x.fillStyle="#7dff8f";x.fillText("ไป!",cx,cy+70);
        for(let i=0;i<14;i++){const a=i/14*6.283,r=40+e*160;x.fillStyle="#ffe066";x.fillRect(cx+Math.cos(a)*r-3,cy+70+Math.sin(a)*r*.6-3,6,6);}}
      x.restore();}
    /* tap chain counter */
    const pz=this.pace(S,me);
    if(pz&&pz!=="kick"){const col=pz==="ok"?"#7dff8f":pz==="hot"?"#ff9a2a":"#ffffff",big=pz==="ok"?(S.bandT||0).toFixed(1)+" วิ":pz==="hot"?"ช้าลง!":"เร่งอีกนิด",sub=pz==="ok"?"คุมจังหวะ!":pz==="hot"?"แรงจะหมด":"ยังไม่ถึงแถบเขียว";
      x.save();x.translate(W-12,72);x.rotate(-.06);x.textAlign="right";x.textBaseline="alphabetic";x.font='italic 900 34px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=7;x.strokeStyle="#140a1e";x.strokeText(big,0,0);x.fillStyle=col;x.fillText(big,0,0);
      x.font='900 14px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=4;x.strokeText(sub,0,18);x.fillStyle="#fff";x.fillText(sub,0,18);x.restore();}
    else if(S.phase==="race"&&S.chain>=3){const age=now-S.chainT,alive=age<550||(me&&me.done),fade=alive?1:Math.max(0,1-(age-550)/500);
      if(fade>0){const k=S.chain,bump=RM?1:1+.35*Math.max(0,1-age/120),col=k>=75?"#ff4a4a":k>=50?"#ff9a2a":k>=25?"#ffd34a":"#ffffff",jx=!RM&&k>=50&&alive?(Math.random()-.5)*2:0;
        x.save();x.globalAlpha=fade;x.translate(W-12+jx,72);x.rotate(-.08);x.scale(bump,bump);x.textAlign="right";x.textBaseline="alphabetic";
        x.font='italic 900 40px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=7;x.strokeStyle="#140a1e";x.strokeText(String(k),0,0);x.fillStyle=col;x.fillText(String(k),0,0);
        x.font='900 14px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=4;x.strokeText("ครั้งติด!",0,18);x.fillStyle="#fff";x.fillText("ครั้งติด!",0,18);x.restore();}}
    if(S.mile&&now-S.mile.t<900){const e=(now-S.mile.t)/900,cx=W/2,cy=sky*.62;x.save();x.globalAlpha=1-e;x.textAlign="center";x.textBaseline="middle";
      x.font=`900 ${Math.round(30*(1+.4*Math.max(0,1-e*4)))}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.lineWidth=7;x.strokeStyle="#3a1400";const tx=S.mile.n>=75?"ไฟลุก!":S.mile.n>=50?"ขาไม่หยุด!":"เร่งเครื่อง!";x.strokeText(tx,cx,cy-e*16);x.fillStyle="#ffd34a";x.fillText(tx,cx,cy-e*16);
      if(!RM)for(let i=0;i<12;i++){const a=i/12*6.283,r=20+e*120;x.fillStyle=i%2?"#ffd34a":"#ff7a3a";x.fillRect(cx+Math.cos(a)*r-3,cy+Math.sin(a)*r*.55-3,6,6);}x.restore();}
    if(S.phase==="race"&&me&&!me.done&&lead>=D-25&&!RM){const p=.5+.5*Math.sin(now/((S.mBeat||.39)*1000)*Math.PI*2);const g2=x.createLinearGradient(0,0,26,0);g2.addColorStop(0,`rgba(255,60,60,${.25+.2*p})`);g2.addColorStop(1,"rgba(255,60,60,0)");x.fillStyle=g2;x.fillRect(0,0,26,H);x.save();x.translate(W,0);x.scale(-1,1);x.fillStyle=g2;x.fillRect(0,0,26,H);x.restore();}
    /* top strip: everyone's position on a mini track, then our tank (400 m and relay) with the cruise band */
    x.fillStyle="rgba(10,6,20,.72)";x.fillRect(0,0,W,me&&(D>=400||S.relay)?36:20);x.fillStyle="#3a3158";x.fillRect(8,8,W-16,4);
    if(S.relay)for(let k=1;k<4;k++){x.fillStyle="#ffd34a";x.fillRect(8+(W-16)*k/4-1,6,2,8);}
    for(const L of S.lanes){const X=8+(W-16)*Math.min(1,L.x/D);x.fillStyle=L.c;x.globalAlpha=L.ghost?.55:1;x.fillRect(X-3,L.me?4:6,6,L.me?12:8);x.globalAlpha=1;if(L.me){x.strokeStyle="#fff";x.lineWidth=1;x.strokeRect(X-3.5,3.5,7,13);}}
    if(me&&(D>=400||S.relay)){const bw=120,bx=8,by=22,q=me.v/Math.max(1,me.vmax);x.fillStyle="#fff";x.font="bold 9px sans-serif";x.textAlign="left";x.fillText("แรง",bx,by+8);
      x.fillStyle="#241c38";x.fillRect(bx+22,by,bw,9);x.fillStyle=me.sta>.45?"#5be06a":me.sta>.18?"#ffd34a":"#ff5a4a";x.fillRect(bx+22,by,bw*me.sta,9);x.strokeStyle="#000";x.strokeRect(bx+22.5,by+.5,bw,9);
      if(D>=400){const ex=bx+bw+32;x.fillStyle="#fff";x.fillText("ฝีเท้า",ex,by+8);const mx=ex+30,mw=W-mx-10;x.fillStyle="#241c38";x.fillRect(mx,by,mw,9);{const cq=me.x<D-120?runCruise(me,D):1,b0=Math.max(.72,cq-.05);x.fillStyle="rgba(91,224,106,.6)";x.fillRect(mx+mw*b0,by,mw*(cq-b0),9);}
        x.fillStyle=q>.92?"#ff7a3a":"#ffffff";x.fillRect(mx+mw*Math.min(1,q)-2,by-2,4,13);}}
    x.restore();},
  finish(dq){const S=this.st;if(S&&S.mbus)this.musStop(true);this.stop();if(S.phase==="result")return;S.phase="result";const me=this.meLane(),D=S.dist;
    if(dq&&me){me.t=99;me.done=true;for(const l of S.lanes)if(!l.done)l.t=99;}
    const live=S.lanes.filter(l=>!l.ghost),order=S.lanes.slice().sort((a,b)=>a.t-b.t),place=live.slice().sort((a,b)=>a.t-b.t).indexOf(me)+1;
    const t=dq?99:me.t,f=this.runner(),par=f&&!S.relay?runPar(f,D):0,r=par?t/par:1;
    let grade=dq?"C":r<=1.02?"S":r<=1.07?"A":r<=1.14?"B":"C";const p4=D>=400&&!S.relay;if(p4&&live.length>1&&place>1&&(grade==="S"||grade==="A"))grade="B";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};const bk=D>=400?"run400":"run",ext=S.duel||S.race;
    const prev=G.mini.best[bk]||null,isBest=!dq&&!ext&&!S.relay&&(!prev||t<prev);if(isBest)G.mini.best[bk]=Math.round(t*100)/100;
    /* the ghost is per runner, 100 m only */
    if(!dq&&!ext&&D===100&&f){G.mini.runGhost=G.mini.runGhost||{};const g=G.mini.runGhost[f.id];if(!g||t<g.t)G.mini.runGhost[f.id]={t:Math.round(t*100)/100,p:S.path.concat([D])};}
    let say=null,ladUp=false;if(!ext&&S.md==="duel"&&S.dsub==="town"&&!dq){const L=RUN_LADDER[S.rung],won=place===1;say={n:L.n,t:won?L.lose:L.win};
      if(won&&S.rung===(G.mini.ladder||0)){G.mini.ladder=(G.mini.ladder||0)+1;ladUp=true;G.dust=(G.dust||0)+2;if(G.mini.ladder<RUN_LADDER.length)S.rung=G.mini.ladder;}}
    if(S.race&&S.race.say)say=S.race.say(place===1);
    const passTxt=S.passes&&S.passes.length?S.passes.map(q=>({perfect:"เนียน",good:"ดี",early:"เร็วไป",late:"ช้า"}[q])).join(" · "):"";
    S.res={win:place===1,place,t,ot:(live.find(l=>!l.me)||{}).t||0,dq,fs:S.fs,react:S.react||0,chain:S.maxChain||0,grade:ext||S.relay?null:grade,best:isBest&&!(p4&&place>1),p4,band:S.bandT||0,empty:S.emptyAt,prev,par,order,passes:passTxt,rw:"",say,ladUp};
    const out={win:place===1,place,t,ot:S.res.ot,dq,order:order.map(l=>({team:l.team,t:l.t,me:l.me}))};
    if(S.race&&S.race.cb)S.race.cb(out);
    else if(S.duel&&S.duel.cb){S.duel.cb(out);}
    else if(S.duel&&typeof DUEL!=="undefined"){DUEL.done({win:out.win,score:t},S);}
    else if(!S.practice)S.res.rw=this.reward(grade,place===1&&live.length>1);
    save();this.draw();AU.sfx&&AU.sfx(place===1?"level":"ui");},
  reward(grade,win){const S=this.st,f=this.runner(),out=[];G.campUsed=S.act||"run";G.campNote=`${CAMP_ACTIONS.run.name} · เกรด ${grade}`;
    const g={S:.16,A:.12,B:.08,C:.04}[grade],cap=Math.min(stCap(f),(f.potential||14)+1.5),key=S.md==="m400"?["stamina","speed"]:["speed","stamina"];
    const up=k=>{const b=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g)*100)/100);return f.a[k]>b;};
    if(up(key[0])|up(key[1]))out.push(`ความเร็ว/ความอึด +${g}`);else out.push("ความเร็ว/ความอึดเต็มศักยภาพแล้ว");
    const mo=win?6:3;f.morale=Math.min(100,(f.morale||0)+mo);out.push(`กำลังใจ +${mo}`);f.fatigue=Math.min(100,(f.fatigue||0)+(S.md==="m400"?7:5));out.push(`ล้า +${S.md==="m400"?7:5}`);
    const o=S.md==="duel"&&S.dsub!=="town"&&G.F[S.opp];if(o){o.fatigue=Math.min(100,(o.fatigue||0)+3);const R=S.res;if(Math.abs(R.t-R.ot)<.3){add(G,o.id,"bond",1);add(G,f.id,"bond",1);out.push("สูสีจนหัวเราะกันทั้งคู่");}
      if(win&&runPar(o,100)<runPar(f,100)){G.dust=(G.dust||0)+2;out.push("ล้มคนที่เร็วกว่าได้! ✦ +2");}}
    const du={S:5,A:3,B:2,C:1}[grade];G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);out.push(esc(RUN_LINE[grade]));
    G.flags.runN=(G.flags.runN||0)+1;if(grade==="S")G.flags.runS=(G.flags.runS||0)+1;
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 การ์ดใหม่ ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;}};
MG_MODES.run={icon:"🏃",title:"ลู่วิ่งค่าย",note:"จับเวลา 100 ม. · ดวล 1 ต่อ 1 · 400 ม. 4 คน · ได้ความเร็ว/ความอึด เศษดาว",open:G=>(G.week>=6||(G.season||1)>=2)&&bagFighters(G).length>=1,custom:true};
MG_ACT.run="run";
/* v1.90: district sports day — once a year from week 24: 100 m sprint, tug of war and a 3-leg relay against the other colours; points per event */
const SPORTS_WK=24;
const SP_TEAMS=[{k:"me",n:"สีแดง · ค่ายศิริชัย",c:"#d9473b"},{k:"tiger",n:"สีเหลือง · ค่ายพยัคฆ์ทอง",c:"#e2b23a"},{k:"teach",n:"สีฟ้า · ทีมครูโรงเรียนอำเภอ",c:"#3a86d9"},{k:"obt",n:"สีเขียว · ทีม อบต.",c:"#3aa65a"}];
const SP_EV=[{k:"run",n:"วิ่ง 100 เมตร",ic:"🏃",d:"เลือกนักวิ่ง 1 คน ลงแข่ง 4 ลู่กับตัวแทนอีก 3 สี"},{k:"run400",n:"วิ่ง 400 เมตร",ic:"🏃",d:"รอบสนาม 4 ลู่ · ประคองแรงในแถบเขียว แล้วเร่งช่วง 120 เมตรสุดท้าย"},{k:"tug",n:"ชักเย่อ",ic:"🪢",d:"ทั้งค่ายช่วยกันดึง · กดดึงรัว ๆ แล้วกด ฮึบ! ตอนเข็มอยู่ช่องเขียว"},{k:"relay",n:"วิ่งผลัด 4×100",ic:"🏅",d:"4 คนที่เร็วที่สุดในค่ายวิ่งคนละ 100 เมตร · กดรัวให้วิ่ง พอถึงเขตส่งไม้ แตะลู่วิ่งให้ตรงจังหวะ"}];
function sportsDue(G){return !G.ended&&G.week>=SPORTS_WK&&G.week<=SPORTS_WK+4&&!(G.sports||{})[G.season||1]&&roster(G).length>=1;}
function sportsDayYear(done){if(!sportsDue(G)){done();return;}SPORTS.open(done);}
/* v1.91.195 the four colours each send real runners: Golden Tiger's fighters (the fastest of them), the district school's teachers, the sub-district office;
   the teachers and the office get a little quicker every year, Golden Tiger is as quick as its fighters are */
function spSquad(k){const y=G.season||1,T=RACE_TEAMS[k];
  if(k==="me"){const R=roster(G).filter(f=>!f.injury).sort((a,b)=>runVmax(b)-runVmax(a));let i=0;while(R.length<4)R.push(runNpc("sp_stu"+i,["น้องต้นกล้า นักเรียนค่าย","น้องข้าวปั้น นักเรียนค่าย","น้องมิ้น นักเรียนค่าย","น้องบอล นักเรียนค่าย"][i++],10,10,0));return R;}
  if(k==="tiger"){const R=SPORTS.rivals().slice(0,4);if(G.dare&&G.dare.done)R.unshift(runDareRival(false));R.splice(4);let i=0;while(R.length<4)R.push(runNpc("sp_y"+i,["เสือเล็ก พยัคฆ์ทอง","เสือน้อย พยัคฆ์ทอง","เสือโคร่ง พยัคฆ์ทอง","เสือเหลือง พยัคฆ์ทอง"][i++],Math.min(19,13+y*.8),Math.min(19,13+y*.7),T.hue));return R;}
  const base=k==="teach"?[10.5,12]:[9,11],gr=k==="teach"?[.7,.5]:[.6,.5],cap=k==="teach"?17:15,P=SP_SQUADS[k],r=mulberry32((G.seed||1)+y*31+(k==="teach"?7:13));
  const rest=P.slice(1).map(x=>[x,r()]).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>x[0]);
  const sq=[P[0],...rest].map(([id,n],i)=>runNpc(id,n,Math.min(cap+(i?0:1.5),base[0]+gr[0]*y+(i?-.4*i:.8)),Math.min(cap,base[1]+gr[1]*y),T.hue));
  const g=spGuest();if(g&&g.team===k){sq.splice(1,0,g.f);sq.length=4;sq.guest=g.f;}return sq;}
/* v1.91.199 (Man: it'd be funny if real fighters turned up at sports day) — every year one boxer from outside the camp runs as a guest
   for the teachers or the TAO: Pailin, a Vector Lab fighter, or a fighter from the district league. Golden Tiger's own stay in yellow. */
function spGuest(){const y=G.season||1,r=mulberry32((G.seed||1)+y*53),tig=new Set(SPORTS.rivals().map(f=>f.id));
  const P=Object.values(G.F).filter(f=>!f.retired&&!f.injury&&f.camp!=="player"&&f.camp!=="region"&&!tig.has(f.id)&&(f.camp==="rival"||f.camp==="npc")&&f.a);
  if(!P.length)return null;const star=P.filter(f=>f.camp==="rival").sort((a,b)=>(b.id==="pailin")-(a.id==="pailin")||a.id.localeCompare(b.id)),useStar=star.length&&r()<.65,f=useStar?star[(y-1)%star.length]:P[Math.floor(r()*P.length)];return {f,team:r()<.5?"teach":"obt"};}
const SPORTS={st:null,
  el(){return document.getElementById("minibag");},
  open(done){BAG.st={phase:"sports",mode:"run",practice:true};BAG.mount();this.st={ph:"intro",ev:0,pts:{me:0,tiger:0,teach:0,obt:0},log:[],done};this.draw();},
  /* v1.91.197 (Man: why is Pailin running for Golden Tiger?) — only Golden Tiger's own fighters wear yellow: Ploy and Fah before they join us,
     Petchara, and Baiyok while she is still theirs. Vector Lab and Pailin are another camp and stay out; Tiger's students fill the gaps. */
  rivals(){return Object.values(G.F).filter(f=>f.camp==="rival"&&!f.retired&&!f.lab&&!f.indie&&/พยัคฆ์ทอง/.test(f.full||"")).sort((a,b)=>(b.a.speed||0)-(a.a.speed||0));},
  /* points by finishing order: 3 · 2 · 1 · 0 */
  rankOrder(order){const S=this.st;[3,2,1,0].forEach((p,i)=>S.pts[order[i]]+=p);S.log.push({ev:S.ev,order,win:order[0]==="me",place:order.indexOf("me")+1});},
  rank(win,none){const S=this.st,r=mulberry32((G.seed||1)+(G.season||1)*97+S.ev*13),o=r()<.5?["teach","obt"]:["obt","teach"];
    this.rankOrder(none?["tiger",...o,"me"]:win?["me","tiger",...o]:["tiger","me",...o]);},
  act(a){const S=this.st;if(!S)return;
    if(a==="go"){S.ph="ev";this.draw();}
    else if(a==="start")this.startEv();
    else if(a==="next"){S.ev++;if(S.ev>=SP_EV.length){this.finish();return;}S.ph="ev";this.draw();}
    else if(a==="tap")TUG.tap();else if(a==="heave")TUG.heave();
    else if(a==="skip"){if(S.ph==="final"&&!S.skip){S.skip=true;this.draw();}}
    else if(a==="end")this.close();},
  race(E){const S=this.st,keys=["tiger","teach","obt"],sq={};for(const k of [...keys,"me"])sq[k]=spSquad(k);const y=G.season||1;
    const back=()=>{RUN.stop();RUN.st=null;BAG.st.phase="sports";S.ph="res";this.draw();},cb=res=>{this.rankOrder(res.order.map(o=>o.team));S.res=res;};
    const lane=(k,f,me)=>runLane(f,{team:k,me,eff:k==="tiger"?.97+Math.random()*.03:k==="teach"?.93+Math.random()*.05:.9+Math.random()*.06,cruise:k==="tiger"?.87:.84+Math.random()*.04});
    const intro=`ลู่สีเหลือง ${sq.tiger[0].name} · สีฟ้า ${sq.teach[0].name} · สีเขียว ${sq.obt[0].name} · ตัวเต็งของแต่ละสีพร้อมแล้วครับ!`;
    if(E.k==="relay"){const mk=k=>{const L=lane(k,sq[k][0],k==="me");L.legs=sq[k].slice(0,4).map(f=>({f}));L.teamName=RACE_TEAMS[k].n;return L;};
      return {label:"กีฬาสี · วิ่งผลัด 4×100",note:`ไม้ 1–4: ${sq.me.slice(0,4).map(f=>f.name).join(" → ")} · กดรัวให้วิ่ง พอเข้าเขตสีเหลืองแตะลู่วิ่งส่งไม้ (Enter ก็ได้) · แตะช่วงท้ายเขต = ส่งไม้เนียน`,
        dist:400,fixedMe:true,intro,me:sq.me[0],lanes:()=>[...keys.map(mk),mk("me")],cb,next:back};}
    const d=E.k==="run400"?400:100,pickF=k=>k==="tiger"?sq.tiger[d===400?1:0]||sq.tiger[0]:sq[k].guest?(d===400?sq[k][0]:sq[k].guest):sq[k][d===400?1:0];
    return {label:`กีฬาสี · วิ่ง ${d} เมตร`,note:`4 สี 4 ลู่ · ที่ 1 ได้ 3 คะแนน ที่ 2 ได้ 2 ที่ 3 ได้ 1 · คู่แข่ง: ${keys.map(k=>`${RACE_TEAMS[k].n} ${pickF(k).name}`).join(" · ")}`,dist:d,intro:(()=>{const gk=["teach","obt"].find(k=>sq[k].guest&&pickF(k)===sq[k].guest);return gk?`แขกรับเชิญครับ! ${sq[gk].guest.name} ลงวิ่งให้${RACE_TEAMS[gk].n}${gk==="obt"?"ทีม อบต.":"ทีมครู"}! ใครให้มาเนี่ย!`:`ลู่สีเหลือง ${pickF("tiger").name} · สีฟ้า ${pickF("teach").name} · สีเขียว ${pickF("obt").name} · พร้อมแล้วครับ!`;})(),
      lanes:me=>[...keys.map(k=>lane(k,pickF(k),false)),lane("me",me,true)],cb,next:back};},
  startEv(){const S=this.st,E=SP_EV[S.ev];
    if(E.k==="tug"){S.ph="tug";TUG.start(res=>{if(!this.st)return;this.rank(res.win);S.res=res;S.ph="res";this.draw();});return;}
    const R=this.race(E);RUN.pick(R.fixedMe?{race:R,id:R.me.id}:{race:R});},
  table(){const S=this.st;return `<div class="sp-tab">${SP_TEAMS.slice().sort((a,b)=>S.pts[b.k]-S.pts[a.k]).map(T=>`<div class="sp-row${T.k==="me"?" me":""}" style="--tc:${T.c}"><i></i><span>${esc(T.n)}</span><b>${S.pts[T.k]}</b></div>`).join("")}</div>`;},
  finish(){const S=this.st,order=SP_TEAMS.map(t=>t.k).sort((a,b)=>S.pts[b]-S.pts[a]||(a==="me"?-1:b==="me"?1:0)),place=order.indexOf("me")+1,y=G.season||1;
    const mo=place===1?6:place===2?4:2,du=place===1?6:place===2?4:2,out=[];
    for(const f of roster(G))f.morale=Math.min(100,(f.morale||0)+mo);out.push(`กำลังใจทุกคน +${mo}`);G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(place===1){G.rep=(G.rep||0)+1;out.push("ชื่อเสียง +1");G.flags.sportsWin=(G.flags.sportsWin||0)+1;}
    G.sports=G.sports||{};G.sports[y]={place,pts:{...S.pts}};
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 การ์ดใหม่ ×${got.length}`);}}
    S.place=place;S.out=out;S.ph="final";S.skip=false;save();this.draw();this.ceremony();},
  /* v1.91.197 (Man: announce the sports-day result like the camp contest) — the district chief reads the table from fourth up:
     drum ticks under each name, the podium rises colour by colour, the winner gets the bell and the confetti */
  ceremony(){const S=this.st,P=S.place,T=[900,2300,3700,5400];clearTimeout(this.cto);this.cto=[];
    const tick=(t,f)=>this.cto.push(setTimeout(()=>{if(this.st===S&&!S.skip)f();},t));
    for(let i=0;i<4;i++){for(let k=0;k<4;k++)tick(T[i]-480+k*110,()=>AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:150+k*20,to:70,type:"sine",dur:.08,peak:.25}));
      tick(T[i],()=>AU.sfx&&AU.sfx(i===3?(P===1?"champ":"bell"):"ui"));}
    if(P===1)for(let i=0;i<5;i++)tick(5900+i*900,()=>AU.sfx&&AU.sfx("pop"));},
  close(){const S=this.st;if(!S)return;(this.cto||[]).forEach(clearTimeout);this.st=null;TUG.stop();if(RUN.st){RUN.stop();RUN.st=null;}
    const y=G.season||1;if(!(G.sports||{})[y]){G.sports=G.sports||{};G.sports[y]={place:0,pts:{...S.pts},left:1};}
    const el=this.el();if(el)el.remove();BAG.st=null;save();try{AU.startMusic("hub");}catch(e){}render();if(S.done)S.done();},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const E=SP_EV[S.ev];
    if(S.ph==="intro"){el.innerHTML=`<div class="mbox px sp"><h2>🎌 งานกีฬาสีอำเภอ ประจำปี ${G.season||1}</h2>
       <div class="ctip"><img src="${faceSrc("coach")}" alt=""><span>ทางอำเภอชวนค่ายเราลงแข่งกีฬาสีอีกแล้ว ปีนี้เราได้สีแดง ค่ายพยัคฆ์ทองได้สีเหลือง ทีมครูโรงเรียนสีฟ้า ทีม อบต. สีเขียว… ห้ามแพ้พยัคฆ์ทองนะ!</span></div>
       ${(()=>{const g=spGuest();return g?`<div class="rsay"><b>ข่าวลือข้างสนาม:</b> ปีนี้${g.team==="obt"?"ทีม อบต.":"ทีมครู"}ได้แขกรับเชิญเป็นนักมวยจริง… ${esc(g.f.name)}!</div>`:"";})()}
       ${this.table()}<p class="meta">${SP_EV.length} รายการ: ${SP_EV.map(e=>e.ic+" "+e.n).join(" · ")} · ที่ 1 ได้ 3 คะแนน ที่ 2 ได้ 2 ที่ 3 ได้ 1 · รวมคะแนนสีชนะ = ชื่อเสียง +1 · กำลังใจทุกคน · เศษดาว</p>
       <div class="mfoot roadbtns"><button class="btn" data-sp="end">ไม่ไปปีนี้</button><button class="btn primary" data-sp="go">ไปสนามกีฬา ▸</button></div></div>`;return;}
    if(S.ph==="ev"){el.innerHTML=`<div class="mbox px sp"><h2>${E.ic} รายการที่ ${S.ev+1}/${SP_EV.length}: ${E.n}</h2><p class="meta">${E.d}</p>${this.table()}
       <div class="mfoot roadbtns"><button class="btn primary" data-sp="start">เริ่ม ▸</button></div></div>`;return;}
    if(S.ph==="tug"){TUG.draw();return;}
    if(S.ph==="res"){const R=S.res||{},L=S.log[S.log.length-1]||{},pl=L.place||0,run=E.k!=="tug";
      const line=R.none?"ค่ายลงแข่งรายการนี้ไม่ได้ ปีนี้ยกให้สีอื่นไปก่อน":pl===1?(E.k==="relay"?"ไม้สุดท้ายเข้าเส้นก่อน! ทั้งค่ายวิ่งลงไปกอดกันกลางลู่":E.k==="tug"?"เชือกไหลมาฝั่งสีแดงทั้งเส้น! สีเหลืองล้มกองกันกลางสนาม":"สีแดงเข้าเส้นเป็นคนแรก! กองเชียร์ค่ายศิริชัยตีกลองลั่นสนาม")
        :E.k==="tug"?"สีเหลืองลากเชือกไปได้ทั้งเส้น… ครูแดงบอกว่าปีหน้าต้องกินข้าวเพิ่ม":`สีแดงเข้าเส้นอันดับ ${pl} · ${RACE_TEAMS[L.order[0]].n}คว้าที่ 1 ไป`;
      el.innerHTML=`<div class="mbox px sp"><h2>${E.ic} ${E.n} · ${R.none?"ไม่ได้ลงแข่ง":pl===1?"สีแดงได้ที่ 1!":`สีแดงได้ที่ ${pl}`}</h2><p class="center">${line}</p>
       ${run&&R.order?`<div class="rtable">${R.order.map((o,i)=>`<div class="${o.team==="me"?"me":""}" style="--tc:${RACE_TEAMS[o.team].c}"><b>${i+1}</b><span>${RACE_TEAMS[o.team].n}</span><em>${o.t.toFixed(2)} วิ</em></div>`).join("")}</div>`:""}${this.table()}
       <div class="mfoot roadbtns"><button class="btn primary" data-sp="next">${S.ev+1<SP_EV.length?"รายการต่อไป ▸":"ดูผลรวม ▸"}</button></div></div>`;return;}
    if(S.ph==="final"){const P=S.place,y=G.season||1,ord=SP_TEAMS.map(t=>t.k).sort((a,b)=>S.pts[b]-S.pts[a]||(a==="me"?-1:b==="me"?1:0)),now=S.skip?" now":"",D=[900,2300,3700,5400];
      const team=k=>SP_TEAMS.find(t=>t.k===k),pod=[1,0,2].map(i=>{const k=ord[i],t=team(k);return `<div class="pd p${i+1}${k==="me"?" me":""}${now}" style="--tc:${t.c};--d:${D[3-i]}ms"><b>${i+1}</b><small>${esc(RACE_TEAMS[k].n)}</small></div>`;}).join("");
      el.innerHTML=`<div class="mbox px sp spcer${P===1?" win":""}" data-sp="skip"><h2>ประกาศผลกีฬาสีอำเภอ ปี ${y}</h2>
       <div class="sppod${now}"><img class="spmc" src="a/npc_caster.webp" alt="">${pod}${P===1?`<div class="spconf${now}"></div>`:""}</div>
       <div class="ctscore">${[3,2,1,0].map((i,j)=>{const k=ord[i],t=team(k);return `<div class="ctrow rk${i+1}${k==="me"?" me":""}${now}" style="--d:${D[j]}ms"><span>${i<3?["🥇","🥈","🥉"][i]:"　"} อันดับ ${i+1} · ${esc(t.n)}</span><i></i><b>${S.pts[k]} คะแนน</b></div>`;}).join("")}
        <div class="ctrow tot${now}" style="--d:6200ms"><span>${P===1?"🏆 สีแดงค่ายศิริชัยคว้าแชมป์กีฬาสี!":`สีแดงค่ายศิริชัยได้อันดับ ${P}`}<small>${S.out.map(x=>x.replace(/<[^>]+>/g,"")).join(" · ")}</small></span><i></i><b></b></div></div>
       <div class="ctip ctrow${now}" style="--d:6800ms"><img src="${faceSrc("coach")}" alt=""><span>${P===1?"ถ้วยกีฬาสีใบนี้ ปู่ชัยเคยได้ครั้งเดียวตอนค่ายยังมีคนสิบห้าคน… วันนี้เราทำได้อีกแล้ว":"แพ้กีฬาสีไม่เป็นไร แพ้บนเวทีน่ะห้าม! กลับไปซ้อม"}</span></div>
       <p class="meta center">แตะเพื่อข้าม</p><div class="mfoot roadbtns"><button class="btn primary" data-sp="end">กลับค่าย</button></div></div>`;}}};
/* tug of war: tap to pull, heave when the needle sits in the green */
const TUG={st:null,
  start(cb){const R=roster(G),pw=R.length?R.reduce((s,f)=>s+(f.a.power||10)+(f.a.stamina||10),0)/R.length/20:1;
    this.st={p:0,t0:performance.now(),prev:0,cb,pw:Math.max(.8,Math.min(1.5,pw)),mk:0,dir:1,done:false,opp:Math.min(.11,.08+.005*(G.season||1)),msgT:0};this.draw();this.loop();},
  stop(){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.st=null;},
  tap(){const S=this.st;if(!S||S.done)return;S.p+=.012*S.pw;this.bump("tgL");},
  heave(){const S=this.st;if(!S||S.done)return;const ok=S.mk>.4&&S.mk<.6;S.p+=ok?.09*S.pw:-.03;this.say(ok?"ฮึบ!! ดึงพร้อมกัน":"จังหวะหลุด!");this.bump("tgR");AU.sfx&&AU.sfx(ok?"hit":"ui");},
  bump(id){const b=document.getElementById(id);if(b){b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");}},
  say(t){const m=document.getElementById("tgmsg");if(m)m.textContent=t;},
  loop(){const step=()=>{const S=this.st;if(!S||S.done)return;const now=performance.now(),dt=Math.min(.05,S.prev?(now-S.prev)/1000:.016),el=(now-S.t0)/1000;S.prev=now;
      S.mk+=S.dir*dt*1.15;if(S.mk>1){S.mk=1;S.dir=-1;}if(S.mk<0){S.mk=0;S.dir=1;}
      if(el>1)S.p-=S.opp*dt*(1+.3*Math.sin(el*1.7));
      const f=document.getElementById("tgflag"),k=document.getElementById("tgmk"),t=document.getElementById("tgt");if(f)f.style.left=(50-Math.max(-1,Math.min(1,S.p))*42)+"%";if(k)k.style.left=(S.mk*100)+"%";if(t)t.textContent=Math.max(0,20-el).toFixed(1);
      if(S.p>=1||S.p<=-1||el>=20){this.end(S.p>0);return;}this.raf=requestAnimationFrame(step);};this.raf=requestAnimationFrame(step);},
  end(win){const S=this.st;S.done=true;this.say(win?"สีแดงชนะ!":"สีเหลืองชนะ…");AU.sfx&&AU.sfx(win?"level":"ui");const cb=S.cb,p=S.p;this.to=setTimeout(()=>{this.st=null;cb({win,p});},900);},
  draw(){const el=document.getElementById("minibag");if(!el||!this.st)return;
    el.innerHTML=`<div class="mplay tug"><div class="mhud"><b>🪢 ชักเย่อ</b><span id="tgmsg">กดดึงรัว ๆ แล้วกด ฮึบ! ตอนเข็มอยู่ช่องเขียว</span><span><b id="tgt">20.0</b> วิ</span></div>
     <div class="tug-field"><span class="tug-team r">สีแดง</span><div class="tug-rope"><i class="tug-mid"></i><b id="tgflag" class="tug-flag"></b></div><span class="tug-team y">สีเหลือง</span></div>
     <div class="tug-meter"><i class="tug-zone"></i><b id="tgmk"></b></div>
     <div class="mbtns"><button class="mbtn L" id="tgL"><b>ดึง!</b><small>F</small></button><button class="mbtn R" id="tgR"><b>ฮึบ!</b><small>J</small></button></div></div>`;
    const pd=f=>e=>{e.preventDefault();f();};document.getElementById("tgL").addEventListener("pointerdown",pd(()=>this.tap()));document.getElementById("tgR").addEventListener("pointerdown",pd(()=>this.heave()));}};
Object.assign(CARDS,{
 sp_team_r:{c:"kati",r:"R",t:"ถ้วยกีฬาสีใบที่สอง",hint:"ชนะงานกีฬาสีอำเภอ",bg:"sportsday",need:G=>(G.flags.sportsWin||0)>0,steps:[
  {n:"nar",t:"สนามโรงเรียนอำเภอตอนบ่ายแก่ กองเชียร์สีแดงตีกลองไม่หยุด ผอ.โรงเรียนยื่นถ้วยพลาสติกสีทองให้ค่ายศิริชัย"},
  {n:"coach",t:"ถ้วยใบแรกปู่ชัยได้ตอนค่ายยังมีคนสิบห้าคน ใบนี้เป็นใบที่สอง… ตั้งไว้ข้างกันเลย"},
  {n:"kati",f:"happy",l:"casual",t:"ทุกคนมาถ่ายรูปกันค่ะ! ครูแดงยืนตรงกลาง ห้ามหลบนะคะ"},
  {n:"nar",t:"รูปออกมาเบลอทั้งใบเพราะไม่มีใครยืนนิ่ง แต่มันถูกใส่กรอบแขวนไว้ในห้องทำงานจนทุกวันนี้"}]}});

Object.assign(CARDS,{
 m_live:{c:"kati",r:"R",t:"ไลฟ์แรกของค่าย",hint:"ไลฟ์ขายของค่ายครั้งแรก",bg:"live_corner",need:G=>(G.flags.liveN||0)>=1,steps:[
  {n:"nar",t:"มือถือตั้งบนกองกระสอบทราย กะทิกับเสื้อค่ายตัวเดียวที่รีดเรียบที่สุด กล้องหน้าเปิดอยู่ คนดู 3 คน"},
  {n:"kati",f:"flustered",l:"casual",t:"สะ… สวัสดีค่ะ ค่ายศิริชัยค่ะ วันนี้มีเสื้อมาขาย… คนดูสามคน หนึ่งในนั้นคือครูแดง"},
  {n:"coach",t:"(คอมเมนต์จากบัญชี 'แดงศิริชัย') CF 1 ตัว"},
  {n:"kati",f:"happy",l:"casual",t:"ครูคะ! ครูยืนอยู่ข้างหลังหนูเนี่ย! …แต่ขอบคุณค่ะ ออเดอร์แรกของค่ายเลยนะคะ"}]},
 m_livehot:{c:"fah",r:"SR",t:"ไลฟ์แตก",hint:"ได้เกรด S ในไลฟ์ขายของ",bg:"live_corner",need:G=>(G.flags.liveS||0)>=1,steps:[
  {n:"nar",t:"ตัวเลขคนดูพุ่งเกินพัน ออเดอร์เด้งจนมือถือสั่นไม่หยุด ทั้งค่ายช่วยกันจดใส่สมุดของริน"},
  {n:"fah",f:"happy",l:"casual",t:"เห็นไหม! บอกแล้วว่าไลฟ์ต้องมีฟ้า! ฟ้ายกเสื้อขึ้นกล้องตัวเดียว ออเดอร์เด้งมาสิบตัว!"},
  {n:"rin",f:"pout",l:"casual",t:"ออเดอร์ทั้งหมดบันทึกครบ ไม่มีซ้ำ ไม่มีตก …เสื้อในโกดังเหลือสองตัว ใครจะบอกลูกค้าคนที่สามสิบเอ็ด"},
  {n:"coach",t:"สมัยปู่ชัย เสื้อค่ายขายได้ปีละสิบตัว …วันนี้ขายได้ในห้านาที โลกมันเปลี่ยนไปจริง ๆ"}]}});

/* ===== v1.80: redeem codes + the Loy Krathong event (a floating-market gauntlet against the helmet gang) ===== */
const REDEEM={"U0lSSUNIQUky":{k:"gate"},"TE9ZS1JBVEhPTkc2OQ==":{k:"loy",from:"2026-11-18",to:"2026-12-07"}};
function evTest(){try{return !/github\.io$/.test(location.hostname)||/evtest/.test(location.hash)||localStorage.getItem("mtm-evtest")==="1";}catch(e){return false;}}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const LOY_LADDER=["gang1","gang1","gang2","gang2","gang3","gang3","gang4","gang6","gang5"];
const LOY_TIERS=[["gold","ทอง",1200],["silver","เงิน",800],["bronze","ทองแดง",400]]; /* v1.89.31: easier so most players see more than one ending */
const loyOf=G=>(G.ev||{}).loy||null;
function loyTier(sc,boss){for(const [k,n,min] of LOY_TIERS)if(sc>=min&&(k!=="gold"||boss))return {k,n};return null;}
/* v1.89.31: easier — the gang starts level with the fighter sent and rises to 15% stronger at the boss */
function evGang(G,k,f){const kind=LOY_LADDER[k],K=QK[kind],t=Math.min(19.2,ovr(f.a)*(1+.15*k/8)),rng=mulberry32((G.seed^0x10e)+k*131);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_evloy_"+k;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind=kind;o.grp="gang";o.lvl=(f.lvl||1)+2+Math.floor(k/3);o.fatigue=0;o.morale=75;G.F[id]=o;syncFighterAges(G);return id;}
function redeemCode(raw){const v=(raw||"").toUpperCase().replace(/\s+/g,"");if(!v)return;let key="";try{key=btoa(v);}catch(e){}const R=REDEEM[key];
  if(!R){AU.sfx("miss");toast("ไม่พบโค้ดนี้ ลองเช็กตัวสะกดอีกครั้ง");return;}
  if(R.k==="gate"){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}save();AU.sfx("level");toast("ปลดล็อกปีที่ 2 แล้ว!");return;}
  if(R.k==="loy"){const t=todayStr();if(!evTest()){if(t<R.from){toast("โค้ดนี้จะเปิดใช้วันที่ 18 พ.ย. ติดตามประกาศที่เพจและ Discord นะ");return;}/* v1.89.19: the Loy Krathong code stays redeemable after the festival (only the gacha machine is seasonal) */}
    if(loyOf(G)){toast("เซฟนี้ใช้โค้ดนี้ไปแล้ว ดูจดหมายเชิญในกล่องจดหมายได้เลย");return;}
    G.ev=G.ev||{};G.ev.loy={got:G.week,season:G.season||1,best:0,tiers:{},runs:0};
    addMail(G,{kind:"event",ev:"loy",from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:"คืนนี้งานลอยกระทงตลาดน้ำ!",body:"ผู้จัดการจ๋า คืนนี้ป้าไปเปิดแผงขายกระทงที่งานตลาดน้ำ พาเด็ก ๆ ในค่ายมาเที่ยวกันนะ มีของกินเพียบ ป้าเลี้ยงส้มตำเอง! แต่ได้ยินว่าแก๊งหมวกกันน็อกจะมาป่วนงานด้วย… ถ้ามากันได้ป้าอุ่นใจขึ้นเยอะเลย"});
    G.chatIn=G.chatIn||{};for(const id of CANON_IDS){const f=G.F[id];if(f&&f.met&&(f.bond||0)>=8&&!G.chatIn[id])G.chatIn[id]=G.week;}
    save();AU.sfx("level");toast("ได้รับจดหมายเชิญอีเวนต์ลอยกระทง! ดูที่กล่องจดหมาย");}}
/* v1.89.26: fetch the event's art up front (sprites, specials, ring art, portraits) so the first scene and bout don't pop in */
function loyPreload(){if(loyPreload.done)return;loyPreload.done=1;try{
  for(const id of ["kati","mali","rin","ploy","fah"]){img(id+"_loykrathong_sheet.webp");img(id+"_loykrathong_special.webp");for(const m of ["happy","flustered","angry","sad"])warm(stand(id,"thai",m));}
  img("mali_loykrathong_dodge.webp");for(const s of ["gang1","gang2","gang3","gangsilver","gang4","gang5","thief","thief2"])img(s+"_sheet.webp");
  for(const b of ["bg_loy_ring.webp","bg_loy_night.webp","bg_river.webp","bg_river_dawn.webp"])img(b);
  for(const n of ["gang_group","gang_silver","gang_goldblack","gang_boss","gang_boss_face","thief","thief2","vendor_red"])warm(`${ASSET}npc_${n}.webp`);}catch(e){}}
function evMailAct(m){loyPreload();if(m.ev==="dress"){const f=G.F[m.fid],L=loyOf(G);if(!f||!L)return "";const has=L.dress&&L.dress[f.id];
    return has?(f.camp==="player"?`<p class="meta center">รับชุดแล้ว</p><button class="btn" data-act="loydresswear" data-v="${f.id}">${f.outfit==="loy"?"ใส่อยู่":`ใส่ชุดนี้ให้${esc(f.name)}`}</button>`:`<p class="meta center">รับชุดแล้ว · ใส่ได้เมื่อ${esc(f.name)}เข้าค่าย</p>`)
      :`<button class="btn primary" data-act="loydress1" data-v="${m.id}">รับชุดไทยของ${esc(f.name)}</button>`;}
  if(m.ev==="tuy"){const L=loyOf(G);return m.done||!L||!tuyReady(G)?`<p class="meta center">ไล่จับไอ้ตุ๋ยแล้ว</p>`:m.expired?"":`<button class="btn primary" data-act="tuy">ไปไล่จับไอ้ตุ๋ย</button>`;}
  if(m.ev==="thief"){const L=loyOf(G);return m.done||!L||!thiefReady(G)?`<p class="meta center">ไล่จับไอ้ตุ่มแล้ว</p>`:m.expired?"":`<button class="btn primary" data-act="thief">ไปไล่จับไอ้ตุ่ม</button>`;}
  if(m.ev==="kongka"){const B=KONGKA[m.wish];return B?(m.done?`<p class="meta center">รับพรแล้ว · ${B.n}</p>`:`<button class="btn primary" data-act="kongka" data-v="${m.id}">รับพร · ${B.d}</button>`):"";}
  const L=loyOf(G);if(!L)return "";const tr=loyTier(L.best,L.boss);const T=L.tiers||{};
  const ends=["bronze","silver","gold"].filter(k=>T[k]).map(k=>`<button class="btn sm" data-act="loyend" data-v="${k}">ฉากจบ${LOY_TIERS.find(x=>x[0]===k)[1]} · ${LOY_END[k].t}</button>`).join("");
  return `${L.runs?`<p class="meta center">คะแนนดีที่สุด <b class="goldt num">${L.best}</b>${tr?` · รางวัลระดับ<b>${tr.n}</b>`:""}</p>`:""}<button class="btn primary" data-act="evloy">${L.runs?"ท้าศึกริมน้ำอีกรอบ":"ไปงานลอยกระทง"}</button>
  ${tuyOn(G)?`<button class="btn gold" data-act="tuy" ${!tuyReady(G)?"disabled":""}>${!tuyReady(G)?"ไล่จับไอ้ตุ๋ยแล้ว (พรุ่งนี้มาอีก)":"ไล่จับไอ้ตุ๋ย หน้ากากแดง"}</button>`:""}
  ${thiefOn(G)?`<button class="btn" data-act="thief" ${!thiefReady(G)?"disabled":""}>${!thiefReady(G)?`ไล่จับไอ้ตุ่มแล้ว (${thiefAgain(G)})`:"ไล่จับไอ้ตุ่ม โจรงมกระทง"}</button>`:`<p class="meta center">ไอ้ตุ่มจะกลับมาช่วงลอยกระทงในเกม (สัปดาห์ ${THIEF_WK[0]}–${THIEF_WK[1]} ทุกปี) ป้าแต๋วจะส่งจดหมายมาบอก</p>`}
  ${L.intro?`<div class="evrep"><button class="btn sm" data-act="loyintro">ดูฉากเปิดอีกครั้ง</button>${ends}${loyCanFloat(L)?`<button class="btn sm gold" data-act="loywishopen">🪷 ไปลอยกระทงกับสาว ๆ</button>`:""}</div>`:""}
  ${L.wish?`<p class="meta center">คำอธิษฐานของผู้จัดการ: "${esc((LOY_WISH.find(w=>w.k===L.wish)||{}).t||"")}"</p>`:""}
`;} /* v1.91.97: the "Thai dress off the ring" toggle is gone with the feature */
function loyIntro(G){const S=[
  {n:"nar",bg:"loy_night",t:"คืนวันเพ็ญเดือนสิบสอง ตลาดน้ำริมปิงคึกคักกว่าทุกปี เรือขายกระทงจอดเรียงริมตลิ่ง แสงเทียนสะท้อนน้ำวิบวับ"},
  {n:"npc",who:"ป้าแต๋ว",t:"มาแล้วเหรอผู้จัดการ! ป้าขนชุดไทยของลูกสาวป้ามาให้เด็ก ๆ ใส่เที่ยวงาน ไปเปลี่ยนเร็ว ๆ!"},
  {n:"nar",t:"สิบนาทีต่อมา"},
  {n:"kati",f:"flustered",l:"thai",t:"ผู้จัดการ… ชุดนี้รัดเอวจังเลยค่ะ หนูดูแปลกไหม …อย่ามองนานสิคะ!"}];
  if(inCamp(G,"mali"))S.push({n:"mali",f:"happy",l:"thai",t:"กะทิสวยจะตาย! มะลิช่วยกลัดสไบให้เองเลยนะ~ ส่วนของมะลิก็… สวยใช่ไหมคะ ผู้จัดการ"});
  if(inCamp(G,"rin"))S.push({n:"rin",f:"flustered",l:"thai",t:"ผ้าถุงจำกัดการก้าวขาเหลือราวสี่สิบเซนติเมตร ไม่เหมาะกับการต่อสู้ …แต่ก็ไม่ได้แย่"});
  if(G.F.ploy){if(inCamp(G,"ploy"))S.push({n:"ploy",f:"flustered",l:"thai",t:"…ป้าแต๋วบอกว่าสีม่วงเหมาะกับพี่ พี่ไม่แน่ใจ แต่จะไม่ถอดแล้ว"});
    else S.push({n:"nar",t:"ท่ามกลางฝูงคน มีหญิงสาวในชุดไทยสีม่วงยืนนิ่งอยู่หน้าแผงกระทงใบตอง พลอยจากค่ายคู่แข่ง"},{n:"ploy",f:"flustered",l:"thai",t:"…บังเอิญ พี่หนีงานถ่ายรูปสปอนเซอร์มาเดินเล่น ป้าแต๋วจับพี่แต่งชุดนี้ก่อนจะทันปฏิเสธ"});}
  if(G.F.fah){if(inCamp(G,"fah"))S.push({n:"fah",f:"happy",l:"thai",t:"ดูฟ้าสิ! ใส่ชุดไทยแล้วศอกยังไหลลื่น! ใครถ่ายรูปให้ฟ้าหน่อย!"});
    else S.push({n:"fah",f:"happy",l:"thai",t:"อ้าว ค่ายศิริชัย! ฟ้ามาเดินงานพอดีเลย ป้าแต๋วจับฟ้าแต่งชุดไทยด้วย ฮ่า ๆ สวยไหม!"});}
  S.push({n:"npc",who:"ป้าแต๋ว",t:"สวยกันทุกคนเลย! …แต่ดูนั่นสิ พวกหมวกกันน็อกมาอีกแล้ว"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",t:"ตลาดน้ำนี้ต้องจ่ายค่าที่ให้พวกเรา! ไม่จ่ายก็เก็บแผงกลับบ้านไปซะ ป้าส้มตำ!"},
  {n:"coach",t:"ใจเย็นก่อน อย่าเพิ่งมีเรื่องกลางงานวัด… ตลาดนี้มีเด็กกับคนแก่เต็มไปหมด"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",t:"ไม่อยากมีเรื่องก็ขึ้นเวทีข้างท่าเรือนั่น! ส่งมาสามคน ฝั่งข้าแปดคนกับตัวข้าเอง สู้ไม่ยั้ง ไม่มีพัก ถ้าค่ายแกชนะ แก๊งข้าไม่มาตลาดนี้อีก!"},
  {n:"kati",f:"happy",l:"thai",t:"รับคำท้าค่ะ! ป้าแต๋วบอกว่าผ้าถุงนี้ยืดได้ ใส่ต่อยก็ไม่ขาด! ผู้จัดการเลือกคนเลยค่ะ"});
  const gs=loyGuests(G);
  if(gs.some(f=>f.id==="ploy"))S.push({n:"ploy",f:"angry",l:"thai",t:"พี่ไม่ใช่คนค่ายคุณ …แต่ตลาดนี้พี่มาซื้อของทุกปี ถ้าขาดคน พี่ขึ้นให้"});
  if(gs.some(f=>f.id==="fah"))S.push({n:"fah",f:"happy",l:"thai",t:"ฟ้าด้วย! ต่อยแก๊งหมวกฟรี ไม่คิดค่าตัว! …ขอขนมครกสักถาดก็พอ"});
  if(gs.length)S.push({n:"nar",t:`${gs.map(f=>f.name).join("กับ")}มาช่วยในฐานะแขกรับเชิญ เลือกลงชกในศึกริมน้ำได้ ไม่มีผลกับค่ายจริง`});
  return S;}
/* v1.89.25: the rules as a popup (first time, and from the gauntlet header) */
function loyRulesHTML(){const T=LOY_TIERS,E=LOY_END;return `<h2>ศึกริมน้ำ · กติกา</h2>
  <ul class="glist lrules"><li>ส่งสาว 3 คน คนละ 3 ไฟต์ติดกัน พลังไม่ฟื้นเต็มระหว่างไฟต์ แพ้เมื่อไหร่คนถัดไปขึ้นแทน</li><li>ไฟต์ที่ 9 คือเสี่ยหมวกทองคำ (3 ยก)</li>
  <li><b>ฉากจบ 3 แบบตามคะแนน</b><div class="lrtier"><span class="pill">ทองแดง ${T[2][2]}</span>${E.bronze.t}</div><div class="lrtier"><span class="pill">เงิน ${fmtN(T[1][2])}</span>${E.silver.t}</div><div class="lrtier"><span class="pill gold">ทอง ${fmtN(T[0][2])} + ล้มเสี่ย</span>${E.gold.t}</div></li>
  <li>การ์ด SR ชุดไทย: ทองแดง 1 ใบ · เงิน 2 ใบ · ทอง 3 ใบ</li><li>แพ้ได้ เล่นซ้ำได้ไม่จำกัด ฉากจบที่ปลดแล้วดูซ้ำได้ในจดหมายเชิญ</li><li>จบศึกได้ระดับทองแดงขึ้นไป ได้ไปลอยกระทงกับสาว ๆ 1 ครั้ง · ได้ทองแล้วลอยได้ตลอด</li><li>ไฟต์ในศึกนี้ไม่บาดเจ็บ และไม่นับสถิติในเกมหลัก</li></ul>
  <div class="center endbtns"><button class="btn primary" data-act="loyrulesok">เข้าใจแล้ว</button></div>`;}
const fmtN=n=>Number(n).toLocaleString("en-US");
const LOY_END={
 bronze:{t:"แก๊งหมวกถอยทัพ",steps:[{n:"nar",bg:"loy_night",t:"ลูกน้องแก๊งหมวกถอยไปยืนออกันฝั่งตรงข้าม ยังไม่ยอมแพ้ แต่ก็ไม่กล้าเข้าใกล้แผงป้าแต๋วอีก"},
  {n:"npc",who:"ป้าแต๋ว",t:"เก่งมากลูก ๆ! ป้าขายกระทงได้อีกตั้งเยอะ คืนนี้ขนมครกป้าเลี้ยงเอง"}]},
 silver:{t:"ทั้งตลาดเชียร์",steps:[{n:"nar",bg:"loy_night",t:"คนทั้งตลาดน้ำมายืนล้อมเวทีชั่วคราว เสียงเชียร์ดังกลบเสียงพลุ"},
  {n:"coach",t:"ไม่เลวนี่หว่า… แต่ยังไม่ถึงตัวเสี่ยเลยนะเว้ย ปีนี้ยังมีเวลา"},
  {n:"npc",who:"ป้าแต๋ว",t:"ชุดไทยพวกนั้น ป้ายกให้เลย ใส่ไปไหนก็ได้ ป้าดีใจที่มันได้ใส่ไปทำเรื่องดี ๆ"}]},
 gold:{t:"หมวกทองลอยน้ำ",steps:[{n:"nar",bg:"loy_night",t:"เสี่ยหมวกทองคำล้มลงบนท่าเรือ หมวกทองกลิ้งตกน้ำ ลอยไปพร้อมกระทงอีกร้อยใบ"},
  {n:"nar",t:"ใต้หมวกทองคือชายผมเสยทองใส่แว่นดำ คาบซิการ์ ทั้งตลาดเพิ่งเคยเห็นหน้าจริงของเสี่ยเป็นครั้งแรก"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",img:"gang_boss_face",t:"หมวกข้า!! …อย่ามองหน้าข้า! ก็ได้ ๆ ตลาดน้ำนี้ข้าไม่มาอีกแล้ว ปีนี้นะ! ปีนี้!"},
  {n:"npc",who:"ป้าแต๋ว",t:"ป้าตัดชุดไทยเพิ่มให้ทุกคนแล้ว ใส่ไปเที่ยว ไปเดท ไปไหนก็ได้!"}],
  tail:[{n:"nar",t:"ชื่อค่ายศิริชัยถูกพูดถึงทั่วตลาดน้ำทั้งคืน และอีกหลายคืนหลังจากนั้น"}]}};
/* v1.89.24: the ending follows the three who fought — the first heroine sent is the lead, the others chip in */
const LOY_REACT={
 bronze:{kati:"ปีหน้าพวกนั้นมาอีกแน่ค่ะ หนูจะซ้อมให้หนักกว่านี้!",mali:"ผ้าถุงขาดนิดนึงค่ะ… ป้าแต๋วอย่าดุมะลินะ",rin:"ทองแดงคือระดับต่ำสุดในสามระดับ ฉันจดไว้แล้ว ปีหน้าจะไม่ใช่",ploy:"ยังไม่ถึงตัวหัวหน้า …ครั้งหน้าพี่จะไปให้ถึง",fah:"ยังไม่สะใจเลย! ไอ้หมวกทองยังไม่โดนสักดอก!"},
 silver:{kati:"ทั้งตลาดตะโกนชื่อหนู… ปู่ได้ยินไหมคะ",mali:"คนเชียร์เยอะขนาดนี้ มะลิอยากรำให้ดูอีกรอบเลย!",rin:"เสียงเชียร์ราวเก้าสิบเดซิเบล …ฉันไม่ได้ยิ้มนะ",ploy:"…พี่ไม่ชินกับเสียงเชียร์แบบนี้ แต่ก็ไม่ได้แย่",fah:"ได้ยินไหม! เขาเรียกชื่อฟ้า! ใครถ่ายคลิปไว้บ้าง!"},
 gold:{kati:"เราทำได้แล้วค่ะ! ป้าแต๋วไม่ต้องจ่ายค่าที่แล้ว!",mali:"หมวกทองลอยไปกับกระทงเลย~ ขอให้โชคร้ายลอยไปด้วยนะ",rin:"เก้าไฟต์ ไม่มีพัก ผลลัพธ์ตรงกับที่ฉันคำนวณไว้ …เกือบตรง",ploy:"ล้มหัวหน้าได้ …พี่ภูมิใจ แต่จะไม่พูดซ้ำ",fah:"เห็นไหม ฟ้าบอกแล้ว! ปีหน้าให้มันกลับมาอีก ฟ้าจะต่อยซ้ำ!"}};
const LOY_LEAD={
 bronze:{kati:[["nar","เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ กะทิก้มลงแกะให้ทั้งที่ชายผ้าถุงเปียก"],["flustered","มันเดินตามหนูมาค่ะ ผู้จัดการ… ไม่ยอมไปเลย เลี้ยงที่ค่ายได้ไหมคะ ได้นะคะ"]],
  mali:[["nar","เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ มะลิก้มลงแกะให้ ทั้งหัวเราะทั้งโดนงับนิ้ว"],["happy","มันชอบมะลิค่ะ! ผู้จัดการ เลี้ยงไว้ที่ค่ายนะคะ มะลิจะดูแลเอง~"]],
  rin:[["nar","เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ รินคุกเข่าแกะปมเชือกอย่างใจเย็น ปมละสามวินาที"],["flustered","ระหว่างรอหาบ้านให้มัน ฉันจะดูแลเอง ค่ายเรามีอ่างน้ำพอ …ไม่ได้ผูกพันอะไรนะ"]],
  ploy:[["nar","เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ พลอยแกะให้โดยไม่พูดสักคำ ลูกนากปีนขึ้นแขนเธอทันที"],["flustered","…มันไม่ยอมลง ที่ค่ายมีที่ให้มันอยู่ใช่ไหม"],["flustered","…มันไม่ยอมลง ค่ายพี่ไม่ให้เลี้ยงสัตว์ ฝากคุณได้ไหม พี่จะแวะไปดูบ้าง"]],
  fah:[["nar","เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ ฟ้ากระโดดลงน้ำไปแกะทั้งชุดไทย"],["happy","ได้แล้ว! เปียกหมดเลย แต่คุ้ม! เลี้ยงที่ค่ายนะ ฟ้าให้อาหารเอง!"],["happy","ได้แล้ว! เลี้ยงที่ค่ายคุณไปเลย ฟ้าจะแวะไปเยี่ยมทุกอาทิตย์ อ้างว่ามาหานากนี่แหละ!"]]},
 silver:{kati:[["flustered","ผู้จัดการคะ… ป้าแต๋วให้กระทงมาใบนึง ไปลอยด้วยกันไหมคะ …ใบเดียวค่ะ ป้าให้มาแค่ใบเดียว"]],
  mali:[["happy","ผู้จัดการคะ ป้าแต๋วให้กระทงมาใบนึง ลอยด้วยกันนะคะ มะลิอธิษฐานไว้แล้ว แต่ไม่บอกหรอก~"]],
  rin:[["flustered","ป้าแต๋วให้กระทงมาหนึ่งใบ คนสองคน กระทงหนึ่งใบ …ทางคณิตศาสตร์ ต้องลอยด้วยกัน"]],
  ploy:[["flustered","ป้าให้กระทงมา… พี่ไม่เคยลอยกับใคร ลองดูด้วยกันไหม"]],
  fah:[["happy","กระทงใบเดียว! ไปลอยกันสองคน ใครแย่งฟ้าโดนศอก!"]]},
 gold:{kati:[["flustered","…ผู้จัดการ หนูใส่ชุดนี้ไปเดทได้ไหมคะ …ไม่ใช่เดท! ไปเที่ยว! ไปเที่ยวค่ะ!"]],
  mali:[["flustered","ชุดนี้ใส่ไปเดทได้ไหมคะ… มะลิถามจริงนะ ไม่ได้แกล้ง~"]],
  rin:[["flustered","ถ้าใส่ชุดนี้ออกไปข้างนอกกับคุณ ข้อมูลบอกว่าน่าจะไม่แย่ …นั่นไม่ใช่คำเชิญนะ"]],
  ploy:[["flustered","ชุดนี้ป้าให้พี่แล้ว …ถ้าว่าง พาพี่มาเดินตลาดน้ำอีกรอบได้ไหม ตอนที่ไม่มีใครต่อยกัน"]],
  fah:[["happy","ชุดนี้ใส่ไปเดทได้! ใช่! ฟ้าพูดคำว่าเดทแล้ว! ไม่ถอนคำด้วย!"]]}};
function loyCastOf(cast){const ids=[...new Set(cast||[])].filter(id=>LOY_REACT.gold[id]&&G.F[id]);return ids.length?ids:["kati"];}
function loyLeadOf(cast){return loyCastOf(cast)[0];}
/* v1.89.31: beat the boss but missed the gold score — the bronze/silver ending says so instead of "not even close to the boss" */
const LOY_BOSS_DOWN={bronze:[{n:"nar",bg:"loy_night",t:"เสี่ยหมวกทองคำล้มลงกลางเวที แต่ลูกน้องที่ยังไม่มีใครล้มได้ยืนออกันเต็มท่าเรือ เสี่ยลุกขึ้นปัดฝุ่น แล้วพาลูกน้องถอยไปอีกฝั่ง ยังไม่ยอมแพ้"},
  {n:"npc",who:"ป้าแต๋ว",t:"เก่งมากลูก ๆ! ล้มเสี่ยได้ด้วย! ป้าขายกระทงได้อีกตั้งเยอะ คืนนี้ขนมครกป้าเลี้ยงเอง"}],
 silver:{coach:"ล้มเสี่ยได้ด้วยนี่หว่า! …แต่คะแนนยังไม่พอให้มันยอมทั้งแก๊งนะเว้ย คราวหน้าต้องชนะให้ขาดกว่านี้"}};
function loyEndSteps(k,cast,boss){const E=LOY_END[k],ids=loyCastOf(cast),lead=ids[0];let S=[...E.steps];
  if(boss&&k==="bronze")S=[...LOY_BOSS_DOWN.bronze];if(boss&&k==="silver")S=S.map(x=>x.n==="coach"?{n:"coach",t:LOY_BOSS_DOWN.silver.coach}:x);
  for(const id of ids.slice(1,3))S.push({n:id,f:"happy",l:"thai",t:LOY_REACT[k][id]});
  if(ids.length===1)S.push({n:lead,f:"happy",l:"thai",t:LOY_REACT[k][lead]});
  const L=LOY_LEAD[k][lead]||LOY_LEAD[k].kati,guest=isLoyGuest(G.F[lead]);
  L.forEach((x,i)=>{if(x[0]==="nar"){S.push({n:"nar",t:x[1]});return;}
    if(L.length===3&&i===(guest?1:2))return;S.push({n:lead,f:x[0],l:"thai",t:x[1]});});
  return S.concat(E.tail||[]);}
const LOY_THIEF={name:"ไอ้ตุ่ม โจรงมกระทง",
 line:{kati:"ขอคืนเดี๋ยวนี้ค่ะ! กระทงใบนั้นของยายบ้านข้าง ๆ หนู!",mali:"กระทงใบนั้นมะลิช่วยป้าพับนะคะ! เอาคืนมา!",rin:"ฉันนับไว้แล้ว นายเอาไปสิบเจ็ดใบ คืนมาให้ครบ",ploy:"ชุดนี้ป้าให้มา เปียกไม่ได้ …แต่ถ้าต้องลงไปงมเอง พี่ก็ไม่ลังเล",fah:"ฟ้าเห็นนายตั้งแต่ปีที่แล้ว! คราวนี้ไม่รอดแน่!"},
 pre:[{n:"nar",bg:"loy_night",t:"ตูม! มีคนกระโดดลงน้ำ งมเหรียญจากกระทงของชาวบ้านใส่ถุงพลาสติกเต็มมือ"},
  {n:"npc",who:"ป้าแต๋ว",t:"ไอ้ตุ่มอีกแล้ว! งมเหรียญจากกระทงคนอื่นทุกปี ปีนี้หอบไปทั้งกระทงเลย!"},
  {n:"npc",who:"ไอ้ตุ่ม โจรงมกระทง",t:"กระทงลอยมาหาข้าเอง ข้าก็เก็บสิ! อยากได้คืนก็ขึ้นมาบนท่าเรือนี่!"}],
 win:[{n:"nar",bg:"loy_night",t:"ไอ้ตุ่มตกน้ำดังตูม ถุงเหรียญลอยเท้งเต้ง ชาวบ้านช่วยกันเก็บไปคืนวัด"},
  {n:"npc",who:"ป้าแต๋ว",t:"เก่งมากลูก! ป้าทอดขนมครกให้ทั้งทีมเลย กินให้อิ่มก่อนกลับนะ"}],
 lose:[{n:"nar",bg:"loy_night",t:"ไอ้ตุ่มหัวเราะแล้วกระโดดน้ำหนีพร้อมถุงเหรียญ… แต่ถุงขาดกลางน้ำ เหรียญจมหมด"},
  {n:"npc",who:"ไอ้ตุ่ม โจรงมกระทง",t:"เฮ้ย! เหรียญข้า!! …ปีหน้าเจอกันใหม่!"},{n:"npc",who:"ป้าแต๋ว",t:"ช่างมันลูก อย่างน้อยมันก็ไม่ได้อะไรไป"}]};
const LOY_TUY={name:"ไอ้ตุ๋ย หน้ากากแดง",
 pre:[{n:"nar",bg:"loy_night",t:"กลางดึก มีเงาคนคลุมหน้าด้วยหมวกไหมพรมสีแดง แบกกระสอบกระทงทั้งใบวิ่งเลาะริมตลิ่ง"},
  {n:"npc",who:"ป้าแต๋ว",t:"นั่นไอ้ตุ๋ย น้องไอ้ตุ่ม! พี่มันโดนจับบ่อยเลยส่งน้องมาแทน คราวนี้เอาไปทั้งกระสอบเลย!"},
  {n:"npc",who:"ไอ้ตุ๋ย หน้ากากแดง",t:"พี่ตุ่มมันอ่อน ข้าไม่เหมือนพี่หรอก ใครแน่ก็ขึ้นมาเอาคืนบนท่าเรือนี่สิ!"}],
 win:[{n:"nar",bg:"loy_night",t:"ไอ้ตุ๋ยล้มหงายกลางท่าเรือ หมวกไหมพรมเลื่อนลงมาปิดตา กระสอบกระทงกลิ้งคืนมาทั้งใบ"},
  {n:"npc",who:"ไอ้ตุ๋ย หน้ากากแดง",t:"…อย่าบอกพี่ตุ่มนะว่าข้าแพ้!"},
  {n:"npc",who:"ป้าแต๋ว",t:"สองพี่น้องนี่เหมือนกันจริง ๆ เก่งมากลูก ขนมครกถาดใหญ่เลย!"},{n:"npc",who:"ป้าแต๋ว",t:"ชาวบ้านฝากค่าน้ำร้อนน้ำชามาให้ค่ายด้วยนะลูก รับไว้เถอะ"}],
 lose:[{n:"nar",bg:"loy_night",t:"ไอ้ตุ๋ยดีดเหรียญขึ้นฟ้า รับไว้ได้พอดี แล้วหายไปในความมืดพร้อมกระสอบ"},
  {n:"npc",who:"ไอ้ตุ๋ย หน้ากากแดง",t:"พรุ่งนี้ข้ามาอีก! ไปซ้อมมาใหม่นะ!"},{n:"npc",who:"ป้าแต๋ว",t:"ไม่เป็นไรลูก พรุ่งนี้มันมาอีกแน่ ป้าจะรอดู"}]};
function evStartLoy(){const L=loyOf(G);if(!L)return;if(L.thiefFrom==null){L.thiefFrom=absWeek(G);thiefMail(G);}loyPreload();UI.modal=null;
  const open=()=>{L.run=null;L.pick=[];UI.modal={type:L.rulesSeen?"gaunt":"loyrules"};render();};
  if(!L.intro){L.intro=1;save();playScene(loyIntro(G),open,{bg:"loy_night",look:"thai"});}else open();}
/* v1.89.24: Ploy / Fah join as guests when they are not in the camp yet — event-only, nothing carries back */
const LOY_GUESTS=["ploy","fah"];
const loyGuests=G=>LOY_GUESTS.map(id=>G.F[id]).filter(f=>f&&f.camp!=="player");
const loyCanFloat=L=>!!L&&!!(L.floatTok||(L.tiers&&L.tiers.gold)); /* v1.90.6: a float per finished run, or any time once gold is won */
const isLoyGuest=f=>f&&LOY_GUESTS.includes(f.id)&&f.camp!=="player";
/* v1.90.4: a guest (Ploy / Fah not yet in the camp) fights at about the camp's top-three level in the event — a copy for the bout only, her real stats stay untouched */
const LOY_GUEST_ADJ={ploy:-.6,fah:2}; /* sim-tuned so a guest in slot 3 wins about as often as our own girls (Ploy's kit is strong at equal stats, Fah's is not) */
function loyBoost(f,opp){if(!isLoyGuest(f))return f;
  const t=campPow(G)+(opp?0:LOY_GUEST_ADJ[f.id]||0),d=t-ovr(f.a);const a={};for(const k in f.a)a[k]=typeof f.a[k]==="number"?Math.max(3,Math.min(19.5,f.a[k]+d)):f.a[k];return {...f,a,lvl:campLv(G)};}
function gauntPool(){const R=roster(G).filter(f=>!f.injury);return (R.length?R:roster(G)).concat(loyGuests(G));}
// v1.82.4: the five riverside SR cards as a collection row — owned cards in colour, missing ones dark, with a "play again" nudge
function loyCardRow(after){const own=G.cards||{},got=LOY_CARDS.filter(k=>own[k]).length,left=LOY_CARDS.length-got;
  const row=LOY_CARDS.map(k=>{const C=CARDS[k],has=!!own[k];return `<div class="ccard pxc lk ${has?"":"lock"}" style="--rc:${CARD_R.SR.c}" title="${has?esc(C.t):"ยังไม่ได้"}">${cardArtHTML(C,true)}<small>${has?esc(G.F[C.c].name):"?"}</small></div>`;}).join("");
  const msg=!left?`<b class="goldt">เก็บการ์ด SR ชุดไทยครบ ${LOY_CARDS.length} ใบแล้ว!</b> ฉากจบทั้งหมดดูซ้ำได้ในจดหมายเชิญ · จบศึกระดับทองแดงขึ้นไป ได้ไปลอยกระทงกับสาว ๆ อีกครั้ง`
    :after?`<b>ยังขาดอีก ${left} ใบ</b> · ศึกนี้เล่นซ้ำได้ไม่จำกัด กด "ท้าอีกรอบ" เพื่อเก็บให้ครบ · ส่งสาวที่ยังไม่มีการ์ดลงชกก่อน จะได้การ์ดของเธอ`
    :`<b>การ์ด SR ชุดไทย ${got}/${LOY_CARDS.length}</b> · จบศึกระดับทองแดงได้ 1 ใบ เงิน 2 ใบ ทอง 3 ใบ · ส่งสาวคนไหนลงชกก่อน จะได้การ์ดของคนนั้นก่อน · เล่นซ้ำได้จนครบ`;
  return `<div class="lkrow"><div class="lkcards">${row}</div><p class="meta">🎴 ${msg}</p></div>`;}
function gauntHTML(){const L=loyOf(G);if(!L){UI.modal=null;return "";}const R=L.run;
  const head=`<h2>ศึกริมน้ำคืนลอยกระทง</h2><p class="meta">สามคน คนละสามไฟต์ติด พลังไม่ฟื้นเต็มระหว่างไฟต์ แพ้เมื่อไหร่คนถัดไปขึ้นแทน · ไฟต์สุดท้ายคือเสี่ยหมวกทองคำ · ฉากจบ 3 แบบตามคะแนน เล่นซ้ำได้ไม่จำกัด <button class="btn sm ghost" data-act="loyrules">กติกา</button></p>${!R?loyCardRow():""}`;
  const ladder=(cur)=>`<div class="gl">${LOY_LADDER.map((k,i)=>{const lg=R&&R.log[i];const st=lg?(lg.res==="W"?"ok":lg.res==="D"?"dr":"ng"):R&&i===cur?"now":"";
    return `<div class="glr ${st}"><canvas width="40" height="40" data-qsprite="${QK[k].sprite}"></canvas><span><b>${i+1}. ${esc(QK[k].name)}</b><small>${lg?lg.txt:R&&(R.done||i<cur)?"ข้าม (คนก่อนหน้าแพ้)":i===8?"บอส · 3 ยก":"2 ยก"}</small></span><i>${lg?(lg.res==="W"?"+"+lg.pts:lg.res==="D"?"+"+lg.pts:"✕"):""}</i></div>`;}).join("")}</div>`;
  if(!R){const pool=gauntPool(),P=L.pick||[];const need=Math.min(3,pool.length);
    return head+`<p><b>เลือกลำดับนักมวย</b> <small class="meta">(${P.length}/${need}) แตะเรียงคนขึ้นก่อน–หลัง</small></p><div class="gpick">${pool.map(f=>{const i=P.indexOf(f.id);
      return `<button class="gpk ${i>=0?"on":""}" data-act="gpick" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>${isLoyGuest(f)?"แขกรับเชิญ · ":""}Lv.${f.lvl}</small></span>${i>=0?`<i>${i+1}</i>`:""}</button>`;}).join("")}</div>
      ${pool.length<3?`<p class="meta">ค่ายมีนักมวยไม่ถึงสามคน คนที่มีจะได้ขึ้นซ้ำ (พลังเต็มทุกรอบที่ขึ้นใหม่)</p>`:""}
      <div class="center endbtns"><button class="btn primary" data-act="gstart" ${P.length<need?"disabled":""}>เริ่มศึก</button><button class="btn" data-act="closeModal">ไว้ก่อน</button></div>${ladder(-1)}`;}
  if(R.done){const tr=loyTier(R.score,R.boss);return head+`<div class="gres2"><p class="meta">คะแนนรวม</p><p class="gsc num">${R.score}</p>${tr?`<span class="pill gold">รางวัลระดับ${tr.n}</span>`:`<span class="pill">ยังไม่ถึงระดับรางวัล (ทองแดง ${LOY_TIERS[2][2]})</span>`}
    ${(R.got||[]).length?`<ul class="glist">${R.got.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}${loyCardRow(1)}<p class="meta">ดีที่สุด ${L.best} · ทอง ${LOY_TIERS[0][2]}+ และต้องล้มเสี่ยหมวกทองคำ</p></div>
    <div class="center endbtns">${R.newEnd?`<button class="btn gold" data-act="loyend" data-v="${R.newEnd}">ดูฉากจบ (ใหม่!)</button>`:loyCanFloat(L)&&L.wish?`<button class="btn gold" data-act="loyfloat">🪷 ไปลอยกระทง</button>`:""}<button class="btn primary" data-act="gretry">ท้าอีกรอบ</button><button class="btn" data-act="closeModal">กลับค่าย</button></div>${ladder(-1)}`;}
  const f=G.F[R.order[R.slot]];
  return head+`<div class="gnow"><p class="meta">คะแนน <b class="goldt num">${R.score}</b> · คนที่ ${R.slot+1}/3 · ไฟต์ที่ ${R.k+1}/9</p>
    <div class="gcur">${faceImg(f)}<span><b>${esc(f.name)}</b><small>พลัง ${Math.round(R.hp)} · แรง ${Math.round(R.sta)}</small><div class="meter"><i style="--v:${clamp(R.hp,0,100)}%;--bc:${R.hp>50?"var(--green)":R.hp>25?"var(--warn)":"var(--red)"}"></i></div></span></div></div>
    <div class="center endbtns"><button class="btn primary" data-act="gfight">ขึ้นชกไฟต์ที่ ${R.k+1}</button><button class="btn" data-act="gquit">ยอมจบศึก (เก็บคะแนนที่ได้)</button></div>${ladder(R.k)}`;}
/* v1.89.24: short lines between bouts — each helmet's first taunt, the hand-over when the next girl steps in, and the boss's own entrance */
const LOY_TAUNT={gang1:"ผู้หญิงใส่ผ้าถุงมาต่อยเหรอ? ฮ่า ๆ เดี๋ยวก็ลื่นล้มเองแหละ!",gang2:"แจ็กเก็ตตัวนี้แพงกว่าแผงป้าแต๋วทั้งแผงนะ อย่าให้เลือดเปื้อนล่ะ",
 gang3:"สองคนแรกมันแค่ลูกกระจ๊อก ฉันคือรองหัวหน้า หมวกดำแดงไม่เคยถอยให้ใคร",gang4:"หมวกเงินใบนี้ขัดทุกเช้า ไม่เคยมีรอยหมัดสักรอย คืนนี้ก็จะไม่มี",
 gang6:"จะไปถึงตัวเสี่ย ต้องผ่านมือขวาอย่างฉันก่อน และยังไม่เคยมีใครผ่าน"};
const LOY_BOSS_IN=[{n:"nar",t:"ลูกน้องแหวกทางให้ เสี่ยหมวกทองคำเดินลงจากเรือ ถอดเสื้อคลุมขนเฟอร์โยนให้ลูกน้อง แหวนทองยังอยู่ครบทุกนิ้ว"},
 {n:"npc",who:"เสี่ยหมวกทองคำ",t:"ลูกน้องข้าแพ้ไปกี่คนข้าไม่นับ! คืนนี้ข้าจะเก็บค่าที่คืนด้วยมือตัวเอง!"}];
const LOY_BOSS_REPLY={kati:["angry","ปู่บอกว่ามวยมีไว้ปกป้องคนที่สู้ไม่ได้ คืนนี้หนูจะปกป้องตลาดนี้เองค่ะ!"],mali:["happy","แหวนเยอะขนาดนั้น ต่อยมาเจ็บแน่เลย… แต่มะลิไม่ให้โดนหรอก~"],
 rin:["angry","แรงหมัดคุณสูง แต่เท้าช้ากว่าลูกน้องทุกคน ฉันคำนวณไว้แล้ว"],ploy:["angry","…พูดเยอะ พี่ไม่ชอบ ขึ้นมาเลย"],fah:["happy","ในที่สุด! ฟ้ารอต่อยหมวกทองใบนั้นมาทั้งคืนแล้ว!"]};
const LOY_OUT={kati:["ขอโทษค่ะ… หนูไปต่อไม่ไหว ฝากด้วยนะ!","สามไฟต์ครบแล้วค่ะ! ต่อจากนี้ฝากด้วยนะ"],mali:["เจ็บจัง… มะลิฝากต่อนะ อย่าแพ้นะ~","มะลิทำครบแล้ว~ ตาเธอแล้วนะ!"],
 rin:["ผลลัพธ์ต่ำกว่าที่คาด ฝากแก้ตัวเลขให้ด้วย","สามไฟต์ ตามแผน ส่งต่อได้"],ploy:["…พลาด ฝากด้วย","ครบแล้ว ที่เหลือของเธอ"],fah:["โธ่เว้ย! ฟ้ายังไม่หายมันเลย… ต่อยแทนฟ้าที!","สามไฟต์สบาย ๆ! ใครต่อ มาแปะมือ!"]};
const LOY_IN={kati:"รับไม้ค่ะ! ต่อจากนี้หนูเอง!",mali:"แปะมือ~ มะลิมาแล้วจ้า",rin:"รับทราบ เริ่มจากตัวเลขที่เหลือ",ploy:"พักเถอะ พี่ต่อเอง",fah:"ถึงตาฟ้าแล้ว! ถอยไป ๆ!"};
const LOY_IN_GUEST={ploy:"พี่ไม่ใช่คนค่ายนี้ …แต่คืนนี้พี่ต่อยให้",fah:"แขกรับเชิญขอขึ้นเวที! คืนนี้ฟ้าต่อยฟรี!"};
function loyBanter(R,f){const S=[],kind=LOY_LADDER[R.k];R.seenK=R.seenK||{};
  if(R.slot>0&&R.j===0){const pid=R.order[R.slot-1],p=G.F[pid];if(p&&pid!==f.id){const prev=R.log[R.k-1],lost=!prev||prev.res==="L";
    S.push(LOY_OUT[pid]?{n:pid,f:lost?"sad":"happy",l:"thai",t:LOY_OUT[pid][lost?0:1]}:{n:"nar",t:`${p.name}เดินลงจากเวที แตะมือส่งต่อ`});
    const gin=isLoyGuest(f)&&LOY_IN_GUEST[f.id];S.push(LOY_IN[f.id]?{n:f.id,f:"angry",l:"thai",t:gin||LOY_IN[f.id]}:{n:"nar",t:`${f.name}ก้าวขึ้นเวทีแทน`});}}
  if(!R.seenK[kind]){R.seenK[kind]=1;
    if(kind==="gang5"){S.push(...LOY_BOSS_IN);const r=LOY_BOSS_REPLY[f.id];S.push(r?{n:f.id,f:r[0],l:"thai",t:r[1]}:{n:"nar",t:`${f.name}ไม่ตอบ แค่ยกการ์ดขึ้น`});}
    else if(LOY_TAUNT[kind])S.push({n:"npc",who:QK[kind].name,t:LOY_TAUNT[kind]});}
  return S;}
/* v1.89.24: the event's closing night — float krathongs with the five girls and make a wish (flavour only; nothing changes in the main game) */
const LOY_WISH=[
 {k:"safe",t:"ขอให้ทุกคนปลอดภัย ไม่เจ็บตัวตลอดปี",lines:[["kati","happy","หนูก็ขอเรื่องเดียวกันเลยค่ะ… ปู่คงยิ้มอยู่บนนั้นแน่ ๆ"],["ploy","happy","…ดี คำขอที่ดีที่สุดสำหรับนักมวย"]]},
 {k:"champ",t:"ขอให้ค่ายศิริชัยได้แชมป์",lines:[["fah","happy","ขอแบบนั้นต้องซ้อมให้หนักกว่าเดิมนะ! ฟ้าเอาด้วย!"],["rin","flustered","ความน่าจะเป็นยังไม่สูงพอ …แต่ฉันจะช่วยเพิ่มตัวเลขให้เอง"]]},
 {k:"together",t:"ขอให้ปีหน้าได้มาลอยกระทงด้วยกันครบทุกคน",lines:[["mali","happy","สัญญานะคะ~ ปีหน้ามาอีก ครบห้าคนเหมือนเดิม"],["ploy","flustered","…พี่จะมา"]]},
 {k:"heart",t:"ขอเรื่องหัวใจ (แอบขอในใจ)",heart:1}];
const LOY_WISH_HEART={kati:"…ผู้จัดการขออะไรคะ หน้าแดงเชียว …ไม่ต้องบอกก็ได้ค่ะ",mali:"ขออะไรน้า~ มะลิเดาได้นะ แต่ไม่พูดหรอก",
 rin:"การอธิษฐานไม่มีผลทางสถิติ …แต่ถ้าเป็นเรื่องเดียวกับที่ฉันขอ ก็ไม่เป็นไร",ploy:"…พี่ก็ขอเรื่องเดียวกัน ไม่ต้องถามว่าเรื่องอะไร",fah:"เฮ้! ทำไมยิ้มแบบนั้น! ขออะไรเกี่ยวกับฟ้าใช่ไหม!"};
/* v1.89.24: the wish is answered — a letter from Phra Mae Khongkha with one real blessing, once per year */
const KONGKA={safe:{n:"พรแห่งสายน้ำเย็น",d:"ความล้าของนักมวยทุกคนในค่าย −20",fx:(G,m)=>roster(G).forEach(f=>f.fatigue=clamp((f.fatigue||0)-20,0,100))},
 champ:{n:"พรแห่งชัยชนะ",d:"กำลังใจนักมวยทุกคนในค่าย +10",fx:(G,m)=>roster(G).forEach(f=>f.morale=clamp((f.morale||0)+10,0,100))},
 together:{n:"พรแห่งความอุดม",d:"เงินเข้าค่าย ฿10,000",fx:(G,m)=>{G.cash+=10000;}},
 heart:{n:"พรแห่งหัวใจ",d:"ความสนิทกับคนที่หันมามอง +3",fx:(G,m)=>{if(m.hid&&G.F[m.hid])add(G,m.hid,"bond",10); /* add() scales by BOND_MUL (.3) → about +3 */}}};
const kongkaReady=G=>{const L=loyOf(G);return !!L&&L.kongkaS!==(G.season||1);};
const loyWishIds=()=>["kati","mali","rin","ploy","fah"].filter(id=>G.F[id]);
function loyWishOpen(done){const L=loyOf(G);if(!L){done&&done();return;}UI.lwDone=done||null;UI.lwSkip=false;UI.lwT0=performance.now();UI.modal={type:"loywish"};AU.startMusic&&AU.startMusic("date");render();}
function loyWishHTML(){const ids=loyWishIds(),T=LW_TL(ids.length),now=UI.lwSkip?" now":"",L=loyOf(G),prev=L&&L.wish&&LOY_WISH.find(w=>w.k===L.wish);
  if(UI.modal.ph==="float")return `<h2>ลอยกระทงริมน้ำ</h2><div class="cfxwrap ctwrap" data-act="lwfloatdone" role="button" aria-label="ไปต่อ"><canvas class="campcv" width="640" height="360" data-loywish="${ids.join(",")}"></canvas></div><p class="meta center">กระทงของผู้จัดการค่อย ๆ ลอยออกไปกลางน้ำ พลุชุดใหญ่จุดขึ้นฟ้าพอดี</p>`;
  return `<h2>ลอยกระทงริมน้ำ</h2><div class="cfxwrap ctwrap" data-act="lwskip" role="button" aria-label="ข้ามฉาก"><canvas class="campcv" width="640" height="360" data-loywish="${ids.join(",")}"></canvas></div>
   <p class="meta center lwq wkgo${now}" style="${"--d:"+T.end+"ms"}">กระทงห้าใบลอยออกไปกลางน้ำ ถึงตาผู้จัดการอธิษฐานบ้างแล้ว${prev?` · ครั้งก่อนขอไว้ว่า "${esc(prev.t)}"`:""}</p>
   <div class="lwopts">${LOY_WISH.map(w=>`<button class="btn wkgo${now}" style="${"--d:"+T.end+"ms"}" data-act="loywish" data-v="${w.k}">${esc(w.t)}</button>`).join("")}</div>

   <div class="mfoot"><button class="btn wkgo${now}" style="${"--d:"+T.end+"ms"}" data-act="lwclose">ไว้ก่อน</button></div>`;}
function loyWishPick(k){const W=LOY_WISH.find(w=>w.k===k),L=loyOf(G);if(!W||!L)return;L.wish=k;L.wishN=(L.wishN||0)+1;L.floatTok=0;const bless=kongkaReady(G);
  UI.modal={type:"loywish",ph:"float"};UI.lwSkip=true;UI.lwF0=performance.now();AU.sfx&&AU.sfx("level");render();
  UI.lwGo=()=>{UI.lwGo=null;UI.lwF0=0;UI.modal=null;loyWishScene(W,L,bless,k);};setTimeout(()=>{if(UI.lwGo)UI.lwGo();},3800);}
function loyWishScene(W,L,bless,k){
  const S=[{n:"nar",bg:"loy_night",t:`คุณหลับตา ประนมมือ แล้วอธิษฐานว่า "${W.t}"`}];let hid=null;
  if(W.heart){const ids=loyWishIds();const top=(G.romance&&ids.includes(G.romance)?G.romance:null)||ids.slice().sort((a,b)=>((G.F[b].bond||0)+(G.F[b].bondX||0))-((G.F[a].bond||0)+(G.F[a].bondX||0)))[0];
    hid=top;S[0].t="คุณหลับตา ประนมมือ แล้วอธิษฐานเงียบ ๆ ในใจ ห้าคนหันมามองพร้อมกัน";S.push({n:top,f:"flustered",l:"thai",t:LOY_WISH_HEART[top]});}
  else for(const [id,f,t] of W.lines)if(G.F[id])S.push({n:id,f,l:"thai",t});
  S.push({n:"nar",t:"เสียงพลุดังขึ้นอีกชุด กระทงห้าใบลอยเคียงกันไปจนลับโค้งน้ำ"});
  if(bless){const B=KONGKA[k];L.kongkaS=G.season||1;addMail(G,{kind:"event",ev:"kongka",wish:k,hid,from:"พระแม่คงคา",title:"จดหมายที่ลอยมากับสายน้ำ",
      body:`จดหมายใบตองพับเรียบร้อยลอยมาติดท่าน้ำหน้าค่ายตั้งแต่เช้ามืด กลิ่นดอกมะลิอ่อน ๆ · "กระทงของเจ้าลอยมาถึงข้าแล้ว พร้อมคำอธิษฐานว่า "${W.t}" ใจที่บริสุทธิ์ย่อมได้รับพร จงรับไว้เถิด" · ${B.n}: ${B.d}${k==="heart"&&hid&&G.F[hid]?` (${G.F[hid].name})`:""}`});}
  save();const done=UI.lwDone;UI.lwDone=null;playScene(S,()=>{AU.startMusic("hub");if(done)done();else render();},{bg:"river",look:"thai"});}
function gauntNextSlot(R){R.slot++;R.j=0;R.k=R.slot*3;R.hp=100;R.sta=100;if(R.slot>=3||R.k>=9)gauntFinish(R);}
function gauntFinish(R){const L=loyOf(G);R.done=true;L.runs=(L.runs||0)+1;L.best=Math.max(L.best||0,R.score);if(R.boss)L.boss=1;R.got=[];
  const tr=loyTier(R.score,R.boss);const order=["bronze","silver","gold"];
  if(tr)L.floatTok=1; /* v1.90.3: each run that reaches bronze+ earns one krathong float — no free replay button */
  if(tr){for(const k of order.slice(0,order.indexOf(tr.k)+1))if(!L.tiers[k]){L.tiers[k]=1;R.newEnd=k;L.endCast=L.endCast||{};L.endCast[k]=[...R.order];L.endBoss=L.endBoss||{};L.endBoss[k]=R.boss?1:0;R.got.push(...loyReward(k,R.order));}const nC={bronze:1,silver:2,gold:3}[tr.k]||1;for(let i=0;i<nC;i++){const c=loyCardDrop(G,R.order);if(c)R.got.push(c);else break;}}
  for(let i=0;i<9;i++)delete G.F["q_evloy_"+i];save();}
function loyReward(k,R0){const out=[];
  if(k==="bronze"){out.push("ป้าแต๋วจัดขนมครกให้ทั้งทีม (รางวัลในอีเวนต์)");if(typeof PETS!=="undefined"&&PETS.otter&&typeof adoptPet==="function"&&!hasPet(G,"otter")){adoptPet(G,"otter",null,(o=>G.F[o]&&G.F[o].camp==="player"?o:"kati")(loyLeadOf(R0)));{const L=loyOf(G);if(L)L.petPend=G.pets.length-1;}out.push("ลูกนากตัวน้อยตามกลับค่ายมาด้วย! (ตั้งชื่อได้หลังดูฉากจบ)");}}
  if(k==="silver"){out.push("ปลดล็อกชุดไทยในหน้าโปรไฟล์ตัวละคร");}
  if(k==="gold"){out.push("ป้ายชื่อ \"แชมป์ตลาดน้ำ\" ในหน้าอีเวนต์");if(typeof loyGold==="function"){const c=loyGold(G);if(c)out.push(c);}}
  return out;}
/* v1.89.27: the first bout a girl wins on the river ring, Auntie Taew sends her Thai dress by letter — a wearable pixel outfit for the main game (looks only) */
const LOY_DRESS_NOTE={kati:"ชุดสีแดงของกะทิ ป้าเย็บตะเข็บผ้าถุงใหม่ให้สองชั้นแล้ว คราวนี้ใส่ต่อยยังไงก็ไม่ขาดแน่นอน",mali:"ชุดฟ้าของมะลิ ป้าเห็นหนูแอบซ่อมชายผ้าเองตอนพักยก เลยเย็บซับในให้อีกชั้น",
 rin:"ชุดเขียวของริน ป้าวัดให้ใหม่ตามที่หนูจดมาเป๊ะ ๆ ก้าวขาได้กว้างขึ้นสิบสองเซนติเมตร",ploy:"ชุดม่วงของพลอย ป้าตั้งใจตัดให้ตั้งแต่ปีที่แล้ว เพิ่งได้ให้ เก็บไว้ใส่ตอนไม่ต้องถ่ายรูปให้ใครนะลูก",
 fah:"ชุดทองดำของฟ้า ป้าเย็บดิ้นทองเพิ่มให้ ฟ้าบอกว่าอยากให้คนดูกรี๊ดตอนออกศอก"};
function loyDressMail(G,f){const L=loyOf(G);if(!L||!f||!LOY_DRESS_NOTE[f.id])return;L.dress=L.dress||{};L.dressMail=L.dressMail||{};if(L.dress[f.id]||L.dressMail[f.id])return;L.dressMail[f.id]=1;
  addMail(G,{kind:"event",ev:"dress",fid:f.id,from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:`ชุดไทยของ${f.name}`,body:`${LOY_DRESS_NOTE[f.id]} · ใส่เป็นชุดพิกเซลในค่าย ตอนซ้อม และบนเวทีได้ เลือกได้ที่ตู้เสื้อผ้าของ${f.name}`});}
function gauntAfter(){const L=loyOf(G),R=L&&L.run,F=LASTF;if(!R||!F){UI.modal={type:"gaunt"};render();return;}
  const r=F.result,res=r.win==="D"?"D":r.win==="A"?"W":"L",rds=R.k===8?3:2;let pts=0,txt="";
  if(res==="W"){pts=100+(/KO|น็อก/.test(r.type||"")?60:0)+Math.max(0,rds-F.round)*30+Math.round(Math.max(0,F.A.hp)*.6);txt=/KO|น็อก/.test(r.type||"")?`ชนะน็อก ยก ${F.round}`:"ชนะคะแนน";if(R.k===8)R.boss=1;}
  else if(res==="D"){pts=30;txt="เสมอ";}else txt=/KO|น็อก/.test(r.type||"")?`แพ้น็อก ยก ${F.round}`:"แพ้คะแนน";
  R.log[R.k]={res,pts,txt};R.score+=pts;if(res==="W")loyDressMail(G,G.F[R.order[R.slot]]);
  if(res==="L")gauntNextSlot(R);
  else{R.hp=Math.min(100,Math.max(0,F.A.hp)+20); /* v1.90.4: +20 between bouts (was +15) now that HP comes back slower between rounds */R.sta=Math.min(100,Math.max(0,F.A.sta)+20);R.j++;R.k++;if(R.j>=3)gauntNextSlot(R);else if(R.k>=9)gauntFinish(R);}
  save();UI.modal={type:"gaunt"};render();}
Object.assign(ACT,{
  goldrematch:()=>{if(!goldRematchReady(G))return;const f=roster(G).find(f=>!f.injury);if(!f){toast("นักมวยทุกคนบาดเจ็บ");return;}G.gangRematchAt=campWeekIndex(G)+4;save();
    playScene([{n:"nar",bg:"gang_hq",t:"โกดังหลังตลาดเช้า ไฟสลัว ลูกน้องหมวกแดงนั่งล้อมโต๊ะแผนที่ พอเห็นค่ายศิริชัยเดินเข้ามา ทุกคนลุกพรวด"},{n:"npc",who:"เสี่ยหมวกทองคำ",t:"กล้ามาถึงถิ่นข้าเลยเหรอ! เคลียร์โกดังด้านใน วันนี้ข้าจะแก้มือเอง!"}],()=>startQuest({q:"gang",qk:"gang5",rematch:true},f.id,()=>{}),{bg:"gang_hq",look:"fight"});},
  redeem:()=>{const el=document.getElementById("redeemcode");redeemCode(el&&el.value);if(el)el.value="";render();},
  evloy:()=>evStartLoy(),
  gpick:d=>{const L=loyOf(G);if(!L)return;L.pick=L.pick||[];const i=L.pick.indexOf(d.v);if(i>=0)L.pick.splice(i,1);else if(L.pick.length<Math.min(3,gauntPool().length))L.pick.push(d.v);render();},
  gstart:()=>{const L=loyOf(G);if(!L)return;const P=L.pick||[];if(!P.length)return;const order=[0,1,2].map(i=>P[i%P.length]);
    L.run={order,slot:0,j:0,k:0,hp:100,sta:100,score:0,log:[],boss:0};save();render();},
  gfight:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;const f=G.F[R.order[R.slot]];const qid=evGang(G,R.k,loyBoost(f,1));
    const bk={id:"bev"+R.k,a:f.id,b:qid,week:G.week,tier:"evloy",rounds:R.k===8?3:2,ev:1,carry:{hp:R.hp,sta:R.sta},bg:"bg_loy_ring.webp"};
    UI.modal=null;const go=()=>openFight2(bk,gauntAfter),S=loyBanter(R,f);save();if(S.length)playScene(S,go,{bg:"loy_night",look:"thai"});else go();},
  gquit:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;gauntFinish(R);render();},
  loydress1:d=>{const m=(G.mail||[]).find(x=>x.id===d.v),L=loyOf(G);if(!m||!L)return;L.dress=L.dress||{};L.dress[m.fid]=1;m.done=true;AU.sfx&&AU.sfx("level");toast(`ได้รับชุดไทยคืนลอยกระทงของ${G.F[m.fid].name}`);save();render();},
  loydresswear:d=>{const f=G.F[d.v];if(!f||f.camp!=="player")return;f.outfit="loy";AU.sfx&&AU.sfx("ui");save();render();},
  loyrulesok:()=>{const L=loyOf(G);if(L)L.rulesSeen=1;save();UI.modal={type:"gaunt"};render();},
  loyrules:()=>{UI.modal={type:"loyrules"};render();},
  gretry:()=>{const L=loyOf(G);if(!L)return;L.run=null;L.pick=[];render();},
});

/* ===== v1.81: Loy Krathong round 2 — Thai-dress scenes, SR cards, the krathong thief, the otter, Thai dress off-stage ===== */
const LOY_CARDS=["lk_kati","lk_mali","lk_rin","lk_ploy","lk_fah"];
(()=>{
const LOY_HINT="อีเวนต์ลอยกระทง 2569 · ได้จากศึกริมน้ำ",LG_HINT="ตู้กาชาลอยกระทง · เปิดเฉพาะช่วงเทศกาล 18 พ.ย.–7 ธ.ค.";
const T=(n,f,t)=>({n,f,l:"thai",t}),N=t=>({n:"nar",t}),P=(who,t)=>({n:"npc",who,t});
Object.assign(CARDS,{
 lk_kati:{c:"kati",r:"SR",ev:1,t:"เด็กหลงในงานลอยกระทง",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("เสียงพลุดังสลับเสียงเพลงลูกทุ่งจากเวทีรำวง เด็กชายตัวเล็กยืนร้องไห้ข้างแผงลูกชิ้น มือกำกระทงขนมปังที่แหลกไปครึ่งใบ"),
  T("kati","sad","ผู้จัดการคะ เด็กคนนั้นยืนอยู่ตรงนั้นมาสิบนาทีแล้ว ไม่มีใครเข้าไปถามเลย"),
  N("ยังไม่ทันได้ตอบ กะทิก็เดินแหวกคนไปนั่งยอง ๆ ตรงหน้าเด็กแล้ว ชายผ้าถุงลากพื้นไปครึ่งศอก"),
  T("kati","happy","ไม่ร้องนะ พี่ชื่อกะทิ ส่วนพี่ผู้ชายคนนั้นชื่อผู้จัดการ ใจดีมาก ๆ เลย เราจะช่วยหาแม่ให้นะ"),
  P("เด็กชาย","แม่บอกให้รอตรงนี้… แต่กระทงหนูโดนเหยียบ แม่ต้องโกรธแน่เลย"),
  {choice:[{t:"\"เดี๋ยวพี่ซื้อกระทงใบใหม่ให้\"",fx:G=>{G.cash-=40;add(G,"kati","bond",2);},then:[N("คุณซื้อกระทงใบตองจากแผงข้าง ๆ ให้ เด็กชายหยุดร้องทันทีเหมือนมีคนกดปุ่ม"),T("kati","flustered","…ผู้จัดการรู้ไหมคะ ปู่ก็เคยซื้อกระทงให้หนูแบบนี้ ตอนหนูหลงในงานวัดเหมือนกัน")]},
   {t:"\"ขี่คอพี่กะทิสิ จะได้เห็นแม่\"",fx:G=>add(G,"kati","bond",3),then:[N("กะทิยกเด็กขึ้นบ่าโดยไม่ลังเล ผ้าถุงต้องถกขึ้นนิดหน่อย แต่เจ้าตัวไม่สนใจเลย"),T("kati","happy","สูงไหม! มองหาแม่เลย ตาไวกว่านักมวยพี่ก็ได้นะ!")]}]},
  P("เด็กชาย","เดี๋ยว… พี่คือคนที่ต่อยพวกหมวกกันน็อกบนเวทีริมน้ำใช่ไหม! เท่มากเลย! …อ๊ะ นั่นแม่! แม่ยืนอยู่ตรงเรือขายขนมครก!"),
  N("แม่ของเด็กวิ่งมาขอบคุณซ้ำ ๆ ก่อนจะยัดขนมครกใส่มือกะทิสองถุง"),
  P("เด็กชาย","พี่กะทิ… พี่ผู้ชายคนนั้นเป็นแฟนพี่เหรอ"),
  T("kati","flustered","ฮะ!? ไม่ใช่! เขาเป็นผู้จัดการ! …ยัง ไม่ใช่ …ไม่ใช่ค่ะ! ไปกับแม่ได้แล้ว!"),
  N("เด็กชายโบกมือลา ทิ้งกะทิหน้าแดงไว้กลางงาน ข้าง ๆ คุณ ขนมครกในมือยังอุ่นอยู่"),
  T("kati","flustered","…แบ่งกันคนละถุงนะคะ แล้วก็… ที่หนูพูดเมื่อกี้ อย่าเก็บไปคิดนะ หนูพูดผิดแค่คำเดียวเอง")]},
 lk_mali:{c:"mali",r:"SR",ev:1,t:"นางนพมาศจำเป็น",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ประกาศเรียกผู้เข้าประกวดนางนพมาศดังซ้ำเป็นรอบที่สาม หมายเลขเจ็ดไม่มาเพราะป่วยกะทันหัน"),
  N("ป้าแต๋วซึ่งนั่งเป็นกรรมการอยู่ หันมามองมะลิในชุดไทยสีทอง แล้วยิ้มแบบที่ทุกคนในตลาดรู้ว่าหนีไม่พ้น"),
  P("ป้าแต๋ว","มะลิ! หนูนั่นแหละ ชุดก็ใส่อยู่แล้ว ผมก็เกล้าแล้ว ขึ้นเวทีเลยลูก!"),
  T("mali","flustered","ห้ะ!? หนูเย็บผ้าเป็นอย่างเดียวนะคะป้า เดินแบบไม่เป็น! ผู้จัดการ ช่วยมะลิด้วย!"),
  {choice:[{t:"\"ขึ้นไปเถอะ ชุดนี้สวยที่สุดในงานแล้ว\"",fx:G=>add(G,"mali","bond",3),then:[T("mali","flustered","…ผู้จัดการพูดแบบนี้แล้วมะลิจะปฏิเสธได้ยังไงคะ ก็ได้ ขึ้นก็ขึ้น!")]},
   {t:"\"ถ้ามะลิไม่อยาก ฉันจะไปบอกป้าให้\"",fx:G=>add(G,"mali","bond",2),then:[T("mali","happy","…ไม่เป็นไรค่ะ แค่ได้ยินแบบนี้มะลิก็กล้าขึ้นแล้ว ไปก็ได้~")]}]},
  N("บนเวที มะลิเดินตามจังหวะกลองยาวผิดไปครึ่งจังหวะตลอดทาง แต่ยิ้มกว้างจนคนดูยิ้มตาม"),
  N("แล้วสายสะพายของผู้เข้าประกวดหมายเลขสามก็ขาดกลางเวที เจ้าตัวหน้าซีดยืนนิ่ง"),
  T("mali","happy","อย่าขยับนะคะ แป๊บเดียว~"),
  N("มะลิดึงเข็มที่เหน็บผมไว้ เย็บต่อสายสะพายให้ภายในสามสิบวินาที คนดูปรบมือดังกว่าตอนประกาศผลเสียอีก"),
  P("พิธีกร","รางวัลขวัญใจกรรมการปีนี้… ได้แก่ หมายเลขเจ็ด น้องมะลิ จากค่ายศิริชัย!"),
  N("หลังเวที มะลิกอดช่อดอกไม้ไว้แน่น นั่งลงข้างคุณบนบันไดท่าเรือ"),
  T("mali","flustered","…ผู้จัดการคะ บนเวทีหนูไม่ได้มองกรรมการเลยสักคน มองอยู่คนเดียวตลอด"),
  T("mali","flustered","ห้ามถามว่าใคร! …ถามได้ปีหน้า ถ้ามะลิได้ขึ้นเวทีอีก")]},
 lk_rin:{c:"rin",r:"SR",ev:1,t:"ดวงสมพงศ์ริมท่าน้ำ",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("หมอดูริมท่าเรือกวักมือเรียกริน ป้ายเขียนว่า \"ดูลายมือ แม่นจนขนลุก สามสิบบาท\""),
  T("rin","happy","ฉันจะจ่ายสามสิบบาทเพื่อทดสอบความแม่นยำค่ะ ผู้จัดการช่วยจดบันทึกด้วย ข้อไหนถูกให้ติ๊กถูก"),
  P("หมอดูริมท่าน้ำ","หนูเป็นคนคิดเยอะ นอนดึก ชอบตัวเลข ไม่ค่อยบอกใครว่ารู้สึกอะไร"),
  T("rin","flustered","…สามข้อจากสี่ข้อ อาจเป็นการอ่านภาษากายค่ะ ไม่นับ"),
  P("หมอดูริมท่าน้ำ","แล้วก็… ลายมือบอกว่าคู่สมพงศ์อยู่ใกล้มาก ใกล้จนยืนอยู่ข้าง ๆ ตอนนี้เลย"),
  N("รินหันมามองคุณช้า ๆ แว่นตาสะท้อนแสงเทียนจนมองไม่เห็นแววตา"),
  T("rin","happy","ความน่าจะเป็นที่คำทำนายแบบนี้จะถูก ขึ้นกับจำนวนคนที่ยืนอยู่ข้าง ๆ ซึ่งตอนนี้มีอยู่… หนึ่งคน"),
  {choice:[{t:"\"งั้นก็แม่นร้อยเปอร์เซ็นต์สิ\"",fx:G=>add(G,"rin","bond",3),then:[T("rin","flustered","…ตัวอย่างหนึ่งตัวอย่าง สรุปผลไม่ได้ค่ะ! …แต่ฉันจะไม่ลบข้อมูลนี้ทิ้ง")]},
   {t:"\"เดี๋ยวฉันขยับออกไปให้ ข้อมูลจะได้เป็นกลาง\"",fx:G=>add(G,"rin","bond",1),then:[T("rin","pout","…ไม่ต้องขยับค่ะ ตัวแปรควบคุมต้องอยู่ที่เดิม")]}]},
  T("rin","flustered","…ข้อมูลไม่พอค่ะ ต้องเก็บตัวอย่างเพิ่ม ปีหน้ามาดูกับฉันอีกรอบได้ไหม เพื่อทดสอบซ้ำ"),
  N("รินพับใบทำนายใส่กระเป๋าอย่างเรียบร้อย ทั้งที่ปกติเธอทิ้งใบเสร็จทุกใบลงถังขยะทันที"),
  T("rin","happy","อีกอย่าง ผู้จัดการจดผิดข้อหนึ่งค่ะ ข้อสุดท้ายต้องติ๊กถูก ไม่ใช่เครื่องหมายคำถาม")]},
 lk_ploy:{c:"ploy",r:"SR",ev:1,t:"หนีงานพรีเซนเตอร์",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ใครบางคนในชุดไทยสีม่วงวิ่งมาหลบหลังคุณที่ท่าเรือ ช่างภาพสามคนวิ่งผ่านไปอีกทาง"),
  T("ploy","flustered","ชู่ว์! ยืนนิ่ง ๆ แบบนั้นแหละ สปอนเซอร์ให้ฉันยืนถือกระทงยิ้มมาสองชั่วโมงแล้ว"),
  T("ploy","happy","ยิ้มสองชั่วโมงติดนี่เจ็บแก้มกว่าโดนเตะอีกนะ รู้ไหม"),
  N("พลอยยืนแนบหลังคุณจนช่างภาพวิ่งหายไปในฝูงคน แล้วถึงจะยอมก้าวออกมา"),
  T("ploy","sad","ฉันถือกระทงถ่ายรูปมาสิบปี …แต่ไม่เคยได้ลอยเองเลยสักใบ ถ่ายเสร็จเขาก็เก็บกระทงคืน"),
  {choice:[{t:"ยื่นกระทงจากแผงป้าแต๋วให้",fx:G=>{G.cash-=40;add(G,"ploy","bond",3);},then:[N("คุณยื่นกระทงใบตองให้ พลอยรับไว้สองมือเหมือนรับถ้วยรางวัล")]},
   {t:"\"ไปพับเองที่แผงป้าแต๋วกัน\"",fx:G=>add(G,"ploy","bond",3),then:[N("พลอยพับกระทงใบตองครั้งแรกในชีวิต กลีบเบี้ยวไปข้างหนึ่ง แต่เธอไม่ยอมให้ใครช่วยแก้"),T("ploy","happy","เบี้ยวก็ช่าง ใบนี้ฉันทำเอง")]}]},
  N("พลอยจุดเทียนเอง มือสั่นนิดหน่อย แล้วนั่งยอง ๆ วางกระทงลงน้ำอย่างระวัง ชุดไทยราคาแพงเปียกไปครึ่งชาย"),
  N("เธอพนมมืออยู่นาน นานจนกระทงลอยไปไกลกว่าสิบเมตร"),
  T("ploy","flustered","…อย่าบอกใครนะว่าฉันอธิษฐานนานขนาดนี้ และอย่าถามว่าขออะไร"),
  T("ploy","happy","ถ้าคำขอเป็นจริง ปีหน้าเธอจะรู้เอง …ไปได้แล้ว เดี๋ยวช่างภาพวนกลับมา")]},
 lk_fah:{c:"fah",r:"SR",ev:1,t:"ศึกโคมลอย",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ฟ้ากับมะลิยืนจุดโคมลอยคนละใบที่ลานริมน้ำ ตกลงกันไว้ว่าโคมใครลอยสูงกว่า คนนั้นได้ยืนข้างผู้จัดการตอนดูพลุ"),
  T("fah","angry","โคมฟ้าใหญ่กว่า ไส้ก็หนากว่า! ชนะขาดแน่! มะลิยอมแพ้ตอนนี้ยังทันนะ!"),
  T("mali","happy","ของมะลิเขียนคำอธิษฐานไว้ด้วยนะ~ โคมที่มีคำอธิษฐานลอยสูงกว่าเสมอ ป้าแต๋วบอก"),
  T("fah","pout","ป้าแต๋วพูดเองเออเอง! …ผู้จัดการ ปากกาหน่อย ฟ้าจะเขียนบ้าง"),
  {choice:[{t:"ยื่นปากกาให้แล้วไม่ดู",fx:G=>add(G,"fah","bond",3),then:[N("ฟ้าหันหลังเขียนอยู่นาน ขีดฆ่าสองรอบ แล้วเขียนใหม่ตัวเล็กนิดเดียว")]},
   {t:"แอบชะโงกดูว่าเขียนอะไร",fx:G=>add(G,"fah","bond",1),then:[T("fah","angry","ห้ามดู!! …ไม่ได้เขียนถึงนายหรอก! เขียนเรื่องมวย! มวยล้วน ๆ!")]}]},
  N("โคมของฟ้าพุ่งขึ้นเร็ว… แล้วไปติดกิ่งจามจุรีต้นแรก ไฟกะพริบอยู่บนกิ่งเหมือนดาวที่ลงมาเกาะผิดที่"),
  N("โคมของมะลิลอยผ่านไปช้า ๆ อย่างสง่างาม สูงขึ้นไปจนกลายเป็นจุดเล็ก ๆ ปนกับดาวจริง"),
  T("fah","flustered","…ไม่นับ! ต้นไม้โกง! ต้นไม้ค่ายมะลิแน่ ๆ!"),
  T("fah","flustered","…ก็ได้ ฟ้ายืนอีกข้างก็ได้ ข้างนายมีสองข้างนี่ ใครจะยืนข้างไหนก็ไม่ผิดกติกา"),
  N("พลุดอกแรกแตกบนฟ้า คุณมีคนยืนขนาบทั้งสองข้าง และไม่มีใครยอมขยับออกจนพลุดอกสุดท้ายดับไป"),
  T("fah","happy","…ปีหน้าแข่งใหม่ ฟ้าจะเลือกที่ที่ไม่มีต้นไม้ แล้วนายต้องมาดูอีกนะ ห้ามเบี้ยว!")]},
 // ===== ตู้กาชาลอยกระทง (lg:1) =====
 lg_kati_n:{c:"kati",r:"N",lg:1,t:"กระทงใบตองของผู้จัดการ",hint:LG_HINT,bg:"camp",need:()=>false,steps:[
  N("บ่ายวันลอยกระทง กะทินั่งพับกระทงใบตองอยู่หน้าค่าย ใบตองกองสูงเท่าเข่า"),
  T("kati","happy","ผู้จัดการ มานั่งพับด้วยกันค่ะ! พับกลีบแบบนี้ พับครึ่ง แล้วเหน็บไม้กลัด ง่ายนิดเดียว"),
  N("สามสิบนาทีต่อมา กระทงของกะทิได้เจ็ดใบ สวยเท่ากันทุกใบ ส่วนของคุณได้หนึ่งใบ หน้าตาเหมือนหมวกกันน็อก"),
  T("kati","flustered","…ใบนี้เท่ดีค่ะ! ไม่เหมือนใครในงานแน่นอน! หนูขอใบนี้ไปลอยได้ไหมคะ แลกกับของหนูเจ็ดใบเลย")]},
 lg_kati_r:{c:"kati",r:"R",lg:1,t:"ขนมครกลวกลิ้น",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ร้านขนมครกบนเรือส่งกลิ่นหอมไปทั่วท่าน้ำ กะทิซื้อมาสามถาดทั้งที่บอกว่าจะคุมน้ำหนัก"),
  T("kati","happy","วันเพ็ญได้ยกเว้นค่ะ ครูแดงไม่อยู่ ไม่มีใครเห็น"),
  N("กะทิกัดคำแรกทั้งที่ยังร้อนจัด แล้วนิ่งไปสามวินาทีเต็ม"),
  T("kati","sad","…ร้อนค่ะ ลิ้นหนูไหม้แล้ว ผู้จัดการ หนูพูดไม่ชัดแล้ว"),
  {choice:[{t:"เป่าขนมครกให้เย็นก่อนส่งให้",fx:G=>add(G,"kati","bond",2),then:[T("kati","flustered","…ขอบคุณค่ะ ใจเย็นกว่าขนมอีก …หมายถึงคนเป่า! ไม่ใช่ขนม!")]},
   {t:"\"ครูแดงเห็นนะ ยืนอยู่ข้างหลังพอดี\"",fx:G=>add(G,"kati","bond",1),then:[N("กะทิสะดุ้งหันไปดู ไม่มีใครอยู่ข้างหลัง"),T("kati","pout","ผู้จัดการแกล้งหนู! ถาดนี้ไม่แบ่งแล้วค่ะ!")]}]}]},
 lg_kati_sr:{c:"kati",r:"SR",lg:1,t:"คำอธิษฐานของกะทิ",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("ท่าน้ำเงียบลงหลังเที่ยงคืน เหลือแต่แสงเทียนจากกระทงที่ติดอยู่ริมตลิ่ง"),
  T("kati","happy","ทุกปีหนูขอให้ค่ายอยู่รอดค่ะ ขอแบบเดียวกันมาเจ็ดปีแล้ว ปู่บอกว่าขอซ้ำ ๆ เทวดาจะจำได้"),
  T("kati","sad","ปีที่ปู่เสีย หนูไม่ได้มาลอยเลย นั่งอยู่ในค่ายคนเดียวทั้งคืน กลัวว่าถ้าออกไป ค่ายจะหายไปด้วย"),
  {choice:[{t:"\"ปีนี้ค่ายไม่หายไปไหนแล้ว\"",fx:G=>add(G,"kati","bond",3),then:[T("kati","flustered","…ค่ะ เพราะมีผู้จัดการ")]},
   {t:"นั่งฟังเงียบ ๆ",fx:G=>add(G,"kati","bond",2),then:[N("กะทิพิงไหล่คุณเบา ๆ เหมือนเผลอ แล้วไม่ได้ขยับออก")]}]},
  T("kati","happy","ปีนี้หนูเลยขอเรื่องใหม่ค่ะ ครั้งแรกในเจ็ดปี"),
  T("kati","flustered","…ไม่บอกหรอกว่าขออะไร แต่มีผู้จัดการอยู่ในนั้นด้วย แค่นี้พอ")]},
 lg_mali_n:{c:"mali",r:"N",lg:1,t:"กระทงขนมปังให้ปลา",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("มะลิถือกระทงขนมปังใบเท่าจานข้าว ประดับดอกดาวเรืองจริงทั้งดอก"),
  T("mali","happy","กระทงขนมปังนะคะ ไม่ทำให้น้ำเสีย ปลากินได้ด้วย มะลิอบเองตั้งแต่ตีห้า~"),
  N("กระทงลอยไปได้ไม่ถึงสองเมตร ปลาสวายนับสิบตัวก็รุมจนกระทงจมหายไปพร้อมเทียน"),
  T("mali","flustered","…อธิษฐานยังไม่ทันจบเลยค่ะ! ปลาหิวกว่าคำอธิษฐานมะลิอีก! ผู้จัดการ หัวเราะทำไมคะ!")]},
 lg_mali_r:{c:"mali",r:"R",lg:1,t:"วัดตัวตัดชุด",hint:LG_HINT,bg:"camp",need:()=>false,steps:[
  N("มะลินั่งซ่อมสไบให้ทุกคนในค่ายตั้งแต่เช้า เข็มปักหมอนเต็มไปหมด"),
  T("mali","happy","ผู้จัดการคะ ยืนนิ่ง ๆ มะลิขอวัดตัวหน่อย ปีหน้าจะตัดเสื้อผ้าไทยให้ด้วย ใส่คู่กับพวกเรา"),
  N("สายวัดพันรอบไหล่คุณ มะลิจดตัวเลขลงสมุดเล่มเล็ก แล้วหยุดค้างอยู่ตรงรอบอก"),
  T("mali","flustered","…ตัวเลขนี้มะลิจดไว้ในหน้าพิเศษนะคะ ห้ามขอดูสมุด! ทั้งเล่มเลย!"),
  {choice:[{t:"\"ตัดสีเดียวกับชุดมะลิได้ไหม\"",fx:G=>add(G,"mali","bond",3),then:[T("mali","flustered","สีฟ้าเหมือนกัน!? …ได้ค่ะ ได้แน่นอน มะลิจะตัดให้เสร็จก่อนปีใหม่เลย!")]},
   {t:"\"สีอะไรก็ได้ มะลิเลือกเลย\"",fx:G=>add(G,"mali","bond",1),then:[T("mali","happy","งั้นมะลิเลือกสีที่ผู้จัดการใส่แล้วหล่อที่สุด~ …คือทุกสีแหละค่ะ")]}]}]},
 lg_mali_sr:{c:"mali",r:"SR",lg:1,t:"รำวงริมน้ำ",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("เวทีรำวงข้างท่าเรือเปิดเพลงรำวงเก่า วงกลมของคนในชุดไทยหมุนช้า ๆ รอบโคมไฟ"),
  T("mali","happy","ผู้จัดการ! มารำวงกัน! ไม่ต้องรำเป็น เดินตามมะลิแล้วหมุนข้อมือแบบนี้~"),
  {choice:[{t:"ยอมเข้าวงด้วย",fx:G=>add(G,"mali","bond",3),then:[N("คุณรำผิดจังหวะตลอดทั้งเพลง แต่มะลิก็รำผิดตามคุณทุกจังหวะ จนสองคนกลายเป็นคู่เดียวในวงที่รำตรงกัน")]},
   {t:"\"ขอดูอยู่ข้างวงก่อน\"",fx:G=>add(G,"mali","bond",1),then:[N("มะลิรำวนรอบวงคนเดียวอยู่สองรอบ ทุกครั้งที่ผ่านหน้าคุณ เธอจะยื่นมือมาตรงหน้าแบบไม่พูดอะไร"),N("รอบที่สาม คุณจับมือนั้นไว้")]}]},
  T("mali","flustered","…แม่เคยบอกว่า คนที่รำวงด้วยกันในคืนวันเพ็ญ จะได้กลับมารำด้วยกันอีกปีหน้า"),
  T("mali","happy","แม่อาจจะแต่งขึ้นเองนะคะ แต่มะลิเชื่อแม่ทุกเรื่องเลย~")]},
 lg_rin_n:{c:"rin",r:"N",lg:1,t:"สถิติกระทงริมปิง",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("รินยืนกดเครื่องนับจำนวนที่ท่าเรือ กดทุกครั้งที่มีกระทงลอยผ่าน"),
  T("rin","happy","ชั่วโมงนี้ 1,284 ใบค่ะ เป็นกระทงโฟม 3% ลดลงจากปีที่แล้ว 9% ข้อมูลนี้ฉันจะส่งให้เทศบาล"),
  T("rin","flustered","…ผู้จัดการไม่ต้องทำหน้าแบบนั้นค่ะ ฉันก็ลอยกระทงเป็น แค่ลอยหลังจากนับเสร็จแล้ว"),
  N("ตีหนึ่ง รินลอยกระทงใบตองใบเล็กของเธอเป็นใบที่ 4,071 แล้วกดเครื่องนับเองด้วย")]},
 lg_rin_r:{c:"rin",r:"R",lg:1,t:"เซลฟี่ไม่เป็นท่า",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("มะลิยื่นมือถือให้ริน บอกให้ถ่ายรูปคู่กับผู้จัดการ \"เป็นที่ระลึกชุดไทย\""),
  T("rin","flustered","ฉันไม่เคยถ่ายเซลฟี่ค่ะ มุมกล้องหน้าบิดสัดส่วนใบหน้าราว 30% ไม่น่าเชื่อถือ"),
  N("รูปแรกเห็นแต่คาง รูปที่สองเห็นแต่ท้องฟ้า รูปที่สามเห็นนิ้วรินครึ่งจอ"),
  {choice:[{t:"จับมือถือแล้วถ่ายให้เอง",fx:G=>add(G,"rin","bond",3),then:[N("รูปที่สี่ออกมาดี รินยืนตัวตรงเหมือนถ่ายรูปติดบัตร แต่หูแดงจนเห็นได้ในรูป"),T("rin","flustered","…ส่งไฟล์ต้นฉบับให้ฉันด้วยค่ะ ความละเอียดเต็ม เพื่อการเก็บข้อมูล")]},
   {t:"\"รูปที่สามน่ารักดีนะ\"",fx:G=>add(G,"rin","bond",2),then:[T("rin","pout","นั่นนิ้วฉันค่ะ ไม่ใช่หน้า …ถ้าชอบก็เก็บไว้ได้ ฉันไม่ห้าม")]}]}]},
 lg_rin_sr:{c:"rin",r:"SR",lg:1,t:"โคมลอยลูกที่ร้อย",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("รินถือโคมลอยไว้นิ่ง ๆ รอให้อากาศร้อนในโคมได้ที่ ปากขยับนับเลขเบา ๆ"),
  T("rin","happy","ฉันคำนวณแล้วค่ะ ต้องรอ 47 วินาที โคมถึงจะมีแรงยกพอ ปล่อยก่อนกำหนดมันจะตก"),
  T("rin","sad","…ตอนเด็ก ฉันปล่อยโคมเร็วไปทุกปีค่ะ ไม่เคยลอยได้สักลูก พ่อบอกว่าเพราะฉันใจร้อน"),
  {choice:[{t:"จับโคมอีกข้างแล้วนับไปด้วยกัน",fx:G=>add(G,"rin","bond",3),then:[N("คุณกับรินนับพร้อมกันจนถึงสี่สิบเจ็ด แล้วปล่อยมือในจังหวะเดียวกัน")]},
   {t:"\"วันนี้ไม่ต้องรีบ ฉันรอได้\"",fx:G=>add(G,"rin","bond",2),then:[N("รินนับต่ออย่างใจเย็น แล้วปล่อยมือเมื่อถึงวินาทีที่สี่สิบเจ็ดพอดี")]}]},
  N("โคมลอยขึ้นตรง ๆ ไม่เอียงสักนิด ไปรวมกับโคมนับร้อยดวงที่ลอยอยู่เหนือแม่น้ำปิง"),
  T("rin","flustered","…ลอยแล้วค่ะ ลูกแรกในชีวิต"),
  T("rin","happy","สมมติฐานใหม่ค่ะ ไม่ใช่เพราะฉันใจร้อน แต่เพราะไม่เคยมีใครนับด้วย ข้อนี้ต้องทดสอบซ้ำทุกปี")]},
 lg_ploy_n:{c:"ploy",r:"N",lg:1,t:"ป้ายโฆษณาชุดไทย",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ป้ายโฆษณาเครื่องดื่มเกลือแร่ขนาดสามเมตรตั้งอยู่หน้างาน รูปพลอยในชุดไทยถือกระทงยิ้มกว้าง"),
  N("เจ้าตัวจริงยืนอยู่ใต้ป้าย สวมหมวกแก๊ปกับหน้ากากอนามัย"),
  T("ploy","flustered","อย่ามองป้ายนาน ๆ สิ …ถ่ายวันนั้นฉันง่วงมาก ยิ้มแบบนั้นต้องถ่ายใหม่สี่สิบรอบ"),
  T("ploy","happy","แต่ถ้าเธอจะถ่ายรูปกับป้ายเก็บไว้ ฉันก็ไม่ว่าอะไร ยิ้มสวยสุดในชีวิตแล้วล่ะ")]},
 lg_ploy_r:{c:"ploy",r:"R",lg:1,t:"กระทงใบเดียวเมื่อสิบปีก่อน",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("พลอยนั่งห้อยเท้าที่ปลายท่าเรือ มองกระทงลอยผ่านไปทีละใบ"),
  T("ploy","sad","ปีแรกที่ฉันเข้าค่ายพยัคฆ์ทอง อายุสิบสอง ทุกคนกลับบ้านไปลอยกระทงกับครอบครัว เหลือฉันคนเดียว"),
  T("ploy","sad","เถ้าแก่ให้เงินฉันห้าสิบบาทไปซื้อกระทง ฉันซื้อมาแล้วก็ไม่ได้ลอย นั่งถือไว้จนเทียนดับ"),
  {choice:[{t:"\"ปีนี้ไม่ได้อยู่คนเดียวแล้วนะ\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…รู้แล้ว ไม่ต้องพูดก็ได้ แต่พูดแล้วก็… ไม่เป็นไร")]},
   {t:"ยื่นเทียนสำรองให้หนึ่งเล่ม",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","เผื่อเทียนดับอีกเหรอ …เธอนี่เตรียมพร้อมเหมือนพี่เลี้ยงนักมวยจริง ๆ")]}]}]},
 lg_ploy_sr:{c:"ploy",r:"SR",lg:1,t:"คืนที่ไม่มีใครจำได้",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("พลอยคาดหน้ากากฮีโร่พลาสติกจากแผงของเล่นไว้บนหมวกแก๊ป ห้อยแว่นดำไว้ที่คอเสื้อ ไม่มีใครในงานหันมามองเธอเลยสักคน"),
  T("ploy","happy","สามชั่วโมงแล้วไม่มีใครขอถ่ายรูปเลย ฉันไม่ได้เดินงานแบบนี้มาตั้งแต่เด็ก"),
  N("พลอยกินลูกชิ้นปิ้งสองไม้ ยิงปืนลูกโม่ได้ตุ๊กตาหมี และหัวเราะเสียงดังทุกครั้งที่คุณยิงพลาด"),
  {choice:[{t:"\"แมวตัวนี้ยิงแม่นกว่าแชมป์อีกนะ\"",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","ก็แชมป์เป็นคนใส่หน้ากากอยู่ไง")]},
   {t:"\"หน้ากากนี้เหมาะดี แต่ถอดก็สวยกว่า\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…ตอนนี้ดีใจที่ใส่หน้ากากอยู่ เพราะหน้าแดงไปหมดแล้ว")]}]},
  N("ก่อนแยกกัน พลอยยัดตุ๊กตาหมีใส่มือคุณ"),
  T("ploy","flustered","ฝากไว้ที่ค่ายเธอ ถ้าวันไหนฉันเหนื่อยกับการเป็นพลอยที่ทุกคนจำได้ ฉันจะไปเยี่ยมมัน …ไม่ได้ไปเยี่ยมเธอนะ")]},
 lg_fah_n:{c:"fah",r:"N",lg:1,t:"ประทัดลูกใหญ่",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("ฟ้าหอบประทัดมาเต็มถุงผ้า หน้าตาภูมิใจเหมือนเพิ่งชนะไฟต์"),
  T("fah","happy","ลูกนี้ใหญ่สุดในร้าน! ฟ้าจะจุดตรงนี้แหละ ให้ทั้งตลาดรู้ว่าฟ้ามาแล้ว!"),
  P("ป้าแต๋ว","อีหนูผมสีเงิน! จุดตรงนี้ป้าจะตีให้ก้นลาย! ไปจุดฝั่งโน้น!"),
  T("fah","pout","…ครับป้า เอ๊ย ค่ะป้า ผู้จัดการ ช่วยถือถุงหน่อย ฟ้าจะย้ายไปฝั่งโน้นแบบเงียบ ๆ")]},
 lg_fah_r:{c:"fah",r:"R",lg:1,t:"พลุดอกใหญ่",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("พลุลูกใหญ่ที่สุดของคืนนี้ระเบิดเหนือหัวพอดี เสียงดังจนกระจกร้านค้าสั่น"),
  N("ฟ้าสะดุ้งสุดตัว แล้วคว้าแขนคุณไว้แน่นโดยไม่รู้ตัว"),
  T("fah","flustered","…ไม่ได้กลัว! เสียงมันดังผิดปกติ! ฟ้าแค่… กันนายตกใจ!"),
  {choice:[{t:"\"งั้นจับไว้ต่อก็ได้ เผื่อฉันตกใจอีก\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…ก็ได้! เพื่อนาย! เพื่อนายล้วน ๆ!"),N("พลุอีกสิบสองลูกต่อมา ฟ้าไม่ปล่อยแขนเลยสักลูก")]},
   {t:"\"แชมป์รอยสักเสือกลัวพลุเหรอ\"",fx:G=>add(G,"fah","bond",1),then:[T("fah","angry","ใครกลัว! …ห้ามเล่าให้ใครฟังนะ ถ้ารู้ถึงหูมะลิ ฟ้าจะเตะนาย!")]}]}]},
 lg_fah_sr:{c:"fah",r:"SR",lg:1,t:"กระทงสองใบ",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("ฟ้าถือกระทงมาสองใบ ใบหนึ่งสวยเรียบร้อย อีกใบเล็กนิดเดียว ใบตองเย็บเบี้ยว ๆ"),
  T("fah","happy","ใบสวยนี่ของฟ้า ส่วนใบเบี้ยวนี่… ไม่รู้จะให้ใคร ทำเกินมาใบนึง"),
  T("fah","sad","ตอนเด็ก ฟ้าลอยกระทงคนเดียวทุกปี ทำสองใบตลอด เผื่อมีใครมาลอยด้วย สุดท้ายก็ลอยทั้งสองใบเอง"),
  {choice:[{t:"\"ใบเบี้ยวนี่ ขอได้ไหม\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…ทำไมต้องเลือกใบเบี้ยวด้วย! …ก็ได้ ใบนั้นฟ้าทำนานที่สุด")]},
   {t:"\"ปีนี้ลอยด้วยกันสองคนนะ\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…พูดง่ายจังนะ นายนี่ …ก็ได้ สองคน")]}]},
  N("กระทงสองใบลอยออกไปพร้อมกัน ใบเบี้ยวพยายามตามใบสวยไปตลอดทาง และไม่ห่างกันเลย"),
  T("fah","happy","เห็นไหม ใบเล็กมันตามทัน ฟ้าเย็บไว้ดีแล้วล่ะ ปีหน้าทำสองใบอีกนะ ห้ามให้ฟ้าลอยคนเดียว!")]},
 lg_team_ssr:{c:"kati",r:"SSR",lg:1,t:"คืนเพ็ญเดือนสิบสอง",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("ตีหนึ่ง งานเลิกแล้ว ท่าน้ำเหลือแต่คนในค่ายศิริชัยกับแสงเทียนนับพันที่ลอยอยู่บนแม่น้ำ"),
  {n:"coach",t:"ปู่ชัยเคยพาครูมาลอยกระทงตรงนี้ทุกปี บอกว่าค่ายมวยก็เหมือนกระทง ถ้าไม่มีใครช่วยประคอง มันก็จมเอง"},
  T("kati","happy","ปีนี้กระทงค่ายเราลอยไกลที่สุดในงานเลยค่ะ ครูแดง"),
  T("mali","happy","ก็มะลิพับเองกับมือ! …กะทิช่วยนิดหน่อย"),
  T("rin","happy","ไกลที่สุดในรัศมีที่ฉันมองเห็นค่ะ ซึ่งจำกัดด้วยแว่นตา"),
  T("ploy","happy","ปีหน้าฉันจะมาลอยกับค่ายนี้อีก ไม่ต้องมีสปอนเซอร์ ไม่ต้องมีกล้อง"),
  T("fah","happy","ฟ้าก็มา! และปีหน้ากระทงฟ้าต้องไกลกว่า!"),
  {choice:[{t:"\"ปีหน้า ปีโน้น ทุกปีเลย\"",fx:G=>{for(const id of ["kati","mali","rin","ploy","fah"])add(G,id,"bond",2);},then:[N("ไม่มีใครตอบ แต่ทุกคนขยับมานั่งใกล้กันอีกนิด")]},
   {t:"ถ่ายรูปหมู่ด้วยกล้องเก่าของปู่ชัย",fx:G=>{for(const id of ["kati","mali","rin","ploy","fah"])add(G,id,"bond",2);},then:[N("แฟลชสว่างวาบหนึ่งครั้ง รูปที่ได้ทุกคนหลับตาครึ่งหนึ่ง และไม่มีใครยอมให้ถ่ายใหม่")]}]},
  N("กระทงของค่ายศิริชัยลอยออกไปไกลจนลับตา ไม่มีใครลุกขึ้นจนเทียนเล่มสุดท้ายบนท่าน้ำดับลง")]}});

})();
/* v1.89.24: the riverside SR card stories keep their choices, but nothing (bond, cash) leaks into the main game */
(()=>{const mute=st=>(st||[]).forEach(x=>{if(x&&x.choice)x.choice.forEach(o=>{o.fx=()=>{};mute(o.then);});});for(const k of LOY_CARDS)if(CARDS[k])mute(CARDS[k].steps);})();
function loyCardDrop(G,order){G.cards=G.cards||{};const left=LOY_CARDS.filter(k=>!G.cards[k]);if(!left.length)return null;
  const pref=(order||[]).map(id=>"lk_"+id).filter(k=>left.includes(k));const L=loyOf(G);const id=pref[0]||left[((L&&L.runs)||0)%left.length];
  G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false}; /* v1.89.24: event card — no bond or stardust carried into the main game */
  return `การ์ด SR ใหม่: "${CARDS[id].t}" (ดูได้ในอัลบั้ม)`;}
function loyGold(G){const L=loyOf(G);if(!L)return null;return "ปลดล็อกชุดไทยกับหมวกกระทงของผู้จัดการ (ใส่ได้ตลอด · ตั้งค่า › แก้ไขตัวละคร)";} /* v1.91.117 (Man): the gold tier now dresses the manager */
const loyThaiLook=G=>!!(G&&G.ev&&G.ev.loy&&G.ev.loy.tiers&&G.ev.loy.tiers.silver);
/* v1.89.25: Tum comes back every in-game Loy Krathong (weeks 24–28) by letter — the event's stardust giver; he scales a little above the camp's top three */
const THIEF_WK=[24,27];
/* v1.90.8 (Man): Tum comes (1) once a real day 20–23 Nov 2026, (2) every week for the 4 game weeks after you first start the riverside brawl —
   saves that already played it without meeting him get those 4 weeks from now — and (3) game weeks 24–27 every year (was 24–28) */
const THIEF_DAYS=["2026-11-20","2026-11-23"];
const thiefDaily=()=>{const t=todayStr();return t>=THIEF_DAYS[0]&&t<=THIEF_DAYS[1];};
const thiefWin=G=>{const L=loyOf(G);if(!L)return false;const w=absWeek(G);return (G.week>=THIEF_WK[0]&&G.week<=THIEF_WK[1])||(L.thiefFrom!=null&&w>=L.thiefFrom&&w<L.thiefFrom+4);};
/* v1.90.9 (Man): the real-day visits go to Tuy, Tum's younger brother (red mask, own sprite + portrait) — stronger, 3 rounds, bigger reward, once a real day.
   Tum keeps the game-week windows. Each has his own once-per-day/once-per-week clock, so when windows overlap both can be caught. */
const thiefOn=G=>!!loyOf(G)&&thiefWin(G);
const thiefReady=G=>{const L=loyOf(G);return thiefOn(G)&&L.thiefWk!==absWeek(G);};
const thiefAgain=G=>"สัปดาห์หน้ามาอีก";
const tuyOn=G=>!!loyOf(G)&&thiefDaily();
const tuyReady=G=>{const L=loyOf(G);return tuyOn(G)&&L.tuyDay!==todayStr();};
function thiefFix(G){const L=loyOf(G);if(!L)return;if(L.thiefFrom==null&&L.runs>0&&L.thiefWk==null)L.thiefFrom=absWeek(G);thiefMail(G);tuyMail(G);}
function tuyMail(G){if(!tuyReady(G))return;if((G.mail||[]).some(m=>m.ev==="tuy"&&!m.done&&!m.expired))return;
  addMail(G,{kind:"event",ev:"tuy",from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:"ไอ้ตุ๋ยน้องไอ้ตุ่มโผล่มาแล้ว!",exp:G.week+1,
    body:"ผู้จัดการจ๋า คราวนี้ไม่ใช่ไอ้ตุ่มนะ เป็นน้องชายมัน ไอ้ตุ๋ยหน้ากากแดง ร้ายกว่าพี่มันอีก แบกกระทงไปทั้งกระสอบ ป้าเห็นมันโผล่มาแค่ช่วงนี้แหละ ส่งเด็ก ๆ ที่เก่ง ๆ มาช่วยหน่อยนะ"});}
const campPow=G=>{const R=roster(G).map(f=>ovr(f.a)).sort((a,b)=>b-a).slice(0,3);return R.length?R.reduce((s,x)=>s+x,0)/R.length:8;};
const campLv=G=>{const R=roster(G).map(f=>f.lvl||1).sort((a,b)=>b-a).slice(0,3);return R.length?Math.round(R.reduce((s,x)=>s+x,0)/R.length):1;};
function thiefMail(G){if(!thiefReady(G))return;if((G.mail||[]).some(m=>m.ev==="thief"&&!m.done&&!m.expired))return;
  addMail(G,{kind:"event",ev:"thief",from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:"ไอ้ตุ่มมาอีกแล้ว!",exp:G.week+1,
    body:"ผู้จัดการจ๋า เทศกาลลอยกระทงทีไร ไอ้ตุ่มโจรงมกระทงโผล่มาทุกที เมื่อคืนมันหอบเหรียญจากกระทงชาวบ้านไปเต็มกระสอบอีกแล้ว ส่งเด็ก ๆ มาช่วยจับหน่อยนะ ป้าทอดขนมครกรอ"});}
const THIEF_SCALE={m:1.04,mt:1.07,e:.5}; /* v1.91.7: scaled to the girl who steps up (her stats + half her skill/gear edge), not the camp average — a stand-out fighter no longer flattens him */
function thiefBase(G,f){const g=typeof loyBoost==="function"?loyBoost(f):f,me=ovr(g.a)+(g.camp==="player"?THIEF_SCALE.e*hiddenEdge(g):0);return Math.max(campPow(G),me);}
function evThief(G,f,tuy){const K=QK.gang1,target=Math.max(6,thiefBase(G,f)*(tuy?THIEF_SCALE.mt:THIEF_SCALE.m)),t=Math.min(tuy?19.5:19.2,target),rng=mulberry32((G.seed^(tuy?0x7b3:0x7a1))+absWeek(G)*17);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const id="q_evthief";
  const nm=tuy?LOY_TUY.name:LOY_THIEF.name;const o=baseFighter(id,{name:nm,full:nm,div:"X",camp:"quest",color:tuy?"#a8202c":"#6b7a2e",potential:t+2,a});
  o.vet=Math.min(12,Math.max(0,target-ovr(a)));o.nlsk=QSK.gang.slice(0,tuy?3:2);o.sprite=tuy?"thief2":"thief";o.kind="gang1";o.grp="gang";o.lvl=campLv(G)+(tuy?2:1);o.fatigue=0;o.morale=70;G.F[id]=o;return id;}
function thiefHTML(){const pool=gauntPool(),tuy=UI.thiefK==="tuy";return `${tuy?`<h2>ไล่จับไอ้ตุ๋ย หน้ากากแดง</h2><p class="meta">ไฟต์ 3 ยก ไม่บาดเจ็บ · เก่งกว่าไอ้ตุ่ม รางวัลก็มากกว่า · ชนะได้ EXP กับเศษดาว ✦ (แพ้ก็ได้เศษดาวปลอบใจ) · มาเฉพาะ 20–23 พ.ย. วันละครั้ง</p>`:`<h2>ไล่จับโจรงมกระทง</h2><p class="meta">ไฟต์ 2 ยก ไม่บาดเจ็บ · ชนะได้ EXP กับเศษดาว ✦ (แพ้ก็ได้เศษดาวปลอบใจ) · ไอ้ตุ่มเก่งขึ้นตามค่าย · มาเฉพาะช่วงลอยกระทง สัปดาห์ละครั้ง</p>`}
  <div class="gpick">${pool.map(f=>`<button class="gpk" data-act="thiefgo" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>${isLoyGuest(f)?"แขกรับเชิญ · ":""}Lv.${f.lvl}</small></span></button>`).join("")}</div>
  <div class="center endbtns"><button class="btn" data-act="closeModal">ไว้ก่อน</button></div>`;}
function thiefGo(fid){const L=loyOf(G);if(!L)return;const f=G.F[fid];if(!f)return;UI.modal=null;const tuy=UI.thiefK==="tuy",X=tuy?LOY_TUY:LOY_THIEF;
  const pre=[...X.pre,f.canon&&LOY_THIEF.line[fid]?{n:fid,f:"angry",l:"thai",t:LOY_THIEF.line[fid]}:{n:"nar",t:`${f.name}ก้าวขึ้นท่าเรือ ถกแขนเสื้อพร้อมลุย`}];
  playScene(pre,()=>{const qid=evThief(G,f,tuy);const bk={id:"bthief",a:fid,b:qid,week:G.week,tier:"evloy",rounds:3,ev:1,bg:"bg_loy_ring.webp"};
    openFight2(bk,()=>{const F=LASTF,win=F&&F.result&&F.result.win==="A",ko=win&&/KO|น็อก/.test(F.result.type||"");if(tuy)L.tuyDay=todayStr();else L.thiefWk=absWeek(G);delete G.F.q_evthief;
      for(const m of G.mail||[])if(m.ev===(tuy?"tuy":"thief")&&!m.done)m.done=true;
      const yr=G.season||1,xp=Math.round((win?30+10*yr:10)*(tuy?1.5:1)),du=tuy?(win?(ko?8:6):2):(win?(ko?5:4):1);if(f.camp==="player")gainXP(G,f,xp);G.dust=(G.dust||0)+du;
      /* v1.90.10 (Man): the villagers chip in when you win — Tuy ฿2,000 + ฿1,000 a year (KO +50%), Tum ฿200 */const cash=win?(tuy?Math.round((2000+1000*yr)*(ko?1.5:1)/100)*100:200):0;if(cash)G.cash+=cash;
      const rw=[cash?`เงิน +${fmt(cash)}`:"",f.camp==="player"?`${f.name} EXP +${xp}`:"",`เศษดาว ✦ +${du}`].filter(Boolean).join(" · ");
      if(win){if(tuy)L.tuyN=(L.tuyN||0)+1;else L.thiefN=(L.thiefN||0)+1;}save();
      playScene(win?[...X.win,{n:"nar",t:tuy?`จับไอ้ตุ๋ยได้แล้ว ${L.tuyN} ครั้ง · ${rw}`:`จับไอ้ตุ่มได้แล้ว ${L.thiefN} ครั้ง · ${rw}`}]:[...X.lose,{n:"nar",t:`ไม่เป็นไร ประสบการณ์ก็คือประสบการณ์ · ${rw}`}],()=>{AU.startMusic("hub");UI.tab="home";save();render();},{bg:"river",look:"thai"});});},{bg:"river",look:"thai"});}
Object.assign(ACT,{
  loyintro:()=>{UI.modal=null;playScene(loyIntro(G),()=>{AU.startMusic("hub");render();},{bg:"river",look:"thai"});},
  loyend:d=>{const E=LOY_END[d.v];if(!E)return;const L=loyOf(G);if(L&&L.run&&L.run.newEnd===d.v)L.run.newEnd=null;UI.modal=null;
    playScene(loyEndSteps(d.v,L&&L.endCast&&L.endCast[d.v],L&&L.endBoss&&L.endBoss[d.v]),()=>{AU.startMusic("hub");const back=()=>{if(L&&L.run&&L.run.done)UI.modal={type:"gaunt"};if(L&&L.petPend!=null){UI.petName=L.petPend;L.petPend=null;save();}render();};
      if(L&&(!L.wish||L.floatTok))loyWishOpen(back);else back();},{bg:"river",look:"thai"});},
  loywish:d=>loyWishPick(d.v),lwfloatdone:()=>{if(UI.lwGo)UI.lwGo();},
  kongka:d=>{const m=(G.mail||[]).find(x=>x.id===d.v);if(!m||m.done)return;const B=KONGKA[m.wish];if(!B)return;m.done=true;B.fx(G,m);save();UI.modal=null;
    playScene([{n:"nar",bg:"river_dawn",t:"ผู้จัดการเดินลงไปที่ท่าน้ำหน้าค่าย หมอกเช้ายังไม่จาง กระทงเมื่อคืนลอยกลับมาเกยตลิ่ง เทียนดับไปนานแล้ว แต่กลิ่นมะลิยังอยู่"},{n:"nar",t:`ผู้จัดการพนมมือขอบคุณสายน้ำ · ได้รับ${B.n} · ${B.d}`}],()=>{AU.sfx&&AU.sfx("level");render();},{bg:"river_dawn",look:"casual"});},lwskip:()=>{UI.lwSkip=true;render();},
  lwclose:()=>{if(UI.lwGo){UI.lwGo();return;}UI.modal=null;const d=UI.lwDone;UI.lwDone=null;AU.startMusic("hub");if(d)d();else render();},
  loywishopen:()=>{const L=loyOf(G);if(!loyCanFloat(L))return;loyWishOpen(()=>{UI.modal=null;render();});},
  loyfloat:()=>{const L=loyOf(G);if(!loyCanFloat(L))return;loyWishOpen(()=>{UI.modal=L.run&&L.run.done?{type:"gaunt"}:null;render();});},
  tuy:()=>{const L=loyOf(G);if(!L||!tuyReady(G))return;UI.thiefK="tuy";UI.modal={type:"thief"};render();},
  thief:()=>{const L=loyOf(G);if(!L||!thiefReady(G))return;UI.thiefK="tum";UI.modal={type:"thief"};render();},
  thiefgo:d=>thiefGo(d.v),
  loydress:()=>{const L=loyOf(G);if(!L||!L.tiers.gold)return;L.dressOn=L.dressOn?0:1;save();render();},
});

/* ===== v1.82: code-content replay in settings + the Loy Krathong gacha (festival only) ===== */
const LOY_FEST={from:"2026-11-18",to:"2026-12-07"};
function loyFest(){const t=todayStr();return evTest()||(t>=LOY_FEST.from&&t<=LOY_FEST.to);}
const LG_COST=30,LG_PITY=10;
function loyPull(G){if(!loyFest()||(G.dust||0)<LG_COST)return null;G.dust-=LG_COST;G.lgPity=(G.lgPity||0)+1;G.lgPulls=(G.lgPulls||0)+1;G.cards=G.cards||{};
  const pool=Object.keys(CARDS).filter(k=>CARDS[k].lg),by=r=>pool.filter(k=>CARDS[k].r===r);const x=srand(G,(G.lgPity*173+G.lgPulls*11)|0);
  const pity=G.lgPity>=LG_PITY;let r=pity?"SSR":x<.04?"SSR":x<.27?"SR":x<.65?"R":"N";if(r==="SSR")G.lgPity=0;let L=by(r);if(pity){const nw=L.filter(k=>!G.cards[k]);if(nw.length)L=nw;}const id=L[Math.floor(srand(G,G.lgPulls*89+5)*L.length)];
  const o=G.cards[id];let res;if(!o){G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};res={id,isNew:true};}
  else{o.n=(o.n||1)+1;o.spare=(o.spare||0)+1;res={id,spare:o.spare,canUp:(o.lv||1)<3};} /* v1.85.1: every duplicate is kept — the player levels the card up or breaks it down on the card page */
  res.loy=1;return res;}
// v1.87.3: before the festival the box is on show but locked, with its opening time
function loySoon(){const t=todayStr();return !evTest()&&t<LOY_FEST.from;}
function loyGachaHTML(){if(loySoon()){const all=Object.keys(CARDS).filter(k=>CARDS[k].lg).length;
    return `<div class="gacha loyg soon"><span><b class="goldt">ตู้ลอยกระทง</b> <small>เปิด 18 พ.ย. เวลา 00:00 ถึง 7 ธ.ค. · การ์ดชุดไทย ${all} ใบ · เก็บเศษดาวรอไว้ได้เลย</small></span><button class="btn sm" disabled aria-disabled="true">🔒 เปิด 18 พ.ย.</button></div>`;}
  if(!loyFest())return "";const own=Object.keys(CARDS).filter(k=>CARDS[k].lg&&(G.cards||{})[k]).length,all=Object.keys(CARDS).filter(k=>CARDS[k].lg).length;
  return `<div class="gacha loyg"><span><b class="goldt">ตู้ลอยกระทง</b> <small>เปิดถึง 7 ธ.ค. เท่านั้น · การ์ดชุดไทย ${own}/${all} ใบ · การันตี SSR อีก ${Math.max(1,LG_PITY-(G.lgPity||0))} ครั้ง · การ์ดที่ได้แล้วอยู่ในอัลบั้มตลอดไป</small></span><button class="btn sm gold" data-act="gopen" data-v="loy">🏮 ตู้ลอยกระทง ${LG_COST}✦</button></div>`;}
function codeContentHTML(){const L=loyOf(G);if(!L)return "";
  return `<div class="set"><span><b>เนื้อหาจากโค้ด</b><small>กลับไปเล่นอีเวนต์ที่เคยใส่โค้ดไว้ได้ทุกเมื่อ</small></span><span class="obtns"><button class="btn sm" data-act="loyhub">ลอยกระทง 2569 ▸</button></span></div>`;}
function loyHubHTML(){return `<h2>ศึกริมน้ำคืนลอยกระทง</h2><p class="meta">อีเวนต์จากโค้ด LOYKRATHONG69 · กลับมาเล่นซ้ำ ดูฉากเปิด ฉากจบ และไล่จับโจรได้ที่นี่</p><div class="center endbtns col">${evMailAct({})}</div>${loyGachaHTML()}`;}
Object.assign(ACT,{
  loygacha:()=>{const r=loyPull(G);if(!r){if(loySoon())toast("ตู้ลอยกระทงเปิด 18 พ.ย. เวลา 00:00");else if(!loyFest())toast("ตู้ลอยกระทงปิดแล้ว ไว้เจอกันเทศกาลหน้า");return;}AU.sfx&&AU.sfx(["SSR","SR"].includes(CARDS[r.id].r)?"level":"ui");save();UI.modal={type:"gacha",res:r};render();},
  loyhub:()=>{UI.modal={type:"loyhub"};render();},
});
// v1.86: card levels — longer stories, a Lv.2 epilogue and a Lv.3 special scene (and a minigame on the SSR cards)
// choices here carry no bond effects: cards can be replayed, the bond comes from levelling the card up
const cN=t=>({n:"nar",t}),cP=(who,t)=>({n:"npc",who,t});
const CARD_LV={
 g_kati_sr:{main:[cN("ใต้ภาพวาดมีตัวหนังสือลายมือสั่น ๆ เขียนว่า 'เข็มขัดเส้นนี้ ให้คนที่ไม่ทิ้งค่าย'"),{n:"kati",f:"sad",l:"casual",t:"ปู่เขียนตอนป่วยหนักแล้วค่ะ หนูเพิ่งเห็นวันนี้เอง"},{n:"kati",f:"happy",l:"casual",t:"งั้นเข็มขัดเส้นนี้ก็ไม่ใช่ของหนูคนเดียวแล้วสิคะ ผู้จัดการก็ไม่ทิ้งค่ายเหมือนกัน"}],lv2:[cN("เช้าวันต่อมา ภาพวาดเข็มขัดถูกใส่กรอบแขวนไว้เหนือประตูห้องซ้อม"),{n:"coach",t:"กะทิ เอ็งเอารูปนี้มาแขวนตรงนี้ทำไม"},{n:"kati",f:"happy",l:"casual",t:"ให้ทุกคนเห็นทุกเช้าค่ะครูแดง ว่าเรากำลังซ้อมเพื่ออะไร"},{n:"coach",t:"…ปู่ชัยคงหัวเราะอยู่แน่ ๆ ที่หลานสาวดื้อเหมือนแกเปี๊ยบ"}],lv3:[cN("คืนหนึ่ง กะทิลากคุณไปที่ร้านช่างเงินท้ายตลาด ในมือถือภาพวาดของปู่"),{n:"kati",f:"happy",l:"casual",t:"ลุงช่างคะ ทำเข็มขัดตามรูปนี้ได้ไหมคะ ไม่ต้องเป็นทองจริงก็ได้"},cP("ช่างเงิน","รูปนี้… ลายมือชัยนี่หว่า เมื่อสี่สิบปีก่อนเขามาสั่งแบบเดียวกันเป๊ะ แต่เงินไม่พอ"),{n:"kati",f:"sad",l:"casual",t:"ปู่… เคยมาสั่งเหรอคะ"},cP("ช่างเงิน","ฉันเก็บแม่พิมพ์ไว้ให้เขาตั้งแต่วันนั้น รอวันที่เขาจะกลับมา"),{choice:[{t:"\"วันนี้หลานปู่มาแทนแล้วครับ\"",then:[{n:"kati",f:"flustered",l:"casual",t:"…ผู้จัดการพูดแบบนั้น หนูจะร้องไห้ในร้านเขานะคะ"}]},{t:"จ่ายมัดจำแทนกะทิเงียบ ๆ",then:[cN("กะทิเห็นทีหลัง ทุบไหล่คุณเบา ๆ สามที แล้วเดินกอดแขนคุณกลับค่ายทั้งทาง")]}]},cN("เข็มขัดจำลองเส้นแรกของค่ายศิริชัยวางอยู่ข้างรูปปู่ชัย รอเส้นจริงมาวางเคียง"),{n:"kati",f:"happy",l:"casual",t:"ปู่คะ อีกนิดเดียวนะ ผู้จัดการกับหนูจะเอาเส้นจริงมาให้"}],lv3t:"เข็มขัดเส้นแรก"},
 g_mali_sr:{main:[{n:"mali",f:"flustered",l:"casual",t:"…ถ้าอ่านถึงตรงที่บอกว่าผู้จัดการใจดี ก็ช่างมันค่ะ อันนั้นเรื่องจริง"},cN("มะลิพับจดหมายใส่ซอง แต่ยังไม่ปิดผนึก"),{n:"mali",f:"sad",l:"casual",t:"มะลิเขียนถึงแม่ทุกเดือนค่ะ แต่ไม่เคยส่งเลยสักฉบับ กลัวแม่อ่านแล้วเป็นห่วง ทุกฉบับมีแต่เรื่องเจ็บตัว"},{n:"mali",f:"happy",l:"casual",t:"เดือนนี้อาจจะส่งก็ได้นะคะ ถ้าผู้จัดการช่วยเขียนท้ายจดหมายให้หน่อย~"}],lv2:[cN("สองสัปดาห์ต่อมา บุรุษไปรษณีย์มาส่งซองสีฟ้าที่ค่าย จ่าหน้าถึงมะลิ"),{n:"mali",f:"happy",l:"casual",t:"แม่ตอบมาค่ะ!! …แม่เขียนว่า 'ฝากขอบคุณผู้จัดการที่ดูแลลูกด้วยนะ'"},{n:"mali",f:"flustered",l:"casual",t:"ผู้จัดการไปเขียนอะไรต่อท้ายจดหมายมะลิคะ!? แม่ถามว่าเป็นแฟนมะลิหรือเปล่า!"}],lv3:[cN("เช้าวันอาทิตย์ หญิงวัยกลางคนในเสื้อลายดอกมะลิยืนหน้าประตูค่าย หิ้วปิ่นโตเถาใหญ่"),{n:"mali",f:"flustered",l:"casual",t:"แม่!? มาได้ยังไงคะ ไม่บอกกันก่อนเลย!"},cP("แม่ของมะลิ","ก็มาดูว่าลูกแม่อยู่ดีกินดีจริงไหม จดหมายเขียนว่าอ้วนขึ้น แม่ต้องมาเห็นกับตา"),cN("แม่ของมะลินั่งดูมะลิเตะเป้าอยู่ข้างเวทีทั้งบ่าย ไม่พูดอะไรเลยสักคำ"),cP("แม่ของมะลิ","ลูกเตะสวยกว่าพ่อมันอีก …แม่ไม่ห่วงแล้วนะ แต่ต้องกินข้าวให้ครบสามมื้อ"),{choice:[{t:"\"ผมจะดูแลมื้ออาหารให้ครบครับ\"",then:[{n:"mali",f:"happy",l:"casual",t:"แม่! ได้ยินไหม ผู้จัดการรับปากแล้ว~"}]},{t:"ชวนแม่ของมะลิกินข้าวด้วยกันทั้งค่าย",then:[cN("ปิ่นโตห้าชั้นหมดเกลี้ยงในสิบนาที ครูแดงขอสูตรแกงไว้สามอย่าง")]}]},{n:"mali",f:"happy",l:"casual",t:"วันนี้วันที่ดีที่สุดในปีของมะลิเลยค่ะ ดีกว่าวันที่ชนะอีก"}],lv3t:"แม่มาเยี่ยมค่าย"},
 g_rin_sr:{main:[cN("รินหยิบปากกาขึ้นมาอีกด้าม ขีดฆ่าเครื่องหมายคำถามหลัง X"),{n:"rin",f:"happy",l:"casual",t:"ฉันลองใส่ค่าตัวแปรทุกแบบแล้วค่ะ เงินเดือน ชื่อเสียง โอกาส ไม่มีค่าไหนทำให้สมการเท่ากันได้"},{n:"rin",f:"flustered",l:"casual",t:"เหลือค่าเดียวที่ยังไม่ได้ลอง และฉันไม่กล้าเขียนลงกระดาษ"}],lv2:[cN("วันต่อมา กระดาษแผ่นเดิมถูกแปะไว้บนไวท์บอร์ดในห้องดูเทป"),cN("บรรทัดสุดท้ายถูกแก้แล้ว 'X = ค่ายนี้' แต่คำว่า 'ค่ายนี้' เขียนทับคำอื่นที่ลบไม่หมด"),{n:"rin",f:"flustered",l:"casual",t:"…อย่าพยายามอ่านคำที่ลบไปนะคะ หมึกมันแค่ซึมเท่านั้นเอง"}],lv3:[cN("รินส่งตารางนัดหมายมาทางแชท หัวข้อเขียนว่า 'การทดลองภาคสนาม ครั้งที่ 1'"),{n:"rin",f:"happy",l:"casual",t:"สมมติฐานคือ ถ้าเราไปคาเฟ่เดิมด้วยกันห้าครั้ง ตัวแปร X จะมีค่าคงที่ ฉันต้องเก็บข้อมูลค่ะ"},cN("ครั้งที่หนึ่ง รินจดทุกอย่าง ครั้งที่สามจดน้อยลง ครั้งที่ห้าเธอลืมเปิดสมุดเลย"),{n:"rin",f:"flustered",l:"casual",t:"…ข้อมูลครั้งที่ห้าหายค่ะ ฉันมัวแต่ฟังคุณเล่าเรื่องจนลืมจด"},{choice:[{t:"\"งั้นต้องทดลองใหม่อีกห้าครั้ง\"",then:[{n:"rin",f:"happy",l:"casual",t:"เห็นด้วยค่ะ ตามหลักวิทยาศาสตร์ ผลต้องทำซ้ำได้"}]},{t:"\"แล้วผลการทดลองคืออะไร\"",then:[{n:"rin",f:"flustered",l:"casual",t:"สรุปผล X มีค่าคงที่ค่ะ และฉันจะไม่บอกว่ามีค่าเท่าไร"}]}]},{n:"rin",f:"happy",l:"casual",t:"บันทึกการทดลองครั้งที่หนึ่งถึงห้า ฉันเก็บไว้ในลิ้นชักที่ล็อกได้ค่ะ ข้อมูลลับ"}],lv3t:"ทดสอบสมมติฐาน"},
 g_ploy_sr:{main:[cN("พลอยรีบเก็บรูปเข้ากระเป๋า แต่ไม่ได้เดินหนีไปไหน"),{n:"ploy",f:"happy",l:"casual",t:"แม่เลิกมาดูฉันชกตั้งแต่ปีที่สอง บอกว่าใจไม่ไหว แต่ทุกไฟต์ แม่จะโทรมาถามว่าแพ้หรือชนะ"},{n:"ploy",f:"flustered",l:"casual",t:"เธอเป็นคนแรกที่ฉันเล่าเรื่องนี้ให้ฟังนะ อย่าเอาไปบอกใคร โดยเฉพาะฟ้า"}],lv2:[cN("ไฟต์ต่อมาของพลอย คุณเห็นผู้หญิงคนหนึ่งยืนอยู่หลังสุดของสนาม ใส่หมวกปีกกว้างปิดหน้า"),cN("พลอยชนะ แล้วหันไปโค้งให้หลังสนามก่อนจะโค้งให้กรรมการ"),{n:"ploy",f:"happy",l:"casual",t:"ฉันรู้นะ ว่าเธอเป็นคนส่งตั๋วไปให้แม่ …ไม่ต้องปฏิเสธ แม่บอกหมดแล้ว"}],lv3:[cN("พลอยนัดคุณที่ร้านถ่ายรูปเก่าแก่ในเมือง ร้านเดียวกับที่ถ่ายรูปใบนั้นเมื่อยี่สิบปีก่อน"),{n:"ploy",f:"happy",l:"casual",t:"แม่บอกว่าอยากได้รูปใหม่ไว้ข้างรูปเก่า ฉันเลยมา …แต่ไม่อยากถ่ายคนเดียว"},cP("ช่างภาพ","คุณผู้ชายยืนชิดอีกนิดครับ ใช่ ๆ คุณผู้หญิงยิ้มหน่อย ยิ้มแบบตอนชนะ"),{n:"ploy",f:"flustered",l:"casual",t:"ยิ้มแบบตอนชนะ ฉันไม่เคยยิ้มตอนชนะ… แบบนี้ได้ไหม"},{choice:[{t:"แอบทำหน้าตลกตอนกดชัตเตอร์",then:[cN("พลอยหลุดหัวเราะเต็มเสียง ช่างภาพกดได้ตรงจังหวะพอดี เป็นรูปที่พลอยยิ้มกว้างที่สุดที่เคยมี")]},{t:"ยืนนิ่ง ๆ ยิ้มตามปกติ",then:[cN("รูปออกมาเรียบร้อยสวยงาม พลอยมองอยู่นาน แล้วขอถ่ายเพิ่มอีกใบ ใบที่สองเธอเอียงหัวมาพิงไหล่คุณ")]}]},{n:"ploy",f:"happy",l:"casual",t:"กระเป๋าฉันมีรูปสองใบแล้ว ใบเก่าคือคนที่กลัวแทนฉัน ใบใหม่คือคนที่ยืนข้างฉัน"}],lv3t:"รูปใบที่สอง"},
 g_fah_sr:{main:[cN("ฟ้ายืนดูรุ้งจนมันจางหายไปหมด ถึงยอมหันกลับมา"),{n:"fah",f:"happy",l:"casual",t:"แม่ฟ้าชอบเต้นกลางฝน เปียกทั้งตัวแล้วหัวเราะ พ่อบอกว่าแม่บ้า ฟ้าว่าแม่เท่สุด"},{n:"fah",f:"pout",l:"casual",t:"ทุกวันนี้ฝนตกที ฟ้าก็อยากออกไปยืนกลางลาน แต่กลัวคนในค่ายว่าบ้าเหมือนกัน"}],lv2:[cN("บ่ายวันหนึ่งฝนตกหนัก ฟ้ามองออกไปที่ลานนิ่ง ๆ"),cN("คุณเดินออกไปยืนกลางฝนก่อน แล้วโบกมือเรียก"),{n:"fah",f:"happy",l:"casual",t:"นายบ้าไปแล้ว!! …รอฟ้าด้วย!!"},{n:"fah",f:"flustered",l:"casual",t:"หนาวชะมัด …แต่ฟ้าไม่เคยสนุกแบบนี้มานานแล้ว"}],lv3:[cN("ฝนแรกของหน้าฝน ทั้งค่ายศิริชัยออกมายืนกลางลานพร้อมกัน เพราะฟ้าลากทุกคนออกมาเอง"),{n:"fah",f:"happy",l:"casual",t:"กฎของฟ้า! ฝนแรกของปี ทุกคนต้องเต้น ห้ามหลบใต้หลังคา!"},{n:"coach",t:"พวกเอ็งเป็นหวัดกันหมดแน่ …เออ ข้าก็เต้นด้วยสักเพลง"},{choice:[{t:"เต้นท่าหุ่นยนต์ให้ฟ้าดู",then:[{n:"fah",f:"happy",l:"casual",t:"ฮ่า ๆ ๆ นายเต้นแย่ที่สุดในโลก! อีกรอบ! อีกรอบ!"}]},{t:"จับมือฟ้าหมุนรอบลาน",then:[{n:"fah",f:"flustered",l:"casual",t:"…นายหมุนเร็วไปแล้ว! …อย่าปล่อยนะ"}]}]},cN("ฝนหยุดตอนพลบค่ำ รุ้งพาดข้ามแม่น้ำอีกครั้ง ฟ้าไม่ได้ชี้ให้ใครดู เพราะทุกคนเห็นพร้อมกันแล้ว"),{n:"fah",f:"happy",l:"casual",t:"แม่… ฟ้าเจอคนที่ยอมบ้าไปกับฟ้าแล้วนะ"}],lv3t:"เต้นกลางฝน"},
 g_team_ssr:{main:[{n:"coach",t:"ฟิล์มม้วนนี้ ปู่ชัยซื้อไว้ตั้งแต่วันที่ค่ายเกือบปิด บอกว่าจะเก็บไว้ถ่ายรูปหมู่รุ่นที่พาค่ายกลับมาได้"},{n:"kati",f:"sad",l:"casual",t:"…ปู่รู้ด้วยเหรอคะว่าจะมีวันนี้"},{n:"coach",t:"แกไม่รู้หรอก แกแค่เชื่อ ซึ่งบางทีก็มากกว่ารู้"}],lv2:[cN("ฟิล์มกลับมาจากร้านล้างรูป ทุกคนมุงดูรูปที่ขยายใหญ่"),{n:"mali",f:"happy",l:"casual",t:"มะลิหลับตาค่ะ!! ทำไมไม่มีใครบอก!!"},{n:"rin",f:"happy",l:"casual",t:"ฉันนับแล้วค่ะ ในรูปนี้ทุกคนยิ้ม 100% ยกเว้นครูแดงที่ยิ้ม 60%"},{n:"coach",t:"ข้ายิ้มเต็มที่แล้วโว้ย หน้าข้ามันเป็นแบบนี้"}],lv3:[cN("ครบรอบหนึ่งปีของภาพหมู่ ครูแดงลากกลองแขกเก่าของปู่ชัยออกมากลางลาน"),{n:"coach",t:"สมัยปู่ชัย ทุกปีค่ายจะเตะกระสอบตามกลองพร้อมกันทั้งค่าย ใครหลุดจังหวะต้องล้างจานทั้งอาทิตย์"},{n:"kati",f:"happy",l:"casual",t:"หนูจำได้ค่ะ! หนูหลุดทุกปีเลย ล้างจานจนมือเปื่อย"},cN("ทุกคนยืนประจำกระสอบ แล้วไม้ตีกลองก็ถูกยัดใส่มือผู้จัดการ"),{n:"coach",t:"วันนี้ผู้จัดการตีกลอง ถ้าจังหวะเพี้ยน คนล้างจานคือผู้จัดการ"},{n:"kati",f:"happy",l:"casual",t:"ผู้จัดการ! จังหวะแรกเลยค่ะ! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"จังหวะเดียวกันทั้งค่าย",mg:"bag",mgt:"ตีกลองนำจังหวะให้ทั้งค่าย"},
 g_mali_ssr:{lv2:[cN("สองอาทิตย์ต่อมา กล่องพัสดุใบใหญ่จากไชยามาถึงค่าย จ่าหน้าถึง 'ผู้จัดการ' ไม่ใช่ถึงมะลิ"),cN("ข้างในมีไข่เค็มไชยาสองแผง น้ำพริกกุ้งเสียบหนึ่งกระปุก และจดหมายลายมือตัวโต ๆ"),cN("'ถึงผู้จัดการ แม่ให้น้องข้างบ้านเขียนให้ ฝากบอกมะลินอนเร็ว ๆ แล้วก็ ขอบใจที่ทำให้ลูกแม่หัวเราะทุกครั้งที่โทรมา'"),{n:"mali",f:"pout",l:"casual",t:"แม่ส่งของให้ผู้จัดการมากกว่าส่งให้หนูอีก! …หนูไม่น้อยใจหรอกค่ะ แค่นิดเดียว"}],lv3:[cN("หน้างานชักพระ มะลิชวนคุณกลับไปบ้านอีกครั้ง คราวนี้แม่ตั้งร้านส้มตำในงานวัด"),cP("แม่มะลิ","ลูกค้ามาเต็มเลย! มะลิตำครกนั้น ผู้จัดการตำครกนี้ ไว ๆ นะลูก!"),{n:"mali",f:"happy",l:"casual",t:"ผู้จัดการตำเป็นไหมคะ ไม่เป็นก็ไม่เป็นไร ตำตามจังหวะกลองชักพระเลยค่ะ"},{n:"mali",f:"happy",l:"casual",t:"พร้อมนะคะ! ครกแรก! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"ร้านส้มตำของแม่มะลิ",mg:"somtam",mgt:"ช่วยแม่มะลิตำส้มตำในงานบุญ"},
 g_rin_ssr:{lv2:[cN("รินเขียนสมุดเล่มใหม่ทุกคืน แต่ไม่มีตัวเลขสักตัว"),{n:"rin",f:"happy",l:"casual",t:"เป็นบันทึกความรู้สึกค่ะ วันนี้กะทิหุงข้าวไหม้ มะลิหัวเราะจนสำลัก ครูแดงแอบให้อาหารแมว"},{n:"rin",f:"flustered",l:"casual",t:"หน้านี้ฉันเว้นว่างไว้ให้คุณเขียนค่ะ …เขียนอะไรก็ได้ ฉันจะไม่วิเคราะห์ สัญญา"},{n:"rin",f:"pout",l:"casual",t:"…วิเคราะห์นิดเดียว ลายมือคุณเอียงขวา แปลว่าเป็นคนมองโลกในแง่ดีค่ะ"}],lv3:[cN("รินมาหาคุณที่ห้องซ้อมพร้อมไม้ตีกลองสองอัน กับกระดาษหนึ่งแผ่นเขียนว่า 'การทดลองที่ 1: ห้ามมีแผน'"),{n:"rin",f:"happy",l:"train",t:"คุณตีกลองแบบสุ่ม ไม่ต้องบอกล่วงหน้า ฉันจะเตะตามสัญชาตญาณอย่างเดียว"},{n:"coach",t:"ยัยแว่นจะซ้อมแบบไม่มีแผน โลกจะแตกแล้วมั้ง"},{n:"rin",f:"flustered",l:"train",t:"ครูแดงเงียบค่ะ! …ฉันพร้อมแล้ว ทั้งที่ไม่รู้ว่าจะเจออะไร (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"การทดลองที่ไม่มีแผน",mg:"bag",mgt:"ตีกลองแบบสุ่มให้รินเตะตามสัญชาตญาณ"},
 g_ploy_ssr:{lv2:[cN("เช้าวันอาทิตย์ แม่ของพลอยมาที่ค่ายพร้อมปิ่นโตสามชั้น"),cP("แม่พลอย","ตอนเด็ก ๆ พลอยกลัวความมืด ต้องเปิดไฟนอนจนอายุสิบสอง ห้ามบอกใครนะคะ"),{n:"ploy",f:"flustered",l:"casual",t:"แม่!! …เธอห้ามจำ ลบออกจากหัวเดี๋ยวนี้"},{n:"ploy",f:"happy",l:"casual",t:"…ไว้แวะไปบ้านแม่บ้างนะ แม่เก็บรูปตอนฉันชนะไว้ทุกใบ อยากให้เธอดูใบที่มีเธออยู่ด้วย"}],lv3:[cN("พลอยพาคุณไปบ้านแม่ บนผนังมีรูปตั้งแต่ไฟต์แรก มุมห้องมีกระสอบทรายใบเล็กที่หนังแตกจนเห็นนุ่น"),{n:"ploy",f:"happy",l:"casual",t:"กระสอบใบแรกของฉันเอง ตอนเด็ก ๆ แม่จะนั่งตบมือให้จังหวะ ฉันตีเข่าตามเสียงตบมือของแม่"},cP("แม่พลอย","ตบมือไม่ไหวแล้วจ้ะ ข้อมือแม่แก่แล้ว ผู้จัดการตีกลองให้แทนได้ไหมคะ"),{n:"ploy",f:"flustered",l:"train",t:"…ไม่ได้ตีกระสอบใบนี้มายี่สิบปีแล้ว ช่วยให้จังหวะทีนะ (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"กระสอบใบแรกของพลอย",mg:"bag",mgt:"ให้จังหวะเข่าแบบที่แม่พลอยเคยตบมือ"},
 g_kati_ssr:{lv2:[cN("หลังไฟต์ถัดมา กะทิยื่นข้อมือมาให้ดู มีด้ายขาวเส้นเล็ก ๆ ผูกอยู่ เป็นเศษด้ายเก่าจากมงคลของปู่"),{"n":"kati","f":"happy","l":"casual","t":"หนูแบ่งมาผูกไว้สองเส้นค่ะ เส้นหนึ่งของหนู …อีกเส้นของผู้จัดการ ยื่นมือมาสิคะ"},{"n":"kati","f":"flustered","l":"casual","t":"ห้ามแกะนะคะ ปู่บอกว่าด้ายมงคลจะขาดเองตอนที่เราไม่ต้องใช้มันแล้ว"}],lv3:[cN("งานวัดประจำปี ชาวบ้านขอให้ค่ายศิริชัยรำไหว้ครูเปิดเวทีมวยงานวัด แต่คนตีกลองไม่มา"),{"n":"kati","f":"happy","l":"thai","t":"ผู้จัดการตีกลองให้หนูได้ไหมคะ ตามจังหวะช้า ๆ แบบที่ปู่เคยตีให้ตอนหนูเด็ก ๆ"},{"n":"kati","f":"flustered","l":"thai","t":"หนูจะรำตามเสียงกลองของผู้จัดการนะคะ พร้อมแล้ว! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"กลองไหว้ครูของปู่",mg:"bag",mgt:"ตีกลองให้กะทิรำไหว้ครูเปิดเวทีงานวัด"},
 g_fah_ssr:{lv2:[cN("ฟ้ายื่นรูปโพลารอยด์ให้ เป็นภาพท้องฟ้าเช้าหลังพายุ มีลายเซ็นตัวโต ๆ ที่มุมล่าง"),{n:"fah",f:"happy",l:"casual",t:"ฟ้าถ่ายเช้าวันนั้นเลย ฟ้าที่สวยที่สุดคือฟ้าหลังพายุ เก็บไว้นะ ห้ามทำหาย"},{n:"fah",f:"flustered",l:"casual",t:"แล้วก็… หน้าฝนปีนี้ถ้าฟ้าร้องตอนกลางคืน ฟ้าขอมาเคาะประตูได้ไหม ไม่ได้กลัวนะ แค่ถาม"}],lv3:[cN("พายุลูกใหม่มาอีกแล้ว แต่คราวนี้ฟ้าลากกลองแขกมาวางกลางห้องทำงาน"),{n:"fah",f:"happy",l:"casual",t:"ฟ้าคิดออกแล้ว! ฟ้าร้องเมื่อไหร่ นายตีกลองให้ดังกว่า แล้วฟ้าจะเตะตามเสียงกลองแทน"},{n:"fah",f:"happy",l:"train",t:"แบบนี้ฟ้าจะได้ยินแต่เสียงกลองของนาย ไม่ได้ยินฟ้าร้องเลย ฉลาดไหมล่ะ!"},{n:"fah",f:"flustered",l:"train",t:"เริ่มเลย! ฟ้าร้องมาแล้ว! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"กลองกลบเสียงฟ้า",mg:"bag",mgt:"ตีกลองกลบเสียงฟ้าร้องให้ฟ้าเตะ"},
 lg_kati_sr:{lv2:[cN("เช้าวันรุ่งขึ้น คุณเจอกระทงใบเล็กของกะทิติดอยู่ที่ตลิ่งใต้ท่าน้ำ เทียนดับแล้ว"),cN("ใต้ฐานกระทงมีกระดาษพับเล็ก ๆ เปียกครึ่งแผ่น อ่านออกแค่คำเดียว 'ผู้จัดการ'"),{n:"kati",f:"flustered",l:"thai",t:"อย่าอ่านนะคะ!! …เทวดาอ่านไปแล้ว ผู้จัดการไม่ต้องอ่านก็ได้!"}],lv3:[cN("ลอยกระทงปีถัดมา กะทิมาพร้อมกระทงสองใบ ใบหนึ่งเขียนชื่อปู่ อีกใบเขียนชื่อค่าย"),{n:"kati",f:"happy",l:"thai",t:"ปีนี้หนูไม่ขอแล้วค่ะ หนูมาขอบคุณ"},{n:"kati",f:"sad",l:"thai",t:"ขอบคุณที่ค่ายยังอยู่ ขอบคุณที่ปู่ส่งผู้จัดการมา …หนูเชื่อว่าปู่ส่งมาจริง ๆ นะคะ"},{choice:[{t:"\"งั้นปีนี้ฉันขอแทนกะทิเอง\"",then:[{n:"kati",f:"flustered",l:"thai",t:"ผู้จัดการขออะไรคะ …ไม่ต้องบอก! หนูกลัวจะเขินตายตรงนี้"}]},{t:"ช่วยกะทิจุดเทียนทั้งสองใบ",then:[cN("ลมแรงจนเทียนดับสามรอบ คุณกับกะทิเอามือป้องไฟด้วยกันจนติด")]}]},cN("กระทงสองใบลอยออกไปพร้อมกัน ใบชื่อปู่ลอยนำ ใบชื่อค่ายลอยตาม"),{n:"kati",f:"happy",l:"thai",t:"ปีหน้าหนูจะทำสามใบค่ะ ใบที่สามเขียนชื่อผู้จัดการ"}],lv3t:"กระทงสองใบของกะทิ"},
 lg_mali_sr:{lv2:[cN("ปีต่อมา เวทีรำวงเดิม เพลงเดิม มะลิยืนรอที่ขอบวงตั้งแต่หัวค่ำ"),{n:"mali",f:"happy",l:"thai",t:"เห็นไหมคะ! คำของแม่จริง! เราได้กลับมารำด้วยกันอีกปี~"},{n:"mali",f:"flustered",l:"thai",t:"…ปีนี้ผู้จัดการรำถูกจังหวะแล้วด้วย แอบซ้อมมาใช่ไหมคะ"}],lv3:[cN("ผู้จัดงานรำวงมาตามหามะลิ เพราะนางรำนำวงป่วยกะทันหัน"),cP("ผู้จัดงานรำวง","หนูคนชุดไทยสีเหลืองน่ะ รำนำวงแทนหน่อยได้ไหม เห็นรำสวยมาสองปีแล้ว"),{n:"mali",f:"flustered",l:"thai",t:"มะลิเหรอคะ!? มะลิรำตามแม่มาเฉย ๆ ไม่เคยเรียน…"},{choice:[{t:"\"มะลิรำสวยที่สุดในวงแล้ว ขึ้นไปเลย\"",then:[cN("มะลิขึ้นนำวงด้วยมือสั่น ๆ แต่พอเพลงขึ้น ทั้งวงก็หมุนตามมือเธอ")]},{t:"\"ฉันจะรำอยู่แถวหน้าให้\"",then:[cN("คุณรำอยู่แถวหน้าสุด มะลิมองคุณทุกจังหวะ จนลืมไปเลยว่ากำลังนำคนทั้งวง")]}]},cN("จบเพลง คนทั้งลานปรบมือ ผู้จัดงานยื่นพวงมาลัยดอกมะลิให้หนึ่งพวง"),{n:"mali",f:"happy",l:"thai",t:"มะลิจะเอาไปฝากแม่ค่ะ …แล้วก็ ครึ่งหนึ่งเป็นของผู้จัดการ~"}],lv3t:"นางรำนำวง"},
 lg_rin_sr:{lv2:[cN("คืนถัดมา รินส่งไฟล์ตารางมาให้ ชื่อไฟล์ 'ผลการทดลองโคมลอย_v2'"),{n:"rin",f:"happy",l:"thai",t:"ฉันลองปล่อยโคมคนเดียวอีกสามลูกค่ะ ตกหมดทั้งสามลูก"},{n:"rin",f:"flustered",l:"thai",t:"ข้อสรุปทางสถิติค่ะ ตัวแปรที่ทำให้โคมลอยคือคุณ ปีหน้าต้องนับด้วยกันอีก"}],lv3:[cN("ลอยกระทงปีถัดมา รินมาพร้อมโคมลอยหนึ่งร้อยลูกใส่ลังกระดาษ"),{n:"rin",f:"happy",l:"thai",t:"ลูกแรกฉันลอยได้แล้ว อีกเก้าสิบเก้าลูกคือการชดเชยปีที่ไม่เคยลอยได้ค่ะ คำนวณย้อนหลังแล้ว"},cN("สองชั่วโมงต่อมา คุณกับรินนับถึงสี่สิบเจ็ดไปเก้าสิบเก้าครั้ง โคมทุกลูกลอยขึ้นตรง ๆ"),{choice:[{t:"\"ลูกสุดท้าย นับถอยหลังกันดีไหม\"",then:[{n:"rin",f:"happy",l:"thai",t:"นับถอยหลังจากสี่สิบเจ็ด… ไม่เคยลองค่ะ ตัวแปรใหม่ น่าสนใจ"}]},{t:"\"ลูกสุดท้าย ปล่อยตอนที่รินอยากปล่อย\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…ไม่ต้องนับเหรอคะ ฉันไม่เคยปล่อยอะไรโดยไม่นับเลยนะ"}]}]},cN("โคมลูกที่ร้อยลอยขึ้น ไปรวมกับดาวบนฟ้าจนแยกไม่ออก"),{n:"rin",f:"happy",l:"thai",t:"ร้อยลูกครบค่ะ …ปีหน้าเริ่มนับใหม่ที่หนึ่ง ด้วยกันอีกนะคะ"}],lv3t:"โคมลูกที่ร้อย"},
 lg_ploy_sr:{lv2:[cN("สัปดาห์ต่อมา ตุ๊กตาหมีจากงานลอยกระทงนั่งอยู่บนชั้นวางถ้วยรางวัลของค่ายศิริชัย"),cN("วันหนึ่งมันหายไป แล้วมีโน้ตวางแทน 'ยืมไปนอนกอดคืนเดียว คืนพรุ่งนี้ — แมว'"),{n:"ploy",f:"flustered",l:"thai",t:"…ไม่รู้เรื่องนะ แมวที่ไหนไม่รู้"}],lv3:[cN("ลอยกระทงปีถัดมา หน้ากากแมวสองอันวางอยู่หน้าประตูค่ายศิริชัย พร้อมโน้ต 'สามทุ่ม หน้าวัด'"),{n:"ploy",f:"happy",l:"thai",t:"ปีนี้มีแมวสองตัว จะได้ไม่มีใครจำได้ทั้งคู่"},cN("แมวสองตัวเดินงานจนทั่ว พลอยแพ้ปาเป้าให้เด็กอายุแปดขวบ และไม่บ่นเลยสักคำ"),{choice:[{t:"ชวนพลอยถอดหน้ากากตอนจุดพลุ",then:[{n:"ploy",f:"flustered",l:"thai",t:"…ถ้ามีคนจำได้ล่ะ"},cN("ไม่มีใครหันมามองเลยสักคน ทุกคนแหงนดูพลุ มีแค่คุณที่มองพลอย")]},{t:"ดูพลุทั้งหน้ากากแมว",then:[{n:"ploy",f:"happy",l:"thai",t:"แมวดูพลุ ไม่มีใครถ่ายรูป ไม่มีใครขอลายเซ็น …อยากให้คืนนี้ยาวกว่านี้"}]}]},{n:"ploy",f:"happy",l:"thai",t:"ปีหน้าเหมือนเดิมนะ แมวสองตัว ห้ามพาใครมาเพิ่ม"}],lv3t:"แมวสองตัวกลับมาเที่ยวงาน"},
 lg_fah_sr:{lv2:[cN("หลังงาน ฟ้าส่งรูปมาทางแชท กระทงสองใบติดอยู่ด้วยกันที่ประตูน้ำปลายคลอง"),{n:"fah",f:"happy",l:"thai",t:"เห็นไหม! มันไปติดด้วยกันจนจบเลย ฟ้าตามไปดูมาแล้ว เดินไปตั้งสองกิโล!"},{n:"fah",f:"flustered",l:"thai",t:"…ไม่ได้ตามไปเพราะห่วงนะ แค่อยากรู้ว่าใบเบี้ยวจะรอดไหม"}],lv3:[cN("ลอยกระทงปีถัดมา ฟ้านั่งเย็บกระทงอยู่ที่ระเบียงค่ายตั้งแต่บ่าย คราวนี้มีสามใบ"),{n:"fah",f:"pout",l:"thai",t:"ห้ามถาม! …ก็ได้ ใบที่สามของนาย นายต้องเย็บเองบ้าง ฟ้าเย็บให้ครึ่งเดียว"},cN("กระทงใบที่สามเบี้ยวกว่าใบเบี้ยวของปีที่แล้วเสียอีก ฟ้าหัวเราะจนน้ำตาไหล"),{choice:[{t:"\"เบี้ยวแบบนี้แหละ จะได้จำได้ว่าของใคร\"",then:[{n:"fah",f:"happy",l:"thai",t:"ก็จริงของนาย! ทั้งแม่น้ำมีใบเดียวที่น่าเกลียดขนาดนี้"}]},{t:"\"ฟ้าช่วยเย็บให้ตรงหน่อยได้ไหม\"",then:[{n:"fah",f:"flustered",l:"thai",t:"…จับมือเย็บด้วยกันก็ได้ ห้ามบอกใครนะว่าฟ้าใจดี"}]}]},cN("กระทงสามใบลอยเรียงกัน ใบสวยนำ ใบเบี้ยวสองใบตามติด ไม่ห่างกันเลยสักนิด"),{n:"fah",f:"happy",l:"thai",t:"ไม่มีใครต้องลอยคนเดียวอีกแล้วล่ะ ทั้งฟ้า ทั้งใบเบี้ยว"}],lv3t:"กระทงใบที่สาม"},
 lg_team_ssr:{lv2:[cN("รูปหมู่คืนลอยกระทงถูกล้างออกมา แสงแฟลชทำให้ทุกคนตาแดงเหมือนกันหมด"),{n:"fah",f:"happy",l:"thai",t:"ฮ่า ๆ ทุกคนหน้าเหมือนผีเลย! ฟ้าชอบรูปนี้ที่สุด!"},{n:"ploy",f:"happy",l:"thai",t:"ขอสำเนาใบนึง …ไม่ได้เอาไปทำอะไร แค่เก็บไว้"}],lv3:[cN("ปีถัดมา เทศบาลขอให้ค่ายศิริชัยเป็นขบวนกลองยาวนำแห่กระทงใหญ่"),{n:"coach",t:"ขบวนกลองยาวต้องเดินจังหวะเดียวกันทั้งขบวน ใครหลุดจังหวะ คนดูทั้งเมืองเห็นนะ"},{n:"rin",f:"happy",l:"thai",t:"ฉันวิเคราะห์เพลงไว้แล้วค่ะ 132 บีตต่อนาที คลาดได้ไม่เกินสามสิบมิลลิวินาที"},{n:"fah",f:"happy",l:"thai",t:"ฟ้าตีกลองใบใหญ่สุด!"},{n:"ploy",f:"flustered",l:"thai",t:"…ฉันถือป้ายหน้าขบวนก็พอ ไม่ต้องรำ"},cN("ผู้จัดการได้รับหน้าที่ตีกลองนำจังหวะ ทั้งขบวนรออยู่"),{n:"kati",f:"happy",l:"thai",t:"ผู้จัดการ! จังหวะแรกเลยค่ะ! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"ขบวนกลองยาวค่ายศิริชัย",mg:"bag",mgt:"ตีกลองยาวนำขบวน"},
};
Object.entries(CARD_LV).forEach(([id,X])=>{const C=CARDS[id];if(!C)return;if(X.main&&!C.mainDone){C.steps=C.steps.concat(X.main);C.mainDone=1;}C.lv2=X.lv2;C.lv3=X.lv3;C.lv3t=X.lv3t;if(X.mg){C.mg=X.mg;C.mgt=X.mgt;}C.rev=1;});
// v1.86 batch 2: one-copy story cards can't level, so their own stories grow instead (✦NEW for readers who saw the short version)
const CARD_MAIN={
 e_beatploy:[{n:"nar",t:"กะทิเดินเข้ามาในห้อง ยังไม่ได้ถอดนวม หยุดยืนอยู่ตรงประตู"},{n:"kati",f:"happy",l:"fight",t:"พี่พลอย… หนูมาขอบคุณค่ะ ถ้าพี่ไม่เก่งขนาดนั้น หนูคงไม่มีวันเก่งขึ้นได้ขนาดนี้"},{n:"ploy",f:"flustered",l:"fight",t:"…มาขอบคุณคนที่เพิ่งแพ้เธอเนี่ยนะ ค่ายศิริชัยนี่แปลกกันทั้งค่าย"},{n:"nar",t:"พลอยยื่นมือที่ยังพันผ้าครึ่งหนึ่งออกไป กะทิจับมือนั้นไว้แน่น"},{n:"ploy",f:"happy",l:"fight",t:"รอบหน้า ไม่มีใครต้องขอบคุณใคร มาชกกันให้สุดเท่านั้น"}],
 e_fahjoin:[{n:"nar",t:"คืนแรก ฟ้านอนไม่หลับ แอบออกมานั่งที่ม้านั่งหน้าค่าย"},{n:"fah",f:"sad",l:"casual",t:"เงียบจัง… ที่พยัคฆ์ทองมีเสียงพัดลมกับเสียงโค้ชตะโกนทั้งคืน ฟ้าชินกับเสียงดังไปแล้ว"},{n:"coach",t:"(ครูแดงวางแก้วโอวัลตินร้อนไว้ข้าง ๆ) นอนไม่หลับก็ดื่มนี่ซะ ค่ายนี้เงียบแบบนี้ทุกคืน เดี๋ยวก็ชิน"},{n:"fah",f:"flustered",l:"casual",t:"…ครูแดงใจดีกว่าที่คิดแฮะ อย่าไปบอกใครว่าฟ้าพูดแบบนี้"},{n:"fah",f:"happy",l:"casual",t:"พรุ่งนี้ฟ้าจะตื่นก่อนทุกคน! แล้วจะแย่งไข่เจียวชิ้นแรกให้ได้!"}],
 e_ployjoin:[{n:"nar",t:"สามสัปดาห์ต่อมา พลอยวางไม้ค้ำพิงผนัง แล้วเดินเองได้เป็นครั้งแรก"},{n:"kati",f:"happy",l:"casual",t:"พี่พลอยเดินได้แล้ว!! มะลิ! ริน! มาดูเร็ว!"},{n:"ploy",f:"flustered",l:"casual",t:"เบา ๆ หน่อย กะทิ …แค่เดินเอง ไม่ได้ชนะแชมป์โลก"},{n:"ploy",f:"happy",l:"casual",t:"แต่ก็นะ …ที่นี่เป็นที่แรกที่มีคนดีใจกับพี่ ในเรื่องที่ไม่ใช่การชนะ"},{n:"ploy",f:"happy",l:"casual",t:"ชาแก้วต่อไปพี่ชงเองนะ ทุกเช้า ตีห้า อย่าตื่นสายล่ะ"}],
 h_kati:[{n:"nar",t:"สิบนาทีต่อมา ประตูห้องกะทิแง้มออกมาอีกครั้ง"},{n:"kati",f:"flustered",l:"casual",t:"…ลืมบอกค่ะ ฝันดีนะคะ"},{n:"nar",t:"ประตูปิดเสียงดังปัง แล้วได้ยินเสียงกะทิกระโดดลงเตียงตามมา"},{n:"coach",t:"(เสียงจากห้องข้าง ๆ) ดึกแล้วโว้ย! จะนอนหรือจะตีกลอง!"},{n:"kati",f:"happy",l:"casual",t:"ขอโทษค่ะครูแดง! …หนูแค่ดีใจมากไปหน่อยเองค่ะ"}],
 h_mali:[{n:"nar",t:"มะลิปิดผนึกซอง แล้วลากคุณเดินไปตู้ไปรษณีย์หน้าตลาดด้วยกัน"},{n:"mali",f:"flustered",l:"casual",t:"หยอดพร้อมกันนะคะ นับหนึ่ง สอง… ผู้จัดการ! ยังไม่ถึงสามเลย!"},{n:"nar",t:"จดหมายตกลงไปในตู้ เสียงดังตุ๊บเบา ๆ"},{n:"mali",f:"happy",l:"casual",t:"ส่งแล้ว… ฉบับแรกที่ส่งจริงในชีวิตเลยค่ะ"},{n:"mali",f:"happy",l:"casual",t:"ทีนี้ผู้จัดการหนีไม่ได้แล้วนะ แม่รอกราบอยู่~"}],
 h_rin:[{n:"nar",t:"รินปิดสมุด แล้วเลื่อนมาให้คุณทั้งเล่ม"},{n:"rin",f:"happy",l:"casual",t:"สมุดเล่มนี้ ฉันให้คุณเก็บไว้ค่ะ ข้อมูลที่สำคัญที่สุด ควรอยู่กับตัวแปรที่เกี่ยวข้อง"},{n:"rin",f:"flustered",l:"casual",t:"ส่วนเล่มที่สิบสี่ หน้าแรกฉันจะเขียนสมการใหม่ มีตัวแปรสองตัว"},{n:"rin",f:"happy",l:"casual",t:"ไม่ต้องเดาค่ะว่าตัวแปรตัวที่สองคือใคร คำตอบนั่งอยู่ตรงนี้แล้ว"}],
 h_ploy:[{n:"nar",t:"พลอยหยิบหินแบนอีกก้อนยื่นให้คุณ"},{n:"ploy",f:"happy",l:"casual",t:"ตาเธอบ้าง ถ้ากระโดดได้เกินเจ็ด พลอยจะ… อืม ยังไม่รู้ ค่อยคิด"},{n:"nar",t:"หินของคุณกระโดดได้สามครั้ง แล้วจมหายไป"},{n:"ploy",f:"happy",l:"casual",t:"ฮ่า ๆ สามครั้ง ไม่เป็นไร พรุ่งนี้มาฝึกใหม่ ตรงนี้ เวลาเดิม"},{n:"ploy",f:"flustered",l:"casual",t:"…นั่นไม่ได้แปลว่าชวนเดตนะ เป็นการฝึกโยนหิน เข้าใจไหม"}],
 h_fah:[{n:"nar",t:"ทั้งค่ายแอบดูอยู่หลังหน้าต่าง กะทิกับมะลิกระซิบกันเสียงดังกว่าคนปกติตะโกน"},{n:"fah",f:"pout",l:"casual",t:"พวกนั้นแอบดูอยู่!! …ช่างมัน! ฟ้าไม่อาย!"},{n:"fah",f:"flustered",l:"casual",t:"…อายนิดหน่อย"},{n:"nar",t:"ฟ้าจับมือคุณชูขึ้นฟ้าเหมือนกรรมการชูมือผู้ชนะ"},{n:"fah",f:"happy",l:"casual",t:"ประกาศ! ผู้จัดการค่ายศิริชัยเป็นของฟ้าหลังฝนคนนี้แล้ว! ใครไม่เห็นด้วยมาชกกับฟ้า!"}],
 m_baghard:[{n:"nar",t:"คืนนั้น กระดาษตารางว่างแผ่นนั้นถูกแปะไว้บนผนังห้องรินจริง ๆ ข้างใต้มีตัวหนังสือเล็ก ๆ"},{n:"nar",t:"'วันที่ไม่มีอะไรให้แก้ — ทีมนี้เก่งพอแล้ว'"},{n:"rin",f:"happy",l:"casual",t:"อ่านแล้วเหรอคะ …ตัวหนังสือเล็กขนาดนั้นยังเห็นอีก สายตาดีเกินไปค่ะผู้จัดการ"}],
 m_livehot:[{n:"nar",t:"ลูกค้าคนที่สามสิบเอ็ดคือป้าแต๋วร้านส้มตำ"},{n:"npc",who:"ป้าแต๋ว",t:"ไม่เป็นไรลูก ป้ารอล็อตหน้าได้ ขอลายเซ็นทุกคนบนเสื้อนะ"},{n:"fah",f:"happy",l:"casual",t:"ลายเซ็นฟ้าใหญ่สุด! เต็มหลังเสื้อเลย!"},{n:"rin",f:"pout",l:"casual",t:"ฉันจะเซ็นตัวเล็กมุมขวาล่างค่ะ เหลือพื้นที่ให้ทุกคน …ตามสัดส่วนที่คำนวณแล้ว"}],
 e_champ:[{n:"nar",t:"เช้าวันต่อมา คนทั้งซอยมามุงหน้าค่าย ป้าแต๋วเอาส้มตำมาสามครก ลุงช่างเงินมาพร้อมผ้าไหมห่อเข็มขัด"},{n:"kati",f:"happy",l:"casual",t:"ทุกคนมาทำไมเยอะแยะคะ!? …มาดูเข็มขัดเหรอ"},{n:"coach",t:"มาดูค่ายที่ฟื้นจากตายต่างหาก สิบปีที่แล้วซอยนี้ไม่มีใครเชื่อว่าศิริชัยจะรอด"},{n:"nar",t:"กะทิยกเข็มขัดขึ้นเหนือหัว คนทั้งซอยปรบมือเสียงดังจนไก่ชนข้างบ้านขันตาม"},{n:"kati",f:"happy",l:"casual",t:"ปีหน้ามาดูอีกนะคะ! ศิริชัยจะเอาเส้นที่สองมาให้ดู!"}],
};
Object.entries(CARD_MAIN).forEach(([id,L])=>{const C=CARDS[id];if(!C||C.mainDone2)return;C.steps=C.steps.concat(L);C.mainDone2=1;C.rev=Math.max(C.rev||0,1);});
// v1.86 batch 3: N/R cards — gacha/Loy cards gain Lv.2 epilogues and Lv.3 scenes, story cards grow their main story
const CARD_LV3={
 g_kati_n:{main:[{n:"kati",f:"happy",l:"casual",t:"ผืนนี้ของมะลิ ผืนนี้ของริน หนูจำได้ทุกผืนเลยค่ะ ดูจากรอยขาดตรงนิ้วโป้ง"},{n:"nar",t:"ลมพัดผ้าพันมือผืนหนึ่งหลุดจากราว ปลิวไปตกที่ไหล่คุณพอดี"},{n:"kati",f:"flustered",l:"casual",t:"อ๊ะ ผืนนั้นของหนู! …ผู้จัดการช่วยหนีบคืนให้หน่อยนะคะ"}],lv2:[{n:"nar",t:"เย็นนั้นกะทิเก็บผ้าพันมือที่แห้งแล้ว พับเป็นม้วนเรียงใส่ตะกร้า"},{n:"kati",f:"happy",l:"casual",t:"ผืนที่ผู้จัดการหนีบให้ หนูจะใช้ขึ้นชกไฟต์หน้าค่ะ"},{n:"kati",f:"flustered",l:"casual",t:"…ไม่ได้มีความหมายพิเศษนะคะ แค่มันแห้งดีที่สุด"}],lv3:[{n:"nar",t:"วันครบรอบค่าย กะทิยื่นถุงผ้าให้คุณหนึ่งใบ ข้างในมีผ้าพันมือสีแดงคู่ใหม่"},{n:"kati",f:"happy",l:"casual",t:"หนูซื้อด้วยเงินรางวัลไฟต์แรกค่ะ เก็บไว้ทั้งปีเลย"},{n:"kati",f:"happy",l:"casual",t:"ผู้จัดการต้องพันมือเป็นนะคะ เดี๋ยวหนูสอน มือซ้ายก่อน วนข้อมือสามรอบ"},{choice:[{t:"ยื่นมือให้กะทิพันให้",then:[{n:"nar",t:"กะทิพันช้ามาก ช้ากว่าที่พันให้ตัวเองสามเท่า แต่ไม่มีใครรีบ"}]},{t:"\"ฉันพันเองได้ กะทิดูอยู่ข้าง ๆ\"",then:[{n:"kati",f:"happy",l:"casual",t:"พันผิดค่ะ! หลวมไปหมด …มานี่ หนูพันใหม่ให้เอง"}]}]},{n:"kati",f:"happy",l:"casual",t:"ทีนี้เราก็มีผ้าพันมือสีเดียวกันแล้ว ทีมเดียวกันจริง ๆ"}],lv3t:"ผ้าพันมือคู่ใหม่"},
 g_mali_n:{main:[{n:"nar",t:"ลูกอมเม็ดสุดท้ายในกำมือ มะลิเก็บไว้ในกระเป๋าเสื้อแทนที่จะแจก"},{n:"mali",f:"flustered",l:"train",t:"เม็ดนี้ของผู้จัดการค่ะ …รสมะขามเปรี้ยวที่สุด มะลิเลือกให้เอง~"}],lv2:[{n:"nar",t:"สัปดาห์ต่อมา กล่องพัสดุจากบ้านมะลิมาถึงค่าย ข้างในมีลูกอมมะขามสามโหล"},{n:"mali",f:"happy",l:"casual",t:"แม่ส่งมาค่ะ! เขียนว่า 'ฝากแบ่งผู้จัดการด้วย' …แม่รู้ได้ยังไงนะ"},{n:"mali",f:"flustered",l:"casual",t:"…มะลิไม่ได้เล่าให้แม่ฟังเรื่องลูกอมเม็ดนั้นนะคะ ไม่ได้เล่าจริง ๆ"}],lv3:[{n:"nar",t:"บ่ายวันหยุด มะลิยึดครัวค่าย เคี่ยวมะขามกับน้ำตาลจนหอมไปทั้งค่าย"},{n:"mali",f:"happy",l:"casual",t:"สูตรแม่ค่ะ เคี่ยวจนเหนียวแล้วปั้นเป็นเม็ด ผู้จัดการช่วยปั้นหน่อยนะคะ"},{n:"nar",t:"ลูกอมของมะลิกลมเท่ากันทุกเม็ด ของคุณมีทั้งรูปหัวใจ รูปดาว และรูปที่ไม่มีใครรู้ว่าอะไร"},{choice:[{t:"\"อันนี้รูปมะลินะ\"",then:[{n:"mali",f:"flustered",l:"casual",t:"ตรงไหนเหมือนมะลิคะ!? …แต่มะลิจะเก็บเม็ดนี้ไว้ ไม่กิน"}]},{t:"แอบชิมระหว่างปั้น",then:[{n:"mali",f:"flustered",l:"casual",t:"ผู้จัดการ! ชิมไปห้าเม็ดแล้วนะ! …อร่อยไหมคะ"}]}]},{n:"mali",f:"happy",l:"casual",t:"ปีหน้ามะลิจะส่งลูกอมสูตรนี้ไปให้แม่ บอกว่าผู้จัดการช่วยปั้นด้วย"}],lv3t:"สูตรลูกอมของแม่"},
 g_rin_n:{main:[{n:"nar",t:"สัปดาห์นั้น หน้าสถิติของรินมีหมึกสีเขียวมากกว่าทุกสัปดาห์"},{n:"rin",f:"happy",l:"casual",t:"ผลงานนักมวยดีขึ้น 8% ในสัปดาห์ที่มีสีเขียวเยอะ ฉันแนะนำให้คุณยิ้มต่อไปค่ะ เพื่อประโยชน์ของค่าย"}],lv2:[{n:"nar",t:"ปากกาสีเขียวของรินหมึกหมดกลางคัน"},{n:"rin",f:"flustered",l:"casual",t:"…หมดเร็วกว่าแดงกับน้ำเงินรวมกันค่ะ ข้อมูลนี้ฉันไม่ได้คาดไว้"},{n:"nar",t:"เช้าวันต่อมา บนโต๊ะรินมีปากกาสีเขียวโหลใหม่ ไม่มีชื่อคนให้"},{n:"rin",f:"happy",l:"casual",t:"…ขอบคุณค่ะ ใครก็ไม่รู้ ที่ยิ้มบ่อย ๆ"}],lv3:[{n:"nar",t:"รินยืนอยู่หน้าร้านเครื่องเขียน ลังเลระหว่างปากกาสองด้ามมาสิบห้านาทีแล้ว"},{n:"rin",f:"flustered",l:"casual",t:"ฉันอยากเพิ่มสีที่สี่ค่ะ สำหรับบันทึกช่วงที่… คุณยิ้มให้ฉัน ไม่ใช่ให้นักมวย"},{n:"rin",f:"happy",l:"casual",t:"ต้องแยกตัวแปรค่ะ ไม่งั้นข้อมูลปนกัน"},{choice:[{t:"เลือกสีชมพูให้",then:[{n:"rin",f:"flustered",l:"casual",t:"ชมพู… ไม่เป็นทางการเลย แต่ฉันจะใช้ค่ะ"}]},{t:"เลือกสีม่วงให้",then:[{n:"rin",f:"happy",l:"casual",t:"ม่วงอยู่ระหว่างแดงกับน้ำเงิน ระหว่างพลาดกับเข้าเป้า …เหมาะดีค่ะ"}]}]},{n:"nar",t:"สัปดาห์ต่อมา หน้าสถิติของรินมีหมึกสีที่สี่ปรากฏขึ้น ไม่มากนัก แต่มีทุกวัน"}],lv3t:"สีที่สี่"},
 g_ploy_n:{main:[{n:"nar",t:"คุณนั่งลงข้างพลอยเงียบ ๆ ไม่ได้ยื่นมือไปหาแมว"},{n:"nar",t:"สองนาทีต่อมา แมวเดินกลับมาเอง แล้วถูหัวกับเข่าพลอย"},{n:"ploy",f:"flustered",l:"casual",t:"…มันกลับมาเพราะเธอนั่งเงียบ ๆ เป็นเพื่อนต่างหาก ไม่ใช่เพราะฉัน"}],lv2:[{n:"nar",t:"แมวตัวนั้นเริ่มมารอที่ท่าน้ำทุกเย็น ตรงเวลาที่พลอยมาวิ่ง"},{n:"ploy",f:"happy",l:"casual",t:"ฉันตั้งชื่อให้แล้ว ชื่อ 'กรรมการ' เพราะมันจ้องฉันวิ่งเหมือนให้คะแนน"},{n:"ploy",f:"flustered",l:"casual",t:"…อย่าหัวเราะ ชื่อดีจะตาย"}],lv3:[{n:"nar",t:"ฝนตกหนักทั้งคืน เช้ามาพลอยยืนอยู่หน้าประตูค่ายศิริชัย ในเสื้อกันฝนมีแมวตัวเปียกโผล่หัวออกมา"},{n:"ploy",f:"sad",l:"casual",t:"ที่พยัคฆ์ทองห้ามเลี้ยงสัตว์ …ค่ายเธอรับไว้ได้ไหม แค่ชั่วคราว"},{n:"coach",t:"ค่ายนี้รับทุกคนที่ไม่มีที่ไป รวมถึงแมวด้วย ส่งมานี่"},{choice:[{t:"\"พลอยมาเยี่ยมกรรมการได้ทุกวันนะ\"",then:[{n:"ploy",f:"happy",l:"casual",t:"…ทุกวันเลยเหรอ งั้นฉันจะวิ่งผ่านทางนี้ทุกเย็น"}]},{t:"อุ้มแมวออกจากเสื้อกันฝนของพลอย",then:[{n:"nar",t:"แมวไม่ดิ้นเลย แต่หันกลับไปร้องเรียกพลอยเสียงเบา ๆ ตลอดทาง"}]}]},{n:"ploy",f:"happy",l:"casual",t:"ฝากด้วยนะ กรรมการ …ดูแลผู้จัดการค่ายนี้แทนฉันด้วย"}],lv3t:"กรรมการย้ายบ้าน"},
 g_fah_n:{main:[{n:"nar",t:"รูปที่สามสิบเอ็ด ฟ้าดึงแขนคุณเข้ามาในเฟรมด้วย"},{n:"fah",f:"happy",l:"casual",t:"รูปนี้แหละ! ฟ้าหน้าตลกที่สุด แต่ชอบที่สุด!"},{n:"fah",f:"flustered",l:"casual",t:"…ห้ามโพสต์นะ ฟ้าจะตั้งเป็นวอลเปเปอร์เอง ห้ามใครเห็น"}],lv2:[{n:"nar",t:"สามวันต่อมา มะลิแอบเห็นหน้าจอมือถือฟ้าตอนฟ้าหลับในห้องพัก"},{n:"mali",f:"happy",l:"casual",t:"ฟ้าตั้งรูปคู่เป็นวอลเปเปอร์ค่ะ!! มะลิเห็นแล้ว!!"},{n:"fah",f:"flustered",l:"casual",t:"มะลิ!!! …ไม่ใช่รูปคู่! มันแค่… มีคนเข้าเฟรมมาเอง!"}],lv3:[{n:"nar",t:"งานวัดปีต่อมา ฟ้าลากคุณเข้าตู้ถ่ายรูปสติกเกอร์ ม่านปิดลง เหลือแค่สองคนกับจอสี่เหลี่ยม"},{n:"fah",f:"happy",l:"casual",t:"ตู้นี้ถ่ายได้สี่รูป! ฟ้าคิดท่ามาตั้งแต่เมื่อคืนแล้ว ท่าแรก แมวโกรธ!"},{n:"nar",t:"รูปที่หนึ่งแมวโกรธ รูปที่สองต่อยหน้ากล้อง รูปที่สามฟ้าหัวเราะจนลืมทำท่า"},{choice:[{t:"รูปที่สี่ ทำท่าหัวใจคู่กัน",then:[{n:"fah",f:"flustered",l:"casual",t:"…ท่านั้นฟ้าไม่ได้ซ้อมมา! …ทำก็ได้ แค่รูปเดียวนะ"}]},{t:"รูปที่สี่ ยกฟ้าขึ้นเหมือนชูถ้วยแชมป์",then:[{n:"fah",f:"happy",l:"casual",t:"ว้าย! ฟ้าเป็นถ้วยรางวัลเหรอ! …ถ้วยที่สวยที่สุดในโลกเลยนะ!"}]}]},{n:"fah",f:"happy",l:"casual",t:"สติกเกอร์แผ่นนี้ฟ้าแปะหลังมือถือ ใครถามก็บอกว่าเป็นคู่ซ้อม"}],lv3t:"ตู้สติกเกอร์"},
 lg_kati_n:{lv2:[{n:"nar",t:"กระทงหน้าตาเหมือนหมวกกันน็อกของคุณลอยไปไกลกว่ากระทงสวย ๆ ทั้งเจ็ดใบของกะทิ"},{n:"kati",f:"happy",l:"thai",t:"เห็นไหมคะ! ทรงหมวกกันน็อกต้านลมได้ดีกว่า! หนูจะจดสูตรไว้"},{n:"kati",f:"flustered",l:"thai",t:"…ปีหน้าพับให้หนูอีกใบนะคะ หนูไม่ลอยใบสวยแล้ว"}],lv3:[{n:"nar",t:"ลอยกระทงปีถัดมา กะทิตั้งโต๊ะขายกระทงหน้าค่าย ป้ายเขียนว่า 'กระทงทรงหมวกกันน็อก สูตรผู้จัดการ'"},{n:"kati",f:"happy",l:"thai",t:"ขายดีมากเลยค่ะ! เด็ก ๆ ในซอยชอบกันใหญ่ บอกว่าเท่เหมือนนักมวย"},{n:"nar",t:"ก่อนหมดงาน เหลือกระทงใบสุดท้ายใบเดียว กะทิเก็บไว้ข้างตัวตลอดทั้งคืน"},{choice:[{t:"\"ใบสุดท้ายไม่ขายเหรอ\"",then:[{n:"kati",f:"flustered",l:"thai",t:"ใบนี้ไม่ขายค่ะ ใบนี้ผู้จัดการพับเอง …หนูจะลอยคู่กับผู้จัดการ"}]},{t:"ช่วยกะทินับเงินท้ายงาน",then:[{n:"nar",t:"เงินที่ขายได้ กะทิแบ่งครึ่งหนึ่งใส่ตู้บริจาควัด อีกครึ่งซื้อขนมครกเลี้ยงทั้งค่าย"}]}]},{n:"kati",f:"happy",l:"thai",t:"ปีนี้หนูไม่ได้ขออะไรเลยค่ะ เพราะได้ทุกอย่างแล้ว"}],lv3t:"ร้านกระทงหน้าค่าย"},
 lg_kati_r:{lv2:[{n:"nar",t:"วันต่อมา กะทิพูดไม่ชัดทั้งวัน ทุกประโยคฟังเหมือนมีลูกอมอยู่ในปาก"},{n:"coach",t:"กะทิ วันนี้เอ็งพูดอะไรครูฟังไม่ออกสักคำ ไปกินขนมครกร้อน ๆ มาใช่ไหม"},{n:"kati",f:"flustered",l:"thai",t:"ม่ายช่ายค่ะคูแดง! หนูไม่ได้กินขนมคก!"}],lv3:[{n:"nar",t:"ปีถัดมา ร้านขนมครกบนเรือเจ้าเดิมขาดคนช่วย เจ้าของร้านเห็นกะทิแล้วโบกมือเรียก"},{n:"npc",who:"แม่ค้าขนมครก",t:"หนูคนลวกลิ้นปีที่แล้วนี่! มาช่วยป้าหยอดแป้งหน่อย ป้าให้กินฟรี"},{n:"nar",t:"กะทิหยอดแป้ง คุณเป็นคนแคะ ถาดแรกออกมาเบี้ยว ถาดที่สามสวยจนป้าชม"},{choice:[{t:"เป่าขนมครกให้เย็นก่อนป้อนกะทิ",then:[{n:"kati",f:"flustered",l:"thai",t:"…ปีนี้ไม่ลวกลิ้นแล้วค่ะ แต่หน้าหนูร้อนแทน"}]},{t:"ท้ากะทิว่าใครแคะสวยกว่ากัน",then:[{n:"kati",f:"happy",l:"thai",t:"หนูชนะค่ะ! …ป้าบอกว่าเสมอ ป้าลำเอียงให้ผู้จัดการ!"}]}]},{n:"kati",f:"happy",l:"thai",t:"คืนวันเพ็ญปีหน้า มาช่วยป้าอีกนะคะ ขนมครกที่หยอดเองอร่อยกว่าเยอะเลย"}],lv3t:"ขนมครกฝีมือผู้จัดการ"},
 lg_mali_n:{lv2:[{n:"nar",t:"ปีต่อมา มะลิอบกระทงขนมปังมาสองใบ ใบหนึ่งใหญ่ ใบหนึ่งเล็ก"},{n:"mali",f:"happy",l:"thai",t:"ใบเล็กโยนให้ปลาก่อนค่ะ ล่อมันไปทางนู้น ใบใหญ่จะได้ลอยรอดจนอธิษฐานจบ~"},{n:"mali",f:"flustered",l:"thai",t:"แผนนี้มะลิคิดมาทั้งปีเลยนะคะ ห้ามหัวเราะ"}],lv3:[{n:"nar",t:"แผนของมะลิใช้ได้แค่สามวินาที ปลาสวายตัวใหญ่ที่สุดในแม่น้ำว่ายข้ามมากินใบใหญ่โดยไม่สนใบเล็กเลย"},{n:"mali",f:"flustered",l:"thai",t:"ปลาตัวนี้ฉลาดกว่ามะลิอีก!! ผู้จัดการ ช่วยด้วย!"},{choice:[{t:"ยื่นกระทงขนมปังของตัวเองให้มะลิ",then:[{n:"mali",f:"happy",l:"thai",t:"ผู้จัดการอบมาด้วยเหรอคะ!? …ทรงเบี้ยวมาก แต่ปลาคงไม่กล้ากิน~"}]},{t:"ช่วยมะลิอธิษฐานให้เร็วขึ้น",then:[{n:"nar",t:"คุณกับมะลิพนมมืออธิษฐานพร้อมกันเร็วที่สุดในชีวิต ทันพอดีก่อนกระทงจมหาย"}]}]},{n:"mali",f:"happy",l:"thai",t:"ปีหน้ามะลิจะอบกระทงให้ปลาแยกต่างหากเลยค่ะ ใบหนึ่งให้ปลา ใบหนึ่งให้เรา"}],lv3t:"ปลาสวายตัวแม่"},
 lg_mali_r:{lv2:[{n:"nar",t:"หนึ่งเดือนต่อมา มีห่อผ้ามาวางบนโต๊ะผู้จัดการ ข้างในเป็นเสื้อผ้าฝ้ายพื้นเมืองสีเดียวกับชุดของมะลิ"},{n:"mali",f:"happy",l:"thai",t:"ลองใส่ดูสิคะ! …พอดีเป๊ะ! สายวัดมะลิไม่เคยโกหก~"},{n:"mali",f:"flustered",l:"thai",t:"…ตัวเลขในหน้าพิเศษก็ไม่โกหกเหมือนกันค่ะ"}],lv3:[{n:"nar",t:"ลอยกระทงปีถัดมา ทั้งค่ายศิริชัยใส่ชุดที่มะลิตัดเองทุกคน เดินในขบวนแห่กระทงใหญ่"},{n:"npc",who:"พิธีกรขบวนแห่",t:"ค่ายมวยศิริชัยครับ! ชุดสวยที่สุดในขบวนปีนี้ ใครตัดให้ครับ!"},{n:"mali",f:"flustered",l:"thai",t:"มะลิเองค่ะ! …เย็บทั้งเดือนเลย นิ้วโดนเข็มตำสิบเจ็ดครั้ง"},{choice:[{t:"จับมือมะลิยกขึ้นให้คนดูปรบมือ",then:[{n:"mali",f:"happy",l:"thai",t:"ผู้จัดการ! …คนทั้งถนนปรบมือให้มะลิเลย~"}]},{t:"\"ชุดของฉันสวยที่สุดในขบวน\"",then:[{n:"mali",f:"flustered",l:"thai",t:"ก็ต้องสวยที่สุดสิคะ ตัวนั้นมะลิตั้งใจที่สุด"}]}]},{n:"mali",f:"happy",l:"thai",t:"ปีหน้ามะลิจะตัดให้คนในซอยด้วย ค่ายเราจะได้มีขบวนของตัวเอง"}],lv3t:"ชุดคู่ในขบวนแห่"},
 lg_rin_n:{lv2:[{n:"nar",t:"สามวันต่อมา เทศบาลโทรมาหาริน ขอใช้ข้อมูลของเธอทำป้ายรณรงค์ลดกระทงโฟม"},{n:"rin",f:"happy",l:"thai",t:"ข้อมูลของฉันจะอยู่บนป้ายริมแม่น้ำค่ะ ตัวเลขสีแดง ขนาดหนึ่งเมตร"},{n:"rin",f:"flustered",l:"thai",t:"…ฉันขอให้ใส่ชื่อค่ายศิริชัยไว้ด้านล่างด้วย ไม่ได้ใส่ชื่อตัวเองนะคะ"}],lv3:[{n:"nar",t:"ลอยกระทงปีถัดมา รินได้เป็นหัวหน้าอาสานับกระทงของเทศบาล มีป้ายห้อยคอด้วย"},{n:"rin",f:"happy",l:"thai",t:"ปีนี้ฉันมีผู้ช่วยหนึ่งคนค่ะ ตำแหน่งผู้ช่วยนับ ฝั่งซ้ายของท่าเรือเป็นของคุณ"},{n:"nar",t:"ตีหนึ่ง ตัวเลขของสองฝั่งต่างกันแค่สามใบ"},{choice:[{t:"\"ฝั่งฉันนับพลาดเองแหละ\"",then:[{n:"rin",f:"happy",l:"thai",t:"คลาดเคลื่อนแค่ 0.07% ค่ะ สำหรับมือใหม่ถือว่ายอดเยี่ยม"}]},{t:"\"สามใบนั้นเป็นของเราเองหรือเปล่า\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…จับได้แล้ว ฉันกดนับกระทงของเราสองคนไว้ตั้งแต่ต้นคืน ข้อมูลส่วนตัวค่ะ"}]}]},{n:"rin",f:"happy",l:"thai",t:"ปีหน้าเป็นผู้ช่วยฉันอีกนะคะ ตำแหน่งนี้ไม่เปิดรับสมัครคนอื่น"}],lv3t:"อาสานับกระทง"},
 lg_rin_r:{lv2:[{n:"nar",t:"รินเปิดดูรูปทั้งหมดในมือถือ แล้วลบรูปที่เห็นแต่คางทิ้ง"},{n:"rin",f:"flustered",l:"thai",t:"รูปที่เห็นนิ้วครึ่งจอฉันไม่ลบค่ะ …มันเป็นรูปแรกในชีวิตที่ฉันตั้งใจถ่ายคู่กับใคร"},{n:"rin",f:"happy",l:"thai",t:"ฉันจะเรียนถ่ายเซลฟี่ค่ะ อ่านวิธีมาแล้วสามบทความ"}],lv3:[{n:"nar",t:"ปีถัดมา รินยกมือถือขึ้นสูงสี่สิบห้าองศา หันหน้าเข้าแสงไฟ นับหนึ่งถึงสามในใจ"},{n:"rin",f:"happy",l:"thai",t:"มุมนี้บิดสัดส่วนหน้าน้อยที่สุดค่ะ แสงด้านข้างช่วยลดเงาใต้ตา ยิ้มตอนนับสาม"},{n:"nar",t:"รูปออกมาสวยสมบูรณ์แบบ รินมองหน้าจอนิ่ง ๆ"},{choice:[{t:"\"สวยกว่ารูปนิ้วอีกนะ\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…แต่ฉันยังชอบรูปนิ้วมากกว่าค่ะ ไม่มีเหตุผลทางสถิติ"}]},{t:"แอบถ่ายอีกรูปตอนรินไม่ทันตั้งตัว",then:[{n:"rin",f:"flustered",l:"thai",t:"นั่นไม่อยู่ในสูตรค่ะ! …ส่งรูปนั้นมาให้ฉันด้วย"}]}]},{n:"rin",f:"happy",l:"thai",t:"สองรูปนี้ฉันเก็บไว้ในโฟลเดอร์ชื่อ 'ข้อมูลสำคัญ' ค่ะ"}],lv3t:"เซลฟี่ตามสูตร"},
 lg_ploy_n:{lv2:[{n:"nar",t:"คุณถ่ายรูปคู่กับป้ายจริง ๆ แล้วส่งไปให้พลอยทางแชท"},{n:"ploy",f:"happy",l:"thai",t:"(ส่งสติกเกอร์เสือยิ้มกลับมา) …ตั้งเป็นรูปโปรไฟล์ก็ได้นะ ถ้ากล้าพอ"},{n:"ploy",f:"flustered",l:"thai",t:"(อีกห้านาทีต่อมา) เดี๋ยว ล้อเล่น! อย่าตั้งจริง!"}],lv3:[{n:"nar",t:"ปีถัดมา บริษัทเครื่องดื่มขอถ่ายป้ายชุดไทยใหม่ พลอยตกลงด้วยเงื่อนไขเดียว ต้องถ่ายที่ค่ายศิริชัย"},{n:"npc",who:"ช่างภาพโฆษณา",t:"พลอยครับ ยิ้มแบบปีที่แล้วได้ไหมครับ ยิ้มแบบนั้นขายดีมาก"},{n:"ploy",f:"flustered",l:"thai",t:"ยิ้มแบบนั้นต้องถ่ายสี่สิบรอบนะ …เธอยืนหลังกล้องหน่อยได้ไหม"},{choice:[{t:"ยืนหลังกล้องแล้วทำหน้าตลก",then:[{n:"nar",t:"พลอยยิ้มกว้างตั้งแต่ช็อตแรก ช่างภาพบอกว่าเป็นการถ่ายที่เร็วที่สุดในอาชีพ"}]},{t:"ยืนหลังกล้องเฉย ๆ แล้วพยักหน้า",then:[{n:"nar",t:"พลอยมองมาที่คุณ แล้วยิ้มออกมาเอง ช็อตที่สามก็ได้รูปที่ใช้"}]}]},{n:"ploy",f:"happy",l:"thai",t:"ป้ายใหม่มีโลโก้ค่ายศิริชัยตรงมุมด้วย ฉันขอเอง ถือว่าเป็นค่าเช่าสถานที่"}],lv3t:"ถ่ายป้ายใหม่ที่ศิริชัย"},
 lg_ploy_r:{lv2:[{n:"nar",t:"คืนนั้น พลอยลอยกระทงของปีนี้ แล้วหยิบกระดาษพับเล็ก ๆ ใบหนึ่งวางลงไปในกระทงด้วย"},{n:"ploy",f:"sad",l:"thai",t:"ใบเสร็จห้าสิบบาทเมื่อสิบกว่าปีก่อน ฉันเก็บไว้ในกระเป๋าตลอด"},{n:"ploy",f:"happy",l:"thai",t:"ปล่อยมันไปสักที …กระทงใบนั้นได้ลอยแล้ว"}],lv3:[{n:"nar",t:"ปีถัดมา พลอยพาเด็กฝึกรุ่นใหม่ของพยัคฆ์ทองที่ไม่ได้กลับบ้านมางานลอยกระทงห้าคน"},{n:"ploy",f:"happy",l:"thai",t:"คนละห้าสิบบาท ซื้อกระทงที่ชอบ แล้วต้องลอยให้ได้ ห้ามถือไว้จนเทียนดับ"},{n:"nar",t:"เด็กห้าคนวิ่งกระจายไปทั่วร้าน พลอยเดินตามดูทีละคนเหมือนพี่สาวคนโต"},{choice:[{t:"\"พลอยเป็นพี่ที่ดีนะ\"",then:[{n:"ploy",f:"flustered",l:"thai",t:"…ฉันแค่ทำสิ่งที่อยากให้ใครทำให้ตอนสิบสอง"}]},{t:"ช่วยพลอยจุดเทียนให้เด็ก ๆ",then:[{n:"nar",t:"เทียนห้าเล่มติดพร้อมกัน เด็ก ๆ ตะโกนนับหนึ่งสองสามแล้วปล่อยกระทงพร้อมกัน"}]}]},{n:"ploy",f:"happy",l:"thai",t:"ปีหน้าจะพามาอีก …และจะพามาที่ค่ายเธอด้วย เด็ก ๆ ควรรู้ว่ามวยไม่ได้มีแค่ชนะ"}],lv3t:"ห้าสิบบาท"},
 lg_fah_n:{lv2:[{n:"nar",t:"ฝั่งโน้นของตลาดเงียบกว่า ฟ้าจุดประทัดลูกใหญ่ แล้ววิ่งมาหลบหลังคุณ"},{n:"nar",t:"ปุ้ง! เสียงดังจนนกบินทั้งต้น"},{n:"fah",f:"happy",l:"thai",t:"ฮ่า ๆ ๆ เห็นไหม! ทั้งตลาดรู้แล้วว่าฟ้ามา!"},{n:"fah",f:"flustered",l:"thai",t:"…แต่ฟ้าหลบหลังนายนะ ห้ามบอกใคร"}],lv3:[{n:"nar",t:"ปีถัดมา ป้าเจ้าของร้านประทัดเรียกฟ้าเข้ามาในร้าน"},{n:"npc",who:"ป้าร้านประทัด",t:"อีหนูผมสีเงิน ปีนี้ป้ายกตำแหน่งคนจุดพลุเปิดงานให้ ปีที่แล้วเอ็งซื้อป้าเยอะที่สุด"},{n:"fah",f:"happy",l:"thai",t:"จริงเหรอป้า!! ฟ้าได้จุดพลุเปิดงาน!!"},{choice:[{t:"ถือไฟแช็กให้ฟ้า",then:[{n:"fah",f:"happy",l:"thai",t:"นายถือไฟ ฟ้าจุด ทีมเดียวกัน! …อย่าเพิ่งวิ่งหนีนะ!"}]},{t:"ยืนห่าง ๆ ปรบมือเชียร์",then:[{n:"fah",f:"pout",l:"thai",t:"ทำไมไปยืนไกลจัง! …มาใกล้ ๆ ฟ้าหน่อย ฟ้าไม่กลัว แต่อยากให้มาดู"}]}]},{n:"nar",t:"พลุดอกแรกของงานพุ่งขึ้นเหนือแม่น้ำ ฟ้าไม่สะดุ้งเลยสักนิด เพราะจับแขนคุณไว้ตั้งแต่ก่อนจุด"}],lv3t:"คนจุดพลุเปิดงาน"},
 lg_fah_r:{lv2:[{n:"nar",t:"พลุระเบิดตามมาอีกสามลูก ฟ้ายังจับแขนคุณไว้ ไม่ปล่อยเลยสักลูก"},{n:"fah",f:"flustered",l:"thai",t:"…ลูกนี้ไม่ได้ตกใจนะ จับไว้เฉย ๆ"},{n:"fah",f:"happy",l:"thai",t:"ถ้าปล่อยตอนนี้มันดูแปลกกว่า จับต่อไปจนพลุหมดก็แล้วกัน!"}],lv3:[{n:"nar",t:"ปีถัดมา ฟ้าพาคุณปีนขึ้นหลังคาร้านที่ป้าร้านประทัดอนุญาต จุดชมพลุที่ดีที่สุดในงาน"},{n:"fah",f:"happy",l:"thai",t:"ตรงนี้เห็นพลุทั้งแม่น้ำ! เสียงก็ไม่ดังเท่าข้างล่างด้วย ฟ้าสำรวจมาแล้ว"},{n:"nar",t:"พลุลูกใหญ่ที่สุดระเบิดเหนือหัวอีกครั้ง ฟ้าไม่สะดุ้ง แต่ขยับมานั่งชิดขึ้นนิดหนึ่ง"},{choice:[{t:"\"ปีนี้ไม่กลัวแล้วเหรอ\"",then:[{n:"fah",f:"flustered",l:"thai",t:"ก็มีคนนั่งข้าง ๆ แล้วนี่ …ไม่ต้องจับแขนก็ได้"}]},{t:"ยื่นมือให้ฟ้าจับไว้ก่อน",then:[{n:"fah",f:"happy",l:"thai",t:"…รู้ทันฟ้าอีกแล้วนะนาย จับก็จับ!"}]}]},{n:"fah",f:"happy",l:"thai",t:"ปีหน้ามาที่เดิม หลังคาเดิม ห้ามพาใครมาด้วย ที่นั่งมีสองที่พอดี"}],lv3t:"ดูพลุบนหลังคา"},
};
const CARD_MAIN3={
 k_n1:[{n:"nar",t:"คืนนั้น กะทิปะเทปกาวจุดที่สิบแปดด้วยเทปสีแดง ไม่ใช่สีดำเหมือนจุดอื่น"},{n:"kati",f:"happy",l:"train",t:"จุดนี้สีแดงค่ะ เป็นจุดแรกที่ไม่ได้ปะคนเดียว"},{n:"kati",f:"flustered",l:"train",t:"…ผู้จัดการถือม้วนเทปให้ไงคะ แค่นั้นก็นับแล้ว"}],
 k_r1:[{n:"nar",t:"เจ้าของร้านยกน้ำซุปมาเพิ่มสองถ้วย แล้วมองกะทิยิ้ม ๆ"},{n:"npc",who:"เจ้าของร้านข้าวมันไก่",t:"หลานชัยพาแฟนมาเหรอ ปู่เอ็งบอกไว้ว่าวันไหนพามา ให้เลี้ยงฟรี"},{n:"kati",f:"flustered",l:"casual",t:"ไม่ใช่แฟนค่ะลุง!! …แต่ ขอบคุณที่เลี้ยงนะคะลุง"}],
 m_n1:[{n:"nar",t:"เย็นนั้น บนหิ้งปู่ชัยมีมาลัยพวงใหม่ห้อยอยู่ ร้อยสวยกว่าพวงของผู้จัดการนิดหนึ่ง"},{n:"mali",f:"flustered",l:"casual",t:"ของปู่ชัยต้องสวยกว่าค่ะ …ผู้ใหญ่ต้องได้ก่อน"},{n:"mali",f:"happy",l:"casual",t:"แต่ของผู้จัดการ มะลิร้อยช้ากว่าค่ะ ร้อยไปยิ้มไป"}],
 m_r1:[{n:"nar",t:"น้องคนเล็กที่สุดดันหน้าเข้ามาใกล้จอจนเห็นแต่จมูก"},{n:"npc",who:"น้องของมะลิ",t:"พี่ผู้จัดการ! ดูแลพี่มะลิดี ๆ นะ! พี่มะลิกินจุ!"},{n:"mali",f:"flustered",l:"casual",t:"อย่าพูดเรื่องนั้นสิ!! …วางสายแล้ว! บ๊ายบาย!"}],
 r_n1:[{n:"nar",t:"รินเปิดหน้าถัดไปให้ดูอีกหน้า ทั้งที่บอกว่าอ่านได้แค่หน้าเดียว"},{n:"rin",f:"happy",l:"casual",t:"หน้านี้คือสถิติของค่ายทั้งหมดค่ะ ฉันจะจดต่อไปเรื่อย ๆ จนกว่าสมุดเล่มนี้จะเต็ม"},{n:"rin",f:"flustered",l:"casual",t:"…แล้วก็เล่มต่อไป ถ้าคุณยังอยากอ่าน"}],
 r_r1:[{n:"nar",t:"แก้วที่สามหมดไปนานแล้ว แต่รินยังไม่ลุก"},{n:"rin",f:"happy",l:"casual",t:"ฉันคำนวณผิดค่ะ แก้วที่สามไม่ได้ทำให้นั่งนานขึ้น คนตรงหน้าต่างหาก"},{n:"rin",f:"flustered",l:"casual",t:"…พรุ่งนี้ที่เดิมไหมคะ ฉันจะสั่งแค่สองแก้ว เผื่อคุณสั่งแก้วที่สามให้"}],
 p_n1:[{n:"nar",t:"ก่อนเดินออกจากห้อง พลอยหันกลับมามองคุณอีกครั้ง"},{n:"ploy",f:"flustered",l:"fight",t:"นักมวยของเธอ …เตะซ้ายตอนยกสาม ถ้าไม่ใช่เข่าฉัน คงจุกไปแล้ว"},{n:"ploy",f:"happy",l:"fight",t:"บอกเธอด้วยว่าฉันจำได้ ฉันจำทุกคนที่เกือบทำได้"}],
 p_r1:[{n:"nar",t:"ชาในแก้วหมด พลอยรินให้อีกโดยไม่ถาม"},{n:"ploy",f:"happy",l:"casual",t:"ปกติฉันชงแค่แก้วเดียว …ช่วงนี้ชงเกินบ่อยจัง ต้องหาคนช่วยดื่ม"},{n:"ploy",f:"flustered",l:"casual",t:"พรุ่งนี้ก็ชงเกินอีก เผื่อไว้ ถ้าเธอผ่านมาแถวนี้"}],
 f_n1:[{n:"nar",t:"เช้ามา มือถือมีข้อความเดียวจากฟ้า ส่งมาตอนตีสี่"},{n:"fah",f:"flustered",l:"casual",t:"(ข้อความ) ฟ้าฝันถึงนาย …ไม่ใช่ฝันดี! นายมาแย่งไข่เจียวฟ้า!"},{n:"fah",f:"happy",l:"casual",t:"(ข้อความถัดมา) ตอบด้วยนะ! ไม่งั้นฟ้าส่งสติกเกอร์อีกสิบอัน!"}],
 f_r1:[{n:"nar",t:"ฟ้าถอดฟันแวมไพร์ออก แล้วยื่นอีกชุดให้คุณ"},{n:"fah",f:"happy",l:"casual",t:"ใส่ด้วยกัน! แวมไพร์สองตัวน่ากลัวกว่าตัวเดียว! …ไม่ใช่ น่ารักกว่า"},{n:"fah",f:"flustered",l:"casual",t:"ปีหน้าฉลองด้วยกันอีกนะ ฟ้าจะซื้อชุดผีคู่"}],
 f_pet:[{n:"nar",t:"คืนนั้น สมาชิกขนปุยย้ายจากผ้าพันมือไปนอนขดอยู่บนรองเท้าของผู้จัดการแทน"},{n:"kati",f:"pout",l:"casual",t:"ไม่ยุติธรรม! มันเลือกผู้จัดการ! หนูซื้อชามข้าวให้แท้ ๆ"},{n:"coach",t:"สัตว์มันรู้ว่าใครคือหัวหน้าค่าย เอ็งยอมรับซะ"}],
 f_ny:[{n:"nar",t:"พลุดอกสุดท้ายดับไปนานแล้ว แต่ไม่มีใครลุกลงจากหลังคา"},{n:"kati",f:"happy",l:"casual",t:"ปีหน้าหนูจะเอาเสื่อขึ้นมาปู แล้วก็ขนมครกด้วย ที่นั่งวีไอพีต้องมีของกิน"},{n:"kati",f:"flustered",l:"casual",t:"…ผู้จัดการจองที่นั่งข้างหนูไว้แล้วนะคะ ห้ามไปนั่งที่อื่น"}],
 f_kt:[{n:"nar",t:"กลีบที่แปดลอยไปติดอยู่ที่กระทงของคุณ แล้วลอยคู่กันไปจนลับตา"},{n:"kati",f:"flustered",l:"casual",t:"…มันติดกันเฉยเลยค่ะ หนูไม่ได้เล็งนะ"},{n:"kati",f:"happy",l:"casual",t:"ปู่คงอยากบอกว่าคนที่ยังมาไม่ถึง มาถึงแล้วล่ะค่ะ"}],
 f_sk:[{n:"nar",t:"ครูแดงยิ้มกว้างที่สุดในรอบปี ฉีดสายยางวนรอบลานจนทุกคนเปียกหมด"},{n:"coach",t:"สมัยปู่ชัย สงกรานต์ค่ายนี้สาดกันทั้งวันจนน้ำในบ่อหมด ปีนี้เพิ่งได้ครึกครื้นแบบนั้นอีก"},{n:"kati",f:"happy",l:"casual",t:"ปีหน้าหนูจะซื้อสายยางของตัวเองค่ะ! ยาวกว่าของครูสองเมตร!"}],
 b_kati:[{n:"nar",t:"กะทิเป่าเทียนดับ แล้วยื่นขนมครกลูกที่ปักเทียนมาให้คุณ"},{n:"kati",f:"happy",l:"casual",t:"ลูกที่มีเทียน ปู่บอกว่าเป็นลูกนำโชค ต้องให้คนที่สำคัญที่สุดค่ะ"},{n:"kati",f:"flustered",l:"casual",t:"…ปีที่แล้วหนูกินเองเพราะไม่มีใคร ปีนี้มีแล้ว"}],
 b_mali:[{n:"nar",t:"สามวันต่อมา มะลิได้รับรูปจากบ้าน น้อง ๆ ถือเค้กที่บี้แบนทั้งกล่องแต่ยิ้มกว้างทุกคน"},{n:"mali",f:"happy",l:"casual",t:"เค้กบี้หมดเลยค่ะ ฮ่า ๆ แต่น้อง ๆ บอกว่าอร่อยที่สุดในโลก"},{n:"mali",f:"flustered",l:"casual",t:"ปีหน้ามะลิจะพาผู้จัดการไปเป่าเทียนที่บ้านด้วยนะคะ เค้กจะได้ไม่บี้~"}],
 b_rin:[{n:"nar",t:"รินเปิดของขวัญอย่างระมัดระวัง ไม่ให้กระดาษห่อขาดเลยสักนิด"},{n:"rin",f:"happy",l:"casual",t:"กระดาษห่อฉันจะเก็บไว้ค่ะ …ไม่ใช่เพราะซึ้ง แต่เพราะมันพับได้สวยตามหลักเรขาคณิต"},{n:"rin",f:"flustered",l:"casual",t:"…โกหกค่ะ ฉันซึ้ง"}],
 b_ploy:[{n:"nar",t:"เที่ยงคืนตรง คนทั้งเมืองนับถอยหลังปีใหม่ พลอยกลับนับถอยหลังวันเกิดของตัวเองเบา ๆ"},{n:"ploy",f:"happy",l:"casual",t:"สาม สอง หนึ่ง …สุขสันต์วันเกิดพลอย ครั้งแรกที่มีคนได้ยิน"},{n:"ploy",f:"flustered",l:"casual",t:"ปีหน้าเธอนับให้ฉันนะ ฉันจะได้ฟังบ้าง"}],
 b_fah:[{n:"nar",t:"ท้ายตลาด ฟ้าแจกลูกอมเม็ดสุดท้ายในตะกร้าให้คุณ"},{n:"fah",f:"happy",l:"casual",t:"เม็ดสุดท้ายเก็บไว้ให้นาย! แม่มดผมสีเงินไม่ให้ใครง่าย ๆ นะ!"},{n:"fah",f:"flustered",l:"casual",t:"…วันเกิดปีหน้า นายแต่งเป็นแวมไพร์คู่กับฟ้านะ ห้ามปฏิเสธ"}],
 m_bag:[{n:"nar",t:"เพลงจบ ครูแดงเดินไปที่ลำโพงเก่า แล้วกดเล่นเพลงเดิมซ้ำอีกรอบ"},{n:"coach",t:"อีกรอบ คราวนี้ครูเตะด้วย …สามสิบปีแล้ว ครูต้องตามให้ทันสักครั้ง"},{n:"kati",f:"happy",l:"fight",t:"ครูแดงตามทันค่ะ!! ผู้จัดการดูสิ ครบทุกจังหวะเลย!"}],
 m_tam:[{n:"nar",t:"ป้าแต๋วเดินมาตบไหล่มะลิเบา ๆ"},{n:"npc",who:"ป้าแต๋ว",t:"ฝีมือแบบนี้ ถ้าเลิกชกมวยเมื่อไหร่ มาเปิดร้านข้าง ๆ ป้าเลย ป้าให้เช่าฟรี"},{n:"mali",f:"happy",l:"casual",t:"ไม่เลิกค่ะป้า! แต่ถ้าแก่แล้ว มะลิกับผู้จัดการจะมาเปิดร้านส้มตำคู่กัน~"}],
 m_live:[{n:"nar",t:"ไลฟ์ครั้งที่สอง คนดูเพิ่มเป็นสิบสองคน หนึ่งในนั้นคือป้าแต๋ว อีกคนคือลุงช่างเงิน"},{n:"kati",f:"happy",l:"casual",t:"คนดูเพิ่มขึ้นสี่เท่าค่ะ! รินบอกว่าเป็นการเติบโต 300%"},{n:"kati",f:"flustered",l:"casual",t:"…ครูแดงยังสั่งเสื้ออีกตัวด้วย ครูคะ ครูมีเสื้อค่ายสามตัวแล้วนะคะ"}],
};
Object.entries(CARD_LV3).forEach(([id,X])=>{const C=CARDS[id];if(!C)return;if(X.main&&!C.mainDone){C.steps=C.steps.concat(X.main);C.mainDone=1;}C.lv2=X.lv2;C.lv3=X.lv3;C.lv3t=X.lv3t;C.rev=Math.max(C.rev||0,1);});
Object.entries(CARD_MAIN3).forEach(([id,L])=>{const C=CARDS[id];if(!C||C.mainDone3)return;C.steps=C.steps.concat(L);C.mainDone3=1;C.rev=Math.max(C.rev||0,1);}); // end batch 3

// ===== v1.88 camp lottery — three draws a year; Coach Daeng asks the manager to pick one of six tickets, results come by mail two weeks later =====
const LOTTO_WK=[10,24,38],LOTTO_COST=80,LOTTO_PRIZE={first:60000,last3:4000,last2:2000};
const lottoSt=G=>{G.lotto=G.lotto||{draws:[]};return G.lotto;};
const lottoDraw=(G,i)=>lottoSt(G).draws.find(d=>d.season===(G.season||1)&&d.i===i);
function lottoTickets(G,i){const r=mulberry32((G.seed||1)*977+(G.season||1)*131+i*17+5);return Array.from({length:6},()=>String(Math.floor(r()*1e6)).padStart(6,"0"));}
function lottoBuy(G,i,k){if(lottoDraw(G,i))return null;const nums=lottoTickets(G,i),pick=k==null?null:nums[k];if(pick)G.cash-=LOTTO_COST;
  const d={season:G.season||1,i,wk:G.week,abs:gameWeek(G),pick,tk:k,res:null,done:false};const L=lottoSt(G);L.draws.push(d);L.draws=L.draws.slice(-12);L.ask=null;return d;}
function lottoResult(G,d){const r=mulberry32((G.seed||1)*7919+d.season*313+d.i*29+1);const x=r(),out=x<.02?"first":x<.10?"last3":x<.30?"last2":"none";
  const rn=n=>String(Math.floor(r()*Math.pow(10,n))).padStart(n,"0"),p=d.pick||"000000";let first=rn(6),l3=rn(3),l2=rn(2);
  if(out==="first")first=p;else while(first===p)first=rn(6);
  if(out==="last3")l3=p.slice(-3);else while(l3===p.slice(-3))l3=rn(3);
  if(out==="last2")l2=p.slice(-2);else while(l2===p.slice(-2))l2=rn(2);
  d.res={first,l3,l2,out,prize:LOTTO_PRIZE[out]||0};return d.res;}
function lottoWeekly(G){const L=lottoSt(G);
  if(L.ask!=null&&!LOTTO_WK.some((w,k)=>k===L.ask&&G.week>=w&&G.week<=w+2))L.ask=null;
  for(const d of L.draws)if(d.pick&&!d.res&&gameWeek(G)>=d.abs+2){lottoResult(G,d);
    addMail(G,{kind:"lotto",draw:d.season+"_"+d.i,from:"ป้าจันทร์ แผงลอตเตอรี่หน้าตลาด",title:"ผลสลากงวดนี้มาแล้ว!",body:"ป้าตรวจให้แล้ว เอาสลากของผู้จัดการมาเทียบดูเองนะ ลุ้น ๆ"});}}
const LOTTO_COL=[["#f6c9d4","#b8536f"],["#cde9c9","#3f8a4f"],["#cfe0f6","#3c6fb0"],["#f6e3b4","#b07a1c"],["#e3d1f2","#7a4fb0"],["#f3d2b8","#b0603c"]];
const LOTTO_DIG={0:"111101101101111",1:"010110010010111",2:"111001111100111",3:"111001111001111",4:"101101111001001",5:"111100111001111",6:"111100111101111",7:"111001001010010",8:"111101111101111",9:"111101111001111"};
const _ltk={};
function lottoTicketURL(num,ci,hl){const key=num+"|"+ci+"|"+(hl||0);if(_ltk[key])return _ltk[key];const S=3,W=96,H=46,c=document.createElement("canvas");c.width=W*S;c.height=H*S;const x=c.getContext("2d");
  const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a*S,b*S,w*S,h*S);};const [bg,ink]=LOTTO_COL[ci%6];
  P(0,0,W,H,ink);P(1,1,W-2,H-2,bg);for(let y=3;y<H-2;y+=4)P(1,y,2,2,"#ffffff");P(4,4,W-8,9,ink);P(5,5,W-10,7,bg);
  x.fillStyle=ink;x.font=`700 ${6*S}px "IBM Plex Sans Thai","Chakra Petch",sans-serif`;x.textBaseline="middle";x.fillText("สลากงานวัด",8*S,8.7*S);x.textAlign="right";x.fillText("฿80",(W-7)*S,8.7*S);
  /* a little pixel elephant in the corner */const el=["0110000","1111110","1111111","1111101","1101100","1001000"];el.forEach((row,yy)=>[...row].forEach((v,xx)=>{if(v==="1")P(80+xx,30+yy,1,1,ink);}));
  const dg=String(num).split(""),dw=3*2,gap=3,tot=dg.length*dw+(dg.length-1)*gap,x0=Math.round((W-tot)/2)-4;
  dg.forEach((d,k)=>{const on=hl&&k>=6-hl;const m=LOTTO_DIG[d];const ox=x0+k*(dw+gap);if(on)P(ox-1,17,dw+2,13,"#f2c94c");for(let r=0;r<5;r++)for(let cc=0;cc<3;cc++)if(m[r*3+cc]==="1")P(ox+cc*2,18+r*2,2,2,on?"#2a1d2e":ink);});
  P(4,H-6,40,1,ink);P(4,H-4,26,1,ink);_ltk[key]=c.toDataURL();return _ltk[key];}
function lottoPickHTML(i){const N=lottoTickets(G,i);return `<h2>ช่วยครูเลือกเลขหน่อย · งวดที่ ${i+1}</h2><p class="meta">เลือกสลาก 1 ใบ ใบละ ฿80 ผลออกในอีก 2 สัปดาห์ทางตู้จดหมาย</p>
  <div class="ltgrid">${N.map((n,k)=>`<button class="ltk" data-act="lottobuy" data-v="${k}" aria-label="สลากเลข ${n}" ${G.cash<LOTTO_COST?"disabled":""}><img src="${lottoTicketURL(n,k)}" alt=""></button>`).join("")}</div>
  <div class="mfoot"><button class="btn ghost" data-act="lottoskip">งวดนี้ไม่ซื้อ</button></div>`;}
function lottoLetterAct(m){const [s,i]=String(m.draw).split("_").map(Number),d=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);if(!d||!d.res)return "";const R=d.res,hl=R.out==="first"?6:R.out==="last3"?3:R.out==="last2"?2:0;
  return `<div class="ltres"><div><small>รางวัลที่ 1</small><b class="num">${R.first}</b></div><div><small>เลขท้าย 3 ตัว</small><b class="num">${R.l3}</b></div><div><small>เลขท้าย 2 ตัว</small><b class="num">${R.l2}</b></div></div>
  <div class="ltmine"><small>สลากของผู้จัดการ</small><img src="${lottoTicketURL(d.pick,d.tk||0,hl)}" alt="${d.pick}"></div>
  ${d.done?`<p class="meta center">${R.prize?"ขึ้นเงินแล้ว "+fmt(R.prize):"ฉีกทิ้งไปแล้ว"}</p>`:R.prize?`<p class="lamt take">+${fmt(R.prize)}</p><button class="btn primary" data-act="lottoclaim" data-v="${m.id}">ขึ้นเงิน ${fmt(R.prize)}</button>`:`<p class="meta center">ไม่ถูกสักรางวัล…</p><button class="btn" data-act="lottoclaim" data-v="${m.id}">ฉีกสลากทิ้ง</button>`}`;}
const LOTTO_COACH={first:["หกหลักตรงทุกตัว!? ผู้จัดการ… ปีหน้าเราซื้อเวทีใหม่ได้เลย! …ครูขอรองเท้าแตะคู่ใหม่คู่นึงนะ"],
  last3:["สามตัวตรง! สี่พันบาท พอซื้อนวมใหม่ให้เด็ก ๆ ได้คู่นึง ที่เหลือครูขอซื้อลอตเตอรี่งวดหน้า… ล้อเล่น"],
  last2:["สองตัวท้ายถูก! ได้คืนยี่สิบห้าเท่า ครูบอกแล้วว่าเลขนี้มาจากฝันครู …ครูฝันว่ากินข้าวขาหมู"],
  none:["ไม่ถูกสักตัว… ครูว่าเลขมันเขินผู้จัดการ งวดหน้าครูเลือกเองบ้าง","แปดสิบบาท ถือว่าทำบุญให้รัฐไป ปีนี้ค่ายเราจ่ายภาษีครบแล้วนะ","ใกล้แล้ว! ห่างแค่หกหลักเอง…","เอาสลากไปห่อกล้วยทอดยังได้ประโยชน์กว่า"]};
function lottoPending(G){if(!G||G.ended)return null;const L=G.lotto;if(L&&L.ask!=null&&!lottoDraw(G,L.ask))return {type:"lotto",i:L.ask};const m=(G.mail||[]).find(x=>x.kind==="lotto"&&!x.read);return m?{type:"letter",id:m.id}:null;}
XMODAL.lotto=m=>({body:lottoPickHTML(m.i),foot:false});
Object.assign(ACT,{
  lottobuy:d=>{const L=lottoSt(G),i=L.ask;if(i==null||G.cash<LOTTO_COST)return;const dd=lottoBuy(G,i,+d.v);AU.sfx("level");UI.modal=null;save();render();toast(`ซื้อสลากเลข ${dd.pick} · ลุ้นผลอีก 2 สัปดาห์`);},
  lottoskip:()=>{const L=lottoSt(G),i=L.ask;if(i!=null)lottoBuy(G,i,null);UI.modal=null;save();render();},
  lottoclaim:d=>{const m=(G.mail||[]).find(x=>x.id===d.v);if(!m)return;const [s,i]=String(m.draw).split("_").map(Number),dd=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);if(!dd||!dd.res||dd.done)return;
    dd.done=true;m.done=true;if(dd.res.prize){G.cash+=dd.res.prize;AU.sfx("level");}else AU.sfx("miss");save();const Ls=LOTTO_COACH[dd.res.out],line=Ls[(dd.i+dd.season)%Ls.length];
    UI.modal=null;render();playScene([{n:"coach",t:line}],()=>{render();},{bg:"camp",look:"casual"});}
});

/* v1.91.176 (Man): the runaway cow and rooster come back several times a year — each return opens differently (the first visit keeps its own scene) */
const RUNAWAY_INTRO={
 cow:[[["nar","กลางถนนหน้าตลาด วัวนมตัวใหญ่ยืนตั้งการ์ด ขาหน้าเต้นฟุตเวิร์กแบบที่ไม่มีวัวตัวไหนควรทำได้"],["ลุงเฉลิม","นั่นแหละ! ระวังถีบนะหนู มันดูไฟต์ย้อนหลังทุกคืน!"],["surprised","…วัวตั้งการ์ดได้จริง ๆ ด้วย!?"]],
  [["nar","วัวนมตัวเดิมยืนอยู่หน้าร้านกาแฟ เคี้ยวเอื้องไปส่ายหัวหลบซ้ายขวาไป เหมือนกำลังซ้อมหลบหมัด"],["ลุงเฉลิม","เมื่อคืนมันดูคู่เอกช่องสามจนจบ วันนี้หลบเก่งขึ้นอีกแล้ว!"],["angry","หลบเก่งก็ต้องไล่ให้ทันค่ะ!"]],
  [["nar","คนมุงหน้าตลาดเป็นวงกลม ตรงกลางคือวัวนมตัวเดิม มีผ้าขาวม้าพันเขาไว้เหมือนมงคล"],["ลุงเฉลิม","ใครเอาผ้าไปพันให้มันก็ไม่รู้ ตอนนี้มันคิดว่าตัวเองขึ้นชกแล้ว!"],["surprised","…มีมงคลด้วย งั้นต้องไหว้ครูก่อนไหมคะ"]],
  [["nar","วัวนมตัวเดิมยืนรออยู่ตรงทางม้าลาย พอเห็นรถค่ายศิริชัยก็กระทืบเท้าสองที"],["ลุงเฉลิม","มันจำรถค่ายหนูได้แล้วนะ รอคู่ปรับประจำของมันอยู่!"],["surprised","คู่ปรับประจำ… หนูเหรอ!?"]]],
 rooster:[[["nar","ไก่แจ้ตัวเล็กยืนบนกระสอบทราย อกพองโต ขนคอตั้งชัน"],["เสี่ยต๋อง","อย่าดูถูกมันนะครับ มันเคยไล่สุนัขพันธุ์ใหญ่ทั้งซอยมาแล้ว"],["happy","มาเลยเจ้าไก่! หนูไม่ใช่สุนัขนะ!"]],
  [["nar","ไก่แจ้ตัวเดิมเกาะอยู่บนเชือกเวทีซ้อม ขันเสียงดังลั่นค่ายตั้งแต่ตีห้า"],["เสี่ยต๋อง","มันชอบเวทีค่ายคุณครับ บินมาทุกครั้งที่ประตูเปิด"],["happy","วันนี้ไม่ให้ยึดเวทีหรอกนะ!"]],
  [["nar","ไก่แจ้ยืนอยู่บนหลังคาโรงยิม กางปีกครึ่งเดียวเหมือนตั้งการ์ด"],["เสี่ยต๋อง","มันดูคลิปค่ายคุณในมือถือผมทุกคืน ท่ายืนนั่นก๊อปมาเลยครับ"],["surprised","…นั่นท่าตั้งการ์ดของหนูนี่!"]],
  [["nar","ไก่แจ้ตัวเดิมเดินวนรอบกระสอบทราย จิกทีละทีเหมือนวอร์มอัพ"],["เสี่ยต๋อง","ผมว่ามันแค่อยากเข้าค่ายคุณนะครับ …แต่จิกเจ็บอยู่"],["angry","ถ้าอยากเข้าค่าย ต้องผ่านหนูก่อน!"]]]};
function runawayIntro(G,m,fid){const L=RUNAWAY_INTRO[m.q];G.runN=G.runN||{};let i=0;if(m.repeat){if(m.introI==null){G.runN[m.q]=(G.runN[m.q]||0)+1;m.introI=1+((G.runN[m.q]-1)%(L.length-1));}i=m.introI;}
  const [a,b,c]=L[i];return [{n:"nar",t:a[1]},{n:"npc",who:b[0],t:b[1]},{n:fid,f:c[0],l:"fight",t:c[1]}];}

// ================= MUAY THAI MOE v1.23 — MAILBOX, SIDE QUESTS, ODD FIGHTS, CALENDAR, GRAPHS, NEWS BAR =================
// ---------- odd opponents (sprite sheets in a/<sprite>_sheet.webp, same 6-row layout as the girls) ----------
const QK={
  gang1:{name:"ลูกกระจ๊อกหมวกแดง",sprite:"gang1",lvl:-1.6,tilt:{punch:1.5,power:1,iq:-2,guard:-1.5,comp:-1},color:"#c8283c",grp:"gang"},
  gang2:{name:"ไอ้แจ็กเก็ตดำ หมวกแดง",sprite:"gang2",lvl:-.8,tilt:{punch:1.5,kick:1,iq:-1.5,comp:-1},color:"#a01f2f",grp:"gang"},
  gang3:{name:"รองหัวหน้าหมวกดำแดง",sprite:"gang3",lvl:.1,tilt:{punch:1.5,knee:1,power:1,iq:-1},color:"#5a1420",grp:"gang"},
  gang4:{name:"หัวหน้าหมวกเงิน",sprite:"gang4",lvl:.8,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#d9a520",grp:"gang"},
  gang5:{name:"เสี่ยหมวกทองคำ",sprite:"gang5",lvl:1.6,tilt:{power:2,punch:2,dur:1.5,comp:1,foot:-1},color:"#f7d24a",grp:"gang"},
  rooster1:{name:"ไก่แจ้หัวร้อน",sprite:"rooster1",lvl:-.9,tilt:{speed:2.5,kick:2,dur:-2,power:-1},color:"#e8a23a",grp:"rooster"},
  rooster2:{name:"ไก่เทาสิงห์บุรี",sprite:"rooster2",lvl:-.2,tilt:{speed:2,kick:2,foot:1,dur:-1.5},color:"#8a8f9a",grp:"rooster"},
  rooster3:{name:"ไก่ขาวมวยวัด",sprite:"rooster3",lvl:.4,tilt:{speed:2,kick:2.5,counter:1,dur:-1.5},color:"#f4f1ea",grp:"rooster"},
  rooster4:{name:"เจ้าดำหางแดง",sprite:"rooster4",lvl:.9,tilt:{speed:2,kick:2,power:1,guard:1,dur:-1},color:"#c8283c",grp:"rooster"},
  rooster5:{name:"พญาไก่ทองนักเลง",sprite:"rooster5",lvl:1.5,tilt:{speed:2,kick:2.5,power:1.5,comp:1,dur:-.5},color:"#f7d24a",grp:"rooster"},
  bull1:{name:"แม่นมสด วัวหลุดฟาร์ม",sprite:"bull1",lvl:-.6,tilt:{power:2,dur:2.5,clinch:1,speed:-2,iq:-1},color:"#f4f1ea",grp:"bull"},
  bull2:{name:"เจ้าแดงเขาโค้ง",sprite:"bull2",lvl:.7,tilt:{power:2.5,dur:2,knee:1.5,speed:-1.5},color:"#a0522d",grp:"bull"},
  bull3:{name:"ไอ้ทุยมาเฟีย",sprite:"bull3",lvl:1.4,tilt:{power:3,dur:2.5,clinch:2,speed:-1.5,foot:-1},color:"#2b2530",grp:"bull"},
};
const BELT_WEEKS=[10,18,26,34,42];
const STADIUMS={
 tha:{name:"เวทีท่าแพ",scene:"district",bg:"bg_district.webp",weeks:[10,18,26,34,42],minYear:1,win:15000,defend:10000},
 ping:{name:"เวทีริมปิง",scene:"river",bg:"bg_river.webp",weeks:[15,30,45],minYear:2,win:18000,defend:12000},
 lanna:{name:"เวทีล้านนา",scene:"hall",bg:"bg_hall.webp",weeks:[22,38,48],minYear:3,win:22000,defend:14000}
};
function beltStore(G,venue="tha"){if(venue==="tha")return G.belt=G.belt||{};G.venueBelts=G.venueBelts||{};return G.venueBelts[venue]=G.venueBelts[venue]||{};}

function beltHolder(G,div,venue="tha"){const B=beltStore(G,venue);if(!B[div]||!G.F[B[div].id]){const c=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&!f.canon&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));const chosen=c[Math.min(venue==="tha"?0:venue==="ping"?1:2,c.length-1)];if(!chosen)return null;B[div]={id:chosen.id,def:2,since:G.week};}return G.F[B[div].id];}
function beltChallenger(G,div,not){return Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.id!==not&&!f.injury).sort((a,b)=>ovr(b.a)-ovr(a.a))[0]||null;}
const QGRP_BG={gang:"bg_market.webp",rooster:"bg_rooster.webp",bull:"bg_farm.webp"};
function qTarget(G,fid){const f=fid&&G.F[fid];if(f)return ovr(f.a);const R=roster(G);return R.length?R.reduce((s,x)=>s+ovr(x.a),0)/R.length:9;}
function makeQ(G,kind,fid,tag){const K=QK[kind],t=qTarget(G,fid)+K.lvl+Math.min(1.5,((G.season||1)-1)*.25),rng=mulberry32((G.seed^(G.week*977))+kind.length*31);const a={};
  for(const [k] of ATTRS)a[k]=clamp(t+(K.tilt[k]||0)+(rng()*1.6-.8),3,19.5);
  const d=t-ovr(a);for(const [k] of ATTRS)a[k]=clamp(a[k]+d,3,19.5);
  const id=`q_${kind}_${tag||G.week}`;const f=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  f.sprite=K.sprite;f.kind=kind;f.grp=K.grp;f.lvl=clamp(Math.round(t-6),1,10);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;}
function qCleanup(G){const keep=new Set([...G.bookings.map(b=>b.b),...G.offers.map(o=>o.b),...(G.mail||[]).filter(m=>!m.done&&m.qid).map(m=>m.qid)]);
  for(const id of Object.keys(G.F))if(id.startsWith("q_")&&!keep.has(id)&&(G.F[id].lastFightAbs==null||gameWeek(G)-G.F[id].lastFightAbs>2))delete G.F[id];}

// ---------- mail ----------
let MAILN=0;
function addMail(G,m){G.mail=G.mail||[];m.id="m"+G.week+"_"+(++MAILN)+"_"+Math.floor(Math.random()*1e4);m.wk=G.week;m.season=G.season||1;if(m.exp!=null)m.expAbs=gameWeek(G)+(m.exp-G.week);m.read=false;G.mail.unshift(m);G.mail=G.mail.slice(0,40);return m;}
const mailOpen=m=>!m.done&&!m.expired&&["take","pay","quiz","quest"].includes(m.kind);
function mailBadge(){if(!G||!G.mail)return 0;return G.mail.filter(m=>!m.read||mailOpen(m)).length;}
const MAILBOX_PX=pxIcon(["....kkkk....","...kffffk...","..krrrrrrk..",".krrrrrrrrk.",".krwwwwwwrk.",".krwkkkkwrk.",".krwwwwwwrk.",".krrrrrrrrk.",".kkkkkkkkkk.",".....kk.....",".....kk.....","....kkkk...."],{k:"#2a1a10",r:"#c8283c",w:"#f4ead8",f:"#f7d24a"});
const BILLS=[["เทศบาลตำบล","ค่าปรับ: ไก่ของค่ายขันเสียงดังเกินเกณฑ์ตอนตีสี่ (ร้องเรียน 14 ราย)",300],
 ["ลุงหวังวินมอไซค์","ค่าซ่อมกระจกหน้ารถ ลูกเตะหลุดจากกระสอบลอยข้ามรั้วมา",800],
 ["ร้านข้าวมันไก่เจ๊ติ๋ม","ใบแจ้งหนี้: นักมวยค่ายท่านกินเชื่อไว้ 46 จาน (มีลายเซ็นครูแดงกำกับ)",1840],
 ["สหกรณ์น้ำแข็งหลอด","ค่าน้ำแข็งเดือนนี้ — อ่างน้ำแข็งของท่านใช้มากกว่าโรงงานปลาทั้งอำเภอ",900],
 ["ป้าแต๋ว ส้มตำ","ค่าครกแตก: มีคนในค่ายท่าน 'สาธิตศอกกลับ' ใส่ครกป้า",450],
 ["สำนักงานป้ายโฆษณา","ภาษีป้าย: ป้ายค่ายท่านใหญ่กว่าป้ายวัด ต้องเสียเพิ่ม",600,G=>G.fac.brand>=1],
 ["การไฟฟ้าส่วนภูมิภาค","ค่าไฟพิเศษ: สปอตไลท์ค่ายท่านสว่างจนนกบินผิดทาง",1200,G=>(G.fac.lights||0)>=1],
 ["สมาคมสองแถวสายวัด","ค่าธรรมเนียมจอดสองแถวหน้าวัด (มีนักเรียนท่านตะโกนเชียร์ในรถ)",350,G=>(G.fac.van||0)>=1],
 ["คลินิกสัตว์ ตำบล","ค่ารักษาแมวส้มประจำค่าย: กินขนมครกมากเกินไป",500]];
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

const TAM_MAIL=[["ร้านคนแน่น มาช่วยหน่อย!","สุดสัปดาห์นี้มีงานวัด ลูกค้าต่อคิวยาวถึงหน้าโบสถ์ ป้าตำคนเดียวไม่ทัน ส่งนักมวยมือหนัก ๆ มาช่วยสักคนนะลูก ค่าจ้างตามฝีมือ แถมส้มตำกลับบ้าน"],
 ["รถทัวร์ลงร้านป้า!","นักท่องเที่ยวลงรถทัวร์มาสามคันรวด สั่งส้มตำไทยไม่เผ็ดกันทั้งคัน ป้าแขนจะหลุดแล้ว มาช่วยหน่อยเถอะ"],
 ["ลูกจ้างป้าลาป่วย","น้องที่ช่วยป้าตำไข้ขึ้น ร้านยังต้องเปิด ใครว่างแวะมาช่วยครึ่งวัน ป้าให้ค่าแรงงาม ๆ เลย"],
 ["ส้มตำปูปลาร้าเมนูใหม่","ป้าคิดเมนูใหม่ได้ อยากให้นักมวยค่ายศิริชัยมาช่วยตำเปิดตัว คนดูเยอะ ได้โปรโมทค่ายไปด้วยนะ"]];
function mailWeekly(G){G.mail=G.mail||[];G.gang=G.gang||{st:0,next:0};G.mailSeen=G.mailSeen||{};const rng=mulberry32(G.seed+G.week*4441);
  for(const m of G.mail)if(m.expAbs!=null&&gameWeek(G)>m.expAbs&&!m.done)m.expired=true;
  for(const M of STORY_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"letter",from:M.from,title:M.title,body:M.body});}
  for(const M of SPONSOR_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"take",from:M.from,title:M.title,body:M.body,amt:M.amt});}
  // gang: after the first market fight, the next tier writes in every few weeks
  if(G.gang.st>=1&&G.gang.st<5&&gameWeek(G)>=(G.gang.nextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)&&G.week<=48){const early=G.gang.st===3&&G.loan>0,k=early?"gang5":"gang"+(G.gang.st+1);
    if(early){addMail(G,{kind:"quest",q:"gang",qk:k,early:1,from:"แม่ค้าตลาดเช้า (ไม่ลงชื่อ)",title:"เสี่ยหมวกทองคำลงมาเอง!",body:`ลูกน้องมันแพ้ค่ายศิริชัยมาสามรอบติด เสี่ยหมวกทองคำเสียหน้าหนัก เลยลงมาคุมตลาดเอง แถมรู้ว่าค่ายติดหนี้มันอยู่ เขาลือกันว่าถ้าใครล้มเสี่ยได้ หนี้ทั้งตลาดก็จบ`,exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
    else addMail(G,{kind:"quest",q:"gang",qk:k,from:"แม่ค้าตลาดเช้า (ไม่ลงชื่อ)",title:G.gang.st>=4?"เสี่ยหมวกทองคำมาเอง!":"พวกหมวกกันน็อกกลับมาอีกแล้ว",
      body:[`พวกมันกลับมาเก็บดอกอีกแล้ว คราวนี้มี "${QK[k].name}" มาคุม ใครไม่จ่ายร้อยละยี่สิบ โดนพังแผง ช่วยพวกเราอีกครั้งได้ไหม`,`ไอ้${QK[k].name}มันขู่ว่าจะยึดรถเข็นลูกชิ้นของยายแหวว ถ้าค่ายศิริชัยยังไม่หยุดมันก็ไม่มีใครหยุดได้แล้ว`,`ตลาดทั้งตลาดเงียบหมด เพราะ "${QK[k].name}" มานั่งเฝ้าตั้งแต่ตีห้า ขอร้องล่ะ`,`เขาว่าหัวหน้าใหญ่ "${QK[k].name}" จะมาเก็บเงินเอง ทั้งตลาดเป็นหนี้มันหมด ถ้าล้มตัวนี้ได้ แก๊งจบแน่`][G.gang.st-1],exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
  // Recurring side challenges return more often as the years pass.
  if((G.season||1)>=2&&G.week>=7&&G.week<=47){const year=G.season||1;
    if(G.gang.st>=5&&gameWeek(G)>=(G.gang.loopNextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){
      const i=G.gang.loopN||0,k=["gang2","gang3","gang4","gang5"][i%4];G.gang.loopN=i+1;G.gang.loopNextAbs=gameWeek(G)+Math.max(5,15-year*2);
      addMail(G,{kind:"quest",q:"gang",qk:k,repeat:1,from:"ป้าศรี ตลาดเช้า",title:"แก๊งหมวกกันน็อกกลับมาอีก",body:`${QK[k].name} กลับมาก่อเรื่องที่ตลาดอีกแล้ว คราวนี้พวกมันซ้อมมาหนักกว่าเดิม ช่วยมาจัดการให้หน่อยได้ไหม`,exp:G.week+3,pay:3000+year*500});}
    G.animalLoop=G.animalLoop||{nextAbs:0,turn:0};
    if(gameWeek(G)>=G.animalLoop.nextAbs&&!G.mail.some(m=>["cow","rooster"].includes(m.q)&&!m.done&&!m.expired)){
      const cow=G.animalLoop.turn%2===0,k=cow?(year>=4?"bull3":"bull2"):(year>=4?"rooster5":"rooster3");
      G.animalLoop.turn++;G.animalLoop.nextAbs=gameWeek(G)+Math.max(4,15-year*2);
      addMail(G,{kind:"quest",q:cow?"cow":"rooster",qk:k,repeat:1,from:cow?"ลุงเฉลิม ฟาร์มโคนม":"เสี่ยต๋อง สนามไก่",title:cow?"วัวกลับมาท้าค่าย!":"ไก่ชนกลับมาขอรีแมตช์!",body:cow?`เจ้า${QK[k].name}ฝึกถีบกระสอบทรายทุกวัน ตอนนี้ไม่มีใครกล้าเข้าฟาร์ม ช่วยมาสู้กับมันอีกที`:`${QK[k].name}ชนะไก่ทั้งสนามมาแล้ว มันกำลังรอคู่ชกจากค่ายศิริชัย`,exp:G.week+2,pay:2000+year*400});}}
  // Stadium titles: Tha Phae saves keep their original G.belt slots.
  for(const [venue,V] of Object.entries(STADIUMS))if((G.season||1)>=V.minYear&&V.weeks.includes(G.week))
    for(const div of [...new Set(roster(G).map(f=>f.div))]){const h=beltHolder(G,div,venue);if(!h)continue;
      const ours=h.camp==="player",op=ours?beltChallenger(G,div,h.id):h;if(!op)continue;const B=beltStore(G,venue)[div];
      addMail(G,{kind:"quest",q:"belt",venue,bg:V.bg,npc:op.id,div,defend:ours?h.id:null,from:`โปรโมเตอร์${V.name}`,title:ours?`ป้องกันเข็มขัด${V.name} รุ่น ${div}`:`ชิงเข็มขัด${V.name} รุ่น ${div}`,
        body:ours?`${op.name} มาท้าชิงเข็มขัดของ${h.name}ที่${V.name} รับภายในสองสัปดาห์ ชนะรับ ${fmt(V.defend)}`:`${op.name} ครองเข็มขัด${V.name}มา ${B.def} ครั้งแล้ว ห้ายก ชนะรับ ${fmt(V.win)} พร้อมเข็มขัด`,exp:G.week+2,pay:ours?V.defend:V.win});}
  // v1.69: Auntie Taew writes in for help at her som tam stall every few weeks (a minigame that does not use the camp activity)
  if(G.week>=4&&G.week<=49&&gameWeek(G)>=(G.tamNextAbs||4)&&!G.mail.some(m=>m.kind==="job"&&!m.done&&!m.expired)){G.tamNextAbs=gameWeek(G)+3+Math.floor(rng()*2);
    const T=TAM_MAIL[(G.mailN_tam=(G.mailN_tam||0)+1)%TAM_MAIL.length];addMail(G,{kind:"job",job:"somtam",exp:G.week+1,from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:T[0],body:T[1]});}
  // cow on the loose — once, mid season
  if(!G.mailSeen.cow&&G.week>=9&&rng()<.6){G.mailSeen.cow=1;addMail(G,{kind:"quest",q:"cow",qk:"bull1",from:"ลุงเฉลิม ฟาร์มโคนม",title:"ช่วยด้วย! วัวหลุด!!",body:"แม่นมสดวัวที่ดุที่สุดในฟาร์มหลุดคอก มันดูมวยทางทีวีทุกคืนจนตั้งการ์ดเป็น! ตอนนี้ยืนขวางถนนหน้าตลาด ใครเข้าใกล้โดนถีบหมด ส่งนักมวยมาช่วยที ลุงให้ค่าเหนื่อยพร้อมนมสดอีกหนึ่งถัง",exp:G.week+2,pay:1500});}
  if(!G.mailSeen.rooster&&G.week>=5&&rng()<.6){G.mailSeen.rooster=1;addMail(G,{kind:"quest",q:"rooster",qk:"rooster1",from:"เสี่ยต๋อง สนามไก่",title:"ไก่ผมหลุดเข้าค่ายคุณ",body:"ไก่แจ้หัวร้อนของผมบินข้ามรั้วไปจิกกระสอบทรายค่ายคุณตั้งแต่เช้า ใครเข้าใกล้มันตั้งท่ามวยใส่ ช่วยจับให้ทีครับ ผมให้ค่าจ้างและไข่ไก่สองแผง",exp:G.week+2,pay:1000});}
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
  if(won&&G.week>=6&&G.week<=42&&rng()<.45){const B=WIN_BONUS[(G.week+G.seed)%WIN_BONUS.length];addMail(G,{kind:"take",from:B[0],title:B[1],body:B[2],amt:Math.round((1500+G.week*70)/100)*100});}
  const gi=GIG_WEEKS.indexOf(G.week);if(gi>=0){const g=GIGS[gi%GIGS.length];addMail(G,{kind:"take",from:g[0],title:g[1],body:g[2],amt:Math.round((3000+G.week*90)/100)*100});}
  if(G.week%3===1&&G.week>=4&&G.week<=49){const q=QUIZ[(Math.floor(G.week/3)+G.seed)%QUIZ.length];addMail(G,{kind:"quiz",from:"วิทยุชุมชน 'มวยบ้านเรา'",title:"ชิงรางวัลประจำสัปดาห์",body:"ตอบถูกรับเงินรางวัลจากผู้สนับสนุนรายการ (ตอบได้ครั้งเดียว)",q:q[0],opts:q[1],ans:q[2],amt:Math.round((800+Math.min(2200,G.week*45))/10)*10,exp:G.week+2});}
  // odd bills
  if(G.week>=5&&rng()<.22){const L=BILLS.filter(b=>!b[3]||b[3](G));const b=L[Math.floor(rng()*L.length)];addMail(G,{kind:"pay",from:b[0],title:"ใบแจ้งหนี้",body:b[1],amt:Math.round(b[2]*(1+G.week/60)/10)*10,exp:G.week+2});}
  // odd fights posted to the offers board (rare, pays well)
  beastOffer(G,rng);
  qCleanup(G);}
const BEAST_WEEKS=[7,11,15,19,23,27,31,35,39,43,47];
function beastOffer(G,rng){const year=G.season||1,gap=Math.max(2,5-year);if(year===1?!BEAST_WEEKS.includes(G.week):G.week<5||G.week>49||(G.week-5)%gap!==0)return;const R=roster(G).filter(f=>!f.injury);if(!R.length)return;
  const i=year===1?BEAST_WEEKS.indexOf(G.week):Math.floor((G.week-5)/gap);const kinds=["rooster2","bull2","rooster3","bull2","rooster4","bull3","rooster4","rooster5","bull3","rooster5","bull3"];const kind=year>=4?["rooster4","bull3","rooster5","bull2","rooster3","bull3"][i%6]:kinds[i%kinds.length];const f=R[Math.floor(rng()*R.length)];
  const wk=G.week+2;if(G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-wk)<=1))return;const qid=makeQ(G,kind,f.id,"o"+G.week);const K=QK[kind];
  const win=Math.round((6000+G.week*180)*(1+K.lvl*.2)/100)*100,lose=Math.round(win*.35/100)*100;
  G.offers.unshift({id:`ob${G.week}_${f.id}`,a:f.id,b:qid,week:wk,tier:"beast",beast:kind,win,lose});
  const ev=K.grp==="rooster"?["งานวัดบ้านโป่ง","ศึกคนปะทะไก่ชน"]:["งานประจำปีอำเภอ","ศึกล้มวัว (ฉบับมวยไทย)"];
  addMail(G,{kind:"letter",from:ev[0],title:`เชิญร่วม "${ev[1]}"`,body:`ขอเชิญ${f.name}ขึ้นเวทีพิเศษกับ "${K.name}" สัปดาห์ ${wk} ค่าตัวดีกว่าไฟต์ปกติ (ไม่มีผลต่อสถิติและอันดับ) ข้อเสนออยู่ที่หน้าไฟต์แล้ว รับภายในสัปดาห์นี้นะครับ`});}

// ---------- quest fights ----------
function questFighters(){return roster(G).filter(f=>!f.injury);}
function startQuest(spec,fid,done){const f=G.F[fid];if(!f){done&&done();return;}
  const opp=spec.npc||makeQ(G,spec.qk,fid,spec.tag||("w"+G.week));const tier="quest";
  const b={id:"q"+G.week+"_"+fid+"_"+Math.floor(Math.random()*1e4),a:fid,b:opp,week:G.week,tier,rounds:spec.rounds||3,win:spec.purse||0,lose:0,quest:spec};
  b.bg=spec.bg||(spec.q==="belt"?"bg_district.webp":spec.npc?"bg_food.webp":QGRP_BG[QK[spec.qk].grp]);
  openFight(b,()=>questAfter(b,done));}
function questAfter(b,done){const S=b.quest,res=(G.cal||[]).slice(-1)[0];const win=res&&res.b===b.b&&res.res==="W";const me=G.F[b.a],op=G.F[b.b]||{name:"คู่ชก"};
  const fin=()=>{save();render();done&&done();};
  if(S.q==="gang"){G.gang=G.gang||{st:0,next:0};if(S.rematch){if(win){G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.rep+=.2;}playScene([{n:"npc",who:"เสี่ยหมวกทองคำ",t:win?"คราวนี้ก็แพ้อีก! ครั้งหน้าจะมาใหม่":"ครั้งนี้ฉันชนะ! แต่ค่ายแกเก่งขึ้นเยอะ"},{n:b.a,f:win?"happy":"sad",l:"fight",t:win?"ค่ายศิริชัยพร้อมเสมอค่ะ":"ครั้งหน้าจะชนะให้ได้ค่ะ"}],fin,{bg:"market",look:"fight"});return;}if(win){if(S.qk==="gang5")G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.gang.st=Math.max(G.gang.st,+S.qk.slice(4));G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);if(S.qk==="gang5"&&G.loan>0){G.loan=0;G.flags.loanWiped=1;}G.rep+=S.qk==="gang5"?2:.5;
      const amt=S.qk==="gang5"?12000:S.qk==="gang4"?5000:S.qk==="gang3"?2000:200+Math.floor(srand(G,7)*7)*50;
      addMail(G,{kind:"take",from:"(ไม่ระบุชื่อผู้ส่ง)",title:S.qk==="gang5"?"ตลาดเช้าขอบคุณค่ายศิริชัย":"ซองสีน้ำตาลไม่มีชื่อ",body:S.qk==="gang5"?"แก๊งหมวกกันน็อกยุบแล้ว หนี้นอกระบบของทั้งตลาดเป็นโมฆะ แม่ค้าทุกแผงลงขันกันมาให้ค่าย ขอบคุณที่ไม่ยืนดูเฉย ๆ":"ข้างในมีเงินกับกระดาษโน้ตลายมือสั่น ๆ: 'ขอบคุณที่ช่วยตลาด วันนี้ขายได้เต็มแผงเลย'",amt});
      playScene([{n:"npc",who:"ป้าศรี แม่ค้าผัก",t:S.qk==="gang5"?(G.flags.loanWiped===1?(G.flags.loanWiped=2,"เสี่ยหมวกทองคำล้มแล้ว!! ทั้งตลาดเป็นอิสระแล้วจ้า! สมุดหนี้ของมันโดนเผาทิ้งหมด หนี้ที่ค่ายกู้ไว้ก็หายไปด้วยนะ!"):"เสี่ยหมวกทองคำล้มแล้ว!! ทั้งตลาดเป็นอิสระแล้วจ้า!"):"ไปแล้ว! พวกมันขี่มอไซค์หนีไปแล้ว! ขอบใจนะหนู"},{n:b.a,f:"happy",l:"fight",t:S.qk==="gang5"?"ตลาดนี้มีคนคุ้มครองแล้วค่ะ ชื่อค่ายศิริชัย!":"ใครรังแกตลาดนี้ ต้องผ่านค่ายศิริชัยก่อนค่ะ!"},{n:"nar",t:"ตกเย็นมีซองสีน้ำตาลไม่มีชื่อผู้ส่งเสียบอยู่ที่ตู้จดหมายค่าย"}],fin,{bg:"market",look:"fight"});return;}
    playScene([{n:"npc",who:op.name,t:"ฮ่า! ค่ายมวยก็แค่นี้! บอกแม่ค้าให้เตรียมดอกไว้!"},{n:b.a,f:"sad",l:"fight",t:"…ขอโทษนะคะ ป้า คราวหน้าหนูไม่แพ้แล้ว"},{n:"nar",t:"แม่ค้าบอกว่าไม่เป็นไร พวกมันจะกลับมาอีก และค่ายจะมีโอกาสอีกครั้ง"}],()=>{G.gang.nextAbs=gameWeek(G)+3;fin();},{bg:"market",look:"fight"});return;}
  if(win&&S.pay){addMail(G,{kind:"take",from:S.from||"ผู้ว่าจ้าง",title:"ค่าเหนื่อยตามสัญญา",body:S.q==="cow"?"ค่าเหนื่อยพร้อมนมสดหนึ่งถัง (นมถูกดื่มหมดภายในสิบนาทีโดยนักมวยในค่าย)":S.q==="rooster"?"ค่าจ้างพร้อมไข่สองแผง ไก่แจ้กลับบ้านไปนอนซึม เจ้าของบอกว่ามันไม่เคยแพ้ใครมาก่อน":"เดิมพันข้างเวทีที่คนดูลงขันกัน ทั้งตำบลพูดถึงไฟต์นี้",amt:S.pay});G.rep+=.6;}
  if(S.q==="challenge")op&&(win?G.rep+=1:0);
  if(S.q==="belt"){const venue=S.venue||"tha",V=STADIUMS[venue],slot=beltStore(G,venue),B=slot[S.div];
    if(win&&!S.defend){slot[S.div]={id:me.id,def:0,since:G.week};G.rep+=3;me.belts=(me.belts||0)+1;
      recordHonor(G,"belt",me.id,S.div,G.week,venue==="tha"?null:venue);playHonorQueue(fin);return;}
    if(win&&S.defend){B.def++;G.rep+=1.5;recordHonor(G,"defense",me.id,S.div,G.week,venue==="tha"?null:venue);playHonorQueue(fin);return;}
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
  UI.qpend=null;playScene(gangEventSteps(),()=>{const p=UI.qpend;UI.qpend=null;if(!p){done();return;}G.gang.st=Math.max(G.gang.st,0);startQuest({q:"gang",qk:"gang1"},p.fid,done);},{bg:"market",look:"train"});return true;}

// ---------- modals ----------
function mailListHTML(){const L=G.mail||[];
  return `<h2 class="mailh">${MAILBOX_PX}ตู้จดหมาย</h2>${L.length?`<div class="mlist2">${L.map(m=>`<button class="mrow2 ${m.read?"":"unread"} ${mailOpen(m)?"act":""} ${m.done||m.expired?"old":""}" data-act="mopen" data-v="${m.id}"><span class="mk ${m.kind}">${{letter:"จดหมาย",take:"เงินเข้า",pay:"ใบแจ้งหนี้",quiz:"ตอบคำถาม",quest:"ขอความช่วยเหลือ",job:"งานจ้าง",event:"อีเวนต์"}[m.kind]}</span><span class="mt"><b>${esc(m.title)}</b><small>${esc(m.from)} · สด.${m.wk}${m.expired?" · หมดเวลา":m.done?" · จัดการแล้ว":m.expAbs!=null?` · ภายใน สด.${((m.expAbs-1)%52)+1}`:""}</small></span>${mailOpen(m)?'<i class="dot"></i>':""}</button>`).join("")}</div>`:`<p class="lead">ยังไม่มีจดหมาย</p>`}`;}
function letterHTML(m){m.read=true;let act="";
  if(m.kind==="take")act=m.done?`<p class="meta center">รับแล้ว ${fmt(m.amt)}</p>`:`<button class="btn primary" data-act="mtake" data-v="${m.id}">รับเงิน ${fmt(m.amt)}</button>`;
  if(m.kind==="pay")act=m.done?`<p class="meta center">${m.paid?"จ่ายแล้ว":"ไม่จ่าย (ชื่อเสียง −0.3)"}</p>`:m.expired?"":`<button class="btn" data-act="mskip" data-v="${m.id}">ไม่จ่าย (ชื่อเสียง −0.3)</button><button class="btn primary" data-act="mpay" data-v="${m.id}" ${G.cash<m.amt?"disabled":""}>จ่าย ${fmt(m.amt)}</button>`;
  if(m.kind==="quiz")act=m.done?`<p class="meta center">${m.ok?`ตอบถูก! ได้ ${fmt(m.amt)}`:`ผิดจ้า คำตอบคือ "${esc(m.opts[m.ans])}"`}</p>`:m.expired?"":`<p class="qz"><b>${esc(m.q)}</b></p><div class="qopts">${m.opts.map((o,i)=>`<button class="btn" data-act="mquiz" data-v="${m.id}" data-k="${i}">${esc(o)}</button>`).join("")}</div>`;
  if(m.kind==="job")act=m.done?`<p class="meta center">${m.declined?"ไม่ได้ไปช่วย":m.grade?`ไปช่วยแล้ว · เกรด ${m.grade}`:"ส่งคนไปช่วยแล้ว ได้ ฿550"}</p>`:m.expired?`<p class="meta center">หมดเวลาแล้ว</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mjdecl" data-v="${m.id}">ไม่ว่าง</button><button class="btn" data-act="mjskip" data-v="${m.id}">ส่งคนไปช่วย (฿550)</button><button class="btn primary" data-act="mjplay" data-v="${m.id}">${JOY_PX}ไปช่วยเอง</button>`;
  if(m.kind==="event")act=evMailAct(m);
  if(m.kind==="quest")act=m.done?`<p class="meta center">${m.declined?"ปฏิเสธแล้ว":"ส่งนักมวยไปแล้ว"}</p>`:m.expired?`<p class="meta center">หมดเวลาแล้ว</p>`:`<button class="btn" data-act="mdecl" data-v="${m.id}">ไม่ไป</button><button class="btn primary" data-act="macc" data-v="${m.id}">รับงาน · เลือกนักมวย</button>`;
  const opp=m.qk?QK[m.qk]:m.npc?G.F[m.npc]:null;
  return `<button class="btn sm ghost mback" data-act="mail">◂ ตู้จดหมาย</button><div class="letter px"><div class="lhead"><small>จาก</small><b>${esc(m.from)}</b><small>สัปดาห์ ${m.wk}</small></div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>
   ${m.kind==="take"||m.kind==="pay"?`<p class="lamt ${m.kind}">${m.kind==="take"?"+":"−"}${fmt(m.amt)}</p>`:""}
   ${opp&&m.kind==="quest"?`<div class="qopp">${m.qk?`<canvas width="96" height="96" data-qsprite="${QK[m.qk].sprite}"></canvas>`:faceImg(opp)}<span><b>${esc(opp.name)}</b><small>${m.q==="belt"?`ห้ายก · พลังคู่ชก ${ovr(opp.a).toFixed(1)}`:m.q==="challenge"?"ไฟต์โชว์ ไม่นับสถิติ":"ชกทันที · ไม่นับสถิติและอันดับ · นักมวยล้าเพิ่ม"}${m.pay?` · ค่าเหนื่อย ${fmt(m.pay)}`:m.q==="gang"?" · ค่าตอบแทนมาทางตู้จดหมาย":""}</small></span></div>`:""}</div>
   <div class="mfoot lact">${act}</div>`;}
function qpickHTML(mid){const m=(G.mail||[]).find(x=>x.id===mid);const R=roster(G);
  return `<h2>ส่งใครไป?</h2><p class="meta">${m?esc(m.title):""} · ชกทันทีสัปดาห์นี้ ล้าเพิ่ม ไม่นับสถิติ</p><div class="qpick">${R.map(f=>`<button class="qpf px" data-act="qsend" data-id="${f.id}" data-v="${mid}" ${f.injury?"disabled":""}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?`บาดเจ็บ ${f.injury} สด.`:`ล้า ${Math.round(f.fatigue)} · ความพร้อม ${condition(f)}`}</small></span></button>`).join("")}</div>`;}
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
  for(const id of ["kati","mali","rin","ploy","fah"]){const f=G.F[id];if(f&&(f.camp==="player"||f.met)&&typeof bdayWeek==="function"&&bdayWeek(id)===w)E.push({ic:"🎂",t:`วันเกิด${f.name}`});}
  const FE={26:["🏮","ลอยกระทง"],32:["🎆","ปีใหม่"],47:["💦","สงกรานต์"]};if(FE[w])E.push({ic:FE[w][0],t:FE[w][1]});
  if(typeof CONTEST_WEEK!=="undefined"&&w===CONTEST_WEEK){const c=G.contests&&G.contests[S];E.push({ic:"🌸",t:c&&c.rank?`ประกวดค่ายสวย · ได้อันดับ ${c.rank}`:"ประกวดค่ายสวย นายอำเภอมาตรวจค่าย"});}
  return E;}
function calendarHTML(){const past={},next={};for(const c of G.cal||[])if(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)(past[c.wk]=past[c.wk]||[]).push(c);for(const b of G.bookings)if(G.F[b.a]&&G.F[b.a].camp==="player")(next[b.week]=next[b.week]||[]).push(b);
  const mark={20:"ตัดรอบตำบล",40:"ตัดรอบอำเภอ",44:"รองชิง",49:"ชิงแชมป์"};
  return `<section class="px card cal"><div class="card-h"><h3>ปฏิทินปีที่ ${G.season||1}</h3><span class="legend"><i class="cw"></i>ชนะ <i class="cl"></i>แพ้ <i class="cn"></i>นัดถัดไป</span></div>
   <div class="calg">${Array.from({length:52},(_,i)=>i+1).map(w=>{const p=past[w],n=next[w];const r=p?(p.some(c=>c.res==="W")?(p.every(c=>c.res==="W")?"w":"m"):p.some(c=>c.res==="D")?"d":"l"):"";
     const ev=calEvents(w);return `<button class="cday ${w<G.week?"gone":""} ${w===G.week?"now":""} ${p?"has "+r:""} ${n?"nx":""} ${mark[w]?"mk":""} ${ev.length?"ev":""}" data-act="calday" data-v="${w}" ${p||n||ev.length?"":"tabindex=\"-1\""} title="${[mark[w]||""].concat(ev.map(e=>e.t)).filter(Boolean).join(" · ")}" aria-label="สัปดาห์ ${w}${p?" มีผลไฟต์":n?" มีนัดชก":""}${ev.map(e=>" "+e.t).join("")}">${ev.length?`<u>${ev.slice(0,2).map(e=>e.ic).join("")}</u>`:""}<b>${w}</b>${p||n?`<i>${p?p.length:""}${n?"●":""}</i>`:""}${mark[w]?`<s></s>`:""}</button>`;}).join("")}</div>
   <p class="meta">แตะช่องเพื่อดูผลไฟต์และกิจกรรม · 🎂 วันเกิด · 🏮🎆💦 เทศกาล · 🌸 ประกวดค่ายสวย · ขีดทอง = สัปดาห์ตัดรอบ (20, 40) และรองชิง/ชิง (44, 49)</p></section>`;}
function caldayHTML(w){const p=(G.cal||[]).filter(c=>c.wk===w&&(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)),n=G.bookings.filter(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player");
  const ev=calEvents(w);return `<h2>สัปดาห์ ${w}${typeof weekDateLabel==="function"?` <small class="meta">· ${weekDateLabel(w)}</small>`:""}</h2>${ev.map(e=>`<div class="calres px ev"><b>${e.ic} ${esc(e.t)}</b></div>`).join("")}${p.map(c=>{const me=G.F[c.a];return `<div class="calres px ${c.res==="W"?"w":c.res==="L"?"l":"d"}"><b>${esc(me?me.name:c.a)} ${c.res==="W"?"ชนะ":c.res==="L"?"แพ้":"เสมอ"} ${esc(c.bn)}</b><span class="meta">${TIER[c.tier]?TIER[c.tier].name:""} · ${esc(c.type||"")} · ได้ ${fmt(c.pay||0)}</span><span class="cards">${(c.cards||[]).map((k,i)=>`<i>ย${i+1} ${k[0]}–${k[1]}</i>`).join("")}</span></div>`;}).join("")}
   ${n.map(b=>`<div class="calres px nx"><b>${esc(G.F[b.a].name)} vs ${esc(G.F[b.b].name)}</b><span class="meta">นัดชก · ${TIER[b.tier].name} · ${b.rounds} ยก</span></div>`).join("")}${!p.length&&!n.length?`<p class="meta">ไม่มีไฟต์ของค่ายในสัปดาห์นี้</p>`:""}`;}
const RANK_HELP=`<ul class="fp-list"><li><b>ชนะ 3 แต้ม</b> (ล้มคนที่เก่งกว่า +1) · เสมอ 1 · แพ้ 0 — นับเฉพาะไฟต์ "ระดับตำบล/อำเภอ"</li><li><b>สัปดาห์ 1–20 รอบตำบล:</b> ท็อป 4 ของรุ่นได้ไปรอบอำเภอ</li><li><b>สัปดาห์ 21–40 รอบอำเภอ:</b> แต้มเริ่มใหม่ ท็อป 4 ได้ไปรองชิงจังหวัด</li><li><b>สัปดาห์ 44 รองชิง · 49 ชิงแชมป์จังหวัด</b> เงินรางวัลก้อนใหญ่และชื่อเสียงสูงสุด</li><li>ไฟต์งานวัด ไฟต์พิเศษ และไฟต์นอกตาราง <b>ไม่ได้แต้ม</b> แต่ได้เงิน EXP และชื่อเสียง</li></ul>`;
const XMODAL={
  mail:()=>({body:mailListHTML(),foot:true}),
  letter:m=>{const x=(G.mail||[]).find(y=>y.id===m.id);return x?{body:letterHTML(x),foot:false}:{body:mailListHTML(),foot:true};},
  qpick:m=>({body:qpickHTML(m.id),foot:true}),
  cashflow:()=>({body:cashflowHTML(),foot:true}),
  repgraph:()=>({body:repgraphHTML(),foot:true}),
  calday:m=>({body:caldayHTML(m.w),foot:true}),
  rankhelp:()=>({body:`<h2>อันดับมีผลยังไง?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>ครูแดง:</b> เป้าหมายฤดูกาลนี้คือพากะทิ${G.F.mali.camp==="player"?"กับมะลิ":""}ขึ้นไป<b>ท็อป 4</b> ของรุ่น ผ่านสองด่านให้ได้ แล้วไปเจอพยัคฆ์ทองที่นัดชิง</span></div>${RANK_HELP}`,foot:true}),
  declo:m=>{const o=G.offers.find(x=>x.id===m.id);if(!o)return {body:"",foot:true};return {body:`<h2>ปฏิเสธข้อเสนอนี้?</h2><p>${esc(G.F[o.a].name)} vs ${esc(G.F[o.b].name)} · สด.${o.week} · ${TIER[o.tier].name}</p><p class="meta">ข้อเสนอจะหายไปจากรายการ (ถ้าปฏิเสธคนเดิมบ่อย ๆ เขาอาจเขียนจดหมายมาท้า)</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">ไม่ใช่</button><button class="btn primary" data-act="declyes" data-v="${o.id}">ปฏิเสธเลย</button></div>`,foot:false};}};
Object.assign(ACT,{
  mail:()=>{UI.modal={type:"mail"};render();},
  mopen:d=>{UI.modal={type:"letter",id:d.v};render();save();},
  mtake:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.cash+=m.amt;m.done=true;AU.sfx("level");toast(`ได้รับ ${fmt(m.amt)}`);save();render();},
  mpay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||G.cash<m.amt)return;G.cash-=m.amt;m.done=true;m.paid=true;AU.sfx("ui");save();render();},
  mskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.rep=Math.max(0,G.rep-.3);m.done=true;save();render();},
  mquiz:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.ok=+d.k===m.ans;if(m.ok){G.cash+=m.amt;AU.sfx("level");}else AU.sfx("miss");save();render();},
  mjdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mjskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;G.cash+=550;G.dust=(G.dust||0)+1;roster(G).forEach(f=>f.morale=clamp(f.morale+3,0,100));AU.sfx("ui");toast("ป้าแต๋วฝากขอบคุณ ได้ ฿550 · ✦ +1");save();render();},
  mjplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();BAG.openMode("somtam",null,m.id);},
  mdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m)return;m.done=true;m.declined=true;if(m.q==="gang"&&G.gang)G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);save();render();},
  macc:d=>{UI.modal={type:"qpick",id:d.v};render();},
  qsend:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;UI.modal=null;
    const spec=m.q==="belt"?{q:"belt",npc:m.npc,pay:m.pay,from:m.from,div:m.div,defend:m.defend,venue:m.venue||"tha",bg:m.bg,rounds:5}:m.q==="challenge"?{q:"challenge",npc:m.npc,pay:m.pay,from:m.from}:{q:m.q,qk:m.qk,pay:m.pay,from:m.from,rounds:m.qk==="gang5"?4:3};
    const intro=m.q==="gang"?[{n:"nar",t:"ตลาดเช้า… มอเตอร์ไซค์สิบกว่าคันจอดเรียงหน้าแผงผัก"},{n:"npc",who:QK[m.qk].name,t:m.early?"ลูกน้องฉันแพ้เธอซ้ำแล้วซ้ำเล่า เสียชื่อหมด! แถมค่ายเธอยังติดหนี้ฉันอยู่ วันนี้ฉันจัดการเอง!":m.qk==="gang5"?"ได้ยินว่ามีค่ายมวยมาเกะกะธุรกิจฉัน วันนี้หัวหน้าใหญ่ลงมาเอง!":"ไหนใครที่ไล่ลูกน้องฉัน ออกมาเลย!"},{n:d.id,f:"angry",l:"fight",t:"ฉันเอง!"}]
      :m.q==="belt"?[{n:"nar",t:`${STADIUMS[m.venue||"tha"].name} ไฟสปอตไลต์ส่องลงกลางเวที โฆษกประกาศชื่อทั้งสองมุม`},{n:"npc",who:G.F[m.npc].name,t:m.defend?"เข็มขัดเส้นนั้นควรเป็นของฉัน วันนี้ฉันมาเอาคืน":"อยากได้เข็มขัดเหรอ? ต้องข้ามศพฉันไปก่อน"},{n:d.id,f:"angry",l:"fight",t:m.defend?"มาเอาให้ได้สิ!":"หนูมาเพื่อสิ่งนั้นแหละ!"}]
      :m.q==="challenge"?[{n:"nar",t:"ลานหลังตลาดสด คนมามุงเต็มสองฝั่ง มีคนตั้งโต๊ะรับพนันน้ำแดง"},{n:"npc",who:G.F[m.npc].name,t:"มาจนได้นะ นึกว่าจะหนีตลอดฤดูกาล"},{n:d.id,f:"angry",l:"fight",t:"ไม่ได้หนี แค่ยังไม่ว่าง ตอนนี้ว่างแล้ว!"}]
      :m.q==="cow"?[{n:"nar",t:"กลางถนนหน้าตลาด วัวนมตัวใหญ่ยืนตั้งการ์ด ขาหน้าเต้นฟุตเวิร์กแบบที่ไม่มีวัวตัวไหนควรทำได้"},{n:"npc",who:"ลุงเฉลิม",t:"นั่นแหละ! ระวังถีบนะหนู มันดูไฟต์ย้อนหลังทุกคืน!"},{n:d.id,f:"surprised",l:"fight",t:"…วัวตั้งการ์ดได้จริง ๆ ด้วย!?"}]
      :[{n:"nar",t:"ไก่แจ้ตัวเล็กยืนบนกระสอบทราย อกพองโต ขนคอตั้งชัน"},{n:"npc",who:"เสี่ยต๋อง",t:"อย่าดูถูกมันนะครับ มันเคยไล่สุนัขพันธุ์ใหญ่ทั้งซอยมาแล้ว"},{n:d.id,f:"happy",l:"fight",t:"มาเลยเจ้าไก่! หนูไม่ใช่สุนัขนะ!"}];
    playScene(intro,()=>startQuest(spec,d.id,()=>{}),{bg:m.q==="gang"?"market":m.q==="belt"?STADIUMS[m.venue||"tha"].scene:m.q==="challenge"?"food":m.q==="rooster"?"rooster":m.q==="cow"||m.q==="bull"?"farm":"fair",look:"fight"});},
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
const DM_WEEKS=[12,19,24,31,36,46];
const DM_PRIZE=[0,3000,8000,18000,40000];   // by how far our best fighter got: out in QF / SF / final / champion
const DM_STAGE=["รอบ 8 คน","รอบรองชนะเลิศ","รอบชิงชนะเลิศ"];
const dmOfferOn=G=>DM_WEEKS.includes(G.week)&&!(G.dmSeenSeason===(G.season||1)&&(G.dmSeen||{})[G.week])&&!G.ended;
const dmMine=id=>G.F[id]&&G.F[id].camp==="player";
const dmCanEnter=f=>!f.injury&&!isBooked(G,f.id,G.week);
function dmBuild(G,mine){const pool=Object.values(G.F).filter(f=>!mine.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&f.div!=="X"&&!isBooked(G,f.id,G.week));
  const avg=mine.reduce((s,id)=>s+ovr(G.F[id].a),0)/mine.length;
  const stars=["ploy","fah"].filter(id=>pool.some(f=>f.id===id));
  const rest=pool.filter(f=>!stars.includes(f.id)).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);
  let others=[...stars,...rest].slice(0,8-mine.length);
  if(others.length<8-mine.length){/* v1.81.1: a short field used to leave empty slots and freeze the week */const extra=Object.values(G.F).filter(f=>!mine.includes(f.id)&&!others.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&(f.div==="A"||f.div==="B")).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);others=others.concat(extra).slice(0,8-mine.length);}
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
function dmFight(meId,opId){const D=G.dm;if(!G.F[opId]){D.w[D.r].push(meId);dmAdvance();UI.modal={type:"dm"};save();render();return;}const b={id:"dm"+G.week+"_"+D.r+"_"+meId,a:meId,b:opId,week:G.week,tier:"dm",rounds:3,win:0,lose:0,dm:1,bg:"bg_hall.webp"};
  UI.modal=null;openFight(b,()=>{const w=b.result;const winner=w==="A"?meId:opId,loser=w==="A"?opId:meId;D.w[D.r].push(winner);if(dmMine(loser))D.out[loser]=D.r+1;
    dmAdvance();UI.modal={type:"dm"};save();render();});}
function dmFinish(){const D=G.dm;const champ=D.w[2][0];D.champ=champ;
  let best=0;for(const id of D.mine){const lv=id===champ?4:(D.out[id]||1);best=Math.max(best,lv);}D.best=best;
  const prize=DM_PRIZE[best]||0;G.cash+=prize;G.wkFight=(G.wkFight||0)+prize;D.prize=prize;
  if(best===4){G.rep+=4;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+10));recordHonor(G,"dm",champ,G.F[champ].div,D.wk);}else if(best===3)G.rep+=1.5;
  G.dmLog=(G.dmLog||[]).concat([{wk:D.wk,champ,best,prize}]);save();}
function dmBracketHTML(){const D=G.dm;if(!D)return "";const nm=id=>id&&G.F[id]?esc(G.F[id].name):"…";
  const cell=(id,r)=>{if(!id)return `<div class="dmc tbd">…</div>`;const won=(D.w[r]||[]).includes(id),lost=r<3&&D.w[r]&&D.w[r].length*2>((r===0?D.slots:D.w[r-1]).indexOf(id))&&!won;
    return `<div class="dmc ${dmMine(id)?"mine":""} ${won?"won":""} ${lost?"lost":""}">${G.F[id].canon?`<img src="${faceSrc(id,"happy")}" alt="">`:""}<b>${nm(id)}</b><small>${G.F[id].div==="A"?"รุ่น A":"รุ่น B"}</small></div>`;};
  const col=(L,r,title)=>`<div class="dmcol"><h4>${title}</h4>${Array.from({length:L.length/2},(_,i)=>`<div class="dmm">${cell(L[i*2],r)}${cell(L[i*2+1],r)}</div>`).join("")}</div>`;
  const pad=(L,n)=>[...L,...Array(n-L.length).fill(null)];
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
   <div class="list">${R.map(f=>`<button class="dmpick ${sel.includes(f.id)?"on":""}" data-act="dmsel" data-id="${f.id}" ${dmCanEnter(f)?"":"disabled"}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?"บาดเจ็บ":`ล้า ${Math.round(f.fatigue)} · กำลังใจ ${Math.round(f.morale)}`}</small></span><i>${sel.includes(f.id)?"✓":""}</i></button>`).join("")}</div>
   <div class="row2"><button class="btn" data-act="dmno">ไม่ร่วม</button><button class="btn primary" data-act="dmstart" ${sel.length?"":"disabled"}>ลงแข่ง ${sel.length} คน ▸</button></div>`;}
function dmCardHTML(){if(G.dm&&!G.dm.done&&G.dm.wk===G.week)return `<section class="px card dmcard"><div><b>ศึก Death Match กำลังดำเนินอยู่</b><span class="meta">${DM_STAGE[Math.min(2,G.dm.r)]}</span></div><button class="btn primary" data-act="dmopen">ไปต่อ ▸</button></section>`;
  if(!dmOfferOn(G))return "";return `<section class="px card dmcard"><span class="ribbon">ข้อเสนอพิเศษ</span><div><b>ศึก Death Match 8 คน ข้ามรุ่น</b><span class="meta">ชกรวดเดียวจบในสัปดาห์นี้ · ไม่นับอันดับ · แชมป์ ${fmt(DM_PRIZE[4])}</span></div><button class="btn gold" data-act="dmpick">ดูรายละเอียด</button></section>`;}
Object.assign(ACT,{
  dmpick:()=>{UI.dmSel=roster(G).filter(dmCanEnter).slice(0,1).map(f=>f.id);UI.modal={type:"dmpick"};render();},
  dmsel:d=>{const s=UI.dmSel||[];UI.dmSel=s.includes(d.id)?s.filter(x=>x!==d.id):s.length<3?[...s,d.id]:s;render();},
  dmno:()=>{if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;UI.modal=null;save();render();},
  dmstart:()=>{const sel=(UI.dmSel||[]).filter(id=>dmMine(id)&&dmCanEnter(G.F[id]));if(!sel.length)return;if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;
    G.dm=dmBuild(G,sel);UI.modal=null;save();
    playScene([{n:"npc",who:"โฆษกสนาม",t:vary("dm1",["ท่านผู้ชมครับ! คืนนี้ไม่มีพรุ่งนี้! แปดนักชกจากทุกรุ่น ชกจนเหลือคนสุดท้าย! ศึก Death Match!!","กลับมาอีกครั้งครับ! ศึกที่ไม่มีคำว่าพัก! แปดคนเข้า หนึ่งคนออก! Death Match!!","ใครเหนื่อยกลับบ้านไปได้เลยครับ! คืนนี้ชกรวดเดียวจนได้แชมป์! Death Match!!","คนดูแน่นจนเต็นท์จะพัง! แปดยอดมวยหญิงทุกรุ่น ศึก Death Match มาแล้วครับ!!"])},
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
function bagChart(G,dk,salt=0){const D=BAG_DIFF[dk],beat=60/D.bpm,half=beat/2,N=[];let t=4*beat;/* one bar of count-in */
  for(let b=0;b<D.bars;b++){const pool=[].concat(...BAG_PAT.slice(0,D.dens+1));const p=b===D.bars-1?"L.......":pool[Math.floor(srand(G,700+salt+b*13+D.dens*101+G.week)*pool.length)];
    for(let i=0;i<8;i++){if(p[i]!==".")N.push({t:t+i*half,k:p[i],j:null});}t+=4*beat;}
  return {notes:N,end:t+beat,beat};}
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
  open(){const F=bagFighters(G);if(!F.length){toast("ไม่มีนักมวยที่พร้อมซ้อม");return;}
    const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"hub",mode:"bag",id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();this.draw();},
  openMode(m,act,mail){const F=bagFighters(G);if(!F.length){toast("ไม่มีนักมวยที่พร้อมซ้อม");return;}const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"pick",mode:m,act,mail,id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();if(m==="live"){LIVE.pick();LIVE.st.practice=false;LIVE.st.act=act;LIVE.draw();}else this.draw();},
  mount(){let el=document.getElementById("minibag");if(!el){el=document.createElement("div");el.id="minibag";el.className="mgame";document.body.appendChild(el);}
    el.onclick=e=>{const lv=e.target.closest("[data-lv]");if(lv&&typeof LIVE!=="undefined"){LIVE.act(lv.dataset.lv,lv.dataset.v);return;}const b=e.target.closest("[data-mb]");if(!b)return;const a=b.dataset.mb,v=b.dataset.v;
      if(a==="mode"&&MG_MODES[v]&&MG_MODES[v].custom){this.st.mode=v;LIVE.pick();}else if(a==="mode"){this.st.mode=v;this.st.phase="pick";this.st.practice=mgPlayed(G,v);this.draw();}else if(a==="hub"){this.st.phase="hub";this.draw();}else if(a==="pick"){this.st.id=v;this.draw();}else if(a==="dk"){this.st.dk=v;this.draw();}else if(a==="go")this.start();else if(a==="close")this.close();else if(a==="claim")this.claim();else if(a==="again"){this.st.phase="pick";this.st.practice=true;this.draw();}};
    if(!this.keyH){this.keyH=e=>{if(typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"&&/^[123]$/.test(e.key)){const d=LIVE.st.cur;if(d){e.preventDefault();LIVE.answer(d.ord[+e.key-1]);}return;}if(!this.st||this.st.phase!=="play")return;const k=e.key.toLowerCase();if(e.repeat)return;
      if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();this.hit("L");}else if(k==="j"||k==="k"||k==="arrowright"){e.preventDefault();this.hit("R");}else if(k==="escape")this.close();};
      document.addEventListener("keydown",this.keyH);
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"){LIVE.st.dur=0;}if(document.hidden&&this.st&&this.st.phase==="play"){this.st.phase="abort";cancelAnimationFrame(this.raf);this.draw();}});}},
  close(){cancelAnimationFrame(this.raf);if(typeof LIVE!=="undefined"&&LIVE.st){cancelAnimationFrame(LIVE.raf);LIVE.st=null;}const el=document.getElementById("minibag");if(el)el.remove();this.st=null;try{AU.startMusic("hub");}catch(e){}if((G.cardPend||[]).length&&!UI.modal)UI.modal={type:"cardnew"};render();},
  draw(){const S=this.st,el=document.getElementById("minibag");if(!S||!el)return;if(S.phase==="live")return LIVE.draw();const F=bagFighters(G),f=G.F[S.id];
    const M=MG_MODES[S.mode];
    if(S.phase==="hub"){el.innerHTML=`<div class="mbox px"><h2>${JOY_PX}มินิเกม</h2><p class="meta center">แต่ละเกมได้รางวัลสัปดาห์ละครั้ง · เล่นซ้ำเป็นโหมดซ้อมได้ไม่จำกัด</p>
       <div class="mghub">${Object.entries(MG_MODES).map(([k,X])=>{const op=X.open(G),pl=mgPlayed(G,k);return `<button class="mgitem ${pl?"done":""}" data-mb="mode" data-v="${k}" ${op?"":"disabled"}><span class="mi">${X.icon}</span><span><b>${X.title}</b><small>${op?(pl?"รับรางวัลแล้วสัปดาห์นี้ ✓":X.note):"ยังไม่เปิด"}</small></span><span class="chev">▸</span></button>`;}).join("")}</div>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">กลับค่าย</button></div></div>`;return;}
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{})[S.mode]||{};
      el.innerHTML=`<div class="mbox px"><h2>${M.icon} ${M.title}</h2>
       <p class="meta">กดตามโน้ตตอนที่ลอยมาถึงวงกลม · <b class="mbL">${M.L}</b> = ${M.Ls} (ปุ่มซ้าย / F) · <b class="mbR">${M.R}</b> = ${M.Rs} (ปุ่มขวา / J)</p>
       <div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-mb="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <div class="mbdk">${Object.entries(BAG_DIFF).map(([k,d])=>`<button class="btn sm ${k===S.dk?"primary":""}" data-mb="dk" data-v="${k}">${d.name}${best[k]?` · ${best[k]}`:""}</button>`).join("")}</div>
       <p class="meta center">${S.card?(S.practice?"มินิเกมของการ์ด · เล่นซ้อมได้ไม่จำกัด":"มินิเกมของการ์ด · เล่นจบครั้งแรกได้เศษดาว ✦ ตามเกรด"):S.practice?"สัปดาห์นี้เล่นไปแล้ว · รอบนี้เป็นโหมดซ้อม ไม่มีรางวัล":S.mode==="bag"?"รางวัลสัปดาห์ละครั้ง: ค่าเตะ/หมัด · กำลังใจ · เศษดาว ✦ · เกรด S ปลดการ์ด":"รางวัลสัปดาห์ละครั้ง: ค่าจ้างจากป้าแต๋ว · ชื่อเสียง · เศษดาว ✦ · เกรด S ปลดการ์ด"}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ไว้ก่อน</button><button class="btn primary" data-mb="go">เริ่ม! ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mplay"><div class="mhud"><b>${esc(f.name)}</b><span>คอมโบ <b id="mbc">0</b></span><span>คะแนน <b id="mbs">0</b></span><button class="xbtn" data-mb="close" aria-label="ออก">✕</button></div>
       <canvas id="mbcv" width="360" height="300"></canvas>
       <div class="mbtns"><button class="mbtn L ${S.mode}" id="mbL"><b>${M.L}</b><small>${M.Ls} · F</small></button><button class="mbtn R ${S.mode}" id="mbR"><b>${M.R}</b><small>${M.Rs} · J</small></button></div></div>`;
      const pd=k=>e=>{e.preventDefault();this.hit(k);};document.getElementById("mbL").addEventListener("pointerdown",pd("L"));document.getElementById("mbR").addEventListener("pointerdown",pd("R"));return;}
    if(S.phase==="abort"){el.innerHTML=`<div class="mbox px"><h2>หยุดกลางคัน</h2><p class="meta center">สลับแอปหรือปิดหน้าจอระหว่างเล่น เพลงเลยหยุด · ยังไม่เสียสิทธิ์รางวัลสัปดาห์นี้</p><div class="mfoot roadbtns"><button class="btn" data-mb="close">ปิด</button><button class="btn primary" data-mb="again">เล่นใหม่</button></div></div>`;return;}
    if(S.phase==="result"){const R=S.res;
      el.innerHTML=`<div class="mbox px"><h2>ผลการซ้อม</h2><div class="mgrade g${R.grade}">${R.grade}</div>
       <p class="center"><b>${R.score}</b> คะแนน · คอมโบสูงสุด ${R.maxc} · แม่นยำ ${Math.round(R.acc*100)}%</p>
       <p class="center meta">เพอร์เฟกต์ ${R.c.perfect} · ดี ${R.c.great} · พอได้ ${R.c.ok} · พลาด ${R.c.miss}${R.best?" · <b class=\"goldt\">สถิติใหม่!</b>":""}</p>
       ${S.practice?`<p class="center meta">โหมดซ้อม · ไม่มีรางวัล</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-mb="again">เล่นอีกรอบ (ซ้อม)</button><button class="btn primary" data-mb="close">กลับค่าย</button></div></div>`;}},
  start(){const S=this.st;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}
    G.mini=G.mini||{};G.mini.bagLast=S.id;G.mini.bagDk=S.dk;
    const C=bagChart(G,S.dk,S.mode==="somtam"?5000:0);S.notes=C.notes;S.end=C.end;S.beat=C.beat;S.phase="play";S.score=0;S.combo=0;S.maxc=0;S.c={perfect:0,great:0,ok:0,miss:0};S.fx=[];S.hitT=-9;S.hitK="L";
    this.draw();S.t0=this.clock()+.6;const nb=Math.round(S.end/S.beat);for(let i=0;i<nb;i++)this.ching(S.t0+i*S.beat,i%2===0);
    const cv=document.getElementById("mbcv");S.x=cv.getContext("2d");S.x.imageSmoothingEnabled=false;const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.frame();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  now(){return this.clock()-this.st.t0;},
  judge(n,q){const S=this.st;n.j=q;S.c[q]++;if(q==="miss"){S.combo=0;}else{S.combo++;S.maxc=Math.max(S.maxc,S.combo);S.score+=({perfect:100,great:70,ok:40})[q]+Math.min(50,S.combo*2);}
    S.fx.push({q,t:this.now()});const c=document.getElementById("mbc"),s=document.getElementById("mbs");if(c)c.textContent=S.combo;if(s)s.textContent=S.score;},
  hit(k){const S=this.st;if(!S||S.phase!=="play")return;const t=this.now();if(S.mode==="somtam")this.wood(k,this.clock());else this.drum(k,this.clock());S.hitT=t;S.hitK=k;
    const btn=document.getElementById(k==="L"?"mbL":"mbR");if(btn){btn.classList.remove("hit");void btn.offsetWidth;btn.classList.add("hit");}
    let best=null,bd=9;for(const n of S.notes){if(n.j)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}if(n.t-t>BAG_WIN.ok)break;}
    if(!best||bd>BAG_WIN.ok)return;/* stray tap: no penalty */
    if(best.k!==k){this.judge(best,"miss");return;}
    this.judge(best,bd<=BAG_WIN.perfect?"perfect":bd<=BAG_WIN.great?"great":"ok");},
  frame(){const S=this.st,x=S.x,W=360,H=300,t=this.now(),f=G.F[S.id];
    for(const n of S.notes){if(!n.j&&t-n.t>BAG_WIN.ok)this.judge(n,"miss");}
    if(t>S.end+.4){this.finish();return;}
    x.clearRect(0,0,W,H);x.fillStyle="#1b1530";x.fillRect(0,0,W,H);
    // fighter + heavy bag (same drawing as the training drill)
    const dt=(t-S.hitT)*1000,hit=dt>=0&&dt<450;const row=hit?(S.mode==="somtam"?"punch":S.hitK==="L"?"knee":"punch"):(S.mode==="somtam"?"idle":"guard");const fr=hit?Math.min(3,Math.floor(dt/90)):Math.floor(performance.now()/260)%4;
    x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.ellipse(W*.4,196,40,6,0,0,7);x.fill();
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
    const last=S.fx[S.fx.length-1];if(last&&t-last.t<.5){const a=(t-last.t)/.5;x.globalAlpha=1-a;x.font=`bold ${22+a*6}px "Pixelify Sans",sans-serif`;x.textAlign="center";x.lineWidth=4;x.strokeStyle="#000";
      const T={perfect:["PERFECT!","#ffd34a"],great:["GREAT","#8ef0a0"],ok:["OK","#fff"],miss:["MISS","#ff6a6a"]}[last.q];x.strokeText(T[0],W*.6,26-a*10);x.fillStyle=T[1];x.fillText(T[0],W*.6,26-a*10);x.globalAlpha=1;}
    // note lane (taiko style: notes slide in from the right to the drum circle)
    const ly=252,hx=46,sp=210;x.fillStyle="#120e22";x.fillRect(0,ly-30,W,60);x.fillStyle="#2c2448";x.fillRect(0,ly-30,W,3);x.fillRect(0,ly+27,W,3);
    const bt=S.beat;for(let b=Math.ceil((t-.5)/bt)*bt;b<t+1.8;b+=bt){const bx2=hx+(b-t)*sp;if(bx2>0&&bx2<W){x.fillStyle="rgba(255,255,255,.08)";x.fillRect(bx2,ly-26,2,52);}}
    x.lineWidth=3;x.strokeStyle="#ffd34a";x.beginPath();x.arc(hx,ly,22,0,7);x.stroke();x.strokeStyle="rgba(255,211,74,.35)";x.beginPath();x.arc(hx,ly,15,0,7);x.stroke();
    for(let i=S.notes.length-1;i>=0;i--){const n=S.notes[i];if(n.j&&n.j!=="miss")continue;const nx=hx+(n.t-t)*sp;if(nx<-30||nx>W+30)continue;
      const L=n.k==="L",r=L?18:14;x.globalAlpha=n.j==="miss"?.35:1;x.fillStyle="#000";x.beginPath();x.arc(nx,ly,r+3,0,7);x.fill();x.fillStyle=L?"#e2443c":"#3c8be2";x.beginPath();x.arc(nx,ly,r,0,7);x.fill();
      x.fillStyle="rgba(255,255,255,.35)";x.beginPath();x.arc(nx-r*.3,ly-r*.35,r*.35,0,7);x.fill();x.fillStyle="#fff";x.font=`bold ${L?13:11}px sans-serif`;x.textAlign="center";x.fillText(L?MG_MODES[S.mode].L:MG_MODES[S.mode].R,nx,ly+4);x.globalAlpha=1;}
    // count-in
    if(t<4*bt){const n=4-Math.floor(Math.max(0,t)/bt);x.font='bold 40px "Pixelify Sans",sans-serif';x.textAlign="center";x.fillStyle="#fff";x.strokeStyle="#000";x.lineWidth=5;const s=t<0?"พร้อม":String(n);x.strokeText(s,W/2,120);x.fillText(s,W/2,120);}
    // progress
    x.fillStyle="#2c2448";x.fillRect(0,H-4,W,4);x.fillStyle="#ffd34a";x.fillRect(0,H-4,W*Math.min(1,Math.max(0,t/S.end)),4);},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);S.phase="result";const n=S.notes.length,c=S.c;
    const acc=(c.perfect+c.great*.75+c.ok*.4)/Math.max(1,n);const grade=acc>=.92&&c.miss===0?"S":acc>=.78?"A":acc>=.6?"B":"C";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number"){G.mini.best={bag:G.mini.best};}const B=G.mini.best[S.mode]=G.mini.best[S.mode]||{};const isBest=S.score>(B[S.dk]||0);if(isBest)B[S.dk]=S.score;
    S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:isBest,rw:""};
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
    const g=Math.round(acc*.3*D.mul*100)/100;const up=k=>{const cap=Math.min(20,(f.potential||14)+1.5);const before=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g/2)*100)/100);return f.a[k]>before;};
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
    S.i=0;S.view=Math.round(25+(G.rep||5)*3)*(S.host==="fah"?1.4:1);S.peak=S.view;S.sold=0;S.good=0;S.asked=0;S.feed=[];S.cur=null;S.phase="play";S.t0=performance.now();S.dur=45000;
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
Object.assign(CARDS,{
 m_live:{c:"kati",r:"R",t:"ไลฟ์แรกของค่าย",hint:"ไลฟ์ขายของค่ายครั้งแรก",bg:"camp",need:G=>(G.flags.liveN||0)>=1,steps:[
  {n:"nar",t:"มือถือตั้งบนกองกระสอบทราย กะทิกับเสื้อค่ายตัวเดียวที่รีดเรียบที่สุด กล้องหน้าเปิดอยู่ คนดู 3 คน"},
  {n:"kati",f:"flustered",l:"casual",t:"สะ… สวัสดีค่ะ ค่ายศิริชัยค่ะ วันนี้มีเสื้อมาขาย… คนดูสามคน หนึ่งในนั้นคือครูแดง"},
  {n:"coach",t:"(คอมเมนต์จากบัญชี 'แดงศิริชัย') CF 1 ตัว"},
  {n:"kati",f:"happy",l:"casual",t:"ครูคะ! ครูยืนอยู่ข้างหลังหนูเนี่ย! …แต่ขอบคุณค่ะ ออเดอร์แรกของค่ายเลยนะคะ"}]},
 m_livehot:{c:"fah",r:"SR",t:"ไลฟ์แตก",hint:"ได้เกรด S ในไลฟ์ขายของ",bg:"camp",need:G=>(G.flags.liveS||0)>=1,steps:[
  {n:"nar",t:"ตัวเลขคนดูพุ่งเกินพัน ออเดอร์เด้งจนมือถือสั่นไม่หยุด ทั้งค่ายช่วยกันจดใส่สมุดของริน"},
  {n:"fah",f:"happy",l:"casual",t:"เห็นไหม! บอกแล้วว่าไลฟ์ต้องมีฟ้า! …อ้าว วันนี้ฟ้าไม่ได้ไลฟ์เหรอ ช่างเถอะ ฟ้าเชียร์อยู่หลังกล้องก็นับ!"},
  {n:"rin",f:"pout",l:"casual",t:"ออเดอร์ทั้งหมดบันทึกครบ ไม่มีซ้ำ ไม่มีตก …เสื้อในโกดังเหลือสองตัว ใครจะบอกลูกค้าคนที่สามสิบเอ็ด"},
  {n:"coach",t:"สมัยปู่ชัย เสื้อค่ายขายได้ปีละสิบตัว …วันนี้ขายได้ในห้านาที โลกมันเปลี่ยนไปจริง ๆ"}]}});

/* ===== v1.80: redeem codes + the Loy Krathong event (a floating-market gauntlet against the helmet gang) ===== */
const REDEEM={"U0lSSUNIQUky":{k:"gate"},"TE9ZS1JBVEhPTkc2OQ==":{k:"loy",from:"2026-11-18",to:"2026-12-07"}};
function evTest(){try{return !/github\.io$/.test(location.hostname)||/evtest/.test(location.hash)||localStorage.getItem("mtm-evtest")==="1";}catch(e){return false;}}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const LOY_LADDER=["gang1","gang1","gang2","gang2","gang3","gang3","gang4","gang4","gang5"];
const LOY_TIERS=[["gold","ทอง",1500],["silver","เงิน",1000],["bronze","ทองแดง",450]];
const loyOf=G=>(G.ev||{}).loy||null;
function loyTier(sc,boss){for(const [k,n,min] of LOY_TIERS)if(sc>=min&&(k!=="gold"||boss))return {k,n};return null;}
function evGang(G,k,f){const kind=LOY_LADDER[k],K=QK[kind],t=ovr(f.a)+K.lvl+k*.12,rng=mulberry32((G.seed^0x10e)+k*131);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_evloy_"+k;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind=kind;o.grp="gang";o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=75;G.F[id]=o;syncFighterAges(G);return id;}
function redeemCode(raw){const v=(raw||"").toUpperCase().replace(/\s+/g,"");if(!v)return;let key="";try{key=btoa(v);}catch(e){}const R=REDEEM[key];
  if(!R){AU.sfx("miss");toast("ไม่พบโค้ดนี้ ลองเช็กตัวสะกดอีกครั้ง");return;}
  if(R.k==="gate"){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}save();AU.sfx("level");toast("ปลดล็อกปีที่ 2 แล้ว!");return;}
  if(R.k==="loy"){const t=todayStr();if(!evTest()){if(t<R.from){toast("โค้ดนี้จะเปิดใช้วันที่ 18 พ.ย. ติดตามประกาศที่เพจและ Discord นะ");return;}if(t>R.to){toast("อีเวนต์ลอยกระทงปีนี้จบไปแล้ว ไว้เจอกันปีหน้า!");return;}}
    if(loyOf(G)){toast("เซฟนี้ใช้โค้ดนี้ไปแล้ว ดูจดหมายเชิญในกล่องจดหมายได้เลย");return;}
    G.ev=G.ev||{};G.ev.loy={got:G.week,season:G.season||1,best:0,tiers:{},runs:0};
    addMail(G,{kind:"event",ev:"loy",from:"ป้าแต๋ว ร้านส้มตำหน้าวัด",title:"คืนนี้งานลอยกระทงตลาดน้ำ!",body:"ผู้จัดการจ๋า คืนนี้ป้าไปเปิดแผงขายกระทงที่งานตลาดน้ำ พาเด็ก ๆ ในค่ายมาเที่ยวกันนะ มีของกินเพียบ ป้าเลี้ยงส้มตำเอง! แต่ได้ยินว่าแก๊งหมวกกันน็อกจะมาป่วนงานด้วย… ถ้ามากันได้ป้าอุ่นใจขึ้นเยอะเลย"});
    G.chatIn=G.chatIn||{};for(const id of CANON_IDS){const f=G.F[id];if(f&&f.met&&(f.bond||0)>=8&&!G.chatIn[id])G.chatIn[id]=G.week;}
    save();AU.sfx("level");toast("ได้รับจดหมายเชิญอีเวนต์ลอยกระทง! ดูที่กล่องจดหมาย");}}
function evMailAct(m){const L=loyOf(G);if(!L)return "";const tr=loyTier(L.best,L.boss);const T=L.tiers||{};
  const ends=["bronze","silver","gold"].filter(k=>T[k]).map(k=>`<button class="btn sm" data-act="loyend" data-v="${k}">ฉากจบ${LOY_TIERS.find(x=>x[0]===k)[1]} · ${LOY_END[k].t}</button>`).join("");
  return `${L.runs?`<p class="meta center">คะแนนดีที่สุด <b class="goldt num">${L.best}</b>${tr?` · รางวัลระดับ<b>${tr.n}</b>`:""}</p>`:""}<button class="btn primary" data-act="evloy">${L.runs?"ท้าศึกริมน้ำอีกรอบ":"ไปงานลอยกระทง"}</button>
  ${L.runs?`<button class="btn" data-act="thief" ${L.thiefWk===absWeek(G)?"disabled":""}>${L.thiefWk===absWeek(G)?"ไล่จับโจรงมกระทงแล้ว (สัปดาห์หน้ามาอีก)":"ไล่จับโจรงมกระทง"}</button>`:""}
  ${L.intro?`<div class="evrep"><button class="btn sm" data-act="loyintro">ดูฉากเปิดอีกครั้ง</button>${ends}</div>`:""}
  ${T.gold?`<div class="evrep"><button class="btn sm" data-act="loydress" aria-pressed="${!!L.dressOn}">ชุดไทยนอกเวที: ${L.dressOn?"เปิด":"ปิด"}</button></div>`:""}`;}
function loyIntro(G){const S=[
  {n:"nar",bg:"river",t:"คืนวันเพ็ญเดือนสิบสอง ตลาดน้ำริมปิงคึกคักกว่าทุกปี เรือขายกระทงจอดเรียงริมตลิ่ง แสงเทียนสะท้อนน้ำวิบวับ"},
  {n:"npc",who:"ป้าแต๋ว",t:"มาแล้วเหรอผู้จัดการ! ป้าขนชุดไทยของลูกสาวป้ามาให้เด็ก ๆ ใส่เที่ยวงาน ไปเปลี่ยนเร็ว ๆ!"},
  {n:"nar",t:"สิบนาทีต่อมา"},
  {n:"kati",f:"flustered",l:"thai",t:"ผู้จัดการ… ชุดนี้รัดเอวจังเลยค่ะ หนูดูแปลกไหม …อย่ามองนานสิคะ!"}];
  if(inCamp(G,"mali"))S.push({n:"mali",f:"happy",l:"thai",t:"กะทิสวยจะตาย! มะลิช่วยกลัดสไบให้เองเลยนะ~ ส่วนของมะลิก็… สวยใช่ไหมคะ ผู้จัดการ"});
  if(inCamp(G,"rin"))S.push({n:"rin",f:"flustered",l:"thai",t:"ผ้าถุงจำกัดการก้าวขาเหลือราวสี่สิบเซนติเมตร ไม่เหมาะกับการต่อสู้ …แต่ก็ไม่ได้แย่"});
  S.push({n:"npc",who:"ป้าแต๋ว",t:"สวยกันทุกคนเลย! …แต่ดูนั่นสิ พวกหมวกกันน็อกมาอีกแล้ว"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",t:"ตลาดน้ำนี้ต้องจ่ายค่าที่ให้พวกเรา! ไม่จ่ายก็เก็บแผงกลับบ้านไปซะ ป้าส้มตำ!"},
  {n:"coach",t:"ใจเย็นก่อน อย่าเพิ่งมีเรื่อง… เดี๋ยวนะ พวกมันท้าให้ขึ้นเวทีชั่วคราวข้างท่าเรือแทนเหรอ"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",t:"ส่งมาสามคน ลูกน้องฉันเก้าคน สู้ไม่ยั้ง ไม่มีพัก ถ้าค่ายแกชนะ แก๊งเราไม่มาตลาดนี้อีก!"},
  {n:"kati",f:"happy",l:"thai",t:"รับคำท้าค่ะ! ป้าแต๋วบอกว่าผ้าถุงนี้ยืดได้ ใส่ต่อยก็ไม่ขาด! ผู้จัดการเลือกคนเลยค่ะ"});
  return S;}
const LOY_END={
 bronze:{t:"แก๊งหมวกถอยทัพ",steps:[{n:"nar",bg:"river",t:"ลูกน้องแก๊งหมวกถอยไปยืนออกันฝั่งตรงข้าม ยังไม่ยอมแพ้ แต่ก็ไม่กล้าเข้าใกล้แผงป้าแต๋วอีก"},
  {n:"npc",who:"ป้าแต๋ว",t:"เก่งมากลูก ๆ! ป้าขายกระทงได้อีกตั้งเยอะ เอาไปเลย ค่าขนมของทุกคน"},
  {n:"kati",f:"happy",l:"thai",t:"ปีหน้าพวกนั้นมาอีกแน่ค่ะ หนูจะซ้อมให้หนักกว่านี้!"},
  {n:"nar",t:"เสียงจี๊ด ๆ ดังมาจากใต้ท่าเรือ ลูกนากตัวเล็กติดเชือกกระทงอยู่ กะทิก้มลงแกะให้ทั้งที่ชายผ้าถุงเปียก"},
  {n:"kati",f:"flustered",l:"thai",t:"มันเดินตามหนูมาค่ะ ผู้จัดการ… ไม่ยอมไปเลย เลี้ยงที่ค่ายได้ไหมคะ ได้นะคะ"}]},
 silver:{t:"ทั้งตลาดเชียร์",steps:[{n:"nar",bg:"river",t:"คนทั้งตลาดน้ำมายืนล้อมเวทีชั่วคราว เสียงเชียร์ดังกลบเสียงพลุ"},
  {n:"coach",t:"ไม่เลวนี่หว่า… แต่ยังไม่ถึงตัวเสี่ยเลยนะเว้ย ปีนี้ยังมีเวลา"},
  {n:"npc",who:"ป้าแต๋ว",t:"ชุดไทยพวกนั้น ป้ายกให้เลย ใส่ไปไหนก็ได้ ป้าดีใจที่มันได้ใส่ไปทำเรื่องดี ๆ"},
  {n:"kati",f:"flustered",l:"thai",t:"ผู้จัดการคะ… ป้าแต๋วให้กระทงมาใบนึง ไปลอยด้วยกันไหมคะ …ใบเดียวค่ะ ป้าให้มาแค่ใบเดียว"}]},
 gold:{t:"หมวกทองลอยน้ำ",steps:[{n:"nar",bg:"river",t:"เสี่ยหมวกทองคำล้มลงบนท่าเรือ หมวกทองกลิ้งตกน้ำ ลอยไปพร้อมกระทงอีกร้อยใบ"},
  {n:"npc",who:"เสี่ยหมวกทองคำ",t:"หมวกข้า!! …ก็ได้ ๆ ตลาดน้ำนี้ข้าไม่มาอีกแล้ว ปีนี้นะ! ปีนี้!"},
  {n:"npc",who:"ป้าแต๋ว",t:"ป้าตัดชุดไทยเพิ่มให้ทุกคนแล้ว ใส่ไปเที่ยว ไปเดท ไปไหนก็ได้!"},
  {n:"kati",f:"flustered",l:"thai",t:"…ผู้จัดการ หนูใส่ชุดนี้ไปเดทได้ไหมคะ …ไม่ใช่เดท! ไปเที่ยว! ไปเที่ยวค่ะ!"},
  {n:"nar",t:"ชื่อค่ายศิริชัยถูกพูดถึงทั่วตลาดน้ำทั้งคืน และอีกหลายคืนหลังจากนั้น"}]}};
const LOY_THIEF={name:"ไอ้ตุ่ม โจรงมกระทง",
 line:{kati:"ขอคืนเดี๋ยวนี้ค่ะ! กระทงใบนั้นของยายบ้านข้าง ๆ หนู!",mali:"กระทงใบนั้นมะลิช่วยป้าพับนะคะ! เอาคืนมา!",rin:"ฉันนับไว้แล้ว นายเอาไปสิบเจ็ดใบ คืนมาให้ครบ",ploy:"ชุดนี้แพงนะ แต่ถ้าต้องลงไปงมเอง ฉันก็ไม่ลังเล",fah:"ฟ้าเห็นนายตั้งแต่ปีที่แล้ว! คราวนี้ไม่รอดแน่!"},
 pre:[{n:"nar",bg:"river",t:"ตูม! มีคนกระโดดลงน้ำ งมเหรียญจากกระทงของชาวบ้านใส่ถุงพลาสติกเต็มมือ"},
  {n:"npc",who:"ป้าแต๋ว",t:"ไอ้ตุ่มอีกแล้ว! งมเหรียญจากกระทงคนอื่นทุกปี ปีนี้หอบไปทั้งกระทงเลย!"},
  {n:"npc",who:"ไอ้ตุ่ม โจรงมกระทง",t:"กระทงลอยมาหาข้าเอง ข้าก็เก็บสิ! อยากได้คืนก็ขึ้นมาบนท่าเรือนี่!"}],
 win:[{n:"nar",bg:"river",t:"ไอ้ตุ่มตกน้ำดังตูม ถุงเหรียญลอยเท้งเต้ง ชาวบ้านช่วยกันเก็บไปคืนวัด"},
  {n:"npc",who:"ป้าแต๋ว",t:"เก่งมากลูก! ป้าแบ่งค่ากระทงคืนนี้ให้ เอาไปซื้อนมให้เด็ก ๆ ในค่าย"}],
 lose:[{n:"nar",bg:"river",t:"ไอ้ตุ่มหัวเราะแล้วกระโดดน้ำหนีพร้อมถุงเหรียญ… แต่ถุงขาดกลางน้ำ เหรียญจมหมด"},
  {n:"npc",who:"ไอ้ตุ่ม โจรงมกระทง",t:"เฮ้ย! เหรียญข้า!! …ปีหน้าเจอกันใหม่!"},{n:"npc",who:"ป้าแต๋ว",t:"ช่างมันลูก อย่างน้อยมันก็ไม่ได้อะไรไป"}]};
function evStartLoy(){const L=loyOf(G);if(!L)return;UI.modal=null;
  const open=()=>{L.run=null;L.pick=[];UI.modal={type:"gaunt"};render();};
  if(!L.intro){L.intro=1;save();playScene(loyIntro(G),open,{bg:"river",look:"thai"});}else open();}
function gauntPool(){const R=roster(G).filter(f=>!f.injury);return R.length?R:roster(G);}
// v1.82.4: the five riverside SR cards as a collection row — owned cards in colour, missing ones dark, with a "play again" nudge
function loyCardRow(after){const own=G.cards||{},got=LOY_CARDS.filter(k=>own[k]).length,left=LOY_CARDS.length-got;
  const row=LOY_CARDS.map(k=>{const C=CARDS[k],has=!!own[k];return `<div class="ccard pxc lk ${has?"":"lock"}" style="--rc:${CARD_R.SR.c}" title="${has?esc(C.t):"ยังไม่ได้"}">${cardArtHTML(C,true)}<small>${has?esc(G.F[C.c].name):"?"}</small></div>`;}).join("");
  const msg=!left?`<b class="goldt">เก็บการ์ด SR ชุดไทยครบ ${LOY_CARDS.length} ใบแล้ว!</b> เล่นต่อเพื่อทำคะแนนหรือดูฉากจบที่ยังไม่เห็นได้`
    :after?`<b>ยังขาดอีก ${left} ใบ</b> · ศึกนี้เล่นซ้ำได้ไม่จำกัด กด "ท้าอีกรอบ" เพื่อเก็บให้ครบ · ส่งสาวที่ยังไม่มีการ์ดลงชกก่อน จะได้การ์ดของเธอ`
    :`<b>การ์ด SR ชุดไทย ${got}/${LOY_CARDS.length}</b> · จบศึกระดับทองแดงได้ 1 ใบ เงิน 2 ใบ ทอง 3 ใบ · ส่งสาวคนไหนลงชกก่อน จะได้การ์ดของคนนั้นก่อน · เล่นซ้ำได้จนครบ`;
  return `<div class="lkrow"><div class="lkcards">${row}</div><p class="meta">🎴 ${msg}</p></div>`;}
function gauntHTML(){const L=loyOf(G);if(!L){UI.modal=null;return "";}const R=L.run;
  const head=`<h2>ศึกริมน้ำคืนลอยกระทง</h2><p class="meta">สามคน คนละสามไฟต์ติด พลังไม่ฟื้นเต็มระหว่างไฟต์ แพ้เมื่อไหร่คนถัดไปขึ้นแทน · ไฟต์สุดท้ายคือเสี่ยหมวกทองคำ</p>${!R?loyCardRow():""}`;
  const ladder=(cur)=>`<div class="gl">${LOY_LADDER.map((k,i)=>{const lg=R&&R.log[i];const st=lg?(lg.res==="W"?"ok":lg.res==="D"?"dr":"ng"):R&&i===cur?"now":"";
    return `<div class="glr ${st}"><canvas width="40" height="40" data-qsprite="${QK[k].sprite}"></canvas><span><b>${i+1}. ${esc(QK[k].name)}</b><small>${lg?lg.txt:R&&(R.done||i<cur)?"ข้าม (คนก่อนหน้าแพ้)":i===8?"บอส · 3 ยก":"2 ยก"}</small></span><i>${lg?(lg.res==="W"?"+"+lg.pts:lg.res==="D"?"+"+lg.pts:"✕"):""}</i></div>`;}).join("")}</div>`;
  if(!R){const pool=gauntPool(),P=L.pick||[];const need=Math.min(3,pool.length);
    return head+`<p><b>เลือกลำดับนักมวย</b> <small class="meta">(${P.length}/${need}) แตะเรียงคนขึ้นก่อน–หลัง</small></p><div class="gpick">${pool.map(f=>{const i=P.indexOf(f.id);
      return `<button class="gpk ${i>=0?"on":""}" data-act="gpick" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>Lv.${f.lvl} · ล้า ${Math.round(f.fatigue)}</small></span>${i>=0?`<i>${i+1}</i>`:""}</button>`;}).join("")}</div>
      ${pool.length<3?`<p class="meta">ค่ายมีนักมวยไม่ถึงสามคน คนที่มีจะได้ขึ้นซ้ำ (พลังเต็มทุกรอบที่ขึ้นใหม่)</p>`:""}
      <div class="center endbtns"><button class="btn primary" data-act="gstart" ${P.length<need?"disabled":""}>เริ่มศึก</button><button class="btn" data-act="closeModal">ไว้ก่อน</button></div>${ladder(-1)}`;}
  if(R.done){const tr=loyTier(R.score,R.boss);return head+`<div class="gres2"><p class="meta">คะแนนรวม</p><p class="gsc num">${R.score}</p>${tr?`<span class="pill gold">รางวัลระดับ${tr.n}</span>`:`<span class="pill">ยังไม่ถึงระดับรางวัล (ทองแดง ${LOY_TIERS[2][2]})</span>`}
    ${(R.got||[]).length?`<ul class="glist">${R.got.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}${loyCardRow(1)}<p class="meta">ดีที่สุด ${L.best} · ทอง ${LOY_TIERS[0][2]}+ และต้องล้มเสี่ยหมวกทองคำ</p></div>
    <div class="center endbtns">${R.newEnd?`<button class="btn gold" data-act="loyend" data-v="${R.newEnd}">ดูฉากจบ (ใหม่!)</button>`:""}<button class="btn primary" data-act="gretry">ท้าอีกรอบ</button><button class="btn" data-act="closeModal">กลับค่าย</button></div>${ladder(-1)}`;}
  const f=G.F[R.order[R.slot]];
  return head+`<div class="gnow"><p class="meta">คะแนน <b class="goldt num">${R.score}</b> · คนที่ ${R.slot+1}/3 · ไฟต์ที่ ${R.k+1}/9</p>
    <div class="gcur">${faceImg(f)}<span><b>${esc(f.name)}</b><small>พลัง ${Math.round(R.hp)} · แรง ${Math.round(R.sta)}</small><div class="meter"><i style="--v:${clamp(R.hp,0,100)}%;--bc:${R.hp>50?"var(--green)":R.hp>25?"var(--warn)":"var(--red)"}"></i></div></span></div></div>
    <div class="center endbtns"><button class="btn primary" data-act="gfight">ขึ้นชกไฟต์ที่ ${R.k+1}</button><button class="btn" data-act="gquit">ยอมจบศึก (เก็บคะแนนที่ได้)</button></div>${ladder(R.k)}`;}
function gauntNextSlot(R){R.slot++;R.j=0;R.k=R.slot*3;R.hp=100;R.sta=100;if(R.slot>=3||R.k>=9)gauntFinish(R);}
function gauntFinish(R){const L=loyOf(G);R.done=true;L.runs=(L.runs||0)+1;L.best=Math.max(L.best||0,R.score);if(R.boss)L.boss=1;R.got=[];
  const tr=loyTier(R.score,R.boss);const order=["bronze","silver","gold"];
  if(tr){for(const k of order.slice(0,order.indexOf(tr.k)+1))if(!L.tiers[k]){L.tiers[k]=1;R.newEnd=k;R.got.push(...loyReward(k));}const nC={bronze:1,silver:2,gold:3}[tr.k]||1;for(let i=0;i<nC;i++){const c=loyCardDrop(G,R.order);if(c)R.got.push(c);else break;}}
  for(let i=0;i<9;i++)delete G.F["q_evloy_"+i];save();}
function loyReward(k){const out=[];
  if(k==="bronze"){G.cash+=3000;out.push("เงินรางวัลจากป้าแต๋ว ฿3,000");if(typeof PETS!=="undefined"&&PETS.otter&&typeof adoptPet==="function"&&!hasPet(G,"otter")){adoptPet(G,"otter",null,"kati");UI.petName=G.pets.length-1;out.push("ลูกนากตัวน้อยตามกลับค่ายมาด้วย! (ตั้งชื่อได้เลย)");}}
  if(k==="silver"){G.cash+=5000;out.push("เงินรางวัล ฿5,000");out.push("ปลดล็อกชุดไทยในหน้าโปรไฟล์ตัวละคร");}
  if(k==="gold"){G.rep+=1.5;out.push("ชื่อเสียง +1.5");if(typeof loyGold==="function"){const c=loyGold(G);if(c)out.push(c);}}
  return out;}
function gauntAfter(){const L=loyOf(G),R=L&&L.run,F=LASTF;if(!R||!F){UI.modal={type:"gaunt"};render();return;}
  const r=F.result,res=r.win==="D"?"D":r.win==="A"?"W":"L",rds=R.k===8?3:2;let pts=0,txt="";
  if(res==="W"){if(R.k===8)G.goldHelmetWins=(G.goldHelmetWins||0)+1;pts=100+(/KO|น็อก/.test(r.type||"")?60:0)+Math.max(0,rds-F.round)*30+Math.round(Math.max(0,F.A.hp)*.6);txt=/KO|น็อก/.test(r.type||"")?`ชนะน็อก ยก ${F.round}`:"ชนะคะแนน";if(R.k===8)R.boss=1;}
  else if(res==="D"){pts=30;txt="เสมอ";}else txt=/KO|น็อก/.test(r.type||"")?`แพ้น็อก ยก ${F.round}`:"แพ้คะแนน";
  R.log[R.k]={res,pts,txt};R.score+=pts;
  if(res==="L")gauntNextSlot(R);
  else{R.hp=Math.min(100,Math.max(0,F.A.hp)+15);R.sta=Math.min(100,Math.max(0,F.A.sta)+20);R.j++;R.k++;if(R.j>=3)gauntNextSlot(R);else if(R.k>=9)gauntFinish(R);}
  save();UI.modal={type:"gaunt"};render();}
Object.assign(ACT,{
  goldrematch:()=>{if(!goldRematchReady(G))return;const f=roster(G).find(f=>!f.injury);if(!f){toast("นักมวยทุกคนบาดเจ็บ");return;}G.gangRematchAt=campWeekIndex(G)+4;save();startQuest({q:"gang",qk:"gang5",rematch:true},f.id,()=>{});},
  redeem:()=>{const el=document.getElementById("redeemcode");redeemCode(el&&el.value);if(el)el.value="";render();},
  evloy:()=>evStartLoy(),
  gpick:d=>{const L=loyOf(G);if(!L)return;L.pick=L.pick||[];const i=L.pick.indexOf(d.v);if(i>=0)L.pick.splice(i,1);else if(L.pick.length<Math.min(3,gauntPool().length))L.pick.push(d.v);render();},
  gstart:()=>{const L=loyOf(G);if(!L)return;const P=L.pick||[];if(!P.length)return;const order=[0,1,2].map(i=>P[i%P.length]);
    L.run={order,slot:0,j:0,k:0,hp:100,sta:100,score:0,log:[],boss:0};save();render();},
  gfight:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;const f=G.F[R.order[R.slot]];const qid=evGang(G,R.k,f);
    const bk={id:"bev"+R.k,a:f.id,b:qid,week:G.week,tier:"evloy",rounds:R.k===8?3:2,ev:1,carry:{hp:R.hp,sta:R.sta},bg:"bg_river.webp"};
    UI.modal=null;openFight2(bk,gauntAfter);},
  gquit:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;gauntFinish(R);render();},
  gretry:()=>{const L=loyOf(G);if(!L)return;L.run=null;L.pick=[];render();},
});

/* ===== v1.81: Loy Krathong round 2 — Thai-dress scenes, SR cards, the krathong thief, the otter, Thai dress off-stage ===== */
const LOY_CARDS=["lk_kati","lk_mali","lk_rin","lk_ploy","lk_fah"];
(()=>{
const LOY_HINT="อีเวนต์ลอยกระทง 2569 · ได้จากศึกริมน้ำ",LG_HINT="ตู้กาชาลอยกระทง · เปิดเฉพาะช่วงเทศกาล 18 พ.ย.–7 ธ.ค.";
const T=(n,f,t)=>({n,f,l:"thai",t}),N=t=>({n:"nar",t}),P=(who,t)=>({n:"npc",who,t});
Object.assign(CARDS,{
 lk_kati:{c:"kati",r:"SR",ev:1,t:"เด็กหลงในงานลอยกระทง",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
  N("เสียงพลุดังสลับเสียงเพลงลูกทุ่งจากเวทีรำวง เด็กชายตัวเล็กยืนร้องไห้ข้างแผงลูกชิ้น มือกำกระทงขนมปังที่แหลกไปครึ่งใบ"),
  T("kati","sad","ผู้จัดการคะ เด็กคนนั้นยืนอยู่ตรงนั้นมาสิบนาทีแล้ว ไม่มีใครเข้าไปถามเลย"),
  N("ยังไม่ทันได้ตอบ กะทิก็เดินแหวกคนไปนั่งยอง ๆ ตรงหน้าเด็กแล้ว ชายผ้าถุงลากพื้นไปครึ่งศอก"),
  T("kati","happy","ไม่ร้องนะ พี่ชื่อกะทิ ส่วนพี่ผู้ชายคนนั้นชื่อผู้จัดการ ใจดีมาก ๆ เลย เราจะช่วยหาแม่ให้นะ"),
  P("เด็กชาย","แม่บอกให้รอตรงนี้… แต่กระทงหนูโดนเหยียบ แม่ต้องโกรธแน่เลย"),
  {choice:[{t:"\"เดี๋ยวพี่ซื้อกระทงใบใหม่ให้\"",fx:G=>{G.cash-=40;add(G,"kati","bond",2);},then:[N("คุณซื้อกระทงใบตองจากแผงข้าง ๆ ให้ เด็กชายหยุดร้องทันทีเหมือนมีคนกดปุ่ม"),T("kati","flustered","…ผู้จัดการรู้ไหมคะ ปู่ก็เคยซื้อกระทงให้หนูแบบนี้ ตอนหนูหลงในงานวัดเหมือนกัน")]},
   {t:"\"ขี่คอพี่กะทิสิ จะได้เห็นแม่\"",fx:G=>add(G,"kati","bond",3),then:[N("กะทิยกเด็กขึ้นบ่าโดยไม่ลังเล ผ้าถุงต้องถกขึ้นนิดหน่อย แต่เจ้าตัวไม่สนใจเลย"),T("kati","happy","สูงไหม! มองหาแม่เลย ตาไวกว่านักมวยพี่ก็ได้นะ!")]}]},
  P("เด็กชาย","นั่นแม่! แม่ยืนอยู่ตรงเรือขายขนมครก!"),
  N("แม่ของเด็กวิ่งมาขอบคุณซ้ำ ๆ ก่อนจะยัดขนมครกใส่มือกะทิสองถุง"),
  P("เด็กชาย","พี่กะทิ… พี่ผู้ชายคนนั้นเป็นแฟนพี่เหรอ"),
  T("kati","flustered","ฮะ!? ไม่ใช่! เขาเป็นผู้จัดการ! …ยัง ไม่ใช่ …ไม่ใช่ค่ะ! ไปกับแม่ได้แล้ว!"),
  N("เด็กชายโบกมือลา ทิ้งกะทิหน้าแดงไว้กลางงาน ข้าง ๆ คุณ ขนมครกในมือยังอุ่นอยู่"),
  T("kati","flustered","…แบ่งกันคนละถุงนะคะ แล้วก็… ที่หนูพูดเมื่อกี้ อย่าเก็บไปคิดนะ หนูพูดผิดแค่คำเดียวเอง")]},
 lk_mali:{c:"mali",r:"SR",ev:1,t:"นางนพมาศจำเป็น",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
  N("ประกาศเรียกผู้เข้าประกวดนางนพมาศดังซ้ำเป็นรอบที่สาม หมายเลขเจ็ดไม่มาเพราะป่วยกะทันหัน"),
  N("ป้าแต๋วซึ่งนั่งเป็นกรรมการอยู่ หันมามองมะลิในชุดไทยสีฟ้า แล้วยิ้มแบบที่ทุกคนในตลาดรู้ว่าหนีไม่พ้น"),
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
 lk_rin:{c:"rin",r:"SR",ev:1,t:"ดวงสมพงศ์ริมท่าน้ำ",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lk_ploy:{c:"ploy",r:"SR",ev:1,t:"หนีงานพรีเซนเตอร์",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lk_fah:{c:"fah",r:"SR",ev:1,t:"ศึกโคมลอย",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lg_kati_r:{c:"kati",r:"R",lg:1,t:"ขนมครกลวกลิ้น",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_mali_n:{c:"mali",r:"N",lg:1,t:"กระทงขนมปังให้ปลา",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_rin_n:{c:"rin",r:"N",lg:1,t:"สถิติกระทงริมปิง",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("รินยืนกดเครื่องนับจำนวนที่ท่าเรือ กดทุกครั้งที่มีกระทงลอยผ่าน"),
  T("rin","happy","ชั่วโมงนี้ 1,284 ใบค่ะ เป็นกระทงโฟม 3% ลดลงจากปีที่แล้ว 9% ข้อมูลนี้ฉันจะส่งให้เทศบาล"),
  T("rin","flustered","…ผู้จัดการไม่ต้องทำหน้าแบบนั้นค่ะ ฉันก็ลอยกระทงเป็น แค่ลอยหลังจากนับเสร็จแล้ว"),
  N("ตีหนึ่ง รินลอยกระทงใบตองใบเล็กของเธอเป็นใบที่ 4,071 แล้วกดเครื่องนับเองด้วย")]},
 lg_rin_r:{c:"rin",r:"R",lg:1,t:"เซลฟี่ไม่เป็นท่า",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_ploy_n:{c:"ploy",r:"N",lg:1,t:"ป้ายโฆษณาชุดไทย",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("ป้ายโฆษณาเครื่องดื่มเกลือแร่ขนาดสามเมตรตั้งอยู่หน้างาน รูปพลอยในชุดไทยถือกระทงยิ้มกว้าง"),
  N("เจ้าตัวจริงยืนอยู่ใต้ป้าย สวมหมวกแก๊ปกับหน้ากากอนามัย"),
  T("ploy","flustered","อย่ามองป้ายนาน ๆ สิ …ถ่ายวันนั้นฉันง่วงมาก ยิ้มแบบนั้นต้องถ่ายใหม่สี่สิบรอบ"),
  T("ploy","happy","แต่ถ้าเธอจะถ่ายรูปกับป้ายเก็บไว้ ฉันก็ไม่ว่าอะไร ยิ้มสวยสุดในชีวิตแล้วล่ะ")]},
 lg_ploy_r:{c:"ploy",r:"R",lg:1,t:"กระทงใบเดียวเมื่อสิบปีก่อน",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("พลอยนั่งห้อยเท้าที่ปลายท่าเรือ มองกระทงลอยผ่านไปทีละใบ"),
  T("ploy","sad","ปีแรกที่ฉันเข้าค่ายพยัคฆ์ทอง อายุสิบสอง ทุกคนกลับบ้านไปลอยกระทงกับครอบครัว เหลือฉันคนเดียว"),
  T("ploy","sad","เถ้าแก่ให้เงินฉันห้าสิบบาทไปซื้อกระทง ฉันซื้อมาแล้วก็ไม่ได้ลอย นั่งถือไว้จนเทียนดับ"),
  {choice:[{t:"\"ปีนี้ไม่ได้อยู่คนเดียวแล้วนะ\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…รู้แล้ว ไม่ต้องพูดก็ได้ แต่พูดแล้วก็… ไม่เป็นไร")]},
   {t:"ยื่นเทียนสำรองให้หนึ่งเล่ม",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","เผื่อเทียนดับอีกเหรอ …เธอนี่เตรียมพร้อมเหมือนพี่เลี้ยงนักมวยจริง ๆ")]}]}]},
 lg_ploy_sr:{c:"ploy",r:"SR",lg:1,t:"คืนที่ไม่มีใครจำได้",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("พลอยใส่หน้ากากรูปแมวจากแผงของเล่น ผมรวบไว้ใต้หมวก ไม่มีใครในงานหันมามองเธอเลยสักคน"),
  T("ploy","happy","สามชั่วโมงแล้วไม่มีใครขอถ่ายรูปเลย ฉันไม่ได้เดินงานแบบนี้มาตั้งแต่เด็ก"),
  N("พลอยกินลูกชิ้นปิ้งสองไม้ ยิงปืนลูกโม่ได้ตุ๊กตาหมี และหัวเราะเสียงดังทุกครั้งที่คุณยิงพลาด"),
  {choice:[{t:"\"แมวตัวนี้ยิงแม่นกว่าแชมป์อีกนะ\"",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","ก็แชมป์เป็นคนใส่หน้ากากอยู่ไง")]},
   {t:"\"หน้ากากนี้เหมาะดี แต่ถอดก็สวยกว่า\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…ตอนนี้ดีใจที่ใส่หน้ากากอยู่ เพราะหน้าแดงไปหมดแล้ว")]}]},
  N("ก่อนแยกกัน พลอยยัดตุ๊กตาหมีใส่มือคุณ"),
  T("ploy","flustered","ฝากไว้ที่ค่ายเธอ ถ้าวันไหนฉันเหนื่อยกับการเป็นพลอยที่ทุกคนจำได้ ฉันจะไปเยี่ยมมัน …ไม่ได้ไปเยี่ยมเธอนะ")]},
 lg_fah_n:{c:"fah",r:"N",lg:1,t:"ประทัดลูกใหญ่",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("ฟ้าหอบประทัดมาเต็มถุงผ้า หน้าตาภูมิใจเหมือนเพิ่งชนะไฟต์"),
  T("fah","happy","ลูกนี้ใหญ่สุดในร้าน! ฟ้าจะจุดตรงนี้แหละ ให้ทั้งตลาดรู้ว่าฟ้ามาแล้ว!"),
  P("ป้าแต๋ว","อีหนูผมทอง! จุดตรงนี้ป้าจะตีให้ก้นลาย! ไปจุดฝั่งโน้น!"),
  T("fah","pout","…ครับป้า เอ๊ย ค่ะป้า ผู้จัดการ ช่วยถือถุงหน่อย ฟ้าจะย้ายไปฝั่งโน้นแบบเงียบ ๆ")]},
 lg_fah_r:{c:"fah",r:"R",lg:1,t:"พลุดอกใหญ่",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
function loyCardDrop(G,order){G.cards=G.cards||{};const left=LOY_CARDS.filter(k=>!G.cards[k]);if(!left.length)return null;
  const pref=(order||[]).map(id=>"lk_"+id).filter(k=>left.includes(k));const L=loyOf(G);const id=pref[0]||left[((L&&L.runs)||0)%left.length];
  G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};if(G.F[CARDS[id].c])add(G,CARDS[id].c,"bond",3);G.dust=(G.dust||0)+5;
  return `การ์ด SR ใหม่: "${CARDS[id].t}" (ดูได้ในอัลบั้ม)`;}
function loyGold(G){const L=loyOf(G);if(!L)return null;L.dressOn=1;return "ปลดล็อกชุดไทยนอกเวที: สาว ๆ ใส่ชุดไทยในฉากเที่ยวและเดท (เปิด/ปิดได้ในจดหมายของป้าแต๋ว)";}
const loyThaiLook=G=>!!(G&&G.ev&&G.ev.loy&&G.ev.loy.tiers&&G.ev.loy.tiers.silver);
function evThief(G,f){const K=QK.gang1,t=Math.max(6,ovr(f.a)+K.lvl-1.2),rng=mulberry32((G.seed^0x7a1)+absWeek(G)*17);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const id="q_evthief";
  const o=baseFighter(id,{name:LOY_THIEF.name,full:LOY_THIEF.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind="gang1";o.grp="gang";o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=70;G.F[id]=o;return id;}
function thiefHTML(){const pool=gauntPool();return `<h2>ไล่จับโจรงมกระทง</h2><p class="meta">ไฟต์ขำ ๆ 2 ยก ไม่บาดเจ็บ ไม่มีผลกับสถิติ · ชนะได้เงินค่ากระทงจากป้าแต๋ว · เล่นได้สัปดาห์ละครั้ง</p>
  <div class="gpick">${pool.map(f=>`<button class="gpk" data-act="thiefgo" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>Lv.${f.lvl} · ล้า ${Math.round(f.fatigue)}</small></span></button>`).join("")}</div>
  <div class="center endbtns"><button class="btn" data-act="closeModal">ไว้ก่อน</button></div>`;}
function thiefGo(fid){const L=loyOf(G);if(!L)return;const f=G.F[fid];if(!f)return;UI.modal=null;
  const pre=[...LOY_THIEF.pre,f.canon&&LOY_THIEF.line[fid]?{n:fid,f:"angry",l:"thai",t:LOY_THIEF.line[fid]}:{n:"nar",t:`${f.name}ก้าวขึ้นท่าเรือ ถกแขนเสื้อพร้อมลุย`}];
  playScene(pre,()=>{const qid=evThief(G,f);const bk={id:"bthief",a:fid,b:qid,week:G.week,tier:"evloy",rounds:2,ev:1,bg:"bg_river.webp"};
    openFight2(bk,()=>{const F=LASTF,win=F&&F.result&&F.result.win==="A";L.thiefWk=absWeek(G);delete G.F.q_evthief;
      if(win){const c=1200;G.cash+=c;G.rep+=.2;L.thiefN=(L.thiefN||0)+1;}save();
      playScene(win?[...LOY_THIEF.win,{n:"nar",t:`ได้ค่ากระทง ฿1,200 · ชื่อเสียง +0.2`}]:LOY_THIEF.lose,()=>{AU.startMusic("hub");UI.tab="home";save();render();},{bg:"river",look:"thai"});});},{bg:"river",look:"thai"});}
Object.assign(ACT,{
  loyintro:()=>{UI.modal=null;playScene(loyIntro(G),()=>{AU.startMusic("hub");render();},{bg:"river",look:"thai"});},
  loyend:d=>{const E=LOY_END[d.v];if(!E)return;const L=loyOf(G);if(L&&L.run&&L.run.newEnd===d.v)L.run.newEnd=null;UI.modal=null;
    playScene(E.steps,()=>{AU.startMusic("hub");if(L&&L.run&&L.run.done)UI.modal={type:"gaunt"};render();},{bg:"river",look:"thai"});},
  thief:()=>{const L=loyOf(G);if(!L||L.thiefWk===absWeek(G))return;UI.modal={type:"thief"};render();},
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
 g_mali_sr:{main:[{n:"mali",f:"flustered",l:"casual",t:"…ถ้าอ่านถึงตรงที่บอกว่าผู้จัดการใจดี ก็ช่างมันค่ะ อันนั้นเรื่องจริง"},cN("มะลิพับจดหมายใส่ซอง แต่ยังไม่ปิดผนึก"),{n:"mali",f:"sad",l:"casual",t:"มะลิเขียนถึงแม่ทุกเดือนค่ะ แต่ไม่เคยส่งเลยสักฉบับ กลัวแม่รู้ว่ามะลิยังชกมวยอยู่"},{n:"mali",f:"happy",l:"casual",t:"เดือนนี้อาจจะส่งก็ได้นะคะ ถ้าผู้จัดการช่วยเขียนท้ายจดหมายให้หน่อย~"}],lv2:[cN("สองสัปดาห์ต่อมา บุรุษไปรษณีย์มาส่งซองสีฟ้าที่ค่าย จ่าหน้าถึงมะลิ"),{n:"mali",f:"happy",l:"casual",t:"แม่ตอบมาค่ะ!! …แม่เขียนว่า 'ฝากขอบคุณผู้จัดการที่ดูแลลูกด้วยนะ'"},{n:"mali",f:"flustered",l:"casual",t:"ผู้จัดการไปเขียนอะไรต่อท้ายจดหมายมะลิคะ!? แม่ถามว่าเป็นแฟนมะลิหรือเปล่า!"}],lv3:[cN("เช้าวันอาทิตย์ หญิงวัยกลางคนในเสื้อลายดอกมะลิยืนหน้าประตูค่าย หิ้วปิ่นโตเถาใหญ่"),{n:"mali",f:"flustered",l:"casual",t:"แม่!? มาได้ยังไงคะ ไม่บอกกันก่อนเลย!"},cP("แม่ของมะลิ","ก็มาดูว่าลูกแม่อยู่ดีกินดีจริงไหม จดหมายเขียนว่าอ้วนขึ้น แม่ต้องมาเห็นกับตา"),cN("แม่ของมะลินั่งดูมะลิเตะเป้าอยู่ข้างเวทีทั้งบ่าย ไม่พูดอะไรเลยสักคำ"),cP("แม่ของมะลิ","ลูกเตะสวยกว่าพ่อมันอีก …แม่ไม่ห้ามแล้วนะ แต่ต้องกินข้าวให้ครบสามมื้อ"),{choice:[{t:"\"ผมจะดูแลมื้ออาหารให้ครบครับ\"",then:[{n:"mali",f:"happy",l:"casual",t:"แม่! ได้ยินไหม ผู้จัดการรับปากแล้ว~"}]},{t:"ชวนแม่ของมะลิกินข้าวด้วยกันทั้งค่าย",then:[cN("ปิ่นโตห้าชั้นหมดเกลี้ยงในสิบนาที ครูแดงขอสูตรแกงไว้สามอย่าง")]}]},{n:"mali",f:"happy",l:"casual",t:"วันนี้วันที่ดีที่สุดในปีของมะลิเลยค่ะ ดีกว่าวันที่ชนะอีก"}],lv3t:"แม่มาเยี่ยมค่าย"},
 g_rin_sr:{main:[cN("รินหยิบปากกาขึ้นมาอีกด้าม ขีดฆ่าเครื่องหมายคำถามหลัง X"),{n:"rin",f:"happy",l:"casual",t:"ฉันลองใส่ค่าตัวแปรทุกแบบแล้วค่ะ เงินเดือน ชื่อเสียง โอกาส ไม่มีค่าไหนทำให้สมการเท่ากันได้"},{n:"rin",f:"flustered",l:"casual",t:"เหลือค่าเดียวที่ยังไม่ได้ลอง และฉันไม่กล้าเขียนลงกระดาษ"}],lv2:[cN("วันต่อมา กระดาษแผ่นเดิมถูกแปะไว้บนไวท์บอร์ดในห้องดูเทป"),cN("บรรทัดสุดท้ายถูกแก้แล้ว 'X = ค่ายนี้' แต่คำว่า 'ค่ายนี้' เขียนทับคำอื่นที่ลบไม่หมด"),{n:"rin",f:"flustered",l:"casual",t:"…อย่าพยายามอ่านคำที่ลบไปนะคะ หมึกมันแค่ซึมเท่านั้นเอง"}],lv3:[cN("รินส่งตารางนัดหมายมาทางแชท หัวข้อเขียนว่า 'การทดลองภาคสนาม ครั้งที่ 1'"),{n:"rin",f:"happy",l:"casual",t:"สมมติฐานคือ ถ้าเราไปคาเฟ่เดิมด้วยกันห้าครั้ง ตัวแปร X จะมีค่าคงที่ ฉันต้องเก็บข้อมูลค่ะ"},cN("ครั้งที่หนึ่ง รินจดทุกอย่าง ครั้งที่สามจดน้อยลง ครั้งที่ห้าเธอลืมเปิดสมุดเลย"),{n:"rin",f:"flustered",l:"casual",t:"…ข้อมูลครั้งที่ห้าหายค่ะ ฉันมัวแต่ฟังคุณเล่าเรื่องจนลืมจด"},{choice:[{t:"\"งั้นต้องทดลองใหม่อีกห้าครั้ง\"",then:[{n:"rin",f:"happy",l:"casual",t:"เห็นด้วยค่ะ ตามหลักวิทยาศาสตร์ ผลต้องทำซ้ำได้"}]},{t:"\"แล้วผลการทดลองคืออะไร\"",then:[{n:"rin",f:"flustered",l:"casual",t:"สรุปผล X มีค่าคงที่ค่ะ และฉันจะไม่บอกว่ามีค่าเท่าไร"}]}]},{n:"rin",f:"happy",l:"casual",t:"บันทึกการทดลองครั้งที่หนึ่งถึงห้า ฉันเก็บไว้ในลิ้นชักที่ล็อกได้ค่ะ ข้อมูลลับ"}],lv3t:"ทดสอบสมมติฐาน"},
 g_ploy_sr:{main:[cN("พลอยรีบเก็บรูปเข้ากระเป๋า แต่ไม่ได้เดินหนีไปไหน"),{n:"ploy",f:"happy",l:"casual",t:"แม่เลิกมาดูฉันชกตั้งแต่ปีที่สอง บอกว่าใจไม่ไหว แต่ทุกไฟต์ แม่จะโทรมาถามว่าแพ้หรือชนะ"},{n:"ploy",f:"flustered",l:"casual",t:"เธอเป็นคนแรกที่ฉันเล่าเรื่องนี้ให้ฟังนะ อย่าเอาไปบอกใคร โดยเฉพาะฟ้า"}],lv2:[cN("ไฟต์ต่อมาของพลอย คุณเห็นผู้หญิงคนหนึ่งยืนอยู่หลังสุดของสนาม ใส่หมวกปีกกว้างปิดหน้า"),cN("พลอยชนะ แล้วหันไปโค้งให้หลังสนามก่อนจะโค้งให้กรรมการ"),{n:"ploy",f:"happy",l:"casual",t:"ฉันรู้นะ ว่าเธอเป็นคนส่งตั๋วไปให้แม่ …ไม่ต้องปฏิเสธ แม่บอกหมดแล้ว"}],lv3:[cN("พลอยนัดคุณที่ร้านถ่ายรูปเก่าแก่ในเมือง ร้านเดียวกับที่ถ่ายรูปใบนั้นเมื่อยี่สิบปีก่อน"),{n:"ploy",f:"happy",l:"casual",t:"แม่บอกว่าอยากได้รูปใหม่ไว้ข้างรูปเก่า ฉันเลยมา …แต่ไม่อยากถ่ายคนเดียว"},cP("ช่างภาพ","คุณผู้ชายยืนชิดอีกนิดครับ ใช่ ๆ คุณผู้หญิงยิ้มหน่อย ยิ้มแบบตอนชนะ"),{n:"ploy",f:"flustered",l:"casual",t:"ยิ้มแบบตอนชนะ ฉันไม่เคยยิ้มตอนชนะ… แบบนี้ได้ไหม"},{choice:[{t:"แอบทำหน้าตลกตอนกดชัตเตอร์",then:[cN("พลอยหลุดหัวเราะเต็มเสียง ช่างภาพกดได้ตรงจังหวะพอดี เป็นรูปที่พลอยยิ้มกว้างที่สุดที่เคยมี")]},{t:"ยืนนิ่ง ๆ ยิ้มตามปกติ",then:[cN("รูปออกมาเรียบร้อยสวยงาม พลอยมองอยู่นาน แล้วขอถ่ายเพิ่มอีกใบ ใบที่สองเธอเอียงหัวมาพิงไหล่คุณ")]}]},{n:"ploy",f:"happy",l:"casual",t:"กระเป๋าฉันมีรูปสองใบแล้ว ใบเก่าคือคนที่กลัวแทนฉัน ใบใหม่คือคนที่ยืนข้างฉัน"}],lv3t:"รูปใบที่สอง"},
 g_fah_sr:{main:[cN("ฟ้ายืนดูรุ้งจนมันจางหายไปหมด ถึงยอมหันกลับมา"),{n:"fah",f:"happy",l:"casual",t:"แม่ฟ้าชอบเต้นกลางฝน เปียกทั้งตัวแล้วหัวเราะ พ่อบอกว่าแม่บ้า ฟ้าว่าแม่เท่สุด"},{n:"fah",f:"pout",l:"casual",t:"ทุกวันนี้ฝนตกที ฟ้าก็อยากออกไปยืนกลางลาน แต่กลัวคนในค่ายว่าบ้าเหมือนกัน"}],lv2:[cN("บ่ายวันหนึ่งฝนตกหนัก ฟ้ามองออกไปที่ลานนิ่ง ๆ"),cN("คุณเดินออกไปยืนกลางฝนก่อน แล้วโบกมือเรียก"),{n:"fah",f:"happy",l:"casual",t:"นายบ้าไปแล้ว!! …รอฟ้าด้วย!!"},{n:"fah",f:"flustered",l:"casual",t:"หนาวชะมัด …แต่ฟ้าไม่เคยสนุกแบบนี้มานานแล้ว"}],lv3:[cN("ฝนแรกของหน้าฝน ทั้งค่ายศิริชัยออกมายืนกลางลานพร้อมกัน เพราะฟ้าลากทุกคนออกมาเอง"),{n:"fah",f:"happy",l:"casual",t:"กฎของฟ้า! ฝนแรกของปี ทุกคนต้องเต้น ห้ามหลบใต้หลังคา!"},{n:"coach",t:"พวกเอ็งเป็นหวัดกันหมดแน่ …เออ ข้าก็เต้นด้วยสักเพลง"},{choice:[{t:"เต้นท่าหุ่นยนต์ให้ฟ้าดู",then:[{n:"fah",f:"happy",l:"casual",t:"ฮ่า ๆ ๆ นายเต้นแย่ที่สุดในโลก! อีกรอบ! อีกรอบ!"}]},{t:"จับมือฟ้าหมุนรอบลาน",then:[{n:"fah",f:"flustered",l:"casual",t:"…นายหมุนเร็วไปแล้ว! …อย่าปล่อยนะ"}]}]},cN("ฝนหยุดตอนพลบค่ำ รุ้งพาดข้ามแม่น้ำอีกครั้ง ฟ้าไม่ได้ชี้ให้ใครดู เพราะทุกคนเห็นพร้อมกันแล้ว"),{n:"fah",f:"happy",l:"casual",t:"แม่… ฟ้าเจอคนที่ยอมบ้าไปกับฟ้าแล้วนะ"}],lv3t:"เต้นกลางฝน"},
 g_team_ssr:{main:[{n:"coach",t:"ฟิล์มม้วนนี้ ปู่ชัยซื้อไว้ตั้งแต่วันที่ค่ายเกือบปิด บอกว่าจะเก็บไว้ถ่ายรูปหมู่รุ่นที่พาค่ายกลับมาได้"},{n:"kati",f:"sad",l:"casual",t:"…ปู่รู้ด้วยเหรอคะว่าจะมีวันนี้"},{n:"coach",t:"แกไม่รู้หรอก แกแค่เชื่อ ซึ่งบางทีก็มากกว่ารู้"}],lv2:[cN("ฟิล์มกลับมาจากร้านล้างรูป ทุกคนมุงดูรูปที่ขยายใหญ่"),{n:"mali",f:"happy",l:"casual",t:"มะลิหลับตาค่ะ!! ทำไมไม่มีใครบอก!!"},{n:"rin",f:"happy",l:"casual",t:"ฉันนับแล้วค่ะ ในรูปนี้ทุกคนยิ้ม 100% ยกเว้นครูแดงที่ยิ้ม 60%"},{n:"coach",t:"ข้ายิ้มเต็มที่แล้วโว้ย หน้าข้ามันเป็นแบบนี้"}],lv3:[cN("ครบรอบหนึ่งปีของภาพหมู่ ครูแดงลากกลองแขกเก่าของปู่ชัยออกมากลางลาน"),{n:"coach",t:"สมัยปู่ชัย ทุกปีค่ายจะเตะกระสอบตามกลองพร้อมกันทั้งค่าย ใครหลุดจังหวะต้องล้างจานทั้งอาทิตย์"},{n:"kati",f:"happy",l:"casual",t:"หนูจำได้ค่ะ! หนูหลุดทุกปีเลย ล้างจานจนมือเปื่อย"},cN("ทุกคนยืนประจำกระสอบ แล้วไม้ตีกลองก็ถูกยัดใส่มือผู้จัดการ"),{n:"coach",t:"วันนี้ผู้จัดการตีกลอง ถ้าจังหวะเพี้ยน คนล้างจานคือผู้จัดการ"},{n:"kati",f:"happy",l:"casual",t:"ผู้จัดการ! จังหวะแรกเลยค่ะ! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"จังหวะเดียวกันทั้งค่าย",mg:"bag",mgt:"ตีกลองนำจังหวะให้ทั้งค่าย"},
 g_mali_ssr:{lv2:[cN("สองอาทิตย์ต่อมา กล่องพัสดุใบใหญ่จากอีสานมาถึงค่าย จ่าหน้าถึง 'ผู้จัดการ' ไม่ใช่ถึงมะลิ"),cN("ข้างในมีข้าวเหนียวเขี้ยวงู แจ่วบองหนึ่งกระปุก และจดหมายลายมือตัวโต ๆ"),cN("'ถึงผู้จัดการ แม่ให้น้องข้างบ้านเขียนให้ ฝากบอกมะลินอนเร็ว ๆ แล้วก็ ขอบใจที่ทำให้ลูกแม่หัวเราะทุกครั้งที่โทรมา'"),{n:"mali",f:"pout",l:"casual",t:"แม่ส่งของให้ผู้จัดการมากกว่าส่งให้หนูอีก! …หนูไม่น้อยใจหรอกค่ะ แค่นิดเดียว"}],lv3:[cN("หน้าบุญบั้งไฟ มะลิชวนคุณกลับไปหมู่บ้านอีกครั้ง คราวนี้แม่ตั้งร้านส้มตำในงานวัด"),cP("แม่มะลิ","ลูกค้ามาเต็มเลย! มะลิตำครกนั้น ผู้จัดการตำครกนี้ ไว ๆ เด้อ!"),{n:"mali",f:"happy",l:"casual",t:"ผู้จัดการตำเป็นไหมคะ ไม่เป็นก็ไม่เป็นไร ตำตามจังหวะกลองหมอลำหน้าเวทีเลยค่ะ"},{n:"mali",f:"happy",l:"casual",t:"พร้อมนะคะ! ครกแรก! (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"ร้านส้มตำของแม่มะลิ",mg:"somtam",mgt:"ช่วยแม่มะลิตำส้มตำในงานบุญ"},
 g_rin_ssr:{lv2:[cN("รินเขียนสมุดเล่มใหม่ทุกคืน แต่ไม่มีตัวเลขสักตัว"),{n:"rin",f:"happy",l:"casual",t:"เป็นบันทึกความรู้สึกค่ะ วันนี้กะทิหุงข้าวไหม้ มะลิหัวเราะจนสำลัก ครูแดงแอบให้อาหารแมว"},{n:"rin",f:"flustered",l:"casual",t:"หน้านี้ฉันเว้นว่างไว้ให้คุณเขียนค่ะ …เขียนอะไรก็ได้ ฉันจะไม่วิเคราะห์ สัญญา"},{n:"rin",f:"pout",l:"casual",t:"…วิเคราะห์นิดเดียว ลายมือคุณเอียงขวา แปลว่าเป็นคนมองโลกในแง่ดีค่ะ"}],lv3:[cN("รินมาหาคุณที่ห้องซ้อมพร้อมไม้ตีกลองสองอัน กับกระดาษหนึ่งแผ่นเขียนว่า 'การทดลองที่ 1: ห้ามมีแผน'"),{n:"rin",f:"happy",l:"train",t:"คุณตีกลองแบบสุ่ม ไม่ต้องบอกล่วงหน้า ฉันจะเตะตามสัญชาตญาณอย่างเดียว"},{n:"coach",t:"ยัยแว่นจะซ้อมแบบไม่มีแผน โลกจะแตกแล้วมั้ง"},{n:"rin",f:"flustered",l:"train",t:"ครูแดงเงียบค่ะ! …ฉันพร้อมแล้ว ทั้งที่ไม่รู้ว่าจะเจออะไร (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"การทดลองที่ไม่มีแผน",mg:"bag",mgt:"ตีกลองแบบสุ่มให้รินเตะตามสัญชาตญาณ"},
 g_ploy_ssr:{lv2:[cN("เช้าวันอาทิตย์ แม่ของพลอยมาที่ค่ายพร้อมปิ่นโตสามชั้น"),cP("แม่พลอย","ตอนเด็ก ๆ พลอยกลัวความมืด ต้องเปิดไฟนอนจนอายุสิบสอง ห้ามบอกใครนะคะ"),{n:"ploy",f:"flustered",l:"casual",t:"แม่!! …เธอห้ามจำ ลบออกจากหัวเดี๋ยวนี้"},{n:"ploy",f:"happy",l:"casual",t:"…ไว้แวะไปบ้านแม่บ้างนะ แม่เก็บรูปตอนฉันชนะไว้ทุกใบ อยากให้เธอดูใบที่มีเธออยู่ด้วย"}],lv3:[cN("พลอยพาคุณไปบ้านแม่ บนผนังมีรูปตั้งแต่ไฟต์แรก มุมห้องมีกระสอบทรายใบเล็กที่หนังแตกจนเห็นนุ่น"),{n:"ploy",f:"happy",l:"casual",t:"กระสอบใบแรกของฉันเอง ตอนเด็ก ๆ แม่จะนั่งตบมือให้จังหวะ ฉันตีเข่าตามเสียงตบมือของแม่"},cP("แม่พลอย","ตบมือไม่ไหวแล้วจ้ะ ข้อมือแม่แก่แล้ว ผู้จัดการตีกลองให้แทนได้ไหมคะ"),{n:"ploy",f:"flustered",l:"train",t:"…ไม่ได้ตีกระสอบใบนี้มายี่สิบปีแล้ว ช่วยให้จังหวะทีนะ (กดปุ่มมินิเกมในหน้าการ์ดได้เลย)"}],lv3t:"กระสอบใบแรกของพลอย",mg:"bag",mgt:"ให้จังหวะเข่าแบบที่แม่พลอยเคยตบมือ"},
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
 lg_ploy_r:{lv2:[{n:"nar",t:"คืนนั้น พลอยลอยกระทงของปีนี้ แล้วหยิบกระดาษพับเล็ก ๆ ใบหนึ่งวางลงไปในกระทงด้วย"},{n:"ploy",f:"sad",l:"thai",t:"ใบเสร็จห้าสิบบาทเมื่อสิบปีก่อน ฉันเก็บไว้ในกระเป๋าตลอด"},{n:"ploy",f:"happy",l:"thai",t:"ปล่อยมันไปสักที …กระทงใบนั้นได้ลอยแล้ว"}],lv3:[{n:"nar",t:"ปีถัดมา พลอยพาเด็กฝึกรุ่นใหม่ของพยัคฆ์ทองที่ไม่ได้กลับบ้านมางานลอยกระทงห้าคน"},{n:"ploy",f:"happy",l:"thai",t:"คนละห้าสิบบาท ซื้อกระทงที่ชอบ แล้วต้องลอยให้ได้ ห้ามถือไว้จนเทียนดับ"},{n:"nar",t:"เด็กห้าคนวิ่งกระจายไปทั่วร้าน พลอยเดินตามดูทีละคนเหมือนพี่สาวคนโต"},{choice:[{t:"\"พลอยเป็นพี่ที่ดีนะ\"",then:[{n:"ploy",f:"flustered",l:"thai",t:"…ฉันแค่ทำสิ่งที่อยากให้ใครทำให้ตอนสิบสอง"}]},{t:"ช่วยพลอยจุดเทียนให้เด็ก ๆ",then:[{n:"nar",t:"เทียนห้าเล่มติดพร้อมกัน เด็ก ๆ ตะโกนนับหนึ่งสองสามแล้วปล่อยกระทงพร้อมกัน"}]}]},{n:"ploy",f:"happy",l:"thai",t:"ปีหน้าจะพามาอีก …และจะพามาที่ค่ายเธอด้วย เด็ก ๆ ควรรู้ว่ามวยไม่ได้มีแค่ชนะ"}],lv3t:"ห้าสิบบาท"},
 lg_fah_n:{lv2:[{n:"nar",t:"ฝั่งโน้นของตลาดเงียบกว่า ฟ้าจุดประทัดลูกใหญ่ แล้ววิ่งมาหลบหลังคุณ"},{n:"nar",t:"ปุ้ง! เสียงดังจนนกบินทั้งต้น"},{n:"fah",f:"happy",l:"thai",t:"ฮ่า ๆ ๆ เห็นไหม! ทั้งตลาดรู้แล้วว่าฟ้ามา!"},{n:"fah",f:"flustered",l:"thai",t:"…แต่ฟ้าหลบหลังนายนะ ห้ามบอกใคร"}],lv3:[{n:"nar",t:"ปีถัดมา ป้าเจ้าของร้านประทัดเรียกฟ้าเข้ามาในร้าน"},{n:"npc",who:"ป้าร้านประทัด",t:"อีหนูผมทอง ปีนี้ป้ายกตำแหน่งคนจุดพลุเปิดงานให้ ปีที่แล้วเอ็งซื้อป้าเยอะที่สุด"},{n:"fah",f:"happy",l:"thai",t:"จริงเหรอป้า!! ฟ้าได้จุดพลุเปิดงาน!!"},{choice:[{t:"ถือไฟแช็กให้ฟ้า",then:[{n:"fah",f:"happy",l:"thai",t:"นายถือไฟ ฟ้าจุด ทีมเดียวกัน! …อย่าเพิ่งวิ่งหนีนะ!"}]},{t:"ยืนห่าง ๆ ปรบมือเชียร์",then:[{n:"fah",f:"pout",l:"thai",t:"ทำไมไปยืนไกลจัง! …มาใกล้ ๆ ฟ้าหน่อย ฟ้าไม่กลัว แต่อยากให้มาดู"}]}]},{n:"nar",t:"พลุดอกแรกของงานพุ่งขึ้นเหนือแม่น้ำ ฟ้าไม่สะดุ้งเลยสักนิด เพราะจับแขนคุณไว้ตั้งแต่ก่อนจุด"}],lv3t:"คนจุดพลุเปิดงาน"},
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
 b_fah:[{n:"nar",t:"ท้ายตลาด ฟ้าแจกลูกอมเม็ดสุดท้ายในตะกร้าให้คุณ"},{n:"fah",f:"happy",l:"casual",t:"เม็ดสุดท้ายเก็บไว้ให้นาย! แม่มดผมทองไม่ให้ใครง่าย ๆ นะ!"},{n:"fah",f:"flustered",l:"casual",t:"…วันเกิดปีหน้า นายแต่งเป็นแวมไพร์คู่กับฟ้านะ ห้ามปฏิเสธ"}],
 m_bag:[{n:"nar",t:"เพลงจบ ครูแดงเดินไปที่ลำโพงเก่า แล้วกดเล่นเพลงเดิมซ้ำอีกรอบ"},{n:"coach",t:"อีกรอบ คราวนี้ครูเตะด้วย …สามสิบปีแล้ว ครูต้องตามให้ทันสักครั้ง"},{n:"kati",f:"happy",l:"fight",t:"ครูแดงตามทันค่ะ!! ผู้จัดการดูสิ ครบทุกจังหวะเลย!"}],
 m_tam:[{n:"nar",t:"ป้าแต๋วเดินมาตบไหล่มะลิเบา ๆ"},{n:"npc",who:"ป้าแต๋ว",t:"ฝีมือแบบนี้ ถ้าเลิกชกมวยเมื่อไหร่ มาเปิดร้านข้าง ๆ ป้าเลย ป้าให้เช่าฟรี"},{n:"mali",f:"happy",l:"casual",t:"ไม่เลิกค่ะป้า! แต่ถ้าแก่แล้ว มะลิกับผู้จัดการจะมาเปิดร้านส้มตำคู่กัน~"}],
 m_live:[{n:"nar",t:"ไลฟ์ครั้งที่สอง คนดูเพิ่มเป็นสิบสองคน หนึ่งในนั้นคือป้าแต๋ว อีกคนคือลุงช่างเงิน"},{n:"kati",f:"happy",l:"casual",t:"คนดูเพิ่มขึ้นสี่เท่าค่ะ! รินบอกว่าเป็นการเติบโต 300%"},{n:"kati",f:"flustered",l:"casual",t:"…ครูแดงยังสั่งเสื้ออีกตัวด้วย ครูคะ ครูมีเสื้อค่ายสามตัวแล้วนะคะ"}],
};
Object.entries(CARD_LV3).forEach(([id,X])=>{const C=CARDS[id];if(!C)return;if(X.main&&!C.mainDone){C.steps=C.steps.concat(X.main);C.mainDone=1;}C.lv2=X.lv2;C.lv3=X.lv3;C.lv3t=X.lv3t;C.rev=Math.max(C.rev||0,1);});
Object.entries(CARD_MAIN3).forEach(([id,L])=>{const C=CARDS[id];if(!C||C.mainDone3)return;C.steps=C.steps.concat(L);C.mainDone3=1;C.rev=Math.max(C.rev||0,1);}); // end batch 3

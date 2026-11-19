// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"ภาคเหนือ",champ:"ใบบัว",nick:"ดอกบัวซ่อนหนามแห่งล้านนา",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"ภาคอีสาน",champ:"ทับทิม",nick:"ทับทิมเอกเซียนอีสาน",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"ภาคกลาง",champ:"อลิเซีย",nick:"เจ้าหญิงแห่งวงการมวยไทย",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"ภาคใต้",champ:"ชบา",nick:"หมัดพายุสยบคลื่น",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["ศอกวัดร่องขุ่น","elbow",{dmg:{elbow:.10}}],nan:["เข่าเรือแข่งน่าน","knee",{dmg:{knee:.10}}],uttaradit:["ศอกดาบหักพระยาพิชัย","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["ถีบม้าเหล็กลำปาง","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["เตะบัวแดงบาน","kick",{dmg:{kick:.10}}],khonkaen:["เข่าทอไหมขอนแก่น","knee",{dmg:{knee:.08},regen:.06}],buriram:["หมัดสายฟ้าพนมรุ้ง","punch",{dmg:{punch:.10}}],ubon:["ศอกเทียนพรรษา","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["หมัดลิงหลอกเจ้า","punch",{dmg:{punch:.08},evade:.01}],suphan:["เตะแม่ไม้สุพรรณ","kick",{dmg:{kick:.10}}],phetchaburi:["เข่าเขาวังเมืองเพชร","knee",{dmg:{knee:.10}}],chanthaburi:["หมัดเปลือกมังคุด","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["เตะนางนวลโฉบ","kick",{dmg:{kick:.08},evade:.01}],surat:["ศอกเปลือกหอยดอนสัก","elbow",{dmg:{elbow:.10}}],nakhonsi:["หมัดหนังตะลุง","punch",{dmg:{punch:.10}}],songkhla:["เตะนางเงือกสมิหลา","kick",{dmg:{kick:.08},regen:.06}]};
function rgDress(f){const P=f&&f.rg&&RG_PSP[f.rg];if(!P)return f;f.spl=[{w:P[1],def:P[0],npc:1,p:.45}];f.pfx=P[2];return f;}
/* v1.90 difficulty (18 Nov 2026, Man): every fighter gets a fair-but-hard bout — belts ~38% → 30%, a championship series ~18% → 10% —
   found by sparring her against the opponent at a few strengths (rgFit). The ladder below is the CEILING: past it the opponent stops
   growing, so a fighter beyond the stat ceiling of 20 (limit break) starts winning more. Ceiling values: */
/* (old note) difficulty ladder: opponent strength in stat points + ring craft.
   Tuned (18 Nov 2026, 200 bouts each) so a fully built Ploy (stats 20, Lv.23, full skills) wins belt 1 ~39% → belt 16 ~27% and a championship series 20% (cup 1) → 10% (cup 4).
   A casual build (stats 20, Lv.18) wins ~5% / ~0% — the limit break is meant to be the way past it. */
/* v1.90.17 (Man): no extra comeback odds on belts; a lost championship series keeps the small v1.90.14 nudge (+.03 a bout, twice) */
const RG_RETRY={bout:.03,sMax:2};
/* v1.90.21 (Man): one bar for everyone — opponent strength is fixed, not fitted to your fighter. It climbs with progress (later belts and champions have studied the tapes of earlier fights).
   Set from a "casual" fighter (stats 20, Lv.18, every skill she can learn, morale 70, no fight prep): the middle of the five heroines wins belts 48% → 32%,
   championship series 22% → 12%, the Naka members 45/40/35/30% and Ladda 20%. Morale, fight prep, the camp and limit-break growth all push past that */
const RG_FIX={belt:n=>22.25+.65*Math.min(15,n)/15,champ:(cups,tries)=>23.41+.1067*Math.min(3,cups)-.15*Math.min(2,tries||0),nl:{nia:24.21,varya:25.6,meili:24.37,rosa:25.91,ladda:24.0}}; /* v1.91.38 (Man): champions a little harder (+.3 → maxed series ~56→45%), the Naka members harder (+.5 → ~40%), Ladda a brutal final (+1.3 → ~18%) */ /* v1.91.13 (Man): set for a maxed fighter (Lv.32, every bonus, stat 20) — belts ~80% · series ~60% · Naka ~50% · Ladda ~40% */ /* v1.91.6: re-set after the heroine rebalance (v1.91.0–1.91.5), same targets, middle of the five home-line builds · v1.91.7: champions −0.35 after opponents got fixed styles */
/* v1.90.18 (Man): belts 40% every time, championship series 20% → 12% — the chapter in about 3 years for a fighter who never outgrows the fit */
const RG_ODDS={belt:n=>.40,series:cups=>.20-.08*Math.min(3,cups)/3,bout:s=>{let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;m*m*(3-2*m)<s?lo=m:hi=m;}return (lo+hi)/2;}};
/* the opponent strength (≤ ceil) at which `me` wins about `p` of 5-round bouts. setT(T) rebuilds the opponent at strength T. */
/* the fit sees the fighter's lasting strength only (stats, level, skills, gear, camp): morale, fatigue, injury and this week's fight prep are left out, so they swing the real bout (v1.90.19: prep was counted if done before booking) */
function rgFit(me,opp,setT,p,ceil,rounds){const M={...me,a:{...me.a},fatigue:0,injury:0,morale:70,prepBonus:0,counterPrep:0,labPrep:0,trainLog:[]},N=60;
  const win=T=>{setT(T);let w=0;for(let i=0;i<N;i++){const F=quickFight(M,opp,40417+i*131,rounds||5);if(F.result.win==="A")w++;else if(F.result.win==="D")w+=.5;}return w/N;};
  if(win(ceil)>=p)return ceil;let lo=Math.min(12,ceil-1),hi=ceil;for(let i=0;i<7;i++){const m=(lo+hi)/2;win(m)>p?lo=m:hi=m;}const T=(lo+hi)/2;setT(T);return T;}
const RG_LADDER={belt:n=>RG_LADDER.b0+n*RG_LADDER.bs,champ:(cups,tries)=>RG_LADDER.c0+cups*RG_LADDER.cs-Math.min(RG_RETRY.sMax,tries||0)*.15,b0:24.9,bs:.027,c0:24.8,cs:.15};
const RG_OPP={chiangrai:"แก้วกาญจน์ ส.แม่สาย",nan:"น้ำผึ้ง ลูกเมืองน่าน",uttaradit:"ทองดี ศิษย์ดาบหัก",lampang:"ม้าเหล็ก ลูกรถม้า",
 udon:"บัวแดง หนองหาน",khonkaen:"ไหมแก้ว ลูกชนบท",buriram:"สายฟ้า พนมรุ้ง",ubon:"เทียนทอง ริมโขง",
 lopburi:"จ๋อทอง ศ.พระปรางค์",suphan:"แม่ไม้ บางปลาม้า",phetchaburi:"หม้อแกง เมืองเพชร",chanthaburi:"มังคุด ลูกจันท์",
 chumphon:"นางนวล ปากน้ำ",surat:"นางรม ดอนสัก",nakhonsi:"ตะลุง ศ.เมืองคอน",songkhla:"สมิหลา ลูกสงขลา"};
/* v1.91.9: province champions lean to their region's style (Tha Sao elbows and speed · Korat heavy hands · Lopburi craft · Chaiya stance) — a lean, not a rule */
const RG_BSTY={north:{inside:3,footwork:3,counter:1,power:1,pressure:1},isan:{power:4,footwork:2,inside:1,pressure:1,counter:1},
 central:{counter:3,footwork:2,inside:2,power:1,pressure:1},south:{pressure:3,footwork:3,counter:1,power:1,inside:1}};
function rgBeltSty(r,id){const W=RG_BSTY[r],K=Object.keys(W),tot=K.reduce((a,k)=>a+W[k],0);let x=((stableHash(id+"|sty")>>>0)%1000)/1000*tot;for(const k of K){x-=W[k];if(x<0)return k;}return K[0];}
const RG_TRIP_GAP=2; /* v1.91.38 (Man): one trip every 2 weeks (was every week since v1.90.17) */
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */
const RG_CUP_PRIZE=50000;
const RG_TITLE={north:"ศึกชิงแชมป์ภาคเหนือ",isan:"ศึกชิงแชมป์ภาคอีสาน",central:"ศึกชิงแชมป์ภาคกลาง",south:"ศึกชิงแชมป์ภาคใต้"};
/* v1.90 round 3: each champion's series — perk, letters, lines before/after each bout, the cup ceremony and the private cup night.
   Draft dialogue (dialects to be checked: คำเมือง by Man, อีสาน/ใต้ by native speakers) — the full regional scripts come in rounds 6–9. */
const RG_CH={
 north:{ring:"north",venue:"เวทีวัดล้านนา เชียงใหม่",pair:"kati",nightBg:"doisuthep",
  perk:{name:"ดอกบัวซ่อนหนาม",desc:"สวนกลับบ่อยขึ้น 5% · ศอกแรงขึ้น 12%",fx:{ctr:.05,dmg:{elbow:.12}}},
  letter:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูใบบัวเจ้า ได้ข่าวว่าค่ายของผู้จัดการเก็บเข็มขัดครบทั้งสี่จังหวัดของภาคเหนือแล้ว ขอแสดงความยินดีด้วยเจ้า\n\nเวทีวัดล้านนาที่เชียงใหม่รออยู่เจ้า ศึกชิงแชมป์ชกสามนัด ใครชนะสองนัดก่อนได้ถ้วย หนูขอให้ผู้จัดการเลือกนักมวยคนเดียว ชกกับหนูให้จบทั้งสามนัดเน้อ\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nใบบัว · ค่ายบัวท่าเสา",
  again:"ผู้จัดการเจ้า\n\nหนูยังรออยู่ที่เชียงใหม่เน้อ ถ้าค่ายศิริชัยพร้อมเมื่อไหร่ ส่งนักมวยมาอีกได้เลยเจ้า คราวนี้จะเลือกคนเดิมหรือคนใหม่ก็ได้\n\nหนูก่จะซ้อมรอเหมือนกันเจ้า\n\nใบบัว",
  wait:"บ่เป็นหยังเจ้า หนูรอได้ ดูแลนักมวยให้ดีก่อนเน้อ — ใบบัว",
  pre:[n=>`${n}… ยินดีที่ได้ชกกันเจ้า หนูจะไม่ออมมือเน้อ ศอกของท่าเสาไม่เคยออมใคร`,n=>`นัดนี้หนูจะสวนให้หนักกว่าเดิมเจ้า ระวังศอกกลับหลังเน้อ`,n=>`นัดสุดท้ายแล้วเจ้า… "ไวกว่าลมท่าเสา" หนูจะชกให้สมคำนี้ หนูแบกชื่อค่ายบัวท่าเสามาทั้งหมด จะยอมแพ้บ่ได้`],
  sty:["inside","counter","footwork"], /* v1.91.9 (Man): each bout has its own style, hinted in the line before it */
  reply:"มาเลย ฉันเตรียมมาแล้ว",pairLine:"ท่าเสาเหมือนกัน… แต่วันนี้หนูขอเป็นฝ่ายชนะนะคะ",
  win:["ขอบคุณที่ชกด้วยกันเจ้า นัดหน้าหนูจะรอเน้อ","ยังบ่จบเน้อ หนูรู้แล้วว่าต้องแก้ตรงไหน","…"],
  lose:["เก่งแท้เจ้า หนูประมาทไปหน่อย นัดหน้าเจอกันเน้อ","ศอกหนูโดนอ่านขาดเลยเจ้า… นัดสุดท้ายหนูจะบ่ยอมง่าย ๆ","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"ถ้วยยังอยู่ที่เชียงใหม่เจ้า… แต่หนูสนุกแท้ที่ได้ชกกับค่ายศิริชัย"},{n:"baibua",f:"flustered",l:"fight",t:"ถ้าผู้จัดการพร้อมเมื่อไหร่ ส่งจดหมายมาบอกหนูเน้อ หนูจะรอเจ้า"},{n:"nar",t:"ใบบัวไหว้ทุกคนก่อนเดินลงเวที แล้วหันกลับมามองผู้จัดการอีกครั้งหนึ่ง"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคเหนือจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคเหนือ ศึกชิงเจ้าสี่ภาค ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"คุณเกริกขึ้นมามอบถ้วยทองกลางเวที โคมยี่เป็งลอยขึ้นฟ้าพร้อมกันหลายร้อยดวง"},
   {n:"baibua",f:"happy",l:"fight",t:"ยินดีด้วยเจ้า… ผู้จัดการ คืนนี้หนูมีที่หนึ่งอยากพาไป… ถ้าบ่ว่าอะไรเน้อ"},
   {n:"baibua",f:"flustered",l:"fight",t:"หนูมีเรื่องอยากบอกอยู่เรื่องหนึ่ง… เอ่อ บ่เป็นหยังเจ้า ไว้ก่อนก็ได้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ใบบัว")}]:[]),
   {n:"coach",t:"ถ้วยแรกของค่ายระดับภาค… ปู่ชัยต้องยิ้มอยู่แน่ ๆ"}];},
  night:(G,T)=>[
   {n:"nar",t:"ตีห้า ใบบัวมารอหน้าโรงแรมพร้อมรถมอเตอร์ไซค์คันเก่า ขึ้นดอยสุเทพไปตอนที่ฟ้ายังมืด"},
   {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นที่ประจำของหนูเจ้า ตอนพ่อยังสอนมวยได้ พ่อพามาดูหมอกทุกปีใหม่"},
   {n:"nar",t:"ลมหนาวพัดขึ้นมาจากหุบเขา ใบบัวคลี่ผ้าซิ่นตีนจกผืนเล็กออก แล้วแบ่งให้ผู้จัดการคลุมไหล่ครึ่งหนึ่ง"},
   {n:"baibua",f:"sad",l:"casual",t:"พ่อเจ็บเข่าเลิกสอนมาสองปีแล้วเจ้า เวกเตอร์มาขอซื้อค่าย บอกว่าจะจ่ายค่ารักษาพ่อให้ทั้งหมด"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูยังบ่ได้ตอบใคร… บ่กล้าบอกพ่อด้วย กลัวพ่อเสียใจที่ลูกสาวแบกค่ายไว้บ่ไหว"},
   {n:"nar",t:"ใบบัวเงียบไป ใต้หุบเขาไฟในเมืองเชียงใหม่ค่อย ๆ ดับทีละดวง",choice:[
     {t:"\"ค่ายเล็กก็ยืนได้ ค่ายเราเป็นตัวอย่างให้\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…ค่ายศิริชัยแท้ ๆ เจ้า ทุกคนช่วยกันหมด หนูอิจฉาเน้อ"}]},
     {t:"\"ไม่ต้องแบกคนเดียวก็ได้นะ\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…ผู้จัดการพูดแบบนี้ หนูก่บ่รู้จะเอาหน้าไว้ไหนแล้วเจ้า"}]}]},
   {n:"nar",t:"ดวงอาทิตย์โผล่พ้นทะเลหมอก ใบบัวพึมพำอะไรบางอย่างเบามาก"},
   {n:"baibua",f:"flustered",l:"casual",t:"…อ้าย"},
   {n:"baibua",f:"flustered",l:"casual",t:"เอ๊ะ! บ่ใช่เจ้า หนูบ่ได้พูดหยัง! ลงดอยกันเถอะเจ้า เดี๋ยวทุกคนตื่นมาหา"},
   {n:"nar",t:"ทางลงดอย ใบบัวขับช้ากว่าตอนขาขึ้นเกือบเท่าตัว"}]},
 isan:{ring:"northeast",venue:"เวทีปราสาทหินพิมาย นครราชสีมา",pair:"ploy",nightBg:"mekong",
  perk:{name:"เตะคุมระยะ",desc:"เตะแม่นขึ้น 4% · หลบได้ดีขึ้น 1%",fx:{hit:{kick:.04},evade:.01}},
  letter:"เถิง ผู้จัดการค่ายศิริชัย\n\nคักแท้! เก็บเข็มขัดอีสานครบสี่จังหวัดแล้วเด้อ ทับทิมรอเบิ่งมาตั้งแต่จังหวัดแรกแล้ว\n\nมาชิงถ้วยกันที่เวทีปราสาทหินพิมาย โคราชเด้อ ชกกันสามนัด ใครชนะสองนัดก่อนเอาถ้วยไป ส่งนักมวยมาคนเดียวชกให้จบเด้อ บ่ต้องเปลี่ยนตัวไปมา\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nทับทิม · ค่ายหมัดหนักพิมาย (แต่เตะเด้อ ฮ่า ๆ)",
  again:"ผู้จัดการเด้อ!\n\nถ้วยยังอยู่โคราชเด้อ ทับทิมบ่ได้ไปไส ถ้าพร้อมแล้วกะส่งนักมวยมาอีก คนเก่าคนใหม่กะได้\n\nบ่ต้องเกรงใจเด้อ มาเลย!\n\nทับทิม",
  wait:"บ่เป็นหยังเด้อ ทับทิมรอได้ ไผเจ็บกะพักก่อน — ทับทิม",
  pre:[n=>`${n}! มาเด้อ ทับทิมรอมาโดนแล้ว เตะโคราชบ่เคยมีไผเห็นมาก่อนดอก ฮ่า ๆ`,n=>`นัดนี้ทับทิมสิเอาจริงเด้อ ระวังเตะกระโดดเด้อ`,n=>`นัดสุดท้ายแล้ว… พ่อบ่เคยมาเบิ่งทับทิมชกจักเทื่อ มื้อนี้ทับทิมสิใช้หมัดหนักโคราชของบ้านเฮา ให้พ่อเห็นว่าทับทิมกะเป็นลูกหลานหมัดหนัก`],
  sty:["footwork","footwork","power"],
  reply:"ฉันก็ไม่ยอมเหมือนกัน",pairLine:"หมัดโคราชของคนที่จากบ้านมานาน จะยังเป็นของแท้ไหม ดูเอาเองแล้วกัน",
  win:["ฮ่า ๆ คักแท้ แต่ทับทิมได้นัดแรกเด้อ!","อีกนัดเดียวเด้อ ทับทิมสิเอาถ้วยไว้ที่โคราช","…"],
  lose:["โอ๊ย เจ็บหลาย! เก่งแท้เด้อ นัดหน้าทับทิมเอาคืน","ฮ่า ๆ…บ่ฮาแล้วเด้อ นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"ฮ่า ๆ ถ้วยยังอยู่โคราชเด้อ! แต่ค่ายศิริชัยแซบแท้ ทับทิมเจ็บทั้งตัวเลย"},{n:"tabtim",f:"flustered",l:"fight",t:"มาอีกเด้อ ทับทิมสิรอ… บ่ได้คิดฮอดดอก แค่อยากชกด้วยอีก"},{n:"nar",t:"ทับทิมโบกมือเสียงดังจนพิธีกรต้องเลื่อนไมค์หนี"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคอีสานจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคอีสาน ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ทับทิมวิ่งเข้ามากอดผู้จัดการกลางเวทีต่อหน้าคนทั้งงาน กอดแน่นจนคุณเกริกต้องยืนถือถ้วยรอ"},
   {n:"tabtim",f:"happy",l:"fight",t:"แพ้กะแพ้! แต่ขอกอดเอาคืนหน่อยเด้อ ฮ่า ๆ… อีกแป๊บเดียว"},
   {n:"nar",t:"ท้ายเวที ชายวัยกลางคนผิวคล้ำยืนนิ่งอยู่หลังคนดู พยักหน้าให้ทับทิมหนึ่งครั้ง แล้วเดินออกไป"},
   {n:"tabtim",f:"flustered",l:"fight",t:"…พ่อ? พ่อมาเบิ่งเด้…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ทับทิม")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นงานบุญบั้งไฟริมน้ำมูลยังไม่เลิก ทับทิมพาผู้จัดการเดินเลี่ยงคนออกมาที่ท่าน้ำ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ตรงนี้ทับทิมมานั่งตั้งแต่น้อย ๆ เบิ่งบั้งไฟขึ้นฟ้า แล้วคิดว่าสักมื้อสิเตะให้สูงเท่านั้น"},
   {n:"nar",t:"บั้งไฟลูกสุดท้ายพุ่งขึ้นฟ้า ทับทิมเงียบไปเป็นครั้งแรกตั้งแต่รู้จักกัน"},
   {n:"tabtim",f:"sad",l:"casual",t:"ทับทิมส่งเงินให้น้องสามคนเรียนเด้อ… แต่พ่อบ่เคยยอมรับว่าเตะกะเป็นมวยโคราชได้"},
   {n:"tabtim",f:"sad",l:"casual",t:"มื้อนี้พ่อมาเบิ่ง… ทับทิมแพ้ต่อหน้าพ่อ แต่เป็นครั้งแรกที่พ่อพยักหน้า",choice:[
     {t:"\"พ่อเห็นแล้วว่าเตะของเธอเป็นมวยโคราชจริง ๆ\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าพูดดี ๆ แบบนี้สิ ทับทิมสิฮ้องไห้แล้วเด้อ"}]},
     {t:"\"เธอเตะสูงกว่าบั้งไฟไปแล้วนะ\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ บ้าบอ! …แต่ขอบใจเด้อ"}]}]},
   {n:"nar",t:"ทับทิมเอนหัวพิงไหล่ผู้จัดการเงียบ ๆ จนควันบั้งไฟจางหายไปจากฟ้า"},
   {n:"tabtim",f:"flustered",l:"casual",t:"…บ่ต้องบอกไผเด้อว่าทับทิมเงียบได้ เสียชื่อหมด"}]},
 central:{ring:"central",venue:"เวทีริมน้ำ อยุธยา",pair:"rin",nightBg:"boat",
  perk:{name:"หมัดเจ้าหญิง",desc:"หมัดแรงขึ้น 12% · ป้องกันวงในดีขึ้น",fx:{dmg:{punch:.12},clDef:1}},
  letter:"Dear ผู้จัดการค่ายศิริชัย\n\nสี่เข็มขัดภาคกลางครบแล้วนะคะ ยินดีด้วย ฉันดูไลฟ์ทุกไฟต์ …ไม่ได้ตั้งใจดูหรอก มันขึ้นฟีดเอง\n\nศึกชิงแชมป์ที่เวทีริมน้ำอยุธยา 3 นัด ชนะ 2 ส่งนักมวยมาคนเดียวทั้งซีรีส์นะคะ ฉันไม่ชอบเปลี่ยนคู่กลางเรื่อง\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nอลิเซีย · ค่ายหนุมานลพบุรี",
  again:"ผู้จัดการคะ\n\nถ้วยยังอยู่กับฉันนะคะ แต่ยอดวิวคลิปไฟต์ของเรายังขึ้นอยู่เลย คนดูอยากเห็น rematch\n\nพร้อมเมื่อไหร่ก็ส่งนักมวยมา ฉันรอได้ …ไม่ได้รอเพราะคุณนะ\n\nอลิเซีย",
  wait:"ไม่เป็นไรค่ะ สุขภาพนักมวยสำคัญกว่าคอนเทนต์ — อลิเซีย",
  pre:[n=>`${n} สินะ ยินดีที่ได้รู้จัก กล้องจับอยู่นะคะ ชกให้สมกับที่ทุกคนดูอยู่`,n=>`นัดนี้ไม่มีโชว์แล้วนะ ฉันจะรอให้เธอเข้ามาก่อน แล้วสวนด้วยหมัดที่ซ้อมมาเพื่อเธอโดยเฉพาะ`,n=>`นัดตัดสิน… ฉันจะเข้าไปชกถึงตัวเธอเอง บอกไว้ก่อน ฉันไม่ได้ดังเพราะหน้าตา`],
  sty:["footwork","counter","inside"],
  reply:"ฉันมาชก ไม่ได้มาออกกล้อง",pairLine:"สถิติหมัดของคุณฉันอ่านมาหมดแล้วค่ะ ทุกเปอร์เซ็นต์",
  win:["ขอบคุณค่ะ คลิปนี้ยอดวิวคงพุ่ง… แต่นัดหน้าอย่าเพิ่งยอมแพ้นะ","อีกนัดเดียว ถ้วยจะอยู่ที่ลพบุรีต่อไป","…"],
  lose:["…โอเค ยอมรับค่ะ เธอเก่งจริง แต่อย่าเข้าใจผิด ฉันยังไม่จบ","ฉันจะไม่ตัดคลิปนี้ทิ้ง เก็บไว้ดูว่าพลาดตรงไหน นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"alicia",f:"happy",l:"fight",t:"ถ้วยยังเป็นของฉันค่ะ ขอบคุณที่ทำให้คอนเทนต์คืนนี้ดีที่สุดของปี"},{n:"alicia",f:"flustered",l:"fight",t:"…ไม่ใช่สิ ไม่ใช่เรื่องคอนเทนต์ ฉันอยากชกกับค่ายคุณอีกจริง ๆ"},{n:"nar",t:"อลิเซียปิดกล้องก่อนลงเวที ครั้งแรกของคืนนั้น"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.central.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคกลางจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคกลาง ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"แฟลชกล้องรุมเข้ามา คุณเกริกยิ้มให้กล้องขณะยื่นถ้วยให้ อลิเซียเดินฝ่าช่างภาพมาหยุดตรงหน้าผู้จัดการ"},
   {n:"alicia",f:"happy",l:"fight",t:"ยินดีด้วยค่ะ… แล้วก็ ฉันยังไม่ได้เซ็นกับใครนะ"},
   {n:"alicia",f:"flustered",l:"fight",t:"…เข้าใจไหม ไม่ต้องตอบตอนนี้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"อลิเซีย")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"ค่ำนั้นอลิเซียเช่าเรือลำเล็กลำหนึ่งไว้ ไม่มีทีมงาน ไม่มีช่างภาพ"},
   {n:"alicia",f:"happy",l:"casual",t:"ล่องรอบเกาะเมืองหนึ่งรอบ ไม่มีใครถ่าย ไม่มีใครไลฟ์ …ฉันจองไว้ตั้งแต่นัดแรก เผื่อแพ้จะได้มีที่ร้องไห้"},
   {n:"nar",t:"เรือผ่านวัดไชยวัฒนารามที่เปิดไฟสีทอง อลิเซียหยิบโทรศัพท์ขึ้นมา แล้วลบแอปไลฟ์ทิ้งต่อหน้าผู้จัดการ"},
   {n:"alicia",f:"sad",l:"casual",t:"คืนนี้ไม่ใช่คอนเทนต์ …ทุกคนคิดว่าฉันดังเพราะหน้าตา สปอนเซอร์ก็คิดแบบนั้น นาคาลีกส่งสัญญามาให้ฉันเป็นคนแรก"},
   {n:"alicia",f:"sad",l:"casual",t:"ฉันเกือบเซ็นแล้วนะ ถ้าไม่ได้เจอค่ายที่ชนะฉันได้โดยไม่ต้องมีกล้องสักตัว",choice:[
     {t:"\"เธอชนะมาด้วยหมัด ไม่ใช่หน้าตา\"",fx:G2=>{rgMeet(G2,"alicia",3);},then:[{n:"alicia",f:"happy",l:"casual",t:"…พูดซ้ำอีกทีได้ไหม ฉันไม่ได้อัดเสียงไว้"}]},
     {t:"\"คืนนี้ไม่มีกล้อง งั้นก็เป็นแค่อลิเซียไปเลย\"",fx:G2=>{rgMeet(G2,"alicia",4);},then:[{n:"alicia",f:"flustered",l:"casual",t:"…นั่นแหละที่ฉันกลัวที่สุด แต่ก็โอเค สำหรับคืนนี้"}]}]},
   {n:"nar",t:"หิ่งห้อยบินวนรอบหัวเรือ อลิเซียไม่พูดอะไรอีกเลยจนเรือเทียบท่า"},
   {n:"alicia",f:"flustered",l:"casual",t:"อย่าเข้าใจผิดนะ ฉันจะโหลดแอปกลับคืนพรุ่งนี้เช้า …อาจจะสาย ๆ หน่อย"}]},
 south:{ring:"south",venue:"เวทีเมืองเก่า ภูเก็ต",pair:"mali",nightBg:"andaman",
  perk:{name:"พายุสยบคลื่น",desc:"หลบได้ดีขึ้น 2% · ฟื้นแรงระหว่างยกเร็วขึ้น 12%",fx:{evade:.02,regen:.12}},
  letter:"ถึง ผู้จัดการค่ายศิริชัย\n\nเข็มขัดภาคใต้ครบสี่แล้ว\n\nมาภูเก็ต ชกสามนัด ชนะสองได้ถ้วย ส่งมาคนเดียว\n\nเลือกที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nชบา\n\nป.ล. ฝากบอกมะลิว่า…ไม่มีอะไร",
  again:"ผู้จัดการ\n\nถ้วยยังอยู่ภูเก็ต\n\nพร้อมเมื่อไหร่ก็มา\n\nชบา",
  wait:"รอได้ — ชบา",
  pre:[n=>`…${n} เข้ามาก่อนเลย`,n=>`นัดนี้ไม่หลบแล้ว`,n=>`นัดสุดท้าย "ท่าดีไชยา" จะให้ดู ม่ายมีใครถอย`],
  sty:["counter","pressure","footwork"],
  reply:"…ไม่ถอยเหมือนกัน",pairLine:"พี่ชบา… ครั้งนี้มะลิจะไม่ร้องไห้แล้วนะ",
  win:["…หรอย","อีกนัด","…"],
  lose:["…ดี","…นัดสุดท้าย","…"],
  lost:(G,J)=>[{n:"chaba",f:"happy",l:"fight",t:"…ถ้วยอยู่นี่"},{n:"chaba",f:"flustered",l:"fight",t:"มาอีกได้ …อยากให้มา"},{n:"nar",t:"ชบาพูดเท่านั้นแล้วเดินลงเวทีไป ทุกคนในค่ายหันมามองหน้ากัน"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.south.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคใต้จบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคใต้ ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ข้างเวที ชายหนุ่มนั่งรถเข็นปรบมือช้า ๆ ชบาเดินไปหาเขาก่อน แล้วถึงเดินกลับมาหาผู้จัดการ"},
   {n:"nar",t:"ชบาจับมือผู้จัดการแน่น ไม่พูดอะไร แล้วเดินจากไปเฉย ๆ ทั้งที่ยังไม่ปล่อยมือ จนต้องเดินตามไปสามก้าว"},
   {n:"chaba",f:"flustered",l:"fight",t:"…พี่ชาย อยากรู้จัก"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ชบา")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นชบาพาผู้จัดการขี่มอเตอร์ไซค์พ่วงข้างไปชายหาดที่ไม่มีนักท่องเที่ยว พระจันทร์เต็มดวงพอดี"},
   {n:"chaba",f:"happy",l:"casual",t:"…ที่นี่ ตอนเด็ก พี่ชายพามาซ้อมวิ่งในทราย"},
   {n:"chaba",f:"sad",l:"casual",t:"เรือคว่ำ พี่ขาเจ็บ ม่ายได้ชกอีก ชบาชกแทน แล้วนาคาเอาเรื่องพี่ไปทำโฆษณา ม่ายถามสักคำ"},
   {n:"nar",t:"ชบาโยนเปลือกหอยลงทะเลไกลมาก คลื่นซัดมันกลับมาที่เท้าทั้งคู่",choice:[
     {t:"\"พี่ชายเธอคงภูมิใจในตัวเธอมาก\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…พี่บอกแบบนั้นเหมือนกัน"}]},
     {t:"นั่งลงข้าง ๆ เงียบ ๆ",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"ชบานั่งลงตาม ไหล่ชนกันนิดหนึ่ง ไม่มีใครขยับหนี"}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม …ไซ"},
   {n:"nar",t:"ชบาหันหน้าไปทางทะเลทันทีที่พูดจบ แต่หูแดงจนเห็นได้ใต้แสงจันทร์"}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`ครูคะ… ${champ}ยืนใกล้ไปหรือเปล่า หนูแค่สังเกตเฉย ๆ ค่ะ`,mali:`มะลิก็อยากได้กอดบ้างนะ~ …ล้อเล่นค่ะ (ไม่ได้ล้อเล่น)`,
  rin:`ระยะห่างระหว่างผู้จัดการกับ${champ}เมื่อกี้ น้อยกว่าค่าเฉลี่ยของทั้งคืนค่ะ ข้อมูลเฉย ๆ`,ploy:`ยิ้มอะไรนักหนา …เปล่า ไม่ได้ว่าอะไร`,fah:`เฮ้! ${champ}! ผู้จัดการเป็นของค่ายศิริชัยนะ! …หมายถึงผู้จัดการค่ายน่ะ!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;if(v>0&&R.joined&&R.joined[cid]&&G.F[cid])add(G,cid,"bond",v);rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"ผู้จัดการเจ้า\n\nช่วงนี้เชียงใหม่หนาวแล้วเจ้า หมอกลงทุกเช้าเลย… หนูบ่ได้มีหยังจะเล่าหรอกเจ้า แค่คิดถึงค่ายศิริชัยนิดหน่อย\n\nอยู่เมืองเดียวกันแท้ ๆ ถ้าว่างก็แวะมาแอ่วค่ายหนูเน้อ\n— ใบบัว",
 isan:"พี่ผู้จัดการ!\n\nเงียบหายไปไสเด้อ ทับทิมเปิดไลฟ์ค่ายพี่ดูทุกมื้อ แต่บ่เห็นพี่ออกกล้องเลย\n\nคิดฮอดเด้อ (คิดฮอดค่ายเฉย ๆ บ่ได้คิดฮอดพี่ ฮ่า ๆ)\n— ทับทิม",
 central:"Hi,\n\nยอดวิวคลิปค่ายคุณตกลงนิดหน่อยนะ ฉันเช็กให้แล้ว ไม่ได้ตั้งใจดูหรอก แค่ผ่านตา\n\nมีอะไรคืบหน้าก็… บอกกันบ้างก็ได้\n— อลิเซีย",
 south:"…ช่วงนี้คลื่นแรง\n\nไม่มีอะไร\n\n— ชบา"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined"){for(const d of Object.keys(RG_OPP))BGIMG["rgring_"+d]=d==="chanthaburi"?"bg_region_east.webp":`bg_ring_${d}.webp`; /* v1.91.14: the belt ceremony stays in the province's own ring */
Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",hotel_room:"bg_hotel_room.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});}
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  baibua:[{img:"baibua_special",w:"elbow",def:"ศอกบัวบานกลับหลัง"}],tabtim:[{img:"tabtim_special",w:"kick",def:"เตะกระโดดทับทิมแดง"}],
  alicia:[{img:"alicia_special",w:"punch",def:"อัปเปอร์คัตเจ้าหญิง"}],chaba:[{img:"chaba_special",w:"punch",def:"หมัดพายุสยบคลื่น"}]});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"เตะกระสอบตามกลองแขก (ยาก)",target:[.74,.78,.82],unit:"ความแม่นยำ"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"ตำส้มตำ",target:[.76,.8,.84],unit:"ความแม่นยำ"},
 central:{game:"live",partner:"rin",label:"ไลฟ์ขายของ 30 วินาที",target:[9.7,11.75,13.8],unit:"ยอดขาย"},
 south:{game:"run",partner:"mali",label:"วิ่งแข่ง 100 เมตร",pace:[6.5,6.9,7.3],unit:"เวลา"}};
const DUEL_TALK={
 north:{intro:"ตีกลองแขกให้หนูนะเจ้า… หนูเตะตามจังหวะได้ทุกโน้ตเลยเน้อ",rw:"ลำขนาดเจ้า… ผู้จัดการเลือกนักมวยเก่งแท้",rl:"ขอโทษเจ้า หนูเผลอเอาจริงไปหน่อย",
  win:"หนูแพ้แล้วเจ้า… แต่สนุกที่สุดตั้งแต่ขึ้นชกมาเลย",lose:"หนูชนะเจ้า… ไว้มาแก้มือใหม่เน้อ หนูจะรอ"},
 isan:{intro:"ตำส้มตำแข่งกับคนอีสาน? คักแท้! ทับทิมบ่ยอมแพ้เรื่องนี้ดอกเด้อ",rw:"เฮ้ย! ตำแซบกว่าทับทิมได้จั่งได๋!",rl:"ฮ่า ๆ ส้มตำคือบ้านทับทิมเด้อ",
  win:"ฮ่า ๆ ๆ ทับทิมแพ้ค่ายศิริชัยเรื่องส้มตำ! อย่าบอกแม่เด้อ… ขอรางวัลปลอบใจได้บ่",lose:"ทับทิมชนะ! คืนนี้ทับทิมตำเลี้ยงทั้งค่ายเอง"},
 central:{intro:"ไลฟ์แข่งกันไหม คนละสามสิบวินาที ใครขายได้มากกว่าชนะ …ฉันไม่ออมมือให้หรอกนะ",rw:"…ยอดขายแพ้ค่ายเล็กได้ยังไงเนี่ย",rl:"มืออาชีพก็ต้องแบบนี้ค่ะ",
  win:"โอเค ยอมรับ ค่ายเธอรู้จักคนดูจริง ๆ …อย่าเข้าใจผิดนะ ไม่ได้ชม",lose:"ฉันชนะ แต่ไลฟ์ของพวกเธอน่าดูกว่าที่คิด"},
 south:{intro:"…วิ่ง ร้อยเมตร",rw:"…ไว",rl:"…",
  win:"…แพ้ …หรอย",lose:"…ยังไม่พอ มะลิ"}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"ใบบัวมาถึงค่ายแต่เช้า ถือตะกร้าข้าวต้มมัดมาฝากทั้งค่าย"},{n:"baibua",f:"happy",l:"casual",t:"หนูมาดูว่าค่ายที่ชนะหนูนัดแรกเป็นจะได เจ้า… ค่ายนี้ทุกคนช่วยกันหมดเลยเน้อ"},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"ท่าเสาเหมือนกัน มาซ้อมด้วยกันไหมคะ"},{n:"nar",t:"ทั้งเช้ากะทิกับใบบัวซ้อมศอกคู่กัน คนหนึ่งสวน อีกคนหลบ จนครูแดงต้องตะโกนเรียกพัก"}]:[]),
  {n:"nar",t:"ตอนเที่ยง ใบบัวนั่งดูทุกคนในค่ายช่วยกันยกหม้อข้าว ล้างนวม ตากผ้าพันมือ แล้วเงียบไปนาน"},
  {n:"baibua",f:"sad",l:"casual",t:"…ที่ค่ายหนู งานพวกนี้หนูทำคนเดียวทั้งหมดเลยเจ้า"},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"เสียงมอเตอร์ไซค์ดังมาตั้งแต่ปากซอย ทับทิมโบกมือก่อนจอดเสียอีก"},{n:"tabtim",f:"happy",l:"casual",t:"มาเยี่ยมเด้อ! ค่ายนี้แหละที่เตะทับทิมจนมึนนัดแรก ฮ่า ๆ"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"มาทำไมแต่เช้า …ไม่ได้ไล่นะ"},
   {n:"nar",t:"ทับทิมท้าพลอยต่อยกระสอบแข่งกันคนละร้อยหมัด แพ้ไปสิบเจ็ดหมัดแล้วหัวเราะลั่นค่าย"}]:[]),
  {n:"nar",t:"ตอนพักกินข้าว ทับทิมเล่าเรื่องตลกไม่หยุด จนพูดเรื่องหนึ่งหลุดออกมาแบบไม่ทันคิด"},
  {n:"tabtim",f:"sad",l:"casual",t:"…ที่บ้านทับทิมบ่เคยมีไผมาเบิ่งทับทิมชกเลยเด้อ จักเทื่อ ฮ่า ๆ… เอ้า ทำไมเงียบกันหมดล่ะ"},{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"รถตู้สีขาวจอดหน้าค่าย อลิเซียลงมาคนเดียว ใส่แว่นดำ หมวกแก๊ป"},{n:"alicia",f:"happy",l:"casual",t:"ทีมสปอนเซอร์ตามถ่ายฉันทั้งอาทิตย์ ขอหลบที่นี่สักวัน …ไม่ได้มาหาใครเป็นพิเศษหรอกนะ"},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"ยอดวิวคลิปไฟต์นัดแรกขึ้น 340% ค่ะ ฉันมีกราฟ"}]:[]),
  {n:"nar",t:"อลิเซียบอกว่ามาถ่ายคอนเทนต์ \"หนึ่งวันในค่ายเล็ก\" แต่ทั้งวันไม่ได้เปิดกล้องเลยสักครั้ง นั่งช่วยพับผ้าพันมือกับทุกคนจนเย็น"},
  {n:"alicia",f:"sad",l:"casual",t:"…ที่นี่ไม่มีใครขอให้ฉันยิ้ม แปลกดีนะคะ"},{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"ชบามาถึงค่ายโดยไม่บอกใคร ช่วยซ่อมรั้วหลังค่ายไปครึ่งแถวก่อนที่จะมีคนเห็น"},{n:"chaba",f:"happy",l:"casual",t:"…รั้วโยก"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มาทำไมไม่บอกมะลิ~ มะลิจะได้เตรียมขนม"}]:[]),
  {n:"nar",t:(G.pets||[]).length?"ตอนพักเที่ยง ทุกคนเห็นชบานั่งลูบสัตว์เลี้ยงของค่ายเงียบ ๆ จนมันหลับคาตัก ชบาไม่ยอมขยับขาเลยครึ่งชั่วโมง":"ตอนพักเที่ยง ทุกคนเห็นชบาแอบแบ่งข้าวให้นกกระจอกหน้าค่าย แล้วรีบทำหน้าเฉยตอนรู้ว่ามีคนเห็น"},
  {n:"chaba",f:"flustered",l:"casual",t:"…ม่ายได้ชอบ แค่มันมาเอง"},{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
const DUEL={st:null,
  el(){return document.getElementById("minibag");},
  open(r,practice,after){const C=DUEL_CFG[r],F=bagFighters(G).filter(f=>C.game!=="live"||f.canon);if(!F.length){toast("ไม่มีนักมวยที่พร้อมดวล");after&&after(null);return;}
    const pick=F.find(f=>f.id===C.partner)||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={r,cid:REGION.champId[r],id:pick.id,round:1,w:0,l:0,log:[],practice:!!practice,phase:"intro",after};
    BAG.st={phase:"duel",mode:C.game,id:pick.id,dk:C.dk||"normal",practice:true};BAG.mount();this.draw();},
  abort(){const S=this.st;this.st=null;if(S&&S.after&&S.phase!=="end")setTimeout(()=>S.after(null),0);},
  act(a,v){const S=this.st;if(!S)return;if(a==="pick"){S.id=v;this.draw();}else if(a==="go")this.startRound();else if(a==="next")this.next();
    else if(a==="end"){const after=S.after,res={w:S.w,l:S.l};this.st=null;BAG.close();after&&after(res);}},
  target(){const S=this.st,C=DUEL_CFG[S.r],i=S.round-1;return C.target?C.target[i]:null;},
  startRound(){const S=this.st,C=DUEL_CFG[S.r],cid=S.cid;
    if(C.game==="bag"||C.game==="somtam"){BAG.st={phase:"pick",mode:C.game,id:S.id,dk:C.dk,practice:true,duel:{bars:C.bars}};BAG.start();}
    else if(C.game==="live"){BAG.st={phase:"live",mode:"live",id:S.id,practice:true};LIVE.st={phase:"pick",host:S.id,item:"shirt",practice:true,duel:true};LIVE.start();}
    else if(C.game==="run"){BAG.st={phase:"run",mode:"run",practice:true};RUN.pick({id:S.id,duel:{opp:{id:cid,name:RG[S.r].champ,pace:C.pace[S.round-1]},label:`รอบ ${S.round}/3`}});RUN.set();}},
  /* one round finished: res.win (sprint) or res.score against the champion's mark */
  done(res,X){const S=this.st;if(!S)return;const C=DUEL_CFG[S.r],tg=this.target();
    const win=res.win!=null?res.win:res.score>=tg;S.log.push({win,score:res.score,tg});if(win)S.w++;else S.l++;
    if(LIVE.st&&LIVE.st.duel){LIVE.st=null;}
    if(C.game!=="run"){BAG.st={phase:"duel",mode:C.game,id:S.id,practice:true};S.phase="round";this.draw();}},
  next(){const S=this.st;if(!S)return;if(RUN.st){RUN.stop();RUN.st=null;}BAG.st={phase:"duel",mode:DUEL_CFG[S.r].game,id:S.id,practice:true};
    if(S.phase==="round"||DUEL_CFG[S.r].game==="run"){if(S.w>=2||S.l>=2){this.finish();return;}S.round++;S.phase="intro";this.draw();return;}this.draw();},
  finish(){const S=this.st,cid=S.cid,won=S.w>=2;S.phase="end";const out=[];
    if(!S.practice){rgMeet(G,cid,won?4:2);const du=won?5:2;G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
      const f=G.F[S.id];if(f){f.morale=Math.min(100,(f.morale||0)+(won?5:2));out.push(`${esc(f.name)} กำลังใจ +${won?5:2}`);}
      if(won){G.region.duelWon=G.region.duelWon||{};G.region.duelWon[cid]=(G.region.duelWon[cid]||0)+1;}}
    S.out=out;save();this.draw();AU.sfx&&AU.sfx(won?"level":"ui");},
  dots(){const S=this.st;return `<div class="duel-dots">${[0,1,2].map(i=>{const L=S.log[i];return L?(L.win?"🟢":"🔴"):"⚪";}).join("")}</div>`;},
  fmt(v){const C=DUEL_CFG[this.st.r];return C.game==="live"?Math.floor(v)+" ชิ้น":C.game==="run"?v.toFixed(2)+" วิ":Math.round(v*100)+"%";},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const C=DUEL_CFG[S.r],T=DUEL_TALK[S.r],champ=RG[S.r].champ,me=G.F[S.id];
    const vs=`<div class="duel-vs"><div><img src="${faceSrc(S.id,"happy")}" alt=""><br><b>${esc(me.name)}</b></div><b class="goldt">${S.w} : ${S.l}</b><div><img src="${faceSrc(S.cid,"happy")}" alt=""><br><b>${esc(champ)}</b></div></div>`;
    if(S.phase==="intro"){const F=bagFighters(G).filter(f=>C.game!=="live"||f.canon),tg=this.target();
      el.innerHTML=`<div class="mbox px"><h2>ดวลกับ${esc(champ)} · ${esc(C.label)}</h2>${this.dots()}${vs}
       <p class="meta center">รอบที่ ${S.round} จาก 3 · ชนะ 2 รอบก่อนชนะการดวล${tg!=null?` · ${esc(champ)}ทำไว้ ${this.fmt(tg)} (${C.unit})`:""}</p>
       ${S.round===1?`<b class="meta">ใครลงดวล</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-du="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>`:""}
       ${S.practice?`<p class="meta center">ดวลซ้อม · ไม่มีรางวัล</p>`:""}
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ยอมแพ้</button><button class="btn primary" data-du="go">เริ่มรอบ ${S.round} ▸</button></div></div>`;return;}
    if(S.phase==="round"){const L=S.log[S.log.length-1];
      el.innerHTML=`<div class="mbox px"><h2>${L.win?"ชนะรอบนี้!":"แพ้รอบนี้"}</h2>${this.dots()}${vs}
       <p class="center">${esc(me.name)} <b>${this.fmt(L.score)}</b> · ${esc(champ)} <b>${this.fmt(L.tg)}</b></p>
       <p class="center"><i>${esc(champ)}: "${esc(L.win?T.rw:T.rl)}"</i></p>
       <div class="mfoot roadbtns"><button class="btn primary" data-du="next">ต่อไป ▸</button></div></div>`;return;}
    if(S.phase==="end"){const won=S.w>=2;
      el.innerHTML=`<div class="mbox px"><h2>${won?`ชนะการดวล ${S.w}-${S.l}!`:`${esc(champ)}ชนะ ${S.l}-${S.w}`}</h2>${this.dots()}${vs}
       <p class="center"><i>${esc(champ)}: "${esc(won?T.win:T.lose)}"</i></p>${S.out&&S.out.length?`<p class="center"><span class="rwl">${S.out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span></p>`:""}
       <div class="mfoot roadbtns"><button class="btn primary" data-du="end">กลับค่าย</button></div></div>`;}}};

/* v1.90 round 5: the opening gala (the week after the invitation) and the story beat after the first cup — the green-gold contract */
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const RG_CID0={...RG_CID}; /* v1.91.30: the four first champions — fixed, even when a later edition crowns someone new */
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
const rgIf=(ok,steps)=>ok?steps:[];
function rgGala(G){const top=rgTopGirl(G),fah=rgIn(G,"fah"),ploy=rgIn(G,"ploy"),R=G.region,meet=(id,v)=>G2=>rgMeet(G2,id,v);return [
 {n:"nar",bg:"gala",t:"รถของค่ายจอดหน้าโรงแรมกลางกรุงเทพฯ ป้ายนาคาเอเนอร์จี้ดริงค์สูงเท่าตึกสามชั้น พญานาคสีเขียวทองขดตัวชูคออยู่กลางป้าย"},
 {n:"nar",t:"มาสคอตพญานาคตัวเท่าคนยืนโบกมืออยู่หน้าประตู ทุกครั้งที่มีแขกเดินผ่าน มันจะชกลมให้ดูสองที"},
 {n:"coach",t:"ครูใส่สูทครั้งล่าสุดตอนงานบวชหลานชาย… คอเสื้อมันรัดชะมัด"},
 ...rgIf(fah,[{n:"fah",f:"flustered",l:"casual",t:"ไหนบอกว่างานเลี้ยงไง! ทำไมทุกคนแต่งตัวเหมือนไปงานแต่งงาน ฟ้าใส่ชุดวอร์มมานะ!"}]),
 ...rgIf(fah&&rgIn(G,"kati"),[{n:"kati",f:"happy",l:"casual",t:"หนูบอกแล้วนะคะว่าบัตรเชิญเขียนว่า \"แต่งกายสุภาพ\"… ฟ้าตอบว่า \"ชุดวอร์มก็สุภาพ\""}]),
 {n:"nar",show:[],t:"ไฟในห้องบอลรูมหรี่ลง เสียงกลองยาวรัวขึ้น พิธีกรเดินออกมากลางเวที"},
 {n:"npc",who:"พิธีกร",t:"ขอต้อนรับทุกท่านสู่ศึกชิงเจ้าสี่ภาค ครั้งแรกของประเทศไทย! ขอเชิญประธานนาคาเอเนอร์จี้ดริงค์ อดีตความหวังเหรียญโอลิมปิกของชาติ… คุณเกริกครับ!"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"ชายในสูทเขียวเข้มปักลายนาคสีทองเดินขึ้นเวที ยิ้มกว้าง แล้วยกมือห้ามเสียงปรบมือเบา ๆ"},
 {n:"npc",who:"คุณเกริก",t:"เรื่องโอลิมปิกมันนานมาแล้วครับ วันนี้เป็นวันของน้อง ๆ นักมวย ไม่ใช่ของคนแก่ที่ชกไม่ได้แล้ว"},
 {n:"npc",who:"คุณเกริก",t:"กติกาง่าย ๆ ครับ ภาคละสี่จังหวัด เก็บเข็มขัดแชมป์ประจำจังหวัดให้ครบสี่เส้น แล้วจะได้สิทธิ์ท้าแชมป์ประจำภาค ชกสามนัด ชนะสองได้ถ้วย"},
 {n:"npc",who:"คุณเกริก",t:"ค่าเดินทางตอนเก็บเข็มขัด ค่ายจ่ายกันเองนะครับ ส่วนศึกชิงถ้วย นาคาเอเนอร์จี้ออกให้หมด… ดื่มนาคา ชกไม่มีหมด!"},
 {n:"nar",show:[],t:"เสียงหัวเราะดังทั่วห้อง สปอตไลต์สี่ดวงส่องลงมาบนเวที พิธีกรอ่านชื่อแชมป์ประจำภาคทีละคน"},
 {n:"npc",who:"พิธีกร",show:[{id:"baibua",l:"casual"}],t:"แชมป์ภาคเหนือ ดอกบัวซ่อนหนามแห่งล้านนา… ใบบัว!"},
 {n:"baibua",f:"happy",l:"casual",t:"สวัสดีเจ้า… หนูใบบัว มาจากค่ายบัวท่าเสา เชียงใหม่เจ้า"},
 {n:"nar",t:"เสียงเบาจนพิธีกรต้องยื่นไมค์เข้าไปใกล้ ๆ ใบบัวยิ้มหวาน"},
 {n:"baibua",f:"happy",l:"casual",t:"ศอกของหนูบ่ได้แรงหยังหรอกเจ้า… แค่คู่ชกมักจะลุกบ่ขึ้นเท่านั้นเอง"},
 {n:"npc",who:"พิธีกร",show:[{id:"tabtim",l:"casual"}],t:"แชมป์ภาคอีสาน ทับทิมเอกเซียนอีสาน… ทับทิม!"},
 {n:"tabtim",f:"happy",l:"casual",t:"สวัสดีพี่น้องทั้งห้องเด้อ! แอร์เย็นคักแท้ หนาวกว่าโคราชหน้าหนาวอีก ฮ่า ๆ ๆ"},
 {n:"nar",t:"ทับทิมหัวเราะลั่นจนทั้งห้องหัวเราะตาม แต่ระหว่างนั้นเธอแอบก้าวยาว ๆ วัดความกว้างของเวทีไปด้วย"},
 {n:"npc",who:"พิธีกร",show:[{id:"alicia",l:"casual"}],t:"แชมป์ภาคกลาง เจ้าหญิงแห่งวงการมวยไทย… อลิเซีย!"},
 {n:"nar",t:"แฟลชกล้องรัวจนห้องสว่างวาบ อลิเซียหันยิ้มให้กล้องทีละตัวแบบไม่พลาดสักตัว"},
 {n:"alicia",f:"happy",l:"casual",t:"ขอบคุณค่ะ Thank you, everyone. ปีนี้ฉันไม่ได้มาถ่ายรูปนะคะ ฉันมาเพื่อชนะ"},
 {n:"npc",who:"พิธีกร",show:[{id:"chaba",l:"casual"}],t:"และแชมป์ภาคใต้ หมัดพายุสยบคลื่น… ชบา!"},
 {n:"chaba",f:"happy",l:"casual",t:"…มาชก ไม่ได้มาแหลง"},
 {n:"nar",t:"ห้องเงียบไปสามวินาที แล้วพิธีกรก็รีบชวนทุกคนปรบมือ"},
 {n:"nar",t:"พอพิธีเปิดจบ แชมป์ทั้งสี่เดินลงจากเวที แล้วตรงมาที่โต๊ะของค่ายศิริชัย",choice:[
   {t:"ทักใบบัวก่อน",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการค่ายศิริชัยตัวจริงแท้ ๆ… หนูดูไลฟ์ไฟต์ค่ายนี้ทุกนัดเลยเจ้า"}]},
   {t:"ทักทับทิมก่อน",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"พี่ผู้จัดการ! ทับทิมจำหน้าได้ ไลฟ์ค่ายพี่ม่วนคักแท้เด้อ"}]},
   {t:"ทักอลิเซียก่อน",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh ค่ายที่ใคร ๆ ก็พูดถึง ตัวจริงดูธรรมดากว่าในคลิปนะคะ …ฉันชมนะ"}]},
   {t:"ทักชบาก่อน",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ชบา"},{n:"nar",t:"ชบาพยักหน้าครั้งเดียว แต่ยืนอยู่ตรงนั้นนานกว่าที่จำเป็น"}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"กะทิใช่ก่เจ้า ท่าเสาเหมือนกันเจ้า… หนูได้ยินชื่อมาตั้งนานแล้ว"},{n:"kati",f:"flustered",l:"casual",t:"ห-หนูก็ได้ยินชื่อพี่ใบบัวค่ะ! ศอกบัวบานกลับหลังที่ลือกันนั่น…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"อ้อ! นี่เองพลอยหมัดโคราช ลูกหลานบ้านเฮาที่ไปดังค่ายเชียงใหม่ ทับทิมอยากลองโดนสักหมัดเด้อ"},{n:"ploy",f:"happy",l:"casual",t:"…อยากลองก็ขึ้นเวทีมาสิ"}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"เธอคือคนที่อ่านสัญญาสิบสี่หน้าก่อนเซ็นใช่ไหม? คลิปนั้นยอดวิวเยอะกว่าคลิปไฟต์ฉันอีกนะ"},{n:"rin",f:"happy",l:"casual",t:"ก็ต้องอ่านสิคะ ตัวหนังสือเล็ก ๆ ท้ายสัญญามักเป็นส่วนที่แพงที่สุด"}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"พี่ชบา!! พี่ชบาใช่ไหมคะ! มะลิเองไง มะลิตัวเล็กที่ไชยา!"},{n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},
   {n:"nar",t:"ชบาหันหลังเดินไป แต่มะลิทันเห็นว่าหูของเธอแดงไปถึงต้นคอ"},{n:"mali",f:"sad",l:"casual",t:"…ไม่ผิดคนหรอก มะลิจำได้"}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"เดี๋ยวนะ! ใบบัวมีกะทิ ทับทิมมีพลอย อลิเซียมีริน ชบามีมะลิ… แล้วฟ้าล่ะ! ทำไมฟ้าไม่มีพี่น้องร่วมสายเลยสักคน!"},
   {n:"coach",t:"สายของฟ้ายังไม่มีชื่อ ก็ตั้งชื่อเองสิ"}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"แชมป์ทั้งสี่")}]:[]),
 {n:"npc",who:"พิธีกร",show:[],t:"และอีกหนึ่งข่าวใหญ่! นาคาเอเนอร์จี้ขอแนะนำค่ายรับเชิญพิเศษ ที่จะร่วมชกในทุกภาค… ค่ายเวกเตอร์ กรุงเทพฯ!"},
 {n:"nar",t:ploy?"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่พลอยนานกว่าคนอื่น":"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่โต๊ะค่ายศิริชัย"},
 {n:"pailin",f:"happy",t:"ข้อมูลของทุกค่ายในห้องนี้อยู่ในแท็บเล็ตของฉันหมดแล้วค่ะ …ขอให้สนุกกับการเดินทางนะคะ"},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"คุณเกริกเดินเข้าไปจับมือไพลิน ตบไหล่เบา ๆ สองที ท่าทางเหมือนคนที่รู้จักกันมานานกว่าที่ใครในห้องรู้"},
 {n:"nar",show:[],t:"ช่างภาพเรียกทุกค่ายขึ้นถ่ายรูปหมู่หน้าป้ายพญานาค"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"มุมห้องข้างคุณเกริก มีผู้หญิงใส่ฮู้ดสีขาวยืนนิ่งอยู่คนเดียว ปอยผมสีขาวปลายแดงโผล่ออกมาจากฮู้ด ไม่มีใครแนะนำเธอ"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"ข้อนิ้วของเธอพันเทปแบบนักสู้ MMA ไม่ใช่ผ้าพันมือแบบมวยไทย"},
 fah?{n:"fah",f:"flustered",l:"casual",t:"…ผู้จัดการ คนใส่ฮู้ดตรงนั้นมองฟ้าอยู่ ขนลุกไปทั้งตัวเลย"}:{n:"coach",t:"คนใส่ฮู้ดตรงนั้น… ยืนเหมือนคนที่พร้อมจะชกได้ตลอดเวลา"},
 {n:"nar",show:[],t:"แฟลชกล้องวาบขึ้น พอแสงจางลง มุมห้องตรงนั้นก็ว่างเปล่า"},
 {fx:G2=>{for(const r of RG_ORDER)rgTouch(G2,RG_CID[r]);}},{n:"coach",t:"เอาล่ะ กลับไปซ้อมกัน เข็มขัดสิบหกเส้นไม่ได้มาเพราะใส่สูทหล่อหรอก"}];}
/* the week after the first cup: the green-gold contract */
const RG_C1_CALL={
 north:["ผู้จัดการได้ซองเขียวเหมือนกันก่เจ้า… ข้อสิบสี่จุดสาม หนูก่สะดุดตรงนั้นเหมือนกัน","ตอนเวกเตอร์มาขอซื้อค่ายหนู สัญญาของเขาก่มีข้อแบบนี้ ตัวหนังสือเหมือนกันเปี๊ยบเลยเจ้า"],
 isan:["พี่ผู้จัดการ ได้ซองเขียวคือกันบ่! ทับทิมอ่านบ่จบดอก แต่น้องชายเรียนนิติฯ บอกว่าข้อสิบสี่มันแปลก ๆ","แล้วฮู้บ่ เวกเตอร์เคยส่งสัญญามาให้ทับทิมตอนต้นปี ข้อเดียวกันเป๊ะเลยเด้อ"],
 central:["ซองเขียวทองมาถึงหรือยังคะ? ผู้จัดการส่วนตัวของฉันบอกให้เซ็น แต่ฉันอ่านข้อ 14.3 แล้ว…","ฉันคุ้นประโยคนั้น เวกเตอร์ส่งข้อเสนอมาให้ฉันก่อนทัวร์ ใช้คำเดียวกันทุกตัวอักษรเลยค่ะ"],
 south:["…ซองเขียวมาแล้วใช่ไหม","เวกเตอร์ส่งสัญญามาให้ก่อนทัวร์ ข้อเดียวกัน คำเดียวกัน …ไม่ใช่เรื่องบังเอิญ"]};
function rgCup1(G,r){const cid=RG_CID[r],rin=rgIn(G,"rin"),R=G.region,L=RG_C1_CALL[r];return [
 {n:"nar",bg:"camp",t:"จดหมายปิดผนึกสีเขียวทองมาถึงค่าย ตราพญานาคประทับครั่งไว้กลางซอง"},
 {n:"nar",t:"\"สัญญาเจ้าของถ้วย ศึกชิงเจ้าสี่ภาค\" นาคาเอเนอร์จี้ขอให้ค่ายที่ได้ถ้วยเซ็นรับสิทธิ์ร่วมงานโปรโมต แนบสำเนาเช็คค่าตัวมาให้ดูก่อน ฿30,000"},
 {n:"coach",t:"สามหมื่นแค่ถ่ายโฆษณาเนี่ยนะ? เซ็นเลยสิ… ว่าแต่ตัวหนังสือมันเล็กชะมัด"},
 ...(rin?[{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวก่อนค่ะ ขอสิบห้านาที"},
   {n:"nar",t:"สิบห้านาทีกลายเป็นหนึ่งชั่วโมง รินอ่านครบทั้งยี่สิบสองหน้า ขีดปากกาแดงไปเจ็ดจุด"},
   {n:"rin",f:"sad",l:"casual",t:"หน้า 19 ข้อ 14.3 ค่ะ \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"rin",f:"sad",l:"casual",t:"ไม่มีกำหนดเวลา แปลว่าตลอดไปค่ะ แล้วก็ไม่ได้เขียนไว้เลยว่า \"บริษัทในเครือ\" คือใคร"},
   {n:"rin",f:"happy",l:"casual",t:"สามหมื่นแลกข้อมูลทุกไฟต์ของทุกคนในค่ายไปตลอดชีวิต… หารต่อไฟต์แล้วถูกกว่าค่ากาแฟอีกค่ะ"}]
  :[{n:"coach",t:"…เดี๋ยวนะ หน้า 19 ข้อ 14.3 \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"coach",t:"ไม่มีกำหนดเวลา… ครูอ่านหนังสือไม่เก่ง แต่คำนี้ครูรู้ว่าแปลว่าตลอดไป"}]),
 {n:"nar",t:`คืนนั้นโทรศัพท์ของค่ายดังขึ้น ปลายสายคือ${RG[r].champ}`},
 {n:cid,f:"sad",l:"casual",t:L[0]},{n:cid,f:"sad",l:"casual",t:L[1]},
 rin?{n:"rin",f:"sad",l:"casual",t:"สัญญาของเวกเตอร์กับของผู้จัดงาน ร่างมาจากคนคนเดียวกันค่ะ"}:{n:"coach",t:"สัญญาของเวกเตอร์กับของผู้จัดงานหน้าตาเหมือนกันเปี๊ยบ… ครูไม่ชอบกลิ่นมันเลย"},
 {n:"nar",t:"ซองเขียวทองวางอยู่บนโต๊ะทำงาน จะเอายังไงกับมันดี",choice:[
   {t:"ส่งกลับไป ขีดฆ่าข้อ 14.3 ทิ้ง",fx:()=>{R.c1="edit";},then:[
     rin?{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวรินเขียนหมายเหตุแนบไปให้ค่ะ สุภาพ แต่ชัดเจน"}:{n:"coach",t:"เอาปากกาแดงมา ครูขีดเอง"},
     {n:"nar",t:"สามวันต่อมา นาคาเอเนอร์จี้โทรมาขอบคุณ น้ำเสียงยังยิ้มเหมือนเดิม แต่ไม่มีใครพูดถึงเช็คอีกเลย"}]},
   {t:"เก็บไว้ก่อน ยังไม่เซ็นอะไรทั้งนั้น",fx:()=>{R.c1="hold";},then:[
     {n:"coach",t:"ดีแล้ว ของฟรีไม่มีในโลก ยิ่งของที่มีคนยิ้มให้ตลอดเวลายิ่งไม่ฟรี"}]}]},
 {n:"nar",t:"ซองเขียวทองถูกเก็บไว้ในลิ้นชักห้องทำงาน ข้าง ๆ สัญญาเงินกู้ของเสี่ยหมวกทองฉบับเก่า"}];}
/* v1.90 round 6: the North in full — the first arrival, the Tha Sao shrine at Uttaradit (Kati's story), a richer visit, the letter after the cup and Baibua's chats.
   คำเมือง lines are drafts for Man to check. The other regions follow in rounds 7–9 (same hooks). */
const RG_ARRIVE={
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgIn(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`รถของค่ายแวะเติมน้ำมันที่ปั๊มสุดท้ายก่อนเข้า${D.name} หมอกยังลอยต่ำอยู่เหนือภูเขา`},
  {n:"nar",t:"หน้าร้านกาแฟมีมอเตอร์ไซค์คันเก่าจอดรออยู่ ผู้หญิงผมชมพูยืนกอดตะกร้าหวายใบใหญ่ไว้แน่น"},
  {n:"baibua",f:"happy",l:"casual",t:"มาฮอดแล้วเจ้า! หนูได้ข่าวว่าค่ายศิริชัยจะมาเก็บเข็มขัดภาคเหนือ ก่เลยขี่รถมาดักรอเจ้า"},
  {n:"baibua",f:"happy",l:"casual",t:"ข้าวต้มมัดเจ้า หนูห่อเองตั้งแต่ตีสี่ มีพอหื้อทุกคนเน้อ"},
  {n:"nar",t:"ทุกคนได้ข้าวต้มมัดคนละห่อ มัดตอกเรียบร้อยเหมือนกันหมด ยกเว้นห่อของผู้จัดการที่ผูกตอกเป็นโบเล็ก ๆ",choice:[
    {t:"ถามว่าทำไมห่อนี้มีโบ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"บ่… บ่มีหยังเจ้า! มือมันผูกไปเองเจ้า… กิ๋นเถอะเจ้า ลำขนาดเลย"}]},
    {t:"ชมว่าห่อนี้สวยกว่าทุกห่อ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการตาไวแท้เจ้า… ห่อนั้นหนูตั้งใจที่สุดเจ้า"}]},
    {t:"ขอบคุณแล้วนั่งกินเงียบ ๆ",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"ลำบ่เจ้า? …ลำก่ดีแล้วเจ้า"}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"แล้วก่… ขอโทษเรื่องวันงานเปิดตัวเจ้า หนูอู้เสียงเบาไป พิธีกรต้องเอาไมค์มาจ่อปากเลย"},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"ไม่เป็นไรเลยค่ะพี่ใบบัว! เรื่องศอกนี่คนทั้งห้องได้ยินชัดแจ๋วเลย"},{n:"baibua",f:"flustered",l:"casual",t:"…อันนั้นหนูตั้งใจอู้ดังเจ้า"}]),
  {n:"baibua",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}คนนี้หนูเคยชกด้วยเจ้า เปิ้นออกตัวไว ยกแรกระวังหน่อยเน้อ พอยกสามเปิ้นจะเริ่มหมดแรงเจ้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จดคำแนะนำของใบบัวไว้ในมือถือ · กำลังใจ +3`:"ทุกคนจดคำแนะนำของใบบัวไว้"},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ใบบัว")}]:[]),
  {n:"coach",t:"ข้าวต้มมัดอร่อยกว่าร้านหน้าค่ายอีก… อย่าไปบอกป้าแดงนะ"},
  {n:"nar",t:"ใบบัวโบกมือส่งรถออกจากปั๊ม แล้วขี่มอเตอร์ไซค์ตามมาห่าง ๆ จนถึงสนามมวย"}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgIn(G,"kati");return [
  {n:"nar",t:"ก่อนกลับที่พัก ใบบัวพาทั้งค่ายแวะศาลครูมวยท่าเสา ศาลไม้เก่าใต้ต้นโพธิ์ มีนวมเก่าคู่หนึ่งแขวนอยู่ข้างหิ้ง"},
  {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นบ้านเกิดของมวยท่าเสาเจ้า พ่อหนูพามากราบครูทุกปี ก่อนพ่อจะเจ็บเข่า"},
  ...(kati?[
   {n:"nar",t:"กะทิยืนนิ่งอยู่หน้าศาลนานกว่าทุกคน แล้วค่อย ๆ ถอยออกมานั่งที่ขั้นบันได"},
   {n:"kati",f:"sad",l:"casual",t:"…หนูไม่แน่ใจว่าหนูมีสิทธิ์กราบตรงนี้ไหมคะ"},
   {n:"kati",f:"sad",l:"casual",t:"ท่าเสาของหนูเป็นครูพักลักจำค่ะ ปู่ชัยแอบดูครูท่าเสาชกตามงานวัด จำมาแล้วสอนหนู ไม่เคยมีใครครอบครูให้ปู่เลยสักครั้ง"},
   {n:"kati",f:"sad",l:"casual",t:"พี่ใบบัวเป็นท่าเสาสายตรง ตั้งแต่พ่อ ตั้งแต่ปู่ของพี่… ส่วนหนู หนูแค่ลอกท่าเขามา",choice:[
     {t:"\"ปู่ชัยดูจนจำได้ทุกท่า นั่นก็คือรักมวยท่าเสาแล้ว\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…ปู่จำได้ทุกท่าจริง ๆ ค่ะ ตอนเด็ก ๆ หนูเห็นปู่รำท่าเสาคนเดียวหลังค่ายทุกเย็น"}]},
     {t:"\"ลองถามพี่ใบบัวดูสิ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"ถามหนูได้เลยเจ้า"}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"กะทิ… รู้บ่ หนูอิจฉากะทิเน้อ"},
   {n:"kati",f:"surprised",l:"casual",t:"อิจฉาหนูเหรอคะ?!"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูได้ท่ามาจากพ่อก่จริง แต่ทุกวันนี้หนูแบกค่ายคนเดียว ซ้อมคนเดียว กิ๋นข้าวกับพ่อสองคน… บ่มีใผช่วยเลยเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"กะทิมีครูแดง มีผู้จัดการ มีเพื่อนทั้งค่ายคอยดู ท่าเสาของกะทิบ่ได้มาจากครูคนเดียว มันมาจากคนทั้งค่ายเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"มวยบ่ได้อยู่ในสายเลือดหรอกเจ้า มันอยู่ในคนที่ยังชกมันอยู่… มากราบครูด้วยกันเน้อ"},
   {n:"nar",t:"กะทิกับใบบัวคุกเข่าลงหน้าศาลพร้อมกัน กราบสามครั้ง ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ"},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…พี่ใบบัวคะ ปีหน้ามากราบครูด้วยกันอีกนะคะ"},
   {n:"baibua",f:"happy",l:"casual",t:"สัญญาเจ้า"},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"กะทิ กำลังใจ +5 · กะทิกับใบบัวสนิทกันขึ้น"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"ปีนี้หนูมาคนเดียวเจ้า… ขอบคุณที่มาเป็นเพื่อนเน้อ"},
   {n:"nar",t:"ผู้จัดการพนมมือไหว้ศาลครูตามใบบัว ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer to Vector, in a letter */
const RG_POST={
 north:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูตอบเวกเตอร์ไปแล้วเจ้า ว่าค่ายบัวท่าเสาบ่ขาย\n\nพ่อถามว่าเอาความกล้ามาจากไหน หนูตอบว่า \"ค่ายเล็กก็ยืนได้ ดูค่ายศิริชัยสิเจ้า\" พ่อหัวเราะครั้งแรกในรอบสองปีเลยเจ้า\n\nถ้วยอยู่กับค่ายศิริชัยแล้ว แต่ใจของมวยท่าเสายังอยู่ที่เชียงใหม่เน้อ ว่าง ๆ ขึ้นมาแอ่วหาหนูกับพ่อเจ้า\n\n— ใบบัว"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["เช้านี้หมอกลงหนาขนาดเลยเจ้า ผู้จัดการตื่นแล้วก่",[["ตื่นแล้ว กำลังจะไปดูเด็ก ๆ ซ้อม",1,"ขยันแท้เจ้า หนูก่กำลังจะไปซ้อมเหมือนกันเจ้า"],["ยังเลย นี่พิมพ์ทั้งที่หลับตาอยู่",2,"ฮิ ๆ หลับตาก็พิมพ์ถูกทุกตัวเลยเจ้า เก่งแท้"],["หมอกแบบนี้ขับรถระวังด้วยนะ",2,"…หนูจะระวังเจ้า ขอบคุณที่เป็นห่วงเน้อ"]]],
   ["พ่อให้หนูถามว่า ค่ายศิริชัยเปิดมากี่ปีแล้วเจ้า",[["ตั้งแต่รุ่นปู่ชัย สี่สิบกว่าปีแล้ว",1,"โอ้ พ่อบอกว่าเก่ากว่าค่ายบัวท่าเสาอีกเจ้า"],["เดี๋ยวพาไปดูรูปเก่าในค่ายนะ",2,"จริงก่เจ้า! หนูจะรอเน้อ"],["ถามทำไมเหรอ",0,"บ่มีหยังเจ้า พ่อแค่อยากรู้"]]],
   ["หนูต้องไปซ้อมแล้วเจ้า… คุยกันแค่นี้ก่อนเน้อ",[["ไปเถอะ ซ้อมเสร็จค่อยคุยต่อ",2,"เจ้า! ซ้อมเสร็จหนูทักไปเลยเน้อ"],["อย่าหักโหมนะ",1,"เจ้า หนูจะยืดเส้นก่อนทุกครั้ง"],["โอเค",0,"เจ้า"]]]]},
  {id:"bb_dad",x:[
   ["วันนี้พ่อลุกเดินรอบค่ายได้สองรอบเจ้า! หมอบอกว่าเข่าดีขึ้นแล้ว",[["ดีใจด้วยนะ!",1,"ขอบคุณเจ้า หนูดีใจจนน้ำตาไหลเลย"],["ฝากบอกพ่อว่าทั้งค่ายศิริชัยเชียร์อยู่",2,"หนูบอกแล้วเจ้า พ่อยิ้มแล้วบอกว่าค่ายนั้นใจ๋ดีแท้"],["อย่าให้พ่อหักโหมนะ",1,"เจ้า หนูคอยเดินตามอยู่ข้าง ๆ ตลอดเลย"]]],
   ["พ่ออยากหื้อหนูกลับไปเรียนต่อ บ่อยากหื้อชกมวยแล้ว… ผู้จัดการคิดว่าจะได",[["ถามใจตัวเองก่อนว่าอยากทำอะไร",2,"…ใจหนูอยากชกเจ้า หนูรู้อยู่แล้ว แค่อยากได้ยินคนพูด"],["เรียนไปด้วยชกไปด้วยก็ได้นะ",1,"ทำได้แท้ก่เจ้า… หนูจะลองคิดดูเน้อ"],["พ่อพูดถูกนะ",0,"…เจ้า หนูจะลองคิดดู"]]],
   ["ขอบคุณที่ฟังเน้อเจ้า หนูบ่ค่อยมีใผหื้อเล่าเรื่องนี้",[["เล่าได้ทุกเรื่องเลย",2,"…หนูจะเล่าบ่อย ๆ เลยเน้อ ห้ามรำคาญ"],["ยินดีเสมอ",1,"เจ้า ขอบคุณเจ้า"],["ไม่เป็นไร",0,"เจ้า"]]]]},
  {id:"bb_food",x:[
   ["หนูทำแกงฮังเลหม้อใหญ่เจ้า กิ๋นกับพ่อสองคนบ่หมด",[["ส่งมาค่ายบ้างสิ",2,"ได้เจ้า! เดี๋ยวหนูส่งไปรษณีย์… แกงส่งไปรษณีย์ได้ก่เจ้า"],["น่ากินจัง",1,"ลำขนาดเลยเจ้า สูตรแม่หนูเน้อ"],["แช่ตู้เย็นไว้สิ",0,"เจ้า หนูก่ว่าจะแช่ไว้"]]],
   ["ผู้จัดการชอบกิ๋นอะหยังที่สุดเจ้า",[["ข้าวต้มมัดของใบบัว",2,"…ผู้จัดการพูดแบบนี้ หนูจะห่อหื้อทุกอาทิตย์เลยเจ้า"],["ข้าวมันไก่หน้าตลาด",1,"ร้านที่กะทิชอบใช่ก่เจ้า หนูจะไปลองบ้าง"],["อะไรก็ได้",0,"กิ๋นได้ทุกอย่างก่ดีเจ้า"]]],
   ["อยู่เชียงใหม่เหมือนกันแท้ ๆ ผู้จัดการยังบ่เคยกิ๋นข้าวซอยร้านลับของหนูเลย วันหลังหนูพาไปเน้อ",[["สัญญานะ",2,"สัญญาเจ้า! ร้านนี้หนูบ่เคยพาใผไปเลย"],["พาทั้งค่ายไปเลย",1,"ได้เจ้า แต่ร้านเปิ้นมีโต๊ะแค่สองตัวเจ้า ฮิ ๆ"],["ถ้าว่างนะ",0,"เจ้า ถ้าว่างเน้อ"]]]]},
  {id:"bb_elbow",x:[
   ["วันนี้หนูซ้อมศอกบัวบานกลับหลังร้อยรอบเจ้า แขนจะหลุดแล้ว",[["เก่งมาก แต่พักบ้างนะ",2,"เจ้า… มีคนบอกหื้อพัก หนูก่จะพักเจ้า"],["สอนกะทิบ้างได้ไหม",1,"ได้เจ้า! แต่กะทิต้องสอนท่าของกะทิหื้อหนูด้วยเน้อ"],["ร้อยรอบน้อยไปนะ",0,"…ผู้จัดการโหดกว่าครูหนูอีกเจ้า"]]],
   ["ผู้จัดการรู้บ่ ศอกท่านี้พ่อคิดขึ้นตอนเห็นดอกบัวบานในสระวัด",[["สวยแบบมวยท่าเสาเลย",2,"เจ้า… มวยของพ่อสวยแต๊ ๆ หนูอยากหื้อคนทั้งประเทศได้เห็น"],["ดอกบัวมีหนามด้วยเหรอ",1,"บ่มีเจ้า! คนอื่นเปิ้นเรียกหนูเอง หนูบ่ได้ตั้ง ฮิ ๆ"],["ดอกบัวก็ดี",0,"เจ้า"]]],
   ["ถ้าวันหนึ่งหนูเจอกะทิบนเวที ผู้จัดการจะเชียร์ใผเจ้า",[["เชียร์ใบบัวแบบเงียบ ๆ",2,"…ห้ามบอกกะทิเน้อเจ้า หนูก่จะเชียร์ผู้จัดการเงียบ ๆ เหมือนกัน"],["เชียร์ทั้งคู่",1,"ตอบเก่งแท้เจ้า… หนูก่จะเชียร์กะทิเหมือนกันเน้อ"],["เชียร์กะทิสิ",0,"ฮิ ๆ ก่ถูกแล้วเจ้า"]]]]},
  {id:"bb_vector",x:[
   ["เวกเตอร์ส่งจดหมายมาอีกแล้วเจ้า ขึ้นราคาค่ายหื้ออีกสองแสน",[["อย่าเพิ่งตัดสินใจคนเดียวนะ",2,"…เจ้า หนูจะปรึกษาผู้จัดการก่อนทุกครั้งเลยเน้อ"],["ค่ายบัวท่าเสาไม่ได้มีไว้ขาย",2,"พ่อก่พูดแบบนี้เลยเจ้า… หนูดีใจที่ได้ยินอีกคน"],["สองแสนก็เยอะนะ",0,"…เจ้า หนูรู้เจ้า"]]],
   ["บางทีหนูก่คิดว่า ถ้าขายค่าย พ่อจะได้รักษาเข่าที่โรงพยาบาลดี ๆ",[["มีทางอื่นอีกหลายทาง เดี๋ยวช่วยหา",2,"…ผู้จัดการช่วยหนูคิดแท้ ๆ ก่เจ้า ขอบคุณเจ้า"],["เข้าใจเลยว่าลำบาก",1,"เจ้า… ขอบคุณที่เข้าใจเน้อ"],["ก็เป็นทางหนึ่ง",0,"เจ้า"]]],
   ["คุยกับผู้จัดการแล้วใจเบาขึ้นเจ้า… บ่รู้เป็นจะได",[["เพราะไม่ได้แบกคนเดียวแล้วไง",2,"…เจ้า หนูบ่ได้แบกคนเดียวแล้วเน้อ"],["ทักมาได้ทุกเมื่อ",1,"เจ้า! หนูจะทักบ่อย ๆ"],["ดีแล้ว",0,"เจ้า"]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgIn(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"ถนนตรงยาวสุดลูกหูลูกตาผ่านทุ่งนา ข้างหน้ามีมอเตอร์ไซค์จอดควันโขมงอยู่หน้าปั๊มร้าง ผู้หญิงผมแดงยืนโบกมือกลางถนนสองมือ"},
  {n:"tabtim",f:"happy",l:"casual",t:"จอด ๆ ๆ! ค่ายศิริชัยแม่นบ่! ทับทิมเองเด้อ! มอไซค์ทับทิมพังพอดี ขอติดรถไปเวทีแน่เด้อ"},
  {n:"nar",t:"ยังไม่ทันมีใครตอบ ทับทิมก็เปิดประตูหน้าแล้วนั่งข้างคนขับหน้าตาเฉย"},
  {n:"tabtim",f:"happy",l:"casual",t:"ทับทิมนั่งหน้าเด้อ เมารถ… บ่ได้เมารถดอก แค่อยากนั่งใกล้พี่ผู้จัดการ ฮ่า ๆ ล้อเล่น ๆ เอาไปเป็นแฟนเด้อ ล้อเล่นอีกแหละ!",choice:[
    {t:"\"ถ้าล้อเล่นสองรอบ แปลว่าไม่ได้ล้อเล่นนะ\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…เอ้า! พี่ผู้จัดการตอบจริงจังจั่งซี้ ทับทิมบ่มีมุกต่อแล้วเด้อ"}]},
    {t:"หัวเราะแล้วขับรถต่อ",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ ใจเย็นแท้เด้อพี่ ทับทิมมักคนใจเย็น"}]},
    {t:"\"คาดเข็มขัดนิรภัยด้วยนะ\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"คาดแล้ว ๆ… โธ่ พี่ผู้จัดการนี่จริงจังแท้"}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ทับทิม")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"เอ๊ะ! ข้างหลังนั่นพลอยแม่นบ่! พลอยหมัดโคราช คนบ้านเฮา! ทับทิมอยากลองโดนจักหมัดมาตั้งแต่งานเปิดตัวเด้อ"},
    {n:"ploy",f:"pout",l:"casual",t:"…นั่งหันหน้าไปข้างหน้าเถอะ เดี๋ยวคอเคล็ด"}]),
  {n:"nar",bg:"somtam_stall",t:"ทับทิมคุยไม่หยุดตลอดทาง แล้วสั่งให้แวะร้านส้มตำริมทาง \"ร้านนี้แซบที่สุดในภาค ทับทิมเลี้ยงเอง!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}กะคนบ้านใกล้ ๆ ทับทิมนี่แหละเด้อ เพิ่นเตะหนักแต่การ์ดซ้ายต่ำ เตะซ้ายสวนเข้าไปเลย`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของทับทิมไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของทับทิมไว้"},
  {n:"coach",t:"ส้มตำร้านนี้เผ็ดจนครูน้ำตาไหล… แต่อร่อยจริง"},
  {n:"tabtim",f:"happy",l:"casual",t:"ไปเด้อพี่น้อง! ทับทิมสิไปนั่งเชียร์ข้างเวที… เชียร์ฝั่งไหนกะบ่บอกดอก ฮ่า ๆ"}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgIn(G,"ploy");return [
  {n:"nar",t:"คืนเดียวกัน บนเวทีเดียวกัน คู่รองก่อนไฟต์ของค่ายเรา นักมวยจากค่ายเวกเตอร์ชนะน็อกตั้งแต่ยกสอง"},
  {n:"npc",who:"เวกา",t:"ข้อมูลบอกว่าเขาจะยกการ์ดช้าในยกสองค่ะ …ข้อมูลไม่เคยโกหก"},
  ...(ploy?[
   {n:"npc",who:"เซียนมวยข้างเวที",t:"สาวโคราชคนนั้นน่ะ ไปอยู่ค่ายเชียงใหม่มาตั้งนาน หมัดโคราชยังของแท้อยู่บ่ หรือเหลือแต่ชื่อ"},
   {n:"nar",t:"คนรอบ ๆ หัวเราะ พลอยได้ยินชัดทุกคำ แต่ไม่หันไปมอง"},
   {n:"pailin",f:"happy",t:"พลอย มาอยู่เวกเตอร์กับพี่เถอะ ที่นี่เขาไม่ได้มองว่าเธอเป็นมวยโคราชหรอก ที่เวกเตอร์ เธอเป็นข้อมูลที่ดีที่สุดที่พี่เคยมี"},
   {n:"npc",who:"เวกา",t:"พี่พลอยคะ… ห้องซ้อมของพี่ยังว่างอยู่นะคะ ไม่มีใครกล้าใช้"},
   {n:"ploy",f:"angry",l:"casual",with:"pailin",t:"พี่ไพลิน ฉันไม่ตอบด้วยคำพูดหรอก"},
   {n:"nar",t:"พลอยเดินไปที่มุมวอร์มข้างเวที หยิบเป้ามือขึ้นมายื่นให้ทับทิมที่ยืนดูอยู่"},
   {n:"ploy",f:"happy",l:"casual",t:"ถือให้หน่อย ถือแน่น ๆ นะ"},
   {n:"nar",t:"หมัดเหวี่ยงควายลูกเดียว เสียงดังจนคนทั้งมุมหันมามอง ทับทิมกระเด็นถอยหลังไปสามก้าว"},
   {n:"tabtim",f:"surprised",l:"casual",with:"ploy",t:"โอ๊ย! มือทับทิมชาไปถึงศอก… อันนี้ของแท้เด้อพี่น้อง! ของแท้แท้ ๆ!"},
   {n:"npc",who:"เซียนมวยข้างเวที",t:"…ของแท้"},
   {n:"pailin",f:"sad",t:"…ข้อมูลของพี่ไม่เคยวัดแรงหมัดนี้ได้เลย"},
   {n:"nar",show:[{id:"pailin"},{id:"ploy",l:"casual",f:"sad"}],t:"ไพลินหันหลังเดินออกไปกับเวกา แต่หยุดมองพลอยอีกครั้งก่อนลับประตู",choice:[
     {t:"\"หมัดนั้นเป็นของพลอยเอง ไม่ใช่ของใคร\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"flustered",l:"casual",t:"…ไม่ต้องพูดก็รู้ค่ะ แต่ได้ยินแล้วก็… ขอบคุณค่ะ"}]},
     {t:"\"พี่สาวเธอยังห่วงเธออยู่นะ\"",fx:G2=>add(G2,"ploy","bond",1),then:[{n:"ploy",f:"sad",l:"casual",t:"รู้ค่ะ… พี่ไพลินห่วงแบบที่ห่วงข้อมูลชุดหนึ่ง วันไหนพี่ห่วงแบบห่วงน้อง ฉันถึงจะกลับไปคุย"}]}]},
   {fx:G2=>{const p=G2.F.ploy;if(p)p.morale=Math.min(100,(p.morale||0)+5);rgMeet(G2,"tabtim",1);G2.flags.ployKorat=1;}},
   {n:"nar",t:"พลอย กำลังใจ +5"}]
  :[{n:"pailin",f:"happy",t:"ค่ายศิริชัยไปได้ไกลกว่าที่ข้อมูลของฉันบอกนะคะ …น่าสนใจ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ข้อมูล ๆ ๆ คนกรุงเทพฯ นี่ชอบข้อมูลแท้เด้อ ทับทิมว่ากินส้มตำดีกว่า ฮ่า ๆ"},
   {fx:G2=>rgMeet(G2,"tabtim",1)}])];}};
RG_POST.isan="เถิง พี่ผู้จัดการ\n\nพ่อกลับบ้านมาแล้วกะบ่เว้าหยังเลยเด้อ สามมื้อ\n\nมื้อที่สี่ พ่อเอาผ้าคาดเอวเก่าของพ่อมาวางไว้หัวนอนทับทิม ผ้าผืนที่พ่อใช้ชกตอนหนุ่ม ๆ พ่อบอกแค่ว่า \"เตะกะเตะสิ แต่เตะให้สุด\"\n\nทับทิมฮ้องไห้ทั้งคืนเลยเด้อ บ่ต้องบอกไผ\n\nถ้วยอยู่ค่ายศิริชัยแล้ว ดูแลให้ดีเด้อ ทับทิมสิไปเอาคืนจักมื้อ ฮ่า ๆ\n\n— ทับทิม";
RG_CHAT.tabtim=[
 {id:"tt_fee",x:[
  ["พี่ผู้จัดการ! น้องคนเล็กทับทิมสอบติดมหาลัยแล้วเด้อ!!",[["ยินดีด้วย! ทับทิมเก่งมากที่ส่งน้องเรียนมาถึงนี่",2,"…เอ้า พี่ชมทับทิมแทนชมน้องซะงั้น ทับทิมน้ำตาสิไหลแล้วเด้อ"],["เลี้ยงฉลองเลยไหม",1,"เลี้ยงหมูกระทะทั้งหมู่บ้านเลย! พี่ออกครึ่งนึงเด้อ ฮ่า ๆ"],["คณะอะไรเหรอ",1,"นิติฯ เด้อ! คนเดียวกับที่อ่านสัญญาซองเขียวให้นั่นแหละ"]]],
  ["แต่ค่าเทอมแพงหลายเด้อ… ทับทิมต้องชนะอีกหลายไฟต์",[["อย่าแบกคนเดียว มีอะไรบอกได้นะ",2,"…พี่ใจดีแท้ ทับทิมบ่ชินเลยเด้อ"],["ชนะได้อยู่แล้ว เตะทับทิมหนักจะตาย",1,"ฮ่า ๆ แม่นแล้ว! เตะทับทิมจ่ายค่าเทอมได้เด้อ"],["ทุนการศึกษาก็มีนะ",1,"เออ! ทับทิมสิไปถามน้องเบิ่ง"]]],
  ["ไปซ้อมก่อนเด้อ! เตะสิบลูก หนึ่งลูกเท่ากับค่าหนังสือหนึ่งเล่ม ฮ่า ๆ",[["สู้ ๆ นะ",1,"สู้เด้อ!"],["เตะเผื่อฉันด้วย",2,"ได้เลย! ลูกที่สิบเอ็ดเตะให้พี่ผู้จัดการเด้อ"],["อย่าลืมพัก",1,"รู้แล้ว ๆ พี่นี่ห่วงแท้"]]]]},
 {id:"tt_somtam",x:[
  ["ทับทิมสอนน้องในค่ายตำส้มตำ ใส่พริกยี่สิบเม็ด น้องร้องไห้เลยเด้อ ฮ่า ๆ",[["ยี่สิบเม็ดมันโหดไปแล้ว!",1,"โหดอีหยัง! คนอีสานกินสามสิบเม็ดเป็นเรื่องปกติ"],["ส่งสูตรมาให้ค่ายบ้างสิ",2,"ได้เลย! แต่ห้ามบอกป้าแต๋วเด้อ สูตรลับตระกูลทับทิม"],["น้องโอเคไหม",1,"โอเค ๆ ดื่มน้ำไปสามขวด ตอนนี้แซวทับทิมคืนแล้ว"]]],
  ["พี่ผู้จัดการกินเผ็ดได้บ่",[["ได้สบาย",1,"แม่นบ่! ครั้งหน้าทับทิมสิตำพริกสิบเม็ดให้ลองเด้อ"],["ได้นิดหน่อย",1,"บ่เป็นหยัง ทับทิมตำแบบเผ็ดน้อยให้ ทำพิเศษให้คนเดียวเด้อ"],["กินได้ถ้าทับทิมตำให้",2,"…โอ๊ย พี่ผู้จัดการ! เว้าจั่งซี้ทับทิมตำบ่ถูกแล้ว"]]],
  ["ไปตำส้มตำขายตลาดเช้าก่อนเด้อ หาค่าเทอมน้อง!",[["ขายดี ๆ นะ",1,"ขายหมดครกเด้อ!"],["เก็บไว้ให้ครกนึง",2,"เก็บไว้ให้แล้ว ใส่ปลาร้าพิเศษเด้อ!"],["โอเค",0,"เด้อ!"]]]]},
 {id:"tt_live",x:[
  ["ทับทิมเปิดไลฟ์ค่ายพี่เบิ่งทุกมื้อ ค่ายพี่ม่วนแท้ ครูแดงนั่นดุแท้บ่เด้อ",[["หน้าดุแต่ใจดี",1,"แม่นแล้ว! หน้าดุแต่แอบยื่นขนมให้เด็ก ๆ ทับทิมเห็นในไลฟ์เด้อ"],["ทับทิมดูไลฟ์ทุกวันเลยเหรอ",2,"…เอ้า ถามจั่งซี้ทับทิมสิตอบแนวได๋ ใช่ เบิ่งทุกมื้อ พอใจแล้วบ่"],["ดุจริง ระวังโดนสั่งวิ่งรอบค่าย",1,"ฮ่า ๆ ทับทิมสิไปวิ่งรอบค่ายพี่เบิ่งจักมื้อ"]]],
  ["มีคนคอมเมนต์ในไลฟ์ว่าทับทิมเตะสวยที่สุดในภาคอีสานเด้อ",[["จริงนี่",2,"…ฮ่า ๆ พี่ผู้จัดการคอมเมนต์เองบ่ เบิ่งชื่อบัญชีน่าสงสัยอยู่"],["คนนั้นตาถึง",1,"ตาถึงแท้! ทับทิมสิไปกดถูกใจให้"],["อย่าไปอ่านคอมเมนต์มาก",1,"ฮ่า ๆ รู้แล้ว แต่คอมเมนต์ดี ๆ กะอ่านได้เด้อ"]]],
  ["มื้อหน้าพี่ออกกล้องในไลฟ์แน่เด้อ ทับทิมสิรอเบิ่ง",[["จะโบกมือให้",2,"โบกมาเลย ทับทิมสิโบกกลับ… ถึงพี่สิบ่เห็นกะตาม"],["อายกล้องอะ",1,"บ่ต้องอายเด้อ หน้าพี่ผู้จัดการกะใช้ได้อยู่ ฮ่า ๆ"],["ไม่รับปากนะ",0,"โธ่!"]]]]},
 {id:"tt_dad",x:[
  ["มื้อนี้พ่อโทรมาถามว่าทับทิมกินข้าวแล้วบ่… พ่อบ่เคยโทรมาก่อนเลยเด้อ",[["พ่อเริ่มเปิดใจแล้วนะ",2,"…ทับทิมกะคิดจั่งซั่น ทับทิมตอบพ่อว่ากินแล้ว ทั้งที่ยังบ่ได้กิน ฮ่า ๆ"],["แล้วกินหรือยังล่ะ",1,"ยังเลย! พี่ถามแบบพ่อเลยเด้อ"],["ดีใจด้วยนะ",1,"ขอบใจเด้อ ทับทิมยิ้มทั้งมื้อเลย"]]],
  ["พี่ว่าสักมื้อพ่อสิมาเบิ่งทับทิมชกบ่",[["ต้องมาแน่ ถ้าทับทิมยังเตะแบบนี้",2,"…ทับทิมสิเตะต่อไปเรื่อย ๆ จนพ่อมาเบิ่งเด้อ"],["ชวนพ่อดูสิ",1,"เออ ทับทิมสิลองชวนเบิ่ง… ถ้าพ่อบ่มา พี่มาแทนเด้อ"],["ไม่แน่ใจนะ",0,"…เด้อ"]]],
  ["ขอบใจที่ฟังเด้อ ทับทิมเว้าเรื่องนี้ได้แต่กับพี่คนเดียว",[["เล่าได้ตลอดเลย",2,"…ฮ่า ๆ บ่ฮาแล้ว ทับทิมเขินเด้อ"],["ยินดีเสมอ",1,"ขอบใจเด้อ!"],["ไม่เป็นไร",0,"เด้อ"]]]]},
 {id:"tt_kick",x:[
  ["ทับทิมฝึกเตะกระโดดได้สูงกว่าเก่าอีกคืบเด้อ! อีกนิดเดียวสิเตะถึงหลอดไฟ",[["อย่าเตะหลอดไฟแตกนะ",1,"แตกไปแล้วดวงนึง ฮ่า ๆ บ่ต้องบอกพ่อเด้อ"],["สูงกว่าบั้งไฟหรือยัง",2,"…พี่ยังจำเรื่องบั้งไฟได้อยู่บ่ ทับทิมดีใจเด้อ"],["เก่งมาก",1,"เก่งแท้เด้อ ชมอีก ๆ"]]],
  ["ถ้าทับทิมเจอพลอยบนเวที พี่ว่าไผสิชนะ",[["ทับทิมชนะเรื่องเตะ พลอยชนะเรื่องหมัด",2,"ตอบแบบนี้บ่มีไผเสียใจเด้อ พี่ฉลาดแท้"],["พลอยสิ เป็นคนค่ายเรา",1,"โอ๊ย! เข้าข้างค่ายตัวเองแท้ ทับทิมสิไปฟ้องพลอย"],["ไม่รู้สิ",0,"ตอบกลาง ๆ จั่งซี้ บ่ม่วนเลย"]]],
  ["ไปซ้อมต่อเด้อ ขอเตะอีกร้อยลูก!",[["เตะเผื่อฉันด้วย",2,"ลูกที่ร้อยเตะให้พี่เด้อ!"],["อย่าหักโหมนะ",1,"รู้แล้ว ๆ"],["โอเค",0,"เด้อ!"]]]]}];
CHAT.tabtim=RG_CHAT.tabtim;
/* v1.90 round 8: the South in full — Chaba's sidecar at the bus terminal, Mali's home at Chaiya and the pier at Don Sak (Mali's story), a richer visit, the letter after the cup and Chaba's chats. Southern lines are drafts for a native speaker to check. */
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgIn(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"bus_terminal",t:"ขับรถกันมาทั้งคืน รถของค่ายเข้าจอดที่สถานีขนส่งตอนฟ้าสาง ข้างประตูทางออกมีมอเตอร์ไซค์พ่วงข้างสีซีดจอดอยู่คันเดียว"},
  {n:"chaba",f:"happy",l:"casual",t:"…ที่พักอยู่ในซอย รถใหญ่เข้าม่ายได้ ขึ้นพ่วงข้าง ทีละคน"},
  {n:"nar",t:"ชบาชี้ที่นั่งพ่วงข้าง แล้วมองมาที่ผู้จัดการคนเดียว ไม่อธิบายอะไรเลย",choice:[
    {t:"นั่งตามที่ชบาชี้",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"ชบาขี่ช้ากว่าที่ควรจะเป็น ตลอดทางไม่พูดสักคำ แต่เลี่ยงหลุมให้ทุกหลุม"}]},
    {t:"ถามว่าทำไมเลือกฉันก่อน",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"chaba",f:"flustered",l:"casual",t:"…ม่ายต้องถาม ขึ้นแขบ ๆ"}]},
    {t:"ให้คนอื่นนั่งไปก่อน",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ก็ได้ เที่ยวหน้า"},{n:"nar",t:"เที่ยวสุดท้าย ชบากลับมารับผู้จัดการคนเดียว ทั้งที่ทุกคนไปถึงหมดแล้ว"}]}]},
  ...(top&&top.id!=="mali"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ชบา")}]:[]),
  ...rgIf(mali,[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มะลิขอนั่งพ่วงข้างเที่ยวที่สองนะ! ตอนเด็ก ๆ พี่ก็เคยพามะลินั่งแบบนี้!"},
    {n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},{n:"nar",t:"แต่เที่ยวที่สอง คนที่ได้นั่งพ่วงข้างคือมะลิ และชบาขี่อ้อมไปทางชายหาดหนึ่งรอบโดยไม่มีใครขอ"}]),
  {n:"chaba",f:"happy",l:"casual",t:`${D.name}… แชมป์หมัดหนัก แต่ขาช้า …ยกสามค่อยเข้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของชบาไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของชบาไว้"},
  {n:"coach",t:"พูดน้อยจริง ๆ เด็กคนนี้… แต่ทุกคำใช้ได้หมด"}];};
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgIn(G,"mali");return mali?[
  {n:"nar",t:"เช้าวันรุ่งขึ้นหลังไฟต์ มะลิขอให้รถแวะไชยา \"บ้านมะลิอยู่ทางผ่านพอดีค่ะ!\" ทั้งที่จริงต้องอ้อมไปสี่สิบกิโล"},
  {n:"nar",t:"ถึงบ้านแม่มะลิ น้อง ๆ สามคนวิ่งออกมากอดมะลิ แม่ของมะลิยกข้าวยำมาวางเต็มแคร่"},
  {n:"npc",who:"แม่มะลิ",t:"มาแล้วหรอ! กินข้าวก่อนลูก ทุกคนเลย… อ้าว แล้วหนูคนนั้นทำไมยืนอยู่หน้าบ้านล่ะ"},
  {n:"nar",show:[{id:"chaba",l:"casual"}],t:"ชบายืนพิงมอเตอร์ไซค์อยู่หน้าประตูรั้ว ไม่ยอมเดินเข้ามา แม้แม่ของมะลิจะเรียกสองรอบ"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"พี่ชบา… ตอนมะลิหกขวบ พี่หายไปเฉย ๆ ไม่บอกลาสักคำ มะลิรอพี่อยู่หน้าบ้านทุกเย็นเลยนะ"},
  {n:"chaba",f:"sad",l:"casual",t:"…"},
  {n:"nar",bg:"pier_south",t:"บ่ายนั้นที่ท่าเรือดอนสัก ระหว่างรอเรือ ชบาเดินมานั่งข้างมะลิที่ปลายท่า"},
  {n:"chaba",f:"sad",l:"casual",t:"ปีนั้นเรือพี่ชายคว่ำ ขาพี่ม่ายดีอีก แม่พาย้ายไปภูเก็ตคืนนั้นเลย หาหมอ หางาน"},
  {n:"chaba",f:"sad",l:"casual",t:"ม่ายได้ลืมมะลิ …แค่ม่ายรู้จะแหลงพันพรือ ยิ่งนานยิ่งแหลงม่ายออก"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"…ทำไมพี่ไม่ส่งจดหมายมาสักฉบับล่ะ มะลิอ่านหนังสือออกแล้วนะตอนนั้น",choice:[
    {t:"\"ตอนนี้ยังไม่สายนะ ทั้งสองคน\"",fx:G2=>{add(G2,"mali","bond",2);rgMeet(G2,"chaba",1);},then:[{n:"chaba",f:"flustered",l:"casual",t:"…ม่ายสาย"}]},
    {t:"เงียบ ปล่อยให้สองคนคุยกันเอง",fx:G2=>{add(G2,"mali","bond",1);rgMeet(G2,"chaba",2);},then:[{n:"nar",t:"ผู้จัดการถอยออกมายืนห่าง ๆ เสียงคลื่นกระทบเสาท่าเรือดังแทนคำพูดอยู่นาน"}]}]},
  {n:"chaba",f:"flustered",l:"casual",t:"…เขียนแล้ว สิบเอ็ดฉบับ ม่ายได้ส่งสักฉบับ ยังอยู่ในลิ้นชัก"},
  {n:"mali",f:"surprised",l:"casual",t:"สิบเอ็ดฉบับ?! …พี่ชบา ส่งมาให้มะลิหมดเลยนะ! ห้ามเก็บไว้แล้ว!"},
  {n:"nar",t:"มะลิร้องไห้ไปหัวเราะไป ชบายกมือขึ้นลูบหัวมะลิสองที เหมือนตอนที่มะลิยังตัวเล็ก ๆ"},
  {n:"chaba",f:"happy",l:"casual",t:"…ตัวใหญ่ขึ้น มะลิ ขี้แยเท่าเดิม"},
  {n:"mali",f:"happy",l:"casual",t:"ไม่ขี้แยแล้ว! …ก็นิดนึง"},
  {fx:G2=>{add(G2,"mali","bond",2);const m=G2.F.mali;if(m)m.morale=Math.min(100,(m.morale||0)+5);rgMeet(G2,"chaba",2);G2.flags.chabaMali=1;}},
  {n:"nar",t:"มะลิ กำลังใจ +5 · มะลิกับชบาคืนดีกันแล้ว"}]
 :[{n:"nar",bg:"pier_south",t:"ก่อนกลับ ชบาพาผู้จัดการไปนั่งที่ปลายท่าเรือดอนสัก รอเรือข้ามฟากลำสุดท้าย"},
  {n:"chaba",f:"sad",l:"casual",t:"…ตอนเด็กมีน้องข้างบ้านที่ไชยาคนหนึ่ง ร้องไห้เก่ง ย้ายบ้านแล้วม่ายได้บอกลา"},
  {n:"chaba",f:"happy",l:"casual",t:"ป่านนี้คงตัวโตแล้ว …คงชกมวยอยู่ที่ไหนสักที่"},
  {fx:G2=>rgMeet(G2,"chaba",2)}];}};
RG_POST.south="ผู้จัดการ\n\nบอกนาคาแล้ว ให้ถอดโฆษณาที่ใช้เรื่องพี่ชาย\n\nเขาถอดแล้ว\n\nพี่ชายฝากขอบคุณค่ายศิริชัย บอกว่าวันที่นั่งรถเข็นดูข้างเวที เป็นวันที่ดีที่สุดตั้งแต่เรือคว่ำ\n\nถ้วยอยู่กับผู้จัดการแล้ว ดูแลด้วย\n\n— ชบา\n\nป.ล. ส่งจดหมายสิบเอ็ดฉบับให้มะลิแล้ว";
RG_CHAT.chaba=[
 {id:"cb_sea",x:[
  ["…คลื่นวันนี้สูง",[["ออกทะเลระวังด้วยนะ",2,"…ม่ายออก อยู่บ้าน คิด…ช่างเถอะ"],["ซ้อมวิ่งในทรายหรือเปล่า",1,"วิ่งแล้ว สิบรอบ"],["อืม",0,"…"]]],
  ["พี่ชายบอกให้ทักมา",[["พี่ชายใจดีจัง",1,"…บอกเอง ม่ายใช่ฉาน"],["ดีใจที่ทักมานะ",2,"…รู้แล้ว"],["มีอะไรเหรอ",0,"ม่ายมี"]]],
  ["ไปซ้อมแล้ว",[["ไปเถอะ แล้วทักมาอีกนะ",2,"…อือ"],["สู้ ๆ",1,"อือ"],["โอเค",0,"…"]]]]},
 {id:"cb_bro",x:[
  ["พี่ชายลุกยืนได้สิบวินาที วันนี้",[["เก่งมาก! ฝากบอกด้วย",2,"บอกแล้ว พี่ร้องไห้ …ฉานด้วย นิดหนึ่ง"],["ดีขึ้นเรื่อย ๆ แล้วนะ",1,"…อือ หมอบอกงั้น"],["สิบวินาทีเอง",0,"…สิบวินาทีนาน"]]],
  ["พี่อยากมาดูค่ายศิริชัย",[["มาได้ทุกเมื่อ เดี๋ยวทำทางลาดรอ",2,"…ทางลาด จะบอกพี่ พี่ต้องดีใจ"],["ยินดีต้อนรับเลย",1,"อือ ขอบใจ"],["ไกลนะ",0,"…รู้"]]],
  ["ขอบใจ ผู้จัดการ",[["ไม่ต้องขอบใจหรอก",1,"…ขอบใจอยู่ดี"],["ชบาก็ทักมาบ่อย ๆ สิ",2,"…จะลอง"],["ไม่เป็นไร",0,"อือ"]]]]},
 {id:"cb_food",x:[
  ["กินแกงไตปลายัง",[["ยังไม่เคยกินเลย",1,"…ม่ายหอนกิน? มาภูเก็ต จะพาไป"],["เผ็ดเกินไปสำหรับฉัน",1,"อ่อนแอ"],["ส่งมาให้ค่ายบ้างสิ",2,"…ส่งแล้ว สองกระปุก พรุ่งนี้ถึง"]]],
  ["ร้านโกปี้หน้าบ้าน ชาร้อนหรอยที่สุด",[["อยากไปนั่งด้วยจัง",2,"…ที่ว่าง มีหนึ่งที่ ข้างฉาน"],["ชาร้อนตอนเช้าดีนะ",1,"อือ ทุกเช้า"],["ชอบกาแฟมากกว่า",0,"…ก็ได้"]]],
  ["หิว ไปกินก่อน",[["กินเยอะ ๆ นะ",1,"อือ"],["ถ่ายรูปมาให้ดูด้วย",2,"…(ส่งรูปข้าวมันไก่มาหนึ่งรูป ไม่มีข้อความ)"],["โอเค",0,"…"]]]]},
 {id:"cb_mali",x:[
  ["มะลิส่งข้อความมาวันละยี่สิบข้อความ",[["ตอบบ้างหรือเปล่า",1,"ตอบ …วันละข้อความ"],["มะลิรอพี่มาสิบกว่าปีเลยนะ",2,"…รู้ จะตอบเพิ่ม เป็นสองข้อความ"],["เยอะไปไหม",0,"…ม่ายเยอะ"]]],
  ["มะลิชกดีขึ้นมาก ผู้จัดการสอนดี",[["มะลิเก่งเองต่างหาก",2,"…พูดเหมือนกัน กับที่มะลิพูดถึงผู้จัดการ"],["ครูแดงสอนนะ",1,"ครูแดงด้วย"],["ขอบใจที่ชม",0,"อือ"]]],
  ["ฝากดูแลมะลิ",[["ดูแลอยู่แล้ว",2,"…เชื่อ"],["ชบาก็มาดูเองบ้างสิ",1,"…จะมา"],["มะลิโตแล้วนะ",0,"…ยังเด็กอยู่"]]]]},
 {id:"cb_naka",x:[
  ["นาคาส่งสัญญามาอีก",[["อย่าเพิ่งเซ็นนะ ให้รินดูก่อน",2,"…ส่งให้รินแล้ว ขีดแดงสิบสองจุด"],["เงินเยอะไหม",0,"…ม่ายสนเงิน"],["ไม่อยากเซ็นก็ไม่ต้องเซ็น",1,"ม่ายเซ็น"]]],
  ["คุณเกริกยิ้มตลอด …ม่ายชอบ",[["คนยิ้มตลอดน่ากลัวที่สุด",2,"…ผู้จัดการคิดเหมือนกัน"],["เขาก็ใจดีนะ",0,"…ม่ายใช่"],["ระวังตัวด้วยนะ",1,"ระวังอยู่"]]],
  ["…คุยกับผู้จัดการ แล้วนอนหลับ",[["งั้นทักมาทุกคืนเลย",2,"…ได้"],["ฝันดีนะ",1,"อือ ฝันดี"],["ไปนอนเถอะ",0,"…"]]]]}];
CHAT.chaba=RG_CHAT.chaba;
/* v1.90 round 9: the Central Plains in full — Alicia's live stream on the first trip, Lopburi's monkeys, the draft Naka League contract (Rin's story) at Suphan, a richer visit, her post after the cup and Alicia's chats. */
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgIn(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"camp_hanuman",t:`ระหว่างทางไป${D.name} อลิเซียส่งพิกัดมาให้แวะค่ายหนุมานลพบุรีก่อน \"แค่ทางผ่านค่ะ ไม่ได้ตั้งใจเชิญ\"`},
  {n:"nar",t:"ประตูรถยังไม่ทันเปิดสุด กล้องมือถือบนไม้เซลฟี่ก็จ่อเข้ามาแล้ว ไฟวงแหวนสว่างจ้า"},
  {n:"alicia",f:"happy",l:"casual",t:"Hi everyone~ วันนี้มีแขกพิเศษค่ะ! นี่คือค่ายที่ทุกคนในคอมเมนต์พูดถึง… ค่ายศิริชัย!"},
  {n:"nar",t:"อลิเซียหันกล้องกวาดไปทั้งรถ แล้วค้างไว้ที่หน้าผู้จัดการนานเกินไปหลายวินาที คอมเมนต์ในไลฟ์ไหลรัว",choice:[
    {t:"โบกมือให้กล้อง",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"เห็นไหมคะทุกคน ผู้จัดการตัวจริงยิ้มเก่งกว่าในคลิปอีก …หมายถึงคอมเมนต์บอกนะ ไม่ใช่ฉัน"}]},
    {t:"\"กล้องค้างที่ฉันนานแล้วนะ\"",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"alicia",f:"flustered",l:"casual",t:"…! สัญญาณกระตุกค่ะ! เน็ตลพบุรีไม่ดี ไม่ใช่ฉันตั้งใจ!"}]},
    {t:"เอามือบังกล้อง",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"pout",l:"casual",t:"อ้าว! คนดูหายไปสามร้อยคนเลยนะ …ก็ได้ ไม่ถ่ายแล้วก็ได้"}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"อลิเซีย")}]:[]),
  ...rgIf(rin,[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"คนดูไลฟ์ตอนนี้ 4,812 คนค่ะ อัตราคอมเมนต์ต่อนาทีสูงกว่าไลฟ์ปกติของคุณ 2.3 เท่า"},
    {n:"alicia",f:"happy",l:"casual",t:"…เธอนับได้ยังไงตั้งแต่ลงจากรถ ฉันชักชอบเธอแล้วนะ"}]),
  {n:"alicia",f:"happy",l:"casual",t:`แชมป์จังหวัดนี้ซ้อมที่ค่ายฉันมาก่อนค่ะ เธอเก่งหมัดตรง แต่ไม่ชอบโดนเตะต่ำ …ฉันไม่ได้บอกนะ คุณเดาเอง`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของอลิเซียไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของอลิเซียไว้"},
  {n:"coach",t:"ไลฟ์เสร็จแล้วใช่ไหม ครูจะได้เอาแว่นดำออก"}];};
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgIn(G,"fah");return [
  {n:"nar",t:"เย็นนั้นทั้งค่ายแวะพระปรางค์สามยอดซื้อของฝาก ยังไม่ทันลงรถ ลิงฝูงใหญ่ก็กระโดดขึ้นหลังคามาเป็นสิบตัว"},
  {n:"nar",t:"ลิงตัวโตที่สุดคว้าถุงขนมของฝากไปทั้งถุง แล้วนั่งแกะกินบนเสาไฟต่อหน้าทุกคน"},
  fah?{n:"fah",f:"angry",l:"casual",t:"เฮ้ย! นั่นขนมของฟ้า! ลงมาเดี๋ยวนี้ ฟ้าจะเตะให้ตกเสาเลย!"}:{n:"coach",t:"อย่าไปแย่งคืนนะ เดี๋ยวมันเรียกพวกมาอีกห้าสิบตัว"},
  {n:"nar",t:"ลิงอีกตัวหยิบผ้าพันมือที่ตากไว้หลังรถไปพันหัวตัวเองเหมือนนักมวย แล้วยืนตั้งการ์ดใส่ทุกคน"},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…มันตั้งการ์ดดีกว่าเด็กใหม่ในค่ายอีกนะ"}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"ถ่ายรูปไว้ก่อนค่ะ! คลิปนี้ต้องขึ้นเพจค่ายแน่ ๆ"}]:[]),
  {n:"coach",t:"ช่างมัน… ปีหน้าค่อยมาเอาผ้าพันมือคืน มันคงเป็นแชมป์ลพบุรีไปแล้ว"},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"ทุกคนหัวเราะกันจนท้องแข็ง · กำลังใจทุกคน +2 · ผ้าพันมือหายไปหนึ่งคู่"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgIn(G,"rin");return rin?[
  {n:"nar",t:"สี่ทุ่ม มีคนเคาะประตูห้องพัก อลิเซียยืนอยู่หน้าห้อง ใส่ฮู้ดคลุมหัว ในมือถือแฟ้มหนาเตอะ"},
  {n:"alicia",f:"sad",l:"casual",t:"ขอโทษที่มาดึกค่ะ… ฉันขอยืมตัวรินได้ไหม แค่ชั่วโมงเดียว"},
  {n:"alicia",f:"sad",l:"casual",with:"rin",t:"นี่สัญญานาคาลีกฉบับร่าง ผู้จัดการส่วนตัวฉันบอกว่าดีมาก ให้เซ็นภายในสัปดาห์นี้ เธออ่านสัญญาเก่งใช่ไหม ช่วยดูให้หน่อย"},
  {n:"rin",f:"happy",l:"casual",t:"ได้ค่ะ ขอปากกาแดงกับกาแฟหนึ่งแก้ว"},
  {n:"nar",t:"หนึ่งชั่วโมงกลายเป็นสามชั่วโมง กระดาษสี่สิบหน้ากระจายเต็มเตียง รินขีดแดงไปยี่สิบสามจุด"},
  {n:"rin",f:"sad",l:"casual",t:"ข้อ 9 ค่ะ รายได้จากภาพและคอนเทนต์ของนักสู้ บริษัทได้เจ็ดสิบเปอร์เซ็นต์ นักสู้ได้สามสิบ ตลอดอายุสัญญา"},
  {n:"rin",f:"sad",l:"casual",t:"ข้อ 21 ค่ะ อายุสัญญาสิบปี ต่ออัตโนมัติ ถ้าจะยกเลิกต้องจ่ายค่าปรับเท่ารายได้สามปีย้อนหลัง"},
  {n:"rin",f:"sad",l:"casual",t:"และข้อ 14.3 ค่ะ… ประโยคเดียวกับในซองเขียวทุกตัวอักษร ข้อมูลการชก ภาพ และเสียง เป็นของบริษัทในเครือตลอดไป"},
  {n:"alicia",f:"sad",l:"casual",t:"…สามสิบเปอร์เซ็นต์ สิบปี ตลอดไป ผู้จัดการของฉันบอกว่ามัน \"มาตรฐานวงการ\""},
  {n:"rin",f:"happy",l:"casual",t:"ฉันอ่านตัวเลขได้ค่ะ แต่ฉันไม่รู้ว่าในวงการเขาเซ็นกันแบบนี้จริงไหม คุณรู้ดีกว่าฉัน"},
  {n:"alicia",f:"happy",l:"casual",t:"…ไม่มีใครเซ็นแบบนี้หรอก ค่ายดี ๆ ให้นักมวยอย่างน้อยครึ่งหนึ่ง แล้วไม่มีใครกล้าเขียนคำว่า \"ตลอดไป\" ลงในสัญญานักกีฬา"},
  {n:"nar",t:"อลิเซียหยิบปากกาแดงจากมือริน แล้ววงข้อ 9 ข้อ 21 กับข้อ 14.3 ซ้ำอีกรอบด้วยมือตัวเอง",choice:[
    {t:"\"สองคนรวมกันอ่านสัญญาเก่งที่สุดในประเทศแล้วนะ\"",fx:G2=>{add(G2,"rin","bond",2);rgMeet(G2,"alicia",1);},then:[{n:"rin",f:"flustered",l:"casual",t:"…ข้อมูลยังไม่พอจะสรุปแบบนั้นค่ะ แต่ฉันจะไม่เถียง"}]},
    {t:"\"อลิเซีย จะเอายังไงกับมันต่อ\"",fx:G2=>{rgMeet(G2,"alicia",2);add(G2,"rin","bond",1);},then:[{n:"alicia",f:"happy",l:"casual",t:"ส่งกลับไปพร้อมรอยปากกาแดงนี่แหละค่ะ แล้วก็… อาจจะต้องหาผู้จัดการส่วนตัวคนใหม่"}]}]},
  {n:"alicia",f:"flustered",l:"casual",with:"rin",t:"ริน… ขอบคุณนะ ฉันไม่เคยมีเพื่อนที่ฉลาดแบบนี้ ทุกคนรอบตัวฉันฉลาดแค่เรื่องยอดวิว"},
  {n:"rin",f:"flustered",l:"casual",t:"เพื่อน… บันทึกไว้แล้วค่ะ"},
  {fx:G2=>{add(G2,"rin","bond",2);const r=G2.F.rin;if(r)r.morale=Math.min(100,(r.morale||0)+5);rgMeet(G2,"alicia",2);G2.flags.rinAlicia=1;}},
  {n:"nar",t:"ริน กำลังใจ +5 · รินกับอลิเซียกลายเป็นเพื่อนกัน"}]
 :[{n:"nar",t:"สี่ทุ่ม อลิเซียมาเคาะประตูห้องพัก ในมือถือแฟ้มสัญญาหนาเตอะ"},
  {n:"alicia",f:"sad",l:"casual",t:"สัญญานาคาลีกค่ะ ผู้จัดการส่วนตัวบอกให้เซ็นภายในสัปดาห์นี้ …คุณช่วยอ่านข้อ 14.3 ให้ฟังหน่อยได้ไหม ฉันอ่านแล้วมือสั่น"},
  {n:"nar",t:"ผู้จัดการอ่านออกเสียงช้า ๆ ประโยคเดียวกับในซองเขียวทุกตัวอักษร อลิเซียปิดแฟ้มเงียบ ๆ"},
  {n:"alicia",f:"happy",l:"casual",t:"…ขอบคุณค่ะ ฉันรู้แล้วว่าจะทำยังไงกับมัน"},
  {fx:G2=>rgMeet(G2,"alicia",2)}];}};
RG_POST.central="📱 แจ้งเตือน: อลิเซีย (@alicia.hanuman) โพสต์ใหม่\n\n\"ขอบคุณทุกคนที่เชียร์ศึกชิงแชมป์ภาคกลางนะคะ ถ้วยไปอยู่กับค่ายศิริชัยแล้ว และพวกเขาสมควรได้มันทุกหมัด\n\nมีข่าวลือว่าฉันเซ็นสัญญากับลีกใหม่แล้ว ขอตอบตรงนี้เลยค่ะ: ฉันยังไม่ได้เซ็นกับใครทั้งนั้น\n\nและจะไม่เซ็นอะไรที่มีคำว่า 'ตลอดไป'\"\n\n— ยอดไลก์ 48,000 ภายในหนึ่งชั่วโมง\n\n📩 ข้อความส่วนตัวตามมาอีกหนึ่งข้อความ: \"เห็นโพสต์แล้วใช่ไหม …ไม่ต้องตอบก็ได้ แค่อยากให้คุณเห็นก่อนคนอื่น\"";
RG_CHAT.alicia=[
 {id:"al_live",x:[
  ["ไลฟ์เมื่อคืนคนดูสองหมื่น แต่คอมเมนต์ครึ่งหนึ่งถามว่า \"ผู้จัดการศิริชัยอยู่ไหน\"",[["บอกเขาว่าฉันกำลังทำงาน",1,"…บอกไปแล้ว คนดูกดผิดหวังรัวเลย"],["งั้นไลฟ์หน้าชวนฉันสิ",2,"ไม่ได้! …เดี๋ยวคนดูจะคิดไปเองว่าเรา… ไม่ได้ ๆ"],["ช่างคอมเมนต์เถอะ",0,"ช่างไม่ได้ค่ะ นั่นคืองานฉัน"]]],
  ["ทีมสปอนเซอร์ให้ฉันยิ้มใส่กล้องวันละสามชั่วโมง",[["เหนื่อยแย่เลย พักบ้างนะ",2,"…คุณเป็นคนแรกที่บอกให้ฉันพัก แทนที่จะบอกให้ยิ้มอีก"],["ยิ้มสวยอยู่แล้วนี่",1,"รู้ค่ะ …แต่ขอบคุณ"],["งานก็คืองาน",0,"…ใช่ งานก็คืองาน"]]],
  ["ไปซ้อมก่อนนะ ซ้อมจริง ไม่ได้ซ้อมถ่ายคลิป",[["ซ้อมดี ๆ",1,"แน่นอนค่ะ"],["ส่งคลิปซ้อมจริงมาให้ดูด้วย",2,"…คลิปที่ไม่มีใครเคยเห็น ส่งให้คุณคนเดียวนะ"],["โอเค",0,"บาย"]]]]},
 {id:"al_rin",x:[
  ["รินส่งตารางวิเคราะห์หมัดของฉันมาให้ สิบเจ็ดหน้า",[["รินชอบเธอนะ ถึงทำให้ขนาดนั้น",2,"…จริงเหรอ งั้นฉันจะอ่านทั้งสิบเจ็ดหน้าเลย"],["อ่านไหวเหรอ",1,"อ่านไปสองหน้า แล้วโทรถามรินที่เหลือ"],["เยอะไปไหม",0,"รินบอกว่านี่คือฉบับย่อ"]]],
  ["ฉันชวนรินไปกินบุฟเฟต์ เธอนับแคลอรี่ทุกจานเลย",[["นั่นคือรินแหละ",1,"ใช่ค่ะ แล้วเธอยังกินเยอะกว่าฉันอีก"],["เธอสองคนเข้ากันดีนะ",2,"…ฉันไม่เคยมีเพื่อนที่ไม่สนยอดวิวมาก่อน มันสบายใจดี"],["แล้วอร่อยไหม",0,"อร่อยค่ะ"]]],
  ["อย่าบอกรินนะว่าฉันเล่าให้ฟัง",[["ไม่บอกแน่นอน",1,"สัญญานะ"],["ช้าไปแล้ว รินรู้ทุกอย่าง",2,"…จริงด้วย รินคงคำนวณไว้ตั้งแต่แรกแล้ว"],["บอกไปแล้ว",0,"ผู้จัดการ!!"]]]]},
 {id:"al_hanuman",x:[
  ["ค่ายหนุมานมีลิงมาขโมยนวมทุกวัน วันนี้มันเอาไปทั้งคู่",[["ลิงลพบุรีขโมยผ้าพันมือค่ายเราไปเหมือนกัน",2,"ฮ่า ๆ งั้นตอนนี้ลิงที่นั่นคงตั้งค่ายมวยเองได้แล้ว"],["ค่ายชื่อหนุมานก็สมควรแล้ว",1,"…ตลกค่ะ ฉันหัวเราะออกเสียงเลยนะ"],["ทำไมไม่ไล่ไป",0,"ไล่ไม่ได้ค่ะ ลิงที่นี่เป็นเจ้าของเมือง"]]],
  ["ท่าหนุมานถวายแหวนของค่ายเรา ครูบอกว่าฉันทำสวยที่สุดในรอบสิบปี",[["สวยและแรงด้วย",2,"…คุณพูดคำว่าแรงก่อนสวย ฉันจะจำไว้"],["ครูตาถึง",1,"ครูตาถึงค่ะ"],["สวยอย่างเดียวชนะไม่ได้นะ",0,"…รู้ค่ะ ไม่ต้องย้ำ"]]],
  ["ว่าง ๆ มาค่ายหนุมานบ้างสิ ฉันจะพาเดินดู …ในฐานะเจ้าบ้านเฉย ๆ",[["ไปแน่นอน",2,"…ฉันจะไม่บอกทีมงาน จะได้ไม่มีกล้อง"],["พาทั้งค่ายไปได้ไหม",1,"ได้ค่ะ แต่ลิงจะชอบคุณมากกว่าฉันแน่ ๆ"],["ถ้าว่างนะ",0,"…ก็ได้"]]]]},
 {id:"al_mgr",x:[
  ["ฉันไล่ผู้จัดการส่วนตัวออกแล้ว คนที่บอกให้เซ็นสัญญานาคาลีก",[["ตัดสินใจถูกแล้ว",2,"…ฉันกลัวมาก แต่พอได้ยินคุณพูดแบบนี้ก็ดีขึ้น"],["แล้วใครจะดูแลงานต่อ",1,"ตอนนี้ฉันทำเองค่ะ รินช่วยดูสัญญาให้"],["กล้ามาก",1,"ใช่ไหมล่ะ!"]]],
  ["…ผู้จัดการค่ายศิริชัยรับดูแลนักมวยนอกค่ายบ้างไหมคะ ถามเล่น ๆ",[["ถ้าเป็นเธอ ยินดีเสมอ",2,"…ถามเล่น ๆ เฉย ๆ นะ! อย่าเข้าใจผิด! …แต่จำไว้แล้ว"],["ค่ายเราเล็กนะ",1,"ค่ายเล็กที่ชนะฉันได้ค่ะ"],["ไม่รับ",0,"…ก็แค่ถามเล่น"]]],
  ["ลืมที่ฉันถามไปเลยนะ!",[["ลืมไม่ได้แล้วล่ะ",2,"…งั้นก็จำไว้ก็ได้"],["โอเค ลืมแล้ว",0,"…ลืมเร็วจังนะ"],["ลืมแล้ว แต่จดไว้",1,"ผู้จัดการ!"]]]]},
 {id:"al_night",x:[
  ["คืนนี้ฉันไม่ได้ไลฟ์ นั่งดูหิ่งห้อยที่ริมน้ำคนเดียว",[["เหมือนคืนที่ล่องเรือเลย",2,"…คุณยังจำได้ ฉันนึกว่ามีแต่ฉันที่จำ"],["ไม่ไลฟ์ก็ดีนะ",1,"ใช่ค่ะ เงียบดี"],["ระวังยุงนะ",1,"ทายากันยุงแล้ว ฮ่า ๆ"]]],
  ["ถ้าวันหนึ่งไม่มีใครดูไลฟ์ฉันแล้ว คุณจะยังดูไหม",[["ดูอยู่แล้ว ถึงจะเป็นคนดูคนเดียว",2,"…คนดูคนเดียวก็พอแล้วค่ะ"],["คนดูไม่หายหรอก",1,"ตอบเลี่ยงนะ แต่ก็ขอบคุณ"],["ไม่รู้สิ",0,"…ตอบตรงไปไหม"]]],
  ["ไปนอนแล้ว อย่าส่งสติกเกอร์ตอบนะ ฉันจะได้ไม่ต้องตอบกลับ",[["(ส่งสติกเกอร์)",1,"…ตอบแล้ว พอใจไหม (สติกเกอร์หัวใจ)"],["ฝันดีนะ",2,"…ฝันดีค่ะ ผู้จัดการ"],["โอเค",0,"ราตรีสวัสดิ์"]]]]}];
CHAT.alicia=RG_CHAT.alicia;
/* ---------- v1.90 limit break: a fighter with every stat at 20 (Lv.20+) leaves camp for two weeks of training and comes back with a ceiling of 25 ---------- */
const LB_CAP=25;
const lbFull=f=>!!f&&ATTRS.every(([k])=>f.a[k]>=19.95);
const LB_COST=150000; /* v1.91.26 (Man): limit-break training should cost a lot */
function lbBlock(G,f){if(!G.region)return "บทศึกชิงเจ้าสี่ภาคยังไม่เปิด";if(stCap(f)>=LB_CAP)return "ทะลุขีดจำกัดแล้ว";if(!lbFull(f))return "ค่าพลังต้องเต็ม 20 ทุกช่อง";
  if((f.lvl||1)<20)return "ต้อง Lv.20 ขึ้นไป";if(isAway(G,f.id))return "ยังไม่อยู่ค่าย";if(f.injury)return "รอหายเจ็บก่อน";
  if(G.bookings.some(b=>(b.a===f.id||b.b===f.id)&&b.week>=G.week&&b.week<=G.week+2))return "มีไฟต์ในอีก 2 สัปดาห์ ยกเลิกหรือชกให้จบก่อน";
  const T=G.region.trip;if(T&&T.abs!=null&&T.abs-absWeek(G)<=2)return "ทั้งค่ายมีทริปภาคในอีก 2 สัปดาห์";if(G.cash<LB_COST)return `เงินไม่พอ · ต้องใช้ ${fmt(LB_COST)}`;return "";}
function lbCardHTML(f){if(!G.region||f.camp!=="player")return "";
  if(isAway(G,f.id)&&f.lbTrip)return `<div class="lbcard"><h4>✦ กำลังฝึกวิชา</h4><p class="meta">${esc(f.name)}กลับค่ายอีก ${awayLeft(G,f.id)} สัปดาห์ · ไม่ซ้อม ไม่รับไฟต์</p></div>`;
  if(stCap(f)>=LB_CAP||!lbFull(f))return "";const why=lbBlock(G,f);
  return `<div class="lbcard"><h4>✦ ทะลุขีดจำกัด</h4><p class="meta">ค่าพลังเต็ม 20 ทุกช่องแล้ว · ไปฝึกวิชานอกค่าย 2 สัปดาห์ (ไม่ซ้อม ไม่รับไฟต์) แล้วขีดจำกัดค่าพลังจะขึ้นเป็น ${LB_CAP}</p>
    <p class="meta">ค่าครู ค่าที่พัก ค่ากิน ค่าเดินทาง รวม <b class="goldt">${fmt(LB_COST)}</b></p>
    <p class="meta">ส่วนที่เกิน 20 โตช้ากว่าปกติ ต้องซ้อมกันอีกนาน</p>${why?`<p class="meta redt">${why}</p>`:""}<button class="btn primary" data-act="lbgo" data-v="${f.id}" ${why?"disabled":""}>ส่งไปฝึกวิชา ▸</button></div>`;}
const LB_GO={
 kati:[{n:"coach",t:"กะทิ ค่าพลังเต็มทุกช่องแล้ว ซ้อมที่ค่ายต่อก็ได้แค่รักษาไว้"},{n:"coach",t:"ครูรู้จักหลวงตารูปหนึ่งที่วัดบนดอยแถวอมก๋อย สมัยหนุ่มท่านเคยชกกับปู่ชัย ไปอยู่กับท่านสองสัปดาห์"},
  {n:"kati",f:"sad",t:"สองสัปดาห์… หนูไม่เคยห่างค่ายนานขนาดนั้นเลยค่ะ"}],
 mali:[{n:"coach",t:"มะลิ ค่าพลังเต็มทุกช่องแล้ว ที่ไชยามีครูมวยรุ่นเก่าที่ยังสอนย่างสามขุมแบบดั้งเดิมอยู่"},{n:"mali",f:"happy",t:"กลับไชยาเหรอคะ~ ยายต้องดีใจแน่ ๆ แต่มะลิจะคิดถึงทุกคนนะ!"}],
 rin:[{n:"coach",t:"ริน ตัวเลขของเธอสุดแล้ว ซ้อมแบบเดิมไม่ขึ้นอีก"},{n:"rin",f:"happy",t:"ฉันรู้ค่ะ และวางแผนไว้แล้ว กรุงเทพฯ สองสัปดาห์ ที่ค่ายที่ฉันโดนน็อกตอนอายุสิบเก้า"},
  {n:"rin",f:"sad",t:"ฉันจะขึ้นเวทีเดิมอีกครั้ง …ตัวแปรเดียวที่ฉันยังไม่เคยแก้"}],
 ploy:[{n:"coach",t:"พลอย ค่าพลังเต็มทุกช่องแล้ว กลับไปโคราชสักสองสัปดาห์ไหม ครูโทรคุยกับพ่อเธอแล้ว"},{n:"ploy",f:"pout",t:"ไม่ได้อยากกลับหรอก …แต่พ่อโทรมาถามทุกอาทิตย์ว่าลูกยังวิ่งขึ้นเขาไหวไหม"}],
 fah:[{n:"coach",t:"ฟ้า ค่าพลังเต็มทุกช่องแล้ว อยากไปฝึกที่ไหนสักสองสัปดาห์ไหม"},{n:"fah",f:"happy",t:"ดอยอินทนนท์! ฟ้าจะวิ่งขึ้นยอดทุกเช้า ไม่มีใครตามทันแน่นอน!"}]};
const LB_BACK={
 kati:[{n:"nar",t:"สองสัปดาห์ต่อมา กะทิเดินกลับเข้าค่ายตอนเช้ามืด ผิวคล้ำขึ้น มือพันผ้าขาวเก่า ๆ"},{n:"kati",f:"happy",t:"หลวงตาให้หนูตักน้ำขึ้นดอยวันละร้อยเที่ยว ไม่ได้ต่อยกระสอบเลยสักวันค่ะ"},
  {n:"kati",f:"sad",t:"วันสุดท้ายท่านบอกว่าปู่ชัยไม่ได้สอนหนูไม่ครบหรอก ท่าสุดท้ายปู่เก็บไว้ให้หนูหาเอง"},{n:"coach",t:"แล้วเจอหรือยัง"},{n:"kati",f:"happy",t:"ยังค่ะ แต่หนูรู้แล้วว่ามันไม่ได้อยู่ที่ยี่สิบ"}],
 mali:[{n:"nar",t:"มะลิกลับมาพร้อมกล่องโฟมใบใหญ่ ยายทำขนมจีนแกงไตปลาฝากมาทั้งค่าย"},{n:"mali",f:"happy",t:"ครูเฒ่าให้มะลิเดินย่างสามขุมบนคันนาทุกวัน จนวันสุดท้ายไม่ตกลงไปในโคลนเลยสักครั้ง~"},
  {n:"mali",f:"happy",t:"ตอนนี้มะลิเดินเข้าหาคู่ชกได้โดยไม่ต้องคิดแล้ว ขาไปเองเลยค่ะ!"}],
 rin:[{n:"nar",t:"รินกลับมาพร้อมสมุดเล่มใหม่ ทุกหน้าว่างเปล่า"},{n:"rin",f:"happy",t:"ฉันขึ้นเวทีเดิมแล้วค่ะ ครั้งนี้ไม่ได้นับอะไรเลย แค่ชก"},
  {n:"rin",f:"flustered",t:"ผลการทดลอง: ความกลัวลดลงประมาณเก้าสิบเปอร์เซ็นต์ …อีกสิบเปอร์เซ็นต์ฉันจะเก็บไว้เตือนตัวเอง"}],
 ploy:[{n:"nar",t:"พลอยกลับมาด้วยรองเท้าวิ่งคู่ใหม่ คู่เก่าพังคาเขา"},{n:"ploy",f:"happy",t:"พ่อจับเวลาวิ่งขึ้นเขาทุกวัน วันสุดท้ายฉันชนะสถิติที่พ่อทำไว้ตอนหนุ่ม"},
  {n:"ploy",f:"flustered",t:"พ่อไม่ได้ชมหรอก …แค่ลบชื่อตัวเองออกจากกระดานแล้วเขียนชื่อฉันแทน"}],
 fah:[{n:"nar",t:"ฟ้ากลับมาพร้อมกาแฟดอยสิบถุง"},{n:"fah",f:"happy",t:"ฟ้าวิ่งขึ้นยอดดอยสิบสี่รอบ! รอบสุดท้ายเห็นพระอาทิตย์ขึ้นอยู่คนเดียว"},
  {n:"fah",f:"sad",t:"…แล้วก็คิดถึงค่ายมากเลย ห้ามบอกใครนะ"},{n:"fah",f:"happy",t:"กาแฟนี่ฝากทุกคน! ผู้จัดการจ่ายคืนด้วยนะ!"}]};
const lbGo=(f)=>LB_GO[f.id]||[{n:"coach",t:`${f.name}ค่าพลังเต็มทุกช่องแล้ว ครูจะส่งไปฝึกกับครูมวยเก่าที่ครูรู้จักสองสัปดาห์`}];
const lbBack=(f)=>LB_BACK[f.id]||[{n:"nar",t:`${f.name}กลับมาจากการฝึกสองสัปดาห์ สายตานิ่งกว่าเดิม`},{n:"coach",t:"ไม่ต้องเล่า ครูเห็นจากวิธีเดินก็รู้แล้ว"}];
function lbStart(G,id){const f=G.F[id];if(!f||lbBlock(G,f))return;const who=LB_GO[id]?id:"coach";
  playScene([...lbGo(f).map(x=>({l:"casual",...x})),{n:"nar",t:`ให้${f.name}ไปฝึกวิชา 2 สัปดาห์ไหม?`,choice:[
    {t:`ไปเถอะ ค่ายรอได้ (${fmt(LB_COST)})`,fx:G2=>{if(G2.cash<LB_COST)return;G2.cash-=LB_COST;sendAway(G2,id,2,"train");G2.F[id].lbTrip=1;G2.log.push(`${f.name}ออกไปฝึกวิชานอกค่าย 2 สัปดาห์ · จ่าย ${fmt(LB_COST)}`);},then:[{n:who==="coach"?"coach":id,f:"happy",l:"casual",t:"แล้วเจอกันอีกสองสัปดาห์!"}]},
    {t:"ยังก่อน",then:[{n:"coach",t:"ได้ ครูไม่รีบ พร้อมเมื่อไรก็บอก"}]}]}],()=>{save();render();},{bg:"camp",look:"casual"});}
/* weekly: the homecoming, else the first time someone hits the ceiling Kru Daeng points it out */
function lbWeek(G,done){const R=roster(G).concat(Object.values(G.F).filter(f=>f.lbTrip&&f.camp==="player"&&!roster(G).includes(f)));
  const back=R.find(f=>f.lbTrip&&!isAway(G,f.id));
  if(back){playScene([...lbBack(back).map(x=>({l:"casual",...x})),{fx:G2=>{const f=G2.F[back.id];f.cap=LB_CAP;f.potential=Math.max(f.potential||14,LB_CAP);f.lbTrip=0;f.awayBack=true;
      for(const [k] of ATTRS)f.a[k]=Math.min(LB_CAP,f.a[k]+.2);f.morale=Math.min(100,(f.morale||0)+10);G2.log.push(`${f.name} ทะลุขีดจำกัด · ขีดจำกัดค่าพลัง 20 → ${LB_CAP}`);}},
    {n:"nar",t:`${back.name}ทะลุขีดจำกัด · ขีดจำกัดค่าพลัง 20 → ${LB_CAP} · ค่าพลังทุกช่อง +0.2 · กำลังใจ +10`}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  const ready=roster(G).find(f=>!f.lbNote&&stCap(f)<LB_CAP&&lbFull(f)&&(f.lvl||1)>=20);
  if(ready){ready.lbNote=1;playScene([{n:"coach",t:`ผู้จัดการ ${ready.name}ซ้อมยังไงค่าพลังก็ไม่ขึ้นแล้ว เต็ม 20 ทุกช่อง`},{n:"coach",t:"ครูมีทางหนึ่ง ไปดูที่หน้าค่าพลังของเธอสิ"},
    {n:"nar",t:"ปลดล็อก: ทะลุขีดจำกัด · ดูได้ที่หน้านักมวย › ค่าพลัง"}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  return false;}
/* ---------- v1.90 round 10: the Naka League team (names locked 18 Nov 2026 — see project doc claude/naka-league-team.md) ----------
   "Naka" is the family name of Krerk and Ladda only; the four team members are hired fighters from other disciplines.
   shape = stat offsets from the fitted level · grap/sub = takedown / submission game (0–20) · nlsk = the three skills the AI fires
   spl = special sheets (code effects if none) · td:1 = the throw sheet that plays on a takedown */
const NL={
 nia:{name:"ไนอา โอคาฟอร์",nick:"จังหวะกลองดำ",art:"มวยสากล",col:"#3a7bd5",sprite:"nl_nia",sty:"pressure",
  shape:{punch:3,kick:-6,knee:-5,elbow:-5,clinch:-4,guard:2,foot:3,counter:3,speed:2,iq:1},grap:0,sub:0,pfx:{dmg:{punch:.12},ctr:.04,evade:.02},
  nlsk:[{id:"nl_peek",name:"พีกอะบู",k:"def"},{id:"nl_liver",name:"ลิเวอร์ช็อต",k:"atk",w:"punch"},{id:"nl_dempsey",name:"เดมป์ซีย์โรล",k:"atk",w:"punch"}],
  spl:[{img:"nl_nia_special",w:"punch",def:"เดมป์ซีย์โรล",npc:1,p:.5}],tip:"หมัดไวและสวนเก่ง แต่ไม่เคยรับลูกเตะกับเข่า"},
 varya:{name:"วาร์ยา โซโคโลวา",nick:"หมีแดง",art:"แซมโบ้ + MMA",col:"#d43a3a",sprite:"nl_varya",sty:"inside",
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["ดับเบิลเลก","ทุ่มสะโพก","ซูเพล็กซ์"],subName:["ฮีลฮุก","นีบาร์"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"ดับเบิลเลก",k:"td"},{id:"nl_suplex",name:"ซูเพล็กซ์",k:"td"},{id:"nl_heelhook",name:"ฮีลฮุก",k:"sub"}],
  spl:[{img:"nl_varya_special",def:"ซูเพล็กซ์",td:1}],tip:"ทุ่มแรงและล็อกขาเก่ง · ถ้าดึงลงพื้นได้จะทุบไม่หยุด"},
 meili:{name:"เหม่ยลี่ แซ่ตั้ง",nick:"มังกรเยาวราช",art:"กังฟู",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"เตะไร้เงา",k:"atk",w:"kick"},{id:"nl_inch",name:"หมัดหนึ่งนิ้ว",k:"atk",w:"punch"},{id:"nl_crane",name:"ท่ากระเรียน",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"เตะไร้เงา",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"หมัดหนึ่งนิ้ว",npc:1,p:.5}],tip:"เตะเร็วและไกล · เข้าวงในแล้วเหลือแค่ครึ่งตัว"},
 rosa:{name:"Corazón Rosa",nick:"หัวใจสีชมพู",art:"ลูชาลิเบร",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["เฮอริคานรานา","ดีดีที"],subName:["ลามิสติกา"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"เฮอริคานรานา",k:"td"},{id:"nl_mistica",name:"ลามิสติกา",k:"sub"},{id:"nl_moonsault",name:"มูนซอลต์",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"เฮอริคานรานา",td:1}],tip:"อึดและทนมาก ชอบทุ่มโชว์คนดู · การ์ดเปิดบ่อย"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"ลดา",nick:"เครื่องจักรสังหารแห่งมวยหญิง",art:"MMA + มวยไทยสมัยใหม่",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["ดับเบิลเลก","จับขาล้ม"],subName:["รัดคอจากด้านหลัง","กิโยติน"],pfx:{dmg:{elbow:.1},gnp:.15},
  nlsk:[{id:"nl_ld_double",name:"ดับเบิลเลก",k:"td"},{id:"nl_ld_superman",name:"ซูเปอร์แมนพันช์",k:"atk",w:"punch"},{id:"nl_ld_rnc",name:"รัดคอจากด้านหลัง",k:"sub"}],
  phases:[{n:1,fst:"power",sprite:"nl_ladda_hood",dmg:1.18,hit:-.01,ini:-1,say:"ลดาดึงฮู้ดลงปิดครึ่งหน้า ยืนนิ่งไม่ขยับ… ทุกหมัดที่ออกมาหนักเหมือนค้อน"},
   {n:2,fst:"read",fall:"footwork",sprite:"nl_ladda",dmg:1,hit:.05,ini:3,ev:.04,say:"ลดาสะบัดฮู้ดทิ้ง ผมขาวปลายแดงสยายออกมา — ความเร็วเปลี่ยนไปทันที!"},
   {n:3,fst:"pressure",lvUp:1,sprite:"nl_ladda_blood",dmg:1.3,hit:.08,ini:4,ev:.03,self:5,blood:1,say:"ลดาต่อยหน้าตัวเองสองหมัด — วิชาแพทย์ของนาคากระตุ้นเลือด! ตัวแดง ตาแดงก่ำ… โหมดเลือดเดือด!"}],
  spl:[{img:"nl_ladda_sp_superman",w:"punch",def:"ซูเปอร์แมนพันช์",npc:1,p:.55,ph:1},{img:"nl_ladda_sp_headkick",w:"kick",def:"เฮดคิก",npc:1,p:.55,ph:1},
   {img:"nl_ladda_sp_spinkick",w:"kick",def:"สปินนิงแบ็กคิก",npc:1,p:.55,ph:2},{img:"nl_ladda_sp_backfist",w:"punch",def:"สปินนิงแบ็กฟิสต์",npc:1,p:.55,ph:2},
   {img:"nl_ladda_sp_bloodfist",w:"punch",def:"หมัดโลหิตนาคา",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodkick",w:"kick",def:"สปินนิงวีลคิก",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodslam",def:"ทุ่มเลือดเดือด",td:1,ph:3},{img:"nl_ladda_sp_awaken",def:"โหมดเลือดเดือด",awaken:1,ph:3}],
  tip:"เปลี่ยนร่างระหว่างไฟต์ · ยก 1–2 คลุมฮู้ดหนักแน่น · ยก 3–4 ถอดฮู้ดเร็วมาก · ยก 5 โหมดเลือดเดือด"}};
const NL_ORDER=["nia","varya","meili","rosa","ladda"];
/* build (or refresh) a team member sized against `me`: she wins about `p` of 5-round bouts, never above the ceiling `ceil` */
function nlFighter(G,k,me,p,ceil,leg){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
  if(D.sprite)f.sprite=D.sprite;f.fatigue=0;f.injury=0;f.morale=75;f.lvl=Math.max(me&&me.lvl||1,1)+(k==="ladda"?9:NL_ORDER.indexOf(k)<2?7:8)/* v1.90.20 (Man): members +7–8, Ladda +9 (+10 in blood mode) — the label only, strength comes from the fit */;
  const setT=T=>{f.vet=0;for(const [a] of ATTRS)f.a[a]=Math.max(1,Math.min(20,T-.6+(D.shape[a]||0)));liftOpponent(f,T,20);};
  {const T=RG_FIX.nl[k]+(leg?(k==="ladda"?LEG_UP.l:LEG_UP.n):0);setT(T);f.nlT=T;}if(leg)f.lvl+=2;f.leg=!!leg;return f;} /* v1.90.21: fixed strength (p and ceil kept only for the old dev calls) */
function nlTest(k){const me=roster(G).filter(f=>!isAway(G,f.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(!me)return;
  const o=nlFighter(G,k,me,k==="ladda"?.25:.4,RG_LADDER.champ(3,0)+(k==="ladda"?.5:0));
  const b={id:"nltest"+Date.now(),a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",nltest:1};G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);save();render();});}
/* ===================== round 11: cups 2–3 story, the closing ceremony, the underground final (v1.91.20) ===================== */
const RG_DEAL_CASH=200000;
/* the week after the second cup: dinner with Khun Krerk */
function rgCup2(G){const R=G.region,rin=rgIn(G,"rin");return [
 {n:"nar",bg:"camp",t:"บัตรเชิญสีทองมาถึงค่าย คุณเกริกขอเลี้ยงข้าวผู้จัดการแบบสองต่อสอง ที่ห้องอาหารชั้นบนสุดของตึกนาคาเอเนอร์จี้"},
 {n:"nar",bg:"krerk_dinner",show:[{id:"npc:krerk"}],t:"โต๊ะยาวนั่งได้ยี่สิบคน แต่วางจานไว้แค่สองชุด กระจกรอบห้องมองเห็นกรุงเทพฯ ทั้งเมือง"},
 {n:"npc",who:"คุณเกริก",t:"ได้ถ้วยสองใบในศึกเดียว ค่ายเล็กแบบนี้ผมไม่เห็นมานานแล้วครับ"},
 {n:"npc",who:"คุณเกริก",t:"ผมเองก็เคยชกครับ ทีมชาติ ปีนั้นตั๋วโอลิมปิกอยู่ในมือแล้ว"},
 {n:"npc",who:"คุณเกริก",t:"สามสัปดาห์ก่อนเดินทาง รถตู้ของทีมเสียหลักกลางถนน เข่าผมแตกสามชิ้น หมอบอกว่าเดินได้ก็บุญแล้ว"},
 {n:"npc",who:"คุณเกริก",t:"ไม่มีใครผิดครับ ฝนตก ถนนลื่น… มันคือโชค แค่นั้นเอง"},
 {n:"npc",who:"คุณเกริก",t:"ตั้งแต่วันนั้นผมสัญญากับตัวเองว่า จะไม่ยอมให้โชคตัดสินชีวิตนักมวยคนไหนอีก เงิน ข้อมูล วิทยาศาสตร์ ผมจะคุมทุกอย่างเอง"},
 {n:"nar",t:"เขาเลื่อนแฟ้มสีเขียวทองมาตรงหน้า บนปกเขียนว่า \"สัญญาพันธมิตร\""},
 {n:"npc",who:"คุณเกริก",t:`ผมอยากเป็นพันธมิตรกับค่ายศิริชัยครับ ${fmt(RG_DEAL_CASH)} วันนี้เลย แลกกับสิทธิ์เป็นตัวแทนดูแลนักมวยของคุณ ตั้งแต่ข้าวทุกมื้อ ไปจนถึงข้อมูลทุกหมัด`},
 {n:"nar",t:"แฟ้มสีเขียวทองวางอยู่ตรงหน้า",choice:[
   {t:"รับไว้",fx:G2=>{G2.region.c2="deal";G2.cash+=RG_DEAL_CASH;},then:[
     {n:"npc",who:"คุณเกริก",t:"ตัดสินใจได้ดีครับ ผมจะดูแลค่ายศิริชัยให้ดีที่สุด"},
     rin?{n:"rin",f:"sad",l:"casual",t:"…ขอรินอ่านสัญญาก่อนเซ็นนะคะ อย่างน้อยรินจะได้รู้ว่าเราเพิ่งขายอะไรไป"}:{n:"coach",t:"เงินก้อนโตขนาดนี้ ข้าไม่เคยเห็นใครให้ฟรี ๆ หรอกนะ"}]},
   {t:"ขอคิดดูก่อน",fx:G2=>{G2.region.c2="later";},then:[
     {n:"npc",who:"คุณเกริก",t:"ได้เลยครับ ประตูผมเปิดไว้เสมอ"}]},
   {t:"ปฏิเสธ",fx:G2=>{G2.region.c2="no";},then:[
     {n:"npc",who:"คุณเกริก",t:"เสียดายครับ… แต่ผมเคารพ"},
     {n:"nar",t:"เขายังยิ้มเหมือนเดิม แต่มือที่ดึงแฟ้มกลับไปกำแน่นจนข้อนิ้วขาว"}]}]},
 {n:"nar",t:"ระหว่างรอลิฟต์ลง ประตูลิฟต์ฝั่งตรงข้ามกำลังปิด ในลิฟต์มีผู้หญิงผมขาวปลายแดงยืนอยู่คนเดียว ประตูปิดก่อนจะเห็นหน้าชัด"},
 {fx:()=>{R.c2=R.c2||"later";}}];}
/* the week after the third cup: Pailin "forgets" a tablet */
function rgCup3(G){const R=G.region,rin=rgIn(G,"rin"),ploy=rgIn(G,"ploy"),kati=rgIn(G,"kati");return [
 {n:"nar",bg:"camp",t:"คืนฝนตก ไพลินยืนอยู่หน้าประตูค่าย ไม่ได้กางร่ม"},
 {n:"pailin",f:"sad",t:"ฉันไม่ได้มาหาใครนะ แค่ผ่านมา"},
 {n:"nar",t:"เธอยื่นแท็บเล็ตของเวกเตอร์มาให้ หน้าจอเปิดค้างไว้สามไฟล์"},
 {n:"nar",t:"ไฟล์แรกคือร่างสัญญานาคาลีกฉบับเต็ม ไฟล์ที่สองคือสลิปโอนเงินจากนาคาเอเนอร์จี้เข้าบัญชีเวกเตอร์ทุกเดือนตั้งแต่ปีก่อน ไฟล์ที่สามเป็นคลิปวิดีโอ"},
 {n:"nar",bg:"naka_lab",t:"ในคลิป ผู้หญิงสี่คนจากศาสตร์ต่างกันซ้อมอยู่บนเบาะ มวยสากล แซมโบ้ กังฟู มวยปล้ำลูชา และคนที่ห้าใส่ฮู้ดขาว จับคู่ซ้อมล้มทีละคน"},
 {n:"pailin",f:"sad",t:"ทุนวิจัย ค่าแล็บ ค่าอุปกรณ์… ฉันคิดว่าเขาให้เพราะเชื่อในวิทยาศาสตร์การกีฬาเหมือนฉัน"},
 {n:"pailin",f:"sad",t:"แต่เขาเอาข้อมูลทุกไฟต์ที่ฉันเก็บ ไปสร้างคนคนนั้น"},
 ...rgIf(ploy,[{n:"ploy",f:"sad",l:"casual",t:"พี่…"},{n:"pailin",f:"sad",t:"ไม่ต้องพูดอะไร พลอย พี่รู้ว่าพี่โง่"},{n:"ploy",l:"casual",t:"พี่ไม่ได้โง่ พี่แค่เชื่อคนผิด…ครั้งเดียว"}]),
 rin?{n:"rin",f:"sad",l:"casual",t:"ข้อ 14.3 ของสัญญานาคาลีก ครอบคลุมข้อมูลที่ได้มาจากเวกเตอร์ด้วยค่ะ แปลว่าข้อมูลของทุกค่ายที่เวกเตอร์เคยชกด้วย"}:{n:"coach",t:"ข้อมูลของทุกค่ายที่เวกเตอร์เคยชกด้วย… อยู่ในมือนาคาหมดแล้วสินะ"},
 {n:"coach",bg:"camp",t:"รวมค่ายเราด้วย"},
 /* v1.91.23 (Man): the money behind Phayak Thong is Krerk's — revealed on the same tablet */
 {n:"nar",t:"ท้ายร่างสัญญามีภาคผนวกอีกหนึ่งหน้า หัวกระดาษเขียนว่า \"ค่ายในเครือนาคาเอเนอร์จี้\" ชื่อแรกคือเวกเตอร์ ชื่อที่สองคือค่ายพยัคฆ์ทอง เชียงใหม่"},
 {n:"nar",t:"ช่องวันที่เริ่มถือหุ้นของพยัคฆ์ทอง ตรงกับเดือนที่ปู่ชัยจากไป"},
 {n:"pailin",f:"sad",t:"หน้านี้ฉันไม่เคยเปิดเลย… ฉันเซ็นแค่หน้าที่มีชื่อเวกเตอร์"},
 ...rgIf(ploy,[{n:"ploy",f:"angry",l:"casual",t:"ผ้าพันมือสปอนเซอร์ที่ค่ายบังคับให้พี่ใช้มาตลอด… ลายตรงข้อมือนั่นคือหางนาค"}]),
 ...rgIf(rin,[{n:"rin",f:"sad",l:"casual",t:"ปีที่เถ้าแก่สั่งให้น้องที่เจ็บขึ้นชก… เป้าผลงานที่เขาเอามากดดันทุกคน มีคนส่งมาให้เขาอีกทีค่ะ"}]),
 {n:"coach",t:"พอปู่ชัยไม่อยู่ เด็กเราย้ายไปพยัคฆ์ทองหมดภายในปีเดียว… ข้านึกมาตลอดว่าเป็นเรื่องเงินธรรมดา"},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"หนูนึกว่าทุกคนแค่ไม่อยากอยู่ค่ายร้าง… ที่แท้มีคนอยากให้ค่ายของปู่ร้างตั้งแต่แรก"}]),
 {n:"nar",t:"ผู้จัดการนึกถึงคำพูดบนโต๊ะอาหารชั้นบนสุดของตึกนาคา \"ค่ายเล็กแบบนี้ผมไม่เห็นมานานแล้วครับ\" …เขาเห็นมาตลอด"},
 R.c2==="deal"?{n:"coach",t:"แล้วแฟ้มสีเขียวทองที่เราเซ็นไป… ตอนนี้ชื่อค่ายเราก็อยู่ในหน้านั้นด้วย"}:{n:"coach",t:"แฟ้มสีเขียวทองที่เขายื่นให้ผู้จัดการ… ก็คือรอบที่สองของเรื่องเดิม"},
 {n:"pailin",t:"ฉันไม่ได้มาเตือนพวกเธอนะ แค่ลืมแท็บเล็ตไว้ตรงนี้ เดี๋ยวพรุ่งนี้ค่อยส่งคืนก็ได้"},
 {n:"nar",t:"ไพลินเดินกลับไปในสายฝน ไม่หันมาอีกเลย"},
 {fx:()=>{R.c3="seen";}}];}
/* who in the camp the regional champion likes best: the one who says the camp's name at the ceremony */
const RG_CLOSE_SAY={baibua:"ค่ายเล็กก็ยืนได้เจ้า หนูเห็นมากับตา ค่ายศิริชัยไงเจ้า",tabtim:"ค่ายศิริชัยบ่มีเงินมาก แต่ชกให้กันจนสุดใจ ทับทิมเห็นมาแล้วเด้อ",
 alicia:"ฉันอยากชกแบบค่ายศิริชัยค่ะ ที่ที่ไม่มีใครขอให้ฉันยิ้มให้กล้อง",chaba:"…อยากอยู่ค่ายที่ซ่อมรั้วกันเอง"};
/* after the fourth cup (or once the tournament has run its course): Naka League, the refusals, Ladda */
function rgClose(G){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin");
 const fav=["baibua","tabtim","alicia","chaba"].sort((a,b)=>((R.meet||{})[b]||0)-((R.meet||{})[a]||0))[0];
 return [
 {n:"nar",bg:"closing_ceremony",show:[{id:"npc:krerk"}],t:"พิธีปิดศึกชิงเจ้าสี่ภาคจัดที่กรุงเทพฯ ห้องโถงเต็มไปด้วยไฟเขียวทอง บนเวทีมีโต๊ะยาว ปากกาทองวางเรียงไว้สี่ด้าม"},
 {n:"npc",who:"คุณเกริก",t:"ขอบคุณทุกค่ายครับ ศึกครั้งนี้ทำให้ผมมั่นใจเรื่องหนึ่ง มวยไทยต้องไปไกลกว่าเวทีงานวัด"},
 {n:"npc",who:"คุณเกริก",t:"ขอเปิดตัว… นาคาลีก! ลีกต่อสู้ครบวงจรแห่งแรกของประเทศ มวยไทย มวยสากล MMA ทุกศาสตร์บนเวทีเดียว"},
 {n:"npc",who:"คุณเกริก",t:"และนักสู้สี่คนแรกที่ผมอยากเชิญ คือแชมป์ทั้งสี่ภาคครับ เชิญขึ้นมาเซ็นสัญญาบนเวทีเลยครับ"},
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"ใบบัว ทับทิม อลิเซีย และชบาเดินขึ้นเวที แต่ไม่มีใครหยิบปากกา"},
 {n:"baibua",f:"sad",l:"fight",t:"ขอบคุณเจ้า… แต่หนูบ่เซ็นเจ้า ค่ายบัวท่าเสายังมีหนูอยู่"},
 {n:"tabtim",l:"fight",t:"ทับทิมกะบ่เซ็นเด้อ น้องชายทับทิมอ่านข้อสิบสี่ให้ฟังแล้ว"},
 {n:"alicia",l:"fight",t:"ฉันบอกไปแล้วว่าจะไม่เซ็นอะไรที่มีคำว่า \"ตลอดไป\" ค่ะ"},
 {n:"chaba",l:"fight",t:"…ม่ายเซ็น"},
 {n:fav,f:"happy",l:"fight",t:RG_CLOSE_SAY[fav]},
 fah?{n:"fah",f:"flustered",l:"casual",t:"ได้ยินไหมลุง! ไม่มีใครเอาลีกของลุงหรอก!"}:{n:"coach",t:"ได้ยินไหมคุณเกริก ไม่มีใครเอาลีกของคุณหรอก"},
 {n:"pailin",t:"และค่ายเวกเตอร์ขอถอนตัวจากการเป็นพันธมิตรนาคาลีก ตั้งแต่วินาทีนี้ค่ะ"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"ทั้งห้องเงียบ ทุกสายตาหันไปที่คุณเกริก"},
 {n:"npc",who:"คุณเกริก",t:"…ไม่เป็นไรครับ งั้นให้ลูกสาวผมแนะนำตัวเองแทนก็แล้วกัน"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"ผู้หญิงใส่ฮู้ดขาวเดินขึ้นเวที ถอดฮู้ดออก ผมยาวสีขาวปลายแดงตกลงกลางหลัง"},
 {n:"lada",l:"casual",t:"ลดา นาคา"},
 {n:"lada",l:"casual",t:"อยากรู้ว่าแชมป์สี่ภาคเก่งแค่ไหน ขึ้นมาทีละคน ตรงนี้ เดี๋ยวนี้"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"baibua",l:"fight"}],t:"ไม่มีใครทันห้าม ใบบัวเข้าไปก่อน ศอกกลับหลังของเธอเฉียดคางลดาไปไม่กี่มิล ลดาสวนศอกแล้วรวบเอวทุ่มลงพื้นเวทีในจังหวะเดียว"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"tabtim",l:"fight"}],t:"ทับทิมกระโดดเตะ ลดาปิดระยะก่อนขาจะเหยียดสุด คว้าขาข้างที่ยืนแล้วดึงล้ม"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"alicia",l:"fight"}],t:"อลิเซียออกหมัดชุด ลดาก้มหลบทุกหมัด อ้อมไปด้านหลังแล้วรัดคอ อลิเซียตบพื้นในห้าวินาที"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"chaba",l:"fight"}],t:"ชบาบุกกดดันไม่ถอยเลยสักก้าว ลดาปล่อยให้ดันเข้ามาจนติดเชือก แล้วใช้แรงนั้นเองดึงชบาลงพื้น"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"เลือดซึมจากมุมปากลดา ตรงที่ศอกใบบัวเฉียด เธอแตะมันด้วยปลายนิ้ว แล้วยิ้มเป็นครั้งแรก"},
 {n:"lada",l:"casual",t:"…สนุกดี"},
 fah?{n:"fah",f:"sad",l:"casual",t:"นั่นมัน… มวยสมัยใหม่ เหมือนฟ้าเลย"}:{n:"coach",t:"นั่นไม่ใช่มวยไทยอย่างเดียว… นั่นมันทุกอย่างรวมกัน"},
 {n:"npc",who:"คุณเกริก",t:"ขอบคุณที่มาร่วมงานครับทุกท่าน"},
 {n:"nar",bg:"camp",show:[],t:"สามวันต่อมา การ์ดสีดำไม่มีโลโก้มาถึงค่าย"},
 {n:"nar",t:"\"ขอเชิญค่ายศิริชัย ห้าต่อห้า · โกดังโรงงานเครื่องดื่มเก่า ท่าเรือคลองเตย · กติกาเปิด ทุ่มได้ ล็อกได้ · ไม่มีรางวัล ไม่มีสื่อ\""},
 {n:"nar",t:"ด้านหลังการ์ดเขียนด้วยลายมือ: \"แค่อยากรู้ว่ามวยไทยค่ายเล็กของคุณรับมือโลกจริงได้แค่ไหน — ล.\""},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"flustered",l:"casual",t:"ผู้จัดการคะ สัญญาพันธมิตรที่เรารับเงินมา ข้อ 30 เขียนว่า \"หากนาคาลีกแพ้ให้แก่ค่ายคู่สัญญา ให้สัญญานี้สิ้นสุดทันที\""}:{n:"coach",t:"สัญญาพันธมิตรที่เรารับเงินมา ข้อ 30 เขียนว่าถ้านาคาลีกแพ้ค่ายเรา สัญญาจบทันที…"},
   {n:"coach",t:"เขามั่นใจขนาดนั้นเชียว ถึงกล้าเขียนข้อนี้ไว้"}]),
 {n:"coach",t:"ทุ่มได้ ล็อกได้… พวกเราไม่เคยซ้อมเรื่องพวกนี้เลยสักวัน"},
 {n:"coach",t:"มีเวลาสามสัปดาห์ ต้องเลือกว่าจะซ้อมรับมือแบบไหน เลือกได้ที่หน้าศึกชิงเจ้าสี่ภาค"}];}
const RG_FPREP={sprawl:{n:"กันทุ่ม",d:"ถีบขาหนีตอนโดนพุ่งจับ และกดคอตีเข่าสวนได้บ่อยขึ้น"},escape:{n:"หนีล็อก",d:"ดันตัวลุกจากพื้นและหลุดจากล็อกได้ดีขึ้น"},strike:{n:"ยืนแลก",d:"ไม่สนการทุ่ม ซ้อมออกอาวุธให้แม่นขึ้น จบก่อนโดนดึงลงพื้น"}};
function rgFinalIntro(G){const R=G.region,F=R.final;return [
 {n:"nar",bg:"naka_underground",t:F.tries?"โกดังเดิมริมท่าเรือคลองเตย ไฟสลัวเหมือนครั้งก่อน คนดูกลุ่มเดิมยังยืนเงียบอยู่ในเงามืด":"โกดังเก่าริมท่าเรือคลองเตย ไฟสลัว กลิ่นน้ำหวานบูดลอยมาจากถังเก่า กลางห้องมีเวทีเชือกสีดำ พื้นปูเบาะนุ่มแบบเวที MMA"},
 {n:"npc",who:"คุณเกริก",t:F.tries?"กลับมาอีกแล้วนะครับ ผมชอบความดื้อแบบนี้":"ยินดีต้อนรับครับ ไม่มีกล้อง ไม่มีสื่อ ไม่มีเงินรางวัล มีแค่คำถามข้อเดียว"},
 {n:"lada",l:"casual",t:"ห้านัด ชนะสามเอาไป ฉันชกนัดสุดท้าย"},
 {n:"coach",t:`จำไว้ทุกคน ซ้อมมาแบบ${RG_FPREP[F.prep||"strike"].n} ทำแบบที่ซ้อม อย่าเล่นตามเกมเขา`}];}
function rgFinalBetween(G,i,me,o,res,w,l){return [
 {n:"nar",t:`${res==="W"?`${me.name}ชนะ${o.name}`:res==="D"?`${me.name}เสมอกับ${o.name}`:`${o.name}ชนะ${me.name}`} · ศิริชัย ${w} – ${l} นาคาลีก`}];}
function rgFinalWin(G,w,l,beatLadda,ladFid){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),looked=ladFid==="fah"&&fah?"ฟ้า":"ผู้จัดการ";return [
 {n:"nar",bg:"naka_underground",t:`จบห้านัด ศิริชัย ${w} – ${l} นาคาลีก`},
 {n:"nar",show:[{id:"npc:krerk"}],t:"คุณเกริกปรบมือช้า ๆ อยู่บนระเบียงชั้นสอง เสียงปรบมือก้องไปทั้งโกดัง"},
 {n:"npc",who:"คุณเกริก",t:"ยินดีด้วยครับ ค่ายศิริชัย… วันนี้โชคเข้าข้างคุณ"},
 {n:"npc",who:"คุณเกริก",t:"แล้วพบกันในระดับประเทศนะครับ"},
 ...(beatLadda?[{n:"nar",show:[{id:"lada",l:"casual"}],t:"ลดาลุกขึ้นจากเบาะช้า ๆ เลียเลือดที่มุมปาก"},{n:"lada",l:"casual",t:"…สนุกดี"}]
  :[{n:"lada",l:"casual",t:"ชนะทีม แต่ยังไม่ได้ชนะฉัน"}]),
 {n:"nar",show:[{id:"lada",l:"casual"}],t:`ก่อนเดินตามพ่อออกไป ลดาหยุดมอง${looked}นานเกินไปหนึ่งจังหวะ แล้วดึงฮู้ดขึ้นคลุมหัว`},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"happy",l:"casual",t:"ข้อ 30 ค่ะ นาคาลีกแพ้ค่ายคู่สัญญา สัญญาสิ้นสุดทันที เงินเป็นของเรา ข้อมูลของเราก็เป็นของเราค่ะ"}:{n:"coach",t:"ข้อ 30… นาคาลีกแพ้ค่ายเรา สัญญาจบ เงินก็ยังเป็นของเรา ฮ่า!"}]),
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"ข้างเวที แชมป์ทั้งสี่ภาคยืนดูอยู่ตั้งแต่นัดแรก ไม่มีใครพูดอะไร แต่ทุกคนกำลังคิดเรื่องเดียวกัน"},
 {n:"coach",bg:"camp",show:[],t:"กลับบ้านกันเถอะ พรุ่งนี้เช้าตีห้าเหมือนเดิม"}];}
function rgFinalLose(G,w,l){return [
 {n:"nar",bg:"naka_underground",t:`จบห้านัด ศิริชัย ${w} – ${l} นาคาลีก`},
 {n:"npc",who:"คุณเกริก",t:"ไม่เป็นไรครับ ประตูยังเปิดอยู่ จะกลับมาเมื่อไหร่ก็ได้"},
 {n:"lada",l:"casual",t:"…ยังไม่พอ"},
 {n:"coach",t:"เจ็บแล้วจำ แล้วกลับมาใหม่"}];}
/* v1.91.23 (Man): the week after the underground final — Tiger Boss comes without an envelope (once per save) */
function rgTiger(G){const kati=rgIn(G,"kati"),ploy=rgIn(G,"ploy");return [
 {n:"nar",bg:"camp",show:[{id:"npc:tiger_boss"}],t:"รถเก๋งสีทองจอดหน้าค่ายเหมือนทุกครั้ง แต่คราวนี้เถ้าแก่เสือลงมาคนเดียว ไม่มีซองเงิน ไม่มีลูกน้องเดินตาม ซิการ์ในกระเป๋าเสื้อก็ไม่ได้หยิบออกมา"},
 {n:"npc",who:"เถ้าแก่เสือ",t:"ไม่ต้องตั้งการ์ดหรอก วันนี้ผมไม่ได้มาซื้อใคร"},
 {n:"npc",who:"เถ้าแก่เสือ",t:"เมื่อเช้านาคาส่งหนังสือมา ตัดเงินพยัคฆ์ทองทุกบาท งานเดียวที่คุณเกริกสั่งผมไว้ คือทำให้ค่ายศิริชัยปิด… ผมทำไม่สำเร็จ"},
 {n:"npc",who:"เถ้าแก่เสือ",t:"เงินทุกบาทตั้งแต่เดือนที่ปู่ชัยจากไป เป็นของเขา รถคันนี้ก็ด้วย ผมแค่ยืนอยู่หน้าป้าย"},
 {n:"coach",t:"แล้วที่แกมาดึงเด็กไปจากค่ายเราตอนนั้นล่ะ"},
 {n:"nar",show:[{id:"npc:tiger_boss_cry"}],t:"เถ้าแก่เสือหยิบซิการ์ออกมาจะจุด แล้วมันก็หล่นจากมือ เขาเอามือกุมหัว ร้องไห้ออกมาตรงหน้าประตูค่าย"},
 {n:"npc",who:"เถ้าแก่เสือ",img:"tiger_boss_cry",t:"…เขาสั่ง ผมก็ทำ ผมนึกว่าตัวเองเป็นเสือ ที่แท้ก็แค่ป้ายชื่อ"},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"เถ้าแก่คะ… พี่ ๆ ที่ย้ายไปตอนนั้น ยังชกอยู่ไหมคะ"},{n:"npc",who:"เถ้าแก่เสือ",img:"tiger_boss_cry",t:"ยังชกอยู่ทุกคน ผมเลี้ยงเด็กไม่เก่งก็จริง แต่ไม่เคยทิ้งเด็กสักคน"}]),
 ...rgIf(ploy,[{n:"ploy",l:"casual",t:"แล้วพยัคฆ์ทองจะเป็นยังไงต่อ"},{n:"npc",who:"เถ้าแก่เสือ",img:"tiger_boss_cry",t:"ต่อจากนี้ก็เดินด้วยเงินผมเอง เล็กลงหน่อย… แต่เป็นของผมจริง ๆ สักที"},{n:"ploy",f:"happy",l:"casual",t:"…พี่จะบอกรุ่นน้องเองว่าเถ้าแก่ไม่ได้หนีไปไหน"}]),
 {n:"npc",who:"เถ้าแก่เสือ",img:"tiger_boss_cry",t:"ปู่ชัยเคยบอกผมตั้งแต่หนุ่ม ๆ ว่าหมัดดีแต่ต้องใช้ให้ถูกที่ …ผมไม่เคยฟังเลย",choice:[
   {t:"ยื่นมือให้จับ",then:[{n:"nar",show:[{id:"npc:tiger_boss"}],t:"เถ้าแก่เสือเช็ดหน้าด้วยแขนเสื้อ มองมือนั้นนานจนคิดว่าจะไม่จับ แล้วก็จับ แน่นกว่าที่คิด"}]},
   {t:"\"เจอกันบนเวทีนะ\"",then:[{n:"npc",who:"เถ้าแก่เสือ",t:"ฮ่า! ได้ เด็กพยัคฆ์ทองจะรอ… คราวนี้ด้วยเงินผมเอง"}]},
   {t:"พยักหน้าเงียบ ๆ",then:[{n:"nar",t:"เถ้าแก่เสือเก็บซิการ์ขึ้นมาจากพื้น พยักหน้าตอบ แล้วหันหลังเดินไปที่รถ"}]}]},
 {n:"nar",t:"รถเก๋งสีทองถอยออกไปช้า ๆ เป็นครั้งแรกที่ไม่บีบแตรใส่หน้าค่าย"}];}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}rgApply(G);const now=gameWeek(G);if(lbWeek(G,done))return;
    /* v1.91.26 (Man): Kru Daeng reminds you to watch tape and train the counter before each regional title bout — no new buttons */
    for(const r of RG_ORDER){const c=R.champ[r],x=c&&c.next;if(!c||c.state!=="series"||!x||x.warned)continue;const left=x.abs-now;if(left<1||left>2)continue;
      const me=G.F[c.fid],cf=G.F[this.champId[r]];if(!me||!cf)continue;const tape=G.scoutAbs&&G.scoutAbs[cf.id]!=null&&now-G.scoutAbs[cf.id]<=8,ok=tape&&me.plan&&me.plan.preset===counterPreset(cf);x.warned=1;if(ok)continue;
      playScene([{n:"coach",t:`นัดชิงแชมป์ภาคอีก ${left} สัปดาห์ข้างหน้า: ${me.name} ปะทะ ${RG[r].champ} นัดที่ ${x.n||1}`},
        {n:"coach",t:(x.n||1)>1?`แชมป์ภาคไม่ชกแบบเดิมสองนัดหรอก ${tape?"เทปที่ดูไว้ยังใช้ได้ แต่ต้องซ้อมให้ตรงกับที่เห็น":"ไปดูเทปนัดล่าสุดของเขาก่อน"} แล้วซ้อมแก้ทางให้ตรง สัปดาห์ชกค่อยเปลี่ยนเป็นเตรียมไฟต์`
          :`แชมป์ภาคไม่ใช่คู่ชกงานวัด ${tape?"เทปก็ดูแล้ว":"ดูเทปเขาก่อน"} แล้วซ้อมแก้ทางให้ตรงกับที่เห็น สัปดาห์ชกค่อยเปลี่ยนเป็นเตรียมไฟต์ ซ้อมมาแบบนี้ ขึ้นเวทีไปจะได้เปรียบตั้งแต่ยกแรก`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}
    /* v1.91.28 round 12: a champion moves in · a camp girl notices a two-timing champion romance · a champion confesses */
    if(R.joinPend&&now>=R.joinPend.abs){const cid=R.joinPend.cid;delete R.joinPend;const S=this.joinSteps(G,cid),k=S.findIndex(x=>x.t==="สัปดาห์นี้ ค่ายศิริชัยมีสมาชิกใหม่");this.joinApply(G,cid);
      const B={baibua:"temple",tabtim:"night",alicia:"vector_lab",chaba:"sea"};playScene(S.slice(0,k),()=>playScene(S.slice(k),()=>{save();done();},{bg:"camp",look:"casual"}),{bg:B[cid]||"camp",look:"casual"});return;}
    if(R.twoQ&&now>=R.twoQ.abs){const q=R.twoQ;delete R.twoQ;const g=G.F[q.id];if(g&&g.camp==="player"&&!isAway(G,q.id)&&this.isLovC(G,q.cid)&&RG_TWO[q.id]&&(isPartner(G,q.id)||this.isLovC(G,q.id))){add(G,q.id,"bond",-8);
      playScene([{n:q.id,f:"sad",l:"casual",t:RG_TWO[q.id]},{n:"nar",t:`${g.name}รู้เรื่องของคุณกับ${G.F[q.cid].name}แล้ว`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const cid=this.confDue(G);if(cid){playScene(this.confSteps(G,cid),()=>{save();done();},{bg:"camp_night",look:"casual"});return;}}
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    {const r2=(R.cups||[])[1],c2=r2&&R.champ[r2];if(r2&&!R.c2&&c2&&now>=(c2.wonAbs||0)+1){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const r3=(R.cups||[])[2],c3=r3&&R.champ[r3];if(r3&&!R.c3&&c3&&now>=(c3.wonAbs||0)+1){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const F=R.final;if(F&&F.won&&!G.tigerRev&&now>=(F.wonAbs||0)+1){G.tigerRev=1;playScene(rgTiger(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    if(this.closeDue(G)){this.openFinal(G);playScene(rgClose(G),()=>{save();done();},{bg:"closing_ceremony",look:"casual"});return;} /* v1.91.20 round 11 */
    done();},
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week,/* v1.90.17 (Man): a trip can go this very week, so one every week */ (R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player")&&!this.nearSeries(G,this.base(G)+w))return w;}return null;},
  /* a championship bout is booked within a week of this one (the camp needs its rest week either side) */
  nearSeries(G,abs,skip){return RG_ORDER.some(r=>{const c=G.region.champ[r];return r!==skip&&c&&c.next&&c.next.abs===abs;});},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id]){G.F[id].rgSty=G.F[id].rgSty||rgBeltSty(r,id);return id;}
    /* a little under your fighter at the first belt, a little over by the sixteenth; the regional style (tilt) is part of that budget, not on top of it */
    const n=this.beltTotal(G),target=RG_LADDER.belt(n),rng=mulberry32((G.seed||1)+stableHash(id)),tilt=RG[r].tilt;
    const f=baseFighter(id,mkNPC(id,this.oppName(G,dest),"X",Math.min(19,Math.round(target-1)),rng,RG_ORDER.indexOf(r)+2)),base={...f.a};
    const setT=T=>{f.a={...base};f.vet=0;for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);liftOpponent(f,T,20);
      for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);};
    f.rg=dest;rgDress(f);f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;setT(RG_FIX.belt(n)+rgEdB(G,"eb"));f.rgT=+(RG_FIX.belt(n)+rgEdB(G,"eb")).toFixed(2);f.camp="quest";f.div="X";f.rg=dest;f.rgSty=rgBeltSty(r,id);rgDress(f);f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"ข้อมูลไม่ครบ"};
    if(R.trip)return {ok:false,why:"มีทริปที่นัดไว้แล้ว"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"ได้เข็มขัดจังหวัดนี้แล้ว"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name}ไม่พร้อมเดินทาง`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"เงินไม่พอค่าเดินทาง"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`วางแผนเดินทางไป${D.name} สัปดาห์ ${wk} · ค่าเดินทาง ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(R)rgApply(G);if(R&&R.joined)this.joinSkills(G);if(R)this.bondSync(G);if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(rg.nlfinal){if(R.final){R.final.cur=R.final.cur||{};R.final.cur[rg.nlfinal]=p.res||"L";}continue;}if(rg.nlleg){this.legResult(G,rg.nlleg,p);continue;}if(!D||!RG[r])continue;
      if(rg.series){this.seriesResult(G,r,p);continue;}
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""}คว้าเข็มขัดจังหวัด${D.name}!`);if(G.F[p.a])recordHonor(G,"rgbelt",p.a,G.F[p.a].div,G.week,dest); /* v1.91.14 (Man): a province belt gets the same ceremony as the main game */
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";this.champFighter(G,r);
          addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: ครบสี่เข็มขัดแล้ว`,body:RG_CH[r].letter});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_POST[r]});}
      const cid=RG_CID0[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&((R.joined&&R.joined[cid])||c.visit==="done"||c.state==="won"||rgEd(G)>=2);G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID0[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_MISS[r]});}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;rgApply(G);this.flush(G);this.seriesWeekly(G);this.fade(G);this.letters(G);this.finalWeekly(G);this.joinWeekly(G);this.joinPerks(G);this.loopWeekly(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+RG_TRIP_GAP);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;rgDress(G.F[b.b]);
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);const go=()=>openFight(b,()=>this.night(T,P2||P,1,done)),A=this.firstArrive(G,ROAD_DEST[dest].r,dest);
      if(A){playScene(A,go,{bg:"gas_station",look:"casual"});}else go();}});},
  /* the first trip into a region: its champion comes to meet the camp on the way in */
  firstArrive(G,r,dest){const R=G.region;R.arrived=R.arrived||{};if(R.arrived[r]||!RG_ARRIVE[r])return null;R.arrived[r]=1;rgTouch(G,RG_CID[r]);return RG_ARRIVE[r](G,ROAD_DEST[dest]);},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`ทั้งค่ายเดินทางถึง${ROAD_DEST[T.dest].name} · ความล้า +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    {const X=RG_TRIPX[T.dest],tx=G.region.tx=G.region.tx||{};if(n===1&&X&&!tx[T.dest]&&!T.series){tx[T.dest]=1;rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`ไฟต์ที่${D.name}จบแล้ว ทุกคนยืนรออยู่ข้างรถ`,choice:[
          {t:"กลับค่ายเลย",then:[{n:"nar",t:"รถเลี้ยวออกจากเมือง ทุกคนหลับกันตั้งแต่ยังไม่พ้นเขตจังหวัด"}]},
          {t:`อยู่เที่ยวต่ออีก 1 คืน (ค่าห้อง ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("เงินไม่พอค่าห้อง กลับค่ายกันก่อน");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`ไปเดินเล่นกับ${C.champ} (แชมป์${C.name})`,fx:G2=>{rgMeet(G2,cid,3);if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`พา${g.name}ไปเที่ยว${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"พักผ่อนให้หายล้า",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"ทุกคนเข้านอนแต่หัวค่ำ เช้ามาร่างกายสดชื่นขึ้น · ความล้า −10"}]},
      {t:"ซ้อมเบา ๆ ที่ลานจอดรถโรงแรม",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"เตะเป้าใต้ไฟลานจอดรถจนยามโรงแรมมาดู · ประสบการณ์ +6"}]}];
    playScene([{n:"nar",t:nights>1?`คืนที่ ${n} ที่${D.name}`:`คืนนี้ทั้งค่ายพักที่${D.name}`},{n:"nar",t:"คืนนี้ทำอะไรดี?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){if(!T.shopDone){T.shopDone=1;this.shop(T,()=>this.home(T,done),1);return;}G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"ขากลับ รถแวะร้านของฝากริมถนน ร่มกระดาษสาแขวนเรียงเป็นแถว ผ้าทอผืนงามพับวางอยู่บนโต๊ะไม้",
    isan:"ก่อนออกจากเมือง รถแวะศูนย์ผ้าไหมประจำจังหวัด หมอนขวานกองสูงเป็นภูเขา ผ้าไหมแพรวาแขวนอยู่ในตู้กระจก",
    central:"ก่อนกลับ รถแวะร้านงานช่างไทยริมทาง หัวโขนจ้องลงมาจากผนัง ถ้วยเบญจรงค์เรียงอยู่บนชั้น",
    south:"ก่อนออกจากเมือง รถแวะร้านของฝากริมทะเล รูปหนังตะลุงแขวนโปร่งแสงอยู่หน้าร้าน ไข่มุกวางอยู่ในตู้กระจก"},
  shop(T,next,first){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r);if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`ซื้อ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · มีอยู่ ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:first?"ไม่ซื้อ ขึ้นรถกลับค่าย":"พอแล้ว ขึ้นรถกลับค่าย",fx:()=>{st.end=1;}}];
    const head=first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"ของฝากแพงหน่อย แต่ได้ใจสาว ๆ มาก · ซื้อเก็บไว้แล้วค่อยให้ทีหลังได้ (ร้านแบบนี้มีแค่ตอนมาทริป)"}]:[];
    playScene([...head,{n:"nar",t:first?"จะซื้ออะไรติดมือกลับไปไหม?":"ซื้ออะไรเพิ่มไหม?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("เงินไม่พอ");if(st.got)toast(`ซื้อแล้ว: ${GIFTS[st.got].name} · ให้ได้จากปุ่มของขวัญ`);this.shop(T,next,0);},{bg:this.hotelBg[r],look:"casual"});},
  dateLines(cid,D){const L={
    baibua:[{n:"npc",who:"ใบบัว",t:`ถนนคนเดินคืนนี้คนเยอะเจ้า… ถ้าหลงกัน จับแขนเสื้อหนูไว้ก็ได้เจ้า`},{n:"nar",t:"ใบบัวเดินช้า ๆ ให้ผู้จัดการเดินทัน มือเกือบชนกันหลายครั้ง แต่ไม่มีใครพูดอะไร"}],
    tabtim:[{n:"npc",who:"ทับทิม",t:"ไปกินส้มตำกันเด้อ! ร้านนี้แซบหลาย… ฮ่า ๆ ๆ เผ็ดจนน้ำตาไหลแล้วอ้าย"},{n:"nar",t:"ทับทิมหัวเราะเสียงดังทั้งร้าน แต่พอผู้จัดการยื่นทิชชูให้ เธอเงียบไปครู่หนึ่ง"}],
    alicia:[{n:"npc",who:"อลิเซีย",t:"อย่าเข้าใจผิดนะ ฉันแค่อยากมีคนเดินเป็นเพื่อน คืนนี้กล้องปิดแล้ว…"},{n:"nar",t:"อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะทั้งคืน ไม่ได้หยิบขึ้นมาเลยสักครั้ง"}],
    chaba:[{n:"npc",who:"ชบา",t:"…ทะเลตอนกลางคืนสวย"},{n:"nar",t:"ชบาไม่พูดอะไรอีก แต่ยืนอยู่ข้าง ๆ จนน้ำขึ้นถึงข้อเท้า"}]};
    return L[cid]||[{n:"nar",t:`เดินเล่นยามค่ำที่${D.name}`}];},
  jealLine(id,champ){const L={kati:`ครูไปเดินกับ${champ}มาเหรอคะ… เปล่าค่ะ หนูไม่ได้ถาม`,mali:`มะลิเห็นนะ~ ไปกับ${champ}มาใช่ไหม… มะลิก็อยากไปบ้าง`,
    rin:`ไปกับ${champ}สองชั่วโมงสิบสองนาที รินไม่ได้จับเวลานะ แค่บังเอิญดูนาฬิกา`,ploy:`ไปกับ${champ}มาเหรอ ก็ดีนี่ …ทำไมต้องถามด้วย`,fah:`อ๋อ ไปกับ${champ}มาล่ะสิ! ฟ้าไม่ได้งอนนะ! แค่…หิว!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`ตลาดคืนนี้ของ${city}มีขนมเยอะจัง… ซื้อให้หนูชิ้นนึงได้ไหมคะ แค่ชิ้นเดียวจริง ๆ`,mali:`${city}ตอนกลางคืนสวยจัง~ ขอบคุณที่พามะลิมานะ จะจำไว้เลย`,
    rin:`รินจดร้านอร่อยของ${city}ไว้สามร้าน ไปร้านแรกก่อนนะคะ เหลือเวลาพอดี`,ploy:`ไม่ได้ขอให้พามานะ …แต่ก็ ขอบใจ`,fah:`${city}มีของกินแปลก ๆ เพียบ! ฟ้าจะลองให้หมดเลย ผู้จัดการจ่ายนะ!`};return L[id]||`คืนนี้ที่${city}สนุกดี`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    const NC=G.region.nc&&G.region.nc[r];f.pfx=H.perk.fx;f.canon=!NC;f.camp="region";if(NC){f.sprite="rgp_"+NC.home;f.color=C.col;f.name=C.champ;}
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],ceil=RG_LADDER.champ(cups,c.tries),tilt=C.tilt;
      f.lvl=Math.max(me.lvl||1,1)+3+Math.min(2,cups)/* v1.90.20 (Man): regional champions 3–5 levels above */;f.fatigue=0;f.injury=0;f.morale=75;
      /* re-fit only when your fighter or the stakes changed (this runs before every bout) */
      const key=[cups,c.tries||0,rgEd(G)].join("|");
      if(f.rgKey!==key){const setT=T=>{f.vet=0;for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,T-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
          liftOpponent(f,T,20);for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);};
        const T=RG_FIX.champ(cups,c.tries)+rgEdB(G,G.region.nc&&G.region.nc[r]?"nb":"cb"); /* a lost series makes the rematch a little easier (v1.90.14) */setT(T);f.rgT=+T.toFixed(2);f.rgKey=key;}}
    return f;},
  seriesPurse(G){const cups=(G.region.cups||[]).length,w=Math.round((30000+cups*6000)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  /* the first week from `from` that suits a championship bout: weeks 1–50, the camp home and rested, no other trip next to it */
  spot(G,r,from){const c=G.region.champ[r],T=G.region.trip;
    for(let abs=Math.max(from,gameWeek(G)+1),i=0;i<80;abs++,i++){const season=Math.floor((abs-1)/52)+1,wk=abs-(season-1)*52;if(wk<2||wk>RG_LAST_WK)continue;
      if(T&&T.abs===abs)continue;if(this.nearSeries(G,abs,r))continue;
      if(season===(G.season||1)&&G.bookings.some(b=>b.week===wk&&G.F[b.a]&&G.F[b.a].camp==="player"))continue;
      return {abs,season,wk};}return null;},
  schedule(G,r,from){const c=G.region.champ[r],s=this.spot(G,r,from);if(!s){c.next=null;return null;}
    c.next={...s,bid:`rgc_${r}_${s.abs}`,n:(c.n||0)+1};this.ensureBooking(G,r);return c.next;},
  ensureBooking(G,r){const c=G.region.champ[r],x=c.next;{const cf=G.F[this.champId[r]];if(x&&cf&&RG_CH[r].sty)cf.rgSty=RG_CH[r].sty[Math.min(2,Math.max(1,x.n||1)-1)];}if(!x||x.season!==(G.season||1)||x.wk<G.week||G.bookings.some(b=>b.id===x.bid))return;
    const me=G.F[c.fid];if(!me||me.camp!=="player")return;const cid=this.champId[r];this.champFighter(G,r,me);const pay=this.seriesPurse(G);
    G.bookings.push({id:x.bid,a:c.fid,b:cid,week:x.wk,tier:"region",rounds:5,win:pay.win,lose:pay.lose,region:{r,dest:RG[r].fin,series:x.n},bg:`bg_region_${RG_CH[r].ring}.webp`});
    G.offers=(G.offers||[]).filter(o=>o.week!==x.wk);},
  /* the letter came: pick the fighter who carries the whole series */
  startSeries(G,r,fid){const c=G.region.champ[r],me=G.F[fid];if(!c||c.state!=="letter"||!me||me.camp!=="player")return {ok:false,why:"เลือกนักมวยไม่ได้"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างพอสำหรับศึกแชมป์แล้ว"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · นัดที่ 1 สัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r});}
      rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · เงินรางวัล ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+2;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} ป้องกันแชมป์ไว้ได้ ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG[r].champ}จะแวะมาที่ค่าย`,body:`${RG[r].champ}ฝากข่าวมาว่าจะแวะมาเยี่ยมค่ายก่อนนัดที่ 2\n\nไปต้อนรับได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค`});}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} นัดที่ ${c.n}: ${p.res==="W"?"ชนะ":p.res==="L"?"แพ้":"เสมอ"} · สกอร์ ${c.w}-${c.l}${s?` · นัดต่อไปสัปดาห์ ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: คำท้าครั้งใหม่`,body:RG_CH[r].again});continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"ไฟต์ไม่ได้ชกตามนัด");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name}ยังเจ็บอยู่`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`เลื่อนนัด: ${RG_TITLE[r]}`,
      body:`${why} · ผู้จัดเลื่อนนัดที่ ${(c.n||0)+1}${s?` ไปเป็นสัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}\n\n${RG_CH[r].wait}`});},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} นัดที่ ${n}${n>1?` · สกอร์ ${me.name} ${sc} ${RG[r].champ}`:""}`};
    const line=n===1?H.pre[0]:c.w===1&&c.l===1?H.pre[2]:H.pre[1];
    const NC=G.region.nc&&G.region.nc[r];const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",...(NC?{}:{with:cid}),t:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name}พยักหน้ารับ แล้วเดินกลับมุมแดง`}];
    return [head,...(rgEd(G)>=2&&n===1&&!NC?[{n:"nar",t:`${RG[r].champ}ป้องกันแชมป์ภาคมาได้อีกสมัย และเก่งกว่าเมื่อสามปีก่อน`}]:[]),{...this.spk(r,n===1?"happy":"angry","fight"),t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      {const aw={kind:"rg_"+r,key:"cup"+r};AU.startMusic("victory");AU.sfx("champ");playScene(H.cup(G,J),()=>{AU.startMusic("hub");T.cupNight=rgEd(G)===1?1:0;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight",award:aw});
        [600,1300,2200,3300,4700,6200].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===aw)AU.sfx("pop");},ms));}return;} /* v1.91.14: the cup gets the ceremony overlay, fireworks and the victory song */
    const steps=J.kind==="lost"?H.lost(G,J):[{...this.spk(r,J.res==="W"?"sad":"happy","fight"),t:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`สกอร์ตอนนี้ ${J.w}-${J.l} · นัดต่อไปอีกราว 2 สัปดาห์`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · เวที ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>รูปแบบ</span><b>3 นัด ชนะ 2 · นัดละ 5 ยก · ห่างกันราว 2 สัปดาห์</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>นัดล้างตา</span><b class="goldt">แพ้ซีรีส์มาแล้ว ${G.region.champ[r].tries} ครั้ง · ทีมเรารู้ทางแชมป์คนนี้มากขึ้น</b></div>`:""}
     <div class="kv-row"><span>จุดเด่นของ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>ค่าตัวต่อนัด</span><b class="num">${fmt(pay.win)} / แพ้ ${fmt(pay.lose)}</b></div><div class="kv-row"><span>ได้ถ้วย</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>ใครขึ้นชกทั้งซีรีส์</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมชก</p>`}
     <p class="meta">เลือกแล้วเปลี่ยนตัวไม่ได้จนจบซีรีส์ · บาดเจ็บ = เลื่อนนัด · ผู้จัดออกค่าเดินทางให้ทุกนัด${c.tries?` · ครั้งที่ ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>รับคำท้า</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 ได้ถ้วย</span>`:n<4?`<span class="meta">🔒 ครบ 4 เข็มขัดก่อน (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">เลือกนักมวยชิงแชมป์</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · นัด ${c.next.n} สัปดาห์ ${c.next.wk}${c.next.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">ต้อนรับ${esc(C.champ)}ที่ค่าย</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">ดวลซ้อม</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)}ป้องกันแชมป์ไว้ได้ · รอจดหมายท้าครั้งใหม่</span>`:`<span class="meta">✉️ รอจดหมายนัดจากแชมป์</span>`;
    const chat=G.chatIn&&G.chatIn[RG_CID[r]]&&G.F[RG_CID[r]]?`<button class="btn sm gold" data-act="rgchat" data-v="${RG_CID[r]}">💬 ${esc(C.champ)}ทักแชตมา</button>`:"";
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>เวทีชิงแชมป์ภาค</small>${gap>=3?`<small class="rg-miss">💭 ${gap} สัปดาห์แล้วที่ไม่ได้เจอ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-final{border-top:6px solid #1a1a1a;background:linear-gradient(180deg,#2a1414 0,#160c0c 100%);color:#f3e6e6}.rg-final h3,.rg-final h4{color:#ff5a5a}.rg-final .meta{color:#d9bcbc}.rg-final.won{border-top-color:#d4a52a}.rg-fprep button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;max-width:22rem}.rg-fprep small{opacity:.8;font-size:.72rem;white-space:normal}.rg-fprep button,.rg-fprep button *{text-align:left!important;align-self:stretch}.rg-nl .kv-row{border-bottom:1px dashed rgba(255,255,255,.15)}.rg-slot{margin:.4rem 0 .7rem;padding:0 .9rem .4rem 0;border-bottom:1px dashed rgba(0,0,0,.2)}.rg-slot .kv-row{flex-wrap:wrap;gap:4px 12px}.rg-slot .kv-row small{margin-left:auto}.m-rgfline{max-width:580px;background:linear-gradient(180deg,#120a1e,#0b0812);color:#fff}.m-rgfline .meta{color:#c9c0dc}.vs-head{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.2rem 0 .3rem;font-weight:900;letter-spacing:.02em}.vs-tl,.vs-tr{flex:1;padding:.35rem .6rem;font-size:1.05rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}.vs-tl{text-align:right;background:linear-gradient(90deg,transparent,#c0182a);clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}.vs-tr{text-align:left;background:linear-gradient(90deg,#1d4fe0,transparent);clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}.vs-sc{font-size:1.7rem;min-width:3.4rem;text-align:center;color:#ffd84a;text-shadow:0 0 12px rgba(255,216,74,.5)}.vs-sub{text-align:center;font-size:.72rem;margin:0 0 .5rem}.vs-rows{display:flex;flex-direction:column;gap:6px}.vs-row{display:grid;grid-template-columns:1fr 46px 1fr;align-items:stretch;height:84px;position:relative}.vs-l,.vs-r{position:relative;display:flex;align-items:center;gap:.4rem;overflow:hidden;color:#fff;border:0;font:inherit;min-width:0}.vs-l{justify-content:flex-start;background:linear-gradient(90deg,#4a0710,#d01d2c 70%,#ff3b47);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);padding-right:12%}.vs-r{justify-content:flex-end;background:linear-gradient(90deg,#3f7bff,#1d4fe0 30%,#0a1f6b);clip-path:polygon(12% 0,100% 0,100% 100%,0 100%);padding-left:12%;cursor:pointer;text-align:right}.vs-r:not([disabled]):hover{filter:brightness(1.15)}.vs-row.next .vs-r{box-shadow:inset 0 0 0 3px #ffd84a}.vs-row.next .vs-r:not(:has(.vs-art)){animation:vsPulse 1.2s ease-in-out infinite}@keyframes vsPulse{50%{filter:brightness(1.35)}}.vs-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;font-style:italic;color:#fff;  text-shadow:-2px 0 0 #d01d2c,2px 0 0 #1d4fe0,0 0 10px rgba(255,255,255,.4);z-index:2}.vs-mid small{font-size:.58rem;font-style:normal;text-shadow:none;color:#c9c0dc}.vs-art{position:relative;flex:0 0 74px;height:84px;overflow:hidden}.vs-art img{position:absolute;left:50%;top:2px;height:235%;transform:translateX(-50%);max-width:none}.vs-art canvas{position:absolute;left:50%;top:-4px;width:150px;height:150px;transform:translateX(-50%);image-rendering:auto}.vs-tx{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vs-tx b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.45)}.vs-tx em{font-style:normal;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}.vs-tx small{font-size:.64rem;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vs-empty b{font-size:.85rem;opacity:.95}.vs-row.done .vs-l,.vs-row.done .vs-r{cursor:default}.vs-row.done .vs-l.lost,.vs-row.done .vs-r.lost{filter:grayscale(1) brightness(.72)}.vs-st{position:absolute;top:50%;transform:translate(-50%,-50%) rotate(-10deg);pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.6);font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;  padding:.05rem .45rem;border:3px solid currentColor;border-radius:4px;background:rgba(0,0,0,.55);z-index:3}.vs-st.vsl{left:11%}.vs-st.vsr{left:89%}.vs-st.w{color:#ffd84a}.vs-st.l{color:#ff6a6a}.vs-st.d{color:#d8d8d8}.rg-stars i{font-style:normal;color:#5a4a4a;font-size:1rem;letter-spacing:1px}.rg-stars i.on{color:#ffd84a;text-shadow:0 0 6px rgba(255,216,74,.6)}.rg-leg .kv-row{align-items:center}.vs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:.5rem 0}.vs-pc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 0 .4rem;border:0;color:#fff;font:inherit;cursor:pointer;  background:linear-gradient(180deg,#2a5bf0,#0d2478);box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}.vs-pc.on{box-shadow:inset 0 0 0 3px #ffd84a}.vs-pc[disabled]{filter:grayscale(1) brightness(.55);cursor:default}.vs-pc .vs-art{flex:none;width:100%;height:96px}.vs-pc small{font-size:.66rem;opacity:.85}@media (prefers-reduced-motion:reduce){.vs-row.next .vs-r{animation:none}}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
.rg-pick button{display:flex;align-items:center;gap:.35rem}.rg-pick button[aria-pressed="true"]{outline:3px solid var(--gold,#d9a21b)}
.rg-bill .kv-row{padding:.15rem 0}.rg-fuel.cheap{color:#2f8a50}.rg-fuel.high{color:#c8283c}
#rdcv{width:100%;height:auto;image-rendering:pixelated;background:#1b1530;box-shadow:inset 0 0 0 2px var(--line)}
.rd-play{width:min(560px,100%)}
.rd-say{display:flex;gap:10px;align-items:flex-start;min-height:92px;padding:10px 12px 22px;position:relative;background:var(--bg1,#231c3a);cursor:pointer}
.rd-say img{width:56px;height:56px;object-fit:cover;object-position:top;flex:none;box-shadow:inset 0 0 0 2px #4a3f6b}
.rd-say b{display:block;color:var(--gold)}.rd-say p{margin:2px 0 0;line-height:1.5}.rd-say.nar p{font-style:italic;color:#d8d0ec}
.rd-say small{position:absolute;right:10px;bottom:4px;font-size:11px;color:var(--muted)}
.rd-car{display:grid;justify-items:center;gap:2px}.rd-car small{color:var(--muted);font-size:12px}
.rd-fuel{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center}.rd-fuel b{grid-column:1/-1;text-align:center;font-size:14px}.rd-pump{font-size:22px}
.rd-gauge{position:relative;height:12px;background:linear-gradient(90deg,#3f9a4f 0 33%,#e0b41b 33% 66%,#d23246 66%);box-shadow:inset 0 0 0 2px #120c1c}
.rd-gauge i{position:absolute;top:-4px;width:4px;height:20px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #120c1c}
.rd-fuel.cheap b{color:#7fd88a}.rd-fuel.high b{color:#ff8f8f}
.rd-bill{display:grid;gap:2px;padding:8px 10px}.rd-bill .kv-row{font-size:13px}.rd-total{border-top:1px dashed #4a3f6b;padding-top:4px;margin-top:2px}
.rd-seg{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}#roadtrip{background:#0a0616}`;document.head.appendChild(st);},
  fuelLine(G){const p=roadFuel(G,gameWeek(G)),b=roadFuelBand(p);
    return `<p class="meta">ราคาน้ำมันสัปดาห์นี้ <b class="rg-fuel ${b}">฿${p.toFixed(2)}/ลิตร · ${b==="cheap"?"ถูก":b==="high"?"แพง":"ปกติ"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>ศึกชิงเจ้าสี่ภาค</h3><p>ทัวร์นาเมนต์ระดับภาคจะส่งจดหมายเชิญมา เมื่อจบปีที่ 5 และค่ายได้แชมป์จังหวัดครบ 3 ครั้ง</p>
       <div class="kv-row"><span>ปีที่</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>แชมป์จังหวัด</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">เปิดบทเลย (โหมดทดสอบ)</button></div>`:""}</section>`;}
    rgApply(G);const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>ทริปที่นัดไว้</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>สัปดาห์ ${T.wk}</b></div>
       <div class="kv-row"><span>นักมวย</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>คู่ชก</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>ค่าเดินทาง (จ่ายแล้ว)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">สัปดาห์นั้นทั้งค่ายไปด้วยกัน จึงไม่รับไฟต์อื่น</p><div class="mfoot"><button class="btn" data-act="rgcancel">ยกเลิกทริป (คืนเงิน)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        const P=R.pc&&R.pc[p];return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} กม. · ${nights?`ค้าง ${nights} คืน`:"ไปกลับวันเดียว"}</small>${P?this.histHTML(P,p,`แชมป์จังหวัด: ${rgNm(P,p)}`):""}</span>${got?`<span class="rg-belt">🏅 ได้เข็มขัด</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>วางแผน</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">แชมป์ภาค: <b>${esc(C.champ)}</b> · ${esc(C.nick)}${R.nc&&R.nc[r]?this.histHTML(R.nc[r],R.nc[r].home,"ประวัติแชมป์ภาคคนใหม่"):""}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>ศึกชิงเจ้าสี่ภาค</h3><span class="meta">ครั้งที่ ${R.edition||1}${this.nextEdTxt(G)}</span></div>
       <div class="rg-stats"><span class="pill gold">ถ้วย ${cups}/4</span><span class="pill">เข็มขัด ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`ทริป: ${esc(ROAD_DEST[T.dest].name)} · สัปดาห์ ${T.wk}`:nx?`เดินทางได้สัปดาห์ ${nx}`:"ปีนี้เดินทางไม่ได้แล้ว"}</span></div></section>
     ${!R.gala?`<p class="meta rg-gala">🎉 งานเปิดตัวศึกชิงเจ้าสี่ภาคที่กรุงเทพฯ ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"จัดปลายสัปดาห์หน้า":"จัดปลายสัปดาห์นี้"} · ทั้งค่ายได้รับเชิญ</p>`:""}${!REGION_LIVE?`<p class="meta">โหมดทดสอบ: <button class="btn sm" data-act="rggala" data-v="gala">ดูงานเปิดตัว</button> ไฟต์ใต้ดินทดสอบ (กติกาเปิด): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">ดูฉากซองเขียว</button>`:""}</p>`:""}
     ${this.finalCard(G)}${this.legendCard(G)}${this.joinCard(G)}${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">เดินทางสัปดาห์ <b>${wk}</b> · ${D.km} กม. · ${P.nights?`ค้าง ${P.nights} คืน`:"ไปกลับวันเดียว"} · คู่ชก: <b>${esc(this.oppName(G,dest))}</b> แชมป์ประจำจังหวัด</p>
     <h3>ใครขึ้นชก</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมเดินทางสัปดาห์นี้</p>`}
     <h3>ค่าเดินทาง ไป-กลับ</h3><div class="rg-bill"><div class="kv-row"><span>รถ</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`น้ำมัน ${Math.round(P.litres)} ลิตร × ฿${P.price.toFixed(2)}`,P.fuel)}${line("ทางด่วน",P.toll)}${line(`ตั๋วรถทัวร์ × ${P.onBus}`,P.bus)}${line(`ที่พัก ${P.nights} คืน`,P.lodge)}${line(`ค่ากิน × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>รวม</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">ทั้งค่าย ${P.people} คนไปด้วยกัน สัปดาห์นั้นไม่รับไฟต์อื่น · ความล้าระหว่างทางราว +${P.fat} ต่อคน${P.car==="none"?" · ยังไม่มีรถประจำค่าย ต้องนั่งรถทัวร์ (แพงและล้ากว่า)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ยืนยันการเดินทาง"}</button></div>`;}
};

/* round 11: the underground final — state, the region-page card, the line-up and the five bouts */
Object.assign(REGION,{
  closeDue(G){const R=G.region,now=gameWeek(G),cups=R.cups||[];if(R.close)return false;
    if(cups.length>=4){const last=R.champ[cups[3]];return now>=((last&&last.wonAbs)||0)+2;}
    /* the tournament runs its course without four cups: three years in, nothing in progress */
    return cups.length>=1&&now>=(R.startAbs||0)+156&&!RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")&&!R.trip;},
  openFinal(G){const R=G.region,now=gameWeek(G);R.close=now;R.final={stage:"prep",abs:now+3,prep:null,tries:0,won:false,intelAbs:now+1};
    addMail(G,{kind:"letter",from:"(ไม่มีชื่อผู้ส่ง)",title:"การ์ดสีดำ",body:`ขอเชิญค่ายศิริชัย ห้าต่อห้า\nโกดังโรงงานเครื่องดื่มเก่า ท่าเรือคลองเตย\nตั้งแต่สัปดาห์ที่ ${((R.final.abs-1)%52)+1} เป็นต้นไป\n\nกติกาเปิด ทุ่มได้ ล็อกได้\nไม่มีรางวัล ไม่มีสื่อ\n\nแค่อยากรู้ว่ามวยไทยค่ายเล็กของคุณรับมือโลกจริงได้แค่ไหน\n— ล.`});},
  finalWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||F.intel||now<F.intelAbs)return;F.intel=1;
    addMail(G,{kind:"letter",from:"(ไม่ลงชื่อ)",title:"ข้อมูลทีมนาคาลีก",body:"ไม่ต้องถามว่าใครส่งมา\n\n"+NL_ORDER.map(k=>`${NL[k].name} · ${NL[k].art}\n${NL[k].tip||""}`).join("\n\n")+"\n\nลดามองหาเทปไฟต์เก่าของทุกคนในค่ายคุณ คนที่เธอไม่เคยเห็นชก เธออ่านไม่ออก\n\nป.ล. แท็บเล็ตไม่ต้องคืนแล้ว"});},
  finalCard(G){const R=G.region,F=R.final;if(!F)return "";const now=gameWeek(G),ready=now>=F.abs,wk=((F.abs-1)%52)+1;
    const plans=Object.entries(RG_FPREP).map(([k,P])=>`<button class="btn sm ${F.prep===k?"gold":""}" data-act="rgfprep" data-v="${k}" aria-pressed="${F.prep===k}"><b>${esc(P.n)}</b><small>${esc(P.d)}</small></button>`).join("");
    const team=F.intel?`<div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><small>${NL[k].nlsk.map(s=>esc(s.name)).join(" · ")}</small></div>`).join("")}</div>`:`<p class="meta">ยังไม่รู้อะไรเกี่ยวกับทีมนาคาลีกเลย</p>`;
    if(F.won)return `<section class="px card rg-final won"><h3>ไฟต์ใต้ดิน · นาคาลีก</h3><p>ค่ายศิริชัยชนะ ${F.score||""} · ${F.beatLadda?"ล้มลดาได้ด้วย":"ลดายังไม่แพ้ใคร"}</p></section>`;
    return `<section class="px card rg-final"><h3>🂠 การ์ดสีดำ · ไฟต์ใต้ดินนาคาลีก</h3>
      <p class="meta">ห้าต่อห้า · ชนะสามได้ไป · กติกาเปิด ทุ่มได้ ล็อกได้ · ไม่มีรางวัล${F.tries?` · เคยไปแล้ว ${F.tries} ครั้ง`:""}</p>
      <h4>แผนซ้อมใต้ดิน</h4><div class="rg-pick rg-fprep">${plans}</div>
      <h4>ทีมนาคาลีก</h4>${team}
      <div class="mfoot">${ready?`<button class="btn primary" data-act="rgfline" ${F.prep?"":"disabled"}>${!F.prep?"เลือกแผนซ้อมก่อน":F.live?"กลับเข้าโกดัง ชกต่อ ▸":"ไปโกดังใต้ดิน ▸"}</button>`:`<span class="meta">ไปได้ตั้งแต่สัปดาห์ ${wk} · ซ้อมอีก ${F.abs-now} สัปดาห์</span>`}</div></section>`;},
  finalPool(G){return roster(G).filter(f=>!f.injury&&!isAway(G,f.id));},
  vsArt(f,side,win){const A={kati:1,mali:1,rin:1,ploy:1,fah:1,baibua:1,tabtim:1,alicia:1,chaba:1,pailin:1};
    if(f.nl==="ladda")return `<img src="${ASSET}lada_fight_${win?"happy":"angry"}.webp" alt="">`;
    if(f.nl)return `<img src="${ASSET}nl_${f.nl}${f.nl==="rosa"&&win?"_win":""}_por.webp" alt="">`; /* v1.91.23: Man's Naka League portraits */
    if(A[f.id])return `<img src="${ASSET}${f.id}_fight_happy.webp" alt="">`;
    return `<canvas width="128" height="128" data-sprite="${f.id}" data-mode="guard" ${side==="r"?'data-flip="1"':""}></canvas>`;},
  boardHTML(){const R=G.region,F=R.final,pool=this.finalPool(G),L=F.line=F.line||{},K=F.clear=F.clear||{};
    if(!F.live){F.cur={};for(const k in K){F.cur[k]="W";delete L[k];}} /* v1.91.24 (Man, option 1): bouts already won stay won */
    const C=F.cur;
    for(const k of NL_ORDER)if(!C[k]&&L[k]&&!pool.some(f=>f.id===L[k]))delete L[k];
    if(!F.live&&!NL_ORDER.some(k=>!C[k]&&L[k])){const used=new Set();for(const k of NL_ORDER){if(C[k])continue;const f=pool.filter(x=>!used.has(x.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(f){L[k]=f.id;used.add(f.id);}}}
    const ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const v=Object.values(C),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,next=NL_ORDER.find(k=>!C[k]);
    if(UI.rgPick&&!C[UI.rgPick]){const k=UI.rgPick,o=G.F["nl_"+k],at=id=>NL_ORDER.find(x=>L[x]===id);
      return `<div class="vsb"><h2>นัด ${NL_ORDER.indexOf(k)+1} · ใครจะขึ้นชกกับ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)}</p>
        <div class="vs-pick">${pool.map(f=>{const x=at(f.id),done=x&&C[x];return `<button class="vs-pc ${L[k]===f.id?"on":""}" data-act="rgfset" data-v="${k}|${f.id}" ${done?"disabled":""}>
          <span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}${done?" · ชกไปแล้ว":x&&x!==k?` · อยู่นัด ${NL_ORDER.indexOf(x)+1}`:""}</small></button>`;}).join("")}</div>
        ${pool.length<5?`<p class="redt">ต้องมีนักมวยพร้อมชกอย่างน้อย 5 คน (ตอนนี้ ${pool.length} คน)</p>`:""}
        <div class="mfoot"><button class="btn" data-act="rgfpickx">กลับ</button></div></div>`;}
    const stamp=(r,sd)=>r?`<i class="vs-st ${sd} ${r==="W"?"w":r==="L"?"l":"d"}">${r==="W"?"WIN":r==="L"?"LOSE":"DRAW"}</i>`:"";
    const rows=NL_ORDER.map((k,i)=>{const o=G.F["nl_"+k],kept=!!(K[k]&&!L[k]),me=kept?G.F[K[k]]:L[k]&&G.F[L[k]],r=C[k],their=r==="W"?"L":r==="L"?"W":r;
      return `<div class="vs-row ${r?"done":""} ${kept?"kept":""} ${k===next?"next":""}">
        <div class="vs-l ${r&&their!=="W"?"lost":""}"><span class="vs-art">${o?this.vsArt(o,"l",their==="W"):""}</span><span class="vs-tx">${(n=>`<b>${esc(n[0])}</b>${n[1]?`<em>${esc(n.slice(1).join(" "))}</em>`:""}`)(NL[k].name.split(" "))}<small>${esc(NL[k].art)}</small></span></div>
        <div class="vs-mid">VS<small>นัด ${i+1}</small></div>
        <button class="vs-r ${r&&r!=="W"?"lost":""}" data-act="rgfslot" data-v="${k}" ${r?"disabled":""}>${me?`<span class="vs-tx"><b>${esc(me.name)}</b><small>${kept?"ชนะไว้ครั้งก่อน":`Lv.${me.lvl||1}`}</small></span><span class="vs-art">${this.vsArt(me,"r")}</span>`:`<span class="vs-tx vs-empty"><b>+ เลือกนักมวย</b></span>`}</button>${stamp(their,"vsl")}${stamp(r,"vsr")}</div>`;}).join("");
    const nk=next&&NL_ORDER.indexOf(next)+1,ok=next&&L[next];
    return `<div class="vsb"><div class="vs-head"><span class="vs-tl">นาคาลีก</span><b class="vs-sc">${w>0||l>0?`${l} – ${w}`:"VS"}</b><span class="vs-tr">ค่ายศิริชัย</span></div>
      <p class="meta vs-sub">ห้าต่อห้า · ชนะสามได้ไป · แตะช่องสีน้ำเงินเพื่อเลือกนักมวย · นัดที่ชนะแล้วนับไว้ให้ ครั้งหน้าชกแค่นัดที่เหลือ · ไม่มีบาดเจ็บค้างหลังไฟต์</p>
      <div class="vs-rows">${rows}</div>
      <div class="mfoot">${next?`${F.live?"":`<button class="btn" data-act="closeModal">ไว้ก่อน</button>`}<button class="btn primary" data-act="rgfgo" ${ok?"":"disabled"}>${ok?`ชกนัด ${nk} ▸`:`เลือกนักมวยนัด ${nk} ก่อน`}</button>`:`<button class="btn primary" data-act="rgfend">ดูผลไฟต์ใต้ดิน ▸</button>`}</div></div>`;},
  finalNext(){const R=G.region,F=R.final,C=F.cur=F.cur||{},k=NL_ORDER.find(x=>!C[x]);if(!k||!(F.line||{})[k])return;UI.modal=null;UI.rgPick=null;
    if(!F.live){F.live=true;save();AU.startMusic&&AU.startMusic("hub");playScene(rgFinalIntro(G),()=>this.finalBout(k),{bg:"naka_underground",look:"casual"});return;}
    this.finalBout(k);},
  finalBout(k){const R=G.region,F=R.final,i=NL_ORDER.indexOf(k),me=G.F[F.line[k]];if(!me)return;
    const keep={injury:me.injury||0,fatigue:me.fatigue||0},o=nlFighter(G,k,me);
    const b={id:`nlf${F.tries||0}_${i}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",gprep:F.prep,region:{nlfinal:k}};
    G.bookings.push(b);save();
    openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);me.injury=keep.injury;me.fatigue=keep.fatigue;this.flush(G);
      if(!F.cur[k])F.cur[k]="L";if(F.cur[k]==="W"){F.clear=F.clear||{};F.clear[k]=me.id;}save();UI.modal={type:"rgfline"};render();});},
  finalEnd(){const R=G.region,F=R.final,v=Object.values(F.cur||{}),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,beat=(F.cur||{}).ladda==="W";F.tries=(F.tries||0)+1;F.live=false;UI.modal=null;
    if(w>=3){F.won=true;F.stage="done";F.wonAbs=gameWeek(G);F.score=`${w}–${l}`;F.beatLadda=beat;R.hall=R.hall||[];R.hall.push({k:"naka",season:G.season||1,score:F.score,ladda:beat});
      for(const r of RG_ORDER)rgTouch(G,RG_CID[r]);G.rep+=3;
      AU.startMusic&&AU.startMusic("victory");playScene(rgFinalWin(G,w,l,beat,F.line.ladda),()=>{AU.startMusic&&AU.startMusic("hub");save();render();},{bg:"naka_underground",look:"casual"});return;}
    playScene(rgFinalLose(G,w,l),()=>{save();UI.modal={type:"rgflost"};render();},{bg:"naka_underground",look:"casual"});},
});
/* v1.91.27 (Man): legend mode — optional, after the underground final. Stars: ★ win · ★★ win without going down · ★★★ that, and inside the distance */
const LEG_UP={n:.65,l:.6}, /* v1.91.38: the final got harder — legend members stay where they were (~29%), legend Ladda stays above the final */LEG_DUST=4;
Object.assign(REGION,{
  legStars(n){return `<span class="rg-stars">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}">★</i>`).join("")}</span>`;},
  legendCard(G){const R=G.region,F=R.final;if(!F||!F.won)return "";const L=R.legend=R.legend||{},tot=NL_ORDER.reduce((a,k)=>a+(L[k]||0),0),used=R.legWk===gameWeek(G);
    return `<section class="px card rg-final rg-leg ${tot>=15?"won":""}"><h3>✦ ระดับตำนาน · นาคาลีก <small class="meta">${tot}/15 ดาว</small></h3>
      <p class="meta">ไม่บังคับ · เก่งกว่าไฟนอลใต้ดิน · สัปดาห์ละ 1 ไฟต์ · บาดเจ็บและความล้าคิดตามจริง · ★ ชนะ · ★★ ชนะโดยไม่ล้มเลย · ★★★ ไม่ล้มและจบก่อนครบยก · ดาวใหม่ดวงละเศษดาว ${LEG_DUST}</p>
      <div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><span>${this.legStars(L[k]||0)} <button class="btn sm" data-act="rglegpick" data-v="${k}" ${used?"disabled":""}>ท้า ▸</button></span></div>`).join("")}</div>
      ${used?`<p class="meta">สัปดาห์นี้ชกระดับตำนานไปแล้ว</p>`:""}</section>`;},
  legPickHTML(k){const R=G.region,pool=this.finalPool(G),L=R.legend||{};
    return `<h2>ระดับตำนาน · ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)} · ตอนนี้ ${this.legStars(L[k]||0)} · ชก 5 ยก กติกาเปิด</p>
      <div class="vs-pick">${pool.map(f=>`<button class="vs-pc" data-act="rglego" data-v="${k}|${f.id}"><span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}</small></button>`).join("")}</div>
      ${pool.length?"":`<p class="redt">ไม่มีนักมวยที่พร้อมชก</p>`}<div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button></div>`;},
  legGo(k,id){const R=G.region,me=G.F[id];if(!me||R.legWk===gameWeek(G))return;UI.modal=null;R.legWk=gameWeek(G);
    const o=nlFighter(G,k,me,0,0,true),b={id:`nlleg_${k}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",region:{nlleg:k}};
    G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);this.flush(G);save();render();});},
  legResult(G,k,p){const R=G.region,L=R.legend=R.legend||{},st=p.res==="W"?1+(p.kdA?0:1)+(!p.kdA&&p.stop?1:0):0,was=L[k]||0;
    if(st>was){L[k]=st;G.dust=(G.dust||0)+(st-was)*LEG_DUST;toast&&toast(`ระดับตำนาน · ${NL[k].name} ${"★".repeat(st)} · เศษดาว +${(st-was)*LEG_DUST}`);}
    const tot=NL_ORDER.reduce((a,x)=>a+(L[x]||0),0);if(tot>=15&&!R.legAll){R.legAll=gameWeek(G);G.rep+=2;R.hall=R.hall||[];R.hall.push({k:"legend",season:G.season||1});
      G.log=G.log||[];G.log.push("ระดับตำนานนาคาลีกครบ 15 ดาว · ชื่อเสียง +2");}},
});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rglegpick:d=>{if(!G.region||!G.region.final||!G.region.final.won)return;UI.modal={type:"rgleg",k:d.v};render();},
  rglego:d=>{const [k,id]=d.v.split("|");REGION.legGo(k,id);},
  rgfprep:d=>{const F=G.region&&G.region.final;if(!F||F.won)return;F.prep=d.v;save();render();},
  rgfline:()=>{const F=G.region&&G.region.final;if(!F||F.won||!F.prep||gameWeek(G)<F.abs)return;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfslot:d=>{const F=G.region.final;if((F.cur||{})[d.v])return;UI.rgPick=d.v;render();},
  rgfpickx:()=>{UI.rgPick=null;render();},
  rgfset:d=>{const [k,id]=d.v.split("|"),F=G.region.final,L=F.line=F.line||{},C=F.cur||{};if(C[k])return;
    const was=NL_ORDER.find(x=>L[x]===id);if(was&&C[was])return;if(was&&was!==k){if(L[k])L[was]=L[k];else delete L[was];}L[k]=id;UI.rgPick=null;save();render();},
  rgfgo:()=>REGION.finalNext(),
  rgfend:()=>{const F=G.region.final;if(NL_ORDER.every(k=>(F.cur||{})[k]))REGION.finalEnd();},
  rgfagain:()=>{const F=G.region.final;F.cur={};F.live=false;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfhome:()=>{const F=G.region.final;F.abs=gameWeek(G)+1;UI.modal=null;addMail(G,{kind:"letter",from:"(ไม่มีชื่อผู้ส่ง)",title:"การ์ดสีดำใบใหม่",body:"ประตูยังเปิดอยู่\n— ล."});save();render();},
});
if(typeof XMODAL!=="undefined"){XMODAL.rgfline=()=>({body:REGION.boardHTML(),foot:false});XMODAL.rgleg=m=>({body:REGION.legPickHTML(m.k),foot:false});
  XMODAL.rgflost=()=>({body:`<h2>แพ้ไฟต์ใต้ดิน</h2><p>นัดที่ชนะแล้วนับไว้ให้ ครั้งหน้าชกแค่นัดที่เหลือ · จะเอายังไงต่อ</p><div class="mfoot"><button class="btn" data-act="rgfhome">กลับไปซ้อมก่อน (มาใหม่สัปดาห์หน้า)</button><button class="btn primary" data-act="rgfagain">จัดคู่ใหม่ แล้วสู้ต่อเลย</button></div>`,foot:false});}
if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`นัดเดินทางสัปดาห์ ${r.wk} แล้ว · จ่ายค่าเดินทาง ${fmt(r.cost)}`);save();render();},
  rgvisit:d=>{const r=d.v,c=G.region.champ[r],cid=REGION.champId[r];if(!c||c.visit!=="due")return;
    playScene(RG_VISIT[r](G),()=>DUEL.open(r,false,res=>{if(!res){render();return;}c.visit="done";const T=DUEL_TALK[r];
      playScene([{n:cid,f:res.w>=2?"flustered":"happy",l:"casual",t:res.w>=2?T.win:T.lose},{n:"nar",t:`${RG[r].champ}กลับไปตอนค่ำ · นัดที่ 2 เจอกันที่เวทีภาค`}],()=>{const g=typeof cardCheck==="function"?cardCheck(G):[];if(g.length){G.cardPend=(G.cardPend||[]).concat(g);UI.modal={type:"cardnew"};}save();render();},{bg:"camp",look:"casual"});}),{bg:"camp",look:"casual"});},
  rgduel:d=>{DUEL.open(d.v,true,()=>render());},
  rgser:d=>{UI.rgFid=null;UI.modal={type:"rgser",r:d.v};render();},
  rgsfid:d=>{UI.rgFid=d.v;render();},
  rgsgo:d=>{const x=REGION.startSeries(G,d.v,UI.rgFid);if(!x.ok){toast(x.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`รับคำท้าแล้ว · นัดที่ 1 สัปดาห์ ${x.s.wk}${x.s.season!==(G.season||1)?" ปีหน้า":""}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("ยกเลิกทริปแล้ว ได้เงินค่าเดินทางคืน");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();},
  rgchat:d=>{const f=G.F[d.v];if(!f)return;f.met=true;rgTouch(G,d.v);chatOpen(d.v);},
  rggala:d=>{if(REGION_LIVE)return;const R=G.region;if(d.v==="c1"){const r=R.cups[0];playScene(rgCup1(G,r),()=>{R.c1=R.c1||"seen";save();render();},{bg:"camp",look:"casual"});return;}
    playScene(rgGala(G),()=>{R.gala=1;save();render();},{bg:"gala",look:"casual"});}});
/* ---------- v1.91.28 round 12 (Man): after the underground final the regional champions ask to join, one at a time ----------
   hidden bar: closeness (R.meet) ≥ RG_JOIN_MIN · offers come in order of closeness, 4 weeks apart · accepting needs a free room (5 + dorm level) and the signing fee
   she arrives the next week (leaving her old camp + arriving at Sirichai) at ~70% of her champion level/stats, with skill points for her lineage's tree (the partner girl's)
   romance (Man): one-love or two-timing only — never the harem team. Kept on its own track (R.lov / R.ex), shown through relState */
const rgBondOf=m=>Math.min(70,Math.round((m||0)*3));
const RG0=Object.fromEntries(Object.entries(RG).map(([r,C])=>[r,{name:C.name,champ:C.champ,nick:C.nick}]));
const RG_HOME_LINE={baibua:2,tabtim:1,alicia:2,chaba:0}; /* Baibua counters (Tha Sao) · Tabtim keeps range (Korat) · Alicia fights inside (Lopburi) · Chaba presses (Chaiya) */
const RG_JOIN_MIN=12,RG_JOIN_GAP=4,RG_JOIN_FEE=350000,RG_JOIN_WAGE=5000; /* v1.91.30 (Man): a regional champion costs a fortune, and is worth it */
/* v1.91.30 (Man): every champion brings something the camp wants — her ring perk stays, plus a camp-wide gift */
const RG_TRAIT={
 baibua:{name:"ครูศอกท่าเสา",desc:"ศอกสวนแบบท่าเสาติดตัว (สวน +5% ศอก +12%) · สอนศอกให้ทั้งค่าย: นักมวยที่ศอก/การสวนยังไม่ถึง 17 ขึ้นเองทุกสัปดาห์"},
 tabtim:{name:"เสียงหัวเราะอีสาน",desc:"เตะแม่น หลบไว ติดตัว · อยู่ที่ไหนที่นั่นครึกครื้น: กำลังใจทุกคนในค่าย +2 ทุกสัปดาห์"},
 alicia:{name:"ดาวไลฟ์",desc:"หมัดหนักและกันวงในติดตัว · ไลฟ์ซ้อมกับค่าย: ได้ค่าโฆษณาทุกสัปดาห์ (ขึ้นกับชื่อเสียงค่าย) และชื่อเสียงค่อย ๆ ขึ้น"},
 chaba:{name:"มือซ่อมเงียบ",desc:"หลบไวและฟื้นแรงเร็วติดตัว · ดูแลคนเจ็บเหมือนดูแลพี่ชาย: นักมวยที่บาดเจ็บหายเร็วขึ้นสัปดาห์ละ 1 สัปดาห์"}};
const RG_JOIN={
 baibua:{letter:"ผู้จัดการเจ้า\n\nหนูคิดมาตั้งแต่คืนที่ได้ถ้วยแล้ว ว่าอยากซ้อมที่ค่ายศิริชัยเจ้า อยากชกข้าง ๆ กะทิ บ่ใช่ชกกับกะทิ\n\nพ่อบอกว่าครูมวยท่าเสาสอนให้ไปหาคนที่ทำให้หมัดเราดีขึ้น บ่ใช่อยู่ที่เดิมตลอด\n\nถ้าค่ายมีห้องว่าง หนูขอสมัครเน้อเจ้า\n— ใบบัว",
  leave:[{n:"nar",t:"เช้าวันย้ายค่าย หมอกยังไม่จาง ใบบัวกราบครูที่ศาลไม้หน้าค่ายเดิม"},{n:"baibua",f:"sad",l:"casual",t:"ครูเจ้า หนูไปอยู่ค่ายอื่นแล้วเน้อ… บ่ได้ทิ้งท่าเสาเจ้า หนูจะเอาไปด้วย"},
   {n:"nar",t:"ครูผูกด้ายขาวที่ข้อมือให้เธอหนึ่งเส้น แล้วตบหลังเบา ๆ สองที"},{n:"baibua",f:"happy",l:"casual",t:"พ่อฝากไส้อั่วมาให้ทั้งค่ายเจ้า บอกว่าถ้ากินแล้วอร่อย ให้ดูแลลูกสาวพ่อดี ๆ"}],
  arrive:[{n:"nar",t:"ใบบัวยืนหน้าป้ายค่ายศิริชัย ถือกระเป๋าสองใบกับกล่องไส้อั่วอีกหนึ่งกล่อง"},{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการเจ้า… ฝากตัวด้วยเน้อ หนูจะบ่ทำให้ผิดหวังเจ้า"}],
  pair:"พี่ใบบัว! ห้องอยู่ข้างหนูเลยค่ะ หนูปูที่นอนไว้ให้แล้ว!",pairBack:"…ขอบใจเจ้ากะทิ ท่าเสาสองคนในค่ายเดียว ครูคงยิ้มอยู่เน้อ",
  hang:[
   [{n:"nar",t:"ใบบัวชวนไปตลาดเช้า เธอเลือกผักอย่างตั้งใจราวกับเลือกคู่ชก"},{n:"baibua",f:"happy",l:"casual",t:"แกงฮังเลต้องใช้หมูสามชั้นเจ้า… ผู้จัดการกินเผ็ดได้ก่อ",choice:[
     {t:"\"ได้ เผ็ดแค่ไหนก็กิน\"",b:4,then:[{n:"baibua",f:"flustered",l:"casual",t:"งั้นหนูจะใส่พริกเพิ่มเน้อ… แต่ถ้าน้ำตาไหลห้ามโทษหนูเจ้า"}]},
     {t:"\"ทำแบบที่บ้านเธอกินเลย\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…แบบที่พ่อชอบเจ้า หนูบ่ได้ทำให้ใครกินนานแล้ว"}]}]}],
   [{n:"nar",t:"ค่ำแล้ว ใบบัวนั่งปักผ้าลายตีนจกอยู่หน้าห้อง เข็มเล็กกว่าที่คิด"},{n:"baibua",f:"flustered",l:"casual",t:"ปักให้กะทิเจ้า… บ่ใช่ ปักให้ทั้งค่าย อันนี้ของผู้จัดการ เอ๊ย บ่ใช่ ยังบ่เสร็จเจ้า",choice:[
     {t:"\"รอได้ ไม่รีบ\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…งั้นหนูจะปักช้า ๆ เน้อเจ้า"}]},
     {t:"\"สอนฉันปักบ้างได้ไหม\"",b:4,then:[{n:"nar",t:"ผ่านไปครึ่งชั่วโมง ผ้าของคุณมีดอกบัวหนึ่งดอก หน้าตาเหมือนกะหล่ำ"},{n:"baibua",f:"happy",l:"casual",t:"งามเจ้า… งามแบบกะหล่ำเจ้า"}]}]}],
   [{n:"nar",t:"เช้ามืด ใบบัวซ้อมศอกกลับหลังกับกระสอบ ไม่ได้ยินเสียงคุณเดินมา"},{n:"baibua",f:"surprised",l:"fight",t:"เอ๊ะ! ผู้จัดการ… ดูอยู่นานแล้วก่อเจ้า",choice:[
     {t:"\"ศอกนั้นสวยที่สุดที่เคยเห็น\"",b:5,then:[{n:"baibua",f:"flustered",l:"fight",t:"…ห้ามพูดแบบนี้ตอนหนูถือศอกอยู่เจ้า มันจะพลาด"}]},
     {t:"จับกระสอบให้เธอซ้อมต่อ",b:4,then:[{n:"nar",t:"ศอกต่อไปเบาลงนิดหนึ่ง เธอบอกว่ากลัวคุณเจ็บ"}]}]}]],
  love:[{n:"nar",t:"เสาร์นี้ใบบัวพาไปถนนคนเดิน มือเธอหาเจอเองในฝูงคน"},{n:"baibua",f:"flustered",l:"casual",t:"ถ้าหลงกัน… ก็จับไว้แบบนี้เน้อ"},{n:"baibua",f:"happy",l:"casual",t:"หนูบ่ได้กลัวหลงหรอกเจ้า"}],
  conf:G=>[{n:"nar",t:"ดึกแล้ว ใบบัวมาเคาะประตู ถือผ้าคลุมลายตีนจกผืนเดิมจากดอยสุเทพ"},{n:"baibua",f:"flustered",l:"casual",t:"หนูเขียนไว้ในจดหมายสัญญาแล้ว แต่ลบออก… เพราะอยากพูดเอง"},{n:"baibua",f:"flustered",l:"casual",t:G.player.gender==="f"?"หนูฮักปี้เจ้า… ปี้จะตอบเมื่อไหร่ก็ได้เน้อ":"หนูฮักอ้ายเจ้า… อ้ายจะตอบเมื่อไหร่ก็ได้เน้อ"}],
  yes:G=>G.player.gender==="f"?"…เจ้า หนูจะเรียกปี้แบบนี้ทุกวันเน้อ บ่ต้องแอบเรียกแล้ว":"…เจ้า หนูจะเรียกอ้ายแบบนี้ทุกวันเน้อ บ่ต้องแอบเรียกแล้ว",no:"บ่เป็นหยังเจ้า หนูยังอยู่ค่ายนี้ ยังได้เห็นหน้าทุกวัน ก็พอแล้วเจ้า",bye:"…เจ้า หนูเข้าใจ หนูยังจะชกให้ค่ายนี้เต็มที่เหมือนเดิมเจ้า"},
 tabtim:{letter:"ผู้จัดการเด้อ\n\nแชมป์ภาคอีสานอย่างข้อยบ่เคยแพ้ใครง่าย ๆ แต่แพ้ค่ายศิริชัยแล้วมันคักหลาย อยากฮู้ว่าค่ายนี้ซ้อมจั่งใด๋\n\nเลยสิย้ายไปซ้อมนำเลย! พลอยบ่ต้องย้านเด้อ ข้อยบ่แย่งที่ ข้อยสิแย่งข้าวเหนียวอย่างเดียว\n\nถ้ามีห้องว่างตอบมาเด้อ\n— ทับทิม",
  leave:[{n:"nar",t:"คืนสุดท้ายที่ค่ายเก่า รุ่นน้องทั้งค่ายนั่งล้อมวงกินข้าวส่งทับทิม"},{n:"tabtim",f:"happy",l:"casual",t:"บ่ต้องฮ้องไห้เด้อพี่น้อง! ข้อยไปซ้อมเฉย ๆ บ่ได้ไปไส!"},
   {n:"nar",t:"ครูของเธอยื่นกระติบข้าวเหนียวใบใหญ่ให้ ทับทิมหัวเราะเสียงดัง แต่ตาแดง"},{n:"tabtim",f:"sad",l:"casual",t:"…ครูสอนข้อยตั้งแต่เตะต้นกล้วยบ่ล้ม ผู้จัดการต้องดูแลข้อยดี ๆ เด้อ"}],
  arrive:[{n:"nar",t:"ทับทิมลงจากรถตู้พร้อมไก่ย่างสามถุงกับปลาร้าบองหนึ่งกระปุก"},{n:"tabtim",f:"happy",l:"casual",t:"ผู้จัดการ! จากนี้ทับทิมเป็นคนของค่ายศิริชัยแล้วเด้อ …หมายถึงนักมวย อย่าคิดหลาย!"}],
  pair:"ห้องเธออยู่ตรงข้ามฉัน เสียงดังหลังสี่ทุ่มฉันเคาะผนังนะ",pairBack:"ฮ่า ๆ ได้เลยพลอย! เคาะมาข้อยสิเคาะตอบเป็นจังหวะกลองยาวเด้อ",
  hang:[
   [{n:"nar",t:"ทับทิมลากคุณไปร้านส้มตำ สั่งเองทั้งโต๊ะโดยไม่เปิดเมนู"},{n:"tabtim",f:"happy",l:"casual",t:"ตำปูปลาร้าพริกสิบเม็ด! ผู้จัดการเอาจั๊กเม็ด?",choice:[
     {t:"\"สิบเม็ดเหมือนเธอ\"",b:5,then:[{n:"nar",t:"สิบนาทีต่อมาคุณดื่มน้ำแข็งไปสามแก้ว"},{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ ใจถึงเด้อ! ข้อยมักคนใจถึง …หมายถึงนักกิน!"}]},
     {t:"\"เม็ดเดียวพอ\"",b:3,then:[{n:"tabtim",f:"pout",l:"casual",t:"เม็ดเดียวคือกินข้าวเปล่าแล้วเด้อ! เอ้า ข้อยแบ่งของข้อยให้คำหนึ่ง"}]}]}],
   [{n:"nar",t:"ทับทิมเปิดหมอลำจากโทรศัพท์ แล้วฟ้อนอยู่กลางลานค่ายคนเดียว"},{n:"tabtim",f:"happy",l:"casual",t:"มาฟ้อนนำกันเด้อผู้จัดการ! เท้าแบบนี้แหละที่ใช้เตะ",choice:[
     {t:"ลุกไปฟ้อนด้วย",b:5,then:[{n:"nar",t:"ทั้งค่ายออกมายืนดู ทับทิมจับมือคุณหมุนสามรอบแล้วหัวเราะจนนั่งลงกับพื้น"}]},
     {t:"นั่งตบมือให้จังหวะ",b:4,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…มองนานคักเด้อ ข้อยเขินเป็นเหมือนกันเด้อ"}]}]}],
   [{n:"nar",t:"หลังซ้อม ทับทิมนั่งเงียบผิดปกติ มองรูปน้องชายในชุดนักศึกษาในโทรศัพท์"},{n:"tabtim",f:"sad",l:"casual",t:"น้องชายข้อยเอง… สอบติดนิติฯ แล้ว ข้อยชกเพื่อส่งมันเรียนให้จบ",choice:[
     {t:"\"เขาโชคดีที่มีพี่แบบเธอ\"",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าเว้าแบบนี้ ข้อยฮ้องไห้ง่ายเด้อ บ่ได้เว้าหยอก"}]},
     {t:"\"ค่ายนี้ช่วยเธอส่งเขาได้\"",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"ค่ายนี้ใจดีแท้… ข้อยสิชกให้หนักกว่าเก่าเด้อ"}]}]}]],
  love:[{n:"nar",t:"ริมโขงตอนพลบค่ำ ทับทิมเงียบไปนานกว่าทุกครั้ง"},{n:"tabtim",f:"flustered",l:"casual",t:"แต่ก่อนข้อยคิดว่าความสุขคือชนะ… ตอนนี้คือได้นั่งตรงนี้นำเจ้า"},{n:"tabtim",f:"happy",l:"casual",t:"อย่าบอกไผเด้อว่าข้อยเว้าหวานเป็น!"}],
  conf:()=>[{n:"nar",t:"ทับทิมดึงคุณออกมาหลังค่าย ที่ที่เสียงหมอลำจากห้องเธอไม่ได้ยิน"},{n:"tabtim",f:"flustered",l:"casual",t:"ผู้จัดการ! ข้อยเว้าเทื่อเดียวเด้อ บ่ได้หยอกเล่นคือเทื่อก่อน"},{n:"tabtim",f:"flustered",l:"casual",t:"ข้อยมักเจ้าหลายแท้ …ตอบมาเลย ข้อยบ่ย้านคำตอบ"}],
  yes:()=>"…แท้บ่! ฮ่า ๆ ข้อยสิเว้าใส่ทั้งค่ายเลยเด้อ! …บ่ ๆ อายอยู่ ไว้ก่อน",no:"บ่เป็นหยังเด้อ ข้อยยังอยู่ค่ายนี้ ยังกินข้าวเหนียวนำกันทุกมื้อคือเก่า",bye:"…เข้าใจแล้วเด้อ ข้อยบ่โกรธ ข้อยแค่ต้องไปเตะกระสอบดัง ๆ จักพัก"},
 alicia:{letter:"ถึงผู้จัดการ\n\nสัญญากับเวกเตอร์หมดแล้ว ฉันไม่ต่อ และจะไม่เซ็นอะไรที่มีคำว่า \"ตลอดไป\" อย่างที่บอกไว้\n\nรินบอกว่าสัญญาค่ายศิริชัยมีแค่สองหน้า อ่านจบในห้านาที I'm interested. ไม่ได้แปลว่าอยากไปเพราะคุณนะ เพราะสัญญามันสั้นดี\n\nถ้ามีห้อง ส่งสัญญามา\n— Alicia",
  leave:[{n:"nar",t:"วันสุดท้ายที่ค่ายเวกเตอร์ ทีมสปอนเซอร์ขอให้อลิเซียไลฟ์อำลา"},{n:"alicia",f:"pout",l:"casual",t:"No. วันนี้ไม่ใช่คอนเทนต์"},
   {n:"nar",t:"เธอวางบัตรผ่านประตูไว้บนโต๊ะ ถอดสายรัดข้อมือของสปอนเซอร์ออก เหลือแค่ผ้าพันมือเก่าที่ซื้อเองตอนอายุสิบห้า"},{n:"alicia",f:"happy",l:"casual",t:"เบาตัวจัง… เรื่องแบบนี้ห้ามบอกใครนะ"}],
  arrive:[{n:"nar",t:"อลิเซียมาพร้อมกระเป๋าเดินทางห้าใบ สี่ใบเป็นชุด อีกใบเป็นขนมไทยชาววังสำหรับทั้งค่าย"},{n:"alicia",f:"flustered",l:"casual",t:"ไม่ได้ซื้อมาเอาใจใครนะ มือมันหยิบไปเอง"}],
  pair:"ฉันเตรียมตารางเวรล้างจานไว้แล้วค่ะ คุณอลิเซียได้วันพุธกับวันเสาร์",pairBack:"Fine. …ล้างจานต้องใช้น้ำยาตัวไหน",
  hang:[
   [{n:"nar",t:"อลิเซียขอให้ช่วยถือกล้อง แต่พอเปิดกล้องได้ เธอหันเลนส์มาที่คุณ"},{n:"alicia",f:"happy",l:"casual",t:"วันนี้ถ่ายคุณบ้าง คอนเทนต์ชื่อ 'ผู้จัดการที่ไม่ยอมยิ้ม'",choice:[
     {t:"ยิ้มให้กล้อง",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…ไม่ต้องยิ้มขนาดนั้นก็ได้ ไฟล์นี้ไม่โพสต์ เก็บไว้ดูเอง หมายถึงเก็บไว้ตรวจสอบ"}]},
     {t:"\"ถ่ายตัวเองดีกว่า สวยกว่า\"",b:4,then:[{n:"alicia",f:"pout",l:"casual",t:"รู้อยู่แล้ว ไม่ต้องบอก …แต่บอกอีกทีก็ได้"}]}]}],
   [{n:"nar",t:"อลิเซียนั่งอ่านคอมเมนต์ในโทรศัพท์ นิ้วหยุดที่ข้อความหนึ่งนานผิดปกติ"},{n:"alicia",f:"sad",l:"casual",t:"'ดังเพราะหน้าตา' …ยังมีคนพิมพ์มาอยู่ดี ทั้งที่ได้ถ้วยมาแล้ว",choice:[
     {t:"\"ถ้วยไม่ได้มาเพราะหน้าตา\"",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…I know. แต่พอคุณพูด มันฟังดูจริงกว่าตอนฉันพูดเอง"}]},
     {t:"ปิดหน้าจอให้เธอ",b:4,then:[{n:"alicia",f:"happy",l:"casual",t:"Rude. …ขอบคุณ"}]}]}],
   [{n:"nar",t:"รินกับอลิเซียนั่งตรวจสัญญาไฟต์ของค่ายด้วยกัน ปากกาแดงสองด้าม"},{n:"alicia",f:"happy",l:"casual",t:"ข้อ 6 ค่าตัวต่ำไป ผู้จัดการ ต่อรองเป็นไหม",choice:[
     {t:"\"สอนหน่อยสิ\"",b:5,then:[{n:"alicia",f:"happy",l:"casual",t:"บทเรียนที่หนึ่ง อย่ายิ้มก่อนอีกฝ่ายพูดตัวเลข …คุณยิ้มอยู่นั่นไง fail"}]},
     {t:"\"มีเธอกับรินอยู่แล้ว\"",b:4,then:[{n:"alicia",f:"flustered",l:"casual",t:"เอาเปรียบกันชัด ๆ …ก็ได้ ฉันทำให้"}]}]}]],
  love:[{n:"nar",t:"อลิเซียพาไปล่องเรือที่อยุธยาอีกครั้ง โทรศัพท์ของเธอปิดอยู่ในกระเป๋า"},{n:"alicia",f:"flustered",l:"casual",t:"ครั้งก่อนบอกว่าคืนนี้ไม่ใช่คอนเทนต์… ครั้งนี้ก็เหมือนกัน และครั้งหน้าด้วย"},{n:"alicia",f:"happy",l:"casual",t:"Don't get used to it. …ล้อเล่น get used to it"}],
  conf:()=>[{n:"nar",t:"อลิเซียปิดประตูห้องซ้อม ปิดไฟสปอตไลต์ เหลือแค่ไฟดวงเล็กเหนือกระสอบ"},{n:"alicia",f:"flustered",l:"casual",t:"Listen. ฉันพูดครั้งเดียว ไม่มีรีเทค"},{n:"alicia",f:"flustered",l:"casual",t:"ฉันชอบคุณ ไม่ใช่ในฐานะผู้จัดการ ตอบมาตรง ๆ ฉันไม่ชอบสัญญาที่อ่านไม่ออก"}],
  yes:()=>"…Deal. สัญญาฉบับนี้ไม่มีวันหมดอายุ แต่ก็ไม่มีคำว่าตลอดไปนะ ต้องต่อทุกวัน",no:"OK. ฉันเคารพคำตอบ …ไม่ได้ร้องไห้ ตาแห้งเฉย ๆ",bye:"…เข้าใจแล้ว ฉันไม่เซ็นอะไรที่อีกฝ่ายไม่อยากเซ็นอยู่แล้ว"},
 chaba:{letter:"ผู้จัดการ\n\nพี่ชายว่าให้มา\nบอกว่าอยู่ภูเก็ตคนเดียวได้ ดูแลตัวเองได้\n\nมะลิว่าห้องข้าง ๆ ยังว่าง\n\nถ้าม่ายว่างก็ม่ายเป็นไร\n— ชบา",
  leave:[{n:"nar",t:"ท่าเรือภูเก็ตตอนเช้า พี่ชายของชบาเข็นรถมาส่งถึงหน้าค่ายไชยาอันดามัน"},{n:"nar",t:"เขายื่นเปลือกหอยให้หนึ่งอัน \"เอาไปให้มะลิ บอกว่าพี่ฝาก\""},
   {n:"chaba",f:"sad",l:"casual",t:"…จะกลับมาทุกชักพระ ม่ายขาด"},{n:"nar",t:"ชบาขึ้นรถโดยไม่หันหลังกลับ จนพ้นโค้งแรกถึงยอมมองกระจก"}],
  arrive:[{n:"nar",t:"ชบามาถึงพร้อมเป้ใบเดียวกับถุงขนมลา"},{n:"chaba",f:"happy",l:"casual",t:"ผู้จัดการ ฝากด้วย"}],
  pair:"พี่ชบา! ห้องข้างมะลิค่ะ มะลิปูผ้าปูที่นอนลายดอกชบาไว้ให้ด้วย!",pairBack:"…ม่ายต้องก็ได้ (คืนนั้นทั้งค่ายเห็นว่าเธอนอนกอดหมอนลายเดียวกัน)",
  hang:[
   [{n:"nar",t:"ชบาซ่อมรั้วหลังค่ายอีกแล้ว ทั้งที่รั้วไม่ได้พัง"},{n:"chaba",f:"happy",l:"casual",t:"ส่งค้อนมา",choice:[
     {t:"ส่งค้อนแล้วจับไม้ให้",b:5,then:[{n:"nar",t:"สองชั่วโมงผ่านไปแทบไม่มีใครพูด รั้วแข็งแรงขึ้นกว่าเดิมมาก"},{n:"chaba",f:"happy",l:"casual",t:"…หรอย วันนี้"}]},
     {t:"\"รั้วไม่ได้พังนะ\"",b:3,then:[{n:"chaba",f:"pout",l:"casual",t:"รู้ อยากตอก"}]}]}],
   [{n:"nar",t:"แมวจรตัวหนึ่งมานอนบนตักชบา เธอนั่งนิ่งไม่ขยับมาสี่สิบนาทีแล้ว"},{n:"chaba",f:"flustered",l:"casual",t:"…ม่ายได้ชอบ มันมาเอง",choice:[
     {t:"นั่งลงข้าง ๆ ไม่พูดอะไร",b:5,then:[{n:"nar",t:"แมวย้ายมานอนตักคุณ ชบามองแมวแบบโดนหักหลัง แล้วหัวเราะออกมาเบา ๆ"}]},
     {t:"\"ตั้งชื่อให้มันไหม\"",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…ไข่เค็ม (มะลิได้ยินแล้วดีใจทั้งวัน)"}]}]}],
   [{n:"nar",t:"เย็นวันอาทิตย์ ชบาวิดีโอคอลกับพี่ชาย แล้วยื่นโทรศัพท์มาให้กลางสาย"},{n:"chaba",f:"flustered",l:"casual",t:"พี่อยากแหลงกับผู้จัดการ",choice:[
     {t:"\"ฝากน้องสาวไว้กับผมได้\"",b:5,then:[{n:"nar",t:"พี่ชายหัวเราะ ชบาแย่งโทรศัพท์คืนแล้ววางสายทันที หูแดงไปถึงคอ"}]},
     {t:"เล่าว่าชบาซ้อมหนักแค่ไหน",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…ม่ายต้องเล่าทุกเรื่องก็ได้"}]}]}]],
  love:[{n:"nar",t:"ชบาชวนออกไปทะเลตอนกลางคืน ขี่มอไซค์พ่วงข้างมาเอง ทั้งที่คุณมีรถ"},{n:"chaba",f:"flustered",l:"casual",t:"ให้นั่งคนแรกเหมือนเดิม"},{n:"chaba",f:"happy",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม ไซ ถามเหมือนเดิม"}],
  conf:()=>[{n:"nar",t:"ชบาเคาะประตูสามที แล้วยืนนิ่งอยู่นานจนคุณต้องเปิดเอง"},{n:"chaba",f:"flustered",l:"casual",t:"ผู้จัดการ"},{n:"nar",t:"ลมพัดผ่านไปหนึ่งรอบ"},{n:"chaba",f:"flustered",l:"casual",t:"…ชอบ แค่นั้น แหลงยาวม่ายเป็น"}],
  yes:()=>"…อืม (เธอจับมือคุณแน่น แล้วเดินกลับห้องไปเฉย ๆ)",no:"…ม่ายเป็นไร ยังซ่อมรั้วด้วยกันได้",bye:"…รู้แล้ว ม่ายต้องแหลงต่อ"}};
/* v1.91.30: champions who move in get a profile, gift tastes and gift lines like the main cast */
const RG_PROF={
 baibua:{height:"165 ซม.",blood:"A",bday:"12 พฤศจิกายน (ยี่เป็ง)",home:"เชียงใหม่ · บ้านไม้หลังค่ายเล็กของพ่อ",heritage:"มวยท่าเสา (สายเดียวกับกะทิ)",
  personality:"ขี้อาย สำรวม พูดเสียงเบา ขอโทษก่อนสวนศอกทุกครั้ง แต่บนเวทีไม่เคยถอย",likes:["ข้าวซอยร้านลับหลังตลาด","หมอกตอนเช้ามืด","ปักผ้าลายตีนจก"],
  dislikes:["ถูกจ้องหน้าตอนพูด","กล้องถ่ายรูป","อาหารที่ไม่เผ็ด"],hobby:"ปักผ้าตีนจกให้คนที่สำคัญ ปักช้าเพราะอยากให้เสร็จทีหลัง",
  story:"แบกค่ายเล็กของพ่อมาคนเดียวตั้งแต่พ่อเข่าเจ็บ ทั้งซ้อม ทั้งล้างจาน ทั้งทำบัญชี จนมาเห็นค่ายศิริชัยที่ทุกคนช่วยกัน",secret:"จดหมายสัญญาฉบับแรกมีประโยคหนึ่งที่เขียนแล้วลบ ลบจนกระดาษบาง"},
 tabtim:{height:"168 ซม.",blood:"B",bday:"14 เมษายน",home:"โคราช · บ้านทุ่งนาที่พ่อเคยชกมวยงานวัด",heritage:"มวยโคราช (สายเดียวกับพลอย)",
  personality:"เสียงดัง หัวเราะง่าย ร้องไห้ง่ายกว่า นอกเวทีบ้า ๆ บนเวทีคำนวณทุกก้าว",likes:["ส้มตำพริกสิบเม็ด","หมอลำซิ่ง","ไก่ย่างกับข้าวเหนียวร้อน ๆ"],
  dislikes:["ความเงียบนาน ๆ","กินข้าวคนเดียว","คนที่ดูถูกเด็กบ้านนอก"],hobby:"ฟ้อนอยู่คนเดียวกลางลานตอนไม่มีใครดู (ทุกคนดูอยู่)",
  story:"ชกเพื่อส่งน้องชายเรียนนิติฯ พ่อเป็นนักมวยงานวัดที่ไม่เคยมาดูเธอชก จนวันที่เธอได้ถ้วยภาคอีสาน",secret:"ซ้อมพูดคำว่า \"มัก\" หน้ากระจกมาสามอาทิตย์ก่อนพูดจริง"},
 alicia:{height:"170 ซม.",blood:"AB",bday:"1 มกราคม",home:"กรุงเทพฯ · คอนโดที่สปอนเซอร์เช่าให้ (ย้ายออกแล้ว)",heritage:"มวยลพบุรี (สายเดียวกับริน)",
  personality:"ซึนเดเระ ปากแข็ง ทำงานหนักกว่าที่ยอมให้ใครเห็น พูดไทยปนอังกฤษเวลาเขิน",likes:["ขนมไทยชาววัง","ล่องเรือตอนกลางคืน","สัญญาที่อ่านจบในห้านาที"],
  dislikes:["คำว่า 'ดังเพราะหน้าตา'","สัญญาที่มีคำว่าตลอดไป","ถูกสั่งให้ยิ้ม"],hobby:"ตัดต่อคลิปซ้อมของตัวเองตอนตีสอง แต่ไม่เคยโพสต์",
  story:"ดังตั้งแต่ไฟต์แรกเพราะหน้าตา เลยซ้อมหนักกว่าทุกคนเพื่อให้คนจำหมัด ไม่ใช่หน้า",secret:"ผ้าพันมือคู่แรกที่ซื้อเองตอนสิบห้ายังพกติดกระเป๋า ทั้งที่ขาดไปครึ่งหนึ่งแล้ว"},
 chaba:{height:"160 ซม.",blood:"O",bday:"5 ตุลาคม",home:"เกิดที่ไชยา ข้างบ้านมะลิ · โตที่ภูเก็ต",heritage:"มวยไชยา (สายเดียวกับมะลิ)",
  personality:"นิ่ง พูดน้อย ตลกหน้าตาย แพ้ของน่ารักทุกชนิด",likes:["ข้าวยำ","แมวจร","ทะเลตอนกลางคืน"],
  dislikes:["คนพูดยาว","กล้องที่ถ่ายพี่ชาย","ถูกถามว่าเหนื่อยไหม"],hobby:"ซ่อมของที่ไม่ได้พัง",
  story:"พี่ชายเรือคว่ำจนต้องนั่งรถเข็น ชบาชกแทนตั้งแต่คืนนั้น และย้ายจากไชยาไปภูเก็ตโดยไม่ได้ลามะลิ",secret:"จดหมายถึงมะลิ 11 ฉบับที่ไม่เคยส่ง เธอยังจำได้ทุกบรรทัด"}};
const RG_GPREF={baibua:{love:["malai","tea","n_umbrella"],like:["sketch","wrap","khanom","photo"],dislike:["coffee"]},
 tabtim:{love:["sausage","i_pillow","photo"],like:["khanom","stickers","shorts","doll"],dislike:["book"]},
 alicia:{love:["bracelet","c_khon","spa"],like:["tea","sketch","photo","coffee"],dislike:["sausage"]},
 chaba:{love:["doll","s_talung","s_pearl"],like:["khanom","wrap","photo"],dislike:["stickers"]}};
const RG_GLINES={baibua:{love:"…ของหนูแท้ ๆ ก่อเจ้า หนูจะเก็บไว้ดี ๆ เน้อ",like:"ขอบใจเจ้า น่ารักแท้",ok:"ขอบใจเจ้า",dislike:"…หนูจะลองดูเน้อเจ้า"},
 tabtim:{love:"โอ๊ย! อันนี้แหละที่ข้อยอยากได้! มักหลายเด้อ!",like:"ขอบใจเด้อ! ข้อยสิใช้ทุกมื้อเลย",ok:"ขอบใจหลายเด้อ",dislike:"…อันนี้ข้อยอ่านแล้วง่วงเด้อ แต่ขอบใจ"},
 alicia:{love:"…รู้ได้ไงว่าฉันชอบ ไม่ได้ดีใจนะ แค่… thank you",like:"รสนิยมไม่แย่ ใช้ได้",ok:"ขอบคุณ",dislike:"ฉันไม่กินของมันเยอะ ๆ หรอก …แต่ขอบคุณ"},
 chaba:{love:"……(กอดไว้แน่นแล้วหันหน้าหนี)",like:"…ชอบ",ok:"ขอบคุณ",dislike:"…วางไว้ตรงนั้นแหละ"}};
for(const cid of Object.keys(RG_PROF)){RG_PROF[cid].age=18+stableHash(cid+"age")%13; /* the age she always had */if(typeof PROFILES!=="undefined"&&!PROFILES[cid])PROFILES[cid]=RG_PROF[cid];if(typeof GIFT_PREF!=="undefined"&&!GIFT_PREF[cid])GIFT_PREF[cid]=RG_GPREF[cid];
  if(typeof GIFT_LINES!=="undefined"&&!GIFT_LINES[cid])GIFT_LINES[cid]=RG_GLINES[cid];if(typeof SOUV_LOVE!=="undefined"&&!SOUV_LOVE[cid])SOUV_LOVE[cid]=RG_GPREF[cid].love.filter(g=>GIFTS[g]&&GIFTS[g].souv);}
/* the girl closest to you who notices a champion lover while you are with her */
const RG_TWO={kati:"ครูคะ… หนูได้ยินมาแล้วค่ะ หนูไม่ถามก็ได้ แต่หนูไม่ได้ไม่รู้นะคะ",mali:"มะลิเห็นนะคะว่าใครเดินจับมือใครเมื่อคืน… มะลิไม่ร้องไห้หรอก ไม่ร้องหรอก",
 baibua:"…หนูเห็นแล้วเจ้า หนูบ่ถามก็ได้ แต่ใจมันบ่ได้บ่รู้เจ้า",tabtim:"ผู้จัดการ… ข้อยบ่ได้โง่เด้อ ข้อยเห็นอยู่ ข้อยแค่บ่เว้า",alicia:"I'm not blind. …ฉันแค่ยังไม่ตัดสินใจว่าจะโกรธแค่ไหน",chaba:"…เห็นแล้ว",
 rin:"ช่วงนี้เวลาที่คุณหายไปไม่ตรงกับตารางค่ะ ฉันบันทึกไว้แล้ว ไม่ได้ต้องการคำอธิบาย แค่อยากให้รู้ว่าฉันรู้",ploy:"…ไม่ต้องพูด ฉันเห็นแล้ว",fah:"นี่! คิดว่าฟ้าตาบอดเหรอ! …ไม่ต้องตอบ ฟ้าไปซ้อมก่อน"};
Object.assign(REGION,{
  /* v1.91.30 (Man): champions you know show in the Characters tab — before she moves in, her hearts follow your closeness with her */
  bondSync(G){const R=G.region;if(!R)return;for(const cid of Object.values(RG_CID0)){const f=G.F[cid];if(f&&!Number.isFinite(f.age)){delete f.ageAnchorWeek;delete f.age;if(typeof syncFighterAges==="function")syncFighterAges(G);}}for(const r of RG_ORDER){const cid=RG_CID0[r],f=G.F[cid];if(!f||(R.joined&&R.joined[cid]))continue;f.bond=rgBondOf((R.meet||{})[cid]);f.bondX=0;}},
  peopleIds(G){const R=G.region;if(!R)return [];return RG_ORDER.map(r=>RG_CID0[r]).filter(cid=>{const f=G.F[cid];return f&&((R.joined&&R.joined[cid]&&f.camp==="player")||f.met||((R.meet||{})[cid]>0));});},
  campOf(cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid);return r?{north:"แชมป์ภาคเหนือ",isan:"แชมป์ภาคอีสาน",central:"แชมป์ภาคกลาง",south:"แชมป์ภาคใต้"}[r]:"";},
  /* her move from her champion days, shown in the skill tab like a signature */
  perkCard(f){const r=f&&RG_ORDER.find(x=>RG_CID0[x]===f.id),R=G.region;if(!r||!R||!R.joined||!R.joined[f.id])return "";const P=RG_CH0[r].perk;
    return `<div class="sigcard on rg-perk"><b>✦ ท่าประจำตัว: ${esc(P.name)}</b><p class="meta">${esc(P.desc)} · ติดตัวมาตั้งแต่เป็นแชมป์${esc(RG0[r].name)} มีผลทุกไฟต์ ไม่ต้องใส่ช่องสกิล</p></div>`;},
  joinRooms(G){const R=G.region,J=R.joined||{};return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player").length+Object.keys(J).filter(c=>G.F[c]&&G.F[c].camp==="player").length;},
  /* the champion's skill tree is her lineage's — the partner girl's tree (Tha Sao / Korat / Lopburi / Chaiya) */
  joinSkills(G){const J=(G.region&&G.region.joined)||{};for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(!J[cid])continue;if(!SKILLS[cid]&&SKILLS[pr])SKILLS[cid]=SKILLS[pr];
    /* v1.91.38: in the camp she fights like a main-cast fighter on her lineage's lines — her own home line, the line's style, the same per-line balance as her partner */
    if(typeof HOME_STYLE!=="undefined"&&!HOME_STYLE[cid]){const L=RG_HOME_LINE[cid],sch=(SKILLS[pr]||[]).find(s=>s.school&&s.school!=="build");HOME_LINE[cid]=L;HOME_STYLE[cid]=((LINE_STYLE[sch&&sch.school]||[])[L])||HOME_STYLE[pr];if(LINE_K[pr]&&!LINE_K[cid])LINE_K[cid]=LINE_K[pr];}}},
  joinWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||!F.won||now<(F.wonAbs||0)+3)return;R.joined=R.joined||{};R.offers=R.offers||[];R.joinQ=R.joinQ||[];R.offers=R.offers.filter(c=>!R.joined[c]);R.joinQ=R.joinQ.filter(c=>!R.joined[c]&&!(R.joinPend&&R.joinPend.cid===c));
    const m=R.meet||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&!(R.champ[r]&&R.champ[r].state==="won"))continue;if(!R.joined[cid]&&!(R.joinPend&&R.joinPend.cid===cid)&&!R.offers.includes(cid)&&!R.joinQ.includes(cid)&&!(R.joinGone||{})[cid]&&(m[cid]||0)>=RG_JOIN_MIN)R.joinQ.push(cid);}
    R.joinQ.sort((a,b)=>(m[b]||0)-(m[a]||0));
    if(R.joinQ.length&&now>=(R.joinNext||0)){const cid=R.joinQ.shift(),r=RG_ORDER.find(x=>RG_CID0[x]===cid);R.offers.push(cid);R.joinNext=now+RG_JOIN_GAP;
      addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`ใบสมัครจาก${RG[r].champ}`,body:RG_JOIN[cid].letter+`\n\n(สัญญา: ค่าเซ็น ${fmt(RG_JOIN_FEE)} · ค่าจ้าง ${fmt(RG_JOIN_WAGE)}/สัปดาห์ · ลักษณะพิเศษ: ${RG_TRAIT[cid].name} · ดูสัญญาที่หน้าค่าย › ครู & นักมวย)`});}},
  joinOk(G,cid){const R=G.region;if(!R.offers||!R.offers.includes(cid)||(R.joined&&R.joined[cid]))return "ไม่มีสัญญานี้";if(R.joinPend)return "รอคนที่ตอบรับไปก่อนหน้าย้ายมาก่อน";{const r=RG_ORDER.find(x=>RG_CID0[x]===cid);if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&R.champ[r]&&R.champ[r].state!=="won")return "เธอกำลังป้องกันแชมป์ภาค · ชนะถ้วยครั้งนี้ก่อน";}
    if(this.joinRooms(G)>=dormRooms(G))return `ห้องพักเต็ม (${dormRooms(G)} ห้อง) · อัปเกรดหอพักก่อน`;if(G.cash<RG_JOIN_FEE)return `เงินไม่พอ · ค่าเซ็น ${fmt(RG_JOIN_FEE)}`;return "";},
  joinAccept(G,cid){const why=this.joinOk(G,cid);if(why){toast(why);return;}const R=G.region;G.cash-=RG_JOIN_FEE;R.offers=R.offers.filter(x=>x!==cid);R.joinPend={cid,abs:gameWeek(G)+1};
    G.log=G.log||[];G.log.push(`เซ็นสัญญากับ${G.F[cid]?G.F[cid].name:cid} · ค่าเซ็น ${fmt(RG_JOIN_FEE)} · ย้ายมาสัปดาห์หน้า`);toast(`เซ็นสัญญาแล้ว · ${G.F[cid]?G.F[cid].name:""}ย้ายมาสัปดาห์หน้า`);},
  joinApply(G,cid){if(G.region.joined&&G.region.joined[cid])return; /* v1.91.35: never twice */const R=G.region,r=RG_ORDER.find(x=>RG_CID0[x]===cid),f=G.F[cid]||this.champFighter(G,r),pair=G.F[RG_CH[r].pair],now=gameWeek(G);
    f.camp="player";f.canon=true;f.met=true;f.div=(pair&&(pair.div==="A"||pair.div==="B"))?pair.div:"A";
    f.lvl=Math.max(12,(f.lvl||14)-4);for(const k in f.a)f.a[k]=Math.min(20,f.a[k]);f.vet=0; /* v1.91.39 (Man): she keeps her stats from her champion days, only her level rolls back 4 (her ring craft stays behind) */
    f.sp=(f.sp||0)+3*Math.max(0,f.lvl-1);f.spv=2; /* v1.91.36: the same 3 points a level the main cast earns on a tree */f.xp=0;f.skills=f.skills||{};f.wage=RG_JOIN_WAGE;f.fee=0;f.potential=20;f.fatigue=0;f.injury=0;f.morale=80;f.trust=Math.max(f.trust||0,50);
    f.bond=Math.max(f.bond||0,Math.max(30,rgBondOf(R.meet[cid])));f.joinAbs=now;f.lastTouch=absWeek(G);delete f.rgKey;delete f.rgT;delete f.rgSty;
    G.rank=G.rank||{A:{},B:{}};G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
    (R.joined=R.joined||{})[cid]=now;this.joinSkills(G);
    /* v1.91.39 (Man): she arrives with her skills already learned along her own line, like a fighter who has been building for years — the player can look and reset */
    {const L=RG_HOME_LINE[cid],ord=[...skillList(cid)].sort((x,y)=>((x.line===L?0:x.school==="build"?1:2)-(y.line===L?0:y.school==="build"?1:2)));let go=true;for(let i=0;go&&f.sp>0&&i<400;i++){go=false;for(const sk of ord){if(f.sp>0&&learnSkill(G,cid,sk.id)){go=true;break;}}}}if(typeof syncFighterAges==="function")syncFighterAges(G);
    G.log=G.log||[];G.log.push(`${f.name}ย้ายเข้าค่ายศิริชัย · Lv.${f.lvl} · แต้มสกิล ${f.sp}`);},
  joinSteps(G,cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid),J=RG_JOIN[cid],pid=RG_CH[r].pair,pf=G.F[pid],top=typeof rgTopGirl==="function"?rgTopGirl(G):null;
    const S=[...J.leave,{n:"nar",t:"สัปดาห์นี้ ค่ายศิริชัยมีสมาชิกใหม่"},...J.arrive];
    if(pf&&pf.camp==="player")S.push({n:pid,f:"happy",l:"casual",t:J.pair},{n:cid,f:"happy",l:"casual",t:J.pairBack});
    else S.push({n:"coach",t:`ห้องปลายทางเดินว่างอยู่ ${RG[r].champ} เอาห้องนั้นไป ข้าวเย็นหกโมงตรง มาสายไม่มีกับข้าว`});
    if(top&&top.id!==pid)S.push({n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,RG[r].champ)});
    S.push({n:"nar",t:`${RG[r].champ}เข้าค่ายแล้ว · ซ้อม ชก และใช้เวลาด้วยกันได้จากหน้าศึกชิงเจ้าสี่ภาค · ได้แต้มสกิลสายเดียวกับ${pf?pf.name:"คู่ร่วมสาย"}`});return S;},
  /* romance: one-love or two-timing, never the harem team */
  isLovC(G,cid){const L=G.region&&G.region.lov;return !!(L&&L[cid]!=null);},
  confDue(G){const R=G.region,J=R.joined||{},now=gameWeek(G);R.confN=R.confN||{};R.confNo=R.confNo||{};
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||this.isLovC(G,cid)||(R.ex&&R.ex[cid]!=null)||isAway(G,cid))continue;
      if((f.bond||0)<75||now-(J[cid]||now)<6||(R.confN[cid]||0)>=3)continue;if(R.confNo[cid]!=null&&now-R.confNo[cid]<13)continue;return cid;}return null;},
  confSteps(G,cid){const J=RG_JOIN[cid],R=G.region,two=partners(G).length>0||Object.keys(R.lov||{}).some(k=>k!==cid);R.confN[cid]=(R.confN[cid]||0)+1;
    const warn=two?[{n:"nar",t:"⚠ คุณมีคนรักอยู่แล้ว ถ้าตอบรับจะกลายเป็นคบซ้อน… แชมป์ภาคเข้าทีมฮาเร็มไม่ได้"}]:[];
    return [...J.conf(G),...warn,{n:"nar",t:"เธอรอคำตอบ",choice:[
      {t:two?"\"ฉันก็ชอบเธอ\" (คบซ้อน)":"\"ฉันก็ชอบเธอ\"",fx:G2=>REGION.takeC(G2,cid),then:[{n:cid,f:"happy",l:"casual",t:J.yes(G)}]},
      {t:"\"ขอเป็นแบบนี้ไปก่อนนะ\"",fx:G2=>{G2.region.confNo[cid]=gameWeek(G2);add(G2,cid,"trust",3);},then:[{n:cid,f:"sad",l:"casual",t:J.no}]}]}];},
  takeC(G,cid){const R=G.region,now=gameWeek(G);R.lov=R.lov||{};const P=[...partners(G),...Object.keys(R.lov).filter(k=>k!==cid&&G.F[k])];R.lov[cid]=now;if(P.length&&G.mono)delete G.mono;if(R.ex)delete R.ex[cid];const f=G.F[cid];if(f)f.morale=Math.min(100,(f.morale||0)+15);
    if(P.length){const top=P.map(k=>G.F[k]).filter(Boolean).sort((a,b)=>((b.bond||0)+(b.bondX||0))-((a.bond||0)+(a.bondX||0)))[0];if(top)R.twoQ={id:top.id,cid,abs:now+3};}
    G.log=G.log||[];G.log.push(`${f?f.name:cid}กับผู้จัดการตกลงคบกัน${P.length?" (คบซ้อน)":""}`);},
  breakC(G,cid){const R=G.region,f=G.F[cid];if(!this.isLovC(G,cid))return;delete R.lov[cid];(R.ex=R.ex||{})[cid]=gameWeek(G);if(R.twoQ&&R.twoQ.cid===cid)delete R.twoQ;if(f)add(G,cid,"bond",-35);},
  hangC(G,cid){const f=G.F[cid];if(!f||G.freeUsed||isAway(G,cid))return;const J=RG_JOIN[cid],R=G.region;R.hangI=R.hangI||{};const i=R.hangI[cid]||0,lov=this.isLovC(G,cid);
    const P=lov&&i%2===1?J.love:J.hang[Math.floor(i/(lov?2:1))%J.hang.length];R.hangI[cid]=i+1;G.freeUsed=true;f.hangWk=G.week;
    const S=P.map(x=>x.choice?{...x,choice:x.choice.map(o=>({t:o.t,fx:G2=>{add(G2,cid,"bond",o.b);add(G2,cid,"morale",3);},then:o.then}))}:{...x});
    if(!S.some(x=>x.choice))S.push({fx:G2=>{add(G2,cid,"bond",5);add(G2,cid,"morale",3);}});
    save();playScene(S,()=>{save();render();},{bg:"camp",look:"casual"});},
  /* v1.91.30 (Man): contracts show where every contract shows (camp › trainers & fighters); the champions who moved in live in the Characters tab */
  joinCard(G){const R=G.region;return R&&R.joinPend&&G.F[R.joinPend.cid]?`<section class="px card rg-join"><p class="meta">🏠 ${esc(G.F[R.joinPend.cid].name)}กำลังย้ายมา · ถึงค่ายสัปดาห์หน้า</p></section>`:"";},
  recruitHTML(G){const R=G.region,offers=(R&&R.offers||[]).filter(cid=>G.F[cid]);if(!offers.length)return "";
    return `<section class="px card recruit rg-recruit"><h3><span class="newb">NEW!</span> แชมป์ภาคอยากเข้าค่าย</h3>${offers.map(cid=>{const f=G.F[cid],r=RG_ORDER.find(x=>RG_CID0[x]===cid),T=RG_TRAIT[cid],why=this.joinOk(G,cid);
      return `<div class="rcard"><button class="rface" data-act="fighter" data-id="${cid}" aria-label="ดูข้อมูล ${esc(f.name)}"><img src="${faceSrc(cid,"happy")}" alt=""></button>
       <div class="rinfo"><b>${esc(f.name)} <small>แชมป์${esc(RG[r].name)}</small></b><span class="meta">ลักษณะพิเศษ <b class="goldt">${esc(T.name)}</b> · ${esc(T.desc)}</span><span class="meta">ค่าเซ็น ${fmt(RG_JOIN_FEE)} · ค่าจ้าง ${fmt(RG_JOIN_WAGE)}/สัปดาห์ · ห้องพัก ${this.joinRooms(G)}/${dormRooms(G)}</span>${why?`<span class="meta redt">${esc(why)}</span>`:""}</div>
       <div class="rbtns"><button class="btn sm" data-act="fighter" data-id="${cid}">ดูข้อมูล</button><button class="btn sm gold" data-act="rgjoin" data-v="${cid}" ${why?"disabled":""}>เซ็นสัญญา</button></div></div>`;}).join("")}
     <p class="meta">ฝีมือลดจากตอนเป็นแชมป์แค่นิดเดียว · ไม่ตอบก็ได้ สัญญายังรออยู่</p></section>`;},
  /* the camp-wide side of each champion's trait, once a week */
  joinPerks(G){const J=(G.region&&G.region.joined)||{},mine=roster(G);
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||isAway(G,cid))continue;
      if(cid==="baibua")for(const x of mine)if(x.id!==cid){const cap=stCap(x);for(const k of ["elbow","counter"])if(x.a[k]<17)x.a[k]=Math.min(cap,Math.round((x.a[k]+.04)*100)/100);} /* she teaches the ones still learning */
      if(cid==="tabtim")for(const x of mine)x.morale=Math.min(100,(x.morale||0)+2);
      if(cid==="alicia"){const v=Math.round((1500+Math.min(G.rep||0,60)*60)/100)*100;G.cash+=v;G.rep=Math.round(((G.rep||0)+.05)*100)/100;G.log=G.log||[];G.log.push(`อลิเซียไลฟ์ซ้อมกับค่าย · ค่าโฆษณา ${fmt(v)}`);}
      if(cid==="chaba")for(const x of mine)if(x.injury>0)x.injury=Math.max(0,x.injury-1);}},

});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgjoin:d=>{REGION.joinAccept(G,d.v);save();render();},
  rghang:d=>REGION.hangC(G,d.v),
  rgbreak:d=>{if(!REGION.isLovC(G,d.v))return;UI.modal={type:"rgbreak",cid:d.v};render();},
  rgbreakgo:d=>{const cid=d.v,J=RG_JOIN[cid];UI.modal=null;if(!REGION.isLovC(G,cid))return;REGION.breakC(G,cid);
    playScene([{n:cid,f:"sad",l:"casual",t:J.bye},{n:"nar",t:`${G.F[cid].name}กับผู้จัดการเลิกกันแล้ว · เธอยังอยู่ค่ายต่อ`}],()=>{save();render();},{bg:"camp_night",look:"casual"});},
});
if(typeof XMODAL!=="undefined")XMODAL.rgbreak=m=>({body:`<h2>ขอเลิกกับ${esc(G.F[m.cid].name)}?</h2><p>ความสนิทจะลดลงมาก · เธอยังอยู่ค่ายต่อ แต่จะไม่สารภาพรักอีก</p><div class="mfoot"><button class="btn" data-act="closeModal">ไม่ใช่ตอนนี้</button><button class="btn primary" data-act="rgbreakgo" data-v="${m.cid}">ขอเลิก</button></div>`,foot:false});
/* ---------- v1.91.34 the Four Regions every 3 years (Man) ----------
   · a new edition opens 3 years after the last one began (the first needs its underground final won), never mid-trip or mid-series
   · province champions are decided by the bots: a 4-woman bracket per province (last edition's holder + 3 challengers), real quick fights — whoever wins holds the belt, each with her own history
   · a regional champion still at her own camp returns stronger; one who moved in to Sirichai is replaced by a new champion (a bracket of the four province runners-up)
   · regional champion data is swapped into the shared tables (RG / RG_CID / champId / RG_CH) per save by rgApply */
const RG_LOOP={wk:156,rest:26,eb:.2,cb:.3,nb:.15,cap:3};
const RG_CH0={...RG_CH};
const RG_FN=["ดาวเรือง","แพรวา","ขวัญใจ","นิลุบล","อำพัน","รุ้งนภา","จันทร์เพ็ญ","บุษบา","ลำดวน","ประกาย","มุกดา","ทองกวาว","พิกุล","กาหลง","ลีลาวดี","เกดแก้ว","สายไหม","น้ำค้าง","แก้วตา","ใบเตย","มะปราง","ส้มโอ","บัวผัน","จำปา","ชมพู่","ผกากรอง","เรไร","ปาริชาติ","บุหงา","อัญชัน","ดาหลา","ราตรี","เฟื่องฟ้า","พุดซ้อน","ยี่หุบ","การะเกด","สร้อยทอง","นวลจันทร์"];
const RG_PRE=["ส.","ศิษย์","ลูก"];
const RG_PL={chiangrai:["เชียงแสน","ดอยตุง","แม่จัน"],nan:["ปัว","บ่อเกลือ","เวียงสา"],uttaradit:["ลับแล","ท่าปลา","พิชัย"],lampang:["เกาะคา","แจ้ห่ม","เถิน"],
 udon:["กุมภวาปี","บ้านเชียง","หนองหาน"],khonkaen:["ภูเวียง","ชุมแพ","น้ำพอง"],buriram:["นางรอง","ประโคนชัย","ลำปลายมาศ"],ubon:["พิบูลฯ","โขงเจียม","วารินฯ"],
 lopburi:["บ้านหมี่","ท่าวุ้ง","โคกสำโรง"],suphan:["อู่ทอง","สองพี่น้อง","บางปลาม้า"],phetchaburi:["ชะอำ","บ้านลาด","ท่ายาง"],chanthaburi:["ท่าใหม่","ขลุง","แหลมสิงห์"],
 chumphon:["หลังสวน","ปากน้ำ","ท่าแซะ"],surat:["ดอนสัก","เกาะสมุย","พุนพิน"],nakhonsi:["ปากพนัง","ทุ่งสง","ขนอม"],songkhla:["สทิงพระ","ระโนด","จะนะ"]};
const RG_FN_EN=["Daoruang", "Praewa", "Khwanjai", "Nilubon", "Amphan", "Rungnapha", "Janpen", "Butsaba", "Lamduan", "Prakai", "Mukda", "Thongkwao", "Phikun", "Kalong", "Leelawadee", "Ketkaew", "Saimai", "Namkhang", "Kaewta", "Baitoey", "Maprang", "Som-o", "Buaphan", "Champa", "Chomphu", "Phakakrong", "Rerai", "Parichat", "Bunga", "Anchan", "Dala", "Ratri", "Fueangfa", "Phutson", "Yihup", "Karaket", "Soithong", "Nuanchan"],RG_PRE_EN=["Sor.","Sit ","Luk "],RG_PL_EN={chiangrai: ["Chiang Saen", "Doi Tung", "Mae Chan"], "nan": ["Pua", "Bo Kluea", "Wiang Sa"], "uttaradit": ["Laplae", "Tha Pla", "Phichai"], "lampang": ["Ko Kha", "Chae Hom", "Thoen"], "udon": ["Kumphawapi", "Ban Chiang", "Nong Han"], "khonkaen": ["Phu Wiang", "Chum Phae", "Nam Phong"], "buriram": ["Nang Rong", "Prakhon Chai", "Lam Plai Mat"], "ubon": ["Phibun", "Khong Chiam", "Warin"], "lopburi": ["Ban Mi", "Tha Wung", "Khok Samrong"], "suphan": ["U Thong", "Song Phi Nong", "Bang Pla Ma"], "phetchaburi": ["Cha-am", "Ban Lat", "Tha Yang"], "chanthaburi": ["Tha Mai", "Khlung", "Laem Sing"], "chumphon": ["Lang Suan", "Pak Nam", "Tha Sae"], "surat": ["Don Sak", "Ko Samui", "Phunphin"], "nakhonsi": ["Pak Phanang", "Thung Song", "Khanom"], "songkhla": ["Sathing Phra", "Ranot", "Chana"]};
const RG_TR=["ลูกสาวชาวนา ซ้อมเตะกับกระสอบข้าวเปลือกในยุ้งฉาง","เคยเป็นนักกรีฑาโรงเรียน เปลี่ยนมาชกมวยตอนสิบหก","พ่อเป็นกรรมการมวยงานวัด ดูไฟต์มาตั้งแต่จำความได้",
 "ขายลูกชิ้นหน้าเวทีมวยทุกคืน จนเจ้าของค่ายชวนลองขึ้นชก","ชกเพื่อส่งน้องสองคนเรียน","อดีตนักเทควันโดทีมจังหวัด เตะหนักแต่ยังคุมระยะไม่นิ่ง",
 "วิ่งขึ้นบันไดวัดสามร้อยขั้นทุกเช้า","ขับรถส่งของตอนกลางวัน ซ้อมตอนกลางคืน","หลานครูมวยรุ่นเก่า ได้มงคลของตามาใส่ขึ้นชก",
 "แพ้น็อกยกแรกในไฟต์แรก แล้วไม่เคยแพ้น็อกอีกเลย","นักศึกษาพยาบาล ลาเรียนครึ่งปีเพื่อลองชิงเข็มขัด","ซ้อมกับพี่สาวฝาแฝดที่ชกรุ่นเดียวกัน",
 "ไลฟ์ซ้อมทุกวัน มีคนดูประจำห้าสิบคน","หัดมวยจากคลิปในโทรศัพท์ก่อนมีค่ายรับ","ทำงานโรงงานกะดึก แล้วไปซ้อมตอนเช้า","เคยเป็นคู่ซ้อมของแชมป์ภาคคนก่อน"];
const RG_NK={north:["ราชินีศอกล้านนา","เสือดาวดอย","ดาบคู่ลับแล"],isan:["พายุลูกเตะอีสาน","ราชินีทุ่งกุลา","ไหมทองหมัดหนัก"],
 central:["นางพญาเจ้าพระยา","เพชรเมืองเพชร","ลิงทองลพบุรี"],south:["คลื่นยักษ์อันดามัน","เหยี่ยวทะเลใต้","พายุเกาะสมุย"]};
const RG_NFX={north:{name:"ศอกแห่งขุนเขา",desc:"สวนกลับบ่อยขึ้น 4% · ศอกแรงขึ้น 10%",fx:{ctr:.04,dmg:{elbow:.1}}},isan:{name:"เตะเปิดทุ่ง",desc:"เตะแม่นขึ้น 3% · เตะแรงขึ้น 8%",fx:{hit:{kick:.03},dmg:{kick:.08}}},
 central:{name:"หมัดเจ้าพระยา",desc:"หมัดแรงขึ้น 10% · กันวงในดีขึ้น",fx:{dmg:{punch:.1},clDef:1}},south:{name:"คลื่นซัดฝั่ง",desc:"หลบได้ดีขึ้น 1.5% · ฟื้นแรงเร็วขึ้น 10%",fx:{evade:.015,regen:.1}}};
/* a returning champion writes again */
const RG_RET={baibua:"ผู้จัดการเจ้า\n\nศึกชิงเจ้าสี่ภาคเวียนมาอีกรอบแล้วเจ้า หนูยังเป็นแชมป์ภาคเหนืออยู่เน้อ\n\nสามปีนี้หนูซ้อมศอกทุกเช้า บ่ได้ขาดสักวัน คราวนี้หนูบ่ยอมง่าย ๆ แล้วเจ้า\n\nรอที่เชียงใหม่เน้อ\n— ใบบัว",
 tabtim:"ผู้จัดการเด้อ!\n\nทับทิมกลับมาแล้ว! ถ้วยอีสานยังอยู่โคราชเด้อ ไผอยากได้กะมาเอาเอง\n\nสามปีนี้ข้อยเตะต้นกล้วยล้มไปหลายต้นแล้ว ฮ่า ๆ มาเบิ่งกันเด้อ\n\n— ทับทิม",
 alicia:"ถึงผู้จัดการ\n\nถ้วยภาคกลางยังเป็นของฉัน ไม่ต้องแปลกใจ\n\nสามปีที่ผ่านมาฉันซ้อมโดยไม่เปิดกล้องเลยสักครั้ง ครั้งนี้ไม่ใช่คอนเทนต์ Bring your best.\n\n— Alicia",
 chaba:"ผู้จัดการ\n\nถ้วยยังอยู่ภูเก็ต\n\nซ้อมมาสามปี ม่ายได้หยุด\n\nมาเลย\n— ชบา"};
const rgEd=G=>(G.region&&G.region.edition)||1;
const rgEdB=(G,k)=>RG_LOOP[k]*Math.min(RG_LOOP.cap,rgEd(G)-1);
const rgEN=()=>typeof CUR_LANG!=="undefined"&&CUR_LANG==="en"; /* names and places are spelled, not translated */
const rgNm=(o,dest)=>{if(!o)return "";const e=rgEN(),N=e?RG_FN_EN:RG_FN,P=e?RG_PRE_EN:RG_PRE,L=e?RG_PL_EN:RG_PL;return `${N[o.f%N.length]} ${P[o.k%P.length]}${(L[dest]||L.chiangrai)[o.p%3]}`;};
/* swap this save's regional champions into the shared tables (idempotent) */
function rgApply(G){const R=G&&G.region,key=R?`${rgEd(G)}|${JSON.stringify(R.nc||{})}`:"-";if(rgApply.k===key&&rgApply.g===G)return;rgApply.k=key;rgApply.g=G;
  for(const r of RG_ORDER){const N=R&&R.nc&&R.nc[r],ret=!N&&rgEd(G)>=2;
    RG[r].champ=N?rgNm(N,N.home):RG0[r].champ;RG[r].nick=N?RG_NK[r][N.nk%3]:RG0[r].nick;
    RG_CID[r]=REGION.champId[r]=N?N.id:RG_CID0[r];
    RG_CH[r]=N?REGION.genH(r,N):ret?Object.assign({},RG_CH0[r],{letter:RG_RET[RG_CID0[r]]||RG_CH0[r].letter,cup:(G2,J)=>REGION.genCup(G2,r,J)}):RG_CH0[r];}}
Object.assign(REGION,{
  spk(r,f,l){const N=G.region&&G.region.nc&&G.region.nc[r];return N?{n:"npc",who:RG[r].champ}:{n:this.champId[r],f,l};},
  /* a new champion who has no art of her own speaks as an NPC */
  genH(r,N){const H0=RG_CH0[r],nm=rgNm(N,N.home),S=(t)=>({n:"npc",who:nm,t}),P=RG_NFX[r];
    return {ring:H0.ring,venue:H0.venue,pair:null,nightBg:H0.nightBg,perk:P,sty:H0.sty,reply:H0.reply,pairLine:H0.reply,
      letter:`เรียน ผู้จัดการค่ายศิริชัย\n\nฉัน${nm} แชมป์${RG0[r].name}คนใหม่ ได้ข่าวว่าค่ายของคุณเก็บเข็มขัดครบสี่จังหวัดแล้ว\n\nแชมป์คนก่อนย้ายไปอยู่ค่ายคุณ ฉันอยากรู้ว่าเธอเลือกถูกหรือเปล่า\n\nรอที่${H0.venue}\n— ${nm}`,
      again:`ผู้จัดการ\n\nถ้วยยังอยู่กับฉัน พร้อมเมื่อไหร่ก็ส่งนักมวยมาอีก\n\n— ${nm}`,wait:`ไม่เป็นไร พักให้หายก่อน — ${nm}`,
      pre:[n=>`${n}… ฉันดูเทปค่ายคุณมาทุกไฟต์ วันนี้ไม่มีอะไรเซอร์ไพรส์ฉันได้`,n=>`นัดนี้ฉันเปลี่ยนแผนแล้ว ลองตามให้ทันสิ`,n=>`นัดสุดท้าย ใครอยากได้ถ้วยมากกว่ากัน`],
      win:["ขอบคุณที่ชกด้วยกัน นัดหน้าฉันจะไม่พลาดอีก","ยังไม่จบ","…"],lose:["เก่งสมคำลือ","นัดสุดท้ายฉันจะไม่ยอมง่าย ๆ","…"],
      lost:()=>[S("ถ้วยยังอยู่กับฉัน… แต่ค่ายคุณทำให้ฉันต้องซ้อมหนักขึ้นอีกเยอะ"),{n:"coach",t:"ยังไม่จบหรอก รอจดหมายท้าครั้งหน้า"}],
      cup:(G2,J)=>this.genCup(G2,r,J),night:()=>[]};},
  genCup(G2,r,J){const R=G2.region,me=G2.F[R.champ[r].fid],ed=rgEd(G2),n=(R.hall||[]).filter(h=>h.k==="cup"&&h.r===r).length+1,top=typeof rgTopGirl==="function"?rgTopGirl(G2):null;
    const who=this.spk(r,"happy","fight");
    return [{n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me?me.name:""}`},{n:"nar",t:`${RG_TITLE[r]} ครั้งที่ ${ed} · ${J.w}-${J.l}`},
      {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้า${RG0[r].name} ครั้งที่ ${ed} ได้แก่… ${me?me.name:""} จากค่ายศิริชัย!`},
      {...who,t:R.nc&&R.nc[r]?"ยินดีด้วย ค่ายศิริชัยแข็งแกร่งสมคำร่ำลือจริง ๆ":"…แพ้อีกแล้ว แต่ครั้งนี้หนูไปได้ไกลกว่าเดิม ยินดีด้วยนะ"},
      ...(top?[{n:top.id,f:"happy",l:"fight",t:"เก่งที่สุดเลย! ค่ายเราได้ถ้วยอีกใบแล้ว!"}]:[]),
      {n:"coach",t:`ถ้วยภาคนี้ใบที่ ${n} ของค่าย… ปู่ชัยคงไม่เชื่อสายตาตัวเอง`}];},
  /* the bots' own tournament for one province: 4 entrants, semis + final, real quick fights */
  bracket(G,seed,ents,tag){const rng=mulberry32(seed),mk=(e,i)=>{const id=`rgb_${tag}_${i}`,f=baseFighter(id,mkNPC(id,"x","X",Math.round(14+e.s*3),mulberry32(seed+i*977),1+i%5));f.lvl=18+Math.round(e.s*6);return f;};
    const F=ents.map(mk),bout=(a,b,k)=>{const Q=quickFight(F[a],F[b],seed+k*131,3),w=Q.result.win==="A"?a:Q.result.win==="B"?b:(rng()<.5?a:b),rt=Q.result.type||"";
      return {w,l:w===a?b:a,m:Q.result.win==="D"||!(/KO|TKO/.test(rt)||Q.result.sub||Q.result.towel)?"pts":"ko",rd:Q.result.round||3};};
    const s1=bout(0,3,1),s2=bout(1,2,2),fi=bout(s1.w,s2.w,3);return {win:fi.w,ru:fi.l,path:[{o:s1.w===fi.w?s1.l:s2.l,m:(s1.w===fi.w?s1:s2).m,rd:(s1.w===fi.w?s1:s2).rd},{o:fi.l,m:fi.m,rd:fi.rd}]};},
  newEnt(rng,used,dest){let f;if(used.size>=RG_FN.length)used.clear();for(let i=0;i<80;i++){f=Math.floor(rng()*RG_FN.length);if(!used.has(f))break;}used.add(f);return {f,k:Math.floor(rng()*3),p:Math.floor(rng()*3),age:18+Math.floor(rng()*9),tr:Math.floor(rng()*RG_TR.length),s:rng()};},
  provTourney(G,ed){const R=G.region,out={},ru={},seed=(G.seed||1)*31+ed*7919;
    const used=new Set();for(const r of RG_ORDER)for(const dest of RG[r].prov){const rng=mulberry32(seed+stableHash(dest)),prev=R.pc&&R.pc[dest];
      const ents=[prev?{...prev,s:Math.min(1,.55+rng()*.4),def:1,age:(prev.age||22)+3}:null].filter(Boolean);if(prev)used.add(prev.f);while(ents.length<4)ents.push(this.newEnt(rng,used,dest));
      const B=this.bracket(G,seed+stableHash(dest),ents,dest),W=ents[B.win],L=ents[B.ru];
      out[dest]={f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,ed,reign:W.def?(prev.reign||1)+1:1,prev:prev&&!W.def?{f:prev.f,k:prev.k,p:prev.p}:null,
        path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p},m:x.m,rd:x.rd}))};
      ru[dest]={...L,s:L.s};}
    return {pc:out,ru};},
  /* the regional title left vacant by a champion who moved in: the four province runners-up fight for it */
  genChamp(G,r,ed,ru){const seed=(G.seed||1)*17+ed*104729+stableHash(r),ents=RG[r].prov.map(d=>({...ru[d],home:d}));
    const B=this.bracket(G,seed,ents,"c"+r),W=ents[B.win];
    return {id:`rgc_${r}_${ed}`,f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,home:W.home,nk:Math.floor(mulberry32(seed)()*3),ed,
      path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p,home:ents[x.o].home},m:x.m,rd:x.rd}))};},
  oppName(G,dest){const P=G.region&&G.region.pc&&G.region.pc[dest];return P?rgNm(P,dest):RG_OPP[dest]||"แชมป์ประจำจังหวัด";},
  mtxt(x){return x.m==="ko"?`ชนะก่อนครบยก (ยก ${x.rd})`:"ชนะคะแนน";},
  histHTML(P,dest,title){const L=[`อายุ ${P.age} ปี · ${RG_TR[P.tr%RG_TR.length]}`,
      ...P.path.map((x,i)=>`${i?"รอบชิง":"รอบรอง"}: ${rgNm(x.o,x.o.home||dest)} · ${this.mtxt(x)}`),
      P.reign>1?`ป้องกันแชมป์ได้ · สมัยที่ ${P.reign}`:P.prev?`โค่นแชมป์เก่า ${rgNm(P.prev,dest)}`:""].filter(Boolean);
    return `<details class="rg-hist"><summary>${esc(title)}</summary>${L.map(t=>`<p class="meta">${esc(t)}</p>`).join("")}</details>`;},
  /* when the next edition opens (shown once this one is done) */
  nextEdTxt(G){const R=G.region,ed=rgEd(G),done=ed===1?(R.final&&R.final.won?(R.final.wonAbs||gameWeek(G)):null):R.edDone;if(done==null)return "";
    const abs=Math.max((R.startAbs||0)+RG_LOOP.wk,done+RG_LOOP.rest),y=Math.floor((abs-1)/52)+1,w=((abs-1)%52)+1;return ` · ครั้งต่อไป ปีที่ ${y} สัปดาห์ ${w}`;},
  loopWeekly(G){const R=G.region,now=gameWeek(G),ed=rgEd(G);
    if(ed===1&&!(R.final&&R.final.won))return;
    const doneAbs=ed===1?(R.final.wonAbs||now):R.edDone;
    if(ed>=2&&(R.cups||[]).length>=4&&!R.edDone){R.edDone=now;G.rep+=2;(R.hall=R.hall||[]).push({k:"ed",ed,season:G.season||1});G.log=G.log||[];G.log.push(`ศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed}: ครบ 4 ถ้วย · ชื่อเสียง +2`);}
    if(now<(R.startAbs||0)+RG_LOOP.wk||(doneAbs!=null&&now<doneAbs+RG_LOOP.rest))return;
    if(R.trip||RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")||R.joinPend)return;
    this.newEdition(G);},
  newEdition(G){const R=G.region,ed=rgEd(G)+1,now=gameWeek(G);
    for(const r of RG_ORDER)if((R.cups||[]).includes(r))(R.hall=R.hall||[]).push({k:"cup",r,ed:ed-1,season:G.season||1});
    const T=this.provTourney(G,ed);R.pc=T.pc;R.nc=R.nc||{};
    Object.assign(R,{edition:ed,startAbs:now,edDone:null,belts:Object.fromEntries(RG_ORDER.map(r=>[r,{}])),cups:[],trip:null,nextTripAbs:now+1});
    for(const r of RG_ORDER){const c0=RG_CID0[r],gone=R.joined&&R.joined[c0];
      if(gone)R.nc[r]=this.genChamp(G,r,ed,T.ru);else delete R.nc[r];
      R.champ[r]={state:"locked",fid:null,w:0,l:0,tries:0,visit:gone?"none":"done"};}
    rgApply.k=null;rgApply(G);
    const lines=RG_ORDER.map(r=>{const N=R.nc[r];return N?`${RG0[r].name}: ${rgNm(N,N.home)} "${RG_NK[r][N.nk%3]}" แชมป์คนใหม่ (${RG0[r].champ}ย้ายมาอยู่ค่ายศิริชัยแล้ว)`:`${RG0[r].name}: ${RG0[r].champ} แชมป์เดิม กลับมาเก่งกว่าเดิม`;}).join("\n");
    addMail(G,{kind:"letter",from:"นาคาเอเนอร์จี้ดริงค์",title:`จดหมายเชิญ: ศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed}`,
      body:`เรียน ผู้จัดการค่ายศิริชัย\n\nศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed} เปิดแล้ว · เข็มขัดจังหวัดทั้ง 16 เส้นตัดสินใหม่ด้วยศึกคัดเลือกในแต่ละจังหวัด ผู้ชนะคือแชมป์จังหวัดคนใหม่ที่รอค่ายของท่านอยู่\n\nแชมป์ภาค\n${lines}\n\nเก็บเข็มขัดให้ครบสี่จังหวัด แล้วท้าชิงถ้วยเหมือนเดิม`});
    G.log=G.log||[];G.log.push(`ศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed} เริ่มแล้ว`);},
});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);

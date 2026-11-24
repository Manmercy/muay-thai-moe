// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"ภาคเหนือ",champ:"ใบบัว",nick:"ดอกบัวซ่อนหนามแห่งล้านนา",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"ภาคอีสาน",champ:"ทับทิม",nick:"ทับทิมเอกแดนอีสาน",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"ภาคกลาง",champ:"อลิเซีย",nick:"เจ้าหญิงมวยไทย",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"ภาคใต้",champ:"ชบา",nick:"หมัดใต้ฝุ่น",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["ศอกวัดร่องขุ่น","elbow",{dmg:{elbow:.10}}],nan:["เข่าเรือแข่งน่าน","knee",{dmg:{knee:.10}}],uttaradit:["ศอกดาบหักพระยาพิชัย","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["ถีบม้าเหล็กลำปาง","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["เตะบัวแดงบาน","kick",{dmg:{kick:.10}}],khonkaen:["เข่าทอไหมขอนแก่น","knee",{dmg:{knee:.08},regen:.06}],buriram:["หมัดสายฟ้าพนมรุ้ง","punch",{dmg:{punch:.10}}],ubon:["ศอกเทียนพรรษา","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["หมัดลิงหลอกเจ้า","punch",{dmg:{punch:.08},evade:.01}],suphan:["เตะแม่ไม้สุพรรณ","kick",{dmg:{kick:.10}}],phetchaburi:["เข่าเขาวังเมืองเพชร","knee",{dmg:{knee:.10}}],chanthaburi:["หมัดเปลือกมังคุด","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["เตะนางนวลโฉบ","kick",{dmg:{kick:.08},evade:.01}],surat:["ศอกเปลือกหอยดอนสัก","elbow",{dmg:{elbow:.10}}],nakhonsi:["หมัดหนังตะลุง","punch",{dmg:{punch:.10}}],songkhla:["เตะนางเงือกสมิหลา","kick",{dmg:{kick:.08},regen:.06}]};
const RG_JOIN_LVDROP=5,RG_JOIN_STAT=.9;
const RG_SK_ADJ={north:1.75,isan:.75,central:.72,south:.85},RG_SK_CUP={north:.015,isan:.03,central:.08,south:.065},RG_CH_SKLV=35; /* her tree grows with each cup (Lv.35→37), so the raw strength gives a little back per cup */ /* v1.91.45: champions now fight with a learned tree — their raw strength comes down by this much so the win rates stay where Man set them */
const RG_TRAIT2={baibua:{name:"ใจนิ่งดั่งบึงบัว",desc:"ฟื้นแรงระหว่างยกเร็วขึ้น 10% · เลือดต่ำกว่า 45% แม่นขึ้น 4%",fx:{regen:.1,clutch:.04}},
  tabtim:{name:"หัวเราะสู้",desc:"ใช้แรงออกอาวุธน้อยลง 6% · กำลังใจมีผลในไฟต์มากขึ้น 2%",fx:{staSave:.06,mor:.02}},
  alicia:{name:"ต่อหน้ากล้อง",desc:"ความแม่นพื้นฐาน +1.5% · หมัดได้คะแนนเพิ่ม 10%",fx:{prep:.015,pts:{punch:.1}}},
  chaba:{name:"คลื่นใต้น้ำ",desc:"สวนกลับบ่อยขึ้น 4% · สวนกลับแรงขึ้น 12%",fx:{ctr:.04,ctrDmg:.12}}};
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
const RG_FIX={belt:n=>22.25+.65*Math.min(15,n)/15,champ:(cups,tries)=>23.41+.1067*Math.min(3,cups)-.15*Math.min(2,tries||0),nl:{nia:23.41,varya:25.35,meili:23.82,rosa:25.51,ladda:24.0}} /* v1.91.54 (Man, option B): the four members −0.4 now that a lost night starts over (about level with the regional champions; Ladda unchanged) */; /* v1.91.38 (Man): champions a little harder (+.3 → maxed series ~56→45%), the Naka members harder (+.5 → ~40%), Ladda a brutal final (+1.3 → ~18%) */ /* v1.91.13 (Man): set for a maxed fighter (Lv.32, every bonus, stat 20) — belts ~80% · series ~60% · Naka ~50% · Ladda ~40% */ /* v1.91.6: re-set after the heroine rebalance (v1.91.0–1.91.5), same targets, middle of the five home-line builds · v1.91.7: champions −0.35 after opponents got fixed styles */
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
 pre:[n=>`${n}… ยินดีที่ได้ชกกัน หนูจะไม่ออมมือนะ ศอกของท่าเสาไม่เคยออมใคร`,n=>`นัดนี้หนูจะสวนให้หนักกว่าเดิม ระวังศอกกลับหลังนะ`,n=>`นัดสุดท้ายแล้ว… "ไวกว่าลมท่าเสา" หนูจะชกให้สมคำนี้ หนูแบกชื่อค่ายบัวท่าเสามาทั้งหมด จะยอมแพ้ไม่ได้`],
  sty:["inside","counter","footwork"], /* v1.91.9 (Man): each bout has its own style, hinted in the line before it */
  reply:"มาเลย ฉันเตรียมมาแล้ว",pairLine:"ท่าเสาเหมือนกัน… แต่วันนี้หนูขอเป็นฝ่ายชนะนะคะ",
 win:["ขอบคุณที่ชกด้วยกัน นัดหน้าหนูจะรอนะ","ยังไม่จบนะ หนูรู้แล้วว่าต้องแก้ตรงไหน","…"],
 lose:["เก่งจริง ๆ หนูประมาทไปหน่อย นัดหน้าเจอกันนะ","ศอกหนูโดนอ่านขาดเลย… นัดสุดท้ายหนูจะไม่ยอมง่าย ๆ","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"ถ้วยยังอยู่ที่เชียงใหม่นะ… แต่หนูสนุกมากที่ได้ชกกับค่ายศิริชัย"},{n:"baibua",f:"flustered",l:"fight",t:"ถ้าผู้จัดการพร้อมเมื่อไหร่ ส่งจดหมายมาบอกหนูนะ หนูจะรอ"},{n:"nar",t:"ใบบัวไหว้ทุกคนก่อนเดินลงเวที แล้วหันกลับมามองผู้จัดการอีกครั้งหนึ่ง"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคเหนือจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคเหนือ ศึกชิงเจ้าสี่ภาค ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"คุณเกริกขึ้นมามอบถ้วยทองกลางเวที โคมยี่เป็งลอยขึ้นฟ้าพร้อมกันหลายร้อยดวง"},
   {n:"baibua",f:"happy",l:"fight",t:"ยินดีด้วยนะ… ผู้จัดการ คืนนี้หนูมีที่หนึ่งอยากพาไป… ถ้าไม่ว่าอะไรนะ"},
   {n:"baibua",f:"flustered",l:"fight",t:"หนูมีเรื่องอยากบอกอยู่เรื่องหนึ่ง… เอ่อ ไม่เป็นไร ไว้ก่อนก็ได้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ใบบัว")}]:[]),
   {n:"coach",t:"ถ้วยแรกของค่ายระดับภาค… ปู่ชัยต้องยิ้มอยู่แน่ ๆ"}];},
  night:(G,T)=>[
   {n:"nar",t:"ตีห้า ใบบัวมารอหน้าโรงแรมพร้อมรถมอเตอร์ไซค์คันเก่า ขึ้นดอยสุเทพไปตอนที่ฟ้ายังมืด"},
   {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นที่ประจำของหนู ตอนพ่อยังสอนมวยได้ พ่อพามาดูหมอกทุกปีใหม่"},
   {n:"nar",t:"ลมหนาวพัดขึ้นมาจากหุบเขา ใบบัวคลี่ผ้าซิ่นตีนจกผืนเล็กออก แล้วแบ่งให้ผู้จัดการคลุมไหล่ครึ่งหนึ่ง"},
   {n:"baibua",f:"sad",l:"casual",t:"พ่อเจ็บเข่าเลิกสอนมาสองปีแล้ว ช่วงนี้รีสอร์ทจินหลงข้างบ้านส่งคนมาขอซื้อที่ดินทั้งแปลง ทั้งค่าย ทั้งสปาของแม่"},
   {n:"baibua",f:"sad",l:"casual",t:"พอเราไม่ขาย เขาก็จ้างนักเลงมาป่วนหน้าร้านนวดทุกอาทิตย์… หนูไม่กล้าบอกพ่อ กลัวพ่อลุกไปสู้ทั้งที่เข่ายังไม่หาย"},
   {n:"nar",t:"ใบบัวเงียบไป ใต้หุบเขาไฟในเมืองเชียงใหม่ค่อย ๆ ดับทีละดวง",choice:[
     {t:"\"ค่ายมวยยืนด้วยกันได้ ค่ายเราช่วยอยู่แล้ว\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…ค่ายศิริชัยจริง ๆ ทุกคนช่วยกันหมด หนูอิจฉานะ"}]},
     {t:"\"ไม่ต้องแบกคนเดียวก็ได้นะ\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…ผู้จัดการพูดแบบนี้ หนูก็ไม่รู้จะเอาหน้าไว้ไหนแล้ว"}]}]},
   {n:"nar",t:"ดวงอาทิตย์โผล่พ้นทะเลหมอก ใบบัวพึมพำอะไรบางอย่างเบามาก"},
   {n:"baibua",f:"flustered",l:"casual",t:"…อ้าย"},
   {n:"baibua",f:"flustered",l:"casual",t:"เอ๊ะ! ไม่ใช่ หนูไม่ได้พูดอะไร! ลงดอยกันเถอะ เดี๋ยวทุกคนตื่นมาหา"},
   {n:"nar",t:"ทางลงดอย ใบบัวขับช้ากว่าตอนขาขึ้นเกือบเท่าตัว"}]},
 isan:{ring:"northeast",venue:"เวทีปราสาทหินพิมาย นครราชสีมา",pair:"ploy",nightBg:"mekong",
  perk:{name:"เตะคุมระยะ",desc:"เตะแม่นขึ้น 4% · หลบได้ดีขึ้น 1%",fx:{hit:{kick:.04},evade:.01}},
  letter:"เถิง ผู้จัดการค่ายศิริชัย\n\nคักแท้! เก็บเข็มขัดอีสานครบสี่จังหวัดแล้วเด้อ ทับทิมรอเบิ่งมาตั้งแต่จังหวัดแรกแล้ว\n\nมาชิงถ้วยกันที่เวทีปราสาทหินพิมาย โคราชเด้อ ชกกันสามนัด ใครชนะสองนัดก่อนเอาถ้วยไป ส่งนักมวยมาคนเดียวชกให้จบเด้อ บ่ต้องเปลี่ยนตัวไปมา\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nทับทิม · ค่ายหมัดหนักพิมาย (แต่เตะเด้อ ฮ่า ๆ)",
  again:"ผู้จัดการเด้อ!\n\nถ้วยยังอยู่โคราชเด้อ ทับทิมบ่ได้ไปไส ถ้าพร้อมแล้วกะส่งนักมวยมาอีก คนเก่าคนใหม่กะได้\n\nบ่ต้องเกรงใจเด้อ มาเลย!\n\nทับทิม",
  wait:"บ่เป็นหยังเด้อ ทับทิมรอได้ ไผเจ็บกะพักก่อน — ทับทิม",
 pre:[n=>`${n}! มาเลยนะ ทับทิมรอมานานแล้ว เตะแบบโคราชไม่เคยมีใครเห็นมาก่อนหรอก ฮ่า ๆ`,n=>`นัดนี้ทับทิมเอาจริงแล้วนะ ระวังเตะกระโดดนะ`,n=>`นัดสุดท้ายแล้ว… พ่อไม่เคยมาดูทับทิมชกสักครั้ง วันนี้ทับทิมจะใช้หมัดหนักโคราชของบ้านเรา ให้พ่อเห็นว่าทับทิมก็เป็นลูกหลานหมัดหนักนะ`],
  sty:["footwork","footwork","power"],
  reply:"ฉันก็ไม่ยอมเหมือนกัน",pairLine:"หมัดโคราชของคนที่จากบ้านมานาน จะยังเป็นของแท้ไหม ดูเอาเองแล้วกัน",
 win:["ฮ่า ๆ เจ๋งมาก แต่นัดแรกเป็นของทับทิมนะ!","อีกนัดเดียวนะ ทับทิมจะเก็บถ้วยไว้ที่โคราช","…"],
 lose:["โอ๊ย เจ็บมาก! เก่งจริงนะ นัดหน้าทับทิมเอาคืน","ฮ่า ๆ…ไม่ขำแล้วนะ นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"ฮ่า ๆ ถ้วยยังอยู่โคราชนะ! แต่ค่ายศิริชัยแรงจริง ๆ ทับทิมเจ็บไปทั้งตัวเลย"},{n:"tabtim",f:"flustered",l:"fight",t:"มาอีกนะ ทับทิมจะรอ… ไม่ได้คิดถึงหรอก แค่อยากชกด้วยอีก"},{n:"nar",t:"ทับทิมโบกมือเสียงดังจนพิธีกรต้องเลื่อนไมค์หนี"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคอีสานจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคอีสาน ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ทับทิมวิ่งเข้ามากอดผู้จัดการกลางเวทีต่อหน้าคนทั้งงาน กอดแน่นจนคุณเกริกต้องยืนถือถ้วยรอ"},
   {n:"tabtim",f:"happy",l:"fight",t:"แพ้ก็แพ้! แต่ขอกอดเอาคืนหน่อยนะ ฮ่า ๆ… อีกแป๊บเดียว"},
   {n:"nar",t:"ท้ายเวที ชายวัยกลางคนผิวคล้ำยืนนิ่งอยู่หลังคนดู พยักหน้าให้ทับทิมหนึ่งครั้ง แล้วเดินออกไป"},
   {n:"tabtim",f:"flustered",l:"fight",t:"…พ่อ? พ่อมาดูเหรอ…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ทับทิม")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นงานบุญบั้งไฟริมน้ำมูลยังไม่เลิก ทับทิมพาผู้จัดการเดินเลี่ยงคนออกมาที่ท่าน้ำ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ตรงนี้ทับทิมมานั่งตั้งแต่เด็ก ๆ ดูบั้งไฟขึ้นฟ้า แล้วคิดว่าสักวันจะเตะให้สูงเท่านั้น"},
   {n:"nar",t:"บั้งไฟลูกสุดท้ายพุ่งขึ้นฟ้า ทับทิมเงียบไปเป็นครั้งแรกตั้งแต่รู้จักกัน"},
   {n:"tabtim",f:"sad",l:"casual",t:"ทับทิมส่งเงินให้น้องสามคนเรียน… แต่พ่อไม่เคยยอมรับว่าเตะก็เป็นมวยโคราชได้"},
   {n:"tabtim",f:"sad",l:"casual",t:"วันนี้พ่อมาดู… ทับทิมแพ้ต่อหน้าพ่อ แต่เป็นครั้งแรกที่พ่อพยักหน้า",choice:[
     {t:"\"พ่อเห็นแล้วว่าเตะของเธอเป็นมวยโคราชจริง ๆ\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าพูดดี ๆ แบบนี้สิ ทับทิมจะร้องไห้แล้วนะ"}]},
     {t:"\"เธอเตะสูงกว่าบั้งไฟไปแล้วนะ\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ บ้าบอ! …แต่ขอบใจนะ"}]}]},
   {n:"nar",t:"ทับทิมเอนหัวพิงไหล่ผู้จัดการเงียบ ๆ จนควันบั้งไฟจางหายไปจากฟ้า"},
   {n:"tabtim",f:"flustered",l:"casual",t:"…ไม่ต้องบอกใครนะว่าทับทิมเงียบได้ เสียชื่อหมด"}]},
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
 pre:[n=>`…${n} เข้ามาก่อนเลย`,n=>`นัดนี้ไม่หลบแล้ว`,n=>`นัดสุดท้าย "ท่าดีไชยา" จะให้ดู ไม่มีใครถอย`],
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
   {n:"chaba",f:"sad",l:"casual",t:"เรือคว่ำ พี่ขาเจ็บ ไม่ได้ชกอีก ชบาชกแทน แล้วนาคาเอาเรื่องพี่ไปทำโฆษณา ไม่ถามสักคำ"},
   {n:"nar",t:"ชบาโยนเปลือกหอยลงทะเลไกลมาก คลื่นซัดมันกลับมาที่เท้าทั้งคู่",choice:[
     {t:"\"พี่ชายเธอคงภูมิใจในตัวเธอมาก\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…พี่บอกแบบนั้นเหมือนกัน"}]},
     {t:"นั่งลงข้าง ๆ เงียบ ๆ",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"ชบานั่งลงตาม ไหล่ชนกันนิดหนึ่ง ไม่มีใครขยับหนี"}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม …ไซ"},
   {n:"nar",t:"ชบาหันหน้าไปทางทะเลทันทีที่พูดจบ แต่หูแดงจนเห็นได้ใต้แสงจันทร์"}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const TP=G.region&&G.region.trip&&G.region.trip.party,L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40&&(!TP||TP.includes(f.id))).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
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
  /* v1.91.43 (Man): a champion's move fires like a heroine's — her weapon landing clean or a big hit when she's hurt — as a rival and in your camp, same art and effects */
  baibua:[{img:"baibua_special",w:"elbow",def:"ศอกบัวบานกลับหลัง",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="elbow"&&(e.crit||e.ev==="counter"||hp<45),npc:1,p:.7}],
  tabtim:[{img:"tabtim_special",w:"kick",def:"เตะกระโดดทับทิมแดง",when:(e,hp)=>e.ev==="hit"&&e.w==="kick"&&(e.crit||hp<45),npc:1,p:.7}],
  alicia:[{img:"alicia_special",w:"punch",def:"อัปเปอร์คัตเจ้าหญิง",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="punch"&&(e.crit||hp<45),npc:1,p:.7}],
  chaba:[{img:"chaba_special",w:"punch",def:"หมัดพายุสยบคลื่น",when:(e,hp)=>e.ev==="hit"&&e.w==="punch"&&(e.crit||hp<50),npc:1,p:.6}]});
/* v1.91.43 (Man): every champion has her own hot-form title once she fights for Sirichai */
if(typeof HOT_TITLES!=="undefined")Object.assign(HOT_TITLES,{
  baibua:{name:"บัวหลวงกลางพายุ",desc:"สวนกลับบ่อยขึ้น หลบดีขึ้นนิดหน่อย",ctr:.06,ev:.012},
  tabtim:{name:"ทับทิมเพลิงอีสาน",desc:"ออกอาวุธหนักขึ้น เลือดเริ่มต้นมากขึ้น",dmg:.07,hp:8},
  alicia:{name:"เจ้าหญิงบนบัลลังก์",desc:"แม่นขึ้น ออกอาวุธหนักขึ้นนิดหน่อย",prep:.02,dmg:.05},
  chaba:{name:"พายุไม่หยุดพัด",desc:"หลบดีขึ้น สวนกลับบ่อยขึ้นนิดหน่อย",ev:.025,ctr:.03}});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"เตะกระสอบตามกลองแขก (ยาก)",target:[.74,.78,.82],unit:"ความแม่นยำ"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"ตำส้มตำ",target:[.76,.8,.84],unit:"ความแม่นยำ"},
 central:{game:"live",partner:"rin",label:"ไลฟ์ขายของ 30 วินาที",target:[9.7,11.75,13.8],unit:"ยอดขาย"},
 south:{game:"run",partner:"mali",label:"วิ่งแข่ง 100 เมตร",pace:[6.5,6.9,7.3],unit:"เวลา"}};
const DUEL_TALK={
 north:{intro:"ตีกลองแขกให้หนูนะเจ้า… หนูเตะตามจังหวะได้ทุกโน้ตเลย",rw:"เก่งมากเลยเจ้า… ผู้จัดการเลือกนักมวยเก่งจริง ๆ",rl:"ขอโทษเจ้า หนูเผลอเอาจริงไปหน่อย",
  win:"หนูแพ้แล้วเจ้า… แต่สนุกที่สุดตั้งแต่ขึ้นชกมาเลย",lose:"หนูชนะเจ้า… ไว้มาแก้มือใหม่นะ หนูจะรอ"},
 isan:{intro:"ตำส้มตำแข่งกับคนอีสาน? กล้ามาก! ทับทิมไม่ยอมแพ้เรื่องนี้หรอกเด้อ",rw:"เฮ้ย! ตำแซบกว่าทับทิมได้จั่งได๋!",rl:"ฮ่า ๆ ส้มตำคือบ้านทับทิมเด้อ",
  win:"ฮ่า ๆ ๆ ทับทิมแพ้ค่ายศิริชัยเรื่องส้มตำ! อย่าบอกแม่เด้อ… ขอรางวัลปลอบใจได้ไหม",lose:"ทับทิมชนะ! คืนนี้ทับทิมตำเลี้ยงทั้งค่ายเอง"},
 central:{intro:"ไลฟ์แข่งกันไหม คนละสามสิบวินาที ใครขายได้มากกว่าชนะ …ฉันไม่ออมมือให้หรอกนะ",rw:"…ยอดขายแพ้ค่ายเล็กได้ยังไงเนี่ย",rl:"มืออาชีพก็ต้องแบบนี้ค่ะ",
  win:"โอเค ยอมรับ ค่ายเธอรู้จักคนดูจริง ๆ …อย่าเข้าใจผิดนะ ไม่ได้ชม",lose:"ฉันชนะ แต่ไลฟ์ของพวกเธอน่าดูกว่าที่คิด"},
 south:{intro:"…วิ่ง ร้อยเมตร",rw:"…ไว",rl:"…",
  win:"…แพ้ …หรอย",lose:"…ยังไม่พอ มะลิ"}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"ใบบัวมาถึงค่ายแต่เช้า ถือตะกร้าข้าวต้มมัดมาฝากทั้งค่าย"},{n:"baibua",f:"happy",l:"casual",t:"หนูมาดูว่าค่ายที่ชนะหนูนัดแรกเป็นยังไง… ค่ายนี้ทุกคนช่วยกันหมดเลยนะ"},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"ท่าเสาเหมือนกัน มาซ้อมด้วยกันไหมคะ"},{n:"nar",t:"ทั้งเช้ากะทิกับใบบัวซ้อมศอกคู่กัน คนหนึ่งสวน อีกคนหลบ จนครูแดงต้องตะโกนเรียกพัก"}]:[]),
  {n:"nar",t:"ตอนเที่ยง ใบบัวนั่งดูทุกคนในค่ายช่วยกันยกหม้อข้าว ล้างนวม ตากผ้าพันมือ แล้วเงียบไปนาน"},
  {n:"baibua",f:"sad",l:"casual",t:"…ที่ค่ายหนู งานพวกนี้หนูทำคนเดียวทั้งหมดเลย"},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"เสียงมอเตอร์ไซค์ดังมาตั้งแต่ปากซอย ทับทิมโบกมือก่อนจอดเสียอีก"},{n:"tabtim",f:"happy",l:"casual",t:"มาเยี่ยมนะ! ค่ายนี้แหละที่เตะทับทิมจนมึนนัดแรก ฮ่า ๆ"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"มาทำไมแต่เช้า …ไม่ได้ไล่นะ"},
   {n:"nar",t:"ทับทิมท้าพลอยต่อยกระสอบแข่งกันคนละร้อยหมัด แพ้ไปสิบเจ็ดหมัดแล้วหัวเราะลั่นค่าย"}]:[]),
  {n:"nar",t:"ตอนพักกินข้าว ทับทิมเล่าเรื่องตลกไม่หยุด จนพูดเรื่องหนึ่งหลุดออกมาแบบไม่ทันคิด"},
  {n:"tabtim",f:"sad",l:"casual",t:"…ที่บ้านทับทิมไม่เคยมีใครมาดูทับทิมชกเลย สักครั้ง ฮ่า ๆ… เอ้า ทำไมเงียบกันหมดล่ะ"},{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"รถตู้สีขาวจอดหน้าค่าย อลิเซียลงมาคนเดียว ใส่แว่นดำ หมวกแก๊ป"},{n:"alicia",f:"happy",l:"casual",t:"ทีมสปอนเซอร์ตามถ่ายฉันทั้งอาทิตย์ ขอหลบที่นี่สักวัน …ไม่ได้มาหาใครเป็นพิเศษหรอกนะ"},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"ยอดวิวคลิปไฟต์นัดแรกขึ้น 340% ค่ะ ฉันมีกราฟ"}]:[]),
  {n:"nar",t:"อลิเซียบอกว่ามาถ่ายคอนเทนต์ \"หนึ่งวันในค่ายเล็ก\" แต่ทั้งวันไม่ได้เปิดกล้องเลยสักครั้ง นั่งช่วยพับผ้าพันมือกับทุกคนจนเย็น"},
  {n:"alicia",f:"sad",l:"casual",t:"…ที่นี่ไม่มีใครขอให้ฉันยิ้ม แปลกดีนะคะ"},{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"ชบามาถึงค่ายโดยไม่บอกใคร ช่วยซ่อมรั้วหลังค่ายไปครึ่งแถวก่อนที่จะมีคนเห็น"},{n:"chaba",f:"happy",l:"casual",t:"…รั้วโยก"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มาทำไมไม่บอกมะลิ~ มะลิจะได้เตรียมขนม"}]:[]),
  {n:"nar",t:(G.pets||[]).length?"ตอนพักเที่ยง ทุกคนเห็นชบานั่งลูบสัตว์เลี้ยงของค่ายเงียบ ๆ จนมันหลับคาตัก ชบาไม่ยอมขยับขาเลยครึ่งชั่วโมง":"ตอนพักเที่ยง ทุกคนเห็นชบาแอบแบ่งข้าวให้นกกระจอกหน้าค่าย แล้วรีบทำหน้าเฉยตอนรู้ว่ามีคนเห็น"},
  {n:"chaba",f:"flustered",l:"casual",t:"…ไม่ได้ชอบ แค่มันมาเอง"},{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
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
/* v1.91.56 (Man): a rematch series gets its own lines — the champion remembers the last time, and each bout still hints at her style (bout 1 / bout 2 / the decider) */
const RG_PRE2={
 baibua:[[n=>`มาอีกแล้วเหรอ… ดีใจนะที่ไม่ยอมแพ้ หนูก็ซ้อมศอกเพิ่มทุกเช้าเหมือนกัน เข้ามาใกล้ ๆ ได้เลย`,n=>`${n}… หนูจำได้ทุกหมัดของครั้งก่อน วันนี้หนูจะรอในระยะศอกเหมือนเดิม`,
 n=>`หนูนั่งดูเทปครั้งก่อนกับพ่อทั้งคืน พ่อบอกให้ยืนรอศอกให้ใกล้กว่าเดิมอีกนิด`,n=>`ข้าวต้มมัดห่อนี้ไว้ให้หลังชกนะ… ตอนนี้ขอศอกก่อน เข้ามาใกล้ ๆ เลย`],
 [n=>`นัดสองแล้ว… คราวก่อนหนูสวนได้ คราวนี้ก็จะสวนอีก ระวังศอกกลับหลังนะ`,n=>`ครั้งก่อนหนูสวนช้าไปครึ่งจังหวะ คราวนี้ไม่แล้ว`,n=>`ยิ่งเข้ามาแรง หนูยิ่งสวนแรงนะ`],
 [n=>`นัดตัดสินอีกแล้ว… หนูไม่ได้ไวขึ้นเพราะโชคนะ หนูวิ่งขึ้นดอยทุกเช้าตั้งแต่ครั้งที่แล้ว`,n=>`นัดตัดสินกับค่ายศิริชัยอีกแล้ว… หนูไม่เบื่อเลย แต่ขาหนูจะไวกว่าเดิม`,n=>`ลมท่าเสาพัดแรงกว่าครั้งก่อนนะ ตามให้ทันล่ะ`]],
 tabtim:[[n=>`มาอีกแล้วนะ! ทับทิมนับไว้ตลอดนะ ฮ่า ๆ ขาทับทิมยังเบาเหมือนเดิม จับให้ได้ก่อนเถอะ`,n=>`${n}! ทับทิมคิดถึงจะแย่… ไม่ใช่ ๆ คิดถึงไฟต์ ฮ่า ๆ วันนี้ทับทิมจะวิ่งรอบเวทีให้เวียนหัวเลย`,
 n=>`คนในหมู่บ้านถามว่าค่ายศิริชัยจะมาอีกเมื่อไหร่ ทับทิมบอกว่าวันนี้แหละ ฮ่า ๆ ขาเบาพร้อมแล้วนะ`,n=>`น้องชายทับทิมเขียนโพยการชกให้ด้วยนะ เขียนไว้คำเดียวว่า "วิ่ง" ฮ่า ๆ`],
 [n=>`นัดนี้ทับทิมกระโดดได้สูงกว่าครั้งก่อนอีกคืบ ระวังหัวไว้นะ`,n=>`ระวังเท้านะ ทับทิมจะกระโดดข้ามหัวไปอีกรอบ`,n=>`เตะกระโดดทับทิมแดงรุ่นใหม่ ซ้อมมาเพื่อวันนี้เลยนะ`],
 [n=>`นัดสุดท้ายอีกแล้ว… ครั้งนี้ทับทิมไม่วิ่งแล้ว หมัดหนักโคราชล้วน ๆ ให้พ่อดูอีกรอบ`,n=>`พ่อมานั่งแถวหน้าอีกแล้ว… ทับทิมจะยืนแลกหมัดหนักให้พ่อดูเหมือนเดิม`,n=>`ไม่มีวิ่งแล้วนะนัดนี้ หมัดหนักล้วน ๆ เหมือนที่พ่อสอน`]],
 alicia:[[n=>`กลับมาอีกแล้วเหรอคะ คนดูไลฟ์เริ่มจำหน้าคุณได้แล้วนะ… ฉันจะเต้นรอบเธอเหมือนเดิม ตามให้ทันสิ`,n=>`${n} อีกแล้ว… อย่าเข้าใจผิดนะ ฉันไม่ได้ดีใจที่เห็นหน้า กล้องต่างหากที่ดีใจ วันนี้ก็วิ่งตามฉันให้ทันละกัน`,
 n=>`ทีมงานตั้งชื่อคลิปไว้แล้วว่า "นัดล้างตา" …หวังว่าคนที่ชนะในคลิปจะเป็นฉันนะ ตามจังหวะเท้าฉันให้ทันละกัน`,n=>`ฉันซ้อมฟุตเวิร์กใหม่หมดตั้งแต่ครั้งที่แล้วค่ะ ห้ามเข้าใจผิดว่าเพราะเธอ`],
 [n=>`รอบนี้ก็เหมือนเดิมค่ะ ฉันรอ เธอเข้ามา ฉันสวน… แต่คราวนี้หมัดสวนเร็วกว่าเดิม`,n=>`สถิติบอกว่าเธอชอบเข้ามาหลังหมัดที่สอง ฉันจะรอตรงนั้นแหละ`,n=>`ฉันจะยืนรอเหมือนเดิม เข้ามาเมื่อไหร่ก็โดนสวน`],
 [n=>`นัดตัดสินอีกแล้ว ฉันจะเข้าไปชกถึงตัวเธอเองเหมือนเดิม ไม่มีกล้องไหนถ่ายทันหรอก`,n=>`นัดตัดสินไม่มีโชว์ ฉันเข้าไปหาเธอเอง`,n=>`ปิดกล้องได้แล้ว นัดนี้ฉันจะชกประชิดจนจบ`]],
 chaba:[[n=>`…มาอีก ดี เข้ามาก่อน`,n=>`…ยังรออยู่ตรงนี้ ${n} เข้ามาเลย`,n=>`…เข้ามา ครั้งนี้รอได้นานกว่าเดิม`,n=>`…พี่ชายฝากบอก สู้ ๆ …ทั้งสองคน`],
 [n=>`…ไม่หลบ เหมือนเดิม แรงกว่าเดิม`,n=>`…เดินหน้า อย่างเดียว`,n=>`…ไม่มีถอย`],
 [n=>`…ท่าดีไชยา อีกรอบ ไม่มีใครถอย`,n=>`…ไชยา ขาไว`,n=>`…จบที่นัดนี้`]],
 _nc:[[n=>`${n} อีกแล้วเหรอ ฉันดูเทปไฟต์ที่แล้วซ้ำจนจำได้ทุกจังหวะ`,n=>`มาอีกแล้ว… ดี ฉันอยากชนะคนที่ไม่ยอมแพ้`,n=>`ทั้งภาคพูดถึงค่ายศิริชัย ฉันอยากชนะต่อหน้าคนพวกนั้นอีกครั้ง`],
 [n=>`นัดสองอีกแล้ว คราวนี้ฉันเปลี่ยนแผนอีกแบบ`,n=>`เธอจำแผนฉันได้ใช่ไหม ฉันเปลี่ยนแล้ว`],
 [n=>`นัดตัดสินอีกรอบ ใครซ้อมมามากกว่ากันก็รู้กันวันนี้`,n=>`นัดสุดท้ายอีกแล้ว ฉันไม่ยอมเสียถ้วยให้ใครง่าย ๆ`]]};
/* after a rematch bout: the champion's line when she wins / loses it */
const RG_POST2={baibua:{win:["อีกครั้งแล้วนะ… หนูดีใจที่ได้เจอกันอีก แต่ถ้วยยังไม่ให้","ศอกหนูยังไม่ลืมทาง… แต่เกือบได้แล้วนะ"],lose:["…ครั้งนี้ค่ายศิริชัยอ่านหนูขาดกว่าเดิมอีก","เก่งขึ้นทุกครั้งเลย หนูต้องกลับไปซ้อมเพิ่มแล้ว"]},
 tabtim:{win:["ฮ่า ๆ ทับทิมอีกแล้ว! แต่ครั้งนี้เหนื่อยกว่าเดิมเยอะเลยนะ","ยังไม่ได้หรอก! มาอีกนะ ทับทิมชอบชกกับค่ายนี้"],lose:["โอ๊ย ครั้งนี้เจ็บกว่าเดิมอีก! ใครสอนเตะแบบนั้น!","ฮ่า ๆ… ไม่ขำแล้วนะ ทับทิมเอาคืนแน่"]},
 alicia:{win:["ยอดวิวคลิปนี้จะสูงกว่าครั้งก่อนอีก …เพราะฉันชนะ ไม่ใช่เพราะเธอ","ยังไม่ใช่วันของเธอค่ะ แต่ใกล้แล้ว… ฉันไม่ได้ชมนะ"],lose:["…ปิดกล้องก่อน ขอเวลาห้านาที","เธอเก่งขึ้นจริง ๆ …ห้ามเอาประโยคนี้ไปโพสต์"]},
 chaba:{win:["…ยัง","…มาอีกได้"],lose:["…เก่งขึ้น","…เจ็บ ดี"]},
 _nc:{win:["ฉันยังป้องกันไว้ได้ แต่ครั้งนี้ยากกว่าเดิม"],lose:["เธอเก่งขึ้นเยอะจากครั้งก่อน"]}};
/* your fighter, walking out for a rematch */
const RG_REPLY2={kati:"ครั้งนี้หนูดูเทปมาจนจำได้หมดแล้วค่ะ ไม่แพ้ซ้ำแน่",mali:"ครั้งก่อนมะลิร้องไห้ ครั้งนี้มะลิจะยิ้มนะคะ",rin:"ข้อมูลจากครั้งก่อนครบแล้วค่ะ ครั้งนี้ตัวเลขอยู่ข้างเรา",ploy:"แพ้คนเดิมสองครั้งไม่ได้",fah:"คราวนี้ฟ้าเอาคืนแน่ ดูไว้เลย!"};
/* v1.91.59 (Man): the hotel night changes with the province — a local outing in the menu, and now and then something silly happens first */
const RG_OUT={
 chiangrai:{t:"ไปดูวัดร่องขุ่นตอนเปิดไฟกลางคืน",l:"ทุกคนยืนถ่ายรูปกับวัดสีขาวจนแบตหมด {g}ถ่ายเซลฟี่ไปสี่สิบรูป ใช้ได้รูปเดียว"},
 nan:{t:"ไปนั่งริมกำแพงเมืองดูภาพกระซิบรัก",l:"{g}ยืนทำท่าเหมือนภาพกระซิบรักแล้วกระซิบว่า \"พรุ่งนี้กินอะไรดี\" ทั้งกลุ่มหัวเราะจนยามมาดู"},
 uttaradit:{t:"ไปไหว้อนุสาวรีย์พระยาพิชัยดาบหัก",l:"ทุกคนยกมือไหว้พร้อมกัน {g}ขอพรให้ศอกแข็งเหมือนดาบ แล้วรีบขอเพิ่มว่า \"แต่อย่าหักนะคะ\""},
 lampang:{t:"นั่งรถม้ารอบเมือง",l:"ม้าหยุดกินหญ้ากลางถนนสามรอบ คนขับบอกว่ามันชอบ{g} {g}เลยต้องลงไปป้อนหญ้าให้จนจบทริป"},
 udon:{t:"ไปเดินตลาดคืนริมหนองประจักษ์",l:"{g}ซื้อไส้กรอกอีสานมาสิบไม้ บอกว่าจะแบ่ง สุดท้ายเหลือกลับมาโรงแรมไม้เดียว"},
 khonkaen:{t:"ไปกินไก่ย่างเขาสวนกวางเจ้าดัง",l:"ไก่ย่างหมดไปสามตัว {g}ยืนยันว่ากินไปแค่น่อง แต่มีกระดูกกองอยู่หน้า{g}คนเดียว"},
 buriram:{t:"ไปดูไฟส่องปราสาทพนมรุ้งตอนค่ำ",l:"ทุกคนเงียบไปเลยตอนไฟเปิด {g}กระซิบว่า \"ถ้าได้ชกบนเวทีตรงนี้สักครั้งนะ…\""},
 ubon:{t:"ไปดูต้นเทียนพรรษาที่ทุ่งศรีเมือง",l:"{g}พยายามถ่ายรูปให้ตัวเองสูงเท่าต้นเทียน นอนลงกับพื้นถ่ายจนชุดเปื้อน"},
 lopburi:{t:"ไปเดินแถวพระปรางค์สามยอดตอนลิงหลับ",l:"ลิงไม่ได้หลับ ลิงตื่นทั้งฝูง {g}โดนขโมยแว่นกันแดดไปใส่บนหลังคาศาล"},
 suphan:{t:"ไปนั่งกินข้าวริมแม่น้ำสุพรรณ",l:"ร้านเปิดเพลงลูกทุ่งทั้งคืน {g}ร้องตามได้ทุกเพลงจนคนโต๊ะข้าง ๆ ขอให้ร้องอีก"},
 phetchaburi:{t:"ไปซื้อขนมหม้อแกงเจ้าดัง",l:"ซื้อมาสิบกล่อง ไปไม่ถึงโรงแรมก็หมด {g}ยืนยันว่ามดกินไปครึ่งหนึ่ง"},
 chanthaburi:{t:"ไปเดินตลาดพลอยกลางคืน",l:"{g}ต่อราคาพลอยเม็ดเล็กจนแม่ค้ายอมแพ้ แล้วก็ไม่ได้ซื้อ เพราะลืมกระเป๋าตังค์ไว้ที่โรงแรม"},
 chumphon:{t:"ไปนั่งกินกาแฟริมหาดทุ่งวัวแล่น",l:"กาแฟชุมพรเข้มจนทุกคนตาสว่างถึงตีสาม {g}นั่งนับดาวได้สองร้อยดวงแล้วเริ่มนับใหม่"},
 surat:{t:"ไปกินหอยนางรมสดที่ท่าเรือ",l:"{g}กินหอยนางรมตัวแรกแล้วทำหน้าเหมือนโดนศอก ตัวที่สองขอเพิ่มอีกจาน"},
 nakhonsi:{t:"ไปดูหนังตะลุงข้างวัด",l:"นายหนังเห็นค่ายมวยมาดู เลยเล่นตอนรูปหนังชกมวยกันกลางเรื่อง {g}เชียร์ดังกว่าคนทั้งวัด"},
 songkhla:{t:"ไปเดินหาดสมิหลาตอนกลางคืน",l:"{g}เดินไปจับมือรูปปั้นนางเงือก แล้วสาบานว่ารูปปั้นยิ้มให้ ไม่มีใครเชื่อ"}};
const RG_ODD={
 north:[{t:"ตีสอง ห้องข้าง ๆ ร้องคาราโอเกะเพลงคำเมืองไม่หยุด {g}ลุกไปเคาะประตู แล้วโดนชวนเข้าไปร้องด้วยจนเช้า",fx:"tired"},
   {t:"แมลงเม่าบินเข้าห้องทั้งฝูงหลังฝนหยุด {g}ไล่ตบจนตีหนึ่ง เช้ามาแขนแรงขึ้นอย่างประหลาด",fx:"exp"},
   {t:"แม่บ้านโรงแรมจำ{g}ได้จากไลฟ์ค่าย เอาข้าวเหนียวมะม่วงมาฝากทั้งค่าย",fx:"morale"},
   {t:"น้ำอุ่นในโรงแรมหมดตั้งแต่สามทุ่ม {g}อาบน้ำเย็นจากดอยแล้วกรีดร้องดังจนเจ้าของโรงแรมวิ่งขึ้นมา",fx:"none"},
   {t:"หมอกลงหนาจน{g}เดินหลงไปเคาะห้องคนอื่นสองห้องกว่าจะเจอห้องตัวเอง",fx:"none"},
   {t:"ร้านข้าวซอยหน้าโรงแรมแถมไข่ให้ทุกชามเพราะเจ้าของเป็นแฟนมวย",fx:"morale"}],
 isan:[{t:"ตีหนึ่ง วงหมอลำข้างโรงแรมเปิดเวทีสด {g}แอบออกไปเต้นหน้าเวทีจนวงเรียกขึ้นไปฟ้อนด้วย",fx:"tired"},
   {t:"โรงแรมแอร์เสีย ทุกคนเอาฟูกมานอนเรียงกันหน้าพัดลมตัวเดียว {g}พูดละเมอเรื่องส้มตำทั้งคืน",fx:"tired"},
   {t:"ป้าเจ้าของโรงแรมยกปลาร้าบองมาให้หนึ่งกระปุก บอกว่า \"กินแล้วต่อยแรง\"",fx:"morale"},
   {t:"จิ้งจกตกจากเพดานลงชามข้าวเหนียวของ{g} {g}ตกใจจนเตะโต๊ะพลิก แต่ข้าวเหนียวไม่หก",fx:"exp"},
   {t:"มีงานบวชข้างโรงแรม ทุกคนโดนชวนไปกินข้าวงานบวชจนอิ่มแปล้",fx:"morale"},
   {t:"{g}ไปร้องคาราโอเกะที่ล็อบบี้ แล้วได้คะแนนเต็มร้อยจากเครื่อง เจ้าของร้านให้เบียร์ฟรี… {g}ขอเป็นน้ำแดงแทน",fx:"none"}],
 central:[{t:"ลิงปีนเข้าทางหน้าต่างห้อง{g}กลางดึก ขโมยกล้วยไปหนึ่งหวีแล้วทิ้งเปลือกไว้บนหมอน",fx:"none"},
   {t:"รถขายไอศกรีมกะทิเปิดเพลงวนหน้าโรงแรมทั้งคืน {g}ออกไปซื้อทุกรอบที่มันผ่าน",fx:"tired"},
   {t:"น้ำท่วมซอยหน้าโรงแรมหลังฝนตกหนัก ทุกคนลุยน้ำกลับห้อง {g}บอกว่าเหมือนซ้อมวิ่งในน้ำ",fx:"exp"},
   {t:"เจ้าของโรงแรมเคยเป็นนักมวยเก่า เล่าเรื่องสมัยชกที่ราชดำเนินให้ฟังจนดึก",fx:"exp"},
   {t:"ร้านข้าวต้มโต้รุ่งหน้าโรงแรมจำค่ายศิริชัยได้ ลดราคาให้ครึ่งหนึ่ง",fx:"morale"},
   {t:"{g}ลืมกุญแจห้องไว้ข้างใน ต้องปีนระเบียงเข้าห้อง ทุกคนยืนเชียร์อยู่ข้างล่าง",fx:"none"}],
 south:[{t:"ฝนตกหนักทั้งคืน หลังคาโรงแรมรั่วตรงเตียง{g}พอดี {g}นอนกางร่มจนเช้า",fx:"tired"},
   {t:"ร้านโรตีหน้าโรงแรมเปิดถึงตีสอง {g}สั่งโรตีกล้วยไปหกจาน บอกว่าเป็นอาหารนักกีฬา",fx:"morale"},
   {t:"ปูลมวิ่งเข้าห้องจากชายหาด {g}ไล่จับจนหมดแรง ปูหนีไปได้",fx:"exp"},
   {t:"ลุงชาวประมงเห็นป้ายค่ายมวยบนรถ เอาปลาหมึกย่างมาให้ทั้งค่ายฟรี",fx:"morale"},
   {t:"ไฟดับทั้งเมือง ทุกคนเอาไฟฉายมานั่งเล่าเรื่องผีกันที่ระเบียง {g}กลัวจนไม่ยอมไปห้องน้ำคนเดียว",fx:"none"},
   {t:"{g}ลองสั่งข้าวเป็นภาษาใต้ แม่ค้าตอบมายาวมากจน{g}ได้ข้าวมาสามจาน",fx:"none"}]};
const RG_ODD_FX={tired:["ทุกคนนอนน้อย · ความล้า +4",G=>{for(const f of roadRiders(G))f.fatigue=Math.min(100,(f.fatigue||0)+4);}],exp:["ได้ซ้อมโดยไม่ตั้งใจ · ประสบการณ์ +3",G=>{for(const f of roadRiders(G))f.exp=(f.exp||0)+3;}],
  morale:["ทั้งค่ายอารมณ์ดี · กำลังใจ +3",G=>{for(const f of roadRiders(G))f.morale=Math.min(100,(f.morale||0)+3);}],none:[null,()=>{}]};
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const RG_CID0={...RG_CID}; /* v1.91.30: the four first champions — fixed, even when a later edition crowns someone new */
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
/* v1.91.78 (Man): on a trip, only the girls who actually rode along can be in the scene */
const rgInT=(G,id)=>rgIn(G,id)&&(()=>{const P=G.region&&G.region.trip&&G.region.trip.party;return !P||P.includes(id);})();
const RG_PAIR={uttaradit:"kati",buriram:"ploy",surat:"mali",suphan:"rin"};
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
 {n:"npc",who:"พิธีกร",show:[{id:"tabtim",l:"casual"}],t:"แชมป์ภาคอีสาน ทับทิมเอกแดนอีสาน… ทับทิม!"},
 {n:"tabtim",f:"happy",l:"casual",t:"สวัสดีพี่น้องทั้งห้องเด้อ! แอร์เย็นคักแท้ หนาวกว่าโคราชหน้าหนาวอีก ฮ่า ๆ ๆ"},
 {n:"nar",t:"ทับทิมหัวเราะลั่นจนทั้งห้องหัวเราะตาม แต่ระหว่างนั้นเธอแอบก้าวยาว ๆ วัดความกว้างของเวทีไปด้วย"},
 {n:"npc",who:"พิธีกร",show:[{id:"alicia",l:"casual"}],t:"แชมป์ภาคกลาง เจ้าหญิงมวยไทย… อลิเซีย!"},
 {n:"nar",t:"แฟลชกล้องรัวจนห้องสว่างวาบ อลิเซียหันยิ้มให้กล้องทีละตัวแบบไม่พลาดสักตัว"},
 {n:"alicia",f:"happy",l:"casual",t:"ขอบคุณค่ะ Thank you, everyone. ปีนี้ฉันไม่ได้มาถ่ายรูปนะคะ ฉันมาเพื่อชนะ"},
 {n:"npc",who:"พิธีกร",show:[{id:"chaba",l:"casual"}],t:"และแชมป์ภาคใต้ หมัดใต้ฝุ่น… ชบา!"},
 {n:"chaba",f:"happy",l:"casual",t:"…มาชก ไม่ได้มาแหลง"},
 {n:"nar",t:"ห้องเงียบไปสามวินาที แล้วพิธีกรก็รีบชวนทุกคนปรบมือ"},
 {n:"nar",t:"พอพิธีเปิดจบ แชมป์ทั้งสี่เดินลงจากเวที แล้วตรงมาที่โต๊ะของค่ายศิริชัย",choice:[
   {t:"ทักใบบัวก่อน",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการค่ายศิริชัยตัวจริงเลย… หนูดูไลฟ์ไฟต์ค่ายนี้ทุกนัดเลย"}]},
   {t:"ทักทับทิมก่อน",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"พี่ผู้จัดการ! ทับทิมจำหน้าได้ ไลฟ์ค่ายพี่สนุกมากเลย"}]},
   {t:"ทักอลิเซียก่อน",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh ค่ายที่ใคร ๆ ก็พูดถึง ตัวจริงดูธรรมดากว่าในคลิปนะคะ …ฉันชมนะ"}]},
   {t:"ทักชบาก่อน",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ชบา"},{n:"nar",t:"ชบาพยักหน้าครั้งเดียว แต่ยืนอยู่ตรงนั้นนานกว่าที่จำเป็น"}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"กะทิใช่ไหม ท่าเสาเหมือนกัน… หนูได้ยินชื่อมาตั้งนานแล้ว"},{n:"kati",f:"flustered",l:"casual",t:"ห-หนูก็ได้ยินชื่อพี่ใบบัวค่ะ! ศอกบัวบานกลับหลังที่ลือกันนั่น…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"อ้อ! นี่เองพลอยหมัดโคราช ลูกหลานบ้านเราที่ไปดังค่ายเชียงใหม่ ทับทิมอยากลองโดนสักหมัด"},{n:"ploy",f:"happy",l:"casual",t:"…อยากลองก็ขึ้นเวทีมาสิ"}]),
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
 north:["ผู้จัดการได้ซองเขียวเหมือนกันใช่ไหมเจ้า… ข้อสิบสี่จุดสาม หนูก็สะดุดตรงนั้นเหมือนกัน","ตอนเวกเตอร์มาขอซื้อค่ายหนู สัญญาของเขาก็มีข้อแบบนี้ ตัวหนังสือเหมือนกันเปี๊ยบเลยเจ้า"],
 isan:["พี่ผู้จัดการ ได้ซองเขียวเหมือนกันไหม! ทับทิมอ่านไม่จบหรอก แต่น้องชายที่เรียนนิติฯ บอกว่าข้อสิบสี่มันแปลก ๆ","แล้วรู้ไหม เวกเตอร์เคยส่งสัญญามาให้ทับทิมตอนต้นปี ข้อเดียวกันเป๊ะเลยเด้อ"],
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
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgInT(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`รถของค่ายแวะเติมน้ำมันที่ปั๊มสุดท้ายก่อนเข้า${D.name} หมอกยังลอยต่ำอยู่เหนือภูเขา`},
  {n:"nar",t:"หน้าร้านกาแฟมีมอเตอร์ไซค์คันเก่าจอดรออยู่ ผู้หญิงผมชมพูยืนกอดตะกร้าหวายใบใหญ่ไว้แน่น"},
  {n:"baibua",f:"happy",l:"casual",t:"มาฮอดแล้วเจ้า! หนูได้ข่าวว่าค่ายศิริชัยจะมาเก็บเข็มขัดภาคเหนือ ก่เลยขี่รถมาดักรอเจ้า"},
  {n:"baibua",f:"happy",l:"casual",t:"ข้าวต้มมัด หนูห่อเองตั้งแต่ตีสี่ มีพอให้ทุกคนนะ"},
  {n:"nar",t:"ทุกคนได้ข้าวต้มมัดคนละห่อ มัดตอกเรียบร้อยเหมือนกันหมด ยกเว้นห่อของผู้จัดการที่ผูกตอกเป็นโบเล็ก ๆ",choice:[
    {t:"ถามว่าทำไมห่อนี้มีโบ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"บ่… บ่มีหยังเจ้า! มือมันผูกไปเองเจ้า… กิ๋นเถอะเจ้า ลำขนาดเลย"}]},
    {t:"ชมว่าห่อนี้สวยกว่าทุกห่อ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการตาไวจัง… ห่อนั้นหนูตั้งใจที่สุด"}]},
    {t:"ขอบคุณแล้วนั่งกินเงียบ ๆ",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"อร่อยไหม? …อร่อยก็ดีแล้ว"}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"แล้วก็… ขอโทษเรื่องวันงานเปิดตัวนะ หนูพูดเสียงเบาไป พิธีกรต้องเอาไมค์มาจ่อปากเลย"},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"ไม่เป็นไรเลยค่ะพี่ใบบัว! เรื่องศอกนี่คนทั้งห้องได้ยินชัดแจ๋วเลย"},{n:"baibua",f:"flustered",l:"casual",t:"…อันนั้นหนูตั้งใจพูดดังแล้วนะ"}]),
  {n:"baibua",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}คนนี้หนูเคยชกด้วย เขาออกตัวไว ยกแรกระวังหน่อยนะ พอยกสามเขาจะเริ่มหมดแรง`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จดคำแนะนำของใบบัวไว้ในมือถือ · กำลังใจ +3`:"ทุกคนจดคำแนะนำของใบบัวไว้"},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ใบบัว")}]:[]),
  {n:"coach",t:"ข้าวต้มมัดอร่อยกว่าร้านหน้าค่ายอีก… อย่าไปบอกป้าแดงนะ"},
  {n:"nar",t:"ใบบัวโบกมือส่งรถออกจากปั๊ม แล้วขี่มอเตอร์ไซค์ตามมาห่าง ๆ จนถึงสนามมวย"}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgInT(G,"kati");return [
  {n:"nar",t:"ก่อนกลับที่พัก ใบบัวพาทั้งค่ายแวะศาลครูมวยท่าเสา ศาลไม้เก่าใต้ต้นโพธิ์ มีนวมเก่าคู่หนึ่งแขวนอยู่ข้างหิ้ง"},
  {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นบ้านเกิดของมวยท่าเสา พ่อหนูพามากราบครูทุกปี ก่อนพ่อจะเจ็บเข่า"},
  ...(kati?[
   {n:"nar",t:"กะทิยืนนิ่งอยู่หน้าศาลนานกว่าทุกคน แล้วค่อย ๆ ถอยออกมานั่งที่ขั้นบันได"},
   {n:"kati",f:"sad",l:"casual",t:"…หนูไม่แน่ใจว่าหนูมีสิทธิ์กราบตรงนี้ไหมคะ"},
   {n:"kati",f:"sad",l:"casual",t:"ท่าเสาของหนูเป็นครูพักลักจำค่ะ ปู่ชัยแอบดูครูท่าเสาชกตามงานวัด จำมาแล้วสอนหนู ไม่เคยมีใครครอบครูให้ปู่เลยสักครั้ง"},
   {n:"kati",f:"sad",l:"casual",t:"พี่ใบบัวเป็นท่าเสาสายตรง ตั้งแต่พ่อ ตั้งแต่ปู่ของพี่… ส่วนหนู หนูแค่ลอกท่าเขามา",choice:[
     {t:"\"ปู่ชัยดูจนจำได้ทุกท่า นั่นก็คือรักมวยท่าเสาแล้ว\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…ปู่จำได้ทุกท่าจริง ๆ ค่ะ ตอนเด็ก ๆ หนูเห็นปู่รำท่าเสาคนเดียวหลังค่ายทุกเย็น"}]},
     {t:"\"ลองถามพี่ใบบัวดูสิ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"ถามหนูได้เลย"}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"กะทิ… รู้ไหม หนูอิจฉากะทินะ"},
   {n:"kati",f:"surprised",l:"casual",t:"อิจฉาหนูเหรอคะ?!"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูได้ท่ามาจากพ่อก็จริง แต่ทุกวันนี้หนูแบกค่ายคนเดียว ซ้อมคนเดียว กินข้าวกับพ่อสองคน… ไม่มีใครช่วยเลย"},
   {n:"baibua",f:"happy",l:"casual",t:"กะทิมีครูแดง มีผู้จัดการ มีเพื่อนทั้งค่ายคอยดู ท่าเสาของกะทิไม่ได้มาจากครูคนเดียว มันมาจากคนทั้งค่าย"},
   {n:"baibua",f:"happy",l:"casual",t:"มวยไม่ได้อยู่ในสายเลือดหรอก มันอยู่ในคนที่ยังชกมันอยู่… มากราบครูด้วยกันนะ"},
   {n:"nar",t:"กะทิกับใบบัวคุกเข่าลงหน้าศาลพร้อมกัน กราบสามครั้ง ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ"},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…พี่ใบบัวคะ ปีหน้ามากราบครูด้วยกันอีกนะคะ"},
   {n:"baibua",f:"happy",l:"casual",t:"สัญญา"},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"กะทิ กำลังใจ +5 · กะทิกับใบบัวสนิทกันขึ้น"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"ปีนี้หนูมาคนเดียว… ขอบคุณที่มาเป็นเพื่อนนะ"},
   {n:"nar",t:"ผู้จัดการพนมมือไหว้ศาลครูตามใบบัว ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer (v1.91.119: to the Jin Long resort, was Vector), in a letter */
const RG_POST={
 north:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูตอบรีสอร์ทจินหลงไปแล้วเจ้า ว่าที่ดินบัวท่าเสาบ่ขาย ทั้งค่าย ทั้งสปา ทั้งสระบัวของแม่\n\nพ่อถามว่าเอาความกล้ามาจากไหน หนูตอบว่า \"ใครมาข่มก็บ่ต้องกลัว ดูค่ายศิริชัยสิเจ้า\" พ่อหัวเราะครั้งแรกในรอบสองปีเลยเจ้า\n\nถ้วยอยู่กับค่ายศิริชัยแล้ว แต่ใจของมวยท่าเสายังอยู่ที่เชียงใหม่เน้อ ว่าง ๆ ขึ้นมาแอ่วหาหนูกับพ่อเจ้า\n\n— ใบบัว"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["เช้านี้หมอกลงหนามากเลยเจ้า ผู้จัดการตื่นแล้วหรือยัง",[["ตื่นแล้ว กำลังจะไปดูเด็ก ๆ ซ้อม",1,"ขยันจังเลย หนูก็กำลังจะไปซ้อมเหมือนกันเจ้า"],["ยังเลย นี่พิมพ์ทั้งที่หลับตาอยู่",2,"ฮิ ๆ หลับตาก็พิมพ์ถูกทุกตัวเลย เก่งจริง ๆ เจ้า"],["หมอกแบบนี้ขับรถระวังด้วยนะ",2,"…หนูจะระวังเจ้า ขอบคุณที่เป็นห่วงนะ"]]],
   ["พ่อให้หนูถามว่า ค่ายศิริชัยเปิดมากี่ปีแล้วเจ้า",[["ตั้งแต่รุ่นปู่ชัย สี่สิบกว่าปีแล้ว",1,"โอ้ พ่อบอกว่าเก่ากว่าค่ายบัวท่าเสาอีกเจ้า"],["เดี๋ยวพาไปดูรูปเก่าในค่ายนะ",2,"จริงเหรอเจ้า! หนูจะรอนะ"],["ถามทำไมเหรอ",0,"ไม่มีอะไรเจ้า พ่อแค่อยากรู้"]]],
   ["หนูต้องไปซ้อมแล้วเจ้า… คุยกันแค่นี้ก่อนนะ",[["ไปเถอะ ซ้อมเสร็จค่อยคุยต่อ",2,"เจ้า! ซ้อมเสร็จหนูทักไปเลยนะ"],["อย่าหักโหมนะ",1,"เจ้า หนูจะยืดเส้นก่อนทุกครั้ง"],["โอเค",0,"เจ้า"]]]]},
  {id:"bb_dad",x:[
   ["วันนี้พ่อลุกเดินรอบค่ายได้สองรอบเจ้า! หมอบอกว่าเข่าดีขึ้นแล้ว",[["ดีใจด้วยนะ!",1,"ขอบคุณเจ้า หนูดีใจจนน้ำตาไหลเลย"],["ฝากบอกพ่อว่าทั้งค่ายศิริชัยเชียร์อยู่",2,"หนูบอกแล้วเจ้า พ่อยิ้มแล้วบอกว่าค่ายนั้นใจดีจริง ๆ"],["อย่าให้พ่อหักโหมนะ",1,"เจ้า หนูคอยเดินตามอยู่ข้าง ๆ ตลอดเลย"]]],
   ["พ่ออยากให้หนูกลับไปเรียนต่อ ไม่อยากให้ชกมวยแล้ว… ผู้จัดการคิดว่ายังไงเจ้า",[["ถามใจตัวเองก่อนว่าอยากทำอะไร",2,"…ใจหนูอยากชกเจ้า หนูรู้อยู่แล้ว แค่อยากได้ยินคนพูด"],["เรียนไปด้วยชกไปด้วยก็ได้นะ",1,"ทำได้จริง ๆ เหรอเจ้า… หนูจะลองคิดดูนะ"],["พ่อพูดถูกนะ",0,"…เจ้า หนูจะลองคิดดู"]]],
   ["ขอบคุณที่ฟังนะเจ้า หนูไม่ค่อยมีใครให้เล่าเรื่องนี้",[["เล่าได้ทุกเรื่องเลย",2,"…หนูจะเล่าบ่อย ๆ เลยนะ ห้ามรำคาญ"],["ยินดีเสมอ",1,"เจ้า ขอบคุณเจ้า"],["ไม่เป็นไร",0,"เจ้า"]]]]},
  {id:"bb_food",x:[
   ["หนูทำแกงฮังเลหม้อใหญ่เจ้า กินกับพ่อสองคนไม่หมด",[["ส่งมาค่ายบ้างสิ",2,"ได้เจ้า! เดี๋ยวหนูส่งไปรษณีย์… แกงส่งไปรษณีย์ได้ไหมนะ"],["น่ากินจัง",1,"อร่อยมากเลยเจ้า สูตรแม่หนูนะ"],["แช่ตู้เย็นไว้สิ",0,"เจ้า หนูก็ว่าจะแช่ไว้"]]],
   ["ผู้จัดการชอบกินอะไรที่สุดเจ้า",[["ข้าวต้มมัดของใบบัว",2,"…ผู้จัดการพูดแบบนี้ หนูจะห่อให้ทุกอาทิตย์เลยเจ้า"],["ข้าวมันไก่หน้าตลาด",1,"ร้านที่กะทิชอบใช่ไหมเจ้า หนูจะไปลองบ้าง"],["อะไรก็ได้",0,"กินได้ทุกอย่างก็ดีเจ้า"]]],
   ["อยู่เชียงใหม่เหมือนกันแท้ ๆ ผู้จัดการยังไม่เคยกินข้าวซอยร้านลับของหนูเลย วันหลังหนูพาไปนะเจ้า",[["สัญญานะ",2,"สัญญาเจ้า! ร้านนี้หนูไม่เคยพาใครไปเลย"],["พาทั้งค่ายไปเลย",1,"ได้เจ้า แต่ร้านเขามีโต๊ะแค่สองตัว ฮิ ๆ"],["ถ้าว่างนะ",0,"เจ้า ถ้าว่างนะ"]]]]},
  {id:"bb_elbow",x:[
   ["วันนี้หนูซ้อมศอกบัวบานกลับหลังร้อยรอบเจ้า แขนจะหลุดแล้ว",[["เก่งมาก แต่พักบ้างนะ",2,"เจ้า… มีคนบอกให้พัก หนูก็จะพัก"],["สอนกะทิบ้างได้ไหม",1,"ได้เจ้า! แต่กะทิต้องสอนท่าของกะทิให้หนูด้วยนะ"],["ร้อยรอบน้อยไปนะ",0,"…ผู้จัดการโหดกว่าครูหนูอีกเจ้า"]]],
   ["ผู้จัดการรู้ไหมเจ้า ศอกท่านี้พ่อคิดขึ้นตอนเห็นดอกบัวบานในสระวัด",[["สวยแบบมวยท่าเสาเลย",2,"เจ้า… มวยของพ่อสวยจริง ๆ หนูอยากให้คนทั้งประเทศได้เห็น"],["ดอกบัวมีหนามด้วยเหรอ",1,"ไม่มีเจ้า! คนอื่นเขาเรียกหนูเอง หนูไม่ได้ตั้ง ฮิ ๆ"],["ดอกบัวก็ดี",0,"เจ้า"]]],
   ["ถ้าวันหนึ่งหนูเจอกะทิบนเวที ผู้จัดการจะเชียร์ใครเจ้า",[["เชียร์ใบบัวแบบเงียบ ๆ",2,"…ห้ามบอกกะทินะเจ้า หนูก็จะเชียร์ผู้จัดการเงียบ ๆ เหมือนกัน"],["เชียร์ทั้งคู่",1,"ตอบเก่งจังเจ้า… หนูก็จะเชียร์กะทิเหมือนกันนะ"],["เชียร์กะทิสิ",0,"ฮิ ๆ ก็ถูกแล้วเจ้า"]]]]},
  {id:"bb_vector",x:[
   ["รีสอร์ทจินหลงส่งคนมาอีกแล้วเจ้า ขึ้นราคาที่ดินให้อีกสองล้าน",[["อย่าเพิ่งตัดสินใจคนเดียวนะ",2,"…เจ้า หนูจะปรึกษาผู้จัดการก่อนทุกครั้งเลยนะ"],["ค่ายบัวท่าเสาไม่ได้มีไว้ขาย",2,"พ่อก็พูดแบบนี้เลยเจ้า… หนูดีใจที่ได้ยินอีกคน"],["สองแสนก็เยอะนะ",0,"…เจ้า หนูรู้เจ้า"]]],
   ["บางทีหนูก็คิดว่า ถ้าขายที่ไป นักเลงจะได้เลิกมาป่วนแม่กับพี่ ๆ หมอนวด",[["มีทางอื่นอีกหลายทาง เดี๋ยวช่วยหา",2,"…ผู้จัดการช่วยหนูคิดจริง ๆ เลยเจ้า ขอบคุณนะ"],["เข้าใจเลยว่าลำบาก",1,"เจ้า… ขอบคุณที่เข้าใจนะ"],["ก็เป็นทางหนึ่ง",0,"เจ้า"]]],
   ["คุยกับผู้จัดการแล้วใจเบาขึ้นเจ้า… ไม่รู้เป็นเพราะอะไร",[["เพราะไม่ได้แบกคนเดียวแล้วไง",2,"…เจ้า หนูไม่ได้แบกคนเดียวแล้วนะ"],["ทักมาได้ทุกเมื่อ",1,"เจ้า! หนูจะทักบ่อย ๆ"],["ดีแล้ว",0,"เจ้า"]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgInT(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"ถนนตรงยาวสุดลูกหูลูกตาผ่านทุ่งนา ข้างหน้ามีมอเตอร์ไซค์จอดควันโขมงอยู่หน้าปั๊มร้าง ผู้หญิงผมแดงยืนโบกมือกลางถนนสองมือ"},
  {n:"tabtim",f:"happy",l:"casual",t:"จอด ๆ ๆ! ค่ายศิริชัยแม่นบ่! ทับทิมเองเด้อ! มอไซค์ทับทิมพังพอดี ขอติดรถไปเวทีแน่เด้อ"},
  {n:"nar",t:"ยังไม่ทันมีใครตอบ ทับทิมก็เปิดประตูหน้าแล้วนั่งข้างคนขับหน้าตาเฉย"},
  {n:"tabtim",f:"happy",l:"casual",t:"ทับทิมนั่งหน้าเด้อ เมารถ… บ่ได้เมารถดอก แค่อยากนั่งใกล้พี่ผู้จัดการ ฮ่า ๆ ล้อเล่น ๆ เอาไปเป็นแฟนเด้อ ล้อเล่นอีกแหละ!",choice:[
    {t:"\"ถ้าล้อเล่นสองรอบ แปลว่าไม่ได้ล้อเล่นนะ\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…เอ้า! พี่ผู้จัดการตอบจริงจังซะงั้น ทับทิมไม่มีมุกต่อแล้ว"}]},
    {t:"หัวเราะแล้วขับรถต่อ",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ ใจเย็นจังเลยพี่ ทับทิมชอบคนใจเย็น"}]},
    {t:"\"คาดเข็มขัดนิรภัยด้วยนะ\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"คาดแล้ว ๆ… โธ่ พี่ผู้จัดการนี่จริงจังแท้"}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ทับทิม")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"เอ๊ะ! ข้างหลังนั่นพลอยใช่ไหม! พลอยหมัดโคราช คนบ้านเรา! ทับทิมอยากลองโดนสักหมัดมาตั้งแต่งานเปิดตัว"},
    {n:"ploy",f:"pout",l:"casual",t:"…นั่งหันหน้าไปข้างหน้าเถอะ เดี๋ยวคอเคล็ด"}]),
  {n:"nar",bg:"somtam_stall",t:"ทับทิมคุยไม่หยุดตลอดทาง แล้วสั่งให้แวะร้านส้มตำริมทาง \"ร้านนี้แซบที่สุดในภาค ทับทิมเลี้ยงเอง!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}ก็คนบ้านใกล้ ๆ ทับทิมนี่แหละ เขาเตะหนักแต่การ์ดซ้ายต่ำ เตะซ้ายสวนเข้าไปเลย`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของทับทิมไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของทับทิมไว้"},
  {n:"coach",t:"ส้มตำร้านนี้เผ็ดจนครูน้ำตาไหล… แต่อร่อยจริง"},
  {n:"tabtim",f:"happy",l:"casual",t:"ไปนะทุกคน! ทับทิมจะไปนั่งเชียร์ข้างเวที… เชียร์ฝั่งไหนไม่บอกหรอก ฮ่า ๆ"}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgInT(G,"ploy");return [
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
   {n:"tabtim",f:"happy",l:"casual",t:"ข้อมูล ๆ ๆ คนกรุงเทพฯ นี่ชอบข้อมูลจริง ๆ ทับทิมว่ากินส้มตำดีกว่า ฮ่า ๆ"},
   {fx:G2=>rgMeet(G2,"tabtim",1)}])];}};
RG_POST.isan="เถิง พี่ผู้จัดการ\n\nพ่อกลับบ้านมาแล้วกะบ่เว้าหยังเลยเด้อ สามมื้อ\n\nมื้อที่สี่ พ่อเอาผ้าคาดเอวเก่าของพ่อมาวางไว้หัวนอนทับทิม ผ้าผืนที่พ่อใช้ชกตอนหนุ่ม ๆ พ่อบอกแค่ว่า \"เตะกะเตะสิ แต่เตะให้สุด\"\n\nทับทิมฮ้องไห้ทั้งคืนเลยเด้อ บ่ต้องบอกไผ\n\nถ้วยอยู่ค่ายศิริชัยแล้ว ดูแลให้ดีเด้อ ทับทิมสิไปเอาคืนจักมื้อ ฮ่า ๆ\n\n— ทับทิม";
RG_CHAT.tabtim=[
 {id:"tt_fee",x:[
  ["พี่ผู้จัดการ! น้องคนเล็กทับทิมสอบติดมหาลัยแล้วเด้อ!!",[["ยินดีด้วย! ทับทิมเก่งมากที่ส่งน้องเรียนมาถึงนี่",2,"…เอ้า พี่ชมทับทิมแทนชมน้องซะงั้น ทับทิมน้ำตาจะไหลแล้วเด้อ"],["เลี้ยงฉลองเลยไหม",1,"เลี้ยงหมูกระทะทั้งหมู่บ้านเลย! พี่ออกครึ่งนึงเด้อ ฮ่า ๆ"],["คณะอะไรเหรอ",1,"นิติฯ เด้อ! คนเดียวกับที่อ่านสัญญาซองเขียวให้นั่นแหละ"]]],
  ["แต่ค่าเทอมแพงมากเลยเด้อ… ทับทิมต้องชนะอีกหลายไฟต์",[["อย่าแบกคนเดียว มีอะไรบอกได้นะ",2,"…พี่ใจดีจัง ทับทิมไม่ชินเลยเด้อ"],["ชนะได้อยู่แล้ว เตะทับทิมหนักจะตาย",1,"ฮ่า ๆ ใช่เลย! เตะทับทิมจ่ายค่าเทอมได้เด้อ"],["ทุนการศึกษาก็มีนะ",1,"เออ! ทับทิมจะไปถามน้องดู"]]],
  ["ไปซ้อมก่อนเด้อ! เตะสิบลูก หนึ่งลูกเท่ากับค่าหนังสือหนึ่งเล่ม ฮ่า ๆ",[["สู้ ๆ นะ",1,"สู้เด้อ!"],["เตะเผื่อฉันด้วย",2,"ได้เลย! ลูกที่สิบเอ็ดเตะให้พี่ผู้จัดการเด้อ"],["อย่าลืมพัก",1,"รู้แล้ว ๆ พี่นี่ห่วงแท้"]]]]},
 {id:"tt_somtam",x:[
  ["ทับทิมสอนน้องในค่ายตำส้มตำ ใส่พริกยี่สิบเม็ด น้องร้องไห้เลยเด้อ ฮ่า ๆ",[["ยี่สิบเม็ดมันโหดไปแล้ว!",1,"โหดตรงไหน! คนอีสานกินสามสิบเม็ดเป็นเรื่องปกติ"],["ส่งสูตรมาให้ค่ายบ้างสิ",2,"ได้เลย! แต่ห้ามบอกป้าแต๋วเด้อ สูตรลับตระกูลทับทิม"],["น้องโอเคไหม",1,"โอเค ๆ ดื่มน้ำไปสามขวด ตอนนี้แซวทับทิมคืนแล้ว"]]],
  ["พี่ผู้จัดการกินเผ็ดได้ไหม",[["ได้สบาย",1,"จริงเหรอ! ครั้งหน้าทับทิมจะตำพริกสิบเม็ดให้ลองเด้อ"],["ได้นิดหน่อย",1,"ไม่เป็นไร ทับทิมตำแบบเผ็ดน้อยให้ ทำพิเศษให้คนเดียวเด้อ"],["กินได้ถ้าทับทิมตำให้",2,"…โอ๊ย พี่ผู้จัดการ! พูดแบบนี้ทับทิมตำไม่ถูกแล้ว"]]],
  ["ไปตำส้มตำขายตลาดเช้าก่อนเด้อ หาค่าเทอมน้อง!",[["ขายดี ๆ นะ",1,"ขายหมดครกเด้อ!"],["เก็บไว้ให้ครกนึง",2,"เก็บไว้ให้แล้ว ใส่ปลาร้าพิเศษเด้อ!"],["โอเค",0,"เด้อ!"]]]]},
 {id:"tt_live",x:[
  ["ทับทิมเปิดไลฟ์ค่ายพี่ดูทุกวันเลย ค่ายพี่สนุกมาก ครูแดงดุจริงไหมเด้อ",[["หน้าดุแต่ใจดี",1,"ใช่เลย! หน้าดุแต่แอบยื่นขนมให้เด็ก ๆ ทับทิมเห็นในไลฟ์เด้อ"],["ทับทิมดูไลฟ์ทุกวันเลยเหรอ",2,"…เอ้า ถามแบบนี้ทับทิมจะตอบยังไงล่ะ ใช่ ดูทุกวัน พอใจหรือยัง"],["ดุจริง ระวังโดนสั่งวิ่งรอบค่าย",1,"ฮ่า ๆ สักวันทับทิมจะไปวิ่งรอบค่ายพี่ดูบ้าง"]]],
  ["มีคนคอมเมนต์ในไลฟ์ว่าทับทิมเตะสวยที่สุดในภาคอีสานเด้อ",[["จริงนี่",2,"…ฮ่า ๆ พี่ผู้จัดการคอมเมนต์เองหรือเปล่า ดูชื่อบัญชีน่าสงสัยอยู่นะ"],["คนนั้นตาถึง",1,"ตาถึงจริง! ทับทิมจะไปกดถูกใจให้"],["อย่าไปอ่านคอมเมนต์มาก",1,"ฮ่า ๆ รู้แล้ว แต่คอมเมนต์ดี ๆ ก็อ่านได้เด้อ"]]],
  ["คราวหน้าพี่ต้องออกกล้องในไลฟ์นะ ทับทิมจะรอดู",[["จะโบกมือให้",2,"โบกมาเลย ทับทิมจะโบกกลับ… ถึงพี่จะไม่เห็นก็ตาม"],["อายกล้องอะ",1,"ไม่ต้องอายเด้อ หน้าพี่ผู้จัดการก็ใช้ได้อยู่ ฮ่า ๆ"],["ไม่รับปากนะ",0,"โธ่!"]]]]},
 {id:"tt_dad",x:[
  ["วันนี้พ่อโทรมาถามว่าทับทิมกินข้าวหรือยัง… พ่อไม่เคยโทรมาก่อนเลยเด้อ",[["พ่อเริ่มเปิดใจแล้วนะ",2,"…ทับทิมก็คิดแบบนั้น ทับทิมตอบพ่อว่ากินแล้ว ทั้งที่ยังไม่ได้กิน ฮ่า ๆ"],["แล้วกินหรือยังล่ะ",1,"ยังเลย! พี่ถามแบบพ่อเลยเด้อ"],["ดีใจด้วยนะ",1,"ขอบใจเด้อ ทับทิมยิ้มทั้งวันเลย"]]],
  ["พี่ว่าสักวันพ่อจะมาดูทับทิมชกไหม",[["ต้องมาแน่ ถ้าทับทิมยังเตะแบบนี้",2,"…ทับทิมจะเตะต่อไปเรื่อย ๆ จนกว่าพ่อจะมาดูเด้อ"],["ชวนพ่อดูสิ",1,"เออ ทับทิมจะลองชวนดู… ถ้าพ่อไม่มา พี่มาแทนนะ"],["ไม่แน่ใจนะ",0,"…เด้อ"]]],
  ["ขอบใจที่ฟังเด้อ ทับทิมพูดเรื่องนี้ได้แค่กับพี่คนเดียว",[["เล่าได้ตลอดเลย",2,"…ฮ่า ๆ ไม่ขำแล้ว ทับทิมเขินเด้อ"],["ยินดีเสมอ",1,"ขอบใจเด้อ!"],["ไม่เป็นไร",0,"เด้อ"]]]]},
 {id:"tt_kick",x:[
  ["ทับทิมฝึกเตะกระโดดได้สูงกว่าเดิมอีกคืบเด้อ! อีกนิดเดียวจะเตะถึงหลอดไฟแล้ว",[["อย่าเตะหลอดไฟแตกนะ",1,"แตกไปแล้วดวงนึง ฮ่า ๆ อย่าบอกพ่อนะ"],["สูงกว่าบั้งไฟหรือยัง",2,"…พี่ยังจำเรื่องบั้งไฟได้อยู่เหรอ ทับทิมดีใจเด้อ"],["เก่งมาก",1,"เก่งจริงเด้อ ชมอีก ๆ"]]],
  ["ถ้าทับทิมเจอพลอยบนเวที พี่ว่าใครจะชนะ",[["ทับทิมชนะเรื่องเตะ พลอยชนะเรื่องหมัด",2,"ตอบแบบนี้ไม่มีใครเสียใจเลย พี่ฉลาดจัง"],["พลอยสิ เป็นคนค่ายเรา",1,"โอ๊ย! เข้าข้างค่ายตัวเองชัด ๆ ทับทิมจะไปฟ้องพลอย"],["ไม่รู้สิ",0,"ตอบกลาง ๆ แบบนี้ ไม่สนุกเลย"]]],
  ["ไปซ้อมต่อเด้อ ขอเตะอีกร้อยลูก!",[["เตะเผื่อฉันด้วย",2,"ลูกที่ร้อยเตะให้พี่เด้อ!"],["อย่าหักโหมนะ",1,"รู้แล้ว ๆ"],["โอเค",0,"เด้อ!"]]]]}];
CHAT.tabtim=RG_CHAT.tabtim;
/* v1.90 round 8: the South in full — Chaba's sidecar at the bus terminal, Mali's home at Chaiya and the pier at Don Sak (Mali's story), a richer visit, the letter after the cup and Chaba's chats. Southern lines are drafts for a native speaker to check. */
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgInT(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"bus_terminal",t:"ขับรถกันมาทั้งคืน รถของค่ายเข้าจอดที่สถานีขนส่งตอนฟ้าสาง ข้างประตูทางออกมีมอเตอร์ไซค์พ่วงข้างสีซีดจอดอยู่คันเดียว"},
  {n:"chaba",f:"happy",l:"casual",t:"…ที่พักอยู่ในซอย รถใหญ่เข้าม่ายได้ ขึ้นพ่วงข้าง ทีละคน"},
  {n:"nar",t:"ชบาชี้ที่นั่งพ่วงข้าง แล้วมองมาที่ผู้จัดการคนเดียว ไม่อธิบายอะไรเลย",choice:[
    {t:"นั่งตามที่ชบาชี้",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"ชบาขี่ช้ากว่าที่ควรจะเป็น ตลอดทางไม่พูดสักคำ แต่เลี่ยงหลุมให้ทุกหลุม"}]},
    {t:"ถามว่าทำไมเลือกฉันก่อน",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"chaba",f:"flustered",l:"casual",t:"…ไม่ต้องถาม ขึ้นเร็ว ๆ"}]},
    {t:"ให้คนอื่นนั่งไปก่อน",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ก็ได้ เที่ยวหน้า"},{n:"nar",t:"เที่ยวสุดท้าย ชบากลับมารับผู้จัดการคนเดียว ทั้งที่ทุกคนไปถึงหมดแล้ว"}]}]},
  ...(top&&top.id!=="mali"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ชบา")}]:[]),
  ...rgIf(mali,[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มะลิขอนั่งพ่วงข้างเที่ยวที่สองนะ! ตอนเด็ก ๆ พี่ก็เคยพามะลินั่งแบบนี้!"},
    {n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},{n:"nar",t:"แต่เที่ยวที่สอง คนที่ได้นั่งพ่วงข้างคือมะลิ และชบาขี่อ้อมไปทางชายหาดหนึ่งรอบโดยไม่มีใครขอ"}]),
  {n:"chaba",f:"happy",l:"casual",t:`${D.name}… แชมป์หมัดหนัก แต่ขาช้า …ยกสามค่อยเข้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของชบาไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของชบาไว้"},
  {n:"coach",t:"พูดน้อยจริง ๆ เด็กคนนี้… แต่ทุกคำใช้ได้หมด"}];};
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgInT(G,"mali");return mali?[
  {n:"nar",t:"เช้าวันรุ่งขึ้นหลังไฟต์ มะลิขอให้รถแวะไชยา \"บ้านมะลิอยู่ทางผ่านพอดีค่ะ!\" ทั้งที่จริงต้องอ้อมไปสี่สิบกิโล"},
  {n:"nar",t:"ถึงบ้านแม่มะลิ น้อง ๆ สามคนวิ่งออกมากอดมะลิ แม่ของมะลิยกข้าวยำมาวางเต็มแคร่"},
  {n:"npc",who:"แม่มะลิ",t:"มาแล้วหรอ! กินข้าวก่อนลูก ทุกคนเลย… อ้าว แล้วหนูคนนั้นทำไมยืนอยู่หน้าบ้านล่ะ"},
  {n:"nar",show:[{id:"chaba",l:"casual"}],t:"ชบายืนพิงมอเตอร์ไซค์อยู่หน้าประตูรั้ว ไม่ยอมเดินเข้ามา แม้แม่ของมะลิจะเรียกสองรอบ"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"พี่ชบา… ตอนมะลิหกขวบ พี่หายไปเฉย ๆ ไม่บอกลาสักคำ มะลิรอพี่อยู่หน้าบ้านทุกเย็นเลยนะ"},
  {n:"chaba",f:"sad",l:"casual",t:"…"},
  {n:"nar",bg:"pier_south",t:"บ่ายนั้นที่ท่าเรือดอนสัก ระหว่างรอเรือ ชบาเดินมานั่งข้างมะลิที่ปลายท่า"},
  {n:"chaba",f:"sad",l:"casual",t:"ปีนั้นเรือพี่ชายคว่ำ ขาพี่ไม่ดีอีก แม่พาย้ายไปภูเก็ตคืนนั้นเลย หาหมอ หางาน"},
  {n:"chaba",f:"sad",l:"casual",t:"ไม่ได้ลืมมะลิ …แค่ไม่รู้จะพูดยังไง ยิ่งนานยิ่งพูดไม่ออก"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"…ทำไมพี่ไม่ส่งจดหมายมาสักฉบับล่ะ มะลิอ่านหนังสือออกแล้วนะตอนนั้น",choice:[
    {t:"\"ตอนนี้ยังไม่สายนะ ทั้งสองคน\"",fx:G2=>{add(G2,"mali","bond",2);rgMeet(G2,"chaba",1);},then:[{n:"chaba",f:"flustered",l:"casual",t:"…ไม่สาย"}]},
    {t:"เงียบ ปล่อยให้สองคนคุยกันเอง",fx:G2=>{add(G2,"mali","bond",1);rgMeet(G2,"chaba",2);},then:[{n:"nar",t:"ผู้จัดการถอยออกมายืนห่าง ๆ เสียงคลื่นกระทบเสาท่าเรือดังแทนคำพูดอยู่นาน"}]}]},
  {n:"chaba",f:"flustered",l:"casual",t:"…เขียนแล้ว สิบเอ็ดฉบับ ไม่ได้ส่งสักฉบับ ยังอยู่ในลิ้นชัก"},
  {n:"mali",f:"surprised",l:"casual",t:"สิบเอ็ดฉบับ?! …พี่ชบา ส่งมาให้มะลิหมดเลยนะ! ห้ามเก็บไว้แล้ว!"},
  {n:"nar",t:"มะลิร้องไห้ไปหัวเราะไป ชบายกมือขึ้นลูบหัวมะลิสองที เหมือนตอนที่มะลิยังตัวเล็ก ๆ"},
  {n:"chaba",f:"happy",l:"casual",t:"…ตัวใหญ่ขึ้น มะลิ ขี้แยเท่าเดิม"},
  {n:"mali",f:"happy",l:"casual",t:"ไม่ขี้แยแล้ว! …ก็นิดนึง"},
  {fx:G2=>{add(G2,"mali","bond",2);const m=G2.F.mali;if(m)m.morale=Math.min(100,(m.morale||0)+5);rgMeet(G2,"chaba",2);G2.flags.chabaMali=1;}},
  {n:"nar",t:"มะลิ กำลังใจ +5 · มะลิกับชบาคืนดีกันแล้ว"}]
 :[{n:"nar",bg:"pier_south",t:"ก่อนกลับ ชบาพาผู้จัดการไปนั่งที่ปลายท่าเรือดอนสัก รอเรือข้ามฟากลำสุดท้าย"},
  {n:"chaba",f:"sad",l:"casual",t:"…ตอนเด็กมีน้องข้างบ้านที่ไชยาคนหนึ่ง ร้องไห้เก่ง ย้ายบ้านแล้วไม่ได้บอกลา"},
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
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgInT(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
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
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgInT(G,"fah");return [
  {n:"nar",t:"เย็นนั้นทั้งค่ายแวะพระปรางค์สามยอดซื้อของฝาก ยังไม่ทันลงรถ ลิงฝูงใหญ่ก็กระโดดขึ้นหลังคามาเป็นสิบตัว"},
  {n:"nar",t:"ลิงตัวโตที่สุดคว้าถุงขนมของฝากไปทั้งถุง แล้วนั่งแกะกินบนเสาไฟต่อหน้าทุกคน"},
  fah?{n:"fah",f:"angry",l:"casual",t:"เฮ้ย! นั่นขนมของฟ้า! ลงมาเดี๋ยวนี้ ฟ้าจะเตะให้ตกเสาเลย!"}:{n:"coach",t:"อย่าไปแย่งคืนนะ เดี๋ยวมันเรียกพวกมาอีกห้าสิบตัว"},
  {n:"nar",t:"ลิงอีกตัวหยิบผ้าพันมือที่ตากไว้หลังรถไปพันหัวตัวเองเหมือนนักมวย แล้วยืนตั้งการ์ดใส่ทุกคน"},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…มันตั้งการ์ดดีกว่าเด็กใหม่ในค่ายอีกนะ"}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"ถ่ายรูปไว้ก่อนค่ะ! คลิปนี้ต้องขึ้นเพจค่ายแน่ ๆ"}]:[]),
  {n:"coach",t:"ช่างมัน… ปีหน้าค่อยมาเอาผ้าพันมือคืน มันคงเป็นแชมป์ลพบุรีไปแล้ว"},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"ทุกคนหัวเราะกันจนท้องแข็ง · กำลังใจทุกคน +2 · ผ้าพันมือหายไปหนึ่งคู่"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgInT(G,"rin");return rin?[
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
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["ดับเบิลเลก","ทุ่มสะโพก","ซูเพล็กซ์"],tdSty:["leg","hip","suplex"],subName:["ฮีลฮุก","นีบาร์"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"ดับเบิลเลก",k:"td"},{id:"nl_suplex",name:"ซูเพล็กซ์",k:"td"},{id:"nl_heelhook",name:"ฮีลฮุก",k:"sub"}],
  spl:[{code:"suplex",def:"ซูเพล็กซ์",td:1}] /* v1.91.67 (Man): her signature throw is the suplex — code-animated from her own frames until a drawn suplex sheet arrives (the double-leg sheet nl_varya_special stays in the files) */,tip:"ทุ่มแรงและล็อกขาเก่ง · ถ้าดึงลงพื้นได้จะทุบไม่หยุด"},
 meili:{name:"เหม่ยลี่ แซ่ตั้ง",nick:"มังกรเยาวราช",art:"กังฟู",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"เตะไร้เงา",k:"atk",w:"kick"},{id:"nl_inch",name:"หมัดหนึ่งนิ้ว",k:"atk",w:"punch"},{id:"nl_crane",name:"ท่ากระเรียน",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"เตะไร้เงา",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"หมัดหนึ่งนิ้ว",npc:1,p:.5}],tip:"เตะเร็วและไกล · เข้าวงในแล้วเหลือแค่ครึ่งตัว"},
 rosa:{name:"Corazón Rosa",nick:"หัวใจสีชมพู",art:"ลูชาลิเบร",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["เฮอริคานรานา","ดีดีที"],tdSty:["rana","ddt"],subName:["ลามิสติกา"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"เฮอริคานรานา",k:"td"},{id:"nl_mistica",name:"ลามิสติกา",k:"sub"},{id:"nl_moonsault",name:"มูนซอลต์",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"เฮอริคานรานา",td:1}],tip:"อึดและทนมาก ชอบทุ่มโชว์คนดู · การ์ดเปิดบ่อย"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"ลดา",nick:"เครื่องจักรสังหารแห่งมวยหญิง",art:"MMA + มวยไทยสมัยใหม่",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["ดับเบิลเลก","จับขาล้ม"],tdSty:["leg","leg"],subName:["รัดคอจากด้านหลัง","กิโยติน"],pfx:{dmg:{elbow:.1},gnp:.15},
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
/* v1.91.78 (Man): the Naka team and the regional champions talk in their own voice after a bout, not the generic NPC lines */
if(typeof POST_BUBBLE!=="undefined")Object.assign(POST_BUBBLE,{
 nl_nia:{win:["กลองยังไม่ทันจบเพลงเลย","จังหวะเธอช้ากว่าฉันครึ่งจังหวะ {foe}","ไปฝึกฟังจังหวะมาใหม่นะ"],lose:["…กลองฉันหลุดจังหวะ ครั้งเดียวก็พอให้แพ้","เธออ่านจังหวะฉันออก… ไม่เลว","ครั้งหน้าฉันเปลี่ยนเพลง"]},
 nl_varya:{win:["บนพื้น ไม่มีมวยไทยหรอก","ตบพื้นเร็วกว่าที่คิดนะ {foe}","หมีไม่ปล่อยของที่จับได้แล้ว"],lose:["…เธอไม่ยอมลงพื้น ฉลาด","ขาเธอแข็งกว่าที่ข้อมูลบอก","ครั้งหน้าฉันจะจับให้ได้ตั้งแต่ยกแรก"]},
 nl_meili:{win:["เห็นขาฉันไหม… ไม่เห็นสินะ","หนึ่งนิ้วก็พอแล้ว","กลับไปเยาวราชกินข้าวกันไหม ฉันเลี้ยง"],lose:["…ความเร็วอย่างเดียวไม่พอสินะ","อาจารย์ฉันคงบ่นยาว","เธอรับขาฉันได้ ใจถึงดี"]},
 nl_rosa:{win:["¡Olé! ล้มได้สวยที่สุดในโกดังนี้เลย","หัวใจสีชมพูไม่เคยหยุดเต้น!","อย่าเศร้าสิ ปรบมือให้ตัวเองหน่อย!"],lose:["¡Ay! …แพ้ก็ต้องโค้งให้สวย","หน้ากากฉันยังอยู่ แต่ใจยอมแล้ว","เธอทำให้คนดูตะโกนแทนฉัน ¡Bravo!"]},
 nl_ladda:{win:["อ่อน","……","ไรฝุ่นกัดยังเจ็บกว่า","…ต่อไป","นี่เหรอ ค่ายที่ทำให้แชมป์สี่ภาคปฏิเสธพ่อ","เสียเวลา","อ่อนกว่าที่ข้อมูลบอก"],lose:["…สนุกดี","ข้อมูล…ไม่ครบ","ครั้งหน้า ฉันจะไม่พลาดตรงนี้"]},
 baibua:{win:["ขอบคุณที่ไม่ถอยนะ {foe}","ศอกท่าเสายังคมอยู่","ครั้งหน้ามาอีกนะเจ้า"],lose:["…หนูต้องกลับไปซ้อมใหม่","เธอเก่งขึ้นจริง ๆ","ไม่เป็นไร พ่อคงเข้าใจ"]},
 tabtim:{win:["คักแท้! ยังไม่ถึงเวลาของเธอ","แพ้แล้วอย่าร้องนะ ทับทิมก็เคยแพ้","ไปกินส้มตำกันไหม ทับทิมเลี้ยง"],lose:["โอ๊ย! เจ็บแต่สนุก","แพ้แล้วก็ต้องยอมรับ เธอแรงจริง","รอบหน้าทับทิมเอาคืนแน่"]},
 alicia:{win:["ปิดกล้องได้แล้วค่ะ จบแล้ว","ฉันไม่ได้ชนะเพราะหน้าตานะ","ขอบคุณที่ชกจริงกับฉัน"],lose:["…ปิดกล้องก่อน ขอเวลาห้านาที","เธอไม่สนกล้องเลยสินะ ดีแล้ว","ครั้งหน้าฉันไม่แพ้แล้วค่ะ"]},
 chaba:{win:["…อีกนิดเดียว","ลุกได้ ก็ลุก","ซ้อมอีก"],lose:["…เจ็บ ดี","เธอไม่หยุด เหมือนคลื่น","…ครั้งหน้า"]}});
function nlFighter(G,k,me,p,ceil,leg){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,tdSty:D.tdSty||null,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
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
 {n:"npc",who:"คุณเกริก",t:(R.cups||[]).length>=2?"ได้ถ้วยสองใบในศึกเดียว ค่ายเล็กแบบนี้ผมไม่เห็นมานานแล้วครับ":"ค่ายเล็ก ๆ จากเชียงใหม่ ชกถึงระดับภาคได้ ผมไม่เห็นมานานแล้วครับ"},
 {n:"npc",who:"คุณเกริก",t:"ผมเองก็เคยชกครับ ทีมชาติ ปีนั้นตั๋วโอลิมปิกอยู่ในมือแล้ว"},
 {n:"npc",who:"คุณเกริก",t:"สามสัปดาห์ก่อนเดินทาง รถตู้ของทีมเสียหลักกลางถนน เข่าผมแตกสามชิ้น หมอบอกว่าเดินได้ก็บุญแล้ว"},
 {n:"npc",who:"คุณเกริก",t:"คืนนั้นผมเสียมากกว่าเข่าครับ… แต่เรื่องนั้นไม่ใช่เรื่องที่จะเล่าบนโต๊ะอาหาร"},
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
const RG_CLOSE_SAY={baibua:"ค่ายมวยยืนด้วยลำแข้งตัวเองได้เจ้า หนูเห็นมากับตา ค่ายศิริชัยไงเจ้า",tabtim:"ค่ายศิริชัยบ่มีเงินมาก แต่ชกให้กันจนสุดใจ ทับทิมเห็นมาแล้วเด้อ",
 alicia:"ฉันอยากชกแบบค่ายศิริชัยค่ะ ที่ที่ไม่มีใครขอให้ฉันยิ้มให้กล้อง",chaba:"…อยากอยู่ค่ายที่ซ่อมรั้วกันเอง"};
/* after the fourth cup (or once the tournament has run its course): Naka League, the refusals, Ladda */
function rgClose(G){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),kati=rgIn(G,"kati");
 const fav=["baibua","tabtim","alicia","chaba"].sort((a,b)=>((R.meet||{})[b]||0)-((R.meet||{})[a]||0))[0];
 const four=["baibua","tabtim","alicia","chaba"].map(id=>({id,l:"fight",f:"happy"})),tense=["baibua","tabtim","alicia","chaba"].map((id,i)=>({id,l:"fight",f:"angry"})); /* v1.91.90 (Man): the scheme is out in the open — they refuse with their heads up, not in tears */
 /* v1.91.74 (Man): a real closing ceremony first (many guests, ceremony talk), Krerk as the host who backs the provincial and regional rings —
    no signing on stage; the four champions walk over afterwards to say no, and Krerk hands it to Ladda. Tense, no smiling faces; the beatings are text only. */
 return [
 {n:"nar",bg:"closing_ceremony",show:[],t:"พิธีปิดศึกชิงเจ้าสี่ภาค ห้องโถงใหญ่กลางกรุงเทพฯ แขกเต็มทุกโต๊ะ ทั้งผู้แทนการกีฬาจังหวัด นายสนามจากสี่ภาค ครูมวยรุ่นเก่า และค่ายที่เข้าร่วมทั้งหมด"},
 {n:"npc",who:"พิธีกร",t:"ขอเสียงปรบมือให้แชมป์ทั้งสี่ภาคค่ะ! ภาคเหนือ ใบบัว · ภาคอีสาน ทับทิม · ภาคกลาง อลิเซีย · ภาคใต้ ชบา"},
 {n:"nar",show:four,t:"ทั้งสี่คนขึ้นเวทีรับโล่เกียรติยศพร้อมกัน แสงแฟลชสว่างทั้งห้อง ครูมวยรุ่นเก่าลุกขึ้นปรบมือให้ทีละโต๊ะ"},
 {n:"npc",who:"ผู้แทนการกีฬา",t:"มวยจังหวัดและมวยภาคคือรากของมวยไทยครับ ขอบคุณค่ายเล็กค่ายใหญ่ทุกค่าย และขอบคุณเจ้าภาพที่สนับสนุนเวทีภูมิภาคมาตลอดสามปี"},
 {n:"npc",who:"คุณเกริก",t:"ผมเป็นแค่คนจ่ายค่าไฟให้เวทีครับ ส่วนคนที่ทำให้ศึกนี้มีความหมาย คือนักมวยกับครูมวยทุกคนในห้องนี้"},
 {n:"npc",who:"คุณเกริก",t:"เวทีจังหวัดและเวทีภาคจะยังอยู่ นาคาจะสนับสนุนต่อทุกปีครับ ผมสัญญา"},
 {n:"npc",who:"คุณเกริก",t:"แต่ผมมีความฝันของผมเองด้วย… นาคาลีก ลีกที่รวมนักสู้ที่แข็งแกร่งที่สุด ทุกศาสตร์ ไว้บนเวทีเดียว"},
 {n:"npc",who:"คุณเกริก",t:"ผมเชิญแชมป์ทั้งสี่คนไว้แล้ว ไม่ต้องตอบบนเวทีนะครับ คืนนี้เป็นคืนของพวกเธอ"},
 {n:"nar",show:[],t:"งานเลี้ยงดำเนินต่อไป จนห้องเริ่มบางตา"},
 {n:"nar",show:tense,t:"แล้วแชมป์ทั้งสี่ก็เดินมาหยุดตรงหน้าโต๊ะของคุณเกริกพร้อมกัน ห้องที่ยังเหลือคนอยู่เงียบลงทีละโต๊ะ"},
 {n:"baibua",f:"angry",l:"fight",t:"ขอบคุณที่ดูแลเวทีภาคมาตลอดเจ้า แต่หนูไม่เข้าลีก ค่ายบัวท่าเสายังมีหนูอยู่ และหนูไม่ขายมัน"},
 {n:"tabtim",f:"happy",l:"fight",t:"ทับทิมก็ไม่เข้า! น้องชายอ่านสัญญาข้อสิบสี่ให้ฟังแล้ว ไม่หลอกกันง่าย ๆ หรอกเด้อ"},
 {n:"alicia",f:"angry",l:"fight",t:"ฉันจะไม่เซ็นอะไรที่มีคำว่า \"ตลอดไป\" ค่ะ ไม่ว่าจะเป็นของใคร"},
 {n:"chaba",f:"angry",l:"fight",t:"…ไม่เข้า"},
 {n:fav,f:"angry",l:"fight",t:RG_CLOSE_SAY[fav]},
 {n:"nar",show:[{id:"npc:krerk"}],t:"คุณเกริกฟังจนจบโดยไม่ขัด แล้ววางแก้วลงบนโต๊ะเบา ๆ"},
 {n:"npc",who:"คุณเกริก",t:"ผมเคารพการตัดสินใจครับ แต่ลีกของผมต้องแข็งที่สุด และคนจะเชื่อแบบนั้นได้ ก็ต้องเห็นกับตา"},
 {n:"npc",who:"คุณเกริก",t:"ลดา"},
 {n:"nar",show:[{id:"lada",l:"casual",f:"angry"}],t:"ผู้หญิงใส่ฮู้ดขาวลุกจากโต๊ะมุมห้อง ฮู้ดคลุมครึ่งหน้า ปอยผมขาวปลายแดงโผล่ข้างแก้ม เธอไม่มองพ่อ ไม่มองใคร"},
 {n:"npc",who:"คุณเกริก",t:"จัดการ"},
 {n:"lada",f:"angry",l:"casual",t:"…ขึ้นมา พร้อมกันทั้งสี่คนเลยก็ได้"},
 fah?{n:"fah",f:"surprised",l:"fight",t:"เดี๋ยวสิ! นี่มันงานเลี้ยงนะ!"}:{n:"coach",t:"เดี๋ยวก่อน! นี่มันงานเลี้ยง"},
 rin?{n:"rin",f:"surprised",l:"fight",t:"ผู้จัดการคะ อย่าให้พวกเธอขึ้น… ไม่มีกรรมการ ไม่มีหมอ"}:{n:"coach",t:"อย่าขึ้นไป! ไม่มีกรรมการ ไม่มีหมอ"},
 {n:"nar",show:[],t:"สายไปแล้ว แชมป์สี่คนมองหน้ากัน ไม่มีใครยอมรุมคนคนเดียว ใบบัวถอดรองเท้า ลอดเชือกขึ้นไปก่อนใคร",cut:"ladda"},
 {n:"nar",show:[],t:"เวทีเงียบกริบ แชมป์สี่ภาคนอนอยู่คนละมุม ใบบัวไอจนตัวงอ ทับทิมกุมเข่า อลิเซียหายใจไม่ทัน ชบาพยายามลุกเป็นครั้งที่สาม แล้วทรุดลงอีก"},
 {n:"nar",show:[],t:"เลือดซึมจากมุมปากลดาตรงที่ศอกใบบัวเฉียด เธอแตะมันด้วยปลายนิ้ว มองนิ่ง ๆ เหมือนกำลังจดตัวเลข",
  choice:[{t:"วิ่งขึ้นเวทีไปพยุงแชมป์ลงมา",fx:G2=>{for(const c of ["baibua","tabtim","alicia","chaba"])rgMeet(G2,c,2);},then:[
    {n:"nar",show:[],t:"คุณลอดเชือกขึ้นไปพยุงใบบัว พาดแขนเธอไว้บนบ่า สาว ๆ ในค่ายตามขึ้นมาช่วยพยุงอีกสามคนลงจากเวที"},
    {n:"baibua",f:"sad",l:"fight",t:"…หนูยังลุกไหว… ยังไหว"}]},
   {t:"ก้าวขึ้นไปยืนขวางหน้าลดา",fx:G2=>{rgMeet(G2,"chaba",3);for(const c of ["baibua","tabtim","alicia"])rgMeet(G2,c,1);R.closeFace=1;},then:[
    {n:"nar",show:[{id:"lada",l:"casual",f:"angry"}],t:"คุณก้าวขึ้นไปยืนระหว่างลดากับชบา ลดาหันมามอง ตาสีแดงนิ่งสนิท"},
    {n:"lada",f:"angry",l:"casual",t:"…คุณไม่ใช่นักมวย"},
    {n:"lada",f:"angry",l:"casual",t:"แต่ไม่ถอยเหมือนกัน… ชื่ออะไร"},
    {n:"chaba",f:"sad",l:"fight",t:"…ไม่ต้อง ฉันลุกเองได้"}]},
   ...(fah?[{t:"คว้าแขนฟ้าไว้ ไม่ให้ขึ้นเวที",fx:G2=>{add(G2,"fah","trust",3);for(const c of ["baibua","tabtim","alicia","chaba"])rgMeet(G2,c,1);},then:[
    {n:"fah",f:"angry",l:"fight",t:"ปล่อยฟ้า! ฟ้าจะขึ้นไปต่อยมันให้—"},
    {n:"nar",show:[],t:"คุณไม่ปล่อย ฟ้าดึงสุดแรงอยู่สามที แล้วหยุด มือที่กำแน่นค่อย ๆ คลายลง"},
    {n:"fah",f:"sad",l:"fight",t:"…ไม่ใช่วันนี้ใช่ไหม ฟ้ารู้ ฟ้ารู้แล้ว"}]}]:[])]},
 {n:"npc",who:"คุณเกริก",t:"ผมไม่ได้ดูถูกเวทีภาคครับ ผมจ่ายให้มันทุกบาท ผมรักมัน… แต่คืนนี้ทุกคนเห็นแล้ว ว่าที่สุดของการต่อสู้หน้าตาเป็นยังไง"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"ทั้งห้องหันมามองคุณ",choice:[
   {t:"\"นี่ไม่ใช่การแข่ง นี่คือการทำร้ายคนที่ไม่ได้เตรียมตัว\"",then:[{n:"npc",who:"คุณเกริก",t:"โลกจริงไม่เคยรอให้ใครเตรียมตัวครับ ผมเรียนเรื่องนี้จากรถตู้คันนั้น"}]},
   {t:"\"อยากรู้ว่าใครแข็งที่สุด ก็ส่งนักมวยของคุณมาเจอค่ายผม\"",fx:G2=>{R.closeDare=1;},then:[{n:"npc",who:"คุณเกริก",t:"…ผมก็หวังไว้แบบนั้นเหมือนกันครับ ผู้จัดการ"}]},
   {t:"(ไม่ตอบ หันหลังพาแชมป์ลงจากเวที)",then:[{n:"nar",show:[],t:"คุณหันหลังให้คุณเกริก ทั้งห้องยังเงียบ มีแต่เสียงฝีเท้าของคนจากค่ายศิริชัยลงบันได"}]}]},
 rin?{n:"rin",f:"angry",l:"fight",t:"ถ้าพวกเธอเซ็นไป ข้อ 14.3 ทุกท่าที่เคยชกจะเป็นของนาคา… ลดาไม่ต้องเดาเลยสักหมัด"}:{n:"coach",t:"ถ้าพวกเธอเซ็นไป ทุกท่าที่เคยชกจะเป็นของนาคา ลดาจะไม่ต้องเดาเลยสักหมัด"},
 {n:"alicia",f:"sad",l:"fight",t:rin?"ถ้าไม่ได้รินกับค่ายคุณช่วยอ่านสัญญา… ป่านนี้ฉันคงยืนอยู่ข้างเขาแล้ว":"ถ้าไม่ได้ค่ายคุณ… ป่านนี้ฉันคงยืนอยู่ข้างเขาแล้ว"},
 {n:"nar",show:[{id:"lada",l:"casual",f:"sad"}],t:"ลดาดึงฮู้ดคลุมหัว เดินตามหลังพ่อไปโดยไม่หยุด แต่พูดเบา ๆ ตอนเดินสวนคุณ"},
 {n:"lada",f:"sad",l:"casual",t:"…พวกเธอไม่เซ็นเพราะค่ายคุณ ฉันอยากรู้ว่าค่ายคุณมีอะไร"},
 fah?{n:"fah",f:"surprised",l:"fight",t:"นั่นมัน… มวยสมัยใหม่ เหมือนฟ้าเลย แต่ไม่มีอะไรเหลือข้างในเลยสักนิด"}:{n:"coach",t:"นั่นไม่ใช่มวยไทยอย่างเดียว… นั่นมันทุกอย่างรวมกัน"},
 {n:"pailin",f:"sad",t:"ผู้จัดการคะ… ดิฉันรู้จักคุณเกริกมายี่สิบปี ขอเล่าอะไรหน่อยได้ไหมคะ"},
 {n:"pailin",f:"sad",t:"คืนที่รถตู้ทีมชาติคว่ำ ภรรยาคุณเกริกนั่งไปด้วย เธอไม่ได้กลับบ้าน เขาเสียเข่า เสียโอลิมปิก และเสียเธอ ในคืนเดียว"},
 {n:"pailin",f:"sad",t:"ลดาตอนนั้นสี่ขวบ ตั้งแต่วันนั้นทุกอย่างที่นาคามี หมอ โค้ช ห้องแล็บ ข้อมูล ถูกเทลงที่เด็กคนเดียว"},
 {n:"pailin",f:"sad",t:"เขาไม่ได้เลี้ยงลูกค่ะ เขาสร้างคำตอบให้โชคที่พรากทุกอย่างไป… และลดาไม่เคยได้เลือกเลยสักครั้ง"},
 kati?{n:"kati",f:"sad",l:"fight",t:"…ปู่ชัยสอนหนูชกเพราะหนูอยากชก ไม่ใช่เพราะปู่อยากชนะใคร"}:{n:"coach",t:"…ครูมวยที่ดีไม่ได้สร้างนักมวยไว้ใช้แก้แค้นใคร"},
 {n:"nar",bg:"camp",show:[],t:"สามวันต่อมา ซองสีดำขอบแดงมาถึงค่าย ไม่มีตราประทับ มีแค่ลายเซ็นเดียวที่ทุกคนจำได้ · เกริก นาคา"},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"flustered",l:"fight",t:"ผู้จัดการคะ สัญญาพันธมิตรที่เรารับเงินมา ข้อ 30 เขียนว่า \"หากนาคาลีกแพ้ให้แก่ค่ายคู่สัญญา ให้สัญญานี้สิ้นสุดทันที\""}:{n:"coach",t:"สัญญาพันธมิตรที่เรารับเงินมา ข้อ 30 เขียนว่าถ้านาคาลีกแพ้ค่ายเรา สัญญาจบทันที…"},
   {n:"coach",t:"เขามั่นใจขนาดนั้นเชียว ถึงกล้าเขียนข้อนี้ไว้"}]),
 {n:"coach",t:"ทุ่มได้ ล็อกได้… พวกเราไม่เคยซ้อมเรื่องพวกนี้เลยสักวัน"},
 {n:"coach",t:"มีเวลาสามสัปดาห์ ซ้อมรับมือไว้ให้ครบทุกแบบ ถึงคืนนั้นค่อยเลือกทีละนัดว่าจะรับมือยังไง การ์ดอยู่ในกล่องจดหมายแล้ว"}];}
/* v1.91.75 (Man): the original champions have phones — personal words go to her chat; a new champion of a later edition still writes letters */
/* v1.91.78 (Man): the very first personal message is a handwritten letter (with her number on it) — after that she texts */
const RG_PHONE={baibua:"ป.ล. หนูเขียนเบอร์ไว้ท้ายซองเจ้า ต่อไปหนูจะทักแชตไปแทนนะ",tabtim:"ป.ล. เบอร์ทับทิมอยู่หลังซองเด้อ ต่อไปทักแชตเอา ประหยัดค่าแสตมป์!",alicia:"ป.ล. เบอร์ส่วนตัวอยู่ด้านหลังค่ะ ไม่ใช่เบอร์ผู้จัดการ อย่าให้ใคร",chaba:"ป.ล. เบอร์ หลังซอง"};
function rgSay(G,r,title,body){const R=G.region,cid=RG_CID0[r];if(G.F[cid]&&!(R.nc&&R.nc[r])&&typeof chatNote==="function"){R.wrote=R.wrote||{};
  if(!R.wrote[cid]&&!(G.chatLastAbs||{})[cid]){R.wrote[cid]=1;addMail(G,{kind:"letter",tone:"region",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title,body:body+"\n\n"+(RG_PHONE[cid]||"")});G.F[cid].met=true;return;}
  R.wrote[cid]=1;chatNote(G,cid,body);return;}
  addMail(G,{kind:"letter",tone:"region",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title,body});}
const RG_VISITMSG={baibua:"ก่อนนัดหน้า หนูขอแวะไปค่ายศิริชัยหน่อยได้ไหมเจ้า เอาข้าวต้มมัดไปฝากด้วย",tabtim:"นัดหน้ายังบ่ทันมาฮอด ทับทิมขอแวะไปเบิ่งค่ายก่อนเด้อ!",alicia:"ก่อนนัดสอง ฉันจะแวะไปที่ค่ายนะคะ ไม่ใช่ไปถ่ายคอนเทนต์ แค่ผ่านทางเฉย ๆ",chaba:"…จะแวะไปค่าย ก่อนนัดสอง"};
function rgOrg(G,r,title,body){addMail(G,{kind:"letter",tone:"region",from:"ฝ่ายจัดการแข่งขัน ศึกชิงเจ้าสี่ภาค",title,body});}
const RG_FPREP={sprawl:{n:"กันทุ่ม",d:"ถีบขาหนีตอนโดนพุ่งจับ และกดคอตีเข่าสวนได้บ่อยขึ้น"},escape:{n:"หนีล็อก",d:"ดันตัวลุกจากพื้นและหลุดจากล็อกได้ดีขึ้น"},strike:{n:"ยืนแลก",d:"ไม่สนการทุ่ม ซ้อมออกอาวุธให้แม่นขึ้น จบก่อนโดนดึงลงพื้น"}};
/* v1.91.57 (Man): the Naka League talk a little before and after their bouts — an introduction the first night, a jab after; Ladda barely speaks */
const NL_SAY={
 nia:{first:"ไนอา โอคาฟอร์ มวยสากล สิบสองไฟต์อาชีพ ไม่เคยแพ้คนที่เตะไม่ถึงหน้า… มาลองดูว่าเธอเตะถึงไหม",again:"กลับมาอีกแล้วเหรอ ฉันนับจังหวะเธอได้ตั้งแต่ครั้งก่อน หนึ่ง สอง… ล้ม",
   win:"จังหวะของเธอช้ากว่ากลองของฉันครึ่งจังหวะ",lose:"…หมัดฉันไม่ได้ช้า ขาเธอยาวเกินไปต่างหาก"},
 varya:{first:"วาร์ยา แซมโบ้ ฉันไม่ได้มาชกกับเธอหรอก ฉันจะจับเธอลงพื้นแล้วนั่งทับ",again:"เบาะยังจำหลังเธอได้นะ มานอนอีกรอบสิ",
   win:"บนพื้นไม่มีมวยไทยหรอก มีแต่ฉัน",lose:"…ศอกนั่นเจ็บ ครั้งหน้าฉันจะจับแขนเธอก่อน"},
 meili:{first:"เหม่ยลี่ ศิษย์มังกรเยาวราช ขาฉันเร็วกว่าตาเธอ ลองกะพริบตาดูสิ",again:"อ้าว มาอีกแล้ว อาม่าบอกว่าคนดื้อแบบนี้มักจะได้ดี… แต่ไม่ใช่วันนี้",
   win:"เห็นขาฉันไหม ไม่เห็นใช่ไหมล่ะ",lose:"…ใครสอนให้เข้ามาใกล้ขนาดนั้น ไม่ยุติธรรมเลย"},
 rosa:{first:"¡Hola, cariño! Corazón Rosa มาแล้ว! คืนนี้เธอจะได้บินครั้งแรกในชีวิต",again:"¡Otra vez! คนดูรักเธอนะ เพราะเธอล้มได้สวยมาก",
   win:"¡Olé! ล้มได้สวยที่สุดในโกดังนี้เลย",lose:"…ว้าว เธอทำให้หน้ากากฉันเบี้ยว ไม่เคยมีใครทำได้นะ"},
 ladda:{first:"…เข้ามา",again:"ครั้งที่แล้วเธอหายใจผิดจังหวะตอนยกสาม… ฉันจำได้",win:null,lose:null}};
function rgFinalIntro(G){const R=G.region,F=R.final;return [
 {n:"nar",bg:"naka_underground",t:F.tries?"โกดังเดิมริมท่าเรือคลองเตย ไฟสลัวเหมือนครั้งก่อน คนดูกลุ่มเดิมยังยืนเงียบอยู่ในเงามืด":"โกดังเก่าริมท่าเรือคลองเตย ไฟสลัว กลิ่นน้ำหวานบูดลอยมาจากถังเก่า กลางห้องมีเวทีเชือกสีดำ พื้นปูเบาะนุ่มแบบเวที MMA"},
 {n:"npc",who:"คุณเกริก",t:F.tries?"กลับมาอีกแล้วนะครับ ผมชอบความดื้อแบบนี้":"ยินดีต้อนรับครับ ไม่มีกล้อง ไม่มีสื่อ ไม่มีเงินรางวัล มีแค่คำถามข้อเดียว"},
 {n:"npc",who:"คุณเกริก",t:"ห้านัด ชนะสามเอาไป ลูกสาวผมชกนัดสุดท้าย"},
 {n:"nar",t:"ลดายืนพิงเสาอยู่ในเงามืด ฮู้ดคลุมครึ่งหน้า ไม่พูดอะไรสักคำ"},
 {n:"coach",t:"แต่ละนัดเลือกวิธีรับมือให้ตรงกับคู่ ทุ่มก็กัน ล็อกก็หนี จะยืนแลกก็ต้องจบให้ไว"}];}
function rgFinalBetween(G,i,me,o,res,w,l){return [
 {n:"nar",t:`${res==="W"?`${me.name}ชนะ${o.name}`:res==="D"?`${me.name}เสมอกับ${o.name}`:`${o.name}ชนะ${me.name}`} · ศิริชัย ${w} – ${l} นาคาลีก`}];}
function rgFinalWin(G,w,l,beatLadda,ladFid){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),looked=ladFid==="fah"&&fah?"ฟ้า":"ผู้จัดการ";return [
 {n:"nar",bg:"naka_underground",t:`จบห้านัด ศิริชัย ${w} – ${l} นาคาลีก`},
 {n:"nar",show:[{id:"npc:krerk"}],t:"คุณเกริกปรบมือช้า ๆ อยู่บนระเบียงชั้นสอง เสียงปรบมือก้องไปทั้งโกดัง"},
 {n:"npc",who:"คุณเกริก",t:"ยินดีด้วยครับ ค่ายศิริชัย… วันนี้โชคเข้าข้างคุณ"},
 {n:"npc",who:"คุณเกริก",t:"แล้วพบกันบนเวทีนานาชาตินะครับ"},
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
/* v1.91.114 (Man): the first time the camp reaches each belt province, that region's champion comes to meet them — a longer scene before the hotel,
   one piece of her story per province so the belts pull you on. Going out with her at the hotel has its own night per province (then her usual nights),
   and the camp girl who sulks about it takes turns. */
const RG_RBG={north:"rg_north",isan:"rg_northeast",central:"rg_central",south:"rg_south"};
const rgLine=id=>(f,t,x)=>Object.assign({n:id,f,l:"casual",t},x||{});
const rgProvWon=(G,dest)=>{const D=ROAD_DEST[dest],R=G.region;return !!(D&&R&&(R.belts[D.r]||{})[dest]);};
const rgProvN=(G,r)=>{const M=(G.region&&G.region.provMet)||{};return RG[r].prov.filter(p=>M[p]).length;};
/* her tip about tonight's local champion: only while the belt is still up for grabs */
function rgProvTip(G,dest,steps,who){if(rgProvWon(G,dest))return [];const me=G.F[(G.region.trip||{}).fid];
  return [...steps,{fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},{n:"nar",t:me?`${me.name}จดคำแนะนำไว้ในมือถือ · กำลังใจ +3`:"ทุกคนจดคำแนะนำไว้ในมือถือ"}];}
/* the camp girl who sulks takes turns: everyone on the trip who is close to you (bond 40+), round and round */
function rgJealGirl(G){const R=G.region,TP=R&&R.trip&&R.trip.party,L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40&&(!TP||TP.includes(f.id))).sort((a,b)=>(b.bond||0)-(a.bond||0));
  return L.length?L[((R&&R.jealN)||0)%L.length]:null;}
const RG_JEALP={
  near:{kati:["ครูคะ… {c}ยืนใกล้ไปหรือเปล่า หนูแค่สังเกตเฉย ๆ ค่ะ","พี่{c}ใจดีจังเลยนะคะ… กับครูคนเดียว"],
   mali:["มะลิก็อยากได้กอดบ้างนะ~ …ล้อเล่นค่ะ (ไม่ได้ล้อเล่น)","{c}น่ารักจังเลย~ มะลิไม่ได้หึงนะ แค่ยิ้มไม่ออกนิดนึง~"],
   rin:["ระยะห่างระหว่างผู้จัดการกับ{c}เมื่อกี้ ต่ำกว่าค่าเฉลี่ยค่ะ ข้อมูลเฉย ๆ","{c}… รินเพิ่มชื่อนี้ลงสมุดแล้วค่ะ หัวข้อ \"ตัวแปรที่ควบคุมไม่ได้\""],
   ploy:["ยิ้มอะไรนักหนา …เปล่า ไม่ได้ว่าอะไร","…พี่ไปรอที่รถนะ ไม่ได้งอน แค่ร้อน"],
   fah:["เฮ้! {c}! ผู้จัดการเป็นของค่ายศิริชัยนะ! …หมายถึงผู้จัดการค่ายน่ะ!","ทำหน้ายิ้มแบบนั้นทำไม! …ฟ้าไม่ได้มองหรอกนะ!"]},
  date:{kati:["ครูไปเดินกับ{c}มาเหรอคะ… เปล่าค่ะ หนูไม่ได้ถาม","หนูไม่ได้งอนนะคะ… หนูแค่จะไปนอนก่อน แล้วก็ไม่ได้เปิดไฟรอด้วย"],
   mali:["มะลิเห็นนะ~ ไปกับ{c}มาใช่ไหม… มะลิก็อยากไปบ้าง","มะลิเก็บขนมไว้ให้ผู้จัดการ… แต่กินไปครึ่งนึงแล้ว เพราะรอนานเกิน~"],
   rin:["ไปกับ{c}สองชั่วโมงสิบสองนาที รินไม่ได้จับเวลานะ แค่บังเอิญดูนาฬิกา","รินไม่ได้นั่งรอที่ล็อบบี้นะคะ รินมาอ่านหนังสือพิมพ์… ฉบับเมื่อวาน"],
   ploy:["ไปกับ{c}มาเหรอ ก็ดีนี่ …ทำไมต้องถามด้วย","พี่ไม่ได้รอนะ ไฟห้องพี่เปิดอยู่เพราะอ่านหนังสือ …เล่มเดิม หน้าเดิม ทั้งคืน"],
   fah:["อ๋อ ไปกับ{c}มาล่ะสิ! ฟ้าไม่ได้งอนนะ! แค่…หิว!","ฟ้าไม่สนหรอกนะ! …แต่นายถือของให้{c}ด้วยใช่ไหม ฟ้าเห็นนะ!"]}};
/* kind: "near" when she is standing next to the champion, "date" after a night out with her */
function rgJealStep(G,champ,mood,kind){const g=rgJealGirl(G);if(!g)return [];const R=G.region,P=(RG_JEALP[kind||"date"]||RG_JEALP.date)[g.id]||["…"],k=Math.floor((R.jealN||0)/2)%P.length;
  return [{n:g.id,f:"pout",l:"casual",t:P[k].replace(/\{c\}/g,champ)},{fx:G2=>{const R2=G2.region;R2.jealN=(R2.jealN||0)+1;if(mood){const f=G2.F[g.id];if(f)f.morale=Math.max(0,(f.morale||0)-mood);}}}];}
const RG_PROV={};
const RG_DATE={};
const RG_DATEP={};
/* ---------- North: Baibua carries her father's ring notebook — one page a province ---------- */
{const B=rgLine("baibua");
 const book=(G,r)=>{const n=rgProvN(G,r);return n>=4?[B("happy","ครบสี่หน้าแล้วเจ้า… เหลือหน้าสุดท้ายที่พ่อเขียนหัวไว้แต่บ่เคยได้แปะตั๋ว \"เชียงใหม่\" หน้านั้นหนูจะรอผู้จัดการที่เวทีบ้านหนูนะเจ้า"),{n:"nar",t:"สมุดเวทีของพ่อใบบัว ครบ 4/4 หน้า"}]
   :[{n:"nar",t:`สมุดเวทีของพ่อใบบัว ${n}/4 หน้า · หน้าที่เหลือ ใบบัวจะเปิดให้ดูเมื่อไปถึงจังหวัดนั้น`}];};
 RG_PROV.chiangrai=(G,D)=>{const opp=REGION.oppName(G,"chiangrai"),kati=rgInT(G,"kati");return {
  meet:[{n:"nar",bg:"hill",t:"รถของค่ายเลี้ยวเข้าเชียงราย ฟ้าใสจนเห็นดอยไกลสุดตา ที่ลานจอดรถหน้าวัดร่องขุ่น มีคนยืนโบกผ้าเช็ดหน้าสีชมพูอยู่คนเดียว"},
   B("happy","มาฮอดเชียงรายแล้วเจ้า! หนูมารอตั้งแต่เจ็ดโมง… บ่ได้รอนานหรอกเจ้า แค่สามชั่วโมงเอง"),
   ...rgProvTip(G,"chiangrai",[B("happy",`${opp}เป็นลูกศิษย์วัดแถวนี้เจ้า ท่าไม้ตายชื่อศอกวัดร่องขุ่น ขาวสะอาดเหมือนวัด แต่คมเหมือนกระจก`),B("happy","ยกแรกเขาจะรอให้เราเข้าไปก่อน อย่าเพิ่งใจร้อนนะเจ้า")],"ใบบัว")],
  body:[{n:"nar",bg:"temple",t:"ใบบัวพาทุกคนเดินข้ามสะพานสีขาวเข้าไปในวัด แดดสะท้อนกระจกเงาวับไปทั้งโบสถ์ เธอหยุดตรงม้านั่งใต้ต้นไม้ แล้วหยิบสมุดปกผ้าเก่า ๆ ออกจากตะกร้า"},
   B("happy","สมุดเวทีของพ่อเจ้า สมัยหนุ่ม ๆ พ่อตระเวนชกทั่วภาคเหนือ ไปจังหวัดไหนก็แปะตั๋วมวยไว้หน้าหนึ่ง"),
   B("happy","หน้าเชียงรายนี่ พ่อชนะน็อกยกสามเจ้า ใต้ตั๋วพ่อเขียนไว้ว่า \"ฟ้าเชียงรายใสที่สุด\""),
   B("flustered","หนูอยากเดินตามสมุดเล่มนี้มานานแล้ว แต่ไม่มีใครมาด้วย… ปีนี้ค่ายศิริชัยมาพอดีเจ้า",{choice:[
    {t:"\"งั้นทริปนี้ก็เดินตามสมุดของพ่อไปด้วยกัน\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…ด้วยกัน… เจ้า หนูจะพกสมุดมาทุกจังหวัดเลยเจ้า")]},
    {t:"ขอดูหน้าอื่นด้วยได้ไหม",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","หน้าอื่นต้องรอไปถึงจังหวัดนั้นก่อนเจ้า หนูจะเปิดให้ดูทีละหน้า ห้ามแอบดูนะ")]},
    {t:"\"พ่อคงดีใจที่เธอเก็บไว้ดีขนาดนี้\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("sad","พ่อลืมไปแล้วว่าเคยมีสมุดเล่มนี้เจ้า หนูเจอในกล่องใต้ถุนบ้าน…"),B("happy","แต่หนูจำแทนพ่อได้เจ้า")]}]}),
   ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"พี่ใบบัวคะ ในสมุดมีหน้าอุตรดิตถ์ไหมคะ"},B("happy","มีเจ้า เป็นหน้าที่หนาที่สุดเลย ไว้ไปถึงแล้วจะเล่าให้ฟังนะกะทิ")]),
   ...rgJealStep(G,"ใบบัว",0,"near"),
   B("happy","สมุดเล่มนี้มีสี่หน้าเจ้า เชียงราย น่าน อุตรดิตถ์ ลำปาง… มีหน้าเดียวที่พ่อบ่ได้แปะตั๋วชนะ ผู้จัดการทายดูนะเจ้าว่าหน้าไหน"),
   ...book(G,"north")]};};
 RG_PROV.nan=(G,D)=>{const opp=REGION.oppName(G,"nan");return {
  meet:[{n:"nar",bg:"river",t:"ถนนคดเคี้ยวลงจากดอยเข้าเมืองน่าน ริมแม่น้ำมีเรือแข่งลำยาวจอดเรียงกัน ใบบัวนั่งห้อยขาอยู่บนหัวเรือลำหนึ่ง"},
   B("happy","ผู้จัดการ! ทางนี้เจ้า! ระวังลื่นนะเจ้า ท่าน้ำมีตะไคร่"),
   ...rgProvTip(G,"nan",[B("happy",`${opp}เป็นฝีพายเรือแข่งมาตั้งแต่เด็กเจ้า ขาแข็งเหมือนไม้พาย ท่าไม้ตายคือเข่าเรือแข่งน่าน`),B("happy","อย่าให้เขาจับคอได้นะเจ้า โดนล็อกแล้วเข่าขึ้นมาทีไรเจ็บยาว")],"ใบบัว")],
  body:[{n:"nar",bg:"temple",t:"ใบบัวพาทุกคนไปวัดภูมินทร์ บนผนังวิหารมีภาพผู้ชายกำลังกระซิบข้างหูผู้หญิง นักท่องเที่ยวมุงถ่ายรูปกันแน่น"},
   B("happy","ภาพนี้ชื่อปู่ม่านย่าม่านเจ้า คนเรียกกันว่าภาพกระซิบรัก… เขากระซิบอะไรกันก็บ่มีใครรู้"),
   B("flustered","คนชอบมายืนถ่ายท่าเดียวกับในภาพ… หนู… หนูบ่ได้จะชวนถ่ายนะเจ้า แค่เล่าเฉย ๆ",{choice:[
    {t:"ชวนถ่ายรูปท่าเดียวกับในภาพ",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"ใบบัวยืนนิ่งเหมือนรูปปั้นอยู่สามวินาที แล้วพยักหน้าเร็ว ๆ"},B("flustered","…กระซิบว่าอะไรก็ได้เจ้า แต่อย่าให้หนูได้ยินนะ เดี๋ยวหนูหน้าแดงในรูป"),{n:"nar",t:"รูปออกมาเบลอ เพราะใบบัวหันหนีตอนกดชัตเตอร์พอดี แต่เธอขอเก็บรูปเบลอนั้นไว้"}]},
    {t:"\"ถ้ากระซิบได้หนึ่งประโยค เธอจะกระซิบว่าอะไร\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…\"อย่าเพิ่งกลับเชียงใหม่\" เจ้า… เอ๊ะ บ้านหนูก็อยู่เชียงใหม่นี่นา! ลืมไปเลยเจ้า!")]},
    {t:"ชมฝีมือช่างวาด",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","ช่างวาดเป็นคนไทลื้อเจ้า ลายผ้าซิ่นในภาพเหมือนผ้าของยายหนูเลย")]}]}),
   ...rgJealStep(G,"ใบบัว",0,"near"),
   {n:"nar",t:"ก่อนออกจากวัด ใบบัวเปิดสมุดเวทีของพ่อ หน้าน่านมีตั๋วใบเดียว ไม่มีคำว่าชนะ มีแต่ลายมือพ่อเขียนว่า \"ไว้มาใหม่\""},
   B("sad","พ่อแพ้ที่นี่เจ้า แล้วก็บ่เคยได้กลับมาอีกเลย เข่าเจ็บก่อน"),
   B("happy","ถ้าค่ายศิริชัยได้เข็มขัดน่าน… หนูขอเขียนต่อใต้คำของพ่อว่า \"มาใหม่แล้ว\" ได้ไหมเจ้า"),
   ...book(G,"north")]};};
 RG_PROV.uttaradit=(G,D)=>{const opp=REGION.oppName(G,"uttaradit"),kati=rgInT(G,"kati");return {
  meet:[{n:"nar",bg:"rg_north",t:"หน้าศาลากลางอุตรดิตถ์ อนุสาวรีย์พระยาพิชัยดาบหักยืนถือดาบสองมือ ดาบข้างหนึ่งหักครึ่ง ใบบัวพนมมือไหว้อยู่ที่ฐาน"},
   B("happy","มาฮอดอุตรดิตถ์แล้วเจ้า บ้านเกิดของมวยท่าเสา… หนูตื่นเต้นจนนอนบ่หลับเลย"),
   ...rgProvTip(G,"uttaradit",[B("happy",`${opp}ใช้ศอกดาบหักพระยาพิชัยเจ้า ศอกซ้ายหลอก ศอกขวาจริง`),B("happy","เห็นศอกซ้ายมาให้ถอยครึ่งก้าวพอนะเจ้า ถอยเต็มก้าวเขาจะตามเข้ามา")],"ใบบัว")],
  body:[B("happy","ผู้จัดการรู้ไหมเจ้า ท่านสู้จนดาบหักไปข้างหนึ่ง ก็ยังไม่ถอย"),
   B("sad","นักเลงของรีสอร์ทจินหลงมาขว้างหินใส่ป้ายสปาอีกแล้วเมื่อวานเจ้า… บางวันหนูก็รู้สึกเหมือนดาบหักไปข้างแล้ว",{choice:[
    {t:"\"ดาบหักก็ยังเหลืออีกข้าง แล้วเธอก็ยังมีคนยืนข้าง ๆ\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…คนยืนข้าง ๆ… เจ้า หนูจะจำคำนี้ไว้นะเจ้า")]},
    {t:"ถามเรื่องรีสอร์ทจินหลง",fx:G2=>rgMeet(G2,"baibua",2),then:[B("sad","เขาอยากได้ที่ดินริมน้ำของบ้านหนูไปขยายรีสอร์ทเจ้า พอเราบ่ขาย ก็ส่งคนมาป่วนทุกอาทิตย์… ค่ายเราสู้กลับทุกครั้ง แต่หนูเหนื่อยเจ้า"),B("happy","แต่เล่าให้ผู้จัดการฟังแล้ว ใจเบาขึ้นครึ่งหนึ่งเลยเจ้า")]},
    {t:"ชวนไปกินลางสาดก่อน หัวจะได้โล่ง",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","ลางสาดลับแลหวานที่สุดในโลกเจ้า! หนูรู้ร้านอร่อย ไปเจ้า ๆ")]}]}),
   {n:"nar",t:"ใบบัวเปิดสมุดเวทีของพ่อ หน้าอุตรดิตถ์หนาที่สุดจริง ๆ ระหว่างตั๋วมวยมีใบโพธิ์แห้งแปะไว้ใบหนึ่ง"},
   B("happy","ใบโพธิ์นี้พ่อเก็บมาจากหน้าศาลครูท่าเสาเจ้า พ่อว่าชกที่ไหนก็ได้ แต่ต้องมาไหว้ครูที่นี่ก่อน"),
   ...rgIf(kati,[{n:"kati",f:"surprised",l:"casual",with:"baibua",t:"ศาลครูท่าเสา… อยู่ในเมืองนี้เหรอคะ"},B("happy","อยู่เจ้า มาด้วยกันนะกะทิ ว่างเมื่อไหร่หนูพาไป")]),
   ...rgJealStep(G,"ใบบัว",0,"near"),
   ...book(G,"north")]};};
 RG_PROV.lampang=(G,D)=>{const opp=REGION.oppName(G,"lampang");return {
  meet:[{n:"nar",bg:"river",t:"เมืองลำปางยามเช้า รถม้าสีสดวิ่งเหยาะ ๆ อยู่ริมถนน คันหนึ่งจอดรอหน้าโรงแรม คนที่นั่งข้างคนขับโบกมือแรงจนหมวกแทบปลิว"},
   B("happy","ขึ้นรถม้าเจ้า! หนูจองไว้สองคัน …ผู้จัดการนั่งคันหน้ากับหนูนะเจ้า เพราะคันหลัง… เต็มแล้ว"),
   ...rgProvTip(G,"lampang",[B("happy",`${opp}ใช้ถีบม้าเหล็กลำปางเจ้า ถีบหนักเหมือนม้าดีด`),B("happy","แต่ถีบเสร็จจะเสียหลักครึ่งจังหวะ สวนตอนนั้นเลยเจ้า")],"ใบบัว")],
  body:[{n:"nar",t:"รถม้าวิ่งผ่านบ้านไม้เก่าริมแม่น้ำวัง ม้าสะบัดหัวทีหนึ่ง ใบบัวสะดุ้งคว้าแขนเสื้อผู้จัดการไว้แน่น"},
   B("flustered","หนู… หนูกลัวม้านิดหน่อยเจ้า ตอนเด็กโดนม้ากินหมวก",{choice:[
    {t:"\"จับไว้ก็ได้ ไม่ต้องปล่อย\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…เจ้า"),{n:"nar",t:"ใบบัวจับแขนเสื้อไว้จนรถม้าจอด แล้วยังลืมปล่อยไปอีกนาทีหนึ่ง"}]},
    {t:"\"ม้าตัวนี้ใจดีนะ ดูสิ\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","…เอ๊ะ มันหันมามองหนูจริงด้วยเจ้า ตาโตแท้")]},
    {t:"\"แชมป์ภาคเหนือกลัวม้าเหรอ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("pout","…ห้ามบอกใครนะเจ้า โดยเฉพาะทับทิม")]}]}),
   {n:"nar",bg:"market",t:"รถม้าแวะร้านถ้วยชามตราไก่ ใบบัวเลือกชามอยู่นานจนคนขับรถม้าหลับคาเบาะ"},
   B("happy","ชามข้าวของพ่อแตกเมื่อเดือนก่อนเจ้า พ่อใช้มายี่สิบปี หนูจะซื้อใบใหม่ไปให้"),
   {n:"nar",t:"ใบบัวเปิดสมุดเวทีของพ่อ หน้าลำปางมีตั๋วชนะกับลายมือว่า \"ชนะ แต่ขาเจ็บ ม้าเหล็กถีบแรง\""},
   B("sad","เป็นตั๋วใบสุดท้ายก่อนพ่อเลิกชกเจ้า… หลังจากนั้นพ่อก็อยู่แต่ในค่าย สอนหนูคนเดียว"),
   ...rgJealStep(G,"ใบบัว",0,"near"),
   ...book(G,"north")]};};
 /* her night out, the first time in each province */
 RG_DATE.chiangrai=G=>[{n:"nar",bg:"night_north",t:"สองทุ่มตรง หอนาฬิกากลางเมืองเชียงรายเปิดไฟเปลี่ยนสีพร้อมเสียงเพลง ใบบัวจูงแขนเสื้อผู้จัดการวิ่งไปให้ทันพอดี"},
   B("happy","ทันพอดีเจ้า! หอนาฬิกานี้คนสร้างคนเดียวกับวัดร่องขุ่นเลยนะ ไฟเปลี่ยนสีทุกชั่วโมงเจ้า"),
   B("flustered","สองปีก่อนหนูมาดูคนเดียวตอนมาชกที่นี่… คนรอบ ๆ มากันเป็นคู่ ๆ หมดเลยเจ้า",{choice:[
    {t:"\"ปีนี้ไม่ได้มาคนเดียวแล้วนะ\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…เจ้า ปีนี้บ่ได้มาคนเดียวแล้ว"),{n:"nar",t:"ไฟเปลี่ยนจากสีทองเป็นสีชมพู ใบบัวมองไฟ ไม่ยอมหันมามองหน้าเลยจนเพลงจบ"}]},
    {t:"ชวนรอดูรอบสามทุ่มอีกรอบ",fx:G2=>rgMeet(G2,"baibua",3),then:[B("happy","ได้เจ้า! …ระหว่างรอ ไปกินขนมจีนน้ำเงี้ยวกันก่อนนะ หนูหิวแล้ว")]},
    {t:"ถ่ายรูปไฟไว้ให้พ่อเธอดู",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","ดีเจ้า พ่อชอบของสวย ๆ …แต่พ่อต้องถามแน่ว่าใครถ่าย")]}]})];
 RG_DATE.nan=G=>[{n:"nar",bg:"night_north",t:"ตลาดคืนข่วงเมืองน่าน คนนั่งกินข้าวบนเสื่อหน้าวัดภูมินทร์ ใบบัวปูเสื่อผืนเล็กรอไว้แล้ว ขนาดพอดีสองคน"},
   B("happy","หนูซื้อข้าวแคบกับไส้อั่วมาแล้วเจ้า เสื่อผืนนี้… ร้านเหลือแค่ผืนเล็กเจ้า บ่ได้ตั้งใจนะ"),
   {n:"nar",t:"วงดนตรีพื้นเมืองเล่นสะล้อซอซึง เด็ก ๆ ฟ้อนอยู่หน้าวิหาร ภาพกระซิบรักบนผนังเปิดไฟสลัว ๆ",choice:[
    {t:"กระซิบข้างหูว่า \"ขอบคุณที่พามานะ\"",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"ข้าวแคบหลุดจากมือใบบัว"},B("flustered","…ผู้จัดการ! ใต้ภาพนั้นเลยนะเจ้า! คนเห็นกันหมดแล้ว…")]},
    {t:"ถามเรื่องยายของเธอ",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","ยายสอนหนูทอผ้าเจ้า แต่หนูทอเบี้ยวทุกผืน ยายเลยบอกว่าไปชกมวยดีกว่า")]},
    {t:"นั่งฟังดนตรีเงียบ ๆ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"nar",t:"เพลงจบไปสามเพลง พอถึงเพลงที่สี่ ใบบัวเอนหัวพิงไหล่ผู้จัดการ แล้วทำเป็นหลับ"}]}]}];
 RG_DATE.uttaradit=G=>[{n:"nar",bg:"night_north",t:"ร้านข้าวต้มริมแม่น้ำน่าน ใบบัวสั่งข้าวต้มปลาสองถ้วย แล้วเลื่อนตะกร้าลางสาดมาไว้กลางโต๊ะ"},
   B("sad","หนูซ้อมพูดกับพ่อมาสามวันแล้วเจ้า ว่าหนูจะดูแลค่ายเอง บ่ต้องห่วง… แต่พอเจอหน้าพ่อ หนูพูดบ่ออกทุกที"),
   B("flustered","ผู้จัดการลองเป็นพ่อหนูได้ไหมเจ้า… ให้หนูซ้อมพูดรอบเดียว",{choice:[
    {t:"ทำเสียงทุ้ม \"ว่ามาลูก\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("happy","ฮ่า ๆ พ่อบ่ได้เสียงทุ้มขนาดนั้นเจ้า!"),B("happy","…พ่อเจ้า หนูจะดูแลค่ายบัวท่าเสาเอง พ่อพักเข่าเถอะ… พูดได้แล้วเจ้า! พูดได้ครบเลย!")]},
    {t:"\"ซ้อมกับฉันก็ได้ แต่วันจริงฉันจะไปยืนข้าง ๆ ด้วย\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…สัญญานะเจ้า ถ้ามีคนยืนข้าง ๆ หนูพูดได้แน่")]},
    {t:"\"กินลางสาดก่อน ท้องอิ่มแล้วค่อยกล้า\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","เจ้า… หนูกินไปสิบลูกแล้วยังบ่กล้าเลยเจ้า")]}]})];
 RG_DATE.lampang=G=>[{n:"nar",bg:"night_north",t:"ถนนคนเดินกาดกองต้าริมแม่น้ำวัง ตึกไม้เก่าเปิดไฟสีเหลือง ใบบัวถือถุงชามตราไก่ไว้แน่นเหมือนกลัวมันแตก"},
   B("flustered","ผู้จัดการช่วยถือให้หน่อยได้ไหมเจ้า… บ่ใช่ว่าหนัก หนูแค่อยากมีมือว่างไว้… ไว้ซื้อขนมเจ้า!",{choice:[
    {t:"ถือถุงให้ แล้วยื่นมืออีกข้างให้",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"ใบบัวมองมือที่ยื่นมานานจนคนเดินชนไหล่ แล้วค่อย ๆ จับปลายนิ้วไว้สองนิ้ว"},B("flustered","…สองนิ้วก่อนนะเจ้า")]},
    {t:"ถือถุงให้แล้วไปซื้อขนมด้วยกัน",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","ข้าวแต๋นน้ำแตงโมเจ้า! ของดีลำปาง หนูซื้อสองถุง ถุงหนึ่งของผู้จัดการ")]},
    {t:"\"ระวังชามแตกนะ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("pout","…เจ้า หนูถือเองก็ได้")]}]})];
 /* her usual nights after that, in turn */
 RG_DATEP.baibua=[
  G=>[{n:"nar",bg:"night_north",t:"ถนนคนเดินคืนนี้คนเยอะ ใบบัวเดินช้า ๆ ให้ผู้จัดการเดินทัน"},B("flustered","ถ้าหลงกัน… จับแขนเสื้อหนูไว้ก็ได้นะเจ้า"),{n:"nar",t:"มือเกือบชนกันหลายครั้ง แต่ไม่มีใครพูดอะไร"}],
  G=>[{n:"nar",bg:"night_north",t:"งานวัดใกล้โรงแรมมีซุ้มปาลูกโป่ง ใบบัวปาโดนลูกเดียวจากสิบลูก ได้ตุ๊กตาช้างตัวเล็กมา"},B("flustered","เอาไปเจ้า… ช้างตัวนี้หน้าเหมือนผู้จัดการ ตอนง่วง ๆ")],
  G=>[{n:"nar",bg:"night_north",t:"บนดาดฟ้าโรงแรม ลมหนาวพัดแรง ดาวเต็มฟ้า ใบบัวแกะผ้าพันคอลายตีนจกออกมาพันให้ผู้จัดการ"},B("happy","หนูขี้หนาวน้อยกว่าเจ้า… อยู่เหนือมาทั้งชีวิตแล้ว"),{n:"nar",t:"ห้านาทีต่อมา ใบบัวจามสองที แต่ไม่ยอมขอผ้าพันคอคืน"}]];
}

/* ---------- Isan: Tabtim's somtam card — one stamp a province, the prize waits in Korat ---------- */
{const T=rgLine("tabtim");
 const card=(G)=>{const n=rgProvN(G,"isan");return n>=4?[T("happy","ครบสี่ช่องแล้วเด้อ! รางวัลคือ… ส้มตำครกที่ห้า ทับทิมตำเองที่บ้านโคราช ตอนพี่มาชิงถ้วยที่พิมาย"),T("happy","ถ้าแพ้ ทับทิมกะตำให้คือเก่าเด้อ แต่ใส่พริกสามสิบเม็ด ฮ่า ๆ"),{n:"nar",t:"บัตรสะสมส้มตำของทับทิม ครบ 4/4 ช่อง"}]
   :[{n:"nar",t:`บัตรสะสมส้มตำของทับทิม ${n}/4 ช่อง · ช่องที่เหลือรออยู่ที่จังหวัดอื่น`}];};
 RG_PROV.udon=(G,D)=>{const opp=REGION.oppName(G,"udon"),ploy=rgInT(G,"ploy");return {
  meet:[{n:"nar",bg:"boat",t:"ตีห้าครึ่ง ทับทิมนัดทุกคนที่ท่าเรือหนองหาน เรือลำเล็กสามลำจอดรอ ทับทิมยืนบนหัวเรือ สวมหมวกปีกกว้าง โบกไม้พายสองมือ"},
   T("happy","ซำบายดีบ่พี่ผู้จัดการ! ขึ้นเรือเร็ว ๆ เด้อ ทะเลบัวแดงบานแค่ตอนเช้า สายแล้วหุบหมดเลย"),
   ...rgProvTip(G,"udon",[T("happy",`${opp}ใช้เตะบัวแดงบานเด้อ เตะสูงสวยเหมือนดอกบัวบาน แต่บานช้า`),T("happy","เขาง้างเข่าสูงก่อนเตะทุกที เห็นเข่ายกเมื่อไหร่ ก้าวเข้าไปตัดหน้าเลยเด้อ")],"ทับทิม")],
  body:[{n:"nar",t:"เรือแล่นออกไปกลางหนอง ดอกบัวแดงบานเต็มผิวน้ำสุดสายตา หมอกบาง ๆ ลอยอยู่เหนือน้ำ ทุกคนเงียบไปพร้อมกัน"},
   T("happy","งามบ่ล่ะ! ทับทิมมาที่นี่ทุกปีกับแม่เด้อ"),
   {n:"nar",t:"ทับทิมควักบัตรกระดาษแข็งออกจากกระเป๋าคาดเอว หัวบัตรเขียนด้วยปากกาเมจิกว่า \"บัตรสะสมส้มตำสี่จังหวัด ทับทิมรับรอง\" มีช่องว่างสี่ช่อง"},
   T("happy","เข็มขัดมีสี่เส้น ส้มตำกะมีสี่ร้าน! ไปจังหวัดไหน ทับทิมพาไปร้านเด็ดของจังหวัดนั้น กินครบสี่ช่องแล้ว… มีรางวัลเด้อ",{choice:[
    {t:"ถามว่ารางวัลคืออะไร",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("flustered","บอกบ่ได้! …ไว้ครบสี่ช่องก่อนเด้อ ห้ามถามอีก")]},
    {t:"ถามว่าช่องแรกเป็นร้านไหน",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","ตำซั่วร้านป้าหนูริมหนองเด้อ ใส่ขนมจีนพูนจาน")]},
    {t:"\"ฉันกินเผ็ดไม่ค่อยได้นะ\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","บ่เป็นหยัง! ทับทิมสั่งเผ็ดน้อยให้ …ห้าเม็ด เผ็ดน้อยของทับทิมคือห้าเม็ดเด้อ ฮ่า ๆ")]}]}),
   {n:"nar",bg:"somtam_stall",t:"สายวันนั้นที่ร้านป้าหนูริมหนองหาน ทับทิมปั๊มตรายางรูปครกลงช่องแรก แล้วเขียนตัวเล็ก ๆ ว่า \"แซบ สี่พริกครึ่ง\""},
   T("sad","เมื่อก่อนพ่อกะพามาตกปลาที่นี่เด้อ… ก่อนทับทิมเลิกต่อยหมัดแล้วหันมาเตะ"),
   T("happy","อ้าว! ทำหน้าจั่งซั่นเฮ็ดหยัง กินส้มตำต่อเด้อ ช่องแรกต้องกินให้หมดจาน!"),
   ...rgIf(ploy,[{n:"ploy",with:"tabtim",f:"happy",l:"casual",t:"ทับทิม… ลูกหลานหมัดหนักโคราช ทำไมถึงหันมาเตะ"},T("happy","ขาทับทิมยาวกว่าแขนเด้อพี่พลอย ฮ่า ๆ …ไว้ทับทิมเล่าให้ฟังทีหลังเด้อ")]),
   ...rgJealStep(G,"ทับทิม",0,"near"),
   ...card(G)]};};
 RG_PROV.khonkaen=(G,D)=>{const opp=REGION.oppName(G,"khonkaen");return {
  meet:[{n:"nar",bg:"rg_northeast",t:"หน้าเมืองขอนแก่นมีไดโนเสาร์ตัวยักษ์ยืนอยู่ ทับทิมยืนใต้ไดโนเสาร์ ชูป้ายกระดาษ \"ยินดีต้อนรับค่ายศิริชัยสู่บ้านไดโนเสาร์\""},
   T("happy","พี่ผู้จัดการ! ขอนแก่นมีไดโนเสาร์แท้ ๆ เด้อ เขาขุดเจอกระดูกที่ภูเวียง ทับทิมสิเตะให้แรงเท่าหางไดโนเสาร์เลย!"),
   ...rgProvTip(G,"khonkaen",[T("happy",`${opp}ใช้เข่าทอไหมขอนแก่นเด้อ เข่าถี่ ๆ เหมือนกี่ทอผ้า ทอไปเรื่อย ๆ จนเราหมดแรง`),T("happy","อย่ายืนในวงในนาน ออกมาเตะระยะไกลใส่เขาเลย ข้างนอกเขาบ่เก่งเด้อ")],"ทับทิม")],
  body:[{n:"nar",bg:"food",t:"ทับทิมพาไปร้านไก่ย่างเขาสวนกวาง ไก่ย่างหนังกรอบวางเต็มโต๊ะ ส้มตำปูปลาร้ามาเป็นถาด"},
   T("happy","ช่องที่สองของบัตรเด้อ! ตำปูปลาร้าร้านนี้ ทับทิมให้ห้าพริกเต็ม!"),
   {n:"nar",t:"ระหว่างกิน มือถือของทับทิมสั่นไม่หยุด เป็นข้อความจากกลุ่มไลน์ครอบครัว"},
   T("happy","น้องส่งรูปผ้าไหมมาเด้อ แม่ทอผืนใหม่ สิเอาไปขายหาค่าเทอมน้องคนเล็ก"),
   T("happy","ทับทิมเป็นพี่สาวคนโตของน้อง ๆ เงินรางวัลชกมวยทุกบาทไปเป็นค่าเทอมหมดเลยเด้อ ฮ่า ๆ ทับทิมเลยมีแจ็กเก็ตตัวเดียวนี่ล่ะ",{choice:[
    {t:"\"เป็นพี่สาวที่เก่งมากเลยนะ\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("flustered","…อย่ามาชมกันจั่งซี้สิเด้อ ทับทิมบ่มีมุกต่อแล้ว")]},
    {t:"ขอซื้อผ้าไหมของแม่สักผืน",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"ทับทิมเงียบไปนานที่สุดตั้งแต่เจอกันมา"},T("flustered","…บ่ต้องสงสารเด้อพี่ผู้จัดการ แต่ถ้าอยากได้แท้ ๆ แม่ทองามแท้ ทับทิมสิส่งไปให้")]},
    {t:"\"แล้วทับทิมได้อะไรเป็นของตัวเองบ้าง\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("sad","…"),T("happy","ได้ชกมวยไงเด้อ! ได้ชกทุกวันกะพอใจแล้ว")]}]}),
   ...rgJealStep(G,"ทับทิม",0,"near"),
   ...card(G)]};};
 RG_PROV.buriram=(G,D)=>{const opp=REGION.oppName(G,"buriram");return {
  meet:[{n:"nar",bg:"rg_northeast",t:"ปราสาทหินพนมรุ้งตั้งอยู่บนยอดภูเขาไฟเก่า แสงบ่ายลอดประตูหินเรียงกันเป็นแถว ทับทิมนั่งรออยู่บนบันไดนาค"},
   T("happy","มาฮอดบุรีรัมย์แล้วเด้อ! เมืองปราสาท เมืองฟุตบอล… แล้วกะเมืองสายฟ้า"),
   ...rgProvTip(G,"buriram",[T("happy",`${opp}ใช้หมัดสายฟ้าพนมรุ้งเด้อ หมัดเร็วแรงเหมือนฟ้าผ่า แต่ฟ้าบ่ผ่าซ้ำที่เดิม`),T("happy","ปล่อยหมัดแรกแล้วเขาสิรอนับหนึ่งสองก่อนหมัดต่อไป ช่วงนั้นแหละ เตะเข้าไปเลยเด้อ")],"ทับทิม")],
  body:[T("happy","รู้บ่ ปีละสี่เทื่อ แสงตะวันสิลอดประตูทั้งสิบห้าบานพอดีเป๊ะ คนโบราณคำนวณเก่งแท้"),
   T("happy","ทับทิมกะคือกัน บนเวทีคำนวณทุกก้าว นอกเวทีบ่คำนวณหยังเลย ฮ่า ๆ"),
   T("sad","พ่อทับทิมเคยเป็นแชมป์หมัดหนักโคราชเด้อ… ตอนทับทิมสิบสอง ทับทิมเลือกเตะแทนหมัด เพราะขายาว"),
   T("sad","พ่อบ่ว่าหยัง แต่พ่อกะบ่เคยมาเบิ่งทับทิมชกจักเทื่อ",{choice:[
    {t:"\"สักวันพ่อต้องมาดู\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","…ถ้าวันนั้นมาฮอด ทับทิมสิเตะให้งามที่สุดในชีวิตเลยเด้อ")]},
    {t:"\"เตะของทับทิมก็มาจากโคราชเหมือนกันนะ\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("surprised","…!"),T("flustered","พี่ผู้จัดการเว้าจั่งซี้ ทับทิมสิฮ้องไห้ใส่บันไดนาคแล้วเด้อ")]},
    {t:"\"หัวเราะไว้ก่อนเถอะ\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","ฮ่า ๆ ถนัดอยู่แล้ว!")]}]}),
   {n:"nar",bg:"somtam_stall",t:"ร้านส้มตำข้างสนามฟุตบอล ทับทิมปั๊มช่องที่สาม แล้วเขียนว่า \"ตำไทยใส่ปู แซบสามพริก บรรยากาศเต็มสิบ\""},
   ...rgJealStep(G,"ทับทิม",0,"near"),
   ...card(G)]};};
 RG_PROV.ubon=(G,D)=>{const opp=REGION.oppName(G,"ubon");return {
  meet:[{n:"nar",bg:"mekong",t:"ที่โขงเจียม แม่น้ำโขงสีขุ่นกับแม่น้ำมูลสีครามไหลมาบรรจบกันเป็นสองสี ทับทิมยืนรอบนแพริมน้ำ"},
   T("happy","อุบลแล้วเด้อ! จังหวัดนี้ทับทิมรอมานานสุด"),
   ...rgProvTip(G,"ubon",[T("happy",`${opp}ใช้ศอกเทียนพรรษาเด้อ ศอกสลักลายงามเหมือนเทียนแห่ แต่ช้า`),T("happy","ถ้าเขาเดินหน้ามาเรื่อย ๆ อย่าแลกศอก ถอยแล้วเตะขาให้เขาเดินบ่ไหวเด้อ")],"ทับทิม")],
  body:[T("happy","แม่น้ำสองสีนี่เด้อ ไหลมาฮอดกันแล้วกะบ่ปนกันง่าย ๆ ไหลคู่กันไปเป็นกิโล"),
   T("flustered","ทับทิมว่ามันคือคนสองคน… คนหนึ่งเสียงดัง อีกคนเงียบ ๆ แต่ไปทางเดียวกัน… อุ๊ย ทับทิมเว้าหยังไปเนี่ย ลืมไปเด้อ ๆ",{choice:[
    {t:"\"คนเสียงดังคือทับทิม แล้วคนเงียบ ๆ ล่ะ\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…บ่บอก! ถามจั่งซี้โกงแท้!")]},
    {t:"\"พูดอีกทีได้ไหม ฟังไม่ทัน\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("pout","บ่เว้าแล้ว! …เว้าได้ปีละเทื่อเด้อ")]},
    {t:"ชวนถ่ายรูปกับแม่น้ำ",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","ได้! ยืนตรงเส้นแบ่งสีเด้อ คนละฝั่ง… ฮ่า ๆ")]}]}),
   {n:"nar",bg:"somtam_stall",t:"ร้านส้มตำริมแม่น้ำมูลตอนเย็น ทับทิมกินไปครึ่งจานแล้วหยิบบัตรขึ้นมาปั๊ม"},
   ...rgJealStep(G,"ทับทิม",0,"near"),
   ...card(G)]};};
 RG_DATE.udon=G=>[{n:"nar",bg:"night_isan",t:"คืนนั้นมีหมอลำซิ่งเปิดวงหลังตลาด ทับทิมจูงมือผู้จัดการแหวกคนไปยืนหน้าเวที"},
   T("happy","วงนี้ม่วนที่สุดในอุดรเด้อ! ฟ้อนเป็นบ่พี่? บ่เป็นกะบ่เป็นหยัง ทับทิมสอน",{choice:[
    {t:"ฟ้อนตามทับทิม",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"ผู้จัดการฟ้อนผิดจังหวะทุกท่า ทับทิมหัวเราะจนนั่งลงกับพื้น แต่ยังจับมือไว้ไม่ปล่อย"},T("happy","พี่ฟ้อนคือหุ่นยนต์เด้อ! …ทับทิมมักอยู่")]},
    {t:"ยืนถือน้ำรอข้างเวที",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","พี่ผู้จัดการเป็นผู้จัดการแม้แต่หน้าเวทีหมอลำ ฮ่า ๆ ยื่นน้ำมาเด้อ คอแห้งแล้ว")]},
    {t:"ขอเพลงให้ทับทิม",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"หมอลำประกาศกลางเวที \"เพลงนี้มีคนขอให้น้องผมแดงหน้าเวทีเด้อ\" ทับทิมหน้าแดงกว่าผมตัวเอง"}]}]})];
 RG_DATE.khonkaen=G=>[{n:"nar",bg:"night_isan",t:"รอบบึงแก่นนครตอนค่ำ คนออกมาวิ่งกันเต็มทาง ทับทิมชี้ไปที่ทางวิ่ง"},
   T("happy","ท้าวิ่งรอบบึง! ใครแพ้เลี้ยงข้าวเหนียวหมูปิ้งเด้อ!",{choice:[
    {t:"วิ่งสุดแรง",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"ผู้จัดการแพ้ขาดลอย แต่ช่วงสุดท้ายทับทิมวิ่งย้อนกลับมาวิ่งข้าง ๆ"},T("happy","แพ้แล้วเด้อ! …แต่ทับทิมวิ่งกลับมาหาเองนะ บ่นับว่าชนะ ฮ่า ๆ")]},
    {t:"ชวนเดินช้า ๆ คุยกันแทน",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("happy","ได้ ๆ เดินกะได้ …แท้ ๆ ทับทิมกะเมื่อยขาเด้อ แต่บ่อยากบอก")]},
    {t:"ยอมแพ้ตั้งแต่ยังไม่วิ่ง",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("pout","ขี้โกง! …ซื้อหมูปิ้งให้ทับทิมสิบไม้เลยเด้อ")]}]})];
 RG_DATE.buriram=G=>[{n:"nar",bg:"night_isan",t:"ทับทิมพาไปนั่งบนอัฒจันทร์ว่างของสนามฟุตบอลเล็ก ๆ ไฟสนามยังเปิดอยู่ครึ่งหนึ่ง"},
   T("happy","ทับทิมมักที่โล่ง ๆ เด้อ ตะโกนได้ เป็นคนเสียงดังมันกะเหนื่อยคือกัน ต้องหาที่ตะโกนให้หมดก่อนกลับบ้าน"),
   T("happy","พี่ลองตะโกนเบิ่งบ่",{choice:[
    {t:"ตะโกน \"ทับทิมเก่งที่สุด!\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…! ตะโกนชื่อทับทิมเฮ็ดหยังเล่า! คนเฝ้าสนามได้ยินแล้วเด้อ!")]},
    {t:"ตะโกนเชียร์ค่ายศิริชัย",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","ฮ่า ๆ รักค่ายแท้ ทับทิมตะโกนตามเด้อ \"ศิริชัยจงเจริญ… แต่ถ้วยอีสานเป็นของทับทิม!\"")]},
    {t:"\"ฉันฟังทับทิมตะโกนดีกว่า\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"ทับทิมตะโกนจนเสียงแหบ เรื่องค่าเทอมน้อง เรื่องเข่าที่เจ็บ เรื่องพ่อ แล้วหันมายิ้มเหมือนไม่มีอะไรเกิดขึ้น"},T("happy","โล่งแล้วเด้อ! ไปกินลาบกัน")]}]})];
 RG_DATE.ubon=G=>[{n:"nar",bg:"night_isan",t:"ทุ่งศรีเมืองยามค่ำ ต้นเทียนพรรษายักษ์แกะสลักลายละเอียดตั้งอยู่กลางสวน ทับทิมเดินวนดูเป็นรอบที่สาม"},
   T("happy","ช่างแกะเทียนต้นนี้ใช้เวลาหลายเดือนเด้อ แกะพลาดนิดเดียวกะต้องเริ่มใหม่"),
   T("flustered","ทับทิมใจร้อน แกะเทียนบ่เคยได้จักเทื่อ… แต่ถ้าเป็นคนที่ทับทิมอยากให้ ทับทิมว่าทับทิมรอได้หลายเดือนคือกัน",{choice:[
    {t:"\"รอใครอยู่เหรอ\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…ถามซื่อ ๆ จั่งซี้ ทับทิมสิตอบจั่งได๋เล่า!")]},
    {t:"ซื้อเทียนแกะลายเล่มเล็กให้",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"ทับทิมถือเทียนเล่มเล็กไว้สองมือตลอดทางกลับ ไม่ยอมใส่กระเป๋า"}]},
    {t:"\"ใจร้อนก็ดีนะ บนเวทีเตะไว\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","แม่นแล้ว! พี่ผู้จัดการเข้าใจทับทิมที่สุด ฮ่า ๆ")]}]})];
 RG_DATEP.tabtim=[
  G=>[{n:"nar",bg:"night_isan",t:"ร้านส้มตำหน้าโรงแรมยังเปิดอยู่ ทับทิมสั่งมาสามจาน"},T("happy","ร้านนี้แซบหลาย… ฮ่า ๆ ๆ เผ็ดจนน้ำตาไหลแล้วเด้อ"),{n:"nar",t:"ทับทิมหัวเราะเสียงดังทั้งร้าน แต่พอผู้จัดการยื่นทิชชูให้ เธอเงียบไปครู่หนึ่ง"}],
  G=>[{n:"nar",bg:"night_isan",t:"ร้านคาราโอเกะหน้าโรงแรม ทับทิมร้องเพลงลูกทุ่งเสียงดังลั่น แล้วยื่นไมค์ให้ผู้จัดการตอนท่อนหวาน"},T("flustered","ท่อนนี้พี่ร้องเด้อ! …ท่อนที่ว่าคิดฮอดน่ะ ทับทิมร้องบ่ได้ เขิน")],
  G=>[{n:"nar",bg:"night_isan",t:"ตลาดโต้รุ่ง ทับทิมสั่งไข่กระทะสองชุด กินชุดตัวเองหมดแล้วจ้องชุดของผู้จัดการ"},T("happy","ไข่ดาวลูกนั้นมันมองทับทิมอยู่เด้อพี่… มันอยากให้ทับทิมกิน ฮ่า ๆ")]];
}

/* ---------- South: Chaba picks one shell a province for her brother's wind chime ---------- */
{const C=rgLine("chaba");
 const chime=(G)=>{const n=rgProvN(G,"south");return n>=4?[C("happy","…ครบสี่อัน"),C("flustered","จะร้อยเชือกที่ภูเก็ต …ผู้จัดการ มาช่วยร้อย ตอนมาชิงถ้วย"),{n:"nar",t:"กระดิ่งลมเปลือกหอยของชบา ครบ 4/4 อัน"}]
   :[{n:"nar",t:`กระดิ่งลมเปลือกหอยของชบา ${n}/4 อัน · อันต่อไปรออยู่ที่จังหวัดอื่น`}];};
 RG_PROV.chumphon=(G,D)=>{const opp=REGION.oppName(G,"chumphon");return {
  meet:[{n:"nar",bg:"sea",t:"หาดทุ่งวัวแล่นตอนเช้า มอเตอร์ไซค์พ่วงข้างสีซีดจอดอยู่บนทราย ชบานั่งยองอยู่ริมน้ำ ไม่หันมาจนรถของค่ายจอดสนิท"},
   C("happy","…มาถึงแล้ว ชุมพร ประตูภาคใต้"),
   ...rgProvTip(G,"chumphon",[C("happy",`${opp}ใช้เตะนางนวลโฉบ …โฉบจากข้างบน เร็ว`),C("happy","…แต่โฉบแล้วต้องบินขึ้น ตอนบินขึ้น เข้าไป")],"ชบา")],
  body:[{n:"nar",t:"ชบาก้มลงเก็บเปลือกหอยสีส้มอมชมพูขึ้นมาหนึ่งอัน ล้างน้ำทะเล แล้วยกขึ้นส่องกับแดด"},
   C("happy","…ให้พี่ชาย"),
   C("happy","พี่ออกจากบ้านนาน ๆ ม่ายได้ ชบาไปไหน เก็บหอยไปให้ ทำกระดิ่งลม แขวนหน้าต่าง"),
   C("flustered","…สี่จังหวัด สี่อัน ครบแล้วจะร้อยเชือก …ช่วยหาด้วย ได้ตะ",{choice:[
    {t:"ก้มลงช่วยหาอย่างจริงจัง",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"สิบนาทีต่อมา ผู้จัดการยื่นเปลือกหอยรูปหัวใจเบี้ยว ๆ ให้ ชบามองอยู่นาน แล้วเก็บใส่กระเป๋าเสื้อ ไม่ใช่ถุงหอย"},C("flustered","…อันนี้ ม่ายให้พี่ชาย")]},
    {t:"\"พี่ชายต้องชอบแน่\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…อือ พี่ชอบเสียงทะเล")]},
    {t:"\"ทำไมไม่พาพี่ชายมาด้วยล่ะ\"",fx:G2=>rgMeet(G2,"chaba",1),then:[C("sad","…สักวัน ตอนขาพี่ดีขึ้น")]}]}),
   {n:"nar",t:"ก่อนออกจากหาด ชบาแจกกล้วยเล็บมือนางคนละหวีโดยไม่พูดอะไรสักคำ ยกเว้นตอนยื่นให้ผู้จัดการ"},
   C("happy","…หวีนี้ หวานสุด"),
   ...rgJealStep(G,"ชบา",0,"near"),
   ...chime(G)]};};
 RG_PROV.surat=(G,D)=>{const opp=REGION.oppName(G,"surat"),mali=rgInT(G,"mali");return {
  meet:[{n:"nar",bg:"market",t:"ตลาดริมแม่น้ำตาปีตอนสาย ชบายืนอยู่หน้าแผงหอยนางรม มือถือถุงเงาะโรงเรียนสองถุง"},
   C("happy","…สุราษฎร์ ไชยาอยู่ม่ายไกล"),
   ...rgProvTip(G,"surat",[C("happy",`${opp}ใช้ศอกเปลือกหอยดอนสัก …ปิดตัวแน่น เหมือนหอย`),C("happy","…รอให้อ้าเอง ตอนเขาออกศอก ข้างใต้ว่าง")],"ชบา")],
  body:[{n:"nar",t:"ชบาแกะหอยนางรมตัวโตให้ทุกคน มือเร็วจนแม่ค้ายังหันมามอง"},
   C("happy","…พี่ชายสอนแกะ ตอนเด็ก"),
   ...rgIf(mali,[{n:"mali",with:"chaba",f:"happy",l:"casual",t:"พี่ชบาแกะหอยเร็วเหมือนเดิมเลย…"},C("happy","…กินไป")]),
   C("happy","…แกะเป็นตะ",{choice:[
    {t:"ขอให้ชบาแกะให้ตัวหนึ่ง",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"ชบาแกะตัวที่ใหญ่ที่สุดในถาด บีบมะนาว โรยหอมเจียว แล้ววางตรงหน้าผู้จัดการ ทั้งหมดนั้นโดยไม่มองหน้าเลย"}]},
    {t:"ลองแกะเอง",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"มีดลื่น ชบาคว้ามือผู้จัดการไว้ทัน"},C("flustered","…ซุ่มซ่าม ม่ายต้องแกะ ฉานแกะเอง")]},
    {t:"ถามเรื่องพี่ชาย",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…พี่แกะหอยเก่งที่สุดในหมู่บ้าน ตอนนี้ยังเก่ง นั่งแกะได้")]}]}),
   {n:"nar",t:"เปลือกหอยนางรมเปลือกหนึ่ง ด้านในเป็นมุกสีรุ้ง ชบาล้างน้ำแล้วห่อทิชชูเก็บไว้"},
   ...rgJealStep(G,"ชบา",0,"near"),
   ...chime(G)]};};
 RG_PROV.nakhonsi=(G,D)=>{const opp=REGION.oppName(G,"nakhonsi");return {
  meet:[{n:"nar",bg:"temple",t:"หน้าวัดพระมหาธาตุเมืองนครศรีธรรมราช เจดีย์ขาวยอดทองสูงเสียดฟ้า ชบายืนรอใต้ต้นไม้ หน้านิ่งเหมือนทุกครั้ง"},
   C("happy","…เมืองคอน ข้าวแกงหรอย ไปกินก่อน แล้วค่อยแหลง"),
   ...rgProvTip(G,"nakhonsi",[C("happy",`${opp}ใช้หมัดหนังตะลุง …ขยับเยอะ หลอกเยอะ เหมือนเชิดหนัง`),C("happy","…ดูเท้า ม่ายดูมือ เท้าม่ายหลอก")],"ชบา")],
  body:[{n:"nar",bg:"fair",t:"บ่ายนั้น ชบาพาทุกคนไปบ้านหนังตะลุงเก่าแก่ ช่างกำลังตอกลายหนังวัวเป็นรูปตัวตลก"},
   C("happy","…ชบาชอบไอ้เท่ง หน้าตาย ม่ายยิ้ม แต่คนดูหัวเราะ",{choice:[
    {t:"\"เหมือนชบาเลยนะ\"",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…ม่ายเหมือน"),{n:"nar",t:"แต่ตอนออกจากร้าน ชบาซื้อรูปหนังไอ้เท่งตัวเล็กมาหนึ่งตัว แล้วยื่นให้ผู้จัดการ"}]},
    {t:"ขอให้ชบาลองเชิดหนัง",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"ชบาเชิดหนังไอ้เท่ง ทำเสียงใต้ทุ้ม ๆ ว่า \"ผู้จัดการศิริชัย หล่อม่ายเท่าไอ้เท่ง\" ทุกคนหัวเราะลั่น ชบายังหน้าตายเหมือนเดิม"}]},
    {t:"ซื้อรูปหนังไปฝากพี่ชายชบา",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…พี่ชอบไอ้เท่ง จะแขวนคู่กับกระดิ่งลม")]}]}),
   {n:"nar",bg:"sea",t:"ขากลับ ชบาแวะชายหาดนอกเมือง เดินก้มหาอยู่นาน แล้วยกเปลือกหอยลายเสือขึ้นมาอันหนึ่ง"},
   ...rgJealStep(G,"ชบา",0,"near"),
   ...chime(G)]};};
 RG_PROV.songkhla=(G,D)=>{const opp=REGION.oppName(G,"songkhla");return {
  meet:[{n:"nar",bg:"sea",t:"หาดสมิหลาตอนเย็น รูปปั้นนางเงือกทองนั่งหวีผมอยู่บนโขดหิน ชบายืนกอดอกอยู่ข้างรูปปั้น หน้านิ่งไม่ต่างกัน"},
   C("happy","…สงขลา ไกลสุด ขับมาไหว ตะ"),
   ...rgProvTip(G,"songkhla",[C("happy",`${opp}ใช้เตะนางเงือกสมิหลา …เตะแล้วถอย ถอยแล้วเตะ เหมือนคลื่น`),C("happy","…อย่าไล่ ยืนรอ คลื่นต้องกลับมาเอง")],"ชบา")],
  body:[C("happy","…คนชอบมาจับผมนางเงือก ว่าเรียนเก่ง"),
   C("flustered","…ชบาจับตอนจะสอบ ม.หก สอบตก",{choice:[
    {t:"หลุดหัวเราะ",fx:G2=>rgMeet(G2,"chaba",2),then:[C("pout","…ขำ ตะ"),{n:"nar",t:"ชบามองค้อน แต่มุมปากขยับนิดหนึ่ง"}]},
    {t:"\"ลองจับอีกที ขอให้ชนะทุกไฟต์\"",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"ชบาเอื้อมมือไปแตะผมนางเงือก แล้วหันกลับมามอง"},C("flustered","…ขอแล้ว ขอให้ผู้จัดการด้วย")]},
    {t:"\"สอบตก แต่ได้เป็นแชมป์ภาคนะ\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…อือ ดีกว่า")]}]}),
   {n:"nar",t:"ชบาเดินลงไปที่ชายน้ำ เก็บเปลือกหอยเม็ดเล็กสีขาวขึ้นมาอันหนึ่ง แล้วยื่นให้ผู้จัดการถือไว้ก่อน"},
   ...rgJealStep(G,"ชบา",0,"near"),
   ...chime(G)]};};
 RG_DATE.chumphon=G=>[{n:"nar",bg:"night_south",t:"ริมปากน้ำชุมพรยามค่ำ เรือไดหมึกเปิดไฟเขียวเรียงเต็มทะเลเหมือนเมืองลอยน้ำ ชบานั่งห้อยขาอยู่บนสะพานปลา"},
   C("happy","…พี่ชายเคยออกเรือแบบนั้น ชบานั่งรอตรงนี้ นับไฟ"),
   C("flustered","…คืนนี้ นับเป็นเพื่อน ได้ตะ",{choice:[
    {t:"นั่งนับไฟด้วยกัน",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"นับได้หนึ่งร้อยสี่สิบสองลำ ชบาหลับพิงไหล่ไปตั้งแต่เลขสี่สิบ ผู้จัดการนับต่อคนเดียวจนจบ"}]},
    {t:"\"นับผิดแล้ว ตรงนั้นสองลำ\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("pout","…เริ่มใหม่"),{n:"nar",t:"ชบาเริ่มนับใหม่สามรอบ เหมือนตั้งใจนับผิด"}]},
    {t:"ซื้อปลาหมึกย่างมานั่งกิน",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…หรอย")]}]})];
 RG_DATE.surat=G=>[{n:"nar",bg:"night_south",t:"ถนนคนเดินริมแม่น้ำตาปี ชบาเดินผ่านร้านตุ๊กตา หยุดตรงตุ๊กตาแมวน้ำตัวกลมอยู่สามวินาที แล้วเดินต่อเหมือนไม่มีอะไรเกิดขึ้น",choice:[
    {t:"ย้อนกลับไปซื้อให้",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…ม่ายได้อยากได้"),{n:"nar",t:"แต่ชบากอดตุ๊กตาแมวน้ำไว้แน่นจนถึงหน้าโรงแรม"}]},
    {t:"\"ชอบตัวนั้นเหรอ\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("flustered","…ม่าย"),C("flustered","…นิดหนึ่ง")]},
    {t:"ทำเป็นไม่เห็น",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"nar",t:"ชบาหันกลับไปมองร้านตุ๊กตาอีกสองครั้งก่อนถึงโรงแรม"}]}]}];
 RG_DATE.nakhonsi=G=>[{n:"nar",bg:"night_south",t:"ร้านน้ำชายามดึกในเมืองคอน คนนั่งดูบอลเต็มร้าน ชบาสั่งชาร้อนสองแก้วกับโรตีมะตะบะหนึ่งจาน"},
   C("happy","…ร้านน้ำชา คนใต้แหลงทุกเรื่องที่นี่ การเมือง มวย หมา"),
   C("happy","…แหลงเรื่องอะไรดี",{choice:[
    {t:"\"เรื่องชบา\"",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…เรื่องฉาน ม่ายมีอะไร"),{n:"nar",t:"แต่ชบาเล่าเรื่องตัวเองยาวที่สุดตั้งแต่รู้จักกัน ห้าประโยคเต็ม เรื่องแมวที่บ้าน เรื่องพี่ชาย เรื่องทะเล แล้วก็หยุด หน้าแดง"}]},
    {t:"\"เรื่องมวย\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…ได้ แหลงทั้งคืน"),{n:"nar",t:"สองคนวาดแผนชกบนกระดาษทิชชูจนเต็มโต๊ะ"}]},
    {t:"\"ไม่ต้องพูดก็ได้ นั่งเฉย ๆ\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…ชอบแบบนี้")]}]})];
 RG_DATE.songkhla=G=>[{n:"nar",bg:"night_south",t:"ถนนเมืองเก่าสงขลายามค่ำ ตึกจีนเก่าเปิดไฟสีส้ม ชบาหยุดยืนหน้าภาพวาดบนกำแพง เด็กสองคนนั่งซ้อนมอเตอร์ไซค์"},
   C("happy","…เหมือนชบากับพี่ชาย ตอนเด็ก"),
   C("flustered","…ถ่ายรูปให้หน่อย ยืนข้างภาพ",{choice:[
    {t:"ถ่ายให้ แล้วขอถ่ายคู่",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"ในรูปคู่ ชบายืนห่างครึ่งก้าว แต่ตอนกดชัตเตอร์ เธอขยับเข้ามาชิด"}]},
    {t:"ถ่ายให้หลาย ๆ มุม",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…มุมนี้ ดี ส่งให้พี่")]},
    {t:"\"ยิ้มหน่อยสิ\"",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"ชบายิ้มกว้างจนตาหยี เป็นครั้งแรกที่ยิ้มในรูป แล้วรีบขอดูรูปเพื่อลบ แต่ผู้จัดการไม่ให้"}]}]})];
 RG_DATEP.chaba=[
  G=>[{n:"nar",bg:"night_south",t:"ชายหาดหน้าโรงแรม ทะเลกลางคืนเงียบ มีแต่เสียงคลื่น"},C("happy","…ทะเลตอนกลางคืนสวย"),{n:"nar",t:"ชบาไม่พูดอะไรอีก แต่ยืนอยู่ข้าง ๆ จนน้ำขึ้นถึงข้อเท้า"}],
  G=>[{n:"nar",bg:"night_south",t:"ชบาขี่พ่วงข้างพาไปดูพระจันทร์ขึ้นจากทะเลที่แหลมนอกเมือง"},C("happy","…ม่ายต้องพูด ดูอย่างเดียว"),{n:"nar",t:"พระจันทร์ขึ้นพ้นน้ำทั้งดวง ชบาหันมาดูว่าผู้จัดการดูอยู่หรือเปล่า แล้วหันกลับไปเร็ว ๆ"}],
  G=>[{n:"nar",bg:"night_south",t:"ร้านโรตีหน้าโรงแรม ชบาสั่งโรตีกล้วยมาสองจาน แล้ววางไว้ตรงหน้าผู้จัดการทั้งสองจาน"},C("happy","…กินให้หมด ผอม")]];
}
/* ---------- Central: Alicia shoots one vlog episode a province ---------- */
{const A=rgLine("alicia");
 const vlog=(G)=>{const n=rgProvN(G,"central");return n>=4?[A("happy","ครบสี่ตอนแล้วค่ะ! ตอนพิเศษ… ฉันจะถ่ายที่อยุธยา วันที่คุณมาชิงถ้วย"),A("flustered","ตอนนั้นฉันจะปิดกล้องนะคะ เป็นตอนที่ไม่ลงช่อง… มีคนดูคนเดียว"),{n:"nar",t:"วล็อกของอลิเซีย \"สี่จังหวัดกับค่ายศิริชัย\" ครบ 4/4 ตอน"}]
   :[{n:"nar",t:`วล็อกของอลิเซีย "สี่จังหวัดกับค่ายศิริชัย" ตอนที่ ${n}/4 · ตอนต่อไปถ่ายที่จังหวัดถัดไป`}];};
 RG_PROV.lopburi=(G,D)=>{const opp=REGION.oppName(G,"lopburi");return {
  meet:[{n:"nar",bg:"rg_central",t:"หน้าศาลพระกาฬ ลพบุรี อลิเซียยืนถือกล้องบนไม้กันสั่น สวมแว่นดำ ลิงสองตัวนั่งอยู่บนไหล่เธอ"},
   A("happy","Welcome to Lopburi~ ห้ามขำนะคะ! ลิงพวกนี้ขึ้นมาเองค่ะ ฉันไม่ได้ตั้งใจให้มันเป็นส่วนหนึ่งของคอนเทนต์!"),
   ...rgProvTip(G,"lopburi",[A("happy",`${opp}ใช้หมัดลิงหลอกเจ้าค่ะ หลอกซ้ายหลอกขวาเหมือนลิงแย่งของ`),A("happy","แต่เขาหลอกสามครั้งถึงจะชกจริง นับในใจไว้ ครั้งที่สามค่อยหลบนะคะ")],"อลิเซีย")],
  body:[A("happy","ฉันมีโปรเจกต์ใหม่ค่ะ วล็อกซีรีส์ \"สี่จังหวัดกับค่ายศิริชัย\" ไปจังหวัดไหน ฉันถ่ายหนึ่งตอน"),
   A("flustered","ไม่ใช่เพราะอยากเจอคุณบ่อย ๆ นะคะ! สปอนเซอร์ขอ… แฟนคลับขอ… ทุกคนขอมาค่ะ"),
   {n:"nar",t:"ลิงบนไหล่อลิเซียคว้าแว่นดำของเธอไป แล้ววิ่งหนีขึ้นพระปรางค์",choice:[
    {t:"วิ่งไปเอาแว่นคืนให้",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"nar",t:"ผู้จัดการแลกแว่นคืนด้วยกล้วยหนึ่งหวี ลิงดูพอใจมาก อลิเซียดูพอใจกว่า"},A("flustered","…ฉากนี้ฉันขอเก็บไว้ดูคนเดียวค่ะ ไม่ลงช่อง")]},
    {t:"ถ่ายคลิปอลิเซียวิ่งไล่ลิง",fx:G2=>rgMeet(G2,"alicia",2),then:[A("pout","ห้ามโพสต์! …ถ้าโพสต์ ต้องให้เครดิตฉันเป็นนักแสดงนำนะคะ")]},
    {t:"\"ไม่มีแว่น สวยกว่านะ\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…! ไลฟ์ไม่ได้เปิดอยู่ใช่ไหมคะ ไม่ได้เปิดใช่ไหม!")]}]},
   ...rgJealStep(G,"อลิเซีย",0,"near"),
   ...vlog(G)]};};
 RG_PROV.suphan=(G,D)=>{const opp=REGION.oppName(G,"suphan");return {
  meet:[{n:"nar",bg:"rg_central",t:"บนชั้นชมวิวของหอคอยสูงกลางเมืองสุพรรณ อลิเซียยืนชิดกระจก ชี้กล้องลงไปที่ทุ่งนาสุดสายตา"},
   A("happy","Good morning ค่ะ! จากบนนี้เห็นสุพรรณทั้งจังหวัด… ตอนนี้ต้องเปิดฉากให้อลังการค่ะ"),
   ...rgProvTip(G,"suphan",[A("happy",`${opp}ใช้เตะแม่ไม้สุพรรณค่ะ เตะตามตำราเป๊ะ ไม่มีพลาด`),A("happy","แต่ตำราก็คือตำรา เขาเตะจังหวะเดิมทุกครั้ง จับจังหวะได้ก็สวนได้ทุกลูกค่ะ")],"อลิเซีย")],
  body:[{n:"nar",bg:"market",t:"บ่ายนั้นที่ตลาดสามชุก ตลาดไม้ร้อยปีริมแม่น้ำท่าจีน อลิเซียถ่ายร้านกาแฟโบราณ ร้านขนม ร้านตัดผม ถ่ายทุกอย่างยกเว้นตัวเอง"},
   A("sad","รู้ไหมคะ คอมเมนต์ที่เยอะที่สุดในช่องฉันคือ \"สวยแต่ชกไม่เป็น\" ฉันซ้อมวันละหกชั่วโมง ก็ยังมีคนพิมพ์แบบนั้น"),
   A("sad","ฉันเลยชอบถ่ายคนอื่นมากกว่าค่ะ",{choice:[
    {t:"\"งั้นวันนี้ฉันถ่ายเธอเอง\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"ผู้จัดการถือกล้องตามอลิเซียทั้งตลาด เธอเดินแข็งเป็นหุ่นอยู่สิบนาที แล้วค่อย ๆ หัวเราะออกมาเองตอนกัดขนมร้อน ๆ"},A("flustered","…คลิปนี้ฉันขอเก็บไว้เองนะคะ ไม่ลงช่อง")]},
    {t:"\"คนที่เคยเห็นเธอชกจริง ไม่มีใครพิมพ์แบบนั้นหรอก\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…คุณพูดเหมือนเคยโดนฉันต่อยมาแล้วเลยค่ะ")]},
    {t:"\"อ่านคอมเมนต์ให้น้อยลงหน่อยก็ดีนะ\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","ฉันรู้ค่ะ… แต่ทำไม่ได้ อาชีพฉันคือคอมเมนต์")]}]}),
   ...rgJealStep(G,"อลิเซีย",0,"near"),
   ...vlog(G)]};};
 RG_PROV.phetchaburi=(G,D)=>{const opp=REGION.oppName(G,"phetchaburi");return {
  meet:[{n:"nar",bg:"hill",t:"ที่สถานีรถรางขึ้นเขาวัง เมืองเพชร อลิเซียยืนรอ ถือกล่องขนมหม้อแกงซ้อนกันห้ากล่อง"},
   A("happy","เมืองเพชรค่ะ! ขนมหม้อแกงร้านดังที่สุด ต้องต่อคิวแต่เช้า… ไม่ได้ต่อเองนะคะ ผู้ช่วยต่อ …โอเค ฉันต่อเองค่ะ ชั่วโมงครึ่ง"),
   ...rgProvTip(G,"phetchaburi",[A("happy",`${opp}ใช้เข่าเขาวังเมืองเพชรค่ะ เข่าขึ้นสูงเหมือนเดินขึ้นเขา หนักมาก`),A("happy","เขาจะดึงคอก่อนทุกครั้ง มือเขาแตะคอเมื่อไหร่ ดันศอกออกทันทีค่ะ อย่ารอ")],"อลิเซีย")],
  body:[{n:"nar",t:"บนยอดเขาวัง ลมพัดแรง มองลงไปเห็นทั้งเมืองเพชรบุรี อลิเซียตั้งกล้องไว้ แล้ววางมันลง ไม่ได้กดอัด"},
   A("sad","ผู้จัดการส่วนตัวฉันโทรมาเมื่อเช้าค่ะ ถามเรื่องสัญญานาคาอีกแล้ว ฉันบอกว่ากำลังถ่ายวล็อก แล้วก็วางสาย"),
   A("sad","บางทีฉันก็อยากเป็นนักมวยธรรมดา ๆ ค่ะ ไม่มีใครรู้จัก ซ้อมเสร็จก็มากินขนมบนเขา ไม่มีกล้อง",{choice:[
    {t:"\"ตอนนี้ก็ไม่มีกล้องแล้วนะ\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…จริงด้วยค่ะ"),{n:"nar",t:"อลิเซียหยิบขนมหม้อแกงขึ้นมากัดคำโต เลอะมุมปาก แล้วหัวเราะ ไม่สนว่าใครจะเห็น"}]},
    {t:"\"คนรู้จักเธอเพราะเธอชกเก่ง\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…คุณนี่ชอบพูดอะไรที่ฉันอยากได้ยินจังเลยนะคะ")]},
    {t:"แบ่งขนมหม้อแกงกันกิน",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","กล่องนั้นของคุณค่ะ หน้าเผือก ฉันเลือกให้แล้ว… ไม่ได้จำว่าคุณชอบเผือกนะคะ บังเอิญ")]}]}),
   ...rgJealStep(G,"อลิเซีย",0,"near"),
   ...vlog(G)]};};
 RG_PROV.chanthaburi=(G,D)=>{const opp=REGION.oppName(G,"chanthaburi");return {
  meet:[{n:"nar",bg:"market",t:"ตลาดพลอยจันทบุรีเช้าวันเสาร์ พ่อค้าส่องพลอยกันเต็มถนน อลิเซียนั่งอยู่หน้าโต๊ะพลอย ใส่แว่นขยายอันเล็กเหมือนเซียน"},
   A("happy","วันนี้ฉันจะสอนทุกคนดูพลอยแท้ค่ะ! …ฉันดูไม่เป็นหรอก แต่ถือแว่นขยายแล้วดูเป็นค่ะ"),
   ...rgProvTip(G,"chanthaburi",[A("happy",`${opp}ใช้หมัดเปลือกมังคุดค่ะ การ์ดแน่นเหมือนเปลือกมังคุด เจาะยาก`),A("happy","ไม่ต้องทุบเปลือกค่ะ เตะขาไปเรื่อย ๆ เปลือกแข็งแค่ไหน ขาก็ยังอ่อนอยู่ดี")],"อลิเซีย")],
  body:[{n:"nar",bg:"river",t:"บ่ายนั้น อลิเซียพาเดินชุมชนริมน้ำจันทบูร บ้านไม้เก่าเรียงยาวริมแม่น้ำ มีโบสถ์หลังใหญ่อยู่ฝั่งตรงข้าม"},
   A("happy","ฉันมาเข้าค่ายซ้อมที่นี่ตอนสิบห้าค่ะ เป็นครั้งแรกที่มีคนบอกว่าฉันชกเก่ง ไม่ใช่สวย"),
   A("flustered","…คนนั้นคือแม่ค้ามังคุดค่ะ ฮ่า ๆ แกดูฉันซ้อมทุกวัน แล้วให้มังคุดฟรีวันละถุง",{choice:[
    {t:"ชวนไปตามหาแม่ค้ามังคุดคนนั้น",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"แผงมังคุดยังอยู่ที่เดิม แม่ค้าจำอลิเซียได้ทันที ตะโกนเรียก \"ยัยหนูหมัดหนัก!\" อลิเซียวิ่งเข้าไปกอดเหมือนเด็ก"}]},
    {t:"\"ฉันก็ว่าเธอชกเก่ง ไม่ใช่สวย\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("pout","…ไม่สวยเลยเหรอคะ"),A("flustered","ล้อเล่นค่ะ! …ขอบคุณค่ะ")]},
    {t:"ช่วยถ่ายวล็อกต่อ",fx:G2=>rgMeet(G2,"alicia",1),then:[A("happy","ได้ค่ะ! ตรงนี้แสงสวย คุณยืนตรงนั้นนะคะ… ในเฟรมด้วย")]}]}),
   ...rgJealStep(G,"อลิเซีย",0,"near"),
   ...vlog(G)]};};
 RG_DATE.lopburi=G=>[{n:"nar",bg:"night_central",t:"คาเฟ่เปิดดึกหน้าพระปรางค์สามยอด ลิงนอนเรียงกันบนสายไฟเหมือนลูกปัด อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะตั้งแต่นั่งลง"},
   A("happy","คืนนี้ไม่ไลฟ์ค่ะ ไม่ถ่าย ไม่โพสต์… ฉันจะลองดูว่าคนธรรมดาเขาเดตกันยังไง"),
   A("flustered","…ไม่ใช่เดต! หมายถึงออกมากินกาแฟ!",{choice:[
    {t:"\"งั้นคนธรรมดาเขาก็นั่งคุยกันเฉย ๆ\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"สองคนคุยกันจนร้านปิด อลิเซียไม่แตะโทรศัพท์เลยสักครั้ง"}]},
    {t:"\"เดตก็ได้นี่\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…! คุณพูดเองนะคะ ฉันไม่ได้พูด จำไว้ด้วย")]},
    {t:"ถ่ายรูปลิงบนสายไฟ",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","คุณเป็นคนถ่ายแทนฉันเหรอคะเนี่ย… ก็ได้ ส่งให้ด้วยนะ")]}]})];
 RG_DATE.suphan=G=>[{n:"nar",bg:"night_central",t:"งานวัดป่าเลไลยก์คืนนี้คนแน่น ชิงช้าสวรรค์หมุนช้า ๆ อลิเซียซื้อตั๋วมาสองใบโดยไม่ถามสักคำ"},
   {n:"nar",t:"กระเช้าหยุดค้างอยู่บนสุดพอดี ลมพัดเย็น อลิเซียจับราวแน่น"},
   A("flustered","ฉันไม่ได้กลัวความสูงนะคะ… กลัวมันค้างอยู่บนนี้นาน ๆ ต่างหาก",{choice:[
    {t:"ยื่นมือให้จับ",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"อลิเซียจับมือไว้แน่นจนกระเช้าลงถึงพื้น แล้วปล่อยเร็วมาก ทำเป็นจัดผม"}]},
    {t:"ชี้ให้ดูไฟทั้งเมือง",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…สวยจัง ไม่ต้องถ่ายก็จำได้")]},
    {t:"แกล้งโยกกระเช้า",fx:G2=>rgMeet(G2,"alicia",1),then:[A("angry","…! ลงไปแล้วคุณโดนอัปเปอร์คัตหนึ่งที!")]}]})];
 RG_DATE.phetchaburi=G=>[{n:"nar",bg:"night_central",t:"ชายหาดชะอำยามค่ำ ร้านอาหารทะเลเปิดไฟเรียงริมหาด อลิเซียถอดบูทขาวถือไว้ เดินเท้าเปล่าบนทราย"},
   A("happy","บูทคู่นี้แพงที่สุดในตู้ค่ะ แต่ใส่แล้วเจ็บเท้าที่สุด… เหมือนชื่อเสียงเลย",{choice:[
    {t:"\"งั้นถือบูทให้นะ\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…ถือรองเท้าให้กันบนชายหาด ถ้าคนดูเห็นคงกรี๊ดทั้งช่องค่ะ… โชคดีที่ไม่มีใครเห็น")]},
    {t:"ถอดรองเท้าเดินเท้าเปล่าด้วยกัน",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"คลื่นซัดขึ้นมาถึงข้อเท้าทั้งสองคน อลิเซียกรี๊ดเบา ๆ แล้วหัวเราะเสียงดังกว่าทุกครั้งที่ไลฟ์"}]},
    {t:"\"ชื่อเสียงก็ทำให้คนเห็นว่าเธอชกเก่งนะ\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("happy","…คุณมองโลกในแง่ดีจังค่ะ")]}]})];
 RG_DATE.chanthaburi=G=>[{n:"nar",bg:"night_central",t:"ร้านขนมในบ้านไม้เก่าริมน้ำจันทบูร อลิเซียสั่งขนมไข่สองถุง แล้วนั่งนิ่งนานผิดปกติ"},
   A("happy","ฉันถามคุณข้อหนึ่งได้ไหมคะ ห้ามตอบแบบผู้จัดการค่าย"),
   A("flustered","ถ้าฉันไม่ได้เป็นแชมป์ ไม่มีช่อง ไม่มีคนดู… คุณจะยังมาเดินกับฉันไหมคะ",{choice:[
    {t:"\"มาสิ\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…ตอบเร็วไปค่ะ ไม่ได้คิดเลย"),A("happy","…แต่ฉันชอบที่ไม่ได้คิด")]},
    {t:"\"มาแน่ แต่คงต้องจ่ายค่าขนมเองแล้ว\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","ฮ่า ๆ คุณนี่… ได้ค่ะ ขนมไข่ถุงนี้ฉันเลี้ยง")]},
    {t:"\"ถามทำไมล่ะ\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","…ไม่ถามแล้วค่ะ")]}]})];
 RG_DATEP.alicia=[
  G=>[{n:"nar",bg:"night_central",t:"ร้านกาแฟริมแม่น้ำ อลิเซียนั่งตรงข้าม แต่งตัวเต็มเหมือนจะไปออกงาน"},A("happy","อย่าเข้าใจผิดนะ ฉันแค่อยากมีคนเดินเป็นเพื่อน คืนนี้กล้องปิดแล้ว…"),{n:"nar",t:"อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะทั้งคืน ไม่ได้หยิบขึ้นมาเลยสักครั้ง"}],
  G=>[{n:"nar",bg:"night_central",t:"ห้างกลางเมืองยังไม่ปิด อลิเซียลากผู้จัดการเข้าร้านเสื้อผ้า หยิบเสื้อมาทาบตัวผู้จัดการทีละตัว"},A("flustered","ตัวนี้ค่ะ ไม่ใช่เพราะฉันชอบนะคะ สีมันเข้ากับแจ็กเก็ตฉันเฉย ๆ")],
  G=>[{n:"nar",bg:"night_central",t:"ร้านไอศกรีมริมแม่น้ำ อลิเซียถ่ายรูปไอศกรีมยี่สิบรูปจนมันละลายเยิ้ม"},A("pout","ไม่ต้องหัวเราะค่ะ! …ช่วยกินก่อนมันหยดก็ได้")]];
}

/* ---------- v1.91.121 (Man): off-schedule fights — a champion's own trouble spills into a camp trip ----------
   2nd+ trip to her region (not the trip that first met her), first hotel night, once; before she joins the camp.
   Consecutive bouts, the player sends someone from the travelling party for each, no lingering injury; a loss or a retreat = try again on a later trip. */
if(typeof QK!=="undefined")Object.assign(QK,{
  jl1:{fst:"pressure",name:"ลูกน้องจินหลงเสื้อลายมังกร",sprite:"gang1",lvl:-1,tilt:{punch:1.5,power:1,iq:-2,guard:-1,comp:-1},color:"#3c6e5a",grp:"gang"},
  jl2:{fst:"inside",name:"มือขวาเฮียหลง",sprite:"gang2",lvl:-.2,tilt:{punch:1,knee:1.5,power:1,iq:-1},color:"#2f5546",grp:"gang"},
  jl3:{fst:"power",name:"เฮียหลง หัวหน้านักเลงจินหลง",sprite:"gang3",lvl:.6,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#c9a227",grp:"gang"}});
const RG_SIDE={
 north:{cid:"baibua",bg:"camp_buatasao",ring:"bg_camp_buatasao.webp",title:"ไฟต์นอกตาราง · หน้าสปาบัวท่าเสา",
  foes:[{qk:"jl1",t:"ค่ายมวยจากไหนก็ช่าง ข้าเตะเสาไฟหักมาแล้วนะ"},{qk:"jl2",t:"หมดแรงหรือยังล่ะ คนต่อไปของแกก็หลับเหมือนกัน"},{qk:"jl3",t:"สองคนแรกมันอ่อน ข้าไม่อ่อนแบบมันหรอก"}],
  between:["ลูกน้องคนต่อไปถลกแขนเสื้อ ก้าวข้ามเชือกขึ้นมา","เฮียหลงถอดเสื้อลายมังกรโยนทิ้ง แล้วเดินขึ้นเวทีเอง"],
  intro:G=>[{n:"nar",t:"พลบค่ำ ทุกคนเพิ่งกลับถึงโรงแรม โทรศัพท์ผู้จัดการก็ดังขึ้น เบอร์ใบบัว"},
   {n:"baibua",f:"sad",l:"casual",t:"ผู้จัดการเจ้า… นักเลงจินหลงมาที่หน้าสปาอีกแล้ว มากันเต็มรถตู้เลยเจ้า"},
   {n:"baibua",f:"sad",l:"casual",t:"พ่อจะลุกออกไปทั้งที่เข่ายังเจ็บ หนูห้ามพ่อบ่อยู่แล้วเจ้า"}],
  go:"\"รออยู่ตรงนั้น ค่ายเรากำลังไป\"",no:"\"คืนนี้ทุกคนล้ามาก ขอโทษนะ\"",
  noT:G=>[{n:"baibua",f:"sad",l:"casual",t:"…บ่เป็นหยังเจ้า หนูเข้าใจ ค่ายมวยก็ต้องดูแลคนของตัวเองก่อน"},{n:"nar",t:"ใบบัววางสายไปก่อน เสียงตะโกนยังดังอยู่ปลายสาย"}],
  arrive:G=>[{n:"nar",bg:"camp_buatasao",t:"รถของค่ายเลี้ยวเข้าซอยบัวท่าเสาตอนฟ้ายังแดงอยู่ ผู้ชายเสื้อเชิ้ตลายมังกรห้าหกคนยืนล้อมป้ายร้านนวดที่โดนพ่นสีแดง"},
   {n:"npc",who:"ลูกน้องจินหลง",t:"ค่ายมวยที่ไหนมาเนี่ย ที่นี่ไม่ใช่เรื่องของแก"},
   {n:"baibua",f:"angry",l:"casual",t:"ที่ดินบ้านหนูบ่ขาย! ใครอยากได้ ขึ้นเวทีหลังค่ายมาเอาเอง"},
   {n:"npc",who:"เฮียหลง",t:"เอาสิ สามคู่ ชนะหมดข้าจะถอยไปก่อน แพ้คู่เดียว พวกข้ามาทุกคืนจนกว่าพ่อแกจะเซ็น"},
   {n:"coach",t:"เวทีซ้อมหลังค่ายพอใช้ได้ ใครพร้อมก็ขึ้น อย่าฝืนถ้าล้าเกินไป"}],
  win:G=>[{n:"nar",t:"เฮียหลงล้มลงกลางเวทีซ้อม ลูกน้องหิ้วปีกขึ้นรถตู้ไปอย่างรีบร้อน"},
   {n:"npc",who:"เฮียหลง",t:"จำไว้! เสี่ยจินหลงไม่ยอมแค่นี้หรอก"},
   {n:"nar",t:"โทรศัพท์เครื่องหนึ่งหล่นอยู่ข้างเวที หน้าจอยังสว่าง ข้อความล่าสุดจาก \"เสี่ยจินหลง\": ป่วนให้หนักจนพ่อมันยอมขาย ค่าจ้างคืนละห้าพัน"},
   {n:"baibua",f:"surprised",l:"casual",t:"นี่มัน… หลักฐานว่ารีสอร์ทจ้างนักเลงมาเจ้า!",choice:[
    {t:"ถ่ายรูปเก็บไว้ พรุ่งนี้เช้าไปแจ้งความด้วยกัน",fx:G2=>{rgMeet(G2,"baibua",4);G2.region.side.north.how="police";},then:[{n:"baibua",f:"flustered",l:"casual",t:"ไปด้วยกันเหรอเจ้า… เจ้า หนูจะไปรอหน้าโรงพักแต่เช้าเลย"}]},
    {t:"ส่งให้นักข่าวท้องถิ่น ให้ทั้งจังหวัดรู้",fx:G2=>{rgMeet(G2,"baibua",3);G2.region.side.north.how="news";},then:[{n:"baibua",f:"happy",l:"casual",t:"ให้คนทั้งอุตรดิตถ์รู้ว่าใครเป็นคนป่วน… ดีเจ้า เขาจะได้อายจนบ่กล้ามาอีก"}]}]},
   {n:"nar",t:"พ่อของใบบัวเดินกะเผลกออกมาจากบ้าน ยกมือไหว้ทุกคนในค่ายทีละคน"},
   {n:"baibua",f:"happy",l:"casual",t:"ขอบคุณเจ้า ทุกคนเลย… ค่ายศิริชัยมาช่วยแล้วจริง ๆ"}],
  lose:G=>[{n:"npc",who:"เฮียหลง",t:"ฮ่า! ค่ายมวยก็แค่นี้เอง พรุ่งนี้มาใหม่!"},
   {n:"baibua",f:"sad",l:"casual",t:"บ่เป็นหยังเจ้า ทุกคนเจ็บกันหมดแล้ว กลับไปพักเถอะ… มาช่วยแค่นี้หนูก็ดีใจแล้ว"},
   {n:"coach",t:"คราวหน้าที่มาภาคเหนือ เรามาเอาคืนกัน"}],
  /* the trouble ends: the evidence works, the resort backs off */
  done:(G,how)=>addMail(G,{kind:"letter",from:"ใบบัว",title:"ข่าวจากบัวท่าเสา",body:how==="news"?
   "ผู้จัดการเจ้า\n\nข่าวขึ้นหน้าหนึ่งหนังสือพิมพ์อุตรดิตถ์เลยเจ้า \"รีสอร์ทจ้างนักเลงป่วนสปาชาวบ้าน\" คนทั้งจังหวัดแชร์กันใหญ่ รีสอร์ทจินหลงออกมาขอโทษ แล้วถอนข้อเสนอซื้อที่ดินไปแล้วเจ้า\n\nแม่ให้ส่งบัตรนวดฟรีมาให้ทั้งค่าย ใช้ได้ตลอดชีวิตเจ้า\n\nใบบัว":
   "ผู้จัดการเจ้า\n\nตำรวจเรียกเสี่ยจินหลงไปสอบปากคำแล้วเจ้า ข้อความในโทรศัพท์เครื่องนั้นชัดเจนจนเขาเถียงบ่ได้ เมื่อเช้ารีสอร์ทส่งหนังสือมาถอนข้อเสนอซื้อที่ดินแล้วเจ้า\n\nพ่อบอกว่าวันที่ผู้จัดการยืนรอหน้าโรงพักกับหนู พ่อเห็นจากหน้าต่างรถ… พ่อยิ้มทั้งวันเลยเจ้า\n\nใบบัว"})}};
function rgSideDue(G,T){const R=G.region,D=ROAD_DEST[T.dest];if(!R||!D||T.fa||T.series||T.local)return null;const X=RG_SIDE[D.r];if(!X)return null;
  const S=(R.side=R.side||{})[D.r]=R.side[D.r]||{};if(S.won)return null;if(R.joined&&R.joined[X.cid])return null;if(!(R.arrived||{})[D.r])return null;
  if(S.triedAbs!=null&&S.triedAbs===T.abs)return null;return X;}
/* ---------- v1.91.122 (Man): the camp's own journey through the Four Regions ----------
   RG_MS: milestone nights back at camp — first province belt, first four-belt ticket, each cup, all four cups (national).
   RG_WARM: quiet hotel-night moments with the five, each once, in place of a hotel gag; lines read the camp's real progress. */
const RG_MSL={
 belt1:{bg:"camp_night",
  head:(G,q)=>`คืนนั้นกลับถึงค่ายดึก แต่ไม่มีใครยอมเข้านอน เข็มขัดจังหวัด${(ROAD_DEST[q.dest]||{name:""}).name}วางอยู่กลางโต๊ะกินข้าว`,
  me:{kati:"ปู่คะ… เข็มขัดเส้นแรกนอกเชียงใหม่ของค่ายศิริชัย หนูเอามาให้ปู่ดูแล้วนะคะ",
   mali:"มะลิถ่ายรูปส่งให้แม่แล้วค่ะ~ แม่ตอบมาคำเดียวว่า \"เห็นแล้ว\" …แค่นั้นก็พอแล้วค่ะ",
   rin:"ฉันคำนวณโอกาสชนะคืนนั้นไว้สามสิบแปดเปอร์เซ็นต์ค่ะ …ดีใจที่ตัวเลขผิด",
   ploy:"เข่ายังไหว เข็มขัดก็ได้มา …คืนนี้ขอนั่งเฉย ๆ ตรงนี้นาน ๆ หน่อยนะ",
   fah:"ใครจะถ่ายรูปฟ้ากับเข็มขัดก็ถ่ายได้นะ! …ส่งให้ยายด้วย ยายต้องโทรมาถามแน่"},
  any:{kati:"เข็มขัดจากต่างจังหวัด… ปู่เคยพูดว่าสักวันค่ายศิริชัยจะได้ออกไปชกไกลกว่าเชียงใหม่ ปู่พูดถูกแล้วค่ะ",
   mali:"มะลิขอจับหน่อยนะ~ หนักกว่าที่คิดอีก! เส้นต่อไปมะลิขอบ้างนะคะ",
   rin:"ฉันเปิดหน้าใหม่ในสมุดดำแล้วค่ะ หัวข้อ \"ศึกชิงเจ้าสี่ภาค\" ตอนนี้มีบรรทัดเดียว …ไม่อยากให้มีบรรทัดเดียวนาน",
   ploy:"เส้นแรกยากที่สุดเสมอ ที่เหลือจะง่ายขึ้น …ไม่ใช่เพราะคู่ง่ายนะ เพราะเรารู้แล้วว่าเราทำได้",
   fah:"ฟ้าไม่ได้อิจฉาหรอกนะ! …แค่เส้นต่อไปฟ้าจะเอาเอง จำไว้!"},
  coach:"เข็มขัดเส้นแรกของค่ายนอกบ้านเรา คืนนี้กินให้เต็มที่ พรุ่งนี้ตีห้าวิ่งตามเดิม",
  end:"ป้าแดงยกหม้อแกงฮังเลออกมาจากครัว ทุกคนส่งเสียงเฮพร้อมกัน"},
 ticket:{bg:"camp_night",
  head:(G,q)=>`จดหมายจากสมาคมวางอยู่บนโต๊ะ ค่ายศิริชัยครบสี่เข็มขัดของ${RG[q.r].name}แล้ว ได้สิทธิ์ท้าชิงแชมป์ภาค`,
  any:{kati:"สี่เส้นแล้วค่ะ! ต่อไปคือแชมป์ภาคตัวจริง… หนูมือสั่นแทนทุกคนเลย",
   mali:"แชมป์ภาคเลยเหรอคะ~ เหมือนเมื่อวานเรายังลุ้นแค่ระดับตำบลกันอยู่เลย",
   rin:"จากระดับตำบลถึงตรงนี้ ใช้เวลาน้อยกว่าที่ฉันคาดไว้ค่ะ …ฉันชอบที่ตัวเองคาดผิดแบบนี้",
   ploy:"ตอนอยู่พยัคฆ์ทอง ฉันเคยคิดว่าค่ายเล็ก ๆ ไปไม่ถึงตรงนี้ …ฉันคิดผิด",
   fah:"แชมป์ภาคก็คนเหมือนกัน! ชกได้ก็แพ้ได้ ฟ้าไม่กลัวหรอกนะ …ใครขึ้นชกบอกฟ้า ฟ้าจะคุมมุมให้"},
  coach:"สามนัดชนะสองนะ ไม่ใช่ไฟต์เดียวจบ ดูเทป แก้ทาง ซ้อมให้ตรงกับที่เห็น ไปพักได้แล้ว"},
 cup1:{bg:"camp_night",
  head:(G,q)=>`ถ้วยแชมป์${RG[q.r].name}ตั้งอยู่บนชั้นในห้องโถงค่าย ข้าง ๆ รูปปู่ชัย`,
  me:{kati:"ปู่คะ ค่ายศิริชัยเป็นแชมป์ระดับภาคแล้วนะคะ… หนูวางถ้วยไว้ข้างปู่ จะได้เห็นทุกวัน",
   mali:"มะลิวิดีโอคอลหาแม่ แม่ดูจนจบเป็นครั้งแรกเลยค่ะ~ …มะลิร้องไปแล้ว อย่ามองนะ",
   rin:"ตอนอายุสิบเก้า ฉันเคยจดในสมุดว่า \"ไม่มีวันได้ขึ้นเวทีใหญ่อีก\" …วันนี้ขีดฆ่าบรรทัดนั้นแล้วค่ะ",
   ploy:"ถ้วยแรกของฉันที่ไม่ได้ชกเพื่อให้ใครพอใจ ชกเพราะอยากชกเอง …แปลกดีนะ",
   fah:"ฟ้าเป็นแชมป์ภาค! ยายต้องเล่าให้คนทั้งตลาดฟังแน่ …นาย ขอบใจนะ ฟ้าพูดครั้งเดียว"},
  any:{kati:"เรามาถึงระดับภาคแล้วนะคะ! จากค่ายเล็ก ๆ ที่ปู่สร้างไว้กับกระสอบเก่าไม่กี่ใบ…",
   mali:"ระดับภาคแล้ว~! มะลิจะเขียนจดหมายบอกแม่ …ฉบับนี้มะลิจะส่งจริง ๆ ค่ะ",
   rin:"ระดับภาคค่ะ ฉันเช็กแล้วสามรอบ ไม่ได้ฝัน",
   ploy:"ระดับภาคแล้ว …ทุกคน พรุ่งนี้ไม่ต้องตื่นตีห้า พี่จะไปคุยกับครูแดงให้เอง",
   fah:"ระดับภาค!! ฟ้าไม่ได้ร้องไห้นะ ฝุ่นเข้าตา!"},
  coach:"ปู่ชัยพูดไว้ว่าสักวันค่ายนี้จะมีถ้วยระดับภาค …วันนี้มาถึงแล้ว แต่อย่าเพิ่งพอใจ ยังเหลืออีกสามภาค",
  end:"คืนนั้นไฟในหอพักไม่ดับจนตีสอง เสียงหัวเราะดังลงมาถึงลานซ้อม"},
 cup2:{bg:"camp_night",
  head:(G,q)=>`ถ้วยแชมป์${RG[q.r].name}วางลงข้างถ้วยใบแรก ชั้นในห้องโถงเริ่มดูแคบ`,
  any:{kati:"ถ้วยที่สองแล้วค่ะ! ชั้นข้างรูปปู่เริ่มแคบแล้ว หนูต้องขอครูแดงต่อชั้นเพิ่ม",
   mali:"สองภาคแล้ว~ มะลิเริ่มจำทางในแผนที่ประเทศไทยได้แล้วนะคะ",
   rin:"สองในสี่ค่ะ ห้าสิบเปอร์เซ็นต์ …ครึ่งทางหลังมักเหนื่อยกว่าครึ่งแรกเสมอ",
   ploy:"สองถ้วยแล้ว อย่าเพิ่งหลงตัวเอง ภาคที่เหลือรู้แล้วว่าเราเป็นใคร",
   fah:"สองถ้วย! ฟ้าว่าเราชิงทั้งประเทศได้นะ …ฟ้าพูดจริง ไม่ได้พูดเล่น"}},
 cup3:{bg:"camp_night",
  head:(G,q)=>`ถ้วยแชมป์${RG[q.r].name}เป็นใบที่สาม เหลือที่ว่างบนชั้นอีกช่องเดียว`,
  any:{kati:"อีกภาคเดียวค่ะ… อีกภาคเดียว ค่ายศิริชัยจะเป็นค่ายระดับประเทศ",
   mali:"อีกนิดเดียวเองค่ะ~ มะลิจะซ้อมเพิ่มทุกเย็น ไม่ให้ใครต้องแบกคนเดียว",
   rin:"เหลือหนึ่งภาค ฉันวางแผนไว้สามแบบแล้วค่ะ …แบบที่สี่คือเชื่อใจกัน",
   ploy:"ถ้วยสุดท้ายหนักที่สุด เพราะทุกคนเริ่มกลัวพลาด …อย่ากลัว เราไม่ได้มาไกลขนาดนี้เพราะโชค",
   fah:"อีกถ้วยเดียว! ถ้าใครเหนื่อย ฟ้าแบกเอง …ไม่ได้ห่วงนะ แค่ไม่อยากรอ"}},
 nat:{bg:"camp_night",
  head:(G,q)=>"ถ้วยใบที่สี่วางลงบนชั้น ครบสี่ภาค ครบทั้งประเทศ",
  any:{kati:"ค่ายศิริชัยเป็นแชมป์ระดับประเทศแล้วนะคะปู่… หนูไม่ต้องมองหาปู่บนอัฒจันทร์อีกแล้ว เพราะหนูรู้ว่าปู่อยู่ตรงนี้",
   mali:"ทั้งประเทศเลยนะคะ~ จากไชยาขึ้นไปถึงเชียงราย …พ่อคงยิ้มอยู่แน่ ๆ",
   rin:"ฉันเริ่มสมุดดำเล่มใหม่แล้วค่ะ หน้าแรกไม่มีตัวเลขเลย มีแค่ชื่อทุกคน",
   ploy:"ฉันเคยชกเพื่อไม่ให้ใครผิดหวัง… ช่วงนี้ชกเพื่อพวกเธอ แล้วมันดีกว่าเยอะเลย",
   fah:"ทุกคนที่สำคัญชอบไป… แต่พวกเธอไม่ไปไหนเลย ฟ้า… ฟ้าดีใจนะ พูดครั้งเดียว ห้ามล้อ!"},
  coach:"ระดับประเทศ… ปู่ชัยคงอยากเห็นวันนี้มากกว่าใคร ผมจะเล่าให้แกฟังตอนไหว้ครูปีนี้",
  end:"คืนนั้นทุกคนลากเสื่อมาปูนอนกลางลานซ้อม นับดาวจนหลับไปทีละคน"}};
function rgCampGirls(G){return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player"&&!(typeof isAway==="function"&&isAway(G,id)));}
function rgMsSteps(G,q){const M=RG_MSL[q.k];if(!M)return null;const gs=rgCampGirls(G),win=q.id&&gs.includes(q.id)?q.id:null;
  const S=[{n:"nar",t:M.head(G,q)}];
  if(win&&M.me)S.push({n:win,f:"happy",l:"casual",t:M.me[win]});
  const rest=gs.filter(id=>id!==win);const lim=M.me||q.k==="ticket"||q.k==="nat"?5:3;
  for(const id of rest.slice(0,lim))S.push({n:id,f:id==="fah"?"flustered":"happy",l:"casual",t:M.any[id]});
  if(M.coach)S.push({n:"coach",t:M.coach});if(M.end)S.push({n:"nar",t:M.end});
  for(const id of gs)add(G,id,"morale",3);S.push({n:"nar",t:"ทั้งค่าย กำลังใจ +3"});return S;}

const rgB=(G)=>REGION.beltTotal(G),rgC=(G)=>((G.region&&G.region.cups)||[]).length;
const RG_WARM=[
 {id:"kati_gloves",g:["kati"],ok:G=>rgB(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"ตีหนึ่ง ไฟห้องกะทิยังเปิดอยู่ ประตูแง้มไว้ครึ่งหนึ่ง กะทินั่งริมหน้าต่าง นวมคู่แรกวางอยู่บนตัก"},
  {n:"kati",f:"sad",l:"casual",t:`ปู่คะ คืนนี้หนูนอนที่${D.name}นะคะ ไกลบ้านที่สุดที่หนูเคยมาเลย`},
  {n:"kati",f:"surprised",l:"casual",t:"…ผู้จัดการ! ได้ยินเหรอคะ หนูพกนวมคู่นี้มาทุกทริปเลยค่ะ ไม่งั้นนอนไม่หลับ",choice:[
   {t:"นั่งลงข้าง ๆ แล้วถามว่าปู่ชอบจังหวัดไหน",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"happy",l:"casual",t:"ปู่ชอบอุตรดิตถ์ที่สุดค่ะ ปู่บอกว่าเวทีที่นั่นคนดูตะโกนดังกว่าทุกที่… หนูอยากพาทุกคนไปให้ได้สักครั้ง"}]},
   {t:"\"ปู่คงดีใจที่หลานพาค่ายมาไกลขนาดนี้\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"flustered",l:"casual",t:"…หนูไม่ได้พามาคนเดียวนะคะ ผู้จัดการพามาด้วย ปู่ต้องรู้แน่ ๆ ค่ะ"}]}]}]},
 {id:"kati_kids",g:["kati"],r:"north",bg:"rg_north",s:(G,D)=>[
  {n:"nar",t:"หัวค่ำ ลานจอดรถโรงแรมมีเด็กแถวนั้นห้าหกคนยืนชกลมเลียนแบบท่ากะทิ"},
  {n:"kati",f:"happy",l:"casual",t:"การ์ดต้องสูงกว่านี้นะ! แบบนี้ ๆ ใช่แล้ว เก่งมาก!"},
  {n:"nar",t:"กะทิสอนอยู่ครึ่งชั่วโมงเหมือนคลาสเด็กวันเสาร์ที่ค่าย เด็กคนเล็กสุดไม่ยอมปล่อยมือเธอ"},
  {n:"kati",f:"flustered",l:"casual",t:"ปู่ก็เคยสอนหนูที่ลานแบบนี้แหละค่ะ… วันหนึ่งเด็กพวกนี้อาจมาขึ้นเวทีศึกสี่ภาคก็ได้นะคะ"}]},
 {id:"kati_letter",g:["kati"],ok:G=>rgC(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"กะทิเขียนจดหมายอยู่บนโต๊ะในห้อง เขียนไปลบไป กระดาษหน้าแรกเต็มแล้ว"},
  {n:"kati",f:"happy",l:"casual",t:`ปกติหนูเขียนถึงปู่แล้วเผาวันครบรอบค่ะ แต่ฉบับนี้หนูจะเก็บไว้ก่อน… จะเผาตอนค่ายครบสี่ภาค`},
  {n:"kati",f:"flustered",l:"casual",t:"ตอนนี้ได้ถ้วยแล้ว "+rgC(G)+" ใบ หนูเขียนชื่อทุกคนลงไปหมดเลย …ชื่อผู้จัดการหนูเขียนตัวใหญ่สุดค่ะ ห้ามขอดูนะ!",choice:[
   {t:"สัญญาว่าจะไม่ขอดู",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"happy",l:"casual",t:"สัญญาแล้วนะคะ! …ถ้าอยากรู้จริง ๆ ไว้วันที่เผา หนูจะอ่านให้ฟังค่ะ"}]},
   {t:"แซวว่าตัวใหญ่สุดแปลว่าอะไร",fx:G2=>add(G2,"kati","bond",3),then:[{n:"kati",f:"flustered",l:"casual",t:"ก็…ก็แปลว่าสำคัญไงคะ! ไม่ได้แปลว่าอย่างอื่น! ไปนอนได้แล้วค่ะ!"}]}]}]},
 {id:"mali_garland",g:["mali"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`มะลิขอดอกไม้ที่ร่วงจากต้นหน้าโรงแรม${D.name}มาเต็มกำมือ นั่งร้อยอยู่บนเตียงตั้งแต่สองทุ่ม`},
  {n:"mali",f:"happy",l:"casual",t:"มะลิร้อยเป็นตั้งแต่ห้าขวบค่ะ~ แม่สอน ทำขายหน้าวัดทุกวันพระ"},
  {n:"mali",f:"happy",l:"casual",t:"พวงนี้ของกะทิ พวงนี้ของริน ของพลอย ของฟ้า… แล้วพวงนี้ของผู้จัดการค่ะ แขวนไว้หน้ารถนะคะ จะได้กลับบ้านปลอดภัย",choice:[
   {t:"แขวนไว้หน้ากระจกรถทันที",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"flustered",l:"casual",t:"แขวนจริงด้วย~ …มะลิจะร้อยพวงใหม่ให้ทุกทริปเลยค่ะ"}]},
   {t:"ขอให้สอนร้อยบ้าง",fx:G2=>add(G2,"mali","bond",3),then:[{n:"nar",t:"สิบนาทีผ่านไป พวงมาลัยของผู้จัดการเบี้ยวไปข้างหนึ่ง"},{n:"mali",f:"happy",l:"casual",t:"เบี้ยวแต่น่ารักค่ะ~ มะลิขอเก็บพวงนี้ไว้เองนะ"}]}]}]},
 {id:"mali_sea",g:["mali"],r:"south",bg:"sea",s:(G,D)=>[
  {n:"nar",t:"หัวค่ำ มะลินั่งกอดเข่าอยู่ริมหาดคนเดียว ไม่ได้ยิ้มเหมือนทุกที"},
  {n:"mali",f:"sad",l:"casual",t:"ทะเลตรงนี้เหมือนหน้าบ้านที่ไชยาเลยค่ะ… พ่อชอบพามะลิมานั่งดูเรือหาปลากลับเข้าฝั่ง"},
  {n:"mali",f:"sad",l:"casual",t:"วันนี้มะลิไม่อยากยิ้มค่ะ ขอวันเดียวนะคะ… ไม่ต้องพูดอะไรก็ได้",choice:[
   {t:"นั่งลงข้าง ๆ เงียบ ๆ จนฟ้ามืด",fx:G2=>add(G2,"mali","bond",3),then:[{n:"nar",t:"คลื่นซัดเข้ามาเรื่อย ๆ จนไฟเรือดวงแรกโผล่ที่ขอบฟ้า"},{n:"mali",f:"happy",l:"casual",t:"…ขอบคุณที่ไม่ถามนะคะ พรุ่งนี้มะลิจะยิ้มให้ทุกคนเหมือนเดิมค่ะ~"}]},
   {t:"\"พ่อคงได้เห็นเธอชกแล้วจากตรงไหนสักแห่ง\"",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"sad",l:"casual",t:"…มะลิอยากเชื่อแบบนั้นค่ะ ช่วยพูดอีกครั้งได้ไหมคะ ครั้งเดียว"}]}]}]},
 {id:"mali_cry",g:["mali"],ok:G=>rgB(G)>=2,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"ทุกคนรวมตัวกันที่ห้องพลอย แต่มะลิหายไปนานผิดปกติ ผู้จัดการเจอเธอนั่งอยู่ที่บันไดหนีไฟ ตาแดง"},
  {n:"mali",f:"flustered",l:"casual",t:"อ๊ะ! ไม่ได้ร้องไห้นะคะ~ แค่… ทุกครั้งที่ค่ายชนะ มะลิอยากให้พ่อได้เห็นน่ะค่ะ"},
  {n:"mali",f:"sad",l:"casual",t:"พ่อเคยพูดว่าผู้หญิงชกมวยไม่มีอนาคต… ตอนนี้ค่ายเราได้เข็มขัดมา "+rgB(G)+" เส้นแล้วนะคะ อยากให้พ่อเห็นจัง",choice:[
   {t:"\"อนาคตของเธอเริ่มแล้ว และทุกคนในค่ายเห็นอยู่\"",fx:G2=>add(G2,"mali","bond",3),then:[{n:"mali",f:"happy",l:"casual",t:"…ทุกคนในค่ายเห็นอยู่ค่ะ จริงด้วย~ กลับเข้าไปฉลองกันเถอะ"}]},
   {t:"ยื่นผ้าเช็ดหน้าให้ แล้วนั่งรอจนหายสะอื้น",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"flustered",l:"casual",t:"ผ้าเช็ดหน้าผู้จัดการ มะลิขอยืมก่อนนะคะ ซักแล้วจะคืน… อาจจะไม่คืนก็ได้~"}]}]}]},
 {id:"rin_stars",g:["rin"],bg:"night",s:(G,D)=>[
  {n:"nar",t:"ดาดฟ้าโรงแรม รินนอนหงายบนเก้าอี้ผ้าใบ สมุดดำปิดวางอยู่ข้างตัว"},
  {n:"rin",f:"surprised",l:"casual",t:"…ผู้จัดการ ฉันไม่ได้อู้นะคะ วันนี้ตั้งใจไม่จดอะไรเลย ลองดูว่าจะเป็นยังไง"},
  {n:"rin",f:"happy",l:"casual",t:`ดาวที่${D.name}เห็นชัดกว่าเชียงใหม่ประมาณ… ไม่สิ ไม่นับ คืนนี้ไม่นับ`,choice:[
   {t:"นอนลงเก้าอี้ข้าง ๆ แล้วไม่นับอะไรด้วยกัน",fx:G2=>add(G2,"rin","bond",3),then:[{n:"nar",t:"ผ่านไปยี่สิบนาที รินไม่พูดตัวเลขสักตัวเดียว"},{n:"rin",f:"flustered",l:"casual",t:"…นี่เป็นยี่สิบนาทีที่ฉันจำได้ดีที่สุดในทริปนี้ค่ะ ตัวเลขนี้ขอนับนะคะ"}]},
   {t:"ถามว่ารู้สึกยังไงที่ไม่ได้จด",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"happy",l:"casual",t:"แปลก ๆ ค่ะ เหมือนลืมใส่แว่น …แต่เห็นอะไรบางอย่างชัดขึ้น"}]}]}]},
 {id:"rin_laugh",g:["rin"],ok:G=>rgB(G)>=3,bg:"hotel_room",s:(G,D)=>[
  {n:"rin",f:"happy",l:"casual",t:"ผู้จัดการคะ ขอให้ดูสถิติชุดหนึ่งค่ะ ฉันเก็บมาตั้งแต่ทริปแรก"},
  {n:"nar",t:"หน้าสมุดดำเขียนหัวข้อว่า \"จำนวนครั้งที่ทุกคนหัวเราะในรถ\" แต่ละทริปมีขีดนับเรียงกันยาวขึ้นเรื่อย ๆ"},
  {n:"rin",f:"flustered",l:"casual",t:"ทริปแรกสิบสองครั้งค่ะ ทริปล่าสุดสี่สิบเอ็ด ฟ้าคนเดียวนับไปสิบเก้า …ไม่มีประโยชน์ทางมวยเลย แต่ฉันอยากเก็บไว้",choice:[
   {t:"\"เป็นสถิติที่ดีที่สุดในสมุดเล่มนี้\"",fx:G2=>add(G2,"rin","bond",3),then:[{n:"rin",f:"flustered",l:"casual",t:"…ฉันก็คิดแบบนั้นค่ะ แต่ไม่คิดว่าจะมีคนเห็นด้วย"}]},
   {t:"ถามว่าตัวเองหัวเราะกี่ครั้ง",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"pout",l:"casual",t:"ไม่ได้นับตัวเองค่ะ …ก็ได้ นับ เจ็ดครั้ง ห้าครั้งเพราะผู้จัดการ พอใจหรือยังคะ"}]}]}]},
 {id:"rin_dad",g:["rin"],ok:G=>rgC(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"รินจ้องโทรศัพท์นิ่งอยู่นาน หน้าจอเป็นข้อความจากพ่อ"},
  {n:"rin",f:"surprised",l:"casual",t:"พ่อส่งข่าวถ้วยแชมป์ภาคมาให้ค่ะ… พ่อตามข่าวมวยด้วยเหรอ ฉันไม่เคยรู้เลย"},
  {n:"rin",f:"sad",l:"casual",t:"ท้ายข้อความเขียนว่า \"พ่อเข้าใจแล้วว่าทำไมลูกไม่เรียนเอก\" …ผู้จัดการคะ ฉันควรตอบว่าอะไรดี",choice:[
   {t:"\"ตอบแค่ว่าขอบคุณ แล้วชวนพ่อมาดูไฟต์\"",fx:G2=>add(G2,"rin","bond",3),then:[{n:"nar",t:"รินพิมพ์ ลบ แล้วพิมพ์ใหม่สามรอบ ก่อนกดส่ง"},{n:"rin",f:"happy",l:"casual",t:"ส่งแล้วค่ะ …พ่ออ่านแล้ว พ่อกำลังพิมพ์อยู่"}]},
   {t:"\"ไม่ต้องรีบตอบ เก็บความรู้สึกนี้ไว้ก่อนก็ได้\"",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"happy",l:"casual",t:"ค่ะ ฉันจะเก็บไว้ก่อน …อ่านซ้ำอีกสักสิบรอบ"}]}]}]},
 {id:"ploy_knee",g:["ploy"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"เที่ยงคืน ผู้จัดการลงไปซื้อน้ำ เจอพลอยนั่งประคบน้ำแข็งที่เข่าอยู่คนเดียวหน้าตู้กดน้ำ"},
  {n:"ploy",f:"surprised",l:"casual",t:"…อย่าบอกน้อง ๆ นะ แค่ตึงนิดหน่อย ไม่ได้เป็นอะไร"},
  {n:"ploy",f:"sad",l:"casual",t:"เมื่อก่อนเข่านี้คือทุกอย่างที่ฉันมี ถ้ามันไม่กลับมาก็ไม่เหลืออะไร …แต่ช่วงนี้ฉันไม่ค่อยคิดแบบนั้นแล้ว",choice:[
   {t:"ถือถุงน้ำแข็งประคบให้แทน",fx:G2=>add(G2,"ploy","bond",3),then:[{n:"ploy",f:"flustered",l:"casual",t:"…ไม่ต้องก็ได้ ฉันทำเองได้ …ก็ได้ ห้านาที"}]},
   {t:"\"ตอนนี้เธอมีมากกว่าเข่าแล้ว\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"happy",l:"casual",t:"มีน้อง ๆ ที่เสียงดังทั้งคืน มีผู้จัดการที่ชอบลงมาซื้อน้ำเที่ยงคืน …ใช่ มีมากกว่าเข่าแล้ว"}]}]}]},
 {id:"ploy_tea",g:["ploy"],r:"isan",bg:"night_isan",s:(G,D)=>[
  {n:"nar",t:"พลอยเปิดกระติกชาที่แม่ฝากมาจากโคราช รินชาอู่หลงใส่แก้วกระดาษเรียงแถวบนโต๊ะ"},
  {n:"ploy",f:"happy",l:"casual",t:"แม่ชงให้ค่ะ… แม่ชงฝากมาให้ทุกคน บอกว่าดื่มก่อนนอนจะหลับสบาย"},
  {n:"ploy",f:"sad",l:"casual",t:"แม่เลิกมาดูฉันชกตั้งแต่ปีที่สอง ใจไม่ไหว …แต่ชงชาฝากมาทุกครั้งที่รู้ว่าฉันขึ้นอีสาน",choice:[
   {t:"ดื่มชาจนหมดแก้วแล้วขอแก้วที่สอง",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"happy",l:"casual",t:"เดี๋ยวฉันจะบอกแม่ว่ามีคนขอแก้วที่สอง แม่ต้องดีใจกว่าฉันชนะอีก"}]},
   {t:"\"วันหนึ่งพาแม่มาดูไฟต์ที่ไม่น่ากลัวสักไฟต์\"",fx:G2=>add(G2,"ploy","bond",3),then:[{n:"ploy",f:"flustered",l:"casual",t:"…ไฟต์ที่ไม่น่ากลัว มีด้วยเหรอ ถ้ามี ฉันอยากให้แม่นั่งข้างผู้จัดการ"}]}]}]},
 {id:"ploy_carry",g:["ploy","fah"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"ดูหนังในห้องรวมได้ครึ่งเรื่อง ฟ้าหลับคาไหล่พลอยไปแล้ว ขนมยังคามือ"},
  {n:"ploy",f:"happy",l:"casual",t:"ชู่… อุ้มไปส่งห้องเองดีกว่า ปลุกตอนนี้จะโวยวายทั้งชั้น"},
  {n:"nar",t:"พลอยอุ้มฟ้าเดินไปตามทางเดิน ฟ้าละเมอเบา ๆ"},
  {n:"fah",f:"flustered",l:"casual",t:"…พี่พลอย… ฟ้าไม่ได้หลับนะ… แค่พักตา…"},
  {n:"ploy",f:"happy",l:"casual",t:"จ้ะ ๆ ไม่ได้หลับ …ผู้จัดการ เปิดประตูให้หน่อย เดี๋ยวพี่ห่มผ้าให้แล้วตามไป",choice:[
   {t:"เปิดประตูแล้วถือขนมที่หล่นตามไปให้",fx:G2=>{add(G2,"ploy","bond",2);add(G2,"fah","bond",2);},then:[{n:"nar",t:"เช้ามา ฟ้ายืนยันกับทุกคนว่าเดินกลับห้องเอง"}]},
   {t:"ถ่ายรูปไว้เป็นหลักฐาน",fx:G2=>{add(G2,"ploy","bond",1);add(G2,"fah","bond",2);},then:[{n:"nar",t:"เช้ามา ฟ้าเห็นรูปแล้วไล่ผู้จัดการรอบลานจอดรถ"},{n:"fah",f:"pout",l:"casual",t:"ลบเดี๋ยวนี้นะนาย!! …ส่งให้ฟ้าก่อนแล้วค่อยลบ!"}]}]}]},
 {id:"fah_storm",g:["fah"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`ตีสอง พายุเข้า${D.name} ฟ้าผ่าดังสนั่นจนกระจกสั่น แล้วไฟดับทั้งโรงแรม`},
  {n:"nar",t:"เสียงเคาะประตูห้องฟ้า ทีละคน กะทิ มะลิ ริน พลอย ถือหมอนกันมาคนละใบ"},
  {n:"fah",f:"pout",l:"casual",t:"มาทำอะไรกันหมดเนี่ย! …กลัวฟ้าร้องกันเหรอ งั้นก็ได้ นอนห้องฟ้าก็ได้ ฟ้าจะเฝ้าให้"},
  {n:"nar",t:"ไม่มีใครพูดว่ารู้ว่าฟ้ากลัวฟ้าร้องมาตั้งแต่เด็ก ทุกคนแค่นอนเบียดกันบนเตียงสองเตียงจนพายุผ่านไป"},
  {n:"fah",f:"flustered",l:"casual",t:"…นาย ยืนอยู่หน้าประตูทำไม เข้ามาสิ ไม่ได้ชวนนะ แค่ไฟดับ ทางเดินมืด",choice:[
   {t:"นั่งพิงประตูอยู่ในห้องจนเช้า",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"…ขอบใจ ครั้งเดียวนะ ห้ามเล่าให้ใครฟัง"}]},
   {t:"เล่าเรื่องผีให้ทุกคนฟัง",fx:G2=>add(G2,"fah","bond",1),then:[{n:"fah",f:"angry",l:"casual",t:"นายยยย!! …เล่าต่อ ฟ้าไม่ได้กลัว ฟ้าแค่จับแขนนายไว้เฉย ๆ"}]}]}]},
 {id:"fah_laundry",g:["fah"],ok:G=>rgB(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"เช้ามา ชุดซ้อมของทุกคนพับเรียบวางอยู่หน้าประตูห้อง หอมกลิ่นน้ำยาปรับผ้านุ่ม"},
  {n:"mali",f:"surprised",l:"casual",t:"ใครซักให้คะเนี่ย~ มะลิไม่ได้ทำนะ"},
  {n:"fah",f:"pout",l:"casual",t:"ไม่ใช่ฟ้า! ฟ้าตื่นสาย นอนอยู่ทั้งคืน!"},
  {n:"nar",t:"ปลายนิ้วของฟ้ายังย่นจากน้ำ ใบเสร็จเครื่องซักผ้าหยอดเหรียญโผล่อยู่ในกระเป๋าแจ็กเก็ตเสือ",choice:[
   {t:"แกล้งเชื่อ แล้วขอบคุณคนที่ซักให้ลอย ๆ",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"…คนที่ซักคงดีใจมั้ง ไม่รู้สิ ฟ้าไม่ได้ซักนะ!"}]},
   {t:"หยิบใบเสร็จขึ้นมาโชว์",fx:G2=>add(G2,"fah","bond",1),then:[{n:"fah",f:"angry",l:"casual",t:"เอาคืนมา!! …ก็ได้ ฟ้าซักเอง ยายสอนว่าอยู่บ้านใครต้องช่วยกัน พอใจยัง!"}]}]}]},
 {id:"fah_style",g:["fah"],ok:G=>rgB(G)>=4,bg:"night",s:(G,D)=>[
  {n:"nar",t:"กลางวันในรถ ทุกคนคุยกันเรื่องมวยบ้านเกิด กะทิกับท่าเสา มะลิกับไชยา พลอยกับโคราช รินกับลพบุรี คืนนั้นฟ้าเงียบผิดปกติ"},
  {n:"fah",f:"pout",l:"casual",t:"ทุกคนมีสายมวยบ้านเกิดกันหมด ฟ้าไม่มี ฟ้าชกจากเวทีจริงล้วน ๆ …ไม่ได้น้อยใจนะ แค่พูดเฉย ๆ"},
  {n:"fah",f:"sad",l:"casual",t:"ฟ้าเป็นมวยสายไหนกันแน่ นาย",choice:[
   {t:"\"สายค่ายศิริชัย เธอเป็นคนแรกของสายนี้\"",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"…คนแรกของสาย ฟังดูเท่ดีนะ ฟ้าเอาชื่อนี้แหละ ห้ามเปลี่ยน"}]},
   {t:"\"สายที่ไม่ต้องมีใครเหมือน\"",fx:G2=>add(G2,"fah","bond",2),then:[{n:"fah",f:"happy",l:"casual",t:"ไม่ต้องมีใครเหมือน… ใช่ ฟ้าไม่เหมือนใครอยู่แล้ว! พูดถูกครั้งหนึ่งนะนาย"}]}]}]},
 {id:"duo_kati_mali",g:["kati","mali"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`กะทิกับมะลิแอบลงไปซื้อของกินที่ร้านสะดวกซื้อตอนห้าทุ่ม กลับมาพร้อมถุงใหญ่สองถุง`},
  {n:"kati",f:"happy",l:"casual",t:"ผู้จัดการ! ห้ามบอกครูแดงนะคะ มีส่วนของผู้จัดการด้วย"},
  {n:"mali",f:"happy",l:"casual",t:`ของฝากประจำ${D.name}แบบที่ร้านสะดวกซื้อเท่านั้นที่มีค่ะ~ มะลิเลือกเอง`},
  {n:"nar",t:"ห้านาทีต่อมา ห้องเต็มไปด้วยเสียงหัวเราะกับเศษขนม ประตูห้องข้าง ๆ เคาะเตือนสองครั้ง",choice:[
   {t:"นั่งกินด้วยกันจนหมดถุง",fx:G2=>{add(G2,"kati","bond",2);add(G2,"mali","bond",2);},then:[{n:"kati",f:"happy",l:"casual",t:"นี่แหละค่ะรสชาติของการเดินทาง!"}]},
   {t:"แกล้งทำเสียงครูแดงหน้าประตู",fx:G2=>{add(G2,"kati","bond",1);add(G2,"mali","bond",1);},then:[{n:"nar",t:"กะทิกับมะลิมุดเข้าผ้าห่มพร้อมกัน ถุงขนมหายไปใต้เตียงในหนึ่งวินาที"},{n:"mali",f:"pout",l:"casual",t:"ผู้จัดการใจร้ายค่ะ~!"}]}]}]},
 {id:"duo_rin_ploy",g:["rin","ploy"],ok:G=>rgB(G)>=2,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"ห้องรินยังเปิดไฟ รินกับพลอยนั่งดูเทปไฟต์คืนนี้ด้วยกันบนแล็ปท็อป"},
  {n:"ploy",f:"happy",l:"casual",t:"ตอนอยู่พยัคฆ์ทอง เราก็นั่งดูเทปแบบนี้ทุกคืน จำได้ไหม"},
  {n:"rin",f:"sad",l:"casual",t:"จำได้ค่ะ …ฉันลาออกโดยไม่ได้บอกลาเธอ ฉันยังไม่เคยขอโทษเรื่องนั้นเลย"},
  {n:"ploy",f:"happy",l:"casual",t:"เธอคิดถูกที่ออกมา ฉันแค่ออกมาช้ากว่าเธอหน่อย …เอ้า เล่นต่อ ยกสองตรงนี้ฉันการ์ดตกใช่ไหม",choice:[
   {t:"ยกเก้าอี้มานั่งดูเทปด้วย",fx:G2=>{add(G2,"rin","bond",2);add(G2,"ploy","bond",2);},then:[{n:"rin",f:"happy",l:"casual",t:"สามคนดูดีกว่าสองคนค่ะ ตามสถิติ …ฉันเพิ่งตั้งสถิตินี้เมื่อกี้"}]},
   {t:"ปิดประตูให้เงียบ ๆ ปล่อยให้สองคนคุยกัน",fx:G2=>{add(G2,"rin","bond",1);add(G2,"ploy","bond",1);},then:[{n:"nar",t:"เสียงหัวเราะของสองคนดังลอดประตูออกมาเป็นระยะจนดึก"}]}]}]},
 {id:"duo_fah_kati",g:["fah","kati"],bg:"night",s:(G,D)=>[
  {n:"fah",f:"happy",l:"casual",t:"กะทิ! แข่งวิ่งไปร้านสะดวกซื้อหัวมุม ใครแพ้เลี้ยงไอติม!"},
  {n:"kati",f:"happy",l:"casual",t:"รับค่ะ! ผู้จัดการเป็นกรรมการนะคะ!"},
  {n:"nar",t:"สองคนออกตัวพร้อมกัน ฟ้าแซงตอนโค้งสุดท้าย กะทิกระโดดแตะประตูร้านก่อนครึ่งก้าว"},
  {n:"fah",f:"pout",l:"casual",t:"ไม่นับ! กะทิกระโดด! นาย ตัดสินใหม่!",choice:[
   {t:"ให้กะทิชนะ",fx:G2=>{add(G2,"kati","bond",2);add(G2,"fah","bond",1);},then:[{n:"fah",f:"pout",l:"casual",t:"…ก็ได้ ฟ้าเลี้ยง แต่ฟ้าเลือกรสเอง!"},{n:"kati",f:"happy",l:"casual",t:"ไอติมที่ชนะมาอร่อยกว่าทุกแท่งเลยค่ะ!"}]},
   {t:"ตัดสินว่าเสมอ แล้วเลี้ยงเองทั้งคู่",fx:G2=>{add(G2,"kati","bond",2);add(G2,"fah","bond",2);},then:[{n:"fah",f:"flustered",l:"casual",t:"…เสมอก็ได้ ครั้งหน้าฟ้าชนะขาด! ไอติมนายก็อร่อยดีนะ"}]}]}]}];
function rgWarmPick(G,T){const R=G.region,D=ROAD_DEST[T.dest];if(!R||!D)return null;const seen=R.warm=R.warm||{},P=T.party||[];
  const here=id=>P.includes(id)&&G.F[id]&&G.F[id].camp==="player";
  const L=RG_WARM.filter(w=>!seen[w.id]&&w.g.every(here)&&(!w.r||w.r===D.r)&&(!w.ok||w.ok(G)));if(!L.length)return null;
  const w=L[Math.floor(Math.random()*L.length)];return w;}
function rgMsQ(G,q){const R=G.region;R.ms=R.ms||{};if(R.ms[q.k])return;R.ms[q.k]=1;(R.msQ=R.msQ||[]).push(q);}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}rgApply(G);const now=gameWeek(G);if(lbWeek(G,done))return;
    /* v1.91.122 (Man): the five celebrate the camp's milestones back home, one a week */
    if(R.msQ&&R.msQ.length){const q=R.msQ.shift(),S=rgMsSteps(G,q);if(S){playScene(S,()=>{save();done();},{bg:RG_MSL[q.k].bg,look:"casual"});return;}}
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
    /* v1.91.47 (playtest): a camp that reaches the closing ceremony on the time limit with only one or two cups still gets Krerk's dinner and Pailin's tablet first — the ceremony and the reveal lean on them */
    if(this.closeDue(G)&&!R.c2){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)&&!R.c3){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)){this.openFinal(G);this.playClose(()=>{this.blackCard(G);save();done();});return;} /* v1.91.20 round 11 */
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
  book(G,dest,fid,now){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"ข้อมูลไม่ครบ"};
    if(R.trip)return {ok:false,why:"มีทริปที่นัดไว้แล้ว"};const local=!!(R.belts[D.r]||{})[dest];
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว"};if(now&&wk!==G.week)return {ok:false,why:`สัปดาห์นี้ยังออกเดินทางไม่ได้ · ไปได้สัปดาห์ ${wk}`};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name}ไม่พร้อมเดินทาง`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"เงินไม่พอค่าเดินทาง"};
    const opp=local?this.localOpp(G,dest,me,abs,1):this.makeOpp(G,dest,me,abs),pay=local?this.localPurse(G,1):this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:local?{r:D.r,dest,local:1,lr:1}:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat,quick:this.canQuick(G,dest)&&!!R.quickPref,party:this.party(G,fid),noCoach:roadCoachAvail(G)&&!roadCoachIn(G),local:local?1:0};UI.rgNoCoach=false;
    G.log=G.log||[];G.log.push(`วางแผนเดินทางไป${D.name} สัปดาห์ ${wk} · ค่าเดินทาง ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  /* v1.91.76 (Man): the travelling party — the fighter always, then whoever the player picked, capped by the vehicle's seats */
  pairDue(G,dest){const R=G.region,D=ROAD_DEST[dest];if(!R||!D)return null;const tx=R.tx||{},dfr=R.txDefer||{};
    const ds=[dest,...Object.keys(dfr).filter(d=>dfr[d]&&ROAD_DEST[d]&&ROAD_DEST[d].r===D.r)];for(const d of ds)if(RG_PAIR[d]&&RG_TRIPX[d]&&!tx[d]&&rgIn(G,RG_PAIR[d]))return RG_PAIR[d];return null;},
  party(G,fid){const max=roadSeats(G),pick=(UI.rgParty||[]).filter(id=>id!==fid&&G.F[id]&&G.F[id].camp==="player");return [fid,...pick].slice(0,Math.max(max,1));},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(R)rgApply(G);if(R&&R.joined)this.joinSkills(G);if(R)this.bondSync(G);if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(rg.nlfinal){if(R.final){R.final.cur=R.final.cur||{};R.final.cur[rg.nlfinal]=p.res||"L";}continue;}if(rg.nlleg){this.legResult(G,rg.nlleg,p);continue;}if(rg.side)continue;if(!D||!RG[r])continue;
      if(rg.series){this.lbAdd(G,p.a,"rc:"+r,p.res,p.stop);this.seriesResult(G,r,p);continue;}
      if(rg.local){const T=R.trip,abs=T&&T.abs!=null?T.abs:gameWeek(G);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);continue;} /* v1.91.93: the local ring pays a purse, no belt */
      this.lbAdd(G,p.a,"pc:"+dest,p.res,p.stop);
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""}คว้าเข็มขัดจังหวัด${D.name}!`);if(G.F[p.a])recordHonor(G,"rgbelt",p.a,G.F[p.a].div,G.week,dest,G.F[p.b]?G.F[p.b].name:this.oppName(G,dest),p.b);rgMsQ(G,{k:"belt1",id:p.a,dest}); /* v1.91.14 (Man): a province belt gets the same ceremony as the main game */
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){rgMsQ(G,{k:"ticket",r});R.champ[r].state="letter";this.champFighter(G,r);
          rgOrg(G,r,`${RG_TITLE[r]}: ครบสี่เข็มขัดแล้ว`,`เรียน ผู้จัดการค่ายศิริชัย\n\nค่ายของท่านครบสี่เข็มขัดของ${RG[r].name}แล้ว ${RG[r].champ} แชมป์${RG[r].name} ขอท้าชิงแชมป์ภาค ชนะ 2 ใน 3 นัด ผู้จัดออกค่าเดินทาง\n\nเลือกนักมวยได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค`+((t=>t?`\n\n(${t})`:"")(this.tipText(G,r))));rgSay(G,r,`${RG_TITLE[r]}: ครบสี่เข็มขัดแล้ว`,RG_CH[r].letter);}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;rgSay(G,r,`จดหมายจาก${RG[r].champ}`,RG_POST[r]);}
      const cid=RG_CID0[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&((R.joined&&R.joined[cid])||c.visit==="done"||c.state==="won"||rgEd(G)>=2);G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID0[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;rgSay(G,r,`จดหมายจาก${RG[r].champ}`,RG_MISS[r]);}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;rgApply(G);this.lbWeek(G);this.flush(G);this.legendMail(G);this.seriesWeekly(G);this.fade(G);this.letters(G);this.finalWeekly(G);this.joinWeekly(G);this.joinPerks(G);this.loopWeekly(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+RG_TRIP_GAP);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&(G.F[id].rg||G.F[id].rgLocal))delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  /* v1.91.93 (Man): the local ring — a one-night knockout of up to three local fighters (random names, generic sprites), each a little better, purse per win, a small honour for the night's champion */
  localOpp(G,dest,me,abs,k){const id=`rgl_${dest}_${abs}_${k}`;if(G.F[id])return id;const rng=mulberry32((G.seed||1)+stableHash(id)),T=21.0+.45*(k-1);
    const nm=rgNm({f:Math.floor(rng()*997),k:Math.floor(rng()*97),p:Math.floor(rng()*3)},dest);
    const f=baseFighter(id,mkNPC(id,nm,"X",Math.min(18,Math.round(T-2)),rng,Math.floor(rng()*9)));liftOpponent(f,T,20);
    f.camp="quest";f.div="X";f.rgLocal=1;f.lvl=Math.max(1,(me.lvl||1)-2+k);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;},
  localPurse(G,k){const w=Math.round(2500*k*(1+Math.min(G.rep||0,50)/100)/100)*100;return {win:w,lose:500};},
  localRun(b,T,cb){const D=ROAD_DEST[T.dest],k=(b.region&&b.region.lr)||1,RND=["รอบแรก","รอบรองชนะเลิศ","รอบชิงชนะเลิศ"];
    openFight(b,()=>{const R=G.region,L=R.lastRes,res=L&&L.bid===b.id?L.res:null,me=G.F[b.a],bg=b.bg?b.bg.replace(/\.webp$/,"").replace(/^bg_/,""):"camp";
      if(res==="W"&&k<3&&me&&!(me.injury>0)){const opp=this.localOpp(G,T.dest,me,T.abs,k+1),pay=this.localPurse(G,k+1),b2={...b,id:`${b.id}_r${k+1}`,b:opp,win:pay.win,lose:pay.lose,region:{...b.region,lr:k+1}};G.bookings.push(b2);save();
        playScene([{n:"nar",t:`ชนะ${RND[k-1]}! โฆษกเวที${D.name}ประกาศชื่อ${me.name}เข้า${RND[k]}`},{n:"nar",t:`พักสิบห้านาที คู่ต่อไป ${G.F[opp].name} ${k===1?"ชนะรอบแรกมาเหมือนกัน":"เต็งหนึ่งของเวทีคืนนี้"} · รางวัลรอบนี้ ${fmt(pay.win)}`}],()=>this.localRun(b2,T,cb),{bg,look:"fight"});return;}
      const champ=res==="W"&&k===3;
      if(champ){G.rep=(G.rep||0)+1;R.localWins=R.localWins||{};R.localWins[T.dest]=(R.localWins[T.dest]||0)+1;G.log=G.log||[];G.log.push(`${me?me.name:""}คว้าแชมป์ศึกเวทีท้องถิ่น${D.name} ชนะสามไฟต์รวด · ชื่อเสียง +1`);save();}
      playScene([{n:"nar",t:champ?`${me.name}ชนะสามไฟต์รวด! คว้าแชมป์ศึกเวทีท้องถิ่น${D.name} คนดูโยนพวงมาลัยขึ้นเวที · ชื่อเสียง +1`:
        res==="W"?`${me.name}ชนะ${RND[k-1]} แต่เจ็บจนครูสั่งพอแค่นี้ เก็บเงินรางวัลกลับโรงแรม`:`${me.name}ตกรอบใน${RND[k-1]} ได้ค่าขึ้นเวทีกับเสียงปรบมือจากคนท้องถิ่น`}],cb,{bg,look:"fight"});});},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;rgDress(G.F[b.b]);
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    /* v1.91.50 (playtest): a quick trip to a region you know — no drive, no hotel menu, no shop; the nights are rest */
    const fight=(cb)=>T.local?this.localRun(b,T,cb):openFight(b,cb);
    if(T.quick&&this.canQuick(G,dest)){this.arrive(G,T,P,null);fight(()=>{const n=P.nights||0;if(n){for(const f of roadRiders(G))f.fatigue=Math.max(0,(f.fatigue||0)-10*n);}
      G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[dest].name}${n?` · พักที่โรงแรม ${n} คืน ความล้า −${10*n}`:""}`);save();done();});return;}
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);const go=()=>this.hotel(b,T,()=>fight(()=>this.night(T,P2||P,1,done))),A=this.firstArrive(G,ROAD_DEST[dest].r,dest),Bp=this.provArrive(G,dest,!!A);T.fa=A?1:0;
      const goB=()=>Bp?playScene(Bp,go,{bg:RG_RBG[ROAD_DEST[dest].r],look:"casual"}):go();
      if(A){playScene(A,goB,{bg:"gas_station",look:"casual"});}else goB();}});},
  /* v1.91.121 (Man): off-schedule fight — the call, the choice to go, then bout after bout */
  sideRun(T,X,done){const R=G.region,r=ROAD_DEST[T.dest].r,S=R.side[r];S.triedAbs=T.abs;rgTouch(G,X.cid);
    let go=0;playScene([...X.intro(G),{n:"nar",t:"จะทำยังไงดี?",choice:[{t:X.go,fx:()=>{go=1;}},{t:X.no,then:X.noT(G)}]}],()=>{
      if(!go){save();done();return;}
      playScene(X.arrive(G),()=>this.sideBout(T,X,0,done),{bg:X.bg,look:"casual"});},{bg:this.hotelBg[r],look:"casual"});},
  sideBout(T,X,i,done){const R=G.region,r=ROAD_DEST[T.dest].r,S=R.side[r],N=X.foes.length,F=X.foes[i],K=QK[F.qk];
    const P=T.party||null,riders=roster(G).filter(f=>(!P||P.includes(f.id))&&!(f.injury>=3)).sort((a,b)=>(a.fatigue||0)-(b.fatigue||0));
    const fin=(won)=>{if(won){S.won=1;R.sideN=(R.sideN||0)+1;G.rep=(G.rep||0)+1;G.log=G.log||[];G.log.push(`${X.title} · ชนะครบ ${N} คู่ · ชื่อเสียง +1`);}
      playScene(won?X.win(G):X.lose(G),()=>{if(won&&X.done)X.done(G,S.how);save();done();},{bg:X.bg,look:"casual"});};
    if(!riders.length){fin(false);return;}
    let pick=null;
    playScene([{n:"npc",who:K.name,t:F.t},{n:"nar",t:`ไฟต์นอกตาราง คู่ที่ ${i+1}/${N} · ส่งใครขึ้นชก?`,choice:[
      ...riders.slice(0,4).map(f=>({t:`ส่ง${f.name} (ล้า ${Math.round(f.fatigue||0)})`,fx:()=>{pick=f.id;}})),
      {t:"ถอยก่อน ค่อยมาใหม่",then:[{n:"nar",t:"ค่ายถอยกลับขึ้นรถ เสียงหัวเราะของนักเลงไล่หลังมา"}]}]}],()=>{
      if(!pick){fin(false);return;}
      const me=G.F[pick],inj=me.injury||0,opp=makeQ(G,F.qk,pick,`side_${r}_${T.abs}_${i}`);
      const b={id:`rgs${T.abs}_${r}_${i}`,a:pick,b:opp,week:G.week,tier:"quest",rounds:3,win:0,lose:0,region:{r,side:1},bg:X.ring,title:X.title};
      openFight(b,()=>{me.injury=inj;const L=R.lastRes,res=L&&L.bid===b.id?L.res:null;save();
        if(res!=="W"){fin(false);return;}
        if(i+1>=N){fin(true);return;}
        playScene([{n:"nar",t:`${me.name}ชนะ! ${(X.between||[])[i]||""}`}],()=>this.sideBout(T,X,i+1,done),{bg:X.bg,look:"casual"});});},{bg:X.bg,look:"casual"});},
  /* v1.91.114 (Man): the champion meets the camp the first time it reaches each of her belt provinces (after her first-arrival scene, only the province part) */
  provArrive(G,dest,after){const R=G.region,D=ROAD_DEST[dest];if(!R||!D||!RG_PROV[dest])return null;R.provMet=R.provMet||{};if(R.provMet[dest])return null;
    const cid=RG_CID[D.r];if(R.joined&&R.joined[cid])return null;R.provMet[dest]=1;rgTouch(G,cid);const S=RG_PROV[dest](G,D);return after?S.body:[...S.meet,...S.body];},
  /* v1.91.76 (Man): drive → hotel → "head for the ring" → the bout */
  hotel(b,T,go,again){const D=ROAD_DEST[T.dest],me=G.F[b.a],op=G.F[b.b];if(!me||!op){go();return;}
    const girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b2)=>(b2.bond||0)-(a.bond||0)),menu=this.hotelMenu(T,D,girls,1,true);
    const intro=again?[]:[{n:"nar",t:`เช็กอินโรงแรมใน${D.name} ทุกคนวางกระเป๋า ${me.name}นั่งพันมืออยู่ปลายเตียงเงียบ ๆ`},
      T.local?{n:"nar",t:`ทริปนี้มาเที่ยว แต่คืนนี้เวทีท้องถิ่น${D.name}จัดศึกน็อกเอาต์ คนท้องถิ่นแปดคน ใครชนะสามไฟต์รวดคือแชมป์ประจำคืน ${me.name}ลงชื่อไว้แล้ว`}:
      roadCoachIn(G)?{n:"coach",t:`คืนนี้${op.name} แชมป์ประจำจังหวัด ชกต่อหน้าคนบ้านเขา อย่าตื่นเสียงเชียร์`}:{n:"nar",t:`คืนนี้${op.name} แชมป์ประจำจังหวัด ชกต่อหน้าคนบ้านเขา ครูแดงโทรมาสั้น ๆ ว่าอย่าตื่นเสียงเชียร์`}];
    playScene([...intro,{n:"nar",t:"ยังมีเวลาก่อนขึ้นชก ทำอะไรดี?",choice:menu}],()=>{save();
      if(T.goShop){T.goShop=0;this.shop(T,()=>this.hotel(b,T,go,1),1,1);return;}
      if(T.menuBack){T.menuBack=0;this.hotel(b,T,go,1);return;}
      T.goRing=0;playScene([{n:"nar",t:"เสียงปี่ชวาจากเวทีดังมาถึงหน้าโรงแรม ทุกคนคว้ากระเป๋าแล้วออกเดินทางไปเวที"}],()=>go(),{bg:"hotel_room",look:"casual"});},{bg:"hotel_room",look:"casual"});},
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
    /* v1.91.121 (Man): her trouble comes first — the off-schedule fight takes the first night */
    if(n===1&&!T.sideSeen){const X=rgSideDue(G,T);if(X){T.sideSeen=1;this.sideRun(T,X,()=>this.night(T,P,n,done));return;}}
    {const tx=G.region.tx=G.region.tx||{},dfr=G.region.txDefer=G.region.txDefer||{};
      /* v1.91.78 (Man): a province's pair scene waits until her girl rides along — on this trip or a later one in the same region */
      const ready=d=>RG_TRIPX[d]&&!tx[d]&&(!RG_PAIR[d]||rgInT(G,RG_PAIR[d])||!rgIn(G,RG_PAIR[d]));
      let key=null;if(n===1&&!T.series){if(RG_TRIPX[T.dest]&&!tx[T.dest]){if(ready(T.dest))key=T.dest;else dfr[T.dest]=1;}
        if(!key)key=Object.keys(dfr).find(d=>dfr[d]&&ROAD_DEST[d]&&ROAD_DEST[d].r===r&&ready(d))||null;}
      if(key){const X=RG_TRIPX[key];tx[key]=1;delete dfr[key];rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`ไฟต์ที่${D.name}จบแล้ว ทุกคนยืนรออยู่ข้างรถ`,choice:[
          {t:"กลับค่ายเลย",then:[{n:"nar",t:"รถเลี้ยวออกจากเมือง ทุกคนหลับกันตั้งแต่ยังไม่พ้นเขตจังหวัด"}]},
          {t:`อยู่เที่ยวต่ออีก 1 คืน (ค่าห้อง ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("เงินไม่พอค่าห้อง กลับค่ายกันก่อน");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    /* v1.91.122 (Man): a quiet moment with the camp's own girls — at most one a trip, each moment once */
    if(!T.backShop&&!T.warmed&&Math.random()<(G.region.warmP!=null?G.region.warmP:.55)){T.warmed=1;const w=rgWarmPick(G,T);if(w){G.region.warm[w.id]=1;save();
      playScene(w.s(G,D),()=>this.night(T,P,n,done),{bg:w.bg==="night"?this.hotelBg[r]:w.bg,look:"casual"});return;}}
    const girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0));
    const choice=this.hotelMenu(T,D,girls,n,false);
    const oddL=RG_ODD[r]||[],oddOn=!T.backShop&&oddL.length&&girls.length&&Math.random()<.4,odd=oddOn?oddL[Math.floor(Math.random()*oddL.length)]:null,og=girls.length?girls[Math.floor(Math.random()*girls.length)]:null,
      oddStep=odd&&og?[{inject:G2=>{const X=RG_ODD_FX[odd.fx]||RG_ODD_FX.none;X[1](G2);return [{n:"nar",t:odd.t.replace(/\{g\}/g,og.name)+(X[0]?` · ${X[0]}`:"")}];}}]:[];
    const back=T.backShop;T.backShop=0;
    playScene([...(back?[]:[{n:"nar",t:nights>1?`คืนที่ ${n} ที่${D.name}`:`คืนนี้ทั้งค่ายพักที่${D.name}`}]),...oddStep,{n:"nar",t:"คืนนี้ทำอะไรดี?",choice}],()=>{
      /* v1.91.78 (Man): the hotel souvenir shop — buy as many as you like, the night is still yours */
      if(T.goShop){T.goShop=0;this.shop(T,()=>{T.backShop=1;this.night(T,P,n,done);},1,1);return;}
      if(T.menuBack){T.menuBack=0;T.backShop=1;this.night(T,P,n,done);return;}this.night(T,P,n+1,done);},{bg:this.hotelBg[r],look:"casual"});},
  /* v1.91.82 (Man): the hotel menu in layers — go out ▸ pick who · go out with the champion · rest at the hotel · souvenirs · (before the bout) straight to the ring */
  hotelMenu(T,D,girls,n,pre){const r=D.r,cid=this.champId[r],C=RG[r],top=girls[0],back={t:"◂ กลับ",fx:()=>{T.menuBack=1;}};
    const outs=[...girls.map(g=>({t:`ไปกับ${g.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      ...(RG_OUT[T.dest]&&girls.length?[{t:`ไปกันทั้งทีม: ${RG_OUT[T.dest].t}`,fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+3);add(G2,girls[0].id,"bond",1);},then:[{n:"nar",t:RG_OUT[T.dest].l.replace(/\{g\}/g,girls[n%girls.length].name)+" · กำลังใจ +3"}]}]:[]),back];
    return [
      ...(outs.length>1?[{t:`ออกไปเที่ยว${D.name} ▸`,then:[{n:"nar",t:"ชวนใครไปเที่ยวดี?",choice:outs}]}]:[]),
      {t:`ออกไปเที่ยวกับ${C.champ} (แชมป์${C.name})`,fx:G2=>{rgMeet(G2,cid,3);this.dateMark(G2,cid,T.dest);},
        then:[...this.dateLines(cid,D,T.dest),...rgJealStep(G,C.champ,3)]},
      {t:"พักผ่อนที่โรงแรม (ความล้า −10)",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:pre?"ทุกคนนอนพักในห้องจนถึงเวลาออกไปเวที · ความล้า −10":"ทุกคนเข้านอนแต่หัวค่ำ เช้ามาร่างกายสดชื่นขึ้น · ความล้า −10"}]},
      ...(pre?[]:[{t:"ซ้อมเบา ๆ ที่ลานจอดรถโรงแรม",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"เตะเป้าใต้ไฟลานจอดรถจนยามโรงแรมมาดู · ประสบการณ์ +6"}]}]),
      {t:`🛍 ซื้อของฝาก${D.name} (ไม่เสียเวลา)`,fx:()=>{T.goShop=1;}},
      ...(pre?[{t:"มุ่งสู่เวทีเลย ▸",fx:()=>{T.goRing=1;}}]:[])];},
  home(T,done){if(!T.shopDone){T.shopDone=1;this.shop(T,()=>this.home(T,done),1);return;}G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"ขากลับ รถแวะร้านของฝากริมถนน ร่มกระดาษสาแขวนเรียงเป็นแถว ผ้าทอผืนงามพับวางอยู่บนโต๊ะไม้",
    isan:"ก่อนออกจากเมือง รถแวะศูนย์ผ้าไหมประจำจังหวัด หมอนขวานกองสูงเป็นภูเขา ผ้าไหมแพรวาแขวนอยู่ในตู้กระจก",
    central:"ก่อนกลับ รถแวะร้านงานช่างไทยริมทาง หัวโขนจ้องลงมาจากผนัง ถ้วยเบญจรงค์เรียงอยู่บนชั้น",
    south:"ก่อนออกจากเมือง รถแวะร้านของฝากริมทะเล รูปหนังตะลุงแขวนโปร่งแสงอยู่หน้าร้าน ไข่มุกวางอยู่ในตู้กระจก"},
  shop(T,next,first,hotel){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r&&(!GIFTS[k].pv||GIFTS[k].pv===T.dest)).sort((a,b)=>(GIFTS[b].pv?1:0)-(GIFTS[a].pv?1:0));if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`ซื้อ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · มีอยู่ ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:hotel?"พอแล้ว กลับห้อง":first?"ไม่ซื้อ ขึ้นรถกลับค่าย":"พอแล้ว ขึ้นรถกลับค่าย",fx:()=>{st.end=1;}}];
    const pv=L.find(k=>GIFTS[k].pv),head=hotel&&first?[{n:"nar",t:`ร้านของฝากข้างโรงแรมยังเปิดไฟอยู่${pv?` ${GIFTS[pv].name}ของขึ้นชื่อ${ROAD_DEST[T.dest].name}วางเรียงอยู่หน้าร้าน`:""}`}]:first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"ของฝากแพงหน่อย แต่ได้ใจสาว ๆ มาก · ซื้อเก็บไว้แล้วค่อยให้ทีหลังได้ (ร้านแบบนี้มีแค่ตอนมาทริป)"}]:[];
    playScene([...head,{n:"nar",t:first?"จะซื้ออะไรติดมือกลับไปไหม?":"ซื้ออะไรเพิ่มไหม?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("เงินไม่พอ");if(st.got)toast(`ซื้อแล้ว: ${GIFTS[st.got].name} · มอบได้ที่จัดการค่าย › ของฝาก`);this.shop(T,next,0,hotel);},{bg:this.hotelBg[r],look:"casual"});},
  /* v1.91.114 (Man): her own night the first time in each province, then her usual nights in turn */
  dateMark(G,cid,dest){const R=G.region;R.dated=R.dated||{};if(RG_DATE[dest]&&!R.dated[dest]){R.dated[dest]=1;return;}R.dateN=R.dateN||{};R.dateN[cid]=(R.dateN[cid]||0)+1;},
  dateLines(cid,D,dest){const R=G.region;if(dest&&RG_DATE[dest]&&!(R.dated||{})[dest])return RG_DATE[dest](G);const P=RG_DATEP[cid];if(P&&P.length)return P[((R.dateN||{})[cid]||0)%P.length](G);
    const L={
    baibua:[{n:"npc",who:"ใบบัว",t:`ถนนคนเดินคืนนี้คนเยอะ… ถ้าหลงกัน จับแขนเสื้อหนูไว้ก็ได้นะ`},{n:"nar",t:"ใบบัวเดินช้า ๆ ให้ผู้จัดการเดินทัน มือเกือบชนกันหลายครั้ง แต่ไม่มีใครพูดอะไร"}],
    tabtim:[{n:"npc",who:"ทับทิม",t:"ไปกินส้มตำกันนะ! ร้านนี้แซบมาก… ฮ่า ๆ ๆ เผ็ดจนน้ำตาไหลแล้วอ้าย"},{n:"nar",t:"ทับทิมหัวเราะเสียงดังทั้งร้าน แต่พอผู้จัดการยื่นทิชชูให้ เธอเงียบไปครู่หนึ่ง"}],
    alicia:[{n:"npc",who:"อลิเซีย",t:"อย่าเข้าใจผิดนะ ฉันแค่อยากมีคนเดินเป็นเพื่อน คืนนี้กล้องปิดแล้ว…"},{n:"nar",t:"อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะทั้งคืน ไม่ได้หยิบขึ้นมาเลยสักครั้ง"}],
    chaba:[{n:"npc",who:"ชบา",t:"…ทะเลตอนกลางคืนสวย"},{n:"nar",t:"ชบาไม่พูดอะไรอีก แต่ยืนอยู่ข้าง ๆ จนน้ำขึ้นถึงข้อเท้า"}]};
    return L[cid]||[{n:"nar",t:`เดินเล่นยามค่ำที่${D.name}`}];},
  jealLine(id,champ){const L={kati:`ครูไปเดินกับ${champ}มาเหรอคะ… เปล่าค่ะ หนูไม่ได้ถาม`,mali:`มะลิเห็นนะ~ ไปกับ${champ}มาใช่ไหม… มะลิก็อยากไปบ้าง`,
    rin:`ไปกับ${champ}สองชั่วโมงสิบสองนาที รินไม่ได้จับเวลานะ แค่บังเอิญดูนาฬิกา`,ploy:`ไปกับ${champ}มาเหรอ ก็ดีนี่ …ทำไมต้องถามด้วย`,fah:`อ๋อ ไปกับ${champ}มาล่ะสิ! ฟ้าไม่ได้งอนนะ! แค่…หิว!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`ตลาดคืนนี้ของ${city}มีขนมเยอะจัง… ซื้อให้หนูชิ้นนึงได้ไหมคะ แค่ชิ้นเดียวจริง ๆ`,mali:`${city}ตอนกลางคืนสวยจัง~ ขอบคุณที่พามะลิมานะ จะจำไว้เลย`,
    rin:`รินจดร้านอร่อยของ${city}ไว้สามร้าน ไปร้านแรกก่อนนะคะ เหลือเวลาพอดี`,ploy:`ไม่ได้ขอให้พามานะ …แต่ก็ ขอบใจ`,fah:`${city}มีของกินแปลก ๆ เพียบ! ฟ้าจะลองให้หมดเลย ผู้จัดการจ่ายนะ!`};return L[id]||`คืนนี้ที่${city}สนุกดี`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){this.treeInit();const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    const NC=G.region.nc&&G.region.nc[r];f.pfx=H.perk.fx;f.canon=!NC;f.camp="region";if(NC){f.sprite="rgp_"+NC.home;f.color=C.col;f.name=C.champ;}
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],ceil=RG_LADDER.champ(cups,c.tries),tilt=C.tilt;
      f.lvl=Math.max(me.lvl||1,1)+3+Math.min(2,cups)/* v1.90.20 (Man): regional champions 3–5 levels above */;f.fatigue=0;f.injury=0;f.morale=75;
      /* re-fit only when your fighter or the stakes changed (this runs before every bout) */
      const key=[cups,c.tries||0,rgEd(G)].join("|");
      if(f.rgKey!==key){const setT=T=>{f.vet=0;for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,T-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
          liftOpponent(f,T,20);for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);};
        const T=RG_FIX.champ(cups,c.tries)+rgEdB(G,G.region.nc&&G.region.nc[r]?"nb":"cb")-(RG_SK_ADJ[r]||0)-(RG_SK_CUP[r]||0)*Math.min(3,cups); /* a lost series makes the rematch a little easier (v1.90.14) */setT(T);f.rgT=+T.toFixed(2);f.rgKey=key;}
      /* her tree is built at a fixed level (35 + cups, max 37) — never from your fighter's level, so heavy and casual players meet the same champion (v1.90.21 rule) */
      {const tl=RG_CH_SKLV+Math.min(2,cups);if(f.rgSkLv!==tl&&hasTree(id)){const lv=f.lvl;f.lvl=tl;this.autoLearn(G,id);f.lvl=lv;f.rgSkLv=tl;}}}
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
    if(this.overTime(G))return {ok:false,why:"ศึกชิงเจ้าสี่ภาคครั้งนี้หมดเวลาแล้ว · ชิงใหม่ได้ในครั้งหน้า"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างพอสำหรับศึกแชมป์แล้ว"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · นัดที่ 1 สัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r,opp:`${RG[r].champ} · ชนะ ${c.w}-${c.l}`});}
      /* v1.91.120 (Man): all four regional cups = national level — every fighter who won a cup this edition gets it in the hall */
      if(R.cups.length>=4&&!R.natDone){R.natDone=1;G.honors=G.honors||[];const ws=new Set();for(const h of G.honors)if(/^rg_/.test(h.kind)&&!(h.season&&((h.season-1)*52+(h.week||1))<(R.startAbs||0)))ws.add(h.id);
        for(const id of ws){const k=`${G.season||1}:rgnat:${rgEd(G)}::${id}`;if(!G.honors.some(h=>h.key===k))G.honors.push({key:k,season:G.season||1,week:G.week,id,div:(G.F[id]||{}).div,kind:"rgnat",opp:"ครบสี่ถ้วย · ศึกชิงเจ้าสี่ภาค"});}}
      rgMsQ(G,{k:["cup1","cup2","cup3","nat"][Math.min(3,R.cups.length-1)],id:me?me.id:null,r});rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · เงินรางวัล ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+2;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} ป้องกันแชมป์ไว้ได้ ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";rgSay(G,r,`${RG[r].champ}จะแวะมาที่ค่าย`,(RG_VISITMSG[RG_CID0[r]]&&!(G.region.nc&&G.region.nc[r])?RG_VISITMSG[RG_CID0[r]]:`${RG[r].champ}ฝากข่าวมาว่าจะแวะมาเยี่ยมค่ายก่อนนัดที่ 2`)+`\n\n(ไปต้อนรับได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค · ก่อนนัดที่ 2)`);}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} นัดที่ ${c.n}: ${p.res==="W"?"ชนะ":p.res==="L"?"แพ้":"เสมอ"} · สกอร์ ${c.w}-${c.l}${s?` · นัดต่อไปสัปดาห์ ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    {const n=(R.cups||[]).length;if(!R.close&&!R.endWarn&&n>=1&&n<4&&now>=(R.startAbs||0)+130){R.endWarn=1; /* v1.91.47: half a year of warning before the time limit */
      addMail(G,{kind:"letter",tone:"naka",from:"นาคาเอเนอร์จี้ดริงค์",title:"ศึกชิงเจ้าสี่ภาค: เหลือเวลาอีกราวครึ่งปี",body:"เรียน ผู้จัดการค่ายศิริชัย\n\nศึกชิงเจ้าสี่ภาคครั้งนี้จะปิดฉากในอีกราวครึ่งปี หลังจากนั้นจะไม่มีจดหมายท้าแชมป์ภาคครั้งใหม่ นัดที่ยังชกค้างอยู่จะชกต่อจนจบ แล้วจึงเข้าสู่พิธีปิดที่กรุงเทพฯ\n\nถ้วยที่ยังเหลือ ขอให้รีบเก็บก่อนหมดเวลา\n\nนาคาเอเนอร์จี้ดริงค์ · ดื่มนาคา ชกไม่มีหมด!"});}}
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)&&!this.overTime(G)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        rgOrg(G,r,`${RG_TITLE[r]}: คำท้าครั้งใหม่`,`เรียน ผู้จัดการค่ายศิริชัย\n\n${RG[r].champ} แชมป์${RG[r].name} เปิดรับคำท้าชิงแชมป์ภาคอีกครั้ง ชนะ 2 ใน 3 นัด · เลือกนักมวยได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค`+((t=>t?`\n\n(${t})`:"")(this.tipText(G,r))));rgSay(G,r,`${RG_TITLE[r]}: คำท้าครั้งใหม่`,RG_CH[r].again);continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"ไฟต์ไม่ได้ชกตามนัด");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name}ยังเจ็บอยู่`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    rgOrg(G,r,`เลื่อนนัด: ${RG_TITLE[r]}`,`${why} · ผู้จัดเลื่อนนัดที่ ${(c.n||0)+1}${s?` ไปเป็นสัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}`);rgSay(G,r,`เลื่อนนัด: ${RG_TITLE[r]}`,RG_CH[r].wait);},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const t=c.tries||0,head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} นัดที่ ${n}${n>1?` · สกอร์ ${me.name} ${sc} ${RG[r].champ}`:""}${t?` · นัดล้างตาครั้งที่ ${t}`:""}`};
    const NC=G.region.nc&&G.region.nc[r],bi=n===1?0:c.w===1&&c.l===1?2:1,P2=t?(NC?RG_PRE2._nc:RG_PRE2[cid]):null,line=P2&&P2[bi]?P2[bi][(t-1)%P2[bi].length]:H.pre[bi];
    const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",...(NC?{}:{with:cid}),t:t&&n===1&&RG_REPLY2[me.id]?RG_REPLY2[me.id]:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name}พยักหน้ารับ แล้วเดินกลับมุมแดง`}];
    return [head,...(rgEd(G)>=2&&n===1&&!NC?[{n:"nar",t:`${RG[r].champ}ป้องกันแชมป์ภาคมาได้อีกสมัย และเก่งกว่าเมื่อสามปีก่อน`}]:[]),{...this.spk(r,n===1?"happy":"angry","fight"),t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      {const aw={kind:"rg_"+r,key:"cup"+r};AU.startMusic("victory");AU.sfx("champ");playScene(H.cup(G,J),()=>{AU.startMusic("hub");T.cupNight=rgEd(G)===1?1:0;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight",award:aw});
        [600,1300,2200,3300,4700,6200].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===aw)AU.sfx("pop");},ms));}return;} /* v1.91.14: the cup gets the ceremony overlay, fireworks and the victory song */
    const t2=(R.champ[r]||{}).tries||0,P2=t2?((R.nc&&R.nc[r])?RG_POST2._nc:RG_POST2[cid]):null,L2=P2&&(J.res==="W"?P2.lose:P2.win);
    const steps=J.kind==="lost"?H.lost(G,J):[{...this.spk(r,J.res==="W"?"sad":"happy","fight"),t:L2&&L2.length?L2[(t2+(J.n||1))%L2.length]:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`สกอร์ตอนนี้ ${J.w}-${J.l} · นัดต่อไปอีกราว 2 สัปดาห์`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  /* v1.91.50 (playtest): Daeng watches the champion's tapes and says who fits — a player sending the wrong girl lost a series ten times without knowing why */
  /* v1.91.57 (Man): Daeng names the champion's weak spot, not the girl to send — the player works out who fits (fighter styles show on each fighter's page) */
  tipFor(G,r){const H=RG_CH[r],S=(H&&H.sty)||[];if(!S.length||typeof FSTYLE_BEATS==="undefined")return null;
    const sc=Object.keys(FSTYLE_BEATS).map(x=>[x,S.filter(y=>FSTYLE_BEATS[x].includes(y)).length]).sort((a,b)=>b[1]-a[1]);const top=sc[0][1];return top?{weak:sc.filter(x=>x[1]===top).map(x=>x[0]).slice(0,2)}:null;},
  tipText(G,r){const t=this.tipFor(G,r);if(!t)return "";const D={power:"ยืนแลกหมัดหนัก ๆ",pressure:"บุกกดดันไม่หยุด",counter:"ใจเย็น รอสวน",footwork:"เคลื่อนที่เร็ว ฟุตเวิร์กดี",inside:"เข้าประชิดวงใน"};
    return `ครูแดงดูเทป${RG[r].champ}แล้ว · จุดอ่อน: ไม่ชอบเจอคนที่${t.weak.map(x=>D[x]).join(" หรือคนที่")}`;},
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · เวที ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>รูปแบบ</span><b>3 นัด ชนะ 2 · นัดละ 5 ยก · ห่างกันราว 2 สัปดาห์</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>นัดล้างตา</span><b class="goldt">แพ้ซีรีส์มาแล้ว ${G.region.champ[r].tries} ครั้ง · ทีมเรารู้ทางแชมป์คนนี้มากขึ้น</b></div>`:""}
     ${(t=>t?`<p class="goldt rg-tip">📼 ${esc(t)}</p>`:"")(this.tipText(G,r))}
     <div class="kv-row"><span>จุดเด่นของ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>ค่าตัวต่อนัด</span><b class="num">${fmt(pay.win)} / แพ้ ${fmt(pay.lose)}</b></div><div class="kv-row"><span>ได้ถ้วย</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>ใครขึ้นชกทั้งซีรีส์</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมชก</p>`}
     <p class="meta">เลือกแล้วเปลี่ยนตัวไม่ได้จนจบซีรีส์ · บาดเจ็บ = เลื่อนนัด · ผู้จัดออกค่าเดินทางให้ทุกนัด${c.tries?` · ครั้งที่ ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>รับคำท้า</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 ได้ถ้วย</span>`:n<4?`<span class="meta">🔒 ครบ 4 เข็มขัดก่อน (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">เลือกนักมวยชิงแชมป์</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · นัด ${c.next.n} สัปดาห์ ${c.next.wk}${c.next.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">ต้อนรับ${esc(C.champ)}ที่ค่าย</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">ดวลซ้อม</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)}ป้องกันแชมป์ไว้ได้ · ${this.overTime(G)?"ศึกครั้งนี้หมดเวลาแล้ว":"รอจดหมายท้าครั้งใหม่"}</span>`:`<span class="meta">✉️ รอจดหมายนัดจากแชมป์</span>`;
    const chat=""; /* v1.91.72 (Man): her chat lives in the Characters tab like everyone else's — no chat button on the region card */
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>เวทีชิงแชมป์ภาค</small>${gap>=3?`<small class="rg-miss">💭 ${gap} สัปดาห์แล้วที่ไม่ได้เจอ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-final{border-top:6px solid #1a1a1a;background:linear-gradient(180deg,#2a1414 0,#160c0c 100%);color:#f3e6e6}.rg-final h3,.rg-final h4{color:#ff5a5a}.rg-final .meta{color:#d9bcbc}.rg-final.won{border-top-color:#d4a52a}.rg-fprep button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;max-width:22rem}.rg-fprep small{opacity:.8;font-size:.72rem;white-space:normal}.rg-fprep button,.rg-fprep button *{text-align:left!important;align-self:stretch}.rg-nl .kv-row{border-bottom:1px dashed rgba(255,255,255,.15)}.rg-slot{margin:.4rem 0 .7rem;padding:0 .9rem .4rem 0;border-bottom:1px dashed rgba(0,0,0,.2)}.rg-slot .kv-row{flex-wrap:wrap;gap:4px 12px}.rg-slot .kv-row small{margin-left:auto}.m-rgfline{max-width:580px;background:linear-gradient(180deg,#120a1e,#0b0812);color:#fff}.m-rgfline .meta{color:#c9c0dc}.vs-head{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.2rem 0 .3rem;font-weight:900;letter-spacing:.02em}.vs-tl,.vs-tr{flex:1;padding:.35rem .6rem;font-size:1.05rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}.vs-tl{text-align:right;background:linear-gradient(90deg,transparent,#c0182a);clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}.vs-tr{text-align:left;background:linear-gradient(90deg,#1d4fe0,transparent);clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}.vs-sc{font-size:1.7rem;min-width:3.4rem;text-align:center;color:#ffd84a;text-shadow:0 0 12px rgba(255,216,74,.5)}.vs-sub{text-align:center;font-size:.72rem;margin:0 0 .5rem}.vs-rows{display:flex;flex-direction:column;gap:6px}.vs-row{display:grid;grid-template-columns:1fr 46px 1fr;align-items:stretch;height:84px;position:relative}.vs-l,.vs-r{position:relative;display:flex;align-items:center;gap:.4rem;overflow:hidden;color:#fff;border:0;font:inherit;min-width:0}.vs-l{justify-content:flex-start;background:linear-gradient(90deg,#4a0710,#d01d2c 70%,#ff3b47);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);padding-right:12%}.vs-r{justify-content:flex-end;background:linear-gradient(90deg,#3f7bff,#1d4fe0 30%,#0a1f6b);clip-path:polygon(12% 0,100% 0,100% 100%,0 100%);padding-left:12%;cursor:pointer;text-align:right}.vs-r:not([disabled]):hover{filter:brightness(1.15)}.vs-row.next .vs-r{box-shadow:inset 0 0 0 3px #ffd84a}.vs-row.next .vs-r:not(:has(.vs-art)){animation:vsPulse 1.2s ease-in-out infinite}@keyframes vsPulse{50%{filter:brightness(1.35)}}.vs-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;font-style:italic;color:#fff;  text-shadow:-2px 0 0 #d01d2c,2px 0 0 #1d4fe0,0 0 10px rgba(255,255,255,.4);z-index:2}.vs-mid small{font-size:.58rem;font-style:normal;text-shadow:none;color:#c9c0dc}.vs-art{position:relative;flex:0 0 74px;height:84px;overflow:hidden}.vs-art img{position:absolute;left:50%;top:2px;height:235%;transform:translateX(-50%);max-width:none}.vs-art canvas{position:absolute;left:50%;top:-4px;width:150px;height:150px;transform:translateX(-50%);image-rendering:auto}.vs-tx{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vs-tx b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.45)}.vs-tx em{font-style:normal;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}.vs-tx small{font-size:.64rem;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vs-empty b{font-size:.85rem;opacity:.95}.vs-row.done .vs-l,.vs-row.done .vs-r{cursor:default}.vs-row.done .vs-l.lost,.vs-row.done .vs-r.lost{filter:grayscale(1) brightness(.72)}.vs-st{position:absolute;top:50%;transform:translate(-50%,-50%) rotate(-10deg);pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.6);font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;  padding:.05rem .45rem;border:3px solid currentColor;border-radius:4px;background:rgba(0,0,0,.55);z-index:3}.vs-st.vsl{left:11%}.vs-st.vsr{left:89%}.vs-st.w{color:#ffd84a}.vs-st.l{color:#ff6a6a}.vs-st.d{color:#d8d8d8}.rg-stars i{font-style:normal;color:#5a4a4a;font-size:1rem;letter-spacing:1px}.rg-stars i.on{color:#ffd84a;text-shadow:0 0 6px rgba(255,216,74,.6)}.rg-leg .kv-row{align-items:center}.vs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:.5rem 0}.vs-pc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 0 .4rem;border:0;color:#fff;font:inherit;cursor:pointer;  background:linear-gradient(180deg,#2a5bf0,#0d2478);box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}.vs-pc.on{box-shadow:inset 0 0 0 3px #ffd84a}.vs-pc[disabled]{filter:grayscale(1) brightness(.55);cursor:default}.vs-pc .vs-art{flex:none;width:100%;height:96px}.vs-pc small{font-size:.66rem;opacity:.85}@media (prefers-reduced-motion:reduce){.vs-row.next .vs-r{animation:none}}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rgt-list{display:grid;gap:.5rem}.rg-step{display:inline-block;background:#d9a21b;color:#1b1230;font-weight:700;padding:.1rem .5rem;margin:.2rem 0}.rg-finbtn{display:grid;width:100%;margin-top:6px;text-align:left;background:#7a1020;color:#fff;box-shadow:inset 0 0 0 2px #ffcf4a}.rg-finbtn small{opacity:.85}.rg-finbtn.hot{animation:finb 1s steps(2) infinite}.rg-nstrip{display:grid;grid-template-columns:auto 1fr auto;gap:.6rem;align-items:center;background:#0d0a12;color:#eee;border:3px solid #b3141f;padding:.55rem .7rem;margin:0 0 .7rem}.rg-nstrip:not(.won){animation:finb 1.2s steps(2) infinite}.rg-nstrip.won{border-color:#d9a21b;animation:none}.rg-nstrip b{display:block;color:#ff6b6b}.rg-nstrip.won b{color:#ffd36a}.rg-nstrip small{display:block;opacity:.8;font-size:.8em}.rg-ncard{font-size:1.9rem;line-height:1;color:#ff3b3b}.rg-nstrip.won .rg-ncard{color:#ffd36a}.rg-nwait{text-align:right;font-weight:700;color:#ffb0b0}.rg-nbtn{white-space:nowrap}@keyframes finb{50%{box-shadow:inset 0 0 0 2px #ffcf4a,0 0 0 4px #ff3b55}}
.lb-head,.lb-row{display:grid;grid-template-columns:1.6em 2.6em 1fr auto 2.6em;gap:.4rem;align-items:center}.lb-head{font-size:.75rem;opacity:.7;padding:0 .3rem}.lb-row{padding:.3rem;border-left:4px solid var(--rc);margin:3px 0;background:rgba(0,0,0,.14)}.lb-row.us{background:rgba(255,207,74,.14);box-shadow:inset 0 0 0 1px #ffcf4a}
.lb-n{font-weight:700;text-align:center}.lb-mv{font-style:normal;font-size:.72rem;opacity:.7}.lb-mv.up{color:#7aff9a;opacity:1}.lb-mv.dn{color:#ff7a6a;opacity:1}.lb-mv.new{color:#ffcf4a;opacity:1}
.lb-who{display:flex;align-items:center;gap:.35rem;min-width:0}.lb-who>span{display:grid;min-width:0}.lb-who small{opacity:.7;font-size:.72rem}.lb-who img{width:26px;height:26px}
.lb-rec{display:grid;justify-items:end;font-size:.82rem}.lb-rec small{opacity:.7;font-size:.7rem}.lb-fm{display:flex;gap:1px}.lb-fm .fm{font-size:.62rem;padding:0 2px}.fm.W{background:#2f8a4f}.fm.L{background:#8a2f3a}.fm.D{background:#6a6a7a}.lb-pts{text-align:right;color:var(--gold,#ffcf4a);font-size:1.05rem}
@media (prefers-reduced-motion:reduce){.rg-finbtn.hot,.rg-nstrip{animation:none}}.rg-pairtag small{color:#ffd36a}.rgt-dev{margin-top:.6rem;padding:.5rem;border:2px dashed #8fd3ff;display:grid;gap:.4rem}.rgt-dev>div{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.rgt-dev small{opacity:.75;margin-right:4px}.rgt-reg{border-left:6px solid var(--rc);padding:.3rem .5rem;background:rgba(0,0,0,.12)}.rgt-pv{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.rgt-pv .btn{display:grid;text-align:left}.rgt-pv .btn small{opacity:.75}.rg-load{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:#07040c url(${ASSET}bg_naka_underground.webp) center/cover}.rgl-in{background:rgba(8,4,10,.82);box-shadow:inset 0 0 0 3px #c41d33;padding:1rem 1.2rem;max-width:min(90vw,520px);display:grid;gap:.6rem;color:#f3e9ff}.rgl-in b{color:#ff5a6c;font-size:1.2rem}.rgl-in p{margin:0;line-height:1.5}.rgl-bar{height:10px;background:#2a0d14;box-shadow:inset 0 0 0 2px #5a1520}.rgl-bar i{display:block;height:100%;width:0;background:#e0283c;transition:width .2s}.fprep3{display:grid;gap:6px;margin:.4rem 0}.fprep3 h4{margin:0;color:#ff7a8a}.fprep3 .btn{text-align:left;display:grid;justify-items:start;padding:.5rem .8rem}.fprep3 .btn.gold{box-shadow:inset 0 0 0 3px #ffcf4a}.fprep3 .btn small{opacity:.8}.rg-show{position:fixed;inset:0;z-index:9000;background:#07040c;display:flex;align-items:center;justify-content:center}.rgs-in{position:relative;width:min(100vw,960px)}.rg-show canvas{width:100%;height:auto;display:block;image-rendering:auto}.rgs-cap{min-height:3.2em;padding:.7rem 1rem;color:#f3e9ff;font-size:1.05rem;line-height:1.5;background:linear-gradient(180deg,#1a1028,#0d0815);border-top:3px solid #ff4d6d}.rgs-skip{position:absolute;top:.5rem;right:.5rem}.rg-quick{display:grid;grid-template-columns:auto 1fr;column-gap:.5rem;align-items:center;margin:.6rem 0;cursor:pointer}.rg-quick small{grid-column:2}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
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
  fuelLine(G){const ft=roadFuelOf(roadCarKey(G)),p=roadFuel(G,gameWeek(G),ft),b=roadFuelBand(p,ft);
    return `<p class="meta">ราคาน้ำมันสัปดาห์นี้ <b class="rg-fuel ${b}">฿${p.toFixed(2)}/ลิตร · ${b==="cheap"?"ถูก":b==="high"?"แพง":"ปกติ"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  /* ---------- v1.91.78 (Man): the regional tab is a ranking board like the sub-district/district/province tables ----------
     points per bout (win 3 · win inside the distance +1 · draw 1), each fighter's record, rank up/down by week; the province and
     regional champions also fight each other on the circuit, two bouts a week */
  lb(G){const R=G.region,ed=R.edition||1;if(!R.lb||R.lb.ed!==ed){const L={ed,pts:{},w:{},l:{},d:{},ko:{},form:{},prev:{},log:[]};R.lb=L;
      for(const r of RG_ORDER){for(const p of RG[r].prov){const P=R.pc&&R.pc[p],k="pc:"+p;L.pts[k]=0;L.w[k]=0;L.l[k]=0;L.ko[k]=0;
          for(const x of (P&&P.path)||[]){L.pts[k]+=3+(x.m==="ko"?1:0);L.w[k]++;if(x.m==="ko")L.ko[k]++;}}
        const k="rc:"+r;L.pts[k]=9;L.w[k]=3;L.l[k]=0;L.ko[k]=1;}
      /* a save already part-way through: count the belts and cups our fighters have won since the chapter opened */
      for(const h of G.honors||[]){if(!G.F[h.id]||G.F[h.id].camp!=="player")continue;if(h.season&&((h.season-1)*52+(h.week||1))<(R.startAbs||0))continue;const n=h.kind==="rgbelt"?1:/^rg_/.test(h.kind)?2:0;if(!n)continue;
        for(const o of [L.pts,L.w,L.l,L.d,L.ko])if(o[h.id]==null)o[h.id]=0;L.pts[h.id]+=3*n;L.w[h.id]+=n;}
      this.lbRank(G,true);}
    return R.lb;},
  lbKeys(G){const L=this.lb(G);return Object.keys(L.pts).filter(k=>!/^(pc|rc):/.test(k)?G.F[k]&&G.F[k].camp==="player":true);},
  lbName(G,k){if(k.startsWith("pc:")){const d=k.slice(3);return {n:this.oppName(G,d),c:`แชมป์จังหวัด${ROAD_DEST[d]?ROAD_DEST[d].name:""}`,col:RG[ROAD_DEST[d].r].col};}
    if(k.startsWith("rc:")){const r=k.slice(3);return {n:RG[r].champ,c:`แชมป์${RG[r].name}`,col:RG[r].col,rc:1};}
    const f=G.F[k];return {n:f?f.name:k,c:"ค่ายศิริชัย",us:1,f};},
  lbSorted(G){const L=this.lb(G);return this.lbKeys(G).sort((a,b)=>(L.pts[b]||0)-(L.pts[a]||0)||(L.w[b]||0)-(L.w[a]||0)||(L.l[a]||0)-(L.l[b]||0)||a.localeCompare(b));},
  lbRank(G,snap){const L=G.region.lb;if(!L)return;if(snap){L.prev={};this.lbSorted(G).forEach((k,i)=>L.prev[k]=i+1);}},
  lbAdd(G,a,b,res,stop){if(!a||!b)return;const L=this.lb(G),one=(k,r)=>{for(const o of [L.pts,L.w,L.l,L.d,L.ko])if(o[k]==null)o[k]=0;
      if(r==="W"){L.pts[k]+=3+(stop?1:0);L.w[k]++;if(stop)L.ko[k]++;}else if(r==="L")L.l[k]++;else{L.pts[k]+=1;L.d[k]++;}(L.form[k]=L.form[k]||[]).push(r||"D");if(L.form[k].length>5)L.form[k].shift();};
    const ra=res==="W"?"W":res==="L"?"L":"D",rb=ra==="W"?"L":ra==="L"?"W":"D";one(a,ra);one(b,rb);
    L.log.unshift({wk:G.week,ss:G.season||1,a,b,r:ra,stop:!!stop,pa:ra==="W"?3+(stop?1:0):ra==="D"?1:0,pb:rb==="W"?3+(stop?1:0):rb==="D"?1:0});if(L.log.length>14)L.log.length=14;},
  lbWeek(G){const R=G.region,now=gameWeek(G),L=this.lb(G);if(L.simWk===now)return;L.simWk=now;this.lbRank(G,true);
    const bots=Object.keys(L.pts).filter(k=>/^(pc|rc):/.test(k)),rng=mulberry32((G.seed||1)*7+now*131+(R.edition||1)*17);
    for(let n=0;n<2&&bots.length>1;n++){const a=bots[Math.floor(rng()*bots.length)];let b=bots[Math.floor(rng()*bots.length)];if(a===b)continue;
      const sa=a.startsWith("rc:")?1.6:1,sb=b.startsWith("rc:")?1.6:1,pw=sa/(sa+sb),x=rng(),res=x<pw*.94?"W":x<.94?"L":"D";this.lbAdd(G,a,b,res,rng()<.35);}},
  boardHTML2(G){const R=G.region,L=this.lb(G),S=this.lbSorted(G);
    const mv=k=>{const p=L.prev[k],c=S.indexOf(k)+1;return !p?`<i class="lb-mv new">ใหม่</i>`:p>c?`<i class="lb-mv up">▲${p-c}</i>`:p<c?`<i class="lb-mv dn">▼${c-p}</i>`:`<i class="lb-mv">–</i>`;};
    const rows=S.map((k,i)=>{const N=this.lbName(G,k),fm=(L.form[k]||[]).map(x=>`<b class="fm ${x}">${x==="W"?"ช":x==="L"?"พ":"ส"}</b>`).join("");
      return `<div class="lb-row ${N.us?"us":""}" style="--rc:${N.col||"#c8283c"}"><span class="lb-n">${i+1}</span>${mv(k)}<span class="lb-who">${N.f?faceImg(N.f,"sm"):""}<span><b>${esc(N.n)}</b><small>${esc(N.c)}</small></span></span><span class="lb-rec">${L.w[k]||0}-${L.l[k]||0}${L.d[k]?`-${L.d[k]}`:""}<small>${L.ko[k]?`KO ${L.ko[k]}`:""}</small><span class="lb-fm">${fm}</span></span><b class="lb-pts">${L.pts[k]||0}</b></div>`;}).join("");
    const nm=k=>esc(this.lbName(G,k).n);
    const log=L.log.length?L.log.slice(0,10).map(x=>`<div class="kv-row"><span><small>สัปดาห์ ${x.wk}</small> ${nm(x.a)} <b>${x.r==="W"?"ชนะ":x.r==="L"?"แพ้":"เสมอ"}</b> ${nm(x.b)}${x.stop&&x.r!=="D"?" <small>(ก่อนครบยก)</small>":""}</span><span class="num">+${x.pa} / +${x.pb}</span></div>`).join(""):`<p class="meta">ยังไม่มีไฟต์ในครั้งนี้</p>`;
    return `<section class="px card rg-head"><div><h3>ตารางคะแนนศึกชิงเจ้าสี่ภาค</h3><span class="meta">ครั้งที่ ${R.edition||1}${this.nextEdTxt(G)}</span></div>
      <p class="meta">ชนะ 3 แต้ม · ชนะก่อนครบยก +1 · เสมอ 1 · แชมป์จังหวัดกับแชมป์ภาคชกกันเองสัปดาห์ละ 2 ไฟต์ · ลูกศรเทียบกับต้นสัปดาห์ · ออกเดินทางได้ที่ปุ่ม 🚐 ข้างรถค่ายในหน้าแรก</p>
      ${this.overTime(G)?`<p class="meta redt">ศึกครั้งนี้หมดเวลาแล้ว</p>`:""}</section>
      <section class="px card"><div class="lb-head"><span>#</span><span></span><span>นักมวย</span><span>สถิติ</span><span>แต้ม</span></div>${rows}</section>
      <section class="px card"><h4>ไฟต์ล่าสุด</h4>${log}</section>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>ศึกชิงเจ้าสี่ภาค</h3><p>ทัวร์นาเมนต์ระดับประเทศจะส่งจดหมายเชิญมา เมื่อจบปีที่ 5 และค่ายได้แชมป์จังหวัดครบ 3 ครั้ง</p>
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
    return `${!R.gala?`<p class="meta rg-gala">🎉 งานเปิดตัวศึกชิงเจ้าสี่ภาคที่กรุงเทพฯ ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"จัดปลายสัปดาห์หน้า":"จัดปลายสัปดาห์นี้"} · ทั้งค่ายได้รับเชิญ</p>`:""}${this.nagaStrip(G)}${this.boardHTML2(G)}
     ${!REGION_LIVE?`<p class="meta">โหมดทดสอบ: <button class="btn sm" data-act="rggala" data-v="gala">ดูงานเปิดตัว</button> <button class="btn sm" data-act="rgclosetest">ดูพิธีปิด</button> ไฟต์ใต้ดินทดสอบ (กติกาเปิด): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">ดูฉากซองเขียว</button>`:""}</p>`:""}${!REGION_LIVE?`<details class="rg-dev"><summary>โหมดทดสอบ: การ์ดเดิม</summary>${this.finalCard(G)}${this.legendCard(G)}<div class="rg-grid">${regs}</div></details>`:""}`;},
  /* v1.91.85 (Man): the warehouse 5v5 also sits as a strip on the regional tab (not only in the black letter); after the first win it opens the other levels */
  nagaStrip(G){const R=G.region,F=R&&R.final;if(!F)return "";const now=gameWeek(G);
    if(!F.won){const ready=now>=F.abs;
      return `<div class="px rg-nstrip"><span class="rg-ncard">🂠</span><span><b>ไฟต์ใต้ดิน 5 ต่อ 5 · นาคาลีก</b><small>โกดังเก่าท่าเรือคลองเตย · กติกาเปิด · ชนะ 3 ใน 5${F.tries?` · ท้ามาแล้ว ${F.tries} ครั้ง`:""}</small></span>${ready?`<button class="btn red rg-nbtn" data-act="rgfline">ไปโกดัง ▸</button>`:`<span class="rg-nwait">ไปได้สัปดาห์ ${((F.abs-1)%52)+1}<small>อีก ${F.abs-now} สัปดาห์</small></span>`}</div>`;}
    return `<div class="px rg-nstrip won"><span class="rg-ncard">🂠</span><span><b>ไฟต์ใต้ดิน 5 ต่อ 5 · ชนะแล้ว ${esc(F.score||"")}</b><small>เลือกระดับต่อไป</small></span><span class="rg-nlv"><button class="btn gold rg-nbtn" data-act="rglegopen">✦ ระดับตำนาน ▸</button></span></div>`;},
  /* quick trips: only once the region's first meeting and this province's own story have been seen */
  /* v1.91.50 (playtest): a champion coming to visit shows on the home screen too — it was easy to miss on the regional tab */
  visitBanner(G){const R=G.region;if(!R||!R.champ)return "";const r=RG_ORDER.find(x=>R.champ[x]&&R.champ[x].visit==="due");if(!r)return "";const cid=this.champId[r];
    return `<button class="px newfighter" data-act="rgvisit" data-v="${r}"><span class="newb">NEW!</span>${G.F[cid]?`<img src="${faceSrc(cid,"happy")}" alt="">`:""}<span><b>${esc(RG[r].champ)}มาเยือนค่าย</b><small>แตะเพื่อต้อนรับ · มาได้ถึงก่อนนัดที่ 2 เท่านั้น</small></span><span class="chev">▸</span></button>`;},
  canQuick(G,dest){const R=G.region,D=ROAD_DEST[dest];if(!R||!D)return false;return !!((R.arrived||{})[D.r])&&!(RG_TRIPX[dest]&&!((R.tx||{})[dest]))&&!(RG_PROV[dest]&&!((R.provMet||{})[dest]))&&!(RG_SIDE[D.r]&&!((R.side||{})[D.r]||{}).won&&!(R.joined&&R.joined[RG_SIDE[D.r].cid]));},
  /* v1.91.82 (Man): two popups — first who comes along (seats), then who fights (from those on board) with the bill */
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว</p>`;
    const RD=this.riders(G,wk),max=roadSeats(G),cand=roster(G).filter(f=>!f.injury||f.injury<3);
    if(!UI.rgParty){const pr=this.pairDue(G,dest);UI.rgParty=[...cand].sort((a,b)=>(b.id===pr)-(a.id===pr)||(b.bond||0)-(a.bond||0)).map(f=>f.id).slice(0,max);}
    UI.rgParty=UI.rgParty.filter(id=>cand.some(f=>f.id===id)).slice(0,max);
    const head=`<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">เดินทางสัปดาห์ <b>${wk}</b> · ${D.km} กม. · ${roadNights(D.km)?`ค้าง ${roadNights(D.km)} คืน`:"ไปกลับวันเดียว"} · ${((G.region.belts||{})[D.r]||{})[dest]?`ได้เข็มขัดแล้ว · ไปเที่ยว + <b>ศึกเวทีท้องถิ่น</b> (น็อกเอาต์ 3 ไฟต์ คู่ชกสุ่ม รางวัลทุกไฟต์ที่ชนะ)`:`คู่ชก: <b>${esc(this.oppName(G,dest))}</b> แชมป์ประจำจังหวัด`}</p>`;
    if((UI.rgStep||1)===1){const okF=UI.rgParty.some(id=>RD.some(f=>f.id===id));
      return `${head}<p class="rg-step">ขั้นที่ 1/2 · ใครไปด้วย</p>
       <p class="meta">${roadCarKey(G)==="none"?`ยังไม่มีรถค่าย · นั่งรถทัวร์ไปกี่คนก็ได้ จ่ายค่าตั๋วรายหัว · เลือกแล้ว ${UI.rgParty.length} คน`:`${esc(roadCarName(roadCarKey(G)))} · ${(ROAD_CAR[roadCarKey(G)]||{}).seats} ที่นั่ง (ผู้จัดการขับ${roadCoachIn(G)?" · ครูแดง 1 ที่":""}) · นักมวยไปได้ <b>${max}</b> คน · เลือกแล้ว ${UI.rgParty.length}/${max}`}</p>
       ${roadCoachAvail(G)?`<div class="rg-pick"><button class="btn sm" data-act="rgcoach" aria-pressed="${roadCoachIn(G)}"><img class="face sm" src="${faceSrc("coach","happy")}" alt="">ครูแดง <small>${roadCoachIn(G)?"ไปด้วย · ดูเทปให้ แนะนำมุมเวที":"อยู่ค่าย · ทริปนี้ไม่มีคำแนะนำ"}</small></button></div>`:`<p class="meta">ครูแดงลาอยู่ · ทริปนี้ไม่มีคำแนะนำ</p>`}
       <div class="rg-pick">${cand.map(f=>{const on=UI.rgParty.includes(f.id),full=!on&&UI.rgParty.length>=max,pr=this.pairDue(G,dest)===f.id,fit=RD.some(x=>x.id===f.id);
         return `<button class="btn sm${pr?" rg-pairtag":""}" data-act="rgparty" data-v="${f.id}" aria-pressed="${on}" ${full?"disabled":""}>${faceImg(f,"sm")}${esc(f.name)}${fit?"":` <small>ชกไม่ได้</small>`}${pr?` <small>💬 มีเรื่องกับ${esc(C.champ)}</small>`:""}</button>`;}).join("")}</div>
       ${okF?"":`<p class="redt">ต้องมีนักมวยที่พร้อมชกไปด้วยอย่างน้อย 1 คน</p>`}
       <div class="mfoot"><button class="btn" data-act="${UI.rgNow?"rgtravel":"closeModal"}">${UI.rgNow?"◂ กลับ":"ไว้ก่อน"}</button><button class="btn primary" data-act="rgstep" data-v="2" ${okF?"":"disabled"}>ถัดไป · เลือกคนขึ้นชก ▸</button></div>`;}
    const R=RD.filter(f=>UI.rgParty.includes(f.id));if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),now=!!UI.rgNow;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `${head}<p class="rg-step">ขั้นที่ 2/2 · ใครขึ้นชก</p>
     ${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมชกในคนที่ไป</p>`}
     <p class="meta">ไปด้วย: ${UI.rgParty.map(id=>esc(G.F[id]?G.F[id].name:"")).join(" · ")}</p>
     <h3>ค่าเดินทาง ไป-กลับ</h3><div class="rg-bill"><div class="kv-row"><span>รถ</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`${P.ft==="ev"?"ไฟฟ้า":"น้ำมัน"} ${Math.round(P.litres)} ${P.unit||"ลิตร"} × ฿${P.price.toFixed(2)}`,P.fuel)}${line("ทางด่วน",P.toll)}${line(`ตั๋วรถทัวร์ × ${P.onBus}`,P.bus)}${line(`ที่พัก ${P.nights} คืน`,P.lodge)}${line(`ค่ากิน × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>รวม</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div><div class="kv-row"><span>เงินค่ายหลังจ่าย</span><b class="num ${poor?"redt":""}">${fmt(G.cash-P.total)}</b></div></div>
     <p class="meta">ไปด้วยกัน ${P.people} คน (รวมผู้จัดการ${roadCoachIn(G)?"และครูแดง":""}) · คนที่อยู่ค่ายซ้อมตามโปรแกรมเดิม · สัปดาห์นั้นไม่รับไฟต์อื่น · ความล้าระหว่างทางราว +${P.fat} ต่อคน${P.car==="none"?" · ยังไม่มีรถประจำค่าย ต้องนั่งรถทัวร์ (แพงและล้ากว่า)":""}</p>
     ${this.canQuick(G,dest)?`<label class="rg-quick"><input type="checkbox" data-act="rgquick" ${G.region.quickPref?"checked":""}> ไปแบบรวบรัด <small class="meta">ข้ามฉากขับรถ คืนที่โรงแรม และร้านของฝาก · คืนที่ค้างนับเป็นพักผ่อน</small></label>`:""}
     <div class="mfoot"><button class="btn" data-act="rgstep" data-v="1">◂ ใครไปด้วย</button>${now&&wk===G.week?`<button class="btn primary" data-act="rggonow" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ออกเดินทางเลย ▸"}</button>`:`<button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ยืนยันการเดินทาง"}</button>`}</div>
     ${now&&wk===G.week?`<p class="meta center">ออกเดินทางแล้วสัปดาห์นี้จะจบทันที (ซ้อมตามโปรแกรม → ขับรถ → โรงแรม → เวที)</p>`:""}`;},
  /* v1.91.76 (Man): the "travel" button at the camp vehicle — pick a province, then go this week */
  travelOk(G){const R=G.region;return !!(R&&R.belts&&regionOn());}, /* v1.91.93 (Man): the van stays on the road after the belts are won — holidays and the local ring */
  /* v1.91.78 (Man): once a region's four belts are in, its title match shows in the travel popup as a big blinking button */
  finBtn(G,r){const c=G.region.champ[r]||{};if(this.beltCount(G,r)<4||c.state==="won"||c.state==="locked")return "";const C=RG[r],hot=c.state==="letter"||(c.state==="series"&&c.visit==="due");
    return `<button class="btn rg-finbtn ${hot?"hot":""}" data-act="rgfinopen" data-v="${r}">⚔ นัดชิงแชมป์${esc(C.name)} · ${esc(C.champ)}<small>${c.state==="letter"?"เลือกนักมวยชิงแชมป์":c.state==="series"?`${c.w}-${c.l}${c.next?` · นัด ${c.next.n} สัปดาห์ ${c.next.wk}`:""}${c.visit==="due"?" · เธอจะแวะมาค่าย":""}`:c.state==="lost"?"รอคำท้าครั้งใหม่":"รอจดหมายนัด"}</small></button>`;},
  finHTML(r){const C=RG[r];return `<h2>⚔ ชิงแชมป์${esc(C.name)}</h2><div class="rg-reg" style="--rc:${C.col}">${this.finRow(r)}</div><div class="mfoot"><button class="btn" data-act="rgtravel">◂ กลับ</button></div>`;},
  travelHTML(G){const R=G.region,wk=this.tripWeek(G),now=wk===G.week;
    if(R.trip){const T=R.trip,D=ROAD_DEST[T.dest];return `<h2>🚐 เดินทาง · ศึกชิงเจ้าสี่ภาค</h2><p>นัดเดินทางไป<b>${esc(D?D.name:"")}</b> สัปดาห์ ${T.wk} แล้ว · ${esc(G.F[T.fid]?G.F[T.fid].name:"")}ขึ้นชก</p><p class="meta">ถึงสัปดาห์นั้น กดจบสัปดาห์แล้วออกเดินทาง</p><div class="mfoot"><button class="btn" data-act="rgcancel">ยกเลิกทริป (คืนเงิน)</button><button class="btn primary" data-act="closeModal">ปิด</button></div>`;}
    const rows=RG_ORDER.map(r=>{const C=RG[r],B=(R.belts||{})[r]||{};return `<div class="rgt-reg" style="--rc:${C.col}"><b>${esc(C.name)}</b><div class="rgt-pv">${C.prov.map(p=>{const D=ROAD_DEST[p];if(!D)return "";const got=!!B[p];
      return `<button class="btn sm ${got?"":"gold"}" data-act="rgtravelto" data-v="${p}">${esc(D.name)}<small>${got?`เที่ยว · เวทีท้องถิ่น`:`${D.km} กม.`}</small></button>`;}).join("")}</div>${this.finBtn(G,r)}</div>`;}).join("");
    return `<h2>🚐 เดินทาง · ศึกชิงเจ้าสี่ภาค</h2>${roadSignHTML(G)}<p class="meta">${!wk?"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว":now?"เลือกจังหวัด แล้วออกเดินทางได้เลยสัปดาห์นี้":`สัปดาห์นี้ยังออกไม่ได้ · ไปได้สัปดาห์ ${wk} (จองไว้ก่อนได้)`}</p>
      <div class="rgt-list">${rows}</div>${G.devTravel?this.travelDevHTML(G):""}<div class="mfoot"><button class="btn" data-act="closeModal">ปิด</button></div>`;},
  /* v1.91.77 (Man): the travel test save (#demo=travel_test) gets a small test panel — swap the camp vehicle, send Kru Daeng on leave, reset */
  travelDevHTML(G){const cur=roadCarKey(G),cars=["none","tuktuk","citycar","pickup","songthaew","minibus","vipvan","evsuv","evvan","limo","tourbus"],away=!roadCoachIn(G);
    return `<div class="rgt-dev"><b>🧪 โหมดทดสอบการเดินทาง</b>
      <div><small>รถค่าย</small>${cars.map(k=>`<button class="btn sm ${k===cur?"gold":""}" data-act="rgtdev" data-v="car:${k}">${esc(roadCarName(k))} · ${Math.max(1,(k==="none"?4:ROAD_CAR[k].seats)-1-(away?0:1))} คน</button>`).join("")}</div>
      <div><button class="btn sm ${away?"gold":""}" data-act="rgtdev" data-v="coach">${away?"ครูแดงลาอยู่ (กดให้กลับ)":"ให้ครูแดงลา"}</button><button class="btn sm" data-act="rgtdev" data-v="reset">รีเซ็ต: ยกเลิกทริป · คืนเข็มขัด · เงิน ฿200,000</button><button class="btn sm" data-act="rgtdev" data-v="quick">${G.region.quickPref?"ปิด":"เปิด"}ไปแบบรวบรัด</button></div></div>`;}
};

/* round 11: the underground final — state, the region-page card, the line-up and the five bouts */
Object.assign(REGION,{
  /* v1.91.47 (playtest): three years in with a cup, no new challenge letters — the series in progress ends, then the closing ceremony comes (before, a player who always re-accepted at once never reached it) */
  overTime(G){const R=G.region;if(!R||(R.cups||[]).length>=4||rgEd(G)>=2)return false; /* later editions have no time limit */return R.close!=null||((R.cups||[]).length>=1&&gameWeek(G)>=(R.startAbs||0)+156);},
  closeDue(G){const R=G.region,now=gameWeek(G),cups=R.cups||[];if(R.close)return false;
    if(cups.length>=4){const last=R.champ[cups[3]];return now>=((last&&last.wonAbs)||0)+2;}
    /* the tournament runs its course without four cups: three years in, nothing in progress */
    return cups.length>=1&&now>=(R.startAbs||0)+156&&!RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")&&!R.trip;},
  openFinal(G){const R=G.region,now=gameWeek(G);R.close=now;R.final={stage:"prep",abs:now+3,prep:null,tries:0,won:false,intelAbs:now+1};},
  /* v1.91.72 (Man): the black card is Krerk's own challenge — a black letter with a blinking red frame that is also the way into the warehouse */
  blackCard(G){const R=G.region,F=R.final;if(!F)return;const wk=((F.abs-1)%52)+1;
    const ps=R.closeDare?"\n\nป.ล. คืนนั้นคุณบอกให้ผมส่งนักมวยไปเจอค่ายคุณ ผมส่งไปห้าคน":R.closeFace?"\n\nป.ล. ลูกสาวผมไม่เคยถามชื่อใคร คืนนั้นเธอถามชื่อคุณ":"";
    addMail(G,{kind:"letter",tone:"black",bk:1,from:"เกริก นาคา",title:"การ์ดสีดำ",body:`ถึง ผู้จัดการค่ายศิริชัย\n\nสามปีที่ผมเป็นเจ้าภาพศึกชิงเจ้าสี่ภาค ผมรอแชมป์ทั้งสี่คนนั้นมาตลอด และคุณคือเหตุผลที่พวกเธอไม่มา\n\nงั้นมาพิสูจน์กันครับ ว่าค่ายที่สอนให้คนกล้าปฏิเสธ ยืนได้นานแค่ไหน\n\nห้าต่อห้า · โกดังโรงงานเครื่องดื่มเก่า ท่าเรือคลองเตย\nตั้งแต่สัปดาห์ที่ ${wk} เป็นต้นไป\nกติกาเปิด ทุ่มได้ ล็อกได้ · ไม่มีรางวัล ไม่มีสื่อ ไม่มีข้ออ้าง\n\nประตูเปิดรอทุกคืน ส่งนักมวยของคุณมา\n\n— เกริก นาคา${ps}`});},
  letterAct(m){const R=G.region,F=R&&R.final;if(!F)return "";if(m.lg)return `<button class="btn gold big" data-act="rglegopen">✦ เปิดระดับตำนาน ▸</button>`;if(F.won)return `<p class="meta center">ค่ายศิริชัยชนะไฟต์ใต้ดิน ${esc(F.score||"")}</p>`;const now=gameWeek(G);
    return now<F.abs?`<p class="meta center">ไปได้ตั้งแต่สัปดาห์ ${((F.abs-1)%52)+1} · ซ้อมอีก ${F.abs-now} สัปดาห์</p>`:`<button class="btn red big" data-act="rgfline">🂠 ไปโกดังท่าเรือคลองเตย ▸</button>`;},
  finalWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||F.intel||now<F.intelAbs)return;F.intel=1;
    addMail(G,{kind:"letter",tone:"naka",from:"(ไม่ลงชื่อ)",title:"ข้อมูลทีมนาคาลีก",body:"ไม่ต้องถามว่าใครส่งมา\n\n"+NL_ORDER.map(k=>`${NL[k].name} · ${NL[k].art}\n${NL[k].tip||""}`).join("\n\n")+"\n\nลดามองหาเทปไฟต์เก่าของทุกคนในค่ายคุณ คนที่เธอไม่เคยเห็นชก เธออ่านไม่ออก\n\nป.ล. แท็บเล็ตไม่ต้องคืนแล้ว"});},
  finalCard(G){const R=G.region,F=R.final;if(!F)return "";const now=gameWeek(G),ready=now>=F.abs,wk=((F.abs-1)%52)+1;
    const team=F.intel?`<div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><small>${NL[k].nlsk.map(s=>esc(s.name)).join(" · ")}</small></div>`).join("")}</div>`:`<p class="meta">ยังไม่รู้อะไรเกี่ยวกับทีมนาคาลีกเลย</p>`;
    if(F.won)return `<section class="px card rg-final won"><h3>ไฟต์ใต้ดิน · นาคาลีก</h3><p>ค่ายศิริชัยชนะ ${F.score||""} · ${F.beatLadda?"ล้มลดาได้ด้วย":"ลดายังไม่แพ้ใคร"}</p></section>`;
    return `<section class="px card rg-final"><h3>🂠 การ์ดสีดำ · ไฟต์ใต้ดินนาคาลีก</h3>
      <p class="meta">ห้าต่อห้า · ชนะสามได้ไป · กติกาเปิด ทุ่มได้ ล็อกได้ · ไม่มีรางวัล${F.tries?` · เคยไปแล้ว ${F.tries} ครั้ง`:""} · เลือกนักมวยและวิธีรับมือทีละนัดในหน้าเตรียมไฟต์</p>
      <h4>ทีมนาคาลีก</h4>${team}
      <div class="mfoot">${ready?`<button class="btn primary" data-act="rgfline">${F.live?"กลับเข้าโกดัง ชกต่อ ▸":"ไปโกดังใต้ดิน ▸"}</button>`:`<span class="meta">ไปได้ตั้งแต่สัปดาห์ ${wk} · ซ้อมอีก ${F.abs-now} สัปดาห์</span>`}</div></section>`;},
  finalPool(G){return roster(G).filter(f=>!f.injury&&!isAway(G,f.id));},
  /* v1.91.72 (Man): a loading screen on the way in — the board opens only when every portrait and sprite of the night is ready (no blank, stuck cards) */
  finalLoad(done){if(typeof document==="undefined"){done();return;}const pool=this.finalPool(G),ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const L=["bg_naka_underground","lada_fight_happy","lada_fight_angry","nl_rosa_win_por",...NL_ORDER.filter(k=>k!=="ladda").map(k=>`nl_${k}_por`),...NL_ORDER.map(k=>G.F["nl_"+k]&&G.F["nl_"+k].sprite?G.F["nl_"+k].sprite+"_sheet":null).filter(Boolean),"nl_ladda_hood_sheet","nl_ladda_sheet","nl_ladda_blood_sheet",...pool.map(f=>`${f.id}_fight_happy`)];
    const el=document.createElement("div");el.className="rg-load";el.innerHTML=`<div class="rgl-in"><b>🂠 ท่าเรือคลองเตย</b><p>รถค่ายเลี้ยวเข้าซอยโกดังร้าง ไฟหน้ารถส่องประตูเหล็กที่เปิดแง้มไว้รอ…</p><div class="rgl-bar"><i></i></div></div>`;document.body.appendChild(el);
    const bar=el.querySelector(".rgl-bar i");let n=0;const one=src=>new Promise(r=>{const im=new Image();im.onload=im.onerror=()=>{n++;bar.style.width=Math.round(n/L.length*100)+"%";r();};im.src=ASSET+src+".webp";});
    const t0=Date.now();Promise.race([Promise.all(L.map(one)),new Promise(r=>setTimeout(r,8000))]).then(()=>setTimeout(()=>{el.remove();done();},Math.max(0,1100-(Date.now()-t0))));},
  vsArt(f,side,win){const A={kati:1,mali:1,rin:1,ploy:1,fah:1,baibua:1,tabtim:1,alicia:1,chaba:1,pailin:1};
    if(f.nl==="ladda")return `<img src="${ASSET}lada_fight_${win?"happy":"angry"}.webp" alt="">`;
    if(f.nl)return `<img src="${ASSET}nl_${f.nl}${f.nl==="rosa"&&win?"_win":""}_por.webp" alt="">`; /* v1.91.23: Man's Naka League portraits */
    if(A[f.id])return `<img src="${ASSET}${f.id}_fight_happy.webp" alt="">`;
    return `<canvas width="128" height="128" data-sprite="${f.id}" data-mode="guard" ${side==="r"?'data-flip="1"':""}></canvas>`;},
  boardHTML(){const R=G.region,F=R.final,pool=this.finalPool(G),L=F.line=F.line||{},K=F.clear=F.clear||{};
    if(!F.live){F.cur={};F.clear={};for(const k in K)delete K[k];} /* v1.91.53 (Man): a lost night starts again from bout 1 (v1.91.24 kept the bouts already won) */
    const C=F.cur=F.cur||{};
    for(const k of NL_ORDER)if(!C[k]&&L[k]&&!pool.some(f=>f.id===L[k]))delete L[k];
    for(const k of NL_ORDER)if(!C[k])delete L[k]; /* v1.91.72 (Man): our side starts empty — each bout's fighter is picked when that bout comes up, then the prep screen locks her in */
    const ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const v=Object.values(C),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,next=NL_ORDER.find(k=>!C[k]);
    if(UI.rgPick&&!C[UI.rgPick]){const k=UI.rgPick,o=G.F["nl_"+k],at=id=>NL_ORDER.find(x=>L[x]===id);
      return `<div class="vsb"><h2>นัด ${NL_ORDER.indexOf(k)+1} · ใครจะขึ้นชกกับ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)}</p>
        <div class="vs-pick">${pool.map(f=>{const x=at(f.id),done=x&&C[x];return `<button class="vs-pc" data-act="rgfset" data-v="${k}|${f.id}" ${done?"disabled":""}>
          <span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}${done?" · ชกไปแล้ว":""}</small></button>`;}).join("")}</div>
        <div class="mfoot"><button class="btn" data-act="rgfpickx">กลับ</button></div></div>`;}
    const stamp=(r,sd)=>r?`<i class="vs-st ${sd} ${r==="W"?"w":r==="L"?"l":"d"}">${r==="W"?"WIN":r==="L"?"LOSE":"DRAW"}</i>`:"";
    const rows=NL_ORDER.map((k,i)=>{const o=G.F["nl_"+k],kept=!!(K[k]&&!L[k]),me=kept?G.F[K[k]]:L[k]&&G.F[L[k]],r=C[k],their=r==="W"?"L":r==="L"?"W":r;
      return `<div class="vs-row ${r?"done":""} ${kept?"kept":""} ${k===next?"next":""}">
        <div class="vs-l ${r&&their!=="W"?"lost":""}"><span class="vs-art">${o?this.vsArt(o,"l",their==="W"):""}</span><span class="vs-tx">${(n=>`<b>${esc(n[0])}</b>${n[1]?`<em>${esc(n.slice(1).join(" "))}</em>`:""}`)(NL[k].name.split(" "))}<small>${esc(NL[k].art)}</small></span></div>
        <div class="vs-mid">VS<small>นัด ${i+1}</small></div>
        <button class="vs-r ${r&&r!=="W"?"lost":""}" data-act="rgfslot" data-v="${k}" ${r||k!==next?"disabled":""}>${me?`<span class="vs-tx"><b>${esc(me.name)}</b><small>${kept?"ชนะไว้ครั้งก่อน":`Lv.${me.lvl||1}`}</small></span><span class="vs-art">${this.vsArt(me,"r")}</span>`:`<span class="vs-tx vs-empty"><b>${k===next?"+ เลือกนักมวย":"รอ"}</b></span>`}</button>${stamp(their,"vsl")}${stamp(r,"vsr")}</div>`;}).join("");
    const nk=next&&NL_ORDER.indexOf(next)+1,usedIds=new Set(NL_ORDER.filter(k=>C[k]).map(k=>F.line&&F.line[k]).filter(Boolean)),left=pool.filter(f=>!usedIds.has(f.id)).length;
    return `<div class="vsb"><div class="vs-head"><span class="vs-tl">นาคาลีก</span><b class="vs-sc">${w>0||l>0?`${l} – ${w}`:"VS"}</b><span class="vs-tr">ค่ายศิริชัย</span></div>
      <p class="meta vs-sub">ห้าต่อห้า · ชนะสามได้ไป · แตะช่องสีน้ำเงินของนัดถัดไปเพื่อเลือกนักมวย แล้วเตรียมไฟต์ · แพ้แล้วต้องเริ่มใหม่ตั้งแต่นัดแรก มาใหม่ได้สัปดาห์หน้า · ไม่มีบาดเจ็บค้างหลังไฟต์</p>
      <div class="vs-rows">${rows}</div>
      <div class="mfoot">${next?`${F.live?"":`<button class="btn" data-act="closeModal">ไว้ก่อน</button>`}${left?`<button class="btn primary" data-act="rgfslot" data-v="${next}">เลือกนักมวยนัด ${nk} ▸</button>`:`<button class="btn red" data-act="rgfforfeit">ไม่มีนักมวยเหลือ · ยอมแพ้นัด ${nk}</button>`}`:`<button class="btn primary" data-act="rgfend">ดูผลไฟต์ใต้ดิน ▸</button>`}</div></div>`;},
  finalNext(){const R=G.region,F=R.final,C=F.cur=F.cur||{},k=NL_ORDER.find(x=>!C[x]);if(!k||!(F.line||{})[k])return;UI.modal=null;UI.rgPick=null;
    F.live=true;this.finalBout(k);},
  finalBout(k){const R=G.region,F=R.final,i=NL_ORDER.indexOf(k),me=G.F[F.line[k]];if(!me)return;
    const keep={injury:me.injury||0,fatigue:me.fatigue||0},o=nlFighter(G,k,me);
    const b={id:`nlf${F.tries||0}_${i}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",gprep:null,region:{nlfinal:k}};
    G.bookings.push(b);save();
    const S=NL_SAY[k],spk=t=>k==="ladda"?{n:"lada",l:"fight",f:"angry",t}:{n:"npc",who:NL[k].name,t},
      after=()=>{const res=F.cur[k],t=S&&(res==="W"?S.lose:res==="L"?S.win:null);const fin=()=>{UI.modal={type:"rgfline"};render();};
        if(t)playScene([spk(t)],fin,{bg:"naka_underground",look:"fight"});else if(k==="ladda"&&res==="L")playScene([{n:"nar",t:"ลดาเดินกลับมุมโดยไม่หันมามองแม้แต่ครั้งเดียว"}],fin,{bg:"naka_underground",look:"fight"});else fin();};
    const go=()=>openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);me.injury=keep.injury;me.fatigue=keep.fatigue;this.flush(G);
      if(!F.cur[k])F.cur[k]="L";save();after();});
    if(S)playScene([spk(F.tries?S.again:S.first)],go,{bg:"naka_underground",look:"fight"});else go();},
  finalEnd(){const R=G.region,F=R.final,v=Object.values(F.cur||{}),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,beat=(F.cur||{}).ladda==="W";F.tries=(F.tries||0)+1;F.live=false;UI.modal=null;
    if(w>=3){for(const m of G.mail||[])if(m.bk)m.done=true;F.won=true;F.stage="done";F.wonAbs=gameWeek(G);F.score=`${w}–${l}`;F.beatLadda=beat;R.hall=R.hall||[];R.hall.push({k:"naka",season:G.season||1,score:F.score,ladda:beat});
      for(const r of RG_ORDER)rgTouch(G,RG_CID[r]);G.rep+=3;
      AU.startMusic&&AU.startMusic("victory");playScene(rgFinalWin(G,w,l,beat,F.line.ladda),()=>{AU.startMusic&&AU.startMusic("hub");save();render();},{bg:"naka_underground",look:"casual"});return;}
    F.abs=gameWeek(G)+1;F.cur={};F.clear={}; /* v1.91.53 (Man): back next week at the earliest, from bout 1 */
    playScene(rgFinalLose(G,w,l),()=>{save();UI.modal={type:"rgflost"};render();},{bg:"naka_underground",look:"casual"});},
});
/* v1.91.27 (Man): legend mode — optional, after the underground final. Stars: ★ win · ★★ win without going down · ★★★ that, and inside the distance */
const LEG_UP={n:1.05,l:.6}, /* v1.91.38: the final got harder — legend members stay where they were (~29%), legend Ladda stays above the final */LEG_DUST=4;
Object.assign(REGION,{
  legStars(n){return `<span class="rg-stars">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}">★</i>`).join("")}</span>`;},
  legendCard(G){const R=G.region,F=R.final;if(!F||!F.won)return "";const L=R.legend=R.legend||{},tot=NL_ORDER.reduce((a,k)=>a+(L[k]||0),0),used=R.legWk===gameWeek(G);
    return `<section class="px card rg-final rg-leg ${tot>=15?"won":""}"><h3>✦ ระดับตำนาน · นาคาลีก <small class="meta">${tot}/15 ดาว</small></h3>
      <p class="meta">ไม่บังคับ · เก่งกว่าไฟนอลใต้ดิน · สัปดาห์ละ 1 ไฟต์ · บาดเจ็บและความล้าคิดตามจริง · ★ ชนะ · ★★ ชนะโดยไม่ล้มเลย · ★★★ ไม่ล้มและจบก่อนครบยก · ดาวใหม่ดวงละเศษดาว ${LEG_DUST}</p>
      <div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><span>${this.legStars(L[k]||0)} <button class="btn sm" data-act="rglegpick" data-v="${k}" ${used?"disabled":""}>ท้า ▸</button></span></div>`).join("")}</div>
      ${used?`<p class="meta">สัปดาห์นี้ชกระดับตำนานไปแล้ว</p>`:""}</section>`;},
  /* v1.91.78 (Man): the legend tier opens from a Naka letter (the regional tab is only the ranking board now) */
  legendMail(G){const R=G.region,F=R&&R.final;if(!F||!F.won||R.legMail)return;R.legMail=1;
    addMail(G,{kind:"letter",tone:"naka",lg:1,from:"นาคาลีก",title:"ระดับตำนาน · นาคาลีก",body:"ถึง ค่ายศิริชัย\n\nทีมนาคาลีกกลับมาซ้อมแล้ว และเก่งกว่าคืนนั้น\nใครอยากเจออีก มาได้สัปดาห์ละหนึ่งไฟต์ กติกาเปิด ห้ายก\n\nเก็บดาวให้ครบสิบห้าดวง แล้วเราจะยอมรับว่าค่ายคุณคือของจริง"});},
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
  rgfline:()=>{const F=G.region&&G.region.final;if(!F||F.won||gameWeek(G)<F.abs)return;UI.rgPick=null;UI.modal=null;render();REGION.finalLoad(()=>{const open=()=>{UI.modal={type:"rgfline"};render();};if(F.live){open();return;}
    F.live=true;save();AU.startMusic&&AU.startMusic("hub");playScene(rgFinalIntro(G),open,{bg:"naka_underground",look:"casual"});});},
  rgfswap:()=>{const U=UI.fight;if(!U||!U.b||!U.b.region||!U.b.region.nlfinal||U.stage!=="pre")return;const k=U.b.region.nlfinal,F=G.region.final;G.bookings=G.bookings.filter(x=>x.id!==U.b.id);if(F.line)delete F.line[k];UI.fight=null;UI.rgPick=k;UI.modal={type:"rgfline"};save();render();},
  rgfp:d=>{const U=UI.fight;if(U&&U.b&&U.b.region&&U.b.region.nlfinal){U.b.gprep=d.v;render();}},
  rgfslot:d=>{const F=G.region.final;if((F.cur||{})[d.v])return;UI.rgPick=d.v;render();},
  rgfpickx:()=>{UI.rgPick=null;render();},
  rgfset:d=>{const [k,id]=d.v.split("|"),F=G.region.final,L=F.line=F.line||{},C=F.cur||{};if(C[k])return;
    const was=NL_ORDER.find(x=>L[x]===id);if(was&&C[was])return;L[k]=id;UI.rgPick=null;save();REGION.finalNext();},
  rgfforfeit:()=>{const F=G.region.final,k=NL_ORDER.find(x=>!(F.cur||{})[x]);if(!k)return;F.cur=F.cur||{};F.cur[k]="L";F.live=true;save();render();},
  rgfgo:()=>REGION.finalNext(),
  rgfend:()=>{const F=G.region.final;if(NL_ORDER.every(k=>(F.cur||{})[k]))REGION.finalEnd();},
  rgfagain:()=>{const F=G.region.final;if(gameWeek(G)<F.abs){UI.modal=null;render();return;}F.cur={};F.live=false;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfhome:()=>{const F=G.region.final;F.abs=gameWeek(G)+1;UI.modal=null;addMail(G,{kind:"letter",tone:"black",bk:1,from:"เกริก นาคา",title:"การ์ดสีดำใบใหม่",body:"ประตูยังเปิดอยู่ครับ ผู้จัดการ\nพักให้หาย แล้วกลับมาใหม่\n\n— เกริก นาคา"});save();render();},
});
if(typeof XMODAL!=="undefined"){XMODAL.rgfline=()=>({body:REGION.boardHTML(),foot:false});XMODAL.rgleg=m=>({body:REGION.legPickHTML(m.k),foot:false});
  XMODAL.rgflost=()=>({body:`<h2>แพ้ไฟต์ใต้ดิน</h2><p>ครั้งหน้าต้องชกใหม่ตั้งแต่นัดแรกทั้งห้านัด · กลับไปซ้อม แล้วจัดทีมใหม่ได้ตั้งแต่สัปดาห์หน้า หรือรอจนกว่าจะพร้อม</p><div class="mfoot"><button class="btn primary" data-act="rgfhome">กลับไปซ้อม</button></div>`,foot:false});}
if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgtravel=()=>({body:REGION.travelHTML(G),foot:false});XMODAL.rgfin=m=>({body:REGION.finHTML(m.r),foot:false});XMODAL.rglegend=()=>({body:`${REGION.legendCard(G)}<div class="mfoot"><button class="btn" data-act="closeModal">ปิด</button></div>`,foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.rgParty=null;UI.rgNow=false;UI.rgStep=1;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfinopen:d=>{UI.modal={type:"rgfin",r:d.v};render();},
  rglegopen:()=>{if(!G.region||!G.region.final||!G.region.final.won)return;REGION.css();UI.modal={type:"rglegend"};render();},
  rgtravel:()=>{if(!REGION.travelOk(G))return;UI.modal={type:"rgtravel"};render();},
  rgtravelto:d=>{UI.rgFid=null;UI.rgParty=null;UI.rgNow=true;UI.rgStep=1;UI.modal={type:"rgplan",dest:d.v};render();},
  rgparty:d=>{const P=UI.rgParty=UI.rgParty||[],i=P.indexOf(d.v);if(i>=0)P.splice(i,1);else if(P.length<roadSeats(G))P.push(d.v);render();},
  rgstep:d=>{UI.rgStep=+d.v;render();},
  rgcoach:()=>{UI.rgNoCoach=!UI.rgNoCoach;if(UI.rgParty)UI.rgParty=UI.rgParty.slice(0,roadSeats(G));render();},
  rgtdev:d=>{if(!G.devTravel)return;const v=d.v,R=G.region;
    if(v.startsWith("car:")){const k=v.slice(4);G.decor=G.decor||{};G.decor.vehicle=k;G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks.vehicle=[...new Set([...(G.decorUnlocks.vehicle||[]),k])];}
    else if(v==="coach"){G.coachAwayAbs=roadCoachIn(G)?gameWeek(G)+4:0;}
    else if(v==="quick"){R.quickPref=!R.quickPref;}
    else if(v==="reset"){REGION.cancel(G);R.nextTripAbs=0;for(const r of RG_ORDER){const B=R.belts[r]||{};RG[r].prov.slice(2).forEach(p=>delete B[p]);R.belts[r]=B;}G.cash=Math.max(G.cash,200000);G.bookings=G.bookings.filter(b=>b.week!==G.week||!(G.F[b.a]&&G.F[b.a].camp==="player"));}
    save();render();},
  rggonow:d=>{const r=REGION.book(G,d.v,UI.rgFid,true);if(!r.ok){toast(r.why);return;}UI.modal=null;UI.rgParty=null;UI.rgNow=false;AU.sfx&&AU.sfx("level");save();endWeek();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rgclosetest:()=>{const R=G.region,first=R&&!R.final;if(first)REGION.openFinal(G);REGION.playClose(()=>{if(first)REGION.blackCard(G);save();render();});}, /* v1.91.85: the test button also deals the black card (Man watched the closing from here and never got one) */
  rgquick:()=>{G.region.quickPref=!G.region.quickPref;save();render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;UI.rgParty=null;AU.sfx&&AU.sfx("level");toast(`นัดเดินทางสัปดาห์ ${r.wk} แล้ว · จ่ายค่าเดินทาง ${fmt(r.cost)}`);save();render();},
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
/* v1.91.43: each joined champion's own Lv.42 legend skills — old id (her partner's) → [new id, name, desc, signature bonus] */
const RG_CAP={
 baibua:{kati_0a5:["baibua_0a5","บัวบานกลางสังเวียน","Lv.42 · ขั้นตำนาน · เตะที่บานออกเหมือนกลีบบัว · แรงเตะ +20% เตะแม่น +5% คะแนนเตะ +8% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})],kati_0b5:["baibua_0b5","ตำราเตะบัวท่าเสา","Lv.42 · ขั้นตำนาน · เตะตามตำราที่ค่ายบัวสืบกันมา · เตะแม่น +5% คะแนนเตะ +12% สวนกลับ +3% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})],kati_1a5:["baibua_1a5","ศอกกลีบบัวพลิกฟ้า","Lv.42 · ขั้นตำนาน · ศอกกลับหลังที่ทั้งเชียงใหม่รู้จัก · แรงศอก +20% แรงหมัด +8% ศอกแม่น +4% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})],kati_1b5:["baibua_1b5","หมัดฝนดอยสุเทพ","Lv.42 · ขั้นตำนาน · หมัดถี่เหมือนฝนบนดอย · แรงหมัด +18% หมัดแม่น +4% คะแนนหมัด +8% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})],kati_2a5:["baibua_2a5","บัวไม่จมน้ำ","Lv.42 · ขั้นตำนาน · ล้มกี่ครั้งก็โผล่พ้นน้ำ · เลือดต่ำแม่นขึ้น 6% ฟื้นแรง +15% กำลังใจมีผล +2% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})],kati_2b5:["baibua_2b5","ม่านหมอกล้านนา","Lv.42 · ขั้นตำนาน · รับแล้วสวนกลับจากในหมอก · หลบ +3% สวนกลับ +5% แรงหมัดสวน +15% · ลายเซ็นใบบัว: สวนกลับ +1%",r=>({ctr:.01*r})]},
 tabtim:{ploy_0a5:["tabtim_0a5","หมัดลำซิ่งพิมาย","Lv.42 · ขั้นตำนาน · หมัดหนักตามจังหวะพิณ · แรงหมัด +22% หมัดแม่น +3% คะแนนหมัด +6% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})],ploy_0b5:["tabtim_0b5","ยิ้มก่อนชก ชนะก่อนใคร","Lv.42 · ขั้นตำนาน · ยิ้มให้คู่ชกก่อน แล้วชนะ · หมัดแม่น +5% แรงหมัด +14% สวนกลับ +3% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})],ploy_1a5:["tabtim_1a5","ทับทิมแดงลอยฟ้า","Lv.42 · ขั้นตำนาน · กระโดดเตะจากฟ้าลงกลางเวที · แรงเตะ +20% เตะแม่น +4% คะแนนเตะ +8% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})],ploy_1b5:["tabtim_1b5","ล็อกคอปราสาทหิน","Lv.42 · ขั้นตำนาน · ล็อกแน่นเหมือนหินพิมาย · แรงเข่า +20% ป้องกันวงใน +0.6 เข่าแม่น +3% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})],ploy_2a5:["tabtim_2a5","กำแพงเสียงหัวเราะ","Lv.42 · ขั้นตำนาน · ยิ่งโดนยิ่งหัวเราะ ยิ่งสวนแรง · หลบ +3% สวนกลับ +5% แรงหมัดสวน +15% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})],ploy_2b5:["tabtim_2b5","เสียงแคนคุมเกม","Lv.42 · ขั้นตำนาน · คุมจังหวะทั้งไฟต์เหมือนเป่าแคน · คำสั่งพักยก +45% ความแม่นพื้นฐาน +1.5% สวนกลับ +4% · ลายเซ็นทับทิม: แรงเตะ +2%",r=>({dmg:{kick:.02*r}})]},
 alicia:{rin_0a5:["alicia_0a5","ราชินีสวนกลับ","Lv.42 · ขั้นตำนาน · สวนกลับอย่างสง่างามต่อหน้ากล้อง · สวนกลับ +6% แรงหมัดสวน +22% หมัดแม่น +3% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})],rin_0b5:["alicia_0b5","เงาบนจอไลฟ์","Lv.42 · ขั้นตำนาน · เร็วจนกล้องจับได้แค่เงา · หลบ +3% สวนกลับ +5% แรงหมัดสวน +12% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})],rin_1a5:["alicia_1a5","บทพูดก่อนชก","Lv.42 · ขั้นตำนาน · ชนะตั้งแต่สัมภาษณ์ก่อนขึ้นเวที · คำสั่งพักยก +50% ความแม่นพื้นฐาน +1.8% สวนกลับ +3% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})],rin_1b5:["alicia_1b5","กระดานของเจ้าหญิง","Lv.42 · ขั้นตำนาน · ทั้งสังเวียนคือกระดานของเธอ · คำสั่งพักยก +35% สวนกลับ +5% แรงหมัดสวน +10% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})],rin_2a5:["alicia_2a5","ประตูวังอยุธยา","Lv.42 · ขั้นตำนาน · ลูกถีบที่ไม่มีใครผ่านเข้าวังได้ · เตะแม่น +5% คะแนนเตะ +12% หลบ +2% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})],rin_2b5:["alicia_2b5","ระบำเจ้าหญิงริมน้ำ","Lv.42 · ขั้นตำนาน · ฟุตเวิร์กหมุนรอบคู่ชกเหมือนเต้นรำ · หลบ +3.5% ใช้แรงน้อยลง 3% เตะแม่น +3% · ลายเซ็นอลิเซีย: หมัดแม่น +1%",r=>({hit:{punch:.01*r}})]},
 chaba:{mali_0a5:["chaba_0a5","ศอกคลื่นอันดามัน","Lv.42 · ขั้นตำนาน · ศอกที่ซัดมาเป็นระลอก · แรงศอก +20% แรงเข่า +10% ศอกแม่น +3% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})],mali_0b5:["chaba_0b5","ดึงคอลงทะเล","Lv.42 · ขั้นตำนาน · ดึงคอลงสองจังหวะเหมือนคลื่นดูด · แรงเข่า +16% แรงศอก +12% เข่าแม่น +3% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})],mali_1a5:["chaba_1a5","พายุชบาแดง","Lv.42 · ขั้นตำนาน · อาวุธต่อเนื่องจนคู่ชกตั้งตัวไม่ทัน · แรงเตะ +16% เตะแม่น +5% หลบ +2% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})],mali_1b5:["chaba_1b5","เรือหางยาวหลบคลื่น","Lv.42 · ขั้นตำนาน · หลบไหลไปตามคลื่น · ฟื้นแรง +20% หลบ +2.5% ใช้แรงน้อยลง 3% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})],mali_2a5:["chaba_2a5","หินผาพังงา","Lv.42 · ขั้นตำนาน · ยืนนิ่งเหมือนเขาหินกลางทะเล · ป้องกันวงใน +1 หลบ +3% ฟื้นแรง +10% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})],mali_2b5:["chaba_2b5","ชบาบานยกสุดท้าย","Lv.42 · ขั้นตำนาน · ยิ่งท้ายไฟต์ยิ่งบาน · เลือดต่ำแม่นขึ้น 5% สวนกลับ +4% กำลังใจมีผล +2% · ลายเซ็นชบา: หลบ +1%",r=>({evade:.01*r})]}};
const rgFxAdd=(a,b)=>{const o={...a};for(const k in b){if(b[k]&&typeof b[k]==="object"){o[k]={...(a[k]||{})};for(const w in b[k])o[k][w]=(o[k][w]||0)+b[k][w];}else o[k]=(o[k]||0)+b[k];}return o;};
const RG_TRAIT={
 baibua:{name:"ครูศอกท่าเสา",desc:"ศอกสวนแบบท่าเสาติดตัว (สวน +5% ศอก +12%) · สอนศอกให้ทั้งค่าย: นักมวยที่ศอก/การสวนยังไม่ถึง 17 ขึ้นเองทุกสัปดาห์"},
 tabtim:{name:"เสียงหัวเราะอีสาน",desc:"เตะแม่น หลบไว ติดตัว · อยู่ที่ไหนที่นั่นครึกครื้น: กำลังใจทุกคนในค่าย +2 ทุกสัปดาห์"},
 alicia:{name:"ดาวไลฟ์",desc:"หมัดหนักและกันวงในติดตัว · ไลฟ์ซ้อมกับค่าย: ได้ค่าโฆษณาทุกสัปดาห์ (ขึ้นกับชื่อเสียงค่าย) และชื่อเสียงค่อย ๆ ขึ้น"},
 chaba:{name:"มือซ่อมเงียบ",desc:"หลบไวและฟื้นแรงเร็วติดตัว · ดูแลคนเจ็บเหมือนดูแลพี่ชาย: นักมวยที่บาดเจ็บหายเร็วขึ้นสัปดาห์ละ 1 สัปดาห์"}};
const RG_JOIN={
 baibua:{letter:"ผู้จัดการเจ้า\n\nหนูคิดมาตั้งแต่คืนที่ได้ถ้วยแล้ว ว่าอยากซ้อมที่ค่ายศิริชัยเจ้า อยากชกข้าง ๆ กะทิ บ่ใช่ชกกับกะทิ\n\nพ่อบอกว่าครูมวยท่าเสาสอนให้ไปหาคนที่ทำให้หมัดเราดีขึ้น บ่ใช่อยู่ที่เดิมตลอด\n\nถ้าค่ายมีห้องว่าง หนูขอสมัครเน้อเจ้า\n— ใบบัว",
  leave:[{n:"nar",t:"เช้าวันย้ายค่าย หมอกยังไม่จาง ใบบัวกราบครูที่ศาลไม้หน้าค่ายเดิม"},{n:"baibua",f:"sad",l:"casual",t:"ครูเจ้า หนูไปอยู่ค่ายอื่นแล้วเน้อ… บ่ได้ทิ้งท่าเสาเจ้า หนูจะเอาไปด้วย"},
   {n:"nar",t:"ครูผูกด้ายขาวที่ข้อมือให้เธอหนึ่งเส้น แล้วตบหลังเบา ๆ สองที"},{n:"baibua",f:"happy",l:"casual",t:"พ่อฝากไส้อั่วมาให้ทั้งค่าย บอกว่าถ้ากินแล้วอร่อย ให้ดูแลลูกสาวพ่อดี ๆ"}],
  arrive:[{n:"nar",t:"ใบบัวยืนหน้าป้ายค่ายศิริชัย ถือกระเป๋าสองใบกับกล่องไส้อั่วอีกหนึ่งกล่อง"},{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการ… ฝากตัวด้วยนะ หนูจะไม่ทำให้ผิดหวัง"}],
  pair:"พี่ใบบัว! ห้องอยู่ข้างหนูเลยค่ะ หนูปูที่นอนไว้ให้แล้ว!",pairBack:"…ขอบใจนะกะทิ ท่าเสาสองคนในค่ายเดียว ครูคงยิ้มอยู่แน่ ๆ เจ้า",
  hang:[
   [{n:"nar",t:"ใบบัวชวนไปตลาดเช้า เธอเลือกผักอย่างตั้งใจราวกับเลือกคู่ชก"},{n:"baibua",f:"happy",l:"casual",t:"แกงฮังเลต้องใช้หมูสามชั้น… ผู้จัดการกินเผ็ดได้ไหม",choice:[
     {t:"\"ได้ เผ็ดแค่ไหนก็กิน\"",b:4,then:[{n:"baibua",f:"flustered",l:"casual",t:"งั้นหนูจะใส่พริกเพิ่มนะ… แต่ถ้าน้ำตาไหลห้ามโทษหนูนะ"}]},
     {t:"\"ทำแบบที่บ้านเธอกินเลย\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…แบบที่พ่อชอบ หนูไม่ได้ทำให้ใครกินนานแล้ว"}]}]}],
   [{n:"nar",t:"ค่ำแล้ว ใบบัวนั่งปักผ้าลายตีนจกอยู่หน้าห้อง เข็มเล็กกว่าที่คิด"},{n:"baibua",f:"flustered",l:"casual",t:"ปักให้กะทิ… ไม่ใช่ ปักให้ทั้งค่าย อันนี้ของผู้จัดการ เอ๊ย ไม่ใช่ ยังไม่เสร็จ",choice:[
     {t:"\"รอได้ ไม่รีบ\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…งั้นหนูจะปักช้า ๆ นะ"}]},
     {t:"\"สอนฉันปักบ้างได้ไหม\"",b:4,then:[{n:"nar",t:"ผ่านไปครึ่งชั่วโมง ผ้าของคุณมีดอกบัวหนึ่งดอก หน้าตาเหมือนกะหล่ำ"},{n:"baibua",f:"happy",l:"casual",t:"งามเจ้า… สวยแบบกะหล่ำปลี"}]}]}],
   [{n:"nar",t:"เช้ามืด ใบบัวซ้อมศอกกลับหลังกับกระสอบ ไม่ได้ยินเสียงคุณเดินมา"},{n:"baibua",f:"surprised",l:"fight",t:"เอ๊ะ! ผู้จัดการ… ดูอยู่นานแล้วเหรอ",choice:[
     {t:"\"ศอกนั้นสวยที่สุดที่เคยเห็น\"",b:5,then:[{n:"baibua",f:"flustered",l:"fight",t:"…ห้ามพูดแบบนี้ตอนหนูถือศอกอยู่ มันจะพลาด"}]},
     {t:"จับกระสอบให้เธอซ้อมต่อ",b:4,then:[{n:"nar",t:"ศอกต่อไปเบาลงนิดหนึ่ง เธอบอกว่ากลัวคุณเจ็บ"}]}]}]],
  love:[{n:"nar",t:"เสาร์นี้ใบบัวพาไปถนนคนเดิน มือเธอหาเจอเองในฝูงคน"},{n:"baibua",f:"flustered",l:"casual",t:"ถ้าหลงกัน… ก็จับไว้แบบนี้นะ"},{n:"baibua",f:"happy",l:"casual",t:"หนูไม่ได้กลัวหลงหรอก"}],
  conf:G=>[{n:"nar",t:"ดึกแล้ว ใบบัวมาเคาะประตู ถือผ้าคลุมลายตีนจกผืนเดิมจากดอยสุเทพ"},{n:"baibua",f:"flustered",l:"casual",t:"หนูเขียนไว้ในจดหมายสัญญาแล้ว แต่ลบออก… เพราะอยากพูดเอง"},{n:"baibua",f:"flustered",l:"casual",t:G.player.gender==="f"?"หนูฮักปี้เจ้า… ปี้จะตอบเมื่อไหร่ก็ได้เน้อ":"หนูฮักอ้ายเจ้า… อ้ายจะตอบเมื่อไหร่ก็ได้เน้อ"}],
  yes:G=>G.player.gender==="f"?"…เจ้า หนูจะเรียกปี้แบบนี้ทุกวันเน้อ บ่ต้องแอบเรียกแล้ว":"…เจ้า หนูจะเรียกอ้ายแบบนี้ทุกวันเน้อ บ่ต้องแอบเรียกแล้ว",no:"บ่เป็นหยังเจ้า หนูยังอยู่ค่ายนี้ ยังได้เห็นหน้าทุกวัน ก็พอแล้วเจ้า",bye:"…เจ้า หนูเข้าใจ หนูยังจะชกให้ค่ายนี้เต็มที่เหมือนเดิมเจ้า"},
 tabtim:{letter:"ผู้จัดการเด้อ\n\nแชมป์ภาคอีสานอย่างข้อยบ่เคยแพ้ใครง่าย ๆ แต่แพ้ค่ายศิริชัยแล้วมันคักหลาย อยากฮู้ว่าค่ายนี้ซ้อมจั่งใด๋\n\nเลยสิย้ายไปซ้อมนำเลย! พลอยบ่ต้องย้านเด้อ ข้อยบ่แย่งที่ ข้อยสิแย่งข้าวเหนียวอย่างเดียว\n\nถ้ามีห้องว่างตอบมาเด้อ\n— ทับทิม",
  leave:[{n:"nar",t:"คืนสุดท้ายที่ค่ายเก่า รุ่นน้องทั้งค่ายนั่งล้อมวงกินข้าวส่งทับทิม"},{n:"tabtim",f:"happy",l:"casual",t:"บ่ต้องฮ้องไห้เด้อพี่น้อง! ข้อยไปซ้อมเฉย ๆ บ่ได้ไปไส!"},
   {n:"nar",t:"ครูของเธอยื่นกระติบข้าวเหนียวใบใหญ่ให้ ทับทิมหัวเราะเสียงดัง แต่ตาแดง"},{n:"tabtim",f:"sad",l:"casual",t:"…ครูสอนข้อยตั้งแต่เตะต้นกล้วยบ่ล้ม ผู้จัดการต้องดูแลทับทิมดี ๆ นะ"}],
  arrive:[{n:"nar",t:"ทับทิมลงจากรถตู้พร้อมไก่ย่างสามถุงกับปลาร้าบองหนึ่งกระปุก"},{n:"tabtim",f:"happy",l:"casual",t:"ผู้จัดการ! จากนี้ทับทิมเป็นคนของค่ายศิริชัยแล้วนะ …หมายถึงนักมวย อย่าคิดมาก!"}],
  pair:"ห้องเธออยู่ตรงข้ามฉัน เสียงดังหลังสี่ทุ่มฉันเคาะผนังนะ",pairBack:"ฮ่า ๆ ได้เลยพลอย! เคาะมาเมื่อไหร่ ทับทิมจะเคาะตอบเป็นจังหวะกลองยาวเด้อ",
  hang:[
   [{n:"nar",t:"ทับทิมลากคุณไปร้านส้มตำ สั่งเองทั้งโต๊ะโดยไม่เปิดเมนู"},{n:"tabtim",f:"happy",l:"casual",t:"ตำปูปลาร้าพริกสิบเม็ด! ผู้จัดการเอาจั๊กเม็ด?",choice:[
     {t:"\"สิบเม็ดเหมือนเธอ\"",b:5,then:[{n:"nar",t:"สิบนาทีต่อมาคุณดื่มน้ำแข็งไปสามแก้ว"},{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ ใจถึง! ทับทิมชอบคนใจถึง …หมายถึงนักกินนะ!"}]},
     {t:"\"เม็ดเดียวพอ\"",b:3,then:[{n:"tabtim",f:"pout",l:"casual",t:"เม็ดเดียวก็เหมือนกินข้าวเปล่าแล้ว! เอ้า ทับทิมแบ่งของทับทิมให้คำหนึ่ง"}]}]}],
   [{n:"nar",t:"ทับทิมเปิดหมอลำจากโทรศัพท์ แล้วฟ้อนอยู่กลางลานค่ายคนเดียว"},{n:"tabtim",f:"happy",l:"casual",t:"มาฟ้อนด้วยกันนะผู้จัดการ! เท้าแบบนี้แหละที่ใช้เตะ",choice:[
     {t:"ลุกไปฟ้อนด้วย",b:5,then:[{n:"nar",t:"ทั้งค่ายออกมายืนดู ทับทิมจับมือคุณหมุนสามรอบแล้วหัวเราะจนนั่งลงกับพื้น"}]},
     {t:"นั่งตบมือให้จังหวะ",b:4,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…มองนานจังเลย ทับทิมก็เขินเป็นนะ"}]}]}],
   [{n:"nar",t:"หลังซ้อม ทับทิมนั่งเงียบผิดปกติ มองรูปน้องชายในชุดนักศึกษาในโทรศัพท์"},{n:"tabtim",f:"sad",l:"casual",t:"น้องชายทับทิมเอง… สอบติดนิติฯ แล้ว ทับทิมชกเพื่อส่งน้องเรียนให้จบ",choice:[
     {t:"\"เขาโชคดีที่มีพี่แบบเธอ\"",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าพูดแบบนี้ ทับทิมร้องไห้ง่ายนะ ไม่ได้พูดเล่น"}]},
     {t:"\"ค่ายนี้ช่วยเธอส่งเขาได้\"",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"ค่ายนี้ใจดีจริง ๆ… ทับทิมจะชกให้หนักกว่าเดิม"}]}]}]],
  love:[{n:"nar",t:"ริมโขงตอนพลบค่ำ ทับทิมเงียบไปนานกว่าทุกครั้ง"},{n:"tabtim",f:"flustered",l:"casual",t:"แต่ก่อนทับทิมคิดว่าความสุขคือการชนะ… ตอนนี้คือได้นั่งตรงนี้กับผู้จัดการ"},{n:"tabtim",f:"happy",l:"casual",t:"อย่าบอกใครนะว่าทับทิมพูดหวานเป็น!"}],
  conf:()=>[{n:"nar",t:"ทับทิมดึงคุณออกมาหลังค่าย ที่ที่เสียงหมอลำจากห้องเธอไม่ได้ยิน"},{n:"tabtim",f:"flustered",l:"casual",t:"ผู้จัดการ! ทับทิมพูดครั้งเดียวนะ ไม่ได้ล้อเล่นเหมือนทุกครั้ง"},{n:"tabtim",f:"flustered",l:"casual",t:"ทับทิมชอบผู้จัดการมาก… ข้อยมักเจ้าหลายแท้ …ตอบมาเลย ทับทิมไม่กลัวคำตอบ"}],
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
   {n:"chaba",f:"sad",l:"casual",t:"…จะกลับมาทุกงานชักพระ ไม่ขาด"},{n:"nar",t:"ชบาขึ้นรถโดยไม่หันหลังกลับ จนพ้นโค้งแรกถึงยอมมองกระจก"}],
  arrive:[{n:"nar",t:"ชบามาถึงพร้อมเป้ใบเดียวกับถุงขนมลา"},{n:"chaba",f:"happy",l:"casual",t:"ผู้จัดการ ฝากด้วย"}],
  pair:"พี่ชบา! ห้องข้างมะลิค่ะ มะลิปูผ้าปูที่นอนลายดอกชบาไว้ให้ด้วย!",pairBack:"…ม่ายต้องก็ได้ (คืนนั้นทั้งค่ายเห็นว่าเธอนอนกอดหมอนลายเดียวกัน)",
  hang:[
   [{n:"nar",t:"ชบาซ่อมรั้วหลังค่ายอีกแล้ว ทั้งที่รั้วไม่ได้พัง"},{n:"chaba",f:"happy",l:"casual",t:"ส่งค้อนมา",choice:[
     {t:"ส่งค้อนแล้วจับไม้ให้",b:5,then:[{n:"nar",t:"สองชั่วโมงผ่านไปแทบไม่มีใครพูด รั้วแข็งแรงขึ้นกว่าเดิมมาก"},{n:"chaba",f:"happy",l:"casual",t:"…หรอย วันนี้"}]},
     {t:"\"รั้วไม่ได้พังนะ\"",b:3,then:[{n:"chaba",f:"pout",l:"casual",t:"รู้ อยากตอก"}]}]}],
   [{n:"nar",t:"แมวจรตัวหนึ่งมานอนบนตักชบา เธอนั่งนิ่งไม่ขยับมาสี่สิบนาทีแล้ว"},{n:"chaba",f:"flustered",l:"casual",t:"…ไม่ได้ชอบ มันมาเอง",choice:[
     {t:"นั่งลงข้าง ๆ ไม่พูดอะไร",b:5,then:[{n:"nar",t:"แมวย้ายมานอนตักคุณ ชบามองแมวแบบโดนหักหลัง แล้วหัวเราะออกมาเบา ๆ"}]},
     {t:"\"ตั้งชื่อให้มันไหม\"",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…ไข่เค็ม (มะลิได้ยินแล้วดีใจทั้งวัน)"}]}]}],
   [{n:"nar",t:"เย็นวันอาทิตย์ ชบาวิดีโอคอลกับพี่ชาย แล้วยื่นโทรศัพท์มาให้กลางสาย"},{n:"chaba",f:"flustered",l:"casual",t:"พี่อยากคุยกับผู้จัดการ",choice:[
     {t:"\"ฝากน้องสาวไว้กับผมได้\"",b:5,then:[{n:"nar",t:"พี่ชายหัวเราะ ชบาแย่งโทรศัพท์คืนแล้ววางสายทันที หูแดงไปถึงคอ"}]},
     {t:"เล่าว่าชบาซ้อมหนักแค่ไหน",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…ไม่ต้องเล่าทุกเรื่องก็ได้"}]}]}]],
  love:[{n:"nar",t:"ชบาชวนออกไปทะเลตอนกลางคืน ขี่มอไซค์พ่วงข้างมาเอง ทั้งที่คุณมีรถ"},{n:"chaba",f:"flustered",l:"casual",t:"ให้นั่งคนแรกเหมือนเดิม"},{n:"chaba",f:"happy",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม ไซ ถามเหมือนเดิม"}],
  conf:()=>[{n:"nar",t:"ชบาเคาะประตูสามที แล้วยืนนิ่งอยู่นานจนคุณต้องเปิดเอง"},{n:"chaba",f:"flustered",l:"casual",t:"ผู้จัดการ"},{n:"nar",t:"ลมพัดผ่านไปหนึ่งรอบ"},{n:"chaba",f:"flustered",l:"casual",t:"…ชอบ แค่นั้น พูดยาวไม่เป็น"}],
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
const RG_GLINES={baibua:{love:"…ของหนูจริง ๆ เหรอเจ้า หนูจะเก็บไว้ดี ๆ นะ",like:"ขอบใจเจ้า น่ารักจัง",ok:"ขอบใจเจ้า",dislike:"…หนูจะลองดูนะเจ้า"},
 tabtim:{love:"โอ๊ย! อันนี้แหละที่ทับทิมอยากได้! ชอบมากเลยเด้อ!",like:"ขอบใจเด้อ! ทับทิมจะใช้ทุกวันเลย",ok:"ขอบใจหลายเด้อ",dislike:"…อันนี้ทับทิมอ่านแล้วง่วงเด้อ แต่ขอบใจนะ"},
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
  perkCard(f){const r=f&&RG_ORDER.find(x=>RG_CID0[x]===f.id),R=G.region;if(!r||!R||!R.joined||!R.joined[f.id])return "";if(typeof TRAITS!=="undefined"&&TRAITS[f.id])return ""; /* v1.91.45: shown in the hidden-power box now */const P=RG_CH0[r].perk;
    return `<div class="sigcard on rg-perk"><b>✦ ท่าประจำตัว: ${esc(P.name)}</b><p class="meta">${esc(P.desc)} · ติดตัวมาตั้งแต่เป็นแชมป์${esc(RG0[r].name)} มีผลทุกไฟต์ ไม่ต้องใส่ช่องสกิล</p>${typeof traitLvRow==="function"&&G.F[f.id]&&G.F[f.id].camp==="player"?traitLvRow(f,true):""}</div>`;},
  joinRooms(G){const R=G.region,J=R.joined||{};return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player").length+Object.keys(J).filter(c=>G.F[c]&&G.F[c].camp==="player").length;},
  /* the champion's skill tree is her lineage's — the partner girl's tree (Tha Sao / Korat / Lopburi / Chaiya) */
  /* v1.91.45: each champion's second hidden power (the first is the signature perk she brought as a champion) */
  /* v1.91.45 (Man): every champion has her tree from the start — as a rival she fights with skills learned along her own line, and the same tree comes with her when she joins */
  treeInit(){for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(typeof REQ_ALIAS!=="undefined")REQ_ALIAS[cid]=pr;
      {const P=RG_CH0[r].perk,T2=RG_TRAIT2[cid];if(typeof TRAITS!=="undefined"&&P&&T2&&!TRAITS[cid])TRAITS[cid]=[{id:"rgp_"+cid,name:P.name,desc:P.desc,fx:P.fx},{id:"rg2_"+cid,...T2}];}
      if((!SKILLS[cid]||SKILLS[cid]===SKILLS[pr])&&SKILLS[pr]){const C=RG_CAP[cid]||{};SKILLS[cid]=SKILLS[pr].map(s=>{const c=C[s.id];if(!c)return s;const [id,name,desc,ad]=c;return {...s,id,name,desc,fx:r=>rgFxAdd(s.fx(r),ad(r))};});}}},
  /* fresh build along her home line: 3 points a level, home line first, then build lines, then the rest */
  autoLearn(G,cid){const f=G.F[cid];if(!f)return;f.skills={};f.equip=[];f.sp=3*Math.max(0,(f.lvl||1)-1);const L=RG_HOME_LINE[cid],ord=[...skillList(cid)].sort((x,y)=>((x.line===L?0:x.school==="build"?1:2)-(y.line===L?0:y.school==="build"?1:2)));
    let go=true;for(let i=0;go&&f.sp>0&&i<400;i++){go=false;for(const sk of ord){if(f.sp>0&&learnSkill(G,cid,sk.id)){go=true;break;}}}},
  joinSkills(G){this.treeInit();const J=(G.region&&G.region.joined)||{};for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(!J[cid])continue;
      {const g=G.F&&G.F[cid];if(g&&g.trLv==null){g.trLv=3;g.trBase=3;}} /* v1.91.45 (Man): same standard as the main five — two hidden powers to switch, 10 levels at 5 points; a champion arrives at Lv.3 (her full champion strength) */
    /* v1.91.43 (Man): same roots as her lineage partner, but the Lv.42 legend tips are her own — new name, her story, plus a small signature bonus */
    {const f=G.F&&G.F[cid],C=RG_CAP[cid]||{};if(f)for(const o in C){const n=C[o][0];if(f.skills&&f.skills[o]){f.skills[n]=(f.skills[n]||0)+f.skills[o];delete f.skills[o];}if(Array.isArray(f.equip))f.equip=f.equip.map(x=>x===o?n:x);}}
    /* v1.91.38: in the camp she fights like a main-cast fighter on her lineage's lines — her own home line, the line's style, the same per-line balance as her partner */
    if(typeof HOME_STYLE!=="undefined"&&!HOME_STYLE[cid]){const L=RG_HOME_LINE[cid],sch=(SKILLS[pr]||[]).find(s=>s.school&&s.school!=="build");HOME_LINE[cid]=L;HOME_STYLE[cid]=((LINE_STYLE[sch&&sch.school]||[])[L])||HOME_STYLE[pr];if(LINE_K[pr]&&!LINE_K[cid])LINE_K[cid]=LINE_K[pr];}}},
  joinWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||!F.won||now<(F.wonAbs||0)+3)return;R.joined=R.joined||{};R.offers=R.offers||[];R.joinQ=R.joinQ||[];R.offers=R.offers.filter(c=>!R.joined[c]);R.joinQ=R.joinQ.filter(c=>!R.joined[c]&&!(R.joinPend&&R.joinPend.cid===c));
    const m=R.meet||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&!(R.champ[r]&&R.champ[r].state==="won"))continue;if(!R.joined[cid]&&!(R.joinPend&&R.joinPend.cid===cid)&&!R.offers.includes(cid)&&!R.joinQ.includes(cid)&&!(R.joinGone||{})[cid]&&(m[cid]||0)>=RG_JOIN_MIN)R.joinQ.push(cid);}
    R.joinQ.sort((a,b)=>(m[b]||0)-(m[a]||0));
    if(R.joinQ.length&&now>=(R.joinNext||0)){const cid=R.joinQ.shift(),r=RG_ORDER.find(x=>RG_CID0[x]===cid);R.offers.push(cid);R.joinNext=now+RG_JOIN_GAP;
      rgSay(G,r,`ใบสมัครจาก${RG[r].champ}`,RG_JOIN[cid].letter+`\n\n(สัญญา: ค่าเซ็น ${fmt(RG_JOIN_FEE)} · ค่าจ้าง ${fmt(RG_JOIN_WAGE)}/สัปดาห์ · ลักษณะพิเศษ: ${RG_TRAIT[cid].name} · ย้ายมาแล้วต้องปั้นใหม่: เลเวลลดลง 5 ค่าพลังลดลงเล็กน้อย · ดูสัญญาที่หน้าค่าย › ครู & นักมวย)`);}},
  joinOk(G,cid){const R=G.region;if(!R.offers||!R.offers.includes(cid)||(R.joined&&R.joined[cid]))return "ไม่มีสัญญานี้";if(R.joinPend)return "รอคนที่ตอบรับไปก่อนหน้าย้ายมาก่อน";{const r=RG_ORDER.find(x=>RG_CID0[x]===cid);if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&R.champ[r]&&R.champ[r].state!=="won")return "เธอกำลังป้องกันแชมป์ภาค · ชนะถ้วยครั้งนี้ก่อน";}
    if(this.joinRooms(G)>=dormRooms(G))return `ห้องพักเต็ม (${dormRooms(G)} ห้อง) · อัปเกรดหอพักก่อน`;if(G.cash<RG_JOIN_FEE)return `เงินไม่พอ · ค่าเซ็น ${fmt(RG_JOIN_FEE)}`;return "";},
  joinAccept(G,cid){const why=this.joinOk(G,cid);if(why){toast(why);return;}const R=G.region;G.cash-=RG_JOIN_FEE;R.offers=R.offers.filter(x=>x!==cid);R.joinPend={cid,abs:gameWeek(G)+1};
    G.log=G.log||[];G.log.push(`เซ็นสัญญากับ${G.F[cid]?G.F[cid].name:cid} · ค่าเซ็น ${fmt(RG_JOIN_FEE)} · ย้ายมาสัปดาห์หน้า`);toast(`เซ็นสัญญาแล้ว · ${G.F[cid]?G.F[cid].name:""}ย้ายมาสัปดาห์หน้า`);},
  joinApply(G,cid){if(G.region.joined&&G.region.joined[cid])return; /* v1.91.35: never twice */const R=G.region,r=RG_ORDER.find(x=>RG_CID0[x]===cid),f=G.F[cid]||this.champFighter(G,r),pair=G.F[RG_CH[r].pair],now=gameWeek(G);
    f.camp="player";f.canon=true;f.met=true;f.div=(pair&&(pair.div==="A"||pair.div==="B"))?pair.div:"A";
    f.lvl=Math.max(10,(f.rgSkLv||f.lvl||14)-RG_JOIN_LVDROP);for(const k in f.a)f.a[k]=Math.round(Math.min(20,f.a[k])*RG_JOIN_STAT*10)/10;f.vet=0; /* v1.91.45 (Man): she has to be rebuilt — level −5, stats ×0.9, ring craft stays behind */
    f.spv=2;f.xp=0;f.wage=RG_JOIN_WAGE;f.fee=0;f.potential=20;f.fatigue=0;f.injury=0;f.morale=80;f.trust=Math.max(f.trust||0,50);
    f.bond=Math.max(f.bond||0,Math.max(30,rgBondOf(R.meet[cid])));f.joinAbs=now;f.lastTouch=absWeek(G);delete f.rgKey;delete f.rgT;delete f.rgSty;
    G.rank=G.rank||{A:{},B:{}};G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
    (R.joined=R.joined||{})[cid]=now;this.joinSkills(G);
    /* v1.91.39 (Man): she arrives with her skills already learned along her own line, like a fighter who has been building for years — the player can look and reset */
    this.autoLearn(G,cid);delete f.rgSkLv;if(typeof syncFighterAges==="function")syncFighterAges(G);
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
      if((f.bond||0)<75||now-(J[cid]||now)<6||(R.confN[cid]||0)>=3||noCnt(G,cid)>=LOVE_ASK_MAX)continue;if(R.confNo[cid]!=null&&now-R.confNo[cid]<13)continue;return cid;}return null;},
  confSteps(G,cid){const J=RG_JOIN[cid],R=G.region,two=partners(G).length>0||Object.keys(R.lov||{}).some(k=>k!==cid);R.confN[cid]=(R.confN[cid]||0)+1;
    const warn=two?[{n:"nar",t:"⚠ คุณมีคนรักอยู่แล้ว ถ้าตอบรับจะกลายเป็นคบซ้อน… แชมป์ภาคเข้าทีมฮาเร็มไม่ได้"}]:[];
    return [...J.conf(G),...warn,{n:"nar",t:"เธอรอคำตอบ",choice:[
      {t:two?"\"ฉันก็ชอบเธอ\" (คบซ้อน)":"\"ฉันก็ชอบเธอ\"",fx:G2=>REGION.takeC(G2,cid),then:[{n:cid,f:"happy",l:"casual",t:J.yes(G)}]},
      {t:"\"ขอเป็นแบบนี้ไปก่อนนะ\"",fx:G2=>{G2.region.confNo[cid]=gameWeek(G2);add(G2,cid,"trust",3);befriend(G2,cid);},then:[{n:cid,f:"sad",l:"casual",t:J.no}]}]}];}, /* v1.91.68: counts toward the one love rule (3 asks → steps back → reaches out once) */
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
     <p class="meta">ย้ายค่ายแล้วร่างกายยังไม่เข้าที่ · มาถึงเลเวลลดลง 5 ค่าพลังลดลงเล็กน้อย ต้องปั้นต่อในค่ายเรา (พลังแฝงและลักษณะพิเศษติดมาเต็ม) · ไม่ตอบก็ได้ สัญญายังรออยู่</p></section>`;},
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
    addMail(G,{kind:"letter",tone:"naka",from:"นาคาเอเนอร์จี้ดริงค์",title:`จดหมายเชิญ: ศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed}`,
      body:`เรียน ผู้จัดการค่ายศิริชัย\n\nศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed} เปิดแล้ว · เข็มขัดจังหวัดทั้ง 16 เส้นตัดสินใหม่ด้วยศึกคัดเลือกในแต่ละจังหวัด ผู้ชนะคือแชมป์จังหวัดคนใหม่ที่รอค่ายของท่านอยู่\n\nแชมป์ภาค\n${lines}\n\nเก็บเข็มขัดให้ครบสี่จังหวัด แล้วท้าชิงถ้วยเหมือนเดิม`});
    G.log=G.log||[];G.log.push(`ศึกชิงเจ้าสี่ภาค ครั้งที่ ${ed} เริ่มแล้ว`);},
});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);
/* v1.91.60 (Man): the closing ceremony's climax is a real cutscene — the hooded Ladda takes the four regional champions apart one by one on the ring (sprites, specials, effects), then the dialogue picks up */
const RG_SHOW=[
 {cid:"baibua",steps:[[200,"cap","ใบบัวขึ้นเวทีเป็นคนแรก ยกศอกตั้งการ์ดแบบท่าเสา"],[900,"sp","A","baibua_special","ศอกบัวบานกลับหลัง"],[2400,"play","miss","A","elbow"],[2500,"cap","ลดาเอียงหน้าหลบ ศอกเฉียดคางไปไม่กี่มิล"],
   [3100,"sp","B","nl_ladda_sp_superman","ซูเปอร์แมนพันช์"],[4500,"play","ko","B","punch"],[4600,"cap","ใบบัวล้มลงกลางเวที ไม่ทันได้ยกการ์ด"]],end:6200},
 {cid:"tabtim",steps:[[200,"cap","ทับทิมกระโดดข้ามเชือกเข้ามา ไม่รอให้ใครห้าม"],[800,"sp","A","tabtim_special","เตะกระโดดทับทิมแดง"],[2300,"play","miss","A","kick"],[2400,"cap","ลดาก้าวเข้าใต้ลูกเตะก่อนขาจะเหยียดสุด"],
   [3000,"sp","B","nl_ladda_sp_headkick","เตะก้านคอ"],[4400,"play","ko","B","kick"],[4500,"cap","ทับทิมหมุนกลางอากาศแล้วตกลงไปกองที่มุมเวที"]],end:6000},
 {cid:"alicia",steps:[[200,"cap","อลิเซียตั้งการ์ดสูง ไม่มีกล้องตัวไหนกล้ากดถ่าย"],[800,"sp","A","alicia_special","อัปเปอร์คัตเจ้าหญิง"],[2300,"play","miss","A","punch"],[2700,"play","miss","A","punch"],[3000,"cap","ลดาก้มหลบทุกหมัด แล้วหายไปด้านหลัง"],
   [3600,"play","takedown","B","punch"],[4500,"play","tap","B","punch"],[4700,"cap","รัดคอจากด้านหลัง… อลิเซียตบพื้นในห้าวินาที"]],end:6300},
 {cid:"chaba",steps:[[200,"cap","ชบาบุกเข้ามาไม่ถอยเลยสักก้าว"],[700,"play","hit","A","punch"],[1100,"play","hit","A","punch"],[1500,"play","hit","A","elbow"],[1700,"cap","ลดาปล่อยให้โดนสามหมัด ถอยจนหลังติดเชือก…"],
   [2600,"sp","B","nl_ladda_sp_superman","ซูเปอร์แมนพันช์"],[3900,"play","takedown","B","punch"],[4400,"play","gnp","B","punch"],[4800,"play","gnp","B","punch"],[5200,"play","ko","B","punch"],[5300,"cap","…แล้วใช้แรงนั้นเองดึงชบาลงพื้น"]],end:6800}];
Object.assign(REGION,{
  playClose(done){if(G.region){delete G.region.closeDare;delete G.region.closeFace;}const S=rgClose(G),i=S.findIndex(x=>x&&x.cut==="ladda"),a=i<0?S:S.slice(0,i+1),b=i<0?[]:S.slice(i+1),opt={bg:"closing_ceremony",look:"fight"}; /* v1.91.74 (Man): tense faces — the casual art has no shocked/sad face, the ring gear does */
    playScene(a,()=>{if(i<0){done();return;}this.laddaShow(()=>playScene(b,done,opt));},opt);},
  laddaShow(done){if(typeof document==="undefined"||typeof FS==="undefined"){done();return;}
    const old=document.getElementById("rg-show");if(old)old.remove();
    const el=document.createElement("div");el.id="rg-show";el.className="rg-show";
    el.innerHTML=`<div class="rgs-in"><canvas width="960" height="540"></canvas><div class="rgs-cap"></div><button class="btn sm rgs-skip">ข้ามฉาก ▸</button></div>`;document.body.appendChild(el);
    const cv=el.querySelector("canvas"),cap=el.querySelector(".rgs-cap"),T=[];let fin=false;
    const L={id:"nl_ladda_show",name:"ลดา",sprite:"nl_ladda_hood",canon:false,color:"#f2f2f7"};
    const end=()=>{if(fin)return;fin=true;T.forEach(clearTimeout);LOOPS.delete&&LOOPS.delete(FS.render);el.remove();FS.cv=null;done();};
    el.querySelector(".rgs-skip").onclick=()=>{AU.sfx&&AU.sfx("ui");end();};
    const champ=cid=>{const f=G.F[cid];return f?{...f,camp:f.camp==="player"?"rival":f.camp}:{id:cid,name:cid,canon:true};};
    ["nl_ladda_sp_superman","nl_ladda_sp_headkick"].forEach(n=>img(n+".webp"));
    let at=300;
    RG_SHOW.forEach((B,bi)=>{const t0=at;
      T.push(setTimeout(()=>{FS.init(cv,"bg_closing_ceremony.webp",champ(B.cid),L);FS.A.x=FS.A.base=330;FS.B.x=FS.B.base=630;if(bi===0){LOOPS.add(FS.render);startLoops();}AU.sfx&&AU.sfx("bell");},t0));
      B.steps.forEach(st=>T.push(setTimeout(()=>{const now=performance.now();
        if(st[1]==="cap")cap.textContent=st[2];
        else if(st[1]==="sp"){FS.special({side:st[2],mv:{img:st[3],noHit:st[2]==="A"}, /* v1.91.63: the champions' specials miss Ladda — no impact burst on her */name:st[4],head:st[2]==="B"?"ลดา":RG[RG_ORDER.find(r=>RG_CID0[r]===B.cid)].champ},0,now);AU.sfx&&AU.sfx(st[2]==="B"?"kd":"elbow");}
        else if(st[1]==="play"){FS.play({ev:st[2],side:st[3],w:st[4],crit:true},now);AU.sfx&&AU.sfx(st[2]==="miss"?"miss":st[2]==="ko"?"kd":st[4]||"punch");}},t0+st[0])));
      at+=B.end;});
    T.push(setTimeout(()=>{const now=performance.now();FS.init(cv,"bg_closing_ceremony.webp",champ("chaba"),L);FS.A.ko=true;FS.A.down=now-2000;FS.B.win=true;FS.B.anim="win";FS.B.x=FS.B.base=560;cap.textContent="ลดายืนอยู่คนเดียวกลางเวที ฮู้ดสีขาวไม่เลื่อนหลุดเลยสักครั้ง";},at));
    T.push(setTimeout(end,at+3200));}});

/* v1.91.47 (playtest): styles go in as soon as the chapter loads — the underground board opened before the regional tab was visited showed full-size portraits */
try{REGION.css();}catch(e){}

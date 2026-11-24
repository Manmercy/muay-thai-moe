// ================= MUAY THAI MOE — MERIT & THE GHOST OF THE BANANA TREE "นางตานี" (v1.91.144, Man 24 พ.ย.) =================
// Phase 1: camp merit (บุญ) from merit-making, the wai kru and new big merit events; it slowly runs down when nobody makes merit.
// Once the camp is big and busy, Nang Tani — whose banana trees the fighters kick in training (and whose trunks went into krathongs) —
// wakes up and starts haunting dreams: a random fighter boxes her in the dream while the manager can only shout; losing means a week
// in bed with a fever. Enough merit and Kru Daeng and Luang Pho suggest a spirit house; once it stands, Tani turns protector,
// hints lottery numbers and keeps the fighters healthy. A mor phi can be hired as an expensive, unreliable shortcut.
// Light comedy on purpose: at most one ghost-fever at a time, haunts several weeks apart, a skip option that never forces a fight.
(()=>{
const GH_MAX=100,GH_DECAY=3,GH_CD=4;
const ghSt=G=>{if(!G.gh)G.gh={merit:40,on:0,stage:0,last:-99,haunts:0,wins:0,shrine:0,shrineOK:0,calm:0,mw:-1};return G.gh;};
const ghAdd=(G,n)=>{const S=ghSt(G);S.merit=clamp(Math.round(S.merit+n),0,GH_MAX);S.mw=gameWeek(G);return S.merit;};
const ghWk=(d,m)=>dateWeek(d,m);
/* the Buddhist calendar on the game's year (week 1 = 25 May) */
const GH_LENT=()=>[ghWk(30,6),ghWk(25,9)];            /* เข้าพรรษา → ออกพรรษา */
const GH_KATHIN=()=>[ghWk(26,9),ghWk(24,10)];         /* the month after ออกพรรษา */
const GH_ORDAIN=()=>[ghWk(1,3),ghWk(10,4)];           /* summer novice ordination, April – early May */
const ghIn=(G,[a,b])=>a<=b?G.week>=a&&G.week<=b:G.week>=a||G.week<=b;
const ghMood=G=>{const S=ghSt(G);return S.shrine?"smile":S.stage>=2?"angry_smile":S.stage>=1?"angry":"scary";};
BGIMG.dream="bg_dream.webp";BGIMG.dream_room="bg_dream_room.webp";TIER_BG.dream="bg_dream.webp";
/* the ghost theme: slow heartbeat klong, a low drone that slips a tritone, a wobbling pi and a far-off bell */
AU.GHM=[57,0,0,60,0,58,0,0,64,0,63,0,0,0,0,0,57,0,60,0,61,0,0,0,52,0,0,0,0,51,0,0];
AU.ghostStep=function(s,t,spb){const m=this.music,st=s%16;
  if(st===0||st===2)this.tone(t,{f:st?70:85,to:45,dur:.25,peak:st?.32:.42,bus:m});
  if(s===0||s===16)this.tone(t,{f:s?51.9:55,dur:spb*15,peak:.16,type:"triangle",bus:m});
  if(s===4)[1760,2640,3520].forEach((f,k)=>this.tone(t,{f,dur:2.4/(k+1),peak:.05/(k+1),bus:m}));
  if(s===24)this.tone(t,{f:930,to:610,dur:spb*6,peak:.05,bus:m});
  const n=this.GHM[s];if(n){const f=440*Math.pow(2,(n-69)/12),c=this.ctx,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),bp=c.createBiquadFilter(),g=c.createGain();
    o.type="sawtooth";o.frequency.value=f;lfo.frequency.value=3.2;lg.gain.value=f*.03;lfo.connect(lg);lg.connect(o.frequency);bp.type="bandpass";bp.frequency.value=900;bp.Q.value=2.2;
    const dur=spb*3.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.25);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(bp);bp.connect(g);g.connect(m);[o,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05);});}};
{const _ps=AU.playStep;AU.playStep=function(s,t,spb){if(this.mode==="ghost"){this.ghostStep(s,t,spb);return;}return _ps.call(this,s,t,spb);};
 const _sm=AU.startMusic;AU.startMusic=function(mode){_sm.call(this,mode);try{if(mode==="ghost"&&this.ctx){this.tempo=60;if(this.music)this.music.gain.setTargetAtTime(.3,this.ctx.currentTime,.4);}}catch(e){}};
 const _st=AU.setTempo;AU.setTempo=function(b){if(this.mode==="ghost")return;return _st.call(this,b);};}
const GMON=()=>({inject:()=>{try{AU.startMusic("ghost");if(UI.scene)UI.scene.music="ghost";}catch(e){}return [];}}),GMOFF=()=>({inject:()=>{try{AU.startMusic("hub");if(UI.scene)UI.scene.music=null;}catch(e){}return [];}});
const ghPlay=(steps,done,opts)=>{playScene([GMON(),...steps],()=>{try{AU.startMusic("hub");}catch(e){}done&&done();},opts);};
{const _fs=fightStart;fightStart=function(q){_fs(q);try{if(UI.fight&&UI.fight.b&&UI.fight.b.dream)AU.startMusic("ghost");}catch(e){}};}
const TANI="นางตานี",LP="หลวงพ่อ",MP="หมอผีเปลี่ยน";
const TN=(t,img)=>({n:"npc",who:TANI,img:"tani_"+(img||ghMood(G)),t}),N=t=>({n:"nar",t}),C=t=>({n:"coach",t}),MY=t=>({n:"me",t});
const GL=(id,f,t,l)=>({n:id,f,l:l||"casual",t});

/* ---------- ghost fighters ---------- */
Object.assign(QK,{
 tani:{fst:"counter",name:"นางตานี (ในฝัน)",sprite:"tani",lvl:0,tilt:{speed:1.5,kick:1.5,foot:1,counter:1,dur:-1,power:-.5},color:"#3f8a4f",grp:"ghost"},
 krasue:{fst:"pressure",name:"กระสือ",sprite:"krasue",lvl:.3,tilt:{speed:2,elbow:1.5,dur:-2,clinch:-1.5},color:"#b04fd0",grp:"ghost"},
 krahang:{fst:"footwork",name:"กระหัง",sprite:"krahang",lvl:.3,tilt:{speed:1.5,kick:2,foot:1.5,power:-1},color:"#8a5a2b",grp:"ghost"},
 mabong:{fst:"power",name:"ผีม้าบ้อง",sprite:"mabong",lvl:.5,tilt:{power:2,kick:2,dur:1.5,iq:-1.5,guard:-1},color:"#3c3550",grp:"ghost"},
 phiphong:{fst:"inside",name:"ผีโพง",sprite:"phiphong",lvl:.4,tilt:{clinch:2,knee:1.5,power:1,foot:-1.5},color:"#d0602a",grp:"ghost"}});
const GSK={tani:[{id:"g_t_leaf",name:"กาบกล้วยฟาดหน้า",k:"atk",w:"kick"},{id:"g_t_sabai",name:"สไบพันรอบตัว",k:"def"},{id:"g_t_lol",name:"หัวเราะคิกคักกลางดึก",k:"atk",w:"elbow"}],
 krasue:[{id:"g_k_fly",name:"ลอยหัวพุ่งชน",k:"atk",w:"elbow"},{id:"g_k_glow",name:"แสงไส้วูบวาบ",k:"def"}],
 krahang:[{id:"g_h_fan",name:"กระด้งฟาดลม",k:"atk",w:"kick"},{id:"g_h_fly",name:"บินหนีขึ้นหลังคา",k:"def"}],
 mabong:[{id:"g_m_hoof",name:"กีบเท้าเตะเปรี้ยง",k:"atk",w:"kick"},{id:"g_m_neigh",name:"ร้องฮี้ข่มขวัญ",k:"rec"}],
 phiphong:[{id:"g_p_light",name:"ไฟโพงส่องตา",k:"def"},{id:"g_p_grab",name:"กอดคอกลิ่นคาว",k:"atk",w:"knee"}]};
TIER.dream={name:"ชกกับผีในฝัน",win:0,lose:0,rep:0,off:1};
TIER_BG.dream="bg_camp_night.webp";
/* the ghost is as strong as the fighter she meets, a little stronger when the camp's merit is low */
function ghFoe(G,kind,f){const K=QK[kind],S=ghSt(G),adj=(S.merit<25?1.2:S.merit<45?.5:S.merit>=70?-.5:0)-(kind!=="tani"&&S.shrine?.6:0),t=Math.min(19.2,qTarget(G,f.id)+adj+(K.lvl||0)),rng=mulberry32((G.seed^0x6a05)+gameWeek(G)*31+kind.length);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_ghost_"+kind;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  {const short=t-ovr(a);if(short>.05)o.vet=+Math.min(Q_VET_MAX,short).toFixed(2);}
  o.sprite=K.sprite;o.kind=kind;o.grp="ghost";o.fstyle=K.fst;o.nlsk=(GSK[kind]||[]).slice(0,S.merit<30?3:2);o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=80;G.F[id]=o;syncFighterAges(G);return id;}

/* ---------- merit sources ---------- */
const GH_ACT={
 bigmerit:{name:"ทำบุญใหญ่ เลี้ยงพระที่ค่าย",desc:"บุญค่าย +16 · กำลังใจทุกคน +4",cost:8000,merit:16},
 phapa:{name:"ร่วมทอดผ้าป่าที่วัดใกล้ค่าย",desc:"บุญค่าย +12 · ชื่อเสียง +0.3",cost:4000,merit:12,gap:6},
 kathin:{name:"เป็นเจ้าภาพทอดกฐิน",desc:"บุญค่าย +30 · กำลังใจทุกคน +6 · ชื่อเสียง +1 (ปีละครั้ง หลังออกพรรษา)",cost:20000,merit:30,win:GH_KATHIN,yearly:1},
 ordain:{name:"เป็นเจ้าภาพบวชเณรภาคฤดูร้อน",desc:"บุญค่าย +24 · ชื่อเสียง +1 (ปีละครั้ง ช่วงเมษายน)",cost:15000,merit:24,win:GH_ORDAIN,yearly:1},
 morphi:{name:"จ้างหมอผีมาทำพิธีไล่ผี",desc:"ผีเงียบไปสักพัก… ถ้าพิธีได้ผล (ไม่รับประกัน)",cost:6000,merit:0},
 shrine:{name:"ตั้งศาลนางตานีข้างกอกล้วย",desc:"ศาลถาวร · นางตานีคุ้มครองค่าย บอกใบ้หวย นักมวยแข็งแรงขึ้น",cost:60000,merit:5},
 offer:{name:"ถวายของที่ศาลนางตานี",desc:"บุญค่าย +4 · นางตานีอารมณ์ดี",cost:300,merit:4}};
const ghActOpen=(G,k)=>{const S=ghSt(G),A=GH_ACT[k];if(!S.on)return false;S.done=S.done||{};
  if(k==="morphi")return !S.shrine;if(k==="shrine")return S.shrineOK&&!S.shrine;if(k==="offer")return !!S.shrine;
  if(A.win&&!ghIn(G,A.win()))return false;if(A.yearly&&S.done[k]===(G.season||1))return false;if(A.gap&&S.done[k+"Abs"]!=null&&gameWeek(G)-S.done[k+"Abs"]<A.gap)return false;return true;};
for(const k of Object.keys(GH_ACT)){const A=GH_ACT[k];CAMP_ACTIONS["gh_"+k]={name:A.name,desc:A.desc,cost:A.cost,get hidden(){return typeof G==="undefined"||!G||!ghActOpen(G,k);}};}
const GH_MERIT_ACTS={merit:6,waikhru:10};
{const _d=doCampAction;doCampAction=function(G,k){const note=_d(G,k);if(note==null)return note;const S=ghSt(G);let add="";
  if(GH_MERIT_ACTS[k]){ghAdd(G,GH_MERIT_ACTS[k]);if(S.on)add=` · บุญค่าย +${GH_MERIT_ACTS[k]}`;}
  if(k.startsWith("gh_")){const kk=k.slice(3),A=GH_ACT[kk],R=roster(G);S.done=S.done||{};S.done[kk]=G.season||1;S.done[kk+"Abs"]=gameWeek(G);if(A.merit)ghAdd(G,A.merit);
    if(kk==="bigmerit"){R.forEach(f=>f.morale=clamp(f.morale+4,0,100));add="พระมาฉันเพลที่ค่าย ครูแดงนั่งพับเพียบนานจนขาชา ทุกคนยิ้มกันทั้งวัน";}
    if(kk==="phapa"){G.rep+=.3;add="ทุกคนช่วยกันแห่ต้นผ้าป่า กะทิตีกลองยาวเพี้ยนทั้งทาง แต่ทุกคนสนุก";}
    if(kk==="kathin"){G.rep+=1;R.forEach(f=>f.morale=clamp(f.morale+6,0,100));add="ขบวนกฐินค่ายศิริชัยยาวเกือบครึ่งกิโล ชาวบ้านพูดถึงทั้งตำบล";}
    if(kk==="ordain"){G.rep+=1;add="เด็กวัดสามคนได้บวชเณรภาคฤดูร้อน ตอนโกนผมร้องไห้ ตอนสวดมนต์เป็นแล้วยิ้มแก้มปริ";}
    if(kk==="morphi"){const ok=Math.random()<.55;S.mp=(S.mp||0)+1;if(ok){S.calm=gameWeek(G)+6;add="หมอผีเปลี่ยนรำดาบรอบกอกล้วย พ่นน้ำมนต์จนครูแดงเปียกทั้งตัว คืนนั้นเงียบสนิท… อย่างน้อยก็ช่วงนี้";}
      else{S.mpFail=1;add="หมอผีเปลี่ยนรำไปได้ครึ่งพิธี แล้ววิ่งหนีออกจากค่ายไปทั้งที่ยังถือไก่ต้ม ทิ้งรองเท้าไว้หนึ่งข้าง";}}
    if(kk==="shrine"){S.shrine=gameWeek(G);S.pendShrine=1;add="ศาลไม้เล็ก ๆ ทาสีเขียว ผูกผ้าแพรสามสีรอบต้นกล้วย ครูแดงจุดธูปเป็นคนแรก";}
    if(kk==="offer"){S.tb=clamp((S.tb||0)+2,0,ghCap(G));add="วางขนมต้ม กล้วยน้ำว้า กับน้ำแดงไว้หน้าศาล ลมพัดใบกล้วยไหวเบา ๆ เหมือนมีใครพยักหน้า";}
    return add+(A.merit?` · บุญค่าย +${A.merit}`:"");}
  return note+add;};}
/* the merit bar sits on top of the camp-activity list once Tani is awake */
{const _h=campActsHTML;campActsHTML=function(){const h=_h();if(typeof G==="undefined"||!G||UI.modal.pick)return h;const S=ghSt(G);if(!S.on)return h;
  const m=S.merit,lab=m>=70?"บุญหนุนนำ":m>=45?"ร่มเย็น":m>=25?"เริ่มวังเวง":"ขนลุกทั้งค่าย";
  return h.replace("</h2>",`</h2><div class="ghbar" title="บุญค่าย"><span>🪷 บุญค่าย</span><i><b style="width:${m}%"></b></i><em>${m} · ${lab}</em></div>`);};}

/* ---------- Tani wakes up ---------- */
const ghReady=G=>{try{return G.week>=6&&roster(G).length>=4&&students(G)>=30&&facTotal(G)>=8;}catch(e){return false;}};
EVENTS.push({id:"gh_wake",look:"casual",bg:"camp_night",pri:6,when:G=>!ghSt(G).on&&ghReady(G),steps:[
 N("ค่ายศิริชัยตอนนี้คึกคักกว่าที่เคย ห้องพักเต็ม ลานสอนคอร์สมีเด็กมาเตะเป้าทุกเย็น ส่วนกอกล้วยหลังค่าย… โดนเตะทุกวันเหมือนกัน"),
 C("เตะต้นกล้วยนี่แหละของจริง! สมัยครูยังเด็ก ไม่มีกระสอบทราย เตะต้นกล้วยจนหน้าแข้งด้านเป็นไม้"),
 N("คืนนั้น ลมหยุดพัดตั้งแต่ตีหนึ่ง จิ้งหรีดเงียบ หมาข้างค่ายหอนสามรอบแล้วหนีเข้าใต้ถุนบ้าน"),
 GMON(),N("คุณลืมตาขึ้นในความฝัน ตัวขยับไม่ได้ ข้างเตียงมีผู้หญิงชุดเขียวยืนอยู่ ผมยาวถึงพื้น ตัวเรืองแสงเขียวอ่อน ๆ"),
 TN("ใคร… เตะ… ต้นกล้วย… ของข้า…","scary"),
 MY("(พยายามจะตอบ แต่ปากขยับไม่ได้)"),
 TN("เตะทุกวัน… วันละสามร้อยที… แล้วตอนลอยกระทง… ใครเอากาบกล้วยข้าไปทำกระทง!!","scary"),
 TN("ลอยน้ำไปตั้งสามใบ… ใบนึงมีธูปปักเบี้ยวด้วย… ข้าจำได้หมด…","angry"),
 N("แล้วเธอก็นั่งลงบนอกคุณ หนักเหมือนกระสอบทรายห้าสิบกิโล คุณสะดุ้งตื่นตอนตีสาม เหงื่อท่วมหมอน"),
 GMOFF(),{n:"nar",t:"— เช้าวันต่อมา —",bg:"camp",show:[]},
 C("เมื่อคืนครูฝันแปลก ๆ มีผู้หญิงชุดเขียวมาด่าครูเรื่องต้นกล้วย…"),
 MY("…ผมก็ฝันแบบนั้นครับครู"),
 C("……"),
 N("ทั้งค่ายเงียบไปสามวินาที แล้วทุกคนก็เริ่มเล่าพร้อมกัน ฝันเหมือนกันหมด ต่างกันแค่ว่าใครโดนนั่งทับนานกว่า"),
 C("นั่นมันนางตานี! ผีต้นกล้วย! เราไปเตะบ้านเขาทุกวัน แถมเอากาบเขาไปลอยน้ำ… ครูว่าต้องรีบทำบุญแล้ว"),
 C("ทำบุญตักบาตร ไหว้ครู ทอดผ้าป่า อะไรก็ได้ที่เป็นบุญ บุญค่ายเยอะ ๆ ผีจะใจเย็นลง ถ้าบุญน้อยลงเมื่อไหร่… เธอมาเยี่ยมอีกแน่"),
 N("🪷 เปิดระบบ “บุญค่าย” — ดูได้ที่กิจกรรมค่าย ทำบุญ ไหว้ครู หรือกิจกรรมบุญใหญ่เพื่อเพิ่ม ถ้าไม่ทำอะไรเลย บุญจะค่อย ๆ ลดลง"),
 C("คืนนี้ครูจะสวดมนต์ก่อนนอน… สวดทุกคืนเลย สวดดัง ๆ ด้วย ใครนอนห้องติดครูขอโทษล่วงหน้า"),
],fx:null});
/* the wake event turns the system on (events have no fx, so a watcher does it right after) */
{const _rv=runEvents;runEvents=function(done){_rv(function(n){try{const S=ghSt(G);if(!S.on&&G.seen&&G.seen.gh_wake){S.on=1;S.wakeAbs=gameWeek(G);S.last=gameWeek(G);save();}}catch(e){}if(done)done(n);});};}

/* ---------- weekly: merit drifts down, the shrine looks after the fighters, story beats unlock ---------- */
function ghWeekly(G){const S=ghSt(G);if(!S.on&&G.seen&&G.seen.gh_wake){S.on=1;S.wakeAbs=gameWeek(G);S.last=gameWeek(G);}if(!S.on)return;
  if(gameWeek(G)-(S.mw??-99)>1)S.merit=clamp(S.merit-GH_DECAY,0,GH_MAX); /* no merit made last week: it runs down */
  if(S.merit>=45&&S.stage<1&&S.haunts>=1)S.stage=1;if(S.merit>=60&&S.stage<2&&S.haunts>=2)S.stage=2;
  if(!S.shrineOK&&S.merit>=60&&gameWeek(G)-(S.wakeAbs||0)>=6)S.shrineOK=1;
  if(S.shrine){for(const f of roster(G))f.fatigue=clamp(f.fatigue-(S.merit>=40?2:1),0,100);}
  if(S.sick&&G.F[S.sick]&&!G.F[S.sick].injury)S.sick=null;}
{const _w=xlWeekly;xlWeekly=function(G){_w(G);try{ghWeekly(G);}catch(e){console.error("ghost",e);}};}

/* ---------- the haunting: weekly extra scene ---------- */
const GH_OPEN=[
 [N("ตีสองสิบห้า คุณตื่นมาเพราะได้ยินเสียงใบกล้วยเสียดสีกัน ทั้งที่ไม่มีลมสักนิด"),N("ตัวขยับไม่ได้ ผ้าห่มหนักเหมือนตะกั่ว ปลายเตียงมีเงาเขียวนั่งยองอยู่")],
 [N("คืนนี้ครูแดงสวดมนต์ไปได้ครึ่งบท แล้วหลับคาหนังสือสวดมนต์"),N("คุณฝันว่ายืนอยู่กลางเวทีมวยที่ล้อมด้วยต้นกล้วยแทนเชือก กรรมการเป็นตุ๊กแกตัวเท่าคน")],
 [N("มีกลิ่นขนมต้มลอยมาในห้องนอน ตอนตีสาม ใครจะต้มขนมตอนตีสาม"),N("คุณขยับนิ้วเท้าไม่ได้ ผมยาว ๆ ค่อย ๆ ไหลลงมาจากเพดาน")]];
const GH_TANI_LINE=[["ดีละ… คืนนี้ข้ามาทวงค่าเช่าต้นกล้วย","เมื่อวานมีคนเตะต้นข้าอีกแล้ว… หนึ่งร้อยสิบสองที ข้านับ!","ทำบุญแค่นี้เหรอ… ข้าได้กลิ่นธูปแค่ดอกเดียว"],
 ["มาอีกแล้วนะ… ไม่ใช่เพราะคิดถึงหรอก ข้ามาเพราะบุญค่ายเจ้ามันน้อย","คราวก่อนแพ้ข้าไม่พอเหรอ หรือว่าชนะข้า… ข้าจำไม่ได้แล้ว แต่วันนี้เอาใหม่!"],
 ["ข้ายังไม่หายโกรธนะ แค่… โกรธน้อยลงนิดนึง","ใครเอาน้ำแดงมาวางหน้ากอกล้วย… ไม่ได้ขอบใจนะ แค่ถามเฉย ๆ"]];
const GH_ENTER={kati:"กะทิพังประตูฝันเข้ามาในชุดนอนลายหมี “ผีก็ต่อยได้! ผู้จัดการถอยไปค่ะ!”",
 mali:"มะลิโผล่มาในฝัน ร้องไห้ไปตั้งการ์ดไป “มะลิกลัวผีที่สุดในโลกเลยค่ะ… แต่ใครแตะผู้จัดการ มะลิไม่ยอม!”",
 rin:"รินเดินเข้ามาในฝันพร้อมสมุดจด “ผีไม่มีจริงค่ะ ตามหลักวิทยาศาสตร์… ทำไมขาฉันสั่นล่ะ”",
 ploy:"พลอยยืนกอดอกอยู่กลางฝัน “มารบกวนการนอนของคนในค่ายฉันเหรอ ขึ้นเวทีมาคุยกัน”",
 fah:"ฟ้าหาวหนึ่งที “ฮึ ผีเหรอ ปลุกฟ้าตอนตีสองเนี่ยนะ… เอาเถอะ ฟ้าหายง่วงแล้ว”",
 prod_B:"ใบหยกปรากฏตัวในฝันท่ายืนตรง “ตรวจพบสิ่งผิดปกติในความฝันของคุณผู้จัดการ เริ่มกำจัดค่ะ”",
 _:"{f}เดินเข้ามาในฝัน ขยี้ตาไปพลาง “ผู้จัดการ… ทำไมเราอยู่บนเวทีต้นกล้วยครับ”"};
const GH_MORN={kati:{w:"เมื่อคืนกะทิฝันว่าต่อยกับผีผู้หญิงชุดเขียว แล้วชนะด้วย! …ทำไมผู้จัดการทำหน้าแบบนั้นคะ ฝันเหมือนกันเหรอ!?",l:"กะทิตัวร้อนจี๋… เมื่อคืนฝันว่าโดนผีเตะด้วยกาบกล้วย ตื่นมาก็จับไข้เลย ฮัดชิ่ว!"},
 mali:{w:"มะลิฝันว่าชนะผีด้วยค่ะ! แต่มะลิร้องไห้ตลอดไฟต์เลย… ตื่นมาหมอนเปียกหมดเลย",l:"มะลิ… ตัวสั่นทั้งคืนค่ะ ฝันว่าแพ้ผีชุดเขียว แล้วเธอหัวเราะคิกคักอยู่ข้างหูทั้งคืน…"},
 rin:{w:"ฉันฝันว่าต่อยชนะอะไรบางอย่าง…สีเขียว ตามหลักแล้วความฝันคือสมองจัดระเบียบความจำ …ใช่ไหมคะ ใช่ไหม",l:"ฉันมีไข้ค่ะ อุณหภูมิ 38.4 ไม่เกี่ยวกับผีแน่นอน… ผู้จัดการช่วยเปิดไฟทิ้งไว้ให้ด้วยได้ไหมคะ"},
 ploy:{w:"เมื่อคืนพลอยฝันว่าชนะผี …เลิกยิ้มได้แล้ว พลอยไม่ได้กลัวสักหน่อย",l:"…พลอยไม่สบายนิดหน่อย ไม่ได้เกี่ยวกับความฝันแน่นอน อย่าไปเล่าให้ใครฟังนะคะ"},
 fah:{w:"ฟ้าฝันว่าเตะผีกระเด็นไปติดต้นมะม่วง ง่ายจะตาย แต่ทำไมตื่นมาเหนื่อยจัง",l:"ฮัดชิ่ว! …ฟ้าไม่ได้แพ้ผีนะ ฟ้าแค่ปล่อยให้ผีชนะ เพราะสงสารต่างหาก"},
 prod_B:{w:"บันทึกความฝัน: ชนะ เป้าหมายถอยไปทางกอกล้วย ใบหยกขอเพิ่มต้นกล้วยในรายการสิ่งที่ต้องเฝ้าระวังค่ะ",l:"ระบบ… มีไข้ค่ะ ใบหยกจะพักหนึ่งสัปดาห์ ขอเลื่อนตารางซ้อมทั้งหมดออกไปก่อน"},
 _:{w:"เมื่อคืนผมฝันว่าต่อยกับผีครับ แล้วก็ชนะด้วย แปลกดี",l:"ผมตัวร้อนครับ เมื่อคืนฝันว่าโดนผีกาบกล้วยฟาด…"}};
const GH_CHEER={push:"ตะโกน “ต่อยมันเลย! ผีก็มีหน้าให้ต่อย!”",counter:"ท่อง “อิติปิโส…” รัว ๆ เป็นกำลังใจ",range:"ตะโกน “อย่าให้มันเข้าใกล้! มันตัวเย็นนน!”",
 clinch:"ตะโกน “กอดมันไว้!” …แล้วเปลี่ยนใจ “เดี๋ยว! อย่ากอด!”",defend:"ตะโกน “ยกการ์ด! ยกมือไหว้ไปด้วยก็ได้!”"};
const GH_CHEER_TANI=["“ข้าได้ยินแล้ว!”","“เงียบ ๆ หน่อย ข้ากำลังเท่”","“เจ้าตะโกนเพี้ยนกว่าครูเจ้าสวดมนต์อีก”","“ฮิ ๆ เชียร์ข้าดังกว่านี้สิ!”"];
const GH_CHEER_BACK=["“รู้แล้วววว!”","“ผู้จัดการเงียบก่อนได้ไหม!”","“อิติปิโสอะไรตอนนี้!”","“ได้ยินแล้ว! ทั้งฝันได้ยินหมดแล้ว!”","(พยักหน้าทั้งที่กำลังโดนผีฟาด)"];
function ghHauntDue(G,rng){const S=ghSt(G);if(!S.on||S.shrine)return false;if(gameWeek(G)-S.last<GH_CD)return false;if(S.calm&&gameWeek(G)<S.calm)return false;
  const R=roster(G).filter(f=>!f.injury);if(!R.length)return false;const p=S.merit<25?.55:S.merit<45?.38:S.merit<70?.22:.12;return rng()<p;} /* even at merit 100 she still drops by now and then */
function ghPickFighter(G){const R=roster(G).filter(f=>!f.injury);const named=R.filter(f=>GH_ENTER[f.id]);const L=named.length&&Math.random()<.8?named:R;return L[Math.floor(Math.random()*L.length)];}
function ghHaunt(done){const S=ghSt(G),f=ghPickFighter(G);if(!f){done();return;}S.last=gameWeek(G);S.haunts++;save();
  const nm=f.name,enter=(GH_ENTER[f.id]||GH_ENTER._).replace(/\{f\}/g,nm),open=GH_OPEN[S.haunts%GH_OPEN.length],tl=GH_TANI_LINE[Math.min(2,S.stage)];
  const steps=[...open,TN(tl[S.haunts%tl.length]),N(enter),MY("(อยากช่วย แต่ขยับได้แค่ปาก… งั้นเชียร์อย่างเดียว)"),
   {choice:[{t:`ส่งเสียงเชียร์${nm}สุดใจ (ชกในฝัน)`,fx:()=>{UI.ghGo={fid:f.id,live:1};},then:[TN("ดี… ขึ้นมาเลย!")]},
    {t:"ท่องอิติปิโสรัว ๆ แล้วหลับตาปี๋ (ข้ามไฟต์ ให้ผลออกเอง)",fx:()=>{UI.ghGo={fid:f.id,live:0};},then:[N("คุณท่องอิติปิโสได้ถึงรอบที่สิบเจ็ด เสียงตุบตับในฝันค่อย ๆ เงียบลง…")]}]}];
  ghPlay(steps,()=>{const go=UI.ghGo;UI.ghGo=null;if(!go){done();return;}ghFight(go.fid,go.live,done);},{bg:"dream_room",look:"casual"});}
/* with her shrine up, Nang Tani sometimes takes the dream fight herself — a little stronger than the fighter she stands in for */
function ghAlly(G,f){const K=QK.tani,t=Math.min(19.4,qTarget(G,f.id)+.8),rng=mulberry32((G.seed^0x7a11)+gameWeek(G));const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_tani_ally",o=baseFighter(id,{name:TANI,full:TANI,div:"X",camp:"quest",color:K.color,potential:t+2,a});{const short=t-ovr(a);if(short>.05)o.vet=+Math.min(Q_VET_MAX,short).toFixed(2);}
  o.sprite="tani";o.kind="tani";o.grp="ghost";o.fstyle=K.fst;o.nlsk=GSK.tani.slice();o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=90;G.F[id]=o;syncFighterAges(G);return id;}
const GH_TANI_WIN=["ข้าเตะมันตกทุ่งนาไปแล้ว ไม่ต้องขอบใจ …ขอบใจก็ได้ ถ้าจะเอาน้ำแดงมาด้วย","ฮึ! ผีบ้านนอกพวกนี้ ไม่รู้หรือไงว่าค่ายนี้มีเจ้าที่","จระเข้ฟาดหาง! …ข้าดูนักมวยของเจ้าซ้อมทุกวัน จำท่ามาหมดแล้ว"];
function ghFight(fid,live,done,kind,taniOn){kind=kind||"tani";const f=G.F[fid],qid=ghFoe(G,kind,f),gn=GH_NAME[kind]||"ผี",ally=taniOn?ghAlly(G,f):null;
  if(ally){const fin=win=>{const S=ghSt(G);delete G.F[qid];delete G.F[ally];if(win){S.wins++;S.tb=clamp((S.tb||0)+2,0,ghCap(G));}else S.merit=clamp(S.merit-3,0,GH_MAX);save();
      ghPlay([N(win?`นางตานีหมุนตัวฟาดกาบกล้วย ${gn}กระเด็นหายไปในความมืด`:`${gn}หัวเราะลั่น นางตานีเซถอยไปพิงเสามุมเวที`),TN(win?GH_TANI_WIN[S.wins%GH_TANI_WIN.length]:"คืนนี้มันแรงกว่าที่คิด… ทำบุญให้ข้าเพิ่มหน่อย ข้าจะได้มีแรง",win?"angry_smile":"angry"),
        GMOFF(),{n:"nar",t:"— เช้าวันต่อมา —",bg:"camp",show:[]},GH_ENTER[f.id]?GL(f.id,"happy",`เมื่อคืนฝันว่านางตานีชกกับ${gn}แทนพวกเรา เท่มากเลย! ไม่มีใครไข้ขึ้นสักคน`):{n:"nar",t:`ทั้งค่ายตื่นมาสดชื่น ไม่มีใครไข้ขึ้น`}],done,{bg:"dream",look:"casual"});};
    if(!live){const F=quickFight(G.F[ally],G.F[qid],(G.seed^0xd2eb)+gameWeek(G)*13,GH_ROUNDS);fin(dmWinFrom(F)==="A");return;}
    const bk={id:"bdream"+gameWeek(G),a:ally,b:qid,week:G.week,tier:"dream",rounds:GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,1),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
    try{document.body.classList.add("dreamfx");}catch(e){}openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;fin(!!(F&&F.result&&F.result.win==="A"));});return;}
  const fin=win=>{const S=ghSt(G);delete G.F[qid];let sick=0;if(win)S.wins++;else if(!S.sick&&((S.fy&&S.fy[G.season||1])||0)<GH_FEVER_MAX){sick=S.merit<20?2:1;S.fy=S.fy||{};S.fy[G.season||1]=(S.fy[G.season||1]||0)+sick;f.injury=Math.max(f.injury||0,sick);S.sick=f.id;G.log.push(`${f.name}จับไข้หลังผีอำ พักซ้อม ${sick} สัปดาห์`);}
    if(win)S.merit=clamp(S.merit+1,0,GH_MAX);save();
    const T=kind==="tani",M=T?(GH_MORN[f.id]||GH_MORN._):(GH_MORN2[f.id]||GH_MORN2._),line=pk(win?M.w:M.l).replace(/\{f\}/g,f.name).replace(/\{g\}/g,gn);
    const steps=[...(T?[N(win?`${f.name}ฟาดกาบกล้วยกระเด็น นางตานีถอยกลับเข้ากอกล้วย ทิ้งเสียงหัวเราะคิกคักไว้`:`${f.name}ล้มลงบนเวทีต้นกล้วย นางตานีหัวเราะคิกคักแล้วหายไปพร้อมลมเย็นวาบ`),
      TN(win?"…วันนี้ข้ายอม… แต่ไม่ได้แพ้นะ แค่ง่วง":"ฮิ ๆ ๆ ทำบุญมาเยอะ ๆ แล้วค่อยมาท้าข้าใหม่")]
      :[N(win?`${f.name}ซัด${gn}กระเด็นตกเวที เสียง${GH_SOUND[kind]}ค่อย ๆ ไกลออกไปจนเงียบ`:`${gn}หัวเราะลั่นแล้วหายไปในความมืด ${f.name}ทรุดลงกลางเวที`),...(ghSt(G).shrine?[TN(win?"ไปซะ! อย่าให้ข้าเห็นแถวนี้อีก":"ข้าช่วยกันไม่ทัน… ข้าจะไปเฝ้าเด็กมันเองคืนนี้",win?"angry":"neutral")]:[])]),
      GMOFF(),{n:"nar",t:"— เช้าวันต่อมา —",bg:"camp",show:[]},
      GH_ENTER[f.id]?GL(f.id,win?"happy":"sad",line):{n:"nar",t:line},
      ...(sick?[C(`${f.name}ไข้ขึ้น ครูให้พัก${sick>1?"สองอาทิตย์":"อาทิตย์นึง"} …แล้วครูว่าเราต้องทำบุญได้แล้ว บุญค่ายตอนนี้ ${S.merit} เอง`)]:[C(win?"ชนะผีในฝัน… ครูไม่รู้จะบันทึกลงสถิติยังไงดี":"")].filter(s=>s.t))];
    ghPlay(steps,done,{bg:"dream",look:"casual"});};
  if(!live){const F=quickFight(f,G.F[qid],(G.seed^0xd2ea)+gameWeek(G)*13,GH_ROUNDS);fin(dmWinFrom(F)==="A");return;}
  const bk={id:"bdream"+gameWeek(G),a:fid,b:qid,week:G.week,tier:"dream",rounds:GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,0),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
  try{document.body.classList.add("dreamfx");}catch(e){}
  openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;fin(!!(F&&F.result&&F.result.win==="A"));});}
/* in a dream fight the manager can only shout — the corner becomes a row of (useless, loud) cheers */
{const _c=cornerHTML;cornerHTML=function(F){const U=UI.fight;if(!U||!U.b||!U.b.dream)return _c(F);if(U.b.ctrl)return _c(F).replace(/src="[^"]*q_tani_ally[^"]*"/g,`src="${ASSET+"npc_tani_face.webp"}"`);
  return `<div class="corner px"><div class="chead"><b>พักยกในฝัน ${F.round}</b><span class="chip">เข้าเป้า ${F.A.rlanded}–${F.B.rlanded}</span><span class="chip warn">ขยับตัวไม่ได้ ตะโกนได้อย่างเดียว</span><span class="chip">🪷 บุญ 60+ หรือมีศาล จะสั่งมุมได้เอง</span></div>
   <div class="opts">${Object.entries(GH_CHEER).map(([k,t])=>`<button data-act="ghcheer" data-v="${k}">${t}</button>`).join("")}</div></div>`;};}
Object.assign(ACT,{ghcheer:d=>{const U=UI.fight;if(!U||!U.b||!U.b.dream)return;const C=U.care;if(C&&!C.done){C.q=.5;C.done=true;try{applyCare(U.F,.5);}catch(e){}}
  U.pick=d.v;const L=U.F.A.f.id==="q_tani_ally"?GH_CHEER_TANI:GH_CHEER_BACK;U.caption={text:`${U.F.A.f.name}: ${L[Math.floor(Math.random()*L.length)]}`,side:"A"};ACT.cgo();}});
{const _q=questExtra;questExtra=function(done,rng){try{if(G&&!G.ended){const S=ghSt(G);
  if(ghStory(done)){S.lastAny=gameWeek(G);return true;}            /* the rare story beats keep their place */
  if(_q(done,rng))return true;                                      /* v1.91.144 (Man): the main quests go before any ghost */
  if(S.on&&gameWeek(G)-(S.lastAny??-99)>=GH_GAP){let hit=false;     /* at most one ghost scene every GH_GAP weeks, all kinds together */
    if(ghHauntDue(G,rng)){ghHaunt(done);hit=true;}
    else{const o=ghOtherDue(G,rng);if(o){ghOther(o,done);hit=true;}else if(ghOdd(G,rng)){ghOddPlay(done);hit=true;}}
    if(hit){S.lastAny=gameWeek(G);return true;}}}}catch(e){console.error("ghost",e);}return false;};}

/* ---------- story beats (played as weekly extras so they can carry state) ---------- */
function ghStory(done){const S=ghSt(G);if(!S.on)return false;
  if(S.mpFail===1){S.mpFail=2;save();playScene([N("สามวันหลังพิธีไล่ผี มีจดหมายเขียนลายมือหวัด ๆ มาถึงค่าย"),{n:"npc",who:MP,img:"morphi",t:"ค่ายท่านมีของแรง ผมทำต่อไม่ไหว เงินค่าครูผมขอเก็บไว้ทำขวัญตัวเองนะครับ แล้วก็… รองเท้าผมข้างซ้าย ช่วยส่งไปรษณีย์มาให้ด้วย"},C("ครูบอกแล้ว… ทำบุญเถอะ ถูกกว่าด้วย")],done,{bg:"camp",look:"casual"});return true;}
  if(S.shrineOK===1){S.shrineOK=2;S.sq=1;S.sqAbs=gameWeek(G);save();playScene([N("บ่ายวันพระ หลวงพ่อจากวัดข้างค่ายเดินผ่านมา หยุดยืนมองกอกล้วยอยู่นาน"),
    {n:"npc",who:LP,img:"luangpho",t:"ค่ายนี้ทำบุญเยอะนะโยม อาตมาเห็นทุกครั้ง… แต่กอกล้วยนี่ มีคนอยู่นะ"},C("หลวงพ่อก็เห็นเหรอครับ!"),
    {n:"npc",who:LP,img:"luangpho",t:"เขาไม่ได้ร้ายหรอก เขาแค่น้อยใจ บ้านโดนเตะทุกวัน ไม่มีใครเคยบอกขอโทษ… ตั้งศาลให้เขาสักหลังเถอะ เขาจะดูแลที่นี่ให้"},
    C("ศาลนางตานี… ครูว่าดีนะผู้จัดการ ผูกผ้าแพรสามสี ถวายขนมต้ม แล้วก็… เลิกเตะต้นที่อยู่ใกล้ศาลด้วย"),
    N("🏮 เริ่มเควสต์ศาลนางตานี — ขั้นแรก: หาที่ตั้งศาล (เรื่องจะเดินเองในสัปดาห์หน้า)")],done,{bg:"temple",look:"casual"});return true;}
  if(S.pendShrine){S.pendShrine=0;S.stage=3;save();playScene([N("คืนแรกหลังตั้งศาล ลมพัดเย็นสบาย ไม่มีเสียงหมาหอน ไม่มีกลิ่นขนมต้มตอนตีสาม"),
    N("แต่คุณก็ยังฝันเห็นเธอ… คราวนี้เธอนั่งอยู่บนชานศาลไม้ แกว่งเท้าเล่น ไม่ได้นั่งบนอกคุณ"),
    TN("…ศาลสีเขียว ผ้าแพรสามสี ขนมต้มยังอุ่นอยู่เลย","shy"),TN("ข้าไม่ได้ซึ้งนะ! แค่… ไม่มีใครเคยสร้างบ้านให้ข้ามาก่อน","angry_smile"),
    MY("ขอโทษเรื่องต้นกล้วยนะครับ ทั้งที่โดนเตะ แล้วก็ที่โดนเอาไปทำกระทง"),
    TN("ฮึ… ขอโทษช้าไปตั้งหลายปี แต่ก็ยังดีกว่าไม่ขอ","neutral"),
    TN("ตกลง ตั้งแต่นี้ข้าจะดูแลค่ายนี้เอง ผีตนไหนจะมาวุ่นวาย ต้องผ่านข้าก่อน เด็ก ๆ ในค่ายข้าจะช่วยดูให้ไม่เจ็บไม่ไข้","smile"),
    TN("แล้วถ้าครูของเจ้าจะซื้อหวย… มากระซิบถามข้าก่อนก็ได้ ข้าไม่รับประกันนะ แต่ข้าเห็นตัวเลขลอยอยู่ในน้ำค้างบ่อย ๆ","smile"),
    TN("อ้อ แล้วต้นที่ติดศาล ห้ามเตะเด็ดขาด! ต้นอื่นเตะได้ เบา ๆ","angry_smile"),
    N("🏮 ศาลนางตานีตั้งแล้ว: นางตานีคุ้มครองค่าย · นักมวยฟื้นความล้าเร็วขึ้นทุกสัปดาห์ · บอกใบ้หวยเมื่อครูแดงชวนซื้อ · ถวายของที่ศาลได้ในกิจกรรมค่าย")],done,{bg:"camp_night",look:"casual"});return true;}
  return false;}

/* ---------- the shrine whispers a lottery number ---------- */
{const _p=lottoPickHTML;lottoPickHTML=function(i){const h=_p(i);const S=G&&G.gh;if(!S||!S.shrine)return h;const k=ghLottoK(G,i);
  return h.replace('<div class="ltgrid">',`<p class="ghhint"><img src="${ASSET+"npc_tani_face.webp"}" alt="">นางตานีกระซิบตอนครูแดงจุดธูปที่ศาล: “ใบที่ ${k+1}… ข้าเห็นเลขนี้ลอยในน้ำค้างเมื่อเช้า”</p><div class="ltgrid">`).replace(`data-v="${k}"`,`data-v="${k}" style="outline:3px solid #6fcf7f;outline-offset:2px"`);};}
const ghLottoK=(G,i)=>((G.seed||1)+(G.season||1)*7+i*3)%6;
{const _b=lottoBuy;lottoBuy=function(G,i,k){const d=_b(G,i,k);try{if(d&&G.gh&&G.gh.shrine&&k===ghLottoK(G,i))d.tani=1;}catch(e){}return d;};}
{const _r=lottoResult;lottoResult=function(G,d){const R=_r(G,d);if(d.tani&&R.out==="none"){const r=mulberry32((G.seed||1)*131+d.season*17+d.i);const x=r(),p=d.pick||"000000";
    if(x<.25){R.out="last2";R.l2=p.slice(-2);R.prize=LOTTO_PRIZE.last2;}else if(x<.33){R.out="last3";R.l3=p.slice(-3);R.prize=LOTTO_PRIZE.last3;}}return R;};}

/* ---------- test hook: the test save gets Tani awake and a haunt ready ---------- */
{const _t=xlTestSetup;xlTestSetup=function(G){_t(G);try{const S=ghSt(G);S.on=1;S.wakeAbs=gameWeek(G)-8;S.last=-99;S.merit=30;G.seen=G.seen||{};G.seen.gh_wake=true;}catch(e){console.error(e);}};}

/* ================= Phase 2: the Rains Retreat, the other ghosts, the girls' ghost stories, odd happenings ================= */
/* v1.91.144 (Man): through the Rains Retreat Luang Pho must stay at his temple and can't come out to help — the other ghosts come out then, and often */
const GH_SEASON=()=>GH_LENT();
const GH_OTHER=["krasue","krahang","mabong","phiphong"];
const GH_NAME={krasue:"กระสือ",krahang:"กระหัง",mabong:"ผีม้าบ้อง",phiphong:"ผีโพง",tani:"นางตานี"};
const GH_SOUND={krasue:"คิก… คิก… คิก…",krahang:"พึ่บ! พั่บ! พึ่บ! พั่บ!",mabong:"ฮี้ฮี้ฮี้ฮี้!",phiphong:"ฟุดฟิด… ฟุดฟิด… กลิ่นปลาร้า…"};
EVENTS.push({id:"gh_lp_go",annual:true,look:"casual",bg:"temple",pri:3,when:G=>ghSt(G).on&&ghIn(G,GH_SEASON()),steps:[
 N("วันเข้าพรรษา ทั้งค่ายไปถวายเทียนพรรษาที่วัดข้างค่าย หลวงพ่อเดินมาส่งถึงประตูวัด"),
 {n:"npc",who:LP,img:"luangpho",t:"สามเดือนนี้อาตมาต้องจำพรรษาอยู่ในวัดนะโยม ค้างแรมข้างนอกไม่ได้ มีอะไรมารบกวนตอนกลางคืน อาตมาออกไปช่วยไม่ได้"},
 C("สามเดือนเลยเหรอครับหลวงพ่อ… ครูจะสวดมนต์วันละสองรอบ"),
 {n:"npc",who:LP,img:"luangpho",t:"สวดได้ แต่สวดให้ถูกบทนะโยม คราวก่อนได้ยินโยมสวดชยันโตตอนจะนอน …ช่วงนี้ของไม่ดีมันรู้ว่าพระไม่ออกจากวัด มันชอบมาเดินเล่น ทำบุญไว้ใจจะได้ไม่หวั่น"},
 N("🌙 ช่วงเข้าพรรษา (ปลาย ก.ค.–ปลาย ต.ค.) หลวงพ่อจำพรรษาในวัด ผีตนอื่นจะออกมาบ่อย — บุญค่ายสูงหรือมีศาลนางตานีช่วยได้มาก")]});
EVENTS.push({id:"gh_lp_back",annual:true,look:"casual",bg:"temple",pri:2,when:G=>{const S=ghSt(G),L=GH_LENT();return S.on&&G.seenY&&G.seenY.gh_lp_go===(G.season||1)&&G.week>L[1]&&G.week<=L[1]+6;},steps:[
 N("วันออกพรรษา ตักบาตรเทโวแต่เช้า หลวงพ่อยิ้มกว้างกว่าทุกวัน"),
 {n:"npc",who:LP,img:"luangpho",t:"ออกพรรษาแล้วโยม อาตมาเดินไปไหนมาไหนได้แล้ว …ได้ยินว่าสามเดือนนี้มีอะไรมาเยี่ยมค่ายเยอะเลย"},
 C("เยอะครับหลวงพ่อ ครูสวดมนต์จนจำได้ทั้งเล่มแล้ว")]});
const ghSight={
 krasue:f=>[N(`ตีหนึ่ง ${f}ลุกไปเข้าห้องน้ำ เห็นดวงไฟสีม่วงลอยต่ำ ๆ อยู่แถวเล้าไก่หลังค่าย`),{n:"_f",t:"ผู้จัดการ! มีโคมลอยหลงทาง… เดี๋ยวนะ ทำไมโคมมีหน้า!"},
   N("ดวงไฟนั้นหันมายิ้มให้ ผมยาวสยาย ข้างล่างห้อยอะไรวิบวับ ๆ แล้วพุ่งหายเข้าไปในความมืด"),C("กระสือ! ปิดฝาโอ่งให้หมด ผ้าที่ตากไว้เก็บเข้าบ้าน! …ผ้าขาวม้าครูยังตากอยู่ ใครก็ได้ไปเก็บที")],
 krahang:f=>[N("เสียงพึ่บพั่บดังบนหลังคาค่ายทั้งคืน เหมือนใครกำลังพัดลมด้วยกระด้งสองใบ"),{n:"_f",t:"ผู้จัดการ… มีคนบินได้ค่ะ! เอากระด้งมาทำปีก ขี่สากตำข้าวด้วย!"},
   C("กระหัง! ห้ามทิ้งกระด้งกับสากไว้นอกบ้าน …ครูว่ามันมายืมของป้าแต๋วไปแน่ ๆ"),N("เช้าวันต่อมา ป้าแต๋วเดินมาบ่นว่ากระด้งหายไปสองใบ สากหายไปหนึ่งอัน")],
 mabong:f=>[N("กลางดึกมีเสียง “ฮี้!” ดังมาจากทุ่งนาหลังค่าย ตามด้วยเสียงกุบกับวิ่งวนรอบค่ายสามรอบ"),{n:"_f",t:"ม้าที่ไหนมาวิ่งตอนตีสองคะ ในเชียงใหม่มีม้าด้วยเหรอ"},
   C("ผีม้าบ้อง… ผีเหนือขนานแท้ คนที่โดนเข้าจะวิ่งร้องเป็นม้าทั้งคืน …เมื่อคืนใครวิ่งรอบค่าย ยกมือ"),N("ไม่มีใครยกมือ แต่นักเรียนคอร์สเช้าสองคนขาล้าเหมือนเพิ่งวิ่งมาราธอนมา")],
 phiphong:f=>[N("มีแสงสีส้มลอยวูบวาบอยู่แถวคูน้ำ กลิ่นคาวปลาโชยมาเป็นระลอก"),{n:"_f",t:"หิ่งห้อยตัวใหญ่จังเลย… ทำไมมันมีจมูกด้วย แล้วทำไมแสงออกจากจมูก"},
   C("ผีโพง! แสงออกจากรูจมูก ชอบกินของคาว ปลาร้าในครัวปิดฝาให้สนิท!"),N("เช้ามา ปลาร้าไหเล็กของค่ายหายไปครึ่งไห มีรอยนิ้วมันเยิ้มอยู่ที่ฝา")]};
const GH_GOPEN={krasue:[N("คุณฝันว่ายืนอยู่บนเวทีกลางทุ่งนา หัวผู้หญิงลอยวนรอบเวที ไส้วิบวับเป็นไฟประดับ")],
 krahang:[N("ในฝัน เวทีมวยตั้งอยู่บนหลังคาค่าย ชายร่างผอมกางกระด้งสองข้าง ร่อนลงมายืนมุมน้ำเงิน")],
 mabong:[N("ในฝัน เสียงกีบเท้ากระทืบพื้นเวทีดังตึง ๆ ม้าสีดำตาแดงยืนสองขาตั้งการ์ด")],
 phiphong:[N("ในฝัน ไฟทั้งสนามดับหมด เหลือแค่แสงสีส้มที่ออกมาจากจมูกของใครบางคนที่มุมน้ำเงิน")]};
const GH_MORN2={kati:{w:"กะทิฝันว่าต่อย{g}จนหนีไปเลย! ผีหน้าหนาวไม่เห็นน่ากลัว",l:"ฮัดชิ่ว… กะทิฝันว่าแพ้{g} ตื่นมาไข้ขึ้นเลย ไม่ยุติธรรม!"},
 mali:{w:"มะลิชนะ{g}ด้วยค่ะ! …แต่ขอนอนห้องครูแดงอีกคืนได้ไหมคะ",l:"มะลิไม่สบายค่ะ… ฝันถึง{g}ทั้งคืนเลย"},
 rin:{w:"ฉันฝันว่าชนะ{g} ฉันจดลักษณะไว้แล้ว เผื่อมีงานวิจัยเรื่องนี้",l:"ไข้ 38.2 ค่ะ ไม่เกี่ยวกับ{g}แน่นอน …ผู้จัดการช่วยปิดหน้าต่างให้ที"},
 ploy:{w:"เมื่อคืนพลอยชนะ{g} ไม่ต้องเล่าให้ใครฟังนะคะ",l:"พลอยไม่สบายนิดหน่อย …{g}เป็นแค่ความฝัน"},
 fah:{w:"ฟ้าเตะ{g}กระเด็นไปสองทุ่งนา สบาย ๆ",l:"ฮัดชิ่ว! ฟ้าไม่ได้แพ้{g}นะ ฟ้าแค่ง่วง"},
 prod_B:{w:"บันทึก: เป้าหมาย {g} ถูกกำจัดในความฝัน ใบหยกขอเพิ่ม {g} ในฐานข้อมูลค่ะ",l:"ระบบมีไข้ค่ะ… {g} ไม่อยู่ในฐานข้อมูล จึงป้องกันไม่ได้"},
 _:{w:"เมื่อคืนผมฝันว่าต่อยชนะ{g}ครับ",l:"ผมตัวร้อนครับ เมื่อคืนฝันว่าแพ้{g}"}};
function ghOtherDue(G,rng){const S=ghSt(G);if(!S.on||!ghIn(G,GH_SEASON()))return null;S.og=S.og||{};const yr=G.season||1;
  if(gameWeek(G)-(S.lastO??-99)<3)return null;S.ogSeen=S.ogSeen||{};const fresh=GH_OTHER.filter(k=>S.ogSeen[k]!==yr),left=fresh.length&&rng()<.5?fresh:GH_OTHER;
  const p=(S.merit<40?.6:S.merit<70?.45:.3)*(S.shrine?.6:1)*((S.th||0)>=3?.75:1);if(rng()>=p)return null;return left[Math.floor(rng()*left.length)];} /* v1.91.144 (Man): often, all Lent long, and never quite gone even at merit 100 */
function ghOther(kind,done){const S=ghSt(G),yr=G.season||1;S.lastO=gameWeek(G);S.og=S.og||{};S.ogSeen=S.ogSeen||{};const seen=S.ogSeen[kind]===yr;
  const R=roster(G).filter(f=>!f.injury);if(!R.length){done();return;}const named=R.filter(f=>GH_ENTER[f.id]),f=(named.length?named:R)[Math.floor(Math.random()*(named.length?named:R).length)];
  if(!seen){S.ogSeen[kind]=yr;save();const st=ghSight[kind](f.name).map(s=>s.n==="_f"?(GH_ENTER[f.id]?GL(f.id,"surprised",s.t):{n:"nar",t:`${f.name}: ${s.t}`}):s);
    ghPlay([N("— เรื่องแปลกกลางดึก —"),...st,...(S.shrine?[TN("ฮึ… พวกช่วงพรรษามากันแล้ว เดี๋ยวข้าดูให้","angry_smile")]:[])],done,{bg:"camp_night",look:"casual"});return;}
  S.og[kind]=yr;save();const enter=(GH_ENTER[f.id]||GH_ENTER._).replace(/\{f\}/g,f.name),tani=S.shrine&&Math.random()<.45;
  const steps=[pk(GH_GOPEN[kind]),{n:"npc",who:GH_NAME[kind],t:GH_SOUND[kind]},
   ...(tani?[TN("ถอยไปให้หมด เด็ก ๆ คืนนี้ข้าจัดการเอง!","angry"),N("แสงเขียวพุ่งลงกลางเวที นางตานีถกชายผ้าถุงขึ้นเหน็บเอว ตั้งการ์ดแบบที่แอบดูนักมวยในค่ายซ้อมทุกวัน")]
     :[N(enter),...(S.shrine?[TN("หยุดเดี๋ยวนี้! ค่ายนี้มีเจ้าที่แล้ว… ข้าเอง!","angry"),TN("เจ้านักมวย ซัดมันเลย ข้าคุมเวทีให้ มันจะอ่อนแรงลงเอง","angry_smile")]:[])]),
   MY("(ขยับไม่ได้อีกแล้ว… งั้นตะโกนอย่างเดียว)"),
   {choice:[{t:tani?"ส่งเสียงเชียร์นางตานีสุดใจ (ชกในฝัน)":`ส่งเสียงเชียร์${f.name}สุดใจ (ชกในฝัน)`,fx:()=>{UI.ghGo={fid:f.id,live:1,tani};}},{t:"ท่องอิติปิโสรัว ๆ (ข้ามไฟต์ ให้ผลออกเอง)",fx:()=>{UI.ghGo={fid:f.id,live:0,tani};},then:[N("คุณท่องอิติปิโสไปได้สิบสองรอบ เสียงในฝันเงียบลงทีละนิด…")]}]}];
  ghPlay(steps,()=>{const go=UI.ghGo;UI.ghGo=null;if(!go){done();return;}ghFight(go.fid,go.live,done,kind,go.tani);},{bg:"dream_room",look:"casual"});}

/* ---------- the girls' ghost stories (one each, once Tani is awake) ---------- */
const ghGirl=(id,b=12)=>G=>{const S=ghSt(G);return S.on&&inCamp(G,id)&&(G.F[id].bond||0)>=b&&gameWeek(G)-(S.wakeAbs||0)>=3;};
const BOND=(id,v)=>({inject:G=>{add(G,id,"bond",v);return [];}});
EVENTS.push(
 {id:"gh_kati",look:"casual",bg:"camp_night",when:ghGirl("kati"),steps:[
  N("ตีหนึ่ง คุณเจอกะทิเดินลาดตระเวนรอบค่าย ถือไม้กวาดทางมะพร้าวเป็นอาวุธ ไฟฉายคาดหัว"),
  GL("kati","happy","ผู้จัดการ! กะทิจะเฝ้าค่ายเอง ถ้าผีมา กะทิจะใช้ไม้กวาดฟาดแบบจระเข้ฟาดหาง!"),
  MY("ผีฟาดด้วยไม้กวาดได้เหรอ"),GL("kati","flustered","ไม่รู้ค่ะ แต่ยายบอกว่าผีกลัวไม้กวาด… หรือว่าแม่มดกลัว… อันไหนนะ"),
  N("ใบกล้วยหลังค่ายไหววูบ ทั้งที่ไม่มีลม กะทิหันขวับ ชูไม้กวาดตั้งการ์ด"),TN("…จะฟาดใครด้วยไม้กวาด","angry_smile"),
  GL("kati","surprised","…ผะ ผะ ผู้จัดการ วิ่ง!!"),N("กะทิวิ่งไปได้สามก้าว แล้วหันกลับมาลากแขนคุณไปด้วย ไม้กวาดหล่นอยู่กลางลาน"),
  N("เช้าวันต่อมา ไม้กวาดอันนั้นวางพิงประตูห้องกะทิอย่างเรียบร้อย ด้ามผูกโบสีเขียวไว้หนึ่งโบ"),GL("kati","flustered","…เธอคืนของด้วย ใจดีจัง กะทิขอโทษที่จะฟาดนะคะ!"),BOND("kati",2)]},
 {id:"gh_mali",look:"casual",bg:"camp_night",when:ghGirl("mali"),steps:[
  N("มะลิเคาะประตูห้องคุณตอนห้าทุ่ม กอดหมอนข้างมาด้วย"),GL("mali","sad","ผู้จัดการคะ… มะลินอนไม่หลับ ได้ยินเสียงคนหัวเราะคิกคักในกอกล้วย"),
  MY("ฟังผิดหรือเปล่า อาจเป็นแมว"),GL("mali","sad","แมวหัวเราะ “ฮิ ๆ ๆ” ได้เหรอคะ…"),
  N("มะลิขอนั่งอ่านการ์ตูนเป็นเพื่อนจนเที่ยงคืน แล้วผล็อยหลับไปบนเก้าอี้ ปากยังขมุบขมิบสวดอิติปิโส"),
  TN("…เด็กคนนี้กลัวข้าขนาดนั้นเลยเหรอ","neutral"),N("ผ้าห่มผืนบางลอยมาคลุมไหล่มะลิเอง คุณมองตามแต่ไม่เห็นใคร"),
  GL("mali","happy","(ตื่นมาตอนเช้า) ผู้จัดการห่มผ้าให้มะลิเหรอคะ ขอบคุณนะคะ!"),MY("…อืม ใช่ ๆ"),BOND("mali",2)]},
 {id:"gh_rin",look:"casual",bg:"camp_night",when:ghGirl("rin"),steps:[
  GL("rin","happy","ฉันติดกล้องอินฟราเรดไว้สามตัวรอบกอกล้วยค่ะ ถ้ามีผีจริงจะได้มีหลักฐาน ถ้าไม่มี ทุกคนจะได้เลิกกลัว"),
  N("เช้าวันต่อมา รินเรียกทุกคนมาดูคลิป"),GL("rin","surprised","…ทั้งคืนมีภาพแค่อย่างเดียวค่ะ"),
  N("ในจอ ครูแดงในชุดนอนลายช้าง เดินถือธูปวนรอบกอกล้วยเจ็ดรอบ ปากพึมพำบทสวดมนต์ เวลาตีสองสิบห้า"),C("…ครูไปทำบุญ ทำบุญตอนตีสองก็ได้"),
  GL("rin","flustered","แต่กล้องตัวที่สามค่ะ… มีคนเอาใบกล้วยมาปิดเลนส์ไว้ตั้งแต่ตีสามจนเช้า มีรอยนิ้วมือสีเขียวด้วย"),N("ทั้งห้องเงียบ รินลบไฟล์นั้นทิ้งต่อหน้าทุกคน"),
  GL("rin","sad","ไม่มีหลักฐาน ไม่มีผีค่ะ จบ …ผู้จัดการ คืนนี้ช่วยเดินไปส่งฉันที่ห้องได้ไหม"),BOND("rin",2)]},
 {id:"gh_ploy",look:"casual",bg:"camp_night",when:ghGirl("ploy"),steps:[
  N("ห้องของพลอยเปิดไฟสลัวทั้งคืน คุณเพิ่งรู้ตอนเดินผ่าน"),GL("ploy","angry","ไฟสลัวช่วยให้หลับง่าย ไม่เกี่ยวกับผีสักหน่อย"),
  N("ทันใดนั้น “ฮี้!!” เสียงม้าร้องดังลั่นมาจากทุ่งนา พลอยคว้าแขนคุณไว้แน่นจนเล็บจิก"),MY("…พลอย แขน"),
  GL("ploy","flustered","พลอยแค่… ตรวจชีพจรผู้จัดการ ดูว่าตกใจไหม …ผู้จัดการตกใจมากเลยนะคะ ชีพจรเต้นแรง"),
  N("เสียงนั้นกลายเป็นม้าของลุงเขียวข้างค่ายที่หลุดคอก ไม่ใช่ผีม้าบ้อง"),GL("ploy","pout","อย่าเล่าเรื่องนี้ให้ใครฟังนะคะ ถ้าเล่า พลอยจะบอกว่าผู้จัดการกรี๊ด"),BOND("ploy",2)]},
 {id:"gh_fah",look:"casual",bg:"camp_night",when:ghGirl("fah"),steps:[
  GL("fah","happy","ฟ้าจะนอนใต้กอกล้วยหนึ่งคืน ถ้าไม่เจอผี ทุกคนเลี้ยงชานมฟ้าคนละแก้ว"),N("ตีหนึ่ง ฟ้านอนเล่นมือถืออยู่บนเสื่อใต้ต้นกล้วย คุณแอบดูจากหน้าต่าง"),
  TN("…เจ้าเล่นอะไรอยู่ ส่องแสงหน้าข้าเนี่ย","angry"),GL("fah","surprised","…โอ้โห ผีจริง ชุดสวยดีนะ ขอถ่ายรูปคู่ได้ไหม"),TN("ถ่ายแล้วข้าจะติดกล้องเจ้าไหม…","neutral"),
  N("สองคนนั่งคุยกันจนตีสาม ฟ้าสอนนางตานีเล่นเกมเรียงลูกแก้ว นางตานีสอนฟ้าวิธีเลือกเลขหวย"),
  GL("fah","happy","(เช้ามา) ฟ้าแพ้พนันนะ เจอผีจริง …แต่ได้เพื่อนใหม่มาหนึ่งคน เธอเล่นเกมเก่งกว่าฟ้าอีก หงุดหงิด"),BOND("fah",2)]},
 {id:"gh_baiyok",look:"casual",bg:"camp_night",when:G=>ghGirl("prod_B",10)(G)&&ghSt(G).shrine,steps:[
  {n:"npc",who:"ใบหยก",t:"ใบหยกตรวจสอบศาลนางตานีมาสามคืนค่ะ อุณหภูมิรอบศาลต่ำกว่าปกติ 2.4 องศา ไม่มีคำอธิบายในฐานข้อมูล"},
  TN("ยัยหุ่นยนต์คนนี้มายืนจ้องข้าสามคืนแล้ว…","angry_smile"),{n:"npc",who:"ใบหยก",t:"…ตรวจพบเสียงพูด ไม่มีแหล่งกำเนิด"},
  N("ผมหางม้าของใบหยกค่อย ๆ ถูกถักเป็นเปียสองข้างเองต่อหน้าต่อตา ใบหยกยืนนิ่งไม่ขยับ"),{n:"npc",who:"ใบหยก",t:"……ข้อผิดพลาด ข้อผิดพลาด"},
  TN("ฮิ ๆ น่ารักดีนี่ ผมยาวสวย ข้าแค่ช่วยถักให้","smile"),
  {n:"npc",who:"ใบหยก",t:"(เช้ามา ใบหยกยังถักเปียอยู่) …ใบหยกตัดสินใจจะไม่แก้ทรงผมค่ะ ข้อมูลระบุว่า… มันดูดี"}]});

/* ---------- odd happenings (light, every so often; more of them when merit is low) ---------- */
const GH_ODD=[
 f=>[N("ตีสอง มีแสงไฟกระพริบสามสีลอยนิ่งอยู่เหนือทุ่งนาหลังค่ายเกือบชั่วโมง"),{n:"_f",t:"ยูเอฟโอ! ผู้จัดการ ยูเอฟโอ!"},C("นั่นโดรนถ่ายงานบวชบ้านลุงเขียว… มั้ง ครูไม่แน่ใจ แต่เขาบวชกันกลางคืนเหรอ")],
 f=>[N("ทั้งค่ายได้ยินเสียงระนาดเพลงสะระหม่าดังแว่ว ๆ ตอนเที่ยงคืน ทั้งที่ไม่มีงานวัดแถวนี้"),C("…นั่นเสียงโทรศัพท์ครูเอง ตั้งปลุกไว้แล้วลืมปิด ขอโทษ")],
 f=>[N("เช้านี้มีรอยเท้าเล็ก ๆ บนเพดานห้องครัว เดินจากมุมห้องไปถึงหม้อข้าว"),{n:"_f",t:"ผีเด็กแน่ ๆ เลย!"},N("ตุ๊กแกตัวเท่าแขนโผล่หัวออกมาจากหลังตู้ มองทุกคนแล้วร้อง “ตุ๊กแก!” หนึ่งครั้ง")],
 f=>[N("ครูแดงสวดมนต์ก่อนนอนทุกคืนมาสามอาทิตย์แล้ว คืนนี้สวดเสียงดังเป็นพิเศษ"),C("อิติปิโส ภะคะวา… ใครเปิดพัดลมห้องครู! ครูยังไม่ได้เปิด! อะระหัง!"),N("พัดลมเครื่องนั้นเสียมาสองเดือนแล้ว")],
 f=>[N("ไก่ป้าแต๋วขันตอนเที่ยงคืนสามรอบ หมาข้างค่ายหอนตอบสองรอบ แมวไม่พูดอะไร"),C("ไก่ขันเที่ยงคืนเขาว่าลางไม่ดี… หรือไก่มันตั้งนาฬิกาผิด")],
 f=>[N("มีคนเอาเลขสามตัวมาเขียนไว้บนใบกล้วยหน้าค่ายด้วยแป้งดินสอพอง"),C("เลขอะไรน่ะ… ครูจดไว้ก่อน ไม่ได้จะซื้อนะ แค่จด"),N("ทั้งค่ายจดตาม ป้าแต๋วจดด้วย ลุงเขียวถ่ายรูปไปโพสต์ในกลุ่มหมู่บ้าน")],
 f=>[N("แมวดำตัวหนึ่งเดินขึ้นไปนั่งกลางเวทีมวยของค่าย นั่งอยู่ทั้งบ่าย ใครไล่ก็ไม่ไป"),{n:"_f",t:"มันจะมาสมัครเป็นนักมวยหรือเปล่าคะ"},C("ถ้ามันชกเป็น ครูรับ ค่าตัวเป็นปลาทูวันละตัว")],
 f=>[N("วิทยุชุมชนในครัวเปิดเองตอนตีสี่ เปิดเพลงลูกทุ่งเพลงเดียวซ้ำ ๆ จนเช้า"),{n:"_f",t:"เพลงนี้… “น้ำตาผีเสื้อ” เหรอ"},C("ผีชอบเพลงเศร้าเว้ย ครูว่าเปลี่ยนเป็นเพลงมันส์ ๆ ให้ดีกว่า")],
 f=>[N("นักเรียนคอร์สเย็นเล่าว่าเห็นพระรูปหนึ่งเดินผ่านหน้าค่ายตอนสามทุ่ม ทั้งที่หลวงพ่อจำพรรษาอยู่ในวัด"),C("…พระวัดอื่นมั้ง หรือพระวัดไกลมาบิณฑบาตผิดเวลา ครูว่าอย่าไปคิดมาก แล้วก็… คืนนี้นอนรวมกันนะ")]];
function ghOdd(G,rng){const S=ghSt(G);if(!S.on||gameWeek(G)-(S.lastOdd??-99)<3)return false;if(rng()>=(S.merit<30?.16:S.merit<60?.09:.05))return false;return true;}
function ghOddPlay(done){const S=ghSt(G);S.lastOdd=gameWeek(G);S.oddI=((S.oddI??-1)+1)%GH_ODD.length;save();const R=roster(G).filter(f=>GH_ENTER[f.id]),f=R[Math.floor(Math.random()*R.length)];
  const st=GH_ODD[S.oddI](f?f.name:"").map(s=>s.n==="_f"?(f?GL(f.id,"surprised",s.t):{n:"nar",t:"เด็กคอร์ส: "+s.t}):s);ghPlay([N("— เรื่องแปลกในค่าย —"),...st],done,{bg:"camp_night",look:"casual"});}


/* ================= Phase 3: sitting with Nang Tani at her shrine (friendship, not romance) ================= */
/* once a week, in place of spending time with a fighter; topics never repeat until all are heard; heart scenes at 20/40/70 */
const TT=[
 {k:"green",o:[TN("เจ้าจ้องชุดข้าทำไม… ชุดเขียวนี่ใส่มาตั้งแต่เกิด ข้าเกิดจากต้นกล้วยนะ จะให้ใส่ชุดแดงเหรอ","angry_smile")],
  c:[["สีเขียวเข้ากับคุณดีนะ",3,"…ปากหวานนะเจ้า ข้าไม่หลงหรอก แต่ขอบใจ","shy"],["ลองเปลี่ยนสีบ้างไหม",0,"ถ้าข้าใส่สีเหลือง คนจะคิดว่าข้าเป็นผีกล้วยหอม ข้าไม่ยอม","angry"],["ผมยาวขนาดนั้นสระยังไง",2,"น้ำค้างทุกเช้า ฟรี ไม่ต้องซื้อแชมพู คนเราน่าสงสาร","smile"]]},
 {k:"lotto",o:[TN("ข้าสงสัยมานานแล้ว… ทำไมคนชอบมาขูดต้นกล้วยข้าหาเลข เจ็บนะรู้ไหม","angry")],
  c:[["ขอโทษแทนทุกคนนะ",3,"ฮึ… เจ้าเป็นคนแรกที่ขอโทษแทนคนอื่น แปลกดี","shy"],["แล้วเลขงวดหน้าล่ะ",-1,"เห็นไหม! ถามแต่เลข! …สองตัวท้ายมีเลขเจ็ด ไปเลย","angry_smile"],["ผมจะทำป้ายห้ามขูด",2,"ทำตัวใหญ่ ๆ นะ แล้วเขียนว่า ‘เจ้าของต้นดุ’","smile"]]},
 {k:"daeng",o:[TN("ครูของเจ้าน่ะ… สวดมนต์ทุกคืนเลยนะ แต่สวดผิดบทครึ่งนึง เมื่อคืนสวดบทกรวดน้ำตอนจะนอน","neutral")],
  c:[["ครูแค่กลัวน่ะ",2,"ข้ารู้ ข้าเลยแกล้งเปิดพัดลมให้ ฮิ ๆ … อ้าว ไม่ควรบอกเหรอ","angry_smile"],["ช่วยสอนบทที่ถูกให้ครูหน่อย",3,"ข้าเป็นผี ไม่ใช่พระ! …แต่เดี๋ยวข้าไปกระซิบข้างหูให้คืนนี้","smile"],["ห้ามแกล้งครูนะ",1,"ไม่แกล้งก็ได้… แค่เปิดพัดลมให้เย็นสบาย","neutral"]]},
 {k:"snack",o:[TN("ขนมต้มที่ถวายเมื่อวาน… ใครทำ มะพร้าวหวานไปหน่อย แต่ข้ากินหมดนะ","smile")],
  c:[["ชอบขนมอะไรที่สุด",2,"ขนมต้ม ข้าวต้มมัด กล้วยบวชชี… เดี๋ยว กล้วยบวชชีไม่เอา มันเหมือนกินญาติ","angry"],["ครั้งหน้าเอากล้วยทอดมาให้",-2,"……เจ้าลองเอากระดูกเจ้าไปทอดดูไหม","scary"],["แล้วน้ำแดงล่ะ",2,"น้ำแดงต้องเย็น ๆ ใส่น้ำแข็งเยอะ ๆ ผีก็ร้อนเป็นนะ","smile"]]},
 {k:"radio",o:[TN("เมื่อคืนข้าฟังวิทยุชุมชนในครัว มีรายการเกมโชว์ คนตอบผิดข้อสองยังได้ยาหม่องกลับบ้าน ข้าหัวเราะจนต้นกล้วยสั่น","smile")],
  c:[["ผมเคยไปออกรายการนั้นนะ",3,"จริงดิ! ครกใบที่เจ็ดมันตำเองจริงไหม! …ไม่ต้องบอก ข้าไม่อยากรู้ ข้าอยากเชื่อ","shy"],["ผีฟังวิทยุได้ด้วย?",1,"ได้สิ แต่เปลี่ยนคลื่นไม่ได้ เลยต้องฟังลูกทุ่งทั้งคืน","neutral"],["คราวหน้าผมจะโทรหาคุณเป็นตัวช่วย",2,"โทรมาสิ… ข้าไม่มีโทรศัพท์ แต่ข้าจะไปกระซิบข้างหูเจ้า","angry_smile"]]},
 {k:"girls",o:[TN("สาว ๆ ในค่ายเจ้านี่… ข้าดูมานานแล้วนะ บางคนแอบมองเจ้าตอนซ้อมด้วย ข้าเห็นหมด","angry_smile")],
  c:[["ใครเหรอ",1,"ข้าไม่บอกหรอก ข้าเป็นผี ไม่ใช่แม่สื่อ …แต่คนที่ผูกเชือกแดงขาวน่ะ ดูบ่อยที่สุด","smile"],["อย่าไปแกล้งพวกเธอนะ",2,"ข้าไม่แกล้ง ข้าแค่ห่มผ้าให้ตอนหลับ… บางทีก็ถักเปียให้","shy"],["คุณขี้เหงาเหรอ",3,"……เจ้านี่ถามตรงเกินไปนะ","shy"]]},
 {k:"fear",o:[TN("รู้ไหมข้ากลัวอะไรที่สุด","neutral")],
  c:[["เสียงสวดมนต์?",0,"ไม่หรอก ข้าชอบฟังด้วยซ้ำ ถึงครูเจ้าจะสวดเพี้ยนก็เถอะ","smile"],["ปลวก?",2,"…ใช่! มันกินต้นกล้วยข้า! ผีอะไรก็ไม่น่ากลัวเท่าปลวกฝูงใหญ่","scary"],["เลื่อยไฟฟ้า",3,"อย่าพูดคำนั้น… ข้าขนลุก ทั้งที่ข้าเป็นผีแท้ ๆ","angry"]]},
 {k:"moon",o:[TN("คืนพระจันทร์เต็มดวง ข้าแข็งแรงที่สุด ถ้าคืนนั้นมีผีตนไหนมาเพ่นพ่าน ข้าจะเตะให้ตกทุ่งนาเลย","smile")],
  c:[["คุณเตะเป็นด้วยเหรอ",2,"ข้าโดนนักมวยเตะมาเป็นร้อยปี ข้าจำท่าได้หมดแล้ว! จระเข้ฟาดหาง… ฟิ้ว!","angry_smile"],["มาช่วยสอนเด็ก ๆ บ้างสิ",3,"ข้าสอนได้นะ แต่เด็กจะนอนไม่หลับสามคืน","smile"],["อย่าเตะแรงนะ",1,"ไม่แรงหรอก แค่ให้จำไปจนชาติหน้า","neutral"]]},
 {k:"slang",o:[TN("ข้าได้ยินเด็กคอร์สพูดกันว่า “ปังมาก” “ตัวแม่” …แปลว่าอะไร ข้าอยากใช้บ้าง","neutral")],
  c:[["ตัวแม่ แปลว่าเก่งที่สุดในเรื่องนั้น",3,"งั้นข้าคือตัวแม่ผีต้นกล้วยแห่งเชียงใหม่! …พูดถูกไหม ปังไหม","smile"],["อย่าใช้เลย ไม่เหมาะกับผี",0,"เชอะ คนสมัยนี้ยังเอาผีไปทำมีมเลย ข้าก็ต้องตามให้ทัน","angry"],["ปังมาก แปลว่าดีมาก",2,"ศาลข้า… ปังมาก! ฮิ ๆ","shy"]]},
 {k:"kicks",o:[TN("วันนี้เด็กในค่ายเตะต้นกล้วยต้นหลัง… แต่เดินมาไหว้ศาลก่อนด้วย ข้าก็เลยไม่ว่าอะไร","smile")],
  c:[["ผมบอกทุกคนให้ขออนุญาตก่อนเตะ",3,"…ขอบใจนะ แค่ขอก่อน ข้าก็ให้ได้ทั้งกอ","shy"],["เตะต้นอื่นแทนได้ไหม",1,"เตะได้ แต่อย่าเตะต้นที่กำลังออกปลี เด็กมันจะตกใจ","neutral"],["ซื้อกระสอบทรายเพิ่มดีกว่า",2,"ดี! เอาเงินไปซื้อกระสอบ ต้นกล้วยข้าจะได้มีชีวิตที่สงบ","smile"]]}];
const TH=[
 {at:20,steps:()=>[N("คืนนี้คุณนั่งที่ชานศาลนานกว่าปกติ นางตานีนั่งแกว่งเท้าอยู่บนหลังคาศาล"),
  TN("เจ้ารู้ไหม… กอกล้วยนี้ ใครเป็นคนปลูก","neutral"),MY("ไม่รู้เลย"),
  TN("คุณปู่ของเจ้าเองแหละ ตอนเขายังหนุ่ม ยังไม่มีค่าย ไม่มีกระสอบทราย มีแต่ต้นกล้วยกับความฝัน","smile"),
  TN("ทุกเช้าก่อนเตะ เขาจะยกมือไหว้แล้วพูดว่า ‘ขอยืมต้นนะแม่นาง วันนี้ขอเตะสามร้อยที’ แล้วตอนเย็นก็เอาน้ำมารด","shy"),
  TN("พอเขาตายไป… ไม่มีใครขอข้าอีกเลย เตะอย่างเดียว แล้วก็เอาไปลอยน้ำ","neutral"),
  MY("งั้นตอนที่คุณมาอำทุกคน…"),TN("ข้าแค่อยากให้มีใครจำได้ว่าที่นี่มีคนอยู่… ผีอย่างข้าก็เหงาเป็นนะ","shy"),
  N("ลมพัดใบกล้วยไหวเบา ๆ เหมือนใครกำลังพยักหน้า"),N("💚 ความผูกพันกับนางตานีเพิ่มขึ้น")]},
 {at:40,steps:()=>{const f=roster(G).find(x=>x.injury>0)||roster(G)[0];const nm=f?f.name:"เด็กในค่าย";return [
  N(`คืนนั้น${nm}นอนซมด้วยพิษไข้ คุณเดินไปดูตอนดึก`),N("ข้างฟูก นางตานีนั่งพับเพียบ โบกใบตองเป็นพัดให้ช้า ๆ"),
  TN("ชู่ว์… อย่าเสียงดัง เด็กเพิ่งหลับ","neutral"),MY("ตอนแรกคุณเป็นคนทำให้ทุกคนไข้ขึ้นนะ"),
  TN("ก็ข้ารู้… ตอนนั้นข้าโกรธ ตอนนี้ข้าเลยมาเฝ้าใช้หนี้","shy"),TN("ไข้ลงแล้วนะ เช้านี้กินข้าวต้มได้ อย่าให้ซ้อมหนักล่ะ ไม่งั้นข้าจะมาอำเจ้าแทน","angry_smile"),
  N(`เช้าวันต่อมา${nm}ตื่นมาสดชื่น บอกว่าฝันว่ามีผู้หญิงชุดเขียวร้องเพลงกล่อมทั้งคืน เสียงเพี้ยนนิดหน่อย`),N("💚 ความผูกพันกับนางตานีเพิ่มขึ้น")];}},
 {at:70,steps:()=>[N("คืนลอยกระทง ทั้งค่ายไปงานที่ริมน้ำ คุณเดินกลับมาที่ศาล ถือกระทงขนมปังมาหนึ่งใบ"),
  TN("…กระทงขนมปัง ไม่ใช่กาบกล้วย","shy"),MY("ปีนี้ผมให้ทุกคนใช้ขนมปังหมด ปลากินได้ด้วย"),
  TN("ฮิ ๆ ๆ… เจ้านี่มันบ้าจริง ๆ","smile"),N("นางตานีลอยลงมานั่งข้างคุณ เป็นครั้งแรกที่เธอนั่งใกล้ขนาดนี้ ตัวเธอเย็นเหมือนน้ำค้างตอนเช้า"),
  TN("ข้าเป็นผี เจ้าเป็นคน ข้าอยู่ที่นี่ไปอีกร้อยปี เจ้าอยู่ได้อีกไม่กี่สิบ","neutral"),
  TN("แต่ข้าว่า… เราเป็นเพื่อนกันได้นะ เพื่อนที่จะคอยดูค่ายนี้ไปด้วยกัน จนกว่าเจ้าจะแก่จนเตะต้นกล้วยไม่ไหว","smile"),
  MY("เพื่อนกันครับ"),TN("ดี! งั้นเพื่อนต้องเอาน้ำแดงมาฝากทุกวันพระ ห้ามลืม!","angry_smile"),
  N("ไกล ๆ เสียงพลุดังขึ้นเหนือแม่น้ำ แสงสีเขียวจาง ๆ ลอยขึ้นจากกอกล้วยไปปนกับแสงพลุ"),N("💚 นางตานีเป็นเพื่อนสนิทของคุณแล้ว — เธอจะคุ้มครองค่ายแรงขึ้นอีก")]}];
function ghTalk(){const S=ghSt(G);if(!S.shrine||G.freeUsed)return;G.freeUsed=true;S.tb=S.tb||0;S.th=S.th||0;S.tt=S.tt||[];
  const heart=TH.find((h,i)=>i>=S.th&&S.tb>=h.at);
  if(heart){S.th=TH.indexOf(heart)+1;S.tb=clamp(S.tb+3,0,ghCap(G));save();playScene([N("คุณเดินไปนั่งที่ศาลนางตานี"),...heart.steps()],()=>render(),{bg:"camp_night",look:"casual"});return;}
  let pool=TT.filter(t=>!S.tt.includes(t.k));if(!pool.length){S.tt=[];pool=TT;}const T=pool[Math.floor(Math.random()*pool.length)];S.tt.push(T.k);save();
  playScene([N("คุณเดินไปนั่งที่ศาลนางตานี จุดธูปหนึ่งดอก แสงสีเขียวค่อย ๆ ลอยลงมานั่งบนชานศาล"),...T.o,
   {choice:T.c.map(([t,v,r,img])=>({t,fx:()=>{S.tb=clamp((S.tb||0)+2+v,0,ghCap(G));save();},then:[TN(r,img)]}))},
   {inject:()=>[N(`💚 ความสนิทกับนางตานี ${S.tb}`)]}],()=>render(),{bg:"camp_night",look:"casual"});}
Object.assign(ACT,{ghtalk:()=>{UI.modal=null;ghTalk();}});
/* she sits at the end of the people list once the shrine stands */
{const _p=peopleHTML;peopleHTML=function(){const h=_p();const S=G&&G.gh;if(!S||!S.shrine)return h;const tb=S.tb||0;
  return h+`<div class="pcard ghcard"><img class="face" src="${ASSET+"npc_tani_face.webp"}" alt=""><div><b>นางตานี</b><small>เจ้าที่ประจำค่าย · ความสนิท ${tb}/100${S.th>=3?" · เพื่อนสนิท":""}</small></div>
   <button class="btn sm primary" data-act="ghtalk" ${G.freeUsed?"disabled":""}>ไปนั่งคุยที่ศาล</button></div>`;};}


/* ================= Phase 4 (v1.91.144, Man): a three-year Tani arc, then a merit-keeping loop =================
   Year 1 after she wakes — chaos: Tani and the Lent ghosts haunt; no shrine yet; ends with the dark-moon brawl where Tani "doesn't help".
   Year 2 — merit: Luang Pho's advice, finding the spot, the teak, Tani's test, then the shrine (฿60,000).
   Year 3 — closeness: deeper talks, her blossom day, Loy Krathong together, the Lent truce with the four ghosts.
   After that — a loop: keep merit up or her shrine gathers dust and she sulks (and haunts) until you make it up to her. */
const ghYear=G=>{const S=ghSt(G);if(S.ys==null)S.ys=S.shrine?Math.max(1,(G.season||1)-1):S.wakeAbs?Math.floor((S.wakeAbs-1)/52)+1:(G.season||1);return Math.max(1,(G.season||1)-S.ys+1);};
const pk=x=>Array.isArray(x)?x[Math.floor(Math.random()*x.length)]:x;
const LPS=t=>({n:"npc",who:LP,img:"luangpho",t});

/* --- more variety for every repeating beat --- */
GH_OPEN.push(
 [N("ตีสามตรง นาฬิกาในครัวเดินถอยหลังสองทีแล้วหยุดนิ่ง"),N("ผ้าห่มของคุณถูกดึงลงไปทีละนิด ทีละนิด เหมือนมีใครอยากชวนตื่น")],
 [N("ฝนตกปรอย ๆ ทั้งคืน แต่หยดน้ำบนหน้าต่างไหลขึ้นข้างบน"),N("เงาใบกล้วยบนผนังห้องค่อย ๆ ยืดยาวจนกลายเป็นมือผู้หญิง")],
 [N("คุณฝันว่านั่งกินข้าวเหนียวกับครูแดง ครูแดงหันมายิ้ม ใบหน้าค่อย ๆ กลายเป็นสีเขียว"),N("“ฮิ ๆ ล้อเล่น ข้าเอง” เสียงผู้หญิงดังออกมาจากปากครูแดง")],
 [N("ลมเย็นวาบผ่านต้นคอ ทั้งที่หน้าต่างปิดสนิท พัดลมเพดานหมุนช้า ๆ ทั้งที่ไม่ได้เสียบปลั๊ก"),N("ปลายเตียงมีกาบกล้วยวางเรียงสามแผ่น เขียนด้วยดินสอพองว่า 3… 2… 1…")]);
GH_TANI_LINE[0].push("ข้าเห็นเจ้าตอนกลางวันนะ… ใส่รองเท้าแตะเดินผ่านกอกล้วยข้า ไม่ยกมือไหว้สักคำ","คืนนี้จันทร์ยังไม่เต็มดวง แต่อารมณ์ข้าเต็มร้อย");
GH_TANI_LINE[1].push("นักมวยเจ้าเตะต้นข้าสามร้อยที คืนนี้ข้าเอาคืนสามร้อยหนึ่งที","ครูเจ้าสวดมนต์ทุกคืน… สวด ‘ภะคะวา’ เป็น ‘ภะคะวาว’ ข้าหัวเราะจนเกือบหลุดจากต้น");
GH_TANI_LINE[2].push("เจ้าทำบุญเยอะขึ้นนะ ข้ารู้… แต่ข้ายังต้องมาตามหน้าที่ ผีก็มีภาระงาน","ข้ามาคืนนี้… เผื่อเจ้าเหงา ไม่ใช่ข้าเหงานะ");
const GH_SULK=["ศาลข้าฝุ่นเกาะสามนิ้ว! ขนมต้มชิ้นสุดท้ายแข็งเป็นหินแล้ว ข้างอน!","บุญค่ายเจ้าตกจนข้าหิว ผีหิวก็โหดได้นะ","ข้าไม่ได้มาอำเพราะโกรธหรอก… มาเพราะคิดถึงขนมต้มต่างหาก"];
const MORE_W={kati:["กะทิฝันอีกแล้ว! คราวนี้ผีชุดเขียวขอแลกท่าเตะกับกะทิ กะทิสอนจระเข้ฟาดหางให้ไปแล้ว…","กะทิชนะผีเป็นครั้งที่เท่าไหร่แล้วนะ นับไม่ทัน ผู้จัดการช่วยจดให้หน่อย!"],
 mali:["มะลิชนะค่ะ! แล้วผีเขาก็ลูบหัวมะลิก่อนไปด้วย… มะลิควรดีใจหรือกลัวคะ","มะลิฝันว่าชนะผี แล้วเลี้ยงชานมผีด้วย ผีบอกว่าหวานไป"],
 rin:["ฉันชนะอีกแล้วค่ะ สถิติตอนนี้ชนะผีมากกว่าแพ้ น่าจะตีพิมพ์ได้ …ล้อเล่น ไม่มีวารสารไหนรับ","ในฝันฉันใช้แผนรักษาระยะ ผีปรับตัวไม่ทัน ข้อมูลดีมาก จดไว้แล้วค่ะ"],
 ploy:["พลอยชนะ ผีถึงกับก้มหัวให้ …พลอยก็ก้มหัวคืน มารยาทค่ะ","อีกแล้วเหรอคะ… ชนะก็ชนะ พลอยขอนอนต่ออีกชั่วโมง"],
 fah:["ฟ้าชนะผีอีกแล้ว เบื่อจัง ผีในเชียงใหม่ไม่มีตัวที่เก่งกว่านี้เหรอ","ฟ้าถ่ายรูปคู่กับผีไว้ในฝันด้วย แต่ตื่นมาแบตหมด เซ็ง"],
 prod_B:["บันทึก: ชนะอีกครั้ง… ใบหยกเริ่มสนุกค่ะ ข้อมูลนี้ไม่ควรมีในระบบ","ใบหยกปรับอัลกอริทึมใหม่ ชนะผีภายในยกเดียว ประสิทธิภาพเพิ่ม 34 เปอร์เซ็นต์"],
 _:["ผมชนะผีอีกแล้วครับ ตอนนี้ไม่กลัวแล้ว แค่ง่วง"]};
const MORE_L={kati:"ฮัดชิ่ว… กะทิแพ้เพราะผีจั๊กจี้! มันขี้โกง!",mali:"มะลิไม่สบายค่ะ… ฝันว่าผีจับมะลิถักเปีย ผมพันกันทั้งคืนเลย",rin:"ฉันไข้ขึ้นค่ะ …ในฝันผีอ่านเกมฉันออก ฉันต้องดูเทปตัวเองใหม่",
 ploy:"พลอยไม่สบายค่ะ อย่าถามว่าเพราะอะไร",fah:"ฮัดชิ่ว… ไม่ต้องสงสารฟ้า ฟ้าแค่ปล่อยไก่ในฝัน",prod_B:"…ระบบเข้าโหมดซ่อมบำรุง ใบหยกจะพักหนึ่งสัปดาห์ค่ะ",_:"ผมไข้ขึ้นครับ… ฝันว่าผีเตะเบาแต่แม่น"};
const MORE2={kati:["เมื่อคืนกะทิต่อย{g}จนร้องขอชีวิต! …ผีมีชีวิตไหมนะ","{g}มันโกง! ลอยหนีตลอด กะทิตามไม่ทัน ฮัดชิ่ว"],mali:["มะลิชนะ{g}ค่ะ! แต่หลับตาชกตลอดเลย ไม่รู้โดนตรงไหนบ้าง","มะลิไข้ขึ้นค่ะ… {g}น่ากลัวกว่าที่คิด"],
 rin:["{g}มีจุดอ่อนที่การ์ดซ้ายค่ะ ฉันจดไว้แล้ว","ฉันวิเคราะห์{g}ผิดค่ะ… ไข้ขึ้นด้วย สองต่อ"],ploy:["{g}ไม่ใช่คู่มือของพลอย","…{g}โชคดี พลอยยังไม่ได้ทานข้าวเย็น"],
 fah:["{g}เหรอ ฟ้าจำชื่อไม่ได้ด้วยซ้ำ ชนะง่ายเกิน","ฟ้าไม่ได้แพ้{g}นะ ฟ้าแค่อยากพัก"],prod_B:["เพิ่ม {g} ในฐานข้อมูลเรียบร้อย ความแม่นยำในการกำจัดเพิ่มขึ้นค่ะ","ข้อผิดพลาด… {g} อยู่นอกขอบเขตการประมวลผล"],
 _:["ผมชนะ{g}ครับ ไม่อยากเจออีกแล้ว","ผมแพ้{g}ครับ ตัวร้อนจี๋"]};
for(const k of Object.keys(GH_MORN)){const M=GH_MORN[k];M.w=[M.w,...(MORE_W[k]||[])];M.l=[M.l,MORE_L[k]].filter(Boolean);}
for(const k of Object.keys(GH_MORN2)){const M=GH_MORN2[k],X=MORE2[k];if(X){M.w=[M.w,X[0]];M.l=[M.l,X[1]];}}
GH_GOPEN.krasue.push(N("ในฝัน เวทีลอยอยู่กลางอากาศ หัวผู้หญิงยิ้มหวานลอยมาเกาะเสามุมน้ำเงิน ไส้วิบวับเหมือนไฟประดับงานวัด"),N("ในฝัน หัวลอย ๆ หัวเราะคิกคักวนรอบหัวคุณสามรอบ ก่อนลงไป… ลอยอยู่ตรงมุมน้ำเงิน"));
GH_GOPEN.krahang.push(N("ในฝัน กระด้งสองใบร่อนลงบนเวที สากตำข้าวปักอยู่กลางเวทีเหมือนธง"),N("ในฝัน ชายร่างผอมกระพือกระด้งจนฝุ่นเวทีฟุ้ง “พึ่บ! พั่บ!” เป็นการวอร์มอัพ"));
GH_GOPEN.mabong.push(N("ในฝัน ม้าสีดำวิ่งวนรอบเวทีสามรอบ แล้วกระโดดข้ามเชือกเข้ามาตั้งการ์ด"),N("ในฝัน เสียง “ฮี้!” ดังจนเชือกเวทีสั่น ผีม้าบ้องยกขาหน้าทำท่าไหว้ครู"));
GH_GOPEN.phiphong.push(N("ในฝัน กลิ่นปลาร้าโชยมาก่อนตัว แสงส้มลอดออกจากรูจมูกส่องเวทีเหมือนไฟฉาย"),N("ในฝัน มุมน้ำเงินมืดสนิท มีแค่จุดไฟสีส้มสองจุดกะพริบ… ไม่สิ นั่นรูจมูก"));
const ghSight2={
 krasue:[f=>[N("คืนนี้ดวงไฟสีม่วงลอยมาเกาะราวตากผ้าหลังค่าย ส่องผ้าขาวม้าครูแดงอย่างสนใจ"),{n:"_f",t:"ผู้จัดการ… กระสือมาเลือกเสื้อผ้าเหรอคะ"},C("ห้ามเอาผ้าขาวม้าครูไป! ผืนนั้นครูใช้มาสิบปี!"),N("เช้ามาผ้าขาวม้าครูแดงหายไป ทิ้งรอยไหม้เป็นรูปหัวใจไว้บนราวตากผ้า")],
  f=>[N("ไฟสีม่วงลอยวนรอบกอกล้วยสามรอบ แล้วหยุดนิ่งเหมือนรอคำเชิญ"),{n:"_f",t:"ได้ยินเสียงผู้หญิงสองคนเถียงกันเรื่องที่ตากผ้าค่ะ… ผีสองตนทะเลาะกันเหรอ"},C("ปีนี้ดีขึ้นนะ อย่างน้อยเขาเถียงกันเอง ไม่มาอำเรา")]],
 krahang:[f=>[N("กลางดึกมีกระด้งใบหนึ่งร่อนตกลงกลางลานค่าย เขียนว่า ‘ขอบคุณที่ให้ยืม’"),{n:"_f",t:"เขาคืนของด้วย… มีมารยาทกว่าคนบางคนอีกค่ะ"},C("ป้าแต๋วได้กระด้งคืนแล้ว แต่สากยังไม่คืนนะ!")],
  f=>[N("คืนนี้เสียงพึ่บพั่บบนหลังคามาเป็นจังหวะเพลงสะระหม่า"),{n:"_f",t:"กระหังซ้อมบินตามจังหวะปี่กลองเหรอ… หรือเขาจะมาเรียนมวย"},C("ถ้าจะมาเรียนก็จ่ายค่าคอร์สด้วย คอร์สละพันห้า")]],
 mabong:[f=>[N("คืนนี้เสียงกีบเท้าวนรอบค่ายแค่สองรอบ แล้วหยุดอยู่หน้าลานซ้อม"),{n:"_f",t:"เขามาดูเราซ้อมวิ่งหรือเปล่าคะ เมื่อเช้าเหมือนมีคนวิ่งตามหลังมาตลอด"},C("ผีม้าบ้องวิ่งเร็วนะ ถ้ามันไม่ใช่ผี ครูจะชวนมาเป็นคู่ซ้อมวิ่ง")],
  f=>[N("รอยกีบเท้าเต็มลานซ้อมตอนเช้า เรียงเป็นตัวอักษรว่า ‘แข่งไหม’"),{n:"_f",t:"ผีท้าแข่งวิ่ง… ใครจะไปรับคะ"},C("ไม่มีใครไปทั้งนั้น! …ครูขอคิดก่อน รางวัลเท่าไหร่")]],
 phiphong:[f=>[N("ไหปลาร้าในครัวถูกย้ายไปซ่อนบนหลังตู้ แต่เช้ามาก็ยังหายไปครึ่งไหเหมือนเดิม"),{n:"_f",t:"ผีโพงปีนตู้ได้ด้วย…"},C("ปีหน้าครูจะหมักสองไห ไหนึงให้ผี ไหนึงให้คน")],
  f=>[N("แสงสีส้มเล็ก ๆ ลอยมาหยุดหน้าครัว ทิ้งไหปลาร้าใบจิ๋วไว้หน้าประตู"),{n:"_f",t:"เขาเอาปลาร้ามาคืน… หรือเอามาฝาก กลิ่นหอมกว่าของเราอีกค่ะ"},C("ผีโพงหมักปลาร้าเก่งกว่าครู… ครูไม่ยอม ปีหน้าแข่งกัน")]]};
GH_ODD.push(
 f=>[N("ป้าแต๋วเล่าว่าเห็นเงาคนเตะต้นกล้วยตอนตีสาม พอส่องไฟดู ต้นกล้วยกำลังเตะเงาคนกลับ"),C("…ป้าแต๋วดื่มเหล้าขาวไปกี่จอกครับ")],
 f=>[N("เช้านี้รองเท้านักมวยทุกคู่ในค่ายถูกจัดเรียงหันหัวออกนอกประตู"),{n:"_f",t:"ใครจัดคะ เรียบร้อยมาก"},C("เขาว่ารองเท้าหันออกคือไล่แขก… หรือเขาแค่ขยัน")],
 f=>[N("กระสอบทรายลูกกลางแกว่งเองเบา ๆ ทั้งคืน เหมือนมีคนชกเป็นจังหวะ"),C("ถ้าผีซ้อมด้วย ครูคิดค่าเช่าอุปกรณ์นะ")],
 f=>[N("เช้านี้ในกระป๋องน้ำมันมวยมีกลีบดอกมะลิลอยอยู่สามกลีบ"),{n:"_f",t:"หอมดีค่ะ ใครใส่"},C("ไม่มีใครใส่… ทาไปเถอะ หอมดี")],
 f=>[N("ทีวีในห้องพักเปิดเองตอนตีหนึ่ง เปิดช่องมวยย้อนหลังไฟต์เก่า ๆ"),C("ไฟต์นี้ครูชกเองนี่หว่า! ใครอยากดูครูสมัยหนุ่ม ยกมือ")],
 f=>[N("หมาข้างค่ายนั่งหันหน้าเข้ากอกล้วย กระดิกหางทั้งคืน"),{n:"_f",t:"เขาเห็นใครหรือเปล่าคะ"},C("หมามันรู้ ใครใจดี มันก็กระดิกหางให้")],
 f=>[N("ไฟในห้องน้ำกะพริบเป็นจังหวะ สั้น-ยาว-สั้น"),{n:"_f",t:"มอร์สโค้ดเหรอคะ"},C("ครูอ่านไม่ออก แต่น่าจะแปลว่า ‘เปลี่ยนหลอดได้แล้ว’")],
 f=>[N("ใบตองห่อข้าวเหนียวทุกห่อเช้านี้ถูกพับเป็นรูปนก"),C("…ฝีมือใครก็ขอบใจ สวยดี แต่ข้าวเหนียวหายไปห่อนึงนะ")],
 f=>[N("เด็กคอร์สเช้าบอกว่ามีพี่ผู้หญิงชุดเขียวมาช่วยจับเป้าให้ เตะแล้วมือไม่สะเทือนเลย"),C("ค่ายเราไม่มีครูผู้หญิงชุดเขียว… ช่างเถอะ ขอบใจเขาด้วย")],
 f=>[N("เสียงกริ่งจักรยานดังหน้าค่ายตอนเที่ยงคืน ไม่มีจักรยานสักคัน"),{n:"_f",t:"ไปรษณีย์ส่งของดึกจังเลย"},C("ไปรษณีย์ไม่ส่งตอนเที่ยงคืน… ไปนอนเถอะ")],
 f=>[N("กระจกห้องแต่งตัวมีรอยลิปสีเขียวเขียนว่า ‘ทาครีมกันแดดด้วย’"),{n:"_f",t:"ผีห่วงผิวเราด้วยเหรอคะ"},C("ผีบ้านเราใจดีนะ แค่ปากหนัก")]);

/* --- Luang Pho's Lent visits change with the years --- */
{const go=EVENTS.find(e=>e.id==="gh_lp_go"),bk=EVENTS.find(e=>e.id==="gh_lp_back");const g1=go.steps,b1=bk.steps;
 go.steps=[{inject:G=>{const y=ghYear(G);return y<=1?g1:y===2?[N("เข้าพรรษาอีกปี หลวงพ่อยิ้มให้ตั้งแต่ไกล"),LPS("ปีนี้โยมทำบุญดีขึ้นนะ อาตมาเห็น… แต่ของไม่ดีมันยังมาอยู่ ปีที่แล้วมันจำทางได้"),C("ครูซื้อหนังสือสวดมนต์เล่มใหม่แล้วครับหลวงพ่อ ตัวหนังสือใหญ่"),LPS("ดีโยม จะได้ไม่สวดชยันโตตอนจะนอนอีก"),N("🌙 เข้าพรรษา: หลวงพ่อจำพรรษาในวัด ผีตนอื่นจะมาบ่อย")]
   :y===3?[N("เข้าพรรษาปีนี้ หลวงพ่อแวะยืนหน้าศาลนางตานีนานกว่าทุกปี"),LPS("พรรษานี้อาตมาไม่ห่วงแล้ว ค่ายนี้มีคนเฝ้าที่ดีอยู่"),C("หลวงพ่อรู้จักเธอดีกว่าครูอีกนะครับ"),LPS("อาตมาเห็นเขามาตั้งแต่ปู่ของผู้จัดการยังหนุ่ม… ตอนนั้นเขายังยิ้มเก่ง"),N("🌙 เข้าพรรษา: ผีตนอื่นจะมาบ่อย")]
   :[N("เข้าพรรษาอีกปีแล้ว ทั้งค่ายแห่เทียนพรรษาไปวัดเหมือนทุกปี"),LPS(pk(["บุญก็เหมือนน้ำมันมวยนะโยม ทาทุกวันถึงจะอุ่น หยุดทาเมื่อไหร่ก็เย็น","อาตมาจำพรรษาสามเดือน โยมก็รักษาบุญค่ายไว้สามเดือนนะ ของไม่ดีมันรู้ว่าช่วงนี้พระไม่ออกจากวัด","ปีนี้ช่วยเตือนครูแดงด้วย สวดมนต์ได้ แต่อย่าสวดดังเกินเที่ยงคืน ชาวบ้านเขาร้องเรียนมา"])),N("🌙 เข้าพรรษา: ผีตนอื่นจะมาบ่อย")];}}];
 bk.steps=[{inject:G=>{const y=ghYear(G),S=ghSt(G);return y<=1?b1:[N("ออกพรรษา ตักบาตรเทโวแต่เช้า"),LPS(S.shrine?pk(["พรรษานี้ศาลข้างกอกล้วยของโยมคึกคักนะ อาตมาได้ยินเสียงหัวเราะทุกคืน","ได้ยินว่าเจ้าที่ของโยมไล่ผีโพงตกคูน้ำไปสองรอบ… ดีแล้ว ปลาร้าจะได้ไม่หาย"]):(S.merit>=50?"ออกพรรษาแล้ว อาตมาออกจากวัดได้แล้ว… อีกไม่กี่วันจะแวะไปที่ค่าย มีเรื่องกอกล้วยจะคุยด้วย":"ออกพรรษาแล้วโยม อาตมาอยากช่วยเรื่องกอกล้วยนะ แต่บุญค่ายโยมยังน้อย ทำบุญให้ถึงห้าสิบก่อน แล้วอาตมาจะไปหา")),C("ครับหลวงพ่อ")];}}];}

/* --- weekly arc state --- */
{const _w=ghWeekly;ghWeekly=function(G){const S=ghSt(G),was=S.shrineOK;_w(G);if(!S.on)return;const y=ghYear(G);
  if(S.sq==null)S.sq=S.shrine?5:S.shrineOK>=2?1:0; /* saves from before the quest */
  const lpOK=S.merit>=50&&(y>=3||(y===2&&G.week>GH_LENT()[1])); /* v1.91.144: Luang Pho comes once the year-2 Lent is over */
  if(!was&&S.shrineOK&&!lpOK)S.shrineOK=0;
  if(!S.shrineOK&&lpOK)S.shrineOK=1;
  if(S.stage<1&&(S.wins>=2||S.haunts>=3))S.stage=1;if(S.stage<2&&S.wins>=4&&S.haunts>=5)S.stage=2;
  if(S.shrine){S.lowW=S.merit<25?(S.lowW||0)+1:0;if(!S.sulk&&S.lowW>=3)S.sulk=1;if(S.sulk===1&&S.merit>=45)S.sulk=2;}};}
{const _d=ghHauntDue;ghHauntDue=function(G,rng){const S=ghSt(G);if(S.on&&S.shrine&&S.sulk===1){if(gameWeek(G)-S.last<GH_CD)return false;return rng()<.45;}return _d(G,rng);};}
/* the shrine needs the year-2 quest; the teak is a camp action */
GH_ACT.wood={name:"สั่งไม้สักทำศาลจากช่างไม้เมืองแพร่",desc:"ขั้นที่ 2 ของเควสต์ศาลนางตานี",cost:15000,merit:3};
CAMP_ACTIONS.gh_wood={name:GH_ACT.wood.name,desc:GH_ACT.wood.desc,cost:15000,get hidden(){return typeof G==="undefined"||!G||!ghSt(G).on||ghSt(G).sq!==2;}};
{const A=CAMP_ACTIONS.gh_shrine;Object.defineProperty(A,"hidden",{get(){if(typeof G==="undefined"||!G)return true;const S=ghSt(G);return !S.on||S.shrine||(S.sq||0)<4;}});}
{const _d=doCampAction;doCampAction=function(G,k){const n=_d(G,k);if(n!=null&&k==="gh_wood"){const S=ghSt(G);S.sq=3;S.sqAbs=gameWeek(G);save();return "ช่างไม้แพร่ส่งไม้สักมาทั้งคันรถ ครูแดงต่อราคาจนช่างเกือบร้องไห้ · ขั้นต่อไป: นางตานีจะมาทดสอบใจคุณในฝัน";}return n;};}

/* --- a generic dream duel for the big nights --- */
function ghDuel(o,cb){const f=G.F[o.fid];const S=ghSt(G),save0=S.merit;if(o.adj)S.merit=clamp(S.merit-(o.adj*20),0,GH_MAX);const qid=ghFoe(G,o.kind,f);S.merit=save0;
  const a=o.tani?ghAlly(G,f):f.id,clean=()=>{delete G.F[qid];if(o.tani)delete G.F[a];};
  if(!o.live){const F=quickFight(G.F[a],G.F[qid],(G.seed^0x5ee)+gameWeek(G)*17+o.kind.length,o.rounds||GH_ROUNDS);clean();cb(dmWinFrom(F)==="A");return;}
  const bk={id:"bduel"+gameWeek(G)+o.kind,a,b:qid,week:G.week,tier:"dream",rounds:o.rounds||GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,o.tani?1:0),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
  try{document.body.classList.add("dreamfx");}catch(e){}openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;clean();cb(!!(F&&F.result&&F.result.win==="A"));});}
const CHOOSE=(t1,t2)=>({choice:[{t:t1,fx:()=>{UI.ghLive=1;}},{t:t2,fx:()=>{UI.ghLive=0;}}]});
const MORNING=()=>({n:"nar",t:"— เช้าวันต่อมา —",bg:"camp",show:[]});

/* --- story beats across the three years (weekly extras) --- */
{const _s=ghStory;ghStory=function(done){const S=ghSt(G);if(!S.on)return false;const y=ghYear(G),L=GH_LENT(),R=roster(G).filter(f=>!f.injury);
  /* year 1 finale: the dark-moon brawl after Lent */
  if(!S.f1&&!S.shrine&&S.haunts>=2&&G.week>L[1]&&(y>=2||Object.keys(S.ogSeen||{}).length>=1)&&R.length){S.f1=1;save();const f=ghPickFighter(G)||R[0];
    ghPlay([N("คืนเดือนดับหลังออกพรรษา ไฟทั้งค่ายดับพร้อมกันตอนเที่ยงคืน"),{n:"nar",t:"ในฝัน ทั้งค่ายยืนอยู่บนเวทีต้นกล้วย รอบเวทีมีแสงม่วง แสงส้ม เสียงกีบเท้า และเสียงพึ่บพั่บ… ผีทั้งสี่ตนมากันพร้อมหน้า",bg:"dream"},
     {n:"npc",who:"ผีม้าบ้อง",t:"ฮี้! ค่ายนี้บุญเยอะเกินไปแล้ว พวกข้าจะมาเหยียบให้แบนทั้งค่าย!"},TN("…ใครจะเหยียบอะไรนะ","scary"),
     N("แสงเขียวพุ่งลงมาขวางกลางเวที นางตานียืนกอดอก ผมยาวสยายเต็มเวที"),TN("ที่ตรงนี้ข้าจองไว้อำคนเดียว! พวกบ้านนอกไปอำที่อื่น!","angry"),
     MY("(…เธอกำลังปกป้องเราเหรอ)"),TN(`ไม่ได้ปกป้อง! ข้าแค่หวงที่! …${f.name} ข้าจัดการตัวเล็ก ๆ เอง เจ้าเอาเจ้าม้าบ้าตัวนั้นไป`,"angry_smile"),
     CHOOSE(`เชียร์${f.name}สู้กับผีม้าบ้อง (ชกในฝัน)`,"ท่องอิติปิโส ให้ผลออกเอง")],()=>{const live=UI.ghLive;UI.ghLive=null;
      ghDuel({fid:f.id,kind:"mabong",adj:.4,live},win=>{S.stage=Math.max(S.stage,2);save();
        ghPlay([N(win?"ผีม้าบ้องวิ่งหนีออกนอกค่าย ร้องฮี้ไปตลอดทาง ผีอีกสามตนแตกฮือตามไป":"ผีม้าบ้องถีบนักมวยกระเด็น แต่นางตานีพุ่งเข้าไปฟาดกาบกล้วยจนมันวิ่งหนี"),
          TN(win?"ฮึ… พอใช้ได้":"เห็นไหม ไม่มีข้าพวกเจ้าแย่แน่",win?"angry_smile":"angry"),
          TN("อย่าคิดว่าข้าช่วยนะ… แต่ถ้าปีหน้าพวกเจ้าทำบุญดีพอ ข้าอาจจะคิดเรื่องย้ายไปอยู่ที่ที่มีหลังคา","shy"),
          GMOFF(),MORNING(),C("เมื่อคืนครูฝันว่านางตานีช่วยเรา… ครูว่าปีหน้าเราต้องทำบุญจริงจังแล้ว"),
          N("📜 ปีแรกกับนางตานีจบแล้ว — ปีหน้า: ผ่านพรรษาปีที่สองไปให้ได้ ถ้าบุญค่ายถึง 50 หลังออกพรรษา หลวงพ่อจะมาช่วยเรื่องศาล")],done,{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});return true;}
  /* year 2: the shrine quest — Luang Pho (old beat, now sq=1), the spot, the teak (camp action), Tani's test */
  if(S.sq===1&&gameWeek(G)-(S.sqAbs||0)>=1){S.sq=2;S.sqAbs=gameWeek(G);save();
    playScene([N("ครูแดงถือตลับเมตรเดินวนรอบค่ายตั้งแต่เช้า จะหาที่ตั้งศาล"),C("ผู้จัดการว่าตรงไหนดี ครูว่าต้องถามเจ้าของบ้านด้วย…"),
     {choice:[{t:"ข้างกอกล้วย ใต้ต้นที่ใหญ่ที่สุด",then:[N("ใบกล้วยไหวเบา ๆ ทั้งกอ ทั้งที่ไม่มีลม"),C("…ครูว่าเขาพยักหน้านะ")]},
      {t:"ข้างเวทีมวย จะได้ดูไฟต์ทุกวัน",then:[N("ตลับเมตรของครูแดงม้วนกลับเองดังแปะ หนีบนิ้วครูเต็ม ๆ"),C("โอ๊ย! …ไม่เอาเวทีก็ได้ ข้างกอกล้วยแล้วกัน")]},
      {t:"ข้างครัว ของถวายจะได้ร้อน ๆ",then:[N("กลิ่นกล้วยทอดจากครัวโชยมา แล้วกระทะก็คว่ำเองหนึ่งใบ"),C("…ข้างครัวมีกล้วยทอด เขาคงไม่ปลื้ม ข้างกอกล้วยแล้วกัน")]}]},
     N("🏮 เควสต์ศาลนางตานี: ได้ที่ตั้งศาลแล้ว — ขั้นต่อไป สั่งไม้สักจากแพร่ (กิจกรรมค่าย)")],done,{bg:"camp",look:"casual"});return true;}
  if(S.sq===3&&gameWeek(G)-(S.sqAbs||0)>=1){S.sqAbs=gameWeek(G);let ok=0;const Q=(_,o)=>({choice:o.map(([t,good,reply,img])=>({t,fx:()=>{if(good)ok++;},then:[TN(reply,img)]}))});save();
    ghPlay([N("คืนที่ไม้สักมาถึงค่าย คุณฝันเห็นนางตานีนั่งไขว่ห้างอยู่บนกองไม้"),TN("จะสร้างบ้านให้ข้าเหรอ… ข้าต้องรู้ก่อนว่าเจ้ารู้จักข้าแค่ไหน ตอบมาสามข้อ","angry_smile"),
     TN("ข้อหนึ่ง ของถวายที่ข้าชอบที่สุดคืออะไร","neutral"),Q(0,[["ขนมต้ม",1,"ถูก… มะพร้าวต้องหวานน้อยนะ","smile"],["กล้วยทอด",0,"……เจ้าอยากโดนอำอีกสามปีใช่ไหม","scary"],["พิซซ่า",0,"พิซซ่าคืออะไร… ฟังดูไม่ใช่ของผี","angry"]]),
     TN("ข้อสอง ผ้าที่ควรผูกต้นข้า","neutral"),Q(1,[["ผ้าแพรสามสี",1,"ใช่… สีเขียว เหลือง ชมพู สวยที่สุด","shy"],["ผ้าขาวม้าครูแดง",0,"ผ้าผืนนั้นกลิ่นน้ำมันมวยสิบปี ไม่เอา!","angry"],["ริบบิ้นสีชมพูลายหัวใจ",0,"…ไม่เลวนะ แต่ไม่ใช่","angry_smile"]]),
     TN("ข้อสุดท้าย… ทำไมเจ้าถึงอยากตั้งศาลให้ข้า","neutral"),Q(2,[["อยากขอบคุณ และขอโทษเรื่องต้นกล้วย",1,"…ตอบดีกว่าที่ข้าคิดไว้","shy"],["อยากได้เลขเด็ด",0,"ข้ารู้อยู่แล้ว! คนทั้งหมู่บ้านก็คิดแบบนี้","angry"],["เพราะกลัวผี",0,"กลัวแล้วสร้างบ้านให้ผีเนี่ยนะ… ตรรกะคนนี่แปลกจริง","angry_smile"]]),
     {inject:()=>{if(ok>=2){S.sq=4;save();return [TN(`ถูก ${ok} ข้อ… ผ่าน! สร้างศาลให้ข้าได้ แต่ทาสีเขียวนะ ห้ามสีอื่น`,"smile"),GMOFF(),N("🏮 ผ่านบททดสอบ — ปลดล็อก “ตั้งศาลนางตานี” ในกิจกรรมค่าย")];}
       return [TN(`ถูกแค่ ${ok} ข้อ… ไปทำความรู้จักข้าให้มากกว่านี้ แล้วค่อยมาใหม่`,"angry"),GMOFF(),N("นางตานีจะมาทดสอบอีกครั้งในอีกไม่กี่สัปดาห์")];}}],done,{bg:"dream",look:"casual"});
    S.sqAbs=gameWeek(G)+1;return true;} /* sq stays 3 unless she passes you inside the scene; a retry comes two weeks on */
  /* the shrine is neglected: she sulks, then makes up once merit comes back */
  if(S.sulk===2){S.sulk=0;S.lowW=0;save();playScene([N("ฝุ่นบนศาลถูกเช็ดจนเงา ขนมต้มชุดใหม่ยังอุ่น น้ำแดงใส่น้ำแข็งเต็มแก้ว"),TN("…ฮึ ค่อยยังชั่ว","angry_smile"),TN("ไม่ได้หายงอนเพราะขนมนะ หายงอนเพราะเจ้ากลับมาจำข้าได้","shy"),N("🏮 นางตานีหายงอนแล้ว — กลับมาคุ้มครองค่ายเหมือนเดิม")],done,{bg:"camp_night",look:"casual"});return true;}
  /* year 3 finale: the Lent truce — your fighter, then Tani against the phi phong elder */
  if(!S.f3&&S.shrine&&y>=3&&G.week>L[1]&&R.length){S.f3=1;S.f3Abs=gameWeek(G);save();const f=ghPickFighter(G)||R[0];let w1=false;
    ghPlay([N("ออกพรรษาปีที่สาม คืนนั้นลมแรงผิดปกติ ใบกล้วยทั้งกอส่งเสียงเหมือนคนกระซิบพร้อมกันเป็นร้อยคน"),{n:"nar",t:"ในฝัน ผีทั้งสี่ตนยืนเรียงหน้ากระดานบนเวที ตรงกลางคือผีโพงตัวใหญ่กว่าทุกครั้ง แสงจากจมูกสว่างจนแสบตา",bg:"dream"},
     {n:"npc",who:"ผีโพงผู้เฒ่า",t:"ฟุดฟิด… สามปีแล้วที่ค่ายนี้ทำให้พวกข้าอดปลาร้า คืนนี้ตัดสินกัน ชนะสองไฟต์ พวกข้าจะไม่มาวุ่นวายอีก"},
     TN("รับคำท้า! ไฟต์แรกให้นักมวยของบ้านนี้ ไฟต์หลังข้าเอง","angry"),MY("(ครั้งนี้ไม่ต้องให้ใครบอก… เชียร์สุดเสียง)"),
     CHOOSE(`เชียร์${f.name}สู้กับกระสือ (ชกในฝัน)`,"ท่องอิติปิโส ให้ผลออกเอง")],()=>{const live=UI.ghLive;UI.ghLive=null;
      ghDuel({fid:f.id,kind:"krasue",adj:.6,live},win=>{w1=win;
        ghPlay([N(win?`${f.name}ซัดกระสือหมุนติ้วลอยหายไปเหนือทุ่งนา`:`กระสือหัวเราะคิกคัก ${f.name}ทรุดลงกลางเวที`),TN(win?"เก่งมาก! ทีนี้ตาข้า":"ไม่เป็นไร… ไฟต์หลังข้าเอาคืนให้",win?"smile":"angry"),
          CHOOSE("เชียร์นางตานีสู้กับผีโพงผู้เฒ่า (ชกในฝัน)","ท่องอิติปิโส ให้ผลออกเอง")],()=>{const live2=UI.ghLive;UI.ghLive=null;
          ghDuel({fid:f.id,kind:"phiphong",adj:1,live:live2,tani:1},win2=>{const both=w1&&win2;S.truce=win2?1:0;S.tb=clamp((S.tb||0)+(win2?6:2),0,ghCap(G));save();
            ghPlay([N(win2?"นางตานีหมุนตัวฟาดกาบกล้วยเต็มแรง ผีโพงผู้เฒ่ากลิ้งตกคูน้ำ แสงส้มดับวูบ":"ผีโพงผู้เฒ่าผลักนางตานีถอยไปถึงเสามุม แต่เธอยังยืนอยู่"),
              {n:"npc",who:"ผีโพงผู้เฒ่า",t:win2?"ฟุดฟิด… ยอมแล้ว ๆ สัญญาก็สัญญา พวกข้าจะแวะมาแค่นาน ๆ ที …ขอปลาร้าไว้หน้าครัวสักถ้วยก็พอ":"ฟุดฟิด… เจ้าที่บ้านนี้ใจสู้ ข้าไม่ยอมแพ้หรอก แต่ข้าจะลดความถี่ให้นิดหน่อย"},
              TN(win2?"ได้ยินไหม! บ้านนี้มีเจ้าที่!":"…ปีหน้าข้าจะซ้อมเพิ่ม",win2?"angry_smile":"angry"),
              TN("สามปีแล้วนะ ที่เจ้ามาเตะ มาวุ่นวาย มาทำบุญ มาคุยกับข้า… ข้าไม่เคยมีปีไหนที่ไม่เหงาเท่านี้มาก่อน","shy"),
              GMOFF(),MORNING(),C(both?"เมื่อคืนครูฝันว่าเราชนะผีสองไฟต์รวด… ครูจะจดลงสมุดสถิติหน้าสุดท้าย หน้าที่ไม่มีใครเห็น":"เมื่อคืนครูฝันแปลก ๆ อีกแล้ว… แต่ตื่นมารู้สึกเบาใจยังไงไม่รู้"),
              N("📜 เรื่องของนางตานีครบสามปีแล้ว — จากนี้ดูแลบุญค่ายไว้ ถ้าบุญตก ศาลจะฝุ่นเกาะและเธอจะงอน ผีช่วงพรรษาจะยังแวะมาเป็นระยะ")],done,{bg:"dream",look:"casual"});});},{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});return true;}
  return _s(done);};}
/* once the truce stands, the Lent ghosts drop by less */
{const _o=ghOtherDue;ghOtherDue=function(G,rng){const S=ghSt(G);if(S.truce&&rng()<.3)return null;if(S.sulk===1)return _o(G,()=>rng()*.8);return _o(G,rng);};}

/* --- year-by-year sightings and the haunt lines while she sulks --- */
{const _h=ghHaunt;ghHaunt=function(done){const S=ghSt(G);if(S.shrine&&S.sulk===1){const keep=GH_TANI_LINE[2];GH_TANI_LINE[2]=GH_SULK;const st=S.stage;S.stage=2;try{_h(done);}finally{GH_TANI_LINE[2]=keep;S.stage=st;}return;}_h(done);};}
{const s0=Object.assign({},ghSight);for(const k of Object.keys(ghSight))ghSight[k]=f=>{const y=ghYear(G);return y<=1?s0[k](f):ghSight2[k][Math.min(y,3)-2](f);};}

/* --- Tani's year-3 talks, hearts gated by year, and her yearly days --- */
const TT3=[
 {k:"fights",o:[TN("ร้อยปีก่อน แถวนี้มีงานวัดทุกเดือน คนชกมวยคาดเชือกกันกลางลานวัด ข้าดูจากกอกล้วยทุกไฟต์","smile")],
  c:[["มวยสมัยนั้นต่างจากตอนนี้ไหม",3,"ไม่มียก ไม่มีนวม ชกจนอีกฝ่ายยอม แล้วก็ไปกินข้าวด้วยกัน… ข้าชอบตรงนั้นที่สุด","smile"],["ใครเก่งที่สุดที่คุณเคยเห็น",2,"มีคนนึงเตะต้นข้าหักครึ่งต้น ข้าโกรธมาก …แต่ก็ยอมรับว่าเก่ง","angry_smile"],["คุณชอบมวยด้วยเหรอ",1,"ข้าเกิดมาข้างเวทีนะ จะไม่ชอบได้ยังไง","neutral"]]},
 {k:"name",o:[TN("ข้าไม่มีชื่อจริงหรอก ‘นางตานี’ คือชื่อที่คนเรียก… ถ้าเจ้าจะตั้งชื่อให้ข้าสักชื่อ จะชื่ออะไร","shy")],
  c:[["ตานีก็เพราะดีแล้ว",3,"…งั้นข้าจะชอบชื่อนี้ให้มากกว่าเดิม","shy"],["เขียวมรกต",1,"ฟังเหมือนร้านทองหน้าตลาด แต่ก็… ไม่เลว","angry_smile"],["น้องกล้วย",-1,"……เจ้าอยากให้ข้ากลับไปอำไหม","scary"]]},
 {k:"future",o:[TN("เมื่อวานมีคนใส่สูทมาวัดที่ดินข้างค่าย… เขาจะตัดกอกล้วยไหม","neutral")],
  c:[["ผมจะไม่ให้ใครตัดกอกล้วยนี้",4,"…เจ้าพูดเหมือนปู่เจ้าเลย คำเดียวกันทุกคำ","shy"],["เขาแค่มาวัดที่ข้าง ๆ",1,"ข้าหวงนะ แค่ข้าง ๆ ก็หวง","angry"],["ถ้าตัด เราย้ายศาลไปด้วยกัน",3,"ย้ายบ้านกับเจ้าเหรอ… ฟังดูไม่แย่","smile"]]},
 {k:"jealous",o:[TN("ข้าไม่หึงหรอก ผีไม่หึง… แค่อยากรู้ว่าช่วงนี้เจ้าไปเที่ยวกับใครบ่อย","angry_smile")],
  c:[["ก็เด็ก ๆ ในค่ายนั่นแหละ",2,"ดีแล้ว ดูแลพวกเขาให้ดี ข้าดูอยู่นะ","neutral"],["มานั่งคุยกับคุณบ่อยที่สุด",3,"…ปากหวานอีกแล้ว แต่ก็จริงนะ","shy"],["ทำไมอยากรู้ล่ะ",1,"ข้าเป็นเจ้าที่! เจ้าที่ต้องรู้ทุกเรื่องในบ้าน!","angry"]]},
 {k:"sleep",o:[TN("ผีไม่ได้นอนนะ แต่บางคืนข้าหลับตาฟังเสียงพวกเจ้ากรน… ครูเจ้ากรนเป็นเพลงลูกทุ่ง","smile")],
  c:[["แล้วคุณฝันได้ไหม",3,"ข้าฝันตอนกลางวัน… ฝันว่าได้ลองเตะกระสอบทรายบ้าง","smile"],["ใครกรนดังสุดในค่าย",2,"ครูแดง รองลงมาคือคนที่ผูกเชือกแดงขาว …อย่าบอกเธอนะ","angry_smile"],["ไม่เหงาเหรอกลางคืน",2,"เหงา… แต่ตอนนี้มีเสียงกรนให้นับ เลยไม่เหงาเท่าเดิม","shy"]]},
 {k:"grandpa",o:[TN("ปู่ของเจ้าน่ะ ตอนหนุ่มแพ้มวยงานวัดครั้งนึง เดินมาร้องไห้ข้างกอกล้วยข้าทั้งคืน","neutral")],
  c:[["แล้วคุณทำยังไง",3,"ข้าเอาใบกล้วยห่มให้… วันต่อมาเขาเตะต้นข้าห้าร้อยที ข้ายอมให้เตะ","shy"],["ปู่ผมขี้แยด้วยเหรอ",1,"ทุกคนขี้แยตอนแพ้ เจ้าก็ด้วย ข้าเห็น","angry_smile"],["ขอบคุณที่ดูแลปู่นะ",4,"…ข้าดูแลทุกคนในบ้านนี้แหละ รวมถึงเจ้าด้วย","smile"]]},
 {k:"scared",o:[TN("ตอนนี้เจ้ายังกลัวข้าอยู่ไหม บอกตรง ๆ","neutral")],
  c:[["ไม่กลัวแล้ว",2,"ดี… แต่อย่าลืมว่าข้ายังอำได้นะ","angry_smile"],["กลัวนิดนึงตอนตีสาม",3,"ฮิ ๆ ตีสามข้าก็กลัวตัวเองนิดนึง","smile"],["กลัวว่าวันนึงคุณจะหายไป",4,"……ข้าไม่ไปไหนหรอก ตราบใดที่ยังมีคนจำข้าได้","shy"]]},
 {k:"promise",o:[TN("สัญญากับข้าข้อนึงได้ไหม","neutral")],
  c:[["สัญญาอะไรก็ได้",3,"เอาน้ำแดงมาทุกวันพระ แล้วบอกเด็ก ๆ ให้ไหว้ก่อนเตะ… แค่นั้น ง่ายใช่ไหม","smile"],["ขึ้นอยู่กับว่าสัญญาอะไร",1,"ระวังตัวแบบนี้ ข้าชอบ","angry_smile"],["ถ้าเป็นเรื่องเลขหวยไม่สัญญานะ",2,"ฮึ! ข้าไม่ได้จะขอเรื่องนั้น… แต่เดี๋ยวบอกใบ้ให้ก็ได้","shy"]]}];
for(const t of TT3)t.y=3;TT.push(...TT3);
TH[0].need=G=>!!ghSt(G).shrine;TH[1].need=G=>ghYear(G)>=3;TH[1].at=35;TH.splice(2,1); /* the third heart now plays on Loy Krathong night */
{const _t=ghTalk;ghTalk=function(){const S=ghSt(G),y=ghYear(G),keepTT=TT.slice(),keepTH=TH.slice();
  const tt=TT.filter(t=>(t.y||2)<=y),th=TH.map(h=>h.need&&!h.need(G)?{...h,at:999}:h);TT.length=0;TT.push(...tt);TH.length=0;TH.push(...th);
  try{_t();}finally{TT.length=0;TT.push(...keepTT);TH.length=0;TH.push(...keepTH);}};}
const GH_SONG=()=>[ghWk(12,3),ghWk(16,3)],GH_BLOSSOM=()=>[ghWk(10,7),ghWk(17,7)],GH_LOY=()=>[ghWk(20,10),ghWk(28,10)];
EVENTS.push(
 {id:"gh_songkran",annual:true,look:"casual",bg:"camp",pri:2,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=2&&ghIn(G,GH_SONG());},steps:[{inject:G=>{const S=ghSt(G),first=!S.songN;S.songN=(S.songN||0)+1;S.merit=clamp(S.merit+5,0,GH_MAX);S.tb=clamp((S.tb||0)+2,0,ghCap(G));
   return first?[N("สงกรานต์ ทั้งค่ายเอาน้ำอบไทยมารดน้ำศาลนางตานี ครูแดงสรงน้ำช้า ๆ อย่างตั้งใจ"),N("แล้วกะทิก็สาดน้ำทั้งขันใส่ศาล… ใส่ต้นกล้วย… ใส่ครูแดง"),TN("ฮิ ๆ ๆ ๆ! เย็นดี! อีกขัน!","smile"),C("ทำไมครูรู้สึกว่ามีคนสาดน้ำกลับมาจากกอกล้วย…"),N("🪷 บุญค่าย +5 · ความสนิทกับนางตานี +2")]
    :[N("สงกรานต์อีกปี ทั้งค่ายรดน้ำศาลนางตานีเหมือนทุกปี"),TN(pk(["ปีนี้ใส่น้ำอบเยอะหน่อยนะ ข้าชอบกลิ่นนี้","อย่าสาดแรงเหมือนปีที่แล้ว ผ้าแพรข้าเปียกสามวัน","สงกรานต์ทีไร ข้ารู้สึกเหมือนได้อาบน้ำครั้งเดียวของปี… ล้อเล่น"]),"smile"),N("🪷 บุญค่าย +5")];}}]},
 {id:"gh_blossom",annual:true,look:"casual",bg:"camp_night",pri:2,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=3&&ghIn(G,GH_BLOSSOM());},steps:[{inject:G=>{const S=ghSt(G),first=!S.bloN;S.bloN=(S.bloN||0)+1;S.tb=clamp((S.tb||0)+3,0,ghCap(G));
   return first?[N("ต้นกล้วยข้างศาลออกปลีสีม่วงแดงต้นแรกของปี ครูแดงบอกว่าเป็นมงคล"),TN("…วันนี้วันเกิดข้า ทุกปีที่ปลีแรกออก ข้าจะนับว่าข้าอายุเพิ่มหนึ่งปี","shy"),MY("แล้วตอนนี้อายุเท่าไหร่"),TN("ถามอายุผู้หญิง… ต่อให้เป็นผีก็เสียมารยาทนะ!","angry"),
     N("คืนนั้นทั้งค่ายจุดเทียนเล่มเล็กรอบศาล มะลิทำขนมต้มใส่ถาด กะทิร้องเพลงวันเกิดผิดคีย์ทั้งเพลง"),TN("…ขอบใจนะ ทุกคน","smile"),N("💚 ความสนิทกับนางตานี +3")]
    :[N("ปลีกล้วยต้นแรกของปีออกอีกแล้ว วันเกิดนางตานีวนมาอีกปี"),TN(pk(["ปีนี้ขนมต้มหวานพอดี ข้าให้ผ่าน","ข้าแก่ขึ้นอีกปีแล้ว… แต่ไม่ต้องนับนะ!","เทียนปีนี้เยอะกว่าปีที่แล้ว ข้าเห็นนะ ข้านับ"]),"smile"),N("💚 ความสนิทกับนางตานี +3")];}}]},
 {id:"gh_loy",annual:true,look:"casual",bg:"camp_night",pri:3,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=3&&ghIn(G,GH_LOY());},steps:[{inject:G=>{const S=ghSt(G);
   if(!S.loyHeart&&(S.tb||0)>=55){S.loyHeart=1;S.th=Math.max(S.th||0,3);S.tb=clamp(S.tb+5,0,ghCap(G));return [GMON(),N("คืนลอยกระทง ทั้งค่ายไปงานที่ริมน้ำ คุณเดินกลับมาที่ศาล ถือกระทงขนมปังมาหนึ่งใบ"),
     TN("…กระทงขนมปัง ไม่ใช่กาบกล้วย","shy"),MY("ปีนี้ผมให้ทุกคนใช้ขนมปังหมด ปลากินได้ด้วย"),TN("ฮิ ๆ ๆ… เจ้านี่มันบ้าจริง ๆ","smile"),
     N("นางตานีลอยลงมานั่งข้างคุณ เป็นครั้งแรกที่เธอนั่งใกล้ขนาดนี้ ตัวเธอเย็นเหมือนน้ำค้างตอนเช้า"),TN("ข้าเป็นผี เจ้าเป็นคน ข้าอยู่ที่นี่ไปอีกร้อยปี เจ้าอยู่ได้อีกไม่กี่สิบ","neutral"),
     TN("แต่ข้าว่า… เราเป็นเพื่อนกันได้นะ เพื่อนที่จะคอยดูค่ายนี้ไปด้วยกัน จนกว่าเจ้าจะแก่จนเตะต้นกล้วยไม่ไหว","smile"),MY("เพื่อนกันครับ"),
     TN("ดี! งั้นเพื่อนต้องเอาน้ำแดงมาฝากทุกวันพระ ห้ามลืม!","angry_smile"),N("ไกล ๆ เสียงพลุดังขึ้นเหนือแม่น้ำ แสงสีเขียวจาง ๆ ลอยขึ้นจากกอกล้วยไปปนกับแสงพลุ"),GMOFF(),N("💚 นางตานีเป็นเพื่อนสนิทของคุณแล้ว — เธอจะคุ้มครองค่ายแรงขึ้นอีก")];}
   return [N("คืนลอยกระทง ทุกคนลอยกระทงขนมปัง ไม่มีใครแตะกาบกล้วยสักใบ"),TN(pk(["ปีนี้กระทงขนมปังของกะทิจมเร็วสุด ฮิ ๆ","ปลาในคลองอ้วนขึ้นทุกปีเพราะค่ายเจ้านะ","ข้าลอยกระทงด้วยนะปีนี้ …ไม่บอกหรอกว่าใบไหน"]),"smile")];}}]});


/* ================= Phase 5 (v1.91.144, Man): a side story that guides the player and never crowds the main game =================
   - ghost scenes of every kind at most once every 3 weeks, after the main quests
   - fevers capped per season; Kru Daeng nudges a player who lets merit sink
   - closeness capped by year (the friendship belongs to year 3)
   - with merit (or the shrine) you command your fighter's corner in a dream; from heart 2 you command Tani's
   - after the story, Tani now and then brings a wandering ghost to fight; offerings at her card like gifts */
const GH_GAP=3,GH_FEVER_MAX=6,GH_ROUNDS=3; /* v1.91.144 (Man): dream fights go three rounds */
const ghCapY=G=>{const y=ghYear(G);return y>=3?100:y===2?40:20;},ghCap=G=>Math.max(ghCapY(G),ghSt(G).tb||0); /* never takes back closeness an older save already has */
const ghCtrl=(G,tani)=>{const S=ghSt(G);return tani?(S.th||0)>=2:(S.merit>=60||!!S.shrine);};
const ghCtrlToast=bk=>{try{if(bk.ctrl)setTimeout(()=>toast(bk.a==="q_tani_ally"?"💚 นางตานีฟังคุณแล้ว — สั่งมุมให้เธอได้เต็มที่":"🪷 บุญค่ายแรงพอ คุณขยับตัวได้ในฝัน — สั่งมุมได้เต็มที่"),400);}catch(e){}};

/* what to do next — shown on the merit bar, in the help and in Kru Daeng's tips */
function ghGoal(G){const S=ghSt(G),y=ghYear(G);if(!S.on)return "";
  if(S.shrine&&S.sulk===1)return "นางตานีงอน ศาลฝุ่นเกาะ — ทำบุญให้บุญค่ายกลับไปถึง 45";
  if(y<=1)return S.f1?"ปีหน้า: ผ่านพรรษาไปให้ได้ บุญถึง 50 หลังออกพรรษา หลวงพ่อจะมาเรื่องศาล":"ปีแรก: ทำบุญให้บุญค่ายสูงไว้ ผีจะมาน้อยลง นักมวยไม่ค่อยไข้";
  if(!S.shrine){if(!S.sq)return y===2&&G.week<=GH_LENT()[1]?"รอออกพรรษา แล้วรักษาบุญค่ายให้ถึง 50 — หลวงพ่อจะมาแนะนำเรื่องศาล":"ทำบุญให้บุญค่ายถึง 50 — หลวงพ่อจะมาแนะนำเรื่องศาล";
    return ["","รอครูแดงหาที่ตั้งศาล (สัปดาห์หน้า)","สั่งไม้สักจากแพร่ — ในกิจกรรมค่าย","รอนางตานีมาทดสอบในฝัน","ตั้งศาลนางตานี ฿60,000 — ในกิจกรรมค่าย"][S.sq]||"";}
  if(y===2)return "ไปนั่งคุยหรือถวายของที่ศาล — แท็บตัวละคร (ปีนี้ความสนิทขึ้นได้ถึง 40)";
  if(!S.f3)return "ปีที่สาม: คุยกับนางตานีให้สนิท ลอยกระทงด้วยกัน และเตรียมรับคำท้าหลังออกพรรษา";
  return "รักษาบุญค่ายไว้ไม่ให้ต่ำกว่า 25 — ไม่งั้นศาลฝุ่นเกาะ นางตานีงอน";}
const GH_HELP=G=>{const S=ghSt(G);return [N("🪷 บุญค่ายคืออะไร"),
  N(`บุญค่ายตอนนี้ ${S.merit}/100 · ดูได้ที่หน้าแรก (ปุ่มกิจกรรมค่าย) และบนรายการกิจกรรมค่าย ถ้าสัปดาห์ไหนไม่ได้ทำบุญเลย บุญจะลดลง 3`),
  N("บุญสูง: ผีมาน้อย ผีอ่อนลง นักมวยไม่ค่อยไข้ · บุญ 60 ขึ้นไป สั่งมุมในไฟต์ฝันได้เอง · บุญต่ำกว่า 25: ผีมาบ่อย ผีแรง ไข้นานขึ้น"),
  N("ทำบุญได้จาก “กิจกรรมค่าย” (สัปดาห์ละหนึ่งอย่าง): ตักบาตรเช้า +6 · ไหว้ครู +10 · ถวายของที่ศาล +4 · ผ้าป่า +12 (ทุก 6 สัปดาห์) · ทำบุญใหญ่ +16 · บวชเณรภาคฤดูร้อน +24 (เมษายน) · ทอดกฐิน +30 (หลังออกพรรษา)"),
  N("ช่วงเข้าพรรษา (ปลายกรกฎาคม–ปลายตุลาคม) หลวงพ่อจำพรรษาในวัด ผีตนอื่นจะออกมาบ่อย"),
  N(`🎯 ตอนนี้: ${ghGoal(G)}`)];};
Object.assign(ACT,{ghhelp:()=>{UI.modal=null;playScene(GH_HELP(G),()=>render(),{bg:"temple",look:"casual"});}});
{const _h=campActsHTML;campActsHTML=function(){const h=_h();if(typeof G==="undefined"||!G||UI.modal.pick)return h;const S=ghSt(G);if(!S.on)return h;
  return h.replace(/(<div class="ghbar"[^]*?<\/div>)/,`$1<div class="ghgoal"><span>🎯 ${ghGoal(G)}</span><button class="btn sm" data-act="ghhelp">บุญค่ายคืออะไร?</button></div>`);};}
{const _h=homeHTML;homeHTML=function(){const h=_h();try{const S=G&&G.gh;if(!S||!S.on)return h;const m=S.merit,c=m<25?"ghlow":"";
  return h.replace('<small>กิจกรรมค่ายสัปดาห์นี้',`<small><em class="ghm ${c}">🪷 บุญค่าย ${m}</em> · กิจกรรมค่ายสัปดาห์นี้`);}catch(e){return h;}};}
{const _t=coachTips;coachTips=function(force){const T=_t(force);try{const S=G&&G.gh;if(!S||!S.on||(!coachOn()&&!force))return T;
  if(S.merit<25)T.push({p:7,t:`บุญค่ายเหลือ ${S.merit} ผีจะมาบ่อย นักมวยจะไข้ — เลือกตักบาตรเช้าหรือไหว้ครูในกิจกรรมค่ายเถอะผู้จัดการ`,act:{k:"campacts",label:"เลือกกิจกรรม"}});
  else if(S.sq===2||(S.sq===4&&!S.shrine))T.push({p:5,t:`เรื่องศาลนางตานี: ${ghGoal(G)}`,act:{k:"campacts",label:"กิจกรรมค่าย"}});
  return T.sort((a,b)=>b.p-a.p);}catch(e){return T;}};}
/* the camp actions that make merit say so */
for(const [k,v] of [["merit",6],["waikhru",10]]){const A=CAMP_ACTIONS[k];if(!A)continue;const d0=A.desc;Object.defineProperty(A,"desc",{configurable:true,get(){try{return G&&G.gh&&G.gh.on?`${d0} · 🪷 บุญค่าย +${v}`:d0;}catch(e){return d0;}}});}
{const _w=ghWeekly;ghWeekly=function(G){const S=ghSt(G),m0=S.merit;_w(G);if(!S.on)return;
  S.lowRun=S.merit<25?(S.lowRun||0)+1:0;
  if(m0>=25&&S.merit<25)try{setTimeout(()=>toast("🪷 บุญค่ายต่ำกว่า 25 — ผีจะมาบ่อยขึ้น ดูวิธีทำบุญที่กิจกรรมค่าย"),600);}catch(e){}};}

/* Kru Daeng's nudge, and the loop's wandering ghosts */
{const _s=ghStory;ghStory=function(done){const S=ghSt(G);if(!S.on)return false;
  if(S.lowRun>=8&&gameWeek(G)-(S.nudge??-99)>=20){S.nudge=gameWeek(G);save();
    playScene([C("ผู้จัดการ… ครูขอคุยเรื่องบุญค่ายหน่อย"),C(`ตอนนี้บุญค่ายเราเหลือ ${S.merit} เอง ผีมาทุกเดือน เด็ก ๆ ไข้กันเป็นแถว ครูสวดมนต์จนเสียงแหบแล้ว`),
      C("ไม่ต้องทำบุญใหญ่ก็ได้ ตักบาตรเช้าสัปดาห์เว้นสัปดาห์ก็พอแล้ว ถูกด้วย สามร้อยบาท ไหว้ครูยิ่งดีใหญ่"),C("ดูได้ที่กิจกรรมค่ายนะ มีแถบ 🪷 บุญค่ายอยู่ข้างบน"),
      {choice:[{t:"เข้าใจแล้วครู",then:[C("ดี! เดี๋ยวครูตื่นตีห้าไปซื้อของใส่บาตรรอ")]},{t:"บุญค่ายคืออะไรนะ",then:GH_HELP(G)}]}],done,{bg:"camp",look:"casual"});return true;}
  const y=ghYear(G);
  if(y>=4&&S.shrine&&S.f3&&!S.sulk&&!ghIn(G,GH_LENT())&&gameWeek(G)-(S.chAbs??(S.f3Abs||-99))>=16&&Math.random()<.2){S.chAbs=gameWeek(G);save();ghWander(done);return true;}
  return _s(done);};}
const GH_WANDER=[["krasue","กระสือสาวจากบ้านโป่ง","ได้ข่าวว่าค่ายนี้มีเจ้าที่ชกเก่ง ข้ามาขอลองมือ!"],["krahang","กระหังร่อนเร่จากอยุธยา","ข้าบินมาสามวันสามคืน… ขอชกสักยกแล้วขอข้าวกินด้วย"],
 ["mabong","ม้าบ้องสายซิ่งจากโคราช","ฮี้! ใครว่าข้าวิ่งเร็วแต่ชกไม่เป็น มาลองดู!"],["phiphong","ผีโพงหนุ่มจากอุบล","ฟุดฟิด… ข้าได้กลิ่นปลาร้าค่ายนี้มาไกลสามจังหวัด แลกกันชกหนึ่งไฟต์"]];
function ghWander(done){const S=ghSt(G),R=roster(G).filter(f=>!f.injury);if(!R.length){done();return;}const [kind,name,taunt]=GH_WANDER[Math.floor(Math.random()*GH_WANDER.length)],f=R[Math.floor(Math.random()*R.length)];
  ghPlay([N("ตีสอง ศาลนางตานีมีแสงเขียวสว่างวาบ ในฝันคุณเห็นเธอยืนรออยู่หน้าเวทีต้นกล้วย",),{n:"nar",t:"ข้าง ๆ เธอมีแขกแปลกหน้ายืนกอดอกอยู่",bg:"dream"},{n:"npc",who:name,t:taunt},
   TN(pk(["มีผีจรมาขอท้า… จะรับไหม ข้าว่าสนุกนะ","แขกมาเยือนอีกแล้ว เจ้าจะส่งใครลง หรือให้ข้าเล่นเอง","ข้าเบื่อ ๆ อยู่พอดี… รับคำท้าไหม ชนะแล้วเขามักทิ้งของดีไว้ให้"]),"angry_smile"),
   {choice:[{t:`ส่ง${f.name}ลงชก`,fx:()=>{UI.ghW={who:"f"};}},{t:"ให้นางตานีลงเอง",fx:()=>{UI.ghW={who:"t"};}},{t:"ไม่รับ ขอนอนต่อ",fx:()=>{UI.ghW=null;},then:[TN("ฮึ จืดชืด… งั้นข้าไล่เขากลับเอง","neutral")]}]}],()=>{
   const w=UI.ghW;UI.ghW=null;if(!w){done();return;}
   ghDuel({fid:f.id,kind,adj:.4,live:1,tani:w.who==="t"},win=>{const gift=win?1500+Math.floor(Math.random()*4)*500:0;if(win){G.cash+=gift;S.merit=clamp(S.merit+4,0,GH_MAX);S.tb=clamp((S.tb||0)+3,0,ghCap(G));}save();
     ghPlay([N(win?`${name}ยอมแพ้ หัวเราะร่า แล้วทิ้งถุงผ้าเก่า ๆ ไว้กลางเวที`:`${name}ชนะ โค้งให้หนึ่งที แล้วลอยหายไปในความมืด`),
       TN(win?pk(["ดีมาก! ข้าบอกแล้วว่าค่ายนี้ไม่ธรรมดา","ฮิ ๆ ผีจรรอบนี้แค่วอร์มอัพ","ได้ของฝากด้วย… อย่าเอาไปซื้อหวยหมดล่ะ"]):pk(["ไม่เป็นไร ผีจรบางตนก็แรงจริง","คราวหน้าเอาคืน","แพ้ก็สนุกดี ไม่มีใครไข้หรอก ข้าดูให้"]),win?"smile":"neutral"),
       GMOFF(),MORNING(),N(win?`ตื่นเช้ามา เจอถุงผ้าเก่าวางอยู่หน้าศาล ข้างในมีเงิน ฿${gift.toLocaleString()} · บุญค่าย +4 · ความสนิท +3`:"ตื่นเช้ามา ทุกคนสดชื่นดี ไม่มีใครไข้ แค่ฝันว่าแพ้ผีแปลกหน้า")],done,{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});}

/* offerings at her card, like gifts — once a week, does not use the week's free time */
const GH_GIFTS=[{k:"tom",n:"ขนมต้มมะพร้าวหวานน้อย",c:200,tb:4,m:3,img:"smile",r:["ขนมต้ม! …หวานกำลังดี เจ้ารู้ใจข้าแล้วนะ","ฮิ ๆ ขนมต้มอีกแล้ว ข้าไม่เบื่อหรอก ไม่มีวันเบื่อ"]},
 {k:"red",n:"น้ำแดงใส่น้ำแข็ง",c:100,tb:3,m:2,img:"smile",r:["น้ำแดง… ชื่นใจ ผีก็ร้อนเป็นนะ","ใส่น้ำแข็งเยอะ ๆ แบบนี้แหละ ข้าชอบ"]},
 {k:"jas",n:"พวงมาลัยมะลิ",c:150,tb:3,m:2,img:"shy",r:["มะลิ… หอมจัง ข้าจะคล้องไว้ทั้งคืน","ข้าไม่ได้เขินนะ! …แต่ก็สวยดี"]},
 {k:"silk",n:"ผ้าแพรสามสีผืนใหม่",c:800,tb:6,m:4,img:"shy",r:["ผ้าใหม่! สีสดกว่าผืนเก่าตั้งเยอะ… ขอบใจนะ","เขียว เหลือง ชมพู… เจ้าเลือกสีเป็นแล้วนี่"]},
 {k:"boba",n:"ชานมไข่มุก",c:120,tb:2,m:1,img:"neutral",r:["เม็ดดำ ๆ นี่อะไร… เคี้ยวหนึบดี ข้ายังไม่ตัดสินใจว่าชอบไหม","คนสมัยนี้กินอะไรแปลก ๆ …ขออีกแก้วได้ไหม"]},
 {k:"fry",n:"กล้วยทอด",c:80,tb:-2,m:0,img:"angry",r:["……กล้วยทอด เอามาถวายผีต้นกล้วย เจ้าคิดอะไรอยู่","เจ้าจะให้ข้ากินญาติตัวเองเหรอ!"]}];
function ghGift(){const S=ghSt(G);if(!S.shrine||S.giftW===gameWeek(G))return;
  playScene([N("คุณเดินไปที่ศาลนางตานี จะถวายอะไรดี"),{choice:[...GH_GIFTS.map(g=>({t:`${g.n} · ฿${g.c}`,fx:()=>{if(G.cash<g.c){UI.ghG=-1;return;}G.cash-=g.c;S.giftW=gameWeek(G);S.tb=clamp((S.tb||0)+g.tb,0,ghCap(G));S.merit=clamp(S.merit+g.m,0,GH_MAX);UI.ghG=g;save();},
     then:[{inject:()=>{const x=UI.ghG;UI.ghG=null;if(x===-1)return [N("เงินไม่พอ… ไว้คราวหน้า")];return [TN(pk(x.r),x.img),N(`💚 ความสนิท ${x.tb>0?"+":""}${x.tb}${x.m?` · 🪷 บุญค่าย +${x.m}`:""}`)];}}]})),{t:"ไว้วันหลัง",then:[]}]}],()=>render(),{bg:"camp_night",look:"casual"});}
Object.assign(ACT,{ghgift:()=>{UI.modal=null;ghGift();}});
{const _p=peopleHTML;peopleHTML=function(){const h=_p();try{const S=G&&G.gh;if(!S||!S.shrine)return h;const used=S.giftW===gameWeek(G);
  return h.replace(/(data-act="ghtalk"[^>]*>[^<]*<\/button>)/,`$1<button class="btn sm" data-act="ghgift" ${used?"disabled":""}>${used?"ถวายแล้วสัปดาห์นี้":"ถวายของ"}</button>`).replace(/(ความสนิท|closeness) (\d+)\/100/,(a,w,n)=>w+" "+n+"/"+(+n>ghCapY(G)?100:ghCapY(G)));}catch(e){return h;}};}

try{window.GHX={ghAlly,ghFoeT:ghFoe,ghSt,ghAdd,ghHaunt,ghFight,ghStory,ghWeekly,ghHauntDue,ghReady,ghOther,ghOtherDue,ghOddPlay,ghTalk,TT,TH,ghYear,ghDuel,ghOddDue:ghOdd,ghGoal,ghWander,ghGift,ghCap};}catch(e){}
})();

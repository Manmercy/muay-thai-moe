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
const RG_OPP={chiangrai:"แก้วกาญจน์ ส.แม่สาย",nan:"น้ำผึ้ง ลูกเมืองน่าน",uttaradit:"ทองดี ศิษย์ดาบหัก",lampang:"ม้าเหล็ก ลูกรถม้า",
 udon:"บัวแดง หนองหาน",khonkaen:"ไหมแก้ว ลูกชนบท",buriram:"สายฟ้า พนมรุ้ง",ubon:"เทียนทอง ริมโขง",
 lopburi:"จ๋อทอง ศ.พระปรางค์",suphan:"แม่ไม้ บางปลาม้า",phetchaburi:"หม้อแกง เมืองเพชร",chanthaburi:"มังคุด ลูกจันท์",
 chumphon:"นางนวล ปากน้ำ",surat:"นางรม ดอนสัก",nakhonsi:"ตะลุง ศ.เมืองคอน",songkhla:"สมิหลา ลูกสงขลา"};
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */

const REGION={
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week+1,(R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player"))return w;}return null;},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id])return id;
    /* a little under your fighter at the first belt, a little over by the sixteenth; the regional style (tilt) is part of that budget, not on top of it */
    const n=this.beltTotal(G),target=Math.min(20,ovr(me.a)-.7+n*.06),rng=mulberry32((G.seed||1)+stableHash(id)),tilt=RG[r].tilt;
    const f=baseFighter(id,mkNPC(id,RG_OPP[dest]||"แชมป์ประจำจังหวัด","X",Math.round(target-1),rng,RG_ORDER.indexOf(r)+2));
    for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
    liftOpponent(f,target,20);
    for(let i=0;i<60&&ovr(f.a)>target+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);f.camp="quest";f.div="X";f.rg=dest;f.color=RG[r].col;f.lvl=me.lvl||1;f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"ข้อมูลไม่ครบ"};
    if(R.trip)return {ok:false,why:"มีทริปที่นัดไว้แล้ว"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"ได้เข็มขัดจังหวัดนี้แล้ว"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name}ไม่พร้อมเดินทาง`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"เงินไม่พอค่าเดินทาง"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:"bg_district.webp"});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`วางแผนเดินทางไป${D.name} สัปดาห์ ${wk} · ค่าเดินทาง ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(!D||!RG[r])continue;
      const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""}คว้าเข็มขัดจังหวัด${D.name}!`);
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";const C=RG[r];
          addMail(G,{kind:"letter",from:`${C.champ} · แชมป์${C.name}`,title:`${C.name}: ครบสี่เข็มขัดแล้ว`,body:`เข็มขัดครบทั้งสี่จังหวัดของ${C.name}แล้ว เวทีชิงแชมป์ที่${ROAD_DEST[C.fin].name}เปิดรอค่ายของคุณ\n\nฉันจะส่งวันนัดชกมาให้เร็ว ๆ นี้ เตรียมนักมวยที่จะขึ้นชกกับฉันไว้ได้เลย\n\n${C.champ}`});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+2);(R.gc=R.gc||[]).push(p.b);}},
  weekly(G){const R=G.region;this.flush(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+2);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"mountain",isan:"farm",central:"ayutthaya",south:"sea"},
  trip(b,done){const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);openFight(b,()=>this.night(T,P2||P,1,done));}});},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`ทั้งค่ายเดินทางถึง${ROAD_DEST[T.dest].name} · ความล้า +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    if(n>nights){if(nights===0&&n===1&&!T.extra){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`ไฟต์ที่${D.name}จบแล้ว ทุกคนยืนรออยู่ข้างรถ`,choice:[
          {t:"กลับค่ายเลย",then:[{n:"nar",t:"รถเลี้ยวออกจากเมือง ทุกคนหลับกันตั้งแต่ยังไม่พ้นเขตจังหวัด"}]},
          {t:`อยู่เที่ยวต่ออีก 1 คืน (ค่าห้อง ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("เงินไม่พอค่าห้อง กลับค่ายกันก่อน");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`ไปเดินเล่นกับ${C.champ} (แชมป์${C.name})`,fx:G2=>{const m=G2.region.meet;m[cid]=(m[cid]||0)+3;if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`พา${g.name}ไปเที่ยว${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"พักผ่อนให้หายล้า",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"ทุกคนเข้านอนแต่หัวค่ำ เช้ามาร่างกายสดชื่นขึ้น · ความล้า −10"}]},
      {t:"ซ้อมเบา ๆ ที่ลานจอดรถโรงแรม",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"เตะเป้าใต้ไฟลานจอดรถจนยามโรงแรมมาดู · ประสบการณ์ +6"}]}];
    playScene([{n:"nar",t:nights>1?`คืนที่ ${n} ที่${D.name}`:`คืนนี้ทั้งค่ายพักที่${D.name}`},{n:"nar",t:"คืนนี้ทำอะไรดี?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[T.dest].name}`);save();done();},
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

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-belt{color:#b8860b;font-weight:700}
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
    const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>ทริปที่นัดไว้</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>สัปดาห์ ${T.wk}</b></div>
       <div class="kv-row"><span>นักมวย</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>คู่ชก</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>ค่าเดินทาง (จ่ายแล้ว)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">สัปดาห์นั้นทั้งค่ายไปด้วยกัน จึงไม่รับไฟต์อื่น</p><div class="mfoot"><button class="btn" data-act="rgcancel">ยกเลิกทริป (คืนเงิน)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} กม. · ${nights?`ค้าง ${nights} คืน`:"ไปกลับวันเดียว"}</small></span>${got?`<span class="rg-belt">🏅 ได้เข็มขัด</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>วางแผน</button>`}</div>`;}).join("");
      const fin=`<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>เวทีชิงแชมป์ภาค</small></span><span class="meta">${ch.state==="won"?"🏆 ได้ถ้วย":n<4?`🔒 ครบ 4 เข็มขัดก่อน (${n}/4)`:"✉️ รอจดหมายนัดจากแชมป์"}</span></div>`;
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">แชมป์ภาค: <b>${esc(C.champ)}</b> · ${esc(C.nick)}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>ศึกชิงเจ้าสี่ภาค</h3><span class="meta">ครั้งที่ ${R.edition||1}</span></div>
       <div class="rg-stats"><span class="pill gold">ถ้วย ${cups}/4</span><span class="pill">เข็มขัด ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`ทริป: ${esc(ROAD_DEST[T.dest].name)} · สัปดาห์ ${T.wk}`:nx?`เดินทางได้สัปดาห์ ${nx}`:"ปีนี้เดินทางไม่ได้แล้ว"}</span></div></section>
     ${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">เดินทางสัปดาห์ <b>${wk}</b> · ${D.km} กม. · ${P.nights?`ค้าง ${P.nights} คืน`:"ไปกลับวันเดียว"} · คู่ชก: <b>${esc(RG_OPP[dest]||"แชมป์ประจำจังหวัด")}</b> แชมป์ประจำจังหวัด</p>
     <h3>ใครขึ้นชก</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมเดินทางสัปดาห์นี้</p>`}
     <h3>ค่าเดินทาง ไป-กลับ</h3><div class="rg-bill"><div class="kv-row"><span>รถ</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`น้ำมัน ${Math.round(P.litres)} ลิตร × ฿${P.price.toFixed(2)}`,P.fuel)}${line("ทางด่วน",P.toll)}${line(`ตั๋วรถทัวร์ × ${P.onBus}`,P.bus)}${line(`ที่พัก ${P.nights} คืน`,P.lodge)}${line(`ค่ากิน × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>รวม</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">ทั้งค่าย ${P.people} คนไปด้วยกัน สัปดาห์นั้นไม่รับไฟต์อื่น · ความล้าระหว่างทางราว +${P.fat} ต่อคน${P.car==="none"?" · ยังไม่มีรถประจำค่าย ต้องนั่งรถทัวร์ (แพงและล้ากว่า)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ยืนยันการเดินทาง"}</button></div>`;}
};

if(typeof XMODAL!=="undefined")XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`นัดเดินทางสัปดาห์ ${r.wk} แล้ว · จ่ายค่าเดินทาง ${fmt(r.cost)}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("ยกเลิกทริปแล้ว ได้เงินค่าเดินทางคืน");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();}});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);

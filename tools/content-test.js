// Late-game content and recurring-event regression in the bundled browser game.
const {chromium}=require('playwright');
const url=process.argv[2]||'http://127.0.0.1:8766/index.html';
const chrome=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
(async()=>{const browser=await chromium.launch({executablePath:chrome,headless:true});let failed=0;
 for(const lang of ['th','en']){const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(url+'#lang='+lang);
 const out=await p.evaluate(()=>{const R=[],test=(name,fn)=>{try{if(fn()===false)throw Error('assertion failed');R.push([name,true]);}catch(e){R.push([name,false,e.message]);}};
  const fresh=()=>{const g=newGame({seed:12345});g.cash=1e7;g.debt=0;return g;};
  test('NPC roster grows from local to district to province',()=>{const g=fresh();if(!g.F.lA0||g.F.xA0||g.F.pA0)return false;ensureStageNPCs(g,'district');if(!g.F.xA0||g.F.pA0)return false;ensureStageNPCs(g,'province');return !!g.F.pA0&&Object.keys(g.F).filter(k=>/^[lxp]A\d/.test(k)).length===9;});
  test('old late-year save gains staged NPCs without losing history',()=>{const g=fresh();for(const id of Object.keys(g.F))if(/^l[AB]\d/.test(id))delete g.F[id];g.season=5;g.week=42;g.flags.qualDone=true;g.history=[{w:40,cash:333}];g.seen.testStory=1;fixSave(g);return !!g.F.lA0&&!!g.F.xA0&&!!g.F.pA0&&g.seen.testStory===1&&g.history[0].cash===333;});
  test('new late-stage NPC scales toward strongest player',()=>{const g=fresh();g.season=6;g.week=42;g.F.kati.a=Object.fromEntries(Object.keys(g.F.kati.a).map(k=>[k,18]));ensureStageNPCs(g,'province');return ovr(g.F.pA0.a)>=17.3;});
  test('new stadium title letters unlock by year',()=>{const g=fresh();G=g;g.week=15;mailWeekly(g);if(g.mail.some(m=>m.venue==='ping'))return false;g.season=2;g.week=15;g.mail=[];mailWeekly(g);if(!g.mail.some(m=>m.venue==='ping'&&m.bg==='bg_river.webp'))return false;g.season=3;g.week=22;g.mail=[];mailWeekly(g);return g.mail.some(m=>m.venue==='lanna'&&m.bg==='bg_hall.webp');});
  test('stadium belts remain separate from Tha Phae',()=>{const g=fresh();const a=beltHolder(g,'A','tha').id,b=beltHolder(g,'A','ping').id;beltStore(g,'ping').A.id='kati';return g.belt.A.id===a&&g.venueBelts.ping.A.id==='kati'&&b!==undefined;});
  test('winning a new stadium title records the right honor',()=>{const g=fresh();G=g;g.season=3;g.week=30;const old=beltHolder(g,'A','tha').id,op=beltHolder(g,'A','ping').id;g.cal=[];g.cal.push({b:op,res:'W'});questAfter({a:'kati',b:op,quest:{q:'belt',venue:'ping',div:'A',pay:18000}},()=>{});return g.venueBelts.ping.A.id==='kati'&&g.belt.A.id===old&&g.honors.some(h=>h.venue==='ping'&&h.id==='kati')&&hallHTML().includes(STADIUMS.ping.name);});
  test('Death Match returns in later years',()=>{const g=fresh();g.week=12;g.dmSeenSeason=1;g.dmSeen={12:1};if(dmOfferOn(g))return false;g.season=2;if(!dmOfferOn(g))return false;g.week=19;return dmOfferOn(g);});
  test('gang and animal loops accelerate with year',()=>{const run=year=>{const g=fresh();g.season=year;g.week=7;g.gang={st:5,loopNextAbs:0,loopN:0};G=g;mailWeekly(g);return {g,gang:g.mail.find(m=>m.repeat&&m.q==='gang'),animal:g.mail.find(m=>m.repeat&&(m.q==='cow'||m.q==='rooster'))};};const a=run(2),b=run(6);return !!a.gang&&!!a.animal&&!!b.gang&&!!b.animal&&b.g.gang.loopNextAbs-gameWeek(b.g)<a.g.gang.loopNextAbs-gameWeek(a.g)&&b.g.animalLoop.nextAbs-gameWeek(b.g)<a.g.animalLoop.nextAbs-gameWeek(a.g);});
  test('beast offers get more frequent and scale up',()=>{const count=year=>{const g=fresh();g.season=year;let n=0,power=0;for(let w=5;w<=20;w++){g.week=w;g.offers=[];beastOffer(g,()=>0);if(g.offers.length){n++;power=Math.max(power,ovr(g.F[g.offers[0].b].a));}}return {n,power};};const a=count(2),b=count(6);return b.n>a.n&&b.power>=a.power;});
  test('ignored conflicting offers do not create challenge mail debt',()=>{const g=fresh(),op='nA0';g.offers=[{id:'blocked',a:'kati',b:op,week:10,tier:'local',status:'conflict'}];genOffers(g);return !g.snub[op];});
  test('challenge letter resolves when its opponent is booked',()=>{const g=fresh(),op='nA0';g.week=8;g.snub={[op]:3};G=g;let letter=null;for(let seed=1;seed<50&&!letter;seed++){g.seed=seed;g.mail=[];mailWeekly(g);letter=g.mail.find(m=>m.q==='challenge'&&m.npc===op);}if(!letter)return false;g.offers=[{id:'accepted',a:'kati',b:op,week:10,tier:'local'}];return acceptOffer(g,'accepted').ok&&letter.done===true&&g.snub[op]===0;});
  test('challenge mail needs truly unaccepted offers',()=>{const g=fresh(),op='nA0';g.offers=[{id:'a',a:'kati',b:op,week:10,tier:'local'}];genOffers(g);if(g.snub[op]!==1)return false;g.offers=[{id:'b',a:'kati',b:op,week:11,tier:'local'}];acceptOffer(g,'b');if(g.snub[op]!==0)return false;g.snub[op]=4;g.mail=[];g.week=8;G=g;mailWeekly(g);return !g.mail.some(m=>m.q==='challenge'&&m.npc===op);});
  const hx=lv=>{let x=0;for(let n=11;n<lv;n++)x+=heartStep(n);return x;};
  const atHeart=(g,lv)=>{g.F.kati.bond=100;g.F.kati.bondX=hx(lv);};
  test('heart scenes open at their heart level only',()=>{const g=fresh();G=g;g.season=2;g.week=20;const ev=id=>EVENTS.find(e=>e.id===id);atHeart(g,11);if(ev('hs_kati_12').when(g))return false;atHeart(g,12);if(!ev('hs_kati_12').when(g)||ev('hs_kati_15').when(g))return false;atHeart(g,20);return ev('hs_kati_20').when(g);});
  test('heart scene injects resolve for both romance states',()=>{const g=fresh();G=g;g.F.mali.camp='player';for(const id in HEART_SCENES)for(const lv of Object.keys(HEART_SCENES[id]))for(const rom of [null,id])for(const camp of ['player','rival']){g.romance=rom;if(g.F[id]){g.F[id].met=true;g.F[id].camp=id==='kati'?'player':camp;}const walk=L=>{for(const x of L){if(x.inject)walk(x.inject(g));if(x.choice)for(const c of x.choice){c.fx&&c.fx(g);walk(c.then);}if(x.n&&typeof x.t!=='string')throw Error('bad step '+lv);}};walk(HEART_SCENES[id][lv].steps);}return true;});
  test('every character gets heart chats in order',()=>{const g=fresh();G=g;g.week=20;for(const id of ['mali','rin','ploy','fah']){const f=g.F[id];f.met=true;f.bond=100;f.bondX=hx(11);g.chatSeen={};const t=chatTopic(g,id);if(!t||!/_h11$/.test(t.id))throw Error(id+' got '+(t&&t.id));}return true;});
  test('post-max chats come one per level, everyday chats rotate',()=>{const g=fresh();G=g;g.week=20;g.F.kati.met=true;atHeart(g,11);if(chatTopic(g,'kati').id!=='k_h11')return false;g.chatSeen={kati:['k_h11']};const t=chatTopic(g,'kati');return t.id!=='k_h12';});
  test('heart date spots: hidden, then locked, then open with a scene',()=>{const g=fresh();G=g;g.F.kati.bond=60;g.F.kati.bondX=0;if(hangHTML('kati').includes('fairnight'))return false;g.F.kati.bond=100;if(!/data-v="fairnight"[^>]*disabled/.test(hangHTML('kati')))return false;atHeart(g,12);if(/data-v="fairnight"[^>]*disabled/.test(hangHTML('kati')))return false;
    const st=dateScene(g,'kati','fairnight');return st.length>4&&(g.F.kati.spotN.fairnight===1);});
  // v1.89 skill roots
  test('every line splits into two roots of five (school after Lv.22, build after Lv.10)',()=>{for(const id of ['kati','mali','rin','ploy','fah']){const L=skillList(id);
    for(let li=0;li<6;li++){const R=L.filter(s=>s.line===li&&s.br!=null);if(R.length!==10)throw Error(id+' line '+li+' has '+R.length);
      for(const br of [0,1]){const ch=R.filter(s=>s.br===br).sort((a,b)=>a.nd-b.nd);if(ch.map(s=>s.passive?'P':'A').join('')!=='APAPA')throw Error('pattern '+id+li+br);
        const top=L.filter(s=>s.line===li&&s.br==null&&!s.passive).sort((a,b)=>b.row-a.row)[0];if(ch[0].pre!==top.id)throw Error('root start '+ch[0].id);
        for(let i=1;i<5;i++)if(ch[i].pre!==ch[i-1].id)throw Error('chain '+ch[i].id);if(ch[3].feed==null)throw Error('no feed '+ch[3].id);
        if(li<3&&ch[3].feed!==(li+1+br)%3)throw Error('feed target '+ch[3].id);}}
    if(!SK_ROOTS[id]||SK_ROOTS[id].length!==3)throw Error('root names '+id);}return true;});
  test('a root can be learned, equipped, and its passive feed counts without a slot',()=>{const g=fresh();G=g;const f=g.F.kati;f.lvl=40;for(const k in f.a)f.a[k]=20;f.sp=200;
    for(const s of skillList('kati').filter(s=>s.line===0&&s.br==null))f.skills[s.id]=3;f.equip=[];
    for(const k of ['kati_0a1','kati_0a2','kati_0a3','kati_0a4'])if(!learnSkill(g,'kati',k))throw Error('learn '+k+' '+JSON.stringify(skillBlock(f,k)));
    if(!toggleEquip(g,'kati','kati_0a1')&&!equipped(f).includes('kati_0a1'))throw Error('equip');const m=skillMods(f);if(!(m.dmg.elbow>=.03))throw Error('feed not applied');
    if(skillBlock(f,'kati_0a5').some(b=>b.t==='pre'))throw Error('chain block');return true;});
  test('the skill tab draws the tree with descriptions and an equip toggle',()=>{const g=fresh();G=g;const f=g.F.kati;f.lvl=30;f.sp=5;UI.ptab='skill';UI.modal={type:'fighter',id:'kati'};render();
    const n=document.querySelectorAll('.sktree .skn2').length;if(n<15)throw Error('nodes '+n);if(!document.querySelector('.sksplit .rt.b'))throw Error('split');
    if(document.querySelectorAll('.skn2 .skds').length!==n)throw Error('desc');f.skills.ts_fast=1;f.equip=[];UI.skLine={id:'kati',li:0};render();const b=document.querySelector('.skn2 .skeq');if(!b)throw Error('equip btn');b.click();if(!equipped(f).includes('ts_fast'))throw Error('equip');UI.modal=null;render();return true;});
  test('every heart spot plays and has its background',()=>{const g=fresh();G=g;atHeart(g,20);for(const k in ACTIVITIES){const A=ACTIVITIES[k];if(!A.heart)continue;if(!BGIMG[A.bg])throw Error('no bg '+k);g.freeUsed=false;for(const id of ['kati','mali','rin','ploy','fah']){const f=g.F[id];f.met=true;f.bond=100;f.bondX=g.F.kati.bondX;for(let i=0;i<3;i++){g.freeUsed=false;const st=dateScene(g,id,k);if(st.length<4)throw Error('short '+id+k);}}}return true;});
  /* v1.89.11: lovers — several at once, Valentine, the ring, breakup, harem */
  const walkL=(g,L,pick)=>{let n=0;const go=A=>{for(const x of A){if(x.inject){go(x.inject(g)||[]);continue;}if(x.fx&&!x.choice&&!x.n){x.fx(g);continue;}
      if(x.choice){const c=x.choice[pick?pick(x.choice):0];if(c.fx)c.fx(g);go(c.then||[]);continue;}if(x.brawl){go(x.after(g,{sc:g.__brawlSc||0})||[]);continue;}if(x.n&&typeof x.t!=='string')throw Error('text '+x.n);if(x.n&&!x.t)throw Error('empty '+x.n);n++;}};go(L);return n;};
  const ev=id=>EVENTS.find(e=>e.id===id);
  const lovUp=(g,ids)=>{for(const id of ids){const f=g.F[id];f.met=true;f.bond=90;f.trust=60;if(id!=='ploy'&&id!=='fah')f.camp='player';takeLover(g,id);}};
  test('a second lover can be taken; both are lovers and status tags read right',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);if(!isLov(g,'kati')||!isLov(g,'mali')||g.romance!=='kati')return false;
    return /♥/.test(relLabel(g,g.F.mali))&&relTag(g,g.F.mali)===''&&partners(g).length===2&&romOf(g,'mali');});
  test('confession offers "I am with someone" only when you already have someone',()=>{const g=fresh();G=g;return takenOpt(g,'mali').length===0&&(lovUp(g,['kati']),takenOpt(g,'mali').length===1)&&takenOpt(g,'kati').length===0;});
  test('Valentine catches two lovers: bonds drop, ring scene plays, someone may leave',()=>{for(const pickFn of [()=>0,ch=>ch.length-1,null]){const g=fresh();G=g;lovUp(g,['kati','mali','rin']);g.week=38;
      if(!ev('lv_val').when(g)||ev('lv_valh').when(g))throw Error('when');const b0=g.F.rin.bond;const n=walkL(g,ev('lv_val').steps,pickFn||(ch=>Math.max(0,ch.findIndex(c=>/รักทุกคน|love all/i.test(c.t)))));if(n<12)throw Error('short '+n);
      if(g.F.rin.bond!==b0-15)throw Error('drop '+g.F.rin.bond);if(g.valCaught!==1)throw Error('count');}
    const g=fresh();G=g;lovUp(g,['kati','mali']);g.week=38;g.valCaught=1;walkL(g,ev('lv_val').steps,ch=>ch.length-1);return g.F.kati.bond===65&&(isAway(g,'kati')||isAway(g,'mali'));});
  test('the Valentine ring is a live auto bout: three ringside shouts, no result, no injury, then the scene goes on',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);g.week=38;
    const keep={k:JSON.stringify([g.F.kati.fatigue,g.F.kati.injury,g.F.kati.rec,g.F.kati.xp]),m:JSON.stringify([g.F.mali.fatigue,g.F.mali.injury,g.F.mali.rec]),cal:(g.cal||[]).length,cash:g.cash};
    let got=null;playScene(ringSteps(g,'kati','mali',false),()=>{got='done';},{bg:'gym',look:'casual'});let guard=0;while(UI.scene&&guard++<20)sceneNext();
    if(!UI.fight||!UI.fight.brawl)throw Error('no brawl');const U=UI.fight;clearTimeout(U.timer);
    for(let k=0;k<3;k++){U.stage='playing';let n=0;while(U.stage==='playing'&&n++<200){clearTimeout(U.timer);if(!U.pending.length&&!feedRound()){roundFinish(U.F);roundEnd();break;}tick();clearTimeout(U.timer);}
      if(U.stage==='done')break;if(U.stage!=='talk'||!document.querySelector('.btalk'))throw Error('no prompt '+k+' '+U.stage);const best=U.brawl.q.opts.findIndex(o=>o[1]===2);ACT.fbrawl({v:best});clearTimeout(U.timer);}
    if(U.brawl.sc<5)throw Error('score '+U.brawl.sc);clearTimeout(U.timer);brawlEnd();render();if(!document.querySelector('.brawlres'))throw Error('done panel');ACT.fbrawldone();
    guard=0;while(UI.scene&&guard++<40){if(UI.scene.cur&&UI.scene.cur.choice)sceneChoose(0);else sceneNext();}
    if(got!=='done')throw Error('scene did not resume');if(isAway(g,'kati')||isAway(g,'mali'))throw Error('nobody should run after a good stop');
    return JSON.stringify([g.F.kati.fatigue,g.F.kati.injury,g.F.kati.rec,g.F.kati.xp])===keep.k&&JSON.stringify([g.F.mali.fatigue,g.F.mali.injury,g.F.mali.rec])===keep.m&&(g.cal||[]).length===keep.cal&&g.cash===keep.cash;});
  test('five lovers (Ploy and Fah moved in): Valentine, the brawl hand-off, harem — everyone still tagged as lover',()=>{const g=fresh();G=g;g.season=2;for(const id of ['ploy','fah']){g.F[id].camp='player';}
    lovUp(g,['kati','mali','rin','ploy','fah']);for(const id of ['ploy','fah'])g.F[id].camp='player';g.week=38;if(partners(g).length!==5)throw Error('five');
    const L=[];const n=walkL(g,ev('lv_val').steps.map(x=>x),ch=>Math.max(0,ch.findIndex(c=>/รักทุกคน|love all/i.test(c.t))));
    const txt=JSON.stringify(valSteps({...g,valCaught:0,F:g.F,promise:g.promise,lovers:g.lovers}).filter(x=>x.n==='ploy'));if(!/ค่ายเดียวกับคุณ|same camp/i.test(txt))throw Error('ploy camp line '+txt);
    if(!g.haremOK)throw Error('honest');for(const id of partners(g)){g.F[id].bond=95;g.F[id].awayAbs=null;}g.week=42;if(!ev('lv_harem').when(g))throw Error('harem');walkL(g,ev('lv_harem').steps);
    if(!g.harem)throw Error('harem flag');return partners(g).every(id=>/♥ \((ฮาเร็ม|harem)\)/.test(relLabel(g,g.F[id])));});
  test('the ring pair follows the bond, whichever camp they train at',()=>{const pairOf=g=>{const st=valSteps(g);const r=st.find(x=>x.brawl);return r?[r.brawl.a,r.brawl.b].sort().join('+'):'none';};
    let g=fresh();G=g;lovUp(g,['mali','rin']);g.F.rin.bond=99;g.week=38;if(pairOf(g)!=='mali+rin')throw Error('mali rin '+pairOf(g));
    g=fresh();G=g;lovUp(g,['kati']);const f=g.F.fah;f.met=true;f.bond=90;g.promise={fah:10};g.week=38;if(pairOf(g)!=='fah+kati')throw Error('rival fah fights too '+pairOf(g));
    g=fresh();G=g;g.season=2;g.F.fah.camp='player';lovUp(g,['kati','fah']);g.week=38;if(pairOf(g)!=='fah+kati')throw Error('kati fah '+pairOf(g));
    g=fresh();G=g;g.season=2;for(const id of ['ploy','fah'])g.F[id].camp='player';lovUp(g,['kati','mali','rin','ploy','fah']);for(const id of ['ploy','fah'])g.F[id].camp='player';
    g.F.ploy.bond=100;g.F.ploy.bondX=50;g.F.fah.bond=100;g.F.fah.bondX=40;return pairOf(g)==='fah+ploy';});
  test('no ring when one of the two already left camp: the most hurt one still leaves',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);g.F.mali.bond=99;g.week=38;sendAway(g,'kati',1,'cheat');if(valSteps(g).some(x=>x.brawl))throw Error('ring');g.valCaught=0;walkL(g,ev('lv_val').steps);return isAway(g,'mali');});
  test('every pair has its own ring lines and spat',()=>{const ids=['kati','mali','rin','ploy','fah'];for(let i=0;i<5;i++)for(let j=i+1;j<5;j++){const P=pairOf(ids[i],ids[j]);if(!P||!P.ring[ids[i]]||!P.ring[ids[j]]||P.spat.length<3)throw Error('pair '+ids[i]+ids[j]);}
    const g=fresh();G=g;lovUp(g,['mali','fah']);g.F.fah.camp='player';const st=ringSteps(g,'mali','fah',false);return st.some(x=>x.t===PAIR.mali_fah.ring.mali)&&st.some(x=>x.t===PAIR.mali_fah.ring.fah);});
  test('courting someone else is slower while you see someone',()=>{const g=fresh();G=g;g.F.rin.met=true;g.F.rin.bond=20;add(g,'rin','bond',8);const solo=g.F.rin.bond-20;
    const h=fresh();G=h;lovUp(h,['kati']);h.F.rin.met=true;h.F.rin.bond=20;add(h,'rin','bond',8);const taken=h.F.rin.bond-20;
    const k=fresh();G=k;lovUp(k,['kati','mali']);k.F.rin.met=true;k.F.rin.bond=20;add(k,'rin','bond',8);const two=k.F.rin.bond-20;
    const base=fresh();G=base;base.F.kati.bond=50;add(base,'kati','bond',8);const own=fresh();G=own;lovUp(own,['kati']);own.F.kati.bond=50;add(own,'kati','bond',8);return taken<solo&&two<taken&&Math.abs(taken-solo*.85)<.6&&Math.abs(two-solo*.7)<.6&&own.F.kati.bond===base.F.kati.bond;});
  test('lover bonus only while there is one; a second yes is warned and the top heart scene closes',()=>{const g=fresh();G=g;g.F.kati.met=true;g.F.kati.bond=90;g.F.kati.trust=60;const m0=g.F.kati.morale;takeLover(g,'kati');if(g.F.kati.morale!==Math.min(100,m0+15))throw Error('solo morale');if(!lovSolo(g))throw Error('solo');
    g.F.mali.met=true;g.F.mali.camp='player';g.F.mali.bond=80;g.F.mali.trust=60;if(!cheatWarn(g,'mali').length||!/คบซ้อน|two-timing/.test(yesTxt(g,'mali','x')))throw Error('warn');if(cheatWarn(g,'kati').length)throw Error('no self warn');
    const mm=g.F.mali.morale;takeLover(g,'mali');if(g.F.mali.morale!==mm)throw Error('no morale for a second');if(lovSolo(g))throw Error('not solo');
    g.F.kati.bond=100;g.F.kati.bondX=2000;g.lastBeat=-99;if(EVENTS.find(e=>e.id==='hs_kati_30').when(g))throw Error('scene');const top=CHAT.kati.filter(t=>/_h(27|30)$/.test(t.id));if(top.length!==2||top.some(t=>t.need(g)))throw Error('top chats');doBreak(g,'mali');return top.every(t=>t.need(g));});
  test('one ladder: tier popup names match the heart-level names',()=>REL_TIERS.every(([b,n])=>n===heartTier(Math.min(10,1+Math.floor(b/10)))));
  test('two-timing brings clashes and spats (very close pairs do not spat) and they repeat',()=>{const g=fresh();G=g;lovUp(g,['kati','mali','rin']);let clash=0,spat=0;
    for(let w=1;w<=40;w++){g.week=w;if(ev('lv_clash').when(g)){walkL(g,ev('lv_clash').steps);clash++;}else if(ev('lv_spat').when(g)){walkL(g,ev('lv_spat').steps,ch=>2);spat++;}for(const k of ['kati','mali','rin'])g.F[k].bond=90;}
    if(clash<3||spat<2)throw Error('counts '+clash+' '+spat);for(const k of ['kati','mali','rin']){g.F[k].bond=100;g.F[k].bondX=30;}g.spatAbs=-99;g.lvEvAbs=-1;
    for(let w=1;w<=40;w++){g.week=w;if(ev('lv_spat').when(g))throw Error('close pair spat');}return true;});
  test('a spat: side with one (+3 / −5) or stop both (−2 each)',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);g.F.kati.bond=80;g.F.mali.bond=80;const st=spatSteps(g);const ch=st.find(x=>x.choice).choice;ch[0].fx(g);return g.F.kati.bond>80&&g.F.mali.bond===75&&st.filter(x=>x.n&&x.n!=='nar').length===3;});
  test('one label: closeness name until together, then the status, shown under the hearts',()=>{const g=fresh();G=g;const f=g.F.rin;f.met=true;f.bond=80;if(relLabel(g,f)!==heartTier(9))throw Error('closeness');lovUp(g,['rin']);if(!/♥/.test(relLabel(g,f)))throw Error('lover');
    UI.tab='people';render();const card=[...document.querySelectorAll('.pcard')].find(c=>c.querySelector('[data-id="rin"]'));if(!card)throw Error('card');const sm=card.querySelector('.hearts small');return !!sm&&sm.classList.contains('hstat')&&/♥/.test(sm.textContent)&&!/♥/.test(card.querySelector('.pnm .meta').textContent);});
  test('ladder: declined but close = close friend; away labels; profile ladder lights the same label',()=>{const g=fresh();G=g;lovUp(g,['kati']);const f=g.F.mali;f.met=true;f.camp='player';f.bond=80;f.trust=50;
    const st=takenOpt(g,'mali');st[0].fx(g);if(!/เพื่อนสนิท|Close friend/.test(relLabel(g,f)))throw Error('friend '+relLabel(g,f));
    g.week=38;sendAway(g,'kati',2,'cheat');if(!/งอน|Sulking/.test(relLabel(g,g.F.kati)))throw Error('sulk');
    UI.modal={type:'fighter',id:'mali'};UI.ptab='rel';render();const on=document.querySelector('.rlad .rbranch span.on');const lab=document.querySelector('.rlad > b');UI.modal=null;render();
    if(!on||!lab)throw Error('ladder dom');return on.textContent===relBase(g,f)&&lab.textContent===relLabel(g,f);});
  test('Lv.30 tops out at 1,000 points',()=>heartAt(30)===1000&&heartAt(20)===365&&heartLv({bond:100,bondX:900}).lv===30&&heartLv({bond:100,bondX:5000}).total===1000&&heartLv({bond:100,bondX:899}).lv===29);
  test('hearts stop at the chapter cap (province Lv.20, regional Lv.25) and never drop',()=>{const g=fresh();G=g;const f=g.F.kati;f.bond=100;f.bondX=heartAt(20)-100;add(g,'kati','bond',8);if(f.bondX!==heartAt(20)-100)throw Error('over cap '+f.bondX);
    if(!heartCapped(g,f))throw Error('capped');f.bondX=heartAt(24)-100;add(g,'kati','bond',8);if(f.bondX!==heartAt(24)-100)throw Error('old save dropped');
    g.region={};f.bondX=heartAt(20)-100;add(g,'kati','bond',8);if(!(f.bondX>heartAt(20)-100))throw Error('regional opens');f.bondX=heartAt(25)-110;for(let i=0;i<20;i++)add(g,'kati','bond',8);return f.bond+f.bondX===heartAt(25);});
  test('while she is away the hearts show the short word; the profile ladder shows it in full',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);g.week=20;walkL(g,breakSteps(g,'mali'));UI.tab='people';render();
    const card=[...document.querySelectorAll('.pcard')].find(c=>c.querySelector('[data-id="mali"]'));const sm=card.querySelector('.hearts small').textContent;
    UI.modal={type:'fighter',id:'mali'};UI.ptab='rel';render();const head=document.querySelector('.rlad > b').textContent;const cap=document.querySelector('.rlad .rcap');UI.modal=null;render();
    return /^(อกหัก|Heartbroken)$/.test(sm.trim())&&head.length>sm.length&&!!cap;});
  test('only one partner: no Valentine scene',()=>{const g=fresh();G=g;lovUp(g,['kati']);g.week=38;return !ev('lv_val').when(g);});
  test('a girl who left camp skips training, gets no offers, cannot be booked, and comes back',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);sendAway(g,'kati',2,'cheat');
    const lv=g.F.kati.a.power;weekTrain(g);if(g.F.kati.a.power!==lv)throw Error('trained');genOffers(g);if(g.offers.some(o=>o.a==='kati'))throw Error('offer');
    g.offers=[{id:'x',a:'kati',b:'nA0',week:g.week+1,tier:'exhibition',win:1,lose:1}];if(acceptOffer(g,'x').ok)throw Error('booked');
    if(ev('lv_back').when(g))throw Error('early');g.week+=2;if(!ev('lv_back').when(g))throw Error('no return');walkL(g,ev('lv_back').steps);return !isAway(g,'kati')&&g.F.kati.awayBack&&!g.seen.lv_back;});
  test('breaking up: no longer a lover, ex, big bond drop, away 4 weeks, she may come back later',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);const n=walkL(g,breakSteps(g,'mali'));if(n<4)throw Error('short');
    if(isLov(g,'mali')||!isEx(g,'mali')||g.F.mali.bond!==55||awayLeft(g,'mali')!==4)return false;if(!/อกหัก|Heartbroken/.test(relLabel(g,g.F.mali))||relLabel(g,g.F.mali).indexOf('4')<0)throw Error('tag '+relLabel(g,g.F.mali));
    g.week+=4;walkL(g,ev('lv_back').steps);if(isAway(g,'mali'))throw Error('still away');g.F.mali.bond=90;g.week+=12;g.seen.love_mali=true;g.loveNo={};g.confTry={mali:2};
    const D=dateScene(g,'mali','cafe');let back=false;walkL(g,D,ch=>{const i=ch.findIndex(c=>/กลับมาคบ|back together/.test(c.t));if(i>=0)back=true;return i>=0?i:0;});return back&&isLov(g,'mali');});
  test('breaking a promise with a rival works the same way',()=>{const g=fresh();G=g;const f=g.F.ploy;f.met=true;f.bond=90;g.promise={ploy:10};walkL(g,breakSteps(g,'ploy'));return !isProm(g,'ploy')&&isEx(g,'ploy')&&isAway(g,'ploy');});
  test('harem: honest at Valentine, win everyone back, then group scenes replace the top heart scene',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);g.week=38;walkL(g,ev('lv_val').steps,ch=>Math.max(0,ch.findIndex(c=>/รักทุกคน|love all/i.test(c.t))));
    if(!g.haremOK)throw Error('ok flag');g.F.kati.awayAbs=null;g.F.mali.awayAbs=null;if(ev('lv_harem').when(g))throw Error('too early');g.week+=3;if(ev('lv_harem').when(g))throw Error('not won back yet');g.F.kati.bond=86;g.F.mali.bond=86;if(!ev('lv_harem').when(g))throw Error('no harem');
    walkL(g,ev('lv_harem').steps);if(!g.harem||romOf(g,'kati'))throw Error('harem state');if(!/♥ \((ฮาเร็ม|harem)\)/.test(relLabel(g,g.F.kati)))throw Error('tag');
    g.F.kati.bond=100;g.F.kati.bondX=2000;g.lastBeat=-99;const top=EVENTS.find(e=>e.id==='hs_kati_30');if(top.when(g))throw Error('top scene still on');
    g.week+=9;for(const k of [1,2,3]){if(!ev('lv_hm'+k).when(g))throw Error('hm'+k);walkL(g,ev('lv_hm'+k).steps);}
    g.season=2;g.week=38;if(ev('lv_val').when(g)||!ev('lv_valh').when(g))throw Error('harem valentine');walkL(g,ev('lv_valh').steps);return haremYearEnd(g).length===3;});
  test('Baiyok: own sprites + camp-suffixed names, leaves Golden Tiger in white, then visits on a loop',()=>{const g=fresh();G=g;g.season=2;g.week=12;
    joinCamp(g,'fah',1800);joinCamp(g,'mali',1200);g.flags.fahJoinedAbs=absWeek(g)-1;const b=makeProdigy(g,'B','fah'),a=makeProdigy(g,'A','ploy');
    if(b.sprite!=='baiyok'||a.sprite!=='petchara'||!/พยัคฆ์ทอง|Golden Tiger/.test(b.full)||!/พยัคฆ์ทอง|Golden Tiger/.test(a.full))throw Error('names/sprites');
    if(npcImg({who:b.name})!=='baiyok_black'||npcImg({who:a.name})!=='petchara')throw Error('portrait before');
    const ev=id=>EVENTS.find(e=>e.id===id);if(ev('by_leave').when(g))throw Error('left too early');
    const bk=(x)=>({a:x,b:'prod_B'});for(const x of ['mali','mali']){const s=prodigyFightScene(g,bk(x));if(!s||!s.length)throw Error('mali pre');prodigyResultScene(g,bk(x),'A');}
    g.week+=2;if(!ev('by_leave').when(g))throw Error('no leave');walkL(g,ev('by_leave').steps);
    if(!byFree(g)||b.sprite!=='baiyok_white'||b.full!==b.name||!b.indie||npcImg({who:b.name})!=='baiyok')throw Error('free state');
    const pre=prodigyFightScene(g,bk('fah'));if(!pre||!/ชุดขาว|white/.test(JSON.stringify(pre)))throw Error('white intro');
    const seen=[];for(let i=0;i<9;i++){g.week+=12;if(g.week>46){g.week-=40;g.season++;}const e=ev('by_visit');if(!e.when(g))throw Error('visit '+i);const st=e.steps[0].inject(g);seen.push(JSON.stringify(st).slice(0,40));walkL(g,st);delete g.seen.by_visit;}
    if(new Set(seen).size<7)throw Error('visits repeat too soon');
    g.week=14;g.offers=[];genOffers(g);if(!g.offers.some(o=>o.a==='fah'&&o.b==='prod_B'&&o.by))throw Error('rematch letter');
    const k=prodigyFightScene(g,{a:'kati',b:'prod_A'}),kr=prodigyResultScene(g,{a:'kati',b:'prod_A'},'B');return !!k&&!!kr&&fixSave(g)!==false&&b.sprite==='baiyok_white';});
  test('old saves: past prodigy bouts count, so Mali does not get first-meeting lines again',()=>{const g=fresh();G=g;g.season=3;joinCamp(g,'mali',1200);joinCamp(g,'fah',1800);makeProdigy(g,'B','fah');
    g.cal=[{a:'mali',b:'prod_B',absWeek:60,res:'W'},{a:'mali',b:'prod_B',absWeek:70,res:'L'},{a:'mali',b:'pX',absWeek:71}];delete g.flags.prodN;fixSave(g);
    const s=JSON.stringify(prodigyFightScene(g,{a:'mali',b:'prod_B'}));return prodN(g,'mali')===2&&!/ครั้งแรก|first time/.test(s);});
  test('trip souvenirs: only owned ones show, free to give, worth more than a normal gift, own line',()=>{const g=fresh();G=g;const f=g.F.kati;f.met=true;f.bond=60;
    if(giftsFor('kati').some(k=>GIFTS[k].souv))throw Error('souvenir in shop list');if(giveGift(g,'kati','c_khon'))throw Error('gave without owning');
    if(/souvh/.test(giftHTML('kati')))throw Error('section shown with none');g.souv={c_khon:2,s_talung:1};const h=giftHTML('kati');if(!/souvh/.test(h)||!/c_khon/.test(h)||/n_jok/.test(h))throw Error('section');
    const cash=g.cash,r=giveGift(g,'kati','c_khon');if(!r||r.t!=='love'||g.souv.c_khon!==1||g.cash!==cash)throw Error('give '+JSON.stringify(r));
    const g2=fresh();g2.F.kati.met=true;g2.F.kati.bond=60;g2.cash=99999;const n=giveGift(g2,'kati','stickers');if(!(r.gain>=n.gain*2))throw Error('gain '+r.gain+' vs '+n.gain);
    g.week++;const r2=giveGift(g,'kati','s_talung');if(!r2||r2.t!=='like'||g.souv.s_talung!==0)throw Error('like');
    return /ปู่|Grandpa/.test(souvLine('kati','c_khon','love'))&&/ภาคใต้|the South/.test(souvLine('kati','s_talung','like'));});
  test('Petchara: captain loop visits + yearly letter to Kati; rivals catch up mid/late year but stay a step below a maxed camp',()=>{const g=fresh();G=g;g.season=3;g.week=10;
    joinCamp(g,'ploy',2000);g.flags.ployW=absWeek(g)-20;const a=makeProdigy(g,'A','ploy');const ev=EVENTS.find(e=>e.id==='pc_visit');const seen=[];
    for(let i=0;i<7;i++){g.week+=12;if(g.week>46){g.week-=40;g.season++;}if(!ev.when(g))throw Error('pc visit '+i);const st=ev.steps[0].inject(g);seen.push(JSON.stringify(st).slice(0,50));walkL(g,st);delete g.seen.pc_visit;if(i===1)prodigyResultScene(g,{a:'kati',b:'prod_A'},'A');}
    if(new Set(seen).size<5)throw Error('pc visits repeat');g.week=12;g.offers=[];genOffers(g);if(!g.offers.some(o=>o.a==='kati'&&o.b==='prod_A'&&o.pc))throw Error('pc letter');
    const me=g.F.ploy;for(const k in me.a)me.a[k]=20;const b0=effOvr(g,a);g.week=24;g.flags.rcWk=null;weekTrain(g);const b1=effOvr(g,a);
    const best=Math.max(...roster(g).filter(f=>f.div==='A').map(f=>effOvr(g,f)));if(!(b1>b0))throw Error('no mid-year lift '+b0+' '+b1);
    for(const w of [40]){g.week=w;weekTrain(g);}return effOvr(g,a)<best;});
  test('hearts there but trust short: the date ends with a trust hint, gone once trust is 40',()=>{const act=Object.keys(ACTIVITIES)[0];const g=fresh();G=g;g.F.mali.met=true;g.F.mali.camp='player';g.F.mali.bond=89.5;g.F.mali.trust=31;
    const txt=()=>JSON.stringify(dateScene(g,'mali',act).flatMap(x=>x.inject?x.inject(g):[x]));if(!/31\/40/.test(txt()))throw Error('no hint');g.F.mali.trust=45;delete g.seen.love_mali;if(/\/40/.test(txt()))throw Error('hint at 45');
    const h=fresh();G=h;h.F.ploy.met=true;h.F.ploy.camp='player';h.F.ploy.bond=89.5;h.F.ploy.trust=20;G=h;if(/\/40/.test(JSON.stringify(dateScene(h,'ploy',act).flatMap(x=>x.inject?x.inject(h):[x]))))throw Error('ploy year 1 hint');return true;});
  test('confessions: first ready date she almost says it, then 40% a date, certain by the 3rd after, and others wait 4 weeks after one',()=>{const act=Object.keys(ACTIVITIES)[0];const said=(g,id)=>/คบซ้อน|two-timing|รู้สึกแบบเดียวกัน|feel the same/i.test(JSON.stringify(dateScene(g,id,act).flatMap(x=>x.inject?x.inject(g):[x])));
    const mk=()=>{const g=fresh();G=g;for(const id of ['kati','mali','rin']){g.F[id].met=true;g.F[id].camp='player';g.F[id].bond=89.5;g.F[id].trust=60;}g.week=10;return g;};
    let first=0,miss=0;for(let i=0;i<60;i++){const g=mk();g.confTry={kati:1};if(said(g,'kati'))first++;}if(first<10||first>45)throw Error('first-date rate '+first+'/60');
    for(let i=0;i<20;i++){const g=mk();let n=0;while(n<4&&!g.seen.love_kati){said(g,'kati');n++;}if(!g.seen.love_kati)miss++;}if(miss)throw Error('not certain by 3rd');
    {const g=mk();const s=JSON.stringify(dateScene(g,'kati',act).flatMap(x=>x.inject?x.inject(g):[x]));if(!/เปลี่ยนเรื่อง|changes the subject/.test(s)||g.seen.love_kati)throw Error('almost first');}
    const g=mk();g.confTry={kati:3};said(g,'kati');if(!g.seen.love_kati)throw Error('kati');for(let w=0;w<3;w++){g.week++;g.confTry={mali:5};if(said(g,'mali'))throw Error('mali too soon week +'+(w+1));}
    g.week++;g.confTry={mali:3};if(!said(g,'mali'))throw Error('mali after 4 weeks');return true;});
  test('Tum and Tuy: Tuy once a real day 20-23 Nov, Tum 4 weeks after the first brawl (old saves from now) and weeks 24-27, both when they overlap',()=>{const T0=todayStr;let day='2026-11-18';todayStr=()=>day;try{
    const mk=()=>{const g=fresh();G=g;g.ev={loy:{got:46,season:1,best:0,tiers:{},runs:0}};g.week=46;g.mail=[];return g;};
    let g=mk();if(tuyOn(g)||thiefOn(g))throw Error('18 Nov: nobody');day='2026-11-20';if(!tuyReady(g)||thiefOn(g))throw Error('20 Nov: Tuy only');
    tuyMail(g);if(!g.mail.some(m=>m.ev==='tuy'))throw Error('tuy mail');g.ev.loy.tuyDay=todayStr();if(tuyReady(g))throw Error('Tuy twice a day');day='2026-11-23';if(!tuyReady(g))throw Error('next day');
    evStartLoy();UI.modal=null;if(!thiefReady(g)||!tuyReady(g))throw Error('overlap: both');if(!g.mail.some(m=>m.ev==='thief'))throw Error('tum mail');
    day='2026-11-24';if(tuyOn(g))throw Error('24 Nov off');g.ev.loy.thiefWk=absWeek(g);if(thiefReady(g))throw Error('Tum twice a week');for(let k=1;k<4;k++){g.week++;if(!thiefReady(g))throw Error('week +'+k);g.ev.loy.thiefWk=absWeek(g);}g.week++;if(thiefOn(g))throw Error('5th week');
    g=mk();g.ev.loy.runs=2;fixSave(g);if(g.ev.loy.thiefFrom!==absWeek(g)||!thiefReady(g))throw Error('old save migration');
    g=mk();g.ev.loy.runs=2;g.ev.loy.thiefWk=10;fixSave(g);if(thiefOn(g))throw Error('already met: no new window');g.week=25;if(!thiefReady(g))throw Error('week 25');g.week=28;if(thiefOn(g))throw Error('week 28 off');
    const f=g.F.kati;const t1=evThief(g,f,false),A=ovr(g.F[t1].a),L1=g.F[t1].lvl;const t2=evThief(g,f,true),B=ovr(g.F[t2].a);if(!(B>A)||g.F[t2].lvl!==L1+1||g.F[t2].sprite!=='thief2')throw Error('Tuy stronger '+A+' '+B);
    {const PS=playScene,OF=openFight2,SV=save;try{playScene=(s,cb)=>cb&&cb();save=()=>{};const run=(tuy,win,ko,yr)=>{const h=mk();h.season=yr;h.F.kati.camp='player';UI.thiefK=tuy?'tuy':'tum';openFight2=(bk,cb)=>{LASTF={result:{win:win?'A':'B',type:ko?'KO':'คะแนน'}};cb();};const c0=h.cash;thiefGo('kati');return h.cash-c0;};
      const r=[run(true,true,false,1),run(true,true,true,3),run(true,false,false,3),run(false,true,false,3),run(false,false,false,3)].join(',');if(r!=='3000,7500,0,200,0')throw Error('cash '+r);}finally{playScene=PS;openFight2=OF;save=SV;}}
    }finally{todayStr=T0;}return true;});
  test('harem scenes: everyone twice + pair talk + a choice, the yearly loop fires in its weeks, a member with no lines is skipped (no undefined)',()=>{
    const run=st=>{const L=[];playScene(st,()=>{},{bg:'camp',look:'casual'});let n=0;while(UI.scene&&n++<400){const c=UI.scene.cur;if(!c){sceneNext();continue;}if(c.choice){sceneChoose(0);continue;}L.push(String(c.t));sceneNext();}return L;};
    for(const ids of [['kati','mali'],['kati','mali','rin','ploy','fah'],['kati','mali','rin','ploy','fah','nA0']]){const g=fresh();G=g;g.season=2;g.week=30;for(const id of ids){g.F[id].met=true;if(g.F[id].camp!=='rival')g.F[id].camp='player';}
      g.lovers=[...ids];g.romance=ids[0];g.harem=true;g.haremAbs=absWeek(g)-20;const all=[...[0,1,2].map(i=>HAREM_SCENES[i]),...HAREM_YEAR.flatMap(Y=>Y.v)];
      for(const S of all){const L=run(hmSteps(g,S));if(L.some(l=>/undefined|^null$/.test(l)))throw Error('undefined line, '+ids.length+' members');if(L.length<(ids.length>=5?18:9))throw Error('short scene '+L.length);}}
    const g=fresh();G=g;g.season=3;for(const id of ['kati','mali']){g.F[id].met=true;g.F[id].camp='player';}g.lovers=['kati','mali'];g.harem=true;g.haremAbs=absWeek(g)-60;const hit=[];
    for(let w=1;w<=52;w++){g.week=w;for(const e of pendingEvents().filter(e=>/^lv_hy_/.test(e.id))){hit.push(e.id+'@'+w);g.seenY=g.seenY||{};g.seenY[e.id]=g.season;}}
    if(hit.join()!=='lv_hy_sports@25,lv_hy_loy@27,lv_hy_newyear@33,lv_hy_songkran@48')throw Error(hit.join());return true;});
  test('a no late in the year does not block her second ask next year (old week-of-year saves too)',()=>{const act=Object.keys(ACTIVITIES)[0];const asks=g=>{const s=JSON.stringify(dateScene(g,'mali',act).flatMap(x=>x.inject?x.inject(g):[x]));return /คบซ้อน|two-timing/i.test(s);};
    for(const old of [false,true]){const g=fresh();G=g;for(const id of ['kati','mali']){g.F[id].met=true;g.F[id].camp='player';}g.F.kati.bond=90;g.F.kati.trust=60;takeLover(g,'kati');g.F.mali.bond=89.5;g.F.mali.trust=50;g.seen.love_mali=true;g.week=50;
      if(old){g.loveNo={mali:50};}else noteNo(g,'mali');newSeason(g);g.week=5;g.confTry={mali:2};if(!asks(g))throw Error((old?'old save':'new')+' blocked');}return true;});
  /* v1.90.17: route rewards */
  const txtOf=(g,L)=>{const out=[];const go=A=>{for(const x of A||[]){if(x.inject){go(x.inject(g)||[]);continue;}if(x.fx&&!x.choice&&!x.n){x.fx(g);continue;}
      if(x.choice){for(const c of x.choice)out.push(String(c.t));const c=x.choice[0];if(c.fx)c.fx(g);go(c.then||[]);continue;}if(x.n){out.push(String(x.t));if(x.who)out.push(String(x.who));}}};go(L);return out;};
  const isEN=(window.LANG||'th')==='en',badTxt=L=>L.some(l=>/undefined|^null$|^$/.test(l)||(isEN&&/[฀-๿]/.test(l)));
  const solo=(g,id,ago)=>{const f=g.F[id];f.met=true;f.bond=90;f.trust=60;f.camp='player';takeLover(g,id);g.mono.abs=absWeek(g)-ago;};
  test('one love: private festival loop + her own Valentine in their weeks, with a line about last year from the second time',()=>{
    for(const id of LOVE_IDS){const g=fresh();G=g;g.season=2;solo(g,id,10);const hit=[];
      for(let w=1;w<=52;w++){g.week=w;for(const e of pendingEvents().filter(e=>/^lv_(mf_|valm)/.test(e.id))){hit.push(e.id+'@'+w);const L=txtOf(g,e.steps);if(badTxt(L)||L.length<(e.id==='lv_valm'?4:9))throw Error(id+' '+e.id+' '+L.length);g.seenY=g.seenY||{};g.seenY[e.id]=g.season;}}
      if(hit.join()!=='lv_mf_sports@25,lv_mf_loy@27,lv_mf_newyear@33,lv_valm@38,lv_mf_songkran@48')throw Error(id+' '+hit.join());
      const again=txtOf(g,monoFestSteps(g,'loy'));if(again[1]!==MONO_AGAIN[id].loy)throw Error('again line '+id);}
    const g=fresh();G=g;g.season=2;solo(g,'kati',10);lovUp(g,['mali']);g.week=27;if(monoOf(g)||pendingEvents().some(e=>/^lv_(mf_|valm|ma)/.test(e.id)))throw Error('two-timer got one-love scenes');return true;});
  test('one love: anniversaries in real time from the day you got together (3 m, 6 m, every year), story scenes in order then a yearly scene; a late save gets the latest only if recent',()=>{
    const adv=g=>{g.week++;if(g.week>52){g.week=1;g.season++;}};
    const runFrom=(id,ago,weeks)=>{const g=fresh();G=g;g.season=3;g.week=10;const f=g.F[id];f.met=true;f.camp='player';g.lovers=[id];g.romance=id;g.lovWk={[id]:absWeek(g)-ago};delete g.monoInit;delete g.mono;monoFix(g);const got=[];
      for(let i=0;i<=weeks;i++){const e=ev('lv_ma');if(e.when(g)){const r=annRel(g,id),m=annDue(g),L=txtOf(g,e.steps);if(badTxt(L)||L.length<6||L[0]!==ANNIV_LBL[m])throw Error(id+' r'+r+' '+L.length);got.push(m+'@'+r);}adv(g);}return {g,got};};
    for(const id of LOVE_IDS){const {g,got}=runFrom(id,0,330);const lab=got.map(x=>x.split('@')[0]).join();if(lab!=='13,26,52,104,156,208,260,312')throw Error(id+' '+got.join());
      if(got.some(x=>{const [m,r]=x.split('@');return +r-(+m)>=3;}))throw Error('late '+got.join());
      const T=loveTitle(g,g.F[id]);if(!T||T.k!=='mono'||lovePerk(g.F[id]).prep!==.025||lovePerk(g.F[id]).brk!==4)throw Error('title/perk '+id);if(g.flags.mono1y[id]==null)throw Error('card flag');}
    {const {got}=runFrom('kati',6*52+30,60);if(got.join().replace(/@\d+/g,'')!=='364')throw Error('year 7 load: '+got.join());}
    {const {g,got}=runFrom('mali',2*52+4,60);if(got.join().replace(/@\d+/g,'')!=='104,156')throw Error('recent catch-up: '+got.join());if(g.flags.mono1y.mali==null)throw Error('title on the first one');}
    {const {got}=runFrom('rin',30,30);if(got.join().replace(/@\d+/g,'')!=='26,52')throw Error('under a year: '+got.join());}
    const g=fresh();G=g;g.season=2;g.week=20;solo(g,'rin',20);g.lovWk.rin=absWeek(g)-14;if(annDue(g)!==13)throw Error('due');lovUp(g,['kati']);if(g.mono||annDue(g)!=null||loveTitle(g,g.F.rin))throw Error('two-timing kept the clock');
    doBreak(g,'kati');g.F.kati.awayAbs=null;if(!monoOf(g)||monoWk(g)!==0)throw Error('clock did not restart');return true;});
  test('harem: first-anniversary photo + all five together, team title and a perk that grows with the team',()=>{const g=fresh();G=g;g.season=3;g.week=10;
    for(const id of LOVE_IDS){g.F[id].met=true;g.F[id].camp='player';}g.lovers=[...LOVE_IDS];g.romance='kati';g.harem=true;g.haremAbs=absWeek(g)-40;
    if(ev('lv_hann').when(g))throw Error('too early');g.haremAbs=absWeek(g)-60;if(!ev('lv_hann').when(g))throw Error('no anniversary');let L=txtOf(g,ev('lv_hann').steps);if(badTxt(L)||L.length<14)throw Error('hann '+L.length);
    if(g.flags.harem1y==null||loveTitle(g,g.F.mali).k!=='harem')throw Error('team title');const p5=lovePerk(g.F.mali).prep;if(Math.abs(p5-.02)>1e-9||lovePerk(g.F.mali).brk!==5)throw Error('perk '+p5);
    if(!ev('lv_hfull').when(g))throw Error('no full five');L=txtOf(g,ev('lv_hfull').steps);if(badTxt(L)||L.length<14)throw Error('hfull '+L.length);
    g.lovers=['kati','mali'];if(Math.abs(lovePerk(g.F.kati).prep-.0125)>1e-9)throw Error('perk with two');
    if(monoOf(g)||loveTitle(g,g.F.rin))throw Error('mono on harem');return true;});
  test('harem: the 3 group scenes loop — one at random every 13 weeks after the third, not the same twice in a row, pairs rotate',()=>{const g=fresh();G=g;g.season=3;g.week=5;
    for(const id of LOVE_IDS){g.F[id].met=true;g.F[id].camp='player';}g.lovers=[...LOVE_IDS];g.romance='kati';g.harem=true;g.haremAbs=absWeek(g)-4;const e=ev('lv_hmr');if(e.when(g))throw Error('before hm3');
    g.seen.lv_hm1=g.seen.lv_hm2=g.seen.lv_hm3=true;g.haremAbs=absWeek(g)-30;const got=[],first=[];for(let i=0;i<60;i++){g.week++;if(g.week>52){g.week=1;g.season++;}if(e.when(g)){const L=txtOf(g,e.steps);if(badTxt(L)||L.length<18)throw Error('short '+L.length);got.push(g.hmLoopLast+'@'+absWeek(g));first.push(L[11]);}}
    const at=got.map(x=>+x.split('@')[1]),ix=got.map(x=>+x.split('@')[0]);if(got.length<4||at.some((w,i)=>i&&w-at[i-1]!==13))throw Error('timing '+got.join());if(ix.some((x,i)=>i&&x===ix[i-1]))throw Error('repeat '+got.join());
    return true;});
  test('route endings from year 5 (once), her line every year; Ploy & Fah now have lover dates, a pre-final scene, a year-end line and chats',()=>{
    const end=g=>txtOf(g,endingScene(g).steps).join('\n');
    let g=fresh();G=g;g.season=5;solo(g,'ploy',80);g.flags.mono1y={ploy:absWeek(g)-20};let t=end(g);if(/แต่งงาน|marry/i.test(t))throw Error('proposal');if(!/พลอย · คู่ใจ|Ploy · Soulmate/.test(t))throw Error('no mono ending');if(g.flags.loveEnd!=='mono_ploy')throw Error('flag');
    t=end(g);if(/· คู่ใจ —|· Soulmate —/.test(t)||!t.includes(LOVER_END.ploy[0].t))throw Error('ending twice / no year-end line');
    g=fresh();G=g;g.season=4;solo(g,'fah',80);g.flags.mono1y={fah:1};if(/· คู่ใจ —|· Soulmate —/.test(end(g)))throw Error('ending before year 5');
    g=fresh();G=g;g.season=6;for(const id of ['kati','mali','rin']){g.F[id].met=true;g.F[id].camp='player';}g.lovers=['kati','mali','rin'];g.harem=true;g.haremAbs=absWeek(g)-80;g.flags.harem1y=1;t=end(g);if(!/ทีมผู้จัดการ · ครอบครัว|Team Manager · The Sirichai/.test(t)||/แต่งงาน|marry/i.test(t))throw Error('no harem ending');
    g=fresh();G=g;g.season=6;lovUp(g,['kati','mali']);g.flags.mono1y={kati:1};if(/· คู่ใจ —|· Soulmate —|ครอบครัวศิริชัย|Sirichai Family/.test(end(g)))throw Error('two-timer got an ending');
    for(const id of ['ploy','fah']){if((LOVER_DATES[id]||[]).length!==3||!LOVER_FINAL[id]||!LOVER_END[id])throw Error('content '+id);const gg=fresh();G=gg;gg.season=2;solo(gg,id,0);gg.lovWk[id]=absWeek(gg)-1;
      const s=JSON.stringify(txtOf(gg,dateScene(gg,id,Object.keys(ACTIVITIES)[0])));if(!s.includes(LOVER_DATES[id][0][1].t))throw Error('date '+id);if(!CHAT[id].some(c=>c.id===id[0]+'_lv1'&&c.need(gg)))throw Error('chat '+id);}
    return true;});
  test('skip scene stops at a choice instead of picking the first option',()=>{const g=fresh();G=g;let picked=0,done=0;
    playScene([{n:'nar',t:'a'},{n:'nar',t:'b'},{choice:[{t:'yes',fx:()=>{picked=1;}},{t:'no',fx:()=>{picked=2;}}]},{n:'nar',t:'c'}],()=>{done=1;},{bg:'camp'});
    sceneSkip();if(picked||!UI.scene||!UI.scene.cur||!UI.scene.cur.choice)throw Error('did not stop at the choice');sceneChoose(1);sceneSkip();if(picked!==2||!done)throw Error('after choosing '+picked+' '+done);return true;});
  test('old single-lover saves become a one-item list',()=>{const g=fresh();delete g.lovers;delete g.lovWk;g.romance='rin';g.romWk=30;g.timeV=3;fixSave(g);return g.lovers.length===1&&g.lovers[0]==='rin'&&g.lovWk.rin===30&&isLov(g,'rin');});
  test('chat with a lover always opens and its menu leads to a confirmed breakup scene',()=>{const g=fresh();G=g;lovUp(g,['kati','mali']);UI.tab='people';render();
    const btn=document.querySelector('.chatb[data-id="mali"]');if(!btn||btn.disabled)throw Error('chat btn');ACT.chat({id:'mali'});render();
    const m=document.querySelector('.cmenu');if(!m)throw Error('menu');ACT.lvmenu();render();if(!document.querySelector('[data-act="lvask"]'))throw Error('ask');ACT.lvask();render();
    if(UI.modal.type!=='confirm')throw Error('confirm');ACT.lvno();if(UI.modal.type!=='chat')throw Error('back to chat');ACT.lvask();ACT.lvbreak();if(!UI.scene)throw Error('scene');
    let guard=0;while(UI.scene&&guard++<40){if(UI.scene.cur&&UI.scene.cur.choice)sceneChoose(0);else sceneNext();}UI.modal=null;render();
    const card=[...document.querySelectorAll('.pcard')].find(c=>c.querySelector('.chatb[data-id="mali"]'));return !isLov(g,'mali')&&isAway(g,'mali')&&!!card&&card.querySelector('.chatb').disabled&&card.querySelector('[data-act="hang"]').disabled;});
  return R;});for(const [name,ok,err] of out){console.log(ok?'OK  ':'FAIL',lang,name,err||'');if(!ok)failed++;}for(const e of errors){console.log('PAGE ERROR',lang,e);failed++;}await p.close();}
 await browser.close();process.exit(failed?1:0);
})().catch(e=>{console.error(e);process.exit(1)});

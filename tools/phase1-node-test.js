// Run the game logic in Node for rollover cases without a browser.
const fs=require('fs'),vm=require('vm'),path=require('path');
let failed=0;
for(const lang of ['th','en']){
  const dir=path.join(__dirname,'..','src',lang==='en'?'en':'');
  const ctx=vm.createContext({console,XMODAL:{},ACT:{},pxIcon:()=>'',module:{exports:{}}});
  for(const file of ['engine','data','story','chat','quest']){
    const p=path.join(dir,file+'.js');
    vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});
  }
  const cases=[
    ['birthday scene and age use the same week',`(()=>{const g=newGame({seed:123});return ['kati','mali','rin','ploy','fah'].every(id=>g.F[id].birthdayWeek===bdayWeek(id));})()`],
    ['legacy recent events cross the new year once',`(()=>{const g=newGame({seed:123});g.season=2;g.week=1;g.timeV=2;g.seen.pet_cat=true;g.seen.dis_flood=true;g.seenWk={pet_cat:52,dis_flood:52};g.chatLast={kati:52};g.chatWk={'kati:k_dm':52};fixSave(g);if(g.seenAbs.pet_cat!==52||g.chatLastAbs.kati!==52||g.chatWkAbs['kati:k_dm']!==52)return false;if(petGate(g)||!evJust(g,'dis_flood'))return false;g.week=4;return petGate(g)&&!evJust(g,'dis_flood');})()`],
    ['old recent events do not revive',`(()=>{const g=newGame({seed:123});g.season=2;g.week=12;g.timeV=2;g.seen.pet_cat=true;g.seen.dis_flood=true;g.seenWk={pet_cat:46,dis_flood:46};fixSave(g);return g.seenAbs.pet_cat==null&&petGate(g)&&!evJust(g,'dis_flood');})()`],
    ['fight result uses absolute time',`(()=>{const g=newGame({seed:123});g.season=2;g.week=1;g.cal=[{wk:52,season:1,absWeek:52,a:'kati',res:'W',tier:'local'}];if(!recentRes(g,'kati','W'))return false;g.week=4;return !recentRes(g,'kati','W');})()`],
    ['Death Match recent chat expires',`(()=>{const g=newGame({seed:123});g.season=2;g.week=1;g.dm={wk:52,done:true,mine:['kati'],absWeek:52};if(!dmJust(g))return false;g.week=4;return !dmJust(g);})()`],
    ['Mali card waits two weeks after joining',`(()=>{const g=newGame({seed:123});g.season=2;g.week=6;joinCamp(g,'mali',1500);if(CARDS.m_n1.need(g))return false;g.week=7;if(CARDS.m_n1.need(g))return false;g.week=8;return CARDS.m_n1.need(g);})()`],
    ['save migration preserves progress',`(()=>{const g=newGame({seed:123});g.season=3;g.week=2;g.timeV=2;g.F.kati.skills.special=1;g.F.kati.bond=77;g.cal=[{wk:49,season:2,absWeek:101,a:'kati',res:'W'}];g.seen.story=true;fixSave(g);fixSave(g);return g.F.kati.skills.special===1&&g.F.kati.bond===77&&g.cal.length===1&&g.seen.story===true;})()`],
    ['new stage roster and title venues survive save load',`(()=>{const g=newGame({seed:123});g.season=5;g.week=42;fixSave(g);G=g;return !!g.F.lA0&&!!g.F.xA0&&!!g.F.pA0&&!!STADIUMS.ping&&!!STADIUMS.lanna&&!!beltHolder(g,'A','ping');})()`],
    ['stage NPCs appear in order',`(()=>{const g=newGame({seed:123});if(!g.F.lA0||g.F.xA0||g.F.pA0)return false;ensureStageNPCs(g,'district');if(!g.F.xA0||g.F.pA0)return false;ensureStageNPCs(g,'province');return !!g.F.pA0;})()`],
    ['stadium letters unlock in later years',`(()=>{const g=newGame({seed:123});G=g;g.week=15;mailWeekly(g);if(g.mail.some(m=>m.venue==='ping'))return false;g.season=2;g.week=15;g.mail=[];mailWeekly(g);if(!g.mail.some(m=>m.venue==='ping'))return false;g.season=3;g.week=22;g.mail=[];mailWeekly(g);return g.mail.some(m=>m.venue==='lanna');})()`],
    ['Death Match is offered again next year',`(()=>{const g=newGame({seed:123});g.week=12;g.dmSeenSeason=1;g.dmSeen={12:1};if(dmOfferOn(g))return false;g.season=2;return dmOfferOn(g);})()`],
    ['gang and animal return faster later',`(()=>{const run=year=>{const g=newGame({seed:123});g.season=year;g.week=7;g.gang={st:5,loopNextAbs:0,loopN:0};G=g;mailWeekly(g);return g;};const a=run(2),b=run(6);return a.mail.some(m=>m.repeat&&m.q==='gang')&&a.mail.some(m=>m.repeat&&m.q==='cow')&&b.gang.loopNextAbs-gameWeek(b)<a.gang.loopNextAbs-gameWeek(a)&&b.animalLoop.nextAbs-gameWeek(b)<a.animalLoop.nextAbs-gameWeek(a);})()`],
    ['accepted offer clears challenge claim',`(()=>{const g=newGame({seed:123});g.week=8;g.snub={nA0:4};g.mail=[{q:'challenge',npc:'nA0'}];g.offers=[{id:'accepted',a:'kati',b:'nA0',week:10,tier:'local'}];return acceptOffer(g,'accepted').ok&&g.snub.nA0===0&&g.mail[0].done===true;})()`],
    ['late NPCs keep pace with a strong camp',`(()=>{const g=newGame({seed:123});g.season=6;g.week=42;for(const k in g.F.kati.a)g.F.kati.a[k]=18;ensureStageNPCs(g,'province');return ovr(g.F.pA0.a)>=17.3;})()`],
    ['beast offers become more frequent and stronger',`(()=>{const run=year=>{const g=newGame({seed:123});g.season=year;let count=0,power=0;for(let w=5;w<=20;w++){g.week=w;g.offers=[];beastOffer(g,()=>0);if(g.offers.length){count++;power=Math.max(power,ovr(g.F[g.offers[0].b].a));}}return {count,power};};const a=run(2),b=run(6);return b.count>a.count&&b.power>=a.power;})()`],
    ['new year survives a beast bout booked over year end',`(()=>{const g=newGame({seed:123});G=g;g.season=5;g.week=49;g.offers=[];beastOffer(g,()=>0);const q=Object.values(g.F).find(f=>f.camp==='quest');if(!q)return false;g.week=53;g.ended='season';newSeason(g);return g.season===6&&g.week===1&&!!g.rank.A.kati;})()`],
    ['Death Match fills or byes a short field instead of freezing',`(()=>{const g=newGame({seed:123});G=g;g.season=5;g.week=31;for(const f of Object.values(g.F))if(f.camp!=='player'&&!['nA0','nA1','nB0'].includes(f.id))f.camp='free';const D=dmBuild(g,['kati']);return D.slots.filter(Boolean).length>=4;})()`],
    ['challenge letter only counts real lapsed offers',`(()=>{const g=newGame({seed:123});G=g;g.week=10;g.snub={};g.offers=[{id:'f',a:'kati',b:'nA1',week:12,tier:'exhibition',fair:1},{id:'r',a:'kati',b:'nA0',week:12,tier:'local'}];genOffers(g,{midweek:true});if(Object.keys(g.snub).length)return false;g.offers=[{id:'f',a:'kati',b:'nA1',week:12,tier:'exhibition',fair:1},{id:'r',a:'kati',b:'nA0',week:12,tier:'local'}];genOffers(g);if(g.snub.nA1||g.snub.nA0!==1)return false;g.week=53;g.ended='season';newSeason(g);return Object.keys(g.snub).length===0;})()`],
    ['one NPC cannot be booked three times',`(()=>{const g=newGame({seed:123});g.season=6;g.week=38;g.F.rin.camp='player';g.F.ploy.camp='player';g.offers=['kati','rin','ploy'].map((id,i)=>({id:'offer'+i,a:id,b:'nA0',week:38,tier:'district'}));return acceptOffer(g,'offer0').ok&&!acceptOffer(g,'offer1').ok&&!acceptOffer(g,'offer2').ok&&g.bookings.length===1;})()`]
  ];
  for(const [name,code] of cases){try{if(!vm.runInContext(code,ctx))throw Error('assertion failed');console.log('OK  ',lang,name);}catch(e){failed++;console.error('FAIL',lang,name,e.message);}}
  for(const name of ['save_v1291','save_v1122','save_v1123']){
    const raw=fs.readFileSync(path.join(__dirname,'fixtures',name+'.json'),'utf8');
    ctx.oldSave=JSON.parse(raw);
    try{const ok=vm.runInContext(`(()=>{const before=JSON.parse(JSON.stringify(oldSave)),g=fixSave(oldSave),week=g.week;
      if(JSON.stringify(g.seen)!==JSON.stringify(before.seen)||JSON.stringify(g.cal)!==JSON.stringify(before.cal||[]))return false;
      for(let i=0;i<3;i++)weekFinish(g);return g.week===week+3&&g.F.kati.age>0;})()`,ctx);
      if(!ok)throw Error('legacy progress changed');console.log('OK  ',lang,name,'loads and advances');
    }catch(e){failed++;console.error('FAIL',lang,name,e.message);}
  }
}
process.exitCode=failed?1:0;

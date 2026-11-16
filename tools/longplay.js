// Fast-forwards a new game to a late year with the engine, then plays through the UI across a year change.
// usage: node tools/longplay.js [url] [fromSeason] [fromWeek] [weeksToPlay] [lang]
const {chromium}=require('playwright');
const STRONG=process.env.STRONG==='1';const URL=process.argv[2]||'http://127.0.0.1:8766/index.html',S=+(process.argv[3]||5),W=+(process.argv[4]||46),N=+(process.argv[5]||14),L=process.argv[6]||'th';
(async()=>{const b=await chromium.launch(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{});
 const p=await b.newPage({viewport:{width:390,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message+' '+(e.stack||'').split('\n')[1]));
 await p.goto(URL+'#lang='+L);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(600);
 await p.evaluate(([s,a,a2])=>{window.__strong=s;window.__allev=a;window.__seed=a2;},[STRONG,process.env.ALLEV==='1',process.env.SEED||'777']);
 const info=await p.evaluate(([S,W])=>{SETTINGS.quick=true;G=newGame({seed:+(window.__seed||777)});G.player=G.player||{};G.player.name=G.player.name||'ทดสอบ';G.unlocked=true;G.cash=5e5;G.debt=0;
   for(const k in G.seen)G.seen[k]=true;if(!window.__allev)EVENTS.forEach(e=>{if((e.when&&!/^y\d|vector|pailin|prod/.test(e.id)))G.seen[e.id]=true;});
   let guard=0;while(((G.season||1)<S||G.week<W)&&guard++<2000){weekFinish(G);if(G.ended==='season'){newSeason(G);}}
   fixSave(G);UI.slot=1;save();UI.tab='home';render();return {season:G.season,week:G.week};},[S,W]);
 console.log('start',JSON.stringify(info));
 const log=[];let lastWk='';let stuck=0;
 for(let i=0;i<4000;i++){
  const st=await p.evaluate(()=>{const has=s=>!!document.querySelector(s);const click=s=>{const e=document.querySelector(s);if(e){e.click();return true;}return false;};
    if(has('.vn')){if(click('[data-act=vchoose]'))return 'choose';if(click('.vtap'))return 'vtap';}
    if(UI.ending){if(click('[data-act=newseason]'))return 'NEWSEASON';return 'ending-no-button:'+G.ended;}
    if(click('[data-act=gateok]'))return 'gate';
    if(has('[data-act=fstart]')){ACT.fquick();return 'fight';}
    if(UI.fight){if(!click('[data-act=fdone]')){ACT.fquick&&ACT.fquick();}return 'fightdone';}
    if(click('[data-act=montageDone]'))return 'montage';
    if(UI.modal&&UI.modal.type==='dm'){if(click('[data-act=dmgo]'))return 'dmgo';if(click('[data-act=dmclose]'))return 'dmclose';return 'dm-stuck';}
    if(UI.modal){const t=UI.modal.type;if(t==='endwarn'){ACT.endgo();return 'endgo';}if(t==='levelup'){const k=document.querySelector('[data-act=learn]');if(k){k.click();}UI.modal=null;render();return 'lvl';}UI.modal=null;render();return 'modal:'+t;}
    if(UI.scene||UI.montage)return 'busy';
    if(window.__strong){roster(G).forEach(f=>{for(const k in f.a)f.a[k]=Math.max(f.a[k],19);f.fatigue=0;f.injury=0;});(G.offers||[]).slice().forEach(o=>{try{acceptOffer(G,o.id);}catch(e){}});}if(window.__strong&&typeof dmOfferOn==='function'&&dmOfferOn(G)&&!G.dm){ACT.dmpick();UI.dmSel=roster(G).filter(dmCanEnter).slice(0,3).map(f=>f.id);ACT.dmstart();return 'dmstart';}if(G.dm&&!G.dm.done&&G.dm.wk===G.week){ACT.dmopen();return 'dmopen';}ACT.endweek();return 'wk '+G.season+'/'+G.week;});
  if(st.startsWith('wk')){log.push(st);if(st===lastWk){if(++stuck>5){console.log('STUCK at',st);break;}}else stuck=0;lastWk=st;}
  if(st.startsWith('ending-no'))log.push(st);
  if(st==='NEWSEASON')log.push(st);
  await p.waitForTimeout(st==='busy'?120:15);
  const done=await p.evaluate(([S,W,N])=>((G.season-S)*52+G.week-W)>=N,[S,W,N]);if(done)break;}
 const end=await p.evaluate(()=>({season:G.season,week:G.week,ended:G.ended,scene:!!UI.scene,modal:UI.modal&&UI.modal.type}));
 console.log(log.filter((x,i,a)=>a.indexOf(x)===i).join(' | '));console.log('end',JSON.stringify(end));console.log('ERR',JSON.stringify(errs.slice(0,6)));
 await p.screenshot({path:'/home/claude/work/longplay_'+L+'.png'});await b.close();})();

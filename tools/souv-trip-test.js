// Ad-hoc: the souvenir shop on the way home from a regional trip (TH + EN). Not part of the main suites.
const {chromium}=require('playwright');const url=process.argv[2]||'http://127.0.0.1:8766/index.html';
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH,headless:true});let bad=0;
for(const lang of ['th','en']){const p=await b.newPage(),errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(url+'#lang='+lang+'&regiondev');await p.waitForTimeout(1500);
 const r=await p.evaluate(async()=>{G=newGame({seed:12345});await regionLoad();G.region=G.region||{};G.cash=20000;
  const dest=Object.keys(ROAD_DEST).find(k=>ROAD_DEST[k].r==='south');const T={dest,abs:1};let done=0;REGION.home(T,()=>{done=1;});
  const texts=[];let guard=0,bought=0;
  while(UI.scene&&guard++<60){const c=UI.scene.cur;if(c&&c.t)texts.push(c.t);
    if(c&&c.choice){texts.push('['+c.choice.map(x=>x.t).join(' | ')+']');if(bought<3){sceneChoose(bought===2?0:1);bought++;}else sceneChoose(c.choice.length-1);}else sceneNext();}
  return {done,souv:G.souv,cash:G.cash,texts};});
 console.log(lang,JSON.stringify(r,null,1).slice(0,1800),errs);
 if(!r.done||r.souv.s_pearl!==2||r.souv.s_talung!==1||r.cash!==20000-2*6800-2600||errs.length)bad++;await p.close();}
await b.close();console.log(bad?'FAIL':'OK');process.exit(bad?1:0);})();

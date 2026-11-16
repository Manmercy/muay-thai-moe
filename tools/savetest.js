// Loads save files from older versions into the current build and plays a few weeks. Run before every publish.
// usage: node savetest.js [url]   (fixtures in ./fixtures/*.json)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2]||'file://'+path.join(__dirname,'..','index.html');const DIR=path.join(__dirname,'fixtures');
(async()=>{const b=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});let bad=0;
for(const fx of fs.readdirSync(DIR).filter(f=>f.endsWith('.json')))for(const L of ['th','en']){
 const ctx=await b.newContext({viewport:{width:390,height:740}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(URL+'#lang='+L);await p.evaluate(raw=>{localStorage.clear();localStorage.setItem(slotKey(1),raw);},fs.readFileSync(path.join(DIR,fx),'utf8'));
 await p.goto('about:blank');await p.goto(URL+'#lang='+L);await p.waitForTimeout(700);
 const r=await p.evaluate(()=>{const o={};ACT.tapstart({});ACT.loadslot({v:1});o.loaded=!!G;if(!G)return o;o.week=G.week;o.bak=!!bakInfo(1);o.sp=G.F.kati.sp;
  for(const t of ['home','train','fights','people','camp'])ACT.tab({v:t});
  for(const m of [{type:'fighter',id:'kati'},{type:'mail'},{type:'cashflow'},{type:'repgraph'},{type:'settings'}]){UI.modal=m;render();}UI.modal=null;
  for(let i=0;i<3;i++){weekFinish(G);mailWeekly(G);chatWeekly(G);genOffers(G);render();}
  save();o.ver=JSON.parse(localStorage.getItem(slotKey(1))).ver;o.week2=G.week;o.cash=Math.round(G.cash);return o;});
 const old=JSON.parse(fs.readFileSync(path.join(DIR,fx),'utf8')).ver!==r.ver;const ok=r.loaded&&(r.bak||!old)&&r.week2===r.week+3&&!errs.length;if(!ok)bad++;
 console.log(ok?'OK  ':'FAIL',fx,L,JSON.stringify(r),errs.slice(0,2).join(' | '));await ctx.close();}
await b.close();process.exit(bad?1:0);})();

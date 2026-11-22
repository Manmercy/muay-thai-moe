const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
let failures=0;
for(const lang of ['th','en']){
 const dir=path.join(root,'src',lang==='en'?'en':'');
 const c=vm.createContext({console,XMODAL:{},ACT:{},pxIcon:()=>'',module:{exports:{}},save:()=>{},render:()=>{},esc:String,fmt:String,faceSrc:()=>''});
 for(const file of ['engine','data','story','chat','quest'])vm.runInContext(fs.readFileSync(path.join(dir,file+'.js'),'utf8'),c);
 for(const file of ['pixel','ui'])new vm.Script(fs.readFileSync(path.join(dir,file+'.js'),'utf8'));
 const cases={
  'title bracket reserves entrants and awards once':`(()=>{G=newGame({seed:123});G.week=10;const D=beltTournament(G,{div:'A',venue:'tha',pay:15000},'kati');if(!D||D.slots.filter(Boolean).some(id=>G.F[id].div!=='A'))return false;G.dm=D;if(!isBooked(G,'kati',10))return false;for(let n=0;n<20&&!D.done;n++){dmAdvance();if(!D.done){const L=dmList(D),i=D.w[D.r].length*2;D.w[D.r].push(D.mine.find(id=>L.slice(i,i+2).includes(id))||L[i]||L[i+1]);}}const cash=G.cash;dmFinish();return D.done&&D.champ==='kati'&&D.prize===15000&&G.cash===cash&&beltHolder(G,'A').id==='kati'&&!isBooked(G,'kati',10)&&beltBracketHTML(D).includes(G.F.kati.name);})()`,
  'lost title requires tournament again':`(()=>{G=newGame({seed:123});G.week=10;G.belt={A:{id:'nA0',def:0,since:9}};const D=beltTournament(G,{div:'A',venue:'tha'},'kati');return !!D&&D.belt.holder==='nA0'&&D.w.every(L=>!L.length)&&beltTournament(G,{div:'B',venue:'tha'},'kati')===null;})()`,
  'short Death Match field and stale portraits are safe':`(()=>{G=newGame({seed:123});G.week=6;for(const f of Object.values(G.F))if(f.camp!=='player'&&f.id!=='nA0')f.injury=2;const D=dmBuild(G,['kati','kati','bad']);if(!D||D.mine.length!==1||D.slots.filter(Boolean).length!==2)return false;G.dm=D;delete G.F.nA0;dmAdvance();dmBracketHTML();const cash=G.cash;dmFinish();return D.done&&D.champ==='kati'&&G.cash===cash;})()`,
  'joining clears obsolete opposing fixtures and letters':`(()=>{G=newGame({seed:123});G.bookings=[{a:'mali',b:'fah',week:20}];G.offers=[{a:'kati',b:'fah'}];G.mail=[{q:'challenge',npc:'fah'}];joinCamp(G,'mali',1000);joinCamp(G,'fah',1800);return !G.bookings.length&&!G.offers.length&&G.mail[0].done;})()`,
  'a slower opponent still attacks':`(()=>{let thrown=0;for(let seed=1;seed<=30;seed++){G=newGame({seed});for(const k in G.F.kati.a)G.F.kati.a[k]=19;for(const k in G.F.nA0.a)G.F.nA0.a[k]=12;thrown+=quickFight(G.F.kati,G.F.nA0,seed,5).B.thrown;}return thrown>60;})()`
 };
 for(const [name,code]of Object.entries(cases)){try{if(!vm.runInContext(code,c))throw Error('assertion failed');console.log('PASS',lang,name);}catch(e){failures++;console.error('FAIL',lang,name,e.message);}}
}
if(failures)throw Error(failures+' regression checks failed');

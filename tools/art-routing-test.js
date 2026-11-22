const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
for(const lang of ['th','en']){
 const src=fs.readFileSync(path.join(root,'src',lang==='en'?'en':'','ui.js'),'utf8');new vm.Script(src);
 const lines=src.split('\n'),c=vm.createContext({ASSET:'a/',CANON_IDS:['kati','mali','rin','ploy','fah'],STANDFIT:{kati_fight_angry:[1.7,-.8,.5]},G:{F:{kati:{id:'kati'}}}});
 for(const prefix of ['const STAND_PNG=','const standArt=','const cardBodySrc='])vm.runInContext(lines.find(l=>l.startsWith(prefix)),c);
 const keys=vm.runInContext('[...STAND_PNG]',c);
 for(const key of keys){const file=path.join(root,'a',key+'.png');if(!fs.existsSync(file))throw Error('Missing '+file);const data=fs.readFileSync(file);if(data.readUInt32BE(16)<600||data.readUInt32BE(20)<900)throw Error('Small source '+key);}
 const cut=src.slice(src.indexOf('function cutPicArt('),src.indexOf('\nfunction cutPic(',src.indexOf('function cutPicArt(')));vm.runInContext(cut,c);
 for(const [input,want] of [['a/kati_angry_face.webp','a/kati_fight_angry.png'],['a/rin_thai_fl_face.webp','a/rin_thai_fl.png'],['a/unknown_face.webp','a/unknown.webp']]){c.input=input;if(vm.runInContext('cardBodySrc(input)',c)!==want)throw Error('Wrong card source '+input);}
 if(!vm.runInContext('cutPicArt("kati")',c).includes('a/kati_fight_angry.png'))throw Error('Low-resolution cut-in');
 // Exercise NPC preloading; a stale speaker variable used to throw before the scene opened.
 const start=src.indexOf('function warmSteps('),end=src.indexOf('\nfunction ',start+1);let warms=0;
 Object.assign(c,{npcImg:()=> 'tiger_boss',warm:()=>warms++,warmChar:()=>{},CARD_ART:{}});vm.runInContext(src.slice(start,end),c);vm.runInContext('warmSteps([{n:"npc",who:"เถ้าแก่เสือ",t:"test"}],"fight")',c);if(!warms)throw Error('NPC art not warmed');
 console.log('PASS',lang,keys.length+' full-resolution portraits; cards; cut-ins; NPC preloading');
}

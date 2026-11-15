// ================= MUAY THAI MOE — SIM ENGINE (pure logic, no DOM) =================
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickW=(rng,items)=>{const tot=items.reduce((s,i)=>s+Math.max(0,i[1]),0);let r=rng()*tot;for(const i of items){r-=Math.max(0,i[1]);if(r<=0)return i[0];}return items[items.length-1][0];};
const fmt=n=>(n<0?"-":"")+"฿"+Math.abs(Math.round(n)).toLocaleString("en-US");

const ATTRS=[["punch","Punch"],["kick","Kick"],["knee","Knee"],["elbow","Elbow"],["clinch","Clinch"],["guard","Guard"],["foot","Footwork"],
  ["counter","Counter"],["power","Power"],["speed","Speed"],["stamina","Stamina"],["dur","Durability"],["iq","Fight IQ"],["comp","Composure"]];
const ATTR_GROUPS=[["Weapons",["punch","kick","knee","elbow","clinch"]],["Technique",["guard","foot","counter"]],["Body",["power","speed","stamina","dur"]],["Mind",["iq","comp"]]];
const ATTR_LABEL=Object.fromEntries(ATTRS);
const STYLES={mat:"Puncher",tae:"Kicker",khao:"Knee fighter",sok:"Elbow fighter",femur:"Technician"};

function styleOf(a){
  const s={mat:(a.punch*2+a.power+a.counter)/4,tae:(a.kick*2+a.foot+a.speed)/4,khao:(a.knee*2+a.clinch+a.stamina)/4,
    sok:(a.elbow*2+a.clinch+a.power)/4,femur:(a.iq*1.5+a.counter+a.guard*.75+a.foot*.75)/4};
  const top=Object.entries(s).sort((x,y)=>y[1]-x[1]);
  return top[0][1]-top[1][1]<.35?STYLES[top[0][0]]+" / "+STYLES[top[1][0]]:STYLES[top[0][0]];
}
function ovr(a){let s=0;for(const [k] of ATTRS)s+=a[k];return s/ATTRS.length;}

const CANON={
  kati:{name:"Kati",full:"Kati Sirichai",div:"A",camp:"player",color:"#d23246",potential:19,wage:1200,
    a:{punch:11,kick:8,knee:7,elbow:6,clinch:6,guard:7,foot:9,counter:9,power:9,speed:12,stamina:9,dur:9,iq:7,comp:6}},
  mali:{name:"Mali",full:"Mali",div:"B",camp:"free",color:"#2f62c8",potential:19,wage:1500,fee:8000,
    a:{punch:8,kick:13,knee:8,elbow:6,clinch:6,guard:9,foot:12,counter:8,power:9,speed:12,stamina:13,dur:9,iq:9,comp:8}},
  rin:{name:"Rin",full:"Rin",div:"A",camp:"free",color:"#2f8a50",potential:18.5,wage:2000,fee:15000,
    a:{punch:9,kick:10,knee:8,elbow:8,clinch:8,guard:12,foot:12,counter:13,power:8,speed:10,stamina:10,dur:9,iq:15,comp:12}},
  ploy:{name:"Ploy",full:"Ploy Golden Tiger",div:"A",camp:"rival",color:"#7a3fc0",potential:17.5,
    a:{punch:10.5,kick:10.5,knee:16,elbow:11.5,clinch:16,guard:12.5,foot:9.5,counter:9.5,power:13.5,speed:10.5,stamina:14.5,dur:13.5,iq:12.5,comp:14.5}},
  fah:{name:"Fah",full:"Fah Golden Tiger",div:"B",camp:"rival",color:"#d9a21b",potential:17,
    a:{punch:11.6,kick:10.6,knee:11.1,elbow:15.1,clinch:10.1,guard:9.1,foot:10.1,counter:8.1,power:14.1,speed:12.1,stamina:10.6,dur:12.1,iq:10.1,comp:9.1}},
};
const NPC_NAMES={
  A:[["Namphueng S.Wilaiporn",7],["Petchdao Luk Mae Ping",8],["Thapthim Kiatsiam",8],["Praewa Sit Khru Nong",9],["Chanpen T.Prasert",10]],
  B:[["Fonthip P.Pongthai",8],["Lamyai Sit Doi Kham",8],["Khwankhao Ch.Chaiwat",9],["Butsaba Saengthong Gym",10],["Baitoei S.Mueang Nuea",10]],
};
const NPC_DISTRICT={A:[["Saifa W.Wanthawi",11],["Mukda Petchyindee",11]],B:[["Kaewkanlaya K.Kitti",11],["Arunee S.Srisuk",11]]};
const NPC_COLORS=["#8a6f5a","#5a7a8a","#7a5a8a","#5a8a6a","#8a5a5a","#6a6a8a"];

// v1.43: the field keeps improving through the season so mid/late fights stay honest
const NPC_POT=5,NPC_RATE=w=>w>16?.055:.022;
function mkNPC(id,name,div,lvl,rng,i){
  const a={};for(const [k] of ATTRS)a[k]=clamp(Math.round(lvl+(rng()*4-2)),3,18);
  const fav=pickW(rng,[["punch",1],["kick",1],["knee",1],["elbow",1]]);a[fav]=clamp(a[fav]+3,3,19);
  return {id,name,full:name,div,camp:"npc",color:NPC_COLORS[i%NPC_COLORS.length],potential:lvl+NPC_POT,a};
}
// ---------- SKILLS (unique per canon) ----------
// v1.3: skills rooted in the old regional schools — "หมัดหนักโคราช ฉลาดลพบุรี ท่วงทีไชยา ไวกว่าท่าเสา"
const SCHOOLS={thasao:{name:"Tha Sao style",motto:"Faster than Tha Sao",color:"#e23b4e"},chaiya:{name:"Chaiya style",motto:"Fine form of Chaiya",color:"#4a7fe0"},
  lopburi:{name:"Lopburi style",motto:"Clever Lopburi",color:"#3fae6a"},korat:{name:"Korat style",motto:"Heavy fists of Korat",color:"#9b62e0"},modern:{name:"Modern Muay Thai",motto:"Never Retreat",color:"#e7b443"}};
const SKILLS={
 // v1.29 skill trees: 3 lines × (basic → mid → mid/passive → high). row 0..3, line 0..2, req = [main stat, cross stat?], pre = skill needed first
 kati:[
  {id:"ts_fast",line:0,row:0,req:["kick"],school:"thasao",name:"Naga Tail Whip",desc:"Tha Sao trick: lead jab, lean, follow with a kick · Kick accuracy +3%, kick score +8%",fx:r=>({hit:{kick:.03*r},pts:{kick:.08*r}})},
  {id:"ts_low",line:0,row:1,pre:"ts_fast",req:["kick","power"],school:"thasao",name:"Leg-Chopping Kick",desc:"Low kick that saps the legs · kick power +8%, kick accuracy +1.5%",fx:r=>({dmg:{kick:.08*r},hit:{kick:.015*r}})},
  {id:"k_shin",line:0,row:2,pre:"ts_fast",passive:1,req:["kick"],school:"thasao",name:"Iron Shins",desc:"Always on · 12% less fatigue from kick training",fx:r=>({}),px:r=>({fatKick:.12*r})},
  {id:"ts_croc",line:0,row:3,pre:"ts_low",req:["kick","foot"],school:"thasao",name:"Crocodile Sweeps Its Tail",desc:"Spinning back kick · kick accuracy +3%, kick power +10%, kick points +8%",fx:r=>({hit:{kick:.03*r},dmg:{kick:.1*r},pts:{kick:.08*r}})},
  {id:"ts_jab",line:1,row:0,req:["punch"],school:"thasao",name:"Tha Sao Crossbow Jab",desc:"Quick Tha Sao lead · Punch accuracy +3%, punch score +6%",fx:r=>({hit:{punch:.03*r},pts:{punch:.06*r}})},
  {id:"ts_elbow",line:1,row:1,pre:"ts_jab",req:["elbow","clinch"],school:"thasao",name:"Tha Sao Slicing Elbow",desc:"Spinning elbow at close range · elbow power +10%, accuracy +1%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.01*r}})},
  {id:"k_blood",line:1,row:2,pre:"ts_jab",passive:1,req:["comp"],school:"thasao",name:"Fighter's Blood",desc:"Always on · +20% EXP from fights you lose",fx:r=>({}),px:r=>({lossXp:.2*r})},
  {id:"ts_ring",line:1,row:3,pre:"ts_elbow",req:["punch","elbow"],school:"thasao",name:"Hanuman Presents the Ring",desc:"Twin uppercuts to the chin · punch accuracy +3%, punch power +10%, punch points +8%",fx:r=>({hit:{punch:.03*r},dmg:{punch:.1*r},pts:{punch:.08*r}})},
  {id:"ts_step",line:2,row:0,req:["foot"],school:"thasao",name:"Wide Tha Sao stance",desc:"Wide stance, weight on the back leg · Evade +1.5%, counter +3%",fx:r=>({evade:.015*r,ctr:.03*r})},
  {id:"heart",line:2,row:1,pre:"ts_step",req:["stamina"],school:"thasao",name:"Heart Over a Hundred",desc:"Below 45 body: accuracy +4%",fx:r=>({clutch:.04*r})},
  {id:"k_grind",line:2,row:2,pre:"ts_step",passive:1,req:["stamina"],school:"thasao",name:"Never Tired of Training",desc:"Always on · 7% less fatigue from all training",fx:r=>({}),px:r=>({fatAll:.07*r})},
  {id:"ts_iron",line:2,row:3,pre:"heart",req:["guard","iq"],school:"thasao",name:"Tha Sao Wall",desc:"Tight guard, then counter · evade +2%, counter +3%, clinch defense +0.8",fx:r=>({evade:.02*r,ctr:.03*r,clDef:.8*r})}],
 mali:[
  {id:"cy_kick",line:0,row:0,req:["elbow"],school:"chaiya",name:"Leaping Elbow Strike",desc:"Chaiya master move · Elbow accuracy +2%, elbow score +10%",fx:r=>({hit:{elbow:.02*r},pts:{elbow:.1*r}})},
  {id:"cy_spin",line:0,row:1,pre:"cy_kick",req:["elbow","foot"],school:"chaiya",name:"Spinning Elbow",desc:"Spin and slash a counter elbow · elbow power +10%, elbow accuracy +1.5%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.015*r}})},
  {id:"m_heart",line:0,row:2,pre:"cy_kick",passive:1,req:["comp"],school:"chaiya",name:"Small Body, Big Heart",desc:"Always on · +8% EXP from every fight",fx:r=>({}),px:r=>({fightXp:.08*r})},
  {id:"cy_erawan",line:0,row:3,pre:"cy_spin",req:["elbow","clinch"],school:"chaiya",name:"Breaking Erawan's Neck",desc:"Pull the neck down and slash the elbow · elbow power +12%, elbow accuracy +3%, clinch defense +0.5",fx:r=>({dmg:{elbow:.12*r},hit:{elbow:.03*r},clDef:.5*r})},
  {id:"cy_tee",line:1,row:0,req:["kick"],school:"chaiya",name:"Chaiya Gate-Opener Kick",desc:"Body kick that opens the guard · Kick accuracy +3%, kick score +6%",fx:r=>({hit:{kick:.03*r},pts:{kick:.06*r}})},
  {id:"cy_poise",line:1,row:1,pre:"cy_tee",req:["foot"],school:"chaiya",name:"Three-Step Walk",desc:"Chaiya master's three-step footwork · Between-round recovery +20%, morale effect +1%",fx:r=>({regen:.2*r,mor:.01*r})},
  {id:"cy_breath",line:1,row:2,pre:"cy_tee",passive:1,req:["stamina"],school:"chaiya",name:"Breath of the Chaiya Master",desc:"Always on · between-round recovery +8% in every fight",fx:r=>({regen:.08*r})},
  {id:"cy_hanuman",line:1,row:3,pre:"cy_poise",req:["foot","speed"],school:"chaiya",name:"Hanuman Parts the Foam",desc:"Duck low and split the guard to get inside · evade +2.5%, counter +3%, knee accuracy +2%",fx:r=>({evade:.025*r,ctr:.03*r,hit:{knee:.02*r}})},
  {id:"cy_guard",line:2,row:0,req:["guard"],school:"chaiya",name:"Block, Parry, Close, Open",desc:"Chaiya defensive principle · Inside defense +1, evade +1%",fx:r=>({clDef:1*r,evade:.01*r})},
  {id:"cy_knee",line:2,row:1,pre:"cy_guard",req:["knee","clinch"],school:"chaiya",name:"Chaiya Flying Knee",desc:"Jumping knee from mid range · Knee power +10%, accuracy +1%",fx:r=>({dmg:{knee:.1*r},hit:{knee:.01*r}})},
  {id:"m_smile",line:2,row:2,pre:"cy_guard",passive:1,req:["comp"],school:"chaiya",name:"Fighting Smile",desc:"Always on · morale drops 25% less after a loss",fx:r=>({}),px:r=>({moraleLoss:.25*r})},
  {id:"cy_root",line:2,row:3,pre:"cy_knee",req:["guard","dur"],school:"chaiya",name:"Chaiya Rooted Stance",desc:"Stand rooted, barely giving up points · evade +2%, clinch defense +1, between-round recovery +10%",fx:r=>({evade:.02*r,clDef:1*r,regen:.1*r})}],
 rin:[
  {id:"lb_read",line:0,row:0,req:["counter"],school:"lopburi",name:"Clever Lopburi",desc:"Always moving, slip and counter · Counter +4%, evade +1.5%",fx:r=>({ctr:.04*r,evade:.015*r})},
  {id:"lb_jab",line:0,row:1,pre:"lb_read",req:["punch","counter"],school:"lopburi",name:"Lopburi Straight",desc:"Precise straight punch · Counter-punch power +12%, punch accuracy +1%",fx:r=>({ctrDmg:.12*r,hit:{punch:.01*r}})},
  {id:"lb_calm",line:0,row:2,pre:"lb_read",passive:1,req:["comp"],school:"lopburi",name:"The Calculating Calm",desc:"Always on · below 45 health, accuracy +2% in every fight",fx:r=>({clutch:.02*r})},
  {id:"lb_kris",line:0,row:3,pre:"lb_jab",req:["counter","speed"],school:"lopburi",name:"Inao Thrusts the Kris",desc:"Slip, then spear a straight counter · counter +4%, counter-punch power +15%, punch accuracy +2%",fx:r=>({ctr:.04*r,ctrDmg:.15*r,hit:{punch:.02*r}})},
  {id:"lb_plan",line:1,row:0,req:["iq"],school:"lopburi",name:"Muay Kiao (Teasing Style)",desc:"Feints and baits · Corner orders 25% stronger, base accuracy +1%",fx:r=>({corner:.25*r,prep:.01*r})},
  {id:"lb_feint",line:1,row:1,pre:"lb_plan",req:["iq"],school:"lopburi",name:"Feint Left, Strike Right",desc:"Bait them into throwing first · Evade +1.5%, counter +2%",fx:r=>({evade:.015*r,ctr:.02*r})},
  {id:"r_note",line:1,row:2,pre:"lb_plan",passive:1,req:["iq"],school:"lopburi",name:"Opponent Notebook",desc:"Always on · base accuracy +0.8% in every fight",fx:r=>({prep:.008*r})},
  {id:"lb_giant",line:1,row:3,pre:"lb_feint",req:["iq","comp"],school:"lopburi",name:"The Giant Catches the Monkey",desc:"Read three beats ahead · corner orders +30% effect, base accuracy +1.2%, evade +1%",fx:r=>({corner:.3*r,prep:.012*r,evade:.01*r})},
  {id:"lb_teep",line:2,row:0,req:["kick"],school:"lopburi",name:"Lopburi Stop Teep",desc:"Teep that breaks rhythm · Kick accuracy +2%, kick score +8%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r}})},
  {id:"lb_range",line:2,row:1,pre:"lb_teep",req:["kick","foot"],school:"lopburi",name:"Cutting the Outer Ring",desc:"Control range with teeps and footwork · kick accuracy +2%, kick points +8%, evade +1%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r},evade:.01*r})},
  {id:"r_pace",line:2,row:2,pre:"lb_teep",passive:1,req:["stamina"],school:"lopburi",name:"Counting the Beat",desc:"Always on · attacks cost 4% less energy in every fight",fx:r=>({staSave:.04*r})},
  {id:"lb_tiger",line:2,row:3,pre:"lb_range",req:["kick","foot"],school:"lopburi",name:"Tiger Drags Its Tail",desc:"Feint a retreat, then kick back · kick power +10%, kick accuracy +3%, counter +2%",fx:r=>({dmg:{kick:.1*r},hit:{kick:.03*r},ctr:.02*r})}],
 ploy:[{id:"kr_swing",school:"korat",name:"Buffalo Swing",desc:"Wide, heavy hook · Punch power +12%, punch score +5%",fx:r=>({dmg:{punch:.12*r},pts:{punch:.05*r}})},
       {id:"kr_knee",school:"korat",name:"Neck-Breaker Kick",desc:"Korat-style neck kick · Kick accuracy +3%, kick score +8%",fx:r=>({hit:{kick:.03*r},pts:{kick:.08*r}})},
       {id:"captain",school:"korat",name:"Rope-Bound to the Elbow",desc:"Iron arms that eat kicks · Evade/block +1%, composure +1%, inside defense +0.5",fx:r=>({evade:.01*r,mor:.01*r,clDef:.5*r})},
       {id:"kr_clinch",lv:6,school:"korat",name:"Korat Neck Wrestle",desc:"Lock the neck and knee nonstop · Knee power +10%, accuracy +2%",fx:r=>({dmg:{knee:.1*r},hit:{knee:.02*r}})}],
 fah:[{id:"tiger",school:"modern",name:"Tiger Elbow",desc:"Elbow power +12%, accuracy +2%",fx:r=>({dmg:{elbow:.12*r},hit:{elbow:.02*r}})},
      {id:"reckless",school:"modern",name:"Reckless",desc:"Attacks cost 8% less energy",fx:r=>({staSave:.08*r})},
      {id:"grin",school:"modern",name:"Smirk",desc:"Below 45 body: accuracy +3%",fx:r=>({clutch:.03*r})},
      {id:"fah_rush",lv:5,school:"modern",name:"Combo Storm",desc:"Rush in with combos · Punch accuracy +2%, punch score +8%",fx:r=>({hit:{punch:.02*r},pts:{punch:.08*r}})}],
};
// v1.12: a deep bond unlocks each heroine's signature move (bond 60+, player's camp only)
const SIGNATURE={kati:{name:"Sirichai Heart Spinning Elbow",desc:"Bond 60+ · Elbow power +15% · extra 3% accuracy when hurt",fx:{dmg:{elbow:.15},clutch:.03}},
  mali:{name:"Jasmine Bloom Kick",desc:"Bond 60+ · Kick accuracy +3% · between-round recovery +15%",fx:{hit:{kick:.03},regen:.15}},
  rin:{name:"The Winning Equation",desc:"Bond 60+ · Corner orders +30% · counter +3%",fx:{corner:.3,ctr:.03}},
  ploy:{name:"Tiger Wall",desc:"Bond 60+ · Evade/block +2% · inside defense +1",fx:{evade:.02,clDef:1}},
  fah:{name:"Thundering Sky Storm",desc:"Bond 60+ · Punch power +12% · 6% less energy",fx:{dmg:{punch:.12},staSave:.06}}};
const hasSignature=f=>!!SIGNATURE[f.id]&&f.camp==="player"&&(f.bond||0)>=60;
function skillMods(f){const m={hit:{},pts:{},dmg:{},ctr:0,ctrDmg:0,clutch:0,regen:0,mor:0,evade:0,corner:0,prep:0,clDef:0,staSave:0};
  if(hasSignature(f)){const e=SIGNATURE[f.id].fx;for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  const list=SKILLS[f.id];if(!list||!f.skills)return m;const eq=equipped(f);
  for(const sk of list){if(!sk.passive&&!eq.includes(sk.id))continue;const r=f.skills[sk.id]||0;if(!r)continue;const e=sk.fx(r);
    for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  return m;}
const xpNeed=lvl=>50+lvl*30;
function gainXP(G,f,x){if(!f.canon)return;if(f.camp==="player"&&G.fac&&G.fac.ring)x=Math.round(x*(1+G.fac.ring*.15));f.xp+=x;f.xpGain=(f.xpGain||0)+x;
  while(f.lvl<10&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;f.sp+=SP_PER_LV(f);if(f.camp==="player"){G.levelUps=G.levelUps||[];G.levelUps.push(f.id);}}}
const skillDef=(fid,sk)=>(SKILLS[fid]||[]).find(s=>s.id===sk);
// v1.29: stat requirements scale from each fighter's starting stats, so every line asks for real training
const hasTree=fid=>!!(SKILLS[fid]&&SKILLS[fid][0]&&SKILLS[fid][0].line!=null);
const SP_PER_LV=f=>hasTree(f.id)?3:1;
// thresholds are written in "weeks of focused training" and converted with each fighter's measured growth (8 / 14 weeks of the best programme)
const GROW={"kati":{"punch":[3.1,4.8],"counter":[2.6,4.5],"power":[1.8,3.2],"speed":[1.7,2.7],"kick":[3.5,5.6],"foot":[2.1,3.3],"knee":[3.5,5.9],"clinch":[3.7,5.9],"stamina":[3.2,5],"elbow":[3.7,6.1],"guard":[3.9,6.2],"iq":[2.6,4.2],"comp":[1.3,2.2],"dur":[1.7,2.8]},"mali":{"punch":[2.9,4.6],"counter":[2.3,4.1],"power":[1.5,2.7],"speed":[1.4,2.3],"kick":[2.3,3.7],"foot":[1.6,2.5],"knee":[2.8,4.8],"clinch":[3.2,5],"stamina":[2,3.1],"elbow":[3.1,5.2],"guard":[3,4.8],"iq":[2,3.2],"comp":[1,1.7],"dur":[1.4,2.3]},"rin":{"punch":[2.7,4.3],"counter":[1.7,3.1],"power":[1.5,2.8],"speed":[1.6,2.6],"kick":[2.6,4.2],"foot":[1.4,2.2],"knee":[2.8,4.7],"clinch":[2.9,4.5],"stamina":[2.5,4],"elbow":[2.8,4.7],"guard":[2.6,4.1],"iq":[1.1,1.7],"comp":[0.8,1.3],"dur":[1.4,2.3]}};
const REQ_WK={main:[[0,2,4],[3,5,7],[3,5,7],[6,8,10]],cross:[[0,0,0],[1,2,3],[0,0,0],[2,3,4]],scale:{kati:1,mali:.85,rin:.7}};
function skillReqs(fid,sk,rank){const d=skillDef(fid,sk);if(!d||!d.req||!CANON[fid]||!GROW[fid])return [];const base=CANON[fid].a,r=clamp(rank,1,3)-1,sc=REQ_WK.scale[fid]||1;
  return d.req.map((k,i)=>{const w=(i?REQ_WK.cross:REQ_WK.main)[d.row][r]*sc,g=GROW[fid][k]||[2,3.2];const up=w<=8?g[0]*w/8:g[0]+(g[1]-g[0])*(w-8)/6;return {k,v:Math.floor((base[k]+up)*2)/2};});}
// why a skill can't be raised right now ([] = ok). Each entry: {t:"sp"|"max"|"lv"|"pre"|"stat", ...}
function skillBlock(f,sk){const d=skillDef(f.id,sk),r=(f.skills&&f.skills[sk])||0,B=[];if(!d)return [{t:"none"}];
  if(r>=3)return [{t:"max"}];if((d.lv||1)>f.lvl)B.push({t:"lv",v:d.lv});
  if(d.pre&&!((f.skills[d.pre]||0)>0))B.push({t:"pre",id:d.pre});
  for(const q of skillReqs(f.id,sk,r+1))if(f.a[q.k]+1e-6<q.v)B.push({t:"stat",k:q.k,v:q.v,have:f.a[q.k]});
  if(f.sp<1)B.push({t:"sp"});return B;}
function learnSkill(G,id,sk){const f=G.F[id],d=skillDef(id,sk);if(!d||skillBlock(f,sk).length)return false;f.skills[sk]=(f.skills[sk]||0)+1;f.sp--;
  if(d.passive)return true;f.equip=equipped(f);if(!f.equip.includes(sk)&&f.equip.length<3)f.equip.push(sk);return true;}
function passiveMods(f){const m={fatKick:0,fatAll:0,lossXp:0,fightXp:0,moraleLoss:0};for(const sk of SKILLS[f.id]||[]){const r=(f.skills&&f.skills[sk.id])||0;if(!r||!sk.px)continue;const e=sk.px(r);for(const k in e)m[k]+=e[k];}return m;}
// v1.20: only 3 techniques are carried into the ring (player picks; rivals carry their best 3)
const MAX_EQUIP=3;
function equipped(f){const pas=k=>{const d=skillDef(f.id,k);return !!(d&&d.passive);};const has=k=>(f.skills&&f.skills[k])>0&&!pas(k);if(Array.isArray(f.equip))return f.equip.filter(has).slice(0,MAX_EQUIP);
  return (SKILLS[f.id]||[]).filter(s=>has(s.id)).sort((a,b)=>f.skills[b.id]-f.skills[a.id]).slice(0,MAX_EQUIP).map(s=>s.id);}
function toggleEquip(G,id,sk){const f=G.F[id];const dd=skillDef(id,sk);if(!(f.skills[sk]>0)||(dd&&dd.passive))return false;let e=equipped(f);if(e.includes(sk))e=e.filter(x=>x!==sk);else{if(e.length>=MAX_EQUIP)return false;e.push(sk);}f.equip=e;return true;}

function baseFighter(id,d){return {id,name:d.name,full:d.full,div:d.div,camp:d.camp,color:d.color,potential:d.potential,wage:d.wage||0,fee:d.fee||0,
  canon:!!CANON[id],a:{...d.a},fatigue:10,injury:0,morale:60,trust:id==="kati"?40:20,bond:id==="kati"?20:0,
  rec:{w:0,l:0,d:0},form:[],plan:{preset:"balanced",intensity:"normal"},lastFight:-9,gains:{},met:id==="kati",
  xp:0,lvl:1,sp:0,skills:id==="ploy"?{kr_swing:2,captain:1}:id==="fah"?{tiger:1,reckless:1}:{},know:{}};}

// ---------- TRAINING ----------
const PRESETS={
  balanced:{name:"Balanced",w:Object.fromEntries(ATTRS.map(([k])=>[k,.22])),load:2,desc:"Improves everything evenly, but slower than a focused program"},
  punch:{name:"Punch focus",w:{punch:1,power:.5,counter:.5,speed:.3},load:2,desc:"Puncher: punches, power, counters"},
  kick:{name:"Kick focus",w:{kick:1,foot:.6,speed:.4},load:2,desc:"Kicker: kicks, footwork, speed"},
  knee:{name:"Knee-Clinch",w:{knee:1,clinch:1,stamina:.4},load:2.5,desc:"Knee fighter: neck lock, knees, stamina"},
  elbow:{name:"Elbow-Inside",w:{elbow:1,clinch:.5,power:.5},load:2.5,desc:"Elbow fighter: close range, explosive power"},
  defense:{name:"Defense-Counter",w:{guard:1,counter:.8,iq:.6,comp:.3},load:1.5,desc:"Technician: guard, reading, composure"},
  cond:{name:"Conditioning",w:{stamina:1,power:.6,speed:.6,dur:.5},load:3,desc:"Running, skipping, weights. Very tiring"},
  prep:{name:"Fight prep",w:{iq:.4,comp:.4},load:.7,desc:"Lighter load, game-plan drills (+readiness for next fight)"},
  rest:{name:"Recovery",w:{},load:0,desc:"Faster fatigue recovery, better morale"},
};
const INTENSITY={light:{name:"Light",g:.6,l:.6},normal:{name:"Normal",g:1,l:1},heavy:{name:"Hard",g:1.4,l:1.5}};

// v1.32: one formula for "fatigue after this week", used by both the engine and the UI (training card, coach advice)
function fatigueAfter(G,f,preset,intensity){const fx=G.fac,clin=fx.clinic||0,hill=fx.hill||0,st=G.staff||[];let v=f.fatigue;
  if(st.includes("jan"))v-=4;if(fx.sauna)v-=3*fx.sauna;v=clamp(v,0,100);
  if(f.injury>0)return clamp(v-15-fx.recovery*5-fx.kitchen*2-clin*3,0,100);
  const p=PRESETS[preset],it=INTENSITY[intensity]||INTENSITY.normal;let load=p.load*it.l*7*(preset==="cond"?1-hill*.08-(st.includes("tong")?.1:0):1);
  {const pm=passiveMods(f);load*=clamp(1-pm.fatAll-(preset==="kick"?pm.fatKick:0),.4,1);}
  return clamp(v+load-(10+fx.recovery*5+fx.kitchen*2+clin*3)-(preset==="rest"?22:0),0,100);}
function trainWeek(G,f,rng){
  const p=PRESETS[f.plan.preset],it=INTENSITY[f.plan.intensity];f.gains={};
  f.xpGain=0;
  const fx=G.fac,clin=fx.clinic||0,hill=fx.hill||0,st=G.staff||[];
  if(f.camp==="player")f.facPrep=(fx.video||0)*.008+(st.includes("wit")?.012:0);
  if(st.includes("jan"))f.fatigue=clamp(f.fatigue-4,0,100),f.morale=clamp(f.morale+1,0,100);
  if(fx.shrine)f.morale=clamp(f.morale+2*fx.shrine,0,100);
  if(fx.sauna)f.fatigue=clamp(f.fatigue-3*fx.sauna,0,100),f.morale=clamp(f.morale+fx.sauna,0,100);
  if(fx.hall)f.morale=clamp(f.morale+fx.hall,0,100);
  if(f.injury>0){f.injury--;if(f.injury>0&&clin&&rng()<.3*clin)f.injury--;f.fatigue=clamp(f.fatigue-15-G.fac.recovery*5-G.fac.kitchen*2-clin*3,0,100);gainXP(G,f,2);if(f.injury===0)G.log.push(`${f.name} has recovered from injury`);return;}
  gainXP(G,f,f.plan.preset==="rest"?3:Math.round(6+8*it.g));
  f.trainLog=(f.trainLog||[]).concat([f.plan.preset]).slice(-4);
  // v1.15: Kati's answer to talent — every honest training week builds "grit" that shows on fight night
  if(f.id==="kati"&&f.plan.preset!=="rest"&&f.plan.preset!=="prep")f.grit=Math.min(.1,(f.grit||0)+(f.plan.intensity==="heavy"?.004:f.plan.intensity==="normal"?.003:.0015));
  const pr=f.plan.preset,spec=st.some(k=>STAFF[k].pre===pr||STAFF[k].pre2===pr);
  const coach=dif(G).train*(1+st.length*.02+(G.fac.daeng-1)*.05+(spec?.1:0))+(pr==="cond"?hill*.2:0),fac=1+G.fac.gym*.1+(G.fac.lights||0)*.06;
  const ms=mainStyle(f),core=pr===ms?STYLE_ATTRS[ms]:[];
  const ready=1-f.fatigue/160,mot=.8+f.morale/250;
  for(const [k,w] of Object.entries(p.w)){
    // v1.18: training your own style's core weapons fights diminishing returns less (style mastery path)
    const dim=1-Math.pow(f.a[k]/(f.potential+(core.includes(k)?CK:1.5)),2.2);
    const g=.5*w*it.g*coach*fac*ready*mot*clamp(dim,.04,1)*(.75+rng()*.5)*(f.id==="kati"?1.2:1)*(1+(f.drillBonus||0));
    if(g>0){f.a[k]=Math.min(20,f.a[k]+g);f.gains[k]=g;}
  }
  f.drillBonus=0;
  let load=p.load*it.l*7*(pr==="cond"?1-hill*.08-(st.includes("tong")?.1:0):1);{const pm=passiveMods(f);load*=clamp(1-pm.fatAll-(pr==="kick"?pm.fatKick:0),.4,1);}
  f.fatigue=clamp(f.fatigue+load-(10+G.fac.recovery*5+G.fac.kitchen*2+clin*3)-(f.plan.preset==="rest"?22:0),0,100);
  if(f.plan.preset==="rest")f.morale=clamp(f.morale+3,0,100);
  // v1.38: a rest week is one week: once recovered she goes back to what she was training before
  if(pr!=="rest"&&pr!=="prep")f.lastWork=pr;
  else if(pr==="rest"&&f.fatigue<=25&&!f.injury){f.plan.preset=f.lastWork||"balanced";G.log.push(`${f.name} has recovered and goes back to training "${PRESETS[f.plan.preset].name}"`);}
  f.prepBonus=f.plan.preset==="prep";
  {const nb=G.bookings.filter(b=>b.a===f.id&&b.week>=G.week).sort((x,y)=>x.week-y.week)[0];const sc=!!(nb&&G.scout&&G.scout[nb.b]!=null&&G.week-G.scout[nb.b]<=8);const hit=!!(nb&&sc&&f.plan.preset===counterPreset(G.F[nb.b]));
   // v1.14: counter work done before fight week carries into fight night if that week is spent on fight prep
   f.counterPrep=hit||!!(nb&&nb.week===G.week&&f.plan.preset==="prep"&&f.counterPrep);}
  if(f.fatigue>70&&rng()<(f.fatigue-70)/110*(1-G.fac.kitchen*.2)){f.injury=2+Math.floor(rng()*2);G.log.push(`⚠ ${f.name} picked up a minor training injury (rest ${f.injury} wk)`);
    if(f.plan.intensity==="heavy")f.trust=clamp(f.trust-4,0,100);}
  if(f.fatigue>80&&f.plan.intensity==="heavy")f.trust=clamp(f.trust-2,0,100);
  f.morale+=(60-f.morale)*.08;
}
function npcGrow(f,rng,rate){for(const [k] of ATTRS){if(f.a[k]<f.potential&&rng()<rate)f.a[k]=Math.min(20,f.a[k]+.5);} }
function condition(f){return clamp(Math.round(100-f.fatigue*.7-(f.injury?40:0)),0,100);}

// ---------- FIGHT ENGINE ----------
const PLANS={
  balanced:{name:"Balanced",aggr:0,desc:"Adapt to the fight"},
  pressure:{name:"Pressure",aggr:.25,w:{punch:1.3,elbow:1.3},sta:1.25,desc:"March forward and hunt. Very tiring"},
  counter:{name:"Counter-fighter",aggr:-.15,ctr:.12,desc:"Let them come in, then counter"},
  outside:{name:"Control range",aggr:0,w:{kick:1.6},evade:.06,desc:"Use kicks, keep distance"},
  clinch:{name:"Clinch",aggr:.1,w:{knee:1.6,elbow:1.1},cl:.25,desc:"Wrestle inside, throw knees"},
};
// v1.7 FM-style pre-fight tactics
const TAC={focus:{auto:"As it comes",punch:"Punch",kick:"Kick",knee:"Knee",elbow:"Elbow"},
  pace:{steady:"Steady all fight",fast:"Fast start, finish early",late:"Save energy for the late rounds"},
  target:{head:"Head hunting (strong but hard to land)",body:"Body work (drains their stamina)",legs:"Leg kicks (slows them down)"}};
function aiTac(f,rng){const a=f.a;const w=[["punch",a.punch],["kick",a.kick],["knee",a.knee],["elbow",a.elbow]].sort((x,y)=>y[1]-x[1])[0][0];
  return {focus:rng()<.5?"auto":w,pace:["steady","steady","fast","late"][Math.floor(rng()*4)],target:["head","body","legs"][Math.floor(rng()*3)]};}
const CORNER={
  none:{name:"Stick to the plan"},
  push:{name:"Push the pressure",aggr:.2,sta:1.2,hint:"More points, but tires faster"},
  counter:{name:"Wait and counter",aggr:-.1,ctr:.1,hint:"Safer, fewer strikes thrown"},
  range:{name:"Keep range, kick more",w:{kick:1.5},evade:.05,hint:"Good vs inside fighters"},
  clinch:{name:"Clinch",w:{knee:1.5},cl:.2,hint:"Good vs kickers"},
  defend:{name:"Defend, protect the lead",aggr:-.25,guard:.08,sta:.8,hint:"Use when ahead, recovers energy"},
};
const W_INFO={punch:{imp:5,pts:2,cost:1.6},kick:{imp:6,pts:3,cost:2.4},knee:{imp:6.5,pts:3,cost:2.2},elbow:{imp:7.5,pts:2.5,cost:1.8}};
const TXT={
  punch:["throws a straight punch to the face","slams a hook to the jaw","fires a punch combo on target","counters with an uppercut"],
  kick:["lands a thunderous body kick","chops a low kick into the thigh","whips a high kick past the face","teeps straight into the midsection"],
  knee:["drives a knee into the solar plexus","locks the neck and knees the ribs","jumps in with a flying knee to the body"],
  elbow:["slices an elbow down onto the forehead","swings a cutting elbow into the cheekbone","spins a back elbow past the eyebrow"],
  miss:["slips it in time","catches it on the guard","steps out of range","sways away"],
};
// v1.12: training the right counter for the next opponent pays off on fight night
function oppTop(op){return [["punch",op.a.punch],["kick",op.a.kick],["knee",op.a.knee],["elbow",op.a.elbow]].sort((x,y)=>y[1]-x[1])[0][0];}
const COUNTER_OF={punch:"defense",kick:"knee",knee:"kick",elbow:"kick"};
// v1.15: the counter is read from the whole opponent, not just her top weapon
const COUNTER_WHY={defense:"Heavy hands: tight guard, then counter",knee:"Kicks to control range: close in and smother the kicks",kick:"Loves the inside: keep range with kicks",elbow:"Loose guard: inside elbows land easily",cond:"Relentless pressure: needs the gas tank to match"};
function counterScores(op){const a=op.a;return {defense:(a.punch+a.power)/2,knee:a.kick*.9+(15-a.clinch)*.3,kick:(a.knee+a.clinch)/2,elbow:a.elbow*.6+(15-a.guard)*.6,cond:(a.stamina+a.power)/2*.88};}
function counterPreset(op){if(!op)return null;const S=counterScores(op);return Object.keys(S).sort((x,y)=>S[y]-S[x])[0];}
// v1.18 style mastery: once a fighter's own style weapon is good enough, it lands cleaner and harder (player camp)
const STYLE_MAIN={kati:"punch",mali:"kick",rin:"defense",ploy:"knee",fah:"elbow"};
const STYLE_ATTRS={punch:["punch","power"],kick:["kick","foot"],knee:["knee","clinch"],elbow:["elbow","power"],defense:["guard","counter"]};
const STYLE_NAME={punch:"Punch",kick:"Kick",knee:"Knee-Clinch",elbow:"Elbow",defense:"Defense-Counter"};
function styleVal(f,s){const A=STYLE_ATTRS[s];return (f.a[A[0]]*2+f.a[A[1]])/3;}
function mainStyle(f){if(STYLE_MAIN[f.id])return STYLE_MAIN[f.id];return Object.keys(STYLE_ATTRS).sort((x,y)=>styleVal(f,y)-styleVal(f,x))[0];}
const MASTERY_AT=13,MK=2,CK=3.5;
function mastery(f){if(f.camp!=="player")return 0;const v=styleVal(f,mainStyle(f));return v<MASTERY_AT?0:.3+.7*clamp((v-MASTERY_AT)/4,0,1);}
function fightSide(f,plan,rng){const sk=skillMods(f);{const m=mastery(f)*MK,s=mainStyle(f);if(m){if(s==="defense"){sk.evade+=.04*m;sk.ctr+=.06*m;sk.ctrDmg+=.25*m;}else{const w=s;sk.hit[w]=(sk.hit[w]||0)+.05*m;sk.dmg[w]=(sk.dmg[w]||0)+.2*m;sk.pts[w]=(sk.pts[w]||0)+.1*m;}}}if(f.aura)sk.evade+=f.aura*.5;const gr=f.grit||0;if(gr)sk.evade+=gr*.4;
  return {f,id:f.id,name:f.name,plan,instr:"none",hp:100-(f.injury?15:0)+Math.round(gr*30),sta:clamp(100-f.fatigue*.4,40,100),pts:0,rpts:0,kd:0,cuts:0,
    thrown:0,landed:0,dmgDealt:0,legs:0,tac:{focus:"auto",pace:"steady",target:"head"},sk,prep:(f.prepBonus?.04:0)+(f.counterPrep?.05:0)+sk.prep+(f.aura||0)+(f.grit||0)+(f.labPrep||0)+(f.camp==="player"?(f.facPrep||0):0),counterPrep:!!f.counterPrep,mor:(f.morale-60)/400+sk.mor,wl:{punch:0,kick:0,knee:0,elbow:0}};
}
function aiPlan(f,opp,rng){
  const a=f.a;const opts=[["balanced",1],["pressure",(a.punch+a.elbow+a.power)/30],["counter",(a.counter+a.iq)/22],["outside",(a.kick+a.foot)/22],["clinch",(a.knee+a.clinch)/22]];
  return pickW(rng,opts.map(([k,v])=>[k,Math.pow(v,3)]));
}
function newFight(fa,fb,o){
  const rng=mulberry32(o.seed);const SA=fightSide(fa,o.planA||aiPlan(fa,fb,rng),rng),SB=fightSide(fb,o.planB||aiPlan(fb,fa,rng),rng);
  // v1.20: a canon rival fights a level above herself on final night
  if(o.tier==="final"){for(const S of [SA,SB])if(S.f.canon&&S.f.camp==="rival")S.prep+=.05;}
  if(fa.ployNotes&&fb.id==="ploy")SA.prep+=.025;if(fb.ployNotes&&fa.id==="ploy")SB.prep+=.025; // Rin's notebook on Ploy
  return {seed:o.seed,rng,rounds:o.rounds,round:0,tier:o.tier,A:SA,B:SB,
    cards:[],logs:[],over:false,result:null,forceRage:!!o.forceRage};
}
function setTactics(F,tA){F.A.tac={focus:"auto",pace:"steady",target:"body",...(tA||{})};F.B.tac=aiTac(F.B.f,F.rng);}
function mods(s,F){const p=PLANS[s.plan],c=CORNER[s.instr]||{};const cm=1+((s.sk&&s.sk.corner)||0);
  const w={punch:1,kick:1,knee:1,elbow:1};if(p.w)for(const k in p.w)w[k]*=p.w[k];if(c.w)for(const k in c.w)w[k]*=1+(c.w[k]-1)*cm;
  const t=s.tac||{};if(t.focus&&t.focus!=="auto")w[t.focus]*=1.7;
  let pa=0,ps=1;if(F){const r=F.round,n=F.rounds;if(t.pace==="fast"){pa=r<=2?.15:-.08;ps=r<=2?1.15:1;}if(t.pace==="late"){pa=r>=n-1?.2:-.1;ps=r>=n-1?1.1:.85;}}
  return {aggr:(p.aggr||0)+(c.aggr||0)*cm+pa,ctr:(p.ctr||0)+(c.ctr||0)*cm,evade:(p.evade||0)+(c.evade||0)*cm,cl:(p.cl||0)+(c.cl||0)*cm,guard:(c.guard||0)*cm,sta:(p.sta||1)*(c.sta?1+(c.sta-1)*cm:1)*ps,w};}
// v1.10 corner care: what the fighter needs this break, in order (water · massage · wipe · cheer)
const CARE={water:{icon:"💧",name:"Water"},rub:{icon:"💆",name:"Muay oil massage"},wipe:{icon:"🧻",name:"Wipe the face"},cheer:{icon:"💪",name:"Encourage"}};
function careNeeds(F){const A=F.A,B=F.B,r=mulberry32(F.seed+F.round*977);const sc=k=>({water:100-A.sta,rub:(A.sta<60?20:0)+B.rw.kick*4,wipe:B.rdmg*1.5+B.rlanded*3,cheer:(F.cards.reduce((s,c)=>s+c[1]-c[0],0))*25+(A.hp<50?20:0)}[k])+r()*30;
  return Object.keys(CARE).sort((a,b)=>sc(b)-sc(a)).slice(0,3);}
function applyCare(F,q){const A=F.A;A.sta=clamp(A.sta+q*9,0,100);A.hp=clamp(A.hp+q*4,0,100);A.careMor=q>=1?.02:0;return q;}
function throwTowel(F){if(F.over)return;F.over=true;F.result={win:"B",type:"Corner throws in the towel",round:F.round};}
function aiCorner(F,me,op){ if(F.round===0)return "none";
  const lead=me.pts-op.pts;if(me.sta<35)return "defend";if(lead>4)return "defend";if(lead<-3)return "push";
  if(op.f.a.kick>op.f.a.knee+2)return "clinch";if(op.f.a.clinch>op.f.a.kick+2)return "range";return "none";}
// v1.19: a round is simulated exchange by exchange so a skill pressed mid-round changes what comes next
const EX_PER_ROUND=12;
function roundBegin(F){F.round++;F.A.rpts=0;F.B.rpts=0;F.kd0={A:F.A.kd,B:F.B.kd};F.ex=0;F.rlog=[];
  F.mA=mods(F.A,F);F.mB=mods(F.B,F);for(const s of [F.A,F.B]){s.rw={punch:0,kick:0,knee:0,elbow:0};s.rdmg=0;s.rthrown=0;s.rlanded=0;s.skRound=false;}}
const roundDone=F=>F.over||F.ex>=EX_PER_ROUND;
function fightRound(F){roundBegin(F);while(!roundDone(F))fightEx(F);return roundFinish(F);}
// ---------- active skills (v1.19) ----------
// every learned school skill can be fired once per fight (max one per round): attack burst, guard burst or second wind
function skillKind(sk){const e=sk.fx(1);const wk=e.hit||e.pts||e.dmg;if(wk)return {k:"atk",w:Object.keys(wk)[0]};if(e.evade||e.ctr||e.clDef||e.ctrDmg)return {k:"def"};return {k:"rec"};}
const SKILL_KIND_NAME={atk:"Finishing attack",def:"Defend & counter",rec:"Recover energy"};
function fightSkills(s){const L=SKILLS[s.f.id]||[],eq=equipped(s.f);return L.filter(k=>eq.includes(k.id)).map(k=>({...k,r:s.f.skills[k.id],...skillKind(k)}));}
function useSkill(F,s,id){const o=s===F.A?F.B:F.A;s.skUsed=s.skUsed||{};if(F.over||s.skRound||s.skUsed[id])return null;const sk=fightSkills(s).find(k=>k.id===id);if(!sk)return null;
  s.skUsed[id]=true;s.skRound=true;const pw=(.7+.15*sk.r)*(s.f.camp==="player"?1.1:F.dai||.8);
  if(sk.k==="atk"){s.burst={k:"atk",w:sk.w,left:4,pw};s.sta=clamp(s.sta-6,0,100);}
  if(sk.k==="def")s.burst={k:"def",left:4,pw};
  if(sk.k==="rec"){s.sta=clamp(s.sta+22*pw,0,100);s.hp=clamp(s.hp+6*pw,0,100);s.mor+=.01;s.burst=null;}
  return {ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name} uses "${sk.name}"!`,k:"big",ev:"skill",rid:s.f.id,an:s.name,dn:o.name,skn:sk.name,skk:sk.k,w:sk.w};}
function aiSkill(F,s,rng){if(s.skRound||F.over)return null;const L=fightSkills(s).filter(k=>!(s.skUsed&&s.skUsed[k.id]));if(!L.length)return null;
  const o=s===F.A?F.B:F.A,ex=F.ex,last=F.round>=F.rounds;const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0;
  const rec=L.find(k=>k.k==="rec"),atk=L.find(k=>k.k==="atk"),def=L.find(k=>k.k==="def");
  if(rec&&s.sta<38&&ex>=2)return useSkill(F,s,rec.id);
  if(def&&o.burst&&o.burst.k==="atk"&&rng()<.5)return useSkill(F,s,def.id);
  if(ex<3)return null;
  const p=(last?.3:.1)+(behind?.12:0)+(F.round>=2?.05:0);
  if(rng()<p){const k=atk||def||rec;return useSkill(F,s,k.id);}
  return null;}
function fightEx(F){const rng=F.rng,log=[],ex=F.ex,mA=F.mA,mB=F.mB;
  for(const s of [F.A,F.B])if(s.autoSkill!==false){const e=aiSkill(F,s,rng);if(e)log.push(e);}
  {
    // v1.5 "blood boiling" mode: a canon fighter who is hurt and behind can snap once per fight
    for(const s of [F.A,F.B]){{const o=s===F.A?F.B:F.A;if(s.f.canon&&(s.f.camp==="player"||o.f.canon)&&!s.rageUsed&&ex>2){const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0||s.kd>0;
      // v1.10: easier to trigger (hurt OR behind), and guaranteed in round 2 of the player's first fight
      const forced=F.forceRage&&s===F.A&&s.f.camp==="player"&&F.round>=2&&ex>=4;
      const need=(s.hp<62&&behind)||s.hp<45||(F.round>=2&&behind&&s.hp<75);
      if(forced||(need&&rng()<(s.f.camp==="player"?.03+(s.f.bond||0)/1500+(s.f.morale||60)/2400:.08))){s.rageUsed=true;s.rage=4;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name} — the eyes change! Blood-boil mode!`,k:"big",ev:"rage",rid:s.f.id,an:s.name,dn:o.name});}}}}
    const ini=s=>{const a=s.f.a,m=s===F.A?mA:mB;return -s.legs/12+a.speed*.3+a.foot*.15+a.iq*.2+a.comp*.1+m.aggr*10+rng()*9+(s.sta-60)/12;};
    const [at,df]=ini(F.A)>=ini(F.B)?[F.A,F.B]:[F.B,F.A];const ma=at===F.A?mA:mB,md=at===F.A?mB:mA;
    const a=at.f.a,d=df.f.a;
    // clinch?
    const clinch=rng()<clamp(.12+ma.cl+(a.clinch-d.foot)*.02,.03,.55);
    const items=clinch?[["knee",a.knee*ma.w.knee],["elbow",a.elbow*ma.w.elbow*.8]]:
      [["punch",a.punch*ma.w.punch],["kick",a.kick*ma.w.kick],["knee",a.knee*ma.w.knee*.5],["elbow",a.elbow*ma.w.elbow*.6]];
    const bA=at.burst&&at.burst.k==="atk"?at.burst:null,bD=df.burst&&df.burst.k==="def"?df.burst:null;
    const wpn=pickW(rng,items.map(([k,v])=>[k,Math.pow(v,1.6)*(bA&&bA.w===k?4:1)]));
    const atk=a[wpn]*.7+a.speed*.15+a.iq*.15;
    const def=clinch?((d.clinch+df.sk.clDef)*.5+d.guard*.3+d.iq*.2):(d.guard*.5+d.foot*.3+d.iq*.2);
    const fatA=(100-at.sta)/100*.22,fatD=(100-df.sta)/100*.12;
    const fury=at.f&&at.f.id==="fah"?clamp((60-at.hp)/50,0,1):0; // v1.38: Fah gets more dangerous the more she is hurt
    if(fury>.4&&!at.wake){at.wake=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${at.name} smiles through the blood… the more she's hurt, the fiercer she gets! Her eyes have changed!`,k:"big",ev:"wake",an:at.name,dn:df.name});}
    const hitP=clamp(.42+fury*.04+(atk-def)*.03+at.prep+at.mor+(at.careMor||0)-fatA+fatD-md.evade-md.guard-df.sk.evade+(at.sk.hit[wpn]||0)+(at.hp<45?at.sk.clutch:0)+(at.rage?.1:0)-(at.tac.target==="head"?.015:0)+df.legs/400+(bA&&bA.w===wpn?.12*bA.pw:0)-(bD?.12*bD.pw:0),.12,.9);
    at.thrown++;at.rthrown++;at.sta=clamp(at.sta-W_INFO[wpn].cost*(1.25-a.stamina/40)*ma.sta*(1+Math.max(0,ma.aggr))*(1-at.sk.staSave),0,100);
    const tx=TXT[wpn][Math.floor(rng()*TXT[wpn].length)];
    if(rng()<hitP){
      const crit=rng()<(at.rage?.35:.07);const q=crit?1.6:.6+rng()*.6;if(at.rage)at.rage--;
      let dmg=1.35*W_INFO[wpn].imp*q*(.6+a.power/25)*(1-d.guard/70)*(1.25-d.dur/40)*(1+(at.sk.dmg[wpn]||0))*(bA&&bA.w===wpn?1+.3*bA.pw:1)*(1+fury*.4);const tg=at.tac.target;
      if(tg==="head")dmg*=1.1;if(tg==="body"){dmg*=.9;df.sta=clamp(df.sta-dmg*.9,0,100);}if(tg==="legs"&&(wpn==="kick"||wpn==="knee")){dmg*=.85;df.legs=Math.min(60,df.legs+dmg*.8);}
      // v1.32 "flash knockout": a clean crit to the head can drop anyone early — rarer for durable/guarded fighters, likelier when the attacker clearly outclasses
      if(crit&&tg!=="body"&&(wpn!=="punch"||a.power>=10)&&rng()<clamp(.16+(ovr(a)-ovr(d))*.06-(d.dur-8)*.012,.05,.4)){dmg+=10+rng()*8;at.flash=1;}
      at.rw[wpn]++;at.rdmg+=dmg;at.rlanded++;
      df.hp-=dmg;at.landed++;at.wl[wpn]++;at.dmgDealt+=dmg;const p=W_INFO[wpn].pts*q*(1+(at.sk.pts[wpn]||0));at.pts+=p;at.rpts+=p;
      log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${at.name} ${tx}${crit?" — clean hit!":""}`,k:crit?"big":"hit",ev:"hit",w:wpn,cl:clinch,crit,an:at.name,dn:df.name});
      if(wpn==="elbow"&&q>1.3&&rng()<.25){df.cuts++;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${df.name} is cut by an elbow, bleeding over the eyebrow`,k:"warn",ev:"cut",an:at.name,dn:df.name});
        if(df.cuts>=2&&rng()<.5){F.over=true;F.result={win:at===F.A?"A":"B",type:"TKO (doctor stoppage)",round:F.round};}}
      if(!F.over&&df.hp<=0){at.flash=0;F.over=true;F.result={win:at===F.A?"A":"B",type:rng()<.5?"KO":"TKO",round:F.round};
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} goes down and can't get up! The referee waves it off`,k:"big",ev:"ko",an:at.name,dn:df.name});}
      else if(!F.over&&at.flash){at.flash=0;df.kd++;at.pts+=3;at.rpts+=3;
        if(df.hp<62||df.kd>=2||rng()<.18){F.over=true;F.result={win:at===F.A?"A":"B",type:"KO",round:F.round};
          log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} drops instantly! The referee counts to ten, knockout in round ${F.round}!`,k:"big",ev:"ko",an:at.name,dn:df.name});}
        else log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} goes down! Back up before the count of ten`,k:"big",ev:"kd",an:at.name,dn:df.name});}
      else if(!F.over&&df.hp<40&&dmg>6&&rng()<.35){df.kd++;df.hp+=8;at.pts+=3;at.rpts+=3;
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} goes down! The referee starts the count… back on her feet`,k:"big",ev:"kd",an:at.name,dn:df.name});
        if(df.kd>=3){F.over=true;F.result={win:at===F.A?"A":"B",type:"TKO (3 knockdowns)",round:F.round};}}
    } else {
      const ctrP=clamp(d.counter/20*.32+md.ctr-fatD+df.sk.ctr+(df.rage?.2:0)+(bD?.18*bD.pw:0),0,.8);
      if(rng()<ctrP){const cw=d.kick>d.punch&&!clinch?"kick":"punch";
        const rc=!!df.rage;if(df.rage)df.rage--;const dmg=1.3*W_INFO[cw].imp*(rc?1.5:.7+rng()*.5)*(.6+d.power/25)*(1-a.guard/70)*(1.25-a.dur/40)*(1+df.sk.ctrDmg);
        at.hp-=dmg;df.landed++;df.thrown++;df.wl[cw]++;df.dmgDealt+=dmg;df.rw[cw]++;df.rdmg+=dmg;df.rlanded++;df.rthrown++;const p=W_INFO[cw].pts*.9;df.pts+=p;df.rpts+=p;
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${at.name} misses — ${df.name} counters with ${cw==="kick"?"kick":"Punch"} Clean hit!${rc?" Critical!":""}`,k:rc?"big":"hit",ev:"counter",crit:rc,w:cw,mw:wpn,an:df.name,dn:at.name});
        if(at.hp<=0){F.over=true;F.result={win:df===F.A?"A":"B",type:"KO",round:F.round};log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} is down and not getting up! Knockout win`,k:"big",ev:"ko",an:df.name,dn:at.name,koSide:df===F.A?"A":"B"});}
      } else if(rng()<.45) log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} ${tx} but ${df.name} ${TXT.miss[Math.floor(rng()*4)]}`,k:"miss",ev:"miss",w:wpn,cl:clinch,mside:at===F.A?"A":"B",an:at.name,dn:df.name});
    }
    for(const s of [F.A,F.B])s.sta=clamp(s.sta+.4+s.f.a.stamina/70+s.sk.regen,0,100);
    for(const s of [F.A,F.B])if(s.burst&&--s.burst.left<=0)s.burst=null;
  }
  F.ex++;F.rlog.push(...log);return log;}
function roundFinish(F){const log=F.rlog,kd0=F.kd0;for(const s of [F.A,F.B])s.burst=null;
  // judges
  const dif=(F.A.rpts-F.B.rpts)+(F.B.kd-kd0.B-(F.A.kd-kd0.A))*3;
  let card=[10,10];if(dif>.4)card=[10,9];if(dif<-.4)card=[9,10];
  if(F.B.kd>kd0.B&&dif>4)card=[10,8];if(F.A.kd>kd0.A&&dif<-4)card=[8,10];
  F.cards.push(card);F.logs.push(log);
  for(const s of [F.A,F.B])s.sta=clamp(s.sta+16+s.f.a.stamina*.8,0,100),s.hp=clamp(s.hp+2,0,100);
  if(!F.over&&F.round>=F.rounds){F.over=true;const tA=F.cards.reduce((x,c)=>x+c[0],0),tB=F.cards.reduce((x,c)=>x+c[1],0);
    const pd=F.A.pts-F.B.pts;const tie=tA===tB;
    F.result=tie&&Math.abs(pd)<1?{win:"D",type:"Draw",round:F.round}:tie?{win:pd>0?"A":"B",type:"Decision win (on dominance)",round:F.round,score:`${tA}–${tB}`}:{win:tA>tB?"A":"B",type:"Decision win",round:F.round,score:`${Math.max(tA,tB)}–${Math.min(tA,tB)}`};}
  return log;
}
function quickFight(fa,fb,seed,rounds,tacA){const F=newFight(fa,fb,{seed,rounds});F.A.tac=tacA||aiTac(fa,F.rng);F.B.tac=aiTac(fb,F.rng);
  while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}return F;}

// ---------- WORLD ----------
const TIER={local:{name:"Subdistrict",win:4000,lose:2000,rep:1.5},district:{name:"District",win:9000,lose:4500,rep:3},
  semi:{name:"Provincial semi",win:18000,lose:8000,rep:4},final:{name:"Provincial final",win:50000,lose:20000,rep:8},exhibition:{name:"Temple fair fight",win:2500,lose:1500,rep:.5},pro:{name:"Opening-night temple fair bout",win:1500,lose:1000,rep:.5,off:1},evloy:{name:"Loy Krathong Riverside Brawl",win:0,lose:0,rep:.3,off:1},special:{name:"Special cross-division bout",win:8000,lose:4000,rep:2},
  quest:{name:"Off-the-books fight",win:0,lose:0,rep:.4,off:1},dm:{name:"Death Match",win:0,lose:0,rep:.5,off:1},beast:{name:"Wild bout",win:7000,lose:2500,rep:1,off:1},lab:{name:"Vector Gym Challenge",win:18000,lose:8000,rep:3}};
function stageOf(w){return w<=20?"local":w<=40?"district":w<=50?"final":"off";}
const STAGE_NAME={local:"Subdistrict round",district:"District round",final:"Provincial final",off:"Year end"};

function ployAura(w,G){const b=Math.max(0,.42*(1-(w-1)/27));if(!G||!G.F||!G.F.ploy||G.F.ploy.camp!=="rival")return G&&G.F&&G.F.ploy&&G.F.ploy.camp==="player"?0:b;if(G.flags&&G.flags.beatS_ploy===(G.season||1))return b;/* v1.59: the undefeated genius keeps her edge until someone beats her this year */return Math.max(b,w<41?.2:w<49?.14:.05);} // v1.23: Ploy's early edge is gone by week 28
function startLv(f){if(f.id==="ploy")f.aura=ployAura(1);if(f.id==="ploy")f.lvl=5;else if(f.id==="fah")f.lvl=3;else if(f.camp==="npc")f.lvl=clamp(Math.round(ovr(f.a)-7),1,6);}
// v1.22 difficulty: easy = rivals grow slower + more class income; hard = rivals grow faster and use skills harder
const DIFF={easy:{rival:.7,ai:.6,inc:1.2,train:1.12,name:"Easy"},normal:{rival:1,ai:.8,inc:1,train:1,name:"Normal"},hard:{rival:1.12,ai:.95,inc:.9,train:.97,name:"Hard"}};
const dif=G=>DIFF[(G&&G.diff)||"normal"]||DIFF.normal;
// v1.48: seeded "random" for gameplay rolls outside fights, so a shared seed replays the same
function srand(G,salt){return mulberry32((((G&&G.seed)||1)+((G&&G.week)||0)*7919+(salt|0)*104729)>>>0)();}
function newGame(opts){
  const seed=(opts.seed??Math.floor(Math.random()*1e9))>>>0;const rng=mulberry32(seed);
  const G={v:1,seed,week:1,diff:opts.diff||"normal",player:{name:opts.name||"Start",gender:opts.gender||"m"},cash:60000,debt:120000,rep:5,
    fac:{gym:0,recovery:0,classroom:0,brand:0,dorm:0,kitchen:0,hill:0,video:0,ring:0,clinic:0,shrine:0,van:0,sauna:0,lights:0,hall:0,daeng:1,assistants:0},stu:1,staff:[],rankMove:{A:{},B:{}},camp:{beauty:0},campUsed:null,levelUps:[],avatar:opts.avatar||null,F:{},rank:{A:{},B:{}},qual:{A:[],B:[]},finalists:{A:[],B:[]},semis:{A:[],B:[]},champ:{},
    bookings:[],offers:[],log:[],flags:{},seen:{},freeUsed:false,negWeeks:0,history:[],ended:null,lastReport:null,romance:null};
  for(const [id,d] of Object.entries(CANON))G.F[id]=baseFighter(id,d);
  for(const div of ["A","B"])NPC_NAMES[div].forEach(([n,l],i)=>{const id=`n${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i));});
  for(const f of Object.values(G.F))startLv(f);
  for(const f of Object.values(G.F))if(f.camp!=="player"&&f.camp!=="free")G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
  G.rank.A.kati={pts:0,w:0,l:0,d:0};
  // v1.22 difficulty also moves where the two stars start
  {const d=G.diff;for(const id of ["ploy","fah"]){const adj=(d==="easy"?-.7:d==="hard"?.35:0)+(id==="ploy"?-.8:-1.5);/* v1.23: stars start lower, grow when beaten */const f=G.F[id];if(!f)continue;for(const [k] of ATTRS)f.a[k]=clamp(f.a[k]+adj,1,20);f.potential+=adj*.8;}}
  return G;
}
const roster=G=>Object.values(G.F).filter(f=>f.camp==="player");
const wageOf=f=>Math.round(f.wage*(1+((f.lvl||1)-1)*.06)/100)*100; // v1.43: stars ask for more as they level up
const wages=G=>roster(G).reduce((s,f)=>s+wageOf(f),0)+(G.staff?G.staff.reduce((s,k)=>s+STAFF[k].wage,0):G.fac.assistants*2500);
// ---------- CAMP FACILITIES & STUDENTS ----------
const FACILITIES={
  gym:{name:"Training gear",cost:[20000,35000,60000],desc:"Training effect +10% per level"},
  recovery:{name:"Recovery room & ice baths",cost:[15000,30000,50000],desc:"Fatigue recovery +5/wk per level"},
  classroom:{name:"Class yard",cost:[8000,14000,22000,32000,45000],desc:"Holds 3 more students per level"},
  brand:{name:"Signs & camp promotion",cost:[8000,20000,40000,50000],desc:"+3 people want to join per level, fame +0.5"},
  dorm:{name:"Fighter dorm",cost:[18000,40000,60000],desc:"Morale +1.5 and trust +0.3 weekly, per level"},
  kitchen:{name:"Nutrition kitchen",cost:[10000,25000],desc:"Fatigue recovery +2 and 20% lower injury risk per level"},
  // v1.18: bigger projects that open up as the camp grows (late-game money sinks with real effects)
  hill:{name:"Hill-run track behind camp",cost:[20000,45000],desc:"Conditioning +20% and less fatigue per level",req:{week:12}},
  video:{name:"Tape analysis room",cost:[30000,60000],desc:"Fight readiness +0.8% per level · scouting tapes half price",req:{rep:15}},
  ring:{name:"Standard ring in camp",cost:[45000,90000],desc:"EXP +15% per level · +3 wanting to join · +1 trainer slot",req:{lv:2}},
  clinic:{name:"Physio clinic",cost:[35000,70000],desc:"Fatigue recovery +3/wk · faster injury healing, per level",req:{week:20}},
  shrine:{name:"Camp spirit shrine",cost:[30000],desc:"Morning wai khru, everyone's morale +2/wk · fame +1",req:{rep:22}},
  // v1.23: late-season money sinks, opened week by week so a full camp lands around week 45
  van:{name:"Songthaew student shuttle",cost:[20000,35000],desc:"+4 wanting to join per level",req:{week:24}},
  sauna:{name:"Herbal sauna",cost:[30000,50000],desc:"Fatigue recovery +3 · morale +1 weekly, per level",req:{week:28}},
  lights:{name:"Night-training floodlights",cost:[40000,60000],desc:"All training +6% per level",req:{week:32}},
  retreat:{name:"Chiang Dao training retreat",cost:[55000],desc:"One-time: take every fighter up the mountain for two weeks. Core stats +0.4, morale +15, fatigue fully cleared.",req:{week:38}},
  hall:{name:"Grandpa Chai Hall of Honor",cost:[50000,80000],desc:"Fame +1.5 · fame fades slower · morale +1/wk",req:{week:36}},
};
const facLocked=(G,k)=>{const r=FACILITIES[k].req;if(!r)return "";if(r.lv&&campLevel(G)<r.lv)return `Camp Lv.${r.lv}`;if(r.rep&&G.rep<r.rep)return `Fame ${r.rep}`;if(r.week&&G.week<r.week&&!(G.season>1))return `Week ${r.week}`;return "";};
// v1.18: hired trainers, each with a speciality and a face (pixel NPC sprite)
const STAFF={
  nok:{name:"Khru Nok",role:"Punch coach",pre:"punch",fee:4000,wage:1500,desc:"Punch training +10%"},
  paeng:{name:"Khru Paeng",role:"Kick coach",pre:"kick",fee:4000,wage:1500,desc:"Kick training +10%"},
  yai:{name:"Khru Yai",role:"Inside coach",pre:"knee",pre2:"elbow",fee:5000,wage:1800,desc:"Knee-clinch and elbow training +10%",req:{rep:8}},
  ying:{name:"Khru Ying",role:"Defense coach",pre:"defense",fee:5000,wage:1800,desc:"Defense-counter training +10%",req:{rep:8}},
  tong:{name:"Coach Tong",role:"Fitness trainer",pre:"cond",fee:6000,wage:2000,desc:"Conditioning +10%, less fatigue",req:{rep:12}},
  jan:{name:"Auntie Jan",role:"Camp masseuse",fee:6000,wage:2000,desc:"Everyone's fatigue −4/wk · morale +1",req:{rep:16}},
  wit:{name:"Ajarn Wit",role:"Game analyst",fee:9000,wage:2500,desc:"Fight readiness +1.2% · free tapes",req:{lv:2}},
};
const staffSlots=G=>1+campLevel(G)+((G.fac.ring||0)>=1?1:0);
const hasStaff=(G,k)=>(G.staff||[]).includes(k);
const staffLocked=(G,k)=>{const r=STAFF[k].req;if(!r)return "";if(r.lv&&campLevel(G)<r.lv)return `Camp Lv.${r.lv}`;if(r.rep&&G.rep<r.rep)return `Fame ${r.rep}`;return "";};
function hireStaff(G,k){const S=STAFF[k];G.staff=G.staff||[];if(!S||hasStaff(G,k)||G.staff.length>=staffSlots(G)||staffLocked(G,k)||G.cash<S.fee)return false;G.cash-=S.fee;G.staff.push(k);G.fac.assistants=G.staff.length;return true;}
function fireStaff(G,k){G.staff=(G.staff||[]).filter(x=>x!==k);G.fac.assistants=G.staff.length;return true;}
function fixSave(G){if(G&&G.flags&&G.flags.beat_ploy&&G.flags.beatS_ploy==null)G.flags.beatS_ploy=G.season||1; /* v1.59: old saves that already beat Ploy keep it */if(G&&G.coachAway&&G.coachAway-G.week>4)G.coachAway=null; /* v1.55.1: a leave from last year must not carry into the new year */
if(G.F)for(const id in G.F){const f=G.F[id];if(f&&hasTree(id)&&!f.spv){f.sp=(f.sp||0)+2*Math.max(0,(f.lvl||1)-1);f.spv=2;}}G.fac=G.fac||{};for(const k of Object.keys(FACILITIES))G.fac[k]=G.fac[k]||0;G.fac.daeng=G.fac.daeng||1;
  if(!G.staff){G.staff=["nok","paeng"].slice(0,G.fac.assistants||0);}G.fac.assistants=G.staff.length;
  if(G.stu==null)G.stu=Math.min(studentCap(G),studentDemand(G));G.mail=G.mail||[];G.cal=G.cal||[];lateSeasonOpposition(G);return G;}
const DAENG_COST=[0,15000,30000];
function facTotal(G){return Object.keys(FACILITIES).reduce((s,k)=>s+(G.fac[k]||0),0)+(G.fac.daeng-1);}
function campLevel(G){const t=facTotal(G);return t>=13?3:t>=5?2:1;}
const CAMP_LV_NAME=["","Run-down old camp","Camp on the mend","Modern Muay Thai camp"];
// v1.23: the class starts with one student and grows a person or two a week; a fully built camp holds 30
const STU_MAX=30;
function studentCap(G){return Math.min(STU_MAX,6+G.fac.classroom*3+(G.fac.daeng-1)*2+Math.min(5,G.staff?G.staff.length:G.fac.assistants));}
function studentDemand(G){return Math.round(3+Math.min(G.rep,30)*.4+G.fac.brand*3+(G.fac.ring||0)*2+(G.fac.van||0)*4+campLevel(G)*2+(G.camp?G.camp.beauty:0)*.4);}
function students(G){if(G.stu==null)G.stu=Math.min(studentCap(G),studentDemand(G));return Math.min(G.stu,studentCap(G));}
function growStudents(G){const t=Math.min(studentCap(G),studentDemand(G)),n=students(G);G.stu=n<t?n+(t-n>=8?2:1):n>t?n-1:n;}
const studentFee=G=>Math.round(dif(G).inc*560*(1+(G.fac.daeng-1)*.12)*(1+(campLevel(G)-1)*.2));
const classIncome=G=>Math.round(students(G)*studentFee(G)*(G.disaster&&G.week<G.disaster.until?(G.disaster.inc||0):1)); // v1.37: floods and storms keep students away
function campLook(G){return clamp(Math.round(facTotal(G)+(G.camp?G.camp.beauty:0)/2+Math.min(G.rep,30)/8),0,20);}
function buyFacility(G,k){const F=FACILITIES[k],lv=G.fac[k]||0;if(lv>=F.cost.length||facLocked(G,k))return false;const c=F.cost[lv];if(G.cash<c)return false;
  G.cash-=c;G.fac[k]=lv+1;if(k==="brand")G.rep+=.5;if(k==="shrine")G.rep+=1;if(k==="hall")G.rep+=1.5;if(k==="retreat")roster(G).forEach(f=>{["punch","kick","knee","elbow","clinch","guard","foot","stamina","power","speed"].forEach(q=>{f.a[q]=Math.min(Math.max(f.a[q],f.potential||18),f.a[q]+.4);});f.morale=Math.min(100,f.morale+15);f.fatigue=0;});return true;}
function upgradeDaeng(G){const lv=G.fac.daeng;if(lv>=3)return false;const c=DAENG_COST[lv];if(G.cash<c)return false;G.cash-=c;G.fac.daeng++;return true;}
const CAMP_ACTIONS={
  rest:{name:"Camp day off (no activity)",desc:"Free, everyone rests, fatigue −4",cost:0},
  // v1.68: minigames live inside camp activities — play it yourself, or skip for an average result
  drum:{name:"Bag kicks to the khong khaek drum",desc:"Rhythm minigame · kick/punch, morale, stardust",skip:"Kick/punch +0.1 · morale +3 · ✦ +2",cost:0,mg:"bag"},
  somtam:{name:"Help at Auntie Taew's som tam stall",desc:"Rhythm minigame · pay, fame, stardust",skip:"Earn ฿550 · morale +3 · ✦ +1",cost:0,mg:"somtam",hidden:true},/* v1.69: now arrives as a job letter; kept so old saves still resolve its name */
  class:{name:"Special Sunday class",desc:"+฿1,000 but fighters help teach, fatigue +6",cost:0},
  promo:{name:"Promote the camp online",desc:"Fame +0.6",cost:1000},
  live:{name:"Camp Merch Live",desc:"Live minigame · profit from sales, fame, stardust",skip:"Earn ฿600 · ✦ +1",cost:0,mg:"live"},
  repair:{name:"Fix up the camp together",desc:"Camp looks better, morale +3",cost:1500},
  merit:{name:"Morning alms offering",desc:"Everyone's morale +5, trust +1",cost:300},
  // v1.13: more activities unlock as the camp's name grows
  clip:{name:"Post training clips on social",desc:"Fame +0.9 · fatigue +3",cost:500,rep:10},
  spar:{name:"In-camp sparring night",desc:"Everyone EXP +25 · fatigue +8",cost:0,rep:16},
  ladies:{name:"Women's Muay Thai fitness class",desc:"+฿2,500 · fatigue +5",cost:0,rep:24},
  massage:{name:"Invite a Thai masseuse to camp",desc:"Fatigue −12 · morale +3",cost:2500,rep:32},
  media:{name:"Host a press feature",desc:"Fame +2 · morale +4",cost:0,rep:44},
  // v1.21: building the camp opens more things to do
  kids:{name:"Kids' Muay Thai class",desc:"+฿1,800 · fame +0.4 · fatigue +3",cost:0,fac:["classroom",2]},
  stall:{name:"Khanom khrok stall at the market",desc:"+฿1,500 · fame +0.3 · morale +2",cost:300,fac:["kitchen",1]},
  tourist:{name:"Teach tourists Muay Thai",desc:"+฿3,500 · fatigue +7",cost:0,fac:["brand",1]},
  trail:{name:"Trail run up Doi Suthep",desc:"Everyone's stamina +0.2 · fatigue +5 · morale +2",cost:200,fac:["hill",1]},
  tape:{name:"Old fight-tape night together",desc:"EXP +15 · free scouting on all booked opponents",cost:0,fac:["video",1]},
  fightnight:{name:"Camp fight night, sell tickets",desc:"+฿4,000 · fame +1 · fatigue +6",cost:0,fac:["ring",1]},
  clinicday:{name:"Clinic recovery day",desc:"Fatigue −15 · injuries heal 1 week faster",cost:1000,fac:["clinic",1]},
  waikhru:{name:"Wai khru ceremony at the shrine",desc:"Everyone's morale +8 · trust +2 · fame +1",cost:3000,fac:["shrine",1]},
};
const campActLocked=(G,a)=>a.rep&&G.rep<a.rep?`Fame ${a.rep}`:a.fac&&(G.fac[a.fac[0]]||0)<a.fac[1]?`${FACILITIES[a.fac[0]].name}${a.fac[1]>1?` level ${a.fac[1]}`:""}`:"";
function doCampAction(G,k){const A=CAMP_ACTIONS[k];if(!A||G.campUsed||G.cash<A.cost||campActLocked(G,A))return null;G.cash-=A.cost;G.campUsed=k;const R=roster(G);let note="";
  if(k==="rest"){R.forEach(f=>f.fatigue=clamp(f.fatigue-4,0,100));note="Everyone gets a breather, fatigue drops a little";}
  if(k==="class"){G.cash+=1000;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="Extra ฿1,000, fighters a little more tired";}
  if(k==="promo"){G.rep+=.6;note="Fame +0.6";}
  if(k==="live"){G.cash+=600;G.dust=(G.dust||0)+1;note="A short live sold a few shirts: ฿600 · ✦ +1";}
  if(k==="drum"){const f=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];if(f){f.a.kick=Math.min(20,f.a.kick+.1);f.a.punch=Math.min(20,f.a.punch+.1);}R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+2;note="Light drills to the khong khaek drum: kick/punch +0.1 · ✦ +2";}
  if(k==="somtam"){G.cash+=550;R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+1;note="Helped Auntie Taew pound som tam: ฿550 · ✦ +1";}
  if(k==="repair"){G.camp.beauty=Math.min(10,G.camp.beauty+1);R.forEach(f=>f.morale=clamp(f.morale+3,0,100));note=`Camp looks nicer (level ${G.camp.beauty}/10)`;}
  if(k==="clip"){G.rep+=.9;R.forEach(f=>f.fatigue=clamp(f.fatigue+3,0,100));note="The clip got shared, fame +0.9";}
  if(k==="spar"){R.forEach(f=>{gainXP(G,f,25);f.fatigue=clamp(f.fatigue+8,0,100);});note="Everyone gains experience +25";}
  if(k==="ladies"){G.cash+=2500;R.forEach(f=>f.fatigue=clamp(f.fatigue+5,0,100));note="Extra ฿2,500 earned";}
  if(k==="massage"){R.forEach(f=>{f.fatigue=clamp(f.fatigue-12,0,100);f.morale=clamp(f.morale+3,0,100);});note="Everyone feels lighter, fatigue −12";}
  if(k==="media"){G.rep+=2;R.forEach(f=>f.morale=clamp(f.morale+4,0,100));note="The camp feature aired, fame +2";}
  if(k==="merit"){R.forEach(f=>{f.morale=clamp(f.morale+5,0,100);f.trust=clamp(f.trust+1,0,100);});note="Everyone's in a better mood";}
  if(k==="kids"){G.cash+=1800;G.rep+=.4;R.forEach(f=>f.fatigue=clamp(f.fatigue+3,0,100));note="The kids' wai khru was adorable, +฿1,800";}
  if(k==="stall"){G.cash+=1500;G.rep+=.3;R.forEach(f=>f.morale=clamp(f.morale+2,0,100));note="Khanom khrok sold out, +฿1,500";}
  if(k==="tourist"){G.cash+=3500;R.forEach(f=>f.fatigue=clamp(f.fatigue+7,0,100));note="The tourists loved it, +฿3,500, but the fighters are pretty worn out";}
  if(k==="trail"){R.forEach(f=>{f.a.stamina=Math.min(20,f.a.stamina+.2);f.fatigue=clamp(f.fatigue+5,0,100);f.morale=clamp(f.morale+2,0,100);});note="The view from the mountain was gorgeous, stamina +0.2";}
  if(k==="tape"){R.forEach(f=>gainXP(G,f,15));G.scout=G.scout||{};for(const b of G.bookings)if(G.F[b.a].camp==="player")G.scout[b.b]=G.week;note="Watched tapes of every booked opponent, EXP +15";}
  if(k==="fightnight"){G.cash+=4000;G.rep+=1;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="Tickets sold out, packed ringside, +฿4,000";}
  if(k==="clinicday"){R.forEach(f=>{f.fatigue=clamp(f.fatigue-15,0,100);if(f.injury>0)f.injury--;});note="Everyone feels lighter, fatigue −15";}
  if(k==="waikhru"){G.rep+=1;R.forEach(f=>{f.morale=clamp(f.morale+8,0,100);f.trust=clamp(f.trust+2,0,100);});note="A powerful wai khru ceremony, everyone's fired up";}
  return note;}
// advisor: estimate win chance per plan
// v1.32 corner odds: replay the rest of the fight from this break with each order, many times — the coach's "win chance" estimate
function cloneFight(F,seed){const side=s=>{const f=s.f;const c=structuredClone({...s,f:null});c.f=f;return c;};
  return {...F,rng:mulberry32(seed),A:side(F.A),B:side(F.B),cards:F.cards.map(c=>c.slice()),logs:[],rlog:[],result:null,kd0:F.kd0?{...F.kd0}:F.kd0};}
function cornerOdds(F,n=14){const out={};for(const k of Object.keys(CORNER)){let w=0;
    for(let i=0;i<n;i++){let C;try{C=cloneFight(F,(F.seed||1)*31+F.round*977+i*13);}catch(e){return null;}
      C.A.instr=k;C.B.instr=aiCorner(C,C.B,C.A);let first=true;
      while(!C.over){if(!first){C.A.instr=aiCorner(C,C.A,C.B);C.B.instr=aiCorner(C,C.B,C.A);}first=false;fightRound(C);}
      if(C.result.win==="A")w++;else if(C.result.win==="D")w+=.5;}
    out[k]=w/n;}return out;}
function advise(G,a,b,rounds,n=40){const fa=G.F[a],fb=G.F[b];const res={};
  for(const plan of Object.keys(PLANS)){let w=0;for(let i=0;i<n;i++){const F=newFight(fa,fb,{seed:9001+i*7,rounds,planA:plan});
    while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}if(F.result.win==="A")w++;else if(F.result.win==="D")w+=.5;}res[plan]=w/n;}
  const best=Object.entries(res).sort((x,y)=>y[1]-x[1])[0];return {rates:res,best:best[0],bestRate:best[1],base:res.balanced};}
// v1.51: camp pets — they join through little stories, wander the yard, and cheer the team up once a week
const PETS={cat:{name:"Orange cat",food:150,eff:"Everyone: morale +2"},dog:{name:"Thai Ridgeback",food:250,eff:"Everyone: fatigue −3"},rooster:{name:"Retired fighting rooster",food:100,eff:"Everyone: morale +1 · fatigue −1"},turtle:{name:"Temple turtle",food:80,eff:"Everyone: morale +3 (calmer minds)"}};
const PET_NAMES={cat:["Pomelo","Bread","Chubbs"],dog:["Blackie","Goldie","Khao Tu"],rooster:["Greenie","King Cluck","Goofy"],turtle:["Slowpoke","Mochi","Abbot"]};
const petFood=G=>(G&&G.pets||[]).reduce((s,p)=>s+(PETS[p.k]?PETS[p.k].food:0),0);
function petPlay(G,i){const p=(G.pets||[])[i];if(!p||p.wk===G.week)return false;p.wk=G.week;p.joy=Math.min(100,(p.joy||50)+10);const R=roster(G);
  if(p.k==="cat")R.forEach(f=>f.morale=Math.min(100,f.morale+2));if(p.k==="dog")R.forEach(f=>f.fatigue=Math.max(0,f.fatigue-3));
  if(p.k==="rooster")R.forEach(f=>{f.morale=Math.min(100,f.morale+1);f.fatigue=Math.max(0,f.fatigue-1);});if(p.k==="turtle")R.forEach(f=>f.morale=Math.min(100,f.morale+3));
  const fav=p.fav&&G.F[p.fav];if(fav&&fav.camp==="player")fav.morale=Math.min(100,fav.morale+3);return true;}
const upkeep=G=>1800+(G?facTotal(G)*220+[0,0,800,1800][campLevel(G)]+petFood(G):0); // v1.43: a bigger camp costs more to run
function weeklyNet(G){return classIncome(G)-upkeep(G)-wages(G);}

function eligible(G,f){const st=stageOf(G.week);
  if(st==="local")return true; if(st==="district")return G.qual[f.div].includes(f.id); return false;}
function isBooked(G,id,week){return G.bookings.some(b=>(b.a===id||b.b===id)&&(week==null||b.week===week));}

const CROSS_OF={kati:"fah",mali:"ploy",rin:"fah"},SPECIAL_WEEKS=[8,13,18,23,28,33,38,42];
const RIVAL_OF={kati:"ploy",mali:"fah"},RIVAL_WEEKS=[25,29,33,36],RIVAL_EARLY={mali:[7,12,17,21]};
// v1.21: promoters keep calling even when a fight is booked (further out), more calls with fame,
// and each batch mixes an easier bout, an even one and (with fame) a step up — a real challenge curve
// v1.43: a plain difficulty label for a matchup
function diffTag(me,op){const d=ovr(op.a)-ovr(me.a)+((op.lvl||1)-(me.lvl||1))*.15;return d<-.6?["easy","Easy"]:d<.35?["even","Even"]:d<1.1?["hard","Hard"]:["vhard","Very hard"];}
const OFFER_BANDS=[-.7,.45,1.4,.9];
function genOffers(G){
  const rng=mulberry32(G.seed+G.week*7919+11);G.snub=G.snub||{};for(const o of G.offers||[])if(!o.beast)G.snub[o.b]=(G.snub[o.b]||0)+1;G.offers=[];const st=stageOf(G.week);
  const stageEnd=st==="local"?20:st==="district"?40:0;const nOff=G.week<=8?1:(2+(G.rep>=30?1:0)); // v1.32: one offer per fighter early, a third only once the camp is famous
  for(const f of roster(G)){
    if(f.injury>0)continue;
    const ranked=(st==="local"||st==="district")&&eligible(G,f);
    const myB=G.bookings.filter(b=>b.a===f.id).map(b=>b.week);
    const weeks=[];for(let wk=G.week+2;wk<=Math.min(48,G.week+5);wk++)if(!myB.some(x=>Math.abs(x-wk)<=1))weeks.push(wk);
    if(!weeks.length)continue;
    const n=myB.length?1:nOff;const used=new Set(G.bookings.filter(b=>b.a===f.id).map(b=>b.b));
    for(let i=0;i<n;i++){
      const wk=myB.length?weeks[weeks.length-1-(i%weeks.length)]:weeks[Math.min(i*2,weeks.length-1)-(i===3&&weeks.length>2?1:0)];
      const tier=ranked&&wk<=stageEnd?st:"exhibition";
      const pool=Object.values(G.F).filter(o=>o.div===f.div&&o.camp!=="player"&&o.camp!=="free"&&o.injury===0&&!used.has(o.id)&&!isBooked(G,o.id,wk)&&(tier==="exhibition"||eligible(G,o)));
      if(!pool.length)continue;
      const c=(G.week<=14?[.4,.8,.5][i%3]:OFFER_BANDS[i%OFFER_BANDS.length])+(i>=3?(rng()-.5)*1.6:0); // early weeks: even fights, losses happen
      const o=pickW(rng,pool.map(x=>{const d=ovr(x.a)-ovr(f.a)+((x.lvl||1)-(f.lvl||1))*.15;return [x,Math.exp(-((d-c)**2)/(2*.45*.45))+.01];}));used.add(o.id);
      // v1.15: purse = fee (paid win or lose) + win bonus; a better opponent, a crowd-drawing name or our own fame raise it
      const mult=clamp(1+(ovr(o.a)-ovr(f.a))*.12,.7,1.6)*(o.canon?1.35:1)*(1+(f.lvl-1)*.04)*(1+Math.min(G.rep,40)/200);
      G.offers.push({id:`o${G.week}_${f.id}_${i}`,a:f.id,b:o.id,week:wk,tier,win:Math.round(TIER[tier].win*mult/100)*100,lose:Math.round(TIER[tier].lose*mult/100)*100});
    }
    // v1.26: every 3 weeks a promoter offers a clearly stronger opponent for a bigger purse
    if(G.week>=9&&G.week<=42&&G.week%3===0){const wk=weeks[weeks.length-1],tier=ranked&&wk<=stageEnd?st:"exhibition";
      const hp=Object.values(G.F).filter(o=>o.div===f.div&&o.camp!=="player"&&o.camp!=="free"&&!o.canon&&o.injury===0&&!used.has(o.id)&&!isBooked(G,o.id,wk)&&(tier==="exhibition"||eligible(G,o)))
        .map(o=>[o,ovr(o.a)-ovr(f.a)+((o.lvl||1)-(f.lvl||1))*.15]).filter(x=>x[1]>=.8&&x[1]<=2.1).sort((a,b)=>Math.abs(a[1]-1.4)-Math.abs(b[1]-1.4));
      if(hp.length){const o=hp[0][0];used.add(o.id);const mult=1.5*clamp(1+(ovr(o.a)-ovr(f.a))*.12,.7,1.6)*(1+(f.lvl-1)*.04)*(1+Math.min(G.rep,40)/200);
        G.offers.push({id:`o${G.week}_${f.id}_h`,a:f.id,b:o.id,week:wk,tier,hard:1,win:Math.round(TIER[tier].win*mult/100)*100,lose:Math.round(TIER[tier].lose*mult/100)*100});}}
    // v1.16: promoters stage cross-division star bouts a few times a season, so every rival pair can meet
    const X=CROSS_OF[f.id];if(X&&SPECIAL_WEEKS.includes(G.week)){const o=G.F[X],wk=G.week+3;
      if(o&&o.camp==="rival"&&!o.injury&&!isBooked(G,o.id,wk)&&!myB.some(x=>Math.abs(x-wk)<=1)&&wk<=47)G.offers.push({id:`o${G.week}_${f.id}_sp`,a:f.id,b:o.id,week:wk,tier:"special",win:TIER.special.win,lose:TIER.special.lose});}
    // v1.23: grudge match — in the district round the promoter keeps asking for the rivalry everyone wants to see
    const RV0=RIVAL_OF[f.id],RV=RV0&&G.F[RV0]&&G.prodigy&&G.prodigy[G.F[RV0].div]?G.prodigy[G.F[RV0].div]:RV0;if(RV&&(RIVAL_WEEKS.includes(G.week)||(RIVAL_EARLY[f.id]||[]).includes(G.week))){const o=G.F[RV],wk=G.week+3;
      if(o&&o.camp==="rival"&&!o.injury&&!isBooked(G,o.id,wk)&&!myB.some(x=>Math.abs(x-wk)<=1)&&!G.offers.some(x=>x.b===RV&&x.a===f.id)){const tier=eligible(G,f)&&eligible(G,o)&&wk<=40?"district":"special";
        G.offers.push({id:`o${G.week}_${f.id}_rv`,a:f.id,b:o.id,week:wk,tier,rv:1,win:Math.round(TIER[tier].win*1.6/100)*100,lose:Math.round(TIER[tier].lose*1.4/100)*100});}}
  }
  // Bangkok's sports-science camp calls out our strongest available fighter in each division.
  if((G.season||1)>=4&&[8,22,35].includes(G.week))for(const opId of (G.season>=5?["pailin","vector_A","vector_B"]:["pailin"])){const op=G.F[opId];if(!op||op.injury>0)continue;
    const fighters=roster(G).filter(f=>f.div===op.div&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));
    for(const f of fighters){const wk=[G.week+2,G.week+3,G.week+4].find(w=>w<=48&&!isBooked(G,op.id,w)&&!G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-w)<=1));
      if(wk&&!G.offers.some(o=>o.a===f.id&&o.b===op.id)){G.offers.push({id:`o${G.week}_${f.id}_${op.id}`,a:f.id,b:op.id,week:wk,tier:"lab",lab:1,win:TIER.lab.win,lose:TIER.lab.lose});break;}}}
  // v1.33: temple-fair bouts every other week: off the ranking, paid later by mail, now and then a cross-division star
  if(G.week>=4&&G.week<=46&&G.week%2===0){const R=roster(G).filter(f=>!f.injury);if(R.length){const f=R[Math.floor(rng()*R.length)];
    const myB=G.bookings.filter(b=>b.a===f.id).map(b=>b.week);const wk=[G.week+1,G.week+2,G.week+3].find(w=>!myB.some(x=>Math.abs(x-w)<=1)&&!G.offers.some(x=>x.a===f.id&&x.week===w));
    if(wk){let o=null,cross=false;const X=G.F[CROSS_OF[f.id]];
      if(G.week>=8&&X&&X.camp!=="player"&&!X.injury&&!isBooked(G,X.id,wk)&&rng()<.35){o=X;cross=true;}
      else{const pool=Object.values(G.F).filter(x=>x.div===f.div&&x.camp!=="player"&&!x.canon&&!x.injury&&!isBooked(G,x.id,wk)).map(x=>[x,Math.abs(ovr(x.a)-ovr(f.a)-.1)]).sort((a,b)=>a[1]-b[1]).slice(0,4);if(pool.length)o=pool[Math.floor(rng()*pool.length)][0];}
      if(o){const m=(1+Math.min(G.rep,50)/80)*(cross?1.6:1);G.offers.push({id:`o${G.week}_${f.id}_fair`,a:f.id,b:o.id,week:wk,tier:"exhibition",fair:1,cross:cross?1:0,win:Math.round(TIER.exhibition.win*m/100)*100,lose:Math.round(TIER.exhibition.lose*m/100)*100});}}}}
}
function acceptOffer(G,oid){const o=G.offers.find(x=>x.id===oid);if(!o)return;
  G.bookings.push({id:"b"+oid,a:o.a,b:o.b,week:o.week,tier:o.tier,rounds:3,win:o.win,lose:o.lose,...(o.fair?{fair:1,cross:o.cross}:{})});
  G.offers=G.offers.filter(x=>!(x.a===o.a&&Math.abs(x.week-o.week)<=1)&&!(x.a===o.a&&x.b===o.b));}

function applyResult(G,F,booking){
  const {A,B}=F;const fa=A.f,fb=B.f,r=F.result,tier=TIER[booking.tier];
  let ret=null;
  for(const [me,op,side] of [[fa,fb,"A"],[fb,fa,"B"]]){
    const res=r.win==="D"?"D":r.win===side?"W":"L";
    const off=tier.off;
    if(off&&me.camp!=="player"){me.lastFight=G.week;continue;}
    if(me.camp==="player"&&op.camp!=="player"&&!off){G.h2h=G.h2h||{};const h=G.h2h[op.id]=G.h2h[op.id]||{w:0,l:0,d:0};h[res==="W"?"w":res==="L"?"l":"d"]++;}
    if(me.camp==="player"&&res==="W")G.dust=(G.dust||0)+(/KO|น็อก/.test(r.type||"")?3:2); /* v1.58: stardust for wins */
    if(!off){me.rec[res==="W"?"w":res==="L"?"l":"d"]++;me.form.unshift(res);me.form=me.form.slice(0,5);}me.lastFight=G.week;
    me.fatigue=clamp(me.fatigue+(booking.ev?4:off?14:22),0,100);
    const s=side==="A"?A:B;
    if(s.hp<40&&!off&&mulberry32(F.seed+(side==="A"?1:2))()<.45)me.injury=Math.max(me.injury,2+(s.hp<15?2:0));
    if(res==="L"&&/KO|TKO/.test(r.type)&&!booking.pro&&!booking.ev)me.injury=Math.max(me.injury,booking.dm?1:3); // v1.37.1: a Death Match KO costs one week, not three
    const pmods=passiveMods(me);if(G.romance===me.id)pmods.moraleLoss+=.3;if(me.camp==="player"&&me.trust>=60)pmods.moraleLoss+=.25;me.morale=clamp(me.morale+(res==="W"?10:res==="L"?-10*(1-Math.min(.9,pmods.moraleLoss)):2),0,100);
    // v1.21: beating someone stronger is worth more (ranking point, fame, EXP) — a reason to take the hard offers
    const upset=res==="W"&&ovr(op.a)-ovr(me.a)>.4;
    if(!off&&booking.tier!=="exhibition"&&booking.tier!=="special"&&booking.tier!=="lab"&&booking.tier!=="final"){const rk=G.rank[me.div][me.id];if(rk){rk.pts+=res==="W"?(ovr(op.a)-ovr(me.a)<-.6?2:3)+(upset?1:0):res==="D"?1:0;/* v1.47: farming weaker fighters earns fewer ranking points */rk[res==="W"?"w":res==="L"?"l":"d"]++;}}
    if(me.camp==="player"){
      const W=booking.win||tier.win,Lo=booking.lose||tier.lose;const pay=res==="W"?W:res==="D"?(W+Lo)/2:Lo;if(booking.fair){G.fairPay=G.fairPay||[];G.fairPay.push({amt:pay,op:op.name,res});}else{G.cash+=pay;G.wkFight=(G.wkFight||0)+pay;}
      G.rep=Math.max(0,G.rep+(res==="W"?tier.rep*clamp(1+(ovr(op.a)-ovr(me.a))*.5,.35,1.6):res==="L"?0:.5)/(1+Math.max(0,G.rep-25)/25));
      if(res==="W"&&!G.flags.firstWin)G.flags.firstWin=me.id;
      if(res==="L"&&!G.flags.firstLoss)G.flags.firstLoss=me.id;
      if(op.id==="fah"||op.id==="ploy"){G.flags[`vs_${op.id}`]=res;
        if(res==="W"){op.surge=(op.surge||0)+7;op.potential=Math.min(20,op.potential+.5);G.flags[`beat_${op.id}`]=(G.flags[`beat_${op.id}`]||0)+1;G.flags[`surgeWk_${op.id}`]=G.week;G.flags[`beatS_${op.id}`]=G.season||1;if(op.id==="ploy")op.aura=ployAura(G.week,G);}}
      gainXP(G,me,Math.round((res==="W"?45*(upset?1.3:1):res==="D"?35:30)*(1+pmods.fightXp+(res==="L"?pmods.lossXp:0))*(booking.tier==="district"?1.3:booking.tier==="semi"?1.6:booking.tier==="final"?2:1)));
      G.cal=G.cal||[];G.cal.push({wk:G.week,a:me.id,b:op.id,bn:op.name,tier:booking.tier,res,type:r.type,cards:(F.cards||[]).map(c=>[...c]),pay});
      ret={pay,res,upset};
    }
  }
  return ret;
}
function simNPCWeek(G){
  const st=stageOf(G.week);if(st!=="local"&&st!=="district")return;
  const rng=mulberry32(G.seed+G.week*104729);
  for(const div of ["A","B"]){
    let pool=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.injury===0&&G.week-f.lastFight>=3&&!isBooked(G,f.id)&&eligible(G,f));
    pool.sort(()=>rng()-.5);
    let n=0;while(pool.length>=2&&n<2){const a=pool.pop(),b=pool.pop();n++;
      const F=quickFight(a,b,Math.floor(rng()*1e9),3);applyResult(G,F,{tier:st});
      G.log.push(`[${div}] ${a.name} ${F.result.win==="A"?"Win":F.result.win==="B"?"Loss":"Draw"} ${b.name} (${F.result.type})`);}
  }
}
function standings(G,div){
  return Object.entries(G.rank[div]).filter(([id])=>G.F[id])
    .map(([id,r])=>({id,f:G.F[id],...r})).sort((x,y)=>y.pts-x.pts||y.w-x.w||x.l-y.l||ovr(y.f.a)-ovr(x.f.a));
}
function stageTransition(G){ // called after week's results, before week++
  const rng=mulberry32(G.seed+G.week*31);
  if(G.week===20){
    for(const div of ["A","B"]){G.qual[div]=storyTop4(G,div);}
    for(const div of ["A","B"]){NPC_DISTRICT[div].forEach(([n,l],i)=>{const id=`d${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i+3));startLv(G.F[id]);G.qual[div].push(id);});
      G.rank[div]={};G.qual[div].forEach((id,i)=>{G.rank[div][id]={pts:id.startsWith("d")?0:[4,3,2,1][i]||0,w:0,l:0,d:0};});}
    G.flags.qualDone=true;
  }
  if(G.week===40){
    // v1.4: top 4 of the district stage go to the provincial semi-finals (1v4, 2v3, week 44); winners meet in the final (week 49)
    G.semis=G.semis||{A:[],B:[]};
    for(const div of ["A","B"]){const t=storyTop4(G,div);G.semis[div]=t;G.finalists[div]=[];
      [[t[0],t[3]],[t[1],t[2]]].forEach(([a,b],i)=>{if(a&&b)bookBracket(G,`semi${div}${i}`,a,b,44,"semi",3);});}
    G.flags.finalDone=true;
  }
}
// v1.23: the story needs its final — our lead heroine and her rival always make the cut (wildcard if needed)
// and are seeded on opposite halves, so they can only meet in the final
const LEADS={A:["kati","ploy"],B:["mali","fah"]};
// v1.53: when a Golden Tiger star joins us, their camp's new prodigy takes over as the division's top rival
const leadRival=(G,div)=>{const p=G.prodigy&&G.prodigy[div];if(p&&G.F[p]&&G.F[p].camp==="rival")return p;return LEADS[div][1];};
function makeProdigy(G,div,from){G.prodigy=G.prodigy||{};if(G.prodigy[div])return G.F[G.prodigy[div]];const id="prod_"+div,src=G.F[from];
  const names={A:["Petcha, Golden Tiger disciple","Petcha"],B:["Baiyok, Golden Tiger disciple","Baiyok"]};
  const f=baseFighter(id,{name:names[div][1],full:names[div][0],div,camp:"rival",color:"#3b3f8f",potential:Math.min(20,(src?src.potential:17)+2),a:{}});
  for(const k in src.a)f.a[k]=Math.min(20,src.a[k]+.8);f.lvl=Math.max(1,(src.lvl||5));f.xp=0;f.canon=false;f.prodigy=true;f.met=true;f.skills={...(src.skills||{})};
  G.F[id]=f;G.prodigy[div]=id;G.rank=G.rank||{A:{},B:{}};G.rank[div][id]={pts:0,w:0,l:0,d:0};return f;}
function joinCamp(G,id,wage){const f=G.F[id];if(!f)return;f.camp="player";f.wage=wage;f.met=true;G.bookings=G.bookings.filter(b=>!(b.b===id&&G.F[b.a]&&G.F[b.a].camp==="player"));
  G.offers=(G.offers||[]).filter(o=>o.b!==id);G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][id])G.rank[f.div][id]={pts:0,w:0,l:0,d:0};}
function storyTop4(G,div){let t=standings(G,div).slice(0,4).map(s=>s.id);const me=LEADS[div][0],rv=leadRival(G,div);G.wild=G.wild||{};
  /* v1.66: only year 1 is story-protected; from year 2 everyone qualifies on points */
  if((G.season||1)===1)for(const id of [rv,me]){const f=G.F[id];if(!f||t.includes(id))continue;if(id===me&&f.camp!=="player")continue;if(id===rv&&f.camp!=="rival")continue;
    const drop=[...t].reverse().find(x=>![me,rv].includes(x));if(!drop)continue;t[t.indexOf(drop)]=id;G.wild[id]=G.week;G.wildDrop=G.wildDrop||{};G.wildDrop[id]=drop;G.wildRank=G.wildRank||{};G.wildRank[id]=standings(G,div).findIndex(x=>x.id===id)+1;
    if(!G.rank[div][id])G.rank[div][id]={pts:0,w:0,l:0,d:0};}
  // seeds: pairs are [0,3] and [1,2]; keep me and rival apart
  const im=t.indexOf(me),ir=t.indexOf(rv),half=i=>i===0||i===3?0:1;
  if(im>=0&&ir>=0&&half(im)===half(ir)){const j=half(ir)===0?1:0;[t[ir],t[j]]=[t[j],t[ir]];}
  return t;}
function bookBracket(G,id,a,b,week,tier,rounds){
  if(![a,b].some(x=>G.F[x].camp==="player"))G.bookings.push({id,a,b,week,tier,rounds,npc:true});
  else{const p=G.F[a].camp==="player"?a:b,o=p===a?b:a;G.bookings.push({id,a:p,b:o,week,tier,rounds});}}
function finishBracket(G,booking,F){
  if(booking.tier==="final")return finishFinal(G,booking,F);
  if(booking.tier!=="semi")return;
  const div=G.F[booking.a].div;let w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);
  if(booking.npc){const rv=leadRival(G,div);if((booking.a===rv||booking.b===rv)&&G.F[rv].camp==="rival"&&w!==rv){w=rv;F.result.win=rv===booking.a?"A":"B";F.result.type="Decision win";}}
  if(!G.finalists[div].includes(w))G.finalists[div].push(w);
  if(G.finalists[div].length===2){const [a,b]=G.finalists[div];bookBracket(G,`final${div}`,a,b,49,"final",5);}}
function finishFinal(G,booking,F){const div=G.F[booking.a].div;const w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);G.champ[div]=w;}

// week phase 1: training & upkeep (before fights)
function weekTrain(G){
  const rng=mulberry32(G.seed+G.week*977);G.log=[];
  for(const f of roster(G))trainWeek(G,f,rng);
  // v1.15: Ploy's raw talent makes her near-untouchable early; the edge fades by the district round
  if(G.F.ploy)G.F.ploy.aura=ployAura(G.week,G);
  for(const f of Object.values(G.F)){if(f.camp==="player")continue;
    if(f.injury>0){f.injury--;}f.fatigue=clamp(f.fatigue-8,0,100);
    // v1.23: the two stars coast until someone beats them — a loss lights a fire (surge) that carries them to the final
    const sg=f.surge>0?(f.surge--,f.id==="ploy"?.16:.13):0;
    npcGrow(f,rng,(f.canon&&f.camp==="rival"?dif(G).rival:1)*(f.id==="ploy"?(G.week>40?.07:G.week>30?.022:.012)+sg:f.id==="fah"?(G.week>40?.07:G.week>30?.03:G.week>10&&G.week<=24?.042:.026)+sg:f.camp==="rival"?.035:NPC_RATE(G.week)));f.morale+=(60-f.morale)*.1;
    // v1.15: rivals and NPCs level up too, so the opposition visibly gets stronger over the season
    if(f.camp==="rival"||f.camp==="npc"){f.xp=(f.xp||0)+(f.camp==="rival"?30:18)+Math.floor(rng()*10);
      while(f.lvl<10&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;if(f.camp==="rival"){const ks=Object.keys(f.a).sort((x,y)=>f.a[y]-f.a[x]).slice(0,2);ks.forEach(k=>f.a[k]=Math.min(20,f.a[k]+.2));}
        if(f.camp==="rival")G.lvNews=(G.lvNews||[]).concat([`${f.name} ${f.lab?"Vector Gym":"Golden Tiger Camp"} leveled up to Lv.${f.lvl}`]).slice(-3);}}}
}
// week phase 3: npc sim, economy, transitions, advance
function rankSnapshot(G){const o={};for(const d of ["A","B"]){o[d]={};standings(G,d).forEach((r,i)=>o[d][r.id]=i+1);}return o;}
function weekFinish(G){if(G.rep>55)G.rep=55+(G.rep-55)*(.96+(G.fac.hall||0)*.01);if(G.sponsorWk)G.cash+=G.sponsorWk;growStudents(G); // v1.22.1: fame above 40 needs upkeep

  const before=rankSnapshot(G);
  simNPCWeek(G);
  const after=rankSnapshot(G);G.rankMove={A:{},B:{}};
  for(const d of ["A","B"])for(const id in after[d]){const b=before[d][id];if(b)G.rankMove[d][id]=b-after[d][id];}
  for(const f of roster(G)){f.morale=clamp(f.morale+G.fac.dorm*1.5,0,100);f.trust=clamp(f.trust+G.fac.dorm*.3,0,100);}
  const inc=classIncome(G),up=upkeep(G),wg=wages(G);
  G.cash+=inc-up-wg;let debtPay=0;
  if(G.week%4===0&&G.debt>0){debtPay=Math.min(5000,G.debt);G.cash-=debtPay;G.debt-=debtPay;}
  if(G.loan>0&&G.week%4===0)G.loan=Math.round(G.loan*(1+LOAN_RATE)/100)*100; // v1.33: the helmet gang's quick cash grows 10% every 4 weeks
  for(const f of roster(G))if(G.cash>=0)f.trust=clamp(f.trust+.5,0,100);
  G.negWeeks=G.cash<0?G.negWeeks+1:0;
  const prog=(()=>{if(!G.snap){G.snap={week:G.week,a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return null;}
    if(G.week-G.snap.week<4)return null;const out=roster(G).filter(f=>G.snap.a[f.id]).map(f=>({id:f.id,before:G.snap.a[f.id]}));
    G.snap={week:G.week,a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return out.length?out:null;})();
  G.lastReport={prog,week:G.week,inc,up,wg,debtPay,students:students(G),rank:after,move:G.rankMove,stage:stageOf(G.week),cash:G.cash,log:[...G.log],gains:roster(G).map(f=>({id:f.id,name:f.name,gains:{...f.gains},fatigue:f.fatigue,injury:f.injury,xp:f.xpGain||0,lvl:f.lvl,preset:f.plan.preset}))};
  stageTransition(G);
  {const pv=G.history.length?G.history[G.history.length-1].cash:60000;G.history.push({w:G.week,cash:Math.round(G.cash),rep:+G.rep.toFixed(1),inc,up,wg,debt:debtPay,fight:G.wkFight||0,oth:Math.round(G.cash-pv-(inc-up-wg-debtPay)-(G.wkFight||0))});G.wkFight=0;}
  if((G.negWeeks>=4&&G.cash<-10000)||G.cash<-40000)G.ended="bankrupt";
  if(G.week===21||G.week===41){G.F.ploy.skills.captain=(G.F.ploy.skills.captain||0)+1;G.F.fah.skills.grin=(G.F.fah.skills.grin||0)+1;}
  if(G.week===41){G.F.ploy.skills.kr_knee=Math.max(1,G.F.ploy.skills.kr_knee||0);} // v1.19.2: Ploy brings one more weapon to the semis/final
  G.week++;G.freeUsed=false;G.campUsed=null;
  if(G.week>52&&!G.ended)G.ended="season";
  genOffers(G);
}
// Late-game opponents catch up once per season. Existing saves receive the same
// one-time adjustment on load, without touching the player's fighters.
const VECTOR_SPEC={
 pailin:{name:"Pailin",full:"Pailin Eksayam",div:"A",camp:"rival",color:"#392049",potential:20,
   a:{punch:17,kick:15,knee:16,elbow:18,clinch:16,guard:16,foot:15,counter:17,power:18,speed:16,stamina:18,dur:17,iq:16,comp:17}},
 A:{name:"Night",full:"Night of Vector Gym",div:"A",camp:"rival",color:"#542478",potential:19,
   a:{punch:13,kick:12,knee:12,elbow:13,clinch:12,guard:15,foot:15,counter:16,power:12,speed:15,stamina:14,dur:13,iq:17,comp:16}},
 B:{name:"Vega",full:"Vega of Vector Gym",div:"B",camp:"rival",color:"#47216b",potential:19,
   a:{punch:14,kick:16,knee:12,elbow:14,clinch:11,guard:13,foot:16,counter:13,power:16,speed:17,stamina:15,dur:13,iq:14,comp:15}}
};
function ensureVector(G){if((G.season||1)<4)return false;G.rank=G.rank||{A:{},B:{}};let created=false;
  for(const id of (G.season>=5?["pailin","vector_A","vector_B"]:["pailin"])){const div=id==="vector_B"?"B":"A",spec=id==="pailin"?VECTOR_SPEC.pailin:VECTOR_SPEC[div];G.rank[div]=G.rank[div]||{};
    if(!G.F[id]){G.F[id]=baseFighter(id,spec);G.F[id].lvl=id==="pailin"?8:6;G.F[id].met=true;created=true;}
    G.F[id].lab=true;G.F[id].gymName="Vector Gym, Bangkok";if(id==="pailin")G.F[id].sprite="pailin";
    if(!G.rank[div][id])G.rank[div][id]={pts:0,w:0,l:0,d:0};}return created;}
function liftOpponent(f,target,maxGain){const delta=Math.min(maxGain,Math.max(0,target-ovr(f.a)));if(delta<=0)return;
  const goal=Math.min(19.7,ovr(f.a)+delta);for(let n=0;n<4;n++){const gap=goal-ovr(f.a),room=ATTRS.filter(([k])=>f.a[k]<19.95);if(gap<=.01||!room.length)break;
    const each=gap*ATTRS.length/room.length;for(const [k] of room)f.a[k]=Math.min(20,f.a[k]+each);}
  f.potential=Math.max(f.potential||14,Math.min(20,goal));}
function lateSeasonOpposition(G){const year=G.season||1;if(year<4)return;G.flags=G.flags||{};const created=ensureVector(G);
  if(G.flags.oppositionSeason===year&&!created)return;
  const d=G.diff||"normal";
  for(const div of ["A","B"]){const mine=roster(G).filter(f=>f.div===div);const best=Math.max(12+(year-4)*.6,...mine.map(f=>ovr(f.a)));
    for(const f of Object.values(G.F)){if(f.div!==div||f.camp==="player"||f.camp==="free")continue;
      const lab=!!f.lab,rival=f.camp==="rival",boss=f.id==="pailin",gap=lab?(d==="easy"?(boss?.5:.3):d==="hard"?(boss?1.3:1):(boss?1:.65)):rival?(d==="easy"?-1.4:d==="hard"?-.1:-.7):(d==="easy"?-3:d==="hard"?-1.4:-2.2);
      const floor=lab?(boss?16.5+(year-4)*.3:15.5+(year-5)*.3):rival?11.5+(year-4)*.35:9.5+(year-4)*.4;
      liftOpponent(f,Math.min(lab?19.7:rival?19.2:18.4,Math.max(floor,best+gap)),lab?20:rival?2.4:1.2);
      if(lab)f.labPrep=Math.min(boss?.09:.07,(boss?.05:.035)+Math.max(0,year-4)*.005);}}
  G.flags.oppositionSeason=year;}
// v1.3: keep playing after the season — new season, same camp, fighters and bonds
function newSeason(G){
  G.titles=G.titles||[];G.titles.push({season:G.season||1,champ:{...G.champ}});
  G.season=(G.season||1)+1;G.week=1;G.ended=null;G.qual={A:[],B:[]};G.finalists={A:[],B:[]};G.semis={A:[],B:[]};G.champ={};G.bookings=[];G.log=[];
  G.flags.qualDone=false;G.flags.finalDone=false;G.coachAway=null;G.freeUsed=false;G.campUsed=null;G.rankMove={A:{},B:{}};
  for(const id of Object.keys(G.F))if(/^d[AB]\d/.test(id))delete G.F[id];
  const rng=mulberry32(G.seed+G.season*977);
  G.rank={A:{},B:{}};
  for(const f of Object.values(G.F)){f.form=[];f.injury=0;f.fatigue=Math.min(f.fatigue,20);
    // v1.50: the whole field trains through the off-season too, so year 2 is not a walkover
    if(f.camp!=="player"){f.potential=Math.min(20,(f.potential||14)+1.5);for(const k in f.a)f.a[k]=Math.min(20,f.a[k]+(f.canon?.4:.6+rng()*.5));}
    if(f.camp!=="free")G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};}
  lateSeasonOpposition(G);genOffers(G);return G;}
// v1.7 late-game money sinks
const MASTERS={thasao:{name:"Tha Sao master",cost:18000,attrs:["speed","foot"]},chaiya:{name:"Chaiya master",cost:18000,attrs:["guard","counter"]},
  lopburi:{name:"Lopburi master",cost:18000,attrs:["iq","counter"]},korat:{name:"Korat master",cost:18000,attrs:["punch","power"]}};
function hireMaster(G,fid,school){const f=G.F[fid],M=MASTERS[school];if(!f||!M||G.cash<M.cost||G.week<16||f.masterSeason===(G.season||1))return false;
  G.cash-=M.cost;f.masterSeason=G.season||1;f.sp=(f.sp||0)+1;M.attrs.forEach(k=>f.a[k]=Math.min(20,f.a[k]+.6));f.morale=Math.min(100,f.morale+6);return true;}
const SHOW_COST=25000;
function hostShow(G){const st=stageOf(G.week);if(G.cash<SHOW_COST||G.week<10||G.flags["show_"+st])return false;G.cash-=SHOW_COST;G.flags["show_"+st]=true;
  G.rep+=3;G.camp.beauty=Math.min(10,G.camp.beauty+1);roster(G).forEach(f=>f.morale=Math.min(100,f.morale+8));return true;}
// v1.33: quick loan when cash runs dry; the helmet gang lends, and keeps coming round while it is unpaid
const LOAN_AMT=20000,LOAN_RATE=.1;
const loanOk=G=>!(G.loan>0)&&G.cash<3000&&!G.ended;
function takeLoan(G){if(!loanOk(G))return false;G.loan=LOAN_AMT;G.cash+=LOAN_AMT;G.loanN=(G.loanN||0)+1;G.gang=G.gang||{st:0,next:0};G.gang.next=Math.min(G.gang.next||99,G.week+2);return true;}
function repayLoan(G){if(!(G.loan>0)||G.cash<G.loan)return false;G.cash-=G.loan;G.loan=0;return true;}
function clearDebt(G){if(G.debt<=0||G.cash<G.debt)return false;G.cash-=G.debt;G.debt=0;G.flags.debtCleared=true;G.rep+=2;return true;}
if(typeof module!=="undefined")module.exports={takeLoan,repayLoan,loanOk,LOAN_AMT,cornerOdds,cloneFight,trainWeek,passiveMods,skillReqs,skillBlock,hasTree,DIFF,studentCap,studentDemand,studentFee,growStudents,storyTop4,RIVAL_OF,LEADS,upkeep,campActLocked,equipped,toggleEquip,MAX_EQUIP,roundBegin,fightEx,roundDone,roundFinish,useSkill,fightSkills,SKILL_KIND_NAME,fixSave,STAFF,hireStaff,fireStaff,staffSlots,staffLocked,facLocked,mainStyle,mastery,styleVal,STYLE_NAME,STYLE_ATTRS,MASTERY_AT,aiCorner,FACILITIES,SIGNATURE,hasSignature,counterPreset,oppTop,careNeeds,applyCare,throwTowel,CARE,MASTERS,hireMaster,hostShow,clearDebt,SHOW_COST,TAC,setTactics,finishBracket,mulberry32,newGame,weekTrain,weekFinish,genOffers,acceptOffer,buyFacility,upgradeDaeng,students,campLevel,newFight,fightRound,quickFight,applyResult,standings,roster,ovr,styleOf,stageOf,finishFinal,condition,ATTRS,isBooked,PRESETS,CANON,advise,doCampAction,learnSkill,SKILLS,SCHOOLS,campLook,newSeason};

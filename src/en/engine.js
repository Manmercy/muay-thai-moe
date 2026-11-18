// ================= MUAY THAI MOE — SIM ENGINE (pure logic, no DOM) =================
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickW=(rng,items)=>{const tot=items.reduce((s,i)=>s+Math.max(0,i[1]),0);let r=rng()*tot;for(const i of items){r-=Math.max(0,i[1]);if(r<=0)return i[0];}return items[items.length-1][0];};
const fmt=n=>(n<0?"-":"")+"฿"+Math.abs(Math.round(n)).toLocaleString("en-US");

const ATTRS=[["punch","Punch"],["kick","Kick"],["knee","Knee"],["elbow","Elbow"],["clinch","Clinch"],["guard","Guard"],["foot","Footwork"],
  ["counter","Counter"],["power","Power"],["speed","Speed"],["stamina","Stamina"],["dur","Durability"],["iq","Fight IQ"],["comp","Composure"]];
const ATTR_GROUPS=[["Weapons",["punch","kick","knee","elbow","clinch"]],["Technique",["guard","foot","counter"]],["Body",["power","speed","stamina","dur"]],["Mind",["iq","comp"]]];
const ATTR_LABEL=Object.fromEntries(ATTRS);
const STYLES={mat:"Puncher",tae:"Kicker",khao:"Knee fighter",sok:"Elbow fighter",femur:"Skilled"};

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
const STAGE_NPCS={
 local:{A:[["Saengdao Sit Mae Rim",8],["Mintra K.Kamphaeng",9]],B:[["Sairung Luk Nam Ping",8],["Khaohom W.Wat Nuea",9]]},
 district:{A:[["Nilawan Sit Mae Ping",11],["Dueanphen W.Lanna",12],["Phraemai Petch Doi",12]],B:[["Warin S.Wayu",11],["Phimdao Nuea Fa Camp",12],["Kingkaew Mueang Kaew",12]]},
 province:{A:[["Chonthicha Sit Nakhon",13],["Naphatsorn Phayak Mueang",14],["Sasiporn Petch Luang",14],["Maneerat K.Krung Kao",15]],B:[["Tharathip Sit Wiang",13],["Raweewan Luk Chao Phraya",14],["Sirinapha Petch Tawan",14],["Butsakorn S.Sanam Yai",15]]}
};
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
  {id:"ts_low",line:0,row:1,pre:"ts_fast",req:["kick","power"],school:"thasao",name:"Monk Sweeps the Yard",desc:"Look mai: duck the high kick, sweep the standing leg · kick power +8%, kick accuracy +1.5%",fx:r=>({dmg:{kick:.08*r},hit:{kick:.015*r}})},
  {id:"k_shin",line:0,row:2,pre:"ts_fast",passive:1,req:["kick"],school:"thasao",name:"Iron Shins",desc:"Always on · 12% less fatigue from kick training",fx:r=>({}),px:r=>({fatKick:.12*r})},
  {id:"ts_croc",line:0,row:3,pre:"ts_low",req:["kick","foot"],school:"thasao",name:"Crocodile Sweeps Its Tail",desc:"Mae mai: slip the punch, spin, whip the heel · kick accuracy +3%, kick power +10%, kick points +8%",fx:r=>({hit:{kick:.03*r},dmg:{kick:.1*r},pts:{kick:.08*r}})},
  {id:"ts_jab",line:1,row:0,req:["punch"],school:"thasao",name:"Tha Sao Crossbow Jab",desc:"Quick Tha Sao lead · Punch accuracy +3%, punch score +6%",fx:r=>({hit:{punch:.03*r},pts:{punch:.06*r}})},
  {id:"ts_elbow",line:1,row:1,pre:"ts_jab",req:["elbow","clinch"],school:"thasao",name:"Tha Sao Slicing Elbow",desc:"Spinning elbow at close range · elbow power +10%, accuracy +1%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.01*r}})},
  {id:"k_blood",line:1,row:2,pre:"ts_jab",passive:1,req:["comp"],school:"thasao",name:"Fighter's Blood",desc:"Always on · +20% EXP from fights you lose",fx:r=>({}),px:r=>({lossXp:.2*r})},
  {id:"ts_ring",line:1,row:3,pre:"ts_elbow",req:["punch","elbow"],school:"thasao",name:"Hanuman Presents the Ring",desc:"Look mai: duck, then a double uppercut to the chin · punch accuracy +3%, punch power +10%, punch points +8%",fx:r=>({hit:{punch:.03*r},dmg:{punch:.1*r},pts:{punch:.08*r}})},
  {id:"ts_step",line:2,row:0,req:["foot"],school:"thasao",name:"Wide Tha Sao stance",desc:"Wide stance, weight on the back leg · Evade +1.5%, counter +3%",fx:r=>({evade:.015*r,ctr:.03*r})},
  {id:"heart",line:2,row:1,pre:"ts_step",req:["stamina"],school:"thasao",name:"Heart Over a Hundred",desc:"Below 45 body: accuracy +4%",fx:r=>({clutch:.04*r})},
  {id:"k_grind",line:2,row:2,pre:"ts_step",passive:1,req:["stamina"],school:"thasao",name:"Never Tired of Training",desc:"Always on · 7% less fatigue from all training",fx:r=>({}),px:r=>({fatAll:.07*r})},
  {id:"ts_iron",line:2,row:3,pre:"heart",req:["guard","iq"],school:"thasao",name:"Tha Sao Wall",desc:"Tight guard, then counter · evade +2%, counter +3%, clinch defense +0.8",fx:r=>({evade:.02*r,ctr:.03*r,clDef:.8*r})}],
 mali:[
  {id:"cy_kick",line:0,row:0,req:["elbow"],school:"chaiya",name:"Leaping Elbow Strike",desc:"Chaiya master move · Elbow accuracy +2%, elbow score +10%",fx:r=>({hit:{elbow:.02*r},pts:{elbow:.1*r}})},
  {id:"cy_spin",line:0,row:1,pre:"cy_kick",req:["elbow","foot"],school:"chaiya",name:"Slicing the Gourd",desc:"Look mai: parry, then a rising elbow to the chin · elbow power +10%, elbow accuracy +1.5%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.015*r}})},
  {id:"m_heart",line:0,row:2,pre:"cy_kick",passive:1,req:["comp"],school:"chaiya",name:"Small Body, Big Heart",desc:"Always on · +8% EXP from every fight",fx:r=>({}),px:r=>({fightXp:.08*r})},
  {id:"cy_erawan",line:0,row:3,pre:"cy_spin",req:["elbow","clinch"],school:"chaiya",name:"Breaking Erawan's Neck",desc:"Mae mai: pull the neck down, knee, then elbow · elbow power +12%, elbow accuracy +3%, clinch defense +0.5",fx:r=>({dmg:{elbow:.12*r},hit:{elbow:.03*r},clDef:.5*r})},
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
  {id:"lb_jab",line:0,row:1,pre:"lb_read",req:["punch","counter"],school:"lopburi",name:"Erawan Lifts Its Tusk",desc:"Look mai: twist away, parry, counter to the jaw · Counter-punch power +12%, punch accuracy +1%",fx:r=>({ctrDmg:.12*r,hit:{punch:.01*r}})},
  {id:"lb_calm",line:0,row:2,pre:"lb_read",passive:1,req:["comp"],school:"lopburi",name:"The Calculating Calm",desc:"Always on · below 45 health, accuracy +2% in every fight",fx:r=>({clutch:.02*r})},
  {id:"lb_kris",line:0,row:3,pre:"lb_jab",req:["counter","speed"],school:"lopburi",name:"Old Monk Props the Gourd",desc:"Mae mai: parry the punch up, counter to the chin · counter +4%, counter-punch power +15%, punch accuracy +2%",fx:r=>({ctr:.04*r,ctrDmg:.15*r,hit:{punch:.02*r}})},
  {id:"lb_plan",line:1,row:0,req:["iq"],school:"lopburi",name:"Muay Kiao (Teasing Style)",desc:"Feints and baits · Corner orders 25% stronger, base accuracy +1%",fx:r=>({corner:.25*r,prep:.01*r})},
  {id:"lb_feint",line:1,row:1,pre:"lb_plan",req:["iq"],school:"lopburi",name:"Snuffing the Lamp",desc:"Mae mai: press their arm down, punch to the face · Evade +1.5%, counter +2%",fx:r=>({evade:.015*r,ctr:.02*r})},
  {id:"r_note",line:1,row:2,pre:"lb_plan",passive:1,req:["iq"],school:"lopburi",name:"Opponent Notebook",desc:"Always on · base accuracy +0.8% in every fight",fx:r=>({prep:.008*r})},
  {id:"lb_giant",line:1,row:3,pre:"lb_feint",req:["iq","comp"],school:"lopburi",name:"The Giant Catches the Monkey",desc:"Mae mai: punch, kick, elbow — all turned away in one step · corner orders +30% effect, base accuracy +1.2%, evade +1%",fx:r=>({corner:.3*r,prep:.012*r,evade:.01*r})},
  {id:"lb_teep",line:2,row:0,req:["kick"],school:"lopburi",name:"Mon Braces the Post",desc:"Mae mai: arm up against the punch, teep to the chest · Kick accuracy +2%, kick score +8%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r}})},
  {id:"lb_range",line:2,row:1,pre:"lb_teep",req:["kick","foot"],school:"lopburi",name:"Cutting the Outer Ring",desc:"Control range with teeps and footwork · kick accuracy +2%, kick points +8%, evade +1%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r},evade:.01*r})},
  {id:"r_pace",line:2,row:2,pre:"lb_teep",passive:1,req:["stamina"],school:"lopburi",name:"Counting the Beat",desc:"Always on · attacks cost 4% less energy in every fight",fx:r=>({staSave:.04*r})},
  {id:"lb_tiger",line:2,row:3,pre:"lb_range",req:["kick","foot"],school:"lopburi",name:"Tiger Drags Its Tail",desc:"Feint a retreat, then kick back · kick power +10%, kick accuracy +3%, counter +2%",fx:r=>({dmg:{kick:.1*r},hit:{kick:.03*r},ctr:.02*r})}],
};
// v1.82.3: deeper trees — every school line gets a Lv.14 signature move and a Lv.22 master move,
// Ploy and Fah get full trees, and three shared "build" paths (pick one per fighter)
const SKX=(id,line,row,pre,req,school,name,desc,fx,more)=>Object.assign({id,line,row,pre,req,school,name,desc,fx},more||{});
SKILLS.kati.push(
 SKX("ts_thunder",0,4,"ts_croc",["kick","power"],"thasao","Tha Sao Thunderclap","Lv.14 · full spinning neck-line kick · kick accuracy +4%, kick power +12%, kick scoring +10%",r=>({hit:{kick:.04*r},dmg:{kick:.12*r},pts:{kick:.1*r}}),{lv:14}),
 SKX("ts_wind",0,5,"ts_thunder",["kick","speed"],"thasao","Wind God Shin","Lv.22 · Master · kick power +16%, kick accuracy +4%, evade +1%",r=>({dmg:{kick:.16*r},hit:{kick:.04*r},evade:.01*r}),{lv:22}),
 SKX("ts_bolt",1,4,"ts_ring",["elbow","punch"],"thasao","Thunderbolt Back Elbow","Lv.14 · lead punch into a spinning back elbow · elbow power +14%, elbow accuracy +3%, punch power +6%",r=>({dmg:{elbow:.14*r,punch:.06*r},hit:{elbow:.03*r}}),{lv:14}),
 SKX("ts_trunk",1,5,"ts_bolt",["punch","power"],"thasao","Breaking the Elephant's Trunk","Lv.22 · Master · Mae mai: take the kick, elbow the thigh · punch power +12%, elbow power +12%, punch accuracy +3%",r=>({dmg:{punch:.12*r,elbow:.12*r},hit:{punch:.03*r}}),{lv:22}),
 SKX("ts_heart",2,4,"ts_iron",["guard","comp"],"thasao","Sirichai Spirit","Lv.14 · the more it hurts, the sharper she gets · +5% accuracy at low health, evade +2%, clinch defense +0.6",r=>({clutch:.05*r,evade:.02*r,clDef:.6*r}),{lv:14}),
 SKX("ts_fort",2,5,"ts_heart",["guard","dur"],"thasao","Tha Sao Iron Wall","Lv.22 · Master · evade +3%, counters +5%, clinch defense +1, recovery +10%",r=>({evade:.03*r,ctr:.05*r,clDef:1*r,regen:.1*r}),{lv:22}));
SKILLS.mali.push(
 SKX("cy_flash",0,4,"cy_erawan",["elbow","speed"],"chaiya","Lightning Return Elbow","Lv.14 · an elbow too fast to see · elbow power +14%, elbow accuracy +3%",r=>({dmg:{elbow:.14*r},hit:{elbow:.03*r}}),{lv:14}),
 SKX("cy_soar",0,5,"cy_flash",["elbow","knee"],"chaiya","Chaiya Sky Leap","Lv.22 · Master · elbow power +16%, knee power +8%, elbow accuracy +3%",r=>({dmg:{elbow:.16*r,knee:.08*r},hit:{elbow:.03*r}}),{lv:22}),
 SKX("cy_bloom",1,4,"cy_hanuman",["kick","foot"],"chaiya","Jasmine Dance","Lv.14 · flowing kicks like a dance · kick accuracy +4%, kick scoring +10%, recovery +10%",r=>({hit:{kick:.04*r},pts:{kick:.1*r},regen:.1*r}),{lv:14}),
 SKX("cy_gale",1,5,"cy_bloom",["speed","kick"],"chaiya","Chaiya Whirlwind","Lv.22 · Master · evade +2.5%, kick accuracy +4%, kick power +10%, stamina use -3%",r=>({evade:.025*r,hit:{kick:.04*r},dmg:{kick:.1*r},staSave:.03*r}),{lv:22}),
 SKX("cy_gate",2,4,"cy_root",["guard","clinch"],"chaiya","Pinning the Garland","Lv.14 · Look mai: parry, elbow to the chest · clinch defense +1, evade +2%, counters +3%",r=>({clDef:1*r,evade:.02*r,ctr:.03*r}),{lv:14}),
 SKX("cy_meru",2,5,"cy_gate",["guard","dur"],"chaiya","Mount Meru","Lv.22 · Master · clinch defense +1.4, evade +3%, recovery +12%, +3% accuracy at low health",r=>({clDef:1.4*r,evade:.03*r,regen:.12*r,clutch:.03*r}),{lv:22}));
SKILLS.rin.push(
 SKX("lb_shadow",0,4,"lb_kris",["counter","speed"],"lopburi","Shadowless Counter","Lv.14 · counters before the opponent's strike lands · counters +5%, counter-punch power +16%",r=>({ctr:.05*r,ctrDmg:.16*r}),{lv:14}),
 SKX("lb_proof",0,5,"lb_shadow",["counter","iq"],"lopburi","Closing Equation","Lv.22 · Master · counters +6%, counter-punch power +20%, punch accuracy +2%",r=>({ctr:.06*r,ctrDmg:.2*r,hit:{punch:.02*r}}),{lv:22}),
 SKX("lb_three",1,4,"lb_giant",["iq","comp"],"lopburi","Three-Round Mind Read","Lv.14 · plans the whole fight ahead · corner orders +35%, base accuracy +1.2%, evade +1%",r=>({corner:.35*r,prep:.012*r,evade:.01*r}),{lv:14}),
 SKX("lb_book",1,5,"lb_three",["iq","counter"],"lopburi","Lopburi Textbook","Lv.22 · Master · corner orders +45%, base accuracy +1.6%, counters +3%",r=>({corner:.45*r,prep:.016*r,ctr:.03*r}),{lv:22}),
 SKX("lb_fold",2,4,"lb_tiger",["kick","power"],"lopburi","Foot Strokes the Face","Lv.14 · Look mai: teep the face before they can strike · kick accuracy +3%, kick scoring +10%, evade +1.5%",r=>({hit:{kick:.03*r},pts:{kick:.1*r},evade:.015*r}),{lv:14}),
 SKX("lb_circle",2,5,"lb_fold",["foot","kick"],"lopburi","Unbreakable Outer Ring","Lv.22 · Master · kick accuracy +4%, kick power +12%, evade +2%, counters +3%",r=>({hit:{kick:.04*r},dmg:{kick:.12*r},evade:.02*r,ctr:.03*r}),{lv:22}));
SKILLS.ploy=[
 SKX("kr_swing",0,0,null,["punch"],"korat","Buffalo Swing","Wide, heavy hook · Punch power +12%, punch score +5%",r=>({dmg:{punch:.12*r},pts:{punch:.05*r}})),
 SKX("kr_hook",0,1,"kr_swing",["punch","power"],"korat","Double-Swing Punch","Swings again the moment the opponent opens · punch power +8%, punch accuracy +1.5%",r=>({dmg:{punch:.08*r},hit:{punch:.015*r}})),
 SKX("p_iron",0,2,"kr_swing",["dur"],"korat","Korat Iron Arms","Passive · training fatigue -6% on every program",r=>({}),{passive:1,px:r=>({fatAll:.06*r})}),
 SKX("kr_buffalo",0,3,"kr_hook",["punch","power"],"korat","White Buffalo Rams the Post","Charges in behind a heavy punch · punch accuracy +3%, punch power +12%, punch scoring +6%",r=>({hit:{punch:.03*r},dmg:{punch:.12*r},pts:{punch:.06*r}})),
 SKX("kr_thunder",0,4,"kr_buffalo",["punch","speed"],"korat","Lifting Mount Meru","Lv.14 · Mae mai: duck the punch, answer to the chin · punch power +15%, punch accuracy +4%",r=>({dmg:{punch:.15*r},hit:{punch:.04*r}}),{lv:14}),
 SKX("kr_genius",0,5,"kr_thunder",["punch","iq"],"korat","Undefeated Genius","Lv.22 · Master · punch power +12%, punch accuracy +3%, +4% accuracy at low health, counters +3%",r=>({dmg:{punch:.12*r},hit:{punch:.03*r},clutch:.04*r,ctr:.03*r}),{lv:22}),
 SKX("kr_knee",1,0,null,["kick"],"korat","Neck-Breaker Kicks","Korat-style neck kick · Kick accuracy +3%, kick score +8%",r=>({hit:{kick:.03*r},pts:{kick:.08*r}})),
 SKX("kr_sweep",1,1,"kr_knee",["kick","foot"],"korat","Leaning on the Pillar","Look mai: block the kick, teep the standing leg · kick accuracy +2%, kick power +8%",r=>({hit:{kick:.02*r},dmg:{kick:.08*r}})),
 SKX("p_cold",1,2,"kr_knee",["comp"],"korat","Ice-Cold Mind","Passive · morale drops 20% less after losses",r=>({}),{passive:1,px:r=>({moraleLoss:.2*r})}),
 SKX("kr_clinch",1,3,"kr_sweep",["knee","clinch"],"korat","Korat Clinch","Lock the neck and knee nonstop · Knee power +10%, accuracy +2%",r=>({dmg:{knee:.1*r},hit:{knee:.02*r}})),
 SKX("kr_neck",1,4,"kr_clinch",["kick","power"],"korat","Neck-Line Kick","Lv.14 · full-arc high kick · kick power +14%, kick accuracy +4%, kick scoring +8%",r=>({dmg:{kick:.14*r},hit:{kick:.04*r},pts:{kick:.08*r}}),{lv:14}),
 SKX("kr_tiger",1,5,"kr_neck",["kick","knee"],"korat","Golden Tiger Lashes Its Tail","Lv.22 · Master · kick power +16%, knee power +10%, kick accuracy +3%",r=>({dmg:{kick:.16*r,knee:.1*r},hit:{kick:.03*r}}),{lv:22}),
 SKX("captain",2,0,null,["guard"],"korat","Rope-Bound to the Elbow","Iron arms that eat kicks · Evade/block +1%, composure +1%, inside defense +0.5",r=>({evade:.01*r,mor:.01*r,clDef:.5*r})),
 SKX("p_read",2,1,"captain",["iq"],"korat","Tiger Reads the Fight","Notes every rhythm of the opponent · counters +3%, evade +1%",r=>({ctr:.03*r,evade:.01*r})),
 SKX("p_note",2,2,"captain",["iq"],"korat","Fight-Plan Notebook","Passive · +6% EXP from every fight",r=>({}),{passive:1,px:r=>({fightXp:.06*r})}),
 SKX("p_wall",2,3,"p_read",["guard","iq"],"korat","Rama Draws the Bow","Look mai: drop under, arm up, punch back · evade +2%, clinch defense +0.8, counters +3%",r=>({evade:.02*r,clDef:.8*r,ctr:.03*r})),
 SKX("p_sister",2,4,"p_wall",["iq","counter"],"korat","Sister's Shadow","Lv.14 · what Pailin once taught her · counters +5%, corner orders +25%, evade +1.5%",r=>({ctr:.05*r,corner:.25*r,evade:.015*r}),{lv:14}),
 SKX("p_crown",2,5,"p_sister",["guard","comp"],"korat","Tiger Crown","Lv.22 · Master · evade +3%, clinch defense +1, counters +5%, +3% accuracy at low health",r=>({evade:.03*r,clDef:1*r,ctr:.05*r,clutch:.03*r}),{lv:22})];
SKILLS.fah=[
 SKX("tiger",0,0,null,["elbow"],"modern","Tiger Elbow","Elbow power +12%, accuracy +2%",r=>({dmg:{elbow:.12*r},hit:{elbow:.02*r}})),
 SKX("f_cut",0,1,"tiger",["elbow","speed"],"modern","Sky-Slash Elbow","Rising diagonal elbow · elbow power +8%, elbow accuracy +1.5%",r=>({dmg:{elbow:.08*r},hit:{elbow:.015*r}})),
 SKX("f_flex",0,2,"tiger",["foot"],"modern","Dancer's Flex","Passive · training fatigue -5% on every program",r=>({}),{passive:1,px:r=>({fatAll:.05*r})}),
 SKX("f_storm",0,3,"f_cut",["elbow","clinch"],"modern","Elbow Storm","Nonstop elbows in the clinch · elbow power +12%, elbow accuracy +3%, elbow scoring +6%",r=>({dmg:{elbow:.12*r},hit:{elbow:.03*r},pts:{elbow:.06*r}})),
 SKX("f_thunder",0,4,"f_storm",["elbow","power"],"modern","Twin Thunder Elbows","Lv.14 · left and right elbows without a pause · elbow power +14%, elbow accuracy +4%",r=>({dmg:{elbow:.14*r},hit:{elbow:.04*r}}),{lv:14}),
 SKX("f_sky",0,5,"f_thunder",["elbow","speed"],"modern","Golden Sky","Lv.22 · Master · elbow power +16%, punch power +8%, elbow accuracy +3%",r=>({dmg:{elbow:.16*r,punch:.08*r},hit:{elbow:.03*r}}),{lv:22}),
 SKX("fah_rush",1,0,null,["punch"],"modern","Combo Storm","Rush in with combos · Punch accuracy +2%, punch score +8%",r=>({hit:{punch:.02*r},pts:{punch:.08*r}})),
 SKX("f_blitz",1,1,"fah_rush",["punch","stamina"],"modern","Never Retreat","Always moving forward · punch accuracy +1.5%, punch scoring +6%, stamina use -2%",r=>({hit:{punch:.015*r},pts:{punch:.06*r},staSave:.02*r})),
 SKX("reckless",1,2,"fah_rush",["stamina"],"modern","Reckless","Passive · 8% less stamina spent attacking",r=>({staSave:.08*r}),{passive:1}),
 SKX("f_tornado",1,3,"f_blitz",["punch","speed"],"modern","Grand Punch Storm","Long, nonstop combinations · punch accuracy +3%, punch power +10%, punch scoring +8%",r=>({hit:{punch:.03*r},dmg:{punch:.1*r},pts:{punch:.08*r}})),
 SKX("f_hurricane",1,4,"f_tornado",["punch","stamina"],"modern","Sky Hurricane","Lv.14 · attacks all round without fading · punch accuracy +4%, punch power +12%, stamina use -3%",r=>({hit:{punch:.04*r},dmg:{punch:.12*r},staSave:.03*r}),{lv:14}),
 SKX("f_heaven",1,5,"f_hurricane",["punch","power"],"modern","Sky Falls","Lv.22 · Master · punch power +16%, punch accuracy +4%, punch scoring +8%",r=>({dmg:{punch:.16*r},hit:{punch:.04*r},pts:{punch:.08*r}}),{lv:22}),
 SKX("grin",2,0,null,["comp"],"modern","Smirk","Below 45 body: accuracy +3%",r=>({clutch:.03*r})),
 SKX("f_taunt",2,1,"grin",["iq"],"modern","Bait the Rush","Taunts the opponent into charging in · counters +3%, evade +1%",r=>({ctr:.03*r,evade:.01*r})),
 SKX("f_party",2,2,"grin",["comp"],"modern","After-Fight Party","Passive · +6% EXP from every fight",r=>({}),{passive:1,px:r=>({fightXp:.06*r})}),
 SKX("f_show",2,3,"f_taunt",["comp","foot"],"modern","Showtime","The louder the crowd, the better · morale effect +2%, punch scoring +4%, kick scoring +4%, +2% accuracy at low health",r=>({mor:.02*r,pts:{punch:.04*r,kick:.04*r},clutch:.02*r})),
 SKX("f_smile",2,4,"f_show",["comp","counter"],"modern","Smile for the Whole Stadium","Lv.14 · smiles through anything · +5% accuracy at low health, counters +4%, morale effect +2%",r=>({clutch:.05*r,ctr:.04*r,mor:.02*r}),{lv:14}),
 SKX("f_star",2,5,"f_smile",["comp","speed"],"modern","Star in the Sky","Lv.22 · Master · evade +3%, counters +5%, +4% accuracy at low health, recovery +10%",r=>({evade:.03*r,ctr:.05*r,clutch:.04*r,regen:.1*r}),{lv:22})];
// shared build paths: line 3..5; once a fighter learns one, the other two are closed until reset
const SHARED_SKILLS=[
 SKX("sh_ko1",3,0,null,["power"],"build","Weight Behind Every Shot","Knockout build · punch power +5%, kick power +4%",r=>({dmg:{punch:.05*r,kick:.04*r}}),{shared:1}),
 SKX("sh_ko2",3,1,"sh_ko1",["power","punch"],"build","Quick Finish","Knockout build · knee power +5%, elbow power +5%, punch power +4%",r=>({dmg:{knee:.05*r,elbow:.05*r,punch:.04*r}}),{shared:1,lv:4}),
 SKX("sh_ko3",3,2,"sh_ko1",["power"],"build","Spring Muscles","Knockout build · passive · training fatigue -4%",r=>({}),{shared:1,passive:1,lv:4,px:r=>({fatAll:.04*r})}),
 SKX("sh_ko4",3,3,"sh_ko2",["power","speed"],"build","One-Punch Finish","Knockout build · Lv.10 · punch power +10%, elbow power +6%, knee power +6%",r=>({dmg:{punch:.1*r,elbow:.06*r,knee:.06*r}}),{shared:1,lv:10}),
 SKX("sh_tc1",4,0,null,["iq"],"build","Clean Technique","Points build · punch scoring +5%, kick scoring +5%",r=>({pts:{punch:.05*r,kick:.05*r}}),{shared:1}),
 SKX("sh_tc2",4,1,"sh_tc1",["iq","foot"],"build","Every Shot Lands","Points build · punch accuracy +1.5%, kick accuracy +1.5%",r=>({hit:{punch:.015*r,kick:.015*r}}),{shared:1,lv:4}),
 SKX("sh_tc3",4,2,"sh_tc1",["iq"],"build","Homework Every Night","Points build · passive · +6% EXP from fights",r=>({}),{shared:1,passive:1,lv:4,px:r=>({fightXp:.06*r})}),
 SKX("sh_tc4",4,3,"sh_tc2",["iq","comp"],"build","Owns Every Round","Points build · Lv.10 · knee/elbow scoring +6%, corner orders +20%, base accuracy +0.6%",r=>({pts:{knee:.06*r,elbow:.06*r},corner:.2*r,prep:.006*r}),{shared:1,lv:10}),
 SKX("sh_ir1",5,0,null,["dur"],"build","Takes Every Shot","Iron build · clinch defense +0.6, evade +0.8%",r=>({clDef:.6*r,evade:.008*r}),{shared:1}),
 SKX("sh_ir2",5,1,"sh_ir1",["stamina","dur"],"build","Long Breath","Iron build · recovery between rounds +12%, stamina use -3%",r=>({regen:.12*r,staSave:.03*r}),{shared:1,lv:4}),
 SKX("sh_ir3",5,2,"sh_ir1",["stamina"],"build","Quick Recovery","Iron build · passive · morale drops 15% less after losses, training fatigue -3%",r=>({}),{shared:1,passive:1,lv:4,px:r=>({moraleLoss:.15*r,fatAll:.03*r})}),
 SKX("sh_ir4",5,3,"sh_ir2",["dur","stamina"],"build","Never Goes Down","Iron build · Lv.10 · +4% accuracy at low health, clinch defense +0.8, recovery +10%",r=>({clutch:.04*r,clDef:.8*r,regen:.1*r}),{shared:1,lv:10})];
/* v1.89 skill roots — generated by tools/skills/gen_roots.py from roots_data.py (edit those, not this block) */
const _rsch=(fid,id)=>((SKILLS[fid]||[]).find(s=>s.id===id)||{}).school;
const SK_ROOTS={"kati":[[{"n":"Storm Shin","m":"heavy shins, quick finishes"},{"n":"Teacher's Kicks","m":"clean kicks, steady points"}],[{"n":"Breaking Elbows","m":"heavy elbows up close"},{"n":"Tha Sao Fast Hands","m":"fast hands, quick points"}],[{"n":"Heart That Won't Retreat","m":"the more it hurts, the harder she fights"},{"n":"Iron Guard, Quick Return","m":"take it, give it right back"}]],"mali":[[{"n":"Soaring Elbows","m":"jumping elbows from range"},{"n":"Clinch Elbow and Knee","m":"grab, knee, finish with elbow"}],[{"n":"Chaiya Wind Kicks","m":"light, fast, endless kicks"},{"n":"Dance Without Tiring","m":"moving all fight, never fading"}],[{"n":"Chaiya Fortress","m":"close every gap, give nothing away"},{"n":"Smile Through Every Blow","m":"keep smiling, then hit back"}]],"rin":[[{"n":"Razor Counters","m":"fast counters, heavy counters"},{"n":"Veil of Feints","m":"make them miss, hit the gap"}],[{"n":"Secret Manual","m":"plan before the bell"},{"n":"Read and Play","m":"read the game, answer at once"}],[{"n":"Teep Wall","m":"teeps hold range, clean points"},{"n":"Outer Circle","m":"circle, never let them set"}]],"ploy":[[{"n":"Wrecking Swings","m":"the heaviest wide punches"},{"n":"Genius Hands","m":"calculated, accurate punches"}],[{"n":"Neck-Breaker Kicks","m":"high kicks, heavy kicks"},{"n":"Korat Clinch","m":"lock the neck and never let go"}],[{"n":"Wall That Hits Back","m":"take it, return it heavy"},{"n":"Sister's Plans","m":"the fight plans Pailin left behind"}]],"fah":[[{"n":"Lightning Elbows","m":"fast elbows, hard elbows"},{"n":"Showtime Elbows","m":"pretty elbows the crowd screams for"}],[{"n":"Non-Stop Rush","m":"attack bell to bell"},{"n":"All the Way Reckless","m":"trade freely, never step back"}],[{"n":"Taunt Until They Break","m":"bait the mistake, then counter"},{"n":"Smile Wider When Hurt","m":"never falls in front of the crowd"}]],"build":[[{"n":"Quick Finish","m":"end it as fast as possible"},{"n":"Heavy and Sturdy","m":"trade because she lasts longer"}],[{"n":"Every Point Counts","m":"every strike must score"},{"n":"Run the Fight","m":"fight to the corner's plan"}],[{"n":"Endless Gas Tank","m":"energy that never drops"},{"n":"Too Tough to Fall","m":"takes everything"}]]};
SKILLS.kati.push(SKX("kati_0a1",0,6,"ts_wind",["kick", "power"],_rsch("kati","ts_wind"),"Sky-Splitting Shin","Lv.26 · Storm Shin · full-hip body kick · kick power +14%, kick points +6%",r=>({dmg:{kick:0.14*r},pts:{kick:0.06*r}}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_0a2",0,7,"kati_0a1",["kick"],_rsch("kati","ts_wind"),"Rock Shins","Always on · Lv.30 · kick power +3%, stamina use -1%",r=>({dmg:{kick:0.03*r},staSave:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_0a3",0,8,"kati_0a2",["kick", "speed"],_rsch("kati","ts_wind"),"Three-Kick Opener","Lv.34 · Storm Shin · three kicks to one spot · kick accuracy +4%, kick power +12%",r=>({hit:{kick:0.04*r},dmg:{kick:0.12*r}}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_0a4",0,9,"kati_0a3",["kick", "elbow"],_rsch("kati","ts_wind"),"Shins Open for Elbows","Always on · boosts Punch & elbow line · Lv.38 · elbow power +3%, punch accuracy +1%",r=>({dmg:{elbow:0.03*r},hit:{punch:0.01*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.kati.push(SKX("kati_0a5",0,10,"kati_0a4",["kick", "power"],_rsch("kati","ts_wind"),"Wind God Sweeps the Ring","Lv.42 · Legend · the kick the whole camp waits for · kick power +20%, kick accuracy +5%, kick points +8%",r=>({dmg:{kick:0.2*r},hit:{kick:0.05*r},pts:{kick:0.08*r}}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_0b1",0,6,"ts_wind",["kick", "foot"],_rsch("kati","ts_wind"),"Rhythm-Cutting Kick","Lv.26 · Teacher's Kicks · kick before the opponent fires · kick accuracy +4%, kick points +10%",r=>({hit:{kick:0.04*r},pts:{kick:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_0b2",0,7,"kati_0b1",["kick"],_rsch("kati","ts_wind"),"Eye for Openings","Always on · Lv.30 · kick accuracy +1.5%, base accuracy +0.4%",r=>({hit:{kick:0.015*r},prep:0.004*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_0b3",0,8,"kati_0b2",["kick", "iq"],_rsch("kati","ts_wind"),"Tha Sao Switch Kick","Lv.34 · Teacher's Kicks · switch stance, kick the other side · kick points +12%, evade +1.5%",r=>({pts:{kick:0.12*r},evade:0.015*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_0b4",0,9,"kati_0b3",["kick", "guard"],_rsch("kati","ts_wind"),"Shin-Length Control","Always on · boosts Guard & heart line · Lv.38 · evade +1%, clinch defense +0.3",r=>({evade:0.01*r,clDef:0.3*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.kati.push(SKX("kati_0b5",0,10,"kati_0b4",["kick", "iq"],_rsch("kati","ts_wind"),"Master Sao's Lesson","Lv.42 · Legend · every kick by the book · kick accuracy +5%, kick points +12%, counters +3%",r=>({hit:{kick:0.05*r},pts:{kick:0.12*r},ctr:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.kati.push(SKX("kati_1a1",1,6,"ts_trunk",["elbow", "power"],_rsch("kati","ts_trunk"),"Hiran Rolls the Earth","Lv.26 · Breaking Elbows · Look mai: take the kick, spin into an elbow · elbow power +14%, elbow accuracy +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_1a2",1,7,"kati_1a1",["elbow"],_rsch("kati","ts_trunk"),"Iron Elbows","Always on · Lv.30 · elbow power +3%, clinch defense +0.2",r=>({dmg:{elbow:0.03*r},clDef:0.2*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_1a3",1,8,"kati_1a2",["elbow", "clinch"],_rsch("kati","ts_trunk"),"Brow-Cutting Elbow","Lv.34 · Breaking Elbows · slicing elbow above the brow · elbow power +12%, elbow points +10%",r=>({dmg:{elbow:0.12*r},pts:{elbow:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_1a4",1,9,"kati_1a3",["elbow", "guard"],_rsch("kati","ts_trunk"),"Brave in the Clinch","Always on · boosts Guard & heart line · Lv.38 · clinch defense +0.4, +1% accuracy at low health",r=>({clDef:0.4*r,clutch:0.01*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.kati.push(SKX("kati_1a5",1,10,"kati_1a4",["elbow", "punch"],_rsch("kati","ts_trunk"),"Elephant Breaks the Elbow","Lv.42 · Legend · an elbow that ends fights · elbow power +20%, punch power +8%, elbow accuracy +4%",r=>({dmg:{elbow:0.2*r,punch:0.08*r},hit:{elbow:0.04*r}}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_1b1",1,6,"ts_trunk",["punch", "speed"],_rsch("kati","ts_trunk"),"Lightning Jab","Lv.26 · Tha Sao Fast Hands · a jab faster than the eye · punch accuracy +4%, punch points +10%",r=>({hit:{punch:0.04*r},pts:{punch:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_1b2",1,7,"kati_1b1",["punch"],_rsch("kati","ts_trunk"),"Quick Hands, Quick Eyes","Always on · Lv.30 · punch accuracy +1.5%, counters +1%",r=>({hit:{punch:0.015*r},ctr:0.01*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_1b3",1,8,"kati_1b2",["punch", "stamina"],_rsch("kati","ts_trunk"),"Five-Punch Combo","Lv.34 · Tha Sao Fast Hands · a long combo with no time to reset · punch power +10%, punch points +10%, stamina use -2%",r=>({dmg:{punch:0.1*r},pts:{punch:0.1*r},staSave:0.02*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_1b4",1,9,"kati_1b3",["punch", "kick"],_rsch("kati","ts_trunk"),"Hands Open for Kicks","Always on · boosts Shin line · Lv.38 · kick accuracy +1.5%, kick points +4%",r=>({hit:{kick:0.015*r},pts:{kick:0.04*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.kati.push(SKX("kati_1b5",1,10,"kati_1b4",["punch", "power"],_rsch("kati","ts_trunk"),"Tha Sao Thunder Fist","Lv.42 · Legend · one punch the whole arena hears · punch power +18%, punch accuracy +4%, punch points +8%",r=>({dmg:{punch:0.18*r},hit:{punch:0.04*r},pts:{punch:0.08*r}}),{lv:42,br:1,nd:5}));
SKILLS.kati.push(SKX("kati_2a1",2,6,"ts_fort",["dur", "comp"],_rsch("kati","ts_fort"),"Standing in the Storm","Lv.26 · Heart That Won't Retreat · no step back, even on low health · +4% accuracy at low health, recovery +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_2a2",2,7,"kati_2a1",["comp"],_rsch("kati","ts_fort"),"Sirichai Spirit","Always on · Lv.30 · morale effect +1%, +1% accuracy at low health",r=>({mor:0.01*r,clutch:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_2a3",2,8,"kati_2a2",["stamina", "dur"],_rsch("kati","ts_fort"),"Tha Sao Rises Again","Lv.34 · Heart That Won't Retreat · gets up stronger than before · recovery +15%, +3% accuracy at low health, stamina use -2%",r=>({regen:0.15*r,clutch:0.03*r,staSave:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_2a4",2,9,"kati_2a3",["comp", "kick"],_rsch("kati","ts_fort"),"Heart Behind the Shins","Always on · boosts Shin line · Lv.38 · kick power +3%",r=>({dmg:{kick:0.03*r}}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.kati.push(SKX("kati_2a5",2,10,"kati_2a4",["comp", "stamina"],_rsch("kati","ts_fort"),"150% Heart","Lv.42 · Legend · the last round hits harder than the first · +6% accuracy at low health, recovery +15%, morale effect +2%",r=>({clutch:0.06*r,regen:0.15*r,mor:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_2b1",2,6,"ts_fort",["guard", "counter"],_rsch("kati","ts_fort"),"Java Hurls the Spear","Lv.26 · Iron Guard, Quick Return · Mae mai: step outside, counter to the ribs · counters +4%, evade +1.5%",r=>({ctr:0.04*r,evade:0.015*r}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_2b2",2,7,"kati_2b1",["guard"],_rsch("kati","ts_fort"),"Guard Never Drops","Always on · Lv.30 · evade +0.8%, clinch defense +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_2b3",2,8,"kati_2b2",["guard", "elbow"],_rsch("kati","ts_fort"),"Planting the Peg","Lv.34 · Iron Guard, Quick Return · Mae mai: elbow meets the kick, then counter · counters +3%, counter-punch power +12%, clinch defense +0.4",r=>({ctr:0.03*r,ctrDmg:0.12*r,clDef:0.4*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_2b4",2,9,"kati_2b3",["guard", "punch"],_rsch("kati","ts_fort"),"Guard Feeds the Hands","Always on · boosts Punch & elbow line · Lv.38 · counter-punch power +5%, punch accuracy +1%",r=>({ctrDmg:0.05*r,hit:{punch:0.01*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.kati.push(SKX("kati_2b5",2,10,"kati_2b4",["guard", "iq"],_rsch("kati","ts_fort"),"Wall That Strikes Back","Lv.42 · Legend · every blow taken comes back double · evade +3%, counters +5%, counter-punch power +15%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.15*r}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_0a1",0,6,"cy_soar",["elbow", "speed"],_rsch("mali","cy_soar"),"Lightning Leap Elbow","Lv.26 · Soaring Elbows · leap in with an elbow · elbow power +14%, elbow accuracy +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_0a2",0,7,"mali_0a1",["elbow"],_rsch("mali","cy_soar"),"Chaiya Spring Legs","Always on · Lv.30 · knee power +2%, elbow power +2%",r=>({dmg:{knee:0.02*r,elbow:0.02*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_0a3",0,8,"mali_0a2",["elbow", "foot"],_rsch("mali","cy_soar"),"Mid-Air Back Elbow","Lv.34 · Soaring Elbows · spin back elbow while airborne · elbow power +12%, elbow points +10%",r=>({dmg:{elbow:0.12*r},pts:{elbow:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_0a4",0,9,"mali_0a3",["elbow", "kick"],_rsch("mali","cy_soar"),"Soar, Then Kick","Always on · boosts Kick & speed line · Lv.38 · kick accuracy +1.5%, kick power +2%",r=>({hit:{kick:0.015*r},dmg:{kick:0.02*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.mali.push(SKX("mali_0a5",0,10,"mali_0a4",["elbow", "knee"],_rsch("mali","cy_soar"),"Garuda Elbow","Lv.42 · Legend · the smallest girl's heaviest elbow · elbow power +20%, knee power +10%, elbow accuracy +3%",r=>({dmg:{elbow:0.2*r,knee:0.1*r},hit:{elbow:0.03*r}}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_0b1",0,6,"cy_soar",["knee", "clinch"],_rsch("mali","cy_soar"),"Chaiya Clinch Knee","Lv.26 · Clinch Elbow and Knee · lock the neck, straight knee · knee power +14%, clinch defense +0.3",r=>({dmg:{knee:0.14*r},clDef:0.3*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_0b2",0,7,"mali_0b1",["clinch"],_rsch("mali","cy_soar"),"Chaiya Strong Neck","Always on · Lv.30 · clinch defense +0.3, knee accuracy +1%",r=>({clDef:0.3*r,hit:{knee:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_0b3",0,8,"mali_0b2",["knee", "elbow"],_rsch("mali","cy_soar"),"Knee Then Elbow","Lv.34 · Clinch Elbow and Knee · knee opens, elbow follows · knee power +10%, elbow power +8%, knee points +8%",r=>({dmg:{knee:0.1*r,elbow:0.08*r},pts:{knee:0.08*r}}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_0b4",0,9,"mali_0b3",["clinch", "guard"],_rsch("mali","cy_soar"),"Clinch Shuts the Gate","Always on · boosts Defence line · Lv.38 · clinch defense +0.3, evade +0.8%",r=>({clDef:0.3*r,evade:0.008*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.mali.push(SKX("mali_0b5",0,10,"mali_0b4",["knee", "elbow"],_rsch("mali","cy_soar"),"Twin Erawan Neck Pull","Lv.42 · Legend · two-beat neck pull · knee power +16%, elbow power +12%, knee accuracy +3%",r=>({dmg:{knee:0.16*r,elbow:0.12*r},hit:{knee:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_1a1",1,6,"cy_gale",["kick", "speed"],_rsch("mali","cy_gale"),"Leaf-in-the-Wind Kick","Lv.26 · Chaiya Wind Kicks · light kick that never misses · kick accuracy +4%, kick power +10%",r=>({hit:{kick:0.04*r},dmg:{kick:0.1*r}}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_1a2",1,7,"mali_1a1",["foot"],_rsch("mali","cy_gale"),"Light as Wind","Always on · Lv.30 · evade +0.8%, stamina use -1%",r=>({evade:0.008*r,staSave:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_1a3",1,8,"mali_1a2",["kick", "foot"],_rsch("mali","cy_gale"),"Jasmine Opening Kick","Lv.34 · Chaiya Wind Kicks · a kick the judges can't miss · kick points +12%, kick accuracy +3%",r=>({pts:{kick:0.12*r},hit:{kick:0.03*r}}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_1a4",1,9,"mali_1a3",["foot", "guard"],_rsch("mali","cy_gale"),"Wind Into Guard","Always on · boosts Defence line · Lv.38 · evade +1.2%",r=>({evade:0.012*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.mali.push(SKX("mali_1a5",1,10,"mali_1a4",["kick", "speed"],_rsch("mali","cy_gale"),"Jasmine Storm","Lv.42 · Legend · kick after kick until they can't follow · kick power +16%, kick accuracy +5%, evade +2%",r=>({dmg:{kick:0.16*r},hit:{kick:0.05*r},evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_1b1",1,6,"cy_gale",["foot", "stamina"],_rsch("mali","cy_gale"),"Quick Three-Step","Lv.26 · Dance Without Tiring · the three-step, twice as fast · recovery +15%, evade +1.5%",r=>({regen:0.15*r,evade:0.015*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_1b2",1,7,"mali_1b1",["stamina"],_rsch("mali","cy_gale"),"Chaiya Long Breath","Always on · Lv.30 · recovery +5%, stamina use -1%",r=>({regen:0.05*r,staSave:0.01*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_1b3",1,8,"mali_1b2",["foot", "kick"],_rsch("mali","cy_gale"),"Dance, Then Attack","Lv.34 · Dance Without Tiring · dance to fool them, then step in · kick points +8%, recovery +10%, morale effect +1%",r=>({pts:{kick:0.08*r},regen:0.1*r,mor:0.01*r}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_1b4",1,9,"mali_1b3",["stamina", "elbow"],_rsch("mali","cy_gale"),"Saved Breath for Elbows","Always on · boosts Elbow line · Lv.38 · elbow power +3%",r=>({dmg:{elbow:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.mali.push(SKX("mali_1b5",1,10,"mali_1b4",["foot", "stamina"],_rsch("mali","cy_gale"),"Chaiya Dance of War","Lv.42 · Legend · boxing as beautiful as a performance · recovery +20%, evade +2.5%, stamina use -3%",r=>({regen:0.2*r,evade:0.025*r,staSave:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_2a1",2,6,"cy_meru",["guard", "dur"],_rsch("mali","cy_meru"),"Three-Layer Guard","Lv.26 · Chaiya Fortress · a guard stacked three deep · clinch defense +0.6, evade +1.5%",r=>({clDef:0.6*r,evade:0.015*r}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_2a2",2,7,"mali_2a1",["guard"],_rsch("mali","cy_meru"),"Rooted Stance","Always on · Lv.30 · clinch defense +0.3, recovery +3%",r=>({clDef:0.3*r,regen:0.03*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_2a3",2,8,"mali_2a2",["guard", "elbow"],_rsch("mali","cy_meru"),"Inao Thrusts the Kris","Lv.34 · Chaiya Fortress · Mae mai: parry, elbow to the ribs · counters +3%, counter-punch power +10%, clinch defense +0.4",r=>({ctr:0.03*r,ctrDmg:0.1*r,clDef:0.4*r}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_2a4",2,9,"mali_2a3",["guard", "elbow"],_rsch("mali","cy_meru"),"Fortress Feeds the Elbows","Always on · boosts Elbow line · Lv.38 · elbow accuracy +1.5%, counter-punch power +3%",r=>({hit:{elbow:0.015*r},ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.mali.push(SKX("mali_2a5",2,10,"mali_2a4",["guard", "dur"],_rsch("mali","cy_meru"),"Unshaken Meru","Lv.42 · Legend · the mountain that never moves · clinch defense +1, evade +3%, recovery +10%",r=>({clDef:1*r,evade:0.03*r,regen:0.1*r}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_2b1",2,6,"cy_meru",["comp", "counter"],_rsch("mali","cy_meru"),"Smile and Counter","Lv.26 · Smile Through Every Blow · smile at them, then counter · counters +4%, morale effect +1%",r=>({ctr:0.04*r,mor:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_2b2",2,7,"mali_2b1",["comp"],_rsch("mali","cy_meru"),"Heart Bigger Than Her","Always on · Lv.30 · +1.5% accuracy at low health, morale effect +0.5%",r=>({clutch:0.015*r,mor:0.005*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_2b3",2,8,"mali_2b2",["comp", "dur"],_rsch("mali","cy_meru"),"Can't Fall While Smiling","Lv.34 · Smile Through Every Blow · still smiling, still fighting · +4% accuracy at low health, recovery +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_2b4",2,9,"mali_2b3",["comp", "foot"],_rsch("mali","cy_meru"),"Light Heart, Light Feet","Always on · boosts Kick & speed line · Lv.38 · kick accuracy +1%, recovery +3%",r=>({hit:{kick:0.01*r},regen:0.03*r}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.mali.push(SKX("mali_2b5",2,10,"mali_2b4",["comp", "stamina"],_rsch("mali","cy_meru"),"Jasmine Never Wilts","Lv.42 · Legend · brighter every round · +5% accuracy at low health, counters +4%, morale effect +2%",r=>({clutch:0.05*r,ctr:0.04*r,mor:0.02*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_0a1",0,6,"lb_proof",["counter", "speed"],_rsch("rin","lb_proof"),"Counter Before Three","Lv.26 · Razor Counters · counter before they finish the count · counters +4%, counter-punch power +12%",r=>({ctr:0.04*r,ctrDmg:0.12*r}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_0a2",0,7,"rin_0a1",["counter"],_rsch("rin","lb_proof"),"Half-Second Timing","Always on · Lv.30 · counters +1.2%",r=>({ctr:0.012*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_0a3",0,8,"rin_0a2",["counter", "punch"],_rsch("rin","lb_proof"),"Double Kris Thrust","Lv.34 · Razor Counters · two straight counters back to back · counter-punch power +16%, punch accuracy +2%",r=>({ctrDmg:0.16*r,hit:{punch:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_0a4",0,9,"rin_0a3",["counter", "iq"],_rsch("rin","lb_proof"),"Counter, Then Take Notes","Always on · boosts Ring-reading line · Lv.38 · corner orders +8%, base accuracy +0.3%",r=>({corner:0.08*r,prep:0.003*r}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.rin.push(SKX("rin_0a5",0,10,"rin_0a4",["counter", "iq"],_rsch("rin","lb_proof"),"Counter Theorem","Lv.42 · Legend · proven: every blow can be countered · counters +6%, counter-punch power +22%, punch accuracy +3%",r=>({ctr:0.06*r,ctrDmg:0.22*r,hit:{punch:0.03*r}}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_0b1",0,6,"lb_proof",["counter", "foot"],_rsch("rin","lb_proof"),"Bird Parts the Nest","Lv.26 · Veil of Feints · Mae mai: step inside, parry, counter · evade +2%, counters +3%",r=>({evade:0.02*r,ctr:0.03*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_0b2",0,7,"rin_0b1",["counter", "guard"],_rsch("rin","lb_proof"),"No Openings","Always on · Lv.30 · evade +0.8%, clinch defense +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_0b3",0,8,"rin_0b2",["counter", "knee"],_rsch("rin","lb_proof"),"Lure Into the Knee","Lv.34 · Veil of Feints · draw them in, knee on the way · counters +3%, knee power +10%",r=>({ctr:0.03*r,dmg:{knee:0.1*r}}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_0b4",0,9,"rin_0b3",["counter", "kick"],_rsch("rin","lb_proof"),"Slip, Then Teep","Always on · boosts Range line · Lv.38 · kick accuracy +1.5%, kick points +3%",r=>({hit:{kick:0.015*r},pts:{kick:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.rin.push(SKX("rin_0b5",0,10,"rin_0b4",["counter", "speed"],_rsch("rin","lb_proof"),"Lopburi Shadow","Lv.42 · Legend · they only ever hit the shadow · evade +3%, counters +5%, counter-punch power +12%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.12*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_1a1",1,6,"lb_book",["iq", "comp"],_rsch("rin","lb_book"),"Chapter One: Read Them","Lv.26 · Secret Manual · read them from round one · corner orders +30%, base accuracy +1%",r=>({corner:0.3*r,prep:0.01*r}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_1a2",1,7,"rin_1a1",["iq"],_rsch("rin","lb_book"),"Notes Every Round","Always on · Lv.30 · base accuracy +0.4%, corner orders +5%",r=>({prep:0.004*r,corner:0.05*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_1a3",1,8,"rin_1a2",["iq", "foot"],_rsch("rin","lb_book"),"Chapter Three: Cut the Exits","Lv.34 · Secret Manual · pin them in the corner · corner orders +25%, evade +1.5%, counters +2%",r=>({corner:0.25*r,evade:0.015*r,ctr:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_1a4",1,9,"rin_1a3",["iq", "kick"],_rsch("rin","lb_book"),"Distance Math","Always on · boosts Range line · Lv.38 · kick accuracy +1.5%, evade +0.6%",r=>({hit:{kick:0.015*r},evade:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.rin.push(SKX("rin_1a5",1,10,"rin_1a4",["iq", "comp"],_rsch("rin","lb_book"),"Appendix: Won Before the Bell","Lv.42 · Legend · won in the notebook first · corner orders +50%, base accuracy +1.8%, counters +3%",r=>({corner:0.5*r,prep:0.018*r,ctr:0.03*r}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_1b1",1,6,"lb_book",["iq", "counter"],_rsch("rin","lb_book"),"Double Feint","Lv.26 · Read and Play · a feint inside a feint · counters +3%, evade +1.5%, corner orders +10%",r=>({ctr:0.03*r,evade:0.015*r,corner:0.1*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_1b2",1,7,"rin_1b1",["iq"],_rsch("rin","lb_book"),"Unblinking","Always on · Lv.30 · counters +0.8%, base accuracy +0.2%",r=>({ctr:0.008*r,prep:0.002*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_1b3",1,8,"rin_1b2",["iq", "counter"],_rsch("rin","lb_book"),"Into the Trap","Lv.34 · Read and Play · leave a gap, spring the trap · counter-punch power +14%, counters +3%",r=>({ctrDmg:0.14*r,ctr:0.03*r}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_1b4",1,9,"rin_1b3",["iq", "counter"],_rsch("rin","lb_book"),"Read, Then Counter","Always on · boosts Counter line · Lv.38 · counters +1.2%, counter-punch power +3%",r=>({ctr:0.012*r,ctrDmg:0.03*r}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.rin.push(SKX("rin_1b5",1,10,"rin_1b4",["iq", "comp"],_rsch("rin","lb_book"),"Chess in the Ring","Lv.42 · Legend · five moves ahead · corner orders +35%, counters +5%, counter-punch power +10%",r=>({corner:0.35*r,ctr:0.05*r,ctrDmg:0.1*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_2a1",2,6,"lb_circle",["kick", "foot"],_rsch("rin","lb_circle"),"Lane-Cutting Teep","Lv.26 · Teep Wall · teep that stops the advance · kick accuracy +4%, kick points +10%",r=>({hit:{kick:0.04*r},pts:{kick:0.1*r}}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_2a2",2,7,"rin_2a1",["kick"],_rsch("rin","lb_circle"),"Long Legs, Wide Ring","Always on · Lv.30 · evade +0.8%, kick points +2%",r=>({evade:0.008*r,pts:{kick:0.02*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_2a3",2,8,"rin_2a2",["kick", "power"],_rsch("rin","lb_circle"),"Lopburi Jumping Teep","Lv.34 · Teep Wall · full-power jumping teep · kick power +14%, kick accuracy +2%",r=>({dmg:{kick:0.14*r},hit:{kick:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_2a4",2,9,"rin_2a3",["kick", "counter"],_rsch("rin","lb_circle"),"Perfect Counter Range","Always on · boosts Counter line · Lv.38 · counters +1%, counter-punch power +3%",r=>({ctr:0.01*r,ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.rin.push(SKX("rin_2a5",2,10,"rin_2a4",["kick", "foot"],_rsch("rin","lb_circle"),"Gates of Lopburi","Lv.42 · Legend · no one gets past the teep · kick accuracy +5%, kick points +12%, evade +2%",r=>({hit:{kick:0.05*r},pts:{kick:0.12*r},evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_2b1",2,6,"lb_circle",["foot", "speed"],_rsch("rin","lb_circle"),"Circle Left","Lv.26 · Outer Circle · circle off the power hand · evade +2.5%, stamina use -2%",r=>({evade:0.025*r,staSave:0.02*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_2b2",2,7,"rin_2b1",["foot"],_rsch("rin","lb_circle"),"Economical Steps","Always on · Lv.30 · stamina use -1.5%",r=>({staSave:0.015*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_2b3",2,8,"rin_2b2",["foot", "kick"],_rsch("rin","lb_circle"),"Virulhok Turns Back","Lv.34 · Outer Circle · Mae mai: turn from the kick, heel into the thigh · kick power +10%, evade +1.5%, counters +2%",r=>({dmg:{kick:0.1*r},evade:0.015*r,ctr:0.02*r}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_2b4",2,9,"rin_2b3",["foot", "iq"],_rsch("rin","lb_circle"),"Distance Buys Thinking Time","Always on · boosts Ring-reading line · Lv.38 · corner orders +8%, base accuracy +0.2%",r=>({corner:0.08*r,prep:0.002*r}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.rin.push(SKX("rin_2b5",2,10,"rin_2b4",["foot", "speed"],_rsch("rin","lb_circle"),"Lopburi Orbit","Lv.42 · Legend · they spin chasing her · evade +3.5%, stamina use -3%, kick accuracy +3%",r=>({evade:0.035*r,staSave:0.03*r,hit:{kick:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_0a1",0,6,"kr_genius",["punch", "power"],_rsch("ploy","kr_genius"),"Triple Buffalo Swing","Lv.26 · Wrecking Swings · three swings in a row · punch power +14%, punch points +6%",r=>({dmg:{punch:0.14*r},pts:{punch:0.06*r}}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_0a2",0,7,"ploy_0a1",["punch"],_rsch("ploy","kr_genius"),"Korat Shoulders","Always on · Lv.30 · punch power +3%",r=>({dmg:{punch:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_0a3",0,8,"ploy_0a2",["punch", "speed"],_rsch("ploy","kr_genius"),"Neckline Swing","Lv.34 · Wrecking Swings · a swing to the neckline · punch power +14%, punch accuracy +3%",r=>({dmg:{punch:0.14*r},hit:{punch:0.03*r}}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_0a4",0,9,"ploy_0a3",["punch", "kick"],_rsch("ploy","kr_genius"),"Fists Open the Neck","Always on · boosts Neck-kick line · Lv.38 · kick power +2.5%, kick accuracy +1%",r=>({dmg:{kick:0.025*r},hit:{kick:0.01*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.ploy.push(SKX("ploy_0a5",0,10,"ploy_0a4",["punch", "power"],_rsch("ploy","kr_genius"),"White Buffalo Topples the Post","Lv.42 · Legend · the punch Korat talks about · punch power +22%, punch accuracy +3%, punch points +6%",r=>({dmg:{punch:0.22*r},hit:{punch:0.03*r},pts:{punch:0.06*r}}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_0b1",0,6,"kr_genius",["punch", "iq"],_rsch("ploy","kr_genius"),"One Punch Tells","Lv.26 · Genius Hands · one punch to measure the fight · punch accuracy +4%, punch points +10%",r=>({hit:{punch:0.04*r},pts:{punch:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_0b2",0,7,"ploy_0b1",["punch"],_rsch("ploy","kr_genius"),"Punch Calculation","Always on · Lv.30 · punch accuracy +1.2%, base accuracy +0.2%",r=>({hit:{punch:0.012*r},prep:0.002*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_0b3",0,8,"ploy_0b2",["punch", "counter"],_rsch("ploy","kr_genius"),"Swing Counter","Lv.34 · Genius Hands · counter with a swing · counters +3%, counter-punch power +12%",r=>({ctr:0.03*r,ctrDmg:0.12*r}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_0b4",0,9,"ploy_0b3",["punch", "iq"],_rsch("ploy","kr_genius"),"Read Through the Fists","Always on · boosts Tiger wall line · Lv.38 · counters +1%, corner orders +5%",r=>({ctr:0.01*r,corner:0.05*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.ploy.push(SKX("ploy_0b5",0,10,"ploy_0b4",["punch", "iq"],_rsch("ploy","kr_genius"),"Unbeaten Gift","Lv.42 · Legend · the hands of someone who never loses · punch accuracy +5%, punch power +14%, counters +3%",r=>({hit:{punch:0.05*r},dmg:{punch:0.14*r},ctr:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_1a1",1,6,"kr_tiger",["kick", "power"],_rsch("ploy","kr_tiger"),"Both-Side Neck Kick","Lv.26 · Neck-Breaker Kicks · neck kicks left and right · kick power +14%, kick accuracy +2%",r=>({dmg:{kick:0.14*r},hit:{kick:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_1a2",1,7,"ploy_1a1",["kick"],_rsch("ploy","kr_tiger"),"Korat Shins","Always on · Lv.30 · kick power +3%",r=>({dmg:{kick:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_1a3",1,8,"ploy_1a2",["kick", "foot"],_rsch("ploy","kr_tiger"),"Deer Looks Back","Lv.34 · Neck-Breaker Kicks · Look mai: side teep, then a spinning heel · kick power +12%, kick points +10%",r=>({dmg:{kick:0.12*r},pts:{kick:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_1a4",1,9,"ploy_1a3",["kick", "guard"],_rsch("ploy","kr_tiger"),"Shins Guard the Ring","Always on · boosts Tiger wall line · Lv.38 · clinch defense +0.3, evade +0.6%",r=>({clDef:0.3*r,evade:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.ploy.push(SKX("ploy_1a5",1,10,"ploy_1a4",["kick", "power"],_rsch("ploy","kr_tiger"),"Golden Tiger Pounce","Lv.42 · Legend · one kick to close it · kick power +20%, kick accuracy +4%, kick points +8%",r=>({dmg:{kick:0.2*r},hit:{kick:0.04*r},pts:{kick:0.08*r}}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_1b1",1,6,"kr_tiger",["knee", "clinch"],_rsch("ploy","kr_tiger"),"Diagonal Clinch Knee","Lv.26 · Korat Clinch · clinch knee to the ribs · knee power +14%, clinch defense +0.3",r=>({dmg:{knee:0.14*r},clDef:0.3*r}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_1b2",1,7,"ploy_1b1",["clinch"],_rsch("ploy","kr_tiger"),"Iron-Arm Lock","Always on · Lv.30 · clinch defense +0.3, knee accuracy +1%",r=>({clDef:0.3*r,hit:{knee:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_1b3",1,8,"ploy_1b2",["knee", "power"],_rsch("ploy","kr_tiger"),"Korat Curved Knee","Lv.34 · Korat Clinch · curving knee to the side · knee power +14%, knee points +8%",r=>({dmg:{knee:0.14*r},pts:{knee:0.08*r}}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_1b4",1,9,"ploy_1b3",["clinch", "punch"],_rsch("ploy","kr_tiger"),"Pull the Neck, Feed the Fist","Always on · boosts Korat fist line · Lv.38 · punch power +3%",r=>({dmg:{punch:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.ploy.push(SKX("ploy_1b5",1,10,"ploy_1b4",["knee", "clinch"],_rsch("ploy","kr_tiger"),"Tiger Lock","Lv.42 · Legend · whoever she locks runs out of air · knee power +20%, clinch defense +0.6, knee accuracy +3%",r=>({dmg:{knee:0.2*r},clDef:0.6*r,hit:{knee:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_2a1",2,6,"p_crown",["guard", "counter"],_rsch("ploy","p_crown"),"High Guard, Swing Back","Lv.26 · Wall That Hits Back · high guard, swing counter · counters +4%, counter-punch power +10%",r=>({ctr:0.04*r,ctrDmg:0.1*r}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_2a2",2,7,"ploy_2a1",["guard"],_rsch("ploy","p_crown"),"Korat Guard","Always on · Lv.30 · evade +0.8%, clinch defense +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_2a3",2,8,"ploy_2a2",["guard", "power"],_rsch("ploy","p_crown"),"Naga Twists Its Tail","Lv.34 · Wall That Hits Back · Mae mai: catch the kick, twist it out, knee · counter-punch power +18%, counters +2%",r=>({ctrDmg:0.18*r,ctr:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_2a4",2,9,"ploy_2a3",["guard", "punch"],_rsch("ploy","p_crown"),"Counter with a Swing","Always on · boosts Korat fist line · Lv.38 · punch power +2%, counter-punch power +3%",r=>({dmg:{punch:0.02*r},ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.ploy.push(SKX("ploy_2a5",2,10,"ploy_2a4",["guard", "comp"],_rsch("ploy","p_crown"),"Golden Tiger Wall","Lv.42 · Legend · a wall that bites back · evade +3%, counters +5%, counter-punch power +15%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.15*r}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_2b1",2,6,"p_crown",["iq", "comp"],_rsch("ploy","p_crown"),"Round One Plan","Lv.26 · Sister's Plans · open by the plan · corner orders +30%, base accuracy +1%",r=>({corner:0.3*r,prep:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_2b2",2,7,"ploy_2b1",["iq"],_rsch("ploy","p_crown"),"Pailin's Notebook","Always on · Lv.30 · corner orders +5%, base accuracy +0.3%",r=>({corner:0.05*r,prep:0.003*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_2b3",2,8,"ploy_2b2",["iq", "stamina"],_rsch("ploy","p_crown"),"Final Round Plan","Lv.34 · Sister's Plans · the plan for the hardest round · corner orders +25%, +3% accuracy at low health, recovery +8%",r=>({corner:0.25*r,clutch:0.03*r,regen:0.08*r}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_2b4",2,9,"ploy_2b3",["iq", "kick"],_rsch("ploy","p_crown"),"Plan to Open the Kicks","Always on · boosts Neck-kick line · Lv.38 · kick accuracy +1.5%, kick points +3%",r=>({hit:{kick:0.015*r},pts:{kick:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.ploy.push(SKX("ploy_2b5",2,10,"ploy_2b4",["iq", "comp"],_rsch("ploy","p_crown"),"Tiger's Legacy","Lv.42 · Legend · what her sister wanted to see · corner orders +45%, base accuracy +1.5%, counters +4%",r=>({corner:0.45*r,prep:0.015*r,ctr:0.04*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_0a1",0,6,"f_sky",["elbow", "speed"],_rsch("fah","f_sky"),"Twin Flash Elbows","Lv.26 · Lightning Elbows · left-right elbows like a flash · elbow power +14%, elbow accuracy +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_0a2",0,7,"fah_0a1",["elbow"],_rsch("fah","f_sky"),"Sharp Elbows","Always on · Lv.30 · elbow power +3%",r=>({dmg:{elbow:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_0a3",0,8,"fah_0a2",["elbow", "power"],_rsch("fah","f_sky"),"Guard-Piercing Elbow","Lv.34 · Lightning Elbows · drive the elbow through the guard · elbow power +14%, elbow points +8%",r=>({dmg:{elbow:0.14*r},pts:{elbow:0.08*r}}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_0a4",0,9,"fah_0a3",["elbow", "punch"],_rsch("fah","f_sky"),"Elbows Open the Rush","Always on · boosts Reckless rush line · Lv.38 · punch power +2.5%, stamina use -0.5%",r=>({dmg:{punch:0.025*r},staSave:0.005*r}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.fah.push(SKX("fah_0a5",0,10,"fah_0a4",["elbow", "power"],_rsch("fah","f_sky"),"Sky Strikes Down","Lv.42 · Legend · one elbow like a thunderbolt · elbow power +22%, elbow accuracy +4%",r=>({dmg:{elbow:0.22*r},hit:{elbow:0.04*r}}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_0b1",0,6,"f_sky",["elbow", "foot"],_rsch("fah","f_sky"),"Spinning Show Elbow","Lv.26 · Showtime Elbows · a spin made for the cameras · elbow points +14%, morale effect +1%",r=>({pts:{elbow:0.14*r},mor:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_0b2",0,7,"fah_0b1",["elbow"],_rsch("fah","f_sky"),"Pretty Moves Get Shown","Always on · Lv.30 · elbow points +3%, morale effect +0.4%",r=>({pts:{elbow:0.03*r},mor:0.004*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_0b3",0,8,"fah_0b2",["elbow", "foot"],_rsch("fah","f_sky"),"Dancing Elbows","Lv.34 · Showtime Elbows · dance in, elbow out · evade +1.5%, elbow power +10%, elbow points +6%",r=>({evade:0.015*r,dmg:{elbow:0.1*r},pts:{elbow:0.06*r}}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_0b4",0,9,"fah_0b3",["elbow", "comp"],_rsch("fah","f_sky"),"Show Off, Then Smile","Always on · boosts Smirk line · Lv.38 · +1% accuracy at low health, morale effect +0.5%",r=>({clutch:0.01*r,mor:0.005*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.fah.push(SKX("fah_0b5",0,10,"fah_0b4",["elbow", "comp"],_rsch("fah","f_sky"),"Fah's Stage","Lv.42 · Legend · the whole arena is her stage · elbow points +16%, elbow power +12%, morale effect +2%",r=>({pts:{elbow:0.16*r},dmg:{elbow:0.12*r},mor:0.02*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_1a1",1,6,"f_heaven",["punch", "stamina"],_rsch("fah","f_heaven"),"Seven-Punch Combo","Lv.26 · Non-Stop Rush · a combo too long to count · punch points +10%, punch power +10%, stamina use -2%",r=>({pts:{punch:0.1*r},dmg:{punch:0.1*r},staSave:0.02*r}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_1a2",1,7,"fah_1a1",["stamina"],_rsch("fah","f_heaven"),"Iron Lungs","Always on · Lv.30 · stamina use -1.5%, recovery +3%",r=>({staSave:0.015*r,regen:0.03*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_1a3",1,8,"fah_1a2",["punch", "power"],_rsch("fah","f_heaven"),"Pin to the Corner","Lv.34 · Non-Stop Rush · chase them into the corner · punch power +16%, punch accuracy +2%",r=>({dmg:{punch:0.16*r},hit:{punch:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_1a4",1,9,"fah_1a3",["punch", "comp"],_rsch("fah","f_heaven"),"Rush Until They Flinch","Always on · boosts Smirk line · Lv.38 · +1% accuracy at low health, counters +0.6%",r=>({clutch:0.01*r,ctr:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.fah.push(SKX("fah_1a5",1,10,"fah_1a4",["punch", "stamina"],_rsch("fah","f_heaven"),"Storm That Never Calms","Lv.42 · Legend · the whole fight at full speed · punch power +18%, punch points +10%, stamina use -4%",r=>({dmg:{punch:0.18*r},pts:{punch:0.1*r},staSave:0.04*r}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_1b1",1,6,"f_heaven",["punch", "comp"],_rsch("fah","f_heaven"),"Do-or-Die Punch","Lv.26 · All the Way Reckless · everything in one punch · punch power +18%, +2% accuracy at low health",r=>({dmg:{punch:0.18*r},clutch:0.02*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_1b2",1,7,"fah_1b1",["comp"],_rsch("fah","f_heaven"),"Hot Blood","Always on · Lv.30 · +1.2% accuracy at low health, punch power +1%",r=>({clutch:0.012*r,dmg:{punch:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_1b3",1,8,"fah_1b2",["punch", "dur"],_rsch("fah","f_heaven"),"Trade and Stay","Lv.34 · All the Way Reckless · trading in the middle of the ring · punch power +14%, clinch defense +0.3",r=>({dmg:{punch:0.14*r},clDef:0.3*r}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_1b4",1,9,"fah_1b3",["comp", "elbow"],_rsch("fah","f_heaven"),"Crazy Enough to Elbow","Always on · boosts Tiger elbow line · Lv.38 · elbow power +3%",r=>({dmg:{elbow:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.fah.push(SKX("fah_1b5",1,10,"fah_1b4",["punch", "power"],_rsch("fah","f_heaven"),"Lightning Strikes the Sky","Lv.42 · Legend · a punch nobody dares to take · punch power +24%, punch accuracy +3%, +3% accuracy at low health",r=>({dmg:{punch:0.24*r},hit:{punch:0.03*r},clutch:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_2a1",2,6,"f_star",["comp", "iq"],_rsch("fah","f_star"),"Mid-Round Smirk","Lv.26 · Taunt Until They Break · smirk until they charge · counters +4%, evade +1.5%",r=>({ctr:0.04*r,evade:0.015*r}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_2a2",2,7,"fah_2a1",["comp"],_rsch("fah","f_star"),"Smile That Won't Quit","Always on · Lv.30 · morale effect +0.5%, counters +0.6%",r=>({mor:0.005*r,ctr:0.006*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_2a3",2,8,"fah_2a2",["comp", "counter"],_rsch("fah","f_star"),"Point and Counter","Lv.34 · Taunt Until They Break · point, then counter the charge · counters +3%, counter-punch power +14%",r=>({ctr:0.03*r,ctrDmg:0.14*r}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_2a4",2,9,"fah_2a3",["comp", "elbow"],_rsch("fah","f_star"),"Bait Into Elbow Range","Always on · boosts Tiger elbow line · Lv.38 · elbow accuracy +1.5%, counter-punch power +2%",r=>({hit:{elbow:0.015*r},ctrDmg:0.02*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.fah.push(SKX("fah_2a5",2,10,"fah_2a4",["comp", "counter"],_rsch("fah","f_star"),"Queen of the Smirk","Lv.42 · Legend · one smirk wrecks their shape · counters +6%, counter-punch power +16%, evade +2%",r=>({ctr:0.06*r,ctrDmg:0.16*r,evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_2b1",2,6,"f_star",["comp", "dur"],_rsch("fah","f_star"),"Smiling Through the Cut","Lv.26 · Smile Wider When Hurt · smiling through the pain · +4% accuracy at low health, recovery +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_2b2",2,7,"fah_2b1",["comp"],_rsch("fah","f_star"),"Won't Fall Before Her Fans","Always on · Lv.30 · +1.5% accuracy at low health",r=>({clutch:0.015*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_2b3",2,8,"fah_2b2",["comp", "stamina"],_rsch("fah","f_star"),"Back Up for the Show","Lv.34 · Smile Wider When Hurt · up again like nothing happened · recovery +15%, morale effect +1.5%",r=>({regen:0.15*r,mor:0.015*r}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_2b4",2,9,"fah_2b3",["comp", "punch"],_rsch("fah","f_star"),"Smile, Then Rush","Always on · boosts Reckless rush line · Lv.38 · stamina use -1%, punch points +3%",r=>({staSave:0.01*r,pts:{punch:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.fah.push(SKX("fah_2b5",2,10,"fah_2b4",["comp", "stamina"],_rsch("fah","f_star"),"A Star That Never Fades","Lv.42 · Legend · brightest in the last round · +6% accuracy at low health, recovery +18%, morale effect +2%",r=>({clutch:0.06*r,regen:0.18*r,mor:0.02*r}),{lv:42,br:1,nd:5}));
SHARED_SKILLS.push(SKX("sh3a1",3,4,"sh_ko4",["power", "punch"],"build","First Shot Hurts","Lv.16 · Quick Finish · open with a heavy shot · punch power +10%, kick power +6%",r=>({dmg:{punch:0.1*r,kick:0.06*r}}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3a2",3,5,"sh3a1",["power"],"build","Explosive Power","Always on · Lv.20 · punch power +2%, kick power +2%",r=>({dmg:{punch:0.02*r,kick:0.02*r}}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3a3",3,6,"sh3a2",["power", "speed"],"build","Closing Combo","Lv.26 · Quick Finish · a closer with every weapon · punch power +10%, elbow power +8%, knee power +8%",r=>({dmg:{punch:0.1*r,elbow:0.08*r,knee:0.08*r}}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh3a4",3,7,"sh3a3",["power"],"build","Power in Every Weapon","Always on · boosts school lines · Lv.32 · punch power +1.5%, kick power +1.5%, elbow power +1.5%, knee power +1.5%",r=>({dmg:{punch:0.015*r,kick:0.015*r,elbow:0.015*r,knee:0.015*r}}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh3a5",3,8,"sh3a4",["power", "speed"],"build","First-Round Knockout","Lv.38 · Legend · no need for round two · punch power +16%, kick power +10%, punch accuracy +2%",r=>({dmg:{punch:0.16*r,kick:0.1*r},hit:{punch:0.02*r}}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh3b1",3,4,"sh_ko4",["power", "dur"],"build","Trade and Win","Lv.16 · Heavy and Sturdy · take one to give a heavy one · punch power +8%, clinch defense +0.4",r=>({dmg:{punch:0.08*r},clDef:0.4*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3b2",3,5,"sh3b1",["dur"],"build","Thick Bones","Always on · Lv.20 · clinch defense +0.2, +0.8% accuracy at low health",r=>({clDef:0.2*r,clutch:0.008*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3b3",3,6,"sh3b2",["power", "clinch"],"build","Knee-Elbow Barrage","Lv.26 · Heavy and Sturdy · knees and elbows in the clinch · knee power +12%, elbow power +12%",r=>({dmg:{knee:0.12*r,elbow:0.12*r}}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh3b4",3,7,"sh3b3",["power"],"build","Accuracy in Every Weapon","Always on · boosts school lines · Lv.32 · punch accuracy +0.8%, kick accuracy +0.8%, elbow accuracy +0.8%, knee accuracy +0.8%",r=>({hit:{punch:0.008*r,kick:0.008*r,elbow:0.008*r,knee:0.008*r}}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh3b5",3,8,"sh3b4",["power", "dur"],"build","Knockout Tank","Lv.38 · Legend · nobody stops her once she moves · punch power +12%, knee power +10%, clinch defense +0.6",r=>({dmg:{punch:0.12*r,knee:0.1*r},clDef:0.6*r}),{lv:38,br:1,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh4a1",4,4,"sh_tc4",["iq", "foot"],"build","Clean Every Time","Lv.16 · Every Point Counts · strike where the judges see it · punch points +8%, kick points +8%",r=>({pts:{punch:0.08*r,kick:0.08*r}}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4a2",4,5,"sh4a1",["iq"],"build","Judge's Eye","Always on · Lv.20 · kick points +2%, punch points +2%",r=>({pts:{kick:0.02*r,punch:0.02*r}}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4a3",4,6,"sh4a2",["iq", "clinch"],"build","Clinch Scoring","Lv.26 · Every Point Counts · score with knees and elbows · knee points +10%, elbow points +10%, clinch defense +0.3",r=>({pts:{knee:0.1*r,elbow:0.1*r},clDef:0.3*r}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh4a4",4,7,"sh4a3",["iq"],"build","Points in Every Weapon","Always on · boosts school lines · Lv.32 · punch points +2%, kick points +2%, elbow points +2%, knee points +2%",r=>({pts:{punch:0.02*r,kick:0.02*r,elbow:0.02*r,knee:0.02*r}}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh4a5",4,8,"sh4a4",["iq", "comp"],"build","Winner on the Scorecard","Lv.38 · Legend · clear win, every round · punch points +12%, kick points +12%, base accuracy +1%",r=>({pts:{punch:0.12*r,kick:0.12*r},prep:0.01*r}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh4b1",4,4,"sh_tc4",["iq", "comp"],"build","Fight to the Plan","Lv.16 · Run the Fight · follow the plan every round · corner orders +25%, base accuracy +0.8%",r=>({corner:0.25*r,prep:0.008*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4b2",4,5,"sh4b1",["iq"],"build","Listen to the Corner","Always on · Lv.20 · corner orders +6%",r=>({corner:0.06*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4b3",4,6,"sh4b2",["iq", "foot"],"build","Mid-Round Adjustment","Lv.26 · Run the Fight · change the plan mid-round · corner orders +20%, evade +1.5%, counters +2%",r=>({corner:0.2*r,evade:0.015*r,ctr:0.02*r}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh4b4",4,7,"sh4b3",["iq"],"build","All-Round Ring IQ","Always on · boosts school lines · Lv.32 · base accuracy +0.4%, counters +0.6%",r=>({prep:0.004*r,ctr:0.006*r}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh4b5",4,8,"sh4b4",["iq", "comp"],"build","Master of Five Rounds","Lv.38 · Legend · in control for all five rounds · corner orders +40%, base accuracy +1.5%, evade +2%",r=>({corner:0.4*r,prep:0.015*r,evade:0.02*r}),{lv:38,br:1,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh5a1",5,4,"sh_ir4",["stamina", "dur"],"build","Deep Breaths","Lv.16 · Endless Gas Tank · breathing control between rounds · recovery +15%, stamina use -2%",r=>({regen:0.15*r,staSave:0.02*r}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5a2",5,5,"sh5a1",["stamina"],"build","Runner's Lungs","Always on · Lv.20 · recovery +4%, stamina use -0.8%",r=>({regen:0.04*r,staSave:0.008*r}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5a3",5,6,"sh5a2",["stamina", "foot"],"build","Five Rounds Full Power","Lv.26 · Endless Gas Tank · round five like round one · recovery +12%, stamina use -4%",r=>({regen:0.12*r,staSave:0.04*r}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh5a4",5,7,"sh5a3",["stamina"],"build","Energy That Holds","Always on · boosts school lines · Lv.32 · stamina use -1%, recovery +3%",r=>({staSave:0.01*r,regen:0.03*r}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh5a5",5,8,"sh5a4",["stamina", "dur"],"build","Engine Never Stops","Lv.38 · Legend · the longer it goes, the better · recovery +22%, stamina use -5%",r=>({regen:0.22*r,staSave:0.05*r}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh5b1",5,4,"sh_ir4",["dur", "guard"],"build","Take It Full","Lv.16 · Too Tough to Fall · eat a heavy shot without stepping back · clinch defense +0.6, evade +1%",r=>({clDef:0.6*r,evade:0.01*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5b2",5,5,"sh5b1",["dur"],"build","Iron Skin","Always on · Lv.20 · clinch defense +0.2, +0.8% accuracy at low health",r=>({clDef:0.2*r,clutch:0.008*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5b3",5,6,"sh5b2",["dur", "comp"],"build","Down and Up","Lv.26 · Too Tough to Fall · gets up every time · +4% accuracy at low health, recovery +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh5b4",5,7,"sh5b3",["dur"],"build","Unbreakable Nerve","Always on · boosts school lines · Lv.32 · +1% accuracy at low health, morale effect +0.5%",r=>({clutch:0.01*r,mor:0.005*r}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh5b5",5,8,"sh5b4",["dur", "guard"],"build","Mountain Doesn't Fall","Lv.38 · Legend · no one knocks over a mountain · clinch defense +1, +5% accuracy at low health, evade +2%",r=>({clDef:1*r,clutch:0.05*r,evade:0.02*r}),{lv:38,br:1,nd:5,shared:1}));
/* end v1.89 skill roots */
const skillList=fid=>(SKILLS[fid]||[]).concat(SKILLS[fid]&&SKILLS[fid][0]&&SKILLS[fid][0].line!=null?SHARED_SKILLS:[]);
const sharedPathOf=f=>{for(const s of SHARED_SKILLS)if((f.skills&&f.skills[s.id])>0)return s.line;return null;};
// v1.83: full skill reset — every point spent comes back so a fighter can move to another line. First reset per fighter is free.
const skPointsSpent=f=>Object.values(f.skills||{}).reduce((a,b)=>a+(b||0),0);
const skResetCost=f=>Math.min(3,f.skReset||0)*10000;
function resetAllSkills(G,id){const f=G.F[id];if(!f||!f.skills)return 0;const n=skPointsSpent(f);if(!n)return 0;f.skills={};f.sp=(f.sp||0)+n;f.equip=[];f.skReset=(f.skReset||0)+1;return n;}
function resetSharedPath(G,id){const f=G.F[id];if(!f||!f.skills)return false;let n=0;for(const s of SHARED_SKILLS){n+=f.skills[s.id]||0;delete f.skills[s.id];}if(!n)return false;f.sp+=n;if(Array.isArray(f.equip))f.equip=f.equip.filter(k=>!k.startsWith("sh_"));return n;}
// v1.12: a deep bond unlocks each heroine's signature move (bond 60+, player's camp only)
/* v1.87: every girl has two innate traits — the player picks one on the skill page */
const TRAITS={
 kati:[{id:"grit",name:"Determination",desc:"Every honest training week stores a fight-night bonus: better accuracy, better dodging and more starting HP, up to +10%"},{id:"surge",name:"Second Wind",desc:"Training works 15% faster, but builds 5% more fatigue"}],
 mali:[{id:"flow",name:"Move Like Water",desc:"Opponents land 15% less often, but Mali is 5% less accurate"},{id:"wits",name:"Quick Wits",desc:"Below 45% HP, opponents land 30% less often"}],
 rin:[{id:"eye",name:"Keen Eyes",desc:"Counters 30% more often, but dodges 5% less"},{id:"lib",name:"Walking Library",desc:"After scouting the opponent or counter-training, her strikes are 8% more accurate and 10% harder"}],
 fah:[{id:"fury",name:"Hurt Means Dangerous",desc:"The lower her HP, the more accurate (up to 15%) and harder (up to 20%) her strikes"},{id:"rock",name:"Hard as Stone",desc:"Strikes that land on her score 40% fewer points and hurt 10% less, but her own strikes hit 5% softer"}],
 ploy:[{id:"talent",name:"Natural Talent",desc:"Training works 10% faster and builds 5% less fatigue"},{id:"tempo",name:"Godlike Timing",desc:"In the last round, or when her HP drops below 50%, Ploy adjusts mid-fight to counter her opponent: their main weapon lands less often and she reads their game"}]};
let TRV={flowAtk:.95,flowDef:.85,wits:.7,witsHp:45,eyeDef:1.05,eyeCtr:1.3,lib:1.1,libHit:1.08,furyHit:.15,furyDmg:.2,rockAtk:.95,rockDef:.9,rockPts:.6};
const traitOf=f=>{const L=f&&TRAITS[f.id];if(!L)return null;return L.find(t=>t.id===f.trait)?f.trait:L[0].id;};
const SIGNATURE={kati:{name:"Sirichai Heart Spinning Elbow",desc:"Bond ♥ Lv.7+ · Elbow power +15% · extra 3% accuracy when hurt",fx:{dmg:{elbow:.15},clutch:.03}},
  mali:{name:"Jasmine Bloom Kick",desc:"Bond ♥ Lv.7+ · Kick accuracy +3% · between-round recovery +15%",fx:{hit:{kick:.03},regen:.15}},
  rin:{name:"The Winning Equation",desc:"Bond ♥ Lv.7+ · Corner orders +30% · counter +3%",fx:{corner:.3,ctr:.03}},
  ploy:{name:"Tiger Wall",desc:"Bond ♥ Lv.7+ · Evade/block +2% · inside defense +1",fx:{evade:.02,clDef:1}},
  fah:{name:"Thundering Sky Storm",desc:"Bond ♥ Lv.7+ · Punch power +12% · 6% less energy",fx:{dmg:{punch:.12},staSave:.06}}};
const hasSignature=f=>!!SIGNATURE[f.id]&&f.camp==="player"&&(f.bond||0)>=60;
function skillMods(f){const m={hit:{},pts:{},dmg:{},ctr:0,ctrDmg:0,clutch:0,regen:0,mor:0,evade:0,corner:0,prep:0,clDef:0,staSave:0,sprawl:0,tdTry:0,gnp:0,sub:0};
  if(hasSignature(f)){const e=SIGNATURE[f.id].fx;for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  if(f.pfx)for(const k in f.pfx){const e=f.pfx;if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];} /* v1.90: a regional champion's own perk */
  const list=skillList(f.id);if(!list.length||!f.skills)return m;const eq=equipped(f);
  for(const sk of list){if(!sk.passive&&!eq.includes(sk.id))continue;const r=f.skills[sk.id]||0;if(!r)continue;const e=sk.fx(r);
    for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  return m;}
const MAX_LV=99; // v1.82.3: level cap lifted (was 10); past Lv.10 each level costs more and raises potential a little
const xpNeed=lvl=>50+lvl*30+Math.max(0,lvl-10)*20;
const lvBeyond=f=>{if(f.lvl>10)f.potential=Math.min(21,(f.potential||14)+.12);};
function gainXP(G,f,x){if(!f.canon)return;if(f.camp==="player"&&G.fac&&G.fac.ring)x=Math.round(x*(1+G.fac.ring*.15));f.xp+=x;f.xpGain=(f.xpGain||0)+x;
  while(f.lvl<MAX_LV&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;f.sp+=SP_PER_LV(f);lvBeyond(f);if(f.camp==="player"){G.levelUps=G.levelUps||[];G.levelUps.push(f.id);}}}
const skillDef=(fid,sk)=>skillList(fid).find(s=>s.id===sk);
// v1.29: stat requirements scale from each fighter's starting stats, so every line asks for real training
const hasTree=fid=>!!(SKILLS[fid]&&SKILLS[fid][0]&&SKILLS[fid][0].line!=null);
const SP_PER_LV=f=>hasTree(f.id)?3:1;
// thresholds are written in "weeks of focused training" and converted with each fighter's measured growth (8 / 14 weeks of the best programme)
const GROW={"kati":{"punch":[3.1,4.8],"counter":[2.6,4.5],"power":[1.8,3.2],"speed":[1.7,2.7],"kick":[3.5,5.6],"foot":[2.1,3.3],"knee":[3.5,5.9],"clinch":[3.7,5.9],"stamina":[3.2,5],"elbow":[3.7,6.1],"guard":[3.9,6.2],"iq":[2.6,4.2],"comp":[1.3,2.2],"dur":[1.7,2.8]},"mali":{"punch":[2.9,4.6],"counter":[2.3,4.1],"power":[1.5,2.7],"speed":[1.4,2.3],"kick":[2.3,3.7],"foot":[1.6,2.5],"knee":[2.8,4.8],"clinch":[3.2,5],"stamina":[2,3.1],"elbow":[3.1,5.2],"guard":[3,4.8],"iq":[2,3.2],"comp":[1,1.7],"dur":[1.4,2.3]},"rin":{"punch":[2.7,4.3],"counter":[1.7,3.1],"power":[1.5,2.8],"speed":[1.6,2.6],"kick":[2.6,4.2],"foot":[1.4,2.2],"knee":[2.8,4.7],"clinch":[2.9,4.5],"stamina":[2.5,4],"elbow":[2.8,4.7],"guard":[2.6,4.1],"iq":[1.1,1.7],"comp":[0.8,1.3],"dur":[1.4,2.3]}};
const REQ_WK={main:[[0,2,4],[3,5,7],[3,5,7],[6,8,10],[8,10,12],[10,12,14],[11,12,13],[11,12,13],[12,13,14],[12,13,14],[13,14,15]],cross:[[0,0,0],[1,2,3],[0,0,0],[2,3,4],[3,4,5],[4,5,6],[4,5,6],[4,5,6],[5,6,7],[5,6,7],[6,7,8]],scale:{kati:1,mali:.85,rin:.7,ploy:.75,fah:.8}};
GROW.ploy=GROW.ploy||GROW.kati;GROW.fah=GROW.fah||GROW.mali;
function skillReqs(fid,sk,rank){const d=skillDef(fid,sk);if(!d||!d.req||!CANON[fid]||!GROW[fid])return [];const base=CANON[fid].a,r=clamp(rank,1,3)-1,sc=REQ_WK.scale[fid]||1;
  return d.req.map((k,i)=>{const w=(i?REQ_WK.cross:REQ_WK.main)[d.row][r]*sc,g=GROW[fid][k]||[2,3.2];const up=w<=8?g[0]*w/8:g[0]+(g[1]-g[0])*(w-8)/6;return {k,v:Math.min(19.5,Math.floor((base[k]+up)*2)/2)};});} // v1.89: roots (rows 6-10) never ask for more than 19.5
// why a skill can't be raised right now ([] = ok). Each entry: {t:"sp"|"max"|"lv"|"pre"|"stat", ...}
function skillBlock(f,sk){const d=skillDef(f.id,sk),r=(f.skills&&f.skills[sk])||0,B=[];if(!d)return [{t:"none"}];
  if(r>=3)return [{t:"max"}];if((d.lv||1)>f.lvl)B.push({t:"lv",v:d.lv});
  if(d.pre&&!((f.skills[d.pre]||0)>0))B.push({t:"pre",id:d.pre});
  if(d.shared){const p=sharedPathOf(f);if(p!=null&&p!==d.line)B.push({t:"path"});}
  for(const q of skillReqs(f.id,sk,r+1))if(f.a[q.k]+1e-6<q.v)B.push({t:"stat",k:q.k,v:q.v,have:f.a[q.k]});
  if(f.sp<1)B.push({t:"sp"});return B;}
function learnSkill(G,id,sk){const f=G.F[id],d=skillDef(id,sk);if(!d||skillBlock(f,sk).length)return false;f.skills[sk]=(f.skills[sk]||0)+1;f.sp--;
  if(d.passive)return true;f.equip=equipped(f);if(!f.equip.includes(sk)&&f.equip.length<3)f.equip.push(sk);return true;}
function passiveMods(f){const m={fatKick:0,fatAll:0,lossXp:0,fightXp:0,moraleLoss:0};for(const sk of skillList(f.id)){const r=(f.skills&&f.skills[sk.id])||0;if(!r||!sk.px)continue;const e=sk.px(r);for(const k in e)m[k]+=e[k];}return m;}
// v1.20: only 3 techniques are carried into the ring (player picks; rivals carry their best 3)
const MAX_EQUIP=3;
function equipped(f){const pas=k=>{const d=skillDef(f.id,k);return !!(d&&d.passive);};const has=k=>(f.skills&&f.skills[k])>0&&!pas(k);if(Array.isArray(f.equip))return f.equip.filter(has).slice(0,MAX_EQUIP);
  return skillList(f.id).filter(s=>has(s.id)).sort((a,b)=>f.skills[b.id]-f.skills[a.id]).slice(0,MAX_EQUIP).map(s=>s.id);}
function toggleEquip(G,id,sk){const f=G.F[id];const dd=skillDef(id,sk);if(!(f.skills[sk]>0)||(dd&&dd.passive))return false;let e=equipped(f);if(e.includes(sk))e=e.filter(x=>x!==sk);else{if(e.length>=MAX_EQUIP)return false;e.push(sk);}f.equip=e;return true;}

function baseFighter(id,d){return {id,name:d.name,full:d.full,div:d.div,camp:d.camp,color:d.color,potential:d.potential,wage:d.wage||0,fee:d.fee||0,
  canon:!!CANON[id],a:{...d.a},fatigue:10,injury:0,morale:60,trust:id==="kati"?40:20,bond:id==="kati"?20:0,
  rec:{w:0,l:0,d:0},form:[],plan:{preset:"balanced",intensity:"normal"},lastFight:-9,gains:{},met:id==="kati",
  xp:0,lvl:1,sp:0,skills:id==="ploy"?{kr_swing:2,captain:1}:id==="fah"?{tiger:1,reckless:1}:{},know:{}};}

// One clock for effects that can survive the end of a season.
const gameWeek=G=>((G.season||1)-1)*52+G.week;
const stableHash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
const CANON_BIRTH_DATES={kati:[13,3],mali:[2,4],rin:[9,8],ploy:[1,0],fah:[31,9]};
const CANON_AGES={kati:21,mali:20,rin:24,ploy:26,fah:22};
function fighterBirthdayWeek(id){const x=CANON_BIRTH_DATES[id];if(!x)return 1+stableHash(id+"birthday")%52;
  const start=new Date(2026,4,25),year=x[1]<4||x[1]===4&&x[0]<25?2027:2026;
  return Math.floor((new Date(year,x[1],x[0])-start)/604800000)+1;}
function syncFighterAges(G){
  const now=gameWeek(G);
  for(const f of Object.values(G.F||{})){if(!f)continue;
    if(!Number.isInteger(f.birthdayWeek)||f.birthdayWeek<1||f.birthdayWeek>52)
      f.birthdayWeek=fighterBirthdayWeek(f.id);
    if(!Number.isInteger(f.ageAnchorWeek)){f.ageAnchorWeek=now;f.ageAnchor=Number.isFinite(f.age)?f.age:
      (typeof PROFILES!=="undefined"&&PROFILES[f.id]?PROFILES[f.id].age:CANON_AGES[f.id]||18+stableHash(f.id+"age")%13);}
    const birthdays=Math.floor((now-f.birthdayWeek)/52)-Math.floor((f.ageAnchorWeek-f.birthdayWeek)/52);
    f.age=Math.max(0,f.ageAnchor+birthdays);
  }
}

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
/* v1.90 limit break: a fighter's stat ceiling (20; 25 after the regional limit break, 30 later at national level).
   Past 20 a stat grows at LB_RATE of the normal pace, so the extra five points take years, not weeks. */
const stCap=f=>f&&f.cap>20?f.cap:20,LB_RATE=.6;
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
  if(f.id==="kati"&&traitOf(f)==="grit"&&f.plan.preset!=="rest"&&f.plan.preset!=="prep")f.grit=Math.min(.1,(f.grit||0)+(f.plan.intensity==="heavy"?.004:f.plan.intensity==="normal"?.003:.0015));
  const pr=f.plan.preset,spec=st.some(k=>STAFF[k].pre===pr||STAFF[k].pre2===pr);
  const coach=dif(G).train*(1+st.length*.02+(G.fac.daeng-1)*.05+(spec?.1:0))+(pr==="cond"?hill*.2:0),fac=1+G.fac.gym*.1+(G.fac.lights||0)*.06+(G.fac.airgym||0)*.03;
  const ms=mainStyle(f),core=pr===ms?STYLE_ATTRS[ms]:[];
  const ready=1-f.fatigue/160,mot=.8+f.morale/250;
  for(const [k,w] of Object.entries(p.w)){
    // v1.18: training your own style's core weapons fights diminishing returns less (style mastery path)
    const dim=1-Math.pow(f.a[k]/(f.potential+(core.includes(k)?CK:1.5)),2.2);
    const g=.5*w*it.g*coach*fac*ready*mot*clamp(dim,.04,1)*(.75+rng()*.5)*(traitOf(f)==="surge"?1.15:traitOf(f)==="talent"?1.1:1)*(1+(f.drillBonus||0))*ytTrainMul(G,f);
    if(g>0){const g2=f.a[k]>=20?g*LB_RATE:g,b4=f.a[k];f.a[k]=Math.max(b4,Math.min(stCap(f),b4+g2));f.gains[k]=f.a[k]-b4;}
  }
  f.drillBonus=0;
  let load=p.load*it.l*7*(pr==="cond"?1-hill*.08-(st.includes("tong")?.1:0):1);{const pm=passiveMods(f);load*=clamp(1-pm.fatAll-(pr==="kick"?pm.fatKick:0),.4,1);}{const tr=traitOf(f);if(tr==="surge")load*=1.05;if(tr==="talent")load*=.95;}
  f.fatigue=clamp(f.fatigue+load-(10+G.fac.recovery*5+G.fac.kitchen*2+clin*3)-(f.plan.preset==="rest"?22:0),0,100);
  if(f.plan.preset==="rest")f.morale=clamp(f.morale+3,0,100);
  // v1.38: a rest week is one week: once recovered she goes back to what she was training before
  if(pr!=="rest"&&pr!=="prep")f.lastWork=pr;
  else if(pr==="rest"&&f.fatigue<=25&&!f.injury){f.plan.preset=f.lastWork||"balanced";G.log.push(`${f.name} has recovered and goes back to training "${PRESETS[f.plan.preset].name}"`);}
  f.prepBonus=f.plan.preset==="prep";
  {const nb=G.bookings.filter(b=>b.a===f.id&&b.week>=G.week).sort((x,y)=>x.week-y.week)[0];const sc=!!(nb&&G.scoutAbs&&G.scoutAbs[nb.b]!=null&&gameWeek(G)-G.scoutAbs[nb.b]<=8);const hit=!!(nb&&sc&&f.plan.preset===counterPreset(G.F[nb.b]));
   // v1.14: counter work done before fight week carries into fight night if that week is spent on fight prep
   f.counterPrep=hit||!!(nb&&nb.week===G.week&&f.plan.preset==="prep"&&f.counterPrep);}
  if(f.fatigue>70&&rng()<(f.fatigue-70)/110*(1-G.fac.kitchen*.2)*(G.waiBless&&gameWeek(G)<=G.waiBless?.5:1)){f.injury=2+Math.floor(rng()*2);G.log.push(`⚠ ${f.name} picked up a minor training injury (rest ${f.injury} wk)`);
    if(f.plan.intensity==="heavy")f.trust=clamp(f.trust-4,0,100);}
  if(f.fatigue>80&&f.plan.intensity==="heavy")f.trust=clamp(f.trust-2,0,100);
  f.morale+=(60-f.morale)*.08;
}
function npcGrow(f,rng,rate){for(const [k] of ATTRS){if(f.a[k]<f.potential&&rng()<rate)f.a[k]=Math.min(20,f.a[k]+.5);} }
function condition(f){return clamp(Math.round(100-f.fatigue*.7-(f.injury?40:0)),0,100);}

// ---------- FIGHT ENGINE ----------
const PLANS={
  balanced:{name:"Balanced",aggr:0,ctr:.04,evade:.02,desc:"Adapt to the fight"}, /* v1.87.2: adapting on the fly is worth a little */
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
let CTR_W=.12,CTR_READ=.1;
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
/* v1.83.3: veterans past the stat ceiling (20) keep improving through ring craft instead — f.vet is measured in stat points */
const VET_FX={hit:.08,dmg:.25,ev:.06}; // calibrated: vet 1 ≈ +1 stat point
/* v1.90.13 "the more she bleeds, the harder she gets" (Ladda): f.hpX adds starting hp; f.hurt={def,ev,sta,rec,rnd} scale with how much hp is gone (0 fresh → 1 empty) */
const hurtW=s=>s&&s.f.hurt?clamp(1-s.hp/(s.hp0||100),0,1):0;
function fightSide(f,plan,rng){const sk=skillMods(f);{const m=mastery(f)*MK,s=mainStyle(f);if(m){if(s==="defense"){sk.evade+=.04*m;sk.ctr+=.06*m;sk.ctrDmg+=.25*m;}else{const w=s;sk.hit[w]=(sk.hit[w]||0)+.05*m;sk.dmg[w]=(sk.dmg[w]||0)+.2*m;sk.pts[w]=(sk.pts[w]||0)+.1*m;}}}if(f.aura)sk.evade+=f.aura*.5;if(f.vet>0){const v=f.vet;for(const w of ["punch","kick","knee","elbow"]){sk.hit[w]=(sk.hit[w]||0)+VET_FX.hit*v;sk.dmg[w]=(sk.dmg[w]||0)+VET_FX.dmg*v;}sk.evade+=VET_FX.ev*v;}const gr=f.id==="kati"&&traitOf(f)!=="grit"?0:(f.grit||0);if(gr)sk.evade+=gr*.4;
  const hp0=100-(f.injury?15:0)+Math.round(gr*30)+(f.hpX||0),tl=f.trainLog||[];const brk=STA.brk+f.a.stamina*STA.brkK+(tl[tl.length-1]==="prep"?STA.prep:0)+(tl.slice(-2).includes("cond")?STA.cond:0)+(f.id==="fah"?STA.fah:0); /* Fah: hot-blooded and tireless, gets her breath back faster */
  return {f,id:f.id,name:f.name,plan,instr:"none",hp:hp0,hp0,brk,sta:clamp(100-f.fatigue*.4,40,100),pts:0,rpts:0,kd:0,cuts:0,
    thrown:0,landed:0,dmgDealt:0,legs:0,tac:{focus:"auto",pace:"steady",target:"head"},sk,prep:(f.prepBonus?.04:0)+(f.counterPrep?.05:0)+sk.prep+(f.aura||0)+gr+(f.labPrep||0)+(f.camp==="player"?(f.facPrep||0):0),counterPrep:!!f.counterPrep,trait:traitOf(f),mor:(f.morale-60)/400+sk.mor,wl:{punch:0,kick:0,knee:0,elbow:0}};
}
function aiPlan(f,opp,rng){
  const a=f.a;const opts=[["balanced",1],["pressure",(a.punch+a.elbow+a.power)/30],["counter",(a.counter+a.iq)/22],["outside",(a.kick+a.foot)/22],["clinch",(a.knee+a.clinch)/22]];
  return pickW(rng,opts.map(([k,v])=>[k,Math.pow(v,3)]));
}
function newFight(fa,fb,o){
  const rng=mulberry32(o.seed);const SA=fightSide(fa,o.planA||aiPlan(fa,fb,rng),rng),SB=fightSide(fb,o.planB||aiPlan(fb,fa,rng),rng);
  // v1.20: a canon rival fights a level above herself on final night
  if(o.tier==="final"){for(const S of [SA,SB])if(S.f.canon&&S.f.camp==="rival")S.prep+=.05;}
  /* v1.87: counter-training reads the opponent's best weapon — it lands less often on fight night */
  if(SA.counterPrep){SA.ctrW=oppTop(fb);SB.prep-=CTR_READ;}if(SB.counterPrep){SB.ctrW=oppTop(fa);SA.prep-=CTR_READ;}
  /* v1.87 traits: Rin's library needs a scouted or counter-trained opponent */
  const scout=(me,op)=>me.counterPrep||!!(me.f.camp==="player"&&typeof G!=="undefined"&&G&&G.scoutAbs&&G.scoutAbs[op.id]!=null&&gameWeek(G)-G.scoutAbs[op.id]<=8);
  for(const [S1,S2] of [[SA,SB],[SB,SA]])if(S1.trait==="lib"&&scout(S1,S2.f))S1.libOn=1;
  if(fa.ployNotes&&fb.id==="ploy")SA.prep+=.025;if(fb.ployNotes&&fa.id==="ploy")SB.prep+=.025; // Rin's notebook on Ploy
  if(o.gprepA)SA.gprep=o.gprepA;
  return {seed:o.seed,rng,rounds:o.rounds,round:0,tier:o.tier,A:SA,B:SB,open:!!(fa.grap||fb.grap),
    cards:[],logs:[],over:false,result:null,forceRage:!!o.forceRage};
}
function setTactics(F,tA){F.A.tac={focus:"auto",pace:"steady",target:"body",...(tA||{})};F.B.tac=aiTac(F.B.f,F.rng);}
/* v1.87.2: the fight plan still matters, but a little less than before (PLAN_K scales every plan effect) */
let PLAN_K=.75;
function mods(s,F){const p0=PLANS[s.plan],c=CORNER[s.instr]||{};const cm=1+((s.sk&&s.sk.corner)||0);const K=PLAN_K;
  const p={aggr:(p0.aggr||0)*K,ctr:(p0.ctr||0)*K,evade:(p0.evade||0)*K,cl:(p0.cl||0)*K,sta:p0.sta?1+(p0.sta-1)*K:undefined,w:p0.w?Object.fromEntries(Object.entries(p0.w).map(([k,v])=>[k,1+(v-1)*K])):undefined};
  const w={punch:1,kick:1,knee:1,elbow:1};if(p.w)for(const k in p.w)w[k]*=p.w[k];if(c.w)for(const k in c.w)w[k]*=1+(c.w[k]-1)*cm;
  const t=s.tac||{};if(t.focus&&t.focus!=="auto")w[t.focus]*=1.7;
  let pa=0,ps=1;if(F){const r=F.round,n=F.rounds;if(t.pace==="fast"){pa=r<=2?.15:-.08;ps=r<=2?1.15:1;}if(t.pace==="late"){pa=r>=n-1?.2:-.1;ps=r>=n-1?1.1:.85;}}
  return {aggr:(p.aggr||0)+(c.aggr||0)*cm+pa,ctr:(p.ctr||0)+(c.ctr||0)*cm,evade:(p.evade||0)+(c.evade||0)*cm,cl:(p.cl||0)+(c.cl||0)*cm,guard:(c.guard||0)*cm,sta:(p.sta||1)*(c.sta?1+(c.sta-1)*cm:1)*ps,w};}
// v1.10 corner care: what the fighter needs this break, in order (water · massage · wipe · cheer)
const CARE={water:{icon:"💧",name:"Water"},rub:{icon:"💆",name:"Muay oil massage"},wipe:{icon:"🧻",name:"Wipe the face"},cheer:{icon:"💪",name:"Encourage"}};
function careNeeds(F){const A=F.A,B=F.B,r=mulberry32(F.seed+F.round*977);const sc=k=>({water:100-A.sta,rub:(A.sta<60?20:0)+B.rw.kick*4,wipe:B.rdmg*1.5+B.rlanded*3,cheer:(F.cards.reduce((s,c)=>s+c[1]-c[0],0))*25+(A.hp<50?20:0)}[k])+r()*30;
  return Object.keys(CARE).sort((a,b)=>sc(b)-sc(a)).slice(0,3);}
// v1.89.1: corner care on one scale — a missed mini-game still gives 60% of a normal corner, coach Daeng / quick fights give a normal corner,
// a great mini-game is a small bonus on top (not the thing that decides the fight)
const careMult=q=>q<=1?STA.cNorm*(STA.cMin+(1-STA.cMin)*Math.max(0,q)):STA.cNorm*(1+(q-1)*STA.cBonus);
function applyCare(F,q){const A=F.A;A.sta=clamp(A.sta+q*9,0,100);A.hp=clamp(A.hp+q*4,0,Math.max(100,A.hp0||100));A.careMor=q>=1?.02:0;return q;} /* v1.89.1: back to the single order puzzle — a small bonus on top of the normal between-round recovery (as in v1.87.5) */
function throwTowel(F){if(F.over)return;F.over=true;F.result={win:"B",type:"Corner throws in the towel",round:F.round,towel:true};}
function aiCorner(F,me,op){ if(F.round===0)return "none";
  const lead=me.pts-op.pts;if(me.sta<35)return "defend";if(lead>4)return "defend";if(lead<-3)return "push";
  if(op.f.a.kick>op.f.a.knee+2)return "clinch";if(op.f.a.clinch>op.f.a.kick+2)return "range";return "none";}
// v1.19: a round is simulated exchange by exchange so a skill pressed mid-round changes what comes next
// a stat far above the fighter's own average gives back less accuracy/speed (power keeps its punch, and a power build lands more flash KOs)
const BAL={flashPow:.025,specPow:0,wdef:.15,spec:4,specK:.4,clGap:9,clK:.03,repFree:.5,repPen:.7,chkBase:5,chkK:.016,chkMax:.3,chkLegs:4,chkSta:5,chkHp:1.2};
function effA(s,k){const a=s.f.a,o=s.ov!=null?s.ov:(s.ov=ovr(a)),v=a[k],c=o+BAL.spec;return v>c?c+(v-c)*BAL.specK:v;}
const EX_PER_ROUND=12;
function roundBegin(F){F.round++;F.gnd=null;
  /* v1.90: a boss changes form every round (Ladda: hood → no hood → blood mode) */
  for(const s of [F.A,F.B])if(s.f.phases){const P=s.f.phases[Math.min(F.round,s.f.phases.length)-1];s.phNew=!s.ph||s.ph.n!==P.n;s.ph=P;}F.A.rpts=0;F.B.rpts=0;F.kd0={A:F.A.kd,B:F.B.kd};F.ex=0;F.rlog=[];
  F.mA=mods(F.A,F);F.mB=mods(F.B,F);for(const s of [F.A,F.B]){s.rw={punch:0,kick:0,knee:0,elbow:0};s.rtw={punch:0,kick:0,knee:0,elbow:0};s.rdmg=0;s.rthrown=0;s.rlanded=0;s.skRound=false;}}
const roundDone=F=>F.over||F.ex>=EX_PER_ROUND;
function fightRound(F){roundBegin(F);while(!roundDone(F))fightEx(F);return roundFinish(F);}
// ---------- active skills (v1.19) ----------
// every learned school skill can be fired once per fight (max one per round): attack burst, guard burst or second wind
function skillKind(sk){const e=sk.fx(1);const wk=e.hit||e.pts||e.dmg;if(wk)return {k:"atk",w:Object.keys(wk)[0]};if(e.evade||e.ctr||e.clDef||e.ctrDmg)return {k:"def"};return {k:"rec"};}
const SKILL_KIND_NAME={atk:"Finishing attack",def:"Defend & counter",rec:"Recover energy"};
function fightSkills(s){if(s.f.nlsk)return s.f.nlsk.map(k=>({...k,r:3}));const L=skillList(s.f.id),eq=equipped(s.f);return L.filter(k=>eq.includes(k.id)).map(k=>({...k,r:s.f.skills[k.id],...skillKind(k)}));}
// v1.89.6: classic mae mai / look mai techniques get called by name from the booth (keyed by skill id so it works in every language)
const MAEMAI={"ts_low":"l","ts_croc":"m","ts_ring":"l","ts_trunk":"m","kati_1a1":"l","kati_2b1":"m","kati_2b3":"m","cy_spin":"l","cy_erawan":"m","cy_gate":"l","mali_2a3":"m","lb_jab":"l","lb_kris":"m","lb_feint":"m","lb_giant":"m","lb_teep":"m","lb_fold":"l","rin_0b1":"m","rin_2b3":"m","kr_thunder":"m","kr_sweep":"l","p_wall":"l","ploy_1a3":"l","ploy_2a3":"m"};
function skillCall(F,s,sk){const k=MAEMAI[sk.id];if(!k)return `${s.name} uses "${sk.name}"!`;const kn=k==="m"?"Mae mai Muay Thai":"Look mai Muay Thai";
  const L=[`${kn}! ${s.name} goes for "${sk.name}"!`,`"${sk.name}"! ${kn}, the real thing, from ${s.name}!`,`${s.name} pulls out ${kn} "${sk.name}" — there it is, folks!`];
  return L[((F.round||1)+(F.ex||0))%L.length];}
function useSkill(F,s,id){const o=s===F.A?F.B:F.A;s.skUsed=s.skUsed||{};if(F.over||s.skRound||s.skUsed[id])return null;const sk=fightSkills(s).find(k=>k.id===id);if(!sk)return null;
  s.skUsed[id]=true;s.skRound=true;const pw=(.7+.15*sk.r)*(s.f.camp==="player"?1.1:F.dai||.8);
  if(sk.k==="atk"){s.burst={k:"atk",w:sk.w,left:4,pw};s.sta=clamp(s.sta-6,0,100);}
  if(sk.k==="def")s.burst={k:"def",left:4,pw};
  if(sk.k==="rec"){s.sta=clamp(s.sta+22*pw,0,100);s.hp=clamp(s.hp+6*pw,0,100);s.mor+=.01;s.burst=null;}
  if(sk.k==="td"||sk.k==="sub"){s.burst={k:sk.k,left:sk.k==="td"?3:4,pw};s.sta=clamp(s.sta-5,0,100);} /* v1.90: grappling bursts (Naka League) */
  return {ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:skillCall(F,s,sk),k:"big",ev:"skill",rid:s.f.id,an:s.name,dn:o.name,skn:sk.name,skk:sk.k,w:sk.w,skid:sk.id,skrow:sk.row};}
function aiSkill(F,s,rng){if(s.skRound||F.over)return null;const L=fightSkills(s).filter(k=>!(s.skUsed&&s.skUsed[k.id]));if(!L.length)return null;
  const o=s===F.A?F.B:F.A,ex=F.ex,last=F.round>=F.rounds;const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0;
  const rec=L.find(k=>k.k==="rec"),atk=L.find(k=>k.k==="atk"),def=L.find(k=>k.k==="def");
  if(rec&&s.sta<38&&ex>=2)return useSkill(F,s,rec.id);
  if(def&&o.burst&&o.burst.k==="atk"&&rng()<.5)return useSkill(F,s,def.id);
  if(ex<3)return null;
  const p=(last?.3:.1)+(behind?.12:0)+(F.round>=2?.05:0);
  const gk=L.find(k=>k.k==="sub"&&F.gnd&&F.gnd.top===s)||L.find(k=>k.k==="td"&&!F.gnd);if(gk&&rng()<(gk.k==="sub"?.6:p*2.5))return useSkill(F,s,gk.id);
  if(rng()<p){const k=atk||def||rec;if(k)return useSkill(F,s,k.id);}
  return null;}
/* ---------- v1.90 open rules (Naka League underground): takedowns, ground-and-pound, submissions ----------
   Only a fighter with f.grap (takedown skill 0–20) shoots; f.sub (0–20) is her submission game. Muay Thai answers with
   the clinch, footwork, power and knees — no new stats for our fighters. A tap ends the bout like a knockout.
   s.gprep: the underground training plan ("sprawl" | "escape" | "strike"). */
const GR={tdTry:.16,tdK:.012,tdMax:.5,tdBase:.38,tdD:.035,escBase:.2,escK:.03,subTry:.3,subBase:.06,subK:.022,reset:4,gnp:1.1,knee:.2};
function grapEx(F,at,df,rng,log,md){const nm=v=>Array.isArray(v)?v[Math.floor(rng()*v.length)]:v;
  const L=(s,t,k,ev,x)=>log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":s===F.B?"B":"x",t,k,ev,...x});
  const g=F.gnd;
  if(g){const T=g.top,B=g.bot,ta=T.f.a,ba=B.f.a;g.t++;
    const bS=T.burst&&T.burst.k==="sub"?T.burst:null;
    const esc=ba.power*.3+ba.clinch*.25+ba.iq*.2+ba.foot*.15+ba.stamina*.1+(B.gprep==="escape"?3:0),ctl=(T.f.grap||ta.clinch)*.8+ta.power*.2;
    const escP=clamp(GR.escBase+(esc-ctl)*GR.escK+(B.sta-T.sta)/400-(bS?.08:0),.06,.6);
    if(rng()<escP){F.gnd=null;B.sta=clamp(B.sta-3,0,100);L(B,`${B.name} pushes free and gets back up!`,"hit","standup",{an:B.name,dn:T.name});return true;}
    if(g.t>=GR.reset){F.gnd=null;L(null,`They stall on the ground too long — the referee stands them up`,"miss","reset",{an:T.name,dn:B.name});return true;}
    T.sta=clamp(T.sta-2,0,100);B.sta=clamp(B.sta-4,0,100);
    if(T.f.sub&&rng()<GR.subTry+(B.hp<40?.1:0)+(bS?.3:0)){const def=ba.iq*.4+ba.power*.3+ba.stamina*.3+(B.gprep==="escape"?3:0);
      const p=clamp(GR.subBase+(T.f.sub-def)*GR.subK+(100-B.sta)/600+(B.hp<40?.06:0)+(T.sk.sub||0)+(bS?.12*bS.pw:0),.02,.45);
      if(rng()<p){F.over=true;F.gnd=null;F.result={win:T===F.A?"A":"B",type:"Submission (tap out)",round:F.round,sub:true};
        L(T,`${T.name} ${g.sub=nm(T.f.subName)||"Arm lock"} locked in! ${B.name} taps out!`,"big","tap",{an:T.name,dn:B.name});return true;}
      B.sta=clamp(B.sta-6,0,100);T.sta=clamp(T.sta-4,0,100);T.pts+=.5;T.rpts+=.5;
      L(T,`${T.name} hunts for the ${nm(T.f.subName)||"Arm lock"} — ${B.name} twists free!`,"hit","subtry",{an:T.name,dn:B.name});return true;}
    const dmg=GR.gnp*(.6+ta.power/25)*(1.25-ba.dur/40)*(.7+rng()*.6)*(1+(T.sk.gnp||0));
    B.hp-=dmg;B.sta=clamp(B.sta-dmg*STA.hit,0,100);T.pts+=.7;T.rpts+=.7;T.landed++;T.thrown++;T.dmgDealt+=dmg;T.rdmg+=dmg;T.rlanded++;T.rthrown++;
    L(T,`${T.name} climbs on top and pounds down!`,"hit","gnp",{an:T.name,dn:B.name,w:"punch"});
    if(B.hp<=0){F.over=true;F.gnd=null;F.result={win:T===F.A?"A":"B",type:"TKO (ground and pound)",round:F.round};L(T,`${B.name} can't defend herself any more — the referee steps in!`,"big","ko",{an:T.name,dn:B.name});}
    return true;}
  if(!at.f.grap)return false;
  const a=at.f.a,d=df.f.a,bT=at.burst&&at.burst.k==="td"?at.burst:null;
  if(rng()>=clamp(GR.tdTry+at.f.grap*GR.tdK+(at.sk.tdTry||0)+(bT?.35:0),0,bT?.85:GR.tdMax))return false;
  const defv=d.clinch*.35+d.foot*.25+d.power*.2+d.iq*.2+(df.gprep==="sprawl"?3:0)+(df.sk.sprawl||0);
  const p=clamp(GR.tdBase+(at.f.grap-defv)*GR.tdD-(100-at.sta)/400+(100-df.sta)/500-(md.evade||0)+(bT?.12*bT.pw:0),.08,.85);
  at.sta=clamp(at.sta-4,0,100);at.thrown++;at.rthrown++;
  if(rng()<p){F.gnd={top:at,bot:df,t:0};const dmg=2+a.power*.15;df.hp-=dmg;df.sta=clamp(df.sta-5,0,100);at.pts+=1.5;at.rpts+=1.5;at.landed++;at.rlanded++;at.dmgDealt+=dmg;at.rdmg+=dmg;
    L(at,`${at.name} ${nm(at.f.tdName)||"Shoots for the legs"} — slams ${df.name} to the mat!`,"big","takedown",{an:at.name,dn:df.name});
    if(df.hp<=0){F.over=true;F.gnd=null;F.result={win:at===F.A?"A":"B",type:"KO",round:F.round};L(at,`${df.name} hits the mat and can't get up!`,"big","ko",{an:at.name,dn:df.name});}
    return true;}
  /* the sprawl — and Muay Thai's answer: grab the neck and knee the shooter */
  const kneeP=clamp(GR.knee+(d.knee+d.clinch-a.clinch*1.2)*.015+(df.gprep==="sprawl"?.08:0),.05,.5);
  if(rng()<kneeP){const dmg=1.3*W_INFO.knee.imp*(.7+rng()*.5)*(.6+d.power/25)*(1.25-a.dur/40)*(1+(df.sk.dmg.knee||0));at.hp-=dmg;at.sta=clamp(at.sta-dmg*STA.hit,0,100);
    df.pts+=1;df.rpts+=1;df.landed++;df.thrown++;df.wl.knee++;df.dmgDealt+=dmg;df.rw.knee++;df.rdmg+=dmg;df.rlanded++;df.rthrown++;
    L(df,`${at.name} shoots in — ${df.name} grabs the neck and knees her full!`,"hit","counter",{an:df.name,dn:at.name,w:"knee",mw:"knee"});
    if(at.hp<=0){F.over=true;F.result={win:df===F.A?"A":"B",type:"KO",round:F.round};L(df,`${at.name} goes down and stays down! A Muay Thai knee ends it`,"big","ko",{an:df.name,dn:at.name,koSide:df===F.A?"A":"B"});}}
  else L(df,`${df.name} sprawls, stopping ${at.name}'s takedown!`,"miss","sprawl",{an:at.name,dn:df.name});
  return true;}
function fightEx(F){const rng=F.rng,log=[],ex=F.ex,mA=F.mA,mB=F.mB;
  for(const s of [F.A,F.B])if(s.f.hurt&&!F.over&&s.hp>0){const w=hurtW(s),H=s.f.hurt;s.hp=Math.min(s.hp0,s.hp+H.rec*w);s.sta=clamp(s.sta+H.rec*w*1.5,0,100);
    if(w>.45&&!s.hurtSaid){s.hurtSaid=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name} only grows calmer as she bleeds — tighter guard, sharper slips, and her breath comes back unnaturally fast`,k:"big",ev:"wake",an:s.name,dn:s.name});}}
  for(const s of [F.A,F.B])if(s.autoSkill!==false){const e=aiSkill(F,s,rng);if(e)log.push(e);}
  {
    // v1.5 "blood boiling" mode: a canon fighter who is hurt and behind can snap once per fight
    for(const s of [F.A,F.B]){{const o=s===F.A?F.B:F.A;if(s.f.canon&&(s.f.camp==="player"||o.f.canon)&&!s.rageUsed&&ex>2){const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0||s.kd>0;
      // v1.10: easier to trigger (hurt OR behind), and guaranteed in round 2 of the player's first fight
      const forced=F.forceRage&&s===F.A&&s.f.camp==="player"&&F.round>=2&&ex>=4;
      const need=(s.hp<62&&behind)||s.hp<45||(F.round>=2&&behind&&s.hp<75);
      if(forced||(need&&rng()<(s.f.camp==="player"?.03+(s.f.bond||0)/1500+(s.f.morale||60)/2400:.08))){s.rageUsed=true;s.rage=4;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name} — the eyes change! Blood-boil mode!`,k:"big",ev:"rage",rid:s.f.id,an:s.name,dn:o.name});}}}}
    for(const s of [F.A,F.B])if(s.phNew&&!F.over){s.phNew=false;const P=s.ph,o=s===F.A?F.B:F.A;if(P.self){s.hp-=P.self;s.rage=Math.max(s.rage||0,5);}
      if(P.say)log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:P.say,k:"big",ev:"phase",ph:P.n,an:s.name,dn:o.name});}
    const ini=s=>{const a=s.f.a,m=s===F.A?mA:mB;return (s.ph&&s.ph.ini||0)-s.legs/12+effA(s,"speed")*.3+a.foot*.15+a.iq*.2+a.comp*.1+m.aggr*10+rng()*9+(s.sta-60)/12;};
    const [at,df]=ini(F.A)>=ini(F.B)?[F.A,F.B]:[F.B,F.A];const ma=at===F.A?mA:mB,md=at===F.A?mB:mA;
    const a=at.f.a,d=df.f.a;
    if(F.gnd||at.f.grap){if(grapEx(F,at,df,rng,log,md)){for(const s of [F.A,F.B])s.sta=clamp(s.sta+STA.ex+s.f.a.stamina*STA.exK+s.sk.regen,0,100);
      for(const s of [F.A,F.B])if(s.burst&&--s.burst.left<=0)s.burst=null;F.ex++;F.rlog.push(...log);return log;}}
    // clinch?
    const clinch=rng()<clamp(.12+ma.cl+(a.clinch-d.foot)*.02+Math.max(0,BAL.clGap-d.clinch)*BAL.clK,.03,.55); // v1.87.4: a fighter who never trained the clinch gets tied up more
    const items=clinch?[["knee",a.knee*ma.w.knee],["elbow",a.elbow*ma.w.elbow*.8]]:
      [["punch",a.punch*ma.w.punch],["kick",a.kick*ma.w.kick],["knee",a.knee*ma.w.knee*.5],["elbow",a.elbow*ma.w.elbow*.6]];
    const bA=at.burst&&at.burst.k==="atk"?at.burst:null,bD=df.burst&&df.burst.k==="def"?df.burst:null;
    const wpn=pickW(rng,items.map(([k,v])=>[k,Math.pow(v,1.6)*(bA&&bA.w===k?4:1)]));
    const atk=effA(at,wpn)*.7+effA(at,"speed")*.15+a.iq*.15;
    // v1.87.4: knowing a weapon helps to defend it, so dumping punches/knees/elbows leaves a hole
    const def=clinch?((d.clinch+df.sk.clDef)*.5+d.guard*.3+d.iq*.2):(d.guard*.42+d.foot*.25+d.iq*.18+d[wpn]*BAL.wdef);
    const fatA=(100-at.sta)/100*.22,fatD=(100-df.sta)/100*.12;
    const fury=at.trait==="fury"?clamp((70-at.hp)/50,0,1):0; // v1.38 → v1.87 trait: the more she is hurt, the more dangerous
    /* v1.87 traits that fire mid-fight */
    if(df.trait==="wits"&&df.hp<TRV.witsHp&&!df.witsOn){df.witsOn=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${df.name} keeps her head despite the damage. Quick Wits! She's slipping everything now`,k:"big",ev:"wake",an:df.name,dn:at.name});}
    for(const S of [at,df])if(S.trait==="tempo"&&!S.tempoOn&&(F.round>=F.rounds||S.hp<50)){S.tempoOn=1;const O=S===at?df:at;if(!S.ctrW){S.ctrW=oppTop(O.f);O.prep-=CTR_READ;}log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:S===F.A?"A":"B",t:`${S.name} switches rhythm! Godlike Timing, she's reading ${O.name} now`,k:"big",ev:"wake",an:S.name,dn:O.name});}
    if(fury>.4&&!at.wake){at.wake=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${at.name} smiles through the blood… the more she's hurt, the fiercer she gets! Her eyes have changed!`,k:"big",ev:"wake",an:at.name,dn:df.name});}
    /* v1.87.4 balance: one weapon thrown again and again gets read inside the round, and a kick can be checked by a tight guard and good feet */
    const rtw=at.rtw||(at.rtw={punch:0,kick:0,knee:0,elbow:0}),rep=at.rthrown>=3?Math.max(0,(rtw[wpn]||0)/at.rthrown-BAL.repFree)*BAL.repPen:0;
    const chkP=wpn==="kick"&&!clinch?clamp((d.guard*.55+d.foot*.45-effA(at,"speed")*.3-BAL.chkBase)*BAL.chkK+rep*.6,0,BAL.chkMax):0;
    const hitP=clamp(.42-rep+fury*.04+(atk-def)*.03+at.prep+at.mor+(at.careMor||0)-fatA+fatD-md.evade-md.guard-df.sk.evade-(df.ctrW===wpn?CTR_W:0)+(at.sk.hit[wpn]||0)+(at.hp<45?at.sk.clutch:0)+(at.rage?.1:0)+(at.gprep==="strike"&&F.open?.04:0)+(at.ph&&at.ph.hit||0)-(df.ph&&df.ph.ev||0)-(df.f.hurt?df.f.hurt.ev*hurtW(df):0)-(at.tac.target==="head"?.015:0)+df.legs/400+(bA&&bA.w===wpn?.12*bA.pw:0)-(bD?.12*bD.pw:0),.12,.9)*(at.trait==="flow"?TRV.flowAtk:1)*(df.trait==="flow"?TRV.flowDef:1)*(df.witsOn?TRV.wits:1)*(df.trait==="eye"?TRV.eyeDef:1)*(1+fury*TRV.furyHit)*(at.libOn?TRV.libHit:1);
    at.thrown++;at.rthrown++;rtw[wpn]=(rtw[wpn]||0)+1;at.sta=clamp(at.sta-STA.drain*W_INFO[wpn].cost*(STA.cA-a.stamina/STA.cB)*ma.sta*(1+Math.max(0,ma.aggr))*(1-at.sk.staSave),0,100);
    const tx=TXT[wpn][Math.floor(rng()*TXT[wpn].length)];
    const checked=chkP>0&&rng()<chkP;
    if(checked){at.legs=Math.min(60,at.legs+BAL.chkLegs);at.sta=clamp(at.sta-BAL.chkSta,0,100);at.hp-=BAL.chkHp;df.pts+=.3;df.rpts+=.3;
      log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${df.name} checks the kick from ${at.name}. Shin meets shin!`,k:"miss",ev:"miss",w:wpn,cl:clinch,mside:at===F.A?"A":"B",an:at.name,dn:df.name});}
    else if(rng()<hitP){
      const crit=rng()<(at.rage?.35:.07);const q=crit?1.6:.6+rng()*.6;if(at.rage)at.rage--;
      let dmg=1.35*W_INFO[wpn].imp*q*(.6+(BAL.specPow?effA(at,"power"):a.power)/25)*(1-d.guard/70)*(1.25-d.dur/40)*(1+(at.sk.dmg[wpn]||0))*(bA&&bA.w===wpn?1+.3*bA.pw:1)*(1+fury*TRV.furyDmg)*(at.libOn?TRV.lib:1)*(at.trait==="rock"?TRV.rockAtk:1)*(df.trait==="rock"?TRV.rockDef:1)*(at.ph&&at.ph.dmg||1)*(df.f.hurt?1-df.f.hurt.def*hurtW(df):1);const tg=at.tac.target;
      if(tg==="head")dmg*=1.1;if(tg==="body"){dmg*=.9;df.sta=clamp(df.sta-dmg*.9,0,100);}if(tg==="legs"&&(wpn==="kick"||wpn==="knee")){dmg*=.85;df.legs=Math.min(60,df.legs+dmg*.8);}
      // v1.32 "flash knockout": a clean crit to the head can drop anyone early — rarer for durable/guarded fighters, likelier when the attacker clearly outclasses
      if(crit&&tg!=="body"&&(wpn!=="punch"||a.power>=10)&&rng()<clamp(.16+(ovr(a)-ovr(d))*.06-(d.dur-8)*.012+Math.max(0,a.power-12)*BAL.flashPow,.05,.45)){dmg+=10+rng()*8;at.flash=1;}
      at.rw[wpn]++;at.rdmg+=dmg;at.rlanded++;
      df.hp-=dmg;df.sta=clamp(df.sta-dmg*STA.hit*(df.f.hurt?1-df.f.hurt.sta*hurtW(df):1),0,100);at.landed++;at.wl[wpn]++;at.dmgDealt+=dmg;const p=W_INFO[wpn].pts*q*(1+(at.sk.pts[wpn]||0))*(df.trait==="rock"?TRV.rockPts:1);at.pts+=p;at.rpts+=p;
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
      const ctrP=clamp(d.counter/20*.32+md.ctr-fatD+df.sk.ctr+(df.rage?.2:0)+(bD?.18*bD.pw:0),0,.8)*(df.trait==="eye"?TRV.eyeCtr:1);
      if(rng()<ctrP){const cw=d.kick>d.punch&&!clinch?"kick":"punch";
        const rc=!!df.rage;if(df.rage)df.rage--;const dmg=1.3*W_INFO[cw].imp*(rc?1.5:.7+rng()*.5)*(.6+(BAL.specPow?effA(df,"power"):d.power)/25)*(1-a.guard/70)*(1.25-a.dur/40)*(1+df.sk.ctrDmg)*(df.libOn?TRV.lib:1)*(df.trait==="rock"?TRV.rockAtk:1)*(at.trait==="rock"?TRV.rockDef:1);
        at.hp-=dmg;at.sta=clamp(at.sta-dmg*STA.hit,0,100);df.landed++;df.thrown++;df.wl[cw]++;df.dmgDealt+=dmg;df.rw[cw]++;df.rdmg+=dmg;df.rlanded++;df.rthrown++;const p=W_INFO[cw].pts*.9;df.pts+=p;df.rpts+=p;
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${at.name} misses — ${df.name} counters with ${cw==="kick"?"kick":"Punch"} Clean hit!${rc?" Critical!":""}`,k:rc?"big":"hit",ev:"counter",crit:rc,w:cw,mw:wpn,an:df.name,dn:at.name});
        if(at.hp<=0){F.over=true;F.result={win:df===F.A?"A":"B",type:"KO",round:F.round};log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} is down and not getting up! Knockout win`,k:"big",ev:"ko",an:df.name,dn:at.name,koSide:df===F.A?"A":"B"});}
      } else if(rng()<.45) log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} ${tx} but ${df.name} ${TXT.miss[Math.floor(rng()*4)]}`,k:"miss",ev:"miss",w:wpn,cl:clinch,mside:at===F.A?"A":"B",an:at.name,dn:df.name});
    }
    for(const s of [F.A,F.B])s.sta=clamp(s.sta+STA.ex+s.f.a.stamina*STA.exK+s.sk.regen,0,100);
    for(const s of [F.A,F.B])if(s.burst&&--s.burst.left<=0)s.burst=null;
  }
  F.ex++;F.rlog.push(...log);return log;}
let RND_REC={b:6,d:.3},RND_REC_EV=RND_REC; /* v1.90.4: HP back between rounds is 3/4 of the old amount (KOs ~25% → ~31% in sims) — the Loy brawl uses the same rate and gets a little more back between bouts instead */
const STA={cNorm:.6,cMin:.6,cBonus:.5,qf:.4,fah:7,hit:.25,drain:1.15,cA:1.15,cB:70,ex:0,exK:1/120,brk:16,brkK:.8,prep:4,cond:3,care:20,careHp:5,ai:.3};
function careSide(s,q){s.sta=clamp(s.sta+q*STA.care,0,100);s.hp=clamp(s.hp+q*STA.careHp,0,Math.max(100,s.hp0||100));}
function roundFinish(F){const log=F.rlog,kd0=F.kd0;for(const s of [F.A,F.B])s.burst=null;
  // judges
  const dif=(F.A.rpts-F.B.rpts)+(F.B.kd-kd0.B-(F.A.kd-kd0.A))*3;
  let card=[10,10];if(dif>.4)card=[10,9];if(dif<-.4)card=[9,10];
  if(F.B.kd>kd0.B&&dif>4)card=[10,8];if(F.A.kd>kd0.A&&dif<-4)card=[8,10];
  F.cards.push(card);F.logs.push(log);
  /* v1.87.2: a fighter gets her breath back between rounds — tougher fighters recover more — so long bouts are not just a slow knockout
     v1.88: stamina no longer refills by itself. A break gives back a little (conditioning, last week's fight prep), the corner does the rest:
     the player's corner mini-game in a live fight, an average corner for everyone else. */
  for(const s of [F.A,F.B]){s.sta=clamp(s.sta+(s.brk||0),0,100);if(s.f.hurt)s.hp+=s.f.hurt.rnd*hurtW(s);s.hp=clamp(s.hp+(F.ev?RND_REC_EV:RND_REC).b+s.f.a.dur*(F.ev?RND_REC_EV:RND_REC).d,0,Math.max(100,s.hp0||100));
    } /* v1.89.1: corner mini-games are off — everyone gets her breath back between rounds again (16 + stamina×0.8, plus conditioning / fight prep / Fah's bonus); careSide/applyCare stay for a mini-game later */
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
// v1.90 (hidden): ศึกชิงเจ้าสี่ภาค — the regional chapter lives in region.js (+ road.js) and loads only once the chapter opens.
// Off for players until the whole chapter ships; #regiondev turns it on for testing on this device.
const REGION_LIVE=false;
TIER.region={name:"Four Regions Championship",win:12000,lose:5000,rep:2.5,off:1};
function regionOn(){if(REGION_LIVE)return true;try{if(typeof location!=="undefined"&&/regiondev/.test(location.hash||""))localStorage.setItem("mtm_regiondev","1");return localStorage.getItem("mtm_regiondev")==="1";}catch(e){return false;}}
const regionReady=G=>(G.season||1)>=6&&(G.honors||[]).filter(h=>h.kind==="province").length>=3; /* year 5 is over + three provincial titles */
const regionBlock=(G,wk)=>{const R=G.region;if(!R)return false;const s=G.season||1;if(R.trip&&R.trip.season===s&&R.trip.wk===wk)return true; /* the whole camp is on the road that week */
  return Object.values(R.champ||{}).some(c=>c&&c.next&&c.next.season===s&&c.next.wk===wk);}; /* …or at a regional championship bout */
let REGION_P=null;
function regionLoad(){if(typeof REGION!=="undefined")return Promise.resolve(REGION);if(REGION_P)return REGION_P;
  if(typeof window==="undefined"||!window.MTM_JS)return Promise.reject(new Error("no loader"));
  REGION_P=window.MTM_JS((window.LANG==="en"?"region-en.js":"region.js")+"?v="+(window.MTM_BUILD||"")).then(()=>{if(typeof REGION==="undefined")throw new Error("region.js did not run");return REGION;},e=>{REGION_P=null;throw e;});return REGION_P;}
function regionStart(G){if(G.region)return;const now=gameWeek(G),R=["north","isan","central","south"];
  G.region={edition:1,startAbs:now,belts:Object.fromEntries(R.map(r=>[r,{}])),trip:null,nextTripAbs:now+1,
    champ:Object.fromEntries(R.map(r=>[r,{state:"locked",fid:null,w:0,l:0}])),cups:[],meet:{},hall:[],pend:[],gc:[]};
  addMail(G,{kind:"letter",from:"NAGA Energy Drink",title:"Invitation: Four Regions Championship",
    body:`Dear Manager of Sirichai Camp,

With three provincial titles to your name, NAGA Energy Drink invites your camp to the "Four Regions Championship", the country's first regional tournament.

Win the belts of all four provinces in each region, then challenge the regional champion of the North, Isan, the Central Plains and the South for the cup.

See the details and plan your trips under Fights › Four Regions.

Respectfully,
Kerk, Chairman of NAGA Energy Drink`});}
/* weekly: send the invitation once the camp qualifies, tidy finished trips */
function regionWeek(G){if(!regionOn())return;if(!G.region){if(regionReady(G))regionStart(G);return;}
  if(typeof REGION!=="undefined"&&REGION.weekly)REGION.weekly(G);}
/* a regional bout just ended: queue it for region.js (it may still be loading) */
function regionAfterFight(G,b,ret){if(!G.region)return;G.region.pend=G.region.pend||[];G.region.pend.push({bid:b.id,a:b.a,b:b.b,region:b.region,res:ret?ret.res:null});
  if(typeof REGION!=="undefined"&&REGION.flush)REGION.flush(G);}
function stageOf(w){return w<=20?"local":w<=40?"district":w<=50?"final":"off";}
const STAGE_NAME={local:"Subdistrict round",district:"District round",final:"Provincial final",off:"Year end"};

function ployAura(w,G){const b=Math.max(0,.42*(1-(w-1)/27));if(!G||!G.F||!G.F.ploy||G.F.ploy.camp!=="rival")return G&&G.F&&G.F.ploy&&G.F.ploy.camp==="player"?0:b;if(G.flags&&G.flags.beatS_ploy===(G.season||1))return b;/* v1.59: the undefeated genius keeps her edge until someone beats her this year */return Math.max(b,w<41?.2:w<49?.14:.05);} // v1.23: Ploy's early edge is gone by week 28
function startLv(f){if(f.id==="ploy")f.aura=ployAura(1);if(f.id==="ploy")f.lvl=5;else if(f.id==="fah")f.lvl=3;else if(f.camp==="npc")f.lvl=clamp(Math.round(ovr(f.a)-7),1,6);}
// v1.22 difficulty: easy = rivals grow slower + more class income; hard = rivals grow faster and use skills harder
const DIFF={easy:{rival:.7,ai:.6,inc:1.2,train:1.12,name:"Easy"},normal:{rival:1,ai:.8,inc:1,train:1,name:"Normal"},hard:{rival:1.12,ai:.95,inc:.9,train:.97,name:"It is"}};
const dif=G=>DIFF[(G&&G.diff)||"normal"]||DIFF.normal;
// v1.48: seeded "random" for gameplay rolls outside fights, so a shared seed replays the same
function srand(G,salt){return mulberry32((((G&&G.seed)||1)+((G&&G.week)||0)*7919+(salt|0)*104729)>>>0)();}
function newGame(opts){
  const seed=(opts.seed??Math.floor(Math.random()*1e9))>>>0;const rng=mulberry32(seed);
  const G={v:1,timeV:3,snubV:2,dmSeenSeason:1,dmSeen:{},seed,week:1,diff:opts.diff||"normal",player:{name:opts.name||"Start",gender:opts.gender||"m"},cash:60000,debt:120000,rep:5,
    fac:{gym:0,airgym:0,recovery:0,classroom:0,brand:0,dorm:0,kitchen:0,hill:0,video:0,ring:0,clinic:0,shrine:0,van:0,sauna:0,lights:0,hall:0,daeng:1,assistants:0},stu:1,staff:[],rankMove:{A:{},B:{}},camp:{beauty:0},campUsed:null,levelUps:[],avatar:opts.avatar||null,F:{},rank:{A:{},B:{}},qual:{A:[],B:[]},finalists:{A:[],B:[]},semis:{A:[],B:[]},champ:{},
    bookings:[],offers:[],log:[],flags:{},seen:{},freeUsed:false,negWeeks:0,history:[],honors:[],awards:[],ended:null,lastReport:null,romance:null,lovers:[],lovWk:{}};
  for(const [id,d] of Object.entries(CANON))G.F[id]=baseFighter(id,d);
  for(const div of ["A","B"])NPC_NAMES[div].forEach(([n,l],i)=>{const id=`n${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i));});
  for(const f of Object.values(G.F))startLv(f);
  syncFighterAges(G);
  for(const f of Object.values(G.F))if(f.camp!=="player"&&f.camp!=="free"&&G.rank[f.div])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
  G.rank.A.kati={pts:0,w:0,l:0,d:0};
  ensureStageNPCs(G,"local");
  // v1.22 difficulty also moves where the two stars start
  {const d=G.diff;for(const id of ["ploy","fah"]){const adj=(d==="easy"?-.7:d==="hard"?.35:0)+(id==="ploy"?-.8:-1.5);/* v1.23: stars start lower, grow when beaten */const f=G.F[id];if(!f)continue;for(const [k] of ATTRS)f.a[k]=clamp(f.a[k]+adj,1,20);f.potential+=adj*.8;}}
  return G;
}
const roster=G=>Object.values(G.F).filter(f=>f.camp==="player");
const wageOf=f=>Math.round(f.wage*(1+(Math.min(f.lvl||1,15)-1)*.06)/100)*100; // v1.43: stars ask for more as they level up
const wages=G=>roster(G).reduce((s,f)=>s+wageOf(f),0)+(G.staff?G.staff.reduce((s,k)=>s+STAFF[k].wage,0):G.fac.assistants*2500);
// ---------- CAMP FACILITIES & STUDENTS ----------
// Fixed camp slots: rarity indicates acquisition difficulty, never an extra stat bonus.
const DECOR_RARITY={N:"#aab0ba",R:"#5ba9e8",SR:"#bd83e8",SSR:"#f4c75b",SS:"#ff8f62"};
const CAMP_DECOR={
 tree:{name:"Trees",items:{none:{name:"No tree",r:"N"},plain:{name:"Local tree",r:"N"},blossom:{name:"Wild Himalayan cherry tree",r:"R",rep:15},sakura:{name:"Sakura garden",r:"SR",rep:30,year:2},champion:{name:"Victory tree",r:"SSR",honor:"province"},golden:{name:"Legendary golden tree",r:"SS",titles:3},flame:{name:"Flame tree",r:"R",shop:1,price:22000},lilawadee:{name:"Frangipani tree",r:"R",shop:1,price:28000},rachaphruek:{name:"Golden shower tree",r:"SR",shop:1,price:55000},sritrang:{name:"Jacaranda Tree",r:"R",shop:1,price:28000},thongkwao:{name:"Flame of the Forest",r:"R",shop:1,price:26000}}},
 gate:{name:"Entrance gate",items:{none:{name:"No gate",r:"N"},plain:{name:"Wooden gate",r:"N"},painted:{name:"Camp color gate",r:"R",fac:["brand",1]},lantern:{name:"Lantern gate",r:"SR",year:2,rep:18},trophy:{name:"Trophy gate",r:"SSR",honors:3},gold:{name:"Golden honor gate",r:"SS",honors:8},lanna:{name:"Lanna teak gate",r:"SR",shop:1,price:60000},jade:{name:"Jade gate",r:"SR",shop:1,price:65000},indigo:{name:"Indigo Cloth Gate",r:"SR",shop:1,price:58000},stucco:{name:"White Stucco Gate",r:"SR",shop:1,price:62000},bougain:{name:"Bougainvillea Arch",r:"SR",shop:1,price:60000},marigold:{name:"Marigold Arch",r:"SR",shop:1,price:60000}}},
 ring:{name:"Boxing ring",items:{plain:{name:"Original ring",r:"N"},red:{name:"Red ring trim",r:"R",fac:["ring",1]},blue:{name:"Blue ring trim",r:"R",fac:["ring",2]},sponsor:{name:"Sponsor ring",r:"SR",rep:30},gold:{name:"Champion ring",r:"SSR",honor:"province"},green:{name:"Emerald green ring",r:"R",shop:1,price:30000},purple:{name:"Royal purple ring",r:"SR",shop:1,price:60000},black:{name:"Midnight black ring",r:"SR",shop:1,price:75000},pink:{name:"Pastel Pink Ring",r:"R",shop:1,price:35000},orange:{name:"Bright Orange Ring",r:"R",shop:1,price:35000},yellow:{name:"Sunflower Yellow Ring",r:"R",shop:1,price:35000}}},
 track:{name:"Camp running track",items:{dirt:{name:"Dirt path",r:"N"},chalk:{name:"Chalk lane",r:"R",fac:["hill",1]},gravel:{name:"Gravel track",r:"SR",fac:["hill",2]},rubber:{name:"Rubber track",r:"SR",fac:["gym",2],rep:20},lantern:{name:"Lantern track",r:"SSR",year:3,rep:35},blue:{name:"Blue track",r:"R",shop:1,price:30000},green:{name:"Green track",r:"R",shop:1,price:30000},pink:{name:"Pink Track",r:"R",shop:1,price:30000},yellow:{name:"Yellow Track",r:"R",shop:1,price:30000},goldcarpet:{name:"Gold Carpet Track",r:"SSR",beauty:1}}},
 vehicle:{name:"Camp vehicle",items:{none:{name:"No vehicle",r:"N"},songthaew:{name:"Songthaew",r:"R",fac:["van",1]},minibus:{name:"Van",r:"SR",fac:["van",2]},tourbus:{name:"Camp bus",r:"SR",fac:["van",2],rep:35},limo:{name:"Limousine",r:"SSR",fac:["van",2],rep:45,honor:"province"},goldvan:{name:"Golden van",r:"SS",bossWins:10},rotdaeng:{name:"Chiang Mai red truck",r:"R",shop:1,price:40000},pinkvan:{name:"Pastel pink van",r:"SR",shop:1,price:95000},bluevan:{name:"Ocean Blue Van",r:"SR",shop:1,price:85000},tuktuk:{name:"Orange Tuk-tuk",r:"R",shop:1,price:45000},yellowthaew:{name:"Yellow Songthaew",r:"R",shop:1,price:40000}}},
 bags:{name:"Punching bags",items:{plain:{name:"Old bag",r:"N"},red:{name:"Red bag",r:"R",fac:["gym",1]},blue:{name:"Blue bag",r:"R",fac:["gym",2]},team:{name:"Camp crest bag",r:"SR",rep:20},gold:{name:"Champion bag",r:"SSR",honors:5},green:{name:"Army green bags",r:"N",shop:1,price:8000},black:{name:"Matte black bags",r:"R",shop:1,price:15000},pink:{name:"Sweet pink bags",r:"R",shop:1,price:15000},white:{name:"Pearl White Bags",r:"N",shop:1,price:8000},orange:{name:"Bright Orange Bags",r:"R",shop:1,price:15000},yellow:{name:"Bright Yellow Bags",r:"R",shop:1,price:15000}}}
};
const campWeekIndex=G=>gameWeek(G);
const goldRematchReady=G=>(G.gang&&G.gang.st>=5)&&campWeekIndex(G)>=(G.gangRematchAt||0);
const goldRematchLabel=G=>{const n=G.gangRematchAt||0;return "Year "+(Math.floor((n-1)/52)+1)+" week "+(((n-1)%52)+1);};
const decorDefault=slot=>({tree:"plain",gate:"plain",ring:"plain",track:"dirt",vehicle:"none",bags:"plain"})[slot];
function decorUnlockReason(G,slot,key){const D=CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key];if(!D)return "Unknown decoration";if(G.decorUnlocks&&G.decorUnlocks[slot]&&G.decorUnlocks[slot].includes(key))return "";const need=[];
 if(D.shop)need.push("Buy in the shop");
 if(D.rep&&G.rep<D.rep)need.push("Fame "+D.rep+" (current: "+G.rep.toFixed(1)+")");
 if(D.fac&&(G.fac[D.fac[0]]||0)<D.fac[1])need.push("Upgrade "+FACILITIES[D.fac[0]].name+" level "+D.fac[1]);
 if(D.year&&(G.season||1)<D.year)need.push("Reach year "+D.year);
 if(D.honor&&!(G.honors||[]).some(h=>h.kind===D.honor))need.push("Win the provincial championship");
 if(D.honors&&(G.honors||[]).length<D.honors)need.push("Collect "+D.honors+" honors (current: "+(G.honors||[]).length+")");
 if(D.titles&&(G.honors||[]).filter(h=>h.kind==="province").length<D.titles)need.push("Win the provincial title "+D.titles+" times");
 if(D.beauty&&(G.beautyWins||0)<D.beauty)need.push("Win the Camp Beauty Contest");
 if(D.bossWins&&(G.goldHelmetWins||0)<D.bossWins)need.push("Defeat the Golden Helmet boss "+D.bossWins+" wins (current: "+(G.goldHelmetWins||0)+")");
 return need.join(" · ");}
function decorUnlocked(G,slot,key){return !!(CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key])&&!decorUnlockReason(G,slot,key);}
function chooseDecor(G,slot,key){if(!decorUnlocked(G,slot,key))return false;G.decor=G.decor||{};G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];if(!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);G.decor[slot]=key;return true;}
function grantDecorUnlocks(G){G.decorUnlocks=G.decorUnlocks||{};for(const [slot,D] of Object.entries(CAMP_DECOR)){G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];for(const key of Object.keys(D.items))if(!decorUnlockReason(G,slot,key)&&!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);}}
// v1.83.1: two separate kinds — earned pieces come only from their condition; shop pieces are bought (late-game money sink)
function decorPrice(G,slot,key){const D=CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key];if(!D||!D.shop||!decorUnlockReason(G,slot,key))return 0;return D.price||0;}
function buyDecor(G,slot,key){const c=decorPrice(G,slot,key);if(!c||G.cash<c)return false;G.cash-=c;G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];if(!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);G.decor=G.decor||{};G.decor[slot]=key;G.decorSpent=(G.decorSpent||0)+c;return true;}
// ===== v1.86: annual camp beauty contest =====
/* the district chief reads the year's lucky colour at new year; at week 30 he walks the camp and scores seven areas out of 10 */
const YEAR_COLORS=[{k:"red",n:"Red",hex:"#d23246",luck:"Red this year: brave hearts that never back down"},{k:"green",n:"Green",hex:"#3f9a4f",luck:"Green this year: peace and steady growth"},
  {k:"blue",n:"Blue",hex:"#2c5fb3",luck:"Blue this year: a calm mind, big plans succeed"},{k:"pink",n:"Pink",hex:"#e07aa0",luck:"Pink this year: charm that wins every heart"},
  {k:"white",n:"White",hex:"#f2f2f2",luck:"White this year: a pure heart, elders smile on you"},{k:"orange",n:"Orange",hex:"#e8892a",luck:"Orange this year: fired up, work flourishes"},
  {k:"yellow",n:"Yellow",hex:"#e0b41b",luck:"Yellow this year: sharp minds and money flowing in"},{k:"gold",n:"Gold",hex:"#f2c14e",luck:"Gold this year: great standing, honours come calling"}];
const DECOR_COL={tree:{plain:"green",blossom:"pink",sakura:"pink",champion:"gold",golden:"gold",flame:"red",lilawadee:"white",rachaphruek:"yellow",sritrang:"blue",thongkwao:"orange"},
  gate:{plain:"brown",painted:"red",lantern:"orange",trophy:"gold",gold:"gold",lanna:"brown",jade:"green",indigo:"blue",stucco:"white",bougain:"pink",marigold:"yellow"},
  ring:{plain:"white",red:"red",blue:"blue",sponsor:"purple",gold:"gold",green:"green",purple:"purple",black:"black",pink:"pink",orange:"orange",yellow:"yellow"},
  track:{dirt:"brown",chalk:"white",gravel:"brown",rubber:"red",lantern:"orange",blue:"blue",green:"green",pink:"pink",yellow:"yellow",goldcarpet:"gold"},
  vehicle:{songthaew:"green",minibus:"white",tourbus:"red",limo:"black",goldvan:"gold",rotdaeng:"red",pinkvan:"pink",bluevan:"blue",tuktuk:"orange",yellowthaew:"yellow"},
  bags:{plain:"brown",red:"red",blue:"blue",team:"purple",gold:"gold",green:"green",black:"black",pink:"pink",white:"white",orange:"orange",yellow:"yellow"}};
const COLOR_NAME={red:"Red",green:"Green",blue:"Blue",pink:"Pink",white:"White",orange:"Orange",yellow:"Yellow",gold:"Gold",brown:"Brown",purple:"Purple",black:"Black"};
const COLOR_HEX={red:"#d23246",green:"#3f9a4f",blue:"#2c5fb3",pink:"#e07aa0",white:"#f2f2f2",orange:"#e8892a",yellow:"#e0b41b",gold:"#f2c14e",brown:"#8a5a32",purple:"#7a3fc0",black:"#24202c"};
const decorColor=(slot,key)=>(DECOR_COL[slot]||{})[key]||null;
function yearColor(G,season){const s=season||G.season||1;return YEAR_COLORS[(stableHash("ycol"+(G.seed||1))+s*3)%YEAR_COLORS.length];}
// v1.90: annual wai kru (week 37 ≈ Muay Thai Day, 6 Feb) — the whole camp pays respect to the teachers; new fighters are taken in as students (khrop khru)
const WAIKHRU_WEEK=37,WAI_SET={s:{n:"Simple set",d:"Flowers, incense and candles from the morning market",cost:0,mor:4,bless:0},m:{n:"Standard set",d:"Jasmine tray, white cloth, an envelope for the teacher",cost:2500,mor:7,bless:4},l:{n:"Full ceremony",d:"Baisri offering, a live pi-and-drum band, a meal for the whole subdistrict",cost:7000,mor:10,bless:8,rep:1}};
function runWaiKhru(G,k){const S=G.season||1;G.waikhru=G.waikhru||{};if(G.waikhru[S])return G.waikhru[S];const W=WAI_SET[k]||WAI_SET.s;if(G.cash<W.cost)return null;G.cash-=W.cost;
  const R=roster(G),krob=R.filter(f=>!f.krob&&f.id!=="kati").map(f=>f.id);R.forEach(f=>{f.morale=clamp(f.morale+W.mor,0,100);f.trust=clamp((f.trust||0)+(W.bless?2:1),0,100);f.krob=f.krob||S;});
  if(W.bless)G.waiBless=gameWeek(G)+W.bless;if(W.rep)G.rep+=W.rep;
  return G.waikhru[S]={k,ids:R.map(f=>f.id),krob,mor:W.mor,bless:W.bless,first:!Object.keys(G.waikhru).length};}
const CONTEST_WEEK=30,BEAUTY_RARITY={N:4,R:6,SR:7,SSR:8,SS:9},CONTEST_PRIZE=[30000,15000,8000];
const BEAUTY_AREAS=[["gate","Entrance gate"],["bags","Punching bags"],["tree","Trees"],["ring","Boxing ring"],["vehicle","Camp vehicle"],["track","Track"],["clean","Cleanliness"]];
function beautyAreas(G){const yc=yearColor(G).k;return BEAUTY_AREAS.map(([k,n])=>{
  if(k==="clean"){const v=clamp(Math.round((G.camp&&G.camp.beauty)||0),1,10);return {k,n,score:v,base:v,match:false,item:v>=8?"spotless yard":v>=5?"tidy yard":"still messy"};}
  const key=decorChoice(G,k),D=CAMP_DECOR[k].items[key]||{},none=key==="none",base=none?1:BEAUTY_RARITY[D.r]||4,match=!none&&decorColor(k,key)===yc;
  return {k,n,score:Math.min(10,base+(match?2:0)),base,match,item:D.name||""};});}
const beautyTotal=G=>beautyAreas(G).reduce((s,a)=>s+a.score,0);
const RIVAL_CAMPS=[["Golden Tiger Camp",7.1,.25],["Phet Lanna Camp",6.0,.2],["S. Mae Ping Camp",5.4,.18],["Luk Doi Kham Camp",4.8,.15]];
function runContest(G){const S=G.season||1;G.contests=G.contests||{};if(G.contests[S])return G.contests[S];const rng=mulberry32((G.seed||1)*17+S*9173);
  const areas=beautyAreas(G),me=areas.reduce((s,a)=>s+a.score,0);
  const field=RIVAL_CAMPS.map(([name,mu,gr])=>{let t=0;for(let i=0;i<7;i++)t+=clamp(Math.round(mu+(S-1)*gr+(rng()-.5)*2.4),2,10);return {name,score:Math.min(t,66)};});
  field.push({name:"Sirichai Camp",score:me,me:true});field.sort((a,b)=>b.score-a.score||(b.me?1:0)-(a.me?1:0));const rank=field.findIndex(x=>x.me)+1;
  const prize=CONTEST_PRIZE[rank-1]||0,rep=[4,2,1][rank-1]||.5;G.cash+=prize;G.rep+=rep;if(rank===1){G.beautyWins=(G.beautyWins||0)+1;}
  const unlock=rank===1&&G.beautyWins===1?"Gold Carpet Track":null;if(unlock)grantDecorUnlocks(G);
  const R={season:S,color:yearColor(G).k,areas,total:me,field,rank,prize,rep,unlock};G.contests[S]=R;return R;}
function decorChoice(G,slot){const key=G.decor&&G.decor[slot];return decorUnlocked(G,slot,key)?key:decorDefault(slot);}
const FACILITIES={
  gym:{name:"Training gear",cost:[20000,35000,60000],desc:"Training effect +10% per level"},
  recovery:{name:"Recovery room & ice baths",cost:[15000,30000,50000],desc:"Fatigue recovery +5/wk per level"},
  classroom:{name:"Class yard",cost:[8000,14000,22000,32000,45000],desc:"Holds 3 more students per level"},
  brand:{name:"Signs & camp promotion",cost:[8000,20000,40000,50000],desc:"+3 people want to join per level, fame +0.5"},
  dorm:{name:"Fighter dorm",cost:[18000,40000,60000,90000],desc:"Morale +1.5 and trust +0.3 weekly, per level"},
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
  airgym:{name:"Filtered indoor gym",cost:[250000],desc:"Sealed, air-conditioned and filtered: full training even in PM2.5 years · all training +3%",req:{lv:2}},
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
function fixSave(G){if(G&&G.ev&&G.ev.loy&&typeof thiefFix==="function")thiefFix(G);if(G&&G.F&&G.prodigy)fixProdigies(G);if(G&&G.flags&&G.flags.beat_ploy&&G.flags.beatS_ploy==null)G.flags.beatS_ploy=G.season||1;
  // Legacy saves used week-of-season values. Infer only short, plausible effects;
  // otherwise expire them instead of resurrecting an old effect after New Year.
  const now=gameWeek(G),base=now-G.week;
  const oldExpiry=(w,max=6)=>{if(!Number.isFinite(w))return null;
    for(const t of [base+w,base-52+w])if(t>=now&&t-now<=max)return t;
    return null;};
  const oldPast=(w,max)=>{if(!Number.isFinite(w))return null;
    for(const t of [base+w,base-52+w])if(t<=now&&now-t<=max)return t;
    return null;};
  if(G.disaster){if(!Number.isFinite(G.disaster.untilAbs))G.disaster.untilAbs=oldExpiry(G.disaster.until,4);
    if(G.disaster.untilAbs==null||G.disaster.untilAbs<=now)G.disaster=null;}
  G.scout=G.scout||{};G.scoutAbs=G.scoutAbs||{};
  for(const [id,w] of Object.entries(G.scout)){if(G.scoutAbs[id]==null)G.scoutAbs[id]=oldPast(w,8);delete G.scout[id];}
  if(G.rinTapeWk!=null&&G.rinTapeAbs==null)G.rinTapeAbs=oldPast(G.rinTapeWk,3);
  G.rinTapeWk=null;
  if(G.coachAway&&G.coachAwayAbs==null)G.coachAwayAbs=oldExpiry(G.coachAway,4);
  G.coachAway=null;
  if(!G.timeV){for(const [k,w] of Object.entries(G.mem||{}))G.mem[k]=oldPast(w,52)??0;
    if(G.snap&&G.snap.week!=null)G.snap.week=oldPast(G.snap.week,52)??now;
    if(G.lastBeat)G.lastBeat=oldPast(G.lastBeat,2)??0;
    if(G.lastDilemma)G.lastDilemma=oldPast(G.lastDilemma,2)??0;
    for(const f of Object.values(G.F||{})){if(f.giftWeek!=null)f.giftWeek=oldPast(f.giftWeek,0);
      for(const [k,w] of Object.entries(f.giftL||{})){const t=oldPast(w,6);if(t==null){delete f.giftL[k];if(f.giftN)f.giftN[k]=0;}else f.giftL[k]=t;}}
    for(const p of G.pets||[])if(p.wk!=null)p.wk=oldPast(p.wk,0);
    for(const l of G.losses||[])if(l.absWeek==null)l.absWeek=oldPast(l.wk,6);
    for(const c of G.cal||[])if(c.absWeek==null)c.absWeek=oldPast(c.wk,1);
    for(const m of G.mail||[]){if(m.exp!=null&&m.expAbs==null)m.expAbs=oldExpiry(m.exp,4);
      if(m.exp!=null&&m.expAbs==null&&!m.done)m.expired=true;}
    if(G.gang&&G.gang.next!=null&&G.gang.nextAbs==null)G.gang.nextAbs=oldExpiry(G.gang.next,6);
    if(G.tamNext!=null&&G.tamNextAbs==null)G.tamNextAbs=oldExpiry(G.tamNext,6);
    G.timeV=2;}
  if((G.timeV||0)<3){for(const f of Object.values(G.F||{})){if(f.lastFightAbs==null&&f.lastFight>0)f.lastFightAbs=oldPast(f.lastFight,52);f.lockWeek=null;}
    if(G.romWk!=null)G.romWk=oldPast(G.romWk,52);
    if(G.lastBig&&!G.lastBig.shown){G.lastBig.absWeek=oldPast(G.lastBig.wk,1);if(G.lastBig.absWeek==null)G.lastBig.shown=true;}
    for(const [id,w] of Object.entries(G.tiredAt||{}))G.tiredAt[id]=oldPast(w,3);
    for(const id of ["fah","ploy"]){const key=id+"Joined",old=G.flags?.[key];if(old!=null&&G.flags[key+"Abs"]==null)G.flags[key+"Abs"]=oldPast(old,52);}
    G.seenAbs=G.seenAbs||{};for(const [id,w] of Object.entries(G.seenWk||{}))G.seenAbs[id]=oldPast(w,3);
    G.chatLastAbs=G.chatLastAbs||{};for(const [id,w] of Object.entries(G.chatLast||{}))G.chatLastAbs[id]=oldPast(w,3);
    G.chatWkAbs=G.chatWkAbs||{};for(const [id,w] of Object.entries(G.chatWk||{}))G.chatWkAbs[id]=oldPast(w,52);
    if(G.flags?.maliIn!=null&&G.flags.maliInAbs==null)G.flags.maliInAbs=oldPast(G.flags.maliIn,52);
    if(G.dm?.wk!=null&&G.dm.absWeek==null)G.dm.absWeek=oldPast(G.dm.wk,2);
    G.timeV=3;}
  /* v1.89.11: one lover became a list (several at once, Valentine can catch you) */
  if(!Array.isArray(G.lovers)){G.lovers=G.romance?[G.romance]:[];G.lovWk={};if(G.romance&&G.romWk!=null)G.lovWk[G.romance]=G.romWk;}
  if(!G.snubV){G.snub={};G.declineReason={};G.snubV=2;}
  if(G.dmSeenSeason==null){const played=G.dm&&G.dm.wk===G.week;G.dmSeen=(G.season||1)>1?{}:G.dmSeen||{};if(played)G.dmSeen[G.week]=1;G.dmSeenSeason=G.season||1;}
  syncFighterAges(G);
if(G.F)for(const id in G.F){const f=G.F[id];if(f&&hasTree(id)&&!f.spv){f.sp=(f.sp||0)+2*Math.max(0,(f.lvl||1)-1);f.spv=2;}}G.fac=G.fac||{};for(const k of Object.keys(FACILITIES))G.fac[k]=G.fac[k]||0;G.fac.daeng=G.fac.daeng||1;
  if(!G.staff){G.staff=["nok","paeng"].slice(0,G.fac.assistants||0);}G.fac.assistants=G.staff.length;
  if(G.stu==null)G.stu=Math.min(studentCap(G),studentDemand(G));G.mail=G.mail||[];G.cal=G.cal||[];if((G.season||1)>=2&&(!G.yt||G.yt.season!==(G.season||1))&&G.week<=3)pickYearTheme(G);
  if(!Array.isArray(G.honors)){G.honors=[];for(const t of G.titles||[])for(const [div,id] of Object.entries(t.champ||{}))if(G.F[id]?.camp==="player")G.honors.push({key:`${t.season}:province:${div}`,season:t.season,week:49,id,div,kind:"province"});
    for(const [div,id] of Object.entries(G.champ||{}))if(G.F[id]?.camp==="player")G.honors.push({key:`${G.season||1}:province:${div}`,season:G.season||1,week:49,id,div,kind:"province"});
    (G.dmLog||[]).forEach((x,i)=>{if(G.F[x.champ]?.camp==="player")G.honors.push({key:`legacy:dm:${i}`,season:null,week:x.wk,id:x.champ,div:G.F[x.champ].div,kind:"dm"});});
    for(const [div,b] of Object.entries(G.belt||{}))if(G.F[b.id]?.camp==="player")G.honors.push({key:`legacy:belt:${div}`,season:null,week:b.since||0,id:b.id,div,kind:"belt"});
    for(const f of Object.values(G.F))if(f.camp==="player"&&f.belts>0&&!G.honors.some(h=>h.kind==="belt"&&h.id===f.id))G.honors.push({key:`legacy:belt:${f.id}`,season:null,week:0,id:f.id,div:f.div,kind:"belt"});}
  G.awards=Array.isArray(G.awards)?G.awards:[];G.rank=G.rank||{A:{},B:{}};for(const d of ["A","B"])G.rank[d]=G.rank[d]||{};for(const f of Object.values(G.F))if(f.camp!=="free"&&f.camp!=="quest"&&(f.div==="A"||f.div==="B")&&!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};G.decor=G.decor||{};if(G.goldHelmetWins==null)G.goldHelmetWins=G.gang&&G.gang.st>=5?1:0;grantDecorUnlocks(G);for(const [slot,key] of Object.entries(G.decor))if(CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key]&&!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);lateSeasonOpposition(G);return G;}
function recordHonor(G,kind,id,div,week=G.week,venue=null){if(!G.F[id]||G.F[id].camp!=="player")return null;G.honors=G.honors||[];G.awards=G.awards||[];
  const season=G.season||1,key=`${season}:${kind}:${div}:${venue||""}:${kind==="dm"||kind==="belt"||kind==="defense"?week:id}`;
  if(G.honors.some(h=>h.key===key))return null;const h={key,season,week,id,div,kind,...(venue?{venue}:{})};G.honors.push(h);G.awards.push(h);return h;}
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
const classIncome=G=>Math.round(students(G)*studentFee(G)*(ytKey(G)==="tourist"?1.2:1)*(G.disaster&&gameWeek(G)<G.disaster.untilAbs?(G.disaster.inc||0):1));
function campLook(G){return clamp(Math.round(facTotal(G)+(G.camp?G.camp.beauty:0)/2+Math.min(G.rep,30)/8),0,20);}
/* v1.90: the dorm's fourth level opens with the regional chapter · main characters get 5 + dorm level rooms */
const facMax=(G,k)=>k==="dorm"&&!G.region?3:FACILITIES[k].cost.length;
const dormRooms=G=>5+((G.fac&&G.fac.dorm)||0);
function buyFacility(G,k){const F=FACILITIES[k],lv=G.fac[k]||0;if(lv>=facMax(G,k)||facLocked(G,k))return false;const c=F.cost[lv];if(G.cash<c)return false;
  G.cash-=c;G.fac[k]=lv+1;if(k==="brand")G.rep+=.5;if(k==="shrine")G.rep+=1;if(k==="hall")G.rep+=1.5;if(k==="retreat")roster(G).forEach(f=>{["punch","kick","knee","elbow","clinch","guard","foot","stamina","power","speed"].forEach(q=>{f.a[q]=Math.min(Math.max(f.a[q],f.potential||18),f.a[q]+.4);});f.morale=Math.min(100,f.morale+15);f.fatigue=0;});return true;}
function upgradeDaeng(G){const lv=G.fac.daeng;if(lv>=3)return false;const c=DAENG_COST[lv];if(G.cash<c)return false;G.cash-=c;G.fac.daeng++;return true;}
const CAMP_ACTIONS={
  rest:{name:"Camp day off (no activity)",desc:"Free, everyone rests, fatigue −4",cost:0},
  // v1.68: minigames live inside camp activities — play it yourself, or skip for an average result
  drum:{name:"Bag kicks to the khong khaek drum",desc:"Rhythm minigame · kick/punch, morale, stardust",skip:"Kick/punch +0.1 · morale +3 · ✦ +2",cost:0,mg:"bag"},
  somtam:{name:"Help at Auntie Taew's som tam stall",desc:"Rhythm minigame · pay, fame, stardust",skip:"Earn ฿550 · morale +3 · ✦ +1",cost:0,mg:"somtam",hidden:true},/* v1.69: now arrives as a job letter; kept so old saves still resolve its name */
  class:{name:"Special Sunday class",desc:"+฿1,000 but fighters help teach, fatigue +6",cost:0},
  promo:{name:"Promote the camp online",desc:"Fame +0.6",cost:1000},
  run:{name:"Camp 100 m sprint",desc:"Running minigame · speed/stamina, morale, stardust",skip:"Speed +0.05 · morale +3 · ✦ +1",cost:0,mg:"run"},
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
  mask:{name:"Hand out dust masks to the neighbours",desc:"Fame +1.5 · morale +2 (PM2.5 weeks only)",cost:3000,yt:"pm25"},
  waikhru:{name:"Wai khru ceremony at the shrine",desc:"Everyone's morale +8 · trust +2 · fame +1",cost:3000,fac:["shrine",1]},
};
const campActLocked=(G,a)=>a.yt&&!ytIn(G,a.yt)?"PM2.5 weeks only":a.rep&&G.rep<a.rep?`Fame ${a.rep}`:a.fac&&(G.fac[a.fac[0]]||0)<a.fac[1]?`${FACILITIES[a.fac[0]].name}${a.fac[1]>1?` level ${a.fac[1]}`:""}`:"";
function doCampAction(G,k){const A=CAMP_ACTIONS[k];if(!A||G.campUsed||G.cash<A.cost||campActLocked(G,A))return null;G.cash-=A.cost;G.campUsed=k;const R=roster(G);let note="";
  if(k==="rest"){R.forEach(f=>f.fatigue=clamp(f.fatigue-4,0,100));note="Everyone gets a breather, fatigue drops a little";}
  if(k==="class"){G.cash+=1000;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="Extra ฿1,000, fighters a little more tired";}
  if(k==="promo"){G.rep+=.6;note="Fame +0.6";}
  if(k==="run"){const f=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];if(f)f.a.speed=Math.min(stCap(f),f.a.speed+.05);R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+1;note="A race around the camp yard · speed +0.05 · ✦ +1";}
  if(k==="live"){G.cash+=600;G.dust=(G.dust||0)+1;note="A short live sold a few shirts: ฿600 · ✦ +1";}
  if(k==="drum"){const f=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];if(f){f.a.kick=Math.min(stCap(f),f.a.kick+.1);f.a.punch=Math.min(stCap(f),f.a.punch+.1);}R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+2;note="Light drills to the khong khaek drum: kick/punch +0.1 · ✦ +2";}
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
  if(k==="trail"){R.forEach(f=>{f.a.stamina=Math.min(stCap(f),f.a.stamina+.2);f.fatigue=clamp(f.fatigue+5,0,100);f.morale=clamp(f.morale+2,0,100);});note="The view from the mountain was gorgeous, stamina +0.2";}
  if(k==="tape"){R.forEach(f=>gainXP(G,f,15));G.scoutAbs=G.scoutAbs||{};for(const b of G.bookings)if(G.F[b.a].camp==="player")G.scoutAbs[b.b]=gameWeek(G);note="Watched tapes of every booked opponent, EXP +15";}
  if(k==="fightnight"){G.cash+=4000;G.rep+=1;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="Tickets sold out, packed ringside, +฿4,000";}
  if(k==="clinicday"){R.forEach(f=>{f.fatigue=clamp(f.fatigue-15,0,100);if(f.injury>0)f.injury--;});note="Everyone feels lighter, fatigue −15";}
  if(k==="mask"){G.rep+=1.5;R.forEach(f=>f.morale=clamp(f.morale+2,0,100));note="The whole subdistrict is wearing Sirichai masks. Fame +1.5";}
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
const PETS={cat:{name:"Orange cat",food:150,eff:"Everyone: morale +2"},dog:{name:"Thai Ridgeback",food:250,eff:"Everyone: fatigue −3"},rooster:{name:"Retired fighting rooster",food:100,eff:"Everyone: morale +1 · fatigue −1"},turtle:{name:"Temple turtle",food:80,eff:"Everyone: morale +3 (calmer minds)"},otter:{name:"Riverside Otter",food:0,eff:"Swims alongside whoever is training · everyone's fatigue −1"}};
const PET_NAMES={cat:["Pomelo","Bread","Chubbs"],dog:["Blackie","Goldie","Khao Tu"],rooster:["Greenie","King Cluck","Goofy"],turtle:["Slowpoke","Mochi","Abbot"],otter:["Nam Ping","Krathong","Khao Niao"]};
const petFood=G=>(G&&G.pets||[]).reduce((s,p)=>s+(PETS[p.k]?PETS[p.k].food:0),0);
function petPlay(G,i){const p=(G.pets||[])[i];if(!p||p.wk===gameWeek(G))return false;p.wk=gameWeek(G);p.joy=Math.min(100,(p.joy||50)+10);const R=roster(G);
  if(p.k==="cat")R.forEach(f=>f.morale=Math.min(100,f.morale+2));if(p.k==="dog")R.forEach(f=>f.fatigue=Math.max(0,f.fatigue-3));
  if(p.k==="rooster")R.forEach(f=>{f.morale=Math.min(100,f.morale+1);f.fatigue=Math.max(0,f.fatigue-1);});if(p.k==="turtle")R.forEach(f=>f.morale=Math.min(100,f.morale+3));
  if(p.k==="otter")R.forEach(f=>f.fatigue=Math.max(0,f.fatigue-1)); /* v1.89.25: the Loy Krathong otter helps a little (Man's call) */
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
function diffTag(me,op){const d=effGap(typeof G!=="undefined"?G:null,me,op);return d<-.6?["easy","Easy"]:d<.35?["even","Even"]:d<1.1?["hard","It is"]:["vhard","Very hard"];}
const OFFER_BANDS=[-.7,.45,1.4,.9],EFF_BANDS=[-.9,-.1,.8,.3];
/* v1.83.1: our fighters are stronger than their stats show — skills, mastery, aura, grit, facilities and the corner picking the right plan.
   Measure that edge (in stat points) by sparring a mirror with none of it but a known ring-craft lead; from year 2 matchmaking, the field and rewards all use it. */
const _edge={};
function hiddenEdge(f){if(!f||f.camp!=="player")return 0;const key=(traitOf(f)||"")+":"+(f.lvl||1)+":"+Object.values(f.skills||{}).reduce((s,v)=>s+v,0)+":"+(f.equip||[]).join()+":"+ovr(f.a).toFixed(1)+":"+(f.aura||0)+":"+(f.grit||0)+":"+(f.facPrep||0)+":"+hasSignature(f);
  if(_edge[f.id]&&_edge[f.id].k===key)return _edge[f.id].v;
  const me={...f,a:{...f.a},morale:65,fatigue:0,injury:0},OFF=3,o=ovr(f.a),mir={...f,id:"_mirror",camp:"npc",canon:false,trait:null,vet:OFF,a:Object.fromEntries(Object.keys(f.a).map(k=>[k,o])),skills:{},aura:0,grit:0,counterPrep:false,prepBonus:false,ployNotes:false,labPrep:0,morale:65,fatigue:0,injury:0};
  let best=0;for(const plan of Object.keys(PLANS)){let w=0;const n=16;for(let i=0;i<n;i++){const F=newFight(me,mir,{seed:7001+i*13,rounds:3,planA:plan});
    while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}w+=F.result.win==="A"?1:F.result.win==="D"?.5:0;}best=Math.max(best,w/n);}
  const r=clamp(best,.03,.97),v=Math.max(0,OFF+Math.log(r/(1-r))/.9);_edge[f.id]={k:key,v};return v;}
const edgeOf=(G,f)=>f&&f.camp!=="player"?(f.vet||0):(G&&(G.season||1)>=2)?hiddenEdge(f):0;
const effOvr=(G,f)=>ovr(f.a)+edgeOf(G,f);
/* how much harder `op` is than `me` once the hidden edge is counted (positive = tougher) */
/* v1.88: like an RPG enemy level, an opponent's level follows her real strength (stats + ring craft),
   on the same scale our own fighters reach (fitted from long bot runs: our Lv 8 ≈ 12, Lv 15 ≈ 17 effective).
   Our fighters and the five canon girls keep the level they earned. */
const LV_BASE=6,LV_STEP=.75;
function powLv(f){return clamp(Math.round((ovr(f.a)+(f.vet||0)-LV_BASE)/LV_STEP),1,MAX_LV);}
/* v1.88: read against our own camp. An even opponent sits at our best fighter's level in that division; the gap comes from
   simulated fights (the same coach advice the offers use), so hidden edges — Ploy's aura, Vector lab prep, rage — count too.
   Win 50% = same level · ~25% = about +2.5 · ~10% = about +5. The level shown never drops, so an improved opponent reads higher. */
const LV_LOGIT=.44,_lvc={};
function lvRef(G,f){if(!G||!G.F)return null;const P=Object.values(G.F).filter(x=>x.camp==="player"&&x.a);const mine=P.filter(x=>x.div===f.div);const L=mine.length?mine:P;if(!L.length)return null;
  let best=null,be=-1e9;for(const x of L){const e=effOvr(G,x);if(e>be){be=e;best=x;}}return best;}
function lvRate(G,me,op){const k=(G.season||1)+"_"+G.week+"_"+me.id+"_"+op.id;if(_lvc[k]==null){try{_lvc[k]=advise(G,me.id,op.id,3,24).bestRate;}catch(e){_lvc[k]=-1;}}return _lvc[k];}
function lvInfo(f){if(!f)return {lv:1,rate:null};if(f.camp==="player"||f.canon)return {lv:f.lvl||1,rate:null};
  const g=typeof G!=="undefined"?G:null,me=lvRef(g,f);let v=powLv(f),rate=null;
  if(me){rate=lvRate(g,me,f);if(rate>=0){const r=clamp(rate,.03,.97);v=clamp(Math.round((me.lvl||1)-Math.log(r/(1-r))/LV_LOGIT),1,MAX_LV);}else rate=null;}
  if(f.plv&&f.plv>v)v=f.plv;f.plv=v;return {lv:v,rate,me};}
function lvOf(f){return lvInfo(f).lv;}
const effGap=(G,me,op)=>ovr(op.a)-ovr(me.a)+((op.lvl||1)-(me.lvl||1))*.15-edgeOf(G,me)+edgeOf(G,op);
function genOffers(G,opt){
  const rng=mulberry32(G.seed+G.week*7919+11);G.snub=G.snub||{};const ignored=new Set();
  /* v1.82.3: only offers the NPC really sent and the player let lapse at week end count as a snub — not temple-fair or Vector bookings, not a mid-week refresh */
  if(!(opt&&opt.midweek))for(const o of G.offers||[])if(!o.beast&&!o.fair&&!o.lab&&o.status!=="conflict"&&!ignored.has(o.b)&&G.F[o.a]?.camp==="player"&&!isBooked(G,o.b)){
    ignored.add(o.b);G.snub[o.b]=(G.snub[o.b]||0)+1;}
  G.offers=[];const st=stageOf(G.week);
  const stageEnd=st==="local"?20:st==="district"?40:0;const nOff=G.week<=8?1:(2+(G.rep>=30?1:0)); // v1.32: one offer per fighter early, a third only once the camp is famous
  for(const f of roster(G)){
    if(f.injury>0||(typeof isAway==="function"&&isAway(G,f.id)))continue;
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
      const weakWk=((G.week+f.id.length*7+(G.season||1))%(G.rep>=40?4:3))===0; /* v1.83.1: an easy pick is on the table only some weeks */
      const y2=(G.season||1)>=2,c=(f.mmOff||0)+(G.week<=14&&!y2?[.4,.8,.5][i%3]:y2?(i===0&&weakWk?-1.6:EFF_BANDS[i%EFF_BANDS.length]):(i===0&&!weakWk?.15:OFFER_BANDS[i%OFFER_BANDS.length]))+(i>=3?(rng()-.5)*1.6:0); // early weeks: even fights, losses happen
      const o=pickW(rng,pool.map(x=>{const d=effGap(G,f,x);return [x,Math.exp(-((d-c)**2)/(2*.45*.45))+.01];}));used.add(o.id);
      // v1.15: purse = fee (paid win or lose) + win bonus; a better opponent, a crowd-drawing name or our own fame raise it
      const mult=clamp(1+effGap(G,f,o)*.12,.7,1.6)*(o.canon?1.35:1)*(1+(Math.min(f.lvl,20)-1)*.04)*(1+Math.min(G.rep,40)/200);
      G.offers.push({id:`o${G.week}_${f.id}_${i}`,a:f.id,b:o.id,week:wk,tier,win:Math.round(TIER[tier].win*mult/100)*100,lose:Math.round(TIER[tier].lose*mult/100)*100});
    }
    // v1.26: every 3 weeks a promoter offers a clearly stronger opponent for a bigger purse
    if(G.week>=9&&G.week<=42&&G.week%3===0){const wk=weeks[weeks.length-1],tier=ranked&&wk<=stageEnd?st:"exhibition";
      const hp=Object.values(G.F).filter(o=>o.div===f.div&&o.camp!=="player"&&o.camp!=="free"&&!o.canon&&o.injury===0&&!used.has(o.id)&&!isBooked(G,o.id,wk)&&(tier==="exhibition"||eligible(G,o)))
        .map(o=>[o,effGap(G,f,o)-(f.mmOff||0)]).filter(x=>x[1]>=.8&&x[1]<=2.1).sort((a,b)=>Math.abs(a[1]-1.4)-Math.abs(b[1]-1.4));
      if(hp.length){const o=hp[0][0];used.add(o.id);const mult=1.5*clamp(1+effGap(G,f,o)*.12,.7,1.6)*(1+(Math.min(f.lvl,20)-1)*.04)*(1+Math.min(G.rep,40)/200);
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
  if(arcYear(G,"vector")>=1&&[8,22,35].includes(G.week))for(const opId of (arcYear(G,"vector")>=2?["pailin","vector_A","vector_B"]:["pailin"])){const op=G.F[opId];if(!op||op.injury>0)continue;
    const fighters=roster(G).filter(f=>f.div===op.div&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));
    for(const f of fighters){const wk=[G.week+2,G.week+3,G.week+4].find(w=>w<=48&&!isBooked(G,op.id,w)&&!G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-w)<=1));
      if(wk&&!G.offers.some(o=>o.a===f.id&&o.b===op.id)){G.offers.push({id:`o${G.week}_${f.id}_${op.id}`,a:f.id,b:op.id,week:wk,tier:"lab",lab:1,win:TIER.lab.win,lose:TIER.lab.lose});break;}}}
  // v1.89.25: Baiyok's rematch letters to Fah — twice a year from her second season on, before and after she leaves Golden Tiger
  {const pb=G.prodigy&&G.prodigy.B,o=pb&&G.F[pb],fah=G.F.fah;if(o&&fah&&fah.camp==="player"&&(G.season||1)>=2&&[14,30].includes(G.week)&&!o.injury&&!fah.injury&&!(typeof isAway==="function"&&isAway(G,"fah"))){
    const wk=[G.week+3,G.week+4,G.week+2].find(w=>w<=48&&!isBooked(G,o.id,w)&&!G.bookings.some(b=>b.a==="fah"&&Math.abs(b.week-w)<=1));
    if(wk){G.offers=G.offers.filter(x=>!(x.a==="fah"&&x.b===o.id));G.offers.push({id:`o${G.week}_fah_by`,a:"fah",b:o.id,week:wk,tier:"special",rv:1,by:1,win:Math.round(TIER.special.win*1.6/100)*100,lose:Math.round(TIER.special.lose*1.4/100)*100});}}}
  // v1.89.27: Petchara's yearly challenge letter to Kati (week 12; the grudge offers at 25/29/33/36 come on top)
  {const pa=G.prodigy&&G.prodigy.A,o=pa&&G.F[pa],k=G.F.kati;if(o&&o.camp==="rival"&&k&&k.camp==="player"&&(G.season||1)>=2&&G.week===12&&!o.injury&&!k.injury&&!(typeof isAway==="function"&&isAway(G,"kati"))){
    const wk=[G.week+3,G.week+4,G.week+2].find(w=>w<=48&&!isBooked(G,o.id,w)&&!G.bookings.some(b=>b.a==="kati"&&Math.abs(b.week-w)<=1));
    if(wk){G.offers=G.offers.filter(x=>!(x.a==="kati"&&x.b===o.id));G.offers.push({id:`o${G.week}_kati_pc`,a:"kati",b:o.id,week:wk,tier:"special",rv:1,pc:1,win:Math.round(TIER.special.win*1.6/100)*100,lose:Math.round(TIER.special.lose*1.4/100)*100});}}}
  // v1.33: temple-fair bouts every other week: off the ranking, paid later by mail, now and then a cross-division star
  if(G.week>=4&&G.week<=46&&G.week%2===0){const R=roster(G).filter(f=>!f.injury);if(R.length){const f=R[Math.floor(rng()*R.length)];
    const myB=G.bookings.filter(b=>b.a===f.id).map(b=>b.week);const wk=[G.week+1,G.week+2,G.week+3].find(w=>!myB.some(x=>Math.abs(x-w)<=1)&&!G.offers.some(x=>x.a===f.id&&x.week===w));
    if(wk){let o=null,cross=false;const X=G.F[CROSS_OF[f.id]];
      if(G.week>=8&&X&&X.camp!=="player"&&!X.injury&&!isBooked(G,X.id,wk)&&rng()<.35){o=X;cross=true;}
      else{const pool=Object.values(G.F).filter(x=>x.div===f.div&&x.camp!=="player"&&!x.canon&&!x.injury&&!isBooked(G,x.id,wk)).map(x=>[x,Math.abs(ovr(x.a)-ovr(f.a)-.1)]).sort((a,b)=>a[1]-b[1]).slice(0,4);if(pool.length)o=pool[Math.floor(rng()*pool.length)][0];}
      if(o){const m=(1+Math.min(G.rep,50)/80)*(cross?1.6:1);G.offers.push({id:`o${G.week}_${f.id}_fair`,a:f.id,b:o.id,week:wk,tier:"exhibition",fair:1,cross:cross?1:0,win:Math.round(TIER.exhibition.win*m/100)*100,lose:Math.round(TIER.exhibition.lose*m/100)*100});}}}}
  if(G.region)G.offers=G.offers.filter(o=>!regionBlock(G,o.week)); /* v1.90: no home bouts while the camp is away */
}
function acceptOffer(G,oid){const o=G.offers.find(x=>x.id===oid);
  if(!o)return {ok:false,reason:"This offer is no longer available"};
  if(regionBlock(G,o.week))return {ok:false,reason:"The whole camp is away at the Four Regions Championship this week"};
  if(typeof isAway==="function"&&isAway(G,o.a)&&G.F[o.a].awayAbs>absWeek(G)+(o.week-G.week))return {ok:false,reason:`${G.F[o.a].name} isn't back at camp yet — can't take a fight that week`};
  if(o.status==="conflict")return {ok:false,reason:o.reason};
  const clash=(G.bookings||[]).find(b=>b.week===o.week&&[o.a,o.b].some(id=>id===b.a||id===b.b));
  const duplicate=(G.bookings||[]).some(b=>b.id==="b"+oid);
  const bad=duplicate?"This offer was already accepted":clash?`${G.F[clash.a===o.a||clash.b===o.a?o.a:o.b]?.name||"Fighter"} is already booked in week ${o.week}`:null;
  if(bad){o.status="conflict";o.reason=bad;return {ok:false,reason:bad};}
  const booking={id:"b"+oid,a:o.a,b:o.b,week:o.week,tier:o.tier,rounds:3,win:o.win,lose:o.lose,...(o.fair?{fair:1,cross:o.cross}:{})};
  G.bookings.push(booking);G.snub=G.snub||{};G.snub[o.b]=0;for(const m of G.mail||[])if(m.q==="challenge"&&m.npc===o.b&&!m.done){m.done=true;m.resolved=true;}
  G.offers=G.offers.filter(x=>!(x.a===o.a&&Math.abs(x.week-o.week)<=1)&&!(x.a===o.a&&x.b===o.b));
  for(const x of G.offers)if(x.week===o.week&&(x.a===o.b||x.b===o.b)){x.status="conflict";x.reason=`${G.F[o.b].name} is already booked in week ${o.week}`;}
  return {ok:true,booking};}

/* v1.84: career rating — every fighter (ours and NPCs) carries an Elo-style rating that moves with each counted bout;
   tiers turn it into a readable class. NPCs start from their strength; ours start from their stats and record. */
const TIERS=[{k:"rookie",n:"Rookie",min:0,ic:"🌱"},{k:"rising",n:"Rising Star",min:950,ic:"⭐"},{k:"skilled",n:"Skilled",min:1100,ic:"🥊"},
  {k:"top",n:"Top Contender",min:1250,ic:"🔥"},{k:"elite",n:"Elite",min:1400,ic:"💎"},{k:"legend",n:"Legend",min:1550,ic:"👑"}];
const TIER_BY=Object.fromEntries(TIERS.map((t,i)=>[t.k,{...t,i}]));
function seedRating(f){const r=f.rec||{},recB=clamp(((r.w||0)-(r.l||0))*4,-100,200);
  return Math.round(clamp(1000+(ovr(f.a)+(f.vet||0)+(f.camp==="player"?hiddenEdge(f):0)-10)*45+(f.canon&&f.camp==="rival"?120:0)+(f.lab?60:0)+(f.prodigy?80:0)+recB,700,1750));}
function ratingOf(f){if(!f)return 1000;if(f.elo==null)f.elo=seedRating(f);return f.elo;}
function tierOf(f){const r=ratingOf(f);let t=TIERS[0];for(const x of TIERS)if(r>=x.min)t=x;return TIER_BY[t.k];}
function rateBout(G,a,b,res,tierKey){const ra=ratingOf(a),rb=ratingOf(b),E=1/(1+Math.pow(10,(rb-ra)/400)),S=res==="W"?1:res==="D"?.5:0;
  const K=tierKey==="final"||tierKey==="semi"?36:tierKey==="exhibition"?16:24,d=K*(S-E),t0=[tierOf(a),tierOf(b)];
  a.elo=Math.round(ra+d);b.elo=Math.round(rb-d);
  [[a,t0[0]],[b,t0[1]]].forEach(([f,t])=>{const t1=tierOf(f);if(t1.k!==t.k&&f.camp==="player")G.tierNews=(G.tierNews||[]).concat([{id:f.id,from:t.k,to:t1.k,week:G.week}]).slice(-8);});}
/* tiers at the start of the year, so the ranking page and the year-end can say who moved */
function snapTiers(G){G.tierStart={season:G.season||1,t:{}};for(const f of Object.values(G.F))if(f.camp!=="free"&&f.camp!=="quest"&&(f.div==="A"||f.div==="B"))G.tierStart.t[f.id]=tierOf(f).k;}
function tierMoves(G){if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);const out=[];
  for(const [id,k] of Object.entries(G.tierStart.t)){const f=G.F[id];if(!f)continue;const t=tierOf(f),d=t.i-TIER_BY[k].i;if(d)out.push({f,from:TIER_BY[k],to:t,up:d>0});}
  return out.sort((x,y)=>(y.f.camp==="player")-(x.f.camp==="player")||y.to.i-x.to.i||ratingOf(y.f)-ratingOf(x.f));}
function applyResult(G,F,booking){
  const {A,B}=F;const fa=A.f,fb=B.f,r=F.result,tier=TIER[booking.tier];
  if(!tier.off&&!booking.beast){if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);rateBout(G,fa,fb,r.win==="D"?"D":r.win==="A"?"W":"L",booking.tier);}
  let ret=null;
  for(const [me,op,side] of [[fa,fb,"A"],[fb,fa,"B"]]){
    const res=r.win==="D"?"D":r.win===side?"W":"L";
    const off=tier.off;
    if(booking.ev){if(me.camp==="player")ret={pay:0,res,upset:false};continue;} /* v1.89.24: event bouts (Loy Krathong) stay inside the event — no EXP, stardust, morale, fatigue, fame or record */
    if(off&&me.camp!=="player"){me.lastFight=G.week;me.lastFightAbs=gameWeek(G);continue;}
    if(me.camp==="player"&&op.camp!=="player"&&!off){G.h2h=G.h2h||{};const h=G.h2h[op.id]=G.h2h[op.id]||{w:0,l:0,d:0};h[res==="W"?"w":res==="L"?"l":"d"]++;}
    if(me.camp==="player"&&res==="W")G.dust=(G.dust||0)+(/KO|น็อก/.test(r.type||"")?4:3); /* v1.58: stardust for wins · v1.87: +1 */
    if(!off){me.rec[res==="W"?"w":res==="L"?"l":"d"]++;me.form.unshift(res);me.form=me.form.slice(0,5);}me.lastFight=G.week;me.lastFightAbs=gameWeek(G);
    me.fatigue=clamp(me.fatigue+(booking.ev?4:off?14:22),0,100);
    const s=side==="A"?A:B;
    if(r.towel&&side==="A"){if(s.hp<20&&!off)me.injury=Math.max(me.injury,1);me.morale=clamp(me.morale-8,0,100);} /* v1.88: the towel spares her — at most a week off, but it stings */
    else if(s.hp<40&&!off&&mulberry32(F.seed+(side==="A"?1:2))()<.45)me.injury=Math.max(me.injury,2+(s.hp<15?2:0));
    if(res==="L"&&/KO|TKO/.test(r.type)&&!booking.pro&&!booking.ev)me.injury=Math.max(me.injury,booking.dm?1:3); // v1.37.1: a Death Match KO costs one week, not three
    const pmods=passiveMods(me);if(isLov(G,me.id)&&lovSolo(G))pmods.moraleLoss+=.3;if(me.camp==="player"&&me.trust>=60)pmods.moraleLoss+=.25;me.morale=clamp(me.morale+(res==="W"?10:res==="L"?-10*(1-Math.min(.9,pmods.moraleLoss)):2),0,100);
    // v1.21: beating someone stronger is worth more (ranking point, fame, EXP) — a reason to take the hard offers
    const gapR=effGap(G,me,op),upset=res==="W"&&gapR>.4;
    if(!off&&booking.tier!=="exhibition"&&booking.tier!=="special"&&booking.tier!=="lab"&&booking.tier!=="final"){const rk=G.rank[me.div][me.id];if(rk){rk.pts+=res==="W"?(gapR<-.6?2:3)+(upset?1:0):res==="D"?1:0;/* v1.47: farming weaker fighters earns fewer ranking points */rk[res==="W"?"w":res==="L"?"l":"d"]++;}}
    if(me.camp==="player"){
      const W=booking.win||tier.win,Lo=booking.lose||tier.lose;const pay=res==="W"?W:res==="D"?(W+Lo)/2:Lo;if(booking.fair){G.fairPay=G.fairPay||[];G.fairPay.push({amt:pay,op:op.name,res});}else{G.cash+=pay;G.wkFight=(G.wkFight||0)+pay;}
      G.rep=Math.max(0,G.rep+(res==="W"?tier.rep*clamp(1+gapR*.5,.35,1.6)*(ytKey(G)==="tv"?1.4:1):res==="L"?(ytKey(G)==="tv"?-.4:0):.5)/(1+Math.max(0,G.rep-25)/25));
      /* v1.83.1: promoters read the record — a winning streak brings tougher offers, a loss brings them back down (settles near 2 wins in 3) */
      if(!off)me.mmOff=clamp((me.mmOff||0)+(res==="W"?.2:res==="L"?-.45:0),-1,2);
      if(res==="W"&&!G.flags.firstWin)G.flags.firstWin=me.id;
      if(res==="L"&&!G.flags.firstLoss)G.flags.firstLoss=me.id;
      if(op.id==="fah"||op.id==="ploy"){G.flags[`vs_${op.id}`]=res;
        if(res==="W"){op.surge=(op.surge||0)+7;op.potential=Math.min(20,op.potential+.5);G.flags[`beat_${op.id}`]=(G.flags[`beat_${op.id}`]||0)+1;G.flags[`surgeWk_${op.id}`]=G.week;G.flags[`beatS_${op.id}`]=G.season||1;if(op.id==="ploy")op.aura=ployAura(G.week,G);}}
      /* v1.83.1: a win over a much weaker opponent teaches less, a close or tougher fight teaches more */const xpm=clamp(1+gapR*.3,.5,1.45);
      gainXP(G,me,Math.round((res==="W"?45*xpm:res==="D"?35*clamp(xpm,.75,1.2):30)*(1+pmods.fightXp+(res==="L"?pmods.lossXp:0))*(booking.tier==="district"?1.3:booking.tier==="semi"?1.6:booking.tier==="final"?2:1)));
      G.cal=G.cal||[];G.cal.push({wk:G.week,season:G.season||1,absWeek:gameWeek(G),a:me.id,b:op.id,bn:op.name,tier:booking.tier,res,type:r.type,cards:(F.cards||[]).map(c=>[...c]),pay});
      oppRemember(G,me,op,res,r.type);
      ret={pay,res,upset};
    }
  }
  if(booking.region)regionAfterFight(G,booking,ret);
  return ret;
}
// v1.82.3: Kru Daeng's notebook — what we saw of an opponent last time; after a meeting they may go away and add a new weapon
const TRICK_KEYS=["punch","kick","knee","elbow","clinch","counter","guard","foot"];
const attrName=k=>(ATTRS.find(x=>x[0]===k)||[k,k])[1];
const topWeapon=a=>["punch","kick","knee","elbow"].sort((x,y)=>a[y]-a[x])[0];
function oppRemember(G,me,op,res,type){if(!op||op.camp==="player"||op.camp==="quest"||op.div==="X")return;G.oppBook=G.oppBook||{};
  const bk=G.oppBook[op.id]=G.oppBook[op.id]||{n:0};bk.n++;bk.last={season:G.season||1,wk:G.week,abs:gameWeek(G),res,type:type||"",top:topWeapon(op.a),cp:counterPreset(op),ovr:+ovr(op.a).toFixed(1),vs:me.id};bk.trick=null;
  const rng=mulberry32(G.seed+gameWeek(G)*13+stableHash(op.id));if(rng()<(res==="W"?.55:.3)){const top=bk.last.top,mine=topWeapon(me.a);
    const pool=TRICK_KEYS.filter(k=>k!==top&&op.a[k]<19.5);const k=res==="W"&&rng()<.5?(mine==="kick"||mine==="punch"?"guard":"counter"):pool[Math.floor(rng()*pool.length)];
    if(k&&op.a[k]<19.5){op.a[k]=Math.min(20,op.a[k]+.9);bk.trick={k,abs:gameWeek(G)};}}}
const oppKnown=(G,id)=>G.oppBook&&G.oppBook[id]&&G.oppBook[id].last?G.oppBook[id]:null;
function simNPCWeek(G){
  const st=stageOf(G.week);if(st!=="local"&&st!=="district")return;
  const rng=mulberry32(G.seed+G.week*104729);
  for(const div of ["A","B"]){
    let pool=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.injury===0&&(f.lastFightAbs==null||gameWeek(G)-f.lastFightAbs>=3)&&!isBooked(G,f.id)&&eligible(G,f));
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
    for(const div of ["A","B"]){const lead=standings(G,div)[0];if(lead)recordHonor(G,"local",lead.id,div);}
    for(const div of ["A","B"]){G.qual[div]=storyTop4(G,div);}
    for(const div of ["A","B"]){NPC_DISTRICT[div].forEach(([n,l],i)=>{const id=`d${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i+3));startLv(G.F[id]);G.qual[div].push(id);});
      G.rank[div]={};G.qual[div].forEach((id,i)=>{G.rank[div][id]={pts:id.startsWith("d")?0:[4,3,2,1][i]||0,w:0,l:0,d:0};});}
    G.flags.qualDone=true;ensureStageNPCs(G,"district");
  }
  if(G.week===40){
    for(const div of ["A","B"]){const lead=standings(G,div)[0];if(lead)recordHonor(G,"district",lead.id,div);}
    // v1.4: top 4 of the district stage go to the provincial semi-finals (1v4, 2v3, week 44); winners meet in the final (week 49)
    G.semis=G.semis||{A:[],B:[]};
    for(const div of ["A","B"]){const t=storyTop4(G,div);G.semis[div]=t;G.finalists[div]=[];
      [[t[0],t[3]],[t[1],t[2]]].forEach(([a,b],i)=>{if(a&&b)bookBracket(G,`semi${div}${i}`,a,b,44,"semi",3);});}
    G.flags.finalDone=true;ensureStageNPCs(G,"province");
  }
}
// v1.23: the story needs its final — our lead heroine and her rival always make the cut (wildcard if needed)
// and are seeded on opposite halves, so they can only meet in the final
const LEADS={A:["kati","ploy"],B:["mali","fah"]};
// v1.53: when a Golden Tiger star joins us, their camp's new prodigy takes over as the division's top rival
const leadRival=(G,div)=>{const p=G.prodigy&&G.prodigy[div];if(p&&G.F[p]&&G.F[p].camp==="rival")return p;return LEADS[div][1];};
/* v1.89.25: the prodigies have their own art (Man) — Petchara stays Golden Tiger; Baiyok leaves and fights unattached in white */
const PROD_SPRITE={A:"petchara",B:"baiyok"};
const byFree=G=>!!(G&&G.flags&&G.flags.byFree!=null);
function fixProdigies(G){const P=G.prodigy||{};
  /* saves from before v1.89.25: count the meetings already fought, so a long rivalry doesn't restart at "first meeting" */
  if(G.flags&&!G.flags.prodN){const PP={fah:"prod_B",mali:"prod_B",ploy:"prod_A",kati:"prod_A"},N={};let last=0;
    for(const c of G.cal||[])if(PP[c.a]&&PP[c.a]===c.b){N[c.a]=(N[c.a]||0)+1;last=Math.max(last,c.absWeek||0);}
    if(Object.keys(N).length){G.flags.prodN=N;G.flags.prodLast=last;}}
  if(P.A&&G.F[P.A]){const f=G.F[P.A];f.sprite="petchara";f.full="Petcha Golden Tiger";}
  if(P.B&&G.F[P.B]){const f=G.F[P.B],fr=byFree(G);f.sprite=fr?"baiyok_white":"baiyok";f.full=fr?"Baiyok":"Baiyok Golden Tiger";f.indie=fr;}}
function makeProdigy(G,div,from){G.prodigy=G.prodigy||{};if(G.prodigy[div])return G.F[G.prodigy[div]];const id="prod_"+div,src=G.F[from];
  const names={A:["Petcha Golden Tiger","Petcha"],B:["Baiyok Golden Tiger","Baiyok"]};
  const f=baseFighter(id,{name:names[div][1],full:names[div][0],div,camp:"rival",color:"#3b3f8f",potential:Math.min(20,(src?src.potential:17)+2),a:{}});
  for(const k in src.a)f.a[k]=Math.min(20,src.a[k]+.8);f.lvl=Math.max(1,(src.lvl||5));f.xp=0;f.canon=false;f.prodigy=true;f.met=true;f.sprite=PROD_SPRITE[div];f.skills={...(src.skills||{})};
  G.F[id]=f;syncFighterAges(G);G.prodigy[div]=id;G.rank=G.rank||{A:{},B:{}};G.rank[div][id]={pts:0,w:0,l:0,d:0};if((G.season||1)>=2)rivalCatchUp(G,id);return f;}
function joinCamp(G,id,wage){const f=G.F[id];if(!f)return;G.joinLog=(G.joinLog||[]).filter(x=>x.id!==id).concat([{id,season:G.season||1,wk:G.week}]);f.camp="player";f.wage=wage;f.met=true;G.bookings=G.bookings.filter(b=>!(b.b===id&&G.F[b.a]&&G.F[b.a].camp==="player"));
  if(id==="mali"){G.flags.maliIn=G.week;G.flags.maliInAbs=gameWeek(G);}
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
  // Championship fixtures take priority over promoter bookings made earlier.
  const conflicts=G.bookings.filter(x=>x.week===week&&[a,b].some(f=>f===x.a||f===x.b));
  if(conflicts.some(x=>x.tier==="semi"||x.tier==="final"))return false;
  if(conflicts.length){G.bookings=G.bookings.filter(x=>!conflicts.includes(x));G.cancelledBookings=(G.cancelledBookings||[]).concat(conflicts.map(x=>({...x,reason:"Championship schedule conflict"})));
    if(typeof addMail==="function")addMail(G,{kind:"letter",from:"Provincial Boxing Association",title:"Championship schedule update",body:"A previously booked bout was cancelled because the fighter must compete in the championship that week. No purse was deducted"});}
  for(const x of G.offers||[])if(x.week===week&&[a,b].some(f=>f===x.a||f===x.b)){x.status="conflict";x.reason="Fighter has a championship bout this week";}
  if(![a,b].some(x=>G.F[x].camp==="player"))G.bookings.push({id,a,b,week,tier,rounds,npc:true});
  else{const p=G.F[a].camp==="player"?a:b,o=p===a?b:a;G.bookings.push({id,a:p,b:o,week,tier,rounds});}return true;}
function finishBracket(G,booking,F){
  if(booking.tier==="final")return finishFinal(G,booking,F);
  if(booking.tier!=="semi")return;
  const div=G.F[booking.a].div;let w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);
  if(booking.npc){const rv=leadRival(G,div);if((booking.a===rv||booking.b===rv)&&G.F[rv].camp==="rival"&&w!==rv){w=rv;F.result.win=rv===booking.a?"A":"B";F.result.type="Decision win";}}
  if(!G.finalists[div].includes(w))G.finalists[div].push(w);
  if(G.finalists[div].length===2){const [a,b]=G.finalists[div];bookBracket(G,`final${div}`,a,b,49,"final",5);}}
function finishFinal(G,booking,F){const div=G.F[booking.a].div;const w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);G.champ[div]=w;recordHonor(G,"province",w,div);}

// week phase 1: training & upkeep (before fights)
function weekTrain(G){
  const rng=mulberry32(G.seed+G.week*977);G.log=[];
  /* v1.89.27: rivals re-check our camp mid-year and late-year too (the off-season check is in lateSeasonOpposition) */
  if((G.week===24||G.week===40)&&(G.season||1)>=2){G.flags=G.flags||{};const k=(G.season||1)+"_"+G.week;if(G.flags.rcWk!==k){G.flags.rcWk=k;const mv=rivalCatchUp(G);
    if(mv.length)G.lvNews=(G.lvNews||[]).concat([`${mv.slice(0,3).join(" · ")} train hard to keep up with Sirichai`]).slice(-3);}}
  for(const f of roster(G)){if(typeof isAway==="function"&&isAway(G,f.id)){/* v1.89.11: she left camp for a while — no training, just rest */f.gains={};f.xpGain=0;f.fatigue=clamp(f.fatigue-10,0,100);if(f.injury>0)f.injury--;continue;}trainWeek(G,f,rng);}
  // v1.15: Ploy's raw talent makes her near-untouchable early; the edge fades by the district round
  if(G.F.ploy)G.F.ploy.aura=ployAura(G.week,G);
  for(const f of Object.values(G.F)){if(f.camp==="player")continue;
    if(f.injury>0){f.injury--;}f.fatigue=clamp(f.fatigue-8,0,100);
    // v1.23: the two stars coast until someone beats them — a loss lights a fire (surge) that carries them to the final
    const sg=f.surge>0?(f.surge--,f.id==="ploy"?.16:.13):0;
    npcGrow(f,rng,(f.canon&&f.camp==="rival"?dif(G).rival:1)*(f.id==="ploy"?(G.week>40?.07:G.week>30?.022:.012)+sg:f.id==="fah"?(G.week>40?.07:G.week>30?.03:G.week>10&&G.week<=24?.042:.026)+sg:f.camp==="rival"?.035:NPC_RATE(G.week)));f.morale+=(60-f.morale)*.1;
    // v1.15: rivals and NPCs level up too, so the opposition visibly gets stronger over the season
    if(f.camp==="rival"||f.camp==="npc"){f.xp=(f.xp||0)+(f.camp==="rival"?30:18)+Math.floor(rng()*10);
      while(f.lvl<MAX_LV&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;lvBeyond(f);if(f.camp==="rival"){const ks=Object.keys(f.a).sort((x,y)=>f.a[y]-f.a[x]).slice(0,2);ks.forEach(k=>f.a[k]=Math.min(20,f.a[k]+.2));}
        if(f.camp==="rival")G.lvNews=(G.lvNews||[]).concat([`${f.name} ${f.lab?"Vector Gym":f.indie?"Free agent":"Golden Tiger Camp"} leveled up to Lv.${f.lvl}`]).slice(-3);}}}
}
// week phase 3: npc sim, economy, transitions, advance
function rankSnapshot(G){const o={};for(const d of ["A","B"]){o[d]={};standings(G,d).forEach((r,i)=>o[d][r.id]=i+1);}return o;}
// v1.82.4 (CM5): camp certificates — awarded once when the camp reaches a milestone, shown in the trophy room
const CAMP_AWARDS={
 clean:{name:"District Clean Camp Award",from:"District Office",hint:"Keep the camp looking good (cleaning, decorating)",ok:G=>(G.camp&&G.camp.beauty||0)>=4},
 local:{name:"Outstanding Subdistrict Boxing Camp",from:"Subdistrict Administrative Organization",hint:"Reputation 25 and 2+ fighters",ok:G=>G.rep>=25&&roster(G).length>=2},
 debt:{name:"Sirichai Camp Debt-Free",from:"Kru Daeng and the whole camp",hint:"Pay off all of Grandpa Chai's debt",ok:G=>!!(G.flags&&G.flags.debtCleared)||G.debt<=0},
 pretty:{name:"Most Beautiful Camp of the Year",from:"Chiang Mai Muay Thai Fan Club",hint:"Decorate at least 3 spots in the camp",ok:G=>typeof CAMP_DECOR!=="undefined"&&Object.keys(CAMP_DECOR).filter(k=>decorChoice(G,k)!==decorDefault(k)&&decorChoice(G,k)!=="none").length>=3},
 school:{name:"Most Popular Muay Thai School",from:"Subdistrict Parents' Association",hint:"Have 30 students",ok:G=>students(G)>=30},
 family:{name:"The Sirichai Family",from:"The Sirichai camp family",hint:"Have 5 fighters in the camp",ok:G=>roster(G).length>=5},
 province:{name:"Provincial Champion Camp",from:"Chiang Mai Provincial Boxing Association",hint:"Win the provincial championship",ok:G=>(G.honors||[]).some(h=>h.kind==="province")},
 legend:{name:"Legendary Boxing Camp",from:"Chiang Mai Provincial Boxing Association",hint:"Collect 10 honors",ok:G=>(G.honors||[]).length>=10},
 five:{name:"Five Years of Sirichai",from:"The villagers of the subdistrict",hint:"Run the camp for 5 years",ok:G=>(G.season||1)>=6}};
function checkCampAwards(G){G.campAwards=Array.isArray(G.campAwards)?G.campAwards:[];const got=[];
  for(const [id,A] of Object.entries(CAMP_AWARDS)){if(G.campAwards.some(x=>x.id===id))continue;let ok=false;try{ok=A.ok(G);}catch(e){}
    if(ok){G.campAwards.push({id,season:G.season||1,week:G.week});got.push(id);}}
  if(got.length){G.newCerts=(G.newCerts||[]).concat(got);}return got;}
function weekFinish(G){if(G.rep>55)G.rep=55+(G.rep-55)*(.96+(G.fac.hall||0)*.01);if(G.sponsorWk)G.cash+=G.sponsorWk;
  if(ytKey(G)==="sponsor"&&G.yt.acc&&G.week<=40)G.cash+=2000;if(ytKey(G)==="tourist")for(const f of roster(G))f.fatigue=clamp(f.fatigue+1,0,100); /* v1.88 yearly themes */
 growStudents(G); // v1.22.1: fame above 40 needs upkeep

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
  const prog=(()=>{if(!G.snap){G.snap={week:gameWeek(G),a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return null;}
    if(gameWeek(G)-G.snap.week<4)return null;const out=roster(G).filter(f=>G.snap.a[f.id]).map(f=>({id:f.id,before:G.snap.a[f.id]}));
    G.snap={week:gameWeek(G),a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return out.length?out:null;})();
  grantDecorUnlocks(G);checkCampAwards(G);
  G.lastReport={heartUp:(()=>{const m={};for(const x of G.heartNews||[])m[x.id]=x;G.heartNews=[];return Object.values(m);})(),tierUp:(G.tierNews||[]).filter(x=>x.week===G.week),prog,week:G.week,inc,up,wg,debtPay,students:students(G),rank:after,move:G.rankMove,stage:stageOf(G.week),cash:G.cash,log:[...G.log],gains:roster(G).map(f=>({id:f.id,name:f.name,gains:{...f.gains},fatigue:f.fatigue,injury:f.injury,xp:f.xpGain||0,lvl:f.lvl,preset:f.plan.preset}))};
  stageTransition(G);
  {const pv=G.history.length?G.history[G.history.length-1].cash:60000,sp=G.sponsorWk||0;G.history.push({w:G.week,season:G.season||1,cash:Math.round(G.cash),rep:+G.rep.toFixed(1),inc,up,wg,debt:debtPay,sponsor:sp,fight:G.wkFight||0,oth:Math.round(G.cash-pv-(inc+sp-up-wg-debtPay)-(G.wkFight||0))});G.wkFight=0;}
  if((G.negWeeks>=4&&G.cash<-10000)||G.cash<-40000)G.ended="bankrupt";
  if(G.week===21||G.week===41){G.F.ploy.skills.captain=(G.F.ploy.skills.captain||0)+1;G.F.fah.skills.grin=(G.F.fah.skills.grin||0)+1;}
  if(G.week===41){G.F.ploy.skills.kr_knee=Math.max(1,G.F.ploy.skills.kr_knee||0);} // v1.19.2: Ploy brings one more weapon to the semis/final
  G.week++;G.freeUsed=false;G.campUsed=null;
  syncFighterAges(G);
  if(G.week>52&&!G.ended)G.ended="season";
  genOffers(G);
}
// Late-game opponents catch up once per season. Existing saves receive the same
// one-time adjustment on load, without touching the player's fighters.
const VECTOR_SPEC={
 pailin:{name:"Pailin",full:"Pailin",div:"A",camp:"rival",color:"#392049",potential:20,
   a:{punch:17,kick:15,knee:16,elbow:18,clinch:16,guard:16,foot:15,counter:17,power:18,speed:16,stamina:18,dur:17,iq:16,comp:17}},
 A:{name:"Night",full:"Night of Vector Gym",div:"A",camp:"rival",color:"#542478",potential:19,
   a:{punch:13,kick:12,knee:12,elbow:13,clinch:12,guard:15,foot:15,counter:16,power:12,speed:15,stamina:14,dur:13,iq:17,comp:16}},
 B:{name:"Vega",full:"Vega of Vector Gym",div:"B",camp:"rival",color:"#47216b",potential:19,
   a:{punch:14,kick:16,knee:12,elbow:14,clinch:11,guard:13,foot:16,counter:13,power:16,speed:17,stamina:15,dur:13,iq:14,comp:15}}
};
/* v1.87: story arcs count their own years. Saves that were already past the arc's year when it was added
   (or that skipped it) start the arc now, so nobody misses Pailin, Vector or the second-year stories of Fah and Ploy. */
const ARCS={y2:{min:2,win:16,ev:["y2_fah_rooftop","y2_ploy_stands","y2_fah_team","y2_fah_letter","y2_ploy_rehab","y2_ploy_team"]},
  vector:{min:4,win:30,ev:["y4_pailin_arrive","y4_pailin_sister","y4_pailin_warning"],ev2:["y5_vector_arrive","y5_vector_fighters","y5_vector_contract","y5_vector_challenge","y5_vector_resolve"]}};
function arcSync(G){G.arcs=G.arcs||{};const S=G.season||1,seen=k=>!!(G.seen&&G.seen[k]);
  for(const id in ARCS){if(G.arcs[id]!=null)continue;const A=ARCS[id];if(S<A.min)continue;let st;
    if(A.ev2&&A.ev2.some(seen))st=A.min;
    else if(A.ev.some(seen))st=A.ev2?Math.max(A.min,S-1):A.min;
    else if(S===A.min)st=A.min;
    else st=(G.week||1)<=A.win?S:S+1;
    G.arcs[id]=st;}}
const arcYear=(G,id)=>{const s=G.arcs&&G.arcs[id];return s==null?0:(G.season||1)-s+1;};
function ensureVector(G){arcSync(G);const vy=arcYear(G,"vector");if(vy<1)return false;G.rank=G.rank||{A:{},B:{}};let created=false;
  for(const id of (vy>=2?["pailin","vector_A","vector_B"]:["pailin"])){const div=id==="vector_B"?"B":"A",spec=id==="pailin"?VECTOR_SPEC.pailin:VECTOR_SPEC[div];G.rank[div]=G.rank[div]||{};
    if(!G.F[id]){G.F[id]=baseFighter(id,spec);G.F[id].lvl=id==="pailin"?8:6;G.F[id].met=true;created=true;}
    G.F[id].lab=true;G.F[id].gymName="Vector Gym, Bangkok";if(id==="pailin"){G.F[id].name=spec.name;G.F[id].full=spec.full;G.F[id].sprite="pailin";}
    if(!G.rank[div][id])G.rank[div][id]={pts:0,w:0,l:0,d:0};}syncFighterAges(G);return created;}
function liftOpponent(f,target,maxGain){const delta=Math.min(maxGain,Math.max(0,target-ovr(f.a)-(f.vet||0)));if(delta<=0)return;
  const want=ovr(f.a)+(f.vet||0)+delta,goal=Math.min(19.7,want);for(let n=0;n<4;n++){const gap=goal-ovr(f.a),room=ATTRS.filter(([k])=>f.a[k]<19.95);if(gap<=.01||!room.length)break;
    const each=gap*ATTRS.length/room.length;for(const [k] of room)f.a[k]=Math.min(20,f.a[k]+each);}
  f.potential=Math.max(f.potential||14,Math.min(20,goal));
  /* v1.83.3: whatever the stat ceiling cannot hold becomes ring craft */const short=want-ovr(f.a)-(f.vet||0);if(short>.05)f.vet=+Math.min(12,(f.vet||0)+short).toFixed(2);} /* v1.90: 12 (was 8) so the field keeps up with limit-broken fighters */
function lowerOpponent(f,target,maxDrop){let drop=Math.min(maxDrop,ovr(f.a)+(f.vet||0)-target);if(drop<=.05)return;
  const v=Math.min(f.vet||0,drop);if(v>0){f.vet=+((f.vet||0)-v).toFixed(2);drop-=v;}if(drop<=.05)return;
  for(const [k] of ATTRS)f.a[k]=Math.max(3,f.a[k]-drop);}
// v1.82.3: from year 2 the district and provincial fields get fresh names each year (seeded per save);
// last year's best provincial fighter in each division comes back as a familiar face.
const NPC_GIVEN=["Kanthida","Pinmanee","Chomphu","Ratchanee","Sudarat","Namfon","Ketsinee","Maprang","Daoruang","Anchan","Pikul","Lalita","Jiraporn","Buakhao","Thongkwao","Dokkaew","Sirin","Parichat","Khim","Praeploy","Nicha","Ornuma","Saimai","Fasai","Ueangkham","Nuanchan","Phattra","Mayuree","Lamduan","Yupin","Pathum","Rotsukhon","Kulap","Bunga","Baibua","Tonkhao"];
const NPC_CAMP=["Sit Doi Suthep","S.Mae Taeng","Luk Chiang Dao","Phet Fang","K.Lamphun","Sit Phra That","W.Wiang Ping","Ch.Chang Phueak","Luk San Sai","Phet Mae Rim","S.Hang Dong","Sit Hot","Luk Chom Thong","P.Phrao","S.Samoeng","Kiat Lampang","S.Doi Tao","Luk Mae Chaem","Phet Omkoi","Sit Saraphi"];
function stageNpcName(G,stage,div,i){const y=G.season||1;if(y<2)return null;
  if(stage==="province"&&i===0&&G.npcVet&&G.npcVet[div]&&!Object.values(G.F).some(f=>f.name===G.npcVet[div]))return G.npcVet[div];
  const names=Object.values(G.F).map(f=>f.name||""),firsts=new Set(names.map(n=>n.split(" ")[0])),rng=mulberry32(G.seed+y*131+stableHash(stage+div)+i*17);
  for(let t=0;t<40;t++){const g=NPC_GIVEN[Math.floor(rng()*NPC_GIVEN.length)];if(firsts.has(g))continue;return g+" "+NPC_CAMP[Math.floor(rng()*NPC_CAMP.length)];}return null;}
function ensureStageNPCs(G,through=stageOf(G.week)){const stages=["local",...(through==="district"||through==="final"||through==="province"?["district"]:[]),...(through==="final"||through==="province"?["province"]:[])];
  G.rank=G.rank||{A:{},B:{}};for(const stage of stages)for(const div of ["A","B"]){G.rank[div]=G.rank[div]||{};
    STAGE_NPCS[stage][div].forEach(([name,level],i)=>{const id=`${{local:"l",district:"x",province:"p"}[stage]}${div}${i}`;if(G.F[id])return;if(stage!=="local")name=stageNpcName(G,stage,div,i)||name;
      const rng=mulberry32(G.seed+stableHash(id)+((G.season||1)-1)*977),f=G.F[id]=baseFighter(id,mkNPC(id,name,div,level,rng,i+2));
      if((G.season||1)>=2){const best=Math.max(level,...roster(G).filter(x=>x.div===div).map(x=>effOvr(G,x))),gap=stage==="local"?-2:stage==="district"?-1.1:-.3;liftOpponent(f,Math.min(24.5,best+gap),20);}startLv(f);
      if(stage==="district"){G.qual=G.qual||{A:[],B:[]};G.qual[div]=G.qual[div]||[];if(!G.qual[div].includes(id))G.qual[div].push(id);}
      G.rank[div][id]={pts:0,w:0,l:0,d:0};});}syncFighterAges(G);}
/* v1.89.27: story rivals (Golden Tiger, Baiyok, Vector) track our best fighter in their division.
   gap/floor as before; how far they may climb in one check grows with how far behind they are, so a maxed-out camp still meets a real rival */
function storyRivalTarget(G,f,best,bestLab,year,d){const lab=!!f.lab,boss=f.id==="pailin";let gap,floor,max;
  if(lab){gap=d==="easy"?(boss?.5:.3):d==="hard"?(boss?1.3:1):(boss?1:.65);max=20;floor=boss?16.5+(year-4)*.3:15.5+(year-5)*.3;}
  else{gap=d==="easy"?-1.6:d==="hard"?-.2:-.8;/* v1.89.27: a step softer — a camp that built its fighters should still win most of these */floor=year>=4?11.5+(year-4)*.35:10+(year-2)*.5;
    const T=rivalT(f,Math.min(25,Math.max(floor,best+gap))),behind=T-ovr(f.a)-(f.vet||0);max=Math.max(2.4,behind*.6);}
  return {gap,floor,max};}
/* ring craft (vet) wins more fights than the same number of stat points of skills on our side — past the stat ceiling a rival only takes part of the target */
var RIVAL_VET_K=.65;const rivalT=(f,T)=>f.lab||T<=19.7?T:19.7+(T-19.7)*RIVAL_VET_K;
const divBest=(G,div,year)=>{const mine=roster(G).filter(f=>f.div===div),fl=year>=4?12+(year-4)*.6:10.5+(year-2)*.6;
  return {best:Math.max(fl,...mine.map(f=>effOvr(G,f))),bestLab:Math.max(fl,...mine.map(f=>ovr(f.a)+edgeOf(G,f)*.5))};};
/* mid-year (week 24) and late-year (week 40) re-check — rivals only climb, never drop; they get a smaller step than the off-season */
function rivalCatchUp(G,only){const year=G.season||1;if(year<2&&!only)return [];const d=G.diff||"normal",moved=[];
  for(const div of ["A","B"]){const {best,bestLab}=divBest(G,div,year);
    for(const f of Object.values(G.F)){if(f.div!==div||f.camp!=="rival"||(only&&f.id!==only))continue;
      const R=storyRivalTarget(G,f,best,bestLab,year,d),T=rivalT(f,Math.min(f.lab?21.5:25,Math.max(R.floor,(f.lab?bestLab:best)+R.gap))),b0=ovr(f.a)+(f.vet||0);
      liftOpponent(f,T,only?R.max:Math.max(1.2,R.max*.5));if(ovr(f.a)+(f.vet||0)-b0>.3)moved.push(f.name);}}
  return moved;}
function lateSeasonOpposition(G){arcSync(G);const year=G.season||1;ensureStageNPCs(G);if(year<2)return;G.flags=G.flags||{};const created=year>=4?ensureVector(G):false;
  if(G.flags.oppositionSeason===year&&!created)return;
  const d=G.diff||"normal",rng=mulberry32(((G.seed||1)*31+year*7919)>>>0),back=[];
  for(const div of ["A","B"]){const mine=roster(G).filter(f=>f.div===div);const best=Math.max(year>=4?12+(year-4)*.6:10.5+(year-2)*.6,...mine.map(f=>effOvr(G,f))),bestLab=Math.max(year>=4?12+(year-4)*.6:10.5+(year-2)*.6,...mine.map(f=>ovr(f.a)+edgeOf(G,f)*.5));/* story bosses only take half the edge — their fights were tuned by hand */
    for(const f of Object.values(G.F)){if(f.div!==div||f.camp==="player"||f.camp==="free"||f.camp==="quest")continue;
      const lab=!!f.lab,rival=f.camp==="rival",boss=f.id==="pailin";let gap,max,floor,comeback=false;
      if(lab||rival){const R=storyRivalTarget(G,f,best,bestLab,year,d);gap=R.gap;max=R.max;floor=R.floor;}
      else{ // v1.83.1: the field is uneven — most sit a step below our best, a few catch up or overtake us
        const base=d==="easy"?-2.2:d==="hard"?-.5:-1.2,spread=(rng()-.5)*2.4;comeback=rng()<(year>=3?.18:.12);
        gap=comeback?(d==="easy"?0:d==="hard"?1.2:.7):base+spread;max=comeback?3.5:2.2;floor=year>=4?9.5+(year-4)*.4:8.5+(year-1)*.6;
        if(comeback&&ovr(f.a)<best+gap-1&&back.length<3&&f.name)back.push(f.name);}
      const T0=Math.min(lab?21.5:rival?25:24.5,Math.max(floor,(lab?bestLab:best)+gap)),T=rival?rivalT(f,T0):T0;liftOpponent(f,T,max);
      /* v1.83.3: last year's comebacks and old veterans settle back into the pack instead of piling up above us */
      if(!lab&&!rival&&!comeback)lowerOpponent(f,T+.3,1.5);
      if(lab)f.labPrep=Math.min(boss?.09:.07,(boss?.05:.035)+Math.max(0,year-4)*.005);}}
  if(back.length)G.lvNews=(G.lvNews||[]).concat(back.map(n=>`${n} trained hard in the off-season and is back stronger than ever`)).slice(-3);
  G.flags.oppositionSeason=year;}
// v1.3: keep playing after the season — new season, same camp, fighters and bonds
/* v1.88 yearly themes — from year 2 every season draws one mild theme (seeded per save, never the same twice in a row).
   They nudge money, fatigue or training for a while; they never change how fights work. */
const YEAR_THEMES={
 flood:{ic:"🌊",name:"Flood year",desc:"Weeks 14–16 the rains flood the camp: training is 80% effective and only half the students can come.",from:14,to:16},
 sponsor:{ic:"💼",name:"Sponsor year",desc:"If you take the deal: ฿2,000 every week until week 40, plus a ฿20,000 bonus if the camp wins 8 fights by week 40."},
 pm25:{ic:"😷",name:"PM2.5 haze year",desc:"Weeks 37–46 haze covers Chiang Mai and training is less effective (conditioning most of all). A filtered indoor gym lets you train fully.",from:37,to:46},
 tourist:{ic:"🧳",name:"Tourist boom year",desc:"Class fees +20% all year, but the camp is busy and fighters get a little more tired each week."},
 tv:{ic:"📺",name:"TV year",desc:"A TV crew follows the camp all year: wins earn more fame, losses cost a little."}};
const ytKey=G=>G&&G.yt&&G.yt.season===(G.season||1)?G.yt.k:null;
const ytIn=(G,k)=>{if(ytKey(G)!==k)return false;const T=YEAR_THEMES[k];return T.from==null||(G.week>=T.from&&G.week<=T.to);};
function pickYearTheme(G){const S=G.season||1;if(S<2)return null;const last=G.yt&&G.yt.k;const keys=Object.keys(YEAR_THEMES).filter(k=>k!==last);
  const r=mulberry32((G.seed||1)*131+S*7919)();G.yt={season:S,k:keys[Math.floor(r*keys.length)]};return G.yt.k;}
function ytTrainMul(G,f){if(ytIn(G,"flood"))return .8;if(ytIn(G,"pm25")&&!((G.fac&&G.fac.airgym)>0))return f.plan.preset==="cond"?.6:.75;return 1;}
const ytSponsorWins=G=>(G.cal||[]).filter(c=>c.season===(G.season||1)&&c.res==="W"&&c.wk<=40).length;
function newSeason(G){
  G.titles=G.titles||[];G.titles.push({season:G.season||1,champ:{...G.champ}});
  G.season=(G.season||1)+1;G.week=1;G.ended=null;G.qual={A:[],B:[]};G.finalists={A:[],B:[]};G.semis={A:[],B:[]};G.champ={};G.bookings=[];G.log=[];
  G.flags.qualDone=false;G.flags.finalDone=false;G.snub={};G.offers=[];G.dmSeen={};G.dmSeenSeason=G.season;G.dm=null;G.coachAway=null;G.coachAwayAbs=null;G.freeUsed=false;G.campUsed=null;G.rankMove={A:{},B:{}};
  G.npcVet={};for(const div of ["A","B"]){const best=Object.entries((G.rank||{})[div]||{}).filter(([id])=>/^p[AB]\d/.test(id)&&G.F[id]).sort((x,y)=>(y[1].pts||0)-(x[1].pts||0))[0];if(best)G.npcVet[div]=G.F[best[0]].name;}
  for(const id of Object.keys(G.F))if(/^[dxp][AB]\d/.test(id)){delete G.F[id];if(G.oppBook)delete G.oppBook[id];if(G.h2h)delete G.h2h[id];if(G.fam)delete G.fam[id];if(G.snub)delete G.snub[id];}
  const rng=mulberry32(G.seed+G.season*977);
  G.rank={A:{},B:{}};
  for(const f of Object.values(G.F)){f.form=[];f.injury=0;f.fatigue=Math.min(f.fatigue,20);
    // v1.50: the whole field trains through the off-season too, so year 2 is not a walkover
    if(f.camp!=="player"){f.potential=Math.min(20,(f.potential||14)+1.5);for(const k in f.a)f.a[k]=Math.min(20,f.a[k]+(f.canon?.4:.6+rng()*.5));}
    if(f.camp!=="free"&&f.camp!=="quest"&&G.rank[f.div])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};} /* v1.81.1: a beast/gang bout booked over new year (div X) used to crash here and block year 6 */
  lateSeasonOpposition(G);syncFighterAges(G);
  /* v1.84: over the off-season every rating drifts part-way toward the fighter's real strength (ours count skills too), so tiers follow growth */
  for(const f of Object.values(G.F))if(f.elo!=null&&f.camp!=="free"&&f.camp!=="quest")f.elo=Math.round(f.elo*.6+seedRating(f)*.4);
  pickYearTheme(G);G.tierNews=[];snapTiers(G);genOffers(G);return G;}
// v1.7 late-game money sinks
const MASTERS={thasao:{name:"Tha Sao master",cost:18000,attrs:["speed","foot"]},chaiya:{name:"Chaiya master",cost:18000,attrs:["guard","counter"]},
  lopburi:{name:"Lopburi master",cost:18000,attrs:["iq","counter"]},korat:{name:"Korat master",cost:18000,attrs:["punch","power"]}};
function hireMaster(G,fid,school){const f=G.F[fid],M=MASTERS[school];if(!f||!M||G.cash<M.cost||G.week<16||f.masterSeason===(G.season||1))return false;
  G.cash-=M.cost;f.masterSeason=G.season||1;f.sp=(f.sp||0)+1;M.attrs.forEach(k=>f.a[k]=Math.max(f.a[k],Math.min(stCap(f),f.a[k]+(f.a[k]>=20?.6*LB_RATE:.6))));f.morale=Math.min(100,f.morale+6);return true;}
const SHOW_COST=25000;
function hostShow(G){const st=stageOf(G.week);if(G.cash<SHOW_COST||G.week<10||G.flags["show_"+st])return false;G.cash-=SHOW_COST;G.flags["show_"+st]=true;
  G.rep+=3;G.camp.beauty=Math.min(10,G.camp.beauty+1);roster(G).forEach(f=>f.morale=Math.min(100,f.morale+8));return true;}
// v1.33: quick loan when cash runs dry; the helmet gang lends, and keeps coming round while it is unpaid
const LOAN_AMT=20000,LOAN_RATE=.1;
const LOAN_LOW=8000; // v1.88: offer opens a bit earlier, before the camp is already scraping zero
const loanOk=G=>!(G.loan>0)&&G.cash<LOAN_LOW&&!G.ended;
function takeLoan(G){if(!loanOk(G))return false;G.loan=LOAN_AMT;G.cash+=LOAN_AMT;G.loanN=(G.loanN||0)+1;G.gang=G.gang||{st:0,next:0};G.gang.nextAbs=Math.min(G.gang.nextAbs||Infinity,gameWeek(G)+2);return true;}
function repayLoan(G){if(!(G.loan>0)||G.cash<G.loan)return false;G.cash-=G.loan;G.loan=0;return true;}
function clearDebt(G){if(G.debt<=0||G.cash<G.debt)return false;G.cash-=G.debt;G.debt=0;G.flags.debtCleared=true;G.rep+=2;return true;}
if(typeof module!=="undefined")module.exports={takeLoan,repayLoan,loanOk,LOAN_AMT,LOAN_LOW,cornerOdds,cloneFight,trainWeek,passiveMods,skillReqs,skillBlock,hasTree,DIFF,studentCap,studentDemand,studentFee,growStudents,storyTop4,RIVAL_OF,LEADS,upkeep,campActLocked,equipped,toggleEquip,MAX_EQUIP,roundBegin,fightEx,roundDone,roundFinish,useSkill,fightSkills,SKILL_KIND_NAME,fixSave,STAFF,hireStaff,fireStaff,staffSlots,staffLocked,facLocked,mainStyle,mastery,styleVal,STYLE_NAME,STYLE_ATTRS,MASTERY_AT,aiCorner,FACILITIES,SIGNATURE,hasSignature,counterPreset,oppTop,careNeeds,applyCare,throwTowel,CARE,MASTERS,hireMaster,hostShow,clearDebt,SHOW_COST,TAC,setTactics,finishBracket,mulberry32,newGame,weekTrain,weekFinish,genOffers,acceptOffer,buyFacility,upgradeDaeng,students,campLevel,newFight,fightRound,quickFight,applyResult,standings,roster,ovr,styleOf,stageOf,finishFinal,condition,ATTRS,isBooked,PRESETS,CANON,advise,doCampAction,learnSkill,SKILLS,SCHOOLS,campLook,newSeason};

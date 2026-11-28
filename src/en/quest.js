// ================= MUAY THAI MOE v1.23 — MAILBOX, SIDE QUESTS, ODD FIGHTS, CALENDAR, GRAPHS, NEWS BAR =================
// ---------- odd opponents (sprite sheets in a/<sprite>_sheet.webp, same 6-row layout as the girls) ----------
const QK={
  gang1:{fst:"pressure",name:"Red-Helmet Grunt",sprite:"gang1",lvl:-1.6,tilt:{punch:1.5,power:1,iq:-2,guard:-1.5,comp:-1},color:"#c8283c",grp:"gang"},
  gang2:{fst:"pressure",name:"Black Jacket, Red Helmet",sprite:"gang2",lvl:-.8,tilt:{punch:1.5,kick:1,iq:-1.5,comp:-1},color:"#a01f2f",grp:"gang"},
  gang3:{fst:"inside",name:"Black-Red Helmet Lieutenant",sprite:"gang3",lvl:.1,tilt:{punch:1.5,knee:1,power:1,iq:-1},color:"#5a1420",grp:"gang"},
  gang4:{fst:"power",name:"Silver Helmet Chief",sprite:"gangsilver",lvl:.8,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#c9ced8",grp:"gang"}, /* v1.89.24: the silver chief gets his own silver sprite */
  gang6:{fst:"power",name:"Gold-Black Helmet Right Hand",sprite:"gang4",lvl:1.2,tilt:{power:2,kick:1.5,guard:1,dur:1,foot:-1},color:"#d9a520",grp:"gang"}, /* v1.89.24: the boss's gold-and-black right hand (the old gang4 sheet) */
  gang5:{fst:"inside",name:"Big Boss Golden Helmet",sprite:"gang5",lvl:1.6,tilt:{power:2,punch:2,dur:1.5,comp:1,foot:-1},color:"#f7d24a",grp:"gang"},
  rooster1:{fst:"pressure",name:"Hot-Headed Bantam",sprite:"rooster1",lvl:-.9,tilt:{speed:2.5,kick:2,dur:-2,power:-1},color:"#e8a23a",grp:"rooster"},
  rooster2:{fst:"footwork",name:"Singburi Gray Rooster",sprite:"rooster2",lvl:-.2,tilt:{speed:2,kick:2,foot:1,dur:-1.5},color:"#8a8f9a",grp:"rooster"},
  rooster3:{fst:"counter",name:"Temple-Boxing White Rooster",sprite:"rooster3",lvl:.4,tilt:{speed:2,kick:2.5,counter:1,dur:-1.5},color:"#f4f1ea",grp:"rooster"},
  rooster4:{fst:"footwork",name:"Black Red-Tail",sprite:"rooster4",lvl:.9,tilt:{speed:2,kick:2,power:1,guard:1,dur:-1},color:"#c8283c",grp:"rooster"},
  rooster5:{fst:"counter",name:"Golden Rooster Godfather",sprite:"rooster5",lvl:1.5,tilt:{speed:2,kick:2.5,power:1.5,comp:1,dur:-.5},color:"#f7d24a",grp:"rooster"},
  bull1:{fst:"inside",name:"Fresh Milk, the Runaway Cow",sprite:"bull1",lvl:-.6,tilt:{power:2,dur:2.5,clinch:1,speed:-2,iq:-1},color:"#f4f1ea",grp:"bull"},
  bull2:{fst:"pressure",name:"Red Curved-Horn",sprite:"bull2",lvl:.7,tilt:{power:2.5,dur:2,knee:1.5,speed:-1.5},color:"#a0522d",grp:"bull"},
  bull3:{fst:"inside",name:"Mafia Buffalo",sprite:"bull3",lvl:1.4,tilt:{power:3,dur:2.5,clinch:2,speed:-1.5,foot:-1},color:"#2b2530",grp:"bull"},
};
const BELT_WEEKS=[10,18,26,34,42];
const STADIUMS={
 tha:{name:"Tha Phae Stadium",scene:"district",bg:"bg_district.webp",weeks:[10,18,26,34,42],minYear:1,win:15000,defend:10000},
 ping:{name:"Ping Riverside Stadium",scene:"loy_ring",bg:"bg_loy_ring.webp",weeks:[15,30,45],minYear:2,win:18000,defend:12000},
 lanna:{name:"Lanna Stadium",scene:"hall",bg:"bg_hall.webp",weeks:[22,38,48],minYear:3,win:22000,defend:14000}
};
function beltStore(G,venue="tha"){if(venue==="tha")return G.belt=G.belt||{};G.venueBelts=G.venueBelts||{};return G.venueBelts[venue]=G.venueBelts[venue]||{};}

function beltHolder(G,div,venue="tha"){const B=beltStore(G,venue);if(!B[div]||!G.F[B[div].id]){const c=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&!f.canon&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));const chosen=c[Math.min(venue==="tha"?0:venue==="ping"?1:2,c.length-1)];if(!chosen)return null;B[div]={id:chosen.id,def:2,since:G.week};}return G.F[B[div].id];}
function beltChallenger(G,div,not){let ids=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.camp!=="quest"&&f.id!==not&&!f.injury&&!isBooked(G,f.id,G.week)).sort((a,b)=>ovr(b.a)-ovr(a.a)).slice(0,8).map(f=>f.id);let round=0;
  while(ids.length>1){const next=[];for(let i=0;i<ids.length;i+=2){if(!ids[i+1]){next.push(ids[i]);continue;}const F=quickFight(G.F[ids[i]],G.F[ids[i+1]],G.seed+gameWeek(G)*313+round*17+i,5);next.push(dmWinFrom(F)==="A"?ids[i]:ids[i+1]);}ids=next;round++;}return G.F[ids[0]]||null;}
// A title is earned through the division bracket; defenses remain one bout.
function beltTournament(G,m,fid){if(G.dm&&!G.dm.done)return null;const me=G.F[fid],venue=m.venue||"tha",holder=beltHolder(G,m.div,venue);
  if(!me||me.div!==m.div||!holder||holder.camp==="player"||!dmCanEnter(me)||isBooked(G,holder.id,G.week))return null;
  const pool=Object.values(G.F).filter(f=>f.id!==fid&&f.div===m.div&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&!isBooked(G,f.id,G.week));
  const ids=[holder.id,...pool.filter(f=>f.id!==holder.id).sort((a,b)=>ovr(b.a)-ovr(a.a)).slice(0,6).map(f=>f.id)];
  const slots=Array(8).fill(null);slots[0]=fid;slots[7]=holder.id;[1,2,3,4,5,6].forEach((slot,i)=>slots[slot]=ids[i+1]||null);
  return {wk:G.week,absWeek:gameWeek(G),slots,w:[[],[],[]],r:0,mine:[fid],out:{},done:false,belt:{venue,div:m.div,pay:m.pay||STADIUMS[venue].win,holder:holder.id}};}
function beltTournamentFinish(D){const S=D.belt,champ=D.champ,won=dmMine(champ);beltStore(G,S.venue)[S.div]={id:champ,def:0,since:G.week};D.best=won?4:(D.out[D.mine[0]]||1);D.prize=won?S.pay:0;
  if(won){G.cash+=D.prize;G.wkFight=(G.wkFight||0)+D.prize;G.rep+=3;G.F[champ].belts=(G.F[champ].belts||0)+1;const rival=D.w[1].find(id=>id!==champ);recordHonor(G,"belt",champ,S.div,D.wk,S.venue==="tha"?null:S.venue,G.F[rival]?.name,rival);}save();}
function beltBracketHTML(D){const title=STADIUMS[D.belt.venue].name+" · "+D.belt.div,nm=id=>esc(G.F[id]?.name||"—"),nx=dmNextMatch();
  const columns=[D.slots,D.w[0],D.w[1],D.w[2]].map((L,r)=>`<div class="dmcol"><h4>${["8","4","2","🏆"][r]}</h4>${L.map(id=>`<div class="dmc ${dmMine(id)?"mine":""}">${nm(id)}</div>`).join("")}</div>`).join("");
  const action=D.done?`<p class="center goldt">🏆 ${nm(D.champ)} · ${fmt(D.prize||0)}</p><button class="btn primary" data-act="dmclose">Back to camp</button>`:nx?`<button class="btn primary" data-act="dmgo" data-id="${dmMine(nx[0])?nx[0]:nx[1]}" data-v="${dmMine(nx[0])?nx[1]:nx[0]}">${nm(nx[0])} vs ${nm(nx[1])} ▸</button>`:"";
  return `<h2>Belt Tournament ${title}</h2><p class="meta">Same division · single elimination · five rounds a bout</p><div class="dmb">${columns}</div>${action}`;}
const QGRP_BG={gang:"bg_market.webp",rooster:"bg_rooster.webp",bull:"bg_farm.webp"};
/* v1.91.83 (Man): the quest foes kept pace with her stats only, so a late-game girl with a full skill tree outgrew even the bosses.
   They now read a fifth of her hidden edge (the season bonus halved to make room) (skills, perks, level) like the Loy thief, carry whatever the stat ceiling cannot hold as ring craft,
   and fight with their own signature skills (cut-in + burst, like the Naka League) — minions one, lieutenants two, bosses three */
const Q_EDGE=.35,Q_VET_MAX=12; /* v1.91.112 (Man): a little easier than .5; past 2 points the edge counts half — the mirror test rates Mali's kit higher than it plays against these lopsided foes, so a straight read doubled her penalty */
const qEdge=e=>e<=2?e:2+(e-2)*.5;
const QSK={
  gang:[{id:"q_g_debt",name:"Debt-Collector Punch",k:"atk",w:"punch"},{id:"q_g_guard",name:"Big Bro's Guard",k:"def"},{id:"q_g_knee",name:"Protection-Money Knee",k:"atk",w:"knee"}],
  rooster:[{id:"q_r_spur",name:"Fighting-Cock Spur Kick",k:"atk",w:"kick"},{id:"q_r_flap",name:"Wing-Flap Dodge",k:"def"},{id:"q_r_peck",name:"Pecking Elbow",k:"atk",w:"elbow"}],
  bull:[{id:"q_b_horn",name:"Raging Horn Gore",k:"atk",w:"knee"},{id:"q_b_hide",name:"Buffalo Hide",k:"def"},{id:"q_b_cud",name:"Cud-Chew Recharge",k:"rec"}]};
const qSkN=K=>K.lvl<-.3?1:K.lvl<1?2:3;
function qTarget(G,fid){const f=fid&&G.F[fid];if(f)return ovr(f.a)+(f.camp==="player"&&typeof hiddenEdge==="function"?Q_EDGE*qEdge(hiddenEdge(f)):0);const R=roster(G);return R.length?R.reduce((s,x)=>s+ovr(x.a),0)/R.length:9;}
function makeQ(G,kind,fid,tag){const K=QK[kind],t=qTarget(G,fid)+K.lvl+Math.min(.75,((G.season||1)-1)*.125),rng=mulberry32((G.seed^(G.week*977))+kind.length*31);const a={};
  for(const [k] of ATTRS)a[k]=clamp(t+(K.tilt[k]||0)+(rng()*1.6-.8),3,19.5);
  const d=t-ovr(a);for(const [k] of ATTRS)a[k]=clamp(a[k]+d,3,19.5);
  const id=`q_${kind}_${tag||G.week}`;const f=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  {const short=t-ovr(a);if(short>.05)f.vet=+Math.min(Q_VET_MAX,short).toFixed(2);} /* past the stat ceiling: ring craft */
  if(QSK[K.grp])f.nlsk=QSK[K.grp].slice(0,qSkN(K));
  if(K.fst)f.fstyle=K.fst; /* v1.91.112 (Man): every quest foe fights in its own style — thugs, bulls and the gold boss rush or clinch (Mali's footwork beats them), the silver chief and his right hand hit heavy and the temple roosters wait to counter (Kati's inside game beats them) */
  f.sprite=K.sprite;f.kind=kind;f.grp=K.grp;f.lvl=clamp(Math.round(t-6),1,10);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;}
function qCleanup(G){const keep=new Set([...G.bookings.map(b=>b.b),...G.offers.map(o=>o.b),...(G.mail||[]).filter(m=>!m.done&&m.qid).map(m=>m.qid)]);
  for(const id of Object.keys(G.F))if(id.startsWith("q_")&&!keep.has(id)&&(G.F[id].lastFightAbs==null||gameWeek(G)-G.F[id].lastFightAbs>2))delete G.F[id];}

// ---------- mail ----------
let MAILN=0;
function addMail(G,m){G.mail=G.mail||[];m.id="m"+G.week+"_"+(++MAILN)+"_"+Math.floor(Math.random()*1e4);m.wk=G.week;m.season=G.season||1;if(m.exp!=null)m.expAbs=gameWeek(G)+(m.exp-G.week);m.read=false;G.mail.unshift(m);for(let i=G.mail.length-1;G.mail.length>40&&i>=0;i--)if(!mailKeep(G.mail[i]))G.mail.splice(i,1);if(G.mail.length>60)G.mail=G.mail.slice(0,60);return m;}
/* v1.91.165 (Man): a daily/weekly event letter whose fight can no longer be taken (played today, or the event window has closed) settles as done — no blinking frame, no red dot, no badge */
function evSettle(m){if(m&&!m.done&&m.kind==="event"&&((m.ev==="tuy"&&typeof tuyReady==="function"&&!tuyReady(G))||(m.ev==="thief"&&typeof thiefReady==="function"&&!thiefReady(G))))m.done=true;return m;}
const mailOpen=m=>(evSettle(m),!m.done)&&!m.expired&&(["take","pay","quiz","quest"].includes(m.kind)||(m.kind==="event"&&(m.ev==="kongka"||m.ev==="thief"||m.ev==="tuy"||m.ev==="dress"||m.ev==="qshow")));
/* v1.91.32: the player may delete letters — never an event invitation, and only once a letter no longer waits on an answer */
function mailKeep(m){if(!m)return "";evSettle(m);if(m.kind==="event"&&m.ev==="loy")return "event";if(m.bk&&!m.done)return "event";if(m.lg)return "event";if(m.done||m.expired)return "";if(mailOpen(m))return "act";
  if(m.kind==="lotto"){try{const [s,i]=String(m.draw).split("_").map(Number),d=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);return d&&d.res&&!d.done?"act":"";}catch(e){return "";}}
  if(m.kind==="loan")return typeof loanOk==="function"&&loanOk(G)?"act":"";if(m.kind==="job"||m.kind==="event")return "act";return "";}
const mailDelN=()=>(G.mail||[]).filter(m=>m.read&&!mailKeep(m)).length;
function mailDel(ids){const S=new Set(ids);const n0=(G.mail||[]).length;G.mail=(G.mail||[]).filter(m=>!S.has(m.id)||mailKeep(m));return n0-G.mail.length;}
function mailBadge(){if(!G||!G.mail)return 0;return G.mail.filter(m=>!m.read||mailOpen(m)).length;}
const MAILBOX_PX=pxIcon(["....kkkk....","...kffffk...","..krrrrrrk..",".krrrrrrrrk.",".krwwwwwwrk.",".krwkkkkwrk.",".krwwwwwwrk.",".krrrrrrrrk.",".kkkkkkkkkk.",".....kk.....",".....kk.....","....kkkk...."],{k:"#2a1a10",r:"#c8283c",w:"#f4ead8",f:"#f7d24a"});
const BILLS=[["Subdistrict Municipality",G=>`Fine: ${petIntro(G,"rooster")} crowing above the legal limit at 4 a.m. (14 complaints)`,300,G=>hasPet(G,"rooster")],
 ["Uncle Wang, motorbike taxi","Windshield repair: a kick knocked something off the bag and over the fence",800],
 ["Jae Tim's Chicken Rice","Invoice: your fighters ate 46 plates on credit (countersigned by Coach Daeng)",1840],
 ["Tube Ice Cooperative","This month's ice: your ice baths use more than every fish factory in the district",900],
 ["Auntie Taew, som tam","Broken mortar: someone from your camp 'demonstrated a spinning elbow' on Auntie's mortar",450],
 ["Signage Office","Sign tax: your camp sign is bigger than the temple's, extra fee",600,G=>G.fac.brand>=1],
 ["Provincial Electricity Authority","Special electricity charge: your camp floodlights are so bright birds are flying the wrong way",1200,G=>(G.fac.lights||0)>=1],
 ["Temple Route Songthaew Association","Songthaew parking fee at the temple (your students were cheering inside the vehicle)",350,G=>(G.fac.van||0)>=1],
 ["Subdistrict Animal Clinic",G=>`Vet bill for ${petIntro(G,"cat").trim()}: ate too many khanom khrok`,500,G=>hasPet(G,"cat")],
 /* v1.91.208 (Man: more pet trouble, it's funny) — each only arrives if the camp has that pet */
 ["Mae Klong Mackerel, Morning Market",G=>`1 basket of mackerel: ${petIntro(G,"cat")} sat by the stall making big eyes, so customers bought it fish… on your camp's tab`,380,G=>hasPet(G,"cat")],
 ["Pia's Motorbike Repair",G=>`3 side mirrors: ${petIntro(G,"rooster")} saw itself in the mirrors and fought them until they broke`,540,G=>hasPet(G,"rooster")],
 ["Moo Ping Stall by the School",G=>`23 grilled pork skewers: ${petIntro(G,"dog")} made off with the whole tray while auntie was making change`,460,G=>hasPet(G,"dog")],
 ["Subdistrict Post Office",G=>`Postman's trousers: ${petIntro(G,"dog")} chased him from the end of the lane to the camp gate (one trouser leg lost)`,350,G=>hasPet(G,"dog")],
 ["Subdistrict Temple",G=>`Temple lotus pond: ${petIntro(G,"turtle")} snuck into the pond and ate every lotus grown for the monks`,400,G=>hasPet(G,"turtle")],
 ["Subdistrict Traffic Office",G=>`Traffic warden fee: ${petIntro(G,"turtle")} crossed the road outside the camp. It took 40 minutes. Traffic backed up to the temple`,300,G=>hasPet(G,"turtle")],
 ["Uncle Hem's Fish Pond",G=>`9 tilapia: ${petIntro(G,"otter")} went into the pond at 3 a.m. and came out with a round belly`,650,G=>hasPet(G,"otter")],
 ["Auntie Jum's Laundry",G=>`Re-wash of the whole pile: ${petIntro(G,"otter")} climbed out of the canal and rolled all over the freshly ironed whites`,300,G=>hasPet(G,"otter")]];
const QUIZ=[["Before a fight, what ritual do Muay Thai fighters perform in the ring?",["Wai khru ram muay","Sing the national anthem","Show-off push-ups"],0],
 ["Muay Thai is known as the art of how many limbs?",["Six limbs","Eight limbs","Ten limbs"],1],
 ["What is the headpiece fighters wear during the wai khru called?",["Mongkhon headband","Prajiad armband","A headband"],0],
 ["What is the cloth tied around a fighter's upper arm called?",["Mongkhon headband","Prajiad armband","Sai sin (sacred thread)"],1],
 ["Per the Muay Thai verse 'Heavy fists of Korat, clever Lopburi, fine form of Chaiya…', which city's style is known for cleverness?",["Korat","Lopburi","Chaiya"],1],
 ["Which legendary fighter, captured and taken to Burma, defeated many Burmese boxers?",["Nai Khanom Tom","Nai Khanom Khrok","Nai Khanom Chan"],0],
 ["What instruments are central to the music played during Muay Thai fights?",["Pi chawa, khaek drums, ching","Guitar, drum kit","Ranat, khim"],0],
 ["Under standard professional rules, how many rounds is a Muay Thai fight?",["3 rounds","5 rounds","12 rounds"],1],
 ["What is the person in the ring who enforces the rules called?",["The referee","The cornerman","The promoter"],0],
 ["On what date is National Muay Thai Day?",["February 6","March 17","April 1"],1],
 ["Which body part does the 'sok' strike use?",["Elbow","Knee","Heel"],0],
 ["What is the liniment rubbed on fighters before a bout called?",["Muay oil (namman muay)","Coconut oil","Vegetable oil"],0],
 ["What kind of strike is 'Crocodile Sweeps Its Tail'?",["Spinning back kick","Flying knee","Straight punch"],0],
 ["In Muay Thai, grabbing the opponent's neck and kneeing is part of what?",["Plam (clinch)","Throw","Arm lock"],0],
 ["In professional Muay Thai, what do fighters wear on their hands?",["Boxing gloves","Socks","Oven mitts"],0],
 ["What does Coach Daeng say matters most before fight day?",["Getting enough sleep","Eating moo kratha","Watching the evening soap opera"],0],
 ["What does Sirichai Camp's orange cat love eating most? (listener question)",["Khanom khrok","Mackerel","Chicken rice"],0],
 ["Which king is famed for disguising himself to box with commoners?",["King Suea (the Tiger King)","King Chang Phueak","King Prasat Thong"],0]];

const WIN_BONUS=[
 ["Jae Tim's Chicken Rice","Win bonus!","Last night customers cheered for your camp so hard they forgot to pay, but today was a record day. Here's a share for the camp (the 46-plate tab still stands)"],
 ["The District Gas Station","Winner of the week award","The station awards a bonus to yesterday's winning camp, plus one car-wash coupon (Tuesdays only)"],
 ["Our Women's Muay Thai Fan Club","A whip-round for the winners","Everyone in the LINE group chipped in a little. So happy to see a small camp win. Don't forget to go live sometimes"],
 ["Auntie Taew's Som Tam","A share of sales","Customers flocked in for 'fighter-level spicy som tam' after yesterday's fight. Here's a share of the profit. Still haven't bought a new mortar, by the way"],
 ["Market moto-taxi stand","The moto-taxi guys chip in","We backed your camp and won. Here's a cut for the camp. Call it fuel for the heart"],
 ["Tube Ice Cooperative","Ice bill refund","Congratulations on the win. The co-op is refunding part of this month's ice bill, since your camp got the whole district taking ice baths"]];
const GIG_WEEKS=[10,15,20,25,30,35];
const GIGS=[
 ["New convenience store","Ribbon-cutting appearance fee","Thank you, Sirichai fighters, for the bag-kicking show outside our store. The crowd jammed the whole soi. Here's the agreed fee"],
 ["Ban Nong Faek School","Self-defense demo fee","The kids loved it. Now the whole school does wai khru all day. The principal sends the camp this fee"],
 ["Provincial Red Cross Fair","Stage show fee","Your camp's ram muay show drew a bigger crowd than the beauty pageant. The organizers are very grateful"],
 ["YouTube channel 'Eat & Fight'","Viral clip ad revenue","The clip of your fighters eating moo kratha after training hit a million views. Here's your ad-revenue share (the restaurant really did run out of pork)"],
 ["Riverside Ping Hotel","Tourist Muay Thai class fee","The foreign guests loved it. They want to book another class, and a photo with the orange cat"],
 ["Provincial Football Club","Fitness training fee","The whole squad's legs shook for three days after training with your camp. The coach says it was worth every baht"]];
// story & flavour letters (once each)
const STORY_MAIL=[
 {id:"ml_landlord",when:G=>G.week>=3,from:"Jae Muay (landlady)",title:"About the camp's debt",body:"To the new manager: Grandpa Chai's debt is still outstanding, dear. The system deducts it every 4 weeks automatically, don't panic. P.S. Next time you come to pay at my house, please bring a pack of green-tea KitKats. Not mandatory (mandatory)"},
 {id:"ml_kidfan",when:G=>G.flags&&G.flags.firstWin,from:"Nam Wan, Grade 3",title:"To the fighter",body:"Dear fighter, I watched you fight at the temple fair, you're so good. I drew you a picture too (attached: a round fighter with horns… probably a mongkhon). When I grow up I'll be a fighter like you, or else sell meatballs"},
 {id:"ml_district",when:G=>G.week>=21&&G.flags.qualDone,from:"District Muay Thai Association",title:"Welcome to the district round",body:"Congratulations on passing the subdistrict round. Points reset for the district round; the top 4 go to the provincial semis in week 44. Please dress respectfully. No fighting roosters in the stadium (we remember)"},
 {id:"ml_ploy",when:G=>G.flags&&G.flags.beat_ploy>=1,from:"Ploy, Golden Tiger Camp",title:"(very neat handwriting)",body:"Congratulations. This one belongs to Kati, I admit it. But thank you too… no one has made me afraid to lose in a long time. From tonight I'll train like someone who has never won. See you in the final — Ploy"},
 {id:"ml_fah",when:G=>G.flags&&G.flags.beat_fah>=1,from:"Fah, Golden Tiger Camp",title:"READ THIS!!",body:"Pure luck!! (crossed out) …Fine, you're good. But Fah will run up the mountain every morning until she wins it back. Tell Mali not to celebrate yet!! P.S. The snacks you sent were tasty (not a compliment)"},
 {id:"ml_semis",when:G=>G.week>=41&&G.flags.finalDone,from:"Provincial Muay Thai Association",title:"Invitation to the provincial semifinals",body:"You are invited to the provincial semifinals in week 44. Winners fight for the belt in week 49. Streamed live on the association page (312 views last year, aiming for 400 this year)"},
 {id:"ml_grandpa_fan",when:G=>G.rep>=20,from:"Uncle Chan, Grandpa Chai's old friend",title:"News of the camp reached Uncle",body:"Uncle read it in the seniors' LINE group: Sirichai is really back. Grandpa Chai must be smiling up there. Uncle has no money to help, but sends you an amulet. They say it protects from harm (Uncle isn't sure)"}];
// earned money — sponsors only write after real results
const SPONSOR_MAIL=[
 {id:"sp_moo",when:G=>roster(G).some(f=>f.form&&f.form.slice(0,3).join("")==="WWW"),from:"Auntie Sri's Grilled Pork",title:"A small sponsorship",body:"I saw your fighters win three in a row. May I put my shop's sign in the corner of your camp ring? This is all I can give",amt:1500},
 {id:"sp_oil",when:G=>(G.cal||[]).filter(c=>c.res==="W").length>=8,from:"Three-Headed Elephant Muay Oil",title:"Sponsorship offer",body:"Our company would like to support a camp on a winning streak, in exchange for your fighters wearing our muay oil on camera (strong smell, our apologies in advance)",amt:4000},
 {id:"sp_pump",when:G=>G.week>=41&&[...((G.semis||{}).A||[]),...((G.semis||{}).B||[])].some(id=>G.F[id]&&G.F[id].camp==="player"),from:"The District Gas Station",title:"Cheering our district's semifinalists",body:"The station would like to support our district's representative camp. Fill up 500 baht, get free drinking water (customers only). The camp receives the following sponsorship",amt:8000},
 {id:"sp_beatploy",when:G=>G.flags&&G.flags.beat_ploy>=1,from:"Women's Muay Thai Fan Club",title:"The Giant-Slayer Award",body:"A prize for the camp that finally beat Ploy, for the first time in two seasons. The fans chipped in",amt:5000}];

/* v1.91.198 (Man: give the runners more story) — Suea Dam keeps score. His letters answer the last result; three wins over him bring a last dare at full tilt,
   and once he is beaten in that one he tips his cap and turns up at sports day as Golden Tiger's anchor instead. */
const RUN_DARE={first:["A 100 m dare","Heard Sirichai Camp trains its running every week. Come race me once at the temple yard? No shame in losing — everyone loses to me."],
  won:[["One more?","My legs weren't awake last time, doesn't count. Saturday, temple yard, same as before. It's {w} to {l} — I'm not done."],["I've drilled my start","Sia Tong's putting up a crate of red soda for the winner. I've drilled my start every morning all week. {w} to {l} — this time I take it back."]],
  lost:[["The temple yard's buzzing again","The temple folk haven't stopped talking about last time. {l} to {w}, I'm ahead. Want a rematch? Auntie Taew's already set up her som tam table."],["Still got the nerve?","Heard Kru Daeng's got you running extra every morning. Won't help. Suea Dam's legs never lose to a boxer. I lead {l} to {w}."]],
  final:["The last dare","Lost to you three times. This time I'm going all out. Lose again and I'll never write to you again. But if I win… be ready."]};
function runDareLetter(){const D=G.dare=G.dare||{w:0,l:0,n:0};const f=t=>t.replace("{w}",D.w).replace("{l}",D.l);
  if(!D.n)return {t:RUN_DARE.first[0],b:RUN_DARE.first[1]};if(D.w>=3)return {t:RUN_DARE.final[0],b:RUN_DARE.final[1],final:1};
  const P=D.last==="W"?RUN_DARE.won:RUN_DARE.lost,x=P[D.n%P.length];return {t:x[0],b:f(x[1])};}
/* always Suea Dam, the one who wrote the letter — a touch quicker than our quickest, a little more on the last dare */
function runDareRival(final){const R=roster(G).slice().sort((a,b)=>runVmax(b)-runVmax(a))[0],y=G.season||1;
  const base=R?Math.min(21.5,(R.a.speed||10)+1.2+(final?.6:0)):12;return runNpc("dare_suea","Suea Dam, Golden Tiger",base,Math.min(20,12+y),46);}
const TAM_MAIL=[["Stall's packed, come help!","There's a temple fair this weekend and the line reaches the chapel. I can't pound fast enough alone. Send me a fighter with heavy hands, dear. Pay depends on skill, and you take som tam home."],
 ["Tour buses at my stall!","Three tour buses pulled up at once and every one of them ordered mild Thai som tam. My arms are about to fall off, please come help!"],
 ["My helper called in sick","The girl who helps me pound has a fever, but the stall still has to open. Anyone free for half a day? I'll pay well."],
 ["New dish: crab & pla ra som tam","I came up with a new dish and want Sirichai fighters to pound the launch batch. Big crowd, good promo for your camp too."]];
const LOAN_MAIL=[
 ["Gold Helmet's goon","Fast cash. No guarantor. No waiting.","A gold business card tucked in the mailbox. \"Camp short on cash? Gold Helmet can help! Borrow ฿20,000 today, just 10% every four weeks. Call now!\""],
 ["Gold Helmet's goon","Heard money's tight lately","A flyer folded in four, in messy handwriting. \"Camp's gone quiet, boss. Twenty grand cash is waiting. We'll talk interest later. Really, later.\""],
 ["Boss Gold Helmet (Marketing Dept.)","Special offer for boxing camps","A glossy full-colour brochure, the boss grinning with a thumbs-up. \"New members borrow easy, repay whenever!* (*interest rises every four weeks)\""],
 ["Gold Helmet's goon","For the manager of Sirichai Camp","A brown envelope with engine-oil stains. \"We know the power bill isn't paid this month. We've got twenty thousand. No guarantor, no questions. Just one: when do you pay it back?\""],
 ["Gold Helmet's goon","Loan coupon (cut and keep)","Paper cut into a coupon, the edges jagged like it was done with nail clippers. \"Redeem for ฿20,000 cash, instantly. Never expires. The interest, however, goes up.\""]];
const LOAN_COACH=["Not yet. Check the job letters and temple-fair fights first.","Grandpa Chai got this exact same card once.","If you really must, borrow. But pay it back fast. The interest grows faster than Kati did.","I kept it so you could see it. Not so you'd call.","Read the small print by the asterisk."];
function mailWeekly(G){G.mail=G.mail||[];if(typeof thiefMail==="function"){thiefMail(G);tuyMail(G);}if(typeof regionWeek==="function")regionWeek(G);G.gang=G.gang||{st:0,next:0};G.mailSeen=G.mailSeen||{};const rng=mulberry32(G.seed+G.week*4441);
  if(typeof lottoWeekly==="function")lottoWeekly(G);
  for(const m of G.mail)if(m.expAbs!=null&&gameWeek(G)>m.expAbs&&!m.done)m.expired=true;
  // v1.88: every time cash dips low, the helmet gang slips a gold card into the mailbox
  if(typeof loanOk==="function"){const low=loanOk(G);
    if(low&&!G.loanMailArm){G.loanMailArm=1;const n=G.loanMailN=(G.loanMailN||0)+1,L=LOAN_MAIL[(n-1)%LOAN_MAIL.length],C=LOAN_COACH[(n-1)%LOAN_COACH.length];
      addMail(G,{kind:"loan",from:L[0],title:L[1],body:`${L[2]} (On the back, in Coach Daeng's handwriting: "${C}")`});}
    else if(!low&&(G.loan>0||G.cash>=LOAN_LOW+4000))G.loanMailArm=0;}
  for(const M of STORY_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"letter",from:M.from,title:M.title,body:M.body});}
  for(const M of SPONSOR_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"take",from:M.from,title:M.title,body:M.body,amt:M.amt});}
  // v1.89.24: win against the gang often enough and they call you out to their own warehouse
  if((G.gang.beat||0)-(G.gang.hqAt||0)>=3&&G.week<=48&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){const i=G.gang.hqN||0,k=["gang4","gang6","gang3"][i%3],year=G.season||1;G.gang.hqN=i+1;G.gang.hqAt=G.gang.beat;
    addMail(G,{kind:"quest",q:"gang",qk:k,hq:1,from:"The Helmet Gang (slipped under the door)",title:"Challenge: Meet Us at the Warehouse",
      body:`Red paper, scrawled handwriting: "Sirichai camp has knocked down my boys too many times. If you're for real, come to the warehouse behind the morning market. ${QK[k].name} is waiting. Win and I'll pay your fee. Lose, and never set foot in the market again."`,exp:G.week+3,pay:4000+year*1000});}
  // gang: after the first market fight, the next tier writes in every few weeks
  if(G.gang.st>=1&&G.gang.st<5&&gameWeek(G)>=(G.gang.nextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)&&G.week<=48){const early=G.gang.st===3&&G.loan>0,k=early?"gang5":"gang"+(G.gang.st+1);
    if(early){addMail(G,{kind:"quest",q:"gang",qk:k,early:1,from:"Morning-market vendors (unsigned)",title:"Big Boss Golden Helmet shows up himself!",body:`His goons lost to Sirichai Camp three times in a row. Big Boss Golden Helmet lost face, so he's running the market himself, and he knows your camp owes him. Word is, whoever knocks him down wipes out the whole market's debts.`,exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
    else addMail(G,{kind:"quest",q:"gang",qk:k,from:"Morning-market vendors (unsigned)",title:G.gang.st>=4?"Big Boss Golden Helmet is coming himself!":"The helmet gang is back",
      body:[`They're back collecting interest again. This time "${QK[k].name}" is in charge. Anyone who doesn't pay twenty percent gets their stall wrecked. Can you help us one more time?`,`${QK[k].name} threatened to seize Grandma Waew's meatball cart. If Sirichai doesn't stop him, no one can`,`The whole market has gone silent, because "${QK[k].name}" has been sitting guard since five a.m. Please`,`They say the big boss "${QK[k].name}" is coming to collect himself. The whole market owes him. Take this one down and the gang is finished`][G.gang.st-1],exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
  // The helmet gang keeps returning; escaped-animal challenges are sent by mail below.
  if(G.week>=7&&G.week<=50){const year=G.season||1;
    if(G.gang.st>=5&&gameWeek(G)>=(G.gang.loopNextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){
      const i=G.gang.loopN||0,k=["gang2","gang3","gang4","gang6","gang5"][i%5];G.gang.loopN=i+1;G.gang.loopNextAbs=gameWeek(G)+Math.max(3,10-year);
      addMail(G,{kind:"quest",q:"gang",qk:k,repeat:1,from:"Aunt Sri at the Market",title:"The helmet gang is back",body:`${QK[k].name} is causing trouble at the market again. They have trained harder this year. Can your gym help?`,exp:G.week+3,pay:3000+year*500});}}
  // Stadium titles: Tha Phae saves keep their original G.belt slots.
  for(const [venue,V] of Object.entries(STADIUMS))if((G.season||1)>=V.minYear&&V.weeks.includes(G.week))
    for(const div of [...new Set(roster(G).map(f=>f.div))]){const h=beltHolder(G,div,venue);if(!h)continue;
      const ours=h.camp==="player",op=ours?beltChallenger(G,div,h.id):h;if(!op)continue;const B=beltStore(G,venue)[div];
      addMail(G,{kind:"quest",q:"belt",venue,bg:V.bg,npc:op.id,div,defend:ours?h.id:null,from:`The promoter ${V.name}`,title:ours?`Defend the ${V.name} Div ${div}`:`Challenge for the ${V.name} Div ${div}`,
        body:ours?`${op.name} came through the qualifiers to challenge for the belt of ${h.name}${V.name}. One defense, five rounds. Accept within two weeks. Win and take ${fmt(V.defend)}`:`${V.name} opens a tournament in division ${div} including champion ${op.name}. Single elimination, five rounds a bout. The winner takes ${fmt(V.win)} with the belt. Lose it and you'll have to enter a new tournament`,exp:G.week+2,pay:ours?V.defend:V.win});}
  // v1.69: Auntie Taew writes in for help at her som tam stall every few weeks (a minigame that does not use the camp activity)
  if(G.week>=4&&G.week<=49&&gameWeek(G)>=(G.tamNextAbs||4)&&!G.mail.some(m=>m.kind==="job"&&!m.done&&!m.expired)){G.tamNextAbs=gameWeek(G)+3+Math.floor(rng()*2);
    const T=TAM_MAIL[(G.mailN_tam=(G.mailN_tam||0)+1)%TAM_MAIL.length];addMail(G,{kind:"job",job:"somtam",exp:G.week+1,from:"Auntie Taew, som tam stall by the temple",title:T[0],body:T[1]});}
  // v1.91.195 (Man): a runner from Golden Tiger turns up to challenge the camp to a 100 m race now and then — stakes are pride, morale and a little fame
  if(G.week>=10&&G.week<=48&&gameWeek(G)>=(G.runDuelNextAbs||10+Math.floor(rng()*4))&&roster(G).length&&!(G.dare&&G.dare.done)&&!G.mail.some(m=>m.job==="run"&&!m.done&&!m.expired)){G.runDuelNextAbs=gameWeek(G)+7+Math.floor(rng()*4);
    const L=runDareLetter();addMail(G,{kind:"job",job:"run",exp:G.week+2,from:"Suea Dam, Golden Tiger Camp",title:L.t,body:L.b,final:L.final||0});}
  // First escaped-animal letters; later escapes use the same mailbox route.
  if(!G.mailSeen.cow&&G.week>=9&&rng()<.6){G.mailSeen.cow=1;addMail(G,{kind:"quest",q:"cow",qk:"bull1",from:"Uncle Chaloem, dairy farm",title:"Help! The cow's loose!!",body:"Fresh Milk, the fiercest cow on the farm, broke out of her pen. She watches Muay Thai on TV every night and now she can hold a guard! She's blocking the road in front of the market and kicks anyone who comes near. Send a fighter, please. Uncle will pay, plus a bucket of fresh milk",exp:G.week+2,pay:1500});}
  if(!G.mailSeen.rooster&&G.week>=5&&rng()<.6){G.mailSeen.rooster=1;addMail(G,{kind:"quest",q:"rooster",qk:"rooster1",from:"Sia Tong, rooster arena",title:"My rooster flew into your camp",body:"My hot-headed bantam flew over the fence and has been pecking your heavy bag since morning. It squares up at anyone who comes close. Please catch it for me. I'll pay, plus two trays of eggs",exp:G.week+2,pay:1000});}
  G.runawayNext=G.runawayNext||{};
  if(G.runawayCadence!==3){for(const q of ["rooster","cow"])if(G.runawayNext[q]!=null){const last=G.mail.find(m=>m.q===q);G.runawayNext[q]=Math.min(G.runawayNext[q],last?.expAbs!=null?last.expAbs+1:gameWeek(G)+2);}G.runawayCadence=3;}
  for(const q of ["rooster","cow"])if(G.mailSeen[q]&&G.runawayNext[q]==null){const first=G.mail.find(m=>m.q===q&&!m.repeat);G.runawayNext[q]=first?.expAbs!=null?first.expAbs+1:gameWeek(G)+2;}
  if(G.week>=5&&G.week<=48)for(const q of ["rooster","cow"]){
    if(!G.mailSeen[q]||gameWeek(G)<G.runawayNext[q]||G.mail.some(m=>m.q===q&&!m.done&&!m.expired))continue;
    const cow=q==="cow",year=G.season||1;
    const k=cow?(year>=4?"bull3":"bull2"):(year>=4?"rooster5":"rooster3");
    G.runawayNext[q]=gameWeek(G)+3;
    addMail(G,{kind:"quest",q,qk:k,repeat:1,from:cow?"Uncle Chaloem, dairy farm":"Sia Tong, rooster arena",title:cow?"The cow's loose again!":"The rooster's loose again!",body:cow?`I shut the pen tight, I swear, but ${QK[k].name} kicked the gate open and is blocking the market road again. Please send a fighter to stop it`:`${QK[k].name} got loose from the cockpit and is pecking the camp's heavy bags again. This time it's better at guarding and dodging whoever tries to catch it. Please help!`,exp:G.week+2,pay:(cow?1500:1000)+Math.min(1000,(year-1)*200)});}
  // rivals we keep ignoring write in to taunt us
  const sn=Object.entries(G.snub||{}).filter(([id,n])=>n>=3&&G.F[id]&&!G.F[id].injury&&!G.F[id].canon&&(G.F[id].camp==="npc"||G.F[id].camp==="rival")&&!G.mailSeen["ch_"+(G.season||1)+"_"+id]&&!isBooked(G,id)).sort((a,b)=>b[1]-a[1])[0];
  if(sn&&rng()<.5&&G.week<=46){const op=G.F[sn[0]];G.mailSeen["ch_"+(G.season||1)+"_"+op.id]=1;
    addMail(G,{kind:"quest",q:"challenge",npc:op.id,from:op.name,title:"Why won't you take my fight?",body:[`I sent offers ${sn[1]} times and Sirichai never accepted once. Scared? If you've got guts, meet me behind the fresh market. No referee, no points, just pride`,`I hear your camp picks its opponents well. Only the ones you can beat. I'm challenging you right here: an exhibition in front of the temple, packed crowd. If you don't show, I'll tell the whole subdistrict you ran`,`I've been on your offers list for ${sn[1]} weeks. Like a menu item nobody orders. Today I'm ordering myself: an exhibition, against anyone in your camp`][sn[1]%3],exp:G.week+3,pay:1500});}
  // v1.33: temple-fair purses arrive by mail the week after
  for(const p of (G.fairPay||[]))addMail(G,{kind:"take",from:"Temple fair committee",title:p.res==="W"?"Temple fair purse (win)":"Temple fair purse",body:p.res==="W"?`Purse from the temple fair. You beat ${p.op}, the crowd loved it and added a little extra`:`Purse from the temple fair. Even though you lost to ${p.op}, the crowd still applauded`,amt:p.amt});
  G.fairPay=[];
  // quiz from the community radio
  // v1.26: mid-season income — sponsors reward a win, paid appearances every few weeks
  const won=(G.cal||[]).some(c=>c.absWeek!=null&&c.absWeek>=gameWeek(G)-1&&c.res==="W"&&G.F[c.a]&&G.F[c.a].camp==="player"&&!(TIER[c.tier]&&TIER[c.tier].off));
  if(won&&G.week>=6&&G.week<=42&&rng()<.2){const B=WIN_BONUS[(G.week+G.seed)%WIN_BONUS.length];addMail(G,{kind:"take",from:B[0],title:B[1],body:B[2],amt:Math.round((300+G.week*10)/50)*50});}
  const gi=GIG_WEEKS.indexOf(G.week);if(gi>=0&&G.campUsed===["promo","kids","fightnight","clip","tourist","class"][gi]){const g=GIGS[gi%GIGS.length];addMail(G,{kind:"take",from:g[0],title:g[1],body:g[2],amt:Math.round((500+G.week*15)/50)*50});}
  if(G.week%3===1&&G.week>=4&&G.week<=49){const q=QUIZ[(Math.floor(G.week/3)+G.seed)%QUIZ.length];addMail(G,{kind:"quiz",from:"Community radio 'Our Muay Thai'",title:"Weekly prize quiz",body:"Answer correctly to win prize money from the show's sponsor (one answer only)",q:q[0],opts:q[1],ans:q[2],amt:Math.round((800+Math.min(2200,G.week*45))/10)*10,exp:G.week+2});}
  // odd bills
  if(G.week>=5&&rng()<.22){const L=BILLS.filter(b=>!b[3]||b[3](G));const b=L[Math.floor(rng()*L.length)];addMail(G,{kind:"pay",from:b[0],title:"Invoice",body:typeof b[1]==="function"?b[1](G):b[1],amt:Math.round(b[2]*(1+G.week/60)/10)*10,exp:G.week+2});}
  // odd fights posted to the offers board (rare, pays well)
  beastOffer(G,rng);
  qCleanup(G);}
const BEAST_WEEKS=[7,11,15,19,23,27,31,35,39,43,47];
function beastOffer(G,rng){const year=G.season||1,gap=Math.max(2,5-year);if(year===1?!BEAST_WEEKS.includes(G.week):G.week<5||G.week>49||(G.week-5)%gap!==0)return;const R=roster(G).filter(f=>!f.injury);if(!R.length)return;
  const i=year===1?BEAST_WEEKS.indexOf(G.week):Math.floor((G.week-5)/gap);const kinds=["rooster2","bull2","rooster3","bull2","rooster4","bull3","rooster4","rooster5","bull3","rooster5","bull3"];const kind=year>=4?["rooster4","bull3","rooster5","bull2","rooster3","bull3"][i%6]:kinds[i%kinds.length];const f=R[Math.floor(rng()*R.length)];
  const wk=G.week+2;if(G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-wk)<=1))return;const qid=makeQ(G,kind,f.id,"o"+G.week);const K=QK[kind];
  const win=Math.round((6000+G.week*180)*(1+K.lvl*.2)/100)*100,lose=Math.round(win*.35/100)*100;
  G.offers.unshift({id:`ob${G.week}_${f.id}`,a:f.id,b:qid,week:wk,tier:"beast",beast:kind,bg:QGRP_BG[K.grp],win,lose});
  const ev=K.grp==="rooster"?["Ban Pong Temple Fair","Human vs Fighting Rooster"]:["District Annual Fair","Bull Wrestling (Muay Thai edition)"];
  addMail(G,{kind:"letter",from:ev[0],title:`Invitation: "${ev[1]}"`,body:`We invite ${f.name} to a special bout with "${K.name}" in week ${wk}. Better purse than a normal fight (doesn't affect record or rankings). The offer is on the Fights page; accept it this week`});}

// ---------- quest fights ----------
function questFighters(){return roster(G).filter(f=>!f.injury);}
function startQuest(spec,fid,done){const f=G.F[fid];if(!f){done&&done();return;}
  const opp=spec.npc||makeQ(G,spec.qk,fid,spec.tag||("w"+G.week));const tier="quest";
  const b={id:"q"+G.week+"_"+fid+"_"+Math.floor(Math.random()*1e4),a:fid,b:opp,week:G.week,tier,rounds:spec.rounds||3,win:spec.purse||0,lose:0,quest:spec};
  b.title=spec.q==="belt"?STADIUMS[spec.venue||"tha"].name+" · "+spec.div:spec.q==="gang"?"Market Stall Brawl":spec.q==="rooster"||spec.q==="cow"||spec.q==="bull"?"Wild bout":null;
  b.bg=spec.bg||(spec.rematch||spec.hq?"bg_gang_hideout.webp":spec.q==="belt"?STADIUMS[spec.venue||"tha"].bg:spec.npc?"bg_food.webp":QGRP_BG[QK[spec.qk].grp]);
  if(typeof questPlan==="function"){questPlan(b,()=>openFight(b,()=>questAfter(b,done)));return;}
  openFight(b,()=>questAfter(b,done));}
const GANG_HQ_TAUNT={gang3:"At the market you're tough, but this is my turf!",gang4:"Finally! No market aunties to cheer for you here. The Silver Helmet will teach you some manners.",gang6:"The boss said you don't walk out of this warehouse easily."};
function questAfter(b,done){const S=b.quest,res=(G.cal||[]).slice(-1)[0];const win=res&&res.b===b.b&&res.res==="W";const me=G.F[b.a],op=G.F[b.b]||{name:"Opponent"};
  const fin=()=>{save();render();done&&done();};
  if(S.q==="gang"){G.gang=G.gang||{st:0,next:0};if(win)G.gang.beat=(G.gang.beat||0)+1;
    if(S.hq){if(win){G.rep+=.4;addMail(G,{kind:"take",from:"The Helmet Gang",title:"Fight Fee from the Warehouse",body:"A crumpled red envelope tossed through the window: \"I keep my word … don't tell the boss I lost.\"",amt:S.pay||5000});}
      playScene(win?[{n:"npc",who:op.name,t:"…Take it, your fee! I keep my word — just don't tell the boss I lost."},{n:b.a,f:"happy",l:"fight",t:"Thank you! I won't lose next time either!"}]:[{n:"npc",who:op.name,t:"Ha! My turf stays mine!"},{n:b.a,f:"sad",l:"fight",t:"I'll come back next time!"}],fin,{bg:"gang_hideout",look:"fight"});return;}
    if(S.rematch){if(win){G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.rep+=.2;}playScene([{n:"npc",who:"Big Boss Golden Helmet",t:win?"I lost again! I will be back.":"I won this time! But your camp has grown stronger."},{n:b.a,f:win?"happy":"sad",l:"fight",t:win?"Sirichai Camp is always ready.":"We will win next time."}],fin,{bg:"gang_hideout",look:"fight"});return;}if(win){if(S.qk==="gang5")G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.gang.st=Math.max(G.gang.st,+S.qk.slice(4));G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);if(S.qk==="gang5"&&G.loan>0){G.loan=0;G.flags.loanWiped=1;}G.rep+=S.qk==="gang5"?2:.5;
      const amt=S.qk==="gang5"?12000:S.qk==="gang6"?8000:S.qk==="gang4"?5000:S.qk==="gang3"?2000:200+Math.floor(srand(G,7)*7)*50;
      addMail(G,{kind:"take",from:"(sender unknown)",title:S.qk==="gang5"?"The morning market thanks Sirichai":"A brown envelope with no name",body:S.qk==="gang5"?"The helmet gang has disbanded. The whole market's loan-shark debts are void. Every stall chipped in for the camp. Thank you for not just standing by":"Inside: money and a note in shaky handwriting: 'Thank you for helping the market. We sold out today'",amt});
      playScene([{n:"npc",who:"Auntie Sri, the vegetable seller",t:S.qk==="gang5"?(G.flags.loanWiped===1?(G.flags.loanWiped=2,"Gold Helmet Boss is down!! The whole market is free! His debt book got burned, and the camp's loan is gone too!"):"The Golden Helmet boss is down!! The whole market is free!"):"They're gone! They rode off on their bikes! Thank you, dear"},{n:b.a,f:"happy",l:"fight",t:S.qk==="gang5"?"This market has protection now. Its name is Sirichai Camp!":"Anyone who bullies this market goes through Sirichai first!"},{n:"nar",t:"By evening, a brown envelope with no sender is tucked into the camp mailbox"}],fin,{bg:"market_morning",look:"fight"});return;}
    playScene([{n:"npc",who:op.name,t:"Ha! Some fight camp! Tell the vendors to get the interest ready!"},{n:b.a,f:"sad",l:"fight",t:"…I'm sorry, auntie. Next time I won't lose"},{n:"nar",t:"The vendor says it's okay. They'll be back, and the camp will get another chance"}],()=>{G.gang.nextAbs=gameWeek(G)+3;fin();},{bg:"market_morning",look:"fight"});return;}
  if(win&&S.pay){addMail(G,{kind:"take",from:S.from||"Client",title:"Fee as agreed",body:S.q==="cow"?"Your fee plus a bucket of fresh milk (the milk was gone within ten minutes, courtesy of the camp's fighters)":S.q==="rooster"?"Your fee plus two trays of eggs. The bantam went home to sulk; the owner says it had never lost before":"Ringside bets pooled by the crowd. The whole subdistrict is talking about this fight",amt:S.pay});G.rep+=.6;}
  if(S.q==="challenge")op&&(win?G.rep+=1:0);
  if(S.q==="belt"){const venue=S.venue||"tha",V=STADIUMS[venue],slot=beltStore(G,venue),B=slot[S.div];
    if(win&&!S.defend){slot[S.div]={id:me.id,def:0,since:G.week};G.rep+=3;me.belts=(me.belts||0)+1;
      recordHonor(G,"belt",me.id,S.div,G.week,venue==="tha"?null:venue,op?op.name:null,op?op.id:null);playHonorQueue(fin);return;}
    if(win&&S.defend){B.def++;G.rep+=1.5;recordHonor(G,"defense",me.id,S.div,G.week,venue==="tha"?null:venue,op?op.name:null,op?op.id:null);playHonorQueue(fin);return;}
    if(!win&&S.defend){slot[S.div]={id:op.id,def:0,since:G.week};playScene([{n:"nar",t:`The ${V.name} belt changes hands to ${op.name}`},{n:me.id,f:"sad",l:"fight",t:"I will win it back"}],fin,{bg:V.scene,look:"fight"});return;}
    if(!win&&!S.defend&&B)B.def++;}
  fin();}

// first time — the market scene, then straight into the ring
function gangEventSteps(){const R=questFighters();const steps=[{n:"nar",t:"Saturday morning, the fresh market by the temple. Shouting comes from a vegetable stall"},
  {n:"npc",who:"Auntie Sri, the vegetable seller",t:"I really don't have it, young man. Half my vegetables rotted this month, let me pay next week…"},
  {n:"npc",who:"Red-Helmet Grunt",t:"Twenty percent a month, auntie! Don't pay today and tomorrow this stall is gone!"},
  {n:"coach",t:"The helmet gang… loan sharks charging twenty percent a month, bleeding the market dry for years"},
  {n:"kati",f:"angry",l:"train",t:"Manager! Grandpa Chai taught that Muay Thai is for protecting people who can't fight back. We can't just stand here!"},
  {choice:[...R.slice(0,3).map(f=>({t:`Send ${f.name} to handle it (fight now · fatigue ${Math.round(f.fatigue)})`,fx:()=>{UI.qpend={q:"gang",qk:"gang1",fid:f.id};},then:[{n:"npc",who:"Red-Helmet Grunt",t:`Huh? A girl fighter? ${f.name}? Bring it, you'll learn these helmets aren't just for show!`}]})),
    {t:"Call the police instead (no fight)",fx:()=>{UI.qpend=null;G.gang={st:0,nextAbs:gameWeek(G)+6,skip:1};},then:[{n:"nar",t:"The police arrive fifteen minutes too late. The helmet gang is gone. Auntie Sri lets out a long sigh"},{n:"kati",f:"sad",l:"train",t:"…Next time I see them, I won't let it go"}]}]}];return steps;}
function questExtra(done,rng){if(!G||G.ended)return false;G.gang=G.gang||{st:0,next:0};
  const again=G.gang.skip&&G.gang.st===0&&!G.seen.q_gang_again&&gameWeek(G)>=(G.gang.nextAbs||0);
  const ok=(!G.seen.q_gang_first||again)&&G.week>=6&&G.week<=44&&questFighters().length;
  if(!ok||rng()>=(G.loan>0?.5:.2))return false;if(G.seen.q_gang_first)G.seen.q_gang_again=true;G.seen.q_gang_first=true;
  UI.qpend=null;playScene(gangEventSteps(),()=>{const p=UI.qpend;UI.qpend=null;if(!p){done();return;}G.gang.st=Math.max(G.gang.st,0);startQuest({q:"gang",qk:"gang1"},p.fid,done);},{bg:"market_morning",look:"train"});return true;}

// ---------- modals ----------
/* v1.89.24: the Loy Krathong invitation glows green until it is read and the gauntlet has been played once */
function loyMailHot(m){evSettle(m);if(m.kind==="event"&&(m.ev==="kongka"||m.ev==="thief"||m.ev==="tuy"||m.ev==="dress"||m.ev==="qshow"))return !m.done&&!m.expired;return m.kind==="event"&&m.ev==="loy";} /* v1.90.4: the Loy invitation always glows green so it is easy to find again */
/* v1.91.72 (Man): Naka League letters are green with a blinking green frame, regional letters have a blinking blue frame, the black card is black with a blinking red frame */
function mailTone(m){if(m.tone)return m.tone;const f=String(m.from||"");if(/ไม่มีชื่อผู้ส่ง|no sender/i.test(f))return "black";if(/นาคา|Naka|ไม่ลงชื่อ|Unsigned/i.test(f))return "naka";if(/แชมป์ภาค|regional champ/i.test(f))return "region";return "";}
function mailListHTML(){const L=G.mail||[];
  const nd=mailDelN();const bulk=!nd?"":UI.mdelAll?`<div class="mdelask"><span>Delete ${nd} letters? This can't be undone</span><button class="btn sm" data-act="mdelno">Keep</button><button class="btn sm red" data-act="mdelallok">Delete ${nd} letters</button></div>`:`<div class="mdelbar"><small>🔒 Event letters and letters still waiting on an answer are never deleted</small><button class="btn sm ghost" data-act="mdelall">🗑 Delete read (${nd})</button></div>`;
  return `<h2 class="mailh">${MAILBOX_PX} Mailbox</h2>${bulk}${L.length?`<div class="mlist2">${L.map(m=>`<button class="mrow2 ${m.read?"":"unread"} ${mailOpen(m)?"act":""} ${m.done||m.expired?"old":""} ${loyMailHot(m)?"loyev"+(m.ev==="loy"&&(loyOf(G)||{}).runs?" calm":""):""} ${(t=>t?"t"+t+(t==="black"&&!m.done?" hot":""):"")(mailTone(m))}" data-act="mopen" data-v="${m.id}"><span class="mk ${m.kind}">${{letter:"Letter",take:"Money",pay:"Invoice",quiz:"Quiz",quest:"Request",job:"Job",event:"Event",loan:"Loan",lotto:"Lottery"}[m.kind]||"Letter"}</span><span class="mt"><b>${esc(m.title)}</b><small>${esc(m.from)} · wk ${m.wk}${m.expired?" · expired":m.done?" · handled":m.expAbs!=null?` · by wk ${((m.expAbs-1)%52)+1}`:""}</small></span>${mailOpen(m)?'<i class="dot"></i>':""}</button>`).join("")}</div>`:`<p class="lead">No mail yet</p>`}`;}
function letterHTML(m){m.read=true;let act="";
  if(m.kind==="take")act=m.done?`<p class="meta center">Received ${fmt(m.amt)}</p>`:`<button class="btn primary" data-act="mtake" data-v="${m.id}">Collect ${fmt(m.amt)}</button>`;
  if(m.kind==="pay")act=m.done?`<p class="meta center">${m.paid?"Paid":"Didn't pay (fame −0.3)"}</p>`:m.expired?"":`<button class="btn" data-act="mskip" data-v="${m.id}">Don't pay (fame −0.3)</button><button class="btn primary" data-act="mpay" data-v="${m.id}" ${G.cash<m.amt?"disabled":""}>Pay ${fmt(m.amt)}</button>`;
  if(m.kind==="quiz")act=m.done?`<p class="meta center">${m.ok?`Correct! You won ${fmt(m.amt)}`:`Wrong! The answer was "${esc(m.opts[m.ans])}"`}</p>`:m.expired?"":`<p class="qz"><b>${esc(m.q)}</b></p><div class="qopts">${m.opts.map((o,i)=>`<button class="btn" data-act="mquiz" data-v="${m.id}" data-k="${i}">${esc(o)}</button>`).join("")}</div>`;
  if(m.kind==="job"&&m.job==="run")act=m.done?`<p class="meta center">${m.declined?"Didn't take the dare":m.won?"Beat Suea Dam at the temple yard!":"Lost at the temple yard"}</p>`:m.expired?`<p class="meta center">Expired</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mrdecl" data-v="${m.id}">Decline</button><button class="btn primary" data-act="mrplay" data-v="${m.id}">${JOY_PX} Accept</button>`;
  else if(m.kind==="job")act=m.done?`<p class="meta center">${m.declined?"Didn't go":m.grade?`Helped out · grade ${m.grade}`:"Sent someone to help: ฿550"}</p>`:m.expired?`<p class="meta center">Expired</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mjdecl" data-v="${m.id}">Too busy</button><button class="btn" data-act="mjskip" data-v="${m.id}">Send someone (฿550)</button><button class="btn primary" data-act="mjplay" data-v="${m.id}">${JOY_PX} Help in person</button>`;
  if(m.kind==="event")act=evMailAct(m);
  if((m.bk||m.lg)&&typeof REGION!=="undefined"&&REGION.letterAct)act=REGION.letterAct(m); /* v1.91.72: Krerk's black card is the way into the warehouse */
  if(m.kind==="loan")act=m.done?`<p class="meta center">${m.took?"Loan taken":"Card binned"}</p>`:!loanOk(G)?`<p class="meta center">${G.loan>0?"A Gold Helmet loan is still unpaid. You can't borrow again.":"Cash is out of the danger zone. No need for this card."}</p>`:`<button class="btn" data-act="mloanno" data-v="${m.id}">Bin the card</button><button class="btn red" data-act="mloan" data-v="${m.id}">See loan ${fmt(LOAN_AMT)}</button>`;
  if(m.kind==="lotto")act=lottoLetterAct(m);
  if(m.kind==="quest")act=m.done?`<p class="meta center">${m.declined?"Declined":"Fighter sent"}</p>`:m.expired?`<p class="meta center">Expired</p>`:`<button class="btn" data-act="mdecl" data-v="${m.id}">Not going</button><button class="btn primary" data-act="macc" data-v="${m.id}">Take the job · choose a fighter</button>`;
  const opp=m.qk?QK[m.qk]:m.npc?G.F[m.npc]:null;
  const kp=mailKeep(m);const del=UI.mdelAsk===m.id?`<span class="mdelask"><span>Delete this letter? This can't be undone</span><button class="btn sm" data-act="mdelno">Keep</button><button class="btn sm red" data-act="mdelok" data-v="${m.id}">Delete</button></span>`:kp?`<small class="mlock">🔒 ${kp==="event"?"Event letter — can't be deleted":"Can be deleted once this letter is dealt with"}</small>`:`<button class="btn sm ghost" data-act="mdel" data-v="${m.id}">🗑 Delete</button>`;
  return `<button class="btn sm ghost mback" data-act="mail">◂ Mailbox</button><div class="letter px ${(t=>t?"tl-"+t:"")(mailTone(m))}"><div class="lhead"><small>From</small><b>${esc(m.from)}</b><small>Week ${m.wk}</small></div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>
   ${m.kind==="take"||m.kind==="pay"?`<p class="lamt ${m.kind}">${m.kind==="take"?"+":"−"}${fmt(m.amt)}</p>`:""}
   ${opp&&m.kind==="quest"?`<div class="qopp">${m.qk?`<canvas width="96" height="96" data-qsprite="${QK[m.qk].sprite}"></canvas>`:faceImg(opp)}<span><b>${esc(opp.name)}</b><small>${m.q==="belt"?`5 rounds · opponent power ${ovr(opp.a).toFixed(1)}`:m.q==="challenge"?"Exhibition, off the record":"Fight now · off the record and rankings · extra fatigue"}${m.pay?` · fee ${fmt(m.pay)}`:m.q==="gang"?" · reward arrives by mail":""}</small></span></div>`:""}</div>
   <div class="mfoot lact">${act}</div><div class="mdelrow">${del}</div>`;}
/* v1.91.126 (player report): a belt defense always lists its holder, even one whose division no longer matches the belt (old saves let a fighter take another division's belt); fighters who cannot go now are greyed with the reason instead of tapping to nothing */
const qpickOK=(m,f)=>!m||m.q!=="belt"||(m.defend?m.defend===f.id:f.div===m.div);
function qpickWhy(f){return f.injury?`Injured ${f.injury} wk`:isBooked(G,f.id,G.week)?"has a bout this week":"";}
function qpickHTML(mid){const m=(G.mail||[]).find(x=>x.id===mid);const R=roster(G).filter(f=>qpickOK(m,f));
  return `<h2>Who will you send?</h2><p class="meta">${m?esc(m.title):""} · fight right now, extra fatigue, off the record</p><div class="qpick">${R.length?R.map(f=>{const why=qpickWhy(f);return `<button class="qpf px" data-act="qsend" data-id="${f.id}" data-v="${mid}" ${why?"disabled":""}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${why||`Fatigue ${Math.round(f.fatigue)} · readiness ${condition(f)}`}</small></span></button>`;}).join(""):`<p class="meta">${m&&m.defend?"The belt holder is no longer in the camp — tap \"Decline\" on the letter":m&&m.q==="belt"?`The camp has no fighter in division ${esc(m.div)}`:"No fighter can go right now"}</p>`}</div>`;}
// cash flow & fame graphs
function lineSVG(pts,key,col,fmtY){if(pts.length<2)return `<p class="meta">Not enough data yet, play another week`;const W=320,H=130,P=26;const ys=pts.map(p=>p[key]);let mn=Math.min(0,...ys),mx=Math.max(...ys);if(mx===mn)mx=mn+1;
  const x=i=>P+(W-P-6)*i/(pts.length-1),y=v=>H-16-(H-28)*(v-mn)/(mx-mn);const d=pts.map((p,i)=>`${i?"L":"M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join("");
  const z=mn<0?`<line x1="${P}" x2="${W-6}" y1="${y(0)}" y2="${y(0)}" class="g0"/>`:"";
  return `<svg class="lsvg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart"><line x1="${P}" x2="${W-6}" y1="${H-16}" y2="${H-16}" class="gax"/>${z}<path d="${d}" fill="none" stroke="${col}" stroke-width="2.5" stroke-linejoin="round"/>
   ${pts.map((p,i)=>`<rect x="${x(i)-2}" y="${y(p[key])-2}" width="4" height="4" fill="${col}"><title>wk ${p.w}: ${fmtY(p[key])}</title></rect>`).join("")}
   <text x="${P-4}" y="${y(mx)+4}" text-anchor="end" class="gt">${fmtY(mx)}</text><text x="${P-4}" y="${y(mn)+4}" text-anchor="end" class="gt">${fmtY(mn)}</text>
   <text x="${x(0)}" y="${H-3}" class="gt">wk ${pts[0].w}</text><text x="${x(pts.length-1)}" y="${H-3}" text-anchor="end" class="gt">wk ${pts[pts.length-1].w}</text></svg>`;}
const kfmt=v=>Math.abs(v)>=1000?(v<0?"-":"")+"฿"+(Math.abs(v)/1000).toFixed(Math.abs(v)>=10000?0:1)+"k":fmt(v);
function cashflowHTML(){const H=(G.history||[]);const inc=classIncome(G),up=upkeep(G),wg=wages(G),sp=G.sponsorWk||0,debt=G.debt>0&&(G.week%4===0)?Math.min(5000,G.debt):0,net=inc+sp-up-wg;
  const tip=net<0?(G.cash/-net<6?`Regular costs exceed income. Cash lasts about ${Math.max(1,Math.floor(G.cash/-net))} weeks. Take a fight or check the mailbox for income`:`Regular costs exceed income. You'll rely on fight purses, more students, or lower wages`):`Regular income covers costs, leaving per week ${fmt(net)} you can save for camp upgrades`;
  const full=studentDemand(G)>studentCap(G),dis=G.disaster&&G.disaster.untilAbs!=null&&gameWeek(G)<G.disaster.untilAbs;
  const why=dis?`Tuition income is down because ${esc(G.disaster.name)}`:full?`Students wanting to join: ${studentDemand(G)} but the camp only takes ${studentCap(G)} · expand the teaching area for more students`:`Tuition per student ${fmt(studentFee(G))} per week`;
  const row=(l,v)=>v?`<div class="kv-row"><span>${l}</span><b class="num ${v<0?"neg":"pos"}">${v<0?"−":"+"}${fmt(Math.abs(Math.round(v)))}</b></div>`:"";
  const R=H.slice(-5).map((h,i,a)=>i?{...h,d:h.cash-a[i-1].cash}:null).filter(Boolean).reverse();
  return `<h2>Finances</h2><div class="bigcash"><small>Cash right now</small><b class="num">${fmt(G.cash)}</b><span class="num ${net<0?"negt":"post"}">${net<0?"−":"+"}${fmt(Math.abs(net))} per week</span></div>
   <div class="ctip"><img src="${ASSET}coach.webp" alt=""><span>${tip}</span></div>
   <h3>Regular weekly money</h3>${row(`Tuition: ${students(G)} students`,inc)}${row("Sponsor",sp)}${row("Camp upkeep",-up)}${row("Fighter and coach wages",-wg)}${debt?row("Grandpa Chai's debt payment (every 4 weeks)",-debt):""}
   <p class="meta">${why} · Upkeep grows with each upgrade · Fight purses and events are counted when they happen</p>
   <h3>Last 4 weeks</h3>${R.length?R.map(h=>`<details class="cfw"><summary><span>Week ${h.w}${h.fight?" · fight purse":""}</span><b class="num ${h.d<0?"negt":"post"}">${h.d<0?"−":"+"}${fmt(Math.abs(Math.round(h.d)))}</b></summary>
     ${row("Tuition",h.inc)}${row("Sponsor",h.sponsor||0)}${row("Fight purses",h.fight||0)}${row("Camp upkeep",-(h.up||0))}${row("Wages",-(h.wg||0))}${row("Debt payment",-(h.debt||0))}${row("Events, upgrades and other",h.oth||0)}</details>`).join(""):`<p class="meta">No history yet. Finish your first week to see entries</p>`}`;}
function repgraphHTML(){const r=G.rep,S=repSteps();const nx=S.find(([n])=>r<n),pv=[...S].reverse().find(([n])=>r>=n);const lo=pv?pv[0]:0,hi=nx?nx[0]:Math.max(lo+1,r);
  return `<h2>Camp fame</h2><div class="repg"><div class="repg-h"><b class="num">${r.toFixed(1)}</b><span>${nx?`${(nx[0]-r).toFixed(1)} more to unlock: ${nx[1]}`:"Everything unlocked"}</span></div>
    <div class="gauge" role="img" aria-label="Fame ${r.toFixed(1)}"><i style="width:${Math.round(100*Math.min(1,(r-lo)/(hi-lo)))}%"></i></div><div class="repg-f"><small class="num">${lo}</small><small class="num">${nx?hi:""}</small></div></div>
   <p class="meta">Earned by winning fights, camp activities and hosting fight nights · higher fame means more students and bigger purses ${r>55?" · above 55 it slowly drops, keep winning":""}</p>
   <div class="replist">${S.map(([n,t])=>`<div class="${r>=n?"on":""}"><b>${r>=n?"✓":n}</b><span>${t}</span></div>`).join("")}</div>`;}
// fight calendar under the rankings
/* v1.87: the calendar also shows birthdays, festivals and the camp beauty contest */
function calEvents(w){const E=[],S=G.season||1;
  for(const id of (typeof BDAY_DM!=="undefined"?Object.keys(BDAY_DM):["kati","mali","rin","ploy","fah"])){const f=G.F[id];if(f&&(f.camp==="player"||f.met)&&typeof bdayWeek==="function"&&bdayWeek(id)===w)E.push({ic:"🎂",t:`Birthday: ${f.name}`});}
  const FE={26:["🏮","Loy Krathong"],32:["🎆","New Year"],37:["🙏","Annual wai kru"],47:["💦","Songkran"]};if(FE[w])E.push({ic:FE[w][0],t:FE[w][1]});if(typeof LOTTO_WK!=="undefined"&&LOTTO_WK.some(x=>x+2===w))E.push({ic:"🎟️",t:"Lottery results"});
  /* v1.88 yearly theme marks */const yk=typeof ytKey==="function"&&ytKey(G);if(yk){const T=YEAR_THEMES[yk];if(T.from!=null&&w>=T.from&&w<=T.to)E.push({ic:T.ic,t:T.name});
    if(yk==="sponsor"&&G.yt.acc&&w===40)E.push({ic:"💼",t:"Sponsor deadline: 8 wins"});}
  if(typeof CONTEST_WEEK!=="undefined"&&w===CONTEST_WEEK){const c=G.contests&&G.contests[S];E.push({ic:"🌸",t:c&&c.rank?`Camp beauty contest · placed #${c.rank}`:"Camp beauty contest: the District Chief inspects the camp"});}
  return E;}
function calendarHTML(){const past={},next={};for(const c of G.cal||[])if(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)(past[c.wk]=past[c.wk]||[]).push(c);for(const b of G.bookings)if(G.F[b.a]&&G.F[b.a].camp==="player")(next[b.week]=next[b.week]||[]).push(b);
  const mark={20:"Subdistrict cut",40:"District cut",44:"Semifinal",49:"Final"};
  return `<section class="px card cal"><div class="card-h"><h3>Calendar · Year ${G.season||1}</h3><span class="legend"><i class="cw"></i>Win <i class="cl"></i>Loss <i class="cn"></i>Upcoming</span></div>
   <div class="calg">${Array.from({length:52},(_,i)=>i+1).map(w=>{const p=past[w],n=next[w];const r=p?(p.some(c=>c.res==="W")?(p.every(c=>c.res==="W")?"w":"m"):p.some(c=>c.res==="D")?"d":"l"):"";
     const ev=calEvents(w);return `<button class="cday ${w<G.week?"gone":""} ${w===G.week?"now":""} ${p?"has "+r:""} ${n?"nx":""} ${mark[w]?"mk":""} ${ev.length?"ev":""}" data-act="calday" data-v="${w}" ${p||n||ev.length?"":"tabindex=\"-1\""} title="${[mark[w]||""].concat(ev.map(e=>e.t)).filter(Boolean).join(" · ")}" aria-label="Week ${w}${p?" has fight results":n?" has a booked fight":""}${ev.map(e=>" "+e.t).join("")}">${ev.length?`<u>${ev.slice(0,2).map(e=>e.ic).join("")}</u>`:""}<b>${w}</b>${p||n?`<i>${p?p.length:""}${n?"●":""}</i>`:""}${mark[w]?`<s></s>`:""}</button>`;}).join("")}</div>
   <p class="meta">Tap a week for fight results and events · 🎂 birthday · 🏮🎆💦 festival · 🌸 camp beauty contest · gold underline = cut-off weeks (20, 40) and semi-final/final (44, 49)</p></section>`;}
function caldayHTML(w){const p=(G.cal||[]).filter(c=>c.wk===w&&(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1)),n=G.bookings.filter(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player");
  const ev=calEvents(w);return `<h2>Week ${w}${typeof weekDateLabel==="function"?` <small class="meta">· ${weekDateLabel(w)}</small>`:""}</h2>${ev.map(e=>`<div class="calres px ev"><b>${e.ic} ${esc(e.t)}</b></div>`).join("")}${p.map(c=>{const me=G.F[c.a];return `<div class="calres px ${c.res==="W"?"w":c.res==="L"?"l":"d"}"><b>${esc(me?me.name:c.a)} ${c.res==="W"?"Win":c.res==="L"?"Loss":"Draw"} ${esc(c.bn)}</b><span class="meta">${TIER[c.tier]?(c.tierName||TIER[c.tier].name):""} · ${esc(c.type||"")} · earned ${fmt(c.pay||0)}</span><span class="cards">${(c.cards||[]).map((k,i)=>`<i>R${i+1} ${k[0]}–${k[1]}</i>`).join("")}</span></div>`;}).join("")}
   ${n.map(b=>`<div class="calres px nx"><b>${esc(G.F[b.a].name)} vs ${esc(G.F[b.b].name)}</b><span class="meta">Booked · ${(b.tierName||TIER[b.tier].name)} · ${b.rounds} rounds</span></div>`).join("")}${!p.length&&!n.length?`<p class="meta">No camp fights this week</p>`:""}`;}
const RANK_HELP=`<ul class="fp-list"><li><b>Win = 3 points</b> (beat a stronger fighter +1) · draw 1 · loss 0 — only "subdistrict/district" fights count</li><li><b>Weeks 1–20, subdistrict round:</b> the top 4 of each division advance to the district round</li><li><b>Weeks 21–40, district round:</b> points reset, the top 4 go to the provincial semis</li><li><b>Week 44 semis · week 49 provincial final</b>: big prize money and top fame</li><li>Temple-fair, special and off-the-books fights <b>give no points</b>, but do give money, EXP and fame</li></ul>`;
const XMODAL={
  mail:()=>({body:mailListHTML(),foot:true}),
  letter:m=>{const x=(G.mail||[]).find(y=>y.id===m.id);return x?{body:letterHTML(x),foot:false}:{body:mailListHTML(),foot:true};},
  qpick:m=>({body:qpickHTML(m.id),foot:true}),
  cashflow:()=>({body:cashflowHTML(),foot:true}),
  repgraph:()=>({body:repgraphHTML(),foot:true}),
  calday:m=>({body:caldayHTML(m.w),foot:true}),
  rankhelp:()=>({body:`<h2>How do rankings work?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>Coach Daeng:</b> This season's goal is to get Kati ${G.F.mali.camp==="player"?" and Mali":""} into the division's <b>top 4</b>, clear both stages, then face Golden Tiger in the final</span></div>${RANK_HELP}`,foot:true}),
  declo:m=>{const o=G.offers.find(x=>x.id===m.id);if(!o)return {body:"",foot:true};return {body:`<h2>Decline this offer?</h2><p>${esc(G.F[o.a].name)} vs ${esc(G.F[o.b].name)} · wk ${o.week} · ${(o.tierName||TIER[o.tier].name)}</p><p class="meta">The offer will disappear from the list (decline the same person often and they may write you a challenge)</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">No</button><button class="btn primary" data-act="declyes" data-v="${o.id}">Decline</button></div>`,foot:false};}};
Object.assign(ACT,{
  mail:()=>{UI.mdelAsk=null;UI.mdelAll=0;UI.modal={type:"mail"};render();},
  mopen:d=>{UI.mdelAsk=null;UI.mdelAll=0;UI.modal={type:"letter",id:d.v};render();save();},
  mdel:d=>{UI.mdelAsk=d.v;render();},
  mdelno:()=>{UI.mdelAsk=null;UI.mdelAll=0;render();},
  mdelok:d=>{UI.mdelAsk=null;if(mailDel([d.v])){toast("Letter deleted");}UI.modal={type:"mail"};render();save();},
  mdelall:()=>{UI.mdelAll=1;render();},
  mdelallok:()=>{UI.mdelAll=0;const n=mailDel((G.mail||[]).filter(m=>m.read).map(m=>m.id));toast(`Deleted ${n} letters`);render();save();},
  mtake:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.cash+=m.amt;m.done=true;AU.sfx("level");toast(`Received ${fmt(m.amt)}`);save();render();},
  mpay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||G.cash<m.amt)return;G.cash-=m.amt;m.done=true;m.paid=true;AU.sfx("ui");save();render();},
  mskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.rep=Math.max(0,G.rep-.3);m.done=true;save();render();},
  mquiz:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.ok=+d.k===m.ans;if(m.ok){G.cash+=m.amt;AU.sfx("level");}else AU.sfx("miss");save();render();},
  mjdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mjskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;G.cash+=550;G.dust=(G.dust||0)+1;roster(G).forEach(f=>f.morale=clamp(f.morale+3,0,100));AU.sfx("ui");toast("Auntie Taew says thanks: ฿550 · ✦ +1");save();render();},
  mrdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mrplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();const o=runDareRival(m.final);
    BAG.st={phase:"run",mode:"run",practice:true};BAG.mount();
    RUN.pick({race:{canBack:true,label:"Temple-yard race",intro:m.final?"Suea Dam: \"Last time. No holding back!\"":"Suea Dam: \"So you came. Let's go!\"",say:won=>({n:"Suea Dam",t:m.final?(won?"…I give in. Your legs are the real thing. I'm running Yellow at sports day this year — see you on the track.":"Knew it! Suea Dam never loses to boxers three times running."):(won?"Fluke! It won't be this easy next time.":"Like I said, everyone loses to me.")}),note:`${m.final?"Last dare · ":""}${o.name} of Golden Tiger dares you to 100 m · Win = fame +1 and camp morale · Lose = a dent in your runner's morale`,dist:100,
      lanes:me=>[runLane(o,{c:"#e8b62c",eff:.99,react:.13}),runLane(me,{me:true,c:"#e2443c"})],
      cb:res=>{m.done=true;m.won=res.win;const D=G.dare=G.dare||{w:0,l:0,n:0};D.n++;if(res.win)D.w++;else D.l++;D.last=res.win?"W":"L";if(m.final&&res.win)D.done=true;const f=RUN.runner(),out=[];if(res.win){G.rep=(G.rep||0)+1;roster(G).forEach(x=>x.morale=clamp((x.morale||0)+4,0,100));G.dust=(G.dust||0)+3;out.push("Fame +1 · whole camp morale +4 · ✦ +3");G.flags.runDareW=(G.flags.runDareW||0)+1;}
        else if(f&&G.F[f.id]){f.morale=clamp((f.morale||0)-3,0,100);out.push(`Morale ${f.name} -3`);}
        if(f&&G.F[f.id])f.fatigue=Math.min(100,(f.fatigue||0)+5);RUN.st.res.rw=`<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;save();},
      next:()=>BAG.close()}});},
  mjplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();BAG.openMode("somtam",null,m.id);},
  mloan:d=>{ACT.loan();},
  mloanno:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;save();render();toast("Coach Daeng gives a quiet nod");},
  mdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m)return;m.done=true;m.declined=true;if(m.q==="gang"&&G.gang)G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);save();render();},
  macc:d=>{UI.modal={type:"qpick",id:d.v};render();},
  qsend:d=>{const m=G.mail.find(x=>x.id===d.v),f=G.F[d.id];if(!m||m.done||m.expired||!f||f.camp!=="player")return;{const why=qpickWhy(f);if(why){toast(`${f.name} ${why}`);return;}}if(!qpickOK(m,f))return;if(m.q==="belt"&&!m.defend){const D=beltTournament(G,m,d.id);if(!D)return;G.dm=D;m.done=true;UI.modal={type:"dm"};dmAdvance();save();render();return;}if(m.q==="belt"&&m.defend&&beltHolder(G,m.div,m.venue||"tha")?.id!==d.id)return;if(m.q==="belt"&&m.defend&&(!G.F[m.npc]||G.F[m.npc].div!==m.div||G.F[m.npc].injury||isBooked(G,m.npc,G.week))){const nc=beltChallenger(G,m.div,m.defend);if(!nc){toast("The challenger can't fight this week — try again next week");return;}m.npc=nc.id;}m.done=true;UI.modal=null;
    const spec=m.q==="belt"?{q:"belt",npc:m.npc,pay:m.pay,from:m.from,div:m.div,defend:m.defend,venue:m.venue||"tha",bg:STADIUMS[m.venue||"tha"].bg,rounds:5}:m.q==="challenge"?{q:"challenge",npc:m.npc,pay:m.pay,from:m.from}:{q:m.q,qk:m.qk,hq:m.hq,pay:m.pay,from:m.from,rounds:m.qk==="gang5"?4:3};
    const intro=m.q==="gang"&&m.hq?[{n:"nar",t:"The warehouse behind the morning market, dimly lit. Red-helmet goons sit around a table with a map. The moment Sirichai camp walks in, they all jump to their feet."},{n:"npc",who:QK[m.qk].name,t:GANG_HQ_TAUNT[m.qk]||"Finally! No market aunties to cheer for you here."},{n:d.id,f:"angry",l:"fight",t:"Here as promised!"}]
      :m.q==="gang"?[{n:"nar",t:"Morning market… more than ten motorbikes are lined up in front of the vegetable stalls"},{n:"npc",who:QK[m.qk].name,t:m.early?"My boys lost to you again and again. My name's mud! And your camp still owes me. Today I handle you myself!":m.qk==="gang5"?"I hear some fight camp is meddling in my business. Today the big boss came down himself!":m.qk==="gang4"?"My red-helmet boys got chased off by camp kids? This Silver Helmet will teach you some manners.":m.qk==="gang6"?"The boss needn't waste his strength. His right hand can handle this.":"So who chased off my boys? Come on out!"},{n:d.id,f:"angry",l:"fight",t:"Me!"}]
      :m.q==="belt"?[{n:"nar",t:`${STADIUMS[m.venue||"tha"].name}. Spotlights hit the center of the ring as the announcer calls both corners.`},{n:"npc",who:G.F[m.npc].name,t:m.defend?"That belt should be mine. Today I'm taking it back.":"Want the belt? You'll have to get through me first."},{n:d.id,f:"angry",l:"fight",t:m.defend?"Come and take it, then!":"That's exactly why I'm here!"}]
      :m.q==="challenge"?[{n:"nar",t:"The yard behind the fresh market. Crowds on both sides; someone has set up a table taking bets in red soda"},{n:"npc",who:G.F[m.npc].name,t:"So you finally came. I thought you'd run all season"},{n:d.id,f:"angry",l:"fight",t:"I wasn't running, I was busy. Now I'm free!"}]
      :(m.q==="cow"||m.q==="rooster")?runawayIntro(G,m,d.id)
      :[{n:"nar",t:"A small bantam stands on the heavy bag, chest puffed, neck feathers bristling"},{n:"npc",who:"Sia Tong",t:"Don't underestimate him. He once chased every big dog on the street"},{n:d.id,f:"happy",l:"fight",t:"Come on, chicken! I'm not a dog!"}];
    playScene(intro,()=>startQuest(spec,d.id,()=>{}),{bg:m.q==="gang"?(m.hq?"gang_hq":"market_morning"):m.q==="belt"?STADIUMS[m.venue||"tha"].scene:m.q==="challenge"?"food":m.q==="rooster"?"rooster":m.q==="cow"||m.q==="bull"?"farm":"fair",look:"fight"});},
  cashflow:()=>{UI.modal={type:"cashflow"};render();},
  repgraph:()=>{UI.modal={type:"repgraph"};render();},
  calday:d=>{const w=+d.v;if(!(G.cal||[]).some(c=>c.wk===w&&(c.season===(G.season||1)||c.absWeek>=gameWeek(G)-G.week+1))&&!G.bookings.some(b=>b.week===w)&&!calEvents(w).length)return;UI.modal={type:"calday",w};render();},
  rankhelp:()=>{UI.modal={type:"rankhelp"};render();},
  declo:d=>{UI.modal={type:"declo",id:d.v};render();},
  declyes:d=>{const o=G.offers.find(x=>x.id===d.v);if(o){G.offers=G.offers.filter(x=>x.id!==o.id);if(!o.beast&&!o.fair&&!o.lab&&o.status!=="conflict"&&!isBooked(G,o.b)){G.snub=G.snub||{};G.snub[o.b]=(G.snub[o.b]||0)+1;}}UI.modal=null;save();render();},
});
// a quest sprite preview canvas (in letters)
function mountQSprites(){document.querySelectorAll("canvas[data-qsprite]").forEach(cv=>{const x=cv.getContext("2d");const sh=img(cv.dataset.qsprite+"_sheet.webp");
  LOOPS.add(t=>{if(!cv.isConnected)return;x.clearRect(0,0,cv.width,cv.height);const fr=Math.floor(t/200)%4;x.imageSmoothingEnabled=true;drawFrame(x,sh,ROW.guard,fr,cv.width/2,cv.height*.97,cv.height*.95,true);});});startLoops();}

// ---------- news bar: home only, one item at a time, slides through once, then gone ----------
var NEWS={el:null,q:[],i:0,wk:0};
function newsSync(){if(!NEWS)return;const want=G&&!UI.ending&&UI.tab==="home"&&!UI.scene&&!UI.fight&&!UI.montage&&!UI.modal&&UI.spot==null&&UI.newsWeek!==G.week&&!!document.querySelector(".hud");
  if(!want){if(NEWS.el&&G&&UI.tab!=="home"){UI.newsWeek=G.week;}if(NEWS.el){NEWS.el.remove();NEWS.el=null;}document.body.classList.remove("hasnews");return;}
  const hud=document.querySelector(".hud");const top=Math.round(hud.getBoundingClientRect().bottom)+6;
  if(NEWS.el){NEWS.el.style.top=top+"px";document.body.classList.add("hasnews");return;}
  if(NEWS.wk!==G.week){NEWS.wk=G.week;NEWS.q=newsItems().slice(0,3);NEWS.i=0;}if(!NEWS.q.length||NEWS.i>=NEWS.q.length){UI.newsWeek=G.week;return;}
  const el=document.createElement("div");el.className="newsbar";el.setAttribute("role","status");el.style.top=top+"px";
  el.innerHTML=`<b class="nlab">Fight news</b><div class="ntrack"><span class="ncr"></span></div><button class="nclose" aria-label="Close news">×</button>`;document.body.appendChild(el);NEWS.el=el;document.body.classList.add("hasnews");
  el.querySelector(".nclose").onclick=()=>{UI.newsWeek=G.week;el.classList.add("out");setTimeout(()=>{el.remove();if(NEWS.el===el)NEWS.el=null;document.body.classList.remove("hasnews");},300);};
  const show=()=>{if(!el.isConnected)return;if(NEWS.i>=NEWS.q.length){UI.newsWeek=G.week;el.classList.add("out");setTimeout(()=>{el.remove();if(NEWS.el===el)NEWS.el=null;document.body.classList.remove("hasnews");},400);return;}
    const sp=el.querySelector(".ncr");const t=NEWS.q[NEWS.i];sp.textContent=t;sp.style.animation="none";void sp.offsetWidth;
    const reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;const dur=reduce?4:Math.min(16,Math.max(7,t.length/6));sp.style.animation=reduce?"none":`ncr ${dur}s linear 1 forwards`;
    clearTimeout(NEWS.tm);NEWS.tm=setTimeout(()=>{NEWS.i++;show();},dur*1000);};show();}

// ---------- rivals answer a loss: one scene each, then the surge shows up in their growth ----------
EVENTS.push(
 {id:"ploy_surge",look:"fight",bg:"night",when:G=>G.flags&&G.flags.beat_ploy>=1&&G.F.ploy.camp==="rival",steps:[
  {n:"nar",t:"Eleven at night. All the lights at Golden Tiger are off except in one gym"},
  {n:"nar",t:"The heavy bag has thudded at the same rhythm for three hours, not slowing one bit"},
  {n:"ploy",f:"sad",t:"…So this is how losing hurts. It's been so long I'd forgotten"},
  {n:"ploy",f:"angry",t:"Thank you, Kati. From tonight I'm no longer a prodigy. I'll be the hardest-training fighter in the province"},
  {n:"coach",t:"(word from inside the scene) Ploy asked the boss to let her sleep at the camp, training three times a day… this final won't be easy"},
  {fx:G=>{G.F.ploy.morale=Math.min(100,G.F.ploy.morale+20);}}]},
 {id:"fah_surge",look:"fight",bg:"night",when:G=>G.flags&&G.flags.beat_fah>=1&&G.F.fah.camp==="rival",steps:[
  {n:"nar",t:"Five a.m., the hill path behind Golden Tiger. A figure runs up and down for the tenth time"},
  {n:"fah",f:"angry",t:"Hngh… one more! Who said stop! Fah didn't lose because Fah's weak, Fah lost because Fah was lazy!"},
  {n:"fah",f:"sad",t:"…Next time we meet, she won't land a single punch. Just watch"},
  {n:"coach",t:"Word is Fah's a different person now, up before everyone at Golden Tiger. Watch out"}]},
 {id:"ploy_surge2",look:"fight",bg:"final",when:G=>G.flags&&G.flags.beat_ploy>=2&&G.F.ploy.camp==="rival",steps:[
  {n:"ploy",f:"angry",t:"That's twice now… the third time will be the final, and I won't leave anything to regret"},
  {n:"kati",f:"angry",t:"Me too! This time I'll beat Ploy on the day she's at her best!"}]});

// =====================================================================================
// v1.36 DEATH MATCH — a special 8-fighter knockout offer every ~10 weeks, all divisions mixed,
// fought back to back the same week. The player runs every one of the camp's fights.
// =====================================================================================
const DM_WEEKS=[6,10,14,18,22,26,30,34,38,42,46,50];
const DM_PRIZE=[0,3000,8000,18000,40000];   // by how far our best fighter got: out in QF / SF / final / champion
const DM_STAGE=["Quarterfinal","Semifinal","Final"];
const dmOfferOn=G=>!(G.dm&&!G.dm.done)&&DM_WEEKS.includes(G.week)&&!(G.dmSeenSeason===(G.season||1)&&(G.dmSeen||{})[G.week])&&!G.ended;
const dmMine=id=>G.F[id]&&G.F[id].camp==="player";
const dmCanEnter=f=>!!f&&f.camp==="player"&&!f.injury&&!isBooked(G,f.id,G.week);
function dmBuild(G,mine){mine=[...new Set(mine)].filter(id=>G.F[id]&&G.F[id].camp==="player"&&!G.F[id].injury&&!isBooked(G,id,G.week)).slice(0,3);if(!mine.length)return null;const pool=Object.values(G.F).filter(f=>!mine.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&f.div!=="X"&&!isBooked(G,f.id,G.week));
  const avg=mine.reduce((s,id)=>s+ovr(G.F[id].a),0)/mine.length;
  const stars=["ploy","fah"].filter(id=>pool.some(f=>f.id===id));
  const rest=pool.filter(f=>!stars.includes(f.id)).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);
  let others=[...stars,...rest].slice(0,8-mine.length);

  const slots=Array(8).fill(null);[0,4,2,6].slice(0,mine.length).forEach((p,i)=>slots[p]=mine[i]);
  const order=[7,3,5,1,6,2,4,0].filter(p=>!slots[p]);others.forEach((id,i)=>slots[order[i]]=id);
  return {wk:G.week,absWeek:gameWeek(G),slots,w:[[],[],[]],r:0,mine:[...mine],out:{},done:false};}
const dmList=D=>D.r===0?D.slots:D.w[D.r-1];
function dmWinFrom(F){const r=F.result;if(r.win==="A"||r.win==="B")return r.win;const s=F.cards.reduce((x,c)=>x+c[0]-c[1],0);return s>0?"A":s<0?"B":(F.A.landed>=F.B.landed?"A":"B");}
// play every match until it is one of ours, then stop and let the player fight it
function dmAdvance(){const D=G.dm;if(!D||D.done)return;
  while(D.r<3){const L=dmList(D);const m=D.w[D.r].length;if(m*2>=L.length){D.r++;if(D.r<3)for(const id of D.w[D.r-1])if(dmMine(id))G.F[id].fatigue=Math.max(0,G.F[id].fatigue-6);continue;}
    const a=L[m*2],b=L[m*2+1];
    if(!G.F[a]||!G.F[b]){D.w[D.r].push(G.F[a]?a:G.F[b]?b:a);continue;}/* bye */
    if(dmMine(a)||dmMine(b)){save();return;}
    const F=quickFight(G.F[a],G.F[b],(G.seed^(G.week*313))+D.r*17+m,3);D.w[D.r].push(dmWinFrom(F)==="A"?a:b);}
  D.done=true;dmFinish();}
function dmNextMatch(){const D=G.dm;if(!D||D.done||D.r>=3)return null;const L=dmList(D),m=D.w[D.r].length;return [L[m*2],L[m*2+1]];}
function dmFight(meId,opId){const D=G.dm;if(!D||D.done)return;const next=dmNextMatch();if(!next||!next.includes(meId)||!next.includes(opId)||!dmMine(meId))return;if(!G.F[opId]){D.w[D.r].push(meId);dmAdvance();UI.modal={type:"dm"};save();render();return;}const b={id:"dm"+G.week+"_"+D.r+"_"+meId,a:meId,b:opId,week:G.week,tier:"dm",rounds:D.belt?5:3,win:0,lose:0,dm:1,title:D.belt?STADIUMS[D.belt.venue].name+" · "+D.belt.div:null,bg:D.belt?STADIUMS[D.belt.venue].bg:"bg_hall.webp"};
  UI.modal=null;openFight(b,()=>{const w=b.result;const winner=w==="A"?meId:opId,loser=w==="A"?opId:meId;D.w[D.r].push(winner);if(dmMine(loser))D.out[loser]=D.r+1;
    dmAdvance();UI.modal={type:"dm"};save();render();});}
function dmFinish(){const D=G.dm;if(!D||D.paid)return;const champ=D.w[2][0];if(!champ||!G.F[champ]){D.done=true;D.paid=true;D.prize=0;save();return;}D.champ=champ;D.paid=true;if(D.belt){beltTournamentFinish(D);return;}
  let best=0;for(const id of D.mine){const lv=id===champ?4:(D.out[id]||1);best=Math.max(best,lv);}D.best=best;
  const prize=DM_PRIZE[best]||0;G.cash+=prize;G.wkFight=(G.wkFight||0)+prize;D.prize=prize;
  if(best===4){G.rep+=4;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+10));recordHonor(G,"dm",champ,G.F[champ].div,D.wk,null,null,D.w[1].find(id=>id!==champ));}else if(best===3)G.rep+=1.5;
  G.dmLog=(G.dmLog||[]).concat([{wk:D.wk,champ,best,prize}]);save();}
function dmBracketHTML(){const D=G.dm;if(!D)return "";if(D.belt)return beltBracketHTML(D);const nm=id=>id&&G.F[id]?esc(G.F[id].name):"…";
  const cell=(id,r)=>{if(!id||!G.F[id])return `<div class="dmc tbd">…</div>`;const won=(D.w[r]||[]).includes(id),lost=r<3&&D.w[r]&&D.w[r].length*2>((r===0?D.slots:D.w[r-1]).indexOf(id))&&!won;
    return `<div class="dmc ${dmMine(id)?"mine":""} ${won?"won":""} ${lost?"lost":""}">${G.F[id].canon?`<img src="${faceSrc(id,"happy")}" alt="">`:""}<b>${nm(id)}</b><small>${G.F[id].div==="A"?"Div A":"Div B"}</small></div>`;};
  const col=(L,r,title)=>`<div class="dmcol"><h4>${title}</h4>${Array.from({length:L.length/2},(_,i)=>`<div class="dmm">${cell(L[i*2],r)}${cell(L[i*2+1],r)}</div>`).join("")}</div>`;
  const pad=(L,n)=>[...L.slice(0,n),...Array(Math.max(0,n-L.length)).fill(null)];
  const nx=dmNextMatch();let foot="";
  if(D.done){const lab=["","out in the last 8","out in the semis","finished runner-up","champion!"][D.best];
    foot=`<div class="dmend ${D.best===4?"champ":""}"><b>${D.best===4?`🏆 ${nm(D.champ)} wins the Death Match!`:`Champion: ${nm(D.champ)} · our camp ${lab}`}</b><span>Prize ${fmt(D.prize||0)}${D.best===4?" · Fame +4 · whole camp morale +10":D.best===3?" · Fame +1.5":""}</span></div><button class="btn primary big" data-act="dmclose">Back to camp</button>`;}
  else if(nx){const [a,b]=nx;const both=dmMine(a)&&dmMine(b);
    foot=both?`<p class="meta center">Our own fighters meet! Choose who to control; Coach Daeng corners the other</p><div class="row2"><button class="btn gold" data-act="dmgo" data-id="${a}" data-v="${b}">Control ${nm(a)}</button><button class="btn gold" data-act="dmgo" data-id="${b}" data-v="${a}">Control ${nm(b)}</button></div>`
      :`<button class="btn primary big" data-act="dmgo" data-id="${dmMine(a)?a:b}" data-v="${dmMine(a)?b:a}">Fight! ${nm(dmMine(a)?a:b)} vs ${nm(dmMine(a)?b:a)} ▸</button><p class="meta center">${DM_STAGE[D.r]} · energy lost carries into the next round</p>`;}
  return `<h2>Death Match</h2><p class="meta">8 fighters, all divisions, knockout · not ranked · all fought this week</p>
   <div class="dmb">${col(D.slots,0,"Last 8")}${col(pad(D.w[0],4),1,"Semis")}${col(pad(D.w[1],2),2,"Final")}<div class="dmcol"><h4>Champ</h4><div class="dmm">${D.w[2][0]?cell(D.w[2][0],3):'<div class="dmc tbd">?</div>'}</div></div></div>${foot}`;}
function dmPickHTML(){const R=roster(G);const sel=UI.dmSel||[];
  return `<h2>Death Match</h2><p class="meta">The promoter gathers 8 strong fighters from every division, knockout, all in one day. Who will ${"Sirichai"} Camp send? (up to 3)</p>
   <div class="dmprize"><span>Out in first round ${fmt(DM_PRIZE[1])}</span><span>Out in semis ${fmt(DM_PRIZE[2])}</span><span>Runner-up ${fmt(DM_PRIZE[3])}</span><b>Champion ${fmt(DM_PRIZE[4])}</b></div>
   <div class="list">${R.map(f=>`<button class="dmpick ${sel.includes(f.id)?"on":""}" data-act="dmsel" data-id="${f.id}" ${dmCanEnter(f)?"":"disabled"}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?"Injured":isBooked(G,f.id,G.week)?"has a bout this week":`Fatigue ${Math.round(f.fatigue)} · morale ${Math.round(f.morale)}`}</small></span><i>${sel.includes(f.id)?"✓":""}</i></button>`).join("")}</div>
   <div class="row2"><button class="btn" data-act="dmno">Skip</button><button class="btn primary" data-act="dmstart" ${sel.length?"":"disabled"}>Enter: ${sel.length} ▸</button></div>`;}
function dmCardHTML(){if(G.dm&&!G.dm.done&&G.dm.belt)return `<section class="px card dmcard"><b>${STADIUMS[G.dm.belt.venue].name} · ${G.dm.belt.div}</b><button class="btn primary" data-act="dmopen">▸</button></section>`;if(G.dm&&!G.dm.done&&G.dm.wk===G.week)return `<section class="px card dmcard"><div><b>Death Match in progress</b><span class="meta">${DM_STAGE[Math.min(2,G.dm.r)]}</span></div><button class="btn primary" data-act="dmopen">Continue ▸</button></section>`;
  if(!dmOfferOn(G))return "";return `<section class="px card dmcard"><span class="ribbon">Special offer</span><div><b>8-fighter cross-division Death Match</b><span class="meta">All fought this week · not ranked · champion ${fmt(DM_PRIZE[4])}</span></div><button class="btn gold" data-act="dmpick">Details</button></section>`;}
Object.assign(ACT,{
  dmpick:()=>{UI.dmSel=roster(G).filter(dmCanEnter).slice(0,1).map(f=>f.id);UI.modal={type:"dmpick"};render();},
  dmsel:d=>{const s=UI.dmSel||[];UI.dmSel=s.includes(d.id)?s.filter(x=>x!==d.id):s.length<3?[...s,d.id]:s;render();},
  dmno:()=>{if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;UI.modal=null;save();render();},
  dmstart:()=>{const sel=(UI.dmSel||[]).filter(id=>dmMine(id)&&dmCanEnter(G.F[id]));if(!sel.length)return;if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;
    G.dm=dmBuild(G,sel);UI.modal=null;save();
    playScene([{n:"npc",who:"Ring announcer",img:"caster_shout",t:vary("dm1",["Ladies and gentlemen! Tonight there is no tomorrow! Eight fighters from every division, fighting until one is left! DEATH MATCH!!","We're back! The fight with no rest! Eight go in, one comes out! DEATH MATCH!!","If you're tired, go home now! Tonight we fight straight through to a champion! DEATH MATCH!!","The tent's packed so tight it might burst! Eight of the best women fighters from every division, the Death Match is here!!"])},
      {n:"coach",t:G=>`${ME(G)}, listen. Win and you fight again right away. The energy you spend won't come back in time. Don't waste it in the early rounds`},
      {n:sel[0],f:"angry",l:"fight",t:"Everyone here is strong… but our camp came to win!"}],()=>{dmAdvance();UI.modal={type:"dm"};render();},{bg:"hall",look:"fight"});},
  dmopen:()=>{dmAdvance();UI.modal={type:"dm"};render();},
  dmgo:d=>dmFight(d.id,d.v),
  dmclose:()=>{UI.modal=null;playHonorQueue(()=>render());},
});

// ===== v1.64: MINIGAME — kick the heavy bag to the khong khaek drum (rhythm, taiko-style) =====
// self-contained overlay: its own DOM + animation loop, so the main render() never touches it mid-song
const BAG_DIFF={easy:{name:"Easy",bpm:92,bars:8,dens:0,mul:1},normal:{name:"Normal",bpm:108,bars:10,dens:1,mul:1.25},hard:{name:"It is",bpm:124,bars:12,dens:2,mul:1.6}};
const BAG_PAT=[["L...L...","L...R...","R...R...","L.L.R...","L...R.R.","R...L..."],["L.R.L.R.","LLR.L...","L.RRL...","R.L.R.L.","L.L.RR.."],["LRLRL.R.","L.LRR.L.","RRL.RRL.","LLRRL.R.","LRRLLRR."]];
const BAG_WIN={perfect:.06,great:.12,ok:.19};
function bagChart(G,dk,salt=0,song=null){const D0=BAG_DIFF[dk],D=song?{...D0,bpm:song.bpm,bars:song.bars}:D0,beat=60/D.bpm,half=beat/2,N=[];let t=4*beat;/* one bar of count-in */
  const R=song?mulberry32(song.seed*7919):null;
  for(let b=0;b<D.bars;b++){const pool=[].concat(...BAG_PAT.slice(0,D.dens+1));const p=b===D.bars-1?"L.......":pool[Math.floor((R?R():srand(G,700+salt+b*13+D.dens*101+G.week))*pool.length)];
    for(let i=0;i<8;i++){if(p[i]!==".")N.push({t:t+i*half,k:p[i],j:null});}t+=4*beat;}
  return {notes:N,end:t+beat,beat};}
/* v1.91.188 (Man: the bag drill and the somtam stall need new songs — easy/normal/hard, 3–4 each, own backgrounds, rotating, a best score per song to chase).
   Nine songs, each a fixed chart (same notes every time, so a score means something) and its own backing track synthesised in the browser:
   a phin/pi lead in a Thai pentatonic, a bass line, ching on the beat, klong accents — slow and airy on easy, driving with arpeggios on hard. */
const BAG_SONGS=[
 {id:"ping",dk:"easy",n:"Cool Breeze on the Ping",sub:"A slow tune by the river at dawn",bpm:88,bars:8,bg:"bg_river_dawn.webp",root:62,prog:[0,4,5,3],seed:11,lead:"triangle",col:"#7fd4ff"},
 {id:"talat",dk:"easy",n:"Holy-Day Morning Market",sub:"The vendor sings while making change",bpm:96,bars:8,bg:"bg_market_morning.webp",root:60,prog:[0,5,3,4],seed:23,lead:"square",col:"#ffd36a"},
 {id:"waikru",dk:"easy",n:"Wai Kru Mid-Morning",sub:"The pi chawa leads, the klong khaek follows",bpm:92,bars:8,bg:"bg_camp_day.webp",root:57,prog:[0,3,0,4],seed:37,lead:"square",col:"#ffb3c8"},
 {id:"ngarnwat",dk:"normal",n:"Temple Fair Klong Khaek",sub:"A ring in the middle of a full-moon temple fair",bpm:108,bars:10,bg:"bg_fair.webp",root:62,prog:[0,4,5,4],seed:41,lead:"square",col:"#ff8a5a"},
 {id:"samlor",dk:"normal",n:"Samlor Rush on Walking Street",sub:"Street lights, roadside stalls, cool wind",bpm:114,bars:10,bg:"bg_night_north.webp",root:59,prog:[0,5,3,4],seed:53,lead:"square",col:"#c89bff"},
 {id:"fontok",dk:"normal",n:"Rain at Camp",sub:"Training under a tin roof",bpm:110,bars:10,bg:"bg_camp_rain.webp",root:57,prog:[0,3,4,0],seed:67,lead:"triangle",col:"#7ab4ff"},
 {id:"songkran",dk:"hard",n:"Songkran, No Mercy",sub:"Water guns, bass and chalk paste",bpm:126,bars:12,bg:"bg_songkran.webp",root:62,prog:[0,4,5,3],seed:71,lead:"square",col:"#5ad8ff"},
 {id:"loy",dk:"hard",n:"Loy Krathong Drum Roll",sub:"Lanterns fill the sky, the drums won't stop",bpm:132,bars:12,bg:"bg_loy_night.webp",root:60,prog:[0,5,3,4],seed:83,lead:"square",col:"#ffcf5a"},
 {id:"final",dk:"hard",n:"Title Night",sub:"The whole arena cheering · final round",bpm:140,bars:12,bg:"bg_final.webp",root:57,prog:[0,4,3,4],seed:97,lead:"sawtooth",col:"#ff5a6a"}];
const BAG_SCALE=[0,2,4,7,9];
function songsOf(dk){return BAG_SONGS.filter(x=>x.dk===dk);}
function songBest(G,mode,id){return ((G.mini||{}).song||{})[mode+":"+id]||null;}
/* the song of the week: rotates through each difficulty so there is always a "new" one to try */
function songPickDefault(G,dk){const L=songsOf(dk);return L[((G.week||1)+(G.season||1)*3)%L.length];}
const MG_MODES={
 bag:{icon:"🥁",title:"Bag Kicks to the Khong Khaek Drum",L:"Dum",R:"Tek",Ls:"Kick",Rs:"Punch",note:"Kick/punch rhythm training · stats, morale, stardust",open:G=>G.week>=2},
 somtam:{icon:"🥗",title:"Som Tam at Auntie Taew's",L:"Pound",R:"Toss",Ls:"Pestle",Rs:"Spoon",note:"Help Auntie Taew's stall at rush hour · earn pay and a little fame",open:G=>G.week>=4}};
const MG_ACT={bag:"drum",somtam:"somtam",live:"live"};
function mgPlayed(G,m){return !!G.campUsed;}/* v1.68: a minigame is the week's camp activity — once one is used, replays are practice */
function bagPlayed(G){return mgPlayed(G,"bag");}
function mgChipText(G){return Object.entries(MG_MODES).filter(([k,M])=>M.open(G)).map(([k,M])=>M.icon+(mgPlayed(G,k)?"✓":"")).join(" ");}
function bagFighters(G){return roster(G).filter(f=>f.camp==="player"&&!f.injury);}
const BAG={st:null,
  clock(){return AU.ctx?AU.ctx.currentTime:performance.now()/1000;},
  drum(k,t){if(!AU.ctx||AU.muted)return;try{if(k==="L"){AU.tone(t,{f:150,to:55,type:"sine",dur:.28,peak:.9,bus:AU.sfxBus});AU.noiseHit(t,{f:420,dur:.08,peak:.5});}
    else{AU.noiseHit(t,{f:2600,type:"bandpass",q:2.2,dur:.07,peak:.7});AU.tone(t,{f:340,to:300,type:"triangle",dur:.09,peak:.35,bus:AU.sfxBus});}}catch(e){}},
  wood(k,t){if(!AU.ctx||AU.muted)return;try{if(k==="L"){AU.noiseHit(t,{f:700,dur:.06,peak:.8});AU.tone(t,{f:240,to:120,type:"triangle",dur:.12,peak:.6,bus:AU.sfxBus});}
    else{AU.noiseHit(t,{f:5200,type:"highpass",q:.7,dur:.09,peak:.35,sweep:.6});}}catch(e){}},
  ching(t,open){if(!AU.ctx||AU.muted)return;try{AU.tone(t,{f:open?2350:2100,type:"sine",dur:open?.5:.08,peak:open?.16:.12,bus:AU.sfxBus});AU.tone(t,{f:open?3130:2900,type:"sine",dur:open?.35:.06,peak:.07,bus:AU.sfxBus});}catch(e){}},
  /* backing track for a song, scheduled up front on its own bus so it can be cut when the drill ends */
  music(song,t0,beat,bars){if(!AU.ctx||AU.muted)return;try{const c=AU.ctx,bus=c.createGain();bus.gain.value=.8;bus.connect(AU.sfxBus);this.st.bus=bus;
    const R=mulberry32(song.seed),dk=song.dk,hz=m=>440*Math.pow(2,(m-69)/12),sc=d=>song.root+12+BAG_SCALE[((d%5)+5)%5]+12*Math.floor(d/5);
    const T=(t,o)=>AU.tone(t,{...o,bus});
    /* a 2-bar motif from the song's seed, answered by a variation — the tune repeats so it is learnable */
    const mot=[];let d=4;for(let i=0;i<16;i++){const rest=R()<(dk==="easy"?.4:dk==="normal"?.28:.18);if(rest){mot.push(null);continue;}d=Math.max(0,Math.min(9,d+[-2,-1,-1,0,1,1,2][Math.floor(R()*7)]));mot.push(d);}
    const var2=mot.map((x,i)=>x==null?null:i>=12?Math.max(0,x-((i%2)+1)):x);
    for(let b=0;b<bars+1;b++){const bt=t0+b*4*beat,ch=song.prog[b%song.prog.length],rootHz=hz(song.root-12+BAG_SCALE[ch%5]+(ch>=5?12:0));
      for(let q=0;q<4;q++){const tq=bt+q*beat;
        T(tq,{f:q%2?2100:2350,type:"sine",dur:q%2?.08:.4,peak:q%2?.1:.13});
        if(b>0){T(tq,{f:rootHz,type:"triangle",dur:beat*.45,peak:.32});T(tq+beat/2,{f:rootHz*2,type:"triangle",dur:beat*.35,peak:.2});
          if(q===0||q===2)T(tq,{f:120,to:50,type:"sine",dur:.18,peak:.28});
          if(dk!=="easy"&&q===3)AU.noiseHit(tq+beat/2,{f:1800,type:"bandpass",q:1.5,dur:.05,peak:.18,bus});
          if(dk==="hard")for(let k=0;k<4;k++)T(tq+k*beat/4,{f:rootHz*[2,3,4,3][k],type:"square",dur:beat/4*.8,peak:.035});}}
      if(b>=1&&b<bars){const M=(b%4===3)?var2:mot;const half=beat/2;for(let i=0;i<8;i++){const n=M[(b%2)*8+i];if(n==null)continue;const tt=bt+i*half;
        T(tt,{f:hz(sc(n)),type:song.lead,dur:half*(i%2?0.8:1.4),peak:song.lead==="triangle"?.22:.09});}}}
    /* last hit */const te=t0+bars*4*beat;T(te,{f:hz(song.root),type:"triangle",dur:1.2,peak:.3});T(te,{f:2350,type:"sine",dur:.8,peak:.16});}catch(e){}},
  /* v1.91.188 live calls: Auntie Taew at the stall (with a rival stall across the lane racing for customers), Kru Daeng at the bag */
  say(t){const e=document.getElementById("mbcomt");if(!e||e.textContent===t)return;e.textContent=t;const b=document.getElementById("mbcom");if(b){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");}},
  calls(t){const S=this.st;if(S.duel)return;const tam=S.mode==="somtam",P=tam?"Auntie Taew: ":"Kru Daeng: ",F=S.cf=S.cf||{},once=(k,x)=>{if(!F[k]){F[k]=1;this.say(P+x);}};
    const pass=S.notes.filter(n=>n.t<t).length,tot=S.notes.length;
    if(tam){S.rival=pass*72;const me=Math.floor(S.score/220),op=Math.floor(S.rival/220),a=document.getElementById("tamme"),b=document.getElementById("tamop"),u=document.querySelector("#tambar u");
      if(a)a.textContent=me;if(b)b.textContent=op;if(u)u.style.width=Math.round(100*(S.score+200)/(S.score+S.rival+400))+"%";
      const lead=S.score>=S.rival?1:-1;if(pass>6&&S.lead&&lead!==S.lead&&t-(S.leadT||0)>2.5){S.leadT=t;this.say(P+(lead>0?"The customers came over to us! Jae Pla looks sour":"Jae Pla is stealing our queue! Faster, dear!"));}S.lead=lead;}
    if(S.combo>=10)once("c10",tam?"Hands are warm! The whole market can hear that mortar":"Good! You've found the beat, don't lose it");
    if(S.combo>=20)once("c20",tam?"Twenty mortars, no misses! The queue is down the street":"Twenty in a row! Those are a fighter's legs");
    S.mstreak=S.lastMiss!==S.c.miss?(S.mstreak||0)+(S.c.miss-(S.lastMiss||0)):S.mstreak;S.lastMiss=S.c.miss;
    if(S.c.miss>0&&S.combo===0&&S.mstreak>=3&&t-(S.missT||0)>3){S.missT=t;S.mstreak=0;this.say(P+(tam?"Easy, dear, the papaya is flying out of the mortar":"Lost it! Listen to the ching, count from one"));}
    if(S.combo>0)S.mstreak=0;
    if(pass>=tot/2)once("half",tam?"Halfway. Customers keep coming":"Halfway there. Keep those legs going");
    if(tot-pass<=8&&pass>8)once("last",tam?"Last plate! Pound it with everything!":"Last set! Empty the tank!");},
  stopMusic(){const S=this.st;if(S&&S.bus){try{const g=S.bus;g.gain.setTargetAtTime(0,AU.ctx.currentTime,.05);setTimeout(()=>{try{g.disconnect()}catch(_){}},400);}catch(e){}S.bus=null;}},
  open(){const F=bagFighters(G);if(!F.length){toast("No fighter is fit to train");return;}
    const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"hub",mode:"bag",id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();this.draw();},
  openMode(m,act,mail){const F=bagFighters(G);if(!F.length){toast("No fighter is fit to train");return;}const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"pick",mode:m,act,mail,id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();if(m==="live"){LIVE.pick();LIVE.st.practice=false;LIVE.st.act=act;LIVE.draw();}else if(m==="run"){RUN.pick();RUN.st.practice=false;RUN.st.act=act;RUN.draw();}else this.draw();},
  mount(){let el=document.getElementById("minibag");if(!el){el=document.createElement("div");el.id="minibag";el.className="mgame";document.body.appendChild(el);}
    el.onclick=e=>{const lv=e.target.closest("[data-lv]");if(lv&&typeof LIVE!=="undefined"){LIVE.act(lv.dataset.lv,lv.dataset.v);return;}const rn=e.target.closest("[data-rn]");if(rn&&typeof RUN!=="undefined"){if(rn.dataset.rn!=="L"&&rn.dataset.rn!=="R")RUN.act(rn.dataset.rn,rn.dataset.v);return;}const sp=e.target.closest("[data-sp]");if(sp&&typeof SPORTS!=="undefined"){SPORTS.act(sp.dataset.sp);return;}const du=e.target.closest("[data-du]");if(du&&typeof DUEL!=="undefined"){DUEL.act(du.dataset.du,du.dataset.v);return;}const b=e.target.closest("[data-mb]");if(!b)return;const a=b.dataset.mb,v=b.dataset.v;
      if(a==="mode"&&MG_MODES[v]&&MG_MODES[v].custom){this.st.mode=v;if(v==="run")RUN.pick();else LIVE.pick();}else if(a==="mode"){this.st.mode=v;this.st.phase="pick";this.st.practice=mgPlayed(G,v);this.draw();}else if(a==="hub"){this.st.phase="hub";this.draw();}else if(a==="pick"){this.st.id=v;this.draw();}else if(a==="dk"){this.st.dk=v;this.st.song=null;this.draw();}else if(a==="song"){const sg=BAG_SONGS.find(x=>x.id===v);if(sg){this.st.song=v;this.st.dk=sg.dk;}this.draw();}else if(a==="go")this.start();else if(a==="close")this.close();else if(a==="claim")this.claim();else if(a==="again"){this.st.phase="pick";this.st.practice=true;this.draw();}};
    if(!this.keyH){this.keyH=e=>{if(!e.repeat&&typeof TUG!=="undefined"&&TUG.st&&!TUG.st.done){const k=e.key.toLowerCase();if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();TUG.tap();return;}if(k==="j"||k==="k"||k==="arrowright"||k===" "){e.preventDefault();TUG.heave();return;}}if(!e.repeat&&typeof RELAY!=="undefined"&&RELAY.st&&(e.key===" "||/^[jk]$/i.test(e.key)||e.key==="ArrowRight")){e.preventDefault();RELAY.pass();return;}if(typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"&&/^[123]$/.test(e.key)){const d=LIVE.st.cur;if(d){e.preventDefault();LIVE.answer(d.ord[+e.key-1]);}return;}if(typeof RUN!=="undefined"&&RUN.st&&(RUN.st.phase==="race"||RUN.st.phase==="set")){const k=e.key.toLowerCase();if(e.repeat)return;if(k==="enter"||k==="arrowup"){e.preventDefault();RUN.pass();return;}if(k==="f"||k==="d"||k==="arrowleft"||k==="j"||k==="k"||k==="arrowright"||k===" "){e.preventDefault();RUN.tap("L");}return;}
      if(!this.st||this.st.phase!=="play")return;const k=e.key.toLowerCase();if(e.repeat)return;
      if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();this.hit("L");}else if(k==="j"||k==="k"||k==="arrowright"){e.preventDefault();this.hit("R");}else if(k==="escape")this.close();};
      document.addEventListener("keydown",this.keyH);
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"){LIVE.st.dur=0;}if(document.hidden&&this.st&&this.st.phase==="play"){this.stopMusic();this.st.phase="abort";cancelAnimationFrame(this.raf);this.draw();}if(document.hidden&&typeof RUN!=="undefined"&&RUN.st&&(RUN.st.phase==="race"||RUN.st.phase==="set")){RUN.stop();RUN.st.phase="pick";RUN.draw();}});}},
  close(){cancelAnimationFrame(this.raf);this.stopMusic&&this.stopMusic();if(typeof LIVE!=="undefined"&&LIVE.st){cancelAnimationFrame(LIVE.raf);LIVE.st=null;}if(typeof SPORTS!=="undefined"&&SPORTS.st){SPORTS.close();return;}if(typeof RUN!=="undefined"&&RUN.st){RUN.stop();RUN.st=null;}const dz=typeof DUEL!=="undefined"&&DUEL.st;if(dz){DUEL.abort();}const el=document.getElementById("minibag");if(el)el.remove();this.st=null;try{AU.startMusic("hub");}catch(e){}if((G.cardPend||[]).length&&!UI.modal)UI.modal={type:"cardnew"};render();},
  draw(){const S=this.st,el=document.getElementById("minibag");if(!S||!el)return;if(S.phase==="live")return LIVE.draw();if(S.phase==="run")return RUN.draw();if(S.phase==="duel"&&typeof DUEL!=="undefined")return DUEL.draw();if(S.phase==="sports"&&typeof SPORTS!=="undefined")return SPORTS.draw();const F=bagFighters(G),f=G.F[S.id];
    const M=MG_MODES[S.mode];
    if(S.phase==="hub"){el.innerHTML=`<div class="mbox px"><h2>${JOY_PX} Minigames</h2><p class="meta center">Each game gives a reward once a week · replay as practice anytime</p>
       <div class="mghub">${Object.entries(MG_MODES).map(([k,X])=>{const op=X.open(G),pl=mgPlayed(G,k);return `<button class="mgitem ${pl?"done":""}" data-mb="mode" data-v="${k}" ${op?"":"disabled"}><span class="mi">${X.icon}</span><span><b>${X.title}</b><small>${op?(pl?"Reward claimed this week ✓":X.note):"Not open yet"}</small></span><span class="chev">▸</span></button>`;}).join("")}</div>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Back to camp</button></div></div>`;return;}
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{})[S.mode]||{};
      el.innerHTML=`<div class="mbox px"><h2>${M.icon} ${M.title}</h2>
       <p class="meta">Hit when a note reaches the circle · <b class="mbL">${M.L}</b> = ${M.Ls} (left button / F) · <b class="mbR">${M.R}</b> = ${M.Rs} (right button / J)</p>
       <div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-mb="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <div class="sgtabs">${Object.entries(BAG_DIFF).map(([k,d])=>`<button class="${k===S.dk?"on":""}" data-mb="dk" data-v="${k}">${d.name}</button>`).join("")}</div>
       <div class="songs">${songsOf(S.dk).map(x=>{const b=songBest(G,S.mode,x.id),on=(S.song||songPickDefault(G,S.dk).id)===x.id,rec=songPickDefault(G,S.dk).id===x.id;
         return `<button class="songc ${on?"on":""}" data-mb="song" data-v="${x.id}" style="--bg:url(a/${x.bg});--sc:${x.col}"><span class="sgt"><b>${esc(x.n)}</b><small>${esc(x.sub)}</small><em>${x.bpm} BPM${rec?` · <i>Song of the week</i>`:""}</em></span>
           <span class="sgb">${b?`<b class="g${b.g}">${b.g}</b><small>${b.s.toLocaleString()}</small>${b.fc?`<i>FC</i>`:""}`:`<small>Not played yet</small>`}</span></button>`;}).join("")}</div>
       <p class="meta center">${S.card?(S.practice?"Card minigame · practise as often as you like":"Card minigame · your first clear earns stardust ✦ by grade"):S.practice?"Already played this week · this run is practice, no rewards":S.mode==="bag"?"Weekly reward: kick/punch · morale · stardust ✦ · an S unlocks a card":"Weekly reward: pay from Auntie Taew · fame · stardust ✦ · an S unlocks a card"}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Later</button><button class="btn primary" data-mb="go">Start! ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mplay"><div class="mhud"><b>${esc(f.name)}</b><span>Combo <b id="mbc">0</b></span><span>Score <b id="mbs">0</b></span><button class="xbtn" data-mb="close" aria-label="Exit">✕</button></div>
       ${S.songObj?`<div class="mbsong" style="--sc:${S.songObj.col}"><b>${esc(S.songObj.n)}</b><small>${BAG_DIFF[S.songObj.dk].name} · ${S.songObj.bpm} BPM</small></div>`:""}
       ${S.mode==="somtam"&&!S.duel?`<div class="tamvs"><span class="me">Auntie Taew <b id="tamme">0</b> plates</span><i id="tambar"><u style="width:50%"></u></i><span class="op"><b id="tamop">0</b> plates Jae Pla</span></div>`:""}
       <canvas id="mbcv" width="360" height="300"></canvas>
       ${S.duel?"":`<div class="rncom" id="mbcom"><img src="${S.mode==="somtam"?"a/npc_vendor_red.webp":faceSrc("coach")}" alt="" class="${S.mode==="somtam"?"tall":""}"><span id="mbcomt">${S.mode==="somtam"?"Auntie Taew: Customers are here! Keep up, dear":"Kru Daeng: Listen to the drum, then kick with it"}</span></div>`}
       <div class="mbtns"><button class="mbtn L ${S.mode}" id="mbL"><b>${M.L}</b><small>${M.Ls} · F</small></button><button class="mbtn R ${S.mode}" id="mbR"><b>${M.R}</b><small>${M.Rs} · J</small></button></div></div>`;
      const pd=k=>e=>{e.preventDefault();this.hit(k);};document.getElementById("mbL").addEventListener("pointerdown",pd("L"));document.getElementById("mbR").addEventListener("pointerdown",pd("R"));return;}
    if(S.phase==="abort"){el.innerHTML=`<div class="mbox px"><h2>Stopped</h2><p class="meta center">You switched apps or the screen turned off, so the song stopped · this week's reward is still available</p><div class="mfoot roadbtns"><button class="btn" data-mb="close">Close</button><button class="btn primary" data-mb="again">Play again</button></div></div>`;return;}
    if(S.phase==="result"){const R=S.res,sb=R.song?songBest(G,S.mode,R.song.id):null;
      el.innerHTML=`<div class="mbox px mres">${R.song?`<div class="mbsong big" style="--sc:${R.song.col};--bg:url(a/${R.song.bg})"><b>${esc(R.song.n)}</b><small>${BAG_DIFF[R.song.dk].name} · ${R.song.bpm} BPM</small></div>`:`<h2>Training result</h2>`}
       ${S.mode==="somtam"&&R.rival!=null?`<p class="center tamres">${R.score>=R.rival?`<b class="goldt">Beat Jae Pla's stall!</b>&nbsp; Sold ${Math.floor(R.score/220)} plates to ${Math.floor(R.rival/220)}`:`Jae Pla's stall sold more · ${Math.floor(R.score/220)} to ${Math.floor(R.rival/220)} plates`}</p>`:""}
       ${R.songBest&&R.prev&&R.prev.s?`<p class="center"><b class="newrec">New best for this song!</b> Was ${R.prev.s.toLocaleString()}</p>`:R.song&&sb&&!R.songBest?`<p class="center meta">Song best ${sb.s.toLocaleString()} · grade ${sb.g||"-"}</p>`:""}<div class="mgrade g${R.grade}">${R.grade}</div>
       ${R.c.miss===0&&R.maxc>0?`<div class="fullcombo">FULL COMBO!</div>`:""}<p class="center"><b>${R.score}</b> pts · Max combo ${R.maxc} · Accuracy ${Math.round(R.acc*100)}%</p>
       <p class="center meta">Perfect ${R.c.perfect} · Great ${R.c.great} · OK ${R.c.ok} · Miss ${R.c.miss}${R.best?" · <b class=\"goldt\">New record!</b>":""}</p>
       ${S.practice?`<p class="center meta">Practice mode · no rewards</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-mb="again">Play again (practice)</button><button class="btn primary" data-mb="close">Back to camp</button></div></div>`;}},
  start(){const S=this.st;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}
    G.mini=G.mini||{};G.mini.bagLast=S.id;G.mini.bagDk=S.dk;
    const song=S.duel?null:(BAG_SONGS.find(x=>x.id===S.song)||songPickDefault(G,S.dk));S.songObj=song;const C=bagChart(G,S.dk,S.mode==="somtam"?5000:0,song);if(S.duel){const cut=C.beat*4*(1+S.duel.bars);C.notes=C.notes.filter(n=>n.t<cut);C.end=cut+C.beat;}S.notes=C.notes;S.end=C.end;S.beat=C.beat;S.phase="play";S.cf={};S.lead=0;S.mstreak=0;S.lastMiss=0;S.missT=0;S.leadT=0;S.score=0;S.combo=0;S.maxc=0;S.c={perfect:0,great:0,ok:0,miss:0};S.fx=[];S.hitT=-9;S.hitK="L";
    this.draw();S.t0=this.clock()+.6;if(song){this.music(song,S.t0,S.beat,Math.round((S.end-S.beat)/(4*S.beat)));if(song.bg)S.bgImg=img(song.bg);}else{const nb=Math.round(S.end/S.beat);for(let i=0;i<nb;i++)this.ching(S.t0+i*S.beat,i%2===0);}
    const cv=document.getElementById("mbcv");S.x=cv.getContext("2d");S.x.imageSmoothingEnabled=false;const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.frame();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  now(){return this.clock()-this.st.t0;},
  judge(n,q){const S=this.st;n.j=q;S.c[q]++;if(q==="miss"){S.combo=0;}else{S.combo++;S.maxc=Math.max(S.maxc,S.combo);S.score+=({perfect:100,great:70,ok:40})[q]+Math.min(50,S.combo*2);}
    S.fx.push({q,t:this.now()});if(q!=="miss"){(S.rings=S.rings||[]).push({q,t:this.now()});if(S.combo>=10&&S.combo%10===0)S.cpop={n:S.combo,t:this.now()};}else S.shk=this.now();const c=document.getElementById("mbc"),s=document.getElementById("mbs");if(c){c.textContent=S.combo;c.classList.remove("cb");void c.offsetWidth;if(S.combo>1)c.classList.add("cb");}if(s)s.textContent=S.score;},
  hit(k){const S=this.st;if(!S||S.phase!=="play")return;const t=this.now();if(S.mode==="somtam")this.wood(k,this.clock());else this.drum(k,this.clock());S.hitT=t;S.hitK=k;
    const btn=document.getElementById(k==="L"?"mbL":"mbR");if(btn){btn.classList.remove("hit");void btn.offsetWidth;btn.classList.add("hit");}
    let best=null,bd=9;for(const n of S.notes){if(n.j)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}if(n.t-t>BAG_WIN.ok)break;}
    if(!best||bd>BAG_WIN.ok)return;/* stray tap: no penalty */
    if(best.k!==k){this.judge(best,"miss");return;}
    this.judge(best,bd<=BAG_WIN.perfect?"perfect":bd<=BAG_WIN.great?"great":"ok");},
  frame(){const S=this.st,x=S.x,W=360,H=300,t=this.now(),f=G.F[S.id];
    for(const n of S.notes){if(!n.j&&t-n.t>BAG_WIN.ok)this.judge(n,"miss");}
    if(t>S.end+.4){this.finish();return;}
    if(t>0)this.calls(t);
    /* v1.91.185 rhythm juice (from the 4-lane rhythm demo): the whole screen pulses on the beat, a miss jolts it, the drum lights up when pressed,
       good hits burst a ring at the drum, PERFECT/GREAT pop big and settle, every 10 in a row a combo pop-up, full combo celebrated at the end */
    const RM=typeof matchMedia!=="undefined"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    x.save();if(!RM&&S.shk!=null&&t-S.shk<.18){const k2=1-(t-S.shk)/.18;x.translate((Math.random()-.5)*8*k2,(Math.random()-.5)*6*k2);}
    x.clearRect(-10,-10,W+20,H+20);const bph=t>0?((t%S.beat)/S.beat):1,pul=RM?0:Math.pow(1-bph,3);x.fillStyle="#1b1530";x.fillRect(-10,-10,W+20,H+20);{const bi=S.bgImg;if(bi&&bi.complete&&bi.naturalWidth){const sc2=Math.max(W/bi.naturalWidth,222/bi.naturalHeight),bw=bi.naturalWidth*sc2,bh=bi.naturalHeight*sc2;x.imageSmoothingEnabled=true;x.drawImage(bi,(W-bw)/2,(222-bh)*.6,bw,bh);x.imageSmoothingEnabled=false;const gr=x.createLinearGradient(0,0,0,222);gr.addColorStop(0,"rgba(16,10,30,.15)");gr.addColorStop(1,"rgba(16,10,30,.75)");x.fillStyle=gr;x.fillRect(0,0,W,222);}}
    if(pul>0){x.fillStyle=`rgba(255,211,74,${.10*pul})`;x.fillRect(0,0,W,H);}
    // fighter + heavy bag (same drawing as the training drill)
    const dt=(t-S.hitT)*1000,hit=dt>=0&&dt<450;const row=hit?(S.mode==="somtam"?"punch":S.hitK==="L"?"knee":"punch"):(S.mode==="somtam"?"idle":"guard");const fr=hit?Math.min(3,Math.floor(dt/90)):Math.floor(performance.now()/260)%4;
    x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.ellipse(W*.4,196,40,6,0,0,7);x.fill();
    if(S.mode==="somtam"&&!S.duel){/* the rival stall across the lane: green awning, Jae Pla pounding on the beat */const rx=6,ry=66;x.fillStyle="#1d5a32";x.fillRect(rx,ry,92,12);for(let i=0;i<6;i++){x.fillStyle=i%2?"#e8f3ea":"#2f8a50";x.fillRect(rx+i*15.3,ry+12,15.3,8);}
      x.fillStyle="#5a3e24";x.fillRect(rx+4,ry+20,4,70);x.fillRect(rx+84,ry+20,4,70);x.fillStyle="#6b4a2b";x.fillRect(rx,ry+66,92,7);
      const vg=img("npc_vendor_green.webp");if(vg.complete&&vg.naturalWidth){const bob=Math.max(0,Math.sin((t/S.beat)*Math.PI))*3;x.imageSmoothingEnabled=true;x.drawImage(vg,0,0,vg.naturalWidth,vg.naturalHeight*.55,rx+22,ry+20+bob,46,46*vg.naturalHeight*.55/vg.naturalWidth);x.imageSmoothingEnabled=false;}
      x.fillStyle="#6b4a2b";x.fillRect(rx,ry+66,92,7);x.fillStyle="#b5653a";x.fillRect(rx+56,ry+56,20,12);
      x.fillStyle="#fff";x.font="bold 10px sans-serif";x.textAlign="center";x.fillText("Jae Pla's Som Tam",rx+46,ry+9);}
    if(S.mode==="somtam"){/* stall table, clay mortar, wooden pestle */const mx=W*.62;x.fillStyle="#6b4a2b";x.fillRect(W*.42,150,W*.5,10);x.fillStyle="#4a3220";x.fillRect(W*.45,160,6,40);x.fillRect(W*.86,160,6,40);
      x.fillStyle="#2a1a10";x.fillRect(mx-30,112,60,40);x.fillStyle="#b5653a";x.fillRect(mx-28,114,56,36);x.fillStyle="#d07a48";x.fillRect(mx-28,114,10,36);x.fillStyle="#7a3d20";x.fillRect(mx-24,114,48,6);
      x.fillStyle="#9fd36a";for(let i=0;i<5;i++)x.fillRect(mx-20+i*9,108+(i%2)*2,6,6);x.fillStyle="#e84a3a";x.fillRect(mx-8,106,4,4);x.fillRect(mx+10,107,4,4);
      const py=hit&&S.hitK==="L"?Math.min(1,dt/70)*26*Math.max(0,1-(dt-70)/300):0,pr=hit&&S.hitK==="R"?Math.sin(dt/40)*8*Math.max(0,1-dt/400):0;
      x.fillStyle="#2a1a10";x.fillRect(mx-6+pr,56+py,12,58);x.fillStyle="#c89a62";x.fillRect(mx-4+pr,58+py,8,54);x.fillStyle="#e0b67e";x.fillRect(mx-4+pr,58+py,3,54);
      x.fillStyle="#fff";x.font='bold 12px sans-serif';x.textAlign="center";x.fillText("Auntie Taew's",mx,176);}
    else{const sw=hit?Math.sin(dt/80)*Math.max(0,1-dt/450)*9:Math.sin(performance.now()/700)*1.2,bx=W*.6+sw,by=34;
    x.fillStyle="#555";x.fillRect(W*.6-1,0,2,by);x.fillStyle="#2b2530";x.fillRect(bx-19,by-2,38,124);x.fillStyle="#c8283c";x.fillRect(bx-17,by,34,120);x.fillStyle="#e23b4e";x.fillRect(bx-17,by,7,120);
    x.fillStyle="#1f1f24";x.fillRect(bx-17,by+20,34,4);x.fillRect(bx-17,by+92,34,4);}
    try{drawFrame(x,sheetFor(f),ROW[row],fr,W*.38,198,180,false);}catch(e){}
    // judgement pop
    const last=S.fx[S.fx.length-1];if(last&&t-last.t<.6){const a=(t-last.t)/.6,p=Math.min(1,(t-last.t)/.12),sc=last.q==="miss"?1:1+.6*(1-p)+.08*Math.sin(p*Math.PI);x.save();x.globalAlpha=Math.max(0,1-Math.max(0,a-.5)*2);
      x.translate(W*.6,34-a*8);x.scale(sc,sc);x.font=`900 ${last.q==="perfect"?30:24}px "Chakra Petch","Pixelify Sans",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=6;x.lineJoin="round";x.strokeStyle="#000";
      const T={perfect:["PERFECT!","#ffd34a"],great:["GREAT!","#8ef0a0"],ok:["OK","#fff"],miss:["MISS","#ff6a6a"]}[last.q];x.strokeText(T[0],0,0);x.fillStyle=T[1];x.fillText(T[0],0,0);x.restore();}
    if(S.cpop&&t-S.cpop.t<.9){const a=(t-S.cpop.t)/.9,p=Math.min(1,(t-S.cpop.t)/.15);x.save();x.globalAlpha=Math.max(0,1-Math.max(0,a-.6)/.4);x.translate(W*.24,70);x.rotate(-.12);x.scale(1+.7*(1-p),1+.7*(1-p));
      x.font='900 30px "Chakra Petch",sans-serif';x.textAlign="center";x.lineWidth=7;x.lineJoin="round";x.strokeStyle="#4a0a18";x.strokeText(S.cpop.n+" COMBO!",0,0);x.fillStyle="#ff7a3a";x.fillText(S.cpop.n+" COMBO!",0,0);x.restore();}
    // note lane (taiko style: notes slide in from the right to the drum circle)
    const ly=252,hx=46,sp=210;x.fillStyle="#120e22";x.fillRect(0,ly-30,W,60);x.fillStyle="#2c2448";x.fillRect(0,ly-30,W,3);x.fillRect(0,ly+27,W,3);
    const bt=S.beat;for(let b=Math.ceil((t-.5)/bt)*bt;b<t+1.8;b+=bt){const bx2=hx+(b-t)*sp;if(bx2>0&&bx2<W){x.fillStyle="rgba(255,255,255,.08)";x.fillRect(bx2,ly-26,2,52);}}
    {const pr=(t-S.hitT);if(pr>=0&&pr<.15){x.fillStyle=S.hitK==="L"?`rgba(226,68,60,${.55*(1-pr/.15)})`:`rgba(60,139,226,${.55*(1-pr/.15)})`;x.fillRect(0,ly-27,W,54);x.beginPath();x.arc(hx,ly,26,0,7);x.fill();}}
    x.lineWidth=3+2*pul;x.strokeStyle="#ffd34a";x.beginPath();x.arc(hx,ly,22+2*pul,0,7);x.stroke();x.strokeStyle="rgba(255,211,74,.35)";x.beginPath();x.arc(hx,ly,15,0,7);x.stroke();
    S.rings=(S.rings||[]).filter(r=>t-r.t<.4);for(const r of S.rings){const e=(t-r.t)/.4;x.strokeStyle=r.q==="perfect"?`rgba(255,211,74,${1-e})`:r.q==="great"?`rgba(142,240,160,${1-e})`:`rgba(255,255,255,${.7*(1-e)})`;x.lineWidth=4*(1-e)+1;x.beginPath();x.arc(hx,ly,22+e*34,0,7);x.stroke();
      if(r.q==="perfect")for(let i=0;i<8;i++){const a=i/8*6.283;x.fillStyle=`rgba(255,240,170,${1-e})`;x.fillRect(hx+Math.cos(a)*(26+e*40)-2,ly+Math.sin(a)*(26+e*40)-2,4,4);}}
    for(let i=S.notes.length-1;i>=0;i--){const n=S.notes[i];if(n.j&&n.j!=="miss")continue;const nx=hx+(n.t-t)*sp;if(nx<-30||nx>W+30)continue;
      const L=n.k==="L",r=L?18:14;x.globalAlpha=n.j==="miss"?.35:1;x.fillStyle="#000";x.beginPath();x.arc(nx,ly,r+3,0,7);x.fill();x.fillStyle=L?"#e2443c":"#3c8be2";x.beginPath();x.arc(nx,ly,r,0,7);x.fill();
      x.fillStyle="rgba(255,255,255,.35)";x.beginPath();x.arc(nx-r*.3,ly-r*.35,r*.35,0,7);x.fill();x.fillStyle="#fff";x.font=`bold ${L?13:11}px sans-serif`;x.textAlign="center";x.fillText(L?MG_MODES[S.mode].L:MG_MODES[S.mode].R,nx,ly+4);x.globalAlpha=1;}
    // count-in
    if(t<4*bt){const n=4-Math.floor(Math.max(0,t)/bt);x.font='bold 40px "Pixelify Sans",sans-serif';x.textAlign="center";x.fillStyle="#fff";x.strokeStyle="#000";x.lineWidth=5;const s=t<0?"Ready":String(n);x.strokeText(s,W/2,120);x.fillText(s,W/2,120);}
    x.restore();
    // progress
    x.fillStyle="#2c2448";x.fillRect(0,H-4,W,4);x.fillStyle="#ffd34a";x.fillRect(0,H-4,W*Math.min(1,Math.max(0,t/S.end)),4);},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);this.stopMusic();S.phase="result";const n=S.notes.length,c=S.c;
    const acc=(c.perfect+c.great*.75+c.ok*.4)/Math.max(1,n);const grade=acc>=.92&&c.miss===0?"S":acc>=.78?"A":acc>=.6?"B":"C";
    if(S.duel&&typeof DUEL!=="undefined"){S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:false,rw:""};DUEL.done({score:acc,win:null},S);return;}
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number"){G.mini.best={bag:G.mini.best};}const B=G.mini.best[S.mode]=G.mini.best[S.mode]||{};const isBest=S.score>(B[S.dk]||0);if(isBest)B[S.dk]=S.score;
    let sb=null,songBestNew=false;if(S.songObj){const key=S.mode+":"+S.songObj.id;G.mini.song=G.mini.song||{};const o=G.mini.song[key]||{s:0,g:null,a:0,fc:false,n:0};sb={...o};o.n=(o.n||0)+1;if(S.score>o.s){o.s=S.score;o.g=grade;o.a=Math.round(acc*1000)/1000;songBestNew=true;}if(c.miss===0)o.fc=true;G.mini.song[key]=o;}
    S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:isBest,rw:"",song:S.songObj,prev:sb,songBest:songBestNew,rival:S.mode==="somtam"?S.notes.length*72:null};
    if(!S.practice)S.res.rw=this.reward(grade,acc);save();this.draw();AU.sfx&&AU.sfx(grade==="S"||grade==="A"?"level":"ui");},
  /* v1.86: a card's Lv.3 minigame — rewards on the first clear only, then free practice */
  openCard(m,cid){const o=(G.cards||{})[cid];if(!o)return;this.openMode(m,null,null);if(this.st){this.st.card=cid;this.st.practice=!!o.mgDone;this.draw();}},
  rewardCard(grade){const S=this.st,o=(G.cards||{})[S.card],C=CARDS[S.card];if(!o)return "";o.mgDone=1;o.mgGrade=grade;const du={S:8,A:6,B:4,C:2}[grade]||2;G.dust=(G.dust||0)+du;return `<b class="goldt">✦ +${du}</b> · ${esc(C?C.t:"")}`;},
  reward(grade,acc){const S=this.st;if(S.card)return this.rewardCard(grade);if(S.mail){const ml=(G.mail||[]).find(x=>x.id===S.mail);if(ml){ml.done=true;ml.grade=grade;}}else{G.campUsed=S.act||MG_ACT[S.mode];G.campNote=`${CAMP_ACTIONS[G.campUsed].name} · grade ${grade}`;}return S.mode==="somtam"?this.rewardTam(grade,acc):this.rewardBag(grade,acc);},
  rewardTam(grade,acc){const S=this.st,f=G.F[S.id],D=BAG_DIFF[S.dk],out=[];
    const pay=Math.round({S:1200,A:850,B:550,C:250}[grade]*D.mul/50)*50;G.cash+=pay;out.push(`<b class="goldt">฿${pay.toLocaleString()}</b>`);
    if(grade==="S"||grade==="A"){G.rep=Math.round(((G.rep||0)+(grade==="S"?.3:.15))*100)/100;out.push(`Fame +${grade==="S"?.3:.15}`);}
    f.fatigue=Math.min(100,(f.fatigue||0)+2);f.morale=Math.min(100,(f.morale||0)+3);out.push("Morale +3");
    const du=Math.max(1,Math.round({S:3,A:2,B:1,C:1}[grade]*D.mul));G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    out.push(esc(TAM_LINE[grade]));
    if(grade==="S"){G.flags.tamS=(G.flags.tamS||0)+1;}
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 New card ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;},
  rewardBag(grade,acc){const S=this.st,f=G.F[S.id],D=BAG_DIFF[S.dk],out=[];
    const g=Math.round(acc*.3*D.mul*100)/100;const up=k=>{const cap=Math.min(stCap(f),(f.potential||14)+1.5);const before=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g/2)*100)/100);return f.a[k]>before;};
    if(g>0){const a=up("kick"),b=up("punch");if(a||b)out.push(`Kick/punch +${(g/2).toFixed(2)}`);else out.push("Kick/punch already at potential");}
    const mo={S:8,A:5,B:3,C:1}[grade];f.morale=Math.min(100,(f.morale||0)+mo);out.push(`Morale +${mo}`);
    f.fatigue=Math.min(100,(f.fatigue||0)+4);out.push("Fatigue +4");
    const du=Math.max(1,Math.round({S:6,A:4,B:2,C:1}[grade]*D.mul));G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(grade==="S"||grade==="A"){add(G,f.id,"bond",2);out.push(`${esc(f.name)} grew closer`);}
    if(grade==="S"){G.flags.bagS=(G.flags.bagS||0)+1;if(S.dk==="hard")G.flags.bagSH=(G.flags.bagSH||0)+1;}
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 New card ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;},
  claim(){this.close();}};
Object.assign(ACT,{minibag:()=>BAG.open()});
const TAM_LINE={S:"Auntie Taew: \"Heavy hands but right on target! Come help me every week, dear.\"",A:"Auntie Taew: \"Not bad, not bad. Customers say the papaya isn't mushy.\"",B:"Auntie Taew: \"The mortar's still in one piece. That's a pass.\"",C:"Auntie Taew: \"Half the papaya flew out of the mortar… It's fine, keep practicing.\""};
Object.assign(CARDS,{
 m_bag:{c:"kati",r:"R",t:"Grandpa's Rhythm",hint:"Get an S in the bag-kick drum minigame",bg:"camp",need:G=>(G.flags.bagS||0)>=1,steps:[
  {n:"nar",t:"The khong khaek drum blares from the old speaker across the camp. Kati kicks the bag on every beat without missing a single note."},
  {n:"coach",t:"Grandpa Chai played this song for morning training. When I was young I never kept up, not once."},
  {n:"kati",f:"happy",l:"fight",t:"I've heard this song since before I could walk properly. Dum, tek, dum, dum, tek… my body just remembers."},
  {n:"kati",f:"flustered",l:"fight",t:"Did you see, Manager? Every single beat! …If Grandpa were here, he'd be playing the drum himself."}]},
 m_tam:{c:"mali",r:"R",t:"The Hundredth Mortar",hint:"Get an S in the som tam minigame at Auntie Taew's stall",bg:"market",need:G=>(G.flags.tamS||0)>=1,steps:[
  {n:"nar",t:"Friday evening. Auntie Taew's line stretches to the temple gate. Today's mortar has pounded almost a hundred plates."},
  {n:"mali",f:"happy",l:"casual",t:"Pounding like this is just like Mom. Pound three times, toss once, pound three times, toss once… I grew up with this sound."},
  {n:"nar",t:"Auntie Taew hands over a special plate piled with blue crab. It isn't on the menu."},
  {n:"mali",f:"flustered",l:"casual",t:"You eat first, Manager. I pounded this one myself… Is it spicy? I only put in seven chilies~"}]},
 m_baghard:{c:"rin",r:"SR",t:"A Record With No Gaps",hint:"Get an S on Hard",bg:"camp",need:G=>(G.flags.bagSH||0)>=1,steps:[
  {n:"nar",t:"Rin stands by the bag with her clipboard the whole round. Her three-color pen never moves once."},
  {n:"rin",f:"surprised",l:"casual",t:"…124 BPM, every note, and not a single gap for me to log a mistake."},
  {n:"rin",f:"pout",l:"casual",t:"I usually like a full table. Today the whole sheet is empty, and I like it even more."},
  {n:"rin",f:"flustered",l:"casual",t:"Don't smile like that, Manager… I'm pinning this page on my wall. Not because I'm proud. Just… a little proud."}]}});

// ===== v1.67: MINIGAME — camp merch live stream (answer comments in time) =====
const LIVE_ITEMS=[
 {k:"shirt",name:"Sirichai Camp shirt",price:290,margin:120,open:G=>true},
 {k:"wrap",name:"Camp hand wraps",price:150,margin:60,open:G=>true},
 {k:"oil",name:"Grandpa Chai's boxing liniment",price:120,margin:55,open:G=>G.week>=12||(G.season||1)>=2},
 {k:"key",name:"Camp pet keychain",price:89,margin:40,open:G=>(G.pets||[]).length>0},
 {k:"shorts",name:"Camp-pattern Muay Thai shorts",price:450,margin:180,open:G=>(typeof campLevel==="function"&&campLevel(G)>=3)||(G.season||1)>=2}];
const LIVE_HOST={kati:"Regulars love Kati · good replies draw more viewers",mali:"Sweet talker, closes sales · +20% sales",rin:"Answers fast · +1.5 s to reply",fah:"TikTok star · 40% more viewers",ploy:"Unfazed by drama · trolls don't scare viewers off"};
const LIVE_NAMES=["Praew","Uncle Khiao","Kati Fanclub #1","Auntie Taew","camp_student","office_girl","fake_account123","Uncle Golden Helmet","market_auntie","vocational_kid"];
/* each comment: kind, text, answers [label, score] — score 1 = right, 0 = meh, -1 = wrong. "sale" adds orders when answered well */
const LIVE_POOL=[
 {k:"price",t:"How much is the ITEM?",a:[["Clear price, free shipping",1],["DM us",0],["Pricey but worth it",-1]],sale:1},
 {k:"size",t:"What sizes? Fits bigger folks?",a:[["S–XXL, measure it on camera",1],["One size fits all",-1],["Not sure",0]],sale:1},
 {k:"ship",t:"Do you ship upcountry? I'm in Phuket",a:[["Ships nationwide in 2–3 days",1],["Pick it up at the camp",-1],["Let me ask Coach first",0]],sale:1},
 {k:"order",t:"CF 2 please!!",a:[["Thank you! DM to confirm",1],["Hold on a sec",0],["Forgot to write it down",-1]],sale:2},
 {k:"order",t:"Three please, one's for my nephew",a:[["Take the order, add free stickers",1],["Isn't three a lot?",-1],["Sure… I think",0]],sale:3},
 {k:"bargain",t:"Discount if I buy two?",a:[["Throw in a keychain instead",1],["Half price, go!",-1],["No discounts",0]],sale:2},
 {k:"hype",t:"Will I kick harder wearing this lol",a:[["Kick the bag to show them!",1],["Not really",0],["Depends on your luck",-1]]},
 {k:"hype",t:"Show us the wai khru!",a:[["Do a short wai khru",1],["Another day",0],["Too shy, no thanks",-1]]},
 {k:"fan",t:"Love HOST!! Came from the temple-fair fight",a:[["Thank you! Sending hearts",1],["(ignore and keep selling)",-1],["Too shy… no reply",0]]},
 {k:"fan",t:"Your last fight was amazing!",a:[["Retell the fight and pitch the shirt",1],["It was a fluke",0],["Who?",-1]]},
 {k:"troll",t:"What can a tiny camp even sell",a:[["Thanks for stopping by 🙏",1],["Argue back at length",-1],["End the live and run",-1]],troll:1},
 {k:"troll",t:"Who'd even wear this color lol",a:[["Walk around wearing it",1],["Gets upset and goes quiet",-1],["You would!",0]],troll:1},
 {k:"drama",t:"Heard a big camp is poaching you??",a:[["Laugh: not going anywhere, this is home",1],["Ignore it",0],["Trash that camp back",-1]],troll:1},
 {k:"drama",t:"Why did you lose yesterday? So disappointed",a:[["Thanks for cheering, we'll be back",1],["The judges cheated",-1],["I'd rather not talk about it",0]],troll:1},
 {k:"pet",t:"Show us the camp dog!",a:[["Carry it to the camera",1],["Sorry, can't",-1],["Hold on",0]],need:G=>(G.pets||[]).some(p=>p.k==="dog")},
 {k:"pet",t:"Where's the orange cat!!",a:[["Go fetch it to show",1],["It's asleep",0],["What cat?",-1]],need:G=>(G.pets||[]).some(p=>p.k==="cat")},
 {k:"coach",t:"Bring Coach Daeng on camera!",a:[["Drag Coach in to wave",1],["Coach is busy",0],["Coach is shy",0]]},
 {k:"q",t:"Can the ITEM go in the washing machine?",a:[["Yes, cold water, inside out",1],["No idea",-1],["Hand-wash is better",0]],sale:1}];
const LIVE={st:null,
  played(G){return mgPlayed(G,"live");},
  items(G){return LIVE_ITEMS.filter(i=>i.open(G));},
  pick(){const S=BAG.st;const F=bagFighters(G).filter(f=>f.canon);const host=(G.mini&&G.mini.liveHost&&F.find(f=>f.id===G.mini.liveHost))||F[0];
    this.st={phase:"pick",host:host?host.id:"kati",item:(G.mini&&G.mini.liveItem)||"shirt",practice:this.played(G)};if(!this.items(G).some(i=>i.k===this.st.item))this.st.item="shirt";S.phase="live";this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="host"){S.host=v;this.draw();}else if(a==="item"){S.item=v;this.draw();}else if(a==="go")this.start();
    else if(a==="ans")this.answer(+v);else if(a==="again"){S.phase="pick";S.practice=true;this.draw();}
    else if(a==="hub"){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.st=null;BAG.st.phase="hub";BAG.draw();}},
  el(){return document.getElementById("minibag");},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const F=bagFighters(G).filter(f=>f.canon);
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{}).live||0;
      el.innerHTML=`<div class="mbox px"><h2>📱 Camp Merch Live</h2>
       <p class="meta">Comments pop up one at a time. Pick the best reply before time runs out (keys 1/2/3 work too) · good replies bring viewers and sales · bad ones drive viewers away</p>
       <b class="meta">Who's hosting</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.host?"on":""}" data-lv="host" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <p class="meta center">${esc(LIVE_HOST[S.host]||"")}</p>
       <b class="meta">What to sell</b><div class="lvitems">${this.items(G).map(i=>`<button class="btn sm ${i.k===S.item?"primary":""}" data-lv="item" data-v="${i.k}">${i.name} ฿${i.price}</button>`).join("")}</div>
       <p class="meta center">${S.practice?"Already streamed this week · this run is practice, no income":"One live a week · earn profit from sales · fame · stardust"}${best?` · best sales ${best} sold`:""}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Later</button><button class="btn primary" data-lv="go">Go live! ▸</button></div></div>`;return;}
    if(S.phase==="play"){const h=G.F[S.host];
      el.innerHTML=`<div class="mplay lv"><div class="lvphone"><img class="lvface" src="${faceSrc(S.host,"happy")}" alt="">
        <div class="lvtop"><span class="lvlive">● LIVE</span><span>👁 <b id="lvv">0</b></span><span>🛒 <b id="lvs">0</b></span><span id="lvt">45</span></div>
        <div class="lvname">${esc(h.name)} · ${esc(this.item().name)}</div><div class="lvhearts" id="lvh"></div>
        <div class="lvfeed" id="lvfeed"></div></div>
        <div class="lvq" id="lvq"></div></div>`;this.showQ();return;}
    if(S.phase==="result"){const R=S.res;
      el.innerHTML=`<div class="mbox px"><h2>Live Ended</h2><div class="mgrade g${R.grade}">${R.grade}</div>
       <p class="center">Sold <b>${S.sold}</b> · peak viewers ${S.peak} · good answers ${S.good}/${S.asked}${R.best?" · <b class=\"goldt\">New record!</b>":""}</p>
       ${S.practice?`<p class="center meta">Practice mode · no income</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-lv="again">Go live again (practice)</button><button class="btn primary" data-mb="close">Back to camp</button></div></div>`;}},
  item(){return LIVE_ITEMS.find(i=>i.k===this.st.item)||LIVE_ITEMS[0];},
  start(){const S=this.st;AU.resume&&AU.resume();G.mini=G.mini||{};G.mini.liveHost=S.host;G.mini.liveItem=S.item;
    const pool=LIVE_POOL.filter(c=>!c.need||c.need(G));const R=(i)=>srand(G,3100+i*17+(G.mini.liveN||0)*7);
    S.deck=[];for(let i=0;i<40;i++){const c=pool[Math.floor(R(i)*pool.length)];const ord=[0,1,2].sort((a,b)=>R(i*3+a+50)-R(i*3+b+50));S.deck.push({c,ord,who:LIVE_NAMES[Math.floor(R(i+200)*LIVE_NAMES.length)]});}
    S.i=0;S.view=Math.round(25+(G.rep||5)*3)*(S.host==="fah"?1.4:1);S.peak=S.view;S.sold=0;S.good=0;S.asked=0;S.feed=[];S.cur=null;S.phase="play";S.t0=performance.now();S.dur=S.duel?30000:45000;
    this.draw();const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.tick();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  qTime(){return (this.st.host==="rin"?6000:4500);},
  showQ(){const S=this.st;const q=document.getElementById("lvq");if(!q)return;if(!S.cur){q.innerHTML=`<p class="meta center">Waiting for the next comment…</p>`;return;}
    const d=S.cur,c=d.c,txt=c.t.replace("ITEM",this.item().name).replace("HOST",G.F[S.host].name);
    q.innerHTML=`<div class="lvc"><b>${esc(d.who)}</b><span>${esc(txt)}</span><div class="lvbar"><i id="lvbar"></i></div></div>
      <div class="lvans">${d.ord.map((ai,j)=>`<button class="btn" data-lv="ans" data-v="${ai}"><small>${j+1}</small> ${esc(c.a[ai][0])}</button>`).join("")}</div>`;},
  pushFeed(t,cls){const S=this.st;S.feed.push({t,cls});if(S.feed.length>5)S.feed.shift();const f=document.getElementById("lvfeed");if(f)f.innerHTML=S.feed.map(x=>`<div class="${x.cls||""}">${x.t}</div>`).join("");},
  heart(){const h=document.getElementById("lvh");if(!h)return;const s=document.createElement("i");s.textContent=["❤","💖","🔥","👏"][Math.floor(Math.random()*4)];s.style.left=(60+Math.random()*30)+"%";h.appendChild(s);setTimeout(()=>s.remove(),1200);},
  answer(ai){const S=this.st;if(!S||S.phase!=="play"||!S.cur)return;const d=S.cur,c=d.c,sc=c.a[ai][1];S.asked++;
    const txt=c.a[ai][0];this.pushFeed(`<b>${esc(G.F[S.host].name)}:</b> ${esc(txt)}`,"me");
    if(sc>0){S.good++;const gain=Math.round((8+Math.random()*7)*(S.host==="kati"?1.3:1)*(S.host==="fah"?1.2:1));S.view+=gain;
      if(c.sale){const n=Math.max(1,Math.round(c.sale*(S.host==="mali"?1.2:1)+S.view/120));S.sold+=n;this.pushFeed(`🛒 +${n} sold`,"sale");}
      for(let i=0;i<3;i++)setTimeout(()=>this.heart(),i*120);AU.sfx&&AU.sfx("ui");}
    else if(sc<0){if(!(c.troll&&S.host==="ploy"))S.view=Math.max(5,Math.round(S.view*.85));this.pushFeed("💨 Some viewers left","bad");}
    else{S.view=Math.max(5,Math.round(S.view*.97));}
    S.cur=null;S.next=performance.now()+700;this.showQ();},
  tick(){const S=this.st,now=performance.now(),el=now-S.t0;
    if(el>=S.dur&&!S.cur){this.finish();return;}
    if(!S.cur&&(!S.next||now>=S.next)&&el<S.dur-1500){const d=S.deck[S.i++%S.deck.length];S.cur=d;S.qT=now;this.pushFeed(`<b>${esc(d.who)}:</b> ${esc(d.c.t.replace("ITEM",this.item().name).replace("HOST",G.F[S.host].name))}`);this.showQ();}
    if(S.cur){const left=1-(now-S.qT)/this.qTime();const b=document.getElementById("lvbar");if(b)b.style.width=Math.max(0,left*100)+"%";
      if(left<=0){S.asked++;S.view=Math.max(5,Math.round(S.view*.93));this.pushFeed("⌛ Too slow","bad");S.cur=null;S.next=now+500;this.showQ();}}
    /* passive trickle of orders from a big audience */
    if(!S.pt||now-S.pt>3000){S.pt=now;if(Math.random()<Math.min(.8,S.view/150)){S.sold++;this.pushFeed("🛒 +1 sold","sale");}}
    S.peak=Math.max(S.peak,S.view);
    const v=document.getElementById("lvv"),s=document.getElementById("lvs"),t=document.getElementById("lvt");if(v)v.textContent=Math.round(S.view);if(s)s.textContent=S.sold;if(t)t.textContent=Math.max(0,Math.ceil((S.dur-el)/1000));},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);S.phase="result";const acc=S.good/Math.max(1,S.asked);
    if(S.duel&&typeof DUEL!=="undefined"){S.res={grade:"",best:false,rw:""};DUEL.done({score:S.sold+acc,win:null},S);return;}
    const grade=S.sold>=30&&acc>=.85?"S":S.sold>=20&&acc>=.7?"A":S.sold>=10?"B":"C";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number")G.mini.best={bag:G.mini.best};G.mini.liveN=(G.mini.liveN||0)+1;
    const isBest=S.sold>(G.mini.best.live||0);if(isBest)G.mini.best.live=S.sold;
    S.res={grade,best:isBest,rw:""};if(!S.practice)S.res.rw=this.reward(grade);save();this.draw();AU.sfx&&AU.sfx(grade==="S"||grade==="A"?"level":"ui");},
  reward(grade){const S=this.st,it=this.item(),f=G.F[S.host],out=[];G.campUsed=S.act||"live";G.campNote=`${CAMP_ACTIONS.live.name} · grade ${grade}`;
    const pay=Math.round(S.sold*it.margin*.7/10)*10;G.cash+=pay;out.push(`Profit <b class="goldt">฿${pay.toLocaleString()}</b>`);
    const rp={S:.4,A:.25,B:.1,C:0}[grade];if(rp){G.rep=Math.round(((G.rep||0)+rp)*100)/100;out.push(`Fame +${rp}`);}
    const du={S:5,A:3,B:2,C:1}[grade];G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(grade==="S"||grade==="A"){add(G,f.id,"bond",2);out.push(`${esc(f.name)} grew closer`);}
    f.morale=Math.min(100,(f.morale||0)+3);out.push("Morale +3");
    G.flags.liveN=(G.flags.liveN||0)+1;if(grade==="S")G.flags.liveS=(G.flags.liveS||0)+1;
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 New card ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;}};
MG_MODES.live={icon:"📱",title:"Camp Merch Live",note:"Answer comments in time · earn profit from sales, fame",open:G=>G.week>=8||(G.season||1)>=2,custom:true};

// ===== v1.89.13: MINIGAME — 1:1 sprint, 100 m (also the regional champions' duel and, later, the district sports day) =====
/* Drag the runner into the blocks, wait for the gun, then alternate left/right as fast as you can.
   Same side twice = a stumble · tapping before the gun = a false start (the second one loses the race). */
/* v1.91.195 (Man: line the races up — a time trial on your own, a one-on-one, 400 m with four, and the sports day with lanes and a 4×100 relay where the baton is handed over by tapping in time;
   the rivals are the people of the district, and how fast anyone runs comes from their stats).
   One engine runs them all. Every runner has a top speed (from SPEED, a little less when tired) and a tank (from STAMINA):
   running near the top drains the tank, cruising refills it a little, an empty tank caps you at 78 % of top speed.
   The player's thumb sets the effort — about eight taps a second reaches top speed, faster does nothing, slower runs slower —
   so the stats decide what is possible and the thumb decides how much of it you get. Over 100 m only a weak tank fades;
   over 400 m flooring it from the gun empties the tank by the last bend, and holding the green "cruise" band until 120 m out wins. */
const RUN_LEN=100,RUN_STRIDE=1.1;
const hz2=m=>440*Math.pow(2,(m-69)/12);
const runVmax=f=>{if(!f||!f.a)return 8.6;const sp=f.a.speed||10,fa=f.fatigue||0;return (7.3+.105*sp)*(1-Math.min(.08,fa/1000));};
const runCap=f=>f&&f.a?16+.9*(f.a.stamina||10):25;
const runMult=f=>f?runVmax(f)/8.35:1; /* kept for old callers */
const RUN_LINE={S:"Kru Daeng stops the watch and goes quiet for two seconds. \"…Was there a tailwind or what?\"",A:"Kru Daeng nods. \"Good legs today. Now go kick the bag.\"",B:"\"You can run, just don't fade in the middle,\" Kru Daeng laughs",C:"\"Don't let those legs stop! All the way to the line!\" Kru Daeng shouts from the side of the track"};
const RUN_MODES={solo:{n:"100 m trial",d:"Run alone against the ghost of your own best",dist:100},
  duel:{n:"1-on-1",d:"One-on-one over 100 m · challenge a camp mate, or climb the ladder of five townsfolk",dist:100},
  m400:{n:"400 m · 4 runners",d:"One lap · tap with the drum beat, then mash all out for the last 120 metres",dist:400}};
const RACE_TEAMS={me:{c:"#e2443c",n:"Red",hue:0},tiger:{c:"#e8b62c",n:"Yellow",hue:46},teach:{c:"#3a8ee0",n:"Blue",hue:214},obt:{c:"#3aa65a",n:"Green",hue:128}};
/* people of the district who turn up to run: the morning running club, the school, the sub-district office */
const RUN_LOCALS=[["loc_ton","Ton, morning running club",13,15],["loc_praew","Praew",11,10],["loc_wang","Uncle Wang, motorbike taxi",9,13],["loc_fai","Fai, school athlete",14,11]];
/* v1.91.198 each colour keeps its anchor every year (they get quicker), the rest of the team changes year to year */
const SP_SQUADS={teach:[["sp_t1","Coach Nui, PE teacher"],["sp_t2","Teacher Somchai"],["sp_t3","Teacher Ann"],["sp_t4","Principal Prayoon"],["sp_t5","Teacher Beer, new hire"],["sp_t6","Teacher Jum, Thai"],["sp_t7","Teacher Oat, computers"],["sp_t8","Uncle Choet, school janitor"]],
  obt:[["sp_o1","Deputy Ton"],["sp_o2","Sgt. Sombat"],["sp_o3","Fern from the TAO"],["sp_o4","Village Head Chaloem"],["sp_o5","TAO Chief Somsak"],["sp_o6","Em, rescue crew"],["sp_o7","Auntie Boonmee, health volunteer"],["sp_o8","Uncle Joy, garbage truck"]]};
/* v1.91.198 (Man: more people to race) — the district ladder: five runners from the slow to the fast, each with a way of running and something to say.
   fast = flies off the line and fades after 60 m · steady = the same all the way · kick = starts slow and finishes like a train */
const RUN_LADDER=[
 {id:"loc_wang",n:"Uncle Wang, motorbike taxi",sp:8,st:8,style:"fast",react:.1,hue:30,tag:"Quick off the line, fades late",pre:"Uncle rides a motorbike taxi all day, but the legs are still quick. Watch the start.",win:"Ha ha, the start's what counts! Remember that, kid.",lose:"Tired now… Uncle's going to sit down at the bike stand."},
 {id:"loc_praew",n:"Praew",sp:11,st:10,style:"steady",hue:280,tag:"Runs even",pre:"Don't go easy on me! Praew's trained with Coach Nui all term.",win:"Praew beat a boxer! I'm telling the whole class tomorrow.",lose:"Praew'll be taller next year! Then I'm coming back to challenge you!"},
 {id:"loc_ton",n:"Ton, morning running club",sp:13,st:15,style:"steady",hue:190,tag:"Tireless, never fades",pre:"Our club runs round the moat at 5:30 every morning. Sleep in and don't bother coming.",win:"Breathing rhythm is everything. Come run with the club.",lose:"OK, OK — boxers' legs are the real deal. I'll give you that."},
 {id:"loc_fai",n:"Fai, school athlete",sp:15,st:13,style:"kick",react:.24,hue:330,tag:"Slow start, big finish",pre:"Fai runs the 100 m for the district. Nobody's ever beaten me on the run-in.",win:"The home straight belongs to Fai!",lose:"…Could I have Kru Daeng's number? I'd love to train at your camp."},
 {id:"dare_suea",n:"Suea Dam, Golden Tiger",sp:16,st:13,style:"fast",react:.11,hue:46,tag:"Fast at both ends",suea:true,pre:"Climbing the ladder all the way to me is no joke. But this is where it ends.",win:"Like I said, everyone loses to me.",lose:"…Not bad. I'll be back."}];
function ladderNpc(i){const L=RUN_LADDER[i],y=(G.season||1)-1,R=roster(G).slice().sort((a,b)=>runVmax(b)-runVmax(a))[0];
  const sp=L.suea?Math.min(21,Math.max(L.sp+y*.5,R?(R.a.speed||10)+1:L.sp)):Math.min(19,L.sp+y*.5);return runNpc(L.id,L.n,sp,Math.min(20,L.st+y*.5),L.hue);}
/* v1.91.206 (Man: men's names on girls' sprites look odd) — until hand-drawn men exist, the men in the races are drawn in code from the
   manager chibi (24x32) and laid out as a normal 4x6 sheet; each gets clothes that fit the job. */
const NPC_MEN={
  loc_wang:{outfit:"tee",outfitColor:"#e8862a",hair:"#9a9a9a",hat:"cap",hatColor:"#2c5fb3",pantsColor:"#2c3e6b"},
  loc_ton:{outfit:"tee",outfitColor:"#2f8a4f",hair:"#1b1410",hat:"none",pants:"shorts",pantsColor:"#1f1f24"},
  sp_t2:{outfit:"polo",outfitColor:"#f2f2f2",hair:"#1b1410",hat:"none",pantsColor:"#1f1f24"},
  sp_t4:{outfit:"suit",outfitColor:"#3a3a48",hair:"#cfcfcf",hat:"none",pantsColor:"#2a2a34"},
  sp_t7:{outfit:"polo",outfitColor:"#2c5fb3",hair:"#2a1c14",hat:"none",pantsColor:"#5a4a3a"},
  sp_t8:{outfit:"tee",outfitColor:"#6a8a9a",hair:"#8a8a8a",hat:"bucket",hatColor:"#5a6a3a",pantsColor:"#3a3a3a"},
  sp_o1:{outfit:"suit",outfitColor:"#c9a96a",hair:"#1b1410",hat:"none",pantsColor:"#6b5a3a"},
  sp_o2:{outfit:"polo",outfitColor:"#6b5a3a",hair:"#1b1410",hat:"cap",hatColor:"#3a3020",pantsColor:"#3a3020"},
  sp_o4:{outfit:"polo",outfitColor:"#c9a96a",hair:"#9a9a9a",hat:"none",pantsColor:"#6b5a3a"},
  sp_o5:{outfit:"suit",outfitColor:"#1f1f24",hair:"#2a1c14",hat:"none",pantsColor:"#1f1f24"},
  sp_o8:{outfit:"hoodie",outfitColor:"#e0a91b",hair:"#777777",hat:"bucket",hatColor:"#e07020",pantsColor:"#2f6a3a"},
  sp_stu3:{outfit:"tee",outfitColor:"#c8283c",hair:"#1b1410",hat:"none",pants:"shorts",pantsColor:"#2c5fb3"}};
function runNpc(key,name,sp,st,hue){const m=NPC_MEN[key];return {id:key,name,a:{speed:sp,stamina:st},sprite:npcBase(key).base,tintHue:m?null:hue,manLook:m||null,fake:true,fatigue:0};}
function runLocal(i){const L=RUN_LOCALS[i%RUN_LOCALS.length];return runNpc(L[0],L[1],L[2],L[3],[30,280,190,330][i%4]);}
/* a runner on the track */
function runLane(f,o={}){return {f,name:(f&&f.name)||o.name||"",team:o.team||null,c:o.c||(o.team?RACE_TEAMS[o.team].c:"#ffffff"),me:!!o.me,ai:!o.me,ghost:o.ghost||null,
  vmax:o.vmax||runVmax(f),cap:o.cap||runCap(f),react:o.react??(.13+Math.random()*.13),eff:o.eff??(.94+Math.random()*.06),cruise:o.cruise??(.84+Math.random()*.05),
  style:o.style||null,legs:o.legs||null,leg:0,legX:0,x:0,v:0,sta:1,done:false,t:0,wait:0,passQ:null};}
/* what a runner would clock flat out (100 m) or well paced (400 m) — the "par" a grade is measured against */
function runPar(f,dist){const L=runLane(f,{react:.18,eff:1});const c=runCruise(L,dist);let t=0;const dt=.02;while(L.x<dist&&t<120){runStep(L,dist<=100?1:(L.x<dist-120?c:1),dt);t+=dt;}return t+.18;}
/* the fastest steady effort this runner's tank can hold until the last 120 m, keeping a quarter for the kick — the green band on the 400 m pace meter */
const RUN_PACE_HZ=152/60; /* one tap per drum beat (152 bpm) */
function runCruise(L,dist){const rem=Math.max(0,dist-120-L.x);if(rem<=0)return 1;let best=.78;for(let q=.78;q<=1.001;q+=.01){const cost=Math.pow(Math.max(0,q-.72)/.28,3)/L.cap*(rem/(q*L.vmax));if(cost<=L.sta-.25)best=q;}return best;}
function runStep(L,e,dt){let want=L.vmax*Math.pow(Math.max(0,Math.min(1,e)),.85);if(L.sta<=0)want=Math.min(want,L.vmax*.78);
  const q=want/L.vmax;if(q>.72)L.sta=Math.max(0,L.sta-Math.pow((q-.72)/.28,3)/L.cap*dt);else L.sta=Math.min(1,L.sta+(.72-q)*.06*dt);
  L.v+=(want-L.v)*Math.min(1,dt*(L.v<want?2.4:3));L.x+=L.v*dt;}
const RUN={st:null,
  el(){return document.getElementById("minibag");},
  played(G){return mgPlayed(G,"run");},
  /* opts.duel = {opp:{id,name,f,pace}, label, note, cb, next} — the regional duel; opts.race = a ready race (sports day, story challenge) */
  pick(opts){const F=bagFighters(G);const me=(G.mini&&G.mini.runLast&&F.find(f=>f.id===G.mini.runLast))||F[0];
    const lad=(G.mini&&G.mini.ladder)||0;const S={phase:"pick",dsub:"camp",rung:Math.min(lad,RUN_LADDER.length-1),md:(G.mini&&G.mini.runMd)||"solo",id:me?me.id:null,opp:null,practice:this.played(G),duel:null,race:null,act:null,...(opts||{})};
    if(S.duel||S.race)S.md="duel";if(F.length<2)S.dsub="town";
    if(!S.duel&&!S.race){const o=F.find(f=>f.id!==S.id);S.opp=o?o.id:null;}
    this.st=S;if(BAG.st)BAG.st.phase="run";this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="me"){S.id=v;if(S.opp===v)S.opp=(bagFighters(G).find(f=>f.id!==v)||{}).id||null;this.draw();}
    else if(a==="opp"){S.opp=v;this.draw();}
    else if(a==="dsub"){S.dsub=v;this.draw();}
    else if(a==="rung"){const i=+v;if(i<=((G.mini||{}).ladder||0)){S.rung=i;this.draw();}}
    else if(a==="md"){S.md=v;G.mini=G.mini||{};G.mini.runMd=v;this.draw();}
    else if(a==="go")this.set();
    else if(a==="pass")this.pass();
    else if(a==="again"){S.phase="pick";S.practice=true;this.draw();}
    else if(a==="next"&&(S.duel||S.race)){const nx=(S.duel||S.race).next;if(nx)nx();else if(typeof DUEL!=="undefined")DUEL.next();}
    else if(a==="hub"){this.stop();this.st=null;BAG.st.phase="hub";BAG.draw();}},
  stop(){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.musStop&&this.musStop(false);},
  runner(){return G.F[this.st.id]||(this.st.race&&this.st.race.me)||null;},
  /* the field for the camp modes */
  field(){const S=this.st,me=this.runner(),F=bagFighters(G).filter(f=>f.id!==S.id);
    if(S.race)return S.race.lanes(me);
    if(S.duel){const O=S.duel.opp,of=O.f||(O.id&&G.F[O.id])||runNpc(O.id||"duel_opp",O.name,14,14,200);
      return [runLane(of,{name:O.name,c:"#ffd34a",vmax:O.pace?O.pace*1.32:undefined,eff:.97}),runLane(me,{me:true,c:"#e2443c"})];}
    if(S.md==="solo"){const g=((G.mini||{}).runGhost||{})[S.id];const L=[runLane(me,{me:true,c:"#e2443c"})];if(g)L.unshift(runLane(me,{name:"Record ghost",ghost:g,c:"#9fd8ff"}));return L;}
    if(S.md==="duel"&&S.dsub==="town"){const i=Math.min(S.rung||0,RUN_LADDER.length-1),L=RUN_LADDER[i];return [runLane(ladderNpc(i),{c:"#ffd34a",style:L.style,react:L.react??.17,eff:.99}),runLane(me,{me:true,c:"#e2443c"})];}
    if(S.md==="duel"){const o=G.F[S.opp]||runLocal(0);return [runLane(o,{c:"#ffd34a"}),runLane(me,{me:true,c:"#e2443c"})];}
    /* 400 m: camp mates first, then whoever from the morning club turns up */
    const O=F.slice().sort((a,b)=>runVmax(b)-runVmax(a)).slice(0,3);let i=0;while(O.length<3)O.push(runLocal(i++));
    return [...O.map((f,k)=>runLane(f,{c:["#ffd34a","#5ab0ff","#7be08a"][k]})),runLane(me,{me:true,c:"#e2443c"})];},
  dist(){const S=this.st;return S.race?S.race.dist:S.duel?100:RUN_MODES[S.md].dist;},
  /* stars for the pick screen: how this runner compares with ours over this distance */
  vsTag(f){const me=this.runner();if(!me||!f)return "";const d=this.dist(),a=runPar(me,d),b=runPar(f,d),r=b/a;
    return r<.985?`<em class="rk hard">Faster</em>`:r<1.015?`<em class="rk even">Even</em>`:`<em class="rk easy">Slower</em>`;},
  ladderHTML(){const S=this.st,got=(G.mini||{}).ladder||0;
    return `<b class="meta">District race ladder · beaten ${got}/${RUN_LADDER.length}</b><div class="rladder">${RUN_LADDER.map((L,i)=>{const open=i<=got,f=open?ladderNpc(i):null;
      return `<button class="rrung ${i===S.rung?"on":""} ${i<got?"beat":""}" data-rn="rung" data-v="${i}" ${open?"":"disabled"} style="--hc:hsl(${L.hue} 70% 55%)"><i>${i+1}</i><span><b>${open?esc(L.n):"???"}</b><small>${open?esc(L.tag):` wins ${esc(RUN_LADDER[i-1].n)} first`}</small></span>${open?this.vsTag(f):""}${i<got?`<em class="rk beat">Beaten</em>`:""}</button>`;}).join("")}</div>
      ${RUN_LADDER[S.rung]?`<div class="rsay"><b>${esc(RUN_LADDER[S.rung].n)}:</b> "${esc(RUN_LADDER[S.rung].pre)}"</div>`:""}`;},
  /* relay: whole squads against each other, leg by leg */
  vsTeam(L,M){if(!M||!M.legs)return "";const sum=X=>X.legs.reduce((t,g)=>t+runPar(g.f,100),0),r=sum(L)/sum(M);
    return r<.985?`<em class="rk hard">Faster</em>`:r<1.015?`<em class="rk even">Even</em>`:`<em class="rk easy">Slower</em>`;},
  statBar(f){const v=runVmax(f),c=runCap(f),sv=Math.max(1,Math.min(5,Math.round((v-7.6)/.38))),sc=Math.max(1,Math.min(5,Math.round((c-11)/2.2)));
    const pip=(n)=>[0,1,2,3,4].map(i=>`<b class="${i<n?"on":""}"></b>`).join("");return `<span class="rstat"><i>SPD</i>${pip(sv)}</span><span class="rstat"><i>STA</i>${pip(sc)}</span>`;},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const F=bagFighters(G),me=this.runner();
    if(S.phase==="pick"){const B=(G.mini&&G.mini.best)||{},M=RUN_MODES[S.md],ext=S.duel||S.race;
      const card=(x,on,act)=>`<button class="mbf rcard ${on?"on":""}" data-rn="${act}" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small>${this.statBar(x)}${act==="opp"?this.vsTag(x):""}</button>`;
      const lanes=me?this.field():[];
      el.innerHTML=`<div class="mbox px rnpick"><h2>🏃 ${ext?esc((S.duel||S.race).label||"Race"):"Sirichai Camp Track"}</h2>
       ${ext?"":`<div class="sgtabs">${Object.entries(RUN_MODES).map(([k,m])=>`<button class="${k===S.md?"on":""}" data-rn="md" data-v="${k}" >${m.n}</button>`).join("")}</div>
       <p class="meta">${M.d}${S.md==="solo"?` · 100 m record ${B.run?`<b class="goldt">${B.run.toFixed(2)} s</b>`:"none yet"}`:S.md==="m400"?` · 400 m record ${B.run400?`<b class="goldt">${B.run400.toFixed(2)} s</b>`:"none yet"}`:""}</p>`}
       ${ext&&(S.duel||S.race).note?`<p class="meta center">${esc((S.duel||S.race).note)}</p>`:""}
       ${S.race&&S.race.fixedMe?"":`<b class="meta">Runner</b><div class="mbpick">${F.map(x=>card(x,x.id===S.id,"me")).join("")}</div>`}
       ${!ext&&S.md==="duel"?`<div class="sgtabs sub"><button class="${S.dsub!=="town"?"on":""}" data-rn="dsub" data-v="camp" ${F.length<2?"disabled":""}>Camp mates</button><button class="${S.dsub==="town"?"on":""}" data-rn="dsub" data-v="town">Townsfolk</button></div>`:""}
       ${!ext&&S.md==="duel"&&S.dsub!=="town"?`<b class="meta">Challenge</b><div class="mbpick">${F.filter(x=>x.id!==S.id).map(x=>card(x,x.id===S.opp,"opp")).join("")}</div>`:""}
       ${!ext&&S.md==="duel"&&S.dsub==="town"?this.ladderHTML():""}
       ${me&&(ext||S.md!=="duel")&&!(S.md==="duel"&&S.dsub==="town")?`<div class="rfield">${lanes.filter(l=>!l.me).map(l=>`<span style="--tc:${l.c}"><b>${esc(l.ghost?"Record ghost":l.legs?l.teamName:l.name)}</b>${l.ghost?`<small>${l.ghost.t.toFixed(2)} s</small>`:l.legs?this.vsTeam(l,lanes.find(q=>q.me)):this.vsTag(l.f)}</span>`).join("")||`<span><b>Running alone</b><small>No record ghost yet</small></span>`}</div>`:""}
       <p class="meta center">${ext?"":S.practice?"Already played this week · this run is practice, no rewards":"Weekly reward: Speed/Stamina · morale · stardust"}</p>
       <div class="mfoot roadbtns">${ext&&!(S.race&&S.race.canBack)?"":`<button class="btn" data-mb="close">Later</button>`}<button class="btn primary" data-rn="go" ${me?"":"disabled"}>To the start line ▸</button></div></div>`;return;}
    if(S.phase==="set"||S.phase==="race"){const L=this.meLane(),cur=L?this.legF(L):me;
      el.innerHTML=`<div class="mplay rn"><div class="mhud"><b>${esc((cur||me||{}).name||"")}</b><span id="rnmsg">${S.phase==="set"&&!S.armed?"Tap to get on the blocks":""}</span><span><b id="rnt">0.00</b> s</span><button class="xbtn" data-mb="close" aria-label="Exit">✕</button></div>
       <canvas id="rncv" width="360" height="${S.lanes.length>2?300:236}"></canvas>
       <div class="rncom" id="rncom"><img src="a/npc_caster.webp" alt=""><span id="rncomt">${S.com||"Your track commentator is ready!"}</span></div>
       <div class="mbtns ${S.relay&&!(S.phase==="set"&&!S.armed)?"two":"one"}">${S.phase==="set"&&!S.armed?`<button class="mbtn ready" id="rnready"><img src="${faceSrc((cur||me).id,"happy")}" alt=""><b>To the blocks</b><small>Tap when ready</small></button>`:S.relay?`<button class="mbtn L run" id="rnL"><b>Run!</b><small>Mash · Space</small></button><button class="mbtn pass" id="rnP"><b>Pass!</b><small>When the ring closes · Enter</small></button>`:`<button class="mbtn L run" id="rnL"><b>RUN!</b><small>Mash it · Space</small></button>`}</div></div>`;
      const rb=document.getElementById("rnready");if(rb)rb.addEventListener("pointerdown",e=>{e.preventDefault();this.arm();});
      const bl=document.getElementById("rnL");if(bl)bl.addEventListener("pointerdown",e=>{e.preventDefault();this.tap("L");});
      const bp=document.getElementById("rnP");if(bp)bp.addEventListener("pointerdown",e=>{e.preventDefault();this.pass();});
      const cv=document.getElementById("rncv");if(cv&&S.relay)cv.addEventListener("pointerdown",e=>{e.preventDefault();this.pass();});
      this.paint();return;}
    if(S.phase==="result"){const R=S.res,ext=S.duel||S.race;
      el.innerHTML=`<div class="mbox px rnres"><h2>${R.dq?"False start!":R.place===1?(S.lanes.length>1?"First across the line!":"Finished!"):`Finished place ${R.place}`}</h2>${R.grade?`<div class="mgrade g${R.grade}">${R.grade}</div>`:""}
       <div class="rtable">${R.order.map((l,i)=>`<div class="${l.me?"me":""}" style="--tc:${l.c}"><b>${i+1}</b><span>${esc(l.team?RACE_TEAMS[l.team].n+" · ":"")}${esc(l.ghost?"Record ghost":l.legs?(l.teamName||l.name):l.name)}</span><em>${l.me&&R.dq?"False start":l.t.toFixed(2)+" s"}</em></div>`).join("")}</div>
       ${R.best?`<p class="center"><b class="newrec">New record!</b>${R.prev?` was ${R.prev.toFixed(2)} s`:""}</p>`:""}
       ${R.say?`<div class="rsay"><b>${esc(R.say.n)}:</b> "${esc(R.say.t)}"</div>`:""}
       ${R.ladUp?`<p class="center"><b class="newrec">${(G.mini.ladder||0)>=RUN_LADDER.length?"All five on the district ladder beaten!":`Next challenger unlocked: ${esc(RUN_LADDER[G.mini.ladder].n)}`}</b> · ✦ +2</p>`:""}
       ${R.p4&&!R.dq?`<p class="center">Held pace in the green band <b class="goldt">${R.band.toFixed(1)} s</b>${R.empty!=null?` · tank ran dry at <b class="redt">${Math.round(R.empty)} m</b>`:""}</p>${!R.win&&R.empty!=null?`<p class="center meta">Tap with the drum first, then mash all out at the "KICK! 120 m" sign</p>`:""}`:R.chain?`<p class="center">Longest mash streak <b class="goldt">${R.chain} taps</b></p>`:""}
       <p class="center meta">Reaction ${R.react.toFixed(2)} s${R.passes?` · passes ${R.passes}`:""}${R.fs?` · false starts ${R.fs} times`:""}${R.par?` · target time for ${esc(me?me.name:"")} ${R.par.toFixed(2)} s`:""}</p>
       ${ext?(R.rw?`<p class="center">${R.rw}</p>`:""):S.practice?`<p class="center meta">Practice mode · no rewards</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns">${ext?`<button class="btn primary" data-rn="next">Next ▸</button>`:`<button class="btn" data-rn="again">Race again (practice)</button><button class="btn primary" data-mb="close">Back to camp</button>`}</div></div>`;}},
  /* v1.91.204 (Man: mashed the whole 400 m, ran out of legs and lost) — the pace read for the 400 m: ok = inside the green cruise band,
     hot = faster than the tank can hold, slow = under it, kick = the last 120 m where mashing is right. null for the sprints and the relay. */
  pace(S,L){if(!S||!L||L.done||S.relay||S.dist<400||S.phase!=="race")return null;if(L.x>=S.dist-120)return "kick";
    const cq=runCruise(L,S.dist),b0=Math.max(.72,cq-.05),q=L.v/Math.max(1,L.vmax);return q>cq+.045?"hot":q<b0-.03?"slow":"ok";},
  /* 0 right on a drum beat → 1 just before the next (music clock when the drum is playing, the gun when muted) */
  beatPh(now){const S=this.st,B=60/152,t=S.mT0!=null&&AU.ctx?AU.ctx.currentTime-S.mT0:(now-(S.gun||now))/1000;return ((t/B)%1+1)%1;},
  meLane(){const S=this.st;return S&&S.lanes&&S.lanes.find(l=>l.me);},
  legF(L){return L.legs?L.legs[Math.min(L.leg,L.legs.length-1)].f:L.f;},
  set(){const S=this.st,me=this.runner();if(!me)return;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}G.mini=G.mini||{};if(!S.race)G.mini.runLast=S.id;
    const lanes=this.field(),dist=this.dist();
    /* relay lanes: each leg's runner keeps its own top speed and tank */
    for(const L of lanes)if(L.legs){L.legs=L.legs.map(g=>({f:g.f,vmax:runVmax(g.f),cap:runCap(g.f)}));L.vmax=L.legs[0].vmax;L.cap=L.legs[0].cap;}
    Object.assign(S,{phase:"set",armed:false,gun:0,fs:S.fs||0,lanes,dist,relay:lanes.some(l=>l.legs),rate:0,lastT:0,stumble:0,done:false,t:0,react:0,com:"",cf:{},fadeT:0,
      chain:0,maxChain:0,lastTap:0,chainT:0,mile:null,shk:0,mbus:null,path:[],pathT:0,passes:[],passMsg:null});
    if(S.race&&S.race.intro)S.com=S.race.intro;else if(S.md==="duel"&&S.dsub==="town"&&!S.race&&!S.duel){const L=RUN_LADDER[S.rung];S.com=`${L.n}: "${L.pre}"`;}
    this.draw();this.loop();},
  /* v1.91.185 one tap to get on the blocks, three red lights, then green */
  arm(){const S=this.st;if(!S||S.phase!=="set"||S.armed)return;S.armed=true;S.lights=0;S.green=0;S.com="Runners are on the blocks!";AU.sfx&&AU.sfx("ui");this.draw();
    const m=document.getElementById("rnmsg");if(m)m.textContent="On your marks…";
    const on=i=>{if(!this.st||this.st.phase!=="set"||!S.armed)return;S.lights=i;S.lightT=performance.now();if(i===1)this.say("On your marks… set…");AU.tone&&AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:440,type:"square",dur:.12,peak:.14});
      if(i<3)this.to=setTimeout(()=>on(i+1),750);
      else this.to=setTimeout(()=>{if(!this.st||this.st.phase!=="set"||!S.armed)return;S.phase="race";S.gun=performance.now();S.green=S.gun;S.started=true;
        const m3=document.getElementById("rnmsg");if(m3)m3.textContent="Go!";this.musStart();AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:880,type:"square",dur:.35,peak:.18});AU.sfx&&AU.sfx("bell");try{navigator.vibrate&&navigator.vibrate(40)}catch(_){} },500+Math.random()*900);};
    this.to=setTimeout(()=>on(1),600);},
  tap(k){const S=this.st;if(!S)return;const b=document.getElementById("rnL");if(b){b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");}
    if(S.phase==="set"){if(!S.armed){this.arm();return;}S.fs++;clearTimeout(this.to);AU.sfx&&AU.sfx("ui");
      if(S.fs>=2){this.finish(true);return;}
      S.armed=false;S.lights=0;S.com="False start! Went before green!";this.draw();const mm=document.getElementById("rnmsg");if(mm)mm.textContent="False start! You went before green · one more and you're out";return;}
    const L=this.meLane();if(S.phase!=="race"||!L||L.done)return;const now=performance.now();
    if(!S.react)S.react=(now-S.gun)/1000;
    const dt=S.lastT?(now-S.lastT)/1000:.25;S.lastT=now;S.rate=Math.min(12,S.rate*.6+(1/Math.max(.07,dt))*.4);
    if(S.lastTap&&now-S.lastTap>550)S.chain=0;S.lastTap=now;S.chain=(S.chain||0)+1;S.maxChain=Math.max(S.maxChain||0,S.chain);S.chainT=now;
    const pz0=this.pace(S,L);if(pz0&&pz0!=="kick"){const ph=this.beatPh(now),off=Math.min(ph,1-ph)*60/152;S.hit={t:now,good:off<.09};}if(S.chain%25===0&&(!pz0||pz0==="kick")){S.mile={n:S.chain,t:now};S.shk=now;try{navigator.vibrate&&navigator.vibrate(25)}catch(_){}AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:1320,type:"square",dur:.12,peak:.1});}
    S.dust=(S.dust||[]).concat([{t:now}]).slice(-6);},
  /* relay: tap the track when the incoming runner is in the box — late in the box is a flying start, early drops the baton */
  pass(){const S=this.st;if(!S||S.phase!=="race"||!S.relay)return;const L=this.meLane();if(!L||L.done||L.leg>=L.legs.length-1||L.wait>0)return;
    const z=L.legX;if(z<78){this.passMsg("Not in the box yet!",false);return;}
    const q=z>=92?"perfect":z>=86?"good":"early";this.handover(L,q);},
  passMsg(t,good){const S=this.st;S.passMsg={t,good,at:performance.now()};this.say(t);},
  handover(L,q){const S=this.st,nx=L.legs[L.leg+1],carry=L.legX-100;L.leg++;L.legX=Math.max(0,carry);L.vmax=nx.vmax;L.cap=nx.cap;L.sta=1;
    L.v=L.v*({perfect:.92,good:.72,early:.4,late:.15,ai:.8}[q]);if(q==="early")L.wait=.45;if(q==="late")L.wait=.5;
    if(L.me){S.passes.push(q);this.passMsg({perfect:"Smooth hand-off!",good:"Passed!",early:"Too early! Nearly dropped it",late:"Missed the pass! Starting from standstill"}[q],q==="perfect"||q==="good");
      AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:q==="perfect"?1760:q==="good"?1320:330,type:"square",dur:.14,peak:.12});if(q==="perfect"){S.shk=performance.now();try{navigator.vibrate&&navigator.vibrate(30)}catch(_){}}
      const h=document.querySelector(".mhud b");if(h)h.textContent=nx.f.name;}},
  /* v1.91.194 (Man: the sprint needs a pumping track and effects) — a 152 BPM race loop scheduled a little ahead each frame:
     kick on every beat, clap on 2 and 4, 8th hats, a driving bass and a Thai-pentatonic riff on a square lead.
     It thickens as you mash (fever adds 16th arps) and on the final 25 m, and stops dead when the race ends. */
  musStart(){const S=this.st;if(!AU.init||!AU.init()||AU.muted)return;try{const c=AU.ctx,bus=c.createGain();bus.gain.value=.75;bus.connect(AU.sfxBus);S.mbus=bus;S.mT0=c.currentTime+.02;S.mNext=0;S.mBeat=60/152;
      AU.noiseHit(S.mT0,{f:5000,type:"highpass",q:.7,dur:.9,peak:.35,bus});}catch(e){}},
  musPump(){const S=this.st;if(!S||!S.mbus||!AU.ctx)return;const c=AU.ctx,bus=S.mbus,B=S.mBeat,ahead=c.currentTime+.35,T=(t,o)=>AU.tone(t,{...o,bus}),N=(t,o)=>AU.noiseHit(t,{...o,bus});
    const riff=[0,2,4,2,5,4,2,4, 0,2,4,5,7,5,4,2],prog=[0,0,5,3, 0,0,4,4],hz=m=>440*Math.pow(2,(m-69)/12),sc=d=>62+[0,2,4,7,9][d%5]+12*Math.floor(d/5);
    while(S.mT0+S.mNext*B/2<ahead){const i=S.mNext,t=S.mT0+i*B/2,beat=i>>1,bar=beat>>2,off=i%2,fever=S.rate>8.5,fin=S.lanes&&Math.max(...S.lanes.map(l=>l.x))>=S.dist-25;
      const root=hz(38+[0,2,4,7,9,5][prog[bar%8]%6]);
      if(!off){T(t,{f:150,to:42,type:"sine",dur:.16,peak:.5});if(beat%2)N(t,{f:1500,type:"bandpass",q:1.2,dur:.09,peak:.3});}
      N(t+(off?0:0),{f:8000,type:"highpass",q:.6,dur:.03,peak:off?.14:.08});
      T(t,{f:root*(off?2:1),type:"sawtooth",dur:B/2*.8,peak:.07});
      const n=riff[(i%16)];if(bar>=1)T(t,{f:hz(sc(n+(fin?2:0))),type:"square",dur:B/2*.75,peak:.055});
      if(fever||fin)for(let k=0;k<2;k++)T(t+k*B/4,{f:hz(sc(n+[0,4][k])+12),type:"triangle",dur:B/4*.8,peak:.06});
      if(fin&&!off)N(t,{f:3000,type:"highpass",q:.7,dur:.12,peak:.12});
      S.mNext++;}},
  musStop(end){const S=this.st;if(!S||!S.mbus)return;try{const c=AU.ctx,g=S.mbus;if(end){AU.tone(c.currentTime+.01,{f:hz2(62),type:"square",dur:.5,peak:.12,bus:g});AU.noiseHit(c.currentTime+.01,{f:4000,type:"highpass",q:.7,dur:1,peak:.3,bus:g});}
      g.gain.setTargetAtTime(0,c.currentTime+(end?.6:0),.08);setTimeout(()=>{try{g.disconnect()}catch(_){}},1500);}catch(e){}S.mbus=null;},
  /* v1.91.186 commentator */
  say(txt){const S=this.st;if(!S)return;S.com=txt;const e=document.getElementById("rncomt");if(e){e.textContent=txt;const b=document.getElementById("rncom");if(b){b.classList.remove("pop");void b.offsetWidth;b.classList.add("pop");}}},
  call(el,now){const S=this.st;if(!S||S.phase!=="race")return;const L=this.meLane();if(!L)return;const D=S.dist,me=this.legF(L).name,F=S.cf=S.cf||{};
    const others=S.lanes.filter(l=>!l.me&&!l.ghost),lead=S.lanes.filter(l=>!l.ghost).slice().sort((a,b)=>b.x-a.x)[0],nm=l=>l.legs?(l.teamName||this.legF(l).name):l.name;
    const gap=others.length?L.x-Math.max(...others.map(l=>l.x)):0,once=(k,f)=>{if(!F[k]){F[k]=1;this.say(f());}};
    if(S.react&&!F.go)once("go",()=>S.react<.2?`They're off! ${me} flies out like a bullet!`:S.react>.4?`They're off! ${me} is a beat late off the line!`:`And they're off! Everyone explodes from the line!`);
    if(!S.react&&el>.6&&!F.slow)once("slow",()=>`Green light! ${me} hasn't moved yet!`);
    const mk=lead?lead.x:L.x,q=D/4;
    if(!others.length){if(L.x>=D/2)once("q2",()=>L.ghost?"Halfway, right on the record ghost's heels!":`Halfway, ${me} isn't slowing down!`);}
    else{if(mk>=q)once("q1",()=>Math.abs(gap)<1.5?`${D/4} m! Shoulder to shoulder, folks!`:`${D/4} m: ${nm(lead)} in front!`);
      if(mk>=D/2)once("q2",()=>Math.abs(gap)<1.5?`Halfway! Still anyone's race!`:gap>8?`Halfway — ${me} has pulled well clear!`:gap>0?`Halfway — ${me} leads!`:`Halfway — ${nm(lead)} leads, ${me} chasing!`);
      if(mk>=D*.75)once("q3",()=>Math.abs(gap)<2?`Final straight! Neck and neck!`:gap<0?`Final straight — ${me} has to pick it up now!`:`Final straight — ${me} still leads!`);
      if(mk>=D-10&&Math.abs(gap)<1.2)once("photo",()=>`So close! We may need the photo finish!`);}
    if(D>=400&&!S.relay&&!L.done){if((S.hotT||0)>1.2&&L.x<D-150&&(F.hotN||0)<2&&(!F.hotAt||now-F.hotAt>6000)){F.hotN=(F.hotN||0)+1;F.hotAt=now;this.say(`${me} is pushing too hard, careful not to empty the tank before the last bend!`);}
      if(L.x>=D-120)once("kick",()=>`Last 120 metres! Everything you have left, ${me}!`);}
    if(D>=400&&L.sta<.15&&!L.done)once("empty",()=>`${me} is out of gas! The legs are getting heavy!`);
    if(S.relay&&L.legX>=78&&L.leg<L.legs.length-1&&!F["z"+L.leg]){F["z"+L.leg]=1;this.say(`In the box! Tap the track to pass to ${L.legs[L.leg+1].f.name}!`);}
    if(S.lastT&&now-S.lastT>700&&!L.done&&(!S.fadeT||now-S.fadeT>2500)&&el>1){S.fadeT=now;this.say(`${me} is fading! Keep going!`);}},
  loop(){const step=()=>{if(!this.st||(this.st.phase!=="set"&&this.st.phase!=="race"))return;this.tick();this.musPump();this.paint();this.raf=requestAnimationFrame(step);};cancelAnimationFrame(this.raf);this.raf=requestAnimationFrame(step);},
  tick(){const S=this.st,now=performance.now();if(S.phase!=="race")return;const el=(now-S.gun)/1000,dt=Math.min(.05,S.prev?(now-S.prev)/1000:.016);S.prev=now;const D=S.dist;
    if(S.lastT&&now-S.lastT>(S.pz&&S.pz!=="kick"?600:350))S.rate*=Math.pow(.2,dt);
    for(const L of S.lanes){if(L.done)continue;
      if(L.ghost){const p=L.ghost.p,i=el*10;L.x=i>=p.length-1?D:p[Math.floor(i)]+(p[Math.min(p.length-1,Math.floor(i)+1)]-p[Math.floor(i)])*(i%1);if(L.x>=D){L.done=true;L.t=L.ghost.t;}continue;}
      if(L.wait>0){L.wait-=dt;continue;}
      let e;if(L.me){e=S.react&&now>=S.stumble?S.rate/7.5:0;
        /* v1.91.206 (Man: what if the 400 had no stamina at all?) — kept the tank but made pacing a rhythm: before the 120 m sign, tapping
           once per drum beat (152 bpm → ~2.5 taps a second, a shrinking ring shows the beat for muted phones) runs exactly your cruise pace; faster burns the tank, slower loses ground */
        if(e&&D>=400&&!S.relay&&L.x<D-120)e=Math.pow(runCruise(L,D),1/.85)*S.rate/RUN_PACE_HZ;}
      else{if(el<L.react)continue;const lx=L.legs?L.legX:L.x,ld=L.legs?100:D;e=ld>=400&&lx<ld-120?(L.cq??=Math.min(1,runCruise(L,ld)+(L.cruise-.87))):L.eff*(1+.03*Math.sin(el*2.3+L.react*9));
        if(ld<400&&L.style){const fr=lx/ld;if(L.style==="fast")e=fr<.6?1:.9;else if(L.style==="kick"){if(fr<.65)e=.92;else{e=1;if(!L.kicked){L.kicked=1;L.vmax*=1.045;}}}}}
      const x0=L.x;runStep(L,e,dt);if(L.legs){L.legX+=L.x-x0;
        if(L.legX>=100&&L.leg<L.legs.length-1){if(L.me)this.handover(L,"late");else this.handover(L,"ai");}}
      if(L.x>=D){L.x=D;L.done=true;L.t=el;}}
    const L=this.meLane();
    {const pz=this.pace(S,L);if(pz){if(pz==="ok")S.bandT=(S.bandT||0)+dt;S.hotT=pz==="hot"?(S.hotT||0)+dt:0;}
     if(L&&!L.done&&S.dist>=400&&!S.relay&&L.sta<=0&&S.emptyAt==null)S.emptyAt=L.x;
     if(pz!==S.pz){if(pz==="kick")S.chain=0;S.pz=pz;const b=document.getElementById("rnL");if(b){b.classList.remove("pz-ok","pz-hot","pz-slow","pz-kick");if(pz)b.classList.add("pz-"+pz);
       const bt=b.querySelector("b"),sm=b.querySelector("small");if(bt)bt.textContent=pz==="ok"?"hold pace":pz==="hot"?"ease off!":pz==="kick"?"KICK!!":"RUN!";
       if(sm)sm.textContent=pz==="kick"?"mash all out · Space":pz?"tap as the ring closes on your runner · Space":"mash · Space";if(!pz||pz==="kick")b.style.removeProperty("--bp");}}}
    if(S.pz&&S.pz!=="kick"){const b=document.getElementById("rnL");if(b){const B=60/152,t=S.mT0!=null&&AU.ctx?AU.ctx.currentTime-S.mT0:(now-(S.gun||now))/1000;const ph=this.beatPh(now);b.style.setProperty("--bp",Math.max(0,1-ph*4).toFixed(2));}}
    if(L&&!L.done&&now-S.pathT>=100){S.pathT=now;S.path.push(Math.round(L.x*10)/10);}
    const t=document.getElementById("rnt");if(t)t.textContent=el.toFixed(2);this.call(el,now);
    const live=S.lanes.filter(l=>!l.ghost);
    if(L&&L.done&&(live.every(l=>l.done)||el>L.t+2.5)){for(const l of live)if(!l.done){l.t=el+(D-l.x)/Math.max(1,l.v);}this.finish(false);}},
  paint(){const S=this.st,cv=document.getElementById("rncv");if(!S||!cv)return;const x=cv.getContext("2d");x.imageSmoothingEnabled=false;const W=cv.width,H=cv.height,now=performance.now(),RM=typeof JUICE_RM==="function"?JUICE_RM():false;
    const D=S.dist,me=this.meLane();x.save();if(!RM&&S.shk&&now-S.shk<220){const a=(1-(now-S.shk)/220)*4;x.translate((Math.random()-.5)*a,(Math.random()-.5)*a);}
    const sky=H*(S.lanes.length>2?.36:.46),bg=img("bg_sportsday.webp");if(bg.complete&&bg.naturalWidth){const sw=bg.naturalWidth,sh=bg.naturalHeight*.55,par=me?(me.x*.6)%(sw*.3):0;x.drawImage(bg,par*0,0,sw,sh,0,0,W,sky);}else{x.fillStyle="#7fb6e6";x.fillRect(0,0,W,sky);}
    /* track: one lane per runner, ours nearest the camera */
    const n=S.lanes.length,top=sky,lh=(H-top)/n,ly=i=>top+(i+1)*lh-3,lead=Math.max(...S.lanes.map(l=>l.x)),camX=me?me.x:lead;
    const cam=Math.max(0,Math.min(D-28,camX-12)),px=m=>(m-cam)*(W/36)+40;
    x.fillStyle="#c8553d";x.fillRect(0,top,W,H-top);x.fillStyle="#b4482f";x.fillRect(0,top,W,4);
    for(let i=0;i<n;i++){x.fillStyle=i%2?"rgba(0,0,0,.05)":"rgba(255,255,255,.03)";x.fillRect(0,top+i*lh,W,lh);x.fillStyle="#f3e9dc";x.fillRect(0,top+(i+1)*lh-1,W,2);}
    for(let m=0;m<=D;m+=10){const X=px(m);if(X<-10||X>W+10)continue;x.fillStyle="rgba(255,255,255,.55)";x.fillRect(X,top+2,2,H-top);if(m%50===0||D<=100){x.fillStyle="#fff";x.font="bold 10px sans-serif";x.textAlign="left";x.fillText(m+"",X+3,top+11);}}
    if(S.relay)for(let k=1;k<4;k++){const a=px(k*100-22),b=px(k*100);if(b<-10||a>W+10)continue;x.fillStyle="rgba(255,211,74,.28)";x.fillRect(a,top,b-a,H-top);x.fillStyle="#ffd34a";x.fillRect(b-2,top,3,H-top);}
    if(D>=400&&!S.relay){const kx=px(D-120);if(kx>-30&&kx<W+10){x.fillStyle="#ffd34a";x.fillRect(kx-1,top,3,H-top);x.font='900 13px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.textAlign="left";x.lineWidth=4;x.strokeStyle="#140a1e";x.strokeText("KICK! 120 m",kx+5,top+26);x.fillStyle="#ffd34a";x.fillText("KICK! 120 m",kx+5,top+26);}}
    const fx=px(D);if(fx<W+10){for(let i=0;i<Math.ceil((H-top)/9.5);i++){x.fillStyle=i%2?"#000":"#fff";x.fillRect(fx,top+i*9.5,6,9.5);}}
    const fr=v=>v>.5?Math.floor(now/Math.max(70,260-v*18))%4:0,sh=Math.min(62,lh*1.55);
    const drawR=(f,m,v,footY,stum,al=1)=>{if(!f)return;const s=sheetFor(f);if(!s||!(s.complete||s.width))return;const bob=v>.5?Math.abs(Math.sin(now/90))*3:0;drawFrame(x,s,stum?ROW.guard:ROW.walk,fr(v),px(m),footY-bob,sh,false,al);};
    S.lanes.forEach((L,i)=>{const fy=ly(i),f=this.legF(L);
      if(L.legs&&L.leg<L.legs.length-1&&!L.done){const nx=L.legs[L.leg+1].f,wx=(L.leg+1)*100;drawR(nx,wx,0,fy,false,.9);}
      const fever=L.me&&S.phase==="race"&&!L.done&&S.rate>8.5;
      if(fever&&!RM){x.save();const gx=px(L.x),gr=x.createRadialGradient(gx,fy,4,gx,fy,46);gr.addColorStop(0,"rgba(255,214,80,.55)");gr.addColorStop(1,"rgba(255,214,80,0)");x.fillStyle=gr;x.fillRect(gx-50,fy-26,100,30);x.restore();
        for(let k=2;k>=1;k--)drawR(f,L.x-k*2.6,L.v,fy,false,k===2?.14:.3);}
      drawR(f,L.x,L.v,fy,L.me&&now<S.stumble,L.ghost?.38:1);
      if(L.me&&!RM)for(const d of S.dust||[]){const e=(now-d.t)/400;if(e>1)continue;x.fillStyle=`rgba(240,220,190,${.6*(1-e)})`;x.beginPath();x.arc(px(L.x)-14-e*18,fy-e*6,3+e*6,0,7);x.fill();}
      /* lane tag */
      x.fillStyle=L.c;x.fillRect(0,top+i*lh+3,4,lh-6);if(L.me){x.fillStyle="rgba(255,255,255,.9)";x.font="bold 9px sans-serif";x.textAlign="left";x.fillText("▶",6,top+i*lh+12);}});
    if(S.phase==="race"&&me&&me.v>6){x.save();x.globalAlpha=Math.min(.45,(me.v-6)/10);x.strokeStyle="#fff";x.lineWidth=2;for(let i=0;i<7;i++){const yy=top+((i*37)%(H-top)),xx=(W-((now*.9+i*61)%(W+80)));x.beginPath();x.moveTo(xx,yy);x.lineTo(xx+40,yy);x.stroke();}x.restore();}
    /* relay (v1.91.197, Man: couldn't see where to tap): a ring closes in on the next runner; tap when it meets the inner circle */
    /* v1.91.206 (Man: the beat ring belongs on the track, like the relay ring) — closes on our runner once per drum beat while pacing */
    {const pz=this.pace(S,me);if(pz&&pz!=="kick"&&!RM){const i=S.lanes.indexOf(me),fy=ly(i),cx=px(me.x),cy=fy-sh*.45,r0=22,ph=this.beatPh(now),r=r0+(1-ph)*62;
      const col=pz==="ok"?"#5dff7a":pz==="hot"?"#ff8a3a":"#ffffff";x.save();
      x.lineWidth=4;x.strokeStyle="#140a1e";x.globalAlpha=.55;x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();x.lineWidth=2;x.strokeStyle="#ffffff";x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();
      x.globalAlpha=.35+ph*.6;x.lineWidth=6;x.strokeStyle="#140a1e";x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();x.lineWidth=4;x.strokeStyle=col;x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();x.globalAlpha=1;
      const h=S.hit,ha=h?(now-h.t)/450:2;if(ha<1){x.font='900 16px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.textAlign="center";x.lineWidth=4;x.strokeStyle="#140a1e";const tx=h.good?"Nice!":"…";
        x.globalAlpha=1-ha;x.strokeText(tx,cx,cy-r0-8-ha*14);x.fillStyle=h.good?"#7dff8f":"#ffffff";x.fillText(tx,cx,cy-r0-8-ha*14);x.globalAlpha=1;}
      x.restore();}}
    {const bp=document.getElementById("rnP"),zone=S.relay&&me&&!me.done&&me.leg<me.legs.length-1&&me.legX>=72&&me.wait<=0;
     if(bp){bp.classList.toggle("live",!!zone);bp.classList.toggle("now",!!zone&&me.legX>=92);}
     if(zone){const fy=ly(n-1),cx=px((me.leg+1)*100),cy=fy-sh*.45,r0=22,k=Math.max(0,(95-me.legX)/23),r=r0+k*70,ok=me.legX>=92,mid=me.legX>=86;
      const zx=px(me.leg*100+78),zx2=px(me.leg*100+100);x.save();x.fillStyle="rgba(255,211,74,.22)";x.fillRect(zx,top,zx2-zx,H-top);
      x.lineWidth=4;x.strokeStyle="#140a1e";x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();x.lineWidth=3;x.strokeStyle="#ffffff";x.beginPath();x.arc(cx,cy,r0,0,7);x.stroke();
      x.lineWidth=6;x.strokeStyle=ok?"#5dff7a":mid?"#ffd34a":"#ff8a3a";x.globalAlpha=.9;x.beginPath();x.arc(cx,cy,r,0,7);x.stroke();x.globalAlpha=1;
      x.font='900 18px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.textAlign="center";x.lineWidth=5;x.strokeStyle="#140a1e";const tx=ok?"Tap!":"Pass…";
      x.strokeText(tx,cx,cy-r0-12);x.fillStyle=ok?"#5dff7a":"#ffd34a";x.fillText(tx,cx,cy-r0-12);x.restore();}}
    if(S.passMsg&&now-S.passMsg.at<900){const e=(now-S.passMsg.at)/900;x.save();x.globalAlpha=1-e;x.textAlign="center";x.font='900 24px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=6;x.strokeStyle="#140a1e";x.strokeText(S.passMsg.t,W/2,sky-10-e*14);x.fillStyle=S.passMsg.good?"#7dff8f":"#ff8a6a";x.fillText(S.passMsg.t,W/2,sky-10-e*14);x.restore();}
    /* start lights */
    if(S.phase==="set"&&S.armed||S.phase==="race"&&now-S.gun<900){const g=S.phase==="race",cx=W/2,cy=H*.24;x.save();x.fillStyle="#141018";x.fillRect(cx-74,cy-24,148,48);x.strokeStyle="#000";x.lineWidth=3;x.strokeRect(cx-74,cy-24,148,48);
      for(let i=0;i<3;i++){const lit=g||S.lights>i,col=g?"#3dff6a":"#ff2a2a";const lx=cx-46+i*46;x.fillStyle=lit?col:"#3a2a30";x.beginPath();x.arc(lx,cy,16,0,7);x.fill();if(lit){x.globalAlpha=.35;x.beginPath();x.arc(lx,cy,24,0,7);x.fill();x.globalAlpha=1;}}
      if(!g&&S.lights>0){const e=(now-S.lightT)/300,sc=1+.6*Math.max(0,1-e);x.font=`900 ${Math.round(54*sc)}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=8;x.strokeStyle="#000";x.strokeText(String(4-S.lights),cx,cy+66);x.fillStyle="#fff";x.fillText(String(4-S.lights),cx,cy+66);}
      if(g){const e=(now-S.gun)/900,sc=1.8-.8*Math.min(1,e*3);x.globalAlpha=Math.max(0,1-Math.max(0,e-.6)/.4);x.font=`900 ${Math.round(64*sc)}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.lineWidth=10;x.strokeStyle="#0a3a14";x.strokeText("Go!",cx,cy+70);x.fillStyle="#7dff8f";x.fillText("Go!",cx,cy+70);
        for(let i=0;i<14;i++){const a=i/14*6.283,r=40+e*160;x.fillStyle="#ffe066";x.fillRect(cx+Math.cos(a)*r-3,cy+70+Math.sin(a)*r*.6-3,6,6);}}
      x.restore();}
    /* tap chain counter */
    const pz=this.pace(S,me);
    if(pz&&pz!=="kick"){const col=pz==="ok"?"#7dff8f":pz==="hot"?"#ff9a2a":"#ffffff",big=pz==="ok"?(S.bandT||0).toFixed(1)+" s":pz==="hot"?"ease off!":"a bit faster",sub=pz==="ok"?"holding pace!":pz==="hot"?"tank running dry":"under the green band";
      x.save();x.translate(W-12,72);x.rotate(-.06);x.textAlign="right";x.textBaseline="alphabetic";x.font='italic 900 34px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=7;x.strokeStyle="#140a1e";x.strokeText(big,0,0);x.fillStyle=col;x.fillText(big,0,0);
      x.font='900 14px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=4;x.strokeText(sub,0,18);x.fillStyle="#fff";x.fillText(sub,0,18);x.restore();}
    else if(S.phase==="race"&&S.chain>=3){const age=now-S.chainT,alive=age<550||(me&&me.done),fade=alive?1:Math.max(0,1-(age-550)/500);
      if(fade>0){const k=S.chain,bump=RM?1:1+.35*Math.max(0,1-age/120),col=k>=75?"#ff4a4a":k>=50?"#ff9a2a":k>=25?"#ffd34a":"#ffffff",jx=!RM&&k>=50&&alive?(Math.random()-.5)*2:0;
        x.save();x.globalAlpha=fade;x.translate(W-12+jx,72);x.rotate(-.08);x.scale(bump,bump);x.textAlign="right";x.textBaseline="alphabetic";
        x.font='italic 900 40px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=7;x.strokeStyle="#140a1e";x.strokeText(String(k),0,0);x.fillStyle=col;x.fillText(String(k),0,0);
        x.font='900 14px "Chakra Petch","IBM Plex Sans Thai",sans-serif';x.lineWidth=4;x.strokeText("in a row!",0,18);x.fillStyle="#fff";x.fillText("in a row!",0,18);x.restore();}}
    if(S.mile&&now-S.mile.t<900){const e=(now-S.mile.t)/900,cx=W/2,cy=sky*.62;x.save();x.globalAlpha=1-e;x.textAlign="center";x.textBaseline="middle";
      x.font=`900 ${Math.round(30*(1+.4*Math.max(0,1-e*4)))}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;x.lineWidth=7;x.strokeStyle="#3a1400";const tx=S.mile.n>=75?"On fire!":S.mile.n>=50?"Legs won't stop!":"Speed up!";x.strokeText(tx,cx,cy-e*16);x.fillStyle="#ffd34a";x.fillText(tx,cx,cy-e*16);
      if(!RM)for(let i=0;i<12;i++){const a=i/12*6.283,r=20+e*120;x.fillStyle=i%2?"#ffd34a":"#ff7a3a";x.fillRect(cx+Math.cos(a)*r-3,cy+Math.sin(a)*r*.55-3,6,6);}x.restore();}
    if(S.phase==="race"&&me&&!me.done&&lead>=D-25&&!RM){const p=.5+.5*Math.sin(now/((S.mBeat||.39)*1000)*Math.PI*2);const g2=x.createLinearGradient(0,0,26,0);g2.addColorStop(0,`rgba(255,60,60,${.25+.2*p})`);g2.addColorStop(1,"rgba(255,60,60,0)");x.fillStyle=g2;x.fillRect(0,0,26,H);x.save();x.translate(W,0);x.scale(-1,1);x.fillStyle=g2;x.fillRect(0,0,26,H);x.restore();}
    /* top strip: everyone's position on a mini track, then our tank (400 m and relay) with the cruise band */
    x.fillStyle="rgba(10,6,20,.72)";x.fillRect(0,0,W,me&&(D>=400||S.relay)?36:20);x.fillStyle="#3a3158";x.fillRect(8,8,W-16,4);
    if(S.relay)for(let k=1;k<4;k++){x.fillStyle="#ffd34a";x.fillRect(8+(W-16)*k/4-1,6,2,8);}
    for(const L of S.lanes){const X=8+(W-16)*Math.min(1,L.x/D);x.fillStyle=L.c;x.globalAlpha=L.ghost?.55:1;x.fillRect(X-3,L.me?4:6,6,L.me?12:8);x.globalAlpha=1;if(L.me){x.strokeStyle="#fff";x.lineWidth=1;x.strokeRect(X-3.5,3.5,7,13);}}
    if(me&&(D>=400||S.relay)){const bw=120,bx=8,by=22,q=me.v/Math.max(1,me.vmax);x.fillStyle="#fff";x.font="bold 9px sans-serif";x.textAlign="left";x.fillText("Stamina",bx,by+8);
      x.fillStyle="#241c38";x.fillRect(bx+22,by,bw,9);x.fillStyle=me.sta>.45?"#5be06a":me.sta>.18?"#ffd34a":"#ff5a4a";x.fillRect(bx+22,by,bw*me.sta,9);x.strokeStyle="#000";x.strokeRect(bx+22.5,by+.5,bw,9);
      if(D>=400){const ex=bx+bw+32;x.fillStyle="#fff";x.fillText("Pace",ex,by+8);const mx=ex+30,mw=W-mx-10;x.fillStyle="#241c38";x.fillRect(mx,by,mw,9);{const cq=me.x<D-120?runCruise(me,D):1,b0=Math.max(.72,cq-.05);x.fillStyle="rgba(91,224,106,.6)";x.fillRect(mx+mw*b0,by,mw*(cq-b0),9);}
        x.fillStyle=q>.92?"#ff7a3a":"#ffffff";x.fillRect(mx+mw*Math.min(1,q)-2,by-2,4,13);}}
    x.restore();},
  finish(dq){const S=this.st;if(S&&S.mbus)this.musStop(true);this.stop();if(S.phase==="result")return;S.phase="result";const me=this.meLane(),D=S.dist;
    if(dq&&me){me.t=99;me.done=true;for(const l of S.lanes)if(!l.done)l.t=99;}
    const live=S.lanes.filter(l=>!l.ghost),order=S.lanes.slice().sort((a,b)=>a.t-b.t),place=live.slice().sort((a,b)=>a.t-b.t).indexOf(me)+1;
    const t=dq?99:me.t,f=this.runner(),par=f&&!S.relay?runPar(f,D):0,r=par?t/par:1;
    let grade=dq?"C":r<=1.02?"S":r<=1.07?"A":r<=1.14?"B":"C";const p4=D>=400&&!S.relay;if(p4&&live.length>1&&place>1&&(grade==="S"||grade==="A"))grade="B";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};const bk=D>=400?"run400":"run",ext=S.duel||S.race;
    const prev=G.mini.best[bk]||null,isBest=!dq&&!ext&&!S.relay&&(!prev||t<prev);if(isBest)G.mini.best[bk]=Math.round(t*100)/100;
    /* the ghost is per runner, 100 m only */
    if(!dq&&!ext&&D===100&&f){G.mini.runGhost=G.mini.runGhost||{};const g=G.mini.runGhost[f.id];if(!g||t<g.t)G.mini.runGhost[f.id]={t:Math.round(t*100)/100,p:S.path.concat([D])};}
    let say=null,ladUp=false;if(!ext&&S.md==="duel"&&S.dsub==="town"&&!dq){const L=RUN_LADDER[S.rung],won=place===1;say={n:L.n,t:won?L.lose:L.win};
      if(won&&S.rung===(G.mini.ladder||0)){G.mini.ladder=(G.mini.ladder||0)+1;ladUp=true;G.dust=(G.dust||0)+2;if(G.mini.ladder<RUN_LADDER.length)S.rung=G.mini.ladder;}}
    if(S.race&&S.race.say)say=S.race.say(place===1);
    const passTxt=S.passes&&S.passes.length?S.passes.map(q=>({perfect:"clean",good:"Good",early:"early",late:"late"}[q])).join(" · "):"";
    S.res={win:place===1,place,t,ot:(live.find(l=>!l.me)||{}).t||0,dq,fs:S.fs,react:S.react||0,chain:S.maxChain||0,grade:ext||S.relay?null:grade,best:isBest&&!(p4&&place>1),p4,band:S.bandT||0,empty:S.emptyAt,prev,par,order,passes:passTxt,rw:"",say,ladUp};
    const out={win:place===1,place,t,ot:S.res.ot,dq,order:order.map(l=>({team:l.team,t:l.t,me:l.me}))};
    if(S.race&&S.race.cb)S.race.cb(out);
    else if(S.duel&&S.duel.cb){S.duel.cb(out);}
    else if(S.duel&&typeof DUEL!=="undefined"){DUEL.done({win:out.win,score:t},S);}
    else if(!S.practice)S.res.rw=this.reward(grade,place===1&&live.length>1);
    save();this.draw();AU.sfx&&AU.sfx(place===1?"level":"ui");},
  reward(grade,win){const S=this.st,f=this.runner(),out=[];G.campUsed=S.act||"run";G.campNote=`${CAMP_ACTIONS.run.name} · grade ${grade}`;
    const g={S:.16,A:.12,B:.08,C:.04}[grade],cap=Math.min(stCap(f),(f.potential||14)+1.5),key=S.md==="m400"?["stamina","speed"]:["speed","stamina"];
    const up=k=>{const b=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g)*100)/100);return f.a[k]>b;};
    if(up(key[0])|up(key[1]))out.push(`Speed/stamina +${g}`);else out.push("Speed/stamina already at potential");
    const mo=win?6:3;f.morale=Math.min(100,(f.morale||0)+mo);out.push(`Morale +${mo}`);f.fatigue=Math.min(100,(f.fatigue||0)+(S.md==="m400"?7:5));out.push(`Fatigue +${S.md==="m400"?7:5}`);
    const o=S.md==="duel"&&S.dsub!=="town"&&G.F[S.opp];if(o){o.fatigue=Math.min(100,(o.fatigue||0)+3);const R=S.res;if(Math.abs(R.t-R.ot)<.3){add(G,o.id,"bond",1);add(G,f.id,"bond",1);out.push("So close they both burst out laughing");}
      if(win&&runPar(o,100)<runPar(f,100)){G.dust=(G.dust||0)+2;out.push("Beat someone faster! ✦ +2");}}
    const du={S:5,A:3,B:2,C:1}[grade];G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);out.push(esc(RUN_LINE[grade]));
    G.flags.runN=(G.flags.runN||0)+1;if(grade==="S")G.flags.runS=(G.flags.runS||0)+1;
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 New card ×${got.length}`);}}
    return `<span class="rwl">${out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span>`;}};
MG_MODES.run={icon:"🏃",title:"Camp Track",note:"100 m time trial · 1-on-1 · 400 m with 4 · Speed/Stamina, stardust",open:G=>(G.week>=6||(G.season||1)>=2)&&bagFighters(G).length>=1,custom:true};
MG_ACT.run="run";
/* v1.90: district sports day — once a year from week 24: 100 m sprint, tug of war and a 3-leg relay against the other colours; points per event */
const SPORTS_WK=24;
const SP_TEAMS=[{k:"me",n:"Red · Sirichai Camp",c:"#d9473b"},{k:"tiger",n:"Yellow · Golden Tiger Camp",c:"#e2b23a"},{k:"teach",n:"Blue · District School teachers",c:"#3a86d9"},{k:"obt",n:"Green · District Office team",c:"#3aa65a"}];
const SP_EV=[{k:"run",n:"100 m sprint",ic:"🏃",d:"Pick one runner to race the other 3 colours, 4 lanes"},{k:"run400",n:"400 m",ic:"🏃",d:"One lap, 4 lanes · Hold the green band, then go all out for the last 120 m"},{k:"tug",n:"Tug of war",ic:"🪢",d:"The whole camp pulls together · tap Pull fast, then hit Heave! when the needle is in the green"},{k:"relay",n:"4×100 relay",ic:"🏅",d:"The camp's four fastest run 100 m each · Mash to run, then tap the track in time at the hand-over box"}];
function sportsDue(G){return !G.ended&&G.week>=SPORTS_WK&&G.week<=SPORTS_WK+4&&!(G.sports||{})[G.season||1]&&roster(G).length>=1;}
function sportsDayYear(done){if(!sportsDue(G)){done();return;}SPORTS.open(done);}
/* v1.91.195 the four colours each send real runners: Golden Tiger's fighters (the fastest of them), the district school's teachers, the sub-district office;
   the teachers and the office get a little quicker every year, Golden Tiger is as quick as its fighters are */
function spSquad(k){const y=G.season||1,T=RACE_TEAMS[k];
  if(k==="me"){const R=roster(G).filter(f=>!f.injury).sort((a,b)=>runVmax(b)-runVmax(a));let i=0;while(R.length<4)R.push(runNpc("sp_stu"+i,["Tonkla, camp student","Khaopan, camp student","Min, camp student","Ball, camp student"][i++],10,10,0));return R;}
  if(k==="tiger"){const R=SPORTS.rivals().slice(0,4);if(G.dare&&G.dare.done)R.unshift(runDareRival(false));R.splice(4);let i=0;while(R.length<4)R.push(runNpc("sp_y"+i,["Suea Lek, Golden Tiger","Suea Noi, Golden Tiger","Suea Khrong, Golden Tiger","Suea Lueang, Golden Tiger"][i++],Math.min(19,13+y*.8),Math.min(19,13+y*.7),T.hue));return R;}
  const base=k==="teach"?[10.5,12]:[9,11],gr=k==="teach"?[.7,.5]:[.6,.5],cap=k==="teach"?17:15,P=SP_SQUADS[k],r=mulberry32((G.seed||1)+y*31+(k==="teach"?7:13));
  const rest=P.slice(1).map(x=>[x,r()]).sort((a,b)=>a[1]-b[1]).slice(0,3).map(x=>x[0]);
  const sq=[P[0],...rest].map(([id,n],i)=>runNpc(id,n,Math.min(cap+(i?0:1.5),base[0]+gr[0]*y+(i?-.4*i:.8)),Math.min(cap,base[1]+gr[1]*y),T.hue));
  const g=spGuest();if(g&&g.team===k){sq.splice(1,0,g.f);sq.length=4;sq.guest=g.f;}return sq;}
/* v1.91.199 (Man: it'd be funny if real fighters turned up at sports day) — every year one boxer from outside the camp runs as a guest
   for the teachers or the TAO: Pailin, a Vector Lab fighter, or a fighter from the district league. Golden Tiger's own stay in yellow. */
function spGuest(){const y=G.season||1,r=mulberry32((G.seed||1)+y*53),tig=new Set(SPORTS.rivals().map(f=>f.id));
  const P=Object.values(G.F).filter(f=>!f.retired&&!f.injury&&f.camp!=="player"&&f.camp!=="region"&&!tig.has(f.id)&&(f.camp==="rival"||f.camp==="npc")&&f.a);
  if(!P.length)return null;const star=P.filter(f=>f.camp==="rival").sort((a,b)=>(b.id==="pailin")-(a.id==="pailin")||a.id.localeCompare(b.id)),useStar=star.length&&r()<.65,f=useStar?star[(y-1)%star.length]:P[Math.floor(r()*P.length)];return {f,team:r()<.5?"teach":"obt"};}
const SPORTS={st:null,
  el(){return document.getElementById("minibag");},
  open(done){BAG.st={phase:"sports",mode:"run",practice:true};BAG.mount();this.st={ph:"intro",ev:0,pts:{me:0,tiger:0,teach:0,obt:0},log:[],done};this.draw();},
  /* v1.91.197 (Man: why is Pailin running for Golden Tiger?) — only Golden Tiger's own fighters wear yellow: Ploy and Fah before they join us,
     Petchara, and Baiyok while she is still theirs. Vector Lab and Pailin are another camp and stay out; Tiger's students fill the gaps. */
  rivals(){return Object.values(G.F).filter(f=>f.camp==="rival"&&!f.retired&&!f.lab&&!f.indie&&/พยัคฆ์ทอง/.test(f.full||"")).sort((a,b)=>(b.a.speed||0)-(a.a.speed||0));},
  /* points by finishing order: 3 · 2 · 1 · 0 */
  rankOrder(order){const S=this.st;[3,2,1,0].forEach((p,i)=>S.pts[order[i]]+=p);S.log.push({ev:S.ev,order,win:order[0]==="me",place:order.indexOf("me")+1});},
  rank(win,none){const S=this.st,r=mulberry32((G.seed||1)+(G.season||1)*97+S.ev*13),o=r()<.5?["teach","obt"]:["obt","teach"];
    this.rankOrder(none?["tiger",...o,"me"]:win?["me","tiger",...o]:["tiger","me",...o]);},
  act(a){const S=this.st;if(!S)return;
    if(a==="go"){S.ph="ev";this.draw();}
    else if(a==="start")this.startEv();
    else if(a==="next"){S.ev++;if(S.ev>=SP_EV.length){this.finish();return;}S.ph="ev";this.draw();}
    else if(a==="tap")TUG.tap();else if(a==="heave")TUG.heave();
    else if(a==="skip"){if(S.ph==="final"&&!S.skip){S.skip=true;this.draw();}}
    else if(a==="end")this.close();},
  race(E){const S=this.st,keys=["tiger","teach","obt"],sq={};for(const k of [...keys,"me"])sq[k]=spSquad(k);const y=G.season||1;
    const back=()=>{RUN.stop();RUN.st=null;BAG.st.phase="sports";S.ph="res";this.draw();},cb=res=>{this.rankOrder(res.order.map(o=>o.team));S.res=res;};
    const lane=(k,f,me)=>runLane(f,{team:k,me,eff:k==="tiger"?.97+Math.random()*.03:k==="teach"?.93+Math.random()*.05:.9+Math.random()*.06,cruise:k==="tiger"?.87:.84+Math.random()*.04});
    const intro=`Yellow lane: ${sq.tiger[0].name} · Blue ${sq.teach[0].name} · Green ${sq.obt[0].name} · every colour's favourite is set!`;
    if(E.k==="relay"){const mk=k=>{const L=lane(k,sq[k][0],k==="me");L.legs=sq[k].slice(0,4).map(f=>({f}));L.teamName=RACE_TEAMS[k].n;return L;};
      return {label:"Sports day · 4×100 relay",note:`Legs 1–4: ${sq.me.slice(0,4).map(f=>f.name).join(" → ")} · Mash to run; in the yellow box, tap the track to hand over the baton (or Enter) · Tap late in the box for a clean pass`,
        dist:400,fixedMe:true,intro,me:sq.me[0],lanes:()=>[...keys.map(mk),mk("me")],cb,next:back};}
    const d=E.k==="run400"?400:100,pickF=k=>k==="tiger"?sq.tiger[d===400?1:0]||sq.tiger[0]:sq[k].guest?(d===400?sq[k][0]:sq[k].guest):sq[k][d===400?1:0];
    return {label:`Sports day · ${d} m`,note:`4 colours, 4 lanes · 1st scores 3, 2nd 2, 3rd 1 · Rivals: ${keys.map(k=>`${RACE_TEAMS[k].n} ${pickF(k).name}`).join(" · ")}`,dist:d,intro:(()=>{const gk=["teach","obt"].find(k=>sq[k].guest&&pickF(k)===sq[k].guest);return gk?`A guest runner, folks! ${sq[gk].guest.name} runs for ${RACE_TEAMS[gk].n}${gk==="obt"?"the TAO team":"the teachers"}! Who invited her?!`:`Yellow lane: ${pickF("tiger").name} · Blue ${pickF("teach").name} · Green ${pickF("obt").name} · ready to go!`;})(),
      lanes:me=>[...keys.map(k=>lane(k,pickF(k),false)),lane("me",me,true)],cb,next:back};},
  startEv(){const S=this.st,E=SP_EV[S.ev];
    if(E.k==="tug"){S.ph="tug";TUG.start(res=>{if(!this.st)return;this.rank(res.win);S.res=res;S.ph="res";this.draw();});return;}
    const R=this.race(E);RUN.pick(R.fixedMe?{race:R,id:R.me.id}:{race:R});},
  table(){const S=this.st;return `<div class="sp-tab">${SP_TEAMS.slice().sort((a,b)=>S.pts[b.k]-S.pts[a.k]).map(T=>`<div class="sp-row${T.k==="me"?" me":""}" style="--tc:${T.c}"><i></i><span>${esc(T.n)}</span><b>${S.pts[T.k]}</b></div>`).join("")}</div>`;},
  finish(){const S=this.st,order=SP_TEAMS.map(t=>t.k).sort((a,b)=>S.pts[b]-S.pts[a]||(a==="me"?-1:b==="me"?1:0)),place=order.indexOf("me")+1,y=G.season||1;
    const mo=place===1?6:place===2?4:2,du=place===1?6:place===2?4:2,out=[];
    for(const f of roster(G))f.morale=Math.min(100,(f.morale||0)+mo);out.push(`Morale for everyone +${mo}`);G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
    if(place===1){G.rep=(G.rep||0)+1;out.push("Fame +1");G.flags.sportsWin=(G.flags.sportsWin||0)+1;}
    G.sports=G.sports||{};G.sports[y]={place,pts:{...S.pts}};
    if(typeof cardCheck==="function"){const got=cardCheck(G);if(got.length){G.cardPend=(G.cardPend||[]).concat(got);out.push(`🃏 New card ×${got.length}`);}}
    S.place=place;S.out=out;S.ph="final";S.skip=false;save();this.draw();this.ceremony();},
  /* v1.91.197 (Man: announce the sports-day result like the camp contest) — the district chief reads the table from fourth up:
     drum ticks under each name, the podium rises colour by colour, the winner gets the bell and the confetti */
  ceremony(){const S=this.st,P=S.place,T=[900,2300,3700,5400];clearTimeout(this.cto);this.cto=[];
    const tick=(t,f)=>this.cto.push(setTimeout(()=>{if(this.st===S&&!S.skip)f();},t));
    for(let i=0;i<4;i++){for(let k=0;k<4;k++)tick(T[i]-480+k*110,()=>AU.init&&AU.init()&&AU.tone(AU.ctx.currentTime+.01,{f:150+k*20,to:70,type:"sine",dur:.08,peak:.25}));
      tick(T[i],()=>AU.sfx&&AU.sfx(i===3?(P===1?"champ":"bell"):"ui"));}
    if(P===1)for(let i=0;i<5;i++)tick(5900+i*900,()=>AU.sfx&&AU.sfx("pop"));},
  close(){const S=this.st;if(!S)return;(this.cto||[]).forEach(clearTimeout);this.st=null;TUG.stop();if(RUN.st){RUN.stop();RUN.st=null;}
    const y=G.season||1;if(!(G.sports||{})[y]){G.sports=G.sports||{};G.sports[y]={place:0,pts:{...S.pts},left:1};}
    const el=this.el();if(el)el.remove();BAG.st=null;save();try{AU.startMusic("hub");}catch(e){}render();if(S.done)S.done();},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const E=SP_EV[S.ev];
    if(S.ph==="intro"){el.innerHTML=`<div class="mbox px sp"><h2>🎌 District sports day, year ${G.season||1}</h2>
       <div class="ctip"><img src="${faceSrc("coach")}" alt=""><span>The district's invited us to sports day again. We're Red, Golden Tiger is Yellow, the school teachers are Blue and the TAO team is Green… don't you dare lose to Golden Tiger!</span></div>
       ${(()=>{const g=spGuest();return g?`<div class="rsay"><b>Trackside rumour:</b> this year ${g.team==="obt"?"the TAO team":"the teachers"} has a real boxer as a guest… ${esc(g.f.name)}!</div>`:"";})()}
       ${this.table()}<p class="meta">${SP_EV.length} events: ${SP_EV.map(e=>e.ic+" "+e.n).join(" · ")} · 1st scores 3, 2nd 2, 3rd 1 · Winning colour = fame +1 · everyone's morale · stardust</p>
       <div class="mfoot roadbtns"><button class="btn" data-sp="end">Skip this year</button><button class="btn primary" data-sp="go">To the field ▸</button></div></div>`;return;}
    if(S.ph==="ev"){el.innerHTML=`<div class="mbox px sp"><h2>${E.ic} Event ${S.ev+1}/${SP_EV.length}: ${E.n}</h2><p class="meta">${E.d}</p>${this.table()}
       <div class="mfoot roadbtns"><button class="btn primary" data-sp="start">Start ▸</button></div></div>`;return;}
    if(S.ph==="tug"){TUG.draw();return;}
    if(S.ph==="res"){const R=S.res||{},L=S.log[S.log.length-1]||{},pl=L.place||0,run=E.k!=="tug";
      const line=R.none?"The camp couldn't enter this one, so the other colours have it this year":pl===1?(E.k==="relay"?"The anchor crosses first! The whole camp runs onto the track for a group hug.":E.k==="tug"?"The rope slides all the way to Red! Yellow ends up in a heap in the middle of the field.":"Red crosses the line first! Sirichai's cheering squad drums the whole field down.")
        :E.k==="tug"?"Yellow drags the rope all the way… Kru Daeng says everyone needs to eat more next year.":`Red crossed the line in place ${pl} · ${RACE_TEAMS[L.order[0]].n} took first`;
      el.innerHTML=`<div class="mbox px sp"><h2>${E.ic} ${E.n} · ${R.none?"Did not compete":pl===1?"Red takes 1st!":`Red takes place ${pl}`}</h2><p class="center">${line}</p>
       ${run&&R.order?`<div class="rtable">${R.order.map((o,i)=>`<div class="${o.team==="me"?"me":""}" style="--tc:${RACE_TEAMS[o.team].c}"><b>${i+1}</b><span>${RACE_TEAMS[o.team].n}</span><em>${o.t.toFixed(2)} s</em></div>`).join("")}</div>`:""}${this.table()}
       <div class="mfoot roadbtns"><button class="btn primary" data-sp="next">${S.ev+1<SP_EV.length?"Next event ▸":"See the totals ▸"}</button></div></div>`;return;}
    if(S.ph==="final"){const P=S.place,y=G.season||1,ord=SP_TEAMS.map(t=>t.k).sort((a,b)=>S.pts[b]-S.pts[a]||(a==="me"?-1:b==="me"?1:0)),now=S.skip?" now":"",D=[900,2300,3700,5400];
      const team=k=>SP_TEAMS.find(t=>t.k===k),pod=[1,0,2].map(i=>{const k=ord[i],t=team(k);return `<div class="pd p${i+1}${k==="me"?" me":""}${now}" style="--tc:${t.c};--d:${D[3-i]}ms"><b>${i+1}</b><small>${esc(RACE_TEAMS[k].n)}</small></div>`;}).join("");
      el.innerHTML=`<div class="mbox px sp spcer${P===1?" win":""}" data-sp="skip"><h2>District sports day results, year ${y}</h2>
       <div class="sppod${now}"><img class="spmc" src="a/npc_caster.webp" alt="">${pod}${P===1?`<div class="spconf${now}"></div>`:""}</div>
       <div class="ctscore">${[3,2,1,0].map((i,j)=>{const k=ord[i],t=team(k);return `<div class="ctrow rk${i+1}${k==="me"?" me":""}${now}" style="--d:${D[j]}ms"><span>${i<3?["🥇","🥈","🥉"][i]:"　"} Place ${i+1} · ${esc(t.n)}</span><i></i><b>${S.pts[k]} pts</b></div>`;}).join("")}
        <div class="ctrow tot${now}" style="--d:6200ms"><span>${P===1?"🏆 Red, Sirichai Camp, wins sports day!":`Red, Sirichai Camp, places ${P}`}<small>${S.out.map(x=>x.replace(/<[^>]+>/g,"")).join(" · ")}</small></span><i></i><b></b></div></div>
       <div class="ctip ctrow${now}" style="--d:6800ms"><img src="${faceSrc("coach")}" alt=""><span>${P===1?"Grandpa Chai won the sports day cup only once, back when the camp had fifteen people… and today we did it again.":"Losing at sports day is fine. Losing in the ring is not! Back to training."}</span></div>
       <p class="meta center">Tap to skip</p><div class="mfoot roadbtns"><button class="btn primary" data-sp="end">Back to camp</button></div></div>`;}}};
/* tug of war: tap to pull, heave when the needle sits in the green */
const TUG={st:null,
  start(cb){const R=roster(G),pw=R.length?R.reduce((s,f)=>s+(f.a.power||10)+(f.a.stamina||10),0)/R.length/20:1;
    this.st={p:0,t0:performance.now(),prev:0,cb,pw:Math.max(.8,Math.min(1.5,pw)),mk:0,dir:1,done:false,opp:Math.min(.11,.08+.005*(G.season||1)),msgT:0};this.draw();this.loop();},
  stop(){cancelAnimationFrame(this.raf);clearTimeout(this.to);this.st=null;},
  tap(){const S=this.st;if(!S||S.done)return;S.p+=.012*S.pw;this.bump("tgL");},
  heave(){const S=this.st;if(!S||S.done)return;const ok=S.mk>.4&&S.mk<.6;S.p+=ok?.09*S.pw:-.03;this.say(ok?"Heave!! All together!":"Out of rhythm!");this.bump("tgR");AU.sfx&&AU.sfx(ok?"hit":"ui");},
  bump(id){const b=document.getElementById(id);if(b){b.classList.remove("hit");void b.offsetWidth;b.classList.add("hit");}},
  say(t){const m=document.getElementById("tgmsg");if(m)m.textContent=t;},
  loop(){const step=()=>{const S=this.st;if(!S||S.done)return;const now=performance.now(),dt=Math.min(.05,S.prev?(now-S.prev)/1000:.016),el=(now-S.t0)/1000;S.prev=now;
      S.mk+=S.dir*dt*1.15;if(S.mk>1){S.mk=1;S.dir=-1;}if(S.mk<0){S.mk=0;S.dir=1;}
      if(el>1)S.p-=S.opp*dt*(1+.3*Math.sin(el*1.7));
      const f=document.getElementById("tgflag"),k=document.getElementById("tgmk"),t=document.getElementById("tgt");if(f)f.style.left=(50-Math.max(-1,Math.min(1,S.p))*42)+"%";if(k)k.style.left=(S.mk*100)+"%";if(t)t.textContent=Math.max(0,20-el).toFixed(1);
      if(S.p>=1||S.p<=-1||el>=20){this.end(S.p>0);return;}this.raf=requestAnimationFrame(step);};this.raf=requestAnimationFrame(step);},
  end(win){const S=this.st;S.done=true;this.say(win?"Red wins!":"Yellow wins…");AU.sfx&&AU.sfx(win?"level":"ui");const cb=S.cb,p=S.p;this.to=setTimeout(()=>{this.st=null;cb({win,p});},900);},
  draw(){const el=document.getElementById("minibag");if(!el||!this.st)return;
    el.innerHTML=`<div class="mplay tug"><div class="mhud"><b>🪢 Tug of war</b><span id="tgmsg">Tap Pull fast, then hit Heave! when the needle is in the green</span><span><b id="tgt">20.0</b> s</span></div>
     <div class="tug-field"><span class="tug-team r">Red</span><div class="tug-rope"><i class="tug-mid"></i><b id="tgflag" class="tug-flag"></b></div><span class="tug-team y">Yellow</span></div>
     <div class="tug-meter"><i class="tug-zone"></i><b id="tgmk"></b></div>
     <div class="mbtns"><button class="mbtn L" id="tgL"><b>Pull!</b><small>F</small></button><button class="mbtn R" id="tgR"><b>Heave!</b><small>J</small></button></div></div>`;
    const pd=f=>e=>{e.preventDefault();f();};document.getElementById("tgL").addEventListener("pointerdown",pd(()=>this.tap()));document.getElementById("tgR").addEventListener("pointerdown",pd(()=>this.heave()));}};
Object.assign(CARDS,{
 sp_team_r:{c:"kati",r:"R",t:"The Second Sports Day Cup",hint:"Win the district sports day",bg:"sportsday",need:G=>(G.flags.sportsWin||0)>0,steps:[
  {n:"nar",t:"Late afternoon at the district school field. The red cheering squad won't stop drumming as the headmaster hands Sirichai Camp a gold plastic cup."},
  {n:"coach",t:"Grandpa Chai won the first cup back when the camp had fifteen people. This is the second one… put them side by side."},
  {n:"kati",f:"happy",l:"casual",t:"Everyone, photo time! Kru Daeng in the middle, no hiding!"},
  {n:"nar",t:"The photo comes out blurry because nobody stood still, but it's framed and still hangs in the office today."}]}});

Object.assign(CARDS,{
 m_live:{c:"kati",r:"R",t:"The Camp's First Live",hint:"Stream the camp's merch for the first time",bg:"live_corner",need:G=>(G.flags.liveN||0)>=1,steps:[
  {n:"nar",t:"A phone propped on a stack of sandbags. Kati in the one camp shirt she ironed flattest. Front camera on. Three viewers."},
  {n:"kati",f:"flustered",l:"casual",t:"H-hello, this is Sirichai Camp. Today we have shirts for sale… Three viewers. One of them is Coach Daeng."},
  {n:"coach",t:"(Comment from the account 'Daeng Sirichai') CF 1 shirt"},
  {n:"kati",f:"happy",l:"casual",t:"Coach! You're standing right behind me! …But thank you. That's the camp's very first order."}]},
 m_livehot:{c:"fah",r:"SR",t:"The Live Blew Up",hint:"Get an S on the merch live stream",bg:"live_corner",need:G=>(G.flags.liveS||0)>=1,steps:[
  {n:"nar",t:"The viewer count shoots past a thousand. Orders pour in until the phone won't stop buzzing. The whole camp helps write them into Rin's notebook."},
  {n:"fah",f:"happy",l:"casual",t:"See?! Told you the live needs Fah! Fah holds up one shirt to the camera and ten orders pop in!"},
  {n:"rin",f:"pout",l:"casual",t:"Every order logged. No duplicates, none missed. …There are two shirts left in storage. Who's telling customer number thirty-one?"},
  {n:"coach",t:"In Grandpa Chai's day the camp sold ten shirts a year… today we sold them in five minutes. The world really has changed."}]}});

/* ===== v1.80: redeem codes + the Loy Krathong event (a floating-market gauntlet against the helmet gang) ===== */
const REDEEM={"U0lSSUNIQUky":{k:"gate"},"TE9ZS1JBVEhPTkc2OQ==":{k:"loy",from:"2026-11-18",to:"2026-12-07"}};
function evTest(){try{return !/github\.io$/.test(location.hostname)||/evtest/.test(location.hash)||localStorage.getItem("mtm-evtest")==="1";}catch(e){return false;}}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const LOY_LADDER=["gang1","gang1","gang2","gang2","gang3","gang3","gang4","gang6","gang5"];
const LOY_TIERS=[["gold","Gold",1200],["silver","Silver",800],["bronze","Bronze",400]]; /* v1.89.31: easier so most players see more than one ending */
const loyOf=G=>(G.ev||{}).loy||null;
function loyTier(sc,boss){for(const [k,n,min] of LOY_TIERS)if(sc>=min&&(k!=="gold"||boss))return {k,n};return null;}
/* v1.89.31: easier — the gang starts level with the fighter sent and rises to 15% stronger at the boss */
function evGang(G,k,f){const kind=LOY_LADDER[k],K=QK[kind],t=Math.min(19.2,ovr(f.a)*(1+.15*k/8)),rng=mulberry32((G.seed^0x10e)+k*131);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_evloy_"+k;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind=kind;o.grp="gang";o.lvl=(f.lvl||1)+2+Math.floor(k/3);o.fatigue=0;o.morale=75;G.F[id]=o;syncFighterAges(G);return id;}
function redeemCode(raw){const v=(raw||"").toUpperCase().replace(/\s+/g,"");if(!v)return;let key="";try{key=btoa(v);}catch(e){}const R=REDEEM[key];
  if(!R){AU.sfx("miss");toast("Code not found. Check the spelling and try again");return;}
  if(R.k==="gate"){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}save();AU.sfx("level");toast("Year 2 unlocked!");return;}
  if(R.k==="loy"){const t=todayStr();if(!evTest()){if(t<R.from){toast("This code opens on Nov 18. Watch the page and Discord for the announcement");return;}/* v1.89.19: the Loy Krathong code stays redeemable after the festival (only the gacha machine is seasonal) */}
    if(loyOf(G)){toast("This save already used that code. Find the invitation in your mailbox");return;}
    G.ev=G.ev||{};G.ev.loy={got:G.week,season:G.season||1,best:0,tiers:{},runs:0};
    addMail(G,{kind:"event",ev:"loy",from:"Auntie Taew, som tam stall by the temple",title:"Loy Krathong at the floating market tonight!",body:"Manager dear, tonight I'm selling krathong at the floating-market fair. Bring the girls! Lots of food, and the som tam's on me! But I hear the helmet gang plans to make trouble… I'd feel much safer with you all there."});
    G.chatIn=G.chatIn||{};for(const id of CANON_IDS){const f=G.F[id];if(f&&f.met&&(f.bond||0)>=8&&!G.chatIn[id])G.chatIn[id]=G.week;}
    save();AU.sfx("level");toast("You got a Loy Krathong event invitation! Check your mailbox");}}
/* v1.89.26: fetch the event's art up front (sprites, specials, ring art, portraits) so the first scene and bout don't pop in */
function loyPreload(){if(loyPreload.done)return;loyPreload.done=1;try{
  for(const id of ["kati","mali","rin","ploy","fah"]){img(id+"_loykrathong_sheet.webp");img(id+"_loykrathong_special.webp");for(const m of ["happy","flustered","angry","sad"])warm(stand(id,"thai",m));}
  img("mali_loykrathong_dodge.webp");for(const s of ["gang1","gang2","gang3","gangsilver","gang4","gang5","thief","thief2"])img(s+"_sheet.webp");
  for(const b of ["bg_loy_ring.webp","bg_loy_night.webp","bg_river.webp","bg_river_dawn.webp"])img(b);
  for(const n of ["gang_group","gang_silver","gang_goldblack","gang_boss","gang_boss_face","thief","thief2","vendor_red"])warm(`${ASSET}npc_${n}.webp`);}catch(e){}}
function evMailAct(m){loyPreload();if(m.ev==="dress"){const f=G.F[m.fid],L=loyOf(G);if(!f||!L)return "";const has=L.dress&&L.dress[f.id];
    return has?(f.camp==="player"?`<p class="meta center">Dress received</p><button class="btn" data-act="loydresswear" data-v="${f.id}">${f.outfit==="loy"?"Wearing":`Dress ${esc(f.name)}`}</button>`:`<p class="meta center">Dress received · can be worn once ${esc(f.name)} joins the camp</p>`)
      :`<button class="btn primary" data-act="loydress1" data-v="${m.id}">Claim Thai dress: ${esc(f.name)}</button>`;}
  if(m.ev==="tuy"){const L=loyOf(G);return m.done||!L||!tuyReady(G)?`<p class="meta center">Tuy caught</p>`:m.expired?"":`<button class="btn primary" data-act="tuy">Go catch Tuy</button>`;}
  if(m.ev==="thief"){const L=loyOf(G);return m.done||!L||!thiefReady(G)?`<p class="meta center">Tum caught</p>`:m.expired?"":`<button class="btn primary" data-act="thief">Go catch Tum</button>`;}
  if(m.ev==="kongka"){const B=KONGKA[m.wish];return B?(m.done?`<p class="meta center">Blessing received · ${B.n}</p>`:`<button class="btn primary" data-act="kongka" data-v="${m.id}">Receive blessing · ${B.d}</button>`):"";}
  const L=loyOf(G);if(!L)return "";const tr=loyTier(L.best,L.boss);const T=L.tiers||{};
  const ends=["bronze","silver","gold"].filter(k=>T[k]).map(k=>`<button class="btn sm" data-act="loyend" data-v="${k}">Ending: ${LOY_TIERS.find(x=>x[0]===k)[1]} · ${LOY_END[k].t}</button>`).join("");
  return `${L.runs?`<p class="meta center">Best score <b class="goldt num">${L.best}</b>${tr?` · Reward tier: <b>${tr.n}</b>`:""}</p>`:""}<button class="btn primary" data-act="evloy">${L.runs?"Take on the Riverside Brawl again":"Go to the Loy Krathong fair"}</button>
  ${tuyOn(G)?`<button class="btn gold" data-act="tuy" ${!tuyReady(G)?"disabled":""}>${!tuyReady(G)?"Tuy caught (back tomorrow)":"Catch Tuy the Red Mask"}</button>`:""}
  ${thiefOn(G)?`<button class="btn" data-act="thief" ${!thiefReady(G)?"disabled":""}>${!thiefReady(G)?`Tum caught (${thiefAgain(G)})`:"Catch Tum the Krathong Thief"}</button>`:`<p class="meta center">Tum returns during the in-game Loy Krathong (weeks ${THIEF_WK[0]}–${THIEF_WK[1]} every year) — Auntie Taew will send a letter</p>`}
  ${L.intro?`<div class="evrep"><button class="btn sm" data-act="loyintro">Replay the opening</button>${ends}${loyCanFloat(L)?`<button class="btn sm gold" data-act="loywishopen">🪷 Float krathongs with the girls</button>`:""}</div>`:""}
  ${L.wish?`<p class="meta center">Your wish: "${esc((LOY_WISH.find(w=>w.k===L.wish)||{}).t||"")}"</p>`:""}
`;} /* v1.91.97: the "Thai dress off the ring" toggle is gone with the feature */
function loyIntro(G){const S=[
  {n:"nar",bg:"loy_night",t:"The full moon of the twelfth month. The floating market by the Ping is busier than ever, krathong boats lined along the bank, candlelight glittering on the water."},
  {n:"npc",who:"Auntie Taew",t:"You made it, Manager! Auntie brought her daughter's Thai dresses for the kids to wear at the fair. Go change, quick!"},
  {n:"nar",t:"Ten minutes later"},
  {n:"kati",f:"flustered",l:"thai",t:"Manager… this dress is so tight at the waist. Do I look weird? …Don't stare so long!"}];
  if(inCamp(G,"mali"))S.push({n:"mali",f:"happy",l:"thai",t:"Kati looks gorgeous! Mali pinned her sabai herself~ And Mali's… looks pretty too, right, Manager?"});
  if(inCamp(G,"rin"))S.push({n:"rin",f:"flustered",l:"thai",t:"This pha sin limits my stride to about forty centimeters. Not ideal for fighting… but not bad either."});
  if(G.F.ploy){if(inCamp(G,"ploy"))S.push({n:"ploy",f:"flustered",l:"thai",t:"…Auntie Taew said purple suits me. I'm not sure, but I'm not taking it off now."});
    else S.push({n:"nar",t:"In the crowd, a woman in a purple Thai dress stands still in front of a banana-leaf krathong stall — Ploy, from the rival camp."},{n:"ploy",f:"flustered",l:"thai",t:"…Coincidence. I slipped away from a sponsor photo shoot for a walk, and Auntie Taew got me into this outfit before I could say no."});}
  if(G.F.fah){if(inCamp(G,"fah"))S.push({n:"fah",f:"happy",l:"thai",t:"Look at Fah! Thai dress on and the elbows still flow! Somebody take Fah's picture!"});
    else S.push({n:"fah",f:"happy",l:"thai",t:"Oh, Sirichai camp! Fah just happened to be walking the fair! Auntie Taew dressed Fah up in Thai dress too, haha — pretty, right?!"});}
  S.push({n:"npc",who:"Auntie Taew",t:"Everyone looks lovely! …But look over there. The helmet gang is back."},
  {n:"npc",who:"Big Boss Golden Helmet",t:"Everyone in this market pays us for their spot! Don't pay, pack up and go home, som tam lady!"},
  {n:"coach",t:"Easy now, don't start a fight in the middle of the festival… this market is full of kids and old folks."},
  {n:"npc",who:"Big Boss Golden Helmet",t:"Don't want trouble? Then get up on that ring by the pier! Send three. My side is eight men and me. No breaks, no mercy. If your camp wins, my gang never comes to this market again!"},
  {n:"kati",f:"happy",l:"thai",t:"I accept the challenge! Auntie Taew says this pha sin stretches, so it won't rip in a fight! Pick who goes, Manager!"});
  const gs=loyGuests(G);
  if(gs.some(f=>f.id==="ploy"))S.push({n:"ploy",f:"angry",l:"thai",t:"I'm not from your camp … but I shop at this market every year. If you're short a fighter, I'll step in."});
  if(gs.some(f=>f.id==="fah"))S.push({n:"fah",f:"happy",l:"thai",t:"Fah too! Punching the helmet gang for free, no fee! …A tray of khanom krok is enough."});
  if(gs.length)S.push({n:"nar",t:`${gs.map(f=>f.name).join(" and ")} are here to help as guests — pick them for the riverside gauntlet. No effect on your real camp.`});
  return S;}
/* v1.89.25: the rules as a popup (first time, and from the gauntlet header) */
function loyRulesHTML(){const T=LOY_TIERS,E=LOY_END;return `<h2>Riverside Brawl · Rules</h2>
  <ul class="glist lrules"><li>Send 3 girls, 3 bouts each in a row. HP barely recovers between bouts; lose and the next girl steps in</li><li>Bout 9 is Big Boss Golden Helmet (3 rounds)</li>
  <li><b>3 endings by score</b><div class="lrtier"><span class="pill">Bronze ${T[2][2]}</span>${E.bronze.t}</div><div class="lrtier"><span class="pill">Silver ${fmtN(T[1][2])}</span>${E.silver.t}</div><div class="lrtier"><span class="pill gold">Gold ${fmtN(T[0][2])} + beat the boss</span>${E.gold.t}</div></li>
  <li>Thai-dress SR cards: bronze 1 · silver 2 · gold 3</li><li>Losing is fine — replay as often as you like; unlocked endings can be rewatched from the invitation letter</li><li>Finish at bronze or higher to float krathongs with the girls once · after gold, float any time</li><li>No injuries in this brawl, and nothing counts toward your main-game record</li></ul>
  <div class="center endbtns"><button class="btn primary" data-act="loyrulesok">Got it</button></div>`;}
const fmtN=n=>Number(n).toLocaleString("en-US");
const LOY_END={
 bronze:{t:"The Helmet Gang Retreats",steps:[{n:"nar",bg:"loy_night",t:"The helmet gang's goons retreat to the far bank. They haven't given up, but they won't come near Auntie Taew's stall again."},
  {n:"npc",who:"Auntie Taew",t:"Well done, kids! Auntie sold so many more krathongs. Khanom krok's on me tonight!"}]},
 silver:{t:"The Whole Market Cheers",steps:[{n:"nar",bg:"loy_night",t:"The whole floating market crowds around the makeshift ring. The cheers drown out the fireworks."},
  {n:"coach",t:"Not bad… but you haven't reached the boss yet. There's still time this year."},
  {n:"npc",who:"Auntie Taew",t:"Those Thai dresses are yours to keep. Wear them anywhere. Auntie's happy they got worn for something good."}]},
 gold:{t:"The Golden Helmet Floats Away",steps:[{n:"nar",bg:"loy_night",t:"Big Boss Golden Helmet crashes onto the pier. His golden helmet rolls into the river and floats off with a hundred krathongs."},
  {n:"nar",t:"Under the gold helmet: a man with slicked-back gold hair, dark shades and a cigar. The whole market sees the boss's real face for the first time."},
  {n:"npc",who:"Big Boss Golden Helmet",img:"gang_boss_face",t:"My helmet!! …Don't look at my face! Fine, fine — I'm not coming back to this market. This year! Just this year!"},
  {n:"npc",who:"Auntie Taew",t:"Auntie's sewn extra Thai dresses for all of you. Wear them on outings, dates, anywhere!"}],
  tail:[{n:"nar",t:"The name Sirichai Gym echoes across the floating market all night, and for many nights after."}]}};
/* v1.89.24: the ending follows the three who fought — the first heroine sent is the lead, the others chip in */
const LOY_REACT={
 bronze:{kati:"They'll be back next year for sure. I'll train even harder!",mali:"My pha sin tore a little… Auntie Taew, please don't scold Mali.",rin:"Bronze is the lowest of the three tiers. I've noted it. Next year it won't be.",ploy:"We didn't reach the boss … Next time I'll get there.",fah:"Not satisfied yet! The gold helmet guy didn't take a single hit!"},
 silver:{kati:"The whole market shouted my name… Grandpa, can you hear it?",mali:"So many people cheering — Mali wants to dance for them again!",rin:"The cheering's about ninety decibels … I'm not smiling.",ploy:"…I'm not used to cheering like this. But it's not bad.",fah:"You hear that?! They're calling Fah's name! Did anyone film it?!"},
 gold:{kati:"We did it! Auntie Taew doesn't have to pay protection money anymore!",mali:"The gold helmet floated off with the krathongs~ May all the bad luck float away with it.",rin:"Nine fights, no rest. The result matches my calculation … almost.",ploy:"We took down the boss … I'm proud. I won't say it twice.",fah:"See? Fah told you! Let him come back next year — Fah'll punch him again!"}};
const LOY_LEAD={
 bronze:{kati:[["nar","Squeaking comes from under the pier. A tiny otter is tangled in krathong string. Kati kneels to free it, the hem of her pha sin soaking wet."],["flustered","It followed me, Manager… it won't leave. Can we keep it at camp? We can, right?"]],
  mali:[["nar","A squeak comes from under the pier. A baby otter is tangled in a krathong string. Mali kneels to free it, laughing as it nibbles her finger."],["happy","It likes Mali! Manager, let's keep it at the camp. Mali will take care of it~"]],
  rin:[["nar","A squeak comes from under the pier. A baby otter is tangled in a krathong string. Rin kneels and calmly works the knots — three seconds each."],["flustered","Until we find it a home, I'll look after it. The camp has a big enough tub … I'm not attached or anything."]],
  ploy:[["nar","A squeak comes from under the pier. A baby otter is tangled in a krathong string. Ploy frees it without a word, and it climbs straight up her arm."],["flustered","…It won't get down. The camp has room for it, right?"],["flustered","…It won't get down. My camp doesn't allow pets. Can I leave it with you? I'll drop by to see it."]],
  fah:[["nar","A squeak comes from under the pier. A baby otter is tangled in a krathong string. Fah jumps into the river, Thai dress and all, to free it."],["happy","Got it! I'm soaked, but worth it! Let's keep it at the camp — Fah'll feed it!"],["happy","Got it! Keep it at your camp. Fah will come visit every week — and say it's for the otter!"]]},
 silver:{kati:[["flustered","Manager… Auntie Taew gave me a krathong. Want to float it together? …Just one. She only gave me one."]],
  mali:[["happy","Manager, Auntie Taew gave me a krathong. Let's float it together! Mali already made a wish, but she's not telling~"]],
  rin:[["flustered","Auntie Taew gave us one krathong. Two people, one krathong … Mathematically, we have to float it together."]],
  ploy:[["flustered","Auntie gave me a krathong… I've never floated one with anyone. Want to try it together?"]],
  fah:[["happy","Just one krathong! Let's float it together, the two of us. Anyone who tries to cut in gets an elbow!"]]},
 gold:{kati:[["flustered","…Manager, can I wear this on a date? …Not a date! An outing! An outing!"]],
  mali:[["flustered","Can I wear this on a date…? Mali's asking for real, not teasing~"]],
  rin:[["flustered","If I wear this out somewhere with you, the data says it probably wouldn't be bad … That's not an invitation."]],
  ploy:[["flustered","Auntie gave me this outfit … If you're free, walk the floating market with me again? When nobody's fighting."]],
  fah:[["happy","This outfit's good for a date! Yes! Fah said 'date'! And she's not taking it back!"]]}};
function loyCastOf(cast){const ids=[...new Set(cast||[])].filter(id=>LOY_REACT.gold[id]&&G.F[id]);return ids.length?ids:["kati"];}
function loyLeadOf(cast){return loyCastOf(cast)[0];}
/* v1.89.31: beat the boss but missed the gold score — the bronze/silver ending says so instead of "not even close to the boss" */
const LOY_BOSS_DOWN={bronze:[{n:"nar",bg:"loy_night",t:"Big Boss Golden Helmet goes down in the middle of the ring — but the men nobody beat still crowd the pier. The boss gets up, dusts himself off and leads them back across the river. Not giving up yet."},
  {n:"npc",who:"Auntie Taew",t:"Well done, kids! You even took down the boss! Auntie sold so many more krathongs. Khanom krok's on me tonight!"}],
 silver:{coach:"You even took down the boss! …But the score isn't enough to make the whole gang give up. Next time, win by a wider margin."}};
function loyEndSteps(k,cast,boss){const E=LOY_END[k],ids=loyCastOf(cast),lead=ids[0];let S=[...E.steps];
  if(boss&&k==="bronze")S=[...LOY_BOSS_DOWN.bronze];if(boss&&k==="silver")S=S.map(x=>x.n==="coach"?{n:"coach",t:LOY_BOSS_DOWN.silver.coach}:x);
  for(const id of ids.slice(1,3))S.push({n:id,f:"happy",l:"thai",t:LOY_REACT[k][id]});
  if(ids.length===1)S.push({n:lead,f:"happy",l:"thai",t:LOY_REACT[k][lead]});
  const L=LOY_LEAD[k][lead]||LOY_LEAD[k].kati,guest=isLoyGuest(G.F[lead]);
  L.forEach((x,i)=>{if(x[0]==="nar"){S.push({n:"nar",t:x[1]});return;}
    if(L.length===3&&i===(guest?1:2))return;S.push({n:lead,f:x[0],l:"thai",t:x[1]});});
  return S.concat(E.tail||[]);}
const LOY_THIEF={name:"Tum the Krathong Thief",
 line:{kati:"Give it back right now! That krathong belongs to the grandma next door to me!",mali:"Mali helped Auntie fold that krathong! Give it back!",rin:"I counted. You took seventeen. Return every one of them.",ploy:"Auntie gave me this outfit — it can't get wet … but if I have to dive in after it myself, I won't hesitate.",fah:"Fah's seen you since last year! You're not getting away this time!"},
 pre:[{n:"nar",bg:"loy_night",t:"Splash! Someone dives in, fishing coins out of the villagers' krathongs by the plastic-bagful."},
  {n:"npc",who:"Auntie Taew",t:"Tum again! He fishes coins out of people's krathongs every year. This year he took the whole krathongs!"},
  {n:"npc",who:"Tum the Krathong Thief",t:"The krathongs floated to me, so I took 'em! Want 'em back? Come up on the pier!"}],
 win:[{n:"nar",bg:"loy_night",t:"Tum hits the water with a splash. The coin bag bobs on the surface, and the villagers fish it out for the temple."},
  {n:"npc",who:"Auntie Taew",t:"Well done, dear! Auntie's frying khanom krok for the whole team. Eat up before you go home!"}],
 lose:[{n:"nar",bg:"loy_night",t:"Tum laughs and dives in with the bag of coins… but the bag rips mid-river and every coin sinks."},
  {n:"npc",who:"Tum the Krathong Thief",t:"Hey! My coins!! …See you next year!"},{n:"npc",who:"Auntie Taew",t:"Never mind, dear. At least he didn't get anything."}]};
const LOY_TUY={name:"Tuy the Red Mask",
 pre:[{n:"nar",bg:"loy_night",t:"Late at night, a figure in a red knit mask runs along the riverbank with a whole sack of krathongs over his shoulder."},
  {n:"npc",who:"Auntie Taew",t:"That's Tuy, Tum's little brother! His brother got caught so often he sent the younger one instead. This time he took a whole sack!"},
  {n:"npc",who:"Tuy the Red Mask",t:"My brother Tum's soft. I'm nothing like him. If you're tough, come up on the pier and take them back!"}],
 win:[{n:"nar",bg:"loy_night",t:"Tuy goes flat on his back in the middle of the pier, his knit mask slipping over his eyes. The sack of krathongs rolls back, every one of them."},
  {n:"npc",who:"Tuy the Red Mask",t:"…Don't tell my brother Tum I lost!"},
  {n:"npc",who:"Auntie Taew",t:"Those two brothers really are the same. Well done, dear! A big tray of khanom khrok for you!"},{n:"npc",who:"Auntie Taew",t:"The villagers sent a little something for the camp too, dear. Go on, take it."}],
 lose:[{n:"nar",bg:"loy_night",t:"Tuy flips a coin into the air, catches it neatly, and vanishes into the dark with his sack."},
  {n:"npc",who:"Tuy the Red Mask",t:"I'll be back tomorrow! Go train some more!"},{n:"npc",who:"Auntie Taew",t:"Never mind, dear. He'll be back tomorrow for sure. Auntie will be watching."}]};
function evStartLoy(){const L=loyOf(G);if(!L)return;if(L.thiefFrom==null){L.thiefFrom=absWeek(G);thiefMail(G);}loyPreload();UI.modal=null;
  const open=()=>{L.run=null;L.pick=[];UI.modal={type:L.rulesSeen?"gaunt":"loyrules"};render();};
  if(!L.intro){L.intro=1;save();playScene(loyIntro(G),open,{bg:"loy_night",look:"thai"});}else open();}
/* v1.89.24: Ploy / Fah join as guests when they are not in the camp yet — event-only, nothing carries back */
const LOY_GUESTS=["ploy","fah"];
const loyGuests=G=>LOY_GUESTS.map(id=>G.F[id]).filter(f=>f&&f.camp!=="player");
const loyCanFloat=L=>!!L&&!!(L.floatTok||(L.tiers&&L.tiers.gold)); /* v1.90.6: a float per finished run, or any time once gold is won */
const isLoyGuest=f=>f&&LOY_GUESTS.includes(f.id)&&f.camp!=="player";
/* v1.90.4: a guest (Ploy / Fah not yet in the camp) fights at about the camp's top-three level in the event — a copy for the bout only, her real stats stay untouched */
const LOY_GUEST_ADJ={ploy:-.6,fah:2}; /* sim-tuned so a guest in slot 3 wins about as often as our own girls (Ploy's kit is strong at equal stats, Fah's is not) */
function loyBoost(f,opp){if(!isLoyGuest(f))return f;
  const t=campPow(G)+(opp?0:LOY_GUEST_ADJ[f.id]||0),d=t-ovr(f.a);const a={};for(const k in f.a)a[k]=typeof f.a[k]==="number"?Math.max(3,Math.min(19.5,f.a[k]+d)):f.a[k];return {...f,a,lvl:campLv(G)};}
function gauntPool(){const R=roster(G).filter(f=>!f.injury);return (R.length?R:roster(G)).concat(loyGuests(G));}
// v1.82.4: the five riverside SR cards as a collection row — owned cards in colour, missing ones dark, with a "play again" nudge
function loyCardRow(after){const own=G.cards||{},got=LOY_CARDS.filter(k=>own[k]).length,left=LOY_CARDS.length-got;
  const row=LOY_CARDS.map(k=>{const C=CARDS[k],has=!!own[k];return `<div class="ccard pxc lk ${has?"":"lock"}" style="--rc:${CARD_R.SR.c}" title="${has?esc(C.t):"Not yet earned"}">${cardArtHTML(C,true)}<small>${has?esc(G.F[C.c].name):"?"}</small></div>`;}).join("");
  const msg=!left?`<b class="goldt">Thai-dress SR set complete: all ${LOY_CARDS.length} cards!</b> Every ending can be rewatched from the invitation letter · Finish at bronze or higher to float krathongs with the girls again`
    :after?`<b>Cards still missing: ${left}</b> · This battle can be replayed any time. Tap "Challenge again" to complete the set · send a girl without her card first to get it`
    :`<b>Thai-dress SR cards ${got}/${LOY_CARDS.length}</b> · Bronze finish gives 1 card, Silver 2, Gold 3 · whoever fights first gets her card first · replay until you have them all`;
  return `<div class="lkrow"><div class="lkcards">${row}</div><p class="meta">🎴 ${msg}</p></div>`;}
function gauntHTML(){const L=loyOf(G);if(!L){UI.modal=null;return "";}const R=L.run;
  const head=`<h2>Loy Krathong Riverside Brawl</h2><p class="meta">Three fighters, three bouts each in a row. HP barely recovers between bouts; lose and the next fighter steps in · The last bout is Boss Golden Helmet · 3 endings by score, replay as often as you like <button class="btn sm ghost" data-act="loyrules">Rules</button></p>${!R?loyCardRow():""}`;
  const ladder=(cur)=>`<div class="gl">${LOY_LADDER.map((k,i)=>{const lg=R&&R.log[i];const st=lg?(lg.res==="W"?"ok":lg.res==="D"?"dr":"ng"):R&&i===cur?"now":"";
    return `<div class="glr ${st}"><canvas width="40" height="40" data-qsprite="${QK[k].sprite}"></canvas><span><b>${i+1}. ${esc(QK[k].name)}</b><small>${lg?lg.txt:R&&(R.done||i<cur)?"Skipped (previous fighter lost)":i===8?"Boss · 3 rounds":"2 rounds"}</small></span><i>${lg?(lg.res==="W"?"+"+lg.pts:lg.res==="D"?"+"+lg.pts:"✕"):""}</i></div>`;}).join("")}</div>`;
  if(!R){const pool=gauntPool(),P=L.pick||[];const need=Math.min(3,pool.length);
    return head+`<p><b>Choose your fighter order</b> <small class="meta">(${P.length}/${need}) tap fighters in the order they go in</small></p><div class="gpick">${pool.map(f=>{const i=P.indexOf(f.id);
      return `<button class="gpk ${i>=0?"on":""}" data-act="gpick" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>${isLoyGuest(f)?"Guest · ":""}Lv.${f.lvl}</small></span>${i>=0?`<i>${i+1}</i>`:""}</button>`;}).join("")}</div>
      ${pool.length<3?`<p class="meta">Your camp has fewer than three fighters, so some will go again (full HP each new turn)</p>`:""}
      <div class="center endbtns"><button class="btn primary" data-act="gstart" ${P.length<need?"disabled":""}>Start</button><button class="btn" data-act="closeModal">Later</button></div>${ladder(-1)}`;}
  if(R.done){const tr=loyTier(R.score,R.boss);return head+`<div class="gres2"><p class="meta">Total score</p><p class="gsc num">${R.score}</p>${tr?`<span class="pill gold">Reward tier: ${tr.n}</span>`:`<span class="pill">No reward tier yet (Bronze ${LOY_TIERS[2][2]})</span>`}
    ${(R.got||[]).length?`<ul class="glist">${R.got.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}${loyCardRow(1)}<p class="meta">Best ${L.best} · Gold ${LOY_TIERS[0][2]}+ and Big Boss Golden Helmet must fall</p></div>
    <div class="center endbtns">${R.newEnd?`<button class="btn gold" data-act="loyend" data-v="${R.newEnd}">Watch the ending (new!)</button>`:loyCanFloat(L)&&L.wish?`<button class="btn gold" data-act="loyfloat">🪷 Float a krathong</button>`:""}<button class="btn primary" data-act="gretry">Challenge again</button><button class="btn" data-act="closeModal">Back to camp</button></div>${ladder(-1)}`;}
  const f=G.F[R.order[R.slot]];
  return head+`<div class="gnow"><p class="meta">Score <b class="goldt num">${R.score}</b> · Fighter ${R.slot+1}/3 · Bout ${R.k+1}/9</p>
    <div class="gcur">${faceImg(f)}<span><b>${esc(f.name)}</b><small>HP ${Math.round(R.hp)} · Stamina ${Math.round(R.sta)}</small><div class="meter"><i style="--v:${clamp(R.hp,0,100)}%;--bc:${R.hp>50?"var(--green)":R.hp>25?"var(--warn)":"var(--red)"}"></i></div></span></div></div>
    <div class="center endbtns"><button class="btn primary" data-act="gfight">Fight bout ${R.k+1}</button><button class="btn" data-act="gquit">End the brawl (keep your score)</button></div>${ladder(R.k)}`;}
/* v1.89.24: short lines between bouts — each helmet's first taunt, the hand-over when the next girl steps in, and the boss's own entrance */
const LOY_TAUNT={gang1:"Girls in pha sin come to fight? Haha, you'll slip and fall on your own!",gang2:"This jacket costs more than Auntie Taew's whole stall. Don't get blood on it.",
 gang3:"The first two were just grunts. I'm the lieutenant — the Black-Red Helmet never backs down.",gang4:"I polish this silver helmet every morning. Not one dent from a punch. Tonight won't change that.",
 gang6:"To reach the boss, you go through his right hand first. Nobody's ever made it past me."};
const LOY_BOSS_IN=[{n:"nar",t:"His men part the way. Big Boss Golden Helmet steps off a boat, tosses his fur-trimmed coat to a lackey — every one of his gold rings still on."},
 {n:"npc",who:"Big Boss Golden Helmet",t:"I don't count how many of my men lost! Tonight I collect the stall fees with my own hands!"}];
const LOY_BOSS_REPLY={kati:["angry","Grandpa said Muay Thai is for protecting those who can't fight. Tonight I'll protect this market!"],mali:["happy","With that many rings, those punches must hurt… but Mali won't get hit~"],
 rin:["angry","Your punches are strong, but your feet are slower than any of your men. I've done the math."],ploy:["angry","…Too much talking. I don't like it. Get up here."],fah:["happy","Finally! Fah's been waiting all night to punch that gold helmet!"]};
const LOY_OUT={kati:["Sorry… I can't go on. Please take over!","Three fights done! It's all yours now!"],mali:["Ow… Mali's passing it on. Don't lose, okay~?","Mali did her part~ Your turn!"],
 rin:["Result below expectation. Fix the numbers for me.","Three fights, as planned. Handing over."],ploy:["…Slipped. Your turn.","Done. The rest is yours."],fah:["Dammit! Fah wasn't done yet… go punch them for Fah!","Three fights, easy! Who's next? High five!"]};
const LOY_IN={kati:"Tagging in! I've got it from here!",mali:"High five~ Mali's here!",rin:"Understood. Starting from the numbers left.",ploy:"Rest. I'll take it from here.",fah:"Fah's turn! Move, move!"};
const LOY_IN_GUEST={ploy:"I'm not from this camp … but tonight I fight for you.",fah:"Guest coming through! Fah fights for free tonight!"};
function loyBanter(R,f){const S=[],kind=LOY_LADDER[R.k];R.seenK=R.seenK||{};
  if(R.slot>0&&R.j===0){const pid=R.order[R.slot-1],p=G.F[pid];if(p&&pid!==f.id){const prev=R.log[R.k-1],lost=!prev||prev.res==="L";
    S.push(LOY_OUT[pid]?{n:pid,f:lost?"sad":"happy",l:"thai",t:LOY_OUT[pid][lost?0:1]}:{n:"nar",t:`${p.name} walks off and tags the next one in`});
    const gin=isLoyGuest(f)&&LOY_IN_GUEST[f.id];S.push(LOY_IN[f.id]?{n:f.id,f:"angry",l:"thai",t:gin||LOY_IN[f.id]}:{n:"nar",t:`${f.name} steps up in her place`});}}
  if(!R.seenK[kind]){R.seenK[kind]=1;
    if(kind==="gang5"){S.push(...LOY_BOSS_IN);const r=LOY_BOSS_REPLY[f.id];S.push(r?{n:f.id,f:r[0],l:"thai",t:r[1]}:{n:"nar",t:`${f.name} doesn't answer, just raises her guard`});}
    else if(LOY_TAUNT[kind])S.push({n:"npc",who:QK[kind].name,t:LOY_TAUNT[kind]});}
  return S;}
/* v1.89.24: the event's closing night — float krathongs with the five girls and make a wish (flavour only; nothing changes in the main game) */
const LOY_WISH=[
 {k:"safe",t:"May everyone stay safe and unhurt all year",lines:[["kati","happy","I wished for the same thing… Grandpa must be smiling up there."],["ploy","happy","…Good. The best wish a fighter can make."]]},
 {k:"champ",t:"May Sirichai camp win a championship",lines:[["fah","happy","Wish for that and we'll have to train even harder! Fah's in!"],["rin","flustered","The probability isn't high enough yet … but I'll help raise the numbers myself."]]},
 {k:"together",t:"May we all float krathongs together again next year",lines:[["mali","happy","Promise~? Next year we come back, all five of us, just like this."],["ploy","flustered","…I'll be here."]]},
 {k:"heart",t:"A wish of the heart (made in secret)",heart:1}];
const LOY_WISH_HEART={kati:"…What did you wish for, Manager? Your face is all red … You don't have to tell me.",mali:"What did you wish for~? Mali can guess, but she won't say.",
 rin:"Wishes have no statistical effect … but if it's the same as mine, that's fine.",ploy:"…I wished for the same thing. Don't ask what.",fah:"Hey! Why are you smiling like that?! You wished for something about Fah, didn't you!"};
/* v1.89.24: the wish is answered — a letter from Phra Mae Khongkha with one real blessing, once per year */
const KONGKA={safe:{n:"Blessing of Cool Waters",d:"Fatigue −20 for every fighter in camp",fx:(G,m)=>roster(G).forEach(f=>f.fatigue=clamp((f.fatigue||0)-20,0,100))},
 champ:{n:"Blessing of Victory",d:"Morale +10 for every fighter in camp",fx:(G,m)=>roster(G).forEach(f=>f.morale=clamp((f.morale||0)+10,0,100))},
 together:{n:"Blessing of Plenty",d:"฿10,000 for the camp",fx:(G,m)=>{G.cash+=10000;}},
 heart:{n:"Blessing of the Heart",d:"Bond +3 with the one who turned to look",fx:(G,m)=>{if(m.hid&&G.F[m.hid])add(G,m.hid,"bond",10); /* add() scales by BOND_MUL (.3) → about +3 */}}};
const kongkaReady=G=>{const L=loyOf(G);return !!L&&L.kongkaS!==(G.season||1);};
const loyWishIds=()=>["kati","mali","rin","ploy","fah"].filter(id=>G.F[id]);
function loyWishOpen(done){const L=loyOf(G);if(!L){done&&done();return;}UI.lwDone=done||null;UI.lwSkip=false;UI.lwT0=performance.now();UI.modal={type:"loywish"};AU.startMusic&&AU.startMusic("date");render();}
function loyWishHTML(){const ids=loyWishIds(),T=LW_TL(ids.length),now=UI.lwSkip?" now":"",L=loyOf(G),prev=L&&L.wish&&LOY_WISH.find(w=>w.k===L.wish);
  if(UI.modal.ph==="float")return `<h2>Floating Krathongs</h2><div class="cfxwrap ctwrap" data-act="lwfloatdone" role="button" aria-label="Continue"><canvas class="campcv" width="640" height="360" data-loywish="${ids.join(",")}"></canvas></div><p class="meta center">The manager's krathong drifts slowly out onto the river, just as a big round of fireworks goes up.</p>`;
  return `<h2>Floating Krathongs</h2><div class="cfxwrap ctwrap" data-act="lwskip" role="button" aria-label="Skip scene"><canvas class="campcv" width="640" height="360" data-loywish="${ids.join(",")}"></canvas></div>
   <p class="meta center lwq wkgo${now}" style="${"--d:"+T.end+"ms"}">Five krathongs float out onto the river. Now it's the manager's turn to make a wish.${prev?` · Last time you wished: "${esc(prev.t)}"`:""}</p>
   <div class="lwopts">${LOY_WISH.map(w=>`<button class="btn wkgo${now}" style="${"--d:"+T.end+"ms"}" data-act="loywish" data-v="${w.k}">${esc(w.t)}</button>`).join("")}</div>

   <div class="mfoot"><button class="btn wkgo${now}" style="${"--d:"+T.end+"ms"}" data-act="lwclose">Later</button></div>`;}
function loyWishPick(k){const W=LOY_WISH.find(w=>w.k===k),L=loyOf(G);if(!W||!L)return;L.wish=k;L.wishN=(L.wishN||0)+1;L.floatTok=0;const bless=kongkaReady(G);
  UI.modal={type:"loywish",ph:"float"};UI.lwSkip=true;UI.lwF0=performance.now();AU.sfx&&AU.sfx("level");render();
  UI.lwGo=()=>{UI.lwGo=null;UI.lwF0=0;UI.modal=null;loyWishScene(W,L,bless,k);};setTimeout(()=>{if(UI.lwGo)UI.lwGo();},3800);}
function loyWishScene(W,L,bless,k){
  const S=[{n:"nar",bg:"loy_night",t:`You close your eyes, press your palms together and wish: "${W.t}"`}];let hid=null;
  if(W.heart){const ids=loyWishIds();const top=(G.romance&&ids.includes(G.romance)?G.romance:null)||ids.slice().sort((a,b)=>((G.F[b].bond||0)+(G.F[b].bondX||0))-((G.F[a].bond||0)+(G.F[a].bondX||0)))[0];
    hid=top;S[0].t="You close your eyes, press your palms together and make a silent wish. All five turn to look at you at once.";S.push({n:top,f:"flustered",l:"thai",t:LOY_WISH_HEART[top]});}
  else for(const [id,f,t] of W.lines)if(G.F[id])S.push({n:id,f,l:"thai",t});
  S.push({n:"nar",t:"Another round of fireworks goes up. The five krathongs float side by side until they vanish round the bend."});
  if(bless){const B=KONGKA[k];L.kongkaS=G.season||1;addMail(G,{kind:"event",ev:"kongka",wish:k,hid,from:"Phra Mae Khongkha",title:"A Letter Carried by the River",
      body:`A neatly folded banana-leaf letter drifted up to the camp pier before dawn, smelling faintly of jasmine · "Your krathong has reached me, carrying the wish: "${W.t}" — a pure heart is always blessed. Take this blessing." · ${B.n}: ${B.d}${k==="heart"&&hid&&G.F[hid]?` (${G.F[hid].name})`:""}`});}
  save();const done=UI.lwDone;UI.lwDone=null;playScene(S,()=>{AU.startMusic("hub");if(done)done();else render();},{bg:"river",look:"thai"});}
function gauntNextSlot(R){R.slot++;R.j=0;R.k=R.slot*3;R.hp=100;R.sta=100;if(R.slot>=3||R.k>=9)gauntFinish(R);}
function gauntFinish(R){const L=loyOf(G);R.done=true;L.runs=(L.runs||0)+1;L.best=Math.max(L.best||0,R.score);if(R.boss)L.boss=1;R.got=[];
  const tr=loyTier(R.score,R.boss);const order=["bronze","silver","gold"];
  if(tr)L.floatTok=1; /* v1.90.3: each run that reaches bronze+ earns one krathong float — no free replay button */
  if(tr){for(const k of order.slice(0,order.indexOf(tr.k)+1))if(!L.tiers[k]){L.tiers[k]=1;R.newEnd=k;L.endCast=L.endCast||{};L.endCast[k]=[...R.order];L.endBoss=L.endBoss||{};L.endBoss[k]=R.boss?1:0;R.got.push(...loyReward(k,R.order));}const nC={bronze:1,silver:2,gold:3}[tr.k]||1;for(let i=0;i<nC;i++){const c=loyCardDrop(G,R.order);if(c)R.got.push(c);else break;}}
  for(let i=0;i<9;i++)delete G.F["q_evloy_"+i];save();}
function loyReward(k,R0){const out=[];
  if(k==="bronze"){out.push("Auntie Taew treats the whole team to khanom krok (event reward)");if(typeof PETS!=="undefined"&&PETS.otter&&typeof adoptPet==="function"&&!hasPet(G,"otter")){adoptPet(G,"otter",null,(o=>G.F[o]&&G.F[o].camp==="player"?o:"kati")(loyLeadOf(R0)));{const L=loyOf(G);if(L)L.petPend=G.pets.length-1;}out.push("A baby otter followed you back to camp! (name it after the ending)");}}
  if(k==="silver"){out.push("Thai dress unlocked on character profiles");}
  if(k==="gold"){out.push("\"Floating Market Champ\" name tag on the event page");if(typeof loyGold==="function"){const c=loyGold(G);if(c)out.push(c);}}
  return out;}
/* v1.89.27: the first bout a girl wins on the river ring, Auntie Taew sends her Thai dress by letter — a wearable pixel outfit for the main game (looks only) */
const LOY_DRESS_NOTE={kati:"Kati's red set. Auntie double-stitched the pha sin seams — this time it won't tear, however you fight.",mali:"Mali's blue set. Auntie saw you mending your own hem between rounds, so she sewed in an extra lining.",
 rin:"Rin's green set. Auntie re-measured it exactly to your notes — your stride is now twelve centimetres wider.",ploy:"Ploy's purple set. Auntie meant to make it for you last year and only now got to give it. Keep it for days you don't have to pose for anyone, dear.",
 fah:"Fah's black-and-gold set. Auntie added gold thread — Fah said she wants the crowd to scream when she throws an elbow."};
function loyDressMail(G,f){const L=loyOf(G);if(!L||!f||!LOY_DRESS_NOTE[f.id])return;L.dress=L.dress||{};L.dressMail=L.dressMail||{};if(L.dress[f.id]||L.dressMail[f.id])return;L.dressMail[f.id]=1;
  addMail(G,{kind:"event",ev:"dress",fid:f.id,from:"Auntie Taew, som tam stall by the temple",title:`Thai Dress for ${f.name}`,body:`${LOY_DRESS_NOTE[f.id]} · Wear it as her pixel outfit at camp, in training and in the ring. Pick it in the wardrobe of ${f.name}`});}
function gauntAfter(){const L=loyOf(G),R=L&&L.run,F=LASTF;if(!R||!F){UI.modal={type:"gaunt"};render();return;}
  const r=F.result,res=r.win==="D"?"D":r.win==="A"?"W":"L",rds=R.k===8?3:2;let pts=0,txt="";
  if(res==="W"){pts=100+(/KO|น็อก/.test(r.type||"")?60:0)+Math.max(0,rds-F.round)*30+Math.round(Math.max(0,F.A.hp)*.6);txt=/KO|น็อก/.test(r.type||"")?`Won by KO, round ${F.round}`:"Decision win";if(R.k===8)R.boss=1;}
  else if(res==="D"){pts=30;txt="Draw";}else txt=/KO|น็อก/.test(r.type||"")?`Lost by KO, round ${F.round}`:"Lost on points";
  R.log[R.k]={res,pts,txt};R.score+=pts;if(res==="W")loyDressMail(G,G.F[R.order[R.slot]]);
  if(res==="L")gauntNextSlot(R);
  else{R.hp=Math.min(100,Math.max(0,F.A.hp)+20); /* v1.90.4: +20 between bouts (was +15) now that HP comes back slower between rounds */R.sta=Math.min(100,Math.max(0,F.A.sta)+20);R.j++;R.k++;if(R.j>=3)gauntNextSlot(R);else if(R.k>=9)gauntFinish(R);}
  save();UI.modal={type:"gaunt"};render();}
Object.assign(ACT,{
  goldrematch:()=>{if(!goldRematchReady(G))return;const f=roster(G).find(f=>!f.injury);if(!f){toast("All fighters are injured");return;}G.gangRematchAt=campWeekIndex(G)+4;save();
    playScene([{n:"nar",bg:"gang_hq",t:"The warehouse behind the morning market, dimly lit. Red-helmet goons sit around a table with a map. The moment Sirichai camp walks in, they all jump to their feet."},{n:"npc",who:"Big Boss Golden Helmet",t:"You dare come to my turf?! Clear the back of the warehouse — today I settle the score myself!"}],()=>startQuest({q:"gang",qk:"gang5",rematch:true},f.id,()=>{}),{bg:"gang_hq",look:"fight"});},
  redeem:()=>{const el=document.getElementById("redeemcode");redeemCode(el&&el.value);if(el)el.value="";render();},
  evloy:()=>evStartLoy(),
  gpick:d=>{const L=loyOf(G);if(!L)return;L.pick=L.pick||[];const i=L.pick.indexOf(d.v);if(i>=0)L.pick.splice(i,1);else if(L.pick.length<Math.min(3,gauntPool().length))L.pick.push(d.v);render();},
  gstart:()=>{const L=loyOf(G);if(!L)return;const P=L.pick||[];if(!P.length)return;const order=[0,1,2].map(i=>P[i%P.length]);
    L.run={order,slot:0,j:0,k:0,hp:100,sta:100,score:0,log:[],boss:0};save();render();},
  gfight:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;const f=G.F[R.order[R.slot]];const qid=evGang(G,R.k,loyBoost(f,1));
    const bk={id:"bev"+R.k,a:f.id,b:qid,week:G.week,tier:"evloy",rounds:R.k===8?3:2,ev:1,carry:{hp:R.hp,sta:R.sta},bg:"bg_loy_ring.webp"};
    UI.modal=null;const go=()=>openFight2(bk,gauntAfter),S=loyBanter(R,f);save();if(S.length)playScene(S,go,{bg:"loy_night",look:"thai"});else go();},
  gquit:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;gauntFinish(R);render();},
  loydress1:d=>{const m=(G.mail||[]).find(x=>x.id===d.v),L=loyOf(G);if(!m||!L)return;L.dress=L.dress||{};L.dress[m.fid]=1;m.done=true;AU.sfx&&AU.sfx("level");toast(`Received Loy Krathong Thai dress: ${G.F[m.fid].name}`);save();render();},
  loydresswear:d=>{const f=G.F[d.v];if(!f||f.camp!=="player")return;f.outfit="loy";AU.sfx&&AU.sfx("ui");save();render();},
  loyrulesok:()=>{const L=loyOf(G);if(L)L.rulesSeen=1;save();UI.modal={type:"gaunt"};render();},
  loyrules:()=>{UI.modal={type:"loyrules"};render();},
  gretry:()=>{const L=loyOf(G);if(!L)return;L.run=null;L.pick=[];render();},
});

/* ===== v1.81: Loy Krathong round 2 — Thai-dress scenes, SR cards, the krathong thief, the otter, Thai dress off-stage ===== */
const LOY_CARDS=["lk_kati","lk_mali","lk_rin","lk_ploy","lk_fah"];
(()=>{
const LOY_HINT="Loy Krathong 2026 event · from the Riverside Brawl",LG_HINT="Loy Krathong gacha · festival only, Nov 18 – Dec 7";
const T=(n,f,t)=>({n,f,l:"thai",t}),N=t=>({n:"nar",t}),P=(who,t)=>({n:"npc",who,t});
Object.assign(CARDS,{
 lk_kati:{c:"kati",r:"SR",ev:1,t:"Lost at Loy Krathong",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Fireworks crack between luk thung songs from the ramwong stage. A little boy stands crying by a meatball stall, clutching a half-crumbled bread krathong."),
  T("kati","sad","Manager, that boy's been standing there for ten minutes. No one's even asked him."),
  N("Before you can answer, Kati is already weaving through the crowd to crouch in front of the boy, the hem of her pha sin dragging on the ground."),
  T("kati","happy","Don't cry. I'm Kati, and that guy over there is the Manager. He's really nice. We'll help you find your mom."),
  P("Little Boy","Mom told me to wait here… but someone stepped on my krathong. Mom's gonna be mad."),
  {choice:[{t:"\"I'll buy you a new krathong.\"",fx:G=>{G.cash-=40;add(G,"kati","bond",2);},then:[N("You buy a banana-leaf krathong from the next stall. The boy stops crying instantly, like someone hit a switch."),T("kati","flustered","…You know, Manager, Grandpa bought me a krathong just like that once, when I got lost at a temple fair.")]},
   {t:"\"Ride on Kati's shoulders so you can see your mom.\"",fx:G=>add(G,"kati","bond",3),then:[N("Kati hoists him onto her shoulders without a second thought. Her pha sin has to hitch up a little, but she doesn't care."),T("kati","happy","High enough? Look for your mom! Your eyes might be sharper than a boxer's!")]}]},
  P("Little Boy","Wait… you're the one who punched the helmet gang on the river ring, right?! So cool! …Oh, there's Mom! She's by the khanom krok boat!"),
  N("The boy's mother runs over, thanks them again and again, then presses two bags of khanom khrok into Kati's hands."),
  P("Little Boy","Kati… is that guy your boyfriend?"),
  T("kati","flustered","Huh!? No! He's the manager! …Not yet— no… No! Go with your mom already!"),
  N("The boy waves goodbye, leaving a red-faced Kati in the middle of the fair beside you, the khanom khrok still warm in her hands."),
  T("kati","flustered","…Let's take one bag each. And… what I said just now, don't think about it. I only got one word wrong.")]},
 lk_mali:{c:"mali",r:"SR",ev:1,t:"Pageant Stand-In",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("The call for Nang Noppamas contestants rings out for the third time. Number seven isn't coming; she suddenly fell ill."),
  N("Auntie Taew, sitting on the judging panel, turns to Mali in her gold Thai dress and smiles the smile everyone at the market knows there is no escaping."),
  P("Auntie Taew","Mali! Yes, you. You're already dressed, hair's already up. Get on stage, dear!"),
  T("mali","flustered","Huh!? All I can do is sew, Auntie! I can't do a catwalk! Manager, help Mali!"),
  {choice:[{t:"\"Go on. That dress is the prettiest at the fair.\"",fx:G=>add(G,"mali","bond",3),then:[T("mali","flustered","…When you say that, how can Mali refuse? Fine, she'll go up!")]},
   {t:"\"If you don't want to, I'll tell Auntie for you.\"",fx:G=>add(G,"mali","bond",2),then:[T("mali","happy","…It's okay. Just hearing that makes Mali brave enough. Fine, she'll go~")]}]},
  N("On stage Mali walks half a beat off the long drums the whole way, but smiles so wide the audience smiles along."),
  N("Then contestant number three's sash snaps in the middle of the stage. She freezes, pale."),
  T("mali","happy","Don't move~ Just a second~"),
  N("Mali pulls the needle from her hair and sews the sash back on in thirty seconds. The crowd claps louder than for the results."),
  P("MC","This year's Judges' Favorite award goes to… number seven, Mali from Sirichai Gym!"),
  N("Backstage, Mali hugs her bouquet tight and sits down beside you on the pier steps."),
  T("mali","flustered","…Manager, on stage I didn't look at a single judge. I was only looking at one person the whole time."),
  T("mali","flustered","Don't ask who! …You can ask next year, if Mali gets on stage again.")]},
 lk_rin:{c:"rin",r:"SR",ev:1,t:"Destined Match by the River",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("A fortune teller by the pier beckons Rin over. Her sign says: \"Palm reading, so accurate it's spooky, thirty baht.\""),
  T("rin","happy","I'll pay thirty baht to test its accuracy. Manager, please take notes. Check off whatever's right."),
  P("Pier Fortune Teller","You overthink, stay up late, love numbers, and rarely tell anyone how you feel."),
  T("rin","flustered","…Three out of four. Could be reading body language. Doesn't count."),
  P("Pier Fortune Teller","And… your palm says your destined match is very close. Close enough to be standing beside you right now."),
  N("Rin turns slowly to look at you. Her glasses reflect the candlelight, hiding her eyes."),
  T("rin","happy","The odds of a prediction like that being right depend on how many people are standing nearby. Which right now is… one."),
  {choice:[{t:"\"Then it's a hundred percent accurate.\"",fx:G=>add(G,"rin","bond",3),then:[T("rin","flustered","…A sample of one. No conclusions can be drawn! …But I won't delete this data.")]},
   {t:"\"I'll step aside so the data stays neutral.\"",fx:G=>add(G,"rin","bond",1),then:[T("rin","pout","…Don't move. The control variable stays where it is.")]}]},
  T("rin","flustered","…Not enough data. We need more samples. Will you come get a reading with me again next year? To retest."),
  N("Rin folds the fortune neatly into her pocket, though she normally throws every receipt away immediately."),
  T("rin","happy","Also, you marked one wrong, Manager. The last one should be a check, not a question mark.")]},
 lk_ploy:{c:"ploy",r:"SR",ev:1,t:"Ditching the Photo Shoot",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Someone in a purple Thai dress dashes behind you at the pier. Three photographers run past the other way."),
  T("ploy","flustered","Shh! Stand still like that. The sponsor's had me holding a krathong and smiling for two hours."),
  T("ploy","happy","Smiling for two hours straight hurts the cheeks more than getting kicked, you know."),
  N("Ploy stays pressed against your back until the photographers vanish into the crowd, then finally steps out."),
  T("ploy","sad","I've held a krathong for photos for ten years… and never once floated one myself. After the shoot they take it back."),
  {choice:[{t:"Hand her a krathong from Auntie Taew's stall",fx:G=>{G.cash-=40;add(G,"ploy","bond",3);},then:[N("You hand her a banana-leaf krathong. Ploy takes it with both hands like a trophy.")]},
   {t:"\"Let's go fold one ourselves at Auntie Taew's stall.\"",fx:G=>add(G,"ploy","bond",3),then:[N("Ploy folds a banana-leaf krathong for the first time in her life. The petals lean to one side, but she won't let anyone fix it."),T("ploy","happy","Crooked or not, I made this one.")]}]},
  N("Ploy lights the candle herself, hands shaking a little, then crouches and sets the krathong on the water carefully. Half the hem of her expensive Thai dress gets soaked."),
  N("She keeps her palms pressed together for a long time, until the krathong is more than ten meters away."),
  T("ploy","flustered","…Don't tell anyone I wished for that long. And don't ask what I wished for."),
  T("ploy","happy","If the wish comes true, you'll know next year. …Go on now, before the photographers circle back.")]},
 lk_fah:{c:"fah",r:"SR",ev:1,t:"Lantern Showdown",hint:LOY_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Fah and Mali each light a sky lantern on the riverside lawn. Whoever's flies higher gets to stand next to the manager for the fireworks."),
  T("fah","angry","Fah's lantern is bigger, the wick's thicker! Easy win! Give up now while you can, Mali!"),
  T("mali","happy","Mali wrote a wish on hers~ Lanterns with wishes always fly higher, Auntie Taew said."),
  T("fah","pout","Auntie Taew just made that up! …Manager, pen. Fah's writing one too."),
  {choice:[{t:"Hand her the pen without looking",fx:G=>add(G,"fah","bond",3),then:[N("Fah turns her back and writes for a long time, crosses it out twice, then rewrites it very small.")]},
   {t:"Sneak a peek at what she writes",fx:G=>add(G,"fah","bond",1),then:[T("fah","angry","Don't look!! …It's not about you! It's about boxing! Pure boxing!")]}]},
  N("Fah's lantern shoots up fast… and snags on the first rain tree, flickering on the branch like a star landed in the wrong place."),
  N("Mali's lantern drifts past slowly and gracefully, rising until it's a tiny dot among the real stars."),
  T("fah","flustered","…Doesn't count! The tree cheated! It's definitely Mali's camp's tree!"),
  T("fah","flustered","…Fine. Fah'll take the other side. You've got two sides, right? Either side's within the rules."),
  N("The first firework bursts in the sky. Someone's standing on each side of you, and neither moves until the last one fades."),
  T("fah","happy","…Rematch next year. Fah'll pick a spot with no trees, and you have to come watch again. No bailing!")]},
 // ===== ตู้กาชาลอยกระทง (lg:1) =====
 lg_kati_n:{c:"kati",r:"N",lg:1,t:"The Manager's Banana-Leaf Krathong",hint:LG_HINT,bg:"camp",need:()=>false,steps:[
  N("The afternoon of Loy Krathong. Kati sits folding banana-leaf krathongs outside the camp, leaves piled knee-high."),
  T("kati","happy","Manager, come fold with me! Fold the petals like this, fold in half, pin it. Super easy."),
  N("Thirty minutes later Kati has seven krathongs, all equally pretty. You have one, and it looks like a motorcycle helmet."),
  T("kati","flustered","…This one's cool! Totally one of a kind! Can I float this one? I'll trade you all seven of mine.")]},
 lg_kati_r:{c:"kati",r:"R",lg:1,t:"Scalded Tongue",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("The khanom khrok boat fills the pier with its smell. Kati buys three trays despite saying she's watching her weight."),
  T("kati","happy","Full moon's an exception. Kru Daeng isn't here, no one's watching."),
  N("Kati bites into the first one while it's still scorching, then freezes for three full seconds."),
  T("kati","sad","…It's hot. I burned my tongue. Manager, I can't talk right anymore."),
  {choice:[{t:"Blow on a khanom khrok to cool it before handing it over",fx:G=>add(G,"kati","bond",2),then:[T("kati","flustered","…Thank you. Cooler than the dessert… I mean the person blowing! Not the dessert!")]},
   {t:"\"Kru Daeng's watching. He's right behind you.\"",fx:G=>add(G,"kati","bond",1),then:[N("Kati whips around to look. No one's there."),T("kati","pout","You're teasing me, Manager! No sharing this tray!")]}]}]},
 lg_kati_sr:{c:"kati",r:"SR",lg:1,t:"Kati's Wish",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("The pier goes quiet after midnight. Only the candlelight from krathongs stuck along the bank remains."),
  T("kati","happy","Every year I wish for the camp to survive. Same wish for seven years. Grandpa said if you keep asking, the gods remember."),
  T("kati","sad","The year Grandpa died, I didn't come. I sat in the camp alone all night, scared that if I left, the camp would vanish too."),
  {choice:[{t:"\"The camp isn't going anywhere this year.\"",fx:G=>add(G,"kati","bond",3),then:[T("kati","flustered","…Yes. Because you're here.")]},
   {t:"Listen quietly",fx:G=>add(G,"kati","bond",2),then:[N("Kati leans lightly against your shoulder, as if by accident, and doesn't move away.")]}]},
  T("kati","happy","So this year I wished for something new. First time in seven years."),
  T("kati","flustered","…I won't say what I wished for. But you're in it. That's enough.")]},
 lg_mali_n:{c:"mali",r:"N",lg:1,t:"A Bread Krathong for the Fish",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Mali holds a bread krathong the size of a dinner plate, decorated with whole real marigolds."),
  T("mali","happy","It's a bread krathong. It won't pollute the water, and the fish can eat it. Mali baked it at five this morning~"),
  N("The krathong drifts less than two meters before a dozen catfish swarm it and it sinks, candle and all."),
  T("mali","flustered","…Mali wasn't even done wishing! The fish were hungrier than Mali's wish! Manager, why are you laughing!")]},
 lg_mali_r:{c:"mali",r:"R",lg:1,t:"Measured for a Suit",hint:LG_HINT,bg:"camp",need:()=>false,steps:[
  N("Mali has been mending everyone's sabai since morning. Her pincushion is packed with needles."),
  T("mali","happy","Manager, stand still. Mali needs your measurements. Next year she'll make you a Thai outfit too, to match ours."),
  N("The tape measure wraps around your shoulders. Mali jots numbers in a little notebook, then freezes at the chest measurement."),
  T("mali","flustered","…Mali's writing this number on a special page. Don't ask to see the notebook! Not any of it!"),
  {choice:[{t:"\"Can you make it the same color as Mali's?\"",fx:G=>add(G,"mali","bond",3),then:[T("mali","flustered","Matching blue!? …Yes, absolutely! Mali will finish it before New Year!")]},
   {t:"\"Any color. Mali's choice.\"",fx:G=>add(G,"mali","bond",1),then:[T("mali","happy","Then Mali picks the color you look most handsome in~ …which is every color.")]}]}]},
 lg_mali_sr:{c:"mali",r:"SR",lg:1,t:"Riverside Ramwong",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("The ramwong stage by the pier plays old ramwong songs. A circle of people in Thai dress turns slowly around the lanterns."),
  T("mali","happy","Manager! Let's dance the ramwong! You don't need to know how. Follow Mali and turn your wrists like this~"),
  {choice:[{t:"Join the circle",fx:G=>add(G,"mali","bond",3),then:[N("You're off the beat the whole song, but Mali follows your every wrong step, until you're the only pair in the circle dancing in sync.")]},
   {t:"\"I'll watch from the side first.\"",fx:G=>add(G,"mali","bond",1),then:[N("Mali dances around the circle alone twice. Every time she passes you, she holds out her hand without a word."),N("On the third pass, you take her hand.")]}]},
  T("mali","flustered","…Mom once said people who dance the ramwong together on the full moon will dance together again next year."),
  T("mali","happy","Mom might have made it up. But Mali believes everything Mom says~")]},
 lg_rin_n:{c:"rin",r:"N",lg:1,t:"Ping River Krathong Stats",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Rin stands on the pier with a tally counter, clicking every time a krathong floats past."),
  T("rin","happy","1,284 this hour. 3% are foam, down 9% from last year. I'll send this data to the municipality."),
  T("rin","flustered","…You don't need to make that face, Manager. I can float krathongs too. Just after I finish counting."),
  N("At one a.m. Rin floats her own little banana-leaf krathong as number 4,071, and clicks the counter for it too.")]},
 lg_rin_r:{c:"rin",r:"R",lg:1,t:"Selfie Fail",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Mali hands Rin her phone and tells her to take a photo with the manager, \"a Thai-dress souvenir.\""),
  T("rin","flustered","I've never taken a selfie. Front cameras distort facial proportions by about 30%. Unreliable."),
  N("The first shot is all chin, the second all sky, the third half Rin's finger."),
  {choice:[{t:"Take the phone and shoot it yourself",fx:G=>add(G,"rin","bond",3),then:[N("The fourth one comes out well. Rin stands as straight as an ID photo, but her ears are visibly red."),T("rin","flustered","…Send me the original file. Full resolution. For record-keeping.")]},
   {t:"\"The third one's cute.\"",fx:G=>add(G,"rin","bond",2),then:[T("rin","pout","That's my finger, not my face. …If you like it, you can keep it. I won't stop you.")]}]}]},
 lg_rin_sr:{c:"rin",r:"SR",lg:1,t:"The Hundredth Lantern",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Rin holds the lantern perfectly still, waiting for the air inside to heat up, lips moving as she counts softly."),
  T("rin","happy","I've calculated it. We need to wait 47 seconds for enough lift. Release early and it falls."),
  T("rin","sad","…As a kid I let go too early every year. Never got a single one to fly. Dad said it was because I was impatient."),
  {choice:[{t:"Hold the other side and count together",fx:G=>add(G,"rin","bond",3),then:[N("You and Rin count together up to forty-seven and let go at the same moment.")]},
   {t:"\"No need to rush today. I can wait.\"",fx:G=>add(G,"rin","bond",2),then:[N("Rin keeps counting calmly and lets go at exactly second forty-seven.")]}]},
  N("The lantern rises straight up without the slightest tilt, joining hundreds of others above the Ping River."),
  T("rin","flustered","…It's flying. My first one ever."),
  T("rin","happy","New hypothesis: it wasn't that I was impatient. It's that no one ever counted with me. This needs retesting every year.")]},
 lg_ploy_n:{c:"ploy",r:"N",lg:1,t:"Thai-Dress Billboard",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("A three-meter sports-drink billboard stands at the fair entrance: Ploy in Thai dress, holding a krathong, smiling wide."),
  N("The real one stands right under it, in a cap and a face mask."),
  T("ploy","flustered","Don't stare at the sign so long… I was so sleepy that day. That smile took forty retakes."),
  T("ploy","happy","But if you want to take a photo with the sign, I won't mind. That's the best smile of my life.")]},
 lg_ploy_r:{c:"ploy",r:"R",lg:1,t:"One Krathong, Ten Years Ago",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Ploy sits at the end of the pier, feet dangling, watching the krathongs drift past one by one."),
  T("ploy","sad","My first year at Golden Tiger I was twelve. Everyone went home to float krathongs with their families. I was the only one left."),
  T("ploy","sad","The boss gave me fifty baht for a krathong. I bought one and never floated it. Just held it until the candle burned out."),
  {choice:[{t:"\"You're not alone this year.\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…I know. You don't have to say it. But now that you have… it's fine.")]},
   {t:"Hand her a spare candle",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","In case the candle goes out again? …You're as prepared as a real cornerman.")]}]}]},
 lg_ploy_sr:{c:"ploy",r:"SR",lg:1,t:"The Night No One Recognized Her",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Ploy wears a plastic hero mask from a toy stall pushed up on her cap, sunglasses hooked on her collar. Not one person at the fair turns to look at her."),
  T("ploy","happy","Three hours and not one photo request. I haven't walked a fair like this since I was a kid."),
  N("Ploy eats two meatball skewers, wins a teddy bear at the shooting gallery, and laughs out loud every time you miss."),
  {choice:[{t:"\"This cat shoots better than the champion.\"",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","Well, the champion's the one wearing the mask.")]},
   {t:"\"The mask suits you, but you're prettier without it.\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…Right now I'm glad I'm wearing a mask, because my face is completely red.")]}]},
  N("Before you part, Ploy shoves the teddy bear into your hands."),
  T("ploy","flustered","Keep it at your camp. If I ever get tired of being the Ploy everyone recognizes, I'll come visit it. …Not you. It.")]},
 lg_fah_n:{c:"fah",r:"N",lg:1,t:"The Giant Firecracker",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("Fah lugs in a cloth bag stuffed with firecrackers, looking as proud as if she'd just won a fight."),
  T("fah","happy","This one's the biggest in the shop! Fah's lighting it right here so the whole market knows Fah's arrived!"),
  P("Auntie Taew","Silver-top! Light that here and Auntie'll spank you striped! Go light it over there!"),
  T("fah","pout","…Yes sir, Auntie— I mean, yes ma'am! Manager, hold the bag. Fah's moving to the other side, quietly.")]},
 lg_fah_r:{c:"fah",r:"R",lg:1,t:"The Big Firework",hint:LG_HINT,bg:"loy_night",need:()=>false,steps:[
  N("The biggest firework of the night bursts right overhead, so loud the shop windows rattle."),
  N("Fah jumps out of her skin and grabs your arm tight without thinking."),
  T("fah","flustered","…Fah's not scared! It's abnormally loud! Fah's just… keeping you from getting startled!"),
  {choice:[{t:"\"Then keep holding on, in case I get scared again.\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…Fine! For you! Purely for you!"),N("Twelve more fireworks go off. Fah doesn't let go of your arm for a single one.")]},
   {t:"\"The tiger-tattoo champ is scared of fireworks?\"",fx:G=>add(G,"fah","bond",1),then:[T("fah","angry","Who's scared! …Don't tell anyone. If Mali hears about it, Fah'll kick you!")]}]}]},
 lg_fah_sr:{c:"fah",r:"SR",lg:1,t:"Two Krathongs",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Fah is holding two krathongs. One neat and pretty, the other tiny, its banana leaves stitched all crooked."),
  T("fah","happy","The pretty one's Fah's. The crooked one… don't know who to give it to. Made one too many."),
  T("fah","sad","When Fah was little she floated krathongs alone every year. Always made two, in case someone came along. Ended up floating both herself."),
  {choice:[{t:"\"Can I have the crooked one?\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…Why pick the crooked one! …Fine. Fah spent the longest on that one.")]},
   {t:"\"Let's float them together this year.\"",fx:G=>add(G,"fah","bond",3),then:[T("fah","flustered","…You say that so easily. …Fine. Two of us.")]}]},
  N("The two krathongs drift off together. The crooked one keeps chasing the pretty one the whole way, never falling behind."),
  T("fah","happy","See? The little one kept up. Fah sewed it well. Make two again next year. Don't make Fah float alone!")]},
 lg_team_ssr:{c:"kati",r:"SSR",lg:1,t:"Full Moon of the Twelfth Month",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("One a.m. The fair's over. The pier holds only the Sirichai camp and a thousand candles drifting on the river."),
  {n:"coach",t:"Grandpa Chai used to bring me here to float krathongs every year. He said a gym is like a krathong: if no one holds it steady, it sinks."},
  T("kati","happy","Our camp's krathong floated the farthest in the whole fair, Kru Daeng!"),
  T("mali","happy","Because Mali folded it herself! …Kati helped a little."),
  T("rin","happy","The farthest within the radius I can see. Which is limited by my glasses."),
  T("ploy","happy","Next year I'll float one with this camp again. No sponsors, no cameras."),
  T("fah","happy","Fah's coming too! And next year Fah's krathong goes farther!"),
  {choice:[{t:"\"Next year, the year after, every year.\"",fx:G=>{for(const id of ["kati","mali","rin","ploy","fah"])add(G,id,"bond",2);},then:[N("No one answers, but everyone shifts a little closer together.")]},
   {t:"Take a group photo with Grandpa Chai's old camera",fx:G=>{for(const id of ["kati","mali","rin","ploy","fah"])add(G,id,"bond",2);},then:[N("The flash goes off once. Everyone's half-blinking in the photo, and no one will agree to a retake.")]}]},
  N("The Sirichai krathong floats away until it's out of sight. No one gets up until the last candle on the pier goes out.")]}});

})();
/* v1.89.24: the riverside SR card stories keep their choices, but nothing (bond, cash) leaks into the main game */
(()=>{const mute=st=>(st||[]).forEach(x=>{if(x&&x.choice)x.choice.forEach(o=>{o.fx=()=>{};mute(o.then);});});for(const k of LOY_CARDS)if(CARDS[k])mute(CARDS[k].steps);})();
function loyCardDrop(G,order){G.cards=G.cards||{};const left=LOY_CARDS.filter(k=>!G.cards[k]);if(!left.length)return null;
  const pref=(order||[]).map(id=>"lk_"+id).filter(k=>left.includes(k));const L=loyOf(G);const id=pref[0]||left[((L&&L.runs)||0)%left.length];
  G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false}; /* v1.89.24: event card — no bond or stardust carried into the main game */
  return `New SR card: "${CARDS[id].t}" (see it in the album)`;}
function loyGold(G){const L=loyOf(G);if(!L)return null;return "Unlocked the manager's Thai silk shirt and krathong hat (wear them any time · Settings › Edit character)";} /* v1.91.117 (Man): the gold tier now dresses the manager */
const loyThaiLook=G=>!!(G&&G.ev&&G.ev.loy&&G.ev.loy.tiers&&G.ev.loy.tiers.silver);
/* v1.89.25: Tum comes back every in-game Loy Krathong (weeks 24–28) by letter — the event's stardust giver; he scales a little above the camp's top three */
const THIEF_WK=[24,27];
/* v1.90.8 (Man): Tum comes (1) once a real day 20–23 Nov 2026, (2) every week for the 4 game weeks after you first start the riverside brawl —
   saves that already played it without meeting him get those 4 weeks from now — and (3) game weeks 24–27 every year (was 24–28) */
const THIEF_DAYS=["2026-11-20","2026-11-23"];
const thiefDaily=()=>{const t=todayStr();return t>=THIEF_DAYS[0]&&t<=THIEF_DAYS[1];};
const thiefWin=G=>{const L=loyOf(G);if(!L)return false;const w=absWeek(G);return (G.week>=THIEF_WK[0]&&G.week<=THIEF_WK[1])||(L.thiefFrom!=null&&w>=L.thiefFrom&&w<L.thiefFrom+4);};
/* v1.90.9 (Man): the real-day visits go to Tuy, Tum's younger brother (red mask, own sprite + portrait) — stronger, 3 rounds, bigger reward, once a real day.
   Tum keeps the game-week windows. Each has his own once-per-day/once-per-week clock, so when windows overlap both can be caught. */
const thiefOn=G=>!!loyOf(G)&&thiefWin(G);
const thiefReady=G=>{const L=loyOf(G);return thiefOn(G)&&L.thiefWk!==absWeek(G);};
const thiefAgain=G=>"back next week";
const tuyOn=G=>!!loyOf(G)&&thiefDaily();
const tuyReady=G=>{const L=loyOf(G);return tuyOn(G)&&L.tuyDay!==todayStr();};
function thiefFix(G){const L=loyOf(G);if(!L)return;if(L.thiefFrom==null&&L.runs>0&&L.thiefWk==null)L.thiefFrom=absWeek(G);thiefMail(G);tuyMail(G);}
function tuyMail(G){if(!tuyReady(G))return;if((G.mail||[]).some(m=>m.ev==="tuy"&&!m.done&&!m.expired))return;
  addMail(G,{kind:"event",ev:"tuy",from:"Auntie Taew, som tam stall by the temple",title:"Tum's little brother Tuy is here!",exp:G.week+1,
    body:"Manager dear, it's not Tum this time. It's his little brother, Tuy the Red Mask, and he's worse than his brother. Carried off a whole sack of krathongs. Auntie only ever sees him around these few days. Send your best kids to help, would you?"});}
const campPow=G=>{const R=roster(G).map(f=>ovr(f.a)).sort((a,b)=>b-a).slice(0,3);return R.length?R.reduce((s,x)=>s+x,0)/R.length:8;};
const campLv=G=>{const R=roster(G).map(f=>f.lvl||1).sort((a,b)=>b-a).slice(0,3);return R.length?Math.round(R.reduce((s,x)=>s+x,0)/R.length):1;};
function thiefMail(G){if(!thiefReady(G))return;if((G.mail||[]).some(m=>m.ev==="thief"&&!m.done&&!m.expired))return;
  addMail(G,{kind:"event",ev:"thief",from:"Auntie Taew, som tam stall by the temple",title:"Tum Is Back!",exp:G.week+1,
    body:"Manager dear, every Loy Krathong that Tum the krathong thief shows up. Last night he hauled off a sack full of coins from people's krathongs again. Send the girls to help catch him — Auntie's frying khanom krok for you."});}
const THIEF_SCALE={m:1.04,mt:1.07,e:.5}; /* v1.91.7: scaled to the girl who steps up (her stats + half her skill/gear edge), not the camp average — a stand-out fighter no longer flattens him */
function thiefBase(G,f){const g=typeof loyBoost==="function"?loyBoost(f):f,me=ovr(g.a)+(g.camp==="player"?THIEF_SCALE.e*hiddenEdge(g):0);return Math.max(campPow(G),me);}
function evThief(G,f,tuy){const K=QK.gang1,target=Math.max(6,thiefBase(G,f)*(tuy?THIEF_SCALE.mt:THIEF_SCALE.m)),t=Math.min(tuy?19.5:19.2,target),rng=mulberry32((G.seed^(tuy?0x7b3:0x7a1))+absWeek(G)*17);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const id="q_evthief";
  const nm=tuy?LOY_TUY.name:LOY_THIEF.name;const o=baseFighter(id,{name:nm,full:nm,div:"X",camp:"quest",color:tuy?"#a8202c":"#6b7a2e",potential:t+2,a});
  o.vet=Math.min(12,Math.max(0,target-ovr(a)));o.nlsk=QSK.gang.slice(0,tuy?3:2);o.sprite=tuy?"thief2":"thief";o.kind="gang1";o.grp="gang";o.lvl=campLv(G)+(tuy?2:1);o.fatigue=0;o.morale=70;G.F[id]=o;return id;}
function thiefHTML(){const pool=gauntPool(),tuy=UI.thiefK==="tuy";return `${tuy?`<h2>Catch Tuy the Red Mask</h2><p class="meta">A 3-round bout, no injuries · tougher than Tum, bigger rewards · win for EXP and stardust ✦ (a little stardust even if you lose) · only on 20–23 Nov, once a day</p>`:`<h2>Catch the Krathong Thief</h2><p class="meta">A 2-round bout, no injuries · win for EXP and stardust ✦ (a little stardust even if you lose) · Tum gets tougher as your camp does · only during Loy Krathong, once a week</p>`}
  <div class="gpick">${pool.map(f=>`<button class="gpk" data-act="thiefgo" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>${isLoyGuest(f)?"Guest · ":""}Lv.${f.lvl}</small></span></button>`).join("")}</div>
  <div class="center endbtns"><button class="btn" data-act="closeModal">Later</button></div>`;}
function thiefGo(fid){const L=loyOf(G);if(!L)return;const f=G.F[fid];if(!f)return;UI.modal=null;const tuy=UI.thiefK==="tuy",X=tuy?LOY_TUY:LOY_THIEF;
  const pre=[...X.pre,f.canon&&LOY_THIEF.line[fid]?{n:fid,f:"angry",l:"thai",t:LOY_THIEF.line[fid]}:{n:"nar",t:`${f.name} steps onto the pier and rolls up their sleeves`}];
  playScene(pre,()=>{const qid=evThief(G,f,tuy);const bk={id:"bthief",a:fid,b:qid,week:G.week,tier:"evloy",rounds:3,ev:1,bg:"bg_loy_ring.webp"};
    openFight2(bk,()=>{const F=LASTF,win=F&&F.result&&F.result.win==="A",ko=win&&/KO|น็อก/.test(F.result.type||"");if(tuy)L.tuyDay=todayStr();else L.thiefWk=absWeek(G);delete G.F.q_evthief;
      for(const m of G.mail||[])if(m.ev===(tuy?"tuy":"thief")&&!m.done)m.done=true;
      const yr=G.season||1,xp=Math.round((win?30+10*yr:10)*(tuy?1.5:1)),du=tuy?(win?(ko?8:6):2):(win?(ko?5:4):1);if(f.camp==="player")gainXP(G,f,xp);G.dust=(G.dust||0)+du;
      /* v1.90.10 (Man): the villagers chip in when you win — Tuy ฿2,000 + ฿1,000 a year (KO +50%), Tum ฿200 */const cash=win?(tuy?Math.round((2000+1000*yr)*(ko?1.5:1)/100)*100:200):0;if(cash)G.cash+=cash;
      const rw=[cash?`Cash +${fmt(cash)}`:"",f.camp==="player"?`${f.name} EXP +${xp}`:"",`Stardust ✦ +${du}`].filter(Boolean).join(" · ");
      if(win){if(tuy)L.tuyN=(L.tuyN||0)+1;else L.thiefN=(L.thiefN||0)+1;}save();
      playScene(win?[...X.win,{n:"nar",t:tuy?`Tuy caught ${L.tuyN} · ${rw}`:`Times Tum has been caught: ${L.thiefN} · ${rw}`}]:[...X.lose,{n:"nar",t:`Never mind — experience is experience · ${rw}`}],()=>{AU.startMusic("hub");UI.tab="home";save();render();},{bg:"river",look:"thai"});});},{bg:"river",look:"thai"});}
Object.assign(ACT,{
  loyintro:()=>{UI.modal=null;playScene(loyIntro(G),()=>{AU.startMusic("hub");render();},{bg:"river",look:"thai"});},
  loyend:d=>{const E=LOY_END[d.v];if(!E)return;const L=loyOf(G);if(L&&L.run&&L.run.newEnd===d.v)L.run.newEnd=null;UI.modal=null;
    playScene(loyEndSteps(d.v,L&&L.endCast&&L.endCast[d.v],L&&L.endBoss&&L.endBoss[d.v]),()=>{AU.startMusic("hub");const back=()=>{if(L&&L.run&&L.run.done)UI.modal={type:"gaunt"};if(L&&L.petPend!=null){UI.petName=L.petPend;L.petPend=null;save();}render();};
      if(L&&(!L.wish||L.floatTok))loyWishOpen(back);else back();},{bg:"river",look:"thai"});},
  loywish:d=>loyWishPick(d.v),lwfloatdone:()=>{if(UI.lwGo)UI.lwGo();},
  kongka:d=>{const m=(G.mail||[]).find(x=>x.id===d.v);if(!m||m.done)return;const B=KONGKA[m.wish];if(!B)return;m.done=true;B.fx(G,m);save();UI.modal=null;
    playScene([{n:"nar",bg:"river_dawn",t:"The manager walks down to the pier in front of the camp. The morning mist hasn't lifted; last night's krathongs have drifted back to the bank, candles long out, but the jasmine scent lingers."},{n:"nar",t:`The manager presses palms together and thanks the river · Received ${B.n} · ${B.d}`}],()=>{AU.sfx&&AU.sfx("level");render();},{bg:"river_dawn",look:"casual"});},lwskip:()=>{UI.lwSkip=true;render();},
  lwclose:()=>{if(UI.lwGo){UI.lwGo();return;}UI.modal=null;const d=UI.lwDone;UI.lwDone=null;AU.startMusic("hub");if(d)d();else render();},
  loywishopen:()=>{const L=loyOf(G);if(!loyCanFloat(L))return;loyWishOpen(()=>{UI.modal=null;render();});},
  loyfloat:()=>{const L=loyOf(G);if(!loyCanFloat(L))return;loyWishOpen(()=>{UI.modal=L.run&&L.run.done?{type:"gaunt"}:null;render();});},
  tuy:()=>{const L=loyOf(G);if(!L||!tuyReady(G))return;UI.thiefK="tuy";UI.modal={type:"thief"};render();},
  thief:()=>{const L=loyOf(G);if(!L||!thiefReady(G))return;UI.thiefK="tum";UI.modal={type:"thief"};render();},
  thiefgo:d=>thiefGo(d.v),
  loydress:()=>{const L=loyOf(G);if(!L||!L.tiers.gold)return;L.dressOn=L.dressOn?0:1;save();render();},
});

/* ===== v1.82: code-content replay in settings + the Loy Krathong gacha (festival only) ===== */
const LOY_FEST={from:"2026-11-18",to:"2026-12-07"};
function loyFest(){const t=todayStr();return evTest()||(t>=LOY_FEST.from&&t<=LOY_FEST.to);}
const LG_COST=30,LG_PITY=10;
function loyPull(G){if(!loyFest()||(G.dust||0)<LG_COST)return null;G.dust-=LG_COST;G.lgPity=(G.lgPity||0)+1;G.lgPulls=(G.lgPulls||0)+1;G.cards=G.cards||{};
  const pool=Object.keys(CARDS).filter(k=>CARDS[k].lg),by=r=>pool.filter(k=>CARDS[k].r===r);const x=srand(G,(G.lgPity*173+G.lgPulls*11)|0);
  const pity=G.lgPity>=LG_PITY;let r=pity?"SSR":x<.04?"SSR":x<.27?"SR":x<.65?"R":"N";if(r==="SSR")G.lgPity=0;let L=by(r);if(pity){const nw=L.filter(k=>!G.cards[k]);if(nw.length)L=nw;}const id=L[Math.floor(srand(G,G.lgPulls*89+5)*L.length)];
  const o=G.cards[id];let res;if(!o){G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};res={id,isNew:true};}
  else{o.n=(o.n||1)+1;o.spare=(o.spare||0)+1;res={id,spare:o.spare,canUp:(o.lv||1)<3};} /* v1.85.1: every duplicate is kept — the player levels the card up or breaks it down on the card page */
  res.loy=1;return res;}
// v1.87.3: before the festival the box is on show but locked, with its opening time
function loySoon(){const t=todayStr();return !evTest()&&t<LOY_FEST.from;}
function loyGachaHTML(){if(loySoon()){const all=Object.keys(CARDS).filter(k=>CARDS[k].lg).length;
    return `<div class="gacha loyg soon"><span><b class="goldt">Loy Krathong gacha</b> <small>Opens Nov 18 at 00:00 until Dec 7 · Thai-dress cards: ${all} cards · save up your stardust</small></span><button class="btn sm" disabled aria-disabled="true">🔒 Opens Nov 18</button></div>`;}
  if(!loyFest())return "";const own=Object.keys(CARDS).filter(k=>CARDS[k].lg&&(G.cards||{})[k]).length,all=Object.keys(CARDS).filter(k=>CARDS[k].lg).length;
  return `<div class="gacha loyg"><span><b class="goldt">Loy Krathong Machine</b> <small>Open until Dec 7 only · Thai-dress cards ${own}/${all} cards · guaranteed SSR in ${Math.max(1,LG_PITY-(G.lgPity||0))} left · cards you get stay in your album forever</small></span><button class="btn sm gold" data-act="gopen" data-v="loy">🏮 Loy Krathong machine ${LG_COST}✦</button></div>`;}
function codeContentHTML(){const L=loyOf(G);if(!L)return "";
  return `<div class="set"><span><b>Code content</b><small>Go back to events you unlocked with a code, anytime</small></span><span class="obtns"><button class="btn sm" data-act="loyhub">Loy Krathong 2026 ▸</button></span></div>`;}
function loyHubHTML(){return `<h2>Riverside Brawl on Loy Krathong Night</h2><p class="meta">Event from code LOYKRATHONG69 · replay the brawl, rewatch the opening and endings, and catch the thief here</p><div class="center endbtns col">${evMailAct({})}</div>${loyGachaHTML()}`;}
Object.assign(ACT,{
  loygacha:()=>{const r=loyPull(G);if(!r){if(loySoon())toast("The Loy Krathong gacha opens Nov 18 at 00:00");else if(!loyFest())toast("The Loy Krathong machine is closed. See you next festival!");return;}AU.sfx&&AU.sfx(["SSR","SR"].includes(CARDS[r.id].r)?"level":"ui");save();UI.modal={type:"gacha",res:r};render();},
  loyhub:()=>{UI.modal={type:"loyhub"};render();},
});
// v1.86: card levels — longer stories, a Lv.2 epilogue and a Lv.3 special scene (and a minigame on the SSR cards)
// choices here carry no bond effects: cards can be replayed, the bond comes from levelling the card up
const cN=t=>({n:"nar",t}),cP=(who,t)=>({n:"npc",who,t});
const CARD_LV={
 g_kati_sr:{main:[cN("Under the drawing, in shaky handwriting: 'This belt goes to whoever never abandons the camp.'"),{n:"kati",f:"sad",l:"casual",t:"Grandpa wrote that when he was already very sick. I only saw it today."},{n:"kati",f:"happy",l:"casual",t:"Then this belt isn't just mine. You never abandoned the camp either, Manager."}],lv2:[cN("The next morning, the belt drawing hangs framed above the training room door."),{n:"coach",t:"Kati, why'd you hang that up there?"},{n:"kati",f:"happy",l:"casual",t:"So everyone sees it every morning, Coach. So we remember what we train for."},{n:"coach",t:"…Old Chai must be laughing. His granddaughter's exactly as stubborn as he was."}],lv3:[cN("One night Kati drags you to the silversmith at the end of the market, Grandpa's drawing in hand."),{n:"kati",f:"happy",l:"casual",t:"Uncle, can you make a belt like this one? It doesn't have to be real gold."},cP("Silversmith","This… that's Chai's hand. Forty years ago he ordered exactly this, but he couldn't afford it."),{n:"kati",f:"sad",l:"casual",t:"Grandpa… came here to order it?"},cP("Silversmith","I've kept the mould for him ever since, waiting for the day he'd come back."),{choice:[{t:"\"His granddaughter came in his place today.\"",then:[{n:"kati",f:"flustered",l:"casual",t:"…If you say it like that, Manager, I'm going to cry in his shop."}]},{t:"Quietly pay the deposit for Kati",then:[cN("Kati notices afterwards, thumps your shoulder three times, then walks all the way back holding your arm.")]}]},cN("Sirichai Camp's first replica belt rests beside Grandpa Chai's photo, waiting for the real one."),{n:"kati",f:"happy",l:"casual",t:"Just a little longer, Grandpa. The Manager and I will bring you the real one."}],lv3t:"The First Belt"},
 g_mali_sr:{main:[{n:"mali",f:"flustered",l:"casual",t:"…If you got to the part about you being kind, never mind. That part's true."},cN("Mali folds the letter into an envelope but doesn't seal it."),{n:"mali",f:"sad",l:"casual",t:"I write to Mum every month, but I've never sent a single one. I'm scared she'll worry — every letter's full of injuries."},{n:"mali",f:"happy",l:"casual",t:"Maybe I'll send this one… if you add a line at the end for me~"}],lv2:[cN("Two weeks later the postman brings a blue envelope to the camp, addressed to Mali."),{n:"mali",f:"happy",l:"casual",t:"Mom wrote back!! …She says 'Please thank the Manager for looking after my girl.'"},{n:"mali",f:"flustered",l:"casual",t:"What did you write at the end of my letter!? Mom's asking if you're my boyfriend!"}],lv3:[cN("Sunday morning, a woman in a jasmine-print blouse stands at the gate holding a huge tiffin carrier."),{n:"mali",f:"flustered",l:"casual",t:"Mom!? How did you get here? You didn't even tell me!"},cP("Mali's mother","I came to see if you're really eating well. Your letter said you'd put on weight. I had to see for myself."),cN("Mali's mother watches her kick pads by the ring all afternoon without saying a word."),cP("Mali's mother","You kick better than your father ever did. …I won't worry any more. But you eat three meals a day."),{choice:[{t:"\"I'll make sure she eats all three.\"",then:[{n:"mali",f:"happy",l:"casual",t:"Mom! Did you hear? The Manager promised~"}]},{t:"Invite her to eat with the whole camp",then:[cN("The five-tier tiffin is empty in ten minutes. Coach Daeng asks for three curry recipes.")]}]},{n:"mali",f:"happy",l:"casual",t:"This is the best day of my year. Better than any win."}],lv3t:"Mom Visits the Camp"},
 g_rin_sr:{main:[cN("Rin picks up another pen and strikes out the question mark after X."),{n:"rin",f:"happy",l:"casual",t:"I've tried every value. Salary, fame, opportunity. None of them balance the equation."},{n:"rin",f:"flustered",l:"casual",t:"There's one value left I haven't tried, and I don't dare write it down."}],lv2:[cN("The next day the same sheet is taped to the whiteboard in the tape room."),cN("The last line now reads 'X = this camp', written over another word that wasn't fully erased."),{n:"rin",f:"flustered",l:"casual",t:"…Don't try to read the erased word. The ink just bled, that's all."}],lv3:[cN("Rin sends a schedule by chat, titled 'Field Experiment No. 1'."),{n:"rin",f:"happy",l:"casual",t:"Hypothesis: if we go to the same café together five times, X stays constant. I need data."},cN("Visit one, Rin notes everything. Visit three, less. Visit five, she forgets to open her notebook."),{n:"rin",f:"flustered",l:"casual",t:"…The data for visit five is missing. I was too busy listening to you to write anything."},{choice:[{t:"\"Then we'll have to run it five more times.\"",then:[{n:"rin",f:"happy",l:"casual",t:"Agreed. Scientifically, results must be repeatable."}]},{t:"\"So what were the results?\"",then:[{n:"rin",f:"flustered",l:"casual",t:"Conclusion: X is constant. And I won't tell you its value."}]}]},{n:"rin",f:"happy",l:"casual",t:"I keep the notes from visits one to five in a locked drawer. Classified data."}],lv3t:"Testing the Hypothesis"},
 g_ploy_sr:{main:[cN("Ploy quickly tucks the photo away, but she doesn't walk off."),{n:"ploy",f:"happy",l:"casual",t:"Mom stopped coming to my fights in my second year. Said her heart couldn't take it. But after every fight she calls to ask how it went."},{n:"ploy",f:"flustered",l:"casual",t:"You're the first person I've told. Don't tell anyone. Especially not Fah."}],lv2:[cN("At Ploy's next fight you spot a woman at the very back of the hall, a wide-brimmed hat hiding her face."),cN("Ploy wins, and bows to the back of the hall before she bows to the judges."),{n:"ploy",f:"happy",l:"casual",t:"I know you sent Mom that ticket… Don't deny it. She told me everything."}],lv3:[cN("Ploy meets you at an old photo studio in town, the same one that took that picture twenty years ago."),{n:"ploy",f:"happy",l:"casual",t:"Mom wants a new photo to keep next to the old one. So I came… but I didn't want to be in it alone."},cP("Photographer","Sir, a little closer. Yes. Miss, a smile please. Like when you win."),{n:"ploy",f:"flustered",l:"casual",t:"Like when I win? I never smile when I win… Will this do?"},{choice:[{t:"Pull a silly face as the shutter clicks",then:[cN("Ploy bursts out laughing and the photographer catches it. It's the widest smile she's ever had in a photo.")]},{t:"Stand still and smile",then:[cN("The photo comes out neat and lovely. Ploy studies it, then asks for one more. In the second she leans her head on your shoulder.")]}]},{n:"ploy",f:"happy",l:"casual",t:"Now I carry two photos. The old one is the person who was scared for me. The new one is the person who stands beside me."}],lv3t:"The Second Photo"},
 g_fah_sr:{main:[cN("Fah watches until the rainbow fades completely before she turns back."),{n:"fah",f:"happy",l:"casual",t:"Mom used to dance in the rain, soaked and laughing. Dad said she was crazy. I thought she was the coolest."},{n:"fah",f:"pout",l:"casual",t:"Every time it rains I want to go stand in the yard, but I'm scared everyone will call me crazy too."}],lv2:[cN("One afternoon it pours. Fah stares out at the yard."),cN("You step out into the rain first and wave her over."),{n:"fah",f:"happy",l:"casual",t:"You're crazy!! …Wait for me!!"},{n:"fah",f:"flustered",l:"casual",t:"It's freezing… but I haven't had this much fun in ages."}],lv3:[cN("The first rain of the season. All of Sirichai Camp is out in the yard, because Fah dragged everyone out herself."),{n:"fah",f:"happy",l:"casual",t:"Fah's rule! First rain of the year, everybody dances. No hiding under the roof!"},{n:"coach",t:"You'll all catch colds… Fine, I'll dance one song."},{choice:[{t:"Do the robot for Fah",then:[{n:"fah",f:"happy",l:"casual",t:"Hahaha, you're the worst dancer in the world! Again! Again!"}]},{t:"Take Fah's hands and spin around the yard",then:[{n:"fah",f:"flustered",l:"casual",t:"…You're spinning too fast! …Don't let go."}]}]},cN("The rain stops at dusk and a rainbow arches over the river again. Fah doesn't point it out. Everyone's already looking."),{n:"fah",f:"happy",l:"casual",t:"Mom… I found someone who'll be crazy with me."}],lv3t:"Dancing in the Rain"},
 g_team_ssr:{main:[{n:"coach",t:"Old Chai bought this roll the day the camp nearly closed. Said he'd save it for the group that brought the camp back."},{n:"kati",f:"sad",l:"casual",t:"…Did Grandpa know this day would come?"},{n:"coach",t:"He didn't know. He just believed. Sometimes that's more than knowing."}],lv2:[cN("The film comes back from the lab and everyone crowds around the enlargement."),{n:"mali",f:"happy",l:"casual",t:"My eyes are closed!! Why didn't anyone tell me!!"},{n:"rin",f:"happy",l:"casual",t:"I counted. Everyone in this photo is smiling 100%, except Coach Daeng at 60%."},{n:"coach",t:"That IS my full smile. My face just looks like this."}],lv3:[cN("A year after the group photo, Coach Daeng hauls Old Chai's klong khaek drum into the yard."),{n:"coach",t:"In Chai's day, once a year the whole camp kicked the bags to the drum together. Lose the beat and you washed dishes for a week."},{n:"kati",f:"happy",l:"casual",t:"I remember! I lost it every year. Washed dishes till my hands wrinkled."},cN("Everyone takes a bag, and the drumsticks are pressed into the Manager's hands."),{n:"coach",t:"Today the Manager drums. If the beat slips, the Manager does the dishes."},{n:"kati",f:"happy",l:"casual",t:"Manager! Give us the first beat! (Play the card's minigame from the card page)"}],lv3t:"One Beat, One Camp",mg:"bag",mgt:"Drum the beat for the whole camp"},
 g_mali_ssr:{lv2:[cN("Two weeks later a big parcel arrives from Chaiya, addressed to 'The Manager', not to Mali."),cN("Inside: two trays of Chaiya salted eggs, a jar of dried-shrimp chilli paste, and a letter in big, round handwriting."),cN("'To the manager. I had the neighbor's kid write this for me. Tell Mali to go to bed early. And thank you for making my girl laugh every time she calls.'"),{n:"mali",f:"pout",l:"casual",t:"Mom sent more to the manager than to me! …I'm not jealous. Just a little."}],lv3:[cN("At the Chak Phra festival, Mali takes you home again. This time her mother has set up a som tam stall at the temple fair."),cP("Mali's mom","Customers everywhere! Mali, you take that mortar, Manager, you take this one. Quick now!"),{n:"mali",f:"happy",l:"casual",t:"Can you pound som tam? Doesn't matter if you can't — just pound along to the Chak Phra drums."},{n:"mali",f:"happy",l:"casual",t:"Ready? First mortar! (Play the card's minigame from the card page)"}],lv3t:"Mali's Mom's Som Tam Stall",mg:"somtam",mgt:"Help Mali's mom pound som tam at the temple fair"},
 g_rin_ssr:{lv2:[cN("Rin writes in the new notebook every night, but there isn't a single number in it."),{n:"rin",f:"happy",l:"casual",t:"It's a feelings journal. Today Kati burned the rice, Mali laughed until she choked, and Coach Daeng secretly fed the cat."},{n:"rin",f:"flustered",l:"casual",t:"I left this page blank for you to write on… Anything at all. I won't analyze it. Promise."},{n:"rin",f:"pout",l:"casual",t:"…Just a tiny analysis. Your handwriting slants right. That means you're an optimist."}],lv3:[cN("Rin finds you in the training room with two drumsticks and a sheet of paper that reads 'Experiment 1: No plans allowed.'"),{n:"rin",f:"happy",l:"train",t:"You drum at random, no warning. I'll kick on pure instinct."},{n:"coach",t:"Glasses girl training without a plan? The world must be ending."},{n:"rin",f:"flustered",l:"train",t:"Quiet, Coach Daeng! …I'm ready, even though I don't know what's coming. (Play the card's minigame from the card page)"}],lv3t:"The Experiment With No Plan",mg:"bag",mgt:"Drum at random so Rin kicks on instinct"},
 g_ploy_ssr:{lv2:[cN("Sunday morning, Ploy's mom shows up at camp with a three-tier tiffin carrier."),cP("Ploy's mom","When Ploy was little she was afraid of the dark. She slept with the light on until she was twelve. Don't tell anyone."),{n:"ploy",f:"flustered",l:"casual",t:"MOM!! …You did not hear that. Delete it from your head right now."},{n:"ploy",f:"happy",l:"casual",t:"…Come visit Mom's place sometime. She keeps a photo of every win. I want you to see the ones you're in."}],lv3:[cN("Ploy takes you to her mom's house. The walls are covered in photos from her very first fight, and in the corner hangs a small heavy bag, split open to the stuffing."),{n:"ploy",f:"happy",l:"casual",t:"My very first bag. When I was little, Mom would sit and clap the rhythm, and I'd throw knees to her claps."},cP("Ploy's mom","I can't clap like that anymore, my wrists are too old. Could the manager drum for her instead?"),{n:"ploy",f:"flustered",l:"train",t:"…I haven't hit this bag in twenty years. Give me the rhythm, okay? (Play the card's minigame from the card page)"}],lv3t:"Ploy's First Heavy Bag",mg:"bag",mgt:"Keep the knee rhythm the way Ploy's mom used to clap it"},
 g_kati_ssr:{lv2:[cN("After her next fight, Kati holds out her wrist: a thin white thread is tied there, a scrap from Grandpa's old mongkhon."),{"n":"kati","f":"happy","l":"casual","t":"I kept two pieces. One for me… and one for you. Give me your hand."},{"n":"kati","f":"flustered","l":"casual","t":"Don't take it off. Grandpa said a blessing thread only breaks once you don't need it anymore."}],lv3:[cN("At the yearly temple fair, the villagers ask Sirichai to open the ring with a wai khru, but the drummer hasn't shown up."),{"n":"kati","f":"happy","l":"thai","t":"Could you play the drum for me? Slow, like Grandpa used to when I was little."},{"n":"kati","f":"flustered","l":"thai","t":"I'll follow your drum. Ready! (Tap the minigame button on the card page.)"}],lv3t:"Grandpa's wai khru drum",mg:"bag",mgt:"Drum for Kati's wai khru at the temple fair"},
 g_fah_ssr:{lv2:[cN("Fah hands you a Polaroid of the morning sky after the storm, signed in big letters in the corner."),{n:"fah",f:"happy",l:"casual",t:"Fah took it that very morning. The prettiest sky is the one after a storm. Keep it, and don't you dare lose it."},{n:"fah",f:"flustered",l:"casual",t:"And… this rainy season, if it thunders at night, can Fah come knock on your door? Not 'cause I'm scared. Just asking."}],lv3:[cN("Another storm rolls in, but this time Fah drags a khaek drum into the middle of the office."),{n:"fah",f:"happy",l:"casual",t:"Fah figured it out! Whenever it thunders, you drum louder, and Fah kicks to the drum instead!"},{n:"fah",f:"happy",l:"train",t:"That way Fah only hears your drum, not the thunder. Genius, right?!"},{n:"fah",f:"flustered",l:"train",t:"Go! Here comes the thunder! (Play the card's minigame from the card page)"}],lv3t:"Drums Over Thunder",mg:"bag",mgt:"Drown out the thunder with drums for Fah's kicks"},
 lg_kati_sr:{lv2:[cN("Next morning you find Kati's little krathong caught on the bank below the pier, its candle out."),cN("Under its base is a tiny folded note, half soaked. Only one word is readable: 'Manager'."),{n:"kati",f:"flustered",l:"thai",t:"Don't read it!! …The angels already read it. You don't need to!"}],lv3:[cN("The next Loy Krathong, Kati brings two krathongs: one with Grandpa's name, one with the camp's."),{n:"kati",f:"happy",l:"thai",t:"This year I'm not asking for anything. I came to say thank you."},{n:"kati",f:"sad",l:"thai",t:"Thank you that the camp's still here. Thank you, Grandpa, for sending the Manager… I really believe you did."},{choice:[{t:"\"Then I'll make a wish for you this year.\"",then:[{n:"kati",f:"flustered",l:"thai",t:"What did you wish for… No, don't tell me! I'll die of embarrassment right here."}]},{t:"Help Kati light both candles",then:[cN("The wind blows the candles out three times until you and Kati cup the flame together.")]}]},cN("The two krathongs drift off together, Grandpa's leading and the camp's following."),{n:"kati",f:"happy",l:"thai",t:"Next year I'll make three. The third one gets your name."}],lv3t:"Kati's Two Krathongs"},
 lg_mali_sr:{lv2:[cN("A year later: the same ramwong stage, the same songs. Mali has been waiting at the edge of the circle since dusk."),{n:"mali",f:"happy",l:"thai",t:"See! Mom was right! We got to dance together again~"},{n:"mali",f:"flustered",l:"thai",t:"…And you're on the beat this year. You've been practising in secret, haven't you?"}],lv3:[cN("The ramwong organiser comes looking for Mali: the lead dancer has suddenly fallen ill."),cP("Ramwong organiser","You, the girl in yellow. Could you lead the circle? I've watched you dance beautifully two years running."),{n:"mali",f:"flustered",l:"thai",t:"Me!? I only copied my mom. I never had lessons…"},{choice:[{t:"\"You're the best dancer in the circle. Go on.\"",then:[cN("Mali steps up with trembling hands, but once the music starts the whole circle turns with her.")]},{t:"\"I'll dance right at the front for you.\"",then:[cN("You dance at the very front. Mali watches you every beat and forgets she's leading the whole circle.")]}]},cN("When the song ends the whole square applauds, and the organiser hands her a jasmine garland."),{n:"mali",f:"happy",l:"thai",t:"I'll take it to Mom… and half of it is yours, Manager~"}],lv3t:"Leading the Circle"},
 lg_rin_sr:{lv2:[cN("The next night Rin sends a spreadsheet named 'lantern_experiment_v2'."),{n:"rin",f:"happy",l:"thai",t:"I released three more lanterns alone. All three fell."},{n:"rin",f:"flustered",l:"thai",t:"Statistical conclusion: the variable that makes lanterns fly is you. Next year we count together again."}],lv3:[cN("The next Loy Krathong, Rin arrives with a hundred sky lanterns in cardboard boxes."),{n:"rin",f:"happy",l:"thai",t:"I've flown my first. The other ninety-nine make up for every year I couldn't. I calculated it backwards."},cN("Two hours later you and Rin have counted to forty-seven ninety-nine times. Every lantern rises straight."),{choice:[{t:"\"Shall we count down for the last one?\"",then:[{n:"rin",f:"happy",l:"thai",t:"Counting down from forty-seven… I've never tried it. A new variable. Interesting."}]},{t:"\"Let the last one go whenever you want.\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…Without counting? I've never let go of anything without counting."}]}]},cN("The hundredth lantern rises until you can't tell it from the stars."),{n:"rin",f:"happy",l:"thai",t:"That's a hundred… Next year we start again at one. Together."}],lv3t:"The Hundredth Lantern"},
 lg_ploy_sr:{lv2:[cN("A week later the teddy bear from Loy Krathong sits on Sirichai Camp's trophy shelf."),cN("One day it's gone, a note in its place: 'Borrowed to hug for one night. Back tomorrow. — Cat'"),{n:"ploy",f:"flustered",l:"thai",t:"…Don't look at me. No idea which cat."}],lv3:[cN("The next Loy Krathong, two cat masks are left at Sirichai Camp's gate with a note: '9 pm, in front of the temple'."),{n:"ploy",f:"happy",l:"thai",t:"Two cats this year. That way nobody recognises either of us."},cN("The two cats cover the whole fair. Ploy loses at darts to an eight-year-old and doesn't complain once."),{choice:[{t:"Ask Ploy to take off the mask for the fireworks",then:[{n:"ploy",f:"flustered",l:"thai",t:"…What if someone recognises me?"},cN("Nobody turns. Everyone is looking up at the fireworks. Only you are looking at Ploy.")]},{t:"Watch the fireworks in your cat masks",then:[{n:"ploy",f:"happy",l:"thai",t:"Cats watching fireworks. No photos, no autographs… I wish tonight would last longer."}]}]},{n:"ploy",f:"happy",l:"thai",t:"Same again next year. Two cats. Don't bring anyone else."}],lv3t:"Two Cats at the Fair"},
 lg_fah_sr:{lv2:[cN("After the festival Fah sends a photo: the two krathongs caught together at the lock at the end of the canal."),{n:"fah",f:"happy",l:"thai",t:"See! They stuck together all the way! I followed them. I walked two kilometres!"},{n:"fah",f:"flustered",l:"thai",t:"…Not because I was worried. I just wanted to know if the wonky one made it."}],lv3:[cN("The next Loy Krathong, Fah sits sewing krathongs on the camp porch all afternoon. This time there are three."),{n:"fah",f:"pout",l:"thai",t:"Don't ask! …Fine. The third one's yours, and you have to sew some of it. I only did half."},cN("The third krathong is even wonkier than last year's wonky one. Fah laughs until she cries."),{choice:[{t:"\"Wonky's good. Everyone'll know whose it is.\"",then:[{n:"fah",f:"happy",l:"thai",t:"You're right! There's only one this ugly on the whole river."}]},{t:"\"Can you help me sew it straight?\"",then:[{n:"fah",f:"flustered",l:"thai",t:"…We can sew it together, hands and all. Don't tell anyone I was nice."}]}]},cN("Three krathongs drift in a line, the neat one leading and two wonky ones close behind, never drifting apart."),{n:"fah",f:"happy",l:"thai",t:"Nobody has to float alone any more. Not me, not the wonky ones."}],lv3t:"The Third Krathong"},
 lg_team_ssr:{lv2:[cN("The Loy Krathong group photo comes back. The flash has given everyone red eyes."),{n:"fah",f:"happy",l:"thai",t:"Haha, everyone looks like a ghost! This is my favourite photo!"},{n:"ploy",f:"happy",l:"thai",t:"I'd like a copy… Not for anything. Just to keep."}],lv3:[cN("A year later the municipality asks Sirichai Camp to lead the giant krathong parade with long drums."),{n:"coach",t:"A long-drum parade moves on one beat. Lose it and the whole town sees."},{n:"rin",f:"happy",l:"thai",t:"I've analysed the song: 132 beats per minute. We can be off by thirty milliseconds at most."},{n:"fah",f:"happy",l:"thai",t:"I'm taking the biggest drum!"},{n:"ploy",f:"flustered",l:"thai",t:"…I'll just carry the sign at the front. No dancing."},cN("The Manager is handed the lead drum. The whole parade waits."),{n:"kati",f:"happy",l:"thai",t:"Manager! Give us the first beat! (Play the card's minigame from the card page)"}],lv3t:"Sirichai Camp's Long-Drum Parade",mg:"bag",mgt:"Lead the parade on the long drum"},
};
Object.entries(CARD_LV).forEach(([id,X])=>{const C=CARDS[id];if(!C)return;if(X.main&&!C.mainDone){C.steps=C.steps.concat(X.main);C.mainDone=1;}C.lv2=X.lv2;C.lv3=X.lv3;C.lv3t=X.lv3t;if(X.mg){C.mg=X.mg;C.mgt=X.mgt;}C.rev=1;});
// v1.86 batch 2: one-copy story cards can't level, so their own stories grow instead (✦NEW for readers who saw the short version)
const CARD_MAIN={
 e_beatploy:[{n:"nar",t:"Kati walks in, gloves still on, and stops in the doorway."},{n:"kati",f:"happy",l:"fight",t:"Ploy… I came to say thank you. If you weren't that good, I'd never have got this good."},{n:"ploy",f:"flustered",l:"fight",t:"…Thanking the person you just beat? Everyone at Sirichai is strange."},{n:"nar",t:"Ploy holds out her half-wrapped hand. Kati grips it tight."},{n:"ploy",f:"happy",l:"fight",t:"Next time, nobody thanks anybody. We just fight with everything we've got."}],
 e_fahjoin:[{n:"nar",t:"On her first night Fah can't sleep and sneaks out to the bench in front of the camp."},{n:"fah",f:"sad",l:"casual",t:"It's so quiet… At Golden Tiger there were fans whirring and coaches yelling all night. I got used to the noise."},{n:"coach",t:"(Coach Daeng sets down a hot Ovaltine beside her) Can't sleep? Drink this. It's this quiet every night. You'll get used to it."},{n:"fah",f:"flustered",l:"casual",t:"…Coach Daeng's nicer than I thought. Don't tell anyone I said that."},{n:"fah",f:"happy",l:"casual",t:"Tomorrow I'm getting up before everyone! The first piece of omelette is mine!"}],
 e_ployjoin:[{n:"nar",t:"Three weeks later Ploy leans her crutch against the wall and walks on her own for the first time."},{n:"kati",f:"happy",l:"casual",t:"Ploy's walking!! Mali! Rin! Come and look!"},{n:"ploy",f:"flustered",l:"casual",t:"Keep it down, Kati… I'm walking, not winning a world title."},{n:"ploy",f:"happy",l:"casual",t:"Still… this is the first place anyone's been happy for me about something that isn't winning."},{n:"ploy",f:"happy",l:"casual",t:"I'll make the tea from now on. Every morning, five o'clock. Don't oversleep."}],
 h_kati:[{n:"nar",t:"Ten minutes later Kati's door creaks open again."},{n:"kati",f:"flustered",l:"casual",t:"…I forgot to say. Sweet dreams."},{n:"nar",t:"The door bangs shut, followed by the sound of Kati flopping onto her bed."},{n:"coach",t:"(From the next room) It's late! Are you sleeping or playing drums in there!"},{n:"kati",f:"happy",l:"casual",t:"Sorry, Coach! …I'm just a bit too happy, that's all."}],
 h_mali:[{n:"nar",t:"Mali seals the envelope and drags you to the postbox outside the market."},{n:"mali",f:"flustered",l:"casual",t:"Let's post it together. One, two… Manager! I didn't say three yet!"},{n:"nar",t:"The letter drops into the box with a soft thump."},{n:"mali",f:"happy",l:"casual",t:"It's sent… The first one I've ever really sent."},{n:"mali",f:"happy",l:"casual",t:"No running away now, Manager. Mom's waiting for that visit~"}],
 h_rin:[{n:"nar",t:"Rin closes the notebook and slides the whole thing across to you."},{n:"rin",f:"happy",l:"casual",t:"Keep this notebook. The most important data should stay with the variable it's about."},{n:"rin",f:"flustered",l:"casual",t:"And in book fourteen, the first page gets a new equation. With two variables."},{n:"rin",f:"happy",l:"casual",t:"You don't have to guess who the second variable is. The answer's sitting right here."}],
 h_ploy:[{n:"nar",t:"Ploy picks up another flat stone and hands it to you."},{n:"ploy",f:"happy",l:"casual",t:"Your turn. If it skips more than seven times, Ploy will… hmm. I'll think of something."},{n:"nar",t:"Your stone skips three times and sinks."},{n:"ploy",f:"happy",l:"casual",t:"Haha, three. Never mind. Come and practise tomorrow. Same place, same time."},{n:"ploy",f:"flustered",l:"casual",t:"…That's not asking you on a date. It's stone-skipping practice. Understand?"}],
 h_fah:[{n:"nar",t:"The whole camp is peeking from behind the windows. Kati and Mali whisper louder than most people shout."},{n:"fah",f:"pout",l:"casual",t:"They're watching!! …Whatever! I'm not embarrassed!"},{n:"fah",f:"flustered",l:"casual",t:"…Maybe a little."},{n:"nar",t:"Fah raises your hand high, like a referee announcing the winner."},{n:"fah",f:"happy",l:"casual",t:"Announcement! Sirichai Camp's Manager belongs to this sky-after-rain! Anyone who disagrees can fight me!"}],
 m_baghard:[{n:"nar",t:"That night the blank chart really is taped to Rin's wall, with tiny writing underneath:"},{n:"nar",t:"'The day there was nothing to fix. This team is good enough.'"},{n:"rin",f:"happy",l:"casual",t:"You read it? …Writing that small and you still saw it. Your eyesight is too good, Manager."}],
 m_livehot:[{n:"nar",t:"Customer number thirty-one turns out to be Auntie Taew from the som tam stall."},{n:"npc",who:"Auntie Taew",t:"Never mind, dear, I'll wait for the next batch. But I want everyone's signature on it."},{n:"fah",f:"happy",l:"casual",t:"Mine's going to be the biggest! The whole back of the shirt!"},{n:"rin",f:"pout",l:"casual",t:"I'll sign small in the bottom right corner to leave room for everyone… in calculated proportion."}],
 e_champ:[{n:"nar",t:"Next morning the whole lane crowds the gate. Auntie Taew brings three mortars of som tam; the old silversmith brings silk to wrap the belt."},{n:"kati",f:"happy",l:"casual",t:"Why is everyone here!? …To see the belt?"},{n:"coach",t:"To see a camp that came back from the dead. Ten years ago nobody on this lane believed Sirichai would survive."},{n:"nar",t:"Kati lifts the belt overhead. The lane claps so loudly the neighbour's fighting cock starts crowing."},{n:"kati",f:"happy",l:"casual",t:"Come back next year! Sirichai will bring home a second one!"}],
};
Object.entries(CARD_MAIN).forEach(([id,L])=>{const C=CARDS[id];if(!C||C.mainDone2)return;C.steps=C.steps.concat(L);C.mainDone2=1;C.rev=Math.max(C.rev||0,1);});
// v1.86 batch 3: N/R cards — gacha/Loy cards gain Lv.2 epilogues and Lv.3 scenes, story cards grow their main story
const CARD_LV3={
 g_kati_n:{main:[{n:"kati",f:"happy",l:"casual",t:"This one's Mali's, that one's Rin's. I know every wrap by the frayed bit at the thumb."},{n:"nar",t:"A gust blows one wrap off the line and it lands right on your shoulder."},{n:"kati",f:"flustered",l:"casual",t:"Ah, that one's mine! …Could you peg it back up for me, Manager?"}],lv2:[{n:"nar",t:"That evening Kati takes down the dry wraps and rolls them neatly into a basket."},{n:"kati",f:"happy",l:"casual",t:"The one you pegged up, I'm wearing it in my next fight."},{n:"kati",f:"flustered",l:"casual",t:"…It doesn't mean anything special. It's just the driest one."}],lv3:[{n:"nar",t:"On the camp's anniversary Kati hands you a cloth bag. Inside is a new pair of red wraps."},{n:"kati",f:"happy",l:"casual",t:"I bought them with my first fight purse. I saved them all year."},{n:"kati",f:"happy",l:"casual",t:"A manager should know how to wrap. I'll teach you. Left hand first, three times round the wrist."},{choice:[{t:"Hold out your hand for Kati to wrap",then:[{n:"nar",t:"Kati wraps very slowly, three times slower than she does her own, but nobody's in a hurry."}]},{t:"\"I'll do it myself, you watch.\"",then:[{n:"kati",f:"happy",l:"casual",t:"Wrong! It's all loose… Come here, I'll redo it."}]}]},{n:"kati",f:"happy",l:"casual",t:"Now we've got matching wraps. Properly the same team."}],lv3t:"A New Pair of Wraps"},
 g_mali_n:{main:[{n:"nar",t:"Mali keeps the last sweet in her pocket instead of handing it out."},{n:"mali",f:"flustered",l:"train",t:"This one's yours, Manager… the sourest tamarind. I picked it myself~"}],lv2:[{n:"nar",t:"A week later a parcel from Mali's home arrives with three jars of tamarind sweets."},{n:"mali",f:"happy",l:"casual",t:"Mom sent them! She wrote 'Share some with the Manager'… How did she know?"},{n:"mali",f:"flustered",l:"casual",t:"…I never told Mom about that sweet. I really didn't."}],lv3:[{n:"nar",t:"On a day off Mali takes over the camp kitchen, simmering tamarind and sugar until the whole camp smells of it."},{n:"mali",f:"happy",l:"casual",t:"Mom's recipe. Simmer till it's sticky, then roll it into balls. Help me roll, Manager."},{n:"nar",t:"Mali's sweets are all perfectly round. Yours include hearts, stars, and shapes nobody can identify."},{choice:[{t:"\"This one's shaped like you.\"",then:[{n:"mali",f:"flustered",l:"casual",t:"How is that like me!? …But I'm keeping this one. Not eating it."}]},{t:"Sneak a taste while rolling",then:[{n:"mali",f:"flustered",l:"casual",t:"Manager! That's five already! …Are they good?"}]}]},{n:"mali",f:"happy",l:"casual",t:"Next year I'll send these to Mom and tell her the Manager helped make them."}],lv3t:"Mom's Sweet Recipe"},
 g_rin_n:{main:[{n:"nar",t:"That week Rin's stats pages have more green ink than ever."},{n:"rin",f:"happy",l:"casual",t:"Fighter performance is up 8% in green-heavy weeks. I recommend you keep smiling. For the camp's sake."}],lv2:[{n:"nar",t:"Rin's green pen runs dry mid-sentence."},{n:"rin",f:"flustered",l:"casual",t:"…It ran out faster than red and blue combined. I didn't predict that."},{n:"nar",t:"Next morning there's a new box of green pens on Rin's desk, no name attached."},{n:"rin",f:"happy",l:"casual",t:"…Thank you, whoever you are. Whoever smiles a lot."}],lv3:[{n:"nar",t:"Rin has been standing in the stationery shop for fifteen minutes, torn between two pens."},{n:"rin",f:"flustered",l:"casual",t:"I want a fourth colour. For logging the times… you smile at me, not the fighters."},{n:"rin",f:"happy",l:"casual",t:"The variables have to be separated, or the data gets mixed."},{choice:[{t:"Pick pink for her",then:[{n:"rin",f:"flustered",l:"casual",t:"Pink… not very formal. But I'll use it."}]},{t:"Pick purple for her",then:[{n:"rin",f:"happy",l:"casual",t:"Purple sits between red and blue, between a miss and a hit… Fitting."}]}]},{n:"nar",t:"The next week a fourth colour appears in Rin's stats. Not much of it, but every single day."}],lv3t:"The Fourth Colour"},
 g_ploy_n:{main:[{n:"nar",t:"You sit down quietly beside Ploy and don't reach for the cat."},{n:"nar",t:"Two minutes later the cat wanders back on its own and rubs its head against Ploy's knee."},{n:"ploy",f:"flustered",l:"casual",t:"…It came back because you sat with me quietly. Not because of me."}],lv2:[{n:"nar",t:"The cat starts waiting at the pier every evening, right when Ploy goes running."},{n:"ploy",f:"happy",l:"casual",t:"I've named it 'Referee'. It watches me run like it's scoring me."},{n:"ploy",f:"flustered",l:"casual",t:"…Don't laugh. It's a great name."}],lv3:[{n:"nar",t:"It rains all night. In the morning Ploy is at Sirichai's gate, a soaked cat poking out of her raincoat."},{n:"ploy",f:"sad",l:"casual",t:"Golden Tiger doesn't allow pets… Could your camp take it? Just for a while."},{n:"coach",t:"This camp takes in anyone with nowhere to go. Cats included. Hand it here."},{choice:[{t:"\"You can visit Referee every day.\"",then:[{n:"ploy",f:"happy",l:"casual",t:"…Every day? Then I'll run past here every evening."}]},{t:"Lift the cat out of Ploy's raincoat",then:[{n:"nar",t:"The cat doesn't struggle, but keeps mewing softly back at Ploy the whole way in."}]}]},{n:"ploy",f:"happy",l:"casual",t:"Take care, Referee… and keep an eye on this camp's Manager for me."}],lv3t:"Referee Moves House"},
 g_fah_n:{main:[{n:"nar",t:"For photo thirty-one, Fah pulls you into the frame."},{n:"fah",f:"happy",l:"casual",t:"This one! My face is the silliest, but I love it most!"},{n:"fah",f:"flustered",l:"casual",t:"…Don't post it. I'm making it my wallpaper. Nobody else gets to see."}],lv2:[{n:"nar",t:"Three days later Mali catches a glimpse of Fah's phone while she naps in the lounge."},{n:"mali",f:"happy",l:"casual",t:"Fah's wallpaper is a couple photo!! I saw it!!"},{n:"fah",f:"flustered",l:"casual",t:"Mali!!! …It's not a couple photo! Someone just… walked into the frame!"}],lv3:[{n:"nar",t:"At next year's temple fair Fah drags you into a sticker photo booth. The curtain drops: just the two of you and a square screen."},{n:"fah",f:"happy",l:"casual",t:"Four shots! I planned poses all last night. First one: angry cat!"},{n:"nar",t:"Shot one: angry cat. Shot two: punching the camera. Shot three: Fah laughing too hard to pose."},{choice:[{t:"Shot four: make a heart together",then:[{n:"fah",f:"flustered",l:"casual",t:"…I didn't practise that one! …Fine. Just one."}]},{t:"Shot four: lift Fah up like a trophy",then:[{n:"fah",f:"happy",l:"casual",t:"Whoa! I'm the trophy? …The best-looking trophy in the world!"}]}]},{n:"fah",f:"happy",l:"casual",t:"I'm sticking this on the back of my phone. If anyone asks, you're my sparring partner."}],lv3t:"The Sticker Booth"},
 lg_kati_n:{lv2:[{n:"nar",t:"Your helmet-shaped krathong floats further than all seven of Kati's pretty ones."},{n:"kati",f:"happy",l:"thai",t:"See! The helmet shape handles the wind better! I'm writing down the design."},{n:"kati",f:"flustered",l:"thai",t:"…Fold me another one next year. I'm done with pretty ones."}],lv3:[{n:"nar",t:"Next Loy Krathong, Kati sets up a stall at the gate. The sign reads: 'Helmet-shaped krathong, Manager's recipe'."},{n:"kati",f:"happy",l:"thai",t:"They're selling like crazy! The kids on our lane love them. Say they look tough, like boxers."},{n:"nar",t:"By closing there's one left, and Kati keeps it beside her all night."},{choice:[{t:"\"Not selling the last one?\"",then:[{n:"kati",f:"flustered",l:"thai",t:"Not this one. You folded it… I'm floating it with you."}]},{t:"Help Kati count the takings",then:[{n:"nar",t:"Kati puts half the money in the temple donation box and spends the rest on khanom khrok for the whole camp."}]}]},{n:"kati",f:"happy",l:"thai",t:"I didn't wish for anything this year. I already have everything."}],lv3t:"The Krathong Stall at the Gate"},
 lg_kati_r:{lv2:[{n:"nar",t:"The next day Kati mumbles all day, every sentence sounding like there's a sweet in her mouth."},{n:"coach",t:"Kati, I can't understand a word today. You ate hot khanom khrok, didn't you?"},{n:"kati",f:"flustered",l:"thai",t:"Nuh-uh, Coash! I didn' eat any khanom khrok!"}],lv3:[{n:"nar",t:"The next year the same boat stall is short-handed, and the owner waves Kati over."},{n:"npc",who:"Khanom khrok vendor",t:"It's the girl who burnt her tongue last year! Help me pour the batter and you eat free."},{n:"nar",t:"Kati pours, you scoop. The first tray comes out lopsided; by the third the vendor is praising you."},{choice:[{t:"Blow on one before feeding it to Kati",then:[{n:"kati",f:"flustered",l:"thai",t:"…No burnt tongue this year. My face is burning instead."}]},{t:"Challenge Kati to a scooping contest",then:[{n:"kati",f:"happy",l:"thai",t:"I win! …She says it's a tie. She's biased towards you!"}]}]},{n:"kati",f:"happy",l:"thai",t:"Let's help her again next full moon. Ones you make yourself taste so much better."}],lv3t:"Khanom Khrok, Manager-made"},
 lg_mali_n:{lv2:[{n:"nar",t:"The next year Mali bakes two bread krathongs, one big and one small."},{n:"mali",f:"happy",l:"thai",t:"The small one goes to the fish first, to lure them away. Then the big one survives till I finish wishing~"},{n:"mali",f:"flustered",l:"thai",t:"I've been planning this all year. No laughing."}],lv3:[{n:"nar",t:"Mali's plan lasts three seconds. The biggest catfish in the river swims straight past the small one and goes for the big one."},{n:"mali",f:"flustered",l:"thai",t:"This fish is smarter than me!! Manager, help!"},{choice:[{t:"Hand Mali the bread krathong you baked",then:[{n:"mali",f:"happy",l:"thai",t:"You baked one too!? …It's so lopsided the fish won't dare touch it~"}]},{t:"Help Mali wish faster",then:[{n:"nar",t:"You and Mali put your palms together and wish faster than ever, finishing just before it sinks."}]}]},{n:"mali",f:"happy",l:"thai",t:"Next year I'll bake the fish their own. One for them, one for us."}],lv3t:"The Boss Catfish"},
 lg_mali_r:{lv2:[{n:"nar",t:"A month later a cloth parcel appears on the Manager's desk: a handwoven cotton shirt in the same colour as Mali's outfit."},{n:"mali",f:"happy",l:"thai",t:"Try it on! …A perfect fit! My tape measure never lies~"},{n:"mali",f:"flustered",l:"thai",t:"…And neither does the number on that special page."}],lv3:[{n:"nar",t:"The next Loy Krathong, all of Sirichai Camp marches in the giant krathong parade wearing outfits Mali made."},{n:"npc",who:"Parade announcer",t:"Sirichai Boxing Camp, everyone! Best outfits in the parade this year. Who made them?"},{n:"mali",f:"flustered",l:"thai",t:"Me! …I sewed all month. Pricked my fingers seventeen times."},{choice:[{t:"Raise Mali's hand so the crowd can cheer",then:[{n:"mali",f:"happy",l:"thai",t:"Manager! …The whole street is clapping for me~"}]},{t:"\"Mine's the best in the parade.\"",then:[{n:"mali",f:"flustered",l:"thai",t:"Of course it is. I put the most care into that one."}]}]},{n:"mali",f:"happy",l:"thai",t:"Next year I'll sew for the whole lane, so our camp gets its own parade."}],lv3t:"Matching Outfits in the Parade"},
 lg_rin_n:{lv2:[{n:"nar",t:"Three days later the municipality calls Rin asking to use her data for an anti-foam-krathong campaign."},{n:"rin",f:"happy",l:"thai",t:"My data will be on a riverside billboard. Red numbers, a metre tall."},{n:"rin",f:"flustered",l:"thai",t:"…I asked them to put Sirichai Camp's name underneath. Not mine."}],lv3:[{n:"nar",t:"The next Loy Krathong, Rin is head of the municipality's counting volunteers, complete with a lanyard."},{n:"rin",f:"happy",l:"thai",t:"This year I have one assistant counter. The left side of the pier is yours."},{n:"nar",t:"At 1 a.m. the two sides differ by exactly three."},{choice:[{t:"\"I must have miscounted.\"",then:[{n:"rin",f:"happy",l:"thai",t:"Only 0.07% off. Excellent for a beginner."}]},{t:"\"Are those three ours?\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…Caught. I counted our own krathongs at the start. Personal data."}]}]},{n:"rin",f:"happy",l:"thai",t:"Be my assistant again next year. The position isn't open to anyone else."}],lv3t:"The Krathong Count Volunteers"},
 lg_rin_r:{lv2:[{n:"nar",t:"Rin goes through the photos and deletes the chin-only one."},{n:"rin",f:"flustered",l:"thai",t:"I'm keeping the one with my finger over half of it… It's the first photo I ever meant to take with someone."},{n:"rin",f:"happy",l:"thai",t:"I'm going to learn selfies. I've already read three articles."}],lv3:[{n:"nar",t:"A year later Rin raises the phone at exactly forty-five degrees, faces the light and counts to three in her head."},{n:"rin",f:"happy",l:"thai",t:"This angle distorts the face least, and side light softens the shadows. Smile on three."},{n:"nar",t:"The photo is flawless. Rin stares at the screen."},{choice:[{t:"\"Better than the finger one.\"",then:[{n:"rin",f:"flustered",l:"thai",t:"…I still like the finger one more. No statistical reason."}]},{t:"Snap another while Rin's off guard",then:[{n:"rin",f:"flustered",l:"thai",t:"That's not in the method! …Send me that one."}]}]},{n:"rin",f:"happy",l:"thai",t:"These two go in a folder called 'Important Data'."}],lv3t:"Selfie by the Numbers"},
 lg_ploy_n:{lv2:[{n:"nar",t:"You really do take a photo with the billboard and send it to Ploy."},{n:"ploy",f:"happy",l:"thai",t:"(Sends back a grinning tiger sticker) …Make it your profile picture, if you dare."},{n:"ploy",f:"flustered",l:"thai",t:"(Five minutes later) Wait, kidding! Don't actually do it!"}],lv3:[{n:"nar",t:"A year later the drinks company wants a new Thai-dress billboard. Ploy agrees on one condition: it's shot at Sirichai Camp."},{n:"npc",who:"Ad photographer",t:"Ploy, can you do last year's smile? That one sold really well."},{n:"ploy",f:"flustered",l:"thai",t:"That smile took forty takes… Could you stand behind the camera?"},{choice:[{t:"Stand behind the camera and pull faces",then:[{n:"nar",t:"Ploy beams from the first shot. The photographer calls it the fastest shoot of his career."}]},{t:"Just stand behind the camera and nod",then:[{n:"nar",t:"Ploy looks at you and smiles on her own. They have the shot by take three."}]}]},{n:"ploy",f:"happy",l:"thai",t:"The new billboard has Sirichai's logo in the corner. I asked for it. Call it location rent."}],lv3t:"A New Billboard at Sirichai"},
 lg_ploy_r:{lv2:[{n:"nar",t:"That night Ploy floats this year's krathong with a small folded paper tucked inside."},{n:"ploy",f:"sad",l:"thai",t:"The receipt for those fifty baht, from more than ten years ago. I've kept it in my wallet all this time."},{n:"ploy",f:"happy",l:"thai",t:"Time to let it go… That krathong finally gets to float."}],lv3:[{n:"nar",t:"A year later Ploy brings five young Golden Tiger trainees who couldn't go home to the festival."},{n:"ploy",f:"happy",l:"thai",t:"Fifty baht each. Buy the one you like, and you have to float it. No holding it till the candle dies."},{n:"nar",t:"The five scatter through the stalls, Ploy checking on each like the eldest sister."},{choice:[{t:"\"You're a good big sister.\"",then:[{n:"ploy",f:"flustered",l:"thai",t:"…I'm just doing what I wish someone had done for me at twelve."}]},{t:"Help Ploy light the kids' candles",then:[{n:"nar",t:"Five candles light together; the kids count one, two, three and let go at once."}]}]},{n:"ploy",f:"happy",l:"thai",t:"I'll bring them again next year… and to your camp too. They should learn boxing isn't only about winning."}],lv3t:"Fifty Baht"},
 lg_fah_n:{lv2:[{n:"nar",t:"On the quiet side of the market Fah lights the giant firecracker and dives behind you."},{n:"nar",t:"BANG! Every bird in the tree takes off."},{n:"fah",f:"happy",l:"thai",t:"Hahaha, see! Now the whole market knows I'm here!"},{n:"fah",f:"flustered",l:"thai",t:"…But I hid behind you. Don't tell anyone."}],lv3:[{n:"nar",t:"A year later the firecracker stall owner calls Fah over."},{n:"npc",who:"Firecracker auntie",t:"Silver-top, this year you get to light the opening firework. You were my best customer last year."},{n:"fah",f:"happy",l:"thai",t:"Really, Auntie!! I get to light the opening firework!!"},{choice:[{t:"Hold the lighter for Fah",then:[{n:"fah",f:"happy",l:"thai",t:"You hold the flame, I light it. Teamwork! …Don't run off yet!"}]},{t:"Stand back and cheer",then:[{n:"fah",f:"pout",l:"thai",t:"Why are you so far away! …Come closer. I'm not scared, I just want you to see."}]}]},{n:"nar",t:"The festival's first firework soars over the river. Fah doesn't flinch at all; she was holding your arm before she lit it."}],lv3t:"Lighting the Opening Firework"},
 lg_fah_r:{lv2:[{n:"nar",t:"Three more fireworks burst. Fah keeps hold of your arm through every one."},{n:"fah",f:"flustered",l:"thai",t:"…I'm not scared of this one. I'm just holding on."},{n:"fah",f:"happy",l:"thai",t:"Letting go now would be weirder. I'll just hold on till they're done!"}],lv3:[{n:"nar",t:"A year later Fah leads you up onto a shop roof, with the firecracker auntie's blessing. The best view at the festival."},{n:"fah",f:"happy",l:"thai",t:"You can see the whole river from here! And it's not as loud as down there. I scouted it."},{n:"nar",t:"The biggest firework bursts overhead again. Fah doesn't flinch, but she shuffles a little closer."},{choice:[{t:"\"Not scared this year?\"",then:[{n:"fah",f:"flustered",l:"thai",t:"Well, someone's sitting next to me… I don't need to hold your arm."}]},{t:"Offer Fah your hand first",then:[{n:"fah",f:"happy",l:"thai",t:"…You've got me figured out again. Fine, I'll hold it!"}]}]},{n:"fah",f:"happy",l:"thai",t:"Same place next year, same roof. Don't bring anyone. There are exactly two seats."}],lv3t:"Fireworks from the Rooftop"},
};
const CARD_MAIN3={
 k_n1:[{n:"nar",t:"That night Kati patches spot eighteen with red tape instead of black like the rest."},{n:"kati",f:"happy",l:"train",t:"This one's red. It's the first one I didn't patch alone."},{n:"kati",f:"flustered",l:"train",t:"…You held the tape for me. That counts."}],
 k_r1:[{n:"nar",t:"The owner brings two extra bowls of soup and smiles at Kati."},{n:"npc",who:"Chicken rice owner",t:"Chai's granddaughter brought her boyfriend? Your grandpa said whoever you brought eats free."},{n:"kati",f:"flustered",l:"casual",t:"He's not my boyfriend, Uncle!! …But thank you for the treat."}],
 m_n1:[{n:"nar",t:"That evening a new garland hangs at Grandpa Chai's shrine, just a little prettier than the Manager's."},{n:"mali",f:"flustered",l:"casual",t:"Grandpa Chai's has to be prettier… Elders come first."},{n:"mali",f:"happy",l:"casual",t:"But I took longer on yours. I kept smiling while I strung it."}],
 m_r1:[{n:"nar",t:"The youngest pushes so close to the screen that all you see is a nose."},{n:"npc",who:"Mali's little brother",t:"Mister Manager! Look after Mali! She eats a LOT!"},{n:"mali",f:"flustered",l:"casual",t:"Don't say that!! …I'm hanging up! Bye-bye!"}],
 r_n1:[{n:"nar",t:"Rin turns to the next page for you, even though she said one page only."},{n:"rin",f:"happy",l:"casual",t:"This is the whole camp's stats. I'll keep going until the notebook's full."},{n:"rin",f:"flustered",l:"casual",t:"…And the next one, if you still want to read it."}],
 r_r1:[{n:"nar",t:"The third cup is long finished, but Rin hasn't moved."},{n:"rin",f:"happy",l:"casual",t:"I miscalculated. It wasn't the third cup that kept me here. It was the person across from me."},{n:"rin",f:"flustered",l:"casual",t:"…Same place tomorrow? I'll only order two, in case you order my third."}],
 p_n1:[{n:"nar",t:"Before leaving the room, Ploy turns back to look at you."},{n:"ploy",f:"flustered",l:"fight",t:"Your fighter… that left kick in round three. If it weren't for my knee, it would've folded me."},{n:"ploy",f:"happy",l:"fight",t:"Tell her I'll remember it. I remember everyone who almost got me."}],
 p_r1:[{n:"nar",t:"When your cup is empty, Ploy refills it without asking."},{n:"ploy",f:"happy",l:"casual",t:"I usually make just one cup… Lately I keep making too much. I need someone to help drink it."},{n:"ploy",f:"flustered",l:"casual",t:"I'll make too much again tomorrow. Just in case you're passing by."}],
 f_n1:[{n:"nar",t:"In the morning there's a single message from Fah, sent at 4 a.m."},{n:"fah",f:"flustered",l:"casual",t:"(Message) I dreamt about you… Not a nice dream! You stole my omelette!"},{n:"fah",f:"happy",l:"casual",t:"(Next message) Reply! Or I'm sending ten more stickers!"}],
 f_r1:[{n:"nar",t:"Fah takes out her vampire teeth and hands you a second pair."},{n:"fah",f:"happy",l:"casual",t:"Put them in! Two vampires are scarier than one! …No, cuter."},{n:"fah",f:"flustered",l:"casual",t:"Let's celebrate together next year too. I'll buy matching ghost costumes."}],
 f_pet:[{n:"nar",t:"That night the fluffy newcomer moves from the hand wraps to curl up on the Manager's shoes instead."},{n:"kati",f:"pout",l:"casual",t:"Not fair! It picked the Manager! I'm the one who bought its bowl!"},{n:"coach",t:"Animals know who runs the camp. Accept it."}],
 f_ny:[{n:"nar",t:"The last firework faded long ago, but nobody climbs down from the roof."},{n:"kati",f:"happy",l:"casual",t:"Next year I'll bring a mat up here, and khanom khrok. VIP seats need snacks."},{n:"kati",f:"flustered",l:"casual",t:"…Your seat's next to mine, Manager. No sitting anywhere else."}],
 f_kt:[{n:"nar",t:"The eighth petal drifts over, catches on your krathong, and the two float off together until they're out of sight."},{n:"kati",f:"flustered",l:"casual",t:"…They just stuck together. I didn't aim it."},{n:"kati",f:"happy",l:"casual",t:"I think Grandpa's saying the one who hadn't arrived yet… has arrived."}],
 f_sk:[{n:"nar",t:"Coach Daeng grins wider than he has all year, sweeping the hose round the yard until everyone's soaked."},{n:"coach",t:"In Chai's day this camp splashed all Songkran until the well ran dry. First time it's been this lively since."},{n:"kati",f:"happy",l:"casual",t:"Next year I'm buying my own hose! Two metres longer than yours!"}],
 b_kati:[{n:"nar",t:"Kati blows out the candle and hands you the khanom khrok it was standing in."},{n:"kati",f:"happy",l:"casual",t:"Grandpa said the one with the candle is the lucky one. It goes to the most important person."},{n:"kati",f:"flustered",l:"casual",t:"…Last year I ate it myself because there was no one. This year there is."}],
 b_mali:[{n:"nar",t:"Three days later Mali gets a photo from home: her siblings holding a completely squashed cake, all grinning."},{n:"mali",f:"happy",l:"casual",t:"The cake got totally squashed, haha. But they say it's the best in the world."},{n:"mali",f:"flustered",l:"casual",t:"Next year I'm taking you home to blow out the candles. Then the cake won't get squashed~"}],
 b_rin:[{n:"nar",t:"Rin unwraps the gift so carefully the paper doesn't tear at all."},{n:"rin",f:"happy",l:"casual",t:"I'm keeping the wrapping paper… Not because I'm touched. It folds very neatly, geometrically."},{n:"rin",f:"flustered",l:"casual",t:"…That's a lie. I'm touched."}],
 b_ploy:[{n:"nar",t:"At midnight the whole city counts down to the new year. Ploy quietly counts down to her birthday instead."},{n:"ploy",f:"happy",l:"casual",t:"Three, two, one… Happy birthday, Ploy. First time anyone's heard me say it."},{n:"ploy",f:"flustered",l:"casual",t:"Next year you count for me. I'd like to hear it for once."}],
 b_fah:[{n:"nar",t:"At the end of the market Fah gives you the last sweet in her basket."},{n:"fah",f:"happy",l:"casual",t:"Saved the last one for you! The silver-haired witch doesn't give these to just anyone!"},{n:"fah",f:"flustered",l:"casual",t:"…Next birthday, you dress up as my vampire partner. No saying no."}],
 m_bag:[{n:"nar",t:"When the song ends Coach Daeng walks to the old speaker and presses play again."},{n:"coach",t:"Again. This time I'm kicking too… Thirty years. I'm keeping up at least once."},{n:"kati",f:"happy",l:"fight",t:"Coach is keeping up!! Look, Manager, every single beat!"}],
 m_tam:[{n:"nar",t:"Auntie Taew comes over and pats Mali's shoulder."},{n:"npc",who:"Auntie Taew",t:"With hands like that, whenever you quit boxing, open a stall next to mine. Rent-free."},{n:"mali",f:"happy",l:"casual",t:"I'm not quitting, Auntie! But when we're old, the Manager and I will open a som tam stall together~"}],
 m_live:[{n:"nar",t:"The second live stream gets twelve viewers. One is Auntie Taew, another the old silversmith."},{n:"kati",f:"happy",l:"casual",t:"Four times the viewers! Rin says that's 300% growth."},{n:"kati",f:"flustered",l:"casual",t:"…And Coach ordered another shirt. Coach, you already have three camp shirts."}],
};
Object.entries(CARD_LV3).forEach(([id,X])=>{const C=CARDS[id];if(!C)return;if(X.main&&!C.mainDone){C.steps=C.steps.concat(X.main);C.mainDone=1;}C.lv2=X.lv2;C.lv3=X.lv3;C.lv3t=X.lv3t;C.rev=Math.max(C.rev||0,1);});
Object.entries(CARD_MAIN3).forEach(([id,L])=>{const C=CARDS[id];if(!C||C.mainDone3)return;C.steps=C.steps.concat(L);C.mainDone3=1;C.rev=Math.max(C.rev||0,1);}); // end batch 3

// ===== v1.88 camp lottery — three draws a year; Coach Daeng asks the manager to pick one of six tickets, results come by mail two weeks later =====
const LOTTO_WK=[10,24,38],LOTTO_COST=80,LOTTO_PRIZE={first:60000,last3:4000,last2:2000};
const lottoSt=G=>{G.lotto=G.lotto||{draws:[]};return G.lotto;};
const lottoDraw=(G,i)=>lottoSt(G).draws.find(d=>d.season===(G.season||1)&&d.i===i);
function lottoTickets(G,i){const r=mulberry32((G.seed||1)*977+(G.season||1)*131+i*17+5);return Array.from({length:6},()=>String(Math.floor(r()*1e6)).padStart(6,"0"));}
function lottoBuy(G,i,k){if(lottoDraw(G,i))return null;const nums=lottoTickets(G,i),pick=k==null?null:nums[k];if(pick)G.cash-=LOTTO_COST;
  const d={season:G.season||1,i,wk:G.week,abs:gameWeek(G),pick,tk:k,res:null,done:false};const L=lottoSt(G);L.draws.push(d);L.draws=L.draws.slice(-12);L.ask=null;return d;}
function lottoResult(G,d){const r=mulberry32((G.seed||1)*7919+d.season*313+d.i*29+1);const x=r(),out=x<.02?"first":x<.10?"last3":x<.30?"last2":"none";
  const rn=n=>String(Math.floor(r()*Math.pow(10,n))).padStart(n,"0"),p=d.pick||"000000";let first=rn(6),l3=rn(3),l2=rn(2);
  if(out==="first")first=p;else while(first===p)first=rn(6);
  if(out==="last3")l3=p.slice(-3);else while(l3===p.slice(-3))l3=rn(3);
  if(out==="last2")l2=p.slice(-2);else while(l2===p.slice(-2))l2=rn(2);
  d.res={first,l3,l2,out,prize:LOTTO_PRIZE[out]||0};return d.res;}
function lottoWeekly(G){const L=lottoSt(G);
  if(L.ask!=null&&!LOTTO_WK.some((w,k)=>k===L.ask&&G.week>=w&&G.week<=w+2))L.ask=null;
  for(const d of L.draws)if(d.pick&&!d.res&&gameWeek(G)>=d.abs+2){lottoResult(G,d);
    addMail(G,{kind:"lotto",draw:d.season+"_"+d.i,from:"Auntie Jan, lottery stall by the market",title:"This draw's results are in!",body:"I've checked them for you. Hold your ticket up against these and see!"});}}
const LOTTO_COL=[["#f6c9d4","#b8536f"],["#cde9c9","#3f8a4f"],["#cfe0f6","#3c6fb0"],["#f6e3b4","#b07a1c"],["#e3d1f2","#7a4fb0"],["#f3d2b8","#b0603c"]];
const LOTTO_DIG={0:"111101101101111",1:"010110010010111",2:"111001111100111",3:"111001111001111",4:"101101111001001",5:"111100111001111",6:"111100111101111",7:"111001001010010",8:"111101111101111",9:"111101111001111"};
const _ltk={};
function lottoTicketURL(num,ci,hl){const key=num+"|"+ci+"|"+(hl||0);if(_ltk[key])return _ltk[key];const S=3,W=96,H=46,c=document.createElement("canvas");c.width=W*S;c.height=H*S;const x=c.getContext("2d");
  const P=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect(a*S,b*S,w*S,h*S);};const [bg,ink]=LOTTO_COL[ci%6];
  P(0,0,W,H,ink);P(1,1,W-2,H-2,bg);for(let y=3;y<H-2;y+=4)P(1,y,2,2,"#ffffff");P(4,4,W-8,9,ink);P(5,5,W-10,7,bg);
  x.fillStyle=ink;x.font=`700 ${6*S}px "IBM Plex Sans Thai","Chakra Petch",sans-serif`;x.textBaseline="middle";x.fillText("Fair ticket",8*S,8.7*S);x.textAlign="right";x.fillText("฿80",(W-7)*S,8.7*S);
  /* a little pixel elephant in the corner */const el=["0110000","1111110","1111111","1111101","1101100","1001000"];el.forEach((row,yy)=>[...row].forEach((v,xx)=>{if(v==="1")P(80+xx,30+yy,1,1,ink);}));
  const dg=String(num).split(""),dw=3*2,gap=3,tot=dg.length*dw+(dg.length-1)*gap,x0=Math.round((W-tot)/2)-4;
  dg.forEach((d,k)=>{const on=hl&&k>=6-hl;const m=LOTTO_DIG[d];const ox=x0+k*(dw+gap);if(on)P(ox-1,17,dw+2,13,"#f2c94c");for(let r=0;r<5;r++)for(let cc=0;cc<3;cc++)if(m[r*3+cc]==="1")P(ox+cc*2,18+r*2,2,2,on?"#2a1d2e":ink);});
  P(4,H-6,40,1,ink);P(4,H-4,26,1,ink);_ltk[key]=c.toDataURL();return _ltk[key];}
function lottoPickHTML(i){const N=lottoTickets(G,i);return `<h2>Pick a number for Coach · Draw ${i+1}</h2><p class="meta">Pick 1 ticket, ฿80 each. Results arrive by mail in 2 weeks.</p>
  <div class="ltgrid">${N.map((n,k)=>`<button class="ltk" data-act="lottobuy" data-v="${k}" aria-label="Ticket ${n}" ${G.cash<LOTTO_COST?"disabled":""}><img src="${lottoTicketURL(n,k)}" alt=""></button>`).join("")}</div>
  <div class="mfoot"><button class="btn ghost" data-act="lottoskip">Skip this draw</button></div>`;}
function lottoLetterAct(m){const [s,i]=String(m.draw).split("_").map(Number),d=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);if(!d||!d.res)return "";const R=d.res,hl=R.out==="first"?6:R.out==="last3"?3:R.out==="last2"?2:0;
  return `<div class="ltres"><div><small>First prize</small><b class="num">${R.first}</b></div><div><small>Last 3 digits</small><b class="num">${R.l3}</b></div><div><small>Last 2 digits</small><b class="num">${R.l2}</b></div></div>
  <div class="ltmine"><small>Your ticket</small><img src="${lottoTicketURL(d.pick,d.tk||0,hl)}" alt="${d.pick}"></div>
  ${d.done?`<p class="meta center">${R.prize?"Cashed in "+fmt(R.prize):"Torn up"}</p>`:R.prize?`<p class="lamt take">+${fmt(R.prize)}</p><button class="btn primary" data-act="lottoclaim" data-v="${m.id}">Cash it in ${fmt(R.prize)}</button>`:`<p class="meta center">Not a single prize…</p><button class="btn" data-act="lottoclaim" data-v="${m.id}">Tear it up</button>`}`;}
const LOTTO_COACH={first:["All six digits!? Manager… we can buy a new ring next year! …Can I get one new pair of sandals?"],
  last3:["Three straight! Four thousand, enough for a new pair of gloves. The rest goes on next draw's tickets… kidding."],
  last2:["Last two digits! Twenty-five times our money. Told you it came from my dream… I dreamed about stewed pork leg."],
  none:["Not one digit… I think the numbers are shy around you. Next time I pick.","Eighty baht. Call it a donation to the state. The camp's paid its taxes this year.","So close! Only six digits off…","At least the ticket's good for wrapping fried bananas."]};
function lottoPending(G){if(!G||G.ended)return null;const L=G.lotto;if(L&&L.ask!=null&&!lottoDraw(G,L.ask))return {type:"lotto",i:L.ask};const m=(G.mail||[]).find(x=>x.kind==="lotto"&&!x.read);return m?{type:"letter",id:m.id}:null;}
XMODAL.lotto=m=>({body:lottoPickHTML(m.i),foot:false});
Object.assign(ACT,{
  lottobuy:d=>{const L=lottoSt(G),i=L.ask;if(i==null||G.cash<LOTTO_COST)return;const dd=lottoBuy(G,i,+d.v);AU.sfx("level");UI.modal=null;save();render();toast(`Bought ticket ${dd.pick} · results in 2 weeks`);},
  lottoskip:()=>{const L=lottoSt(G),i=L.ask;if(i!=null)lottoBuy(G,i,null);UI.modal=null;save();render();},
  lottoclaim:d=>{const m=(G.mail||[]).find(x=>x.id===d.v);if(!m)return;const [s,i]=String(m.draw).split("_").map(Number),dd=lottoSt(G).draws.find(x=>x.season===s&&x.i===i);if(!dd||!dd.res||dd.done)return;
    dd.done=true;m.done=true;if(dd.res.prize){G.cash+=dd.res.prize;AU.sfx("level");}else AU.sfx("miss");save();const Ls=LOTTO_COACH[dd.res.out],line=Ls[(dd.i+dd.season)%Ls.length];
    UI.modal=null;render();playScene([{n:"coach",t:line}],()=>{render();},{bg:"camp",look:"casual"});}
});

/* v1.91.176 (Man): the runaway cow and rooster come back several times a year — each return opens differently (the first visit keeps its own scene) */
const RUNAWAY_INTRO={
 cow:[[["nar","In the middle of the road by the market, a huge dairy cow holds a guard, front hooves doing footwork no cow should be able to do"],["Uncle Chaloem","That's her! Watch out for the kicks, dear, she watches fight replays every night!"],["surprised","…A cow really can hold a guard!?"]],
  [["nar","The same dairy cow stands outside the coffee shop, chewing cud and slipping its head left and right like it's drilling defence."],["Uncle Chaloem","Last night it watched the main event on Channel 3 to the end. It's dodging even better today!"],["angry","If it dodges well, I'll just have to keep up!"]],
  [["nar","A crowd circles the market entrance. In the middle: the same dairy cow, a pha khao ma tied round its horns like a mongkhon."],["Uncle Chaloem","No idea who tied that cloth on. Now it thinks it's stepping into the ring!"],["surprised","…It even has a mongkhon. Should I do the wai khru first?"]],
  [["nar","The same dairy cow waits at the zebra crossing. When it spots the Sirichai van it stamps twice."],["Uncle Chaloem","It knows your camp's van now. It's waiting for its regular rival!"],["surprised","Its regular rival… me!?"]]],
 rooster:[[["nar","A small bantam stands on the heavy bag, chest puffed, neck feathers bristling"],["Sia Tong","Don't underestimate him. He once chased every big dog on the street"],["happy","Come on, chicken! I'm not a dog!"]],
  [["nar","The same bantam perches on the training-ring ropes, crowing across the camp since 5 a.m."],["Sia Tong","It loves your ring. It flies over every time the gate's open."],["happy","You're not taking the ring today!"]],
  [["nar","The bantam stands on the gym roof, wings half-spread like a guard."],["Sia Tong","It watches your camp's clips on my phone every night. That stance is a straight copy."],["surprised","…That's my guard stance!"]],
  [["nar","The same bantam circles the heavy bag, pecking once at a time like it's warming up."],["Sia Tong","I think it just wants to join your camp… but those pecks hurt."],["angry","If you want into the camp, you'll have to get past me!"]]]};
function runawayIntro(G,m,fid){const L=RUNAWAY_INTRO[m.q];G.runN=G.runN||{};let i=0;if(m.repeat){if(m.introI==null){G.runN[m.q]=(G.runN[m.q]||0)+1;m.introI=1+((G.runN[m.q]-1)%(L.length-1));}i=m.introI;}
  const [a,b,c]=L[i];return [{n:"nar",t:a[1]},{n:"npc",who:b[0],t:b[1]},{n:fid,f:c[0],l:"fight",t:c[1]}];}

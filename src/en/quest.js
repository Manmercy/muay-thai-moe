// ================= MUAY THAI MOE v1.23 — MAILBOX, SIDE QUESTS, ODD FIGHTS, CALENDAR, GRAPHS, NEWS BAR =================
// ---------- odd opponents (sprite sheets in a/<sprite>_sheet.webp, same 6-row layout as the girls) ----------
const QK={
  gang1:{name:"Red-Helmet Grunt",sprite:"gang1",lvl:-1.6,tilt:{punch:1.5,power:1,iq:-2,guard:-1.5,comp:-1},color:"#c8283c",grp:"gang"},
  gang2:{name:"Black Jacket, Red Helmet",sprite:"gang2",lvl:-.8,tilt:{punch:1.5,kick:1,iq:-1.5,comp:-1},color:"#a01f2f",grp:"gang"},
  gang3:{name:"Black-Red Helmet Lieutenant",sprite:"gang3",lvl:.1,tilt:{punch:1.5,knee:1,power:1,iq:-1},color:"#5a1420",grp:"gang"},
  gang4:{name:"Silver Helmet Chief",sprite:"gang4",lvl:.8,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#d9a520",grp:"gang"},
  gang5:{name:"Big Boss Golden Helmet",sprite:"gang5",lvl:1.6,tilt:{power:2,punch:2,dur:1.5,comp:1,foot:-1},color:"#f7d24a",grp:"gang"},
  rooster1:{name:"Hot-Headed Bantam",sprite:"rooster1",lvl:-.9,tilt:{speed:2.5,kick:2,dur:-2,power:-1},color:"#e8a23a",grp:"rooster"},
  rooster2:{name:"Singburi Gray Rooster",sprite:"rooster2",lvl:-.2,tilt:{speed:2,kick:2,foot:1,dur:-1.5},color:"#8a8f9a",grp:"rooster"},
  rooster3:{name:"Temple-Boxing White Rooster",sprite:"rooster3",lvl:.4,tilt:{speed:2,kick:2.5,counter:1,dur:-1.5},color:"#f4f1ea",grp:"rooster"},
  rooster4:{name:"Black Red-Tail",sprite:"rooster4",lvl:.9,tilt:{speed:2,kick:2,power:1,guard:1,dur:-1},color:"#c8283c",grp:"rooster"},
  rooster5:{name:"Golden Rooster Godfather",sprite:"rooster5",lvl:1.5,tilt:{speed:2,kick:2.5,power:1.5,comp:1,dur:-.5},color:"#f7d24a",grp:"rooster"},
  bull1:{name:"Fresh Milk, the Runaway Cow",sprite:"bull1",lvl:-.6,tilt:{power:2,dur:2.5,clinch:1,speed:-2,iq:-1},color:"#f4f1ea",grp:"bull"},
  bull2:{name:"Red Curved-Horn",sprite:"bull2",lvl:.7,tilt:{power:2.5,dur:2,knee:1.5,speed:-1.5},color:"#a0522d",grp:"bull"},
  bull3:{name:"Mafia Buffalo",sprite:"bull3",lvl:1.4,tilt:{power:3,dur:2.5,clinch:2,speed:-1.5,foot:-1},color:"#2b2530",grp:"bull"},
};
const BELT_WEEKS=[10,18,26,34,42];
const STADIUMS={
 tha:{name:"Tha Phae Stadium",scene:"district",bg:"bg_district.webp",weeks:[10,18,26,34,42],minYear:1,win:15000,defend:10000},
 ping:{name:"Ping Riverside Stadium",scene:"river",bg:"bg_river.webp",weeks:[15,30,45],minYear:2,win:18000,defend:12000},
 lanna:{name:"Lanna Stadium",scene:"hall",bg:"bg_hall.webp",weeks:[22,38,48],minYear:3,win:22000,defend:14000}
};
function beltStore(G,venue="tha"){if(venue==="tha")return G.belt=G.belt||{};G.venueBelts=G.venueBelts||{};return G.venueBelts[venue]=G.venueBelts[venue]||{};}

function beltHolder(G,div,venue="tha"){const B=beltStore(G,venue);if(!B[div]||!G.F[B[div].id]){const c=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&!f.canon&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));const chosen=c[Math.min(venue==="tha"?0:venue==="ping"?1:2,c.length-1)];if(!chosen)return null;B[div]={id:chosen.id,def:2,since:G.week};}return G.F[B[div].id];}
function beltChallenger(G,div,not){return Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.id!==not&&!f.injury).sort((a,b)=>ovr(b.a)-ovr(a.a))[0]||null;}
const QGRP_BG={gang:"bg_market.webp",rooster:"bg_rooster.webp",bull:"bg_farm.webp"};
function qTarget(G,fid){const f=fid&&G.F[fid];if(f)return ovr(f.a);const R=roster(G);return R.length?R.reduce((s,x)=>s+ovr(x.a),0)/R.length:9;}
function makeQ(G,kind,fid,tag){const K=QK[kind],t=qTarget(G,fid)+K.lvl+Math.min(1.5,((G.season||1)-1)*.25),rng=mulberry32((G.seed^(G.week*977))+kind.length*31);const a={};
  for(const [k] of ATTRS)a[k]=clamp(t+(K.tilt[k]||0)+(rng()*1.6-.8),3,19.5);
  const d=t-ovr(a);for(const [k] of ATTRS)a[k]=clamp(a[k]+d,3,19.5);
  const id=`q_${kind}_${tag||G.week}`;const f=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  f.sprite=K.sprite;f.kind=kind;f.grp=K.grp;f.lvl=clamp(Math.round(t-6),1,10);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;}
function qCleanup(G){const keep=new Set([...G.bookings.map(b=>b.b),...G.offers.map(o=>o.b),...(G.mail||[]).filter(m=>!m.done&&m.qid).map(m=>m.qid)]);
  for(const id of Object.keys(G.F))if(id.startsWith("q_")&&!keep.has(id)&&(G.F[id].lastFightAbs==null||gameWeek(G)-G.F[id].lastFightAbs>2))delete G.F[id];}

// ---------- mail ----------
let MAILN=0;
function addMail(G,m){G.mail=G.mail||[];m.id="m"+G.week+"_"+(++MAILN)+"_"+Math.floor(Math.random()*1e4);m.wk=G.week;m.season=G.season||1;if(m.exp!=null)m.expAbs=gameWeek(G)+(m.exp-G.week);m.read=false;G.mail.unshift(m);G.mail=G.mail.slice(0,40);return m;}
const mailOpen=m=>!m.done&&!m.expired&&["take","pay","quiz","quest"].includes(m.kind);
function mailBadge(){if(!G||!G.mail)return 0;return G.mail.filter(m=>!m.read||mailOpen(m)).length;}
const MAILBOX_PX=pxIcon(["....kkkk....","...kffffk...","..krrrrrrk..",".krrrrrrrrk.",".krwwwwwwrk.",".krwkkkkwrk.",".krwwwwwwrk.",".krrrrrrrrk.",".kkkkkkkkkk.",".....kk.....",".....kk.....","....kkkk...."],{k:"#2a1a10",r:"#c8283c",w:"#f4ead8",f:"#f7d24a"});
const BILLS=[["Subdistrict Municipality","Fine: your camp's rooster crows above the legal limit at 4 a.m. (14 complaints)",300],
 ["Uncle Wang, motorbike taxi","Windshield repair: a kick knocked something off the bag and over the fence",800],
 ["Jae Tim's Chicken Rice","Invoice: your fighters ate 46 plates on credit (countersigned by Coach Daeng)",1840],
 ["Tube Ice Cooperative","This month's ice: your ice baths use more than every fish factory in the district",900],
 ["Auntie Taew, som tam","Broken mortar: someone from your camp 'demonstrated a spinning elbow' on Auntie's mortar",450],
 ["Signage Office","Sign tax: your camp sign is bigger than the temple's, extra fee",600,G=>G.fac.brand>=1],
 ["Provincial Electricity Authority","Special electricity charge: your camp floodlights are so bright birds are flying the wrong way",1200,G=>(G.fac.lights||0)>=1],
 ["Temple Route Songthaew Association","Songthaew parking fee at the temple (your students were cheering inside the vehicle)",350,G=>(G.fac.van||0)>=1],
 ["Subdistrict Animal Clinic","Treatment for the camp's orange cat: ate too much khanom khrok",500]];
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
function mailWeekly(G){G.mail=G.mail||[];if(typeof regionWeek==="function")regionWeek(G);G.gang=G.gang||{st:0,next:0};G.mailSeen=G.mailSeen||{};const rng=mulberry32(G.seed+G.week*4441);
  if(typeof lottoWeekly==="function")lottoWeekly(G);
  for(const m of G.mail)if(m.expAbs!=null&&gameWeek(G)>m.expAbs&&!m.done)m.expired=true;
  // v1.88: every time cash dips low, the helmet gang slips a gold card into the mailbox
  if(typeof loanOk==="function"){const low=loanOk(G);
    if(low&&!G.loanMailArm){G.loanMailArm=1;const n=G.loanMailN=(G.loanMailN||0)+1,L=LOAN_MAIL[(n-1)%LOAN_MAIL.length],C=LOAN_COACH[(n-1)%LOAN_COACH.length];
      addMail(G,{kind:"loan",from:L[0],title:L[1],body:`${L[2]} (On the back, in Coach Daeng's handwriting: "${C}")`});}
    else if(!low&&(G.loan>0||G.cash>=LOAN_LOW+4000))G.loanMailArm=0;}
  for(const M of STORY_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"letter",from:M.from,title:M.title,body:M.body});}
  for(const M of SPONSOR_MAIL)if(!G.mailSeen[M.id]&&M.when(G)){G.mailSeen[M.id]=1;addMail(G,{kind:"take",from:M.from,title:M.title,body:M.body,amt:M.amt});}
  // gang: after the first market fight, the next tier writes in every few weeks
  if(G.gang.st>=1&&G.gang.st<5&&gameWeek(G)>=(G.gang.nextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)&&G.week<=48){const early=G.gang.st===3&&G.loan>0,k=early?"gang5":"gang"+(G.gang.st+1);
    if(early){addMail(G,{kind:"quest",q:"gang",qk:k,early:1,from:"Morning-market vendors (unsigned)",title:"Big Boss Golden Helmet shows up himself!",body:`His goons lost to Sirichai Camp three times in a row. Big Boss Golden Helmet lost face, so he's running the market himself, and he knows your camp owes him. Word is, whoever knocks him down wipes out the whole market's debts.`,exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
    else addMail(G,{kind:"quest",q:"gang",qk:k,from:"Morning-market vendors (unsigned)",title:G.gang.st>=4?"Big Boss Golden Helmet is coming himself!":"The helmet gang is back",
      body:[`They're back collecting interest again. This time "${QK[k].name}" is in charge. Anyone who doesn't pay twenty percent gets their stall wrecked. Can you help us one more time?`,`${QK[k].name} threatened to seize Grandma Waew's meatball cart. If Sirichai doesn't stop him, no one can`,`The whole market has gone silent, because "${QK[k].name}" has been sitting guard since five a.m. Please`,`They say the big boss "${QK[k].name}" is coming to collect himself. The whole market owes him. Take this one down and the gang is finished`][G.gang.st-1],exp:G.week+3});G.gang.nextAbs=gameWeek(G)+5;}
  // Recurring side challenges become more frequent each year.
  if((G.season||1)>=2&&G.week>=7&&G.week<=47){const year=G.season||1;
    if(G.gang.st>=5&&gameWeek(G)>=(G.gang.loopNextAbs||0)&&!G.mail.some(m=>m.q==="gang"&&!m.done&&!m.expired)){
      const i=G.gang.loopN||0,k=["gang2","gang3","gang4","gang5"][i%4];G.gang.loopN=i+1;G.gang.loopNextAbs=gameWeek(G)+Math.max(5,15-year*2);
      addMail(G,{kind:"quest",q:"gang",qk:k,repeat:1,from:"Aunt Sri at the Market",title:"The helmet gang is back",body:`${QK[k].name} is causing trouble at the market again. They have trained harder this year. Can your gym help?`,exp:G.week+3,pay:3000+year*500});}
    G.animalLoop=G.animalLoop||{nextAbs:0,turn:0};
    if(gameWeek(G)>=G.animalLoop.nextAbs&&!G.mail.some(m=>["cow","rooster"].includes(m.q)&&!m.done&&!m.expired)){
      const cow=G.animalLoop.turn%2===0,k=cow?(year>=4?"bull3":"bull2"):(year>=4?"rooster5":"rooster3");
      G.animalLoop.turn++;G.animalLoop.nextAbs=gameWeek(G)+Math.max(4,15-year*2);
      addMail(G,{kind:"quest",q:cow?"cow":"rooster",qk:k,repeat:1,from:cow?"Uncle Chaloem's Dairy Farm":"Sia Tong's Rooster Ring",title:cow?"The cow wants a rematch!":"The rooster wants a rematch!",body:cow?`${QK[k].name} has been kicking a heavy bag every day. No one dares enter the farm. Please face it again.`:`${QK[k].name} has beaten every rooster at the ring and is waiting for a fighter from Sirichai.`,exp:G.week+2,pay:2000+year*400});}}
  // Stadium titles: legacy Tha Phae saves retain their original G.belt slots.
  for(const [venue,V] of Object.entries(STADIUMS))if((G.season||1)>=V.minYear&&V.weeks.includes(G.week))
    for(const div of [...new Set(roster(G).map(f=>f.div))]){const h=beltHolder(G,div,venue);if(!h)continue;
      const ours=h.camp==="player",op=ours?beltChallenger(G,div,h.id):h;if(!op)continue;const B=beltStore(G,venue)[div];
      addMail(G,{kind:"quest",q:"belt",venue,bg:V.bg,npc:op.id,div,defend:ours?h.id:null,from:`${V.name} promoter`,title:ours?`Defend the ${V.name} belt · Div ${div}`:`Challenge for the ${V.name} belt · Div ${div}`,
        body:ours?`${op.name} challenges ${h.name} at ${V.name}. Accept within two weeks. Win ${fmt(V.defend)}.`:`${op.name} has defended the ${V.name} belt ${B.def} times. Five rounds; win ${fmt(V.win)} and the belt.`,exp:G.week+2,pay:ours?V.defend:V.win});}
  // v1.69: Auntie Taew writes in for help at her som tam stall every few weeks (a minigame that does not use the camp activity)
  if(G.week>=4&&G.week<=49&&gameWeek(G)>=(G.tamNextAbs||4)&&!G.mail.some(m=>m.kind==="job"&&!m.done&&!m.expired)){G.tamNextAbs=gameWeek(G)+3+Math.floor(rng()*2);
    const T=TAM_MAIL[(G.mailN_tam=(G.mailN_tam||0)+1)%TAM_MAIL.length];addMail(G,{kind:"job",job:"somtam",exp:G.week+1,from:"Auntie Taew, som tam stall by the temple",title:T[0],body:T[1]});}
  // cow on the loose — once, mid season
  if(!G.mailSeen.cow&&G.week>=9&&rng()<.6){G.mailSeen.cow=1;addMail(G,{kind:"quest",q:"cow",qk:"bull1",from:"Uncle Chaloem, dairy farm",title:"Help! The cow's loose!!",body:"Fresh Milk, the fiercest cow on the farm, broke out of her pen. She watches Muay Thai on TV every night and now she can hold a guard! She's blocking the road in front of the market and kicks anyone who comes near. Send a fighter, please. Uncle will pay, plus a bucket of fresh milk",exp:G.week+2,pay:1500});}
  if(!G.mailSeen.rooster&&G.week>=5&&rng()<.6){G.mailSeen.rooster=1;addMail(G,{kind:"quest",q:"rooster",qk:"rooster1",from:"Sia Tong, rooster arena",title:"My rooster flew into your camp",body:"My hot-headed bantam flew over the fence and has been pecking your heavy bag since morning. It squares up at anyone who comes close. Please catch it for me. I'll pay, plus two trays of eggs",exp:G.week+2,pay:1000});}
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
  if(won&&G.week>=6&&G.week<=42&&rng()<.45){const B=WIN_BONUS[(G.week+G.seed)%WIN_BONUS.length];addMail(G,{kind:"take",from:B[0],title:B[1],body:B[2],amt:Math.round((1500+G.week*70)/100)*100});}
  const gi=GIG_WEEKS.indexOf(G.week);if(gi>=0){const g=GIGS[gi%GIGS.length];addMail(G,{kind:"take",from:g[0],title:g[1],body:g[2],amt:Math.round((3000+G.week*90)/100)*100});}
  if(G.week%3===1&&G.week>=4&&G.week<=49){const q=QUIZ[(Math.floor(G.week/3)+G.seed)%QUIZ.length];addMail(G,{kind:"quiz",from:"Community radio 'Our Muay Thai'",title:"Weekly prize quiz",body:"Answer correctly to win prize money from the show's sponsor (one answer only)",q:q[0],opts:q[1],ans:q[2],amt:Math.round((800+Math.min(2200,G.week*45))/10)*10,exp:G.week+2});}
  // odd bills
  if(G.week>=5&&rng()<.22){const L=BILLS.filter(b=>!b[3]||b[3](G));const b=L[Math.floor(rng()*L.length)];addMail(G,{kind:"pay",from:b[0],title:"Invoice",body:b[1],amt:Math.round(b[2]*(1+G.week/60)/10)*10,exp:G.week+2});}
  // odd fights posted to the offers board (rare, pays well)
  beastOffer(G,rng);
  qCleanup(G);}
const BEAST_WEEKS=[7,11,15,19,23,27,31,35,39,43,47];
function beastOffer(G,rng){const year=G.season||1,gap=Math.max(2,5-year);if(year===1?!BEAST_WEEKS.includes(G.week):G.week<5||G.week>49||(G.week-5)%gap!==0)return;const R=roster(G).filter(f=>!f.injury);if(!R.length)return;
  const i=year===1?BEAST_WEEKS.indexOf(G.week):Math.floor((G.week-5)/gap);const kinds=["rooster2","bull2","rooster3","bull2","rooster4","bull3","rooster4","rooster5","bull3","rooster5","bull3"];const kind=year>=4?["rooster4","bull3","rooster5","bull2","rooster3","bull3"][i%6]:kinds[i%kinds.length];const f=R[Math.floor(rng()*R.length)];
  const wk=G.week+2;if(G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-wk)<=1))return;const qid=makeQ(G,kind,f.id,"o"+G.week);const K=QK[kind];
  const win=Math.round((6000+G.week*180)*(1+K.lvl*.2)/100)*100,lose=Math.round(win*.35/100)*100;
  G.offers.unshift({id:`ob${G.week}_${f.id}`,a:f.id,b:qid,week:wk,tier:"beast",beast:kind,win,lose});
  const ev=K.grp==="rooster"?["Ban Pong Temple Fair","Human vs Fighting Rooster"]:["District Annual Fair","Bull Wrestling (Muay Thai edition)"];
  addMail(G,{kind:"letter",from:ev[0],title:`Invitation: "${ev[1]}"`,body:`We invite ${f.name} to a special bout with "${K.name}" in week ${wk}. Better purse than a normal fight (doesn't affect record or rankings). The offer is on the Fights page; accept it this week`});}

// ---------- quest fights ----------
function questFighters(){return roster(G).filter(f=>!f.injury);}
function startQuest(spec,fid,done){const f=G.F[fid];if(!f){done&&done();return;}
  const opp=spec.npc||makeQ(G,spec.qk,fid,spec.tag||("w"+G.week));const tier="quest";
  const b={id:"q"+G.week+"_"+fid+"_"+Math.floor(Math.random()*1e4),a:fid,b:opp,week:G.week,tier,rounds:spec.rounds||3,win:spec.purse||0,lose:0,quest:spec};
  b.bg=spec.bg||(spec.q==="belt"?"bg_district.webp":spec.npc?"bg_food.webp":QGRP_BG[QK[spec.qk].grp]);
  if(typeof questPlan==="function"){questPlan(b,()=>openFight(b,()=>questAfter(b,done)));return;}
  openFight(b,()=>questAfter(b,done));}
function questAfter(b,done){const S=b.quest,res=(G.cal||[]).slice(-1)[0];const win=res&&res.b===b.b&&res.res==="W";const me=G.F[b.a],op=G.F[b.b]||{name:"Opponent"};
  const fin=()=>{save();render();done&&done();};
  if(S.q==="gang"){G.gang=G.gang||{st:0,next:0};if(S.rematch){if(win){G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.rep+=.2;}playScene([{n:"npc",who:"Big Boss Golden Helmet",t:win?"I lost again! I will be back.":"I won this time! But your camp has grown stronger."},{n:b.a,f:win?"happy":"sad",l:"fight",t:win?"Sirichai Camp is always ready.":"We will win next time."}],fin,{bg:"market",look:"fight"});return;}if(win){if(S.qk==="gang5")G.goldHelmetWins=(G.goldHelmetWins||0)+1;G.gang.st=Math.max(G.gang.st,+S.qk.slice(4));G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);if(S.qk==="gang5"&&G.loan>0){G.loan=0;G.flags.loanWiped=1;}G.rep+=S.qk==="gang5"?2:.5;
      const amt=S.qk==="gang5"?12000:S.qk==="gang4"?5000:S.qk==="gang3"?2000:200+Math.floor(srand(G,7)*7)*50;
      addMail(G,{kind:"take",from:"(sender unknown)",title:S.qk==="gang5"?"The morning market thanks Sirichai":"A brown envelope with no name",body:S.qk==="gang5"?"The helmet gang has disbanded. The whole market's loan-shark debts are void. Every stall chipped in for the camp. Thank you for not just standing by":"Inside: money and a note in shaky handwriting: 'Thank you for helping the market. We sold out today'",amt});
      playScene([{n:"npc",who:"Auntie Sri, the vegetable seller",t:S.qk==="gang5"?(G.flags.loanWiped===1?(G.flags.loanWiped=2,"Gold Helmet Boss is down!! The whole market is free! His debt book got burned, and the camp's loan is gone too!"):"The Golden Helmet boss is down!! The whole market is free!"):"They're gone! They rode off on their bikes! Thank you, dear"},{n:b.a,f:"happy",l:"fight",t:S.qk==="gang5"?"This market has protection now. Its name is Sirichai Camp!":"Anyone who bullies this market goes through Sirichai first!"},{n:"nar",t:"By evening, a brown envelope with no sender is tucked into the camp mailbox"}],fin,{bg:"market",look:"fight"});return;}
    playScene([{n:"npc",who:op.name,t:"Ha! Some fight camp! Tell the vendors to get the interest ready!"},{n:b.a,f:"sad",l:"fight",t:"…I'm sorry, auntie. Next time I won't lose"},{n:"nar",t:"The vendor says it's okay. They'll be back, and the camp will get another chance"}],()=>{G.gang.nextAbs=gameWeek(G)+3;fin();},{bg:"market",look:"fight"});return;}
  if(win&&S.pay){addMail(G,{kind:"take",from:S.from||"Client",title:"Fee as agreed",body:S.q==="cow"?"Your fee plus a bucket of fresh milk (the milk was gone within ten minutes, courtesy of the camp's fighters)":S.q==="rooster"?"Your fee plus two trays of eggs. The bantam went home to sulk; the owner says it had never lost before":"Ringside bets pooled by the crowd. The whole subdistrict is talking about this fight",amt:S.pay});G.rep+=.6;}
  if(S.q==="challenge")op&&(win?G.rep+=1:0);
  if(S.q==="belt"){const venue=S.venue||"tha",V=STADIUMS[venue],slot=beltStore(G,venue),B=slot[S.div];
    if(win&&!S.defend){slot[S.div]={id:me.id,def:0,since:G.week};G.rep+=3;me.belts=(me.belts||0)+1;
      recordHonor(G,"belt",me.id,S.div,G.week,venue==="tha"?null:venue);playHonorQueue(fin);return;}
    if(win&&S.defend){B.def++;G.rep+=1.5;recordHonor(G,"defense",me.id,S.div,G.week,venue==="tha"?null:venue);playHonorQueue(fin);return;}
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
  UI.qpend=null;playScene(gangEventSteps(),()=>{const p=UI.qpend;UI.qpend=null;if(!p){done();return;}G.gang.st=Math.max(G.gang.st,0);startQuest({q:"gang",qk:"gang1"},p.fid,done);},{bg:"market",look:"train"});return true;}

// ---------- modals ----------
function mailListHTML(){const L=G.mail||[];
  return `<h2 class="mailh">${MAILBOX_PX} Mailbox</h2>${L.length?`<div class="mlist2">${L.map(m=>`<button class="mrow2 ${m.read?"":"unread"} ${mailOpen(m)?"act":""} ${m.done||m.expired?"old":""}" data-act="mopen" data-v="${m.id}"><span class="mk ${m.kind}">${{letter:"Letter",take:"Money",pay:"Invoice",quiz:"Quiz",quest:"Request",job:"Job",event:"Event",loan:"Loan"}[m.kind]}</span><span class="mt"><b>${esc(m.title)}</b><small>${esc(m.from)} · wk ${m.wk}${m.expired?" · expired":m.done?" · handled":m.expAbs!=null?` · by wk ${((m.expAbs-1)%52)+1}`:""}</small></span>${mailOpen(m)?'<i class="dot"></i>':""}</button>`).join("")}</div>`:`<p class="lead">No mail yet</p>`}`;}
function letterHTML(m){m.read=true;let act="";
  if(m.kind==="take")act=m.done?`<p class="meta center">Received ${fmt(m.amt)}</p>`:`<button class="btn primary" data-act="mtake" data-v="${m.id}">Collect ${fmt(m.amt)}</button>`;
  if(m.kind==="pay")act=m.done?`<p class="meta center">${m.paid?"Paid":"Didn't pay (fame −0.3)"}</p>`:m.expired?"":`<button class="btn" data-act="mskip" data-v="${m.id}">Don't pay (fame −0.3)</button><button class="btn primary" data-act="mpay" data-v="${m.id}" ${G.cash<m.amt?"disabled":""}>Pay ${fmt(m.amt)}</button>`;
  if(m.kind==="quiz")act=m.done?`<p class="meta center">${m.ok?`Correct! You won ${fmt(m.amt)}`:`Wrong! The answer was "${esc(m.opts[m.ans])}"`}</p>`:m.expired?"":`<p class="qz"><b>${esc(m.q)}</b></p><div class="qopts">${m.opts.map((o,i)=>`<button class="btn" data-act="mquiz" data-v="${m.id}" data-k="${i}">${esc(o)}</button>`).join("")}</div>`;
  if(m.kind==="job")act=m.done?`<p class="meta center">${m.declined?"Didn't go":m.grade?`Helped out · grade ${m.grade}`:"Sent someone to help: ฿550"}</p>`:m.expired?`<p class="meta center">Expired</p>`:`<span class="mgtag">${JOY_PX}MINIGAME</span><button class="btn" data-act="mjdecl" data-v="${m.id}">Too busy</button><button class="btn" data-act="mjskip" data-v="${m.id}">Send someone (฿550)</button><button class="btn primary" data-act="mjplay" data-v="${m.id}">${JOY_PX} Help in person</button>`;
  if(m.kind==="event")act=evMailAct(m);
  if(m.kind==="loan")act=m.done?`<p class="meta center">${m.took?"Loan taken":"Card binned"}</p>`:!loanOk(G)?`<p class="meta center">${G.loan>0?"A Gold Helmet loan is still unpaid. You can't borrow again.":"Cash is out of the danger zone. No need for this card."}</p>`:`<button class="btn" data-act="mloanno" data-v="${m.id}">Bin the card</button><button class="btn red" data-act="mloan" data-v="${m.id}">See loan ${fmt(LOAN_AMT)}</button>`;
  if(m.kind==="lotto")act=lottoLetterAct(m);
  if(m.kind==="quest")act=m.done?`<p class="meta center">${m.declined?"Declined":"Fighter sent"}</p>`:m.expired?`<p class="meta center">Expired</p>`:`<button class="btn" data-act="mdecl" data-v="${m.id}">Not going</button><button class="btn primary" data-act="macc" data-v="${m.id}">Take the job · choose a fighter</button>`;
  const opp=m.qk?QK[m.qk]:m.npc?G.F[m.npc]:null;
  return `<button class="btn sm ghost mback" data-act="mail">◂ Mailbox</button><div class="letter px"><div class="lhead"><small>From</small><b>${esc(m.from)}</b><small>Week ${m.wk}</small></div><h3>${esc(m.title)}</h3><p>${esc(m.body)}</p>
   ${m.kind==="take"||m.kind==="pay"?`<p class="lamt ${m.kind}">${m.kind==="take"?"+":"−"}${fmt(m.amt)}</p>`:""}
   ${opp&&m.kind==="quest"?`<div class="qopp">${m.qk?`<canvas width="96" height="96" data-qsprite="${QK[m.qk].sprite}"></canvas>`:faceImg(opp)}<span><b>${esc(opp.name)}</b><small>${m.q==="belt"?`5 rounds · opponent power ${ovr(opp.a).toFixed(1)}`:m.q==="challenge"?"Exhibition, off the record":"Fight now · off the record and rankings · extra fatigue"}${m.pay?` · fee ${fmt(m.pay)}`:m.q==="gang"?" · reward arrives by mail":""}</small></span></div>`:""}</div>
   <div class="mfoot lact">${act}</div>`;}
function qpickHTML(mid){const m=(G.mail||[]).find(x=>x.id===mid);const R=roster(G);
  return `<h2>Who will you send?</h2><p class="meta">${m?esc(m.title):""} · fight right now, extra fatigue, off the record</p><div class="qpick">${R.map(f=>`<button class="qpf px" data-act="qsend" data-id="${f.id}" data-v="${mid}" ${f.injury?"disabled":""}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?`Injured ${f.injury} wk`:`Fatigue ${Math.round(f.fatigue)} · readiness ${condition(f)}`}</small></span></button>`).join("")}</div>`;}
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
  for(const id of ["kati","mali","rin","ploy","fah"]){const f=G.F[id];if(f&&(f.camp==="player"||f.met)&&typeof bdayWeek==="function"&&bdayWeek(id)===w)E.push({ic:"🎂",t:`Birthday: ${f.name}`});}
  const FE={26:["🏮","Loy Krathong"],32:["🎆","New Year"],47:["💦","Songkran"]};if(FE[w])E.push({ic:FE[w][0],t:FE[w][1]});if(typeof LOTTO_WK!=="undefined"&&LOTTO_WK.some(x=>x+2===w))E.push({ic:"🎟️",t:"Lottery results"});
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
  const ev=calEvents(w);return `<h2>Week ${w}${typeof weekDateLabel==="function"?` <small class="meta">· ${weekDateLabel(w)}</small>`:""}</h2>${ev.map(e=>`<div class="calres px ev"><b>${e.ic} ${esc(e.t)}</b></div>`).join("")}${p.map(c=>{const me=G.F[c.a];return `<div class="calres px ${c.res==="W"?"w":c.res==="L"?"l":"d"}"><b>${esc(me?me.name:c.a)} ${c.res==="W"?"Win":c.res==="L"?"Loss":"Draw"} ${esc(c.bn)}</b><span class="meta">${TIER[c.tier]?TIER[c.tier].name:""} · ${esc(c.type||"")} · earned ${fmt(c.pay||0)}</span><span class="cards">${(c.cards||[]).map((k,i)=>`<i>R${i+1} ${k[0]}–${k[1]}</i>`).join("")}</span></div>`;}).join("")}
   ${n.map(b=>`<div class="calres px nx"><b>${esc(G.F[b.a].name)} vs ${esc(G.F[b.b].name)}</b><span class="meta">Booked · ${TIER[b.tier].name} · ${b.rounds} rounds</span></div>`).join("")}${!p.length&&!n.length?`<p class="meta">No camp fights this week</p>`:""}`;}
const RANK_HELP=`<ul class="fp-list"><li><b>Win = 3 points</b> (beat a stronger fighter +1) · draw 1 · loss 0 — only "subdistrict/district" fights count</li><li><b>Weeks 1–20, subdistrict round:</b> the top 4 of each division advance to the district round</li><li><b>Weeks 21–40, district round:</b> points reset, the top 4 go to the provincial semis</li><li><b>Week 44 semis · week 49 provincial final</b>: big prize money and top fame</li><li>Temple-fair, special and off-the-books fights <b>give no points</b>, but do give money, EXP and fame</li></ul>`;
const XMODAL={
  mail:()=>({body:mailListHTML(),foot:true}),
  letter:m=>{const x=(G.mail||[]).find(y=>y.id===m.id);return x?{body:letterHTML(x),foot:false}:{body:mailListHTML(),foot:true};},
  qpick:m=>({body:qpickHTML(m.id),foot:true}),
  cashflow:()=>({body:cashflowHTML(),foot:true}),
  repgraph:()=>({body:repgraphHTML(),foot:true}),
  calday:m=>({body:caldayHTML(m.w),foot:true}),
  rankhelp:()=>({body:`<h2>How do rankings work?</h2><div class="ctip big"><img src="${faceSrc("coach")}" alt=""><span><b>Coach Daeng:</b> This season's goal is to get Kati ${G.F.mali.camp==="player"?" and Mali":""} into the division's <b>top 4</b>, clear both stages, then face Golden Tiger in the final</span></div>${RANK_HELP}`,foot:true}),
  declo:m=>{const o=G.offers.find(x=>x.id===m.id);if(!o)return {body:"",foot:true};return {body:`<h2>Decline this offer?</h2><p>${esc(G.F[o.a].name)} vs ${esc(G.F[o.b].name)} · wk ${o.week} · ${TIER[o.tier].name}</p><p class="meta">The offer will disappear from the list (decline the same person often and they may write you a challenge)</p><div class="mfoot"><button class="btn ghost" data-act="closeModal">No</button><button class="btn primary" data-act="declyes" data-v="${o.id}">Decline</button></div>`,foot:false};}};
Object.assign(ACT,{
  mail:()=>{UI.modal={type:"mail"};render();},
  mopen:d=>{UI.modal={type:"letter",id:d.v};render();save();},
  mtake:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.cash+=m.amt;m.done=true;AU.sfx("level");toast(`Received ${fmt(m.amt)}`);save();render();},
  mpay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||G.cash<m.amt)return;G.cash-=m.amt;m.done=true;m.paid=true;AU.sfx("ui");save();render();},
  mskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;G.rep=Math.max(0,G.rep-.3);m.done=true;save();render();},
  mquiz:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.ok=+d.k===m.ans;if(m.ok){G.cash+=m.amt;AU.sfx("level");}else AU.sfx("miss");save();render();},
  mjdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;m.declined=true;save();render();},
  mjskip:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;G.cash+=550;G.dust=(G.dust||0)+1;roster(G).forEach(f=>f.morale=clamp(f.morale+3,0,100));AU.sfx("ui");toast("Auntie Taew says thanks: ฿550 · ✦ +1");save();render();},
  mjplay:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done||m.expired)return;UI.modal=null;render();BAG.openMode("somtam",null,m.id);},
  mloan:d=>{ACT.loan();},
  mloanno:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;save();render();toast("Coach Daeng gives a quiet nod");},
  mdecl:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m)return;m.done=true;m.declined=true;if(m.q==="gang"&&G.gang)G.gang.nextAbs=gameWeek(G)+(G.loan>0?2:4);save();render();},
  macc:d=>{UI.modal={type:"qpick",id:d.v};render();},
  qsend:d=>{const m=G.mail.find(x=>x.id===d.v);if(!m||m.done)return;m.done=true;UI.modal=null;
    const spec=m.q==="belt"?{q:"belt",npc:m.npc,pay:m.pay,from:m.from,div:m.div,defend:m.defend,venue:m.venue||"tha",bg:m.bg,rounds:5}:m.q==="challenge"?{q:"challenge",npc:m.npc,pay:m.pay,from:m.from}:{q:m.q,qk:m.qk,pay:m.pay,from:m.from,rounds:m.qk==="gang5"?4:3};
    const intro=m.q==="gang"?[{n:"nar",t:"Morning market… more than ten motorbikes are lined up in front of the vegetable stalls"},{n:"npc",who:QK[m.qk].name,t:m.early?"My boys lost to you again and again. My name's mud! And your camp still owes me. Today I handle you myself!":m.qk==="gang5"?"I hear some fight camp is meddling in my business. Today the big boss came down himself!":"So who chased off my boys? Come on out!"},{n:d.id,f:"angry",l:"fight",t:"Me!"}]
      :m.q==="belt"?[{n:"nar",t:`${STADIUMS[m.venue||"tha"].name}. Spotlights hit the center of the ring as the announcer calls both corners.`},{n:"npc",who:G.F[m.npc].name,t:m.defend?"That belt should be mine. Today I'm taking it back.":"Want the belt? You'll have to get through me first."},{n:d.id,f:"angry",l:"fight",t:m.defend?"Come and take it, then!":"That's exactly why I'm here!"}]
      :m.q==="challenge"?[{n:"nar",t:"The yard behind the fresh market. Crowds on both sides; someone has set up a table taking bets in red soda"},{n:"npc",who:G.F[m.npc].name,t:"So you finally came. I thought you'd run all season"},{n:d.id,f:"angry",l:"fight",t:"I wasn't running, I was busy. Now I'm free!"}]
      :m.q==="cow"?[{n:"nar",t:"In the middle of the road by the market, a huge dairy cow holds a guard, front hooves doing footwork no cow should be able to do"},{n:"npc",who:"Uncle Chaloem",t:"That's her! Watch out for the kicks, dear, she watches fight replays every night!"},{n:d.id,f:"surprised",l:"fight",t:"…A cow really can hold a guard!?"}]
      :[{n:"nar",t:"A small bantam stands on the heavy bag, chest puffed, neck feathers bristling"},{n:"npc",who:"Sia Tong",t:"Don't underestimate him. He once chased every big dog on the street"},{n:d.id,f:"happy",l:"fight",t:"Come on, chicken! I'm not a dog!"}];
    playScene(intro,()=>startQuest(spec,d.id,()=>{}),{bg:m.q==="gang"?"market":m.q==="belt"?STADIUMS[m.venue||"tha"].scene:m.q==="challenge"?"food":m.q==="rooster"?"rooster":m.q==="cow"||m.q==="bull"?"farm":"fair",look:"fight"});},
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
const DM_WEEKS=[12,19,24,31,36,46];
const DM_PRIZE=[0,3000,8000,18000,40000];   // by how far our best fighter got: out in QF / SF / final / champion
const DM_STAGE=["Quarterfinal","Semifinal","Final"];
const dmOfferOn=G=>DM_WEEKS.includes(G.week)&&!(G.dmSeenSeason===(G.season||1)&&(G.dmSeen||{})[G.week])&&!G.ended;
const dmMine=id=>G.F[id]&&G.F[id].camp==="player";
const dmCanEnter=f=>!f.injury&&!isBooked(G,f.id,G.week);
function dmBuild(G,mine){const pool=Object.values(G.F).filter(f=>!mine.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&!f.injury&&f.div!=="X"&&!isBooked(G,f.id,G.week));
  const avg=mine.reduce((s,id)=>s+ovr(G.F[id].a),0)/mine.length;
  const stars=["ploy","fah"].filter(id=>pool.some(f=>f.id===id));
  const rest=pool.filter(f=>!stars.includes(f.id)).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);
  let others=[...stars,...rest].slice(0,8-mine.length);
  if(others.length<8-mine.length){/* v1.81.1: a short field used to leave empty slots and freeze the week */const extra=Object.values(G.F).filter(f=>!mine.includes(f.id)&&!others.includes(f.id)&&f.camp!=="player"&&f.camp!=="quest"&&f.camp!=="free"&&(f.div==="A"||f.div==="B")).map(f=>[f,Math.abs(ovr(f.a)-(avg+.4))]).sort((a,b)=>a[1]-b[1]).map(x=>x[0].id);others=others.concat(extra).slice(0,8-mine.length);}
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
function dmFight(meId,opId){const D=G.dm;if(!G.F[opId]){D.w[D.r].push(meId);dmAdvance();UI.modal={type:"dm"};save();render();return;}const b={id:"dm"+G.week+"_"+D.r+"_"+meId,a:meId,b:opId,week:G.week,tier:"dm",rounds:3,win:0,lose:0,dm:1,bg:"bg_hall.webp"};
  UI.modal=null;openFight(b,()=>{const w=b.result;const winner=w==="A"?meId:opId,loser=w==="A"?opId:meId;D.w[D.r].push(winner);if(dmMine(loser))D.out[loser]=D.r+1;
    dmAdvance();UI.modal={type:"dm"};save();render();});}
function dmFinish(){const D=G.dm;const champ=D.w[2][0];D.champ=champ;
  let best=0;for(const id of D.mine){const lv=id===champ?4:(D.out[id]||1);best=Math.max(best,lv);}D.best=best;
  const prize=DM_PRIZE[best]||0;G.cash+=prize;G.wkFight=(G.wkFight||0)+prize;D.prize=prize;
  if(best===4){G.rep+=4;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+10));recordHonor(G,"dm",champ,G.F[champ].div,D.wk);}else if(best===3)G.rep+=1.5;
  G.dmLog=(G.dmLog||[]).concat([{wk:D.wk,champ,best,prize}]);save();}
function dmBracketHTML(){const D=G.dm;if(!D)return "";const nm=id=>id&&G.F[id]?esc(G.F[id].name):"…";
  const cell=(id,r)=>{if(!id)return `<div class="dmc tbd">…</div>`;const won=(D.w[r]||[]).includes(id),lost=r<3&&D.w[r]&&D.w[r].length*2>((r===0?D.slots:D.w[r-1]).indexOf(id))&&!won;
    return `<div class="dmc ${dmMine(id)?"mine":""} ${won?"won":""} ${lost?"lost":""}">${G.F[id].canon?`<img src="${faceSrc(id,"happy")}" alt="">`:""}<b>${nm(id)}</b><small>${G.F[id].div==="A"?"Div A":"Div B"}</small></div>`;};
  const col=(L,r,title)=>`<div class="dmcol"><h4>${title}</h4>${Array.from({length:L.length/2},(_,i)=>`<div class="dmm">${cell(L[i*2],r)}${cell(L[i*2+1],r)}</div>`).join("")}</div>`;
  const pad=(L,n)=>[...L,...Array(n-L.length).fill(null)];
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
   <div class="list">${R.map(f=>`<button class="dmpick ${sel.includes(f.id)?"on":""}" data-act="dmsel" data-id="${f.id}" ${dmCanEnter(f)?"":"disabled"}>${faceImg(f,"sm")}<span><b>${esc(f.name)} Lv.${f.lvl}</b><small>${f.injury?"Injured":`Fatigue ${Math.round(f.fatigue)} · morale ${Math.round(f.morale)}`}</small></span><i>${sel.includes(f.id)?"✓":""}</i></button>`).join("")}</div>
   <div class="row2"><button class="btn" data-act="dmno">Skip</button><button class="btn primary" data-act="dmstart" ${sel.length?"":"disabled"}>Enter: ${sel.length} ▸</button></div>`;}
function dmCardHTML(){if(G.dm&&!G.dm.done&&G.dm.wk===G.week)return `<section class="px card dmcard"><div><b>Death Match in progress</b><span class="meta">${DM_STAGE[Math.min(2,G.dm.r)]}</span></div><button class="btn primary" data-act="dmopen">Continue ▸</button></section>`;
  if(!dmOfferOn(G))return "";return `<section class="px card dmcard"><span class="ribbon">Special offer</span><div><b>8-fighter cross-division Death Match</b><span class="meta">All fought this week · not ranked · champion ${fmt(DM_PRIZE[4])}</span></div><button class="btn gold" data-act="dmpick">Details</button></section>`;}
Object.assign(ACT,{
  dmpick:()=>{UI.dmSel=roster(G).filter(dmCanEnter).slice(0,1).map(f=>f.id);UI.modal={type:"dmpick"};render();},
  dmsel:d=>{const s=UI.dmSel||[];UI.dmSel=s.includes(d.id)?s.filter(x=>x!==d.id):s.length<3?[...s,d.id]:s;render();},
  dmno:()=>{if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;UI.modal=null;save();render();},
  dmstart:()=>{const sel=(UI.dmSel||[]).filter(id=>dmMine(id)&&dmCanEnter(G.F[id]));if(!sel.length)return;if(G.dmSeenSeason!==(G.season||1)){G.dmSeen={};G.dmSeenSeason=G.season||1;}G.dmSeen[G.week]=1;
    G.dm=dmBuild(G,sel);UI.modal=null;save();
    playScene([{n:"npc",who:"Ring announcer",t:vary("dm1",["Ladies and gentlemen! Tonight there is no tomorrow! Eight fighters from every division, fighting until one is left! DEATH MATCH!!","We're back! The fight with no rest! Eight go in, one comes out! DEATH MATCH!!","If you're tired, go home now! Tonight we fight straight through to a champion! DEATH MATCH!!","The tent's packed so tight it might burst! Eight of the best women fighters from every division, the Death Match is here!!"])},
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
function bagChart(G,dk,salt=0){const D=BAG_DIFF[dk],beat=60/D.bpm,half=beat/2,N=[];let t=4*beat;/* one bar of count-in */
  for(let b=0;b<D.bars;b++){const pool=[].concat(...BAG_PAT.slice(0,D.dens+1));const p=b===D.bars-1?"L.......":pool[Math.floor(srand(G,700+salt+b*13+D.dens*101+G.week)*pool.length)];
    for(let i=0;i<8;i++){if(p[i]!==".")N.push({t:t+i*half,k:p[i],j:null});}t+=4*beat;}
  return {notes:N,end:t+beat,beat};}
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
  open(){const F=bagFighters(G);if(!F.length){toast("No fighter is fit to train");return;}
    const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"hub",mode:"bag",id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();this.draw();},
  openMode(m,act,mail){const F=bagFighters(G);if(!F.length){toast("No fighter is fit to train");return;}const pick=(G.mini&&G.mini.bagLast&&F.find(f=>f.id===G.mini.bagLast))||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={phase:"pick",mode:m,act,mail,id:pick.id,dk:(G.mini&&G.mini.bagDk)||"normal",practice:false};this.mount();if(m==="live"){LIVE.pick();LIVE.st.practice=false;LIVE.st.act=act;LIVE.draw();}else this.draw();},
  mount(){let el=document.getElementById("minibag");if(!el){el=document.createElement("div");el.id="minibag";el.className="mgame";document.body.appendChild(el);}
    el.onclick=e=>{const lv=e.target.closest("[data-lv]");if(lv&&typeof LIVE!=="undefined"){LIVE.act(lv.dataset.lv,lv.dataset.v);return;}const b=e.target.closest("[data-mb]");if(!b)return;const a=b.dataset.mb,v=b.dataset.v;
      if(a==="mode"&&MG_MODES[v]&&MG_MODES[v].custom){this.st.mode=v;LIVE.pick();}else if(a==="mode"){this.st.mode=v;this.st.phase="pick";this.st.practice=mgPlayed(G,v);this.draw();}else if(a==="hub"){this.st.phase="hub";this.draw();}else if(a==="pick"){this.st.id=v;this.draw();}else if(a==="dk"){this.st.dk=v;this.draw();}else if(a==="go")this.start();else if(a==="close")this.close();else if(a==="claim")this.claim();else if(a==="again"){this.st.phase="pick";this.st.practice=true;this.draw();}};
    if(!this.keyH){this.keyH=e=>{if(typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"&&/^[123]$/.test(e.key)){const d=LIVE.st.cur;if(d){e.preventDefault();LIVE.answer(d.ord[+e.key-1]);}return;}if(!this.st||this.st.phase!=="play")return;const k=e.key.toLowerCase();if(e.repeat)return;
      if(k==="f"||k==="d"||k==="arrowleft"){e.preventDefault();this.hit("L");}else if(k==="j"||k==="k"||k==="arrowright"){e.preventDefault();this.hit("R");}else if(k==="escape")this.close();};
      document.addEventListener("keydown",this.keyH);
      document.addEventListener("visibilitychange",()=>{if(document.hidden&&typeof LIVE!=="undefined"&&LIVE.st&&LIVE.st.phase==="play"){LIVE.st.dur=0;}if(document.hidden&&this.st&&this.st.phase==="play"){this.st.phase="abort";cancelAnimationFrame(this.raf);this.draw();}});}},
  close(){cancelAnimationFrame(this.raf);if(typeof LIVE!=="undefined"&&LIVE.st){cancelAnimationFrame(LIVE.raf);LIVE.st=null;}const el=document.getElementById("minibag");if(el)el.remove();this.st=null;try{AU.startMusic("hub");}catch(e){}if((G.cardPend||[]).length&&!UI.modal)UI.modal={type:"cardnew"};render();},
  draw(){const S=this.st,el=document.getElementById("minibag");if(!S||!el)return;if(S.phase==="live")return LIVE.draw();const F=bagFighters(G),f=G.F[S.id];
    const M=MG_MODES[S.mode];
    if(S.phase==="hub"){el.innerHTML=`<div class="mbox px"><h2>${JOY_PX} Minigames</h2><p class="meta center">Each game gives a reward once a week · replay as practice anytime</p>
       <div class="mghub">${Object.entries(MG_MODES).map(([k,X])=>{const op=X.open(G),pl=mgPlayed(G,k);return `<button class="mgitem ${pl?"done":""}" data-mb="mode" data-v="${k}" ${op?"":"disabled"}><span class="mi">${X.icon}</span><span><b>${X.title}</b><small>${op?(pl?"Reward claimed this week ✓":X.note):"Not open yet"}</small></span><span class="chev">▸</span></button>`;}).join("")}</div>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Back to camp</button></div></div>`;return;}
    if(S.phase==="pick"){const best=((G.mini&&G.mini.best)||{})[S.mode]||{};
      el.innerHTML=`<div class="mbox px"><h2>${M.icon} ${M.title}</h2>
       <p class="meta">Hit when a note reaches the circle · <b class="mbL">${M.L}</b> = ${M.Ls} (left button / F) · <b class="mbR">${M.R}</b> = ${M.Rs} (right button / J)</p>
       <div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-mb="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>
       <div class="mbdk">${Object.entries(BAG_DIFF).map(([k,d])=>`<button class="btn sm ${k===S.dk?"primary":""}" data-mb="dk" data-v="${k}">${d.name}${best[k]?` · ${best[k]}`:""}</button>`).join("")}</div>
       <p class="meta center">${S.card?(S.practice?"Card minigame · practise as often as you like":"Card minigame · your first clear earns stardust ✦ by grade"):S.practice?"Already played this week · this run is practice, no rewards":S.mode==="bag"?"Weekly reward: kick/punch · morale · stardust ✦ · an S unlocks a card":"Weekly reward: pay from Auntie Taew · fame · stardust ✦ · an S unlocks a card"}</p>
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Later</button><button class="btn primary" data-mb="go">Start! ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mplay"><div class="mhud"><b>${esc(f.name)}</b><span>Combo <b id="mbc">0</b></span><span>Score <b id="mbs">0</b></span><button class="xbtn" data-mb="close" aria-label="Quit">✕</button></div>
       <canvas id="mbcv" width="360" height="300"></canvas>
       <div class="mbtns"><button class="mbtn L ${S.mode}" id="mbL"><b>${M.L}</b><small>${M.Ls} · F</small></button><button class="mbtn R ${S.mode}" id="mbR"><b>${M.R}</b><small>${M.Rs} · J</small></button></div></div>`;
      const pd=k=>e=>{e.preventDefault();this.hit(k);};document.getElementById("mbL").addEventListener("pointerdown",pd("L"));document.getElementById("mbR").addEventListener("pointerdown",pd("R"));return;}
    if(S.phase==="abort"){el.innerHTML=`<div class="mbox px"><h2>Stopped</h2><p class="meta center">You switched apps or the screen turned off, so the song stopped · this week's reward is still available</p><div class="mfoot roadbtns"><button class="btn" data-mb="close">Close</button><button class="btn primary" data-mb="again">Play again</button></div></div>`;return;}
    if(S.phase==="result"){const R=S.res;
      el.innerHTML=`<div class="mbox px"><h2>Results</h2><div class="mgrade g${R.grade}">${R.grade}</div>
       <p class="center"><b>${R.score}</b> pts · Max combo ${R.maxc} · Accuracy ${Math.round(R.acc*100)}%</p>
       <p class="center meta">Perfect ${R.c.perfect} · Great ${R.c.great} · OK ${R.c.ok} · Miss ${R.c.miss}${R.best?" · <b class=\"goldt\">New record!</b>":""}</p>
       ${S.practice?`<p class="center meta">Practice mode · no rewards</p>`:`<p class="center">${R.rw}</p>`}
       <div class="mfoot roadbtns"><button class="btn" data-mb="again">Play again (practice)</button><button class="btn primary" data-mb="close">Back to camp</button></div></div>`;}},
  start(){const S=this.st;AU.resume&&AU.resume();try{AU.stopMusic();}catch(e){}
    G.mini=G.mini||{};G.mini.bagLast=S.id;G.mini.bagDk=S.dk;
    const C=bagChart(G,S.dk,S.mode==="somtam"?5000:0);S.notes=C.notes;S.end=C.end;S.beat=C.beat;S.phase="play";S.score=0;S.combo=0;S.maxc=0;S.c={perfect:0,great:0,ok:0,miss:0};S.fx=[];S.hitT=-9;S.hitK="L";
    this.draw();S.t0=this.clock()+.6;const nb=Math.round(S.end/S.beat);for(let i=0;i<nb;i++)this.ching(S.t0+i*S.beat,i%2===0);
    const cv=document.getElementById("mbcv");S.x=cv.getContext("2d");S.x.imageSmoothingEnabled=false;const loop=()=>{if(!this.st||this.st.phase!=="play")return;this.frame();this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);},
  now(){return this.clock()-this.st.t0;},
  judge(n,q){const S=this.st;n.j=q;S.c[q]++;if(q==="miss"){S.combo=0;}else{S.combo++;S.maxc=Math.max(S.maxc,S.combo);S.score+=({perfect:100,great:70,ok:40})[q]+Math.min(50,S.combo*2);}
    S.fx.push({q,t:this.now()});const c=document.getElementById("mbc"),s=document.getElementById("mbs");if(c)c.textContent=S.combo;if(s)s.textContent=S.score;},
  hit(k){const S=this.st;if(!S||S.phase!=="play")return;const t=this.now();if(S.mode==="somtam")this.wood(k,this.clock());else this.drum(k,this.clock());S.hitT=t;S.hitK=k;
    const btn=document.getElementById(k==="L"?"mbL":"mbR");if(btn){btn.classList.remove("hit");void btn.offsetWidth;btn.classList.add("hit");}
    let best=null,bd=9;for(const n of S.notes){if(n.j)continue;const d=Math.abs(n.t-t);if(d<bd){bd=d;best=n;}if(n.t-t>BAG_WIN.ok)break;}
    if(!best||bd>BAG_WIN.ok)return;/* stray tap: no penalty */
    if(best.k!==k){this.judge(best,"miss");return;}
    this.judge(best,bd<=BAG_WIN.perfect?"perfect":bd<=BAG_WIN.great?"great":"ok");},
  frame(){const S=this.st,x=S.x,W=360,H=300,t=this.now(),f=G.F[S.id];
    for(const n of S.notes){if(!n.j&&t-n.t>BAG_WIN.ok)this.judge(n,"miss");}
    if(t>S.end+.4){this.finish();return;}
    x.clearRect(0,0,W,H);x.fillStyle="#1b1530";x.fillRect(0,0,W,H);
    // fighter + heavy bag (same drawing as the training drill)
    const dt=(t-S.hitT)*1000,hit=dt>=0&&dt<450;const row=hit?(S.mode==="somtam"?"punch":S.hitK==="L"?"knee":"punch"):(S.mode==="somtam"?"idle":"guard");const fr=hit?Math.min(3,Math.floor(dt/90)):Math.floor(performance.now()/260)%4;
    x.fillStyle="rgba(0,0,0,.35)";x.beginPath();x.ellipse(W*.4,196,40,6,0,0,7);x.fill();
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
    const last=S.fx[S.fx.length-1];if(last&&t-last.t<.5){const a=(t-last.t)/.5;x.globalAlpha=1-a;x.font=`bold ${22+a*6}px "Pixelify Sans",sans-serif`;x.textAlign="center";x.lineWidth=4;x.strokeStyle="#000";
      const T={perfect:["PERFECT!","#ffd34a"],great:["GREAT","#8ef0a0"],ok:["OK","#fff"],miss:["MISS","#ff6a6a"]}[last.q];x.strokeText(T[0],W*.6,26-a*10);x.fillStyle=T[1];x.fillText(T[0],W*.6,26-a*10);x.globalAlpha=1;}
    // note lane (taiko style: notes slide in from the right to the drum circle)
    const ly=252,hx=46,sp=210;x.fillStyle="#120e22";x.fillRect(0,ly-30,W,60);x.fillStyle="#2c2448";x.fillRect(0,ly-30,W,3);x.fillRect(0,ly+27,W,3);
    const bt=S.beat;for(let b=Math.ceil((t-.5)/bt)*bt;b<t+1.8;b+=bt){const bx2=hx+(b-t)*sp;if(bx2>0&&bx2<W){x.fillStyle="rgba(255,255,255,.08)";x.fillRect(bx2,ly-26,2,52);}}
    x.lineWidth=3;x.strokeStyle="#ffd34a";x.beginPath();x.arc(hx,ly,22,0,7);x.stroke();x.strokeStyle="rgba(255,211,74,.35)";x.beginPath();x.arc(hx,ly,15,0,7);x.stroke();
    for(let i=S.notes.length-1;i>=0;i--){const n=S.notes[i];if(n.j&&n.j!=="miss")continue;const nx=hx+(n.t-t)*sp;if(nx<-30||nx>W+30)continue;
      const L=n.k==="L",r=L?18:14;x.globalAlpha=n.j==="miss"?.35:1;x.fillStyle="#000";x.beginPath();x.arc(nx,ly,r+3,0,7);x.fill();x.fillStyle=L?"#e2443c":"#3c8be2";x.beginPath();x.arc(nx,ly,r,0,7);x.fill();
      x.fillStyle="rgba(255,255,255,.35)";x.beginPath();x.arc(nx-r*.3,ly-r*.35,r*.35,0,7);x.fill();x.fillStyle="#fff";x.font=`bold ${L?13:11}px sans-serif`;x.textAlign="center";x.fillText(L?MG_MODES[S.mode].L:MG_MODES[S.mode].R,nx,ly+4);x.globalAlpha=1;}
    // count-in
    if(t<4*bt){const n=4-Math.floor(Math.max(0,t)/bt);x.font='bold 40px "Pixelify Sans",sans-serif';x.textAlign="center";x.fillStyle="#fff";x.strokeStyle="#000";x.lineWidth=5;const s=t<0?"Ready":String(n);x.strokeText(s,W/2,120);x.fillText(s,W/2,120);}
    // progress
    x.fillStyle="#2c2448";x.fillRect(0,H-4,W,4);x.fillStyle="#ffd34a";x.fillRect(0,H-4,W*Math.min(1,Math.max(0,t/S.end)),4);},
  finish(){const S=this.st;cancelAnimationFrame(this.raf);S.phase="result";const n=S.notes.length,c=S.c;
    const acc=(c.perfect+c.great*.75+c.ok*.4)/Math.max(1,n);const grade=acc>=.92&&c.miss===0?"S":acc>=.78?"A":acc>=.6?"B":"C";
    G.mini=G.mini||{};G.mini.best=G.mini.best||{};if(typeof G.mini.best.easy==="number"){G.mini.best={bag:G.mini.best};}const B=G.mini.best[S.mode]=G.mini.best[S.mode]||{};const isBest=S.score>(B[S.dk]||0);if(isBest)B[S.dk]=S.score;
    S.res={acc,grade,score:S.score,maxc:S.maxc,c,best:isBest,rw:""};
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
    const g=Math.round(acc*.3*D.mul*100)/100;const up=k=>{const cap=Math.min(20,(f.potential||14)+1.5);const before=f.a[k];f.a[k]=Math.min(cap,Math.round((f.a[k]+g/2)*100)/100);return f.a[k]>before;};
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
    S.i=0;S.view=Math.round(25+(G.rep||5)*3)*(S.host==="fah"?1.4:1);S.peak=S.view;S.sold=0;S.good=0;S.asked=0;S.feed=[];S.cur=null;S.phase="play";S.t0=performance.now();S.dur=45000;
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
Object.assign(CARDS,{
 m_live:{c:"kati",r:"R",t:"The Camp's First Live",hint:"Stream the camp's merch for the first time",bg:"camp",need:G=>(G.flags.liveN||0)>=1,steps:[
  {n:"nar",t:"A phone propped on a stack of sandbags. Kati in the one camp shirt she ironed flattest. Front camera on. Three viewers."},
  {n:"kati",f:"flustered",l:"casual",t:"H-hello, this is Sirichai Camp. Today we have shirts for sale… Three viewers. One of them is Coach Daeng."},
  {n:"coach",t:"(Comment from the account 'Daeng Sirichai') CF 1 shirt"},
  {n:"kati",f:"happy",l:"casual",t:"Coach! You're standing right behind me! …But thank you. That's the camp's very first order."}]},
 m_livehot:{c:"fah",r:"SR",t:"The Live Blew Up",hint:"Get an S on the merch live stream",bg:"camp",need:G=>(G.flags.liveS||0)>=1,steps:[
  {n:"nar",t:"The viewer count shoots past a thousand. Orders pour in until the phone won't stop buzzing. The whole camp helps write them into Rin's notebook."},
  {n:"fah",f:"happy",l:"casual",t:"See! I told you a live needs Fah! …Wait, Fah wasn't the one streaming today? Whatever, cheering behind the camera counts!"},
  {n:"rin",f:"pout",l:"casual",t:"Every order logged. No duplicates, none missed. …There are two shirts left in storage. Who's telling customer number thirty-one?"},
  {n:"coach",t:"In Grandpa Chai's day the camp sold ten shirts a year… today we sold them in five minutes. The world really has changed."}]}});

/* ===== v1.80: redeem codes + the Loy Krathong event (a floating-market gauntlet against the helmet gang) ===== */
const REDEEM={"U0lSSUNIQUky":{k:"gate"},"TE9ZS1JBVEhPTkc2OQ==":{k:"loy",from:"2026-11-18",to:"2026-12-07"}};
function evTest(){try{return !/github\.io$/.test(location.hostname)||/evtest/.test(location.hash)||localStorage.getItem("mtm-evtest")==="1";}catch(e){return false;}}
function todayStr(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
const LOY_LADDER=["gang1","gang1","gang2","gang2","gang3","gang3","gang4","gang4","gang5"];
const LOY_TIERS=[["gold","Gold",1500],["silver","Silver",1000],["bronze","Bronze",450]];
const loyOf=G=>(G.ev||{}).loy||null;
function loyTier(sc,boss){for(const [k,n,min] of LOY_TIERS)if(sc>=min&&(k!=="gold"||boss))return {k,n};return null;}
function evGang(G,k,f){const kind=LOY_LADDER[k],K=QK[kind],t=ovr(f.a)+K.lvl+k*.12,rng=mulberry32((G.seed^0x10e)+k*131);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_evloy_"+k;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind=kind;o.grp="gang";o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=75;G.F[id]=o;syncFighterAges(G);return id;}
function redeemCode(raw){const v=(raw||"").toUpperCase().replace(/\s+/g,"");if(!v)return;let key="";try{key=btoa(v);}catch(e){}const R=REDEEM[key];
  if(!R){AU.sfx("miss");toast("Code not found. Check the spelling and try again");return;}
  if(R.k==="gate"){G.unlocked=true;try{localStorage.setItem(GATE.key,"1");}catch(e){}save();AU.sfx("level");toast("Year 2 unlocked!");return;}
  if(R.k==="loy"){const t=todayStr();if(!evTest()){if(t<R.from){toast("This code opens on Nov 18. Watch the page and Discord for the announcement");return;}if(t>R.to){toast("This year's Loy Krathong event has ended. See you next year!");return;}}
    if(loyOf(G)){toast("This save already used that code. Find the invitation in your mailbox");return;}
    G.ev=G.ev||{};G.ev.loy={got:G.week,season:G.season||1,best:0,tiers:{},runs:0};
    addMail(G,{kind:"event",ev:"loy",from:"Auntie Taew, som tam stall by the temple",title:"Loy Krathong at the floating market tonight!",body:"Manager dear, tonight I'm selling krathong at the floating-market fair. Bring the girls! Lots of food, and the som tam's on me! But I hear the helmet gang plans to make trouble… I'd feel much safer with you all there."});
    G.chatIn=G.chatIn||{};for(const id of CANON_IDS){const f=G.F[id];if(f&&f.met&&(f.bond||0)>=8&&!G.chatIn[id])G.chatIn[id]=G.week;}
    save();AU.sfx("level");toast("You got a Loy Krathong event invitation! Check your mailbox");}}
function evMailAct(m){const L=loyOf(G);if(!L)return "";const tr=loyTier(L.best,L.boss);const T=L.tiers||{};
  const ends=["bronze","silver","gold"].filter(k=>T[k]).map(k=>`<button class="btn sm" data-act="loyend" data-v="${k}">Ending: ${LOY_TIERS.find(x=>x[0]===k)[1]} · ${LOY_END[k].t}</button>`).join("");
  return `${L.runs?`<p class="meta center">Best score <b class="goldt num">${L.best}</b>${tr?` · Reward tier: <b>${tr.n}</b>`:""}</p>`:""}<button class="btn primary" data-act="evloy">${L.runs?"Take on the Riverside Brawl again":"Go to the Loy Krathong fair"}</button>
  ${L.runs?`<button class="btn" data-act="thief" ${L.thiefWk===absWeek(G)?"disabled":""}>${L.thiefWk===absWeek(G)?"Thief caught (back next week)":"Catch the Krathong Thief"}</button>`:""}
  ${L.intro?`<div class="evrep"><button class="btn sm" data-act="loyintro">Replay the opening</button>${ends}</div>`:""}
  ${T.gold?`<div class="evrep"><button class="btn sm" data-act="loydress" aria-pressed="${!!L.dressOn}">Thai dress off-stage: ${L.dressOn?"On":"Close"}</button></div>`:""}`;}
function loyIntro(G){const S=[
  {n:"nar",bg:"river",t:"The full moon of the twelfth month. The floating market by the Ping is busier than ever, krathong boats lined along the bank, candlelight glittering on the water."},
  {n:"npc",who:"Auntie Taew",t:"You made it, Manager! Auntie brought her daughter's Thai dresses for the kids to wear at the fair. Go change, quick!"},
  {n:"nar",t:"Ten minutes later"},
  {n:"kati",f:"flustered",l:"thai",t:"Manager… this dress is so tight at the waist. Do I look weird? …Don't stare so long!"}];
  if(inCamp(G,"mali"))S.push({n:"mali",f:"happy",l:"thai",t:"Kati looks gorgeous! Mali pinned her sabai herself~ And Mali's… looks pretty too, right, Manager?"});
  if(inCamp(G,"rin"))S.push({n:"rin",f:"flustered",l:"thai",t:"This pha sin limits my stride to about forty centimeters. Not ideal for fighting… but not bad either."});
  S.push({n:"npc",who:"Auntie Taew",t:"Everyone looks lovely! …But look over there. The helmet gang is back."},
  {n:"npc",who:"Big Boss Golden Helmet",t:"Everyone in this market pays us for their spot! Don't pay, pack up and go home, som tam lady!"},
  {n:"coach",t:"Easy now, no trouble… wait, they're challenging us to the makeshift ring by the pier?"},
  {n:"npc",who:"Big Boss Golden Helmet",t:"Send three. I've got nine boys. No breaks, no mercy. If your camp wins, my gang never sets foot in this market again!"},
  {n:"kati",f:"happy",l:"thai",t:"I accept the challenge! Auntie Taew says this pha sin stretches, so it won't rip in a fight! Pick who goes, Manager!"});
  return S;}
const LOY_END={
 bronze:{t:"The Helmet Gang Retreats",steps:[{n:"nar",bg:"river",t:"The helmet gang's goons retreat to the far bank. They haven't given up, but they won't come near Auntie Taew's stall again."},
  {n:"npc",who:"Auntie Taew",t:"Well done, kids! Auntie sold so many more krathongs. Here, pocket money for everyone."},
  {n:"kati",f:"happy",l:"thai",t:"They'll be back next year for sure. I'll train even harder!"},
  {n:"nar",t:"Squeaking comes from under the pier. A tiny otter is tangled in krathong string. Kati kneels to free it, the hem of her pha sin soaking wet."},
  {n:"kati",f:"flustered",l:"thai",t:"It followed me, Manager… it won't leave. Can we keep it at camp? We can, right?"}]},
 silver:{t:"The Whole Market Cheers",steps:[{n:"nar",bg:"river",t:"The whole floating market crowds around the makeshift ring. The cheers drown out the fireworks."},
  {n:"coach",t:"Not bad… but you haven't reached the boss yet. There's still time this year."},
  {n:"npc",who:"Auntie Taew",t:"Those Thai dresses are yours to keep. Wear them anywhere. Auntie's happy they got worn for something good."},
  {n:"kati",f:"flustered",l:"thai",t:"Manager… Auntie Taew gave me a krathong. Want to float it together? …Just one. She only gave me one."}]},
 gold:{t:"The Golden Helmet Floats Away",steps:[{n:"nar",bg:"river",t:"Big Boss Golden Helmet crashes onto the pier. His golden helmet rolls into the river and floats off with a hundred krathongs."},
  {n:"npc",who:"Big Boss Golden Helmet",t:"My helmet!! …Fine, fine! I won't come to this market again. This year! Just this year!"},
  {n:"npc",who:"Auntie Taew",t:"Auntie's sewn extra Thai dresses for all of you. Wear them on outings, dates, anywhere!"},
  {n:"kati",f:"flustered",l:"thai",t:"…Manager, can I wear this on a date? …Not a date! An outing! An outing!"},
  {n:"nar",t:"The name Sirichai Gym echoes across the floating market all night, and for many nights after."}]}};
const LOY_THIEF={name:"Tum the Krathong Thief",
 line:{kati:"Give it back right now! That krathong belongs to the grandma next door to me!",mali:"Mali helped Auntie fold that krathong! Give it back!",rin:"I counted. You took seventeen. Return every one of them.",ploy:"This dress is expensive. But if I have to dive in for them myself, I won't hesitate.",fah:"Fah's seen you since last year! You're not getting away this time!"},
 pre:[{n:"nar",bg:"river",t:"Splash! Someone dives in, fishing coins out of the villagers' krathongs by the plastic-bagful."},
  {n:"npc",who:"Auntie Taew",t:"Tum again! He fishes coins out of people's krathongs every year. This year he took the whole krathongs!"},
  {n:"npc",who:"Tum the Krathong Thief",t:"The krathongs floated to me, so I took 'em! Want 'em back? Come up on the pier!"}],
 win:[{n:"nar",bg:"river",t:"Tum hits the water with a splash. The coin bag bobs on the surface, and the villagers fish it out for the temple."},
  {n:"npc",who:"Auntie Taew",t:"Well done, dear! Here's a share of tonight's krathong sales. Buy the kids at camp some milk."}],
 lose:[{n:"nar",bg:"river",t:"Tum laughs and dives in with the bag of coins… but the bag rips mid-river and every coin sinks."},
  {n:"npc",who:"Tum the Krathong Thief",t:"Hey! My coins!! …See you next year!"},{n:"npc",who:"Auntie Taew",t:"Never mind, dear. At least he didn't get anything."}]};
function evStartLoy(){const L=loyOf(G);if(!L)return;UI.modal=null;
  const open=()=>{L.run=null;L.pick=[];UI.modal={type:"gaunt"};render();};
  if(!L.intro){L.intro=1;save();playScene(loyIntro(G),open,{bg:"river",look:"thai"});}else open();}
function gauntPool(){const R=roster(G).filter(f=>!f.injury);return R.length?R:roster(G);}
// v1.82.4: the five riverside SR cards as a collection row — owned cards in colour, missing ones dark, with a "play again" nudge
function loyCardRow(after){const own=G.cards||{},got=LOY_CARDS.filter(k=>own[k]).length,left=LOY_CARDS.length-got;
  const row=LOY_CARDS.map(k=>{const C=CARDS[k],has=!!own[k];return `<div class="ccard pxc lk ${has?"":"lock"}" style="--rc:${CARD_R.SR.c}" title="${has?esc(C.t):"Not yet earned"}">${cardArtHTML(C,true)}<small>${has?esc(G.F[C.c].name):"?"}</small></div>`;}).join("");
  const msg=!left?`<b class="goldt">Thai-dress SR set complete: all ${LOY_CARDS.length} cards!</b> Keep playing for a high score or the endings you haven't seen yet`
    :after?`<b>Cards still missing: ${left}</b> · This battle can be replayed any time. Tap "Challenge again" to complete the set · send a girl without her card first to get it`
    :`<b>Thai-dress SR cards ${got}/${LOY_CARDS.length}</b> · Bronze finish gives 1 card, Silver 2, Gold 3 · whoever fights first gets her card first · replay until you have them all`;
  return `<div class="lkrow"><div class="lkcards">${row}</div><p class="meta">🎴 ${msg}</p></div>`;}
function gauntHTML(){const L=loyOf(G);if(!L){UI.modal=null;return "";}const R=L.run;
  const head=`<h2>Loy Krathong Riverside Brawl</h2><p class="meta">Three fighters, three bouts each in a row. HP barely recovers between bouts; lose and the next fighter steps in · The last bout is Boss Golden Helmet</p>${!R?loyCardRow():""}`;
  const ladder=(cur)=>`<div class="gl">${LOY_LADDER.map((k,i)=>{const lg=R&&R.log[i];const st=lg?(lg.res==="W"?"ok":lg.res==="D"?"dr":"ng"):R&&i===cur?"now":"";
    return `<div class="glr ${st}"><canvas width="40" height="40" data-qsprite="${QK[k].sprite}"></canvas><span><b>${i+1}. ${esc(QK[k].name)}</b><small>${lg?lg.txt:R&&(R.done||i<cur)?"Skipped (previous fighter lost)":i===8?"Boss · 3 rounds":"2 rounds"}</small></span><i>${lg?(lg.res==="W"?"+"+lg.pts:lg.res==="D"?"+"+lg.pts:"✕"):""}</i></div>`;}).join("")}</div>`;
  if(!R){const pool=gauntPool(),P=L.pick||[];const need=Math.min(3,pool.length);
    return head+`<p><b>Choose your fighter order</b> <small class="meta">(${P.length}/${need}) tap fighters in the order they go in</small></p><div class="gpick">${pool.map(f=>{const i=P.indexOf(f.id);
      return `<button class="gpk ${i>=0?"on":""}" data-act="gpick" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>Lv.${f.lvl} · Fatigue ${Math.round(f.fatigue)}</small></span>${i>=0?`<i>${i+1}</i>`:""}</button>`;}).join("")}</div>
      ${pool.length<3?`<p class="meta">Your camp has fewer than three fighters, so some will go again (full HP each new turn)</p>`:""}
      <div class="center endbtns"><button class="btn primary" data-act="gstart" ${P.length<need?"disabled":""}>Start</button><button class="btn" data-act="closeModal">Later</button></div>${ladder(-1)}`;}
  if(R.done){const tr=loyTier(R.score,R.boss);return head+`<div class="gres2"><p class="meta">Total score</p><p class="gsc num">${R.score}</p>${tr?`<span class="pill gold">Reward tier: ${tr.n}</span>`:`<span class="pill">No reward tier yet (Bronze ${LOY_TIERS[2][2]})</span>`}
    ${(R.got||[]).length?`<ul class="glist">${R.got.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}${loyCardRow(1)}<p class="meta">Best ${L.best} · Gold ${LOY_TIERS[0][2]}+ and Big Boss Golden Helmet must fall</p></div>
    <div class="center endbtns">${R.newEnd?`<button class="btn gold" data-act="loyend" data-v="${R.newEnd}">Watch the ending (new!)</button>`:""}<button class="btn primary" data-act="gretry">Challenge again</button><button class="btn" data-act="closeModal">Back to camp</button></div>${ladder(-1)}`;}
  const f=G.F[R.order[R.slot]];
  return head+`<div class="gnow"><p class="meta">Score <b class="goldt num">${R.score}</b> · Fighter ${R.slot+1}/3 · Bout ${R.k+1}/9</p>
    <div class="gcur">${faceImg(f)}<span><b>${esc(f.name)}</b><small>HP ${Math.round(R.hp)} · Stamina ${Math.round(R.sta)}</small><div class="meter"><i style="--v:${clamp(R.hp,0,100)}%;--bc:${R.hp>50?"var(--green)":R.hp>25?"var(--warn)":"var(--red)"}"></i></div></span></div></div>
    <div class="center endbtns"><button class="btn primary" data-act="gfight">Fight bout ${R.k+1}</button><button class="btn" data-act="gquit">End the brawl (keep your score)</button></div>${ladder(R.k)}`;}
function gauntNextSlot(R){R.slot++;R.j=0;R.k=R.slot*3;R.hp=100;R.sta=100;if(R.slot>=3||R.k>=9)gauntFinish(R);}
function gauntFinish(R){const L=loyOf(G);R.done=true;L.runs=(L.runs||0)+1;L.best=Math.max(L.best||0,R.score);if(R.boss)L.boss=1;R.got=[];
  const tr=loyTier(R.score,R.boss);const order=["bronze","silver","gold"];
  if(tr){for(const k of order.slice(0,order.indexOf(tr.k)+1))if(!L.tiers[k]){L.tiers[k]=1;R.newEnd=k;R.got.push(...loyReward(k));}const nC={bronze:1,silver:2,gold:3}[tr.k]||1;for(let i=0;i<nC;i++){const c=loyCardDrop(G,R.order);if(c)R.got.push(c);else break;}}
  for(let i=0;i<9;i++)delete G.F["q_evloy_"+i];save();}
function loyReward(k){const out=[];
  if(k==="bronze"){G.cash+=3000;out.push("Prize money from Auntie Taew ฿3,000");if(typeof PETS!=="undefined"&&PETS.otter&&typeof adoptPet==="function"&&!hasPet(G,"otter")){adoptPet(G,"otter",null,"kati");UI.petName=G.pets.length-1;out.push("A little otter followed you back to camp! (Give it a name)");}}
  if(k==="silver"){G.cash+=5000;out.push("Prize money ฿5,000");out.push("Thai dress unlocked on character profiles");}
  if(k==="gold"){G.rep+=1.5;out.push("Fame +1.5");if(typeof loyGold==="function"){const c=loyGold(G);if(c)out.push(c);}}
  return out;}
function gauntAfter(){const L=loyOf(G),R=L&&L.run,F=LASTF;if(!R||!F){UI.modal={type:"gaunt"};render();return;}
  const r=F.result,res=r.win==="D"?"D":r.win==="A"?"W":"L",rds=R.k===8?3:2;let pts=0,txt="";
  if(res==="W"){if(R.k===8)G.goldHelmetWins=(G.goldHelmetWins||0)+1;pts=100+(/KO|น็อก/.test(r.type||"")?60:0)+Math.max(0,rds-F.round)*30+Math.round(Math.max(0,F.A.hp)*.6);txt=/KO|น็อก/.test(r.type||"")?`Won by KO, round ${F.round}`:"Decision win";if(R.k===8)R.boss=1;}
  else if(res==="D"){pts=30;txt="Draw";}else txt=/KO|น็อก/.test(r.type||"")?`Lost by KO, round ${F.round}`:"Lost on points";
  R.log[R.k]={res,pts,txt};R.score+=pts;
  if(res==="L")gauntNextSlot(R);
  else{R.hp=Math.min(100,Math.max(0,F.A.hp)+15);R.sta=Math.min(100,Math.max(0,F.A.sta)+20);R.j++;R.k++;if(R.j>=3)gauntNextSlot(R);else if(R.k>=9)gauntFinish(R);}
  save();UI.modal={type:"gaunt"};render();}
Object.assign(ACT,{
  goldrematch:()=>{if(!goldRematchReady(G))return;const f=roster(G).find(f=>!f.injury);if(!f){toast("All fighters are injured");return;}G.gangRematchAt=campWeekIndex(G)+4;save();startQuest({q:"gang",qk:"gang5",rematch:true},f.id,()=>{});},
  redeem:()=>{const el=document.getElementById("redeemcode");redeemCode(el&&el.value);if(el)el.value="";render();},
  evloy:()=>evStartLoy(),
  gpick:d=>{const L=loyOf(G);if(!L)return;L.pick=L.pick||[];const i=L.pick.indexOf(d.v);if(i>=0)L.pick.splice(i,1);else if(L.pick.length<Math.min(3,gauntPool().length))L.pick.push(d.v);render();},
  gstart:()=>{const L=loyOf(G);if(!L)return;const P=L.pick||[];if(!P.length)return;const order=[0,1,2].map(i=>P[i%P.length]);
    L.run={order,slot:0,j:0,k:0,hp:100,sta:100,score:0,log:[],boss:0};save();render();},
  gfight:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;const f=G.F[R.order[R.slot]];const qid=evGang(G,R.k,f);
    const bk={id:"bev"+R.k,a:f.id,b:qid,week:G.week,tier:"evloy",rounds:R.k===8?3:2,ev:1,carry:{hp:R.hp,sta:R.sta},bg:"bg_river.webp"};
    UI.modal=null;openFight2(bk,gauntAfter);},
  gquit:()=>{const L=loyOf(G),R=L&&L.run;if(!R||R.done)return;gauntFinish(R);render();},
  gretry:()=>{const L=loyOf(G);if(!L)return;L.run=null;L.pick=[];render();},
});

/* ===== v1.81: Loy Krathong round 2 — Thai-dress scenes, SR cards, the krathong thief, the otter, Thai dress off-stage ===== */
const LOY_CARDS=["lk_kati","lk_mali","lk_rin","lk_ploy","lk_fah"];
(()=>{
const LOY_HINT="Loy Krathong 2026 event · from the Riverside Brawl",LG_HINT="Loy Krathong gacha · festival only, Nov 18 – Dec 7";
const T=(n,f,t)=>({n,f,l:"thai",t}),N=t=>({n:"nar",t}),P=(who,t)=>({n:"npc",who,t});
Object.assign(CARDS,{
 lk_kati:{c:"kati",r:"SR",ev:1,t:"Lost at Loy Krathong",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
  N("Fireworks crack between luk thung songs from the ramwong stage. A little boy stands crying by a meatball stall, clutching a half-crumbled bread krathong."),
  T("kati","sad","Manager, that boy's been standing there for ten minutes. No one's even asked him."),
  N("Before you can answer, Kati is already weaving through the crowd to crouch in front of the boy, the hem of her pha sin dragging on the ground."),
  T("kati","happy","Don't cry. I'm Kati, and that guy over there is the Manager. He's really nice. We'll help you find your mom."),
  P("Little Boy","Mom told me to wait here… but someone stepped on my krathong. Mom's gonna be mad."),
  {choice:[{t:"\"I'll buy you a new krathong.\"",fx:G=>{G.cash-=40;add(G,"kati","bond",2);},then:[N("You buy a banana-leaf krathong from the next stall. The boy stops crying instantly, like someone hit a switch."),T("kati","flustered","…You know, Manager, Grandpa bought me a krathong just like that once, when I got lost at a temple fair.")]},
   {t:"\"Ride on Kati's shoulders so you can see your mom.\"",fx:G=>add(G,"kati","bond",3),then:[N("Kati hoists him onto her shoulders without a second thought. Her pha sin has to hitch up a little, but she doesn't care."),T("kati","happy","High enough? Look for your mom! Your eyes might be sharper than a boxer's!")]}]},
  P("Little Boy","There's Mom! She's by the khanom khrok boat!"),
  N("The boy's mother runs over, thanks them again and again, then presses two bags of khanom khrok into Kati's hands."),
  P("Little Boy","Kati… is that guy your boyfriend?"),
  T("kati","flustered","Huh!? No! He's the manager! …Not yet— no… No! Go with your mom already!"),
  N("The boy waves goodbye, leaving a red-faced Kati in the middle of the fair beside you, the khanom khrok still warm in her hands."),
  T("kati","flustered","…Let's take one bag each. And… what I said just now, don't think about it. I only got one word wrong.")]},
 lk_mali:{c:"mali",r:"SR",ev:1,t:"Pageant Stand-In",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
  N("The call for Nang Noppamas contestants rings out for the third time. Number seven isn't coming; she suddenly fell ill."),
  N("Auntie Taew, sitting as a judge, turns to look at Mali in her blue Thai dress and smiles the smile everyone at the market knows you can't escape."),
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
 lk_rin:{c:"rin",r:"SR",ev:1,t:"Destined Match by the River",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lk_ploy:{c:"ploy",r:"SR",ev:1,t:"Ditching the Photo Shoot",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lk_fah:{c:"fah",r:"SR",ev:1,t:"Lantern Showdown",hint:LOY_HINT,bg:"river",need:()=>false,steps:[
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
 lg_kati_r:{c:"kati",r:"R",lg:1,t:"Scalded Tongue",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_mali_n:{c:"mali",r:"N",lg:1,t:"A Bread Krathong for the Fish",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_rin_n:{c:"rin",r:"N",lg:1,t:"Ping River Krathong Stats",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Rin stands on the pier with a tally counter, clicking every time a krathong floats past."),
  T("rin","happy","1,284 this hour. 3% are foam, down 9% from last year. I'll send this data to the municipality."),
  T("rin","flustered","…You don't need to make that face, Manager. I can float krathongs too. Just after I finish counting."),
  N("At one a.m. Rin floats her own little banana-leaf krathong as number 4,071, and clicks the counter for it too.")]},
 lg_rin_r:{c:"rin",r:"R",lg:1,t:"Selfie Fail",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
 lg_ploy_n:{c:"ploy",r:"N",lg:1,t:"Thai-Dress Billboard",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("A three-meter sports-drink billboard stands at the fair entrance: Ploy in Thai dress, holding a krathong, smiling wide."),
  N("The real one stands right under it, in a cap and a face mask."),
  T("ploy","flustered","Don't stare at the sign so long… I was so sleepy that day. That smile took forty retakes."),
  T("ploy","happy","But if you want to take a photo with the sign, I won't mind. That's the best smile of my life.")]},
 lg_ploy_r:{c:"ploy",r:"R",lg:1,t:"One Krathong, Ten Years Ago",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Ploy sits at the end of the pier, feet dangling, watching the krathongs drift past one by one."),
  T("ploy","sad","My first year at Golden Tiger I was twelve. Everyone went home to float krathongs with their families. I was the only one left."),
  T("ploy","sad","The boss gave me fifty baht for a krathong. I bought one and never floated it. Just held it until the candle burned out."),
  {choice:[{t:"\"You're not alone this year.\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…I know. You don't have to say it. But now that you have… it's fine.")]},
   {t:"Hand her a spare candle",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","In case the candle goes out again? …You're as prepared as a real cornerman.")]}]}]},
 lg_ploy_sr:{c:"ploy",r:"SR",lg:1,t:"The Night No One Recognized Her",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Ploy wears a cat mask from a toy stall, hair tucked under a cap. Not a single person at the fair looks her way."),
  T("ploy","happy","Three hours and not one photo request. I haven't walked a fair like this since I was a kid."),
  N("Ploy eats two meatball skewers, wins a teddy bear at the shooting gallery, and laughs out loud every time you miss."),
  {choice:[{t:"\"This cat shoots better than the champion.\"",fx:G=>add(G,"ploy","bond",2),then:[T("ploy","happy","Well, the champion's the one wearing the mask.")]},
   {t:"\"The mask suits you, but you're prettier without it.\"",fx:G=>add(G,"ploy","bond",3),then:[T("ploy","flustered","…Right now I'm glad I'm wearing a mask, because my face is completely red.")]}]},
  N("Before you part, Ploy shoves the teddy bear into your hands."),
  T("ploy","flustered","Keep it at your camp. If I ever get tired of being the Ploy everyone recognizes, I'll come visit it. …Not you. It.")]},
 lg_fah_n:{c:"fah",r:"N",lg:1,t:"The Giant Firecracker",hint:LG_HINT,bg:"river",need:()=>false,steps:[
  N("Fah lugs in a cloth bag stuffed with firecrackers, looking as proud as if she'd just won a fight."),
  T("fah","happy","This one's the biggest in the shop! Fah's lighting it right here so the whole market knows Fah's arrived!"),
  P("Auntie Taew","Silver-top! Light that here and Auntie'll spank you striped! Go light it over there!"),
  T("fah","pout","…Yes sir, Auntie— I mean, yes ma'am! Manager, hold the bag. Fah's moving to the other side, quietly.")]},
 lg_fah_r:{c:"fah",r:"R",lg:1,t:"The Big Firework",hint:LG_HINT,bg:"river",need:()=>false,steps:[
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
function loyCardDrop(G,order){G.cards=G.cards||{};const left=LOY_CARDS.filter(k=>!G.cards[k]);if(!left.length)return null;
  const pref=(order||[]).map(id=>"lk_"+id).filter(k=>left.includes(k));const L=loyOf(G);const id=pref[0]||left[((L&&L.runs)||0)%left.length];
  G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};if(G.F[CARDS[id].c])add(G,CARDS[id].c,"bond",3);G.dust=(G.dust||0)+5;
  return `New SR card: "${CARDS[id].t}" (see it in the album)`;}
function loyGold(G){const L=loyOf(G);if(!L)return null;L.dressOn=1;return "Thai dress off-stage unlocked: the girls wear Thai dress in outings and dates (toggle it in Auntie Taew's letter)";}
const loyThaiLook=G=>!!(G&&G.ev&&G.ev.loy&&G.ev.loy.tiers&&G.ev.loy.tiers.silver);
function evThief(G,f){const K=QK.gang1,t=Math.max(6,ovr(f.a)+K.lvl-1.2),rng=mulberry32((G.seed^0x7a1)+absWeek(G)*17);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const id="q_evthief";
  const o=baseFighter(id,{name:LOY_THIEF.name,full:LOY_THIEF.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  o.sprite=K.sprite;o.kind="gang1";o.grp="gang";o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=70;G.F[id]=o;return id;}
function thiefHTML(){const pool=gauntPool();return `<h2>Catch the Krathong Thief</h2><p class="meta">A silly 2-round bout · no injuries, no effect on records · win to earn krathong money from Auntie Taew · once per week</p>
  <div class="gpick">${pool.map(f=>`<button class="gpk" data-act="thiefgo" data-v="${f.id}">${faceImg(f)}<span><b>${esc(f.name)}</b><small>Lv.${f.lvl} · Fatigue ${Math.round(f.fatigue)}</small></span></button>`).join("")}</div>
  <div class="center endbtns"><button class="btn" data-act="closeModal">Later</button></div>`;}
function thiefGo(fid){const L=loyOf(G);if(!L)return;const f=G.F[fid];if(!f)return;UI.modal=null;
  const pre=[...LOY_THIEF.pre,f.canon&&LOY_THIEF.line[fid]?{n:fid,f:"angry",l:"thai",t:LOY_THIEF.line[fid]}:{n:"nar",t:`${f.name} steps onto the pier and rolls up their sleeves`}];
  playScene(pre,()=>{const qid=evThief(G,f);const bk={id:"bthief",a:fid,b:qid,week:G.week,tier:"evloy",rounds:2,ev:1,bg:"bg_river.webp"};
    openFight2(bk,()=>{const F=LASTF,win=F&&F.result&&F.result.win==="A";L.thiefWk=absWeek(G);delete G.F.q_evthief;
      if(win){const c=1200;G.cash+=c;G.rep+=.2;L.thiefN=(L.thiefN||0)+1;}save();
      playScene(win?[...LOY_THIEF.win,{n:"nar",t:`Krathong fee ฿1,200 · Fame +0.2`}]:LOY_THIEF.lose,()=>{AU.startMusic("hub");UI.tab="home";save();render();},{bg:"river",look:"thai"});});},{bg:"river",look:"thai"});}
Object.assign(ACT,{
  loyintro:()=>{UI.modal=null;playScene(loyIntro(G),()=>{AU.startMusic("hub");render();},{bg:"river",look:"thai"});},
  loyend:d=>{const E=LOY_END[d.v];if(!E)return;const L=loyOf(G);if(L&&L.run&&L.run.newEnd===d.v)L.run.newEnd=null;UI.modal=null;
    playScene(E.steps,()=>{AU.startMusic("hub");if(L&&L.run&&L.run.done)UI.modal={type:"gaunt"};render();},{bg:"river",look:"thai"});},
  thief:()=>{const L=loyOf(G);if(!L||L.thiefWk===absWeek(G))return;UI.modal={type:"thief"};render();},
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
 g_mali_sr:{main:[{n:"mali",f:"flustered",l:"casual",t:"…If you got to the part about you being kind, never mind. That part's true."},cN("Mali folds the letter into an envelope but doesn't seal it."),{n:"mali",f:"sad",l:"casual",t:"I write to Mom every month, but I've never sent one. I'm scared she'll find out I'm still boxing."},{n:"mali",f:"happy",l:"casual",t:"Maybe I'll send this one… if you add a line at the end for me~"}],lv2:[cN("Two weeks later the postman brings a blue envelope to the camp, addressed to Mali."),{n:"mali",f:"happy",l:"casual",t:"Mom wrote back!! …She says 'Please thank the Manager for looking after my girl.'"},{n:"mali",f:"flustered",l:"casual",t:"What did you write at the end of my letter!? Mom's asking if you're my boyfriend!"}],lv3:[cN("Sunday morning, a woman in a jasmine-print blouse stands at the gate holding a huge tiffin carrier."),{n:"mali",f:"flustered",l:"casual",t:"Mom!? How did you get here? You didn't even tell me!"},cP("Mali's mother","I came to see if you're really eating well. Your letter said you'd put on weight. I had to see for myself."),cN("Mali's mother watches her kick pads by the ring all afternoon without saying a word."),cP("Mali's mother","You kick better than your father ever did… I won't stop you any more. But three meals a day."),{choice:[{t:"\"I'll make sure she eats all three.\"",then:[{n:"mali",f:"happy",l:"casual",t:"Mom! Did you hear? The Manager promised~"}]},{t:"Invite her to eat with the whole camp",then:[cN("The five-tier tiffin is empty in ten minutes. Coach Daeng asks for three curry recipes.")]}]},{n:"mali",f:"happy",l:"casual",t:"This is the best day of my year. Better than any win."}],lv3t:"Mom Visits the Camp"},
 g_rin_sr:{main:[cN("Rin picks up another pen and strikes out the question mark after X."),{n:"rin",f:"happy",l:"casual",t:"I've tried every value. Salary, fame, opportunity. None of them balance the equation."},{n:"rin",f:"flustered",l:"casual",t:"There's one value left I haven't tried, and I don't dare write it down."}],lv2:[cN("The next day the same sheet is taped to the whiteboard in the tape room."),cN("The last line now reads 'X = this camp', written over another word that wasn't fully erased."),{n:"rin",f:"flustered",l:"casual",t:"…Don't try to read the erased word. The ink just bled, that's all."}],lv3:[cN("Rin sends a schedule by chat, titled 'Field Experiment No. 1'."),{n:"rin",f:"happy",l:"casual",t:"Hypothesis: if we go to the same café together five times, X stays constant. I need data."},cN("Visit one, Rin notes everything. Visit three, less. Visit five, she forgets to open her notebook."),{n:"rin",f:"flustered",l:"casual",t:"…The data for visit five is missing. I was too busy listening to you to write anything."},{choice:[{t:"\"Then we'll have to run it five more times.\"",then:[{n:"rin",f:"happy",l:"casual",t:"Agreed. Scientifically, results must be repeatable."}]},{t:"\"So what were the results?\"",then:[{n:"rin",f:"flustered",l:"casual",t:"Conclusion: X is constant. And I won't tell you its value."}]}]},{n:"rin",f:"happy",l:"casual",t:"I keep the notes from visits one to five in a locked drawer. Classified data."}],lv3t:"Testing the Hypothesis"},
 g_ploy_sr:{main:[cN("Ploy quickly tucks the photo away, but she doesn't walk off."),{n:"ploy",f:"happy",l:"casual",t:"Mom stopped coming to my fights in my second year. Said her heart couldn't take it. But after every fight she calls to ask how it went."},{n:"ploy",f:"flustered",l:"casual",t:"You're the first person I've told. Don't tell anyone. Especially not Fah."}],lv2:[cN("At Ploy's next fight you spot a woman at the very back of the hall, a wide-brimmed hat hiding her face."),cN("Ploy wins, and bows to the back of the hall before she bows to the judges."),{n:"ploy",f:"happy",l:"casual",t:"I know you sent Mom that ticket… Don't deny it. She told me everything."}],lv3:[cN("Ploy meets you at an old photo studio in town, the same one that took that picture twenty years ago."),{n:"ploy",f:"happy",l:"casual",t:"Mom wants a new photo to keep next to the old one. So I came… but I didn't want to be in it alone."},cP("Photographer","Sir, a little closer. Yes. Miss, a smile please. Like when you win."),{n:"ploy",f:"flustered",l:"casual",t:"Like when I win? I never smile when I win… Will this do?"},{choice:[{t:"Pull a silly face as the shutter clicks",then:[cN("Ploy bursts out laughing and the photographer catches it. It's the widest smile she's ever had in a photo.")]},{t:"Stand still and smile",then:[cN("The photo comes out neat and lovely. Ploy studies it, then asks for one more. In the second she leans her head on your shoulder.")]}]},{n:"ploy",f:"happy",l:"casual",t:"Now I carry two photos. The old one is the person who was scared for me. The new one is the person who stands beside me."}],lv3t:"The Second Photo"},
 g_fah_sr:{main:[cN("Fah watches until the rainbow fades completely before she turns back."),{n:"fah",f:"happy",l:"casual",t:"Mom used to dance in the rain, soaked and laughing. Dad said she was crazy. I thought she was the coolest."},{n:"fah",f:"pout",l:"casual",t:"Every time it rains I want to go stand in the yard, but I'm scared everyone will call me crazy too."}],lv2:[cN("One afternoon it pours. Fah stares out at the yard."),cN("You step out into the rain first and wave her over."),{n:"fah",f:"happy",l:"casual",t:"You're crazy!! …Wait for me!!"},{n:"fah",f:"flustered",l:"casual",t:"It's freezing… but I haven't had this much fun in ages."}],lv3:[cN("The first rain of the season. All of Sirichai Camp is out in the yard, because Fah dragged everyone out herself."),{n:"fah",f:"happy",l:"casual",t:"Fah's rule! First rain of the year, everybody dances. No hiding under the roof!"},{n:"coach",t:"You'll all catch colds… Fine, I'll dance one song."},{choice:[{t:"Do the robot for Fah",then:[{n:"fah",f:"happy",l:"casual",t:"Hahaha, you're the worst dancer in the world! Again! Again!"}]},{t:"Take Fah's hands and spin around the yard",then:[{n:"fah",f:"flustered",l:"casual",t:"…You're spinning too fast! …Don't let go."}]}]},cN("The rain stops at dusk and a rainbow arches over the river again. Fah doesn't point it out. Everyone's already looking."),{n:"fah",f:"happy",l:"casual",t:"Mom… I found someone who'll be crazy with me."}],lv3t:"Dancing in the Rain"},
 g_team_ssr:{main:[{n:"coach",t:"Old Chai bought this roll the day the camp nearly closed. Said he'd save it for the group that brought the camp back."},{n:"kati",f:"sad",l:"casual",t:"…Did Grandpa know this day would come?"},{n:"coach",t:"He didn't know. He just believed. Sometimes that's more than knowing."}],lv2:[cN("The film comes back from the lab and everyone crowds around the enlargement."),{n:"mali",f:"happy",l:"casual",t:"My eyes are closed!! Why didn't anyone tell me!!"},{n:"rin",f:"happy",l:"casual",t:"I counted. Everyone in this photo is smiling 100%, except Coach Daeng at 60%."},{n:"coach",t:"That IS my full smile. My face just looks like this."}],lv3:[cN("A year after the group photo, Coach Daeng hauls Old Chai's klong khaek drum into the yard."),{n:"coach",t:"In Chai's day, once a year the whole camp kicked the bags to the drum together. Lose the beat and you washed dishes for a week."},{n:"kati",f:"happy",l:"casual",t:"I remember! I lost it every year. Washed dishes till my hands wrinkled."},cN("Everyone takes a bag, and the drumsticks are pressed into the Manager's hands."),{n:"coach",t:"Today the Manager drums. If the beat slips, the Manager does the dishes."},{n:"kati",f:"happy",l:"casual",t:"Manager! Give us the first beat! (Play the card's minigame from the card page)"}],lv3t:"One Beat, One Camp",mg:"bag",mgt:"Drum the beat for the whole camp"},
 g_mali_ssr:{lv2:[cN("Two weeks later, a big parcel arrives from Isan, addressed to 'the manager,' not to Mali."),cN("Inside are sticky rice, a jar of jaew bong chili paste and a letter in big, careful handwriting."),cN("'To the manager. I had the neighbor's kid write this for me. Tell Mali to go to bed early. And thank you for making my girl laugh every time she calls.'"),{n:"mali",f:"pout",l:"casual",t:"Mom sent more to the manager than to me! …I'm not jealous. Just a little."}],lv3:[cN("At the Rocket Festival, Mali brings you back to the village. This time her mom has a som tam stall at the temple fair."),cP("Mali's mom","The customers are piling up! Mali, take that mortar. Manager, this one. Quick, quick!"),{n:"mali",f:"happy",l:"casual",t:"Do you know how to pound som tam? If not, no problem. Just pound to the mor lam drums from the stage."},{n:"mali",f:"happy",l:"casual",t:"Ready? First mortar! (Play the card's minigame from the card page)"}],lv3t:"Mali's Mom's Som Tam Stall",mg:"somtam",mgt:"Help Mali's mom pound som tam at the temple fair"},
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
 lg_ploy_r:{lv2:[{n:"nar",t:"That night Ploy floats this year's krathong with a small folded paper tucked inside."},{n:"ploy",f:"sad",l:"thai",t:"The receipt for fifty baht, ten years ago. I always kept it in my wallet."},{n:"ploy",f:"happy",l:"thai",t:"Time to let it go… That krathong finally gets to float."}],lv3:[{n:"nar",t:"A year later Ploy brings five young Golden Tiger trainees who couldn't go home to the festival."},{n:"ploy",f:"happy",l:"thai",t:"Fifty baht each. Buy the one you like, and you have to float it. No holding it till the candle dies."},{n:"nar",t:"The five scatter through the stalls, Ploy checking on each like the eldest sister."},{choice:[{t:"\"You're a good big sister.\"",then:[{n:"ploy",f:"flustered",l:"thai",t:"…I'm just doing what I wish someone had done for me at twelve."}]},{t:"Help Ploy light the kids' candles",then:[{n:"nar",t:"Five candles light together; the kids count one, two, three and let go at once."}]}]},{n:"ploy",f:"happy",l:"thai",t:"I'll bring them again next year… and to your camp too. They should learn boxing isn't only about winning."}],lv3t:"Fifty Baht"},
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

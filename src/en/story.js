// ================= MUAY THAI MOE — STORY & DATING CONTENT =================
// Scene step: {n:speaker, f:face, t:text|fn} | {choice:[{t,fx,then:[...]}]} | {fx:fn} | {bg:key}
// v1.38: rotate through variants so recurring scenes do not repeat word for word
const vary=(key,arr)=>{if(typeof G==="undefined"||!G)return arr[0];G.vary=G.vary||{};const i=G.vary[key]||0;G.vary[key]=i+1;return arr[i%arr.length];};
const ME=G=>G.player.name,
 // v1.41: the girls call you "ผู้จัดการ" — your name slips out now and then once close, and always once very close
 MEM=(G,k)=>{G.mem=G.mem||{};G.mem[k]=absWeek(G);}, HAS=(G,k,gap)=>G.mem&&G.mem[k]!==undefined&&absWeek(G)-G.mem[k]>=(gap||0),
 CALL=(G,id)=>{const f=G.F[id],b=f?f.bond||0:0;if(isLov(G,id)||b>=75)return G.player.name;if(b>=40&&Math.random()<.35)return G.player.name;return "Manager";}, PR=G=>G.player.gender==="m"?"":"", PA=G=>G.player.gender==="m"?"":"It is";
const SPK={kati:{name:"Kati",color:"#e23b4e"},mali:{name:"Mali",color:"#4a7fe0"},rin:{name:"Rin",color:"#3fae6a"},
  ploy:{name:"Ploy",color:"#9b62e0"},fah:{name:"Fah",color:"#e7b443"},pailin:{name:"Pailin",color:"#8e4ac3"},baibua:{name:"Baibua",color:"#e86fa0"},tabtim:{name:"Tubtim",color:"#d23246"},alicia:{name:"Alicia",color:"#2f62c8"},chaba:{name:"Chaba",color:"#1f9a7a"},lada:{name:"Ladda",color:"#d8263a"},coach:{name:"Coach Daeng",color:"#c98a5a"},nar:{name:""},me:{name:"(You)"}};
const HONOR_LABEL={local:"Subdistrict round champion",district:"District round champion",province:"Provincial champion",belt:"Tha Phae Stadium champion",defense:"Tha Phae Stadium title defense",dm:"Death Match champion",rg_north:"Northern Regional Cup",rg_isan:"Isan Regional Cup",rg_central:"Central Regional Cup",rg_south:"Southern Regional Cup"};
function honorLabel(kind,venue){if(venue&&typeof STADIUMS!=="undefined"&&STADIUMS[venue]&&(kind==="belt"||kind==="defense"))return (kind==="belt"?"Champion of ":"Defended title at ")+STADIUMS[venue].name;return HONOR_LABEL[kind]||"Champion";}
function honorSteps(G,h){const f=G.F[h.id],label=honorLabel(h.kind,h.venue),ranked=h.kind==="local"||h.kind==="district";
  return [{n:"nar",t:ranked?`The ${h.kind==="local"?"subdistrict":"district"} standings are final. ${f.name} takes first place, and the referee calls her back to center ring.`:`The final bell rings. The referee raises ${f.name}'s arm in center ring as the crowd roars.`},
    {n:"npc",who:"Ring announcer",t:`Ladies and gentlemen! The Division ${h.div} ${label} is… ${f.name} of Sirichai Gym!`},
    {n:"nar",t:`The referee hands over the belt. ${f.name} lifts it high beneath the spotlights as gold confetti falls across the ring.`},
    {n:h.id,f:"happy",l:"fight",t:h.kind==="defense"?"The belt stays with our gym! I'll be ready for the next challenger!":"We brought the belt home! Thank you for cheering for us!"},
    {n:"coach",t:`Remember tonight, ${f.name}. This victory is now part of Sirichai's hall of fame.`}];}
// v1.7: bonds deepen by chapter — the ceiling rises as the season's story moves on
const bondCap=G=>100;
// v1.44: bond grows a bit faster, and the girls who join later catch up while still distant
const BOND_MUL=.3,BOND_LATE=["mali","rin"];
const absWeek=G=>((G.season||1)-1)*52+G.week;
const add=(G,id,k,v)=>{const f=G.F[id];if(!f)return;if(k==="bond"&&v>0&&typeof partners==="function"&&LOVE_IDS.includes(id)&&!isPartner(G,id)){const n=partners(G).length;if(n)v*=n>=2?.6:.75;}/* v1.89.11: courting while taken is slower */if(k==="bond"&&v>0)f.lastTouch=absWeek(G);if(k==="bond"&&v>0)v=Math.max(.5,Math.round(v*BOND_MUL*(BOND_LATE.includes(id)&&(f.bond||0)<50?1.6:1)*2)/2);
  if(k==="bond"){const lv0=heartLv(f).lv;/* v1.86: affection past 100 keeps counting as heart levels (bond itself stays 0–100 for every existing check) */
    if(v>=0){const tot=(f.bond||0)+(f.bondX||0),cap=heartAt(heartCapLv(G));v=tot>=cap?0:Math.min(v,cap-tot);/* v1.89.11: chapter cap, never takes away what she already has */
      const t=(f.bond||0)+v;f.bond=Math.min(100,t);if(t>100)f.bondX=(f.bondX||0)+(t-100);}
    else{let d=-v;const x=Math.min(f.bondX||0,d);if(x>0){f.bondX-=x;d-=x;}if(d>0)f.bond=Math.max(0,(f.bond||0)-d);}
    const lv1=heartLv(f).lv;if(lv1>lv0&&G.F[id].met)G.heartNews=(G.heartNews||[]).concat([{id,lv:lv1,week:G.week}]).slice(-8);return;}
  f[k]=Math.max(0,Math.min(100,f[k]+v));};
/* v1.86: heart levels — Lv.1–10 are the first 100 points (10 per level); past that each level asks a little more, with no ceiling */
/* v1.90: one ladder — the same names as the relationship tiers (คนรู้จัก / เพื่อนร่วมค่าย / คนสนิท / คนพิเศษ), carried on to ♥30; lovers climb their own ladder */
const HEART_TIERS=[[1,"Acquaintance"],[3,"Teammate"],[5,"Close"],[8,"Special"],[10,"Deeply bonded"],[15,"Kindred"],[20,"Inseparable"],[25,"Most important person"],[30,"Partner in the ring"]];
const LOVER_TIERS=[[1,"Lover"],[15,"Kindred sweetheart"],[20,"Inseparable pair"],[25,"Soon-to-be partner"],[30,"Life partner"]];
const hTot=f=>((f&&f.bond)||0)+((f&&f.bondX)||0);
// relationship state, written to work with a single romance (G.romance) and with several lovers / promises / exes (G.lovers, G.promise, G.exAbs)
function relState(G,id){if(!G||!id)return null;const L=Array.isArray(G.lovers)?G.lovers:(G.romance?[G.romance]:[]);if(L.includes(id))return "lover";
  if(G.promise&&G.promise[id]!=null)return "promise";if(G.exAbs&&G.exAbs[id]!=null)return "ex";return null;}
/* v1.89.11: Lv.30 is the top at 1,000 points — each step past 100 asks a little more (15 → 80) */
const HEART_STEPS=[15,20,20,25,30,35,35,40,45,45,50,55,60,60,65,70,75,75,80],HEART_MAX=30,HEART_TOP=1000;
const heartStep=n=>HEART_STEPS[n-11]||0; // points from Lv.n to Lv.n+1, for 11 ≤ n < 30
const heartAt=lv=>lv<=10?(lv-1)*10:100+HEART_STEPS.slice(0,lv-11).reduce((a,b)=>a+b,0);
function heartLv(f){const b=Math.max(0,Math.min(100,(f&&f.bond)||0)),x=Math.max(0,(f&&f.bondX)||0);
  if(b<100){const lv=1+Math.floor(b/10);return {lv,into:b-(lv-1)*10,need:10,total:b};}
  let lv=11,left=x;while(lv<HEART_MAX&&left>=heartStep(lv)){left-=heartStep(lv);lv++;}
  if(lv>=HEART_MAX)return {lv:HEART_MAX,into:1,need:1,total:Math.min(HEART_TOP,100+x),max:true};
  return {lv,into:left,need:heartStep(lv),total:100+x};}
/* v1.89.11: how far hearts can go in each chapter — province Lv.20 · regional Lv.25 · national Lv.28 · international Lv.30 */
const heartCapLv=G=>G&&G.flags&&G.flags.intl?30:G&&G.flags&&G.flags.national?28:G&&G.region?25:20;
const heartCapped=(G,f)=>!!(G&&f)&&(f.bond||0)+(f.bondX||0)>=heartAt(heartCapLv(G));
const HEART_NEXT={20:"up to Lv.25 in the regional chapter",25:"up to Lv.28 in the national chapter",28:"up to Lv.30 in the international chapter",30:""};
const heartTier=(lv,id)=>{const st=typeof G!=="undefined"&&G?relState(G,id):null;if(st==="ex")return "Ex";const T=st==="lover"?LOVER_TIERS:HEART_TIERS;
  let n=T[0][1];for(const [m,t] of T)if(lv>=m)n=t;return st==="promise"&&lv>=8&&lv<15?"Promised":n;};

const EVENTS=[
 {id:"prologue",look:"train",bg:"bus",steps:[
  {n:"nar",t:"The rain has stopped. After a long bus ride from Bangkok, you reach the small town where you spent your childhood. You take out Grandpa Chai's letter and read it once more."},
  {n:"nar",bg:"letter",t:"It arrived before you left. His handwriting is shaky, but still neat."},
  {n:"nar",t:"“My dear grandchild, if this letter has reached you, I have passed on. I leave you Sirichai Muay Thai camp, the place I built over a lifetime.”"},
  {n:"nar",t:"“Only one fighter remains at the camp. Her name is Kati, and she has the heart of a fighter. Please look after her. — Grandpa Chai”"},
  {n:"nar",bg:"gymdusk",t:"You fold the letter away and pass Sirichai's faded sign. Inside, you can still hear fists striking pads. Someone is training."},
  {n:"kati",f:"surprised",t:"…Who is there? Oh, sorry. The door startled me."},
  {n:"kati",f:"flustered",t:"Wait… you are Grandpa Chai’s grandchild? I am Kati! He took me in when I was eight. That summer you taught me to ride a bike, and we both fell into the ditch. Remember?"},
  {choice:[
   {t:"Yes. Grandpa asked me to take care of the camp",fx:G=>add(G,"kati","bond",4),then:[{n:"kati",f:"happy",t:"Grandpa talked about you all the time! He said you would come back someday."}]},
   {t:"I want to know if the camp can keep going",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"flustered",t:"It can! If just one more person believes in this place, I will prove it."}]}]},
  {n:"kati",f:"sad",t:"I am the only fighter left. Coach Daeng is still here, but everyone else moved to Golden Tiger."},
  {n:"nar",t:"A grey-haired man steps out from behind the camp with a towel over his shoulder. His arms are still strong, like someone who never stopped training."},
  {n:"coach",t:"Name is Daeng. The kids call me Coach Daeng. I was Grandpa Chai’s first student, and I have been here thirty years."},
  {n:"coach",t:"I will be straight with you. The camp owes 120,000 baht. We have to pay 5,000 every month."},
  {n:"nar",t:"Coach Daeng lets the numbers settle in the silence. Kati grips her hand wraps tighter but does not look away."},
  {n:"coach",t:"Students still come to train here, and Kati has not stopped either. Take a look around the camp first. Then we can plan this week together."},
  {n:"kati",f:"happy",t:"If you stay, I will keep fighting. I am in your hands, Manager!"}]},

 {id:"kati_why",look:"train",when:G=>G.week>=2,bg:"night",steps:[
  {n:"nar",t:"Nine at night. One light is still on in camp; Kati is kicking a heavy bag patched with duct tape"},
  {n:"me",t:G=>`It's late. Why haven't you gone home?`},
  {n:"kati",f:"happy",t:"Just a little more… Manager, did you know Golden Tiger tried to recruit me three times? Way better pay than here"},
  {n:"kati",f:"sad",t:"But Grandpa Chai was the first to say I could fight, when nobody else believed in me"},
  {choice:[
   {t:"Thank you for staying. I won't let you down",fx:G=>{add(G,"kati","trust",6);MEM(G,"kati_promise");},then:[{n:"kati",f:"happy",t:"Then I'll remember that. No taking it back!"}]},
   {t:"And you? What do you fight for?",fx:G=>add(G,"kati","bond",6),then:[
     {n:"kati",f:"flustered",t:"…Nobody's ever asked me that"},
     {n:"kati",f:"happy",t:"I want people to see that a girl from an old camp can be champion. No money, no fame, just heart"}]}]}]},

 {id:"rival_meet",look:"casual",when:G=>G.week>=5,bg:"fair",steps:[
  {n:"nar",t:"Saturday night market. You and Kati came out to buy hand-wrap tape, but run into people you'd rather not see"},
  {n:"fah",f:"happy",t:"Oh, Kati, your camp's not closed yet? Heard you got a rookie manager"},
  {n:"fah",f:"happy",t:G=>`So this is Uncle Chai's grandkid… hope you know fights aren't fought in Excel sheets`},
  {n:"kati",f:"angry",t:"Fah! Be nice"},
  {choice:[
   {t:"Then let's settle it in the ring",fx:G=>{add(G,"kati","morale",5);add(G,"kati","trust",3);add(G,"fah","bond",5);},then:[{n:"fah",f:"happy",t:"Hmph, I like that. Straight up. Don't run away"}]},
   {t:"Your camp poached all our fighters and you still come mock us",fx:G=>{add(G,"kati","bond",4);add(G,"ploy","bond",3);},then:[{n:"ploy",f:"happy",t:"They chose for themselves. Our camp forced no one"}]}]},
  {n:"ploy",f:"happy",t:"I'm Ploy, captain of Golden Tiger. I apologize for Fah, she speaks without thinking"},
  {n:"ploy",f:"happy",t:"But the provincial standard isn't low. I hope Grandpa Chai's camp won't tarnish his name"},
  {n:"nar",t:"The two walk away. Kati can't take her eyes off Ploy's back"},
  {n:"kati",f:"sad",t:"…Ploy is in Division A with me, unbeaten for three years. I've faced her twice and lost both times"},
  {n:"kati",f:"angry",t:"She's been gifted since birth, I have to train three times as hard to keep up… but this year I'll catch up!"},
  {fx:G=>{G.F.ploy.met=true;G.F.fah.met=true;}}]},

 {id:"first_student",look:"casual",when:G=>G.week>=3,bg:"camp",steps:[
  {n:"nar",t:"Sunday afternoon. A small boy clings to the camp fence, holding a bag stuffed with mangoes"},
  {n:"coach",t:"That's Auntie Saeng's boy, from the curry-rice shop. He's wanted to learn Muay Thai for ages, but his family doesn't have much"},
  {n:"nar",t:"The boy holds out the bag. \"Mom says, can we pay in mangoes this month?\""},
  {n:"kati",f:"happy",t:"Manager, I can teach him myself. I started out with no money too"},
  {choice:[
   {t:"Take him on. Mangoes count as tuition",fx:G=>{add(G,"kati","bond",5);add(G,"kati","morale",6);G.rep+=.5;G.stu=Math.min(studentCap(G),(G.stu||1)+2);},then:[
     {n:"kati",f:"flustered",t:"Yay! My very first student!"},
     {n:"nar",t:"The next week, Auntie Saeng tells the whole market. Two more new students walk into the camp"}]},
   {t:"The camp is struggling. Cash, please",fx:G=>{G.cash+=600;},then:[
     {n:"nar",t:"Auntie Saeng runs to borrow 600 baht from the neighbors. The boy walks into the gym quietly, head down"},
     {n:"kati",f:"sad",t:"…Okay"}]}]}]},

 {id:"early_ad",look:"casual",when:G=>G.week>=7,bg:"camp",steps:[
  {n:"nar",t:"Auntie Taew from the som tam stall by the temple walks into the camp, phone in hand"},
  {n:"nar",t:"\"I'm making an ad for my fermented-crab som tam. I want one of your fighters to kick a mortar on camera. I'll pay 2,500\""},
  {n:"kati",f:"flustered",t:"Kick… a mortar?"},
  {choice:[
   {t:"Take the job! The camp needs money",fx:G=>{G.cash+=2500;G.rep+=1;add(G,"kati","fatigue",4);},then:[
     {n:"nar",t:"The clip of Kati kicking a mortar to pieces mid-air gets 200,000 views. Auntie Taew sells out of som tam by 1 p.m."},
     {n:"kati",f:"happy",t:"That mortar was tougher than some of my opponents"}]},
   {t:"Send Coach Daeng instead",fx:G=>{G.cash+=1200;add(G,"kati","bond",3);},then:[
     {n:"coach",t:"Coach can kick a mortar. But Coach is not dancing. Just so you know"},
     {n:"nar",t:"In the end, Coach Daeng danced"}]}]}]},

 {id:"mali_meet",look:"fight",when:G=>G.week>=4,bg:"fair",steps:[
  {n:"nar",t:"The annual temple fair. A temporary ring stands beside the Ferris wheel, pipes and drums echoing everywhere"},
  {n:"nar",t:"A small fighter with a topknot and a frangipani flower kicks a bigger opponent all the way back"},
  {n:"mali",f:"happy",t:"Yay! I won~ Thank you everyone!"},
  {n:"mali",f:"happy",t:G=>`Oh, you're from Sirichai Camp? I'm Mali, from up-country. I tour temple fairs fighting to send money home`},
  {n:"mali",f:"sad",t:"No camp will take me. They say I'm too small for the big stage"},
  {choice:[
   {t:"Our camp is small, but I'll give you real fights",fx:G=>{add(G,"mali","trust",8);add(G,"mali","bond",4);MEM(G,"mali_promise");},then:[{n:"mali",f:"flustered",t:"Really? Then I'll come see the camp! (Sign Mali in the Camp & Finance tab)"}]},
   {t:"Beautiful kick. See you around",fx:G=>add(G,"mali","bond",3),then:[{n:"mali",f:"happy",t:"See you! If you change your mind and want a tiny fighter, find me at the temple fair!"}]}]},
  {fx:G=>{G.F.mali.met=true;G.flags.maliRecruit=true;}}]},

 {id:"rin_meet",look:"casual",when:G=>G.week>=14,bg:"camp",steps:[
  {n:"nar",t:"A woman in glasses stands at the camp entrance, holding a tablet playing your camp's latest fight"},
  {n:"rin",f:"happy",t:"Hello. I'm Rin, formerly of Golden Tiger. I quit because they never listened to data"},
  {inject:G=>G.seen.rin_note?[{n:"kati",f:"surprised",l:"train",t:"Wait… that unsigned note in our mailbox last month, that was your handwriting, Rin?!"},{n:"rin",f:"flustered",t:"…Yes. I wanted to see whether your camp would use the data. You did. That's why I'm here."}]:[]},
  {n:"rin",f:"flustered",t:"In your camp's latest fight I counted 14 missed counter opportunities in three rounds. Fix that and the result changes"},
  {n:"rin",f:"happy",t:"I still want to fight, and I'd like to help with analysis too, if your camp can afford it"},
  {choice:[
   {t:"Our camp welcomes people who think like that",fx:G=>{add(G,"rin","trust",8);},then:[{n:"rin",f:"happy",t:"Good. Let's talk contract (Sign Rin in the Camp & Finance tab)"}]},
   {t:"Let me check the budget first",fx:G=>add(G,"rin","bond",2),then:[{n:"rin",f:"happy",t:"Reasonable. I like people who don't decide on emotion"}]}]},
  {fx:G=>{G.F.rin.met=true;G.flags.rinRecruit=true;}}]},

 {id:"first_win",look:"casual",when:G=>!!G.flags.firstWin,bg:"food",steps:[
  {n:"nar",t:"That night the whole camp celebrates at Auntie Daeng's khao soi shop. She gives everyone two free boiled eggs"},
  {n:G=>G.flags.firstWin,f:"happy",t:"We won! We really won! Thank you for the game plan, Manager"},
  {n:"coach",t:"The camp's first win in two years. Grandpa Chai must be smiling up there"},
  {fx:G=>{add(G,G.flags.firstWin,"bond",5);add(G,G.flags.firstWin,"trust",3);}}]},

 {id:"first_loss",look:"fight",when:G=>!!G.flags.firstLoss,bg:"night",steps:[
  {n:"nar",t:"After the fight, the locker room is so quiet you can hear the fan"},
  {n:G=>G.flags.firstLoss,f:"sad",t:"…I'm sorry. I didn't do well. Can I train harder tomorrow?"},
  {choice:[
   {t:"Rest first, then tell me how you feel",fx:G=>{const id=G.flags.firstLoss;add(G,id,"bond",4);add(G,id,"morale",6);G.F[id].plan={preset:"rest",intensity:"normal"};},
    then:[{n:G=>G.flags.firstLoss,f:"flustered",t:"…Thank you. Just having someone listen makes it so much lighter (recovery program set)"}]},
   {t:"Okay, let's push training",fx:G=>{const id=G.flags.firstLoss;G.F[id].fatigue=Math.min(100,G.F[id].fatigue+10);add(G,id,"trust",-3);add(G,id,"morale",3);G.F[id].plan={preset:"balanced",intensity:"heavy"};},
    then:[{n:G=>G.flags.firstLoss,f:"happy",t:"Yes! …(smiling despite the exhaustion)"}]},
   {t:"Let's watch the tape with Coach Daeng and find what went wrong",fx:G=>{const id=G.flags.firstLoss;add(G,id,"trust",4);G.F[id].prepBonus=true;},
    then:[{n:"coach",t:"See? The guard drops every time you throw the right. Fix that and you'll be fine next fight (readiness bonus for the next fight)"}]}]}]},

 {id:"fatigue_warn",look:"train",when:G=>Object.values(G.F).some(f=>f.camp==="player"&&f.fatigue>=72),bg:"camp",steps:[
  {n:"coach",t:G=>{const f=Object.values(G.F).find(f=>f.camp==="player"&&f.fatigue>=72);G.flags.tiredId=f.id;return `${f.name} has built up a lot of fatigue. Training hard now risks injury`;}},
  {n:G=>G.flags.tiredId,f:"happy",t:"It's fine, I can still go! Just a bit more and I'll get better"},
  {choice:[
   {t:"Order a week of rest",fx:G=>{const f=G.F[G.flags.tiredId];f.plan={preset:"rest",intensity:"normal"};add(G,f.id,"trust",6);},then:[{n:G=>G.flags.tiredId,f:"flustered",t:"…Okay. Thanks for worrying about me"}]},
   {t:"Trust her, keep training",fx:G=>{add(G,G.flags.tiredId,"morale",4);add(G,G.flags.tiredId,"trust",-2);},then:[{n:"coach",t:"…Fine, but if you get hurt, don't blame anyone"}]}]}]},

 {id:"qual_result",look:"fight",when:G=>G.week>=21,bg:"ring",steps:[
  {inject:G=>{const q=[...G.qual.A,...G.qual.B].filter(id=>G.F[id].camp==="player");const W=q.filter(id=>G.wild&&G.wild[id]&&G.wildDrop&&G.wildDrop[id]&&G.F[G.wildDrop[id]]);
   if(!q.length)return [{n:"coach",t:"Subdistrict results… this year our camp didn't make the top 4"},{n:"kati",f:"sad",t:"It's not over. Temple-fair fights still bring in money, and I can still get better. We'll be back next year"}];
   const S=[];const ok=q.filter(id=>!W.includes(id));
   if(ok.length)S.push({n:"coach",t:`Subdistrict results! ${ok.map(id=>G.F[id].name).join(" and ")} made the top 4 and advance to the district round`});
   for(const id of W){const f=G.F[id],d=G.F[G.wildDrop[id]];
    const rk=(G.wildRank&&G.wildRank[id])||5;
    S.push({n:"coach",t:rk<=5?`${ok.length||W.indexOf(id)>0?"As for ":"Subdistrict results… "}${f.name} finished fifth, just a hair behind fourth… so close.`:`${ok.length||W.indexOf(id)>0?"As for ":"Subdistrict results… "}${f.name} finished in place ${rk}… not in the top 4 this year`},
     {n:"nar",t:`But on the morning of the results, ${d.name}, who placed fourth, crashed her motorbike on the way to the weigh-in. Sprained ankle. Not badly hurt, but she has to rest two months.`},
     {n:"coach",t:rk<=5?`So the committee passed the spot down to fifth place… ${f.name} goes on to the district round. A fluke is a fluke, but we're through.`:`Everyone ranked in between is already booked for other shows, so the committee gave our camp a wildcard because our fights are fun to watch… ${f.name} goes on to the district round. A fluke is a fluke, but we're through.`},
     {n:id,f:"flustered",t:`I'm happy, but not really happy… ${d.name} trained all year too. I'll bring her some oranges.`},
     {n:id,f:"angry",t:`Next year I'll qualify on my own points. No more waiting for someone to crash their bike!`});}
   if(q.includes("kati")&&!W.includes("kati"))S.push({n:"kati",f:"happy",t:"District round! I'll take it all the way to the province!"});
   return S;}}]},

 /* v1.66: from year 2 qualifying is real — the news, and a soft landing if we miss */
 {id:"qual_year",annual:true,pri:3,look:"fight",bg:"ring",when:G=>(G.season||1)>=2&&G.week>=21,steps:[
  {inject:G=>{const q=[...G.qual.A,...G.qual.B].filter(id=>G.F[id].camp==="player");const lead=["kati","mali"].filter(id=>inCamp(G,id));const miss=lead.filter(id=>!q.includes(id));const S=[];
   if(q.length)S.push({n:"coach",t:`Subdistrict results for year ${yr(G)}! ${q.map(id=>G.F[id].name).join(" and ")} made the top 4 on their own points. Nobody had to crash a bike for us this time`});
   if(q.includes("kati"))S.push({n:"kati",f:"happy",t:"I got in on my own! No waiting to see if someone drops out this year. I'm going all the way to the province!"});
   if(!miss.length)return S;
   const m=G.F[miss[0]];
   S.push({n:"coach",t:`${q.length?"As for ":"Subdistrict results… "}${miss.map(id=>G.F[id].name).join(" and ")} missed the top 4 this year, by just a few points`},
    {n:m.id,f:"sad",t:"…I'm sorry, Manager. I couldn't make it."},
    {n:"coach",t:"Nobody needs to apologize. Grandpa Chai's camp missed the subdistrict cut three years running. In the fourth year he won the province."},
    {n:"nar",t:"That night the camp is quieter than usual, until the smell of moo kratha drifts out from behind the kitchen."});
   if(inCamp(G,"mali")&&m.id!=="mali")S.push({n:"mali",f:"happy",t:"I got it ready this afternoon. Win or lose, we still have to eat~"});
   if(inCamp(G,"rin"))S.push({n:"rin",f:"pout",t:"I've already collected data on every rival this year. Next year we start three months before them. …Eat first, talk later."});
   S.push({n:m.id,f:"happy",t:"…Mm. I'll be back next year. Not for revenge, but because I want to keep fighting alongside everyone here."},
    {fx:G2=>{R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+5);});}},{n:"nar",t:"(Everyone morale +5 · the second half of the year still has temple-fair fights, festivals and minigames)"});
   return S;}}]},

 {id:"ploy_river",look:"train",when:G=>G.week>=24&&G.F.ploy.met,bg:"river",steps:[
  {n:"nar",t:"One evening by the river, you see Ploy sitting alone, re-wrapping her hands"},
  {n:"ploy",f:"sad",t:"…Sirichai's manager. What brings you here?"},
  {n:"ploy",f:"sad",t:"Our owner wants the provincial title this year no matter what. If we don't get it, he'll disband the whole women's junior squad. I'm captain. I can't lose"},
  {choice:[
   {t:"Carrying everyone alone isn't your job alone",fx:G=>{add(G,"ploy","bond",9);},then:[{n:"ploy",f:"flustered",t:"…You're strange. A rival, but you talk like you care. Thank you"}]},
   {t:"Then in the ring, our camp won't hold back",fx:G=>{add(G,"ploy","bond",5);add(G,"ploy","trust",4);},then:[{n:"ploy",f:"happy",t:"Good. I like that. Don't disappoint me"}]}]}]},

 {id:"loykrathong",look:"casual",when:G=>G.week>=26,bg:"fair",steps:[
  {n:"nar",t:"Full moon of the twelfth month. The river is full of krathongs and candlelight; the whole camp skips training for one night"},
  {n:"coach",t:"Go on, go float krathongs. Let the bad luck float away; this camp's had plenty this year"},
  {n:"nar",t:"Who will you invite to float a krathong?"},
  {choiceFn:G=>Object.values(G.F).filter(f=>f.canon&&f.met).map(f=>({t:`Invite ${f.name}`,fx:G2=>{add(G2,f.id,"bond",10);G2.flags.lkWith=f.id;},then:LK_LINES[f.id]}))},
  {fx:G=>{for(const f of Object.values(G.F))if(f.camp==="player")add(G,f.id,"morale",6);}}]},

 {id:"fah_night",look:"casual",when:G=>G.week>=30&&G.F.fah.met,bg:"night",steps:[
  {n:"nar",t:"Midnight, at the convenience store outside the stadium, Fah sits alone eating cup noodles, eyes a little red"},
  {n:"fah",f:"sad",t:"What, here to laugh at me?… Who said Fah was crying, just dust in my eye"},
  {n:"fah",f:"sad",t:"Everyone loves Fah when she's attacking and winning, but the day she loses, nobody asks how Fah is. Fah only gets to be the camp's 'reckless one'"},
  {choice:[
   {t:"Then I'll ask. How are you doing right now?",fx:G=>add(G,"fah","bond",10),then:[{n:"fah",f:"flustered",t:"…Are you crazy? Who can answer when you ask that straight… not really okay. Thanks"}]},
   {t:"Your recklessness is the scariest in the division",fx:G=>{add(G,"fah","bond",6);add(G,"fah","morale",8);},then:[{n:"fah",f:"happy",t:"Ha! You noticed? Then watch out. Next fight Fah'll show you"}]}]}]},

 {id:"mali_family",look:"train",when:G=>G.week>=34&&G.F.mali.camp==="player",bg:"camp",steps:[
  {n:"nar",t:"Mali is on the phone behind the camp, her voice barely audible"},
  {n:"mali",f:"sad",t:"…It's okay, Mom. I'll send money soon. I fought lots of fights this month, really"},
  {n:"mali",f:"happy",t:"Oh, Manager! It's nothing, haha, just some family stuff"},
  {choice:[
   {t:"The camp advances you ฿5,000 of your pay",fx:G=>{G.cash-=5000;add(G,"mali","trust",10);add(G,"mali","bond",6);},then:[{n:"mali",f:"flustered",t:"…I'll pay it back with winning fights. I promise"}]},
   {t:"You don't have to smile all the time. Tell me when you're tired",fx:G=>add(G,"mali","bond",8),then:[{n:"mali",f:"sad",t:"…Waah, why would you say that, now I'm really going to cry"}]}]}]},

 {id:"rin_plan",look:"train",when:G=>G.week>=38&&G.F.rin.camp==="player",bg:"camp",steps:[
  {n:"rin",f:"sad",t:"My plan failed again. The data said the opponent would retreat, but she came forward"},
  {n:"rin",f:"sad",t:"If I can't calculate it, I don't know what to believe"},
  {choice:[
   {t:"Sometimes you have to trust your instincts",fx:G=>{add(G,"rin","bond",8);G.F.rin.a.comp=Math.min(20,G.F.rin.a.comp+1);},then:[{n:"rin",f:"flustered",t:"Instincts… I'll try. If it goes wrong, you're responsible too (composure +1)"}]},
   {t:"Then build a backup plan, two layers deep",fx:G=>{add(G,"rin","trust",6);G.F.rin.a.iq=Math.min(20,G.F.rin.a.iq+1);},then:[{n:"rin",f:"happy",t:"Plan B… of course. I like the way you think (fight IQ +1)"}]}]}]},

 {id:"final_result",look:"fight",when:G=>G.week>=41,bg:"hall",steps:[
  {n:"nar",t:"The provincial hall is decked in flags; the list of each division's final four hangs in front of the stage"},
  {n:"coach",t:G=>{const f=[...(G.semis.A||[]),...(G.semis.B||[])].filter(id=>G.F[id].camp==="player");
    return f.length?`District results! ${f.map(id=>G.F[id].name).join(" and ")} made the final four and fight in the semifinal in week 44. One more win and it's the provincial final!`:"We didn't reach the final four this year… but a camp that was abandoned now has its name on the board. We'll be back next year";}},
  {n:"coach",t:G=>{const s=d=>{const t=G.semis[d]||[];return t.length===4?`${G.F[t[0]].name} vs ${G.F[t[3]].name} · ${G.F[t[1]].name} vs ${G.F[t[2]].name}`:"—";};return `Semifinal Div A: ${s("A")} · Div B: ${s("B")}`;}},
  {n:"kati",f:G=>(G.semis.A||[]).includes("kati")?"happy":"sad",t:G=>(G.semis.A||[]).includes("kati")?"Two more fights… just two more, and I'll stand in the ring where Grandpa once stood":"I'm not good enough yet… but I'll watch every remaining fight and remember it all"}]},
 {id:"semi_result",look:"fight",when:G=>G.week>=45,bg:"hall",steps:[
  {n:"coach",t:G=>{const f=[...G.finalists.A,...G.finalists.B].filter(id=>G.F[id].camp==="player");
    return f.length?`Semifinals over! ${f.map(id=>G.F[id].name).join(" and ")} advance to the provincial final, week 49, five rounds!`:"The semifinals are over. Our camp didn't reach the final… but we still have work to do";}},
  {n:"coach",t:G=>{const s=d=>G.finalists[d].map(id=>G.F[id].name).join(" vs ")||"—";return `Final Div A: ${s("A")} · Final Div B: ${s("B")}`;}}]},

 {id:"kati_ourcamp",look:"train",when:G=>G.week>=46,bg:"night",steps:[
  {n:"nar",t:"Kati stands looking at the freshly painted camp sign, the letters 'Sirichai' bright red again"},
  {n:"kati",f:"happy",t:G=>G.finalists.A.includes("kati")?"The provincial final is just days away… this time last year I was training alone in a camp with nobody left":"We didn't reach the province this year, but this time last year I was training alone in a camp with nobody left"},
  {n:"kati",f:"flustered",t:"Now there are voices, laughter, a manager… this is our camp now"},
  {choice:[
   {t:"Yes, our camp",fx:G=>{add(G,"kati","bond",6);add(G,"kati","morale",8);},then:[{n:"kati",f:"happy",t:"Mm! Our camp!"}]},
   {t:"And you're the heart of this camp",fx:G=>{add(G,"kati","bond",9);},then:[{n:"kati",f:"flustered",t:"Eh… s-saying that, I don't know how to act"}]}]}]},

 {id:"fah_visit",look:"train",when:G=>G.week>=12&&G.F.fah.met,bg:"camp",steps:[
  {n:"nar",t:"Monday morning, an old motorbike pulls up at the gate. Fah walks in carrying a glove bag"},
  {n:"fah",f:"happy",t:"Heard Sirichai has new heavy bags. Lend me your ring for training… and Kati too"},
  {n:"kati",f:"flustered",t:"Huh! Training at a rival camp?!",with:"fah"},
  {choice:[
   {t:"Sure. Light sparring, three rounds, nothing serious",fx:G=>{G.F.kati.a.guard=Math.min(20,G.F.kati.a.guard+.5);G.F.kati.a.counter=Math.min(20,G.F.kati.a.counter+.3);add(G,"fah","bond",5);G.F.kati.fatigue=Math.min(100,G.F.kati.fatigue+6);},
    then:[{n:"nar",t:"Three rounds become six. Both collapse in the middle of the ring, gasping"},{n:"fah",f:"happy",t:"…Not bad, Kati. You've improved (Kati's guard and counter improve)"}]},
   {t:"No. Save it for the real ring",fx:G=>{add(G,"kati","morale",5);add(G,"fah","bond",2);},then:[{n:"fah",f:"happy",t:"Ha! Possessive. Fine, see you in the ring"}]}]}]},
 {id:"pre_qual",look:"train",when:G=>G.week>=17,bg:"night",steps:[
  {n:"coach",t:G=>{const s=["A","B"].flatMap(d=>standings(G,d).map((r,i)=>({...r,pos:i+1}))).filter(r=>r.f.camp==="player");
    return s.length?`Three weeks until the subdistrict cut. Right now ${s.map(r=>`${r.f.name} is ranked #${r.pos}`).join(", ")} must stay top 4`:"Three weeks until the subdistrict cut. Time to find fights";}},
  {n:"kati",f:"happy",t:"I won't let it slip! Manager, plan it for me!"},
  {n:"coach",t:"Coach's tip: if you have a fight coming, use 'Fight prep' the week before, and scout tapes from the camp screen"}]},
 {id:"new_sign",look:"train",when:G=>G.camp&&G.camp.beauty>=4,bg:"camp",steps:[
  {n:"nar",t:"The camp sign has been repainted, 'Sirichai' bright red again. People stop to take photos in front of the camp"},
  {n:"kati",f:"happy",t:"Manager! Look! Our sign is beautiful again! Just like when I first came here"},
  {n:"coach",t:"A camp that looks alive makes people want to train (class income rises with camp looks)"},{fx:G=>{G.rep+=.5;}}]},
 {id:"night_final",look:"casual",when:G=>G.week>=48&&[...G.finalists.A,...G.finalists.B].some(id=>G.F[id].camp==="player"),bg:"night",steps:[
  {n:"nar",t:"The night before the provincial final, the whole camp sits on the ring apron. No one speaks for a long time"},
  {n:"coach",t:"Whatever happens tomorrow, Sirichai is back this year. Thank you, all of you"},
  {n:"kati",f:"flustered",t:"Manager… thank you for not selling the camp on day one"},
  {choice:[{t:"Thank you for waiting here for me, training",fx:G=>{for(const f of roster(G)){add(G,f.id,"morale",10);add(G,f.id,"bond",3);}},then:[{n:"kati",f:"happy",t:"Tomorrow we go get that belt!"}]}]}]},
 {id:"lover_final",look:"fight",when:G=>G.week>=48&&!!lovFinal(G),bg:"ring",
  steps:[{inject:G2=>{const L=lovFinal(G2);if(!L)return [];if(lovSolo(G2))add(G2,L.b.a,"morale",8);return LOVER_FINAL[L.id]||[];}}]},
 // v1.32 fame milestones: something visible happens when the camp's name grows
 // v1.33: the camp itself nudges you toward upgrades, and the coach sits down to talk money
 {id:"up_rope",look:"train",when:G=>G.week>=7&&facTotal(G)<3,bg:"gym",steps:[
  {n:"nar",t:"Snap! The top rope breaks mid-session; Kati, leaning on it, flips backward off the ring into the sandbags"},
  {n:"kati",f:"flustered",l:"train",t:"I'm okay! …But the sandbag burst. There's sand all over the floor"},
  {n:"coach",t:G=>`The gear in this camp is older than ${ME(G)}. New training gear would help the kids a lot. Five upgrades and the camp moves up a level, and class fees go up too`},
  {choice:[{t:"Go to camp upgrades",fx:G=>{if(typeof UI!=="undefined"){UI.tab="camp";UI.csub="fac";}},then:[{n:"coach",t:"Good, take a look first. Save up and buy one piece at a time"}]},
   {t:"Tape it up for now",then:[{n:"nar",t:"Three rolls of duct tape do the job better than expected… until next week"}]}]}]},
 {id:"up_full",look:"casual",when:G=>G.week>=10&&studentDemand(G)>studentCap(G)+2,bg:"camp",steps:[
  {n:"nar",t:"A mother and son have been waiting at the gate since morning; the boy's pink gloves are bigger than his head"},
  {n:"npc",who:"Mother",t:"Is it full already? My son really wants to learn from the girls on TV"},
  {n:"coach",t:"More people want to learn than we can take. Expand the class area and the fees come in every week"},
  {choice:[{t:"Check the class area",fx:G=>{if(typeof UI!=="undefined"){UI.tab="camp";UI.csub="fac";}},then:[{n:"nar",t:"The boy in pink gloves waves goodbye and promises to come back"}]},
   {t:"Sorry, maybe next time",then:[{n:"nar",t:"The boy nods, but keeps punching the air at the camp gate all the way out"}]}]}]},
 {id:"up_lv2",look:"casual",when:G=>G.week>=14&&campLevel(G)===1&&facTotal(G)>=3,bg:"gym",steps:[
  {n:"kati",f:"happy",l:"casual",t:G=>`${CALL(G,"kati")}, I counted! Just ${5-facTotal(G)} more upgrades and our camp becomes a 'Camp on the mend'!`},
  {n:"coach",t:"Once we level up, class fees go up twenty percent, more people want to join, and we can hire one more assistant coach. The gym will look better too"},
  {n:"kati",f:"happy",l:"casual",t:"And I'll get to train in a room where the roof doesn't leak!"}]},
 {id:"coach_money",look:"casual",when:G=>G.week>=6&&G.cash<15000&&weeklyNet(G)<0,bg:"camp",steps:[
  {n:"nar",t:"That night Coach Daeng sets Grandpa Chai's old ledger on the table, the page full of red numbers"},
  {n:"coach",t:G=>`${ME(G)}, listen to me. More money goes out than comes in every week. Leave it a few more weeks and the camp won't make it`},
  {n:"coach",t:"There are three ways out: take more fights, temple-fair fights count too; check the mail, there's often money waiting to collect; and upgrade the class area so fees come in every week"},
  {n:"coach",t:"There's also the Gold Helmet loan… but please, don't. Grandpa Chai borrowed from them once, and the interest ate half the camp"},
  {choice:[{t:"I'll find a way, Coach",fx:G=>{G.F.kati.trust=Math.min(100,(G.F.kati.trust||0)+1);},then:[{n:"coach",t:"Coach believes in you. So did Grandpa Chai"}]},
   {t:"Coach, have you ever borrowed?",then:[{n:"coach",t:"…Just once. When Kati was born. The hospital bill was steep, and it took three years to pay back. Don't tell Kati"}]}]}]},
 {id:"fame20",look:"casual",when:G=>G.rep>=20,bg:"camp",steps:[
  {n:"nar",t:"The district paper is on the camp table. A small headline: 'Old Sirichai Camp Breathes Again'"},
  {n:"kati",f:"happy",l:"casual",t:G=>`${CALL(G,"kati")}! We're on page 3, right next to the fertilizer ad!`},
  {n:"coach",t:"Page three is still page three. More people read it than you'd think"},
  {inject:G=>{G.stu=Math.min(studentCap(G),(G.stu||1)+2);return [{n:"nar",t:"That week, parents bring two more kids to sign up"}];}}]},
 {id:"fame36",look:"casual",when:G=>G.rep>=36,bg:"camp",steps:[
  {n:"nar",t:"A provincial TV crew sets up outside the camp at dawn. The lights are so bright the orange cat flees to the roof"},
  {n:"nar",t:G=>`The host holds out the mic: "${ME(G)}, the new manager of Sirichai Camp, any message for the fight fans?"`},
  {choice:[{t:"Thank you to everyone who still believes in this little camp",fx:G=>{G.rep+=1;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+6));},then:[{n:"kati",f:"flustered",l:"casual",t:"…That was beautiful. I almost cried on live TV"}]},
   {t:"Anyone who wants Sirichai, see you in the ring!",fx:G=>{G.rep+=1.5;},then:[{n:"nar",t:"The clip spreads across the district. Half the comments praise you, the other half want a fight"}]}]}]},
 {id:"fame50",look:"casual",when:G=>G.rep>=50,bg:"camp",steps:[
  {n:"nar",t:"A gold van parks outside. The side reads 'Three-Headed Elephant Muay Oil'"},
  {n:"npc",who:"Company rep",t:G=>`${ME(G)}, our company would like to be the camp's regular sponsor, 1,500 baht a week. All we ask is that your fighters use our boxing liniment before they fight`},
  {n:"rin",f:"happy",l:"casual",t:"The contract is good. I read all 14 pages. Nothing odd, except the smell of the oil"},
  {inject:G=>{G.sponsorWk=1500;return [{n:"nar",t:"The camp gains a regular sponsor: ฿1,500 every week"}];}}]},
 {id:"fame60",look:"casual",when:G=>G.rep>=60,bg:"camp",steps:[
  {n:"nar",t:"Monday morning, a big carved sign arrives: 'Outstanding Muay Thai Camp of the Province'. The district chief cuts the ribbon himself"},
  {n:"coach",t:G=>`Grandpa Chai always dreamed of this sign. ${ME(G)} made that dream come true`},
  {n:"kati",f:"happy",l:"casual",t:"I'll polish this sign every morning! …Right after Grandpa's photo"},
  {inject:G=>{roster(G).forEach(f=>{f.morale=Math.min(100,f.morale+10);f.trust=Math.min(100,(f.trust||0)+3);});G.camp.beauty=Math.min(10,(G.camp.beauty||0)+1);return [];}}]},
 {id:"ploy_prefinal",look:"fight",when:G=>G.week>=48&&G.bookings.some(b=>b.tier==="final"&&b.a==="kati"&&b.b==="ploy"),bg:"ring",steps:[
  {n:"nar",t:"In the fighters' room behind the provincial ring, Kati and Ploy meet at the same mirror"},
  {n:"ploy",f:"happy",l:"fight",t:"Kati, you've changed a lot this year… I watched the tape of every one of your fights, you know"},
  {n:"kati",f:"surprised",l:"fight",t:"You watched my tapes, Ploy?"},
  {n:"ploy",f:"sad",l:"fight",t:"I never had to watch anyone's tapes before. Everything always came easy… until I saw you training at five every morning"},
  {n:"kati",f:"angry",l:"fight",t:"I don't have your talent. All I have is twenty hours a day of refusing to quit. Tonight I'll pour out every bit of it!"},
  {n:"ploy",f:"happy",l:"fight",t:"Good… I'll fight with everything too. You're the first person who's made me afraid to lose"},
  {n:"nar",t:"Ploy turns and walks toward the ring without another word. Kati watches her back… the back she has chased all year",show:[{id:"kati",f:"angry",l:"fight"},{id:"ploy",back:true}]},
  {n:"kati",f:"angry",l:"fight",t:"Tonight… I won't be looking at your back anymore"}]},
 {id:"fah_prefinal",look:"fight",when:G=>G.week>=48&&G.bookings.some(b=>b.tier==="final"&&b.a==="mali"&&b.b==="fah"),bg:"ring",steps:[
  {n:"fah",f:"happy",t:"The Chaiya kid is still standing at the last fight… I'm starting to like you"},
  {n:"mali",f:"happy",t:"Mali's gonna kick so hard you'll remember it your whole life, Fah!"}]},
 {id:"first_class",look:"train",when:G=>G.week>=9,bg:"camp",steps:[
  {n:"nar",t:"Saturday evening, five or six village kids cling to the fence, watching Kati kick the bag without blinking"},
  {n:"kati",f:"flustered",l:"train",t:"Boss… those kids come every day. If we started real classes, would the camp earn more?"},
  {n:"coach",with:"kati",t:"In Grandpa Chai's day this camp had thirty students. Their fees fed every fighter here. The better the reputation, the more people want to train"},
  {choice:[
   {t:"Then start with these kids",fx:G=>{G.rep+=.5;add(G,"kati","morale",5);},then:[{n:"kati",f:"happy",l:"train",t:"Yay! I'll teach them the wai khru first!"}]},
   {t:"We need to upgrade the class yard before we can take more",fx:G=>{add(G,"kati","trust",3);},then:[{n:"coach",t:"Thinking like a camp owner now. Go check the Camp Management screen"}]}]},
  {n:"nar",t:"(The camp's main income is students · grows with fame, the class yard, promotion signs and assistant coaches)"}]},
 {id:"debt_visit",look:"casual",when:G=>G.week>=28,bg:"camp",steps:[
  {n:"nar",t:"A black sedan stops at the gate. A man in a pressed shirt steps out with a folder. He's from the cooperative Grandpa Chai borrowed from"},
  {n:"coach",t:G=>`He's here to collect the remaining ${fmt(G.debt)} …Grandpa never told anyone what he used that money for`},
  {n:"kati",f:"sad",l:"casual",with:"coach",t:"I know… Grandpa paid for my knee surgery, when I was badly hurt three years ago"},
  {choice:[
   {t:"This debt belongs to the camp. We'll pay it together",fx:G=>{add(G,"kati","bond",6);add(G,"kati","trust",5);},then:[{n:"kati",f:"flustered",l:"casual",t:"…Thank you. I'll win even more and clear Grandpa's debt"}]},
   {t:"Why didn't you ever tell anyone?",fx:G=>{add(G,"kati","trust",2);},then:[{n:"kati",f:"sad",l:"casual",t:"Because I was scared everyone would see me as the reason the camp collapsed"},{n:"coach",t:"No one thinks that. Grandpa chose what mattered more"}]}]}]},
 {id:"tiger_news",look:"fight",when:G=>G.week>=32&&G.F.fah.met,bg:"fair",steps:[
  {n:"nar",t:"Local headline: 'Golden Tiger Camp Splurges, Poaches Bangkok Trainer in Bid to Sweep Provincial Titles'"},
  {n:"fah",f:"sad",t:"You saw the news, right… the boss hired someone to watch my every move. What I eat, when I sleep, I have to report it all"},
  {n:"fah",f:"happy",with:"kati",t:"But it's fine. The more pressure, the harder I fight. Tell Kati: if we meet in the late rounds, I won't hold back"},
  {n:"kati",f:"happy",l:"train",with:"fah",t:"Who's asking you to hold back! See you in the provincial ring!"}]},
 {id:"district_mid",look:"train",when:G=>G.week>=36,bg:"night",steps:[
  {n:"nar",t:"Four weeks left in the district round. The camp lights are off except one lamp where Coach Daeng sits writing in his log"},
  {n:"coach",t:G=>{const rows=standings(G,"A");const i=rows.findIndex(r=>r.f.camp==="player");return i<0?"We're not on the district board this year, but I still log every fight. Next year we'll know what to fix":i<4?`Now ${rows[i].f.name} is ranked #${i+1}. Stay in the top four and you go to the provincial semis. Don't risk injury now`:`Now ${rows[i].f.name} is ranked #${i+1}. Needs at least two more wins to make the final four`;}},
  {n:"coach",t:"Grandpa Chai once told me 'a camp isn't measured by championships, but by the people who stay together when they lose' …I only understand it now"}]},
];

const LK_LINES={
 kati:[{n:"kati",f:"flustered",t:"Inviting me?… Not just because I'm your first fighter, right? Kidding, let's go!"},{n:"kati",f:"happy",t:"I wish our camp has lots of laughter every day next year, just like tonight"}],
 mali:[{n:"mali",f:"happy",t:"Yay! I made my own banana-leaf krathong, pretty right~"},{n:"mali",f:"flustered",t:"I wish my family is well… and that I get to stay at this camp a long time"}],
 rin:[{n:"rin",f:"happy",t:"Bread krathongs decompose forty times faster than foam… sorry, habit"},{n:"rin",f:"flustered",t:"This year I wished for something that can't be calculated… don't ask what"}],
 ploy:[{n:"ploy",f:"flustered",t:"…Inviting someone from a rival camp to float krathongs. Not afraid of being seen?"},{n:"ploy",f:"happy",t:"Thank you. I haven't been to a festival like this since becoming captain"}],
 fah:[{n:"fah",f:"happy",t:"Huh, inviting Fah? Bold! …Fine, but you're buying the Isan sausage"},{n:"fah",f:"flustered",t:"What did Fah wish for? Secret! …But it might be a little bit about you"}],
};

const BOND_EVENTS={
 kati:{lv1:[{n:"kati",f:"sad",t:"Manager… sometimes I'm scared that if I lose, you'll be disappointed and leave like everyone else"},
   {choice:[{t:"I'm not here because you win",fx:G=>add(G,"kati","trust",6),then:[{n:"kati",f:"flustered",t:"…Remember that. I'll hold you to it every time I lose"}]},
            {t:"If we lose, we lose together",fx:G=>add(G,"kati","bond",4),then:[{n:"kati",f:"happy",t:"Together… what a nice word"}]}]}]},
 mali:{lv1:[{n:"mali",f:"sad",t:"You know, I smile all the time because I'm scared that if I stop, people will see how afraid I am"},{n:"mali",f:"flustered",t:"But with you I don't have to try to smile. Funny, isn't it"}]},
 rin:{lv1:[{n:"rin",f:"flustered",t:"I made a spreadsheet of everyone's stats in camp… including you"},{n:"rin",f:"happy",t:"Your 'trust' cell, I've already set to the maximum. Don't make me change it"}]},
 ploy:{lv1:[{n:"ploy",f:"sad",t:"Sometimes I wonder what my life would be like if I'd chosen Sirichai instead of Golden Tiger back then"},{n:"ploy",f:"happy",t:"…Forget I said that. But thank you for listening"}]},
 fah:{lv1:[{n:"fah",f:"flustered",t:"Hey, you're the first one who isn't scared of Fah's tattoo. It's a leaping-tiger yant. Grandma gave it to me before she passed"},{n:"fah",f:"happy",t:"Grandma said a tiger doesn't mean fierce, it means protecting… Fah's still not very good at that"}]},
};
const LOVE_EVENTS={
 kati:[{n:"nar",t:"After evening training, Kati calls you to sit on the ring apron. The gym lights have just gone half off"},
  {n:"kati",f:"flustered",t:"Manager… I know we should keep work and personal things apart, but I want to say it straight, just once"},
  {n:"kati",f:"flustered",t:"I like you. Not as my manager"}],
 mali:[{n:"mali",f:"flustered",t:"I made you a silk wallet, sewed it all night… it's not a thank-you gift. It's… I like you"}],
 rin:[{n:"rin",f:"flustered",t:"I've been calculating for three weeks. Every model gives the same result"},{n:"rin",f:"flustered",t:"I like you. …This is the conclusion I'm most certain of in my life"}],
 ploy:[{n:"ploy",f:"flustered",t:"We're in different camps, and I will never hold back in the ring"},{n:"ploy",f:"flustered",t:"But outside the ring… I want you to be the one I come back to after a fight. Can you?"}],
 fah:[{n:"fah",f:"flustered",t:"Listen. Fah's only saying this once. Laugh and you get punched"},{n:"fah",f:"flustered",t:"…Fah likes you. Done! Answer quick!"}],
};
const LOVE_YES={kati:"…Really? Then from now on I have one more reason to win",mali:"Yay… wait, why am I crying! I'm too happy",
  rin:"The result matches what I hoped for… thank you",ploy:"…Then after my next fight, I'll come find you, win or lose",fah:"…Yeah, good! Don't you dare change your mind, Fah remembers everything"};
// ---------- v1.89.11: more than one lover — Valentine catches you, the girls settle it in the ring, breakup from chat, harem route ----------
const LOVE_IDS=["kati","mali","rin","ploy","fah"];
const vx=(G,id,M)=>(G.F[id]&&G.F[id].camp==="player"&&M["_"+id])||M[id]; /* "_ploy"/"_fah": once she trains at Sirichai */
const lovList=G=>Array.isArray(G.lovers)?G.lovers:(G.romance?[G.romance]:[]);
const isLov=(G,id)=>!!id&&lovList(G).includes(id);
const isProm=(G,id)=>!!(G.promise&&G.promise[id]!=null);
const isEx=(G,id)=>!!(G.exAbs&&G.exAbs[id]!=null);
const exWait=(G,id)=>isEx(G,id)&&absWeek(G)-G.exAbs[id]<12;
const partners=G=>[...new Set([...lovList(G),...Object.keys(G.promise||{}).filter(k=>G.promise[k]!=null)])].filter(k=>G.F&&G.F[k]);
const isPartner=(G,id)=>partners(G).includes(id);
const romOf=(G,id)=>isLov(G,id)&&!G.harem; // lover-only scenes; on the harem route the top scenes give way to group ones
const romFirst=G=>G.harem?null:(lovList(G)[0]||null);
function setLovers(G,L){G.lovers=[...new Set(L)];G.romance=G.lovers[0]||null;G.romWk=G.romance?((G.lovWk||{})[G.romance]??null):null;}
function takeLover(G,id){const solo=!partners(G).some(k=>k!==id);if(G.friendz)delete G.friendz[id];G.lovWk=G.lovWk||{};G.lovWk[id]=absWeek(G);if(G.promise)delete G.promise[id];if(G.exAbs)delete G.exAbs[id];setLovers(G,[...lovList(G),id]);if(solo)add(G,id,"morale",15);}
const isAway=(G,id)=>{const f=G&&G.F&&G.F[id];return !!(f&&f.awayAbs!=null&&absWeek(G)<f.awayAbs);};
const awayLeft=(G,id)=>isAway(G,id)?G.F[id].awayAbs-absWeek(G):0;
const awaySpeaks=(G,steps)=>(steps||[]).some(x=>x&&typeof x.n==="string"&&isAway(G,x.n));
function sendAway(G,id,wk,why){const f=G.F[id];if(!f)return;const now=absWeek(G);f.awayAbs=Math.max(isAway(G,id)?f.awayAbs:0,now+wk);f.awayWhy=why;f.awayBack=false;}
const lovFinal=G=>{for(const id of lovList(G)){if(!romOf(G,id)||!LOVER_FINAL[id])continue;const b=G.bookings.find(b=>b.tier==="final"&&G.F[b.a].camp==="player"&&(b.a===id||id==="rin"));if(b)return {id,b};}return null;};
/* v1.89.11: one label — the closeness name until you are together, then what you are to each other (shown under the hearts) */
function befriend(G,id){G.friendz=G.friendz||{};G.friendz[id]=true;}
const isFriendz=(G,id)=>!!(G.friendz&&G.friendz[id]);
const awayWord=(G,id)=>G.F[id].camp==="player"?"Left camp":"Not in touch";
function relLabel(G,f,lv,short){const id=f&&f.id;if(G&&id&&G.F&&G.F[id]&&isAway(G,id)){const w=G.F[id].awayWhy==="break"?"Heartbroken":"Sulking";return short?w:`${w} · ${awayWord(G,id)} (back in ${awayLeft(G,id)} wk)`;}
  return relBase(G,f,lv);}
/* the ladder shown in her profile: the same labels, the current step lit — lovers climb their own ladder (LOVER_TIERS) */
const REL_DESC={"Acquaintance":"Still calls you \"Manager\", a bit stiffly","Teammate":"Jokes around, texts about everyday things","Close":"Sometimes lets your name slip · shares personal stories","Special":"Always calls you by name",
  "Deeply bonded":"On the same page about almost everything","Kindred":"One look and she knows what you're thinking","Inseparable":"Misses you after a single week apart","Most important person":"You're the first person she thinks of","Partner in the ring":"In the same corner, in the ring and out of it",
  "Lover":"Together","Kindred sweetheart":"Together long enough to know each other's every thought","Inseparable pair":"Can't be apart anymore","Soon-to-be partner":"Starting to talk about the future","Life partner":"Walking the whole road together",
  "Promised":"A promise made, waiting for the day you're in the same camp","Close friend":"You said no once, but you still matter to each other","Ex":"You used to date. Still a little awkward"};
const REL_BRANCH=[["lover","Lover"],["promise","Promised"],["friend","Close friend"],["ex","Ex"]];
/* what she is to you: lover / promise / ex (relState) or a close friend after you said no */
const relKind=(G,f)=>{const id=f&&f.id;if(!G||!id||!G.F||!G.F[id])return null;const st=relState(G,id);if(st)return st;return isFriendz(G,id)&&(G.F[id].bond||0)>=40?"friend":null;};
function relBase(G,f,lv){lv=lv!=null?lv:heartLv(f||{}).lv;const k=relKind(G,f);
  if(k==="lover")return heartTier(lv,f.id)+" ♥"+(G.harem?" (harem)":"");if(k==="friend")return "Close friend";if(k)return heartTier(lv,f.id);return heartTier(lv);}
const relIsStatus=(G,f)=>!!relKind(G,f)||!!(G&&f&&f.id&&isAway(G,f.id));
/* beside the name: only where she is right now */
function relTag(G,f){return "";} /* v1.89.11: everything about the relationship now sits in the one label under the hearts */
// she confesses while you are already with someone — you can tell her the truth
const LOVE_TAKEN={kati:"…I see. Sorry I said anything. Please forget it",mali:"Oh… you already have someone. It's okay, Mali's happy for you",
  rin:"Thank you for being honest. I'll update my data",ploy:"Then I'll keep what I said today to myself",fah:"Huh! Why didn't you say so! …Whatever. Forget what Fah said!"};
const takenOpt=(G,id)=>partners(G).some(k=>k!==id)?[{t:"I'm sorry. I'm already with someone",fx:G3=>{befriend(G3,id);add(G3,id,"trust",3);G3.loveNo=G3.loveNo||{};G3.loveNo[id]=G3.week;},then:[{n:id,f:"sad",l:"casual",t:LOVE_TAKEN[id]}]}]:[];
// an ex who still feels the same, once she has had time
const LOVE_EX={kati:"Manager… I tried. I tried being just your fighter, but I can't",
  mali:"Mali tried to forget. But every time she makes khanom khrok, she still thinks of you",
  rin:"I deleted the data once. But every time I recalculate, the same conclusion comes back",
  ploy:"I told myself I wouldn't look back. I still do",fah:"Fah said she didn't care! …Fah lied"};
// --- Valentine ---
const VAL_GIFT={kati:"Manager! I made chocolate myself for the first time. It's a bit lopsided, but I tried really hard",
  mali:"Happy Valentine's~ Mali made heart-shaped khanom khrok, still warm!",
  rin:"I chose 70% dark chocolate. By my calculations, it suits you best",
  ploy:"I could only sneak out of Golden Tiger for an hour. This rose… take it",
  fah:"Here! Chocolate! Grandma made me buy extra, it's not like I bought it for you!",
  _ploy:"This year I'm in the same camp as you, no need to sneak out. This rose… take it",_fah:"Here! Chocolate! I bought for the whole camp, it's not like it's just for you!"};
const VAL_CAUGHT={kati:"…Manager, could you explain why so many people brought you chocolate today?",
  mali:"Huh… Mali's not the only one? The khanom khrok's still warm, but Mali's heart just went ice cold",
  rin:"The data doesn't match. In my model you have one girlfriend… please explain the surplus",
  ploy:"Oh… I thought I was someone special. Turns out I'm just one in the queue",
  fah:"Huh!? What is this! You've been dating a bunch of us at once!? Should Fah just punch you first!"};
const VAL_AGAIN={kati:"I forgave you last year… and it's the same again?",mali:"Mali thought this year would be different… guess that was just Mali",
  rin:"I gave this model a full year. Same result",ploy:"I'm not here for excuses. I came to see what you'll say this year",fah:"Again!? You didn't learn last year!?"};
const FIGHT_TAUNT={kati:"This is Grandpa's ring. I won't let anyone mess around in it",mali:"Mali doesn't want to hit a friend… but today, just one round!",
  rin:"I've studied all your stats. This round ends in two minutes",ploy:"Want to see what Golden Tiger is really made of? Fine",fah:"Come on! Fah's waited a long time for this. No referee!",_ploy:"Want to see what your senior can really do? Fine"};
/* v1.89.11: the ring is a live bout on auto (one round) — three times the player gets to shout something from ringside */
const BRAWL_TALK=[
 ["The first punch barely misses. The whole camp crowds around the ring",[["Stop! You're both fighters of this camp!",2,"They freeze for half a beat, but neither leaves the ring"],["Someone's going to get hurt. Come down",1,"Nobody listens, but the next punch is a little softer"],["Whoever wins gets the first date with me",-1,"That makes both of them turn and glare at you, then hit each other harder"]]],
 ["Someone at camp starts beating the drums. This is getting out of hand",[["It's my fault. If you want to hit someone, hit me",2,"They both stop and look at you, as if considering the offer"],["Somebody kill the lights!",0,"The lights go out for three seconds, then someone switches them back on. They're both still standing there"],["You two look great out there",-1,"The drums get louder and the whole camp roars"]]],
 ["Both are gasping, but neither will drop her guard first",[["I've never seen you two this out of breath. Please, that's enough",2,"One of them drops her guard first, and the other follows"],["There's morning training tomorrow, you know",1,"They both sigh at once, as if they'd only just remembered"],["It's a draw! You both win!",0,"…Nobody laughs"]]]];
const BRAWL_MID={kati:"Stop smiling! I'm not holding back today!",mali:"Mali doesn't want to hit you! Her hands just keep going!",rin:"You drop your left guard every time you get tired. I've noted it",
  ploy:"Is that all, Sirichai?",fah:"That doesn't even make Fah flinch! Again!",_ploy:"Is that all, kid? That much training isn't enough"};
const FIGHT_OK={kati:"…I'm tired. We'll settle this another day",mali:"Ow, Mali's hands hurt… but she's less angry now",rin:"Stopping here is optimal. Let's call it a draw for now",
  ploy:"Not bad… but this isn't over",fah:"Hmph! I'll let it go today! But you're not off the hook!"};
const RUN_NOTE={kati:"I'm going to the temple to pay respects to Grandpa for a while. Don't come after me",mali:"Mali's gone home to Mom and Thongkham. Back soon… probably",
  rin:"I'm taking leave to review the data. Expected return: about two weeks",ploy:"I won't be in touch for a while. Don't message me",fah:"Fah's at Grandma's! Don't follow!"};
const RUN_BACK={kati:[{n:"nar",t:"Kati comes back to camp before dawn, holding a garland from the temple"},{n:"kati",f:"pout",t:"I asked Grandpa to help me calm down… I'm still angry, but I'll keep training"}],
  mali:[{n:"nar",t:"Mali comes back with a box of sticky rice from her mom"},{n:"mali",f:"sad",t:"Mom says people make mistakes, but they have to own them… have you, Manager?"}],
  rin:[{n:"nar",t:"Rin comes back exactly on the date in her note"},{n:"rin",f:"pout",t:"I've reviewed it. The feelings are still there, but the trust is down. I'll have to collect all the data again"}],
  ploy:[{n:"nar",t:"Ploy messages you after a long silence"},{n:"ploy",f:"sad",t:"I'm half over it. The other half is up to you"}],
  fah:[{n:"nar",t:"Fah's motorbike roars up and stops in front of the camp"},{n:"fah",f:"pout",t:"Grandma said to come back and talk properly, so I'm back! …Not because I missed you!"}]};
function runAway(G,id,wk){const f=G.F[id];sendAway(G,id,wk,"cheat");const mine=f.camp==="player";
  return [{n:"nar",bg:"camp",t:mine?`The next morning, ${f.name} is gone from camp, leaving just one note`:`The next day, ${f.name} sends one short message and then stops answering`},
    {n:"nar",t:`"${RUN_NOTE[id]}"`},{n:"nar",t:mine?`${f.name} is away from camp for ${wk} weeks · No training and no new fights meanwhile (she'll come back for fights already booked)`:`${f.name} won't be in touch for ${wk} weeks`}];}
function ringSteps(G,a,b,hard){const A=G.F[a].name,B=G.F[b].name;
  return [{fx:()=>{if(typeof UI!=="undefined"&&UI.scene)UI.scene.lookOf={};}},/* into fight gear for the ring */
    {n:"nar",bg:"gym",t:`${A} and ${B} lock eyes for one second, then climb into the ring together without a word`},
    {n:a,f:"angry",l:"fight",t:ringTaunt(G,a,b),with:b},{n:b,f:"angry",l:"fight",t:ringTaunt(G,b,a),with:a},
    {n:"nar",t:"All you can do is stand at ringside and shout at the right moment"},
    {brawl:{a,b,hard},after:(G2,res)=>ringAfter(G2,a,b,hard,res||{sc:0})}];}
function ringAfter(G,a,b,hard,res){const A=G.F[a].name,B=G.F[b].name,ok=res.sc>=5,r=[];
  if(ok)r.push({n:"nar",bg:"gym",t:`${A} and ${B} stand panting in the middle of the ring, then suddenly burst out laughing together`},{n:a,f:"pout",l:"fight",t:FIGHT_OK[a],with:b},{n:b,f:"pout",l:"fight",t:FIGHT_OK[b],with:a});
  else r.push({n:"nar",bg:"gym",t:"In the end Coach Daeng throws a whole bucket of ice water over both of them, and that's the end of it"},{n:"nar",t:"They climb out on opposite sides. Neither of them looks at you"});
  if(ok&&!hard)r.push({n:"nar",t:"Nobody runs off that night. But nobody talks to you either"});
  else if(!ok&&hard)r.push(...runAway(G,a,3),...runAway(G,b,3));
  else r.push(...runAway(G,a,hard?3:2));
  return r;}
function valSteps(G){const P=partners(G),hard=(G.valCaught||0)>=1,drop=hard?25:15;G.valCaught=(G.valCaught||0)+1;
  /* the two closest to you settle it in the ring — whichever camp they train at (anyone who already left is not there) */
  const pre=Object.fromEntries(P.map(k=>[k,(G.F[k].bond||0)+(G.F[k].bondX||0)])),byBond=[...P].sort((x,y)=>pre[y]-pre[x]),two=byBond.filter(k=>!isAway(G,k)).slice(0,2);
  return [{n:"nar",bg:"camp",t:hard?"Another Valentine's Day. They all show up together again, but this year nobody is smiling":"February 14th, Valentine's Day. That evening you had a date… several dates, at the same time, in front of Sirichai Camp"},
    ...P.map(k=>({n:k,f:hard?"pout":"happy",l:"casual",t:vx(G,k,hard?VAL_AGAIN:VAL_GIFT)})),
    ...(hard?[]:[{n:"nar",t:`${P.map(k=>G.F[k].name).join(" ")} look at each other, then at what everyone's holding`},...P.map(k=>({n:k,f:k==="mali"?"sad":"angry",l:"casual",t:VAL_CAUGHT[k]}))]),
    {choice:[{t:"I'm sorry. It's my fault",then:[{n:"nar",t:"Nobody answers. The crickets are the loudest thing in the world right now"}]},
      {t:"I really do love all of you. I never lied to anyone",fx:G2=>{G2.haremOK=true;},then:[{n:"nar",t:"A long silence… a few of them blush, angry as they are"}]},
      {t:"Calm down, let me explain",then:[{n:"nar",t:"Before you get a word out, a bag of sweets hits you in the face"}]}]},
    {fx:G2=>{P.forEach(k=>add(G2,k,"bond",-drop));G2.valAbs=absWeek(G2);G2.valFloor=Object.fromEntries(P.map(k=>[k,bondTot(G2.F[k])]));}},{n:"nar",t:`Bond with everyone you're seeing −${drop}`},
    ...(two.length>=2?ringSteps(G,two[0],two[1],hard):[{n:"nar",t:"Nobody steps into a ring. Everyone just leaves in silence, which is worse than a fight"},{inject:G2=>runAway(G2,byBond[0],hard?3:2)}])];}
const backDue=(G,id)=>{const f=G.F[id];return !!(f&&f.met&&f.awayAbs!=null&&!f.awayBack&&absWeek(G)>=f.awayAbs);};
// --- breakup (from the chat menu) ---
const BREAK={kati:[{n:"nar",t:"You ask Kati to talk at the edge of the ring, the same spot where she confessed"},{n:"kati",f:"surprised",t:"…Break up?"},{n:"kati",f:"sad",t:"I'm not crying. Grandpa taught me a fighter never cries in the ring"},{n:"kati",f:"sad",t:"Give me a little time. Then I'll come back as your fighter, same as before"}],
  mali:[{n:"nar",t:"Mali listens in silence, when she usually never stops talking"},{n:"mali",f:"sad",t:"Oh… okay. Mali understands. Mali can smile, see? Smiling"},{n:"nar",t:"The smile wobbles for a moment, then the tears come on their own"},{n:"mali",f:"sad",t:"Mali's going home to Mom for a bit"}],
  rin:[{n:"nar",t:"Rin slowly closes her laptop while you talk"},{n:"rin",f:"sad",t:"Could I have the reasons as a list? …Never mind. I really don't want to hear them"},{n:"rin",f:"sad",t:"Tonight I'll rename the folder with both our names on it. Then I'd like some time off"}],
  ploy:[{n:"nar",t:"Ploy hears you out, then goes back to wrapping her hands as if nothing happened"},{n:"ploy",f:"sad",t:"I've lost plenty of times. This is just one more"},{n:"ploy",f:"sad",t:"Don't come see me for a while. I don't want anyone to see me when I'm not strong"}],
  fah:[{n:"nar",t:"Fah stands still longer than she ever has"},{n:"fah",f:"angry",t:"…Huh? Fine! I don't care one bit!"},{n:"fah",f:"sad",t:"…Fah's staying at Grandma's for a while. Don't follow me. If you do, I'll really punch you"}]};
const BREAK_BACK={kati:[{n:"nar",t:"Kati turns up for morning training as if she'd never left"},{n:"kati",f:"happy",t:"Good morning, Manager… what are we training today?"},{n:"nar",t:"She calls you 'Manager', just like the day you met"}],
  mali:[{n:"nar",t:"Mali comes back with a big box of khanom khrok for the whole camp, you included"},{n:"mali",f:"happy",t:"Mom says you can break up and still be good to each other… Mali will try"}],
  rin:[{n:"nar",t:"Rin comes back with a new binder. The cover says 'Professional Relationship'"},{n:"rin",f:"pout",t:"From now on we only talk about work… at least for a while"}],
  ploy:[{n:"nar",t:"Ploy messages you after a month of silence"},{n:"ploy",f:"happy",t:"I'm okay now. When we meet at the ring, we can say hi like normal"}],
  fah:[{n:"nar",t:"After a whole month of silence, Fah sends one cat sticker"},{n:"fah",f:"pout",t:"…Just showing you the cat's fine. Not because I missed you"}]};
function doBreak(G,id){setLovers(G,lovList(G).filter(k=>k!==id));if(G.promise)delete G.promise[id];if(G.lovWk)delete G.lovWk[id];
  G.exAbs=G.exAbs||{};G.exAbs[id]=absWeek(G);add(G,id,"bond",-35);sendAway(G,id,4,"break");if(G.harem&&partners(G).length<2)G.harem=false;}
function breakSteps(G,id){const f=G.F[id],mine=f.camp==="player";
  return [...BREAK[id].map(x=>({l:"casual",...x})),{fx:G2=>doBreak(G2,id)},
    {n:"nar",t:mine?`${f.name} is away from camp for 4 weeks · Bond −35 · No training and no new fights until she's back`:`${f.name} won't be in touch for 4 weeks · Bond −35`}];}
// --- harem route: after Valentine, if you told the truth and win every one of them back ---
const HAREM_YES={kati:"We've been talking it over all week… not one of us would back down",
  mali:"Nobody wants anybody hurt, so Mali said… then let's just all be together!",
  rin:"I've drafted the rules. One: dates follow a schedule. Two: no more lying to anyone, ever",
  ploy:"I don't like sharing. But if it's someone we all love… I can live with it",
  fah:"And! If you make anyone cry again, Fah punches you first! Got it!"};
const bondTot=f=>(f.bond||0)+(f.bondX||0);
/* winning them back: a few weeks after Valentine, everyone at lover level again and at least +10 over where the scene left them */
const haremReady=G=>{const P=partners(G),fl=G.valFloor||{};return !!G.haremOK&&!G.harem&&P.length>=2&&G.valAbs!=null&&absWeek(G)-G.valAbs>=3&&P.every(k=>bondTot(G.F[k])>=Math.max(75,(fl[k]??0)+10)&&!isAway(G,k));};
function haremForm(G){const P=partners(G);
  return [{n:"nar",bg:"food",t:"One night, weeks after Valentine's, you're summoned to the moo kratha place by the market"},
    {n:"nar",t:`${P.map(k=>G.F[k].name).join(" ")} are waiting at one table, with a single sheet of paper in the middle`},
    ...P.map(k=>({n:k,f:"flustered",l:"casual",t:HAREM_YES[k]})),
    {choice:[{t:"I promise I'll take the best care of all of you",then:[{n:"nar",t:"Everyone clinks their red soda glasses at once, so loud the next table turns to look"}]},
      {t:"…Are you all sure?",then:[{n:"nar",t:"They all nod at once, then laugh at how embarrassed they are"}]}]},
    {fx:G2=>{G2.harem=true;G2.haremAbs=absWeek(G2);}},
    {n:"nar",t:"They're all still your Sweetheart ♥ · No more angry Valentines · Each girl's top heart scene becomes a cute scene with everyone instead"}];}
const HAREM_SCENES=[
 {wk:2,bg:"market",open:"The first group date at the night market. Nobody can agree what to eat first",close:"In the end everyone ate at every stall, and you carried everyone's bags until your arms gave out",
  say:{kati:"Our usual chicken rice! Grandpa brought me here since I was little",mali:"Khanom khrok first~ Dessert opens up the appetite!",rin:"I've sorted the stalls by distance. Least walking, most eating",ploy:"All I want is one Thai tea… and to walk next to you",fah:"Isan sausage! If nobody wants it, Fah's eating it!"}},
 {wk:5,bg:"camp",open:"A day-off morning. Everyone shows up at camp in matching shirts printed 'Team Manager'",close:"Coach Daeng walks past, looks at the shirts, and lets out the longest sigh of his life",
  say:{kati:"It wasn't my idea! …But I picked the color",mali:"Mali printed them herself~ The manager's says 'Team Captain'!",rin:"I ordered everyone's size. Yours I estimated by eye — 97% accurate",ploy:"I can only wear it on days off. If the boss sees, I'm in trouble",_ploy:"Now I can wear it every day. No boss to scold me",fah:"This looks so dumb! …Take a picture though"}},
 {wk:9,bg:"night",open:"A moonlit night. Everyone climbs onto the camp roof, and one blanket isn't nearly enough",close:"You didn't look at a single star, but it's the night you remember best",
  say:{kati:"Scoot over a bit, my legs are out of the blanket",mali:"Mali thinks this beats stargazing alone by a mile",rin:"The brightest star over there is Sirius… why is everyone looking at me instead",ploy:"When I was little, I never had anyone to sit with like this",fah:"Whoever kicks the blanket off one more time, Fah's kicking them off the roof!"}}];
const HAREM_VAL={kati:"This year's chocolate isn't lopsided. I practiced all week",mali:"This year's heart-shaped khanom khrok is for everyone~",
  rin:"This year I weighed everyone's chocolate to the gram. Perfectly fair",ploy:"This year I didn't have to sneak out. I told the boss straight",_ploy:"This year I don't have to sneak anywhere. We're in the same camp",fah:"Chocolate! This year I bought it for you on purpose! …Happy now!"};
const HAREM_END={kati:"Let's stay like this next year too. All of us",mali:"For New Year Mali's taking everyone to Mom's! She's going to be so shocked~",
  rin:"I've already made next year's schedule. Everyone gets the same number of dates",ploy:"Next year I'll still be right here… with all of them",fah:"Next year you're buying sausages for everyone! Not just Fah!"};
const haremYearEnd=G=>[{n:"nar",bg:"camp",t:"New Year's Eve. Everyone sits in a circle around the moo kratha grill at camp, and you're in the middle whether you like it or not"},...partners(G).map(k=>({n:k,f:"flustered",l:"casual",t:HAREM_END[k]}))];
EVENTS.push(
 {id:"lv_val",annual:true,look:"casual",bg:"camp",pri:95,when:G=>G.week>=38&&G.week<=39&&!G.harem&&partners(G).length>=2,steps:[{inject:G=>valSteps(G)}]},
 {id:"lv_valh",annual:true,look:"casual",bg:"camp",pri:95,when:G=>G.week>=38&&G.week<=39&&G.harem&&partners(G).length>=2,steps:[{inject:G=>[
   {n:"nar",t:"This Valentine's Day they all come to see you together, and nobody is angry at anybody"},...partners(G).map(k=>({n:k,f:"happy",l:"casual",t:vx(G,k,HAREM_VAL)})),
   {fx:G2=>partners(G2).forEach(k=>add(G2,k,"bond",3))},{n:"nar",t:"Bond with everyone +3"}]}]},
 {id:"lv_harem",look:"casual",bg:"food",pri:70,when:G=>haremReady(G),steps:[{inject:G=>haremForm(G)}]},
 {id:"lv_back",look:"casual",bg:"camp",pri:80,when:G=>LOVE_IDS.some(k=>backDue(G,k)),steps:[{inject:G=>{const id=LOVE_IDS.find(k=>backDue(G,k));if(!id)return [];const f=G.F[id];f.awayBack=true;
   return [...((f.awayWhy==="break"?BREAK_BACK:RUN_BACK)[id]||[]).map(x=>({l:"casual",...x})),{fx:G2=>{delete G2.seen.lv_back;}}];}}]},
 ...HAREM_SCENES.map((S,i)=>({id:"lv_hm"+(i+1),look:"casual",bg:S.bg,when:G=>!!G.harem&&G.haremAbs!=null&&absWeek(G)-G.haremAbs>=S.wk&&partners(G).length>=2&&!partners(G).some(k=>isAway(G,k)),
   steps:[{inject:G=>[{n:"nar",t:S.open},...partners(G).map(k=>({n:k,f:"happy",l:"casual",t:vx(G,k,S.say)})),{n:"nar",t:S.close}]}]})));
// --- v1.89.11: every pair has its own quarrel — in the Valentine ring and in the spats while you see more than one ---
const pairKey=(a,b)=>[a,b].sort((x,y)=>LOVE_IDS.indexOf(x)-LOVE_IDS.indexOf(y)).join("_");
const PAIR={
 kati_mali:{ring:{kati:"Mali, I could give you my mango sticky rice, but not this!",mali:"You don't have to give it, Kati! Mali will win it herself!"},
  spat:[["mali","pout","Kati's sat next to the manager at dinner three days in a row! Today it's Mali's turn!"],["kati","angry","Because I was here first! I was at this camp before you!"],["mali","angry","Being first doesn't mean you get dibs for life!"]]},
 kati_rin:{ring:{kati:"Rin, you can calculate anything, but not the manager's heart!",rin:"I can. The result says you're at a disadvantage"},
  spat:[["rin","pout","Kati, yesterday the manager talked to you for forty minutes and to me for twenty. I wrote it down"],["kati","angry","Why write that down! Who are you telling!"],["rin","pout","Not tell. The data's unbalanced, and I don't like unbalanced data"]]},
 kati_ploy:{ring:{kati:"You've always taught me, Ploy. Today I'll show you I've graduated!",ploy:"Ten years too early, Kati"},
  spat:[["ploy","happy","Kati, I'm borrowing the manager for the fights at the district stadium on Saturday"],["kati","angry","He's not something to borrow, Ploy! And on Saturday he has a date with me!"],["ploy","flustered","Then the three of us go… kidding. I'll go alone"]]},
 kati_fah:{ring:{kati:"Fah! This ring isn't a playground!",fah:"Fah's not playing! Fah's here for payback!"},
  spat:[["fah","pout","Kati! Who gave Grandma's sausages to the manager yesterday!"],["kati","pout","I gave him Grandpa's favourite pastries. I never touched your sausages!"],["fah","angry","…So you give him things too! Not okay!"]]},
 mali_rin:{ring:{mali:"Rin! Mali's name isn't anywhere on your date schedule!",rin:"Because I made it before I knew you were a rival"},
  spat:[["mali","pout","Rin, you fixed the schedule so you get every Sunday, didn't you!"],["rin","flustered","…Sunday is when everyone's most free. It was a data-driven decision"],["mali","angry","What data! The data that Rin wants to go herself!"]]},
 mali_ploy:{ring:{mali:"Ploy's good at everything, but Mali won't give in on this!",ploy:"Don't give in. I never asked you to"},
  spat:[["mali","sad","Ploy, you're prettier and stronger, and you want the manager too…"],["ploy","sad","…I don't want to beat you at this, Mali"],["mali","pout","But you won't give up either, will you!"]]},
 mali_fah:{ring:{mali:"Fah! At karaoke that night, the manager sang a duet with Mali!",fah:"So what! He's ridden on Fah's bike three times!"},
  spat:[["fah","angry","Mali! Ten heart stickers a day to the manager? Are you nuts!"],["mali","happy","Fah sends twenty cat stickers a day too~"],["fah","flustered","Th-those are cats! It's not the same!"]]},
 rin_ploy:{ring:{rin:"I've analysed your fights for three years. Today I finally use it",ploy:"Three years at ringside isn't the same as three minutes in the ring"},
  spat:[["rin","pout","Ploy, the stats say the manager smiles at your chats 1.4 times more than at mine"],["ploy","happy","You count while he reads his chats? That's scary"],["rin","angry","…I don't count. I observe. And I'd like to change the subject"]]},
 rin_fah:{ring:{rin:"You fight with no plan. I read you from the first step",fah:"What plan! Wherever Fah's heart goes, her fists follow!"},
  spat:[["fah","angry","Rin! Your binder says 'Fah: high risk'. What's that supposed to mean!"],["rin","happy","It means you're high risk. In the ring, and in the manager's heart"],["fah","flustered","…H-huh!? Was that last part a compliment or an insult!"]]},
 ploy_fah:{ring:{ploy:"We've sparred for years, Fah. You've never beaten me",fah:"Today's the day! Fah beats you, in the ring and in this!"},
  spat:[["fah","pout","Ploy! You sat by the river with the manager yesterday, didn't you! That's Fah's spot!"],["ploy","happy","The Ping riverside goes on for kilometres. You reserved all of it?"],["fah","angry","Yes! The whole river! Nobody else sits there!"]]}};
const pairOf=(a,b)=>PAIR[pairKey(a,b)];
const ringTaunt=(G,me,other)=>{const P=pairOf(me,other);return (P&&P.ring[me])||vx(G,me,FIGHT_TAUNT);};
// a pair already argued once — later spats use a short line each
const SPAT_AGAIN={kati:"This again! I'm not giving in!",mali:"Mali asked nicely! Nobody listens!",rin:"I've logged this as the third time this month",
  ploy:"I don't want to fight, but I won't back down either",fah:"Again!? Fah's tired of arguing! …But she'll keep going!"};
const SIDE_WIN={kati:"…See? The manager's on my side",mali:"Yay! The manager gets Mali the most~",rin:"Thank you. My data was right again",ploy:"Thanks… I didn't ask you to take my side, but I'm glad",fah:"Ha! We all know who was right!"};
const SIDE_LOSE={kati:"…Okay. I understand",mali:"Oh… okay. It's Mali's fault, then",rin:"Noted. I won't bring it up again",ploy:"I see. I'll remember that",fah:"Hmph! Fine! I'm not upset!"};
const CLASH_ASK={kati:"Come to the temple with me tonight? The lights are beautiful",mali:"Karaoke's half price tonight! Come with me~",rin:"I've booked a table at the tea house tonight. 7 p.m. sharp",
  ploy:"I'm free tonight. Walk by the river?",fah:"Tonight, hop on the bike, we're getting sausages! No saying no!"};
const CLASH_YES={kati:"You really came! …I thought you'd go somewhere else",mali:"Yay! First song is a duet!",rin:"Right on time. I like that",ploy:"I'm glad you chose me",fah:"Ha! I knew you'd pick Fah!"};
const CLASH_NO={kati:"It's okay. I'll go to the temple by myself",mali:"Oh… you're busy? Then Mali will sing alone",rin:"Reservation cancelled.",ploy:"I see.",fah:"Hmph! Busy, then!"};
const lvRoll=(G,salt)=>mulberry32(((G.seed||1)*7+absWeek(G)*131+salt)>>>0)();
const lvPresent=G=>partners(G).filter(k=>!isAway(G,k));
/* one spat pair: the two who are not both very close to you — the lowest pair first */
const spatPair=G=>{const P=lvPresent(G);let best=null;for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){const a=P[i],b=P[j],ta=bondTot(G.F[a]),tb=bondTot(G.F[b]);if(ta>=100&&tb>=100)continue;if(!best||ta+tb<best.s)best={a,b,s:ta+tb};}return best;};
const sideOpts=(a,b,G)=>[{t:`Side with ${G.F[a].name}`,fx:G2=>{add(G2,a,"bond",3);add(G2,b,"bond",-5);},then:[{n:a,f:"happy",l:"casual",t:SIDE_WIN[a],with:b},{n:b,f:"sad",l:"casual",t:SIDE_LOSE[b],with:a}]},
  {t:`Side with ${G.F[b].name}`,fx:G2=>{add(G2,b,"bond",3);add(G2,a,"bond",-5);},then:[{n:b,f:"happy",l:"casual",t:SIDE_WIN[b],with:a},{n:a,f:"sad",l:"casual",t:SIDE_LOSE[a],with:b}]},
  {t:"Stop them both, take no side",fx:G2=>{add(G2,a,"bond",-2);add(G2,b,"bond",-2);},then:[{n:"nar",t:"They stop arguing, but neither of them is happy with you"}]}];
function spatSteps(G){const p=spatPair(G);if(!p)return [];const {a,b}=p,k=pairKey(a,b);G.spatDone=G.spatDone||{};const first=!G.spatDone[k];G.spatDone[k]=(G.spatDone[k]||0)+1;G.spatAbs=absWeek(G);
  const lines=first&&pairOf(a,b)?pairOf(a,b).spat.map(([n,f,t])=>({n,f,l:"casual",t,with:n===a?b:a})):[{n:a,f:"angry",l:"casual",t:SPAT_AGAIN[a],with:b},{n:b,f:"angry",l:"casual",t:SPAT_AGAIN[b],with:a}];
  return [{n:"nar",bg:"camp",t:`Raised voices behind the camp. ${G.F[a].name} and ${G.F[b].name} turn and see you`},...lines,{choice:sideOpts(a,b,G)},{n:"nar",t:"Whoever you side with +3 bond, the other −5 · Stopping both: −2 each"}];}
function clashSteps(G){const P=lvPresent(G),r=lvRoll(G,9),i=Math.floor(r*P.length),a=P[i],b=P[(i+1+Math.floor(lvRoll(G,11)*(P.length-1)))%P.length];G.clashAbs=absWeek(G);
  const go=(x,y)=>({t:`Out with ${G.F[x].name}`,fx:G2=>{add(G2,x,"bond",3);add(G2,y,"bond",-5);},then:[{n:x,f:"happy",l:"casual",t:CLASH_YES[x]},{n:"nar",t:`Message from ${G.F[y].name}: "${CLASH_NO[y]}"`}]});
  return [{n:"nar",bg:"night",t:"Friday evening. Two chats pop up at once, asking for the exact same time"},{n:a,f:"happy",l:"casual",t:CLASH_ASK[a]},{n:b,f:"happy",l:"casual",t:CLASH_ASK[b]},
    {choice:[go(a,b),go(b,a),{t:"Sorry to both, I'm staying in tonight",fx:G2=>{add(G2,a,"bond",-1);add(G2,b,"bond",-1);},then:[{n:"nar",t:"You spend the night alone staring at the ceiling. Nobody wins"}]}]},
    {n:"nar",t:"Double-booked: the one you went with +3 bond · the other −5"}];}
const lvBusyWeek=G=>G.lvEvAbs===absWeek(G);
EVENTS.push(
 {id:"lv_clash",look:"casual",bg:"night",when:G=>!G.harem&&lvPresent(G).length>=2&&!lvBusyWeek(G)&&absWeek(G)-(G.clashAbs??-99)>=3&&lvRoll(G,3)<.25,
  steps:[{inject:G=>{G.lvEvAbs=absWeek(G);return clashSteps(G);}},{fx:G=>{delete G.seen.lv_clash;}}]},
 {id:"lv_spat",look:"casual",bg:"camp",when:G=>lvPresent(G).length>=2&&!lvBusyWeek(G)&&absWeek(G)-(G.spatAbs??-99)>=4&&!!spatPair(G)&&lvRoll(G,5)<(G.harem?.06:.2),
  steps:[{inject:G=>{G.lvEvAbs=absWeek(G);return spatSteps(G);}},{fx:G=>{delete G.seen.lv_spat;}}]});
// warn before a second "yes"
const cheatWarn=(G,id)=>partners(G).some(k=>k!==id)?[{n:"nar",t:"⚠ You're already seeing someone. Saying yes means two-timing · the sweetheart bonus is lost at once · top heart scenes won't play · more double-bookings and fights · Valentine's Day will catch you out"}]:[];
const yesTxt=(G,id,t)=>partners(G).some(k=>k!==id)?t+" (two-timing)":t;
const lovSolo=G=>partners(G).length===1;
const topLock=(G,id)=>isPartner(G,id)&&partners(G).length>1; /* the top heart scene and the Lv.27/30 chats wait while you see more than one person (harem too) */ /* the lover bonus only holds while you see one person */
// v1.30: lovers get their own dates/scenes; Ploy & Fah make a promise instead (romance with them waits for season 2)
const RIVAL_LOVE=["ploy","fah"];
const LOVER_DATES={"kati": [[{"n": "nar", "t": "Sunday morning. Kati takes you to the temple at the edge of the village, carrying a garland and the pastries Grandpa loved", "bg": "camp"}, {"n": "kati", "t": "Grandpa, this is the person I always tell you about. …Today I'm bringing them as my partner", "f": "happy", "l": "casual"}, {"n": "kati", "t": "He's definitely laughing. He used to tease that no one would date me because I kick too hard", "f": "flustered", "l": "casual"}, {"choice": [{"t": "I'll take good care of your granddaughter", "sc": 3, "then": [{"n": "kati", "t": "…You said that to Grandpa for real. He heard you. No breaking it", "f": "flustered", "l": "casual"}]}, {"t": "Kicking hard is good. Very safe", "sc": 2, "then": [{"n": "kati", "t": "Haha, Grandpa would've liked you", "f": "happy", "l": "casual"}]}]}], [{"n": "nar", "t": "10 p.m. One light still on in the gym. Kati is kicking the bag alone", "bg": "gym"}, {"n": "kati", "t": "Manager… I mean, darling… I'm not used to it yet. What should I call you?", "f": "flustered", "l": "casual", "bg": "casual"}, {"choice": [{"t": "Whatever feels right to you", "sc": 3, "then": [{"n": "kati", "t": "Then 'manager' inside the gym, 'darling' outside it. Work and heart, kept separate", "f": "happy", "l": "casual"}]}, {"t": "Darling sounds nice", "sc": 2, "then": [{"n": "kati", "t": "…Not so loud! Mali's still awake!", "f": "flustered", "l": "casual"}, {"n": "nar", "t": "Giggling drifts out of Mali's bedroom window"}]}]}], [{"n": "nar", "t": "Kati takes you to the old ring by the market, where Grandpa Chai fought forty years ago. It's abandoned now", "bg": "ring"}, {"n": "kati", "t": "Grandpa said this is where he proposed to Grandma. In front of the whole crowd", "f": "happy", "l": "casual"}, {"n": "kati", "t": "…I don't mean anything by it! Just telling you!", "f": "flustered", "l": "casual"}, {"choice": [{"t": "Then let's come back here together someday", "sc": 3, "then": [{"n": "kati", "t": "…Okay. That's a promise. I'll remember today", "f": "flustered", "l": "casual"}]}, {"t": "Grandpa was brave", "sc": 2, "then": [{"n": "kati", "t": "He was. Grandma said she was so embarrassed she wanted to crawl under the ring, haha", "f": "happy", "l": "casual"}]}]}]], "mali": [[{"n": "nar", "t": "Mali hands you her phone: a video call from Isan, a woman beaming with a huge buffalo behind her", "bg": "camp"}, {"n": "mali", "t": "Mom, this is… Mali's partner! And that's Thongkham behind Mom. Say hi", "f": "flustered", "l": "casual"}, {"n": "nar", "t": "Mali's mom speaks Isan dialect so fast you only catch 'Have you eaten yet?'"}, {"choice": [{"t": "I have! Thank you for raising Mali so well", "sc": 3, "then": [{"n": "mali", "t": "Mom's crying! She says you have to come home for New Year", "f": "happy", "l": "casual"}]}, {"t": "Wave at Thongkham", "sc": 2, "then": [{"n": "mali", "t": "Thongkham wagged his tail! He likes you. First test passed!", "f": "happy", "l": "casual"}]}]}], [{"n": "nar", "t": "Mali booked the biggest karaoke room, just like she said. But it's only the two of you", "bg": "night"}, {"n": "mali", "t": "Duet! No skipping the high notes!", "f": "happy", "l": "casual"}, {"choice": [{"t": "Sing at full volume", "sc": 3, "then": [{"n": "nar", "t": "You both belt out luk thung until staff knock three times asking you to keep it down"}, {"n": "mali", "t": "This is the best night of Mali's life!", "f": "happy", "l": "casual"}]}, {"t": "I'd rather just listen to you", "sc": 2, "then": [{"n": "mali", "t": "Then Mali's singing this one just for you. …Listen carefully", "f": "flustered", "l": "casual"}]}]}], [{"n": "nar", "t": "Mali brings you to a little khanom khrok stall behind the market, the kind she says she'll open someday", "bg": "food"}, {"n": "mali", "t": "Mali has a new shop name. Instead of 'Champion Khanom Khrok', maybe 'Our Khanom Khrok'", "f": "happy", "l": "casual"}, {"n": "mali", "t": "…'Our' meaning you and Mali. If you don't mind", "f": "flustered", "l": "casual"}, {"choice": [{"t": "I'll be the one washing the pans", "sc": 3, "then": [{"n": "mali", "t": "Deal! You promised. Washing pans for life!", "f": "happy", "l": "casual"}]}, {"t": "The old name was nice too", "sc": 2, "then": [{"n": "mali", "t": "Then 'Our Champion Khanom Khrok'. Both names~", "f": "happy", "l": "casual"}]}]}]], "rin": [[{"n": "nar", "t": "Rin sent a schedule three days early, titled 'Date No. 1 (Official)', planned down to the minute", "bg": "cafe"}, {"n": "rin", "t": "14:00 tea. 14:20 small talk. 14:35 hold hands (if appropriate). …I left a ten-minute buffer", "f": "flustered", "l": "casual"}, {"choice": [{"t": "What time is it now?", "sc": 3, "then": [{"n": "rin", "t": "…Exactly 14:35", "f": "flustered", "l": "casual"}, {"n": "nar", "t": "Rin rests her hand on the table, right on schedule"}]}, {"t": "Want to ditch the schedule for a day?", "sc": 2, "then": [{"n": "rin", "t": "No schedule… fine, I'll try. If my heart rate goes over plan, that's on you", "f": "flustered", "l": "casual"}]}]}], [{"n": "nar", "t": "Rin shows up to morning training in round glasses. The whole camp goes silent for five seconds", "bg": "camp"}, {"n": "rin", "t": "…No need to stare. I chose based on data I collected, that a certain someone likes round frames", "f": "flustered", "l": "casual"}, {"choice": [{"t": "They suit you perfectly", "sc": 3, "then": [{"n": "rin", "t": "Recorded. 100% satisfaction. …Mine too", "f": "happy", "l": "casual"}]}, {"t": "Who likes round frames, I wonder", "sc": 2, "then": [{"n": "rin", "t": "…Don't pretend you forgot. That data came from you", "f": "flustered", "l": "casual"}]}]}], [{"n": "nar", "t": "Friday night. Rin sits at the computer in the analysis room, drawing some kind of graph", "bg": "night"}, {"n": "rin", "t": "This is my happiness graph since joining Sirichai. Vertical axis, happiness. Horizontal, weeks", "f": "happy", "l": "casual"}, {"n": "rin", "t": "The highest spike… is the week you said yes. Data doesn't lie", "f": "flustered", "l": "casual"}, {"choice": [{"t": "Then let's keep it climbing", "sc": 3, "then": [{"n": "rin", "t": "A good objective. I'll track it weekly", "f": "happy", "l": "casual"}]}, {"t": "That's a beautiful graph", "sc": 2, "then": [{"n": "rin", "t": "…Are you complimenting the graph or me? Please specify", "f": "flustered", "l": "casual"}]}]}]]};
const LOVER_WK=[1,4,8];
const PROMISE_EVENTS={"ploy": [{"n": "ploy", "t": "We're in different camps, and I will never hold back in the ring", "f": "flustered", "l": "casual"}, {"n": "ploy", "t": "I know what I feel for you. …But if I say it now, every punch I throw at Kati stops being honest", "f": "sad", "l": "casual"}, {"n": "ploy", "t": "If someday I'm no longer wearing Golden Tiger colors… ask me again", "f": "flustered", "l": "casual"}, {"choice": [{"t": "I'll wait for that day", "sc": 3, "then": [{"n": "ploy", "t": "…Then I'll fight with everything, so nothing is left unfinished when that day comes", "f": "happy", "l": "casual"}]}, {"t": "Fight your hardest in the ring", "sc": 2, "then": [{"n": "ploy", "t": "Of course. That's the only way I can honor you right now", "f": "happy", "l": "casual"}]}]}], "fah": [{"n": "fah", "t": "Listen. Fah's only saying this once. Laugh and you get punched", "f": "flustered", "l": "casual"}, {"n": "fah", "t": "…Fah likes you. But don't answer! Absolutely no answering right now!", "f": "flustered", "l": "casual"}, {"n": "fah", "t": "Fah's still Golden Tiger, you're still the enemy camp's manager. Not a word about this until Fah beats Ploy! …Then we'll see", "f": "pout", "l": "casual"}, {"choice": [{"t": "Deal. I'll wait", "sc": 3, "then": [{"n": "fah", "t": "…Good! Don't forget. Fah's writing it in her notebook!", "f": "flustered", "l": "casual"}]}, {"t": "Then hurry up and beat Ploy", "sc": 2, "then": [{"n": "fah", "t": "Obviously!! You get Fah better than anyone… ah, Fah didn't say that!", "f": "happy", "l": "casual"}]}]}]};
const LOVER_FINAL={"kati": [{"n": "nar", "t": "The dressing room before the final. Kati wraps her hands in silence. Her right hand trembles a little"}, {"n": "kati", "t": "Manager, could you wrap my right hand? Today I want it to be you", "f": "flustered", "l": "casual", "bg": "fight"}, {"n": "nar", "t": "You wind the wrap one turn at a time. The roar of the crowd seeps through the walls"}, {"n": "kati", "t": "It's stopped shaking. …Grandpa on one side of my heart, you on the other. I'm not scared anymore", "f": "happy", "l": "casual", "bg": "fight"}], "mali": [{"n": "nar", "t": "Mali skips rope outside the dressing room, humming luk thung to calm her nerves"}, {"n": "mali", "t": "Manager~ can Mali have a hug? A power-up hug. Just three seconds", "f": "flustered", "l": "casual", "bg": "fight"}, {"n": "nar", "t": "Three seconds becomes ten, until Coach Daeng clears his throat loudly"}, {"n": "mali", "t": "Fully charged! Fah, here comes Mali!", "f": "happy", "l": "casual", "bg": "fight"}], "rin": [{"n": "nar", "t": "Before the final, Rin hands you a small folded note instead of her usual thick binder"}, {"n": "rin", "t": "The fight plan is in the binder I gave Coach Daeng. This one… isn't a plan", "f": "flustered", "l": "casual"}, {"n": "nar", "t": "In neat handwriting: \"Whatever the result, I'll be standing in your corner\""}, {"n": "rin", "t": "Read it and put it away. No reading it aloud", "f": "flustered", "l": "casual"}]};
const LOVER_END={"kati": [{"n": "kati", "t": "…And next year, I want to take you back to Grandpa's old ring. As two people he doesn't need to worry about anymore", "f": "flustered", "l": "casual"}], "mali": [{"n": "mali", "t": "Mom says there's an extra sleeping spot at home now. Come with Mali for New Year~", "f": "flustered", "l": "casual"}], "rin": [{"n": "rin", "t": "I renamed the file. From 'Three-Year Plan: Sirichai Camp' to 'Three-Year Plan: Us'", "f": "flustered", "l": "casual"}]};
const PROMISE_END={"ploy": [{"n": "nar", "t": "Before parting, Ploy slowly unwraps her hand wraps and places them in your hand"}, {"n": "ploy", "t": "Keep these for me. The day I'm no longer in Golden Tiger colors, I'll come back for them, with my answer", "f": "flustered", "l": "casual"}], "fah": [{"n": "fah", "t": "Fah's notebook is still open to that page. Don't think Fah forgot!", "f": "pout", "l": "casual"}]};
// choices inside these scenes: {t,sc,then} → {t,fx,then} (sc only adds to the date score)
function lvSteps(arr,D,G,id,promise){return arr.map(x=>x.choice?{choice:x.choice.map(o=>({t:o.t,fx:G2=>{if(D)D.score+=o.sc;if(promise){G2.promise=G2.promise||{};G2.promise[id]=G2.week;add(G2,id,"trust",3);}},then:o.then}))}:x);}
const LOVE_AGAIN={kati:"Manager… I haven't forgotten that day. I'm not waiting for a new answer. …Okay, maybe a little",
  mali:"What Mali said that day… Mali still feels the same. Just too shy to say it twice",
  rin:"I reviewed your answer from that day. My conclusion hasn't changed. But I won't ask again, unless you bring it up",
  ploy:"You answered me honestly that day, and I respect it. …But my feelings are where they were",
  fah:"About that day, forget it! …If you can't, fine. Fah hasn't forgotten either"};
const LOVE_NO={kati:"…Mm, I understand. Thank you for answering honestly. Tomorrow I'm still your fighter, same as always",mali:"It's okay! I'm still at this camp, still the same team as always",
  rin:"Understood. New data, new model. It's completely fine",ploy:"Understood. See you in the ring",fah:"Huh! …Fine, fine, but Fah won't hold back in the ring!"};

function pickTalk(f,rng){const pool=TALK[f.id];f.talked=f.talked||[];
  const c=pool.map((_,i)=>i).filter(i=>!f.talked.includes(i));if(!c.length)return null;
  const i=c[Math.floor(rng()*c.length)];f.talked.push(i);return pool[i];}
function freshLine(f,key,arr,rng){f.used=f.used||{};const u=f.used[key]=f.used[key]||[];let c=arr.map((_,i)=>i).filter(i=>!u.includes(i));
  if(!c.length){f.used[key]=[];c=arr.map((_,i)=>i).filter(i=>i!==u[u.length-1]);if(!c.length)c=[0];}
  const i=c[Math.floor(rng()*c.length)];f.used[key].push(i);return arr[i];}
function freshOnce(f,key,arr,rng){f.used=f.used||{};const u=f.used[key]=f.used[key]||[];const c=arr.map((_,i)=>i).filter(i=>!u.includes(i));if(!c.length)return null;const i=c[Math.floor(rng()*c.length)];u.push(i);return arr[i];}
function revealFact(G,f,key){if(!key||f.know[key])return null;f.know[key]=true;const P=PROFILES[f.id];
  if(key==="hobby")return `Hobby: ${P.hobby}`;if(key==="bday")return `Birthday: ${P.bday}`;if(key==="blood")return `Blood type: ${P.blood}`;
  const m=key.match(/^(like|dislike)(\d)$/);if(!m)return null;
  return `${m[1]==="like"?"Likes":"Dislikes"}: ${P[m[1]+"s"][+m[2]]}`;}
// v1.88: heart-level date spots play their own little scene, a different one each visit
function spotSteps(f,act){const L=typeof HEART_SPOT!=="undefined"&&HEART_SPOT[f.id]&&HEART_SPOT[f.id][act];if(!L||!L.length)return [];
  f.spotN=f.spotN||{};const k=f.spotN[act]||0;f.spotN[act]=k+1;return L[k%L.length];}
function dateScene(G,id,act){
  const f=G.F[id],A=ACTIVITIES[act],P=ACT_PREF[id];const rng=Math.random;
  const pref=P.like.includes(act)?"like":P.dislike.includes(act)?"dislike":"ok";
  G.cash-=A.cost;G.freeUsed=true;f.hangWk=G.week;const D={score:pref==="like"?3:pref==="dislike"?-2:0,facts:[]};G._date=D;
  if(pref!=="ok"){const key="act_"+act;if(!f.know[key]){f.know[key]=pref;}}
  const look=act==="spar"?"train":"casual";
  const shuffle=a=>{const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[r[i],r[j]]=[r[j],r[i]];}return r;};
  const talkStep=(T)=>[{n:id,f:"happy",l:look,t:T.q},{choice:shuffle(T.o).map(([t,sc,rep])=>({t,fx:G2=>{D.score+=sc;
       if(sc>=2){const fact=revealFact(G2,f,T.know);if(fact)D.facts.push(fact);}else if(T.know&&!f.know[T.know])D.missed=true;},
     then:[{n:id,f:sc>=2?"happy":sc<0?"sad":"flustered",l:look,t:rep}]}))}];
  const T1=pickTalk(f,rng);
  let mid;
  if(T1)mid=talkStep(T1);
  else{f.momentIdx=f.momentIdx||0;const M=MOMENTS[id];
    const quiet=[`You and ${f.name} spend time together without needing to say much. That's enough`,`${f.name} tells you about today's training at great length; you listen to the end`,`On the way back, ${f.name} slows down a little, as if she doesn't want today to end`,`${f.name} laughs at the little things you say, then says today was nice`];
    mid=f.momentIdx<M.length?[{n:"nar",t:M[f.momentIdx++]}]:[{n:"nar",t:freshLine(f,"quiet",quiet,rng)}];D.score+=1;}
  const intro=freshOnce(f,"in_"+act,A.intro,rng),opener=freshOnce(f,"op_"+pref,OPENERS[id][pref],rng);
  const steps=[{n:"nar",bg:A.bg,t:intro||`${A.name}`},...(opener?[{n:id,f:pref==="dislike"?"sad":"happy",l:look,t:opener}]:[]),
    ...spotSteps(f,act),...mid,...dateTwist(G,f,D,look),
    {inject:G2=>{const gain=Math.max(0,1+Math.round(D.score*.7));const capped=false,b0=hTot(f);add(G2,id,"bond",gain);const real=Math.round((hTot(f)-b0)*2)/2,HL=heartLv(f),hleft=Math.max(0,Math.ceil((HL.need-HL.into)*2)/2);if(gain>=4)add(G2,id,"morale",4);
      if(act==="spar"){f.a.iq=Math.min(20,f.a.iq+.3);f.a.guard=Math.min(20,f.a.guard+.3);f.fatigue=Math.min(100,f.fatigue+4);}
      const tier=gain>=5?"great":gain>=2?"ok":"meh";
      f.closed=f.closed||{};const firstClose=!f.closed[tier];f.closed[tier]=true;
      const out=[...(firstClose?[{n:id,f:tier==="meh"?"sad":"happy",l:look,t:DATE_CLOSE[tier][id]}]:[]),
        {n:"nar",t:`Bond with ${f.name} ${(real>=0?"+":"")+real}${HL.max?" · hearts maxed":heartCapped(G2,f)?" · hearts are full for this chapter":` · ${hleft} to ♥${HL.lv+1}`}${pref==="like"?" · it's an activity she likes!":pref==="dislike"?" · she doesn't seem to like it here":""}${D.facts.length?" · new profile info: "+D.facts.join(" / "):D.missed?" · she seems to have more she wants to share, if you say the right thing":""}`}];
      if(typeof hasSignature!=="undefined"&&hasSignature(f)&&!G2.seen["sig_"+id]){G2.seen["sig_"+id]=true;out.push({n:"nar",t:`✦ The bond unlocked the signature move of ${f.name}: "${SIGNATURE[id].name}" — ${SIGNATURE[id].desc}`});}
      if(f.bond>=40&&!G2.seen["b1_"+id]){G2.seen["b1_"+id]=true;out.push(...BOND_EVENTS[id].lv1.map(x=>({l:look,...x})));}
      if(f.bond>=75&&f.trust>=40&&RIVAL_LOVE.includes(id)&&f.camp==="player"&&(G2.season||1)>=2&&!isLov(G2,id)&&!exWait(G2,id)&&!G2.seen["love2_"+id]){G2.seen["love2_"+id]=true;
        out.push(...LOVE_EVENTS[id].map(x=>({l:"casual",...x})),...cheatWarn(G2,id),{choice:[
          {t:yesTxt(G2,id,"I feel the same way"),fx:G3=>takeLover(G3,id),then:[{n:id,f:"flustered",l:"casual",t:LOVE_YES[id]}]},
          {t:"Thank you, but I want to keep being the one beside you like this",fx:G3=>{befriend(G3,id);add(G3,id,"trust",5);},then:[{n:id,f:"sad",l:"casual",t:LOVE_NO[id]||"…Got it."}]},...takenOpt(G2,id)]});}
      else if(f.bond>=75&&f.trust>=40&&RIVAL_LOVE.includes(id)&&f.camp==="rival"&&!G2.seen["love_"+id]){G2.seen["love_"+id]=true;out.push(...lvSteps(PROMISE_EVENTS[id],null,G2,id,true).flatMap(x=>x.choice?[...cheatWarn(G2,id),{choice:[...x.choice,...takenOpt(G2,id)]}]:[{l:"casual",...x}]),{inject:G3=>isProm(G3,id)?[{n:"nar",t:`Relationship with ${f.name}: Promised ♡ · this story continues in season two`}]:[]});}
      else if(f.bond>=75&&f.trust>=40&&!isLov(G2,id)&&!RIVAL_LOVE.includes(id)&&!G2.seen["love_"+id]){G2.seen["love_"+id]=true;
        out.push(...LOVE_EVENTS[id].map(x=>({l:"casual",...x})),...cheatWarn(G2,id),{choice:[
          {t:yesTxt(G2,id,"I feel the same way"),fx:G3=>takeLover(G3,id),then:[{n:id,f:"flustered",l:"casual",t:LOVE_YES[id]}]},
          {t:"Thank you, but I want to keep being the one beside you like this",fx:G3=>{befriend(G3,id);add(G3,id,"trust",5);G3.loveNo=G3.loveNo||{};G3.loveNo[id]=G3.week;},then:[{n:id,f:"sad",l:"casual",t:LOVE_NO[id]}]},...takenOpt(G2,id)]});}
      // v1.29.3: a second chance — she won't ask twice, but after a while she lets you know the door is still open
      else if(f.bond>=75&&f.trust>=40&&!isLov(G2,id)&&!exWait(G2,id)&&!RIVAL_LOVE.includes(id)&&G2.seen["love_"+id]&&G2.week-((G2.loveNo&&G2.loveNo[id])||-99)>=2){G2.loveNo=G2.loveNo||{};G2.loveNo[id]=G2.week;
        out.push({n:id,f:"flustered",l:"casual",t:isEx(G2,id)?LOVE_EX[id]:LOVE_AGAIN[id]},...cheatWarn(G2,id),{choice:[
          {t:yesTxt(G2,id,isEx(G2,id)?"I still miss you too. Let's get back together":"I answered too fast that day. I feel the same way"),fx:G3=>takeLover(G3,id),then:[{n:id,f:"flustered",l:"casual",t:LOVE_YES[id]}]},
          {t:"I'd like to stay by your side, just like this",fx:G3=>{befriend(G3,id);add(G3,id,"trust",2);},then:[{n:"nar",t:`${f.name} smiles and nods, and says nothing more`}]}]});}
      return out;}}];
  if(romOf(G,id)&&LOVER_DATES[id]){f.lovIdx=f.lovIdx||0;const lw=(G.lovWk||{})[id],since=absWeek(G)-(lw!=null?lw:absWeek(G)-1);
    if(f.lovIdx<LOVER_DATES[id].length&&since>=LOVER_WK[f.lovIdx]){const sc=lvSteps(LOVER_DATES[id][f.lovIdx++],D,G,id,false);D.score+=2;return [...sc,steps[steps.length-1]];}}
  return steps;
}

// ---------- ENDINGS ----------
// v1.50: from year 2 on, the year closes with a recap instead of the story ending
// v1.82.2: year-end memory album — built from what the save already records (fights, honors, joins, pets, festivals, birthdays)
const memSeasonOf=abs=>Math.floor((abs-1)/52)+1,memWeekOf=abs=>((abs-1)%52)+1;
const MEM_BIG=new Set(["ploy","fah","pailin","vector_A","vector_B","prod_A","prod_B"]);
function yearMemories(G,y){const M=[],nm=id=>(G.F[id]&&G.F[id].name)||"";
  for(const h of (G.honors||[]))if(h.season===y&&G.F[h.id])M.push({pri:100,wk:h.week,bg:"hall",txt:`${nm(h.id)} won the ${honorLabel(h.kind,h.venue)} Div ${h.div}`});
  const joins=(G.joinLog||[]).slice();const fl=G.flags||{};
  if(fl.fahJoinedAbs!=null&&!joins.some(j=>j.id==="fah"))joins.push({id:"fah",season:memSeasonOf(fl.fahJoinedAbs),wk:memWeekOf(fl.fahJoinedAbs)});
  if(fl.ployJoinedAbs!=null&&!joins.some(j=>j.id==="ploy"))joins.push({id:"ploy",season:memSeasonOf(fl.ployJoinedAbs),wk:memWeekOf(fl.ployJoinedAbs)});
  for(const j of joins)if(j.season===y&&G.F[j.id]&&G.F[j.id].camp==="player")M.push({pri:90,wk:j.wk,bg:"camp",txt:`${nm(j.id)} moved into Sirichai Camp`});
  for(const [k,w] of Object.entries(G.lovWk||{}))if(w!=null&&isLov(G,k)&&memSeasonOf(w)===y)M.push({pri:85,wk:memWeekOf(w),bg:"night",txt:`${nm(k)} and the Manager started dating`});
  const cal=(G.cal||[]).filter(c=>(c.season||1)===y);
  const allW=(G.cal||[]).filter(c=>c.res==="W").sort((a,b)=>(a.absWeek||0)-(b.absWeek||0));
  if(allW[0]&&(allW[0].season||1)===y)M.push({pri:78,wk:allW[0].wk,bg:"ring",txt:`The camp's first win · ${nm(allW[0].a)} Win ${allW[0].bn||"Opponent"}`});
  const seenBig=new Set();
  for(const c of cal)if(c.res==="W"&&MEM_BIG.has(c.b)&&!seenBig.has(c.b)){seenBig.add(c.b);M.push({pri:c.b==="ploy"||c.b==="pailin"?82:72,wk:c.wk,bg:"final",txt:`${nm(c.a)} takes down ${c.bn||nm(c.b)}!`});}
  const ko=cal.filter(c=>c.res==="W"&&/KO|น็อก/.test(c.type||"")).length;if(ko>=3)M.push({pri:50,wk:null,bg:"ring",txt:`This year the camp won by KO ${ko} fights`});
  for(const p of (G.pets||[]))if(p.since!=null&&memSeasonOf(p.since)===y)M.push({pri:60,wk:memWeekOf(p.since),bg:"camp",txt:`${p.name} became the camp's newest member`});
  const SY=G.seenY||{};
  if(SY.fest_songkran===y)M.push({pri:40,wk:47,bg:"temple",txt:"Songkran: the whole camp splashed water until Kru Daeng was soaked head to toe"});
  if(SY.fest_krathong===y)M.push({pri:40,wk:26,bg:"river",txt:"Floating krathongs together by the river. Nobody would say what they wished for."});
  if(SY.fest_newyear===y)M.push({pri:38,wk:32,bg:"market",txt:"The whole camp celebrated New Year together"});
  for(const id of ["kati","mali","rin","ploy","fah"])if(SY["bday_"+id]===y&&G.F[id])M.push({pri:36,wk:bdayWeek(id),bg:"cafe",txt:`Birthday: ${nm(id)}`});
  const vr=(G.vecRec||{})[y];if(vr&&vr.w+vr.l>0)M.push({pri:65,wk:null,bg:"hall",txt:`This year against Vector: Sirichai won ${vr.w} lost ${vr.l}`});
  return M;}
function pickMemories(M,n){return M.slice().sort((a,b)=>b.pri-a.pri).slice(0,n).sort((a,b)=>(a.wk||99)-(b.wk||99));}
function memStep(m,y){return {n:"nar",bg:m.bg,t:`📷 ${m.wk?`Year ${y} week ${m.wk}`:`Year ${y}`} · ${m.txt}`};}
function yearAlbumSteps(G){const y=G.season||1,mem=pickMemories(yearMemories(G,y),6),cal=(G.cal||[]).filter(c=>(c.season||1)===y);
  const w=cal.filter(c=>c.res==="W").length,l=cal.filter(c=>c.res==="L").length,hon=(G.honors||[]).filter(h=>h.season===y).length;
  const out=[{n:"nar",bg:"camp",t:`Before the yearly photo, Kati opens the camp's thick scrapbook and turns to year ${y}`}];
  if(mem.length)out.push(...mem.map(m=>memStep(m,y)));else out.push({n:"nar",bg:"gym",t:`📷 Year ${y} · A quiet year of training every morning. No one badly hurt, no one gave up.`});
  out.push({n:"nar",bg:"camp",t:`Year ${y} recap: won ${w} lost ${l}${hon?` · ${hon} honors`:""} · ${students(G)} students · camp funds ${fmt(G.cash)}`});
  return out;}
// Year 5 closes the main story: one memory per year, totals, and a word for Grandpa Chai
function fiveYearSteps(G){const out=[{n:"nar",bg:"camp",t:"Five yearly photos hang side by side on the camp wall. Everyone stands looking a little longer than usual."}];
  for(let y=1;y<=5;y++){const top=pickMemories(yearMemories(G,y),1)[0];out.push(top?{...memStep(top,y),t:`🖼️ Year ${y} · ${top.txt}`}:{n:"nar",bg:"gym",t:`🖼️ Year ${y} · The year everyone trained together every morning`});}
  const cal=G.cal||[],w=cal.filter(c=>c.res==="W").length,l=cal.filter(c=>c.res==="L").length,hon=(G.honors||[]).length;
  const R=roster(G),top=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
  out.push({n:"nar",bg:"camp",t:`Five years of Sirichai: ${w+l} fights, won ${w} · ${hon} honors · ${R.length} fighters in camp`});
  out.push({n:"coach",bg:"letter",t:"Five years ago this camp had nothing but debt, a leaking roof, and one girl who refused to stop training. …Grandpa Chai must be smiling somewhere."});
  if(R.some(f=>f.id==="kati"))out.push({n:"kati",f:"happy",l:"casual",t:`Grandpa, our camp isn't closing anymore. And I'm not the only one left here now.`});
  if(top&&top.id!=="kati")out.push({n:top.id,f:"happy",l:"casual",t:`${CALL(G,top.id)}, let's stay together like this in year six too, okay?`});
  return out;}
function yearEndScene(G){const y=G.season||1,R=roster(G),pChamp=Object.entries(G.champ).filter(([d,id])=>G.F[id]&&G.F[id].camp==="player").map(([d,id])=>G.F[id]);
  const top=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
  const steps=[{n:"nar",t:`Late May. Year ${y} at Sirichai Camp comes to a close. Everyone lines up in front of the camp sign for the yearly photo.`},
    pChamp.length?{n:"coach",t:`${pChamp.map(f=>f.name).join(" and ")} won the provincial title this year. The new trophy sits in the hall of fame next to Grandpa Chai's photo.`}
      :{n:"coach",t:"No trophy this year, but everyone is still here, still training together every morning… That's how you measure a camp."},
    G.debt>0?{n:"nar",t:`Grandpa Chai's debt still has ${fmt(G.debt)} left. We'll keep paying it off, year by year.`}:{n:"nar",t:"Sirichai Camp is debt-free now. The sign belongs to all of us."}];
  if(top)steps.push({n:top.id,f:"happy",l:"casual",t:`${CALL(G,top.id)}, let's stay together like this next year too.`});
  if((G.pets||[]).length)steps.push({n:"nar",t:`${G.pets.map(p=>p.name).join(" ")} have to be in the photo too. Posing the pets takes longer than posing the people.`});
  steps.push({n:"nar",t:`The self-timer clicks. The photo for year ${y} is hung next to last year's on the camp wall.`});
  steps.unshift(...yearAlbumSteps(G));if(y===5)steps.push(...fiveYearSteps(G));
  return {key:"year",title:pChamp.length?`Year ${y} · Champions again`:`Year ${y} · The camp goes on`,steps,bg:"camp",look:"casual"};}
function endingScene(G){if((G.season||1)>=2&&G.ended!=="bankrupt")return yearEndScene(G);
  const pChamp=Object.entries(G.champ).filter(([d,id])=>G.F[id]&&G.F[id].camp==="player").map(([d,id])=>G.F[id]);
  const pFinal=[...G.finalists.A,...G.finalists.B].some(id=>G.F[id].camp==="player");
  const pQual=[...G.qual.A,...G.qual.B].some(id=>G.F[id].camp==="player");
  let key,title,steps=[];
  if(G.ended==="bankrupt"){key="bankrupt";title="Camp closed for now";
    steps=[{n:"nar",bg:"camp",t:"The account stayed in the red for weeks. The bank sent a notice to seize the camp land"},
      {n:"kati",f:"sad",t:"…It's okay. I'll fight at temple fairs to earn money first, and someday we'll reopen this camp"},
      {n:"nar",t:"The 'Sirichai' sign comes down, but Kati keeps it under her bed. Every night she still wraps her hands and trains"}];}
  else if(pChamp.length){key="champion";title="Provincial champion!";
    steps=[{n:"nar",bg:"ring",t:`Drums thunder across the ring. ${pChamp.map(f=>f.name).join(" and ")} raises the provincial championship belt. Sirichai Camp is back on the map`},
      {n:"coach",t:"Grandpa Chai… can you see? Your grandchild did it"},
      {n:pChamp[0].id,f:"happy",t:"We did it! Our camp!"}];}
  else if(pFinal||pQual){key="growth";title="Missed the title, but the camp grew";
    steps=[{n:"nar",bg:"camp",t:"No belt this year, but the Sirichai name is once again talked about in the provincial scene"},
      {n:"kati",f:"happy",t:"Next year we'll go further. I promise"}];}
  else {key="survive";title="Barely held the camp together";
    steps=[{n:"nar",bg:"camp",t:"The camp is still open, the debt isn't gone, results aren't great, but the light in the camp hasn't gone out"},
      {n:"kati",f:"happy",t:"The first year is the hardest. Next year has to be better"}];}
  if(key!=="bankrupt"&&typeof personalEnding==="function")steps.push(...personalEnding(G));
  if(G.harem&&key!=="bankrupt")steps.push(...haremYearEnd(G));
  else if(romFirst(G)&&key!=="bankrupt")steps.push({n:romFirst(G),f:"flustered",t:{kati:"Next year… let's stay together like this, in camp and outside it",mali:"This New Year, I'm taking you to my home, Mom wants to meet you~",
    rin:"I've already planned next year. Your name is on every page",ploy:"Next year we're still rivals… and the most important people to each other",fah:"Next year you're still buying Fah sausage. Forever!"}[romFirst(G)]});
  steps.push(...season2Hooks(G,key));
  steps.push({n:"nar",t:"— End of the year-one demo · Thank you for playing Muay Thai Moe —"});
  return {key,title,steps};
}

// v1.5: face-off before a canon vs canon fight (angry portraits), once per opponent per stage
const TAUNTS={
 kati_fah:[["fah","You finally made it, kid from the abandoned camp. Tonight I'll make you remember the Golden Tiger name till you die"],["kati","Our camp isn't abandoned anymore! And the one who'll remember a name… is you. Sirichai!"]],
 kati_ploy:[["ploy","Kati, your punches are good, but you're too hot-headed. Tonight I'll teach you how Korat fights"],["kati","Teach me if you can, Ploy! I'm not the kid who stands there and takes it anymore!"]],
 mali_fah:[["fah","Crybaby Chaiya kid, you dare to step in here again? Watch that flower on your head doesn't fall off"],["mali","Don't look down on me! Block, parry, close, open… I'll open your eyes to the stars!"]],
 mali_ploy:[["ploy","Mali, your Chaiya form is pretty, but pretty alone doesn't win"],["mali","Then today I'll win pretty for you to see!"]],
 rin_fah:[["fah","Glasses girl, fighting yourself now? Does your spreadsheet say which round you get knocked out?"],["rin","It does. Round three… yours. Seventy-two percent probability"]],
 rin_ploy:[["ploy","Rin, who used to be on my camp's staff… I never thought we'd stand in opposite corners"],["rin","I thought about it a long time ago. And I've already planned how to win"]],
};
function tauntScene(G,me,op){const T=TAUNTS[`${me}_${op}`];if(!T)return null;
  return [{n:"nar",t:vary("face",["In the center of the ring, the two fighters stand face to face before the pi chawa begins","The referee calls both to the center, barely a hand's width apart","The spotlight hits the center of the ring; the two stare each other down, neither looks away","The crowd goes silent before the bout as the two fighters meet in the center"])},
    {n:T[0][0],f:"angry",l:"fight",t:T[0][1]},{n:T[1][0],f:"angry",l:"fight",with:T[0][0],t:T[1][1]},
    {n:"nar",t:vary("face2",["The cheers explode; the referee sends both back to their corners","The referee steps in between; each walks back to her corner without breaking eye contact","The announcer shouts over the cheers; both turn back to their corners at the same time","The crowd roars; the referee has to raise a hand to separate them"])}];}

// ---------- v1.7: mid-season dilemmas (one decision, real trade-offs, each once) ----------
const DILEMMAS=[
 {id:"d_sponsor",from:10,to:40,need:G=>true,bg:"camp",look:"train",steps:[
  {n:"nar",t:"The gold shop owner from the market walks into camp and hands over a red envelope"},
  {n:"coach",t:"He'll sponsor ฿15,000 in exchange for our fighters doing an exhibition at his new branch opening. Exhausting, but that's no small sum"},
  {choice:[{t:"Take it, money matters (+฿15,000 · everyone fatigue +15)",fx:G=>{G.cash+=15000;roster(G).forEach(f=>f.fatigue=Math.min(100,f.fatigue+15));add(G,"kati","morale",-4);},then:[{n:"kati",f:"pout",l:"train",t:"An exhibition outside a gold shop… okay. For the camp"}]},
   {t:"Decline, I don't want the fighters worn out (fame +0.5)",fx:G=>{G.rep+=.5;add(G,"kati","trust",4);},then:[{n:"kati",f:"happy",l:"train",t:"Thank you for thinking of us first"}]}]}]},
 {id:"d_roof",from:12,to:44,need:G=>!(G.seen&&G.seen.h_roof),bg:"gym",look:"train",steps:[
  {n:"nar",t:"A storm hit last night. The east training-yard roof leaks in streams, dripping into the middle of the ring"},
  {n:"coach",t:"Fixing it now costs ฿6,000. Leave it and the floor stays slippery, training suffers, and the camp looks worse"},
  {choice:[{t:"Fix it now (−฿6,000)",fx:G=>{G.cash-=6000;},then:[{n:"coach",t:"Good. Things like this only get more expensive if you wait"}]},
   {t:"Wait for now (camp looks worse · morale −5)",fx:G=>{G.camp.beauty=Math.max(0,G.camp.beauty-2);roster(G).forEach(f=>f.morale=Math.max(0,f.morale-5));},then:[{n:"kati",f:"pout",l:"train",t:"Slipping around while training… it's fine, I can take it"}]}]}]},
 {id:"d_bet",from:16,to:46,need:G=>G.bookings.some(b=>G.F[b.a].camp==="player"),bg:"night",look:"fight",steps:[
  {n:"nar",t:"A man in dark glasses waits at the gate at nine at night. He says quietly he's from a gambling table in town"},
  {n:"nar",t:"\"Have your fighter lose in round three next fight. I'll pay twenty thousand. Nobody will know\""},
  {choice:[{t:"Throw him out of the camp (fame +1)",fx:G=>{G.rep+=1;roster(G).forEach(f=>add(G,f.id,"trust",5));},then:[{n:"coach",t:"Grandpa Chai threw out three men like that. I'm glad we're like him"}]},
   {t:"Take the money (+฿20,000 · fame −4 · trust drops hard)",fx:G=>{G.cash+=20000;G.rep=Math.max(0,G.rep-4);roster(G).forEach(f=>{add(G,f.id,"trust",-15);add(G,f.id,"morale",-10);});G.flags.tookBribe=true;},then:[{n:"kati",f:"sad",l:"fight",t:"…I heard everything. I never thought Grandpa's camp would…"}]}]}]},
 {id:"d_tv",from:14,to:42,need:G=>G.rep>=14,bg:"camp",look:"train",steps:[
  {n:"nar",t:"A local documentary crew calls, asking to film three days of life in a women's Muay Thai camp"},
  {choice:[{t:"Let them film (fame +1.5 · everyone fatigue +6)",fx:G=>{G.rep+=1.5;roster(G).forEach(f=>f.fatigue=Math.min(100,f.fatigue+6));},then:[{n:"kati",f:"flustered",l:"train",t:"D-do I have to smile at the camera? I don't know how to smile!"}]},
   {t:"Decline, let us train in peace",fx:G=>{roster(G).forEach(f=>f.morale=Math.min(100,f.morale+2));},then:[{n:"coach",t:"Fine. Let them film when we're champions"}]}]}]},
 {id:"d_mali_leave",from:12,to:40,need:G=>G.F.mali.camp==="player",bg:"camp",look:"casual",steps:[
  {n:"mali",f:"sad",l:"casual",t:"Boss… Mom called. The rice is ready and there's no one to help harvest. Can I go home for a week?"},
  {choice:[{t:"Go. Family matters (Mali rests all week)",fx:G=>{const f=G.F.mali;f.plan.preset="rest";f.fatigue=0;add(G,"mali","bond",5);add(G,"mali","trust",8);},then:[{n:"mali",f:"flustered",l:"casual",t:"Thank you! I'll bring new rice for the whole camp~"}]},
   {t:"This is an important stretch, please stay and train",fx:G=>{add(G,"mali","morale",-12);add(G,"mali","bond",-3);},then:[{n:"mali",f:"pout",l:"casual",t:"…Okay. I understand"}]}]}]},
 {id:"d_rin_poach",from:20,to:44,need:G=>G.F.rin.camp==="player",bg:"camp",look:"casual",steps:[
  {n:"nar",t:"Rin places a letter on the table. Golden Tiger is offering her a job back as their analyst, at triple the salary"},
  {n:"rin",f:"happy",l:"casual",t:"I just wanted you to know. I'm not asking for a raise"},
  {choice:[{t:"Ask her directly where she wants to be",fx:G=>{add(G,"rin","bond",5);add(G,"rin","trust",6);},then:[{n:"rin",f:"flustered",l:"casual",t:"…Here. The numbers say this place is growing faster. …And it's not just the numbers"}]},
   {t:"Raise her pay to compete (+฿1,000/wk)",fx:G=>{G.F.rin.wage+=1000;add(G,"rin","trust",3);},then:[{n:"rin",f:"pout",l:"casual",t:"I said I wasn't here for money… but thank you"}]}]}]},
 {id:"d_poor_kid",from:9,to:46,need:G=>true,bg:"camp",look:"train",steps:[
  {n:"nar",t:"A skinny girl clings to the fence every evening. Today she's brave enough to walk in and ask if she can learn for free"},
  {choice:[{t:"Let her learn for free (fame +0.8)",fx:G=>{G.rep+=.8;add(G,"kati","bond",3);},then:[{n:"kati",f:"happy",l:"train",t:"I'll teach her myself! Just like when Grandpa took me in"}]},
   {t:"The camp can't take free students yet",fx:G=>{},then:[{n:"kati",f:"pout",l:"train",t:"…Okay. I'll secretly teach her during lunch break"}]}]}]},
 {id:"d_fah_night",from:24,to:46,need:G=>G.F.fah.met,bg:"night",look:"casual",steps:[
  {n:"nar",t:"Eleven at night, a knock at the camp gate. Fah stands there shivering, lips pale"},
  {n:"fah",f:"sad",l:"casual",t:"The boss ordered me to cut three kilos in five days… let me borrow your training yard tonight. At my camp, people are watching"},
  {choice:[{t:"Let her in and make her some rice porridge",fx:G=>{add(G,"fah","bond",6);add(G,"kati","bond",-2);},then:[{n:"fah",f:"flustered",l:"casual",t:"…You're crazy. Why help a rival… thanks"},{n:"kati",f:"pout",l:"casual",with:"fah",t:"That's my rice porridge!"}]},
   {t:"Stay out of other camps' business",fx:G=>{add(G,"fah","bond",-4);},then:[{n:"fah",f:"pout",l:"casual",t:"Hmph, fine. Wasn't expecting anything anyway"}]}]}]},
 {id:"d_ankle",from:8,to:46,need:G=>G.bookings.some(b=>G.F[b.a].camp==="player"&&b.week-G.week<=2),bg:"gym",look:"train",steps:[
  {n:"nar",t:G=>{const b=G.bookings.find(b=>G.F[b.a].camp==="player"&&b.week-G.week<=2);G.tmpAnkle=b.a;return `${G.F[b.a].name} is limping after morning training, left ankle a little swollen. The fight is less than two weeks away`;}},
  {choice:[{t:"Fight as scheduled (fatigue +15)",fx:G=>{const f=G.F[G.tmpAnkle];f.fatigue=Math.min(100,f.fatigue+15);add(G,f.id,"morale",4);},then:[{n:"coach",t:"Tape it tight, and don't kick much with the left"}]},
   {t:"Rest her, withdraw from the fight (fame −1)",fx:G=>{const id=G.tmpAnkle;G.bookings=G.bookings.filter(b=>b.a!==id);G.rep=Math.max(0,G.rep-1);add(G,id,"trust",8);G.F[id].plan.preset="rest";},then:[{n:"coach",t:"The right call. A fighter's body only has one life"}]}]}]},
];
// v1.7: recurring NPC rivals — a line of personality before the bell
const PERSONA={
 "Chanpen T.Prasert":{tag:"Former subdistrict champ, trash talker",line:"An abandoned camp reopened? I'll shut it down again for you"},
 "Praewa Sit Khru Nong":{tag:"Technician, polite",line:"May it be a good fight. Khru Nong sends her regards to Coach Daeng"},
 "Thapthim Kiatsiam":{tag:"Showboat, plays to the crowd",line:"Where's the camera! Today's knockout has to be pretty"},
 "Petchdao Luk Mae Ping":{tag:"Chiang Mai girl, big heart",line:"The Ping River never stops flowing, and I never retreat!"},
 "Namphueng S.Wilaiporn":{tag:"Newcomer, nervous",line:"P-pleased to fight you! Don't go easy on me!"},
 "Saifa W.Wanthawi":{tag:"Fastest in the district",line:"Keep up with me first, then think about winning"},
 "Mukda Petchyindee":{tag:"Cold, never smiles",line:"…"},
 "Butsaba Saengthong Gym":{tag:"Last year's Division B champion",line:"That belt is still at my camp, and it's staying there"},
 "Baitoei S.Mueang Nuea":{tag:"Knee fighter, tall",line:"My range… you'll never get inside it"},
 "Khwankhao Ch.Chaiwat":{tag:"Farmer's daughter, tough",line:"I've harvested rice all year. This isn't tiring"},
};
const DEBT_CLEAR_SCENE=[
 {n:"nar",bg:"camp",t:"The final receipt from the cooperative sits on the shelf beside an old photo of Grandpa Chai"},
 {n:"coach",t:"The debt Grandpa Chai carried for three years… it's gone. He must be laughing up there"},
 {n:"kati",f:"sad",l:"casual",with:"coach",t:"Grandpa… I'm not a burden to the camp anymore"},
 {n:"kati",f:"flustered",l:"casual",t:"Thank you, boss… truly, thank you"}];

// ================= v1.12 mid-season events (weeks 20–43) =================
const R_ALL=(G,fn)=>roster(G).forEach(fn);
EVENTS.push(
 {id:"open_day",look:"fight",when:G=>G.week>=22,bg:"gym",steps:[
  {n:"nar",t:"Sunday morning, the kids from the street pack the camp fence. Some parents are filming on their phones"},
  {n:"kati",f:"surprised",t:"Boss! More people are watching us train than ever, ever since we won the subdistrict round"},
  {n:"coach",t:"We could open the camp for a free try-out day. It'll be tiring, but it wins the neighborhood's hearts"},
  {choice:[{t:"Open a kids' Muay Thai day (fame +1 · fighters fatigue +8)",fx:G=>{G.rep+=1;R_ALL(G,f=>f.fatigue=Math.min(100,f.fatigue+8));add(G,"kati","morale",5);},
      then:[{n:"kati",f:"happy",t:"Everyone, guard up like this! Hands up~ Great job!"},{n:"nar",t:"By evening, three parents come asking about regular classes"}]},
    {t:"Sorry everyone, we need to focus on training (morale +3)",fx:G=>R_ALL(G,f=>f.morale=Math.min(100,f.morale+3)),then:[{n:"kati",f:"happy",t:"When we're champions, let's open the camp big time"}]}]}]},

 {id:"storm",look:"fight",when:G=>G.week>=25,bg:"night",steps:[
  {n:"nar",t:"A storm hits in the middle of the night. The wind is so strong the tin roof roars like it'll blow away; water starts flowing into the training yard"},
  {n:"kati",f:"surprised",t:"Huh! The heavy bags are all soaked! Help me lift them up high!"},
  {n:"coach",t:"In past years the water never reached this far. If we don't fix the gutters, it'll happen again"},
  {choice:[{t:"Hire someone to fix the gutters right away (−฿6,000 · camp looks better)",fx:G=>{G.cash-=6000;G.camp.beauty=Math.min(10,G.camp.beauty+1);},then:[{n:"nar",t:"The repairman arrives at dawn; the camp is dry within a day"}]},
    {t:"Rally the neighbors to help (free · fame +0.5 · everyone fatigue +6)",fx:G=>{G.rep+=.5;R_ALL(G,f=>f.fatigue=Math.min(100,f.fatigue+6));add(G,"kati","bond",3);},
      then:[{n:"nar",t:"The chicken-rice uncle, the som tam auntie and the street's kids help bail water until dawn"},{n:"kati",f:"happy",t:"Grandpa's camp… more people love it than I thought"}]}]}]},

 {id:"temple_fair_fight",look:"fight",when:G=>G.week>=29,bg:"fair",steps:[
  {n:"nar",t:"The temple near camp holds its annual fair. The abbot sends someone to invite Sirichai to fight an exhibition on the fair stage"},
  {n:"coach",t:"In Grandpa Chai's day we fought this fair every year. Not much money, but the whole subdistrict remembered our name"},
  {choice:[{t:"Accept the exhibition (fame +1.2 · +฿2,000 · fatigue +10)",fx:G=>{G.rep+=1.2;G.cash+=2000;R_ALL(G,f=>f.fatigue=Math.min(100,f.fatigue+10));},
      then:[{n:"nar",t:"Pipes and drums fill the temple grounds; the crowd roars every time a Sirichai fighter strikes"},{n:"kati",f:"happy",t:"This temple-fair stage is where I fought for the very first time!"}]},
    {t:"Send only Coach Daeng to perform the wai khru (fame +0.5)",fx:G=>{G.rep+=.5;},then:[{n:"coach",t:"Old, but my dance hasn't slipped. Anyone who says Coach can't dance, come watch"}]}]}]},

 {id:"kati_knee",look:"fight",when:G=>G.week>=31&&G.F.kati.camp==="player",bg:"night",steps:[
  {n:"nar",t:"After training, you see Kati alone in a corner of the camp, wrapping the same knee"},
  {n:"kati",f:"surprised",t:"Oh! Boss… it's nothing, just a bit tight"},
  {n:"coach",t:"That's the knee she had surgery on. If she pushes now, she might miss the whole season"},
  {choice:[{t:"Rest for two weeks, no arguing (trust +6 · fatigue −20)",fx:G=>{const f=G.F.kati;f.fatigue=Math.max(0,f.fatigue-20);add(G,"kati","trust",6);f.plan.preset="rest";},
      then:[{n:"kati",f:"sad",t:"…Okay, but I'll sit and watch everyone train. Don't send me home"}]},
    {t:"Trust her, keep training but lighter (morale +6)",fx:G=>{add(G,"kati","morale",6);G.F.kati.plan.intensity="light";},
      then:[{n:"kati",f:"happy",t:"Thank you for trusting me. I won't push past my limits, promise!"}]}]}]},

 {id:"ploy_doubt",look:"casual",when:G=>G.week>=33&&G.F.ploy.met&&G.F.ploy.camp!=="player",bg:"river",steps:[
  {n:"nar",t:"At dusk by the river, you find Ploy sitting alone, her gloves beside her"},
  {n:"ploy",f:"sad",t:"The boss says if we don't win the title this year, he'll change captains… ten years I've given that camp, and it's worth just one fight?"},
  {choice:[{t:"Your worth isn't in a championship belt",fx:G=>{add(G,"ploy","bond",5);add(G,"ploy","trust",4);},then:[{n:"ploy",f:"flustered",t:"…Saying that to a rival, aren't you afraid I'll win?"}]},
    {t:"Then win and show him. But not for him, for yourself",fx:G=>{add(G,"ploy","bond",3);add(G,"ploy","morale",8);},then:[{n:"ploy",f:"happy",t:"For myself… nobody's ever told me that. Thank you"}]}]}]},

 {id:"daeng_past",look:"fight",when:G=>G.week>=35,bg:"night",steps:[
  {n:"nar",t:"That night Coach Daeng sits polishing an old, faded mongkhon under the camp's single light"},
  {n:"coach",t:"Grandpa Chai put this mongkhon on me the day of the provincial final thirty years ago. My knee broke that night, but I never regretted stepping in that ring"},
  {n:"coach",t:"Wai khru isn't just a pretty dance. It's telling yourself you don't fight alone"},
  {choice:[{t:"Ask Coach to teach everyone the wai khru dance (everyone's morale +6)",fx:G=>R_ALL(G,f=>f.morale=Math.min(100,f.morale+6)),then:[{n:"nar",t:"That week everyone practices the 'Four-Faced Brahma' dance every morning before running"}]},
    {t:"Ask Coach to keep the mongkhon for whoever fights for the title (everyone's trust +4)",fx:G=>R_ALL(G,f=>f.trust=Math.min(100,f.trust+4)),then:[{n:"coach",t:"…All right. If one of ours makes the final this year, I'll put it on them with these hands"}]}]}]},

 {id:"buyout",look:"fight",when:G=>G.week>=37,bg:"gym",steps:[
  {n:"nar",t:"A gold sedan stops at the gate. The Golden Tiger boss walks in with a thick brown envelope"},
  {n:"nar",t:"\"Five hundred thousand. I buy this camp's name, the fighters move to my camp at double pay, you clear your debt, everyone's happy\""},
  {n:"kati",f:"angry",t:"…"},
  {choice:[{t:"This camp isn't for sale (everyone's morale +10 · trust +5)",fx:G=>R_ALL(G,f=>{f.morale=Math.min(100,f.morale+10);f.trust=Math.min(100,f.trust+5);}),
      then:[{n:"kati",f:"happy",t:"Did you hear that, boss! Sirichai is not for sale! You can leave now!"}]},
    {t:"Let me think about it (everyone's trust −6)",fx:G=>{G.cash+=10000;R_ALL(G,f=>f.trust=Math.max(0,f.trust-6));},
      then:[{n:"kati",f:"sad",t:"…Boss, are you really going to sell Grandpa's camp?"},{n:"nar",t:"You return the envelope the next day, but the silence in camp lingers for days"}]}]}]},

 {id:"songkran",look:"casual",when:G=>G.week>=47&&(G.season||1)===1,bg:"songkran",steps:[
  {n:"nar",t:"Songkran arrives. The camp stops training for half a day; everyone pours fragrant Thai scented water over Coach Daeng's hands"},
  {n:"coach",t:"May everyone be strong, free of injury and illness, and fight with the honor of Sirichai…"},
  {n:"kati",f:"happy",t:"The ceremony's over! Now— water fight!!!"},
  {choice:[{t:"Splash back with a full bowl (everyone's morale +8 · fatigue −10)",fx:G=>R_ALL(G,f=>{f.morale=Math.min(100,f.morale+8);f.fatigue=Math.max(0,f.fatigue-10);}),
      then:[{n:"kati",f:"flustered",t:"So cold I'm freezing! But… the most fun all year"}]},
    {t:"Hide behind Coach Daeng (he gets soaked instead)",fx:G=>{add(G,"kati","bond",3);},then:[{n:"coach",t:"Hey! …Boss! Just you wait!"},{n:"kati",f:"happy",t:"Hahaha, Coach Daeng is soaked head to toe!"}]}]}]}
);

// ================= v1.12 date twists — something unexpected on some outings =================
const DATE_TWISTS=[
 {id:"rain",t:f=>`Suddenly rain pours down. You and ${f.name} run under the same shop awning, shoulders touching without meaning to`,
  choice:[{t:"Take off your jacket and cover her head",sc:3,rep:"…Thank you. Now you're the one getting wet"},{t:"Suggest running through the rain together",sc:2,rep:"Totally crazy! But… it's kind of fun"}]},
 {id:"fan",t:f=>`A little girl runs up asking for an autograph from ${f.name}"I watch every one of your fights!"`,
  choice:[{t:"Take a photo of the two of them",sc:3,rep:"I have fans… so nervous my hands are shaking"},{t:"Tell the kid she's resting right now",sc:-1,rep:"…It's fine. Signing takes a second"}]},
 {id:"vendor",t:f=>`A roadside vendor teases: "Are you two a couple? So cute. How about a garland for each other?"`,
  choice:[{t:"Buy her a garland",sc:3,rep:"N-no, we're not a couple, auntie! …But the garland smells nice"},{t:"Decline with a laugh",sc:1,rep:"Auntie's just teasing… right?"}]},
 {id:"cat",t:f=>`A fat orange cat comes and rubs against the legs of ${f.name} then flops onto its back in front of you both`,
  choice:[{t:"Sit down and pet the cat together",sc:2,rep:"Look, it likes you too. Weird, cats don't take to people easily"},{t:"Joke that the cat looks like her",sc:-1,rep:"Looks like me where! …The chubby part?!"}]},
 {id:"rival",t:f=>`On the way you run into two Golden Tiger fighters who laugh: "Manager taking his fighter sightseeing, no training?"`,
  choice:[{t:"Stand beside her quietly, don't respond",sc:2,rep:"Thank you for not leaving me standing alone. See you in the ring"},{t:"Fire back hard",sc:0,rep:"Easy… but that was satisfying"}]},
];
function dateTwist(G,f,D,look){const r=srand(G,(f.twists||[]).length*13+f.id.charCodeAt(0));if(r>.4)return [];f.twists=f.twists||[];
  const pool=DATE_TWISTS.filter(x=>!f.twists.includes(x.id));if(!pool.length)return [];const T=pool[Math.floor(srand(G,f.id.charCodeAt(1)+97)*pool.length)];f.twists.push(T.id);
  return [{n:"nar",t:T.t(f)},{choice:T.choice.map(c=>({t:c.t,fx:()=>{D.score+=c.sc;},then:[{n:f.id,f:c.sc>=2?"flustered":c.sc<0?"pout":"happy",l:look,t:c.rep}]}))}];}

// ================= v1.13 temptations — someone else wants your time =================
const topBond=G=>Math.max(...CANON_IDS.map(id=>G.F[id].met?G.F[id].bond:0));
const tempt=(id,wk,steps)=>({id:"tempt_"+id,look:"casual",when:G=>G.week>=wk&&G.F[id].met&&!G.freeUsed&&topBond(G)-G.F[id].bond>=12,bg:"food",steps:[
  ...steps,{choice:[{t:"Go together (uses this week's free time)",fx:G=>{G.freeUsed=true;add(G,id,"bond",6);add(G,id,"trust",2);},then:[{n:id,f:"flustered",t:{kati:"Yay! Let's go!",mali:"Really! Mali will hold your hand so you don't get lost!",rin:"…Good. I've prepared three outing plans",ploy:"Thank you… I'm glad",fah:"Hmph, should've invited you ages ago!"}[id]}]},
    {t:"Sorry, I already have plans this week",fx:G=>add(G,id,"morale",-2),then:[{n:id,f:"pout",t:{kati:"…Mm, it's okay. Next time",mali:"Waah… you'd better be free next time!",rin:"Understood. I'll note this data",ploy:"It's fine. I'm used to it",fah:"Who wanted to go with you anyway! …Not that Fah's upset"}[id]}]}]}]});
EVENTS.push(
 tempt("kati",16,[{n:"nar",t:"Kati stands outside your room twisting the hem of her shirt, two movie tickets in hand"},{n:"kati",f:"flustered",t:"Um… a friend gave me two tickets. I don't have anyone to go with… if you're free, boss…"}]),
 tempt("mali",18,[{n:"nar",t:"The smell of green curry drifts from the camp kitchen. Mali pops her head out holding a ladle"},{n:"mali",f:"happy",t:"Manager! Mali made Mom's recipe, a bit too much… want to eat by the river together?"}]),
 tempt("rin",20,[{n:"nar",t:"Rin hands you a tablet full of charts"},{n:"rin",f:"happy",t:"I've finished analyzing the district-round opponents, but I'd like your opinion… at the cafe, this evening, if you're free"}]),
 tempt("ploy",24,[{n:"nar",t:"A LINE message from Ploy pops up late at night"},{n:"ploy",f:"flustered",t:"\"There's a temple fair near my camp tomorrow… if you'd like to walk around together, that's fine. No pressure\""}]),
 tempt("fah",22,[{n:"nar",t:"Fah shows up at the gate on a small motorbike"},{n:"fah",f:"angry",t:"Hey! Free? Let's go eat moo kratha, Fah's paying! …Don't get the wrong idea, just don't wanna eat alone!"}]));

// v1.13: Kru Daeng goes home for a short break — no coach hints while he is away
// v1.35: trust scenes, and the coach spells out what trust is for
EVENTS.push(
 {id:"trust_explain",look:"train",when:G=>G.week>=5,bg:"gym",steps:[
  {n:"coach",t:G=>`${ME(G)}, do you know why some fighters follow the corner instantly, and others just stand there confused?`},
  {n:"coach",t:"It's trust. If they trust us, corner orders turn into real weapons, and a loss doesn't break their spirit. Check the fighter info, that gold bar"},
  {n:"kati",f:"happy",l:"train",t:G=>`I already trust ${CALL(G,"kati")}! …Except when you say 'just one more lap'`},
  {n:"coach",t:"Trust comes from making merit together, wai khru, not training until you break, and a camp that isn't in the red. It builds up slowly"},{fx:G=>add(G,"kati","trust",2)}]},
 {id:"trust_merit_kati",look:"casual",when:G=>G.week>=9&&inCamp(G,"kati"),bg:"temple",steps:[
  {n:"nar",t:"5:30 a.m. Kati knocks on the door with a bowl of hot rice. Today is Grandpa Chai's birthday"},
  {n:"npc",who:"Grandma Pen, by the temple",t:"Oh, little Kati! And who's this… ah, the new manager Grandpa Chai left the camp to? He used to praise you to me all the time"},
  {n:"kati",f:"flustered",l:"casual",t:G=>`Grandma, you're exaggerating! …But I'm glad ${CALL(G,"kati")} came along. Every year I give alms by myself`},
  {choice:[{t:"Let's come together again next year",fx:G=>{add(G,"kati","trust",6);add(G,"kati","bond",2);},then:[{n:"kati",f:"happy",l:"casual",t:"It's a promise! I'm writing it on the calendar"},{n:"npc",who:"Grandma Pen, by the temple",t:"Good, good. Grandma has leftover mango sticky rice, take some back to camp"}]},
   {t:"Grandpa Chai must be proud of you, Kati",fx:G=>{add(G,"kati","trust",4);add(G,"kati","morale",6);},then:[{n:"kati",f:"sad",l:"casual",t:"…Thank you. I'll fight lots more for Grandpa to see"}]}]},
  {n:"nar",t:"(Kati's trust went up)"}]},
 {id:"trust_fish_mali",look:"casual",when:G=>G.week>=12&&inCamp(G,"mali"),bg:"river",steps:[
  {n:"nar",t:"Mali brings home a bag of three eels from the market, saying she'll release them to make merit"},
  {n:"mali",f:"happy",l:"casual",t:G=>`Back home in Chaiya, Mom takes me to release fish every year. She can't come this year… ${CALL(G,"mali")}, would you stand in for Mom?`},
  {n:"nar",t:"The third eel refuses to go in the water and wraps around Mali's leg instead. The scream reaches the bridge"},
  {choice:[{t:"(calmly help catch the eel)",fx:G=>{add(G,"mali","trust",6);},then:[{n:"mali",f:"flustered",l:"casual",t:G=>`${CALL(G,"mali")}, you're so good at this… I'm telling Mom someone caught an eel for me`}]},
   {t:"(laugh until your stomach hurts)",fx:G=>{add(G,"mali","trust",3);add(G,"mali","bond",3);},then:[{n:"mali",f:"pout",l:"casual",t:"It's not funny! …Hehe, okay, it's a little funny"}]}]},
  {n:"nar",t:"(Mali's trust went up)"}]},
 {id:"trust_plan_rin",look:"casual",when:G=>G.week>=16&&inCamp(G,"rin"),bg:"cafe",steps:[
  {n:"rin",f:"happy",l:"casual",t:G=>`${CALL(G,"rin")}, I made a three-page fight plan myself, the first one Coach Daeng hasn't checked. Will you let me use it?`},
  {n:"nar",t:"The pages are full of arrows, numbers, and doodles of round fighters that look like steamed buns"},
  {choice:[{t:"I trust your plan. Use it",fx:G=>{add(G,"rin","trust",8);add(G,"rin","morale",5);},then:[{n:"rin",f:"flustered",l:"casual",t:"…I can't measure 'trust', but I can feel it. Thank you"}]},
   {t:"Let Coach Daeng look it over first",fx:G=>{add(G,"rin","trust",1);G.F.rin.a.iq=Math.min(20,G.F.rin.a.iq+.2);},then:[{n:"rin",f:"sad",l:"casual",t:"Understood. Caution makes sense… I'll do better"},{n:"nar",t:"(Coach Daeng fixes two spots; Rin writes down every word. Her ring IQ improves a little)"}]}]}]});
// v1.37: more of Rin between joining and the late-season arc
EVENTS.push(
 {id:"rin_sheet",look:"train",when:G=>G.week>=18&&inCamp(G,"rin"),bg:"gym",steps:[
  {n:"nar",t:"Monday morning, the training room wall is covered in forty sheets of A4, each with graphs, arrows and a fighter's name"},
  {n:"kati",f:"surprised",l:"train",t:"Rin… what is this? Why does my picture have eleven arrows pointing at my left elbow?"},
  {n:"rin",f:"happy",l:"train",t:"Kati's left elbow drops when she's tired, three times a round on average. I drew one arrow for every time she got countered"},
  {n:"coach",t:"Twenty years teaching Muay Thai and I only just learned a dropped elbow can have a graph"},
  {n:"rin",f:"flustered",l:"train",t:G=>`${CALL(G,"rin")}, am I overdoing it? At my old camp they used these sheets to wrap fried bananas`},
  {choice:[{t:"Keep going, our camp needs this",fx:G=>{add(G,"rin","trust",4);add(G,"rin","bond",3);G.F.kati.a.guard=Math.min(20,G.F.kati.a.guard+.3);},then:[{n:"rin",f:"happy",l:"train",t:"…Thank you. I'll make a color version too"},{n:"nar",t:"(Kati's guard improved a little)"}]},
   {t:"Can we cut it to ten sheets? The wall's about to collapse",fx:G=>{add(G,"rin","bond",2);},then:[{n:"rin",f:"pout",l:"train",t:"Ten sheets… the font will be a little smaller"},{n:"nar",t:"The next day there are ten sheets, the text the size of ants"}]}]}]},
 {id:"rin_glasses",look:"train",when:G=>G.week>=22&&inCamp(G,"rin"),bg:"gym",steps:[
  {n:"nar",t:"Crack! Rin's glasses fly off and land under Mali's foot during pad work; the left lens shatters like a spiderweb"},
  {n:"rin",f:"sad",l:"train",t:"It's fine… I can see… that's Mali, right?"},
  {n:"mali",f:"flustered",l:"train",t:"That's the sandbag, Rin! Mali's over here!"},
  {n:"rin",f:"flustered",l:"train",t:G=>`${CALL(G,"rin")}… Fine, I'll confess. I'm quite nearsighted. I take my glasses off to fight, so I have to memorize everything before I step in the ring. That's where all the data comes from`},
  {choice:[{t:"(Take her to an optician in town and pay, ฿1,500)",fx:G=>{G.cash-=1500;add(G,"rin","bond",5);add(G,"rin","trust",4);MEM(G,"rin_glasses");},then:[{n:"rin",f:"flustered",l:"casual",t:"…This frame is half the weight of the old one. I'll pay you back. Can I pay in installments?"},{n:"nar",t:"On the way back Rin walks closer than usual, because her eyes haven't adjusted yet… probably"}]},
   {t:"That makes you even better. You fight from memory",fx:G=>{add(G,"rin","morale",6);G.F.rin.a.iq=Math.min(20,G.F.rin.a.iq+.3);MEM(G,"rin_memory");},then:[{n:"rin",f:"happy",l:"train",t:"…Nobody's ever seen it that way. Thank you. I'll remember that too"},{n:"nar",t:"(Rin's ring IQ improved a little)"}]}]}]},
 {id:"rin_dad",look:"casual",when:G=>G.week>=26&&inCamp(G,"rin"),bg:"night",steps:[
  {n:"nar",t:"9 p.m. Rin sits outside the camp, her phone buzzing nonstop. The screen reads 'Dad (Prof. Dr.)'"},
  {n:"rin",f:"sad",l:"casual",t:"My dad is a university professor. He wants me to do a PhD, not box out in the provinces"},
  {n:"rin",f:"sad",l:"casual",t:G=>`Dad says boxing has nothing worth analyzing. ${CALL(G,"rin")}, do you think… he's right?`},
  {choice:[{t:"Send your dad your fight stats. Let the numbers speak",fx:G=>{add(G,"rin","trust",5);add(G,"rin","bond",3);},then:[{n:"nar",t:"Rin types for twenty minutes, attaches three files, and hits send"},{n:"nar",t:"Ten minutes later, the reply: 'Table three has the SD wrong, but… interesting. I'd like to watch the next fight live'"},{n:"rin",f:"flustered",l:"casual",t:"…Dad's going to watch the livestream. He's never watched anything of mine"}]},
   {t:"You don't have to prove anything to anyone. Being here is enough",fx:G=>{add(G,"rin","morale",8);add(G,"rin","bond",4);},then:[{n:"rin",f:"flustered",l:"casual",t:"…There's no variable in that sentence to analyze. But I understand"}]}]}]},
 {id:"rin_cook",look:"casual",when:G=>G.week>=33&&inCamp(G,"rin")&&inCamp(G,"mali"),bg:"kitchen",steps:[
  {n:"nar",t:"The camp kitchen: a digital scale, beakers and a thermometer lined up beside the som tam mortar"},
  {n:"rin",f:"happy",l:"casual",t:"Today I'm making pad kra pao. Fish sauce 12.5 ml, sugar 4 g, high heat 3 minutes 20 seconds"},
  {n:"mali",f:"happy",l:"casual",t:"Rin, you don't weigh basil stir-fry. You use your heart… and your hands, like this~ (pours fish sauce freely)"},
  {n:"rin",f:"surprised",l:"casual",t:"Mali! That's 40 ml, 220 percent over the recipe!"},
  {choice:[{t:"Taste Rin's first",fx:G=>{add(G,"rin","bond",4);},then:[{n:"nar",t:"Every value exactly to standard… and the blandest thing you've ever eaten"},{n:"rin",f:"pout",l:"casual",t:"It's exactly to the recipe. Why are you making that face?"}]},
   {t:"Taste Mali's first",fx:G=>{add(G,"mali","bond",3);add(G,"rin","bond",1);},then:[{n:"nar",t:"So salty your eyes cross, but weirdly delicious"},{n:"rin",f:"happy",l:"casual",t:"…Noted. 'Heart and hands' is a variable I can't measure yet"}]}]}]});
// v1.37: when the camp is flush, bad luck comes for the money (students stay home, repairs cost)
EVENTS.push(
 {id:"dis_storm",pri:1,look:"casual",when:G=>G.week>=14&&G.week<=30&&G.cash>=45000,bg:"camp_rain",steps:[
  {n:"nar",t:"A summer storm hits at 2 a.m.; sheets of tin roofing fly off and slam into the mango tree next door"},
  {n:"kati",f:"surprised",l:"casual",t:G=>`${CALL(G,"kati")}! Half the training room roof is gone! The rain's soaking all the sandbags!`},
  {n:"coach",t:"Kids can't train in a room with no roof. How do we fix it?"},
  {choice:[{t:"Repair it properly, fast (฿25,000)",fx:G=>{G.cash-=25000;},then:[{n:"nar",t:"A full crew arrives and finishes in two days; a shiny new roof, and classes carry on without a hitch"}]},
   {t:"Patch it up for now (฿8,000)",fx:G=>{G.cash-=8000;G.disaster={name:"The temporary roof",untilAbs:absWeek(G)+3,inc:.5};roster(G).forEach(f=>f.morale=Math.max(0,f.morale-3));},then:[{n:"nar",t:"A blue tarp covers the roof. Every time it rains, water drips onto the middle of the ring; only half the students come for three weeks"}]}]}]},
 {id:"dis_flood",pri:1,look:"casual",when:G=>G.week>=30&&G.week<=44&&G.cash>=40000&&ytKey(G)!=="flood",bg:"camp_rain",steps:[
  {n:"nar",t:"Three days and nights of heavy rain. The river bursts its banks and floods the whole subdistrict; knee-deep water in camp, training mats drifting against the door"},
  {n:"mali",f:"sad",l:"casual",t:"Mali's gloves floated away! …Oh, there's a fish swimming into the camp!"},
  {n:"rin",f:"sad",l:"casual",t:"The road into the subdistrict is cut off. Students definitely can't come for at least three weeks. The generator and mats need replacing"},
  {n:"coach",t:G=>`${ME(G)}, the villagers' homes are flooded worse than ours. Do we send the girls to help them first, or rush to fix our camp?`},
  {choice:[{t:"Help the villagers move their things first (camp repairs ฿12,000)",fx:G=>{G.cash-=12000;G.rep+=3;G.disaster={name:"The flood",untilAbs:absWeek(G)+4,inc:0};roster(G).forEach(f=>{f.trust=Math.min(100,f.trust+4);f.fatigue=Math.min(100,f.fatigue+8);});},then:[{n:"nar",t:"Sirichai's fighters haul sandbags all day; the local paper puts their photo on the front page"},{n:"npc",who:"Auntie Sri, the vegetable seller",t:"This camp has the kindest hearts in the district! When the water goes down I'm sending three grandkids to train!"}]},
   {t:"Rush the camp repairs to reopen ASAP (฿25,000)",fx:G=>{G.cash-=25000;G.disaster={name:"The flood",untilAbs:absWeek(G)+2,inc:0};},then:[{n:"nar",t:"Three rented pumps; our camp dries out faster than anyone's, but the road stays cut off for two more weeks"}]}]}]},
 {id:"dis_termite",pri:1,look:"train",when:G=>G.week>=36&&G.cash>=55000&&G.F.fah.met,bg:"gym",steps:[
  {n:"nar",t:"Crack! The corner post snaps while Fah is leaning on it… wait, what is Fah doing at our camp?"},
  {n:"fah",f:"surprised",l:"casual",t:"Fah was just passing by! Not spying on training! …And this post is hollow, termites ate all of it!"},
  {n:"coach",t:"Termites ate the camp's whole timber frame. It has to be rebuilt, ฿18,000. During the work, only half the students can come for two weeks"},{fx:G=>{G.cash-=18000;G.disaster={name:"Termite repairs",untilAbs:absWeek(G)+2,inc:.5};}},
  {n:"fah",f:"happy",l:"casual",t:G=>`Serves you right! …Kidding, ${ME(G)}. Golden Tiger has a great termite guy, Fah'll get you his number. No need to thank me!`},{fx:G=>add(G,"fah","bond",2)}]});
// v1.39: the player's own story: grandpa's real grandchild who left a good office job in Bangkok
EVENTS.push(
 {id:"me_photo",look:"casual",when:G=>G.week>=5,bg:"night",steps:[
  {n:"nar",t:"Clearing out Grandpa's room, you find an old shoebox full of faded photos"},
  {n:"nar",t:"One photo shows a small kid in gloves too big for their hands, standing next to Grandpa Chai by the ring, a little girl with pigtails flashing a peace sign behind them"},
  {n:"kati",f:"surprised",l:"casual",t:G=>`That's me! And that's ${CALL(G,"kati")}! Back then you were barely as tall as a ring post`},
  {n:"kati",f:"happy",l:"casual",t:"Grandma was still with us then. She made mango sticky rice every evening, and Grandpa always snuck some of ours"},
  {choice:[{t:"I never thought I'd be living here again",fx:G=>{add(G,"kati","bond",4);add(G,"kati","trust",3);},then:[{n:"kati",f:"flustered",l:"casual",t:"I did… I always thought you'd come back someday, like Grandpa said"}]},
   {t:"Who won the bike race back then?",fx:G=>{add(G,"kati","bond",3);MEM(G,"kati_bike");},then:[{n:"kati",f:"pout",l:"casual",t:"A tie! We fell in the ditch together, and Grandma spanked us both"}]}]},
  {n:"nar",t:"That night the photo goes up on the shrine shelf, next to Grandpa Chai's picture"}]},
 {id:"me_office",look:"casual",when:G=>G.week>=11,bg:"camp",steps:[
  {n:"nar",t:"A Bangkok number calls while you're watching the kids practice kicks. The screen says 'Boss (don't answer on weekends)'"},
  {n:"npc",who:"Your old boss in Bangkok",t:G=>`${ME(G)}, nobody has run a campaign as well as you this quarter. Come back. The company is offering a 30 percent raise and a company car`},
  {n:"nar",t:"On the line you can hear the meeting room AC, keyboards, and someone complaining about KPIs"},
  {n:"nar",t:"Out front, Kati shouts the kick count, Mali laughs, and Coach Daeng's whistle cracks"},
  {choice:[{t:G=>`Thank you ${PA(G)}, but this is my real job now`,fx:G=>{roster(G).forEach(f=>{f.trust=Math.min(100,f.trust+3);f.morale=Math.min(100,f.morale+4);});},then:[{n:"kati",f:"flustered",l:"casual",t:"…I heard that! I wasn't eavesdropping, I just happened to be standing here!"}]},
   {t:G=>`Let me think about it ${PA(G)} (hang up)`,fx:G=>{add(G,"kati","morale",-3);},then:[{n:"coach",t:"No need to answer now. But you should know the kids look at the camp gate every morning, afraid that one day you won't be there"}]}]},
  {n:"nar",t:"(Your Bangkok marketing know-how brings in more people. Fame +1)"},{fx:G=>{G.rep+=1;}}]},
 {id:"me_grave",look:"casual",when:G=>G.week>=40,bg:"temple",steps:[
  {n:"nar",t:"On the holy day morning, you and Kati go to pay respects to Grandpa Chai and Grandma at the stupa behind the temple, leaving a garland and Grandpa's very first pair of gloves"},
  {n:"kati",f:"sad",l:"casual",t:G=>`Grandpa, Grandma, ${ME(G)} is back, and not just for the summer this time`},
  {choice:[{t:G=>`Grandpa, ${PA(G)} I'll take the best care of the camp and Kati`,fx:G=>{add(G,"kati","trust",6);add(G,"kati","bond",3);},then:[{n:"nar",t:"A breeze passes through the bodhi tree; one leaf falls right onto the gloves"},{n:"kati",f:"happy",l:"casual",t:"Grandpa heard you. I believe that"}]},
   {t:"(Say nothing, just sit down beside Kati)",fx:G=>{add(G,"kati","bond",5);},then:[{n:"nar",t:"The two of you sit in silence for a long time, until the noon temple bell rings"}]}]}]});
// v1.40: Kru Daeng takes leave more than once; while he is away only Rin's remarks are left
const leaveSteps=(G,why,wk,post)=>[{inject:G2=>{G2.coachAwayAbs=absWeek(G2)+wk;G2.flags.coachBack=false;if(typeof addMail==="function")addMail(G2,{kind:"letter",from:"Coach Daeng",title:post[0],body:post[1]});return [];}},
  {n:"nar",t:`Coach Daeng is away ${wk} weeks · no coach advice for now.${inCamp(G,"rin")?" Only Rin's observations":""}`}];
EVENTS.push(
 {id:"daeng_leave_monk",look:"fight",when:G=>G.week>=17&&G.week<=19&&!(G.coachAwayAbs&&absWeek(G)<G.coachAwayAbs),bg:"camp",steps:[
  {n:"coach",t:"Boss, my nephew is entering the monkhood. I have to help at the temple for two weeks: the procession, the head shaving, sitting through the chanting"},
  {n:"kati",f:"surprised",l:"casual",t:"Coach Daeng is shaving his head too?!"},
  {n:"coach",t:"I'm not ordaining! …But if I lose the football bet with the boy's father, I might shave"},
  {n:"rin",f:"happy",l:"casual",t:"In the meantime I'll record everything for you. But I can't decide for you, I only analyze"},
  {inject:G=>leaveSteps(G,"monk",2,["News from the ordination","My nephew's ordination went well. I lost a football bet with his father, so I had to shave my head too. Don't laugh when I get back. Make the kids do their morning runs. — Coach Daeng"])}]},
 {id:"daeng_leave_knee",look:"fight",when:G=>G.week>=40&&G.week<=42&&!(G.coachAwayAbs&&absWeek(G)<G.coachAwayAbs),bg:"camp",steps:[
  {n:"coach",t:"The doctor scheduled a small knee surgery; I'll be in hospital two weeks. Don't worry, the doctor says my knee is as strong as a fifty-year-old's"},
  {n:"mali",f:"sad",l:"casual",t:"Coach Daeng, you're sixty-eight…"},
  {n:"coach",t:"Exactly, eighteen years younger than my real age! This is a crucial stretch, make good decisions. I'll watch the livestream from bed"},
  {inject:G=>leaveSteps(G,"knee",2,["From a hospital bed","The nurses won't let me cheer at the livestream, so I cheer in my head until my blood pressure spikes. Don't visit, spend the time training. If you do visit, bring som tam. — Coach Daeng"])}]});
EVENTS.push({id:"daeng_leave",look:"fight",when:G=>G.week>=29&&G.week<=31&&!(G.coachAwayAbs&&absWeek(G)<G.coachAwayAbs),bg:"camp",steps:[
  {n:"coach",t:"Boss, I'm taking two weeks' leave to go home to Surin. My niece is getting married"},
  {n:"coach",t:"I've written the training schedule on the wall. For now you make all the calls. I trust you"},
  {n:"kati",f:"surprised",t:"Huh! Two whole weeks! …It's fine, I'll keep everyone training myself!"},{inject:G=>{G.coachAwayAbs=absWeek(G)+2;G.flags.coachBack=false;if(typeof addMail==="function")addMail(G,{kind:"letter",from:"Coach Daeng (Surin)",title:"A postcard from Surin",body:"To the kids of Sirichai Camp: my grandniece's wedding was great fun. I did a Muay Thai dance for the guests and threw my back out. Always wrap your hands before training, don't let Kati order more than ten laps a day, and don't let Mali play luk thung too loud. — Coach Daeng (P.S. please water the mango tree)"});return [];}},
  {n:"nar",t:"Coach Daeng on leave for 2 weeks · his advice disappears until he returns"}]});

// ================= v1.13.1 longer outings: a small shared moment at each place =================
const DATE_BEATS={
 eat:[{n:"Two bowls of khao soi land in front of you, steam rising with the smell of curry paste",q:"This shop's khao soi is no joke… Manager, can you handle spicy?",o:[["Sure, add another spoon of chili",2,"Haha, so brave. Don't blame me if you cry"],["Could I get another glass of ice…",1,"Haha, your face is all red. Kind of cute"]]},
      {n:"Auntie Daeng comes to top up the soup and whispers, \"Here with your sweetheart, dear?\"",q:"…What did auntie say? I didn't hear anything!",o:[["She said we look good together",2,"Wh— what is she saying…"],["She asked if we want boiled eggs",1,"Oh… I thought it was something else"]]}],
 market:[{n:"The night market is buzzing; vendors' calls echo down the whole street",q:"Look at that, a dart stall with plushie prizes! Want to try?",o:[["I'll throw, gotta win the biggest one",2,"You really did it! I'll put it by my bed"],["You throw. A fighter's aim has to be sharp",1,"Watch this! …Missed, haha"]]},
      {n:"The smell of grilled meatballs and khanom khrok drifts by",q:"What should we eat, meatballs or khanom khrok?",o:[["Buy both and share",2,"Sharing like this makes it twice as tasty"],["You choose",1,"Then khanom khrok! Best when it's hot"]]}],
 temple:[{n:"The temple bell rings out; bodhi leaves sway gently in the breeze",q:"What did you wish for, Manager?",o:[["That everyone in camp stays safe",2,"…Same as me. That's what I wished too"],["It's a secret",1,"Stingy! You have to tell me someday"]]},
         {n:"The two of you release fish into the pond behind the temple",q:"This fish is wriggling so hard, like me when Coach Daeng scolds me",o:[["You have to let it go gently, like this",2,"Your hand is so warm… I-I mean the fish's!"],["Let it go now, before it runs out of air",1,"Bye-bye, little fish~"]]}],
 cafe:[{n:"The cafe screen shows last year's provincial champion's old fight",q:"Look at this moment. If it were me, would I counter here?",o:[["Counter with an elbow when she lowers her guard",2,"Exactly! Manager, your eye's getting sharp"],["Wait until she's tired",1,"Safety first, huh… fair"]]},
      {n:"A big bowl of Thai-tea bingsu sits in the middle of the table, with two spoons",q:"One bowl for two… who takes the first bite?",o:[["You go first",2,"Then… ahm! So good. Manager, try it"],["Race to finish it first",1,"Spoken like a fight camp! Brain freeze!!"]]}],
 river:[{n:"A cool breeze blows off the river; orange sunlight stretches across the water",q:"Race to the bridge? Loser buys drinks!",o:[["Okay, I'll give you a three-length head start",2,"Being so nice, don't blame me if you lose!"],["No holding back",1,"Huff… huff… my legs are shaking"]]},
       {n:"You both park your bikes and rest on the pier, feet dangling above the water",q:"…It's quiet here, right? I often come here alone",o:[["Then from now on we can come together",2,"…Mm. That's a promise"],["Thank you for bringing me to your secret spot",1,"My secret spot… now it's yours too, Manager"]]}],
 spar:[{n:"The two of you stand in the training ring: a pair of focus mitts and a pair of gloves",q:"Manager, hold the pads for me! Mind your hands!",o:[["Hold them steady so she can go full power",2,"Great sound! Another set!"],["Please go easy on me…",1,"Haha, don't worry, I can control my power"]]}]};
const _dateScene=dateScene;
dateScene=function(G,id,act){const steps=_dateScene(G,id,act);const L=DATE_BEATS[act];if(!L)return steps;const f=G.F[id];f.beats=f.beats||{};const k=(f.beats[act]||0)%L.length;f.beats[act]=k+1;const B=L[k];
  const look=act==="spar"?"train":"casual";const D=G._date;
  const beat=[{n:"nar",t:B.n},{n:id,f:"happy",l:look,t:B.q},{choice:B.o.map(([t,sc,rep])=>({t,fx:()=>{if(D)D.score+=sc;},then:[{n:id,f:sc>=2?"flustered":"happy",l:look,t:rep}]}))}];
  const at=steps.findIndex(s=>s&&s.inject);steps.splice(at<0?steps.length:at,0,...beat);return steps;};
// v1.15: camp-mates squabble over something silly and ask to settle it in the ring; the manager decides
function sparBout(G,a,b){const A=G.F[a],B=G.F[b];const s=x=>Object.values(x.a).reduce((p,v)=>p+v,0)/14+(x.morale-60)/30;const r=mulberry32(G.seed+G.week*71)();
  const w=s(A)+(r-.5)*3>=s(B)?A:B,l=w===A?B:A;[A,B].forEach(f=>{gainXP(G,f,22);f.fatigue=Math.min(100,f.fatigue+8);});add(G,w.id,"morale",4);add(G,l.id,"morale",-1);return {w,l};}
const SPAR_FEUD=[
 {id:"feud_kati_mali",a:"kati",b:"mali",from:14,lines:[
  {n:"nar",t:"Wednesday evening, a commotion comes from behind the camp"},
  {n:"mali",f:"pout",l:"train",t:"Kati! Mali reserved the last mango sticky rice! Who ate it!"},
  {n:"kati",f:"surprised",l:"train",t:"Well, your name wasn't on it… if you're hungry you eat!"},
  {n:"mali",f:"angry",l:"train",t:"Then let's settle it in the ring! Loser buys two back!"}],
  win:{kati:"Thanks in advance for the two packs, Mali~",mali:"Hmph! Two packs tomorrow, don't forget!"},
  stop:[{n:"kati",f:"sad",l:"train",t:"…Sorry, Mali. I'll buy you some tomorrow"},{n:"mali",f:"happy",l:"train",t:"Two packs! …Kidding, one's fine"}]},
 {id:"feud_mali_rin",a:"mali",b:"rin",from:20,lines:[
  {n:"nar",t:"Eleven at night, luk thung music blares from the fighters' dorm"},
  {n:"rin",f:"angry",l:"casual",t:"Mali, the schedule says bed at ten. Your morning heart rate will be ruined"},
  {n:"mali",f:"pout",l:"casual",t:"Schedule, schedule, schedule! Rin, do you ever have fun?"},
  {n:"rin",f:"angry",l:"casual",t:"…Fine. Ring, tomorrow morning. If I win, you sleep on schedule"}],
  win:{rin:"Data never lies… ten o'clock, Mali",mali:"Yay! Music continues tonight~ (quietly, okay)"},
  stop:[{n:"rin",f:"sad",l:"casual",t:"…I said that too harshly. Sorry. Could you use headphones instead?"},{n:"mali",f:"happy",l:"casual",t:"Sure, sure, but Rin has to listen to one of Mali's songs"}]},
 {id:"feud_kati_rin",a:"kati",b:"rin",from:24,lines:[
  {n:"rin",f:"happy",l:"train",t:"Kati, I counted. Your guard dropped seventeen times in training today"},
  {n:"kati",f:"angry",l:"train",t:"Why are you counting! I didn't ask you to!"},
  {n:"rin",f:"happy",l:"train",t:"If you don't believe me, one round in the ring. I'll go for the head every time your guard drops"},
  {n:"kati",f:"angry",l:"train",t:"Fine! Manager, can we use the ring?"}],
  win:{kati:"See! Guard dropped, but my punch landed first!",rin:"That's eighteen times, Kati"},
  stop:[{n:"rin",f:"sad",l:"train",t:"…I just don't want you to get hurt in a real fight"},{n:"kati",f:"happy",l:"train",t:"I know, I know… then keep counting, but say it quietly"}]}];
EVENTS.push(...SPAR_FEUD.map(E=>({id:E.id,look:"train",bg:"gym",when:G=>G.week>=E.from&&G.F[E.a].camp==="player"&&G.F[E.b].camp==="player"&&!G.F[E.a].injury&&!G.F[E.b].injury,steps:[...E.lines,
  {choice:[{t:"Allow it, one sparring round (both EXP +22 · fatigue +8)",then:[{n:"nar",t:"Both glove up and climb into the back ring; the students crowd around to watch"},{inject:G=>{const r=sparBout(G,E.a,E.b);
      return [{n:"nar",t:`End of round one, ${r.w.name} clearly has the upper hand`},{n:r.w.id,f:"happy",l:"train",t:E.win[r.w.id]},{n:r.l.id,f:"pout",l:"train",t:"…Rematch!"}];}}]},
   {t:"Stop them, have them talk it out (trust +3)",fx:G=>{add(G,E.a,"trust",3);add(G,E.b,"trust",3);},then:E.stop}]}]})));
// v1.15: Kati (effort) vs Ploy (talent) — the season's spine
EVENTS.push(
 {id:"ploy_dawn",look:"train",when:G=>G.week>=10&&G.F.ploy.met,bg:"camp",steps:[
  {n:"nar",t:"Five a.m., still dark. Kati is on her sixth lap of the village when someone in a purple tracksuit runs the other way"},
  {n:"ploy",f:"surprised",l:"casual",t:"…Kati? You train this early every day?"},
  {n:"kati",f:"happy",l:"train",t:"Every day! I'm not gifted like you, so I have to wake up before you"},
  {n:"ploy",f:"sad",l:"casual",t:"…I've never had to wake up at five. Sometimes I envy people who have something to chase"},
  {choice:[{t:"Ploy, someone's chasing you from behind too. Watch out",fx:G=>{add(G,"kati","morale",5);add(G,"ploy","bond",3);},then:[{n:"ploy",f:"happy",l:"casual",t:"Hmph… good. I'll wait and see when she catches up"}]},
   {t:"Want to run together? The three of us",fx:G=>{add(G,"ploy","bond",6);add(G,"kati","bond",2);},then:[{n:"nar",t:"Three laps later, Ploy is the first to stop, gasping. Kati turns back with a huge grin"},{n:"ploy",f:"flustered",l:"casual",t:"…Don't tell anyone I lost at running"}]}]}]},
 {id:"ploy_ko40",look:"casual",when:G=>G.week>=17&&G.F.ploy.met,bg:"night",steps:[
  {n:"nar",t:"Community radio reports tonight's results: \"Ploy Golden Tiger wins by first-round knockout in just 40 seconds\""},
  {n:"kati",f:"sad",l:"casual",t:"Forty seconds… I've trained my whole life, and she needed forty seconds"},
  {choice:[{t:"Talent got her to the top, but effort can take you further than that",fx:G=>{add(G,"kati","morale",8);add(G,"kati","bond",3);},then:[{n:"kati",f:"flustered",l:"casual",t:"…Further than that. Mm, I'll remember that"}]},
   {t:"Then an extra hour of training tomorrow",fx:G=>{gainXP(G,G.F.kati,15);G.F.kati.fatigue=Math.min(100,G.F.kati.fatigue+6);},then:[{n:"kati",f:"angry",l:"train",t:"Two hours!"}]}]}]},
 {id:"kati_overwork",look:"train",when:G=>G.week>=28&&G.F.kati.camp==="player",bg:"night",steps:[
  {n:"nar",t:"Midnight, the gym light is still on. Kati sits leaning against the heavy bag, hands still wrapped, fallen asleep at some point"},
  {n:"kati",f:"sad",l:"train",t:"…Oh, Manager, I just… wanted to kick a bit more. Ploy doesn't need to train this much and she's still better than me"},
  {choice:[{t:"Rest is part of training. Go to bed",fx:G=>{G.F.kati.fatigue=Math.max(0,G.F.kati.fatigue-10);add(G,"kati","trust",5);add(G,"kati","bond",4);},then:[{n:"kati",f:"flustered",l:"train",t:"…Okay, but five a.m. tomorrow!"}]},
   {t:"Then I'll hold pads for you. Twenty more minutes, then bed",fx:G=>{gainXP(G,G.F.kati,18);add(G,"kati","bond",6);G.F.kati.fatigue=Math.min(100,G.F.kati.fatigue+5);},then:[{n:"nar",t:"Twenty minutes turns into an hour; the pad sounds echo down the whole street"},{n:"kati",f:"happy",l:"train",t:"Today was my best kicking ever, because someone held the pads"}]}]}]},
 {id:"ploy_fear",look:"casual",when:G=>G.week>=38&&G.F.ploy.met,bg:"river",steps:[
  {n:"nar",t:"After the district fight, Ploy wins a narrow decision for the first time. You find her sitting by the river"},
  {n:"ploy",f:"sad",l:"casual",t:"In round three last night, I was so tired my hands shook. That's never happened before"},
  {n:"ploy",f:"sad",l:"casual",t:"Everyone calls me gifted, but if one day I lose… what will I have left?"},
  {choice:[{t:"You'll have yourself, finally starting to truly try for the first time",fx:G=>{add(G,"ploy","bond",7);add(G,"ploy","trust",4);},then:[{n:"ploy",f:"flustered",l:"casual",t:"…Trying for the first time. Sounds scary, but worth it"}]},
   {t:"Don't worry, Kati doesn't want to take anything from you except the belt",fx:G=>{add(G,"ploy","bond",4);add(G,"kati","morale",4);},then:[{n:"ploy",f:"happy",l:"casual",t:"Ha… tell her I'll be waiting in the final"}]}]}]},
 {id:"fah_mali",look:"casual",when:G=>G.week>=16&&G.F.mali.camp==="player"&&G.F.fah.met,bg:"fair",steps:[
  {n:"nar",t:"Evening market. Mali reaches for the last sausage skewer, and a tattooed hand snatches it first"},
  {n:"fah",f:"happy",l:"casual",t:"One beat too slow, Chaiya kid. You'll be this slow in the ring too"},
  {n:"mali",f:"pout",l:"casual",t:"Fah! We're in the same Division B now and you're still stealing my sausage!"},
  {choice:[{t:"Save it for revenge in the ring, Mali",fx:G=>{add(G,"mali","morale",6);add(G,"fah","bond",3);},then:[{n:"fah",f:"happy",l:"casual",t:"I like that look in your eye. See you in the ring"}]},
   {t:"Buy sausages for both",fx:G=>{G.cash-=120;add(G,"mali","bond",4);add(G,"fah","bond",5);},then:[{n:"fah",f:"flustered",l:"casual",t:"…You're a weird one. Treating a rival too. Thanks"}]}]}]});
// v1.15: the camp talks about last week's big fight
const LOSS_SELF={kati:"…I'm sorry. After all that training and still…",mali:"Waah… Mali didn't land a single kick",rin:"Where was my data wrong… I need to find out"};
// v1.22.1: rotate so the morning-after talk doesn't repeat word for word
const WIN_TEASE={kati:[a=>`See! ${a} was amazing last night, our camp is no joke!`,a=>`${a}! Watching from the corner gave me goosebumps. Let's train together again`,a=>`Our camp is on a winning streak now, ${a}! Grandpa must be smiling`],
  mali:[a=>`${a} You were so cool last night~ Mali shouted until her voice cracked!`,a=>`Let's celebrate with a huge tray of khanom khrok! ${a} is paying, hehe`,a=>`${a}~ Auntie Taew says she's naming a menu item after you!`],
  rin:[a=>`Noted: ${a}'s accuracy last night was the highest of the year`,a=>`${a}, in round two you controlled range far better than average. I have a chart`,a=>`This win raises ${a}'s top-four chances a little more`]};
const pickR=(L,G,k=0)=>{if(!Array.isArray(L))return L;G.rot=G.rot||{};const n=G.rot[k]=(G.rot[k]||0)+1;return L[n%L.length];};
const WIN_SELF={kati:["But it's not enough yet! My goal is still far ahead","Thank you… but I still see so many of my own mistakes","We won! I'll sleep early tonight, five a.m. tomorrow as usual"],
  mali:["Yay~ but Mali's not full yet! Give me the next fight","Legs a bit swollen, but worth it~ Somebody make Mali khanom khrok!","Last night Mali saw Mom smiling in the chat~"],
  rin:["Won as calculated… but the margin is still too narrow. Must be better","The result matched the model. I'll make the model even more accurate","…I'm happy. I just don't know how to show it"]};
const COACH_WIN=["Don't get cocky after a win. Five a.m. tomorrow as usual","Good, but your guard dropped in round two. I saw","Grandpa Chai is watching. A win like this would satisfy him","Eat well, sleep enough, then back to training","You can win, you can lose. Don't forget why you won today"];
function aftermathSteps(G,L){const me=G.F[L.a],op=G.F[L.b];const mates=roster(G).filter(f=>f.id!==me.id);const m=mates[0];const steps=[];
  if(L.win==="A"){steps.push({n:"nar",t:`The next morning, the news that ${me.name} beat ${op.name} spreads through the village`});
    if(m)steps.push({n:m.id,f:"happy",l:"train",t:WIN_TEASE[m.id]?pickR(WIN_TEASE[m.id],G,"t_"+m.id)(me.name):`Congratulations, ${me.name}!`});
    if(op.id==="ploy")steps.push({n:me.id,f:"flustered",l:"train",t:"I… really beat Ploy? All those five a.m.s weren't wasted"});
    else steps.push({n:me.id,f:"happy",l:"train",t:WIN_SELF[me.id]?pickR(WIN_SELF[me.id],G,"s_"+me.id):"But it's not enough yet!"});
    if(coachOn())steps.push({n:"coach",t:pickR(COACH_WIN,G,"c")});}
  else{if(op.id==="ploy")steps.push({n:"nar",t:"That night, Ploy walks out of the ring without looking back once",show:[{id:"ploy",back:true}]});
    steps.push({n:"nar",t:`After losing to ${op.name} ${me.name} sits silently in a corner of the gym all morning`});
    steps.push({n:me.id,f:"sad",l:"train",t:op.id==="ploy"&&me.id==="kati"?"Ploy is still too far… or maybe I'll never really get there":LOSS_SELF[me.id]||"…I'm sorry"});
    if(m)steps.push({n:m.id,f:"sad",l:"train",t:m.id==="rin"?`${me.name}, you were ahead in round two. I have numbers to prove it. It wasn't as bad as you think`:m.id==="mali"?`${me.name}~ Mali made khanom khrok for you. Eat first, then be sad`:`${me.name}, five a.m. tomorrow, I'll be waiting to train with you`});
    steps.push({choice:[{t:"This loss tells us what to fix. Let's fix it together",fx:G=>{add(G,me.id,"morale",6);add(G,me.id,"trust",3);},then:[{n:me.id,f:"happy",l:"train",t:{kati:"…Yes! Next time I won't lose the same way",mali:"Mm! Next time Mali will land every kick!",rin:"I'll finish a weakness-fixing schedule tonight"}[me.id]||"…Yes!"}]},
      {t:"Rest today. Let's go eat something good",fx:G=>{add(G,me.id,"bond",4);add(G,me.id,"morale",3);me.fatigue=Math.max(0,me.fatigue-5);},then:[{n:me.id,f:"flustered",l:"casual",t:{kati:"…Thank you. Today this is all I need",mali:"Moo kratha? Mali stops being sad instantly",rin:"…There's no statistical reason good food would help, but I'll come"}[me.id]||"…Thank you"}]}]});}
  return steps;}
// v1.16: year-end hooks — beating them is what makes Ploy and Fah look at Sirichai
function season2Hooks(G,key){if(key==="bankrupt")return [];const S=[];
  const beatPloy=G.champ.A==="kati"&&G.finalists.A.includes("ploy"),beatFah=G.champ.B==="mali"&&G.finalists.B.includes("fah");
  if(beatPloy||G.F.ploy.bond>=50){S.push({n:"nar",bg:"camp",t:"Three days after the final, someone stands at the camp gate from five a.m., in the purple shorts everyone recognizes, as if ready to train on the spot",show:[{id:"ploy",back:true}]},
    ...(beatPloy?[{n:"ploy",f:"sad",l:"casual",t:"I lost for the first time in three years… and only then realized I'd never truly tried all this time"},
      {n:"ploy",f:"flustered",l:"casual",t:"The boss stripped me of the captaincy. Sirichai… do you still take someone who wants to start again from one?"}]:
     [{n:"ploy",f:"flustered",l:"casual",t:"I heard Sirichai is recruiting fighters for next year… may I talk about a contract?"}]),
    {choice:[{t:"This camp's gate has been open for you all along",fx:G=>{add(G,"ploy","bond",6);G.s2=Object.assign(G.s2||{},{ploy:"yes"});},then:[{n:"ploy",f:"happy",l:"casual",t:"…Thank you. Then five a.m. tomorrow, I'll come run with Kati"}]},
     {t:"Think it over. Let's talk again next year",fx:G=>{G.s2=Object.assign(G.s2||{},{ploy:"later"});},then:[{n:"ploy",f:"happy",l:"casual",t:"Fair… I'll come back"}]}]});}
  if(beatFah||G.F.fah.bond>=50)S.push({n:"fah",f:beatFah?"angry":"happy",l:"casual",t:beatFah?"That Chaiya kid kicked Fah till her ears rang! …Next year Fah's training here, or she'll never get her rematch":"Hey, can Fah move to your camp next year! Golden Tiger is boring now"});
  if(S.length)S.push({n:"nar",t:"Next year, Sirichai may have more fighters than anyone expects…"});
  return S;}
// v1.16: Rin's own arc — the analyst who left Payak Thong and has to decide whether she is a fighter
EVENTS.push(
 {id:"rin_notebook",look:"casual",when:G=>G.week>=30&&G.F.rin.camp==="player"&&G.F.ploy.met,bg:"night",steps:[
  {n:"nar",t:"Rin sets a thick black notebook on the table. The first page reads \"Ploy · 2 years · 41 fights\""},
  {n:"rin",f:"sad",l:"casual",t:"At Golden Tiger I logged every one of Ploy's fights… they had me analyze her opponents, but I secretly analyzed her too"},
  {n:"rin",f:"angry",l:"casual",t:"Ploy's only weakness is the late rounds. She's never been truly tired, so she doesn't know what to do when she is"},
  {choice:[{t:"Show Kati the notebook",fx:G=>{G.F.kati.ployNotes=true;add(G,"kati","morale",5);add(G,"rin","trust",3);},then:[{n:"kati",f:"surprised",l:"train",t:"Rin… this is a treasure trove! I'll drag Ploy all the way to round five!"},{n:"nar",t:"(Kati is more accurate against Ploy)"}]},
   {t:"Keep it. Let Kati win on her own skill",fx:G=>{add(G,"rin","bond",5);add(G,"kati","trust",3);},then:[{n:"rin",f:"flustered",l:"casual",t:"…Understood. Some things data can't help with. It takes heart"}]}]}]},
 {id:"rin_fighter",look:"fight",when:G=>G.week>=36&&G.F.rin.camp==="player",bg:"gym",steps:[
  {n:"nar",t:"After training, Rin stares at her wrapped hands for a long time"},
  {n:"rin",f:"sad",l:"fight",t:"Manager… everyone calls me 'the glasses analyst'. Am I really a fighter, or just someone who likes numbers?"},
  {choice:[{t:"You're the best game-reader I've ever seen in a ring",fx:G=>{add(G,"rin","morale",8);add(G,"rin","bond",4);},then:[{n:"rin",f:"flustered",l:"fight",t:"…I'm writing that sentence on the first page"}]},
   {t:"Next fight, try fighting without looking at your notes",fx:G=>{const f=G.F.rin;f.a.comp=Math.min(20,f.a.comp+.5);f.a.iq=Math.min(20,f.a.iq+.3);add(G,"rin","trust",4);},then:[{n:"rin",f:"angry",l:"fight",t:"Without notes… scary, but worth trying. Okay!"},{n:"nar",t:"(Rin's composure and fight IQ improve)"}]}]}]});

// ---------- v1.21: opponent's parting words, shown in a bubble over her head after the bell ----------
const POST_BUBBLE={
 ploy:{win:["It's not your time yet, {foe}.","I don't train harder than you. I was just born better.","What you drilled all year, I did on my first try.","Don't make that face. The gap between us isn't something effort can close.","Is this all Sirichai can teach? What a waste of you, {foe}.","Ten years too early.","I don't need to remember your name. Too many people have lost to me.","Tell {me} I'll be waiting in the final. If that camp ever makes it there.","Tired already? I haven't even started sweating."],lose:["…Very good. Next time I'll take it back with everything I have.","Remember today well, {foe}. It won't happen again.","Talent losing to hard work…? I don't believe it.","…I won't cry in front of you. Tonight, maybe.","Don't get cocky. I lost once. How many times have you lost to me?"],winKati:["It's not your time yet, Kati… but it's close","Every time you fall, you get up faster… It's annoying, Kati."],loseKati:["You've really grown. Congratulations","Kati… in this year's final, I won't hold back a single punch."]},
 fah:{win:["See that!? That's Fah! Remember the name!","Too weak, go train again!"],lose:["Doesn't count! Doesn't count! Fah's foot slipped!","…Tch, you got better. Remember this, next time you won't survive!"]}};
const POST_GENERIC={
 win:["An abandoned camp is still an abandoned camp!","Is that all your training?","Thanks for the points, sweetie~","Go tell Coach Daeng who beat you","Good fight, but today was my day"],
 lose:["Unfair! Are the judges blind!","I didn't sleep enough last night…","Rematch! I want a rematch!","Ow… my leg… see you next time!","You're the real deal, I admit it. Let me bow to you"],
 draw:["A draw?… This isn't over","Next time we settle it for good!"]};
const QBUB={gang:{win:["Ha! Tell the vendors to get the interest ready!","Some fight camp! Go train again!"],lose:["Remember this! The helmet gang isn't done!","Ow… my helmet's dented, who's paying for it!","Tell the boss… this camp is the real deal!"],draw:["We'll let it go today!"]},
 rooster:{win:["Cock-a-doodle-doo!! (stands on the ropes crowing for three minutes)","(pecks the canvas three times as if counting its own points)"],lose:["…Bawk (walks out of the ring, head hanging)","Bok… (loses two feathers but keeps its beak high)"],draw:["Bawk?"]},
 bull:{win:["Moooooo!! (swishes its tail around the ring)","(pushes the corner post with its horns until it tilts)"],lose:["Moo… (lies down in the middle of the ring, won't get up until it gets grass)","(walks back to the pen, the cowbell silent now)"],draw:["Moo?"]}};
// v1.35: a lot more (and sillier) parting words; {me} becomes the player's name
POST_GENERIC.win.push("Tell Manager {me} it's time to buy new gloves","Two plates of khao man gai this morning, full power!","Don't cry now… here, a tissue","My mom's watching live! Mom! I won!",
 "Sirichai Camp… nice name. I'll remember it","Selfie? For my page, so people know who I beat","Come back next time, but train first, okay?","{me}! If you get bored of that camp, come to mine!",
 "I won because I prayed at the spirit house twice this morning","Right, moo kratha to celebrate! …You're not invited");
POST_GENERIC.lose.push("I didn't lose, the gloves were slippery!","Manager {me}, right? Your fighter hits like a truck","I was going easy on you… really… you don't believe me?",
 "My mom's watching the livestream… Mom, turn it off please","Can I borrow an ice pack? My camp forgot to bring one","I'm going home to sell som tam with Mom… kidding, see you again!",
 "Who turned on the AC in the ring! I'm too cold to punch!","Wait, round five already? I only counted three","What did you eat today? Give me the recipe","Good… very good… could someone call an ambulance, no siren please");
POST_GENERIC.draw.push("A draw… split the purse half and half? Kidding","Nobody lost, nobody won, but I'm more tired");
POST_BUBBLE.fah.win.push("Ha! Who's queen of the subdistrict? Fah!","Tell {me} Fah's treating everyone to sausage to celebrate, and he's not invited!","Iron Fist is watching from home! He must be so proud!");
POST_BUBBLE.fah.lose.push("…Fah's not crying! Dust in the eye! This ring is dusty!","Rematch! Tomorrow! Right now! …Let me sit down for a sec first","Tell {me} not to send someone this good next time!");
QBUB.gang.win.push("The boss is giving me a bonus for sure, haha!","Tell {me} this month's interest just went up ten percent!");
QBUB.gang.lose.push("Mom! My helmet's dented! …Er, not Mom, Boss!","I just came to buy vegetables, not collect interest, honest","Can I get the camp's number? …I want to sign up for classes");
QBUB.rooster.win.push("(struts around the ring like a beauty queen)","Cock-a-doodle! (crows into the announcer's mic until the whole fair hears feedback)");QBUB.rooster.lose.push("(plays dead mid-ring, one eye open, peeking)","(flies onto the tent roof and refuses to come down)");
QBUB.bull.win.push("(chews its cud like a champion)","MOO! (stands on the canvas until one corner of the ring caves in)");QBUB.bull.lose.push("(turns its rear to the referee and walks off)","Moo… (walks to its owner, asking to go home)");
// v1.38: teammates meeting in the Death Match say something friendly, not a taunt
const TEAM_BUB={kati:{win:["Phew… fighting a campmate makes my heart race more than fighting Ploy. Let's go eat","Sorry! Did I kick too hard? I'll get you an ice pack!"],lose:["Great job! I'm proud to lose to someone from our camp","I'll get you back next time! …At training tomorrow"]},
 mali:{win:["Hehe, Mali wins~ but Mali's treating everyone to moo kratha tonight","Sorry~ Mali's legs did it on their own!"],lose:["You're so good, Mali gives up~","Waah… but I'm glad the winner is from our camp!"]},
 rin:{win:["Thank you for giving it everything. This fight's data is very valuable","I'll send you a summary of where you got hit. Tonight"],lose:["…I miscalculated one thing. You improved faster than the graph","Congratulations. Beating me means our camp is truly strong"]}};
/* v1.88: more parting words, funny and serious, plus lines that remember your history together (h2h before this fight) */
POST_GENERIC.win.push(...["Go train some more, kid. You're not there yet.","You've got something. Just not today.","Great first round. Muay Thai has five.","Your guard drops when you're tired. Fix that, then come back.","Respect. Big heart. But you're short on experience.","Don't give up. I've lost just like that too.","Remember this feeling. Take it to training.","Go train some more, kid. And bring me snacks next time.","A win means one extra piece of fried chicken. Yay!","Tell {me} to send the real fighter next time.","You fought well. I just fought better, hehe.","My grandma's in the front row. Loudest clapping in the hall.","Don't forget to follow my camp's page!","I'm sleeping with this medal next to my pillow tonight."]);POST_GENERIC.lose.push(...["I admit it… you're better.","Thanks for not holding back. I'll train harder.","I couldn't read you at all today. Your coach teaches well.","I'll remember that punch. See you next year.","Losing to someone this good? No regrets.","Who left a banana peel in the ring!","I just wanted to test how soft the canvas is. …Very soft.","Tell the promoter I'm switching careers to mor lam singer.","It's fine, I still get paid. Bubble tea to cheer me up.","Mom's definitely going to ask why my face is swollen.","I'm seeing stars… pretty stars."]);
const POST_CTX={"loseAgain":["Again!? That's loss number {n} to you!","All year the only camp I lose to is Sirichai! Nobody else can touch me!","I've started having nightmares with your face in them.","{n} times now… my coach says I should change divisions to escape you.","Why does the promoter keep matching me with you!","Number {n}… I'm writing your name on my heavy bag.","Lost to you {n} times. I have to rebuild my whole game."],"upset":["I usually beat you! Today was just… never mind.","You've grown a lot. You weren't like this before.","Is my era over…? No. Just today."],"revenge":["I waited {n} fights for this! Finally!","Who said I could never beat you! Mom! I did it!","Revenge is sweet… let's go celebrate with mookata.","I trained for this one day."],"winAgain":["Go train some more, kid. That's {n} times now.","However many times we meet, kid, same result.","Tell {me} it's okay to send someone else for once.","That's {n}. I'm starting to feel bad.","You're getting better. Still can't catch me."]};
function postCtx(op,res){const h=typeof G!=="undefined"&&G&&G.h2h&&G.h2h[op.id];if(!h)return null;
  if(res==="lose"){if(h.w>=2&&h.w>=h.l)return [POST_CTX.loseAgain,h.w+1];if(h.l>=2&&h.l>h.w)return [POST_CTX.upset,h.l];}
  if(res==="win"){if(h.l>=1&&h.l>=h.w)return [POST_CTX.winAgain,h.l+1];if(h.w>=2&&h.w>=2*h.l)return [POST_CTX.revenge,h.w];}return null;}
/* v1.88: Vector camp looks down on the provincial camp — until the contract is torn up (y5_vector_resolve), then it turns into rivals' banter */
const VECTOR_BUB={"pailin":{"win":["A camp that still times rounds with an alarm clock, against people who measure every heartbeat? Please.","Go back to training under your mango tree. This ring is for professionals.","Tell {me} that country-style hard work has a ceiling.","How sweet. A little camp still trusting its luck to amulets and boxing liniment.","I had your whole file before you even stepped into the ring."],"lose":["…Measurement error. I'm having every machine recalibrated.","Don't celebrate yet. A country camp gets one fluke a year.","The numbers are never wrong. There must be something I haven't measured…"]},"vector_A":{"win":["I used to be a country-camp kid like you. Trained on the coach's whims, lost on bad luck.","Ubon taught me patience. Bangkok taught me to win. You're still stuck on level one.","Tell {me} to put away the handwritten notebook. What year is it?"],"lose":["…How does a country camp win? The system must have a blind spot.","Don't think we're the same. I got out of places like yours."]},"vector_B":{"win":["So slow! Did you train on a rice-drying yard?","You fight like a songthaew, stopping at every corner.","Come challenge me again once you've got an air-conditioned gym, country girl."],"lose":["Wait! The machine said I'd win!","Lucky you. This ring's right next to your rice fields."]}},VECTOR_BUB_LATE={"pailin":{"win":["Still a country camp… but every year I need more data to beat you."],"lose":["Fine, I'll admit it this year. Sirichai is no ordinary country camp."]},"vector_A":{"win":["So close, country kid. …That's a compliment."],"lose":["So {me}'s handwritten notebook still works after all."]},"vector_B":{"win":["Still slow. But the scary kind of slow now."],"lose":["Okay, a rice-drying yard can make a fighter. I give up!"]}};
/* v1.88: `me` is our fighter — Ploy only names Kati when she actually fought Kati; {foe} becomes our fighter's name */
function postBubble(op,res,seed,me){const R=a=>a[Math.abs(seed)%a.length].replace(/\{me\}/g,typeof G!=="undefined"&&G?G.player.name:"").replace(/\{foe\}/g,me&&me.name?me.name:"");
  if(op.id==="ploy"&&op.camp!=="player"&&res!=="draw"&&me&&me.id==="kati"&&Math.abs(seed>>1)%3===0)return R(POST_BUBBLE.ploy[res+"Kati"]);
  if(op.camp==="player"&&TEAM_BUB[op.id]&&res!=="draw")return R(TEAM_BUB[op.id][res]);
  if(op.grp&&QBUB[op.grp])return R(QBUB[op.grp][res]||QBUB[op.grp].draw);
  if(VECTOR_BUB[op.id]&&res!=="draw"){const late=typeof G!=="undefined"&&G&&G.seen&&G.seen.y5_vector_resolve;return R((late?VECTOR_BUB_LATE:VECTOR_BUB)[op.id][res]);}
  if(POST_BUBBLE[op.id]&&res!=="draw")return R(POST_BUBBLE[op.id][res]);
  {const c=!op.canon&&postCtx(op,res);if(c&&Math.abs(seed>>2)%10<7)return R(c[0]).replace(/\{n\}/g,c[1]);}
  const P=typeof PERSONA!=="undefined"&&PERSONA[op.name];if(P&&res==="win"&&seed%3===0)return P.line;
  return R(POST_GENERIC[res]);}

// =====================================================================================
// v1.21 CONTENT PACK — decisions with real trade-offs, two-girls-one-evening choices,
// closeness milestones, heartfelt and sportsmanship moments, and a lot more silly neighbours
// =====================================================================================
const inCamp=(G,id)=>G.F[id]&&G.F[id].camp==="player";
const metR=(G,id)=>G.F[id]&&G.F[id].met;
const tire=(G,v)=>roster(G).forEach(f=>f.fatigue=Math.max(0,Math.min(100,f.fatigue+v)));
const cheer=(G,v)=>roster(G).forEach(f=>f.morale=Math.max(0,Math.min(100,f.morale+v)));

DILEMMAS.push(
 {id:"d_tourists",from:6,to:46,need:G=>true,bg:"gym",look:"train",steps:[
  {n:"nar",t:"A white van stops at the gate. Twelve tourists pile out with cameras and elephant-print shirts"},
  {n:"npc",who:"Mark (tour guide)",t:"Sawadee krap! My tour group wants to learn authentic Muay Thai, five hundred baht a head, all day, can do?"},
  {n:"coach",t:"Good money, but teaching twelve tourists all day, our kids will be worn out instead of training"},
  {choice:[{t:"Teach all day (+฿6,000 · everyone fatigue +12)",fx:G=>{G.cash+=6000;tire(G,12);},then:[{n:"npc",who:"Mark (tour guide)",t:"I can't feel my legs… but five stars! Review for sure!"},{n:"nar",t:"A five-star review goes up on a travel site that very night"}]},
   {t:"Coach Daeng teaches half a day, fighters help a little (+฿2,500 · fatigue +4)",fx:G=>{G.cash+=2500;tire(G,4);},then:[{n:"coach",t:"Wai khru first! Not a high five! …Okay, a high five is fine"}]},
   {t:"Have the fighters perform only the wai khru dance (+฿1,500 · fame +0.3)",fx:G=>{G.cash+=1500;G.rep+=.3;cheer(G,2);},then:[{n:"nar",t:"The tourists watch the wai khru in silence to the end, then applaud for a full minute"}]},
   {t:"Sorry, we're training hard right now (morale +2)",fx:G=>cheer(G,2),then:[{n:"npc",who:"Mark (tour guide)",t:"Okay! Then a selfie in front of the camp sign instead~"}]}]}]},
 {id:"d_tiktok",from:10,to:46,need:G=>G.rep>=8&&inCamp(G,"mali")&&inCamp(G,"rin"),bg:"gym",look:"train",steps:[
  {n:"nar",t:"'Split a coconut with one kick' clips are trending nationwide, millions of views each"},
  ...[{n:"mali",f:"happy",t:"Mali can do it! In Chaiya we kick coconuts for fun as kids~ Let me film it, let me film it!"}],
  {n:"rin",f:"pout",t:"A mature coconut is as hard as a human knee. High chance of bruised shins"},
  {choice:[{t:"Let Mali kick! (fame +1.5 · Mali fatigue +6)",fx:G=>{G.rep+=1.5;if(inCamp(G,"mali"))G.F.mali.fatigue=Math.min(100,G.F.mali.fatigue+6);add(G,"mali","bond",3);},then:[{n:"nar",t:"Thwack! The coconut splits in two, juice splashes the camera, two million views in one night"},{n:"mali",f:"happy",t:"But Mali's shin… waah… ice please~"}]},
   {t:"Have Rin calculate the safe striking point first (fame +0.8)",fx:G=>{G.rep+=.8;add(G,"rin","bond",3);},then:[{n:"rin",f:"happy",t:"Hit the seam of the husk at forty-five degrees… okay, it's safe now"},{n:"nar",t:"The clip gets fewer views, but people share it as 'science-based Muay Thai'"}]},
   {t:"Skip the trend, she'll get hurt (trust +2)",fx:G=>roster(G).forEach(f=>add(G,f.id,"trust",2)),then:[{n:"mali",f:"pout",t:"Waah… fine. Then Mali will just eat the coconut"}]}]}]},
 {id:"d_drink",from:14,to:46,need:G=>G.rep>=12,bg:"gym",look:"train",steps:[
  {n:"npc",who:"Golden Gaur energy drink sales rep",t:"Hello! We'd like your fighters in a commercial, saying 'Golden Gaur: the power of the gaur, not the power of a kid!'"},
  {n:"kati",f:"surprised",t:"…Do I really have to say that?"},
  {choice:[{t:"Take the full contract (+฿8,000 · Kati a little embarrassed)",fx:G=>{G.cash+=8000;add(G,"kati","morale",-3);},then:[{n:"kati",f:"flustered",t:"Golden Gaur… power of the gaur… not the power of a kid…! (wants to dig a hole and hide)"}]},
   {t:"Negotiate a new slogan (+฿5,000 · fame +0.3)",fx:G=>{G.cash+=5000;G.rep+=.3;},then:[{n:"npc",who:"Golden Gaur energy drink sales rep",t:"'Drink it and keep training' works too… the market will probably like it"}]},
   {t:"Decline, the camp's image matters more",fx:G=>add(G,"kati","trust",3),then:[{n:"kati",f:"happy",t:"Phew… thank you for saving my life"}]}]}]},
 {id:"d_poach",from:18,to:44,need:G=>inCamp(G,"mali")&&inCamp(G,"rin"),bg:"night",look:"casual",steps:[
  {n:"nar",t:"A manager from a famous Bangkok camp messages Mali and Rin, offering double pay"},
  {n:"coach",t:"Word has reached me. The kids haven't answered him yet, they're waiting to hear from us"},
  {choice:[{t:"Raise everyone's pay first (−฿5,000 · trust +6)",fx:G=>{G.cash-=5000;roster(G).forEach(f=>add(G,f.id,"trust",6));},then:[{n:"rin",f:"flustered",t:"I wasn't going to leave anyway… but thank you for valuing us"}]},
   {t:"Talk it out openly with the whole camp tonight",fx:G=>roster(G).forEach(f=>add(G,f.id,"bond",4)),then:[{n:"mali",f:"happy",t:"Mali's not going anywhere~ This place has khanom khrok and everyone"},{n:"kati",f:"happy",t:"This camp isn't big, but it's home"}]},
   {t:"Let each decide for herself, we respect it (morale +3)",fx:G=>cheer(G,3),then:[{n:"rin",f:"happy",t:"…I've thought about it. All the data says stay here"}]}]}]},
 {id:"d_rival_hurt",from:12,to:46,need:G=>Object.keys(G.h2h||{}).length>=2,bg:"night",look:"casual",steps:[
  {n:"nar",t:"Nine at night, a pickup stops at the gate. A young fighter from a rival camp we just fought limps out"},
  {n:"npc",who:"Praewa Sit Khru Nong",t:"Sorry to bother you… I twisted my ankle running, our camp's truck broke down, the hospital is far…"},
  {choice:[{t:"Drive her to the hospital yourself (fame +1 · trust +3)",fx:G=>{G.rep+=1;roster(G).forEach(f=>add(G,f.id,"trust",3));},then:[{n:"npc",who:"Praewa Sit Khru Nong",t:"In the ring we're rivals, but tonight… thank you, truly"},{n:"coach",t:"Sportsmanship. That's what Grandpa Chai taught"}]},
   {t:"Have the camp masseuse look at the ankle first (−฿500 · fame +0.5)",fx:G=>{G.cash-=500;G.rep+=.5;},then:[{n:"kati",f:"happy",t:"Wrap it like this and it'll heal. When it does, let's fight again!"}]},
   {t:"Call an ambulance for her, then go back to rest",fx:G=>{},then:[{n:"nar",t:"The ambulance arrives in twenty minutes; Praewa waves thanks from the stretcher"}]}]}]},
 {id:"d_landlord",from:8,to:48,need:G=>G.cash<9000,bg:"gym",look:"casual",steps:[
  {n:"npc",who:"Jae Muay, the landlady",t:"Next month's rent, pay me a month early, okay? Jae's going on a Japan tour"},
  {n:"coach",t:"(whispers) There isn't much left in the account"},
  {choice:[{t:"Pay it (−฿3,000)",fx:G=>{G.cash-=3000;},then:[{n:"npc",who:"Jae Muay, the landlady",t:"Great! Jae'll bring you green-tea KitKats"}]},
   {t:"Let Coach Daeng negotiate (he courted her in his youth)",fx:G=>{add(G,"kati","morale",3);},then:[{n:"coach",t:"Muay… remember the temple fair in 1987?"},{n:"npc",who:"Jae Muay, the landlady",t:"…Fine, fine, no need to pay early! Don't bring that up in front of the kids!"},{n:"mali",f:"surprised",t:"Coach Daeng has a past?!"}]},
   {t:"Have the fighters do a street exhibition at the market for cash (+฿2,000 · fatigue +10)",fx:G=>{G.cash+=2000;tire(G,10);},then:[{n:"nar",t:"The whole market crowds around; vendors toss money into the bowl until it overflows"}]}]}]},
 {id:"d_fanart",from:16,to:48,need:G=>G.rep>=25&&inCamp(G,"mali"),bg:"gym",look:"casual",steps:[
  {n:"nar",t:"A fan sends a package to camp: a life-size cardboard cutout of Kati, grinning wide and raising a fist"},
  {n:"kati",f:"flustered",t:"Th-that's me? Why am I smiling so wide!"},
  {n:"mali",f:"happy",t:"So accurate~ just like Kati's face when she sees mango sticky rice!"},
  {choice:[{t:"Put it at the camp gate (fame +0.6)",fx:G=>{G.rep+=.6;},then:[{n:"nar",t:"Passing drivers stop to take photos with it every day. The motorbike-taxi uncle bows to it every morning thinking it's a shrine"}]},
   {t:"Give it to Kati to keep",fx:G=>{add(G,"kati","bond",4);},then:[{n:"kati",f:"flustered",t:"I'll put it behind the wardrobe… nobody's allowed to see!"}]},
   {t:"Auction it to raise money for camp (+฿3,500)",fx:G=>{G.cash+=3500;add(G,"kati","morale",-2);},then:[{n:"kati",f:"pout",t:"I sold for three thousand five hundred… isn't that too cheap?!"}]}]}]},
 {id:"d_uncle",from:20,to:48,need:G=>G.rep>=20,bg:"gym",look:"casual",steps:[
  {n:"npc",who:"A stranger",t:"Kati! My niece! I'm Grandpa Chai's half brother! I lost my job, could I borrow five thousand…"},
  {n:"kati",f:"surprised",t:"…Grandpa didn't have a brother. Grandpa was an only child"},
  {n:"npc",who:"A stranger",t:"…An only child… with a brother… yes, yes!"},
  {choice:[{t:"Call Coach Daeng to chase him off",fx:G=>{},then:[{n:"coach",t:"You! Last month you claimed to be Ploy's uncle!"},{n:"nar",t:"The man runs off with only one sandal"}]},
   {t:"Give him a boxed meal (−฿60 · fame +0.2)",fx:G=>{G.cash-=60;G.rep+=.2;},then:[{n:"npc",who:"A stranger",t:"…Basil fried rice… thank you, niece. Uncle won't scam this camp again"}]}]}]},
 {id:"d_noodle",from:6,to:48,need:G=>G.cash<6000&&inCamp(G,"mali")&&inCamp(G,"rin"),bg:"gym",look:"casual",steps:[
  {n:"nar",t:"End of the month. The camp fridge has ten packs of instant noodles and two eggs"},
  {n:"rin",f:"pout",t:"Protein per person is sixty percent below what athletes need"},
  {n:"mali",f:"happy",t:"It's fine~ Mali can make Chaiya-style drunken noodles!"},
  {choice:[{t:"Instant noodle party for the whole camp (morale +4)",fx:G=>cheer(G,4),then:[{n:"kati",f:"happy",t:"Better than a restaurant! Mali could open a shop"}]},
   {t:"Pay for grilled chicken (−฿600 · fatigue −4)",fx:G=>{G.cash-=600;tire(G,-4);},then:[{n:"rin",f:"happy",t:"Protein restored to safe levels. Thank you"}]},
   {t:"Ask Auntie Taew to put som tam on credit",fx:G=>cheer(G,2),then:[{n:"npc",who:"Auntie Taew, som tam stall",t:"Credit's fine! But when you win, come take a photo with Auntie!"}]}]}]}
);

// ---------- two of them want the same evening (the one you don't pick drops a little) ----------
DILEMMAS.push(
 {id:"j_loykrathong",from:30,to:40,need:G=>inCamp(G,"kati")&&inCamp(G,"mali"),bg:"loy_night",look:"casual",steps:[
  {n:"nar",t:"Loy Krathong night. Lights twinkle along the Ping River"},
  {n:"kati",f:"flustered",t:"Manager… would you float a krathong with me tonight? I made one from banana leaves",with:"mali"},
  {n:"mali",f:"happy",t:"Oh! Mali was going to invite you too~ Mali made a bread krathong for the fish to eat!"},
  {choice:[{t:"Go with Kati",fx:G=>{add(G,"kati","bond",5);add(G,"mali","bond",-1);},then:[{n:"kati",f:"happy",t:"I wish we win the title next year… and float krathongs together again"},{n:"mali",f:"pout",t:"(watching from afar) …sigh, little fish, come eat Mali's krathong instead"}]},
   {t:"Go with Mali",fx:G=>{add(G,"mali","bond",5);add(G,"kati","bond",-1);},then:[{n:"mali",f:"happy",t:"Look! The fish are eating Mali's krathong~ I wish for… secret!"},{n:"kati",f:"sad",t:"(floats a krathong alone, quietly) …It's fine"}]},
   {t:"Go, all three together",fx:G=>{add(G,"kati","bond",2);add(G,"mali","bond",2);},then:[{n:"kati",f:"happy",t:"Okay! As a team"},{n:"mali",f:"happy",t:"Team Sirichai, float them together, one, two, three!"}]}]}]},
 {id:"j_ploy_coffee",from:18,to:44,need:G=>inCamp(G,"kati")&&metR(G,"ploy"),bg:"cafe",look:"casual",steps:[
  {n:"nar",t:"After the district press conference, Ploy walks up to you right in front of Kati"},
  {n:"ploy",f:"happy",t:"Are you free? I'd like to talk Muay Thai with the manager who revived an abandoned camp. Let's have tea",with:"kati"},
  {n:"kati",f:"pout",t:"…Manager, didn't we plan to watch tapes together?"},
  {choice:[{t:"Have tea with Ploy",fx:G=>{add(G,"ploy","bond",5);add(G,"kati","bond",-1);},then:[{n:"ploy",f:"happy",t:"Your camp has something Golden Tiger doesn't… I still can't find the word for it"},{n:"kati",f:"pout",t:"(watches tapes alone, rewinding harder than usual)"}]},
   {t:"Decline, I have plans with Kati",fx:G=>{add(G,"kati","bond",5);add(G,"ploy","bond",-1);},then:[{n:"kati",f:"happy",t:"(walking ahead very fast) Let's go! The tapes are waiting!"},{n:"ploy",f:"sad",t:"…Another time, then"}]},
   {t:"Invite Kati along, the three of you",fx:G=>{add(G,"kati","bond",2);add(G,"ploy","bond",2);},then:[{n:"nar",t:"The table falls silent for five full minutes, both staring into their tea"},{n:"ploy",f:"happy",t:"…Your lead hand has improved, Kati"},{n:"kati",f:"flustered",t:"…Your spinning elbow has gotten… scarier too"}]}]}]},
 {id:"j_rin_fah",from:22,to:46,need:G=>inCamp(G,"rin")&&metR(G,"fah"),bg:"fair",look:"casual",steps:[
  {n:"nar",t:"The annual temple fair, a balloon-shooting stall"},
  {n:"fah",f:"angry",t:"You! Shooting contest with Fah, loser buys Fah dinner!",with:"rin"},
  {n:"rin",f:"pout",t:"Manager, according to plan we buy old videotapes at that stall over there. Twelve minutes left"},
  {choice:[{t:"Accept Fah's challenge",fx:G=>{add(G,"fah","bond",5);add(G,"rin","bond",-1);},then:[{n:"fah",f:"happy",t:"Haha, you lost! Moo kratha! Let's go, let's go!"},{n:"rin",f:"pout",t:"(buys tapes alone) …the shop closed one minute before I got there"}]},
   {t:"Go buy tapes with Rin",fx:G=>{add(G,"rin","bond",5);add(G,"fah","bond",-1);},then:[{n:"rin",f:"happy",t:"Found it! Grandpa Chai's 1992 fight… I've been looking for it for three years"},{n:"fah",f:"angry",t:"Tch! Fine, don't play!"}]},
   {t:"Let Rin and Fah compete",fx:G=>{add(G,"rin","bond",2);add(G,"fah","bond",2);},then:[{n:"rin",f:"happy",t:"I've calculated the trajectory"},{n:"nar",t:"Rin pops ten in a row; Fah's jaw drops"},{n:"fah",f:"surprised",t:"That's cheating! …Teach Fah too"}]}]}]}
);

// ---------- closeness milestones as weekly events (not only on dates) — heartfelt beats ----------
const BOND_BEATS={
 kati:{20:[{n:"nar",t:"Five a.m. You arrive at camp early and find Kati dusting Grandpa Chai's photo on the shelf"},{n:"kati",f:"happy",l:"train",t:"Grandpa always woke before everyone, so I woke before him… and I still can't stop"},{n:"kati",f:"flustered",l:"train",t:"…But lately I'm not the only one awake. That's really nice"}],
   55:[{n:"nar",t:"Rain is too heavy to train. Kati sits under the eaves wrapping your hands"},{n:"kati",f:"sad",l:"casual",t:"When Grandpa died, I thought this camp would never have laughter again"},{n:"kati",f:"happy",l:"casual",t:"Thank you for not letting the camp go quiet… and not letting me go quiet either"},
     {choice:[{t:"I don't want you to go quiet either",fx:G=>add(G,"kati","bond",3),then:[{n:"kati",f:"flustered",l:"casual",t:"…Then I'll talk more every day. No complaining!"}]},{t:"This camp has laughter because of you",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"flustered",l:"casual",t:"…Say that and I'll cry"}]}]}]},
 mali:{20:[{n:"nar",t:"Mali video-calls her mother in Chaiya, then suddenly turns the camera to you"},{n:"mali",f:"happy",l:"casual",t:"Mom~ this is the manager I told you about! The one who buys Mali khanom khrok!"},{n:"nar",t:"Mali's mother puts her hands together through the screen: 'Please take care of my daughter. She smiles a lot, but she gets lonely'"},{n:"mali",f:"flustered",l:"casual",t:"Mom!! You didn't have to say that!"}],
   55:[{n:"nar",t:"Late at night you find Mali hugging her knees beside the ring"},{n:"mali",f:"sad",l:"casual",t:"Dad used to say girls who fight have no future… Dad never came to watch Mali fight even once"},{n:"mali",f:"sad",l:"casual",t:"So Mali smiles all the time, because if she stops, she's scared she'll believe him"},
     {choice:[{t:"On title day, I'll send your father a ticket myself",fx:G=>{add(G,"mali","bond",3);add(G,"mali","morale",8);},then:[{n:"mali",f:"flustered",l:"casual",t:"…If Dad really comes, Mali will kick so he sees the future is right here"}]},{t:"You don't have to smile all the time. You can cry here",fx:G=>add(G,"mali","trust",5),then:[{n:"nar",t:"Mali cries in front of someone for the first time, then laughs through the tears"},{n:"mali",f:"happy",l:"casual",t:"Not smiling just for a moment… tomorrow the smile's back~"}]}]}]},
 rin:{20:[{n:"nar",t:"You see Rin making spreadsheets at one a.m., the laptop lighting her face blue"},{n:"rin",f:"pout",l:"casual",t:"Don't worry. I sleep little as a rule. Data waits for no one"},{n:"rin",f:"flustered",l:"casual",t:"…But if you want to sit there and keep me company, that's fine. Not asking, just saying it's fine"}],
   55:[{n:"nar",t:"Rin hands you an old notebook, full of a child's handwriting recording Muay Thai stats since age eight"},{n:"rin",f:"sad",l:"casual",t:"As a kid no one ever picked me for a team, so I sat and wrote down why the winning team won"},{n:"rin",f:"flustered",l:"casual",t:"Now I'm on a team… you're the first to choose me for me, not for the numbers"},
     {choice:[{t:"Your numbers are part of you too",fx:G=>add(G,"rin","trust",5),then:[{n:"rin",f:"happy",l:"casual",t:"…I'll write that sentence on the first page of a new notebook"}]},{t:"This team will never go without you",fx:G=>add(G,"rin","bond",3),then:[{n:"rin",f:"flustered",l:"casual",t:"The probability that I cry right now… is very high. Don't look"}]}]}]},
 ploy:{20:[{n:"nar",t:"Beside Golden Tiger's training yard, Ploy hands you a water bottle without looking at you"},{n:"ploy",f:"happy",l:"casual",t:"Everyone comes to me for an autograph. You came because you wanted to know how I train… strange"}],
   55:[{n:"nar",t:"Late at night, Ploy sits alone in the empty stadium stands"},{n:"ploy",f:"sad",l:"casual",t:"Since I was thirteen everyone has called me gifted. No one asks how hard I train"},{n:"ploy",f:"sad",l:"casual",t:"If I lose, people say the talent ran out. If I win, they say well, talent. …I never get to just be someone who tries"},
     {choice:[{t:"To me, you're someone who has always tried",fx:G=>{add(G,"ploy","bond",3);add(G,"ploy","trust",4);},then:[{n:"ploy",f:"flustered",l:"casual",t:"…I've waited ten years for that sentence"}]},{t:"Kati sees you that way too. She respects you deeply",fx:G=>add(G,"ploy","trust",5),then:[{n:"ploy",f:"happy",l:"casual",t:"Kati?… Then in this year's final, I must fight in a way worthy of that respect"}]}]}]},
 fah:{20:[{n:"nar",t:"Fah shows up at Sirichai's gate with a bag of sausages"},{n:"fah",f:"pout",l:"casual",t:"Grandma said to share. Not that Fah came to see you! …Want to eat together?"}],
   55:[{n:"nar",t:"Fah takes you on the back of her motorbike to Grandma's house on the edge of town: a small wooden house, walls covered in photos of little Fah in gloves"},{n:"fah",f:"sad",l:"casual",t:"Grandma raised Fah alone, sold sausages to pay for Fah's Muay Thai… Fah's tough with everyone, but with Grandma Fah never wins"},{n:"fah",f:"flustered",l:"casual",t:"You're the first one Fah's brought here …remember that!"},
     {choice:[{t:"Your grandma must be so proud of you",fx:G=>add(G,"fah","trust",5),then:[{n:"fah",f:"flustered",l:"casual",t:"…Don't say that in front of Grandma. She'll cry, and then Fah will cry too"}]},{t:"May I take some of Grandma's sausages for everyone at camp?",fx:G=>{add(G,"fah","bond",3);G.cash+=0;},then:[{n:"nar",t:"Fah's grandma laughs until she cries, then packs three big bags of sausages"},{n:"fah",f:"happy",l:"casual",t:"Grandma likes you now. You're doomed, haha"}]}]}]}};
for(const id of Object.keys(BOND_BEATS))for(const th of [20,55]){
  EVENTS.push({id:`bb_${id}_${th}`,look:"casual",bg:th===55?"night":id==="ploy"||id==="fah"?"camp":"gym",
    when:G=>G.F[id]&&G.F[id].met&&(G.F[id].bond||0)>=th&&(id==="ploy"||id==="fah"||G.F[id].camp==="player")&&!isAway(G,id)&&absWeek(G)-(G.lastBeat||0)>=2,
    steps:[{fx:G=>{G.lastBeat=absWeek(G);}},...BOND_BEATS[id][th]]});}

// ---------- v1.88: heart-level scenes (no gameplay effect — story only) ----------
const hAt=(G,id)=>G.F[id]?heartLv(G.F[id]).lv:0;
const HEART_SCENES={
 kati:{
 12:{bg:"camp",steps:[{n:"nar",t:"10 p.m. Kati's light is still on, and you can hear her talking quietly to herself"},{n:"kati",f:"flustered",l:"casual",t:"Manager! …You heard? I'm not crazy. I'm talking to my gloves"},{n:"nar",t:"She holds out a small pair of faded red gloves. The leather is cracked and the laces have been replaced many times"},{n:"kati",f:"happy",l:"casual",t:"The first pair Grandpa bought me, when I was twelve. He haggled for half an hour and got twenty baht off"},{n:"kati",f:"sad",l:"casual",t:"Since Grandpa's been gone I tell them about my day every night. What I trained, what Kru Daeng scolded me for… like telling Grandpa"},{n:"kati",f:"flustered",l:"casual",t:"Lately… most of the stories are about you. The gloves must be sick of your name"},{choice:[{t:"Then tell the gloves I'll look after you",fx:G=>add(G,"kati","bond",3),then:[{n:"kati",f:"flustered",l:"casual",t:"…Tell them yourself. Here"},{n:"nar",t:"You speak to the old gloves. Kati looks away, but her ears have gone bright red"}]},{t:"What's tonight's story? Can I listen?",fx:G=>add(G,"kati","trust",3),then:[{n:"kati",f:"happy",l:"casual",t:"Today's, obviously. You bought coconut water for everyone and forgot your own… the gloves laughed so hard"}]},{t:"You've come a long way from these gloves",fx:G=>add(G,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…I'm not as good as Grandpa hoped yet"},{n:"kati",f:"happy",l:"casual",t:"But I'm still training. Every day. And I'm not training alone anymore"}]}]}]},
 15:{bg:"market",steps:[{n:"nar",t:"Kati leads you behind the morning market, down a narrow lane by a fabric shop. She stops in front of a lamppost"},{n:"kati",f:"happy",l:"casual",t:"This is it. Where I fought three boys when I was twelve. They'd taken my friend's shoes"},{n:"kati",f:"pout",l:"casual",t:"I won! …But I had a black eye for two weeks and got called to the teacher's office"},{n:"nar",t:"She points at the old coffee stall across the lane"},{n:"kati",f:"happy",l:"casual",t:"Grandpa was sitting right there watching. Afterwards he walked over, said 'Good punches, but use them in the right place,' and bought me pa thong ko"},{n:"kati",f:"sad",l:"casual",t:"As a kid I thought 'the right place' meant the ring. Win everything, and Grandpa would be proud"},{n:"kati",f:"flustered",l:"casual",t:"But after losing so many times, and you were still here, everyone was still here… I started thinking he meant something else"},{n:"kati",f:"happy",l:"casual",t:"What do you think? Am I using my punches in the right place yet?"},{choice:[{t:"You are. When you use them to protect people, not only when you win",fx:G=>add(G,"kati","bond",3),then:[{n:"kati",f:"happy",l:"casual",t:"…Yeah. I think Grandpa would say the same. Or something shorter, and then buy pa thong ko"}]},{t:"You already know. Say it yourself",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"flustered",l:"casual",t:"…I know. I just wanted to hear it out loud once"},{n:"kati",f:"happy",l:"casual",t:"Then I'll say it. The right place. Because now I fight for the camp, not to prove I'm worth something"}]},{t:"Not yet. You've still got a lot to learn",fx:G=>add(G,"kati","bond",1),then:[{n:"kati",f:"pout",l:"casual",t:"Mean! …But true. I'll keep learning. You have to be the one teaching me though"}]}]},{n:"nar",t:"On the way back Kati stops at the same stall for two bags of pa thong ko. One for you, one for Grandpa's picture at the camp"}]},
 20:{bg:"camp",steps:[{n:"nar",t:"On a day off, Kati carries an old wooden box out of the storeroom. Inside is a thick red hardback ledger"},{n:"kati",f:"happy",l:"casual",t:"The Sirichai Camp roll book. Grandpa wrote down everyone who ever trained here, since the camp opened forty years ago"},{n:"nar",t:"On the last page, in Grandpa's scrawl: 'Kati — the last pupil.' The rest of the page is blank"},{n:"kati",f:"sad",l:"casual",t:"He wrote 'the last.' I haven't dared open it in years"},{inject:G=>[{n:"kati",f:"happy",l:"casual",t:roster(G).length>1?"But it isn't the last anymore. I've written everyone in the camp in after me":"I've added every new fighter who's come through after me, however long they stayed"}]},{n:"kati",f:"flustered",l:"casual",t:"But there's one name I didn't know where to put… not a pupil, not exactly a teacher"},{n:"kati",f:"happy",l:"casual",t:"So I made a new column"},{n:"nar",t:"She turns the page. A new heading in big red pen: 'Family.' Underneath is one name. Yours"},{choice:[{t:"Can I write your name next to mine?",fx:G=>add(G,"kati","bond",3),then:[{inject:G=>romOf(G,"kati")?[{n:"kati",f:"flustered",l:"casual",t:"…Okay. Write it close. The column's small"}]:[{n:"kati",f:"happy",l:"casual",t:"Yes! A family needs at least two people anyway"}]}]},{t:"This camp is my home now too",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"happy",l:"casual",t:"Yeah… a home where someone's waiting. I haven't felt that since Grandpa"}]},{t:"Grandpa would love to see this page",fx:G=>add(G,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…I'll leave it in front of his picture tonight. Let him read it first"}]}]},{inject:G=>romOf(G,"kati")?[{n:"kati",f:"flustered",l:"casual",t:"Someday… this heading might need changing. You don't have to answer now!"}]:[{n:"kati",f:"happy",l:"casual",t:"Promise me. Whatever happens to the camp, no name on this page ever gets crossed out"}]}]},
 25:{bg:"camp",steps:[{n:"nar",t:"Saturday morning. Sirichai's gym is full of seven little girls in gloves twice the size of their hands"},{n:"kati",f:"happy",l:"casual",t:"Hello! I'm Kru Kati. Welcome to 'Little Sirichai'!"},{n:"nar",t:"One girl hides behind a pillar, refusing her gloves, eyes on the floor. Kati crouches down in front of her"},{n:"kati",f:"happy",l:"casual",t:"Scared? That's okay. I'm scared every fight. I still get in the ring"},{n:"kati",f:"sad",l:"casual",t:"When I was your age I fought some boys who were bullying my friend. An old man told me, 'Good punches, but use them in the right place'"},{n:"kati",f:"happy",l:"casual",t:"Today I'll show you where the right place is"},{n:"nar",t:"Slowly the girl holds out her hands for the gloves. When class ends she runs over and hugs Kati's waist tight"},{n:"kati",f:"flustered",l:"casual",t:"…Manager, did you see? I passed Grandpa's words on"},{choice:[{t:"Grandpa must be grinning ear to ear",fx:G=>add(G,"kati","bond",3),then:[{n:"kati",f:"happy",l:"casual",t:"And buying pa thong ko for all seven kids"}]},{t:"You're a wonderful teacher",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"flustered",l:"casual",t:"Kru Kati… still makes me blush. But I'll get used to it"}]}]}]},
 30:{bg:"camp",steps:[{n:"nar",t:"Sirichai Camp's annual wai khru day. This year the yard is full of fighters, and the pi java drifts from the corner of the ring"},{n:"nar",t:"Kati performs her wai khru last. She bows three times before Grandpa's picture, then turns to you and bows once more"},{n:"kati",f:"happy",l:"casual",t:"This year I'm honouring two teachers. The first taught me to fight"},{n:"kati",f:"flustered",l:"casual",t:"The second taught me there's still a home to come back to when I lose, and that I'm worth something without winning"},{n:"kati",f:"happy",l:"casual",t:"Grandpa's last pupil isn't the last anymore. And she isn't alone anymore"},{choice:[{t:"I couldn't be prouder of you",fx:G=>add(G,"kati","bond",3),then:[{inject:G=>romOf(G,"kati")?[{n:"nar",t:"Kati unties the red-and-white cord she braided herself and carefully ties it round your wrist"},{n:"kati",f:"flustered",l:"casual",t:"The old folks call it tying wrists. …Can I tie it for life? You don't have to answer now. Just don't untie it"}]:[{n:"kati",f:"happy",l:"casual",t:"My second teacher has to watch my wai khru every year. Promise!"}]}]},{t:"Did Grandpa send you to me, or me to you?",fx:G=>add(G,"kati","trust",4),then:[{n:"kati",f:"happy",l:"casual",t:"…Both. Grandpa was the smartest"}]}]},{n:"kati",f:"happy",l:"casual",t:"Come on! Everyone's waiting for Auntie Daeng's khao soi. My treat today. The whole camp!"}]}},
 mali:{
 12:{bg:"camp",steps:[{n:"nar",t:"On a quiet afternoon Mali sits cross-legged outside her room, lap full of plumeria, threading and unthreading the same garland"},{n:"mali",f:"flustered",l:"casual",t:"Ah! You're early! It's not done… it broke again. That's the fourth one"},{n:"mali",f:"happy",l:"casual",t:"Mom says a garland for someone important can't have a single bruised flower. So I'm being a bit picky"},{n:"mali",f:"sad",l:"casual",t:"As a kid I'd sit with Mom outside the market from 4 a.m. Whatever didn't sell went to the temple. We never threw one away"},{n:"mali",f:"happy",l:"casual",t:"Done! Lower your head a bit… you're too tall, I can't reach"},{choice:[{t:"Bow your head for her",fx:G=>add(G,"mali","bond",3),then:[{n:"nar",t:"Mali puts the garland on you and spends far longer than needed straightening the centre flower"},{n:"mali",f:"flustered",l:"casual",t:"…Does it smell nice? I put my whole heart into it"}]},{t:"Sit down so she can reach",fx:G=>add(G,"mali","trust",3),then:[{n:"mali",f:"happy",l:"casual",t:"You're the best! Everyone else tiptoes away to tease me"}]},{t:"Let me make one for you",fx:G=>add(G,"mali","bond",2),then:[{n:"nar",t:"Your garland leans left and has two bruised flowers"},{n:"mali",f:"happy",l:"casual",t:"It's the prettiest! …The bruised ones don't matter, as long as the person who made it isn't"}]}]}]},
 15:{bg:"night",steps:[{n:"nar",t:"Late at night, Mali's voice drifts from behind the camp, bright as always, on the phone"},{n:"mali",f:"happy",l:"casual",t:"It's fine, Mom. I'll handle the school fees. My next purse is good… okay. Sweet dreams"},{n:"nar",t:"When she hangs up she sits still, hugging her knees, staring at the ground. The smile is completely gone"},{n:"mali",f:"flustered",l:"casual",t:"…Manager. You heard all that? I'm fine. Really"},{n:"mali",f:"sad",l:"casual",t:"It's just… some months it's a lot. School fees, Grandma's doctor, the leaking roof. I want it all to stop with me. I don't want anyone else tired because of it"},{choice:[{t:"You don't have to smile here. Tell me all of it",fx:G=>add(G,"mali","trust",4),then:[{n:"nar",t:"Mali tells you everything, slowly, one thing at a time, until nearly 1 a.m. You just listen"},{n:"mali",f:"happy",l:"casual",t:"…That's so much lighter. Like putting a sandbag down off my shoulders"}]},{t:"You're not doing this alone. Tell me when it's too much",fx:G=>add(G,"mali","bond",3),then:[{n:"mali",f:"flustered",l:"casual",t:"…I promise. If it gets too heavy I'll say so. No more carrying it in secret"}]},{t:"Your mom must be so proud of you",fx:G=>add(G,"mali","bond",2),then:[{n:"mali",f:"sad",l:"casual",t:"She says so every time. I'd rather she didn't have to worry than be proud"}]}]},{n:"mali",f:"happy",l:"casual",t:"Tomorrow I'll be smiling like usual. But this time it'll be for real"}]},
 20:{bg:"camp",steps:[{n:"nar",t:"Mali hands you her phone. A video from her mom: the sea in front of their house, small waves rolling in at dawn"},{n:"mali",f:"happy",l:"casual",t:"This is my home sea. I ran along this beach every morning as a kid, kicking waves until my legs got strong"},{n:"mali",f:"sad",l:"casual",t:"When I first got here I watched this every night. I missed it so much I couldn't sleep"},{n:"mali",f:"flustered",l:"casual",t:"But this month I realised I hadn't watched it once… because it's not lonely here anymore"},{n:"mali",f:"happy",l:"casual",t:"Next Songkran, come home with me. Mom can meet the person I talk about every day"},{choice:[{t:"Yes. I want to see the sea that made your kicks so good",fx:G=>add(G,"mali","bond",3),then:[{inject:G=>romOf(G,"mali")?[{n:"mali",f:"flustered",l:"casual",t:"…Mom will definitely ask what you are to me. You answer that one!"}]:[{n:"mali",f:"happy",l:"casual",t:"Yay! Morning beach run. Loser buys khanom jeen!"}]}]},{t:"This is your home too now",fx:G=>add(G,"mali","trust",4),then:[{n:"mali",f:"happy",l:"casual",t:"Yeah… I have two homes now. One with the sea, one with everyone"}]}]},{inject:G=>romOf(G,"mali")?[{n:"mali",f:"flustered",l:"casual",t:"Take care of me… darling. And that one's not a typo"}]:[{n:"mali",f:"happy",l:"casual",t:"Whatever day it is, if you're tired, come find me. I'll always have snacks and a smile"}]}]},
 25:{bg:"camp",steps:[{n:"nar",t:"School break. Mali's middle sibling arrives at camp with a bag bigger than they are, hair in two buns just like their sister"},{n:"mali",f:"happy",l:"casual",t:"This is my sibling! I'm teaching today. Nobody steal my job!"},{n:"nar",t:"Mali teaches kicks all morning, more patient than anyone's ever seen her. Every miss, she laughs and says try again"},{n:"mali",f:"sad",l:"casual",t:"…When I was little nobody taught me like this. I watched temple-fair fights in secret and kicked banana trees"},{n:"mali",f:"happy",l:"casual",t:"Today I get to be the person I wished I had as a kid"},{choice:[{t:"Your sibling's lucky to have you",fx:G=>add(G,"mali","bond",3),then:[{n:"mali",f:"flustered",l:"casual",t:"…We're both lucky. They make me want to be even better"}]},{t:"I can see the future Kru Mali",fx:G=>add(G,"mali","trust",4),then:[{n:"mali",f:"happy",l:"casual",t:"Kru Mali~ When I retire, I'll open a little camp by the sea, next to Mom's house. You have to help"}]}]}]},
 30:{bg:"sea",steps:[{n:"nar",t:"Songkran. Mali's mother's two-storey wooden house by the sea is finished. You're standing in front of a house you'd only seen in a sketchbook"},{n:"nar",t:"Mali's mother threads garlands on the balcony facing the sea. All three siblings run out and splash you at once"},{n:"mali",f:"happy",l:"casual",t:"Welcome to my home! Built from every kick I've ever thrown"},{n:"nar",t:"Mali's mother comes down, places a plumeria garland on you, and gently pours water over your hands in the traditional blessing"},{n:"mali",f:"flustered",l:"casual",t:"Mom says, 'Thank you for looking after my daughter.' …I told her we look after each other"},{choice:[{t:"Thank you for letting me be part of this home",fx:G=>add(G,"mali","bond",3),then:[{inject:G=>romOf(G,"mali")?[{n:"mali",f:"flustered",l:"casual",t:"…The room next to mine is yours forever. Or… if someday you want the same room, Mom says that's fine"}]:[{n:"mali",f:"happy",l:"casual",t:"There'll always be a room here for you, wherever I am"}]}]},{t:"What's your next dream?",fx:G=>add(G,"mali","trust",4),then:[{n:"mali",f:"happy",l:"casual",t:"A little boxing camp next to this house. So the small kids here can kick something besides banana trees"}]}]},{n:"mali",f:"happy",l:"casual",t:"Come on! The giant pot of tai pla is waiting. Tonight we all eat on the balcony watching the sea"}]}},
 rin:{
 12:{bg:"cafe",steps:[{n:"nar",t:"1 a.m. Rin's light is still on. Her door's ajar, and she's editing on three screens"},{n:"rin",f:"flustered",l:"casual",t:"Manager… I'm not working late. This is 'structured leisure'"},{n:"rin",f:"happy",l:"casual",t:"My fight-analysis channel. 313 subscribers. I've been working on this one for three weeks"},{n:"nar",t:"On screen is a huge table. The header reads: 'The Manager's Decisions, This Season'"},{n:"rin",f:"flustered",l:"casual",t:"…This isn't for the channel. I just wanted to understand how you think. You don't decide like any formula I know"},{choice:[{t:"Figured me out yet?",fx:G=>add(G,"rin","trust",3),then:[{n:"rin",f:"happy",l:"casual",t:"Not yet. But I found that you always pick what's good for people over what's good for the stats. …I think that's my favourite data in the file"}]},{t:"Go to sleep. The table can wait",fx:G=>add(G,"rin","bond",3),then:[{n:"rin",f:"flustered",l:"casual",t:"…You're the first person to tell me data can wait"},{n:"nar",t:"Rin hits Save and closes the laptop. Her first night before 2 a.m. in months"}]},{t:"Can I watch one of your channel videos?",fx:G=>add(G,"rin","bond",2),then:[{n:"nar",t:"Rin plays one. Her voice in the video is twice as fast and excited as in real life"},{n:"rin",f:"flustered",l:"casual",t:"…Please don't look at me while it plays"}]}]}]},
 15:{bg:"night",steps:[{n:"nar",t:"Rin hands you a flash drive. Her fingers are ice-cold"},{n:"rin",f:"sad",l:"casual",t:"My first fight. I was nineteen. My parents were in the front row. I got knocked out in round two"},{n:"rin",f:"sad",l:"casual",t:"I've never watched it to the end. Every time it reaches 4:12, I stop it"},{n:"rin",f:"flustered",l:"casual",t:"Today I want to finish it. But not alone…"},{choice:[{t:"We'll watch together. Tell me if you want to stop",fx:G=>add(G,"rin","trust",4),then:[{n:"nar",t:"4:12 passes. A punch lands flush on the chin and the Rin on screen goes down. The Rin beside you doesn't look away"},{n:"rin",f:"sad",l:"casual",t:"…Look. Half a second before the punch I glanced at the stands. I was scared of disappointing my mother, not of my opponent"},{n:"rin",f:"happy",l:"casual",t:"The plan that day wasn't wrong. I just wasn't really in the ring. …Five years trying to calculate it away, and the answer was never in a formula"}]},{t:"You don't have to watch it today",fx:G=>add(G,"rin","bond",2),then:[{n:"rin",f:"sad",l:"casual",t:"…I do. If it's not a day with you beside me, I'll never dare"},{n:"nar",t:"Rin presses Play and holds your sleeve until it ends"}]}]},{n:"rin",f:"flustered",l:"casual",t:"Thank you. I'm deleting this file now. Not out of fear. I just don't need it anymore"}]},
 20:{bg:"cafe",steps:[{n:"nar",t:"Rin asks to meet at a quiet café. She opens her laptop and turns the screen to you, very formally"},{n:"rin",f:"happy",l:"casual",t:"This is my model of Sirichai Camp's success. 214 variables. Three years of work"},{n:"nar",t:"Every cell has a number except the last. It's labelled 'Manager.' Value: #CANNOT_CALCULATE"},{n:"rin",f:"flustered",l:"casual",t:"There was a time a cell like that would keep me up all night until I fixed it"},{n:"rin",f:"happy",l:"casual",t:"But I'm leaving this one on purpose. The first time in my life I'm glad something can't be calculated"},{choice:[{t:"Can the next cell be you?",fx:G=>add(G,"rin","bond",3),then:[{inject:G=>romOf(G,"rin")?[{n:"rin",f:"flustered",l:"casual",t:"…I'll link the two cells with a formula. If one changes, the other follows. Forever"}]:[{n:"rin",f:"happy",l:"casual",t:"Yes. Same value in both. #CANNOT_CALCULATE"}]}]},{t:"You can't be calculated either",fx:G=>add(G,"rin","trust",4),then:[{n:"rin",f:"flustered",l:"casual",t:"…No one's ever said that to me. Everyone says I'm the most predictable person alive"}]}]},{inject:G=>romOf(G,"rin")?[{n:"rin",f:"happy",l:"casual",t:"I've renamed the file. From 'Success Model' to 'Us'"}]:[{n:"rin",f:"happy",l:"casual",t:"I'll never delete that cell, however many times I update the file"}]}]},
 25:{bg:"hall",steps:[{n:"nar",t:"A university lecture hall, three hundred people. Rin stands on stage with forty-eight slides, the remote shaking slightly in her hand"},{n:"rin",f:"flustered",l:"casual",t:"…Good afternoon. Today I'll talk about… about…"},{n:"nar",t:"Rin looks at the front row, centre. You raise a thumb. She takes a deep breath"},{n:"rin",f:"happy",l:"casual",t:"Today I'll talk about the muay thai we can measure, and the muay thai we can't"},{n:"nar",t:"Rin speaks for forty minutes without a stumble. The final slide is a photo of five women fighters arm in arm outside an old camp"},{n:"rin",f:"happy",l:"casual",t:"The most important variable I've found is having someone who believes in you before the data does. Thank you"},{n:"nar",t:"The whole hall stands to applaud. The front row, centre, claps first"},{choice:[{t:"You did it. On the big stage",fx:G=>add(G,"rin","bond",3),then:[{n:"rin",f:"flustered",l:"casual",t:"…The big stage I've always feared. Today I wasn't scared, because I knew where to look"}]},{t:"Is that last slide our camp?",fx:G=>add(G,"rin","trust",4),then:[{n:"rin",f:"happy",l:"casual",t:"Yes. The best data I have"}]}]}]},
 30:{bg:"local",steps:[{n:"nar",t:"The biggest fight of Rin's life. The stadium's packed. Her parents are in the front row, the first time since the day she was knocked out"},{n:"nar",t:"Before the walk-out she hands you her glasses as always. But this time she doesn't recite the plan"},{n:"rin",f:"happy",l:"casual",t:"No plan today. I'll fight with everything my body remembers. And I'll look at this corner, not the stands"},{n:"nar",t:"Round five. Rin slips a punch nobody expected her to, then counters on a rhythm she never drilled. The whole stadium rises"},{n:"nar",t:"At the final bell Rin doesn't look at the scorecards. She runs to the corner, then looks at the front row. Her mother is crying, smiling through it this time"},{n:"rin",f:"flustered",l:"casual",t:"…I don't know if I won or lost. And I don't care. First time in my life"},{choice:[{t:"Put your glasses on and go to your parents",fx:G=>add(G,"rin","bond",3),then:[{inject:G=>romOf(G,"rin")?[{n:"rin",f:"flustered",l:"casual",t:"…Come with me. I'll introduce you as 'the one I can't calculate.' Mother already knows what it means"}]:[{n:"rin",f:"happy",l:"casual",t:"…Come with me. I want her to meet the person who got me back in the ring"}]}]},{t:"You've won, whatever the scorecards say",fx:G=>add(G,"rin","trust",4),then:[{n:"rin",f:"happy",l:"casual",t:"…That's data I believe without checking"}]}]}]}},
 ploy:{
 12:{bg:"temple",need:G=>!!G.F.ploy.met,steps:[{n:"nar",t:"5:30 a.m. The temple courtyard is still dark. Ploy sits on a stone bench, sewing hand wraps with hands steadier than in the ring"},{n:"ploy",f:"happy",l:"casual",t:"You're on time. …I'm nearly done. Sit"},{n:"nar",t:"The wraps are dark grey. At the end, stitched small in purple thread, is your name"},{n:"ploy",f:"flustered",l:"casual",t:"I've sewn three hundred pairs for juniors. This is three-hundred-and-one. I know you don't fight"},{n:"ploy",f:"happy",l:"casual",t:"But whoever stands in the corner has to wrap their fighter's hands. You wrap too loose every time. I've been watching"},{choice:[{t:"Then teach me to do it right",fx:G=>add(G,"ploy","trust",3),then:[{n:"nar",t:"Ploy takes your hand and wraps it slowly, explaining every turn. Somewhere far off the old monk's broom scrapes the stones"},{n:"ploy",f:"flustered",l:"casual",t:"…Your hand's warmer than I expected. Ignore that. Pay attention"}]},{t:"I'll take good care of them",fx:G=>add(G,"ploy","bond",3),then:[{n:"ploy",f:"happy",l:"casual",t:"Don't keep them. Use them. Unused wraps are just cloth"}]},{t:"Why purple thread?",fx:G=>add(G,"ploy","bond",2),then:[{n:"ploy",f:"flustered",l:"casual",t:"…It's my colour. So you know who made them. No more questions"}]}]}]},
 15:{bg:"night",need:G=>!!G.F.ploy.met,steps:[{n:"nar",t:"Late at night Ploy asks to meet by the river. She holds an old faded-yellow envelope, edges worn soft from being opened many times"},{n:"ploy",f:"sad",l:"casual",t:"When I was fifteen, Grandpa Chai sent this to Korat. He invited me to join Sirichai Camp"},{n:"nar",t:"In shaky handwriting: 'Our camp has no money and no fame. But it has people who'll never send you in hurt, and who'll stand by you when you lose'"},{n:"ploy",f:"sad",l:"casual",t:"I didn't come. Golden Tiger offered a scholarship and my family needed money. I chose right. But I've kept this letter eleven years"},{n:"ploy",f:"flustered",l:"casual",t:"Back then I didn't believe a camp like the one he described existed. …Until I saw you stand beside Kati when she lost"},{choice:[{t:"Grandpa would be glad you kept it",fx:G=>add(G,"ploy","bond",3),then:[{n:"ploy",f:"sad",l:"casual",t:"…I never answered it. He was gone before I could"}]},{t:"Whatever camp you're in, what he wrote holds true for you",fx:G=>add(G,"ploy","trust",4),then:[{n:"ploy",f:"flustered",l:"casual",t:"…I don't know how to answer you. So I'll fold the letter away like always. But it doesn't hurt this time"}]}]},{inject:G=>inCamp(G,"ploy")?[{n:"ploy",f:"happy",l:"casual",t:"Eleven years late. But I made it to the camp he wrote about"}]:[{n:"ploy",f:"happy",l:"casual",t:"Someday… I might answer this letter in person. Not on paper"}]}]},
 20:{bg:"river",need:G=>!!G.F.ploy.met,steps:[{n:"nar",t:"Ploy sits beside you by the water. She isn't holding the letter this time. She holds out an empty hand"},{n:"ploy",f:"happy",l:"casual",t:"I finally understand. All my life I was scared of losing, not because it hurts, but because I thought no one would stay"},{n:"ploy",f:"flustered",l:"casual",t:"Now I know someone will. Win or lose, that person will be standing right here"},{n:"ploy",f:"happy",l:"casual",t:"I'm not just 'the prodigy' anymore. I'm Ploy, and I can choose my own path"},{choice:[{t:"Take her hand",fx:G=>add(G,"ploy","bond",3),then:[{inject:G=>romOf(G,"ploy")?[{n:"ploy",f:"flustered",l:"casual",t:"…Still as warm as when I taught you to wrap. I won't let go. Even though this isn't training"}]:[{n:"ploy",f:"happy",l:"casual",t:"…Thank you. You're the first person I've ever reached out to first"}]}]},{t:"I'm always here. Win or lose",fx:G=>add(G,"ploy","trust",4),then:[{n:"ploy",f:"happy",l:"casual",t:"I'll remember. And for the first time, I'll step into the ring without fearing a loss"}]}]},{inject:G=>romOf(G,"ploy")?[{n:"ploy",f:"happy",l:"casual",t:"This New Year, my birthday, be with me. I won't ask for anything more"}]:[{n:"ploy",f:"happy",l:"casual",t:"Thank you for making Grandpa's letter come true"}]}]},
 25:{bg:"farm",need:G=>!!G.F.ploy.met,steps:[{n:"nar",t:"New Year in Korat. Ploy's wooden house sits at the edge of the fields. Her father waits out front in an old PE tracksuit, exactly on time"},{n:"ploy",f:"flustered",l:"casual",t:"Father, this is the person I told you about"},{n:"nar",t:"Ploy's father studies you a long moment, then offers his hand. A grip as strong as his daughter's"},{n:"nar",t:"Midnight, January 1. Ploy takes you to the flower field she ran through as a child. New Year fireworks bloom over the distant town"},{n:"ploy",f:"happy",l:"casual",t:"As a kid I thought the fireworks were for me. Then I grew up and knew better. This year I want to believe it again"},{choice:[{t:"Happy birthday, Ploy. This year they really are for you",fx:G=>add(G,"ploy","bond",3),then:[{n:"ploy",f:"flustered",l:"casual",t:"…One second before midnight, exactly. Your timing's better than mine"}]},{t:"Thank you for bringing me home",fx:G=>add(G,"ploy","trust",4),then:[{n:"ploy",f:"happy",l:"casual",t:"Father said, 'Punctual. Acceptable.' That's the highest praise he gives"}]}]}]},
 30:{bg:"temple",need:G=>!!G.F.ploy.met,steps:[{n:"nar",t:"Instructor certification day. Ploy teaches juniors in front of the examiners. She doesn't shout or order, yet everyone listens"},{n:"nar",t:"A junior misses a kick and falls. Ploy doesn't scold. She sits beside him and rewraps his loose hand wraps"},{n:"ploy",f:"happy",l:"casual",t:"Falling's fine. Get back up. I'm right here"},{n:"nar",t:"The examiners pass her on the spot. Ploy stands still, then turns to you"},{n:"ploy",f:"flustered",l:"casual",t:"What I just said, I got from Grandpa Chai's letter. And from you"},{n:"ploy",f:"happy",l:"casual",t:"I've chosen my path now. A teacher who never lets anyone fall alone"},{choice:[{t:"Congratulations, Kru Ploy",fx:G=>add(G,"ploy","bond",3),then:[{inject:G=>romOf(G,"ploy")?[{n:"ploy",f:"flustered",l:"casual",t:"…Kru Ploy has a request. Not as a teacher. I want to be beside you every morning at five, for life. On time, every day"}]:[{n:"ploy",f:"happy",l:"casual",t:"Kru Ploy… sounds so much better than 'prodigy'. Thank you for being the first to say it"}]}]},{t:"Grandpa Chai would be proud to call you a pupil",fx:G=>add(G,"ploy","trust",4),then:[{n:"ploy",f:"sad",l:"casual",t:"…I was never his pupil. But today, let me count myself as one"}]}]},{inject:G=>inCamp(G,"ploy")?[{n:"ploy",f:"happy",l:"casual",t:"Let's go back to camp. I'll start teaching the Sirichai juniors tomorrow"}]:[{n:"ploy",f:"happy",l:"casual",t:"I'll go back and teach Golden Tiger's juniors the way Grandpa's letter describes, not the way I was taught"}]}]}},
 fah:{
 12:{bg:"night",need:G=>!!G.F.fah.met,steps:[{n:"nar",t:"10 p.m. A storm rolls in and lightning lights up the whole city. Your phone rings. It's Fah"},{n:"fah",f:"pout",l:"casual",t:"…It's nothing!! I just called to ask… have you eaten?"},{n:"nar",t:"Thunder cracks overhead. The line goes silent for three seconds, then you hear shaky breathing"},{n:"fah",f:"sad",l:"casual",t:"…Okay. I admit it. I'm scared of thunder. My name is literally 'sky' and I'm scared of thunder. Funny, right? Go on, laugh"},{n:"fah",f:"sad",l:"casual",t:"When I was little, the night my parents left, it stormed like this. Thunder all night. Grandma held me till morning. I've hated the sound ever since"},{choice:[{t:"I'm not laughing. I'll stay on the line until the storm's over",fx:G=>add(G,"fah","trust",4),then:[{n:"nar",t:"You talk about nothing for hours: sausages, tiger sketches, Grandma's motorbike, until the rain eases at 1 a.m."},{n:"fah",f:"flustered",l:"casual",t:"…Rain's stopped. I'm not scared anymore. …Thanks. Don't tell anyone"}]},{t:"Want to blast music to drown it out? I'll play some too",fx:G=>add(G,"fah","bond",3),then:[{n:"fah",f:"happy",l:"casual",t:"…What is this music?! Dad-era luk thung! Hahaha, I forgot to be scared"}]},{t:"It's not funny. Everyone's scared of something",fx:G=>add(G,"fah","bond",2),then:[{n:"fah",f:"flustered",l:"casual",t:"…You sound like Grandma. She says it's okay to be scared, just not alone"}]}]}]},
 15:{bg:"market",need:G=>!!G.F.fah.met,steps:[{n:"nar",t:"Fah drags you into a tiny tattoo parlour off the market lane and slaps her tiger sketchbook on the counter"},{n:"fah",f:"happy",l:"casual",t:"Today I'm getting it done for real! No stopping me! Grandma said yes!"},{n:"fah",f:"flustered",l:"casual",t:"I'm going with the one you picked. The tiger looking back. But I changed it a little"},{n:"nar",t:"In the drawing, beside the tiger's paw, is a little wooden house. And beside that, a small boxing camp"},{n:"fah",f:"sad",l:"casual",t:"Grandma's house, and… the place I want to protect. This tiger has two places to guard now"},{choice:[{t:"I'll sit right here the whole time",fx:G=>add(G,"fah","bond",3),then:[{n:"nar",t:"Fah grits her teeth and doesn't make a sound. But her grip on your hand is so tight your fingers go white"},{n:"fah",f:"flustered",l:"casual",t:"…I'm not holding on because it hurts. It's because… never mind!!"}]},{t:"Your tiger can guard both",fx:G=>add(G,"fah","trust",4),then:[{n:"fah",f:"happy",l:"casual",t:"…Yeah. Because this tiger isn't guarding alone anymore"}]}]},{inject:G=>inCamp(G,"fah")?[{n:"fah",f:"happy",l:"casual",t:"Done! Sirichai Camp is on my arm forever now. Take responsibility!"}]:[{n:"fah",f:"happy",l:"casual",t:"Done! Don't ask which camp that is! …You already know"}]}]},
 20:{bg:"river",need:G=>!!G.F.fah.met,steps:[{n:"nar",t:"5:30 a.m. Fah rides Grandma's old motorbike along the Ping with you on the back, to an abandoned pier beside a rotting wooden house"},{n:"fah",f:"sad",l:"casual",t:"My old house. Before my parents left. Grandma and I moved out when I was seven. I've never brought anyone here"},{n:"fah",f:"sad",l:"casual",t:"I always knew. I'm sharp with everyone because I'm scared. If nobody gets close, nobody can leave"},{n:"fah",f:"flustered",l:"casual",t:"But you got too close before I could chase you off. …So I brought you here. To leave the fear here, together"},{choice:[{t:"I'm not going anywhere. Leave it here",fx:G=>add(G,"fah","bond",3),then:[{n:"nar",t:"Fah picks up a stone and hurls it into the river as hard as she can. Water sprays up high, and she laughs"},{inject:G=>romOf(G,"fah")?[{n:"fah",f:"flustered",l:"casual",t:"…Darling. …I couldn't type it, but I can say it. Darling! Happy now?!"}]:[{n:"fah",f:"happy",l:"casual",t:"Gone! From now on I'm sharp because it's fun, not because I'm scared!"}]}]},{t:"Thank you for bringing me",fx:G=>add(G,"fah","trust",4),then:[{n:"fah",f:"flustered",l:"casual",t:"…Don't thank me! I should be the one… thank you. For staying"}]}]},{n:"fah",f:"happy",l:"casual",t:"Let's head back. Grandma's making rice soup. She said today's a celebration. No idea how she knew"}]},
 25:{bg:"mountain",need:G=>!!G.F.fah.met,steps:[{n:"nar",t:"5 a.m., Khao Yai. Fah has brought Grandma to see the sea of fog as she promised. Grandma sits wrapped in a thick blanket, her granddaughter never more than a step away"},{n:"fah",f:"pout",l:"casual",t:"Are you cold? Hungry? Need the toilet… Grandma, answer something!"},{n:"nar",t:"Grandma laughs and takes Fah's hand. The first light falls across the fog. Grandma goes quiet, tears running slowly"},{n:"nar",t:"Grandma says softly, 'I thought I'd never see it. The sea of fog, or my grandchild smiling like this'"},{n:"fah",f:"flustered",l:"casual",t:"…Grandma!! Not in front of him!! I'm not crying, the fog got in my eyes!"},{choice:[{t:"Let me take a photo of you two",fx:G=>add(G,"fah","bond",3),then:[{n:"nar",t:"In the photo Grandma grins widely. Fah's face and eyes are red, but her grin is wider still"},{n:"fah",f:"happy",l:"casual",t:"…I'm turning this photo into tiger number fifty-three"}]},{t:"Thank you for bringing her. You did it",fx:G=>add(G,"fah","trust",4),then:[{n:"fah",f:"happy",l:"casual",t:"We did it! You drove, I pushed Grandma. Teamwork!"}]}]}]},
 30:{bg:"river",need:G=>!!G.F.fah.met,steps:[{n:"nar",t:"Fah's birthday, October 31. She's dressed as the silver-haired witch as always, but this year Grandma's house is packed"},{n:"nar",t:"Neighbourhood kids come for candy, market vendors bring sausages, tattoo clients bring cake. Nobody goes to any other Halloween party"},{n:"fah",f:"flustered",l:"casual",t:"…Why is everyone here? Nobody ever comes to my birthday"},{n:"nar",t:"Grandma whispers, 'Someone went door to door inviting the whole street last week,' and looks at you"},{n:"fah",f:"sad",l:"casual",t:"…You. Why would you do this? I said I didn't want a present. Just you there till the candles went out"},{choice:[{t:"I'm staying till the candles go out. And after that too",fx:G=>add(G,"fah","bond",3),then:[{inject:G=>romOf(G,"fah")?[{n:"nar",t:"Fah blows out the last candle, then tugs your sleeve out to the pier behind the house"},{n:"fah",f:"flustered",l:"casual",t:"…Darling. I can say it now. Every day. From now on I won't fear you leaving, because you promised. No take-backs. For life!"}]:[{n:"fah",f:"happy",l:"casual",t:"…You!! Fine! Best birthday of my life! Happy now?! …Thank you"}]}]},{t:"Your birthday should've always been like this",fx:G=>add(G,"fah","trust",4),then:[{n:"fah",f:"happy",l:"casual",t:"…It wasn't from the start. But from now on it is. That's enough"}]}]},{n:"fah",f:"happy",l:"casual",t:"Come on! I'm giving the kids every last candy. This year the silver-haired witch is the kindest one!"}]}}};
for(const id in HEART_SCENES)for(const lv in HEART_SCENES[id]){const S=HEART_SCENES[id][lv];
  EVENTS.push({id:`hs_${id}_${lv}`,look:"casual",bg:S.bg,
    when:G=>{const f=G.F[id];return !!(f&&f.met&&hAt(G,id)>=+lv&&(S.need?S.need(G):f.camp==="player")&&!isAway(G,id)&&!(+lv>=30&&topLock(G,id))&&absWeek(G)-(G.lastBeat||0)>=2);},/* v1.89.11: on the harem route the top scene gives way to the group ones */
    steps:[{fx:G=>{G.lastBeat=absWeek(G);}},...S.steps]});}

// ---------- sportsmanship ----------
EVENTS.push(
 {id:"sp_ploy_return",look:"casual",bg:"gym",when:G=>G.flags&&G.flags.vs_ploy&&G.week<48&&metR(G,"ploy")&&inCamp(G,"kati"),steps:[
  {n:"nar",t:"Two days after the fight, Ploy comes to Sirichai holding an old mongkhon"},
  {n:"ploy",f:"happy",t:"Your mongkhon fell in the ring corner that night. I kept it for you. Things like this must never get lost",with:"kati"},
  {n:"kati",f:"surprised",t:"Grandpa's mongkhon… I thought it was gone. Thank you, Ploy"},
  {n:"ploy",f:"happy",t:"In the ring we don't hold back. Out of it, we're fighters alike"},
  {n:"coach",t:"(mutters) Whose student is so well-mannered… except for the camp-switching part"}]},
 {id:"sp_kati_wai",look:"fight",bg:"local",when:G=>G.week>=12&&inCamp(G,"kati")&&(G.F.kati.rec.w||0)>=3,steps:[
  {n:"nar",t:"Last fight, Kati's opponent went down and couldn't rise. Kati ran to help her up before the referee finished counting"},
  {n:"npc",who:"Community radio commentator",t:"She won, didn't raise her arms, but went to help her opponent first… listeners, THIS is Muay Thai!"},
  {n:"kati",f:"flustered",t:"Grandpa taught me: beat people in the ring, but never win hearts by stepping on them"},
  {choice:[{t:"Grandpa Chai must be very proud",fx:G=>{add(G,"kati","morale",5);G.rep+=.5;},then:[{n:"kati",f:"happy",t:"…I hope so"}]},{t:"That's why people love you",fx:G=>{add(G,"kati","bond",3);G.rep+=.5;},then:[{n:"kati",f:"flustered",t:"L-love what? You mean fight fans, right!"}]}]}]},
 {id:"sp_fah_respect",look:"casual",bg:"camp",when:G=>G.flags&&G.flags.vs_fah==="W"&&metR(G,"fah"),steps:[
  {n:"nar",t:"The morning after the fight, Fah is waiting at the gate from five a.m."},
  {n:"fah",f:"pout",t:"Fah didn't come to say thanks! Fah came to say… last night's fight was the most fun since Fah started fighting"},
  {n:"fah",f:"flustered",t:"Fah lost, but Fah's not sad …confusing? Fah's confused too"},
  {n:"coach",t:"Not confusing. That's called sportsmanship"}]},
 {id:"sp_mali_share",look:"train",bg:"gym",when:G=>G.week>=18&&inCamp(G,"mali"),steps:[
  {n:"nar",t:"District weigh-in day. A small-camp fighter forgot her hand wraps and is crying at the back of the room"},
  {n:"mali",f:"happy",t:"Take Mali's~ Mali has two sets, one with jasmine patterns, even prettier!"},
  {n:"npc",who:"Small-camp fighter",t:"But… we have to fight each other"},
  {n:"mali",f:"happy",t:"Exactly! If you don't have wraps, beating you wouldn't be any fun~"},
  {choice:[{t:"Praise Mali in front of everyone",fx:G=>{add(G,"mali","morale",6);G.rep+=.4;},then:[{n:"mali",f:"flustered",t:"Don't praise me so loud! Everyone's looking~"}]},{t:"Quietly give her the camp's spare wraps instead",fx:G=>{add(G,"mali","bond",3);},then:[{n:"mali",f:"happy",t:"Manager is even nicer than Mali~"}]}]}]}
);

// ---------- heartfelt camp moments ----------
EVENTS.push(
 {id:"hf_coach_letter",look:"casual",bg:"night",when:G=>G.week>=34&&G.rep>=10&&inCamp(G,"kati"),steps:[
  {n:"nar",t:"Coach Daeng hands you an old yellow envelope. The handwriting is Grandpa Chai's: 'For my grandchild, once you've stayed half a year'"},
  {n:"coach",t:"Grandpa Chai said if you didn't last half a year, burn it …I'm glad I didn't have to"},
  {n:"nar",t:"'Grandchild, a camp isn't built with a ring, but with people who won't let go of each other. Kati has no one left but this camp. Thank you for not letting go of that child. — Grandpa'"},
  {choice:[{t:"Frame the letter in the camp (everyone's morale +6)",fx:G=>cheer(G,6),then:[{n:"coach",t:"…Good. Let the kids read it every day"}]},{t:"Let Kati read it (Kati trust +)",fx:G=>{add(G,"kati","trust",6);add(G,"kati","morale",6);},then:[{n:"kati",f:"sad",t:"Grandpa's handwriting… (crying) Thank you for not letting go of me"}]}]}]},
 {id:"hf_team_photo",look:"casual",bg:"gym",when:G=>G.week>=26&&inCamp(G,"kati")&&inCamp(G,"mali")&&inCamp(G,"rin"),steps:[
  {n:"nar",t:"The neighbor kid asks to take a team photo with his dad's old film camera"},
  {n:"mali",f:"happy",t:"Everyone squeeze in~ Coach Daeng, smile!",with:"kati"},
  {n:"rin",f:"pout",t:"I'll stand at the edge of the frame. The light is better here"},
  {n:"kati",f:"happy",t:"No way! Rin stands in the middle, nobody on our team stands at the edge!"},
  {n:"nar",t:"Click! The photo comes out a little blurry, Coach Daeng blinked, but everyone is laughing"},
  {fx:G=>{cheer(G,5);G.camp.beauty=Math.min(10,(G.camp.beauty||0)+1);}},
  {n:"nar",t:"The photo hangs beside Grandpa Chai's. Camp looks better, everyone's morale +5"}]}
);

// ---------- silly neighbours (chatter and happenings) ----------
HAPPENINGS.push(
 {id:"h_win",need:G=>inCamp(G,"mali"),bg:"camp",steps:[{n:"npc",who:"Uncle Wang, motorbike taxi",t:"Boss! Teach me to kick, a new taxi guy is stealing my spot at the alley entrance"},{n:"coach",t:"Muay Thai isn't for fighting over taxi queues, uncle!"},
  {choice:[{t:"Teach him the wai khru instead (fame +0.2)",fx:G=>{G.rep+=.2;},then:[{n:"npc",who:"Uncle Wang, motorbike taxi",t:"After the wai, I really did calm down… tomorrow I'll go wai the new guy instead"}]},{t:"Have Mali demonstrate on the heavy bag",fx:G=>cheer(G,2),then:[{n:"nar",t:"Thwack! The bag swings so hard the chain rattles. Uncle Wang quietly goes back to his taxi"}]}]}]},
 {id:"h_somtam",bg:"camp",steps:[{n:"npc",who:"Auntie Taew, som tam stall",t:"Auntie's named new spice levels! Mild is 'Mali', medium is 'Rin', deadly is 'Kati'!"},
  {n:"kati",f:"pout",t:"Why am I the deadly one!"},{n:"npc",who:"Auntie Taew, som tam stall",t:"Because of your punches, dear! Eat it and you cry like you got hit by you!"},{fx:G=>{cheer(G,3);G.rep+=.2;}},{n:"nar",t:"The new som tam sells so well Auntie Taew gives the camp free food for a week"}]},
 {id:"h_rooster",need:G=>inCamp(G,"rin"),bg:"camp",steps:[{n:"nar",t:"The neighbor's fighting rooster jumps the fence to peck the heavy bag every morning"},{n:"rin",f:"pout",t:"It pecks 0.3 seconds faster than our division's average jab. I measured"},
  {choice:[{t:"Name it the camp mascot, 'Little Red'",fx:G=>{cheer(G,3);},then:[{n:"coach",t:"Why name it after me! …Fine, it's as fierce as I was in my youth"}]},{t:"Ask the owner to keep it caged",fx:G=>{},then:[{n:"npc",who:"Rooster owner",t:"Can't cage him! He's training for a big fight next month, just like your fighters"}]}]}]},
 {id:"h_mark_back",need:G=>G.seen&&G.seen.d_tourists,bg:"camp",steps:[{n:"npc",who:"Mark (tour guide)",t:"I'm back! This time I wore a mongkhon, wore it around a mall in Phuket, people bowed to me the whole way!"},
  {n:"coach",t:"A mongkhon is worn for fighting, not mall walking!"},{n:"npc",who:"Mark (tour guide)",t:"I'll bring two more busloads of tours!"},{fx:G=>{G.rep+=.4;}}]},
 {id:"h_karaoke",bg:"night",need:G=>inCamp(G,"mali")&&inCamp(G,"rin"),steps:[{n:"nar",t:"Friday night, the karaoke bar next to camp holds a singing contest. The prize is a sack of rice"},
  {n:"mali",f:"happy",t:"Mali can sing luk thung! Let me enter!"},{n:"rin",f:"pout",t:"Mali's volume exceeds one hundred decibels. The neighbors called the police last month"},
  {choice:[{t:"Send Mali to compete",fx:G=>{cheer(G,3);G.cash+=500;},then:[{n:"nar",t:"Mali wins first place and a sack of rice. The camp saves a month's rice money (+฿500)"}]},{t:"The whole camp enters as a band",fx:G=>{cheer(G,5);},then:[{n:"nar",t:"Band Sirichai finishes last but wins the audience favorite award. Coach Daeng drums off-beat the entire song"}]}]}]},
 {id:"h_rich_fan",need:G=>G.rep>=28,bg:"camp",steps:[{n:"npc",who:"Sia Tong, longan orchard owner",t:"I'm a fan of this camp! Have Kati fight an exhibition at my son's ordination, I'll pay in five tons of longan!"},
  {n:"coach",t:"…Five tons?"},
  {choice:[{t:"Could we take cash instead (+฿4,000)",fx:G=>{G.cash+=4000;tire(G,5);},then:[{n:"npc",who:"Sia Tong, longan orchard owner",t:"Sure! But you get ten crates of longan too, no refusing!"}]},{t:"Take five tons of longan (everyone's morale +4)",fx:G=>{cheer(G,4);G.rep+=.5;},then:[{n:"nar",t:"A ten-wheeler dumps longan in front of the camp. Half the camp gets an upset stomach from eating too much, but everyone laughs all week"}]}]}]},
 {id:"h_ghost",bg:"night",need:G=>inCamp(G,"mali")&&inCamp(G,"rin"),steps:[{n:"nar",t:"Midnight. Thuds come from the heavy bag in the empty training yard"},{n:"mali",f:"surprised",t:"A g-ghost, Grandpa Chai's ghost is training!! Mali's not sleeping anymore!"},{n:"rin",f:"pout",t:"Ghosts have no mass, so they can't move a heavy bag"},
  {n:"nar",t:"Everyone tiptoes over with flashlights… and finds the fat orange cat swinging on the bag"},{n:"coach",t:"Hey! It's Orange! Who fed it this fat!"},{n:"mali",f:"flustered",t:"(hides a bag of khanom khrok behind her back)"},{fx:G=>cheer(G,3)}]},
 {id:"h_broke_pawn",need:G=>G.cash<5000,bg:"camp",steps:[{n:"nar",t:"Coach Daeng disappears for half a day and comes back with three thousand baht, his wristwatch gone"},{n:"coach",t:"Old watch, it ran ten minutes slow every day anyway. Don't worry"},
  {choice:[{t:"Accept it, and promise to buy the watch back (+฿3,000)",fx:G=>{G.cash+=3000;G.flags.watchDebt=true;},then:[{n:"coach",t:"Buy it back when we win the title, so I can wear it in the ring for the photo"}]},{t:"Refuse, go buy it back right now",fx:G=>{roster(G).forEach(f=>add(G,f.id,"trust",3));},then:[{n:"coach",t:"…Stubborn as Grandpa Chai, no doubt about it"}]}]}]},
 {id:"h_tv_quiz",need:G=>G.rep>=22&&inCamp(G,"rin"),bg:"camp",steps:[{n:"nar",t:"A local TV game show invites Rin to compete in a general-knowledge quiz"},{n:"rin",f:"flustered",t:"I can answer every question… except the ones about prime-time soap operas"},
  {choice:[{t:"Send Rin to compete (fame +1 · +฿2,000)",fx:G=>{G.rep+=1;G.cash+=2000;add(G,"rin","bond",3);},then:[{n:"nar",t:"Rin wins by a landslide. The host asks 'Why not become a scientist?' Rin answers 'Muay Thai is science'"}]},{t:"No, a fight is coming up",fx:G=>add(G,"rin","trust",2),then:[{n:"rin",f:"happy",t:"…Good. I'm a little afraid of cameras"}]}]}]}
);
CHATTER.push(
 {id:"c3_kati_rin_math",need:G=>inCamp(G,"rin"),bg:"camp",look:"train",steps:[{n:"rin",f:"happy",t:"Kati, your straight punch is twelve percent faster than at the start of the year",with:"kati"},{n:"kati",f:"surprised",t:"Twelve… is that a lot?"},{n:"rin",f:"happy",t:"Enough to silence everyone who didn't believe in you"},{n:"kati",f:"flustered",t:"…Rin can say nice things?!"},{fx:G=>{add(G,"kati","morale",3);add(G,"rin","morale",3);}}]},
 {id:"c3_mali_coach",need:G=>inCamp(G,"mali"),bg:"camp",look:"train",steps:[{n:"mali",f:"happy",t:"Coach Daeng, why don't you ever smile~"},{n:"coach",t:"I am smiling"},{n:"mali",f:"surprised",t:"…Where?"},{n:"coach",t:"Inside"},{n:"nar",t:"Mali laughs so hard she falls off the ring. Coach Daeng really does smile at the corner of his mouth"},{fx:G=>cheer(G,2)}]},
 {id:"c3_trio_dinner",need:G=>inCamp(G,"mali")&&inCamp(G,"rin"),bg:"camp",look:"casual",steps:[{n:"nar",t:"Dinner after training, all three sit around the moo kratha grill"},{n:"mali",f:"happy",t:"Whoever burns the meat does the dishes~",with:"rin"},{n:"rin",f:"pout",t:"The pan temperature is uneven. This is not my fault"},{n:"kati",f:"happy",t:"Rin, you've burned three pieces already!"},
  {choice:[{t:"Help Rin wash the dishes",fx:G=>add(G,"rin","bond",3),then:[{n:"rin",f:"flustered",t:"…You don't have to help. But if you do, I won't stop you"}]},{t:"Grill for everyone yourself (everyone's morale +3)",fx:G=>cheer(G,3),then:[{n:"mali",f:"happy",t:"Manager grills better than Coach Daeng~"}]}]}]}
);

// ---------- v1.22 mid-season turning points ----------
EVENTS.push(
 {id:"tw_injury",look:"train",bg:"gym",when:G=>G.week>=22&&G.week<=27&&inCamp(G,"kati")&&!G.F.kati.injury,steps:[
  {n:"nar",t:"Evening sparring. Kati switches stance too fast, her ankle rolls with a crack, and she drops to the floor"},
  {n:"kati",f:"sad",t:"I'm fine! It's just… just a little sprain. The district round just started, I can't stop now"},
  {n:"coach",t:"An ankle swollen like this, if she fights through it she might be hurt all year. Your call"},
  {choice:[{t:"Rest two weeks, no risk (trust +)",fx:G=>{G.F.kati.injury=Math.max(G.F.kati.injury,2);add(G,"kati","trust",5);},then:[{n:"kati",f:"pout",t:"Two weeks… fine, but I'll train my hands sitting on a chair, no stopping me!"}]},
   {t:"Take her to a famous Thai massage healer (−฿3,000 · rest 1 week)",fx:G=>{G.cash-=3000;G.F.kati.injury=Math.max(G.F.kati.injury,1);add(G,"kati","bond",3);},then:[{n:"npc",who:"Mor Seng, Thai massage healer",t:"Just a little sprain. Three days of massage, four days of herbal compress, and she'll run!"},{n:"kati",f:"happy",t:"It doesn't hurt anymore! Manager, that was expensive, wasn't it… I'll make it worth it"}]},
   {t:"Let Kati decide",fx:G=>{G.F.kati.fatigue=Math.min(100,G.F.kati.fatigue+12);G.F.kati.grit=Math.min(.12,(G.F.kati.grit||0)+.015);add(G,"kati","trust",3);},then:[{n:"kati",f:"angry",t:"Tape my ankle tight, I'll keep training. Grandpa once fought with cracked ribs"},{n:"coach",t:"…Stubborn as Grandpa Chai. I'll keep an eye on her"},{n:"nar",t:"Kati is much more tired, but her determination steps up another level"}]}]}]},
 {id:"tw_dirty",look:"casual",bg:"camp",when:G=>G.week>=30&&G.week<=36&&G.rep>=10,steps:[
  {n:"nar",t:"Monday morning, a big Muay Thai news page posts that 'Sirichai Camp uses banned substances'. The source is anonymous, but everyone knows who's behind it"},
  {n:"npc",who:"Boss Suea, Golden Tiger Camp",t:"(in an interview) I didn't say it. I'm just 'asking questions'. An abandoned camp winning this fast, it's strange"},
  {n:"kati",f:"angry",t:"I train at five every morning! How can he say that!"},
  {choice:[{t:"Hold a press conference and test the whole camp (−฿2,000 · fame +1.5)",fx:G=>{G.cash-=2000;G.rep+=1.5;G.flags.payakShamed=true;},then:[{n:"nar",t:"Everyone tests clean. Reporters turn their questions on Boss Suea instead; the page deletes the post overnight"}]},
   {t:"Have Rin gather evidence of who leaked it",fx:G=>{if(inCamp(G,"rin")){G.rep+=2;G.flags.payakShamed=true;add(G,"rin","bond",3);}else{G.rep+=.5;}},then:[{n:"rin",f:"happy",t:"The account logged in from Golden Tiger's Wi-Fi. I have twelve screenshots"},{n:"nar",t:"Rin's evidence is shared across the province. Boss Suea has to apologize"}]},
   {t:"Don't respond, let the fists talk (everyone's morale +6)",fx:G=>cheer(G,6),then:[{n:"coach",t:"Good. The ones who have to shout are the ones who don't trust their own fighters"}]}]},
  {n:"nar",t:"That evening, someone stands at the camp gate… Ploy"},
  {n:"ploy",f:"sad",t:"I knew nothing about this, and I don't agree with it. I apologize on behalf of my camp"},
  {n:"ploy",f:"happy",t:"If I'm going to beat you, I want to do it in the ring, not on a news page"},
  {fx:G=>{G.F.ploy.met=true;add(G,"ploy","trust",4);}}]},
 {id:"tw_ploy_night",look:"casual",bg:"night",when:G=>G.week>=43&&G.week<=47&&metR(G,"ploy")&&(G.F.ploy.bond||0)>=10,steps:[
  {n:"nar",t:"Three nights before the final, your phone buzzes. A message from Ploy: 'Are you free? I'm at the empty field by the temple'"},
  {n:"ploy",f:"sad",t:"The boss ordered me to knock Kati out no matter what. He says if I lose, I'm out of the camp next year"},
  {n:"ploy",f:"sad",t:"I fought because I loved it… now I'm not sure what I'm fighting for"},
  {choice:[{t:"Fight for yourself, not for the boss",fx:G=>{add(G,"ploy","trust",5);add(G,"ploy","bond",3);},then:[{n:"ploy",f:"happy",t:"For myself… yes. On final night, I'll fight the most fun fight of my life"},{n:"nar",t:"(Ploy will enter the ring with a lighter heart, and be just as frightening)"}]},
   {t:"Kati's waiting for this fight too. She respects you deeply",fx:G=>{add(G,"ploy","trust",3);add(G,"kati","morale",4);},then:[{n:"ploy",f:"happy",t:"…Then I won't hold back. That's the highest honor I can give"}]},
   {t:"If they don't want you there, there's always room here",fx:G=>{add(G,"ploy","bond",5);G.flags.ployInvite=true;},then:[{n:"ploy",f:"flustered",t:"…Don't say that three nights before the final, I won't be able to fight"},{n:"ploy",f:"happy",t:"After the final… I'll answer"}]}]}]}
);

// ---------- v1.22 personal ending: the person closest to you gets the last word of the season ----------
const PERSONAL_END={
 kati:[{n:"nar",t:"The last night of the year, Kati takes you up on the camp roof. You can see the lights of all of Chiang Mai"},{n:"kati",f:"happy",l:"casual",t:"This time last year I sat here alone, thinking the camp would have to close"},{n:"kati",f:"flustered",l:"casual",t:"This year you're sitting beside me… I think Grandpa is smiling up there"}],
 mali:[{n:"nar",t:"Mali drags you to the night market on the last night of the year, stopping in front of a tiny khanom khrok stall"},{n:"mali",f:"happy",l:"casual",t:"Someday Mali will open a shop like this, called 'Champion Khanom Khrok', hehe"},{n:"mali",f:"flustered",l:"casual",t:"You have to be the first customer… no, better be my business partner~"}],
 rin:[{n:"nar",t:"Rin hands you a thick binder; the cover says 'Sirichai Camp Three-Year Plan'"},{n:"rin",f:"happy",l:"casual",t:"I've planned up to year three. Your name is on every page"},{n:"rin",f:"flustered",l:"casual",t:"…Not just because you're the manager. I still haven't found an explanation for this variable"}],
 ploy:[{n:"nar",t:"After the final, Ploy waits in the parking lot, hand wraps still on"},{n:"ploy",f:"happy",l:"casual",t:"This year I learned what fighting for fun feels like, because of your camp"},{n:"ploy",f:"flustered",l:"casual",t:"Next year we'll meet again. As rivals… or something else, that's up to you"}],
 fah:[{n:"nar",t:"Fah pulls up on her old motorbike: 'Get on, Grandma's waiting for dinner'"},{n:"fah",f:"pout",l:"casual",t:"Grandma says on New Year's Eve you eat with someone important, so Fah… uh… Grandma made me!"},{n:"fah",f:"flustered",l:"casual",t:"…Come eat next year too. Not begging, just saying"}]};
function personalEnding(G){if(G.harem)return [];let id=romFirst(G);if(!id){const c=["kati","mali","rin","ploy","fah"].filter(k=>G.F[k]&&G.F[k].met&&(G.F[k].bond||0)>=40).sort((a,b)=>G.F[b].bond-G.F[a].bond);id=c[0];}
  const base=id&&PERSONAL_END[id]?PERSONAL_END[id]:[];if(romOf(G,id)&&LOVER_END[id])return [...base,...LOVER_END[id]];
  const pr=G.promise?Object.keys(G.promise).find(k=>PROMISE_END[k]):null;return [...base,...(pr&&pr!==id?[]:pr?PROMISE_END[pr]:[])];}

// v1.41: they remember what you said — callbacks to earlier choices
EVENTS.push(
 {id:"mem_kati_bike",look:"casual",when:G=>G.week>=20&&HAS(G,"kati_bike",12)&&inCamp(G,"kati"),bg:"camp",steps:[
  {n:"nar",t:"After evening training, Kati wheels a rusty old bicycle out from behind the shed. Two new tires, price tags still on."},
  {n:"kati",f:"happy",l:"casual",t:G=>`${CALL(G,"kati")}, remember asking who won the bike race back then? So I put new tires on it… Rematch! No falling in the ditch this time!`},
  {choice:[{t:"(Let her win, subtly)",fx:G=>{add(G,"kati","bond",4);},then:[{n:"kati",f:"pout",l:"casual",t:"You went easy on me, didn't you! I saw that! …I still won though. Yay!"}]},
   {t:"(Pedal as hard as you can)",fx:G=>{add(G,"kati","bond",3);add(G,"kati","morale",5);},then:[{n:"nar",t:"On the last bend by the temple, both bikes skid into the ditch together, just like fifteen years ago."},{n:"kati",f:"happy",l:"casual",t:"Hahaha, a tie again! And Grandma's not here to spank us anymore…"}]}]}]},
 {id:"mem_mali_promise",look:"train",when:G=>G.week>=30&&HAS(G,"mali_promise")&&inCamp(G,"mali")&&(G.F.mali.rec.w||0)>=4,bg:"gym",steps:[
  {n:"mali",f:"flustered",l:"train",t:G=>`${CALL(G,"mali")}, the day we met at the temple fair, ${CALL(G,"mali")} said the camp was small, but you'd let me fight for real.`},
  {n:"mali",f:"happy",l:"train",t:"I've won lots of fights now. Mom calls every week asking when I'm fighting next… Thank you for keeping your word."},
  {fx:G=>{add(G,"mali","trust",5);add(G,"mali","bond",3);}},{n:"nar",t:"(Mali remembers that promise · Trust up)"}]},
 {id:"mem_rin_repay",look:"casual",when:G=>HAS(G,"rin_glasses",8)&&inCamp(G,"rin"),bg:"camp",steps:[
  {n:"nar",t:"Monday morning, a white envelope is tucked under the coffee cup on the desk. The handwriting is perfectly neat."},
  {n:"rin",f:"flustered",l:"casual",t:"For the glasses. ฿1,500 exactly. I said I'd pay you back… Don't refuse. I already calculated that you'd try."},
  {choice:[{t:"(Take it)",fx:G=>{G.cash+=1500;add(G,"rin","trust",4);},then:[{n:"rin",f:"happy",l:"casual",t:"Good. Exactly as planned."}]},
   {t:"Keep it for scouting tapes.",fx:G=>{add(G,"rin","bond",5);},then:[{n:"rin",f:"flustered",l:"casual",t:"…This wasn't in the plan at all. Now I have to recalculate everything."}]}]}]},
 {id:"mem_rin_memory",look:"train",when:G=>HAS(G,"rin_memory",10)&&inCamp(G,"rin"),bg:"gym",steps:[
  {n:"rin",f:"happy",l:"train",t:G=>`${CALL(G,"rin")} once said I fight with my memory. Now I remember everything: every fight our camp has had, who threw what, in which round.`},
  {n:"rin",f:"flustered",l:"train",t:"…including what you said that day."},
  {fx:G=>{add(G,"rin","bond",3);G.F.rin.a.iq=Math.min(20,G.F.rin.a.iq+.2);}},{n:"nar",t:"(Rin still remembers what you said · Fight IQ up a little)"}]},
 {id:"mem_kati_promise",look:"casual",when:G=>G.week>=44&&HAS(G,"kati_promise")&&inCamp(G,"kati"),bg:"night",steps:[
  {n:"nar",t:"The night before the big bout, Kati sits outside the camp, slowly wrapping her hands."},
  {n:"kati",f:"flustered",l:"casual",t:G=>`${CALL(G,"kati")}, remember? My second week here, you told me you'd never let me down.`},
  {n:"kati",f:"happy",l:"casual",t:"I said I'd remember those words… Win or lose tomorrow, you never once took them back."},
  {fx:G=>{add(G,"kati","trust",6);add(G,"kati","bond",3);}},{n:"nar",t:"(Kati remembers her first-week promise · Trust up)"}]});

// v1.44: Rin shows up before she joins (as the Tiger camp's quiet analyst), Mali gets a proper first day
EVENTS.push(
 {id:"rin_corner",look:"casual",when:G=>G.week>=7&&G.F.rin.camp!=="player",bg:"ring",steps:[
  {n:"nar",t:"At the local stadium, between rounds of a Golden Tiger bout, a woman in glasses in the red corner isn't cheering anyone. She just keeps writing numbers in a notebook."},
  {n:"ploy",f:"angry",l:"fight",t:"Rin! Stop scribbling and tell me what to do!"},
  {n:"rin",f:"flustered",l:"casual",t:"…Her left kick slows by ten percent after round three. I told you that a month ago."},
  {n:"nar",t:"After the fight she walks past Kati at ringside, and stops half a step."},
  {n:"rin",f:"happy",l:"casual",t:"Sirichai Camp, right? Last fight you held your guard too high when backing off. You took three body kicks because of it."},
  {n:"kati",f:"surprised",l:"train",t:"…You counted?"},
  {choice:[{t:"Thanks. You've got a sharp eye.",fx:G=>{add(G,"rin","bond",4);},then:[{n:"rin",f:"flustered",l:"casual",t:"…Nobody at my camp ever says that."}]},
   {t:"Why tell a rival camp?",fx:G=>{add(G,"rin","trust",3);add(G,"rin","bond",2);},then:[{n:"rin",f:"happy",l:"casual",t:"Data doesn't take sides. There are only people who use it and people who don't."}]}]},
  {n:"nar",t:"She walks back to the Golden Tiger corner without looking back."}]},
 {id:"rin_note",look:"casual",when:G=>G.week>=11&&G.seen.rin_corner&&G.F.rin.camp!=="player"&&G.bookings.some(b=>G.F[b.a].camp==="player"&&b.week>G.week),bg:"camp",steps:[
  {n:"nar",t:"Monday morning, a sheet folded in three is tucked into the mailbox. No sender. The handwriting is tiny and precise, like print."},
  {inject:G=>{const b=G.bookings.filter(b=>G.F[b.a].camp==="player"&&b.week>G.week).sort((x,y)=>x.week-y.week)[0];G.scoutAbs=G.scoutAbs||{};G.scoutAbs[b.b]=absWeek(G);const op=G.F[b.b];
   return [{n:"nar",t:`"${op.name} · ${styleOf(op.a)} · strongest early in each round, clearly slower in the late rounds." Columns of numbers fill the page.`},{n:"coach",t:"Who on earth wrote this… It's more thorough than my own tape study."},{n:"nar",t:"(Free scouting info on the next opponent)"}];}},
  {fx:G=>{add(G,"rin","bond",3);}}]},
 {id:"mali_day1",look:"casual",when:G=>inCamp(G,"mali")&&G.week>=5,bg:"camp",steps:[
  {n:"nar",t:"Mali arrives with a backpack bigger than she is, a potted jasmine, and a bag of sticky rice from home."},
  {n:"mali",f:"happy",l:"casual",t:G=>`${CALL(G,"mali")}! I'm here! Mom sent sticky rice for the whole camp, and says if I'm naughty you're allowed to smack me!`},
  {n:"kati",f:"happy",l:"casual",t:"Your room's next to mine. The window gets morning sun. Your jasmine will love it."},
  {n:"mali",f:"flustered",l:"casual",t:"…This is the first time I've ever had a room of my own."},
  {choice:[{t:"Welcome home.",fx:G=>{add(G,"mali","bond",5);add(G,"mali","trust",3);},then:[{n:"mali",f:"flustered",l:"casual",t:"…Home… I'll remember you said that."}]},
   {t:"Five a.m. tomorrow, first day of training.",fx:G=>{add(G,"mali","bond",3);add(G,"mali","morale",6);},then:[{n:"mali",f:"happy",l:"train",t:"Five a.m.! I'll get up at four!"}]}]}]});

// v1.45: mid-season stakes — Golden Tiger tries to poach one of your girls; trust decides
const POACH_WHY={mali:"The owner says he'll double my pay… I could send so much more to Mom.",rin:"The owner says this time he'll listen to my data, and give me my own analysis room… something they never had."};
const POACH_L={mali:{wait:"I haven't answered them… I wanted to talk to you first.",pay:"…Thank you. I didn't really want to go. I just wanted to know this place still wants me.",ok:"…You didn't stop me, even though you could have. I'm staying. Nothing to think about.",think:"…Give me two weeks to think.",stay:"I've decided. I'm staying at Sirichai. …Don't ask me why.",stay2:"I'm staying… It just feels strange that I almost left. Give me a little time."},
 rin:{wait:"I haven't answered them yet… I wanted to talk to you first.",pay:"…Thank you. It was never about money. I just wanted to know this camp still values my data.",ok:"…You didn't stop me, even though you could have. I didn't include that variable in my model. I'm staying.",think:"…Give me two weeks to analyze it.",stay:"I've decided. I'm staying at Sirichai. …The numbers don't favor this place. But some things don't need calculating.",stay2:"I'm staying… I just haven't sorted out my thoughts yet. Give me a little more time."}};
const POACH_REFUSE={mali:"Thank you, sir, but my home is here now. My jasmine is planted outside my room here. I can't move it.",rin:"The offer is thirty-eight percent higher than here. But there's a variable your camp never had: someone who listens to my data. …Thank you for your interest."};
const POACH_AFTER={mali:"…I didn't ask anyone first, I just answered. I did the right thing, right?",rin:"I didn't hesitate at all. Didn't even need to calculate… Strange, isn't it."};
const POACH_THX={mali:"No need to thank me! Family doesn't abandon each other!",rin:"No need to thank me. The data clearly says this is the best place for me… and for the person I want to be with."};
const POACH_RAISE={mali:"I-I didn't do it for money! …But Mom will be so happy. Thank you.",rin:"There's no need… but I'll note that this camp rewards loyalty."};
const poachTarget=G=>["mali","rin"].filter(id=>inCamp(G,id)).sort((a,b)=>G.F[a].trust-G.F[b].trust)[0];
EVENTS.push(
 {id:"poach",pri:1,look:"casual",when:G=>G.week>=24&&G.week<=34&&!!poachTarget(G),bg:"camp",steps:[
  // v1.57: the girls are loyal — the offer comes, and she turns it down on her own
  {inject:G=>{const id=poachTarget(G),f=G.F[id];return [
   {n:"nar",t:`Saturday afternoon, the Golden Tiger owner parks his luxury car at the gate and hands a gold tiger-seal envelope to ${f.name} in front of everyone.`},
   {n:"nar",t:`${f.name} reads a single line, tears the envelope in half, and hands it back to the owner with both hands.`},
   {n:id,f:"happy",l:"casual",t:POACH_REFUSE[id]},
   {n:"npc",who:"Golden Tiger owner",t:"…How does Sirichai Camp raise its people?"},
   {n:id,f:"flustered",l:"casual",t:POACH_AFTER[id]},
   {choice:[{t:"Thank you for choosing this camp (Trust +)",fx:G2=>{add(G2,id,"trust",8);add(G2,id,"bond",4);},then:[{n:id,f:"happy",l:"casual",t:POACH_THX[id]}]},
    {t:"Raise her pay as a reward for loyalty (wage +฿600/week)",fx:G2=>{f.wage+=600;add(G2,id,"bond",6);add(G2,id,"trust",4);},then:[{n:id,f:"flustered",l:"casual",t:POACH_RAISE[id]}]}]}];}}]},
 {id:"poach_end",look:"casual",when:G=>false,bg:"camp",steps:[{n:"nar",t:""}]}
);

// ===== v1.49: the year loop — calendar, birthdays and festivals that come back every year =====
const CAL_START=[4,25]; // week 1 starts 25 May
const TH_MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function weekDate(w){const d=new Date(2026,CAL_START[0],CAL_START[1]+(Math.max(1,w)-1)*7);return {d:d.getDate(),m:d.getMonth()};}
const weekDateLabel=w=>{const x=weekDate(w);return `${x.d} ${TH_MON[x.m]}`;};
function dateWeek(d,m){const a=new Date(2026,CAL_START[0],CAL_START[1]);let b=new Date(2026,m,d);if(b<a)b=new Date(2027,m,d);return Math.floor((b-a)/864e5/7)+1;}
const BDAY_DM={kati:[13,3],mali:[2,4],rin:[9,8],ploy:[1,0],fah:[31,9]}; // matches PROFILES bday
function bdayWeek(id){const x=BDAY_DM[id];return x?dateWeek(x[0],x[1]):0;}
const yr=G=>G.season||1;
const annualWhen=(w,extra)=>G=>G.week>=w&&G.week<=w+1&&(!extra||extra(G));
const BDAY_CAMP={
 kati:{bg:"gym",y1:[{n:"nar",t:"Songkran falls on Kati's birthday. Kids from the running class have been soaking her since morning."},{n:"kati",f:"happy",l:"casual",t:"When I was little, Grandpa always poured the blessing water for me first and said, ‘Born on Thai New Year, you can always start over.’"},{n:"kati",f:"flustered",l:"casual",t:"Grandpa's not here this year… but everyone is. And the camp is still open."}],
   y2:[{n:"nar",t:G=>`Songkran again, and Kati turns ${21+yr(G)-1} years old. All of Sirichai Camp is soaked.`},{n:"kati",f:"happy",l:"casual",t:G=>`${CALL(G,"kati")}! This year I want to be the one pouring water on your hands. You looked after the camp all year.`}]},
 mali:{bg:"camp",y1:[{n:"nar",t:"Saturday evening, Mali's mom video-calls. A dozen relatives crowd the camera, singing happy birthday in a dozen different keys."},{n:"mali",f:"flustered",l:"casual",t:"I didn't tell anyone here it's my birthday… I didn't want to trouble anyone."},{n:"kati",f:"happy",l:"casual",t:"Too late! I bought a banana cake this afternoon!"}],
   y2:[{n:"nar",t:"Mali's birthday again. This year her mom sent two whole boxes of khao tom mat for the camp."},{n:"mali",f:"happy",l:"casual",t:G=>`${CALL(G,"mali")}, this year I told everyone myself that it's my birthday! …Because this is home now.`}]},
 rin:{bg:"camp",y1:[{n:"nar",t:"Rin sits alone filling in stat sheets, like any other day."},{n:"kati",f:"surprised",l:"casual",t:"(whispering) Today's Rin's birthday. I saw it on her application, but she hasn't said a word."},{n:"rin",f:"flustered",l:"casual",t:"…A birthday is just one day in three hundred sixty-five. Not statistically significant."}],
   y2:[{n:"nar",t:"Rin's birthday again. This year she put the cake on the table herself, with a sign: ‘Do not pretend you didn't know.’"},{n:"rin",f:"flustered",l:"casual",t:"…Last year you all changed my data. Birthdays have become statistically significant."}]}};
const BDAY_GIFT_LINE={kati:["I still use last year's gift every day!","Last year's party was so much fun! This year I'm blowing out the candles for longer!","I remember every word of your wishes from last year."],
 mali:["Last year's gift sits next to my jasmine every day.","Last year everyone sang so loud the neighbor's dog howled. I still laugh about it.","Your wishes last year were really short, but I wrote them down in my notebook."],
 rin:["Last year's gift, I use it every day. 100% utilization rate.","Last year's party exceeded the acceptable noise level… but I liked it.","Your wishes from last year, I saved in a file called ‘Important’."]};
const bdayChoice=id=>({choice:[
  {t:"A gift chosen with care (฿800)",fx:G=>{G.cash-=800;add(G,id,"bond",8);add(G,id,"trust",2);(G.bday=G.bday||{})[id]={y:yr(G),c:0};},then:[{n:id,f:"flustered",l:"casual",t:"…You picked this yourself? It's exactly what I wanted."}]},
  {t:"Throw a party for the whole camp (฿2,000 · everyone: morale +6)",fx:G=>{G.cash-=2000;add(G,id,"bond",5);R_ALL(G,f=>{f.morale=Math.min(100,f.morale+6);});(G.bday=G.bday||{})[id]={y:yr(G),c:1};},then:[{n:"nar",t:"That night Sirichai Camp keeps its lights on late, and the birthday song carries all the way to the market."}]},
  {t:"Heartfelt wishes",fx:G=>{add(G,id,"bond",3);(G.bday=G.bday||{})[id]={y:yr(G),c:2};},then:[{n:id,f:"happy",l:"casual",t:"Thank you… This is really enough."}]}]});
for(const id of Object.keys(BDAY_CAMP)){const B=BDAY_CAMP[id];
  EVENTS.push({id:"bday_"+id,annual:true,pri:1,look:"casual",bg:B.bg,when:G=>{const w=bdayWeek(id);return w>0&&G.week>=w&&G.week<=w+1&&inCamp(G,id);},steps:[
    {inject:G=>{const last=G.bday&&G.bday[id];const lines=last&&last.y<yr(G)?B.y2.concat([{n:id,f:"happy",l:"casual",t:BDAY_GIFT_LINE[id][last.c]}]):B.y1;return lines.concat([bdayChoice(id)]);}}]});}
// rivals: a short message on their birthday
const BDAY_RIVAL={ploy:{t:"January 1st. Everyone celebrates New Year, and nobody remembers it's also Ploy's birthday.",reply:["…How did you know? Nobody ever remembers, everyone's busy with New Year. …Thanks.","Cake? Sent to Golden Tiger? …The juniors will steal it all. But, thank you."]},
 fah:{t:"October 31st, Halloween night, and Fah's birthday. Her stories are full of selfies dressed as a vampire.",reply:["What!? The rival camp's manager sent me birthday wishes!? …I'm not happy about it! I'm just… screenshotting it, that's all.","A pumpkin cake! I'm eating the whole thing myself! …I'm not touched. Not touched at all."]}};
for(const id of Object.keys(BDAY_RIVAL)){const B=BDAY_RIVAL[id];
  EVENTS.push({id:"bday_"+id,annual:true,pri:1,look:"casual",bg:"night",when:G=>{const w=bdayWeek(id);return w>0&&G.week>=w&&G.week<=w+1&&G.F[id]&&G.F[id].met&&!inCamp(G,id);},steps:[
    {n:"nar",t:B.t},
    {choice:[{t:"Send birthday wishes",fx:G=>{add(G,id,"bond",3);},then:[{n:id,f:"flustered",l:"casual",t:B.reply[0]}]},
      {t:"Send a cake (฿600)",fx:G=>{G.cash-=600;add(G,id,"bond",6);},then:[{n:id,f:"happy",l:"casual",t:B.reply[1]}]},
      {t:"(Send nothing)",fx:G=>{}}]}]});}
// v1.60: longer festival nights — every girl in camp gets a moment, pets join in, each festival ends on a quiet beat
const FIN=(G,id)=>inCamp(G,id);
const petOf=(G,k)=>(G.pets||[]).find(p=>p.k===k);
const festTop=G=>roster(G).filter(f=>f.canon).slice().sort((x,y)=>(y.bond||0)-(x.bond||0))[0]||roster(G)[0];
EVENTS.push(
 {id:"fest_newyear",annual:true,pri:1,look:"casual",bg:"market",when:annualWhen(32,G=>roster(G).length>0),steps:[
  {inject:G=>{const S=[],y=yr(G),T=festTop(G);
   S.push({n:"nar",t:y===1?"December 31st, late afternoon. Warorot Market is packed down every lane, and the whole camp has come to shop for New Year's Eve.":`December 31st again. Warorot Market is as packed as ever, but this year Sirichai Camp arrives as a whole procession. That makes ${y} years of shopping together.`});
   if(FIN(G,"kati"))S.push({n:"kati",f:"happy",l:"casual",t:"Sai ua, pork crackling, nam prik num… Grandpa bought this set every year. This year I'm buying it for him."});
   if(FIN(G,"mali"))S.push({n:"mali",f:"happy",l:"casual",t:"Manager, this chicken balloon! Let's tie it at the camp gate. It's not expensive, only twenty baht~"});
   if(FIN(G,"rin"))S.push({n:"rin",f:"pout",l:"casual",t:"…I made a list. Twelve items. The cart now has twenty-seven. Who put in the chicken balloon?"});
   if(FIN(G,"fah"))S.push({n:"fah",f:"flustered",l:"casual",t:"Fireworks! We need fireworks! I only bought… three bags. That's not a lot!"});
   if(FIN(G,"ploy"))S.push({n:"ploy",f:"happy",l:"casual",t:"Fah, put two bags back… I'll carry the rest myself. It's safer."});
   S.push({n:"nar",bg:"camp_night",t:"That night the yard becomes a party. A jim jum hot pot sits in the middle, and Coach Daeng brings out Grandpa Chai's old chair for the head of the table. Nobody sits in it."});
   S.push({n:"coach",t:"Grandpa sat in this chair every New Year's Eve… I'll leave it right here so he can celebrate too."});
   const dog=petOf(G,"dog"),cat=petOf(G,"cat"),roo=petOf(G,"rooster");
   if(dog)S.push({n:"nar",t:`${dog.name} guards the hot pot without moving a step, tail sweeping the yard half clean.`});
   if(cat)S.push({n:"nar",t:`${cat.name} steals a meatball in front of everyone, then eats it on Grandpa Chai's chair without a care.`});
   if(roo)S.push({n:"nar",t:`${roo.name} crows at 9 p.m., as if announcing the new year three hours early.`});
   S.push({n:"nar",t:"After ten, everyone sits in a circle talking about the year. Someone suggests each person say one thing they want to do next year."});
   if(FIN(G,"kati"))S.push({n:"kati",f:"flustered",l:"casual",t:y===1?"I want to put the provincial championship belt in front of Grandpa's photo… and I want more people in the camp.":"I want to fight further than last year… and I want everyone to still be here, all of us."});
   if(FIN(G,"mali"))S.push({n:"mali",f:"happy",l:"casual",t:"I want to bring Mom to watch me fight once! She's never seen how high I can kick now."});
   if(FIN(G,"rin"))S.push({n:"rin",f:"pout",l:"casual",t:"I want to cut everyone's round-three guard drop by twenty percent… and I'd like to see the sea once. Don't write that last one down."});
   if(FIN(G,"fah"))S.push({n:"fah",f:"happy",l:"casual",t:"I want the whole country to see me fight my way! And… I want khao soi at the same shop with everyone every week."});
   if(FIN(G,"ploy"))S.push({n:"ploy",f:"sad",l:"casual",t:"I want to live one year without having to be a genius… Here, I think I can."});
   S.push({n:"coach",t:"All I ask is that next year nobody wrecks a knee and nobody breaks a wrist. That's enough. The rest you can do yourselves."});
   S.push({n:"nar",bg:"newyear",t:"11:50 p.m. Everyone climbs onto the tin roof. The city lights of Chiang Mai sparkle far away, and Doi Suthep is pitch dark behind them."});
   S.push({n:T.id,f:"happy",l:"casual",t:"Ten! Nine! Eight!… Three! Two! One! Happy New Year!"});
   S.push({n:"nar",t:"Fireworks from the city burst into gold across the sky."+(FIN(G,"fah")?" As for Fah's three bags of fireworks, only one lit, but it was the loudest in the whole street.":"")});
   if(dog)S.push({n:"nar",t:`${dog.name} dove under Coach Daeng's bed at the first firework and won't come out until morning.`});
   S.push({choice:[{t:"Wish that nobody gets hurt (everyone: morale +5)",fx:G2=>R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+5);})},
     {t:`Wish for ${T.name}'s dream to come true (Bond +)`,fx:G2=>add(G2,T.id,"bond",5),then:[{n:T.id,f:"flustered",l:"casual",t:`…${CALL(G,T.id)} wished for me just now, didn't you? I heard. Thank you.`}]}]});
   S.push({n:"nar",t:"1 a.m. Everyone else is asleep. Only you and "+T.name+" left sitting on the roof."});
   S.push({n:T.id,f:"happy",l:"casual",t:y===1?"This time last year, I didn't even know I'd meet "+CALL(G,T.id)+"… Please take care of me next year too.":"We've counted down together for "+y+" years now… Next year I'm reserving the seat next to you."});
   S.push({fx:G2=>{G2.flags.fc_ny=(G2.flags.fc_ny||0)+1;}});
   return S;}}]},
 {id:"fest_krathong",annual:true,pri:1,look:"casual",bg:"camp",when:annualWhen(26,G=>yr(G)>=2&&roster(G).length>0),steps:[
  {inject:G=>{const S=[],T=festTop(G);
   S.push({n:"nar",t:"Yi Peng again. That afternoon the camp yard is full of banana leaves, banana trunks, marigolds and incense. Coach Daeng announces that no one buys a krathong this year. You make your own."});
   S.push({n:"coach",t:"In Grandpa Chai's day the whole camp folded banana leaves together every year. A fighter has to fold petals properly, or her hand wraps won't look neat either."});
   if(FIN(G,"kati"))S.push({n:"kati",f:"happy",l:"casual",t:"I fold it the way Grandpa taught me. Eight layers of rose petals… the eighth one always falls off."});
   if(FIN(G,"mali"))S.push({n:"mali",f:"happy",l:"casual",t:"Are there too many flowers on mine? …It's starting to sink before it even floats. Waah."});
   if(FIN(G,"rin"))S.push({n:"rin",f:"pout",l:"casual",t:"Mine's made of bread. Fish can eat it. It breaks down in three hours. …Don't look at me like that. It's pretty in its own way."});
   if(FIN(G,"fah"))S.push({n:"fah",f:"flustered",l:"casual",t:"Fah's krathong is the biggest in camp! …Used half a banana trunk. Not sure it'll float, but it's definitely pretty!"});
   if(FIN(G,"ploy"))S.push({n:"ploy",f:"happy",l:"casual",t:"…(Ploy quietly sets down a krathong with every layer folded perfectly even, then starts fixing Mali's)"});
   const cat=petOf(G,"cat"),tur=petOf(G,"turtle");
   if(cat)S.push({n:"nar",t:`${cat.name} lies on the pile of marigolds and won't move, so everyone ends up folding krathongs around it.`});
   S.push({n:"nar",bg:"river",t:"At dusk the whole camp walks to the Ping River. The water glows with thousands of candles, and Yi Peng lanterns slowly fill the Chiang Mai sky."});
   if(tur)S.push({n:"nar",t:`Someone carries ${tur.name} along. It stretches its neck and watches the krathongs drift by for a long time, as if it remembers being a temple turtle by the river.`});
   if(FIN(G,"fah"))S.push({n:"fah",f:"surprised",l:"casual",t:"It's floating! It's floating! …Oh no, it's tilting! It's tipping! Somebody help!"});
   if(FIN(G,"rin"))S.push({n:"rin",f:"happy",l:"casual",t:"The fish are eating mine… three of them. No, five. I told you it was useful."});
   if(FIN(G,"mali"))S.push({n:"mali",f:"sad",l:"casual",t:"I wished for Mom to rest more… This year I sent home more money than last year, too."});
   if(FIN(G,"kati"))S.push({n:"kati",f:"sad",l:"casual",t:"The eighth petal came off again… Grandpa must be laughing somewhere. His never stayed on either."});
   S.push({n:"coach",t:"Alright, release the lanterns together, the whole camp. Anything you want to send to Grandpa, send it now."});
   S.push({n:"nar",t:"Paper lanterns rise from everyone's hands at once, shrinking until they become one star among hundreds."});
   S.push({n:T.id,f:"flustered",l:"casual",t:`${CALL(G,T.id)}, remember what we wished for last year? …This year I'm making the same wish again.`});
   S.push({choice:[{t:"Release another lantern together, just you two",fx:G2=>add(G2,T.id,"bond",6),then:[{n:"nar",t:"The second lantern rises after the first. Two pairs of hands hold its edge until the very last second."},{n:T.id,f:"happy",l:"casual",t:"…You don't have to tell me what you wished for. I can guess."}]},
     {t:"Release one more lantern for Grandpa Chai with the whole camp (everyone morale +4)",fx:G2=>R_ALL(G2,x=>{x.morale=Math.min(100,x.morale+4);}),then:[{n:"coach",t:"…Thank you, Manager. Grandpa would have liked that."}]}]});
   S.push({n:"nar",bg:"night",t:"Walking back to camp at ten, fireworks still pop now and then. Everyone walks slowly, as if no one wants tonight to end."});
   S.push({fx:G2=>{G2.flags.fc_kt=(G2.flags.fc_kt||0)+1;}});
   return S;}}]},
 {id:"fest_songkran",annual:true,pri:1,look:"casual",bg:"temple",when:annualWhen(47,G=>yr(G)>=2&&roster(G).length>0),steps:[
  {inject:G=>{const S=[],y=yr(G),T=festTop(G);
   S.push({n:"nar",t:"Songkran again. On the morning of the thirteenth the whole camp puts on floral shirts and goes to make merit at the temple, building sand pagodas in a row."});
   if(FIN(G,"rin"))S.push({n:"rin",f:"pout",l:"casual",t:"My sand pagoda is forty-two centimeters tall. The strongest structure here. …Fah's has collapsed twice."});
   if(FIN(G,"fah"))S.push({n:"fah",f:"angry",l:"casual",t:"It didn't fall down by itself! The dog bumped it! …Right, dog?"});
   S.push({n:"nar",bg:"songkran",t:"Back at camp, everyone lines up to pour water over Coach Daeng's hands. The manager gets the front of the line."});
   S.push({n:"coach",t:G2=>`This camp has had ${yr(G2)} years with this manager… I wish for next year, and the year after, and on and on.`});
   if(FIN(G,"kati"))S.push({n:"kati",f:"sad",l:"casual",t:"(Kati pours slower than anyone) Coach… thank you for staying with Grandpa's camp all this time."});
   if(FIN(G,"ploy"))S.push({n:"ploy",f:"happy",l:"casual",t:"Coach Daeng, may I? …At Golden Tiger I never once got to pour water for a coach like this."});
   S.push({n:"nar",t:"The last bowl of water hasn't dried on Coach Daeng's hands when someone splashes Kati in the back, and the water war begins at once."});
   if(FIN(G,"fah"))S.push({n:"fah",f:"happy",l:"casual",t:"New triple-nozzle water gun! Ten-meter range! No getting mad if you're hit!"});
   if(FIN(G,"rin"))S.push({n:"rin",f:"pout",l:"casual",t:"My team has taken the ice bucket. Everyone on my team, stand behind the heavy bags. This isn't play. This is strategy."});
   if(FIN(G,"mali"))S.push({n:"mali",f:"happy",l:"casual",t:"Chalk paste~ Manager, let me dab some on you… Just a little on the cheek. A bit here. And here… and here~"});
   if(FIN(G,"ploy"))S.push({n:"ploy",f:"angry",l:"casual",t:"Fah! Don't aim for the face! …Okay. Fine. If that's how you want to play, I'm getting serious."});
   if(FIN(G,"kati"))S.push({n:"kati",f:"surprised",l:"casual",t:"The water's freezing! Who put ice in the bucket! It was Rin, wasn't it!"});
   const dog=petOf(G,"dog"),roo=petOf(G,"rooster");
   if(dog)S.push({n:"nar",t:`${dog.name} chases the water jets, snapping at them, happier than ever and wetter than anyone in camp.`});
   if(roo)S.push({n:"nar",t:`${roo.name} takes cover on the gym roof, looking down with the eyes of a rooster who doesn't understand humans.`});
   S.push({n:"coach",t:"Whoever gets the heavy bags wet dries them tomorrow! …Hey! Who splashed me!"});
   S.push({choice:[{t:"Join "+T.name+" (Bond +)",fx:G2=>add(G2,T.id,"bond",5),then:[{n:T.id,f:"happy",l:"casual",t:"Yay! "+CALL(G,T.id)+" Stay behind me, okay? I'll cover you… Wait, why am I the only one getting soaked!"}]},
     {t:"Call half-time and hand out khao chae (everyone morale +3)",fx:G2=>R_ALL(G2,x=>{x.morale=Math.min(100,x.morale+3);}),then:[{n:"nar",t:"Ice-cold khao chae with fried shrimp-paste balls stops the war for exactly fifteen minutes before round two begins."}]}]});
   S.push({n:"nar",bg:"night",t:"That evening everyone sits in front of the camp drying off. Wet floral shirts hang in a row on the line. Nobody says a word about training."});
   S.push({n:T.id,f:"happy",l:"casual",t:"Let's play Songkran again next year… and the year after, and the year after that."});
   S.push({fx:G2=>{R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+6);f.fatigue=Math.max(0,f.fatigue-8);});G2.flags.fc_sk=(G2.flags.fc_sk||0)+1;}},{n:"nar",t:"(Everyone: morale +6 · fatigue −8)"});
   return S;}}]});

// v1.50: a new year opens — ties last year's result, the debt and the rivals into the fresh start
function lastYear(G){const t=(G.titles||[]).slice(-1)[0];return t||null;}
EVENTS.push({id:"year_open",annual:true,pri:1,look:"casual",bg:"camp",when:G=>(G.season||1)>=2&&G.week<=2,steps:[
 {inject:G=>{const y=G.season,L=lastYear(G),res=(L&&L.res)||[],champ=res.filter(r=>r.c==="gold"),fin=res.filter(r=>r.c==="green"),k=inCamp(G,"kati")?"kati":(roster(G)[0]||{}).id;
  const out=[{n:"nar",t:`The start of year ${y} at Sirichai Camp. The sign out front has been repainted again, and last year's photo still hangs by the entrance.`},
   {n:"coach",t:champ.length?`Last year we won the provincial title. This year every camp is gunning for us, old faces and new. Don't take a single fight lightly.`
     :fin.length?"Last year we made the final and missed by a hair. This year we go all the way.":"Last year we didn't reach our dream. The provincial championship is open again. We start over from the subdistrict round."},
   {n:"coach",t:"One more thing. Word is the other camps trained hard all off-season. Every rival is better this year."}];
  if(k)out.push({n:k,f:"happy",l:"casual",t:`${CALL(G,k)}, ${y===2?"it's been a whole year":`it's been ${y-1} years`} since you came here… I still remember the first day, when I thought you were from the bank, here to collect the debt.`});
  if(G.F.ploy&&G.F.ploy.met&&!inCamp(G,"ploy"))out.push({n:"ploy",f:"angry",l:"fight",t:champ.length?"This year the provincial belt comes back to Golden Tiger. Remember that.":"A new year. Let's see if Sirichai Camp has improved at all."});
  out.push({choice:[{t:"This year I just want nobody to get hurt (everyone: morale +5)",fx:G2=>R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+5);})},
   {t:"This year the goal is the title (everyone: morale +8 · fatigue +5)",fx:G2=>R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+8);f.fatigue=Math.min(100,f.fatigue+5);})}]});
  return out;}}]});

// ===== v1.51: camp pets — each joins through a small story, then has a moment with one of the girls =====
const hasPet=(G,k)=>(G.pets||[]).some(p=>p.k===k);
const petName=(G,k)=>{const p=(G.pets||[]).find(x=>x.k===k);return p?p.name:PETS[k].name;};
function adoptPet(G,k,name,fav){G.pets=G.pets||[];if(hasPet(G,k))return;G.pets.push({k,name:name||PET_NAMES[k][0],joy:60,wk:-1,fav,since:G.week+((G.season||1)-1)*52});}
const nameChoice=(k,fav,then)=>({choice:PET_NAMES[k].map(n=>({t:`Name it "${n}"`,fx:G=>adoptPet(G,k,n,fav),then})).concat([{t:"Pick a name…",fx:G=>{adoptPet(G,k,null,fav);UI.petName=(G.pets.length-1);},then}])});
const petAge=(G,k)=>{const p=(G.pets||[]).find(x=>x.k===k);return p?G.week+((G.season||1)-1)*52-p.since:0;};
const favOr=(G,id)=>inCamp(G,id)?id:"kati";
/* v1.62: adoptions jump the queue on late saves, one new pet every few weeks */
const petGate=G=>!["pet_cat","pet_dog","pet_rooster","pet_turtle"].some(id=>G.seen[id]&&G.seenAbs&&G.seenAbs[id]!=null&&gameWeek(G)-G.seenAbs[id]>=0&&gameWeek(G)-G.seenAbs[id]<3);/* one new pet every 3 weeks at most */
EVENTS.push(
 {id:"pet_cat",look:"casual",bg:"night",pri:2,when:G=>G.week>=3&&petGate(G),steps:[
  {n:"nar",t:"Pouring rain at night. The gate swings open and Kati runs in, soaked, holding a fat orange cat that's even wetter than she is."},
  {n:"kati",f:"flustered",l:"casual",t:"It's the orange cat from behind the temple! The pavilion roof fell in right where it sleeps… Grandpa used to sneak it rice every evening."},
  {n:"coach",t:"We can barely feed the people here, and now a cat… (but Coach is already towel-drying it)"},
  {n:"kati",f:"happy",l:"casual",t:G=>`${CALL(G,"kati")}, let it stay with us! Give it a name!`},
  nameChoice("cat","kati",[{n:"nar",t:"The orange cat shakes water all over everyone, then goes to sleep on the heavy bag like it's owned the camp all along."}])]},
 {id:"pet_dog",look:"casual",bg:"camp",pri:2,when:G=>G.week>=9&&petGate(G),steps:[
  {n:"nar",t:"For three days a Thai Ridgeback has been sleeping outside the camp gate. It doesn't bark or beg, just runs along when the fighters go jogging in the morning."},
  {inject:G=>inCamp(G,"mali")?[{n:"mali",f:"flustered",l:"train",t:"I-I'm scared of dogs… I got bitten in the rice field as a kid. But this one… it slows down and waits for me every morning."},{n:"kati",f:"happy",l:"train",t:"See? It picked Mali."}]
    :[{n:"kati",f:"happy",l:"train",t:"It follows me all the way to the bridge every morning. Like a free running coach."}]},
  {n:"coach",t:"A Thai Ridgeback is a fighter's breed. Suits a boxing camp."},
  {inject:G=>[nameChoice("dog",favOr(G,"mali"),[{n:"nar",t:"The new dog walks three circles and lies down at the same spot by the gate. This time with a red collar."}])]}]},
 {id:"pet_rooster",look:"casual",bg:"camp",pri:2,when:G=>G.week>=18&&petGate(G),steps:[
  {n:"nar",t:"The uncle who runs the cockfighting pit behind the market sets a wooden cage at the gate. Inside is a long-tailed rooster, iridescent green, with a scar over one eye."},
  {n:"npc",who:"Rooster Uncle",t:"He lost his last fight. Keeping him, nobody'd care for him. …A fighter belongs with fighters. Please look after him."},
  {n:"kati",f:"surprised",l:"casual",t:"It's staring at me like it wants to spar!"},
  nameChoice("rooster","kati",[{n:"nar",t:"Next morning, 4 a.m. sharp, the camp rooster crows so loud everyone jolts awake. …This camp doesn't need alarm clocks anymore."}])]},
 {id:"pet_turtle",look:"casual",bg:"camp",pri:2,when:G=>G.week>=30&&petGate(G),steps:[
  {inject:G=>{const w=favOr(G,"rin");return [
   {n:"nar",t:"Holy-day morning market. Someone sells turtles for merit release. One has a long crack down its shell, and nobody picks it."},
   w==="rin"?{n:"rin",f:"flustered",l:"casual",t:"I bought it to release for merit, but with a cracked shell like that, its survival rate is under thirty percent. …Can I keep it in a basin behind the camp until it heals?"}
     :{n:"kati",f:"sad",l:"casual",t:"I bought it to release, but its shell is cracked. It won't survive out there… let's keep it for now."},
   nameChoice("turtle",w,[{n:"nar",t:"The new turtle slowly pokes its head out to look at the camp, then pulls back in. Not sure yet that it's safe here."}])];}}]},
 // a moment with each pet
 {id:"petx_cat_rin",look:"casual",bg:"camp",when:G=>hasPet(G,"cat")&&inCamp(G,"rin")&&petAge(G,"cat")>=4,steps:[
  {n:"nar",t:G=>`1 a.m. You come down for water and find Rin crouched in front of the fridge, feeding mackerel to ${petName(G,"cat")} one piece at a time.`},
  {n:"rin",f:"flustered",l:"casual",t:G=>`…This isn't what it looks like. I'm just tracking ${petName(G,"cat")}'s weight every week. Up three hundred grams this month… part of which may be my fault.`},
  {choice:[{t:"(Sit down and feed it together)",fx:G=>{add(G,"rin","bond",5);},then:[{n:"rin",f:"happy",l:"casual",t:"…Then we split the blame fifty-fifty."}]},
   {t:"Tease her for being secretly sweet",fx:G=>{add(G,"rin","bond",3);add(G,"rin","morale",4);},then:[{n:"rin",f:"flustered",l:"casual",t:"D-don't tell anyone! Especially not Kati!"}]}]}]},
 {id:"petx_dog_mali",look:"casual",bg:"camp",when:G=>hasPet(G,"dog")&&inCamp(G,"mali")&&petAge(G,"dog")>=5,steps:[
  {n:"nar",t:G=>`One evening, some local kids try to snatch Mali's bag outside the camp. ${petName(G,"dog")} charges out and stands in the way. One bark, and the kids scatter.`},
  {n:"mali",f:"flustered",l:"casual",t:G=>`${petName(G,"dog")}… you protected me? I used to be so scared of you.`},
  {n:"nar",t:"Mali slowly reaches out. The ridgeback presses its head gently into her palm."},
  {fx:G=>{add(G,"mali","bond",3);add(G,"mali","morale",8);}},{n:"mali",f:"happy",l:"casual",t:"…From now on we run together every morning. I won't be slow anymore!"}]},
 {id:"petx_rooster_kati",look:"train",bg:"gym",when:G=>hasPet(G,"rooster")&&inCamp(G,"kati")&&petAge(G,"rooster")>=3,steps:[
  {n:"nar",t:G=>`4 a.m. ${petName(G,"rooster")} crows outside Kati's room for the tenth day in a row.`},
  {n:"kati",f:"angry",l:"train",t:G=>`${petName(G,"rooster")}!!! It's a rest day! …Fine, fine, I'm up. Training it is.`},
  {n:"nar",t:"Half an hour later Kati is kicking the bag alone under a single light. The rooster perches on the ring ropes, watching every move."},
  {choice:[{t:"(Go down and hold pads for her)",fx:G=>{add(G,"kati","bond",4);add(G,"kati","morale",5);},then:[{n:"kati",f:"happy",l:"train",t:"The rooster got you up too, Manager? Haha, then we're the four a.m. team now!"}]},
   {t:"(Let her train with her rooster buddy)",fx:G=>{add(G,"kati","morale",6);G.F.kati.fatigue=Math.max(0,G.F.kati.fatigue-3);},then:[{n:"nar",t:"The thud of the bag and the rooster's crowing trade off until dawn."}]}]}]},
 {id:"petx_turtle_fah",look:"casual",bg:"camp",when:G=>hasPet(G,"turtle")&&G.F.fah&&G.F.fah.met&&!inCamp(G,"fah")&&petAge(G,"turtle")>=3,steps:[
  {n:"nar",t:"Sunday evening, someone is crouching behind the camp, cap pulled low, poking morning glory at the turtle."},
  {n:"fah",f:"surprised",l:"casual",t:"I'm not here to see the turtle! I'm spying on the enemy camp! …But the way it eats morning glory is sooo cute."},
  {choice:[{t:"Come visit any time.",fx:G=>{add(G,"fah","bond",5);},then:[{n:"fah",f:"flustered",l:"casual",t:G=>`…I'll come visit ${petName(G,"turtle")}! Not visiting anyone else! Remember that!`}]},
   {t:"Caught you, spy.",fx:G=>{add(G,"fah","bond",3);},then:[{n:"fah",f:"angry",l:"casual",t:"I didn't get caught! I let you see me on purpose! …Bye-bye!"}]}]}]}
);

// ===== v1.53: year 2 — Fah, Golden Tiger's new Bangkok coach, and the prodigy who replaces her =====
const fahRival=G=>G.F.fah&&G.F.fah.camp==="rival";
EVENTS.push(
 {id:"fah_trainer",look:"casual",bg:"night",when:G=>(G.season||1)>=2&&G.week>=4&&fahRival(G)&&G.F.fah.met,steps:[
  {n:"nar",t:"9 p.m., by the river behind the camp. Someone is hurling stones into the water. Familiar messy silver hair."},
  {n:"fah",f:"angry",l:"casual",t:"Golden Tiger hired a new coach from Bangkok, Coach Kraingkrai! No smiling in the ring, no showboating, no dancing when I win, no being Fah!"},
  {n:"fah",f:"sad",l:"casual",t:"He says I fight like a kid playing around… If I don't change, he'll replace me with the new kid he's been grooming."},
  {choice:[{t:"Your style is your strength. Don't throw it away.",fx:G=>{add(G,"fah","bond",5);add(G,"fah","trust",3);},then:[{n:"fah",f:"flustered",l:"casual",t:"…You're the first person to say that. And you're from a different camp."}]},
   {t:"(Sit and listen quietly until she's let it all out)",fx:G=>{add(G,"fah","trust",6);add(G,"fah","bond",2);},then:[{n:"fah",f:"happy",l:"casual",t:"…Thanks for not lecturing me. I've been lectured all day."}]}]},
  {inject:G=>G.F.fah.bond<40?[{n:"nar",t:"(If you were closer with Fah, this might go further)"}]:[]}]},
 {id:"fah_join",look:"casual",bg:"camp",when:G=>(G.season||1)>=2&&G.week>=10&&G.seen.fah_trainer&&fahRival(G)&&(G.F.fah.bond||0)>=40&&absWeek(G)>=((G.flags||{}).fahRetry||0),steps:[
  {n:"nar",t:"Monday morning, the rain has just stopped. A big canvas bag sits outside the gate, its owner crouched beside it, pretending to look at the sky."},
  {n:"fah",f:"flustered",l:"casual",t:"I don't WANT to switch camps! It's just… if there's room here… I can train hard, wake up early, I'll even wash dishes!"},
  {inject:G=>inCamp(G,"mali")?[{n:"mali",f:"surprised",l:"casual",t:"Fah!? The one who kicked me out of the ring last year!?"},{n:"fah",f:"happy",l:"casual",t:"And then you got up and punched me back till my eye went purple! Call it even!"}]:[]},
  {choice:[
   {t:"Welcome aboard (contract buyout ฿60,000 · wage ฿1,800/week)",fx:G=>{if(G.cash>=60000){G.cash-=60000;joinCamp(G,"fah",1800);makeProdigy(G,"B","fah");add(G,"fah","trust",8);G.flags.fahJoinedAbs=absWeek(G);}else{G.flags.fahRetry=absWeek(G)+4;G.seen.fah_join=false;}},
    then:[{inject:G=>G.F.fah.camp==="player"?[{n:"fah",f:"happy",l:"casual",t:"Really!? …No take-backs! I get to be the old Fah here. Smile in the ring, dance when I win!"},{n:"nar",t:"(Fah has joined Sirichai Camp)"}]
      :[{n:"nar",t:"Fah's buyout is a steep ฿60,000. Golden Tiger won't let its star go cheap. The camp can't afford it yet. Fah says she'll wait and ask again."},{n:"fah",f:"pout",l:"casual",t:"…It's okay. I can wait. Just not too long!"}]}]},
   {t:"Give me time to get the camp ready first.",fx:G=>{G.flags.fahRetry=absWeek(G)+6;G.seen.fah_join=false;add(G,"fah","trust",2);},then:[{n:"fah",f:"pout",l:"casual",t:"Fine! I'm not in a hurry anyway! …I'll ask again in a month."}]}]}]},
 {id:"prodigy_intro",look:"fight",bg:"ring",when:G=>!!(G.prodigy&&G.prodigy.B)&&G.flags.fahJoinedAbs!=null&&absWeek(G)>G.flags.fahJoinedAbs,steps:[
  {n:"nar",t:"At the district stadium, Golden Tiger unveils a new fighter: a high silver ponytail just like Fah used to wear, black kit with gold trim, a face without expression. She kicks the bag so hard the chain rattles."},
  {n:"npc",who:"Coach Kraingkrai",t:"Baiyok, Golden Tiger disciple. Trains ten hours a day. Doesn't smile, doesn't show off, doesn't lose. …Those who left the camp will see what they gave up."},
  {n:"fah",f:"sad",l:"casual",t:"Baiyok… When I was there, she never got a day off. Nobody ever asked her to eat with them."},{n:"fah",f:"angry",l:"casual",t:"And the coach made her dye her hair silver like mine! Silver is MY thing! …It's not a uniform."},
  {inject:G=>inCamp(G,"mali")?[{n:"mali",f:"angry",l:"train",t:"My new rival, huh… Good. I won't lose to someone who fights without joy!"}]:[]},
  {n:"nar",t:"(Baiyok becomes the top rival in Division B, taking Fah's place)"}]},
 {id:"fah_settle",look:"casual",bg:"camp",when:G=>inCamp(G,"fah")&&G.flags.fahJoinedAbs!=null&&absWeek(G)>=G.flags.fahJoinedAbs+2,steps:[
  {n:"nar",t:"Fah's first week at Sirichai Camp. The camp is twice as loud."},
  {inject:G=>{const o=[];if(inCamp(G,"mali"))o.push({n:"mali",f:"angry",l:"train",t:"Fah! That's my towel!"},{n:"fah",f:"happy",l:"train",t:"First come, first served! Golden Tiger rules!"},{n:"kati",f:"pout",l:"train",t:"This is Sirichai Camp!"});
   if(hasPet(G,"turtle"))o.push({n:"fah",f:"happy",l:"casual",t:`${petName(G,"turtle")}! I live here now, so no more sneaking morning glory over!`});
   o.push({n:"fah",f:"flustered",l:"casual",t:"…Nobody here tells me to stop smiling. Feels weird."});return o;}},
  {choice:[{t:"Smile all you want. This is your home now.",fx:G=>{add(G,"fah","bond",5);add(G,"fah","morale",10);},then:[{n:"fah",f:"happy",l:"casual",t:"Then I'll smile till everyone's sick of it!"}]},
   {t:"Just don't steal Mali's towel.",fx:G=>{add(G,"fah","bond",3);if(G.F.mali)add(G,"mali","bond",2);},then:[{n:"fah",f:"pout",l:"casual",t:"Fine~ I'll steal Kati's instead!"}]}]}]}
);

// ===== v1.54: Ploy — hard to win over. Needs bond 60+, at least one official win over her, and year 3 (or year 2 with bond 70+) =====
const ployRival=G=>G.F.ploy&&G.F.ploy.camp==="rival";
const ployBeaten=G=>((G.h2h||{}).ploy||{}).w>0;
const ployOpen=G=>ployRival(G)&&G.F.ploy.met&&(G.F.ploy.bond||0)>=60&&ployBeaten(G)&&((G.season||1)>=3||((G.season||1)>=2&&(G.F.ploy.bond||0)>=70));
const pv=G=>(G.flags||{}).ployV||0;
EVENTS.push(
 {id:"ploy_respect",look:"fight",bg:"ring",when:G=>(G.season||1)>=2&&G.week>=8&&ployRival(G)&&G.F.ploy.met&&(G.F.ploy.bond||0)>=50&&!ployBeaten(G),steps:[
  {n:"nar",t:"After a fight at the district stadium, Ploy passes you at the exit and stops beside you for a moment."},
  {n:"ploy",f:"angry",l:"fight",t:"You've been talking to me a lot lately… But remember. I don't open up to a camp that's never beaten me in the ring."},
  {n:"nar",t:"(Ploy only respects those who can actually beat her · you need at least one official win over Ploy)"}]},
 {id:"ploy_injury",look:"casual",bg:"night",when:G=>ployOpen(G)&&G.week>=6&&G.week<=40,steps:[
  {n:"nar",t:"Word spreads through the market: Ploy tore a knee ligament in sparring after Coach Kraingkrai made her keep going while hurt. The doctor ordered a long rest."},
  {n:"nar",t:"Golden Tiger announces their new fighter, 'Petcha', will take her place the very next day."},
  {n:"nar",t:"District hospital. A long, quiet corridor. Ploy sits alone in a wheelchair outside the physiotherapy room."},
  {n:"ploy",f:"angry",l:"casual",t:"…Why are you here? To see your rival wrecked?"},
  {choice:[{t:"(Hand her the hot tea she likes, without a word)",fx:G=>{add(G,"ploy","bond",4);add(G,"ploy","trust",4);},then:[{n:"ploy",f:"flustered",l:"casual",t:"…You remember what tea I drink?"}]},
   {t:"I came because you're the rival I respect most.",fx:G=>{add(G,"ploy","trust",6);},then:[{n:"ploy",f:"sad",l:"casual",t:"Respect… Nobody at my camp uses that word for the injured."}]}]},
  {fx:G=>{const f=G.F.ploy;f.injury=Math.max(f.injury||0,12);G.bookings=G.bookings.filter(b=>b.a!=="ploy"&&b.b!=="ploy");makeProdigy(G,"A","ploy");G.flags.ployV=1;G.flags.ployW=absWeek(G);}},
  {n:"nar",t:"(Ploy is out injured · Petcha, Golden Tiger disciple, becomes Division A's top rival in her place)"}]},
 {id:"ploy_visit2",look:"casual",bg:"river",when:G=>pv(G)===1&&ployRival(G)&&absWeek(G)>=G.flags.ployW+3,steps:[
  {n:"nar",t:"Evening by the Ping River. Ploy, in a knee brace, slowly tries kicking the air, a little at a time, then sinks down to sit."},
  {n:"ploy",f:"sad",l:"casual",t:"I've fought since I was nine. Everyone said I was born for this. …If the knee doesn't come back, I have nothing left."},
  {choice:[{t:"You're more than a knee. You have the best fight IQ in the province.",fx:G=>{add(G,"ploy","trust",6);add(G,"ploy","bond",3);},then:[{n:"ploy",f:"flustered",l:"casual",t:"…You really have no shame complimenting people, huh."}]},
   {t:"(Sit beside her and watch the river until dark)",fx:G=>{add(G,"ploy","bond",5);},then:[{n:"ploy",f:"sad",l:"casual",t:"…Thanks for not saying 'it'll heal soon.' Everyone says that."}]}]},
  {fx:G=>{G.flags.ployV=2;G.flags.ployW=absWeek(G);}}]},
 {id:"ploy_visit3",look:"casual",bg:"gym",when:G=>pv(G)===2&&ployRival(G)&&absWeek(G)>=G.flags.ployW+3,steps:[
  {n:"nar",t:"Saturday morning, someone leans on crutches outside the Sirichai fence, watching Kati kick the bag for a long time."},
  {n:"kati",f:"surprised",l:"train",t:"Ploy!? …Come inside, it's hot out there."},
  {n:"ploy",f:"sad",l:"casual",t:"Golden Tiger didn't renew my contract. Injured fighters are worthless to Coach Kraingkrai. …I just stopped by to see how the little camp that beat me trains."},
  {n:"kati",f:"happy",l:"train",t:"Then come watch up close! And critique me, please. I still remember every knee you landed on me."},
  {fx:G=>{add(G,"ploy","bond",4);if(G.F.kati)add(G,"kati","bond",2);G.flags.ployV=3;G.flags.ployW=absWeek(G);}},
  {n:"nar",t:"Ploy watches until evening and points out more than ten things. Kati writes every one down."}]},
 {id:"ploy_join",look:"casual",bg:"camp",when:G=>pv(G)===3&&ployRival(G)&&absWeek(G)>=Math.max(G.flags.ployW+2,(G.flags||{}).ployRetry||0),steps:[
  {n:"nar",t:"Ploy comes to the manager's office. She can walk without crutches now, though she still limps a little."},
  {n:"ploy",f:"flustered",l:"casual",t:"Can I recover here? …Not because I'm weak. Because this is the only place where nobody sees me as just a stat line."},
  {n:"ploy",f:"angry",l:"casual",t:"And if I can fight again, I'll fight under the Sirichai name. …Don't make me regret choosing this."},
  {choice:[
   {t:"Welcome aboard (no buyout · wage ฿2,200/week)",fx:G=>{joinCamp(G,"ploy",2200);add(G,"ploy","trust",10);G.flags.ployJoinedAbs=absWeek(G);},then:[{n:"ploy",f:"happy",l:"casual",t:"…Thanks, Manager."},{n:"nar",t:"(Ploy has joined Sirichai Camp · still rehabbing her knee)"}]},
   {t:"Let me talk with everyone in the camp first.",fx:G=>{G.flags.ployRetry=absWeek(G)+4;G.seen.ploy_join=false;},then:[{n:"ploy",f:"sad",l:"casual",t:"…I understand. I used to be everyone's enemy here. It's not strange."}]}]}]},
 {id:"ploy_back",look:"fight",bg:"gym",when:G=>inCamp(G,"ploy")&&G.flags.ployJoinedAbs!=null&&!(G.F.ploy.injury>0),steps:[
  {n:"nar",t:"One morning, the boom of a knee slamming the heavy bag shakes the camp. Everyone runs out to look."},
  {n:"ploy",f:"happy",l:"fight",t:"…It's back. My knee is back!"},
  {inject:G=>inCamp(G,"kati")?[{n:"kati",f:"happy",l:"train",t:"Ploy! Then spar with me today! Don't hold back!"},{n:"ploy",f:"angry",l:"fight",t:"Hold back? That's not in my dictionary. Get in the ring, sparring partner."}]:[]},
  {fx:G=>{add(G,"ploy","morale",20);add(G,"ploy","bond",4);if(G.F.kati&&inCamp(G,"kati"))add(G,"kati","morale",8);}},
  {n:"nar",t:"(Last year's rival is now the camp's sparring partner)"}]}
);

// Year 2: give Fah and Ploy room between the recruitment beats and the finals.
const year2Pair=(G,a,b)=>arcYear(G,"y2")===1&&metR(G,a)&&metR(G,b)&&(G.F[a].bond||0)>=15&&(G.F[b].bond||0)>=15;
EVENTS.push(
 {id:"y2_fah_rooftop",pri:2,look:"casual",bg:"night",when:G=>arcYear(G,"y2")===1&&G.week>=6&&G.week<=16&&fahRival(G)&&metR(G,"fah"),steps:[
  {n:"nar",t:"After the fight, Fah sits on the old gym roof, swinging her legs to music from the fair. She shuts off her phone when she spots you."},
  {n:"fah",f:"pout",t:"The new coach says he'll replace Fah with Baiyok if she keeps having fun in the ring. I trained his way all night... But it wasn't me."},
  {choice:[{t:"Enter the ring as yourself.",fx:G=>add(G,"fah","bond",4),then:[{n:"fah",f:"happy",t:"If I get another chance in the ring, I'll smile for the whole crowd. Watch me!"}]},{t:"If you want to train differently, our gym's door is open.",fx:G=>add(G,"fah","trust",5),then:[{n:"fah",f:"flustered",t:"That sounds like an invitation to join your gym... Fah hasn't said yes!"}]}]}]},
 {id:"y2_ploy_stands",pri:2,look:"casual",bg:"ring",when:G=>arcYear(G,"y2")===1&&G.week>=14&&G.week<=30&&ployRival(G)&&metR(G,"ploy"),steps:[
  {n:"nar",t:"After the event, Ploy stays in the stands, noting the younger fighters' rhythms even as half the arena lights go out."},
  {n:"ploy",f:"sad",t:"Golden Tiger only asks whether I won or lost. No one asks what I saw in the ring... Will you listen?"},
  {choice:[{t:"Listen to all of Ploy's analysis",fx:G=>{add(G,"ploy","bond",4);add(G,"ploy","trust",2);},then:[{n:"ploy",f:"happy",t:"Good. Next time I'll bring another notebook. Don't rush home before I finish."}]},{t:"Invite Ploy to watch tapes at our gym",fx:G=>add(G,"ploy","trust",5),then:[{n:"ploy",f:"flustered",t:"You invite a rival into your gym that easily? ...Fine, but only to watch tapes."}]}]}]},
 {id:"y2_fah_team",pri:3,look:"casual",bg:"gym",when:G=>arcYear(G,"y2")===1&&inCamp(G,"fah")&&G.flags.fahJoinedAbs!=null&&absWeek(G)>=G.flags.fahJoinedAbs+5,steps:[
  {n:"nar",t:"Fah secretly practices a post-fight dance in the mirror. A poster of Baiyok from her old gym hangs nearby."},
  {n:"fah",f:"pout",t:"Everyone says Baiyok can replace Fah, like Fah was just an empty spot... But I really belong to this team now, right?"},
  {choice:[{t:"No one here can replace you.",fx:G=>{add(G,"fah","bond",5);add(G,"fah","morale",5);},then:[{n:"fah",f:"happy",t:"Then Fah will train hard and make people remember her name, not the old gym's!"}]},{t:"Get everyone to practice Fah's victory dance",fx:G=>{add(G,"fah","trust",4);if(inCamp(G,"mali"))add(G,"mali","bond",2);},then:[{n:"nar",t:"Laughter reaches the front gate. Kru Daeng watches, then joins the victory dance for one beat."}]}]}]},
 {id:"y2_fah_letter",pri:2,look:"casual",bg:"camp",when:G=>arcYear(G,"y2")===1&&inCamp(G,"fah")&&G.flags.fahJoinedAbs!=null&&absWeek(G)>=G.flags.fahJoinedAbs+11,steps:[
  {n:"nar",t:"Fah's grandmother sends a letter to the gym with a photo of Fah and Baiyok sparring as young trainees."},
  {n:"fah",f:"sad",t:"Baiyok used to be Fah's training partner, not a villain. If we meet in the ring, I'll fight hard, then invite him to dinner after the bell."},
  {n:"nar",t:"Fah keeps the photo in her glove bag. She has not left her past at the old gym."}]},
 {id:"y2_ploy_rehab",pri:3,look:"casual",bg:"gym",when:G=>arcYear(G,"y2")===1&&inCamp(G,"ploy")&&G.flags.ployJoinedAbs!=null&&absWeek(G)>=G.flags.ployJoinedAbs+2,steps:[
  {n:"nar",t:"Ploy reaches the gym before anyone else and practices putting weight on her injured leg. Kati brings a chair, but Ploy waves it away."},
  {n:"ploy",f:"sad",t:"At my old gym, they let Petchara train in my place as soon as I slowed down. Do I still have time here?"},
  {choice:[{t:"Take your time. We'll wait.",fx:G=>{add(G,"ploy","bond",5);add(G,"ploy","trust",3);},then:[{n:"ploy",f:"flustered",t:"...It feels better than I expected to hear that you'll wait."}]},{t:"Ask Ploy to plan training during recovery",fx:G=>{add(G,"ploy","trust",5);add(G,"kati","morale",4);},then:[{n:"kati",f:"happy",t:"Ploy, will you help me with my knee timing?"},{n:"ploy",f:"happy",t:"Fine, but write down every word I say."}]}]}]},
 {id:"y2_ploy_team",pri:2,look:"casual",bg:"night",when:G=>arcYear(G,"y2")===1&&inCamp(G,"ploy")&&G.flags.ployJoinedAbs!=null&&absWeek(G)>=G.flags.ployJoinedAbs+8&&!(G.F.ploy.injury>0),steps:[
  {n:"nar",t:"After training, Ploy opens a new page in her fight notebook. Sirichai is written above her name and Kati's."},
  {n:"ploy",f:"happy",t:"For the first time, I'm planning for a team instead of myself. If I meet Petchara, I want her to see what a team feels like."},
  {n:"kati",f:"happy",t:"I'll be in your corner with everyone else, whether you win or lose."}]},
 {id:"y2_cross_kati_mali",pri:2,look:"casual",bg:"market",when:G=>year2Pair(G,"kati","mali")&&G.week>=11&&G.week<=18,steps:[
  {n:"nar",t:"Kati asks you to shop for new gloves. Mali arrives with two fair tickets. Both wait for your answer."},
  {choice:[{t:"Shop for gloves with Kati",fx:G=>{add(G,"kati","bond",5);add(G,"mali","bond",-4);},then:[{n:"mali",f:"sad",t:"It's okay~ Mali can go alone."}]},{t:"Go to the fair with Mali",fx:G=>{add(G,"mali","bond",5);add(G,"kati","bond",-4);},then:[{n:"kati",f:"sad",t:"Okay... I'll pick out the gloves myself."}]}]}]},
 {id:"y2_cross_rin_fah",pri:2,look:"casual",bg:"fair",when:G=>year2Pair(G,"rin","fah")&&G.week>=19&&G.week<=26,steps:[
  {n:"nar",t:"Rin arranged to study an opponent's tape with you tonight. Fah invites you to a live fairground fight at the same time."},
  {choice:[{t:"Watch the tape with Rin",fx:G=>{add(G,"rin","bond",5);add(G,"fah","bond",-4);},then:[{n:"fah",f:"pout",t:"Oh, so a tape matters more than a real person!"}]},{t:"Watch the live fight with Fah",fx:G=>{add(G,"fah","bond",5);add(G,"rin","bond",-4);},then:[{n:"rin",f:"sad",t:"I understand... I can watch the tape alone."}]}]}]},
 {id:"y2_cross_kati_ploy",pri:2,look:"casual",bg:"cafe",when:G=>year2Pair(G,"kati","ploy")&&G.week>=27&&G.week<=34,steps:[
  {n:"nar",t:"Ploy asks you to discuss the fight plan over tea. Kati calls to say she is waiting for you to work her corner."},
  {choice:[{t:"Go see Ploy",fx:G=>{add(G,"ploy","bond",5);add(G,"kati","bond",-4);},then:[{n:"kati",f:"sad",t:"I can train on my own..."}]},{t:"Go train with Kati",fx:G=>{add(G,"kati","bond",5);add(G,"ploy","bond",-4);},then:[{n:"ploy",f:"pout",t:"I understand. I'll discuss the fight myself later."}]}]}]},
 {id:"y2_cross_fah_ploy",pri:2,look:"casual",bg:"night",when:G=>year2Pair(G,"fah","ploy")&&G.week>=35&&G.week<=42,steps:[
  {n:"nar",t:"The night before the trip, Fah asks you to hold the pads a little longer. Ploy brings her fight notebook and asks for a private talk."},
  {choice:[{t:"Stay and train with Fah",fx:G=>{add(G,"fah","bond",5);add(G,"ploy","bond",-4);},then:[{n:"ploy",f:"sad",t:"...Then I'll make the fight plan myself."}]},{t:"Talk with Ploy",fx:G=>{add(G,"ploy","bond",5);add(G,"fah","bond",-4);},then:[{n:"fah",f:"pout",t:"I can hold the pads myself! ...But Fah thought you would stay."}]}]}]}
);

// The replacement bouts have their own exchange, including a first-fight aftermath.
const prodigyMatch=(G,b)=>G.season>=2&&((b.a==="fah"&&b.b==="prod_B")||(b.a==="ploy"&&b.b==="prod_A"))&&inCamp(G,b.a)&&G.F[b.b];
function prodigyFightScene(G,b){if(!prodigyMatch(G,b))return null;const fah=b.a==="fah",key=`prod_face_${b.a}`;const first=!G.seen[key];G.seen[key]=true;
 return fah?[
  {n:"nar",t:first?"Fah enters from Sirichai's corner. Baiyok wears Fah's old colors in Golden Tiger's corner while Coach Kriangkrai watches.":"Fah and Baiyok meet again. This time, each knows the other's moves."},
  {n:"npc",who:"Baiyok",t:first?"Coach says I have to fight like you to earn my place in the ring.":"Today I'll fight in my own style, not the coach's."},
  {n:"fah",f:"angry",l:"fight",t:first?"You don't need to be the new Fah. Be Baiyok and give it everything!":"Good! Let's see who trained harder!"}]:[
  {n:"nar",t:first?"Ploy enters the ring on her healed knee. Petchara stands in the corner that used to be hers.":"Ploy and Petchara face each other in the middle of the ring again."},
  {n:"npc",who:"Petcha",t:first?"They told me to replace you, but never asked who I wanted to be.":"I remember everything you said after our last fight. I'm ready this time."},
  {n:"ploy",f:"angry",l:"fight",t:first?"You don't have to replace anyone. Show me your own style.":"Then show me again that you're fighting for yourself."}];}
function prodigyResultScene(G,b,win){if(!prodigyMatch(G,b))return null;const key=`prod_result_${b.a}`;if(G.seen[key])return null;G.seen[key]=true;const fah=b.a==="fah";
 return fah?[
  {n:"nar",t:"After the bell, Fah and Baiyok stand panting in opposite corners, then meet to touch gloves."},
  {n:"fah",f:win==="A"?"happy":"sad",l:"fight",t:win==="A"?"See? Fah won without giving up her smile! Get me next time, Baiyok.":"You were better today. Fah will train and see you again!"},
  {n:"npc",who:"Baiyok",t:"From now on, I'll fight under my own name... Thanks for saying that."},
  {n:"fah",f:"happy",l:"fight",t:"Stop looking so stern and come eat with us. Sirichai Gym is treating!"}]:[
  {n:"nar",t:"Ploy touches her healed knee, then looks at Petchara waiting in the center of the ring."},
  {n:"ploy",f:win==="A"?"happy":"sad",l:"fight",t:win==="A"?"I'm back, but you fought well. You don't have to be my shadow.":"I lost today, but my knee is no excuse. You won on your own skill."},
  {n:"npc",who:"Petcha",t:"I thought there would be no place for me when you came back... Now I know there is room for both of us."},
  {n:"ploy",f:"happy",l:"fight",t:"Remember, we're still rivals in the next match. We can talk after we leave the ring."}];}

// Year 4: Pailin, Ploy's older sister, brings Vector Gym to the province.
// Year 5 closes the main story. From year 6 Pailin returns every year (free mode) and her lines follow the year and the record.
const vecRec=(G,s)=>((G.vecRec||{})[s==null?(G.season||1):s])||{w:0,l:0};
const vecAll=G=>Object.values(G.vecRec||{}).reduce((a,r)=>({w:a.w+(r.w||0),l:a.l+(r.l||0)}),{w:0,l:0});
const vecPick=(G,arr)=>arr[((G.season||1)-6)%arr.length];
EVENTS.push(
 {id:"y4_pailin_arrive",pri:3,look:"fight",bg:"hall",when:G=>arcYear(G,"vector")===1&&G.week>=3&&!!G.F.pailin,steps:[
  {n:"nar",t:"A black-and-purple van from Bangkok pulls up at the provincial stadium. A woman in a black coat steps out first, followed by a crew unloading fight-analysis cameras."},
  {n:"pailin",f:"happy",t:"I'm Pailin, head of Vector Gym. We use sports science at every step. …But numbers have never stepped into a ring for anyone. In the end, someone still has to be brave enough to fight."},
  {inject:G=>G.F.ploy&&G.F.ploy.met?[{n:"ploy",f:"surprised",t:"Sis Pailin… you said you'd never come back to Chiang Mai."},{n:"pailin",f:"angry",t:"I came back to see how much my little sister has grown, Ploy."}]:[{n:"kati",f:"angry",t:"Sirichai accepts the challenge. But our fighters are not lab rats!"},{n:"pailin",f:"happy",t:"Bold words. Then let's prove it in the ring."}]},
  {n:"nar",t:"Within a week Pailin's name is in the Division A rankings, and Vector Gym's first challenge arrives at Sirichai."}]},
 {id:"y4_pailin_sister",pri:2,look:"casual",bg:"river",when:G=>arcYear(G,"vector")===1&&G.week>=17&&G.seen.y4_pailin_arrive&&!!G.F.ploy?.met,steps:[
  {n:"nar",t:"Ploy opens an old photo on her phone: a teenage Pailin wrapping her little sister's hands, before she moved to Bangkok."},
  {n:"ploy",f:"sad",t:"You used to stand by my corner every fight. But once you had a big gym, you started talking about people like numbers. …I still don't know if you really changed, or you're just scared of losing."},
  {choice:[{t:"Let Ploy talk to her sister herself",fx:G=>add(G,"ploy","trust",4),then:[{n:"ploy",f:"happy",t:"Yes. I need to ask my sister myself, not let anyone decide for me."}]},{t:"Tell Ploy she doesn't have to be her sister's shadow in the ring",fx:G=>add(G,"ploy","bond",4),then:[{n:"ploy",f:"angry",t:"I'll fight my way, and make you see it with your own eyes."}]}]}]},
 {id:"y4_pailin_warning",pri:2,look:"casual",bg:"camp",when:G=>arcYear(G,"vector")===1&&G.week>=34&&G.seen.y4_pailin_arrive,steps:[
  {n:"nar",t:"News from Bangkok: Vector Gym is coming back next year, with fighters Pailin hand-picked from provincial camps."},
  {n:"pailin",f:"angry",t:"This year I only came to size you up. Next year Knight and Vega come too. Then we'll see if Sirichai can keep up."},
  {n:"kati",f:"angry",t:"We're not running. See you in the ring next year."}]}
);

// Year 5: Vector comes back with a full team. The technology is useful; the conflict is the
// gym treating provincial fighters as test subjects. The arc resolves before the year ends.
EVENTS.push(
 {id:"y5_vector_arrive",pri:3,look:"casual",bg:"camp",when:G=>arcYear(G,"vector")===2&&G.week>=3&&!!G.F.vector_A,steps:[
  {inject:G=>G.seen.y4_pailin_arrive?[{n:"nar",t:"At the start of the year, Pailin returns as promised. This time she walks through Sirichai's gate herself, a woman with a thick folder following behind her."},{n:"pailin",f:"happy",t:"Told you I'd be back. This year Vector brought the whole team."}]:[{n:"nar",t:"A black-and-purple van from Bangkok pulls up at Sirichai. A woman in a black coat leads her team inside."},{n:"pailin",f:"happy",t:"I'm Pailin, Ploy's older sister and head of Vector Gym. This year I'm here to see what Sirichai can really do."}]},
  {n:"npc",who:"Mesa · Vector Scout",t:"Hello, I'm Mesa. We scout promising fighters from the provinces for our sports-science program. We cover all travel and medical tests."},
  {n:"kati",f:"pout",t:"But why does the application say 'Trial Participant' in bigger letters than 'Fighter'?"},
  {n:"pailin",f:"angry",t:"Precise data keeps fighters safer. But for it to be precise, someone has to agree to be measured on everything."},
  {choice:[{t:"Ask to see the contract and fighters' rights first",fx:G=>{add(G,"kati","trust",4);G.flags.vectorContract=1;},then:[{n:"npc",who:"Mesa",t:"…Okay. Honestly, there are pages I want people to read too."}]},{t:"Tell them our gym decides for itself, not as test subjects",fx:G=>{add(G,"kati","bond",4);G.rep+=.5;},then:[{n:"kati",f:"happy",t:"I'll step into the ring under Sirichai's name!"}]}]}]},
 {id:"y5_vector_fighters",pri:2,look:"fight",bg:"hall",when:G=>arcYear(G,"vector")===2&&G.week>=9&&!!G.F.vector_B,steps:[
  {n:"nar",t:"Vector's press conference unveils Knight in Division A and Vega in Division B, both in black-and-purple robes, a heart-rate graph racing on the screen behind them."},
  {n:"npc",who:"Night · Division A",t:"I come from a tiny camp in Ubon. With the analysis machines, I finally saw mistakes my old coach never had time to point out."},
  {n:"npc",who:"Vega · Division B",t:"I like data. But when the machine says rest and the gym still makes you train… nobody looks at that number."},
  {n:"nar",t:"Both names go up on this year's fight schedule, and more challenges from Vector arrive at Sirichai."}]},
 {id:"y5_vector_contract",pri:3,look:"casual",bg:"night",when:G=>arcYear(G,"vector")===2&&G.week>=18&&G.seen.y5_vector_arrive,steps:[
  {n:"nar",t:"Mesa comes back with a new contract. She has circled one line in red: the gym may keep a fighter's body data even after the fighter leaves."},
  {n:"npc",who:"Mesa",t:"I used to think taking kids from the provinces to Bangkok was helping them. But some got cut the moment a test came back bad. …I won't recruit anyone again without telling them that."},
  {n:"pailin",f:"angry",t:"I made that rule myself. If it hurts fighters, I'm the one who has to fix it. …But don't think I'll stop fighting to win."},
  {inject:G=>inCamp(G,"rin")?[{n:"rin",f:"angry",t:"Data really does help plan fights. But the data should belong to the fighter, not the camp."}]:[{n:"kati",f:"angry",t:"A fighter's body belongs to the fighter. Not to any camp."}]},
  {choice:[{t:"Ask Mesa to revise the contract and let fighters decide",fx:G=>{G.flags.vectorEthics=1;add(G,"rin","trust",5);},then:[{n:"npc",who:"Mesa",t:"Thank you. I'll take that message to my boss."}]},{t:"Warn the province's fighters about the contract",fx:G=>{G.flags.vectorEthics=2;G.rep+=1;},then:[{n:"kati",f:"angry",t:"We're not stopping anyone from going anywhere. We just want everyone to know what they're signing first."}]}]}]},
 {id:"y5_vector_challenge",pri:2,look:"casual",bg:"hall",when:G=>arcYear(G,"vector")===2&&G.week>=36&&G.seen.y5_vector_fighters,steps:[
  {n:"nar",t:"At year's end, Vector returns to the provincial stadium with a thick stack of reports. Pailin announces their stats can predict almost every fight."},
  {n:"pailin",f:"happy",t:"Almost every fight. The part it can't predict is exactly why I still fight myself."},
  {n:"kati",f:"happy",t:"So there are still things in the ring the numbers don't know, huh?"},
  {inject:G=>G.h2h&&((G.h2h.vector_A||{}).w||(G.h2h.vector_B||{}).w)?[{n:"npc",who:"Night",t:"I've already lost to you once. The numbers never said you could change your plan mid-round like that."}]:[{n:"npc",who:"Vega",t:"If we meet again, I want to fight without fearing that a post-fight test will remove me from the team."}]}]},
 {id:"y5_vector_resolve",pri:3,look:"casual",bg:"hall",when:G=>arcYear(G,"vector")===2&&G.week>=41&&G.seen.y5_vector_contract,steps:[
  {n:"nar",t:"The night before the year-end bouts, Mesa puts up a new sign beside Vector's corner: 'Fighters have the right to stop testing, stop training, and take their own data home.'"},
  {n:"npc",who:"Vega",t:"Sis Pailin tore up the old contract in front of everyone. Now we pick our own fights and rest days."},
  {n:"pailin",f:"sad",t:"I used to think winning made everything right. But if the fighters have no choice, even the best data gets used the wrong way."},
  {inject:G=>inCamp(G,"ploy")?[{n:"ploy",f:"happy",t:"Sis… that's the sister I know."},{n:"pailin",f:"happy",t:"Don't get sappy on me, Ploy. I still haven't beaten you."}]:[{n:"kati",f:"happy",t:"Now that makes them worth fighting."}]},
  {n:"pailin",f:"angry",t:"But remember: Vector isn't going back to Bangkok for good. Next year, and the year after, I'll challenge Sirichai every year until I beat you."},
  {n:"coach",t:"Ha! Looks like we've got ourselves a yearly rival. Then we'll have to train harder every year too."}]}
);

// Year 6 onward (free mode): Pailin returns every year. Lines follow the year, last year's record and who is in camp.
EVENTS.push(
 {id:"vector_annual_return",annual:true,pri:2,look:"casual",bg:"camp",when:G=>arcYear(G,"vector")>=3&&G.week>=5&&!!G.F.pailin,steps:[
  {inject:G=>{const y=G.season,last=vecRec(G,y-1),all=vecAll(G);
    const open=vecPick(G,[`Year ${y}: The same black-and-purple van pulls up at the camp again. This time Knight and Vega step out before the staff, each holding a training plan they rewrote themselves.`,
      `Year ${y}: Before the first month is even out, a black-and-purple envelope lands at the camp gate as usual. Inside, a challenge in Pailin's handwriting.`,
      `Year ${y}: Pailin shows up at Sirichai at five in the morning, waiting on the running track as if she came to train, not to challenge.`,
      `Year ${y}: Vector opens a small branch in Chiang Mai. The sign out front reads "Fighter Recovery Center · Open to every camp".`]);
    const rec=last.w+last.l===0?"Last year you didn't take a single one of my challenges. No running away this year."
      :last.w>last.l?`Last year Sirichai beat Vector in ${last.w} fights. I wrote every one down. This year it's my turn to pay you back.`
      :last.w<last.l?`Last year Vector won ${last.l} fights. Don't tell me Sirichai has lost its fire.`
      :"We tied exactly last year. I hate numbers without an answer. This year we settle it.";
    const out=[{n:"nar",t:open},{n:"pailin",f:last.w>last.l?"angry":"happy",t:rec}];
    if(all.w+all.l>=6)out.push({n:"npc",who:"Mesa",t:`All-time record so far: Sirichai won ${all.w} lost ${all.l}. …The boss keeps that number pinned by her bed.`});
    out.push(inCamp(G,"ploy")?{n:"ploy",f:"happy",t:vecPick(G,["You came even earlier than last year.","Your hair's longer this year, sis. Bet your punches are just as heavy.","Sis, have dinner with our camp first this year. Challenge us after.","I've got a new notebook ready for your Muay Thai, sis."])}
      :{n:"kati",f:"happy",t:vecPick(G,["Challenge accepted! But everyone gets their rest days as planned, okay?","You're here again?! …Good. I've been waiting.","Our camp is a lot stronger this year. Don't get careless.","Sirichai Camp is always ready."])});
    return out;}}]},
 {id:"vector_annual_plan",annual:true,pri:2,look:"casual",bg:"hall",when:G=>arcYear(G,"vector")>=3&&G.week>=28&&!!G.F.vector_B,steps:[
  {inject:G=>[{n:"nar",t:vecPick(G,["Before the mid-year bouts, Vector sends over fight tapes of Knight and Vega, and asks to see our training plans in exchange.","Dr. Wira, Vector's researcher, sends Sirichai a new recovery study and asks to swap training data.","Vega drops by the camp alone, hands over Vector's training plan folder, and asks to see ours in return.","Knight calls straight up asking to swap fight tapes before the mid-year bouts. Pailin knows, and didn't stop her."])}]},
  {choice:[{t:"Swap training data, but ask our fighters first",fx:G=>roster(G).forEach(f=>add(G,f.id,"trust",2)),then:[{inject:G=>inCamp(G,"rin")?[{n:"rin",f:"happy",t:"Data everyone agreed to share actually works."}]:[{n:"kati",f:"happy",t:"Everyone chose for themselves. That feels right."}]}]},{t:"Keep our plans, see them in the ring",fx:G=>roster(G).forEach(f=>add(G,f.id,"morale",4)),then:[{n:"npc",who:"Night",t:"Good. I'd rather see the real thing in the ring anyway."}]}]}]},
 {id:"vector_annual_letter",annual:true,pri:1,look:"casual",bg:"night",when:G=>arcYear(G,"vector")>=3&&G.week>=46&&(G.seenY||{}).vector_annual_return===G.season,steps:[
  {inject:G=>{const r=vecRec(G),y=G.season;const body=r.w+r.l===0?"We never met in the ring this year. What a shame. Next year I'll send my challenge sooner."
     :r.w>r.l?`This year Sirichai beat Vector ${r.w} to ${r.l}. I admit it. But in year ${y+1} I'll be back with a new plan.`
     :r.w<r.l?`This year Vector won ${r.l} to ${r.w}. Don't run out of steam. In year ${y+1} I want to face a stronger Sirichai.`
     :`This year we tied ${r.w} to ${r.l}. In year ${y+1} someone has to win.`;
    return [{n:"nar",t:"At year's end, a black-and-purple envelope arrives at the camp. Sharp handwriting everyone recognizes."},{n:"pailin",f:"happy",t:body},
      ...(inCamp(G,"ploy")?[{n:"ploy",f:"happy",t:"Sis wrote an even longer letter than last year… I'll be waiting next year."}]:[])];}}]}
);
function vectorFightScene(G,b){const op=G.F[b.b];if((G.season||1)<4||!op||!op.lab)return null;G.seenY=G.seenY||{};
  const key="vector_face_"+op.id,first=G.seenY[key]!==G.season;G.seenY[key]=G.season;const y=G.season||1,late=y>=6;
  if(op.id==="pailin")return [{n:"nar",t:first?(late?`Year ${y}: Pailin steps into the ring in a new black-and-purple kit. The crowd roars at once. Everyone knows this is the yearly showdown.`:"Pailin steps into the ring in black and purple. She never glances at the analysis screens. Her eyes go straight to the Sirichai corner."):"Pailin comes back to challenge Sirichai again in the same year. Same fierce smile."},
    {n:"pailin",f:"angry",l:"fight",t:b.a==="ploy"?(first?(late?"Ploy, this year I'm not holding back like before. Get up here!":"Ploy, stop hiding behind the gym's name. Show me YOUR Muay Thai!"):"Last time wasn't enough. I want to see you fight again."):(first?(late?`Year ${y} already. Still not tired of losing to me? …Kidding. Come on!`:"The data says I win. But I want to see it with my own eyes."):"I logged every beat of our last fight. Get in here!")},
    {n:b.a,f:"angry",l:"fight",t:b.a==="ploy"?"I'll fight under my own name. Watch closely, sis.":"Sirichai is ready."}];
  return [{n:"nar",t:first?`A Vector fighter in black and purple enters the ring. A screen behind her charts the movements of ${G.F[b.a].name}`:`${op.name} meets Sirichai again. This time the analysis screen goes dark before the bell.`},
    {n:"npc",who:op.name,t:op.id==="vector_A"?(first?"I've watched every round of your tape, but I'll make my own decisions in the ring.":"This time I'll read you with my own eyes, not just a graph."):(first?"The monitor told me to rest yesterday. I did, and I'm ready today.":"Data helps, but the final answer is in the gloves.")},
    {n:b.a,f:"angry",l:"fight",t:"Then let's settle it in the ring."}];}
function vectorResultScene(G,b,win){const op=G.F[b.b];if((G.season||1)<4||!op||!op.lab)return null;G.seenY=G.seenY||{};
  G.vecRec=G.vecRec||{};const R=G.vecRec[G.season]=G.vecRec[G.season]||{w:0,l:0};if(win==="A")R.w++;else if(win==="B")R.l++;
  const key="vector_result_"+op.id;if(G.seenY[key]===G.season)return null;G.seenY[key]=G.season;
  if(op.id==="pailin")return [{n:"nar",t:"The final bell rings. Pailin pulls off one glove and crosses the ring to her opponent herself."},
    {n:"pailin",f:win==="A"?"surprised":"happy",l:"fight",t:b.a==="ploy"?(win==="A"?"Ploy... You really beat me with your own style.":"Losing today isn't the end for you. Come back and fight me again."):(win==="A"?"Good! I lost today, but next year I'll be tougher.":"Don't stop training. I want to face a stronger you.")},
    {inject:G=>b.a==="ploy"?[{n:"ploy",f:"happy",l:"fight",t:"See you next year, sis. This time let's talk after we step down from the ring."}]:[{n:b.a,f:"happy",l:"fight",t:"Challenge accepted. See you next year."}]}];
  return [{n:"nar",t:"After the fight, the Vector fighter pulls off her heart-rate strap herself and walks over to touch gloves with the Sirichai fighter."},
    {n:"npc",who:op.name,t:win==="A"?"You read me today. My next dataset starts with this fight.":"I won today, but I don't expect you to fight the same way next time."},
    {n:b.a,f:"happy",l:"fight",t:"See you again. Give it everything, same as always."}];}

// ===== v1.55: character cards (round 1) — earned in play, collected in an album, each one replays a side story =====
const CARD_R={N:{s:1,c:"#9aa3b5"},R:{s:2,c:"#4a9be0"},SR:{s:3,c:"#c46be0"},SSR:{s:4,c:"#f2c94c"}};
const CARDS={
 k_n1:{c:"kati",r:"N",t:"The Taped-Up Heavy Bag",hint:"Kati wins her first fight",bg:"gym",need:G=>(G.F.kati.rec||{}).w>=1,steps:[
  {n:"nar",t:"The oldest heavy bag in the camp, patched with tape in seventeen places."},{n:"kati",f:"happy",l:"train",t:"I remember every patch. This one I kicked open at twelve, this one the day Grandpa said I was ready for the ring."},
  {n:"kati",f:"flustered",l:"train",t:"Today I won my first fight for you, Manager… Now I need to find tape for patch number eighteen."}]},
 k_r1:{c:"kati",r:"R",t:"1 a.m. Khao Man Gai",hint:"Reach the Close stage with Kati",bg:"night",need:G=>(G.F.kati.bond||0)>=40,steps:[
  {n:"nar",t:"1 a.m. Only the khao man gai stall by the market is still open. Kati orders two extra-large plates back to back."},{n:"kati",f:"happy",l:"casual",t:"Grandpa always brought me here after fights, win or lose. He said eat first, think later."},
  {n:"kati",f:"flustered",l:"casual",t:"…This is the first time I've brought anyone here. Don't tell, okay? It's Grandpa's and my secret spot."}]},
 m_n1:{c:"mali",r:"N",t:"The First Garland",hint:"Mali has been in camp for two weeks",bg:"camp",need:G=>inCamp(G,"mali")&&(G.flags.maliInAbs!=null?gameWeek(G)-G.flags.maliInAbs>=2:true)&&G.week>=6,steps:[
  {n:"nar",t:"Holy-day morning. A jasmine garland lies on the manager's desk, strung far too neatly for a beginner."},{n:"mali",f:"flustered",l:"casual",t:"I made it myself! Mom taught me when I was six. At home we string them to sell outside the temple every morning."},
  {n:"mali",f:"happy",l:"casual",t:"This one's not for sale, it's free! …The next ones are for Coach Daeng and Kati, and Grandpa Chai's shrine too."}]},
 m_r1:{c:"mali",r:"R",t:"Video Call from Home",hint:"Reach the Close stage with Mali",bg:"camp",need:G=>(G.F.mali.bond||0)>=40,steps:[
  {n:"nar",t:"Three kids squeeze onto the phone screen and shout together: 'Did Mali win!?'"},{n:"mali",f:"happy",l:"casual",t:"I won! I sent the prize money to Mom, so don't spend it all on snacks!"},
  {n:"mali",f:"flustered",l:"casual",t:"(hands you the phone) …The kids want to say hi to the manager. They're asking if you're really nice. I said the nicest."}]},
 r_n1:{c:"rin",r:"N",t:"The Black Notebook",hint:"Rin joins the camp",bg:"gym",need:G=>inCamp(G,"rin"),steps:[
  {n:"nar",t:"Rin's black notebook lies open on a chair by the ring, every line packed with numbers."},{n:"rin",f:"flustered",l:"casual",t:"Don't read it! …Fine, one page. This page is Kati's kick stats for the last thirty days."},
  {n:"rin",f:"happy",l:"casual",t:"I've kept notes since my old camp, but nobody ever asked to see them. …Thank you for being interested."}]},
 r_r1:{c:"rin",r:"R",t:"The Third Coffee",hint:"Reach the Close stage with Rin",bg:"cafe",need:G=>(G.F.rin.bond||0)>=40,steps:[
  {n:"nar",t:"A little café near the temple. Rin orders her third americano of the day."},{n:"rin",f:"happy",l:"casual",t:"The first cup to wake up, the second to analyze, the third…"},
  {n:"rin",f:"flustered",l:"casual",t:"…The third cup has no statistical justification. I just want to sit a little longer, with the person across from me."}]},
 p_n1:{c:"ploy",r:"N",t:"Ploy's Left Knee",hint:"Fight Ploy for the first time",bg:"ring",need:G=>{const h=(G.h2h||{}).ploy;return !!h&&(h.w+h.l+h.d)>=1;},steps:[
  {n:"nar",t:"After your first fight against her, Ploy sits in a corner of the locker room wrapping her left knee."},{n:"ploy",f:"angry",l:"fight",t:"What are you looking at? …I've trained this left knee for ten years. Everyone it hits remembers it."},
  {n:"ploy",f:"flustered",l:"fight",t:"Sirichai Camp, right? …Next year send someone tougher. I don't like easy wins."}]},
 p_r1:{c:"ploy",r:"R",t:"Hot Tea After the Fight",hint:"Reach the Close stage with Ploy",bg:"river",need:G=>(G.F.ploy.bond||0)>=40,steps:[
  {n:"nar",t:"By the river behind the stadium, Ploy pours tea from a thermos into two cups and hands you one without looking."},{n:"ploy",f:"happy",l:"casual",t:"Oolong. Mom brewed it every morning before I went to train. …Since she's been gone, I brew it myself."},
  {n:"ploy",f:"flustered",l:"casual",t:"…I didn't make extra for you. I just made too much. Drink it."}]},
 f_n1:{c:"fah",r:"N",t:"Ten Stickers",hint:"Fah starts texting you",bg:"night",need:G=>G.F.fah.met&&(G.F.fah.bond||0)>=15,steps:[
  {n:"nar",t:"2 a.m. Your phone buzzes ten times in a row. All angry-cat stickers."},{n:"fah",f:"angry",l:"casual",t:"Why aren't you answering! I sent TEN!"},
  {n:"fah",f:"flustered",l:"casual",t:"…I just wanted to know if you were asleep. That's all. Good night! Don't dream about me!"}]},
 f_r1:{c:"fah",r:"R",t:"Vampire by the River",hint:"Reach the Close stage with Fah",bg:"river",need:G=>(G.F.fah.bond||0)>=40,steps:[
  {n:"nar",t:"Halloween night. Fah, wearing plastic vampire fangs, dangles her feet in the water at the pier."},{n:"fah",f:"happy",l:"casual",t:"When I was a kid nobody threw me a birthday, so I dressed up as a ghost and celebrated myself!"},
  {n:"fah",f:"flustered",l:"casual",t:"…This year someone's sitting with me. Guess I don't need to dress as a ghost anymore."}]}};

/* v1.88 funny-condition cards — helpers read the fight log (G.cal holds our camp's bouts) */
const funCal=(G,id)=>(G.cal||[]).filter(c=>!id||c.a===id).slice().sort((x,y)=>(x.absWeek||0)-(y.absWeek||0));
const funKO1=(G,id)=>funCal(G,id).filter(c=>c.res==="W"&&/KO/.test(c.type||"")&&(c.cards||[]).length===1).length;
const funCount=(G,id,r)=>funCal(G,id).filter(c=>c.res===r).length;
function funStreak(G,id,r){let best=0,cur=0;for(const c of funCal(G,id)){if(c.res===r){cur++;best=Math.max(best,cur);}else cur=0;}return best;}
const funByOne=(G,id)=>funCal(G,id).filter(c=>c.res==="W"&&!/KO/.test(c.type||"")&&(c.cards||[]).length&&Math.abs(c.cards.reduce((s,x)=>s+x[0]-x[1],0))===1).length;
Object.assign(CARDS,{
 x_kati_r1:{c:"kati",r:"R",t:"One Round, Noodles Not Done",hint:"Kati wins by knockout in round 1 twice",bg:"local",need:G=>funKO1(G,"kati")>=2,steps:[{"n":"nar","t":"The first-round bell has barely stopped ringing and the opponent is already down for the count. The noodle lady by the ring has only blanched half her noodles."},{"n":"npc","who":"The noodle lady by the ring","t":"Last fight round one, this fight round one! Make it last a bit, dear, I can't even sell anything."},{"n":"kati","f":"flustered","l":"fight","t":"Sorry, auntie! …Let me blanch the noodles then. Call it a cool-down."},{"n":"nar","t":"That night the crowd eats noodles made by the winner. The broth is a little salty, but nobody dares say so."}]},
 x_kati_sr1:{c:"kati",r:"SR",t:"A Letter From the Girl Who Lost Five Times",hint:"Beat the same opponent 5 times",bg:"night",need:G=>Object.values(G.h2h||{}).some(h=>h.w>=5),steps:[{"n":"nar","t":"A letter in messy handwriting arrives, addressed to 'Sirichai Camp, the reason I quit boxing'."},{"n":"nar","t":"'After losing to you five times, I opened a boat-noodle shop instead. It sells better than boxing ever did. Come eat sometime, half price… just no fighting in the shop.'"},{"n":"kati","f":"flustered","l":"casual","t":"I feel a little guilty… but boat noodles? I'm definitely going."},{"n":"coach","t":"I hear her shop gets bigger crowds than our fights."}]},
 x_mali_r1:{c:"mali",r:"R",t:"Victory Som Tam, Spicy for Everyone",hint:"Mali wins 5 fights in a row",bg:"food",need:G=>funStreak(G,"mali","W")>=5,steps:[{"n":"mali","f":"happy","l":"casual","t":"Five in a row! I'm making som tam for everyone. Five chillies, one per win!"},{"n":"nar","t":"Mali's 'five chillies' turn out to be five fistfuls. Coach Daeng takes one bite and goes silent for three minutes."},{"n":"coach","t":"…Water. Anyone. Water."},{"n":"mali","f":"flustered","l":"casual","t":"Champions eat spicy! …You can have the mild one, though. I secretly made you a plate."}]},
 x_mali_n1:{c:"mali",r:"N",t:"Cheer-Up Party",hint:"The camp loses 4 fights in a row",bg:"night",need:G=>inCamp(G,"mali")&&funStreak(G,null,"L")>=4,steps:[{"n":"nar","t":"Four losses in a row. The camp is so quiet you can hear the geckos, until Mali drags a mookata pan into the yard."},{"n":"mali","f":"happy","l":"casual","t":"New rule! Whoever lost eats the first piece, whoever won grills for the losers. …Nobody's won, so I'll grill!"},{"n":"nar","t":"Late into the night there's laughter in the yard. Nobody mentions the losses again."}]},
 x_rin_r1:{c:"rin",r:"R",t:"One Point, As Planned",hint:"Rin wins on points by exactly 1",bg:"local",need:G=>funByOne(G,"rin")>=1,steps:[{"n":"nar","t":"The judges announce it: Rin wins by a single point. The whole camp finally breathes out."},{"n":"rin","f":"happy","l":"fight","t":"As planned. I calculated a one-point margin to conserve energy."},{"n":"coach","t":"Then why were your hands shaking in round five?"},{"n":"rin","f":"flustered","l":"fight","t":"…That was acting, to make her overconfident. I won't be taking further questions."}]},
 x_rin_sr1:{c:"rin",r:"SR",t:"The Fifteenth Tape",hint:"Scout 15 different opponents while Rin is in camp",bg:"night",need:G=>inCamp(G,"rin")&&Object.keys(G.scoutAbs||{}).length>=15,steps:[{"n":"nar","t":"It's 2 a.m. and the tape-room light is still on. Rin sits surrounded by fifteen tapes and fifteen notebooks."},{"n":"rin","f":"happy","l":"casual","t":"Tape fifteen. I've found the pattern: every fighter in this province blinks before a left kick."},{"n":"rin","f":"flustered","l":"casual","t":"…Except you. You blink when you look at me. I don't know what it means yet, but I'll find out."}]},
 x_ploy_r1:{c:"ploy",r:"R",t:"The Cat Finally Lets Her",hint:"Have 4 pets, including a cat, while Ploy is in camp",bg:"camp",need:G=>inCamp(G,"ploy")&&(G.pets||[]).length>=4&&(G.pets||[]).some(p=>p.k==="cat"),steps:[{"n":"nar","t":"The camp has four pets now. This morning the orange cat walks past everyone and hops straight into Ploy's lap."},{"n":"ploy","f":"flustered","l":"casual","t":"…Don't move. Whoever moves gets punched."},{"n":"nar","t":"Ploy sits perfectly still for two hours and misses the whole morning session. Coach Daeng doesn't dare call her."},{"n":"ploy","f":"happy","l":"casual","t":"She's warm… You took a photo, right? Send it to me. Don't post it anywhere."}]},
 x_ploy_r2:{c:"ploy",r:"R",t:"I Wasn't Nervous",hint:"Ploy wins a title fight for Sirichai",bg:"final",need:G=>(G.cal||[]).some(c=>c.a==="ploy"&&c.tier==="final"&&c.res==="W"),steps:[{"n":"nar","t":"The belt goes around Ploy's waist. The crowd stands to applaud; Ploy stands still, expressionless."},{"n":"ploy","f":"happy","l":"fight","t":"I'm not excited. I've won like this plenty of times."},{"n":"nar","t":"On the way down, though, she walks into a corner post, and quietly apologises to it."},{"n":"ploy","f":"flustered","l":"fight","t":"…You didn't see anything. Understood?"}]},
 x_fah_n1:{c:"fah",r:"N",t:"Nobody Won, Fah's Furious",hint:"Fah fights to a draw for Sirichai",bg:"local",need:G=>funCount(G,"fah","D")>=1,steps:[{"n":"nar","t":"The referee raises both hands. A draw. Fah stomps in the middle of the ring."},{"n":"fah","f":"angry","l":"fight","t":"What's a draw!? I don't get it! Then who gets the medal! Who gets the grilled chicken!"},{"n":"coach","t":"Half a chicken each."},{"n":"fah","f":"happy","l":"fight","t":"…Half is fine. But I want the drumstick!"}]},
 x_fah_r1:{c:"fah",r:"R",t:"Fah Isn't Crying",hint:"Fah loses 3 fights in a row",bg:"night",need:G=>funStreak(G,"fah","L")>=3,steps:[{"n":"nar","t":"Three losses in a row. Fah vanishes all evening, until you find her behind the heavy bag, face buried in her knees."},{"n":"fah","f":"sad","l":"casual","t":"I'm not crying! It's dust! This camp is dusty!"},{"n":"nar","t":"You sit down beside her without a word. Slowly, Fah leans her head on your shoulder."},{"n":"fah","f":"flustered","l":"casual","t":"…Can we train extra tomorrow? Double. And don't tell anyone I sat here."}]}});
// v1.90 (hidden): regional champions — an R card the first time the camp beats each of them in the visit duel
const RG_DUEL_W=(G,c)=>!!(G.region&&(G.region.duelWon||{})[c]);
Object.assign(CARDS,{
 rg_baibua_r:{c:"baibua",r:"R",rg:1,t:"The Last Plate",hint:"Win the duel against Baibua when she visits the camp",bg:"kitchen",need:G=>RG_DUEL_W(G,"baibua"),steps:[
  {n:"nar",t:"It's late and everyone has gone to bed, but water is still running in the kitchen. Baibua is washing the last pile of dishes alone."},
  {n:"baibua",f:"happy",l:"casual",t:"You don't have to help. I like washing up… at my camp it's only two of us at dinner, me and my dad."},
  {n:"baibua",f:"flustered",l:"casual",t:"So many plates means lots of people living together here… I don't want to go home."}]},
 rg_tabtim_r:{c:"tabtim",r:"R",rg:1,t:"Consolation Prize",hint:"Win the duel against Tabtim when she visits the camp",bg:"night",need:G=>RG_DUEL_W(G,"tabtim"),steps:[
  {n:"tabtim",f:"happy",l:"casual",t:"Losers get a consolation prize! Tonight you're taking Tabtim out for moo kratha!"},
  {n:"nar",t:"That night the whole camp sits around the moo kratha grill. Tabtim puts the most perfectly cooked piece on the Manager's plate before anyone else's."},
  {n:"tabtim",f:"flustered",l:"casual",t:"…Don't read into it! That piece was a little burnt, that's all, haha."}]},
 rg_alicia_r:{c:"alicia",r:"R",rg:1,t:"Five Minutes Off Camera",hint:"Win the duel against Alicia when she visits the camp",bg:"night",need:G=>RG_DUEL_W(G,"alicia"),steps:[
  {n:"nar",t:"The sponsor's camera crew follows her to the camp gate. Alicia grabs the Manager's wrist, pulls them into the office and locks the door."},
  {n:"alicia",f:"flustered",l:"casual",t:"Shh! …Five minutes. Five minutes where nobody's filming."},
  {n:"alicia",f:"happy",l:"casual",t:"First time in my life I've lost a duel to a small camp. Strange… it doesn't sting at all. …Don't get the wrong idea."}]},
 rg_chaba_r:{c:"chaba",r:"R",rg:1,t:"The Mended Fence",hint:"Win the duel against Chaba when she visits the camp",bg:"gymdusk",need:G=>RG_DUEL_W(G,"chaba"),steps:[
  {n:"nar",t:"The sun sets behind the fence Chaba fixed from end to end. She sits on a pile of planks, saying nothing."},
  {n:"nar",t:"The Manager sits down beside her. Chaba slides a bottle of water over without looking."},
  {n:"chaba",f:"happy",l:"casual",t:"…Fast runners, this camp."},
  {n:"chaba",f:"flustered",l:"casual",t:"This fence will last another ten years. …Come and see if I'm right."}]}});
function cardCheck(G){G.cards=G.cards||{};const got=[];for(const id in CARDS){if(G.cards[id])continue;const C=CARDS[id];if(C.g)continue;try{if(C.need(G)){G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};got.push(id);G.dust=(G.dust||0)+5;}}catch(e){}}return got;}


// v1.60: cards round 3 — festival nights and the first pet
Object.assign(CARDS,{
 f_pet:{c:"kati",r:"N",t:"The First Furry Member",hint:"Welcome your first pet to the camp",bg:"camp",need:G=>(G.pets||[]).length>=1,steps:[
  {n:"nar",t:"One morning Kati wakes up to find the camp's newest member curled up on the hand wraps drying on the line."},
  {n:"kati",f:"pout",l:"casual",t:"Those are my hand wraps! …Fine, you can have them today. But give them back tomorrow."},
  {n:"coach",t:"Back in Grandpa Chai's day this yard was full of dogs and cats. He said a camp animals want to live in is a kind camp."},
  {n:"kati",f:"happy",l:"casual",t:"Then our camp is kind again, right? …Manager, I'll go buy it a food bowl."}]},
 f_ny:{c:"kati",r:"R",t:"One Firework on the Roof",hint:"Celebrate New Year's Eve together with the whole camp",bg:"night",need:G=>(G.flags.fc_ny||0)>=1,steps:[
  {n:"nar",t:"The tin roof is still warm from the afternoon sun. The lights of Chiang Mai twinkle far away."},
  {n:"kati",f:"happy",l:"casual",t:"When I was little, Grandpa carried me up here every year to watch the fireworks. He said this was the camp's VIP seat."},
  {n:"kati",f:"flustered",l:"casual",t:"The year Grandpa was gone, I came up here alone. …It was so quiet."},
  {n:"nar",t:"A firework bursts into gold just as she turns around."},
  {n:"kati",f:"happy",l:"casual",t:"This year it isn't quiet. Every VIP seat is taken."}]},
 f_kt:{c:"kati",r:"R",t:"The Eighth Petal",hint:"Float a krathong on the Ping River with the camp",bg:"river",need:G=>(G.flags.fc_kt||0)>=1||!!G.seen.loykrathong,steps:[
  {n:"nar",t:"Kati's banana-leaf krathong has seven neat layers of petals. The eighth always comes loose and floats off before the krathong does."},
  {n:"kati",f:"pout",l:"casual",t:"I've folded it this way for ten years. The eighth layer has never stayed on, not once."},
  {n:"kati",f:"sad",l:"casual",t:"Grandpa said the eighth layer belongs to someone who hasn't arrived yet. Let it float ahead and wait."},
  {n:"kati",f:"flustered",l:"casual",t:"…This year it floated right toward you, Manager. Ha ha, what a coincidence."}]},
 f_sk:{c:"kati",r:"R",t:"Water War at the Camp",hint:"Celebrate Songkran with everyone in camp",bg:"camp",need:G=>(G.flags.fc_sk||0)>=1||!!G.seen.songkran,steps:[
  {n:"nar",t:"Kati crouches behind the heavy bag, holding the biggest water bowl in camp with both hands."},
  {n:"kati",f:"happy",l:"casual",t:"Shh, Manager, Coach Daeng's coming. I'm going to splash him. This year I'll get him!"},
  {n:"coach",t:"Kati, I can see you. Where do you think you're hiding a bowl that big behind a bag?"},
  {n:"nar",t:"A second later, Kati and the manager are both drenched head to toe by Coach Daeng's garden hose."},
  {n:"kati",f:"surprised",l:"casual",t:"Not fair! You used the hose, Coach! …Manager, what are you laughing at? You're soaked too!"}]}});

// v1.63: cards round 3 — the big moments (SR/SSR), full hearts and birthdays
const wonTitle=(G,id)=>Object.values(G.champ||{}).includes(id)||(G.titles||[]).some(t=>Object.values(t.champ||{}).includes(id));
const bdGot=(G,id)=>!!(G.bday&&G.bday[id])||!!(G.seenY&&G.seenY["bday_"+id]);
Object.assign(CARDS,{
 e_champ:{c:"kati",r:"SSR",t:"The Belt Before Grandpa's Photo",hint:"Win the provincial championship",bg:"camp",need:G=>wonTitle(G,"kati")||wonTitle(G,"mali"),steps:[
  {n:"nar",t:"Late that night, everyone is asleep. A single candle burns in front of Grandpa Chai's photo shelf."},
  {n:"nar",t:"The championship belt rests there. Next to it is the pencil drawing of a belt Grandpa made the day the camp opened. They look eerily alike."},
  {n:"kati",f:"sad",l:"casual",t:"Grandpa… I brought it for you. A little late. I'm sorry."},
  {n:"kati",f:"flustered",l:"casual",t:"Why are you up, Manager? …It's okay, sit with me. Grandpa would want to see who brought it home."},
  {n:"coach",t:"(From the shadows, Coach Daeng has been leaning in the doorway for a long time) …Chai, you see that? Your granddaughter did it."},
  {n:"kati",f:"happy",l:"casual",t:"This isn't just Grandpa's camp anymore. It belongs to all of us… to you too, Manager."}]},
 e_beatploy:{c:"ploy",r:"SR",t:"The Day the Genius Lost",hint:"Beat Ploy in an official fight",bg:"ring",need:G=>(G.flags.beat_ploy||0)>=1,steps:[
  {n:"nar",t:"In the fighters' room behind the ring, Ploy slowly unwinds her wraps one loop at a time. No one from Golden Tiger dares come near."},
  {n:"ploy",f:"sad",l:"fight",t:"…Sirichai's manager. Came to see the loser?"},
  {n:"ploy",f:"happy",l:"fight",t:"Don't look at me like that. I'm not upset. Strange… I feel lighter."},
  {n:"ploy",f:"happy",l:"fight",t:"Since I was twelve, everyone told me I must never lose. Tonight I lost, and the world didn't end."},
  {n:"ploy",f:"flustered",l:"fight",t:"Tell that girl for me: next time I won't be a genius who can't lose. I'll be an opponent who really wants to beat her."}]},
 e_fahjoin:{c:"fah",r:"SR",t:"The Silver-Hair Moves In",hint:"Fah moves to Sirichai Camp",bg:"camp",need:G=>inCamp(G,"fah"),steps:[
  {n:"nar",t:"Fah's first day at Sirichai Camp. She brings three bags: two of clothes, one of hairspray and water guns."},
  {n:"fah",f:"happy",l:"casual",t:"Where's Fah's room! …This one? It's tiny! …But you can see the mountain from the window. Okay, Fah'll take it!"},
  {n:"fah",f:"flustered",l:"casual",t:"At Golden Tiger, Fah always ate alone, because the coach said star fighters shouldn't get close to anyone."},
  {n:"fah",f:"pout",l:"casual",t:"Here everyone eats together and fights over the omelet… Fah likes it. Don't tell anyone."},
  {n:"fah",f:"happy",l:"casual",t:"Silver hair belongs to Fah! Anyone who copies gets kicked! …Except you, Manager. You can dye yours."}]},
 e_ployjoin:{c:"ploy",r:"SR",t:"First Cup of Tea at Sirichai",hint:"Ploy moves to Sirichai Camp to recover",bg:"camp",need:G=>inCamp(G,"ploy"),steps:[
  {n:"nar",t:"Before dawn on her first day, Ploy is up before everyone, walking slowly on crutches to boil water in the camp's little kitchen."},
  {n:"ploy",f:"happy",l:"casual",t:"You're an early riser too… Dan Kwian tea, I brought it from home. Want some?"},
  {n:"ploy",f:"sad",l:"casual",t:"At Golden Tiger, five a.m. was for a ten-kilometer run, not for tea. I'd forgotten a morning could be this quiet."},
  {n:"ploy",f:"flustered",l:"casual",t:"Thank you for taking me in… not as a genius, but as someone who got hurt."},
  {n:"ploy",f:"happy",l:"casual",t:"When my knee heals, I'll spar with Kati myself. Consider it rent."}]},
 h_kati:{c:"kati",r:"SR",t:"Can I Call You By Name?",hint:"Bond with Kati reaches ♥ Lv.11",bg:"night",need:G=>(G.F.kati.bond||0)>=100,steps:[
  {n:"nar",t:"One night after evening training, Kati sits beside you on the bench out front, rolling her hand wraps back up."},
  {n:"kati",f:"flustered",l:"casual",t:"Manager… can I ask you for something?"},
  {n:"kati",f:"flustered",l:"casual",t:G=>`When it's just us two, can I call you "${G.player.name}"? …"Manager" feels a little far away.`},
  {n:"kati",f:"happy",l:"casual",t:G=>`${G.player.name} …${G.player.name} …Mm. My heart's beating weird when I say it. I'm going to bed now!`}]},
 h_mali:{c:"mali",r:"SR",t:"The Letter She Actually Sent",hint:"Bond with Mali reaches ♥ Lv.11",bg:"camp",need:G=>(G.F.mali.bond||0)>=100,steps:[
  {n:"nar",t:"Mali hands you an envelope. It isn't sealed yet. On the front it says 'To Mom'."},
  {n:"mali",f:"flustered",l:"casual",t:"Manager, could you read it before I send it? I'm scared I wrote something wrong… No. I just want you to read it."},
  {n:"nar",t:"'Mom, I'm doing well. At this camp there's someone who makes me feel I have a second home. One day I'll bring them to meet you.'"},
  {n:"mali",f:"happy",l:"casual",t:"Don't change the last paragraph! …I really meant to write it that way."}]},
 h_rin:{c:"rin",r:"SR",t:"The Value of X",hint:"Bond with Rin reaches ♥ Lv.11",bg:"night",need:G=>(G.F.rin.bond||0)>=100,steps:[
  {n:"nar",t:"Rin sets her thirteenth stat notebook in front of you. The last page holds one equation, underlined twice."},
  {n:"rin",f:"pout",l:"casual",t:"Remember the equation 'X = ?' I solved it."},
  {n:"rin",f:"flustered",l:"casual",t:G=>`X = ${G.player.name} …The only reason I stay at this camp despite better offers is this one variable.`},
  {n:"rin",f:"flustered",l:"casual",t:"I checked the answer seventeen times. No errors. …You don't have to answer now. This data never expires."}]},
 h_ploy:{c:"ploy",r:"SR",t:"Just Call Me Ploy",hint:"Bond with Ploy reaches ♥ Lv.11",bg:"river",need:G=>(G.F.ploy.bond||0)>=100,steps:[
  {n:"nar",t:"At dusk by the Ping River, Ploy skips a flat stone. It bounces exactly seven times."},
  {n:"ploy",f:"happy",l:"casual",t:"Everyone calls me Big Sis Ploy, Genius Ploy, Captain Ploy… Nobody ever calls me just Ploy."},
  {n:"ploy",f:"flustered",l:"casual",t:"Could you try calling me that? …Just 'Ploy'."},
  {n:"ploy",f:"happy",l:"casual",t:"…Mm. Like that. Better than every title I've ever had."}]},
 h_fah:{c:"fah",r:"SR",t:"The Real Sky After Rain",hint:"Bond with Fah reaches ♥ Lv.11",bg:"camp",need:G=>(G.F.fah.bond||0)>=100,steps:[
  {n:"nar",t:"The rain has just stopped. Fah runs over and drags you into the middle of the wet camp yard."},
  {n:"fah",f:"happy",l:"casual",t:"Look! A double rainbow! Mom said if you see a double rainbow with someone, you'll be together for a long time."},
  {n:"fah",f:"flustered",l:"casual",t:"…Fah didn't make that up! Mom really said it! …Half of it."},
  {n:"fah",f:"happy",l:"casual",t:"So no running away. Fah saw a rainbow with you. By Mom's rule, you have to stay with Fah for a long, long time."}]},
 b_kati:{c:"kati",r:"R",t:"One Candle on Khanom Khrok",hint:"Celebrate Kati's birthday",bg:"camp",need:G=>bdGot(G,"kati"),steps:[
  {n:"nar",t:"A small tray of khanom khrok sits on the table with one candle in the middle, because there was no time to get a cake."},
  {n:"kati",f:"happy",l:"casual",t:"Grandpa stuck a candle in khanom khrok like this every year. When I was little I thought everyone blew out khanom khrok on their birthday."},
  {n:"kati",f:"flustered",l:"casual",t:"I'm making a wish… I won't tell. But you're in it, Manager."}]},
 b_mali:{c:"mali",r:"R",t:"The Second Slice Goes Home",hint:"Celebrate Mali's birthday",bg:"camp",need:G=>bdGot(G,"mali"),steps:[
  {n:"nar",t:"Mali cuts her own birthday cake, then quickly wraps the biggest slice in a box."},
  {n:"mali",f:"happy",l:"casual",t:"I'm sending this piece to my little siblings back home. Two days by post. It should still be okay… probably."},
  {n:"mali",f:"flustered",l:"casual",t:"This piece is yours, Manager. The one with the most strawberries. I picked it myself~"}]},
 b_rin:{c:"rin",r:"R",t:"The Birthday She Never Wrote Down",hint:"Celebrate Rin's birthday",bg:"cafe",need:G=>bdGot(G,"rin"),steps:[
  {n:"nar",t:"Rin stares at the present in her hands for more than ten seconds, which is unusually long for someone who decides everything fast."},
  {n:"rin",f:"surprised",l:"casual",t:"I've never told anyone my birthday… How did you know? Where did the data leak?"},
  {n:"rin",f:"flustered",l:"casual",t:"…You don't have to tell me. I'll file today under 'good days' and underline it twice."}]},
 b_ploy:{c:"ploy",r:"R",t:"Ploy's New Year's Day",hint:"Celebrate Ploy's birthday",bg:"temple",need:G=>bdGot(G,"ploy"),steps:[
  {n:"nar",t:"Ploy's birthday is New Year's Day, so nobody has ever remembered it. Everyone is too busy celebrating the new year."},
  {n:"ploy",f:"surprised",l:"casual",t:"…You actually remembered? January first. Everyone forgets, even me some years."},
  {n:"ploy",f:"happy",l:"casual",t:"This year I'll count it as my real birthday, not just everyone else's holiday. Thank you."}]},
 b_fah:{c:"fah",r:"R",t:"Silver-Haired Halloween",hint:"Celebrate Fah's birthday",bg:"market",need:G=>bdGot(G,"fah"),steps:[
  {n:"nar",t:"Fah's birthday falls on Halloween. She dresses as a silver-haired witch and hands out candy across the whole market."},
  {n:"fah",f:"happy",l:"casual",t:"Today is Fah's day! The whole world dressed up to celebrate Fah! …It didn't? Whatever, Fah thinks it did."},
  {n:"fah",f:"flustered",l:"casual",t:"Your present goes in Fah's special box… Don't read into it. There's only one thing in that box."}]}});

// ===== v1.57: when the camp gets rich, funny little disasters eat some of the money =====
const DRAIN_MIN=70000;
const drainAmt=G=>Math.max(3000,Math.round(Math.min(20000,G.cash*.12)/100)*100);
const drainOk=(G,salt)=>G.cash>=DRAIN_MIN&&G.week>=4&&absWeek(G)>=(((G.flags||{}).drainWk)||0)+5&&srand(G,salt)<.35;
const drainPay=(G,mul)=>{const a=Math.round(drainAmt(G)*mul/100)*100;G.cash-=a;G.flags.drainWk=absWeek(G);return a;};
const DRAINS=[
 {id:"drain_cat",need:G=>hasPet(G,"cat"),steps:G=>[{n:"nar",t:`${petName(G,"cat")} chases a flying termite and pounces straight into the camp's new TV. The screen cracks like a spiderweb. The cat sits licking its paw like nothing happened.`},{n:"coach",t:"…Coach only paid the first installment on that TV."}],cul:G=>petName(G,"cat")},
 {id:"drain_rooster",need:G=>hasPet(G,"rooster"),steps:G=>[{n:"nar",t:`${petName(G,"rooster")} escapes the camp, raids the khao man gai shop by the market, and pecks the whole rack of boiled chickens down.`},{n:"npc",who:"Chicken-rice auntie",t:"A live chicken fighting the boiled chickens! Who's paying for this!?"}],cul:G=>petName(G,"rooster")},
 {id:"drain_roof",need:G=>inCamp(G,"kati"),steps:G=>[{n:"nar",t:"BOOM! Kati kicks the bag so hard the hook snaps. It flies through the tin roof and lands in the neighbor's yard."},{n:"kati",f:"flustered",l:"train",t:"I-I was just trying the kick Coach taught yesterday! I didn't think it'd work THIS well!"}],cul:G=>"Kati"},
 {id:"drain_banquet",need:G=>true,steps:G=>[{n:"nar",t:"Coach Daeng throws a reunion for Grandpa Chai's old students, orders ten tables of Chinese banquet, and signs the bill to the camp."},{n:"coach",t:"Hey… I thought it'd be three tables. Who invited the whole district!?"}],cul:G=>"Coach Daeng"},
 {id:"drain_durian",need:G=>inCamp(G,"mali"),steps:G=>[{n:"nar",t:"A pickup truck unloads three baskets of Monthong durian at the gate. The receipt says the buyer is: Mali."},{n:"mali",f:"happy",l:"casual",t:"It's durian season! I wanted everyone to have some! …I didn't know one basket was THIS big."}],cul:G=>"Mali"},
 {id:"drain_flamingo",need:G=>inCamp(G,"fah")||inCamp(G,"kati"),steps:G=>{const w=inCamp(G,"fah")?"fah":"kati";return [{n:"nar",t:"2 a.m. Someone watched a live-selling stream and ordered with the camp card. In the morning, forty pink inflatable flamingos are piled at the gate."},{n:w,f:"flustered",l:"casual",t:w==="fah"?"They were on sale for nine baht each! …Oh. Ninety-nine. I misread it.":"I thought they were nine baht each! …Ninety-nine? I misread it."}];},cul:G=>inCamp(G,"fah")?"Fah":"Kati"}];
DRAINS.forEach((D,k)=>{
  const optPay={t:"Pay up and laugh it off together (everyone: morale +4)",fx:G2=>{G2._drain=drainPay(G2,1);R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+4);});},
    then:[{inject:G2=>[{n:"nar",t:`Paid ${fmt(G2._drain)} · the camp laughs all night. It becomes camp legend.`}]}]};
  const optHalf=G=>({t:`Haggle, and have ${D.cul(G)} work it off (pay half)`,fx:G2=>{G2._drain=drainPay(G2,.5);},
    then:[{inject:G2=>[{n:"nar",t:`Paid ${fmt(G2._drain)} · ${D.cul(G2)} pitches in until it's paid off, grumbling all week.`}]}]});
  EVENTS.push({id:D.id,annual:true,look:"casual",bg:"camp",when:G=>D.need(G)&&drainOk(G,301+k*17),
    steps:[{inject:G=>D.steps(G).concat([{n:"nar",t:`Damages come to about ${fmt(drainAmt(G))}`},{choice:[optPay,optHalf(G)]}])}]});});

// ===== v1.58: cards round 2 — gacha cards, stardust (✦), pity, duplicates upgrade then turn to dust =====
Object.assign(CARDS,{
 g_kati_n:{g:1,c:"kati",r:"N",t:"Wraps in the Sun",bg:"camp",steps:[{n:"nar",t:"Behind the camp, red hand wraps hang in a row on the line. Kati pins each one carefully."},{n:"kati",f:"happy",l:"casual",t:"They have to dry completely, or they'll smell. Grandpa said a fighter who doesn't care for her wraps doesn't care for herself."}]},
 g_mali_n:{g:1,c:"mali",r:"N",t:"Candy in Her Pocket",bg:"gym",steps:[{n:"nar",t:"Mali digs into her shorts pocket and pulls out a fistful of candy for everyone around the ring."},{n:"mali",f:"happy",l:"train",t:"Tamarind candy from home! Wakes you right up, good for three more rounds… I made that up, but they're really tasty!"}]},
 g_rin_n:{g:1,c:"rin",r:"N",t:"The Three-Color Pen",bg:"gym",steps:[{n:"nar",t:"Rin logs stats with a three-color pen. Red for misses, blue for hits, green for…"},{n:"rin",f:"flustered",l:"casual",t:"Green is when you smile at the fighters. …I'm just testing whether it affects performance. It does."}]},
 g_ploy_n:{g:1,c:"ploy",r:"N",t:"The Cat That Won't Be Held",bg:"river",steps:[{n:"nar",t:"A stray cat walks by. Ploy crouches and slowly holds out a hand. The cat turns its nose up."},{n:"ploy",f:"pout",l:"casual",t:"…It doesn't like me. It's fine, I'm used to it. Nobody wants to get close to someone too hard."}]},
 g_fah_n:{g:1,c:"fah",r:"N",t:"Thirty Selfies",bg:"fair",steps:[{n:"nar",t:"At the temple fair, Fah hands over her phone for a photo, then strikes thirty poses in one minute."},{n:"fah",f:"happy",l:"casual",t:"Use the coolest one! …No, the cutest one! …No, use them all!"}]},
 g_kati_sr:{g:1,c:"kati",r:"SR",t:"Grandpa's Dream Belt",bg:"night",steps:[{n:"nar",t:"Kati opens an old wooden box under Grandpa's bed. Inside is a pencil drawing of a championship belt that never existed."},{n:"kati",f:"sad",l:"casual",t:"Grandpa drew it when he opened the camp. Said one day this camp would have that belt. …He never got to see it."},{n:"kati",f:"happy",l:"casual",t:"But you'll take me to win it and show Grandpa, right? He's watching for sure."}]},
 g_mali_sr:{g:1,c:"mali",r:"SR",t:"A Letter to Mom",bg:"camp",steps:[{n:"nar",t:"Mali has dozed off at the desk, a letter half-written beside her."},{n:"nar",t:"'Mom, there's a really kind manager here. Never scolds, buys us snacks, praises me every time I win. I'm not lonely anymore, Mom…'"},{n:"mali",f:"flustered",l:"casual",t:"(wakes up) Ah! Don't read that!! …How far did you get!?"}]},
 g_rin_sr:{g:1,c:"rin",r:"SR",t:"The Unsolvable Equation",bg:"cafe",steps:[{n:"nar",t:"Rin's desk is covered in equations. The last line reads: 'Variable X = ?'"},{n:"rin",f:"flustered",l:"casual",t:"X is the reason I stay at this camp despite better offers. …I've been solving it for three months."},{n:"rin",f:"happy",l:"casual",t:"But when you sit here, the answer becomes clear on its own. …Don't ask what it is."}]},
 g_ploy_sr:{g:1,c:"ploy",r:"SR",t:"The Only Photo in Her Wallet",bg:"river",steps:[{n:"nar",t:"Ploy's wallet falls open. Inside is a single old photo: a short-haired girl in gloves bigger than her head, standing beside a woman."},{n:"ploy",f:"sad",l:"casual",t:"That's my mom. My first fight, she cried the whole time… even though I won."},{n:"ploy",f:"flustered",l:"casual",t:"Back then I didn't get it. Now I do… When someone you care about steps into the ring, it's scarier than stepping in yourself."}]},
 g_fah_sr:{g:1,c:"fah",r:"SR",t:"Sky After Rain",bg:"river",steps:[{n:"nar",t:"The rain stops. Fah runs into the yard and points up. A rainbow arcs over the river."},{n:"fah",f:"happy",l:"casual",t:"See!? My name doesn't mean just any sky. Mom said it's the sky after rain, the prettiest one!"},{n:"fah",f:"flustered",l:"casual",t:"…I've never told anyone that. It's embarrassing."}]},
 /* v1.87: an SSR for every girl — gacha only, each with its own epilogue, special scene and minigame */
 g_mali_ssr:{g:1,c:"mali",r:"SSR",t:"Meeting Mali's Mom",bg:"farm",ci:"mali_casual",q:"My second home finally got to meet my first one.",steps:[{n:"nar",t:"The overnight bus stops at the mouth of the lane at 5 a.m. Mali hops off first, then turns and waves like she's afraid you'll change your mind and ride back."},{n:"mali",f:"happy",l:"casual",t:"We're here! My house is at the end of that field, by the big mango tree. Mom planted it the day I was born."},{n:"nar",t:"Green rice fields stretch as far as you can see. At the end stands a wooden stilt house, and a woman shading her eyes, watching you from far away."},{n:"npc",who:"Mali's mom",t:"You made it! Mali, my girl… Have you lost weight? Are they feeding you enough at that camp?"},{n:"mali",f:"flustered",l:"casual",t:"Mom! I've gained two kilos! The manager treats me to dinner every time I win…"},{n:"nar",t:"Mali pulls you down onto the bamboo bench, presses her palms together and bows to her mother. You bow too, without anyone telling you to."},{n:"npc",who:"Mali's mom",t:"Every letter she sends is about the manager, so much that I had to see you for myself… Please look after my girl. Her heart is bigger than she is."},{choice:[{t:"Promise to take the best care of Mali",then:[{n:"mali",f:"flustered",l:"casual",t:"Manager!! …Saying that in front of my mom? Where am I supposed to hide?"},{n:"npc",who:"Mali's mom",t:"Ha ha, she still blushes just like when she was little."}]},{t:"Say Mali is the one taking care of the whole camp",then:[{n:"mali",f:"happy",l:"casual",t:"That's not true, Mom! …Okay, a little. I cook for everyone every Saturday."},{n:"npc",who:"Mali's mom",t:"Good to know I raised her right."}]}]},{n:"nar",t:"That evening the whole village eats together under the stilt house. The kids crowd around, begging to touch Mali's blue gloves."},{n:"mali",f:"happy",l:"casual",t:"When I was little, everyone said I was too small to fight… Today the kids called me 'the boxer.'"},{n:"mali",f:"flustered",l:"casual",t:"Thank you for coming with me. My second home finally got to meet my first one."}]},
 g_rin_ssr:{g:1,c:"rin",r:"SSR",t:"The Page Without Numbers",bg:"local",ci:"rin_fight_happy",face:"rin_happy_face",q:"Today I won because I trusted someone who trusted me first.",steps:[{n:"nar",t:"Round three. The opponent switches to southpaw, and thirty pages of Rin's notes are suddenly useless."},{n:"nar",t:"Rin drops onto the corner stool, still gasping. Her hand goes up to push glasses she isn't wearing."},{n:"rin",f:"sad",l:"fight",t:"All my data is wrong. I don't have a backup plan… I don't know what to do next."},{choice:[{t:"Tell her to forget the notebook and fight on instinct",then:[{n:"rin",f:"flustered",l:"fight",t:"However my heart tells me… That's not a measurable variable… Fine. Just this once."}]},{t:"Say you believe in Rin more than any notebook",then:[{n:"rin",f:"flustered",l:"fight",t:"The probability that you're right… No. I won't calculate it. I'll just believe you."}]}]},{n:"nar",t:"Round four. Rin isn't counting steps or reading shoulders. She just sees the opening and kicks."},{n:"nar",t:"A left kick lands flush on the neck. The opponent crumples in the middle of the ring before the referee can reach ten."},{n:"coach",t:"That one isn't in any of your notebooks, Rin."},{n:"rin",f:"happy",l:"fight",t:"No, it isn't… I wasn't thinking anything. First time in my life."},{n:"nar",t:"That night Rin opens a new notebook. The first page has no tables, no numbers, just one line."},{n:"nar",t:"'Today I won because I trusted someone who trusted me first.'"},{n:"rin",f:"flustered",l:"casual",t:"Don't read it out loud! …Is the grammar wrong? Don't answer that."}]},
 g_ploy_ssr:{g:1,c:"ploy",r:"SSR",t:"Mom's Front Row",bg:"final",ci:"ploy_fight_happy",face:"ploy_happy_face",q:"This one I sent myself, because you made me brave enough.",steps:[{n:"nar",t:"Title night. In ringside seat number one sits a woman, back straight, no hat, nothing hiding her face."},{n:"npc",who:"Ploy's mom",t:"My daughter sent me a front-row ticket herself. Twenty years I've never sat here… My hands are still shaking."},{n:"nar",t:"Backstage, Ploy finished wrapping her hands long ago, but she still won't get up."},{n:"ploy",f:"flustered",l:"fight",t:"Mom really came…? If I get kicked till I bleed, will she cry again?"},{choice:[{t:"Tell her to show her mom she loves fighting",then:[{n:"ploy",f:"happy",l:"fight",t:"Fun… Right. I forgot fighting used to be fun, back when nobody watched but the referee."}]},{t:"Promise to work her corner and not move the whole fight",then:[{n:"ploy",f:"happy",l:"fight",t:"Right there in that corner. Don't move. I'll be looking over a lot."}]}]},{n:"nar",t:"Every time she ties up in the clinch, Ploy glances at the front row. Her mom isn't covering her eyes. She's cheering herself hoarse."},{n:"nar",t:"Her seventeenth knee of the night lands clean to the body. The opponent waves it off. Ploy stands still in the middle of the ring and does something no one has ever seen."},{n:"nar",t:"She smiles, so wide her eyes crinkle shut, and points at the front row."},{n:"npc",who:"Ploy's mom",t:"Ploy! My girl is smiling! Twenty years, and this is the first time I've seen you smile in the ring!"},{n:"ploy",f:"flustered",l:"fight",t:"…Don't look at me right now. I'm not crying. It's sweat in my eyes."},{n:"ploy",f:"happy",l:"casual",t:"You sent Mom that first ticket… This one I sent myself, because you made me brave enough."}]},
 g_fah_ssr:{g:1,c:"fah",r:"SSR",t:"The Night the Storm Came",bg:"night",ci:"fah_casual",q:"Fah's not scared of anything anymore!! …Except thunder. But now someone sits with me through it!!",steps:[{n:"nar",t:"The night before Fah's big fight, a storm hits Chiang Mai. The whole camp loses power, and the thunder rattles the tin roof."},{n:"nar",t:"A soft knock at the office door. Fah stands there wrapped head to toe in a tiger-print blanket, only her face showing."},{n:"fah",f:"flustered",l:"casual",t:"Fah's not scared! …My roof's leaking, that's all."},{n:"nar",t:"Lightning strikes somewhere close. Fah leaps in and clings to your arm."},{n:"fah",f:"flustered",l:"casual",t:"…Okay, I'm scared. Since I was little. My name means sky and I'm scared of thunder. Funny, right? Go ahead and laugh."},{choice:[{t:"Light a candle and keep her talking until the storm passes",then:[{n:"fah",f:"happy",l:"casual",t:"…You're way too nice. Keep this up and Fah's gonna get used to it."}]},{t:"Say you're scared of thunder too",then:[{n:"fah",f:"happy",l:"casual",t:"Liar! …But thanks for lying. Fah really does feel better."}]}]},{n:"nar",t:"By candlelight, Fah admits she trash-talks everyone because if she's loud enough, nobody can hear how much she's shaking inside."},{n:"fah",f:"sad",l:"casual",t:"Before every fight, Fah's as scared as she is of thunder… She's just never told anyone."},{n:"nar",t:"The storm stopped at 4 a.m. Somewhere along the way, Fah fell asleep on your shoulder."},{n:"nar",t:"That morning the sky was so clear you could see all of Doi Suthep. That night Fah won by knockout in round two, then grabbed the ring mic."},{n:"fah",f:"happy",l:"fight",t:"Fah's not scared of anything anymore!! …Except thunder. But now someone sits with me through it!!"}]},
 g_kati_ssr:{"g":1,"c":"kati","r":"SSR","t":"A New Mongkhon","bg":"temple","ci":"kati_thai","face":"kati_thai_face","q":"Grandpa, I've finished the wai khru… and my teacher is right here too.","steps":[{"n":"nar","t":"Before dawn on Grandpa Chai's memorial day, Kati carries a wooden box to the temple. Inside is Grandpa's old mongkhon, its thread faded almost white."},{"n":"kati","f":"flustered","l":"thai","t":"The abbot says this mongkhon is too worn to wear in the ring… but I want Grandpa with me when I do the wai khru."},{"n":"npc","who":"The abbot","t":"Old thread can be braided into new, just like that camp of yours. The old generation hands it on to the new. Manager, hold the end of the thread for me."},{"n":"nar","t":"You hold the thread still while the abbot braids new red thread around the old white strand. Kati sits with her palms together, silent, until it's done."},{"choice":[{"t":"Ask Kati to try the wai khru in the temple yard","then":[{"n":"kati","f":"flustered","l":"thai","t":"Right here…? Then you have to sit where Grandpa used to sit."}]},{"t":"Say she should save it for the real ring","then":[{"n":"kati","f":"happy","l":"casual","t":"Okay! Then on that day you have to be in the red corner, as close to me as you can."}]}]},{"n":"nar","t":"That evening, in Thai dress and the new mongkhon, Kati performs the wai khru slowly around the temple yard. The wind rustles the bodhi leaves like applause."},{"n":"kati","f":"flustered","l":"thai","t":"Grandpa, I've finished the wai khru… and my teacher is right here too."}]},
 g_team_ssr:{g:1,c:"kati",r:"SSR",t:"Sirichai Camp, Group Photo",bg:"camp",steps:[{n:"nar",t:"Holy-day morning. Everyone lines up in front of the freshly painted sign. Coach Daeng sets Grandpa Chai's old camera on a tripod."},{n:"coach",t:"Everyone smile! This camera has photographed the camp since the first generation. Last roll of film, don't waste it."},{n:"kati",f:"happy",l:"casual",t:"Manager, stand in the middle! Right there. Grandpa's old spot."},{n:"nar",t:"Click. The first group photo of the new Sirichai Camp goes into a frame, hung next to Grandpa Chai's portrait."}]}});
const GACHA_COST=30,GACHA_PITY=30,DUST_OF={N:5,R:10,SR:25,SSR:60};
function gachaPull(G){if((G.dust||0)<GACHA_COST)return null;G.dust-=GACHA_COST;G.pity=(G.pity||0)+1;G.cards=G.cards||{};
  const pool=Object.keys(CARDS).filter(k=>CARDS[k].g);const by=r=>pool.filter(k=>CARDS[k].r===r);const x=srand(G,(G.pity*131+(G.pulls||0)*7)|0);G.pulls=(G.pulls||0)+1;
  const pity=G.pity>=GACHA_PITY;let r=pity?"SSR":x<.03?"SSR":x<.30?"SR":"N";if(r==="SSR")G.pity=0;let L=by(r);if(pity){const nw=L.filter(k=>!G.cards[k]);if(nw.length)L=nw;} /* v1.87: the guaranteed SSR is one you do not own yet */const id=L[Math.floor(srand(G,G.pulls*97+11)*L.length)];
  const o=G.cards[id];let res;if(!o){G.cards[id]={n:1,lv:1,wk:absWeek(G),seen:false};res={id,isNew:true};}
  else{o.n=(o.n||1)+1;o.spare=(o.spare||0)+1;res={id,spare:o.spare,canUp:(o.lv||1)<3};} /* v1.85.1: every duplicate is kept — the player levels the card up or breaks it down on the card page */
  return res;}
/* v1.85.1: spend one spare copy to raise the card a level (max 3) — the character warms to you a little */
const CARD_MAX_LV=3,CARD_UP_BOND=3;
const cardCanUp=(id,o)=>!!o&&(o.lv||1)<CARD_MAX_LV&&(o.spare||0)>0;
function levelCard(G,id){const o=(G.cards||{})[id],C=CARDS[id];if(!C||!cardCanUp(id,o))return 0;o.spare--;o.lv=(o.lv||1)+1;if(G.F[C.c])add(G,C.c,"bond",CARD_UP_BOND);return o.lv;}
/* v1.85: break spare copies into stardust (the card itself is never lost) */
function dustCard(G,id,count){const o=(G.cards||{})[id],C=CARDS[id];if(!o||!C)return 0;const k=Math.min(count||1,o.spare||0);if(k<=0)return 0;
  const d=DUST_OF[C.r]*k;o.spare-=k;G.dust=(G.dust||0)+d;G.dustMade=(G.dustMade||0)+d;return d;}
/* a card whose story was rewritten in an update carries rev:n — owners who already read it see a "new" star until they read it again */
const cardFresh=(id,o)=>{if(!o)return false;const C=CARDS[id];if(!o.seen)return true;if(C&&(C.rev||0)>(o.rev||0))return true;
  /* v1.86: a level reached whose epilogue / special scene hasn't been read yet */const lv=o.lv||1,sn=o.lvSeen||1;return !!C&&((C.lv2&&lv>=2&&sn<2)||(C.lv3&&lv>=3&&sn<3));};

// v1.82.4 (CM3/CM4): small annual camp moments — clean-up day, dinner after a hard loss,
// open house, community fair. Choices state their cost or payoff; lines follow who is in camp and the year.
const campVoice=(G,id,lines)=>inCamp(G,id)?[{n:id,f:"happy",l:"casual",t:lines[id]||lines.any}]:[];
EVENTS.push(
 {id:"camp_clean_day",annual:true,pri:1,look:"casual",bg:"camp",when:G=>G.week>=7&&G.week<=9&&roster(G).length>=2,steps:[
  {n:"nar",t:G=>yr(G)>=3?`Weekend morning, year ${yr(G)} The little students came to help sweep too. There weren't enough brooms to go around`:"Weekend morning: everyone sweeps the yard, wipes down the heavy bags and washes the gloves"},
  {inject:G=>[...campVoice(G,"kati",{kati:"I'll wipe Grandpa Chai's photo myself. Nobody take it!"}),...campVoice(G,"mali",{mali:"Mali will put on music. Sweep to the beat and you'll go faster~"}),...campVoice(G,"rin",{rin:"I've already made a cleaning roster. Everyone gets an equal share"}),...campVoice(G,"fah",{fah:"Fastest sweeper gets free ice cream! Fah's treat!"}),...campVoice(G,"ploy",{ploy:"…Mopping is just footwork practice"})].slice(0,3)},
  {choice:[{t:"Pitch in with everyone",fx:G=>{roster(G).forEach(f=>{f.morale=Math.min(100,f.morale+3);add(G,f.id,"bond",1);});G.camp.beauty=(G.camp.beauty||0)+1;},then:[{n:"nar",t:"The camp yard is visibly cleaner. Everyone takes a break with coconut water"}]},
   {t:"Buy new cleaning supplies (฿800)",fx:G=>{G.cash-=800;G.camp.beauty=(G.camp.beauty||0)+1;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+1));},then:[{n:"nar",t:"The new mop gets the job done twice as fast"}]}]}]},
 {id:"camp_after_loss",annual:true,pri:1,look:"casual",bg:"night",when:G=>G.week>=6&&G.week<=46&&roster(G).length>=2&&(G.cal||[]).some(c=>(c.season||1)===yr(G)&&c.res==="L"&&c.absWeek!=null&&gameWeek(G)-c.absWeek<=2),steps:[
  {inject:G=>{const L=(G.cal||[]).filter(c=>(c.season||1)===yr(G)&&c.res==="L").slice(-1)[0],f=L&&G.F[L.a];return [{n:"nar",t:f?`The night after ${f.name} lost. Nobody let her eat alone; everyone brought food and sat in a circle in the camp yard`:"The night after a tough fight, everyone brought food and sat in a circle in the camp yard"},...(f?[{n:f.id,f:"sad",l:"casual",t:"I'm sorry I let everyone down…"}]:[])];}},
  {inject:G=>{const others=roster(G).filter(x=>{const L=(G.cal||[]).filter(c=>c.res==="L").slice(-1)[0];return !L||x.id!==L.a;}).slice(0,2);return others.map(o=>({n:o.id,f:"happy",l:"casual",t:{kati:"Losing once doesn't mean losing forever. See you at the track at 5am!",mali:"Eat up~ Mali made her special omelette for you~",rin:"I watched the tape. There are three things we can fix within two weeks",fah:"Fah has lost like this too, and came back to win. Believe in Fah!",ploy:"I lost for the first time at fourteen and cried all night… then I kept training"}[o.id]||"We're with you"}));}},
  {n:"coach",t:"Eat well, sleep enough, then start again. Nobody in this camp loses alone"},
  {inject:G=>{roster(G).forEach(f=>{f.morale=Math.min(100,f.morale+4);});return [{n:"nar",t:"(Everyone's morale improves)"}];}}]},
 {id:"camp_open_house",annual:true,pri:1,look:"casual",bg:"camp",when:G=>G.week>=17&&G.week<=19&&roster(G).length>0,steps:[
  {n:"nar",t:G=>yr(G)>=5?`Open day, year ${yr(G)} The parents' queue stretched to the end of the lane, with some driving in from other districts`:yr(G)>=3?"This year's open day brought kids from several districts. The Sirichai name is starting to sound familiar around here":"Villagers drop by the newly reopened camp. Kids cling to the fence watching the fighters train"},
  {inject:G=>campVoice(G,"kati",{kati:yr(G)>=3?"Back when Grandpa was here, open day was crowded just like this":"Grandpa would be so happy. The kids care about Muay Thai again"})},
  {choice:[{t:"Open a free trial class",fx:G=>{G.rep+=yr(G)>=3?1:.6;},then:[{n:"nar",t:"Kids tried wrapping hands and kicking pads. Lots of families took the camp's name home (reputation up)"}]},
   {t:"Sell tickets to watch training",fx:G=>{const v=yr(G)>=5?4000:yr(G)>=3?2500:1000;G.cash+=v;},then:[{inject:G=>[{n:"nar",t:`Ticket sales: ${fmt(yr(G)>=5?4000:yr(G)>=3?2500:1000)} to the camp`}]}]}]}]},
 {id:"camp_community_fair",annual:true,pri:1,look:"casual",bg:"fair",when:G=>G.week>=35&&G.week<=37&&roster(G).length>=2,steps:[
  {n:"nar",t:G=>yr(G)>=3?"The community fair is back. The whole square is packed waiting to see Team Sirichai, some holding fighter name signs":"The community fair invited Sirichai to set up a booth for the first time, between a fried meatball stall and a dart game"},
  {inject:G=>[...campVoice(G,"mali",{mali:"Let Mali be the booth announcer~ I'm the loudest in the camp!"}),...campVoice(G,"fah",{fah:"Want Fah to kick a watermelon mid-air? People will scream!"})].slice(0,1)},
  {choice:[{t:"Do a Muay Thai demo for the kids",fx:G=>{G.rep+=yr(G)>=3?1.2:.6;roster(G).forEach(f=>f.morale=Math.min(100,f.morale+3));},then:[{n:"nar",t:"A little girl came up asking for an autograph on her shirt. Nobody could stop smiling (reputation and morale up)"}]},
   {t:"Sell camp souvenirs",fx:G=>{G.cash+=yr(G)>=3?3000:1200;},then:[{inject:G=>[{n:"nar",t:`The camp-pattern hand wraps sold out before noon, earning ${fmt(yr(G)>=3?3000:1200)}`}]}]}]}]}
);
// v1.86: the district chief reads the year's lucky colour and announces the camp beauty contest
EVENTS.push({id:"nai_color",annual:true,pri:2,look:"casual",bg:"camp",when:G=>G.week>=((G.season||1)===1?4:2)&&G.week<CONTEST_WEEK,steps:[
  {n:"nar",t:G=>(G.season||1)===1?"A district office pickup stops at the gate. A man in khaki climbs out with a brown leather folder":`The start of year ${G.season}, the district office car pulls up again. The District Chief steps out smiling, as he does every year`},
  {n:"npc",who:"District Chief",img:"nai",t:G=>(G.season||1)===1?"Hello, I'm the District Chief. I heard Sirichai Camp has reopened. Congratulations!":"Hello! Sirichai Camp is as lively as ever this year"},
  {n:"npc",who:"District Chief",img:"nai",t:G=>`The district fortune-teller has read the signs. This year's lucky colour is "${yearColor(G).n}" ${yearColor(G).luck}`},
  {n:"npc",who:"District Chief",img:"nai",t:`In week ${CONTEST_WEEK} I'll walk every camp myself for the annual Camp Beauty Contest: seven areas, ten points each`},
  {n:"npc",who:"District Chief",img:"nai",t:G=>`Decorations in ${yearColor(G).n} get bonus points, and don't forget to keep the yard clean. Last year ${(G.contests&&G.contests[(G.season||1)-1]&&G.contests[(G.season||1)-1].rank===1)?"this camp did very well":"Golden Tiger Camp started preparing at new year"}`},
  {n:"coach",t:G=>`${yearColor(G).n}, huh… Manager, shall we check the decorations page? Pieces in the right colour are marked`}]});

/* v1.88 yearly theme scenes (annual — play once in the year that drew the theme) */
EVENTS.push(
{id:"yt_intro_flood",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="flood"&&G.week>=1,steps:[{"n": "nar", "t": "The forecast says this year's rains will be the heaviest yet. The old man next door is already moving his things up high."},{n:"coach",t:G=>`Our camp sits lowest in the subdistrict. When the water comes, we get it first. Around week 14, be ready, ${ME(G)}`},{"n": "kati", "f": "happy", "l": "casual", "t": "It's fine! Grandpa used to train me in the water, said it was great for the legs. …Or maybe he was just fooling me."},{n:"nar",t:"🌊 Flood year: weeks 14–16 training is 80% effective and only half the students can come."}]},
{id:"yt_flood_hit",annual:true,pri:3,look:"casual",bg:"camp",when:G=>ytIn(G,"flood"),steps:[{fx:G=>{G.cash-=6000;G.disaster={name:"The flood",untilAbs:absWeek(G)+3,inc:.5};}},{"n": "nar", "t": "In one night the Ping river floods the camp knee-deep. The heavy bags float like buoys, and the rooster stands on the ring glaring down."},{"n": "coach", "t": "Repairs cost ฿6,000. For three weeks we can't train properly, and only half the students can make it."},{"n": "kati", "f": "happy", "l": "casual", "t": "I can kick through water harder now! …That doesn't really help, does it."}]},
{id:"yt_flood_end",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="flood"&&G.week>=17&&G.week<=19,steps:[{fx:G=>{roster(G).forEach(f=>f.morale=Math.min(100,f.morale+3));}},{"n": "nar", "t": "The water goes down. Half the subdistrict turns up with brooms to scrub the camp, and someone brings sticky rice and fried pork for everyone."},{"n": "npc", "who": "Auntie Sri, the vegetable seller", "t": "Last year your kids carried my vegetables out of the flood. This year it's my turn."},{n:"nar",t:"Everyone's morale +3"}]},
{id:"yt_intro_sponsor",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="sponsor"&&G.week>=1,steps:[{"n": "nar", "t": "A man in a suit steps out of a van with a folder. He's from a new energy-drink brand."},{"n": "npc", "who": "Brand manager, 'One Push'", "t": "We pay two thousand a week until week 40, just for our logo on the shorts. If the camp wins 8 fights by week 40, there's a twenty-thousand bonus."},{choice:[{t:"Take the deal and wear the 'One Push' logo",fx:G=>{G.yt.acc=1;},then:[{"n": "kati", "f": "flustered", "l": "casual", "t": "That logo's huge… bigger than my name."}]},{t:"Politely decline",then:[{"n": "coach", "t": "Fine by me. Grandpa Chai's shorts never had a logo."}]}]}]},
{id:"yt_sponsor_end",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="sponsor"&&G.yt.acc&&G.week>=41,steps:[{fx:G=>{const w=ytSponsorWins(G);G.yt.win=w;if(w>=8)G.cash+=20000;}},{n:"npc",who:"Brand manager, 'One Push'",t:G=>G.yt.win>=8?`This year the camp won ${G.yt.win} fights! Here's the twenty-thousand bonus as promised. Let's talk again next year.`:`This year: ${G.yt.win} fights, short of eight, so no bonus this time. Thanks for wearing the logo all year.`}]},
{id:"yt_intro_pm25",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="pm25"&&G.week>=1,steps:[{"n": "nar", "t": "Early-year news says the dry-season fires will be bad. The haze will come early."},{"n": "coach", "t": "From around week 37 to 46 the haze will cover the city and outdoor training won't do much. An indoor gym with air filters would fix it, if we can afford it. It isn't cheap."},{n:"nar",t:"😷 PM2.5 year: weeks 37–46 training is less effective. The filtered indoor gym is in Manage camp."}]},
{id:"yt_pm_start",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytIn(G,"pm25"),steps:[{"n": "nar", "t": "This morning Doi Suthep has vanished. The sky is a murky orange and everyone trains in masks."},{"n": "kati", "f": "pout", "l": "casual", "t": "Breathing feels like eating burnt rice…"},{n:"coach",t:G=>G.fac.airgym?"Lucky we built the filtered gym. Move inside and train as usual.":"Train light for now. If you want to help the neighbours, hand out masks as this week's camp activity."}]},
{id:"yt_intro_tourist",annual:true,pri:2,look:"casual",bg:"market",when:G=>ytKey(G)==="tourist"&&G.week>=1,steps:[{"n": "nar", "t": "A new direct flight opens and the city fills with tourists. Every day someone is taking photos at the camp gate."},{"n": "coach", "t": "We can charge 20% more for classes this year, but the camp will be hectic and the girls a little more tired each week."},{"n": "kati", "f": "happy", "l": "casual", "t": "I need to practise my 'how are you' again."}]},
{id:"yt_intro_tv",annual:true,pri:2,look:"casual",bg:"camp",when:G=>ytKey(G)==="tv"&&G.week>=1,steps:[{"n": "nar", "t": "The crew of 'Fight Camp Life' wants to film all year. The cameras follow everyone, even Coach Daeng at lunch."},{"n": "coach", "t": "Win on TV and people know you. Lose on TV and they know you too. Careful."},{"n": "kati", "f": "flustered", "l": "casual", "t": "Can I put on some make-up first…?"},{n:"nar",t:"📺 TV year: wins earn more fame, losses cost a little."}]});

/* v1.88 camp lottery — Coach Daeng asks for a number three times a year (the ticket picker opens right after) */
EVENTS.push(
{id:"lotto_ask_0",annual:true,pri:1,look:"casual",bg:"camp",when:G=>G.week>=LOTTO_WK[0]&&G.week<=LOTTO_WK[0]+2&&!lottoDraw(G,0),steps:[{n:"coach",t:"Manager, help me pick a number this draw. I've picked my own for thirty years and only won once, the year I got drafted."},{fx:G=>{lottoSt(G).ask=0;}}]},
{id:"lotto_ask_1",annual:true,pri:1,look:"casual",bg:"camp",when:G=>G.week>=LOTTO_WK[1]&&G.week<=LOTTO_WK[1]+2&&!lottoDraw(G,1),steps:[{n:"coach",t:"I went to pray at the old tree behind the temple. The tree spirit gave me no numbers, only mosquitoes… You pick for me."},{fx:G=>{lottoSt(G).ask=1;}}]},
{id:"lotto_ask_2",annual:true,pri:1,look:"casual",bg:"camp",when:G=>G.week>=LOTTO_WK[2]&&G.week<=LOTTO_WK[2]+2&&!lottoDraw(G,2),steps:[{n:"coach",t:"Last draw of the year. The girls chipped in twenty baht each and want you to pick. If it loses, they'll blame you, not me."},{fx:G=>{lottoSt(G).ask=2;}}]});

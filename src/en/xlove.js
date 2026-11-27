/* v1.91.122 (Man): Baiyok and Pailin become characters you can grow close to — chat, gifts, time together, heart scenes and love —
   once the camp has fought her often and beaten her more often than not (6 bouts, 4 wins, any of our fighters).
   Both stay in their own corner of the story: Pailin keeps running Vector in Bangkok; Baiyok, once she is yours and fighting free in white,
   can move into the camp. Their romance keeps its own track (G.xlov / G.xlex) beside the heroines' and the regional champions'. */
const XL_IDS=["prod_B","pailin"],XL_NEED={n:6,w:4};
const xlIs=id=>XL_IDS.includes(id);
const xlRec=(G,id)=>{let n=0,w=0;for(const c of G.cal||[])if(c.b===id&&G.F[c.a]){n++;if(c.res==="W")w++;}return {n,w};};
const xlOn=(G,id)=>!!(G&&G.xl&&G.xl[id]&&G.xl[id].open!=null&&G.F[id]);
const xlLov=(G,id)=>!!(G&&G.xlov&&G.xlov[id]!=null);
const xlLovN=G=>G&&G.xlov?Object.keys(G.xlov).filter(k=>G.F[k]).length:0;
const xlDue=(G,id)=>{const f=G.F[id];if(!f||xlOn(G,id))return false;if(id==="prod_B"&&!(G.prodigy&&G.prodigy.B==="prod_B"))return false;const r=xlRec(G,id);return r.n>=XL_NEED.n&&r.w>=XL_NEED.w;};
const xlWho=id=>id==="prod_B"?"Baiyok":"Pailin";
const xlCamp=(G,f)=>f.camp==="player"?"Sirichai Camp":f.id==="pailin"?"Vector Gym":f.indie?"Independent":"Golden Tiger";
function xlOpen(G,id){G.xl=G.xl||{};G.xl[id]={open:absWeek(G)};const f=G.F[id];f.met=true;f.know=f.know||{};if((f.bond||0)<12)f.bond=12;f.lastTouch=absWeek(G);G.chatIn=G.chatIn||{};G.chatIn[id]=G.week;}
function xlTake(G,id){G.xlov=G.xlov||{};G.xlov[id]=absWeek(G);if(G.xlex)delete G.xlex[id];if(G.friendz)delete G.friendz[id];if(G.mono)delete G.mono;add(G,id,"morale",12);}
function xlBreak(G,id){if(!xlLov(G,id))return;delete G.xlov[id];G.xlex=G.xlex||{};G.xlex[id]=absWeek(G);add(G,id,"bond",-20);add(G,id,"morale",-15);}
/* weekly: new chats once she is close enough (same rhythm as the heroines), a lover texts at least every other week */
function xlWeekly(G){G.chatIn=G.chatIn||{};try{xlProofWeekly(G);}catch(e){console.error("xl proof",e);}const rng=mulberry32(G.seed*37+G.week*11+5);
  for(const id of XL_IDS){if(!xlOn(G,id))continue;const f=G.F[id];if(G.chatIn[id]||isAway(G,id))continue;if(gameWeek(G)-(G.chatLastAbs?.[id]??-999)<(xlLov(G,id)?2:3))continue;
    if(xlLov(G,id)||(f.bond||0)>=CHAT_BOND&&rng()<.35+((f.bond||0)>=50?.1:0))G.chatIn[id]=G.week;}}
/* time together — five places each, in order; after that a short visit from a small pool */
function xlHang(id){const f=G.F[id];if(!f||!xlOn(G,id)||G.freeUsed||isAway(G,id))return;G.freeUsed=true;f.lastTouch=absWeek(G);f.xlDate=f.xlDate||0;
  const D=XL_DATE[id],i=f.xlDate,first=i<D.length,d=first?D[i]:XL_AGAIN[id][(i-D.length)%XL_AGAIN[id].length];f.xlDate++;
  const gain=first?7:4;save();AU.startMusic("date");
  playScene([...d.steps(G),{inject:G2=>{add(G2,id,"bond",gain);add(G2,id,"morale",4);return [{n:"nar",t:`Bond with ${f.name} +${gain}`}];}}],()=>{AU.startMusic("hub");save();render();},{bg:d.bg,look:"casual"});}
function xlHangHTML(id){const f=G.F[id],D=XL_DATE[id],i=f.xlDate||0;const nx=i<D.length?D[i].name:"A relaxed meet-up";
  return `<h2>Time with ${esc(f.name)}</h2><p class="meta">${id==="pailin"?"Pailin lives in Bangkok · meet when she's up in Chiang Mai":"Meet wherever suits her"} · uses this week's free time</p>
   <div class="acts"><button class="actbtn hspot" data-act="xhanggo" data-id="${id}" ${G.freeUsed?"disabled":""}><b>${esc(nx)}</b><small>${i<D.length?`New place ${i+1}/${D.length}`:"Free"}</small></button></div>`;}
function xlBreakAsk(id){const f=G.F[id];if(!xlLov(G,id))return;playScene([{n:"nar",t:`Really break up with ${f.name}?`,choice:[
    {t:"Break up",fx:G2=>xlBreak(G2,id),then:XL_BREAK[id]},{t:"Not now",then:[{n:"nar",t:"You put your phone away and just text that you miss her."}]}]}],()=>{save();render();},{bg:"night",look:"casual"});}
/* which heart scene is due (25 / 45 / 65 closeness, in order) */
const xlHeartDue=(G,id,k)=>xlOn(G,id)&&!isAway(G,id)&&(G.F[id].bond||0)>=XL_HEART_AT[k]&&(k===0||G.seen["xlh_"+id+"_"+(k-1)])&&gameWeek(G)-(G.xlHeartAbs||-99)>=2;
const XL_HEART_AT=[25,45,65];
Object.assign(ACT,{xhang:d=>{UI.modal={type:"xhang",id:d.id};render();},xhanggo:d=>{UI.modal=null;xlHang(d.id);},xbreak:d=>xlBreakAsk(d.v)});

/* ---------- Baiyok ---------- */
SPK.prod_B={name:"Baiyok",color:"#d9b24a"};
/* v1.91.166 (Man): Baiyok gets a full kit like everyone else — Fah's tree (her old Division B rival line, 48 skills), Lv.42 legend tips of her own,
   two hidden powers, a signature and a hot-form title. As a rival she still fights without skills (skInert in engine.js); the kit opens when she moves in. */
const BY_CAP={
 fah_0a5:["by_0a5","Elbows on the Rope's Beat","Lv.42 · Legend · elbows land on the beat like a wooden-handled jump rope · elbow power +22%, elbow accuracy +4% · Baiyok's mark: 1% less energy",r=>({staSave:.01*r})],
 fah_0b5:["by_0b5","Free Elbow","Lv.42 · Legend · fighting her own way for the first time in her life · elbow points +16%, elbow power +12%, morale effect +2% · Baiyok's mark: morale effect +1%",r=>({mor:.01*r})],
 fah_1a5:["by_1a5","Hundred-Punch Fist","Lv.42 · Legend · every punch counted until none miss · punch power +18%, punch points +10%, 4% less energy · Baiyok's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],
 fah_1b5:["by_1b5","First Downpour","Lv.42 · Legend · punches as heavy as the first downpour over training · punch power +24%, punch accuracy +3%, +3% accuracy at low health · Baiyok's mark: evade +1%",r=>({evade:.01*r})],
 fah_2a5:["by_2a5","Jade's Mae Mai","Lv.42 · Legend · a smile nobody has seen before throws the opponent off · counter +6%, counter punch power +16%, evade +2% · Baiyok's mark: counter +1%",r=>({ctr:.01*r})],
 fah_2b5:["by_2b5","White Jade","Lv.42 · Legend · still standing at the final bell in her own white · +6% accuracy at low health, recovery +18%, morale effect +2% · Baiyok's mark: recovery +3%",r=>({regen:.03*r})]};
const BY_NM={ /* v1.91.169 (Man): Muay Thai names — real strikes and mae mai/luk mai (only ones the five don't use), with Baiyok's story kept in the descriptions and the passives */
 tiger:["Grandma's Chopping Elbow","a downward elbow, the way Grandma taught her at seven · Elbow power +12%, accuracy +2%"],
 f_cut:["Wind-Cutting Slant Elbow","a short rising elbow that never breaks the beat · elbow power +8%, elbow accuracy +1.5%"],
 f_flex:["Wooden-Handled Rope","Passive · training fatigue -5% on every program"],
 f_storm:["Three-Beat Elbows","chopping, cutting and spinning elbows chained on a counted beat · elbow power +12%, elbow accuracy +3%, elbow scoring +6%"],
 f_thunder:["Salap Fan Pla (Zigzag)","Lv.14 · mae mai · zigzags aside and elbows left-right like switching feet on the jump rope · elbow power +14%, elbow accuracy +4%"],
 f_sky:["Spinning Elbow Mid-Ring","Lv.22 · Master · elbow power +16%, punch power +8%, elbow accuracy +3%"],
 fah_rush:["Straight Count of Ten","walks in throwing straight punches in sets, counting under her breath · Punch accuracy +2%, punch score +8%"],
 f_blitz:["Lead Hand Forward","a lead hand that quietly pushes the opponent back all round · punch accuracy +1.5%, punch scoring +6%, stamina use -2%"],
 reckless:["Golden Tiger Iron Body","Passive · 8% less stamina spent attacking"],
 f_tornado:["Hook-Uppercut Combination","straight, hook, uppercut — exactly as written in her notebook · punch accuracy +3%, punch power +10%, punch scoring +8%"],
 f_hurricane:["Hooks to the Corner","Lv.14 · short hooks herding the opponent all round without fading · punch accuracy +4%, punch power +12%, stamina use -3%"],
 f_heaven:["Straight Through the Ring","Lv.22 · Master · punch power +16%, punch accuracy +4%, punch scoring +8%"],
 grin:["Still Stance","Below 45 body: accuracy +3%"],
 f_taunt:["Lure In, Counter","stands so still the opponent can't stand it and rushes in · counters +3%, evade +1%"],
 f_party:["Ring Teacher","Passive · +6% EXP from every fight"],
 f_show:["Crowd-Calling Elbow","an elbow so clean the crowd shouts her name for the first time · morale effect +2%, punch points +4%, kick points +4%, +2% accuracy at low health"],
 f_smile:["Yuan Thot Hae (Casting the Net)","Lv.14 · luk mai · spreads her arms to catch the punch, then counters inside · +5% accuracy at low health, counters +4%, morale effect +2%"],
 f_star:["Grandma's Mae Mai","Lv.22 · Master · evade +3%, counters +5%, +4% accuracy at low health, recovery +10%"],
 fah_0a1:["On-Beat Spear Elbow","Lv.26 · Spear Elbow · the spear elbow lands exactly on the counted beat · elbow power +14%, elbow accuracy +2%"],
 fah_0a2:["Wooden-Handle Elbows","Always on · Lv.30 · elbow power +3%"],
 fah_0a3:["Uppercut Elbow Through the Guard","Lv.34 · Spear Elbow · an upward jab of the elbow through the guard the opponent set · elbow power +14%, elbow points +8%"],
 fah_0a4:["Elbow Opens for Fists","Always on · supports the Forward Fist line · Lv.38 · punch power +2.5%, stamina use -0.5%"],
 fah_0b1:["White Jade Spinning Elbow","Lv.26 · White Jade Elbow · a clean spinning back elbow, nothing extra · elbow points +14%, morale effect +1%"],
 fah_0b2:["Clean Form Scores","Always on · Lv.30 · elbow points +3%, morale effect +0.4%"],
 fah_0b3:["Chang Prasan Nga (Crossing Tusks)","Lv.34 · White Jade Elbow · luk mai · a light step, then both elbows come down crossed · evade +1.5%, elbow power +10%, elbow points +6%"],
 fah_0b4:["Deadpan Elbow","Always on · supports the Still Guard line · Lv.38 · +1% accuracy at low health, morale effect +0.5%"],
 fah_1a1:["Seven-Beat Combination","Lv.26 · Counted Punches · a seven-punch combo, every count exact · punch points +10%, punch power +10%, stamina use -2%"],
 fah_1a2:["Runner's Lungs","Always on · Lv.30 · stamina use -1.5%, recovery +3%"],
 fah_1a3:["Into the Corner","Lv.34 · Counted Punches · herds the opponent into the corner without a word · punch power +16%, punch accuracy +2%"],
 fah_1a4:["Pressing Walk","Always on · supports the Still Guard line · Lv.38 · +1% accuracy at low health, counters +0.6%"],
 fah_1b1:["One Big Hook","Lv.26 · Free Hands · everything into one punch — her own call, nobody's order · punch power +18%, +2% accuracy at low health"],
 fah_1b2:["Fighter's Heart","Always on · Lv.30 · +1.2% accuracy at low health, punch power +1%"],
 fah_1b3:["Trading Mid-Ring","Lv.34 · Free Hands · stands and trades in the middle without stepping back · punch power +14%, clinch defense +0.3"],
 fah_1b4:["Punch Opens the Elbow","Always on · supports the Rhythm Elbow line · Lv.38 · elbow power +3%"],
 fah_2a1:["Raised-Arm Parry and Counter","Lv.26 · Lure and Counter · parries with a raised arm and counters at once · counters +4%, evade +1.5%"],
 fah_2a2:["Locked-On Eyes","Always on · Lv.30 · morale effect +0.5%, counters +0.6%"],
 fah_2a3:["Ka Chik Rang (Crow Tears the Nest)","Lv.34 · Lure and Counter · luk mai · splits the punches apart and counters the rush · counters +3%, counter-punch power +14%"],
 fah_2a4:["Still Elbow Range","Always on · supports the Rhythm Elbow line · Lv.38 · elbow accuracy +1.5%, counter-punch power +2%"],
 fah_2b1:["Grandma's Standing Block","Lv.26 · Rooted Stance · however much it hurts, her face doesn't change · +4% accuracy at low health, recovery +10%"],
 fah_2b2:["Grandma's Steady Knees","Always on · Lv.30 · +1.5% accuracy at low health"],
 fah_2b3:["Reset in White","Lv.34 · Rooted Stance · gets up and dusts herself off like nothing happened · recovery +15%, morale effect +1.5%"],
 fah_2b4:["Silent Walk","Always on · supports the Forward Fist line · Lv.38 · stamina use -1%, punch points +3%"]};
const byFxAdd=(a,b)=>{const o={...a};for(const k in b){if(b[k]&&typeof b[k]==="object"){o[k]={...(a[k]||{})};for(const w in b[k])o[k][w]=(o[k][w]||0)+b[k][w];}else o[k]=(o[k]||0)+b[k];}return o;};
(function byKit(){if(SKILLS.prod_B||!SKILLS.fah)return;REQ_ALIAS.prod_B="fah";
  SK_LINES.prod_B=["Rhythm Elbow Line","Forward Fist Line","Still Guard Line"];
  SKILLS.prod_B=SKILLS.fah.map(s=>{const c=BY_CAP[s.id];if(!c){const n=BY_NM[s.id];return n?{...s,name:n[0],desc:n[1]}:s;}const [id,name,desc,ad]=c;return {...s,id,name,desc,fx:r=>byFxAdd(s.fx(r),ad(r))};});
  TRAITS.prod_B=[{id:"by_count",name:"Count to a Hundred",desc:"Punch accuracy +4% · strikes cost 5% less stamina",fx:{hit:{punch:.04},staSave:.05}},
    {id:"by_grandma",name:"Grandma's Stance",desc:"Counter +4% · recovers 10% faster between rounds",fx:{ctr:.04,regen:.1}}];
  SIGNATURE.prod_B={name:"Wooden-Handled Jump Rope",desc:"Bond ♥ Lv.7+ · Elbow power +12% · 5% less energy",fx:{dmg:{elbow:.12},staSave:.05}};
  HOT_TITLES.prod_B={name:"The Prodigy Who Learned to Smile",desc:"more accurate, slips a little more",prep:.026,ev:.012};})();
/* in the camp she fights on Fah's lines like a main-cast fighter; her points are re-spent along her home line once (on moving in, or the first load after this update) */
function byCampKit(G){const f=G&&G.F&&G.F.prod_B;if(!f||f.camp!=="player")return;
  if(!HOME_STYLE.prod_B){HOME_LINE.prod_B=HOME_LINE.fah;HOME_STYLE.prod_B=HOME_STYLE.fah;LINE_K.prod_B=[.05,.03,.06];LINE_KR.prod_B=[0,0,0];/* v1.91.168: her own line tuning — Fah's offsets assume Fah's stronger hidden powers; with these she lands level with Fah (sim: 5 girls + Baiyok, Fah-shaped stats, Lv.25/32/42) */}
  if(f.byKit)return;f.byKit=1;f.skills={};f.equip=[];f.spv=2;f.sp=SP_PER_LV(f)*Math.max(0,(f.lvl||1)-1);if(f.trLv==null){f.trLv=3;f.trBase=3;}if(!f.trait)f.trait=TRAITS.prod_B[0].id;
  const L=HOME_LINE.prod_B,ord=[...skillList("prod_B")].sort((x,y)=>((x.line===L?0:x.school==="build"?1:2)-(y.line===L?0:y.school==="build"?1:2)));
  let go=true;for(let i=0;go&&f.sp>0&&i<400;i++){go=false;for(const sk of ord){if(f.sp>0&&learnSkill(G,"prod_B",sk.id)){go=true;break;}}}}
const XL_PROF={
 prod_B:{age:20,height:"171 cm",blood:"B",bday:"14 February",home:"Chiang Mai · her grandmother's house by the Mae Kha canal",heritage:"Her grandmother's boxing (before Golden Tiger)",
  personality:"Calm, terse, so straightforward she seems cold. Kind, without knowing how to show it. Learning to enjoy boxing for the first time.",likes:["Wooden-Handled Jump Rope","Rice soup at 5 a.m.","Training in the rain"],
  dislikes:["Whistles","Black kit","The words 'as planned'"],hobby:"Counts her kicks a hundred at a time and writes them in a little notebook",
  story:"Her grandmother taught her boxing from age seven. Golden Tiger took her at thirteen; ten hours a day made her a prodigy who never smiled, until the day she fought under her own name.",
  secret:"Keeps the ticket of every fight against Sirichai in a shoebox, with the result written on the back."},
 pailin:{age:31,height:"175 cm",blood:"A",bday:"23 August",home:"Korat · now a condo near Vector's lab in Bangkok",heritage:"Korat boxing (same line as Ploy) + sports science",
  personality:"Confident, thinks in numbers, a sharp teaser. Slow to admit she's wrong, but always honest with the data. Worries about her sister more than she lets on.",likes:["Black coffee, no sugar","Spreadsheets","The sea of mist at Khao Yai"],
  dislikes:["People who say 'luck'","Data without units","Being called 'Ploy's sister'"],hobby:"Running at 5 a.m. with three watches",
  story:"Eldest daughter of a PE teacher's family in Korat. Boxed before Ploy, studied sports science in Bangkok, then founded Vector with funding she later learned the source of.",
  secret:"Still keeps Ploy's first pair of gloves in her office cabinet. Ploy thinks they were thrown out long ago."}};
Object.assign(GIFTS,{
 yb_rope:{name:"Wooden-handled skipping rope, engraved",price:600,bond:18,only:"prod_B",cat:"keep"},yb_ribbon:{name:"New gold silk hair ribbon",price:1500,bond:40,only:"prod_B",cat:"wear"},
 pl_pen:{name:"Engraved fountain pen",price:1400,bond:20,only:"pailin",cat:"keep"},pl_scarf:{name:"Purple Korat silk scarf",price:2600,bond:42,only:"pailin",cat:"wear"}});
const XL_GPREF={prod_B:{love:["yb_rope","yb_ribbon","khanom","wrap","malai"],like:["sausage","tea","photo","shorts","mongkhon"],dislike:["stickers"]},
 pailin:{love:["pl_pen","pl_scarf","coffee","book","bracelet"],like:["tea","sketch","spa","prajiad"],dislike:["doll"]}};
const XL_GLINES={prod_B:{love:"…For me? No one's ever bought me something just because they wanted to. I'll use it every day.",like:"Thanks. …I'll keep it safe.",ok:"Thanks.",dislike:"…I don't know where to stick these. But thanks."},
 pailin:{love:"…Your data on me is more accurate than I thought. I'll use it every day, and count how many days.",like:"Not bad. I'd give it eight out of ten.",ok:"Thank you",dislike:"A doll… I'll send it to Ploy. She likes pretending she doesn't like things like this."}};
const XL_GAGAIN={prod_B:{food:["{g} again… I finished the last one in one night.","I'll share half with Grandma. She asked who gave it. I haven't answered yet."],wear:["The old one isn't worn through, but I'll use this one on fight days.","Another {g}. …Now I can swap them."],keep:["{g} again. I keep it in the same box as the fight tickets.","You remembered I like it. …Not many people remember things about me."],exp:["Again? …Fine. I won't train that day."]},
 pailin:{food:["{g} again. I've started tracking how many weeks apart you buy them.","I'll share this batch with the lab team, so they know someone sends me things."],wear:["Another {g}. I alternate them, Mondays and Thursdays.","The old one's still in good shape, but I'll take this one too. That doesn't mean I wanted it."],keep:["{g} again. I keep it on my desk. My team asks about it every day.","Data confirmed again: you remember what I like."],exp:["Again? I'll clear my schedule."]}};
for(const id of XL_IDS){if(typeof PROFILES!=="undefined"&&!PROFILES[id])PROFILES[id]=XL_PROF[id];if(!GIFT_PREF[id])GIFT_PREF[id]=XL_GPREF[id];if(!GIFT_LINES[id])GIFT_LINES[id]=XL_GLINES[id];if(!GIFT_AGAIN[id])GIFT_AGAIN[id]=XL_GAGAIN[id];if(typeof SOUV_LOVE!=="undefined"&&!SOUV_LOVE[id])SOUV_LOVE[id]=id==="prod_B"?["n_umbrella","p_lampang"]:["c_bencharong","i_praewa"];}
Object.assign(TELL_MEET,{prod_B:"…Fine. The riverside temple ground. I'll be there first.",pailin:"Yes. I'll take the 6 p.m. flight. Nine o'clock at the café under my friend's condo."});
Object.assign(TELL_SPOT,{prod_B:"the riverside temple ground",pailin:"a late-night café in the middle of Nimman"});
const XL_YES={prod_B:"…I don't know how to answer. No one taught me this. …But my heart's beating faster than in round five, so I guess that means yes.",
 pailin:"I'd calculated you would say it today. …I hadn't calculated I'd be this happy. Yes."};
const XL_WAIT={prod_B:"…I don't know what I feel yet. Give me time. It doesn't mean no.",pailin:"Not enough data yet. …Let me collect a little more. Don't misunderstand. It doesn't mean no."};
const XL_BREAK={prod_B:[{n:"prod_B",f:"pout",l:"casual",t:"…Got it."},{n:"prod_B",f:"pout",l:"casual",t:"I won't cry in front of anyone, Grandma taught me. …But tonight I'll kick the bag a little longer."}],
 pailin:[{n:"pailin",f:"sad",l:"casual",t:"…I've seen the signs for a while. I just didn't want to believe my own data."},{n:"pailin",f:"sad",l:"casual",t:"Thank you for being honest. Go, before I change my mind and ask you to stay."}]};

/* the opening scenes — after 6 bouts and 4 losses she comes to find out why */
EVENTS.push({id:"xl_open_prod_B",look:"casual",bg:"camp_night",pri:45,when:G=>xlDue(G,"prod_B"),steps:[
 {inject:G=>{const r=xlRec(G,"prod_B");return [{n:"nar",t:"Past nine at night, the training-yard lights are off. Someone is standing at the camp gate holding a small notebook."},
  {n:"prod_B",f:"happy",l:"casual",t:`I counted. Fought this camp ${r.n} times, won ${r.n-r.w} lost ${r.w}`}];}},
 {n:"prod_B",f:"pout",l:"casual",t:"At Golden Tiger, lose twice in a row and you train three extra hours. I've added so much I don't know where to add any more."},
 {n:"prod_B",f:"happy",l:"casual",t:"So I came to ask the one who stands in the corner of the girls who beat me. …What does this camp train that I don't?"},
 {n:"nar",t:"What will you reply?",choice:[
  {t:"\"Train to enjoy it first, then train hard.\"",fx:G=>add(G,"prod_B","bond",4),then:[{n:"prod_B",f:"pout",l:"casual",t:"Fun… I've written it down. I don't understand it yet, but it's written down."}]},
  {t:"\"There's someone waiting to eat with them after training.\"",fx:G=>add(G,"prod_B","bond",6),then:[{n:"prod_B",f:"flustered",l:"casual",t:"…Dinner counts? I never thought it counted."}]},
  {t:"\"Come and see for yourself. Sunday.\"",fx:G=>add(G,"prod_B","bond",5),then:[{n:"prod_B",f:"happy",l:"casual",t:"Sunday… fine. I'll come before anyone wakes up."}]}]},
 {n:"prod_B",f:"pout",l:"casual",t:"…Can I have your number? In case I have a boxing question. Only boxing."},
 {fx:G=>xlOpen(G,"prod_B")},{n:"nar",t:"Baiyok added you as a friend · chat, gifts and time together are in the Characters tab"}]});
EVENTS.push({id:"xl_open_pailin",look:"casual",bg:"cafe",pri:45,when:G=>xlDue(G,"pailin"),steps:[
 {n:"nar",t:"📱 A message from an unsaved Bangkok number: \"I'm in Chiang Mai tomorrow. The café by the university, ten o'clock. Not coming counts as a forfeit.\""},
 {inject:G=>{const r=xlRec(G,"pailin");return [{n:"nar",t:"Pailin is already waiting, her tablet face-down on the table, her second black coffee half gone."},
  {n:"pailin",f:"happy",l:"casual",t:`${r.n} fights the data said I should win, and I lost ${r.w}. …Today I'm not here as the head of Vector.`}];}},
 {n:"pailin",f:"pout",l:"casual",t:"I came as someone who wants to know what the variable I can't measure is, and why it's in your camp and not in my lab."},
 {n:"nar",t:"What will you reply?",choice:[
  {t:"\"If you could measure it, it wouldn't be boxing.\"",fx:G=>add(G,"pailin","bond",4),then:[{n:"pailin",f:"pout",l:"casual",t:"The answer I hate most. …But I still have no data to argue with it."}]},
  {t:"\"Because they fight for the people waiting for them, not for the numbers.\"",fx:G=>add(G,"pailin","bond",6),then:[{n:"pailin",f:"flustered",l:"casual",t:"…Ploy said that sentence to me ten years ago. Word for word."}]},
  {t:"\"It's no fun if I tell you now.\"",fx:G=>add(G,"pailin","bond",5),then:[{n:"pailin",f:"happy",l:"casual",t:"That's cheating. Then I'll just have to keep collecting data on you."}]}]},
 {n:"pailin",f:"happy",l:"casual",t:"Let's swap LINE. Purely for research. …And don't tell Ploy I came up to Chiang Mai."},
 {fx:G=>xlOpen(G,"pailin")},{n:"nar",t:"Pailin added you as a friend · chat, gifts and time together are in the Characters tab"}]});

/* ---------- chats (5 topics each · a reply moves her closeness a little) ---------- */
CHAT.prod_B=[
 {id:"yb_count",x:[
  ["Three hundred left kicks, three hundred right. Done. …No one counts for me, so I'm sending them to you to count.",[["Counted. Exactly six hundred. Well done.",2,"…It feels strangely lighter with someone counting."],["Rest your legs a bit.",1,"No one has ever worried about my legs. Thanks."],["Why not seven hundred?",0,"…Fine. Seven hundred tomorrow."]]],
  ["At Golden Tiger, if your kicks weren't done, the coach blew the whistle until they were. I still hear it in my sleep.",[["There are no whistles here. Just Auntie Daeng yelling that dinner's ready.",2,"…Being called to eat. I'd rather hear that instead."],["Let it fade slowly.",1,"I'm trying."],["Good for discipline, though.",0,"…Mm"]]],
  ["Going to sleep. Five a.m. tomorrow.",[["Sweet dreams. Don't dream about whistles.",2,"…If I do, I'll think of Auntie Daeng's voice instead."],["Five a.m. at the temple ground.",1,"Fine. Don't be late."],["Mm.",0,"Mm."]]]]},
 {id:"yb_grandma",x:[
  ["Grandma asked why I've been eating more slowly lately.",[["So what did you tell her?",1,"I said someone taught me a meal doesn't have ten minutes. Grandma laughed until she coughed."],["Your grandma notices a lot.",2,"Grandma notices everything. …She also asked the teacher's name."],["Eating fast isn't wrong.",0,"…I like it slow better now."]]],
  ["The elbow I close rounds with, Grandma taught me at seven, before anyone called me a prodigy.",[["Your grandma's boxing is the most beautiful thing about how you fight.",2,"…I'll tell Grandma. She'll be so happy."],["I'd love to meet your grandma.",2,"Grandma wants to meet you too. She said to bring you for rice soup."],["Golden Tiger didn't teach that move?",0,"They told me to drop it. I didn't."]]],
  ["On Sunday Grandma's making sour curry. If you're free…",[["I'm free! I'll be there.",2,"…I'll tell Grandma to make it less spicy."],["Let me check my schedule.",1,"It's fine. Next time."],["I can't eat spicy food.",0,"Grandma will make clear soup for you. …Grandma's kinder than me."]]]]},
 {id:"yb_fah",x:[
  ["Fah sent a photo of the white hand wraps with gold trim and asked if I still use them.",[["You still use them every fight, right?",2,"Every fight. But don't tell Fah, she'll get smug."],["Fah worries about you.",1,"…I know. I just don't know how to answer someone who worries."],["Message her back.",0,"I've typed and deleted three times."]]],
  ["At Golden Tiger the coach made me watch Fah's tapes every night. Said I had to fight like her.",[["But now you fight as yourself.",2,"…Yes. I chose my kit myself, my moves myself. And who I want to talk to, myself."],["Fah really is good.",1,"She's good. But I'll beat her one day."],["That must have been exhausting.",0,"I'm used to it."]]],
  ["If I beat Fah next time, will you be angry?",[["I'll be happy for whoever fights better.",2,"…The fairest answer I've ever heard."],["I'm cheering for Fah, of course.",0,"Fair enough. She's in your camp."],["Try it.",1,"…I will."]]]]},
 {id:"yb_rain",x:[
  ["It's raining, the temple ground is mud. I'm still training.",[["You can train under the camp roof.",2,"…Really? I'll wipe my feet before I come in."],["Careful not to slip",1,"I've slipped twice. It didn't hurt."],["Rest when it rains.",0,"I don't know how to rest."]]],
  ["When I was little, Grandma said rain is the angels clapping, so I like training in the rain.",[["Then the angels must be your fan club.",2,"…You say strange things. But I like it."],["Your grandma says such lovely things.",1,"Grandma says everything beautifully, except about money."],["You'll catch a cold if you get soaked.",0,"I never do."]]],
  ["The rain's stopped. The sky's so orange… I took a photo, I'm sending it.",[["Beautiful. Thanks for sending it.",2,"I've never taken a photo of the sky to send anyone before."],["It's the same colour over the camp.",1,"Then we're looking at the same sky."],["Your phone takes sharp photos.",0,"…Grandma bought it for me."]]]]},
 {id:"yb_smile",x:[
  ["I won at the temple fair today, and the crowd said I smiled when they raised my hand. I didn't even notice.",[["I want to see! Send me the clip.",2,"…Don't laugh. I'm not good at smiling."],["Congratulations!",1,"Thanks."],["Careful smiling in the ring, you'll get countered.",0,"I know. …I'll be careful."]]],
  ["At my old camp, smiling in the ring wasn't in the manual, so I thought I didn't know how.",[["Of course you can. You just had no one to smile with.",2,"…Now there is."],["You can learn slowly.",1,"I practised in the mirror. Grandma said it was scary."],["No smile looks cool",0,"Then I won't smile for you."]]],
  ["If I smiled more often, would you be happy?",[["I'd be happiest of all.",2,"…Then I'll smile more. Only when you're there."],["Smile for yourself first.",2,"Myself first… I've written it down."],["Up to you.",0,"Mm"]]]]}];
CHAT.pailin=[
 {id:"pl_data",x:[
  ["Your camp, three months: you lose the first round 12% more often than average but win the fifth 31% more. What do you do to them?",[["I tell them to breathe long and enjoy the first round.",2,"…Enjoy the first round. I'll add that column to the spreadsheet."],["Camp secret.",1,"So possessive. Then I'll analyse it myself."],["Luck, maybe",0,"Nothing is a coincidence at 31%."]]],
  ["My lab team calls your camp 'the outlier' in every meeting.",[["Sounds like a compliment.",2,"…It is a compliment. Don't let it go to your head."],["Off the chart is good.",1,"Good for you. A headache for me."],["Why call it that?",0,"Because it can't be predicted. Obviously."]]],
  ["Tonight I'll watch your camp's tapes until two. Don't worry, I have coffee.",[["Get some sleep. The tapes aren't going anywhere.",2,"…You sound just like Ploy. Fine. One a.m."],["Send me your notes in exchange.",1,"Keep dreaming."],["Go go!",0,"Thank you"]]]]},
 {id:"pl_ploy",x:[
  ["Is Ploy eating three meals a day? Don't tell her I asked.",[["All three, and she steals Fah's sausages too.",2,"…Good. As a kid she only ate rice with omelette."],["Why not ask her yourself?",1,"If I ask, she'll say 'Stay out of it, sis.' I know."],["Not sure.",0,"You should know. You're the manager."]]],
  ["When Ploy won by first-round knockout at ten, everyone called her a prodigy. Nobody asked if she was tired.",[["You were the first to ask, weren't you?",2,"…Yes. And then I went to Bangkok and left her alone with that word."],["Ploy's stronger than you think.",1,"I know. Too strong, even."],["Talent's a good thing.",0,"…Good for the audience."]]],
  ["Thank you for looking after my sister. I'll only say this once.",[["Said once, remembered forever.",2,"…You answer so well it's annoying."],["Ploy can look after herself.",1,"Yes. But it's better with someone helping."],["No problem",0,"It is"]]]]},
 {id:"pl_run",x:[
  ["5:20 a.m., ten kilometres, average heart rate 148. Just sharing.",[["Faster than yesterday, too.",2,"…You remember yesterday's?"],["You're up early.",1,"I wake up before every one of my watches."],["Isn't 148 a bit high?",0,"It's within range. Don't worry."]]],
  ["Why do people keep asking why I run, when I don't fight much any more?",[["Because running clears your head.",2,"Correct. You're the first person who's answered it for me."],["Because you still want to fight, right?",2,"…You've read me already. That's not fair."],["I don't know",0,"That's fine."]]],
  ["Come running with me sometime? I'll slow down for you. …A little.",[["Yes! But don't leave me behind.",2,"I'll wait at every kilometre marker. Promise."],["Can I follow on a bicycle?",1,"That's cheating. But I'll allow it."],["I can't keep up.",0,"Then I'll run alone."]]]]},
 {id:"pl_vector",x:[
  ["Today I signed away another of the old funding contracts. The whole lab went quiet.",[["You did the right thing.",2,"…Thank you. I wanted to hear someone say that."],["Will Vector be all right?",1,"I don't know. But I'll find a way that doesn't mean selling myself."],["Shame about the money.",0,"…That money had a higher price."]]],
  ["My team asked why I don't just move the camp to Chiang Mai. I told them it's none of their business.",[["Then whose business is it?",2,"…Mine. I haven't answered myself yet."],["Bangkok's fine as it is.",1,"Yes. The data says so too."],["Come to Chiang Mai. The weather's nice.",1,"You're a good salesman."]]],
  ["I still believe science can make fighting safer. We just can't forget that fighters are people.",[["That's exactly what makes you different.",2,"…I'll remember that sentence when I'm ready to give up."],["Agreed.",1,"Good. Then we're on the same team."],["People are just a set of numbers.",0,"…I used to think that. It led me the wrong way."]]]]},
 {id:"pl_korat",x:[
  ["Mum sent a three-tier tiffin all the way to my condo. I can't eat it fast enough.",[["Send one tier up to Chiang Mai.",2,"It can't go by post. …I'll carry it onto the plane for you."],["Your mum worries about you.",1,"Mum worries about everyone except herself."],["Put it in the fridge.",0,"Already done."]]],
  ["When we were kids, Dad timed Ploy and me running up the hill. I won every time until Ploy was thirteen. Never again after that.",[["So you stopped racing your sister?",1,"So I switched to competing in things I could win. Mathematics, for example."],["Do you miss those days?",2,"…Every time I see the mist on Khao Yai."],["Ploy really is good.",0,"My sister. Of course."]]],
  ["If one day I took you to Khao Yai when the mist comes down, would you come?",[["Definitely. Name the day.",2,"…I'll check ten years of weather records to find the best day."],["Shall we bring the whole camp?",1,"No. This one isn't a camp trip."],["Let me think about it",0,"No rush."]]]]}];

/* ---------- time together: five places each, then short visits ---------- */
const xB=(f,t)=>({n:"prod_B",f,l:"casual",t}),xP=(f,t)=>({n:"pailin",f,l:"casual",t}),xN=t=>({n:"nar",t});
const XL_DATE={
 prod_B:[
  {name:"The riverside temple ground, 5 a.m.",bg:"river_dawn",steps:G=>[xN("The sky isn't light yet. Baiyok has one heavy bag hung from a tamarind branch, a skipping rope around her neck."),xB("happy","You're on time. …I thought you wouldn't get up."),
   xN("She hands you an old skipping rope, its wooden handles worn into fingerprints."),xB("pout","A hundred, no stopping. …I'm joking. Fifty is fine."),xN("When you stop, gasping, at thirty, she lets out a short laugh and quickly turns away."),xB("flustered","I wasn't laughing. …It was the wind.")]},
  {name:"Grandma's rice-soup stall",bg:"food",steps:G=>[xN("An old shophouse rice-soup stall. Baiyok's grandmother serves you fish rice soup in a bowl twice the size of her granddaughter's."),xB("pout","Grandma never serves me this much."),
   xN("Grandma whispers that her granddaughter got up at four to slice ginger the moment she knew you were coming."),xB("flustered","Grandma! …You don't have to tell everything."),xB("happy","…Eat slowly. Nobody counts the time here.")]},
  {name:"Old tapes while the rain falls",bg:"camp_rain",steps:G=>[xN("The rain is so heavy you shelter under the camp eaves. Baiyok opens a clip of an old fight on her phone: black kit, no smile."),
   xB("sad","The one in this clip won every fight, but I can't remember what she felt at all."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"What do you feel now?\"",fx:G2=>add(G2,"prod_B","bond",2),then:[xB("flustered","…Cold. And I don't want the rain to stop.")]},
    {t:"\"The one in the clip is very good. But I like the one beside me better.\"",fx:G2=>add(G2,"prod_B","bond",3),then:[xB("flustered","…The clip's closed. We don't need to watch it.")]}]}]},
  {name:"A Chiang Mai temple fair",bg:"fair",steps:G=>[xN("A Saturday night temple fair. Baiyok stands stock-still in front of the dart stall with the dolls."),xB("happy","I hit every balloon, but they won't give me the big doll."),
   xN("You buy another set of darts and miss every one. She laughs so loudly people turn to look."),xB("flustered","…Sorry. I haven't laughed that loud in a long time."),xN("On the way back she holds the smallest doll she won tight the whole way.")]},
  {name:"Doi Suthep at dusk",bg:"mountain",steps:G=>[xN("The viewpoint on Doi Suthep. The lights of Chiang Mai come on one by one."),xB("happy","Ten years at Golden Tiger and I never once came up here, because Sundays were for training too."),
   xB("pout","Now I have Sundays of my own. …I want to spend them like this."),xN("The wind is so strong the gold ribbon in her hair flies loose. You catch it in time."),xB("flustered","…Thanks. Can you tie it for me? I can't see behind me.")]}],
 pailin:[
  {name:"A late-night café in Nimman",bg:"cafe",steps:G=>[xN("Pailin orders two black coffees, one for you and one for her, then a spare."),xP("happy","I've prepared twenty questions. About your camp."),
   xN("By question three, they've turned into what food you like, what you do on days off, and why you became a camp manager."),xP("flustered","…Questions four to twenty were filed under the wrong heading. You don't have to answer."),xP("happy","But if you'd like to answer, I have until the café closes.")]},
  {name:"A morning run around the old city moat",bg:"river",steps:G=>[xN("Five-thirty a.m. Pailin, wearing three watches, stretches while she waits at Tha Phae Gate."),xP("happy","I've slowed down for you. 5:30 per kilometre."),
   xN("At the third kilometre you start gasping. She jogs backwards to wait and laughs."),xP("pout","Your heart rate is 172. You can stop. I won't record it."),xN("You both sit by the moat to rest. She hands you the water bottle, the only one she brought."),xP("flustered","…I miscalculated. I should have brought two.")]},
  {name:"Vector's Chiang Mai lab, not yet open",bg:"vector_lab",steps:G=>[xN("An empty second floor in an old building. A treadmill and two motion-capture cameras still in plastic."),
   xP("happy","I've rented it for three months. I haven't told anyone, not even Ploy."),xP("sad","I want a place where science helps small camps without anyone having to sell anything to anyone."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"Sirichai will be your first client.\"",fx:G2=>add(G2,"pailin","bond",3),then:[xP("flustered","…There's no staff discount. But I'll give you the friendliest price.")]},
    {t:"\"Then why tell me before Ploy?\"",fx:G2=>add(G2,"pailin","bond",2),then:[xP("flustered","…That data isn't ready for release.")]}]}]},
  {name:"Warorot Market",bg:"market",steps:G=>[xN("Pailin walks the fruit stalls like someone with a planned route. Every stall has a note on her phone."),xP("happy","The longans here are 1.5 Brix sweeter than next door. I measured them last year."),
   xN("The vendor asks if you're her boyfriend. Pailin answers 'business partner' a little too quickly."),xP("flustered","…Academic partner. Don't smile like that."),xP("happy","Take some back for the camp. Tell Ploy you bought them yourself.")]},
  {name:"The rooftop after the rain",bg:"camp_night",steps:G=>[xN("Her flight back to Bangkok is delayed three hours. Pailin calls to tell you in a voice that doesn't sound sorry at all."),xP("happy","I have free time I didn't plan for. …It feels strange."),
   xN("The camp rooftop is still wet with rain. She sits on the one plastic chair and never once opens her tablet."),xP("sad","Since founding Vector I've never sat still for more than five minutes."),xP("flustered","…Forty minutes have passed. I wasn't counting. My watch told me.")]}]};
const XL_AGAIN={
 prod_B:[{bg:"river_dawn",steps:G=>[xN("Five a.m. at the temple ground again. Baiyok shows you her kick count, then has you count for her."),xB("happy","Two hundred… you didn't lose count today.")]},
  {bg:"food",steps:G=>[xN("Grandma's rice soup. Your bowl is even bigger than last time."),xB("pout","Grandma loves you more than me now.")]},
  {bg:"camp",steps:G=>[xN("Baiyok drops by camp on Sunday and cleans the ring until it's cleaner than before."),xB("happy","I came before everyone woke up again.")]}],
 pailin:[{bg:"cafe",steps:G=>[xN("The same café. Pailin arrives ten minutes early, as always."),xP("happy","My third coffee of the day. This one counts as yours.")]},
  {bg:"river",steps:G=>[xN("Another run around the moat. Today she's brought two bottles of water."),xP("happy","I've corrected the error.")]},
  {bg:"camp_night",steps:G=>[xN("A video call at ten at night. Pailin is still in the lab, but turns the camera to show you the Bangkok skyline."),xP("flustered","…Nothing. I just wanted you to see the lights.")]}]};

/* ---------- heart scenes (closeness 25 / 45 / 65) ---------- */
const XL_HEART={
 prod_B:[
  [xN("Baiyok texts at midnight: \"Come out to the camp gate.\""),xN("She's standing under the streetlight with an old shoebox in her hands."),xB("happy","I've kept the ticket from every fight against this camp, with the result written on the back."),
   xB("pout","At first I wrote 'lost, fix it'. Now I write 'fun'. …I don't know when it changed."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"It changed when you chose to fight as yourself.\"",fx:G=>add(G,"prod_B","bond",3),then:[xB("flustered","…Or when someone stood in my corner without me asking.")]},
    {t:"\"Fill the whole box.\"",fx:G=>add(G,"prod_B","bond",2),then:[xB("happy","I've already bought the second box.")]}]}],
  [xN("The night before a big fight, Baiyok calls and says nothing for almost a minute."),xB("sad","…Grandma's in hospital. The doctor says it's not serious, but I'm sitting outside the room alone."),
   xN("You drive there in twenty minutes. She stands the moment she sees you, then doesn't know what to do with her hands."),xB("sad","At my old camp, if anyone had trouble at home, the coach said leave it outside the ring. So I don't know where to put being scared."),
   {n:"nar",t:"What do you do?",choice:[{t:"Sit beside her in silence until morning",fx:G=>add(G,"prod_B","bond",4),then:[xN("At six the doctor says her grandmother is awake. Baiyok is asleep, head drooped on your shoulder.")]},
    {t:"\"Leave it with me for now.\"",fx:G=>add(G,"prod_B","bond",4),then:[xB("flustered","…It's heavy."),xN("She rests her head on your shoulder until morning.")]}]}],
  [xN("Baiyok wins by knockout in the third. She runs down from the ring to the Sirichai corner, though it isn't her corner."),xB("happy","Did you see? …I smiled when they raised my hand. I knew it this time."),
   xB("flustered","I smiled because I looked for you in the crowd, and found you."),xN("The referee calls her back to the ring three times. She still won't let go of your hand."),xB("pout","…Go on. Don't you disappear anywhere.")]],
 pailin:[
  [xN("Pailin sends a file at one in the morning, named 'outlier_v7'."),xN("It isn't camp statistics. It's a blurry photo of you and the fighters laughing at the ringside."),
   xP("flustered","Wrong file. Delete it."),xP("pout","…If you haven't deleted it, then tell me why everyone in the photo looks so happy. I can't find the variable."),{n:"nar",t:"What will you reply?",choice:[
    {t:"\"Because no one was being measured right then.\"",fx:G=>add(G,"pailin","bond",3),then:[xP("sad","…A conclusion I didn't want to hear. But I'll note it.")]},
    {t:"\"Come sit there with us. Then you'll know.\"",fx:G=>add(G,"pailin","bond",3),then:[xP("flustered","…That's not proper research methodology. But I'll try it.")]}]}],
  [xN("Pailin fights a warm-up bout in Bangkok and loses on points to a nineteen-year-old."),xN("That night she video-calls from the athletes' room, her hand wraps still on."),
   xP("sad","The data says I should have retired three years ago. My speed drops 4% a year."),xP("sad","But today, losing, I was glad to still be standing in the ring. …I don't understand myself."),
   {n:"nar",t:"What do you say?",choice:[{t:"\"Some things you don't have to understand. You just keep going.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("flustered","…You sound like someone who has never opened a spreadsheet. But I'll believe you.")]},
    {t:"\"I'm glad you're still fighting.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("flustered","…No one has said that to me since my father.")]}]}],
  [xN("Pailin comes up to Chiang Mai unannounced. She's waiting at the camp gate at sunset with one small bag."),xP("happy","I cancelled three meetings, pushed back a lab test, and lied to my team that I was on a site visit."),
   xP("flustered","All this to watch a sunset with you, which has no statistical value whatsoever."),xN("She stops talking and looks at the sky instead."),xP("pout","…I'm losing control of my variables. And I don't want to control them.")]]};
for(const id of XL_IDS)XL_HEART[id].forEach((st,k)=>EVENTS.push({id:"xlh_"+id+"_"+k,look:"casual",bg:id==="pailin"?["cafe","night","camp"][k]:["camp_night","hospital","hall"][k],pri:30,
  when:G=>xlHeartDue(G,id,k),steps:[{fx:G=>{G.xlHeartAbs=gameWeek(G);}},...st,{inject:G=>{add(G,id,"bond",3);return [{n:"nar",t:`Bond with ${G.F[id].name} +3`}];}}]}));

/* ---------- Baiyok moves in while she fights free in white and a dorm room is open: four weeks after she is yours, or (Man) as a close friend (closeness 60) eight weeks after she opened up ---------- */
const xlJoinDue=G=>{const f=G.F.prod_B;return !!f&&xlOn(G,"prod_B")&&(xlLov(G,"prod_B")?absWeek(G)-G.xlov.prod_B>=4:(f.bond||0)>=60&&absWeek(G)-G.xl.prod_B.open>=8)&&f.camp!=="player"&&byFree(G)&&!(G.xlJoinNo&&absWeek(G)-G.xlJoinNo<8);};
EVENTS.push({id:"xl_join_prod_B",look:"casual",bg:"camp",pri:40,when:xlJoinDue,steps:[
 xN("Sunday morning. Baiyok reaches camp before anyone else, as always, but today there's an old suitcase beside her."),xB("pout","They're repairing the pavilion at the temple ground. No training for three months."),
 xB("flustered","…I lied. The pavilion isn't being repaired. I just want to train here every day, not only on Sundays."),
 {inject:G=>dormUsed(G)>=dormRooms(G)?[xN(`The dorm is full (${dormRooms(G)} rooms) · upgrade the dorm and she'll ask again`),{fx:G2=>{G2.xlJoinNo=absWeek(G2);if(G2.seen)delete G2.seen.xl_join_prod_B;}}]:[{n:"nar",t:"What will you reply?",choice:[
  {t:"\"There's a free room upstairs. Move in.\"",fx:G2=>{joinCamp(G2,"prod_B",2500);const f=G2.F.prod_B;f.indie=false;f.full="Baiyok";xlJoinDrop(f);byCampKit(G2);add(G2,"prod_B","bond",5);add(G2,"prod_B","morale",15);},
   then:[xB("happy","…I won't let anyone down."),xB("flustered","Except oversleeping. I have never overslept."),xN("Baiyok moves into Sirichai Camp · she fights Division B for us")]},
  {t:"\"Not just yet.\"",fx:G2=>{G2.xlJoinNo=absWeek(G2);if(G2.seen)delete G2.seen.xl_join_prod_B;},then:[xB("pout","…All right. I'll wait. But I'm still coming Sundays.")]}]}]}]});

/* ---------- two sisters (Pailin and Ploy) ---------- */
const xlPloyNear=G=>G.F.ploy&&G.F.ploy.met&&(G.F.ploy.bond||0)>=40;
EVENTS.push({id:"xl_sis1",look:"casual",bg:"camp",pri:35,when:G=>xlOn(G,"pailin")&&(G.F.pailin.bond||0)>=45&&xlPloyNear(G)&&!isAway(G,"ploy"),steps:[
 xN("Ploy sets her phone down in front of you, open to her sister's chat. The latest message: \"Your camp manager runs very slowly. Pass that on.\""),
 {n:"ploy",f:"pout",l:"casual",t:"My sister hasn't messaged me first in three years. She's messaged about you three days running."},{n:"ploy",f:"pout",l:"casual",t:"…When did you go running with my sister?"},
 {n:"nar",t:"What will you reply?",choice:[{t:"\"Pailin misses you. She just doesn't know how to start.\"",fx:G=>{add(G,"ploy","bond",3);add(G,"pailin","bond",2);},then:[{n:"ploy",f:"sad",l:"casual",t:"…I don't know either."},{n:"ploy",f:"pout",l:"casual",t:"Tell her this Saturday, if she's free, to come run the hill here. The three of us."}]},
  {t:"\"Jealous?\"",fx:G=>add(G,"ploy","bond",1),then:[{n:"ploy",f:"flustered",l:"casual",t:"Jealous of my sister or jealous of you, I haven't decided. Don't ask yet."}]}]}]});
EVENTS.push({id:"xl_sis2",look:"casual",bg:"night",pri:36,when:G=>xlOn(G,"pailin")&&G.F.ploy&&G.F.ploy.met&&!isAway(G,"ploy")&&
  ((xlLov(G,"pailin")&&(G.F.ploy.bond||0)>=45)||(isPartner(G,"ploy")&&(G.F.pailin.bond||0)>=45)),steps:[
 {inject:G=>{const withP=xlLov(G,"pailin");return [xN("That night the two sisters sit on opposite sides of the camp dinner table. Neither touches her plate."),
  withP?{n:"ploy",f:"pout",l:"casual",t:"You always got everything before me. Fought first, went to Bangkok first… and now again."}:{n:"pailin",f:"sad",l:"casual",t:"Ploy always got everything I wanted. The talent, the punch… and now this person too."},
  withP?{n:"pailin",f:"sad",l:"casual",t:"…I'm not taking anything from you, Ploy. I've just never dared ask for something I really wanted. Until now."}:{n:"ploy",f:"sad",l:"casual",t:"…I never knew what you wanted from me, because you never said."},
  {n:"nar",t:"They both turn to look at you.",choice:[
   {t:"\"You two matter to me in different ways.\"",fx:G2=>{add(G2,"ploy","bond",2);add(G2,"pailin","bond",2);},then:[{n:"pailin",f:"pout",l:"casual",t:"A very diplomatic answer. I'd give it six out of ten."},{n:"ploy",f:"pout",l:"casual",t:"…Five out of ten. But I'll give you today."}]},
   {t:"\"Talk it out first. I'll wait outside.\"",fx:G2=>{add(G2,"ploy","bond",3);add(G2,"pailin","bond",3);},then:[xN("Twenty minutes later, both sisters' laughter drifts out of the room. The first time you've heard them laugh together."),{n:"ploy",f:"happy",l:"casual",t:"…We've worked it out. The details are classified."}]}]}];}}]});

/* ---------- when a heroine notices (once per new romance, if she is close to you) ---------- */
const XL_TWO={kati:"Coach… I've seen you smiling at your phone all day. I don't have to ask. But I know.",mali:"Mali heard you go running in the mornings with someone… Mali's not upset. She's just kicking a little harder in training~",
 rin:"For three weeks you have left camp every Sunday morning. I've logged it. I'm not asking for an explanation.",ploy:"…Don't say it. I've seen it",fah:"Hey! You think Fah doesn't know who's been texting you every night!? …Don't answer. Fah's going to train."};
const xlTwoWho=(G,id)=>{const P=partners(G).filter(k=>XL_TWO[k]&&G.F[k]&&G.F[k].camp==="player"&&!isAway(G,k));if(P.length)return P[0];
  const L=["kati","mali","rin","ploy","fah"].map(k=>G.F[k]).filter(f=>f&&f.camp==="player"&&f.met&&(f.bond||0)>=50&&!isAway(G,f.id)&&!(id==="pailin"&&f.id==="ploy")).sort((a,b)=>(b.bond||0)-(a.bond||0));return L.length?L[0].id:null;};
for(const id of XL_IDS)EVENTS.push({id:"xl_two_"+id,look:"casual",bg:"camp",pri:34,when:G=>xlLov(G,id)&&absWeek(G)-G.xlov[id]>=1&&!!xlTwoWho(G,id),
 steps:[{inject:G=>{const k=xlTwoWho(G,id);add(G,k,"bond",-2);return [{n:k,f:"pout",l:"casual",t:XL_TWO[k]},xN(`${G.F[k].name} knows about you and ${xlWho(id)}`)];}}]});
Object.assign(TELL_WAIT,XL_WAIT);
/* test host only (loadTestSave): Vector and Baiyok exist and the camp already has 6 bouts / 4 wins against each, so both opening scenes play at the end of the first week */
function xlTestSetup(G){try{G.arcs=G.arcs||{};if(!G.arcs.vector){G.arcs.vector=G.season||1;ensureVector(G);}if(!G.F.prod_B&&G.F.fah){makeProdigy(G,"B","fah");}G.flags=G.flags||{};if(G.flags.byFree==null)G.flags.byFree=absWeek(G);fixProdigies(G);
  for(const id of XL_IDS){if(!G.F[id]||xlRec(G,id).n>=6)continue;for(const res of ["W","W","L","W","L","W"])G.cal.push({wk:1,season:1,absWeek:1,a:"kati",b:id,bn:G.F[id].name,tier:"local",res});}}catch(e){console.error("xl test",e);}}

/* ---------- v1.91.124 (Man): a harder route — no harem, slow warm-up, the first confession is always "not yet", and she has to be beaten in a bout she asks for ---------- */
const XL_SLOW=.7,XL_TELL_CD=6;
/* like the regional champions who move in: five levels down (not below 10), stats at 90% */
function xlJoinDrop(f){f.lvl=Math.max(10,(f.lvl||14)-5);for(const k in f.a)f.a[k]=Math.round(f.a[k]*.9*100)/100;}
const xlProof=(G,id)=>G.xlProof&&G.xlProof[id];
const xlProofWon=(G,id)=>{const P=xlProof(G,id);if(!P)return false;if(P.won)return true;const w=(G.cal||[]).some(c=>c.b===id&&c.res==="W"&&(c.absWeek||0)>=P.from);if(w)P.won=absWeek(G);return w;};
function xlReady(G,id){const f=G.F[id],o=G.xl&&G.xl[id];return (f.bond||0)>=75&&!!o&&absWeek(G)-o.open>=6&&G.tellAbs&&G.tellAbs[id]!=null&&xlProofWon(G,id);}
/* the challenge: once the third heart scene has played, she asks the camp's best for a bout; reissued every six weeks until we win one against her */
function xlProofWeekly(G){G.xlProof=G.xlProof||{};for(const id of XL_IDS){const f=G.F[id];if(!xlOn(G,id)||xlLov(G,id)||!G.seen["xlh_"+id+"_2"]||f.camp==="player"||f.injury||xlProofWon(G,id))continue;
  const P=G.xlProof[id]=G.xlProof[id]||{from:absWeek(G),at:-99};if(gameWeek(G)-P.at<6)continue;if(G.offers.some(o=>o.b===id)||G.bookings.some(b=>b.b===id))continue;
  const me=roster(G).filter(x=>!x.injury&&!isAway(G,x.id)).sort((a,b)=>ovr(b.a)-ovr(a.a))[0];if(!me)continue;const wk=[G.week+3,G.week+4,G.week+2].find(w=>w<=48&&!isBooked(G,id,w)&&!G.bookings.some(b=>b.a===me.id&&Math.abs(b.week-w)<=1));if(!wk)continue;
  P.at=gameWeek(G);G.offers.push({id:`o${G.week}_${me.id}_xlp`,a:me.id,b:id,week:wk,tier:"special",rv:1,xlp:1,win:Math.round(TIER.special.win*1.5/100)*100,lose:Math.round(TIER.special.lose*1.3/100)*100});
  if(typeof chatNote==="function")chatNote(G,id,XL_DARE[id](me.name));}}
const XL_DARE={prod_B:n=>`I've sent the challenge to your camp. ${n} against me, five rounds. …If you've got something to say to me, beat me first. Then say it.`,
 pailin:n=>`I've booked the ring. ${n} against me. If your camp wins, I'll admit my data was wrong… and I'll listen to everything you want to say.`};
Object.assign(TELL_WAIT,{prod_B:G=>G.tellAbs&&G.tellAbs.prod_B!=null&&!xlProofWon(G,"prod_B")?"…I told you. Beat me in the ring first. Not because I don't want to hear it. I want to know how hard you'll fight for it.":XL_WAIT.prod_B,
 pailin:G=>G.tellAbs&&G.tellAbs.pailin!=null&&!xlProofWon(G,"pailin")?"The last variable hasn't passed. Your camp has to beat me in the ring first. …I need proof, not words.":XL_WAIT.pailin});
/* on the harem route neither of them joins the group */
const XL_HAREM_NO={prod_B:[{n:"prod_B",f:"pout",l:"casual",t:"…I heard about it at the camp. That you have more than one."},{n:"prod_B",f:"sad",l:"casual",t:"I grew up as one of twenty the coach had to choose from. …I don't want to be one of many again."},{n:"prod_B",f:"happy",l:"casual",t:"But I'll still come on Sundays. We can be friends."}],
 pailin:[{n:"pailin",f:"pout",l:"casual",t:"I've analysed the relationships in your camp. …Too many variables."},{n:"pailin",f:"sad",l:"casual",t:"I don't take part in experiments where I'm not the main variable. I'm sorry."},{n:"pailin",f:"happy",l:"casual",t:"But we can still have coffee. I'll still come up to Chiang Mai."}]};
{const _tell=tellSteps;tellSteps=function(G,id){if(xlIs(id)&&G.harem)return [{n:"nar",t:`That night you go to meet her at the ${TELL_SPOT[id]}`},{fx:G2=>{(G2.tellAbs=G2.tellAbs||{})[id]=absWeek(G2);}},...XL_HAREM_NO[id],{n:"nar",t:`${G.F[id].name} won't join the harem · you can stay friends ${id==="prod_B"?" and she can still move into the camp":""}`}];return _tell(G,id);};}

/* ---------- v1.91.124: chats for when she is yours, and chats that follow what happens ---------- */
const xlLast=(G,id)=>{const L=(G.cal||[]).filter(c=>c.b===id);return L[L.length-1]||null;};
const xlFresh=(G,id,res)=>{const c=xlLast(G,id);return !!c&&c.res===res&&gameWeek(G)-(c.absWeek||0)<=2;};
CHAT.prod_B.push(
 {id:"yb_lost",need:G=>xlFresh(G,"prod_B","W"),rep:4,x:[
  ["Lost again. …I've watched the tape three times and still can't find where I went wrong.",[["You didn't make a mistake. Today was just our day.",2,"…You sound like Grandma. She says boxing has its days."],["Rest first, then watch.",1,"Fine. I'll watch it at five tomorrow."],["Train harder, then.",0,"…I'm already training more."]]],
  ["The strange thing is I'm not as upset as I used to be. I just want to fight your camp again.",[["That's what fun is.",2,"…Fun. I'm starting to understand that word."],["See you next time.",1,"Next time I won't lose."],["Good",0,"Mm"]]],
  ["Tell the one who beat me her round-three elbow was beautiful.",[["I'll tell her. She'll be thrilled.",2,"…Don't say it was me. Say the crowd said it."],["Tell her yourself.",1,"I'm not good with words."],["OK",0,"Thanks."]]]]},
 {id:"yb_won",need:G=>xlFresh(G,"prod_B","L"),rep:4,x:[
  ["I won today. …But when they raised my hand I looked at your camp's corner, not the crowd.",[["I saw. You smiled too.",2,"…I know. You don't have to say it."],["Congratulations. Great fight.",1,"Thanks. Your camp fought well too."],["We'll get you back.",0,"Bring it."]]],
  ["Look after the one who lost. My knee in round four landed hard.",[["She's being looked after. Nothing serious.",2,"…Good. I worried all night."],["You worry about your opponent?",1,"I don't want to win because the other one is hurt."],["That's boxing.",0,"…Mm"]]],
  ["Don't comfort me today. Comfort your fighter first.",[["So kind",2,"I'm not kind. …I just lost once and nobody comforted me."],["Okay, let's talk later.",1,"Mm. Five a.m. tomorrow."],["OK",0,"Mm"]]]]},
 {id:"yb_miss",need:G=>missGap(G,"prod_B")>=4,rep:6,x:[
  ["Weeks without seeing you. …I did all my kicks every day. I can count without anyone.",[["Sorry, I've been really busy.",1,"Don't apologise. I'm just telling you."],["I miss you.",2,"…I've been counting the days we haven't met too."],["Well done.",0,"…Mm"]]],
  ["Grandma asked about you. I said you're busy. She said busy people still have to eat.",[["Let's have rice soup this Sunday.",2,"…I'll tell Grandma to get the big bowl ready."],["Thank your grandma for me.",1,"Sure"],["When I'm free.",0,"Fine… I can wait."]]],
  ["I'm not messaging because I'm lonely.",[["I know. But I'm glad you did.",2,"…Fine. A little lonely."],["Then why did you message?",1,"…I don't know. My finger pressed it."],["OK",0,"Mm"]]]]},
 {id:"yb_l1",when:G=>xlLov(G,"prod_B"),x:[
  ["If someone asks what I am to you now, what do I say?",[["Say girlfriend.",2,"…Girlfriend. I tried saying it in my head. My ears went hot."],["Answer however you want.",1,"I want to say 'the one who counts my kicks'."],["You don't have to answer.",0,"…Mm"]]],
  ["Grandma knows. She made a big pot of hang lay curry to celebrate, but won't say what for.",[["Your grandma is the cutest.",2,"Grandma says you have to come and eat it all. No leftovers."],["How did Grandma know?",1,"I smiled while eating. Grandma said she hadn't seen that in ten years."],["Is hang lay curry spicy?",0,"Not spicy."]]],
  ["…Can I just call you by your name? Not 'manager'.",[["Of course.",2,"…I'll type it now. But I won't send it. I can't. Too embarrassing."],["Call me whatever you like.",1,"Then I'll say 'you' for now."],["'Manager' is fine.",0,"…Fine"]]]]},
 {id:"yb_l2",when:G=>xlLov(G,"prod_B"),x:[
  ["Training finished early today. I'm free. …Not inviting you. Just saying.",[["Then let's go out and eat.",2,"…Fine. I got dressed before I even typed."],["Get some rest",1,"I don't know how to rest, but I'll try."],["Good",0,"…Mm"]]],
  ["I bought a shirt that isn't white. Blue. I don't know if it suits me.",[["It'll suit you for sure. Wear it for me.",2,"…I'll wear it the day we meet. Don't laugh."],["Any colour suits you.",1,"That's too easy an answer."],["White's better.",0,"Then I'll put it away for now."]]],
  ["These days I wake at five because I want to, not because I have to.",[["That's the best news of the day.",2,"…I just wanted you to be the first to know."],["You've come a long way.",1,"Because of you."],["Sleep in sometimes.",0,"No. I've never overslept."]]]]},
 {id:"yb_l3",when:G=>xlLov(G,"prod_B"),x:[
  ["If I quit fighting one day, would you still be here?",[["I'll stay, fighting or not.",2,"…I'll keep fighting a long time. But thank you for that answer."],["Why ask that?",1,"I just want to know what I am if I'm not fighting."],["Don't think about it yet.",0,"…Mm"]]],
  ["At Golden Tiger, my worth was my last fight result.",[["It isn't like that here.",2,"…I know now. I lost two fights and you still sent me rice soup."],["You're worth much more than that.",2,"…You're too direct. I wasn't ready."],["Results matter too.",0,"…Yes. It matters."]]],
  ["On the back of my next fight ticket I'll write 'someone is waiting'.",[["Write it, and keep it in the box.",2,"That's the third box now. …I bought a bigger one."],["Why not write the result?",1,"Because the result isn't as important."],["OK",0,"Mm"]]]]});
CHAT.pailin.push(
 {id:"pl_lost",need:G=>xlFresh(G,"pailin","W"),rep:4,x:[
  ["I lost to your camp again. My lab team was silent the whole van ride back to Bangkok.",[["You fought really well. It just wasn't your day.",2,"…'Not your day' isn't a measurable variable. But I'll accept it tonight."],["Are you all right, though?",2,"Better than the data says, because someone asked."],["Next time, try again.",1,"Of course. It's noted."]]],
  ["The part that can't be predicted is why I still fight myself. I said that once, didn't I?",[["Yes, and it's still true.",2,"…Yes. It's still true."],["Not sure.",0,"I said it. I remember."],["I remember.",1,"Good. You really listen to me."]]],
  ["Tell Ploy I'm not sad. …Actually, don't. She already knows.",[["I'll tell her her sister fought beautifully.",2,"…Thank you."],["Tell her yourself.",1,"I'm typing it now. I've deleted it twice."],["OK",0,"It is"]]]]},
 {id:"pl_won",need:G=>xlFresh(G,"pailin","L"),rep:4,x:[
  ["Today my data was right. …But I'm not as happy as I expected.",[["Why?",1,"Because the one who lost is someone in the camp you love."],["Being right is good, isn't it?",0,"Yes. It's good."],["You didn't want to win like that, did you?",2,"…You've read me again."]]],
  ["I've sent you a file analysing your fighters' weak spots. Free.",[["Why give it away for free?",1,"Because next time I want to beat your best, not someone with weak spots."],["Thank you so much.",2,"No need for thanks. Just beat me."],["It's fine, you don't have to.",0,"Already sent. It can't be deleted."]]],
  ["Tonight I won't watch tapes. First time in three years.",[["Good. Get some rest.",2,"…I'll sleep at ten. And I won't log the stats."],["Why not?",1,"Because I'd rather talk to you."],["That's odd.",0,"It is"]]]]},
 {id:"pl_miss",need:G=>missGap(G,"pailin")>=4,rep:6,x:[
  ["The time since we last talked is now twice the average.",[["Sorry. I miss you too.",2,"…'Too'. I'll log that word."],["I've been really busy.",1,"I understand. I'm busy too, but I still count."],["You count them?",0,"I count."]]],
  ["I have a flight to Chiang Mai on Friday. …Not to see anyone. A site visit.",[["Then have dinner with me after.",2,"The visit ends at five. I've already booked a table for six."],["A site visit to what?",1,"…I haven't decided yet."],["Have a safe trip.",0,"Thank you"]]],
  ["Ploy says you've looked tired lately. Eat properly. That isn't advice. It's an order.",[["Understood, doctor.",2,"I'm not a doctor. But I am certified in nutrition."],["You worry about me?",1,"That data hasn't been released."],["No problem",0,"It is."]]]]},
 {id:"pl_l1",when:G=>xlLov(G,"pailin"),x:[
  ["For the first time in my life I've made a folder on my computer called 'Not Work'.",[["What's in it?",2,"Thirty-two photos of sunsets at your camp."],["Good. Something besides work.",1,"Yes. My team asked if I was ill."],["That's odd.",0,"It is"]]],
  ["My team caught me smiling at my phone during the budget meeting.",[["And what did you tell them?",1,"I said the budget chart was beautiful. Nobody believed me."],["Were you smiling at me?",2,"…That question isn't on the meeting agenda."],["Focus on the meeting.",0,"I am focused."]]],
  ["I haven't officially told Ploy yet.",[["Tell her slowly.",2,"…I'll tell her the day the mist falls on Khao Yai, so she can't see my face clearly."],["Just tell her.",1,"I'm a little scared of my own sister."],["She'll figure it out herself.",0,"…Yes. Probably."]]]]},
 {id:"pl_l2",when:G=>xlLov(G,"pailin"),x:[
  ["I bought a fourth watch. This one doesn't track heart rate or steps. It only tells the time.",[["Why'd you buy it?",1,"To count the time left until I see you. That's all."],["That's sweet",2,"…I won't be replying to this message."],["Isn't four watches heavy?",0,"It is. But I wear them."]]],
  ["Today I ate a whole meal without opening my tablet.",[["I'm so proud of you.",2,"…It's easier when I imagine you sitting across from me."],["Was the food good?",1,"I don't know. I was thinking about something else."],["How did you manage?",0,"Practice."]]],
  ["If Vector has to close, will you think I failed?",[["Not at all. You'd just have chosen the right path.",2,"…I'll remember that if the day comes."],["It won't close.",1,"The data doesn't say that. But thank you."],["It depends on the outcome.",0,"…Okay."]]]]},
 {id:"pl_l3",when:G=>xlLov(G,"pailin"),x:[
  ["I used to think love was a decision made without enough data.",[["And now?",2,"Now I think it's the decision where data isn't necessary."],["That's true.",1,"Yes. And I've decided."],["You're overthinking.",0,"I always overthink."]]],
  ["Mum asked why Ploy and I both look happier, and what happened.",[["What did you tell her?",1,"I said 'Sirichai Camp'. Mum laughed and said she already knew."],["I'm glad you two sisters are doing well.",2,"…That's a gift I didn't expect."],["Luck, maybe",0,"Nothing is a coincidence."]]],
  ["Tonight I'll write the last research note of the year. Title: 'The Variable That Can't Be Measured'.",[["What's the conclusion?",2,"Conclusion: found. It's in Chiang Mai. No further measurement needed."],["Send it to me to read.",1,"One page. But it took three years to write."],["Go go!",0,"Thank you"]]]]});
{const _w=xlWeekly;xlWeekly=function(G){_w(G);for(const id of XL_IDS){if(!xlOn(G,id)||G.chatIn[id]||isAway(G,id))continue;const seen=(G.chatSeen||{})[id]||[],W=G.chatWkAbs||{};
  if((CHAT[id]||[]).some(t=>t.need&&(!t.when||t.when(G))&&t.need(G)&&(!seen.includes(t.id)||(t.rep&&gameWeek(G)-(W[id+":"+t.id]??-999)>=t.rep))))G.chatIn[id]=G.week;}};}

/* ---------- v1.91.124: three scenes once she is yours (2 / 8 / 16 weeks in) ---------- */
const XL_LOVE_AT=[2,8,16];
const xlLoveDue=(G,id,k)=>xlLov(G,id)&&!isAway(G,id)&&absWeek(G)-G.xlov[id]>=XL_LOVE_AT[k]&&(k===0||G.seen["xll_"+id+"_"+(k-1)])&&gameWeek(G)-(G.xlHeartAbs||-99)>=2;
const XL_LOVE={
 prod_B:[
  [xN("Baiyok asks to meet at the temple ground at five as always, but today there's no bag and no rope, only a tiffin and a small mat."),xB("flustered","Grandma says a couple should have breakfast together at least once. I don't know if that's true, but Grandma never lies."),
   xN("You eat slowly, and so does she, though her chopsticks shake a little."),xB("happy","…Fifteen minutes and still no whistle."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"There won't be any more of that.\"",fx:G=>add(G,"prod_B","bond",3),then:[xB("flustered","…I know. But can you say it again? I want to remember this voice instead.")]},
    {t:"Feed her a bite",fx:G=>add(G,"prod_B","bond",3),then:[xN("Baiyok freezes for a full three seconds, then takes the bite and turns away at once."),xB("flustered","…Not in front of Grandma.")]}]}],
  [xN("Baiyok's big fight tonight. She asks you to stand in her red corner, though Sirichai has no one on the card."),xB("pout","The rules say someone has to be in the corner. …This time I'm not borrowing anyone. I chose."),
   xN("Round five: a kick to the ribs drops her. She comes back to the corner with blood at her lip."),xB("sad","…If I lose, will you be disappointed?"),{n:"nar",t:"What do you say before the bell?",choice:[
    {t:"\"I'm here for you, not for the result.\"",fx:G=>add(G,"prod_B","bond",4),then:[xN("She's up the moment the bell rings and wins the last round on points."),xB("happy","…That line hit harder than my opponent.")]},
    {t:"\"Those three hundred left kicks you counted. Use them now.\"",fx:G=>add(G,"prod_B","bond",4),then:[xN("Her left kick ends it midway through round five. The whole arena is on its feet."),xB("happy","You really did count every time.")]}]}],
  [xN("A rainy night. Baiyok opens all three shoeboxes on her floor. Fight tickets cover the floor."),xB("happy","I counted. Since last month, tickets that say 'fun' outnumber 'lost, fix it'."),
   xB("flustered","On the newest one I wrote something else."),xN("On the back of the newest ticket, in tiny handwriting: 'I have a home to go back to now.'"),xB("pout","…Don't read it aloud.")]],
 pailin:[
  [xN("Pailin flies up on a Friday night and opens her tablet in front of you. On screen: a timetable for the next six months."),xP("happy","I've drawn up a schedule. Chiang Mai twice a month, Friday to Sunday."),
   xP("flustered","…If you're not free I can delete every slot. I don't want it to look like a contract."),{n:"nar",t:"What will you reply?",choice:[
    {t:"\"Don't delete them. Add one more.\"",fx:G=>add(G,"pailin","bond",3),then:[xP("flustered","…I'll add a Wednesday slot. My team will definitely get suspicious.")]},
    {t:"Close the tablet and take her hand",fx:G=>add(G,"pailin","bond",3),then:[xN("She looks at the dark tablet longer than she should, then doesn't open it again all night.")]}]}],
  [xN("A funders' meeting at Vector in Bangkok. Pailin video-calls from a twentieth-floor restroom, so quietly you can barely hear her."),xP("sad","They say if I don't take Naka's funding back, Vector has eight months."),
   xP("sad","I can calculate every option. I can't calculate which one I won't hate myself for."),{n:"nar",t:"What do you say?",choice:[
    {t:"\"Eight months is enough to find another way. We'll find it together.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("flustered","…'We'. I'll walk back into the meeting with that word.")]},
    {t:"\"You turned that money down once. You can do it again.\"",fx:G=>add(G,"pailin","bond",4),then:[xP("happy","…The historical data supports you. I'll trust my past self.")]}]}],
  [xN("Thick mist on Khao Yai at 5 a.m. Pailin brought you as promised, on the day she picked from ten years of forecasts."),xP("happy","The probability of mist today was 83%. …And it came."),
   xN("Ploy is standing on the far side of the viewpoint. She came too. Pailin invited her."),{n:"ploy",f:"happy",l:"casual",t:"My sister told me. …Congratulations. Don't you dare make her cry."},
   xP("flustered","No plan of mine has ever turned out better than calculated. …Until today.")]]};
for(const id of XL_IDS)XL_LOVE[id].forEach((st,k)=>EVENTS.push({id:"xll_"+id+"_"+k,look:"casual",bg:id==="pailin"?["cafe","night","mountain"][k]:["river_dawn","hall","camp_rain"][k],pri:30,
  when:G=>xlLoveDue(G,id,k),steps:[{fx:G=>{G.xlHeartAbs=gameWeek(G);}},...st,{inject:G=>{add(G,id,"bond",3);return [{n:"nar",t:`Bond with ${G.F[id].name} +3`}];}}]}));

/* ---------- v1.91.124: birthdays (Baiyok 14 Feb — Valentine's Day too · Pailin 23 Aug), once she has opened up and is close ---------- */
const XL_BDAY={prod_B:[14,1],pailin:[23,7]};
const xlBdayDue=(G,id)=>{const x=XL_BDAY[id],w=dateWeek(x[0],x[1]);return xlOn(G,id)&&(G.F[id].bond||0)>=30&&!isAway(G,id)&&G.week>=w&&G.week<=w+1;};
EVENTS.push({id:"xl_bday_prod_B",annual:true,look:"casual",bg:"food",pri:33,when:G=>xlBdayDue(G,"prod_B"),steps:[
 {inject:G=>xlLov(G,"prod_B")?[xN("14 February: Valentine's Day, and Baiyok's birthday. She's never told anyone. Her grandmother whispered it to you."),xB("pout","Grandma's a tattletale."),
   xB("flustered","Every year I hate this day. The whole city is roses and nobody knows it's my birthday."),{n:"nar",t:"What do you give her?",choice:[
    {t:"A handful of jasmine, not roses",fx:G2=>add(G2,"prod_B","bond",5),then:[xB("flustered","…You remembered I like jasmine better. I never said. I only looked at the garland stall a bit too long, once.")]},
    {t:"One candle stuck in a bowl of Grandma's rice soup",fx:G2=>add(G2,"prod_B","bond",5),then:[xN("Baiyok blows out the candle and stays still for a long time."),xB("happy","I wished that next year… I won't say. It won't come true if I do.")]}]}]
  :[xN("Baiyok's grandmother messages you: \"Today is my granddaughter's birthday. She never tells anyone, so I'm telling you.\""),xN("You send her a birthday message. Five minutes later she replies."),xB("flustered","…Grandma told you, didn't she. Thanks. This year two people remembered."),{fx:G2=>add(G2,"prod_B","bond",3)}]}]});
EVENTS.push({id:"xl_bday_pailin",annual:true,look:"casual",bg:"cafe",pri:33,when:G=>xlBdayDue(G,"pailin"),steps:[
 {inject:G=>xlLov(G,"pailin")?[xN("23 August, Pailin's birthday. She tells everyone she's working as usual, but her flight to Chiang Mai was booked three months ago."),xP("happy","I'm not here to celebrate. I'm here for a meeting. …The only item on the agenda is you."),
   {n:"nar",t:"What do you give her?",choice:[{t:"A cake with a candle for every year",fx:G2=>add(G2,"pailin","bond",5),then:[xP("pout","Thirty-one candles… you actually counted. Nobody's ever dared do this to me."),xP("happy","…All in one breath. My lung data is still good.")]},
    {t:"A blank notebook, its first page titled 'What Doesn't Need Measuring'",fx:G2=>add(G2,"pailin","bond",5),then:[xP("flustered","…I'll write the first page right now."),xN("She writes a single word and closes the notebook before you can see.")]}]}]
  :[xN("📱 Pailin sends a photo of a small slice of cake on her desk. No candle, just a note: '23/8'."),xN("You call to wish her happy birthday. The line is silent for two seconds."),xP("flustered","…I didn't send it for birthday wishes. I just sent it. …But thank you."),{fx:G2=>add(G2,"pailin","bond",3)}]}]});

/* ---------- v1.91.124 (Man): her cards stay out of the album (and its count) until she has opened up and you are close (25) ---------- */
const xlShow=(G,id)=>xlOn(G,id)&&((G.F[id].bond||0)>=25||Object.keys(G.cards||{}).some(k=>CARDS[k]&&CARDS[k].c===id));
Object.assign(CARDS,{
 xl_by_n:{c:"prod_B",xl:1,r:"N",t:"The Kick-Count Notebook",hint:"Get to know Baiyok (acquaintance)",bg:"river_dawn",need:G=>xlOn(G,"prod_B")&&(G.F.prod_B.bond||0)>=25,steps:[
  xN("A little brown notebook left on the temple-ground bench. Inside, nothing but 300 / 300, hundreds of lines."),xB("pout","Don't read it. …It's only numbers. Nothing interesting."),xN("The last line has something added in faint pencil: 'Someone counted for me today.'"),xB("flustered","…I told you not to read it.")]},
 xl_by_r:{c:"prod_B",xl:1,r:"R",t:"Wooden-Handled Jump Rope",hint:"Grow close to Baiyok (close friend)",bg:"river_dawn",need:G=>xlOn(G,"prod_B")&&(G.F.prod_B.bond||0)>=40,steps:[
  xN("Baiyok teaches you crossover skips with her grandmother's old rope, the wooden handles worn deep by thumbs."),xB("happy","Grandma skipped with this rope when she was young. She says she was better than me."),xB("flustered","…I've never let anyone touch this rope. You're the first. Don't feel special.")]},
 xl_by_sr:{c:"prod_B",xl:1,r:"SR",t:"Beat Me First",hint:"Our camp wins Baiyok's challenge",bg:"hall",need:G=>xlProofWon(G,"prod_B"),steps:[
  xN("After the fight, Baiyok sits against the ropes, her white hand wraps with gold trim still on."),xB("sad","Lost again. …I didn't hold back for a single round."),xB("happy","Good. If your camp had won because I held back, I wouldn't believe a word you said."),xB("flustered","…Now, say whatever you want to say.")]},
 xl_by_ssr:{c:"prod_B",xl:1,r:"SSR",t:"A Home to Go Back To",hint:"Baiyok is your girlfriend",bg:"camp_rain",need:G=>xlLov(G,"prod_B"),steps:[
  xN("Heavy rain at the temple ground. Baiyok stops training and shelters in your car for the first time."),xB("happy","When it rained I used to keep training, because I had nowhere to go."),xB("flustered","…Now I do, so I can stop.")]},
 xl_pl_n:{c:"pailin",xl:1,r:"N",t:"The Third Cup",hint:"Get to know Pailin (acquaintance)",bg:"cafe",need:G=>xlOn(G,"pailin")&&(G.F.pailin.bond||0)>=25,steps:[
  xN("A window table, three black coffees: one for Pailin, one for you, and one 'spare'."),xP("happy","The spare cup is for when the conversation runs longer than calculated."),xP("flustered","…Which it is, every time.")]},
 xl_pl_r:{c:"pailin",xl:1,r:"R",t:"Three Watches",hint:"Grow close to Pailin (close friend)",bg:"river",need:G=>xlOn(G,"pailin")&&(G.F.pailin.bond||0)>=40,steps:[
  xN("Pailin takes off her watches one by one and lays them on the table. One tracks heart rate, one counts steps, one was her father's."),xP("sad","Dad timed Ploy and me running up the hill with this one. It's been two minutes slow for ten years."),xP("happy","I've never reset it. …Some things don't need to be accurate.")]},
 xl_pl_sr:{c:"pailin",xl:1,r:"SR",t:"Proof",hint:"Our camp wins Pailin's challenge",bg:"vector_lab",need:G=>xlProofWon(G,"pailin"),steps:[
  xN("Vector's lab late at night. Pailin replays the fight she just lost for the tenth time."),xP("pout","My data was wrong. I admit it."),xP("flustered","And as agreed… I'm ready to hear everything you want to say.")]},
 xl_pl_ssr:{c:"pailin",xl:1,r:"SSR",t:"What Doesn't Need Measuring",hint:"Pailin is your girlfriend",bg:"mountain",need:G=>xlLov(G,"pailin"),steps:[
  xN("The sea of mist at Khao Yai. Pailin isn't wearing a single watch."),xP("happy","Today I don't know the time. I don't know my heart rate."),xP("flustered","…All I know is I want to stay here longer than planned.")]}});

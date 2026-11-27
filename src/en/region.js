// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

/* v1.91.166 (Man): the walk to the ring rotates instead of one line every trip */
const RG_TO_RING=["The pi chawa from the ring carries to the hotel door. Everyone grabs their bags and heads for the ring",
  "Two samlors are waiting outside the hotel. A driver shouts, \"The boxing camp? Ring's this way — hop on!\"",
  "Kru Daeng knocks on each door: \"It's time.\" The whole camp files down the hotel stairs to the van.",
  "The ring announcer's voice drifts in on the wind from the speakers. Everyone falls quiet, then heads out together."];
const RG={
 north:{name:"the North",champ:"Baibua",nick:"Thorned Lotus of Lanna",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"Isan",champ:"Tabtim",nick:"The Ruby of the Isan Plains",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"the Central Plains",champ:"Alicia",nick:"The Muay Thai Princess",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"the South",champ:"Chaba",nick:"The Typhoon Fist",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["White Temple Elbow","elbow",{dmg:{elbow:.10}}],nan:["Nan Longboat Knee","knee",{dmg:{knee:.10}}],uttaradit:["Broken-Sword Elbow of Phraya Phichai","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["Iron Horse Push Kick of Lampang","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["Red Lotus Bloom Kick","kick",{dmg:{kick:.10}}],khonkaen:["Silk-Weaver Knee of Khon Kaen","knee",{dmg:{knee:.08},regen:.06}],buriram:["Phanom Rung Lightning Punch","punch",{dmg:{punch:.10}}],ubon:["Candle Festival Elbow","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["Monkey Fools the Master Punch","punch",{dmg:{punch:.08},evade:.01}],suphan:["Suphan Master-Move Kick","kick",{dmg:{kick:.10}}],phetchaburi:["Khao Wang Knee of Phetchaburi","knee",{dmg:{knee:.10}}],chanthaburi:["Mangosteen Shell Punch","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["Swooping Gull Kick","kick",{dmg:{kick:.08},evade:.01}],surat:["Don Sak Oyster Shell Elbow","elbow",{dmg:{elbow:.10}}],nakhonsi:["Shadow Puppet Punch","punch",{dmg:{punch:.10}}],songkhla:["Samila Mermaid Kick","kick",{dmg:{kick:.08},regen:.06}]};
const RG_JOIN_LVDROP=5,RG_JOIN_STAT=.9;
const RG_SK_ADJ={north:1.75,isan:.75,central:.72,south:.85},RG_SK_CUP={north:.015,isan:.03,central:.08,south:.065},RG_CH_SKLV=35; /* her tree grows with each cup (Lv.35→37), so the raw strength gives a little back per cup */ /* v1.91.45: champions now fight with a learned tree — their raw strength comes down by this much so the win rates stay where Man set them */
const RG_TRAIT2={baibua:{name:"Still as the Lotus Pond",desc:"Recovers 10% more between rounds · 4% more accurate below 45% HP",fx:{regen:.1,clutch:.04}},
  tabtim:{name:"Laugh It Off",desc:"Strikes cost 6% less stamina · morale counts 2% more in fights",fx:{staSave:.06,mor:.02}},
  alicia:{name:"On Camera",desc:"Base accuracy +1.5% · punches score 10% more",fx:{prep:.015,pts:{punch:.1}}},
  chaba:{name:"Undertow",desc:"Counters 4% more often · counters hit 12% harder",fx:{ctr:.04,ctrDmg:.12}}};
function rgDress(f){const P=f&&f.rg&&RG_PSP[f.rg];if(!P)return f;f.spl=[{w:P[1],def:P[0],npc:1,p:.45}];f.pfx=P[2];return f;}
/* v1.90 difficulty (18 Nov 2026, Man): every fighter gets a fair-but-hard bout — belts ~38% → 30%, a championship series ~18% → 10% —
   found by sparring her against the opponent at a few strengths (rgFit). The ladder below is the CEILING: past it the opponent stops
   growing, so a fighter beyond the stat ceiling of 20 (limit break) starts winning more. Ceiling values: */
/* (old note) difficulty ladder: opponent strength in stat points + ring craft.
   Tuned (18 Nov 2026, 200 bouts each) so a fully built Ploy (stats 20, Lv.23, full skills) wins belt 1 ~39% → belt 16 ~27% and a championship series 20% (cup 1) → 10% (cup 4).
   A casual build (stats 20, Lv.18) wins ~5% / ~0% — the limit break is meant to be the way past it. */
/* v1.90.17 (Man): no extra comeback odds on belts; a lost championship series keeps the small v1.90.14 nudge (+.03 a bout, twice) */
const RG_RETRY={bout:.03,sMax:2};
/* v1.90.21 (Man): one bar for everyone — opponent strength is fixed, not fitted to your fighter. It climbs with progress (later belts and champions have studied the tapes of earlier fights).
   Set from a "casual" fighter (stats 20, Lv.18, every skill she can learn, morale 70, no fight prep): the middle of the five heroines wins belts 48% → 32%,
   championship series 22% → 12%, the Naka members 45/40/35/30% and Ladda 20%. Morale, fight prep, the camp and limit-break growth all push past that */
const RG_FIX={belt:n=>22.25+.65*Math.min(15,n)/15,champ:(cups,tries)=>23.41+.1067*Math.min(3,cups)-.15*Math.min(2,tries||0),nl:{nia:23.41,varya:25.35,meili:23.82,rosa:25.51,ladda:24.0}} /* v1.91.54 (Man, option B): the four members −0.4 now that a lost night starts over (about level with the regional champions; Ladda unchanged) */; /* v1.91.38 (Man): champions a little harder (+.3 → maxed series ~56→45%), the Naka members harder (+.5 → ~40%), Ladda a brutal final (+1.3 → ~18%) */ /* v1.91.13 (Man): set for a maxed fighter (Lv.32, every bonus, stat 20) — belts ~80% · series ~60% · Naka ~50% · Ladda ~40% */ /* v1.91.6: re-set after the heroine rebalance (v1.91.0–1.91.5), same targets, middle of the five home-line builds · v1.91.7: champions −0.35 after opponents got fixed styles */
/* v1.90.18 (Man): belts 40% every time, championship series 20% → 12% — the chapter in about 3 years for a fighter who never outgrows the fit */
const RG_ODDS={belt:n=>.40,series:cups=>.20-.08*Math.min(3,cups)/3,bout:s=>{let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;m*m*(3-2*m)<s?lo=m:hi=m;}return (lo+hi)/2;}};
/* the opponent strength (≤ ceil) at which `me` wins about `p` of 5-round bouts. setT(T) rebuilds the opponent at strength T. */
/* the fit sees the fighter's lasting strength only (stats, level, skills, gear, camp): morale, fatigue, injury and this week's fight prep are left out, so they swing the real bout (v1.90.19: prep was counted if done before booking) */
function rgFit(me,opp,setT,p,ceil,rounds){const M={...me,a:{...me.a},fatigue:0,injury:0,morale:70,prepBonus:0,counterPrep:0,labPrep:0,trainLog:[]},N=60;
  const win=T=>{setT(T);let w=0;for(let i=0;i<N;i++){const F=quickFight(M,opp,40417+i*131,rounds||5);if(F.result.win==="A")w++;else if(F.result.win==="D")w+=.5;}return w/N;};
  if(win(ceil)>=p)return ceil;let lo=Math.min(12,ceil-1),hi=ceil;for(let i=0;i<7;i++){const m=(lo+hi)/2;win(m)>p?lo=m:hi=m;}const T=(lo+hi)/2;setT(T);return T;}
const RG_LADDER={belt:n=>RG_LADDER.b0+n*RG_LADDER.bs,champ:(cups,tries)=>RG_LADDER.c0+cups*RG_LADDER.cs-Math.min(RG_RETRY.sMax,tries||0)*.15,b0:24.9,bs:.027,c0:24.8,cs:.15};
const RG_OPP={chiangrai:"Kaewkan Sor Mae Sai",nan:"Namphueng Luk Muang Nan",uttaradit:"Thongdee Sit Dap Hak",lampang:"Ma Lek Luk Rot Ma",
 udon:"Buadaeng Nong Han",khonkaen:"Maikaew Luk Chonnabot",buriram:"Saifah Phanom Rung",ubon:"Thianthong Rim Khong",
 lopburi:"Jo Thong Sor Phra Prang",suphan:"Maemai Bang Pla Ma",phetchaburi:"Mokaeng Muang Phet",chanthaburi:"Mangkhut Luk Chan",
 chumphon:"Nangnuan Paknam",surat:"Nangrom Don Sak",nakhonsi:"Talung Sor Muang Khon",songkhla:"Samila Luk Songkhla"};
/* v1.91.9: province champions lean to their region's style (Tha Sao elbows and speed · Korat heavy hands · Lopburi craft · Chaiya stance) — a lean, not a rule */
const RG_BSTY={north:{inside:3,footwork:3,counter:1,power:1,pressure:1},isan:{power:4,footwork:2,inside:1,pressure:1,counter:1},
 central:{counter:3,footwork:2,inside:2,power:1,pressure:1},south:{pressure:3,footwork:3,counter:1,power:1,inside:1}};
function rgBeltSty(r,id){const W=RG_BSTY[r],K=Object.keys(W),tot=K.reduce((a,k)=>a+W[k],0);let x=((stableHash(id+"|sty")>>>0)%1000)/1000*tot;for(const k of K){x-=W[k];if(x<0)return k;}return K[0];}
const RG_TRIP_GAP=2; /* v1.91.38 (Man): one trip every 2 weeks (was every week since v1.90.17) */
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */
const RG_CUP_PRIZE=50000;
const RG_TITLE={north:"Northern title series",isan:"Isan title series",central:"Central title series",south:"Southern title series"};
/* v1.90 round 3: each champion's series — perk, letters, lines before/after each bout, the cup ceremony and the private cup night.
   Draft dialogue (dialects to be checked: คำเมือง by Man, อีสาน/ใต้ by native speakers) — the full regional scripts come in rounds 6–9. */
const RG_CH={
 north:{ring:"north",venue:"Lanna Temple Ring, Chiang Mai",pair:"kati",nightBg:"doisuthep",
  perk:{name:"Lotus with Hidden Thorns",desc:"Counters 5% more often · elbows 12% harder",fx:{ctr:.05,dmg:{elbow:.12}}},
  letter:"Dear Manager of Sirichai Camp,\n\nThis is Baibua. I heard your camp has won all four belts of the North. Congratulations.\n\nThe Lanna Temple Ring in Chiang Mai is waiting. The title series is three bouts; whoever wins two first takes the cup. I'd like you to choose one fighter to face me through all three bouts.\n\nPick at Fights › Four Regions Cup\n\nBaibua · Bua Tha Sao Camp",
  again:"Manager,\n\nI'm still waiting in Chiang Mai. Whenever Sirichai Camp is ready, send a fighter again. The same one or a new one, either is fine.\n\nI'll keep training while I wait.\n\nBaibua",
  wait:"It's all right. I can wait. Take care of your fighter first. — Baibua",
 pre:[n=>`${n}… It's an honour to fight you. I won't hold back. Tha Sao elbows never hold back for anyone.`,n=>`I'll counter harder this time. Watch out for the back elbow.`,n=>`Last bout… "Faster than the wind, Tha Sao" — I'll fight up to those words. I carry the whole Bua Tha Sao camp on my back; I can't lose.`],
  sty:["inside","counter","footwork"], /* v1.91.9 (Man): each bout has its own style, hinted in the line before it */
  reply:"Bring it. I came ready.",pairLine:"Tha Sao, same as you… but today I want to be the one who wins.",
 win:["Thank you for fighting me. I'll be waiting for the next bout.","It's not over. I know what I have to fix now.","…"],
 lose:["You're really good. I got careless. See you next bout.","You read my elbows completely… I won't give in easily in the last bout.","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"The cup stays in Chiang Mai… but I really enjoyed fighting Sirichai Camp."},{n:"baibua",f:"flustered",l:"fight",t:"Whenever you're ready, write and tell me. I'll be waiting."},{n:"nar",t:"Baibua wais everyone before she leaves the ring, then turns back to look at the Manager once more."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Northern title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",img:"gala_mc_hype",t:`Ladies and gentlemen! The Northern Regional Cup of the Four Regions Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Khun Krerk hands over a golden cup in the middle of the ring. Hundreds of Yi Peng lanterns rise into the sky at once."},
   {n:"baibua",f:"happy",l:"fight",t:"Congratulations… Manager, tonight there's a place I'd like to take you… if you don't mind."},
   {n:"baibua",f:"flustered",l:"fight",t:"There's something I want to tell you… Um, never mind. Later is fine."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Baibua")}]:[]),
   {n:"coach",t:"The camp's first regional cup… Grandpa Chai must be smiling."}];},
  night:(G,T)=>[
   {n:"nar",t:"At five in the morning Baibua is waiting outside the hotel on an old motorbike. You ride up Doi Suthep while the sky is still dark."},
   {n:"baibua",f:"happy",l:"casual",t:"This is my place. When Dad could still teach, he brought me to watch the mist every New Year."},
   {n:"nar",t:"A cold wind rises from the valley. Baibua unfolds a small teen-chok cloth and shares half of it over the Manager's shoulders."},
   {n:"baibua",f:"sad",l:"casual",t:"Dad hurt his knee and stopped teaching two years ago. Lately the Jin Long resort next door keeps sending people to buy our whole plot of land: the camp and Mum's spa too."},
   {n:"baibua",f:"sad",l:"casual",t:"Since we won't sell, they hire thugs to cause trouble outside the massage shop every week… I don't dare tell Dad. I'm afraid he'd get up and fight them with his knee still hurt."},
   {n:"nar",t:"Baibua falls silent. Down in the valley, the lights of Chiang Mai go out one by one.",choice:[
     {t:"\"Boxing camps can stand together. Ours is here to help.\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…That's Sirichai Camp. Everyone helps each other. I'm a little jealous."}]},
     {t:"\"You don't have to carry it alone\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…When you say that, I don't know where to put my face."}]}]},
   {n:"nar",t:"The sun rises above the sea of mist. Baibua murmurs something very softly."},
   {n:"baibua",f:"flustered",l:"casual",t:"…Ai."},
   {n:"baibua",f:"flustered",l:"casual",t:"Eh! No, I didn't say anything! Let's go down, everyone will wake up and look for us."},
   {n:"nar",t:"On the way down the mountain, Baibua rides almost twice as slowly as on the way up."}]},
 isan:{ring:"northeast",venue:"Phimai Stone Castle Ring, Nakhon Ratchasima",pair:"ploy",nightBg:"mekong",
  perk:{name:"Range-Keeping Kicks",desc:"Kicks 4% more accurate · dodges 1% better",fx:{hit:{kick:.04},evade:.01}},
  letter:"To the Manager of Sirichai Camp\n\nAwesome! All four Isan belts, done! Tabtim's been watching since the first province.\n\nCome fight for the cup at the Phimai Stone Castle Ring in Korat. Three bouts, whoever wins two first takes the cup. Send one fighter to finish all of it, okay? No swapping.\n\nPick at Fights › Four Regions Cup\n\nTabtim · Mat Nak Phimai Camp (but I kick, haha)",
  again:"Manager!\n\nThe cup's still in Korat, okay? Tabtim isn't going anywhere. When you're ready, send a fighter again, old or new, either's fine.\n\nDon't be shy. Come on!\n\nTabtim",
  wait:"No worries, okay? Tabtim can wait. Whoever's hurt, rest first. — Tabtim",
 pre:[n=>`${n}! Come on! Tabtim's been waiting ages. Nobody's ever seen a Korat kicker before, haha!`,n=>`Tabtim's for real this time. Watch out for the leaping kick, okay?`,n=>`Last bout… Dad has never once come to watch me fight. Today I'm using our family's heavy Korat fists — so he sees I'm a Mat Nak too.`],
  sty:["footwork","footwork","power"],
  reply:"I'm not giving in either.",pairLine:"Whether a Korat punch is still the real thing after years away from home — see for yourself.",
 win:["Haha, awesome! But Tabtim takes the first one!","Just one more, okay? Tabtim's keeping the cup in Korat.","…"],
 lose:["Ow, that hurt a lot! You're really good. Tabtim'll get it back next time.","Haha… not funny any more. See you in the last bout.","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"Haha, the cup's still in Korat! But Sirichai Camp is fierce. Tabtim hurts all over."},{n:"tabtim",f:"flustered",l:"fight",t:"Come again, okay? Tabtim'll wait… Not missing you or anything. Just want to fight again."},{n:"nar",t:"Tabtim waves so loudly the MC has to move the mic away."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Isan title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",img:"gala_mc_hype",t:`Ladies and gentlemen! The Isan Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Tabtim runs over and hugs the Manager in the middle of the ring in front of everyone, so tight that Khun Krerk has to stand there holding the cup."},
   {n:"tabtim",f:"happy",l:"fight",t:"A loss is a loss! But I'm taking a hug back, okay? Haha… just a bit longer."},
   {n:"nar",t:"At the back, a dark-skinned middle-aged man stands still behind the crowd, nods once to Tabtim, then walks out."},
   {n:"tabtim",f:"flustered",l:"fight",t:"…Dad? Dad came to watch…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Tabtim")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That night the rocket festival along the Mun River is still going. Tabtim leads the manager away from the crowds down to the landing."},
   {n:"tabtim",f:"happy",l:"casual",t:"Tabtim's sat here since she was tiny, watching the rockets go up, thinking one day she'd kick that high."},
   {n:"nar",t:"The last rocket shoots into the sky. For the first time since you met, Tabtim goes quiet."},
   {n:"tabtim",f:"sad",l:"casual",t:"Tabtim pays for her three little siblings' school, you know… But Dad never accepted that kicking can be Korat boxing."},
   {n:"tabtim",f:"sad",l:"casual",t:"Dad came to watch today… Tabtim lost in front of him, but it's the first time he ever nodded.",choice:[
     {t:"\"Your father saw it. Your kicks are real Korat boxing\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Don't say nice things like that. Tabtim's gonna cry, okay?"}]},
     {t:"\"You already kick higher than the rockets\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"Haha, silly! …But thanks, okay."}]}]},
   {n:"nar",t:"Tabtim leans her head on the Manager's shoulder in silence until the rocket smoke fades from the sky."},
   {n:"tabtim",f:"flustered",l:"casual",t:"…Don't tell anyone Tabtim can be quiet, okay? It'd ruin my name."}]},
 central:{ring:"central",venue:"Riverside Ring, Ayutthaya",pair:"rin",nightBg:"boat",
  perk:{name:"Princess Punch",desc:"Punches 12% harder · stronger clinch defence",fx:{dmg:{punch:.12},clDef:1}},
  letter:"Dear Manager of Sirichai Camp,\n\nAll four central belts, congratulations. I watched every fight live. …Not on purpose. It was in my feed.\n\nThe title series is at the Riverside Ring in Ayutthaya, best of three. Send one fighter for the whole series, please. I don't like switching co-stars mid-story.\n\nPick at Fights › Four Regions Cup\n\nAlicia · Hanuman Lopburi Camp",
  again:"Manager,\n\nThe cup's still with me. But our fight clips are still climbing. People want a rematch.\n\nSend a fighter whenever you're ready. I can wait. …Not because of you.\n\nAlicia",
  wait:"It's fine. A fighter's health matters more than content. — Alicia",
 pre:[n=>`${n}, right? Nice to meet you. The cameras are on, so fight like everyone's watching.`,n=>`No show this time. I'll let you come in first, then answer with the punch I drilled just for you.`,n=>`The decider… I'll come right in and fight you up close. And for the record, I'm not famous for my face.`],
  sty:["footwork","counter","inside"],
  reply:"I'm here to fight, not to be on camera.",pairLine:"I've read all your punch stats. Every percentage.",
 win:["Thank you. This clip's views will explode… but don't give up next time.","One more and the cup stays in Lopburi.","…"],
 lose:["…Okay, I admit it. You're good. But don't get the wrong idea, I'm not done.","I won't delete this clip. I'll keep it to see where I slipped. See you in the last bout.","…"],
  lost:(G,J)=>[{n:"alicia",f:"happy",l:"fight",t:"The cup is still mine. Thanks for making tonight the best content of the year."},{n:"alicia",f:"flustered",l:"fight",t:"…No, wait. It's not about content. I really want to fight your camp again."},{n:"nar",t:"Alicia switches off her camera before she leaves the ring. The first time all night."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.central.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Central title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",img:"gala_mc_hype",t:`Ladies and gentlemen! The Central Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Camera flashes swarm in. Khun Krerk smiles for the cameras as he hands over the cup. Alicia pushes past the photographers and stops right in front of the Manager."},
   {n:"alicia",f:"happy",l:"fight",t:"Congratulations… And also, I haven't signed with anyone yet."},
   {n:"alicia",f:"flustered",l:"fight",t:"…Understand? You don't have to answer now."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Alicia")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That evening Alicia has rented a small boat. No crew, no photographers."},
   {n:"alicia",f:"happy",l:"casual",t:"One loop around the island. Nobody filming, nobody streaming. …I booked it after the first bout, in case I lost and needed somewhere to cry."},
   {n:"nar",t:"The boat passes Wat Chaiwatthanaram, lit in gold. Alicia takes out her phone and deletes the live app right in front of the Manager."},
   {n:"alicia",f:"sad",l:"casual",t:"Tonight isn't content. …Everyone thinks I'm famous for my looks. The sponsors think so too. Naga League sent me their contract first."},
   {n:"alicia",f:"sad",l:"casual",t:"I almost signed, you know. If I hadn't met a camp that could beat me without a single camera.",choice:[
     {t:"\"You won with your fists, not your face\"",fx:G2=>{rgMeet(G2,"alicia",3);},then:[{n:"alicia",f:"happy",l:"casual",t:"…Can you say that again? I wasn't recording."}]},
     {t:"\"No cameras tonight. Then just be Alicia\"",fx:G2=>{rgMeet(G2,"alicia",4);},then:[{n:"alicia",f:"flustered",l:"casual",t:"…That's exactly what scares me most. But okay. For tonight."}]}]},
   {n:"nar",t:"Fireflies circle the bow. Alicia doesn't say another word until the boat docks."},
   {n:"alicia",f:"flustered",l:"casual",t:"Don't get the wrong idea. I'm reinstalling the app tomorrow morning. …Maybe late morning."}]},
 south:{ring:"south",venue:"Old Town Ring, Phuket",pair:"mali",nightBg:"andaman",
  perk:{name:"Storm Over the Waves",desc:"Dodges 2% better · recovers stamina between rounds 12% faster",fx:{evade:.02,regen:.12}},
  letter:"To the Manager of Sirichai Camp\n\nAll four southern belts. Done.\n\nCome to Phuket. Three bouts, win two, take the cup. Send one fighter.\n\nPick at Fights › Four Regions Cup\n\nChaba\n\nP.S. Tell Mali that… nothing.",
  again:"Manager\n\nThe cup is still in Phuket.\n\nCome when you're ready.\n\nChaba",
  wait:"I can wait. — Chaba",
 pre:[n=>`…${n}. You come first.`,n=>`No dodging this time.`,n=>`Last bout. I'll show you "Chaiya's fine stance". Nobody backs down.`],
  sty:["counter","pressure","footwork"],
  reply:"…Not backing down either.",pairLine:"Big sis Chaba… This time Mali won't cry.",
 win:["…Tasty.","One more.","…"],
 lose:["…Good.","…Last one.","…"],
  lost:(G,J)=>[{n:"chaba",f:"happy",l:"fight",t:"…Cup stays here."},{n:"chaba",f:"flustered",l:"fight",t:"Come again. …I want you to."},{n:"nar",t:"That's all Chaba says before she walks out of the ring. Everyone at camp looks at each other."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.south.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Southern title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",img:"gala_mc_hype",t:`Ladies and gentlemen! The Southern Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Beside the ring, a young man in a wheelchair claps slowly. Chaba goes to him first, then comes back to the Manager."},
   {n:"nar",t:"Chaba grips the Manager's hand hard, says nothing, and just walks off without letting go, so you have to follow three steps."},
   {n:"chaba",f:"flustered",l:"fight",t:"…My brother. Wants to meet you."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Chaba")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That night Chaba takes the Manager on her sidecar motorbike to a beach with no tourists. The moon is just full."},
   {n:"chaba",f:"happy",l:"casual",t:"…Here. When I was small, my brother brought me to run in the sand."},
   {n:"chaba",f:"sad",l:"casual",t:"The boat capsized. My brother's leg was hurt, he couldn't fight any more. So I fight instead. Then Naga used his story in an ad. Never asked once."},
   {n:"nar",t:"Chaba throws a seashell far out to sea. A wave washes it back to both their feet.",choice:[
     {t:"\"Your brother must be really proud of you\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…That's what he says too."}]},
     {t:"Sit down beside her, quietly",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"Chaba sits down too. Their shoulders touch a little. Neither moves away."}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…Can you stay one more day? …Yeah?"},
   {n:"nar",t:"Chaba turns to face the sea the moment she finishes, but her ears are red enough to see in the moonlight."}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const TP=G.region&&G.region.trip&&G.region.trip.party,L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40&&(!TP||TP.includes(f.id))).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`Coach… ${champ} was standing a little close, wasn't she? I'm only noticing.`,mali:`Mali wants a hug too~ …Just kidding. (Not kidding.)`,
  rin:`The distance between the Manager and ${champ} just now was below the average for the whole night. Just data.`,ploy:`What's with the smiling… Nothing. I didn't say anything.`,fah:`Hey, ${champ}! The manager belongs to Sirichai Camp! …I mean, he's the camp's manager!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;if(v>0&&R.joined&&R.joined[cid]&&G.F[cid])add(G,cid,"bond",v);rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"Dear Manager,\n\nIt's getting cold in Chiang Mai, with mist every morning… I don't have any news, really. I just miss Sirichai Camp a little.\n\nWe live in the same city, after all. Drop by my camp when you're free.\n— Baibua",
 isan:"Manager!\n\nWhere did you disappear to? Tabtim watches your camp's lives every day, but you're never on camera.\n\nMiss you! (Miss the camp, I mean, not you, haha)\n— Tabtim",
 central:"Hi,\n\nYour camp's clip views dropped a little. I checked for you. Not on purpose, it just came up.\n\nIf anything's going on… you could tell me sometimes.\n— Alicia",
 south:"…The waves are rough lately.\n\nNothing else.\n\n— Chaba"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined"){for(const d of Object.keys(RG_OPP))BGIMG["rgring_"+d]=d==="chanthaburi"?"bg_region_east.webp":`bg_ring_${d}.webp`; /* v1.91.14: the belt ceremony stays in the province's own ring */
/* v1.91.133 (Man): each region has its own hotel room — "hotel_room" follows the region the camp is staying in */
if(typeof BGIMG!=="undefined")Object.defineProperty(BGIMG,"hotel_room",{configurable:true,enumerable:true,get(){const r=window.__rgHotelR;return r?`bg_hotel_${r}.webp`:"bg_hotel_room.webp";},set(v){}});
Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});}
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  /* v1.91.43 (Man): a champion's move fires like a heroine's — her weapon landing clean or a big hit when she's hurt — as a rival and in your camp, same art and effects */
  baibua:[{img:"baibua_special",w:"elbow",def:"Blooming Lotus Back Elbow",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="elbow"&&(e.crit||e.ev==="counter"||hp<45),npc:1,p:.7}],
  tabtim:[{img:"tabtim_special",w:"kick",def:"Ruby Leaping Kick",when:(e,hp)=>e.ev==="hit"&&e.w==="kick"&&(e.crit||hp<45),npc:1,p:.7}],
  alicia:[{img:"alicia_special",w:"punch",def:"Princess Uppercut",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="punch"&&(e.crit||hp<45),npc:1,p:.7}],
  chaba:[{img:"chaba_special",w:"punch",def:"Storm Fist That Calms the Waves",when:(e,hp)=>e.ev==="hit"&&e.w==="punch"&&(e.crit||hp<50),npc:1,p:.6}]});
/* v1.91.43 (Man): every champion has her own hot-form title once she fights for Sirichai */
if(typeof HOT_TITLES!=="undefined")Object.assign(HOT_TITLES,{
  baibua:{name:"Lotus in the Storm",desc:"counters more often, slightly better evasion",ctr:.06,ev:.012},
  tabtim:{name:"Isan Fire Ruby",desc:"heavier strikes, more starting HP",dmg:.07,hp:8},
  alicia:{name:"Princess on the Throne",desc:"more accurate, slightly heavier strikes",prep:.02,dmg:.05},
  chaba:{name:"The Storm Never Stops",desc:"better evasion, counters slightly more often",ev:.025,ctr:.03}});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"Kicking the bag to the drum (hard)",target:[.74,.78,.82],unit:"Accuracy"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"Pounding som tam",target:[.76,.8,.84],unit:"Accuracy"},
 central:{game:"live",partner:"rin",label:"30-second live sale",target:[9.7,11.75,13.8],unit:"Sales"},
 south:{game:"run",partner:"mali",label:"100 m sprint",pace:[6.5,6.9,7.3],unit:"Time"}};
const DUEL_TALK={
 north:{intro:"Play the drum for me… I can kick to every single beat.",rw:"Amazing… you picked a really good fighter, Manager.",rl:"Sorry, I got a little too serious.",
  win:"I lost… but that was the most fun I've had since I started fighting.",lose:"I win… Come back for a rematch, I'll be waiting."},
 isan:{intro:"A som tam contest against an Isan girl? Awesome! Tabtim won't lose at this one, okay?",rw:"Hey! How is your som tam tastier than Tabtim's!",rl:"Haha, som tam is Tabtim's home turf, okay?",
  win:"Ha ha ha, Tabtim lost to Sirichai Camp at som tam! Don't tell my mom… Can I get a consolation prize?",lose:"Tabtim wins! Tonight Tabtim makes som tam for the whole camp."},
 central:{intro:"Live-stream battle? Thirty seconds each, whoever sells more wins. …I won't go easy on you.",rw:"…How did I lose on sales to a small camp?",rl:"That's what a professional looks like.",
  win:"Okay, I admit it. Your camp really knows its audience. …Don't get the wrong idea, that wasn't praise.",lose:"I won, but your live was more fun to watch than I expected."},
 south:{intro:"…Running. Hundred metres.",rw:"…Fast.",rl:"…",
  win:"…Lost. …Tasty.",lose:"…Not enough yet, Mali."}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"Baibua arrives early with a basket of khao tom mat for the whole camp."},{n:"baibua",f:"happy",l:"casual",t:"I came to see what the camp that beat me in bout 1 is like… Everyone here helps each other."},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"Tha Sao, same as me. Want to train together?"},{n:"nar",t:"All morning Kati and Baibua drill elbows together, one countering, one slipping, until Kru Daeng has to shout for a break."}]:[]),
  {n:"nar",t:"At noon Baibua sits and watches the whole camp carry the rice pot, wash gloves and hang hand wraps out to dry, and goes quiet for a long time."},
  {n:"baibua",f:"sad",l:"casual",t:"…At my camp, I do all of this by myself, jao."},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"You hear the motorbike from the end of the lane. Tabtim waves before she's even stopped."},{n:"tabtim",f:"happy",l:"casual",t:"Visiting, okay! This is the camp that kicked Tabtim dizzy in bout 1, haha"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"Why so early… I'm not telling you to leave."},
   {n:"nar",t:"Tabtim challenges Ploy to a hundred punches each on the bag, loses by seventeen and laughs so loud the whole camp hears."}]:[]),
  {n:"nar",t:"Over lunch Tabtim tells joke after joke, until one thing slips out before she can stop it."},
  {n:"tabtim",f:"sad",l:"casual",t:"…Nobody from home has ever come to watch Tabtim fight. Not once, haha… Hey, why's everyone gone quiet?"},{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"A white van stops outside the camp. Alicia steps out alone in sunglasses and a cap."},{n:"alicia",f:"happy",l:"casual",t:"The sponsor's team has followed me with cameras all week. Let me hide here for a day. …Not to see anyone in particular."},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"Views on the bout 1 clip are up 340%. I have a graph."}]:[]),
  {n:"nar",t:"Alicia says she came to film \"A Day in a Small Camp\" but never turns the camera on once all day. She just sits folding hand wraps with everyone until evening."},
  {n:"alicia",f:"sad",l:"casual",t:"…Nobody here asks me to smile. It's strange."},{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"Chaba arrives without telling anyone and has fixed half the back fence before anyone notices."},{n:"chaba",f:"happy",l:"casual",t:"…Fence wobbles"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"Big sis Chaba! Why didn't you tell Mali you were coming~ Mali would've made snacks"}]:[]),
  {n:"nar",t:(G.pets||[]).length?"At lunch everyone sees Chaba quietly stroking the camp's pet until it falls asleep in her lap. She doesn't move her legs for half an hour.":"At lunch everyone catches Chaba sneaking rice to the sparrows outside the camp, then quickly putting on a blank face when she realises she's been seen."},
  {n:"chaba",f:"flustered",l:"casual",t:"…Don't like it. It just came to me."},{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
const DUEL={st:null,
  el(){return document.getElementById("minibag");},
  open(r,practice,after){const C=DUEL_CFG[r],F=bagFighters(G).filter(f=>C.game!=="live"||f.canon);if(!F.length){toast("Nobody is fit to duel");after&&after(null);return;}
    const pick=F.find(f=>f.id===C.partner)||F.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];
    this.st={r,cid:REGION.champId[r],id:pick.id,round:1,w:0,l:0,log:[],practice:!!practice,phase:"intro",after};
    BAG.st={phase:"duel",mode:C.game,id:pick.id,dk:C.dk||"normal",practice:true};BAG.mount();this.draw();},
  abort(){const S=this.st;this.st=null;if(S&&S.after&&S.phase!=="end")setTimeout(()=>S.after(null),0);},
  act(a,v){const S=this.st;if(!S)return;if(a==="pick"){S.id=v;this.draw();}else if(a==="go")this.startRound();else if(a==="next")this.next();
    else if(a==="end"){const after=S.after,res={w:S.w,l:S.l};this.st=null;BAG.close();after&&after(res);}},
  target(){const S=this.st,C=DUEL_CFG[S.r],i=S.round-1;return C.target?C.target[i]:null;},
  startRound(){const S=this.st,C=DUEL_CFG[S.r],cid=S.cid;
    if(C.game==="bag"||C.game==="somtam"){BAG.st={phase:"pick",mode:C.game,id:S.id,dk:C.dk,practice:true,duel:{bars:C.bars}};BAG.start();}
    else if(C.game==="live"){BAG.st={phase:"live",mode:"live",id:S.id,practice:true};LIVE.st={phase:"pick",host:S.id,item:"shirt",practice:true,duel:true};LIVE.start();}
    else if(C.game==="run"){BAG.st={phase:"run",mode:"run",practice:true};RUN.pick({id:S.id,duel:{opp:{id:cid,name:RG[S.r].champ,pace:C.pace[S.round-1]},label:`Round ${S.round}/3`}});RUN.set();}},
  /* one round finished: res.win (sprint) or res.score against the champion's mark */
  done(res,X){const S=this.st;if(!S)return;const C=DUEL_CFG[S.r],tg=this.target();
    const win=res.win!=null?res.win:res.score>=tg;S.log.push({win,score:res.score,tg});if(win)S.w++;else S.l++;
    if(LIVE.st&&LIVE.st.duel){LIVE.st=null;}
    if(C.game!=="run"){BAG.st={phase:"duel",mode:C.game,id:S.id,practice:true};S.phase="round";this.draw();}},
  next(){const S=this.st;if(!S)return;if(RUN.st){RUN.stop();RUN.st=null;}BAG.st={phase:"duel",mode:DUEL_CFG[S.r].game,id:S.id,practice:true};
    if(S.phase==="round"||DUEL_CFG[S.r].game==="run"){if(S.w>=2||S.l>=2){this.finish();return;}S.round++;S.phase="intro";this.draw();return;}this.draw();},
  finish(){const S=this.st,cid=S.cid,won=S.w>=2;S.phase="end";const out=[];
    if(!S.practice){rgMeet(G,cid,won?4:2);const du=won?5:2;G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
      const f=G.F[S.id];if(f){f.morale=Math.min(100,(f.morale||0)+(won?5:2));out.push(`${esc(f.name)} morale +${won?5:2}`);}
      if(won){G.region.duelWon=G.region.duelWon||{};G.region.duelWon[cid]=(G.region.duelWon[cid]||0)+1;}}
    S.out=out;save();this.draw();AU.sfx&&AU.sfx(won?"level":"ui");},
  dots(){const S=this.st;return `<div class="duel-dots">${[0,1,2].map(i=>{const L=S.log[i];return L?(L.win?"🟢":"🔴"):"⚪";}).join("")}</div>`;},
  fmt(v){const C=DUEL_CFG[this.st.r];return C.game==="live"?Math.floor(v)+" sold":C.game==="run"?v.toFixed(2)+" s":Math.round(v*100)+"%";},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const C=DUEL_CFG[S.r],T=DUEL_TALK[S.r],champ=RG[S.r].champ,me=G.F[S.id];
    const vs=`<div class="duel-vs"><div><img src="${faceSrc(S.id,"happy")}" alt=""><br><b>${esc(me.name)}</b></div><b class="goldt">${S.w} : ${S.l}</b><div><img src="${faceSrc(S.cid,"happy")}" alt=""><br><b>${esc(champ)}</b></div></div>`;
    if(S.phase==="intro"){const F=bagFighters(G).filter(f=>C.game!=="live"||f.canon),tg=this.target();
      el.innerHTML=`<div class="mbox px"><h2>Duel with ${esc(champ)} · ${esc(C.label)}</h2>${this.dots()}${vs}
       <p class="meta center">Round ${S.round} of 3 · first to 2 rounds wins the duel ${tg!=null?` · ${esc(champ)} scored ${this.fmt(tg)} (${C.unit})`:""}</p>
       ${S.round===1?`<b class="meta">Who duels</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-du="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>`:""}
       ${S.practice?`<p class="meta center">Practice duel · no rewards</p>`:""}
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">Give up</button><button class="btn primary" data-du="go">Start round ${S.round} ▸</button></div></div>`;return;}
    if(S.phase==="round"){const L=S.log[S.log.length-1];
      el.innerHTML=`<div class="mbox px"><h2>${L.win?"Round won!":"Round lost"}</h2>${this.dots()}${vs}
       <p class="center">${esc(me.name)} <b>${this.fmt(L.score)}</b> · ${esc(champ)} <b>${this.fmt(L.tg)}</b></p>
       <p class="center"><i>${esc(champ)}: "${esc(L.win?T.rw:T.rl)}"</i></p>
       <div class="mfoot roadbtns"><button class="btn primary" data-du="next">Next ▸</button></div></div>`;return;}
    if(S.phase==="end"){const won=S.w>=2;
      el.innerHTML=`<div class="mbox px"><h2>${won?`Duel won ${S.w}-${S.l}!`:`${esc(champ)} wins ${S.l}-${S.w}`}</h2>${this.dots()}${vs}
       <p class="center"><i>${esc(champ)}: "${esc(won?T.win:T.lose)}"</i></p>${S.out&&S.out.length?`<p class="center"><span class="rwl">${S.out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span></p>`:""}
       <div class="mfoot roadbtns"><button class="btn primary" data-du="end">Back to camp</button></div></div>`;}}};

/* v1.90 round 5: the opening gala (the week after the invitation) and the story beat after the first cup — the green-gold contract */
/* v1.91.56 (Man): a rematch series gets its own lines — the champion remembers the last time, and each bout still hints at her style (bout 1 / bout 2 / the decider) */
const RG_PRE2={
 baibua:[[n=>`Back again, jao… I'm glad you don't give up. I've drilled extra elbows every morning too. Come in close.`,n=>`${n}… I remember every punch from last time, jao. Today I'll wait at elbow range again.`,
 n=>`I watched the last tape with Dad all night, jao. He says wait even closer for the elbow.`,n=>`This khao tom mat is for after the fight, jao… elbows first. Come in close.`],
 [n=>`Bout two, jao… Last time I countered you. This time I'll counter again. Watch the spinning elbow.`,n=>`Last time my counter was half a beat late. Not this time, jao.`,n=>`The harder you come in, the harder I counter, jao.`],
 [n=>`The decider again, jao… I'm not faster by luck. I've run up the mountain every morning since last time.`,n=>`The decider with Sirichai again… I never get tired of it, jao. But my feet will be faster.`,n=>`The Tha Sao wind blows harder than last time, jao. Keep up.`]],
 tabtim:[[n=>`Back again, der! Tabtim's been counting, ha ha. Tabtim's feet are as light as ever. Catch me first.`,n=>`${n}! Tabtim missed you so much… no, no, missed the fight, ha ha. Today Tabtim will run circles round the ring till you're dizzy.`,
 n=>`The village asked when Sirichai was coming back. Tabtim said today, ha ha. Light feet ready, der.`,n=>`My little brother wrote me a fight plan. One word: "Run." Ha ha.`],
 [n=>`Tabtim jumps a hand higher than last time. Mind your head, der.`,n=>`Watch your feet, Tabtim's jumping over your head again.`,n=>`The new Red Ruby jumping kick, trained just for today, der.`],
 [n=>`The last bout again… This time Tabtim isn't running. Pure Korat heavy hands, for Dad to see one more time.`,n=>`Dad's in the front row again… Tabtim will stand and trade heavy for him, like before.`,n=>`No running this bout. Heavy hands only, like Dad taught.`]],
 alicia:[[n=>`Back again? My stream viewers are starting to know your face… I'll dance around you like last time. Keep up.`,n=>`${n} again… Don't get the wrong idea. I'm not happy to see you, the camera is. Try to keep up with me today.`,
 n=>`My team already titled the clip "The Rematch"… I hope the winner in it is me. Keep up with my feet.`,n=>`I rebuilt my footwork since last time. Don't think it was because of you.`],
 [n=>`Same as before. I wait, you come in, I counter… only this time the counter is faster.`,n=>`The stats say you come in after the second punch. That's where I'll be waiting.`,n=>`I'll wait like before. Come in and you get countered.`],
 [n=>`The decider again. I'll come right in and fight you up close, same as before. No camera will keep up.`,n=>`No show in the decider. I'm coming to you.`,n=>`Turn the cameras off. This bout I fight up close to the end.`]],
 chaba:[[n=>`…Back again. Good. You come in first.`,n=>`…Still waiting right here. ${n}, come in.`,n=>`…Come in. I can wait longer this time.`,n=>`…My brother says fight hard. …Both of us.`],
 [n=>`…No dodging. Same as before. Harder than before.`,n=>`…Forward. Only forward.`,n=>`…No backing off.`],
 [n=>`…Tha Dee Chaiya, once more. Nobody backs off.`,n=>`…Chaiya. Fast feet.`,n=>`…It ends this bout.`]],
 _nc:[[n=>`${n} again? I watched the last fight over and over. I know every beat of it.`,n=>`Back again… good. I want to beat someone who doesn't give up.`,n=>`The whole region talks about Sirichai. I want to win in front of them again.`],
 [n=>`Bout two again. I've changed my plan again.`,n=>`You remember my plan, right? I've changed it.`],
 [n=>`The decider again. Today we find out who trained harder.`,n=>`The last bout again. I don't give the cup away easily.`]]};
/* after a rematch bout: the champion's line when she wins / loses it */
const RG_POST2={baibua:{win:["Once more, jao… I'm glad we met again, but the cup stays with me.","My elbow still knows the way, jao… but you nearly had it."],lose:["…This time Sirichai read me even better, jao.","You get better every time, jao. I need to go train more."]},
 tabtim:{win:["Ha ha, Tabtim again! But that was way more tiring this time, der.","Not yet! Come again, Tabtim loves fighting this camp."],lose:["Ow, that hurt more than last time! Who taught you to kick like that!","Ha ha… not funny any more. Tabtim's getting it back."]},
 alicia:{win:["This clip will beat last time's views… because I won, not because of you.","Not your day yet. But close… that wasn't a compliment."],lose:["…Cameras off. Give me five minutes.","You really have got better… don't you dare post that."]},
 chaba:{win:["…Not yet.","…Come again."],lose:["…Better.","…That hurt. Good."]},
 _nc:{win:["I held on, but it was harder this time."],lose:["You've got a lot better since last time."]}};
/* your fighter, walking out for a rematch */
const RG_REPLY2={kati:"I've watched the tape until I know it by heart. I won't lose twice.",mali:"Last time Mali cried. This time Mali's going to smile.",rin:"I have all the data from last time. This time the numbers are on our side.",ploy:"I can't lose to the same person twice.",fah:"This time Fah gets it back. Watch!"};
/* v1.91.59 (Man): the hotel night changes with the province — a local outing in the menu, and now and then something silly happens first */
const RG_OUT={
 chiangrai:{t:"See Wat Rong Khun lit up at night",l:"Everyone shoots the White Temple until their batteries die. {g} takes forty selfies; one is usable."},
 nan:{t:"See the Whispering Lovers mural by the old wall",l:"{g} copies the Whispering Lovers mural and whispers, \"What shall we eat tomorrow?\" The group laughs until a guard comes over."},
 uttaradit:{t:"Pay respects at the Phraya Phichai Broken Sword monument",l:"Everyone wais together. {g} prays for elbows as strong as the sword, then quickly adds, \"but please not broken.\""},
 lampang:{t:"A horse-cart ride round town",l:"The horse stops to graze three times. The driver says it likes {g}, so {g} hand-feeds it grass for the rest of the ride."},
 udon:{t:"Night market by Nong Prajak",l:"{g} buys ten Isan sausage skewers to share. One makes it back to the hotel."},
 khonkaen:{t:"Eat the famous Khao Suan Kwang grilled chicken",l:"Three grilled chickens gone. {g} swears she only had a drumstick, but the bone pile is all in front of {g}."},
 buriram:{t:"See Phanom Rung lit up at dusk",l:"Everyone goes quiet when the lights come on. {g} whispers, \"If I could fight on a ring right here, just once…\""},
 ubon:{t:"See the candle carvings at Thung Si Mueang",l:"{g} tries to look as tall as the candle tower in photos, lying on the ground until her clothes are filthy."},
 lopburi:{t:"Walk by Phra Prang Sam Yot while the monkeys sleep",l:"The monkeys were not asleep. The whole troop is up, and one wears {g}'s sunglasses on the shrine roof."},
 suphan:{t:"Dinner by the Suphan river",l:"The place plays luk thung all night. {g} knows every song and the next table asks for an encore."},
 phetchaburi:{t:"Buy the famous khanom mo kaeng",l:"Ten boxes bought, all gone before the hotel. {g} insists the ants ate half."},
 chanthaburi:{t:"Walk the night gem market",l:"{g} haggles a tiny gem down until the seller gives up, then can't buy it: her wallet's at the hotel."},
 chumphon:{t:"Coffee on Thung Wua Laen beach",l:"Chumphon coffee is so strong everyone's awake till 3 a.m. {g} counts two hundred stars and starts over."},
 surat:{t:"Eat fresh oysters at the pier",l:"{g} eats her first oyster with a face like she took an elbow, then orders a second plate."},
 nakhonsi:{t:"Watch the shadow puppets by the temple",l:"The puppeteer spots a fight camp in the crowd and has two puppets box mid-story. {g} cheers louder than the whole temple."},
 songkhla:{t:"Walk Samila Beach at night",l:"{g} holds the mermaid statue's hand and swears it smiled at her. Nobody believes her."}};
const RG_ODD={
 north:[{t:"At 2 a.m. the next room won't stop singing northern karaoke. {g} goes to knock and gets pulled in to sing until dawn.",fx:"tired"},
   {t:"A swarm of flying termites pours in after the rain. {g} swats until 1 a.m. and wakes up with strangely stronger arms.",fx:"exp"},
   {t:"The housekeeper recognises {g} from the camp's live stream and brings mango sticky rice for everyone.",fx:"morale"},
   {t:"The hot water runs out at nine. {g} showers in mountain-cold water and screams so loud the owner runs upstairs.",fx:"none"},
   {t:"The fog is so thick {g} knocks on two wrong doors before finding her own room.",fx:"none"},
   {t:"The khao soi shop throws an extra egg in every bowl. The owner's a Muay Thai fan.",fx:"morale"}],
 isan:[{t:"At 1 a.m. a mor lam band starts up next door. {g} sneaks out to dance until the band pulls her on stage.",fx:"tired"},
   {t:"The air-con dies. Everyone drags their mattresses in front of one fan. {g} talks about som tam in her sleep all night.",fx:"tired"},
   {t:"The hotel auntie brings a jar of pla ra bong: \"Eat this and you punch harder.\"",fx:"morale"},
   {t:"A gecko drops from the ceiling into {g}'s sticky rice. {g} kicks the table over in fright, but the rice doesn't spill.",fx:"exp"},
   {t:"There's an ordination party next door and the whole camp gets fed until they can't move.",fx:"morale"},
   {t:"{g} sings karaoke in the lobby and scores a perfect 100. The owner offers a free beer… {g} asks for red soda instead.",fx:"none"}],
 central:[{t:"A monkey climbs into {g}'s window at midnight, steals a bunch of bananas and leaves the peels on her pillow.",fx:"none"},
   {t:"A coconut ice-cream cart circles the hotel all night playing its jingle. {g} buys one every lap.",fx:"tired"},
   {t:"The lane floods after the rain and everyone wades back. {g} calls it water running practice.",fx:"exp"},
   {t:"The hotel owner was a fighter once and tells Rajadamnern stories late into the night.",fx:"exp"},
   {t:"The all-night rice soup place recognises Sirichai and knocks half off the bill.",fx:"morale"},
   {t:"{g} locks the key in the room and has to climb the balcony to get in, the whole camp cheering below.",fx:"none"}],
 south:[{t:"It pours all night and the roof leaks right over {g}'s bed. {g} sleeps under an umbrella till morning.",fx:"tired"},
   {t:"The roti stall outside is open till 2 a.m. {g} orders six banana rotis and calls it athlete food.",fx:"morale"},
   {t:"Ghost crabs run in from the beach. {g} chases them until she drops. The crabs get away.",fx:"exp"},
   {t:"A fisherman sees the camp's sign on the van and brings grilled squid for everyone, free.",fx:"morale"},
   {t:"A town-wide blackout. Everyone tells ghost stories by torchlight on the balcony. {g} refuses to go to the bathroom alone.",fx:"none"},
   {t:"{g} tried ordering in the southern dialect. The vendor answered at such length that {g} ended up with three plates of rice.",fx:"none"}]};
const RG_ODD_FX={tired:["nobody slept much · fatigue +4",G=>{for(const f of roadRiders(G))f.fatigue=Math.min(100,(f.fatigue||0)+4);}],exp:["accidental training · experience +3",G=>{for(const f of roadRiders(G))f.exp=(f.exp||0)+3;}],
  morale:["the whole camp's in a good mood · morale +3",G=>{for(const f of roadRiders(G))f.morale=Math.min(100,(f.morale||0)+3);}],none:[null,()=>{}]};
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const RG_CID0={...RG_CID}; /* v1.91.30: the four first champions — fixed, even when a later edition crowns someone new */
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
/* v1.91.78 (Man): on a trip, only the girls who actually rode along can be in the scene */
const rgInT=(G,id)=>rgIn(G,id)&&(()=>{const P=G.region&&G.region.trip&&G.region.trip.party;return !P||P.includes(id);})();
const RG_PAIR={uttaradit:"kati",buriram:"ploy",surat:"mali",suphan:"rin"};
const rgIf=(ok,steps)=>ok?steps:[];
function rgWarn5(G,n,now){const me=G.player&&G.player.name||"Manager";return now?[
  {n:"coach",t:`${me}, come here. Naka's underground night is five on five, and we only have this many ready: ${n} fighters in camp`},
  {n:"coach",t:"I called Mr. Krirk. If a camp is short of five, the rules let one fighter go twice in the same night."},
  {n:"coach",t:"But two bouts in one night is heavy. Choose carefully who goes twice."},
  {n:"coach",t:"If there's still time, bring someone in first… five is always better."}]:[
  {n:"coach",t:`${me}, word is this Four Regions tournament ends with a five-on-five night run by Naka.`},
  {n:"coach",t:`Right now the camp only has ${n} fighters. If we mean to get that far, better find more before then.`},
  {n:"coach",t:"An old rival, or a regional champion who's close to the camp — if hearts line up, she might want to move in with us."}];}
function rgGala(G){const top=rgTopGirl(G),fah=rgIn(G,"fah"),ploy=rgIn(G,"ploy"),R=G.region,meet=(id,v)=>G2=>rgMeet(G2,id,v);return [
 {n:"nar",bg:"gala",t:"The camp's van pulls up in front of a hotel in the middle of Bangkok. A Naga Energy Drink banner three storeys high hangs above, a green-gold naga coiled at the centre, head raised high."},
 {n:"nar",t:"A life-size naga mascot waves at the door. Every time a guest walks past, it throws two punches at the air."},
 {n:"coach",t:"The last time I wore a suit was my nephew's ordination… This collar's strangling me."},
 ...rgIf(fah,[{n:"fah",f:"flustered",l:"casual",t:"You said it was a party! Why is everyone dressed for a wedding? Fah came in a tracksuit!"}]),
 ...rgIf(fah&&rgIn(G,"kati"),[{n:"kati",f:"happy",l:"casual",t:"I told you the invitation said \"smart dress\"… and Fah said \"tracksuits are smart\"."}]),
 {n:"nar",show:[],t:"The ballroom lights dim. A long drum roll starts, and the MC walks out to centre stage."},
 {n:"npc",who:"MC",t:"Welcome, everyone, to the Four Regions Cup, the first in Thailand! Please welcome the chairman of Naga Energy Drink, once the nation's Olympic medal hope… Khun Krerk!"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"A man in a dark green suit embroidered with a golden naga walks on stage, smiling wide, and gently raises a hand to quiet the applause."},
 {n:"npc",who:"Khun Krerk",t:"The Olympics was a long time ago. Today belongs to the young fighters, not to an old man who can't fight anymore."},
 {n:"npc",who:"Khun Krerk",t:"The rules are simple. Each region has four provinces. Collect all four provincial champion belts and you earn the right to challenge the regional champion. Three bouts, win two, take the cup."},
 {n:"npc",who:"Khun Krerk",t:"Camps pay their own way while collecting belts. For the cup bouts, Naga Energy covers everything… Drink Naga, never run out of gas!"},
 {n:"nar",show:[],t:"Laughter fills the room. Four spotlights fall on the stage, and the MC reads out the regional champions one by one."},
 {n:"npc",who:"MC",show:[{id:"baibua",l:"casual"}],t:"The champion of the North, the lotus with hidden thorns of Lanna… Baibua!"},
 {n:"baibua",f:"happy",l:"casual",t:"Hello… I'm Baibua, from Bua Tha Sao Camp in Chiang Mai."},
 {n:"nar",t:"So quiet that the MC has to hold the mic right up close. Baibua smiles sweetly."},
 {n:"baibua",f:"happy",l:"casual",t:"My elbows aren't very strong… it's just that people tend not to get up afterwards."},
 {n:"npc",who:"MC",show:[{id:"tabtim",l:"casual"}],t:"The champion of Isan, the Ruby of the Isan Plains… Tabtim!"},
 {n:"tabtim",f:"happy",l:"casual",t:"Hello, everybody! The air-con is freezing, colder than Korat in winter! Hahaha!"},
 {n:"nar",t:"Tabtim laughs so loud the whole room laughs with her, but all the while she's quietly pacing out the width of the ring."},
 {n:"npc",who:"MC",show:[{id:"alicia",l:"casual"}],t:"The champion of the Central Plains, the Muay Thai Princess… Alicia!"},
 {n:"nar",t:"Camera flashes light up the whole room. Alicia smiles at every lens, one by one, without missing a single one."},
 {n:"alicia",f:"happy",l:"casual",t:"Thank you. Thank you, everyone. I'm not here for photos this year. I'm here to win."},
 {n:"npc",who:"MC",show:[{id:"chaba",l:"casual"}],t:"And the champion of the South, the Typhoon Fist… Chaba!"},
 {n:"chaba",f:"happy",l:"casual",t:"…I came to fight, not to talk."},
 {n:"nar",t:"The room goes silent for three seconds, then the MC hurriedly calls for applause."},
 {n:"nar",t:"Once the opening is over, the four champions step down from the stage and head straight for Sirichai's table.",choice:[
   {t:"Greet Baibua first",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"The real manager of Sirichai Camp… I watch your camp's fight lives every single time."}]},
   {t:"Greet Tabtim first",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Manager! Tabtim recognises you! Your camp's lives are so much fun!"}]},
   {t:"Greet Alicia first",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh, the camp everyone talks about. You look more ordinary than in the clips. …That's a compliment."}]},
   {t:"Greet Chaba first",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…Chaba."},{n:"nar",t:"Chaba nods once, then stays standing there longer than she needs to."}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"You're Kati, aren't you? Tha Sao, same as me… I've heard your name for a long time."},{n:"kati",f:"flustered",l:"casual",t:"I-I've heard of you too, Big sis Baibua! That reverse spinning elbow everyone talks about…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"Oh! So this is Ploy of the Korat punch — one of our own who made her name at a Chiang Mai camp. Tabtim wants to take one of those punches!"},{n:"ploy",f:"happy",l:"casual",t:"…If you want to try, get in the ring."}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"You're the one who read a fourteen-page contract before signing, right? That clip got more views than my fight clips."},{n:"rin",f:"happy",l:"casual",t:"Of course I read it. The small print at the end of a contract is usually the most expensive part."}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"Big sis Chaba!! It's you, isn't it! It's Mali! Little Mali from Chaiya!"},{n:"chaba",f:"happy",l:"casual",t:"…Wrong person."},
   {n:"nar",t:"Chaba turns and walks off, but Mali catches her ears turning red all the way down her neck."},{n:"mali",f:"sad",l:"casual",t:"…It's not the wrong person. Mali remembers."}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"Wait! Baibua has Kati, Tabtim has Ploy, Alicia has Rin, Chaba has Mali… and Fah?! Why doesn't Fah get a single style sibling!"},
   {n:"coach",t:"Then give your style a name yourself."}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"all four champions")}]:[]),
 {n:"npc",who:"MC",img:"gala_mc_hype",show:[],t:"And one more big announcement! Naga Energy presents a special guest camp that will fight in every region… Vector Camp, Bangkok!"},
 {n:"nar",t:ploy?"Pailin walks onstage in a purple-and-black suit. Her gaze sweeps the room and stops on Ploy longer than anyone else.":"Pailin walks onstage in a purple-and-black suit. Her gaze sweeps the room and stops at the Sirichai table."},
 {n:"pailin",f:"happy",t:"Every camp in this room is already on my tablet. …Enjoy the trip."},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"Khun Krerk walks over and shakes Pailin's hand, patting her shoulder twice, like two people who have known each other far longer than anyone here knows."},
 {n:"nar",show:[],t:"The photographer calls every camp up for a group photo in front of the naga banner."},
 {fx:G2=>{for(const r of RG_ORDER)rgTouch(G2,RG_CID[r]);}},{n:"coach",t:"Right, back to training. Sixteen belts don't come from looking sharp in a suit."}];}
/* the week after the first cup: the green-gold contract */
const RG_C1_CALL={
 north:["You got the green envelope too, Manager… Clause fourteen point three. I tripped over it as well.","When Vector came to buy my camp, their contract had a clause just like this. Exactly the same wording."],
 isan:["Manager! Did you get a green envelope too? Tabtim couldn't finish it, but my little brother studies law and he says clause fourteen is weird.","And guess what! Vector sent Tabtim a contract at the start of the year, and it had the exact same clause!"],
 central:["Has the green-gold envelope reached you yet? My manager says sign it, but I've read clause 14.3…","I know that sentence. Vector sent me an offer before the tour, and it uses the same words, letter for letter."],
 south:["…The green envelope came, didn't it.","Vector sent me a contract before the tour. Same clause, same words. …That's no coincidence."]};
function rgCup1(G,r){const cid=RG_CID[r],rin=rgIn(G,"rin"),R=G.region,L=RG_C1_CALL[r];return [
 {n:"nar",bg:"camp",t:"A sealed green-gold envelope arrives at the camp, the naga crest pressed in wax at its centre."},
 {n:"nar",t:"\"Cup Holder Agreement, Four Regions Cup.\" Naga Energy asks every camp that wins a cup to sign for promotional appearances, with a copy of a ฿30,000 appearance cheque attached as a preview."},
 {n:"coach",t:"Thirty thousand just to shoot an ad? Sign it! …Although the print is awfully small."},
 ...(rin?[{n:"rin",f:"happy",l:"casual",t:"Wait. Give me fifteen minutes."},
   {n:"nar",t:"Fifteen minutes turns into an hour. Rin reads all twenty-two pages and leaves seven red marks."},
   {n:"rin",f:"sad",l:"casual",t:"Page 19, clause 14.3: \"All fight data, images and voices of the fighters under contract become the property of the company and its affiliates, with no time limit.\""},
   {n:"rin",f:"sad",l:"casual",t:"No time limit means forever. And it never says who the \"affiliates\" are."},
   {n:"rin",f:"happy",l:"casual",t:"Thirty thousand for every fight of everyone in this camp, for life… per fight, that's cheaper than a coffee."}]
  :[{n:"coach",t:"…Hold on. Page 19, clause 14.3: \"All fight data, images and voices of the fighters under contract become the property of the company and its affiliates, with no time limit.\""},
   {n:"coach",t:"\"No time limit\"… I'm not much of a reader, but I know that means forever."}]),
 {n:"nar",t:`That night the camp phone rings. On the other end: ${RG[r].champ}`},
 {n:cid,f:"sad",l:"casual",t:L[0]},{n:cid,f:"sad",l:"casual",t:L[1]},
 rin?{n:"rin",f:"sad",l:"casual",t:"Vector's contract and the organiser's were drafted by the same person."}:{n:"coach",t:"Vector's contract and the organiser's look exactly alike… I don't like the smell of this."},
 {n:"nar",t:"The green-gold envelope sits on the office desk. What to do with it?",choice:[
   {t:"Send it back with clause 14.3 struck out",fx:()=>{R.c1="edit";},then:[
     rin?{n:"rin",f:"happy",l:"casual",t:"I'll write a note to go with it. Polite, but clear."}:{n:"coach",t:"Hand me the red pen. I'll strike it out myself."},
     {n:"nar",t:"Three days later Naga Energy calls to say thank you. The voice is still smiling, but nobody mentions the cheque again."}]},
   {t:"Keep it for now. We're not signing anything.",fx:()=>{R.c1="hold";},then:[
     {n:"coach",t:"Good. Nothing in this world is free, least of all something handed over with a smile that never stops."}]}]},
 {n:"nar",t:"The green-gold envelope goes into the office drawer, right next to the old Golden Helmet boss's loan contract."}];}
/* v1.90 round 6: the North in full — the first arrival, the Tha Sao shrine at Uttaradit (Kati's story), a richer visit, the letter after the cup and Baibua's chats.
   คำเมือง lines are drafts for Man to check. The other regions follow in rounds 7–9 (same hooks). */
const RG_ARRIVE={
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgInT(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`The camp's van stops for fuel at the last petrol station before ${D.name}. Mist still hangs low over the mountains.`},
  {n:"nar",t:"An old motorbike is parked in front of the coffee kiosk. A pink-haired girl stands hugging a big rattan basket."},
  {n:"baibua",f:"happy",l:"casual",t:"You're here, jao! I heard Sirichai Camp was coming to collect the northern belts, so I rode out to wait for you."},
  {n:"baibua",f:"happy",l:"casual",t:"Khao tom mat, jao. I wrapped them myself at four this morning. There's enough for everyone."},
  {n:"nar",t:"Everyone gets a khao tom mat, each tied neatly with the same bamboo strip, except the Manager's, which is tied in a little bow.",choice:[
    {t:"Ask why this one has a bow",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"N-no reason, jao! My hands just tied it that way… eat, jao, it's really good."}]},
    {t:"Say it's the prettiest wrap of all",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"You noticed, jao… I put the most care into that one."}]},
    {t:"Say thanks and eat quietly",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"Is it good, jao? …Good. I'm glad."}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"And… sorry about the gala, jao. I spoke too softly. The MC had to hold the mic right up to my mouth."},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"Don't worry, Big sis Baibua! Everyone in the room heard the elbow part loud and clear."},{n:"baibua",f:"flustered",l:"casual",t:"…That part I said loudly on purpose, jao."}]),
  {n:"baibua",f:"happy",l:"casual",t:`The champion of ${D.name}, I've fought her before, jao. She starts fast, so be careful in round one. By round three she starts to tire.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} notes down Baibua's tips on her phone · morale +3`:"Everyone notes down Baibua's tips."},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Baibua")}]:[]),
  {n:"coach",t:"The khao tom mat is better than the shop by the camp… don't tell Auntie Daeng."},
  {n:"nar",t:"Baibua waves the van out of the petrol station, then follows on her motorbike all the way to the arena."}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgInT(G,"kati");return [
  {n:"nar",t:"Before heading back, Baibua takes the whole camp to the Tha Sao teachers' shrine: an old wooden shrine under a bodhi tree, with a worn pair of gloves hanging beside the altar."},
  {n:"baibua",f:"happy",l:"casual",t:"This is where Tha Sao boxing was born, jao. Dad brought me here to pay respects every year, before he hurt his knee."},
  ...(kati?[
   {n:"nar",t:"Kati stands in front of the shrine longer than anyone, then slowly steps back and sits on the stairs."},
   {n:"kati",f:"sad",l:"casual",t:"…I'm not sure I have the right to bow here."},
   {n:"kati",f:"sad",l:"casual",t:"My Tha Sao was learned by watching. Grandpa Chai used to watch Tha Sao masters at temple fights, remembered it all and taught me. Nobody ever formally accepted him as a student."},
   {n:"kati",f:"sad",l:"casual",t:"Baibua's Tha Sao comes straight down the line, from her dad, from her grandpa… and me, I just copied the moves.",choice:[
     {t:"\"Grandpa Chai watched until he knew every move. That's loving Tha Sao boxing.\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…Grandpa really did remember every move. When I was little, I'd see him practising Tha Sao alone behind the camp every evening."}]},
     {t:"\"Why not ask Baibua?\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"Ask me, jao."}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"Kati… you know, I'm jealous of you."},
   {n:"kati",f:"surprised",l:"casual",t:"You're jealous of me?!"},
   {n:"baibua",f:"sad",l:"casual",t:"I got my moves from Dad, it's true, but these days I carry the camp alone, train alone, eat with Dad, just the two of us… nobody helps, jao."},
   {n:"baibua",f:"happy",l:"casual",t:"Kati has Kru Daeng, the Manager, the whole camp watching over her. Her Tha Sao didn't come from one teacher. It came from everyone at the camp."},
   {n:"baibua",f:"happy",l:"casual",t:"Boxing doesn't live in your blood, jao. It lives in the people who still fight it… let's pay our respects together."},
   {n:"nar",t:"Kati and Baibua kneel before the shrine together and bow three times. The breeze gently sways the old gloves beside the altar."},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…Big sis Baibua, let's come and pay respects together again next year."},
   {n:"baibua",f:"happy",l:"casual",t:"I promise, jao."},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"Kati morale +5 · Kati and Baibua grow closer"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"This year I came alone, jao… thank you for keeping me company."},
   {n:"nar",t:"The Manager raises their hands in a wai to the shrine, following Baibua. The breeze gently sways the old gloves beside the altar.",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer (v1.91.119: to the Jin Long resort, was Vector), in a letter */
const RG_POST={
 north:"Dear Manager of Sirichai Camp, jao,\n\nI've given the Jin Long resort my answer, jao: the Bua Tha Sao land is not for sale. Not the camp, not the spa, not Mum's lotus pond.\n\nDad asked where I found the nerve. I told him, \"Nobody can push us around. Look at Sirichai Camp, jao.\" Dad laughed for the first time in two years, jao.\n\nThe cup is with Sirichai Camp now, but the heart of Tha Sao boxing is still here in Chiang Mai. Come up and visit me and Dad sometime, jao.\n\n— Baibua"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["The mist is so thick this morning, jao. Are you up yet, Manager?",[["Up already, about to watch the kids train.",1,"So hard-working, jao. I'm about to go train too."],["Not yet. I'm typing this with my eyes closed.",2,"Hehe, eyes closed and every word spelled right. Impressive, jao."],["Drive carefully in fog like this.",2,"…I'll be careful. Thank you for worrying about me."]]],
   ["Dad asked me to ask how long Sirichai Camp has been open, jao.",[["Since Grandpa Chai's day — over forty years.",1,"Oh, Dad says that's older than Bua Tha Sao Camp, jao."],["I'll show you the old photos at the camp sometime.",2,"Really? I'll be waiting!"],["Why do you ask?",0,"Nothing, jao. Dad was just curious."]]],
   ["I have to go train now, jao… let's leave it here for now.",[["Go on, we'll talk after training.",2,"Yes! I'll message you as soon as I'm done."],["Don't overdo it.",1,"Yes, I always stretch first."],["OK",0,""]]]]},
  {id:"bb_dad",x:[
   ["Dad walked around the camp twice today, jao! The doctor says his knee is getting better.",[["That's great news!",1,"Thank you, jao. I was so happy I cried."],["Tell him the whole of Sirichai is cheering for him.",2,"I told him, jao. He smiled and said that camp has a kind heart."],["Don't let him overdo it.",1,"Yes. I walk right beside him the whole time."]]],
   ["Dad wants me to go back to school and stop fighting… what do you think, Manager?",[["Ask your own heart what you want first.",2,"…My heart wants to fight, jao. I already knew. I just wanted to hear someone say it."],["You could study and fight at the same time.",1,"Can I really? …I'll think about it."],["Your dad's right.",0,"…Yes. I'll think about it."]]],
   ["Thank you for listening, jao. I don't have many people to tell this to.",[["You can tell me anything.",2,"…Then I'll tell you things often. No getting annoyed."],["Always",1,"Yes, thank you, jao."],["No problem",0,""]]]]},
  {id:"bb_food",x:[
   ["I made a huge pot of gaeng hung lay, jao. Dad and I can't finish it.",[["Send some to the camp!",2,"Sure! I'll post it… can you post curry, jao?"],["That sounds delicious.",1,"It's so good, jao. My mum's recipe."],["Put it in the fridge.",0,"Yes, I was going to put it in there."]]],
   ["What's your favourite food, Manager?",[["Baibua's khao tom mat.",2,"…If you say that, I'll wrap them for you every week, jao."],["The chicken rice by the market.",1,"The one Kati likes? I'll go try it too."],["Anything",0,"Eating anything is good too, jao."]]],
   ["We both live in Chiang Mai and you've never eaten at my secret khao soi place. I'll take you one day.",[["Promise",2,"Promise! I've never taken anyone there."],["Bring the whole camp.",1,"Sure! But the shop only has two tables, hehe."],["If I'm free",0,"Yes, if you're free."]]]]},
  {id:"bb_elbow",x:[
   ["I practised the reverse spinning lotus elbow a hundred times today, jao. My arm's about to fall off.",[["Great work, but rest a little too.",2,"Yes… if someone tells me to rest, I'll rest, jao."],["Could you teach Kati too?",1,"Sure! But Kati has to teach me her moves too."],["A hundred isn't many.",0,"…You're stricter than my own teacher, jao."]]],
   ["Did you know, Manager? Dad came up with this elbow when he saw a lotus blooming in the temple pond.",[["Beautiful, just like Tha Sao boxing.",2,"Yes… Dad's boxing is truly beautiful. I want the whole country to see it."],["Do lotuses even have thorns?",1,"They don't! Other people started calling me that, I didn't choose it, hehe."],["Lotus flowers are nice.",0,""]]],
   ["If I ever meet Kati in the ring one day, who will you cheer for, jao?",[["Baibua, quietly.",2,"…Don't tell Kati, jao. I'll cheer for you quietly too."],["Both of you.",1,"Good answer, jao… I'd cheer for Kati too."],["Kati, obviously.",0,"Hehe, that's the right answer, jao."]]]]},
  {id:"bb_vector",x:[
   ["Jin Long resort sent someone again, jao. They raised their offer for the land by another two million.",[["Don't decide on your own yet.",2,"…Yes. I'll talk to you before I decide anything, every time."],["Bua Tha Sao Camp isn't for sale.",2,"That's exactly what Dad said, jao… I'm glad to hear someone else say it."],["Two hundred thousand is a lot.",0,"…Yes. I know."]]],
   ["Sometimes I think if we sold the land, the thugs would finally leave Mum and the massage ladies alone.",[["There are other ways. I'll help you look.",2,"…You're really thinking it through with me. Thank you, jao."],["I know how hard that is.",1,"Yes… thank you for understanding."],["It's one option.",0,""]]],
   ["Talking to you makes my heart feel lighter, jao… I don't know why.",[["Because you're not carrying it alone anymore.",2,"…Yes. I'm not carrying it alone anymore."],["Message me anytime.",1,"Yes! I'll message you often, jao."],["Good",0,""]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgInT(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"A straight road runs through the rice fields as far as the eye can see. Ahead, a motorbike sits smoking outside an abandoned petrol station, and a red-haired girl stands in the middle of the road waving with both arms."},
  {n:"tabtim",f:"happy",l:"casual",t:"Stop, stop, stop! Is this Sirichai Camp? It's Tabtim! Tabtim's bike just broke down. Give Tabtim a lift to the ring!"},
  {n:"nar",t:"Before anyone can answer, Tabtim opens the front door and climbs into the passenger seat as if it were hers."},
  {n:"tabtim",f:"happy",l:"casual",t:"Tabtim's sitting in front, car sick… not really car sick, just want to sit near you, haha. Joking, joking. Take Tabtim as your girlfriend. Joking again!",choice:[
    {t:"\"Joking twice means it's not a joke.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Whoa! You answered seriously. Tabtim's out of jokes now."}]},
    {t:"Laugh and keep driving",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Haha, you're so calm. Tabtim likes calm people."}]},
    {t:"\"Put your seatbelt on.\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"Okay, okay… geez, Manager, you're so serious."}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Tabtim")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"Eh! Is that Ploy in the back? Ploy of the Korat punch, from our own home turf! Tabtim's been wanting to take one of those since the launch party!"},
    {n:"ploy",f:"pout",l:"casual",t:"…Face the front. You'll hurt your neck."}]),
  {n:"nar",bg:"somtam_stall",t:"Tabtim talks the whole way, then makes them stop at a roadside som tam stall. \"Best in the region, and Tabtim's paying!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`The champion of ${D.name} is from near Tabtim's home. She kicks hard but drops her left guard, so counter with a left kick.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Tabtim's tips · morale +3`:"Everyone remembers Tabtim's tips."},
  {n:"coach",t:"The som tam here is so spicy Kru's crying… but it's really good."},
  {n:"tabtim",f:"happy",l:"casual",t:"Let's go, everyone! Tabtim will cheer by the ring… not saying which side, haha."}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgInT(G,"ploy");return [
  {n:"nar",t:"Same night, same ring: on the undercard before our bout, a Vector Camp fighter wins by knockout in round two."},
  {n:"npc",who:"Vega",t:"The data said he'd raise his guard late in round two. …Data never lies."},
  ...(ploy?[
   {n:"npc",who:"Ringside gambler",t:"That Korat girl — she's been at a Chiang Mai camp so long. Is her Korat punch still the real thing, or just the name?"},
   {n:"nar",t:"The people around them laugh. Ploy hears every word, but doesn't turn around."},
   {n:"pailin",f:"happy",t:"Ploy, come to Vector with me. Nobody here sees you as Korat boxing. At Vector, you're the best data I've ever had."},
   {n:"npc",who:"Vega",t:"Big sis Ploy… your training room is still empty. Nobody dares use it."},
   {n:"ploy",f:"angry",l:"casual",with:"pailin",t:"Pailin, I'm not answering with words."},
   {n:"nar",t:"Ploy walks to the warm-up corner, picks up a pair of pads and hands them to Tabtim, who's been watching."},
   {n:"ploy",f:"happy",l:"casual",t:"Hold these for me. Hold them tight."},
   {n:"nar",t:"One swinging Korat punch. It's so loud the whole corner turns to look, and Tabtim staggers three steps back."},
   {n:"tabtim",f:"surprised",l:"casual",with:"ploy",t:"Ow! Tabtim's hand is numb up to the elbow… that's the real thing, everyone! The real deal!"},
   {n:"npc",who:"Ringside gambler",t:"…The real thing."},
   {n:"pailin",f:"sad",t:"…My data has never been able to measure that punch."},
   {n:"nar",show:[{id:"pailin"},{id:"ploy",l:"casual",f:"sad"}],t:"Pailin turns and leaves with Vega, but stops to look back at Ploy once more before the door.",choice:[
     {t:"\"That punch is Ploy's own. Nobody else's.\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"flustered",l:"casual",t:"…I knew that without you saying it. But hearing it… thank you."}]},
     {t:"\"Your sister still cares about you.\"",fx:G2=>add(G2,"ploy","bond",1),then:[{n:"ploy",f:"sad",l:"casual",t:"I know… she worries about me the way she worries about a dataset. The day she worries about me like a sister, I'll go back and talk."}]}]},
   {fx:G2=>{const p=G2.F.ploy;if(p)p.morale=Math.min(100,(p.morale||0)+5);rgMeet(G2,"tabtim",1);G2.flags.ployKorat=1;}},
   {n:"nar",t:"Ploy morale +5"}]
  :[{n:"pailin",f:"happy",t:"Sirichai Camp has gone further than my data said it would. …Interesting."},
   {n:"tabtim",f:"happy",l:"casual",t:"Data, data, data. Bangkok people really love their data. Tabtim says som tam is better, haha."},
   {fx:G2=>rgMeet(G2,"tabtim",1)}])];}};
RG_POST.isan="To Manager,\n\nDad came home and didn't say a word for three days.\n\nOn the fourth day he left his old sash by Tabtim's pillow, the one he fought in when he was young. All he said was, \"If you're going to kick, kick all the way.\"\n\nTabtim cried all night. Don't tell anyone.\n\nThe cup is at Sirichai now. Look after it, because Tabtim's coming to take it back one day, haha.\n\n— Tabtim";
RG_CHAT.tabtim=[
 {id:"tt_fee",x:[
  ["Manager! Tabtim's little sister got into university!!",[["Congratulations! You did so well getting her this far.",2,"…Hey, you praised Tabtim instead of her. Now Tabtim's going to cry."],["Shall we celebrate?",1,"Moo kratha for the whole village! You're paying half, haha."],["What's she studying?",1,"Law! Same one who read the green envelope contract."]]],
  ["But tuition is so expensive… Tabtim has to win a lot more fights.",[["Don't carry it alone. Tell me if you need anything.",2,"…You're so kind. Tabtim's not used to it."],["You'll win, your kicks are brutal.",1,"Haha, right! Tabtim's kicks pay tuition."],["There are scholarships too.",1,"Yeah! Tabtim'll go ask her."]]],
  ["Off to train! Ten kicks, each one's worth a textbook, haha.",[["Go for it.",1,"Fighting!"],["Kick one for me too",2,"Sure! The eleventh kick is for you, Manager."],["Don't forget to rest.",1,"Okay, okay. You worry so much."]]]]},
 {id:"tt_somtam",x:[
  ["Tabtim taught the girls at camp to make som tam with twenty chillies. One of them cried, haha.",[["Twenty chillies is brutal!",1,"Harsh? Isan people eat thirty chillies, no big deal."],["Send the camp the recipe.",2,"Sure! But don't tell Auntie Taew. It's Tabtim's secret family recipe."],["Is she okay?",1,"She's fine. Drank three bottles of water and now she's teasing Tabtim back."]]],
  ["Can you eat spicy food, Manager?",[["Easily.",1,"Really? Next time Tabtim'll pound ten chillies for you to try!"],["A little.",1,"No problem, Tabtim will make a mild one. Specially, just for you."],["I can if Tabtim makes it.",2,"…Ugh, Manager! Say that and Tabtim can't pound straight anymore."]]],
  ["Off to sell som tam at the morning market. For my sister's tuition!",[["Sell well!",1,"Sold out!"],["Save me a mortar's worth.",2,"Tabtim saved you one, with extra pla ra!"],["OK",0,"Yeah!"]]]]},
 {id:"tt_live",x:[
  ["Tabtim watches your camp's lives every day. It's so fun. Is Kru Daeng really that scary?",[["Scary face, kind heart.",1,"Right! Scary face, but sneaks the kids snacks. Tabtim saw it on the live."],["You watch the lives every day?",2,"…Huh, how is Tabtim supposed to answer that? Yes, every day. Happy now?"],["Really scary. Watch out or you'll be running laps.",1,"Haha, Tabtim will come run laps at your camp one day."]]],
  ["Someone commented on the live that Tabtim has the prettiest kicks in Isan!",[["It's true.",2,"…Haha, did you write it yourself? That account name looks suspicious."],["Whoever wrote that has a good eye.",1,"They've got a good eye! Tabtim's going to like that comment."],["Don't read the comments too much.",1,"Haha, I know, but the nice comments are okay to read."]]],
  ["You're definitely going on camera in the next live. Tabtim will be watching.",[["I'll wave.",2,"Wave away, Tabtim will wave back… even if you can't see it."],["I'm camera-shy.",1,"Don't be shy, your face is fine, haha."],["No promises.",0,"Aww!"]]]]},
 {id:"tt_dad",x:[
  ["Dad called today to ask if Tabtim had eaten… he's never called before.",[["Your dad's starting to open up.",2,"…That's what Tabtim thinks too. Tabtim told him yes, even though Tabtim hadn't eaten yet, haha."],["So have you eaten?",1,"Not yet! You asked just like Dad."],["I'm glad",1,"Thanks. Tabtim's been smiling all day."]]],
  ["Do you think Dad will come to watch Tabtim fight one day?",[["He'll come for sure, if you keep kicking like that.",2,"…Then Tabtim will keep kicking until Dad comes to watch."],["Invite him.",1,"Yeah, Tabtim'll try inviting him… and if Dad doesn't come, you come instead."],["I'm not sure.",0,"…Okay"]]],
  ["Thanks for listening. You're the only one Tabtim can talk to about this.",[["You can tell me anytime.",2,"…Haha, not funny anymore. Tabtim's embarrassed."],["Always",1,"Thanks!"],["No problem",0,"Okay"]]]]},
 {id:"tt_kick",x:[
  ["Tabtim's flying kick is a hand-span higher than before! Almost reaching the light bulb!",[["Don't break the light bulb.",1,"One already broke, haha. Don't tell Dad."],["Higher than the rockets yet?",2,"…You still remember the rockets? Tabtim's so happy."],["Great job",1,"Tabtim's amazing, right? More praise, more!"]]],
  ["If Tabtim met Ploy in the ring, who do you think would win?",[["Tabtim wins on kicks, Ploy wins on punches.",2,"Nobody gets upset with that answer. You're so smart."],["Ploy, she's from our camp.",1,"Ugh! Siding with your own camp. Tabtim's telling Ploy."],["I don't know",0,"Such a middle-of-the-road answer. No fun at all."]]],
  ["Back to training! A hundred more kicks!",[["Kick one for me too",2,"The hundredth kick is for you!"],["Don't overdo it.",1,"I know, I know"],["OK",0,"Yeah!"]]]]}];
CHAT.tabtim=RG_CHAT.tabtim;
/* v1.90 round 8: the South in full — Chaba's sidecar at the bus terminal, Mali's home at Chaiya and the pier at Don Sak (Mali's story), a richer visit, the letter after the cup and Chaba's chats. Southern lines are drafts for a native speaker to check. */
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgInT(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"bus_terminal",t:"After driving all night, the camp's van pulls into the bus terminal at dawn. By the exit, a faded sidecar motorbike is parked all alone."},
  {n:"chaba",f:"happy",l:"casual",t:"…The guesthouse is down a lane. Big vans can't get in. Sidecar. One at a time."},
  {n:"nar",t:"Chaba points at the sidecar seat and looks only at the Manager, without explaining anything.",choice:[
    {t:"Sit where Chaba points",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"Chaba rides slower than she needs to. She says nothing the whole way, but swerves around every pothole."}]},
    {t:"Ask why she picked you first",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"chaba",f:"flustered",l:"casual",t:"…Don't ask. Get on. Quick."}]},
    {t:"Let someone else go first",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…Fine. Next run."},{n:"nar",t:"On the last run, Chaba comes back for the Manager alone, even though everyone else has already arrived."}]}]},
  ...(top&&top.id!=="mali"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Chaba")}]:[]),
  ...rgIf(mali,[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"Big sis Chaba! Mali gets the second ride! You used to give Mali sidecar rides when we were little!"},
    {n:"chaba",f:"happy",l:"casual",t:"…Wrong person."},{n:"nar",t:"But on the second run it's Mali in the sidecar, and Chaba takes a loop along the beach that nobody asked for."}]),
  {n:"chaba",f:"happy",l:"casual",t:`${D.name}… The champion hits hard but moves slowly. …Go in from round three.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Chaba's tips · morale +3`:"Everyone remembers Chaba's tips."},
  {n:"coach",t:"She really doesn't talk much… but every word counts."}];};
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgInT(G,"mali");return mali?[
  {n:"nar",t:"The morning after the bout, Mali asks to stop in Chaiya. \"Mali's house is right on the way!\" In fact it's a forty-kilometre detour."},
  {n:"nar",t:"At Mali's mother's house, her three younger siblings run out to hug her, and her mother sets out khao yam until the bench is full."},
  {n:"npc",who:"Mali's mom",t:"You're here! Eat first, all of you… Oh? And why is that girl standing out in front of the house?"},
  {n:"nar",show:[{id:"chaba",l:"casual"}],t:"Chaba leans against her motorbike outside the gate and won't come in, even when Mali's mum calls her twice."},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"Big sis Chaba… when Mali was six, you just disappeared without saying goodbye. Mali waited for you in front of the house every evening."},
  {n:"chaba",f:"sad",l:"casual",t:"…"},
  {n:"nar",bg:"pier_south",t:"That afternoon at Don Sak pier, while they wait for the boat, Chaba comes and sits beside Mali at the end of the pier."},
  {n:"chaba",f:"sad",l:"casual",t:"That year my brother's boat capsized. His leg never got better. Mum moved us to Phuket that same night. Doctors. Work."},
  {n:"chaba",f:"sad",l:"casual",t:"I didn't forget you, Mali. …Just didn't know how to say it. The longer it got, the harder."},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"…Why didn't you send even one letter? Mali could read by then.",choice:[
    {t:"\"It's not too late, for either of you.\"",fx:G2=>{add(G2,"mali","bond",2);rgMeet(G2,"chaba",1);},then:[{n:"chaba",f:"flustered",l:"casual",t:"…Not too late."}]},
    {t:"Stay quiet and let them talk",fx:G2=>{add(G2,"mali","bond",1);rgMeet(G2,"chaba",2);},then:[{n:"nar",t:"The Manager steps back and stands at a distance. For a long time, waves against the pier posts speak instead of them."}]}]},
  {n:"chaba",f:"flustered",l:"casual",t:"…I wrote. Eleven letters. Never sent one. Still in the drawer."},
  {n:"mali",f:"surprised",l:"casual",t:"Eleven letters?! …Big sis Chaba, send all of them to Mali! No more keeping them!"},
  {n:"nar",t:"Mali laughs and cries at the same time. Chaba reaches up and pats Mali's head twice, just like when Mali was little."},
  {n:"chaba",f:"happy",l:"casual",t:"…You got bigger, Mali. Still a crybaby."},
  {n:"mali",f:"happy",l:"casual",t:"I'm not a crybaby anymore! …Okay, a little."},
  {fx:G2=>{add(G2,"mali","bond",2);const m=G2.F.mali;if(m)m.morale=Math.min(100,(m.morale||0)+5);rgMeet(G2,"chaba",2);G2.flags.chabaMali=1;}},
  {n:"nar",t:"Mali morale +5 · Mali and Chaba have made up"}]
 :[{n:"nar",bg:"pier_south",t:"Before heading back, Chaba takes the Manager to sit at the end of the Don Sak pier, waiting for the last ferry."},
  {n:"chaba",f:"sad",l:"casual",t:"…When I was little there was a girl next door in Chaiya. Cried a lot. We moved and I never said goodbye."},
  {n:"chaba",f:"happy",l:"casual",t:"She must be grown now. …Probably boxing somewhere."},
  {fx:G2=>rgMeet(G2,"chaba",2)}];}};
RG_POST.south="Manager,\n\nTold Naka to take down the ad that used my brother's story.\n\nThey took it down.\n\nMy brother says thank you to Sirichai Camp. He says the day he watched from his wheelchair by the ring was the best day since the boat.\n\nThe cup is yours now. Look after it.\n\n— Chaba\n\nP.S. Sent Mali the eleven letters.";
RG_CHAT.chaba=[
 {id:"cb_sea",x:[
  ["…Big waves today.",[["Be careful if you go out to sea.",2,"…Not going out. Staying home. Thinking… never mind."],["Training on the sand?",1,"Ran already. Ten laps."],["Mm",0,"…"]]],
  ["My brother said to message you.",[["Your brother's so kind.",1,"…He said to. Not me."],["I'm glad you messaged.",2,"…I know."],["Something up?",0,"Nothing."]]],
  ["Going to train.",[["Go on, and message me again.",2,"…Mm."],["Go go!",1,"Mm."],["OK",0,"…"]]]]},
 {id:"cb_bro",x:[
  ["My brother stood up for ten seconds. Today.",[["Amazing! Tell him I said so.",2,"Told him. He cried. …Me too. A little."],["He's getting better and better.",1,"…Mm. Doctor says so."],["Only ten seconds?",0,"…Ten seconds is long."]]],
  ["My brother wants to see Sirichai Camp.",[["Anytime. I'll build a ramp for him.",2,"…A ramp. Will tell him. He'll be happy."],["He's always welcome.",1,"Mm, thanks"],["It's far",0,"…I know."]]],
  ["Thanks, Manager.",[["No need to thank me.",1,"…Thanks anyway."],["Message me more often, Chaba.",2,"…Will try."],["No problem",0,"Mm."]]]]},
 {id:"cb_food",x:[
  ["Had gaeng tai pla yet?",[["Never had it.",1,"…Never? Come to Phuket. I'll take you."],["Too spicy for me.",1,"Weak."],["Send some to the camp.",2,"…Sent. Two jars. Arrives tomorrow."]]],
  ["The kopi shop by my house. Best hot tea there is.",[["I'd love to sit there with you.",2,"…There's a free seat. One. Next to me."],["Hot tea in the morning is nice.",1,"Mm. Every morning."],["I prefer coffee.",0,"…Fine"]]],
  ["Hungry. Going to eat.",[["Eat lots.",1,"Mm."],["Send me a photo.",2,"…(sends one photo of chicken rice, no text)"],["OK",0,"…"]]]]},
 {id:"cb_mali",x:[
  ["Mali sends twenty messages a day.",[["Do you reply?",1,"I reply. …One a day."],["Mali waited for you for more than ten years, you know.",2,"…I know. I'll reply more. Two messages."],["Isn't that a lot?",0,"…Not too many."]]],
  ["Mali fights much better now. You teach well.",[["Mali's the talented one.",2,"…Same thing Mali says about you."],["Kru Daeng teaches her.",1,"Kru Daeng too."],["Thanks for the compliment.",0,"Mm."]]],
  ["Look after Mali.",[["I already am.",2,"…Trust you."],["Come and see her yourself sometimes.",1,"…Will come."],["Mali's grown up now.",0,"…Still a kid."]]]]},
 {id:"cb_naka",x:[
  ["Naka sent another contract.",[["Don't sign yet. Let Rin read it first.",2,"…Sent it to Rin. Twelve red marks."],["Is it a lot of money?",0,"…Don't care about money."],["If you don't want to sign, don't.",1,"Not signing."]]],
  ["Khun Krerk smiles all the time. …Don't like it.",[["People who smile all the time are the scariest.",2,"…You think so too."],["He seems kind.",0,"…No."],["Be careful.",1,"Being careful."]]],
  ["…Talked to you. Now I can sleep.",[["Then message me every night.",2,"…All right."],["What a lovely dream",1,"Mm. Good night."],["Go to sleep.",0,"…"]]]]}];
CHAT.chaba=RG_CHAT.chaba;
/* v1.90 round 9: the Central Plains in full — Alicia's live stream on the first trip, Lopburi's monkeys, the draft Naka League contract (Rin's story) at Suphan, a richer visit, her post after the cup and Alicia's chats. */
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgInT(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"camp_hanuman",t:`On the way to ${D.name}, Alicia sends a pin asking the camp to stop by Hanuman camp in Lopburi first. "Just on the way. Not an invitation."`},
  {n:"nar",t:"The van door isn't even fully open when a phone on a selfie stick pokes in, ring light blazing."},
  {n:"alicia",f:"happy",l:"casual",t:"Hi everyone~ We have a special guest today! This is the camp everyone in the comments has been talking about… Sirichai camp!"},
  {n:"nar",t:"Alicia sweeps the camera across the van, then holds it on the Manager's face several seconds too long. The live comments pour in.",choice:[
    {t:"Wave at the camera",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"See, everyone? The real manager smiles even better than in the clips. …That's what the comments say, I mean. Not me."}]},
    {t:"\"The camera's been stuck on me for a while.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"alicia",f:"flustered",l:"casual",t:"…! The signal's lagging! Lopburi internet is bad, I didn't do it on purpose!"}]},
    {t:"Cover the camera with your hand",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"pout",l:"casual",t:"Hey! Three hundred viewers just left! …Fine. I'll stop filming."}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Alicia")}]:[]),
  ...rgIf(rin,[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"4,812 viewers on the live right now. Comments per minute are 2.3 times higher than your usual lives."},
    {n:"alicia",f:"happy",l:"casual",t:"…How did you count that since getting off the van? I'm starting to like you."}]),
  {n:"alicia",f:"happy",l:"casual",t:`This province's champion trained at my camp before. She's good with straight punches but hates low kicks. …I didn't tell you that. You guessed.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Alicia's advice · Morale +3`:"Everyone remembers Alicia's advice"},
  {n:"coach",t:"Is the live over? Then Kru can take off the sunglasses."}];};
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgInT(G,"fah");return [
  {n:"nar",t:"That evening the whole camp stops at Phra Prang Sam Yot to buy souvenirs. Before anyone's out of the van, a troop of monkeys leaps onto the roof, a dozen of them."},
  {n:"nar",t:"The biggest monkey snatches the whole bag of souvenir snacks, then sits on a lamppost unwrapping them in front of everyone."},
  fah?{n:"fah",f:"angry",l:"casual",t:"Hey! That's Fah's snack! Get down here right now, Fah'll kick you off that pole!"}:{n:"coach",t:"Don't try to get it back. It'll call fifty more of its friends."},
  {n:"nar",t:"Another monkey grabs the hand wraps drying behind the van, wraps them round its head like a fighter, and squares up at everyone."},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…Its guard is better than the new kids at camp."}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"Take a photo first! This clip is going straight on the camp page."}]:[]),
  {n:"coach",t:"Forget it… we'll come back for the wraps next year. It'll probably be Lopburi's champion by then."},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"Everyone laughs until their stomachs hurt · Everyone's morale +2 · One pair of hand wraps lost"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgInT(G,"rin");return rin?[
  {n:"nar",t:"Ten at night, someone knocks on the hotel room door. Alicia stands outside, hood pulled over her head, a thick folder in her hands."},
  {n:"alicia",f:"sad",l:"casual",t:"Sorry for coming so late… Could I borrow Rin? Just for an hour."},
  {n:"alicia",f:"sad",l:"casual",with:"rin",t:"This is the draft Naka League contract. My personal manager says it's great and wants me to sign this week. You're good at reading contracts, right? Please take a look."},
  {n:"rin",f:"happy",l:"casual",t:"Sure. I'll need a red pen and a coffee."},
  {n:"nar",t:"One hour becomes three. Forty pages cover the bed. Rin marks twenty-three spots in red."},
  {n:"rin",f:"sad",l:"casual",t:"Clause 9. Of income from the fighter's image and content, the company gets seventy percent and the fighter thirty, for the entire contract."},
  {n:"rin",f:"sad",l:"casual",t:"Clause 21. The contract runs ten years and renews automatically. Cancelling costs a penalty equal to three years of past income."},
  {n:"rin",f:"sad",l:"casual",t:"And clause 14.3… the same sentence as in the green envelope, word for word. Fight data, image and voice belong to the affiliated company forever."},
  {n:"alicia",f:"sad",l:"casual",t:"…Thirty percent, ten years, forever. My manager called it \"industry standard\"."},
  {n:"rin",f:"happy",l:"casual",t:"I can read numbers. But I don't know if people in the industry really sign things like this. You know better than I do."},
  {n:"alicia",f:"happy",l:"casual",t:"…Nobody signs like this. Good camps give fighters at least half, and nobody dares write \"forever\" into an athlete's contract."},
  {n:"nar",t:"Alicia takes the red pen from Rin's hand and circles clauses 9, 21 and 14.3 again herself.",choice:[
    {t:"\"Together you two are the best contract readers in the country.\"",fx:G2=>{add(G2,"rin","bond",2);rgMeet(G2,"alicia",1);},then:[{n:"rin",f:"flustered",l:"casual",t:"…There isn't enough data to conclude that. But I won't argue."}]},
    {t:"\"Alicia, what will you do with it now?\"",fx:G2=>{rgMeet(G2,"alicia",2);add(G2,"rin","bond",1);},then:[{n:"alicia",f:"happy",l:"casual",t:"I'll send it back with these red marks. And… I might need a new personal manager."}]}]},
  {n:"alicia",f:"flustered",l:"casual",with:"rin",t:"Rin… thank you. I've never had a friend this smart. Everyone around me is only smart about view counts."},
  {n:"rin",f:"flustered",l:"casual",t:"Friend… Noted."},
  {fx:G2=>{add(G2,"rin","bond",2);const r=G2.F.rin;if(r)r.morale=Math.min(100,(r.morale||0)+5);rgMeet(G2,"alicia",2);G2.flags.rinAlicia=1;}},
  {n:"nar",t:"Rin, morale +5 · Rin and Alicia have become friends"}]
 :[{n:"nar",t:"Ten at night, Alicia knocks on the hotel room door, holding a thick contract folder."},
  {n:"alicia",f:"sad",l:"casual",t:"The Naka League contract. My personal manager says to sign it this week. …Could you read clause 14.3 to me? My hands shake when I read it."},
  {n:"nar",t:"The Manager reads it aloud slowly: the same sentence as in the green envelope, word for word. Alicia quietly closes the folder."},
  {n:"alicia",f:"happy",l:"casual",t:"…Thank you. I know what to do with it now."},
  {fx:G2=>rgMeet(G2,"alicia",2)}];}};
RG_POST.central="📱 Notification: Alicia (@alicia.hanuman) posted\n\n\"Thank you everyone for cheering on the Central Championship. The cup now belongs to Sirichai camp, and they earned every punch of it.\n\nThere are rumours that I've signed with a new league. Let me answer right here: I haven't signed with anyone.\n\nAnd I will never sign anything with the word 'forever' in it.\"\n\n— 48,000 likes within an hour\n\n📩 One private message follows: \"You saw the post, right? …You don't have to reply. I just wanted you to see it before anyone else.\"";
RG_CHAT.alicia=[
 {id:"al_live",x:[
  ["Twenty thousand watched my live last night, but half the comments asked \"where's the Sirichai manager?\"",[["Tell them I'm working.",1,"…Already did. The viewers spammed the sad reaction."],["Then invite me on your next live.",2,"No way! …The viewers would get ideas about us… No, no."],["Forget the comments.",0,"Can't. That's my job."]]],
  ["The sponsor team makes me smile at the camera three hours a day.",[["Sounds exhausting. Take a break.",2,"…You're the first person who's told me to rest instead of telling me to smile more."],["Your smile is pretty anyway.",1,"I know. …But thank you."],["Work is work.",0,"…Yes, work is work."]]],
  ["Off to train. Real training, not training for a clip.",[["Train well.",1,"Of course."],["Send me a clip of the real training.",2,"…A clip no one's ever seen. Just for you."],["OK",0,"Bye"]]]]},
 {id:"al_rin",x:[
  ["Rin sent me a seventeen-page analysis of my punches.",[["Rin likes you, that's why she did that much.",2,"…Really? Then I'll read all seventeen pages."],["Can you read all that?",1,"Read two pages, then called Rin to ask about the rest."],["Isn't that a lot?",0,"Rin says this is the short version."]]],
  ["I took Rin to a buffet. She counted the calories on every plate.",[["That's Rin for you.",1,"Yes. And she still ate more than me."],["You two get along well.",2,"…I've never had a friend who doesn't care about view counts. It's comfortable."],["Was it good?",0,"It was delicious."]]],
  ["Don't tell Rin I told you.",[["I definitely won't.",1,"Promise"],["Too late. Rin knows everything.",2,"…True. Rin probably calculated it from the start."],["Already told her",0,"Manager!!"]]]]},
 {id:"al_hanuman",x:[
  ["Monkeys steal gloves from Hanuman camp every day. Today they took a whole pair.",[["Lopburi's monkeys stole our camp's hand wraps too.",2,"Haha, then the monkeys there could start their own boxing camp by now."],["A camp called Hanuman deserves it.",1,"…Funny. I actually laughed out loud."],["Why not chase them off?",0,"Can't. The monkeys here own the town."]]],
  ["Our camp's Hanuman Offers the Ring move. Kru says mine is the most beautiful in ten years.",[["Pretty, and powerful too.",2,"…You said strong before pretty. I'll remember that."],["Kru has a good eye.",1,"Kru has a good eye."],["Pretty alone doesn't win fights.",0,"…I know. No need to rub it in."]]],
  ["Come visit Hanuman camp sometime. I'll show you around. …Just as the host.",[["Definitely",2,"…I won't tell my team, so there'll be no cameras."],["Can I bring the whole camp?",1,"Sure. But the monkeys will like you more than me, for sure."],["If I'm free",0,"…Fine"]]]]},
 {id:"al_mgr",x:[
  ["I fired my personal manager. The one who told me to sign the Naka League contract.",[["You made the right call.",2,"…I was so scared. But hearing you say that helps."],["Who'll handle your work now?",1,"I handle it myself now. Rin checks the contracts for me."],["That took guts",1,"Right?!"]]],
  ["…Does the Sirichai camp manager ever look after fighters from outside the camp? Just asking, as a joke.",[["If it's you, always.",2,"…It was a joke question! Don't get the wrong idea! …But I'll remember that."],["Our camp is small, you know.",1,"The small camp that beat me."],["No.",0,"…It was just a joke question."]]],
  ["Forget I asked!",[["Too late to forget now.",2,"…Then remember it, fine."],["Okay, forgotten.",0,"…You forget fast."],["Forgot it, but wrote it down.",1,"Manager!"]]]]},
 {id:"al_night",x:[
  ["No live stream tonight. Just sitting alone by the river watching fireflies.",[["Just like the night on the boat.",2,"…You still remember. I thought I was the only one."],["Not streaming is nice.",1,"Yes. It's quiet."],["Watch out for mosquitoes.",1,"Already put on bug spray, haha."]]],
  ["If one day nobody watches my lives anymore, would you still watch?",[["Of course. Even if I'm your only viewer.",2,"…One viewer is enough."],["Your viewers won't disappear.",1,"Dodging the question. But thanks anyway."],["I don't know",0,"…That's a bit too honest."]]],
  ["Going to bed. Don't reply with a sticker, so I don't have to answer back.",[["(Send a sticker)",1,"…Replied. Happy? (heart sticker)"],["What a lovely dream",2,"…Sweet dreams, Manager."],["OK",0,"Good night."]]]]}];
CHAT.alicia=RG_CHAT.alicia;
/* v1.91.135 (Man): chats that only open once she has moved into the camp; the old problem chats close once that problem is behind her */
{const J=G=>!!(G.region&&G.region.joined),inJ=c=>G=>!!(J(G)&&G.region.joined[c]),notJ=c=>G=>!inJ(c)(G),L=c=>G=>!!(inJ(c)(G)&&G.region.lov&&G.region.lov[c]!=null);
for(const [c,id] of [["baibua","bb_vector"],["chaba","cb_naka"],["alicia","al_mgr"]]){const t=(RG_CHAT[c]||[]).find(x=>x.id===id);if(t)t.when=notJ(c);}
const ADD={
 baibua:[
  {id:"bb_j_room",when:inJ("baibua"),x:[
   ["My room at the camp faces Doi Suthep. Every morning I wake up to the temple on the mountain.",[["I picked that room for you on purpose.",2,"...Really? I thought it was a coincidence."],["Do you like it?",1,"I do. It's like a second home."],["I'll put up curtains for you.",1,"No need. I like the morning light."]]],
   ["Kati knocked on my door at five this morning to go running.",[["Go running with Kati. You'll get close.",2,"Mm, running with Kati's fun, but she's really fast."],["Isn't five a bit early?",1,"At home I get up at four-thirty every day, hee hee."],["Tell Kati to go easy.",0,"It's fine. I don't mind at all."]]],
   ["Thank you for coming all the way to Tha Sao to get me.",[["I'd come and get you any number of times.",2,"...If you say things like that often, I'll be too flustered to train."],["Welcome to Sirichai Camp.",1,"Mm! I'll make the camp proud."],["No need to thank me.",1,"I have to thank you."]]]]},
  {id:"bb_j_spa",when:inJ("baibua"),x:[
   ["Mum sent photos of the spa. Every room's full of customers.",[["Because you protected it.",2,"Because you and the whole camp helped. I couldn't have done it alone."],["Tell your mum I'm happy for her.",1,"Mum says thank you, Manager."],["I'll come for a massage on a day off.",2,"Come any time. I'll give you the massage myself, free."]]],
   ["Nobody comes to cause trouble now. I slept soundly for the first time in a year.",[["You've earned the rest.",2,"...Mm. Thank you."],["If anyone comes again, tell me.",2,"You'll be the first person I tell."],["Good",1,""]]],
   ["Tonight I'm making khao soi for the whole camp.",[["From that secret shop?",2,"Same recipe! I asked the auntie who owns the shop for it."],["I'll help chop the shallots.",2,"Mm! Come to the kitchen at six."],["Can't wait.",1,"Mm!"]]]]},
  {id:"bb_j_miss",when:L("baibua"),x:[
   ["You're right in the next room, and I'm still messaging you.",[["Message me any time.",2,"...I like typing more than talking, because nobody can see me go red."],["Come out and talk in front of the room.",2,"No way! Kati's sitting right there."],["Missed you too.",2,"...I didn't say I miss you. But yes, I do."]]],
   ["I'm fighting tomorrow. Give me some encouragement?",[["Once the lotus blooms, you'll win.",2,"Hee hee, using my own technique's name to cheer me on? It works."],["Have fun out there. Don't get hurt.",2,"Mm, I'll come back in one piece."],["Go go!",1,"Mm!"]]],
   ["Good night... Bua's going to sleep now.",[["Good night, Bua.",2,"...Calling me that before bed, I won't be able to sleep."],["See you in the morning.",1,"Mm, at the training yard."],["Dream about you too.",2,"I told you I won't be able to sleep!"]]]]}],
 tabtim:[
  {id:"tt_j_camp",when:inJ("tabtim"),x:[
   ["Manager! I've covered my room in Mum's silk. Prettiest room in the camp!",[["Let me see it.",2,"Come on over! I've tidied up... almost tidied up."],["Prettier than Ploy's room?",2,"Of course! Don't tell Ploy, ha ha."],["Don't put up too much, it's a fire hazard.",0,"Silk doesn't burn that easily! ...I think."]]],
   ["Big sister Ploy taught me hooks. She says kicks alone aren't enough.",[["Ploy and Tabtim, two Korat girls running the camp now.",2,"Yes! Team Korat!"],["Listen to Ploy carefully.",1,"I'm listening, even if she's a bit strict."],["But your kicks are already good.",1,"Right! That's what I think too, ha ha."]]],
   ["This camp's more fun than I thought. Thank you!",[["Glad you came, Tabtim.",2,"I'm glad I came too! So much fun!"],["The camp's a lot louder now.",1,"Ha ha, well, I'm here now!"],["I haven't done anything yet.",1,"You've done a lot. You just don't notice."]]]]},
  {id:"tt_j_nil",when:inJ("tabtim"),x:[
   ["Brother Nil sent me a sticker! One sticker!",[["That's the first step.",2,"Yes! An orange cat... he even remembered I'm called Orange Cat."],["Reply to him.",2,"I did! I replied with ten stickers, ha ha."],["It's just a sticker.",0,"You don't get it! For Brother Nil that's a lot!"]]],
   ["Brother Petch asked if he can visit the camp on his day off.",[["Come any time. He's welcome.",2,"Yay! I'll tell him right away. I'll take him for som tam at the stall outside camp."],["Have him come train with us.",2,"Oh wow, Brother Petch is going to love that."],["Ask Kati first.",0,"Why do you have to ask Kati, ha ha. Okay."]]],
   ["Someday I want all three of us siblings on the same stage again.",[["That day will come.",2,"...Thank you. I believe you."],["I'll definitely be cheering ringside.",2,"You have to sit in the front row!"],["Nil has to get out of the Naka League first.",1,"Mm... I know. But I can wait."]]]]},
  {id:"tt_j_love",when:L("tabtim"),x:[
   ["Manager! On last night's live someone asked if I have a boyfriend. I already answered!",[["What did you say?",2,"I said yes! My boyfriend's great at kicking, ha ha. Well, I am."],["Don't go saying anything weird.",1,"I only said I have one! ...With a big grin."],["That's Tabtim for you.",2,"That's me!"]]],
   ["There's a full moon tonight. Come look at it in front of the camp with me?",[["Coming right now.",2,"Hurry! I brought mango sticky rice."],["Let me finish work first.",1,"Okay, I'll wait. But don't take long."],["I'm sleepy",0,"Nope! The moon won't wait!"]]],
   ["Good night... don't dream about anyone else.",[["I'll only dream about Orange Cat.",2,"Ha ha, good! Good night!"],["No threats.",1,"It's not a threat! Just a warning, ha ha."],["Night",1,"Good night!"]]]]}],
 alicia:[
  {id:"al_j_camp",when:inJ("alicia"),x:[
   ["Morning. My room has no air-con, but it has a window... it's fine. I'll live.",[["I'll get you air-con.",1,"No no. I want to try living like a real fighter, just once."],["That window gets a beautiful sunrise.",2,"...True. I got up to watch it this morning. I haven't seen one like that in a long time."],["Can you put up with it?",1,"I'm tougher than I look."]]],
   ["Rin made me a training schedule. With graphs. Who does that?",[["That's Rin.",2,"Ha. Fair. It's a good schedule too, better than my old camp's."],["Just follow Rin's plan.",1,"Already am. She's stricter than my trainer in Korea."],["Don't tell Rin you complained.",1,"My lips are sealed."]]],
   ["Nobody tells me to smile here. It's... weird. In a good way.",[["Smile when you feel like it. That's enough.",2,"...Thank you. That's what I've wanted all along."],["But you look pretty when you smile.",1,"Don't push it. ...Thank you."],["This isn't an agency.",2,"Yeah. This is a boxing camp. I love it."]]]]},
  {id:"al_j_song",when:inJ("alicia"),x:[
   ["I've written half a verse. Nobody wrote it for me. I wrote it myself.",[["Can I hear it?",2,"Not yet. When it's done, you'll be the first to hear it. Promise."],["What's it about?",1,"About someone who ran away to become a fighter. ...Too obvious?"],["Great job",1,"Thanks. You haven't even heard it yet, ha."]]],
   ["The label called. They say there's a concert waiting if I want to go back.",[["Do you want to go back?",2,"...Not now. Right now I want to finish the season fighting."],["You can do both.",2,"Boxing and music. Why not both? You sound just like Mabelle, ha."],["Stay at the camp.",1,"I'm staying. Don't worry."]]],
   ["Fans have started sending me pictures of me wearing a mongkol. Not concert stage photos anymore.",[["Real fans follow you anywhere.",2,"...Yeah. They've always been with me. I'm lucky."],["The mongkol really suits you.",2,"I know, right? Ha ha."],["Good",1,"Mm."]]]]},
  {id:"al_j_love",when:L("alicia"),x:[
   ["Sorry for messaging so late. I can't sleep. I just wanted to talk to you.",[["We can talk any time.",2,"...That's dangerous. I'll message every night."],["Is something wrong?",2,"Nothing's wrong. That's the weird part. Everything's too good."],["There's morning training tomorrow, you know",0,"Fine, fine. Good night, coach."]]],
   ["The song's finished. The title is this camp's name. Don't laugh.",[["I won't laugh. It's really touching.",2,"...Okay. Tonight I'll sing it just for you."],["Sing it for the whole camp.",1,"Maybe later. You have to be the first."],["A camp's name can be a song title?",1,"I can do anything. You know that."]]],
   ["Good night. ...You know, the person who stays beside you when no one's watching, that's the one who matters.",[["I'll always be here.",2,"I know. That's why it's you."],["Good night, Alicia.",1,"Good night."],["Three hundred thousand live viewers count too, you know.",0,"Ha. Doesn't count."]]]]}],
 chaba:[
  {id:"cb_j_camp",when:inJ("chaba"),x:[
   ["My room's next to Mali's. Mali talks all night.",[["You two are really close.",2,"...Mm. Since we were kids. I'm not complaining. Just sleepy."],["Want to change rooms?",0,"No. No need."],["At least you're not lonely.",2,"...True. Not lonely."]]],
   ["No sea, but the Ping River will do.",[["I'll take you to see the river on a day off.",2,"...Let's go."],["Do you miss the sea?",2,"Every day. But it's fine."],["Chiang Mai's cold, isn't it?",1,"Cold. I'm wearing three layers."]]],
   ["Thanks. For letting me come.",[["Welcome, Chaba.",2,"…Mm."],["The whole camp's happy.",2,"Mali cried when I arrived. ...I almost did too."],["No need to thank me.",1,"I have to."]]]]},
  {id:"cb_j_bro",when:inJ("chaba"),x:[
   ["My brother sent a photo. He can get on a boat now. His legs don't shake.",[["I'm happy for him.",2,"...I'm happy too. Cried a little. Can't tell anyone."],["Invite him to the camp.",2,"He says he'll come at low tide. ...Nice."],["You helped him a lot.",1,"Not me. He did it himself."]]],
   ["Nobody follows my boat anymore. The pier's quiet.",[["Because you fought.",2,"...Because I didn't fight alone."],["If anyone comes again, tell me.",2,"I'll tell."],["Good",1,"Mm."]]],
   ["I can tie a new knot. Want me to teach you?",[["Teach me.",2,"Come to the training yard. Bring rope."],["What kind of knot?",1,"A knot that won't slip. Not even in a storm."],["Another day.",0,"…Mm."]]]]},
  {id:"cb_j_love",when:L("chaba"),x:[
   ["You asleep?",[["Not yet. Waiting for you to message.",2,"...Wasn't waiting. ...Were you?"],["About to sleep.",1,"Mm. Sleep."],["Why?",1,"Nothing. Just asking."]]],
   ["Training wore me out today, but seeing your face made it go away.",[["You say things like this?",2,"...Can't unsend it. Forget it."],["You see my face every day.",2,"Then I feel better every day."],["Go get some rest.",1,"Mm."]]],
   ["Good night, my person.",[["Good night, Chaba.",2,"…Tasty."],["Your person, is it?",2,"Yes. The knot's tied. It won't come loose."],["Night",1,"Mm."]]]]}]};
for(const c in ADD){RG_CHAT[c]=RG_CHAT[c]||[];for(const t of ADD[c])if(!RG_CHAT[c].some(x=>x.id===t.id))RG_CHAT[c].push(t);if(typeof CHAT!=="undefined")CHAT[c]=RG_CHAT[c];}}

/* ---------- v1.90 limit break: a fighter with every stat at 20 (Lv.20+) leaves camp for two weeks of training and comes back with a ceiling of 25 ---------- */
const LB_CAP=25;
const lbFull=f=>!!f&&ATTRS.every(([k])=>f.a[k]>=19.95);
const LB_COST=150000; /* v1.91.26 (Man): limit-break training should cost a lot */
function lbBlock(G,f){if(!G.region)return "The Four Regions chapter isn't open yet";if(stCap(f)>=LB_CAP)return "Limit already broken";if(!lbFull(f))return "Every stat must be 20";
  if((f.lvl||1)<20)return "Needs Lv.20 or higher";if(isAway(G,f.id))return "Not in camp";if(f.injury)return "Wait until she's healed";
  if(G.bookings.some(b=>(b.a===f.id||b.b===f.id)&&b.week>=G.week&&b.week<=G.week+2))return "Has a fight within 2 weeks — cancel it or fight it first";
  const T=G.region.trip;if(T&&T.abs!=null&&T.abs-absWeek(G)<=2)return "The whole camp has a regional trip within 2 weeks";if(G.cash<LB_COST)return `Not enough cash · needs ${fmt(LB_COST)}`;return "";}
function lbCardHTML(f){if(!G.region||f.camp!=="player")return "";
  if(isAway(G,f.id)&&f.lbTrip)return `<div class="lbcard"><h4>✦ Training away</h4><p class="meta">${esc(f.name)} Back in camp in ${awayLeft(G,f.id)} weeks · no training, no fights</p></div>`;
  if(stCap(f)>=LB_CAP||!lbFull(f))return "";const why=lbBlock(G,f);
  return `<div class="lbcard"><h4>✦ Limit Break</h4><p class="meta">Every stat is at 20 · train away from camp for 2 weeks (no training, no fights) and the stat ceiling rises to ${LB_CAP}</p>
    <p class="meta">Teacher, lodging, food and travel, total <b class="goldt">${fmt(LB_COST)}</b></p>
    <p class="meta">Stats above 20 grow slower than usual. It takes a long time</p>${why?`<p class="meta redt">${why}</p>`:""}<button class="btn primary" data-act="lbgo" data-v="${f.id}" ${why?"disabled":""}>Send away to train ▸</button></div>`;}
const LB_GO={
 kati:[{n:"coach",t:"Kati, your stats are all maxed. More training here will only keep them where they are."},{n:"coach",t:"I know an old monk at a mountain temple near Omkoi. When he was young he fought Grandpa Chai. Go stay with him for two weeks."},
  {n:"kati",f:"sad",t:"Two weeks… I've never been away from camp that long."}],
 mali:[{n:"coach",t:"Mali, your stats are all maxed. There's an old master in Chaiya who still teaches Yang Sam Khum the traditional way."},{n:"mali",f:"happy",t:"Back to Chaiya~? Grandma will be so happy! But Mali's going to miss everyone!"}],
 rin:[{n:"coach",t:"Rin, your numbers have topped out. The same training won't raise them."},{n:"rin",f:"happy",t:"I know. And I've planned it already: two weeks in Bangkok, at the camp where I was knocked out at nineteen."},
  {n:"rin",f:"sad",t:"I'll step into that ring again… the one variable I've never solved."}],
 ploy:[{n:"coach",t:"Ploy, your stats are all maxed. How about two weeks back in Korat? I've already talked to your dad."},{n:"ploy",f:"pout",t:"I don't want to go back… but Dad calls every week to ask if I can still run up the hill."}],
 fah:[{n:"coach",t:"Fah, your stats are all maxed. Want to go train somewhere for two weeks?"},{n:"fah",f:"happy",t:"Doi Inthanon! Fah's going to run to the summit every morning. Nobody will keep up!"}]};
const LB_BACK={
 kati:[{n:"nar",t:"Two weeks later Kati walks back into camp before dawn, darker from the sun, hands wrapped in old white cloth."},{n:"kati",f:"happy",t:"The abbot had me carry water up the mountain a hundred times a day. I didn't hit a bag once."},
  {n:"kati",f:"sad",t:"On the last day he said Grandpa Chai didn't leave my training unfinished — he kept the last move for me to find myself."},{n:"coach",t:"And did you find it?"},{n:"kati",f:"happy",t:"Not yet. But I know now it isn't at twenty."}],
 mali:[{n:"nar",t:"Mali comes back with a big foam box — Grandma made khanom jeen with tai pla curry for the whole camp."},{n:"mali",f:"happy",t:"The old master had me walk Yang Sam Khum on the paddy dykes every day, and on the last day I didn't fall in the mud once~"},
  {n:"mali",f:"happy",t:"Now I can walk in on an opponent without thinking. My feet just go!"}],
 rin:[{n:"nar",t:"Rin comes back with a new notebook. Every page is blank."},{n:"rin",f:"happy",t:"I got back in that same ring. This time I didn't count anything. I just fought."},
  {n:"rin",f:"flustered",t:"Results: fear down about ninety percent… I'm keeping the other ten to remind myself."}],
 ploy:[{n:"nar",t:"Ploy comes back in new running shoes. The old pair died on the mountain."},{n:"ploy",f:"happy",t:"Dad timed my hill runs every day. On the last day I beat the record he set when he was young."},
  {n:"ploy",f:"flustered",t:"Dad didn't praise me… he just wiped his own name off the board and wrote mine instead."}],
 fah:[{n:"nar",t:"Fah comes back with ten bags of mountain coffee."},{n:"fah",f:"happy",t:"Fah ran to the summit fourteen times! The last time I watched the sunrise all alone."},
  {n:"fah",f:"sad",t:"…and I missed the camp a lot. Don't tell anyone."},{n:"fah",f:"happy",t:"This coffee's for everyone! Manager, pay me back!"}]};
const lbGo=(f)=>LB_GO[f.id]||[{n:"coach",t:`${f.name} has maxed every stat. I'll send her to train with an old master I know, for two weeks.`}];
const lbBack=(f)=>LB_BACK[f.id]||[{n:"nar",t:`${f.name} is back from two weeks of training, eyes calmer than before`},{n:"coach",t:"Don't tell me. I can see it in how you walk."}];
function lbStart(G,id){const f=G.F[id];if(!f||lbBlock(G,f))return;const who=LB_GO[id]?id:"coach";
  playScene([...lbGo(f).map(x=>({l:"casual",...x})),{n:"nar",t:`Send ${f.name} away to train for 2 weeks?`,choice:[
    {t:`Go. The camp can wait (${fmt(LB_COST)})`,fx:G2=>{if(G2.cash<LB_COST)return;G2.cash-=LB_COST;sendAway(G2,id,2,"train");G2.F[id].lbTrip=1;G2.log.push(`${f.name} left camp for 2 weeks of training · paid ${fmt(LB_COST)}`);},then:[{n:who==="coach"?"coach":id,f:"happy",l:"casual",t:"See you in two weeks!"}]},
    {t:"Not yet",then:[{n:"coach",t:"All right, no rush. Tell me when you're ready."}]}]}],()=>{save();render();},{bg:"camp",look:"casual"});}
/* weekly: the homecoming, else the first time someone hits the ceiling Kru Daeng points it out */
function lbWeek(G,done){const R=roster(G).concat(Object.values(G.F).filter(f=>f.lbTrip&&f.camp==="player"&&!roster(G).includes(f)));
  const back=R.find(f=>f.lbTrip&&!isAway(G,f.id));
  if(back){playScene([...lbBack(back).map(x=>({l:"casual",...x})),{fx:G2=>{const f=G2.F[back.id];f.cap=LB_CAP;f.potential=Math.max(f.potential||14,LB_CAP);f.lbTrip=0;f.awayBack=true;
      for(const [k] of ATTRS)f.a[k]=Math.min(LB_CAP,f.a[k]+.2);f.morale=Math.min(100,(f.morale||0)+10);G2.log.push(`${f.name} broke the limit · stat ceiling 20 → ${LB_CAP}`);}},
    {n:"nar",t:`${back.name} broke the limit · stat ceiling 20 → ${LB_CAP} · every stat +0.2 · morale +10`}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  const ready=roster(G).find(f=>!f.lbNote&&stCap(f)<LB_CAP&&lbFull(f)&&(f.lvl||1)>=20);
  if(ready){ready.lbNote=1;playScene([{n:"coach",t:`Manager, ${ready.name} has maxed every stat at 20 — no amount of training raises them now.`},{n:"coach",t:"There is one way. Go look at her stats page."},
    {n:"nar",t:"Unlocked: Limit Break · see Fighter › Stats"}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  return false;}
/* ---------- v1.90 round 10: the Naka League team (names locked 18 Nov 2026 — see project doc claude/naka-league-team.md) ----------
   "Naka" is the family name of Krerk and Ladda only; the four team members are hired fighters from other disciplines.
   shape = stat offsets from the fitted level · grap/sub = takedown / submission game (0–20) · nlsk = the three skills the AI fires
   spl = special sheets (code effects if none) · td:1 = the throw sheet that plays on a takedown */
const NL={
 nia:{name:"Nia Okafor",nick:"Black Drum Rhythm",art:"Boxing",col:"#3a7bd5",sprite:"nl_nia",sty:"pressure",
  shape:{punch:3,kick:-6,knee:-5,elbow:-5,clinch:-4,guard:2,foot:3,counter:3,speed:2,iq:1},grap:0,sub:0,pfx:{dmg:{punch:.12},ctr:.04,evade:.02},
  nlsk:[{id:"nl_peek",name:"Peek-a-Boo",k:"def"},{id:"nl_liver",name:"Liver Shot",k:"atk",w:"punch"},{id:"nl_dempsey",name:"Dempsey Roll",k:"atk",w:"punch"}],
  spl:[{img:"nl_nia_special",w:"punch",def:"Dempsey Roll",npc:1,p:.5}],tip:"Fast hands and great counters, but she's never had to take kicks or knees"},
 varya:{name:"Varya Sokolova",nick:"Red Bear",art:"Sambo + MMA",col:"#d43a3a",sprite:"nl_varya",sty:"inside",
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["Double Leg","Hip Throw","Suplex"],tdSty:["leg","hip","suplex"],subName:["Heel Hook","Kneebar"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"Double Leg",k:"td"},{id:"nl_suplex",name:"Suplex",k:"td"},{id:"nl_heelhook",name:"Heel Hook",k:"sub"}],
  spl:[{code:"suplex",def:"Suplex",td:1}] /* v1.91.67 (Man): her signature throw is the suplex — code-animated from her own frames until a drawn suplex sheet arrives (the double-leg sheet nl_varya_special stays in the files) */,tip:"Big throws and leg locks · once she drags you down she never stops pounding"},
 meili:{name:"Meili Sae-Tang",nick:"Dragon of Yaowarat",art:"Kung Fu",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"Shadowless Kick",k:"atk",w:"kick"},{id:"nl_inch",name:"One-Inch Punch",k:"atk",w:"punch"},{id:"nl_crane",name:"Crane Stance",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"Shadowless Kick",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"One-Inch Punch",npc:1,p:.5}],tip:"Fast, long kicks · in close she's only half the fighter"},
 rosa:{name:"Corazón Rosa",nick:"Pink Heart",art:"Lucha Libre",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["Hurricanrana","DDT"],tdSty:["rana","ddt"],subName:["La Mística"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"Hurricanrana",k:"td"},{id:"nl_mistica",name:"La Mística",k:"sub"},{id:"nl_moonsault",name:"Moonsault",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"Hurricanrana",td:1}],tip:"Tireless and tough, loves a showy throw for the crowd · leaves her guard open a lot"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"Ladda",nick:"The Killing Machine of Women's Muay Thai",art:"MMA + Modern Muay Thai",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["Double Leg","Leg Grab"],tdSty:["leg","leg"],subName:["Rear-Naked Choke","Guillotine"],pfx:{dmg:{elbow:.1},gnp:.15},
  nlsk:[{id:"nl_ld_double",name:"Double Leg",k:"td"},{id:"nl_ld_superman",name:"Superman Punch",k:"atk",w:"punch"},{id:"nl_ld_rnc",name:"Rear-Naked Choke",k:"sub"}],
  phases:[{n:1,fst:"power",sprite:"nl_ladda_hood",dmg:1.18,hit:-.01,ini:-1,say:"Ladda pulls the hood down over half her face and stands still… every punch lands like a hammer"},
   {n:2,fst:"read",fall:"footwork",sprite:"nl_ladda",dmg:1,hit:.05,ini:3,ev:.04,say:"Ladda flings the hood away, white hair with red tips spilling out — her speed changes in an instant!"},
   {n:3,fst:"pressure",lvUp:1,sprite:"nl_ladda_blood",dmg:1.3,hit:.08,ini:4,ev:.03,self:5,blood:1,say:"Ladda punches herself in the face twice — the Naka family's sports medicine wakes the blood! Red skin, red eyes… blood mode!"}],
  spl:[{img:"nl_ladda_sp_superman",w:"punch",def:"Superman Punch",npc:1,p:.55,ph:1},{img:"nl_ladda_sp_headkick",w:"kick",def:"Head Kick",npc:1,p:.55,ph:1},
   {img:"nl_ladda_sp_spinkick",w:"kick",def:"Spinning Back Kick",npc:1,p:.55,ph:2},{img:"nl_ladda_sp_backfist",w:"punch",def:"Spinning Back Fist",npc:1,p:.55,ph:2},
   {img:"nl_ladda_sp_bloodfist",w:"punch",def:"Naka Blood Fist",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodkick",w:"kick",def:"Spinning Wheel Kick",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodslam",def:"Blood Boil Slam",td:1,ph:3},{img:"nl_ladda_sp_awaken",def:"Blood-boil mode",awaken:1,ph:3}],
  tip:"Changes form mid-fight · rounds 1–2 hooded, heavy and steady · rounds 3–4 hood off, very fast · round 5 blood mode"}};
const NL_ORDER=["nia","varya","meili","rosa","ladda"];
/* build (or refresh) a team member sized against `me`: she wins about `p` of 5-round bouts, never above the ceiling `ceil` */
/* v1.91.78 (Man): the Naka team and the regional champions talk in their own voice after a bout, not the generic NPC lines */
if(typeof POST_BUBBLE!=="undefined")Object.assign(POST_BUBBLE,{
 nl_nia:{win:["The drum hadn't even finished the song.","Your rhythm is half a beat behind mine, {foe}.","Go learn to hear the rhythm again."],lose:["…My drum slipped a beat. Once is enough to lose.","You read my rhythm… not bad.","Next time I change the song."]},
 nl_varya:{win:["On the ground, there's no Muay Thai.","You tapped sooner than I thought, {foe}.","A bear doesn't let go of what it catches."],lose:["…You wouldn't go to the ground. Smart.","Your legs are stronger than the data said.","Next time I'll catch you in the first round."]},
 nl_meili:{win:["Did you see my leg… no, you didn't.","One finger is enough.","Want to come back to Yaowarat for dinner? My treat."],lose:["…Speed alone isn't enough, is it.","My sifu is going to lecture me for ages.","You took my kicks. You've got nerve."]},
 nl_rosa:{win:["¡Olé! Prettiest fall in the whole warehouse!","A pink heart never stops beating!","Don't be sad, give yourself a round of applause!"],lose:["¡Ay! …If you lose, bow beautifully.","My mask stays on, but my heart gives in.","You made the crowd shout for you instead of me. ¡Bravo!"]},
 nl_ladda:{win:["Weak.","……","A dust mite's bite hurts more.","…Next.","This is the camp that made four regional champions turn my father down?","A waste of time.","Weaker than the data said."],lose:["…that was fun","The data… wasn't complete.","Next time I won't miss there."]},
 baibua:{win:["Thank you for not backing down, {foe}.","The Tha Sao elbow is still sharp.","Come back again next time, jao."],lose:["…I have to go back and train again.","You really have got better.","It's okay. Dad will understand."]},
 tabtim:{win:["Khak thae! Your time hasn't come yet.","Don't cry over a loss. Tabtim's lost too.","Want to get som tam? Tabtim's treat."],lose:["Ow! Hurts, but that was fun.","A loss is a loss. You hit hard, for real.","Next time Tabtim gets it back for sure."]},
 alicia:{win:["You can turn the camera off now. It's over.","I didn't win because of my face.","Thanks for actually fighting me."],lose:["…Cameras off. Give me five minutes.","You really don't care about the camera. Good.","Next time I won't lose."]},
 chaba:{win:["…Just a little more.","If you can stand, stand.","More training."],lose:["…That hurt. Good.","You don't stop. Like the waves.","…Next time."]}});
function nlFighter(G,k,me,p,ceil,leg){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,tdSty:D.tdSty||null,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
  if(D.sprite)f.sprite=D.sprite;f.fatigue=0;f.injury=0;f.morale=75;f.lvl=Math.max(me&&me.lvl||1,1)+(k==="ladda"?9:NL_ORDER.indexOf(k)<2?7:8)/* v1.90.20 (Man): members +7–8, Ladda +9 (+10 in blood mode) — the label only, strength comes from the fit */;
  const setT=T=>{f.vet=0;for(const [a] of ATTRS)f.a[a]=Math.max(1,Math.min(20,T-.6+(D.shape[a]||0)));liftOpponent(f,T,20);};
  {const T=RG_FIX.nl[k]+(leg?(k==="ladda"?LEG_UP.l:LEG_UP.n):0);setT(T);f.nlT=T;}if(leg)f.lvl+=2;f.leg=!!leg;return f;} /* v1.90.21: fixed strength (p and ceil kept only for the old dev calls) */
function nlTest(k){const me=roster(G).filter(f=>!isAway(G,f.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(!me)return;
  const o=nlFighter(G,k,me,k==="ladda"?.25:.4,RG_LADDER.champ(3,0)+(k==="ladda"?.5:0));
  const b={id:"nltest"+Date.now(),a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",nltest:1};G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);save();render();});}
/* ===================== round 11: cups 2–3 story, the closing ceremony, the underground final (v1.91.20) ===================== */
const RG_DEAL_CASH=200000;
/* the week after the second cup: dinner with Khun Krerk */
function rgCup2(G){const R=G.region,rin=rgIn(G,"rin");return [
 {n:"nar",bg:"camp",t:"A gold invitation arrives at the camp. Khun Krerk invites the manager to a one-on-one dinner at the top-floor restaurant of the Naga Energy tower"},
 {n:"nar",bg:"krerk_dinner",show:[{id:"npc:krerk"}],t:"A long table for twenty, but only two place settings. Glass all around, with all of Bangkok in view"},
 {n:"npc",who:"Khun Krerk",t:(R.cups||[]).length>=2?"Two cups in a single tournament. I haven't seen a small camp like yours in a long time":"A small camp from Chiang Mai fighting at regional level. I haven't seen that in a long time"},
 {n:"npc",who:"Khun Krerk",t:"I used to fight too. National team. That year I already had my Olympic ticket in hand"},
 {n:"npc",who:"Khun Krerk",t:"Three weeks before we left, the team van skidded on the road. My knee broke in three places. The doctor said I was lucky to walk at all"},
 {n:"npc",who:"Khun Krerk",t:"That night I lost more than a knee… but that's not a story for the dinner table."},
 {n:"npc",who:"Khun Krerk",t:"Nobody was at fault. It rained, the road was slick… it was luck, that's all"},
 {n:"npc",who:"Khun Krerk",t:"From that day I promised myself I'd never let luck decide a fighter's life again. Money, data, science, I'll control all of it myself"},
 {n:"nar",t:"He slides a green-and-gold folder in front of you. The cover reads \"Partner Contract\""},
 {n:"npc",who:"Khun Krerk",t:`I'd like to partner with Sirichai Camp. ${fmt(RG_DEAL_CASH)} today, in exchange for the right to manage your fighters, from every meal to the data on every punch`},
 {n:"nar",t:"A green-and-gold folder lies in front of you",choice:[
   {t:"Accept",fx:G2=>{G2.region.c2="deal";G2.cash+=RG_DEAL_CASH;},then:[
     {n:"npc",who:"Khun Krerk",t:"A wise decision. I'll take the very best care of Sirichai Camp"},
     rin?{n:"rin",f:"sad",l:"casual",t:"…Let Rin read the contract before you sign. At least then Rin will know what we just sold"}:{n:"coach",t:"Money this big, I've never seen anyone hand it out for free"}]},
   {t:"Let me think about it",fx:G2=>{G2.region.c2="later";},then:[
     {n:"npc",who:"Khun Krerk",t:"Of course. My door is always open"}]},
   {t:"Decline",fx:G2=>{G2.region.c2="no";},then:[
     {n:"npc",who:"Khun Krerk",t:"A pity… but I respect that"},
     {n:"nar",t:"He keeps smiling the same way, but the hand pulling the folder back grips it until his knuckles go white"}]}]},
 {n:"nar",t:"While you wait for the elevator down, the doors of the one across are closing. Inside stands a lone woman with white hair, red at the tips. The doors shut before you can see her face"},
 {fx:()=>{R.c2=R.c2||"later";}}];}
/* the week after the third cup: Pailin "forgets" a tablet */
function rgCup3(G){const R=G.region,rin=rgIn(G,"rin"),ploy=rgIn(G,"ploy"),kati=rgIn(G,"kati");return [
 {n:"nar",bg:"camp",t:"A rainy night. Pailin stands at the camp gate without an umbrella"},
 {n:"pailin",f:"sad",t:"I didn't come to see anyone. I was just passing by"},
 {n:"nar",t:"She hands over Vector's tablet, three files left open on the screen"},
 {n:"nar",t:"The first file is the full Naka League contract draft. The second is monthly transfer slips from Naga Energy to Vector since last year. The third is a video clip"},
 {n:"nar",bg:"naka_lab",t:"In the clip, four women from different disciplines train on the mats: boxing, sambo, kung fu, lucha wrestling. A fifth in a white hood takes them down one at a time"},
 {n:"pailin",f:"sad",t:"Research funding, lab fees, equipment… I thought he gave it because he believed in sports science like I do"},
 {n:"pailin",f:"sad",t:"But he used the data from every fight I logged to build that person"},
 ...rgIf(ploy,[{n:"ploy",f:"sad",l:"casual",t:"Sis…"},{n:"pailin",f:"sad",t:"Don't say anything, Ploy. I know I was stupid"},{n:"ploy",l:"casual",t:"You weren't stupid. You just trusted the wrong person… once"}]),
 rin?{n:"rin",f:"sad",l:"casual",t:"Clause 14.3 of the Naka League contract covers data obtained from Vector too. That means data from every camp Vector has ever fought"}:{n:"coach",t:"Data from every camp Vector has ever fought… it's all in Naka's hands now"},
 {n:"coach",bg:"camp",t:"Including our camp"},
 /* v1.91.23 (Man): the money behind Phayak Thong is Krerk's — revealed on the same tablet */
 {n:"nar",t:"At the end of the draft there's one more page, an appendix headed \"Naka Energy Affiliated Camps\". The first name is Vector. The second is Phayak Thong Camp, Chiang Mai."},
 {n:"nar",t:"The date Naka took its stake in Phayak Thong falls in the same month Grandpa Chai passed away."},
 {n:"pailin",f:"sad",t:"I never opened this page… I only signed the ones with Vector's name on them."},
 ...rgIf(ploy,[{n:"ploy",f:"angry",l:"casual",t:"The sponsor hand wraps the camp always made me use… that pattern at the wrist is a naga's tail."}]),
 ...rgIf(rin,[{n:"rin",f:"sad",l:"casual",t:"The year the boss sent an injured junior into the ring… the results targets he pushed on everyone were handed to him by someone else."}]),
 {n:"coach",t:"Once Grandpa Chai was gone, every one of our kids moved to Phayak Thong within a year… I always thought it was just money."},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"I thought everyone just didn't want to stay at an empty camp… but someone wanted Grandpa's camp empty from the start."}]),
 {n:"nar",t:"The manager remembers what was said at the top-floor dinner in the Naka tower: \"I haven't seen a small camp like this in a long time.\" …He'd been watching all along."},
 R.c2==="deal"?{n:"coach",t:"And the green-and-gold folder we signed… our camp's name is on that page now too."}:{n:"coach",t:"That green-and-gold folder he slid across to you… it was the same move, second time round."},
 {n:"pailin",t:"I didn't come to warn you. I just forgot my tablet here. You can send it back tomorrow"},
 {n:"nar",t:"Pailin walks back into the rain and never looks back"},
 {fx:()=>{R.c3="seen";}}];}
/* who in the camp the regional champion likes best: the one who says the camp's name at the ceremony */
const RG_CLOSE_SAY={baibua:"A boxing camp can stand on its own two shins, jao. I've seen it with my own eyes. Sirichai Camp.",tabtim:"Sirichai Camp doesn't have much money, but they fight for each other with all their heart. Tabtim has seen it",
 alicia:"I want to fight the Sirichai way. Where nobody asks me to smile for the camera",chaba:"…I want to stay at a camp that fixes its own fence"};
/* after the fourth cup (or once the tournament has run its course): Naka League, the refusals, Ladda */
function rgClose(G){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),kati=rgIn(G,"kati");
 const fav=["baibua","tabtim","alicia","chaba"].sort((a,b)=>((R.meet||{})[b]||0)-((R.meet||{})[a]||0))[0];
 const four=["baibua","tabtim","alicia","chaba"].map(id=>({id,l:"fight",f:"happy"})),tense=["baibua","tabtim","alicia","chaba"].map((id,i)=>({id,l:"fight",f:"angry"})); /* v1.91.90 (Man): the scheme is out in the open — they refuse with their heads up, not in tears */
 /* v1.91.74 (Man): a real closing ceremony first (many guests, ceremony talk), Krerk as the host who backs the provincial and regional rings —
    no signing on stage; the four champions walk over afterwards to say no, and Krerk hands it to Ladda. Tense, no smiling faces; the beatings are text only. */
 return [
 {n:"nar",bg:"closing_ceremony",show:[],t:"The closing ceremony of the Four Regions Championship. A grand hall in central Bangkok, every table full: provincial sports officials, promoters from all four regions, old-school teachers, and every camp that took part."},
 {n:"npc",who:"MC",img:"gala_mc_hype",t:"A big round of applause for the four regional champions! North, Baibua · Isan, Tabtim · Central, Alicia · South, Chaba"},
 {n:"nar",show:four,t:"All four step up together to receive their plaques of honour. Camera flashes light up the hall, and the old-school teachers rise to applaud, table by table."},
 {n:"npc",who:"Sports official",t:"Provincial and regional boxing are the roots of Muay Thai. Thank you to every camp, big and small, and thank you to our host for backing the regional rings for three years."},
 {n:"npc",who:"Khun Krerk",t:"I just pay the electricity bill for the ring. The people who gave this tournament meaning are every fighter and every teacher in this room."},
 {n:"npc",who:"Khun Krerk",t:"The provincial and regional rings will stay. Naka will keep backing them every year. I promise."},
 {n:"npc",who:"Khun Krerk",t:"But I have a dream of my own too… the Naka League. A league that brings the strongest fighters of every art onto one stage."},
 {n:"npc",who:"Khun Krerk",t:"I've already invited all four champions. No need to answer on stage. Tonight is their night."},
 {n:"nar",show:[],t:"The party goes on until the hall starts to thin out."},
 {n:"nar",show:tense,t:"Then all four champions walk over together and stop in front of Khun Krerk's table. One by one, the tables still occupied fall silent."},
 {n:"baibua",f:"angry",l:"fight",t:"Thank you for looking after the regional rings all this time. But I'm not joining your league. Bua Tha Sao camp still has me, and I'm not selling it."},
 {n:"tabtim",f:"happy",l:"fight",t:"Tabtim's not joining either! My little brother read me clause fourteen. You won't fool us that easily, okay?"},
 {n:"alicia",f:"angry",l:"fight",t:"I won't sign anything with the word \"forever\" in it. No matter whose it is."},
 {n:"chaba",f:"angry",l:"fight",t:"…Not joining."},
 {n:fav,f:"angry",l:"fight",t:RG_CLOSE_SAY[fav]},
 {n:"nar",show:[{id:"npc:krerk"}],t:"Khun Krerk hears them out without interrupting, then sets his glass down softly on the table."},
 {n:"npc",who:"Khun Krerk",t:"I respect your decision. But my league must be the strongest, and for people to believe that, they have to see it with their own eyes."},
 {n:"npc",who:"Khun Krerk",t:"Ladda"},
 {n:"nar",show:[{id:"lada",l:"casual",f:"angry"}],t:"A woman in a white hoodie rises from the corner table, the hood over half her face, a lock of white hair tipped in red at her cheek. She doesn't look at her father, or at anyone."},
 {n:"npc",who:"Khun Krerk",t:"Handle it."},
 {n:"lada",f:"angry",l:"casual",t:"…Come up. All four at once is fine."},
 fah?{n:"fah",f:"surprised",l:"fight",t:"Wait! This is a party!"}:{n:"coach",t:"Wait! This is a party."},
 rin?{n:"rin",f:"surprised",l:"fight",t:"Manager, don't let them go up… No referee, no doctor."}:{n:"coach",t:"Don't go up! No referee, no doctor."},
 {n:"nar",show:[],t:"Too late. The four champions look at each other — none of them will gang up on one woman. Baibua kicks off her shoes and slips through the ropes before anyone else.",cut:"ladda"},
 {n:"nar",show:[],t:"The ring is dead silent. The four regional champions lie in separate corners. Baibua coughs until she curls up, Tabtim clutches her knee, Alicia can't catch her breath, and Chaba tries to rise a third time before sinking down again."},
 {n:"nar",show:[],t:"Blood seeps from the corner of Ladda's mouth where Baibua's elbow grazed her. She touches it with a fingertip and stares at it, as if writing down a number.",
  choice:[{t:"Run up and help the champions down",fx:G2=>{for(const c of ["baibua","tabtim","alicia","chaba"])rgMeet(G2,c,2);},then:[
    {n:"nar",show:[],t:"You duck through the ropes and lift Baibua, her arm over your shoulder. The girls from your camp follow to help the other three down."},
    {n:"baibua",f:"sad",l:"fight",t:"…I can still stand… I can."}]},
   {t:"Step up and stand in front of Ladda",fx:G2=>{rgMeet(G2,"chaba",3);for(const c of ["baibua","tabtim","alicia"])rgMeet(G2,c,1);R.closeFace=1;},then:[
    {n:"nar",show:[{id:"lada",l:"casual",f:"angry"}],t:"You step up between Ladda and Chaba. Ladda turns to look at you, red eyes perfectly still."},
    {n:"lada",f:"angry",l:"casual",t:"…You're not a fighter."},
    {n:"lada",f:"angry",l:"casual",t:"But you don't back down either… What's your name?"},
    {n:"chaba",f:"sad",l:"fight",t:"…Don't. I can get up myself."}]},
   ...(fah?[{t:"Grab Fah's arm and keep her off the ring",fx:G2=>{add(G2,"fah","trust",3);for(const c of ["baibua","tabtim","alicia","chaba"])rgMeet(G2,c,1);},then:[
    {n:"fah",f:"angry",l:"fight",t:"Let go of Fah! Fah's going up there to hit her—"},
    {n:"nar",show:[],t:"You don't let go. Fah pulls with everything she has three times, then stops. Her clenched fist slowly opens."},
    {n:"fah",f:"sad",l:"fight",t:"…Not today, right? Fah knows. Fah knows."}]}]:[])]},
 {n:"npc",who:"Khun Krerk",t:"I don't look down on the regional rings. I paid for every baht of them, and I love them… but tonight everyone saw what the very top of fighting looks like."},
 {n:"nar",show:[{id:"npc:krerk"}],t:"The whole hall turns to look at you.",choice:[
   {t:"\"That wasn't a fight. That was hurting people who weren't ready.\"",then:[{n:"npc",who:"Khun Krerk",t:"The real world never waits for anyone to get ready. I learned that from that van."}]},
   {t:"\"If you want to know who's strongest, send your fighters to face my camp.\"",fx:G2=>{R.closeDare=1;},then:[{n:"npc",who:"Khun Krerk",t:"…That's exactly what I was hoping for, Manager."}]},
   {t:"(Say nothing. Turn and lead the champions off the ring.)",then:[{n:"nar",show:[],t:"You turn your back on Mr. Krerk. The hall stays silent except for the footsteps of the Sirichai camp going down the steps."}]}]},
 rin?{n:"rin",f:"angry",l:"fight",t:"If they'd signed, clause 14.3 would make every move they've ever thrown Naka's… Ladda wouldn't have to guess a single punch."}:{n:"coach",t:"If they'd signed, every move they've ever thrown would belong to Naka. Ladda wouldn't have to guess a single punch."},
 {n:"alicia",f:"sad",l:"fight",t:rin?"If Rin and your camp hadn't read that contract for me… I'd be standing next to him by now.":"If it weren't for your camp… I'd be standing next to him by now."},
 {n:"nar",show:[{id:"lada",l:"casual",f:"sad"}],t:"Ladda pulls her hood up and follows her father without stopping, but says something quietly as she passes you."},
 {n:"lada",f:"sad",l:"casual",t:"…They didn't sign because of your camp. I want to know what your camp has."},
 fah?{n:"fah",f:"surprised",l:"fight",t:"That's… modern boxing. Like mine. Except there's nothing left inside it at all."}:{n:"coach",t:"That's not just Muay Thai… that's everything combined"},
 {n:"pailin",f:"sad",t:"Manager… I've known Khun Krerk for twenty years. May I tell you something?"},
 {n:"pailin",f:"sad",t:"The night the national-team van overturned, Khun Krerk's wife was riding with them. She never came home. He lost his knee, the Olympics, and her, all in one night."},
 {n:"pailin",f:"sad",t:"Ladda was four. From that day on, everything the Nakas had, doctors, coaches, labs, data, was poured into one child."},
 {n:"pailin",f:"sad",t:"He didn't raise a daughter. He built an answer to the luck that took everything from him… and Ladda never got to choose, not once."},
 kati?{n:"kati",f:"sad",l:"fight",t:"…Grandpa Chai taught me because I wanted to fight, not because he wanted to beat anyone."}:{n:"coach",t:"…A good teacher doesn't build a fighter to take revenge on anyone."},
 {n:"nar",bg:"camp",show:[],t:"Three days later a black envelope edged in red reaches the camp. No stamp, only one signature everyone knows: Krerk Naka."},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"flustered",l:"fight",t:"Manager, the partner contract we took money for. Clause 30 says: \"Should Naka League lose to the partner camp, this contract shall terminate immediately\""}:{n:"coach",t:"The partner contract we took money for. Clause 30 says if Naka League loses to our camp, the contract ends immediately…"},
   {n:"coach",t:"He was that confident, to write this clause in"}]),
 {n:"coach",t:"Throws allowed, locks allowed… we haven't trained for any of that, not even one day"},
 {n:"coach",t:"We have three weeks. Drill every counter, then on the night we pick one per bout. The card is in the mailbox."}];}
/* v1.91.75 (Man): the original champions have phones — personal words go to her chat; a new champion of a later edition still writes letters */
/* v1.91.78 (Man): the very first personal message is a handwritten letter (with her number on it) — after that she texts */
const RG_PHONE={baibua:"P.S. I wrote my number at the end of the envelope. From now on I'll text you instead.",tabtim:"P.S. Tabtim's number is on the back, okay! From now on just text, it saves on stamps!",alicia:"P.S. My private number is on the back. Not my manager's. Don't give it to anyone.",chaba:"P.S. Number, back of envelope."};
function rgSay(G,r,title,body){const R=G.region,cid=RG_CID0[r];if(G.F[cid]&&!(R.nc&&R.nc[r])&&typeof chatNote==="function"){R.wrote=R.wrote||{};
  if(!R.wrote[cid]&&!(G.chatLastAbs||{})[cid]){R.wrote[cid]=1;addMail(G,{kind:"letter",tone:"region",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title,body:body+"\n\n"+(RG_PHONE[cid]||"")});G.F[cid].met=true;return;}
  R.wrote[cid]=1;chatNote(G,cid,body);return;}
  addMail(G,{kind:"letter",tone:"region",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title,body});}
const RG_VISITMSG={baibua:"Before our next bout, may I drop by Sirichai Camp? I'll bring khao tom mat for everyone.",tabtim:"The next bout's not here yet, so Tabtim's dropping by to see your camp first, okay!",alicia:"Before bout two I'll stop by your camp. Not for content. I'm just passing through.",chaba:"…I'll drop by your camp. Before bout two."};
function rgOrg(G,r,title,body){addMail(G,{kind:"letter",tone:"region",from:"Four Regions Championship organizers",title,body});}
const RG_FPREP={sprawl:{n:"Stop takedowns",d:"Kick them off when they shoot in, and land clinch knees more often"},escape:{n:"Escape locks",d:"Get up off the mat and slip out of locks more often"},strike:{n:"Stand and trade",d:"Ignore the takedowns. Sharpen your strikes and finish it before they drag you down"}};
/* v1.91.57 (Man): the Naka League talk a little before and after their bouts — an introduction the first night, a jab after; Ladda barely speaks */
const NL_SAY={
 nia:{first:"Nia Okafor, boxing. Twelve pro fights, never lost to anyone who couldn't kick up to my face… let's see if you can.",again:"Back again? I had your rhythm counted last time. One, two… down.",
   win:"Your rhythm is half a beat behind my drum.",lose:"…My hands weren't slow. Your legs are just too long."},
 varya:{first:"Varya, sambo. I'm not here to box you. I'm going to take you down and sit on you.",again:"The mat still remembers your back. Come lie down again.",
   win:"There's no Muay Thai on the floor. Only me.",lose:"…That elbow hurt. Next time I take your arm first."},
 meili:{first:"Meili, disciple of the Yaowarat Dragon. My feet are faster than your eyes. Try blinking.",again:"Oh, you're back. Grandma says stubborn people go far… just not today.",
   win:"Did you see my leg? You didn't, did you?",lose:"…Who taught you to come in that close? That's not fair."},
 rosa:{first:"¡Hola, cariño! Corazón Rosa is here! Tonight you fly for the first time in your life.",again:"¡Otra vez! The crowd loves you, you fall so beautifully.",
   win:"¡Olé! Prettiest fall in the whole warehouse!",lose:"…Wow. You knocked my mask crooked. Nobody's ever done that."},
 ladda:{first:"…Come.",again:"Last time you breathed off the beat in round three… I remember.",win:null,lose:null}};
function rgFinalIntro(G){const R=G.region,F=R.final;return [
 {n:"nar",bg:"naka_underground",t:F.tries?"The same warehouse by Khlong Toei port, as dim as last time. The same small crowd stands silent in the shadows":"An old warehouse by Khlong Toei port. Dim lights, the smell of sour syrup drifting from old tanks. In the middle, a ring with black ropes and soft MMA-style mats on the floor"},
 {n:"npc",who:"Khun Krerk",t:F.tries?"Back again, I see. I like that kind of stubbornness":"Welcome. No cameras, no press, no prize money. Just one question"},
 {n:"npc",who:"Khun Krerk",t:"Five bouts, first to three. My daughter fights the last one."},
 {n:"nar",t:"Ladda leans on a pillar in the dark, hood over half her face. She says nothing at all."},
 {n:"coach",t:"Pick a counter for each opponent. Stop the throws, escape the locks, and if you trade, finish it fast."}];}
function rgFinalBetween(G,i,me,o,res,w,l){return [
 {n:"nar",t:`${res==="W"?`${me.name} Win ${o.name}`:res==="D"?`${me.name} Tied with ${o.name}`:`${o.name} Win ${me.name}`} · Sirichai ${w} – ${l} Naka League`}];}
function rgFinalWin(G,w,l,beatLadda,ladFid){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),looked=ladFid==="fah"&&fah?"Fah":"Manager";return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"nar",show:[{id:"npc:krerk"}],t:"Khun Krerk claps slowly from the second-floor balcony. The sound echoes through the whole warehouse"},
 {n:"npc",who:"Khun Krerk",t:"Congratulations, Sirichai Camp… luck was on your side today"},
 /* v1.91.124 (Man): the Naka League were not fighting for real yet — each one says so on the way out */
 {n:"nar",t:"The Naka League walk past Sirichai Camp one by one. None of them lowers her head."},
 {n:"npc",who:NL.nia.name,t:"Only three rounds. My pro fights go twelve... see you when the rounds are long enough."},
 {n:"npc",who:NL.varya.name,t:"Mr. Krerk said no breaking arms tonight, so I only held on. Next time nobody's stopping me."},
 {n:"npc",who:NL.meili.name,t:"Ama forbids the third set of forms outside the house... a shame. I wanted you to see it."},
 {n:"npc",who:NL.rosa.name,t:"¡Hasta luego! The crowd was a little small tonight. My real mask is still in my bag."},
 {n:"npc",who:"Khun Krerk",t:"My team fought by the rules I drew for them. Tonight I only wanted to know what your camp has... now I know."},
 {n:"npc",who:"Khun Krerk",t:"Next time, there are no rules of mine. I'll see you on the international stage."},
 ...(beatLadda?[{n:"nar",show:[{id:"lada",l:"casual"}],t:"Ladda rises slowly from the mat and licks the blood from the corner of her mouth"},{n:"lada",l:"casual",t:"…that was fun"}]
  :[{n:"lada",l:"casual",t:"You beat the team. You haven't beaten me yet"}]),
 {n:"nar",show:[{id:"lada",l:"casual"}],t:`Before following her father out, Ladda stops and looks ${looked} One beat too long. Then she pulls the hood back over her head`},
 /* v1.91.124 (Man): Fah calls her out — the first time anyone asks Ladda what she chose */
 ...rgIf(fah,[
  {n:"fah",f:"angry",l:"casual",with:"lada",t:"Wait! You. Ladda."},
  {n:"nar",show:[{id:"fah",l:"casual"},{id:"lada",l:"casual"}],t:"Ladda stops walking, but doesn't turn around."},
  {n:"fah",f:"angry",l:"casual",with:"lada",t:"You fight that well, but all night you never once looked at your father... are you just a machine? Why do you obey him like that?"},
  {n:"npc",who:"Khun Krerk",t:"Ladda. Let's go."},
  {n:"lada",f:"angry",l:"casual",with:"fah",t:"...Machines don't answer questions."},
  {n:"fah",f:"angry",l:"casual",with:"lada",t:"Fah doesn't even have parents to obey. They left when Fah was little... but at least every fight Fah fights, Fah chose!"},
  {n:"nar",show:[{id:"fah",l:"casual"},{id:"lada",l:"casual"}],t:"Ladda falters half a step. Her hand, gripping the edge of her hood, slowly loosens."},
  {n:"lada",f:"sad",l:"casual",with:"fah",t:"...No one has ever asked me what I chose."},
  {n:"nar",show:[{id:"npc:krerk"}],t:"Mr. Krerk looks at his daughter from the second-floor balcony with an expression no one in the warehouse has seen before, then turns and leaves first."},
  {n:"nar",show:[{id:"fah",l:"casual"}],t:"Ladda follows her father out without another word. The warehouse's steel door slides shut."},
  {n:"fah",f:"pout",l:"casual",t:"...Hey. Did Fah say too much?",choice:[
   {t:"\"Maybe that's the first time in her life anyone has asked her\"",fx:G2=>{add(G2,"fah","bond",2);G2.region.final.fahAsk=1;},then:[{n:"fah",f:"flustered",l:"casual",t:"First time in her life... who could live like that? Fah's not worried about her! Just... annoyed."}]},
   {t:"\"Next time you meet, ask her again\"",fx:G2=>{add(G2,"fah","bond",2);G2.region.final.fahAsk=2;},then:[{n:"fah",f:"happy",l:"casual",t:"I'll ask. I'll keep asking until she answers, even if I have to punch her between questions!"}]}]},
  ...rgIf(rin,[{n:"rin",f:"sad",l:"casual",t:"Ladda fights the modern style, like Fah. I used to think Fah had no sister in her style... after tonight I'm not so sure."},
   {n:"fah",f:"pout",l:"casual",t:"Sisters? No way! Fah doesn't want that! ...Really doesn't."}])]),
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"happy",l:"casual",t:"Clause 30. Naka League lost to its contract partner, so the contract ends immediately. The money is ours. And our data is ours again"}:{n:"coach",t:"Clause 30… Naka League lost to us, the contract's over, and the money's still ours. Ha!"}]),
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"At ringside, the four regional champions have watched since the first bout. No one says a word, but they are all thinking the same thing"},
 /* v1.91.124 (Man): the hook — the back seat of the black car */
 {n:"nar",bg:"night_central",show:[],t:"The Naka family's black car pulls away from the Khlong Toei docks, city lights sliding across the back-seat window."},
 {n:"npc",who:"Khun Krerk",t:"You lost the rhythm twice tonight. Tomorrow the doctor will add hours to your training."},
 {n:"nar",t:"Ladda doesn't answer. She pushes back her hood and looks at her reflection in the window longer than on any other night."},
 ...(fah?[{n:"nar",t:"The silver-haired girl's voice keeps ringing in her head: \"Fah chose!\""}]:[]),
 {n:"coach",bg:"camp",show:[],t:"Let's go home. Five a.m. tomorrow, same as always"},
 ...(fah?[{n:"nar",bg:"camp_night",t:"Late that night Fah sits under the dorm light drawing her fifty-something tiger. In the corner of the page, a small white snake with red-tipped scales lies coiled."},
  {n:"fah",f:"pout",l:"casual",t:"It's nobody's snake! Fah's just doodling... next time, Fah will draw it facing this way."}]:[])];}
function rgFinalLose(G,w,l){return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"npc",who:"Khun Krerk",t:"It's all right. The door is still open. Come back whenever you like"},
 {n:"lada",l:"casual",t:"…not enough yet"},
 {n:"coach",t:"Get hurt, remember it, and come back"}];}
/* v1.91.23 (Man): the week after the underground final — Tiger Boss comes without an envelope (once per save) */
function rgTiger(G){const kati=rgIn(G,"kati"),ploy=rgIn(G,"ploy");return [
 {n:"nar",bg:"camp",show:[{id:"npc:tiger_boss"}],t:"The gold sedan pulls up at the camp like always, but this time Boss Suea gets out alone. No envelope, no entourage. He doesn't even take the cigar out of his shirt pocket."},
 {n:"npc",who:"Boss Suea",t:"No need to put your guard up. I'm not here to buy anyone today."},
 {n:"npc",who:"Boss Suea",t:"Naka sent a letter this morning. Every baht to Phayak Thong, cut. The one job Khun Krerk ever gave me was to get Sirichai Camp shut down… and I couldn't do it."},
 {n:"npc",who:"Boss Suea",t:"Every baht since the month Grandpa Chai passed was his. This car too. I was just the man standing in front of the sign."},
 {n:"coach",t:"And when you took our kids away from this camp back then?"},
 {n:"nar",show:[{id:"npc:tiger_boss_cry"}],t:"Boss Suea pulls out his cigar to light it, and it slips from his fingers. He clutches his head and breaks down crying right there at the camp gate."},
 {n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"…He gave the order, I did it. I thought I was the tiger. Turns out I was just the nameplate."},
 ...rgIf(kati,[{n:"kati",f:"sad",l:"casual",t:"Boss… the older kids who moved over back then, are they still fighting?"},{n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"Every one of them. I'm no good at raising kids, but I never dropped a single one."}]),
 ...rgIf(ploy,[{n:"ploy",l:"casual",t:"So what happens to Phayak Thong now?"},{n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"From now on it runs on my own money. A bit smaller… but finally actually mine."},{n:"ploy",f:"happy",l:"casual",t:"…I'll tell the juniors myself that the boss didn't run off."}]),
 {n:"npc",who:"Boss Suea",img:"tiger_boss_cry",t:"Grandpa Chai told me when I was young: a good punch has to land in the right place. …I never listened.",choice:[
   {t:"Offer your hand",then:[{n:"nar",show:[{id:"npc:tiger_boss"}],t:"Boss Suea wipes his face on his sleeve and looks at the hand so long you think he won't take it. Then he does, firmer than you expected."}]},
   {t:"\"See you in the ring.\"",then:[{n:"npc",who:"Boss Suea",t:"Ha! Deal. Phayak Thong's kids will be waiting… on my own money this time."}]},
   {t:"Nod quietly",then:[{n:"nar",t:"Boss Suea picks his cigar up off the ground, nods back, then turns and walks to his car."}]}]},
 {n:"nar",t:"The gold sedan backs out slowly. For the first time, it doesn't honk at the camp gate."}];}
/* v1.91.114 (Man): the first time the camp reaches each belt province, that region's champion comes to meet them — a longer scene before the hotel,
   one piece of her story per province so the belts pull you on. Going out with her at the hotel has its own night per province (then her usual nights),
   and the camp girl who sulks about it takes turns. */
const RG_RBG={north:"rg_north",isan:"rg_northeast",central:"rg_central",south:"rg_south"};
const rgLine=id=>(f,t,x)=>Object.assign({n:id,f,l:"casual",t},x||{});
const rgProvWon=(G,dest)=>{const D=ROAD_DEST[dest],R=G.region;return !!(D&&R&&(R.belts[D.r]||{})[dest]);};
const rgProvN=(G,r)=>{const M=(G.region&&G.region.provMet)||{};return RG[r].prov.filter(p=>M[p]).length;};
/* her tip about tonight's local champion: only while the belt is still up for grabs */
function rgProvTip(G,dest,steps,who){if(rgProvWon(G,dest))return [];const me=G.F[(G.region.trip||{}).fid];
  return [...steps,{fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},{n:"nar",t:me?`${me.name} saved the tips on her phone · Morale +3`:"Everyone saved the tips on their phones"}];}
/* the camp girl who sulks takes turns: everyone on the trip who is close to you (bond 40+), round and round */
function rgJealGirl(G){const R=G.region,TP=R&&R.trip&&R.trip.party,L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40&&(!TP||TP.includes(f.id))).sort((a,b)=>(b.bond||0)-(a.bond||0));
  return L.length?L[((R&&R.jealN)||0)%L.length]:null;}
const RG_JEALP={
  near:{kati:["Um… {c} was standing a little close, wasn't she? I'm only noticing.","{c} is really nice, isn't she… to you, anyway."],
   mali:["Mali wants a hug too~ …Just kidding. (Not kidding.)","{c} is so cute~ Mali's not jealous. Mali just can't quite smile right now~"],
   rin:["The distance between you and {c} just now was below average. Just data.","{c}… I've added that name to my notebook. Under \"Uncontrollable variables.\""],
   ploy:["What's with the smiling… Nothing. I didn't say anything.","…I'll wait in the van. I'm not sulking. It's just hot."],
   fah:["Hey! {c}! The manager belongs to Sirichai Camp! …I mean, he's the camp's manager!","Why are you smiling like that! …Not that I'm looking!"]},
  date:{kati:["You went walking with {c}? …No, I'm not asking.","I'm not sulking… I'm just going to bed first. And I didn't leave the light on for you."],
   mali:["Mali saw that~ You went out with {c}, didn't you… Mali wants to go too.","Mali saved some snacks for you… but she's eaten half of them, because you took too long~"],
   rin:["Two hours and twelve minutes with {c}. I wasn't timing it. I just happened to look at the clock.","Rin wasn't waiting in the lobby. Rin came down to read the newspaper… yesterday's."],
   ploy:["You went out with {c}? Good for you. …Why are you even asking me?","I wasn't waiting up. My light was on because I was reading… the same book, the same page, all night."],
   fah:["Oh, so you went out with {c}! I'm not sulking! I'm just… hungry!","Not that I care! …But you carried {c}'s stuff for her, didn't you? I saw!"]}};
/* kind: "near" when she is standing next to the champion, "date" after a night out with her */
function rgJealStep(G,champ,mood,kind){const g=rgJealGirl(G);if(!g)return [];const R=G.region,P=(RG_JEALP[kind||"date"]||RG_JEALP.date)[g.id]||["…"],k=Math.floor((R.jealN||0)/2)%P.length;
  return [{n:g.id,f:"pout",l:"casual",t:P[k].replace(/\{c\}/g,champ)},{fx:G2=>{const R2=G2.region;R2.jealN=(R2.jealN||0)+1;if(mood){const f=G2.F[g.id];if(f)f.morale=Math.max(0,(f.morale||0)-mood);}}}];}
const RG_PROV={};
const RG_DATE={};
const RG_DATEP={};
/* ---------- North: Baibua carries her father's ring notebook — one page a province ---------- */
{const B=rgLine("baibua");
 const book=(G,r)=>{const n=rgProvN(G,r);return n>=4?[B("happy","That's all four pages, jao… only the last page is left. Dad wrote the heading but never pasted a ticket: \"Chiang Mai.\" I'll be waiting for you at my home ring for that page, jao."),{n:"nar",t:"Baibua's father's ring notebook: all 4/4 pages"}]
   :[{n:"nar",t:`Baibua's father's ring notebook: ${n}/4 pages · Baibua will show you the rest when you reach each province`}];};
 RG_PROV.chiangrai=(G,D)=>{const opp=REGION.oppName(G,"chiangrai"),kati=rgInT(G,"kati");return {
  meet:[{n:"nar",bg:"hill",t:"The camp van turns into Chiang Rai under a sky so clear you can see the farthest mountains. In the car park outside Wat Rong Khun, one girl stands alone waving a pink handkerchief."},
   B("happy","We've made it to Chiang Rai, jao! I've been waiting since seven… not long, jao. Only three hours."),
   ...rgProvTip(G,"chiangrai",[B("happy",`${opp} grew up at the temples around here, jao. Her finisher is the Wat Rong Khun Elbow, clean and white like the temple, but sharp as glass.`),B("happy","In the first round she'll wait for us to come in first. Don't rush it, jao.")],"Baibua")],
  body:[{n:"nar",bg:"temple",t:"Baibua leads everyone across the white bridge into the temple. Sunlight flashes off the mirrors all over the hall. She stops at a bench under a tree and takes an old cloth-covered notebook out of her basket."},
   B("happy","It's Dad's ring notebook, jao. When he was young he fought all over the North, and in every province he pasted a ticket on its own page."),
   B("happy","This is the Chiang Rai page. Dad won by knockout in the third round, jao. Under the ticket he wrote: \"Chiang Rai has the clearest sky.\""),
   B("flustered","I've wanted to follow this notebook for so long, but there was nobody to come with me… and this year Sirichai Camp came along, jao.",{choice:[
    {t:"\"Then let's follow your dad's notebook together on this trip.\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…Together… Jao. I'll bring the notebook to every province, jao.")]},
    {t:"Ask to see the other pages",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","The other pages have to wait until we reach each province, jao. I'll show you one page at a time. No peeking.")]},
    {t:"\"Your dad must be glad you've kept it so well.\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("sad","Dad has forgotten he ever had this notebook, jao. I found it in a box under the house…"),B("happy","But I remember it for him, jao.")]}]}),
   ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"Sister Baibua, is there an Uttaradit page in the notebook?"},B("happy","It does, jao. It's the thickest page. I'll tell you about it when we get there, Kati.")]),
   ...rgJealStep(G,"Baibua",0,"near"),
   B("happy","This notebook has four pages, jao: Chiang Rai, Nan, Uttaradit, Lampang… only one page has no winning ticket. Guess which one, jao."),
   ...book(G,"north")]};};
 RG_PROV.nan=(G,D)=>{const opp=REGION.oppName(G,"nan");return {
  meet:[{n:"nar",bg:"river",t:"The road winds down from the mountains into Nan. Long racing boats are lined up along the river, and Baibua sits on the prow of one, legs dangling."},
   B("happy","Manager! Over here, jao! Careful, it's slippery. The pier is mossy."),
   ...rgProvTip(G,"nan",[B("happy",`${opp} has paddled racing boats since she was little, jao. Legs as hard as oars. Her finisher is the Nan Racing Boat Knee.`),B("happy","Don't let her grab your neck, jao. Once she locks you and the knees come up, it hurts for days.")],"Baibua")],
  body:[{n:"nar",bg:"temple",t:"Baibua takes everyone to Wat Phumin. On the wall of the hall a man whispers into a woman's ear, and tourists crowd in to take photos."},
   B("happy","This mural is called Pu Man Ya Man, jao. People call it the Whisper of Love… nobody knows what they're whispering."),
   B("flustered","People love posing like the mural… I… I'm not asking you to take one, jao. I'm just telling you.",{choice:[
    {t:"Ask her to pose like the mural",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"Baibua stands still as a statue for three seconds, then nods quickly."},B("flustered","…Whisper anything you like, jao, just don't let me hear it, or I'll be red in the photo."),{n:"nar",t:"The photo comes out blurry because Baibua turns away right as the shutter clicks, but she asks to keep the blurry one."}]},
    {t:"\"If you could whisper one sentence, what would it be?\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…\"Don't go back to Chiang Mai yet,\" jao… wait, I live in Chiang Mai too! I forgot, jao!")]},
    {t:"Praise the painter's work",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","The painter was Tai Lue, jao. The sarong patterns in the mural look just like my grandma's cloth.")]}]}),
   ...rgJealStep(G,"Baibua",0,"near"),
   {n:"nar",t:"Before they leave the temple, Baibua opens her father's ring notebook. The Nan page has a single ticket, no win, only his handwriting: \"Come back someday.\""},
   B("sad","Dad lost here, jao, and never got to come back. His knee went first."),
   B("happy","If Sirichai wins the Nan belt… may I write \"Came back\" under Dad's words, jao?"),
   ...book(G,"north")]};};
 RG_PROV.uttaradit=(G,D)=>{const opp=REGION.oppName(G,"uttaradit"),kati=rgInT(G,"kati");return {
  meet:[{n:"nar",bg:"rg_north",t:"Outside Uttaradit's provincial hall, the statue of Phraya Phichai Dap Hak holds a sword in each hand, one snapped in half. Baibua stands with her palms together at its base."},
   B("happy","We've made it to Uttaradit, jao, the birthplace of Tha Sao boxing… I was so excited I couldn't sleep."),
   ...rgProvTip(G,"uttaradit",[B("happy",`${opp} uses Phraya Phichai's Broken Sword Elbow, jao. The left elbow is the fake, the right one is real.`),B("happy","When the left elbow comes, step back just half a step, jao. A full step and she follows you in.")],"Baibua")],
  body:[B("happy","Did you know, jao? He fought until one of his swords broke, and he still didn't retreat."),
   B("sad","Jin Long resort's thugs threw stones at the spa sign again yesterday, jao… some days I feel like one of my swords has already broken.",{choice:[
    {t:"\"A broken sword still leaves the other one. And you still have someone standing beside you.\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…Someone standing beside me… Jao. I'll remember that, jao.")]},
    {t:"Ask about the Jin Long resort",fx:G2=>rgMeet(G2,"baibua",2),then:[B("sad","They want my family's riverside land to expand the resort, jao. Since we won't sell, they send people to cause trouble every week… our camp fights back every time, but I'm tired, jao."),B("happy","But now I've told you, my heart feels half as heavy, jao.")]},
    {t:"Suggest getting langsat first to clear her head",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","Laplae langsat are the sweetest in the world, jao! I know a good stall. Let's go, jao!")]}]}),
   {n:"nar",t:"Baibua opens her father's ring notebook. The Uttaradit page really is the thickest. Between the tickets there's a dried bodhi leaf."},
   B("happy","Dad picked this bodhi leaf in front of the Tha Sao teachers' shrine, jao. He said you can fight anywhere, but you pay respect to the teachers here first."),
   ...rgIf(kati,[{n:"kati",f:"surprised",l:"casual",with:"baibua",t:"The Tha Sao teachers' shrine… it's in this town?"},B("happy","It is, jao. Come with me, Kati. I'll take you whenever we're free.")]),
   ...rgJealStep(G,"Baibua",0,"near"),
   ...book(G,"north")]};};
 RG_PROV.lampang=(G,D)=>{const opp=REGION.oppName(G,"lampang");return {
  meet:[{n:"nar",bg:"river",t:"Lampang in the morning. Brightly painted horse carriages trot along the road. One waits outside the hotel, and the girl beside the driver waves so hard her hat nearly flies off."},
   B("happy","Get in the carriage, jao! I booked two… you ride in the front one with me, jao, because the back one is… full."),
   ...rgProvTip(G,"lampang",[B("happy",`${opp} uses the Lampang Iron Horse Push Kick, jao. It hits as hard as a bucking horse.`),B("happy","But after the kick she's off balance for half a beat. Counter right then, jao.")],"Baibua")],
  body:[{n:"nar",t:"The carriage rolls past old wooden houses by the Wang River. The horse tosses its head, and Baibua flinches and grabs the manager's sleeve tight."},
   B("flustered","I… I'm a little scared of horses, jao. One ate my hat when I was little.",{choice:[
    {t:"\"Hold on if you like. You don't have to let go.\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…Jao."),{n:"nar",t:"Baibua holds the sleeve until the carriage stops, then forgets to let go for another minute."}]},
    {t:"\"This horse is gentle. Look.\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","…Oh. It really is looking at me, jao. What big eyes.")]},
    {t:"\"The northern champion is scared of horses?\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("pout","…Don't tell anyone, jao. Especially not Tabtim.")]}]}),
   {n:"nar",bg:"market",t:"The carriage stops at a rooster-bowl ceramics shop. Baibua picks bowls for so long that the driver falls asleep on his seat."},
   B("happy","Dad's rice bowl broke last month, jao. He used it for twenty years. I'm buying him a new one."),
   {n:"nar",t:"Baibua opens her father's ring notebook. The Lampang page has a winning ticket and his handwriting: \"Won, but my leg's hurt. The iron horse kicks hard.\""},
   B("sad","It was Dad's last ticket before he quit, jao… after that he stayed at the camp and taught only me."),
   ...rgJealStep(G,"Baibua",0,"near"),
   ...book(G,"north")]};};
 /* her night out, the first time in each province */
 RG_DATE.chiangrai=G=>[{n:"nar",bg:"night_north",t:"Eight o'clock sharp. The clock tower in the middle of Chiang Rai lights up and changes colour to music. Baibua tugs the manager's sleeve and they run to make it in time."},
   B("happy","Just in time, jao! The same man built this clock tower and Wat Rong Khun. The lights change colour every hour, jao."),
   B("flustered","Two years ago I watched it alone when I came here to fight… everyone around me was in pairs, jao.",{choice:[
    {t:"\"You didn't come alone this year.\"",fx:G2=>rgMeet(G2,"baibua",2),then:[B("flustered","…Jao. This year I didn't come alone."),{n:"nar",t:"The lights turn from gold to pink. Baibua watches the lights and won't look at the manager until the song ends."}]},
    {t:"Suggest waiting for the nine o'clock show",fx:G2=>rgMeet(G2,"baibua",3),then:[B("happy","Okay, jao! …While we wait, let's get khanom jeen nam ngiao first. I'm hungry.")]},
    {t:"Take a photo of the lights for her dad",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","Good idea, jao. Dad loves pretty things… but he'll definitely ask who took it.")]}]})];
 RG_DATE.nan=G=>[{n:"nar",bg:"night_north",t:"Nan's Khuang Mueang night market. People eat on mats in front of Wat Phumin. Baibua has already spread a small mat, just big enough for two."},
   B("happy","I bought khao kab and sai ua already, jao. And this mat… it was the only small one left at the stall, jao. I didn't plan it."),
   {n:"nar",t:"A folk band plays salo and sueng fiddles while children dance in front of the hall. The whispering mural glows faintly on the wall.",choice:[
    {t:"Whisper in her ear: \"Thanks for bringing me.\"",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"The khao kab slips out of Baibua's hand."},B("flustered","…Manager! Right under that mural, jao! Everyone saw…")]},
    {t:"Ask about her grandmother",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","Grandma taught me to weave, jao, but every cloth came out crooked. So she said I'd better go box instead.")]},
    {t:"Sit and listen to the music quietly",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"nar",t:"Three songs end. On the fourth, Baibua leans her head on the manager's shoulder and pretends to be asleep."}]}]}];
 RG_DATE.uttaradit=G=>[{n:"nar",bg:"night_north",t:"A rice-soup shop by the Nan River. Baibua orders two bowls of fish rice soup and slides a basket of langsat into the middle of the table."},
   B("sad","I've been practising for three days, jao, telling Dad I'll run the camp so he doesn't have to worry… but every time I see his face, the words won't come."),
   B("flustered","Could you pretend to be my dad, jao…? Just let me practise once.",{choice:[
    {t:"Put on a deep voice: \"Go on, child.\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("happy","Ha ha, Dad's voice isn't that deep, jao!"),B("happy","…Dad, jao, I'll look after Bua Tha Sao Camp myself. Rest your knee… I said it, jao! I said all of it!")]},
    {t:"\"Practise with me, and on the day I'll be standing next to you.\"",fx:G2=>rgMeet(G2,"baibua",3),then:[B("flustered","…Promise, jao? If someone is standing next to me, I can say it for sure.")]},
    {t:"\"Eat some langsat first. You'll be braver on a full stomach.\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("happy","Jao… I've eaten ten already and I'm still not brave enough.")]}]})];
 RG_DATE.lampang=G=>[{n:"nar",bg:"night_north",t:"Kad Kong Ta walking street by the Wang River. Old wooden shophouses glow yellow. Baibua holds her bag with the rooster bowl tight, as if it might break."},
   B("flustered","Could you carry this for me, jao…? It's not heavy. I just want a free hand for… for buying snacks, jao!",{choice:[
    {t:"Carry the bag and offer her your other hand",fx:G2=>rgMeet(G2,"baibua",3),then:[{n:"nar",t:"Baibua looks at the offered hand so long that a passer-by bumps her shoulder, then slowly takes hold of two fingertips."},B("flustered","…Two fingers first, jao.")]},
    {t:"Carry the bag and go buy snacks together",fx:G2=>rgMeet(G2,"baibua",2),then:[B("happy","Khao taen with watermelon syrup, jao! Lampang's best. I bought two bags, and one is yours.")]},
    {t:"\"Careful not to break the bowl.\"",fx:G2=>rgMeet(G2,"baibua",1),then:[B("pout","…Jao. I can carry it myself.")]}]})];
 /* her usual nights after that, in turn */
 RG_DATEP.baibua=[
  G=>[{n:"nar",bg:"night_north",t:"The walking street is crowded tonight. Baibua walks slowly so the manager can keep up."},B("flustered","If we get separated… you can hold on to my sleeve, jao."),{n:"nar",t:"Their hands almost bump a few times, but neither of them says anything."}],
  G=>[{n:"nar",bg:"night_north",t:"The temple fair near the hotel has a balloon-dart stall. Baibua hits one balloon out of ten and wins a tiny elephant doll."},B("flustered","Take it, jao… this elephant looks like you when you're sleepy.")],
  G=>[{n:"nar",bg:"night_north",t:"On the hotel roof the cold wind blows hard and the sky is full of stars. Baibua unwinds her tin-jok scarf and wraps it around the manager."},B("happy","I feel the cold less than you, jao… I've lived up north my whole life."),{n:"nar",t:"Five minutes later Baibua sneezes twice, but she won't take the scarf back."}]];
}

/* ---------- Isan: Tabtim's somtam card — one stamp a province, the prize waits in Korat ---------- */
{const T=rgLine("tabtim");
 const card=(G)=>{const n=rgProvN(G,"isan");return n>=4?[T("happy","All four boxes! The prize is… a fifth mortar of som tam, made by Tabtim herself at home in Korat, when you come to Phimai for the cup."),T("happy","If you lose, Tabtim will still make it for you, but with thirty chillies, haha."),{n:"nar",t:"Tabtim's som tam card: all 4/4 boxes"}]
   :[{n:"nar",t:`Tabtim's som tam card: ${n}/4 boxes · the rest are waiting in other provinces`}];};
 RG_PROV.udon=(G,D)=>{const opp=REGION.oppName(G,"udon"),ploy=rgInT(G,"ploy");return {
  meet:[{n:"nar",bg:"boat",t:"Half past five in the morning. Tabtim has everyone meet at the Nong Han pier, where three small boats wait. Tabtim stands on a prow in a wide-brimmed hat, waving a paddle with both hands."},
   T("happy","How are you, Manager! Get in the boat quick. The red lotus sea only blooms in the morning. By late morning they all close."),
   ...rgProvTip(G,"udon",[T("happy",`${opp} uses the Red Lotus Bloom Kick. High and pretty like a lotus opening, but it opens slowly.`),T("happy","She always lifts her knee high before the kick. When you see the knee come up, step in and cut her off.")],"Tabtim")],
  body:[{n:"nar",t:"The boat glides into the middle of the lake. Red lotuses bloom across the water as far as the eye can see, with thin mist above them. Everyone falls silent at once."},
   T("happy","Pretty, right? Tabtim comes here every year with Mum."),
   {n:"nar",t:"Tabtim pulls a piece of card out of her waist pouch. Written in marker across the top: \"Four-Province Som Tam Card, Certified by Tabtim\", with four empty boxes."},
   T("happy","There are four belts, so there are four som tam shops! Every province we go to, Tabtim takes you to its best one. Fill all four boxes and… there's a prize.",{choice:[
    {t:"Ask what the prize is",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("flustered","Can't tell you! …Fill all four boxes first. No more questions.")]},
    {t:"Ask which shop is the first box",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","Tam sua at Auntie Nu's by the lake, piled with rice noodles.")]},
    {t:"\"I can't really handle spicy food.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","No problem! Tabtim will order mild… five chillies. Mild for Tabtim is five, haha.")]}]}),
   {n:"nar",bg:"somtam_stall",t:"Later that morning at Auntie Nu's stall by Nong Han, Tabtim stamps a mortar-shaped rubber stamp in the first box and writes in small letters: \"Spicy. Four and a half chillies.\""},
   T("sad","Dad used to bring Tabtim fishing here… before Tabtim gave up punching and switched to kicks."),
   T("happy","Hey! Why the long face? Keep eating. The first box means finishing the whole plate!"),
   ...rgIf(ploy,[{n:"ploy",with:"tabtim",f:"happy",l:"casual",t:"Tabtim… you're from a Korat heavy-punch family. Why switch to kicks?"},T("happy","Tabtim's legs are longer than her arms, Sister Ploy, haha. …Tabtim'll tell you later.")]),
   ...rgJealStep(G,"Tabtim",0,"near"),
   ...card(G)]};};
 RG_PROV.khonkaen=(G,D)=>{const opp=REGION.oppName(G,"khonkaen");return {
  meet:[{n:"nar",bg:"rg_northeast",t:"A giant dinosaur stands at the entrance to Khon Kaen. Tabtim stands under it holding up a paper sign: \"Welcome Sirichai Camp to Dinosaur Town\"."},
   T("happy","Manager! Khon Kaen has real dinosaurs! They dug up bones at Phu Wiang. Tabtim's going to kick as hard as a dinosaur's tail!"),
   ...rgProvTip(G,"khonkaen",[T("happy",`${opp} uses the Khon Kaen Silk-Loom Knee. Quick knees like a loom, weaving on and on until you run out of gas.`),T("happy","Don't stay in close for long. Come out and kick from range. She's weak outside.")],"Tabtim")],
  body:[{n:"nar",bg:"food",t:"Tabtim takes everyone to a Khao Suan Kwang grilled-chicken shop. Crispy-skinned chicken covers the table and the crab-and-pla-ra som tam comes by the tray."},
   T("happy","Box two on the card! This shop's crab and pla ra som tam gets five full chillies from Tabtim!"),
   {n:"nar",t:"While they eat, Tabtim's phone buzzes nonstop with messages from the family group chat."},
   T("happy","Tabtim's sibling sent a photo of silk. Mum wove a new piece to sell for the youngest one's tuition."),
   T("happy","Tabtim's the eldest sister to the little ones. Every baht of fight money goes to tuition, haha. That's why Tabtim only has this one jacket.",{choice:[
    {t:"\"You're an amazing big sister.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("flustered","…Don't praise Tabtim like that! Tabtim's out of jokes now.")]},
    {t:"Offer to buy one of her mother's silks",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"Tabtim goes quiet for the longest time since they met."},T("flustered","…Don't feel sorry for Tabtim. But if you really want one, Mum weaves beautifully. Tabtim will send it to you.")]},
    {t:"\"And what do you get for yourself?\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("sad","…"),T("happy","Tabtim gets to box! Boxing every day is enough for her.")]}]}),
   ...rgJealStep(G,"Tabtim",0,"near"),
   ...card(G)]};};
 RG_PROV.buriram=(G,D)=>{const opp=REGION.oppName(G,"buriram");return {
  meet:[{n:"nar",bg:"rg_northeast",t:"Phanom Rung sits on top of an old volcano. Afternoon light shines through its row of stone doorways. Tabtim waits on the naga staircase."},
   T("happy","Buriram! City of castles, city of football… and city of lightning."),
   ...rgProvTip(G,"buriram",[T("happy",`${opp} uses the Phanom Rung Lightning Punch. Fast and hard like lightning, but lightning never strikes the same place twice.`),T("happy","After her first punch she counts one-two before the next one. That's the gap. Kick right in.")],"Tabtim")],
  body:[T("happy","Did you know? Four times a year the sunlight shines through all fifteen doorways exactly. The ancients were great at maths."),
   T("happy","Tabtim's the same. In the ring she calculates every step. Outside it, she calculates nothing, haha."),
   T("sad","Tabtim's dad was a Korat heavy-punch champion… when Tabtim was twelve she chose kicks over punches, because of her long legs."),
   T("sad","Dad never said anything, but he's never come to watch Tabtim fight. Not once.",{choice:[
    {t:"\"Someday your dad will come and watch.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","…If that day comes, Tabtim will throw the most beautiful kick of her life.")]},
    {t:"\"Your kicks come from Korat too.\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("surprised","…!"),T("flustered","If you talk like that, Tabtim's going to cry all over these naga stairs.")]},
    {t:"\"Just keep laughing.\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","Haha, Tabtim's good at that!")]}]}),
   {n:"nar",bg:"somtam_stall",t:"At a som tam stall next to the football stadium Tabtim stamps the third box and writes: \"Thai som tam with crab. Three chillies. Atmosphere ten out of ten.\""},
   ...rgJealStep(G,"Tabtim",0,"near"),
   ...card(G)]};};
 RG_PROV.ubon=(G,D)=>{const opp=REGION.oppName(G,"ubon");return {
  meet:[{n:"nar",bg:"mekong",t:"At Khong Chiam the muddy Mekong meets the blue Mun River in two colours. Tabtim waits on a raft at the water's edge."},
   T("happy","Ubon! Tabtim's been waiting longest for this one."),
   ...rgProvTip(G,"ubon",[T("happy",`${opp} uses the Candle Festival Elbow. Beautifully carved like a festival candle, but slow.`),T("happy","If she keeps walking forward, don't trade elbows. Back off and kick her legs until she can't walk.")],"Tabtim")],
  body:[T("happy","This two-coloured river: they meet but don't mix easily. They flow side by side for kilometres."),
   T("flustered","Tabtim thinks it's like two people… one loud, one quiet, but going the same way… oops, what did Tabtim just say? Forget it, forget it!",{choice:[
    {t:"\"The loud one is you. Who's the quiet one?\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…Not telling! That question's cheating!")]},
    {t:"\"Say that again? I didn't catch it.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("pout","Not saying it again! …Tabtim only says that once a year.")]},
    {t:"Suggest a photo with the river",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","Yes! Stand right on the line where the colours meet, one on each side… haha.")]}]}),
   {n:"nar",bg:"somtam_stall",t:"At a som tam stall by the Mun River in the evening, Tabtim eats half a plate, then takes out the card to stamp it."},
   ...rgJealStep(G,"Tabtim",0,"near"),
   ...card(G)]};};
 RG_DATE.udon=G=>[{n:"nar",bg:"night_isan",t:"That night a mor lam sing band plays behind the market. Tabtim pulls the manager by the hand through the crowd to the front of the stage."},
   T("happy","This band is the most fun in Udon! Can you dance? If not, no problem, Tabtim will teach you.",{choice:[
    {t:"Dance along with Tabtim",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"The manager is off the beat on every move. Tabtim laughs so hard she sits down on the ground, but never lets go of the manager's hand."},T("happy","You dance like a robot! …Tabtim likes it.")]},
    {t:"Stand by the stage holding her water",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","You're a manager even in front of a mor lam stage, haha. Pass the water, Tabtim's throat is dry.")]},
    {t:"Request a song for Tabtim",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"The mor lam singer announces from the stage, \"This song is requested for the redhead down front!\" Tabtim's face goes redder than her hair."}]}]})];
 RG_DATE.khonkaen=G=>[{n:"nar",bg:"night_isan",t:"Bueng Kaen Nakhon lake in the evening, the path full of runners. Tabtim points at the track."},
   T("happy","Race you around the lake! Loser buys sticky rice and grilled pork!",{choice:[
    {t:"Run flat out",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"The manager loses by a mile, but on the last stretch Tabtim runs back to jog alongside."},T("happy","You lose! …But Tabtim came back for you, so it doesn't count as a win, haha.")]},
    {t:"Suggest walking slowly and talking instead",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("happy","Okay, okay, walking's fine… honestly Tabtim's legs are tired, she just didn't want to say.")]},
    {t:"Give up before the race starts",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("pout","Cheater! …Then you're buying Tabtim ten grilled pork skewers.")]}]})];
 RG_DATE.buriram=G=>[{n:"nar",bg:"night_isan",t:"Tabtim takes the manager to sit in the empty stands of a small football pitch. Half the floodlights are still on."},
   T("happy","Tabtim likes open places. You can shout. Being loud is tiring too, you know. You have to shout it all out somewhere before you go home."),
   T("happy","You try shouting.",{choice:[
    {t:"Shout \"Tabtim is the best!\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…! Why are you shouting Tabtim's name! The groundskeeper heard you!")]},
    {t:"Shout a cheer for Sirichai Camp",fx:G2=>rgMeet(G2,"tabtim",2),then:[T("happy","Haha, you really love your camp. Tabtim'll shout too: \"Long live Sirichai… but the Isan cup belongs to Tabtim!\"")]},
    {t:"\"I'd rather listen to you shout.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"nar",t:"Tabtim shouts until she's hoarse: her siblings' tuition, her aching knee, her dad. Then she turns and smiles as if nothing happened."},T("happy","All better! Let's go eat larb.")]}]})];
 RG_DATE.ubon=G=>[{n:"nar",bg:"night_isan",t:"Thung Si Mueang park at night. A giant intricately carved Buddhist Lent candle stands in the middle of the park. Tabtim is circling it for the third time."},
   T("happy","The carvers spend months on a candle like this. One slip and they start over."),
   T("flustered","Tabtim's impatient. She's never managed to carve a candle… but for someone Tabtim wanted to give it to, Tabtim thinks she could wait months too.",{choice:[
    {t:"\"Who are you waiting for?\"",fx:G2=>rgMeet(G2,"tabtim",3),then:[T("flustered","…You ask so straight! How is Tabtim supposed to answer that!")]},
    {t:"Buy her a small carved candle",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"nar",t:"Tabtim holds the little candle in both hands all the way back and won't put it in her bag."}]},
    {t:"\"Being impatient's fine. Your kicks are fast in the ring.\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[T("happy","Exactly! You understand Tabtim best, haha.")]}]})];
 RG_DATEP.tabtim=[
  G=>[{n:"nar",bg:"night_isan",t:"The som tam stall outside the hotel is still open. Tabtim orders three plates."},T("happy","This place is so spicy… hahaha, Tabtim's crying from the chillies."),{n:"nar",t:"Tabtim laughs loud enough for the whole stall to hear, but when you hand her a tissue she goes quiet for a moment."}],
  G=>[{n:"nar",bg:"night_isan",t:"At the karaoke bar outside the hotel, Tabtim belts out a luk thung song, then hands the manager the mic for the sweet part."},T("flustered","You sing this part! …The \"I miss you\" part. Tabtim can't sing it, too embarrassing.")],
  G=>[{n:"nar",bg:"night_isan",t:"At the night market Tabtim orders two pan-fried egg sets, finishes hers, and stares at the manager's."},T("happy","That fried egg is looking at Tabtim… it wants Tabtim to eat it, haha.")]];
}

/* ---------- South: Chaba picks one shell a province for her brother's wind chime ---------- */
{const C=rgLine("chaba");
 const chime=(G)=>{const n=rgProvN(G,"south");return n>=4?[C("happy","…All four."),C("flustered","I'll string it in Phuket. …Manager. Come help string it. When you come for the cup."),{n:"nar",t:"Chaba's seashell wind chime: all 4/4 shells"}]
   :[{n:"nar",t:`Chaba's seashell wind chime: ${n}/4 shells · the next one is waiting in another province`}];};
 RG_PROV.chumphon=(G,D)=>{const opp=REGION.oppName(G,"chumphon");return {
  meet:[{n:"nar",bg:"phuket_beach",t:"Thung Wua Laen beach in the morning. A faded sidecar motorbike is parked on the sand. Chaba squats at the water's edge and doesn't turn around until the camp van has stopped."},
   C("happy","…You're here. Chumphon. Gateway to the South."),
   ...rgProvTip(G,"chumphon",[C("happy",`${opp} uses the Swooping Gull Kick. …Swoops down from above. Fast.`),C("happy","…But after the swoop, she has to climb. When she climbs, go in.")],"Chaba")],
  body:[{n:"nar",t:"Chaba bends down and picks up an orange-pink shell, rinses it in the sea and holds it up to the sun."},
   C("happy","…For my brother."),
   C("happy","My brother can't leave home for long. Wherever I go, I bring back a shell. For a wind chime. In his window."),
   C("flustered","…Four provinces, four shells. Then I string them. …Help me look. Okay?",{choice:[
    {t:"Get down and help her search properly",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"Ten minutes later the manager holds out a lopsided heart-shaped shell. Chaba looks at it a long time, then puts it in her shirt pocket, not the shell bag."},C("flustered","…This one. Not for my brother.")]},
    {t:"\"Your brother will love it.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…Mm. He likes the sound of the sea.")]},
    {t:"\"Why not bring your brother along?\"",fx:G2=>rgMeet(G2,"chaba",1),then:[C("sad","…Someday. When his leg's better.")]}]}),
   {n:"nar",t:"Before they leave the beach, Chaba hands everyone a bunch of lady-finger bananas without a word, except when she hands one to the manager."},
   C("happy","…This bunch. Sweetest."),
   ...rgJealStep(G,"Chaba",0,"near"),
   ...chime(G)]};};
 RG_PROV.surat=(G,D)=>{const opp=REGION.oppName(G,"surat"),mali=rgInT(G,"mali");return {
  meet:[{n:"nar",bg:"market",t:"Mid-morning at the market on the Tapi River. Chaba stands at an oyster stall holding two bags of rongrien rambutans."},
   C("happy","…Surat. Chaiya's not far."),
   ...rgProvTip(G,"surat",[C("happy",`${opp} uses the Don Sak Oyster Elbow. …Closes up tight. Like an oyster.`),C("happy","…Wait for her to open up. When she throws the elbow, underneath is open.")],"Chaba")],
  body:[{n:"nar",t:"Chaba shucks big oysters for everyone, so fast the vendor turns to watch."},
   C("happy","…My brother taught me. As a kid."),
   ...rgIf(mali,[{n:"mali",with:"chaba",f:"happy",l:"casual",t:"You still shuck oysters as fast as ever, Chaba…"},C("happy","…Eat.")]),
   C("happy","…Can you shuck?",{choice:[
    {t:"Ask Chaba to open one for you",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"Chaba shucks the biggest one on the tray, squeezes lime, sprinkles fried shallots and sets it in front of the manager, all without once looking at their face."}]},
    {t:"Try shucking one yourself",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"The knife slips, and Chaba catches the manager's hand just in time."},C("flustered","…Clumsy. Don't. I'll do it.")]},
    {t:"Ask about her brother",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…Best oyster shucker in the village. Still is. He can do it sitting down.")]}]}),
   {n:"nar",t:"One oyster shell is lined with rainbow mother-of-pearl. Chaba rinses it and wraps it in a tissue."},
   ...rgJealStep(G,"Chaba",0,"near"),
   ...chime(G)]};};
 RG_PROV.nakhonsi=(G,D)=>{const opp=REGION.oppName(G,"nakhonsi");return {
  meet:[{n:"nar",bg:"temple",t:"In front of Wat Phra Mahathat in Nakhon Si Thammarat, the white chedi with its golden spire towers into the sky. Chaba waits under a tree, as expressionless as ever."},
   C("happy","…Nakhon. Good curry rice. Eat first, talk later."),
   ...rgProvTip(G,"nakhonsi",[C("happy",`${opp} uses the Shadow Puppet Punch. …Moves a lot, fakes a lot, like working a puppet.`),C("happy","…Watch the feet, not the hands. Feet don't lie.")],"Chaba")],
  body:[{n:"nar",bg:"nangtalung",t:"That afternoon Chaba takes everyone to an old shadow-puppet house, where a craftsman is punching patterns into cowhide for a clown figure."},
   C("happy","…I like Ai Teng. Deadpan, never smiles, but the audience laughs.",{choice:[
    {t:"\"He's just like you.\"",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…Not like me."),{n:"nar",t:"But on the way out of the shop, Chaba buys a small Ai Teng puppet and hands it to the manager."}]},
    {t:"Ask Chaba to try working a puppet",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"Chaba works the Ai Teng puppet and says in a deep southern voice, \"The Sirichai manager is not as handsome as Ai Teng.\" Everyone roars with laughter. Chaba's face doesn't move."}]},
    {t:"Buy a puppet for Chaba's brother",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…My brother likes Ai Teng. He'll hang it next to the wind chime.")]}]}),
   {n:"nar",bg:"phuket_beach",t:"On the way back Chaba stops at a beach outside town, searches bent over for a long time, then holds up a tiger-striped shell."},
   ...rgJealStep(G,"Chaba",0,"near"),
   ...chime(G)]};};
 RG_PROV.songkhla=(G,D)=>{const opp=REGION.oppName(G,"songkhla");return {
  meet:[{n:"nar",bg:"sea",t:"Samila Beach at dusk. The golden mermaid statue combs her hair on a rock. Chaba stands beside it with her arms folded, just as expressionless."},
   C("happy","…Songkhla. Farthest one. Drive okay?"),
   ...rgProvTip(G,"songkhla",[C("happy",`${opp} uses the Samila Mermaid Kick. …Kick and back off, back off and kick. Like waves.`),C("happy","…Don't chase. Wait. The wave comes back on its own.")],"Chaba")],
  body:[C("happy","…People touch the mermaid's hair. For good grades."),
   C("flustered","…I touched it before my final-year exam. Failed.",{choice:[
    {t:"Burst out laughing",fx:G2=>rgMeet(G2,"chaba",2),then:[C("pout","…Funny, is it."),{n:"nar",t:"Chaba glares, but the corner of her mouth twitches."}]},
    {t:"\"Touch it again and wish to win every fight.\"",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"Chaba reaches out, touches the mermaid's hair, then turns to look back."},C("flustered","…Wished. For you too.")]},
    {t:"\"You failed, but you became the regional champion.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…Mm. Better.")]}]}),
   {n:"nar",t:"Chaba walks down to the water's edge, picks up a tiny white shell, and hands it to the manager to hold for now."},
   ...rgJealStep(G,"Chaba",0,"near"),
   ...chime(G)]};};
 RG_DATE.chumphon=G=>[{n:"nar",bg:"night_south",t:"Chumphon's river mouth at night. Squid boats light up the sea in green rows like a floating town. Chaba sits on the fish pier, legs dangling."},
   C("happy","…My brother used to go out on boats like that. I'd sit here waiting. Counting lights."),
   C("flustered","…Tonight. Count with me. Okay?",{choice:[
    {t:"Sit and count the lights together",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"One hundred and forty-two boats. Chaba falls asleep on the manager's shoulder at forty, and the manager counts the rest alone."}]},
    {t:"\"You miscounted. There are two over there.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("pout","…Start over."),{n:"nar",t:"Chaba starts over three times, as if she miscounts on purpose."}]},
    {t:"Buy grilled squid to eat while you sit",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…Tasty.")]}]})];
 RG_DATE.surat=G=>[{n:"nar",bg:"night_south",t:"The walking street along the Tapi River. Chaba passes a toy shop, stops at a round seal plushie for three seconds, then walks on as if nothing happened.",choice:[
    {t:"Go back and buy it for her",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…Didn't want it."),{n:"nar",t:"But Chaba hugs the seal tight all the way to the hotel."}]},
    {t:"\"You like that one?\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("flustered","…No."),C("flustered","…A little.")]},
    {t:"Pretend you didn't notice",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"nar",t:"Chaba looks back at the toy shop twice more before they reach the hotel."}]}]}];
 RG_DATE.nakhonsi=G=>[{n:"nar",bg:"night_south",t:"A late-night tea shop in Nakhon. The place is full of people watching football. Chaba orders two hot teas and a plate of roti mataba."},
   C("happy","…Tea shop. Southerners talk about everything here. Politics, boxing, dogs."),
   C("happy","…What should we talk about.",{choice:[
    {t:"\"You.\"",fx:G2=>rgMeet(G2,"chaba",3),then:[C("flustered","…About me. Nothing to tell."),{n:"nar",t:"But Chaba tells the longest story about herself since they met. Five whole sentences: her cat, her brother, the sea. Then she stops, red-faced."}]},
    {t:"\"Boxing.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…Okay. All night."),{n:"nar",t:"The two of them sketch fight plans on tissues until the table is covered."}]},
    {t:"\"We don't have to talk. Let's just sit.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…I like this.")]}]})];
 RG_DATE.songkhla=G=>[{n:"nar",bg:"night_south",t:"Songkhla old town at night. Old Chinese shophouses glow orange. Chaba stops in front of a mural of two children riding double on a motorbike."},
   C("happy","…Like me and my brother. When we were little."),
   C("flustered","…Take a photo. Me next to the painting.",{choice:[
    {t:"Take hers, then ask for one together",fx:G2=>rgMeet(G2,"chaba",3),then:[{n:"nar",t:"In the photo together Chaba stands half a step away, but as the shutter clicks she shifts in close."}]},
    {t:"Take photos from lots of angles",fx:G2=>rgMeet(G2,"chaba",2),then:[C("happy","…This angle. Good. Sending it to my brother.")]},
    {t:"\"Smile a little.\"",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"Chaba smiles so wide her eyes crinkle, the first smile in any photo of her, then hurries to grab the phone to delete it. The manager won't let her."}]}]})];
 RG_DATEP.chaba=[
  G=>[{n:"nar",bg:"night_south",t:"The beach in front of the hotel. The sea is quiet at night, only the sound of waves."},C("happy","…The sea is pretty at night."),{n:"nar",t:"Chaba says nothing more, but she stays beside you until the tide reaches her ankles."}],
  G=>[{n:"nar",bg:"night_south",t:"Chaba takes the manager in her sidecar out to a cape past town to watch the moon rise from the sea."},C("happy","…No need to talk. Just watch."),{n:"nar",t:"The whole moon clears the water. Chaba glances over to check the manager is watching, then quickly looks away."}],
  G=>[{n:"nar",bg:"night_south",t:"At the roti stall outside the hotel, Chaba orders two plates of banana roti and puts both in front of the manager."},C("happy","…Eat it all. Too thin.")]];
}
/* ---------- Central: Alicia shoots one vlog episode a province ---------- */
{const A=rgLine("alicia");
 const vlog=(G)=>{const n=rgProvN(G,"central");return n>=4?[A("happy","That's all four episodes! The special episode… I'll shoot it in Ayutthaya, the day you come for the cup."),A("flustered","I'll turn the camera off for that one. It's an episode that won't go on the channel… with an audience of one."),{n:"nar",t:"Alicia's vlog \"Four Provinces with Sirichai Camp\": all 4/4 episodes"}]
   :[{n:"nar",t:`Alicia's vlog "Four Provinces with Sirichai Camp": episode ${n}/4 · the next episode is shot in the next province`}];};
 RG_PROV.lopburi=(G,D)=>{const opp=REGION.oppName(G,"lopburi");return {
  meet:[{n:"nar",bg:"rg_central",t:"Outside the Phra Kan shrine in Lopburi, Alicia stands with a camera on a gimbal and sunglasses on, two monkeys sitting on her shoulders."},
   A("happy","Welcome to Lopburi~ Don't laugh! The monkeys climbed up on their own. I did not plan for them to be part of the content!"),
   ...rgProvTip(G,"lopburi",[A("happy",`${opp} uses the Monkey Trick Punch. Fakes left, fakes right, like a monkey snatching your stuff.`),A("happy","But she fakes three times before the real punch. Count in your head and slip on the third.")],"Alicia")],
  body:[A("happy","I have a new project: a vlog series, \"Four Provinces with Sirichai Camp\". One episode in every province we visit."),
   A("flustered","Not because I want to see you more often! The sponsors asked… the fans asked… everyone asked."),
   {n:"nar",t:"The monkey on Alicia's shoulder snatches her sunglasses and runs off up the prang.",choice:[
    {t:"Run and get her sunglasses back",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"nar",t:"The manager trades a bunch of bananas for the sunglasses. The monkey looks very pleased. Alicia looks more pleased."},A("flustered","…I'm keeping this scene to watch by myself. It's not going on the channel.")]},
    {t:"Film Alicia chasing the monkey",fx:G2=>rgMeet(G2,"alicia",2),then:[A("pout","Don't you dare post that! …If you do, credit me as the lead actress.")]},
    {t:"\"You look prettier without the sunglasses.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…! The live isn't on, is it? It's not on, right!")]}]},
   ...rgJealStep(G,"Alicia",0,"near"),
   ...vlog(G)]};};
 RG_PROV.suphan=(G,D)=>{const opp=REGION.oppName(G,"suphan");return {
  meet:[{n:"nar",bg:"rg_central",t:"On the viewing deck of the tall tower in the middle of Suphan, Alicia presses against the glass and points her camera at rice fields stretching to the horizon."},
   A("happy","Good morning! From up here you can see all of Suphan… this episode needs an epic opening."),
   ...rgProvTip(G,"suphan",[A("happy",`${opp} uses the Suphan Master's Kick. Straight from the textbook, never a miss.`),A("happy","But a textbook is a textbook. She kicks on the same beat every time. Once you catch the rhythm you can counter every kick.")],"Alicia")],
  body:[{n:"nar",bg:"market",t:"That afternoon at Sam Chuk, the hundred-year-old wooden market on the Tha Chin River, Alicia films the old coffee shop, the sweet shop, the barber, everything except herself."},
   A("sad","You know the most common comment on my channel? \"Pretty but can't fight.\" I train six hours a day, and people still write that."),
   A("sad","That's why I'd rather film other people.",{choice:[
    {t:"\"Then today I'll film you.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"The manager follows Alicia through the market with the camera. She walks stiff as a robot for ten minutes, then slowly starts laughing on her own while biting into a hot pastry."},A("flustered","…I'm keeping this clip for myself. It's not going on the channel.")]},
    {t:"\"Nobody who's seen you fight for real would write that.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…You talk like someone I've already punched.")]},
    {t:"\"Maybe read fewer comments.\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","I know… but I can't. Comments are my job.")]}]}),
   ...rgJealStep(G,"Alicia",0,"near"),
   ...vlog(G)]};};
 RG_PROV.phetchaburi=(G,D)=>{const opp=REGION.oppName(G,"phetchaburi");return {
  meet:[{n:"nar",bg:"hill",t:"At the cable-car station up to Khao Wang, Alicia waits with five boxes of khanom mo kaeng stacked in her arms."},
   A("happy","Phetchaburi! The most famous khanom mo kaeng shop. You have to queue early… I didn't queue myself, my assistant did. …Okay, I queued. An hour and a half."),
   ...rgProvTip(G,"phetchaburi",[A("happy",`${opp} uses the Khao Wang Knee. Her knees come up high like climbing a hill. Very heavy.`),A("happy","She always grabs the neck first. The moment her hand touches your neck, push your elbow out. Don't wait.")],"Alicia")],
  body:[{n:"nar",t:"At the top of Khao Wang the wind blows hard, and all of Phetchaburi spreads below. Alicia sets up her camera, then puts it down without pressing record."},
   A("sad","My personal manager called this morning about the Naka contract again. I told him I was filming a vlog and hung up."),
   A("sad","Sometimes I wish I were just an ordinary boxer. Nobody knows me, and after training I come up the hill for sweets. No camera.",{choice:[
    {t:"\"There's no camera now.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…That's true."),{n:"nar",t:"Alicia takes a big bite of khanom mo kaeng, gets it on the corner of her mouth, and laughs without caring who sees."}]},
    {t:"\"People know you because you fight well.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…You always say exactly what I want to hear, don't you.")]},
    {t:"Share the khanom mo kaeng",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","That box is yours. Taro. I picked it for you… not because I remembered you like taro. Coincidence.")]}]}),
   ...rgJealStep(G,"Alicia",0,"near"),
   ...vlog(G)]};};
 RG_PROV.chanthaburi=(G,D)=>{const opp=REGION.oppName(G,"chanthaburi");return {
  meet:[{n:"nar",bg:"market",t:"Chanthaburi's gem market on a Saturday morning. Traders inspect stones all along the street. Alicia sits at a gem table with a tiny loupe like an expert."},
   A("happy","Today I'll teach everyone how to spot a real gem! …I can't, actually. But holding a loupe makes me look like I can."),
   ...rgProvTip(G,"chanthaburi",[A("happy",`${opp} uses the Mangosteen Shell Punch. Her guard is as tight as a mangosteen rind. Hard to crack.`),A("happy","Don't bother cracking the shell. Keep kicking her legs. However hard the shell is, the legs are still soft.")],"Alicia")],
  body:[{n:"nar",bg:"river",t:"That afternoon Alicia walks everyone through the Chanthaboon waterfront community. Old wooden houses line the river, and a big cathedral stands on the far bank."},
   A("happy","I came to a training camp here when I was fifteen. It was the first time someone told me I fought well, not that I was pretty."),
   A("flustered","…It was the mangosteen lady, ha ha. She watched me train every day and gave me a free bag of mangosteens.",{choice:[
    {t:"Go and look for that mangosteen seller together",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"The mangosteen stall is still in the same spot. The vendor recognises Alicia at once and shouts, \"It's little Heavy Hands!\" Alicia runs in and hugs her like a child."}]},
    {t:"\"I think you fight well too. Not just pretty.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("pout","…Not pretty at all?"),A("flustered","Kidding! …Thank you.")]},
    {t:"Help her keep filming the vlog",fx:G2=>rgMeet(G2,"alicia",1),then:[A("happy","Sure! The light is lovely here. You stand over there… in the frame, too.")]}]}),
   ...rgJealStep(G,"Alicia",0,"near"),
   ...vlog(G)]};};
 RG_DATE.lopburi=G=>[{n:"nar",bg:"night_central",t:"A late-night café facing Phra Prang Sam Yot. Monkeys sleep in a row on the power lines like beads. Alicia turned her phone face down the moment she sat."},
   A("happy","No live tonight. No filming, no posting… I want to see how ordinary people go on dates."),
   A("flustered","…Not a date! I mean going out for coffee!",{choice:[
    {t:"\"Then ordinary people just sit and talk.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"They talk until the café closes. Alicia doesn't touch her phone once."}]},
    {t:"\"It can be a date.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…! You said it, not me. Remember that.")]},
    {t:"Take a photo of the monkeys on the wires",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","So now you're taking photos for me? …Fine. Send them to me.")]}]})];
 RG_DATE.suphan=G=>[{n:"nar",bg:"night_central",t:"The Wat Pa Lelai temple fair is packed tonight. The Ferris wheel turns slowly. Alicia buys two tickets without asking."},
   {n:"nar",t:"The gondola stops right at the top. The wind is cool, and Alicia grips the rail tight."},
   A("flustered","I'm not scared of heights… I'm scared of getting stuck up here for a long time.",{choice:[
    {t:"Offer your hand",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"Alicia holds the hand tight all the way down, then lets go very fast and pretends to fix her hair."}]},
    {t:"Point out the lights of the whole town",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…It's beautiful. I'll remember it without a photo.")]},
    {t:"Rock the gondola to tease her",fx:G2=>rgMeet(G2,"alicia",1),then:[A("angry","…! When we get down you're getting one uppercut!")]}]})];
 RG_DATE.phetchaburi=G=>[{n:"nar",bg:"night_central",t:"Cha-am beach at night. Seafood restaurants glow along the shore. Alicia carries her white boots and walks barefoot on the sand."},
   A("happy","These are the most expensive boots I own, and the most painful to wear… just like fame.",{choice:[
    {t:"\"I'll carry your boots, then.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","…Carrying a girl's shoes on the beach. If my viewers saw that, the whole channel would scream… lucky no one's watching.")]},
    {t:"Take your shoes off and walk barefoot with her",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"A wave washes up over both their ankles. Alicia lets out a small shriek, then laughs louder than she ever does on a live."}]},
    {t:"\"Fame is also how people see that you fight well.\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("happy","…You're such an optimist.")]}]})];
 RG_DATE.chanthaburi=G=>[{n:"nar",bg:"night_central",t:"At a sweet shop in an old wooden house on the Chanthaboon waterfront, Alicia orders two bags of kanom kai and sits unusually still."},
   A("happy","Can I ask you one thing? And you can't answer like a camp manager."),
   A("flustered","If I weren't a champion, with no channel and no viewers… would you still come walking with me?",{choice:[
    {t:"\"Of course.\"",fx:G2=>rgMeet(G2,"alicia",3),then:[A("flustered","…You answered too fast. You didn't even think."),A("happy","…But I like that you didn't think.")]},
    {t:"\"Of course. But I'd probably have to pay for the snacks myself.\"",fx:G2=>rgMeet(G2,"alicia",2),then:[A("happy","Ha ha, you… Fine. The kanom kai is on me.")]},
    {t:"\"Why do you ask?\"",fx:G2=>rgMeet(G2,"alicia",1),then:[A("pout","…I'm not asking anymore.")]}]})];
 RG_DATEP.alicia=[
  G=>[{n:"nar",bg:"night_central",t:"At a riverside café Alicia sits across the table, dressed up as if for an event."},A("happy","Don't get the wrong idea. I just wanted someone to walk with. The camera's off tonight…"),{n:"nar",t:"Alicia leaves her phone face down on the table all night. She never picks it up once."}],
  G=>[{n:"nar",bg:"night_central",t:"The mall downtown is still open. Alicia drags the manager into a clothes shop and holds shirts up against him one by one."},A("flustered","This one. Not because I like it. The colour just goes with my jacket.")],
  G=>[{n:"nar",bg:"night_central",t:"At an ice-cream shop by the river, Alicia takes twenty photos of her ice cream until it melts all over."},A("pout","Don't laugh! …You can help me eat it before it drips, if you like.")]];
}

/* ---------- v1.91.121 (Man): off-schedule fights — a champion's own trouble spills into a camp trip ----------
   2nd+ trip to her region (not the trip that first met her), first hotel night, once; before she joins the camp.
   Consecutive bouts, the player sends someone from the travelling party for each, no lingering injury; a loss or a retreat = try again on a later trip. */
if(typeof QK!=="undefined")Object.assign(QK,{
  jl1:{fst:"pressure",name:"Jin Long thug in a black leather jacket",sprite:"rg_jinlong1",lvl:-1,tilt:{punch:1.5,power:1,iq:-2,guard:-1,comp:-1},color:"#3c6e5a",grp:"gang"},
  jl2:{fst:"inside",name:"Hia Long's right hand",sprite:"rg_jinlong1",lvl:-.2,tilt:{punch:1,knee:1.5,power:1,iq:-1},color:"#2f5546",grp:"gang"},
  jl3:{fst:"power",name:"Hia Long, Jin Long gang boss",sprite:"rg_jinlong2",lvl:.6,tilt:{power:2,punch:1.5,dur:1,foot:-1},color:"#c9a227",grp:"gang"}});
const RG_SIDE={
 north:{cid:"baibua",bg:"camp_buatasao",ring:"bg_camp_buatasao.webp",title:"Off-schedule fight · Bua Tha Sao spa",
  foes:[{qk:"jl1",t:"I don't care which camp you are. I've kicked a lamppost in half."},{qk:"jl2",t:"Running out of fighters? Your next one's going to sleep too."},{qk:"jl3",t:"Those first two were soft. I'm not soft like them."}],
  between:["The next thug rolls up his sleeves and steps through the ropes.","Hia Long throws off his suit jacket and climbs into the ring himself."],
  intro:G=>[{n:"nar",t:"At dusk, just as everyone gets back to the hotel, the manager's phone rings. It's Baibua."},
   {n:"baibua",f:"sad",l:"casual",t:"Manager... the Jin Long thugs are at the spa again. A whole van of them."},
   {n:"baibua",f:"sad",l:"casual",t:"Dad's going to go out there even with his bad knee. I can't stop him."}],
  go:"\"Stay there. The camp is on its way.\"",no:"\"Everyone's exhausted tonight. I'm sorry.\"",
  noT:G=>[{n:"baibua",f:"sad",l:"casual",t:"...It's all right. I understand. A camp has to look after its own people first."},{n:"nar",t:"Baibua hangs up first. The shouting is still going on at her end."}],
  arrive:G=>[{n:"nar",bg:"camp_buatasao",t:"The camp van turns into the Bua Tha Sao lane while the sky is still red. Five or six men in black leather jackets stand around the massage shop's sign, sprayed over in red paint."},
   {n:"npc",who:"Jin Long thug",t:"Which boxing camp are you? This is none of your business."},
   {n:"baibua",f:"angry",l:"casual",t:"Our land isn't for sale! Whoever wants it can climb into the ring behind the camp and take it."},
   {n:"npc",who:"Hia Long",t:"Fine. Three bouts. Win them all and I'll back off for now. Lose one, and we come every night until your father signs."},
   {n:"coach",t:"The practice ring behind the camp will do. Whoever's ready, step up. Don't push it if you're too tired."}],
  win:G=>[{n:"nar",t:"Hia Long hits the canvas of the practice ring. His men haul him into the van in a hurry."},
   {n:"npc",who:"Hia Long",img:"hialong_angry",t:"Remember this! Sia Jin Long won't stop here!"},
   {n:"nar",t:"A phone lies beside the ring, its screen still lit. The latest message, from \"Sia Jin Long\": Make it bad enough that her father sells. Five thousand a night."},
   {n:"baibua",f:"surprised",l:"casual",t:"This is... proof the resort hired thugs!",choice:[
    {t:"Take photos of it, and go to the police together tomorrow morning",fx:G2=>{rgMeet(G2,"baibua",4);G2.region.side.north.how="police";},then:[{n:"baibua",f:"flustered",l:"casual",t:"Together...? Okay. I'll be waiting outside the station first thing."}]},
    {t:"Send it to the local press so the whole province knows",fx:G2=>{rgMeet(G2,"baibua",3);G2.region.side.north.how="news";},then:[{n:"baibua",f:"happy",l:"casual",t:"Let all of Uttaradit know who's been causing trouble... good. They'll be too ashamed to come back."}]}]},
   {n:"nar",t:"Baibua's father limps out of the house and gives a wai to everyone from the camp, one by one."},
   {n:"baibua",f:"happy",l:"casual",t:"Thank you, all of you... Sirichai Camp really came to help."}],
  lose:G=>[{n:"npc",who:"Hia Long",t:"Ha! So that's all a boxing camp's got. We'll be back tomorrow!"},
   {n:"baibua",f:"sad",l:"casual",t:"It's all right. Everyone's hurt already, go back and rest... you came to help, that's enough to make me happy."},
   {n:"coach",t:"Next time we're up north, we take it back."}],
  /* v1.91.126 (Man): the massage minigame, then Krerk's offer — she turns it down */
  after:(G,T,cb)=>{const ids=[...new Set(T.sideFought||[])];
   playScene([{n:"baibua",f:"sad",l:"casual",t:"Everyone's bruised all over... come into the spa first. I'll give you a massage."},
    {n:"baibua",f:"flustered",l:"casual",t:"Manager, help me, please. I'll teach you to find the sen lines. So many are hurt, my two hands can't keep up."}],()=>RG_MAS.open(ids,q=>playScene([
    {n:"baibua",f:q!=null&&q>=.6?"happy":"flustered",l:"casual",t:q!=null&&q>=.6?"You find the sen lines like you've done massage before... Mum would hire you for sure.":"A bit heavy-handed, but everyone's sleeping soundly now. Not bad."},
    {n:"nar",t:"Before the massage is even finished, a long black car pulls up outside the spa, its headlights cutting through the bamboo blinds."},
    {n:"nar",show:[{id:"npc:krerk"}],t:"Krerk Naka steps out of the back seat, his dark suit without a single crease."},
    {n:"npc",who:"Khun Krerk",t:"Forgive me for coming so late. I've known about the Jin Long resort since last month."},
    {n:"npc",who:"Khun Krerk",t:"Miss Baibua, if you sign with the Naka League, one phone call from me and tomorrow no one will dare touch this land again. The camp, the spa, your mother's lotus pond, all safe."},
    {n:"nar",show:[{id:"baibua",l:"casual"}],t:"Baibua grips the hem of her shirt and glances at the manager.",choice:[
     {t:"Say nothing and let Baibua decide",fx:G2=>rgMeet(G2,"baibua",2)},
     {t:"\"Our camp can help, without you having to trade anything\"",fx:G2=>rgMeet(G2,"baibua",3)}]},
    {n:"baibua",f:"happy",l:"casual",t:"Thank you, Mr. Krerk. But this is my home, and I'll fight for it myself... with the people who stood beside me tonight."},
    {n:"npc",who:"Khun Krerk",t:"I respect your answer."},
    {n:"npc",who:"Khun Krerk",t:"But remember, luck doesn't always side with good people... I know that better than anyone."},
    {n:"nar",show:[{id:"baibua",l:"casual"}],t:"The black car backs slowly out of the lane. Baibua stands still until its tail lights are gone, her hands still shaking."},
    {n:"baibua",f:"flustered",l:"casual",t:"I almost said yes... if you hadn't been standing right here."}],cb,{bg:"camp_buatasao",look:"casual"})),{bg:"camp_buatasao",look:"casual"});},
  /* the trouble ends: the evidence works, the resort backs off */
  done:(G,how)=>addMail(G,{kind:"letter",from:"Baibua",title:"News from Bua Tha Sao",body:how==="news"?
   "Dear Manager,\n\nWe made the front page of the Uttaradit paper: \"Resort hires thugs to harass local spa.\" The whole province shared it. The Jin Long resort came out to apologise and withdrew its offer for our land.\n\nMum is sending free massage cards for the whole camp. They're good for life.\n\nBaibua":
   "Dear Manager,\n\nThe police called Sia Jin Long in for questioning. The messages on that phone were so clear he couldn't argue. This morning the resort sent a letter withdrawing its offer for our land.\n\nDad says that on the day you stood waiting with me outside the police station, he saw it from the car window... he smiled all day.\n\nBaibua"})}};
/* v1.91.126 (Man): Baibua's minigame — traditional Thai massage at the Bua Tha Sao spa after the Jin Long fight.
   A ring closes on each pressure point along the sen lines; tap as it meets the point. Three grades: ตรงเส้น / ใกล้เส้น / พลาด. */
const RG_MAS={st:null,N:6,
  css(){if(document.getElementById("rgmas-css"))return;const s=document.createElement("style");s.id="rgmas-css";s.textContent=`
#rgmas{background:linear-gradient(rgba(10,6,22,.72),rgba(10,6,22,.88)),url(a/bg_camp_buatasao.webp) center/cover}#rgmas .mbox{gap:8px}#rgmas .mspa{position:relative;width:100%;aspect-ratio:3/4;max-height:58vh;margin:0 auto;background:linear-gradient(#3a2a22,#2a1d18);border:3px solid #6b4a32;image-rendering:pixelated;overflow:hidden}
#rgmas .mback{position:absolute;left:22%;right:22%;top:8%;bottom:6%;background:#d9a77c;border-radius:42% 42% 18% 18%/22% 22% 10% 10%;box-shadow:inset -8px 0 0 #c48e63,inset 8px 0 0 #e6b88f}
#rgmas .msen{position:absolute;top:14%;bottom:10%;width:2px;background:repeating-linear-gradient(#9a5b38 0 6px,transparent 6px 12px);opacity:.7}
#rgmas .mpt{position:absolute;width:44px;height:44px;margin:-22px 0 0 -22px;border:0;padding:0;background:none;touch-action:manipulation}
#rgmas .mpt i{position:absolute;left:14px;top:14px;width:16px;height:16px;background:#7a2f1c;border:2px solid #f6d7a8}
#rgmas .mpt b{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border:3px solid #ffe08a;transform-origin:center}
#rgmas .mpt.p i{background:#ffd34d}#rgmas .mpt.g i{background:#9bd36a}#rgmas .mpt.m i{background:#555}
#rgmas .mpt.p b,#rgmas .mpt.g b,#rgmas .mpt.m b{display:none}
#rgmas .mpop{position:absolute;transform:translate(-50%,-140%);font-weight:700;text-shadow:0 2px 0 #000;pointer-events:none;white-space:nowrap}
#rgmas .mtip{min-height:2.6em;text-align:center}#rgmas .mhead{display:flex;align-items:center;gap:8px}#rgmas .mhead img{width:40px;height:40px;image-rendering:pixelated}`;document.head.appendChild(s);},
  el(){return document.getElementById("rgmas");},
  open(ids,done){const L=ids.filter(id=>G.F[id]);if(!L.length){done&&done(null);return;}this.css();
    let el=this.el();if(!el){el=document.createElement("div");el.id="rgmas";el.className="mgame";document.body.appendChild(el);}
    this.st={ids:L,i:0,hit:{p:0,g:0,m:0},per:[],done,phase:"intro"};this.draw();},
  tips:["Press with the breath. Breathe out, then press down.","This line runs up from the waist. Slowly, no need to rush.","Press on the line and hold, count one to three, the way Mum taught me."],
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const f=G.F[S.ids[S.i]];
    if(S.phase==="intro"){el.innerHTML=`<div class="mbox px"><h2>Thai massage · Bua Tha Sao spa</h2>
      <div class="mhead"><img src="${faceSrc("baibua","happy")}" alt=""><span>${S.i===0?"The ring closes in on the point on the line. Tap right when it covers the point.":esc(this.tips[S.i%this.tips.length])}</span></div>
      <p class="center">Person ${S.i+1}/${S.ids.length} · <b>${esc(f.name)}</b> · fatigue ${Math.round(f.fatigue||0)}</p>
      <div class="mfoot roadbtns"><button class="btn primary" data-ms="go">Start massage ▸</button></div></div>`;
      el.onclick=e=>{const b=e.target.closest("[data-ms]");if(b&&b.dataset.ms==="go")this.start();else if(b&&b.dataset.ms==="end")this.close();};return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mbox px"><div class="mhead"><img src="${faceSrc(f.id,"happy")}" alt=""><b>${esc(f.name)}</b><span style="margin-left:auto">Point <b id="msn">1</b>/${this.N}</span></div>
      <div class="mspa" id="msspa"><div class="mback"></div><div class="msen" style="left:40%"></div><div class="msen" style="left:60%"></div></div>
      <p class="mtip meta" id="mstip">${esc(this.tips[S.i%this.tips.length])}</p></div>`;return;}
    if(S.phase==="end"){const R=S.res;el.innerHTML=`<div class="mbox px"><h2>${R.q>=.8?"Just the right pressure!":R.q>=.5?"Not bad. Almost there.":"It's all right. Practise slowly."}</h2>
      <div class="mhead"><img src="${faceSrc("baibua",R.q>=.5?"happy":"flustered")}" alt=""><span>On the sen ${S.hit.p} · close ${S.hit.g} · Miss ${S.hit.m}</span></div>
      <p class="center">${R.lines.join("<br>")}</p><div class="mfoot roadbtns"><button class="btn primary" data-ms="end">Done ▸</button></div></div>`;}},
  start(){const S=this.st;S.phase="play";S.k=0;S.got={p:0,g:0,m:0};this.draw();const spa=document.getElementById("msspa");
    const P=[];for(let k=0;k<this.N;k++)P.push({x:k%2?60:40,y:24+k*11+(Math.random()*4-2)});S.pts=P;
    const DUR=1150-S.i*120;let k=0;const spawn=()=>{if(this.st!==S||S.phase!=="play")return;if(k>=this.N)return;this.point(spa,P[k],DUR,k);k++;if(k<this.N)S.to=setTimeout(spawn,DUR*.62);};spawn();},
  point(spa,p,DUR,k){const S=this.st,b=document.createElement("button");b.className="mpt";b.style.left=p.x+"%";b.style.top=p.y+"%";b.innerHTML="<i></i><b></b>";spa.appendChild(b);
    const t0=performance.now(),ring=b.querySelector("b");let done=false;
    const grade=(g)=>{if(done)return;done=true;b.classList.add(g);S.got[g]++;S.hit[g]++;const t=document.createElement("span");t.className="mpop";t.style.left=p.x+"%";t.style.top=p.y+"%";
      t.textContent=g==="p"?"On the sen!":g==="g"?"Close":"Miss";t.style.color=g==="p"?"#ffd34d":g==="g"?"#9bd36a":"#bbb";spa.appendChild(t);setTimeout(()=>t.remove(),600);
      AU.sfx&&AU.sfx(g==="m"?"miss":"ui");const n=document.getElementById("msn");if(n)n.textContent=Math.min(this.N,S.k+2);S.k++;if(S.k>=this.N)setTimeout(()=>this.patientDone(),550);};
    b.addEventListener("pointerdown",e=>{e.preventDefault();const d=Math.abs(performance.now()-t0-DUR);grade(d<110?"p":d<260?"g":"m");});
    const tick=()=>{if(done||this.st!==S)return;const u=(performance.now()-t0)/DUR;ring.style.transform=`scale(${Math.max(.36,2.4-2.04*u).toFixed(3)})`;if(u>1+260/DUR){grade("m");return;}requestAnimationFrame(tick);};tick();},
  patientDone(){const S=this.st;if(!S||S.phase!=="play")return;const q=(S.got.p+.6*S.got.g)/this.N;S.per.push({id:S.ids[S.i],q});S.i++;
    if(S.i<S.ids.length){S.phase="intro";this.draw();return;}this.finish();},
  finish(){const S=this.st,tot=S.per.length*this.N,q=(S.hit.p+.6*S.hit.g)/tot,lines=[];
    for(const P of S.per){const f=G.F[P.id];if(!f)continue;const fa=Math.round(8+16*P.q),mo=Math.round(2+4*P.q);f.fatigue=Math.max(0,(f.fatigue||0)-fa);f.morale=Math.min(100,(f.morale||0)+mo);lines.push(`${esc(f.name)} fatigue −${fa} · morale +${mo}`);}
    const bd=2+Math.round(3*q);rgMeet(G,"baibua",bd);G.region.masBest=Math.max(G.region.masBest||0,q);save();S.res={q,lines};S.phase="end";this.draw();AU.sfx&&AU.sfx(q>=.8?"level":"ui");},
  close(){const S=this.st,el=this.el();this.st=null;if(el)el.remove();if(S){clearTimeout(S.to);S.done&&S.done(S.res?S.res.q:null);}}};
/* v1.91.128 (Man): Tabtim's minigame — light her father's bang fai. Lock the angle while the rocket sways, then the fuse power while it pulses;
   three rockets, the best one counts against Petch's mark from last year. */
const RG_RKT={st:null,MARK:240,
  css(){if(document.getElementById("rgrkt-css"))return;const s=document.createElement("style");s.id="rgrkt-css";s.textContent=`
#rgrkt{background:linear-gradient(rgba(10,6,22,.6),rgba(10,6,22,.85)),url(a/bg_night_isan.webp) center/cover}#rgrkt .mbox{gap:8px}
#rgrkt .rsky{position:relative;width:100%;height:46vh;max-height:380px;overflow:hidden;border:3px solid #6b4a32;background:linear-gradient(#141030,#3b2c63 70%,#6b4a32 70%,#4a3322)}
#rgrkt .rpad{position:absolute;left:50%;bottom:8%;width:6px;height:60px;margin-left:-3px;transform-origin:50% 100%}
#rgrkt .rpad i{position:absolute;left:-5px;bottom:0;width:16px;height:54px;background:repeating-linear-gradient(#c9a25c 0 8px,#9c7a3c 8px 10px);border:2px solid #3a2a12}
#rgrkt .rpad i:before{content:"";position:absolute;left:-2px;top:-12px;border:8px solid transparent;border-bottom:12px solid #c0392b}
#rgrkt .rgauge{position:absolute;left:50%;bottom:8%;width:200px;height:100px;margin-left:-100px;border:2px dashed rgba(255,224,138,.35);border-bottom:0;border-radius:100px 100px 0 0;pointer-events:none}
#rgrkt .rbar{height:18px;background:#2a1d18;border:2px solid #6b4a32;position:relative}#rgrkt .rbar b{position:absolute;left:0;top:0;bottom:0;background:#e86a2a}
#rgrkt .rbar u{position:absolute;top:-2px;bottom:-2px;left:78%;width:14%;border:2px solid #ffe08a;text-decoration:none}
#rgrkt .rfly{position:absolute;left:50%;bottom:8%;width:16px;height:54px;margin-left:-8px;background:repeating-linear-gradient(#c9a25c 0 8px,#9c7a3c 8px 10px);transition:transform 1.6s cubic-bezier(.2,.7,.3,1)}
#rgrkt .rfly:after{content:"";position:absolute;left:4px;top:54px;width:8px;height:40px;background:linear-gradient(#ffd34d,rgba(255,120,40,.2))}
#rgrkt .rmark{position:absolute;left:0;right:0;border-top:2px dashed #9bd36a;font-size:12px;color:#9bd36a;text-align:right;padding-right:4px}
#rgrkt .rhud{display:flex;justify-content:space-between}#rgrkt .rbig{width:100%;padding:14px;font-size:18px}`;document.head.appendChild(s);},
  el(){return document.getElementById("rgrkt");},
  open(done){this.css();let el=this.el();if(!el){el=document.createElement("div");el.id="rgrkt";el.className="mgame";document.body.appendChild(el);}
    this.st={n:0,best:0,shots:[],done,phase:"intro"};this.draw();
    el.onclick=e=>{const b=e.target.closest("[data-rk]");if(!b)return;const a=b.dataset.rk;if(a==="go")this.aim();else if(a==="lock")this.lock();else if(a==="next")this.next();else if(a==="end")this.close();};},
  frame(inner){return `<div class="mbox px"><h2>Light Dad's bang fai</h2><div class="rhud"><span>Rocket <b>${Math.min(3,this.st.n+1)}</b>/3</span><span>Best <b>${this.st.best}</b> m</span><span>Petch ${this.MARK} m</span></div>${inner}</div>`;},
  sky(extra){const h=this.MARK/340*100;return `<div class="rsky" id="rksky"><div class="rmark" style="bottom:${(8+h*.86).toFixed(1)}%">Petch ${this.MARK} m</div>${extra||""}</div>`;},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;
    if(S.phase==="intro"){el.innerHTML=this.frame(`<div class="mhead" style="display:flex;gap:8px;align-items:center"><img src="${faceSrc("tabtim","happy")}" alt="" style="width:40px;height:40px;image-rendering:pixelated"><span>While the rocket sways, tap when it's most upright, then tap again when the powder power is inside the gold box!</span></div>${this.sky(`<div class="rgauge"></div><div class="rpad"><i></i></div>`)}<button class="btn primary rbig" data-rk="go">Start ▸</button>`);return;}
    if(S.phase==="aim"||S.phase==="pow"){el.innerHTML=this.frame(`${this.sky(`<div class="rgauge"></div><div class="rpad" id="rkpad"><i></i></div>`)}
      <div class="rbar" id="rkbar"><u></u><b id="rkpow" style="width:0"></b></div><button class="btn primary rbig" data-rk="lock">${S.phase==="aim"?"Lock the angle!":"Light the fuse!"}</button>`);return;}
    if(S.phase==="fly"){const sh=S.shots[S.shots.length-1];el.innerHTML=this.frame(`${this.sky(`<div class="rfly" id="rkfly" style="transform:rotate(${sh.ang.toFixed(1)}deg)"></div>`)}
      <p class="center"><b>${sh.boom?"Packed too tight. The rocket burst halfway!":`${sh.h} m`}</b> · ${esc(sh.line)}</p><button class="btn primary rbig" data-rk="next">${S.n>=3?"See result ▸":"Next rocket ▸"}</button>`);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{const f=document.getElementById("rkfly");if(f){const up=sh.boom?35:Math.min(96,sh.h/340*86);const dx=Math.tan(sh.ang*Math.PI/180)*up*3;f.style.transform=`translate(${dx.toFixed(0)}px,-${(up*3.4).toFixed(0)}px) rotate(${sh.ang.toFixed(1)}deg)`;}}));return;}
    if(S.phase==="end"){const ok=S.best>=this.MARK;el.innerHTML=this.frame(`<h3 class="center">${ok?"Higher than Petch's!":"Not as high as Petch's yet"}</h3><p class="center">${S.shots.map((s,i)=>`Rocket ${i+1}: ${s.boom?"burst":s.h+" m"}`).join(" · ")}</p><button class="btn primary rbig" data-rk="end">Back to the fair ▸</button>`);}},
  aim(){const S=this.st;S.phase="aim";this.draw();const t0=performance.now(),sp=1.6+S.n*.35;
    const tk=()=>{if(this.st!==S||S.phase!=="aim")return;S.ang=Math.sin((performance.now()-t0)/1000*sp*Math.PI)*38;const p=document.getElementById("rkpad");if(p)p.style.transform=`rotate(${S.ang.toFixed(1)}deg)`;requestAnimationFrame(tk);};tk();},
  lock(){const S=this.st;if(S.phase==="aim"){S.lockAng=S.ang;S.phase="pow";const pad=document.getElementById("rkpad");const btn=document.querySelector("#rgrkt [data-rk=lock]");if(btn)btn.textContent="Light the fuse!";
      const t0=performance.now(),sp=1.1+S.n*.25;const tk=()=>{if(this.st!==S||S.phase!=="pow")return;S.pow=(1-Math.cos((performance.now()-t0)/1000*sp*Math.PI))/2*100;const b=document.getElementById("rkpow");if(b)b.style.width=S.pow.toFixed(1)+"%";requestAnimationFrame(tk);};tk();return;}
    if(S.phase==="pow"){const a=Math.abs(S.lockAng),p=S.pow,boom=p>95;const pf=p<78?p/78*.8:p<=92?1:1-(p-92)/20;
      const h=boom?0:Math.round(330*Math.cos(a*Math.PI/180)**6*pf);
      const line=boom?"Black smoke blows across the whole ground. The crowd roars with laughter.":h>=this.MARK?"The whole fair cranes its neck to follow it.":h>=180?"A nice climb, but not all the way to the sky.":a>20?"It veers off over the rice fields. Villagers scatter.":"It barely gets off the ground before it gives out.";
      S.shots.push({ang:S.lockAng,pow:p,h,boom,line});S.best=Math.max(S.best,h);S.n++;S.phase="fly";AU.sfx&&AU.sfx(boom?"miss":h>=this.MARK?"level":"ui");this.draw();}},
  next(){const S=this.st;if(S.n>=3){S.phase="end";this.draw();return;}this.aim();},
  close(){const S=this.st,el=this.el();this.st=null;if(el)el.remove();if(S&&S.done)S.done(S.best);}};
if(typeof QK!=="undefined")Object.assign(QK,{
  wn1:{fst:"pressure",name:"Tank-top guy from the temple fair",sprite:"rg_chaytrae1",lvl:-1.1,tilt:{punch:1.5,power:1,iq:-2,guard:-1.5},color:"#c8283c",grp:"gang"},
  wn2:{fst:"power",name:"Tong, the rice-whisky heavy hitter",sprite:"rg_chaytrae1",lvl:-.3,tilt:{power:2,punch:1,dur:1,speed:-1,iq:-1},color:"#8a1f2a",grp:"gang"},
  wn3:{fst:"inside",name:"Seua Dang, three-time temple ring champion",sprite:"rg_chaytrae2",lvl:.5,tilt:{punch:1.5,knee:1.5,power:1,iq:-.5},color:"#5a1420",grp:"gang"}});
RG_SIDE.isan={cid:"tabtim",bg:"fair",ring:"bg_fair_fest.webp",title:"Off-schedule fight · temple fair ring",
  foes:[{qk:"wn1",t:"A girl in the temple ring? I'll go easy on you, sweetheart."},{qk:"wn2",t:"He just slipped. This one won't slip."},{qk:"wn3",t:"Three titles, and no woman has lasted a full round in front of me."}],
  between:["One of Seua Dang's boys kicks off his flip-flops and ducks through the ropes.","Seua Dang tosses away his glass and climbs into the ring himself. The whole fair gets to its feet."],
  intro:(G,D)=>[{n:"nar",t:"At dusk, a message from Tabtim pops up on the manager's phone: a photo of a boxing ring in the middle of a temple fair, coloured lights wound around the posts."},
   {n:"tabtim",f:"happy",l:"casual",t:`Manager! There's a temple fair tonight in ${D.name}. My brothers were invited to fight an exhibition. Come and have fun! I'm buying the grilled meatballs!`}],
  go:"\"Sure, I'll bring everyone\"",no:"\"I'll rest tonight\"",
  noT:G=>[{n:"tabtim",f:"pout",l:"casual",t:"Aww... it's okay. Next time. I'll save you a skewer."}],
  arrive:G=>[{n:"nar",bg:"fair",t:"The fair is so packed people bump shoulders. Mor lam sing blares from the far stage, and beside the boxing ring a crowd queues for photos with two big men."},
   {n:"tabtim",f:"happy",l:"casual",t:"That's Brother Petch and Brother Nil, my older brothers. They're more famous than me, ha ha."},
   {n:"npc",who:"Brother Petch",t:"...You came, Tabtim. So this is the Chiang Mai camp you told me about."},
   {n:"npc",who:"Brother Nil",t:"Bringing a girls' camp to the temple fair? This ring is for real boxing, Tabtim. Not for pretty kicks for people to photograph."},
   {n:"nar",t:"Nil wears a black jacket cut with neon-red lines, small scales running down the sleeves."},
   {n:"nar",t:"Before anyone can answer, five or six men in tank tops shove their way in. Their leader has a blotchy face and a glass of rice whisky in his hand."},
   {n:"npc",who:"Seua Dang",t:"Well, well. The Ruby of the Isan Plains, with a whole van of girl boxers. Women's boxing is just for show, right, Nil?"},
   {n:"npc",who:"Brother Nil",img:"nil_smirk",t:"He said it, not me."},
   {n:"tabtim",f:"angry",l:"casual",t:"...Brother Nil, you're just standing there laughing along with him?"},
   {n:"npc",who:"Temple ring announcer",img:"caster_shout",t:"Ladies and gentlemen! A special bout, off the programme: a women's camp from Chiang Mai takes on the temple-fair boys, three in a row! Let's hear it!"},
   {n:"coach",t:"Nobody's name is on the line. Just go up and fight so they can see. Whoever's ready, step up."}],
  win:G=>[{n:"nar",t:"Seua Dang lies flat on his back in the temple ring. The whole fair roars over the mor lam music. His boys haul him into a pickup and the whole gang tears off."},
   {n:"tabtim",f:"happy",l:"casual",t:"See that! Women's boxing is just a show, is it? Ha ha... Manager, thank you so much."},
   {n:"npc",who:"Brother Nil",t:"Beat some temple-fair drunks and now you think you're good?"},
   {n:"npc",who:"Brother Nil",img:"nil_smirk",t:"I've signed with the Naka League, Tabtim. Next year I'm on the international stage. And you'll still be kicking at temple fairs like this."},
   {n:"tabtim",f:"sad",l:"casual",t:"...The Naka League. When did you sign, Brother Nil? Does Dad know?"},
   {n:"npc",who:"Brother Nil",t:"Dad knows. He's happy for me. His son is going abroad."},
   {n:"nar",t:"Brother Nil disappears into the crowd. Tabtim stands still, the fair's coloured lights reflected in her eyes."}],
  lose:G=>[{n:"npc",who:"Seua Dang",t:"See? Women's boxing is just a show!"},{n:"npc",who:"Brother Nil",img:"nil_smirk",t:"Told you."},
   {n:"tabtim",f:"sad",l:"casual",t:"It's all right... everyone's hurt. I'm sorry I brought you into this."},{n:"coach",t:"Next time we're in Isan, that temple ring will still be there."}],
  after:(G,T,cb)=>playScene([
    {n:"nar",t:"As the fair thins out, Petch stops in front of Tabtim holding a bamboo rocket, hand-painted with a naga."},
    {n:"npc",who:"Brother Petch",t:"Dad's bang fai. His back's bad this year, he can't light it himself. He sent it with me."},
    {n:"npc",who:"Brother Petch",t:"Every year I light it for him. This year... Tabtim, you light it for Dad."},
    {n:"tabtim",f:"surprised",l:"casual",t:"Me...? Brother Petch, you're letting me light it..."},
    {n:"tabtim",f:"flustered",l:"casual",t:"Manager, help me aim, please. My hands are shaking all over."}],
   ()=>RG_RKT.open(best=>{const ok=best>=RG_RKT.MARK,S=G.region.side.isan;S.rkt=best;rgMeet(G,"tabtim",ok?4:2);save();
    playScene([
     {n:"nar",t:ok?`Dad's rocket shoots up ${best} metres, higher than any rocket at the fair that night. Cheers break out from every corner of the temple ground.`:`Dad's rocket climbs ${best} metres. Not as high as Petch's, but the whole temple ground still applauds.`},
     {n:"npc",who:"Brother Petch",t:ok?"Higher than mine, every year... your kicks too. I watched all night.":"A rocket that falls, you light again next year. Boxing's the same... your kicks tonight, I was watching."},
     {n:"npc",who:"Brother Petch",img:"phet_smile",t:"Dad still won't admit it. He's stubborn. But I'll tell him myself what I saw tonight."},
     {n:"tabtim",f:"sad",l:"casual",t:"...Brother Petch."},
     {n:"nar",t:"Petch ruffles Tabtim's hair once with his big hand, the way he probably hasn't since she was little, then walks back to their father at the pickup truck."},
     {n:"tabtim",f:"flustered",l:"casual",t:"Ha ha, I'm not crying. The rocket smoke got in my eyes.",choice:[
      {t:"Hand her a handkerchief without a word",fx:G2=>rgMeet(G2,"tabtim",3),then:[{n:"tabtim",f:"flustered",l:"casual",t:"...Really, it's the smoke. Just let me borrow it a moment."}]},
      {t:"\"Brother Nil will see it too, someday\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"sad",l:"casual",t:"Brother Nil's gone far now, all the way to Naka... but if we ever meet in the ring, I'll kick so he sees it with his own eyes."}]}]}],cb,{bg:"fair",look:"casual"});}),{bg:"fair",look:"casual"}),
  done:(G)=>addMail(G,{kind:"letter",from:"Tabtim",title:"News from Tabtim's home",body:
   "Manager,\n\nBrother Petch posted the bang fai clip in the family LINE group, and the little ones flooded it with hearts.\n\nThen Dad called me for the first time in two years. He asked just one thing: \"Who was the one aiming the rocket with you?\"\n\nI said the manager of Sirichai Camp. Dad went quiet for a long time, then said, \"Tell him thank you.\"\n\nBrother Nil still hasn't answered my messages. I'll try again.\n\nTabtim"})};
/* v1.91.129 (Man): Chaba's minigame — lead the gang's speedboat into the reef. Steer left/right through the rocks;
   tap "กางใบ" while a gust passes to pull away. Keep the gap above zero for 30 seconds. */
const RG_SAIL={st:null,T:30,
  css(){if(document.getElementById("rgsail-css"))return;const s=document.createElement("style");s.id="rgsail-css";s.textContent=`
#rgsail{background:linear-gradient(rgba(10,6,22,.6),rgba(10,6,22,.85)),url(a/bg_night_south.webp) center/cover}#rgsail .mbox{gap:8px}
#rgsail canvas{width:100%;max-height:52vh;aspect-ratio:3/4;display:block;margin:0 auto;border:3px solid #2f5f7a;image-rendering:pixelated;background:#0d3550}
#rgsail .shud{display:flex;justify-content:space-between;align-items:center;gap:8px}#rgsail .sgap{flex:1;height:14px;background:#2a1d18;border:2px solid #6b4a32;position:relative}#rgsail .sgap b{position:absolute;left:0;top:0;bottom:0;background:#4ec3e0}
#rgsail .sbtn{display:grid;grid-template-columns:1fr 1.2fr 1fr;gap:6px}#rgsail .sbtn button{padding:14px 4px;font-size:16px}#rgsail .sbtn .gust{background:#e8b23a;color:#1a1208}`;document.head.appendChild(s);},
  el(){return document.getElementById("rgsail");},
  open(done){this.css();let el=this.el();if(!el){el=document.createElement("div");el.id="rgsail";el.className="mgame";document.body.appendChild(el);}
    this.st={phase:"intro",done};this.draw();
    el.onclick=e=>{const b=e.target.closest("[data-sl]");if(!b)return;const a=b.dataset.sl;if(a==="go")this.start();else if(a==="end")this.close();else if(a==="sail")this.sail();};
    if(!this.keyH){this.keyH=e=>{const S=this.st;if(!S||S.phase!=="play")return;const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a")S.dir=-1;else if(k==="arrowright"||k==="d")S.dir=1;else if(k===" "){e.preventDefault();this.sail();}};
      this.keyU=e=>{const S=this.st;if(S&&(e.key==="ArrowLeft"||e.key==="ArrowRight"||e.key==="a"||e.key==="d"))S.dir=0;};document.addEventListener("keydown",this.keyH);document.addEventListener("keyup",this.keyU);}},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;
    if(S.phase==="intro"){el.innerHTML=`<div class="mbox px"><h2>Lure the gang into the reef</h2><div style="display:flex;gap:8px;align-items:center"><img src="${faceSrc("chaba","happy")}" alt="" style="width:40px;height:40px;image-rendering:pixelated"><span>...Left and right to dodge the rocks. When the wind comes, hit Sail. Our boat's light, it gets through the reef. Theirs is heavy, it can't.</span></div>
      <p class="center meta">Keep your lead for ${this.T} seconds</p><div class="mfoot roadbtns"><button class="btn primary" data-sl="go">Set sail ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mbox px"><div class="shud"><span>Gap</span><div class="sgap"><b id="slgap"></b></div><span><b id="slt">${this.T}</b> s</span></div>
      <canvas id="slcv" width="240" height="320"></canvas><div class="sbtn"><button class="btn" id="slL">◀ Left</button><button class="btn gust" data-sl="sail">Sail</button><button class="btn" id="slR">Right ▶</button></div></div>`;
      const hold=(id,d)=>{const b=document.getElementById(id);const on=e=>{e.preventDefault();S.dir=d;},off=()=>{if(S.dir===d)S.dir=0;};b.addEventListener("pointerdown",on);b.addEventListener("pointerup",off);b.addEventListener("pointerleave",off);b.addEventListener("pointercancel",off);};
      hold("slL",-1);hold("slR",1);return;}
    if(S.phase==="end"){el.innerHTML=`<div class="mbox px"><h2>${S.win?"The gang hit the reef!":"The gang caught up..."}</h2><p class="center">${S.win?"The gang's speedboat smashed into the reef and wrecked its propeller, while Chaba's sailboat slipped through easily.":"The gang's boat caught up before the reef, but the marine police lights showed up at the edge of the bay just in time."}</p>
      <p class="center meta">Rocks hit ${S.hits} times · gusts caught ${S.gusts} times</p><div class="mfoot roadbtns"><button class="btn primary" data-sl="end">Next ▸</button></div></div>`;}},
  start(){const S=this.st;Object.assign(S,{phase:"play",x:120,dir:0,gap:60,t0:performance.now(),last:performance.now(),rocks:[],gust:null,nextRock:0,nextGust:2.5,hits:0,gusts:0,boost:0,scroll:0});this.draw();
    const loop=now=>{if(this.st!==S||S.phase!=="play")return;const dt=Math.min(.05,(now-S.last)/1000);S.last=now;this.step(dt,(now-S.t0)/1000);this.paint();requestAnimationFrame(loop);};requestAnimationFrame(loop);},
  step(dt,t){const S=this.st,sp=110+t*3+(S.boost>0?60:0);S.scroll+=sp*dt;S.x=Math.max(22,Math.min(218,S.x+S.dir*150*dt));S.boost=Math.max(0,S.boost-dt);
    if(t>=S.nextRock){S.rocks.push({x:20+Math.random()*200,y:-20,r:10+Math.random()*10});S.nextRock=t+Math.max(.32,.8-t*.015);}
    if(t>=S.nextGust&&!S.gust){S.gust={y:-30,used:false};S.nextGust=t+3+Math.random()*2;}
    for(const r of S.rocks){r.y+=sp*dt;if(!r.hit&&Math.abs(r.y-262)<r.r+10&&Math.abs(r.x-S.x)<r.r+9){r.hit=1;S.hits++;S.gap-=14;AU.sfx&&AU.sfx("miss");}}
    S.rocks=S.rocks.filter(r=>r.y<360);if(S.gust){S.gust.y+=sp*dt;if(S.gust.y>360)S.gust=null;}
    S.gap+=(S.boost>0?4:-1.2)*dt*3;S.gap=Math.min(100,S.gap);
    const g=document.getElementById("slgap");if(g)g.style.width=Math.max(0,S.gap)+"%";const tt=document.getElementById("slt");if(tt)tt.textContent=Math.max(0,Math.ceil(this.T-t));
    if(S.gap<=0||t>=this.T)this.finish(S.gap>0);},
  sail(){const S=this.st;if(!S||S.phase!=="play"||!S.gust||S.gust.used)return;if(Math.abs(S.gust.y-262)<70){S.gust.used=true;S.boost=2.2;S.gusts++;S.gap=Math.min(100,S.gap+10);AU.sfx&&AU.sfx("level");}},
  paint(){const S=this.st,c=document.getElementById("slcv");if(!c)return;const x=c.getContext("2d");x.fillStyle="#0d3550";x.fillRect(0,0,240,320);
    x.fillStyle="#1d5778";for(let i=0;i<14;i++){const yy=((i*40+S.scroll*.9)%360)-20;x.fillRect((i*53)%220,yy,20,3);}
    if(S.gust&&!S.gust.used){x.fillStyle="rgba(232,178,58,.35)";x.fillRect(0,S.gust.y-14,240,28);x.fillStyle="#ffe08a";x.font="bold 12px sans-serif";x.fillText("Wind!",96,S.gust.y+4);}
    for(const r of S.rocks){x.fillStyle=r.hit?"#5a5a5a":"#7a6a5a";x.fillRect(r.x-r.r,r.y-r.r*.7,r.r*2,r.r*1.4);x.fillStyle="#cfe9f2";x.fillRect(r.x-r.r,r.y+r.r*.6,r.r*2,2);}
    x.fillStyle="#f2efe6";x.fillRect(S.x-5,240,10,30);x.fillStyle=S.boost>0?"#ffe08a":"#e8e2d0";x.beginPath();x.moveTo(S.x,214);x.lineTo(S.x+16,252);x.lineTo(S.x,252);x.fill();x.fillStyle="#c0392b";x.fillRect(S.x-7,268,14,4);
    const py=274+Math.max(0,S.gap)*1.1;if(py<320){x.fillStyle="#222";x.fillRect(S.x-12,py,24,26);x.fillStyle="#e33";x.fillRect(S.x-12,py,24,4);x.fillStyle="#cfe9f2";x.fillRect(S.x-14,py+26,28,3);}},
  finish(win){const S=this.st;if(S.phase!=="play")return;S.phase="end";S.win=win;AU.sfx&&AU.sfx(win?"level":"ui");this.draw();},
  close(){const S=this.st,el=this.el();this.st=null;if(el)el.remove();if(S&&S.done)S.done(!!S.win);}};
if(typeof QK!=="undefined")Object.assign(QK,{
  ru1:{fst:"pressure",name:"White Bear bar bouncer",sprite:"rg_russian1",lvl:-.9,tilt:{punch:1.5,power:1.5,iq:-2,foot:-1},color:"#4a6fa5",grp:"gang"},
  ru2:{fst:"inside",name:"Dima, the White Bear's right hand",sprite:"rg_russian1",lvl:-.1,tilt:{clinch:1.5,power:1.5,dur:1,speed:-1},color:"#33507a",grp:"gang"},
  ru3:{fst:"power",name:"Boris, owner of the White Bear bar",sprite:"rg_russian2",lvl:.7,tilt:{power:2.5,punch:1.5,dur:1.5,foot:-1.5},color:"#d8d8e0",grp:"gang"}});
RG_SIDE.south={cid:"chaba",bg:"pier_south",ring:"bg_pier_south.webp",title:"Off-schedule fight · the pier",
  foes:[{qk:"ru1",t:"This shop pays every month. Don't pay this month, and you pay some other way."},{qk:"ru2",t:"Muay Thai, huh? There are no ropes to lean on out on the pier."},{qk:"ru3",t:"This pier has been mine for five years. A little women's camp thinks it can take it?"}],
  between:["Another guard takes off a gold watch, sets it on a fish crate, and steps into the circle.","Boris drapes his long coat over a fish crate, pushes up his sleeves to show a white bear tattoo, and steps down himself."],
  intro:(G,D)=>[{n:"nar",t:"That evening an unknown number calls the manager's phone. Three seconds of silence on the line."},
   {n:"chaba",f:"sad",l:"casual",t:`...It's Chaba. At my family's restaurant in ${D.name}, the White Bear bar's men are collecting protection money again.`},
   {n:"chaba",f:"sad",l:"casual",t:"My brother's alone at the shop, in his wheelchair... I don't want to ask. But I'm asking."}],
  go:"\"Send me the address. We're coming now.\"",no:"\"Everyone's spent tonight. I'm sorry.\"",
  noT:G=>[{n:"chaba",f:"sad",l:"casual",t:"...Okay. It's fine. Chaba will go alone."},{n:"nar",t:"The line goes dead before anyone can say goodbye."}],
  arrive:G=>[{n:"nar",bg:"pier_south",t:"A seafood restaurant by the pier, tables knocked over. Three big men stand around Chaba's brother's wheelchair."},
   {n:"npc",who:"Boris",t:"Protection's doubled this month. Every shop in the network. Don't pay, and your family's fishing boats never leave the pier again."},
   {n:"chaba",f:"angry",l:"casual",t:"...Get out of the shop."},
   {n:"npc",who:"Chaba's brother",img:"chaba_bro_sad",t:"Chaba, don't... just pay. I don't want you hurt too."},
   {n:"chaba",f:"angry",l:"casual",t:"Not paying. From today, not one baht."},
   {n:"npc",who:"Boris",t:"Then let's settle it like boxers. Out on the pier. Three of you. Win them all and I never set foot in this shop again. Lose one, and you pay double all year."},
   {n:"coach",t:"No ropes, no referee. Watch the slippery floor. Whoever's ready, go."}],
  win:G=>[{n:"nar",t:"Boris falls onto a pile of nets beside the fish crates. His two men help each other run to the black speedboat at the end of the pier."},
   {n:"npc",who:"Boris",t:"It's not over! Tonight your family won't have a single fishing boat left!"},
   {n:"nar",t:"The speedboat's engine roars. Its bow swings toward the moorings where Chaba's family's fishing boats are tied."},
   {n:"chaba",f:"angry",l:"casual",t:"...Manager, get on the sailboat, quick. Chaba will lure him into the reef."}],
  lose:G=>[{n:"npc",who:"Boris",t:"Double, all year. Remember it."},{n:"npc",who:"Chaba's brother",img:"chaba_bro_sad",t:"It's okay. It's okay, Chaba..."},
   {n:"chaba",f:"sad",l:"casual",t:"...Sorry. For dragging everyone into getting hurt."},{n:"coach",t:"Next time we're down south, we take this pier back."}],
  after:(G,T,cb)=>RG_SAIL.open(won=>{const S=G.region.side.south;S.sail=won?1:0;rgMeet(G,"chaba",won?4:2);save();
   playScene([
    {n:"nar",bg:"sea",t:won?"Boris's speedboat slams into the reef, its propeller shattering, just as the marine police lights come in from the mouth of the bay.":"Boris's speedboat swings round and closes in, but the marine police lights come in from the mouth of the bay before he can do anything."},
    {n:"chaba",f:"happy",l:"casual",t:won?"...Good wind, steady hands. You were born for sailing.":"...Close. But we made it. Chaba's sailboat never loses to the sea."},
    {n:"nar",bg:"pier_south",t:"Back on shore, the owners of several restaurants in the network are waiting on the pier. Every one of them saw tonight's fight."},
    {n:"npc",who:"Auntie who runs the curry shop",t:"The White Bear bar has squeezed every shop for five years and nobody dared speak... if a young girl can be brave, so can I."},
    {n:"chaba",f:"sad",l:"casual",t:"...But if we stop paying one shop at a time, they'll come for us one shop at a time.",choice:[
     {t:"\"Every restaurant in the network refuses together, and you all report to the marine police together\"",fx:G2=>{rgMeet(G2,"chaba",3);G2.region.side.south.how="all";},then:[{n:"nar",t:"The owners look at each other one by one, then nod one by one, until every one of them has."},{n:"chaba",f:"flustered",l:"casual",t:"...Every shop at once. Why didn't Chaba think of that."}]},
     {t:"\"Put tonight's fight on the camp live, so the whole south knows\"",fx:G2=>{rgMeet(G2,"chaba",2);G2.region.side.south.how="live";},then:[{n:"nar",t:"The clip of the fight on the pier is shared across the whole south before midnight."},{n:"chaba",f:"happy",l:"casual",t:"...Famous now. Nobody'll dare come again."}]}]},
    {n:"npc",who:"Chaba's brother",t:"Chaba's never brought anyone home before, Manager... thank you for looking after my little sister."},
    {n:"chaba",f:"flustered",l:"casual",t:"...Brother. Talks too much."}],cb,{bg:"sea",look:"casual"});}),
  done:(G,how)=>addMail(G,{kind:"letter",from:"Chaba",title:"...From the pier",body:how==="live"?
   "Manager\n\nThe pier clip has three million views.\n\nThe White Bear bar is closed. The marine police check every night.\n\nMy brother reads the comments every day. Smiles all day.\n\n...Thanks.\n\nChaba":
   "Manager\n\nEvery restaurant in the network across the south refused at the same time, and reported to the marine police at the same time.\n\nThe White Bear bar is closed. Boris was arrested at the pier.\n\nMum says any restaurant in the network, you eat free for life.\n\n...Thanks.\n\nChaba"})};
/* v1.91.130 (Man): Alicia's minigame — the Sportygal live. Notes fall in two lanes; tap ซ้าย/ขวา as each crosses the line.
   Misses bring the hate comments back; a streak brings Mabelle, Minnie and the fans. */
const RG_SING={st:null,N:28,
  css(){if(document.getElementById("rgsing-css"))return;const s=document.createElement("style");s.id="rgsing-css";s.textContent=`
#rgsing{background:linear-gradient(rgba(10,6,22,.55),rgba(10,6,22,.85)),url(a/bg_tvstudio.webp) center/cover}#rgsing .mbox{gap:8px}
#rgsing .sgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px}#rgsing canvas{width:100%;aspect-ratio:3/4;max-height:44vh;display:block;border:3px solid #ea5aa0;image-rendering:pixelated;background:#1a1030}
#rgsing .sfeed{height:44vh;max-height:none;aspect-ratio:auto;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;font-size:12px;background:rgba(0,0,0,.35);padding:4px;border:3px solid #3a2a5a}
#rgsing .sfeed p{margin:0;padding:3px 5px;background:rgba(255,255,255,.08)}#rgsing .sfeed p.h{color:#ff8a8a}#rgsing .sfeed p.c{color:#9be0ff}#rgsing .sfeed p.m{color:#ffd34d}
#rgsing .sbtns{display:grid;grid-template-columns:1fr 1fr;gap:6px}#rgsing .sbtns button{padding:16px;font-size:18px}#rgsing .shud{display:flex;justify-content:space-between}`;document.head.appendChild(s);},
  el(){return document.getElementById("rgsing");},
  hate:["Pretty, but can't fight","Why is an idol boxing?","Just sing, stay out of boxing","All looks, nothing else","Feel sorry for the sponsor"],
  cheer:[["Mabelle","Go Alicia!! We ride together!","m"],["Minnie","Whoever's dissing my friend gets dunked on!","m"],["Fan","Such a good voice","c"],["Fan","A real Muay Thai princess","c"],["Fan","Thank you for still singing for us","c"],["Mabelle","Sportygal never leaves anyone behind!","m"]],
  open(done){this.css();let el=this.el();if(!el){el=document.createElement("div");el.id="rgsing";el.className="mgame";document.body.appendChild(el);}
    this.st={phase:"intro",done};this.draw();
    el.onclick=e=>{const b=e.target.closest("[data-sg]");if(!b)return;const a=b.dataset.sg;if(a==="go")this.start();else if(a==="end")this.close();};
    if(!this.keyH){this.keyH=e=>{const S=this.st;if(!S||S.phase!=="play"||e.repeat)return;const k=e.key.toLowerCase();if(k==="f"||k==="arrowleft")this.tap(0);else if(k==="j"||k==="arrowright")this.tap(1);};document.addEventListener("keydown",this.keyH);}},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;
    if(S.phase==="intro"){el.innerHTML=`<div class="mbox px"><h2>Sportygal live · duet with Alicia</h2><div style="display:flex;gap:8px;align-items:center"><img src="${faceSrc("alicia","sad")}" alt="" style="width:40px;height:40px;image-rendering:pixelated"><span>...Keep the rhythm for me. Tap left or right as each note reaches the line. If you don't slip, I won't either.</span></div><div class="mfoot roadbtns"><button class="btn primary" data-sg="go">Go live ▸</button></div></div>`;return;}
    if(S.phase==="play"){el.innerHTML=`<div class="mbox px"><div class="shud"><span>LIVE <b id="sgv">0</b> viewers</span><span>Combo <b id="sgc">0</b></span></div>
      <div class="sgrid"><canvas id="sgcv" width="160" height="214"></canvas><div class="sfeed" id="sgfeed"></div></div>
      <div class="sbtns"><button class="btn" id="sg0">Left</button><button class="btn" id="sg1">Right</button></div></div>`;
      for(const i of [0,1]){const b=document.getElementById("sg"+i);b.addEventListener("pointerdown",e=>{e.preventDefault();this.tap(i);});}return;}
    if(S.phase==="end"){const q=S.q;el.innerHTML=`<div class="mbox px"><h2>${q>=.8?"The best live of the year!":q>=.5?"Song finished":"Voice shaking, but she sang to the end"}</h2><p class="center">Perfect ${S.p} · Great ${S.g} · slipped ${S.m} · best combo ${S.best}</p><p class="center">Peak viewers ${S.peak.toLocaleString()} viewers</p><div class="mfoot roadbtns"><button class="btn primary" data-sg="end">End live ▸</button></div></div>`;}},
  start(){const S=this.st,notes=[];let t=1.4;for(let i=0;i<this.N;i++){notes.push({t,l:Math.random()<.5?0:1});t+=i%7===6?.9:(.42+Math.random()*.28);}
    Object.assign(S,{phase:"play",notes,t0:performance.now(),p:0,g:0,m:0,combo:0,best:0,view:1200,peak:1200,feedN:0});this.draw();
    for(let i=0;i<2;i++)this.feed(this.hate[i],"h","Comment");
    const loop=()=>{if(this.st!==S||S.phase!=="play")return;const now=(performance.now()-S.t0)/1000;
      for(const n of S.notes)if(!n.done&&now-n.t>.22){n.done=1;this.grade("m");}
      this.paint(now);if(S.notes.every(n=>n.done)){setTimeout(()=>this.finish(),500);return;}requestAnimationFrame(loop);};requestAnimationFrame(loop);},
  tap(l){const S=this.st;if(!S||S.phase!=="play")return;const now=(performance.now()-S.t0)/1000;let best=null;
    for(const n of S.notes)if(!n.done&&n.l===l&&Math.abs(n.t-now)<.3&&(!best||Math.abs(n.t-now)<Math.abs(best.t-now)))best=n;
    if(!best)return;best.done=1;const d=Math.abs(best.t-now);this.grade(d<.09?"p":"g");},
  grade(k){const S=this.st;S[k]++;if(k==="m"){S.combo=0;S.view=Math.max(300,S.view-180);this.feed(this.hate[S.m%this.hate.length],"h","Comment");AU.sfx&&AU.sfx("miss");}
    else{S.combo++;S.best=Math.max(S.best,S.combo);S.view+=k==="p"?260:140;if(S.combo%4===0){const c=this.cheer[(S.combo/4-1)%this.cheer.length];this.feed(c[1],c[2],c[0]);}}
    S.peak=Math.max(S.peak,S.view);const v=document.getElementById("sgv");if(v)v.textContent=S.view.toLocaleString();const c=document.getElementById("sgc");if(c)c.textContent=S.combo;},
  feed(t,cls,who){const f=document.getElementById("sgfeed");if(!f)return;const p=document.createElement("p");p.className=cls;p.innerHTML=`<b>${esc(who)}</b> ${esc(t)}`;f.appendChild(p);while(f.children.length>9)f.firstChild.remove();},
  paint(now){const c=document.getElementById("sgcv");if(!c)return;const x=c.getContext("2d");x.fillStyle="#1a1030";x.fillRect(0,0,160,214);
    x.fillStyle="#2a1a48";x.fillRect(78,0,4,214);x.fillStyle="#ea5aa0";x.fillRect(0,184,160,4);
    for(const n of this.st.notes){if(n.done)continue;const y=184-(n.t-now)*150;if(y<-12||y>214)continue;const xx=n.l?120:40;x.fillStyle=n.l?"#9be0ff":"#ffd34d";x.fillRect(xx-14,y-6,28,12);x.fillStyle="#fff";x.fillRect(xx-14,y-6,28,2);}},
  finish(){const S=this.st;if(S.phase!=="play")return;S.q=(S.p+.6*S.g)/this.N;S.phase="end";AU.sfx&&AU.sfx(S.q>=.8?"level":"ui");this.draw();},
  close(){const S=this.st,el=this.el();this.st=null;if(el)el.remove();if(S&&S.done)S.done(S.q||0);}};
if(typeof QK!=="undefined")Object.assign(QK,{
  ss1:{fst:"pressure",name:"Sasaeng fan with a lightstick",sprite:"rg_sasaeng1",lvl:-1.2,tilt:{speed:1.5,stamina:1,power:-1,iq:-2},color:"#ea5aa0",grp:"gang"},
  ss2:{fst:"footwork",name:"Long-lens sneak photographer",sprite:"rg_sasaeng1",lvl:-.4,tilt:{speed:2,foot:1.5,power:-1,guard:-1},color:"#7a4ab0",grp:"gang"},
  ss3:{fst:"counter",name:"Sasaeng fan club leader, former amateur boxer",sprite:"rg_sasaeng2",lvl:.5,tilt:{counter:1.5,punch:1.5,iq:.5},color:"#3a1f5a",grp:"gang"}});
RG_SIDE.central={cid:"alicia",bg:"tvstudio",ring:"bg_tvstudio.webp",title:"Off-schedule fight · backstage at the concert",
  foes:[{qk:"ss1",t:"Alicia belongs to her fans! Not to some boxing camp!"},{qk:"ss2",t:"One photo, just one photo. Get out of the way!"},{qk:"ss3",t:"I've followed her for three years. Every concert, every fight... where did your camp even come from?"}],
  between:["Another fan raises a long-lens camera, shooting nonstop as he pushes forward.","The fan-club leader zips her pink hoodie all the way up, pushes her glasses back, and raises a guard like someone who's boxed before."],
  intro:(G,D)=>[{n:"nar",t:"At ten at night a voice message from Alicia pops up on the manager's phone, loud noise in the background."},
   {n:"alicia",f:"sad",l:"casual",t:`Manager... Sportygal has a mini concert tonight in ${D.name}. A sasaeng fan group has followed me since Lopburi. Last night someone was waiting outside my hotel room.`},
   {n:"alicia",f:"flustered",l:"casual",t:"The event has two guards... I'm not asking you to come. Just telling you, in case you're free."}],
  go:"\"Send the location. We're on our way.\"",no:"\"Get more security. Our camp really can't tonight.\"",
  noT:G=>[{n:"alicia",f:"pout",l:"casual",t:"...It's fine. I'm used to it."}],
  arrive:G=>[{n:"nar",bg:"tvstudio",t:"Backstage, green-and-gold Naka Energy Drink banners line the whole corridor. The back door has been pushed ajar by a crowd with lightsticks and long-lens cameras."},
   {n:"npc",who:"Mabelle",t:"You're the manager of Sirichai Camp, right? Perfect timing. Our two guards can't hold them anymore."},
   {n:"npc",who:"Minnie",t:"Alicia's in the dressing room. She's locked the door and won't come out."},
   {n:"npc",who:"Sasaeng fan club leader",t:"Open the door! Alicia promised on her live she'd meet the fans!"},
   {n:"alicia",f:"angry",l:"casual",t:"I promised to meet fans, not to let people storm my dressing room! ...Manager? You actually came?"},
   {n:"coach",t:"The hallway's narrow. No need for a show. Just get them away from that door. Whoever's ready, go."}],
  win:G=>[{n:"nar",t:"The fan club leader slumps against the wall. Event security arrives with the tourist police, and the sasaeng group is led out the back door one by one."},
   {n:"npc",who:"Minnie",t:"All clear! ...Wow, Sirichai Camp is the real deal."},
   {n:"nar",show:[{id:"alicia",l:"casual"}],t:"The dressing-room door opens. Alicia sits in front of the mirror, hands shaking, mascara smudged."},
   {n:"npc",who:"Mr. Krit, personal manager",t:"Live in ten minutes, Alicia. Naka Energy Drink wants to open the live with that fight clip. The views will go through the roof."},
   {n:"alicia",f:"sad",l:"casual",t:"...I can't sing, Manager. My voice won't come."},
   {n:"alicia",f:"sad",l:"casual",t:"Everyone wants the princess on camera. Nobody wants the one who fights... some days I forget why I fight at all."}],
  lose:G=>[{n:"npc",who:"Sasaeng fan club leader",t:"See? A boxing camp can't stop me!"},{n:"npc",who:"Mabelle",t:"Security's here! Everyone, back off!"},
   {n:"alicia",f:"sad",l:"casual",t:"...Thank you for coming. I'm cancelling tonight's live."},{n:"coach",t:"Next time we're in the central region, nobody gets near that door again."}],
  after:(G,T,cb)=>playScene([
    {n:"nar",t:"Mabelle and Minnie sit down on either side of Alicia. The manager leans against the door.",choice:[
     {t:"\"You fight because you want to. I've seen it since your first fight\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"alicia",f:"flustered",l:"casual",t:"...My first fight. You remember it?"}]},
     {t:"\"Tonight, sing for yourself, not for the sponsor\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"alicia",f:"happy",l:"casual",t:"...For myself. I haven't done that in a long time."}]}]},
    {n:"npc",who:"Mabelle",t:"Sportygal always goes on stage together. Nobody sings alone."},
    {n:"npc",who:"Minnie",img:"minnie_smirk",t:"And the camp manager can keep a beat too, right?"},
    {n:"alicia",f:"flustered",l:"casual",t:"...Keep the rhythm for me. If you don't slip, I won't either."}],
   ()=>RG_SING.open(q=>{const S=G.region.side.central;S.sing=+(q||0).toFixed(2);rgMeet(G,"alicia",q>=.6?4:2);save();
    playScene([
     {n:"nar",bg:"tvstudio",t:q>=.6?"The song ends. The live comments turn into a flood of pink hearts, too many to read.":"Alicia's voice shakes through two verses, but she sings to the end, Mabelle and Minnie with their arms around her shoulders."},
     {n:"npc",who:"Mr. Krit, personal manager",t:"Great! Now upload the backstage fight clip like the sponsor asked. Naka pays us a year..."},
     {n:"alicia",f:"happy",l:"casual",t:"No."},
     {n:"alicia",f:"happy",l:"casual",t:"That clip is people from Sirichai Camp getting hurt protecting me. It's not content. From tonight, I choose what goes on camera."},
     {n:"npc",who:"Mr. Krit, personal manager",img:"krit_panic",t:"Alicia, the Naka contract doesn't say that..."},
     {n:"alicia",f:"happy",l:"casual",t:"Then rewrite it, or there's no contract at all... I'm a fighter. I choose."},
     {n:"npc",who:"Mabelle",img:"mabelle_excited",t:"Yay!! That's my girl!"},
     {n:"alicia",f:"flustered",l:"casual",t:"...Don't get the wrong idea. I didn't dare say that because you were standing there... maybe a little."}],cb,{bg:"tvstudio",look:"casual"});}),{bg:"tvstudio",look:"casual"}),
  done:(G)=>addMail(G,{kind:"letter",from:"Alicia",title:"Update from the Princess",body:
   "Dear Manager of Sirichai Camp,\n\nI've told Naka Energy Drink I won't make any content I haven't chosen myself. They want to renegotiate... I'm in no hurry to answer.\n\nThat sasaeng group is banned from every event now. Mabelle made a light-up \"Sirichai Camp\" sign for backstage. Minnie asked for Kru Daeng's number (don't ask why).\n\nYesterday I trained for six hours without turning on a camera once. It felt... mine.\n\nAlicia"})};
function rgSideDue(G,T){const R=G.region,D=ROAD_DEST[T.dest];if(!R||!D||T.fa||T.series||T.local)return null;const X=RG_SIDE[D.r];if(!X)return null;
  const S=(R.side=R.side||{})[D.r]=R.side[D.r]||{};if(S.won)return null;if(R.joined&&R.joined[X.cid])return null;if(!(R.arrived||{})[D.r])return null;
  if(S.triedAbs!=null&&S.triedAbs===T.abs)return null;return X;}
/* ---------- v1.91.122 (Man): the camp's own journey through the Four Regions ----------
   RG_MS: milestone nights back at camp — first province belt, first four-belt ticket, each cup, all four cups (national).
   RG_WARM: quiet hotel-night moments with the five, each once, in place of a hotel gag; lines read the camp's real progress. */
const RG_MSL={
 belt1:{bg:"camp_night",
  head:(G,q)=>`The camp gets home late, but nobody will go to bed. The ${(ROAD_DEST[q.dest]||{name:""}).name} provincial belt lies in the middle of the dinner table.`,
  me:{kati:"Grandpa... the first belt Sirichai Camp has won outside Chiang Mai. I brought it to show you.",
   mali:"Mali sent Mum a photo~ She replied with one word: \"Seen.\" ...That's enough.",
   rin:"I put our chance of winning that night at thirty-eight percent... I'm glad the number was wrong.",
   ploy:"The knee held and the belt is ours... let me just sit here a while longer tonight.",
   fah:"Anyone who wants a photo of Fah with the belt can take one! ...Send one to Grandma too. She'll call to ask for sure."},
  any:{kati:"A belt from another province... Grandpa said one day Sirichai Camp would fight further than Chiang Mai. He was right.",
   mali:"Can Mali hold it~? It's heavier than I thought! The next one's Mali's.",
   rin:"I've started a new page in the black notebook, headed \"Four Regions\". It has one line so far... I don't want it to stay one line for long.",
   ploy:"The first one's always the hardest. The rest get easier... not because the opponents get easy. Because now we know we can.",
   fah:"Fah's not jealous! ...The next belt is Fah's. Remember that!"},
  coach:"The camp's first belt away from home. Eat all you want tonight. Tomorrow we run at five as usual.",
  end:"Auntie Daeng brings a pot of hang lay curry out of the kitchen and everyone cheers."},
 ticket:{bg:"camp_night",
  head:(G,q)=>`A letter from the association lies on the table: Sirichai Camp has all four belts of ${RG[q.r].name} and has earned the right to challenge the regional champion.`,
  any:{kati:"Four belts! Next is the real regional champion... my hands are shaking for everyone.",
   mali:"Regional champion, really~? It feels like yesterday we were sweating over subdistrict fights.",
   rin:"From the subdistrict rings to here took less time than I expected... I like being wrong like this.",
   ploy:"Back at Golden Tiger I thought a small camp could never get this far... I was wrong.",
   fah:"Regional champions are people too! They can win and they can lose. Fah's not scared... whoever fights, tell Fah. Fah will work the corner."},
  coach:"Best of three, not one fight. Watch the tape, find the answer, train for what you see. Now go rest."},
 cup1:{bg:"camp_night",
  head:(G,q)=>`The champion's cup of ${RG[q.r].name} stands on the shelf in the camp hall, next to Grandpa Chai's photo.`,
  me:{kati:"Grandpa, Sirichai Camp is a regional champion... I put the cup next to you so you can see it every day.",
   mali:"Mali video-called Mum, and Mum watched to the end for the first time~ ...Mali's already cried. Don't look.",
   rin:"At nineteen I wrote in my notebook \"I'll never stand on a big stage again\"... today I crossed that line out.",
   ploy:"My first cup where I wasn't fighting to please anyone. I fought because I wanted to... funny, isn't it.",
   fah:"Fah's a regional champion! Grandma's going to tell the whole market... hey, thanks. Fah's only saying it once."},
  any:{kati:"We've made it to regional level! From the little camp Grandpa built with a few old bags...",
   mali:"Regional level~! Mali will write to Mum... and this letter Mali will really send.",
   rin:"Regional level. I checked three times. I'm not dreaming.",
   ploy:"Regional level... everyone, no 5 a.m. tomorrow. I'll talk to Kru Daeng myself.",
   fah:"Regional level!! Fah's not crying. Dust in the eye!"},
  coach:"Grandpa Chai said one day this camp would have a regional cup... today's the day. But don't get comfortable. Three regions to go.",
  end:"That night the dorm lights stay on until 2 a.m., laughter carrying down to the training yard."},
 cup2:{bg:"camp_night",
  head:(G,q)=>`The champion's cup of ${RG[q.r].name} goes up next to the first cup. The shelf in the hall is starting to look small.`,
  any:{kati:"Second cup! The shelf by Grandpa's photo is getting crowded. I'll ask Kru Daeng to build another.",
   mali:"Two regions~ Mali's starting to learn the map of Thailand.",
   rin:"Two of four. Fifty percent... the second half is always harder than the first.",
   ploy:"Two cups. Don't get cocky. The other regions know who we are now.",
   fah:"Two cups! Fah says we can take the whole country... Fah means it. Not joking."}},
 cup3:{bg:"camp_night",
  head:(G,q)=>`The champion's cup of ${RG[q.r].name} is the third. One space left on the shelf.`,
  any:{kati:"One more region... just one more, and Sirichai Camp is a national-level camp.",
   mali:"Just a little more~ Mali will train extra every evening so nobody has to carry it alone.",
   rin:"One region left. I've made three plans... the fourth is trusting each other.",
   ploy:"The last cup is the heaviest, because everyone starts fearing a slip... don't. We didn't come this far on luck.",
   fah:"One more cup! If anyone's tired, Fah will carry them... not worried, okay. Just don't want to wait."}},
 nat:{bg:"camp_night",
  head:(G,q)=>"The fourth cup goes up on the shelf. All four regions. The whole country.",
  any:{kati:"Sirichai Camp is national champion, Grandpa... I don't need to look for you in the stands anymore. I know you're right here.",
   mali:"The whole country~ From Chaiya all the way up to Chiang Rai... Dad must be smiling.",
   rin:"I've started a new black notebook. The first page has no numbers at all. Just everyone's names.",
   ploy:"I used to fight so no one would be disappointed... these days I fight for you all, and it's so much better.",
   fah:"Everyone important leaves... but none of you went anywhere. Fah... Fah's happy. Saying it once. No teasing!"},
  coach:"National level... Grandpa Chai would have wanted to see this more than anyone. I'll tell him at this year's wai khru.",
  end:"That night everyone drags mats out into the training yard and lies counting stars until they fall asleep one by one."}};
function rgCampGirls(G){return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player"&&!(typeof isAway==="function"&&isAway(G,id)));}
function rgMsSteps(G,q){const M=RG_MSL[q.k];if(!M)return null;const gs=rgCampGirls(G),win=q.id&&gs.includes(q.id)?q.id:null;
  const S=[{n:"nar",t:M.head(G,q)}];
  if(win&&M.me)S.push({n:win,f:"happy",l:"casual",t:M.me[win]});
  const rest=gs.filter(id=>id!==win);const lim=M.me||q.k==="ticket"||q.k==="nat"?5:3;
  for(const id of rest.slice(0,lim))S.push({n:id,f:id==="fah"?"flustered":"happy",l:"casual",t:M.any[id]});
  if(M.coach)S.push({n:"coach",t:M.coach});if(M.end)S.push({n:"nar",t:M.end});
  for(const id of gs)add(G,id,"morale",3);S.push({n:"nar",t:"Whole camp: morale +3"});return S;}

const rgB=(G)=>REGION.beltTotal(G),rgC=(G)=>((G.region&&G.region.cups)||[]).length;
const RG_WARM=[
 {id:"kati_gloves",g:["kati"],ok:G=>rgB(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"1 a.m. Kati's light is still on, her door half open. She sits by the window with her first gloves on her lap."},
  {n:"kati",f:"sad",l:"casual",t:`Grandpa, tonight I'm sleeping in ${D.name}. The farthest from home I've ever been.`},
  {n:"kati",f:"surprised",l:"casual",t:"...Manager! You heard? I bring these gloves on every trip. Otherwise I can't sleep.",choice:[
   {t:"Sit down beside her and ask which province her grandpa liked best",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"happy",l:"casual",t:"Grandpa loved Uttaradit most. He said the crowd there shouted louder than anywhere... I want to take everyone there someday."}]},
   {t:"\"Your grandpa must be glad you brought the camp this far\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"flustered",l:"casual",t:"...I didn't bring the camp here alone. You brought us too. Grandpa must know."}]}]}]},
 {id:"kati_kids",g:["kati"],r:"north",bg:"rg_north",s:(G,D)=>[
  {n:"nar",t:"At dusk, five or six local kids in the hotel car park are shadowboxing, copying Kati."},
  {n:"kati",f:"happy",l:"casual",t:"Guard higher than that! Like this, like this. Yes! Great job!"},
  {n:"nar",t:"Kati teaches for half an hour like her Saturday kids' class. The smallest one won't let go of her hand."},
  {n:"kati",f:"flustered",l:"casual",t:"Grandpa taught me in a yard just like this... one day these kids might fight in the Four Regions too."}]},
 {id:"kati_letter",g:["kati"],ok:G=>rgC(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"Kati is writing a letter at the desk, writing and erasing. The first page is already full."},
  {n:"kati",f:"happy",l:"casual",t:`Usually I write to Grandpa and burn it on the anniversary. But this one I'm keeping... I'll burn it when the camp has all four regions.`},
  {n:"kati",f:"flustered",l:"casual",t:"We have "+rgC(G)+" cups now. I wrote everyone's names in... and I wrote yours the biggest. Don't ask to read it!",choice:[
   {t:"Promise not to ask to see it",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"happy",l:"casual",t:"You promised! ...If you really want to know, on the day I burn it, I'll read it to you."}]},
   {t:"Tease her about what the biggest letters mean",fx:G2=>add(G2,"kati","bond",3),then:[{n:"kati",f:"flustered",l:"casual",t:"It... it means important! It doesn't mean anything else! Go to bed!"}]}]}]},
 {id:"mali_garland",g:["mali"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`Mali gathers a handful of fallen flowers from the tree outside the hotel in ${D.name} and sits stringing them on her bed from eight o'clock.`},
  {n:"mali",f:"happy",l:"casual",t:"Mali's been stringing garlands since she was five~ Mum taught her. We sold them outside the temple every holy day."},
  {n:"mali",f:"happy",l:"casual",t:"This one's Kati's, this one's Rin's, Ploy's, Fah's... and this one's for you, Manager. Hang it in the van so we get home safe.",choice:[
   {t:"Hang it on the rear-view mirror right away",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"flustered",l:"casual",t:"You really hung it~ ...Mali will make a new one every trip."}]},
   {t:"Ask her to teach you",fx:G2=>add(G2,"mali","bond",3),then:[{n:"nar",t:"Ten minutes later, the manager's garland leans to one side."},{n:"mali",f:"happy",l:"casual",t:"Crooked but cute~ Mali's keeping this one herself."}]}]}]},
 {id:"mali_sea",g:["mali"],r:"south",bg:"sea",s:(G,D)=>[
  {n:"nar",t:"At dusk Mali sits alone on the beach hugging her knees, not smiling like she usually does."},
  {n:"mali",f:"sad",l:"casual",t:"This sea looks just like the one in front of home in Chaiya... Dad used to bring Mali to watch the fishing boats come in."},
  {n:"mali",f:"sad",l:"casual",t:"Mali doesn't want to smile today. Just for one day... you don't have to say anything.",choice:[
   {t:"Sit beside her quietly until it's dark",fx:G2=>add(G2,"mali","bond",3),then:[{n:"nar",t:"The waves keep coming in until the first boat light shows on the horizon."},{n:"mali",f:"happy",l:"casual",t:"...Thank you for not asking. Tomorrow Mali will smile for everyone like always~"}]},
   {t:"\"Your dad must have seen you fight from somewhere\"",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"sad",l:"casual",t:"...Mali wants to believe that. Could you say it again? Just once."}]}]}]},
 {id:"mali_cry",g:["mali"],ok:G=>rgB(G)>=2,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"Everyone gathers in Ploy's room, but Mali has been gone too long. The manager finds her on the fire stairs, eyes red."},
  {n:"mali",f:"flustered",l:"casual",t:"Oh! I'm not crying~ It's just... every time the camp wins, Mali wishes Dad could see."},
  {n:"mali",f:"sad",l:"casual",t:"Dad used to say women's boxing had no future... our camp has "+rgB(G)+" belts now. I wish Dad could see.",choice:[
   {t:"\"Your future's already started, and everyone in the camp sees it\"",fx:G2=>add(G2,"mali","bond",3),then:[{n:"mali",f:"happy",l:"casual",t:"...Everyone in the camp sees it. That's true~ Let's go back in and celebrate."}]},
   {t:"Hand her a handkerchief and wait until she stops crying",fx:G2=>add(G2,"mali","bond",2),then:[{n:"mali",f:"flustered",l:"casual",t:"Your handkerchief, Mali's borrowing it. I'll wash it and give it back... maybe I won't~"}]}]}]},
 {id:"rin_stars",g:["rin"],bg:"night",s:(G,D)=>[
  {n:"nar",t:"On the hotel roof, Rin lies on a deckchair, her black notebook closed beside her."},
  {n:"rin",f:"surprised",l:"casual",t:"...Manager, I'm not slacking. Today I decided not to note anything down, to see what it's like."},
  {n:"rin",f:"happy",l:"casual",t:`The stars in ${D.name} are clearer than Chiang Mai's by about... no. Not counting. Not tonight.`,choice:[
   {t:"Lie on the chair next to her and count nothing together",fx:G2=>add(G2,"rin","bond",3),then:[{n:"nar",t:"Twenty minutes pass. Rin doesn't say a single number."},{n:"rin",f:"flustered",l:"casual",t:"...These are the twenty minutes I'll remember best from this trip. I'm counting this number."}]},
   {t:"Ask how it feels not to write anything",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"happy",l:"casual",t:"Strange. Like forgetting my glasses... but something looks clearer."}]}]}]},
 {id:"rin_laugh",g:["rin"],ok:G=>rgB(G)>=3,bg:"hotel_room",s:(G,D)=>[
  {n:"rin",f:"happy",l:"casual",t:"Manager, I'd like you to look at a data set. I've kept it since the first trip."},
  {n:"nar",t:"The page in the black notebook is headed \"Times everyone laughed in the van\", with tally marks growing longer trip by trip."},
  {n:"rin",f:"flustered",l:"casual",t:"Twelve times on the first trip. Forty-one on the latest. Fah alone accounts for nineteen... it's useless for boxing, but I want to keep it.",choice:[
   {t:"\"It's the best statistic in this notebook\"",fx:G2=>add(G2,"rin","bond",3),then:[{n:"rin",f:"flustered",l:"casual",t:"...I thought so too. I just didn't think anyone would agree."}]},
   {t:"Ask how many times she laughed",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"pout",l:"casual",t:"I didn't count myself... fine, I did. Seven times. Five because of you. Satisfied?"}]}]}]},
 {id:"rin_dad",g:["rin"],ok:G=>rgC(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"Rin stares at her phone for a long time. It's a message from her father."},
  {n:"rin",f:"surprised",l:"casual",t:"Dad sent me the news about the regional cup... Dad follows boxing? I never knew."},
  {n:"rin",f:"sad",l:"casual",t:"At the end it says, \"I understand now why you didn't do the PhD.\" ...Manager, what should I reply?",choice:[
   {t:"\"Just say thank you, and invite him to a fight\"",fx:G2=>add(G2,"rin","bond",3),then:[{n:"nar",t:"Rin types, deletes and types again three times before pressing send."},{n:"rin",f:"happy",l:"casual",t:"Sent... Dad's read it. He's typing."}]},
   {t:"\"No need to answer yet. Keep the feeling for a while.\"",fx:G2=>add(G2,"rin","bond",2),then:[{n:"rin",f:"happy",l:"casual",t:"Yes. I'll keep it for now... read it another ten times or so."}]}]}]},
 {id:"ploy_knee",g:["ploy"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"At midnight the manager goes down for water and finds Ploy alone by the vending machine, icing her knee."},
  {n:"ploy",f:"surprised",l:"casual",t:"...Don't tell the juniors. It's just a bit tight. It's nothing."},
  {n:"ploy",f:"sad",l:"casual",t:"That knee used to be everything I had. If it didn't come back, there'd be nothing left... but lately I don't think that way much.",choice:[
   {t:"Hold the ice pack for her",fx:G2=>add(G2,"ploy","bond",3),then:[{n:"ploy",f:"flustered",l:"casual",t:"...You don't have to. I can do it... fine. Five minutes."}]},
   {t:"\"You have more than your knee now\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"happy",l:"casual",t:"Juniors who are noisy all night, a manager who comes down for water at midnight... yes, I have more than a knee now."}]}]}]},
 {id:"ploy_tea",g:["ploy"],r:"isan",bg:"night_isan",s:(G,D)=>[
  {n:"nar",t:"Ploy opens the flask of tea her mother sent from Korat and pours oolong into a row of paper cups."},
  {n:"ploy",f:"happy",l:"casual",t:"Mum made it... she sent it for everyone. Says if you drink it before bed you'll sleep well."},
  {n:"ploy",f:"sad",l:"casual",t:"Mum stopped coming to my fights in my second year. Her heart couldn't take it... but she sends tea every time she knows I'm going to Isan.",choice:[
   {t:"Finish the tea and ask for a second cup",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"happy",l:"casual",t:"I'll tell Mum someone asked for a second cup. She'll be happier than if I'd won."}]},
   {t:"\"Someday, bring your mum to a fight that isn't scary\"",fx:G2=>add(G2,"ploy","bond",3),then:[{n:"ploy",f:"flustered",l:"casual",t:"...A fight that isn't scary. Is there such a thing? If there is, I'd want Mum sitting next to you."}]}]}]},
 {id:"ploy_carry",g:["ploy","fah"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"Halfway through the movie in the common room, Fah has fallen asleep on Ploy's shoulder, a snack still in her hand."},
  {n:"ploy",f:"happy",l:"casual",t:"Shh... I'll carry her to her room. Wake her now and she'll yell the whole floor down."},
  {n:"nar",t:"Ploy carries Fah down the hall. Fah mumbles in her sleep."},
  {n:"fah",f:"flustered",l:"casual",t:"...Ploy... Fah's not asleep... just resting her eyes..."},
  {n:"ploy",f:"happy",l:"casual",t:"Yes, yes, not asleep... Manager, get the door for me. I'll tuck her in and come back.",choice:[
   {t:"Get the door and carry the snacks she dropped",fx:G2=>{add(G2,"ploy","bond",2);add(G2,"fah","bond",2);},then:[{n:"nar",t:"In the morning Fah insists to everyone that she walked back to her room herself."}]},
   {t:"Take a photo as evidence",fx:G2=>{add(G2,"ploy","bond",1);add(G2,"fah","bond",2);},then:[{n:"nar",t:"In the morning Fah sees the photo and chases the manager around the car park."},{n:"fah",f:"pout",l:"casual",t:"Delete it right now!! ...Send it to Fah first, then delete it!"}]}]}]},
 {id:"fah_storm",g:["fah"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`2 a.m. A storm hits ${D.name}. Thunder cracks so hard the windows shake, then the whole hotel loses power.`},
  {n:"nar",t:"Knocks on Fah's door, one after another: Kati, Mali, Rin, Ploy, each holding a pillow."},
  {n:"fah",f:"pout",l:"casual",t:"What are you all doing here! ...Scared of thunder? Fine, you can sleep in Fah's room. Fah will keep watch."},
  {n:"nar",t:"Nobody says they know Fah has been afraid of thunder since she was little. They just squeeze onto the two beds until the storm passes."},
  {n:"fah",f:"flustered",l:"casual",t:"...Why are you standing at the door? Come in. Not inviting you, okay. The power's out and the hall is dark.",choice:[
   {t:"Sit against the door inside the room until morning",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"...Thanks. Once. Don't tell anyone."}]},
   {t:"Tell everyone a ghost story",fx:G2=>add(G2,"fah","bond",1),then:[{n:"fah",f:"angry",l:"casual",t:"Youuu!! ...Keep going. Fah's not scared. Fah's just holding your arm."}]}]}]},
 {id:"fah_laundry",g:["fah"],ok:G=>rgB(G)>=1,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"In the morning everyone's training gear is folded neatly outside their doors, smelling of fabric softener."},
  {n:"mali",f:"surprised",l:"casual",t:"Who washed these~? Mali didn't."},
  {n:"fah",f:"pout",l:"casual",t:"Not Fah! Fah slept in, slept all night!"},
  {n:"nar",t:"Fah's fingertips are still wrinkled from water, and a coin laundry receipt sticks out of her tiger jacket pocket.",choice:[
   {t:"Play along and thank whoever did it, out loud",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"...Whoever washed them is probably glad, I guess. Don't know. Fah didn't do it!"}]},
   {t:"Hold up the receipt",fx:G2=>add(G2,"fah","bond",1),then:[{n:"fah",f:"angry",l:"casual",t:"Give it back!! ...Fine, Fah did it. Grandma says when you live in someone's house you help out. Happy now!"}]}]}]},
 {id:"fah_style",g:["fah"],ok:G=>rgB(G)>=4,bg:"night",s:(G,D)=>[
  {n:"nar",t:"In the van that day everyone talked about their home styles: Kati and Tha Sao, Mali and Chaiya, Ploy and Korat, Rin and Lopburi. That night Fah is oddly quiet."},
  {n:"fah",f:"pout",l:"casual",t:"Everyone has a hometown style. Fah doesn't. Fah learned everything in real rings... not that Fah's upset. Just saying."},
  {n:"fah",f:"sad",l:"casual",t:"So what style is Fah, really?",choice:[
   {t:"\"The Sirichai style. You're the first of it.\"",fx:G2=>add(G2,"fah","bond",3),then:[{n:"fah",f:"flustered",l:"casual",t:"...First of her line. Sounds cool. Fah's taking that name. No changing it."}]},
   {t:"\"A style nobody else has to match\"",fx:G2=>add(G2,"fah","bond",2),then:[{n:"fah",f:"happy",l:"casual",t:"Not like anyone... yes. Fah isn't like anyone anyway! You got one right for once."}]}]}]},
 {id:"duo_kati_mali",g:["kati","mali"],bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:`Kati and Mali sneak out to the convenience store at eleven and come back with two big bags.`},
  {n:"kati",f:"happy",l:"casual",t:"Manager! Don't tell Kru Daeng, okay? There's some for you too."},
  {n:"mali",f:"happy",l:"casual",t:`The official souvenir of ${D.name} that you can only get at a convenience store~ Mali picked it herself.`},
  {n:"nar",t:"Five minutes later the room is full of laughter and crumbs. Next door knocks on the wall twice.",choice:[
   {t:"Sit and eat with them until the bags are empty",fx:G2=>{add(G2,"kati","bond",2);add(G2,"mali","bond",2);},then:[{n:"kati",f:"happy",l:"casual",t:"This is what travelling tastes like!"}]},
   {t:"Do Kru Daeng's voice outside the door",fx:G2=>{add(G2,"kati","bond",1);add(G2,"mali","bond",1);},then:[{n:"nar",t:"Kati and Mali dive under the blanket together. The snack bags vanish under the bed in one second."},{n:"mali",f:"pout",l:"casual",t:"Manager, you're so mean~!"}]}]}]},
 {id:"duo_rin_ploy",g:["rin","ploy"],ok:G=>rgB(G)>=2,bg:"hotel_room",s:(G,D)=>[
  {n:"nar",t:"Rin's light is still on. She and Ploy are watching tonight's fight together on a laptop."},
  {n:"ploy",f:"happy",l:"casual",t:"Back at Golden Tiger we watched tape like this every night, remember?"},
  {n:"rin",f:"sad",l:"casual",t:"I remember... I left without saying goodbye to you. I never apologised for that."},
  {n:"ploy",f:"happy",l:"casual",t:"You were right to leave. I just left a bit later than you... come on, play it. Round two, my guard drops here, doesn't it?",choice:[
   {t:"Pull up a chair and watch the tape too",fx:G2=>{add(G2,"rin","bond",2);add(G2,"ploy","bond",2);},then:[{n:"rin",f:"happy",l:"casual",t:"Three watch better than two. Statistically... I made that statistic up just now."}]},
   {t:"Close the door quietly and leave them to talk",fx:G2=>{add(G2,"rin","bond",1);add(G2,"ploy","bond",1);},then:[{n:"nar",t:"The two of them keep laughing behind the door until late."}]}]}]},
 {id:"duo_fah_kati",g:["fah","kati"],bg:"night",s:(G,D)=>[
  {n:"fah",f:"happy",l:"casual",t:"Kati! Race you to the corner shop. Loser buys ice cream!"},
  {n:"kati",f:"happy",l:"casual",t:"You're on! Manager, you're the referee!"},
  {n:"nar",t:"They take off together. Fah passes her on the last corner, but Kati leaps and slaps the shop door half a step ahead."},
  {n:"fah",f:"pout",l:"casual",t:"Doesn't count! Kati jumped! You, judge it again!",choice:[
   {t:"Give it to Kati",fx:G2=>{add(G2,"kati","bond",2);add(G2,"fah","bond",1);},then:[{n:"fah",f:"pout",l:"casual",t:"...Fine, Fah's buying. But Fah picks the flavour!"},{n:"kati",f:"happy",l:"casual",t:"Ice cream you win tastes better than any other!"}]},
   {t:"Call it a draw and buy for both of them",fx:G2=>{add(G2,"kati","bond",2);add(G2,"fah","bond",2);},then:[{n:"fah",f:"flustered",l:"casual",t:"...A draw, then. Next time Fah wins clean! Your ice cream's not bad, by the way."}]}]}]}];
function rgWarmPick(G,T){const R=G.region,D=ROAD_DEST[T.dest];if(!R||!D)return null;const seen=R.warm=R.warm||{},P=T.party||[];
  const here=id=>P.includes(id)&&G.F[id]&&G.F[id].camp==="player";
  const L=RG_WARM.filter(w=>!seen[w.id]&&w.g.every(here)&&(!w.r||w.r===D.r)&&(!w.ok||w.ok(G)));if(!L.length)return null;
  const w=L[Math.floor(Math.random()*L.length)];return w;}
function rgMsQ(G,q){const R=G.region;R.ms=R.ms||{};if(R.ms[q.k])return;R.ms[q.k]=1;(R.msQ=R.msQ||[]).push(q);}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}rgApply(G);const now=gameWeek(G);if(lbWeek(G,done))return;
    /* v1.91.122 (Man): the five celebrate the camp's milestones back home, one a week */
    if(R.msQ&&R.msQ.length){const q=R.msQ.shift(),S=rgMsSteps(G,q);if(S){playScene(S,()=>{save();done();},{bg:RG_MSL[q.k].bg,look:"casual"});return;}}
    if(rgKritDue(G)){playScene(rgKritSteps(G),()=>{save();done();},{bg:"camp_day",look:"casual"});return;}
    {const hs=rgRelDue(G);if(hs){playScene(hs.steps,()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    /* v1.91.26 (Man): Kru Daeng reminds you to watch tape and train the counter before each regional title bout — no new buttons */
    for(const r of RG_ORDER){const c=R.champ[r],x=c&&c.next;if(!c||c.state!=="series"||!x||x.warned)continue;const left=x.abs-now;if(left<1||left>2)continue;
      const me=G.F[c.fid],cf=G.F[this.champId[r]];if(!me||!cf)continue;const tape=G.scoutAbs&&G.scoutAbs[cf.id]!=null&&now-G.scoutAbs[cf.id]<=8,ok=tape&&me.plan&&me.plan.preset===counterPreset(cf);x.warned=1;if(ok)continue;
      playScene([{n:"coach",t:`Regional title bout in ${left} weeks: ${me.name} vs ${RG[r].champ} bout ${x.n||1}`},
        {n:"coach",t:(x.n||1)>1?`Regional champions never fight the same way twice. ${tape?"The tape you watched still counts, but your training has to match it":"Go watch her latest bout first"}, then train the right counter. Switch to fight prep in fight week`
          :`A regional champion isn't a temple-fair opponent. ${tape?"You've seen the tape":"Watch her tape first"}, then train the counter to match what you saw. Switch to fight prep in fight week. Train like that and you'll have the edge from the first round`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}
    /* v1.91.28 round 12: a champion moves in · a camp girl notices a two-timing champion romance · a champion confesses */
    if(R.joinPend&&now>=R.joinPend.abs){const cid=R.joinPend.cid;delete R.joinPend;const S=this.joinSteps(G,cid),k=S.findIndex(x=>x.t==="This week, Sirichai Camp has a new member");this.joinApply(G,cid);
      const B={baibua:"temple",tabtim:"night",alicia:"vector_lab",chaba:"sea"};playScene(S.slice(0,k),()=>playScene(S.slice(k),()=>{save();done();},{bg:"camp",look:"casual"}),{bg:B[cid]||"camp",look:"casual"});return;}
    if(R.twoQ&&now>=R.twoQ.abs){const q=R.twoQ;delete R.twoQ;const g=G.F[q.id];if(g&&g.camp==="player"&&!isAway(G,q.id)&&this.isLovC(G,q.cid)&&RG_TWO[q.id]&&(isPartner(G,q.id)||this.isLovC(G,q.id))){add(G,q.id,"bond",-8);
      playScene([{n:q.id,f:"sad",l:"casual",t:RG_TWO[q.id]},{n:"nar",t:`${g.name} now knows about you and ${G.F[q.cid].name}`}],()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const cid=this.confDue(G);if(cid){playScene(this.confSteps(G,cid),()=>{save();done();},{bg:"camp_night",look:"casual"});return;}}
    /* v1.91.176 (Man): Kru Daeng warns when the camp is short of the five the Naka night needs */
    if(R.final&&!R.final.won&&!R.final.warn5&&this.finalPool(G).length<NL_ORDER.length){R.final.warn5=1;playScene(rgWarn5(G,this.finalPool(G).length,true),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(R.endWarn&&!R.final&&!R.warn5e&&roster(G).length<NL_ORDER.length){R.warn5e=1;playScene(rgWarn5(G,roster(G).length,false),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    {const r2=(R.cups||[])[1],c2=r2&&R.champ[r2];if(r2&&!R.c2&&c2&&now>=(c2.wonAbs||0)+1){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const r3=(R.cups||[])[2],c3=r3&&R.champ[r3];if(r3&&!R.c3&&c3&&now>=(c3.wonAbs||0)+1){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const F=R.final;if(F&&F.won&&!G.tigerRev&&now>=(F.wonAbs||0)+1){G.tigerRev=1;playScene(rgTiger(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    /* v1.91.47 (playtest): a camp that reaches the closing ceremony on the time limit with only one or two cups still gets Krerk's dinner and Pailin's tablet first — the ceremony and the reveal lean on them */
    if(this.closeDue(G)&&!R.c2){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)&&!R.c3){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    if(this.closeDue(G)){this.openFinal(G);this.playClose(()=>{this.blackCard(G);save();done();});return;} /* v1.91.20 round 11 */
    done();},
  /* ---------- state helpers ---------- */
  base(G){return ((G.season||1)-1)*52;},
  beltCount(G,r){const b=(G.region.belts||{})[r]||{};return RG[r].prov.filter(p=>b[p]).length;},
  beltTotal(G){return RG_ORDER.reduce((s,r)=>s+this.beltCount(G,r),0);},
  /* the first week the whole camp is free to travel: after the rest week, nobody else booked, not past week 50 */
  tripWeek(G){const R=G.region,from=Math.max(G.week,/* v1.90.17 (Man): a trip can go this very week, so one every week */ (R.nextTripAbs||0)-this.base(G));
    for(let w=from;w<=RG_LAST_WK;w++){if(!G.bookings.some(b=>b.week===w&&G.F[b.a]&&G.F[b.a].camp==="player")&&!this.nearSeries(G,this.base(G)+w))return w;}return null;},
  /* a championship bout is booked within a week of this one (the camp needs its rest week either side) */
  nearSeries(G,abs,skip){return RG_ORDER.some(r=>{const c=G.region.champ[r];return r!==skip&&c&&c.next&&c.next.abs===abs;});},
  riders(G,wk){return roster(G).filter(f=>!f.injury&&!G.bookings.some(b=>b.week===wk&&(b.a===f.id||b.b===f.id)));},

  /* ---------- booking a belt trip ---------- */
  makeOpp(G,dest,me,abs){const r=ROAD_DEST[dest].r,id=`rg_${dest}_${abs}`;if(G.F[id]){G.F[id].rgSty=G.F[id].rgSty||rgBeltSty(r,id);return id;}
    /* a little under your fighter at the first belt, a little over by the sixteenth; the regional style (tilt) is part of that budget, not on top of it */
    const n=this.beltTotal(G),target=RG_LADDER.belt(n),rng=mulberry32((G.seed||1)+stableHash(id)),tilt=RG[r].tilt;
    const f=baseFighter(id,mkNPC(id,this.oppName(G,dest),"X",Math.min(19,Math.round(target-1)),rng,RG_ORDER.indexOf(r)+2)),base={...f.a};
    const setT=T=>{f.a={...base};f.vet=0;for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);liftOpponent(f,T,20);
      for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);};
    f.rg=dest;rgDress(f);f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;setT(RG_FIX.belt(n)+rgEdB(G,"eb"));f.rgT=+(RG_FIX.belt(n)+rgEdB(G,"eb")).toFixed(2);f.camp="quest";f.div="X";f.rg=dest;f.rgSty=rgBeltSty(r,id);rgDress(f);f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid,now){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"Missing data"};
    if(R.trip)return {ok:false,why:"A trip is already planned"};const local=!!(R.belts[D.r]||{})[dest];
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"No free week left to travel this year"};if(now&&wk!==G.week)return {ok:false,why:`Can't set off this week · next possible week ${wk}`};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name} isn't fit to travel`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"Not enough money for the trip"};
    const opp=local?this.localOpp(G,dest,me,abs,1):this.makeOpp(G,dest,me,abs),pay=local?this.localPurse(G,1):this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:local?{r:D.r,dest,local:1,lr:1}:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat,quick:this.canQuick(G,dest)&&!!R.quickPref,party:this.party(G,fid),noCoach:roadCoachAvail(G)&&!roadCoachIn(G),local:local?1:0};UI.rgNoCoach=false;
    G.log=G.log||[];G.log.push(`Trip planned to ${D.name} week ${wk} · travel cost ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  /* v1.91.76 (Man): the travelling party — the fighter always, then whoever the player picked, capped by the vehicle's seats */
  pairDue(G,dest){const R=G.region,D=ROAD_DEST[dest];if(!R||!D)return null;const tx=R.tx||{},dfr=R.txDefer||{};
    const ds=[dest,...Object.keys(dfr).filter(d=>dfr[d]&&ROAD_DEST[d]&&ROAD_DEST[d].r===D.r)];for(const d of ds)if(RG_PAIR[d]&&RG_TRIPX[d]&&!tx[d]&&rgIn(G,RG_PAIR[d]))return RG_PAIR[d];return null;},
  party(G,fid){const max=roadSeats(G),pick=(UI.rgParty||[]).filter(id=>id!==fid&&G.F[id]&&G.F[id].camp==="player");return [fid,...pick].slice(0,Math.max(max,1));},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(R)rgApply(G);if(R&&R.joined)this.joinSkills(G);if(R)this.bondSync(G);if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(rg.nlfinal){if(R.final){R.final.cur=R.final.cur||{};R.final.cur[rg.nlfinal]=p.res||"L";}continue;}if(rg.nlleg){this.legResult(G,rg.nlleg,p);continue;}if(rg.side)continue;if(!D||!RG[r])continue;
      if(rg.series){this.lbAdd(G,p.a,"rc:"+r,p.res,p.stop);this.seriesResult(G,r,p);continue;}
      if(rg.local){const T=R.trip,abs=T&&T.abs!=null?T.abs:gameWeek(G);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);continue;} /* v1.91.93: the local ring pays a purse, no belt */
      this.lbAdd(G,p.a,"pc:"+dest,p.res,p.stop);
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""} wins the provincial belt of ${D.name}!`);if(G.F[p.a])recordHonor(G,"rgbelt",p.a,G.F[p.a].div,G.week,dest,G.F[p.b]?G.F[p.b].name:this.oppName(G,dest),p.b);rgMsQ(G,{k:"belt1",id:p.a,dest}); /* v1.91.14 (Man): a province belt gets the same ceremony as the main game */
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){rgMsQ(G,{k:"ticket",r});R.champ[r].state="letter";this.champFighter(G,r);
          rgOrg(G,r,`${RG_TITLE[r]}: all four belts won`,`Dear Manager of Sirichai Camp,

Your camp now holds all four belts of the ${RG[r].name}. ${RG[r].champ}, the new champion of ${RG[r].name} challenges you for the regional title. Best 2 of 3; the organizer pays for travel.

Pick your fighter under Fights › Four Regions Championship`+((t=>t?`\n\n(${t})`:"")(this.tipText(G,r))));rgSay(G,r,`${RG_TITLE[r]}: all four belts won`,RG_CH[r].letter);}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;rgSay(G,r,`A letter from ${RG[r].champ}`,RG_POST[r]);}
      const cid=RG_CID0[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&((R.joined&&R.joined[cid])||c.visit==="done"||c.state==="won"||rgEd(G)>=2);G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID0[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;rgSay(G,r,`A letter from ${RG[r].champ}`,RG_MISS[r]);}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;rgApply(G);this.lbWeek(G);this.flush(G);this.legendMail(G);this.seriesWeekly(G);this.fade(G);this.letters(G);this.finalWeekly(G);this.joinWeekly(G);this.joinPerks(G);this.loopWeekly(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+RG_TRIP_GAP);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&(G.F[id].rg||G.F[id].rgLocal))delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  /* v1.91.93 (Man): the local ring — a one-night knockout of up to three local fighters (random names, generic sprites), each a little better, purse per win, a small honour for the night's champion */
  localOpp(G,dest,me,abs,k){const id=`rgl_${dest}_${abs}_${k}`;if(G.F[id])return id;const rng=mulberry32((G.seed||1)+stableHash(id)),T=21.0+.45*(k-1);
    const nm=rgNm({f:Math.floor(rng()*997),k:Math.floor(rng()*97),p:Math.floor(rng()*3)},dest);
    const f=baseFighter(id,mkNPC(id,nm,"X",Math.min(18,Math.round(T-2)),rng,Math.floor(rng()*9)));liftOpponent(f,T,20);
    f.camp="quest";f.div="X";f.rgLocal=1;f.lvl=Math.max(1,(me.lvl||1)-2+k);f.fatigue=0;f.morale=70;G.F[id]=f;syncFighterAges(G);return id;},
  localPurse(G,k){const w=Math.round(2500*k*(1+Math.min(G.rep||0,50)/100)/100)*100;return {win:w,lose:500};},
  localRun(b,T,cb){const D=ROAD_DEST[T.dest],k=(b.region&&b.region.lr)||1,RND=["first round","Semifinal","Final"];
    openFight(b,()=>{const R=G.region,L=R.lastRes,res=L&&L.bid===b.id?L.res:null,me=G.F[b.a],bg=b.bg?b.bg.replace(/\.webp$/,"").replace(/^bg_/,""):"camp";
      if(res==="W"&&k<3&&me&&!(me.injury>0)){const opp=this.localOpp(G,T.dest,me,T.abs,k+1),pay=this.localPurse(G,k+1),b2={...b,id:`${b.id}_r${k+1}`,b:opp,win:pay.win,lose:pay.lose,region:{...b.region,lr:k+1}};G.bookings.push(b2);save();
        playScene([{n:"nar",t:`Win ${RND[k-1]}! The ring announcer of ${D.name} announces ${me.name} into the ${RND[k]}`},{n:"nar",t:`Fifteen minutes' rest. Next up: ${G.F[opp].name} ${k===1?"also won the first round":"tonight's favourite"} · purse this round ${fmt(pay.win)}`}],()=>this.localRun(b2,T,cb),{bg,look:"fight"});return;}
      const champ=res==="W"&&k===3;
      if(champ){G.rep=(G.rep||0)+1;R.localWins=R.localWins||{};R.localWins[T.dest]=(R.localWins[T.dest]||0)+1;G.log=G.log||[];G.log.push(`${me?me.name:""} wins the local ring of ${D.name} — three wins in a row · fame +1`);save();}
      playScene([{n:"nar",t:champ?`${me.name} wins three in a row! Champion of the local ring of ${D.name}! The crowd throws garlands into the ring · fame +1`:
        res==="W"?`${me.name} Win ${RND[k-1]}, but she's hurt and the corner calls it there — purse in hand, back to the hotel`:`${me.name} goes out in the ${RND[k-1]} — a show purse and applause from the locals`}],cb,{bg,look:"fight"});});},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;rgDress(G.F[b.b]);
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    /* v1.91.50 (playtest): a quick trip to a region you know — no drive, no hotel menu, no shop; the nights are rest */
    const fight=(cb)=>T.local?this.localRun(b,T,cb):openFight(b,cb);
    if(T.quick&&this.canQuick(G,dest)){this.arrive(G,T,P,null);fight(()=>{const n=P.nights||0;if(n){for(const f of roadRiders(G))f.fatigue=Math.max(0,(f.fatigue||0)-10*n);}
      G.log=G.log||[];G.log.push(`Back at camp from ${ROAD_DEST[dest].name}${n?` · rested at the hotel ${n} night(s), fatigue −${10*n}`:""}`);save();done();});return;}
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);window.__rgHotelR=ROAD_DEST[dest].r;const go=()=>this.hotel(b,T,()=>fight(()=>this.night(T,P2||P,1,done))),A=this.firstArrive(G,ROAD_DEST[dest].r,dest),Bp=this.provArrive(G,dest,!!A);T.fa=A?1:0;
      const goB=()=>Bp?playScene(Bp,go,{bg:RG_RBG[ROAD_DEST[dest].r],look:"casual"}):go();
      if(A){playScene(A,goB,{bg:"gas_station",look:"casual"});}else goB();}});},
  /* v1.91.121 (Man): off-schedule fight — the call, the choice to go, then bout after bout */
  sideRun(T,X,done){const R=G.region,r=ROAD_DEST[T.dest].r,S=R.side[r];S.triedAbs=T.abs;rgTouch(G,X.cid);
    let go=0;playScene([...X.intro(G,ROAD_DEST[T.dest]),{n:"nar",t:"What do you do?",choice:[{t:X.go,fx:()=>{go=1;}},{t:X.no,then:X.noT(G)}]}],()=>{
      if(!go){save();done();return;}
      playScene(X.arrive(G),()=>this.sideBout(T,X,0,done),{bg:X.bg,look:"casual"});},{bg:this.hotelBg[r],look:"casual"});},
  sideBout(T,X,i,done){const R=G.region,r=ROAD_DEST[T.dest].r,S=R.side[r],N=X.foes.length,F=X.foes[i],K=QK[F.qk];
    const P=T.party||null,riders=roster(G).filter(f=>(!P||P.includes(f.id))&&!(f.injury>=3)).sort((a,b)=>(a.fatigue||0)-(b.fatigue||0));
    const fin=(won)=>{if(won){S.won=1;R.sideN=(R.sideN||0)+1;G.rep=(G.rep||0)+1;G.log=G.log||[];G.log.push(`${X.title} · won all ${N} bouts · fame +1`);}
      const end=()=>{if(won&&X.done)X.done(G,S.how);save();done();};playScene(won?X.win(G):X.lose(G),()=>{if(won&&X.after)X.after(G,T,end);else end();},{bg:X.bg,look:"casual"});};
    if(!riders.length){fin(false);return;}
    let pick=null;
    playScene([{n:"npc",who:K.name,t:F.t},{n:"nar",t:`Off-schedule fight, bout ${i+1}/${N} · who steps in?`,choice:[
      ...riders.slice(0,4).map(f=>({t:`Send ${f.name} (fatigue ${Math.round(f.fatigue||0)})`,fx:()=>{pick=f.id;}})),
      {t:"Back off for now, come back another time",then:[{n:"nar",t:"The camp backs off to the van, the thugs' laughter following them out."}]}]}],()=>{
      if(!pick){fin(false);return;}
      (T.sideFought=T.sideFought||[]).push(pick);const me=G.F[pick],inj=me.injury||0,opp=makeQ(G,F.qk,pick,`side_${r}_${T.abs}_${i}`);
      const b={id:`rgs${T.abs}_${r}_${i}`,a:pick,b:opp,week:G.week,tier:"quest",rounds:3,win:0,lose:0,region:{r,side:1},bg:X.ring,title:X.title};
      openFight(b,()=>{me.injury=inj;const L=R.lastRes,res=L&&L.bid===b.id?L.res:null;save();
        if(res!=="W"){fin(false);return;}
        if(i+1>=N){fin(true);return;}
        playScene([{n:"nar",t:`${me.name} wins! ${(X.between||[])[i]||""}`}],()=>this.sideBout(T,X,i+1,done),{bg:X.bg,look:"casual"});});},{bg:X.bg,look:"casual"});},
  /* v1.91.114 (Man): the champion meets the camp the first time it reaches each of her belt provinces (after her first-arrival scene, only the province part) */
  provArrive(G,dest,after){const R=G.region,D=ROAD_DEST[dest];if(!R||!D||!RG_PROV[dest])return null;R.provMet=R.provMet||{};if(R.provMet[dest])return null;
    const cid=RG_CID[D.r];if(R.joined&&R.joined[cid])return null;R.provMet[dest]=1;rgTouch(G,cid);const S=RG_PROV[dest](G,D);return after?S.body:[...S.meet,...S.body];},
  /* v1.91.76 (Man): drive → hotel → "head for the ring" → the bout */
  hotel(b,T,go,again){const D=ROAD_DEST[T.dest],me=G.F[b.a],op=G.F[b.b];if(!me||!op){go();return;}
    const girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b2)=>(b2.bond||0)-(a.bond||0)),menu=this.hotelMenu(T,D,girls,1,true);
    const intro=again?[]:[{n:"nar",t:`Checked into a hotel in ${D.name}. Everyone drops their bags. ${me.name} sits at the end of the bed, quietly wrapping her hands`},
      T.local?{n:"nar",t:`This trip is a holiday, but tonight the local ring of ${D.name} runs a knockout of eight locals — win three in a row and you're champion of the night. ${me.name} is already signed up`}:
      roadCoachIn(G)?{n:"coach",t:`Tonight ${op.name}, the province champion, fights in front of her home crowd tonight. Don't let the cheering rattle you.`}:{n:"nar",t:`Tonight ${op.name}, the province champion, fights in front of her home crowd tonight. Kru Daeng calls briefly: don't let the cheering rattle you.`}];
    playScene([...intro,{n:"nar",t:"There's still time before the bout. What now?",choice:menu}],()=>{save();
      if(T.goShop){T.goShop=0;this.shop(T,()=>this.hotel(b,T,go,1),1,1);return;}
      if(T.menuBack){T.menuBack=0;this.hotel(b,T,go,1);return;}
      T.goRing=0;playScene([{n:"nar",t:RG_TO_RING[(G.region.ringN=(G.region.ringN||0)+1)%RG_TO_RING.length]}],()=>go(),{bg:"hotel_room",look:"casual"});},{bg:"hotel_room",look:"casual"});},
  /* the first trip into a region: its champion comes to meet the camp on the way in */
  firstArrive(G,r,dest){const R=G.region;R.arrived=R.arrived||{};if(R.arrived[r]||!RG_ARRIVE[r])return null;R.arrived[r]=1;rgTouch(G,RG_CID[r]);return RG_ARRIVE[r](G,ROAD_DEST[dest]);},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){window.__rgHotelR=(ROAD_DEST[T.dest]||{}).r||window.__rgHotelR;const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`The whole camp arrives in ${ROAD_DEST[T.dest].name} · fatigue +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    /* v1.91.121 (Man): her trouble comes first — the off-schedule fight takes the first night */
    if(n===1&&!T.sideSeen){const X=rgSideDue(G,T);if(X){T.sideSeen=1;this.sideRun(T,X,()=>this.night(T,P,n,done));return;}}
    {const tx=G.region.tx=G.region.tx||{},dfr=G.region.txDefer=G.region.txDefer||{};
      /* v1.91.78 (Man): a province's pair scene waits until her girl rides along — on this trip or a later one in the same region */
      const ready=d=>RG_TRIPX[d]&&!tx[d]&&(!RG_PAIR[d]||rgInT(G,RG_PAIR[d])||!rgIn(G,RG_PAIR[d]));
      let key=null;if(n===1&&!T.series){if(RG_TRIPX[T.dest]&&!tx[T.dest]){if(ready(T.dest))key=T.dest;else dfr[T.dest]=1;}
        if(!key)key=Object.keys(dfr).find(d=>dfr[d]&&ROAD_DEST[d]&&ROAD_DEST[d].r===r&&ready(d))||null;}
      if(key){const X=RG_TRIPX[key];tx[key]=1;delete dfr[key];rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`The bout in ${D.name} is over. Everyone waits by the car.`,choice:[
          {t:"Head back to camp",then:[{n:"nar",t:"The car pulls out of town, and everyone is asleep before you even leave the province."}]},
          {t:`Stay one more night (rooms ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("Not enough money for the rooms, so back to camp for now");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    /* v1.91.122 (Man): a quiet moment with the camp's own girls — at most one a trip, each moment once */
    if(!T.backShop&&!T.warmed&&Math.random()<(G.region.warmP!=null?G.region.warmP:.55)){T.warmed=1;const w=rgWarmPick(G,T);if(w){G.region.warm[w.id]=1;save();
      playScene(w.s(G,D),()=>this.night(T,P,n,done),{bg:w.bg==="night"?this.hotelBg[r]:w.bg,look:"casual"});return;}}
    const girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0));
    const choice=this.hotelMenu(T,D,girls,n,false);
    const oddL=RG_ODD[r]||[],oddOn=!T.backShop&&oddL.length&&girls.length&&Math.random()<.4,odd=oddOn?oddL[Math.floor(Math.random()*oddL.length)]:null,og=girls.length?girls[Math.floor(Math.random()*girls.length)]:null,
      oddStep=odd&&og?[{inject:G2=>{const X=RG_ODD_FX[odd.fx]||RG_ODD_FX.none;X[1](G2);return [{n:"nar",t:odd.t.replace(/\{g\}/g,og.name)+(X[0]?` · ${X[0]}`:"")}];}}]:[];
    const back=T.backShop;T.backShop=0;
    playScene([...(back?[]:[{n:"nar",t:nights>1?`Night ${n} in ${D.name}`:`The whole camp stays the night in ${D.name}`}]),...oddStep,{n:"nar",t:"What shall we do tonight?",choice}],()=>{
      /* v1.91.78 (Man): the hotel souvenir shop — buy as many as you like, the night is still yours */
      if(T.goShop){T.goShop=0;this.shop(T,()=>{T.backShop=1;this.night(T,P,n,done);},1,1);return;}
      if(T.menuBack){T.menuBack=0;T.backShop=1;this.night(T,P,n,done);return;}this.night(T,P,n+1,done);},{bg:this.hotelBg[r],look:"casual"});},
  /* v1.91.82 (Man): the hotel menu in layers — go out ▸ pick who · go out with the champion · rest at the hotel · souvenirs · (before the bout) straight to the ring */
  hotelMenu(T,D,girls,n,pre){const r=D.r,cid=this.champId[r],C=RG[r],top=girls[0],back={t:"◂ Back",fx:()=>{T.menuBack=1;}};
    const outs=[...girls.map(g=>({t:`Out with ${g.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      ...(RG_OUT[T.dest]&&girls.length?[{t:`The whole team: ${RG_OUT[T.dest].t}`,fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+3);add(G2,girls[0].id,"bond",1);},then:[{n:"nar",t:RG_OUT[T.dest].l.replace(/\{g\}/g,girls[n%girls.length].name)+" · morale +3"}]}]:[]),back];
    return [
      ...(outs.length>1?[{t:`Go out around ${D.name} ▸`,then:[{n:"nar",t:"Who do you ask out?",choice:outs}]}]:[]),
      {t:`Go out with ${C.champ} (champion of ${C.name})`,fx:G2=>{rgMeet(G2,cid,3);this.dateMark(G2,cid,T.dest);},
        then:[...this.dateLines(cid,D,T.dest),...rgJealStep(G,C.champ,3)]},
      {t:"Rest at the hotel (fatigue −10)",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:pre?"Everyone rests in the room until it's time to go to the ring · fatigue −10":"Everyone turns in early and wakes up fresh · fatigue −10"}]},
      ...(pre?[]:[{t:"Light training in the hotel parking lot",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"Pad work under the parking-lot lights until the hotel guard comes to watch · EXP +6"}]}]),
      {t:`🛍 Buy souvenirs from ${D.name} (takes no time)`,fx:()=>{T.goShop=1;}},
      ...(pre?[{t:"Straight to the ring ▸",fx:()=>{T.goRing=1;}}]:[])];},
  home(T,done){window.__rgHotelR=null;const R=G.region;R.shopSeen=R.shopSeen||{};if(!T.shopDone){T.shopDone=1;if(!R.shopSeen[T.dest]){R.shopSeen[T.dest]=1;this.shop(T,()=>this.home(T,done),1);return;}} /* v1.91.166 (Man): the roadside shop stop only the first time per province — the hotel shop stays open every trip */G.log=G.log||[];G.log.push(`Back at camp from ${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"On the way home the bus stops at a roadside souvenir shop. Paper umbrellas hang in rows; fine handwoven cloth lies folded on a wooden table.",
    isan:"On the way out of town the bus stops at the provincial silk centre. Triangle pillows are piled like a mountain; Praewa silk hangs behind glass.",
    central:"Before heading home the bus stops at a roadside Thai crafts shop. Khon masks stare down from the walls; Benjarong cups line the shelves.",
    south:"On the way out of town the bus stops at a seaside souvenir shop. Shadow puppets glow in the shopfront; pearls sit in a glass case."},
  shop(T,next,first,hotel){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r&&(!GIFTS[k].pv||GIFTS[k].pv===T.dest)).sort((a,b)=>(GIFTS[b].pv?1:0)-(GIFTS[a].pv?1:0));if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`Buy ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · own ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:hotel?"Enough, back to the room":first?"Nothing today, back on the bus":"That's enough, back on the bus",fx:()=>{st.end=1;}}];
    const pv=L.find(k=>GIFTS[k].pv),head=hotel&&first?[{n:"nar",t:`The souvenir shop next to the hotel still has its lights on.${pv?` ${GIFTS[pv].name} famous in ${ROAD_DEST[T.dest].name} is lined up out front`:""}`}]:first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"Souvenirs aren't cheap, but the girls will love them · buy now, give later (shops like this only on trips)"}]:[];
    playScene([...head,{n:"nar",t:first?"Pick up anything to take home?":"Anything else?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("Not enough money");if(st.got)toast(`Bought: ${GIFTS[st.got].name} · give it under Camp › Souvenirs`);this.shop(T,next,0,hotel);},{bg:this.hotelBg[r],look:"casual"});},
  /* v1.91.114 (Man): her own night the first time in each province, then her usual nights in turn */
  dateMark(G,cid,dest){const R=G.region;R.dated=R.dated||{};if(RG_DATE[dest]&&!R.dated[dest]){R.dated[dest]=1;return;}R.dateN=R.dateN||{};R.dateN[cid]=(R.dateN[cid]||0)+1;},
  dateLines(cid,D,dest){const R=G.region;if(dest&&RG_DATE[dest]&&!(R.dated||{})[dest])return RG_DATE[dest](G);const P=RG_DATEP[cid];if(P&&P.length)return P[((R.dateN||{})[cid]||0)%P.length](G);
    const L={
    baibua:[{n:"baibua",f:"flustered",l:"casual",t:`The walking street's crowded tonight, jao… if we get separated, you can hold on to my sleeve, jao.`},{n:"nar",t:"Baibua walks slowly so you can keep up. Your hands almost touch a few times, but neither of you says anything."}],
    tabtim:[{n:"tabtim",f:"happy",l:"casual",t:"Let's go eat som tam, de! This stall's real spicy… haha, I'm crying already, ai!"},{n:"nar",t:"Tabtim laughs loud enough for the whole stall to hear, but when you hand her a tissue she goes quiet for a moment."}],
    alicia:[{n:"alicia",f:"flustered",l:"casual",t:"Don't get the wrong idea. I just wanted someone to walk with. The camera's off tonight…"},{n:"nar",t:"Alicia leaves her phone face down on the table all night. She never picks it up once."}],
    chaba:[{n:"chaba",f:"happy",l:"casual",t:"…The sea is pretty at night."},{n:"nar",t:"Chaba says nothing more, but she stays beside you until the tide reaches her ankles."}]};
    return L[cid]||[{n:"nar",t:`An evening walk in ${D.name}`}];},
  jealLine(id,champ){const L={kati:`You went walking with ${champ}? …No, I'm not asking.`,mali:`Mali saw that~ You went out with ${champ}, right? …Mali wants to go too.`,
    rin:`Out with ${champ} for two hours twelve minutes. I wasn't timing it. I just happened to look at my watch.`,ploy:`Out with ${champ}, huh? Good for you. …Why are you even asking?`,fah:`Oh, so you went out with ${champ}, huh! Fah's not sulking! Just… hungry!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`The night market in ${city} has so many sweets… could you buy me one? Just one, really.`,mali:`${city} is so pretty at night~ Thank you for bringing Mali. I'll remember this.`,
    rin:`I noted three good places to eat in ${city}. Let's hit the first one; we have just enough time.`,ploy:`Didn't ask you to bring me. …But, thanks.`,fah:`${city} has so much weird food! Fah's trying all of it. Manager's paying!`};return L[id]||`Tonight in ${city} was fun.`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){this.treeInit();const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    const NC=G.region.nc&&G.region.nc[r];f.pfx=H.perk.fx;f.canon=!NC;f.camp="region";if(NC){f.sprite="rgp_"+NC.home;f.color=C.col;f.name=C.champ;}
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],ceil=RG_LADDER.champ(cups,c.tries),tilt=C.tilt;
      f.lvl=Math.max(me.lvl||1,1)+3+Math.min(2,cups)/* v1.90.20 (Man): regional champions 3–5 levels above */;f.fatigue=0;f.injury=0;f.morale=75;
      /* re-fit only when your fighter or the stakes changed (this runs before every bout) */
      const key=[cups,c.tries||0,rgEd(G)].join("|");
      if(f.rgKey!==key){const setT=T=>{f.vet=0;for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,T-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
          liftOpponent(f,T,20);for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);};
        const T=RG_FIX.champ(cups,c.tries)+rgEdB(G,G.region.nc&&G.region.nc[r]?"nb":"cb")-(RG_SK_ADJ[r]||0)-(RG_SK_CUP[r]||0)*Math.min(3,cups); /* a lost series makes the rematch a little easier (v1.90.14) */setT(T);f.rgT=+T.toFixed(2);f.rgKey=key;}
      /* her tree is built at a fixed level (35 + cups, max 37) — never from your fighter's level, so heavy and casual players meet the same champion (v1.90.21 rule) */
      {const tl=RG_CH_SKLV+Math.min(2,cups);if(f.rgSkLv!==tl&&hasTree(id)){const lv=f.lvl;f.lvl=tl;this.autoLearn(G,id);f.lvl=lv;f.rgSkLv=tl;}}}
    return f;},
  seriesPurse(G){const cups=(G.region.cups||[]).length,w=Math.round((30000+cups*6000)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  /* the first week from `from` that suits a championship bout: weeks 1–50, the camp home and rested, no other trip next to it */
  spot(G,r,from){const c=G.region.champ[r],T=G.region.trip;
    for(let abs=Math.max(from,gameWeek(G)+1),i=0;i<80;abs++,i++){const season=Math.floor((abs-1)/52)+1,wk=abs-(season-1)*52;if(wk<2||wk>RG_LAST_WK)continue;
      if(T&&T.abs===abs)continue;if(this.nearSeries(G,abs,r))continue;
      if(season===(G.season||1)&&G.bookings.some(b=>b.week===wk&&G.F[b.a]&&G.F[b.a].camp==="player"))continue;
      return {abs,season,wk};}return null;},
  schedule(G,r,from){const c=G.region.champ[r],s=this.spot(G,r,from);if(!s){c.next=null;return null;}
    c.next={...s,bid:`rgc_${r}_${s.abs}`,n:(c.n||0)+1};this.ensureBooking(G,r);return c.next;},
  ensureBooking(G,r){const c=G.region.champ[r],x=c.next;{const cf=G.F[this.champId[r]];if(x&&cf&&RG_CH[r].sty)cf.rgSty=RG_CH[r].sty[Math.min(2,Math.max(1,x.n||1)-1)];}if(!x||x.season!==(G.season||1)||x.wk<G.week||G.bookings.some(b=>b.id===x.bid))return;
    const me=G.F[c.fid];if(!me||me.camp!=="player")return;const cid=this.champId[r];this.champFighter(G,r,me);const pay=this.seriesPurse(G);
    G.bookings.push({id:x.bid,a:c.fid,b:cid,week:x.wk,tier:"region",rounds:5,win:pay.win,lose:pay.lose,region:{r,dest:RG[r].fin,series:x.n},bg:`bg_region_${RG_CH[r].ring}.webp`});
    G.offers=(G.offers||[]).filter(o=>o.week!==x.wk);},
  /* the letter came: pick the fighter who carries the whole series */
  startSeries(G,r,fid){const c=G.region.champ[r],me=G.F[fid];if(!c||c.state!=="letter"||!me||me.camp!=="player")return {ok:false,why:"Can't pick that fighter"};
    if(this.overTime(G))return {ok:false,why:"This Clash of the Four Regions is over · challenge again in the next edition"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null,bo:(c.tries||0)>=1?1:3}); /* v1.91.166 (Man): a rematch after a lost series is one deciding bout */this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"There aren't enough free weeks left this year for a title series"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · bout 1, week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+RG_TRIP_GAP);G.log=G.log||[];
    const need=c.bo===1?1:2;if(c.w>=need){c.state="won";c.wonAbs=abs;if(me)G.lastBig={a:me.id,b:this.champId[r],win:"A",wk:G.week,absWeek:gameWeek(G),shown:false,cup:r,cupName:RG[r].name}; /* v1.91.166 (Man): a regional title always gets the village news + aunties */(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r,opp:`${RG[r].champ} · won ${c.w}-${c.l}`});}
      /* v1.91.120 (Man): all four regional cups = national level — every fighter who won a cup this edition gets it in the hall */
      if(R.cups.length>=4&&!R.natDone){R.natDone=1;G.honors=G.honors||[];const ws=new Set();for(const h of G.honors)if(/^rg_/.test(h.kind)&&!(h.season&&((h.season-1)*52+(h.week||1))<(R.startAbs||0)))ws.add(h.id);
        for(const id of ws){const k=`${G.season||1}:rgnat:${rgEd(G)}::${id}`;if(!G.honors.some(h=>h.key===k))G.honors.push({key:k,season:G.season||1,week:G.week,id,div:(G.F[id]||{}).div,kind:"rgnat",opp:"All four cups · Four Regions Championship"});}}
      rgMsQ(G,{k:["cup1","cup2","cup3","nat"][Math.min(3,R.cups.length-1)],id:me?me.id:null,r});rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · prize ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=need){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+1;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} keeps the title ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";rgSay(G,r,`${RG[r].champ} is dropping by the camp`,(RG_VISITMSG[RG_CID0[r]]&&!(G.region.nc&&G.region.nc[r])?RG_VISITMSG[RG_CID0[r]]:`${RG[r].champ} sent word she'll drop by the camp before bout 2`)+`

(Welcome her under Fights › Four Regions Championship · before bout 2)`);}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} bout ${c.n}: ${p.res==="W"?"Win":p.res==="L"?"Loss":"Draw"} · score ${c.w}-${c.l}${s?` · next bout in week ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    {const n=(R.cups||[]).length;if(!R.close&&!R.endWarn&&n>=1&&n<4&&now>=(R.startAbs||0)+130){R.endWarn=1; /* v1.91.47: half a year of warning before the time limit */
      addMail(G,{kind:"letter",tone:"naka",from:"NAGA Energy Drink",title:"Clash of the Four Regions: about half a year left",body:"Dear Manager of Sirichai Camp,\n\nThis Clash of the Four Regions closes in about half a year. After that there will be no new challenges to the regional champions. Any series still under way will be fought to the end, and then comes the closing ceremony in Bangkok.\n\nIf there are cups left to win, win them before time runs out.\n\nNaka Energy Drink · Drink Naka, fight without end!"});}}
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)&&!this.overTime(G)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        rgOrg(G,r,`${RG_TITLE[r]}: a new challenge`,`Dear Manager of Sirichai Camp,

${RG[r].champ}, the new champion of ${RG[r].name} is open to a title challenge again · the rematch is one deciding bout · pick your fighter under Fights › Four Regions`+((t=>t?`\n\n(${t})`:"")(this.tipText(G,r))));rgSay(G,r,`${RG_TITLE[r]}: a new challenge`,RG_CH[r].again);continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"The bout didn't go ahead as booked");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name} is still injured`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    rgOrg(G,r,`Bout postponed: ${RG_TITLE[r]}`,`${why} · the organiser has moved bout ${(c.n||0)+1}${s?` to week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`:""}`);rgSay(G,r,`Bout postponed: ${RG_TITLE[r]}`,RG_CH[r].wait);},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const t=c.tries||0,head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} bout ${n}${n>1?` · score ${me.name} ${sc} ${RG[r].champ}`:""}${t?` · rematch no. ${t}`:""}`};
    const NC=G.region.nc&&G.region.nc[r],bi=n===1?0:c.w===1&&c.l===1?2:1,P2=t?(NC?RG_PRE2._nc:RG_PRE2[cid]):null,line=P2&&P2[bi]?P2[bi][(t-1)%P2[bi].length]:H.pre[bi];
    const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",...(NC?{}:{with:cid}),t:t&&n===1&&RG_REPLY2[me.id]?RG_REPLY2[me.id]:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name} nods and walks back to the red corner`}];
    return [head,...(rgEd(G)>=2&&n===1&&!NC?[{n:"nar",t:`${RG[r].champ} kept the regional title for another reign, and is stronger than three years ago`}]:[]),{...this.spk(r,n===1?"happy":"angry","fight"),t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      {const aw={kind:"rg_"+r,key:"cup"+r};AU.startMusic("victory");AU.sfx("champ");playScene(H.cup(G,J),()=>{AU.startMusic("hub");T.cupNight=rgEd(G)===1?1:0;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight",award:aw});
        [600,1300,2200,3300,4700,6200].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===aw)AU.sfx("pop");},ms));}return;} /* v1.91.14: the cup gets the ceremony overlay, fireworks and the victory song */
    const t2=(R.champ[r]||{}).tries||0,P2=t2?((R.nc&&R.nc[r])?RG_POST2._nc:RG_POST2[cid]):null,L2=P2&&(J.res==="W"?P2.lose:P2.win);
    const steps=J.kind==="lost"?H.lost(G,J):[{...this.spk(r,J.res==="W"?"sad":"happy","fight"),t:L2&&L2.length?L2[(t2+(J.n||1))%L2.length]:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`Score now ${J.w}-${J.l} · next bout in about 2 weeks`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  /* v1.91.50 (playtest): Daeng watches the champion's tapes and says who fits — a player sending the wrong girl lost a series ten times without knowing why */
  /* v1.91.57 (Man): Daeng names the champion's weak spot, not the girl to send — the player works out who fits (fighter styles show on each fighter's page) */
  tipFor(G,r){const H=RG_CH[r],S=(H&&H.sty)||[];if(!S.length||typeof FSTYLE_BEATS==="undefined")return null;
    const sc=Object.keys(FSTYLE_BEATS).map(x=>[x,S.filter(y=>FSTYLE_BEATS[x].includes(y)).length]).sort((a,b)=>b[1]-a[1]);const top=sc[0][1];return top?{weak:sc.filter(x=>x[1]===top).map(x=>x[0]).slice(0,2)}:null;},
  tipText(G,r){const t=this.tipFor(G,r);if(!t)return "";const D={power:"stands and trades heavy punches",pressure:"keeps pressing forward",counter:"stays patient and counters",footwork:"moves fast with good footwork",inside:"gets inside and stays close"};
    return `Coach Daeng watched the tapes of ${RG[r].champ} · weak spot: she hates facing someone who ${t.weak.map(x=>D[x]).join(" or someone who ")}`;},
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · venue ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>Format</span><b>${(G.region.champ[r].tries||0)?"Rematch · one deciding bout · 5 rounds":"Best of 3 · 5 rounds each · about 2 weeks apart"}</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>Rematch</span><b class="goldt">Series lost so far: ${G.region.champ[r].tries} · the camp knows this champion's game better now</b></div>`:""}
     ${(t=>t?`<p class="goldt rg-tip">📼 ${esc(t)}</p>`:"")(this.tipText(G,r))}
     <div class="kv-row"><span>Strength of ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>Purse per bout</span><b class="num">${fmt(pay.win)} / loss ${fmt(pay.lose)}</b></div><div class="kv-row"><span>Cup prize</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>Who fights the whole series</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to fight</p>`}
     <p class="meta">Once picked, she fights the whole series · an injury postpones the bout · the organiser pays travel for every bout ${c.tries?` · attempt ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>Accept the challenge</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 Cup won</span>`:n<4?`<span class="meta">🔒 Win all 4 belts first (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">Pick a title fighter</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · bout ${c.next.n} week ${c.next.wk}${c.next.season!==(G.season||1)?` (next year)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">Welcome ${esc(C.champ)} to camp</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">Practice duel</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)} kept her title · ${this.overTime(G)?"this edition's time is up":"waiting for a new challenge letter"}</span>`:`<span class="meta">✉️ Waiting for the champion's letter</span>`;
    const chat=""; /* v1.91.72 (Man): her chat lives in the Characters tab like everyone else's — no chat button on the region card */
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>regional championship ring</small>${gap>=3?`<small class="rg-miss">💭 ${gap} weeks since you last saw ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-final{border-top:6px solid #1a1a1a;background:linear-gradient(180deg,#2a1414 0,#160c0c 100%);color:#f3e6e6}.rg-final h3,.rg-final h4{color:#ff5a5a}.rg-final .meta{color:#d9bcbc}.rg-final.won{border-top-color:#d4a52a}.rg-fprep button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;max-width:22rem}.rg-fprep small{opacity:.8;font-size:.72rem;white-space:normal}.rg-fprep button,.rg-fprep button *{text-align:left!important;align-self:stretch}.rg-nl .kv-row{border-bottom:1px dashed rgba(255,255,255,.15)}.rg-slot{margin:.4rem 0 .7rem;padding:0 .9rem .4rem 0;border-bottom:1px dashed rgba(0,0,0,.2)}.rg-slot .kv-row{flex-wrap:wrap;gap:4px 12px}.rg-slot .kv-row small{margin-left:auto}.m-rgfline{max-width:580px;background:linear-gradient(180deg,#120a1e,#0b0812);color:#fff}.m-rgfline .meta{color:#c9c0dc}.vs-head{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.2rem 0 .3rem;font-weight:900;letter-spacing:.02em}.vs-tl,.vs-tr{flex:1;padding:.35rem .6rem;font-size:1.05rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}.vs-tl{text-align:right;background:linear-gradient(90deg,transparent,#c0182a);clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}.vs-tr{text-align:left;background:linear-gradient(90deg,#1d4fe0,transparent);clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}.vs-sc{font-size:1.7rem;min-width:3.4rem;text-align:center;color:#ffd84a;text-shadow:0 0 12px rgba(255,216,74,.5)}.vs-sub{text-align:center;font-size:.72rem;margin:0 0 .5rem}.vs-rows{display:flex;flex-direction:column;gap:6px}.vs-row{display:grid;grid-template-columns:1fr 46px 1fr;align-items:stretch;height:84px;position:relative}.vs-l,.vs-r{position:relative;display:flex;align-items:center;gap:.4rem;overflow:hidden;color:#fff;border:0;font:inherit;min-width:0}.vs-l{justify-content:flex-start;background:linear-gradient(90deg,#4a0710,#d01d2c 70%,#ff3b47);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);padding-right:12%}.vs-r{justify-content:flex-end;background:linear-gradient(90deg,#3f7bff,#1d4fe0 30%,#0a1f6b);clip-path:polygon(12% 0,100% 0,100% 100%,0 100%);padding-left:12%;cursor:pointer;text-align:right}.vs-r:not([disabled]):hover{filter:brightness(1.15)}.vs-row.next .vs-r{box-shadow:inset 0 0 0 3px #ffd84a}.vs-row.next .vs-r:not(:has(.vs-art)){animation:vsPulse 1.2s ease-in-out infinite}@keyframes vsPulse{50%{filter:brightness(1.35)}}.vs-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;font-style:italic;color:#fff;  text-shadow:-2px 0 0 #d01d2c,2px 0 0 #1d4fe0,0 0 10px rgba(255,255,255,.4);z-index:2}.vs-mid small{font-size:.58rem;font-style:normal;text-shadow:none;color:#c9c0dc}.vs-art{position:relative;flex:0 0 74px;height:84px;overflow:hidden}.vs-art img{position:absolute;left:50%;top:2px;height:235%;transform:translateX(-50%);max-width:none}.vs-art canvas{position:absolute;left:50%;top:-4px;width:150px;height:150px;transform:translateX(-50%);image-rendering:auto}.vs-tx{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vs-tx b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.45)}.vs-tx em{font-style:normal;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}.vs-tx small{font-size:.64rem;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vs-empty b{font-size:.85rem;opacity:.95}.vs-row.done .vs-l,.vs-row.done .vs-r{cursor:default}.vs-row.done .vs-l.lost,.vs-row.done .vs-r.lost{filter:grayscale(1) brightness(.72)}.vs-st{position:absolute;top:50%;transform:translate(-50%,-50%) rotate(-10deg);pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.6);font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;  padding:.05rem .45rem;border:3px solid currentColor;border-radius:4px;background:rgba(0,0,0,.55);z-index:3}.vs-st.vsl{left:11%}.vs-st.vsr{left:89%}.vs-st.w{color:#ffd84a}.vs-st.l{color:#ff6a6a}.vs-st.d{color:#d8d8d8}.rg-stars i{font-style:normal;color:#5a4a4a;font-size:1rem;letter-spacing:1px}.rg-stars i.on{color:#ffd84a;text-shadow:0 0 6px rgba(255,216,74,.6)}.rg-leg .kv-row{align-items:center}.vs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:.5rem 0}.vs-pc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 0 .4rem;border:0;color:#fff;font:inherit;cursor:pointer;  background:linear-gradient(180deg,#2a5bf0,#0d2478);box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}.vs-pc.on{box-shadow:inset 0 0 0 3px #ffd84a}.vs-pc[disabled]{filter:grayscale(1) brightness(.55);cursor:default}.vs-pc .vs-art{flex:none;width:100%;height:96px}.vs-pc small{font-size:.66rem;opacity:.85}@media (prefers-reduced-motion:reduce){.vs-row.next .vs-r{animation:none}}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rgt-list{display:grid;gap:.5rem}.rg-step{display:inline-block;background:#d9a21b;color:#1b1230;font-weight:700;padding:.1rem .5rem;margin:.2rem 0}.rg-finbtn{display:grid;width:100%;margin-top:6px;text-align:left;background:#7a1020;color:#fff;box-shadow:inset 0 0 0 2px #ffcf4a}.rg-finbtn small{opacity:.85}.rg-finbtn.hot{animation:finb 1s steps(2) infinite}.rg-nstrip{display:grid;grid-template-columns:auto 1fr auto;gap:.6rem;align-items:center;background:#0d0a12;color:#eee;border:3px solid #b3141f;padding:.55rem .7rem;margin:0 0 .7rem}.rg-nstrip:not(.won){animation:finb 1.2s steps(2) infinite}.rg-nstrip.won{border-color:#d9a21b;animation:none}.rg-nstrip b{display:block;color:#ff6b6b}.rg-nstrip.won b{color:#ffd36a}.rg-nstrip small{display:block;opacity:.8;font-size:.8em}.rg-ncard{font-size:1.9rem;line-height:1;color:#ff3b3b}.rg-nstrip.won .rg-ncard{color:#ffd36a}.rg-nwait{text-align:right;font-weight:700;color:#ffb0b0}.rg-nbtn{white-space:nowrap}@keyframes finb{50%{box-shadow:inset 0 0 0 2px #ffcf4a,0 0 0 4px #ff3b55}}
.lb-head,.lb-row{display:grid;grid-template-columns:1.6em 2.6em 1fr auto 2.6em;gap:.4rem;align-items:center}.lb-head{font-size:.75rem;opacity:.7;padding:0 .3rem}.lb-row{padding:.3rem;border-left:4px solid var(--rc);margin:3px 0;background:rgba(0,0,0,.14)}.lb-row.us{background:rgba(255,207,74,.14);box-shadow:inset 0 0 0 1px #ffcf4a}
.lb-n{font-weight:700;text-align:center}.lb-mv{font-style:normal;font-size:.72rem;opacity:.7}.lb-mv.up{color:#7aff9a;opacity:1}.lb-mv.dn{color:#ff7a6a;opacity:1}.lb-mv.new{color:#ffcf4a;opacity:1}
.lb-who{display:flex;align-items:center;gap:.35rem;min-width:0}.lb-who>span{display:grid;min-width:0}.lb-who small{opacity:.7;font-size:.72rem}.lb-who img{width:26px;height:26px}
.lb-rec{display:grid;justify-items:end;font-size:.82rem}.lb-rec small{opacity:.7;font-size:.7rem}.lb-fm{display:flex;gap:1px}.lb-fm .fm{font-size:.62rem;padding:0 2px}.fm.W{background:#2f8a4f}.fm.L{background:#8a2f3a}.fm.D{background:#6a6a7a}.lb-pts{text-align:right;color:var(--gold,#ffcf4a);font-size:1.05rem}
@media (prefers-reduced-motion:reduce){.rg-finbtn.hot,.rg-nstrip{animation:none}}.rg-pairtag small{color:#ffd36a}.rgt-dev{margin-top:.6rem;padding:.5rem;border:2px dashed #8fd3ff;display:grid;gap:.4rem}.rgt-dev>div{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.rgt-dev small{opacity:.75;margin-right:4px}.rgt-reg{border-left:6px solid var(--rc);padding:.3rem .5rem;background:rgba(0,0,0,.12)}.rgt-pv{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.rgt-pv .btn{display:grid;text-align:left}.rgt-pv .btn small{opacity:.75}.rg-load{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;background:#07040c url(${ASSET}bg_naka_underground.webp) center/cover}.rgl-in{background:rgba(8,4,10,.82);box-shadow:inset 0 0 0 3px #c41d33;padding:1rem 1.2rem;max-width:min(90vw,520px);display:grid;gap:.6rem;color:#f3e9ff}.rgl-in b{color:#ff5a6c;font-size:1.2rem}.rgl-in p{margin:0;line-height:1.5}.rgl-bar{height:10px;background:#2a0d14;box-shadow:inset 0 0 0 2px #5a1520}.rgl-bar i{display:block;height:100%;width:0;background:#e0283c;transition:width .2s}.fprep3{display:grid;gap:6px;margin:.4rem 0}.fprep3 h4{margin:0;color:#ff7a8a}.fprep3 .btn{text-align:left;display:grid;justify-items:start;padding:.5rem .8rem}.fprep3 .btn.gold{box-shadow:inset 0 0 0 3px #ffcf4a}.fprep3 .btn small{opacity:.8}.rg-show{position:fixed;inset:0;z-index:9000;background:#07040c;display:flex;align-items:center;justify-content:center}.rgs-in{position:relative;width:min(100vw,960px)}.rg-show canvas{width:100%;height:auto;display:block;image-rendering:auto}.rgs-cap{min-height:3.2em;padding:.7rem 1rem;color:#f3e9ff;font-size:1.05rem;line-height:1.5;background:linear-gradient(180deg,#1a1028,#0d0815);border-top:3px solid #ff4d6d}.rgs-skip{position:absolute;top:.5rem;right:.5rem}.rg-quick{display:grid;grid-template-columns:auto 1fr;column-gap:.5rem;align-items:center;margin:.6rem 0;cursor:pointer}.rg-quick small{grid-column:2}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
.rg-pick button{display:flex;align-items:center;gap:.35rem}.rg-pick button[aria-pressed="true"]{outline:3px solid var(--gold,#d9a21b)}
.rg-bill .kv-row{padding:.15rem 0}.rg-fuel.cheap{color:#2f8a50}.rg-fuel.high{color:#c8283c}
#rdcv{width:100%;height:auto;image-rendering:pixelated;background:#1b1530;box-shadow:inset 0 0 0 2px var(--line)}
.rd-play{width:min(560px,100%)}
.rd-say{display:flex;gap:10px;align-items:flex-start;min-height:92px;padding:10px 12px 22px;position:relative;background:var(--bg1,#231c3a);cursor:pointer}
.rd-say img{width:56px;height:56px;object-fit:cover;object-position:top;flex:none;box-shadow:inset 0 0 0 2px #4a3f6b}
.rd-say b{display:block;color:var(--gold)}.rd-say p{margin:2px 0 0;line-height:1.5}.rd-say.nar p{font-style:italic;color:#d8d0ec}
.rd-say small{position:absolute;right:10px;bottom:4px;font-size:11px;color:var(--muted)}
.rd-car{display:grid;justify-items:center;gap:2px}.rd-car small{color:var(--muted);font-size:12px}
.rd-fuel{display:grid;grid-template-columns:auto 1fr;gap:4px 8px;align-items:center}.rd-fuel b{grid-column:1/-1;text-align:center;font-size:14px}.rd-pump{font-size:22px}
.rd-gauge{position:relative;height:12px;background:linear-gradient(90deg,#3f9a4f 0 33%,#e0b41b 33% 66%,#d23246 66%);box-shadow:inset 0 0 0 2px #120c1c}
.rd-gauge i{position:absolute;top:-4px;width:4px;height:20px;margin-left:-2px;background:#fff;box-shadow:0 0 0 1px #120c1c}
.rd-fuel.cheap b{color:#7fd88a}.rd-fuel.high b{color:#ff8f8f}
.rd-bill{display:grid;gap:2px;padding:8px 10px}.rd-bill .kv-row{font-size:13px}.rd-total{border-top:1px dashed #4a3f6b;padding-top:4px;margin-top:2px}
.rd-seg{display:flex;flex-wrap:wrap;gap:4px;justify-content:center}#roadtrip{background:#0a0616}`;document.head.appendChild(st);},
  fuelLine(G){const ft=roadFuelOf(roadCarKey(G)),p=roadFuel(G,gameWeek(G),ft),b=roadFuelBand(p,ft);
    return `<p class="meta">Fuel this week <b class="rg-fuel ${b}">฿${p.toFixed(2)}/L · ${b==="cheap"?"cheap":b==="high"?"pricey":"Normal"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  /* ---------- v1.91.78 (Man): the regional tab is a ranking board like the sub-district/district/province tables ----------
     points per bout (win 3 · win inside the distance +1 · draw 1), each fighter's record, rank up/down by week; the province and
     regional champions also fight each other on the circuit, two bouts a week */
  lb(G){const R=G.region,ed=R.edition||1;if(!R.lb||R.lb.ed!==ed){const L={ed,pts:{},w:{},l:{},d:{},ko:{},form:{},prev:{},log:[]};R.lb=L;
      for(const r of RG_ORDER){for(const p of RG[r].prov){const P=R.pc&&R.pc[p],k="pc:"+p;L.pts[k]=0;L.w[k]=0;L.l[k]=0;L.ko[k]=0;
          for(const x of (P&&P.path)||[]){L.pts[k]+=3+(x.m==="ko"?1:0);L.w[k]++;if(x.m==="ko")L.ko[k]++;}}
        const k="rc:"+r;L.pts[k]=9;L.w[k]=3;L.l[k]=0;L.ko[k]=1;}
      /* a save already part-way through: count the belts and cups our fighters have won since the chapter opened */
      for(const h of G.honors||[]){if(!G.F[h.id]||G.F[h.id].camp!=="player")continue;if(h.season&&((h.season-1)*52+(h.week||1))<(R.startAbs||0))continue;const n=h.kind==="rgbelt"?1:/^rg_/.test(h.kind)?2:0;if(!n)continue;
        for(const o of [L.pts,L.w,L.l,L.d,L.ko])if(o[h.id]==null)o[h.id]=0;L.pts[h.id]+=3*n;L.w[h.id]+=n;}
      this.lbRank(G,true);}
    return R.lb;},
  lbKeys(G){const L=this.lb(G);return Object.keys(L.pts).filter(k=>!/^(pc|rc):/.test(k)?G.F[k]&&G.F[k].camp==="player":true);},
  lbName(G,k){if(k.startsWith("pc:")){const d=k.slice(3);return {n:this.oppName(G,d),c:`Provincial champion ${ROAD_DEST[d]?ROAD_DEST[d].name:""}`,col:RG[ROAD_DEST[d].r].col};}
    if(k.startsWith("rc:")){const r=k.slice(3);return {n:RG[r].champ,c:`Champion ${RG[r].name}`,col:RG[r].col,rc:1};}
    const f=G.F[k];return {n:f?f.name:k,c:"Sirichai Camp",us:1,f};},
  lbSorted(G){const L=this.lb(G);return this.lbKeys(G).sort((a,b)=>(L.pts[b]||0)-(L.pts[a]||0)||(L.w[b]||0)-(L.w[a]||0)||(L.l[a]||0)-(L.l[b]||0)||a.localeCompare(b));},
  lbRank(G,snap){const L=G.region.lb;if(!L)return;if(snap){L.prev={};this.lbSorted(G).forEach((k,i)=>L.prev[k]=i+1);}},
  lbAdd(G,a,b,res,stop){if(!a||!b)return;const L=this.lb(G),one=(k,r)=>{for(const o of [L.pts,L.w,L.l,L.d,L.ko])if(o[k]==null)o[k]=0;
      if(r==="W"){L.pts[k]+=3+(stop?1:0);L.w[k]++;if(stop)L.ko[k]++;}else if(r==="L")L.l[k]++;else{L.pts[k]+=1;L.d[k]++;}(L.form[k]=L.form[k]||[]).push(r||"D");if(L.form[k].length>5)L.form[k].shift();};
    const ra=res==="W"?"W":res==="L"?"L":"D",rb=ra==="W"?"L":ra==="L"?"W":"D";one(a,ra);one(b,rb);
    L.log.unshift({wk:G.week,ss:G.season||1,a,b,r:ra,stop:!!stop,pa:ra==="W"?3+(stop?1:0):ra==="D"?1:0,pb:rb==="W"?3+(stop?1:0):rb==="D"?1:0});if(L.log.length>14)L.log.length=14;},
  lbWeek(G){const R=G.region,now=gameWeek(G),L=this.lb(G);if(L.simWk===now)return;L.simWk=now;this.lbRank(G,true);
    const bots=Object.keys(L.pts).filter(k=>/^(pc|rc):/.test(k)),rng=mulberry32((G.seed||1)*7+now*131+(R.edition||1)*17);
    for(let n=0;n<2&&bots.length>1;n++){const a=bots[Math.floor(rng()*bots.length)];let b=bots[Math.floor(rng()*bots.length)];if(a===b)continue;
      const sa=a.startsWith("rc:")?1.6:1,sb=b.startsWith("rc:")?1.6:1,pw=sa/(sa+sb),x=rng(),res=x<pw*.94?"W":x<.94?"L":"D";this.lbAdd(G,a,b,res,rng()<.35);}},
  boardHTML2(G){const R=G.region,L=this.lb(G),S=this.lbSorted(G);
    const mv=k=>{const p=L.prev[k],c=S.indexOf(k)+1;return !p?`<i class="lb-mv new">new</i>`:p>c?`<i class="lb-mv up">▲${p-c}</i>`:p<c?`<i class="lb-mv dn">▼${c-p}</i>`:`<i class="lb-mv">–</i>`;};
    const rows=S.map((k,i)=>{const N=this.lbName(G,k),fm=(L.form[k]||[]).map(x=>`<b class="fm ${x}">${x==="W"?"W":x==="L"?"L":"D"}</b>`).join("");
      return `<div class="lb-row ${N.us?"us":""}" style="--rc:${N.col||"#c8283c"}"><span class="lb-n">${i+1}</span>${mv(k)}<span class="lb-who">${N.f?faceImg(N.f,"sm"):""}<span><b>${esc(N.n)}</b><small>${esc(N.c)}</small></span></span><span class="lb-rec">${L.w[k]||0}-${L.l[k]||0}${L.d[k]?`-${L.d[k]}`:""}<small>${L.ko[k]?`KO ${L.ko[k]}`:""}</small><span class="lb-fm">${fm}</span></span><b class="lb-pts">${L.pts[k]||0}</b></div>`;}).join("");
    const nm=k=>esc(this.lbName(G,k).n);
    const log=L.log.length?L.log.slice(0,10).map(x=>`<div class="kv-row"><span><small>Week ${x.wk}</small> ${nm(x.a)} <b>${x.r==="W"?"Win":x.r==="L"?"Loss":"Draw"}</b> ${nm(x.b)}${x.stop&&x.r!=="D"?" <small>(inside the distance)</small>":""}</span><span class="num">+${x.pa} / +${x.pb}</span></div>`).join(""):`<p class="meta">No bouts yet this edition</p>`;
    return `<section class="px card rg-head"><div><h3>Four Regions Championship standings</h3><span class="meta">Edition ${R.edition||1}${this.nextEdTxt(G)}</span></div>
      <p class="meta">Win 3 pts · win inside the distance +1 · draw 1 · province and regional champions fight each other twice a week · arrows compare with the start of the week · travel from the 🚐 button by the camp vehicle on the home screen</p>
      ${this.overTime(G)?`<p class="meta redt">This edition has run out of time</p>`:""}</section>
      <section class="px card"><div class="lb-head"><span>#</span><span></span><span>Fighter</span><span>Record</span><span>Pts</span></div>${rows}</section>
      <section class="px card"><h4>Latest bouts</h4>${log}</section>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>Four Regions Championship</h3><p>The national tournament sends its invitation once year 5 is over and the camp has won 3 provincial titles.</p>
       <div class="kv-row"><span>Year</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>Provincial titles</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">Open the chapter now (test mode)</button></div>`:""}</section>`;}
    rgApply(G);const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>Planned trip</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>Week ${T.wk}</b></div>
       <div class="kv-row"><span>Fighter</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>Opponent</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>Travel cost (paid)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">The whole camp travels together that week, so no other bouts.</p><div class="mfoot"><button class="btn" data-act="rgcancel">Cancel trip (refund)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        const P=R.pc&&R.pc[p];return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} km · ${nights?`Stay ${nights} night(s)`:"Day trip"}</small>${P?this.histHTML(P,p,`Provincial champion: ${rgNm(P,p)}`):""}</span>${got?`<span class="rg-belt">🏅 Belt won</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>Plan</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">Regional champion: <b>${esc(C.champ)}</b> · ${esc(C.nick)}${R.nc&&R.nc[r]?this.histHTML(R.nc[r],R.nc[r].home,"The new regional champion's story"):""}</div>${rows}${fin}</section>`;}).join("");
    return `${!R.gala?`<p class="meta rg-gala">🎉 The Four Regions Cup opening gala in Bangkok ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"is held at the end of next week":"is held at the end of this week"} · the whole camp is invited</p>`:""}${this.nagaStrip(G)}${this.boardHTML2(G)}
     ${!REGION_LIVE?`<p class="meta">Test mode: <button class="btn sm" data-act="rggala" data-v="gala">Watch the gala</button> <button class="btn sm" data-act="rgclosetest">Watch the closing</button> Underground test fight (open rules): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">Watch the green envelope scene</button>`:""}</p>`:""}${!REGION_LIVE?`<details class="rg-dev"><summary>Test mode: old cards</summary>${this.finalCard(G)}${this.legendCard(G)}<div class="rg-grid">${regs}</div></details>`:""}`;},
  /* v1.91.85 (Man): the warehouse 5v5 also sits as a strip on the regional tab (not only in the black letter); after the first win it opens the other levels */
  nagaStrip(G){const R=G.region,F=R&&R.final;if(!F)return "";const now=gameWeek(G);
    if(!F.won){const ready=now>=F.abs;
      return `<div class="px rg-nstrip"><span class="rg-ncard">🂠</span><span><b>Underground 5 vs 5 · Naga League</b><small>Old Khlong Toei dock warehouse · open rules · best of 5${F.tries?` · tried ${F.tries} times`:""}</small></span>${ready?`<button class="btn red rg-nbtn" data-act="rgfline">To the warehouse ▸</button>`:`<span class="rg-nwait">Open from week ${((F.abs-1)%52)+1}<small>${F.abs-now} weeks</small></span>`}</div>`;}
    return `<div class="px rg-nstrip won"><span class="rg-ncard">🂠</span><span><b>Underground 5 vs 5 · won ${esc(F.score||"")}</b><small>Pick your next level</small></span><span class="rg-nlv"><button class="btn gold rg-nbtn" data-act="rglegopen">✦ Legend tier ▸</button></span></div>`;},
  /* quick trips: only once the region's first meeting and this province's own story have been seen */
  /* v1.91.50 (playtest): a champion coming to visit shows on the home screen too — it was easy to miss on the regional tab */
  visitBanner(G){const R=G.region;if(!R||!R.champ)return "";const r=RG_ORDER.find(x=>R.champ[x]&&R.champ[x].visit==="due");if(!r)return "";const cid=this.champId[r];
    return `<button class="px newfighter" data-act="rgvisit" data-v="${r}"><span class="newb">NEW!</span>${G.F[cid]?`<img src="${faceSrc(cid,"happy")}" alt="">`:""}<span><b>${esc(RG[r].champ)} is visiting the camp</b><small>Tap to welcome her · only until bout 2</small></span><span class="chev">▸</span></button>`;},
  canQuick(G,dest){const R=G.region,D=ROAD_DEST[dest];if(!R||!D)return false;return !!((R.arrived||{})[D.r])&&!(RG_TRIPX[dest]&&!((R.tx||{})[dest]))&&!(RG_PROV[dest]&&!((R.provMet||{})[dest]))&&!(RG_SIDE[D.r]&&!((R.side||{})[D.r]||{}).won&&!(R.joined&&R.joined[RG_SIDE[D.r].cid]));},
  /* v1.91.82 (Man): two popups — first who comes along (seats), then who fights (from those on board) with the bill */
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>No free week left to travel this year</p>`;
    const RD=this.riders(G,wk),max=roadSeats(G),cand=roster(G).filter(f=>!f.injury||f.injury<3);
    if(!UI.rgParty){const pr=this.pairDue(G,dest);UI.rgParty=[...cand].sort((a,b)=>(b.id===pr)-(a.id===pr)||(b.bond||0)-(a.bond||0)).map(f=>f.id).slice(0,max);}
    UI.rgParty=UI.rgParty.filter(id=>cand.some(f=>f.id===id)).slice(0,max);
    const head=`<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">Travel in week <b>${wk}</b> · ${D.km} km · ${roadNights(D.km)?`Stay ${roadNights(D.km)} night(s)`:"Day trip"} · ${((G.region.belts||{})[D.r]||{})[dest]?`belt already won · a holiday + the <b>local ring</b> (3-fight knockout, random opponents, a purse for every win)`:`opponent: <b>${esc(this.oppName(G,dest))}</b>, province champion`}</p>`;
    if((UI.rgStep||1)===1){const okF=UI.rgParty.some(id=>RD.some(f=>f.id===id));
      return `${head}<p class="rg-step">Step 1/2 · Who comes along</p>
       <p class="meta">${roadCarKey(G)==="none"?`No camp vehicle · the bus takes any number, a ticket each · picked ${UI.rgParty.length} fighters in camp`:`${esc(roadCarName(roadCarKey(G)))} · ${(ROAD_CAR[roadCarKey(G)]||{}).seats} seats (the manager drives ${roadCoachIn(G)?" · Kru Daeng 1 seat":""}) · fighters who fit: <b>${max}</b> · picked ${UI.rgParty.length}/${max}`}</p>
       ${roadCoachAvail(G)?`<div class="rg-pick"><button class="btn sm" data-act="rgcoach" aria-pressed="${roadCoachIn(G)}"><img class="face sm" src="${faceSrc("coach","happy")}" alt="">Kru Daeng <small>${roadCoachIn(G)?"coming · reads tape, advises from the corner":"stays at camp · no advice this trip"}</small></button></div>`:`<p class="meta">Kru Daeng is on leave · no advice this trip</p>`}
       <div class="rg-pick">${cand.map(f=>{const on=UI.rgParty.includes(f.id),full=!on&&UI.rgParty.length>=max,pr=this.pairDue(G,dest)===f.id,fit=RD.some(x=>x.id===f.id);
         return `<button class="btn sm${pr?" rg-pairtag":""}" data-act="rgparty" data-v="${f.id}" aria-pressed="${on}" ${full?"disabled":""}>${faceImg(f,"sm")}${esc(f.name)}${fit?"":` <small>can't fight</small>`}${pr?` <small>💬 has a story with ${esc(C.champ)}</small>`:""}</button>`;}).join("")}</div>
       ${okF?"":`<p class="redt">Bring at least one fighter who is fit to fight</p>`}
       <div class="mfoot"><button class="btn" data-act="${UI.rgNow?"rgtravel":"closeModal"}">${UI.rgNow?"◂ Back":"Later"}</button><button class="btn primary" data-act="rgstep" data-v="2" ${okF?"":"disabled"}>Next · pick who fights ▸</button></div>`;}
    const R=RD.filter(f=>UI.rgParty.includes(f.id));if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),now=!!UI.rgNow;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `${head}<p class="rg-step">Step 2/2 · Who fights</p>
     ${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">No one on board is fit to fight</p>`}
     <p class="meta">Coming along: ${UI.rgParty.map(id=>esc(G.F[id]?G.F[id].name:"")).join(" · ")}</p>
     <h3>Travel cost, round trip</h3><div class="rg-bill"><div class="kv-row"><span>Vehicle</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`${P.ft==="ev"?"Electricity":"Fuel"} ${Math.round(P.litres)} ${P.unit||"litre"} × ฿${P.price.toFixed(2)}`,P.fuel)}${line("Tolls",P.toll)}${line(`Bus tickets × ${P.onBus}`,P.bus)}${line(`Lodging ${P.nights} night(s)`,P.lodge)}${line(`Food × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>Total</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div><div class="kv-row"><span>Camp cash after paying</span><b class="num ${poor?"redt":""}">${fmt(G.cash-P.total)}</b></div></div>
     <p class="meta">Travelling together: ${P.people} people (incl. the manager ${roadCoachIn(G)?" and Kru Daeng":""}) · those who stay train as programmed · no other fights that week · travel fatigue about +${P.fat} each ${P.car==="none"?" · the camp has no vehicle yet, so it's the bus (pricier and more tiring)":""}</p>
     ${this.canQuick(G,dest)?`<label class="rg-quick"><input type="checkbox" data-act="rgquick" ${G.region.quickPref?"checked":""}> Quick trip <small class="meta">skip the drive, the hotel nights and the souvenir shop · nights away count as rest</small></label>`:""}
     <div class="mfoot"><button class="btn" data-act="rgstep" data-v="1">◂ Who comes along</button>${now&&wk===G.week?`<button class="btn primary" data-act="rggonow" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"Not enough money":"Set off now ▸"}</button>`:`<button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"Not enough money":"Confirm the trip"}</button>`}</div>
     ${now&&wk===G.week?`<p class="meta center">Setting off ends this week right away (training → drive → hotel → ring)</p>`:""}`;},
  /* v1.91.76 (Man): the "travel" button at the camp vehicle — pick a province, then go this week */
  travelOk(G){const R=G.region;return !!(R&&R.belts&&regionOn());}, /* v1.91.93 (Man): the van stays on the road after the belts are won — holidays and the local ring */
  /* v1.91.78 (Man): once a region's four belts are in, its title match shows in the travel popup as a big blinking button */
  finBtn(G,r){const c=G.region.champ[r]||{};if(this.beltCount(G,r)<4||c.state==="won"||c.state==="locked")return "";const C=RG[r],hot=c.state==="letter"||(c.state==="series"&&c.visit==="due");
    return `<button class="btn rg-finbtn ${hot?"hot":""}" data-act="rgfinopen" data-v="${r}">⚔ Title match · ${esc(C.name)} · ${esc(C.champ)}<small>${c.state==="letter"?"Pick your title fighter":c.state==="series"?`${c.w}-${c.l}${c.next?` · bout ${c.next.n} week ${c.next.wk}`:""}${c.visit==="due"?" · she'll drop by the camp":""}`:c.state==="lost"?"Waiting for a new challenge":"Waiting for her letter"}</small></button>`;},
  finHTML(r){const C=RG[r];return `<h2>⚔ Title match · ${esc(C.name)}</h2><div class="rg-reg" style="--rc:${C.col}">${this.finRow(r)}</div><div class="mfoot"><button class="btn" data-act="rgtravel">◂ Back</button></div>`;},
  travelHTML(G){const R=G.region,wk=this.tripWeek(G),now=wk===G.week;
    if(R.trip){const T=R.trip,D=ROAD_DEST[T.dest];return `<h2>🚐 Travel · Four Regions Championship</h2><p>Trip booked to <b>${esc(D?D.name:"")}</b> week ${T.wk} booked · ${esc(G.F[T.fid]?G.F[T.fid].name:"")} fights</p><p class="meta">When that week comes, end the week to set off</p><div class="mfoot"><button class="btn" data-act="rgcancel">Cancel trip (refund)</button><button class="btn primary" data-act="closeModal">Close</button></div>`;}
    const rows=RG_ORDER.map(r=>{const C=RG[r],B=(R.belts||{})[r]||{};return `<div class="rgt-reg" style="--rc:${C.col}"><b>${esc(C.name)}</b><div class="rgt-pv">${C.prov.map(p=>{const D=ROAD_DEST[p];if(!D)return "";const got=!!B[p];
      return `<button class="btn sm ${got?"":"gold"}" data-act="rgtravelto" data-v="${p}">${esc(D.name)}<small>${got?`holiday · local ring`:`${D.km} km`}</small></button>`;}).join("")}</div>${this.finBtn(G,r)}</div>`;}).join("");
    return `<h2>🚐 Travel · Four Regions Championship</h2>${roadSignHTML(G)}<p class="meta">${!wk?"No free week left to travel this year":now?"Pick a province and set off this week":`Can't leave this week · next possible week ${wk} (you can book ahead)`}</p>
      <div class="rgt-list">${rows}</div>${G.devTravel?this.travelDevHTML(G):""}<div class="mfoot"><button class="btn" data-act="closeModal">Close</button></div>`;},
  /* v1.91.77 (Man): the travel test save (#demo=travel_test) gets a small test panel — swap the camp vehicle, send Kru Daeng on leave, reset */
  travelDevHTML(G){const cur=roadCarKey(G),cars=["none","tuktuk","citycar","pickup","songthaew","minibus","vipvan","evsuv","evvan","limo","tourbus"],away=!roadCoachIn(G);
    return `<div class="rgt-dev"><b>🧪 Travel test mode</b>
      <div><small>Camp vehicle</small>${cars.map(k=>`<button class="btn sm ${k===cur?"gold":""}" data-act="rgtdev" data-v="car:${k}">${esc(roadCarName(k))} · ${Math.max(1,(k==="none"?4:ROAD_CAR[k].seats)-1-(away?0:1))} fighters</button>`).join("")}</div>
      <div><button class="btn sm ${away?"gold":""}" data-act="rgtdev" data-v="coach">${away?"Kru Daeng on leave (tap to bring back)":"Send Kru Daeng on leave"}</button><button class="btn sm" data-act="rgtdev" data-v="reset">Reset: cancel trip · return belts · cash ฿200,000</button><button class="btn sm" data-act="rgtdev" data-v="quick">${G.region.quickPref?"Close":"On"} quick trip</button></div></div>`;}
};

/* round 11: the underground final — state, the region-page card, the line-up and the five bouts */
Object.assign(REGION,{
  /* v1.91.47 (playtest): three years in with a cup, no new challenge letters — the series in progress ends, then the closing ceremony comes (before, a player who always re-accepted at once never reached it) */
  overTime(G){const R=G.region;if(!R||(R.cups||[]).length>=4||rgEd(G)>=2)return false; /* later editions have no time limit */return R.close!=null||((R.cups||[]).length>=1&&gameWeek(G)>=(R.startAbs||0)+156);},
  closeDue(G){const R=G.region,now=gameWeek(G),cups=R.cups||[];if(R.close)return false;
    if(cups.length>=4){const last=R.champ[cups[3]];return now>=((last&&last.wonAbs)||0)+2;}
    /* the tournament runs its course without four cups: three years in, nothing in progress */
    return cups.length>=1&&now>=(R.startAbs||0)+156&&!RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")&&!R.trip;},
  openFinal(G){const R=G.region,now=gameWeek(G);R.close=now;R.final={stage:"prep",abs:now+3,prep:null,tries:0,won:false,intelAbs:now+1};},
  /* v1.91.72 (Man): the black card is Krerk's own challenge — a black letter with a blinking red frame that is also the way into the warehouse */
  blackCard(G){const R=G.region,F=R.final;if(!F)return;const wk=((F.abs-1)%52)+1;
    const ps=R.closeDare?"\n\nP.S. That night you told me to send my fighters to your camp. I am sending five.":R.closeFace?"\n\nP.S. My daughter never asks anyone's name. That night she asked yours.":"";
    addMail(G,{kind:"letter",tone:"black",bk:1,from:"Krerk Naka",title:"Black card",body:`To the manager of Sirichai Camp,

For three years I have hosted the Four Regions Championship, waiting for those four champions. You are the reason they did not come.

So let us find out how long a camp that teaches people to say no can stay standing.

Five vs five · the old drinks-factory warehouse, Khlong Toei Port
From week ${wk} onward
Open rules: throws and locks allowed · no prize, no press, no excuses

The door is open every night. Send your fighters.

— Krerk Naka ${ps}`});},
  letterAct(m){const R=G.region,F=R&&R.final;if(!F)return "";if(m.lg)return `<button class="btn gold big" data-act="rglegopen">✦ Open the legend tier ▸</button>`;if(F.won)return `<p class="meta center">Sirichai Camp won the underground night ${esc(F.score||"")}</p>`;const now=gameWeek(G);
    return now<F.abs?`<p class="meta center">Open from week ${((F.abs-1)%52)+1} · trained ${F.abs-now} weeks</p>`:`<button class="btn red big" data-act="rgfline">🂠 Go to the Khlong Toei warehouse ▸</button>`;},
  finalWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||F.intel||now<F.intelAbs)return;F.intel=1;
    addMail(G,{kind:"letter",tone:"naka",from:"(unsigned)",title:"Naka League team intel",body:"Don't ask who sent this\n\n"+NL_ORDER.map(k=>`${NL[k].name} · ${NL[k].art}\n${NL[k].tip||""}`).join("\n\n")+"\n\nLadda looks for old fight tapes of everyone in your camp. The ones she has never seen fight, she can't read.\n\nP.S. No need to return the tablet."});},
  finalCard(G){const R=G.region,F=R.final;if(!F)return "";const now=gameWeek(G),ready=now>=F.abs,wk=((F.abs-1)%52)+1;
    const team=F.intel?`<div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><small>${NL[k].nlsk.map(s=>esc(s.name)).join(" · ")}</small></div>`).join("")}</div>`:`<p class="meta">You know nothing about the Naka League team yet</p>`;
    if(F.won)return `<section class="px card rg-final won"><h3>Underground fight · Naka League</h3><p>Sirichai Camp won ${F.score||""} · ${F.beatLadda?"Ladda went down too":"Ladda is still unbeaten"}</p></section>`;
    return `<section class="px card rg-final"><h3>🂠 Black card · Naka League underground fight</h3>
      <p class="meta">Five on five · first to three · open rules, throws and locks allowed · no prize ${F.tries?` · attempts so far: ${F.tries} times`:""} · pick each bout's fighter and counter plan on the fight-prep screen</p>
      <h4>Naka League team</h4>${team}
      <div class="mfoot">${ready?`<button class="btn primary" data-act="rgfline">${F.live?"Back into the warehouse ▸":"Go to the underground warehouse ▸"}</button>`:`<span class="meta">Available from week ${wk} · trained ${F.abs-now} more weeks</span>`}</div></section>`;},
  finalPool(G){return roster(G).filter(f=>!f.injury&&!isAway(G,f.id));},
  /* v1.91.176 (Man): with fewer than five fighters able to go, one fighter may take two bouts in the night */
  finalCap(G){return this.finalPool(G).length<NL_ORDER.length?2:1;},
  finalUses(F,id){const L=F.line||{},C=F.cur||{};return NL_ORDER.filter(x=>L[x]===id&&C[x]).length;},
  /* v1.91.72 (Man): a loading screen on the way in — the board opens only when every portrait and sprite of the night is ready (no blank, stuck cards) */
  finalLoad(done){if(typeof document==="undefined"){done();return;}const pool=this.finalPool(G),ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const L=["bg_naka_underground","lada_fight_happy","lada_fight_angry","nl_rosa_win_por",...NL_ORDER.filter(k=>k!=="ladda").map(k=>`nl_${k}_por`),...NL_ORDER.map(k=>G.F["nl_"+k]&&G.F["nl_"+k].sprite?G.F["nl_"+k].sprite+"_sheet":null).filter(Boolean),"nl_ladda_hood_sheet","nl_ladda_sheet","nl_ladda_blood_sheet",...pool.map(f=>`${f.id}_fight_happy`)];
    const el=document.createElement("div");el.className="rg-load";el.innerHTML=`<div class="rgl-in"><b>🂠 Khlong Toei Port</b><p>The camp van turns into the alley of an abandoned warehouse. Its headlights find a steel door left ajar, waiting…</p><div class="rgl-bar"><i></i></div></div>`;document.body.appendChild(el);
    const bar=el.querySelector(".rgl-bar i");let n=0;const one=src=>new Promise(r=>{const im=new Image();im.onload=im.onerror=()=>{n++;bar.style.width=Math.round(n/L.length*100)+"%";r();};im.src=ASSET+src+".webp";});
    const t0=Date.now();Promise.race([Promise.all(L.map(one)),new Promise(r=>setTimeout(r,8000))]).then(()=>setTimeout(()=>{el.remove();done();},Math.max(0,1100-(Date.now()-t0))));},
  vsArt(f,side,win){const A={kati:1,mali:1,rin:1,ploy:1,fah:1,baibua:1,tabtim:1,alicia:1,chaba:1,pailin:1};
    if(f.nl==="ladda")return `<img src="${ASSET}lada_fight_${win?"happy":"angry"}.webp" alt="">`;
    if(f.nl)return `<img src="${ASSET}nl_${f.nl}${f.nl==="rosa"&&win?"_win":""}_por.webp" alt="">`; /* v1.91.23: Man's Naka League portraits */
    if(A[f.id])return `<img src="${ASSET}${f.id}_fight_happy.webp" alt="">`;
    return `<canvas width="128" height="128" data-sprite="${f.id}" data-mode="guard" ${side==="r"?'data-flip="1"':""}></canvas>`;},
  boardHTML(){const R=G.region,F=R.final,pool=this.finalPool(G),L=F.line=F.line||{},K=F.clear=F.clear||{};
    if(!F.live){F.cur={};F.clear={};for(const k in K)delete K[k];} /* v1.91.53 (Man): a lost night starts again from bout 1 (v1.91.24 kept the bouts already won) */
    const C=F.cur=F.cur||{};
    for(const k of NL_ORDER)if(!C[k]&&L[k]&&!pool.some(f=>f.id===L[k]))delete L[k];
    for(const k of NL_ORDER)if(!C[k])delete L[k]; /* v1.91.72 (Man): our side starts empty — each bout's fighter is picked when that bout comes up, then the prep screen locks her in */
    const ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const v=Object.values(C),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,next=NL_ORDER.find(k=>!C[k]);
    if(UI.rgPick&&!C[UI.rgPick]){const k=UI.rgPick,o=G.F["nl_"+k],at=id=>NL_ORDER.find(x=>L[x]===id);
      return `<div class="vsb"><h2>Bout ${NL_ORDER.indexOf(k)+1} · Who fights ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)}</p>
        <div class="vs-pick">${pool.map(f=>{const u=this.finalUses(F,f.id),cap=this.finalCap(G),done=u>=cap;return `<button class="vs-pc" data-act="rgfset" data-v="${k}|${f.id}" ${done?"disabled":""}>
          <span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}${done?(cap>1?" · already fought twice":" · already fought"):u?" · second bout of the night":""}</small></button>`;}).join("")}</div>
        ${this.finalCap(G)>1?`<p class="meta center">The camp has fewer than five fighters · one fighter may take two bouts tonight</p>`:""}
        <div class="mfoot"><button class="btn" data-act="rgfpickx">Back</button></div></div>`;}
    const stamp=(r,sd)=>r?`<i class="vs-st ${sd} ${r==="W"?"w":r==="L"?"l":"d"}">${r==="W"?"WIN":r==="L"?"LOSE":"DRAW"}</i>`:"";
    const rows=NL_ORDER.map((k,i)=>{const o=G.F["nl_"+k],kept=!!(K[k]&&!L[k]),me=kept?G.F[K[k]]:L[k]&&G.F[L[k]],r=C[k],their=r==="W"?"L":r==="L"?"W":r;
      return `<div class="vs-row ${r?"done":""} ${kept?"kept":""} ${k===next?"next":""}">
        <div class="vs-l ${r&&their!=="W"?"lost":""}"><span class="vs-art">${o?this.vsArt(o,"l",their==="W"):""}</span><span class="vs-tx">${(n=>`<b>${esc(n[0])}</b>${n[1]?`<em>${esc(n.slice(1).join(" "))}</em>`:""}`)(NL[k].name.split(" "))}<small>${esc(NL[k].art)}</small></span></div>
        <div class="vs-mid">VS<small>Bout ${i+1}</small></div>
        <button class="vs-r ${r&&r!=="W"?"lost":""}" data-act="rgfslot" data-v="${k}" ${r||k!==next?"disabled":""}>${me?`<span class="vs-tx"><b>${esc(me.name)}</b><small>${kept?"Won last time":`Lv.${me.lvl||1}`}</small></span><span class="vs-art">${this.vsArt(me,"r")}</span>`:`<span class="vs-tx vs-empty"><b>${k===next?"+ Pick fighter":"I'll wait"}</b></span>`}</button>${stamp(their,"vsl")}${stamp(r,"vsr")}</div>`;}).join("");
    const nk=next&&NL_ORDER.indexOf(next)+1,cap=this.finalCap(G),left=pool.filter(f=>this.finalUses(F,f.id)<cap).length;
    return `<div class="vsb"><div class="vs-head"><span class="vs-tl">Naka League</span><b class="vs-sc">${w>0||l>0?`${l} – ${w}`:"VS"}</b><span class="vs-tr">Sirichai Camp</span></div>
      <p class="meta vs-sub">Five vs five · first to three · tap the next bout's blue slot to pick a fighter, then prep the fight · lose and you restart from bout 1 next week · no lasting injuries ${cap>1?" · fewer than five fighters: one fighter may take two bouts":""}</p>
      <div class="vs-rows">${rows}</div>
      <div class="mfoot">${next?`${F.live?"":`<button class="btn" data-act="closeModal">Not yet</button>`}${left?`<button class="btn primary" data-act="rgfslot" data-v="${next}">Pick fighter for bout ${nk} ▸</button>`:`<button class="btn red" data-act="rgfforfeit">No fighters left · forfeit bout ${nk}</button>`}`:`<button class="btn primary" data-act="rgfend">See the result ▸</button>`}</div></div>`;},
  finalNext(){const R=G.region,F=R.final,C=F.cur=F.cur||{},k=NL_ORDER.find(x=>!C[x]);if(!k||!(F.line||{})[k])return;UI.modal=null;UI.rgPick=null;
    F.live=true;this.finalBout(k);},
  finalBout(k){const R=G.region,F=R.final,i=NL_ORDER.indexOf(k),me=G.F[F.line[k]];if(!me)return;
    const keep={injury:me.injury||0,fatigue:me.fatigue||0},o=nlFighter(G,k,me);
    const b={id:`nlf${F.tries||0}_${i}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",gprep:null,region:{nlfinal:k}};
    G.bookings.push(b);save();
    const S=NL_SAY[k],spk=t=>k==="ladda"?{n:"lada",l:"fight",f:"angry",t}:{n:"npc",who:NL[k].name,t},
      after=()=>{const res=F.cur[k],t=S&&(res==="W"?S.lose:res==="L"?S.win:null);const fin=()=>{UI.modal={type:"rgfline"};render();};
        if(t)playScene([spk(t)],fin,{bg:"naka_underground",look:"fight"});else if(k==="ladda"&&res==="L")playScene([{n:"nar",t:"Ladda walks back to her corner without looking back once."}],fin,{bg:"naka_underground",look:"fight"});else fin();};
    const go=()=>openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);me.injury=keep.injury;me.fatigue=keep.fatigue;this.flush(G);
      if(!F.cur[k])F.cur[k]="L";save();after();});
    if(S)playScene([spk(F.tries?S.again:S.first)],go,{bg:"naka_underground",look:"fight"});else go();},
  finalEnd(){const R=G.region,F=R.final,v=Object.values(F.cur||{}),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,beat=(F.cur||{}).ladda==="W";F.tries=(F.tries||0)+1;F.live=false;UI.modal=null;
    if(w>=3){for(const m of G.mail||[])if(m.bk)m.done=true;F.won=true;F.stage="done";F.wonAbs=gameWeek(G);F.score=`${w}–${l}`;F.beatLadda=beat;R.hall=R.hall||[];R.hall.push({k:"naka",season:G.season||1,score:F.score,ladda:beat});
      for(const r of RG_ORDER)rgTouch(G,RG_CID[r]);G.rep+=3;
      AU.startMusic&&AU.startMusic("victory");playScene(rgFinalWin(G,w,l,beat,F.line.ladda),()=>{AU.startMusic&&AU.startMusic("hub");save();render();},{bg:"naka_underground",look:"casual"});return;}
    F.abs=gameWeek(G)+1;F.cur={};F.clear={}; /* v1.91.53 (Man): back next week at the earliest, from bout 1 */
    playScene(rgFinalLose(G,w,l),()=>{save();UI.modal={type:"rgflost"};render();},{bg:"naka_underground",look:"casual"});},
});
/* v1.91.27 (Man): legend mode — optional, after the underground final. Stars: ★ win · ★★ win without going down · ★★★ that, and inside the distance */
const LEG_UP={n:1.05,l:.6}, /* v1.91.38: the final got harder — legend members stay where they were (~29%), legend Ladda stays above the final */LEG_DUST=4;
Object.assign(REGION,{
  legStars(n){return `<span class="rg-stars">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}">★</i>`).join("")}</span>`;},
  legendCard(G){const R=G.region,F=R.final;if(!F||!F.won)return "";const L=R.legend=R.legend||{},tot=NL_ORDER.reduce((a,k)=>a+(L[k]||0),0),used=R.legWk===gameWeek(G);
    return `<section class="px card rg-final rg-leg ${tot>=15?"won":""}"><h3>✦ Legend · Naka League <small class="meta">${tot}/15 stars</small></h3>
      <p class="meta">Optional · tougher than the underground final · one bout a week · injuries and fatigue count · ★ win · ★★ win without going down · ★★★ no knockdown and inside the distance · each new star gives stardust ${LEG_DUST}</p>
      <div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><span>${this.legStars(L[k]||0)} <button class="btn sm" data-act="rglegpick" data-v="${k}" ${used?"disabled":""}>Challenge ▸</button></span></div>`).join("")}</div>
      ${used?`<p class="meta">Already fought a legend bout this week</p>`:""}</section>`;},
  /* v1.91.78 (Man): the legend tier opens from a Naka letter (the regional tab is only the ranking board now) */
  legendMail(G){const R=G.region,F=R&&R.final;if(!F||!F.won||R.legMail)return;R.legMail=1;
    addMail(G,{kind:"letter",tone:"naka",lg:1,from:"Naka League",title:"Legend tier · Naka League",body:"To Sirichai Camp,\n\nThe Naka League team is training again, and they are stronger than that night.\nWhoever wants another go can come once a week. Open rules, five rounds.\n\nCollect all fifteen stars and we will admit your camp is the real thing."});},
  legPickHTML(k){const R=G.region,pool=this.finalPool(G),L=R.legend||{};
    return `<h2>Legend · ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)} · now ${this.legStars(L[k]||0)} · 5 rounds, open rules</p>
      <div class="vs-pick">${pool.map(f=>`<button class="vs-pc" data-act="rglego" data-v="${k}|${f.id}"><span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}</small></button>`).join("")}</div>
      ${pool.length?"":`<p class="redt">Nobody is fit to fight</p>`}<div class="mfoot"><button class="btn" data-act="closeModal">Not yet</button></div>`;},
  legGo(k,id){const R=G.region,me=G.F[id];if(!me||R.legWk===gameWeek(G))return;UI.modal=null;R.legWk=gameWeek(G);
    const o=nlFighter(G,k,me,0,0,true),b={id:`nlleg_${k}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",region:{nlleg:k}};
    G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);this.flush(G);save();render();});},
  legResult(G,k,p){const R=G.region,L=R.legend=R.legend||{},st=p.res==="W"?1+(p.kdA?0:1)+(!p.kdA&&p.stop?1:0):0,was=L[k]||0;
    if(st>was){L[k]=st;G.dust=(G.dust||0)+(st-was)*LEG_DUST;toast&&toast(`Legend · ${NL[k].name} ${"★".repeat(st)} · stardust +${(st-was)*LEG_DUST}`);}
    const tot=NL_ORDER.reduce((a,x)=>a+(L[x]||0),0);if(tot>=15&&!R.legAll){R.legAll=gameWeek(G);G.rep+=2;R.hall=R.hall||[];R.hall.push({k:"legend",season:G.season||1});
      G.log=G.log||[];G.log.push("Naka League legend mode: all 15 stars · fame +2");}},
});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rglegpick:d=>{if(!G.region||!G.region.final||!G.region.final.won)return;UI.modal={type:"rgleg",k:d.v};render();},
  rglego:d=>{const [k,id]=d.v.split("|");REGION.legGo(k,id);},
  rgfprep:d=>{const F=G.region&&G.region.final;if(!F||F.won)return;F.prep=d.v;save();render();},
  rgfline:()=>{const F=G.region&&G.region.final;if(!F||F.won||gameWeek(G)<F.abs)return;UI.rgPick=null;UI.modal=null;render();REGION.finalLoad(()=>{const open=()=>{UI.modal={type:"rgfline"};render();};if(F.live){open();return;}
    F.live=true;save();AU.startMusic&&AU.startMusic("hub");playScene(rgFinalIntro(G),open,{bg:"naka_underground",look:"casual"});});},
  rgfswap:()=>{const U=UI.fight;if(!U||!U.b||!U.b.region||!U.b.region.nlfinal||U.stage!=="pre")return;const k=U.b.region.nlfinal,F=G.region.final;G.bookings=G.bookings.filter(x=>x.id!==U.b.id);if(F.line)delete F.line[k];UI.fight=null;UI.rgPick=k;UI.modal={type:"rgfline"};save();render();},
  rgfp:d=>{const U=UI.fight;if(U&&U.b&&U.b.region&&U.b.region.nlfinal){U.b.gprep=d.v;render();}},
  rgfslot:d=>{const F=G.region.final;if((F.cur||{})[d.v])return;UI.rgPick=d.v;render();},
  rgfpickx:()=>{UI.rgPick=null;render();},
  rgfset:d=>{const [k,id]=d.v.split("|"),F=G.region.final,L=F.line=F.line||{},C=F.cur||{};if(C[k])return;
    if(REGION.finalUses(F,id)>=REGION.finalCap(G))return;L[k]=id;UI.rgPick=null;save();REGION.finalNext();},
  rgfforfeit:()=>{const F=G.region.final,k=NL_ORDER.find(x=>!(F.cur||{})[x]);if(!k)return;F.cur=F.cur||{};F.cur[k]="L";F.live=true;save();render();},
  rgfgo:()=>REGION.finalNext(),
  rgfend:()=>{const F=G.region.final;if(NL_ORDER.every(k=>(F.cur||{})[k]))REGION.finalEnd();},
  rgfagain:()=>{const F=G.region.final;if(gameWeek(G)<F.abs){UI.modal=null;render();return;}F.cur={};F.live=false;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfhome:()=>{const F=G.region.final;F.abs=gameWeek(G)+1;UI.modal=null;addMail(G,{kind:"letter",tone:"black",bk:1,from:"Krerk Naka",title:"A new black card",body:"The door is still open, manager.\nRest up, then come back.\n\n— Krerk Naka"});save();render();},
});
if(typeof XMODAL!=="undefined"){XMODAL.rgfline=()=>({body:REGION.boardHTML(),foot:false});XMODAL.rgleg=m=>({body:REGION.legPickHTML(m.k),foot:false});
  XMODAL.rgflost=()=>({body:`<h2>Lost the underground fight</h2><p>Next time all five bouts start again from bout 1 · go back and train, then set a new line-up from next week, or wait until you're ready</p><div class="mfoot"><button class="btn primary" data-act="rgfhome">Back to training</button></div>`,foot:false});}
if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgtravel=()=>({body:REGION.travelHTML(G),foot:false});XMODAL.rgfin=m=>({body:REGION.finHTML(m.r),foot:false});XMODAL.rglegend=()=>({body:`${REGION.legendCard(G)}<div class="mfoot"><button class="btn" data-act="closeModal">Close</button></div>`,foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.rgParty=null;UI.rgNow=false;UI.rgStep=1;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfinopen:d=>{UI.modal={type:"rgfin",r:d.v};render();},
  rglegopen:()=>{if(!G.region||!G.region.final||!G.region.final.won)return;REGION.css();UI.modal={type:"rglegend"};render();},
  rgtravel:()=>{if(!REGION.travelOk(G))return;UI.modal={type:"rgtravel"};render();},
  rgtravelto:d=>{UI.rgFid=null;UI.rgParty=null;UI.rgNow=true;UI.rgStep=1;UI.modal={type:"rgplan",dest:d.v};render();},
  rgparty:d=>{const P=UI.rgParty=UI.rgParty||[],i=P.indexOf(d.v);if(i>=0)P.splice(i,1);else if(P.length<roadSeats(G))P.push(d.v);render();},
  rgstep:d=>{UI.rgStep=+d.v;render();},
  rgcoach:()=>{UI.rgNoCoach=!UI.rgNoCoach;if(UI.rgParty)UI.rgParty=UI.rgParty.slice(0,roadSeats(G));render();},
  rgtdev:d=>{if(!G.devTravel)return;const v=d.v,R=G.region;
    if(v.startsWith("car:")){const k=v.slice(4);G.decor=G.decor||{};G.decor.vehicle=k;G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks.vehicle=[...new Set([...(G.decorUnlocks.vehicle||[]),k])];}
    else if(v==="coach"){G.coachAwayAbs=roadCoachIn(G)?gameWeek(G)+4:0;}
    else if(v==="quick"){R.quickPref=!R.quickPref;}
    else if(v==="reset"){REGION.cancel(G);R.nextTripAbs=0;for(const r of RG_ORDER){const B=R.belts[r]||{};RG[r].prov.slice(2).forEach(p=>delete B[p]);R.belts[r]=B;}G.cash=Math.max(G.cash,200000);G.bookings=G.bookings.filter(b=>b.week!==G.week||!(G.F[b.a]&&G.F[b.a].camp==="player"));}
    save();render();},
  rggonow:d=>{const r=REGION.book(G,d.v,UI.rgFid,true);if(!r.ok){toast(r.why);return;}UI.modal=null;UI.rgParty=null;UI.rgNow=false;AU.sfx&&AU.sfx("level");save();endWeek();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rgclosetest:()=>{const R=G.region,first=R&&!R.final;if(first)REGION.openFinal(G);REGION.playClose(()=>{if(first)REGION.blackCard(G);save();render();});}, /* v1.91.85: the test button also deals the black card (Man watched the closing from here and never got one) */
  rgquick:()=>{G.region.quickPref=!G.region.quickPref;save();render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;UI.rgParty=null;AU.sfx&&AU.sfx("level");toast(`Trip booked for week ${r.wk} · travel cost paid ${fmt(r.cost)}`);save();render();},
  rgvisit:d=>{const r=d.v,c=G.region.champ[r],cid=REGION.champId[r];if(!c||c.visit!=="due")return;
    playScene(RG_VISIT[r](G),()=>DUEL.open(r,false,res=>{if(!res){render();return;}c.visit="done";const T=DUEL_TALK[r];
      playScene([{n:cid,f:res.w>=2?"flustered":"happy",l:"casual",t:res.w>=2?T.win:T.lose},{n:"nar",t:`${RG[r].champ} heads home that evening · bout 2 is at the regional ring`}],()=>{const g=typeof cardCheck==="function"?cardCheck(G):[];if(g.length){G.cardPend=(G.cardPend||[]).concat(g);UI.modal={type:"cardnew"};}save();render();},{bg:"camp",look:"casual"});}),{bg:"camp",look:"casual"});},
  rgduel:d=>{DUEL.open(d.v,true,()=>render());},
  rgser:d=>{UI.rgFid=null;UI.modal={type:"rgser",r:d.v};render();},
  rgsfid:d=>{UI.rgFid=d.v;render();},
  rgsgo:d=>{const x=REGION.startSeries(G,d.v,UI.rgFid);if(!x.ok){toast(x.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`Challenge accepted · bout 1 in week ${x.s.wk}${x.s.season!==(G.season||1)?" next year":""}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("Trip cancelled. The travel money is refunded.");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();},
  rgchat:d=>{const f=G.F[d.v];if(!f)return;f.met=true;rgTouch(G,d.v);chatOpen(d.v);},
  rggala:d=>{if(REGION_LIVE)return;const R=G.region;if(d.v==="c1"){const r=R.cups[0];playScene(rgCup1(G,r),()=>{R.c1=R.c1||"seen";save();render();},{bg:"camp",look:"casual"});return;}
    playScene(rgGala(G),()=>{R.gala=1;save();render();},{bg:"gala",look:"casual"});}});
/* ---------- v1.91.28 round 12 (Man): after the underground final the regional champions ask to join, one at a time ----------
   hidden bar: closeness (R.meet) ≥ RG_JOIN_MIN · offers come in order of closeness, 4 weeks apart · accepting needs a free room (5 + dorm level) and the signing fee
   she arrives the next week (leaving her old camp + arriving at Sirichai) at ~70% of her champion level/stats, with skill points for her lineage's tree (the partner girl's)
   romance (Man): one-love or two-timing only — never the harem team. Kept on its own track (R.lov / R.ex), shown through relState */
const rgBondOf=m=>Math.min(70,Math.round((m||0)*3));
const RG0=Object.fromEntries(Object.entries(RG).map(([r,C])=>[r,{name:C.name,champ:C.champ,nick:C.nick}]));
const RG_HOME_LINE={baibua:2,tabtim:1,alicia:2,chaba:0}; /* Baibua counters (Tha Sao) · Tabtim keeps range (Korat) · Alicia fights inside (Lopburi) · Chaba presses (Chaiya) */
const RG_JOIN_MIN=12,RG_JOIN_GAP=4,RG_JOIN_FEE=350000,RG_JOIN_WAGE=5000; /* v1.91.30 (Man): a regional champion costs a fortune, and is worth it */
/* v1.91.30 (Man): every champion brings something the camp wants — her ring perk stays, plus a camp-wide gift */
/* v1.91.43: each joined champion's own Lv.42 legend skills — old id (her partner's) → [new id, name, desc, signature bonus] */
const RG_CAP={
 baibua:{kati_0a5:["baibua_0a5","Lotus Blooming in the Ring","Lv.42 · Legend · a kick that opens like a lotus petal · kick power +20%, kick accuracy +5%, kick points +8% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_0b5:["baibua_0b5","The Bua Tasao Kicking Scroll","Lv.42 · Legend · every kick from the scroll Camp Bua handed down · kick accuracy +5%, kick points +12%, counters +3% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_1a5:["baibua_1a5","Lotus-Petal Sky-Flip Elbow","Lv.42 · Legend · the spinning elbow all of Chiang Mai knows · elbow power +20%, punch power +8%, elbow accuracy +4% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_1b5:["baibua_1b5","Doi Suthep Rain Fists","Lv.42 · Legend · fists as thick as mountain rain · punch power +18%, punch accuracy +4%, punch points +8% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_2a5:["baibua_2a5","The Lotus Never Sinks","Lv.42 · Legend · however often she falls, she rises above the water · +6% accuracy at low health, recovery +15%, morale effect +2% · Baibua's mark: counter +1%",r=>({ctr:.01*r})],kati_2b5:["baibua_2b5","Lanna Mist Veil","Lv.42 · Legend · take the blow, answer from inside the mist · evade +3%, counters +5%, counter-punch power +15% · Baibua's mark: counter +1%",r=>({ctr:.01*r})]},
 tabtim:{ploy_0a5:["tabtim_0a5","Phimai Lam Sing Fists","Lv.42 · Legend · heavy fists on the beat of the phin · punch power +22%, punch accuracy +3%, punch points +6% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_0b5:["tabtim_0b5","Smile First, Win First","Lv.42 · Legend · she smiles at you first, then she wins · punch accuracy +5%, punch power +14%, counters +3% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_1a5:["tabtim_1a5","Red Ruby in the Sky","Lv.42 · Legend · a jumping kick that falls from the sky · kick power +20%, kick accuracy +4%, kick points +8% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_1b5:["tabtim_1b5","Stone Castle Neck Lock","Lv.42 · Legend · a lock as solid as the Phimai stones · knee power +20%, clinch defense +0.6, knee accuracy +3% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_2a5:["tabtim_2a5","Wall of Laughter","Lv.42 · Legend · the more she is hit, the more she laughs, and the harder she answers · evade +3%, counters +5%, counter-punch power +15% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})],ploy_2b5:["tabtim_2b5","The Khaen Keeps the Game","Lv.42 · Legend · she sets the rhythm of the whole fight like a khaen player · corner orders +45%, base accuracy +1.5%, counters +4% · Tabtim's mark: kick power +2%",r=>({dmg:{kick:.02*r}})]},
 alicia:{rin_0a5:["alicia_0a5","Queen of the Counter","Lv.42 · Legend · an elegant counter, right on camera · counters +6%, counter-punch power +22%, punch accuracy +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_0b5:["alicia_0b5","Shadow on the Live Stream","Lv.42 · Legend · so fast the camera only catches her shadow · evade +3%, counters +5%, counter-punch power +12% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_1a5:["alicia_1a5","The Pre-Fight Speech","Lv.42 · Legend · she wins at the interview before the bell · corner orders +50%, base accuracy +1.8%, counters +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_1b5:["alicia_1b5","The Princess's Board","Lv.42 · Legend · the whole ring is her game board · corner orders +35%, counters +5%, counter-punch power +10% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_2a5:["alicia_2a5","Ayutthaya Palace Gate","Lv.42 · Legend · a push kick no one gets past into the palace · kick accuracy +5%, kick points +12%, evade +2% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})],rin_2b5:["alicia_2b5","Riverside Princess Dance","Lv.42 · Legend · footwork that circles you like a dance · evade +3.5%, stamina use -3%, kick accuracy +3% · Alicia's mark: punch accuracy +1%",r=>({hit:{punch:.01*r}})]},
 chaba:{mali_0a5:["chaba_0a5","Andaman Wave Elbow","Lv.42 · Legend · elbows that come in waves · elbow power +20%, knee power +10%, elbow accuracy +3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_0b5:["chaba_0b5","Pulled Under the Sea","Lv.42 · Legend · two pulls on the neck, like an undertow · knee power +16%, elbow power +12%, knee accuracy +3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_1a5:["chaba_1a5","Red Hibiscus Storm","Lv.42 · Legend · strike after strike until you can't set your feet · kick power +16%, kick accuracy +5%, evade +2% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_1b5:["chaba_1b5","Longtail Boat Through the Waves","Lv.42 · Legend · she slips away with the waves · recovery +20%, evade +2.5%, stamina use -3% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_2a5:["chaba_2a5","Phang Nga Karst","Lv.42 · Legend · she stands as still as a rock island in the sea · clinch defense +1, evade +3%, recovery +10% · Chaba's mark: evasion +1%",r=>({evade:.01*r})],mali_2b5:["chaba_2b5","The Hibiscus Blooms Last Round","Lv.42 · Legend · the later the fight, the brighter she blooms · +5% accuracy at low health, counters +4%, morale effect +2% · Chaba's mark: evasion +1%",r=>({evade:.01*r})]}};
const rgFxAdd=(a,b)=>{const o={...a};for(const k in b){if(b[k]&&typeof b[k]==="object"){o[k]={...(a[k]||{})};for(const w in b[k])o[k][w]=(o[k][w]||0)+b[k][w];}else o[k]=(o[k]||0)+b[k];}return o;};
const RG_TRAIT={
 baibua:{name:"Tha Sao Elbow Teacher",desc:"Tha Sao counter elbows (counter +5%, elbow +12%) · teaches elbows to the camp: fighters whose elbow/counter is under 17 improve a little each week"},
 tabtim:{name:"Isan Laughter",desc:"Accurate kicks and quick evasion · wherever she is, it's lively: every fighter in camp +2 morale each week"},
 alicia:{name:"Live Star",desc:"Heavy hands and inside defence · streams training with the camp: ad income every week (grows with camp fame) and fame slowly rises"},
 chaba:{name:"Silent Fixer",desc:"Quick evasion and fast recovery · looks after the injured like she looks after her brother: injured fighters heal one extra week each week"}};
const RG_JOIN={
 baibua:{letter:"Manager\n\nI've been thinking since the night of the cup. I want to train at Sirichai Camp. I want to fight beside Kati, not against her\n\nMy father says the Tha Sao teachers taught us to go where our fists get better, not to stay in one place forever\n\nIf the camp has a free room, I'd like to apply\n— Baibua",
  leave:[{n:"nar",t:"Moving day. The morning mist hasn't lifted. Baibua bows to her teacher at the wooden shrine in front of her old camp"},{n:"baibua",f:"sad",l:"casual",t:"Teacher, I'm going to another camp… I'm not leaving Tha Sao behind. I'm taking it with me"},
   {n:"nar",t:"Her coach ties a white thread around her wrist, then pats her back lightly twice"},{n:"baibua",f:"happy",l:"casual",t:"My father sent sai ua for the whole camp. He says if it tastes good, take good care of his daughter"}],
  arrive:[{n:"nar",t:"Baibua stands under the Sirichai Camp sign with two bags and one box of sai ua"},{n:"baibua",f:"flustered",l:"casual",t:"Manager… please take care of me. I won't let you down"}],
  pair:"Pi Baibua! Your room's right next to mine. I already made the bed for you!",pairBack:"…Thank you, Kati. Two Tha Sao fighters in one camp. Our teacher must be smiling",
  hang:[
   [{n:"nar",t:"Baibua takes you to the morning market. She picks vegetables as carefully as she picks opponents"},{n:"baibua",f:"happy",l:"casual",t:"Hang lay curry needs pork belly… can you eat spicy food, manager?",choice:[
     {t:"\"Sure, as spicy as you like\"",b:4,then:[{n:"baibua",f:"flustered",l:"casual",t:"Then I'll add more chillies… but if you cry, don't blame me"}]},
     {t:"\"Make it the way your family eats it\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…The way my father likes it. I haven't cooked for anyone in a long time"}]}]}],
   [{n:"nar",t:"Evening. Baibua sits embroidering teen chok patterns outside her room. The needle is smaller than you'd think"},{n:"baibua",f:"flustered",l:"casual",t:"It's for Kati… no, for the whole camp. This one's the manager's — oh, no, it isn't finished yet",choice:[
     {t:"\"I can wait. No rush\"",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"…Then I'll embroider slowly"}]},
     {t:"\"Can you teach me to embroider?\"",b:4,then:[{n:"nar",t:"Half an hour later your cloth has one lotus on it. It looks like a cabbage"},{n:"baibua",f:"happy",l:"casual",t:"Pretty… pretty like a cabbage"}]}]}],
   [{n:"nar",t:"Before dawn, Baibua drills spinning elbows on the bag. She doesn't hear you come"},{n:"baibua",f:"surprised",l:"fight",t:"Eh! Manager… have you been watching long?",choice:[
     {t:"\"That's the most beautiful elbow I've ever seen\"",b:5,then:[{n:"baibua",f:"flustered",l:"fight",t:"…Don't say that while I'm throwing an elbow. It'll miss"}]},
     {t:"Hold the bag so she can keep training",b:4,then:[{n:"nar",t:"The next elbow is a little softer. She says she was afraid of hurting you"}]}]}]],
  love:[{n:"nar",t:"This Saturday Baibua takes you to the walking street. Her hand finds yours on its own in the crowd"},{n:"baibua",f:"flustered",l:"casual",t:"If we get separated… hold on like this"},{n:"baibua",f:"happy",l:"casual",t:"I'm not scared of getting lost"}],
  conf:G=>[{n:"nar",t:"Late at night Baibua knocks on your door, holding the same teen chok shawl from Doi Suthep"},{n:"baibua",f:"flustered",l:"casual",t:"I wrote it in the contract letter, but I erased it… because I wanted to say it myself"},{n:"baibua",f:"flustered",l:"casual",t:G.player.gender==="f"?"I love you… you can answer whenever you like":"I love you… you can answer whenever you like"}],
  yes:G=>G.player.gender==="f"?"…Yes. I'll call you that every day now. No more saying it in secret":"…Yes. I'll call you that every day now. No more saying it in secret",no:"It's fine. I'm still at this camp, still see your face every day. That's enough",bye:"…Yes. I understand. I'll still fight my best for this camp, same as always"},
 tabtim:{letter:"Manager\n\nA champion of Isan like me doesn't lose easily, but losing to Sirichai Camp was something else. I want to know how this camp trains\n\nSo I'm moving there to train with you! Ploy, don't worry, I won't take your spot. I'll only take your sticky rice\n\nIf there's a free room, write back\n— Tabtim",
  leave:[{n:"nar",t:"Her last night at the old camp. All the juniors sit in a circle for a farewell dinner"},{n:"tabtim",f:"happy",l:"casual",t:"No crying, everyone! I'm just going to train, not going anywhere!"},
   {n:"nar",t:"Her coach hands her a big basket of sticky rice. Tabtim laughs loudly, but her eyes are red"},{n:"tabtim",f:"sad",l:"casual",t:"…My coach taught me since I couldn't even kick a banana tree down. Take good care of me, manager"}],
  arrive:[{n:"nar",t:"Tabtim steps out of the van with three bags of grilled chicken and a jar of pla ra bong"},{n:"tabtim",f:"happy",l:"casual",t:"Manager! From now on Tabtim belongs to Sirichai Camp …as a fighter. Don't overthink it!"}],
  pair:"Your room is across from mine. If it's loud after ten, I'll knock on the wall",pairBack:"Haha, sure, Ploy! Knock and I'll knock back in a long-drum rhythm",
  hang:[
   [{n:"nar",t:"Tabtim drags you to a som tam stall and orders for the whole table without opening the menu"},{n:"tabtim",f:"happy",l:"casual",t:"Som tam with crab and pla ra, ten chillies! How many for you, manager?",choice:[
     {t:"\"Ten, same as you\"",b:5,then:[{n:"nar",t:"Ten minutes later you're on your third glass of ice water"},{n:"tabtim",f:"happy",l:"casual",t:"Haha, you've got guts! I like people with guts …I mean eaters!"}]},
     {t:"\"Just one\"",b:3,then:[{n:"tabtim",f:"pout",l:"casual",t:"One chilli is just plain rice! Here, have a bite of mine"}]}]}],
   [{n:"nar",t:"Tabtim plays mor lam on her phone and dances alone in the middle of the camp yard"},{n:"tabtim",f:"happy",l:"casual",t:"Come dance, manager! These are the feet I kick with",choice:[
     {t:"Get up and dance with her",b:5,then:[{n:"nar",t:"The whole camp comes out to watch. Tabtim spins you three times by the hand and laughs until she sits on the ground"}]},
     {t:"Clap along to the beat",b:4,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…You're staring a lot. I get shy too, you know"}]}]}],
   [{n:"nar",t:"After training, Tabtim sits unusually quiet, looking at a photo of her brother in his student uniform"},{n:"tabtim",f:"sad",l:"casual",t:"My little brother… he got into law school. I fight to see him through",choice:[
     {t:"\"He's lucky to have a sister like you\"",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Don't say that. I cry easily. I'm not joking"}]},
     {t:"\"This camp can help you put him through school\"",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"This camp's so kind… I'll fight harder than before"}]}]}]],
  love:[{n:"nar",t:"The Mekong at dusk. Tabtim is quiet for longer than ever"},{n:"tabtim",f:"flustered",l:"casual",t:"I used to think happiness was winning… now it's sitting here with you"},{n:"tabtim",f:"happy",l:"casual",t:"Don't tell anyone I can talk sweet!"}],
  conf:()=>[{n:"nar",t:"Tabtim pulls you out behind the camp, where the mor lam from her room can't be heard"},{n:"tabtim",f:"flustered",l:"casual",t:"Manager! I'm saying this once. I'm not joking like before"},{n:"tabtim",f:"flustered",l:"casual",t:"I really, really like you …answer now. I'm not scared of the answer"}],
  yes:()=>"…Really?! Haha, I'm telling the whole camp! …No, no, too embarrassing. Later",no:"It's fine. I'm still at this camp. We still eat sticky rice together every meal, same as before",bye:"…I get it. I'm not angry. I just need to go kick the bag hard for a while"},
 alicia:{letter:"To the manager\n\nMy contract with Vector is over. I'm not renewing, and I won't sign anything with the word \"forever\" in it, like I said\n\nRin says Sirichai Camp's contract is only two pages. You can read it in five minutes. I'm interested. That doesn't mean I want to come because of you. It's because the contract is short\n\nIf there's a room, send the contract\n— Alicia",
  leave:[{n:"nar",t:"Her last day at Vector camp. The sponsor team asks Alicia for a farewell live stream"},{n:"alicia",f:"pout",l:"casual",t:"No. Today isn't content"},
   {n:"nar",t:"She leaves her pass on the desk and takes off the sponsor's wristband, keeping only the old hand wraps she bought herself at fifteen"},{n:"alicia",f:"happy",l:"casual",t:"I feel so light… don't tell anyone about this"}],
  arrive:[{n:"nar",t:"Alicia arrives with five suitcases: four of clothes, one of royal Thai sweets for the whole camp"},{n:"alicia",f:"flustered",l:"casual",t:"I didn't buy them to please anyone. My hand just picked them up"}],
  pair:"I've made a dishwashing roster. Miss Alicia gets Wednesdays and Saturdays",pairBack:"Fine. …Which dish soap do I use?",
  hang:[
   [{n:"nar",t:"Alicia asks you to hold the camera, but once it's on she turns the lens on you"},{n:"alicia",f:"happy",l:"casual",t:"Today I'm filming you. The content's called 'The Manager Who Won't Smile'",choice:[
     {t:"Smile for the camera",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…You don't have to smile that much. This file isn't getting posted. I'm keeping it to watch. I mean, to review"}]},
     {t:"\"Film yourself instead. You're prettier\"",b:4,then:[{n:"alicia",f:"pout",l:"casual",t:"I know. You don't have to say it. …But you can say it again"}]}]}],
   [{n:"nar",t:"Alicia is reading comments on her phone. Her finger stops on one for too long"},{n:"alicia",f:"sad",l:"casual",t:"'Famous for her face' …people still type it, even after the cup",choice:[
     {t:"\"The cup didn't come from your looks\"",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"…I know. But when you say it, it sounds truer than when I say it"}]},
     {t:"Turn her screen off",b:4,then:[{n:"alicia",f:"happy",l:"casual",t:"Rude. …Thank you"}]}]}],
   [{n:"nar",t:"Rin and Alicia go over the camp's fight contracts together. Two red pens"},{n:"alicia",f:"happy",l:"casual",t:"Clause 6, the purse is too low. Manager, can you negotiate?",choice:[
     {t:"\"Teach me\"",b:5,then:[{n:"alicia",f:"happy",l:"casual",t:"Lesson one: don't smile before the other side names a number. …You're smiling right now. Fail"}]},
     {t:"\"I've got you and Rin\"",b:4,then:[{n:"alicia",f:"flustered",l:"casual",t:"Taking advantage, obviously. …Fine, I'll do it"}]}]}]],
  love:[{n:"nar",t:"Alicia takes you on the Ayutthaya boat again. Her phone stays switched off in her bag"},{n:"alicia",f:"flustered",l:"casual",t:"Last time I said tonight isn't content… this time too, and next time as well"},{n:"alicia",f:"happy",l:"casual",t:"Don't get used to it. …Kidding. Get used to it"}],
  conf:()=>[{n:"nar",t:"Alicia closes the training room door and turns off the spotlights, leaving only the small bulb above the bag"},{n:"alicia",f:"flustered",l:"casual",t:"Listen. I'm saying this once. No retakes"},{n:"alicia",f:"flustered",l:"casual",t:"I like you. Not as a manager. Answer straight. I don't like contracts I can't read"}],
  yes:()=>"…Deal. This contract never expires, but it doesn't say forever either. It renews every day",no:"OK. I respect the answer. …Not crying. My eyes are just dry",bye:"…I understand. I don't sign anything the other side doesn't want to sign anyway"},
 chaba:{letter:"Manager\n\nMy brother says go\nHe says he can live in Phuket alone, he can look after himself\n\nMali says the room next to hers is still free\n\nIf there's no room, that's fine\n— Chaba",
  leave:[{n:"nar",t:"Phuket pier in the morning. Chaba's brother wheels himself all the way to the gate of the Chaiya Andaman camp to see her off"},{n:"nar",t:"He hands her a seashell. \"Give this to Mali. Say it's from me\""},
   {n:"chaba",f:"sad",l:"casual",t:"…I'll come home every Chak Phra. Never miss one"},{n:"nar",t:"Chaba gets in the car without looking back, and only checks the mirror after the first bend"}],
  arrive:[{n:"nar",t:"Chaba arrives with one backpack and a bag of khanom la"},{n:"chaba",f:"happy",l:"casual",t:"Manager. Take care of me"}],
  pair:"Pi Chaba! Your room's next to Mali's. Mali put on hibiscus sheets for you!",pairBack:"…Didn't have to. (That night the whole camp sees her asleep hugging a pillow with the same print)",
  hang:[
   [{n:"nar",t:"Chaba is fixing the fence behind the camp again, though the fence isn't broken"},{n:"chaba",f:"happy",l:"casual",t:"Pass the hammer",choice:[
     {t:"Pass the hammer and hold the boards",b:5,then:[{n:"nar",t:"Two hours pass with barely a word. The fence is much sturdier than before"},{n:"chaba",f:"happy",l:"casual",t:"…Good, today"}]},
     {t:"\"The fence isn't broken, you know\"",b:3,then:[{n:"chaba",f:"pout",l:"casual",t:"I know. I want to hammer"}]}]}],
   [{n:"nar",t:"A stray cat is asleep on Chaba's lap. She hasn't moved for forty minutes"},{n:"chaba",f:"flustered",l:"casual",t:"…Don't like it. It just came",choice:[
     {t:"Sit down beside her and say nothing",b:5,then:[{n:"nar",t:"The cat moves to your lap. Chaba looks at it like she's been betrayed, then laughs softly"}]},
     {t:"\"Want to give it a name?\"",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…Khai Khem. (Salted Egg — Mali is happy all day when she hears it)"}]}]}],
   [{n:"nar",t:"Sunday evening, Chaba is on a video call with her brother, and hands you the phone mid-call"},{n:"chaba",f:"flustered",l:"casual",t:"My brother wants to talk to the manager",choice:[
     {t:"\"You can leave your sister with me\"",b:5,then:[{n:"nar",t:"Her brother laughs. Chaba grabs the phone back and hangs up at once, red all the way down her neck"}]},
     {t:"Tell him how hard Chaba trains",b:4,then:[{n:"chaba",f:"happy",l:"casual",t:"…You don't have to tell him everything"}]}]}]],
  love:[{n:"nar",t:"Chaba asks you out to the sea at night. She rides the sidecar bike over herself, even though you have a car"},{n:"chaba",f:"flustered",l:"casual",t:"You ride first, same as always"},{n:"chaba",f:"happy",l:"casual",t:"…Can you stay one more day? Same question as before"}],
  conf:()=>[{n:"nar",t:"Chaba knocks three times, then stands so still for so long that you open the door yourself"},{n:"chaba",f:"flustered",l:"casual",t:"Manager"},{n:"nar",t:"The wind passes once"},{n:"chaba",f:"flustered",l:"casual",t:"…Like you. That's all. Can't talk long"}],
  yes:()=>"…Mm. (She squeezes your hand tight, then just walks back to her room)",no:"…It's fine. We can still fix fences together",bye:"…Got it. No need to say more"}};
/* v1.91.30: champions who move in get a profile, gift tastes and gift lines like the main cast */
/* ---------- v1.91.134 (Man): champions who moved in get the heroines' rhythm ----------
   time together: her first three + two more new places, then short visits · heart scenes at bond 40/55/70 (before she confesses at 75)
   · as lovers: scenes after 2, 8 and 16 weeks. Heart and love scenes play at camp, one a week, through the regional week scene. */
const RG_HANG2={},RG_AGAIN={},RG_HEART={},RG_LOVE2={},RG_HEART_AT=[40,55,70],RG_LOVE_AT=[2,8,16];
function rgRelDue(G){const R=G.region;if(!R||!R.joined)return null;const now=gameWeek(G);R.hs=R.hs||{};R.ls=R.ls||{};
  for(const cid of Object.keys(R.joined)){const f=G.F[cid];if(!f||f.camp!=="player"||(typeof isAway==="function"&&isAway(G,cid)))continue;
    const hs=R.hs[cid]=R.hs[cid]||{};if(RG_HEART[cid])for(const th of RG_HEART_AT)if(!hs[th]&&(f.bond||0)>=th&&RG_HEART[cid][th]){hs[th]=now;return {cid,steps:RG_HEART[cid][th](G)};}
    if(R.lov&&R.lov[cid]!=null&&RG_PAIRSAY[cid]){R.lr=R.lr||{};const r=RG_ORDER.find(x=>RG_CID0[x]===cid),pid=r&&RG_CH[r]&&RG_CH[r].pair,pf=pid&&G.F[pid],solo=!(typeof partners==="function"&&partners(G).length)&&!Object.keys(R.lov).some(k=>k!==cid&&G.F[k]);
      if(!R.lr[cid]&&now-R.lov[cid]>=1&&solo&&pf&&pf.camp==="player"&&!(typeof isAway==="function"&&isAway(G,pid))){R.lr[cid]=now;return {cid,steps:RG_PAIRSAY[cid]};}}
    if(R.lov&&R.lov[cid]!=null&&RG_LOVE2[cid]){const ls=R.ls[cid]=R.ls[cid]||{};for(const w of RG_LOVE_AT)if(!ls[w]&&now-R.lov[cid]>=w){ls[w]=now;return {cid,steps:RG_LOVE2[cid][w](G)};}}}
  return null;}
/* ---- ใบบัว ---- */
RG_HANG2.baibua=[
 [{n:"nar",t:"Sunday afternoon, Baibua borrows a bamboo raft from the old man next to the camp and waits at the Ping River landing, pole in hand."},
  {n:"baibua",f:"happy",l:"casual",t:"Home has a lotus pond, but no river... I've always wanted to pole a raft. You can just sit."},
  {n:"nar",t:"The raft spins half a turn. Baibua laughs so hard she nearly drops the pole.",choice:[
   {t:"Pole on the other side",b:5,then:[{n:"baibua",f:"flustered",l:"casual",t:"Same rhythm now... the raft's going straight, just like when we do pads together."}]},
   {t:"Watch her pole all the way to the bend",b:4,then:[{n:"baibua",f:"happy",l:"casual",t:"We made the bend! I did it... clap for me."}]}]}],
 [{n:"nar",t:"A sweet smell from the camp kitchen since five in the morning. Baibua and Kati sit wrapping khanom jok in a pile of banana leaves."},
  {n:"kati",f:"happy",l:"casual",t:"Baibua wraps every one prettier than mine! Manager, come help us wrap!"},
  {n:"baibua",f:"happy",l:"casual",t:"Fold the banana leaf like this, then press the top gently... don't worry about tearing it.",choice:[
   {t:"Wrap the most lopsided one possible to make them laugh",b:4,then:[{n:"kati",f:"happy",l:"casual",t:"Ha ha, this one's yours, Manager. I'm keeping it to eat myself!"},{n:"baibua",f:"flustered",l:"casual",t:"...Can I have that one?"}]},
   {t:"Wrap them carefully, step by step as she shows you",b:5,then:[{n:"baibua",f:"happy",l:"casual",t:"This one's prettier than Kati's... don't tell her."}]}]}]];
RG_AGAIN.baibua=[
 [{n:"nar",t:"That evening Baibua makes two cups of hot tea and watches Chiang Mai's lights come on one by one."},{n:"baibua",f:"happy",l:"casual",t:"It's quiet here... just sitting together is enough."}],
 [{n:"nar",t:"After training, Baibua presses the points on your shoulders one by one, the way her mother taught her."},{n:"baibua",f:"flustered",l:"casual",t:"Your shoulders are as stiff as teak... you've been working too hard again."}],
 [{n:"nar",t:"Baibua waters the lotus in the clay jar she brought from home. Today it has its first bud."},{n:"baibua",f:"happy",l:"casual",t:"It likes it here... like me."}]];
RG_HEART.baibua={
 40:G=>[{n:"nar",t:"On a day off, Baibua's mother video-calls from the spa, the sound of the artificial waterfall behind her."},
  {n:"npc",who:"Baibua's mother",t:((G.region.side||{}).north||{}).won?"The spa gets busier every day since the Jin Long news. People come to see the spa a boxing camp protected together.":"The spa's fine, dear. Dad can walk further now. Don't worry about home."},
  {n:"nar",t:"After hanging up, Baibua sits silent for a long time."},
  {n:"baibua",f:"sad",l:"casual",t:"I moved here... some nights I'm scared I abandoned home. Dad, Mum, the lotus pond.",choice:[
   {t:"\"You didn't leave. You bring your home's name into every fight\"",fx:G2=>add(G2,"baibua","bond",4),then:[{n:"baibua",f:"happy",l:"casual",t:"...Bringing home's name with me. I'll think that every time I step into the ring."}]},
   {t:"\"Let's visit home together on the next day off\"",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"baibua",f:"flustered",l:"casual",t:"Together... Mum will make a huge pot of hang lay for sure."}]}]}],
 55:G=>[{n:"nar",t:"Saturday morning, a middle-aged man walks slowly through the camp gate without a cane. Baibua runs to him with her hands still wrapped."},
  {n:"npc",who:"Baibua's father",t:"My knee's better, so I wanted to see my daughter train with my own eyes, just once."},
  {n:"nar",t:"Baibua spends the whole morning on pads with Kati. Her father sits by the ring and says nothing at all."},
  {n:"npc",who:"Baibua's father",t:"I've kept this ring notebook since her first fight. The last page is still empty... I think you should write the next one."},
  {n:"baibua",f:"flustered",l:"casual",t:"Dad! ...You don't have to take it.",choice:[
   {t:"Take the notebook with both hands",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"npc",who:"Baibua's father",t:"Good. Please look after my daughter."},{n:"baibua",f:"sad",l:"casual",t:"...Dad has never trusted me to anyone."}]},
   {t:"\"Let's write it together, Baibua and me\"",fx:G2=>add(G2,"baibua","bond",4),then:[{n:"npc",who:"Baibua's father",img:"baibua_dad_smile",t:"Ha ha, all right. That's better."},{n:"baibua",f:"happy",l:"casual",t:"Together... on the next page I'll write \"Sirichai Camp\" in big letters."}]}]}],
 70:G=>[{n:"nar",t:"Late at night the clack of a small loom comes from Baibua's room. She borrowed her grandmother's loom last month."},
  {n:"baibua",f:"flustered",l:"casual",t:"Grandma is Tai Lue. She says when you weave cloth for someone... that person will always find their way home."},
  {n:"nar",t:"A small cloth, shorter than a forearm, a pink lotus in the middle and a single red thread running through the whole thing."},
  {n:"baibua",f:"flustered",l:"casual",t:"The red thread is the way back to camp... this one's yours. I made three mistakes, but I didn't start over. I wanted it to have my marks in it.",choice:[
   {t:"Tie the cloth around your wrist right away",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"baibua",f:"happy",l:"casual",t:"...Tied tight, too. I thought you'd keep it in a drawer."}]},
   {t:"\"The mistakes are my favourite part\"",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"baibua",f:"flustered",l:"casual",t:"When you say that... I'll weave mistakes into every one."}]}]}]};
RG_LOVE2.baibua={
 2:G=>{const A=G.player.gender==="f"?"You":"You";return [{n:"nar",t:"Dinner at the camp's long table. For the first time Baibua sits next to the manager in front of everyone."},
  {n:"baibua",f:"flustered",l:"casual",t:`${A}... could you serve me some curry?`},{n:"nar",t:"The whole table goes silent, then Kati is the first to burst out laughing."},
  {n:"kati",f:"happy",l:"casual",t:"She said it! She said it in front of everyone!"},
  {n:"baibua",f:"flustered",l:"casual",t:"...We're together now. How long am I supposed to keep calling you that in secret?",choice:[
   {t:"Fill her bowl to the brim",fx:G2=>add(G2,"baibua","bond",4),then:[{n:"baibua",f:"happy",l:"casual",t:"That's too full... but I'll finish it."}]},
   {t:`Call her "Bua" back in front of everyone`,fx:G2=>add(G2,"baibua","bond",5),then:[{n:"baibua",f:"flustered",l:"casual",t:"...Bua. Keep calling me that."}]}]}];},
 8:G=>[{n:"nar",t:"Yi Peng night by the Ping River behind the camp. Baibua lights the lantern wick with slightly shaking hands."},
  {n:"baibua",f:"happy",l:"casual",t:"Every year I wish to win. This year I didn't wish for anything about boxing."},
  {n:"nar",t:"The two lanterns rise together, and the wind carries them the same way until they're gone."},
  {n:"baibua",f:"flustered",l:"casual",t:"...I wished we could release lanterns like this together every year. What did you wish for?",choice:[
   {t:"\"Same wish as yours\"",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"baibua",f:"happy",l:"casual",t:"Then those two lanterns wished for the same thing... it has to come true."}]},
   {t:"\"It's a secret\"",fx:G2=>add(G2,"baibua","bond",3),then:[{n:"baibua",f:"pout",l:"casual",t:"Cheater... I already told you mine."}]}]}],
 16:G=>[{n:"nar",bg:"home_baibua",t:"Baibua's mother invites you to dinner at home. The long wooden table beside the lotus pond is covered in every northern dish imaginable."},
  {n:"npc",who:"Baibua's father",t:"I won't ask about boxing anymore. My daughter fights better than I did at her age... I'll ask just one thing. Will you look after her?"},
  {n:"baibua",f:"flustered",l:"casual",t:"Dad! How can you ask that in front of a guest!",choice:[
   {t:"\"We look after each other. She's looked after me all along\"",fx:G2=>add(G2,"baibua","bond",5),then:[{n:"npc",who:"Baibua's father",img:"baibua_dad_smile",t:"...Good answer. Let's eat."},{n:"baibua",f:"happy",l:"casual",t:"Dad smiled... he doesn't smile at people easily."}]},
   {t:"\"For as long as she wants me to\"",fx:G2=>add(G2,"baibua","bond",4),then:[{n:"npc",who:"Baibua's father",img:"baibua_dad_smile",t:"Good. But she'll want looking after for a long time, I'm sure. I know my daughter."}]}]},
  {n:"baibua",f:"happy",l:"casual",t:"My home always has room for you... just like this camp has room for me."}]};
/* ---- ทับทิม ---- */
RG_HANG2.tabtim=[
 [{n:"nar",t:"Tabtim carries an old wooden phin out to the front of the camp. One string is broken, but she says two are enough."},
  {n:"tabtim",f:"happy",l:"casual",t:"Dad taught me the phin before he taught me boxing. He said good boxing needs rhythm. Want to try?"},
  {n:"nar",t:"Your phin sounds like a cat whose tail got stepped on. Tabtim laughs until she doubles over.",choice:[
   {t:"Ask her to hold your hand and teach you note by note",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"...I'll hold your hand to teach you, but no laughing when I go red."}]},
   {t:"Pluck at random so she can dance along",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"So fun! This song is called \"Manager Plays Every Note Wrong\". I'm playing it on my live!"}]}]}],
 [{n:"nar",t:"Tabtim sets up a camera outside her room, the table piled with her mother's mudmee silk."},
  {n:"tabtim",f:"happy",l:"casual",t:"Today's live is selling Mum's silk! Be my model, Manager. Silk looks better on tall people."},
  {n:"nar",t:"Viewers climb faster than on her boxing lives. Every comment asks \"who's the guy in the live?\"",choice:[
   {t:"Pose with everything you've got",b:4,then:[{n:"tabtim",f:"happy",l:"casual",t:"Sold out! Mum already called asking how much this model charges, ha ha."}]},
   {t:"Have her model the silk instead",b:5,then:[{n:"tabtim",f:"flustered",l:"casual",t:"...You said I look better in it. I heard that clearly. So did the viewers."}]}]}]];
RG_AGAIN.tabtim=[
 [{n:"nar",t:"Tabtim brings two packs of grilled chicken and sticky rice. You eat them sitting on the edge of the practice ring."},{n:"tabtim",f:"happy",l:"casual",t:"Food tastes better with someone you like... I mean a fellow camp member!"}],
 [{n:"nar",t:"Tabtim plays mor lam clips one after another, laughing louder than the people in them."},{n:"tabtim",f:"happy",l:"casual",t:"One more clip! Really the last one... the last three."}],
 [{n:"nar",t:"Tabtim is helping her youngest brother with maths homework on video call, then turns to you for help."},{n:"tabtim",f:"flustered",l:"casual",t:"I'm good at kicks, but not fractions. Help me out."}]];
RG_HEART.tabtim={
 40:G=>[{n:"nar",t:"A message from Brother Petch pops up on Tabtim's phone: a clip of his latest fight."},
  {n:"tabtim",f:"surprised",l:"casual",t:"He asked, \"Round two, where am I open on the left? Take a look for me\"... Brother Petch asked me to look at his fight! That's never happened!"},
  {n:"tabtim",f:"flustered",l:"casual",t:"How should I answer? If I tell him straight, will he get angry?",choice:[
   {t:"\"Tell him straight. He asked because he trusts your eye\"",fx:G2=>add(G2,"tabtim","bond",5),then:[{n:"nar",t:"Tabtim types three screens' worth and sends it without deleting a word."},{n:"tabtim",f:"happy",l:"casual",t:"Brother Petch answered with two words: \"Yeah, true.\" ...Ha ha, two words, but I'm keeping that screenshot for life."}]},
   {t:"\"Let's watch it together and I'll help you phrase it\"",fx:G2=>add(G2,"tabtim","bond",4),then:[{n:"tabtim",f:"happy",l:"casual",t:"You put it more politely than me. Brother Petch won't get angry... but the last line I'm adding myself: \"Kicks are more accurate than punches, brother.\""}]}]}],
 55:G=>[{n:"nar",t:"One in the morning, Tabtim's phone won't stop ringing. The name on the screen is \"Brother Nil\"."},
  {n:"tabtim",f:"sad",l:"casual",t:"Brother Nil's drunk... he says at the Naka League nobody calls you by name, only by number, and the training room is cold as an operating theatre."},
  {n:"tabtim",f:"sad",l:"casual",t:"He said \"don't tell Dad\"... the person who's looked down on me my whole life called me at one in the morning.",choice:[
   {t:"\"Tell him this camp always has a room free\"",fx:G2=>{add(G2,"tabtim","bond",5);G2.region.nilDoor=1;},then:[{n:"tabtim",f:"flustered",l:"casual",t:"...I sent it. He read it and didn't answer. But he didn't block me either. I think that's his answer."}]},
   {t:"Sit beside her until she hangs up",fx:G2=>add(G2,"tabtim","bond",4),then:[{n:"tabtim",f:"sad",l:"casual",t:"Thank you for not asking anything... tonight I don't want to be a champion. Just a little sister."}]}]}],
 70:G=>[{n:"nar",t:"A parcel from Korat arrives at camp: a length of silk patterned all over with little orange cats."},
  {n:"tabtim",f:"flustered",l:"casual",t:"Mum wove you an \"Orange Cat\" pattern! ...I didn't ask her to. She did it herself!"},
  {n:"tabtim",f:"happy",l:"casual",t:"Know why the people close to me call me Orange Cat? When I was little I had an orange cat. Tiny, but it chased every dog off the street. Dad said I'm just like it."},
  {n:"tabtim",f:"flustered",l:"casual",t:"Only family gets to call me Orange Cat... but if you want to, you can.",choice:[
   {t:"Call her \"Orange Cat\" right away",fx:G2=>add(G2,"tabtim","bond",5),then:[{n:"tabtim",f:"flustered",l:"casual",t:"...Hearing it from you isn't like when Dad says it at all. My heart's beating harder."}]},
   {t:"Drape the silk over your shoulders right away",fx:G2=>add(G2,"tabtim","bond",4),then:[{n:"tabtim",f:"happy",l:"casual",t:"It really suits you! Take a picture for Mum. She'll show it off to the whole village."}]}]}]};
RG_LOVE2.tabtim={
 2:G=>[{n:"nar",t:"The camp's daily training live. Tabtim grabs the camera and holds it herself."},
  {n:"tabtim",f:"happy",l:"casual",t:"Fans! Tabtim has an announcement... Tabtim has a boyfriend! The one holding the bag back there!"},
  {n:"nar",t:"Comments flood in until the app freezes. Every girl in the camp turns to look at once.",choice:[
   {t:"Wave at the camera",fx:G2=>add(G2,"tabtim","bond",5),then:[{n:"tabtim",f:"happy",l:"casual",t:"See that! My boyfriend's as bold as me!"}]},
   {t:"Hide your face behind the bag",fx:G2=>add(G2,"tabtim","bond",3),then:[{n:"tabtim",f:"pout",l:"casual",t:"What's there to be shy about! ...Okay, okay, sorry I didn't ask first. But I'm not sorry!"}]}]}],
 8:G=>[{n:"nar",bg:"home_tabtim",t:"The bang fai festival in Tabtim's village. She has you on the first bus at five in the morning."},
  {n:"tabtim",f:"happy",l:"casual",t:"This year you and me light the same one! Dad made it just for the two of us."},
  {n:"nar",t:"The rocket shoots straight up into the clouds. Cheers roll across the fields."},
  {n:"tabtim",f:"flustered",l:"casual",t:"When a bang fai goes up straight like that, they say the rain will be good and the rice will grow... and the people who lit it together stay together a long time. I didn't make that up!",choice:[
   {t:"\"Then let's light one together again next year\"",fx:G2=>add(G2,"tabtim","bond",5),then:[{n:"tabtim",f:"happy",l:"casual",t:"It's a promise! I'll tell Dad to make a bigger one!"}]},
   {t:"Tease her that she made it up",fx:G2=>add(G2,"tabtim","bond",3),then:[{n:"tabtim",f:"pout",l:"casual",t:"...Fine, I made up half. But the half I want to come true is real."}]}]}],
 16:G=>[{n:"nar",bg:"home_tabtim",t:"Back home in Phimai for Songkran, the whole family sits around a jungle-curry feast under the mango tree, Tabtim's father at the head."},
  {n:"npc",who:"Tabtim's father",t:"My daughter kicks hard, you know. She once kicked her big brother till he cried. Watch yourself."},
  {n:"tabtim",f:"flustered",l:"casual",t:"Dad! I was eight!",choice:[
   {t:"\"I've been careful all along, and happy to get kicked\"",fx:G2=>add(G2,"tabtim","bond",4),then:[{n:"npc",who:"Tabtim's father",img:"tabtim_dad_laugh",t:"Ha ha! Good, good. Keep eating."}]},
   {t:"\"Her kicks have already won this camp a cup\"",fx:G2=>add(G2,"tabtim","bond",5),then:[{n:"npc",who:"Tabtim's father",t:"...Yeah. I watch every live fight. Kicks are kicks, but she kicks all the way."},{n:"tabtim",f:"sad",l:"casual",t:"Dad watched every fight... and he never told me."}]}]},
  {n:"tabtim",f:"happy",l:"casual",t:"Thank you for coming to my home... this house is loud all day. You'd better get used to it now."}]};
/* ---- อลิเซีย ---- */
RG_HANG2.alicia=[
 [{n:"nar",t:"On a day off Mabelle and Minnie show up at camp with one basketball and one bicycle."},
  {n:"npc",who:"Minnie",t:"Sportygal is visiting our friend's new home! Manager, two-on-two? Me and Mabelle against you and Alicia."},
  {n:"alicia",f:"flustered",l:"casual",t:"Don't. Minnie has dunked on three people's heads... but if you play, I won't let anyone dunk on you.",choice:[
   {t:"Play until you drop",b:5,then:[{n:"nar",t:"You lose twenty to four. Alicia scores all four and high-fives you every time."},{n:"npc",who:"Mabelle",t:"I've never seen Alicia high-five anyone~"}]},
   {t:"Referee, and quietly favour Alicia",b:4,then:[{n:"npc",who:"Minnie",t:"Foul where?! Totally biased!"},{n:"alicia",f:"happy",l:"casual",t:"Referee's call is final. Right, Manager?"}]}]}],
 [{n:"nar",t:"A burnt smell drifts out of the kitchen. Alicia stands holding a wok, Auntie Daeng clutching her head beside her."},
  {n:"alicia",f:"pout",l:"casual",t:"Khao soi is harder than a rap verse... I wanted to make you something myself for once, not order delivery."},
  {n:"nar",t:"The first bowl of khao soi is so salty it needs half a bowl of water.",choice:[
   {t:"Finish the whole bowl",b:5,then:[{n:"alicia",f:"flustered",l:"casual",t:"...You really finished it? Liar. But the cutest liar I've ever met."}]},
   {t:"Ask to make the second bowl together",b:4,then:[{n:"alicia",f:"happy",l:"casual",t:"The second bowl is much better. Auntie Daeng even nodded! ...Because you added sugar instead of salt. I saw."}]}]}]];
RG_AGAIN.alicia=[
 [{n:"nar",t:"Before a fan meeting, Alicia holds out two shirts for you to pick."},{n:"alicia",f:"flustered",l:"casual",t:"I don't want your opinion or anything. Just... which one."}],
 [{n:"nar",t:"Alicia reads her recent comments. Most of them ask about her heavy hands."},{n:"alicia",f:"happy",l:"casual",t:"They're asking about boxing now, not my face... I've waited a long time for this."}],
 [{n:"nar",t:"Alicia works the bag for an hour, her phone face-down far away."},{n:"alicia",f:"happy",l:"casual",t:"No one's watching this hour but you. That's enough."}]];
RG_HEART.alicia={
 40:G=>[{n:"nar",t:"Alicia drops a tablet on the table: a Sportygal concert tour schedule, twelve cities."},
  {n:"alicia",f:"sad",l:"casual",t:"The label wants a three-month tour, right in fight season... if I go, I miss fights. If I don't, Mabelle and Minnie don't get a tour."},
  {n:"alicia",f:"sad",l:"casual",t:"Both are my dreams. Neither one is a chore... why do I have to choose?",choice:[
   {t:"\"Get the tour shortened and book fights around it\"",fx:G2=>add(G2,"alicia","bond",5),then:[{n:"alicia",f:"happy",l:"casual",t:"...Two months, six cities, and fights at venues along the way. I'm calling the label right now. You're a genius. Don't let it go to your head."}]},
   {t:"\"Ask Mabelle and Minnie before deciding alone\"",fx:G2=>add(G2,"alicia","bond",4),then:[{n:"nar",t:"Ten minutes later two messages pop up in the Sportygal group at once: \"Go fight. We'll wait.\""},{n:"alicia",f:"sad",l:"casual",t:"...They can wait for me, and I won't make them wait too long."}]}]}],
 55:G=>[{n:"nar",t:"The tape room late at night. Alicia and Rin sit in opposite corners, half an hour into an argument."},
  {n:"rin",f:"pout",l:"casual",t:"The numbers say this opponent throws a left after stepping back twice. Seventy-three percent."},
  {n:"alicia",f:"pout",l:"casual",t:"And her eyes say she'll change plans the moment she knows we've read it. People aren't numbers, Rin."},
  {n:"nar",t:"They both turn to the manager at once.",choice:[
   {t:"\"Use both. Rin reads the plan, Alicia reads the person\"",fx:G2=>{add(G2,"alicia","bond",4);add(G2,"rin","bond",3);},then:[{n:"rin",f:"happy",l:"casual",t:"...This answer has very high statistical significance."},{n:"alicia",f:"happy",l:"casual",t:"Two Lopburi fighters in one camp. Our next opponent is in trouble. Rin, high five?"}]},
   {t:"\"Have them hit pads against each other and see who reads whom\"",fx:G2=>{add(G2,"alicia","bond",5);add(G2,"rin","bond",2);},then:[{n:"nar",t:"Three rounds later, every round a draw. They sit panting and laughing on the ring floor."},{n:"alicia",f:"happy",l:"casual",t:"...You're better than I thought, Rin. I'll say it once."}]}]}],
 70:G=>[{n:"nar",t:"The camp roof at ten at night. Alicia sits with an acoustic guitar you've never seen her play."},
  {n:"alicia",f:"flustered",l:"casual",t:"Every song I sing, the label wrote for me... I wrote this one. No one has heard it. No camera, no live."},
  {n:"nar",t:"A short song, sung softly. The hook is about someone who looks at her without a screen in between."},
  {n:"alicia",f:"flustered",l:"casual",t:"...That's it. You don't have to say anything. No, I want you to. But say something nice.",choice:[
   {t:"\"Play it again\"",fx:G2=>add(G2,"alicia","bond",5),then:[{n:"alicia",f:"happy",l:"casual",t:"...An encore? One audience member wants an encore, so I'll sing it. My voice won't shake this time."}]},
   {t:"\"Don't release this one. Keep it here\"",fx:G2=>add(G2,"alicia","bond",4),then:[{n:"alicia",f:"happy",l:"casual",t:"Keep it here on this roof... Deal. The first song I choose not to let anyone hear."}]}]}]};
RG_LOVE2.alicia={
 2:G=>[{n:"nar",t:"Alicia's new post gets over a million hearts in the first hour: two coffee cups, and someone else's hand holding one by the handle."},
  {n:"alicia",f:"flustered",l:"casual",t:"I didn't post your face. Just your hand... the caption says \"I choose.\" That's all. Let them guess."},
  {n:"nar",t:"Mabelle comments thirty heart emojis under the post. Minnie comments, \"That hand looks familiar.\"",choice:[
   {t:"\"This hand is happy to be in every post\"",fx:G2=>add(G2,"alicia","bond",5),then:[{n:"alicia",f:"happy",l:"casual",t:"...Remember you said that, because I'll be charging you for every post."}]},
   {t:"\"That's my coffee cup. Don't you dare delete it\"",fx:G2=>add(G2,"alicia","bond",4),then:[{n:"alicia",f:"pout",l:"casual",t:"Not deleting it. Pinned it too. Obviously."}]}]}],
 8:G=>[{n:"nar",t:"Sportygal's Bangkok concert. Before the last song, Alicia asks for the stage alone."},
  {n:"alicia",f:"flustered",l:"casual",t:"This song isn't on the set list... I wrote it myself, for someone from Chiang Mai who's standing backstage tonight."},
  {n:"npc",who:"Minnie",t:"He's here! This one!"},{n:"npc",who:"Mabelle",t:"Minnie! Don't point!"},
  {n:"alicia",f:"happy",l:"casual",t:"...I'm not pointing. No one saw your face. It's not content. I just wanted you to hear it with ten thousand people.",choice:[
   {t:"Stand and listen to the end without moving",fx:G2=>add(G2,"alicia","bond",5),then:[{n:"alicia",f:"happy",l:"casual",t:"I saw you standing still through the whole song... I really sang to just one person, in front of ten thousand."}]},
   {t:"Wave the lightstick Minnie shoved into your hand",fx:G2=>add(G2,"alicia","bond",4),then:[{n:"alicia",f:"flustered",l:"casual",t:"And a lightstick in my colour... who taught you to wave it in rhythm? Minnie, right?"}]}]}],
 16:G=>[{n:"nar",bg:"home_alicia",t:"Alicia's mother invites you to dinner at the Bangkok condo the sponsor pays for, but tonight she cooked every dish herself."},
  {n:"npc",who:"Alicia's mother",img:"alicia_mom_soft",t:"I've watched my daughter through a screen for ten years. Today's the first time I've seen her laugh without looking for the lens."},
  {n:"alicia",f:"flustered",l:"casual",t:"Mum! How can you say that in front of him?",choice:[
   {t:"\"She laughs like this at camp every day\"",fx:G2=>add(G2,"alicia","bond",5),then:[{n:"npc",who:"Alicia's mother",img:"alicia_mom_soft",t:"Then I'll leave my daughter with that camp of yours."},{n:"alicia",f:"sad",l:"casual",t:"...Mum has never trusted me to anyone. Not even the label."}]},
   {t:"\"Thank you for letting her choose her own way\"",fx:G2=>add(G2,"alicia","bond",4),then:[{n:"npc",who:"Alicia's mother",t:"I didn't let her. She's always chosen for herself. I just watched."}]}]},
  {n:"alicia",f:"happy",l:"casual",t:"...Tonight isn't content. But I'll remember all of it myself. No recording."}]};
/* ---- ชบา ---- */
RG_HANG2.chaba=[
 [{n:"nar",t:"On a day off Chaba rents a small sailboat at the reservoir outside town. The afternoon wind is just right."},
  {n:"chaba",f:"happy",l:"casual",t:"...Not the sea, but real wind. Hold this rope. Pull when I say."},
  {n:"nar",t:"The boat heels one way and Chaba leans the other without a thought.",choice:[
   {t:"Pull the rope on her timing",b:5,then:[{n:"chaba",f:"happy",l:"casual",t:"...Good. Steady hands. The wind loves steady hands."}]},
   {t:"Let her steer alone and watch",b:4,then:[{n:"chaba",f:"flustered",l:"casual",t:"Looking at what. ...The boat, or me."}]}]}],
 [{n:"nar",t:"The camp kitchen is hotter than usual. Chaba and Mali are pounding kaeng tai pla paste in two mortars."},
  {n:"mali",f:"happy",l:"casual",t:"Chaba pounds way harder than Mali~ Manager, come taste! Spicy like back home."},
  {n:"chaba",f:"happy",l:"casual",t:"...Spicy. Careful.",choice:[
   {t:"Take a big bite",b:4,then:[{n:"nar",t:"Three seconds later you can't speak. Chaba hands you water, the corner of her mouth twitching."},{n:"mali",f:"happy",l:"casual",t:"Chaba smiled! Mali saw it!"}]},
   {t:"Taste a little and say it's \"roi\"",b:5,then:[{n:"chaba",f:"flustered",l:"casual",t:"...Speaking southern now. Who taught you."},{n:"mali",f:"happy",l:"casual",t:"Mali did~"}]}]}]];
RG_AGAIN.chaba=[
 [{n:"nar",t:"Chaba sits oiling the whole camp's gloves pair by pair, in silence."},{n:"chaba",f:"happy",l:"casual",t:"...This pair is yours. Pads. Oiled too."}],
 [{n:"nar",t:"The same stray cat waits outside Chaba's door. She pours it food and sits down beside it."},{n:"chaba",f:"happy",l:"casual",t:"...It remembers the time. Like you."}],
 [{n:"nar",t:"It pours all afternoon. Chaba watches the rain from the dorm balcony, a space left empty beside her."},{n:"chaba",f:"happy",l:"casual",t:"...Sit. Rain like this, no need to talk."}]];
RG_HEART.chaba={
 40:G=>[{n:"nar",t:"Chaba stops in the middle of training and stares at her phone for a full minute."},
  {n:"nar",t:"A video from Phuket: her brother grips two crutches and takes three steps out of his wheelchair."},
  {n:"chaba",f:"sad",l:"casual",t:"...Three steps. The doctor said never."},
  {n:"nar",t:"Tears run down, but Chaba's face stays as still as ever.",choice:[
   {t:"Stand beside her and say nothing",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"chaba",f:"sad",l:"casual",t:"...Thanks. For not talking."}]},
   {t:"\"Call your brother back right now\"",fx:G2=>add(G2,"chaba","bond",4),then:[{n:"npc",who:"Chaba's brother",img:"chaba_bro_stand",t:"Chaba! See? Three steps! Next month I'm walking to watch you fight myself!"},{n:"chaba",f:"happy",l:"casual",t:"...Come. I'll win for you to see."}]}]}],
 55:G=>[{n:"nar",t:"On the dorm balcony Chaba teaches sailing knots, one after another."},
  {n:"chaba",f:"sad",l:"casual",t:"...The day the boat capsized, I tied this knot wrong. That's why my brother went in."},
  {n:"chaba",f:"sad",l:"casual",t:"No one knows. Not Mum. Not my brother. ...I've been afraid of the sea since that day, but I still sail. Quitting would be giving up.",choice:[
   {t:"\"You've sailed every year because you're the bravest, not because you were wrong\"",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"chaba",f:"sad",l:"casual",t:"...Long words. You always talk long. But this time, I'll listen."}]},
   {t:"Ask her to teach you to tie that knot right",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"nar",t:"Chaba guides your hands through the same knot ten times. Not one wrong."},{n:"chaba",f:"happy",l:"casual",t:"...Right. Every time. I'll remember these hands when I sail."}]}]}],
 70:G=>[{n:"nar",t:"Before dawn, an envelope has been slipped under the manager's door. Big, slanted handwriting."},
  {n:"nar",t:"\"Chaba wrote a dozen letters and never sent them. This one I'm sending.\" ...Inside, only three lines."},
  {n:"nar",t:"\"Here is good / Manager is good / Want to stay long\"",choice:[
   {t:"Write three lines back and slip them under her door",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"nar",t:"Later that morning Chaba walks past with both ears red."},{n:"chaba",f:"flustered",l:"casual",t:"...Read it. Three lines. Same. Fair."}]},
   {t:"Knock on her door and answer out loud",fx:G2=>add(G2,"chaba","bond",4),then:[{n:"chaba",f:"flustered",l:"casual",t:"...Letters are for reading, not talking. Go write. ...Fine. Heard it."}]}]}]};
RG_LOVE2.chaba={
 2:G=>[{n:"nar",t:"At camp dinner Chaba sits down next to the manager and simply rests her hand on yours in the middle of the table."},
  {n:"mali",f:"surprised",l:"casual",t:"Chaba! In front of everyone~!"},
  {n:"chaba",f:"happy",l:"casual",t:"...Why. Not hiding.",choice:[
   {t:"Hold her hand back until dinner's over",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"chaba",f:"flustered",l:"casual",t:"...Eating one-handed is hard. Not letting go."}]},
   {t:"Spoon a salted egg onto her plate with your other hand",fx:G2=>add(G2,"chaba","bond",4),then:[{n:"chaba",f:"happy",l:"casual",t:"...Chaiya salted egg. You know."},{n:"mali",f:"happy",l:"casual",t:"Mali told him~"}]}]}],
 8:G=>[{n:"nar",t:"On a long holiday Chaba takes the manager home to Phuket to go night squid fishing with her father. Green lamps light the sea in a wide circle."},
  {n:"npc",who:"Chaba's father",t:"My daughter has never brought anyone on the boat. You're the first."},
  {n:"chaba",f:"flustered",l:"casual",t:"...Dad. Talks too much.",choice:[
   {t:"Help haul the nets all night",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"npc",who:"Chaba's father",t:"Good hands. Come again next year."},{n:"chaba",f:"happy",l:"casual",t:"...Dad invited you. Dad doesn't invite anyone."}]},
   {t:"Sit at the stern with Chaba and watch the other boats' lights",fx:G2=>add(G2,"chaba","bond",4),then:[{n:"chaba",f:"happy",l:"casual",t:"...When I was little I thought those lights were shooting stars. Still do."}]}]}],
 16:G=>[{n:"nar",bg:"home_chaba",t:"Chak Phra festival in Chaiya. Chaba brings the manager and Mali back to the old neighbourhood. Her brother walks the whole length of the boat procession."},
  {n:"npc",who:"Chaba's brother",t:"Chaba smiles more these days... thank you for making my little sister smile."},
  {n:"chaba",f:"flustered",l:"casual",t:"...Not smiling. Sun's strong.",choice:[
   {t:"\"The sun's been strong every day lately\"",fx:G2=>add(G2,"chaba","bond",5),then:[{n:"chaba",f:"happy",l:"casual",t:"...Mm. Every day. Because someone's standing next to me."}]},
   {t:"Ask her brother to walk with you to the end of the procession",fx:G2=>add(G2,"chaba","bond",4),then:[{n:"npc",who:"Chaba's brother",img:"chaba_bro_stand",t:"End of the procession! Next year I'll run it!"},{n:"chaba",f:"sad",l:"casual",t:"...I'll watch. Every Chak Phra. Never miss one."}]}]}]};

/* v1.91.135 (Man): champions in the camp have birthdays like the heroines (Baibua 12 Nov · Tabtim 14 Apr · Alicia 1 Jan · Chaba 5 Oct) */
const RG_BDAY={
 baibua:{dm:[12,10],bg:"camp",y1:[{n:"nar",t:"Baibua's birthday falls on Yi Peng night. The whole camp folds a big pile of lanterns down by the landing."},{n:"baibua",f:"flustered",l:"casual",t:"Every year I release lanterns with just Mum and Dad... this year with the whole camp. It's brighter than ever."}],
  y2:[{n:"nar",t:"Another Yi Peng. Kati secretly writes Baibua's name on every lantern."},{n:"baibua",f:"happy",l:"casual",t:"My name is floating all over the sky... I could die of embarrassment."}],
  gift:"...This is for me? I'll keep it next to that teen jok cloth.",party:"Sirichai Camp releases twenty lanterns at once. Baibua stands smiling at the landing until the last one is out of sight.",wish:"Thank you... just hearing you wish me well is enough, Manager."},
 tabtim:{dm:[14,3],bg:"camp",y1:[{n:"nar",t:"Tabtim's birthday falls on Songkran, one day after Kati's, so the camp stays soaked two days running."},{n:"tabtim",f:"happy",l:"casual",t:"My birthday has to be more fun than Kati's! Put on the mor lam! Anyone who doesn't dance gets splashed!"}],
  y2:[{n:"nar",t:"Another Songkran. Tabtim's little brothers and sisters ride the bus all the way to camp to surprise their big sister on her birthday."},{n:"tabtim",f:"sad",l:"casual",t:"All of you came?... Who told you to come! Sniff, I'm not crying. It's Songkran water in my eyes."}],
  gift:"For me, really? So fun! I'll use it every day!",party:"Mor lam blares until two in the morning. Tabtim drags everyone in the camp up to dance, one by one.",wish:"This is enough... I'm happy you remembered my birthday, Manager."},
 alicia:{dm:[1,0],bg:"camp",y1:[{n:"nar",t:"New Year's Day, Alicia's birthday. Her phone hasn't stopped buzzing since midnight, but she's left it face down on the table."},{n:"alicia",f:"flustered",l:"casual",t:"No birthday live this year. ...I want to celebrate with the camp, that's all. Don't make that face."},{n:"ploy",f:"happy",l:"casual",t:"Same day as mine. ...This year someone's blowing out the cake with me."}],
  y2:[{n:"nar",t:"Another New Year. Alicia and Ploy blow out the same cake for the second year running."},{n:"alicia",f:"happy",l:"casual",t:"New camp tradition. One cake, two birthdays. No exceptions."}],
  alt:{y2:[{n:"nar",t:"Another New Year. The whole camp counts down together, then shouts happy birthday to Alicia instead of happy New Year."},{n:"alicia",f:"happy",l:"casual",t:"Happy New Year... and happy birthday to me. Even louder than last year."}],party:"The camp sets off small fireworks at midnight and sings happy birthday louder than any New Year song."},
  gift:"...You remembered. Not everyone remembers New Year's Day is my birthday too.",party:"The camp sets off small fireworks and sings happy birthday twice: once for Alicia, once for Ploy.",wish:"Thank you... I don't need anything more than this."},
 chaba:{dm:[5,9],bg:"camp",y1:[{n:"nar",t:"The morning of the fifth of October. Chaba trains as usual and tells no one what day it is."},{n:"mali",f:"happy",l:"casual",t:"(whispering) Today's big sister Chaba's birthday~ I've remembered since we were kids. She's never celebrated it."}],
  y2:[{n:"nar",t:"Chaba's birthday comes round again. This year her brother sends a parcel from Phuket: a new seashell wind chime."},{n:"chaba",f:"happy",l:"casual",t:"...He made it himself. Took three months. I'm hanging it outside my room."}],
  gift:"...For me. Thanks. Don't know what to say.",party:"The whole camp sings happy birthday. Chaba stands perfectly still until the song ends, then says a single word, \"...Delicious,\" though she hasn't touched the cake.",wish:"...Mm. Thanks."}};
if(typeof BDAY_DM!=="undefined"&&typeof EVENTS!=="undefined")for(const id of Object.keys(RG_BDAY)){const B=RG_BDAY[id];BDAY_DM[id]=B.dm;
  if(EVENTS.some(e=>e.id==="bday_"+id))continue;
  EVENTS.push({id:"bday_"+id,annual:true,pri:1,look:"casual",bg:B.bg,when:G=>{const w=bdayWeek(id);return w>0&&G.week>=w&&G.week<=w+1&&!!(G.region&&G.region.joined&&G.region.joined[id])&&inCamp(G,id);},steps:[
    {inject:G=>{const last=G.bday&&G.bday[id],noP=B.alt&&!inCamp(G,"ploy"),Y=last&&last.y<(G.season||1)?(noP?B.alt.y2:B.y2):B.y1.filter(x=>!noP||x.n!=="ploy"),PT=noP?B.alt.party:B.party;return Y.concat([{n:"nar",t:"What will you do for her?",choice:[
      {t:"A gift chosen with care (฿800)",fx:G2=>{G2.cash-=800;add(G2,id,"bond",8);(G2.bday=G2.bday||{})[id]={y:G2.season||1,c:0};},then:[{n:id,f:"flustered",l:"casual",t:B.gift}]},
      {t:"Throw a party for the whole camp (฿2,000 · everyone: morale +6)",fx:G2=>{G2.cash-=2000;add(G2,id,"bond",5);R_ALL(G2,f=>{f.morale=Math.min(100,f.morale+6);});(G2.bday=G2.bday||{})[id]={y:G2.season||1,c:1};},then:[{n:"nar",t:PT}]},
      {t:"Heartfelt wishes",fx:G2=>{add(G2,id,"bond",3);(G2.bday=G2.bday||{})[id]={y:G2.season||1,c:2};},then:[{n:id,f:"happy",l:"casual",t:B.wish}]}]}]);}}]});}
/* v1.91.135: the week after she and the manager get together, her partner in the camp says something (only when there is no one else) */
const RG_PAIRSAY={
 baibua:[{n:"kati",f:"happy",l:"casual",t:"Baibua and the manager... I'm so happy for you! I knew it the day they went all the way to Chiang Mai to fetch you."},{n:"baibua",f:"flustered",l:"casual",t:"Kati... thank you. I promise I won't steal the manager from your morning runs."}],
 tabtim:[{n:"ploy",f:"happy",l:"casual",t:"Tabtim has been twice as loud since last week. The whole camp knows. ...Look after each other, both of you."},{n:"tabtim",f:"happy",l:"casual",t:"Big sister Ploy gave us her blessing! Korat girls have to understand each other!"}],
 alicia:[{n:"rin",f:"happy",l:"casual",t:"The probability of me guessing this wrong was zero. I knew since the Ayutthaya boat trip. ...Congratulations."},{n:"alicia",f:"flustered",l:"casual",t:"...Rin guessed right again. Annoying. Thank you."}],
 chaba:[{n:"mali",f:"happy",l:"casual",t:"Big sister Chaba has a boyfriend~! I'm calling Mum. She'll be happier than anyone, I just know it."},{n:"chaba",f:"flustered",l:"casual",t:"...Don't tell Mum. Mum tells all of Chaiya. ...Fine, tell her."}]};

/* v1.91.138 (Man): each time-together scene shows where it happens (the market, the river, the kitchen, her room…) instead of always the gym */
{const RG_SCENE_BG={"baibua.hang.0": "market_morning", "baibua.hang.1": "night", "baibua.hang.2": "camp", "baibua.love": "night_north", "baibua.h2.0": "river", "baibua.h2.1": "kitchen", "baibua.ag.0": "doisuthep", "baibua.ag.1": "camp", "baibua.ag.2": "camp_day", "baibua.heart.55": "camp", "baibua.heart.70": "dorm_room", "baibua.love2.2": "night", "baibua.love2.8": "loy_night", "tabtim.hang.0": "somtam_stall", "tabtim.hang.1": "camp_day", "tabtim.love": "mekong", "tabtim.h2.0": "camp_day", "tabtim.h2.1": "live_corner", "alicia.hang.0": "live_corner", "tabtim.ag.2": "dorm_room", "tabtim.heart.55": "night", "tabtim.heart.70": "camp_day", "alicia.hang.1": "dorm_room", "alicia.love": "boat", "alicia.h2.0": "camp_day", "alicia.h2.1": "kitchen", "alicia.ag.0": "dorm_room", "alicia.heart.55": "gymdusk", "alicia.heart.70": "rooftop", "alicia.love2.2": "cafe", "alicia.love2.8": "closing_ceremony", "chaba.hang.0": "camp_day", "chaba.hang.1": "camp_day", "chaba.love": "andaman", "chaba.h2.0": "river", "chaba.h2.1": "kitchen", "chaba.ag.1": "camp_day", "chaba.ag.2": "camp_rain", "chaba.heart.55": "camp_day", "chaba.heart.70": "dorm_room", "chaba.love2.2": "night", "chaba.love2.8": "andaman"};
 const tag=(sc,bg)=>{if(!bg||!sc)return sc;if(typeof sc==="function"){const f=sc;return G=>{const a=f(G);if(a&&a[0]&&!a[0].bg)a[0]={...a[0],bg};return a;};}if(sc[0]&&!sc[0].bg)sc[0]={...sc[0],bg};return sc;};
 for(const c of ["baibua","tabtim","alicia","chaba"]){const J=RG_JOIN[c];if(!J)continue;
  (J.hang||[]).forEach((sc,i)=>J.hang[i]=tag(sc,RG_SCENE_BG[c+".hang."+i]));J.love=tag(J.love,RG_SCENE_BG[c+".love"]);
  (RG_HANG2[c]||[]).forEach((sc,i)=>RG_HANG2[c][i]=tag(sc,RG_SCENE_BG[c+".h2."+i]));(RG_AGAIN[c]||[]).forEach((sc,i)=>RG_AGAIN[c][i]=tag(sc,RG_SCENE_BG[c+".ag."+i]));
  for(const k of RG_HEART_AT)if(RG_HEART[c]&&RG_HEART[c][k])RG_HEART[c][k]=tag(RG_HEART[c][k],RG_SCENE_BG[c+".heart."+k]);
  for(const k of RG_LOVE_AT)if(RG_LOVE2[c]&&RG_LOVE2[c][k])RG_LOVE2[c][k]=tag(RG_LOVE2[c][k],RG_SCENE_BG[c+".love2."+k]);}}

/* v1.91.140 (Man): Alicia's manager Mr. Krit is caught — he sold her backstage schedule to the sasaeng crowd for a viral clip the Naka sponsor paid for.
   Mint, Sportygal's shy group manager, finds the proof and brings it to Sirichai; Alicia fires him and asks Mint to manage her. */
const rgKritOut=G=>!!(G.region&&G.region.kritOut);
function rgKritDue(G){const R=G.region,S=R&&R.side&&R.side.central;if(!S||!S.won||R.kritOut||R.trip)return false;return gameWeek(G)-(S.triedAbs||0)>=2;}
function rgKritSteps(G){return [
 {n:"nar",bg:"camp_day",show:[{id:"npc:mint_flustered"}],t:"Tuesday afternoon, a woman with mint-green hair in a navy suit stands at the camp fence for a long time, hugging a thick folder so tightly the paper crumples."},
 {n:"npc",who:"Mint",img:"mint_flustered",t:"S-sorry! Is this Sirichai Camp? I'm Mint, Sportygal's manager... not Alicia's manager, I only look after the group."},
 {n:"npc",who:"Mint",img:"mint_flustered",t:"There's something I can't tell Alicia alone. She trusts the manager of this camp... so I came here."},
 {n:"nar",t:"Papers fly out of the folder all over the yard. Kati runs to help gather them; Mint bows three times in apology."},
 {n:"npc",who:"Mint",t:"These are Mr. Krit's chats with the sasaeng fan-club leader: her schedule, the dressing-room number, when the guards change shifts... the same night they stormed backstage."},
 {n:"npc",who:"Mint",t:"And this is a transfer slip from Naka Energy Drink's marketing team, with the note 'backstage viral clip fee'... He sold out my friend."},
 {n:"coach",t:"That clip he wanted uploaded that night... it was planned from the start."},
 {n:"nar",t:"You call Alicia. Ten minutes later she arrives by taxi, cap pulled low, mask still on."},
 {n:"alicia",f:"angry",l:"casual",t:"...Let me see it myself."},
 {n:"nar",t:"Alicia reads every page without a word. The hand holding the paper doesn't shake at all."},
 {n:"nar",t:"A silver sedan turns in and parks in front of the camp. Mr. Krit steps out, phone to his ear, wearing the same wide smile as always."},
 {n:"npc",who:"Mr. Krit, personal manager",img:"krit",t:"Alicia! I've been looking everywhere. New job from Naka, double the fee, just a one-hour live of you training at this camp—"},
 {n:"nar",show:[{id:"npc:krit"},{id:"npc:mint"}],t:"His eyes land on the folder in Mint's hands."},
 {n:"npc",who:"Mr. Krit, personal manager",img:"krit_panic",t:"Wait... Mint, how did you get stuff off my phone? That's company data!"},
 {n:"npc",who:"Mint",img:"mint_flustered",t:"Y-you sent it to the band's work group by mistake! I just... didn't delete it."},
 {n:"npc",who:"Mr. Krit, personal manager",img:"krit_panic",t:"Alicia, hear me out! That clip got you three hundred thousand followers. I did it for you—"},
 {n:"alicia",f:"angry",l:"casual",t:"That night people from this camp bled holding the door for me. You count followers. I count the hurt."},
 {n:"nar",t:"Everyone in the camp turns to look at the manager.",choice:[
  {t:"\"This camp doesn't welcome people who sell out their own\"",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"npc",who:"Mr. Krit, personal manager",img:"krit_panic",t:"...This is some backwater boxing camp. You've got no right to order me around!"},{n:"coach",t:"It's this country camp whose kids got hurt for your singer. Leave the way you came."}]},
  {t:"\"Alicia, it's your call\"",fx:G2=>rgMeet(G2,"alicia",4),then:[{n:"alicia",f:"happy",l:"casual",t:"...Thank you for letting me choose. No one ever has."}]},
  {t:"Hand Alicia your phone so she can call the label in front of him",fx:G2=>rgMeet(G2,"alicia",3),then:[{n:"nar",t:"Alicia puts it on speaker, dials the label's executive, and sets the phone on the table right in front of Mr. Krit."}]}]},
 {n:"alicia",f:"angry",l:"casual",t:"Mr. Krit, you're fired. I've told the label. Your personal manager contract ends today. The Naka money goes through the lawyers."},
 {n:"npc",who:"Mr. Krit, personal manager",img:"krit_panic",t:"How far do you think you'll get? Without me you're just a pretty girl who boxes—"},
 {n:"alicia",f:"happy",l:"casual",t:"Yes. I box. Goodbye."},
 {n:"nar",show:[{id:"alicia",l:"casual"},{id:"npc:mint"}],t:"The silver sedan reverses out from the front of the camp and clips Mali's jasmine pot. Mali presses her lips together to keep from laughing."},
 {n:"alicia",f:"flustered",l:"casual",t:"Mint... I'm sorry I never noticed you were looking after all of us the whole time."},
 {n:"alicia",f:"happy",l:"casual",t:"Would you be my manager? You don't have to find me lots of work. Just don't sell me out."},
 {n:"npc",who:"Mint",img:"mint",t:"M-me!? I spill coffee on the schedule every single week..."},
 {n:"npc",who:"Mint",img:"mint",t:"...But I won't let anyone open your dressing-room door again. I promise."},
 {n:"nar",t:"That night Mabelle and Minnie video-call the group chat and send thirty firework stickers."},
 {n:"npc",who:"Minnie",img:"minnie_smirk",t:"See? I told you that guy in the glasses was shady. As for Mint... a new title means you're buying shabu."},
 {n:"npc",who:"Mabelle",img:"mabelle_excited",t:"The Sirichai manager has to come too! A Sportygal celebration needs the whole team!"},
 {fx:G2=>{G2.region.kritOut=gameWeek(G2);rgMeet(G2,"alicia",2);}}];}

const RG_PROF={
 baibua:{height:"165 cm",blood:"A",bday:"12 November (Yi Peng)",home:"Chiang Mai · a wooden house behind her father's small camp",heritage:"Muay Tha Sao (same lineage as Kati)",
  personality:"Shy, reserved, soft-spoken, apologises before every counter elbow, yet never backs down in the ring",likes:["Khao soi from a hidden stall behind the market","Mist before dawn","Teen chok embroidery"],
  dislikes:["Being stared at while she talks","Cameras","Food that isn't spicy"],hobby:"Embroiders teen chok for the people who matter, slowly, so it finishes later",
  story:"Carried her father's small camp alone since his knee went: training, dishes, accounts, until she saw Sirichai Camp where everyone helps",secret:"Her first contract letter had one sentence she wrote and erased, erased until the paper wore thin"},
 tabtim:{height:"168 cm",blood:"B",bday:"14 April",home:"Korat · a rice-field house where her father once boxed at temple fairs",heritage:"Muay Korat (same lineage as Ploy)",
  personality:"Loud, laughs easily, cries even more easily. Wild outside the ring, calculates every step inside it",likes:["Som tam with ten chillies","Mor lam sing","Grilled chicken with hot sticky rice"],
  dislikes:["Long silences","Eating alone","People who look down on country kids"],hobby:"Dancing alone in the middle of the yard when nobody's watching (everyone is)",
  story:"Fights to put her younger brother through law school. Her father, a temple-fair boxer, never came to watch her fight until the day she won the Isan cup",secret:"Practised saying 'I like you' in Isan in the mirror for three weeks before saying it"},
 alicia:{height:"170 cm",blood:"AB",bday:"January 1",home:"Bangkok · a condo the sponsor rented (moved out)",heritage:"Muay Lopburi (same lineage as Rin)",
  personality:"Tsundere, stubborn, works harder than she lets anyone see, slips into English when flustered",likes:["Royal Thai sweets","Boat rides at night","Contracts you can read in five minutes"],
  dislikes:["The words 'famous for her face'","Contracts with the word forever","Being told to smile"],hobby:"Edits her training clips at 2 a.m. and never posts them",
  story:"Famous since her first fight for her looks, so she trained harder than anyone so people would remember her fists, not her face",secret:"The first hand wraps she bought herself at fifteen are still in her bag, though half of them are torn"},
 chaba:{height:"160 cm",blood:"O",bday:"5 October",home:"Born in Chaiya next door to Mali · grew up in Phuket",heritage:"Muay Chaiya (same lineage as Mali)",
  personality:"Still, quiet, deadpan funny, weak to anything cute",likes:["Khao yam","Stray cats","The sea at night"],
  dislikes:["People who talk too long","Cameras pointed at her brother","Being asked if she's tired"],hobby:"Fixing things that aren't broken",
  story:"Her brother's boat capsized and left him in a wheelchair. Chaba has fought in his place since that night, and moved from Chaiya to Phuket without saying goodbye to Mali",secret:"Eleven letters to Mali she never sent. She still remembers every line"}};
const RG_GPREF={baibua:{love:["malai","tea","n_umbrella"],like:["sketch","wrap","khanom","photo"],dislike:["coffee"]},
 tabtim:{love:["sausage","i_pillow","photo"],like:["khanom","stickers","shorts","doll"],dislike:["book"]},
 alicia:{love:["bracelet","c_khon","spa"],like:["tea","sketch","photo","coffee"],dislike:["sausage"]},
 chaba:{love:["doll","s_talung","s_pearl"],like:["khanom","wrap","photo"],dislike:["stickers"]}};
const RG_GLINES={baibua:{love:"…This is really for me? I'll take good care of it",like:"Thank you, it's lovely",ok:"Thank you",dislike:"…I'll give it a try"},
 tabtim:{love:"Oh! This is exactly what I wanted! Love it!",like:"Thanks! I'll use it every meal",ok:"Thanks a lot!",dislike:"…This one makes me sleepy. Thanks though"},
 alicia:{love:"…How did you know I like this? I'm not happy or anything. Just… thank you",like:"Not bad taste. Acceptable",ok:"Thank you",dislike:"I don't eat much of that. …But thanks"},
 chaba:{love:"……(She hugs it tight and looks away)",like:"…Like it",ok:"Thank you",dislike:"…Just leave it there"}};
for(const cid of Object.keys(RG_PROF)){RG_PROF[cid].age=18+stableHash(cid+"age")%13; /* the age she always had */if(typeof PROFILES!=="undefined"&&!PROFILES[cid])PROFILES[cid]=RG_PROF[cid];if(typeof GIFT_PREF!=="undefined"&&!GIFT_PREF[cid])GIFT_PREF[cid]=RG_GPREF[cid];
  if(typeof GIFT_LINES!=="undefined"&&!GIFT_LINES[cid])GIFT_LINES[cid]=RG_GLINES[cid];if(typeof SOUV_LOVE!=="undefined"&&!SOUV_LOVE[cid])SOUV_LOVE[cid]=RG_GPREF[cid].love.filter(g=>GIFTS[g]&&GIFTS[g].souv);}
/* the girl closest to you who notices a champion lover while you are with her */
const RG_TWO={kati:"Coach… I've heard already. I don't have to ask, but it's not like I don't know",mali:"Mali saw who was holding whose hand last night… Mali isn't crying. Not crying",
 baibua:"…I've seen it. I don't have to ask, but my heart isn't blind",tabtim:"Manager… I'm not stupid, you know. I see it. I just don't say it",alicia:"I'm not blind. …I just haven't decided how angry to be",chaba:"…Seen it",
 rin:"Lately the hours you disappear don't match the schedule. I've logged it. I don't need an explanation, I just want you to know that I know",ploy:"…Don't say it. I've seen it",fah:"Hey! You think Fah's blind?! …Don't answer. Fah's going to train"};
Object.assign(REGION,{
  /* v1.91.30 (Man): champions you know show in the Characters tab — before she moves in, her hearts follow your closeness with her */
  bondSync(G){const R=G.region;if(!R)return;for(const cid of Object.values(RG_CID0)){const f=G.F[cid];if(f&&!Number.isFinite(f.age)){delete f.ageAnchorWeek;delete f.age;if(typeof syncFighterAges==="function")syncFighterAges(G);}}for(const r of RG_ORDER){const cid=RG_CID0[r],f=G.F[cid];if(!f||(R.joined&&R.joined[cid]))continue;f.bond=rgBondOf((R.meet||{})[cid]);f.bondX=0;}},
  peopleIds(G){const R=G.region;if(!R)return [];return RG_ORDER.map(r=>RG_CID0[r]).filter(cid=>{const f=G.F[cid];return f&&((R.joined&&R.joined[cid]&&f.camp==="player")||f.met||((R.meet||{})[cid]>0));});},
  campOf(cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid);return r?{north:"Champion of the North",isan:"Champion of Isan",central:"Champion of the Central Plains",south:"Champion of the South"}[r]:"";},
  /* her move from her champion days, shown in the skill tab like a signature */
  perkCard(f){const r=f&&RG_ORDER.find(x=>RG_CID0[x]===f.id),R=G.region;if(!r||!R||!R.joined||!R.joined[f.id])return "";if(typeof TRAITS!=="undefined"&&TRAITS[f.id])return ""; /* v1.91.45: shown in the hidden-power box now */const P=RG_CH0[r].perk;
    return `<div class="sigcard on rg-perk"><b>✦ Signature trait: ${esc(P.name)}</b><p class="meta">${esc(P.desc)} · hers since she was champion of ${esc(RG0[r].name)} · works in every fight, no skill slot needed</p>${typeof traitLvRow==="function"&&G.F[f.id]&&G.F[f.id].camp==="player"?traitLvRow(f,true):""}</div>`;},
  joinRooms(G){const R=G.region,J=R.joined||{};return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player").length+Object.keys(J).filter(c=>G.F[c]&&G.F[c].camp==="player").length;},
  /* the champion's skill tree is her lineage's — the partner girl's tree (Tha Sao / Korat / Lopburi / Chaiya) */
  /* v1.91.45: each champion's second hidden power (the first is the signature perk she brought as a champion) */
  /* v1.91.45 (Man): every champion has her tree from the start — as a rival she fights with skills learned along her own line, and the same tree comes with her when she joins */
  treeInit(){for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(typeof REQ_ALIAS!=="undefined")REQ_ALIAS[cid]=pr;
      {const P=RG_CH0[r].perk,T2=RG_TRAIT2[cid];if(typeof TRAITS!=="undefined"&&P&&T2&&!TRAITS[cid])TRAITS[cid]=[{id:"rgp_"+cid,name:P.name,desc:P.desc,fx:P.fx},{id:"rg2_"+cid,...T2}];}
      if((!SKILLS[cid]||SKILLS[cid]===SKILLS[pr])&&SKILLS[pr]){const C=RG_CAP[cid]||{};SKILLS[cid]=SKILLS[pr].map(s=>{const c=C[s.id];if(!c)return s;const [id,name,desc,ad]=c;return {...s,id,name,desc,fx:r=>rgFxAdd(s.fx(r),ad(r))};});}}},
  /* fresh build along her home line: 3 points a level, home line first, then build lines, then the rest */
  autoLearn(G,cid){const f=G.F[cid];if(!f)return;f.skills={};f.equip=[];f.sp=3*Math.max(0,(f.lvl||1)-1);const L=RG_HOME_LINE[cid],ord=[...skillList(cid)].sort((x,y)=>((x.line===L?0:x.school==="build"?1:2)-(y.line===L?0:y.school==="build"?1:2)));
    let go=true;for(let i=0;go&&f.sp>0&&i<400;i++){go=false;for(const sk of ord){if(f.sp>0&&learnSkill(G,cid,sk.id)){go=true;break;}}}},
  joinSkills(G){this.treeInit();const J=(G.region&&G.region.joined)||{};for(const r of RG_ORDER){const cid=RG_CID0[r],pr=RG_CH0[r].pair;if(!J[cid])continue;
      {const g=G.F&&G.F[cid];if(g&&g.trLv==null){g.trLv=3;g.trBase=3;}} /* v1.91.45 (Man): same standard as the main five — two hidden powers to switch, 10 levels at 5 points; a champion arrives at Lv.3 (her full champion strength) */
    /* v1.91.43 (Man): same roots as her lineage partner, but the Lv.42 legend tips are her own — new name, her story, plus a small signature bonus */
    {const f=G.F&&G.F[cid],C=RG_CAP[cid]||{};if(f)for(const o in C){const n=C[o][0];if(f.skills&&f.skills[o]){f.skills[n]=(f.skills[n]||0)+f.skills[o];delete f.skills[o];}if(Array.isArray(f.equip))f.equip=f.equip.map(x=>x===o?n:x);}}
    /* v1.91.38: in the camp she fights like a main-cast fighter on her lineage's lines — her own home line, the line's style, the same per-line balance as her partner */
    if(typeof HOME_STYLE!=="undefined"&&!HOME_STYLE[cid]){const L=RG_HOME_LINE[cid],sch=(SKILLS[pr]||[]).find(s=>s.school&&s.school!=="build");HOME_LINE[cid]=L;HOME_STYLE[cid]=((LINE_STYLE[sch&&sch.school]||[])[L])||HOME_STYLE[pr];if(LINE_K[pr]&&!LINE_K[cid])LINE_K[cid]=LINE_K[pr];}}},
  joinWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||!F.won||now<(F.wonAbs||0)+3)return;R.joined=R.joined||{};R.offers=R.offers||[];R.joinQ=R.joinQ||[];R.offers=R.offers.filter(c=>!R.joined[c]);R.joinQ=R.joinQ.filter(c=>!R.joined[c]&&!(R.joinPend&&R.joinPend.cid===c));
    const m=R.meet||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&!(R.champ[r]&&R.champ[r].state==="won"))continue;if(!R.joined[cid]&&!(R.joinPend&&R.joinPend.cid===cid)&&!R.offers.includes(cid)&&!R.joinQ.includes(cid)&&!(R.joinGone||{})[cid]&&(m[cid]||0)>=RG_JOIN_MIN)R.joinQ.push(cid);}
    R.joinQ.sort((a,b)=>(m[b]||0)-(m[a]||0));
    if(R.joinQ.length&&now>=(R.joinNext||0)){const cid=R.joinQ.shift(),r=RG_ORDER.find(x=>RG_CID0[x]===cid);R.offers.push(cid);R.joinNext=now+RG_JOIN_GAP;
      rgSay(G,r,`Application from ${RG[r].champ}`,RG_JOIN[cid].letter+`

(Contract: signing fee ${fmt(RG_JOIN_FEE)} · wage ${fmt(RG_JOIN_WAGE)}/week · trait: ${RG_TRAIT[cid].name} · she will need rebuilding: 5 levels lower, slightly lower stats · see the contract on the Camp page › Coaches & Fighters)`);}},
  joinOk(G,cid){const R=G.region;if(!R.offers||!R.offers.includes(cid)||(R.joined&&R.joined[cid]))return "No such contract";if(R.joinPend)return "Wait for the one who already said yes to move in first";{const r=RG_ORDER.find(x=>RG_CID0[x]===cid);if(rgEd(G)>=2&&!(R.nc&&R.nc[r])&&R.champ[r]&&R.champ[r].state!=="won")return "She is defending her regional title · win this edition's cup first";}
    if(this.joinRooms(G)>=dormRooms(G))return `Rooms full (${dormRooms(G)} rooms) · upgrade the dorm first`;if(G.cash<RG_JOIN_FEE)return `Not enough cash · signing fee ${fmt(RG_JOIN_FEE)}`;return "";},
  joinAccept(G,cid){const why=this.joinOk(G,cid);if(why){toast(why);return;}const R=G.region;G.cash-=RG_JOIN_FEE;R.offers=R.offers.filter(x=>x!==cid);R.joinPend={cid,abs:gameWeek(G)+1};
    G.log=G.log||[];G.log.push(`Signed a contract with ${G.F[cid]?G.F[cid].name:cid} · signing fee ${fmt(RG_JOIN_FEE)} · moves in next week`);toast(`Contract signed · ${G.F[cid]?G.F[cid].name:""} moves in next week`);},
  joinApply(G,cid){if(G.region.joined&&G.region.joined[cid])return; /* v1.91.35: never twice */const R=G.region,r=RG_ORDER.find(x=>RG_CID0[x]===cid),f=G.F[cid]||this.champFighter(G,r),pair=G.F[RG_CH[r].pair],now=gameWeek(G);
    f.camp="player";f.canon=true;f.met=true;f.div=(pair&&(pair.div==="A"||pair.div==="B"))?pair.div:"A";
    f.lvl=Math.max(10,(f.rgSkLv||f.lvl||14)-RG_JOIN_LVDROP);for(const k in f.a)f.a[k]=Math.round(Math.min(20,f.a[k])*RG_JOIN_STAT*10)/10;f.vet=0; /* v1.91.45 (Man): she has to be rebuilt — level −5, stats ×0.9, ring craft stays behind */
    f.spv=2;f.xp=0;f.wage=RG_JOIN_WAGE;f.fee=0;f.potential=20;f.fatigue=0;f.injury=0;f.morale=80;f.trust=Math.max(f.trust||0,50);
    f.bond=Math.max(f.bond||0,Math.max(30,rgBondOf(R.meet[cid])));f.joinAbs=now;f.lastTouch=absWeek(G);delete f.rgKey;delete f.rgT;delete f.rgSty;
    G.rank=G.rank||{A:{},B:{}};G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
    (R.joined=R.joined||{})[cid]=now;this.joinSkills(G);
    /* v1.91.39 (Man): she arrives with her skills already learned along her own line, like a fighter who has been building for years — the player can look and reset */
    this.autoLearn(G,cid);delete f.rgSkLv;if(typeof syncFighterAges==="function")syncFighterAges(G);
    G.log=G.log||[];G.log.push(`${f.name} moves into Sirichai Camp · Lv.${f.lvl} · skill points ${f.sp}`);},
  joinSteps(G,cid){const r=RG_ORDER.find(x=>RG_CID0[x]===cid),J=RG_JOIN[cid],pid=RG_CH[r].pair,pf=G.F[pid],top=typeof rgTopGirl==="function"?rgTopGirl(G):null;
    const S=[...J.leave,{n:"nar",t:"This week, Sirichai Camp has a new member"},...J.arrive];
    if(pf&&pf.camp==="player")S.push({n:pid,f:"happy",l:"casual",t:J.pair},{n:cid,f:"happy",l:"casual",t:J.pairBack});
    else S.push({n:"coach",t:`The room at the end of the hall is free. ${RG[r].champ} takes that room. Dinner at six sharp. Late means no side dishes`});
    if(top&&top.id!==pid)S.push({n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,RG[r].champ)});
    S.push({n:"nar",t:`${RG[r].champ} has joined the camp · train, fight and spend time together from the Battle of the Four Regions page · she gets skill points in the same lineage as ${pf?pf.name:"her lineage partner"}`});return S;},
  /* romance: one-love or two-timing, never the harem team */
  isLovC(G,cid){const L=G.region&&G.region.lov;return !!(L&&L[cid]!=null);},
  confDue(G){const R=G.region,J=R.joined||{},now=gameWeek(G);R.confN=R.confN||{};R.confNo=R.confNo||{};
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||this.isLovC(G,cid)||(R.ex&&R.ex[cid]!=null)||isAway(G,cid))continue;
      if((f.bond||0)<75||now-(J[cid]||now)<6||(R.confN[cid]||0)>=3||noCnt(G,cid)>=LOVE_ASK_MAX)continue;if(R.confNo[cid]!=null&&now-R.confNo[cid]<13)continue;return cid;}return null;},
  confSteps(G,cid){const J=RG_JOIN[cid],R=G.region,two=partners(G).length>0||Object.keys(R.lov||{}).some(k=>k!==cid);R.confN[cid]=(R.confN[cid]||0)+1;
    const warn=two?[{n:"nar",t:"⚠ You already have someone. Saying yes means two-timing… a regional champion can't join the harem team"}]:[];
    return [...J.conf(G),...warn,{n:"nar",t:"She waits for your answer",choice:[
      {t:two?"\"I like you too\" (two-timing)":"\"I like you too\"",fx:G2=>REGION.takeC(G2,cid),then:[{n:cid,f:"happy",l:"casual",t:J.yes(G)}]},
      {t:"\"Let's stay like this for now\"",fx:G2=>{G2.region.confNo[cid]=gameWeek(G2);add(G2,cid,"trust",3);befriend(G2,cid);},then:[{n:cid,f:"sad",l:"casual",t:J.no}]}]}];}, /* v1.91.68: counts toward the one love rule (3 asks → steps back → reaches out once) */
  takeC(G,cid){const R=G.region,now=gameWeek(G);R.lov=R.lov||{};const P=[...partners(G),...Object.keys(R.lov).filter(k=>k!==cid&&G.F[k])];R.lov[cid]=now;if(P.length&&G.mono)delete G.mono;if(R.ex)delete R.ex[cid];const f=G.F[cid];if(f)f.morale=Math.min(100,(f.morale||0)+15);
    if(P.length){const top=P.map(k=>G.F[k]).filter(Boolean).sort((a,b)=>((b.bond||0)+(b.bondX||0))-((a.bond||0)+(a.bondX||0)))[0];if(top)R.twoQ={id:top.id,cid,abs:now+3};}
    G.log=G.log||[];G.log.push(`${f?f.name:cid} and the Manager started dating ${P.length?" (two-timing)":""}`);},
  breakC(G,cid){const R=G.region,f=G.F[cid];if(!this.isLovC(G,cid))return;delete R.lov[cid];(R.ex=R.ex||{})[cid]=gameWeek(G);if(R.twoQ&&R.twoQ.cid===cid)delete R.twoQ;if(f)add(G,cid,"bond",-35);},
  hangC(G,cid){const f=G.F[cid];if(!f||G.freeUsed||isAway(G,cid))return;if(typeof hospDue==="function"&&hospDue(G,cid)){const st=hospScene(G,cid);save();playScene(st,()=>{save();render();},{bg:"hospital",look:"casual"});return;}const J=RG_JOIN[cid],R=G.region;R.hangI=R.hangI||{};const i=R.hangI[cid]||0,lov=this.isLovC(G,cid);
    R.hangF=R.hangF||{};const H=[...J.hang,...(RG_HANG2[cid]||[])],A=RG_AGAIN[cid]||J.hang;if(R.hangF[cid]==null)R.hangF[cid]=Math.min(Math.ceil(i/(lov?2:1)),J.hang.length);
    let P;if(lov&&i%2===1)P=J.love;else if(R.hangF[cid]<H.length)P=H[R.hangF[cid]++];else{R.hangAI=R.hangAI||{};P=A[(R.hangAI[cid]=(R.hangAI[cid]||0)+1)%A.length];}R.hangI[cid]=i+1;G.freeUsed=true;f.hangWk=G.week;
    const S=P.map(x=>x.choice?{...x,choice:x.choice.map(o=>({t:o.t,fx:G2=>{add(G2,cid,"bond",o.b);add(G2,cid,"morale",3);},then:o.then}))}:{...x});
    if(!S.some(x=>x.choice))S.push({fx:G2=>{add(G2,cid,"bond",5);add(G2,cid,"morale",3);}});
    save();playScene(S,()=>{save();render();},{bg:"camp",look:"casual"});},
  /* v1.91.30 (Man): contracts show where every contract shows (camp › trainers & fighters); the champions who moved in live in the Characters tab */
  joinCard(G){const R=G.region;return R&&R.joinPend&&G.F[R.joinPend.cid]?`<section class="px card rg-join"><p class="meta">🏠 ${esc(G.F[R.joinPend.cid].name)} is on her way · arrives at camp next week</p></section>`:"";},
  recruitHTML(G){const R=G.region,offers=(R&&R.offers||[]).filter(cid=>G.F[cid]);if(!offers.length)return "";
    return `<section class="px card recruit rg-recruit"><h3><span class="newb">NEW!</span> A regional champion wants to join</h3>${offers.map(cid=>{const f=G.F[cid],r=RG_ORDER.find(x=>RG_CID0[x]===cid),T=RG_TRAIT[cid],why=this.joinOk(G,cid);
      return `<div class="rcard"><button class="rface" data-act="fighter" data-id="${cid}" aria-label="View info ${esc(f.name)}"><img src="${faceSrc(cid,"happy")}" alt=""></button>
       <div class="rinfo"><b>${esc(f.name)} <small>Champion of ${esc(RG[r].name)}</small></b><span class="meta">Trait <b class="goldt">${esc(T.name)}</b> · ${esc(T.desc)}</span><span class="meta">Signing fee ${fmt(RG_JOIN_FEE)} · wage ${fmt(RG_JOIN_WAGE)}/week · rooms ${this.joinRooms(G)}/${dormRooms(G)}</span>${why?`<span class="meta redt">${esc(why)}</span>`:""}</div>
       <div class="rbtns"><button class="btn sm" data-act="fighter" data-id="${cid}">Details</button><button class="btn sm gold" data-act="rgjoin" data-v="${cid}" ${why?"disabled":""}>Sign</button></div></div>`;}).join("")}
     <p class="meta">A new camp takes some settling in · she arrives 5 levels lower with slightly lower stats, to be built up again here (her hidden power and trait come in full) · no need to answer now, the contract will wait</p></section>`;},
  /* the camp-wide side of each champion's trait, once a week */
  joinPerks(G){const J=(G.region&&G.region.joined)||{},mine=roster(G);
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||isAway(G,cid))continue;
      if(cid==="baibua")for(const x of mine)if(x.id!==cid){const cap=stCap(x);for(const k of ["elbow","counter"])if(x.a[k]<17)x.a[k]=Math.min(cap,Math.round((x.a[k]+.04)*100)/100);} /* she teaches the ones still learning */
      if(cid==="tabtim")for(const x of mine)x.morale=Math.min(100,(x.morale||0)+2);
      if(cid==="alicia"){const v=Math.round((1500+Math.min(G.rep||0,60)*60)/100)*100;G.cash+=v;G.rep=Math.round(((G.rep||0)+.05)*100)/100;G.log=G.log||[];G.log.push(`Alicia streams training with the camp · ad income ${fmt(v)}`);}
      if(cid==="chaba")for(const x of mine)if(x.injury>0)x.injury=Math.max(0,x.injury-1);}},

});
if(typeof ACT!=="undefined")Object.assign(ACT,{
  rgjoin:d=>{REGION.joinAccept(G,d.v);save();render();},
  rghang:d=>REGION.hangC(G,d.v),
  rgbreak:d=>{if(!REGION.isLovC(G,d.v))return;UI.modal={type:"rgbreak",cid:d.v};render();},
  rgbreakgo:d=>{const cid=d.v,J=RG_JOIN[cid];UI.modal=null;if(!REGION.isLovC(G,cid))return;REGION.breakC(G,cid);
    playScene([{n:cid,f:"sad",l:"casual",t:J.bye},{n:"nar",t:`${G.F[cid].name} and the manager have broken up · she stays at the camp`}],()=>{save();render();},{bg:"camp_night",look:"casual"});},
});
if(typeof XMODAL!=="undefined")XMODAL.rgbreak=m=>({body:`<h2>Break up with ${esc(G.F[m.cid].name)}?</h2><p>Your closeness drops a lot · she stays at the camp, but she won't confess again</p><div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rgbreakgo" data-v="${m.cid}">Break up</button></div>`,foot:false});
/* ---------- v1.91.34 the Four Regions every 3 years (Man) ----------
   · a new edition opens 3 years after the last one began (the first needs its underground final won), never mid-trip or mid-series
   · province champions are decided by the bots: a 4-woman bracket per province (last edition's holder + 3 challengers), real quick fights — whoever wins holds the belt, each with her own history
   · a regional champion still at her own camp returns stronger; one who moved in to Sirichai is replaced by a new champion (a bracket of the four province runners-up)
   · regional champion data is swapped into the shared tables (RG / RG_CID / champId / RG_CH) per save by rgApply */
const RG_LOOP={wk:156,rest:26,eb:.2,cb:.3,nb:.15,cap:3};
const RG_CH0={...RG_CH};
const RG_FN=["Daoruang","Praewa","Khwanjai","Nilubon","Amphan","Rungnapha","Janpen","Butsaba","Lamduan","Prakai","Mukda","Thongkwao","Pikul","Kalong","Leelawadee","Ketkaew","Saimai","Namkhang","Kaewta","Baitoey","Maprang","Pomelo","Buaphan","Champa","Chomphu","Phakakrong","Rerai","Parichat","Bunga","Anchan","Dala","Ratri","Fueangfa","Phutson","Yihup","Karaket","Soithong","Nuanchan"];
const RG_PRE=["Sor.","Sit ","Luk "];
const RG_PL={chiangrai:["Chiang Saen","Doi Tung","Mae Chan"],nan:["Pua","Bo Kluea","Wiang Sa"],uttaradit:["Laplae","Tha Pla","Phichai"],lampang:["Ko Kha","Chae Hom","Thoen"],
 udon:["Kumphawapi","Ban Chiang","Nong Han"],khonkaen:["Phu Wiang","Chum Phae","Nam Phong"],buriram:["Nang Rong","Prakhon Chai","Lam Plai Mat"],ubon:["Phibun","Khong Chiam","Warin"],
 lopburi:["Ban Mi","Tha Wung","Khok Samrong"],suphan:["U Thong","Song Phi Nong","Bang Pla Ma"],phetchaburi:["Cha-am","Ban Lat","Tha Yang"],chanthaburi:["Tha Mai","Khlung","Laem Sing"],
 chumphon:["Lang Suan","Pak Nam","Tha Sae"],surat:["Don Sak","Ko Samui","Phunphin"],nakhonsi:["Pak Phanang","Thung Song","Khanom"],songkhla:["Sathing Phra","Ranot","Chana"]};
const RG_FN_EN=["Daoruang", "Praewa", "Khwanjai", "Nilubon", "Amphan", "Rungnapha", "Janpen", "Butsaba", "Lamduan", "Prakai", "Mukda", "Thongkwao", "Phikun", "Kalong", "Leelawadee", "Ketkaew", "Saimai", "Namkhang", "Kaewta", "Baitoey", "Maprang", "Som-o", "Buaphan", "Champa", "Chomphu", "Phakakrong", "Rerai", "Parichat", "Bunga", "Anchan", "Dala", "Ratri", "Fueangfa", "Phutson", "Yihup", "Karaket", "Soithong", "Nuanchan"],RG_PRE_EN=["Sor.","Sit ","Luk "],RG_PL_EN={chiangrai: ["Chiang Saen", "Doi Tung", "Mae Chan"], "nan": ["Pua", "Bo Kluea", "Wiang Sa"], "uttaradit": ["Laplae", "Tha Pla", "Phichai"], "lampang": ["Ko Kha", "Chae Hom", "Thoen"], "udon": ["Kumphawapi", "Ban Chiang", "Nong Han"], "khonkaen": ["Phu Wiang", "Chum Phae", "Nam Phong"], "buriram": ["Nang Rong", "Prakhon Chai", "Lam Plai Mat"], "ubon": ["Phibun", "Khong Chiam", "Warin"], "lopburi": ["Ban Mi", "Tha Wung", "Khok Samrong"], "suphan": ["U Thong", "Song Phi Nong", "Bang Pla Ma"], "phetchaburi": ["Cha-am", "Ban Lat", "Tha Yang"], "chanthaburi": ["Tha Mai", "Khlung", "Laem Sing"], "chumphon": ["Lang Suan", "Pak Nam", "Tha Sae"], "surat": ["Don Sak", "Ko Samui", "Phunphin"], "nakhonsi": ["Pak Phanang", "Thung Song", "Khanom"], "songkhla": ["Sathing Phra", "Ranot", "Chana"]};
const RG_TR=["A farmer's daughter who practises kicks on rice sacks in the granary","School track athlete who switched to Muay Thai at sixteen","Her father referees temple-fair bouts; she's watched fights since she can remember",
 "Sold meatballs outside the stadium every night until a camp owner asked her to try fighting","Fights to put two younger siblings through school","Former provincial taekwondo team member, kicks hard but her range control is loose",
 "Runs up three hundred temple steps every morning","Drives deliveries by day, trains by night","Granddaughter of an old-school teacher, wears her grandfather's mongkhon",
 "Knocked out in round one of her first fight, never knocked out since","Nursing student who took half a year off to try for the belt","Trains with her twin sister in the same weight class",
 "Streams training daily to fifty regular viewers","Learned Muay Thai from phone clips before any camp took her","Works the factory night shift, then trains in the morning","Was the last regional champion's sparring partner"];
const RG_NK={north:["Elbow Queen of Lanna","Mountain Leopard","Twin Swords of Laplae"],isan:["Isan Kick Storm","Queen of Thung Kula","Golden Silk, Heavy Hands"],
 central:["Queen of the Chao Phraya","Diamond of Phetchaburi","Golden Monkey of Lopburi"],south:["Andaman Giant Wave","Southern Sea Hawk","Samui Storm"]};
const RG_NFX={north:{name:"Mountain Elbow",desc:"Counters +4% · elbows +10%",fx:{ctr:.04,dmg:{elbow:.1}}},isan:{name:"Open-Field Kick",desc:"Kicks +3% accuracy · +8% power",fx:{hit:{kick:.03},dmg:{kick:.08}}},
 central:{name:"Chao Phraya Fist",desc:"Punches +10% · better inside defence",fx:{dmg:{punch:.1},clDef:1}},south:{name:"Breaking Wave",desc:"Evasion +1.5% · recovers stamina 10% faster",fx:{evade:.015,regen:.1}}};
/* a returning champion writes again */
const RG_RET={baibua:"Manager\n\nThe Battle of the Four Regions has come round again. I'm still the Northern champion\n\nI've trained my elbows every morning for three years without missing a day. This time I won't give in easily\n\nWaiting in Chiang Mai\n— Baibua",
 tabtim:"Manager!\n\nTabtim's back! The Isan cup is still in Korat. Whoever wants it can come take it\n\nI've kicked down a lot of banana trees these three years, haha. Come and see!\n\n— Tabtim",
 alicia:"To the manager\n\nThe Central cup is still mine. Don't be surprised\n\nFor three years I trained without turning the camera on once. This isn't content. Bring your best.\n\n— Alicia",
 chaba:"Manager\n\nThe cup's still in Phuket\n\nTrained three years. Didn't stop\n\nCome\n— Chaba"};
const rgEd=G=>(G.region&&G.region.edition)||1;
const rgEdB=(G,k)=>RG_LOOP[k]*Math.min(RG_LOOP.cap,rgEd(G)-1);
const rgEN=()=>typeof CUR_LANG!=="undefined"&&CUR_LANG==="en"; /* names and places are spelled, not translated */
const rgNm=(o,dest)=>{if(!o)return "";const e=rgEN(),N=e?RG_FN_EN:RG_FN,P=e?RG_PRE_EN:RG_PRE,L=e?RG_PL_EN:RG_PL;return `${N[o.f%N.length]} ${P[o.k%P.length]}${(L[dest]||L.chiangrai)[o.p%3]}`;};
/* swap this save's regional champions into the shared tables (idempotent) */
function rgApply(G){const R=G&&G.region,key=R?`${rgEd(G)}|${JSON.stringify(R.nc||{})}`:"-";if(rgApply.k===key&&rgApply.g===G)return;rgApply.k=key;rgApply.g=G;
  for(const r of RG_ORDER){const N=R&&R.nc&&R.nc[r],ret=!N&&rgEd(G)>=2;
    RG[r].champ=N?rgNm(N,N.home):RG0[r].champ;RG[r].nick=N?RG_NK[r][N.nk%3]:RG0[r].nick;
    RG_CID[r]=REGION.champId[r]=N?N.id:RG_CID0[r];
    RG_CH[r]=N?REGION.genH(r,N):ret?Object.assign({},RG_CH0[r],{letter:RG_RET[RG_CID0[r]]||RG_CH0[r].letter,cup:(G2,J)=>REGION.genCup(G2,r,J)}):RG_CH0[r];}}
Object.assign(REGION,{
  spk(r,f,l){const N=G.region&&G.region.nc&&G.region.nc[r];return N?{n:"npc",who:RG[r].champ}:{n:this.champId[r],f,l};},
  /* a new champion who has no art of her own speaks as an NPC */
  genH(r,N){const H0=RG_CH0[r],nm=rgNm(N,N.home),S=(t)=>({n:"npc",who:nm,t}),P=RG_NFX[r];
    return {ring:H0.ring,venue:H0.venue,pair:null,nightBg:H0.nightBg,perk:P,sty:H0.sty,reply:H0.reply,pairLine:H0.reply,
      letter:`Dear Manager of Sirichai Camp

I'm ${nm}, the new champion of ${RG0[r].name}. I hear your camp has collected all four provincial belts

The last champion moved to your camp. I want to know if she chose right

I'll be waiting at ${H0.venue}\n— ${nm}`,
      again:`Manager

The cup is still mine. Send a fighter again whenever you're ready

— ${nm}`,wait:`No problem. Heal up first — ${nm}`,
      pre:[n=>`${n}… I've watched every tape of your camp. Nothing will surprise me today`,n=>`I've changed my plan for this one. Try to keep up`,n=>`Last bout. Let's see who wants the cup more`],
      win:["Thanks for the fight. I won't slip next time","Not over yet","…"],lose:["As good as they say","I won't give the last bout away easily","…"],
      lost:()=>[S("The cup stays with me… but your camp just made me train a lot harder"),{n:"coach",t:"It's not over. Wait for the next challenge letter"}],
      cup:(G2,J)=>this.genCup(G2,r,J),night:()=>[]};},
  genCup(G2,r,J){const R=G2.region,me=G2.F[R.champ[r].fid],ed=rgEd(G2),n=(R.hall||[]).filter(h=>h.k==="cup"&&h.r===r).length+1,top=typeof rgTopGirl==="function"?rgTopGirl(G2):null;
    const who=this.spk(r,"happy","fight");
    return [{n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me?me.name:""}`},{n:"nar",t:`${RG_TITLE[r]}, Edition ${ed} · ${J.w}-${J.l}`},
      {n:"npc",who:"MC",img:"gala_mc_hype",t:`Ladies and gentlemen! The champion's cup of ${RG0[r].name}, Edition ${ed} is… ${me?me.name:""} of Sirichai Gym!`},
      {...who,t:R.nc&&R.nc[r]?"Congratulations. Sirichai Camp really is as strong as they say":"…Lost again, but I went further this time. Congratulations"},
      ...(top?[{n:top.id,f:"happy",l:"fight",t:"You're the best! Another cup for our camp!"}]:[]),
      {n:"coach",t:`This region's cup no. ${n} for the camp… Grandpa Chai wouldn't believe his eyes`}];},
  /* the bots' own tournament for one province: 4 entrants, semis + final, real quick fights */
  bracket(G,seed,ents,tag){const rng=mulberry32(seed),mk=(e,i)=>{const id=`rgb_${tag}_${i}`,f=baseFighter(id,mkNPC(id,"x","X",Math.round(14+e.s*3),mulberry32(seed+i*977),1+i%5));f.lvl=18+Math.round(e.s*6);return f;};
    const F=ents.map(mk),bout=(a,b,k)=>{const Q=quickFight(F[a],F[b],seed+k*131,3),w=Q.result.win==="A"?a:Q.result.win==="B"?b:(rng()<.5?a:b),rt=Q.result.type||"";
      return {w,l:w===a?b:a,m:Q.result.win==="D"||!(/KO|TKO/.test(rt)||Q.result.sub||Q.result.towel)?"pts":"ko",rd:Q.result.round||3};};
    const s1=bout(0,3,1),s2=bout(1,2,2),fi=bout(s1.w,s2.w,3);return {win:fi.w,ru:fi.l,path:[{o:s1.w===fi.w?s1.l:s2.l,m:(s1.w===fi.w?s1:s2).m,rd:(s1.w===fi.w?s1:s2).rd},{o:fi.l,m:fi.m,rd:fi.rd}]};},
  newEnt(rng,used,dest){let f;if(used.size>=RG_FN.length)used.clear();for(let i=0;i<80;i++){f=Math.floor(rng()*RG_FN.length);if(!used.has(f))break;}used.add(f);return {f,k:Math.floor(rng()*3),p:Math.floor(rng()*3),age:18+Math.floor(rng()*9),tr:Math.floor(rng()*RG_TR.length),s:rng()};},
  provTourney(G,ed){const R=G.region,out={},ru={},seed=(G.seed||1)*31+ed*7919;
    const used=new Set();for(const r of RG_ORDER)for(const dest of RG[r].prov){const rng=mulberry32(seed+stableHash(dest)),prev=R.pc&&R.pc[dest];
      const ents=[prev?{...prev,s:Math.min(1,.55+rng()*.4),def:1,age:(prev.age||22)+3}:null].filter(Boolean);if(prev)used.add(prev.f);while(ents.length<4)ents.push(this.newEnt(rng,used,dest));
      const B=this.bracket(G,seed+stableHash(dest),ents,dest),W=ents[B.win],L=ents[B.ru];
      out[dest]={f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,ed,reign:W.def?(prev.reign||1)+1:1,prev:prev&&!W.def?{f:prev.f,k:prev.k,p:prev.p}:null,
        path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p},m:x.m,rd:x.rd}))};
      ru[dest]={...L,s:L.s};}
    return {pc:out,ru};},
  /* the regional title left vacant by a champion who moved in: the four province runners-up fight for it */
  genChamp(G,r,ed,ru){const seed=(G.seed||1)*17+ed*104729+stableHash(r),ents=RG[r].prov.map(d=>({...ru[d],home:d}));
    const B=this.bracket(G,seed,ents,"c"+r),W=ents[B.win];
    return {id:`rgc_${r}_${ed}`,f:W.f,k:W.k,p:W.p,age:W.age,tr:W.tr,home:W.home,nk:Math.floor(mulberry32(seed)()*3),ed,
      path:B.path.map(x=>({o:{f:ents[x.o].f,k:ents[x.o].k,p:ents[x.o].p,home:ents[x.o].home},m:x.m,rd:x.rd}))};},
  oppName(G,dest){const P=G.region&&G.region.pc&&G.region.pc[dest];return P?rgNm(P,dest):RG_OPP[dest]||"Provincial champion";},
  mtxt(x){return x.m==="ko"?`Stoppage win (round ${x.rd})`:"Decision win";},
  histHTML(P,dest,title){const L=[`Age ${P.age} yrs · ${RG_TR[P.tr%RG_TR.length]}`,
      ...P.path.map((x,i)=>`${i?"Final":"Semifinal"}: ${rgNm(x.o,x.o.home||dest)} · ${this.mtxt(x)}`),
      P.reign>1?`Defended the title · reign ${P.reign}`:P.prev?`Dethroned the old champion ${rgNm(P.prev,dest)}`:""].filter(Boolean);
    return `<details class="rg-hist"><summary>${esc(title)}</summary>${L.map(t=>`<p class="meta">${esc(t)}</p>`).join("")}</details>`;},
  /* when the next edition opens (shown once this one is done) */
  nextEdTxt(G){const R=G.region,ed=rgEd(G),done=ed===1?(R.final&&R.final.won?(R.final.wonAbs||gameWeek(G)):null):R.edDone;if(done==null)return "";
    const abs=Math.max((R.startAbs||0)+RG_LOOP.wk,done+RG_LOOP.rest),y=Math.floor((abs-1)/52)+1,w=((abs-1)%52)+1;return ` · next edition: year ${y} week ${w}`;},
  loopWeekly(G){const R=G.region,now=gameWeek(G),ed=rgEd(G);
    if(ed===1&&!(R.final&&R.final.won))return;
    const doneAbs=ed===1?(R.final.wonAbs||now):R.edDone;
    if(ed>=2&&(R.cups||[]).length>=4&&!R.edDone){R.edDone=now;G.rep+=2;(R.hall=R.hall||[]).push({k:"ed",ed,season:G.season||1});G.log=G.log||[];G.log.push(`Battle of the Four Regions, Edition ${ed}: all 4 cups · fame +2`);}
    if(now<(R.startAbs||0)+RG_LOOP.wk||(doneAbs!=null&&now<doneAbs+RG_LOOP.rest))return;
    if(R.trip||RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")||R.joinPend)return;
    this.newEdition(G);},
  newEdition(G){const R=G.region,ed=rgEd(G)+1,now=gameWeek(G);
    for(const r of RG_ORDER)if((R.cups||[]).includes(r))(R.hall=R.hall||[]).push({k:"cup",r,ed:ed-1,season:G.season||1});
    const T=this.provTourney(G,ed);R.pc=T.pc;R.nc=R.nc||{};
    Object.assign(R,{edition:ed,startAbs:now,edDone:null,belts:Object.fromEntries(RG_ORDER.map(r=>[r,{}])),cups:[],trip:null,nextTripAbs:now+1});
    for(const r of RG_ORDER){const c0=RG_CID0[r],gone=R.joined&&R.joined[c0];
      if(gone)R.nc[r]=this.genChamp(G,r,ed,T.ru);else delete R.nc[r];
      R.champ[r]={state:"locked",fid:null,w:0,l:0,tries:0,visit:gone?"none":"done"};}
    rgApply.k=null;rgApply(G);
    const lines=RG_ORDER.map(r=>{const N=R.nc[r];return N?`${RG0[r].name}: ${rgNm(N,N.home)} "${RG_NK[r][N.nk%3]}" — new champion (${RG0[r].champ} has moved to Sirichai Camp)`:`${RG0[r].name}: ${RG0[r].champ} — the reigning champion, back and stronger`;}).join("\n");
    addMail(G,{kind:"letter",tone:"naka",from:"NAGA Energy Drink",title:`Invitation: Battle of the Four Regions, Edition ${ed}`,
      body:`Dear Manager of Sirichai Camp

The Battle of the Four Regions, Edition ${ed} is open · all 16 provincial belts were decided again in each province's own qualifier. The winners are the new provincial champions waiting for your camp

Regional champions
${lines}

Collect all four provincial belts, then challenge for the cup as before`});
    G.log=G.log||[];G.log.push(`Battle of the Four Regions, Edition ${ed} has begun`);},
});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);
/* v1.91.60 (Man): the closing ceremony's climax is a real cutscene — the hooded Ladda takes the four regional champions apart one by one on the ring (sprites, specials, effects), then the dialogue picks up */
const RG_SHOW=[
 {cid:"baibua",steps:[[200,"cap","Baibua is first into the ring, elbows up in the Tha Sao guard."],[900,"sp","A","baibua_special","Blooming Lotus Back Elbow"],[2400,"play","miss","A","elbow"],[2500,"cap","Ladda tilts her head. The elbow misses her chin by millimetres."],
   [3100,"sp","B","nl_ladda_sp_superman","Superman Punch"],[4500,"play","ko","B","punch"],[4600,"cap","Baibua drops in the middle of the ring before her guard comes up."]],end:6200},
 {cid:"tabtim",steps:[[200,"cap","Tabtim vaults the ropes before anyone can stop her."],[800,"sp","A","tabtim_special","Ruby Leaping Kick"],[2300,"play","miss","A","kick"],[2400,"cap","Ladda steps under the kick before the leg can fully extend."],
   [3000,"sp","B","nl_ladda_sp_headkick","Neck-Line Kick"],[4400,"play","ko","B","kick"],[4500,"cap","Tabtim spins in mid-air and crashes down in the corner."]],end:6000},
 {cid:"alicia",steps:[[200,"cap","Alicia raises a high guard. Not one camera dares to click."],[800,"sp","A","alicia_special","Princess Uppercut"],[2300,"play","miss","A","punch"],[2700,"play","miss","A","punch"],[3000,"cap","Ladda slips every punch, then vanishes behind her."],
   [3600,"play","takedown","B","punch"],[4500,"play","tap","B","punch"],[4700,"cap","A choke from behind… Alicia taps in five seconds."]],end:6300},
 {cid:"chaba",steps:[[200,"cap","Chaba charges in and never takes a single step back."],[700,"play","hit","A","punch"],[1100,"play","hit","A","punch"],[1500,"play","hit","A","elbow"],[1700,"cap","Ladda lets three shots land, backing up until the ropes are at her back…"],
   [2600,"sp","B","nl_ladda_sp_superman","Superman Punch"],[3900,"play","takedown","B","punch"],[4400,"play","gnp","B","punch"],[4800,"play","gnp","B","punch"],[5200,"play","ko","B","punch"],[5300,"cap","…then uses that same force to drag Chaba to the canvas."]],end:6800}];
Object.assign(REGION,{
  playClose(done){if(G.region){delete G.region.closeDare;delete G.region.closeFace;}const S=rgClose(G),i=S.findIndex(x=>x&&x.cut==="ladda"),a=i<0?S:S.slice(0,i+1),b=i<0?[]:S.slice(i+1),opt={bg:"closing_ceremony",look:"fight"}; /* v1.91.74 (Man): tense faces — the casual art has no shocked/sad face, the ring gear does */
    playScene(a,()=>{if(i<0){done();return;}this.laddaShow(()=>playScene(b,done,opt));},opt);},
  laddaShow(done){if(typeof document==="undefined"||typeof FS==="undefined"){done();return;}
    const old=document.getElementById("rg-show");if(old)old.remove();
    const el=document.createElement("div");el.id="rg-show";el.className="rg-show";
    el.innerHTML=`<div class="rgs-in"><canvas width="960" height="540"></canvas><div class="rgs-cap"></div><button class="btn sm rgs-skip">Skip scene ▸</button></div>`;document.body.appendChild(el);
    const cv=el.querySelector("canvas"),cap=el.querySelector(".rgs-cap"),T=[];let fin=false;
    const L={id:"nl_ladda_show",name:"Ladda",sprite:"nl_ladda_hood",canon:false,color:"#f2f2f7"};
    const end=()=>{if(fin)return;fin=true;T.forEach(clearTimeout);LOOPS.delete&&LOOPS.delete(FS.render);el.remove();FS.cv=null;done();};
    el.querySelector(".rgs-skip").onclick=()=>{AU.sfx&&AU.sfx("ui");end();};
    const champ=cid=>{const f=G.F[cid];return f?{...f,camp:f.camp==="player"?"rival":f.camp}:{id:cid,name:cid,canon:true};};
    ["nl_ladda_sp_superman","nl_ladda_sp_headkick"].forEach(n=>img(n+".webp"));
    let at=300;
    RG_SHOW.forEach((B,bi)=>{const t0=at;
      T.push(setTimeout(()=>{FS.init(cv,"bg_closing_ceremony.webp",champ(B.cid),L);FS.A.x=FS.A.base=330;FS.B.x=FS.B.base=630;if(bi===0){LOOPS.add(FS.render);startLoops();}AU.sfx&&AU.sfx("bell");},t0));
      B.steps.forEach(st=>T.push(setTimeout(()=>{const now=performance.now();
        if(st[1]==="cap")cap.textContent=st[2];
        else if(st[1]==="sp"){FS.special({side:st[2],mv:{img:st[3],noHit:st[2]==="A"}, /* v1.91.63: the champions' specials miss Ladda — no impact burst on her */name:st[4],head:st[2]==="B"?"Ladda":RG[RG_ORDER.find(r=>RG_CID0[r]===B.cid)].champ},0,now);AU.sfx&&AU.sfx(st[2]==="B"?"kd":"elbow");}
        else if(st[1]==="play"){FS.play({ev:st[2],side:st[3],w:st[4],crit:true},now);AU.sfx&&AU.sfx(st[2]==="miss"?"miss":st[2]==="ko"?"kd":st[4]||"punch");}},t0+st[0])));
      at+=B.end;});
    T.push(setTimeout(()=>{const now=performance.now();FS.init(cv,"bg_closing_ceremony.webp",champ("chaba"),L);FS.A.ko=true;FS.A.down=now-2000;FS.B.win=true;FS.B.anim="win";FS.B.x=FS.B.base=560;cap.textContent="Ladda stands alone in the middle of the ring. The white hood never slipped once.";},at));
    T.push(setTimeout(end,at+3200));}});

/* v1.91.47 (playtest): styles go in as soon as the chapter loads — the underground board opened before the regional tab was visited showed full-size portraits */
try{REGION.css();}catch(e){}

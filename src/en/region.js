// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"the North",champ:"Baibua",nick:"Thorned Lotus of Lanna",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"Isan",champ:"Tubtim",nick:"Isan's Ruby Master",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"the Central Plains",champ:"Alicia",nick:"Princess of the Muay Thai World",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"the South",champ:"Chaba",nick:"Storm Fist That Calms the Waves",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["White Temple Elbow","elbow",{dmg:{elbow:.10}}],nan:["Nan Longboat Knee","knee",{dmg:{knee:.10}}],uttaradit:["Broken-Sword Elbow of Phraya Phichai","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["Iron Horse Push Kick of Lampang","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["Red Lotus Bloom Kick","kick",{dmg:{kick:.10}}],khonkaen:["Silk-Weaver Knee of Khon Kaen","knee",{dmg:{knee:.08},regen:.06}],buriram:["Phanom Rung Lightning Punch","punch",{dmg:{punch:.10}}],ubon:["Candle Festival Elbow","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["Monkey Fools the Master Punch","punch",{dmg:{punch:.08},evade:.01}],suphan:["Suphan Master-Move Kick","kick",{dmg:{kick:.10}}],phetchaburi:["Khao Wang Knee of Phetchaburi","knee",{dmg:{knee:.10}}],chanthaburi:["Mangosteen Shell Punch","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["Swooping Gull Kick","kick",{dmg:{kick:.08},evade:.01}],surat:["Don Sak Oyster Shell Elbow","elbow",{dmg:{elbow:.10}}],nakhonsi:["Shadow Puppet Punch","punch",{dmg:{punch:.10}}],songkhla:["Samila Mermaid Kick","kick",{dmg:{kick:.08},regen:.06}]};
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
const RG_FIX={belt:n=>22.25+.65*Math.min(15,n)/15,champ:(cups,tries)=>23.11+.1067*Math.min(3,cups)-.15*Math.min(2,tries||0),nl:{nia:23.71,varya:25.1,meili:23.87,rosa:25.41,ladda:22.7}}; /* v1.91.13 (Man): set for a maxed fighter (Lv.32, every bonus, stat 20) — belts ~80% · series ~60% · Naka ~50% · Ladda ~40% */ /* v1.91.6: re-set after the heroine rebalance (v1.91.0–1.91.5), same targets, middle of the five home-line builds · v1.91.7: champions −0.35 after opponents got fixed styles */
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
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Northern Regional Cup of the Four Regions Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Khun Krerk hands over a golden cup in the middle of the ring. Hundreds of Yi Peng lanterns rise into the sky at once."},
   {n:"baibua",f:"happy",l:"fight",t:"Congratulations… Manager, tonight there's a place I'd like to take you… if you don't mind."},
   {n:"baibua",f:"flustered",l:"fight",t:"There's something I want to tell you… Um, never mind. Later is fine."},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Baibua")}]:[]),
   {n:"coach",t:"The camp's first regional cup… Grandpa Chai must be smiling."}];},
  night:(G,T)=>[
   {n:"nar",t:"At five in the morning Baibua is waiting outside the hotel on an old motorbike. You ride up Doi Suthep while the sky is still dark."},
   {n:"baibua",f:"happy",l:"casual",t:"This is my place. When Dad could still teach, he brought me to watch the mist every New Year."},
   {n:"nar",t:"A cold wind rises from the valley. Baibua unfolds a small teen-chok cloth and shares half of it over the Manager's shoulders."},
   {n:"baibua",f:"sad",l:"casual",t:"Dad hurt his knee and stopped teaching two years ago. Vector came to buy the camp. They said they'd pay for all his treatment."},
   {n:"baibua",f:"sad",l:"casual",t:"I haven't answered anyone… I don't dare tell Dad either. I'm scared he'll be hurt that his daughter can't carry the camp."},
   {n:"nar",t:"Baibua falls silent. Down in the valley, the lights of Chiang Mai go out one by one.",choice:[
     {t:"\"A small camp can stand on its own. Let ours be the example\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…That's Sirichai Camp. Everyone helps each other. I'm a little jealous."}]},
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
  reply:"I'm not giving in either.",pairLine:"Korat punches from a Bangkok girl. Real or not? See for yourself.",
  win:["Haha, awesome! But Tabtim takes the first one!","Just one more, okay? Tabtim's keeping the cup in Korat.","…"],
  lose:["Ow, that hurt a lot! You're really good. Tabtim'll get it back next time.","Haha… not funny any more. See you in the last bout.","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"Haha, the cup's still in Korat! But Sirichai Camp is fierce. Tabtim hurts all over."},{n:"tabtim",f:"flustered",l:"fight",t:"Come again, okay? Tabtim'll wait… Not missing you or anything. Just want to fight again."},{n:"nar",t:"Tabtim waves so loudly the MC has to move the mic away."}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`The bell for the last round rings. The referee raises the arm of ${me.name} — the Isan title series ends ${J.w}-${J.l}`},
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Isan Regional Cup goes to… ${me.name} of Sirichai Gym!`},
   {n:"nar",t:"Tabtim runs over and hugs the Manager in the middle of the ring in front of everyone, so tight that Khun Krerk has to stand there holding the cup."},
   {n:"tabtim",f:"happy",l:"fight",t:"A loss is a loss! But I'm taking a hug back, okay? Haha… just a bit longer."},
   {n:"nar",t:"At the back, a dark-skinned middle-aged man stands still behind the crowd, nods once to Tabtim, then walks out."},
   {n:"tabtim",f:"flustered",l:"fight",t:"…Dad? Dad came to watch…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"Tubtim")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"That night the rocket festival by the Mekong is still going. Tabtim leads the Manager away from the crowd to the pier."},
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
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Central Regional Cup goes to… ${me.name} of Sirichai Gym!`},
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
   {n:"npc",who:"MC",t:`Ladies and gentlemen! The Southern Regional Cup goes to… ${me.name} of Sirichai Gym!`},
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
function rgTopGirl(G){const L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`Coach… ${champ} was standing a little close, wasn't she? I'm only noticing.`,mali:`Mali wants a hug too~ …Just kidding. (Not kidding.)`,
  rin:`The distance between the Manager and ${champ} just now was below the average for the whole night. Just data.`,ploy:`What's with the smiling… Nothing. I didn't say anything.`,fah:`Hey, ${champ}! The manager belongs to Sirichai Camp! …I mean, he's the camp's manager!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;if(v>0&&R.joined&&R.joined[cid]&&G.F[cid])add(G,cid,"bond",v);rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"Dear Manager,\n\nIt's getting cold in Chiang Mai, with mist every morning… I don't have any news, really. I just miss Sirichai Camp a little.\n\nCome up for a visit when you're free.\n— Baibua",
 isan:"Manager!\n\nWhere did you disappear to? Tabtim watches your camp's lives every day, but you're never on camera.\n\nMiss you! (Miss the camp, I mean, not you, haha)\n— Tabtim",
 central:"Hi,\n\nYour camp's clip views dropped a little. I checked for you. Not on purpose, it just came up.\n\nIf anything's going on… you could tell me sometimes.\n— Alicia",
 south:"…The waves are rough lately.\n\nNothing else.\n\n— Chaba"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined"){for(const d of Object.keys(RG_OPP))BGIMG["rgring_"+d]=d==="chanthaburi"?"bg_region_east.webp":`bg_ring_${d}.webp`; /* v1.91.14: the belt ceremony stays in the province's own ring */
Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",hotel_room:"bg_hotel_room.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});}
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  baibua:[{img:"baibua_special",w:"elbow",def:"Blooming Lotus Back Elbow"}],tabtim:[{img:"tabtim_special",w:"kick",def:"Ruby Leaping Kick"}],
  alicia:[{img:"alicia_special",w:"punch",def:"Princess Uppercut"}],chaba:[{img:"chaba_special",w:"punch",def:"Storm Fist That Calms the Waves"}]});


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
  win:"Hahaha, Tabtim lost to a Bangkok girl at som tam! Don't tell my mum… Can I get a consolation prize?",lose:"Tabtim wins! Tonight Tabtim makes som tam for the whole camp."},
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
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const RG_CID0={...RG_CID}; /* v1.91.30: the four first champions — fixed, even when a later edition crowns someone new */
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
const rgIf=(ok,steps)=>ok?steps:[];
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
 {n:"npc",who:"MC",show:[{id:"tabtim",l:"casual"}],t:"The champion of Isan, Isan's ruby ace… Tabtim!"},
 {n:"tabtim",f:"happy",l:"casual",t:"Hello, everybody! The air-con is freezing, colder than Korat in winter! Hahaha!"},
 {n:"nar",t:"Tabtim laughs so loud the whole room laughs with her, but all the while she's quietly pacing out the width of the ring."},
 {n:"npc",who:"MC",show:[{id:"alicia",l:"casual"}],t:"The champion of the Central Plains, the princess of Muay Thai… Alicia!"},
 {n:"nar",t:"Camera flashes light up the whole room. Alicia smiles at every lens, one by one, without missing a single one."},
 {n:"alicia",f:"happy",l:"casual",t:"Thank you. Thank you, everyone. I'm not here for photos this year. I'm here to win."},
 {n:"npc",who:"MC",show:[{id:"chaba",l:"casual"}],t:"And the champion of the South, the Storm Fist that Calms the Waves… Chaba!"},
 {n:"chaba",f:"happy",l:"casual",t:"…I came to fight, not to talk."},
 {n:"nar",t:"The room goes silent for three seconds, then the MC hurriedly calls for applause."},
 {n:"nar",t:"Once the opening is over, the four champions step down from the stage and head straight for Sirichai's table.",choice:[
   {t:"Greet Baibua first",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"The real manager of Sirichai Camp… I watch your camp's fight lives every single time."}]},
   {t:"Greet Tabtim first",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Manager! Tabtim recognises you! Your camp's lives are so much fun!"}]},
   {t:"Greet Alicia first",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh, the camp everyone talks about. You look more ordinary than in the clips. …That's a compliment."}]},
   {t:"Greet Chaba first",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…Chaba."},{n:"nar",t:"Chaba nods once, then stays standing there longer than she needs to."}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"You're Kati, aren't you? Tha Sao, same as me… I've heard your name for a long time."},{n:"kati",f:"flustered",l:"casual",t:"I-I've heard of you too, Big sis Baibua! That reverse spinning elbow everyone talks about…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"Oh! So this is the Korat fist from a Bangkok girl. Tabtim wants to take one, just to see!"},{n:"ploy",f:"happy",l:"casual",t:"…If you want to try, get in the ring."}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"You're the one who read a fourteen-page contract before signing, right? That clip got more views than my fight clips."},{n:"rin",f:"happy",l:"casual",t:"Of course I read it. The small print at the end of a contract is usually the most expensive part."}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"Big sis Chaba!! It's you, isn't it! It's Mali! Little Mali from Chaiya!"},{n:"chaba",f:"happy",l:"casual",t:"…Wrong person."},
   {n:"nar",t:"Chaba turns and walks off, but Mali catches her ears turning red all the way down her neck."},{n:"mali",f:"sad",l:"casual",t:"…It's not the wrong person. Mali remembers."}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"Wait! Baibua has Kati, Tabtim has Ploy, Alicia has Rin, Chaba has Mali… and Fah?! Why doesn't Fah get a single style sibling!"},
   {n:"coach",t:"Then give your style a name yourself."}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"all four champions")}]:[]),
 {n:"npc",who:"MC",show:[],t:"And one more big announcement! Naga Energy presents a special guest camp that will fight in every region… Vector Camp, Bangkok!"},
 {n:"nar",t:ploy?"Pailin steps on stage in a white suit. Her eyes sweep the room and rest on Ploy a little longer than on anyone else.":"Pailin steps on stage in a white suit. Her eyes sweep the room and stop at Sirichai's table."},
 {n:"pailin",f:"happy",t:"Every camp in this room is already on my tablet. …Enjoy the trip."},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"Khun Krerk walks over and shakes Pailin's hand, patting her shoulder twice, like two people who have known each other far longer than anyone here knows."},
 {n:"nar",show:[],t:"The photographer calls every camp up for a group photo in front of the naga banner."},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"In the corner beside Khun Krerk, a woman in a white hood stands perfectly still. A lock of white hair with red tips falls out from under it. No one introduces her."},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"Her knuckles are taped like an MMA fighter's, not wrapped the Muay Thai way."},
 fah?{n:"fah",f:"flustered",l:"casual",t:"…Manager, the one in the hood is staring at Fah. It's giving me goosebumps."}:{n:"coach",t:"The one in the hood over there… stands like she's ready to fight at any second."},
 {n:"nar",show:[],t:"The camera flashes. When the light fades, that corner of the room is empty."},
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
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgIn(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`The camp's van stops for fuel at the last petrol station before ${D.name}. Mist still hangs low over the mountains.`},
  {n:"nar",t:"An old motorbike is parked in front of the coffee kiosk. A pink-haired girl stands hugging a big rattan basket."},
  {n:"baibua",f:"happy",l:"casual",t:"You're here, jao! I heard Sirichai Camp was coming up to collect the northern belts, so I rode out to wait for you."},
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
  {n:"coach",t:"The khao tom mat is better than the shop by the camp… don't tell Auntie Taew."},
  {n:"nar",t:"Baibua waves the van out of the petrol station, then follows on her motorbike all the way to the arena."}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgIn(G,"kati");return [
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
/* the week after the cup: her answer to Vector, in a letter */
const RG_POST={
 north:"Dear Manager of Sirichai Camp,\n\nI gave Vector my answer: Bua Tha Sao Camp is not for sale.\n\nDad asked where I found the courage. I told him, \"A small camp can stand on its own. Just look at Sirichai.\" He laughed for the first time in two years.\n\nThe cup is with Sirichai Camp now, but the heart of Tha Sao boxing is still here in Chiang Mai. Come up and visit Dad and me when you're free.\n\n— Baibua"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["The mist is so thick this morning, jao. Are you up yet, Manager?",[["Up already, about to watch the kids train.",1,"So hard-working, jao. I'm about to go train too."],["Not yet. I'm typing this with my eyes closed.",2,"Hehe, eyes closed and every word spelled right. Impressive, jao."],["Drive carefully in fog like this.",2,"…I'll be careful. Thank you for worrying about me."]]],
   ["Dad asked me to ask how long Sirichai Camp has been open, jao.",[["Since Grandpa Chai's time. Almost fifty years.",1,"Oh, Dad says that's older than Bua Tha Sao Camp, jao."],["I'll show you the old photos at the camp sometime.",2,"Really? I'll be waiting!"],["Why do you ask?",0,"Nothing, jao. Dad was just curious."]]],
   ["I have to go train now, jao… let's leave it here for now.",[["Go on, we'll talk after training.",2,"Yes! I'll message you as soon as I'm done."],["Don't overdo it.",1,"Yes, I always stretch first."],["OK",0,""]]]]},
  {id:"bb_dad",x:[
   ["Dad walked around the camp twice today, jao! The doctor says his knee is getting better.",[["That's great news!",1,"Thank you, jao. I was so happy I cried."],["Tell him the whole of Sirichai is cheering for him.",2,"I told him, jao. He smiled and said that camp has a kind heart."],["Don't let him overdo it.",1,"Yes. I walk right beside him the whole time."]]],
   ["Dad wants me to go back to school and stop fighting… what do you think, Manager?",[["Ask your own heart what you want first.",2,"…My heart wants to fight, jao. I already knew. I just wanted to hear someone say it."],["You could study and fight at the same time.",1,"Can I really? …I'll think about it."],["Your dad's right.",0,"…Yes. I'll think about it."]]],
   ["Thank you for listening, jao. I don't have many people to tell this to.",[["You can tell me anything.",2,"…Then I'll tell you things often. No getting annoyed."],["Always",1,"Yes, thank you, jao."],["No problem",0,""]]]]},
  {id:"bb_food",x:[
   ["I made a huge pot of gaeng hung lay, jao. Dad and I can't finish it.",[["Send some to the camp!",2,"Sure! I'll post it… can you post curry, jao?"],["That sounds delicious.",1,"It's so good, jao. My mum's recipe."],["Put it in the fridge.",0,"Yes, I was going to put it in there."]]],
   ["What's your favourite food, Manager?",[["Baibua's khao tom mat.",2,"…If you say that, I'll wrap them for you every week, jao."],["The chicken rice by the market.",1,"The one Kati likes? I'll go try it too."],["Anything",0,"Eating anything is good too, jao."]]],
   ["Next time you come up to Chiang Mai, I'll take you to a secret khao soi place.",[["Promise",2,"Promise! I've never taken anyone there."],["Bring the whole camp.",1,"Sure! But the shop only has two tables, hehe."],["If I'm free",0,"Yes, if you're free."]]]]},
  {id:"bb_elbow",x:[
   ["I practised the reverse spinning lotus elbow a hundred times today, jao. My arm's about to fall off.",[["Great work, but rest a little too.",2,"Yes… if someone tells me to rest, I'll rest, jao."],["Could you teach Kati too?",1,"Sure! But Kati has to teach me her moves too."],["A hundred isn't many.",0,"…You're stricter than my own teacher, jao."]]],
   ["Did you know, Manager? Dad came up with this elbow when he saw a lotus blooming in the temple pond.",[["Beautiful, just like Tha Sao boxing.",2,"Yes… Dad's boxing is truly beautiful. I want the whole country to see it."],["Do lotuses even have thorns?",1,"They don't! Other people started calling me that, I didn't choose it, hehe."],["Lotus flowers are nice.",0,""]]],
   ["If I ever meet Kati in the ring one day, who will you cheer for, jao?",[["Baibua, quietly.",2,"…Don't tell Kati, jao. I'll cheer for you quietly too."],["Both of you.",1,"Good answer, jao… I'd cheer for Kati too."],["Kati, obviously.",0,"Hehe, that's the right answer, jao."]]]]},
  {id:"bb_vector",x:[
   ["Vector wrote again, jao. They've raised their offer for the camp by another two hundred thousand.",[["Don't decide on your own yet.",2,"…Yes. I'll talk to you before I decide anything, every time."],["Bua Tha Sao Camp isn't for sale.",2,"That's exactly what Dad said, jao… I'm glad to hear someone else say it."],["Two hundred thousand is a lot.",0,"…Yes. I know."]]],
   ["Sometimes I think if I sold the camp, Dad could get his knee treated at a good hospital.",[["There are other ways. I'll help you look.",2,"…You're really thinking it through with me. Thank you, jao."],["I know how hard that is.",1,"Yes… thank you for understanding."],["It's one option.",0,""]]],
   ["Talking to you makes my heart feel lighter, jao… I don't know why.",[["Because you're not carrying it alone anymore.",2,"…Yes. I'm not carrying it alone anymore."],["Message me anytime.",1,"Yes! I'll message you often, jao."],["Good",0,""]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgIn(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"A straight road runs through the rice fields as far as the eye can see. Ahead, a motorbike sits smoking outside an abandoned petrol station, and a red-haired girl stands in the middle of the road waving with both arms."},
  {n:"tabtim",f:"happy",l:"casual",t:"Stop, stop, stop! Is this Sirichai Camp? It's Tabtim! Tabtim's bike just broke down. Give Tabtim a lift to the ring!"},
  {n:"nar",t:"Before anyone can answer, Tabtim opens the front door and climbs into the passenger seat as if it were hers."},
  {n:"tabtim",f:"happy",l:"casual",t:"Tabtim's sitting in front, car sick… not really car sick, just want to sit near you, haha. Joking, joking. Take Tabtim as your girlfriend. Joking again!",choice:[
    {t:"\"Joking twice means it's not a joke.\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…Whoa! You answered seriously. Tabtim's out of jokes now."}]},
    {t:"Laugh and keep driving",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"Haha, you're so calm. Tabtim likes calm people."}]},
    {t:"\"Put your seatbelt on.\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"Okay, okay… geez, Manager, you're so serious."}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"Tubtim")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"Hey! Is that Ploy in the back? The Korat fist from Bangkok! Tabtim's been wanting to take one since the gala!"},
    {n:"ploy",f:"pout",l:"casual",t:"…Face the front. You'll hurt your neck."}]),
  {n:"nar",bg:"somtam_stall",t:"Tabtim talks the whole way, then makes them stop at a roadside som tam stall. \"Best in the region, and Tabtim's paying!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`The champion of ${D.name} is from near Tabtim's home. She kicks hard but drops her left guard, so counter with a left kick.`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name} remembers Tabtim's tips · morale +3`:"Everyone remembers Tabtim's tips."},
  {n:"coach",t:"The som tam here is so spicy Kru's crying… but it's really good."},
  {n:"tabtim",f:"happy",l:"casual",t:"Let's go, everyone! Tabtim will cheer by the ring… not saying which side, haha."}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgIn(G,"ploy");return [
  {n:"nar",t:"Same night, same ring: on the undercard before our bout, a Vector Camp fighter wins by knockout in round two."},
  {n:"npc",who:"Vega",t:"The data said he'd raise his guard late in round two. …Data never lies."},
  ...(ploy?[
   {n:"npc",who:"Ringside gambler",t:"That Bangkok girl they say throws the Korat punch… is it real, or a copy?"},
   {n:"nar",t:"The people around them laugh. Ploy hears every word, but doesn't turn around."},
   {n:"pailin",f:"happy",t:"Ploy, come back to Vector. Nobody here sees you as Korat boxing. At Vector, you're the best data I've ever had."},
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
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgIn(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
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
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgIn(G,"mali");return mali?[
  {n:"nar",t:"The morning after the bout, Mali asks to stop in Chaiya. \"Mali's house is right on the way!\" In fact it's a forty-kilometre detour."},
  {n:"nar",t:"A two-storey wooden house by the sea. Three little siblings run out to hug Mali, and Mali's mum fills the platform with khao yam."},
  {n:"npc",who:"Mali's mom",t:"You're here! Eat first, my dear, everyone… oh, and why is that girl standing out front?"},
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
  ["Mali sends twenty messages a day.",[["Do you reply?",1,"I reply. …One a day."],["Mali waited ten years for you.",2,"…I know. I'll reply more. Two messages."],["Isn't that a lot?",0,"…Not too many."]]],
  ["Mali fights much better now. You teach well.",[["Mali's the talented one.",2,"…Same thing Mali says about you."],["Kru Daeng teaches her.",1,"Kru Daeng too."],["Thanks for the compliment.",0,"Mm."]]],
  ["Look after Mali.",[["I already am.",2,"…Trust you."],["Come and see her yourself sometimes.",1,"…Will come."],["Mali's grown up now.",0,"…Still a kid."]]]]},
 {id:"cb_naka",x:[
  ["Naka sent another contract.",[["Don't sign yet. Let Rin read it first.",2,"…Sent it to Rin. Twelve red marks."],["Is it a lot of money?",0,"…Don't care about money."],["If you don't want to sign, don't.",1,"Not signing."]]],
  ["Khun Krerk smiles all the time. …Don't like it.",[["People who smile all the time are the scariest.",2,"…You think so too."],["He seems kind.",0,"…No."],["Be careful.",1,"Being careful."]]],
  ["…Talked to you. Now I can sleep.",[["Then message me every night.",2,"…All right."],["What a lovely dream",1,"Mm. Good night."],["Go to sleep.",0,"…"]]]]}];
CHAT.chaba=RG_CHAT.chaba;
/* v1.90 round 9: the Central Plains in full — Alicia's live stream on the first trip, Lopburi's monkeys, the draft Naka League contract (Rin's story) at Suphan, a richer visit, her post after the cup and Alicia's chats. */
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgIn(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
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
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgIn(G,"fah");return [
  {n:"nar",t:"That evening the whole camp stops at Phra Prang Sam Yot to buy souvenirs. Before anyone's out of the van, a troop of monkeys leaps onto the roof, a dozen of them."},
  {n:"nar",t:"The biggest monkey snatches the whole bag of souvenir snacks, then sits on a lamppost unwrapping them in front of everyone."},
  fah?{n:"fah",f:"angry",l:"casual",t:"Hey! That's Fah's snack! Get down here right now, Fah'll kick you off that pole!"}:{n:"coach",t:"Don't try to get it back. It'll call fifty more of its friends."},
  {n:"nar",t:"Another monkey grabs the hand wraps drying behind the van, wraps them round its head like a fighter, and squares up at everyone."},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…Its guard is better than the new kids at camp."}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"Take a photo first! This clip is going straight on the camp page."}]:[]),
  {n:"coach",t:"Forget it… we'll come back for the wraps next year. It'll probably be Lopburi's champion by then."},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"Everyone laughs until their stomachs hurt · Everyone's morale +2 · One pair of hand wraps lost"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgIn(G,"rin");return rin?[
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
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["Double Leg","Hip Throw","Suplex"],subName:["Heel Hook","Kneebar"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"Double Leg",k:"td"},{id:"nl_suplex",name:"Suplex",k:"td"},{id:"nl_heelhook",name:"Heel Hook",k:"sub"}],
  spl:[{img:"nl_varya_special",def:"Suplex",td:1}],tip:"Big throws and leg locks · once she drags you down she never stops pounding"},
 meili:{name:"Meili Sae-Tang",nick:"Dragon of Yaowarat",art:"Kung Fu",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"Shadowless Kick",k:"atk",w:"kick"},{id:"nl_inch",name:"One-Inch Punch",k:"atk",w:"punch"},{id:"nl_crane",name:"Crane Stance",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"Shadowless Kick",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"One-Inch Punch",npc:1,p:.5}],tip:"Fast, long kicks · in close she's only half the fighter"},
 rosa:{name:"Corazón Rosa",nick:"Pink Heart",art:"Lucha Libre",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["Hurricanrana","DDT"],subName:["La Mística"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"Hurricanrana",k:"td"},{id:"nl_mistica",name:"La Mística",k:"sub"},{id:"nl_moonsault",name:"Moonsault",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"Hurricanrana",td:1}],tip:"Tireless and tough, loves a showy throw for the crowd · leaves her guard open a lot"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"Ladda",nick:"The Killing Machine of Women's Muay Thai",art:"MMA + Modern Muay Thai",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["Double Leg","Leg Grab"],subName:["Rear-Naked Choke","Guillotine"],pfx:{dmg:{elbow:.1},gnp:.15},
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
function nlFighter(G,k,me,p,ceil,leg){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
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
 {n:"npc",who:"Khun Krerk",t:"Two cups in a single tournament. I haven't seen a small camp like yours in a long time"},
 {n:"npc",who:"Khun Krerk",t:"I used to fight too. National team. That year I already had my Olympic ticket in hand"},
 {n:"npc",who:"Khun Krerk",t:"Three weeks before we left, the team van skidded on the road. My knee broke in three places. The doctor said I was lucky to walk at all"},
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
function rgCup3(G){const R=G.region,rin=rgIn(G,"rin"),ploy=rgIn(G,"ploy");return [
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
 {n:"pailin",t:"I didn't come to warn you. I just forgot my tablet here. You can send it back tomorrow"},
 {n:"nar",t:"Pailin walks back into the rain and never looks back"},
 {fx:()=>{R.c3="seen";}}];}
/* who in the camp the regional champion likes best: the one who says the camp's name at the ceremony */
const RG_CLOSE_SAY={baibua:"A small camp can stand tall. I saw it with my own eyes. Sirichai Camp",tabtim:"Sirichai Camp doesn't have much money, but they fight for each other with all their heart. Tabtim has seen it",
 alicia:"I want to fight the Sirichai way. Where nobody asks me to smile for the camera",chaba:"…I want to stay at a camp that fixes its own fence"};
/* after the fourth cup (or once the tournament has run its course): Naka League, the refusals, Ladda */
function rgClose(G){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin");
 const fav=["baibua","tabtim","alicia","chaba"].sort((a,b)=>((R.meet||{})[b]||0)-((R.meet||{})[a]||0))[0];
 return [
 {n:"nar",bg:"closing_ceremony",show:[{id:"npc:krerk"}],t:"The Four Regions Championship closing ceremony is held in Bangkok. The hall glows green and gold. On stage sits a long table with four golden pens laid out in a row"},
 {n:"npc",who:"Khun Krerk",t:"Thank you, every camp. This tournament convinced me of one thing: Muay Thai has to go further than temple-fair rings"},
 {n:"npc",who:"Khun Krerk",t:"Introducing… Naka League! The country's first all-round fighting league. Muay Thai, boxing, MMA, every discipline on one stage"},
 {n:"npc",who:"Khun Krerk",t:"And the first four fighters I'd like to invite are the four regional champions. Please come up and sign on stage"},
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"Baibua, Tabtim, Alicia and Chaba walk up to the stage, but none of them picks up a pen"},
 {n:"baibua",f:"sad",l:"fight",t:"Thank you… but I won't sign. Bua Tha Sao Camp still has me"},
 {n:"tabtim",l:"fight",t:"Tabtim won't sign either. My little brother read me clause fourteen"},
 {n:"alicia",l:"fight",t:"I already said I won't sign anything with the word \"forever\" in it"},
 {n:"chaba",l:"fight",t:"…not signing"},
 {n:fav,f:"happy",l:"fight",t:RG_CLOSE_SAY[fav]},
 fah?{n:"fah",f:"flustered",l:"casual",t:"Hear that, mister?! Nobody wants your league!"}:{n:"coach",t:"Hear that, Khun Krerk? Nobody wants your league"},
 {n:"pailin",t:"And Vector Gym withdraws from the Naka League partnership, as of this second"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"The whole room goes silent. Every eye turns to Khun Krerk"},
 {n:"npc",who:"Khun Krerk",t:"…No matter. Then let my daughter introduce herself instead"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"A woman in a white hood steps into the ring and pulls the hood off. Long white hair with red tips falls down her back"},
 {n:"lada",l:"casual",t:"Ladda Naka"},
 {n:"lada",l:"casual",t:"I want to know how good the four regional champions are. Come up one at a time. Here. Now"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"baibua",l:"fight"}],t:"Before anyone can stop her, Baibua steps in first. Her spinning elbow misses Ladda's chin by millimetres. Ladda answers with an elbow, wraps her waist and throws her to the canvas in a single motion"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"tabtim",l:"fight"}],t:"Tabtim leaps into a kick. Ladda closes the distance before the leg can fully extend, grabs the standing leg and pulls her down"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"alicia",l:"fight"}],t:"Alicia throws a combination. Ladda ducks every punch, slips around behind her and locks in a choke. Alicia taps within five seconds"},
 {n:"nar",show:[{id:"lada",l:"casual"},{id:"chaba",l:"fight"}],t:"Chaba presses forward and never takes a step back. Ladda lets her drive all the way to the ropes, then uses that same force to drag Chaba to the mat"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"Blood seeps from the corner of Ladda's mouth, where Baibua's elbow grazed her. She touches it with a fingertip, and smiles for the first time"},
 {n:"lada",l:"casual",t:"…that was fun"},
 fah?{n:"fah",f:"sad",l:"casual",t:"That's… modern fighting. Just like Fah"}:{n:"coach",t:"That's not just Muay Thai… that's everything combined"},
 {n:"npc",who:"Khun Krerk",t:"Thank you all for coming"},
 {n:"nar",bg:"camp",show:[],t:"Three days later, a black card with no logo arrives at the camp"},
 {n:"nar",t:"\"Sirichai Camp is invited: five on five · the old beverage factory warehouse, Khlong Toei port · open rules, throws and locks allowed · no prize, no press\""},
 {n:"nar",t:"Handwritten on the back: \"I just want to know how well your small Muay Thai camp handles the real world — L.\""},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"flustered",l:"casual",t:"Manager, the partner contract we took money for. Clause 30 says: \"Should Naka League lose to the partner camp, this contract shall terminate immediately\""}:{n:"coach",t:"The partner contract we took money for. Clause 30 says if Naka League loses to our camp, the contract ends immediately…"},
   {n:"coach",t:"He was that confident, to write this clause in"}]),
 {n:"coach",t:"Throws allowed, locks allowed… we haven't trained for any of that, not even one day"},
 {n:"coach",t:"Three weeks to prepare. Choose how to train for it on the Four Regions Championship page"}];}
const RG_FPREP={sprawl:{n:"Stop takedowns",d:"Kick them off when they shoot in, and land clinch knees more often"},escape:{n:"Escape locks",d:"Get up off the mat and slip out of locks more often"},strike:{n:"Stand and trade",d:"Ignore the takedowns. Sharpen your strikes and finish it before they drag you down"}};
function rgFinalIntro(G){const R=G.region,F=R.final;return [
 {n:"nar",bg:"naka_underground",t:F.tries?"The same warehouse by Khlong Toei port, as dim as last time. The same small crowd stands silent in the shadows":"An old warehouse by Khlong Toei port. Dim lights, the smell of sour syrup drifting from old tanks. In the middle, a ring with black ropes and soft MMA-style mats on the floor"},
 {n:"npc",who:"Khun Krerk",t:F.tries?"Back again, I see. I like that kind of stubbornness":"Welcome. No cameras, no press, no prize money. Just one question"},
 {n:"lada",l:"casual",t:"Five bouts, first to three takes it. I fight last"},
 {n:"coach",t:`Remember, everyone. We trained for ${RG_FPREP[F.prep||"strike"].n} Do what we trained. Don't play their game`}];}
function rgFinalBetween(G,i,me,o,res,w,l){return [
 {n:"nar",t:`${res==="W"?`${me.name} Win ${o.name}`:res==="D"?`${me.name} Tied with ${o.name}`:`${o.name} Win ${me.name}`} · Sirichai ${w} – ${l} Naka League`}];}
function rgFinalWin(G,w,l,beatLadda,ladFid){const R=G.region,fah=rgIn(G,"fah"),rin=rgIn(G,"rin"),looked=ladFid==="fah"&&fah?"Fah":"Manager";return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"nar",show:[{id:"npc:krerk"}],t:"Khun Krerk claps slowly from the second-floor balcony. The sound echoes through the whole warehouse"},
 {n:"npc",who:"Khun Krerk",t:"Congratulations, Sirichai Camp… luck was on your side today"},
 {n:"npc",who:"Khun Krerk",t:"Then I'll see you at the national level"},
 ...(beatLadda?[{n:"nar",show:[{id:"lada",l:"casual"}],t:"Ladda rises slowly from the mat and licks the blood from the corner of her mouth"},{n:"lada",l:"casual",t:"…that was fun"}]
  :[{n:"lada",l:"casual",t:"You beat the team. You haven't beaten me yet"}]),
 {n:"nar",show:[{id:"lada",l:"casual"}],t:`Before following her father out, Ladda stops and looks ${looked} One beat too long. Then she pulls the hood back over her head`},
 ...rgIf(R.c2==="deal",[rin?{n:"rin",f:"happy",l:"casual",t:"Clause 30. Naka League lost to its contract partner, so the contract ends immediately. The money is ours. And our data is ours again"}:{n:"coach",t:"Clause 30… Naka League lost to us, the contract's over, and the money's still ours. Ha!"}]),
 {n:"nar",show:[{id:"baibua"},{id:"tabtim"},{id:"alicia"},{id:"chaba"}],t:"At ringside, the four regional champions have watched since the first bout. No one says a word, but they are all thinking the same thing"},
 {n:"coach",bg:"camp",show:[],t:"Let's go home. Five a.m. tomorrow, same as always"}];}
function rgFinalLose(G,w,l){return [
 {n:"nar",bg:"naka_underground",t:`Five bouts done. Sirichai ${w} – ${l} Naka League`},
 {n:"npc",who:"Khun Krerk",t:"It's all right. The door is still open. Come back whenever you like"},
 {n:"lada",l:"casual",t:"…not enough yet"},
 {n:"coach",t:"Get hurt, remember it, and come back"}];}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}const now=gameWeek(G);if(lbWeek(G,done))return;
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
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
    {const r2=(R.cups||[])[1],c2=r2&&R.champ[r2];if(r2&&!R.c2&&c2&&now>=(c2.wonAbs||0)+1){R.c2="later";playScene(rgCup2(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    {const r3=(R.cups||[])[2],c3=r3&&R.champ[r3];if(r3&&!R.c3&&c3&&now>=(c3.wonAbs||0)+1){R.c3="seen";playScene(rgCup3(G),()=>{save();done();},{bg:"camp",look:"casual"});return;}}
    if(this.closeDue(G)){this.openFinal(G);playScene(rgClose(G),()=>{save();done();},{bg:"closing_ceremony",look:"casual"});return;} /* v1.91.20 round 11 */
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
    const f=baseFighter(id,mkNPC(id,RG_OPP[dest]||"Provincial champion","X",Math.min(19,Math.round(target-1)),rng,RG_ORDER.indexOf(r)+2)),base={...f.a};
    const setT=T=>{f.a={...base};f.vet=0;for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);liftOpponent(f,T,20);
      for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);};
    f.rg=dest;rgDress(f);f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;setT(RG_FIX.belt(n));f.rgT=+RG_FIX.belt(n).toFixed(2);f.camp="quest";f.div="X";f.rg=dest;f.rgSty=rgBeltSty(r,id);rgDress(f);f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"Missing data"};
    if(R.trip)return {ok:false,why:"A trip is already planned"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"Already won this province's belt"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"No free week left to travel this year"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name} isn't fit to travel`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"Not enough money for the trip"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`Trip planned to ${D.name} week ${wk} · travel cost ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(R&&R.joined)this.joinSkills(G);if(R)this.bondSync(G);if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(rg.nlfinal){if(R.final){R.final.cur=R.final.cur||{};R.final.cur[rg.nlfinal]=p.res||"L";}continue;}if(rg.nlleg){this.legResult(G,rg.nlleg,p);continue;}if(!D||!RG[r])continue;
      if(rg.series){this.seriesResult(G,r,p);continue;}
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""} wins the provincial belt of ${D.name}!`);if(G.F[p.a])recordHonor(G,"rgbelt",p.a,G.F[p.a].div,G.week,dest); /* v1.91.14 (Man): a province belt gets the same ceremony as the main game */
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";this.champFighter(G,r);
          addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG_TITLE[r]}: all four belts won`,body:RG_CH[r].letter});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+1);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`A letter from ${RG[r].champ}`,body:RG_POST[r]});}
      const cid=RG_CID[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&(c.visit==="done"||c.state==="won");G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`A letter from ${RG[r].champ}`,body:RG_MISS[r]});}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;this.flush(G);this.seriesWeekly(G);this.fade(G);this.letters(G);this.finalWeekly(G);this.joinWeekly(G);this.joinPerks(G);const T=R.trip;
    /* a trip whose bout vanished (the week went by, the booking was dropped) is let go */
    if(T&&gameWeek(G)>T.abs&&!G.bookings.some(b=>b.id===T.bid)){(R.gc=R.gc||[]).push(T.opp);R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,T.abs+1);}
    const keep=new Set(G.bookings.map(b=>b.b));R.gc=(R.gc||[]).filter(id=>{if(keep.has(id))return true;if(G.F[id]&&G.F[id].rg)delete G.F[id];return false;});},

  /* ---------- the trip week: drive → bout → hotel → home (round 2) ---------- */
  champId:{north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"},
  hotelBg:{north:"night_north",isan:"night_isan",central:"night_central",south:"night_south"},
  trip(b,done){if(b.region&&b.region.series){this.seriesTrip(b,done);return;}
    const R=G.region,T=R&&R.trip&&R.trip.bid===b.id?{...R.trip}:null,dest=b.region&&b.region.dest;rgDress(G.F[b.b]);
    if(!T||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const P=roadPlan(G,dest,T.car||null,T.abs);
    ROAD.open(dest,{paid:true,plan:P,onArrive:(P2,front)=>{this.arrive(G,T,P2||P,front);const go=()=>openFight(b,()=>this.night(T,P2||P,1,done)),A=this.firstArrive(G,ROAD_DEST[dest].r,dest);
      if(A){playScene(A,go,{bg:"gas_station",look:"casual"});}else go();}});},
  /* the first trip into a region: its champion comes to meet the camp on the way in */
  firstArrive(G,r,dest){const R=G.region;R.arrived=R.arrived||{};if(R.arrived[r]||!RG_ARRIVE[r])return null;R.arrived[r]=1;rgTouch(G,RG_CID[r]);return RG_ARRIVE[r](G,ROAD_DEST[dest]);},
  /* road fatigue for everyone on board (the fighter only half: the corner keeps her off her feet) · the shotgun seat is a small moment */
  arrive(G,T,P,front){const fat=P.fat||0;for(const f of roadRiders(G)){const k=f.id===T.fid?.5:1;f.fatigue=Math.min(100,(f.fatigue||0)+Math.round(fat*k));}
    if(front&&G.F[front]){add(G,front,"bond",1);G.F[front].morale=Math.min(100,(G.F[front].morale||0)+2);}
    G.log=G.log||[];G.log.push(`The whole camp arrives in ${ROAD_DEST[T.dest].name} · fatigue +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    {const X=RG_TRIPX[T.dest],tx=G.region.tx=G.region.tx||{};if(n===1&&X&&!tx[T.dest]&&!T.series){tx[T.dest]=1;rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`The bout in ${D.name} is over. Everyone waits by the car.`,choice:[
          {t:"Head back to camp",then:[{n:"nar",t:"The car pulls out of town, and everyone is asleep before you even leave the province."}]},
          {t:`Stay one more night (rooms ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("Not enough money for the rooms, so back to camp for now");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`Go for a walk with ${C.champ} (champion of ${C.name})`,fx:G2=>{rgMeet(G2,cid,3);if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`Take ${g.name} around ${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"Rest and recover",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"Everyone turns in early and wakes up fresh · fatigue −10"}]},
      {t:"Light training in the hotel parking lot",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"Pad work under the parking-lot lights until the hotel guard comes to watch · EXP +6"}]}];
    playScene([{n:"nar",t:nights>1?`Night ${n} in ${D.name}`:`The whole camp stays the night in ${D.name}`},{n:"nar",t:"What shall we do tonight?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){if(!T.shopDone){T.shopDone=1;this.shop(T,()=>this.home(T,done),1);return;}G.log=G.log||[];G.log.push(`Back at camp from ${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"On the way out of town the bus stops at a roadside souvenir shop. Paper umbrellas hang in rows; fine handwoven cloth lies folded on a wooden table.",
    isan:"On the way out of town the bus stops at the provincial silk centre. Triangle pillows are piled like a mountain; Praewa silk hangs behind glass.",
    central:"Before heading home the bus stops at a roadside Thai crafts shop. Khon masks stare down from the walls; Benjarong cups line the shelves.",
    south:"On the way out of town the bus stops at a seaside souvenir shop. Shadow puppets glow in the shopfront; pearls sit in a glass case."},
  shop(T,next,first){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r);if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`Buy ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · own ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:first?"Nothing today, back on the bus":"That's enough, back on the bus",fx:()=>{st.end=1;}}];
    const head=first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"Souvenirs aren't cheap, but the girls will love them · buy now, give later (shops like this only on trips)"}]:[];
    playScene([...head,{n:"nar",t:first?"Pick up anything to take home?":"Anything else?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("Not enough money");if(st.got)toast(`Bought: ${GIFTS[st.got].name} · give it from the Gift button`);this.shop(T,next,0);},{bg:this.hotelBg[r],look:"casual"});},
  dateLines(cid,D){const L={
    baibua:[{n:"npc",who:"Baibua",t:`The walking street's crowded tonight, jao… if we get separated, you can hold on to my sleeve, jao.`},{n:"nar",t:"Baibua walks slowly so you can keep up. Your hands almost touch a few times, but neither of you says anything."}],
    tabtim:[{n:"npc",who:"Tubtim",t:"Let's go eat som tam, de! This stall's real spicy… haha, I'm crying already, ai!"},{n:"nar",t:"Tubtim laughs loud enough for the whole stall to hear, but when you hand her a tissue she goes quiet for a moment."}],
    alicia:[{n:"npc",who:"Alicia",t:"Don't get the wrong idea. I just wanted someone to walk with. The camera's off tonight…"},{n:"nar",t:"Alicia leaves her phone face down on the table all night. She never picks it up once."}],
    chaba:[{n:"npc",who:"Chaba",t:"…The sea is pretty at night."},{n:"nar",t:"Chaba says nothing more, but she stays beside you until the tide reaches her ankles."}]};
    return L[cid]||[{n:"nar",t:`An evening walk in ${D.name}`}];},
  jealLine(id,champ){const L={kati:`You went walking with ${champ}? …No, I'm not asking.`,mali:`Mali saw that~ You went out with ${champ}, right? …Mali wants to go too.`,
    rin:`Out with ${champ} for two hours twelve minutes. I wasn't timing it. I just happened to look at my watch.`,ploy:`Out with ${champ}, huh? Good for you. …Why are you even asking?`,fah:`Oh, so you went out with ${champ}, huh! Fah's not sulking! Just… hungry!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`The night market in ${city} has so many sweets… could you buy me one? Just one, really.`,mali:`${city} is so pretty at night~ Thank you for bringing Mali. I'll remember this.`,
    rin:`I noted three good places to eat in ${city}. Let's hit the first one; we have just enough time.`,ploy:`Didn't ask you to bring me. …But, thanks.`,fah:`${city} has so much weird food! Fah's trying all of it. Manager's paying!`};return L[id]||`Tonight in ${city} was fun.`;},

  /* ---------- the championship series: 3 bouts, first to 2 wins (round 3) ---------- */
  /* the champion as a fighter: her own sheet, special move and perk; sized against your fighter before every bout */
  champFighter(G,r,me){const C=RG[r],H=RG_CH[r],id=this.champId[r];let f=G.F[id];
    if(!f){const rng=mulberry32((G.seed||1)+stableHash(id));f=baseFighter(id,mkNPC(id,C.champ,"X",14,rng,RG_ORDER.indexOf(r)+2));
      Object.assign(f,{name:C.champ,nick:C.nick,color:C.col,canon:true,camp:"region",div:"X",fatigue:0,injury:0,morale:75});G.F[id]=f;syncFighterAges(G);}
    f.pfx=H.perk.fx;f.canon=true;f.camp="region";
    if(me){const cups=(G.region.cups||[]).length,c=G.region.champ[r],ceil=RG_LADDER.champ(cups,c.tries),tilt=C.tilt;
      f.lvl=Math.max(me.lvl||1,1)+3+Math.min(2,cups)/* v1.90.20 (Man): regional champions 3–5 levels above */;f.fatigue=0;f.injury=0;f.morale=75;
      /* re-fit only when your fighter or the stakes changed (this runs before every bout) */
      const key=[cups,c.tries||0].join("|");
      if(f.rgKey!==key){const setT=T=>{f.vet=0;for(const k in f.a)f.a[k]=Math.max(1,Math.min(20,T-.6));for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);
          liftOpponent(f,T,20);for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.12);};
        const T=RG_FIX.champ(cups,c.tries); /* a lost series makes the rematch a little easier (v1.90.14) */setT(T);f.rgT=+T.toFixed(2);f.rgKey=key;}}
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
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"There aren't enough free weeks left this year for a title series"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · bout 1, week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+1);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r});}
      rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · prize ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+2;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} keeps the title ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG[r].champ} is dropping by the camp`,body:`${RG[r].champ} sent word she'll drop by the camp before bout 2

Welcome her at Fights › Four Regions Cup`});}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} bout ${c.n}: ${p.res==="W"?"Win":p.res==="L"?"Loss":"Draw"} · score ${c.w}-${c.l}${s?` · next bout in week ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`${RG_TITLE[r]}: a new challenge`,body:RG_CH[r].again});continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"The bout didn't go ahead as booked");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name} is still injured`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`Bout postponed: ${RG_TITLE[r]}`,
      body:`${why} · the organiser has moved bout ${(c.n||0)+1}${s?` to week ${s.wk}${s.season!==(G.season||1)?` (next year)`:""}`:""}\n\n${RG_CH[r].wait}`});},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} bout ${n}${n>1?` · score ${me.name} ${sc} ${RG[r].champ}`:""}`};
    const line=n===1?H.pre[0]:c.w===1&&c.l===1?H.pre[2]:H.pre[1];
    const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",with:cid,t:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name} nods and walks back to the red corner`}];
    return [head,{n:cid,f:n===1?"happy":"angry",l:"fight",t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      {const aw={kind:"rg_"+r,key:"cup"+r};AU.startMusic("victory");AU.sfx("champ");playScene(H.cup(G,J),()=>{AU.startMusic("hub");T.cupNight=1;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight",award:aw});
        [600,1300,2200,3300,4700,6200].forEach(ms=>setTimeout(()=>{if(UI.scene&&UI.scene.award===aw)AU.sfx("pop");},ms));}return;} /* v1.91.14: the cup gets the ceremony overlay, fireworks and the victory song */
    const steps=J.kind==="lost"?H.lost(G,J):[{n:cid,f:J.res==="W"?"sad":"happy",l:"fight",t:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`Score now ${J.w}-${J.l} · next bout in about 2 weeks`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · venue ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>Format</span><b>Best of 3 · 5 rounds each · about 2 weeks apart</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>Rematch</span><b class="goldt">Series lost so far: ${G.region.champ[r].tries} · the camp knows this champion's game better now</b></div>`:""}
     <div class="kv-row"><span>Strength of ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>Purse per bout</span><b class="num">${fmt(pay.win)} / loss ${fmt(pay.lose)}</b></div><div class="kv-row"><span>Cup prize</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>Who fights the whole series</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to fight</p>`}
     <p class="meta">Once picked, she fights the whole series · an injury postpones the bout · the organiser pays travel for every bout ${c.tries?` · attempt ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>Accept the challenge</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 Cup won</span>`:n<4?`<span class="meta">🔒 Win all 4 belts first (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">Pick a title fighter</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · bout ${c.next.n} week ${c.next.wk}${c.next.season!==(G.season||1)?` (next year)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">Welcome ${esc(C.champ)} to camp</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">Practice duel</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)} kept her title · waiting for a new challenge letter</span>`:`<span class="meta">✉️ Waiting for the champion's letter</span>`;
    const chat=G.chatIn&&G.chatIn[RG_CID[r]]&&G.F[RG_CID[r]]?`<button class="btn sm gold" data-act="rgchat" data-v="${RG_CID[r]}">💬 ${esc(C.champ)} sent a message</button>`:"";
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>regional championship ring</small>${gap>=3?`<small class="rg-miss">💭 ${gap} weeks since you last saw ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-final{border-top:6px solid #1a1a1a;background:linear-gradient(180deg,#2a1414 0,#160c0c 100%);color:#f3e6e6}.rg-final h3,.rg-final h4{color:#ff5a5a}.rg-final .meta{color:#d9bcbc}.rg-final.won{border-top-color:#d4a52a}.rg-fprep button{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;max-width:22rem}.rg-fprep small{opacity:.8;font-size:.72rem;white-space:normal}.rg-fprep button,.rg-fprep button *{text-align:left!important;align-self:stretch}.rg-nl .kv-row{border-bottom:1px dashed rgba(255,255,255,.15)}.rg-slot{margin:.4rem 0 .7rem;padding:0 .9rem .4rem 0;border-bottom:1px dashed rgba(0,0,0,.2)}.rg-slot .kv-row{flex-wrap:wrap;gap:4px 12px}.rg-slot .kv-row small{margin-left:auto}.m-rgfline{max-width:580px;background:linear-gradient(180deg,#120a1e,#0b0812);color:#fff}.m-rgfline .meta{color:#c9c0dc}.vs-head{display:flex;align-items:center;justify-content:center;gap:.6rem;margin:.2rem 0 .3rem;font-weight:900;letter-spacing:.02em}.vs-tl,.vs-tr{flex:1;padding:.35rem .6rem;font-size:1.05rem;color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.5)}.vs-tl{text-align:right;background:linear-gradient(90deg,transparent,#c0182a);clip-path:polygon(0 0,100% 0,92% 100%,0 100%)}.vs-tr{text-align:left;background:linear-gradient(90deg,#1d4fe0,transparent);clip-path:polygon(8% 0,100% 0,100% 100%,0 100%)}.vs-sc{font-size:1.7rem;min-width:3.4rem;text-align:center;color:#ffd84a;text-shadow:0 0 12px rgba(255,216,74,.5)}.vs-sub{text-align:center;font-size:.72rem;margin:0 0 .5rem}.vs-rows{display:flex;flex-direction:column;gap:6px}.vs-row{display:grid;grid-template-columns:1fr 46px 1fr;align-items:stretch;height:84px;position:relative}.vs-l,.vs-r{position:relative;display:flex;align-items:center;gap:.4rem;overflow:hidden;color:#fff;border:0;font:inherit;min-width:0}.vs-l{justify-content:flex-start;background:linear-gradient(90deg,#4a0710,#d01d2c 70%,#ff3b47);clip-path:polygon(0 0,100% 0,88% 100%,0 100%);padding-right:12%}.vs-r{justify-content:flex-end;background:linear-gradient(90deg,#3f7bff,#1d4fe0 30%,#0a1f6b);clip-path:polygon(12% 0,100% 0,100% 100%,0 100%);padding-left:12%;cursor:pointer;text-align:right}.vs-r:not([disabled]):hover{filter:brightness(1.15)}.vs-row.next .vs-r{box-shadow:inset 0 0 0 3px #ffd84a}.vs-row.next .vs-r:not(:has(.vs-art)){animation:vsPulse 1.2s ease-in-out infinite}@keyframes vsPulse{50%{filter:brightness(1.35)}}.vs-mid{display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:900;font-size:1.35rem;font-style:italic;color:#fff;  text-shadow:-2px 0 0 #d01d2c,2px 0 0 #1d4fe0,0 0 10px rgba(255,255,255,.4);z-index:2}.vs-mid small{font-size:.58rem;font-style:normal;text-shadow:none;color:#c9c0dc}.vs-art{position:relative;flex:0 0 74px;height:84px;overflow:hidden}.vs-art img{position:absolute;left:50%;top:2px;height:235%;transform:translateX(-50%);max-width:none}.vs-art canvas{position:absolute;left:50%;top:-4px;width:150px;height:150px;transform:translateX(-50%);image-rendering:auto}.vs-tx{display:flex;flex-direction:column;min-width:0;line-height:1.15}.vs-tx b{font-size:.9rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 rgba(0,0,0,.45)}.vs-tx em{font-style:normal;font-size:.7rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.95}.vs-tx small{font-size:.64rem;opacity:.85;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.vs-empty b{font-size:.85rem;opacity:.95}.vs-row.done .vs-l,.vs-row.done .vs-r{cursor:default}.vs-row.done .vs-l.lost,.vs-row.done .vs-r.lost{filter:grayscale(1) brightness(.72)}.vs-st{position:absolute;top:50%;transform:translate(-50%,-50%) rotate(-10deg);pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.6);font-style:normal;font-weight:900;font-size:1.05rem;letter-spacing:.06em;  padding:.05rem .45rem;border:3px solid currentColor;border-radius:4px;background:rgba(0,0,0,.55);z-index:3}.vs-st.vsl{left:11%}.vs-st.vsr{left:89%}.vs-st.w{color:#ffd84a}.vs-st.l{color:#ff6a6a}.vs-st.d{color:#d8d8d8}.rg-stars i{font-style:normal;color:#5a4a4a;font-size:1rem;letter-spacing:1px}.rg-stars i.on{color:#ffd84a;text-shadow:0 0 6px rgba(255,216,74,.6)}.rg-leg .kv-row{align-items:center}.vs-pick{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px;margin:.5rem 0}.vs-pc{display:flex;flex-direction:column;align-items:center;gap:2px;padding:0 0 .4rem;border:0;color:#fff;font:inherit;cursor:pointer;  background:linear-gradient(180deg,#2a5bf0,#0d2478);box-shadow:inset 0 0 0 2px rgba(255,255,255,.15)}.vs-pc.on{box-shadow:inset 0 0 0 3px #ffd84a}.vs-pc[disabled]{filter:grayscale(1) brightness(.55);cursor:default}.vs-pc .vs-art{flex:none;width:100%;height:96px}.vs-pc small{font-size:.66rem;opacity:.85}@media (prefers-reduced-motion:reduce){.vs-row.next .vs-r{animation:none}}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
.rg-reg{border-top:6px solid var(--rc);position:relative}.rg-reg h3{margin:.1rem 0 0}.rg-reg h3::first-letter{text-transform:uppercase}.rg-champ{font-size:.85rem;opacity:.85;margin-bottom:.5rem}
.rg-prov{display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.35rem 0;border-bottom:1px dashed rgba(0,0,0,.15)}
.rg-prov:last-child{border-bottom:0}.rg-prov small{opacity:.7}.rg-fin{opacity:.9}.rg-miss{display:block;color:#d4688f;opacity:1!important}.rg-belt{color:#b8860b;font-weight:700}
.rg-trip{border-left:6px solid var(--gold,#d9a21b)}.rg-pick{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}
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
  fuelLine(G){const p=roadFuel(G,gameWeek(G)),b=roadFuelBand(p);
    return `<p class="meta">Fuel this week <b class="rg-fuel ${b}">฿${p.toFixed(2)}/L · ${b==="cheap"?"cheap":b==="high"?"pricey":"Normal"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>Four Regions Championship</h3><p>The regional tournament sends its invitation once year 5 is over and the camp has won 3 provincial titles.</p>
       <div class="kv-row"><span>Year</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>Provincial titles</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">Open the chapter now (test mode)</button></div>`:""}</section>`;}
    const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>Planned trip</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>Week ${T.wk}</b></div>
       <div class="kv-row"><span>Fighter</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>Opponent</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>Travel cost (paid)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">The whole camp travels together that week, so no other bouts.</p><div class="mfoot"><button class="btn" data-act="rgcancel">Cancel trip (refund)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} km · ${nights?`Stay ${nights} night(s)`:"Day trip"}</small></span>${got?`<span class="rg-belt">🏅 Belt won</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>Plan</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">Regional champion: <b>${esc(C.champ)}</b> · ${esc(C.nick)}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>Four Regions Championship</h3><span class="meta">Edition ${R.edition||1}</span></div>
       <div class="rg-stats"><span class="pill gold">Cups ${cups}/4</span><span class="pill">Belts ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`Trip: ${esc(ROAD_DEST[T.dest].name)} · Week ${T.wk}`:nx?`Can travel week ${nx}`:"No more trips this year"}</span></div></section>
     ${!R.gala?`<p class="meta rg-gala">🎉 The Four Regions Cup opening gala in Bangkok ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"is held at the end of next week":"is held at the end of this week"} · the whole camp is invited</p>`:""}${!REGION_LIVE?`<p class="meta">Test mode: <button class="btn sm" data-act="rggala" data-v="gala">Watch the gala</button> Underground test fight (open rules): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">Watch the green envelope scene</button>`:""}</p>`:""}
     ${this.finalCard(G)}${this.legendCard(G)}${this.joinCard(G)}${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>No free week left to travel this year</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">Travel in week <b>${wk}</b> · ${D.km} km · ${P.nights?`Stay ${P.nights} night(s)`:"Day trip"} · opponent: <b>${esc(RG_OPP[dest]||"Provincial champion")}</b>, the provincial champion</p>
     <h3>Who fights?</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">Nobody is fit to travel that week</p>`}
     <h3>Round-trip travel cost</h3><div class="rg-bill"><div class="kv-row"><span>Vehicle</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`Fuel ${Math.round(P.litres)} L × ฿${P.price.toFixed(2)}`,P.fuel)}${line("Tolls",P.toll)}${line(`Bus tickets × ${P.onBus}`,P.bus)}${line(`Lodging ${P.nights} night(s)`,P.lodge)}${line(`Food × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>Total</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">The whole camp: ${P.people} people travel together; no other bouts that week · road fatigue about +${P.fat} each ${P.car==="none"?" · the camp has no vehicle yet, so it's the bus (pricier and more tiring)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">Not now</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"Not enough money":"Confirm the trip"}</button></div>`;}
};

/* round 11: the underground final — state, the region-page card, the line-up and the five bouts */
Object.assign(REGION,{
  closeDue(G){const R=G.region,now=gameWeek(G),cups=R.cups||[];if(R.close)return false;
    if(cups.length>=4){const last=R.champ[cups[3]];return now>=((last&&last.wonAbs)||0)+2;}
    /* the tournament runs its course without four cups: three years in, nothing in progress */
    return cups.length>=1&&now>=(R.startAbs||0)+156&&!RG_ORDER.some(r=>R.champ[r]&&R.champ[r].state==="series")&&!R.trip;},
  openFinal(G){const R=G.region,now=gameWeek(G);R.close=now;R.final={stage:"prep",abs:now+3,prep:null,tries:0,won:false,intelAbs:now+1};
    addMail(G,{kind:"letter",from:"(no sender)",title:"Black card",body:`Sirichai Camp is invited: five on five
The old beverage factory warehouse, Khlong Toei port
From week ${((R.final.abs-1)%52)+1} onward

Open rules. Throws allowed. Locks allowed.
No prize. No press.

I just want to know how well your small Muay Thai camp handles the real world.
— L.`});},
  finalWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||F.intel||now<F.intelAbs)return;F.intel=1;
    addMail(G,{kind:"letter",from:"(unsigned)",title:"Naka League team intel",body:"Don't ask who sent this\n\n"+NL_ORDER.map(k=>`${NL[k].name} · ${NL[k].art}\n${NL[k].tip||""}`).join("\n\n")+"\n\nLadda looks for old fight tapes of everyone in your camp. The ones she has never seen fight, she can't read.\n\nP.S. No need to return the tablet."});},
  finalCard(G){const R=G.region,F=R.final;if(!F)return "";const now=gameWeek(G),ready=now>=F.abs,wk=((F.abs-1)%52)+1;
    const plans=Object.entries(RG_FPREP).map(([k,P])=>`<button class="btn sm ${F.prep===k?"gold":""}" data-act="rgfprep" data-v="${k}" aria-pressed="${F.prep===k}"><b>${esc(P.n)}</b><small>${esc(P.d)}</small></button>`).join("");
    const team=F.intel?`<div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><small>${NL[k].nlsk.map(s=>esc(s.name)).join(" · ")}</small></div>`).join("")}</div>`:`<p class="meta">You know nothing about the Naka League team yet</p>`;
    if(F.won)return `<section class="px card rg-final won"><h3>Underground fight · Naka League</h3><p>Sirichai Camp won ${F.score||""} · ${F.beatLadda?"Ladda went down too":"Ladda is still unbeaten"}</p></section>`;
    return `<section class="px card rg-final"><h3>🂠 Black card · Naka League underground fight</h3>
      <p class="meta">Five on five · first to three · open rules, throws and locks allowed · no prize ${F.tries?` · attempts so far: ${F.tries} times`:""}</p>
      <h4>Underground training plan</h4><div class="rg-pick rg-fprep">${plans}</div>
      <h4>Naka League team</h4>${team}
      <div class="mfoot">${ready?`<button class="btn primary" data-act="rgfline" ${F.prep?"":"disabled"}>${!F.prep?"Choose a training plan first":F.live?"Back into the warehouse ▸":"Go to the underground warehouse ▸"}</button>`:`<span class="meta">Available from week ${wk} · trained ${F.abs-now} more weeks</span>`}</div></section>`;},
  finalPool(G){return roster(G).filter(f=>!f.injury&&!isAway(G,f.id));},
  vsArt(f,side,win){const A={kati:1,mali:1,rin:1,ploy:1,fah:1,baibua:1,tabtim:1,alicia:1,chaba:1,pailin:1};
    if(f.nl==="ladda")return `<img src="${ASSET}lada_fight_${win?"happy":"angry"}.webp" alt="">`;
    if(f.nl)return `<img src="${ASSET}nl_${f.nl}${f.nl==="rosa"&&win?"_win":""}_por.webp" alt="">`; /* v1.91.23: Man's Naka League portraits */
    if(A[f.id])return `<img src="${ASSET}${f.id}_fight_happy.webp" alt="">`;
    return `<canvas width="128" height="128" data-sprite="${f.id}" data-mode="guard" ${side==="r"?'data-flip="1"':""}></canvas>`;},
  boardHTML(){const R=G.region,F=R.final,pool=this.finalPool(G),L=F.line=F.line||{},K=F.clear=F.clear||{};
    if(!F.live){F.cur={};for(const k in K){F.cur[k]="W";delete L[k];}} /* v1.91.24 (Man, option 1): bouts already won stay won */
    const C=F.cur;
    for(const k of NL_ORDER)if(!C[k]&&L[k]&&!pool.some(f=>f.id===L[k]))delete L[k];
    if(!F.live&&!NL_ORDER.some(k=>!C[k]&&L[k])){const used=new Set();for(const k of NL_ORDER){if(C[k])continue;const f=pool.filter(x=>!used.has(x.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(f){L[k]=f.id;used.add(f.id);}}}
    const ref=pool[0]||roster(G)[0];for(const k of NL_ORDER)if(!G.F["nl_"+k]&&ref)nlFighter(G,k,ref);
    const v=Object.values(C),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,next=NL_ORDER.find(k=>!C[k]);
    if(UI.rgPick&&!C[UI.rgPick]){const k=UI.rgPick,o=G.F["nl_"+k],at=id=>NL_ORDER.find(x=>L[x]===id);
      return `<div class="vsb"><h2>Bout ${NL_ORDER.indexOf(k)+1} · Who fights ${esc(NL[k].name)}</h2><p class="meta">${esc(NL[k].art)}</p>
        <div class="vs-pick">${pool.map(f=>{const x=at(f.id),done=x&&C[x];return `<button class="vs-pc ${L[k]===f.id?"on":""}" data-act="rgfset" data-v="${k}|${f.id}" ${done?"disabled":""}>
          <span class="vs-art">${this.vsArt(f,"r")}</span><b>${esc(f.name)}</b><small>Lv.${f.lvl||1}${done?" · already fought":x&&x!==k?` · in bout ${NL_ORDER.indexOf(x)+1}`:""}</small></button>`;}).join("")}</div>
        ${pool.length<5?`<p class="redt">You need at least 5 fighters ready to fight (right now: ${pool.length})</p>`:""}
        <div class="mfoot"><button class="btn" data-act="rgfpickx">Back</button></div></div>`;}
    const stamp=(r,sd)=>r?`<i class="vs-st ${sd} ${r==="W"?"w":r==="L"?"l":"d"}">${r==="W"?"WIN":r==="L"?"LOSE":"DRAW"}</i>`:"";
    const rows=NL_ORDER.map((k,i)=>{const o=G.F["nl_"+k],kept=!!(K[k]&&!L[k]),me=kept?G.F[K[k]]:L[k]&&G.F[L[k]],r=C[k],their=r==="W"?"L":r==="L"?"W":r;
      return `<div class="vs-row ${r?"done":""} ${kept?"kept":""} ${k===next?"next":""}">
        <div class="vs-l ${r&&their!=="W"?"lost":""}"><span class="vs-art">${o?this.vsArt(o,"l",their==="W"):""}</span><span class="vs-tx">${(n=>`<b>${esc(n[0])}</b>${n[1]?`<em>${esc(n.slice(1).join(" "))}</em>`:""}`)(NL[k].name.split(" "))}<small>${esc(NL[k].art)}</small></span></div>
        <div class="vs-mid">VS<small>Bout ${i+1}</small></div>
        <button class="vs-r ${r&&r!=="W"?"lost":""}" data-act="rgfslot" data-v="${k}" ${r?"disabled":""}>${me?`<span class="vs-tx"><b>${esc(me.name)}</b><small>${kept?"Won last time":`Lv.${me.lvl||1}`}</small></span><span class="vs-art">${this.vsArt(me,"r")}</span>`:`<span class="vs-tx vs-empty"><b>+ Pick a fighter</b></span>`}</button>${stamp(their,"vsl")}${stamp(r,"vsr")}</div>`;}).join("");
    const nk=next&&NL_ORDER.indexOf(next)+1,ok=next&&L[next];
    return `<div class="vsb"><div class="vs-head"><span class="vs-tl">Naka League</span><b class="vs-sc">${w>0||l>0?`${l} – ${w}`:"VS"}</b><span class="vs-tr">Sirichai Camp</span></div>
      <p class="meta vs-sub">Five on five · first to three · tap a blue slot to pick a fighter · bouts you already won stay won · no injuries carry over after the fight</p>
      <div class="vs-rows">${rows}</div>
      <div class="mfoot">${next?`${F.live?"":`<button class="btn" data-act="closeModal">Not yet</button>`}<button class="btn primary" data-act="rgfgo" ${ok?"":"disabled"}>${ok?`Fight bout ${nk} ▸`:`Pick a fighter for bout ${nk} first`}</button>`:`<button class="btn primary" data-act="rgfend">See the result ▸</button>`}</div></div>`;},
  finalNext(){const R=G.region,F=R.final,C=F.cur=F.cur||{},k=NL_ORDER.find(x=>!C[x]);if(!k||!(F.line||{})[k])return;UI.modal=null;UI.rgPick=null;
    if(!F.live){F.live=true;save();AU.startMusic&&AU.startMusic("hub");playScene(rgFinalIntro(G),()=>this.finalBout(k),{bg:"naka_underground",look:"casual"});return;}
    this.finalBout(k);},
  finalBout(k){const R=G.region,F=R.final,i=NL_ORDER.indexOf(k),me=G.F[F.line[k]];if(!me)return;
    const keep={injury:me.injury||0,fatigue:me.fatigue||0},o=nlFighter(G,k,me);
    const b={id:`nlf${F.tries||0}_${i}_${gameWeek(G)}`,a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",gprep:F.prep,region:{nlfinal:k}};
    G.bookings.push(b);save();
    openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);me.injury=keep.injury;me.fatigue=keep.fatigue;this.flush(G);
      if(!F.cur[k])F.cur[k]="L";if(F.cur[k]==="W"){F.clear=F.clear||{};F.clear[k]=me.id;}save();UI.modal={type:"rgfline"};render();});},
  finalEnd(){const R=G.region,F=R.final,v=Object.values(F.cur||{}),w=v.filter(x=>x==="W").length,l=v.filter(x=>x==="L").length,beat=(F.cur||{}).ladda==="W";F.tries=(F.tries||0)+1;F.live=false;UI.modal=null;
    if(w>=3){F.won=true;F.stage="done";F.wonAbs=gameWeek(G);F.score=`${w}–${l}`;F.beatLadda=beat;R.hall=R.hall||[];R.hall.push({k:"naka",season:G.season||1,score:F.score,ladda:beat});
      for(const r of RG_ORDER)rgTouch(G,RG_CID[r]);G.rep+=3;
      AU.startMusic&&AU.startMusic("victory");playScene(rgFinalWin(G,w,l,beat,F.line.ladda),()=>{AU.startMusic&&AU.startMusic("hub");save();render();},{bg:"naka_underground",look:"casual"});return;}
    playScene(rgFinalLose(G,w,l),()=>{save();UI.modal={type:"rgflost"};render();},{bg:"naka_underground",look:"casual"});},
});
/* v1.91.27 (Man): legend mode — optional, after the underground final. Stars: ★ win · ★★ win without going down · ★★★ that, and inside the distance */
const LEG_UP={n:1.15,l:1.15},LEG_DUST=4;
Object.assign(REGION,{
  legStars(n){return `<span class="rg-stars">${[1,2,3].map(i=>`<i class="${i<=n?"on":""}">★</i>`).join("")}</span>`;},
  legendCard(G){const R=G.region,F=R.final;if(!F||!F.won)return "";const L=R.legend=R.legend||{},tot=NL_ORDER.reduce((a,k)=>a+(L[k]||0),0),used=R.legWk===gameWeek(G);
    return `<section class="px card rg-final rg-leg ${tot>=15?"won":""}"><h3>✦ Legend · Naka League <small class="meta">${tot}/15 stars</small></h3>
      <p class="meta">Optional · tougher than the underground final · one bout a week · injuries and fatigue count · ★ win · ★★ win without going down · ★★★ no knockdown and inside the distance · each new star gives stardust ${LEG_DUST}</p>
      <div class="rg-nl">${NL_ORDER.map(k=>`<div class="kv-row"><span><b>${esc(NL[k].name)}</b> <small>${esc(NL[k].art)}</small></span><span>${this.legStars(L[k]||0)} <button class="btn sm" data-act="rglegpick" data-v="${k}" ${used?"disabled":""}>Challenge ▸</button></span></div>`).join("")}</div>
      ${used?`<p class="meta">Already fought a legend bout this week</p>`:""}</section>`;},
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
  rgfline:()=>{const F=G.region&&G.region.final;if(!F||F.won||!F.prep||gameWeek(G)<F.abs)return;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfslot:d=>{const F=G.region.final;if((F.cur||{})[d.v])return;UI.rgPick=d.v;render();},
  rgfpickx:()=>{UI.rgPick=null;render();},
  rgfset:d=>{const [k,id]=d.v.split("|"),F=G.region.final,L=F.line=F.line||{},C=F.cur||{};if(C[k])return;
    const was=NL_ORDER.find(x=>L[x]===id);if(was&&C[was])return;if(was&&was!==k){if(L[k])L[was]=L[k];else delete L[was];}L[k]=id;UI.rgPick=null;save();render();},
  rgfgo:()=>REGION.finalNext(),
  rgfend:()=>{const F=G.region.final;if(NL_ORDER.every(k=>(F.cur||{})[k]))REGION.finalEnd();},
  rgfagain:()=>{const F=G.region.final;F.cur={};F.live=false;UI.rgPick=null;UI.modal={type:"rgfline"};render();},
  rgfhome:()=>{const F=G.region.final;F.abs=gameWeek(G)+1;UI.modal=null;addMail(G,{kind:"letter",from:"(no sender)",title:"A new black card",body:"The door is still open\n— L."});save();render();},
});
if(typeof XMODAL!=="undefined"){XMODAL.rgfline=()=>({body:REGION.boardHTML(),foot:false});XMODAL.rgleg=m=>({body:REGION.legPickHTML(m.k),foot:false});
  XMODAL.rgflost=()=>({body:`<h2>Lost the underground fight</h2><p>Bouts you already won stay won; next time you only fight the rest · What now?</p><div class="mfoot"><button class="btn" data-act="rgfhome">Train first (come back next week)</button><button class="btn primary" data-act="rgfagain">New lineup, fight on now</button></div>`,foot:false});}
if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`Trip booked for week ${r.wk} · travel cost paid ${fmt(r.cost)}`);save();render();},
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
const RG_JOIN_MIN=12,RG_JOIN_GAP=4,RG_JOIN_FEE=350000,RG_JOIN_WAGE=5000; /* v1.91.30 (Man): a regional champion costs a fortune, and is worth it */
/* v1.91.30 (Man): every champion brings something the camp wants — her ring perk stays, plus a camp-wide gift */
const RG_TRAIT={
 baibua:{name:"Tha Sao Elbow Teacher",desc:"Tha Sao counter elbows (counter +5%, elbow +12%) · teaches elbows to the camp: every fighter's elbow and counter grow a little each week"},
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
  joinRooms(G){const R=G.region,J=R.joined||{};return CANON_IDS.filter(id=>G.F[id]&&G.F[id].camp==="player").length+Object.keys(J).filter(c=>G.F[c]&&G.F[c].camp==="player").length;},
  /* the champion's skill tree is her lineage's — the partner girl's tree (Tha Sao / Korat / Lopburi / Chaiya) */
  joinSkills(G){const J=(G.region&&G.region.joined)||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(J[cid]&&!SKILLS[cid]&&SKILLS[RG_CH[r].pair])SKILLS[cid]=SKILLS[RG_CH[r].pair];}},
  joinWeekly(G){const R=G.region,F=R.final,now=gameWeek(G);if(!F||!F.won||now<(F.wonAbs||0)+3)return;R.joined=R.joined||{};R.offers=R.offers||[];R.joinQ=R.joinQ||[];
    const m=R.meet||{};for(const r of RG_ORDER){const cid=RG_CID0[r];if(!R.joined[cid]&&!R.offers.includes(cid)&&!R.joinQ.includes(cid)&&!(R.joinGone||{})[cid]&&(m[cid]||0)>=RG_JOIN_MIN)R.joinQ.push(cid);}
    R.joinQ.sort((a,b)=>(m[b]||0)-(m[a]||0));
    if(R.joinQ.length&&now>=(R.joinNext||0)){const cid=R.joinQ.shift(),r=RG_ORDER.find(x=>RG_CID0[x]===cid);R.offers.push(cid);R.joinNext=now+RG_JOIN_GAP;
      addMail(G,{kind:"letter",from:`${RG[r].champ} · Champion of ${RG[r].name}`,title:`Application from ${RG[r].champ}`,body:RG_JOIN[cid].letter+`

(Contract: signing fee ${fmt(RG_JOIN_FEE)} · wage ${fmt(RG_JOIN_WAGE)}/week · trait: ${RG_TRAIT[cid].name} · see the contract on Camp › Trainers & fighters)`});}},
  joinOk(G,cid){const R=G.region;if(!R.offers||!R.offers.includes(cid))return "No such contract";if(R.joinPend)return "Wait for the one who already said yes to move in first";
    if(this.joinRooms(G)>=dormRooms(G))return `Rooms full (${dormRooms(G)} rooms) · upgrade the dorm first`;if(G.cash<RG_JOIN_FEE)return `Not enough cash · signing fee ${fmt(RG_JOIN_FEE)}`;return "";},
  joinAccept(G,cid){const why=this.joinOk(G,cid);if(why){toast(why);return;}const R=G.region;G.cash-=RG_JOIN_FEE;R.offers=R.offers.filter(x=>x!==cid);R.joinPend={cid,abs:gameWeek(G)+1};
    G.log=G.log||[];G.log.push(`Signed a contract with ${G.F[cid]?G.F[cid].name:cid} · signing fee ${fmt(RG_JOIN_FEE)} · moves in next week`);toast(`Contract signed · ${G.F[cid]?G.F[cid].name:""} moves in next week`);},
  joinApply(G,cid){const R=G.region,r=RG_ORDER.find(x=>RG_CID0[x]===cid),f=G.F[cid]||this.champFighter(G,r),pair=G.F[RG_CH[r].pair],now=gameWeek(G);
    f.camp="player";f.canon=true;f.met=true;f.div=(pair&&(pair.div==="A"||pair.div==="B"))?pair.div:"A";
    f.lvl=Math.max(12,(f.lvl||14)-2);for(const k in f.a)f.a[k]=Math.max(12,Math.min(20,Math.round(f.a[k]*.92*10)/10));f.vet=0; /* v1.91.30 (Man): a small drop from her rival form, not 30% */
    f.sp=(f.sp||0)+f.lvl;f.xp=0;f.skills=f.skills||{};f.wage=RG_JOIN_WAGE;f.fee=0;f.potential=20;f.fatigue=0;f.injury=0;f.morale=80;f.trust=Math.max(f.trust||0,50);
    f.bond=Math.max(f.bond||0,Math.max(30,rgBondOf(R.meet[cid])));f.joinAbs=now;f.lastTouch=absWeek(G);delete f.rgKey;delete f.rgT;delete f.rgSty;
    G.rank=G.rank||{A:{},B:{}};G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
    (R.joined=R.joined||{})[cid]=now;this.joinSkills(G);if(typeof syncFighterAges==="function")syncFighterAges(G);
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
      if((f.bond||0)<75||now-(J[cid]||now)<6||(R.confN[cid]||0)>=3)continue;if(R.confNo[cid]!=null&&now-R.confNo[cid]<13)continue;return cid;}return null;},
  confSteps(G,cid){const J=RG_JOIN[cid],R=G.region,two=partners(G).length>0||Object.keys(R.lov||{}).some(k=>k!==cid);R.confN[cid]=(R.confN[cid]||0)+1;
    const warn=two?[{n:"nar",t:"⚠ You already have someone. Saying yes means two-timing… a regional champion can't join the harem team"}]:[];
    return [...J.conf(G),...warn,{n:"nar",t:"She waits for your answer",choice:[
      {t:two?"\"I like you too\" (two-timing)":"\"I like you too\"",fx:G2=>REGION.takeC(G2,cid),then:[{n:cid,f:"happy",l:"casual",t:J.yes(G)}]},
      {t:"\"Let's stay like this for now\"",fx:G2=>{G2.region.confNo[cid]=gameWeek(G2);add(G2,cid,"trust",3);},then:[{n:cid,f:"sad",l:"casual",t:J.no}]}]}];},
  takeC(G,cid){const R=G.region,now=gameWeek(G);R.lov=R.lov||{};const P=[...partners(G),...Object.keys(R.lov).filter(k=>k!==cid&&G.F[k])];R.lov[cid]=now;if(P.length&&G.mono)delete G.mono;if(R.ex)delete R.ex[cid];const f=G.F[cid];if(f)f.morale=Math.min(100,(f.morale||0)+15);
    if(P.length){const top=P.map(k=>G.F[k]).filter(Boolean).sort((a,b)=>((b.bond||0)+(b.bondX||0))-((a.bond||0)+(a.bondX||0)))[0];if(top)R.twoQ={id:top.id,cid,abs:now+3};}
    G.log=G.log||[];G.log.push(`${f?f.name:cid} and the Manager started dating ${P.length?" (two-timing)":""}`);},
  breakC(G,cid){const R=G.region,f=G.F[cid];if(!this.isLovC(G,cid))return;delete R.lov[cid];(R.ex=R.ex||{})[cid]=gameWeek(G);if(R.twoQ&&R.twoQ.cid===cid)delete R.twoQ;if(f)add(G,cid,"bond",-35);},
  hangC(G,cid){const f=G.F[cid];if(!f||G.freeUsed||isAway(G,cid))return;const J=RG_JOIN[cid],R=G.region;R.hangI=R.hangI||{};const i=R.hangI[cid]||0,lov=this.isLovC(G,cid);
    const P=lov&&i%2===1?J.love:J.hang[Math.floor(i/(lov?2:1))%J.hang.length];R.hangI[cid]=i+1;G.freeUsed=true;f.hangWk=G.week;
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
     <p class="meta">She drops only a little from her champion form · no need to answer now, the contract waits</p></section>`;},
  /* the camp-wide side of each champion's trait, once a week */
  joinPerks(G){const J=(G.region&&G.region.joined)||{},mine=roster(G);
    for(const cid of Object.keys(J)){const f=G.F[cid];if(!f||f.camp!=="player"||isAway(G,cid))continue;
      if(cid==="baibua")for(const x of mine)if(x.id!==cid){const cap=stCap(x);for(const k of ["elbow","counter"])x.a[k]=Math.min(cap,Math.round((x.a[k]+.04)*100)/100);}
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
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);

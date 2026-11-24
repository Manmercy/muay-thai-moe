// ================= MUAY THAI MOE — MERIT & THE GHOST OF THE BANANA TREE "นางตานี" (v1.91.144, Man 24 พ.ย.) =================
// Phase 1: camp merit (บุญ) from merit-making, the wai kru and new big merit events; it slowly runs down when nobody makes merit.
// Once the camp is big and busy, Nang Tani — whose banana trees the fighters kick in training (and whose trunks went into krathongs) —
// wakes up and starts haunting dreams: a random fighter boxes her in the dream while the manager can only shout; losing means a week
// in bed with a fever. Enough merit and Kru Daeng and Luang Pho suggest a spirit house; once it stands, Tani turns protector,
// hints lottery numbers and keeps the fighters healthy. A mor phi can be hired as an expensive, unreliable shortcut.
// Light comedy on purpose: at most one ghost-fever at a time, haunts several weeks apart, a skip option that never forces a fight.
(()=>{
const GH_MAX=100,GH_DECAY=3,GH_CD=4;
const ghSt=G=>{if(!G.gh)G.gh={merit:40,on:0,stage:0,last:-99,haunts:0,wins:0,shrine:0,shrineOK:0,calm:0,mw:-1};return G.gh;};
const ghAdd=(G,n)=>{const S=ghSt(G);S.merit=clamp(Math.round(S.merit+n),0,GH_MAX);S.mw=gameWeek(G);return S.merit;};
const ghWk=(d,m)=>dateWeek(d,m);
/* the Buddhist calendar on the game's year (week 1 = 25 May) */
const GH_LENT=()=>[ghWk(30,6),ghWk(25,9)];            /* เข้าพรรษา → ออกพรรษา */
const GH_KATHIN=()=>[ghWk(26,9),ghWk(24,10)];         /* the month after ออกพรรษา */
const GH_ORDAIN=()=>[ghWk(1,3),ghWk(10,4)];           /* summer novice ordination, April – early May */
const ghIn=(G,[a,b])=>a<=b?G.week>=a&&G.week<=b:G.week>=a||G.week<=b;
const ghMood=G=>{const S=ghSt(G);return S.shrine?"smile":S.stage>=2?"angry_smile":S.stage>=1?"angry":"scary";};
BGIMG.dream="bg_dream.webp";BGIMG.dream_room="bg_dream_room.webp";TIER_BG.dream="bg_dream.webp";
/* the ghost theme: slow heartbeat klong, a low drone that slips a tritone, a wobbling pi and a far-off bell */
AU.GHM=[57,0,0,60,0,58,0,0,64,0,63,0,0,0,0,0,57,0,60,0,61,0,0,0,52,0,0,0,0,51,0,0];
AU.ghostStep=function(s,t,spb){const m=this.music,st=s%16;
  if(st===0||st===2)this.tone(t,{f:st?70:85,to:45,dur:.25,peak:st?.32:.42,bus:m});
  if(s===0||s===16)this.tone(t,{f:s?51.9:55,dur:spb*15,peak:.16,type:"triangle",bus:m});
  if(s===4)[1760,2640,3520].forEach((f,k)=>this.tone(t,{f,dur:2.4/(k+1),peak:.05/(k+1),bus:m}));
  if(s===24)this.tone(t,{f:930,to:610,dur:spb*6,peak:.05,bus:m});
  const n=this.GHM[s];if(n){const f=440*Math.pow(2,(n-69)/12),c=this.ctx,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),bp=c.createBiquadFilter(),g=c.createGain();
    o.type="sawtooth";o.frequency.value=f;lfo.frequency.value=3.2;lg.gain.value=f*.03;lfo.connect(lg);lg.connect(o.frequency);bp.type="bandpass";bp.frequency.value=900;bp.Q.value=2.2;
    const dur=spb*3.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.12,t+.25);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    o.connect(bp);bp.connect(g);g.connect(m);[o,lfo].forEach(x=>{x.start(t);x.stop(t+dur+.05);});}};
{const _ps=AU.playStep;AU.playStep=function(s,t,spb){if(this.mode==="ghost"){this.ghostStep(s,t,spb);return;}return _ps.call(this,s,t,spb);};
 const _sm=AU.startMusic;AU.startMusic=function(mode){_sm.call(this,mode);try{if(mode==="ghost"&&this.ctx){this.tempo=60;if(this.music)this.music.gain.setTargetAtTime(.3,this.ctx.currentTime,.4);}}catch(e){}};
 const _st=AU.setTempo;AU.setTempo=function(b){if(this.mode==="ghost")return;return _st.call(this,b);};}
const GMON=()=>({inject:()=>{try{AU.startMusic("ghost");if(UI.scene)UI.scene.music="ghost";}catch(e){}return [];}}),GMOFF=()=>({inject:()=>{try{AU.startMusic("hub");if(UI.scene)UI.scene.music=null;}catch(e){}return [];}});
const ghPlay=(steps,done,opts)=>{playScene([GMON(),...steps],()=>{try{AU.startMusic("hub");}catch(e){}done&&done();},opts);};
{const _fs=fightStart;fightStart=function(q){_fs(q);try{if(UI.fight&&UI.fight.b&&UI.fight.b.dream)AU.startMusic("ghost");}catch(e){}};}
const TANI="Nang Tani",LP="The abbot",MP="Mor Phi Plian";
const TN=(t,img)=>({n:"npc",who:TANI,img:"tani_"+(img||ghMood(G)),t}),N=t=>({n:"nar",t}),C=t=>({n:"coach",t}),MY=t=>({n:"me",t});
const GL=(id,f,t,l)=>({n:id,f,l:l||"casual",t});

/* ---------- ghost fighters ---------- */
Object.assign(QK,{
 tani:{fst:"counter",name:"Nang Tani (dream)",sprite:"tani",lvl:0,tilt:{speed:1.5,kick:1.5,foot:1,counter:1,dur:-1,power:-.5},color:"#3f8a4f",grp:"ghost"},
 krasue:{fst:"pressure",name:"Krasue",sprite:"krasue",lvl:.3,tilt:{speed:2,elbow:1.5,dur:-2,clinch:-1.5},color:"#b04fd0",grp:"ghost"},
 krahang:{fst:"footwork",name:"Krahang",sprite:"krahang",lvl:.3,tilt:{speed:1.5,kick:2,foot:1.5,power:-1},color:"#8a5a2b",grp:"ghost"},
 mabong:{fst:"power",name:"Phi Ma Bong",sprite:"mabong",lvl:.5,tilt:{power:2,kick:2,dur:1.5,iq:-1.5,guard:-1},color:"#3c3550",grp:"ghost"},
 phiphong:{fst:"inside",name:"Phi Phong",sprite:"phiphong",lvl:.4,tilt:{clinch:2,knee:1.5,power:1,foot:-1.5},color:"#d0602a",grp:"ghost"}});
const GSK={tani:[{id:"g_t_leaf",name:"Banana-leaf slap",k:"atk",w:"kick"},{id:"g_t_sabai",name:"Sabai wrap",k:"def"},{id:"g_t_lol",name:"Midnight giggle",k:"atk",w:"elbow"}],
 krasue:[{id:"g_k_fly",name:"Flying head-butt",k:"atk",w:"elbow"},{id:"g_k_glow",name:"Glowing entrails",k:"def"}],
 krahang:[{id:"g_h_fan",name:"Winnowing-basket gust",k:"atk",w:"kick"},{id:"g_h_fly",name:"Fly off to the roof",k:"def"}],
 mabong:[{id:"g_m_hoof",name:"Thunder-hoof kick",k:"atk",w:"kick"},{id:"g_m_neigh",name:"Terrifying neigh",k:"rec"}],
 phiphong:[{id:"g_p_light",name:"Phong-light in the eyes",k:"def"},{id:"g_p_grab",name:"Fishy clinch",k:"atk",w:"knee"}]};
TIER.dream={name:"Dream ghost fight",win:0,lose:0,rep:0,off:1};
TIER_BG.dream="bg_camp_night.webp";
/* the ghost is as strong as the fighter she meets, a little stronger when the camp's merit is low */
function ghFoe(G,kind,f){const K=QK[kind],S=ghSt(G),adj=(S.merit<25?1.2:S.merit<45?.5:S.merit>=70?-.5:0)-(kind!=="tani"&&S.shrine?.6:0),t=Math.min(19.2,qTarget(G,f.id)+adj+(K.lvl||0)),rng=mulberry32((G.seed^0x6a05)+gameWeek(G)*31+kind.length);const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_ghost_"+kind;const o=baseFighter(id,{name:K.name,full:K.name,div:"X",camp:"quest",color:K.color,potential:t+2,a});
  {const short=t-ovr(a);if(short>.05)o.vet=+Math.min(Q_VET_MAX,short).toFixed(2);}
  o.sprite=K.sprite;o.kind=kind;o.grp="ghost";o.fstyle=K.fst;o.nlsk=(GSK[kind]||[]).slice(0,S.merit<30?3:2);o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=80;G.F[id]=o;syncFighterAges(G);return id;}

/* ---------- merit sources ---------- */
const GH_ACT={
 bigmerit:{name:"Big merit: host monks for a meal at camp",desc:"Camp merit +16 · everyone's morale +4",cost:8000,merit:16},
 phapa:{name:"Join a pha pa offering at the temple nearby",desc:"Camp merit +12 · fame +0.3",cost:4000,merit:12,gap:6},
 kathin:{name:"Host a kathin ceremony",desc:"Camp merit +30 · everyone's morale +6 · fame +1 (once a year, after the Rains Retreat)",cost:20000,merit:30,win:GH_KATHIN,yearly:1},
 ordain:{name:"Sponsor summer novice ordination",desc:"Camp merit +24 · fame +1 (once a year, April)",cost:15000,merit:24,win:GH_ORDAIN,yearly:1},
 morphi:{name:"Hire a mor phi for an exorcism",desc:"The ghosts go quiet for a while… if the ritual works (no guarantee)",cost:6000,merit:0},
 shrine:{name:"Build Nang Tani's shrine by the banana grove",desc:"A permanent shrine · Nang Tani guards the camp, hints lottery numbers, keeps the fighters healthy",cost:60000,merit:5},
 offer:{name:"Make offerings at Nang Tani's shrine",desc:"Camp merit +4 · Nang Tani's in a good mood",cost:300,merit:4}};
const ghActOpen=(G,k)=>{const S=ghSt(G),A=GH_ACT[k];if(!S.on)return false;S.done=S.done||{};
  if(k==="morphi")return !S.shrine;if(k==="shrine")return S.shrineOK&&!S.shrine;if(k==="offer")return !!S.shrine;
  if(A.win&&!ghIn(G,A.win()))return false;if(A.yearly&&S.done[k]===(G.season||1))return false;if(A.gap&&S.done[k+"Abs"]!=null&&gameWeek(G)-S.done[k+"Abs"]<A.gap)return false;return true;};
for(const k of Object.keys(GH_ACT)){const A=GH_ACT[k];CAMP_ACTIONS["gh_"+k]={name:A.name,desc:A.desc,cost:A.cost,get hidden(){return typeof G==="undefined"||!G||!ghActOpen(G,k);}};}
const GH_MERIT_ACTS={merit:6,waikhru:10};
{const _d=doCampAction;doCampAction=function(G,k){const note=_d(G,k);if(note==null)return note;const S=ghSt(G);let add="";
  if(GH_MERIT_ACTS[k]){ghAdd(G,GH_MERIT_ACTS[k]);if(S.on)add=` · camp merit +${GH_MERIT_ACTS[k]}`;}
  if(k.startsWith("gh_")){const kk=k.slice(3),A=GH_ACT[kk],R=roster(G);S.done=S.done||{};S.done[kk]=G.season||1;S.done[kk+"Abs"]=gameWeek(G);if(A.merit)ghAdd(G,A.merit);
    if(kk==="bigmerit"){R.forEach(f=>f.morale=clamp(f.morale+4,0,100));add="Monks come to the camp for the midday meal. Kru Daeng kneels so long his legs go numb. Everyone smiles all day";}
    if(kk==="phapa"){G.rep+=.3;add="Everyone helps parade the pha pa tree. Kati plays the long drum off-beat the whole way, but everyone has fun";}
    if(kk==="kathin"){G.rep+=1;R.forEach(f=>f.morale=clamp(f.morale+6,0,100));add="Sirichai camp's kathin procession is nearly half a kilometre long. The whole subdistrict talks about it";}
    if(kk==="ordain"){G.rep+=1;add="Three temple boys are ordained as summer novices. They cry when their heads are shaved and beam once they can chant";}
    if(kk==="morphi"){const ok=Math.random()<.55;S.mp=(S.mp||0)+1;if(ok){S.calm=gameWeek(G)+6;add="Mor Phi Plian dances with a sword round the banana grove and sprays holy water until Kru Daeng is soaked. That night is perfectly quiet… for now at least";}
      else{S.mpFail=1;add="Mor Phi Plian gets halfway through the ritual, then flees the camp still holding a boiled chicken, leaving one sandal behind";}}
    if(kk==="shrine"){S.shrine=gameWeek(G);S.pendShrine=1;add="A small wooden shrine painted green, three-coloured silk tied round the banana tree. Kru Daeng lights the first incense";}
    if(kk==="offer"){S.tb=clamp((S.tb||0)+2,0,ghCap(G));add="Khanom tom, bananas and red soda laid before the shrine. The wind stirs the leaves, as if someone nodded";}
    return add+(A.merit?` · camp merit +${A.merit}`:"");}
  return note+add;};}
/* the merit bar sits on top of the camp-activity list once Tani is awake */
{const _h=campActsHTML;campActsHTML=function(){const h=_h();if(typeof G==="undefined"||!G||UI.modal.pick)return h;const S=ghSt(G);if(!S.on)return h;
  const m=S.merit,lab=m>=70?"Merit carries you":m>=45?"Cool and calm":m>=25?"Getting eerie":"Goosebumps everywhere";
  return h.replace("</h2>",`</h2><div class="ghbar" title="Camp merit"><span>🪷 Camp merit</span><i><b style="width: ${m}%"></b></i><em>${m} · ${lab}</em></div>`);};}

/* ---------- Tani wakes up ---------- */
const ghReady=G=>{try{return G.week>=6&&roster(G).length>=4&&students(G)>=30&&facTotal(G)>=8;}catch(e){return false;}};
EVENTS.push({id:"gh_wake",look:"casual",bg:"camp_night",pri:6,when:G=>!ghSt(G).on&&ghReady(G),steps:[
 N("Sirichai camp is busier than ever: rooms full, kids kicking pads in the course yard every evening. And the banana grove behind camp… gets kicked every day too"),
 C("Kicking banana trees, that's the real thing! When Kru was a kid there were no heavy bags — Kru kicked banana trees till his shins were like wood"),
 N("That night the wind stops at one a.m. The crickets go quiet. The dog next door howls three times and hides under the house"),
 GMON(),N("You open your eyes in the dream. You can't move. A woman in green stands by the bed, hair to the floor, glowing faint green"),
 TN("Who… kicks… my… banana trees…","scary"),
 MY("(You try to answer, but your mouth won't move)"),
 TN("Kicked every day… three hundred times a day… and at Loy Krathong… who made krathongs out of my trunks!!","scary"),
 TN("Three of them floated off… one with a crooked incense stick… I remember everything…","angry"),
 N("Then she sits on your chest, heavy as a fifty-kilo bag. You jolt awake at three a.m., pillow soaked in sweat"),
 GMOFF(),{n:"nar",t:"— The next morning —",bg:"camp",show:[]},
 C("Kru had a strange dream last night. A woman in green scolding Kru about banana trees…"),
 MY("…I had the same dream, Kru"),
 C("……"),
 N("The whole camp goes silent for three seconds, then everyone starts talking at once. Same dream for all — the only difference is who got sat on longer"),
 C("That's Nang Tani! The banana-tree ghost! We kick her home every day and float her trunks down the river… we need to make merit, fast"),
 C("Alms in the morning, the wai kru, pha pa offerings — anything that's merit. With plenty of camp merit, ghosts calm down. When it drops… she'll visit again"),
 N("🪷 “Camp merit” unlocked — see it in camp activities. Make merit, hold the wai kru or big merit events to raise it. Do nothing and it slowly runs down"),
 C("Kru will chant before bed tonight… every night, loudly. Apologies in advance to whoever's next door"),
],fx:null});
/* the wake event turns the system on (events have no fx, so a watcher does it right after) */
{const _rv=runEvents;runEvents=function(done){_rv(function(n){try{const S=ghSt(G);if(!S.on&&G.seen&&G.seen.gh_wake){S.on=1;S.wakeAbs=gameWeek(G);S.last=gameWeek(G);save();}}catch(e){}if(done)done(n);});};}

/* ---------- weekly: merit drifts down, the shrine looks after the fighters, story beats unlock ---------- */
function ghWeekly(G){const S=ghSt(G);if(!S.on&&G.seen&&G.seen.gh_wake){S.on=1;S.wakeAbs=gameWeek(G);S.last=gameWeek(G);}if(!S.on)return;
  if(gameWeek(G)-(S.mw??-99)>1)S.merit=clamp(S.merit-GH_DECAY,0,GH_MAX); /* no merit made last week: it runs down */
  if(S.merit>=45&&S.stage<1&&S.haunts>=1)S.stage=1;if(S.merit>=60&&S.stage<2&&S.haunts>=2)S.stage=2;
  if(!S.shrineOK&&S.merit>=60&&gameWeek(G)-(S.wakeAbs||0)>=6)S.shrineOK=1;
  if(S.shrine){for(const f of roster(G))f.fatigue=clamp(f.fatigue-(S.merit>=40?2:1),0,100);}
  if(S.sick&&G.F[S.sick]&&!G.F[S.sick].injury)S.sick=null;}
{const _w=xlWeekly;xlWeekly=function(G){_w(G);try{ghWeekly(G);}catch(e){console.error("ghost",e);}};}

/* ---------- the haunting: weekly extra scene ---------- */
const GH_OPEN=[
 [N("2:15 a.m. You wake to banana leaves rustling, though there's no wind at all"),N("You can't move. The blanket is heavy as lead. A green shadow crouches at the foot of the bed")],
 [N("Tonight Kru Daeng gets halfway through his chant and falls asleep on the prayer book"),N("You dream you're standing in a ring roped with banana trees. The referee is a human-sized gecko")],
 [N("The smell of khanom tom drifts into the bedroom at three a.m. Who makes sweets at three a.m."),N("You can't move your toes. Long hair slowly pours down from the ceiling")]];
const GH_TANI_LINE=[["Right… tonight I've come to collect the banana-tree rent","Someone kicked my tree again yesterday… one hundred and twelve times. I counted!","That's all the merit you made? I smelled one incense stick"],
 ["Back again… not because I missed you. I came because your camp's merit is low","Didn't losing to me last time teach you? Or did you win… I forget. Again, tonight!"],
 ["I'm still angry, you know. Just… a little less","Who left red soda in front of the banana grove… I'm not thanking you. Just asking"]];
const GH_ENTER={kati:"Kati bursts through the door of the dream in bear-print pyjamas. “Ghosts can be punched! Manager, stand back!”",
 mali:"Mali pops into the dream, crying and putting her guard up. “Mali is scared of ghosts more than anything… but nobody touches the manager!”",
 rin:"Rin walks into the dream with a notebook. “Ghosts aren't real, scientifically… so why are my legs shaking?”",
 ploy:"Ploy stands in the middle of the dream, arms crossed. “You're disturbing my camp's sleep? Get in the ring and we'll talk.”",
 fah:"Fah yawns. “Hmph, a ghost? Waking Fah at two a.m.?… Fine, Fah's awake now.”",
 prod_B:"Baiyok appears in the dream standing at attention: “Anomaly detected in the manager's dream. Commencing elimination.”",
 _:"{f} wanders into the dream, rubbing their eyes: “Manager… why are we on a banana-tree ring?”"};
const GH_MORN={kati:{w:"Last night Kati dreamt she fought a ghost lady in green — and won! …Why are you making that face, manager? You had the same dream!?",l:"Kati's burning up… dreamt a ghost kicked her with a banana leaf and woke up with a fever. Achoo!"},
 mali:{w:"Mali dreamt she beat the ghost! But Mali cried the whole fight… woke up with a soaked pillow",l:"Mali… shook all night. Dreamt she lost to the ghost in green, and she giggled in Mali's ear all night…"},
 rin:{w:"I dreamt I beat something… green. Scientifically, dreams are the brain sorting memories …right? Right?",l:"I have a fever. 38.4 degrees. Definitely nothing to do with ghosts… Manager, could you leave the light on for me?"},
 ploy:{w:"Last night Ploy dreamt she beat a ghost …stop smiling. Ploy wasn't scared",l:"…Ploy is a little unwell. Definitely not because of a dream. Don't tell anyone"},
 fah:{w:"Fah dreamt she kicked a ghost into a mango tree. Easy. So why is Fah so tired",l:"Achoo! …Fah didn't lose to a ghost. Fah let the ghost win out of pity"},
 prod_B:{w:"Dream log: win. Target retreated toward the banana grove. Baiyok requests adding banana trees to the watch list",l:"System… has a fever. Baiyok will rest one week. Please postpone all training sessions"},
 _:{w:"Last night I dreamt I fought a ghost — and won. Weird",l:"I've got a fever. Last night I dreamt a ghost slapped me with a banana leaf…"}};
const GH_CHEER={push:"Shout “Punch it! Ghosts have faces too!”",counter:"Rapid-chant “Itipiso…” for moral support",range:"Shout “Don't let it get close! It's freeezing!”",
 clinch:"Shout “Hold it!” …then change your mind: “Wait! Don't hug it!”",defend:"Shout “Guard up! You can wai while you're at it!”"};
const GH_CHEER_TANI=["“I heard you!”","“Quiet, I'm being cool”","“You shout more off-key than your kru chants”","“Hee hee, cheer me louder!”"];
const GH_CHEER_BACK=["“I knooow!”","“Manager, could you be quiet for a sec!”","“Why are you chanting Itipiso NOW!”","“I heard you! The whole dream heard you!”","(Nods while getting whacked by a ghost)"];
function ghHauntDue(G,rng){const S=ghSt(G);if(!S.on||S.shrine)return false;if(gameWeek(G)-S.last<GH_CD)return false;if(S.calm&&gameWeek(G)<S.calm)return false;
  const R=roster(G).filter(f=>!f.injury);if(!R.length)return false;const p=S.merit<25?.55:S.merit<45?.38:S.merit<70?.22:.12;return rng()<p;} /* even at merit 100 she still drops by now and then */
function ghPickFighter(G){const R=roster(G).filter(f=>!f.injury);const named=R.filter(f=>GH_ENTER[f.id]);const L=named.length&&Math.random()<.8?named:R;return L[Math.floor(Math.random()*L.length)];}
function ghHaunt(done){const S=ghSt(G),f=ghPickFighter(G);if(!f){done();return;}S.last=gameWeek(G);S.haunts++;save();
  const nm=f.name,enter=(GH_ENTER[f.id]||GH_ENTER._).replace(/\{f\}/g,nm),open=GH_OPEN[S.haunts%GH_OPEN.length],tl=GH_TANI_LINE[Math.min(2,S.stage)];
  const steps=[...open,TN(tl[S.haunts%tl.length]),N(enter),MY("(Want to help, but only your mouth can move… so, cheering only)"),
   {choice:[{t:`Cheer ${nm} with all your heart (dream fight)`,fx:()=>{UI.ghGo={fid:f.id,live:1};},then:[TN("Good… get up here!")]},
    {t:"Rapid-chant Itipiso with your eyes squeezed shut (skip the fight, let it resolve)",fx:()=>{UI.ghGo={fid:f.id,live:0};},then:[N("You get the Itipiso chant to its seventeenth round. The thumping in the dream slowly fades…")]}]}];
  ghPlay(steps,()=>{const go=UI.ghGo;UI.ghGo=null;if(!go){done();return;}ghFight(go.fid,go.live,done);},{bg:"dream_room",look:"casual"});}
/* with her shrine up, Nang Tani sometimes takes the dream fight herself — a little stronger than the fighter she stands in for */
function ghAlly(G,f){const K=QK.tani,t=Math.min(19.4,qTarget(G,f.id)+.8),rng=mulberry32((G.seed^0x7a11)+gameWeek(G));const a={};
  for(const [x] of ATTRS)a[x]=clamp(t+(K.tilt[x]||0)+(rng()*1.2-.6),3,19.5);const d=t-ovr(a);for(const [x] of ATTRS)a[x]=clamp(a[x]+d,3,19.5);
  const id="q_tani_ally",o=baseFighter(id,{name:TANI,full:TANI,div:"X",camp:"quest",color:K.color,potential:t+2,a});{const short=t-ovr(a);if(short>.05)o.vet=+Math.min(Q_VET_MAX,short).toFixed(2);}
  o.sprite="tani";o.kind="tani";o.grp="ghost";o.fstyle=K.fst;o.nlsk=GSK.tani.slice();o.lvl=clamp(Math.round(t-6),1,10);o.fatigue=0;o.morale=90;G.F[id]=o;syncFighterAges(G);return id;}
const GH_TANI_WIN=["I kicked it into the rice paddy. No need to thank me …you may, if it comes with red soda","Hmph! Country ghosts. Don't they know this camp has a guardian?","Crocodile Whips Its Tail! …I watch your boxers train every day — I know all the moves"];
function ghFight(fid,live,done,kind,taniOn){kind=kind||"tani";const f=G.F[fid],qid=ghFoe(G,kind,f),gn=GH_NAME[kind]||"the ghost",ally=taniOn?ghAlly(G,f):null;
  if(ally){const fin=win=>{const S=ghSt(G);delete G.F[qid];delete G.F[ally];if(win){S.wins++;S.tb=clamp((S.tb||0)+2,0,ghCap(G));}else S.merit=clamp(S.merit-3,0,GH_MAX);save();
      ghPlay([N(win?`Nang Tani spins and whips a banana leaf. ${gn} flies off into the dark`:`${gn} laughs out loud. Nang Tani staggers back against the corner post`),TN(win?GH_TANI_WIN[S.wins%GH_TANI_WIN.length]:"It was stronger than I thought tonight… make me a little more merit so I have the strength",win?"angry_smile":"angry"),
        GMOFF(),{n:"nar",t:"— The next morning —",bg:"camp",show:[]},GH_ENTER[f.id]?GL(f.id,"happy",`Last night I dreamt Nang Tani fought ${gn} for us — so cool! Nobody got a fever`):{n:"nar",t:`The whole camp wakes up refreshed. Nobody has a fever`}],done,{bg:"dream",look:"casual"});};
    if(!live){const F=quickFight(G.F[ally],G.F[qid],(G.seed^0xd2eb)+gameWeek(G)*13,GH_ROUNDS);fin(dmWinFrom(F)==="A");return;}
    const bk={id:"bdream"+gameWeek(G),a:ally,b:qid,week:G.week,tier:"dream",rounds:GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,1),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
    try{document.body.classList.add("dreamfx");}catch(e){}openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;fin(!!(F&&F.result&&F.result.win==="A"));});return;}
  const fin=win=>{const S=ghSt(G);delete G.F[qid];let sick=0;if(win)S.wins++;else if(!S.sick&&((S.fy&&S.fy[G.season||1])||0)<GH_FEVER_MAX){sick=S.merit<20?2:1;S.fy=S.fy||{};S.fy[G.season||1]=(S.fy[G.season||1]||0)+sick;f.injury=Math.max(f.injury||0,sick);S.sick=f.id;G.log.push(`${f.name} caught a fever after the haunting; out of training for ${sick} weeks`);}
    if(win)S.merit=clamp(S.merit+1,0,GH_MAX);save();
    const T=kind==="tani",M=T?(GH_MORN[f.id]||GH_MORN._):(GH_MORN2[f.id]||GH_MORN2._),line=pk(win?M.w:M.l).replace(/\{f\}/g,f.name).replace(/\{g\}/g,gn);
    const steps=[...(T?[N(win?`${f.name} swats the banana leaf away. Nang Tani retreats into her grove, leaving a giggle behind`:`${f.name} falls on the banana-tree ring. Nang Tani giggles and vanishes in a cold gust`),
      TN(win?"…I'll let it go today… I didn't lose, I'm just sleepy":"Hee hee hee. Make plenty of merit, then come challenge me again")]
      :[N(win?`${f.name} sends ${gn} flying off the stage. The ${GH_SOUND[kind]} fades into silence`:`${gn} laughs and vanishes into the dark. ${f.name} sinks to the canvas`),...(ghSt(G).shrine?[TN(win?"Begone! Don't let me see you round here again":"I couldn't stop it in time… I'll watch over the child myself tonight",win?"angry":"neutral")]:[])]),
      GMOFF(),{n:"nar",t:"— The next morning —",bg:"camp",show:[]},
      GH_ENTER[f.id]?GL(f.id,win?"happy":"sad",line):{n:"nar",t:line},
      ...(sick?[C(`${f.name} has a fever. Kru's giving her ${sick>1?"two weeks":"a week"} off …and Kru thinks it's time we made merit. Camp merit is only ${S.merit} now`)]:[C(win?"Beat a ghost in a dream… Kru has no idea how to log that":"")].filter(s=>s.t))];
    ghPlay(steps,done,{bg:"dream",look:"casual"});};
  if(!live){const F=quickFight(f,G.F[qid],(G.seed^0xd2ea)+gameWeek(G)*13,GH_ROUNDS);fin(dmWinFrom(F)==="A");return;}
  const bk={id:"bdream"+gameWeek(G),a:fid,b:qid,week:G.week,tier:"dream",rounds:GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,0),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
  try{document.body.classList.add("dreamfx");}catch(e){}
  openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;fin(!!(F&&F.result&&F.result.win==="A"));});}
/* in a dream fight the manager can only shout — the corner becomes a row of (useless, loud) cheers */
{const _c=cornerHTML;cornerHTML=function(F){const U=UI.fight;if(!U||!U.b||!U.b.dream)return _c(F);if(U.b.ctrl)return _c(F).replace(/src="[^"]*q_tani_ally[^"]*"/g,`src="${ASSET+"npc_tani_face.webp"}"`);
  return `<div class="corner px"><div class="chead"><b>Dream break ${F.round}</b><span class="chip">Landed ${F.A.rlanded}–${F.B.rlanded}</span><span class="chip warn">Can't move — you can only shout</span><span class="chip">🪷 Merit 60+ or the shrine lets you command the corner</span></div>
   <div class="opts">${Object.entries(GH_CHEER).map(([k,t])=>`<button data-act="ghcheer" data-v="${k}">${t}</button>`).join("")}</div></div>`;};}
Object.assign(ACT,{ghcheer:d=>{const U=UI.fight;if(!U||!U.b||!U.b.dream)return;const C=U.care;if(C&&!C.done){C.q=.5;C.done=true;try{applyCare(U.F,.5);}catch(e){}}
  U.pick=d.v;const L=U.F.A.f.id==="q_tani_ally"?GH_CHEER_TANI:GH_CHEER_BACK;U.caption={text:`${U.F.A.f.name}: ${L[Math.floor(Math.random()*L.length)]}`,side:"A"};ACT.cgo();}});
{const _q=questExtra;questExtra=function(done,rng){try{if(G&&!G.ended){const S=ghSt(G);
  if(ghStory(done)){S.lastAny=gameWeek(G);return true;}            /* the rare story beats keep their place */
  if(_q(done,rng))return true;                                      /* v1.91.144 (Man): the main quests go before any ghost */
  if(S.on&&gameWeek(G)-(S.lastAny??-99)>=GH_GAP){let hit=false;     /* at most one ghost scene every GH_GAP weeks, all kinds together */
    if(ghHauntDue(G,rng)){ghHaunt(done);hit=true;}
    else{const o=ghOtherDue(G,rng);if(o){ghOther(o,done);hit=true;}else if(ghOdd(G,rng)){ghOddPlay(done);hit=true;}}
    if(hit){S.lastAny=gameWeek(G);return true;}}}}catch(e){console.error("ghost",e);}return false;};}

/* ---------- story beats (played as weekly extras so they can carry state) ---------- */
function ghStory(done){const S=ghSt(G);if(!S.on)return false;
  if(S.mpFail===1){S.mpFail=2;save();playScene([N("Three days after the exorcism, a letter in messy handwriting arrives at camp"),{n:"npc",who:MP,img:"morphi",t:"Your camp has something strong. I can't continue. I'm keeping the fee to restore my own spirits. And… my left sandal — please post it to me"},C("Kru told you… make merit. It's cheaper too")],done,{bg:"camp",look:"casual"});return true;}
  if(S.shrineOK===1){S.shrineOK=2;S.sq=1;S.sqAbs=gameWeek(G);save();playScene([N("On a holy-day afternoon, Luang Pho from the temple next door walks by and stands looking at the banana grove for a long time"),
    {n:"npc",who:LP,img:"luangpho",t:"This camp makes a lot of merit; I see it every time… but this banana grove — someone lives here"},C("You can see her too, Luang Pho!"),
    {n:"npc",who:LP,img:"luangpho",t:"She isn't wicked. She's just hurt. Her home gets kicked every day and nobody ever apologised… build her a shrine. She'll look after this place"},
    C("Nang Tani's shrine… Kru thinks that's good, manager. Tie three-coloured silk, offer khanom tom, and… stop kicking the trees near it"),
    N("🏮 Nang Tani's shrine quest begins — first step: find a spot for the shrine (it happens by itself next week)")],done,{bg:"temple",look:"casual"});return true;}
  if(S.pendShrine){S.pendShrine=0;S.stage=3;save();playScene([N("The first night after the shrine goes up, a cool breeze blows. No howling dogs. No smell of khanom tom at three a.m."),
    N("But you still dream of her… this time she sits on the wooden shrine's ledge, swinging her feet, not on your chest"),
    TN("…A green shrine, three-coloured silk, and the khanom tom is still warm","shy"),TN("I'm not touched! It's just… nobody ever built me a house before","angry_smile"),
    MY("I'm sorry about the banana trees — the kicking, and the krathongs"),
    TN("Hmph… an apology years too late. Still better than none","neutral"),
    TN("Very well. From now on I'll look after this camp. Any ghost who wants trouble goes through me first. I'll keep the children here from injury and fever","smile"),
    TN("And if your kru wants a lottery ticket… whisper to me first. No guarantees, but I often see numbers floating in the dew","smile"),
    TN("Oh, and the tree next to the shrine — never kick it! The others you may. Gently","angry_smile"),
    N("🏮 Nang Tani's shrine stands: she guards the camp · fighters recover from fatigue faster every week · she hints lottery numbers when Kru Daeng asks you to buy · make offerings at the shrine in camp activities")],done,{bg:"camp_night",look:"casual"});return true;}
  return false;}

/* ---------- the shrine whispers a lottery number ---------- */
{const _p=lottoPickHTML;lottoPickHTML=function(i){const h=_p(i);const S=G&&G.gh;if(!S||!S.shrine)return h;const k=ghLottoK(G,i);
  return h.replace('<div class="ltgrid">',`<p class="ghhint"><img src="${ASSET+"npc_tani_face.webp"}" alt="">Nang Tani whispers as Kru Daeng lights incense at the shrine: “Ticket ${k+1}… I saw this number floating in the dew this morning”</p><div class="ltgrid">`).replace(`data-v="${k}"`,`data-v="${k}" style="outline:3px solid #6fcf7f;outline-offset:2px"`);};}
const ghLottoK=(G,i)=>((G.seed||1)+(G.season||1)*7+i*3)%6;
{const _b=lottoBuy;lottoBuy=function(G,i,k){const d=_b(G,i,k);try{if(d&&G.gh&&G.gh.shrine&&k===ghLottoK(G,i))d.tani=1;}catch(e){}return d;};}
{const _r=lottoResult;lottoResult=function(G,d){const R=_r(G,d);if(d.tani&&R.out==="none"){const r=mulberry32((G.seed||1)*131+d.season*17+d.i);const x=r(),p=d.pick||"000000";
    if(x<.25){R.out="last2";R.l2=p.slice(-2);R.prize=LOTTO_PRIZE.last2;}else if(x<.33){R.out="last3";R.l3=p.slice(-3);R.prize=LOTTO_PRIZE.last3;}}return R;};}

/* ---------- test hook: the test save gets Tani awake and a haunt ready ---------- */
{const _t=xlTestSetup;xlTestSetup=function(G){_t(G);try{const S=ghSt(G);S.on=1;S.wakeAbs=gameWeek(G)-8;S.last=-99;S.merit=30;G.seen=G.seen||{};G.seen.gh_wake=true;}catch(e){console.error(e);}};}

/* ================= Phase 2: the Rains Retreat, the other ghosts, the girls' ghost stories, odd happenings ================= */
/* v1.91.144 (Man): through the Rains Retreat Luang Pho must stay at his temple and can't come out to help — the other ghosts come out then, and often */
const GH_SEASON=()=>GH_LENT();
const GH_OTHER=["krasue","krahang","mabong","phiphong"];
const GH_NAME={krasue:"Krasue",krahang:"Krahang",mabong:"Phi Ma Bong",phiphong:"Phi Phong",tani:"Nang Tani"};
const GH_SOUND={krasue:"Hee… hee… hee…",krahang:"Flap! Flop! Flap! Flop!",mabong:"Neeeeigh!",phiphong:"Sniff… sniff… smells like pla ra…"};
EVENTS.push({id:"gh_lp_go",annual:true,look:"casual",bg:"temple",pri:3,when:G=>ghSt(G).on&&ghIn(G,GH_SEASON()),steps:[
 N("First day of the Rains Retreat: the whole camp offers a Lent candle at the temple next door. Luang Pho walks you to the temple gate"),
 {n:"npc",who:LP,img:"luangpho",t:"For these three months I must stay in the temple for the Rains Retreat. I can't spend a night outside — if something troubles you at night, I can't come to help"},
 C("Three whole months, Luang Pho… Kru will chant twice a day"),
 {n:"npc",who:LP,img:"luangpho",t:"Chant by all means, but the right one — last time I heard you doing the victory blessing before bed …Bad things know the monks won't leave the temple now, so they like to wander. Make merit and your heart won't waver"},
 N("🌙 During the Rains Retreat (late Jul–late Oct) Luang Pho stays in his temple, and other ghosts come out often — high camp merit or Nang Tani's shrine helps a lot")]});
EVENTS.push({id:"gh_lp_back",annual:true,look:"casual",bg:"temple",pri:2,when:G=>{const S=ghSt(G),L=GH_LENT();return S.on&&G.seenY&&G.seenY.gh_lp_go===(G.season||1)&&G.week>L[1]&&G.week<=L[1]+6;},steps:[
 N("End of the Rains Retreat: the Tak Bat Devo alms round at dawn. Luang Pho smiles wider than ever"),
 {n:"npc",who:LP,img:"luangpho",t:"The Retreat is over. I can go where I like again …I hear a lot came visiting your camp these three months"},
 C("Plenty, Luang Pho. Kru chanted until he knows the whole book by heart")]});
const ghSight={
 krasue:f=>[N(`One a.m. ${f} gets up for the bathroom and sees a purple light floating low by the chicken coop behind camp`),{n:"_f",t:"Manager! A lost lantern… wait, why does the lantern have a face!"},
   N("The light turns and smiles. Long hair spills out, something glittering dangles below — then it shoots off into the dark"),C("Krasue! Cover every water jar, bring in the laundry! …Kru's pha khao ma is still out — someone grab it")],
 krahang:f=>[N("Flapping on the camp roof all night, like someone fanning with two winnowing baskets"),{n:"_f",t:"Manager… someone can fly! Winnowing baskets for wings, riding a rice pestle!"},
   C("Krahang! Never leave baskets and pestles outside …Kru bets it borrowed Auntie Taew's"),N("Next morning Auntie Taew comes complaining that two of her winnowing baskets and a pestle are missing")],
 mabong:f=>[N("In the dead of night a “NEIGH!” comes from the field behind camp, then hooves galloping three times round the camp"),{n:"_f",t:"Whose horse is running around at two a.m.? Are there even horses in Chiang Mai?"},
   C("Phi ma bong… a true northern ghost. Whoever it possesses runs and neighs like a horse all night …who ran round the camp last night? Hands up"),N("Nobody raises a hand, but two morning-course students have legs as sore as if they ran a marathon")],
 phiphong:f=>[N("An orange light flickers by the ditch, and a fishy smell drifts over in waves"),{n:"_f",t:"Such a big firefly… why does it have a nose, and why is the light coming out of it"},
   C("Phi phong! The light comes out of its nostrils and it loves raw, fishy things. Lid on the pla ra in the kitchen!"),N("In the morning half the camp's small jar of pla ra is gone, greasy fingerprints on the lid")]};
const GH_GOPEN={krasue:[N("You dream you're standing in a ring in the middle of a rice field. A woman's head floats around it, its entrails glittering like fairy lights")],
 krahang:[N("In the dream the ring sits on the camp roof. A thin man spreads two rice-winnowing baskets and glides down into the blue corner")],
 mabong:[N("In the dream, hooves stamp the canvas — thud, thud. A black, red-eyed horse stands on two legs with its guard up")],
 phiphong:[N("In the dream every light in the arena goes out, except an orange glow from someone's nose in the blue corner")]};
const GH_MORN2={kati:{w:"Kati dreamt she punched {g} until it ran away! Cool-season ghosts aren't scary at all",l:"Achoo… Kati dreamt she lost to {g} and woke up with a fever. Not fair!"},
 mali:{w:"Mali beat {g} too! …but can Mali sleep in Kru Daeng's room one more night?",l:"Mali's not feeling well… dreamt about {g} all night"},
 rin:{w:"I dreamt I beat {g}. I noted its features in case there's research on this",l:"38.2 degrees. Definitely nothing to do with {g} …Manager, close the window please"},
 ploy:{w:"Last night Ploy beat {g}. No need to tell anyone",l:"Ploy's a little unwell …{g} was only a dream"},
 fah:{w:"Fah kicked {g} two rice fields away. Easy",l:"Achoo! Fah didn't lose to {g}. Fah was just sleepy"},
 prod_B:{w:"Log: target {g} eliminated in a dream. Baiyok requests adding {g} to the database",l:"System has a fever… {g} is not in the database, so it could not be blocked"},
 _:{w:"Last night I dreamt I beat {g}",l:"I've got a fever. Last night I dreamt I lost to {g}"}};
function ghOtherDue(G,rng){const S=ghSt(G);if(!S.on||!ghIn(G,GH_SEASON()))return null;S.og=S.og||{};const yr=G.season||1;
  if(gameWeek(G)-(S.lastO??-99)<3)return null;S.ogSeen=S.ogSeen||{};const fresh=GH_OTHER.filter(k=>S.ogSeen[k]!==yr),left=fresh.length&&rng()<.5?fresh:GH_OTHER;
  const p=(S.merit<40?.6:S.merit<70?.45:.3)*(S.shrine?.6:1)*((S.th||0)>=3?.75:1);if(rng()>=p)return null;return left[Math.floor(rng()*left.length)];} /* v1.91.144 (Man): often, all Lent long, and never quite gone even at merit 100 */
function ghOther(kind,done){const S=ghSt(G),yr=G.season||1;S.lastO=gameWeek(G);S.og=S.og||{};S.ogSeen=S.ogSeen||{};const seen=S.ogSeen[kind]===yr;
  const R=roster(G).filter(f=>!f.injury);if(!R.length){done();return;}const named=R.filter(f=>GH_ENTER[f.id]),f=(named.length?named:R)[Math.floor(Math.random()*(named.length?named:R).length)];
  if(!seen){S.ogSeen[kind]=yr;save();const st=ghSight[kind](f.name).map(s=>s.n==="_f"?(GH_ENTER[f.id]?GL(f.id,"surprised",s.t):{n:"nar",t:`${f.name}: ${s.t}`}):s);
    ghPlay([N("— Something strange in the night —"),...st,...(S.shrine?[TN("Hmph… the Rains Retreat lot have arrived. I'll keep an eye out","angry_smile")]:[])],done,{bg:"camp_night",look:"casual"});return;}
  S.og[kind]=yr;save();const enter=(GH_ENTER[f.id]||GH_ENTER._).replace(/\{f\}/g,f.name),tani=S.shrine&&Math.random()<.45;
  const steps=[pk(GH_GOPEN[kind]),{n:"npc",who:GH_NAME[kind],t:GH_SOUND[kind]},
   ...(tani?[TN("Stand back, children. Tonight I'll handle this myself!","angry"),N("A green light shoots down into the ring. Nang Tani tucks up her sarong and raises a guard she's learned from watching the camp train every day")]
     :[N(enter),...(S.shrine?[TN("Stop right there! This camp already has a guardian… me!","angry"),TN("Boxer, hit it! I'll hold the ring for you — it'll weaken on its own","angry_smile")]:[])]),
   MY("(Can't move again… so, shouting only)"),
   {choice:[{t:tani?"Cheer Nang Tani with all your heart (dream fight)":`Cheer ${f.name} with all your heart (dream fight)`,fx:()=>{UI.ghGo={fid:f.id,live:1,tani};}},{t:"Rapid-chant Itipiso (skip the fight, let it resolve)",fx:()=>{UI.ghGo={fid:f.id,live:0,tani};},then:[N("You chant Itipiso twelve times. The sounds in the dream fade little by little…")]}]}];
  ghPlay(steps,()=>{const go=UI.ghGo;UI.ghGo=null;if(!go){done();return;}ghFight(go.fid,go.live,done,kind,go.tani);},{bg:"dream_room",look:"casual"});}

/* ---------- the girls' ghost stories (one each, once Tani is awake) ---------- */
const ghGirl=(id,b=12)=>G=>{const S=ghSt(G);return S.on&&inCamp(G,id)&&(G.F[id].bond||0)>=b&&gameWeek(G)-(S.wakeAbs||0)>=3;};
const BOND=(id,v)=>({inject:G=>{add(G,id,"bond",v);return [];}});
EVENTS.push(
 {id:"gh_kati",look:"casual",bg:"camp_night",when:ghGirl("kati"),steps:[
  N("One a.m. You find Kati patrolling the camp with a coconut-rib broom as a weapon and a headlamp on"),
  GL("kati","happy","Manager! Kati will guard the camp. If a ghost comes, Kati will hit it with the broom like Crocodile Whips Its Tail!"),
  MY("Can you hit a ghost with a broom?"),GL("kati","flustered","Dunno. But grandma said ghosts are scared of brooms… or was it witches… which one?"),
  N("The leaves behind camp sway though there's no wind. Kati whirls round, broom up in guard"),TN("…Whack who with a broom?","angry_smile"),
  GL("kati","surprised","…M-m-manager, RUN!!"),N("Kati runs three steps, then turns back and drags you along by the arm. The broom lies in the middle of the yard"),
  N("The next morning the broom is propped neatly against Kati's door, a green ribbon tied round the handle"),GL("kati","flustered","…She even gave it back. So kind. Kati's sorry she was going to whack you!"),BOND("kati",2)]},
 {id:"gh_mali",look:"casual",bg:"camp_night",when:ghGirl("mali"),steps:[
  N("Mali knocks on your door at eleven, hugging a bolster pillow"),GL("mali","sad","Manager… Mali can't sleep. Someone's giggling in the banana grove"),
  MY("Maybe you heard wrong. Could be a cat"),GL("mali","sad","Can cats laugh “hee hee hee”…?"),
  N("Mali asks to sit and read comics with you until midnight, then dozes off in the chair, still mouthing the Itipiso chant"),
  TN("…This child is that scared of me?","neutral"),N("A thin blanket floats over and settles on Mali's shoulders by itself. You look, but see no one"),
  GL("mali","happy","(Next morning) Did the manager put a blanket on Mali? Thank you!"),MY("…Mm, yeah, yeah"),BOND("mali",2)]},
 {id:"gh_rin",look:"casual",bg:"camp_night",when:ghGirl("rin"),steps:[
  GL("rin","happy","I set up three infrared cameras around the banana grove. If there's a ghost, we'll have proof. If not, everyone can stop being scared"),
  N("The next morning Rin calls everyone to watch the clip"),GL("rin","surprised","…There's only one thing in the footage all night"),
  N("On screen: Kru Daeng in elephant-print pyjamas, walking seven times around the banana grove with incense, mumbling chants, at 2:15 a.m."),C("…Kru was making merit. You can make merit at two a.m."),
  GL("rin","flustered","But camera three… someone covered the lens with a banana leaf from three a.m. till morning. There are green fingerprints"),N("The room goes silent. Rin deletes the file in front of everyone"),
  GL("rin","sad","No evidence, no ghost. The end …Manager, would you walk me to my room tonight?"),BOND("rin",2)]},
 {id:"gh_ploy",look:"casual",bg:"camp_night",when:ghGirl("ploy"),steps:[
  N("Ploy's room has a dim light on all night. You only notice walking past"),GL("ploy","angry","A dim light helps you sleep. Nothing to do with ghosts"),
  N("Suddenly a horse's “NEIGH!!” rings out from the rice field. Ploy grabs your arm so hard her nails dig in"),MY("…Ploy. My arm"),
  GL("ploy","flustered","Ploy was just… checking the manager's pulse, to see if you were scared …your pulse is racing, manager"),
  N("The sound turns out to be Uncle Khiao's horse from next door, loose from its pen — not a horse ghost"),GL("ploy","pout","Don't tell anyone. If you do, Ploy will say the manager screamed"),BOND("ploy",2)]},
 {id:"gh_fah",look:"casual",bg:"camp_night",when:ghGirl("fah"),steps:[
  GL("fah","happy","Fah will sleep under the banana grove for one night. If there's no ghost, everyone buys Fah a milk tea"),N("One a.m. Fah lies on a mat under the banana trees playing on her phone. You watch from the window"),
  TN("…What are you playing, shining light in my face?","angry"),GL("fah","surprised","…Whoa, a real ghost. Nice dress. Can we take a selfie?"),TN("If you take it, will I show up on your camera…","neutral"),
  N("The two of them talk until three. Fah teaches Nang Tani a match-three game; Nang Tani teaches Fah how to pick lottery numbers"),
  GL("fah","happy","(Morning) Fah lost the bet — the ghost is real …but Fah made a new friend. She's better at the game than Fah. Annoying"),BOND("fah",2)]},
 {id:"gh_baiyok",look:"casual",bg:"camp_night",when:G=>ghGirl("prod_B",10)(G)&&ghSt(G).shrine,steps:[
  {n:"npc",who:"Baiyok",t:"Baiyok has inspected Nang Tani's shrine for three nights. The temperature around it is 2.4 degrees below normal. No explanation in the database"},
  TN("This robot girl has been staring at me for three nights…","angry_smile"),{n:"npc",who:"Baiyok",t:"…Voice detected. No source"},
  N("Baiyok's ponytail slowly braids itself into two plaits before your eyes. Baiyok stands perfectly still"),{n:"npc",who:"Baiyok",t:"……Error. Error"},
  TN("Hee hee, cute. Such long pretty hair, I just helped braid it","smile"),
  {n:"npc",who:"Baiyok",t:"(In the morning Baiyok is still in braids) …Baiyok has decided not to change her hair. The data says… it looks good"}]});

/* ---------- odd happenings (light, every so often; more of them when merit is low) ---------- */
const GH_ODD=[
 f=>[N("Two a.m. A light blinking three colours hangs still over the rice field behind camp for almost an hour"),{n:"_f",t:"UFO! Manager, a UFO!"},C("That's a drone filming Uncle Khiao's ordination party… probably. Kru's not sure. Do they ordain at night?")],
 f=>[N("The whole camp hears a ranat playing the Sarama faintly at midnight, though there's no temple fair nearby"),C("…That's my phone. I set an alarm and forgot to turn it off. Sorry")],
 f=>[N("This morning there are tiny footprints on the kitchen ceiling, walking from the corner to the rice pot"),{n:"_f",t:"Must be a ghost child!"},N("A gecko as big as an arm pokes its head from behind the cupboard, looks at everyone, and calls “To-kay!” once")],
 f=>[N("Kru Daeng has chanted before bed every night for three weeks. Tonight he's extra loud"),C("Itipiso bhagava… who turned on Kru's fan! Kru didn't turn it on! Araham!"),N("That fan has been broken for two months")],
 f=>[N("Auntie Taew's rooster crows three times at midnight. The dog next door howls back twice. The cat says nothing"),C("They say a rooster crowing at midnight is a bad omen… or the rooster set its clock wrong")],
 f=>[N("Someone has written three digits on a banana leaf at the camp gate in white powder"),C("What number is that… Kru's just writing it down. Not buying. Just writing"),N("The whole camp copies it down. Auntie Taew does too. Uncle Khiao posts a photo in the village group")],
 f=>[N("A black cat climbs into the middle of the camp ring and sits there all afternoon. Nobody can shoo it away"),{n:"_f",t:"Is it here to sign up as a boxer?"},C("If it can box, I'll sign it. One mackerel a day")],
 f=>[N("The community radio in the kitchen turns itself on at four a.m. and plays the same country song on repeat until morning"),{n:"_f",t:"This song… is it “Butterfly Tears”?"},C("Ghosts like sad songs. Let's put on something upbeat instead")],
 f=>[N("The evening course kids say they saw a monk walk past the camp at nine, while Luang Pho is staying inside his temple for the Rains Retreat"),C("…A monk from another temple, maybe, out on alms at the wrong hour. Don't overthink it. And… let's all sleep in one room tonight")]];
function ghOdd(G,rng){const S=ghSt(G);if(!S.on||gameWeek(G)-(S.lastOdd??-99)<3)return false;if(rng()>=(S.merit<30?.16:S.merit<60?.09:.05))return false;return true;}
function ghOddPlay(done){const S=ghSt(G);S.lastOdd=gameWeek(G);S.oddI=((S.oddI??-1)+1)%GH_ODD.length;save();const R=roster(G).filter(f=>GH_ENTER[f.id]),f=R[Math.floor(Math.random()*R.length)];
  const st=GH_ODD[S.oddI](f?f.name:"").map(s=>s.n==="_f"?(f?GL(f.id,"surprised",s.t):{n:"nar",t:"A course kid: "+s.t}):s);ghPlay([N("— Strange things in camp —"),...st],done,{bg:"camp_night",look:"casual"});}


/* ================= Phase 3: sitting with Nang Tani at her shrine (friendship, not romance) ================= */
/* once a week, in place of spending time with a fighter; topics never repeat until all are heard; heart scenes at 20/40/70 */
const TT=[
 {k:"green",o:[TN("Why are you staring at my dress… I've worn green since I was born. I was born from a banana tree — should I wear red?","angry_smile")],
  c:[["Green suits you",3,"…Sweet talker. I won't fall for it, but thank you","shy"],["Ever tried another colour?",0,"If I wore yellow, people would think I'm a banana-flower ghost. Never","angry"],["How do you wash hair that long?",2,"Morning dew. Free. No shampoo. Humans are so pitiful","smile"]]},
 {k:"lotto",o:[TN("I've wondered for ages… why do people scratch my tree looking for lottery numbers? It hurts, you know","angry")],
  c:[["I'm sorry on everyone's behalf",3,"Hmph… you're the first to apologise on everyone else's behalf. Strange","shy"],["So what's next draw's number?",-1,"See! Only ever asking for numbers! …The last two digits have a seven. Off you go","angry_smile"],["I'll put up a ‘no scratching’ sign",2,"Make it big, and write ‘Owner of this tree is fierce’","smile"]]},
 {k:"daeng",o:[TN("Your kru… chants every night, but half the chants are wrong. Last night he did the merit-sharing water chant before bed","neutral")],
  c:[["The kru's just scared",2,"I know. That's why I turned his fan on as a joke, hee hee… oh, should I not have said that?","angry_smile"],["Teach the kru the right chant, please",3,"I'm a ghost, not a monk! …but I'll go whisper in his ear tonight","smile"],["No pranking the kru",1,"Fine, no tricks… I'll just turn the fan on to keep him cool","neutral"]]},
 {k:"snack",o:[TN("The khanom tom offered yesterday… who made it? The coconut was a bit too sweet, but I ate it all","smile")],
  c:[["What sweets do you like best?",2,"Khanom tom, khao tom mat, bananas in coconut milk… wait, no bananas in coconut milk. That's like eating a relative","angry"],["Next time I'll bring fried bananas",-2,"……How about I deep-fry your bones","scary"],["And red soda?",2,"Red soda must be cold, lots of ice. Ghosts get hot too","smile"]]},
 {k:"radio",o:[TN("Last night I listened to the community radio in the kitchen. A game show — someone got question two wrong and still went home with balm. I laughed till my tree shook","smile")],
  c:[["I've been on that show",3,"Really!? Did the seventh mortar really pound by itself? …Don't tell me. I don't want to know. I want to believe","shy"],["Ghosts can listen to the radio?",1,"I can, but I can't change the station, so it's country music all night","neutral"],["Next time I'll call you as my lifeline",2,"Call, then… I don't have a phone, but I'll whisper in your ear","angry_smile"]]},
 {k:"girls",o:[TN("The girls in your camp… I've been watching a long time. Some sneak looks at you during training. I see everything","angry_smile")],
  c:[["Who?",1,"I won't tell. I'm a ghost, not a matchmaker …but the one with the red-and-white cord looks most often","smile"],["Don't tease them",2,"I don't tease them. I just tuck them in while they sleep… sometimes I braid their hair","shy"],["Are you lonely?",3,"……You ask far too directly","shy"]]},
 {k:"fear",o:[TN("Do you know what I'm most afraid of?","neutral")],
  c:[["Chanting?",0,"Not at all, I like listening — even if your kru chants off-key","smile"],["Termites?",2,"…Yes! They eat my trees! No ghost is as scary as a big swarm of termites","scary"],["A chainsaw",3,"Don't say that word… I get goosebumps, and I'm a real ghost","angry"]]},
 {k:"moon",o:[TN("On full-moon nights I'm strongest. If any ghost wanders around that night, I'll kick it into the rice paddy","smile")],
  c:[["You can kick?",2,"Boxers have kicked me for a hundred years — I know every move! Crocodile Whips Its Tail… whoosh!","angry_smile"],["Come and teach the kids sometime",3,"I could teach. But the kids wouldn't sleep for three nights","smile"],["Don't kick too hard",1,"Not hard. Just enough to remember it in their next life","neutral"]]},
 {k:"slang",o:[TN("I heard the course kids say “lit” and “queen” …what do they mean? I want to use them","neutral")],
  c:[["“Queen” means the best at something",3,"Then I'm the queen of banana-tree ghosts in Chiang Mai! …Did I say it right? Is it lit?","smile"],["Don't. It doesn't suit a ghost",0,"Hmph. People turn ghosts into memes these days — I have to keep up","angry"],["“Lit” means really good",2,"My shrine… is lit! Hee hee","shy"]]},
 {k:"kicks",o:[TN("The kids kicked the back tree today… but they came and bowed at the shrine first, so I let it go","smile")],
  c:[["I told everyone to ask permission before kicking",3,"…Thank you. Just ask first, and I'd give you the whole grove","shy"],["Can they kick the other trees instead?",1,"You may. But not the one that's flowering — the little one will get scared","neutral"],["Better buy more heavy bags",2,"Good! Spend the money on bags. My banana trees can live in peace","smile"]]}];
const TH=[
 {at:20,steps:()=>[N("Tonight you sit at the shrine longer than usual. Nang Tani sits on its roof, swinging her feet"),
  TN("Do you know… who planted this banana grove?","neutral"),MY("No idea"),
  TN("Your own grandfather. When he was young — no camp, no heavy bags, just banana trees and a dream","smile"),
  TN("Every morning before kicking, he'd raise his hands in a wai and say, ‘May I borrow your tree, lady? Three hundred kicks today’ — and in the evening he'd water it","shy"),
  TN("After he died… nobody asked me again. They just kicked, and then floated me down the river","neutral"),
  MY("So when you were haunting everyone…"),TN("I just wanted someone to remember that somebody lives here… even a ghost gets lonely","shy"),
  N("The wind stirs the banana leaves gently, as if someone is nodding"),N("💚 Your bond with Nang Tani grows")]},
 {at:40,steps:()=>{const f=roster(G).find(x=>x.injury>0)||roster(G)[0];const nm=f?f.name:"one of the kids";return [
  N(`That night ${nm} was down with a fever. You went to check on her late at night`),N("Beside the mattress, Nang Tani kneels, slowly fanning with a banana leaf"),
  TN("Shh… keep it down. She just fell asleep","neutral"),MY("You were the one giving everyone fevers at first, you know"),
  TN("I know… back then I was angry. Now I sit with them to pay it back","shy"),TN("The fever's down. She can eat rice porridge this morning. Don't make her train hard, or I'll haunt you instead","angry_smile"),
  N(`The next morning, ${nm} woke up refreshed, saying she dreamt a woman in green sang lullabies all night — slightly off-key`),N("💚 Your bond with Nang Tani grows")];}},
 {at:70,steps:()=>[N("Loy Krathong night. The whole camp went to the river; you come back to the shrine holding one bread krathong"),
  TN("…A bread krathong. Not banana trunk","shy"),MY("This year I made everyone use bread. The fish can eat them too"),
  TN("Hee hee hee… you really are crazy","smile"),N("Nang Tani floats down and sits beside you — the closest she has ever sat. She's cool as morning dew"),
  TN("I'm a ghost, you're a person. I'll be here another hundred years; you've got a few decades","neutral"),
  TN("But I think… we can be friends. Friends who watch over this camp together, until you're too old to kick a banana tree","smile"),
  MY("Friends it is"),TN("Good! Then a friend brings red soda every Buddhist holy day. Don't forget!","angry_smile"),
  N("Far away, fireworks burst over the river. A faint green light rises from the banana grove and mixes with the sparks"),N("💚 Nang Tani is your close friend now — she'll guard the camp even harder")]}];
function ghTalk(){const S=ghSt(G);if(!S.shrine||G.freeUsed)return;G.freeUsed=true;S.tb=S.tb||0;S.th=S.th||0;S.tt=S.tt||[];
  const heart=TH.find((h,i)=>i>=S.th&&S.tb>=h.at);
  if(heart){S.th=TH.indexOf(heart)+1;S.tb=clamp(S.tb+3,0,ghCap(G));save();playScene([N("You walk to Nang Tani's shrine"),...heart.steps()],()=>render(),{bg:"camp_night",look:"casual"});return;}
  let pool=TT.filter(t=>!S.tt.includes(t.k));if(!pool.length){S.tt=[];pool=TT;}const T=pool[Math.floor(Math.random()*pool.length)];S.tt.push(T.k);save();
  playScene([N("You walk to Nang Tani's shrine and light one incense stick. A soft green glow drifts down to sit on the shrine's ledge"),...T.o,
   {choice:T.c.map(([t,v,r,img])=>({t,fx:()=>{S.tb=clamp((S.tb||0)+2+v,0,ghCap(G));save();},then:[TN(r,img)]}))},
   {inject:()=>[N(`💚 Closeness with Nang Tani ${S.tb}`)]}],()=>render(),{bg:"camp_night",look:"casual"});}
Object.assign(ACT,{ghtalk:()=>{UI.modal=null;ghTalk();}});
/* she sits at the end of the people list once the shrine stands */
{const _p=peopleHTML;peopleHTML=function(){const h=_p();const S=G&&G.gh;if(!S||!S.shrine)return h;const tb=S.tb||0;
  return h+`<div class="pcard ghcard"><img class="face" src="${ASSET+"npc_tani_face.webp"}" alt=""><div><b>Nang Tani</b><small>The camp's guardian spirit · closeness ${tb}/100${S.th>=3?" · best friends":""}</small></div>
   <button class="btn sm primary" data-act="ghtalk" ${G.freeUsed?"disabled":""}>Sit at the shrine</button></div>`;};}


/* ================= Phase 4 (v1.91.144, Man): a three-year Tani arc, then a merit-keeping loop =================
   Year 1 after she wakes — chaos: Tani and the Lent ghosts haunt; no shrine yet; ends with the dark-moon brawl where Tani "doesn't help".
   Year 2 — merit: Luang Pho's advice, finding the spot, the teak, Tani's test, then the shrine (฿60,000).
   Year 3 — closeness: deeper talks, her blossom day, Loy Krathong together, the Lent truce with the four ghosts.
   After that — a loop: keep merit up or her shrine gathers dust and she sulks (and haunts) until you make it up to her. */
const ghYear=G=>{const S=ghSt(G);if(S.ys==null)S.ys=S.shrine?Math.max(1,(G.season||1)-1):S.wakeAbs?Math.floor((S.wakeAbs-1)/52)+1:(G.season||1);return Math.max(1,(G.season||1)-S.ys+1);};
const pk=x=>Array.isArray(x)?x[Math.floor(Math.random()*x.length)]:x;
const LPS=t=>({n:"npc",who:LP,img:"luangpho",t});

/* --- more variety for every repeating beat --- */
GH_OPEN.push(
 [N("Three a.m. exactly. The kitchen clock ticks backward twice, then stops."),N("Your blanket is being pulled down, little by little, as if someone wants you awake.")],
 [N("A light rain falls all night, but the drops on the window run upward."),N("The shadow of a banana leaf on the wall stretches and stretches until it becomes a woman's hand.")],
 [N("You dream you're eating sticky rice with Kru Daeng. He turns and smiles, and his face slowly goes green."),N("\"Hee hee, just kidding, it's me,\" says a woman's voice from Kru Daeng's mouth.")],
 [N("A cold breath brushes your neck though the window is shut. The ceiling fan turns slowly though it isn't plugged in."),N("At the foot of the bed lie three banana sheaths in a row, chalked: 3… 2… 1…")]);
GH_TANI_LINE[0].push("I saw you in the daytime… walking past my grove in flip-flops without so much as a wai.","The moon's not full tonight, but my temper is.");
GH_TANI_LINE[1].push("Your fighters kicked my tree three hundred times. Tonight I pay back three hundred and one.","Your Kru chants every night… says 'Bhagava' as 'Bhagavow'. I laughed so hard I nearly fell out of my tree.");
GH_TANI_LINE[2].push("You're making more merit, I know… but I still have to come. Ghosts have jobs too.","I came tonight… in case you were lonely. Not because I am.");
const GH_SULK=["Three inches of dust on my shrine! The last khanom tom has gone hard as a rock. I'm sulking!","Your camp's merit dropped so low I'm hungry. Hungry ghosts get mean.","I'm not haunting you because I'm angry… I'm here because I miss the khanom tom."];
const MORE_W={kati:["Kati dreamt again! This time the lady in green wanted to swap kicks. Kati taught her the crocodile tail-whip…","How many ghosts has Kati beaten now? Lost count. Manager, write it down for me!"],
 mali:["Mali won! And the ghost patted Mali's head before it left… should Mali be happy or scared?","Mali dreamt she beat a ghost and then treated it to milk tea. It said too sweet."],
 rin:["I won again. My record against ghosts is now winning. Publishable… kidding, no journal would take it.","In the dream I kept my range. The ghost couldn't adjust. Great data, all noted."],
 ploy:["Ploy won. The ghost even bowed… Ploy bowed back. Manners.","Again? …A win's a win. Ploy wants one more hour of sleep."],
 fah:["Fah beat a ghost again. Boring. Aren't there any tougher ghosts in Chiang Mai?","Fah took a selfie with the ghost in the dream, but woke up with a dead battery. Ugh."],
 prod_B:["Log: another win… Baiyok is starting to enjoy this. This data should not be in the system.","Baiyok updated the algorithm. Ghost defeated within one round. Efficiency up 34 percent."],
 _:["I beat a ghost again. Not scared anymore, just sleepy."]};
const MORE_L={kati:"Achoo… Kati lost because the ghost tickled! Cheater!",mali:"Mali's sick… dreamt a ghost braided Mali's hair all night. It's all tangled.",rin:"I've got a fever… in the dream the ghost read my game. I need to rewatch my tapes.",
 ploy:"Ploy is unwell. Don't ask why.",fah:"Achoo… don't feel sorry for Fah. Fah just slipped up in a dream.",prod_B:"…System entering maintenance mode. Baiyok will rest for one week.",_:"I've got a fever… dreamt a ghost kicked soft but accurate."};
const MORE2={kati:["Last night Kati punched {g} till it begged for its life! …Do ghosts have lives?","{g} cheats! It kept floating away, Kati couldn't catch it. Achoo."],mali:["Mali beat {g}! But I punched with my eyes shut the whole time, no idea what I hit.","Mali's got a fever… {g} was scarier than I thought."],
 rin:["{g} drops its left guard. I've noted it.","I misread {g}… and caught a fever. Double loss."],ploy:["{g} is no match for Ploy.","…{g} got lucky. Ploy hadn't had dinner yet."],
 fah:["{g}? Fah can't even remember its name. Too easy.","Fah didn't lose to {g}. Fah just wanted a rest."],prod_B:["{g} added to the database. Elimination accuracy improved.","Error… {g} is outside processing parameters."],
 _:["I beat {g}. I never want to meet it again.","I lost to {g}. I'm burning up."]};
for(const k of Object.keys(GH_MORN)){const M=GH_MORN[k];M.w=[M.w,...(MORE_W[k]||[])];M.l=[M.l,MORE_L[k]].filter(Boolean);}
for(const k of Object.keys(GH_MORN2)){const M=GH_MORN2[k],X=MORE2[k];if(X){M.w=[M.w,X[0]];M.l=[M.l,X[1]];}}
GH_GOPEN.krasue.push(N("In the dream the ring floats in mid-air. A sweetly smiling woman's head drifts over to the blue corner post, her innards twinkling like temple-fair lights."),N("In the dream a floating head giggles three laps round your head before drifting down… to hover in the blue corner."));
GH_GOPEN.krahang.push(N("In the dream two winnowing baskets glide down onto the ring, and a rice pestle stands planted in the centre like a flag."),N("In the dream a skinny man flaps his winnowing baskets till the ring dust swirls — \"flap! flap!\" — his warm-up."));
GH_GOPEN.mabong.push(N("In the dream a black horse gallops three laps round the ring, then leaps the ropes and puts up its guard."),N("In the dream a 'NEIGH!' shakes the ropes. The Ma Bong raises its front legs in a wai khru."));
GH_GOPEN.phiphong.push(N("In the dream the smell of pla ra arrives before he does; orange light beams out of his nostrils onto the ring like a torch."),N("In the dream the blue corner is pitch black, just two orange dots blinking… no, those are nostrils."));
const ghSight2={
 krasue:[f=>[N("Tonight a purple light drifts over to the clothesline behind camp and studies Kru Daeng's pha khao ma with great interest."),{n:"_f",t:"Manager… is the krasue picking out clothes?"},C("Don't you take my pha khao ma! I've used that one for ten years!"),N("In the morning Kru Daeng's pha khao ma is gone, leaving a heart-shaped scorch mark on the line.")],
  f=>[N("The purple light circles the banana grove three times, then hangs still as if waiting to be invited."),{n:"_f",t:"I heard two women arguing about the clothesline… are two ghosts fighting?"},C("Better this year. At least they're arguing with each other instead of haunting us.")]],
 krahang:[f=>[N("In the middle of the night a winnowing basket glides down into the camp yard. Written on it: 'Thanks for the loan.'"),{n:"_f",t:"He returned it… better manners than some people."},C("Pa Taew got her winnowing basket back, but not the pestle!")],
  f=>[N("Tonight the flapping on the roof keeps time with the Sarama tune."),{n:"_f",t:"Is the Krahang practising flying to the pi-klong beat… or does he want to learn Muay Thai?"},C("If he wants to learn, he pays the course fee. Fifteen hundred a course.")]],
 mabong:[f=>[N("Tonight the hoofbeats circle the camp only twice, then stop at the training yard."),{n:"_f",t:"Is it coming to watch us run? This morning it felt like someone was running behind us the whole way."},C("The Ma Bong is fast. If it weren't a ghost, I'd sign it up as a running partner.")],
  f=>[N("Hoofprints all over the training yard this morning, spelling out 'race me?'"),{n:"_f",t:"A ghost challenging us to a race… who'd accept?"},C("Nobody's going! …Let me think. What's the prize?")]],
 phiphong:[f=>[N("The pla ra jar was hidden on top of the kitchen cupboard, but by morning half of it was still gone."),{n:"_f",t:"The Phi Phong can climb cupboards too…"},C("Next year I'll ferment two jars. One for the ghost, one for the people.")],
  f=>[N("A little orange light stops in front of the kitchen and leaves a tiny jar of pla ra at the door."),{n:"_f",t:"He brought the pla ra back… or brought us some. It smells better than ours."},C("The Phi Phong ferments pla ra better than I do… I won't stand for it. Next year, a contest.")]]};
GH_ODD.push(
 f=>[N("Pa Taew says she saw a shadow kicking the banana tree at 3 a.m. When she shone a torch, the tree was kicking the shadow back."),C("…How many glasses of rice whisky did Pa Taew have?")],
 f=>[N("This morning every pair of fighters' shoes in camp has been lined up pointing out the door."),{n:"_f",t:"Who did this? So neat."},C("They say shoes pointing out means 'guests, go home'… or maybe someone's just tidy.")],
 f=>[N("The middle heavy bag swings gently all night, as if someone were punching it in rhythm."),C("If ghosts train here too, I'm charging equipment rental.")],
 f=>[N("This morning three jasmine petals are floating in the tin of boxing liniment."),{n:"_f",t:"Smells lovely. Who put it there?"},C("Nobody… just use it. Smells nice.")],
 f=>[N("The TV in the dorm turns itself on at 1 a.m., replaying old fights on the boxing channel."),C("That's my fight! Who wants to see your Kru when he was young? Hands up.")],
 f=>[N("The dog next to camp sits facing the banana grove, wagging its tail all night."),{n:"_f",t:"Is it seeing someone?"},C("Dogs know. Whoever's kind, they wag for.")],
 f=>[N("The bathroom light flickers in a rhythm: short-long-short."),{n:"_f",t:"Morse code?"},C("I can't read it, but it probably means 'change the bulb already'.")],
 f=>[N("This morning every banana-leaf packet of sticky rice has been folded into a bird."),C("…Whoever did it, thanks. Very pretty. But one packet of sticky rice is missing.")],
 f=>[N("The morning-course kids say a lady in green held pads for them. They kicked and her hands didn't even budge."),C("We don't have a female trainer in green… never mind. Thank her for me.")],
 f=>[N("A bicycle bell rings outside camp at midnight. There isn't a single bicycle."),{n:"_f",t:"Late delivery tonight."},C("The post doesn't come at midnight… go to bed.")],
 f=>[N("The changing-room mirror has green lipstick on it: 'Wear sunscreen.'"),{n:"_f",t:"The ghost worries about our skin too?"},C("Our house ghost is kind. Just a bit blunt.")]);

/* --- Luang Pho's Lent visits change with the years --- */
{const go=EVENTS.find(e=>e.id==="gh_lp_go"),bk=EVENTS.find(e=>e.id==="gh_lp_back");const g1=go.steps,b1=bk.steps;
 go.steps=[{inject:G=>{const y=ghYear(G);return y<=1?g1:y===2?[N("Another Lent. Luang Pho smiles at you from far off."),LPS("You've made more merit this year, I can see… but the bad things still come. They remember the way from last year."),C("I bought a new chanting book, Luang Pho. Big print."),LPS("Good. Then you won't chant the victory blessing at bedtime again."),N("🌙 Buddhist Lent: Luang Pho stays in the temple; the other ghosts will come often")]
   :y===3?[N("This Lent, Luang Pho lingers in front of Nang Tani's shrine longer than ever."),LPS("This Lent I'm not worried. This camp has a good guardian."),C("Luang Pho knows her better than I do."),LPS("I've watched her since your grandfather was a young man… back then she smiled a lot."),N("🌙 Buddhist Lent: the other ghosts will come often")]
   :[N("Another Lent. The whole camp parades the Lent candle to the temple like every year."),LPS(pk(["Merit is like boxing liniment, my child. Rub it in every day and it stays warm; stop and it goes cold.","I keep the Rains Retreat for three months, so you keep the camp's merit up for three months. The bad things know monks don't leave the temple now.","And this year please remind Kru Daeng: chanting is fine, but not loudly past midnight. The neighbours have complained."])),N("🌙 Buddhist Lent: the other ghosts will come often")];}}];
 bk.steps=[{inject:G=>{const y=ghYear(G),S=ghSt(G);return y<=1?b1:[N("The end of Lent. Tak Bat Thewo alms at dawn."),LPS(S.shrine?pk(["Your shrine by the grove was lively this Lent. I heard laughing every night.","I hear your guardian chased the Phi Phong into the ditch twice… good. Your pla ra will stop disappearing."]):(S.merit>=50?"Lent is over and I can leave the temple… I'll drop by the camp in a few days. We need to talk about the banana grove.":"Lent is over, my child. I'd like to help with the banana grove, but your camp's merit is still low. Bring it to fifty, then I'll come.")),C("Yes, Luang Pho.")];}}];}

/* --- weekly arc state --- */
{const _w=ghWeekly;ghWeekly=function(G){const S=ghSt(G),was=S.shrineOK;_w(G);if(!S.on)return;const y=ghYear(G);
  if(S.sq==null)S.sq=S.shrine?5:S.shrineOK>=2?1:0; /* saves from before the quest */
  const lpOK=S.merit>=50&&(y>=3||(y===2&&G.week>GH_LENT()[1])); /* v1.91.144: Luang Pho comes once the year-2 Lent is over */
  if(!was&&S.shrineOK&&!lpOK)S.shrineOK=0;
  if(!S.shrineOK&&lpOK)S.shrineOK=1;
  if(S.stage<1&&(S.wins>=2||S.haunts>=3))S.stage=1;if(S.stage<2&&S.wins>=4&&S.haunts>=5)S.stage=2;
  if(S.shrine){S.lowW=S.merit<25?(S.lowW||0)+1:0;if(!S.sulk&&S.lowW>=3)S.sulk=1;if(S.sulk===1&&S.merit>=45)S.sulk=2;}};}
{const _d=ghHauntDue;ghHauntDue=function(G,rng){const S=ghSt(G);if(S.on&&S.shrine&&S.sulk===1){if(gameWeek(G)-S.last<GH_CD)return false;return rng()<.45;}return _d(G,rng);};}
/* the shrine needs the year-2 quest; the teak is a camp action */
GH_ACT.wood={name:"Order shrine teak from a Phrae carpenter",desc:"Step 2 of Nang Tani's shrine quest",cost:15000,merit:3};
CAMP_ACTIONS.gh_wood={name:GH_ACT.wood.name,desc:GH_ACT.wood.desc,cost:15000,get hidden(){return typeof G==="undefined"||!G||!ghSt(G).on||ghSt(G).sq!==2;}};
{const A=CAMP_ACTIONS.gh_shrine;Object.defineProperty(A,"hidden",{get(){if(typeof G==="undefined"||!G)return true;const S=ghSt(G);return !S.on||S.shrine||(S.sq||0)<4;}});}
{const _d=doCampAction;doCampAction=function(G,k){const n=_d(G,k);if(n!=null&&k==="gh_wood"){const S=ghSt(G);S.sq=3;S.sqAbs=gameWeek(G);save();return "The Phrae carpenter sends a whole truckload of teak; Kru Daeng haggles until the man nearly cries · Next: Nang Tani will test your heart in a dream";}return n;};}

/* --- a generic dream duel for the big nights --- */
function ghDuel(o,cb){const f=G.F[o.fid];const S=ghSt(G),save0=S.merit;if(o.adj)S.merit=clamp(S.merit-(o.adj*20),0,GH_MAX);const qid=ghFoe(G,o.kind,f);S.merit=save0;
  const a=o.tani?ghAlly(G,f):f.id,clean=()=>{delete G.F[qid];if(o.tani)delete G.F[a];};
  if(!o.live){const F=quickFight(G.F[a],G.F[qid],(G.seed^0x5ee)+gameWeek(G)*17+o.kind.length,o.rounds||GH_ROUNDS);clean();cb(dmWinFrom(F)==="A");return;}
  const bk={id:"bduel"+gameWeek(G)+o.kind,a,b:qid,week:G.week,tier:"dream",rounds:o.rounds||GH_ROUNDS,ev:1,dream:1,ctrl:ghCtrl(G,o.tani?1:0),waiDone:true,bg:"bg_dream.webp"};ghCtrlToast(bk);
  try{document.body.classList.add("dreamfx");}catch(e){}openFight2(bk,()=>{try{document.body.classList.remove("dreamfx");}catch(e){}const F=LASTF;clean();cb(!!(F&&F.result&&F.result.win==="A"));});}
const CHOOSE=(t1,t2)=>({choice:[{t:t1,fx:()=>{UI.ghLive=1;}},{t:t2,fx:()=>{UI.ghLive=0;}}]});
const MORNING=()=>({n:"nar",t:"— The next morning —",bg:"camp",show:[]});

/* --- story beats across the three years (weekly extras) --- */
{const _s=ghStory;ghStory=function(done){const S=ghSt(G);if(!S.on)return false;const y=ghYear(G),L=GH_LENT(),R=roster(G).filter(f=>!f.injury);
  /* year 1 finale: the dark-moon brawl after Lent */
  if(!S.f1&&!S.shrine&&S.haunts>=2&&G.week>L[1]&&(y>=2||Object.keys(S.ogSeen||{}).length>=1)&&R.length){S.f1=1;save();const f=ghPickFighter(G)||R[0];
    ghPlay([N("A moonless night after Lent. Every light in camp goes out at midnight."),{n:"nar",t:"In the dream the whole camp stands on a banana-tree ring. Around it: purple light, orange light, hoofbeats and flapping… all four ghosts have come at once.",bg:"dream"},
     {n:"npc",who:"Phi Ma Bong",t:"Neigh! This camp has far too much merit. We'll stamp the whole place flat!"},TN("…Who's flattening what?","scary"),
     N("A streak of green light drops into the middle of the ring. Nang Tani stands with her arms folded, her long hair spread across the ring."),TN("This spot is mine to haunt! You country bumpkins go haunt somewhere else!","angry"),
     MY("(…Is she protecting us?)"),TN(`I'm not protecting you! I'm just territorial! … ${f.name}, I'll handle the little ones. You take that crazy horse.`,"angry_smile"),
     CHOOSE(`Cheer on ${f.name} against the Ma Bong ghost (dream fight)`,"Chant the Itipiso and let it play out")],()=>{const live=UI.ghLive;UI.ghLive=null;
      ghDuel({fid:f.id,kind:"mabong",adj:.4,live},win=>{S.stage=Math.max(S.stage,2);save();
        ghPlay([N(win?"The Ma Bong ghost bolts out of camp, neighing all the way. The other three scatter after it.":"The Ma Bong ghost kicks the fighter flying, but Nang Tani charges in with her banana sheath until it bolts."),
          TN(win?"Hmph… not bad.":"See? Without me you'd all be done for.",win?"angry_smile":"angry"),
          TN("Don't think I helped you… but if you make enough merit next year, I might think about moving somewhere with a roof.","shy"),
          GMOFF(),MORNING(),C("Last night I dreamt Nang Tani helped us… I think next year we really need to make merit."),
          N("📜 Your first year with Nang Tani is over — next year: get through the second Lent. If camp merit is 50 after Lent, Luang Pho will come to help with a shrine")],done,{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});return true;}
  /* year 2: the shrine quest — Luang Pho (old beat, now sq=1), the spot, the teak (camp action), Tani's test */
  if(S.sq===1&&gameWeek(G)-(S.sqAbs||0)>=1){S.sq=2;S.sqAbs=gameWeek(G);save();
    playScene([N("Kru Daeng has been walking round camp with a tape measure since morning, looking for a place for the shrine."),C("Where do you think, manager? I reckon we should ask the owner of the house too…"),
     {choice:[{t:"By the grove, under the biggest tree",then:[N("The whole grove's leaves sway gently, though there's no wind."),C("…I think she just nodded.")]},
      {t:"By the ring, so she can watch fights every day",then:[N("Kru Daeng's tape measure snaps back by itself with a smack, catching his finger."),C("Ow! …Fine, not the ring. By the grove, then.")]},
      {t:"By the kitchen, so the offerings stay hot",then:[N("The smell of fried bananas drifts from the kitchen, and a wok flips over all by itself."),C("…There are fried bananas by the kitchen. She won't like it. By the grove, then.")]}]},
     N("🏮 Nang Tani's shrine quest: the spot is chosen — next, order the teak from Phrae (camp activity)")],done,{bg:"camp",look:"casual"});return true;}
  if(S.sq===3&&gameWeek(G)-(S.sqAbs||0)>=1){S.sqAbs=gameWeek(G);let ok=0;const Q=(_,o)=>({choice:o.map(([t,good,reply,img])=>({t,fx:()=>{if(good)ok++;},then:[TN(reply,img)]}))});save();
    ghPlay([N("The night the teak arrives, you dream of Nang Tani sitting cross-legged on the timber pile."),TN("You'd build me a house? …First I need to know how well you know me. Answer three questions.","angry_smile"),
     TN("First: what's my favourite offering?","neutral"),Q(0,[["Khanom tom",1,"Right… and the coconut not too sweet.","smile"],["Fried bananas",0,"……Do you want three more years of haunting?","scary"],["Pizza",0,"What's a pizza… doesn't sound like a ghost thing.","angry"]]),
     TN("Second: what cloth should be tied round my tree?","neutral"),Q(1,[["Three-colour silk",1,"Yes… green, yellow and pink. The prettiest.","shy"],["Kru Daeng's pha khao ma",0,"That cloth smells of ten years of boxing liniment. No!","angry"],["Pink ribbon with little hearts",0,"…Not bad, but no.","angry_smile"]]),
     TN("Last one… why do you want to build me a shrine?","neutral"),Q(2,[["To thank you, and to say sorry about the banana trees",1,"…A better answer than I expected.","shy"],["I want lucky numbers",0,"I knew it! The whole village thinks that way.","angry"],["Because I'm scared of ghosts",0,"You're scared, so you build a ghost a house? …Human logic is so strange.","angry_smile"]]),
     {inject:()=>{if(ok>=2){S.sq=4;save();return [TN(`Got ${ok} right… you pass! You may build me a shrine. But paint it green. No other colour.`,"smile"),GMOFF(),N("🏮 Test passed — \"Build Nang Tani's shrine\" is unlocked in camp activities")];}
       return [TN(`Only ${ok} right… go get to know me better, then come back.`,"angry"),GMOFF(),N("Nang Tani will come to test you again in a few weeks.")];}}],done,{bg:"dream",look:"casual"});
    S.sqAbs=gameWeek(G)+1;return true;} /* sq stays 3 unless she passes you inside the scene; a retry comes two weeks on */
  /* the shrine is neglected: she sulks, then makes up once merit comes back */
  if(S.sulk===2){S.sulk=0;S.lowW=0;save();playScene([N("The shrine has been wiped till it shines. A fresh plate of khanom tom is still warm, and the red soda is full of ice."),TN("…Hmph. That's better.","angry_smile"),TN("I'm not over it because of the snacks. I'm over it because you remembered me again.","shy"),N("🏮 Nang Tani has stopped sulking — she's guarding the camp again.")],done,{bg:"camp_night",look:"casual"});return true;}
  /* year 3 finale: the Lent truce — your fighter, then Tani against the phi phong elder */
  if(!S.f3&&S.shrine&&y>=3&&G.week>L[1]&&R.length){S.f3=1;S.f3Abs=gameWeek(G);save();const f=ghPickFighter(G)||R[0];let w1=false;
    ghPlay([N("The end of the third Lent. That night the wind is strangely strong; the whole grove rustles like a hundred people whispering at once."),{n:"nar",t:"In the dream, all four ghosts stand in a line across the ring. In the middle is a Phi Phong bigger than ever, his nose glowing bright enough to sting your eyes.",bg:"dream"},
     {n:"npc",who:"Elder Phi Phong",t:"Sniff sniff… three years this camp has kept us from our pla ra. Tonight we settle it. Win two fights and we won't bother you again."},
     TN("Challenge accepted! The first fight goes to a fighter of this house. The second one's mine.","angry"),MY("(This time nobody needs to tell me… cheer as loud as I can)"),
     CHOOSE(`Cheer on ${f.name} against the krasue (dream fight)`,"Chant the Itipiso and let it play out")],()=>{const live=UI.ghLive;UI.ghLive=null;
      ghDuel({fid:f.id,kind:"krasue",adj:.6,live},win=>{w1=win;
        ghPlay([N(win?`${f.name} sends the krasue spinning off over the rice fields`:`The krasue giggles; ${f.name} sinks to the canvas`),TN(win?"Brilliant! My turn now.":"Never mind… I'll win the second one back for you.",win?"smile":"angry"),
          CHOOSE("Cheer on Nang Tani against the Elder Phi Phong (dream fight)","Chant the Itipiso and let it play out")],()=>{const live2=UI.ghLive;UI.ghLive=null;
          ghDuel({fid:f.id,kind:"phiphong",adj:1,live:live2,tani:1},win2=>{const both=w1&&win2;S.truce=win2?1:0;S.tb=clamp((S.tb||0)+(win2?6:2),0,ghCap(G));save();
            ghPlay([N(win2?"Nang Tani spins and swings her banana sheath with everything she has. The Elder Phi Phong rolls into the ditch and the orange glow goes out.":"The Elder Phi Phong shoves Nang Tani back to the corner post, but she stays on her feet."),
              {n:"npc",who:"Elder Phi Phong",t:win2?"Sniff sniff… I yield, I yield. A promise is a promise. We'll only drop by once in a while… just leave a cup of pla ra by the kitchen.":"Sniff sniff… this house's guardian has spirit. I'm not giving up, but I'll come round a little less."},
              TN(win2?"Hear that? This house has a guardian!":"…I'll train more next year.",win2?"angry_smile":"angry"),
              TN("Three years now, of you kicking, causing trouble, making merit, talking to me… I've never had years so un-lonely.","shy"),
              GMOFF(),MORNING(),C(both?"Last night I dreamt we beat the ghosts two fights straight… I'm writing it on the last page of the record book, the one nobody reads.":"I had another strange dream last night… but I woke up feeling lighter somehow."),
              N("📜 Three years of Nang Tani's story are complete — from now on keep the camp's merit up. If it drops, her shrine gathers dust and she sulks. The Lent ghosts will still drop by now and then.")],done,{bg:"dream",look:"casual"});});},{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});return true;}
  return _s(done);};}
/* once the truce stands, the Lent ghosts drop by less */
{const _o=ghOtherDue;ghOtherDue=function(G,rng){const S=ghSt(G);if(S.truce&&rng()<.3)return null;if(S.sulk===1)return _o(G,()=>rng()*.8);return _o(G,rng);};}

/* --- year-by-year sightings and the haunt lines while she sulks --- */
{const _h=ghHaunt;ghHaunt=function(done){const S=ghSt(G);if(S.shrine&&S.sulk===1){const keep=GH_TANI_LINE[2];GH_TANI_LINE[2]=GH_SULK;const st=S.stage;S.stage=2;try{_h(done);}finally{GH_TANI_LINE[2]=keep;S.stage=st;}return;}_h(done);};}
{const s0=Object.assign({},ghSight);for(const k of Object.keys(ghSight))ghSight[k]=f=>{const y=ghYear(G);return y<=1?s0[k](f):ghSight2[k][Math.min(y,3)-2](f);};}

/* --- Tani's year-3 talks, hearts gated by year, and her yearly days --- */
const TT3=[
 {k:"fights",o:[TN("A hundred years ago there was a temple fair here every month. Men fought with bound hands in the temple yard. I watched every fight from the grove.","smile")],
  c:[["Was Muay Thai different back then?",3,"No rounds, no gloves. You fought till one side gave up, then ate together… that's the part I loved most.","smile"],["Who's the best you ever saw?",2,"One man kicked my tree in half. I was furious… but I'll admit he was good.","angry_smile"],["You like Muay Thai too?",1,"I was born beside a ring. How could I not?","neutral"]]},
 {k:"name",o:[TN("I don't have a real name. 'Nang Tani' is just what people call me… if you gave me a name, what would it be?","shy")],
  c:[["Tani is a lovely name already.",3,"…Then I'll like this name even more.","shy"],["Emerald Green",1,"Sounds like the gold shop at the market, but… not bad.","angry_smile"],["Little Banana",-1,"……Do you want me to go back to haunting you?","scary"]]},
 {k:"future",o:[TN("Yesterday a man in a suit came to measure the land next to camp… will they cut down the grove?","neutral")],
  c:[["I won't let anyone cut this banana grove.",4,"…You sound just like your grandpa. The exact same words.","shy"],["They're only measuring the plot next door.",1,"I'm possessive. Even next door, I'm possessive.","angry"],["If they cut it, we move the shrine together.",3,"Move house with you… doesn't sound bad.","smile"]]},
 {k:"jealous",o:[TN("I'm not jealous. Ghosts don't get jealous… I just want to know who you've been going out with lately.","angry_smile")],
  c:[["Just the kids in camp.",2,"Good. Look after them well. I'm watching.","neutral"],["Sitting here talking to you, mostly.",3,"…Sweet talker again. But it's true.","shy"],["Why do you want to know?",1,"I'm the house spirit! The house spirit has to know everything in the house!","angry"]]},
 {k:"sleep",o:[TN("Ghosts don't sleep, but some nights I close my eyes and listen to you all snore… your Kru snores in luk thung.","smile")],
  c:[["Can you dream?",3,"I dream in the daytime… that I finally get to kick the heavy bag.","smile"],["Who snores loudest in camp?",2,"Kru Daeng. Second is the one with the red-and-white rope… don't tell her.","angry_smile"],["Don't you get lonely at night?",2,"Lonely… but now I've got snores to count, so not as lonely as before.","shy"]]},
 {k:"grandpa",o:[TN("Your grandpa, when he was young, lost a temple-fair fight once. He came and cried by my banana grove all night.","neutral")],
  c:[["What did you do?",3,"I covered him with banana leaves… the next day he kicked my tree five hundred times. I let him.","shy"],["My grandpa was a crybaby?",1,"Everyone's a crybaby when they lose. You too. I've seen it.","angry_smile"],["Thank you for looking after my grandpa.",4,"…I look after everyone in this house. You too.","smile"]]},
 {k:"scared",o:[TN("Are you still scared of me? Be honest.","neutral")],
  c:[["Not anymore.",2,"Good… but don't forget I can still haunt you.","angry_smile"],["A little, at 3 a.m.",3,"Hee hee, at 3 a.m. I'm a little scared of myself too.","smile"],["That one day you'll be gone.",4,"……I'm not going anywhere. Not while someone still remembers me.","shy"]]},
 {k:"promise",o:[TN("Will you promise me one thing?","neutral")],
  c:[["I'll promise anything.",3,"Bring red soda every Buddhist holy day, and tell the kids to wai before they kick… that's all. Easy, right?","smile"],["Depends what the promise is.",1,"Careful, aren't you. I like that.","angry_smile"],["No promises about lottery numbers.",2,"Hmph! That's not what I was going to ask… but maybe I'll drop you a hint anyway.","shy"]]}];
for(const t of TT3)t.y=3;TT.push(...TT3);
TH[0].need=G=>!!ghSt(G).shrine;TH[1].need=G=>ghYear(G)>=3;TH[1].at=35;TH.splice(2,1); /* the third heart now plays on Loy Krathong night */
{const _t=ghTalk;ghTalk=function(){const S=ghSt(G),y=ghYear(G),keepTT=TT.slice(),keepTH=TH.slice();
  const tt=TT.filter(t=>(t.y||2)<=y),th=TH.map(h=>h.need&&!h.need(G)?{...h,at:999}:h);TT.length=0;TT.push(...tt);TH.length=0;TH.push(...th);
  try{_t();}finally{TT.length=0;TT.push(...keepTT);TH.length=0;TH.push(...keepTH);}};}
const GH_SONG=()=>[ghWk(12,3),ghWk(16,3)],GH_BLOSSOM=()=>[ghWk(10,7),ghWk(17,7)],GH_LOY=()=>[ghWk(20,10),ghWk(28,10)];
EVENTS.push(
 {id:"gh_songkran",annual:true,look:"casual",bg:"camp",pri:2,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=2&&ghIn(G,GH_SONG());},steps:[{inject:G=>{const S=ghSt(G),first=!S.songN;S.songN=(S.songN||0)+1;S.merit=clamp(S.merit+5,0,GH_MAX);S.tb=clamp((S.tb||0)+2,0,ghCap(G));
   return first?[N("Songkran. The whole camp brings Thai scented water to bathe Nang Tani's shrine. Kru Daeng pours slowly and carefully."),N("Then Kati throws a whole bowl at the shrine… at the banana tree… at Kru Daeng."),TN("Hee hee hee hee! So cool! Another bowl!","smile"),C("Why does it feel like someone's splashing back from the banana grove…"),N("🪷 Camp merit +5 · Closeness with Nang Tani +2")]
    :[N("Another Songkran. The whole camp pours water over Nang Tani's shrine like every year."),TN(pk(["More scented water this year, please. I like that smell.","Don't splash as hard as last year. My silk ribbons were wet for three days.","Every Songkran it feels like my one bath of the year… kidding."]),"smile"),N("🪷 Camp merit +5")];}}]},
 {id:"gh_blossom",annual:true,look:"casual",bg:"camp_night",pri:2,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=3&&ghIn(G,GH_BLOSSOM());},steps:[{inject:G=>{const S=ghSt(G),first=!S.bloN;S.bloN=(S.bloN||0)+1;S.tb=clamp((S.tb||0)+3,0,ghCap(G));
   return first?[N("The banana tree by the shrine puts out the year's first purple-red blossom. Kru Daeng says it's a good omen."),TN("…Today's my birthday. Every year the first blossom comes out, I count myself a year older.","shy"),MY("So how old are you now?"),TN("Asking a lady her age… even a ghost lady, that's rude!","angry"),
     N("That night the whole camp lights little candles round the shrine. Mali brings a tray of khanom tom. Kati sings happy birthday off-key the whole way through."),TN("…Thank you, everyone.","smile"),N("💚 Closeness with Nang Tani +3")]
    :[N("The first banana blossom of the year is out again. Nang Tani's birthday comes round once more."),TN(pk(["The khanom tom is just sweet enough this year. You pass.","I'm a year older again… but don't you count!","More candles than last year. I saw. I counted."]),"smile"),N("💚 Closeness with Nang Tani +3")];}}]},
 {id:"gh_loy",annual:true,look:"casual",bg:"camp_night",pri:3,when:G=>{const S=ghSt(G);return S.on&&S.shrine&&ghYear(G)>=3&&ghIn(G,GH_LOY());},steps:[{inject:G=>{const S=ghSt(G);
   if(!S.loyHeart&&(S.tb||0)>=55){S.loyHeart=1;S.th=Math.max(S.th||0,3);S.tb=clamp(S.tb+5,0,ghCap(G));return [GMON(),N("Loy Krathong night. The whole camp went to the river; you come back to the shrine holding one bread krathong"),
     TN("…A bread krathong. Not banana trunk","shy"),MY("This year I made everyone use bread. The fish can eat them too"),TN("Hee hee hee… you really are crazy","smile"),
     N("Nang Tani floats down and sits beside you — the closest she has ever sat. She's cool as morning dew"),TN("I'm a ghost, you're a person. I'll be here another hundred years; you've got a few decades","neutral"),
     TN("But I think… we can be friends. Friends who watch over this camp together, until you're too old to kick a banana tree","smile"),MY("Friends it is"),
     TN("Good! Then a friend brings red soda every Buddhist holy day. Don't forget!","angry_smile"),N("Far away, fireworks burst over the river. A faint green light rises from the banana grove and mixes with the sparks"),GMOFF(),N("💚 Nang Tani is your close friend now — she'll guard the camp even harder")];}
   return [N("Loy Krathong night. Everyone floats bread krathongs. Nobody touches a single banana sheath."),TN(pk(["Kati's bread krathong sank fastest this year, hee hee.","The fish in the canal get fatter every year thanks to your camp.","I floated a krathong too this year… not telling you which one."]),"smile")];}}]});


/* ================= Phase 5 (v1.91.144, Man): a side story that guides the player and never crowds the main game =================
   - ghost scenes of every kind at most once every 3 weeks, after the main quests
   - fevers capped per season; Kru Daeng nudges a player who lets merit sink
   - closeness capped by year (the friendship belongs to year 3)
   - with merit (or the shrine) you command your fighter's corner in a dream; from heart 2 you command Tani's
   - after the story, Tani now and then brings a wandering ghost to fight; offerings at her card like gifts */
const GH_GAP=3,GH_FEVER_MAX=6,GH_ROUNDS=3; /* v1.91.144 (Man): dream fights go three rounds */
const ghCapY=G=>{const y=ghYear(G);return y>=3?100:y===2?40:20;},ghCap=G=>Math.max(ghCapY(G),ghSt(G).tb||0); /* never takes back closeness an older save already has */
const ghCtrl=(G,tani)=>{const S=ghSt(G);return tani?(S.th||0)>=2:(S.merit>=60||!!S.shrine);};
const ghCtrlToast=bk=>{try{if(bk.ctrl)setTimeout(()=>toast(bk.a==="q_tani_ally"?"💚 Nang Tani listens to you now — full corner commands for her":"🪷 The camp's merit is strong — you can move in the dream. Full corner commands"),400);}catch(e){}};

/* what to do next — shown on the merit bar, in the help and in Kru Daeng's tips */
function ghGoal(G){const S=ghSt(G),y=ghYear(G);if(!S.on)return "";
  if(S.shrine&&S.sulk===1)return "Nang Tani is sulking, her shrine is dusty — raise camp merit back to 45";
  if(y<=1)return S.f1?"Next year: get through Lent; with merit 50 after Lent, Luang Pho will come about a shrine":"Year one: keep camp merit high — fewer ghosts, fewer fevers";
  if(!S.shrine){if(!S.sq)return y===2&&G.week<=GH_LENT()[1]?"Wait for Lent to end and keep camp merit at 50 — Luang Pho will come about a shrine":"Raise camp merit to 50 — Luang Pho will come about a shrine";
    return ["","Wait for Kru Daeng to find a spot for the shrine (next week)","Order teak from Phrae — in camp activities","Wait for Nang Tani to test you in a dream","Build Nang Tani's shrine, ฿60,000 — in camp activities"][S.sq]||"";}
  if(y===2)return "Talk or make offerings at her shrine — Characters tab (closeness can reach 40 this year)";
  if(!S.f3)return "Year three: grow close to Nang Tani, float a krathong together, and get ready for the challenge after Lent";
  return "Keep camp merit at 25 or above — or her shrine gathers dust and Nang Tani sulks";}
const GH_HELP=G=>{const S=ghSt(G);return [N("🪷 What is camp merit?"),
  N(`Camp merit now ${S.merit}/100 · shown on the home screen (camp-activity button) and on the camp-activity list. Any week without merit-making, it drops by 3`),
  N("High merit: fewer, weaker ghosts and fewer fevers · merit 60+: you command the corner in dream fights · below 25: frequent, stronger ghosts and longer fevers"),
  N("Make merit through \"Camp activities\" (one a week): morning alms +6 · wai kru +10 · shrine offering +4 · pha pa +12 (every 6 weeks) · big merit meal +16 · summer ordination +24 (April) · kathin +30 (after Lent)"),
  N("During Buddhist Lent (late July–late October) Luang Pho stays in the temple and the other ghosts come out often."),
  N(`🎯 Now: ${ghGoal(G)}`)];};
Object.assign(ACT,{ghhelp:()=>{UI.modal=null;playScene(GH_HELP(G),()=>render(),{bg:"temple",look:"casual"});}});
{const _h=campActsHTML;campActsHTML=function(){const h=_h();if(typeof G==="undefined"||!G||UI.modal.pick)return h;const S=ghSt(G);if(!S.on)return h;
  return h.replace(/(<div class="ghbar"[^]*?<\/div>)/,`$1<div class="ghgoal"><span>🎯 ${ghGoal(G)}</span><button class="btn sm" data-act="ghhelp">What is camp merit?</button></div>`);};}
{const _h=homeHTML;homeHTML=function(){const h=_h();try{const S=G&&G.gh;if(!S||!S.on)return h;const m=S.merit,c=m<25?"ghlow":"";
  return h.replace("<small>This week's camp activity",`<small><em class="ghm ${c}">🪷 Merit ${m}</em> · This week's camp activity`);}catch(e){return h;}};}
{const _t=coachTips;coachTips=function(force){const T=_t(force);try{const S=G&&G.gh;if(!S||!S.on||(!coachOn()&&!force))return T;
  if(S.merit<25)T.push({p:7,t:`Camp merit is down to ${S.merit}. Ghosts will come often and fighters will fall sick — pick morning alms or wai kru in camp activities, manager.`,act:{k:"campacts",label:"Choose activity"}});
  else if(S.sq===2||(S.sq===4&&!S.shrine))T.push({p:5,t:`Nang Tani's shrine: ${ghGoal(G)}`,act:{k:"campacts",label:"Camp activities"}});
  return T.sort((a,b)=>b.p-a.p);}catch(e){return T;}};}
/* the camp actions that make merit say so */
for(const [k,v] of [["merit",6],["waikhru",10]]){const A=CAMP_ACTIONS[k];if(!A)continue;const d0=A.desc;Object.defineProperty(A,"desc",{configurable:true,get(){try{return G&&G.gh&&G.gh.on?`${d0} · 🪷 Camp merit +${v}`:d0;}catch(e){return d0;}}});}
{const _w=ghWeekly;ghWeekly=function(G){const S=ghSt(G),m0=S.merit;_w(G);if(!S.on)return;
  S.lowRun=S.merit<25?(S.lowRun||0)+1:0;
  if(m0>=25&&S.merit<25)try{setTimeout(()=>toast("🪷 Camp merit below 25 — ghosts will come more often. See how to make merit in camp activities"),600);}catch(e){}};}

/* Kru Daeng's nudge, and the loop's wandering ghosts */
{const _s=ghStory;ghStory=function(done){const S=ghSt(G);if(!S.on)return false;
  if(S.lowRun>=8&&gameWeek(G)-(S.nudge??-99)>=20){S.nudge=gameWeek(G);save();
    playScene([C("Manager… can we talk about the camp's merit?"),C(`Our camp merit is down to ${S.merit}. Ghosts every month, the kids down with fevers one after another, and I've chanted myself hoarse.`),
      C("No need for anything big. Morning alms every other week is enough, and it's cheap — three hundred baht. A wai kru is even better."),C("It's in camp activities — the 🪷 camp merit bar is at the top."),
      {choice:[{t:"Got it, Coach",then:[C("Good! I'll get up at five and buy the alms food.")]},{t:"What is camp merit, again?",then:GH_HELP(G)}]}],done,{bg:"camp",look:"casual"});return true;}
  const y=ghYear(G);
  if(y>=4&&S.shrine&&S.f3&&!S.sulk&&!ghIn(G,GH_LENT())&&gameWeek(G)-(S.chAbs??(S.f3Abs||-99))>=16&&Math.random()<.2){S.chAbs=gameWeek(G);save();ghWander(done);return true;}
  return _s(done);};}
const GH_WANDER=[["krasue","Young Krasue from Ban Pong","I hear this camp's guardian can fight. I've come to test her!"],["krahang","Drifting Krahang from Ayutthaya","I've flown three days and nights… one round, then some rice, please."],
 ["mabong","Speed-demon Ma Bong from Korat","Neigh! Who says I can run but can't fight? Try me!"],["phiphong","Young Phi Phong from Ubon","Sniff sniff… I smelled this camp's pla ra three provinces away. One fight for it."]];
function ghWander(done){const S=ghSt(G),R=roster(G).filter(f=>!f.injury);if(!R.length){done();return;}const [kind,name,taunt]=GH_WANDER[Math.floor(Math.random()*GH_WANDER.length)],f=R[Math.floor(Math.random()*R.length)];
  ghPlay([N("2 a.m. Nang Tani's shrine flashes green. In the dream she's waiting in front of the banana-tree ring.",),{n:"nar",t:"Beside her a stranger stands with arms folded.",bg:"dream"},{n:"npc",who:name,t:taunt},
   TN(pk(["A wandering ghost wants a fight… accept? I think it'll be fun.","Another visitor. Who will you send — or shall I play?","I was getting bored… accept? Winners usually get left something nice."]),"angry_smile"),
   {choice:[{t:`Send ${f.name} into the ring`,fx:()=>{UI.ghW={who:"f"};}},{t:"Let Nang Tani fight",fx:()=>{UI.ghW={who:"t"};}},{t:"Decline — keep sleeping",fx:()=>{UI.ghW=null;},then:[TN("Hmph, boring… then I'll send them home myself.","neutral")]}]}],()=>{
   const w=UI.ghW;UI.ghW=null;if(!w){done();return;}
   ghDuel({fid:f.id,kind,adj:.4,live:1,tani:w.who==="t"},win=>{const gift=win?1500+Math.floor(Math.random()*4)*500:0;if(win){G.cash+=gift;S.merit=clamp(S.merit+4,0,GH_MAX);S.tb=clamp((S.tb||0)+3,0,ghCap(G));}save();
     ghPlay([N(win?`${name} gives up laughing and leaves an old cloth pouch in the middle of the ring`:`${name} wins, bows once, and floats off into the dark`),
       TN(win?pk(["Excellent! I told you this camp is no ordinary camp.","Hee hee, that wanderer was just a warm-up.","And a gift too… don't spend it all on lottery tickets."]):pk(["Never mind. Some wandering ghosts really are strong.","We'll get it back next time.","Losing was fun too. Nobody gets a fever — I'll see to it."]),win?"smile":"neutral"),
       GMOFF(),MORNING(),N(win?`In the morning there's an old cloth pouch in front of the shrine. Inside: ฿${gift.toLocaleString()} · Camp merit +4 · Closeness +3`:"In the morning everyone is fine, nobody has a fever — they just dreamt of losing to a strange ghost.")],done,{bg:"dream",look:"casual"});});},{bg:"dream_room",look:"casual"});}

/* offerings at her card, like gifts — once a week, does not use the week's free time */
const GH_GIFTS=[{k:"tom",n:"Khanom tom, coconut, not too sweet",c:200,tb:4,m:3,img:"smile",r:["Khanom tom! …Just sweet enough. You know me now.","Hee hee, khanom tom again. I'll never get tired of it."]},
 {k:"red",n:"Red soda on ice",c:100,tb:3,m:2,img:"smile",r:["Red soda… refreshing. Ghosts get hot too, you know.","Lots of ice, just like this. I like it."]},
 {k:"jas",n:"Jasmine garland",c:150,tb:3,m:2,img:"shy",r:["Jasmine… lovely. I'll wear it all night.","I'm not blushing! …It is pretty, though."]},
 {k:"silk",n:"New three-colour silk",c:800,tb:6,m:4,img:"shy",r:["New cloth! So much brighter than the old one… thank you.","Green, yellow, pink… you've learned to pick colours."]},
 {k:"boba",n:"Bubble milk tea",c:120,tb:2,m:1,img:"neutral",r:["What are these black balls… chewy. I haven't decided if I like them.","People these days eat such strange things… can I have another cup?"]},
 {k:"fry",n:"Fried bananas",c:80,tb:-2,m:0,img:"angry",r:["……Fried bananas. For the banana-tree ghost. What were you thinking?","You want me to eat my own relatives?!"]}];
function ghGift(){const S=ghSt(G);if(!S.shrine||S.giftW===gameWeek(G))return;
  playScene([N("You walk over to Nang Tani's shrine. What will you offer?"),{choice:[...GH_GIFTS.map(g=>({t:`${g.n} · ฿${g.c}`,fx:()=>{if(G.cash<g.c){UI.ghG=-1;return;}G.cash-=g.c;S.giftW=gameWeek(G);S.tb=clamp((S.tb||0)+g.tb,0,ghCap(G));S.merit=clamp(S.merit+g.m,0,GH_MAX);UI.ghG=g;save();},
     then:[{inject:()=>{const x=UI.ghG;UI.ghG=null;if(x===-1)return [N("Not enough money… next time.")];return [TN(pk(x.r),x.img),N(`💚 Closeness ${x.tb>0?"+":""}${x.tb}${x.m?` · 🪷 Camp merit +${x.m}`:""}`)];}}]})),{t:"Another day",then:[]}]}],()=>render(),{bg:"camp_night",look:"casual"});}
Object.assign(ACT,{ghgift:()=>{UI.modal=null;ghGift();}});
{const _p=peopleHTML;peopleHTML=function(){const h=_p();try{const S=G&&G.gh;if(!S||!S.shrine)return h;const used=S.giftW===gameWeek(G);
  return h.replace(/(data-act="ghtalk"[^>]*>[^<]*<\/button>)/,`$1<button class="btn sm" data-act="ghgift" ${used?"disabled":""}>${used?"Offered this week":"Make an offering"}</button>`).replace(/(ความสนิท|closeness) (\d+)\/100/,(a,w,n)=>w+" "+n+"/"+(+n>ghCapY(G)?100:ghCapY(G)));}catch(e){return h;}};}

try{window.GHX={ghAlly,ghFoeT:ghFoe,ghSt,ghAdd,ghHaunt,ghFight,ghStory,ghWeekly,ghHauntDue,ghReady,ghOther,ghOtherDue,ghOddPlay,ghTalk,TT,TH,ghYear,ghDuel,ghOddDue:ghOdd,ghGoal,ghWander,ghGift,ghCap};}catch(e){}
})();

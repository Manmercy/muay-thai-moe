// ================= MUAY THAI MOE — game guide (สารานุกรมเกม) =================
/* v1.91.201 (Man): players asked which style beats which, then Man asked for a whole in-game guide.
   Opened from Settings (pixel book) and from little "?" links next to what a chapter explains.
   A chapter is {id, t (title), ic (emoji), on (optional: shown only when true), h (returns HTML)}. */
const BOOK_PX=pxIcon([".kkkkk....kkkkk.","kwwwwwkkkkwwwwwk","kwlllwwkkwwlllwk","kwwwwwwkkwwwwwwk","kwllllwkkwllllwk","kwwwwwwkkwwwwwwk","kwlllwwkkwwlllwk","kwwwwwwkkwwwwwwk","kkkkkkkrrkkkkkkk",".bbbbbbrrbbbbbb.","........r......."],{k:"#1b1530",w:"#fff4d6",l:"#8f86b0",b:"#e8b84a",r:"#c8283c"}).replace('class="pxi"','class="pxi bookpx"');
const STY_ORDER=["power","footwork","pressure","inside","counter"];
const STY_WHY={
  power:{w:{footwork:"can back away, but can't escape one punch landing clean",pressure:"walks forward straight into the heavy punch"},l:{inside:"crowded so close the punch has no power",counter:"throws heavy and leaves openings to counter"}},
  footwork:{w:{pressure:"chases and chases but can't catch up, wasting energy",inside:"keeps the distance, never lets her get close"},l:{power:"circles away, but one heavy punch ends it",counter:"always moving in and out, right into the counter timing"}},
  pressure:{w:{inside:"shoves her off balance before she can grab the neck",counter:"presses so there is no moment to wait and counter"},l:{power:"walks into a heavy punch waiting for her",footwork:"chasing quick feet until the tank is empty"}},
  inside:{w:{counter:"so close there is no room to counter",power:"so close the big punch has no room to swing"},l:{pressure:"pushed back before she can lock up",footwork:"can't get close enough"}},
  counter:{w:{power:"waits for the big punch, then counters the opening",footwork:"reads the in-and-out rhythm and counters on the beat"},l:{pressure:"pressed so hard there is no moment to wait",inside:"crowded so close there is no room to counter"}}};
const styChip=(a,b)=>{const e=styleEdge(a,b);return e>0?"<i class=\"stye up\">Edge</i>":e<0?"<i class=\"stye dn\">Outmatched</i>":"<i class=\"stye eq\">Even</i>";};
function styTableHTML(){const H=STY_ORDER.map(k=>`<th>${FSTYLE[k]}</th>`).join("");
  return `<div class="stytbl-w"><table class="stytbl"><tr><th>You ↓ · Opponent →</th>${H}</tr>${STY_ORDER.map(a=>`<tr><th>${FSTYLE[a]}</th>${STY_ORDER.map(b=>{const e=a===b?0:styleEdge(a,b);return `<td class="${a===b?"same":e>0?"w":"l"}">${a===b?"–":e>0?"Win":"Loss"}</td>`;}).join("")}</tr>`).join("")}</table></div>`;}
function styHeroLinesA(){return CANON_IDS.filter(id=>HOME_STYLE[id]&&G&&G.F[id]).map(id=>{const sch=(skillList(id).find(s=>s.school&&s.school!=="build")||{}).school,L=LINE_STYLE[sch]||[],N=SK_LINES[id]||[];
  return `<b>${esc(G.F[id].name)}</b><small>${L.map((s,i)=>`${N[i]||""} → ${FSTYLE[s]}`).join(" · ")}</small>`;});}
const gp=t=>`<p>${t}</p>`,gh=t=>`<h3>${t}</h3>`,gl=a=>`<ul class="glist">${a.map(x=>`<li>${x}</li>`).join("")}</ul>`,gtip=t=>`<p class="gtip">💡 ${t}</p>`,
  glink=(id,t)=>`<button class="btn sm glink" data-act="guide" data-v="${id}">${t} ›</button>`;
const GUIDE=[
 {id:"week",ic:"⌛",t:"A week at the camp",h:()=>
  gp("The game moves one week at a time and a year has <b>52 weeks</b>. Each week, do this")+
  gl(["<b>1. Train</b> · set a training program for each fighter","<b>2. Fights</b> · take offers, scout opponents, set fight plans","<b>3. Camp activity</b> · one per week. Some earn money, some help the fighters","<b>4. People</b> · take a fighter out, talk, or give a gift","<b>5. End week</b> · training, fights, then the results and money summary"])+
  gh("Goals for the year")+
  gl(["Weeks 1–20 <b>Subdistrict stage</b> · top 4 of each division go on","Weeks 21–40 <b>District stage</b> · top 4 of each division go on","Week 44 <b>Provincial semi</b> · week 49 <b>Provincial final</b>"])+
  gh("Watch your money")+
  gp("You can't stay in the red for long. Below −฿10,000 for 4 weeks in a row, or below −฿40,000, and the camp closes and the game ends")+
  gtip("The End week button shows what's left to do. Not sure what to do? Set training, take a fight, and end the week")},
 {id:"train",ic:"💪",t:"Training and scouting",h:()=>
  gp("Pick a training program for each fighter. Each one raises different stats")+
  gl(Object.values(PRESETS).map(P=>`<b>${P.name}</b><small>${P.desc}</small>`))+
  gh("Intensity")+
  gl(["<b>Light</b> · less gain, less fatigue","<b>Normal</b> · just right","<b>Heavy</b> · about 40% more gain but about 50% more fatigue"])+
  gh("Fatigue and injury")+
  gl(["The more tired she is, the less training pays off","Over <b>70</b> fatigue risks injury and 2–3 weeks out","After recovering, she goes back to her old program by herself","The recovery room, kitchen and herbal sauna lower fatigue"])+
  gh("Stats")+
  gp("Stats max out at <b>20</b> and grow slower near the top. Training her own fighting type goes further")+
  gh("Scouting and counter-training")+
  gl(["<b>Scout</b> · pay a little to learn the opponent's weak spots, best plan and fight style. Good for 8 weeks","<b>Counter-training</b> · after scouting, the coach names the program that answers the opponent's main weapon. Train it the week before the fight and that weapon lands on you less","<b>Fight prep</b> · light training in fight week for extra readiness, and she keeps the counter-training bonus"])+
  gtip("Counter-train the week before the fight, then do fight prep in fight week to get both bonuses")},
 {id:"fight",ic:"⚔",t:"In the ring",h:()=>
  gh("Before the fight")+
  gl([`<b>Fight plan</b> · ${Object.values(PLANS).map(P=>`${P.name} (${P.desc})`).join(" · ")}`,"<b>Target</b> · head hits hard but lands less · body drains the opponent's stamina · legs slow the opponent down","After scouting, the plan the coach recommends has a ★. Not sure? Pick that one"])+
  gh("During the rounds")+
  gl(["Use one <b>skill</b> per round. After that, the move rests for a round","Skills use stamina from the <b>gold bar</b>. Higher ranks cost more, and you can't use one without enough","When badly hurt or behind on points she may enter <b>blood-boil mode</b>: harder counters and easier crits for a moment, once per fight"])+
  gh("Corner")+
  gl([`<b>Corner orders</b> · ${Object.values(CORNER).map(C=>C.name).join(" · ")}`,"<b>Corner massage</b> (minigame) · all correct gives +20 stamina back, 2 of 3 gives +10"])+
  gh("How fights are won")+
  gp("Knockout, or TKO (down too many times, or the doctor stops it). If it goes the distance, it's decided on points")+
  gp("Some fight plans share a name with a style, but they're different things")+glink("style","Read about fight styles")},
 {id:"style",ic:"🥊",t:"Fight styles · who beats whom",h:()=>
  gp("Every fighter has one <b>fight style</b> out of 5. Each style <b>beats 2 and loses to 2</b>")+
  styTableHTML()+
  gp(`<b>How to remember</b> · ${STY_ORDER.map(k=>FSTYLE[k]).join(" → ")} → ${FSTYLE.power}`)+gp("Each style beats the next two to the right")+
  gh("Why the edge matters")+
  gp("The side with the edge lands more and dodges better all fight. When skills are close, the side with the edge usually wins")+
  gh("How to see the opponent's style")+
  gp("<b>Scout</b> the opponent first, then the fight info shows <i class=\"stye up\">Edge</i> <i class=\"stye dn\">Outmatched</i> or <i class=\"stye eq\">Even</i> If you're outmatched, the game tells you who in the camp has the edge on this opponent")+
  gh("Can a style change?")+
  gp("Yes. A main fighter's fight style follows <b>the skill line she has put the most points into</b>")+
  gl([...styHeroLinesA(),"Other fighters take the style of their best weapon"])+
  `<details class="gmore"><summary>${"See why each style loses"}</summary><div class="stywhy">${STY_ORDER.map(k=>{const W=STY_WHY[k];return `<div class="px"><b>${FSTYLE[k]}</b>${Object.keys(W.w).map(o=>`<small class="w">${"Beats"} ${FSTYLE[o]} · ${W.w[o]}</small>`).join("")}${Object.keys(W.l).map(o=>`<small class="l">${"Loses to"} ${FSTYLE[o]} · ${W.l[o]}</small>`).join("")}</div>`;}).join("")}</div></details>`+
  gh("Don't mix it up with")+
  gl(["<b>Fighting type</b> under the name (puncher, kicker, etc.) · only tells her best weapon","<b>Counter-training</b> · trains against the opponent's main weapon, works together with styles","<b>Fight plan</b> · picked before a fight, doesn't change her style"])},
 {id:"skill",ic:"📜",t:"Skills and schools",h:()=>
  gl(["Level up to get <b>skill points</b> (main fighters get 3 per level)","Each main fighter has a skill tree with <b>3 lines</b> from her old muay school","Some moves need the move before them, or certain stats first"])+
  gh("Active and passive skills")+
  gl(["<b>Active skills</b> · take <b>3</b> into the ring and use them between rounds","<b>Passive skills</b> · always work, no button"])+
  gh("Hidden power")+
  gl(["Main fighters have 2 hidden powers and can switch them on the skill page","Levels 1–10, 5 points each · Lv.3 is full strength, each level after adds a little more"])+
  gh("Others")+
  gl(["The line with the most points sets her <b>fight style</b>","<b>Skill reset</b> · the first is free, then ฿10,000 / ฿20,000 / ฿30,000","<b>Signature move</b> · unlocks at ♥ Lv.7 bond"])+glink("style","Read about fight styles")},
 {id:"career",ic:"🏆",t:"The fighter's road",h:()=>
  gh("Standings")+
  gl(["Fighters are split into <b>Division A and Division B</b>, each with its own table","A win is 3 points (2 against someone much weaker) · beating someone stronger gives +1 · a draw is 1","Temple fair, special and off-the-books fights pay money and EXP but don't count for points"])+
  gh("Fighter rank")+
  gp(`${TIERS.map(t=>`${t.ic} ${t.n}`).join(" → ")}`)+gp("Goes up and down with results. Beating stronger fighters climbs fastest")+
  gh("Hot-form titles")+
  gp("Win <b>5 fights in a row</b> for a personal title that makes her a bit stronger. A loss or draw takes it away")+
  gtip("Take fights against stronger opponents sometimes for more points, fame and EXP")},
 {id:"camp",ic:"🏠",t:"Camp and money",h:()=>
  gh("Money")+
  gl(["Class fees from students. The more famous the camp, the more students come","Fight purses, plus a bonus for winning","Some camp activities, and sponsors"])+
  gh("Money out")+
  gl(["Wages for fighters and coaches every week","Camp upkeep, which grows the more you build","Scouting, pet food"])+
  gh("Fame")+
  gp("Comes from wins, big fights and promotion. High fame brings more students and better fight offers")+
  gh("Building the camp")+
  gl(["<b>Training gear</b> · training pays off more","<b>Recovery room, kitchen</b> · faster recovery, fewer injuries","<b>Class yard, promotion signs</b> · more students","<b>Tape analysis room</b> · scouting at half price","Some open only after a certain week or fame"])+
  gtip("Build what brings students first so money comes in every week, then build what helps training")},
 {id:"heart",ic:"💖",t:"Relationships",h:()=>
  gl(["<b>Bond ♥</b> · grows from outings, talking, gifts, and leveling up her cards","More bond unlocks special scenes. At ♥ Lv.7 she unlocks her <b>signature move</b> and enters blood-boil mode more easily","<b>Trust</b> · higher makes corner orders work better. At 60, a loss hurts her morale less","Trust grows from merit-making, wai khru, not overtraining, and a camp with no debt","<b>Morale</b> · higher means she lands more. Goes up with wins, down with losses"])+
  gtip("Some things open by themselves once you're close enough. Spend time with everyone")},
 {id:"card",ic:"🃏",t:"Guard",h:()=>
  gl(["Cards come from the story, bond, and the <b>gacha</b>","Card rarity N · R · SR · SSR (SSR is the rarest)","Finish a card's story to unlock its art · SSR cards hide a secret art too"])+
  gh("Gacha")+
  gl(["Each pull costs <b>30 ✦</b> (stardust)","SSR 3% · SR 27%","30 pulls without an SSR guarantees an SSR you don't have yet"])+
  gh("Duplicate cards")+
  gl(["<b>Level up the card</b> · up to Lv.3 for more story, and a little more bond with the card's owner","<b>Break down into ✦</b> · N 5 ✦ · R 10 ✦ · SR 25 ✦ · SSR 60 ✦"])+
  gtip("Some camp activities give ✦ too. Save them up and keep pulling")},
 {id:"scard",ic:"🎴",t:"Support cards",on:()=>typeof scOn==="function"&&scOn(),h:()=>
  gl(["Give each fighter up to 5 cards in the <b>Cards</b> tab on her page","Slots open with the fighter's level and money · equipping costs a fee, removing is free","Her own cards are ×1.5 stronger"])+
  gh("What you get")+
  gl(["<b>Training</b> · stats in the card's theme grow faster. Several cards stack (up to +20%)","<b>Fight effects</b> · crit, dodge, counter, grit, stamina recovery or corner orders · the same kind doesn't stack, only the strongest card works"])+
  gtip("Put her own cards in for training, then add fight effects she doesn't have yet. The <b>Coach picks</b> button picks this way")},
 {id:"gloss",ic:"📘",t:"Glossary",h:()=>`<dl class="gdl">${GLOSS.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`}
];
const guideCh=id=>GUIDE.find(c=>c.id===id&&(!c.on||c.on()));
function guideHTML(ch){const C=ch&&guideCh(ch),back=UI.modal&&UI.modal.prev;
  const foot=`<div class="mfoot">${C?`<button class="btn ghost" data-act="guide">Contents</button>`:""}<button class="btn primary" data-act="guideclose">${back?"Back":"Close"}</button></div>`;
  if(!C)return `<h2 class="gtitle">${BOOK_PX} Game guide</h2><p class="meta">The Muay Thai Moe encyclopedia · tap a topic to read</p><div class="gidx">${GUIDE.filter(c=>!c.on||c.on()).map(c=>`<button class="px" data-act="guide" data-v="${c.id}"><span>${c.ic}</span><b>${c.t}</b></button>`).join("")}</div>${foot}`;
  return `<h2 class="gtitle">${BOOK_PX}${C.t}</h2><div class="gbody">${C.h()}</div>${foot}`;}
/* the style line under the fight sheet: both styles, the edge, and who in the camp has the edge when ours doesn't */
function styMatchHTML(me,op){if(!me||!op)return "";const q=`<button class="gq" data-act="guide" data-v="style" aria-label="What are fight styles?">?</button>`;
  if(!scouted(op.id))return `<p class="stym meta">Style of ${esc(op.name)} <b>???</b> · scout to see who has the edge ${q}</p>`;
  const a=fightStyle(me),b=fightStyle(op),e=styleEdge(a,b);
  const alt=e>0?[]:roster(G).filter(f=>f.id!==me.id&&styleEdge(fightStyle(f),b)>0).map(f=>esc(f.name));
  return `<p class="stym">Style <b>${FSTYLE[a]}</b> vs <b>${FSTYLE[b]}</b> ${styChip(a,b)} ${q}${alt.length?`<small class="meta">In the camp with the edge over ${esc(op.name)}: ${alt.join(" · ")}</small>`:""}</p>`;}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  guide:d=>{const m=UI.modal,prev=m&&m.type==="guide"?m.prev:m;UI.modal={type:"guide",ch:(d&&d.v)||null,prev};render();const b=document.querySelector(".modal .gbody,.modal .gidx");if(b&&b.closest(".modal"))b.closest(".modal").scrollTop=0;},
  guideclose:()=>{const m=UI.modal;UI.modal=(m&&m.prev)||null;render();}});

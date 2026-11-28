// ================= MUAY THAI MOE — camp pets, deeper (v1.91.144, Man) =================
// One button on the home screen opens the pet window. Each pet has a level (1–10), joy, and a passive that helps the camp a little
// every week — rolled each week like training, so it is never a sure thing. Playing opens the camp-activity style vignette.
// Pets have moods: some days they don't feel like playing, now and then one bolts off into the rice fields and comes back a week later.
// Old saves: the old play still works the same; existing pets start with EXP for the weeks they have lived at camp.
;(function(){
const PET_ART=new Set(window.__MTM_PETART||[]);
const PMAX=10,needXP=l=>30*l;                                       /* Lv n → n+1 needs 30·n EXP */
const pv=G=>(G.pets||[]);
function pst(G,p){if(p.lv==null){p.lv=1;p.xp=0;const age=Math.max(0,gameWeek(G)-(p.since!=null?p.since:gameWeek(G)));petXP(p,Math.min(400,age*4),true);}p.joy=p.joy??60;return p;}
function petXP(p,n,quiet){if(p.lv>=PMAX)return 0;p.xp=(p.xp||0)+n;let up=0;while(p.lv<PMAX&&p.xp>=needXP(p.lv)){p.xp-=needXP(p.lv);p.lv++;up++;}if(p.lv>=PMAX)p.xp=0;return up;}
const tier=p=>p.lv>=10?3:p.lv>=6?2:p.lv>=3?1:0;                      /* talent tiers at Lv.3 / 6 / 10 */
const away=(G,p)=>p.away!=null&&gameWeek(G)<p.away;

/* ---------- what each pet does ---------- */
const PX={
 cat:{pas:p=>`Everyone's morale +1${p.lv>=5?"~2":""} (rolled weekly)`,tal:["Students love the cat: class income +3%","Students love the cat: class income +5%","Camp mascot cat: class income +8%"],
  modes:[["Belly scratches",15,10,0],["Laser-pointer chase",5,20,0],["Give cat treats",25,6,60]],bg:"bg_camp_day.webp"},
 dog:{pas:p=>`Everyone's fatigue −1${p.lv>=5?"~2":""} (rolled weekly)`,tal:["Guard dog: camp upkeep −3%","Guard dog: camp upkeep −5%","Legendary guard dog: upkeep −8%"],
  modes:[["Play fetch",15,10,0],["Run round camp",5,20,0],["Give a bath",25,6,40]],bg:"bg_farm.webp"},
 rooster:{pas:p=>`Dawn wake-up: training gains +${p.lv>=5?4:2}% (rolled weekly)`,tal:["Fighting spirit: fighters with a bout this week get morale +3","Fighting spirit: morale +5","Champion gamecock: morale +8"],
  modes:[["Crow for an audience",15,10,0],["Show off round the village",5,20,0],["Scatter rice",25,6,30]],bg:"bg_rooster.webp"},
 turtle:{pas:p=>`Everyone's morale +1${p.lv>=5?"~2":""} (rolled weekly)`,tal:["Calm: injured fighters may heal early","Calm: injuries heal early more often","Sacred turtle: injuries heal much faster"],
  modes:[["Pat the shell",15,10,0],["Slow walk",5,20,0],["Feed morning glory",25,6,20]],bg:"bg_camp_day.webp"},
 otter:{pas:p=>`Everyone's fatigue −1 (rolled weekly)`,tal:["Viral clips: a little reputation","Viral clips: reputation up more often","TikTok star otter: reputation up every week"],
  modes:[["Play in the water",15,10,0],["Swim training",5,20,0],["Feed little fish",25,6,50]],bg:"bg_river.webp"}}; /* v1.91.151 (Man): the otter swims IN the river — bg_river is mirrored so the water is on the right; the fighter stands on the pier, not on the water */
const PLINE={
 cat:[[" rolls over for belly scratches and purrs loud enough for the whole camp"," pounces at the red dot and crashes into the heavy bag"," finishes the whole pack of treats and stares at you for more"]," walks off to sleep on Kru Daeng's gym bag, ignoring everyone"," leaps the fence and runs into the rice fields after a rat!"],
 dog:[[" fetches the ball and drops it at your feet, tail spinning like a propeller"," leads the run round camp until the fighters are gasping"," shakes off and soaks the whole yard"]," lies flat by the ring with a long sigh — not today"," spots a buffalo in the field and chases it barking, refusing to come back!"],
 rooster:[[" crows three times and the neighbours clap"," struts chest-out at the head of a parade round the village"," pecks the rice with the grace of a champion gamecock"]," stands on one leg with eyes shut, ignoring the world"," flaps over the fence to court the neighbour's hen in the field!"],
 turtle:[[" stretches out for a slow pat, and everyone calms down"," walks so slowly everyone stops to wait, and the whole camp laughs"," eats morning glory one leaf at a time — slow but steady"]," pulls into the shell and won't come out, however much you knock"," slowly wanders off toward the fields… nobody saw them start"],
 otter:[[" swims in circles, then splashes water in your face"," dives and does a flip turn like an athlete"," takes the little fish with both paws — so cute everyone films it"]," just floats on their back, not wanting to play"," follows a school of fish far down the canal!"]};
const BACK=[[" is back, muddy all over, with a twenty-baht note in their mouth",20],[" is back, bringing the neighbour's puppy along",0],[" is back in the morning, panting but happy",0],[" is back with straw on their head; the farmer next door says thanks for chasing the rats and sends a bag of rice",300],[" is back — the village kids carried them all the way to the gate",0]];

/* ---------- weekly: joy, passive EXP, the rolled passives ---------- */
function petsWeekly(G){const P=pv(G);if(!P.length)return;const R=roster(G),rng=mulberry32((G.seed^0x9e7)+gameWeek(G)*31),log=[];G.petLast={};
  for(const p0 of P){const p=pst(G,p0),D=PX[p.k];if(!D)continue;
    if(p.away!=null&&gameWeek(G)>=p.away){const b=BACK[Math.floor(rng()*BACK.length)];p.away=null;p.joy=Math.min(100,p.joy+10);if(b[1])G.cash+=b[1];log.push(`🐾 ${p.name}${b[0]}${b[1]?` (+฿${b[1]})`:""}`);continue;}
    if(away(G,p))continue;
    if(p.wk!==gameWeek(G))p.joy=Math.max(0,p.joy-5);                 /* no play this week */
    if(p.joy>=60)petXP(p,5);
    const lowJoy=p.joy<30,ok=rng()<.5+p.joy/200;if(!ok){G.petLast[p.k]="—";continue;}    /* the weekly roll, like training */
    const big=p.lv>=5&&rng()<.5,amt=(big?2:1)*(lowJoy?.5:1);let got="";
    if(p.k==="cat"||p.k==="turtle"){R.forEach(f=>f.morale=clamp(f.morale+amt,0,100));got=`Morale +${amt}`;}
    if(p.k==="dog"||p.k==="otter"){const a=p.k==="otter"?1*(lowJoy?.5:1):amt;R.forEach(f=>f.fatigue=clamp(f.fatigue-a,0,100));got=`fatigue −${a}`;}
    if(p.k==="rooster")got="dawn wake-up";
    const t=tier(p);if(t){const tm=[0,1,1.7,2.7][t]*(lowJoy?.5:1);
      if(p.k==="cat"&&rng()<.6){const c=Math.round(classIncome(G)*.03*tm);if(c>0){G.cash+=c;got+=` · classes +฿${c}`;}}
      if(p.k==="dog"&&rng()<.6){const c=Math.round(upkeep(G)*.03*tm);if(c>0){G.cash+=c;got+=` · saved ฿${c}`;}}
      if(p.k==="rooster"){const add=[0,3,5,8][t]*(lowJoy?.5:1);const B=(G.bookings||[]).filter(b=>b.week===G.week+1||b.week===G.week).map(b=>G.F[b.a]).filter(f=>f&&f.camp==="player");B.forEach(f=>f.morale=clamp(f.morale+add,0,100));if(B.length)got+=` · fighting spirit +${add}`;}
      if(p.k==="turtle"){const ch=[0,.25,.4,.6][t];R.forEach(f=>{if(f.injury>0&&rng()<ch){f.injury--;got+=` · ${f.name} heals faster`;}});}
      if(p.k==="otter"&&rng()<[0,.3,.5,.9][t]){G.rep+=.03*(lowJoy?.5:1);got+=" · viral clip, reputation +0.03";}}
    G.petLast[p.k]=got;}
  if(log.length){G.log=G.log||[];log.forEach(l=>G.log.push(l));}}
{const _w=xlWeekly;xlWeekly=function(G){_w(G);try{petsWeekly(G);}catch(e){console.error("pets",e);}};}
/* the rooster's dawn crow makes training a touch better (rolled each week) */
{const _t=trainWeek;trainWeek=function(G,f,rng){const r=_t(G,f,rng);try{const p=pv(G).find(x=>x.k==="rooster");if(p&&f.camp==="player"&&!away(G,p)&&f.gains&&G.petLast&&G.petLast.rooster&&G.petLast.rooster!=="—"){
  const pc=(p.lv>=5?.04:.02)*(p.joy<30?.5:1);for(const x of Object.keys(f.gains)){const d=f.gains[x];if(d>0){const add=d*pc;f.a[x]=Math.min(stCap(f),f.a[x]+add);f.gains[x]=d+add;}}}}catch(e){}return r;};}
/* the old one-tap play keeps its effect; it now also gives EXP, joy and moods */
function petPlayMode(G,i,mi){const p=pst(G,pv(G)[i]);if(!p||p.wk===gameWeek(G)||away(G,p))return null;const D=PX[p.k],M=D.modes[mi]||D.modes[0];
  if(M[3]&&G.cash<M[3])return {err:"Not enough money"};if(M[3])G.cash-=M[3];
  const r=Math.random(),runP=["cat","dog","rooster","otter","turtle"].includes(p.k)?(p.joy<40?.08:.04):0,noP=p.joy<40?.18:.08;
  if(r<runP){p.wk=gameWeek(G);p.away=gameWeek(G)+1;p.joy=Math.max(0,p.joy-5);return {p,res:"run",line:PLINE[p.k][2]};}
  if(r<runP+noP){p.wk=gameWeek(G);petXP(p,3);return {p,res:"no",line:PLINE[p.k][1]};}
  petPlay(G,i);p.joy=Math.min(100,p.joy-10+M[1]);const up=petXP(p,M[2]);return {p,res:"ok",line:PLINE[p.k][0][mi]||PLINE[p.k][0][0],M,up};}

/* ---------- UI: one button on home, a pet window, the vignette ---------- */
petsRowHTML=function(){const P=pv(G);if(!P.length)return "";const n=P.filter(p=>p.wk!==gameWeek(G)&&!away(G,p)).length;
  return `<button class="campact petbtn" data-act="petsopen"><span class="peticons">${P.slice(0,5).map(p=>petThumb(p.k)).join("")}</span><span><small>🐾 Camp pets: ${P.length}</small><b>${n?`Can still play with ${n} more`:"All played this week ✓"}</b></span></button>`;};
const bar=(v,m,c)=>`<i class="pbar"><b style="width:${Math.round(100*Math.min(1,v/m))}%;background:${c}"></b></i>`;
XMODAL.pets=m=>{const P=pv(G);if(m.i!=null&&P[m.i]){const p=pst(G,P[m.i]),D=PX[p.k],done=p.wk===gameWeek(G),aw=away(G,p);
    return {foot:false,body:`<div class="petdet"><div class="pdh">${petThumb(p.k,"big")}<div><h2>${esc(p.name)} <small>Lv.${p.lv}</small></h2><p class="meta">${esc(PETS[p.k].name)}${p.fav&&G.F[p.fav]?` · best buddy of ${esc(G.F[p.fav].name)}`:""}</p></div></div>
     <div class="pstat"><span>EXP</span>${bar(p.lv>=PMAX?1:p.xp,p.lv>=PMAX?1:needXP(p.lv),"#ffd34a")}<em>${p.lv>=PMAX?"MAX":`${p.xp}/${needXP(p.lv)}`}</em></div>
     <div class="pstat"><span>Joy</span>${bar(p.joy,100,p.joy<30?"#e8434f":p.joy<60?"#f0a33a":"#5cc46a")}<em>${p.joy}${p.joy<30?" · grumpy (helps only half as much)":""}</em></div>
     <ul class="ptal"><li><b>Weekly</b> ${esc(D.pas(p))}</li>${D.tal.map((t,j)=>`<li class="${p.lv>=[3,6,10][j]?"on":"off"}"><b>Lv.${[3,6,10][j]}</b> ${esc(t)}${p.lv>=[3,6,10][j]?"":" 🔒"}</li>`).join("")}</ul>
     ${G.petLast&&G.petLast[p.k]?`<p class="meta">Last week: ${G.petLast[p.k]==="—"?"didn't feel like helping 😴":esc(G.petLast[p.k])}</p>`:""}
     ${aw?`<p class="pwarn">🏃 ${esc(p.name)} ran off to play in the rice fields — back next week</p>`:done?`<p class="meta">Played this week ✓</p>`:`<div class="pmodes">${D.modes.map((M,j)=>`<button class="btn" data-act="petgo" data-v="${m.i}:${j}"><b>${esc(M[0])}</b><small>joy +${M[1]} · EXP +${M[2]}${M[3]?` · ฿${M[3]}`:""}</small></button>`).join("")}</div>`}
     <div class="mfoot"><button class="btn ghost" data-act="petsopen">◂ All pets</button><button class="btn ghost" data-act="petren" data-v="${m.i}">Rename</button></div></div>`};}
  return {foot:true,body:`<h2>🐾 Camp pets</h2><p class="meta">Play with each pet once a week — it doesn't use your camp activity · happy pets help more · their help is rolled each week, like training</p>
   <div class="petgrid">${P.map((p0,i)=>{const p=pst(G,p0),aw=away(G,p),done=p.wk===gameWeek(G),D=PX[p.k];return `<div class="petcard ${aw?"away":done?"done":""}">${petThumb(p.k)}
     <div class="pcm"><span class="pc1"><b>${esc(p.name)}</b> <small>Lv.${p.lv}</small><button class="pcdet" data-act="petdet" data-v="${i}">Details ›</button></span><span class="pcj"><small>Happiness</small>${bar(p.joy,100,p.joy<30?"#e8434f":p.joy<60?"#f0a33a":"#5cc46a")}</span>
     <small class="pc2">${esc(D?D.pas(p):"")}</small></div>
     <div class="pcact">${aw?`<span class="pwarn">🏃 Off in the rice fields — back next week</span>`:done?`<span class="meta">Played this week ✓</span>`:(D?D.modes:[]).map((M,j)=>`<button class="btn sm gold" data-act="petgo" data-v="${i}:${j}">${esc(M[0])}${M[3]?` ฿${M[3]}`:""}</button>`).join("")}
     </div></div>`;}).join("")}</div>`};}; /* v1.91.211 (Man: the pet card felt busy) — details moved next to the name, play buttons gold */
for(const k of Object.keys(PX)){CFX["pet_"+k]={bg:PX[k].bg,cap:"",row:"idle",fx:"hearts"};CFX["pet_"+k+"_no"]={bg:PX[k].bg,cap:"",row:"idle",fx:"z"};CFX["pet_"+k+"_run"]={bg:"bg_farm.webp",cap:"",row:"idle",fx:"sparks"};}
const PIMG={};const petImg=k=>{if(!PET_ART.has(k))return null;if(!(k in PIMG)){const i=new Image();i.src=ASSET+"pet_"+k+".webp";PIMG[k]=i;}const i=PIMG[k];return i.complete&&i.naturalWidth?i:null;};
/* 8-bit sprite sheets: 4 walk frames side by side (frame sizes below) */
/* Man's sprite sheets (v1.91.144): 4 columns × 5 rows — walk(4) · idle(2) · happy(2–3) · sulk(2) · run(4); [frame w, frame h, frames per row] */
const PSZ={"cat": [86, 74, [4, 2, 2, 2, 4]], "dog": [97, 74, [4, 2, 2, 2, 4]], "turtle": [99, 74, [4, 2, 2, 2, 4]], "rooster": [84, 74, [4, 2, 3, 2, 4]], "otter": [87, 74, [4, 2, 2, 2, 4]], "mudlek": [84, 74, [4, 2, 2, 2, 4]]};
const PROW={walk:0,idle:1,happy:2,sulk:3,run:4},PHT={cat:1,dog:1.1,rooster:1.1,turtle:.9,otter:.85,mudlek:1};   /* relative on-screen size */
function petSprite(x,k,cx,fy,h,fl,t,anim){const im=petImg(k),Z=PSZ[k];if(!im||!Z)return false;const [fw,fh,cnt]=Z,row=PROW[anim]??0,n=cnt[row]||1,sp=anim==="run"?110:anim==="walk"?150:anim==="happy"?420:700,fr=Math.floor(t/sp)%n,w=h*fw/fh;
  x.save();x.imageSmoothingEnabled=false;x.translate(Math.round(cx),Math.round(fy));x.scale(fl,1);x.drawImage(im,fr*fw,row*fh,fw,fh,Math.round(-w/2),Math.round(-h),Math.round(w),Math.round(h));x.restore();return true;}
/* the camp yard on the home screen: pets walk about as sprites (pixel.js calls this) */
window.petHub=(ctx,k,cx,fy,fl,t,moving,S)=>petSprite(ctx,k,cx,fy,22*S*(PHT[k]||1),fl,t,moving?"walk":"idle");
const petThumb=(k,cls)=>PET_ART.has(k)&&PSZ[k]?`<span class="psp ${cls||""}" style="background-image:url(${ASSET}pet_${k}.webp);aspect-ratio:${PSZ[k][0]}/${PSZ[k][1]};background-size:400% 500%;background-position:0 25%" role="img" aria-label=""></span>`:`<img class="peti ${cls||""}" src="${petIcon(k)}" alt="">`;
{const _d=drawCampFx;drawCampFx=function(x,k,t){if(!k||!k.startsWith("pet_"))return _d(x,k,t);const parts=k.split("_"),pk=parts[1],res=parts[2]||"ok",C=CFX[k]||{},W=x.canvas.width,H=x.canvas.height;
  x.imageSmoothingEnabled=false;x.fillStyle="#1a1428";x.fillRect(0,0,W,H);const bg=img(C.bg||"bg_camp_day.webp");
  if(bg.complete&&bg.naturalWidth){const s=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);const w=bg.naturalWidth*s,h=bg.naturalHeight*s;x.imageSmoothingEnabled=true;x.save();if(pk==="otter"&&res!=="run"){x.translate(W,0);x.scale(-1,1);} /* the otter plays where the water is */x.drawImage(bg,(W-w)/2,(H-h)/2,w,h);x.restore();x.imageSmoothingEnabled=false;}
  const fy=H*.93,fh=H*.6;const R=cfxRoster(),f=R[0];
  if(f&&res!=="run")drawFrame(x,sheetFor(f),ROW[res==="ok"?(Math.floor(t/1200)%2?"win":"idle"):"idle"],Math.floor(t/220)%4,W*.22,fy,fh,false);
  /* the pet keeps to the right half */
  let cx=W*.5,bob=0,fl=1,mv=false;
  if(res==="ok"){cx=W*.66+Math.sin(t/900)*W*.14;fl=Math.cos(t/900)>0?1:-1;mv=true;}
  if(res==="run"){cx=W*.3+((t/5)%(W*.9));fl=1;mv=true;}
  const ph=H*.4*(PHT[pk]||1);let pfy=fy;if(pk==="otter"&&res!=="run"){cx=Math.min(W*.9,cx+W*.28);pfy=H*.86;}   /* the otter swims in the river, off the pier */
  /* happy: walks about, then stops for the happy pose · sulk: lies there · run: dashes off */
  const cyc=t%3200,anim=res==="no"?"sulk":res==="run"?"run":cyc<1800?"walk":"happy";if(res==="ok"){const dir=Math.floor(t/3200)%2?-1:1;cx=(dir>0?W*.36:W*.66)+dir*Math.min(cyc,1800)/1800*W*.3;fl=dir;}
  x.fillStyle="rgba(0,0,0,.25)";x.beginPath();x.ellipse(cx,pfy,ph*.55,ph*.08,0,0,Math.PI*2);x.fill();
  if(!petSprite(x,pk,cx,pfy,ph,fl,t,anim)){const Z=Math.max(3,Math.round(ph/9)),wd=pk==="dog"?15:11,px=cx-wd*Z/2,py=fy-9*Z+bob;const Q=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(fl>0?px+a*Z:px+(wd-a-w)*Z),Math.round(py+b*Z),w*Z,h*Z);};try{drawPetQ(Q,pk,t,mv);}catch(e){}}
  const ph2=(t%1400)/1400;
  if(res==="ok"){x.globalAlpha=1-ph2;x.fillStyle="#ff6a8a";const hx=cx+8,hy=fy-ph-6-ph2*30;x.fillRect(hx,hy,4,3);x.fillRect(hx-2,hy+2,8,3);x.fillRect(hx,hy+5,4,2);x.globalAlpha=1;}
  if(res==="no"){x.globalAlpha=1-ph2;x.fillStyle="#cfe2ff";x.font=`bold ${10+ph2*8}px "Pixelify Sans",sans-serif`;x.fillText("z",cx+10+ph2*10,fy-ph-ph2*30);x.globalAlpha=1;}
  if(res==="run")for(let i=0;i<4;i++){x.globalAlpha=.6;x.fillStyle="#e8d9b0";x.fillRect(cx-20-i*9-(t/40%6),fy-4-(i%2)*4,6,4);x.globalAlpha=1;}};}
Object.assign(ACT,{
  petsopen:()=>{UI.modal={type:"pets"};render();},
  petdet:d=>{UI.modal={type:"pets",i:+d.v};render();},
  petplay:d=>{UI.modal={type:"pets",i:+d.v};render();},            /* the old chip now opens the pet */
  petgo:d=>{const [i,mi]=String(d.v).split(":").map(Number);const r=petPlayMode(G,i,mi);if(!r)return;if(r.err){toast(r.err);return;}AU.sfx&&AU.sfx(r.res==="ok"?"level":"ui");
    const p=r.p,fav=p.fav&&G.F[p.fav]&&G.F[p.fav].camp==="player"?[p.fav]:roster(G).slice(0,1).map(f=>f.id);UI.cfxIds=fav;
    const note=r.res==="ok"?`${p.name}${r.line} · ${PETS[p.k].eff} · joy ${p.joy} · EXP +${r.M[2]}${r.up?` · 🎉 Level up! Lv.${p.lv}`:""}`
      :r.res==="no"?`${p.name}${r.line} · not in the mood today (EXP +3) — try again next week`:`${p.name}${r.line} · back next week; no help to the camp until then`;
    UI.modal={type:"campres",k:"pet_"+p.k+(r.res==="ok"?"":"_"+r.res),title:r.res==="ok"?`${r.M[0]} and ${p.name}`:r.res==="no"?`${p.name} doesn't feel like playing`:`${p.name} ran off!`,cap:r.res==="ok"?`${r.M[0]} · ${p.name}`:r.res==="no"?`${p.name} ignores you`:`${p.name} bolts into the rice fields!`,note,back:"petsopen"};save();render();}});

/* ---------- หมัดเหล็ก: Fah's grey cat from Phayak Thong follows her when she joins the camp (v1.91.144, Man) ---------- */
PETS.mudlek={name:"Silver cat with white socks",food:120,eff:"Everyone's morale +1 · Fah's morale +3"};PET_NAMES.mudlek=["Iron Fist"];
PX.mudlek={pas:p=>`Everyone's morale +1${p.lv>=5?"~2":""} (rolled weekly)`,tal:["Fah's watch-cat: Fah's training gains +3%","Fah's watch-cat: Fah's training gains +5%","The real Iron Fist: Fah's training gains +8%"],
  modes:[["Cat boxing",5,20,0],["Pat his head",15,10,0],["Give canned tuna",25,6,60]],bg:"bg_camp_day.webp"};
PLINE.mudlek=[[" puts up his front paws and jabs at your hand like Fah on the pads"," butts his head into your hand with a hoarse alley-boss meow"," finishes the whole tin of tuna and goes to sleep on Fah's gloves"]," sits with his back to you, watching only Fah train"," leaps the fence and heads toward Phayak Thong camp… probably visiting the old home"];
CFX.pet_mudlek={bg:"bg_camp_day.webp",cap:"",row:"idle",fx:"hearts"};CFX.pet_mudlek_no={bg:"bg_camp_day.webp",cap:"",row:"idle",fx:"z"};CFX.pet_mudlek_run={bg:"bg_farm.webp",cap:"",row:"idle",fx:"sparks"};
{const _w=petsWeekly;petsWeekly=function(G){_w(G);const p=pv(G).find(x=>x.k==="mudlek");if(!p||away(G,p)||!G.petLast||G.petLast.mudlek!=="")return;
  const R=roster(G),amt=(p.lv>=5&&Math.random()<.5?2:1)*(p.joy<30?.5:1);R.forEach(f=>f.morale=clamp(f.morale+amt,0,100));const fah=G.F.fah;if(fah&&fah.camp==="player")fah.morale=clamp(fah.morale+3,0,100);G.petLast.mudlek=`Morale +${amt} · Fah +3`;};}
{const _t=trainWeek;trainWeek=function(G,f,rng){const r=_t(G,f,rng);try{if(f.id==="fah"&&f.camp==="player"&&f.gains){const p=pv(G).find(x=>x.k==="mudlek");if(p&&!away(G,p)&&tier(p)){
  const pc=[0,.03,.05,.08][tier(p)]*(p.joy<30?.5:1);for(const x of Object.keys(f.gains)){const d=f.gains[x];if(d>0){const add=d*pc;f.a[x]=Math.min(stCap(f),f.a[x]+add);f.gains[x]=d+add;}}}}}catch(e){}return r;};}
EVENTS.push({id:"pet_mudlek",look:"casual",bg:"camp",pri:2,when:G=>inCamp(G,"fah")&&!hasPet(G,"mudlek"),steps:[
  {n:"nar",t:"Fah went back to Golden Tiger for the last of her things. She came back dragging one suitcase — and a rattan basket with a cloth tucked tightly over it."},
  {n:"nar",t:"The rattan basket moves by itself, then lets out a hoarse \"meow\"."},
  {n:"fah",f:"flustered",l:"casual",t:"…Don't look at me like that! Iron Fist doesn't belong to Phayak Thong anymore. Fah moved, so he moves too. End of story."},
  {n:"nar",t:"Fah lifts the cloth. Out jumps a cat with silver fur exactly like Fah's hair, four white paws like little socks, a nick in one ear, and yellow eyes sizing everyone up like opponents."},
  {n:"coach",t:"Same colour as his owner… our camp's turning into a zoo, manager."},
  {inject:G=>hasPet(G,"cat")?[{n:"nar",t:`Iron Fist walks straight to the heavy bag, where ${petIntro(G,"cat")} is sleeping. The two cats stare at each other for a full ten seconds…`},{n:"nar",t:`${petName(G,"cat")} shifts over to the other side — they split the bag half and half`},{n:"fah",f:"happy",l:"casual",t:"See? Iron Fist won in the first round!"}]:[{n:"fah",f:"happy",l:"casual",t:"He's picked the middle heavy bag. That's his bed now — nobody take it."}]},
  {n:"fah",f:"pout",l:"casual",t:G=>`${CALL(G,"fah")} …look after him, okay? He likes tuna, and people who don't talk too much.`},
  {inject:G=>{adoptPet(G,"mudlek","Iron Fist","fah");return [{n:"nar",t:"🐾 Iron Fist joins the camp — see the pets button on the home screen"}];}}]});
try{window.PETX={petsWeekly,petPlayMode,pst,petXP,PX};}catch(e){}
})();

/* v1.91.177 (Man): support cards — every camp fighter can carry up to 5 album cards.
   Slots open by HER level and cost money (dear on purpose: late-game camps sit on a lot of cash).
   Equipping costs a fee by rarity (taking off is free), a card sits on one fighter at a time, her own card counts ×1.5.
   Cards add a little to training (their theme stats) and to fights (crit/evade/counter/…); each card glows when it works. */
const SC_LV=[1,8,15,22,30],SC_COST=[0,20000,80000,200000,400000],SC_MAX=5;
const SC_FEE={N:1000,R:3000,SR:10000,SSR:30000};
const SC_TRAIN={N:[.01,.015,.02],R:[.02,.025,.03],SR:[.03,.035,.04],SSR:[.04,.05,.06]};
const SC_FIGHT={N:[0,0,0],R:[.003,.004,.005],SR:[.006,.008,.01],SSR:[.01,.0125,.015]};
const SC_CAP={train:.2,crit:.07,evade:.01,ctr:.07,clutch:.09,regen:.06,corner:.25};
const SC_OWN=1.5;
const SC_FKM={crit:2,evade:.2,ctr:1.2,clutch:3.2,regen:1,corner:7}; /* per-effect weight so every girl's fight bonus is worth about the same (sim) */
const SC_THEME={
  kati:{tr:["kick","foot","guard"],fk:"crit",w:"all",txt:"Critical hits"},
  mali:{tr:["elbow","knee","clinch","foot"],fk:"evade",txt:"Evade"},
  rin:{tr:["counter","iq","guard"],fk:"ctr",txt:"Counter"},
  ploy:{tr:["punch","power","speed"],fk:"crit",w:"punch",txt:"Punch crit"},
  fah:{tr:["elbow","power","speed"],fk:"clutch",txt:"Accuracy when hurt"},
  prod_B:{tr:["elbow","counter"],fk:"ctr",txt:"Counter"},
  pailin:{tr:["iq","comp"],fk:"corner",txt:"Corner orders"},
  team:{tr:null,half:1,fk:"regen",txt:"Recovery"}};
const SC_FKNAME={crit:"Crit ",evade:"Evade",ctr:"Counter",clutch:"Accuracy when hurt",regen:"Recovery",corner:"Corner orders"};
const scTeam=id=>/team/.test(id);
/* v1.91.177 (Man): shipped dark — off for players until Man says so. Preview: open the game with #sc=1 (#sc=0 turns it back off). To launch, make this return true. */
function scOn(){try{if(typeof location!=="undefined"){const m=/[#&]sc=([01])/.exec(location.hash||"");if(m){if(m[1]==="1")localStorage.setItem("mtm_sc","1");else localStorage.removeItem("mtm_sc");}}return typeof localStorage!=="undefined"&&localStorage.getItem("mtm_sc")==="1";}catch(e){return false;}}
function scTheme(id){const C=CARDS[id];if(!C||scTeam(id))return SC_THEME.team;return SC_THEME[C.c]||(typeof REQ_ALIAS!=="undefined"&&SC_THEME[REQ_ALIAS[C.c]])||SC_THEME.team;}
const scSlots=f=>Math.min(SC_MAX,Math.max(1,f.cslot||1));
const scOwn=(f,id)=>{const C=CARDS[id];if(!C)return false;return scTeam(id)?!!(f.canon):C.c===f.id;};
function scList(G,f){const own=(G&&G.cards)||{};return (f.scards||[]).filter(id=>CARDS[id]&&own[id]).slice(0,scSlots(f));}
function scHolder(G,id){for(const f of Object.values(G.F||{}))if(f.camp==="player"&&(f.scards||[]).includes(id))return f;return null;}
/* everything a set of cards gives one fighter (L defaults to what she wears) — capped */
function scBonus(G,f,L,raw){L=L||scList(G,f);const tr={},fx={crit:{},evade:0,ctr:0,clutch:0,regen:0,corner:0},src={crit:{}},by=[],best={};
  for(const id of L){const C=CARDS[id],o=(G.cards||{})[id];if(!C||!o)continue;const T=scTheme(id),lv=clamp((o.lv||1)-1,0,2),m=scOwn(f,id)?SC_OWN:1;
    const tv=SC_TRAIN[C.r][lv]*m*(T.half?.5:1),fv=SC_FIGHT[C.r][lv]*m;
    const stats=T.tr||ATTRS.map(a=>a[0]);for(const k of stats)tr[k]=(tr[k]||0)+tv;
    /* v1.91.177 (Man): fight effects of one kind don't stack — the strongest card of that kind is the one that works */
    if(fv){const v=fv*(SC_FKM[T.fk]||1);if(T.fk==="crit"){if(raw||!best.crit||v>best.crit.v){if(!raw)best.crit={v,w:T.w,id};else fx.crit[T.w]=(fx.crit[T.w]||0)+v;}}else if(raw)fx[T.fk]+=v;else if(v>fx[T.fk]){fx[T.fk]=v;src[T.fk]=id;}}
    by.push({id,T,own:m>1,tv,fv:fv*(SC_FKM[T.fk]||1)});}
  if(best.crit){fx.crit[best.crit.w]=best.crit.v;src.crit[best.crit.w]=best.crit.id;}
  if(!raw){for(const k in tr)tr[k]=Math.min(SC_CAP.train,tr[k]);for(const w in fx.crit)fx.crit[w]=Math.min(SC_CAP.crit,fx.crit[w]);
  for(const k of ["evade","ctr","clutch","regen","corner"])fx[k]=Math.min(SC_CAP[k],fx[k]);}
  return {tr,fx,src,by};}
/* engine hooks */
function scTrainMul(G,f,k){if(!scOn()||!G||f.camp!=="player"||!(f.scards||[]).length)return 1;const b=scBonus(G,f);return 1+(b.tr[k]||0);}
function scFightMods(f,sk){if(!scOn()||typeof G==="undefined"||!G||!G.F)return;const o=Array.isArray(f.scards)?f:G.F[f.id];if(!o||o.camp!=="player"||!(o.scards||[]).length)return;const b=scBonus(G,o);
  sk.scCrit=b.fx.crit;sk.evade+=b.fx.evade;sk.ctr+=b.fx.ctr;sk.clutch+=b.fx.clutch;sk.regen+=b.fx.regen;sk.corner=(sk.corner||0)+b.fx.corner;sk.scSrc=b.src;}
/* a card "works" at most once every few exchanges per fighter — the glow stays special */
function scProc(F,s,key,w){const S=s.sk&&s.sk.scSrc;if(!S)return null;const id=key==="crit"?S.crit&&(S.crit[w]||S.crit.all):S[key];if(!id||!CARDS[id])return null;
  const now=(F.round||1)*100+(F.ex||0);if(s.scNext!=null&&now<s.scNext)return null;s.scNext=now+4;s.scN=(s.scN||0)+1;
  return {id,r:CARDS[id].r,t:key==="crit"?(w==="kick"?"Kick crit!":w==="punch"?"Punch crit!":"Crit!"):SC_FKNAME[key]+"!",sd:s===F.A?"A":"B"};}
/* ---------- UI ---------- */
const scArt=id=>{const C=CARDS[id];return C?cardArtHTML(C,true):"";};
function scMini(id,cls,extra){const C=CARDS[id];if(!C)return "";const R=CARD_R[C.r];return `<span class="scm ${cls||""}" data-rarity="${C.r}" style="--rc:${R.c}"${extra||""}>${scArt(id)}<i class="rr">${C.r}</i></span>`;}
function scDraft(f){if(!UI.scd||UI.scd.fid!==f.id)UI.scd={fid:f.id,L:(f.scards||[]).slice(),pk:null};return UI.scd;}
function scDiff(G,f,L){const cur=f.scards||[],add=L.filter(id=>!cur.includes(id));return {add,fee:add.reduce((a,id)=>a+SC_FEE[CARDS[id].r],0),changed:add.length>0||cur.some(id=>!L.includes(id))};}
function scPresetHit(f,id){const T=scTheme(id),w=(PRESETS[f.plan&&f.plan.preset]||{}).w||{};if(!T.tr)return Object.keys(w).length>0;return T.tr.some(k=>(w[k]||0)>0);}
function scBonusLines(G,f,b){const A=Object.fromEntries(ATTRS),tr=Object.entries(b.tr).sort((x,y)=>y[1]-x[1]);const out=[];
  const allSame=tr.length===ATTRS.length&&tr.every(x=>Math.abs(x[1]-tr[0][1])<1e-9);
  if(allSame)out.push(`Training all stats +${(tr[0][1]*100).toFixed(1).replace(/\.0$/,"")}%`);
  else for(const [k,v] of tr.slice(0,6))out.push(`Trains ${A[k]} +${(v*100).toFixed(1).replace(/\.0$/,"")}%${v>=SC_CAP.train-1e-9?" (max)":""}`);
  for(const [w,v] of Object.entries(b.fx.crit))out.push(`${w==="kick"?"Kick crit":w==="punch"?"Punch crit":"Critical hits"} +${(v*100).toFixed(1).replace(/\.0$/,"")}%`);
  for(const k of ["evade","ctr","clutch"])if(b.fx[k])out.push(`${SC_FKNAME[k]} +${(b.fx[k]*100).toFixed(1).replace(/\.0$/,"")}%`);
  if(b.fx.regen)out.push(`Stamina recovery in fights +${(b.fx.regen*100).toFixed(1).replace(/\.0$/,"")}%`);if(b.fx.corner)out.push(`Corner orders work +${Math.round(b.fx.corner*100)}%`);
  return out;}
function scHowHTML(){return `<div class="px schow"><b>Kru Daeng: how cards work</b><ol><li>Tap an empty slot to pick a card from your album</li><li>Try it first — see what she gains before you pay</li><li>Press <b>Confirm</b> to pay the fee · removing is free · her own card counts ×1.5</li></ol>
  <p class="meta">Up to 5 slots, unlocked by that fighter’s level · a card can be on one fighter at a time</p><p class="meta">Training bonuses stack · fight effects of the same kind don't, the strongest card works, so mixing kinds pays off</p><div class="center"><button class="btn sm gold" data-act="schow">Got it</button></div></div>`;}
/* picker: filters + grid + detail */
const SCT={hide:"Hide cards others wear",fee:"Fee",full:"Training bonus already maxed",dupd:"Same fight effect, uses",dupd2:"instead",no:"Adds nothing",dup:"Same effect",trfull:"Train maxed",put:"Equip",tap:"Tap a card to see details"};
const SC_MAIN=["kati","mali","rin","ploy","fah"];
const SC_ICO={crit:"Crit ",evade:"Evade",ctr:"Counter",clutch:"Grit",regen:"Regen",corner:"Corner"};
function scOwnerKey(id){if(scTeam(id))return "team";const c=CARDS[id].c,a=(typeof REQ_ALIAS!=="undefined"&&REQ_ALIAS[c])||c;return SC_MAIN.includes(a)?a:"other";}
const scIco=id=>{const T=scTheme(id);return T.fk==="crit"&&T.w==="punch"?"Punch":SC_ICO[T.fk]||"";};
const scSum=b=>Object.values(b.tr).reduce((a,v)=>a+v,0)+Object.values(b.fx.crit).reduce((a,v)=>a+v,0)+["evade","ctr","clutch","regen","corner"].reduce((a,k)=>a+b.fx[k],0);
/* what one more card adds on top of L: training gain after the cap, and whether its fight effect is beaten by another card of the same kind */
function scInfo(f,L,id,GG){GG=GG||G;const M=L.filter(x=>x!==id),W=M.concat(id),a=scBonus(GG,f,M),b=scBonus(GG,f,W),T=scTheme(id);
  const tr=Object.values(b.tr).reduce((x,v)=>x+v,0)-Object.values(a.tr).reduce((x,v)=>x+v,0);
  let dup=null;if(SC_FIGHT[CARDS[id].r][0]){const s=T.fk==="crit"?Object.values(b.src.crit)[0]:b.src[T.fk];if(s&&s!==id)dup=s;}
  return {tr,dup,score:tr*10+(SC_FIGHT[CARDS[id].r][0]&&!dup?(b.by.find(x=>x.id===id)||{}).fv||0:0)*20,none:tr<=1e-9&&(dup||!SC_FIGHT[CARDS[id].r][0])};}
function scPickHTML(f,D){const own=G.cards||{},F=UI.scf=UI.scf||{o:"rec",r:"",hide:0};
  const base=D.L.filter((x,i)=>i!==D.pk);
  let ids=Object.keys(CARDS).filter(id=>own[id]&&!base.includes(id));
  const hold=id=>{const h=scHolder(G,id);return h&&h.id!==f.id?h:null;};
  const cnt={};for(const id of ids){const k=scOwnerKey(id);cnt[k]=(cnt[k]||0)+1;}
  if(F.o!=="rec")ids=ids.filter(id=>scOwnerKey(id)===F.o);
  if(F.r)ids=ids.filter(id=>CARDS[id].r===F.r);if(F.hide)ids=ids.filter(id=>!hold(id));
  const gn={};for(const id of ids){const g=scInfo(f,base,id);gn[id]=g.score-(g.dup?100:0)-(g.none?1000:0);}
  const sc=id=>(scOwn(f,id)?100:0)+CARD_R[CARDS[id].r].s*10+((own[id].lv)||1)+(scPresetHit(f,id)?3:0);
  if(F.o==="rec")ids=ids.sort((x,y)=>gn[y]-gn[x]||sc(y)-sc(x)).slice(0,12);else ids.sort((x,y)=>sc(y)-sc(x));
  const nm=k=>k==="rec"?"Suggested":k==="team"?"Team":k==="other"?"Others":(G.F[k]?G.F[k].name:k);
  const chip=(act,v,on,t)=>`<button class="scf${on?" on":""}" data-act="${act}" data-v="${v}">${t}</button>`;
  const ochips=["rec",...SC_MAIN,"team","other"].filter(k=>k==="rec"||cnt[k]).map(k=>chip("scfo",k,F.o===k,nm(k)+(k!=="rec"?`<small>${cnt[k]}</small>`:""))).join("");
  const rchips=["","SSR","SR","R","N"].map(r=>chip("scfr",r,F.r===r,r||"All")).join("");
  const sel=D.sel&&own[D.sel]&&!base.includes(D.sel)?D.sel:null;
  const tile=id=>{const g=scInfo(f,base,id),h=hold(id),tag=g.none?SCT.no:g.dup?SCT.dup:g.tr<=1e-9?SCT.trfull:"";
    return `<button class="sct${sel===id?" sel":""}${g.none?" dim":""}" data-act="scsel" data-v="${id}" aria-label="${esc(CARDS[id].t)}">${scMini(id)}<i class="sci">${scIco(id)}</i>${scOwn(f,id)?'<i class="scown">×1.5</i>':""}${h?`<i class="schold">${esc(h.name)}</i>`:""}${tag?`<i class="sccap">${tag}</i>`:""}</button>`;};
  let det=`<p class="meta scdet">${SCT.tap}</p>`;
  if(sel){const C=CARDS[sel],T=scTheme(sel),h=hold(sel),o=own[sel],g=scInfo(f,base,sel);
    det=`<div class="scdet">${scMini(sel)}<span><b>${esc(C.t)}</b><small>${C.r}${(o.lv||1)>1?" · Lv."+o.lv:""} · ${T.tr?"Trains "+T.tr.map(k=>SK_AN[k]).join("/"):"Trains everything at half"}${SC_FIGHT[C.r][0]?" · fight: "+T.txt:""}${scOwn(f,sel)?" · <b class=\"goldt\">her own card ×1.5</b>":""}</small><small class="meta">${SCT.fee} ${fmt(SC_FEE[C.r])}${h?` · on ${esc(h.name)} (can move here)`:""}${g.dup?` · <b class="no">${SCT.dupd} ${esc(CARDS[g.dup].t)} ${SCT.dupd2}</b>`:""}${g.tr<=1e-9?` · <b class="no">${SCT.full}</b>`:""}</small></span><button class="btn sm gold" data-act="scput" data-v="${sel}">${SCT.put}</button></div>`;}
  return `<div class="scpick"><div class="scpick-h"><b>${"Pick a card for slot"} ${D.pk+1}</b><button class="btn sm" data-act="scpkx">${"Close"}</button></div><div class="scfs">${ochips}</div><div class="scfs">${rchips}<label class="scfh"><input type="checkbox" data-act="scfh" ${F.hide?"checked":""}> ${SCT.hide}</label></div><div class="scgrid">${ids.length?ids.map(tile).join(""):`<p class="meta">${Object.keys(own).length?"No cards match this filter":"No free cards yet · pull some at the gacha in the album"}</p>`}</div>${det}</div>`;}
function scTabHTML(f){const D=scDraft(f),n=scSlots(f),lv=lvOf(f),b=scBonus(G,f,D.L),df=scDiff(G,f,D.L);
  const how=!(G.flags||{}).scHow||UI.scHowOpen;
  const slot=i=>{if(i<n){const id=D.L[i];if(id){const tr=!(f.scards||[]).includes(id),hit=scPresetHit(f,id);
        return `<div class="scslot on${tr?" try":""}"><button class="scbtn" data-act="scpick" data-v="${i}" aria-label="Change card ${esc(CARDS[id].t)}">${scMini(id,hit?"glow":"")}</button>${tr?"<i class=\"sctry\">Trying</i>":""}<button class="scx" data-act="scrm" data-v="${i}" aria-label="Remove">×</button></div>`;}
      return `<div class="scslot"><button class="scbtn empty${D.pk===i?" pk":""}" data-act="scpick" data-v="${i}" aria-label="Pick a card for slot ${i+1}">+</button></div>`;}
    const ok=i===n&&lv>=SC_LV[i];
    return `<div class="scslot lock"><button class="scbtn locked" ${ok?`data-act="scunlock" data-id="${f.id}"`:"disabled"} aria-label="Slot ${i+1}">🔒<small>Lv.${SC_LV[i]}</small><small class="${ok?"goldt":""}">${fmt(SC_COST[i])}</small>${ok?"<small class=\"goldt\">Tap to unlock</small>":""}</button></div>`;};
  const lines=scBonusLines(G,f,b);
  const pick=D.pk!=null?scPickHTML(f,D):"";
  return `<div class="sctab">${how?scHowHTML():""}<div class="schead"><b>Support cards</b><span class="meta">Slots ${n}/${SC_MAX}</span><button class="btn sm" data-act="scauto" data-id="${f.id}">Coach picks</button><button class="btn sm qbtn" data-act="schelp" aria-label="How to equip cards">?</button></div>
   <div class="scslots">${[0,1,2,3,4].map(slot).join("")}</div>
   <div class="scsum">${lines.length?lines.map(t=>`<span class="pill">${t}</span>`).join(""):"<span class=\"meta\">No cards equipped yet</span>"}</div>
   ${df.changed?`<div class="scbar"><span>${df.add.length?`Equip ${df.add.length} new · <b class="${G.cash<df.fee?"no":"goldt"}">${fmt(df.fee)}</b>`:"Remove cards · free"}${G.cash<df.fee?` <small class="no">Short by ${fmt(df.fee-G.cash)}</small>`:""}</span><button class="btn sm" data-act="sccancel">Cancel</button><button class="btn sm gold" data-act="scok" data-id="${f.id}" ${G.cash<df.fee?"disabled":""}>Confirm</button></div>`:""}
   ${pick}<p class="meta">Cards that suit this week’s training glow · in fights a card pops up when it works</p></div>`;}
/* the strip on each training card */
function scStrip(f){const L=scList(G,f);if(!L.length&&scSlots(f)<=1&&!Object.keys(G.cards||{}).length)return "";const b=scBonus(G,f);const w=(PRESETS[f.plan.preset]||{}).w||{};
  const best=Object.entries(b.tr).filter(([k])=>(w[k]||0)>0).reduce((a,[,v])=>Math.max(a,v),0);
  return `<button class="scstrip" data-act="fighter" data-id="${f.id}" data-v="card" aria-label="Cards of ${esc(f.name)}">${[0,1,2,3,4].map(i=>i<scSlots(f)?(L[i]?scMini(L[i],"xs"+(scPresetHit(f,L[i])?" glow":"")):'<span class="scm xs empty">+</span>'):'<span class="scm xs lockd">🔒</span>').join("")}${best?`<b class="ok">Training +${Math.round(best*100)}%</b>`:""}</button>`;}
/* a card pops beside the fighter's bars when it works in a fight */
function scPop(sc){if(!sc||typeof document==="undefined")return;const C=CARDS[sc.id];if(!C)return;const box=document.querySelector(`.fside.${sc.sd==="A"?"a":"b"}`);if(!box)return;const r=box.getBoundingClientRect(),R=CARD_R[C.r];
  const el=document.createElement("div");el.className="scpop "+(sc.sd==="A"?"l":"r")+" r-"+C.r;el.style.setProperty("--rc",R.c);el.innerHTML=`${scMini(sc.id,"pop")}<span><small><i>${C.r}</i>${esc(C.t)}</small><b>${esc(sc.t)}</b></span>`;
  el.style.top=(r.bottom+scrollY+6)+"px";if(sc.sd==="A")el.style.left=(r.left+scrollX)+"px";else el.style.right=(document.documentElement.clientWidth-r.right)+"px";document.body.appendChild(el);if(typeof AU!=="undefined"&&AU.sfx)AU.sfx("level");setTimeout(()=>el.remove(),1200);}
function scAuto(G,f){const own=G.cards||{},n=scSlots(f);const used=new Set();for(const x of Object.values(G.F))if(x.camp==="player"&&x.id!==f.id)(x.scards||[]).forEach(id=>used.add(id));
  const home=SC_THEME[f.id]||SC_THEME[(typeof REQ_ALIAS!=="undefined"&&REQ_ALIAS[f.id])]||null;
  const sc=id=>{const C=CARDS[id],T=scTheme(id);return (scOwn(f,id)?60:0)+CARD_R[C.r].s*10+((own[id].lv)||1)*2+(scPresetHit(f,id)?8:0)+(home&&T===home?6:0);};
  /* greedy: each pick is the card that adds most on top of what's already in — so it mixes fight effects instead of doubling one */
  const pool=Object.keys(CARDS).filter(id=>own[id]&&!used.has(id)).sort((x,y)=>sc(y)-sc(x)).slice(0,40),L=[];
  while(L.length<n&&pool.length){let bi=0,bv=-1e9;pool.forEach((id,i)=>{const g=scInfo(f,L,id,G),v=g.score-(g.dup?100:0)-(g.none?1000:0)+sc(id)*.01;if(v>bv){bv=v;bi=i;}});L.push(pool.splice(bi,1)[0]);}
  return L;}
Object.assign(ACT,{
  scpick:d=>{const f=UI.modal&&G.F[UI.modal.id];if(!f)return;const D=scDraft(f);D.pk=+d.v;render();},
  scpkx:()=>{if(UI.scd){UI.scd.pk=null;UI.scd.sel=null;}render();},
  scsel:d=>{if(UI.scd)UI.scd.sel=UI.scd.sel===d.v?null:d.v;render();},
  scfo:d=>{UI.scf=UI.scf||{o:"rec",r:"",hide:0};UI.scf.o=d.v;if(UI.scd)UI.scd.sel=null;render();},
  scfr:d=>{UI.scf=UI.scf||{o:"rec",r:"",hide:0};UI.scf.r=d.v;if(UI.scd)UI.scd.sel=null;render();},
  scfh:()=>{UI.scf=UI.scf||{o:"rec",r:"",hide:0};UI.scf.hide=UI.scf.hide?0:1;render();},
  scput:d=>{const f=UI.modal&&G.F[UI.modal.id];if(!f)return;const D=scDraft(f);if(D.pk==null)return;D.L[D.pk]=d.v;D.L=D.L.filter(Boolean).slice(0,scSlots(f));D.pk=null;D.sel=null;AU.sfx("ui");render();},
  scrm:d=>{const f=UI.modal&&G.F[UI.modal.id];if(!f)return;const D=scDraft(f);D.L.splice(+d.v,1);D.pk=null;render();},
  sccancel:()=>{UI.scd=null;render();},
  scok:d=>{const f=G.F[d.id];if(!f)return;const D=scDraft(f),df=scDiff(G,f,D.L);if(G.cash<df.fee){toast(`Not enough cash. Short by ${fmt(df.fee-G.cash)}`);return;}
    G.cash-=df.fee;for(const id of D.L){const h=scHolder(G,id);if(h&&h.id!==f.id)h.scards=h.scards.filter(x=>x!==id);}f.scards=D.L.slice();UI.scd=null;AU.sfx("level");
    toast(df.fee?`Cards equipped · ${f.name} · paid ${fmt(df.fee)}`:`Cards set · ${f.name}`);if(typeof save==="function")save();render();},
  scunlock:d=>{const f=G.F[d.id];if(!f)return;const i=scSlots(f);if(i>=SC_MAX||lvOf(f)<SC_LV[i])return;if(G.cash<SC_COST[i]){toast(`Not enough cash. Need ${fmt(SC_COST[i])}`);return;}
    G.cash-=SC_COST[i];f.cslot=i+1;AU.sfx("level");toast(`Unlocked card slot ${i+1} · ${f.name}`);if(typeof save==="function")save();render();},
  scauto:d=>{const f=G.F[d.id];if(!f)return;const D=scDraft(f);D.L=scAuto(G,f);D.pk=null;if(!D.L.length)toast("No free cards to equip yet");render();},
  schow:()=>{G.flags=G.flags||{};G.flags.scHow=1;UI.scHowOpen=false;render();},
  schelp:()=>{UI.scHowOpen=!UI.scHowOpen;render();}});

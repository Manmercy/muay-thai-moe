// ================= MUAY THAI MOE v1.2 — PIXEL SYSTEMS =================
const ASSET="a/";
const IMGS={};
function img(name){if(!IMGS[name]){const i=new Image();i.decoding="async";i.src=ASSET+name;IMGS[name]=i;}return IMGS[name];}
const SHEET_IDS=["kati","mali","rin","ploy","fah","pailin"];
function preloadCore(){/* v1.87: the title only needs Kati — the rest arrives with the save that uses it */img("kati_sheet.webp");}
// sprite rows in sheets (4 frames each): 0 idle,1 guard,2 step,3 punch,4 knee/kick,5 victory
const ROW={idle:0,guard:1,walk:2,punch:3,knee:4,win:5};
const PRESET_ROW={balanced:"cycle",punch:"punch",kick:"knee",knee:"knee",elbow:"punch",defense:"guard",cond:"walk",prep:"guard",rest:"idle"};
const CELL=128;

// ---------- NPC tint (hue rotate saturated non-skin pixels) ----------
const TINTS={};
function hashStr(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
// v1.16: extras use their own 5 base sheets; only the outfit/gloves (red or blue) are re-dyed per fighter
const NPC_HUES=[0,215,130,45,280,22,180,330,95,255];
/* v1.89.14: five more base sheets (green, blue, purple, gold, red) — each re-dyes its own kit colour */
const NPC_KIT={npc6:(h,l,s)=>h>.2&&h<.46&&s>.25&&l>.1,npc8:(h,l,s)=>h>.7&&h<.9&&s>.22&&l>.1,npc9:(h,l,s)=>h>.088&&h<.19&&s>.4&&l>.15&&l<.85};
function npcBase(id){const h=hashStr(id);return {base:"npc"+(1+h%10),hue:NPC_HUES[(h>>>5)%NPC_HUES.length],dark:((h>>>9)%7)===0};}
// v1.70: pixel outfits — recolour only the kit (gloves, top, shorts, shoes) of a canon sheet; skin and hair stay
const OUTFITS={
 base:{name:"Signature Kit",sw:null,hint:""},
 sk:{name:"Songkran Floral Kit",h:.9,s:.7,lm:1.2,dots:1,sw:"#e055a8",hint:"Celebrate Songkran with the camp",need:G=>(G.flags.fc_sk||0)>0||!!G.seen.songkran},
 kt:{name:"Loy Krathong Gold Kit",h:.13,s:.78,lm:1.15,sw:"#e8b53a",hint:"Float a krathong with the camp",need:G=>(G.flags.fc_kt||0)>0||!!G.seen.loykrathong},
 ny:{name:"New Year White Kit",h:.6,s:.08,lm:1.55,sw:"#e9ecf2",hint:"Celebrate New Year's Eve together",need:G=>(G.flags.fc_ny||0)>0},
 drum:{name:"Khong Khaek Orange Kit",h:.065,s:.88,lm:1.05,sw:"#ec7a22",hint:"Get an S in the drum minigame",need:G=>(G.flags.bagS||0)>0},
 live:{name:"Bestseller Mint Kit",h:.47,s:.72,lm:1.05,sw:"#2fc4b2",hint:"Get an S on the merch live stream",need:G=>(G.flags.liveS||0)>0},
 tiger:{name:"Tiger-Hunter Black Kit",h:.08,s:.06,lm:.42,sw:"#2a2630",hint:"Beat Ploy in an official fight",need:G=>(G.flags.beat_ploy||0)>0},
 heart:{name:"Pink Heart Kit",h:.95,s:.55,lm:1.35,sw:"#f59cc4",hint:"Bond with this fighter reaches ♥ Lv.11",need:(G,f)=>(f.bond||0)>=100},
 champ:{name:"Gold Champion Kit",h:.14,s:.95,lm:1.3,sw:"#ffd34a",hint:"Win the provincial championship",need:G=>Object.values(G.champ||{}).some(id=>G.F[id]&&G.F[id].camp==="player")||(G.titles||[]).some(t=>Object.values(t.champ||{}).some(id=>G.F[id]&&G.F[id].camp==="player"))},
 loy:{name:"Loy Krathong Thai Dress",sheet:1,sw:"#2f8f4a",hint:"Win a bout in the Loy Krathong riverside brawl, then claim it from Auntie Taew's letter",need:(G,f)=>!!(G&&G.ev&&G.ev.loy&&G.ev.loy.dress&&G.ev.loy.dress[f.id])}}; /* v1.89.27: the real Thai-dress pixel sheet, one girl at a time */
const KIT_MASK={kati:(h,l,s)=>(h<.035||h>.93)&&s>.38&&l>.12&&l<.8,mali:(h,l,s)=>h>.53&&h<.74&&s>.25&&l>.1,rin:(h,l,s)=>h>.2&&h<.45&&s>.25&&l>.08,
 ploy:(h,l,s,fy,fx)=>h>.68&&h<.9&&s>.2&&l>.1&&fy>.4&&fx>.3,fah:(h,l,s,fy)=>h>.088&&h<.17&&l>.1&&((s>.5&&fy>.33)||(s>.22&&l<.55&&fy>.55)),
 /* v1.91.45: the joined regional champions re-dye their kit like the main cast (hair of the same hue is kept out by height/side) */
 baibua:(h,l,s,fy,fx)=>h>.9&&s>.3&&l>.1&&l<.76&&fy>.47&&!(fx<.38&&fy<.66),tabtim:(h,l,s,fy,fx)=>h>.89&&s>.3&&l>.1&&l<.7&&fy>.47&&!(fx<.36&&fy<.52),
 alicia:(h,l,s,fy)=>h>.55&&h<.74&&s>.2&&l>.08&&fy>.46,chaba:(h,l,s,fy,fx)=>h>.42&&h<.6&&s>.15&&l>.05&&fy>.47&&!(fx<.38&&fy<.62)};
function outfitOk(G,f,k){const O=OUTFITS[k];return !!O&&(!O.need||O.need(G,f));}
function outfitSheet(f,k){const key=f.id+"|"+k;if(TINTS[key])return TINTS[key];const O=OUTFITS[k],M=KIT_MASK[f.id],src=img(f.id+"_sheet.webp");if(!O||!M||!src.complete||!src.naturalWidth)return src;
  const c=document.createElement("canvas");c.width=src.naturalWidth;c.height=src.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0);const FW=c.width/4,FH=c.height/6;
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data,W=c.width;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;const r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,dd=mx-mn;if(dd<.001)continue;
      const s=l>.5?dd/(2-mx-mn):dd/(mx+mn);let h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;const px=(i/4)%W,py=Math.floor(i/4/W),fx=(px%FW)/FW,fy=(py%FH)/FH;
      if(!M(h,l,s,fy,fx))continue;
      if(O.dots&&((px*7+py*3)%13===0)&&l>.3){p[i]=255;p[i+1]=250;p[i+2]=240;continue;}
      const L=Math.min(.92,l*O.lm),S=O.s,q=L<.5?L*(1+S):L+S-L*S,pp=2*L-q;const fn=t=>{t=(t+1)%1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;};
      p[i]=fn(O.h+1/3)*255;p[i+1]=fn(O.h)*255;p[i+2]=fn(O.h-1/3)*255;}
    x.putImageData(d,0,0);}catch(e){return src;}
  TINTS[key]=c;return c;}
/* v1.89.24: Loy Krathong pixel outfits — every event bout, and off-stage when the gold-tier "Thai dress" toggle is on */
const LOY_SP=["kati","mali","rin","ploy","fah"];
function loyLookNow(){try{if(typeof UI!=="undefined"&&UI.fight&&UI.fight.b)return !!UI.fight.b.ev;return false;} /* v1.91.97: Loy Krathong sprites only in the event's own fights */catch(e){return false;}}
const loyImg=(id,name,f)=>LOY_SP.includes(id)&&(loyLookNow()||(f&&f.outfit==="loy"&&f.camp==="player"))?name.replace(id+"_",id+"_loykrathong_"):name;
function sheetFor(f){
  if(f.canon&&LOY_SP.includes(f.id)&&loyLookNow())return img(f.id+"_loykrathong_sheet.webp");
  if(f.canon){if(f.outfit==="loy"&&f.camp==="player"&&LOY_SP.includes(f.id))return img(f.id+"_loykrathong_sheet.webp");if(f.outfit&&f.outfit!=="base"&&f.camp==="player"&&OUTFITS[f.outfit])return outfitSheet(f,f.outfit);return img(f.id+"_sheet.webp");}
  if(f.sprite)return f.tintHue!=null?spriteTint(f.sprite,f.tintHue):img(f.sprite+"_sheet.webp"); // v1.23: gang, roosters, bulls · v1.89.24: tintHue re-dyes the red kit (the krathong thief)
  if(TINTS[f.id])return TINTS[f.id];
  const nb=npcBase(f.id),base=nb.base,blonde=!!(f.prodigy||(f.id||"").startsWith("prod_")),lab=!!f.lab&&!blonde,hue=blonde?42:lab?276:nb.hue,dark=blonde?true:lab?false:nb.dark; /* v1.88: Vector camp fighters wear their black-purple kit */const src=img(base+"_sheet.webp"); /* v1.56: Golden Tiger prodigies: black-gold kit; v1.88: hair dyed silver like Fah */if(!src.complete||!src.naturalWidth)return src;
  const c=document.createElement("canvas");c.width=src.naturalWidth;c.height=src.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0);
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data,th=hue/360;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;let r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let l=(mx+mn)/2;const gold=()=>{const L2=Math.min(.86,l*1.45+.3),S2=.07,H2=.66;const q2=L2<.5?L2*(1+S2):L2+S2-L2*S2,p2=2*L2-q2;const f2=t=>{t=(t+1)%1;return t<1/6?p2+(q2-p2)*6*t:t<1/2?q2:t<2/3?p2+(q2-p2)*(2/3-t)*6:p2;};p[i]=f2(H2+1/3)*255;p[i+1]=f2(H2)*255;p[i+2]=f2(H2-1/3)*255;};if(mx===mn){if(blonde&&l>.07&&l<.42)gold();continue;}
      const dd=mx-mn;let s=l>.5?dd/(2-mx-mn):dd/(mx+mn);let h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;
      if(blonde&&l>.07&&l<.42&&!(h>.53&&h<.74&&s>.25)&&!((h<.035||h>.93)&&s>.38)&&(s<.45||(h>.02&&h<.16))){gold();continue;}
      const red=(h<.035||h>.93)&&s>.38&&l>.12&&l<.8,blue=h>.53&&h<.74&&s>.25&&l>.1,kit=NPC_KIT[base]&&NPC_KIT[base](h,l,s);if(!red&&!blue&&!kit)continue; // outfit only: skin & hair stay
      h=th;/* v1.89.27: never dye a kit near-white (Man: no white NPC kits) */if(!dark&&!lab&&l>.78&&s<.35){l=.6;s=Math.max(s,.5);}if(dark){s*=.15;l*=.55;}else if(lab){if(l<.5){s*=.35;l*=.3;}else{s=Math.min(.8,Math.max(s,.55));l=Math.min(.5,l*.6);}} /* black kit, purple highlights */
      const q=l<.5?l*(1+s):l+s-l*s,pp=2*l-q;const fn=t=>{t=(t+1)%1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;};
      p[i]=fn(h+1/3)*255;p[i+1]=fn(h)*255;p[i+2]=fn(h-1/3)*255;}
    x.putImageData(d,0,0);}catch(e){}
  TINTS[f.id]=c;return c;}
function spriteTint(sp,hue){const key=sp+"|h"+hue;if(TINTS[key])return TINTS[key];const src=img(sp+"_sheet.webp");if(!src.complete||!src.naturalWidth)return src;
  const c=document.createElement("canvas");c.width=src.naturalWidth;c.height=src.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0);const th=hue/360;
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;const r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2,dd=mx-mn;if(dd<.001)continue;
      const s=l>.5?dd/(2-mx-mn):dd/(mx+mn);let h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;if(!((h<.035||h>.93)&&s>.38&&l>.08&&l<.62))continue;
      const q=l<.5?l*(1+s):l+s-l*s,pp=2*l-q;const fn=t=>{t=(t+1)%1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;};
      p[i]=fn(th+1/3)*255;p[i+1]=fn(th)*255;p[i+2]=fn(th-1/3)*255;}
    x.putImageData(d,0,0);}catch(e){return src;}
  TINTS[key]=c;return c;}
function drawFrame(ctx,sheet,row,col,cx,footY,h,flip,alpha){
  if(!sheet||(sheet.complete===false)||(!sheet.width&&!sheet.naturalWidth))return;
  const sc=h/CELL,wide=sheet._cw?sheet._cw>CELL:(sheet.naturalWidth||sheet.width)===1536,cw=wide?384:CELL,ch=wide?192:CELL,fy=wide?184:CELL*.94; /* v1.91.62: wide 384×192 cells (foot at 184) for specials whose dashes/trails don't fit a 128 cell */
  ctx.save();ctx.globalAlpha=alpha??1;ctx.translate(cx,footY);if(flip)ctx.scale(-1,1);
  ctx.drawImage(sheet,col*cw,row*ch,cw,ch,-cw*sc/2,-fy*sc,cw*sc,ch*sc);ctx.restore();}

// ---------- RADAR (Nen-style hexagon) ----------
const RADAR_AX=[["Punch",a=>(a.punch*2+a.power)/3],["Kick",a=>(a.kick*2+a.foot)/3],["Knee-Elbow",a=>(a.knee+a.elbow+a.clinch)/3],
  ["Defense",a=>(a.guard+a.counter+a.foot)/3],["Body",a=>(a.speed+a.stamina+a.dur+a.power)/4],["Mind",a=>(a.iq+a.comp)/2]];
function radarSVG(f,size=220,prev){
  const c=size/2,R=size*.34,col=f.color||"#e23b4e";const pt=(i,v)=>{const ang=-Math.PI/2+i*Math.PI/3;return [c+Math.cos(ang)*R*v,c+Math.sin(ang)*R*v];};
  const cap=typeof stCap==="function"?stCap(f):20,vals=RADAR_AX.map(([,fn])=>clamp(fn(f.a)/cap,0,1)); /* v1.90: scaled to the fighter's ceiling (25 after a limit break) */
  const ring=k=>RADAR_AX.map((_,i)=>pt(i,k).join(",")).join(" ");
  const poly=vals.map((v,i)=>pt(i,v).join(",")).join(" ");
  const pot=RADAR_AX.map((_,i)=>pt(i,clamp(f.potential/cap,0,1)).join(",")).join(" ");
  const labels=RADAR_AX.map(([n,fn],i)=>{const [x,y]=pt(i,1.24);const v=(vals[i]*cap).toFixed(1);const dl=prev?fn(f.a)-fn(prev):0;
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="rl">${n}</text><text x="${x}" y="${y+13}" text-anchor="middle" class="rv">${v}${dl>=.05?`<tspan class="rup"> +${dl.toFixed(1)}</tspan>`:""}</text>`;}).join("");
  const id="rg"+Math.random().toString(36).slice(2,7);
  return `<svg class="radar" viewBox="0 0 ${size} ${size+10}" role="img" aria-label="Stat hexagon chart of ${f.name}">
   <defs><radialGradient id="${id}"><stop offset="0%" stop-color="${col}" stop-opacity=".25"/><stop offset="100%" stop-color="${col}" stop-opacity=".75"/></radialGradient></defs>
   ${[.25,.5,.75,1].map(k=>`<polygon points="${ring(k)}" class="rgrid"/>`).join("")}
   ${RADAR_AX.map((_,i)=>{const [x,y]=pt(i,1);return `<line x1="${c}" y1="${c}" x2="${x}" y2="${y}" class="rgrid"/>`;}).join("")}
   <polygon points="${pot}" class="rpot"/>
   ${prev?`<polygon points="${RADAR_AX.map(([,fn],i)=>pt(i,clamp(fn(prev)/20,0,1)).join(",")).join(" ")}" class="rprev"/>`:""}
   <polygon points="${poly}" fill="url(#${id})" stroke="${col}" stroke-width="2.5" class="rshape"/>
   ${vals.map((v,i)=>{const [x,y]=pt(i,v);return `<rect x="${x-3}" y="${y-3}" width="6" height="6" fill="${col}"/>`;}).join("")}
   ${labels}</svg>`;}

// ---------- CAMP SCENE ----------
const CAMP={W:320,H:180};
function campPeople(G){
  const R=roster(G),out=[];const st={};
  R.forEach((f,i)=>{let row=f.injury?"idle":PRESET_ROW[f.plan.preset]||"guard";const spot=f.injury||f.plan.preset==="rest"?"bench":row==="punch"||row==="knee"?"bag":row==="walk"?"run":"ring";
    st[spot]=(st[spot]||0)+1;out.push({f,row,spot,k:st[spot]-1});});
  return out;}
function campStudents(G){return students(G);}
// v1.82.4: camp decorations repainted at full canvas resolution (half-unit pixels) with outlines, shading and glow.
// F(x,y,w,h,c) paints in camp units (320x180) but accepts .5 steps = one real pixel. A drawn sprite in a/decor/ replaces the code art.
function shadeHex(c,f){const n=parseInt(c.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;
  if(f<0){r*=1+f;g*=1+f;b*=1+f;}else{r+=(255-r)*f;g+=(255-g)*f;b+=(255-b)*f;}
  return "#"+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");}
function decorPainter(ctx,S){
  const F=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*S),Math.round(y*S),Math.max(1,Math.round(w*S)),Math.max(1,Math.round(h*S)));};
  F.ctx=ctx;F.S=S;
  F.ell=(cx,cy,rx,ry,c)=>{for(let dy=-ry;dy<=ry;dy+=.5){const hw=rx*Math.sqrt(Math.max(0,1-(dy*dy)/(ry*ry)));if(hw<.3)continue;F(cx-hw,cy+dy,hw*2,.5,c);}};
  F.disc=(cx,cy,r,c)=>F.ell(cx,cy,r,r,c);
  F.box=(x,y,w,h,fill,ol,hi,sh)=>{if(ol)F(x-.5,y-.5,w+1,h+1,ol);F(x,y,w,h,fill);if(hi){F(x,y,w,.5,hi);F(x,y,.5,h,hi);}if(sh){F(x,y+h-.5,w,.5,sh);F(x+w-.5,y,.5,h,sh);}};
  F.glow=(x,y,r,c)=>{const g=ctx.createRadialGradient(x*S,y*S,0,x*S,y*S,r*S);g.addColorStop(0,c);g.addColorStop(1,"rgba(255,200,120,0)");ctx.fillStyle=g;ctx.fillRect((x-r)*S,(y-r)*S,2*r*S,2*r*S);};
  F.shadow=(cx,cy,rx,ry)=>F.ell(cx,cy,rx,ry,"rgba(12,6,26,.30)");
  F.spark=(x,y,c="#fffbe0")=>{F(x,y-1.5,.5,3.5,c);F(x-1.5,y,3.5,.5,c);F(x-.5,y-.5,1.5,1.5,c);};
  F.text=(s,x,y,px,c,font)=>{ctx.save();ctx.font=`700 ${px*S}px ${font||'"Chakra Petch","IBM Plex Sans Thai",sans-serif'}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=c;ctx.fillText(s,x*S,y*S);ctx.restore();};
  return F;}
// ---- optional drawn sprites: list a file here once it is in a/decor/ (name = slot_item.webp). Box = where it sits, in camp units.
const DECOR_ART_FILES=[];
const DECOR_BOX={tree:[146,22,80,80],gate:[0,86,46,66],ring:[148,64,156,80],track:[108,138,214,44],vehicle:[210,144,76,36],bags:[0,0,7,22]};
const DECOR_IMG={};
function decorSprite(F,slot,item,box){const key=slot+"_"+item;if(!DECOR_ART_FILES.includes(key))return false;
  let im=DECOR_IMG[key];if(!im){im=DECOR_IMG[key]=new Image();im.src=`${typeof ASSET!=="undefined"?ASSET:"a/"}decor/${key}.webp`;}
  if(!im.complete||!im.naturalWidth)return false;const [x,y,w,h]=box||DECOR_BOX[slot];const c=F.ctx;c.save();c.imageSmoothingEnabled=im.naturalWidth>w*F.S*1.4;c.imageSmoothingQuality="high";c.drawImage(im,x*F.S,y*F.S,w*F.S,h*F.S);c.restore();return true;}

const DECOR_CACHE={};
// static parts of a decoration are painted once into an offscreen layer, so the camp keeps its frame rate on phones
function decorCached(F,key,draw){const W=F.ctx.canvas.width,H=F.ctx.canvas.height,k=key+"@"+W+"x"+H;let c=DECOR_CACHE[k];
  if(!c){c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.imageSmoothingEnabled=false;draw(decorPainter(x,F.S));DECOR_CACHE[k]=c;}
  F.ctx.drawImage(c,0,0);}
// ---- tree
const TREE_PAL={sritrang:["#1e1f4a","#33377a","#5a5fb8","#8a8fe0","#d0d4ff"],thongkwao:["#4a1a06","#8a3410","#d0601c","#f59a3a","#ffd08a"],plain:["#14341f","#1f4f2b","#2f7238","#4f9e4a","#8fd06a"],blossom:["#5c2140","#93386a","#c95f92","#f09ac0","#ffd6e8"],
  sakura:["#62203f","#a4427a","#e07fae","#f8b6d3","#fff0f6"],flame:["#4a1408","#8a2410","#d0451c","#f07a2e","#ffc06a"],lilawadee:["#1d3d26","#2e6a38","#4f9e4a","#f6f2e6","#ffe08a"],rachaphruek:["#4a3a06","#8a700e","#cfae1c","#f6dc4a","#fff6b0"],champion:["#4a360a","#7c5c12","#b98a1e","#e8c040","#fff0a0"],golden:["#4e3306","#8a5e0e","#d09a1c","#f4cd52","#fff8cc"]};
function decorTree(P,G,t,F){const k=decorChoice(G,"tree"),x=186,base=100;if(k==="none")return;if(decorSprite(F,"tree",k))return;
  const pal=TREE_PAL[k]||TREE_PAL.plain,ol="#1b0f12";
  decorCached(F,"tree_"+k,F=>{
  F.shadow(x,base+1,28,3);
  // trunk: tapered, outlined, lit from the left
  for(let y=base-44;y<base;y+=.5){const f=(y-(base-44))/44,w=3+f*3;F(x-w/2-.5,y,w+1,.5,ol);F(x-w/2,y,w,.5,"#5a3527");F(x-w/2,y,.8,.5,"#86553c");F(x+w/2-1,y,1,.5,"#3c2117");}
  F(x-7,base-1.5,5,1.5,ol);F(x-6.5,base-1.5,4,1,"#5a3527");F(x+2.5,base-1.5,5,1.5,ol);F(x+3,base-1.5,4,1,"#5a3527");
  for(const [dy,dx] of [[-30,0],[-20,1],[-12,-1]])F(x+dx-.5,base+dy,1.5,.5,"#3c2117");
  for(let i=0;i<8;i++){F(x-1-i,base-30-i*.8,1.5,1,ol);F(x+1+i,base-36-i*.9,1.5,1,ol);}
  const cl=[[-8,-67,10],[8,-68,9.5],[0,-59,13],[-15,-54,10],[14,-55,10],[-22,-46,8],[21,-46,8],[0,-47,11],[-3,-77,7],[-9,-44,7],[10,-43,7]];
  if(k==="sakura")cl.push([-30,-36,7],[-25,-42,6],[29,-38,6]);
  const sw=0;
  for(const [dx,dy,r] of cl)F.disc(x+dx+sw,base+dy,r+1,ol);
  for(const [dx,dy,r] of cl)F.disc(x+dx+sw,base+dy,r,pal[1]);
  for(const [dx,dy,r] of cl)F.disc(x+dx-1+sw,base+dy-1.5,r-1.6,pal[2]);
  { // leafy dabs: lit clumps on the upper-left of each cluster, darker clumps on the lower-right
    const rr=mulberry32(4711);for(const [dx,dy,r] of cl){for(let i=0;i<5;i++){const a=-2.7+rr()*2.1,d=r*(.25+rr()*.5),rad=1.4+rr()*1.3;F.disc(x+dx+Math.cos(a)*d+sw,base+dy+Math.sin(a)*d,rad,pal[3]);}
      for(let i=0;i<3;i++){const a=.3+rr()*1.6,d=r*(.55+rr()*.3);F.disc(x+dx+Math.cos(a)*d+sw,base+dy+Math.sin(a)*d,1+rr()*.8,pal[1]);}
      if(dy<-55){const a=-2.2+rr()*.8;F.disc(x+dx+Math.cos(a)*r*.45+sw,base+dy+Math.sin(a)*r*.45,1,pal[4]);}}
    for(let i=0;i<90;i++){const c=cl[i%cl.length],a=rr()*6.28,d=rr()*c[2]*.95;F(x+c[0]+Math.cos(a)*d+sw,base+c[1]+Math.sin(a)*d,.5,.5,Math.sin(a)<-.2?pal[4]:pal[0]);}}
  if(k==="sakura"){F(x-29,base-30,1.5,30,ol);F(x-28.5,base-30,1,30,"#5a3527");}
  });
  if(k==="blossom"||k==="sakura"||k==="flame"||k==="lilawadee"||k==="rachaphruek"||k==="sritrang"||k==="thongkwao"){for(let i=0;i<(k==="sakura"?11:6);i++){const ph=(t/40+i*37)%72,px=x-26+((i*29)%52)+Math.sin((t/500)+i)*4;F(px,base-50+ph,1.5,1,pal[3]);F(px+.5,base-50+ph,.5,.5,pal[4]);}}
  if(k==="champion"){for(const [dx,dy] of [[-14,-56],[2,-64],[14,-52],[-4,-46],[18,-62]]){F(x+dx,base+dy,.5,3,"#c8283c");F(x+dx+.5,base+dy,.5,3,"#2c5fb3");
      F.disc(x+dx+.25,base+dy+4.5,2,ol);F.disc(x+dx+.25,base+dy+4.5,1.5,"#ffd84a");F(x+dx-.5,base+dy+3.5,.5,.5,"#fff8cc");if(Math.floor(t/300+dx)%4===0)F.spark(x+dx,base+dy+4);}}
  if(k==="golden"){F.glow(x,base-58,34,"rgba(255,220,120,.18)");for(let i=0;i<7;i++){const a=t/700+i,sx=x-22+((i*17)%44),sy=base-74+((i*23)%34);if(Math.sin(a*3)>.55)F.spark(sx,sy);}}}

// ---- gate: wooden arch → Thai-roofed gates
function decorGate(P,G,t,F){const k=decorChoice(G,"gate"),x0=3,x1=34,top=104,bot=150;if(k==="none")return;if(decorSprite(F,"gate",k))return;
  const ol="#1b0f12",post={plain:"#7a5236",painted:"#c8283c",lantern:"#8a2433",trophy:"#d9a520",gold:"#e2b02a",lanna:"#5a3418",jade:"#2f8a4f",indigo:"#2b3a7a",stucco:"#ece6da",bougain:"#7a5236",marigold:"#7a5236"}[k],roof={plain:"#5a3a26",painted:"#2c5fb3",lantern:"#5a1a22",trophy:"#b8860b",gold:"#c9961c",lanna:"#8a5a1e",jade:"#1d5e3a",indigo:"#1d2856",stucco:"#b9b09e",bougain:"#b8457e",marigold:"#c9761a"}[k];if(!post)return;
  decorCached(F,"gate_"+k,F=>{
  F.shadow(x0+19.5,bot+1,24,2.5);
  for(const px of [x0,x1]){F.box(px,top+8,5,bot-top-8,post,ol);F(px+.5,top+8,1,bot-top-8,shadeHex(post,.35));F(px+3.5,top+8,1,bot-top-8,shadeHex(post,-.35));
    for(let y=top+12;y<bot-4;y+=7)F(px+1.5,y,2,.5,shadeHex(post,-.2));F.box(px-1,bot-3,7,3,"#8d867a",ol,"#b5ad9f");}
  F.box(x0-3,top+4,43,5,post,ol,shadeHex(post,.35),shadeHex(post,-.35));
  if(k==="plain"){F.box(x0-4.5,top+1,46,3,roof,ol,shadeHex(roof,.3));F.box(x0+9,top+11,21,8,"#e9dcc4",ol,"#fff4e0","#b8a888");F.text("Sirichai",x0+19.5,top+15.2,5.5,"#6b3a24");return;}
  // three-tier Thai roof with chofa hooks on every eave
  for(let j=0;j<3;j++){const w=48-j*13,y=top+2-j*4.2,xl=x0+19.5-w/2;
    for(let r=0;r<4;r+=.5){const ww=w-r*1.6;F(xl+r*.8-.5,y-r,ww+1,.5,ol);}
    for(let r=0;r<3.5;r+=.5){const ww=w-1-r*1.6;F(xl+.5+r*.8,y-r,ww,.5,r%1?roof:shadeHex(roof,-.18));}
    F(xl+.5,y-3.5,w-6,.5,shadeHex(roof,.35));
    const gold=k==="lantern"?"#e8b53a":"#ffd84a";F(xl-1.5,y-1,1.5,1,gold);F(xl-2,y-2.5,1,1.5,gold);F(xl+w,y-1,1.5,1,gold);F(xl+w+1,y-2.5,1,1.5,gold);}
  F(x0+19,top-14.5,1.5,4,"#ffd84a");F(x0+18.5,top-15.5,2.5,1,"#ffd84a");
  F.box(x0+9,top+11,21,8,k==="lantern"?"#2a1018":"#f4ead8",ol,k==="lantern"?"#5a2030":"#fffaf0");
  F.text("Sirichai",x0+19.5,top+15.2,5.5,k==="lantern"?"#ffd36b":k==="painted"?"#c8283c":"#7a1b2a");
  /* v1.86: flower arches — bougainvillea or marigold garlands climb the posts and drape the lintel */
  if(k==="bougain"||k==="marigold"){const C=k==="bougain"?["#7a1f52","#d2468a","#f07ab4","#ffc4de"]:["#7a3a06","#d9761a","#f2a62a","#ffe08a"],rr=mulberry32(k.length*31);
    for(const px of [x0+2.5,x1+2.5])for(let y=top+10;y<bot-6;y+=3.2){const dx=(rr()-.5)*4;F.disc(px+dx,y,1.9,C[0]);F.disc(px+dx-.3,y-.3,1.4,C[1]);F(px+dx-.6,y-.8,.75,.75,C[3]);}
    for(let x=x0-2;x<x1+6;x+=3){const sag=Math.sin((x-x0)/(x1-x0+6)*Math.PI)*3;F.disc(x,top+9+sag,1.7,C[0]);F.disc(x-.3,top+8.7+sag,1.3,C[2]);F(x-.5,top+8+sag,.75,.75,C[3]);}
    if(k==="marigold")for(let i=0;i<5;i++){const gx=x0+4+i*7.5;for(let j=0;j<4;j++){F.disc(gx,top+12+j*2.6,1.1,j%2?C[2]:C[1]);}}}
  if(k==="stucco"){for(const px of [x0,x1]){F(px+1,top+14,3,.5,"#d6cdbb");F(px+1,top+26,3,.5,"#d6cdbb");F.disc(px+2.5,top+20,1.2,"#d6cdbb");}}
  });if(k==="plain")return;
  if(k==="lantern"){for(let i=0;i<4;i++){const lx=x0+5+i*9.5,sw=Math.sin(t/500+i)*.8,on=Math.floor(t/400+i)%3;F.glow(lx+1+sw,top+29,8,"rgba(255,170,90,.30)");
      F(lx+.75+sw,top+20,.5,5,"#2a1018");F.ell(lx+1+sw,top+29,3,3.6,ol);F.ell(lx+1+sw,top+29,2.5,3.1,"#d23246");F(lx-.5+sw,top+26.5,3,.5,"#8a1c2c");F(lx-.5+sw,top+31.5,3,.5,"#8a1c2c");
      F(lx+.5+sw,top+27.5,1,2.5,on?"#ffb36b":"#ffe9a0");F(lx+.5+sw,top+33,1,1.5,"#e8b53a");}}
  if(k==="trophy"||k==="gold"){const cx=x0+19.75,cy=top-19;F.glow(cx,cy,12,"rgba(255,220,120,.28)");
    F.ell(cx,cy,5,4.5,ol);F.ell(cx,cy,4.4,3.9,"#f1c232");F(cx-3,cy-3,1.5,4,"#fff1a6");F(cx-.75,cy+4,1.5,2,"#b8860b");F.box(cx-3,cy+6,6,2,"#7a1b2a",ol,"#a8324a");
    F(cx-7,cy-2.5,2,.75,"#f1c232");F(cx-7,cy-2.5,.75,3,"#f1c232");F(cx+5,cy-2.5,2,.75,"#f1c232");F(cx+6.25,cy-2.5,.75,3,"#f1c232");}
  if(k==="gold"){F.glow(x0+19,top+20,30,"rgba(255,215,110,.15)");for(let i=0;i<6;i++){const a=t/600+i*1.3;if(Math.sin(a*2)>.65)F.spark(x0+((i*13)%40),top+((i*17)%42));}}}

// ---- running track around the yard
function decorTrack(P,G,t,F){const k=decorChoice(G,"track");if(k==="dirt")return;if(decorSprite(F,"track",k))return;
  const band={chalk:"#a8957a",gravel:"#7d7873",rubber:"#b8483a",lantern:"#a83f33",blue:"#2c5fb3",green:"#3f8a4f",pink:"#d77aa6",yellow:"#d9b028",goldcarpet:"#c9961c"}[k],line={chalk:"#f4ead8",gravel:"#c9c3bc",rubber:"#f4ead8",lantern:"#fff1d0",blue:"#f4ead8",green:"#f4ead8",pink:"#fff4fa",yellow:"#fff8e0",goldcarpet:"#fff1a6"}[k],ol="#2a1d1a";if(!band)return;
  const X0=112,X1=318,Y0=144,Y1=176,b=4;
  decorCached(F,"track_"+k,F=>{
  const seg=(x,y,w,h)=>{F(x-.5,y-.5,w+1,h+1,ol);F(x,y,w,h,band);F(x,y,w,.5,shadeHex(band,.25));F(x,y+h-.5,w,.5,shadeHex(band,-.3));};
  seg(X0,Y0,X1-X0,b);seg(X0,Y1,X1-X0,b);seg(X0,Y0,b,Y1-Y0+b);seg(X1-b,Y0,b,Y1-Y0+b);
  const rng=mulberry32(99);for(let i=0;i<160;i++){const top=i%2,x=X0+rng()*(X1-X0),y=(top?Y0:Y1)+.5+rng()*3;F(x,y,.5,.5,shadeHex(band,rng()>.5?.12:-.18));}
  for(let x=X0+3;x<X1-3;x+=6){F(x,Y0+1.75,3,.5,line);F(x,Y1+1.75,3,.5,line);}
  if(k==="gravel")for(let i=0;i<70;i++){const gx=X0+((i*37)%(X1-X0)),gy=(i%2?Y0:Y1)+((i*3)%3)+.5;F(gx,gy,1,1,"#5d5955");F(gx,gy,.5,.5,"#b4aea6");}
  if(k==="rubber"||k==="lantern"){for(let s=0;s<6;s++)F(X0+6+s*1.5,Y1,.75,b,s%2?"#f4ead8":"#2a2238");}
  });
  if(k==="goldcarpet"){F.glow(X0+(X1-X0)/2,Y1+2,60,"rgba(255,215,110,.10)");for(let i=0;i<7;i++){const a=t/500+i*1.3;if(Math.sin(a*2)>.6)F.spark(X0+8+((i*37)%(X1-X0-16)),(i%2?Y0:Y1)+1.5);}}
  if(k==="lantern")for(const x of [120,170,220,270,312]){const on=Math.floor(t/600+x)%5;F.glow(x+1,Y0-13,10,"rgba(255,200,120,.28)");
    F.box(x,Y0-12,2,12,"#3a3550",ol,"#5a5570");F.box(x-2,Y0-16,6,4.5,"#2a2238",ol);F(x-1.5,Y0-15,5,2.5,on?"#ffe9a0":"#fff7c4");F(x-2.5,Y0-17,7,1,"#4a4560");}}

// ---- camp vehicle
function decorVehicle(P,G,t,F){const v=decorChoice(G,"vehicle");if(v==="none")return;if(decorSprite(F,"vehicle",v))return;const y=152,ol="#120c1c";
  const wheel=x=>{F.disc(x+3.5,y+22,4,ol);F.disc(x+3.5,y+22,3.3,"#1f1d24");F.disc(x+3.5,y+22,1.8,"#9aa0aa");F(x+2.5,y+21,1,1,"#e8ecf2");F.disc(x+3.5,y+22,.6,"#3a3840");};
  const glass=(x,yy,w,h)=>{F(x,yy,w,h,"#2c3a4a");F(x,yy,w,h*.45,"#3d5068");F(x+1,yy+.5,.75,h-1,"rgba(255,255,255,.45)");F(x+2.25,yy+.5,.5,h*.6,"rgba(255,255,255,.25)");};
  const lamp=(x,yy,c="#ffe9a0")=>{F.glow(x+1,yy+1,6,"rgba(255,230,150,.35)");F.box(x,yy,2,2,c,ol);};
  const body=(x,yy,w,h,c)=>{F.box(x,yy,w,h,c,ol);F(x,yy,w,1,shadeHex(c,.3));F(x,yy+h-1.5,w,1.5,shadeHex(c,-.3));};
  if(v==="songthaew"||v==="rotdaeng"||v==="yellowthaew"){const x=230,sc=v==="rotdaeng"?"#c8283c":v==="yellowthaew"?"#e0b41b":"#2f8a4f";F.shadow(x+24,y+26,28,2.5);
    body(x,y+8,46,13,sc);F.box(x+1,y+1.5,32,2,"#3a3550",ol);F(x+2,y+3.5,1,5,"#3a3550");F(x+31,y+3.5,1,5,"#3a3550");F(x+2,y+4,30,4.5,"#e8e0c8");F(x+2,y+4,30,1,"#fff8e6");
    body(x+33,y+5,13,12,sc);glass(x+36,y+6.5,8,5);for(let i=0;i<4;i++)F.box(x+4+i*7,y+11.5,4,4,shadeHex(sc,-.3),null,shadeHex(sc,.2));F(x+3,y+10,28,.5,"#ffd36b");
    lamp(x+44.5,y+15.5);F(x-1,y+18,2,1.5,"#c8283c");wheel(x+3);wheel(x+34);return;}
  /* v1.91.78 (Man): more cars — diesel pickup, small E20 sedan, electric SUV (the vans reuse the van body) */
  if(v==="pickup"){const x=230,c="#7a1f2b";F.shadow(x+24,y+26,26,2.5);body(x,y+11,48,10,c);F.box(x+28,y+3,18,9,c,ol,shadeHex(c,.25));glass(x+31,y+4.5,6,5);glass(x+38.5,y+4.5,6,5);
    F(x+2,y+9,25,2,"#4a3a40");F(x+2,y+9,25,.75,"#6a5a60");F(x,y+15.5,48,.75,"#d9d9e0");F.text("Sirichai",x+13,y+18.2,3.4,"#ffffff");lamp(x+45.5,y+14);F(x-.5,y+14,1.5,2,"#ff6b6b");wheel(x+4);wheel(x+36);return;}
  if(v==="citycar"){const x=236,c="#e0e6ee";F.shadow(x+18,y+26,20,2.5);body(x,y+12,38,9,c);F.box(x+7,y+6,22,7,c,ol,"#ffffff");glass(x+9,y+7.5,8,4.5);glass(x+19,y+7.5,8,4.5);
    F(x,y+16,38,.75,"#c8283c");lamp(x+35.5,y+15);F(x-.5,y+15,1.5,2,"#ff6b6b");wheel(x+4);wheel(x+28);return;}
  if(v==="evsuv"){const x=232,c="#f4f6f8";F.shadow(x+22,y+26,25,2.5);body(x,y+11,46,10,c);F.box(x+6,y+4,32,8,c,ol,"#ffffff");F(x+8,y+5,28,5.5,"#1c2430");F(x+9,y+5.5,26,1.2,"#3a4a5e");
    F(x+21,y+5,1,5.5,c);F(x+2,y+14,42,.6,"#6fd3ff");F.glow(x+44,y+15,6,"rgba(140,220,255,.35)");F.box(x+42,y+13.5,3,1.5,"#bfefff",ol);F(x+20,y+16.5,4,2,"#6fd3ff");F(x+21.5,y+16,1,3,"#ffffff");F(x-.5,y+14,1.5,1.5,"#ff4d5a");wheel(x+4);wheel(x+35);return;}
  if(v==="minibus"||v==="pinkvan"||v==="bluevan"||v==="vipvan"||v==="evvan"){const x=228,mc=v==="pinkvan"?"#f4b6c8":v==="bluevan"?"#3a6fc0":v==="vipvan"?"#34313a":v==="evvan"?"#f2f6f4":"#ece9df";F.shadow(x+25,y+26,28,2.5);
    body(x,y+6,50,15,mc);F.box(x+2,y+2.5,40,4,mc,ol,"#ffffff");for(let i=0;i<4;i++)glass(x+4+i*9,y+8,7,5);glass(x+40,y+7,9,6);
    F(x,y+14,50,1.5,"#d9a520");F(x,y+15.5,50,.5,"#c8283c");F.box(x+16,y+17,14,2,"#c8283c",null);lamp(x+47,y+16);F(x-.5,y+17,1.5,2,"#c8283c");wheel(x+5);wheel(x+38);return;}
  if(v==="tuktuk"){const x=240,oc="#e8892a";F.shadow(x+20,y+26,22,2.5); /* v1.86: three-wheeled tuk-tuk, roof canopy, chrome trim */
    F.box(x+2,y+2,30,3,"#2a2238",ol,"#4a4060");F(x+3,y+5,1,9,"#3a3550");F(x+30,y+5,1,9,"#3a3550");F(x+17,y+5,1,7,"#3a3550");
    F(x+4,y+5,12,6,"rgba(40,30,60,.55)");F(x+5,y+9,10,3,"#c8283c");F(x+5,y+9,10,.75,"#e8545e");
    body(x+2,y+12,28,9,oc);F(x+2,y+15,28,.75,"#f2f2f2");F(x+2,y+16,28,.5,"#2c5fb3");F.text("Sirichai",x+12,y+18.4,3.4,"#ffffff");
    F.box(x+30,y+10,8,11,oc,ol,shadeHex(oc,.3));glass(x+31,y+5.5,5,4.5);F(x+31,y+5,6,.75,"#2a2238");lamp(x+36,y+14);F(x+36,y+18,2.5,1,"#d9d9e0");
    F(x+.5,y+17,1.5,2,"#c8283c");wheel(x+3);wheel(x+31);return;}
  if(v==="tourbus"){const x=214;F.shadow(x+32,y+26,36,2.5);
    body(x,y,64,21,"#c8283c");F.box(x+1,y-1.5,62,2,"#a01f30",ol);for(let i=0;i<6;i++)glass(x+3+i*9,y+3,7,6);glass(x+56,y+3,7,8);
    F(x,y+10.5,64,2,"#ffd36b");F(x,y+13,64,1,"#2c5fb3");F.box(x+8,y+14.5,30,4.5,"#f4ead8",null);F.text("Sirichai",x+23,y+16.9,4,"#c8283c");lamp(x+61,y+17);F(x-.5,y+16,1.5,3,"#ff6b6b");wheel(x+6);wheel(x+48);return;}
  if(v==="limo"){const x=216;F.shadow(x+33,y+26,36,2.5);
    F.box(x+6,y+8,58,6,"#2a2239",ol,"#4a4060");body(x,y+13,66,8,"#2a2239");for(let i=0;i<4;i++)glass(x+10+i*12,y+9,9,4);
    F(x,y+15,66,.5,"#d8d2e8");F(x,y+19.5,66,.5,"#5a5070");lamp(x+63.5,y+16);F(x+.5,y+16,2,2,"#ff6b6b");wheel(x+6);wheel(x+52);
    const sh=(t/18)%120;if(sh<66)F(x+sh,y+13.5,2,.5,"rgba(255,255,255,.8)");return;}
  if(v==="goldvan"){const x=228;F.shadow(x+25,y+26,28,2.5);F.glow(x+25,y+12,32,"rgba(255,215,110,.16)");
    body(x,y+6,50,15,"#d9a520");F.box(x+2,y+2.5,40,4,"#f1c232",ol,"#fff1a6");for(let i=0;i<4;i++){F(x+4+i*9,y+8,7,5,"#5a3a10");F(x+5+i*9,y+8.5,.75,4,"rgba(255,240,180,.5)");}
    F(x+40,y+7,9,6,"#fff3b0");F(x,y+14,50,1.5,"#fff1a6");lamp(x+47,y+16,"#ffffff");wheel(x+5);wheel(x+38);
    for(let i=0;i<5;i++){const a=t/500+i*1.7;if(Math.sin(a*2)>.55)F.spark(x+5+((i*13)%42),y+2+((i*7)%14),"#ffffff");}return;}}

// ---- heavy bags
function decorBag(P,k,x,y,i,look,t,F){const ol="#120c1c";
  const base={red:"#c8283c",blue:"#2c5fb3",team:"#8b4fa8",gold:"#d9a520",green:"#3f7a3a",black:"#2b2730",pink:"#e46aa0",white:"#ece8df",orange:"#e8892a",yellow:"#e0b41b"}[k]||(i===0&&look<5?"#7a6a5a":["#c8283c","#2b2730","#2c5fb3"][i%3]);
  if(decorSprite(F,"bags",k||"plain",[x-1,y-1,7,22]))return;
  F(x-.5,y-.5,6,21,ol);F(x,y,5,20,base);F(x+.5,y+1,1,18,shadeHex(base,.3));F(x+3.5,y+1,1,18,shadeHex(base,-.3));
  F(x,y,5,1.5,shadeHex(base,-.45));F(x,y+18.5,5,1.5,shadeHex(base,-.45));F(x,y+9.5,5,.5,shadeHex(base,-.2));
  if(!{red:1,blue:1,team:1,gold:1,green:1,black:1,pink:1,white:1,orange:1,yellow:1}[k]&&i===0&&look<5){F(x,y+6,5,1.5,"#c9c4b8");F(x,y+14,5,1.5,"#c9c4b8");}
  if(k==="team"){F.disc(x+2.5,y+9,1.8,"#ffd36b");F(x+2,y+8.5,1,1,"#c8283c");}
  if(k==="gold"){F(x,y+6.5,5,.75,"#fff1a6");F(x,y+13,5,.75,"#fff1a6");if(Math.floor(t/400+i)%4===0)F.spark(x+1.5,y+4);}}

// ---- boxing ring (whole ring, so the base and every skin share one painter)
function drawRingArt(F,G,t,look,k,rx,ry,rw,rh){if(decorSprite(F,"ring",k||"plain"))return;
  const ol="#120c1c",apron={red:"#8a1c2c",blue:"#1f3f80",sponsor:"#3b2f4a",gold:"#9c7a1c",green:"#1f5e35",purple:"#4a1f6a",black:"#15121c",pink:"#a8457a",orange:"#a8501a",yellow:"#9a7a10"}[k]||"#3b2f4a";
  const floor={gold:"#f5e3aa",red:"#f4c7cb",blue:"#c7dcf4",sponsor:"#e2c6ec",green:"#cfe9d4",purple:"#e2d0f0",black:"#3a3644",pink:"#f6d6e6",orange:"#f6dcc0",yellow:"#f8eeb8"}[k]||(look>=6?"#e8e0f0":"#bdb3a8");
  decorCached(F,"ring_"+(k||"plain")+"_"+(look>=6?1:0)+(look>=10?1:0),F=>{
  F.shadow(rx+rw/2,ry+rh+10,rw/2+8,3.5);
  F.box(rx,ry+rh,rw,8,apron,ol);F(rx,ry+rh,rw,1,shadeHex(apron,.3));for(let x=rx+6;x<rx+rw;x+=8)F(x,ry+rh+1,.5,7,shadeHex(apron,-.25));
  F.box(rx-4,ry+rh-2,rw+8,4,"#5a4a6a",ol,"#7a6a8a","#3a2f4a");
  F.box(rx,ry,rw,rh,floor,ol);F(rx,ry,rw,1.5,shadeHex(floor,.4));
  for(let x=rx+10;x<rx+rw;x+=14)F(x,ry+2,.5,rh-3,shadeHex(floor,-.06));for(let y=ry+8;y<ry+rh;y+=9)F(rx+1,y,rw-2,.5,shadeHex(floor,-.06));
  if(look>=10||k==="gold"||k==="sponsor"){const cx=rx+rw/2,cy=ry+rh/2+1;F.ell(cx,cy,16,6,shadeHex(floor,-.18));F.ell(cx,cy,13,4.5,shadeHex(floor,-.08));
    F.text(k==="gold"?"★":"Sirichai",cx,cy+.3,k==="gold"?7:5,k==="gold"?"#c9961c":shadeHex(floor,-.45));}
  if(k==="sponsor"){["#c8283c","#2f8a4f","#d9a520","#2c5fb3"].forEach((c,i)=>{F.box(rx+10+i*34,ry+rh+2,22,4,c,ol,shadeHex(c,.3));F(rx+12+i*34,ry+rh+3.25,12,1.5,"#f4ead8");});}
  if(k==="gold"){F.box(rx+rw/2-13,ry+rh+2,26,4,"#fff1a6",ol);F.text("CHAMPION",rx+rw/2,ry+rh+4.1,3.2,"#7a5a10",'"Pixelify Sans",monospace');}
  // corner posts: padded, round-shaded
  const postC=k==="gold"?["#d9a520","#d9a520"]:["#d23246","#2c5fb3"];
  [[rx-2,postC[0]],[rx+rw-2,postC[1]]].forEach(([px,c])=>{F.box(px,ry-26,4,30,"#8c8c96",ol,"#c9c9d2","#5a5a66");F.box(px-.5,ry-24,5,20,c,ol,shadeHex(c,.35),shadeHex(c,-.35));F(px+.5,ry-27,3,1.5,"#c9c9d2");});
  // ropes with sag, a lit top edge and a shadow line
  const sag=look>=6?0:2,ropes={red:["#c8283c","#f2f2f2","#c8283c"],blue:["#2c5fb3","#f2f2f2","#2c5fb3"],sponsor:["#7a3fc0","#f2f2f2","#7a3fc0"],gold:["#d9a520","#fff1a6","#d9a520"],green:["#2f8a4f","#f2f2f2","#2f8a4f"],purple:["#7a3fc0","#ffd84a","#7a3fc0"],black:["#2b2730","#c8283c","#2b2730"],pink:["#e07aa0","#f2f2f2","#e07aa0"],orange:["#e8892a","#f2f2f2","#e8892a"],yellow:["#e0b41b","#f2f2f2","#e0b41b"]}[k]||["#d23246","#f2f2f2","#2c5fb3"];
  ropes.forEach((c,o)=>{for(let x=0;x<rw;x+=1){const s=Math.sin(x/rw*Math.PI)*sag,yy=ry-22+o*7+s;F(rx+x,yy+1.5,1,.5,"rgba(12,6,26,.35)");F(rx+x,yy,1,1.5,c);F(rx+x,yy,1,.5,shadeHex(c,.45));}});
  });
  if(k==="gold")for(let i=0;i<6;i++){const a=t/550+i*1.1;if(Math.sin(a*2)>.7)F.spark(rx+((i*31)%rw),ry+((i*7)%rh));}}
function drawCamp(ctx,G,t){
  const S=2,P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)*S,Math.round(y)*S,Math.round(w)*S,Math.round(h)*S);};
  const look=campLook(G),rng=mulberry32(77),F=decorPainter(ctx,S);ctx.imageSmoothingEnabled=false;
  // sky
  const sky=["#2a2150","#3b2c63","#5a3b72","#8a4a76","#c8646e","#e98a5c"];sky.forEach((c,i)=>P(0,i*16,320,16,c));
  for(let i=0;i<26;i++){const x=Math.floor(rng()*320),y=Math.floor(rng()*50);if((Math.floor(t/600)+i)%5)P(x,y,1,1,"#f4e9ff");}
  P(258,14,14,14,"#ffe9b0");P(260,12,10,1,"#ffe9b0");P(256,16,1,10,"#ffe9b0");
  // mountains & trees
  for(let x=0;x<320;x+=2){const h=18+Math.sin(x/23)*7+Math.sin(x/9)*3;P(x,98-h,2,h+2,"#3a2c5c");}
  for(let x=0;x<320;x+=2){const h=10+Math.abs(Math.sin(x/13))*12;P(x,106-h,2,h,"#2a3f3a");}
  // ground
  P(0,108,320,72,look>=10?"#5f7a45":"#7a5f43");
  for(let i=0;i<60;i++){const x=rng()*320,y=110+rng()*68;P(x,y,2,1,look>=10?"#6f8a52":"#8a6c4c");}
  if(look>=6){P(118,142,200,30,"#b8a58a");for(let x=118;x<318;x+=10)P(x,142,1,30,"#a8957a");}
  decorTrack(P,G,t,F);
  decorTree(P,G,t,F);
  // building
  const bx=8,by=58,bw=104,bh=62;
  P(bx,by,bw,bh,look>=4?"#9a6a42":"#7d573a");for(let y=by+4;y<by+bh;y+=6)P(bx,y,bw,1,look>=4?"#87593a":"#6b4a31");
  // roof
  for(let i=0;i<14;i++)P(bx-6+i,by-14+i,bw+12-i*2,1,"#8d949c");
  P(bx-6,by-1,bw+12,2,"#6d747c");
  const rust=Math.max(0,7-Math.floor(look/2));for(let i=0;i<rust;i++){P(bx+4+((i*37)%96),by-12+((i*5)%10),6,2,"#a0522d");}
  // door & windows
  P(bx+44,by+30,16,32,"#4a2f1f");P(bx+46,by+32,12,28,look>=4?"#6a442c":"#3b2518");
  for(const wx of [bx+12,bx+76]){P(wx,by+20,16,14,"#2a1d2e");if(look>=4){P(wx+1,by+21,14,12,"#ffd98a");P(wx+7,by+21,1,12,"#7d573a");P(wx+1,by+27,14,1,"#7d573a");}
    else{P(wx-1,by+22,18,2,"#8a6a4a");P(wx-1,by+29,18,2,"#8a6a4a");}}
  // sign
  P(bx+12,by-30,80,14,look>=4?"#f4ead8":"#c9bba8");P(bx+12,by-30,80,1,"#5a3a2a");P(bx+12,by-17,80,1,"#5a3a2a");
  P(bx+28,by-16,2,8,"#5a3a2a");P(bx+74,by-16,2,8,"#5a3a2a");
  ctx.save();ctx.font=`bold ${9*S}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
  ctx.fillStyle=look>=4?"#c8283c":"#6a4a3a";ctx.fillText("SIRICHAI GYM",(bx+52)*S,(by-23)*S);ctx.restore();
  // string lights
  if(look>=6){for(let i=0;i<22;i++){const x=bx-4+i*5,y=by-2+Math.sin(i/3)*2;const on=(Math.floor(t/400)+i)%3;P(x,y,2,2,["#ffd36b","#ff7b8a","#8ad7ff"][on]);}
    for(let i=0;i<20;i++){const x=150+i*7,y=78+Math.sin(i/2.5)*3;P(x,y,2,2,["#ffd36b","#ff7b8a","#8ad7ff"][(Math.floor(t/400)+i)%3]);}}
  // weeds / trash
  if(look<5){for(let i=0;i<10;i++){const x=6+((i*53)%300),y=124+((i*17)%50);P(x,y,1,3,"#4f6a3a");P(x+1,y+1,1,2,"#5f7a45");}P(120,166,6,3,"#9aa0a8");P(300,150,4,4,"#6d747c");}
  // flowers & plants
  if(look>=8){for(let i=0;i<9;i++){const x=bx+2+i*11;P(x,by+bh,4,4,"#3f7a3a");P(x+1,by+bh-2,2,2,["#ff8ab0","#fff3b0","#ff6b6b"][i%3]);}}
  // bags frame
  P(120,74,2,50,"#5a4030");P(146,74,2,50,"#5a4030");P(118,74,32,3,"#5a4030");
  const nb=1+G.fac.gym,bagK=decorChoice(G,"bags");for(let i=0;i<nb;i++){const x=123+i*8,sw=Math.sin(t/350+i)*1.2;P(x+sw,77,1,8,"#2b2530");decorBag(P,bagK,x-1+sw,85,i,look,t,F);
    }
  // ice tub
  if(G.fac.recovery>=1){P(92,124,22,10,"#2c5fb3");P(93,125,20,4,"#9fd6ff");P(95,125,3,2,"#ffffff");}
  if(G.fac.recovery>=2){P(70,124,18,10,"#6d747c");P(71,125,16,3,"#c8e8ff");}
  // ring
  const rx=156,ry=96,rw=140,rh=34;
  const ringK=decorChoice(G,"ring");drawRingArt(F,G,t,look,ringK,rx,ry,rw,rh);
  // banners / flag
  if(look>=12){P(rx+20,ry-44,10,16,"#c8283c");P(rx+110,ry-44,10,16,"#2c5fb3");P(rx+22,ry-40,6,6,"#ffd36b");P(rx+112,ry-40,6,6,"#ffd36b");}
  if(look>=15){P(300,40,2,70,"#d8d8d8");const w=Math.sin(t/300)*1;["#c8283c","#f2f2f2","#2c5fb3","#2c5fb3","#f2f2f2","#c8283c"].forEach((c,i)=>P(302,42+i*2+w,14,2,c));}
  // classroom mats
  for(let i=0;i<G.fac.classroom;i++)P(6+i*24,152,22,18,["#c8283c","#2c5fb3","#2f8a4f","#d9a520","#7a3fc0"][i%5]);
  // v1.23 props for the late facilities
  {const cx=F.ctx,S=F.S;cx.save();cx.translate(248*S,180*S);cx.scale(1.22,1.22);cx.translate(-248*S,-180*S);decorVehicle(P,G,t,F);cx.restore();} /* v1.91.87 (Man): the camp vehicle a size bigger (grows up and out from the bottom edge) */
  if(G.fac.sauna){P(296,146,22,16,"#7a4a2a");for(let i=0;i<6;i++)P(294+i,140+i,26-i*2,1,"#5a3a2a");P(303,152,7,10,"#3b2518");for(let k=0;k<3;k++){const y=136-((t/40+k*9)%16);P(299+k*6+Math.sin(t/300+k)*2,y,2,2,"rgba(255,255,255,.55)");}}
  if(G.fac.lights){for(const lx of [150,300]){P(lx,46,2,62,"#9aa0a8");P(lx-4,44,10,4,"#3a3550");P(lx-3,45,8,2,Math.floor(t/700)%2&&G.fac.lights>=2?"#fff7c4":"#ffe9a0");}}
  if(G.fac.hall){P(286,112,22,24,"#5a3a2a");P(288,114,18,18,"#2a1d2e");P(293,117,8,6,"#f7d24a");P(295,123,4,6,"#d9a520");if(G.fac.hall>=2){P(289,128,6,3,"#c8283c");P(299,128,6,3,"#2c5fb3");}}
  // dorm house
  if(G.fac.dorm>=1){P(268,70,44,36,"#b88a5a");for(let i=0;i<9;i++)P(264+i,62+i,52-i*2,1,"#7a4a3a");P(284,88,10,18,"#5a3a2a");P(272,78,8,7,"#ffd98a");P(298,78,8,7,"#ffd98a");if(G.fac.dorm>=2){P(266,58,48,3,"#c8283c");}}
  // kitchen stall
  if(G.fac.kitchen>=1){P(120,128,26,14,"#e8d8b8");for(let i=0;i<26;i+=4)P(120+i,124,4,4,i%8?"#f2f2f2":"#c8283c");if(Math.floor(t/500)%2)P(128,118,2,4,"#dcdcdc");}
  // brand billboard
  if(G.fac.brand>=1){P(212,36,60,26,"#2a1d40");P(214,38,56,22,G.fac.brand>=2?"#c8283c":"#7a3fc0");ctx.save();ctx.font=`bold ${7*S}px "Chakra Petch",sans-serif`;ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(G.fac.brand>=3?"Women's Muay Thai champions!":"Muay Thai classes open",242*S,52*S);ctx.restore();P(240,62,3,34,"#5a4030");}

  decorGate(P,G,t,F);
  // v1.10: a living yard — everyone moves, drawn back-to-front
  const D=[];const chib=(look,key,x,y,sc,flip,dy)=>{const c=chibiCache(look,key+dy,{dy});D.push({y:y+32*sc,f:()=>{ctx.save();ctx.imageSmoothingEnabled=false;
    if(flip){ctx.translate((x+24*sc)*S,0);ctx.scale(-1,1);ctx.drawImage(c,0,y*S,24*S*sc,32*S*sc);}else ctx.drawImage(c,x*S,y*S,24*S*sc,32*S*sc);ctx.restore();}});};
  const n=Math.min(14,campStudents(G)),srng=mulberry32(4242);const SAYS=["Hup!","Yay!","Coach!","Thwack!","So tired~","Again!","Go go!"];
  const bubble=[];const bi=Math.floor(t/2600);const who=n?Math.floor(mulberry32(bi*31)()*n):-1;
  for(let i=0;i<n;i++){const look2=CHIBI.random(srng);
    if(i%3===0){// class drill near the coach: shadow-boxing in place
      const x=14+(i/3)*20,y=128,jab=Math.floor(t/220+i)%4;chib(look2,"s"+i,x+(jab===1?2:0),y,.72,false,jab%2);
      if(i===who)bubble.push([x+9,y-2]);}
    else{const w=wander(900+i,t+i*700,[6,124,150,154],3600+i*260);chib(look2,"s"+i,w.x,w.y,.72,w.flip,w.moving?Math.floor(t/120)%2:Math.floor(t/500+i)%2);
      if(i===who)bubble.push([w.x+9,w.y-2]);}}
  // coach paces in front of the class, assistants help out
  const cw=wander(77,t,[40,112,130,118],4200);chib(COACH_LOOK,"coach",cw.x,cw.y,.85,cw.flip,cw.moving?Math.floor(t/140)%2:Math.floor(t/500)%2);
  // v1.23: hired trainers walk the yard with their own pixel sprites
  (G.staff||[]).forEach((k,i)=>{const a=wander(500+i,t+i*1300,[16,128,148,160],3900+i*300);const sf={id:"staff_"+k,canon:false};const ph=hashStr(sf.id)%2000;
    const row=a.moving?"walk":Math.floor((t+ph)/2600)%3===2?"guard":"idle";const fr=Math.floor(t/(row==="idle"?260:150))%4;
    D.push({y:a.y+24,f:()=>{ctx.imageSmoothingEnabled=true;drawFrame(ctx,sheetFor(sf),ROW[row],fr,(a.x+10)*S,(a.y+24)*S,30*S,a.flip);}});});
  if(G.avatar){const pw=wander(31,t,[110,132,300,152],5200);chib(G.avatar,"player",pw.x,pw.y,.85,pw.flip,pw.moving?Math.floor(t/130)%2:Math.floor(t/420)%2);}
  // v1.51: adopted pets roam the yard (the stray soi dog stays until a dog is adopted)
  (G.pets||[]).forEach((p,i)=>{const w=wander(600+i*13,t+i*900,PET_BOX[p.k]||[20,150,300,170],PET_SPD[p.k]||3000);const px=w.x,py=w.y,fl=w.flip?-1:1,wd=p.k==="dog"?15:11,Z=2;
    D.push({y:py+14,f:()=>{const Q=(x,y,ww,h,c)=>P(fl>0?px+x*Z:px+(wd-x-ww)*Z,py+y*Z,ww*Z,h*Z,c);drawPetQ(Q,p.k,t+i*333,w.moving);}});});
  if(!(G.pets||[]).some(p=>p.k==="dog")){const dw=wander(5,t,[10,162,300,170],2600);const dx=dw.x,dy=dw.y+8,fl=dw.flip?-1:1,leg=dw.moving&&Math.floor(t/90)%2;
   D.push({y:dy+6,f:()=>{const Q=(x,y,w,h,c)=>P(fl>0?dx+x:dx+10-x-w,dy+y,w,h,c);Q(1,1,8,4,"#c99a5e");Q(8,-1,3,3,"#c99a5e");Q(10,0,1,1,"#2b2530");Q(0,Math.floor(t/150)%2?0:1,2,1,"#c99a5e");
     Q(1+(leg?1:0),5,1,2,"#a87a44");Q(7-(leg?1:0),5,1,2,"#a87a44");}});}
  for(let k=0;k<2;k++){const cx=40+k*22+Math.sin(t/1700+k)*6,cy=150+k*4,peck=Math.floor(t/300+k*2)%5===0;
    D.push({y:cy+4,f:()=>{P(cx,cy,4,3,"#f2f2f2");P(cx+3,cy-2+(peck?2:0),2,2,"#f2f2f2");P(cx+5,cy-1+(peck?2:0),1,1,"#e8a23a");P(cx+3,cy-3+(peck?2:0),1,1,"#d23246");}});}
  // fighters: activity rotates every few seconds so the camp never freezes
  for(const p of campPeople(G)){let row=p.row,x,y,flip=false,fr=Math.floor(t/150+p.k*2)%4;
    if(row==="cycle")row=["guard","punch","knee","walk"][Math.floor(t/2200+p.k)%4];
    if(p.spot==="ring"){x=rx+40+p.k*44+Math.sin(t/700+p.k)*10;y=ry+30;flip=p.k%2===1;}
    else if(p.spot==="bag"){x=112-p.k*14;y=118;}
    else if(p.spot==="run"){const L=260,pos=((t/30+p.k*90)%(L*2));x=40+(pos<L?pos:L*2-pos);y=172;flip=pos>=L;row="walk";}
    else {const w=wander(60+p.k,t,[20,128,150,150],4600);x=w.x+20;y=w.y+40;flip=w.flip;row=w.moving?"walk":"idle";}
    const f=p.f,rr=row;D.push({y,f:()=>{ctx.imageSmoothingEnabled=true;drawFrame(ctx,sheetFor(f),ROW[rr],fr,x*S,y*S,46*S,flip);}});}
  // birds cross the sky now and then
  {const bt=(t%14000)/14000;if(bt<.5){const bxp=-10+bt*2*340;for(let k=0;k<3;k++){const yy=26+k*5+Math.sin(t/200+k)*2,wing=Math.floor(t/160+k)%2;P(bxp-k*9,yy,2,1,"#1b1230");P(bxp-k*9-2,yy-wing,2,1,"#1b1230");P(bxp-k*9+2,yy-wing,2,1,"#1b1230");}}}
  // v1.88: the filtered indoor gym (airgym) — a sealed box with a big window and a filter unit
  if(G.fac.airgym){P(114,72,40,36,"#7c8796");P(114,72,40,3,"#5d6775");P(118,80,32,16,"#2b3a4c");P(119,81,30,14,Math.floor(t/900)%2?"#9fd3f0":"#8cc6e8");P(133,81,1,14,"#5d6775");
    P(146,98,8,8,"#c9d1da");const fa=Math.floor(t/90)%4;P(148+(fa%2?2:0),100+(fa>1?2:0),2,2,"#5d6775");P(150-(fa%2?2:0),102-(fa>1?2:0),2,2,"#5d6775");P(118,99,22,6,"#3a4757");}
  D.sort((a,b)=>a.y-b.y).forEach(d=>d.f());
  yearFx(ctx,P,G,t);
  for(const [x,y] of bubble){const tx=SAYS[bi%SAYS.length];ctx.save();ctx.font=`700 ${7*S}px "Chakra Petch",sans-serif`;const w=ctx.measureText(tx).width/S+6;
    P(x-w/2,y-10,w,9,"#ffffff");P(x-1,y-1,2,2,"#ffffff");ctx.fillStyle="#1b1230";ctx.textAlign="center";ctx.fillText(tx,x*S,(y-3)*S);ctx.restore();}
}
/* v1.88 yearly themes on the camp scene: flood water over the yard, PM2.5 haze over everything */
function yearFx(ctx,P,G,t){if(typeof ytIn!=="function")return;
  if(ytIn(G,"flood")){P(0,146,320,34,"rgba(70,120,175,.55)");for(let i=0;i<14;i++){const x=((i*53+t/40)%340)-10,y=150+(i*7)%26;P(x,y,12,1,"rgba(210,235,255,.55)");}
    const fx=((t/55)%360)-20,fy=158+Math.sin(t/500)*2;P(fx,fy,8,3,"#c8283c");P(fx+2,fy-1,4,1,"#f2c94c"); /* a floating sandal */
    for(let i=0;i<3;i++){const bx=40+i*110+Math.sin(t/700+i)*6,by=166+Math.sin(t/400+i)*1.5;P(bx,by,10,6,"#6a4a2a");P(bx+1,by-1,8,1,"#8a6a4a");}}
  if(ytIn(G,"pm25")&&!(G.fac.airgym>0&&false)){P(0,0,320,180,"rgba(196,150,108,.30)");P(0,0,320,60,"rgba(150,110,90,.28)");
    for(let i=0;i<40;i++){const x=(i*37+t/60*(1+i%3))%320,y=(i*23+Math.sin(t/900+i)*8)%170;P(x,y,1+(i%2),1,"rgba(110,90,80,.45)");}}}
// smooth stroll between random points, pausing in between
// v1.51: camp pets — tiny rect sprites, Q(x,y,w,h,color) already mirrored for facing
function drawPetQ(Q,k,t,moving){const leg=moving&&Math.floor(t/110)%2;
  if(k==="cat"){const o="#e8913a",d="#b9652a";Q(1,2,7,3,o);Q(3,2,1,1,d);Q(5,2,1,1,d);Q(7,0,4,4,o);Q(7,-1,1,1,o);Q(10,-1,1,1,o);Q(9,1,1,1,"#2b2530");Q(10,2,1,1,"#f6c9b0");
    Q(0,-1+(Math.floor(t/260)%2?-1:0),1,4,o);Q(1,-2+(Math.floor(t/260)%2?-1:0),1,1,o);Q(7,-2,1,2,o);Q(10,-2,1,2,o);Q(2+(leg?1:0),5,1,2,d);Q(6-(leg?1:0),5,1,2,d);}
  else if(k==="dog"){const b="#b5743a",r="#8f5526";Q(1,2,10,4,b);Q(3,2,6,1,r);Q(10,0,4,4,b);Q(10,-2,1,2,b);Q(13,-2,1,2,b);Q(12,1,1,1,"#2b2530");Q(14,2,1,1,"#2b2530");
    Q(0,Math.floor(t/150)%2?-1:0,1,3,b);Q(2+(leg?1:0),6,1,2,r);Q(4,6,1,2,r);Q(8-(leg?1:0),6,1,2,r);Q(10,6,1,2,r);}
  else if(k==="rooster"){const peck=!moving&&Math.floor(t/400)%4===0?1:0;Q(0,-1,2,4,"#1d6b5a");Q(1,-2,1,2,"#2d8c74");Q(1,2,6,4,"#c0392b");Q(3,3,3,2,"#8e2a20");
    Q(6,0+peck,2,3,"#e8a23a");Q(7,-2+peck,2,2,"#e8a23a");Q(7,-3+peck,2,1,"#d23246");Q(9,-1+peck,1,1,"#f2c94c");Q(8,-2+peck,1,1,"#2b2530");Q(3,6,1,2-(leg?1:0),"#e8a23a");Q(5,6,1,2-(leg?0:1)+1,"#e8a23a");}
  else if(k==="turtle"){const h=moving?0:(Math.floor(t/1800)%3===0?-1:0);Q(1,1,7,3,"#3f7a3a");Q(2,0,5,1,"#3f7a3a");Q(2,1,1,1,"#5aa34f");Q(4,2,1,1,"#5aa34f");Q(6,1,1,1,"#5aa34f");
    Q(8+h,2,2,2,"#8fbf6a");Q(9+h,2,1,1,"#2b2530");Q(1,4,1,1,"#8fbf6a");Q(7,4,1,1,"#8fbf6a");Q(0,3,1,1,"#8fbf6a");}
  else if(k==="otter"){const b="#7a5230",d="#563a22",c="#d2ad84",bob=moving?0:(Math.floor(t/700)%2?-1:0),wag=Math.floor(t/200)%2;
    Q(0,3+wag,2,1,b);Q(2,2,7,3,b);Q(3,4,5,1,c);Q(8,0+bob,4,3,b);Q(10,1+bob,2,2,c);Q(8,-1+bob,1,1,d);Q(10,0+bob,1,1,"#2b2530");Q(12,1+bob,1,1,"#2b2530");Q(12,2+bob,1,1,"#efe6d8");Q(3+(leg?1:0),5,1,1,d);Q(7-(leg?1:0),5,1,1,d);}}
const PET_BOX={otter:[150,128,250,134],cat:[8,116,100,128],dog:[20,120,148,130],rooster:[110,114,150,126],turtle:[60,126,130,130]},PET_SPD={otter:2400,cat:3000,dog:2600,rooster:2200,turtle:9000};
const PET_ICON={};function petIcon(k){if(PET_ICON[k])return PET_ICON[k];const c=document.createElement("canvas");c.width=34;c.height=26;const x=c.getContext("2d");
  const Q=(a,b,w,h,col)=>{x.fillStyle=col;x.fillRect((a+1)*2,(b+5)*2,w*2,h*2);};drawPetQ(Q,k,0,false);return PET_ICON[k]=c.toDataURL();}
function wander(seed,t,box,period){const seg=Math.floor(t/period),ph=(t%period)/period;
  const pt=k=>{const r=mulberry32(seed*7919+k*104729);return [box[0]+r()*(box[2]-box[0]),box[1]+r()*(box[3]-box[1])];};
  const a=pt(seg),b=pt(seg+1),mv=Math.min(1,ph/.6),e=mv*mv*(3-2*mv);
  return {x:a[0]+(b[0]-a[0])*e,y:a[1]+(b[1]-a[1])*e,moving:mv<1&&Math.abs(b[0]-a[0])+Math.abs(b[1]-a[1])>3,flip:b[0]<a[0]};}
const ASSIST_LOOKS=[{gender:"m",hairStyle:"crop",hair:"#2b2530",skin:"#d9a27b",eyes:"#3a2a24",top:"tank",topColor:"#2c5fb3",shorts:"#1f1f24",gloves:"#2c5fb3"},{gender:"f",hairStyle:"pony",hair:"#5a3a2a",skin:"#eec1a0",eyes:"#3a2a24",top:"tank",topColor:"#2f8a4f",shorts:"#1f1f24",gloves:"#2f8a4f"}];
const COACH_LOOK={gender:"m",hairStyle:"crop",hair:"#c9ced8",skin:"#b97d55",eyes:"#3a2a24",top:"tank",topColor:"#c8283c",shorts:"#1f1f24",gloves:"#1f1f24",mongkol:false,prajioud:true};
const CHIBI_CACHE={};
function chibiCache(look,key,frame){const k=key+JSON.stringify(look)+(frame.dy||0)+(frame.blink?1:0);if(!CHIBI_CACHE[k])CHIBI_CACHE[k]=CHIBI.canvasFor(look,frame);return CHIBI_CACHE[k];}
function chibiDataURL(look,scale=4){const c=CHIBI.canvasFor(look,{dy:0});const b=document.createElement("canvas");b.width=c.width*scale;b.height=c.height*scale;const x=b.getContext("2d");x.imageSmoothingEnabled=false;x.drawImage(c,0,0,b.width,b.height);return b.toDataURL();}

// ---------- ANIMATION LOOP REGISTRY ----------
const LOOPS=new Set();let rafOn=false;
// v1.83: with reduced motion the camp is painted a few times (so sprites finish loading) and then holds still
const RM=typeof matchMedia==="function"?matchMedia("(prefers-reduced-motion: reduce)"):null;
function startLoops(){if(RM&&RM.matches){const now=performance.now();[0,300,900,1800].forEach(d=>setTimeout(()=>{for(const fn of LOOPS){try{fn(now);}catch(e){}}},d));return;}
  if(rafOn)return;rafOn=true;const tick=t=>{for(const fn of LOOPS){try{fn(t);}catch(e){console.error(e);LOOPS.delete(fn);}}if(LOOPS.size)requestAnimationFrame(tick);else rafOn=false;};requestAnimationFrame(tick);}
function mountCanvases(){
  LOOPS.clear();
  document.querySelectorAll("canvas[data-camp]").forEach(cv=>{const x=cv.getContext("2d");LOOPS.add(t=>{if(!cv.isConnected)return;x.clearRect(0,0,cv.width,cv.height);drawCamp(x,G,t);});});
  document.querySelectorAll("canvas[data-sprite]").forEach(cv=>{const x=cv.getContext("2d");const id=cv.dataset.sprite;const mode=cv.dataset.mode||"";
    LOOPS.add(t=>{if(!cv.isConnected||!G)return;const f=G.F[id];if(!f)return;x.clearRect(0,0,cv.width,cv.height);
      let row=mode||(f.injury?"idle":PRESET_ROW[f.plan.preset]||"guard");if(row==="cycle")row=["guard","punch","knee","walk"][Math.floor(t/1800)%4];
      const fr=Math.floor(t/(row==="idle"?260:150))%4;x.imageSmoothingEnabled=true;
      if(cv.dataset.floor){x.fillStyle="rgba(0,0,0,.25)";x.beginPath();x.ellipse(cv.width/2,cv.height*.93,cv.width*.28,cv.height*.035,0,0,7);x.fill();}
      drawFrame(x,sheetFor(f),ROW[row],fr,cv.width/2,cv.height*.95,cv.height*.95,cv.dataset.flip==="1");});});
  document.querySelectorAll("canvas[data-staff]").forEach(cv=>{const x=cv.getContext("2d");const pf={id:"staff_"+cv.dataset.staff,canon:false};const ph=hashStr(pf.id)%2000;
    LOOPS.add(t=>{if(!cv.isConnected)return;x.clearRect(0,0,cv.width,cv.height);const row=Math.floor((t+ph)/2600)%3===2?"guard":"idle";const fr=Math.floor(t/(row==="idle"?260:150))%4;
      x.fillStyle="rgba(0,0,0,.25)";x.beginPath();x.ellipse(cv.width/2,cv.height*.93,cv.width*.26,cv.height*.035,0,0,7);x.fill();
      drawFrame(x,sheetFor(pf),ROW[row],fr,cv.width/2,cv.height*.95,cv.height*.95,false);});});
  document.querySelectorAll("canvas[data-chibi]").forEach(cv=>{const x=cv.getContext("2d");const key=cv.dataset.chibi;
    LOOPS.add(t=>{if(!cv.isConnected)return;const look=key==="coach"?COACH_LOOK:key==="player"?(G?G.avatar:UI.creator):UI.creator;if(!look)return;
      x.clearRect(0,0,cv.width,cv.height);x.imageSmoothingEnabled=false;const fr={dy:Math.floor(t/400)%2,blink:Math.floor(t/150)%24===0};
      const c=CHIBI.canvasFor(look,fr);const s=Math.floor(Math.min(cv.width/24,cv.height/32));x.drawImage(c,(cv.width-24*s)/2,cv.height-32*s,24*s,32*s);});});
  if(typeof mountCampFx==="function")mountCampFx();if(typeof mountContest==="function")mountContest();if(typeof mountWinPop==="function")mountWinPop();if(typeof mountWaiKhru==="function")mountWaiKhru();if(typeof mountLoyWish==="function")mountLoyWish();if(typeof mountGbox==="function")mountGbox();
  document.querySelectorAll("canvas[data-drill]").forEach(cv=>{const x=cv.getContext("2d");const id=cv.dataset.drill;
    LOOPS.add(t=>{if(!cv.isConnected||!G)return;const f=G.F[id],D=UI.drill;if(!f)return;const W=cv.width,H=cv.height;x.clearRect(0,0,W,H);x.imageSmoothingEnabled=false;
      const dt=D&&D.hitT?t-D.hitT:9999,hit=dt<600;const row=hit?(DRILL_ROW[f.plan.preset]||"punch"):"guard";const fr=hit?Math.min(3,Math.floor(dt/110)):Math.floor(t/260)%4;
      x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(W*.4,H*.95,W*.12,H*.03,0,0,7);x.fill();
      // heavy bag on a chain, swings after a hit
      const sw=hit?Math.sin(dt/90)*Math.max(0,1-dt/600)*10:Math.sin(t/700)*1.2,bx=W*.585+sw,by=H*.22;
      x.fillStyle="#555";x.fillRect(W*.585-1,0,2,by);x.fillStyle="#2b2530";x.fillRect(bx-17,by-2,34,H*.6+4);x.fillStyle="#c8283c";x.fillRect(bx-15,by,30,H*.6);
      x.fillStyle="#e23b4e";x.fillRect(bx-15,by,6,H*.6);x.fillStyle="#1f1f24";x.fillRect(bx-15,by+H*.1,30,4);x.fillRect(bx-15,by+H*.45,30,4);
      drawFrame(x,sheetFor(f),ROW[row],fr,W*.38,H*.97,H*.92,false);
      if(hit&&dt>180){const a=(dt-180)/420;x.globalAlpha=Math.max(0,1-a);x.fillStyle="#fff6a0";for(let i=0;i<8;i++){const ang=i*Math.PI/4;x.fillRect(W*.55+Math.cos(ang)*a*30,H*.45+Math.sin(ang)*a*30,4,4);}
        x.font=`bold ${22+a*8}px "Pixelify Sans",sans-serif`;x.textAlign="center";x.lineWidth=4;x.strokeStyle="#000";const tx=D.q==="perfect"?"PERFECT!":D.q==="good"?"GOOD":"OK";x.fillStyle=D.q==="perfect"?"#ffd34a":"#fff";
        x.strokeText(tx,W*.62,H*.2-a*14);x.fillText(tx,W*.62,H*.2-a*14);x.globalAlpha=1;}});});
  if(UI.fight&&UI.fight.stage!=="pre"&&FS.cv)LOOPS.add(FS.render);
  if(LOOPS.size)startLoops();
}

// ---------- FIGHT STAGE ----------
// v1.88: heroine special moves — 8-frame sheets (a/<id>_special.webp, 4×2 cells of 128) that play on their own at big moments.
/* Unlock (player camp): the bond signature (♥ Lv.7+) or any Lv.14 move learned. Rivals (Ploy/Fah before they join) only on a knockdown/KO.
   At most once a round per side. The name shown is the learned Lv.14 move, else the default name. */
const SPECIALS={
 kati:[{img:"kati_special",w:"elbow",def:"Sirichai Heart Spinning Elbow",sk:"ts_bolt",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="elbow"&&(e.crit||hp<45)}],
 mali:[{img:"mali_special",w:"kick",def:"Jasmine Bloom Kick",sk:"cy_bloom",when:e=>e.ev==="hit"&&e.w==="kick"&&e.crit},
       {img:"mali_dodge",def:"Move Like Water",dodge:1,p:.18}],
 rin:[{img:"rin_special",w:"knee",def:"The Winning Equation",sk:"lb_shadow",when:e=>e.ev==="counter",p:.35}],
 ploy:[{img:"ploy_special",w:"punch",def:"Buffalo Swing",sk:"kr_thunder",when:e=>e.ev==="hit"&&e.w==="punch"&&e.crit,p:.6}],
 fah:[{img:"fah_special",w:"punch",def:"Thundering Sky Storm",sk:"f_hurricane",when:(e,hp)=>(e.ev==="hit"||e.ev==="counter")&&e.w==="punch"&&hp<50,p:.5}]};
/* v1.89.24: arena art with the ring in the middle distance — zoom in so the fighters' feet (80% down the stage) land on the canvas (fy = that spot in the art) */
const BG_FIT={"bg_loy_ring.webp":{z:1.6,fy:.655}};
const SP_FRAME=150,SP_LEN=SP_FRAME*8+200,FX_LEN=1250;
/* v1.91.63 (Man): special-move heat tiers — the five girls as before (1) · regional champions + Naka League "hot" (2) · Ladda far beyond (3).
   Hotter tiers play faster and freeze on the impact frame (hit-stop) so the blow lands hard */
const SP_TIER={1:{fr:150,hold:0},2:{fr:92,hold:150},3:{fr:70,hold:260}};
const SP_HIT={nl_ladda_sp_superman:5,nl_ladda_sp_headkick:3,nl_ladda_sp_spinkick:6,nl_ladda_sp_backfist:5,nl_ladda_sp_bloodfist:5,nl_ladda_sp_bloodkick:5,nl_ladda_sp_bloodslam:6,nl_ladda_sp_awaken:3,nl_varya_special:4,nl_rosa_special:6};
/* v1.91.64 (Man): how the thrown fighter moves, matched to the thrower — leg = driven back onto her back (shoot/double-leg) · rana = flipped forward head over heels · slam = hoisted overhead and spiked straight down · hip = carried over the hip in an arc */
const TH_STY={nl_varya:"leg",nl_rosa:"rana",nl_ladda:"slam",nl_nia:"hip",nl_meili:"hip"},TH_GRAB={nl_varya_special:2,nl_rosa_special:4,nl_ladda_sp_bloodslam:4},TH_HIDE={nl_ladda_sp_bloodslam:1}; /* Ladda's blood-slam frames draw the victim on her shoulders: the real one is hidden while she is carried */
function thStyle(f){const id=String((f&&f.id)||"");for(const k in TH_STY)if(id.startsWith(k))return TH_STY[k];return "hip";}
const SP_HOT=["baibua","tabtim","alicia","chaba","nl_nia","nl_varya","nl_meili","nl_rosa"];
function spTier(f){if(!f)return 1;const id=String(f.id||""),sp=String(f.sprite||"");if(id.startsWith("nl_ladda")||sp.startsWith("nl_ladda"))return 3;if(SP_HOT.includes(id)||f.rgHot)return 2;return 1;}
function spK(se,sp){const fr=sp.fr,hi=sp.hi,hold=sp.hold;if(se<hi*fr)return Math.floor(se/fr);if(se<(hi+1)*fr+hold)return hi;return Math.min(7,hi+1+Math.floor((se-(hi+1)*fr-hold)/fr));}
const SP_COL={baibua:"#ff7ab8",tabtim:"#ff3b3b",alicia:"#ffd34a",chaba:"#2ee6c8",nl_nia:"#ff8a2a",nl_varya:"#ff3060",nl_meili:"#46d1ff",nl_rosa:"#ff4fd2"};
/* jagged bolt from (x0,y0) to (x1,y1) */
/* v1.91.66 (Man): skill effects grow with the skill — grade 1 (row 0–1) … grade 5 (Lv.34–42 roots). Guard skills wear a shield aura while their guard burst lasts; heals glow green */
const SUP={dash:200,grab:300,imp:780,len:1350};
/* thrower's arch (radians, 0 = upright) and the hip she pivots on */
function supArch(e){if(e<SUP.grab)return 0;if(e<SUP.imp){const p=(e-SUP.grab)/(SUP.imp-SUP.grab);return 1.25*p*p*(1.6-.6*p);}if(e<SUP.imp+260)return 1.25;return 1.25*Math.max(0,1-(e-SUP.imp-260)/(SUP.len-SUP.imp-260));}
const skGrade=row=>row>=8?5:row>=6?4:row>=4?3:row>=2?2:1;
const SK_KCOL={def:"#5ab8ff",rec:"#4fe08a",td:"#ff9a3c",sub:"#c070ff"};
function fsAura(x,s,t,H,S){const foot=H*.8,h=H*.5,cy=foot-h*.45;
  if(s.bk==="def"||(s.bkT&&t-s.bkT<1800&&s.bkK==="def")){const a=Math.min(1,(t-(s.bkT||0))/200),pu=.75+.25*Math.sin(t/120);x.save();x.globalCompositeOperation="lighter";
    const g=x.createRadialGradient(s.x,cy,h*.2,s.x,cy,h*.62);g.addColorStop(0,"rgba(90,180,255,0)");g.addColorStop(.8,`rgba(90,180,255,${.22*a*pu})`);g.addColorStop(1,"rgba(160,220,255,0)");x.fillStyle=g;x.beginPath();x.ellipse(s.x,cy,h*.5,h*.62,0,0,7);x.fill();
    x.strokeStyle=`rgba(170,225,255,${.55*a*pu})`;x.lineWidth=2;x.beginPath();x.ellipse(s.x,cy,h*.48,h*.6,0,0,7);x.stroke();
    for(let i=0;i<10;i++){const an=i/10*6.283+t/900,hx=s.x+Math.cos(an)*h*.44,hy=cy+Math.sin(an)*h*.55,r=h*.06;if(Math.sin(t/200+i*1.7)<.2)continue;x.beginPath();for(let k=0;k<6;k++){const b=k/6*6.283;x.lineTo(hx+Math.cos(b)*r,hy+Math.sin(b)*r);}x.closePath();x.stroke();}
    x.restore();}
  if(s.healT&&t-s.healT<2600){const e=t-s.healT,a=Math.min(1,e/200)*(e>2000?(2600-e)/600:1);x.save();x.globalCompositeOperation="lighter";const g=x.createRadialGradient(s.x,cy,6,s.x,cy,h*.75);g.addColorStop(0,`rgba(90,255,150,${.45*a})`);g.addColorStop(1,"rgba(40,200,90,0)");x.fillStyle=g;x.fillRect(s.x-h,foot-h*1.3,h*2,h*1.5);
    for(let i=0;i<9;i++){const ph=((e/1400)+i/9)%1,px=s.x+Math.sin(i*2.3+e/300)*h*.32,py=foot-ph*h*1.1,sz=(5+(i%3)*2)*(1-ph*.5);x.globalAlpha=a*(1-ph);x.fillStyle=i%2?"#8dffb8":"#e8fff0";x.fillRect(px-sz/2,py-sz*1.5,sz,sz*3);x.fillRect(px-sz*1.5,py-sz/2,sz*3,sz);}x.restore();}
  /* v1.91.82 (Man): anyone in blood-rage mode burns with a red aura while it lasts */
  if(s.rageT&&t-s.rageT<(s.rageMs||9000)){const e=t-s.rageT,L=s.rageMs||9000,a=Math.min(1,e/250)*(e>L-600?(L-e)/600:1),fl=.8+.2*Math.sin(t/70)+.1*Math.sin(t/23);x.save();x.globalCompositeOperation="lighter";
    const g=x.createRadialGradient(s.x,cy,h*.1,s.x,cy,h*.78);g.addColorStop(0,`rgba(255,40,40,${.75*a*fl})`);g.addColorStop(.55,`rgba(230,20,30,${.5*a*fl})`);g.addColorStop(1,"rgba(120,0,0,0)");x.fillStyle=g;x.fillRect(s.x-h,foot-h*1.35,h*2,h*1.5);
    for(let i=0;i<24;i++){const ph=((t/650)+i/24)%1,px=s.x+Math.sin(i*3.7+t/240)*h*(.2+.07*(i%3)),py=foot-ph*h*1.1,sz=(7+(i%3)*3)*(1-ph*.55);x.globalAlpha=a*(1-ph);x.fillStyle=i%3?"#ff3030":"#ffb0a0";x.beginPath();x.moveTo(px,py-sz*2.4);x.lineTo(px+sz*.6,py);x.lineTo(px-sz*.6,py);x.closePath();x.fill();}
    x.globalAlpha=a*.8*fl;x.strokeStyle="#ff2a2a";x.lineWidth=4;x.beginPath();x.ellipse(s.x,foot,h*.42,h*.1,0,0,7);x.stroke();x.restore();}
  const K=s.skf;if(K){const e=t-K.t0,L=900+K.g*260;if(e>L)s.skf=null;else{const a=Math.min(1,e/120)*(e>L-250?(L-e)/250:1),col=K.col,g5=K.g;x.save();x.globalCompositeOperation="lighter";
    const R=h*(.45+.12*g5),gr=x.createRadialGradient(s.x,cy,4,s.x,cy,R);gr.addColorStop(0,col+"bb");gr.addColorStop(1,col+"00");x.globalAlpha=a*(.6+.4*Math.sin(e/60));x.fillStyle=gr;x.fillRect(s.x-R,cy-R*1.2,R*2,R*2);
    /* v1.91.82 (Man): even the lowest tier reads as a skill — a ring bursts out at her feet and a few sparks rise */
    if(e<420){const k=e/420,rr=h*(.2+.55*k);x.globalAlpha=a*(1-k)*.9;x.strokeStyle=col;x.lineWidth=3+2*(1-k);x.beginPath();x.ellipse(s.x,foot,rr,rr*.3,0,0,7);x.stroke();x.strokeStyle="#ffffff";x.lineWidth=1.5;x.beginPath();x.ellipse(s.x,cy,rr*.8,rr*.95,0,0,7);x.stroke();}
    if(g5<2)for(let i=0;i<7;i++){const ph=((e*.0016)+i*.143)%1,px=s.x+Math.sin(i*5.3+e/170)*h*(.18+.06*(i%3)),py=foot-ph*h*.85,sz=3*(1-ph)+1.5;x.globalAlpha=a*(1-ph);x.fillStyle=i%2?col:"#ffffff";x.fillRect(px-sz/2,py-sz,sz,sz*2);}
    if(g5>=2)for(let i=0;i<6+g5*4;i++){const ph=((e*(.0015+g5*.0004))+i*.113)%1,px=s.x+Math.sin(i*7.1+e/150)*h*(.2+.07*(i%4)),py=foot-ph*h*(.8+.12*g5),sz=(3+g5)*(1-ph)+1;x.globalAlpha=a*(1-ph);x.fillStyle=i%3?col:"#ffffff";x.fillRect(px-sz/2,py-sz,sz,sz*2);}
    if(g5>=4){const pw=h*(.22+.05*(g5-4))*(1+.15*Math.sin(e/50)),pg=x.createLinearGradient(s.x-pw,0,s.x+pw,0);pg.addColorStop(0,col+"00");pg.addColorStop(.5,col+"aa");pg.addColorStop(1,col+"00");x.globalAlpha=a*.8;x.fillStyle=pg;x.fillRect(s.x-pw,0,pw*2,foot);x.globalAlpha=a;x.fillStyle="#ffffff";x.fillRect(s.x-2,0,4,foot);}
    if(g5>=5){x.globalAlpha=a*.95;x.strokeStyle=col;x.lineWidth=3;const rr=h*.62,rot=e/700;x.save();x.translate(s.x,foot);x.scale(1,.28);
      x.beginPath();x.arc(0,0,rr,0,7);x.stroke();x.beginPath();x.arc(0,0,rr*.82,0,7);x.stroke();x.strokeStyle="#fff3c0";x.lineWidth=2;x.beginPath();for(let k=0;k<=8;k++){const b=rot+k*6.283*3/8;x.lineTo(Math.cos(b)*rr*.82,Math.sin(b)*rr*.82);}x.stroke();
      for(let k=0;k<24;k++){const b=-rot*1.5+k/24*6.283;x.fillStyle=k%2?col:"#ffffff";x.fillRect(Math.cos(b)*rr*.91-3,Math.sin(b)*rr*.91-3,6,6);}x.restore();}
    x.restore();}}}
function bolt(x,x0,y0,x1,y1,seg,amp){x.beginPath();x.moveTo(x0,y0);for(let i=1;i<seg;i++){const k=i/seg;x.lineTo(x0+(x1-x0)*k+(Math.random()-.5)*amp,y0+(y1-y0)*k+(Math.random()-.5)*amp*.4);}x.lineTo(x1,y1);x.stroke();}
/* the drawn sheet that fits a move: a guard move → the dodge sheet; otherwise the sheet for that weapon. None → the plain row + code effects */
/* one sprite frame as a flat colour silhouette (glow outline, afterimages) — cached per sheet/frame/colour */
const SIL=new WeakMap();
function silFrame(sheet,row,col,color){if(!sheet||!(sheet.width||sheet.naturalWidth))return null;let m=SIL.get(sheet);if(!m){m={};SIL.set(sheet,m);}const k=row+"_"+col+color;if(m[k])return m[k];
  const wide=(sheet._cw||sheet.naturalWidth||sheet.width)>=1536||sheet._cw>CELL,cw=wide?384:CELL,ch=wide?192:CELL;
  const c=document.createElement("canvas");c.width=cw;c.height=ch;c._cw=cw;const x=c.getContext("2d");x.drawImage(sheet,col*cw,row*ch,cw,ch,0,0,cw,ch);x.globalCompositeOperation="source-in";x.fillStyle=color;x.fillRect(0,0,cw,ch);return m[k]=c;}
/* v1.90: a fighter may carry her own move list (f.spl — the province champions' moves, code effects only) */
const SP_PER_RD=2,SP_BONUS=.14;
const spList=f=>f?(SPECIALS[f.id]||f.spl||null):null;
function spSheet(id,w,kind,f){const L=SPECIALS[id]||(f&&f.spl)||[];if(kind==="def")return L.find(m=>m.dodge)||null;return L.find(m=>!m.dodge&&m.w===w)||null;}
function spOpen(f){if(!f||!spList(f)||(!f.canon&&!f.spl))return false;if(f.camp!=="player")return true;
  return hasSignature(f)||skillList(f.id).some(k=>k.row===4&&((f.skills||{})[k.id]||0)>0);}
function spName(f,mv){const k=mv.sk&&skillList(f.id).find(x=>x.id===mv.sk);return k&&((f.skills||{})[k.id]||0)>0?k.name:mv.def;}
/* which special (if any) this fight event sets off: {side, mv, name} */
function spPick(e,side,F,rng){if(!e||!e.ev||!F||!F.A||!F.B)return null;const R=F.round||1;FS.spR=FS.spR||{A:-1,B:-1};
  const ok=(sd,s)=>(FS.spR[sd]!==R||((FS.spN||{})[sd]||0)<SP_PER_RD)&&spOpen(s.f); /* v1.91.43 (Man): moves are the fun part — up to 2 a round each side (they're visual only) */
  if(e.ev==="miss"){const ds=side==="A"?"B":"A",d=F[ds],mv=(spList(d.f)||[]).find(m=>m.dodge);
    if(mv&&d.f.camp==="player"&&ok(ds,d)&&rng()<mv.p)return {side:ds,mv,name:spName(d.f,mv)};return null;}
  const me=F[side];if(!me||!spList(me.f)||!ok(side,me))return null;
  const big=e.ev==="ko"||(e.ev==="kd"&&rng()<.6),hp=100*(side==="A"?(e.ha??me.hp):(e.hb??me.hp))/(me.hp0||100);
  for(const mv of spList(me.f)){if(mv.dodge||mv.awaken)continue;if(mv.ph&&mv.ph!==((me.ph&&me.ph.n)||1))continue;if(mv.td){if(e.ev==="takedown")return {side,mv,name:mv.def};continue;}
    if((me.f.camp==="player"||mv.npc)&&mv.when&&mv.when(e,hp)&&(!mv.p||rng()<mv.p))return {side,mv,name:spName(me.f,mv)};
    /* v1.90: a province champion's move — her weapon landing clean, or a big hit when she's hurt */
    if(mv.npc&&(e.ev==="hit"||e.ev==="counter")&&e.w===mv.w&&(e.crit||hp<40)&&rng()<mv.p)return {side,mv,w:mv.w,name:mv.def};}
  /* v1.91.43 (Man wants to see moves often): any clean landing of her signature weapon has a small extra chance */
  if(e.ev==="hit"||e.ev==="counter"){const mv=spSheet(me.f.id,e.w,null,me.f),m0=spList(me.f).find(m=>!m.dodge&&!m.td&&!m.awaken&&!m.ph),r=rng();if(mv&&!mv.td&&!mv.awaken&&!mv.ph&&r<SP_BONUS)return {side,mv,w:e.w,name:spName(me.f,mv)};if(!mv&&m0&&e.crit&&r<SP_BONUS*2)return {side,mv:m0,w:m0.w||e.w,name:spName(me.f,m0)};}
  if(big){const mv=spSheet(me.f.id,e.w,null,me.f),m0=spList(me.f).find(m=>!m.dodge);return {side,mv,w:e.w,name:spName(me.f,mv||m0)};}
  return null;}
const FS={cv:null,ctx:null,bg:null,A:null,B:null,fx:[],shake:0,
  init(cv,bgName,fa,fb){this.cv=cv;this.ctx=cv?cv.getContext("2d"):null;this.bg=img(bgName);
    const mk=(f,side)=>({f,side,x:side==="A"?370:590,base:side==="A"?370:590,anim:"guard",t0:0,flash:0,down:0,ko:false,win:false});
    this.A=mk(fa,"A");this.B=mk(fb,"B");this.fx=[];this.shake=0;this.spR={A:-1,B:-1};this.spN={A:0,B:0};this.banner=null;
    for(const f of [fa,fb])if(f&&f.canon&&SPECIALS[f.id])SPECIALS[f.id].forEach(m=>m.img&&img(loyImg(f.id,m.img,f)+".webp"));
    for(const f of [fa,fb])if(f&&!f.canon){(f.spl||[]).forEach(m=>m.img&&img(m.img+".webp"));(f.phases||[]).forEach(P=>img(P.sprite+"_sheet.webp"));if(f.phases)this[f===fa?"A":"B"].f={...f,sprite:f.phases[0].sprite,blood:0};}},
  attach(cv){if(!cv)return;this.cv=cv;this.ctx=cv.getContext("2d");},
  play(e,now){const at=e.at||(e.ev==="counter"?(e.mside?e.mside:null):null);
    const atk=this[e.side==="A"?"A":"B"],def=this[e.side==="A"?"B":"A"];if(!atk)return;
    const row=e.w==="kick"||e.w==="knee"?"knee":"punch";
    if(e.ev==="hit"||e.ev==="counter"){atk.anim=row;atk.t0=now;def.flash=now;def.anim="guard";this.shake=e.crit?10:5;
      this.fx.push({x:def.x+(def.side==="A"?30:-30),y:290,t0:now,txt:e.crit?"Whack!!":["Thwack!","Thud!","Smack!","Whack!"][Math.floor(Math.random()*4)],big:!!e.crit});
      def.x+=def.side==="A"?-14:14;}
    if(e.ev==="miss"){atk.anim=row;atk.t0=now;def.x+=def.side==="A"?-8:8;this.fx.push({x:def.x,y:270,t0:now,txt:"Dodge!",miss:true});}
    if(e.ev==="kd"){def.down=now;this.shake=14;}
    if(e.ev==="ko"){def.ko=true;def.down=now;atk.win=true;atk.anim="win";this.shake=16;}
    if(e.ev==="cut"){this.fx.push({x:def.x,y:250,t0:now,txt:"Crack!",cut:true});}
    /* v1.90 open rules: on the ground the bottom fighter lies flat, the top one kneels over her */
    /* v1.90: a boss changes form — new sheet, and the blood-mode awakening plays its own sheet */
    if(e.ev==="phase"){const P=(atk.f.phases||[])[(e.ph||1)-1];if(P){if(P.lvUp&&typeof G!=="undefined"&&G.F[atk.f.id]&&!G.F[atk.f.id].lvUpd){G.F[atk.f.id].lvl+=P.lvUp;G.F[atk.f.id].lvUpd=1;}/* v1.90.20: Ladda +1 level in blood mode */atk.f={...atk.f,sprite:P.sprite,blood:P.blood||0};const keep={...this.spR};
      if(P.n===3){const mv=(atk.f.spl||[]).find(m=>m.awaken);this.special({side:atk.side,mv,head:"TRANSFORM!",name:mv?mv.def:"Blood-boil mode"},0,now);}
      else if(P.n===2)this.special({side:atk.side,mv:null,kind:"def",col:"#ff5a6e",head:"TRANSFORM!",name:"Hood Off"},0,now);this.spR=keep;this.shake=P.n===3?18:10;}}
    if(e.ev==="takedown"){def.gnd=true;def.down=0;def.throwT=now;def.thrownBy=spTier(atk.f);def.slam=false;{const st=e.tdSt||thStyle(atk.f);def.th={st,grab:0,imp:st==="slam"?440:st==="rana"||st==="suplex"?420:st==="ddt"?320:st==="leg"?300:380};}atk.top=true;atk.anim="punch";atk.t0=now;this.shake=8;this.fx.push({x:def.x,y:300,t0:now,txt:"THROW!",big:true});}
    if(e.ev==="gnp"){atk.anim="punch";atk.t0=now;def.flash=now;this.shake=6;this.fx.push({x:def.x,y:320,t0:now,txt:["Thud!","Thwack!","SLAM!"][Math.floor(Math.random()*3)]});}
    if(e.ev==="subtry"){this.shake=4;this.fx.push({x:(atk.x+def.x)/2,y:300,t0:now,txt:"LOCK!",miss:true});}
    if(e.ev==="tap"){def.tap=now;atk.win=true;this.shake=10;this.fx.push({x:def.x,y:300,t0:now,txt:"TAP OUT!",big:true,cut:true});}
    if(e.ev==="standup"||e.ev==="reset"){for(const q of [atk,def]){if(q.base0!=null){q.base=q.base0;q.base0=null;}q.lieAng=null;q.gnd=false;q.top=false;q.tap=0;q.anim="guard";}this.fx.push({x:(atk.x+def.x)/2,y:270,t0:now,txt:e.ev==="reset"?"BREAK!":"UP!",miss:true});}
    if(e.ev==="sprawl"){def.x+=def.side==="A"?40:-40;atk.anim="guard";this.fx.push({x:atk.x,y:270,t0:now,txt:"SPRAWL!",miss:true});}
    if(e.ev==="ko"&&(def.gnd||atk.top)){def.gnd=false;atk.top=false;}
  },
  ground(){for(const q of [this.A,this.B])if(q){if(q.base0!=null){q.base=q.base0;q.base0=null;}q.lieAng=null;q.gnd=false;q.top=false;q.tap=0;q.th=null;q.throwT=0;}}, /* v1.91.94 (Man): a round that starts after a throw puts both back on their own side (a suplex left them crossed over) */
  rage(side,now){const s=this[side];if(s){s.rageT=now;s.rageMs=9000;}},
  skill(side,row,kind,now){const s=this[side];if(!s)return;const g=skGrade(row||0),col=SK_KCOL[kind]||(s.f&&s.f.color)||"#ffd34a",H=this.cv?this.cv.height:540,foot=H*.8,h=H*.5,y=foot-h*.5;
    s.skf={g,t0:now,col,kind};if(kind==="def"){s.bk="def";s.bkK="def";s.bkT=now;}if(kind==="rec"){s.healT=now;this.fx.push({x:s.x,y:foot-h*.95,t0:now,txt:"+",big:true,heal:1});}
    this.fx.push({ring:1,x:s.x,y,t0:now,col});
    if(g>=2)this.fx.push({burst:1,x:s.x,y,t0:now,col,n:8+g*4,sp:.7+g*.12});
    if(g>=3){this.flashAt=now;this.flashCol=null;this.shake=Math.max(this.shake,6+g*2);}
    if(g>=4){this.skHeat={t0:now,len:900+g*200,col,g,side};this.fx.push({ring:1,x:s.x,y,t0:now+120,col:"#ffffff"});}
    if(g>=5){this.flashCol="#fff0a0";for(let i=1;i<3;i++)this.fx.push({ring:1,x:s.x,y,t0:now+i*140,col:i%2?"#ffffff":col});this.fx.push({petal:1,t0:now,col,side});}},
  burst(e){for(const k of ["A","B"]){const v=e["b"+k];if(v===undefined)continue;const s=this[k];if(!s)continue;if(v!=="def"&&s.bkT&&performance.now()-s.bkT<1800)continue;s.bk=v==="def"?"def":null;}},
  special(sp,round,now){const s=this[sp.side];if(!s)return;this.spN=this.spN||{A:0,B:0};this.spN[sp.side]=this.spR[sp.side]===round?(this.spN[sp.side]||0)+1:1;this.spR[sp.side]=round;this.banner={txt:sp.name,side:sp.side,t0:now,head:sp.head,tier:spTier(s.f)};
    const tier=spTier(s.f),T=SP_TIER[tier];
    if(sp.mv&&sp.mv.img){s.anim="special";const hi=SP_HIT[sp.mv.img]??5;s.sp={im:img(loyImg(s.f.id,sp.mv.img,s.f)+".webp"),t0:now,tier,fr:T.fr,hold:T.hold,hi,len:T.fr*8+T.hold+200,hit:false,dodge:!!(sp.mv.dodge||sp.mv.noHit),col:SP_COL[s.f.id]||(s.f&&s.f.color)||"#ffd34a"};this.shake=sp.mv.dodge?6:tier===3?20:tier===2?16:14;if(tier>1){this.heat={tier,t0:now,side:sp.side,len:s.sp.len};}
      if(sp.mv.td){const o=s===this.A?this.B:this.A,P=s.sp,g=(TH_GRAB[sp.mv.img]??2);if(o&&o.gnd){o.throwT=now;o.slam=false;o.th={st:thStyle(s.f),grab:g*P.fr,imp:P.hi*P.fr,hide:!!TH_HIDE[sp.mv.img]};P.td={o,gap:TH_HIDE[sp.mv.img]?34:o.th.st==="slam"?70:88};}}return;}
    if(tier>1)this.heat={tier,t0:now,side:sp.side,len:SUP.len};
    /* v1.91.67 (Man): a real suplex, animated in code from the thrower's own frames until a drawn sheet arrives —
       she closes in, clinches, arches back into a bridge and carries her opponent over her head, head-first into the mat */
    if(sp.mv&&sp.mv.code==="suplex"){const o=s===this.A?this.B:this.A;if(o){const dir=Math.sign(o.x-s.x)||1;s.anim="suplex";s.sx={t0:now,dir,ox:o.x,tier};{o.gnd=true;o.throwT=now;o.slam=false;o.thrownBy=tier;o.th={st:"suplex2",grab:SUP.grab,imp:SUP.imp,by:s};}this.shake=6;return;}}
    /* no drawn sheet for this move: the normal row, dressed up in code — aura, afterimages, speed lines, a dash and an impact ring */
    const kind=sp.kind||"atk",row=kind==="def"?"guard":kind==="rec"?"win":(sp.w==="kick"||sp.w==="knee")?"knee":"punch";
    s.anim="fx";s.fx={t0:now,row,kind,col:sp.col||(kind==="def"?"#5ab0ff":kind==="rec"?"#4fe08a":(s.f&&s.f.color)||"#ffd34a"),hit:false};if(kind==="atk")s.x+=s.side==="A"?40:-40;this.shake=kind==="atk"?8:4;},
  render(t){const S=FS;if(!S.cv||!S.cv.isConnected)return;const x=S.ctx,W=S.cv.width,H=S.cv.height;
    x.save();const sh=S.shake;if(sh>.3){x.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);S.shake*=.88;}
    if(S.bg&&S.bg.naturalWidth){const r=S.bg.naturalWidth/S.bg.naturalHeight,fit=BG_FIT[(S.bg.src||"").split("/").pop()];
      if(fit){const dh=H*fit.z,dw=dh*r;x.drawImage(S.bg,(W-dw)/2+(fit.dx||0)*dw,H*.8-fit.fy*dh,dw,dh);}else{const bw=H*r;x.drawImage(S.bg,(W-bw)/2,0,bw,H);}}else{x.fillStyle="#221b3d";x.fillRect(0,0,W,H);}
    /* v1.91.63: the arena darkens while a hot special plays — a little for champions/Naka, near-black blood-red with lightning for Ladda */
    if(S.heat){const Ht=S.heat,hk=(t-Ht.t0)/Ht.len;if(hk>1||hk<0)S.heat=null;else{const a=Math.min(1,hk/.1)*(hk>.82?(1-hk)/.18:1),at=Ht.side==="A"?S.A:S.B;
      x.save();if(Ht.tier===3){x.fillStyle=`rgba(18,0,6,${.66*a})`;x.fillRect(-20,-20,W+40,H+40);
        if(at){const g=x.createRadialGradient(at.x,H*.55,10,at.x,H*.55,W*.55);g.addColorStop(0,`rgba(255,20,40,${.38*a})`);g.addColorStop(1,"rgba(120,0,10,0)");x.fillStyle=g;x.fillRect(0,0,W,H);}
        x.globalCompositeOperation="lighter";x.lineCap="round";
        for(let i=0;i<3;i++)if(Math.random()<.55*a){const bx=Math.random()*W;x.strokeStyle=`rgba(255,${40+Math.random()*60|0},70,${.9*a})`;x.lineWidth=2+Math.random()*4;bolt(x,bx,-10,bx+(Math.random()-.5)*160,H*(.55+Math.random()*.3),9,70);}
        x.globalCompositeOperation="source-over";const v=x.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,W*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,`rgba(60,0,0,${.75*a})`);x.fillStyle=v;x.fillRect(0,0,W,H);}
      else{x.fillStyle=`rgba(5,0,15,${.36*a})`;x.fillRect(-20,-20,W+40,H+40);const dir=Ht.side==="A"?1:-1,el=t-Ht.t0,c=(at&&at.sp&&at.sp.col)||"#ffffff";x.globalCompositeOperation="lighter";
        for(let i=0;i<16;i++){const yy=H*(.22+((i*53)%60)/100),len=W*(.12+((i*37)%30)/100),off=((el*(1.6+(i%4)*.3)+i*170)%(W+len*2))-len;x.globalAlpha=a*(i%3?.35:.6);x.fillStyle=i%3?c:"#ffffff";x.fillRect(dir>0?W-off:off-len,yy,len,2+(i%3));}}x.restore();}}
    if(S.skHeat){const K=S.skHeat,k=(t-K.t0)/K.len;if(k>1||k<0)S.skHeat=null;else{const a=Math.min(1,k/.12)*(k>.75?(1-k)/.25:1);x.save();x.fillStyle=`rgba(8,4,20,${(K.g>=5?.5:.35)*a})`;x.fillRect(-20,-20,W+40,H+40);
      if(K.g>=5){x.globalCompositeOperation="lighter";for(let i=0;i<7;i++){const bx=W*(i+.5)/7+Math.sin(t/400+i)*20,bw=W*.05;const pg=x.createLinearGradient(bx-bw,0,bx+bw,0);pg.addColorStop(0,K.col+"00");pg.addColorStop(.5,K.col+"44");pg.addColorStop(1,K.col+"00");x.globalAlpha=a*(.5+.5*Math.sin(t/180+i*1.3));x.fillStyle=pg;x.fillRect(bx-bw,0,bw*2,H);}}x.restore();}}
    // approach centre
    if(!S.A||!S.B){x.restore();return;}if(!S.A.gnd&&!S.B.gnd)for(const q of [S.A,S.B])if(q.base0!=null&&!(q.sx&&t-q.sx.t0<1600)){q.base=q.base0;q.base0=null;q.lieAng=null;} /* nobody on the floor → home corners */
    for(const s of [S.A,S.B]){s.x+=(s.base-s.x)*.08;if(!(s.th&&s.th.hide&&s.gnd&&s.throwT&&t-s.throwT>=s.th.grab&&t-s.throwT<s.th.imp))fsAura(x,s,t,H,S);x.shadowBlur=0;if(s.rageT&&t-s.rageT<(s.rageMs||9000)){x.shadowColor="rgba(255,24,24,.95)";x.shadowBlur=20+8*Math.sin(t/90);} /* blood rage: the sprite itself glows red */
      if(s.anim==="fx"){const X=s.fx,se=t-X.t0;if(se>FX_LEN){s.anim=s.win?"win":"guard";}
        else{const foot=H*.8,h=H*.5,flip=s.side==="B",dir=flip?-1:1,atk=X.kind==="atk",sh=sheetFor(s.f);
          const col=atk?Math.min(3,Math.floor(se/140)):Math.floor(t/160)%4,pulse=.55+.45*Math.sin(se/70);
          x.save();x.globalCompositeOperation="lighter";const g=x.createRadialGradient(s.x,foot-h*.45,4,s.x,foot-h*.45,h*.75);g.addColorStop(0,X.col+"aa");g.addColorStop(1,X.col+"00");
          x.globalAlpha=Math.min(1,se/150)*(se>FX_LEN-300?(FX_LEN-se)/300:1)*pulse;x.fillStyle=g;x.fillRect(s.x-h,foot-h*1.3,h*2,h*1.5);x.restore();
          if(atk&&se<700)for(let i=0;i<9;i++){const yy=foot-h*(.15+((i*37)%70)/100),len=40+((i*53)%60),off=((se*1.4+i*90)%260);x.fillStyle="rgba(255,255,255,.8)";x.fillRect(s.x-dir*(off+20),yy,-dir*len*1.6,5);}
          x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(s.x,foot,h*.25,h*.04,0,0,7);x.fill();
          const fade=Math.min(1,se/120)*(se>FX_LEN-250?(FX_LEN-se)/250:1);
          if(atk||X.kind==="def"){const gh=silFrame(sh,ROW[X.row],Math.max(0,col-1),X.col);if(gh)for(let i=3;i>=1;i--){x.save();x.imageSmoothingEnabled=true;
            drawFrame(x,gh,0,0,s.x-dir*i*(atk?30:18)*(X.kind==="def"?Math.sin(se/90+i):1),foot,h,flip,fade*(.55-.13*i));x.restore();}}
          const ol=silFrame(sh,ROW[X.row],col,X.col);if(ol){x.save();x.imageSmoothingEnabled=true;for(const [ox,oy] of [[-5,0],[5,0],[0,-5],[0,4]])drawFrame(x,ol,0,0,s.x+ox,foot+oy,h,flip,fade*pulse*.9);x.restore();}
          x.save();x.imageSmoothingEnabled=true;drawFrame(x,sh,ROW[X.row],col,s.x,foot,h,flip);x.restore();
          if(atk&&!X.hit&&se>420){X.hit=true;const o=s===S.A?S.B:S.A;S.shake=16;S.fx.push({ring:1,x:o.x,y:foot-h*.5,t0:t,col:X.col});S.flashAt=t;}
          if(X.kind==="rec"&&Math.floor(se/120)%2)for(let i=0;i<5;i++){const a=se/300+i*1.26;x.fillStyle=X.col;x.fillRect(s.x+Math.cos(a)*h*.35-3,foot-h*.5+Math.sin(a)*h*.4-se*.05%40,6,6);}
          continue;}}
      if(s.anim==="suplex"){const X=s.sx,e=t-X.t0,foot=H*.8,h=H*.5,flip=s.side==="B";if(e>SUP.len){s.anim=s.win?"win":"guard";}
        else{if(e<SUP.grab){const tx=X.ox-X.dir*h*.24;s.x+=(tx-s.x)*.35;}
          const ra=-X.dir*supArch(e)*.9,col=e<SUP.dash?1:e<SUP.imp?3:e<SUP.imp+260?3:Math.min(3,Math.floor((e-SUP.imp-260)/120));
          x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(s.x,foot,h*.25,h*.04,0,0,7);x.fill();
          x.save();x.translate(s.x,foot);x.rotate(ra);x.translate(-s.x,-foot);x.imageSmoothingEnabled=true;drawFrame(x,sheetFor(s.f),ROW[e<SUP.dash?"walk":"punch"],col,s.x,foot,h,flip);x.restore();continue;}}
      if(s.anim==="special"){const P=s.sp,se=t-P.t0,im=P.im,len=P.len||SP_LEN;if(se>len||!im||!im.naturalWidth){s.anim=s.win?"win":"guard";}
        else{const k=P.fr?spK(se,P):Math.min(7,Math.floor(se/SP_FRAME)),foot=H*.8,h=H*.5,flip=s.side==="B",dir=flip?-1:1,tier=P.tier||1,col=P.col||"#ffd34a",o=s===S.A?S.B:S.A;
          if(P.td&&P.td.o){/* the thrower closes the distance — she has to get her hands on her */const tx=P.td.o.x+(s.side==="A"?-1:1)*P.td.gap;s.x+=(tx-s.x)*.3;}
          if(tier>1){/* aura + flames behind her */const pu=.65+.35*Math.sin(se/45),cy=foot-h*.42;x.save();x.globalCompositeOperation="lighter";
            const g=x.createRadialGradient(s.x,cy,6,s.x,cy,h*(tier===3?1.05:.78));g.addColorStop(0,(tier===3?"#ff2030":col)+"cc");g.addColorStop(.55,(tier===3?"#a00010":col)+"55");g.addColorStop(1,"#00000000");x.globalAlpha=pu;x.fillStyle=g;x.fillRect(s.x-h*1.2,foot-h*1.6,h*2.4,h*1.8);
            for(let i=0;i<(tier===3?22:12);i++){const ph=((se*(tier===3?.0032:.0022))+i*.137)%1,fx=s.x+Math.sin(i*12.9+se/120)*h*(.18+.12*(i%3)),fy=foot-ph*h*(tier===3?1.25:.95);x.globalAlpha=(1-ph)*.9;x.fillStyle=tier===3?(i%3?"#ff3040":"#ffd0d0"):(i%2?col:"#fff6c8");const sz=(tier===3?9:7)*(1-ph)+2;x.fillRect(fx-sz/2,fy-sz/2,sz,sz*1.6);}
            if(tier===3){x.strokeStyle="rgba(255,60,80,.95)";x.lineWidth=3;x.lineCap="round";for(let i=0;i<2;i++)if(Math.random()<.7)bolt(x,s.x+(Math.random()-.5)*h*.9,foot-h*(.9+Math.random()*.3),s.x+(Math.random()-.5)*h*.5,foot-h*Math.random()*.3,6,36);}
            x.restore();
            /* afterimages before the blow */if(k<=P.hi&&!P.dodge){for(let i=3;i>=1;i--){const kk=Math.max(0,k-i),gh=silFrame(im,kk>>2,kk&3,tier===3?"#ff1030":col);if(gh){x.save();x.globalCompositeOperation="lighter";drawFrame(x,gh,0,0,s.x-dir*i*(tier===3?26:18),foot,h,flip,(tier===3?.5:.38)-.1*i);x.restore();}}}}
          x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(s.x,foot,h*.25,h*.04,0,0,7);x.fill();
          if(tier===3){/* chromatic split: blood-red ghost either side, jittering */const r=silFrame(im,k>>2,k&3,"#ff0028"),c=silFrame(im,k>>2,k&3,"#30001a");const j=(k===P.hi?10:5)+Math.random()*3;
            if(c){x.save();drawFrame(x,c,0,0,s.x+dir*j,foot+2,h,flip,.55);x.restore();}if(r){x.save();x.globalCompositeOperation="lighter";drawFrame(x,r,0,0,s.x-dir*j,foot,h,flip,.7);x.restore();}}
          x.save();x.imageSmoothingEnabled=true;drawFrame(x,im,k>>2,k&3,s.x,foot,h,flip);x.restore();
          if(tier>1&&k===P.hi&&!P.hit&&!P.dodge&&o){P.hit=true;const iy=foot-h*.5;o.flash=t;S.shake=tier===3?30:20;S.flashAt=t;S.flashCol=tier===3?"#ff2040":"#ffffff";
            S.fx.push({ring:1,x:o.x,y:iy,t0:t,col:tier===3?"#ff1030":col});S.fx.push({burst:1,x:o.x,y:iy,t0:t,col:tier===3?"#ff3050":col,n:tier===3?34:20,sp:tier===3?1.5:1});
            if(tier===3){S.fx.push({ring:1,x:o.x,y:iy,t0:t+90,col:"#2a0008"});S.fx.push({crack:1,x:o.x,y:foot,t0:t,seed:Math.random()*99});S.fx.push({x:o.x,y:iy-30,t0:t,txt:"!!",big:true,cut:true});}
            if(typeof AU!=="undefined"&&AU.sfx)AU.sfx(tier===3?"kd":"elbow");}
          continue;}}
      const el=t-s.t0;let row=s.anim,col;
      if((row==="punch"||row==="knee")&&el>520){s.anim=s.win?"win":"guard";row=s.anim;}
      if(row==="punch"||row==="knee")col=Math.min(3,Math.floor(el/130));else col=Math.floor(t/(row==="win"?180:200))%4;
      const foot=H*.8,h=H*.5,flip=s.side==="B";
      if(s.f.blood){x.save();x.globalCompositeOperation="lighter";const pu=.6+.4*Math.sin(t/90),g=x.createRadialGradient(s.x,foot-h*.45,6,s.x,foot-h*.45,h*.7);g.addColorStop(0,"rgba(255,30,40,"+(.45*pu)+")");g.addColorStop(1,"rgba(255,0,0,0)");
        x.fillStyle=g;x.fillRect(s.x-h,foot-h*1.25,h*2,h*1.4);if(Math.floor(t/110)%3===0){x.strokeStyle="rgba(255,90,90,.85)";x.lineWidth=3;x.beginPath();const bx=s.x+(Math.sin(t/37)*h*.35);x.moveTo(bx,foot-h*.95);x.lineTo(bx+12,foot-h*.75);x.lineTo(bx-6,foot-h*.62);x.lineTo(bx+8,foot-h*.42);x.stroke();}x.restore();}
      // shadow
      x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(s.x,foot,h*.25,h*.04,0,0,7);x.fill();
      if(s.top){const o=s===S.A?S.B:S.A;s.x+=((o.x+(s.side==="A"?-46:46))-s.x)*.2;}
      x.save();
      if(s.gnd&&!s.ko){/* v1.91.63 (Man): a real throw — she is lifted off her feet, flipped through the air and slammed down (dust, shake, thud) */
        const TH0=s.th||{st:"hip",grab:0,imp:380},te=s.throwT?t-s.throwT:1e9,sg=flip?1:-1,fin=s.lieAng??(sg*Math.PI/2),big=s.thrownBy===3;
        if(TH0.st==="suplex2"&&TH0.by&&te<TH0.imp){const A=TH0.by,X=A.sx||{dir:1},d=X.dir;
          if(te>=TH0.grab){/* carried: her waist rides the thrower's arms as the thrower arches back */const ra=-d*supArch(te)*.9,r=-d*supArch(te)*1.9,hx=A.x+Math.sin(ra)*h*.3*-1*-1,hy=foot-Math.cos(ra)*h*.3,ox=d*h*.2,oy=-h*.12,px=hx+ox*Math.cos(r)-oy*Math.sin(r),py=hy+ox*Math.sin(r)+oy*Math.cos(r);
            x.translate(px,py);x.rotate(r);x.translate(-s.x,-(foot-h*.38));}}
        else if(TH0.st==="suplex2"&&TH0.by&&!s.slam){/* landed behind the thrower, head first */const A=TH0.by,X=A.sx||{dir:1},d=X.dir;s.base0=s.base0??s.base;s.x=A.x-d*h*.42;s.base=s.x;s.lieAng=-d*Math.PI/2;}
        if(TH0.st==="suplex2"&&TH0.by&&te<TH0.imp){}else if(te<TH0.imp){const o=s===S.A?S.B:S.A,tw=o?Math.sign(o.x-s.x)||-sg:-sg,gap=o?Math.abs(o.x-s.x):200;
          if(TH0.hide&&te>=TH0.grab){x.restore();continue;}
          if(te<TH0.grab){/* still on her feet until the thrower's hands land */x.translate(s.x+tw*Math.min(14,te/20),foot);x.translate(-s.x,-foot);}
          else{const p=Math.min(1,(te-TH0.grab)/Math.max(60,TH0.imp-TH0.grab)),ease=p*p*(3-2*p),st=TH0.st;let dx=0,lift=0,ang=0;
            if(st==="leg"){ang=fin*p*p;lift=Math.sin(p*Math.PI)*h*.12;dx=-tw*(30*p)*(1-p)*4*.5;}
            else if(st==="rana"){ang=-sg*Math.PI*1.5*ease;lift=Math.sin(p*Math.PI)*h*.6;dx=tw*gap*.35*Math.sin(p*Math.PI);}
            else if(st==="ddt"){/* pitched forward and driven head-first into the mat */ang=-sg*Math.PI*1.5*Math.min(1,p*1.3);lift=Math.sin(Math.min(1,p*1.3)*Math.PI)*h*.18;dx=tw*14*Math.sin(p*Math.PI);}
            else if(st==="suplex"){/* hoisted and arched backward over the thrower */ang=(fin+sg*Math.PI*2)*ease;lift=Math.sin(p*Math.PI)*h*.8;dx=tw*gap*.7*Math.sin(p*Math.PI);}
            else if(st==="slam"){/* up overhead (first 60%), a beat at the top, then spiked straight down */const up=Math.min(1,p/.6),dn=p<.6?0:(p-.6)/.4;lift=h*(big?.95:.8)*(Math.sin(up*Math.PI/2))*(1-dn*dn);ang=fin*Math.min(1,up*1.1)+(big?sg*Math.PI*2*dn:0);dx=tw*gap*.3*(1-dn)*up;}
            else{ang=fin*ease+(big?sg*Math.PI*2*ease:0);lift=Math.sin(p*Math.PI)*h*(big?.75:.55);dx=tw*gap*.55*Math.sin(p*Math.PI);}
            x.translate(s.x+dx,foot-lift);x.rotate(ang);x.translate(-s.x,-foot+h*.02*Math.min(1,p*1.5));}}
        else{if(!s.slam&&s.throwT){s.slam=true;const big=s.thrownBy===3;S.shake=big?28:18;S.fx.push({dust:1,x:s.x,y:foot,t0:t,big});S.fx.push({x:s.x,y:foot-h*.35,t0:t,txt:big?"SLAM!!":"SLAM!",big:true});if(big){S.flashAt=t;S.flashCol="#ff2040";S.fx.push({crack:1,x:s.x,y:foot,t0:t,seed:Math.random()*99});}if(typeof AU!=="undefined"&&AU.sfx)AU.sfx("kd");}
          x.translate(s.x,foot);x.rotate(fin);x.translate(-s.x,-foot+h*.02);}}
      else if(s.top&&!s.win){x.translate(0,h*.13);}
      if(s.ko||(s.down&&t-s.down<1300)){const k=s.ko?1:Math.max(0,1-Math.max(0,t-s.down-700)/600);x.translate(s.x,foot);x.rotate((flip?1:-1)*Math.PI/2*Math.min(1,(t-s.down)/220)*k);x.translate(-s.x,-foot);}
      x.imageSmoothingEnabled=true;drawFrame(x,sheetFor(s.f),ROW[row],col,s.x,foot,h,flip);
      if(t-s.flash<140){x.globalCompositeOperation="source-atop";}
      x.restore();
      if(t-s.flash<120){x.save();x.globalAlpha=.55;x.globalCompositeOperation="lighter";drawFrame(x,sheetFor(s.f),ROW[row],col,s.x,foot,h,flip);x.restore();}
      if(s.tap&&t-s.tap<2400){for(let i=0;i<3;i++){const ph=(t-s.tap)/180+i;if(Math.floor(ph)%2)continue;x.save();x.font=`700 ${Math.round(h*.13)}px "Chakra Petch",sans-serif`;x.textAlign="center";x.fillStyle="#ffffff";x.strokeStyle="#1b1230";x.lineWidth=5;
        const tx=s.x+(flip?-1:1)*h*(.2+i*.12),ty=foot-h*(.3+i*.08);x.strokeText("TAP!",tx,ty);x.fillText("TAP!",tx,ty);x.restore();}}
      if(s.ko){for(let i=0;i<3;i++){const a=t/300+i*2.1;x.fillStyle="#ffe36b";x.fillRect(s.x+Math.cos(a)*30-3+(flip?20:-20),foot-60+Math.sin(a)*8,6,6);}}
    }x.shadowBlur=0;
    // effects
    S.fx=S.fx.filter(f=>t-f.t0<(f.petal?2200:900));
    for(const f of S.fx){const k=(t-f.t0)/900;if(k<0)continue;
      if(f.petal){const e=(t-f.t0)/2200;x.save();for(let i=0;i<26;i++){const px=((i*97)%W)+Math.sin(e*6+i)*30,py=-20+((e*1.3+i*.071)%1.1)*H,r=6+(i%3)*2;x.globalAlpha=Math.max(0,1-e)*.9;x.fillStyle=i%3?f.col:"#ffe9a8";x.save();x.translate(px,py);x.rotate(e*4+i);x.beginPath();x.ellipse(0,0,r,r*.45,0,0,7);x.fill();x.restore();}x.restore();continue;}
      if(f.burst){x.save();x.globalCompositeOperation="lighter";for(let i=0;i<f.n;i++){const a=i/f.n*6.283+(i%3)*.4,d=(30+(i*37%60))*f.sp*(.3+k*2.2),sz=(9-k*8)*(i%2?1:.6)+1;x.globalAlpha=Math.max(0,1-k*1.3);x.fillStyle=i%3?f.col:"#ffffff";
          x.save();x.translate(f.x+Math.cos(a)*d,f.y+Math.sin(a)*d*.8);x.rotate(a);x.fillRect(-sz*1.8,-sz/2,sz*3.6,sz);x.restore();}x.restore();continue;}
      if(f.dust){x.save();for(let i=0;i<(f.big?14:9);i++){const sd=i%2?1:-1,d=(20+i*11)*(.3+k*1.4)*(f.big?1.4:1),r=(10+i%4*5)*(.6+k)*(f.big?1.3:1);x.globalAlpha=Math.max(0,.75-k*.9);x.fillStyle=i%3?"#c9b39a":"#e8dccb";x.beginPath();x.arc(f.x+sd*d,f.y-6-k*20*(i%3),r,0,7);x.fill();}x.restore();continue;}
      if(f.crack){x.save();x.globalAlpha=Math.max(0,1-k);x.strokeStyle="#1a0006";x.lineWidth=5;x.lineCap="round";let r=f.seed;const rnd=()=>{r=(r*9301+49297)%233280;return r/233280;};
        for(let i=0;i<7;i++){let px=f.x,py=f.y;const a=(i/7)*Math.PI+Math.PI*1.0+(rnd()-.5)*.3,len=60+rnd()*90;x.beginPath();x.moveTo(px,py);for(let j=0;j<4;j++){px+=Math.cos(a)*len/4*(i<3||i>4?1.6:1)+(rnd()-.5)*14;py+=Math.abs(Math.sin(a))*len/16+(rnd()-.5)*5;x.lineTo(px,py);}x.stroke();}
        x.strokeStyle="rgba(255,40,60,.8)";x.lineWidth=2;x.stroke();x.restore();continue;}
      if(f.ring){x.save();x.globalAlpha=Math.max(0,1-k*1.4);x.strokeStyle=f.col;x.lineWidth=16*(1-k)+3;x.beginPath();x.arc(f.x,f.y,30+k*170,0,7);x.stroke();
        x.strokeStyle="#ffffff";x.lineWidth=3;x.beginPath();x.arc(f.x,f.y,18+k*110,0,7);x.stroke();for(let i=0;i<12;i++){const a=i/12*6.283;x.fillStyle="#fff3a6";x.fillRect(f.x+Math.cos(a)*(40+k*150)-3,f.y+Math.sin(a)*(40+k*150)-3,6,6);}x.restore();continue;}
      x.save();x.globalAlpha=1-k;x.translate(f.x,f.y-40*k);
      if(!f.miss){x.fillStyle=f.cut?"#ff4b5c":"#fff3a6";for(let i=0;i<8;i++){const a=i/8*6.283;x.fillRect(Math.cos(a)*(14+40*k)-3,Math.sin(a)*(14+40*k)-3,6,6);}}
      x.font=`700 ${f.big?34:24}px "Pixelify Sans","Chakra Petch",sans-serif`;x.textAlign="center";x.lineWidth=6;x.strokeStyle="#1b1230";x.strokeText(f.txt,0,-24);x.fillStyle=f.heal?"#7dffae":f.miss?"#bfe3ff":f.cut?"#ff8a97":"#ffe36b";x.fillText(f.txt,0,-24);x.restore();}
    if(S.flashAt&&t-S.flashAt<(S.flashCol?170:110)){const L=S.flashCol?170:110;x.save();x.globalAlpha=(S.flashCol?.5:.28)*(1-(t-S.flashAt)/L);x.fillStyle=S.flashCol&&t-S.flashAt<60?"#ffffff":(S.flashCol||"#ffffff");x.fillRect(0,0,W,H);x.restore();}
    if(S.flashCol&&t-S.flashAt>=170)S.flashCol=null;
    if(S.banner){const k=(t-S.banner.t0)/1600;if(k>=1)S.banner=null;else{x.save();x.globalAlpha=k<.12?k/.12:k>.8?(1-k)/.2:1;const y=H*.29,pop=1+Math.max(0,.25-k)*.8;
      x.translate(W/2,y);x.scale(pop,pop);const bt=S.banner.tier||1;if(bt===3&&Math.random()<.25)x.translate((Math.random()-.5)*6,(Math.random()-.5)*4);
      x.fillStyle=bt===3?"rgba(10,0,4,.9)":S.banner.side==="A"?"rgba(150,20,40,.75)":"rgba(40,20,120,.75)";x.fillRect(-W*.38,-H*.1,W*.76,H*.2);x.fillStyle=bt===3?"#ff1838":bt===2?"#ffe680":"#ffd34a";const bw=bt>1?5:3;x.fillRect(-W*.38,-H*.1,W*.76,bw);x.fillRect(-W*.38,H*.1-bw,W*.76,bw);
      if(bt===3){x.fillStyle="rgba(255,20,50,.35)";x.fillRect(-W*.38,-H*.1,W*.76*Math.min(1,k*6),H*.2);}
      x.font=`700 ${Math.round(H*.05)}px "Chakra Petch",sans-serif`;x.textAlign="center";x.textBaseline="middle";x.fillStyle=bt===3?"#ff6070":"#ffe9a0";x.fillText(S.banner.head||"SPECIAL MOVE!",0,-H*.05);
      x.font=`700 ${Math.round(H*(S.banner.txt.length>12?.075:.09))}px "Chakra Petch",sans-serif`;x.lineWidth=8;x.strokeStyle=bt===3?"#5a0010":"#1b1230";x.strokeText(S.banner.txt,0,H*.035);if(bt===3){x.fillStyle="rgba(255,0,40,.8)";x.fillText(S.banner.txt,-4,H*.035);}x.fillStyle="#ffffff";x.fillText(S.banner.txt,0,H*.035);x.restore();}}
    x.restore();}
};

// ---------- v1.19 CAMP ACTIVITY SCENES (short animated vignette before the result) ----------
const CFX={
  merit:{bg:"bg_temple.webp",tint:"rgba(255,150,60,.18)",cap:"At dawn, everyone gets up to give alms in front of the camp",monks:true,fx:"rice",kneel:true},
  rest:{bg:"bg_river.webp",tint:"rgba(20,30,70,.35)",cap:"Camp day off, lounging by the river, no training",fx:"z",row:"idle"},
  class:{bg:"gym",cap:"Sunday class, the yard full of students",students:3,row:"punch",fx:"stars"},
  promo:{bg:"gym",cap:"Live-streaming camp promo online",phone:true,row:"win",fx:"hearts"},
  repair:{bg:"gym",cap:"Repairing the camp together, fresh paint",walk:true,fx:"sparks",planks:true},
  clip:{bg:"gym",cap:"Post training clips on social",camera:true,row:"knee",fx:"flash"},
  spar:{bg:"gym",cap:"In-camp sparring",spar:true,fx:"stars"},
  ladies:{bg:"gym",cap:"Women's Muay Thai fitness class",students:4,row:"guard",fx:"hearts"},
  massage:{bg:"gym",tint:"rgba(80,40,20,.25)",cap:"A Thai masseuse loosens everyone up",masseuse:true,row:"idle",fx:"steam"},
  media:{bg:"gym",cap:"Press filming a feature on Sirichai",camera:true,crew:true,row:"win",fx:"flash"},
  kids:{bg:"gym",cap:"Kids' class, everyone doing the wai khru in unison",students:4,row:"guard",fx:"hearts"},
  stall:{bg:"bg_camp.webp",tint:"rgba(255,160,60,.15)",cap:"Khanom khrok stall at the market, smelling up the whole street",students:3,row:"idle",fx:"steam"},
  tourist:{bg:"gym",cap:"Tourists try kicking pads for the first time",students:3,row:"knee",fx:"flash",camera:true},
  trail:{bg:"bg_river.webp",tint:"rgba(40,90,40,.2)",cap:"Dawn trail run up the mountain",walk:true,fx:"sparks"},
  tape:{bg:"gym",tint:"rgba(10,10,40,.55)",cap:"Old fight-tape night, noting opponent weaknesses",camera:true,row:"idle",fx:"flash"},
  fightnight:{bg:"bg_camp.webp",tint:"rgba(80,20,60,.25)",cap:"Camp fight night, packed ringside",spar:true,fx:"hearts"},
  clinicday:{bg:"gym",tint:"rgba(40,120,120,.18)",cap:"Recovery day at the physio clinic",masseuse:true,row:"idle",fx:"steam"},
  waikhru:{bg:"bg_temple.webp",tint:"rgba(255,180,80,.2)",cap:"Wai khru ceremony at the shrine",kneel:true,fx:"rice"},
  // v1.82.5: special investments get their own scene too
  master:{bg:"bg_temple.webp",tint:"rgba(255,170,70,.22)",cap:"An old-school master teaches in the camp yard",elder:true,row:"knee",fx:"stars"},
  hostshow:{bg:"bg_camp.webp",tint:"rgba(60,20,70,.3)",cap:"Fight night at Sirichai Gym, the yard packed with fans",spar:true,crowd:true,fx:"flash"},
};
function cfxRoster(){if(G&&typeof UI!=="undefined"&&UI.cfxIds&&UI.cfxIds.length)return UI.cfxIds.map(id=>G.F[id]).filter(Boolean);return (G?Object.values(G.F).filter(f=>f.camp==="player"):[]).slice(0,3);}
const MONK_PX=["......kkkkk.......", ".....ksssssk......", "....kssssssdk.....", "....ksesssesk.....", "....kssssssdk.....", "....kdssmssdk.....", ".....kddssdk......", "......kkddk.......", ".....kOoookkk.....", "....kOoohoosdk....", "...kOoohoooossk...", "...kOohooooosdk...", "...kOohoookkkkk...", "...kOhoookBBBBBk..", "...kOhooksbbbbbk..", "...kOooooksbbbk...", "...kOooooookkkk...", "...kOoooohoooOk...", "...kOoooohoooOk...", "...kOooohooooOk...", "...kOooohooooOk...", "...kOoohoooooOk...", "...kOoohoooooOk...", "...kOohooooooOk...", "...kOOooooooOOk...", "....kOOOOOOOOk....", "....kdsk..kdsk....", "....kssk..kssk....", "...kkkkk..kkkkk..."];
const MONK_PAL={k:"#3a2014",s:"#d9a27b",d:"#b07a55",e:"#2a1a10",m:"#965040",O:"#c25e10",o:"#e8892a",h:"#f6b45a",b:"#2b2530",B:"#6e6478"};
function drawMonk(x,cx,y,t,i,sc,right){const bob=Math.floor(t/300+i)%2,H=MONK_PX.length,W=MONK_PX[0].length;x.save();x.translate(Math.round(cx),Math.round(y));x.scale(right?sc:-sc,sc);
  MONK_PX.forEach((r,yy)=>{for(let xx=0;xx<W;xx++){const c=MONK_PAL[r[xx]];if(!c)continue;x.fillStyle=c;x.fillRect(xx-W/2,yy-H+(yy<26?-bob:0),1.04,1.04);}});x.restore();}
function drawStudentNpc(x,id,cx,fy,h,row,t,flip){drawFrame(x,sheetFor({id,canon:false}),ROW[row],Math.floor(t/170)%4,cx,fy,h,flip);}
function drawCampFx(x,k,t){const C=CFX[k]||CFX.rest,W=x.canvas.width,H=x.canvas.height;x.imageSmoothingEnabled=false;
  const bgn=C.bg==="gym"?gymBg():C.bg;const bg=img(bgn);x.fillStyle="#1a1428";x.fillRect(0,0,W,H);
  if(bg.complete&&bg.naturalWidth){const s=Math.max(W/bg.naturalWidth,H/bg.naturalHeight);const w=bg.naturalWidth*s,h=bg.naturalHeight*s;x.imageSmoothingEnabled=true;x.drawImage(bg,(W-w)/2,(H-h)/2,w,h);x.imageSmoothingEnabled=false;}
  if(C.tint){x.fillStyle=C.tint;x.fillRect(0,0,W,H);}
  x.fillStyle="rgba(0,0,0,.28)";x.fillRect(0,H*.78,W,H*.22);
  const R=cfxRoster(),fy=H*.94,fh=H*.62;const P=(a,b,w,h,c)=>{x.fillStyle=c;x.fillRect(Math.round(a),Math.round(b),w,h);};
  if(C.students)for(let i=0;i<C.students;i++){const sx=W*(.52+i*.12),sy=fy-6+(i%2)*6;drawStudentNpc(x,"stu"+i+k,sx,sy,fh*.78,Math.floor(t/1400+i)%2?C.row:"guard",t+i*90,true);}
  if(C.masseuse)drawStudentNpc(x,"masseuse",W*.72,fy,fh*.9,"idle",t,true);
  if(C.elder){drawStudentNpc(x,"oldmaster",W*.7,fy,fh*.95,Math.floor(t/1300)%2?"knee":"guard",t,true);}
  if(C.crew){drawStudentNpc(x,"crew1",W*.84,fy,fh*.85,"idle",t,true);}
  if(C.monks)for(let i=0;i<3;i++){const mx=-40+((t/22)+i*70)%(W+160);drawMonk(x,mx,fy-fh*.1,t,i,fh*.7/29,true);} // v1.38: monks walk behind, left to right
  if(C.spar&&R.length){const a=R[0],b=R[1]||{id:"sparnpc",canon:false};const ph=Math.floor(t/900)%2;
    drawFrame(x,sheetFor(a),ROW[ph?"punch":"guard"],Math.floor(t/150)%4,W*.4,fy,fh,false);drawFrame(x,sheetFor(b),ROW[ph?"guard":"knee"],Math.floor(t/150)%4,W*.6,fy,fh,true);}
  else R.forEach((f,i)=>{let cx=W*(C.students||C.masseuse||C.crew?.16+i*.14:(.3+i*.2)),row=C.row||"idle";
    if(C.walk){const span=W*.5;cx=W*.15+((t/18+i*span/3)%span);row="walk";}
    if(C.kneel){cx=W*(.18+i*.13);row="idle";}
    drawFrame(x,sheetFor(f),ROW[row],Math.floor(t/(row==="idle"?260:150))%4,cx,C.kneel?fy+fh*.12:fy,C.kneel?fh*.88:fh,false);});
  if(C.crowd)for(let i=0;i<16;i++){const cx=(i+.5)*W/16,hop=Math.floor(t/260+i*1.7)%3===0?3:0,cy=H*.9-hop+(i%2)*4;
    P(cx-7,cy,14,H*.12,["#2b2238","#352a44","#241d30"][i%3]);P(cx-5,cy-10,10,10,["#3b2f4a","#2e2539","#43354f"][i%3]);if(hop&&i%4===0)P(cx+6,cy-14,3,10,"#3b2f4a");}
  if(C.planks){P(W*.7,fy-40,46,6,"#8a5a32");P(W*.7,fy-30,46,6,"#a06a3a");P(W*.72,fy-46,4,40,"#5a3a22");P(W*.82,fy-46,4,40,"#5a3a22");}
  if(C.phone){const px=W*.78,py=H*.18;P(px,py,44,74,"#111");P(px+3,py+6,38,58,"#2c5fb3");P(px+5,py+8,34,10,"#e23b4e");x.fillStyle="#fff";x.font="bold 8px sans-serif";x.fillText("LIVE",px+12,py+16);
    for(let i=0;i<3;i++)P(px+6,py+24+i*12,26-i*6,6,"rgba(255,255,255,.6)");}
  if(C.camera){const cx=W*.82,cy=fy-fh*.55;P(cx-4,cy+16,4,fh*.55-14,"#333");P(cx+14,cy+16,4,fh*.55-14,"#333");P(cx-8,cy,32,18,"#1f1f24");P(cx+20,cy+4,10,10,"#4a4a55");P(cx+22,cy+6,6,6,"#9fd6ff");
    if(Math.floor(t/400)%2){P(cx-4,cy+3,4,4,"#e23b4e");}}
  // particles
  const n=14;for(let i=0;i<n;i++){const ph=((t/1000)+i/n)%1,sx=(i*97%W),bx=W*(.15+((i*37)%60)/100);
    if(C.fx==="z"){x.globalAlpha=1-ph;x.fillStyle="#cfe2ff";x.font=`bold ${10+ph*8}px "Pixelify Sans",sans-serif`;x.fillText("z",bx+ph*12,fy-fh-ph*40);x.globalAlpha=1;}
    if(C.fx==="hearts"){x.globalAlpha=1-ph;P(sx,H*.7-ph*H*.6,4,3,"#ff6a8a");P(sx-2,H*.7-ph*H*.6+2,8,3,"#ff6a8a");P(sx,H*.7-ph*H*.6+5,4,2,"#ff6a8a");x.globalAlpha=1;}
    if(C.fx==="sparks"&&i<8){const a=i*.8+t/300;x.globalAlpha=1-ph;P(W*.74+Math.cos(a)*ph*24,fy-46+Math.sin(a)*ph*18,2,2,"#ffd34a");x.globalAlpha=1;}
    if(C.fx==="stars"&&i<6&&Math.floor(t/450+i)%3===0){P(W*(.45+((i*13)%20)/100),fy-fh*.6+((i*29)%30),3,3,"#fff6a0");}
    if(C.fx==="steam"){x.globalAlpha=.5*(1-ph);P(bx,fy-fh*.4-ph*50,3,3,"#fff");x.globalAlpha=1;}
    if(C.fx==="rice"&&i<6){const mx=W+40-((t/22))%(W+160);if(mx<W*.6&&mx>W*.1){x.globalAlpha=1-ph;P(mx-10+i*3,fy-fh*.55+ph*20,2,2,"#fff");x.globalAlpha=1;}}}
  if(C.fx==="flash"&&Math.floor(t/700)%4===0){x.fillStyle="rgba(255,255,255,.35)";x.fillRect(0,0,W,H);}
}
function mountCampFx(){document.querySelectorAll("canvas[data-campfx]").forEach(cv=>{const x=cv.getContext("2d");const k=cv.dataset.campfx;const t0=performance.now();
  LOOPS.add(t=>{if(!cv.isConnected)return;drawCampFx(x,k,t-t0+400);});});}
// ===== v1.86: camp beauty contest scenes =====
const NAI_LOOK={kind:"manager",gender:"m",hairStyle:"crop",hair:"#8e939c",skin:"#b97d55",eyes:"#3a2a24",outfit:"polo",outfitColor:"#c4a57a",pantsColor:"#b0926a",stache:"#5d6068",epaulet:"#e0b41b"};
const AIDE_LOOK={kind:"manager",gender:"m",hairStyle:"crop",hair:"#2b2530",skin:"#d9a27b",eyes:"#3a2a24",outfit:"tee",outfitColor:"#f2f2f2",pantsColor:"#1f1f24",glasses:"glasses"};
const AIDE2_LOOK={...AIDE_LOOK,gender:"f",hairStyle:"bob",hair:"#3a2a24",skin:"#eec1a0",glasses:"none",outfitColor:"#f4f1ea",pantsColor:"#2c3a5a"};
const CT_SPOT={gate:[34,152],bags:[134,128],tree:[176,118],ring:[214,136],vehicle:[262,174],track:[110,176],clean:[70,160]};
const CT_STEP=2600,CT_WALK=1000,CT_START=700;
function ctChib(ctx,S,look,key,x,y,sc,flip,dy){const c=chibiCache(look,key+(dy||0),{dy:dy||0});ctx.save();ctx.imageSmoothingEnabled=false;
  if(flip){ctx.translate((x+24*sc)*S,0);ctx.scale(-1,1);ctx.drawImage(c,0,y*S,24*S*sc,32*S*sc);}else ctx.drawImage(c,x*S,y*S,24*S*sc,32*S*sc);ctx.restore();}
function ctBubble(ctx,S,x,y,txt,hi){ctx.save();ctx.font=`700 ${8*S}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;const w=ctx.measureText(txt).width/S+10,W=ctx.canvas.width/S;
  const bx=Math.max(2,Math.min(W-w-2,x-w/2)),by=y-16;ctx.fillStyle="#1b1230";ctx.fillRect((bx-1)*S,(by-1)*S,(w+2)*S,14*S);ctx.fillStyle=hi?"#ffe58a":"#ffffff";ctx.fillRect(bx*S,by*S,w*S,12*S);
  ctx.fillRect((x-2)*S,(by+12)*S,4*S,3*S);ctx.fillStyle="#1b1230";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(txt,(bx+w/2)*S,(by+6.5)*S);ctx.restore();}
function ctVerdict(v){return v>=10?"A perfect 10!!":v>=8?"Very good!":v>=6?"Not bad":v>=4?"Passable":"Hmm…";}
/* the chief walks the real camp (with the player's own decorations), stopping at each judged area */
function drawContestWalk(ctx,G,t,R){drawCamp(ctx,G,t);const S=2,A=R.areas;let x=-20,y=160,flip=false,moving=true,say=null,hi=false;
  const pts=A.map(a=>CT_SPOT[a.k]||[160,160]);
  if(t<CT_START){x=-20+(t/CT_START)*(pts[0][0]+20)*.4;y=pts[0][1];}
  else{const i=Math.min(A.length,Math.floor((t-CT_START)/CT_STEP)),ph=(t-CT_START)-i*CT_STEP;
    if(i>=A.length){x=150;y=158;moving=false;say=`Total ${R.total}/70 · Results at the district office!`;hi=true;}
    else{const from=i?pts[i-1]:[-20*.6+pts[0][0]*.4,pts[0][1]],to=pts[i],k=Math.min(1,ph/CT_WALK);x=from[0]+(to[0]-from[0])*k;y=from[1]+(to[1]-from[1])*k;flip=to[0]<from[0];moving=k<1;
      if(!moving){const a=A[i];say=`${a.n} ${a.score}/10 ${ctVerdict(a.score)}`;hi=a.score>=10||a.match;
        if(a.match&&Math.floor(t/180)%2){const c=COLOR_HEX[R.color]||"#fff";for(let s=0;s<6;s++){const ang=s*1.05+t/400;ctx.fillStyle=c;ctx.fillRect((to[0]+12+Math.cos(ang)*14)*S,(to[1]-6+Math.sin(ang)*10)*S,2*S,2*S);}}}}}
  const bob=moving?Math.floor(t/130)%2:Math.floor(t/520)%2;
  // aide trails a step behind, clipboard in hand
  ctChib(ctx,S,AIDE_LOOK,"aide",x-16*(flip?-1:1),y+2,.8,flip,bob);ctx.fillStyle="#8a5a32";ctx.fillRect((x-16*(flip?-1:1)+14)*S,(y+16)*S,5*S,7*S);ctx.fillStyle="#f4f1ea";ctx.fillRect((x-16*(flip?-1:1)+15)*S,(y+17)*S,3*S,5*S);
  ctChib(ctx,S,NAI_LOOK,"nai",x,y,.95,flip,bob);
  if(say)ctBubble(ctx,S,x+11,y-2,say,hi);}
/* results night at the district office: stage, chief and aides, managers of every camp below; fireworks if we win */
function drawContestAward(ctx,G,t,R){const S=2,P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)*S,Math.round(y)*S,Math.round(w)*S,Math.round(h)*S);};ctx.imageSmoothingEnabled=false;
  ["#140f2a","#1d1538","#291c48","#3a2456","#4a2b5e"].forEach((c,i)=>P(0,i*22,320,22,c));for(let i=0;i<30;i++){const sx=(i*53)%320,sy=(i*29)%90;if((Math.floor(t/500)+i)%4)P(sx,sy,1,1,"#efe6ff");}
  P(0,110,320,70,"#3a2b3a");for(let i=0;i<40;i++)P((i*37)%320,112+(i*13)%66,2,1,"#47364a");
  // district office building + stage
  P(40,14,240,74,"#d9cdb4");P(40,14,240,4,"#b8ab92");for(let i=0;i<6;i++)P(56+i*38,56,18,22,"#6f6a7a");P(150,6,20,9,"#c8283c");
  P(64,20,192,22,"#a8202f");P(64,20,192,2,"#f2c14e");P(64,40,192,2,"#f2c14e");
  ctx.save();ctx.font=`700 ${9*S}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;ctx.fillStyle="#ffe58a";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(`Camp Beauty Contest, Year ${R.season} · District Office`,160*S,31*S);ctx.restore();
  P(56,96,208,16,"#6a4a32");P(56,96,208,3,"#8a6a4a");for(let i=0;i<13;i++)P(58+i*16,100,8,12,i%2?"#c8283c":"#f2f2f2");
  for(let i=0;i<24;i++){const on=(Math.floor(t/350)+i)%3;P(50+i*9.5,47+Math.sin(i/2)*2,2,2,["#ffd36b","#ff7b8a","#8ad7ff"][on]);}
  const bob=k=>Math.floor(t/520+k)%2;
  ctChib(ctx,S,AIDE_LOOK,"aideA",112,68,.9,false,bob(1));ctChib(ctx,S,AIDE2_LOOK,"aideB",188,68,.9,true,bob(2));ctChib(ctx,S,NAI_LOOK,"naiA",148,64,1.05,false,bob(0));
  // trophy table
  P(206,84,22,12,"#5a3a22");P(212,74,10,10,"#f2c14e");P(214,70,6,4,"#f2c14e");P(215,84,4,2,"#d9a520");
  // crowd of camp managers (ours wears the player's look)
  const field=R.field,phase=t<1600?0:t<4200?1:t<6800?2:3,win=R.rank===1;
  const crowd=[];for(let i=0;i<9;i++){const r=mulberry32(900+i);crowd.push({x:22+i*32+(i%2)*6,y:136+(i%2)*10,look:{kind:"manager",gender:r()<.5?"m":"f",hairStyle:["crop","bob","pony","long"][Math.floor(r()*4)],hair:["#2b2530","#5a3a2a","#a0663a","#c9ced8"][Math.floor(r()*4)],skin:["#f6d7c3","#eec1a0","#d9a27b","#b97d55"][Math.floor(r()*4)],eyes:"#3a2a24",outfit:["tee","polo","suit","hoodie"][Math.floor(r()*4)],outfitColor:["#c8283c","#2c5fb3","#2f8a4f","#e0a91b","#6a3fa0","#f2f2f2"][Math.floor(r()*6)],pantsColor:"#1f1f24"}});}
  const meI=4;crowd.forEach((c,i)=>{const me=i===meI,jump=phase===3&&(me?win:!win&&i%3===0)?(Math.floor(t/180+i)%2?-4:0):0;
    ctChib(ctx,S,me&&G.avatar?{...G.avatar}:c.look,"crowd"+i+(me?"me":""),c.x,c.y+jump,.9,i>meI,bob(i));});
  {const c=crowd[meI];P(c.x+8,c.y-10,6,4,"#ffe58a");P(c.x+10,c.y-6,2,3,"#ffe58a");}
  const nm=k=>field[k]?`${field[k].name} (${field[k].score})`:"";
  const line=phase===0?"Here are this year's Camp Beauty Contest results!":phase===1?`3rd place … ${nm(2)}`:phase===2?`2nd place … ${nm(1)}`:`Winner … ${nm(0)}!!`;
  ctBubble(ctx,S,160,60,line,phase===3);
  if(phase===3&&win){// fireworks
    for(let b=0;b<5;b++){const per=1150,tt=(t-6800+b*230)%per,cyc=Math.floor((t-6800+b*230)/per),rr=mulberry32(b*97+cyc*13),cx=30+rr()*260,cy=14+rr()*50,col=["#ffd36b","#ff7b8a","#8ad7ff","#9dff8a","#f2a0ff"][(b+cyc)%5];
      if(tt<300){P(cx,cy+60-tt/5,1,3,"#fff3c4");}else{const k=(tt-300)/(per-300);ctx.globalAlpha=Math.max(0,1-k);for(let s=0;s<12;s++){const a=s/12*Math.PI*2;P(cx+Math.cos(a)*k*26,cy+Math.sin(a)*k*20+k*k*8,2,2,col);}ctx.globalAlpha=1;}}
    for(let i=0;i<24;i++){const ph=((t/1600)+i/24)%1;P((i*41+Math.sin(t/300+i)*6)%320,ph*180,2,3,["#ffd36b","#ff7b8a","#8ad7ff","#9dff8a"][i%4]);}}}
// ===== v1.90: annual wai kru — altar with Grandpa Chai's photo, candles and incense; the camp kneels, bows three times, Kru Daeng crowns each fighter =====
const WK_TL=n=>{const t1=1500,t2=t1+1500,t3=t2+3*1000,t4=t3+Math.max(1,n)*1100;return {t1,t2,t3,t4,end:t4+900};};
function drawWaiKhru(ctx,G,t,R){const S=2,W=320,H=180,P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*S),Math.round(y*S),Math.max(1,Math.round(w*S)),Math.max(1,Math.round(h*S)));};
  ctx.imageSmoothingEnabled=false;const T=WK_TL(R.ids.length);
  // hall: warm wall, wooden floor, the ring rope behind
  P(0,0,W,H,"#2a1a22");for(let i=0;i<8;i++)P(i*40,0,38,112,i%2?"#3a2530":"#36222c");P(0,112,W,68,"#5a3a26");for(let i=0;i<12;i++)P(0,116+i*6,W,1,"rgba(0,0,0,.18)");
  P(0,96,W,2,"#c8283c");P(0,102,W,2,"#e8e2d6");
  // altar shelf, Grandpa Chai's photo, mongkol on its stand, phan of flowers, two candles
  const ax=246;P(ax-58,58,116,6,"#7a4a26");P(ax-54,64,4,32,"#5a3420");P(ax+50,64,4,32,"#5a3420");P(ax-60,56,120,3,"#a0683a");
  P(ax-13,22,26,32,"#c9a14a");P(ax-11,24,22,28,"#3a2c26");P(ax-6,30,12,12,"#b97d55");P(ax-7,28,14,4,"#c9ced8");P(ax-5,42,10,8,"#c8283c");
  const glowT=Math.min(1,t/T.t1);
  [[-34,0],[34,0]].forEach(([dx])=>{P(ax+dx-2,44,4,12,"#f4ead2");if(t>200){const fl=Math.floor(t/120)%2;ctx.globalAlpha=glowT;P(ax+dx-1,40-fl,2,4,"#ffd36b");P(ax+dx,38-fl,1,2,"#fff3c4");ctx.globalAlpha=glowT*.18;P(ax+dx-10,30,20,20,"#ffcf6b");ctx.globalAlpha=1;}});
  P(ax-24,50,14,6,"#e0b41b");P(ax-22,44,10,6,"#f4f1ea");P(ax-20,42,6,3,"#ffe27a");P(ax+12,50,14,6,"#e0b41b");P(ax+13,44,12,6,"#f2a640");P(ax+15,42,8,3,"#ff8a3a");
  P(ax-4,50,8,6,"#7a4a26");P(ax-3,47,6,3,"#e8e2d6");P(ax-2,46,4,1,"#c8283c");
  // incense: three sticks, smoke curls upward once lit
  for(let i=0;i<3;i++){P(ax-2+i*2,48-6,1,6,"#8a5a32");if(t>600){for(let k=0;k<5;k++){const ph=((t/1400)+k/5+i*.13)%1;ctx.globalAlpha=(1-ph)*.45*glowT;P(ax-2+i*2+Math.sin(ph*6+i+t/500)*3,40-ph*34,2,2,"#d9d4e6");}ctx.globalAlpha=1;}}
  // fighters walk in, kneel on the mat facing the altar, bow three times; Kru Daeng walks the row with the mongkol
  const ids=R.ids.slice(0,6),n=ids.length,fy=H*.96,fh=H*.62,matY=H*.9,span=Math.min(.52,(n-1)*.2),pos=i=>W*(.14+(n>1?i*span/(n-1):0)+(n<4?.12:0));
  const crownAt=i=>T.t3+i*1100;
  ids.forEach((id,i)=>{const f=G.F[id];if(!f)return;const cx=pos(i),k=Math.min(1,Math.max(0,(t-T.t1)/(T.t2-T.t1))),face=1;
    let x=cx,row="idle",h=fh,y=fy,bow=0;const kneel=t>=T.t2;
    if(!kneel){x=-30+(cx+30)*k;row=k<1?"walk":"idle";}
    if(kneel&&t<T.t3){const ph=((t-T.t2)%1000)/1000;bow=ph<.4?ph/.4:ph<.7?1:1-(ph-.7)/.3;}
    const foot=kneel?y+h*.16:y;ctx.save();
    if(bow>0){const hx=x*S,hy=(foot-h*.42)*S;ctx.translate(hx,hy);ctx.rotate(face*bow*.5);ctx.translate(-hx,-hy);}
    drawFrame(ctx,sheetFor(f),ROW[row],Math.floor(t/(row==="idle"?260:150))%4,x*S,foot*S,h*S,face<0);ctx.restore();
    if(kneel&&t>crownAt(i)+600){const hy=foot-h*.8;P(x-7,hy,14,2,"#f4f1ea");P(x-7,hy+1,14,1,"#c8283c");P(x-1,hy-2,2,3,"#f4f1ea");}
    if(t>crownAt(i)&&t<crownAt(i)+1100&&R.krob.includes(id)){ctx.save();ctx.font=`700 ${7*S}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;ctx.fillStyle="#ffd36b";ctx.textAlign="center";ctx.fillText("Khrop khru",x*S,(foot-h-6)*S);ctx.restore();}});
  if(t>=T.t3&&t<T.t4+600){const i=Math.min(n-1,Math.floor((t-T.t3)/1100)),bob=Math.floor(t/300)%2,sc=1.7;
    ctChib(ctx,S,COACH_LOOK,"coachwk",pos(i)+14,matY-32*sc+3,sc,true,bob);}
  // the mat hides the folded legs
  P(0,matY,W,H-matY,"#7a2a2e");P(0,matY,W,2,"#a8443e");for(let i=0;i<16;i++)P(i*20+4,matY+6,12,1,"rgba(255,220,160,.25)");
  if(t>=T.t3&&t<T.t4){const i=Math.min(n-1,Math.floor((t-T.t3)/1100));if((t-T.t3)%1100<550)ctBubble(ctx,S,pos(i)+34,matY-58,"Phoo…",false);}
  // flower petals drift over the end
  if(t>T.t4-300)for(let i=0;i<18;i++){const ph=((t/2200)+i/18)%1;P((i*53+Math.sin(t/400+i)*6)%W,ph*H,2,2,["#ffe27a","#f4f1ea","#f2a640"][i%3]);}
  // warm vignette
  ctx.globalAlpha=.22;P(0,0,W,10,"#000");P(0,H-10,W,10,"#000");ctx.globalAlpha=1;}
function mountWaiKhru(){document.querySelectorAll("canvas[data-waikhru]").forEach(cv=>{const x=cv.getContext("2d");
  LOOPS.add(t=>{if(!cv.isConnected||!G)return;const R=(G.waikhru||{})[G.season||1];if(!R)return;let tt=t-(UI.wkT0||t);if(UI.wkSkip)tt+=60000;x.clearRect(0,0,cv.width,cv.height);drawWaiKhru(x,G,tt,R);});});}
/* v1.89.24: Loy Krathong night — the five girls float their krathongs off the pier, lanterns rise; then the player makes a wish */
const LW_TL=n=>{const k0=1400,gap=650;return {k0,gap,stand:k0+n*gap+900,cheer:k0+n*gap+2200,end:k0+n*gap+3000};};
function drawLoyWish(ctx,t,ids,tf){const S=2,W=320,H=180,P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x*S),Math.round(y*S),Math.max(1,Math.round(w*S)),Math.max(1,Math.round(h*S)));};
  const n=ids.length,T=LW_TL(n),bg=img("bg_loy_night.webp");
  ctx.imageSmoothingEnabled=true;if(bg.complete&&bg.naturalWidth)ctx.drawImage(bg,0,0,W*S,H*S);else P(0,0,W,H,"#1a1640");ctx.imageSmoothingEnabled=false;
  ctx.globalAlpha=Math.max(0,.55-t/2600);P(0,0,W,H,"#05040f");ctx.globalAlpha=1;
  // sky lanterns drifting up
  for(let i=0;i<16;i++){const ph=((t/11000)+i/16)%1,x=(i*41+Math.sin(t/1400+i)*5)%W,y=150-ph*165;ctx.globalAlpha=.22*(1-ph);P(x-3,y-3,8,9,"#ffb347");ctx.globalAlpha=.9*(1-ph*.6);P(x,y,3,4,"#ffcf6b");P(x+1,y+3,1,1,"#fff3c4");ctx.globalAlpha=1;}
  // the krathongs (drawn before the pier so they sit out on the water)
  const pos=i=>W*(.12+(n>1?i*.76/(n-1):.38));
  ids.forEach((id,i)=>{const sp=T.k0+i*T.gap+250;if(t<sp)return;const d=t-sp,x0=pos(i)+10,slide=Math.min(1,d/700),drift=Math.max(0,d-700)/1000;
    const y=140-slide*8-Math.min(26,drift*5),x=x0+slide*8+drift*6+Math.sin(drift*1.6+i)*2,sc=2.1*Math.max(.5,1-drift*.09);
    const w=12*sc,h=3*sc,fl=Math.floor(t/110+i)%2;
    ctx.globalAlpha=.18;P(x-1,y+h,2,8*sc,"#ffcf6b");{const g=ctx.createRadialGradient(x*S,(y-5*sc)*S,0,x*S,(y-5*sc)*S,9*sc*S);g.addColorStop(0,"rgba(255,190,90,.45)");g.addColorStop(1,"rgba(255,160,60,0)");ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect((x-9*sc)*S,(y-14*sc)*S,18*sc*S,18*sc*S);}ctx.globalAlpha=1;
    P(x-w/2,y,w,h,"#2f8f4a");P(x-w/2+1,y+h-1,w-2,1,"#1d6a36");
    for(let k=-1;k<=1;k++)P(x+k*4*sc-1.5*sc,y-3*sc+Math.abs(k)*sc,3*sc,3*sc,k?"#f06aa0":"#ff8fbd");
    P(x-.5,y-6*sc,1,3*sc,"#f4ead2");P(x-.5,y-7*sc-fl,1,1+fl,"#ffd36b");});
  // the wooden pier
  P(0,146,W,34,"#4a2e1c");P(0,146,W,2,"#7a4e30");for(let i=0;i<6;i++)P(0,152+i*5,W,1,"rgba(0,0,0,.22)");for(let i=0;i<9;i++)P(i*38+10,148,3,32,"rgba(0,0,0,.15)");
  // the girls: walk-in done, each kneels in turn, sets her krathong down, stands; all cheer at the end
  ids.forEach((id,i)=>{const sh=img(id+"_loykrathong_sheet.webp"),x=pos(i),h=H*.44,kA=T.k0+i*T.gap,kneel=t>=kA&&t<T.stand;
    let row="idle",foot=H*.97;if(kneel){row="guard";foot+=h*.08;}if(t>=T.cheer)row="win";
    drawFrame(ctx,sh,ROW[row],Math.floor(t/(row==="idle"?280:row==="win"?200:400))%4,x*S,foot*S,h*S,false,tf>=0?Math.max(0,1-tf/500):1);
    if(t>=T.cheer&&Math.floor((t-T.cheer)/400)%2===0)P(x+6,foot-h-6+((i%2)*2),3,3,"#ff8fbd");});
  // v1.89.25: after the wish — the manager's own krathong floats away under fireworks
  if(tf>=0){const k=Math.min(1,tf/3600),x=W*.5+k*16+Math.sin(tf/500)*2,y=166-k*52,u=Math.max(.9,2.2-k*1.3),fl=Math.floor(tf/110)%2;
    {const g=ctx.createRadialGradient(x*S,(y-9*u)*S,0,x*S,(y-9*u)*S,16*u*S);g.addColorStop(0,"rgba(255,205,110,.55)");g.addColorStop(1,"rgba(255,160,60,0)");ctx.fillStyle=g;ctx.fillRect((x-16*u)*S,(y-25*u)*S,32*u*S,32*u*S);}
    ctx.globalAlpha=.3;P(x-1*u,y+2*u,2*u,12*u,"#ffcf6b");P(x-3*u,y+4*u,6*u,1*u,"#ffcf6b");ctx.globalAlpha=1;
    P(x-8*u,y,16*u,2*u,"#1d6a36");P(x-7*u,y-1*u,14*u,1*u,"#2f8f4a");for(let i=-3;i<=3;i++)P(x+i*2*u-.5*u,y-2*u-(Math.abs(i)%2)*u,1*u,2*u,"#3fae5c");
    for(const [dx,dy,c] of [[-5,-3,"#f06aa0"],[4,-3,"#f06aa0"],[-3,-5,"#ff8fbd"],[2,-5,"#ff8fbd"],[-1,-6,"#ffc0dc"]])P(x+dx*u,y+dy*u,2.4*u,3*u,c);
    P(x-.6*u,y-5*u,1.2*u,1.2*u,"#ffd36b");P(x-.5*u,y-10*u,1*u,4*u,"#f4ead2");P(x+2.4*u,y-11*u,.5*u,5*u,"#8a5a32");P(x-2.9*u,y-11*u,.5*u,5*u,"#8a5a32");
    P(x-.6*u,y-12*u-fl*u*.5,1.2*u,2*u,"#ffd36b");P(x-.3*u,y-12.6*u-fl*u*.5,.6*u,1*u,"#fff3c4");
    const FW=[[200,.24,.2,"#ff8fbd"],[650,.74,.15,"#ffd36b"],[1100,.46,.09,"#7cc0ff"],[1550,.16,.13,"#8fe3a8"],[2000,.82,.22,"#e39bff"],[2450,.56,.16,"#ffd36b"],[2900,.32,.1,"#ff8fbd"],[3300,.68,.08,"#7cc0ff"]];
    ctx.save();ctx.globalCompositeOperation="lighter";
    for(const [st,fx,fy,c] of FW){const d=tf-st;if(d<0||d>1400)continue;const cx=W*fx,cy=H*fy;
      if(d<260){P(cx-.5,cy+(1-d/260)*60,2,5,"#fff3c4");continue;}const e=(d-260)/1140,r=10+e*44;
      if(e<.2){ctx.globalAlpha=(.2-e)*3;const g=ctx.createRadialGradient(cx*S,cy*S,0,cx*S,cy*S,30*S);g.addColorStop(0,"rgba(255,245,210,1)");g.addColorStop(1,"rgba(255,245,210,0)");ctx.fillStyle=g;ctx.fillRect((cx-30)*S,(cy-30)*S,60*S,60*S);}
      ctx.globalAlpha=Math.max(0,1-e*e);
      for(let i=0;i<24;i++){const a=i/24*Math.PI*2,px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r+e*e*12;P(px-1.5,py-1.5,3,3,c);P(cx+Math.cos(a)*r*.82-1,cy+Math.sin(a)*r*.82+e*e*10-1,2,2,c);if(i%2)P(cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.55+e*e*7,2,2,"#fff3c4");}}
    ctx.restore();ctx.globalAlpha=1;}
  ctx.globalAlpha=.25;P(0,0,W,8,"#000");P(0,H-8,W,8,"#000");ctx.globalAlpha=1;}
function mountLoyWish(){document.querySelectorAll("canvas[data-loywish]").forEach(cv=>{const x=cv.getContext("2d"),ids=(cv.dataset.loywish||"").split(",").filter(Boolean);
  LOOPS.add(t=>{if(!cv.isConnected)return;let tt=t-(UI.lwT0||t);if(UI.lwSkip)tt+=60000;x.clearRect(0,0,cv.width,cv.height);drawLoyWish(x,tt,ids,UI.lwF0?t-UI.lwF0:-1);});});}
/* v1.91.82 winner popup: the referee raises the winner's hand under a spotlight */
function mountWinPop(){document.querySelectorAll("canvas[data-winpop]").forEach(cv=>{if(cv._wp)return;cv._wp=1;const x=cv.getContext("2d");x.imageSmoothingEnabled=false;
  const m=UI.modal,h=m&&m.h,f=h&&G.F[h.id];if(!f)return;const sh=sheetFor(f),bgk=h.kind==="rgbelt"&&BGIMG["rgring_"+h.venue]?"rgring_"+h.venue:(BGIMG.ring?"ring":"hall"),bg=img(BGIMG[bgk]||BGIMG.hall);const T0=performance.now();
  LOOPS.add(t=>{if(!cv.isConnected)return;const e=t-T0,W=cv.width,H=cv.height,up=e>1900,k=Math.min(1,Math.max(0,(e-1900)/260));x.clearRect(0,0,W,H);
    if(bg.complete&&bg.naturalWidth){const r=Math.max(W/bg.naturalWidth,H/bg.naturalHeight),bw=bg.naturalWidth*r,bh=bg.naturalHeight*r;x.drawImage(bg,(W-bw)/2,(H-bh)/2,bw,bh);}
    x.fillStyle="rgba(8,4,14,.55)";x.fillRect(0,0,W,H);
    const cx=W*.44,foot=H*.99,sh2=H*1.05;const sp=x.createRadialGradient(cx+30,foot-sh2*.5,10,cx+30,foot-sh2*.5,H*.62);sp.addColorStop(0,`rgba(255,240,190,${up?.55:.3})`);sp.addColorStop(1,"rgba(255,240,190,0)");x.fillStyle=sp;x.fillRect(0,0,W,H);
    if(up&&e<2300){x.fillStyle=`rgba(255,255,255,${(2300-e)/400*.6})`;x.fillRect(0,0,W,H);}
    drawFrame(x,sh,up?ROW.win:ROW.idle,Math.floor(e/(up?180:260))%4,cx,foot,sh2);
    /* the referee: white shirt, black bow tie, black trousers; his left hand lifts her wrist */
    const rx=cx+sh2*.27,ry=foot-sh2*.04,u=sh2/40;const P=(a,b,w,hh,c)=>{x.fillStyle=c;x.fillRect(Math.round(rx+a*u),Math.round(ry-b*u),Math.ceil(w*u),Math.ceil(hh*u));};
    P(-2.2,12,2,12,"#1b1820");P(.4,12,2,12,"#1b1820");P(-2.6,1,2.6,1.2,"#0c0a10");P(.2,1,2.6,1.2,"#0c0a10");
    P(-3,21,6,9.5,"#f4f2ee");P(-3,21,6,.8,"#d8d4cc");P(-.9,20.6,1.8,1.2,"#111");P(-.4,19.8,.8,9,"#d8d4cc");
    P(-1.4,25.2,2.8,4.2,"#d9a77f");P(-1.6,25.6,3.2,1.3,"#2a2026");P(-.6,23.1,1,.4,"#8a5a46");
    P(1.8,20.6,1.6,7,"#f4f2ee");P(2,13.8,1.2,1.4,"#d9a77f");
    const sx=rx-2.4*u,sy=ry-20.4*u,hx=cx+sh2*(.13+.04*k),hy=foot-sh2*(.42+.36*k);x.strokeStyle="#f4f2ee";x.lineWidth=1.7*u;x.beginPath();x.moveTo(sx,sy);x.lineTo(hx+u,hy+2*u);x.stroke();x.fillStyle="#d9a77f";x.fillRect(hx-u,hy,2*u,2*u);
    if(up)for(let i=0;i<26;i++){const ph=((e-1900)/2600+i/26)%1,px=(i*97)%W,py=ph*H;x.fillStyle=["#ffd45a","#ff6b6b","#8fd3ff","#c785e6","#9dffb0"][i%5];x.fillRect(px+Math.sin(e/300+i)*12,py,5,9);}});});}
function mountContest(){document.querySelectorAll("canvas[data-contest]").forEach(cv=>{const x=cv.getContext("2d"),k=cv.dataset.contest;
  LOOPS.add(t=>{if(!cv.isConnected||!G)return;const R=(G.contests||{})[G.season||1];if(!R)return;let tt=t-(UI.ctT0||t);if(UI.ctSkip)tt+=60000;x.clearRect(0,0,cv.width,cv.height);
    if(k==="walk")drawContestWalk(x,G,tt,R);else drawContestAward(x,G,tt,R);});});}

// ===== v1.87: gacha machine popup — tap the machine, a capsule rolls out, its colour is the card's real rarity =====
const GB={box:"n",st:null,ps:[]};
const GB_RC={N:{c:"#9aa3b5",cap:["#e8ecf4","#9aa3b5"],pw:.35},R:{c:"#4a9be0",cap:["#7cc0ff","#2f6fc0"],pw:.6},SR:{c:"#c46be0",cap:["#e39bff","#8a3bb0"],pw:.85},SSR:{c:"#f2c94c",cap:["#ffe27a","#c98a12"],pw:1}};
const GB_SKIN={n:{body:"#c8323c",dark:"#a8263a",hi:"#e65564",base:"#5a2030",base2:"#7a3040",sign:"#c8323c",sign2:"#9e1f2c",lant:["#ff6b7a","#ffe27a","#8fe3a8","#7cc0ff","#e39bff"],pile:["#ff6b7a","#7cc0ff","#e39bff","#ffe27a","#8fe3a8","#e8ecf4","#ffa95a"]},
  loy:{body:"#2f9e5b",dark:"#217a45",hi:"#55c47e",base:"#1d4a30",base2:"#2b6342",sign:"#e8669a",sign2:"#b8406e",lant:["#ffd36a","#ffb347","#ffe9a0","#ffd36a","#ffc46b"],pile:["#ffe27a","#e39bff","#8fe3a8","#ffb3cf","#e8ecf4","#7cc0ff"]}};
function gbTimeline(r){const wob={N:450,R:650,SR:1000,SSR:1500}[r],T={crank:900,drop:1550,zoom:1850};T.open=T.zoom+wob;T.cut=r==="SSR"?T.open+200:0;T.card=r==="SSR"?T.open+2500:T.open+260;return T;}
const GBP=(()=>{const P=[];let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;for(let i=0;i<26;i++){let x,y;do{x=-24+rnd()*48;y=-6+rnd()*30}while(x*x+y*y>23*23);P.push({x,y,i,ph:rnd()*6});}return P.sort((a,b)=>a.y-b.y);})();
function gbDraw(X){
  const R=(x,y,w,h,c)=>{X.fillStyle=c;X.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
  const disc=(cx,cy,r,c)=>{X.fillStyle=c;for(let y=-r;y<=r;y++){const w=Math.floor(Math.sqrt(r*r-y*y+r*.8));X.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1);}};
  const ell=(cx,cy,rx,ry,c,part)=>{X.fillStyle=c;for(let y=-ry;y<=ry;y++){if(part==="top"&&y>0)continue;if(part==="bot"&&y<=0)continue;const w=Math.floor(rx*Math.sqrt(Math.max(0,1-(y*y)/(ry*ry+.6))));X.fillRect(Math.round(cx-w),Math.round(cy+y),w*2+1,1);}};
  const cap=(cx,cy,r,top,bot,o={})=>{const sq=o.sq||0,gap=o.gap||0,seam=o.seam||0,rx=r*(1+sq),ry=r*(1-sq);
    ell(cx,cy-gap,rx+1,ry+1,"#140c22","top");ell(cx,cy+gap,rx+1,ry+1,"#140c22","bot");ell(cx,cy-gap,rx,ry,top,"top");ell(cx,cy+gap,rx,ry,"#f4f1f8","bot");
    if(r>=4){ell(cx+rx*.25,cy-gap-ry*.15,rx*.55,ry*.55,"rgba(255,255,255,.18)","top");R(cx-rx*.55,cy-gap-ry*.6,Math.max(1,r/5),Math.max(1,r/5),"rgba(255,255,255,.85)");ell(cx+rx*.1,cy+gap+ry*.45,rx*.8,ry*.4,"rgba(60,40,90,.18)","bot");}
    R(cx-rx,cy-gap,rx*2+1,1,bot);if(seam>0){X.globalAlpha=Math.min(1,seam);R(cx-rx-1,cy-1,rx*2+3,2+Math.round(seam*2),"#fffbe8");X.globalAlpha=1;}};
  const rays=(x,y,n,len,rot,col,a)=>{X.save();X.globalAlpha=Math.max(0,a);X.fillStyle=col;for(let i=0;i<n;i++){const q=rot+i*Math.PI*2/n;X.beginPath();X.moveTo(x,y);X.lineTo(x+Math.cos(q-.09)*len,y+Math.sin(q-.09)*len);X.lineTo(x+Math.cos(q+.09)*len,y+Math.sin(q+.09)*len);X.closePath();X.fill();}X.restore();};
  const machine=(K,t,ang,sx,alpha,jig)=>{X.save();X.globalAlpha=alpha;X.translate(Math.round(sx),0);const cx=90;
    ell(cx,214,48,6,"rgba(0,0,0,.45)");for(let i=0;i<22;i++){const w=6+i*1.75;R(cx-w,40+i,w*2,1,i%5===0?"#ffe08a":"#d9a23a");}
    R(cx-46,62,92,3,"#7a4a12");R(cx-1,30,3,10,"#ffd36a");R(cx-3,28,7,3,"#ffd36a");
    R(cx-46,56,3,6,"#ffd36a");R(cx-49,53,4,4,"#ffd36a");R(cx-50,50,3,4,"#ffd36a");R(cx+43,56,3,6,"#ffd36a");R(cx+45,53,4,4,"#ffd36a");R(cx+47,50,3,4,"#ffd36a");
    R(cx-12,47,24,9,K.sign2);R(cx-11,48,22,7,K.sign);
    if(GB.box==="loy"){/* lotus kratong on the sign */R(cx-5,51,10,3,"#2f9e5b");R(cx-4,49,2,3,"#ffb3cf");R(cx-1,48,2,4,"#ffd0e2");R(cx+2,49,2,3,"#ffb3cf");R(cx,46,1,2,"#ffe27a");}
    else{R(cx-7,50,2,2,"#ffe08a");R(cx-1,50,2,2,"#ffe08a");R(cx+5,50,2,2,"#ffe08a");}
    const dy=96;disc(cx,dy,31,"#140c22");disc(cx,dy,30,"rgba(170,215,255,.20)");
    for(const p of GBP){const j=jig?Math.sin(t/40+p.ph)*1.2:0;cap(cx+p.x+j*.6,dy+p.y+j,4,K.pile[p.i%K.pile.length],"#140c22");}
    disc(cx,dy,30,"rgba(200,235,255,.10)");R(cx-20,dy-24,6,2,"rgba(255,255,255,.75)");R(cx-24,dy-21,3,6,"rgba(255,255,255,.55)");R(cx+16,dy+12,3,3,"rgba(255,255,255,.35)");
    R(cx-30,124,60,8,"#140c22");R(cx-29,125,58,6,"#e0aa3e");R(cx-29,125,58,2,"#ffe08a");
    R(cx-33,132,66,72,"#140c22");R(cx-32,133,64,70,K.body);R(cx+14,133,18,70,K.dark);R(cx-32,133,64,3,K.hi);R(cx-32,140,64,2,"#ffd36a");R(cx-32,196,64,2,"#ffd36a");
    for(let y=146;y<192;y+=8){R(cx-29,y,3,3,"#ffd36a");R(cx+26,y,3,3,"#ffd36a");}
    R(cx-8,143,16,7,"#140c22");R(cx-7,144,14,5,"#e0aa3e");R(cx-1,145,3,3,"#140c22");
    const kx=cx,ky=163;disc(kx,ky,10,"#140c22");disc(kx,ky,9,"#e0aa3e");disc(kx-1,ky-1,6,"#ffd36a");disc(kx,ky,3,"#8a5a14");
    const hx=kx+Math.cos(ang)*11,hy=ky+Math.sin(ang)*11;for(let i=0;i<=10;i++)R(kx+(hx-kx)*i/10-1,ky+(hy-ky)*i/10-1,3,3,"#5a3a10");disc(hx,hy,3,"#140c22");disc(hx,hy,2,"#fff3c4");
    R(cx-14,178,28,16,"#140c22");R(cx-12,180,24,12,"#05030a");R(cx-12,180,24,3,"#2a1f3a");
    R(cx-37,204,74,8,"#140c22");R(cx-36,205,72,6,K.base);R(cx-36,205,72,2,K.base2);X.restore();};
  const lanterns=(K,t)=>{for(let x=0;x<=180;x+=2)R(x,8+Math.sin(x/180*Math.PI)*7,2,1,"#3a2d52");
    for(let i=0;i<10;i++){const x=9+i*18,y=10+Math.sin(x/180*Math.PI)*7,on=((Math.floor(t/350)+i)%3)!==0,c=K.lant[i%K.lant.length];R(x-3,y,7,7,"#140c22");R(x-2,y+1,5,5,on?c:"#4a3d60");if(on){X.globalAlpha=.25;disc(x+.5,y+3.5,7,c);X.globalAlpha=1;}}};
  const burst=(x,y,n,cols,sp,star)=>{for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=(.4+Math.random())*sp;GB.ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-.4,life:40+Math.random()*40,c:cols[i%cols.length],star:star&&Math.random()<.35});}};
  const parts=()=>{for(const p of GB.ps){p.x+=p.vx;p.y+=p.vy;p.vy+=.035;p.vx*=.985;p.life--;}GB.ps=GB.ps.filter(p=>p.life>0);
    for(const p of GB.ps){X.globalAlpha=Math.min(1,p.life/25);if(p.star){R(p.x-2,p.y,5,1,p.c);R(p.x,p.y-2,1,5,p.c);}else R(p.x,p.y,2,2,p.c);}X.globalAlpha=1;};
  return {R,disc,cap,rays,machine,lanterns,burst,parts};}
function mountGbox(){document.querySelectorAll("canvas[data-gbox]").forEach(cv=>{const X=cv.getContext("2d"),D=gbDraw(X),K=GB_SKIN[GB.box]||GB_SKIN.n,CY=148;
  const stage=cv.closest(".gbstage");
  LOOPS.add(now=>{if(!cv.isConnected)return;const s=GB.st;X.clearRect(0,0,180,240);D.lanterns(K,now);
    if(!s){const wig=-Math.PI/2+Math.max(0,Math.sin(now/260))*Math.max(0,Math.sin(now/1300))*.5;D.machine(K,now,wig,0,1,false);D.parts();return;}
    const t=now-s.t0,T=s.T,rc=GB_RC[s.r],clamp=(v)=>Math.max(0,Math.min(1,v)),ease=p=>1-Math.pow(1-p,3),once=(k,fn)=>{if(!s.fired[k]){s.fired[k]=1;fn();}};
    const pc=clamp(t/T.crank),ang=-Math.PI/2+ease(pc)*Math.PI*4;for(let q=1;q<=8;q++)if(pc>=q/8)once("c"+q,()=>AU.gsfx("click"));
    const zp=clamp((t-T.drop)/(T.zoom-T.drop));D.machine(K,now,ang,t<T.crank?Math.sin(t/25)*.8:0,1-zp*.75,t<T.crank);
    if(stage)stage.classList.toggle("dim",t>=T.drop);
    const wp=clamp((t-T.zoom)/(T.open-T.zoom)),up=!s.upg||wp>.62,cp=up?rc.cap:GB_RC.SR.cap,gc=up?rc.c:GB_RC.SR.c;
    if(s.upg&&wp>.62)once("upg",()=>{AU.gsfx("upg");D.burst(90,CY,30,["#fff3c4","#ffe27a","#ffffff"],1.4,true);gbFlash(stage,"#ffe9a0",.7);});
    if(t>=T.crank&&t<T.open){let x,y,r;
      if(t<T.drop){const p=(t-T.crank)/(T.drop-T.crank);once("drop",()=>AU.gsfx("drop"));x=90+p*6;r=5+p*2;const b=p<.45?p/.45:p<.8?(p-.45)/.35:(p-.8)/.2,amp=p<.45?16:p<.8?7:2;y=198+p*24-Math.sin(b*Math.PI)*amp;
        if(p>.45)once("b1",()=>AU.gsfx("bounce"));if(p>.8)once("b2",()=>AU.gsfx("bounce"));}
      else if(t<T.zoom){const p=ease(zp);x=96-6*p;y=222+(CY-222)*p;r=7+p*15;}
      else{const n={N:2,R:3,SR:4,SSR:6}[s.r],ph=Math.sin(wp*n*Math.PI*2),amp=(1+wp*3)*(s.r==="SSR"?1.6:1);x=90+ph*amp;y=CY-Math.abs(ph)*amp*.6;r=22;
        const k=Math.floor(wp*n*2);once("w"+k,()=>AU.gsfx("rattle",Math.min(4,k/2)));
        if(s.r!=="N"||wp>.3)D.rays(x,y,s.r==="SSR"?14:s.r==="SR"?10:7,60+wp*80,now/900,gc,(.1+wp*.28)*(up?rc.pw:GB_RC.SR.pw));
        if(stage)stage.classList.toggle("shake",s.r==="SSR"&&wp>.5&&!(RM&&RM.matches));}
      if(t>=T.zoom){X.globalAlpha=.35;D.disc(x,y,r+6,gc);X.globalAlpha=1;}
      D.cap(x,y,Math.round(r),cp[0],cp[1],{sq:t>=T.zoom?Math.sin(wp*40)*.05*wp:0,seam:t>=T.zoom?wp*1.2:0});
      if(t>=T.zoom&&(s.r==="SR"||s.r==="SSR")&&Math.random()<.35)D.burst(x+(Math.random()-.5)*40,y+(Math.random()-.5)*40,1,[gc,"#ffffff"],.4,true);}
    if(t>=T.open){once("open",()=>{if(stage)stage.classList.remove("shake");AU.gsfx("pop",s.r);D.burst(90,CY,{N:24,R:40,SR:70,SSR:120}[s.r],[rc.c,rc.cap[0],"#ffffff"],s.r==="SSR"?2.4:1.8,s.r!=="N");gbFlash(stage,s.r==="SR"?"#f1d2ff":"#fff",{N:.35,R:.55,SR:.8,SSR:.95}[s.r]);});
      const p=clamp((t-T.open)/500);if(p<1){X.globalAlpha=1-p;D.cap(90,CY,22,cp[0],cp[1],{gap:ease(p)*46});X.globalAlpha=1;}
      D.rays(90,CY,16,190,now/1400,rc.c,(.35-(t-T.open)/3000)*rc.pw);}
    D.parts();
    if(T.cut&&t>=T.cut&&t<T.card)once("cut",()=>{gbCutin(stage,s);AU.gsfx("fanfare");setTimeout(()=>AU.gsfx("shimmer"),900);});
    if(t>=T.card)once("card",()=>{s.shown=true;gbReveal(stage,s,true);if(s.r!=="N")D.burst(90,130,s.r==="SSR"?40:20,[rc.c,"#ffffff"],1.2,true);});});});}
function gbFlash(stage,c,o){const f=stage&&stage.querySelector(".gbflash");if(!f)return;f.style.background=c;f.style.setProperty("--fo",o);f.classList.remove("go");void f.offsetWidth;f.classList.add("go");}
function gbCutin(stage,s){const el=stage&&stage.querySelector(".gbcut");if(!el)return;el.innerHTML=gbCutHTML(s);el.classList.add("on");const h=stage.querySelector(".gbhint");if(h)h.style.display="none";}
function gbReveal(stage,s,anim){if(!stage)return;const c=stage.querySelector(".gbcut");if(c)c.classList.remove("on");stage.classList.remove("shake");const h=stage.querySelector(".gbhint");if(h)h.style.display="none";
  const r=stage.querySelector(".gbrev");if(!r)return;r.innerHTML=gbRevealHTML(s);r.className="gbrev on"+(anim?"":" still");
  if(anim){const n=CARD_R[s.r].s;for(let i=0;i<n;i++)setTimeout(()=>AU.gsfx("star",i),450+i*140);}}

/* v1.91.68 (prototype, Man 19 พ.ย.): the manager's layered anime portrait — built from the pixel look and tinted in a canvas.
   Layers (bottom → top): body with the chosen hair style (hats come with their own hair) → clothes → expression patch → [tint skin, clothes, pants, eyes] → hair/hat (tinted) → glasses.
   Art lives in a/mgr/ (Magnific variants of one base per gender, cut with SAM masks — see work/mgr/build.py). */
const MGRP=(()=>{const W=640,H=960,IM={},MK={},CACHE={},WAIT={};const SKIN0={m:[227,179,155],f:[230,182,162]};
  const EXPR=["normal","smile","sad","serious","surprised","flustered"];
  const hex=h=>{h=String(h||"#888").replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");const n=parseInt(h,16)||0;return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255];};
  const im=n=>{if(!IM[n]){const i=new Image();i.decoding="async";i.src=ASSET+"mgr/"+n;IM[n]=i;}return IM[n];};
  const ok=i=>i&&i.complete&&i.naturalWidth>0;
  const maskOf=n=>{if(MK[n])return MK[n];const i=im(n);if(!ok(i))return null;const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.drawImage(i,0,0,W,H);const d=x.getImageData(0,0,W,H).data,a=new Uint8Array(W*H);for(let p=0;p<W*H;p++)a[p]=d[p*4];return MK[n]=a;};
  const tint=(C,k,o,j,sp=1.6,cap=1)=>{for(let c=0;c<3;c++){const v=k<=1?C[c]*k:C[c]+(1-C[c])*Math.min(cap,(k-1)*sp);o[j+c]=v*255;}};
  function parts(L){const g=L.gender==="f"?"f":"m",hat=L.hat==="cap"||L.hat==="bucket"?L.hat:null,hs=hat||(["crop","bob","pony","buns","long"].includes(L.hairStyle)?L.hairStyle:(g==="f"?"bob":"crop")),o=["tee","polo","suit","hoodie"].includes(L.outfit)?L.outfit:"tee",gl=L.glasses==="glasses"||L.glasses==="sun"?L.glasses:null;return {g,hat,hs,o,gl};}
  function files(L,e){const P=parts(L),g=P.g;const f=[`${g}_${P.hs}.webp`,`${g}_${P.hs}_hair.webp`,`${g}_cloth_${P.o}.webp`,`${g}_cloth_${P.o}_m.png`,`${g}_skin.png`,`${g}_eyes.png`,`${g}_pants.png`];
    if(e&&e!=="normal")f.push(`${g}_face_${e}.webp`);if(P.gl)f.push(`${g}_gl_${P.gl}.webp`);if(P.hat)f.push(`${g}_${P.hs}_hat.png`);if(P.o!=="tee")f.push(`${g}_tee_cut.png`);return f;}
  function lref(d,m,lo){let s=0,n=0;for(let p=0;p<W*H;p+=3)if(m[p]>150){const j=p*4,l=(.299*d[j]+.587*d[j+1]+.114*d[j+2])/255;if(l>lo){s+=l;n++;}}return n?s/n:.6;}
  function compose(L,e){const P=parts(L),g=P.g,F=n=>im(n);
    const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});
    x.drawImage(F(`${g}_${P.hs}.webp`),0,0,W,H);if(P.o!=="tee"){x.globalCompositeOperation="destination-out";x.drawImage(F(`${g}_tee_cut.png`),0,0,W,H);x.globalCompositeOperation="source-over";}x.drawImage(F(`${g}_cloth_${P.o}.webp`),0,0,W,H);if(e&&e!=="normal")x.drawImage(F(`${g}_face_${e}.webp`),0,0,W,H);
    const id=x.getImageData(0,0,W,H),d=id.data,sk=maskOf(`${g}_skin.png`),cm=maskOf(`${g}_cloth_${P.o}_m.png`),pm=maskOf(`${g}_pants.png`),em=maskOf(`${g}_eyes.png`);
    const S0=SKIN0[g],S1=hex(L.skin||"#eec1a0").map(v=>v*255),rr=S1.map((v,i)=>v/S0[i]),CC=hex(L.outfitColor||"#f2f2f2"),CP=hex(L.pantsColor||"#1f1f24"),CE=hex(L.eyes||"#3a2a24");
    const lc=lref(d,cm,.15),lp=lref(d,pm,.05),o=[0,0,0];
    for(let p=0;p<W*H;p++){const j=p*4;if(!d[j+3])continue;const r=d[j],gg=d[j+1],b=d[j+2],mx=Math.max(r,gg,b),mn=Math.min(r,gg,b),sat=mx?(mx-mn)/mx:0,l=(.299*r+.587*gg+.114*b)/255;
      const we=em[p]/255;
      if(sk[p]>8&&we<.5){const w=sk[p]/255*Math.min(1,sat*6);if(w>0){d[j]=r+(Math.min(255,r*rr[0])-r)*w;d[j+1]=gg+(Math.min(255,gg*rr[1])-gg)*w;d[j+2]=b+(Math.min(255,b*rr[2])-b)*w;}}
      if(cm[p]>8){const w=cm[p]/255;tint(CC,l/lc,o,0);d[j]=r+(o[0]-r)*w;d[j+1]=gg+(o[1]-gg)*w;d[j+2]=b+(o[2]-b)*w;continue;}
      if(pm[p]>8){const w=pm[p]/255;tint(CP,l/lp,o,0);d[j]=r+(o[0]-r)*w;d[j+1]=gg+(o[1]-gg)*w;d[j+2]=b+(o[2]-b)*w;continue;}
      if(we>.3&&sat>.12&&l<.62){const w=we*.9;tint(CE,l/.36,o,0);d[j]=r+(o[0]-r)*w;d[j+1]=gg+(o[1]-gg)*w;d[j+2]=b+(o[2]-b)*w;}}
    x.putImageData(id,0,0);
    // hair (and the hat that comes with it), dyed on its own layer, then laid on top
    const h=document.createElement("canvas");h.width=W;h.height=H;const y=h.getContext("2d",{willReadFrequently:true});y.drawImage(F(`${g}_${P.hs}_hair.webp`),0,0,W,H);
    const hd=y.getImageData(0,0,W,H),q=hd.data,hm=P.hat?maskOf(`${g}_${P.hs}_hat.png`):null,CH=hex(L.hair||"#2b2530"),CT=hex(L.hatColor||L.outfitColor||"#c8283c");
    let s=0,n=0,s2=0,n2=0;for(let p=0;p<W*H;p+=2){const j=p*4;if(q[j+3]<150)continue;const l=(.299*q[j]+.587*q[j+1]+.114*q[j+2])/255;if(l<.2)continue;if(hm&&hm[p]>128){s2+=l;n2++;}else{s+=l;n++;}}
    const lh=n?s/n:.6,lt=n2?s2/n2:.7;
    for(let p=0;p<W*H;p++){const j=p*4;if(!q[j+3])continue;const l=(.299*q[j]+.587*q[j+1]+.114*q[j+2])/255,isHat=hm&&hm[p]>128;if(isHat)tint(CT,l/lt,o,0);else tint(CH,l/lh,o,0,.9,.55);q[j]=o[0];q[j+1]=o[1];q[j+2]=o[2];}
    y.putImageData(hd,0,0);x.drawImage(h,0,0);
    if(P.gl)x.drawImage(F(`${g}_gl_${P.gl}.webp`),0,0,W,H);
    return c;}
  const key=(L,e)=>JSON.stringify([L.gender,L.hairStyle,L.hair,L.skin,L.eyes,L.outfit,L.outfitColor,L.pantsColor,L.hat,L.hatColor,L.glasses,e||"normal"]);
  /* returns a data: URL, or "" while the art loads (then calls back once it is ready) */
  function url(L,e,cb){if(!L||typeof document==="undefined")return "";e=EXPR.includes(e)?e:"normal";const k=key(L,e);if(CACHE[k])return CACHE[k];
    const fs=files(L,e),miss=fs.map(im).filter(i=>!ok(i));
    if(miss.length){if(cb&&!WAIT[k]){WAIT[k]=1;let left=miss.length;const one=()=>{if(--left<=0){WAIT[k]=0;cb();}};miss.forEach(i=>{i.addEventListener("load",one,{once:true});i.addEventListener("error",one,{once:true});});}return "";}
    try{const c=compose(L,e);CACHE[k]=c.toDataURL("image/webp",.9);const ks=Object.keys(CACHE);if(ks.length>40)delete CACHE[ks[0]];return CACHE[k];}catch(err){return "";}}
  /* v1.91.68 (Man): fetch every layer of a gender in the background, so the editor and scenes never wait */
  function warm(L){const g=(L&&L.gender)==="f"?"f":"m";const f=[`${g}_skin.png`,`${g}_eyes.png`,`${g}_pants.png`,`${g}_tee_cut.png`,`${g}_cap_hat.png`,`${g}_bucket_hat.png`];
    ["crop","bob","pony","buns","long","cap","bucket"].forEach(h=>f.push(`${g}_${h}.webp`,`${g}_${h}_hair.webp`));["tee","polo","suit","hoodie"].forEach(o=>f.push(`${g}_cloth_${o}.webp`,`${g}_cloth_${o}_m.png`));
    EXPR.slice(1).forEach(e=>f.push(`${g}_face_${e}.webp`));["glasses","sun"].forEach(k=>f.push(`${g}_gl_${k}.webp`));f.forEach(im);}
  return {url,EXPR,parts,warm};})();

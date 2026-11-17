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
function npcBase(id){const h=hashStr(id);return {base:"npc"+(1+h%5),hue:NPC_HUES[(h>>>5)%NPC_HUES.length],dark:((h>>>9)%7)===0};}
// v1.70: pixel outfits — recolour only the kit (gloves, top, shorts, shoes) of a canon sheet; skin and hair stay
const OUTFITS={
 base:{name:"ชุดประจำตัว",sw:null,hint:""},
 sk:{name:"ชุดสงกรานต์ลายดอก",h:.9,s:.7,lm:1.2,dots:1,sw:"#e055a8",hint:"เล่นสงกรานต์กับคนในค่าย",need:G=>(G.flags.fc_sk||0)>0||!!G.seen.songkran},
 kt:{name:"ชุดลอยกระทงสีทอง",h:.13,s:.78,lm:1.15,sw:"#e8b53a",hint:"ลอยกระทงกับคนในค่าย",need:G=>(G.flags.fc_kt||0)>0||!!G.seen.loykrathong},
 ny:{name:"ชุดขาวปีใหม่",h:.6,s:.08,lm:1.55,sw:"#e9ecf2",hint:"ฉลองคืนข้ามปีด้วยกัน",need:G=>(G.flags.fc_ny||0)>0},
 drum:{name:"ชุดกลองแขกสีส้ม",h:.065,s:.88,lm:1.05,sw:"#ec7a22",hint:"ได้เกรด S ในมินิเกมกลองแขก",need:G=>(G.flags.bagS||0)>0},
 live:{name:"ชุดไลฟ์ขายดีสีมิ้นต์",h:.47,s:.72,lm:1.05,sw:"#2fc4b2",hint:"ได้เกรด S ในไลฟ์ขายของ",need:G=>(G.flags.liveS||0)>0},
 tiger:{name:"ชุดดำล่าเสือ",h:.08,s:.06,lm:.42,sw:"#2a2630",hint:"ล้มพลอยได้ในไฟต์ทางการ",need:G=>(G.flags.beat_ploy||0)>0},
 heart:{name:"ชุดหัวใจสีชมพู",h:.95,s:.55,lm:1.35,sw:"#f59cc4",hint:"ความสนิทกับคนนี้ถึง ♥ Lv.11",need:(G,f)=>(f.bond||0)>=100},
 champ:{name:"ชุดแชมป์ทองคำ",h:.14,s:.95,lm:1.3,sw:"#ffd34a",hint:"คว้าแชมป์จังหวัด",need:G=>Object.values(G.champ||{}).some(id=>G.F[id]&&G.F[id].camp==="player")||(G.titles||[]).some(t=>Object.values(t.champ||{}).some(id=>G.F[id]&&G.F[id].camp==="player"))}};
const KIT_MASK={kati:(h,l,s)=>(h<.035||h>.93)&&s>.38&&l>.12&&l<.8,mali:(h,l,s)=>h>.53&&h<.74&&s>.25&&l>.1,rin:(h,l,s)=>h>.2&&h<.45&&s>.25&&l>.08,
 ploy:(h,l,s,fy,fx)=>h>.68&&h<.9&&s>.2&&l>.1&&fy>.4&&fx>.3,fah:(h,l,s,fy)=>h>.088&&h<.17&&l>.1&&((s>.5&&fy>.33)||(s>.22&&l<.55&&fy>.55))};
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
function sheetFor(f){
  if(f.canon){if(f.outfit&&f.outfit!=="base"&&f.camp==="player"&&OUTFITS[f.outfit])return outfitSheet(f,f.outfit);return img(f.id+"_sheet.webp");}
  if(f.sprite)return img(f.sprite+"_sheet.webp"); // v1.23: gang, roosters, bulls
  if(TINTS[f.id])return TINTS[f.id];
  const nb=npcBase(f.id),base=nb.base,blonde=!!(f.prodigy||(f.id||"").startsWith("prod_")),lab=!!f.lab&&!blonde,hue=blonde?42:lab?276:nb.hue,dark=blonde?true:lab?false:nb.dark; /* v1.88: Vector camp fighters wear their black-purple kit */const src=img(base+"_sheet.webp"); /* v1.56: Golden Tiger prodigies: black-gold kit; v1.88: hair dyed silver like Fah */if(!src.complete||!src.naturalWidth)return src;
  const c=document.createElement("canvas");c.width=src.naturalWidth;c.height=src.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0);
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data,th=hue/360;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;let r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let l=(mx+mn)/2;const gold=()=>{const L2=Math.min(.86,l*1.45+.3),S2=.07,H2=.66;const q2=L2<.5?L2*(1+S2):L2+S2-L2*S2,p2=2*L2-q2;const f2=t=>{t=(t+1)%1;return t<1/6?p2+(q2-p2)*6*t:t<1/2?q2:t<2/3?p2+(q2-p2)*(2/3-t)*6:p2;};p[i]=f2(H2+1/3)*255;p[i+1]=f2(H2)*255;p[i+2]=f2(H2-1/3)*255;};if(mx===mn){if(blonde&&l>.07&&l<.42)gold();continue;}
      const dd=mx-mn;let s=l>.5?dd/(2-mx-mn):dd/(mx+mn);let h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;
      if(blonde&&l>.07&&l<.42&&!(h>.53&&h<.74&&s>.25)&&!((h<.035||h>.93)&&s>.38)&&(s<.45||(h>.02&&h<.16))){gold();continue;}
      const red=(h<.035||h>.93)&&s>.38&&l>.12&&l<.8,blue=h>.53&&h<.74&&s>.25&&l>.1;if(!red&&!blue)continue; // outfit only: skin & hair stay
      h=th;if(dark){s*=.15;l*=.55;}else if(lab){if(l<.5){s*=.35;l*=.3;}else{s=Math.min(.8,Math.max(s,.55));l=Math.min(.5,l*.6);}} /* black kit, purple highlights */
      const q=l<.5?l*(1+s):l+s-l*s,pp=2*l-q;const fn=t=>{t=(t+1)%1;return t<1/6?pp+(q-pp)*6*t:t<1/2?q:t<2/3?pp+(q-pp)*(2/3-t)*6:pp;};
      p[i]=fn(h+1/3)*255;p[i+1]=fn(h)*255;p[i+2]=fn(h-1/3)*255;}
    x.putImageData(d,0,0);}catch(e){}
  TINTS[f.id]=c;return c;}
function drawFrame(ctx,sheet,row,col,cx,footY,h,flip,alpha){
  if(!sheet||(sheet.complete===false)||(!sheet.width&&!sheet.naturalWidth))return;
  const sc=h/CELL*1.0,w=CELL*sc;ctx.save();ctx.globalAlpha=alpha??1;ctx.translate(cx,footY);if(flip)ctx.scale(-1,1);
  ctx.drawImage(sheet,col*CELL,row*CELL,CELL,CELL,-w/2,-h*0.94,w,h);ctx.restore();}

// ---------- RADAR (Nen-style hexagon) ----------
const RADAR_AX=[["หมัด",a=>(a.punch*2+a.power)/3],["เตะ",a=>(a.kick*2+a.foot)/3],["เข่า-ศอก",a=>(a.knee+a.elbow+a.clinch)/3],
  ["ป้องกัน",a=>(a.guard+a.counter+a.foot)/3],["ร่างกาย",a=>(a.speed+a.stamina+a.dur+a.power)/4],["จิตใจ",a=>(a.iq+a.comp)/2]];
function radarSVG(f,size=220,prev){
  const c=size/2,R=size*.34,col=f.color||"#e23b4e";const pt=(i,v)=>{const ang=-Math.PI/2+i*Math.PI/3;return [c+Math.cos(ang)*R*v,c+Math.sin(ang)*R*v];};
  const vals=RADAR_AX.map(([,fn])=>clamp(fn(f.a)/20,0,1));
  const ring=k=>RADAR_AX.map((_,i)=>pt(i,k).join(",")).join(" ");
  const poly=vals.map((v,i)=>pt(i,v).join(",")).join(" ");
  const pot=RADAR_AX.map((_,i)=>pt(i,clamp(f.potential/20,0,1)).join(",")).join(" ");
  const labels=RADAR_AX.map(([n,fn],i)=>{const [x,y]=pt(i,1.24);const v=(vals[i]*20).toFixed(1);const dl=prev?fn(f.a)-fn(prev):0;
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="rl">${n}</text><text x="${x}" y="${y+13}" text-anchor="middle" class="rv">${v}${dl>=.05?`<tspan class="rup"> +${dl.toFixed(1)}</tspan>`:""}</text>`;}).join("");
  const id="rg"+Math.random().toString(36).slice(2,7);
  return `<svg class="radar" viewBox="0 0 ${size} ${size+10}" role="img" aria-label="กราฟหกเหลี่ยมค่าสถานะของ${f.name}">
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
  if(k==="plain"){F.box(x0-4.5,top+1,46,3,roof,ol,shadeHex(roof,.3));F.box(x0+9,top+11,21,8,"#e9dcc4",ol,"#fff4e0","#b8a888");F.text("ศิริชัย",x0+19.5,top+15.2,5.5,"#6b3a24");return;}
  // three-tier Thai roof with chofa hooks on every eave
  for(let j=0;j<3;j++){const w=48-j*13,y=top+2-j*4.2,xl=x0+19.5-w/2;
    for(let r=0;r<4;r+=.5){const ww=w-r*1.6;F(xl+r*.8-.5,y-r,ww+1,.5,ol);}
    for(let r=0;r<3.5;r+=.5){const ww=w-1-r*1.6;F(xl+.5+r*.8,y-r,ww,.5,r%1?roof:shadeHex(roof,-.18));}
    F(xl+.5,y-3.5,w-6,.5,shadeHex(roof,.35));
    const gold=k==="lantern"?"#e8b53a":"#ffd84a";F(xl-1.5,y-1,1.5,1,gold);F(xl-2,y-2.5,1,1.5,gold);F(xl+w,y-1,1.5,1,gold);F(xl+w+1,y-2.5,1,1.5,gold);}
  F(x0+19,top-14.5,1.5,4,"#ffd84a");F(x0+18.5,top-15.5,2.5,1,"#ffd84a");
  F.box(x0+9,top+11,21,8,k==="lantern"?"#2a1018":"#f4ead8",ol,k==="lantern"?"#5a2030":"#fffaf0");
  F.text("ศิริชัย",x0+19.5,top+15.2,5.5,k==="lantern"?"#ffd36b":k==="painted"?"#c8283c":"#7a1b2a");
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
  if(v==="minibus"||v==="pinkvan"||v==="bluevan"){const x=228,mc=v==="pinkvan"?"#f4b6c8":v==="bluevan"?"#3a6fc0":"#ece9df";F.shadow(x+25,y+26,28,2.5);
    body(x,y+6,50,15,mc);F.box(x+2,y+2.5,40,4,mc,ol,"#ffffff");for(let i=0;i<4;i++)glass(x+4+i*9,y+8,7,5);glass(x+40,y+7,9,6);
    F(x,y+14,50,1.5,"#d9a520");F(x,y+15.5,50,.5,"#c8283c");F.box(x+16,y+17,14,2,"#c8283c",null);lamp(x+47,y+16);F(x-.5,y+17,1.5,2,"#c8283c");wheel(x+5);wheel(x+38);return;}
  if(v==="tuktuk"){const x=240,oc="#e8892a";F.shadow(x+20,y+26,22,2.5); /* v1.86: three-wheeled tuk-tuk, roof canopy, chrome trim */
    F.box(x+2,y+2,30,3,"#2a2238",ol,"#4a4060");F(x+3,y+5,1,9,"#3a3550");F(x+30,y+5,1,9,"#3a3550");F(x+17,y+5,1,7,"#3a3550");
    F(x+4,y+5,12,6,"rgba(40,30,60,.55)");F(x+5,y+9,10,3,"#c8283c");F(x+5,y+9,10,.75,"#e8545e");
    body(x+2,y+12,28,9,oc);F(x+2,y+15,28,.75,"#f2f2f2");F(x+2,y+16,28,.5,"#2c5fb3");F.text("ศิริชัย",x+12,y+18.4,3.4,"#ffffff");
    F.box(x+30,y+10,8,11,oc,ol,shadeHex(oc,.3));glass(x+31,y+5.5,5,4.5);F(x+31,y+5,6,.75,"#2a2238");lamp(x+36,y+14);F(x+36,y+18,2.5,1,"#d9d9e0");
    F(x+.5,y+17,1.5,2,"#c8283c");wheel(x+3);wheel(x+31);return;}
  if(v==="tourbus"){const x=214;F.shadow(x+32,y+26,36,2.5);
    body(x,y,64,21,"#c8283c");F.box(x+1,y-1.5,62,2,"#a01f30",ol);for(let i=0;i<6;i++)glass(x+3+i*9,y+3,7,6);glass(x+56,y+3,7,8);
    F(x,y+10.5,64,2,"#ffd36b");F(x,y+13,64,1,"#2c5fb3");F.box(x+8,y+14.5,30,4.5,"#f4ead8",null);F.text("ศิริชัย",x+23,y+16.9,4,"#c8283c");lamp(x+61,y+17);F(x-.5,y+16,1.5,3,"#ff6b6b");wheel(x+6);wheel(x+48);return;}
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
    F.text(k==="gold"?"★":"ศิริชัย",cx,cy+.3,k==="gold"?7:5,k==="gold"?"#c9961c":shadeHex(floor,-.45));}
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
  ctx.fillStyle=look>=4?"#c8283c":"#6a4a3a";ctx.fillText("ค่ายมวยศิริชัย",(bx+52)*S,(by-23)*S);ctx.restore();
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
  decorVehicle(P,G,t,F);
  if(G.fac.sauna){P(296,146,22,16,"#7a4a2a");for(let i=0;i<6;i++)P(294+i,140+i,26-i*2,1,"#5a3a2a");P(303,152,7,10,"#3b2518");for(let k=0;k<3;k++){const y=136-((t/40+k*9)%16);P(299+k*6+Math.sin(t/300+k)*2,y,2,2,"rgba(255,255,255,.55)");}}
  if(G.fac.lights){for(const lx of [150,300]){P(lx,46,2,62,"#9aa0a8");P(lx-4,44,10,4,"#3a3550");P(lx-3,45,8,2,Math.floor(t/700)%2&&G.fac.lights>=2?"#fff7c4":"#ffe9a0");}}
  if(G.fac.hall){P(286,112,22,24,"#5a3a2a");P(288,114,18,18,"#2a1d2e");P(293,117,8,6,"#f7d24a");P(295,123,4,6,"#d9a520");if(G.fac.hall>=2){P(289,128,6,3,"#c8283c");P(299,128,6,3,"#2c5fb3");}}
  // dorm house
  if(G.fac.dorm>=1){P(268,70,44,36,"#b88a5a");for(let i=0;i<9;i++)P(264+i,62+i,52-i*2,1,"#7a4a3a");P(284,88,10,18,"#5a3a2a");P(272,78,8,7,"#ffd98a");P(298,78,8,7,"#ffd98a");if(G.fac.dorm>=2){P(266,58,48,3,"#c8283c");}}
  // kitchen stall
  if(G.fac.kitchen>=1){P(120,128,26,14,"#e8d8b8");for(let i=0;i<26;i+=4)P(120+i,124,4,4,i%8?"#f2f2f2":"#c8283c");if(Math.floor(t/500)%2)P(128,118,2,4,"#dcdcdc");}
  // brand billboard
  if(G.fac.brand>=1){P(212,36,60,26,"#2a1d40");P(214,38,56,22,G.fac.brand>=2?"#c8283c":"#7a3fc0");ctx.save();ctx.font=`bold ${7*S}px "Chakra Petch",sans-serif`;ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(G.fac.brand>=3?"แชมป์มวยหญิง!":"เปิดคอร์สมวยไทย",242*S,52*S);ctx.restore();P(240,62,3,34,"#5a4030");}

  decorGate(P,G,t,F);
  // v1.10: a living yard — everyone moves, drawn back-to-front
  const D=[];const chib=(look,key,x,y,sc,flip,dy)=>{const c=chibiCache(look,key+dy,{dy});D.push({y:y+32*sc,f:()=>{ctx.save();ctx.imageSmoothingEnabled=false;
    if(flip){ctx.translate((x+24*sc)*S,0);ctx.scale(-1,1);ctx.drawImage(c,0,y*S,24*S*sc,32*S*sc);}else ctx.drawImage(c,x*S,y*S,24*S*sc,32*S*sc);ctx.restore();}});};
  const n=Math.min(14,campStudents(G)),srng=mulberry32(4242);const SAYS=["ฮึบ!","เย้!","ครูครับ!","ปั้ก!","เหนื่อย~","อีกรอบ!","สู้ ๆ"];
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
  if(typeof mountCampFx==="function")mountCampFx();if(typeof mountContest==="function")mountContest();if(typeof mountGbox==="function")mountGbox();
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
const FS={cv:null,ctx:null,bg:null,A:null,B:null,fx:[],shake:0,
  init(cv,bgName,fa,fb){this.cv=cv;this.ctx=cv?cv.getContext("2d"):null;this.bg=img(bgName);
    const mk=(f,side)=>({f,side,x:side==="A"?370:590,base:side==="A"?370:590,anim:"guard",t0:0,flash:0,down:0,ko:false,win:false});
    this.A=mk(fa,"A");this.B=mk(fb,"B");this.fx=[];this.shake=0;},
  attach(cv){if(!cv)return;this.cv=cv;this.ctx=cv.getContext("2d");},
  play(e,now){const at=e.at||(e.ev==="counter"?(e.mside?e.mside:null):null);
    const atk=this[e.side==="A"?"A":"B"],def=this[e.side==="A"?"B":"A"];if(!atk)return;
    const row=e.w==="kick"||e.w==="knee"?"knee":"punch";
    if(e.ev==="hit"||e.ev==="counter"){atk.anim=row;atk.t0=now;def.flash=now;def.anim="guard";this.shake=e.crit?10:5;
      this.fx.push({x:def.x+(def.side==="A"?30:-30),y:290,t0:now,txt:e.crit?"ผัวะ!!":["ปั้ก!","ตุ้บ!","เพี้ยะ!","ผัวะ!"][Math.floor(Math.random()*4)],big:!!e.crit});
      def.x+=def.side==="A"?-14:14;}
    if(e.ev==="miss"){atk.anim=row;atk.t0=now;def.x+=def.side==="A"?-8:8;this.fx.push({x:def.x,y:270,t0:now,txt:"หลบ!",miss:true});}
    if(e.ev==="kd"){def.down=now;this.shake=14;}
    if(e.ev==="ko"){def.ko=true;def.down=now;atk.win=true;atk.anim="win";this.shake=16;}
    if(e.ev==="cut"){this.fx.push({x:def.x,y:250,t0:now,txt:"แตก!",cut:true});}
  },
  render(t){const S=FS;if(!S.cv||!S.cv.isConnected)return;const x=S.ctx,W=S.cv.width,H=S.cv.height;
    x.save();const sh=S.shake;if(sh>.3){x.translate((Math.random()-.5)*sh,(Math.random()-.5)*sh);S.shake*=.88;}
    if(S.bg&&S.bg.naturalWidth){const r=S.bg.naturalWidth/S.bg.naturalHeight;const bw=H*r;x.drawImage(S.bg,(W-bw)/2,0,bw,H);}else{x.fillStyle="#221b3d";x.fillRect(0,0,W,H);}
    // approach centre
    if(!S.A||!S.B){x.restore();return;}for(const s of [S.A,S.B]){s.x+=(s.base-s.x)*.08;
      const el=t-s.t0;let row=s.anim,col;
      if((row==="punch"||row==="knee")&&el>520){s.anim=s.win?"win":"guard";row=s.anim;}
      if(row==="punch"||row==="knee")col=Math.min(3,Math.floor(el/130));else col=Math.floor(t/(row==="win"?180:200))%4;
      const foot=H*.8,h=H*.5,flip=s.side==="B";
      // shadow
      x.fillStyle="rgba(0,0,0,.3)";x.beginPath();x.ellipse(s.x,foot,h*.25,h*.04,0,0,7);x.fill();
      x.save();
      if(s.ko||(s.down&&t-s.down<1300)){const k=s.ko?1:Math.max(0,1-Math.max(0,t-s.down-700)/600);x.translate(s.x,foot);x.rotate((flip?1:-1)*Math.PI/2*Math.min(1,(t-s.down)/220)*k);x.translate(-s.x,-foot);}
      x.imageSmoothingEnabled=true;drawFrame(x,sheetFor(s.f),ROW[row],col,s.x,foot,h,flip);
      if(t-s.flash<140){x.globalCompositeOperation="source-atop";}
      x.restore();
      if(t-s.flash<120){x.save();x.globalAlpha=.55;x.globalCompositeOperation="lighter";drawFrame(x,sheetFor(s.f),ROW[row],col,s.x,foot,h,flip);x.restore();}
      if(s.ko){for(let i=0;i<3;i++){const a=t/300+i*2.1;x.fillStyle="#ffe36b";x.fillRect(s.x+Math.cos(a)*30-3+(flip?20:-20),foot-60+Math.sin(a)*8,6,6);}}
    }
    // effects
    S.fx=S.fx.filter(f=>t-f.t0<900);
    for(const f of S.fx){const k=(t-f.t0)/900;x.save();x.globalAlpha=1-k;x.translate(f.x,f.y-40*k);
      if(!f.miss){x.fillStyle=f.cut?"#ff4b5c":"#fff3a6";for(let i=0;i<8;i++){const a=i/8*6.283;x.fillRect(Math.cos(a)*(14+40*k)-3,Math.sin(a)*(14+40*k)-3,6,6);}}
      x.font=`700 ${f.big?34:24}px "Pixelify Sans","Chakra Petch",sans-serif`;x.textAlign="center";x.lineWidth=6;x.strokeStyle="#1b1230";x.strokeText(f.txt,0,-24);x.fillStyle=f.miss?"#bfe3ff":f.cut?"#ff8a97":"#ffe36b";x.fillText(f.txt,0,-24);x.restore();}
    x.restore();}
};

// ---------- v1.19 CAMP ACTIVITY SCENES (short animated vignette before the result) ----------
const CFX={
  merit:{bg:"bg_temple.webp",tint:"rgba(255,150,60,.18)",cap:"เช้ามืด ทุกคนตื่นมาตักบาตรหน้าค่าย",monks:true,fx:"rice",kneel:true},
  rest:{bg:"bg_river.webp",tint:"rgba(20,30,70,.35)",cap:"วันหยุดค่าย นั่งเล่นริมน้ำ ไม่ต้องซ้อม",fx:"z",row:"idle"},
  class:{bg:"gym",cap:"สอนคลาสวันอาทิตย์ นักเรียนเต็มลาน",students:3,row:"punch",fx:"stars"},
  promo:{bg:"gym",cap:"ไลฟ์โปรโมทค่ายออนไลน์",phone:true,row:"win",fx:"hearts"},
  repair:{bg:"gym",cap:"ช่วยกันซ่อมแซมค่าย ทาสีใหม่",walk:true,fx:"sparks",planks:true},
  clip:{bg:"gym",cap:"ถ่ายคลิปซ้อมลงโซเชียล",camera:true,row:"knee",fx:"flash"},
  spar:{bg:"gym",cap:"ชกซ้อมภายในค่าย",spar:true,fx:"stars"},
  ladies:{bg:"gym",cap:"คลาสมวยฟิตเนสสำหรับผู้หญิง",students:4,row:"guard",fx:"hearts"},
  massage:{bg:"gym",tint:"rgba(80,40,20,.25)",cap:"หมอนวดแผนไทยมาคลายเส้นให้ทุกคน",masseuse:true,row:"idle",fx:"steam"},
  media:{bg:"gym",cap:"สื่อมาถ่ายทำสกู๊ปค่ายศิริชัย",camera:true,crew:true,row:"win",fx:"flash"},
  kids:{bg:"gym",cap:"คลาสมวยเด็กเล็ก ไหว้ครูกันพร้อมเพรียง",students:4,row:"guard",fx:"hearts"},
  stall:{bg:"bg_camp.webp",tint:"rgba(255,160,60,.15)",cap:"บูธขนมครกที่ตลาดนัด หอมไปทั้งซอย",students:3,row:"idle",fx:"steam"},
  tourist:{bg:"gym",cap:"นักท่องเที่ยวมาลองเตะเป้าครั้งแรก",students:3,row:"knee",fx:"flash",camera:true},
  trail:{bg:"bg_river.webp",tint:"rgba(40,90,40,.2)",cap:"วิ่งเทรลขึ้นดอยตอนเช้ามืด",walk:true,fx:"sparks"},
  tape:{bg:"gym",tint:"rgba(10,10,40,.55)",cap:"คืนดูเทปไฟต์เก่า จดจุดอ่อนคู่ชก",camera:true,row:"idle",fx:"flash"},
  fightnight:{bg:"bg_camp.webp",tint:"rgba(80,20,60,.25)",cap:"ไฟต์ไนท์ในค่าย คนดูแน่นเวที",spar:true,fx:"hearts"},
  clinicday:{bg:"gym",tint:"rgba(40,120,120,.18)",cap:"วันฟื้นฟูที่คลินิกกายภาพ",masseuse:true,row:"idle",fx:"steam"},
  waikhru:{bg:"bg_temple.webp",tint:"rgba(255,180,80,.2)",cap:"พิธีไหว้ครูที่ศาลพ่อแก่",kneel:true,fx:"rice"},
  // v1.82.5: special investments get their own scene too
  master:{bg:"bg_temple.webp",tint:"rgba(255,170,70,.22)",cap:"ครูมวยโบราณมาถ่ายทอดวิชาที่ลานค่าย",elder:true,row:"knee",fx:"stars"},
  hostshow:{bg:"bg_camp.webp",tint:"rgba(60,20,70,.3)",cap:"ศึกมวยค่ายศิริชัย คนดูแน่นลาน",spar:true,crowd:true,fx:"flash"},
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
function ctVerdict(v){return v>=10?"เต็ม 10!!":v>=8?"ดีมาก!":v>=6?"ใช้ได้":v>=4?"พอไหว":"อืม…";}
/* the chief walks the real camp (with the player's own decorations), stopping at each judged area */
function drawContestWalk(ctx,G,t,R){drawCamp(ctx,G,t);const S=2,A=R.areas;let x=-20,y=160,flip=false,moving=true,say=null,hi=false;
  const pts=A.map(a=>CT_SPOT[a.k]||[160,160]);
  if(t<CT_START){x=-20+(t/CT_START)*(pts[0][0]+20)*.4;y=pts[0][1];}
  else{const i=Math.min(A.length,Math.floor((t-CT_START)/CT_STEP)),ph=(t-CT_START)-i*CT_STEP;
    if(i>=A.length){x=150;y=158;moving=false;say=`รวม ${R.total}/70 · ไปประกาศผลที่อำเภอ!`;hi=true;}
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
  ctx.save();ctx.font=`700 ${9*S}px "Chakra Petch","IBM Plex Sans Thai",sans-serif`;ctx.fillStyle="#ffe58a";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(`ประกวดค่ายสวยประจำปี ${R.season} · ที่ว่าการอำเภอ`,160*S,31*S);ctx.restore();
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
  const line=phase===0?"ขอประกาศผลการประกวดค่ายสวยประจำปี!":phase===1?`อันดับ 3 … ${nm(2)}`:phase===2?`อันดับ 2 … ${nm(1)}`:`ชนะเลิศ … ${nm(0)}!!`;
  ctBubble(ctx,S,160,60,line,phase===3);
  if(phase===3&&win){// fireworks
    for(let b=0;b<5;b++){const per=1150,tt=(t-6800+b*230)%per,cyc=Math.floor((t-6800+b*230)/per),rr=mulberry32(b*97+cyc*13),cx=30+rr()*260,cy=14+rr()*50,col=["#ffd36b","#ff7b8a","#8ad7ff","#9dff8a","#f2a0ff"][(b+cyc)%5];
      if(tt<300){P(cx,cy+60-tt/5,1,3,"#fff3c4");}else{const k=(tt-300)/(per-300);ctx.globalAlpha=Math.max(0,1-k);for(let s=0;s<12;s++){const a=s/12*Math.PI*2;P(cx+Math.cos(a)*k*26,cy+Math.sin(a)*k*20+k*k*8,2,2,col);}ctx.globalAlpha=1;}}
    for(let i=0;i<24;i++){const ph=((t/1600)+i/24)%1;P((i*41+Math.sin(t/300+i)*6)%320,ph*180,2,3,["#ffd36b","#ff7b8a","#8ad7ff","#9dff8a"][i%4]);}}}
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

// ================= MUAY THAI MOE v1.2 — PIXEL SYSTEMS =================
const ASSET="a/";
const IMGS={};
function img(name){if(!IMGS[name]){const i=new Image();i.decoding="async";i.src=ASSET+name;IMGS[name]=i;}return IMGS[name];}
const SHEET_IDS=["kati","mali","rin","ploy","fah","pailin"];
function preloadCore(){SHEET_IDS.forEach(id=>img(id+"_sheet.webp"));["bg_camp.webp","bg_local.webp","gym1.webp","coach.webp"].forEach(img);}
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
 heart:{name:"ชุดหัวใจสีชมพู",h:.95,s:.55,lm:1.35,sw:"#f59cc4",hint:"ความสนิทกับคนนี้เต็มหลอด",need:(G,f)=>(f.bond||0)>=100},
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
  const nb=npcBase(f.id),base=nb.base,blonde=!!(f.prodigy||(f.id||"").startsWith("prod_")),hue=blonde?42:nb.hue,dark=blonde?true:nb.dark;const src=img(base+"_sheet.webp"); /* v1.56: Golden Tiger prodigies: blond hair, black-gold kit */if(!src.complete||!src.naturalWidth)return src;
  const c=document.createElement("canvas");c.width=src.naturalWidth;c.height=src.naturalHeight;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(src,0,0);
  try{const d=x.getImageData(0,0,c.width,c.height),p=d.data,th=hue/360;
    for(let i=0;i<p.length;i+=4){if(p[i+3]<10)continue;let r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let l=(mx+mn)/2;const gold=()=>{const L2=Math.min(.82,l*1.55+.2),S2=.78,H2=.12;const q2=L2<.5?L2*(1+S2):L2+S2-L2*S2,p2=2*L2-q2;const f2=t=>{t=(t+1)%1;return t<1/6?p2+(q2-p2)*6*t:t<1/2?q2:t<2/3?p2+(q2-p2)*(2/3-t)*6:p2;};p[i]=f2(H2+1/3)*255;p[i+1]=f2(H2)*255;p[i+2]=f2(H2-1/3)*255;};if(mx===mn){if(blonde&&l>.07&&l<.42)gold();continue;}
      const dd=mx-mn;let s=l>.5?dd/(2-mx-mn):dd/(mx+mn);let h=mx===r?(g-b)/dd+(g<b?6:0):mx===g?(b-r)/dd+2:(r-g)/dd+4;h/=6;
      if(blonde&&l>.07&&l<.42&&!(h>.53&&h<.74&&s>.25)&&!((h<.035||h>.93)&&s>.38)&&(s<.45||(h>.02&&h<.16))){gold();continue;}
      const red=(h<.035||h>.93)&&s>.38&&l>.12&&l<.8,blue=h>.53&&h<.74&&s>.25&&l>.1;if(!red&&!blue)continue; // outfit only: skin & hair stay
      h=th;if(dark){s*=.15;l*=.55;}
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
function drawCamp(ctx,G,t){
  const S=2,P=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x)*S,Math.round(y)*S,Math.round(w)*S,Math.round(h)*S);};
  const look=campLook(G),rng=mulberry32(77);ctx.imageSmoothingEnabled=false;
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
  const nb=1+G.fac.gym;for(let i=0;i<nb;i++){const x=123+i*8,sw=Math.sin(t/350+i)*1.2;P(x+sw,77,1,8,"#2b2530");P(x-1+sw,85,5,20,i===0&&look<5?"#7a6a5a":["#c8283c","#1f1f24","#2c5fb3"][i%3]);
    if(i===0&&look<5){P(x-1+sw,91,5,2,"#bbb");P(x-1+sw,99,5,2,"#bbb");}}
  // ice tub
  if(G.fac.recovery>=1){P(92,124,22,10,"#2c5fb3");P(93,125,20,4,"#9fd6ff");P(95,125,3,2,"#ffffff");}
  if(G.fac.recovery>=2){P(70,124,18,10,"#6d747c");P(71,125,16,3,"#c8e8ff");}
  // ring
  const rx=156,ry=96,rw=140,rh=34;
  P(rx,ry+rh,rw,8,"#3b2f4a");P(rx-4,ry+rh-2,rw+8,4,"#5a4a6a");
  P(rx,ry,rw,rh,look>=6?"#e8e0f0":"#bdb3a8");
  if(look>=10){P(rx+58,ry+12,24,10,"#c879c8");P(rx+64,ry+10,12,14,"#d99ad9");}
  const sag=look>=6?0:2;
  [["#d23246",0],["#f2f2f2",7],["#2c5fb3",14]].forEach(([c,o])=>{for(let x=0;x<rw;x+=2){const s=Math.round(Math.sin(x/rw*Math.PI)*sag);P(rx+x,ry-22+o+s,2,1,c);}});
  P(rx-2,ry-26,4,30,"#d23246");P(rx+rw-2,ry-26,4,30,"#2c5fb3");P(rx-2,ry-26,4,3,"#ff8a97");P(rx+rw-2,ry-26,4,3,"#8ab4ff");
  // banners / flag
  if(look>=12){P(rx+20,ry-44,10,16,"#c8283c");P(rx+110,ry-44,10,16,"#2c5fb3");P(rx+22,ry-40,6,6,"#ffd36b");P(rx+112,ry-40,6,6,"#ffd36b");}
  if(look>=15){P(300,40,2,70,"#d8d8d8");const w=Math.sin(t/300)*1;["#c8283c","#f2f2f2","#2c5fb3","#2c5fb3","#f2f2f2","#c8283c"].forEach((c,i)=>P(302,42+i*2+w,14,2,c));}
  // classroom mats
  for(let i=0;i<G.fac.classroom;i++)P(6+i*24,152,22,18,["#c8283c","#2c5fb3","#2f8a4f","#d9a520","#7a3fc0"][i%5]);
  // v1.23 props for the late facilities
  if(G.fac.van){P(232,160,40,14,"#2f8a4f");P(234,154,26,8,"#e8e0c8");P(262,156,8,6,"#9fd6ff");P(236,172,6,4,"#1f1f24");P(262,172,6,4,"#1f1f24");if(G.fac.van>=2){P(232,164,40,2,"#d9a520");}}
  if(G.fac.sauna){P(296,146,22,16,"#7a4a2a");for(let i=0;i<6;i++)P(294+i,140+i,26-i*2,1,"#5a3a2a");P(303,152,7,10,"#3b2518");for(let k=0;k<3;k++){const y=136-((t/40+k*9)%16);P(299+k*6+Math.sin(t/300+k)*2,y,2,2,"rgba(255,255,255,.55)");}}
  if(G.fac.lights){for(const lx of [150,300]){P(lx,46,2,62,"#9aa0a8");P(lx-4,44,10,4,"#3a3550");P(lx-3,45,8,2,Math.floor(t/700)%2&&G.fac.lights>=2?"#fff7c4":"#ffe9a0");}}
  if(G.fac.hall){P(286,112,22,24,"#5a3a2a");P(288,114,18,18,"#2a1d2e");P(293,117,8,6,"#f7d24a");P(295,123,4,6,"#d9a520");if(G.fac.hall>=2){P(289,128,6,3,"#c8283c");P(299,128,6,3,"#2c5fb3");}}
  // dorm house
  if(G.fac.dorm>=1){P(268,70,44,36,"#b88a5a");for(let i=0;i<9;i++)P(264+i,62+i,52-i*2,1,"#7a4a3a");P(284,88,10,18,"#5a3a2a");P(272,78,8,7,"#ffd98a");P(298,78,8,7,"#ffd98a");if(G.fac.dorm>=2){P(266,58,48,3,"#c8283c");}}
  // kitchen stall
  if(G.fac.kitchen>=1){P(120,128,26,14,"#e8d8b8");for(let i=0;i<26;i+=4)P(120+i,124,4,4,i%8?"#f2f2f2":"#c8283c");if(Math.floor(t/500)%2)P(128,118,2,4,"#dcdcdc");}
  // brand billboard
  if(G.fac.brand>=1){P(212,36,60,26,"#2a1d40");P(214,38,56,22,G.fac.brand>=2?"#c8283c":"#7a3fc0");ctx.save();ctx.font=`bold ${7*S}px "Chakra Petch",sans-serif`;ctx.fillStyle="#fff";ctx.textAlign="center";ctx.fillText(G.fac.brand>=3?"แชมป์มวยหญิง!":"เปิดคอร์สมวยไทย",242*S,52*S);ctx.restore();P(240,62,3,34,"#5a4030");}
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
  D.sort((a,b)=>a.y-b.y).forEach(d=>d.f());
  for(const [x,y] of bubble){const tx=SAYS[bi%SAYS.length];ctx.save();ctx.font=`700 ${7*S}px "Chakra Petch",sans-serif`;const w=ctx.measureText(tx).width/S+6;
    P(x-w/2,y-10,w,9,"#ffffff");P(x-1,y-1,2,2,"#ffffff");ctx.fillStyle="#1b1230";ctx.textAlign="center";ctx.fillText(tx,x*S,(y-3)*S);ctx.restore();}
}
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
function startLoops(){if(rafOn)return;rafOn=true;const tick=t=>{for(const fn of LOOPS){try{fn(t);}catch(e){console.error(e);LOOPS.delete(fn);}}if(LOOPS.size)requestAnimationFrame(tick);else rafOn=false;};requestAnimationFrame(tick);}
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
  if(typeof mountCampFx==="function")mountCampFx();
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
};
function cfxRoster(){return (G?Object.values(G.F).filter(f=>f.camp==="player"):[]).slice(0,3);}
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
  if(C.crew){drawStudentNpc(x,"crew1",W*.84,fy,fh*.85,"idle",t,true);}
  if(C.monks)for(let i=0;i<3;i++){const mx=-40+((t/22)+i*70)%(W+160);drawMonk(x,mx,fy-fh*.1,t,i,fh*.7/29,true);} // v1.38: monks walk behind, left to right
  if(C.spar&&R.length){const a=R[0],b=R[1]||{id:"sparnpc",canon:false};const ph=Math.floor(t/900)%2;
    drawFrame(x,sheetFor(a),ROW[ph?"punch":"guard"],Math.floor(t/150)%4,W*.4,fy,fh,false);drawFrame(x,sheetFor(b),ROW[ph?"guard":"knee"],Math.floor(t/150)%4,W*.6,fy,fh,true);}
  else R.forEach((f,i)=>{let cx=W*(C.students||C.masseuse||C.crew?.16+i*.14:(.3+i*.2)),row=C.row||"idle";
    if(C.walk){const span=W*.5;cx=W*.15+((t/18+i*span/3)%span);row="walk";}
    if(C.kneel){cx=W*(.18+i*.13);row="idle";}
    drawFrame(x,sheetFor(f),ROW[row],Math.floor(t/(row==="idle"?260:150))%4,cx,C.kneel?fy+fh*.12:fy,C.kneel?fh*.88:fh,false);});
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

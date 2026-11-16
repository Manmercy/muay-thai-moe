// ===== Procedural pixel chibi (from Character Studio prototype) =====
const CHIBI=(()=>{
// ===== Pixel master data (24x32). Each char = ramp slot, '.' = transparent =====
const W = 24, H = 32;
const L = {
  body: [
    "........................","........................","........................",
    "........oooooooo........",
    "......oo11111111oo......",
    ".....o111111111111o.....",".....o111111111111o.....",".....o111111111111o.....",
    ".....o111111111111o.....",".....o111111111111o.....",".....o111111111111o.....",
    ".....o211111111112o.....",
    "......o2111111112o......",
    ".......oo222222oo.......",
    ".........oo22oo.........",
    ".....oo1111111111oo.....",
    ".....o1o11111112o1o.....",".....o1o11111112o1o.....",".....o1o11111112o1o.....",
    ".....o1o11111112o1o.....",".....o1o11111112o1o.....",
    ".......o22222222o.......",".......o22222222o.......",
    ".......o11111111o.......",".......o11111111o.......",
    ".......o111oo111o.......",
    "........o11oo11o........","........o11oo11o........","........o11oo11o........","........o11oo11o........",
    ".......oo11oo11oo.......",
    ".......oooooooooo......."
  ],
  face: { 8:"........oo....oo........", 9:"........we....we........", 10:"........ee....ee........",
          11:".......p........p.......", 12:"...........mm..........." },
  blink: { 9:"........oo....oo........", 11:".......p........p.......", 12:"...........mm..........." },
  hairFrontBob: {
    1:"........oooooooo........",
    2:"......oocbbbbbbcoo......",
    3:".....ocbbaabbbbbbco.....",
    4:"....ocbbaabbbbbbbbco....",
    5:"....ocbbbbbbbbbbbbco....",
    6:"....ocbo..cbbc..obco....",
    7:"....ocb..........bco....",
    8:"....oc............co....",9:"....oc............co....",10:"....oc............co....",11:"....oc............co....",
    12:".....o............o....."
  },
  hairFrontCrop: {
    1:"........oooooooo........",
    2:"......oocbbbbbbcoo......",
    3:".....ocbbaabbbbbbco.....",
    4:"....ocbbaabbbbbbbbco....",
    5:"....ocbbbbbbbbbbbbco....",
    6:"....ocbo..cbbc..obco....",
    7:"....ocb..........bco....",
    8:".....o............o....."
  },
  hairBackLong: (()=>{const o={};for(let r=4;r<=17;r++)o[r]="...ocbbbbbbbbbbbbbbco...";
    o[18]="...ocbbbbbbbbbbbbbbco...";o[19]="....occccccccccccccco....".slice(0,24);o[20]=".....oooooooooooooo.....";return o;})(),
  hairBackPony: (()=>{const o={0:"..........oooo..........",1:".........obbbbo.........",
    2:"..................oo....",3:"..................obo..."};
    for(let r=4;r<=13;r++)o[r]="...................obo..";o[14]="...................oco..";o[15]="....................o...";return o;})(),
  hairBackBuns: {0:".....oooo......oooo.....",1:"....obbbbo....obbbbo....",2:"....obabbo....obbabo....",
                 3:"....obbbbo....obbbbo....",4:".....oooo......oooo....."},
  topBra: {15:"........x......x........",16:"........xxxxxxxx........",17:"........yxxxxxxy........",18:"........zzzzzzzz........"},
  topTank: {15:"........x......x........",16:"........xxxxxxxx........",17:"........xxxxxxxy........",
            18:"........xxxxxxxy........",19:"........yyyyyyyy........",20:"........zzzzzzzz........"},
  shorts: {20:".......oooooooooo.......",21:"......oxxxxxxxxxxo......",22:"......oyyyyyyyyyyo......",
           23:".....oyyyyyyyyyyyyo.....",24:".....oyyyyyooyyyyyo.....",25:".....ozzzzzoozzzzzo.....",
           26:".....oooooo..oooooo....."},
  gloves: {19:"....oooo........oooo....",20:"...oghho........ohhgo...",21:"...ohhho........ohhho...",
           22:"...oihio........oihio...",23:"....ooo..........ooo...."},
  mongkol: {4:"....oxyxyxyxyxyxyxyo....",5:"....................oy..",6:".....................y.."},
  prajioud: {17:".....xyx........xyx....."}
};
function hexToHsl(hex){const n=parseInt(hex.slice(1),16);let r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;
  const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0,l=(mx+mn)/2;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);
    h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hsl(h,s,l){return `hsl(${((h%360)+360)%360} ${clamp(s,0,1)*100}% ${clamp(l,0,1)*100}%)`;}
function toward(h,t,a){let d=((t-h+540)%360)-180;return h+Math.sign(d)*Math.min(Math.abs(d),a);}
// shadows lean toward violet, highlights toward warm yellow (classic pixel-art hue shifting)
function ramp(hex){const [h,s,l]=hexToHsl(hex);
  return {light:hsl(toward(h,55,8),s-.04,l+.12),base:hex,dark:hsl(toward(h,265,10),s+.04,l-.13),
          darker:hsl(toward(h,265,18),s+.04,l-.25),outline:hsl(toward(h,265,24),Math.min(s,.45),Math.max(l*.3,.07))};}
const GRAY={light:"#d8d8d8",base:"#a8a8a8",dark:"#767676",darker:"#4e4e4e",outline:"#262626"};

// ===== options =====
function layerList(st,gray){
  const R=k=>gray?GRAY:ramp(k);
  const skin=R(st.skin),hair=R(st.hair),eye=R(st.eyes),top=R(st.topColor),sh=R(st.shorts),gl=R(st.gloves);
  const blush=gray?"#c4a0a0":hsl(hexToHsl(st.skin)[0]-12,.6,hexToHsl(st.skin)[2]-.06);
  const hairMap={o:hair.outline,a:hair.light,b:hair.base,c:hair.dark};
  const cloth=r=>({o:r.outline,x:r.light,y:r.base,z:r.dark});
  const out=[];
  const back={long:L.hairBackLong,pony:L.hairBackPony,buns:L.hairBackBuns}[st.hairStyle];
  out.push({key:"hairBack",label:"ผมด้านหลัง",rows:back||{},map:hairMap,move:"all"});
  out.push({key:"body",label:"ร่างกาย",rows:L.body,map:{o:skin.outline,1:skin.base,2:skin.dark,3:skin.darker},move:"upper"});
  out.push({key:"face",label:"ใบหน้า",rows:L.face,blinkRows:L.blink,
    map:{o:"#2a1a1f",w:"#ffffff",e:eye.base,p:blush,m:skin.darker},move:"all"});
  const topRows={bra:L.topBra,tank:L.topTank}[st.top]||{};
  out.push({key:"top",label:"เสื้อ",rows:topRows,map:cloth(top),move:"all"});
  out.push({key:"shorts",label:"กางเกงมวย",rows:L.shorts,map:cloth(sh),move:"none"});
  if(st.prajioud) out.push({key:"prajioud",label:"ประเจียด",rows:L.prajioud,map:{x:gray?GRAY.base:"#d23a3a",y:gray?GRAY.light:"#f1c84b"},move:"all"});
  out.push({key:"gloves",label:"นวม",rows:L.gloves,map:{o:gl.outline,g:gl.light,h:gl.base,i:gl.dark},move:"all"});
  out.push({key:"hairFront",label:"ผมด้านหน้า",rows:st.hairStyle==="crop"?L.hairFrontCrop:L.hairFrontBob,map:hairMap,move:"all"});
  if(st.mongkol) out.push({key:"mongkol",label:"มงคล",rows:L.mongkol,map:{o:gray?GRAY.outline:"#7a1f2a",x:gray?GRAY.light:"#f4f1ea",y:gray?GRAY.dark:"#c8283c"},move:"all"});
  return out;
}
// ---- manager (player) outfits ----
const LM={
  hands:{21:".....o1o........o1o.....",22:".....ooo........ooo....."},
  tee:{15:".....oxxxxx..xxxxxo.....",16:".....oxxxxxxxxxxxxo.....",17:".....oyyxxxxxxxxyyo.....",18:"........xxxxxxxx........",19:"........xxxxxxxx........",20:"........yyyyyyyy........",21:".......oyyyyyyyyo......."},
  polo:{15:".....oxxxxwwwwxxxxo.....",16:".....oxxxxxzzxxxxxo.....",17:".....oyyxxxzzxxxyyo.....",18:"........xxxxxxxx........",19:"........xxxxxxxx........",20:"........yyyyyyyy........",21:".......oyyyyyyyyo......."},
  suit:{15:".....oxxxxwttwxxxxo.....",16:".....oxxxxwttwxxxxo.....",17:".....oxxxxxttxxxxxo.....",18:".....oxxxxxttxxxxxo.....",19:".....oxxxxxxxxxxxxo.....",20:".....oyyxxxxxxxxyyo.....",21:".......oyyyyyyyyo......."},
  hoodie:{14:".........oxxxxo.........",15:".....oxxxxxyyxxxxxo.....".slice(0,24),16:".....oxxxxxxxxxxxxo.....",17:".....oxxxxxxxxxxxxo.....",18:".....oxxxwwxxwwxxxo.....".slice(0,24),19:".....oxxxxxxxxxxxxo.....",20:".....oyyyyyyyyyyyyo.....",21:".......oyyyyyyyyo......."},
  pantsLong:{21:".......oppppppppo.......",22:".......oppppppppo.......",23:".......oppppppppo.......",24:".......oppppppppo.......",25:".......opppoopppo.......",
    26:"........oppooppo........",27:"........oppooppo........",28:"........oppooppo........",29:"........oqqooqqo........",30:".......osssooosso.......",31:".......oooooooooo......."},
  pantsShort:{21:".......oppppppppo.......",22:".......oppppppppo.......",23:".......oppppppppo.......",24:".......opppoopppo.......",25:".......oqqqooqqqo.......",30:".......osssooosso.......",31:".......oooooooooo......."},
  cap:{0:"........oooooooo........",1:"......ooccccccccoo......",2:".....occcccccccccco.....",3:"....occcccccccccccco....",4:"....oddddddddddddddddo.."},
  bucket:{0:".......oooooooooo.......",1:"......occcccccccco......",2:".....occcccccccccco.....",3:".....occcccccccccco.....",4:"...oddddddddddddddddo...",5:"...oooooooooooooooooo..."},
  glasses:{8:".......oooo..oooo.......",9:".......o..oooo..o.......",10:".......oooo..oooo......."},
  sun:{8:".......oooo..oooo.......",9:".......offooooffo.......",10:".......offo..offo......."},
};
function managerLayers(st){
  const R=ramp;const skin=R(st.skin),hair=R(st.hair),eye=R(st.eyes),top=R(st.outfitColor||"#2c5fb3"),pa=R(st.pantsColor||"#1f1f24"),hat=R(st.hatColor||"#c8283c");
  const blush=hsl(hexToHsl(st.skin)[0]-12,.6,hexToHsl(st.skin)[2]-.06);
  const hairMap={o:hair.outline,a:hair.light,b:hair.base,c:hair.dark};const out=[];
  const back={long:L.hairBackLong,pony:L.hairBackPony,buns:L.hairBackBuns}[st.hairStyle];
  out.push({rows:back||{},map:hairMap,move:"all"});
  out.push({rows:L.body,map:{o:skin.outline,1:skin.base,2:skin.dark,3:skin.darker},move:"upper"});
  out.push({rows:LM.hands,map:{o:skin.outline,1:skin.base},move:"all"});
  out.push({rows:L.face,blinkRows:L.blink,map:{o:"#2a1a1f",w:"#ffffff",e:eye.base,p:blush,m:skin.darker},move:"all"});
  out.push({rows:st.pants==="shorts"?LM.pantsShort:LM.pantsLong,map:{o:pa.outline,p:pa.base,q:pa.dark,s:"#3a2a24"},move:"none"});
  out.push({rows:LM[st.outfit]||LM.tee,map:{o:top.outline,x:top.base,y:top.dark,z:top.outline,w:"#f4f1ea",t:st.outfit==="suit"?"#c8283c":top.light},move:"all"});
  out.push({rows:st.hairStyle==="crop"?L.hairFrontCrop:L.hairFrontBob,map:hairMap,move:"all"});
  if(st.hat&&st.hat!=="none")out.push({rows:LM[st.hat],map:{o:hat.outline,c:hat.base,d:hat.dark},move:"all"});
  if(st.glasses&&st.glasses!=="none")out.push({rows:LM[st.glasses],map:{o:"#1b1520",f:"#3a3550"},move:"all"});
  if(st.stache)out.push({rows:{11:".........oooooo........."},map:{o:st.stache},move:"all"}); /* v1.86: the district chief's moustache */
  if(st.epaulet)out.push({rows:{15:".....oyy........yyo....."},map:{o:"#7a5a10",y:st.epaulet},move:"all"});
  return out;}
function rowsOf(rows){return Array.isArray(rows)?rows.map((r,i)=>[i,r]):Object.entries(rows).map(([k,r])=>[+k,r]);}
// frame: {dy, blink}
function drawLayer(ctx,layer,frame,ox=0){
  const rows=frame.blink&&layer.blinkRows?layer.blinkRows:layer.rows;
  for(const [r,str] of rowsOf(rows)){
    const dy=layer.move==="all"||(layer.move==="upper"&&r<=22)?frame.dy:0;
    for(let c=0;c<W;c++){const ch=str[c];if(ch==="."||!layer.map[ch])continue;
      ctx.fillStyle=layer.map[ch];ctx.fillRect(ox+c,r+dy,1,1);}
  }
}
function drawChar(ctx,st,frame,ox=0,gray=false){for(const l of (st.kind==='manager'?managerLayers(st):layerList(st,gray)))drawLayer(ctx,l,frame,ox);}
const FRAMES=[{dy:0},{dy:0},{dy:1},{dy:1}];
const OPT={skin:["#f6d7c3","#eec1a0","#d9a27b","#b97d55","#8d5a3b","#5e3a26"],
  hair:["#2b2530","#5a3a2a","#a0663a","#d8b26a","#c9ced8","#6b3fa0","#c8283c","#2f6fb0"],
  eyes:["#3a2a24","#6a4a2a","#2f6fb0","#3f8a5a","#8a3fa0","#b0302f"],
  cloth:["#c8283c","#2c5fb3","#1f1f24","#2f8a4f","#6a3fa0","#e07aa0","#e0a91b","#f2f2f2"],
  hairStyle:[["crop","สั้น"],["bob","บ็อบ"],["pony","หางม้า"],["buns","มัดจุก"],["long","ยาว"]],
  top:[["tank","เสื้อกล้าม"],["bra","สปอร์ตบรา"],["none","ไม่ใส่เสื้อ"]]};
function canvasFor(look,frame){const c=document.createElement("canvas");c.width=W;c.height=H;drawChar(c.getContext("2d"),look,frame||{dy:0});return c;}
function random(rng){const p=a=>a[Math.floor(rng()*a.length)];const g=rng()<.5?"m":"f";
  return {gender:g,hairStyle:p(OPT.hairStyle)[0],hair:p(OPT.hair.slice(0,5)),skin:p(OPT.skin),eyes:p(OPT.eyes),top:g==="f"?p(["bra","tank"]):p(["tank","none"]),
    topColor:p(OPT.cloth),shorts:p(OPT.cloth),gloves:p(OPT.cloth),mongkol:rng()<.3,prajioud:rng()<.3};}
function randomManager(rng){const p=a=>a[Math.floor(rng()*a.length)];const g=rng()<.5?"m":"f";
  return {kind:"manager",gender:g,hairStyle:p(OPT.hairStyle)[0],hair:p(OPT.hair.slice(0,5)),skin:p(OPT.skin),eyes:p(OPT.eyes),outfit:p(["tee","polo","suit","hoodie"]),outfitColor:p(OPT.cloth),pants:"long",pantsColor:p(["#1f1f24","#2c3e6b","#5a4a3a"]),hat:p(["none","none","cap","bucket"]),hatColor:p(OPT.cloth),glasses:p(["none","none","glasses","sun"])};}
return {W,H,drawChar,randomManager,drawLayer,layerList,canvasFor,random,OPT,FRAMES};
})();

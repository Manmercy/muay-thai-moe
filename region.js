// ================= v1.90 (hidden) ROAD TRIPS — trip cost by camp vehicle + driving scene =================
/* Regional chapter (loaded with region.js only once the chapter opens). The driving scene is wired in round 2:
   ROAD.open(destKey,{onArrive,charge}) shows the trip sheet, charges the cost, plays the drive, then calls onArrive(plan).
   ROAD.demo() opens a free preview (any region × time × vehicle) — also opens from the URL hash #roaddemo.
   The car is the camp's own vehicle slot (CAMP_DECOR.vehicle), drawn with decorVehicle() from pixel.js.
   Rule from Man: the pricier the car, the more economical the trip. */

const ROAD_FUEL_BASE=35; // ฿ per litre at an average week
/* kmL = km per litre (rises with price) · seats = riders who fit (the rest ride the public bus) · fat = fatigue multiplier on the road */
const ROAD_CAR={
 none:{name:"รถทัวร์ประจำทาง",kmL:0,seats:0,fat:1.25},
 songthaew:{kmL:7,seats:10,fat:1.15},
 yellowthaew:{kmL:7.5,seats:10,fat:1.15},
 rotdaeng:{kmL:7.5,seats:10,fat:1.12},
 tuktuk:{kmL:8,seats:3,fat:1.3},
 minibus:{kmL:9,seats:12,fat:1},
 bluevan:{kmL:10,seats:12,fat:.95},
 pinkvan:{kmL:10.5,seats:12,fat:.95},
 tourbus:{kmL:11,seats:30,fat:.85},
 limo:{kmL:12,seats:8,fat:.75},
 goldvan:{kmL:14,seats:12,fat:.8}};
const ROAD_BUS_PER_KM=1.1,ROAD_TOLL_PER_KM=.35,ROAD_ROOM=650,ROAD_FOOD=180; // per person per km / per km / per room per night / per person per day

const ROAD_REGION={north:{name:"ภาคเหนือ",tag:"เหนือ"},isan:{name:"ภาคอีสาน",tag:"อีสาน"},central:{name:"ภาคกลาง",tag:"กลาง"},south:{name:"ภาคใต้",tag:"ใต้"}};
/* game distances from the camp (a made-up province in the upper central plain). final:1 = the regional title ring */
const ROAD_DEST={
 chiangrai:{name:"เชียงราย",r:"north",km:780},nan:{name:"น่าน",r:"north",km:640},uttaradit:{name:"อุตรดิตถ์",r:"north",km:430},lampang:{name:"ลำปาง",r:"north",km:560},chiangmai:{name:"เชียงใหม่",r:"north",km:650,final:1},
 udon:{name:"อุดรธานี",r:"isan",km:520},khonkaen:{name:"ขอนแก่น",r:"isan",km:430},buriram:{name:"บุรีรัมย์",r:"isan",km:390},ubon:{name:"อุบลราชธานี",r:"isan",km:610},korat:{name:"นครราชสีมา",r:"isan",km:250,final:1},
 lopburi:{name:"ลพบุรี",r:"central",km:120},suphan:{name:"สุพรรณบุรี",r:"central",km:130},phetchaburi:{name:"เพชรบุรี",r:"central",km:230},chanthaburi:{name:"จันทบุรี",r:"central",km:330},ayutthaya:{name:"พระนครศรีอยุธยา",r:"central",km:90,final:1},
 chumphon:{name:"ชุมพร",r:"south",km:500},surat:{name:"สุราษฎร์ธานี",r:"south",km:640},nakhonsi:{name:"นครศรีธรรมราช",r:"south",km:760},songkhla:{name:"สงขลา",r:"south",km:950},phuket:{name:"ภูเก็ต",r:"south",km:860,final:1}};
const roadNights=km=>km<300?0:km<700?1:2;

// ---------- fuel: changes every week, cheap and dear weeks come in turns, holidays push it up ----------
function roadFuel(G,wk){const w=wk!=null?wk:(G?gameWeek(G):1),s=((G&&G.seed)||1)%997,r=mulberry32(s*131+w*7919)();
  let p=1+.14*Math.sin(w*1.1+s)+.06*Math.sin(w*.37+s*2)+(r-.5)*.08;const wy=((w-1)%52)+1;if((wy>=14&&wy<=16)||wy>=51||wy<=1)p+=.1;
  return Math.round(ROAD_FUEL_BASE*p*100)/100;}
const roadFuelBand=p=>p<ROAD_FUEL_BASE*.94?"cheap":p>ROAD_FUEL_BASE*1.07?"high":"mid";
/* the news ticker guesses next week right about three times in four */
function roadFuelHint(G){const w=G?gameWeek(G):1,now=roadFuel(G,w),nx=roadFuel(G,w+1);let up=nx>now;if(mulberry32((((G&&G.seed)||1)%997)*17+w*31)()<.25)up=!up;
  return up?"ข่าวพลังงาน: สัปดาห์หน้าน้ำมันมีแนวโน้ม ขึ้น ▲":"ข่าวพลังงาน: สัปดาห์หน้าน้ำมันมีแนวโน้ม ลง ▼";}

function roadCarKey(G){return G?decorChoice(G,"vehicle"):"none";}
function roadCarName(k){return k==="none"?ROAD_CAR.none.name:((CAMP_DECOR.vehicle.items[k]||{}).name||k);}
function roadRiders(G){return G?roster(G).filter(f=>!f.injury||f.injury<3):[];}

/* the whole bill for one trip, there and back */
function roadPlan(G,destKey,carKey,wk){const D=ROAD_DEST[destKey],k=carKey||roadCarKey(G),C=ROAD_CAR[k]||ROAD_CAR.none,price=roadFuel(G,wk);
  const people=Math.max(1,roadRiders(G).length)+1/* the manager */,nights=roadNights(D.km),rt=D.km*2;
  const inCar=k==="none"?0:Math.min(people,C.seats),onBus=people-inCar;
  const litres=C.kmL?rt/C.kmL:0,fuel=Math.round(litres*price),toll=k==="none"?0:Math.round(rt*ROAD_TOLL_PER_KM),bus=Math.round(onBus*rt*ROAD_BUS_PER_KM);
  const rooms=Math.ceil(people/2),lodge=nights*rooms*ROAD_ROOM,food=(nights+1)*people*ROAD_FOOD;
  const fat=Math.round(D.km/100*C.fat*1.2); // fatigue every traveller picks up on the way
  return {dest:destKey,D,car:k,C,price,band:roadFuelBand(price),people,inCar,onBus,nights,rt,litres,fuel,toll,bus,lodge,food,fat,total:fuel+toll+bus+lodge+food};}

// ---------- driving scene: lines ----------
const ROAD_SCENERY={
 north:["ถนนเริ่มคดเคี้ยวขึ้นเขา หมอกบาง ๆ ลอยเรี่ยยอดสน อากาศเย็นจนต้องปิดหน้าต่าง","นาขั้นบันไดไล่ระดับลงไปในหุบ ป้ายบอกทางเริ่มมีตัวอักษรล้านนาเขียนกำกับ"],
 isan:["ทุ่งนากว้างสุดลูกหูลูกตา ต้นตาลยืนห่าง ๆ กันเป็นระยะ ฟ้ากว้างจนเห็นเมฆทั้งก้อน","ร้านไก่ย่างริมทางควันโขมง กลิ่นข้าวเหนียวลอยเข้ามาทางหน้าต่าง"],
 central:["นาข้าวเขียวสองข้างทาง คลองชลประทานทอดยาวขนานถนนไปจนสุดสายตา","ผ่านวัดริมทางที่หลังคาสีส้มเขียวสะท้อนแดด ร้านของฝากเรียงเป็นแถว"],
 south:["ภูเขาหินปูนตั้งเรียงเป็นแนว ทะเลสีเขียวครามโผล่ให้เห็นเป็นช่วง ๆ ระหว่างสวนยาง","สวนปาล์มกับสวนยางสลับกันไม่รู้จบ ฝนตกปรอยหนึ่งนาที แล้วแดดก็ออก"]};
const ROAD_CAR_GAG={
 none:"ค่ายยังไม่มีรถ ทุกคนเลยนั่งรถทัวร์ประจำทาง เบาะเอนได้นิดเดียว แอร์เย็นเหมือนอยู่ขั้วโลก",
 songthaew:"ลมตีหน้าจนผมทุกคนยุ่งไปหมด ผ้าใบหลังคาสะบัดดังพึ่บพั่บตลอดทาง",yellowthaew:"ลมตีหน้าจนผมทุกคนยุ่งไปหมด ผ้าใบหลังคาสะบัดดังพึ่บพั่บตลอดทาง",rotdaeng:"รถแดงวิ่งผ่านไปทางไหน มีคนโบกเรียกนึกว่ารถรับจ้างตลอด",
 tuktuk:"ตุ๊กตุ๊กนั่งได้แค่สามคน ที่เหลือตามไปด้วยรถทัวร์ แล้วไลน์มาบ่นเป็นระยะ",
 minibus:"รถตู้วิ่งเงียบ ๆ แอร์เย็นสบาย มีคนหลับไปสองคนตั้งแต่ยังไม่พ้นจังหวัด",bluevan:"รถตู้วิ่งเงียบ ๆ แอร์เย็นสบาย มีคนหลับไปสองคนตั้งแต่ยังไม่พ้นจังหวัด",pinkvan:"รถตู้ชมพูวิ่งผ่านไปทางไหน เด็ก ๆ ริมทางโบกมือให้ตลอด",
 tourbus:"รถบัสค่ายกว้างพอให้นอนยืดขา มีจอคาราโอเกะด้านหน้า ไม่มีใครยอมปล่อยไมค์",
 limo:"ลีมูซีนนุ่มจนไม่รู้สึกว่ารถวิ่ง รถคันข้าง ๆ ชะลอมามองตลอดทาง",
 goldvan:"รถตู้สีทองสะท้อนแดดจนคันหลังต้องเว้นระยะ คนริมทางยกมือถือถ่ายรูปเป็นระยะ"};
/* {km} is filled with the distance. Voices follow the heroines' chats: Kati หนู/ค่ะ, Mali มะลิ~, Rin ฉัน/ค่ะ + numbers, Ploy ฉัน/เธอ, Fah ฟ้า/นาย */
const ROAD_TALK={
 kati:{any:["ผู้จัดการคะ ง่วงไหม หนูแกะลูกอมให้ค่ะ คนขับต้องตาสว่าง!","หนูจดไว้แล้วค่ะว่าปั๊มไหนห้องน้ำสะอาดที่สุด แวะปั๊มหน้านะคะ"],
  isan:"กลิ่นไก่ย่าง… ผู้จัดการคะ จอดแป๊บเดียวได้ไหมคะ แป๊บเดียวจริง ๆ",south:"ทะเล!! ผู้จัดการ ทะเลค่ะ! …ขอโทษค่ะ หนูไม่เคยมาทางนี้"},
 mali:{any:["มะลิห่อข้าวเหนียวหมูทอดมาเผื่อทุกคนเลยค่ะ~ ห้ามแย่งกันนะ","ร้องเพลงกันไหมคะ~ มะลิเปิดเพลงลูกทุ่งให้"],
  south:"ทางนี้ใกล้บ้านมะลิแล้วค่ะ~ ได้กลิ่นทะเลแล้วคิดถึงแม่จัง",north:"หนาวจัง~ มะลิขอยืมเสื้อคลุมใครก็ได้หน่อยค่ะ"},
 rin:{any:["ระยะทาง {km} กิโลเมตร ถ้ารักษาความเร็วนี้ เราจะถึงก่อนกำหนดสิบเจ็ดนาทีค่ะ","ฉันสรุปสถิติเวทีปลายทางไว้แล้วค่ะ อ่านในรถได้ ฉันไม่เมารถ …น่าจะ"],
  north:"ทางโค้งช่วงนี้มีสามสิบสองโค้งค่ะ ฉันนับไว้แล้ว …ตอนนี้เหลือสิบเก้า"},
 ploy:{any:["ตอนอยู่ค่ายเก่า เดินทางทีไรนั่งเงียบ ๆ คนเดียว นั่งกันเยอะ ๆ แบบนี้ก็…ไม่แย่","เธอขับนิ่งดีนะ ฉันหลับได้"],
  isan:"ทุกคนชอบพูดว่าโคราชต้องหมัดหนัก …ไว้ไปดูต้นตำรับเขาด้วยตาตัวเองดีกว่า"},
 fah:{any:["นาย! เปิดเพลงฟ้าหน่อย! เพลงนี้ต้องร้องตอนรถวิ่งเร็ว ๆ!","ใครกินขนมฟ้า!! ถุงเหลือแต่เศษแล้ว!"],
  central:"ทุ่งนาเหมือนบ้านยายเลย …อย่ามองแบบนั้น ฟ้าไม่ได้คิดถึงบ้าน!"}};
const ROAD_SHOTGUN={
 kati:"หนูนั่งข้างหน้าจริงเหรอคะ… งั้นหนูดูแผนที่ให้เอง! …ผู้จัดการ เมื่อกี้ต้องเลี้ยวซ้ายค่ะ",
 mali:"ได้นั่งข้างหน้ากับผู้จัดการด้วย~ มะลิป้อนขนมให้ไหมคะ อ้าม~",
 rin:"ฉันนั่งหน้าเพราะไม่เมารถเท่านั้นนะคะ …ไม่ได้มีเหตุผลอื่น ไม่มีจริง ๆ",
 ploy:"เงียบ ๆ แบบนี้ก็ดีนะ …ถ้าง่วงก็บอก ฉันขับแทนได้",
 fah:"ที่นั่งหน้าเป็นของฟ้า! ใครจะทำไม! …นายขับดี ๆ ล่ะ ฟ้าไม่ได้กลัวนะ แค่บอกไว้"};

function roadLines(S){const P=S.plan,D=P.D,r=D.r,rng=mulberry32(S.seed),pick=a=>a[Math.floor(rng()*a.length)],L=[];
  L.push({n:"nar",t:`${roadCarName(P.car)}ของค่ายศิริชัยออกจากค่ายตั้งแต่${S.time==="night"?"บ่าย":"เช้ามืด"} มุ่งหน้าสู่${D.name} ระยะทาง ${D.km} กิโลเมตร`});
  if(P.car!=="none"&&P.band!=="mid")L.push({n:"nar",t:`แวะเติมน้ำมันลิตรละ ${fmt(P.price)} ${P.band==="high"?"สัปดาห์นี้แพงจนผู้จัดการถอนหายใจยาว":P.band==="cheap"?"ถูกกว่าสัปดาห์ก่อน ทุกคนเฮ":"ราคาปกติ ไม่มีใครบ่น"}`});
  L.push({n:"nar",t:ROAD_CAR_GAG[P.car]||ROAD_CAR_GAG.minibus});
  L.push({n:"nar",t:pick(ROAD_SCENERY[r])});
  const ids=S.riders.filter(id=>ROAD_TALK[id]);
  if(S.front&&ROAD_SHOTGUN[S.front])L.push({n:S.front,t:ROAD_SHOTGUN[S.front]});
  const others=ids.filter(id=>id!==S.front);for(let i=others.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[others[i],others[j]]=[others[j],others[i]];}
  for(const id of others.slice(0,2)){const T=ROAD_TALK[id],own=T[r];L.push({n:id,t:(own&&rng()<.6?own:pick(T.any)).replace("{km}",D.km)});}
  if(S.wet)L.push({n:"nar",t:"ฝนเทลงมาหนักจนที่ปัดน้ำฝนปัดไม่ทัน ทุกคนในรถเงียบกริบ"});
  L.push({n:"nar",t:S.time==="night"?`ไฟเมือง${D.name}สว่างอยู่ข้างหน้า อีกไม่กี่กิโลก็ถึงที่พักแล้ว`:`ป้าย "ยินดีต้อนรับสู่${D.name}" ผ่านไปทางขวา อีกไม่กี่กิโลก็ถึงเวทีแล้ว`,sign:1});
  return L;}

// ---------- driving scene: drawing (320×180 units, ×2 on canvas, like the camp) ----------
const RW=320,RH=180,RS=2;
const wrapX=(x,p)=>((x%p)+p)%p;
const ROAD_SKY={day:["#78c3ee","#93d0f0","#b4def0","#d8eeec"],dusk:["#3b2c63","#7a3f78","#c8646e","#f09a5c"],night:["#0d0b24","#16133a","#1f1b4c","#29245a"],wet:["#6f7a8c","#808a9a","#929aa6","#a6acb4"]};
const ROAD_DIM={day:0,dusk:.22,night:.55,wet:.18};
function roadDraw(ctx,S,t){const F=decorPainter(ctx,RS),dim=ROAD_DIM[S.wet?"wet":S.time]+(S.wet&&S.time==="night"?.4:0),dk=c=>dim?shadeHex(c,-Math.min(.75,dim)):c,
  P=(x,y,w,h,c)=>F(x,y,w,h,dk(c)),v=S.v,dist=v*t/1000;ctx.imageSmoothingEnabled=false;
  // sky
  const sky=ROAD_SKY[S.wet?"wet":S.time];sky.forEach((c,i)=>F(0,i*28,RW,28,S.wet&&S.time==="night"?shadeHex(c,-.6):c));
  if(S.time==="night"&&!S.wet){const r=mulberry32(9);for(let i=0;i<40;i++){const x=r()*RW,y=r()*80;if((Math.floor(t/500)+i)%7)F(x,y,.5,.5,"#f4e9ff");}F.disc(262,26,7,"#fff3c4");F.disc(259,24,6,"#16133a");}
  else if(!S.wet){const sy=S.time==="dusk"?78:28,sc=S.time==="dusk"?"#ffb26b":"#fff4c8";F.glow(70,sy,26,S.time==="dusk"?"rgba(255,170,100,.55)":"rgba(255,250,210,.6)");F.disc(70,sy,9,sc);}
  // clouds
  for(let i=0;i<5;i++){const x=wrapX(i*83-dist*.03,RW+60)-30,y=14+((i*29)%40);const c=S.wet?"#b8bec8":S.time==="night"?"#3a3566":S.time==="dusk"?"#f2b8a0":"#ffffff";
    F(x,y,24,4,c);F(x+5,y-3,14,4,c);F(x+3,y+2,20,2,S.wet?"#9aa2ae":shadeHex(c,-.08));}
  ROAD_LAYERS[S.r](F,P,dk,dist,t,S);
  // road
  P(0,132,RW,2,"#6a6458");P(0,134,RW,44,"#4a4652");P(0,134,RW,1,"#f2c94c");P(0,175,RW,1,"#f2f2f2");P(0,176,RW,4,"#5f7a45");
  for(let i=0;i<10;i++){const x=wrapX(i*40-dist,400)-40;P(x,154,18,1.5,"#f2f2f2");}
  if(S.wet)for(let i=0;i<6;i++){const x=wrapX(i*57-dist*.9,RW+40)-20;F(x,160+((i*7)%12),14,.5,"rgba(200,220,255,.35)");}
  // km posts beside the far edge
  for(let i=0;i<4;i++){const x=wrapX(i*90+20-dist,360)-20;P(x,125,3,9,"#f2f2f2");P(x,125,3,2,"#c8283c");}
  // welcome sign rolls in for the last line
  if(S.signAt!=null){const sx=RW+10-(t-S.signAt)*v/1000;if(sx>-110){P(sx+6,100,2.5,34,"#6a6a72");P(sx+91,100,2.5,34,"#6a6a72");F.box(sx,74,100,28,dk("#2c5fb3"),"#120c1c",dk("#5a8ae0"));F(sx+2,76,96,.5,dk("#f2f2f2"));F(sx+2,99.5,96,.5,dk("#f2f2f2"));
    F.text("ยินดีต้อนรับสู่",sx+50,82.5,6,dk("#ffffff"));F.text(S.plan.D.name,sx+50,93,S.plan.D.name.length>9?6:7.5,dk("#ffe9a0"));}}
  // the camp's own car (or the public bus)
  roadCar(F,S,t,dk);
  // puffs behind the car
  for(let i=0;i<5;i++){const a=((t/90)+i*7)%30;F.disc(S.carX-8-a*1.4,162-a*.25,1+a*.08,`rgba(${S.wet?"190,200,215":"235,225,210"},${Math.max(0,.45-a/40)})`);}
  // foreground grass + posts pass in front
  for(let i=0;i<14;i++){const x=wrapX(i*27-dist*1.5,RW+30)-15;P(x,176,2,4,"#3f6a2f");P(x+3,177,1.5,3,"#4f7a3a");}
  for(let i=0;i<3;i++){const x=wrapX(i*140-dist*1.6,RW+60)-30;P(x,170,2.5,10,"#d8d8d8");P(x,170,2.5,1.5,"#c8283c");}
  if(S.wet)for(let i=0;i<70;i++){const x=wrapX(i*37+t*.35,RW+20)-10,y=wrapX(i*53+t*.9,RH);F(x,y,.5,4,"rgba(200,215,240,.45)");}
  if(S.time==="night"&&!S.wet)F(0,0,RW,RH,"rgba(10,8,30,.08)");}

/* each region: far range, middle strip, things by the road */
const ROAD_LAYERS={
 north(F,P,dk,d,t,S){
  for(const [sp,base,amp,col,fr] of [[.05,92,26,"#6f8fb0",31],[.1,104,22,"#55779a",23],[.18,114,16,"#3f6a5f",17]])
   for(let x=0;x<RW;x+=2){const X=x+d*sp,h=amp*(.55+.45*Math.sin(X/fr))+Math.sin(X/7)*3;P(x,base-h,2,h+(130-base),col);}
  F(0,86,RW,5,`rgba(255,255,255,${S.time==="night"?.06:.22})`);F(0,100,RW,4,`rgba(255,255,255,${S.time==="night"?.05:.16})`);
  for(let i=0;i<6;i++){const y=118+i*2.4;P(0,y,RW,2.4,i%2?"#7fae4a":"#8fbe55");}
  for(let i=0;i<9;i++){const x=wrapX(i*41-d*.35,RW+40)-20,h=14+(i%3)*4;P(x+3,122-h+10,1.5,h-6,"#4a3a2a");for(let k=0;k<4;k++)P(x+3-k*1.6,122-h+k*3.2,1.5+k*3.2,3,"#2f5a3a");}},
 isan(F,P,dk,d,t,S){
  for(let x=0;x<RW;x+=2){const X=x+d*.04;const mesa=wrapX(X,260)<70?10:0;P(x,108-mesa-Math.sin(X/40)*1.5,2,6+mesa,"#b4accc");}
  P(0,112,RW,20,"#a8c45a");for(let i=0;i<5;i++)P(0,114+i*3.6,RW,.6,"#94b04a");
  for(let i=0;i<3;i++){const x=wrapX(i*150+60-d*.3,RW+120)-60;P(x,110,18,8,"#8a6a4a");for(let k=0;k<6;k++)P(x-2+k,104+k,22-k*2,1,"#6a4a2a");P(x+2,118,1.5,6,"#5a4030");P(x+14,118,1.5,6,"#5a4030");}
  for(let i=0;i<7;i++){const x=wrapX(i*53-d*.42,RW+40)-20,h=26+(i%3)*5;P(x,124-h,1.5,h,"#5a4030");
    for(let k=-4;k<=4;k++){P(x+.75+k*1.6,124-h-Math.abs(k)*.8+1,1.6,1.2,"#3f6a2f");P(x+.75+k*1.2,124-h+Math.abs(k)*.9+1,1.2,1.2,"#4f7a3a");}}},
 central(F,P,dk,d,t,S){
  for(let i=0;i<4;i++){const x=wrapX(i*120+30-d*.05,RW+80)-40,c="#8a92b4";P(x,104,22,4,c);P(x+2,100,18,4,c);
    for(let k=0;k<10;k++){const w=14-Math.abs(k-6)*1.6;if(w>0)P(x+11-w/2,99-k,w,1,c);}for(let k=0;k<14;k++)P(x+11-(1.6-k*.1),89-k,3.2-k*.2,1,c);}
  P(0,108,RW,24,"#5fae4a");for(let i=0;i<6;i++)P(0,110+i*3.6,RW,.6,"#4f9a3c");
  P(0,124,RW,4,"#4f8fc0");for(let i=0;i<8;i++){const x=wrapX(i*45-d*.5,RW+20);F(x,125,4,.5,dk("#bfe4f2"));}
  { const x=wrapX(200-d*.3,RW+260)-60;P(x,96,40,12,"#e8d8b8");for(let k=0;k<3;k++){P(x-4+k*4,92-k*5,48-k*8,4,k%2?"#2f8a4f":"#e8892a");}P(x+18,74,4,6,"#d9a520");}
  for(let i=0;i<6;i++){const x=wrapX(i*61-d*.42,RW+40)-20,h=28+(i%2)*6;for(let k=0;k<h;k+=2)P(x+Math.sin(k/9)*1.5,122-k,1.6,2,"#7a5a3a");
    for(const [a,b] of [[-8,2],[-5,-1],[0,-2],[5,-1],[8,2]])P(x+a*.9,122-h+b,4,1.5,"#2f7a3a");}},
 south(F,P,dk,d,t,S){
  for(let i=0;i<6;i++){const x=wrapX(i*70-d*.05,RW+80)-40,h=38+(i%3)*12,w=20+(i%2)*10;
    for(let c=0;c<w;c+=1){const u=(c-w/2)/(w/2),hh=h*Math.pow(Math.max(0,1-u*u),.35)*(1-.08*Math.sin(c*1.7+i));P(x+c,108-hh,1,hh,c>w*.7?"#557f70":"#628f7f");P(x+c,108-hh,1,2.5,"#4f7a45");}}
  P(0,104,RW,10,"#2f8ab8");for(let i=0;i<12;i++){const x=wrapX(i*29-d*.12+Math.sin(t/400+i)*2,RW);F(x,106+(i%3)*2.5,3,.5,dk("#d8f2ff"));}
  P(0,114,RW,18,"#3f7a3a");
  for(let i=0;i<10;i++){const x=wrapX(i*33-d*.45,RW+30)-15;P(x,104,1.5,22,"#8a7a6a");P(x-5,98,12,8,"#2f5a2f");P(x-3,95,8,4,"#3f6a3a");}}};

function roadCar(F,S,t,dk){const k=S.plan.car,bob=Math.sin(t/90)>.6?-.5:0,ctx=F.ctx;
  if(k==="none"){const x=S.carX-34,y=140+bob,ol="#120c1c";F.shadow(x+34,y+27,36,2.5);
    F.box(x,y,68,22,dk("#f2f2f2"),ol);F(x,y+13,68,3,dk("#2c5fb3"));F(x,y+16.5,68,1,dk("#c8283c"));for(let i=0;i<6;i++)F(x+3+i*9.5,y+3,8,7,dk("#2c3a4a"));F(x+60,y+3,7,9,dk("#2c3a4a"));
    F.text("รถโดยสาร",x+30,y+19.5,3.4,dk("#2c5fb3"));for(const wx of [x+9,x+54]){F.disc(wx,y+22,4,ol);F.disc(wx,y+22,2.2,"#9aa0aa");}if(S.time==="night")F.glow(x+74,y+16,18,"rgba(255,240,180,.35)");return;}
  const CX={songthaew:253,rotdaeng:253,yellowthaew:253,minibus:253,pinkvan:253,bluevan:253,tuktuk:259,tourbus:246,limo:249,goldvan:253}[k]||253;
  ctx.save();ctx.translate(S.carX*RS,(166+bob)*RS);ctx.scale(1.3,1.3);ctx.translate(-CX*RS,-178*RS);
  decorVehicle(null,{decor:{vehicle:k},decorUnlocks:{vehicle:[k]}},t,F);
  ctx.restore();
  if(S.time==="night"||S.wet){F.glow(S.carX+42,156+bob,26,"rgba(255,240,180,.32)");}}

// ---------- overlay: trip sheet → drive → arrive ----------
const ROAD={st:null,
  el(){let el=document.getElementById("roadtrip");if(!el){el=document.createElement("div");el.id="roadtrip";el.className="mgame";document.body.appendChild(el);
    el.onclick=e=>{const b=e.target.closest("[data-rd]");if(!b){if(this.st&&this.st.phase==="drive"&&e.target.closest(".rd-say"))this.next();return;}this.act(b.dataset.rd,b.dataset.v);};}
    if(!this.keyH){this.keyH=e=>{if(!this.st||this.st.phase!=="drive")return;if(e.key===" "||e.key==="Enter"){e.preventDefault();this.next();}else if(e.key==="Escape")this.finish();};document.addEventListener("keydown",this.keyH);}
    return el;},
  /* real trip: charge:true takes the money; onArrive(plan) runs after the drive */
  open(destKey,opts={}){if(!ROAD_DEST[destKey])return;const riders=roadRiders(G).map(f=>f.id);
    this.st={phase:"sheet",dest:destKey,car:roadCarKey(G),front:riders.find(id=>CANON_IDS.includes(id))||null,riders,opts,demo:false};this.el();this.draw();},
  /* free preview of any region, time, weather and car */
  demo(){const riders=G?roadRiders(G).map(f=>f.id).filter(id=>ROAD_TALK[id]):CANON_IDS.slice();
    this.st={phase:"demo",region:"north",time:"day",wet:false,car:G?roadCarKey(G):"minibus",front:riders[0]||null,riders,demo:true,opts:{}};this.el();this.draw();},
  act(a,v){const S=this.st;if(!S)return;
    if(a==="close")return this.close();if(a==="skip")return this.finish();if(a==="next")return this.next();
    if(a==="front"){S.front=S.front===v?null:v;return this.draw();}
    if(a==="region"){S.region=v;return this.draw();}if(a==="time"){S.time=v;return this.draw();}if(a==="wet"){S.wet=!S.wet;return this.draw();}if(a==="car"){S.car=v;return this.draw();}
    if(a==="go"){if(S.demo){const dk=Object.keys(ROAD_DEST).find(k=>ROAD_DEST[k].r===S.region&&ROAD_DEST[k].final);return this.drive(roadPlan(G,dk,S.car),S.time,S.wet);}
      const P=S.opts.plan||roadPlan(G,S.dest,S.car);if(S.opts.charge!==false&&!S.opts.paid){if(G.cash<P.total){toast("เงินไม่พอค่าเดินทาง");return;}G.cash-=P.total;}
      const w=G?gameWeek(G):1,rr=mulberry32((G.seed||1)+w*13)(),D=P.D,wetW=((w-1)%52)+1>=20&&((w-1)%52)+1<=40;
      return this.drive(P,D.km>=700?"night":D.km>=400?"dusk":"day",wetW&&rr<(D.r==="south"?.5:.3));}},
  sheetHTML(P,S){const band={cheap:["ถูก","cheap"],mid:["ปกติ","mid"],high:["แพง","high"]}[P.band],pos=Math.max(4,Math.min(96,50+(P.price/ROAD_FUEL_BASE-1)*250));
    const row=(a,b)=>`<div class="kv-row"><span>${a}</span><span>${b}</span></div>`;
    return `<div class="rd-car"><b>${esc(roadCarName(P.car))}</b><small>${P.car==="none"?"ค่ายยังไม่มีรถ · ทุกคนซื้อตั๋วรถทัวร์":`ประหยัด ${P.C.kmL} กม./ลิตร · นั่งได้ ${P.C.seats} คน`}</small></div>
     <div class="rd-fuel ${band[1]}"><span class="rd-pump">⛽</span><div class="rd-gauge"><i style="left:${pos}%"></i></div><b>${fmt(P.price)}/ลิตร · ${band[0]}</b></div>
     ${G?`<p class="meta center">${roadFuelHint(G)}</p>`:""}
     <div class="px rd-bill">${P.fuel?row(`ค่าน้ำมัน (ไป-กลับ ${P.rt.toLocaleString("en-US")} กม. · ${Math.round(P.litres)} ลิตร)`,fmt(P.fuel)):""}${P.toll?row("ค่าทางด่วน",fmt(P.toll)):""}
      ${P.bus?row(`ตั๋วรถทัวร์ ${P.onBus} คน${P.car!=="none"?" (นั่งในรถไม่พอ)":""}`,fmt(P.bus)):""}${P.lodge?row(`ที่พัก ${P.nights} คืน`,fmt(P.lodge)):""}${row(`ค่ากิน ${P.people} คน`,fmt(P.food))}
      <div class="kv-row rd-total"><span>รวม</span><b class="goldt">${fmt(P.total)}</b></div></div>
     <p class="meta center">ความล้าระหว่างทาง +${P.fat} ต่อคน${P.nights?` · ค้าง ${P.nights} คืน`:" · ไปกลับวันเดียว"}</p>`;},
  frontHTML(S){const ids=S.riders.filter(id=>ROAD_SHOTGUN[id]);if(!ids.length||(S.car==="none"))return "";
    return `<p class="meta center">ใครนั่งข้างคนขับ?</p><div class="mbpick">${ids.map(id=>`<button class="mbf ${S.front===id?"on":""}" data-rd="front" data-v="${id}"><img src="${faceSrc(id,"happy","casual")}" alt=""><small>${esc(G&&G.F[id]?G.F[id].name:id)}</small></button>`).join("")}</div>`;},
  draw(){const S=this.st,el=this.el();if(!S)return;
    if(S.phase==="sheet"){const P=S.opts.plan||roadPlan(G,S.dest,S.car),D=P.D,poor=!S.opts.paid&&S.opts.charge!==false&&G.cash<P.total;
      el.innerHTML=`<div class="mbox px"><h2>🚐 เดินทางไป${esc(D.name)}</h2><p class="meta center">${ROAD_REGION[D.r].name} · ${D.km} กม.${D.final?" · เวทีชิงแชมป์ภาค":""}</p>
       ${this.sheetHTML(P,S)}${this.frontHTML(S)}
       ${S.opts.paid?`<p class="meta center">${S.opts.sponsor?"นาคาเอเนอร์จี้ดริงค์ออกค่าเดินทางให้ค่ายที่เข้าชิงแชมป์ภาค":"จ่ายค่าเดินทางไว้แล้วตอนวางแผน"}</p><div class="mfoot roadbtns"><button class="btn primary" data-rd="go">ออกเดินทาง ▸</button></div></div>`
        :`<div class="mfoot roadbtns"><button class="btn" data-rd="close">ไว้ก่อน</button><button class="btn primary" data-rd="go" ${poor?"disabled":""}>${poor?"เงินไม่พอ":`ออกเดินทาง · ${fmt(P.total)}`}</button></div></div>`}`;return;}
    if(S.phase==="demo"){const cars=["none",...Object.keys(CAMP_DECOR.vehicle.items).filter(k=>k!=="none"&&ROAD_CAR[k])];
      const dk=Object.keys(ROAD_DEST).find(k=>ROAD_DEST[k].r===S.region&&ROAD_DEST[k].final),P=roadPlan(G,dk,S.car);
      const seg=(a,list,cur)=>`<div class="rd-seg">${list.map(([k,n])=>`<button class="btn sm ${k===cur?"primary":""}" data-rd="${a}" data-v="${k}">${n}</button>`).join("")}</div>`;
      el.innerHTML=`<div class="mbox px"><h2>🚐 ทดลองฉากขับรถ</h2><p class="meta center">ไม่เสียเงิน · ใช้ดูฉากและเทียบค่าเดินทางของรถแต่ละคัน</p>
       ${seg("region",Object.entries(ROAD_REGION).map(([k,R])=>[k,R.tag]),S.region)}
       ${seg("time",[["day","กลางวัน"],["dusk","เย็น"],["night","กลางคืน"]],S.time)}
       <div class="rd-seg"><button class="btn sm ${S.wet?"primary":""}" data-rd="wet">🌧 ฝนตก</button></div>
       ${seg("car",cars.map(k=>[k,roadCarName(k)]),S.car)}
       <p class="meta center">ตัวอย่างค่าเดินทางไป${esc(ROAD_DEST[dk].name)} (${ROAD_DEST[dk].km} กม.)</p>${this.sheetHTML(P,S)}${this.frontHTML(S)}
       <div class="mfoot roadbtns"><button class="btn" data-rd="close">ปิด</button><button class="btn primary" data-rd="go">ออกเดินทาง ▸</button></div></div>`;return;}
    if(S.phase==="drive"){const L=S.lines[S.i],who=L.n!=="nar"&&(G&&G.F[L.n]?G.F[L.n].name:({kati:"กะทิ",mali:"มะลิ",rin:"ริน",ploy:"พลอย",fah:"ฟ้า"})[L.n]||L.n);
      el.innerHTML=`<div class="mplay rd-play"><div class="mhud"><b>🚐 ${esc(S.plan.D.name)}</b><span>${ROAD_REGION[S.plan.D.r].name}</span><button class="btn sm" data-rd="skip">ข้าม ▸▸</button></div>
       <canvas id="rdcv" width="${RW*RS}" height="${RH*RS}"></canvas>
       <div class="rd-say px ${L.n==="nar"?"nar":""}">${who?`<img src="${faceSrc(L.n,"happy","casual")}" alt=""><div><b>${esc(who)}</b><p>${esc(L.t)}</p></div>`:`<p>${esc(L.t)}</p>`}<small>${S.i+1}/${S.lines.length} · แตะเพื่อไปต่อ</small></div></div>`;
      const cv=document.getElementById("rdcv");S.x=cv.getContext("2d");}},
  drive(P,time,wet){const S=this.st;S.phase="drive";S.plan=P;S.time=time;S.wet=!!wet;S.r=P.D.r;S.v=60;S.carX=150;S.seed=((G&&G.seed)||7)+(G?gameWeek(G):0)*7+P.D.km;
    S.lines=roadLines(S);S.i=0;S.signAt=null;S.t0=performance.now();S.lineAt=S.t0;try{AU.startMusic&&AU.startMusic("date");}catch(e){}
    this.draw();cancelAnimationFrame(this.raf);
    const RMQ=typeof matchMedia==="function"&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    const loop=now=>{if(!this.st||this.st.phase!=="drive")return;const t=RMQ?0:now-S.t0;
      if(S.x&&S.x.canvas.isConnected){S.x.clearRect(0,0,RW*RS,RH*RS);roadDraw(S.x,S,t);}
      const L=S.lines[S.i];if(now-S.lineAt>2600+L.t.length*45)this.next();
      this.raf=requestAnimationFrame(loop);};
    this.raf=requestAnimationFrame(loop);},
  next(){const S=this.st;if(!S||S.phase!=="drive")return;if(S.i>=S.lines.length-1)return this.finish();S.i++;S.lineAt=performance.now();
    if(S.lines[S.i].sign&&S.signAt==null)S.signAt=performance.now()-S.t0;this.draw();},
  finish(){const S=this.st;if(!S)return;cancelAnimationFrame(this.raf);const P=S.plan,cb=S.opts&&S.opts.onArrive;
    if(S.demo){S.phase="demo";this.draw();return;}const front=S.front;this.close(true);if(cb&&P)cb(P,front);},
  close(quiet){cancelAnimationFrame(this.raf);const el=document.getElementById("roadtrip");if(el)el.remove();this.st=null;if(quiet)return;try{AU.startMusic&&AU.startMusic("hub");}catch(e){}if(typeof render==="function"&&G)render();}};
try{if(/roaddemo/.test(location.hash||""))setTimeout(()=>ROAD.demo(),600);}catch(e){}

// ================= v1.90 (hidden) ศึกชิงเจ้าสี่ภาค — regional chapter core =================
/* Ships as its own file (region.js, bundled with road.js) and loads only once the chapter opens, so players in years 1–5 never download it.
   Round 1: the invitation, the four regions, planning a trip (calendar + cost + whole camp away), the provincial belt bouts.
   Later rounds: the drive scene, the champion series, minigame duels, the story, the Naka League finale. Spec: claude/regional-chapter.md */

const RG={
 north:{name:"ภาคเหนือ",champ:"ใบบัว",nick:"ดอกบัวซ่อนหนามแห่งล้านนา",col:"#e86fa0",prov:["chiangrai","nan","uttaradit","lampang"],fin:"chiangmai",tilt:{elbow:2.5,counter:2}},
 isan:{name:"ภาคอีสาน",champ:"ทับทิม",nick:"ทับทิมเอกเซียนอีสาน",col:"#d23246",prov:["udon","khonkaen","buriram","ubon"],fin:"korat",tilt:{kick:2.5,foot:1.5}},
 central:{name:"ภาคกลาง",champ:"อลิเซีย",nick:"เจ้าหญิงแห่งวงการมวยไทย",col:"#2f62c8",prov:["lopburi","suphan","phetchaburi","chanthaburi"],fin:"ayutthaya",tilt:{punch:2.5,clinch:1.5}},
 south:{name:"ภาคใต้",champ:"ชบา",nick:"หมัดพายุสยบคลื่น",col:"#1f9a7a",prov:["chumphon","surat","nakhonsi","songkhla"],fin:"phuket",tilt:{speed:2,foot:1.5,punch:1}}};
const RG_ORDER=["north","isan","central","south"];
/* the local belt holder waiting in each province */
/* v1.90: each province champion's own move — a named finisher (code effects in her province colour) plus a small edge on that weapon */
const RG_PSP={chiangrai:["ศอกวัดร่องขุ่น","elbow",{dmg:{elbow:.10}}],nan:["เข่าเรือแข่งน่าน","knee",{dmg:{knee:.10}}],uttaradit:["ศอกดาบหักพระยาพิชัย","elbow",{dmg:{elbow:.08},ctr:.02}],lampang:["ถีบม้าเหล็กลำปาง","kick",{dmg:{kick:.08},hit:{kick:.02}}],
 udon:["เตะบัวแดงบาน","kick",{dmg:{kick:.10}}],khonkaen:["เข่าทอไหมขอนแก่น","knee",{dmg:{knee:.08},regen:.06}],buriram:["หมัดสายฟ้าพนมรุ้ง","punch",{dmg:{punch:.10}}],ubon:["ศอกเทียนพรรษา","elbow",{dmg:{elbow:.08},hit:{elbow:.02}}],
 lopburi:["หมัดลิงหลอกเจ้า","punch",{dmg:{punch:.08},evade:.01}],suphan:["เตะแม่ไม้สุพรรณ","kick",{dmg:{kick:.10}}],phetchaburi:["เข่าเขาวังเมืองเพชร","knee",{dmg:{knee:.10}}],chanthaburi:["หมัดเปลือกมังคุด","punch",{dmg:{punch:.08},clDef:1}],
 chumphon:["เตะนางนวลโฉบ","kick",{dmg:{kick:.08},evade:.01}],surat:["ศอกเปลือกหอยดอนสัก","elbow",{dmg:{elbow:.10}}],nakhonsi:["หมัดหนังตะลุง","punch",{dmg:{punch:.10}}],songkhla:["เตะนางเงือกสมิหลา","kick",{dmg:{kick:.08},regen:.06}]};
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
const RG_OPP={chiangrai:"แก้วกาญจน์ ส.แม่สาย",nan:"น้ำผึ้ง ลูกเมืองน่าน",uttaradit:"ทองดี ศิษย์ดาบหัก",lampang:"ม้าเหล็ก ลูกรถม้า",
 udon:"บัวแดง หนองหาน",khonkaen:"ไหมแก้ว ลูกชนบท",buriram:"สายฟ้า พนมรุ้ง",ubon:"เทียนทอง ริมโขง",
 lopburi:"จ๋อทอง ศ.พระปรางค์",suphan:"แม่ไม้ บางปลาม้า",phetchaburi:"หม้อแกง เมืองเพชร",chanthaburi:"มังคุด ลูกจันท์",
 chumphon:"นางนวล ปากน้ำ",surat:"นางรม ดอนสัก",nakhonsi:"ตะลุง ศ.เมืองคอน",songkhla:"สมิหลา ลูกสงขลา"};
/* v1.91.9: province champions lean to their region's style (Tha Sao elbows and speed · Korat heavy hands · Lopburi craft · Chaiya stance) — a lean, not a rule */
const RG_BSTY={north:{inside:3,footwork:3,counter:1,power:1,pressure:1},isan:{power:4,footwork:2,inside:1,pressure:1,counter:1},
 central:{counter:3,footwork:2,inside:2,power:1,pressure:1},south:{pressure:3,footwork:3,counter:1,power:1,inside:1}};
function rgBeltSty(r,id){const W=RG_BSTY[r],K=Object.keys(W),tot=K.reduce((a,k)=>a+W[k],0);let x=((stableHash(id+"|sty")>>>0)%1000)/1000*tot;for(const k of K){x-=W[k];if(x<0)return k;}return K[0];}
const RG_LAST_WK=50; /* trips run until week 50; the last two weeks of the year are the holidays */
const RG_CUP_PRIZE=50000;
const RG_TITLE={north:"ศึกชิงแชมป์ภาคเหนือ",isan:"ศึกชิงแชมป์ภาคอีสาน",central:"ศึกชิงแชมป์ภาคกลาง",south:"ศึกชิงแชมป์ภาคใต้"};
/* v1.90 round 3: each champion's series — perk, letters, lines before/after each bout, the cup ceremony and the private cup night.
   Draft dialogue (dialects to be checked: คำเมือง by Man, อีสาน/ใต้ by native speakers) — the full regional scripts come in rounds 6–9. */
const RG_CH={
 north:{ring:"north",venue:"เวทีวัดล้านนา เชียงใหม่",pair:"kati",nightBg:"doisuthep",
  perk:{name:"ดอกบัวซ่อนหนาม",desc:"สวนกลับบ่อยขึ้น 5% · ศอกแรงขึ้น 12%",fx:{ctr:.05,dmg:{elbow:.12}}},
  letter:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูใบบัวเจ้า ได้ข่าวว่าค่ายของผู้จัดการเก็บเข็มขัดครบทั้งสี่จังหวัดของภาคเหนือแล้ว ขอแสดงความยินดีด้วยเจ้า\n\nเวทีวัดล้านนาที่เชียงใหม่รออยู่เจ้า ศึกชิงแชมป์ชกสามนัด ใครชนะสองนัดก่อนได้ถ้วย หนูขอให้ผู้จัดการเลือกนักมวยคนเดียว ชกกับหนูให้จบทั้งสามนัดเน้อ\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nใบบัว · ค่ายบัวท่าเสา",
  again:"ผู้จัดการเจ้า\n\nหนูยังรออยู่ที่เชียงใหม่เน้อ ถ้าค่ายศิริชัยพร้อมเมื่อไหร่ ส่งนักมวยมาอีกได้เลยเจ้า คราวนี้จะเลือกคนเดิมหรือคนใหม่ก็ได้\n\nหนูก่จะซ้อมรอเหมือนกันเจ้า\n\nใบบัว",
  wait:"บ่เป็นหยังเจ้า หนูรอได้ ดูแลนักมวยให้ดีก่อนเน้อ — ใบบัว",
  pre:[n=>`${n}… ยินดีที่ได้ชกกันเจ้า หนูจะไม่ออมมือเน้อ ศอกของท่าเสาไม่เคยออมใคร`,n=>`นัดนี้หนูจะสวนให้หนักกว่าเดิมเจ้า ระวังศอกกลับหลังเน้อ`,n=>`นัดสุดท้ายแล้วเจ้า… "ไวกว่าลมท่าเสา" หนูจะชกให้สมคำนี้ หนูแบกชื่อค่ายบัวท่าเสามาทั้งหมด จะยอมแพ้บ่ได้`],
  sty:["inside","counter","footwork"], /* v1.91.9 (Man): each bout has its own style, hinted in the line before it */
  reply:"มาเลย ฉันเตรียมมาแล้ว",pairLine:"ท่าเสาเหมือนกัน… แต่วันนี้หนูขอเป็นฝ่ายชนะนะคะ",
  win:["ขอบคุณที่ชกด้วยกันเจ้า นัดหน้าหนูจะรอเน้อ","ยังบ่จบเน้อ หนูรู้แล้วว่าต้องแก้ตรงไหน","…"],
  lose:["เก่งแท้เจ้า หนูประมาทไปหน่อย นัดหน้าเจอกันเน้อ","ศอกหนูโดนอ่านขาดเลยเจ้า… นัดสุดท้ายหนูจะบ่ยอมง่าย ๆ","…"],
  lost:(G,J)=>[{n:"baibua",f:"happy",l:"fight",t:"ถ้วยยังอยู่ที่เชียงใหม่เจ้า… แต่หนูสนุกแท้ที่ได้ชกกับค่ายศิริชัย"},{n:"baibua",f:"flustered",l:"fight",t:"ถ้าผู้จัดการพร้อมเมื่อไหร่ ส่งจดหมายมาบอกหนูเน้อ หนูจะรอเจ้า"},{n:"nar",t:"ใบบัวไหว้ทุกคนก่อนเดินลงเวที แล้วหันกลับมามองผู้จัดการอีกครั้งหนึ่ง"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.north.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคเหนือจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคเหนือ ศึกชิงเจ้าสี่ภาค ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"คุณเกริกขึ้นมามอบถ้วยทองกลางเวที โคมยี่เป็งลอยขึ้นฟ้าพร้อมกันหลายร้อยดวง"},
   {n:"baibua",f:"happy",l:"fight",t:"ยินดีด้วยเจ้า… ผู้จัดการ คืนนี้หนูมีที่หนึ่งอยากพาไป… ถ้าบ่ว่าอะไรเน้อ"},
   {n:"baibua",f:"flustered",l:"fight",t:"หนูมีเรื่องอยากบอกอยู่เรื่องหนึ่ง… เอ่อ บ่เป็นหยังเจ้า ไว้ก่อนก็ได้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ใบบัว")}]:[]),
   {n:"coach",t:"ถ้วยแรกของค่ายระดับภาค… ปู่ชัยต้องยิ้มอยู่แน่ ๆ"}];},
  night:(G,T)=>[
   {n:"nar",t:"ตีห้า ใบบัวมารอหน้าโรงแรมพร้อมรถมอเตอร์ไซค์คันเก่า ขึ้นดอยสุเทพไปตอนที่ฟ้ายังมืด"},
   {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นที่ประจำของหนูเจ้า ตอนพ่อยังสอนมวยได้ พ่อพามาดูหมอกทุกปีใหม่"},
   {n:"nar",t:"ลมหนาวพัดขึ้นมาจากหุบเขา ใบบัวคลี่ผ้าซิ่นตีนจกผืนเล็กออก แล้วแบ่งให้ผู้จัดการคลุมไหล่ครึ่งหนึ่ง"},
   {n:"baibua",f:"sad",l:"casual",t:"พ่อเจ็บเข่าเลิกสอนมาสองปีแล้วเจ้า เวกเตอร์มาขอซื้อค่าย บอกว่าจะจ่ายค่ารักษาพ่อให้ทั้งหมด"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูยังบ่ได้ตอบใคร… บ่กล้าบอกพ่อด้วย กลัวพ่อเสียใจที่ลูกสาวแบกค่ายไว้บ่ไหว"},
   {n:"nar",t:"ใบบัวเงียบไป ใต้หุบเขาไฟในเมืองเชียงใหม่ค่อย ๆ ดับทีละดวง",choice:[
     {t:"\"ค่ายเล็กก็ยืนได้ ค่ายเราเป็นตัวอย่างให้\"",fx:G2=>{rgMeet(G2,"baibua",3);},then:[{n:"baibua",f:"happy",l:"casual",t:"…ค่ายศิริชัยแท้ ๆ เจ้า ทุกคนช่วยกันหมด หนูอิจฉาเน้อ"}]},
     {t:"\"ไม่ต้องแบกคนเดียวก็ได้นะ\"",fx:G2=>{rgMeet(G2,"baibua",4);},then:[{n:"baibua",f:"flustered",l:"casual",t:"…ผู้จัดการพูดแบบนี้ หนูก่บ่รู้จะเอาหน้าไว้ไหนแล้วเจ้า"}]}]},
   {n:"nar",t:"ดวงอาทิตย์โผล่พ้นทะเลหมอก ใบบัวพึมพำอะไรบางอย่างเบามาก"},
   {n:"baibua",f:"flustered",l:"casual",t:"…อ้าย"},
   {n:"baibua",f:"flustered",l:"casual",t:"เอ๊ะ! บ่ใช่เจ้า หนูบ่ได้พูดหยัง! ลงดอยกันเถอะเจ้า เดี๋ยวทุกคนตื่นมาหา"},
   {n:"nar",t:"ทางลงดอย ใบบัวขับช้ากว่าตอนขาขึ้นเกือบเท่าตัว"}]},
 isan:{ring:"northeast",venue:"เวทีปราสาทหินพิมาย นครราชสีมา",pair:"ploy",nightBg:"mekong",
  perk:{name:"เตะคุมระยะ",desc:"เตะแม่นขึ้น 4% · หลบได้ดีขึ้น 1%",fx:{hit:{kick:.04},evade:.01}},
  letter:"เถิง ผู้จัดการค่ายศิริชัย\n\nคักแท้! เก็บเข็มขัดอีสานครบสี่จังหวัดแล้วเด้อ ทับทิมรอเบิ่งมาตั้งแต่จังหวัดแรกแล้ว\n\nมาชิงถ้วยกันที่เวทีปราสาทหินพิมาย โคราชเด้อ ชกกันสามนัด ใครชนะสองนัดก่อนเอาถ้วยไป ส่งนักมวยมาคนเดียวชกให้จบเด้อ บ่ต้องเปลี่ยนตัวไปมา\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nทับทิม · ค่ายหมัดหนักพิมาย (แต่เตะเด้อ ฮ่า ๆ)",
  again:"ผู้จัดการเด้อ!\n\nถ้วยยังอยู่โคราชเด้อ ทับทิมบ่ได้ไปไส ถ้าพร้อมแล้วกะส่งนักมวยมาอีก คนเก่าคนใหม่กะได้\n\nบ่ต้องเกรงใจเด้อ มาเลย!\n\nทับทิม",
  wait:"บ่เป็นหยังเด้อ ทับทิมรอได้ ไผเจ็บกะพักก่อน — ทับทิม",
  pre:[n=>`${n}! มาเด้อ ทับทิมรอมาโดนแล้ว เตะโคราชบ่เคยมีไผเห็นมาก่อนดอก ฮ่า ๆ`,n=>`นัดนี้ทับทิมสิเอาจริงเด้อ ระวังเตะกระโดดเด้อ`,n=>`นัดสุดท้ายแล้ว… พ่อบ่เคยมาเบิ่งทับทิมชกจักเทื่อ มื้อนี้ทับทิมสิใช้หมัดหนักโคราชของบ้านเฮา ให้พ่อเห็นว่าทับทิมกะเป็นลูกหลานหมัดหนัก`],
  sty:["footwork","footwork","power"],
  reply:"ฉันก็ไม่ยอมเหมือนกัน",pairLine:"หมัดโคราชของคนกรุงเทพฯ จะเป็นของแท้ไหม ดูเอาเองแล้วกัน",
  win:["ฮ่า ๆ คักแท้ แต่ทับทิมได้นัดแรกเด้อ!","อีกนัดเดียวเด้อ ทับทิมสิเอาถ้วยไว้ที่โคราช","…"],
  lose:["โอ๊ย เจ็บหลาย! เก่งแท้เด้อ นัดหน้าทับทิมเอาคืน","ฮ่า ๆ…บ่ฮาแล้วเด้อ นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"tabtim",f:"happy",l:"fight",t:"ฮ่า ๆ ถ้วยยังอยู่โคราชเด้อ! แต่ค่ายศิริชัยแซบแท้ ทับทิมเจ็บทั้งตัวเลย"},{n:"tabtim",f:"flustered",l:"fight",t:"มาอีกเด้อ ทับทิมสิรอ… บ่ได้คิดฮอดดอก แค่อยากชกด้วยอีก"},{n:"nar",t:"ทับทิมโบกมือเสียงดังจนพิธีกรต้องเลื่อนไมค์หนี"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.isan.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคอีสานจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคอีสาน ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ทับทิมวิ่งเข้ามากอดผู้จัดการกลางเวทีต่อหน้าคนทั้งงาน กอดแน่นจนคุณเกริกต้องยืนถือถ้วยรอ"},
   {n:"tabtim",f:"happy",l:"fight",t:"แพ้กะแพ้! แต่ขอกอดเอาคืนหน่อยเด้อ ฮ่า ๆ… อีกแป๊บเดียว"},
   {n:"nar",t:"ท้ายเวที ชายวัยกลางคนผิวคล้ำยืนนิ่งอยู่หลังคนดู พยักหน้าให้ทับทิมหนึ่งครั้ง แล้วเดินออกไป"},
   {n:"tabtim",f:"flustered",l:"fight",t:"…พ่อ? พ่อมาเบิ่งเด้…"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ทับทิม")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นงานบุญบั้งไฟริมโขงยังไม่เลิก ทับทิมพาผู้จัดการเดินเลี่ยงคนออกมาที่ท่าน้ำ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ตรงนี้ทับทิมมานั่งตั้งแต่น้อย ๆ เบิ่งบั้งไฟขึ้นฟ้า แล้วคิดว่าสักมื้อสิเตะให้สูงเท่านั้น"},
   {n:"nar",t:"บั้งไฟลูกสุดท้ายพุ่งขึ้นฟ้า ทับทิมเงียบไปเป็นครั้งแรกตั้งแต่รู้จักกัน"},
   {n:"tabtim",f:"sad",l:"casual",t:"ทับทิมส่งเงินให้น้องสามคนเรียนเด้อ… แต่พ่อบ่เคยยอมรับว่าเตะกะเป็นมวยโคราชได้"},
   {n:"tabtim",f:"sad",l:"casual",t:"มื้อนี้พ่อมาเบิ่ง… ทับทิมแพ้ต่อหน้าพ่อ แต่เป็นครั้งแรกที่พ่อพยักหน้า",choice:[
     {t:"\"พ่อเห็นแล้วว่าเตะของเธอเป็นมวยโคราชจริง ๆ\"",fx:G2=>{rgMeet(G2,"tabtim",4);},then:[{n:"tabtim",f:"flustered",l:"casual",t:"…อย่าพูดดี ๆ แบบนี้สิ ทับทิมสิฮ้องไห้แล้วเด้อ"}]},
     {t:"\"เธอเตะสูงกว่าบั้งไฟไปแล้วนะ\"",fx:G2=>{rgMeet(G2,"tabtim",3);},then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ บ้าบอ! …แต่ขอบใจเด้อ"}]}]},
   {n:"nar",t:"ทับทิมเอนหัวพิงไหล่ผู้จัดการเงียบ ๆ จนควันบั้งไฟจางหายไปจากฟ้า"},
   {n:"tabtim",f:"flustered",l:"casual",t:"…บ่ต้องบอกไผเด้อว่าทับทิมเงียบได้ เสียชื่อหมด"}]},
 central:{ring:"central",venue:"เวทีริมน้ำ อยุธยา",pair:"rin",nightBg:"boat",
  perk:{name:"หมัดเจ้าหญิง",desc:"หมัดแรงขึ้น 12% · ป้องกันวงในดีขึ้น",fx:{dmg:{punch:.12},clDef:1}},
  letter:"Dear ผู้จัดการค่ายศิริชัย\n\nสี่เข็มขัดภาคกลางครบแล้วนะคะ ยินดีด้วย ฉันดูไลฟ์ทุกไฟต์ …ไม่ได้ตั้งใจดูหรอก มันขึ้นฟีดเอง\n\nศึกชิงแชมป์ที่เวทีริมน้ำอยุธยา 3 นัด ชนะ 2 ส่งนักมวยมาคนเดียวทั้งซีรีส์นะคะ ฉันไม่ชอบเปลี่ยนคู่กลางเรื่อง\n\nเลือกได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nอลิเซีย · ค่ายหนุมานลพบุรี",
  again:"ผู้จัดการคะ\n\nถ้วยยังอยู่กับฉันนะคะ แต่ยอดวิวคลิปไฟต์ของเรายังขึ้นอยู่เลย คนดูอยากเห็น rematch\n\nพร้อมเมื่อไหร่ก็ส่งนักมวยมา ฉันรอได้ …ไม่ได้รอเพราะคุณนะ\n\nอลิเซีย",
  wait:"ไม่เป็นไรค่ะ สุขภาพนักมวยสำคัญกว่าคอนเทนต์ — อลิเซีย",
  pre:[n=>`${n} สินะ ยินดีที่ได้รู้จัก กล้องจับอยู่นะคะ ชกให้สมกับที่ทุกคนดูอยู่`,n=>`นัดนี้ไม่มีโชว์แล้วนะ ฉันจะรอให้เธอเข้ามาก่อน แล้วสวนด้วยหมัดที่ซ้อมมาเพื่อเธอโดยเฉพาะ`,n=>`นัดตัดสิน… ฉันจะเข้าไปชกถึงตัวเธอเอง บอกไว้ก่อน ฉันไม่ได้ดังเพราะหน้าตา`],
  sty:["footwork","counter","inside"],
  reply:"ฉันมาชก ไม่ได้มาออกกล้อง",pairLine:"สถิติหมัดของคุณฉันอ่านมาหมดแล้วค่ะ ทุกเปอร์เซ็นต์",
  win:["ขอบคุณค่ะ คลิปนี้ยอดวิวคงพุ่ง… แต่นัดหน้าอย่าเพิ่งยอมแพ้นะ","อีกนัดเดียว ถ้วยจะอยู่ที่ลพบุรีต่อไป","…"],
  lose:["…โอเค ยอมรับค่ะ เธอเก่งจริง แต่อย่าเข้าใจผิด ฉันยังไม่จบ","ฉันจะไม่ตัดคลิปนี้ทิ้ง เก็บไว้ดูว่าพลาดตรงไหน นัดสุดท้ายเจอกัน","…"],
  lost:(G,J)=>[{n:"alicia",f:"happy",l:"fight",t:"ถ้วยยังเป็นของฉันค่ะ ขอบคุณที่ทำให้คอนเทนต์คืนนี้ดีที่สุดของปี"},{n:"alicia",f:"flustered",l:"fight",t:"…ไม่ใช่สิ ไม่ใช่เรื่องคอนเทนต์ ฉันอยากชกกับค่ายคุณอีกจริง ๆ"},{n:"nar",t:"อลิเซียปิดกล้องก่อนลงเวที ครั้งแรกของคืนนั้น"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.central.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคกลางจบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคกลาง ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"แฟลชกล้องรุมเข้ามา คุณเกริกยิ้มให้กล้องขณะยื่นถ้วยให้ อลิเซียเดินฝ่าช่างภาพมาหยุดตรงหน้าผู้จัดการ"},
   {n:"alicia",f:"happy",l:"fight",t:"ยินดีด้วยค่ะ… แล้วก็ ฉันยังไม่ได้เซ็นกับใครนะ"},
   {n:"alicia",f:"flustered",l:"fight",t:"…เข้าใจไหม ไม่ต้องตอบตอนนี้"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"อลิเซีย")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"ค่ำนั้นอลิเซียเช่าเรือลำเล็กลำหนึ่งไว้ ไม่มีทีมงาน ไม่มีช่างภาพ"},
   {n:"alicia",f:"happy",l:"casual",t:"ล่องรอบเกาะเมืองหนึ่งรอบ ไม่มีใครถ่าย ไม่มีใครไลฟ์ …ฉันจองไว้ตั้งแต่นัดแรก เผื่อแพ้จะได้มีที่ร้องไห้"},
   {n:"nar",t:"เรือผ่านวัดไชยวัฒนารามที่เปิดไฟสีทอง อลิเซียหยิบโทรศัพท์ขึ้นมา แล้วลบแอปไลฟ์ทิ้งต่อหน้าผู้จัดการ"},
   {n:"alicia",f:"sad",l:"casual",t:"คืนนี้ไม่ใช่คอนเทนต์ …ทุกคนคิดว่าฉันดังเพราะหน้าตา สปอนเซอร์ก็คิดแบบนั้น นาคาลีกส่งสัญญามาให้ฉันเป็นคนแรก"},
   {n:"alicia",f:"sad",l:"casual",t:"ฉันเกือบเซ็นแล้วนะ ถ้าไม่ได้เจอค่ายที่ชนะฉันได้โดยไม่ต้องมีกล้องสักตัว",choice:[
     {t:"\"เธอชนะมาด้วยหมัด ไม่ใช่หน้าตา\"",fx:G2=>{rgMeet(G2,"alicia",3);},then:[{n:"alicia",f:"happy",l:"casual",t:"…พูดซ้ำอีกทีได้ไหม ฉันไม่ได้อัดเสียงไว้"}]},
     {t:"\"คืนนี้ไม่มีกล้อง งั้นก็เป็นแค่อลิเซียไปเลย\"",fx:G2=>{rgMeet(G2,"alicia",4);},then:[{n:"alicia",f:"flustered",l:"casual",t:"…นั่นแหละที่ฉันกลัวที่สุด แต่ก็โอเค สำหรับคืนนี้"}]}]},
   {n:"nar",t:"หิ่งห้อยบินวนรอบหัวเรือ อลิเซียไม่พูดอะไรอีกเลยจนเรือเทียบท่า"},
   {n:"alicia",f:"flustered",l:"casual",t:"อย่าเข้าใจผิดนะ ฉันจะโหลดแอปกลับคืนพรุ่งนี้เช้า …อาจจะสาย ๆ หน่อย"}]},
 south:{ring:"south",venue:"เวทีเมืองเก่า ภูเก็ต",pair:"mali",nightBg:"andaman",
  perk:{name:"พายุสยบคลื่น",desc:"หลบได้ดีขึ้น 2% · ฟื้นแรงระหว่างยกเร็วขึ้น 12%",fx:{evade:.02,regen:.12}},
  letter:"ถึง ผู้จัดการค่ายศิริชัย\n\nเข็มขัดภาคใต้ครบสี่แล้ว\n\nมาภูเก็ต ชกสามนัด ชนะสองได้ถ้วย ส่งมาคนเดียว\n\nเลือกที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nชบา\n\nป.ล. ฝากบอกมะลิว่า…ไม่มีอะไร",
  again:"ผู้จัดการ\n\nถ้วยยังอยู่ภูเก็ต\n\nพร้อมเมื่อไหร่ก็มา\n\nชบา",
  wait:"รอได้ — ชบา",
  pre:[n=>`…${n} เข้ามาก่อนเลย`,n=>`นัดนี้ไม่หลบแล้ว`,n=>`นัดสุดท้าย "ท่าดีไชยา" จะให้ดู ม่ายมีใครถอย`],
  sty:["counter","pressure","footwork"],
  reply:"…ไม่ถอยเหมือนกัน",pairLine:"พี่ชบา… ครั้งนี้มะลิจะไม่ร้องไห้แล้วนะ",
  win:["…หรอย","อีกนัด","…"],
  lose:["…ดี","…นัดสุดท้าย","…"],
  lost:(G,J)=>[{n:"chaba",f:"happy",l:"fight",t:"…ถ้วยอยู่นี่"},{n:"chaba",f:"flustered",l:"fight",t:"มาอีกได้ …อยากให้มา"},{n:"nar",t:"ชบาพูดเท่านั้นแล้วเดินลงเวทีไป ทุกคนในค่ายหันมามองหน้ากัน"}],
  cup:(G,J)=>{const me=G.F[G.region.champ.south.fid],top=rgTopGirl(G);return [
   {n:"nar",t:`ระฆังยกสุดท้ายดังขึ้น กรรมการชูแขน${me.name} ศึกชิงแชมป์ภาคใต้จบที่ ${J.w}-${J.l}`},
   {n:"npc",who:"พิธีกร",t:`ท่านผู้ชมครับ! ถ้วยเจ้าภาคใต้ ได้แก่… ${me.name} จากค่ายศิริชัย!`},
   {n:"nar",t:"ข้างเวที ชายหนุ่มนั่งรถเข็นปรบมือช้า ๆ ชบาเดินไปหาเขาก่อน แล้วถึงเดินกลับมาหาผู้จัดการ"},
   {n:"nar",t:"ชบาจับมือผู้จัดการแน่น ไม่พูดอะไร แล้วเดินจากไปเฉย ๆ ทั้งที่ยังไม่ปล่อยมือ จนต้องเดินตามไปสามก้าว"},
   {n:"chaba",f:"flustered",l:"fight",t:"…พี่ชาย อยากรู้จัก"},
   ...(top?[{n:top.id,f:"pout",l:"fight",t:rgJeal(top.id,"ชบา")}]:[])]},
  night:(G,T)=>[
   {n:"nar",t:"คืนนั้นชบาพาผู้จัดการขี่มอเตอร์ไซค์พ่วงข้างไปชายหาดที่ไม่มีนักท่องเที่ยว พระจันทร์เต็มดวงพอดี"},
   {n:"chaba",f:"happy",l:"casual",t:"…ที่นี่ ตอนเด็ก พี่ชายพามาซ้อมวิ่งในทราย"},
   {n:"chaba",f:"sad",l:"casual",t:"เรือคว่ำ พี่ขาเจ็บ ม่ายได้ชกอีก ชบาชกแทน แล้วนาคาเอาเรื่องพี่ไปทำโฆษณา ม่ายถามสักคำ"},
   {n:"nar",t:"ชบาโยนเปลือกหอยลงทะเลไกลมาก คลื่นซัดมันกลับมาที่เท้าทั้งคู่",choice:[
     {t:"\"พี่ชายเธอคงภูมิใจในตัวเธอมาก\"",fx:G2=>{rgMeet(G2,"chaba",3);},then:[{n:"chaba",f:"happy",l:"casual",t:"…พี่บอกแบบนั้นเหมือนกัน"}]},
     {t:"นั่งลงข้าง ๆ เงียบ ๆ",fx:G2=>{rgMeet(G2,"chaba",4);},then:[{n:"nar",t:"ชบานั่งลงตาม ไหล่ชนกันนิดหนึ่ง ไม่มีใครขยับหนี"}]}]},
   {n:"chaba",f:"flustered",l:"casual",t:"…อยู่ต่ออีกวันได้ไหม …ไซ"},
   {n:"nar",t:"ชบาหันหน้าไปทางทะเลทันทีที่พูดจบ แต่หูแดงจนเห็นได้ใต้แสงจันทร์"}]}};
/* the camp girl closest to you (bond 40+) — she reacts when a champion gets near */
function rgTopGirl(G){const L=CANON_IDS.map(id=>G.F[id]).filter(f=>f&&f.camp==="player"&&(f.bond||0)>=40).sort((a,b)=>(b.bond||0)-(a.bond||0));return L[0]||null;}
function rgJeal(id,champ){const L={kati:`ครูคะ… ${champ}ยืนใกล้ไปหรือเปล่า หนูแค่สังเกตเฉย ๆ ค่ะ`,mali:`มะลิก็อยากได้กอดบ้างนะ~ …ล้อเล่นค่ะ (ไม่ได้ล้อเล่น)`,
  rin:`ระยะห่างระหว่างผู้จัดการกับ${champ}เมื่อกี้ น้อยกว่าค่าเฉลี่ยของทั้งคืนค่ะ ข้อมูลเฉย ๆ`,ploy:`ยิ้มอะไรนักหนา …เปล่า ไม่ได้ว่าอะไร`,fah:`เฮ้! ${champ}! ผู้จัดการเป็นของค่ายศิริชัยนะ! …หมายถึงผู้จัดการค่ายน่ะ!`};return L[id]||"…";}
function rgMeet(G,cid,v){const R=G.region,m=R.meet;m[cid]=(m[cid]||0)+v;rgTouch(G,cid);(R.meetPk=R.meetPk||{})[cid]=Math.max(R.meetPk[cid]||0,m[cid]);}
/* v1.90: any real contact with a champion (a trip to her region, a bout, a visit, a duel, a night out) resets her "haven't seen you" clock */
function rgTouch(G,cid){const R=G.region;if(!R)return;(R.meetT=R.meetT||{})[cid]=gameWeek(G);if(R.miss)delete R.miss[cid];}
/* three weeks apart: she writes · four or more: the bond fades a little each week (outside-camp rate), never below the level she reached */
const RG_MISS={
 north:"ผู้จัดการเจ้า\n\nช่วงนี้เชียงใหม่หนาวแล้วเจ้า หมอกลงทุกเช้าเลย… หนูบ่ได้มีหยังจะเล่าหรอกเจ้า แค่คิดถึงค่ายศิริชัยนิดหน่อย\n\nถ้าว่างก็ขึ้นมาแอ่วเน้อ\n— ใบบัว",
 isan:"พี่ผู้จัดการ!\n\nเงียบหายไปไสเด้อ ทับทิมเปิดไลฟ์ค่ายพี่ดูทุกมื้อ แต่บ่เห็นพี่ออกกล้องเลย\n\nคิดฮอดเด้อ (คิดฮอดค่ายเฉย ๆ บ่ได้คิดฮอดพี่ ฮ่า ๆ)\n— ทับทิม",
 central:"Hi,\n\nยอดวิวคลิปค่ายคุณตกลงนิดหน่อยนะ ฉันเช็กให้แล้ว ไม่ได้ตั้งใจดูหรอก แค่ผ่านตา\n\nมีอะไรคืบหน้าก็… บอกกันบ้างก็ได้\n— อลิเซีย",
 south:"…ช่วงนี้คลื่นแรง\n\nไม่มีอะไร\n\n— ชบา"};
const RG_FLOOR=[20,10,5,0];
/* scenes and fights for the champions */
if(typeof BGIMG!=="undefined")Object.assign(BGIMG,{rg_north:"bg_region_north.webp",rg_northeast:"bg_region_northeast.webp",rg_central:"bg_region_central.webp",rg_south:"bg_region_south.webp",rg_east:"bg_region_east.webp",
  doisuthep:"bg_doisuthep.webp",mekong:"bg_mekong.webp",boat:"bg_boat.webp",andaman:"bg_andaman.webp",
  night_north:"bg_night_north.webp",night_isan:"bg_night_isan.webp",night_central:"bg_night_central.webp",night_south:"bg_night_south.webp",
  gala:"bg_gala_ballroom.webp",hotel_room:"bg_hotel_room.webp",gas_station:"bg_gas_station.webp",camp_buatasao:"bg_camp_buatasao.webp",tasao_shrine:"bg_tasao_shrine.webp",
  camp_phimai:"bg_camp_phimai.webp",somtam_stall:"bg_somtam_stall.webp",bus_terminal:"bg_bus_terminal.webp",mali_home:"bg_mali_home.webp",pier_south:"bg_pier_south.webp",
  camp_andaman:"bg_camp_andaman.webp",camp_hanuman:"bg_camp_hanuman.webp",lopburi_monkeys:"bg_lopburi_monkeys.webp",krerk_dinner:"bg_krerk_dinner.webp",
  closing_ceremony:"bg_closing_ceremony.webp",naka_underground:"bg_naka_underground.webp",naka_lab:"bg_naka_lab.webp"});
if(typeof SPECIALS!=="undefined")Object.assign(SPECIALS,{
  baibua:[{img:"baibua_special",w:"elbow",def:"ศอกบัวบานกลับหลัง"}],tabtim:[{img:"tabtim_special",w:"kick",def:"เตะกระโดดทับทิมแดง"}],
  alicia:[{img:"alicia_special",w:"punch",def:"อัปเปอร์คัตเจ้าหญิง"}],chaba:[{img:"chaba_special",w:"punch",def:"หมัดพายุสยบคลื่น"}]});


/* ---------- round 4: the champion visits the camp between bout 1 and bout 2 — a minigame duel, best of 3 ---------- */
const DUEL_CFG={
 north:{game:"bag",dk:"hard",bars:5,partner:"kati",label:"เตะกระสอบตามกลองแขก (ยาก)",target:[.74,.78,.82],unit:"ความแม่นยำ"},
 isan:{game:"somtam",dk:"normal",bars:5,partner:"ploy",label:"ตำส้มตำ",target:[.76,.8,.84],unit:"ความแม่นยำ"},
 central:{game:"live",partner:"rin",label:"ไลฟ์ขายของ 30 วินาที",target:[9.7,11.75,13.8],unit:"ยอดขาย"},
 south:{game:"run",partner:"mali",label:"วิ่งแข่ง 100 เมตร",pace:[6.5,6.9,7.3],unit:"เวลา"}};
const DUEL_TALK={
 north:{intro:"ตีกลองแขกให้หนูนะเจ้า… หนูเตะตามจังหวะได้ทุกโน้ตเลยเน้อ",rw:"ลำขนาดเจ้า… ผู้จัดการเลือกนักมวยเก่งแท้",rl:"ขอโทษเจ้า หนูเผลอเอาจริงไปหน่อย",
  win:"หนูแพ้แล้วเจ้า… แต่สนุกที่สุดตั้งแต่ขึ้นชกมาเลย",lose:"หนูชนะเจ้า… ไว้มาแก้มือใหม่เน้อ หนูจะรอ"},
 isan:{intro:"ตำส้มตำแข่งกับคนอีสาน? คักแท้! ทับทิมบ่ยอมแพ้เรื่องนี้ดอกเด้อ",rw:"เฮ้ย! ตำแซบกว่าทับทิมได้จั่งได๋!",rl:"ฮ่า ๆ ส้มตำคือบ้านทับทิมเด้อ",
  win:"ฮ่า ๆ ๆ ทับทิมแพ้คนกรุงเทพฯ เรื่องส้มตำ! อย่าบอกแม่เด้อ… ขอรางวัลปลอบใจได้บ่",lose:"ทับทิมชนะ! คืนนี้ทับทิมตำเลี้ยงทั้งค่ายเอง"},
 central:{intro:"ไลฟ์แข่งกันไหม คนละสามสิบวินาที ใครขายได้มากกว่าชนะ …ฉันไม่ออมมือให้หรอกนะ",rw:"…ยอดขายแพ้ค่ายเล็กได้ยังไงเนี่ย",rl:"มืออาชีพก็ต้องแบบนี้ค่ะ",
  win:"โอเค ยอมรับ ค่ายเธอรู้จักคนดูจริง ๆ …อย่าเข้าใจผิดนะ ไม่ได้ชม",lose:"ฉันชนะ แต่ไลฟ์ของพวกเธอน่าดูกว่าที่คิด"},
 south:{intro:"…วิ่ง ร้อยเมตร",rw:"…ไว",rl:"…",
  win:"…แพ้ …หรอย",lose:"…ยังไม่พอ มะลิ"}};
const RG_VISIT={
 north:G=>[{n:"nar",t:"ใบบัวมาถึงค่ายแต่เช้า ถือตะกร้าข้าวต้มมัดมาฝากทั้งค่าย"},{n:"baibua",f:"happy",l:"casual",t:"หนูมาดูว่าค่ายที่ชนะหนูนัดแรกเป็นจะได เจ้า… ค่ายนี้ทุกคนช่วยกันหมดเลยเน้อ"},
  ...(G.F.kati&&G.F.kati.camp==="player"?[{n:"kati",f:"happy",l:"train",with:"baibua",t:"ท่าเสาเหมือนกัน มาซ้อมด้วยกันไหมคะ"},{n:"nar",t:"ทั้งเช้ากะทิกับใบบัวซ้อมศอกคู่กัน คนหนึ่งสวน อีกคนหลบ จนครูแดงต้องตะโกนเรียกพัก"}]:[]),
  {n:"nar",t:"ตอนเที่ยง ใบบัวนั่งดูทุกคนในค่ายช่วยกันยกหม้อข้าว ล้างนวม ตากผ้าพันมือ แล้วเงียบไปนาน"},
  {n:"baibua",f:"sad",l:"casual",t:"…ที่ค่ายหนู งานพวกนี้หนูทำคนเดียวทั้งหมดเลยเจ้า"},{n:"baibua",f:"flustered",l:"casual",t:DUEL_TALK.north.intro}],
 isan:G=>[{n:"nar",t:"เสียงมอเตอร์ไซค์ดังมาตั้งแต่ปากซอย ทับทิมโบกมือก่อนจอดเสียอีก"},{n:"tabtim",f:"happy",l:"casual",t:"มาเยี่ยมเด้อ! ค่ายนี้แหละที่เตะทับทิมจนมึนนัดแรก ฮ่า ๆ"},
  ...(G.F.ploy&&G.F.ploy.camp==="player"?[{n:"ploy",f:"pout",l:"casual",with:"tabtim",t:"มาทำไมแต่เช้า …ไม่ได้ไล่นะ"},
   {n:"nar",t:"ทับทิมท้าพลอยต่อยกระสอบแข่งกันคนละร้อยหมัด แพ้ไปสิบเจ็ดหมัดแล้วหัวเราะลั่นค่าย"}]:[]),
  {n:"nar",t:"ตอนพักกินข้าว ทับทิมเล่าเรื่องตลกไม่หยุด จนพูดเรื่องหนึ่งหลุดออกมาแบบไม่ทันคิด"},
  {n:"tabtim",f:"sad",l:"casual",t:"…ที่บ้านทับทิมบ่เคยมีไผมาเบิ่งทับทิมชกเลยเด้อ จักเทื่อ ฮ่า ๆ… เอ้า ทำไมเงียบกันหมดล่ะ"},{n:"tabtim",f:"happy",l:"casual",t:DUEL_TALK.isan.intro}],
 central:G=>[{n:"nar",t:"รถตู้สีขาวจอดหน้าค่าย อลิเซียลงมาคนเดียว ใส่แว่นดำ หมวกแก๊ป"},{n:"alicia",f:"happy",l:"casual",t:"ทีมสปอนเซอร์ตามถ่ายฉันทั้งอาทิตย์ ขอหลบที่นี่สักวัน …ไม่ได้มาหาใครเป็นพิเศษหรอกนะ"},
  ...(G.F.rin&&G.F.rin.camp==="player"?[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"ยอดวิวคลิปไฟต์นัดแรกขึ้น 340% ค่ะ ฉันมีกราฟ"}]:[]),
  {n:"nar",t:"อลิเซียบอกว่ามาถ่ายคอนเทนต์ \"หนึ่งวันในค่ายเล็ก\" แต่ทั้งวันไม่ได้เปิดกล้องเลยสักครั้ง นั่งช่วยพับผ้าพันมือกับทุกคนจนเย็น"},
  {n:"alicia",f:"sad",l:"casual",t:"…ที่นี่ไม่มีใครขอให้ฉันยิ้ม แปลกดีนะคะ"},{n:"alicia",f:"flustered",l:"casual",t:DUEL_TALK.central.intro}],
 south:G=>[{n:"nar",t:"ชบามาถึงค่ายโดยไม่บอกใคร ช่วยซ่อมรั้วหลังค่ายไปครึ่งแถวก่อนที่จะมีคนเห็น"},{n:"chaba",f:"happy",l:"casual",t:"…รั้วโยก"},
  ...(G.F.mali&&G.F.mali.camp==="player"?[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มาทำไมไม่บอกมะลิ~ มะลิจะได้เตรียมขนม"}]:[]),
  {n:"nar",t:(G.pets||[]).length?"ตอนพักเที่ยง ทุกคนเห็นชบานั่งลูบสัตว์เลี้ยงของค่ายเงียบ ๆ จนมันหลับคาตัก ชบาไม่ยอมขยับขาเลยครึ่งชั่วโมง":"ตอนพักเที่ยง ทุกคนเห็นชบาแอบแบ่งข้าวให้นกกระจอกหน้าค่าย แล้วรีบทำหน้าเฉยตอนรู้ว่ามีคนเห็น"},
  {n:"chaba",f:"flustered",l:"casual",t:"…ม่ายได้ชอบ แค่มันมาเอง"},{n:"chaba",f:"flustered",l:"casual",t:DUEL_TALK.south.intro}]};
const DUEL={st:null,
  el(){return document.getElementById("minibag");},
  open(r,practice,after){const C=DUEL_CFG[r],F=bagFighters(G).filter(f=>C.game!=="live"||f.canon);if(!F.length){toast("ไม่มีนักมวยที่พร้อมดวล");after&&after(null);return;}
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
    else if(C.game==="run"){BAG.st={phase:"run",mode:"run",practice:true};RUN.pick({id:S.id,duel:{opp:{id:cid,name:RG[S.r].champ,pace:C.pace[S.round-1]},label:`รอบ ${S.round}/3`}});RUN.set();}},
  /* one round finished: res.win (sprint) or res.score against the champion's mark */
  done(res,X){const S=this.st;if(!S)return;const C=DUEL_CFG[S.r],tg=this.target();
    const win=res.win!=null?res.win:res.score>=tg;S.log.push({win,score:res.score,tg});if(win)S.w++;else S.l++;
    if(LIVE.st&&LIVE.st.duel){LIVE.st=null;}
    if(C.game!=="run"){BAG.st={phase:"duel",mode:C.game,id:S.id,practice:true};S.phase="round";this.draw();}},
  next(){const S=this.st;if(!S)return;if(RUN.st){RUN.stop();RUN.st=null;}BAG.st={phase:"duel",mode:DUEL_CFG[S.r].game,id:S.id,practice:true};
    if(S.phase==="round"||DUEL_CFG[S.r].game==="run"){if(S.w>=2||S.l>=2){this.finish();return;}S.round++;S.phase="intro";this.draw();return;}this.draw();},
  finish(){const S=this.st,cid=S.cid,won=S.w>=2;S.phase="end";const out=[];
    if(!S.practice){rgMeet(G,cid,won?4:2);const du=won?5:2;G.dust=(G.dust||0)+du;out.push(`<b class="goldt">✦ +${du}</b>`);
      const f=G.F[S.id];if(f){f.morale=Math.min(100,(f.morale||0)+(won?5:2));out.push(`${esc(f.name)} กำลังใจ +${won?5:2}`);}
      if(won){G.region.duelWon=G.region.duelWon||{};G.region.duelWon[cid]=(G.region.duelWon[cid]||0)+1;}}
    S.out=out;save();this.draw();AU.sfx&&AU.sfx(won?"level":"ui");},
  dots(){const S=this.st;return `<div class="duel-dots">${[0,1,2].map(i=>{const L=S.log[i];return L?(L.win?"🟢":"🔴"):"⚪";}).join("")}</div>`;},
  fmt(v){const C=DUEL_CFG[this.st.r];return C.game==="live"?Math.floor(v)+" ชิ้น":C.game==="run"?v.toFixed(2)+" วิ":Math.round(v*100)+"%";},
  draw(){const S=this.st,el=this.el();if(!S||!el)return;const C=DUEL_CFG[S.r],T=DUEL_TALK[S.r],champ=RG[S.r].champ,me=G.F[S.id];
    const vs=`<div class="duel-vs"><div><img src="${faceSrc(S.id,"happy")}" alt=""><br><b>${esc(me.name)}</b></div><b class="goldt">${S.w} : ${S.l}</b><div><img src="${faceSrc(S.cid,"happy")}" alt=""><br><b>${esc(champ)}</b></div></div>`;
    if(S.phase==="intro"){const F=bagFighters(G).filter(f=>C.game!=="live"||f.canon),tg=this.target();
      el.innerHTML=`<div class="mbox px"><h2>ดวลกับ${esc(champ)} · ${esc(C.label)}</h2>${this.dots()}${vs}
       <p class="meta center">รอบที่ ${S.round} จาก 3 · ชนะ 2 รอบก่อนชนะการดวล${tg!=null?` · ${esc(champ)}ทำไว้ ${this.fmt(tg)} (${C.unit})`:""}</p>
       ${S.round===1?`<b class="meta">ใครลงดวล</b><div class="mbpick">${F.map(x=>`<button class="mbf ${x.id===S.id?"on":""}" data-du="pick" data-v="${x.id}"><img src="${faceSrc(x.id,"happy")}" alt=""><small>${esc(x.name)}</small></button>`).join("")}</div>`:""}
       ${S.practice?`<p class="meta center">ดวลซ้อม · ไม่มีรางวัล</p>`:""}
       <div class="mfoot roadbtns"><button class="btn" data-mb="close">ยอมแพ้</button><button class="btn primary" data-du="go">เริ่มรอบ ${S.round} ▸</button></div></div>`;return;}
    if(S.phase==="round"){const L=S.log[S.log.length-1];
      el.innerHTML=`<div class="mbox px"><h2>${L.win?"ชนะรอบนี้!":"แพ้รอบนี้"}</h2>${this.dots()}${vs}
       <p class="center">${esc(me.name)} <b>${this.fmt(L.score)}</b> · ${esc(champ)} <b>${this.fmt(L.tg)}</b></p>
       <p class="center"><i>${esc(champ)}: "${esc(L.win?T.rw:T.rl)}"</i></p>
       <div class="mfoot roadbtns"><button class="btn primary" data-du="next">ต่อไป ▸</button></div></div>`;return;}
    if(S.phase==="end"){const won=S.w>=2;
      el.innerHTML=`<div class="mbox px"><h2>${won?`ชนะการดวล ${S.w}-${S.l}!`:`${esc(champ)}ชนะ ${S.l}-${S.w}`}</h2>${this.dots()}${vs}
       <p class="center"><i>${esc(champ)}: "${esc(won?T.win:T.lose)}"</i></p>${S.out&&S.out.length?`<p class="center"><span class="rwl">${S.out.map(x=>`<span class="rwi">${x}</span>`).join("")}</span></p>`:""}
       <div class="mfoot roadbtns"><button class="btn primary" data-du="end">กลับค่าย</button></div></div>`;}}};

/* v1.90 round 5: the opening gala (the week after the invitation) and the story beat after the first cup — the green-gold contract */
const RG_CID={north:"baibua",isan:"tabtim",central:"alicia",south:"chaba"};
const rgIn=(G,id)=>!!(G.F[id]&&G.F[id].camp==="player");
const rgIf=(ok,steps)=>ok?steps:[];
function rgGala(G){const top=rgTopGirl(G),fah=rgIn(G,"fah"),ploy=rgIn(G,"ploy"),R=G.region,meet=(id,v)=>G2=>rgMeet(G2,id,v);return [
 {n:"nar",bg:"gala",t:"รถของค่ายจอดหน้าโรงแรมกลางกรุงเทพฯ ป้ายนาคาเอเนอร์จี้ดริงค์สูงเท่าตึกสามชั้น พญานาคสีเขียวทองขดตัวชูคออยู่กลางป้าย"},
 {n:"nar",t:"มาสคอตพญานาคตัวเท่าคนยืนโบกมืออยู่หน้าประตู ทุกครั้งที่มีแขกเดินผ่าน มันจะชกลมให้ดูสองที"},
 {n:"coach",t:"ครูใส่สูทครั้งล่าสุดตอนงานบวชหลานชาย… คอเสื้อมันรัดชะมัด"},
 ...rgIf(fah,[{n:"fah",f:"flustered",l:"casual",t:"ไหนบอกว่างานเลี้ยงไง! ทำไมทุกคนแต่งตัวเหมือนไปงานแต่งงาน ฟ้าใส่ชุดวอร์มมานะ!"}]),
 ...rgIf(fah&&rgIn(G,"kati"),[{n:"kati",f:"happy",l:"casual",t:"หนูบอกแล้วนะคะว่าบัตรเชิญเขียนว่า \"แต่งกายสุภาพ\"… ฟ้าตอบว่า \"ชุดวอร์มก็สุภาพ\""}]),
 {n:"nar",show:[],t:"ไฟในห้องบอลรูมหรี่ลง เสียงกลองยาวรัวขึ้น พิธีกรเดินออกมากลางเวที"},
 {n:"npc",who:"พิธีกร",t:"ขอต้อนรับทุกท่านสู่ศึกชิงเจ้าสี่ภาค ครั้งแรกของประเทศไทย! ขอเชิญประธานนาคาเอเนอร์จี้ดริงค์ อดีตความหวังเหรียญโอลิมปิกของชาติ… คุณเกริกครับ!"},
 {n:"nar",show:[{id:"npc:krerk"}],t:"ชายในสูทเขียวเข้มปักลายนาคสีทองเดินขึ้นเวที ยิ้มกว้าง แล้วยกมือห้ามเสียงปรบมือเบา ๆ"},
 {n:"npc",who:"คุณเกริก",t:"เรื่องโอลิมปิกมันนานมาแล้วครับ วันนี้เป็นวันของน้อง ๆ นักมวย ไม่ใช่ของคนแก่ที่ชกไม่ได้แล้ว"},
 {n:"npc",who:"คุณเกริก",t:"กติกาง่าย ๆ ครับ ภาคละสี่จังหวัด เก็บเข็มขัดแชมป์ประจำจังหวัดให้ครบสี่เส้น แล้วจะได้สิทธิ์ท้าแชมป์ประจำภาค ชกสามนัด ชนะสองได้ถ้วย"},
 {n:"npc",who:"คุณเกริก",t:"ค่าเดินทางตอนเก็บเข็มขัด ค่ายจ่ายกันเองนะครับ ส่วนศึกชิงถ้วย นาคาเอเนอร์จี้ออกให้หมด… ดื่มนาคา ชกไม่มีหมด!"},
 {n:"nar",show:[],t:"เสียงหัวเราะดังทั่วห้อง สปอตไลต์สี่ดวงส่องลงมาบนเวที พิธีกรอ่านชื่อแชมป์ประจำภาคทีละคน"},
 {n:"npc",who:"พิธีกร",show:[{id:"baibua",l:"casual"}],t:"แชมป์ภาคเหนือ ดอกบัวซ่อนหนามแห่งล้านนา… ใบบัว!"},
 {n:"baibua",f:"happy",l:"casual",t:"สวัสดีเจ้า… หนูใบบัว มาจากค่ายบัวท่าเสา เชียงใหม่เจ้า"},
 {n:"nar",t:"เสียงเบาจนพิธีกรต้องยื่นไมค์เข้าไปใกล้ ๆ ใบบัวยิ้มหวาน"},
 {n:"baibua",f:"happy",l:"casual",t:"ศอกของหนูบ่ได้แรงหยังหรอกเจ้า… แค่คู่ชกมักจะลุกบ่ขึ้นเท่านั้นเอง"},
 {n:"npc",who:"พิธีกร",show:[{id:"tabtim",l:"casual"}],t:"แชมป์ภาคอีสาน ทับทิมเอกเซียนอีสาน… ทับทิม!"},
 {n:"tabtim",f:"happy",l:"casual",t:"สวัสดีพี่น้องทั้งห้องเด้อ! แอร์เย็นคักแท้ หนาวกว่าโคราชหน้าหนาวอีก ฮ่า ๆ ๆ"},
 {n:"nar",t:"ทับทิมหัวเราะลั่นจนทั้งห้องหัวเราะตาม แต่ระหว่างนั้นเธอแอบก้าวยาว ๆ วัดความกว้างของเวทีไปด้วย"},
 {n:"npc",who:"พิธีกร",show:[{id:"alicia",l:"casual"}],t:"แชมป์ภาคกลาง เจ้าหญิงแห่งวงการมวยไทย… อลิเซีย!"},
 {n:"nar",t:"แฟลชกล้องรัวจนห้องสว่างวาบ อลิเซียหันยิ้มให้กล้องทีละตัวแบบไม่พลาดสักตัว"},
 {n:"alicia",f:"happy",l:"casual",t:"ขอบคุณค่ะ Thank you, everyone. ปีนี้ฉันไม่ได้มาถ่ายรูปนะคะ ฉันมาเพื่อชนะ"},
 {n:"npc",who:"พิธีกร",show:[{id:"chaba",l:"casual"}],t:"และแชมป์ภาคใต้ หมัดพายุสยบคลื่น… ชบา!"},
 {n:"chaba",f:"happy",l:"casual",t:"…มาชก ไม่ได้มาแหลง"},
 {n:"nar",t:"ห้องเงียบไปสามวินาที แล้วพิธีกรก็รีบชวนทุกคนปรบมือ"},
 {n:"nar",t:"พอพิธีเปิดจบ แชมป์ทั้งสี่เดินลงจากเวที แล้วตรงมาที่โต๊ะของค่ายศิริชัย",choice:[
   {t:"ทักใบบัวก่อน",fx:meet("baibua",1),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการค่ายศิริชัยตัวจริงแท้ ๆ… หนูดูไลฟ์ไฟต์ค่ายนี้ทุกนัดเลยเจ้า"}]},
   {t:"ทักทับทิมก่อน",fx:meet("tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"พี่ผู้จัดการ! ทับทิมจำหน้าได้ ไลฟ์ค่ายพี่ม่วนคักแท้เด้อ"}]},
   {t:"ทักอลิเซียก่อน",fx:meet("alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"Oh ค่ายที่ใคร ๆ ก็พูดถึง ตัวจริงดูธรรมดากว่าในคลิปนะคะ …ฉันชมนะ"}]},
   {t:"ทักชบาก่อน",fx:meet("chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ชบา"},{n:"nar",t:"ชบาพยักหน้าครั้งเดียว แต่ยืนอยู่ตรงนั้นนานกว่าที่จำเป็น"}]}]},
 ...rgIf(rgIn(G,"kati"),[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"กะทิใช่ก่เจ้า ท่าเสาเหมือนกันเจ้า… หนูได้ยินชื่อมาตั้งนานแล้ว"},{n:"kati",f:"flustered",l:"casual",t:"ห-หนูก็ได้ยินชื่อพี่ใบบัวค่ะ! ศอกบัวบานกลับหลังที่ลือกันนั่น…"}]),
 ...rgIf(ploy,[{n:"tabtim",with:"ploy",f:"happy",l:"casual",t:"อ้อ! นี่เองหมัดโคราชของคนกรุงเทพฯ ทับทิมอยากลองโดนสักหมัดเด้อ"},{n:"ploy",f:"happy",l:"casual",t:"…อยากลองก็ขึ้นเวทีมาสิ"}]),
 ...rgIf(rgIn(G,"rin"),[{n:"alicia",with:"rin",f:"happy",l:"casual",t:"เธอคือคนที่อ่านสัญญาสิบสี่หน้าก่อนเซ็นใช่ไหม? คลิปนั้นยอดวิวเยอะกว่าคลิปไฟต์ฉันอีกนะ"},{n:"rin",f:"happy",l:"casual",t:"ก็ต้องอ่านสิคะ ตัวหนังสือเล็ก ๆ ท้ายสัญญามักเป็นส่วนที่แพงที่สุด"}]),
 ...rgIf(rgIn(G,"mali"),[{n:"mali",with:"chaba",f:"surprised",l:"casual",t:"พี่ชบา!! พี่ชบาใช่ไหมคะ! มะลิเองไง มะลิตัวเล็กที่ไชยา!"},{n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},
   {n:"nar",t:"ชบาหันหลังเดินไป แต่มะลิทันเห็นว่าหูของเธอแดงไปถึงต้นคอ"},{n:"mali",f:"sad",l:"casual",t:"…ไม่ผิดคนหรอก มะลิจำได้"}]),
 ...rgIf(fah,[{n:"fah",f:"pout",l:"casual",t:"เดี๋ยวนะ! ใบบัวมีกะทิ ทับทิมมีพลอย อลิเซียมีริน ชบามีมะลิ… แล้วฟ้าล่ะ! ทำไมฟ้าไม่มีพี่น้องร่วมสายเลยสักคน!"},
   {n:"coach",t:"สายของฟ้ายังไม่มีชื่อ ก็ตั้งชื่อเองสิ"}]),
 ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"แชมป์ทั้งสี่")}]:[]),
 {n:"npc",who:"พิธีกร",show:[],t:"และอีกหนึ่งข่าวใหญ่! นาคาเอเนอร์จี้ขอแนะนำค่ายรับเชิญพิเศษ ที่จะร่วมชกในทุกภาค… ค่ายเวกเตอร์ กรุงเทพฯ!"},
 {n:"nar",t:ploy?"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่พลอยนานกว่าคนอื่น":"ไพลินเดินขึ้นเวทีในชุดสูทขาว สายตากวาดไปทั่วห้อง แล้วหยุดอยู่ที่โต๊ะค่ายศิริชัย"},
 {n:"pailin",f:"happy",t:"ข้อมูลของทุกค่ายในห้องนี้อยู่ในแท็บเล็ตของฉันหมดแล้วค่ะ …ขอให้สนุกกับการเดินทางนะคะ"},
 {n:"nar",show:[{id:"pailin"},{id:"npc:krerk"}],t:"คุณเกริกเดินเข้าไปจับมือไพลิน ตบไหล่เบา ๆ สองที ท่าทางเหมือนคนที่รู้จักกันมานานกว่าที่ใครในห้องรู้"},
 {n:"nar",show:[],t:"ช่างภาพเรียกทุกค่ายขึ้นถ่ายรูปหมู่หน้าป้ายพญานาค"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"มุมห้องข้างคุณเกริก มีผู้หญิงใส่ฮู้ดสีขาวยืนนิ่งอยู่คนเดียว ปอยผมสีขาวปลายแดงโผล่ออกมาจากฮู้ด ไม่มีใครแนะนำเธอ"},
 {n:"nar",show:[{id:"lada",l:"casual"}],t:"ข้อนิ้วของเธอพันเทปแบบนักสู้ MMA ไม่ใช่ผ้าพันมือแบบมวยไทย"},
 fah?{n:"fah",f:"flustered",l:"casual",t:"…ผู้จัดการ คนใส่ฮู้ดตรงนั้นมองฟ้าอยู่ ขนลุกไปทั้งตัวเลย"}:{n:"coach",t:"คนใส่ฮู้ดตรงนั้น… ยืนเหมือนคนที่พร้อมจะชกได้ตลอดเวลา"},
 {n:"nar",show:[],t:"แฟลชกล้องวาบขึ้น พอแสงจางลง มุมห้องตรงนั้นก็ว่างเปล่า"},
 {fx:G2=>{for(const r of RG_ORDER)rgTouch(G2,RG_CID[r]);}},{n:"coach",t:"เอาล่ะ กลับไปซ้อมกัน เข็มขัดสิบหกเส้นไม่ได้มาเพราะใส่สูทหล่อหรอก"}];}
/* the week after the first cup: the green-gold contract */
const RG_C1_CALL={
 north:["ผู้จัดการได้ซองเขียวเหมือนกันก่เจ้า… ข้อสิบสี่จุดสาม หนูก่สะดุดตรงนั้นเหมือนกัน","ตอนเวกเตอร์มาขอซื้อค่ายหนู สัญญาของเขาก่มีข้อแบบนี้ ตัวหนังสือเหมือนกันเปี๊ยบเลยเจ้า"],
 isan:["พี่ผู้จัดการ ได้ซองเขียวคือกันบ่! ทับทิมอ่านบ่จบดอก แต่น้องชายเรียนนิติฯ บอกว่าข้อสิบสี่มันแปลก ๆ","แล้วฮู้บ่ เวกเตอร์เคยส่งสัญญามาให้ทับทิมตอนต้นปี ข้อเดียวกันเป๊ะเลยเด้อ"],
 central:["ซองเขียวทองมาถึงหรือยังคะ? ผู้จัดการส่วนตัวของฉันบอกให้เซ็น แต่ฉันอ่านข้อ 14.3 แล้ว…","ฉันคุ้นประโยคนั้น เวกเตอร์ส่งข้อเสนอมาให้ฉันก่อนทัวร์ ใช้คำเดียวกันทุกตัวอักษรเลยค่ะ"],
 south:["…ซองเขียวมาแล้วใช่ไหม","เวกเตอร์ส่งสัญญามาให้ก่อนทัวร์ ข้อเดียวกัน คำเดียวกัน …ไม่ใช่เรื่องบังเอิญ"]};
function rgCup1(G,r){const cid=RG_CID[r],rin=rgIn(G,"rin"),R=G.region,L=RG_C1_CALL[r];return [
 {n:"nar",bg:"camp",t:"จดหมายปิดผนึกสีเขียวทองมาถึงค่าย ตราพญานาคประทับครั่งไว้กลางซอง"},
 {n:"nar",t:"\"สัญญาเจ้าของถ้วย ศึกชิงเจ้าสี่ภาค\" นาคาเอเนอร์จี้ขอให้ค่ายที่ได้ถ้วยเซ็นรับสิทธิ์ร่วมงานโปรโมต แนบสำเนาเช็คค่าตัวมาให้ดูก่อน ฿30,000"},
 {n:"coach",t:"สามหมื่นแค่ถ่ายโฆษณาเนี่ยนะ? เซ็นเลยสิ… ว่าแต่ตัวหนังสือมันเล็กชะมัด"},
 ...(rin?[{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวก่อนค่ะ ขอสิบห้านาที"},
   {n:"nar",t:"สิบห้านาทีกลายเป็นหนึ่งชั่วโมง รินอ่านครบทั้งยี่สิบสองหน้า ขีดปากกาแดงไปเจ็ดจุด"},
   {n:"rin",f:"sad",l:"casual",t:"หน้า 19 ข้อ 14.3 ค่ะ \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"rin",f:"sad",l:"casual",t:"ไม่มีกำหนดเวลา แปลว่าตลอดไปค่ะ แล้วก็ไม่ได้เขียนไว้เลยว่า \"บริษัทในเครือ\" คือใคร"},
   {n:"rin",f:"happy",l:"casual",t:"สามหมื่นแลกข้อมูลทุกไฟต์ของทุกคนในค่ายไปตลอดชีวิต… หารต่อไฟต์แล้วถูกกว่าค่ากาแฟอีกค่ะ"}]
  :[{n:"coach",t:"…เดี๋ยวนะ หน้า 19 ข้อ 14.3 \"ข้อมูลการชก ภาพ และเสียงของนักมวยในสังกัด ให้ตกเป็นสิทธิ์ของบริษัทและบริษัทในเครือ โดยไม่มีกำหนดเวลา\""},
   {n:"coach",t:"ไม่มีกำหนดเวลา… ครูอ่านหนังสือไม่เก่ง แต่คำนี้ครูรู้ว่าแปลว่าตลอดไป"}]),
 {n:"nar",t:`คืนนั้นโทรศัพท์ของค่ายดังขึ้น ปลายสายคือ${RG[r].champ}`},
 {n:cid,f:"sad",l:"casual",t:L[0]},{n:cid,f:"sad",l:"casual",t:L[1]},
 rin?{n:"rin",f:"sad",l:"casual",t:"สัญญาของเวกเตอร์กับของผู้จัดงาน ร่างมาจากคนคนเดียวกันค่ะ"}:{n:"coach",t:"สัญญาของเวกเตอร์กับของผู้จัดงานหน้าตาเหมือนกันเปี๊ยบ… ครูไม่ชอบกลิ่นมันเลย"},
 {n:"nar",t:"ซองเขียวทองวางอยู่บนโต๊ะทำงาน จะเอายังไงกับมันดี",choice:[
   {t:"ส่งกลับไป ขีดฆ่าข้อ 14.3 ทิ้ง",fx:()=>{R.c1="edit";},then:[
     rin?{n:"rin",f:"happy",l:"casual",t:"เดี๋ยวรินเขียนหมายเหตุแนบไปให้ค่ะ สุภาพ แต่ชัดเจน"}:{n:"coach",t:"เอาปากกาแดงมา ครูขีดเอง"},
     {n:"nar",t:"สามวันต่อมา นาคาเอเนอร์จี้โทรมาขอบคุณ น้ำเสียงยังยิ้มเหมือนเดิม แต่ไม่มีใครพูดถึงเช็คอีกเลย"}]},
   {t:"เก็บไว้ก่อน ยังไม่เซ็นอะไรทั้งนั้น",fx:()=>{R.c1="hold";},then:[
     {n:"coach",t:"ดีแล้ว ของฟรีไม่มีในโลก ยิ่งของที่มีคนยิ้มให้ตลอดเวลายิ่งไม่ฟรี"}]}]},
 {n:"nar",t:"ซองเขียวทองถูกเก็บไว้ในลิ้นชักห้องทำงาน ข้าง ๆ สัญญาเงินกู้ของเสี่ยหมวกทองฉบับเก่า"}];}
/* v1.90 round 6: the North in full — the first arrival, the Tha Sao shrine at Uttaradit (Kati's story), a richer visit, the letter after the cup and Baibua's chats.
   คำเมือง lines are drafts for Man to check. The other regions follow in rounds 7–9 (same hooks). */
const RG_ARRIVE={
 north:(G,D)=>{const top=rgTopGirl(G),kati=rgIn(G,"kati"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:`รถของค่ายแวะเติมน้ำมันที่ปั๊มสุดท้ายก่อนเข้า${D.name} หมอกยังลอยต่ำอยู่เหนือภูเขา`},
  {n:"nar",t:"หน้าร้านกาแฟมีมอเตอร์ไซค์คันเก่าจอดรออยู่ ผู้หญิงผมชมพูยืนกอดตะกร้าหวายใบใหญ่ไว้แน่น"},
  {n:"baibua",f:"happy",l:"casual",t:"มาฮอดแล้วเจ้า! หนูได้ข่าวว่าค่ายศิริชัยจะขึ้นมาเก็บเข็มขัดภาคเหนือ ก่เลยขี่รถมาดักรอเจ้า"},
  {n:"baibua",f:"happy",l:"casual",t:"ข้าวต้มมัดเจ้า หนูห่อเองตั้งแต่ตีสี่ มีพอหื้อทุกคนเน้อ"},
  {n:"nar",t:"ทุกคนได้ข้าวต้มมัดคนละห่อ มัดตอกเรียบร้อยเหมือนกันหมด ยกเว้นห่อของผู้จัดการที่ผูกตอกเป็นโบเล็ก ๆ",choice:[
    {t:"ถามว่าทำไมห่อนี้มีโบ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"บ่… บ่มีหยังเจ้า! มือมันผูกไปเองเจ้า… กิ๋นเถอะเจ้า ลำขนาดเลย"}]},
    {t:"ชมว่าห่อนี้สวยกว่าทุกห่อ",fx:G2=>rgMeet(G2,"baibua",2),then:[{n:"baibua",f:"flustered",l:"casual",t:"ผู้จัดการตาไวแท้เจ้า… ห่อนั้นหนูตั้งใจที่สุดเจ้า"}]},
    {t:"ขอบคุณแล้วนั่งกินเงียบ ๆ",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",f:"happy",l:"casual",t:"ลำบ่เจ้า? …ลำก่ดีแล้วเจ้า"}]}]},
  {n:"baibua",f:"sad",l:"casual",t:"แล้วก่… ขอโทษเรื่องวันงานเปิดตัวเจ้า หนูอู้เสียงเบาไป พิธีกรต้องเอาไมค์มาจ่อปากเลย"},
  ...rgIf(kati,[{n:"kati",with:"baibua",f:"happy",l:"casual",t:"ไม่เป็นไรเลยค่ะพี่ใบบัว! เรื่องศอกนี่คนทั้งห้องได้ยินชัดแจ๋วเลย"},{n:"baibua",f:"flustered",l:"casual",t:"…อันนั้นหนูตั้งใจอู้ดังเจ้า"}]),
  {n:"baibua",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}คนนี้หนูเคยชกด้วยเจ้า เปิ้นออกตัวไว ยกแรกระวังหน่อยเน้อ พอยกสามเปิ้นจะเริ่มหมดแรงเจ้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จดคำแนะนำของใบบัวไว้ในมือถือ · กำลังใจ +3`:"ทุกคนจดคำแนะนำของใบบัวไว้"},
  ...(top&&top.id!=="kati"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ใบบัว")}]:[]),
  {n:"coach",t:"ข้าวต้มมัดอร่อยกว่าร้านหน้าค่ายอีก… อย่าไปบอกป้าแต๋วนะ"},
  {n:"nar",t:"ใบบัวโบกมือส่งรถออกจากปั๊ม แล้วขี่มอเตอร์ไซค์ตามมาห่าง ๆ จนถึงสนามมวย"}];}};
/* a scene on the first night of a particular trip */
const RG_TRIPX={
 uttaradit:{bg:"tasao_shrine",steps:G=>{const kati=rgIn(G,"kati");return [
  {n:"nar",t:"ก่อนกลับที่พัก ใบบัวพาทั้งค่ายแวะศาลครูมวยท่าเสา ศาลไม้เก่าใต้ต้นโพธิ์ มีนวมเก่าคู่หนึ่งแขวนอยู่ข้างหิ้ง"},
  {n:"baibua",f:"happy",l:"casual",t:"ตรงนี้เป็นบ้านเกิดของมวยท่าเสาเจ้า พ่อหนูพามากราบครูทุกปี ก่อนพ่อจะเจ็บเข่า"},
  ...(kati?[
   {n:"nar",t:"กะทิยืนนิ่งอยู่หน้าศาลนานกว่าทุกคน แล้วค่อย ๆ ถอยออกมานั่งที่ขั้นบันได"},
   {n:"kati",f:"sad",l:"casual",t:"…หนูไม่แน่ใจว่าหนูมีสิทธิ์กราบตรงนี้ไหมคะ"},
   {n:"kati",f:"sad",l:"casual",t:"ท่าเสาของหนูเป็นครูพักลักจำค่ะ ปู่ชัยแอบดูครูท่าเสาชกตามงานวัด จำมาแล้วสอนหนู ไม่เคยมีใครครอบครูให้ปู่เลยสักครั้ง"},
   {n:"kati",f:"sad",l:"casual",t:"พี่ใบบัวเป็นท่าเสาสายตรง ตั้งแต่พ่อ ตั้งแต่ปู่ของพี่… ส่วนหนู หนูแค่ลอกท่าเขามา",choice:[
     {t:"\"ปู่ชัยดูจนจำได้ทุกท่า นั่นก็คือรักมวยท่าเสาแล้ว\"",fx:G2=>add(G2,"kati","bond",2),then:[{n:"kati",f:"sad",l:"casual",t:"…ปู่จำได้ทุกท่าจริง ๆ ค่ะ ตอนเด็ก ๆ หนูเห็นปู่รำท่าเสาคนเดียวหลังค่ายทุกเย็น"}]},
     {t:"\"ลองถามพี่ใบบัวดูสิ\"",fx:G2=>rgMeet(G2,"baibua",1),then:[{n:"baibua",with:"kati",f:"happy",l:"casual",t:"ถามหนูได้เลยเจ้า"}]}]},
   {n:"baibua",with:"kati",f:"sad",l:"casual",t:"กะทิ… รู้บ่ หนูอิจฉากะทิเน้อ"},
   {n:"kati",f:"surprised",l:"casual",t:"อิจฉาหนูเหรอคะ?!"},
   {n:"baibua",f:"sad",l:"casual",t:"หนูได้ท่ามาจากพ่อก่จริง แต่ทุกวันนี้หนูแบกค่ายคนเดียว ซ้อมคนเดียว กิ๋นข้าวกับพ่อสองคน… บ่มีใผช่วยเลยเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"กะทิมีครูแดง มีผู้จัดการ มีเพื่อนทั้งค่ายคอยดู ท่าเสาของกะทิบ่ได้มาจากครูคนเดียว มันมาจากคนทั้งค่ายเจ้า"},
   {n:"baibua",f:"happy",l:"casual",t:"มวยบ่ได้อยู่ในสายเลือดหรอกเจ้า มันอยู่ในคนที่ยังชกมันอยู่… มากราบครูด้วยกันเน้อ"},
   {n:"nar",t:"กะทิกับใบบัวคุกเข่าลงหน้าศาลพร้อมกัน กราบสามครั้ง ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ"},
   {n:"kati",with:"baibua",f:"happy",l:"casual",t:"…พี่ใบบัวคะ ปีหน้ามากราบครูด้วยกันอีกนะคะ"},
   {n:"baibua",f:"happy",l:"casual",t:"สัญญาเจ้า"},
   {fx:G2=>{add(G2,"kati","bond",2);const k=G2.F.kati;if(k)k.morale=Math.min(100,(k.morale||0)+5);rgMeet(G2,"baibua",2);G2.flags.tasaoShrine=1;}},
   {n:"nar",t:"กะทิ กำลังใจ +5 · กะทิกับใบบัวสนิทกันขึ้น"}]
  :[{n:"baibua",f:"sad",l:"casual",t:"ปีนี้หนูมาคนเดียวเจ้า… ขอบคุณที่มาเป็นเพื่อนเน้อ"},
   {n:"nar",t:"ผู้จัดการพนมมือไหว้ศาลครูตามใบบัว ลมพัดนวมเก่าข้างหิ้งแกว่งเบา ๆ",fx:G2=>rgMeet(G2,"baibua",1)},
   {fx:G2=>rgMeet(G2,"baibua",1)}])];}}};
/* the week after the cup: her answer to Vector, in a letter */
const RG_POST={
 north:"เรียน ผู้จัดการค่ายศิริชัยเจ้า\n\nหนูตอบเวกเตอร์ไปแล้วเจ้า ว่าค่ายบัวท่าเสาบ่ขาย\n\nพ่อถามว่าเอาความกล้ามาจากไหน หนูตอบว่า \"ค่ายเล็กก็ยืนได้ ดูค่ายศิริชัยสิเจ้า\" พ่อหัวเราะครั้งแรกในรอบสองปีเลยเจ้า\n\nถ้วยอยู่กับค่ายศิริชัยแล้ว แต่ใจของมวยท่าเสายังอยู่ที่เชียงใหม่เน้อ ว่าง ๆ ขึ้นมาแอ่วหาหนูกับพ่อเจ้า\n\n— ใบบัว"};
/* champion chats: open after her first visit to the camp (or the cup); a reply moves her bond a little and counts as contact */
const RG_CHAT={
 baibua:[
  {id:"bb_mist",x:[
   ["เช้านี้หมอกลงหนาขนาดเลยเจ้า ผู้จัดการตื่นแล้วก่",[["ตื่นแล้ว กำลังจะไปดูเด็ก ๆ ซ้อม",1,"ขยันแท้เจ้า หนูก่กำลังจะไปซ้อมเหมือนกันเจ้า"],["ยังเลย นี่พิมพ์ทั้งที่หลับตาอยู่",2,"ฮิ ๆ หลับตาก็พิมพ์ถูกทุกตัวเลยเจ้า เก่งแท้"],["หมอกแบบนี้ขับรถระวังด้วยนะ",2,"…หนูจะระวังเจ้า ขอบคุณที่เป็นห่วงเน้อ"]]],
   ["พ่อให้หนูถามว่า ค่ายศิริชัยเปิดมากี่ปีแล้วเจ้า",[["ตั้งแต่รุ่นปู่ชัย เกือบห้าสิบปีแล้ว",1,"โอ้ พ่อบอกว่าเก่ากว่าค่ายบัวท่าเสาอีกเจ้า"],["เดี๋ยวพาไปดูรูปเก่าในค่ายนะ",2,"จริงก่เจ้า! หนูจะรอเน้อ"],["ถามทำไมเหรอ",0,"บ่มีหยังเจ้า พ่อแค่อยากรู้"]]],
   ["หนูต้องไปซ้อมแล้วเจ้า… คุยกันแค่นี้ก่อนเน้อ",[["ไปเถอะ ซ้อมเสร็จค่อยคุยต่อ",2,"เจ้า! ซ้อมเสร็จหนูทักไปเลยเน้อ"],["อย่าหักโหมนะ",1,"เจ้า หนูจะยืดเส้นก่อนทุกครั้ง"],["โอเค",0,"เจ้า"]]]]},
  {id:"bb_dad",x:[
   ["วันนี้พ่อลุกเดินรอบค่ายได้สองรอบเจ้า! หมอบอกว่าเข่าดีขึ้นแล้ว",[["ดีใจด้วยนะ!",1,"ขอบคุณเจ้า หนูดีใจจนน้ำตาไหลเลย"],["ฝากบอกพ่อว่าทั้งค่ายศิริชัยเชียร์อยู่",2,"หนูบอกแล้วเจ้า พ่อยิ้มแล้วบอกว่าค่ายนั้นใจ๋ดีแท้"],["อย่าให้พ่อหักโหมนะ",1,"เจ้า หนูคอยเดินตามอยู่ข้าง ๆ ตลอดเลย"]]],
   ["พ่ออยากหื้อหนูกลับไปเรียนต่อ บ่อยากหื้อชกมวยแล้ว… ผู้จัดการคิดว่าจะได",[["ถามใจตัวเองก่อนว่าอยากทำอะไร",2,"…ใจหนูอยากชกเจ้า หนูรู้อยู่แล้ว แค่อยากได้ยินคนพูด"],["เรียนไปด้วยชกไปด้วยก็ได้นะ",1,"ทำได้แท้ก่เจ้า… หนูจะลองคิดดูเน้อ"],["พ่อพูดถูกนะ",0,"…เจ้า หนูจะลองคิดดู"]]],
   ["ขอบคุณที่ฟังเน้อเจ้า หนูบ่ค่อยมีใผหื้อเล่าเรื่องนี้",[["เล่าได้ทุกเรื่องเลย",2,"…หนูจะเล่าบ่อย ๆ เลยเน้อ ห้ามรำคาญ"],["ยินดีเสมอ",1,"เจ้า ขอบคุณเจ้า"],["ไม่เป็นไร",0,"เจ้า"]]]]},
  {id:"bb_food",x:[
   ["หนูทำแกงฮังเลหม้อใหญ่เจ้า กิ๋นกับพ่อสองคนบ่หมด",[["ส่งมาค่ายบ้างสิ",2,"ได้เจ้า! เดี๋ยวหนูส่งไปรษณีย์… แกงส่งไปรษณีย์ได้ก่เจ้า"],["น่ากินจัง",1,"ลำขนาดเลยเจ้า สูตรแม่หนูเน้อ"],["แช่ตู้เย็นไว้สิ",0,"เจ้า หนูก่ว่าจะแช่ไว้"]]],
   ["ผู้จัดการชอบกิ๋นอะหยังที่สุดเจ้า",[["ข้าวต้มมัดของใบบัว",2,"…ผู้จัดการพูดแบบนี้ หนูจะห่อหื้อทุกอาทิตย์เลยเจ้า"],["ข้าวมันไก่หน้าตลาด",1,"ร้านที่กะทิชอบใช่ก่เจ้า หนูจะไปลองบ้าง"],["อะไรก็ได้",0,"กิ๋นได้ทุกอย่างก่ดีเจ้า"]]],
   ["คราวหน้าขึ้นมาเชียงใหม่ หนูจะพาไปกิ๋นข้าวซอยร้านลับเน้อ",[["สัญญานะ",2,"สัญญาเจ้า! ร้านนี้หนูบ่เคยพาใผไปเลย"],["พาทั้งค่ายไปเลย",1,"ได้เจ้า แต่ร้านเปิ้นมีโต๊ะแค่สองตัวเจ้า ฮิ ๆ"],["ถ้าว่างนะ",0,"เจ้า ถ้าว่างเน้อ"]]]]},
  {id:"bb_elbow",x:[
   ["วันนี้หนูซ้อมศอกบัวบานกลับหลังร้อยรอบเจ้า แขนจะหลุดแล้ว",[["เก่งมาก แต่พักบ้างนะ",2,"เจ้า… มีคนบอกหื้อพัก หนูก่จะพักเจ้า"],["สอนกะทิบ้างได้ไหม",1,"ได้เจ้า! แต่กะทิต้องสอนท่าของกะทิหื้อหนูด้วยเน้อ"],["ร้อยรอบน้อยไปนะ",0,"…ผู้จัดการโหดกว่าครูหนูอีกเจ้า"]]],
   ["ผู้จัดการรู้บ่ ศอกท่านี้พ่อคิดขึ้นตอนเห็นดอกบัวบานในสระวัด",[["สวยแบบมวยท่าเสาเลย",2,"เจ้า… มวยของพ่อสวยแต๊ ๆ หนูอยากหื้อคนทั้งประเทศได้เห็น"],["ดอกบัวมีหนามด้วยเหรอ",1,"บ่มีเจ้า! คนอื่นเปิ้นเรียกหนูเอง หนูบ่ได้ตั้ง ฮิ ๆ"],["ดอกบัวก็ดี",0,"เจ้า"]]],
   ["ถ้าวันหนึ่งหนูเจอกะทิบนเวที ผู้จัดการจะเชียร์ใผเจ้า",[["เชียร์ใบบัวแบบเงียบ ๆ",2,"…ห้ามบอกกะทิเน้อเจ้า หนูก่จะเชียร์ผู้จัดการเงียบ ๆ เหมือนกัน"],["เชียร์ทั้งคู่",1,"ตอบเก่งแท้เจ้า… หนูก่จะเชียร์กะทิเหมือนกันเน้อ"],["เชียร์กะทิสิ",0,"ฮิ ๆ ก่ถูกแล้วเจ้า"]]]]},
  {id:"bb_vector",x:[
   ["เวกเตอร์ส่งจดหมายมาอีกแล้วเจ้า ขึ้นราคาค่ายหื้ออีกสองแสน",[["อย่าเพิ่งตัดสินใจคนเดียวนะ",2,"…เจ้า หนูจะปรึกษาผู้จัดการก่อนทุกครั้งเลยเน้อ"],["ค่ายบัวท่าเสาไม่ได้มีไว้ขาย",2,"พ่อก่พูดแบบนี้เลยเจ้า… หนูดีใจที่ได้ยินอีกคน"],["สองแสนก็เยอะนะ",0,"…เจ้า หนูรู้เจ้า"]]],
   ["บางทีหนูก่คิดว่า ถ้าขายค่าย พ่อจะได้รักษาเข่าที่โรงพยาบาลดี ๆ",[["มีทางอื่นอีกหลายทาง เดี๋ยวช่วยหา",2,"…ผู้จัดการช่วยหนูคิดแท้ ๆ ก่เจ้า ขอบคุณเจ้า"],["เข้าใจเลยว่าลำบาก",1,"เจ้า… ขอบคุณที่เข้าใจเน้อ"],["ก็เป็นทางหนึ่ง",0,"เจ้า"]]],
   ["คุยกับผู้จัดการแล้วใจเบาขึ้นเจ้า… บ่รู้เป็นจะได",[["เพราะไม่ได้แบกคนเดียวแล้วไง",2,"…เจ้า หนูบ่ได้แบกคนเดียวแล้วเน้อ"],["ทักมาได้ทุกเมื่อ",1,"เจ้า! หนูจะทักบ่อย ๆ"],["ดีแล้ว",0,"เจ้า"]]]]}]};
if(typeof CHAT!=="undefined")for(const k in RG_CHAT)CHAT[k]=RG_CHAT[k];
/* v1.90 round 7: Isan in full — Tabtim hitches a ride on the first trip, Buriram brings Vector (Vega + Pailin) and Ploy's answer, a richer visit, the letter after the cup and Tabtim's chats. Isan lines are drafts for a native speaker to check. */
RG_ARRIVE.isan=(G,D)=>{const top=rgTopGirl(G),ploy=rgIn(G,"ploy"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"gas_station",t:"ถนนตรงยาวสุดลูกหูลูกตาผ่านทุ่งนา ข้างหน้ามีมอเตอร์ไซค์จอดควันโขมงอยู่หน้าปั๊มร้าง ผู้หญิงผมแดงยืนโบกมือกลางถนนสองมือ"},
  {n:"tabtim",f:"happy",l:"casual",t:"จอด ๆ ๆ! ค่ายศิริชัยแม่นบ่! ทับทิมเองเด้อ! มอไซค์ทับทิมพังพอดี ขอติดรถไปเวทีแน่เด้อ"},
  {n:"nar",t:"ยังไม่ทันมีใครตอบ ทับทิมก็เปิดประตูหน้าแล้วนั่งข้างคนขับหน้าตาเฉย"},
  {n:"tabtim",f:"happy",l:"casual",t:"ทับทิมนั่งหน้าเด้อ เมารถ… บ่ได้เมารถดอก แค่อยากนั่งใกล้พี่ผู้จัดการ ฮ่า ๆ ล้อเล่น ๆ เอาไปเป็นแฟนเด้อ ล้อเล่นอีกแหละ!",choice:[
    {t:"\"ถ้าล้อเล่นสองรอบ แปลว่าไม่ได้ล้อเล่นนะ\"",fx:G2=>rgMeet(G2,"tabtim",2),then:[{n:"tabtim",f:"flustered",l:"casual",t:"…เอ้า! พี่ผู้จัดการตอบจริงจังจั่งซี้ ทับทิมบ่มีมุกต่อแล้วเด้อ"}]},
    {t:"หัวเราะแล้วขับรถต่อ",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"happy",l:"casual",t:"ฮ่า ๆ ใจเย็นแท้เด้อพี่ ทับทิมมักคนใจเย็น"}]},
    {t:"\"คาดเข็มขัดนิรภัยด้วยนะ\"",fx:G2=>rgMeet(G2,"tabtim",1),then:[{n:"tabtim",f:"pout",l:"casual",t:"คาดแล้ว ๆ… โธ่ พี่ผู้จัดการนี่จริงจังแท้"}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ทับทิม")}]:[]),
  ...rgIf(ploy,[{n:"tabtim",f:"happy",l:"casual",t:"เอ๊ะ! ข้างหลังนั่นพลอยแม่นบ่! หมัดโคราชของคนกรุงเทพฯ! ทับทิมอยากลองโดนจักหมัดมาตั้งแต่งานเปิดตัวเด้อ"},
    {n:"ploy",f:"pout",l:"casual",t:"…นั่งหันหน้าไปข้างหน้าเถอะ เดี๋ยวคอเคล็ด"}]),
  {n:"nar",bg:"somtam_stall",t:"ทับทิมคุยไม่หยุดตลอดทาง แล้วสั่งให้แวะร้านส้มตำริมทาง \"ร้านนี้แซบที่สุดในภาค ทับทิมเลี้ยงเอง!\""},
  {n:"tabtim",f:"happy",l:"casual",t:`แชมป์ประจำ${D.name}กะคนบ้านใกล้ ๆ ทับทิมนี่แหละเด้อ เปิ้นเตะหนักแต่การ์ดซ้ายต่ำ เตะซ้ายสวนเข้าไปเลย`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของทับทิมไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของทับทิมไว้"},
  {n:"coach",t:"ส้มตำร้านนี้เผ็ดจนครูน้ำตาไหล… แต่อร่อยจริง"},
  {n:"tabtim",f:"happy",l:"casual",t:"ไปเด้อพี่น้อง! ทับทิมสิไปนั่งเชียร์ข้างเวที… เชียร์ฝั่งไหนกะบ่บอกดอก ฮ่า ๆ"}];};
RG_TRIPX.buriram={bg:"night_isan",steps:G=>{const ploy=rgIn(G,"ploy");return [
  {n:"nar",t:"คืนเดียวกัน บนเวทีเดียวกัน คู่รองก่อนไฟต์ของค่ายเรา นักมวยจากค่ายเวกเตอร์ชนะน็อกตั้งแต่ยกสอง"},
  {n:"npc",who:"เวกา",t:"ข้อมูลบอกว่าเขาจะยกการ์ดช้าในยกสองค่ะ …ข้อมูลไม่เคยโกหก"},
  ...(ploy?[
   {n:"npc",who:"เซียนมวยข้างเวที",t:"สาวกรุงเทพฯ คนนั้นน่ะ ที่เขาว่าต่อยหมัดโคราช… ของแท้บ่ หรือของก๊อปมา"},
   {n:"nar",t:"คนรอบ ๆ หัวเราะ พลอยได้ยินชัดทุกคำ แต่ไม่หันไปมอง"},
   {n:"pailin",f:"happy",t:"พลอย กลับมาเวกเตอร์เถอะ ที่นี่เขาไม่ได้มองว่าเธอเป็นมวยโคราชหรอก ที่เวกเตอร์ เธอเป็นข้อมูลที่ดีที่สุดที่พี่เคยมี"},
   {n:"npc",who:"เวกา",t:"พี่พลอยคะ… ห้องซ้อมของพี่ยังว่างอยู่นะคะ ไม่มีใครกล้าใช้"},
   {n:"ploy",f:"angry",l:"casual",with:"pailin",t:"พี่ไพลิน ฉันไม่ตอบด้วยคำพูดหรอก"},
   {n:"nar",t:"พลอยเดินไปที่มุมวอร์มข้างเวที หยิบเป้ามือขึ้นมายื่นให้ทับทิมที่ยืนดูอยู่"},
   {n:"ploy",f:"happy",l:"casual",t:"ถือให้หน่อย ถือแน่น ๆ นะ"},
   {n:"nar",t:"หมัดเหวี่ยงควายลูกเดียว เสียงดังจนคนทั้งมุมหันมามอง ทับทิมกระเด็นถอยหลังไปสามก้าว"},
   {n:"tabtim",f:"surprised",l:"casual",with:"ploy",t:"โอ๊ย! มือทับทิมชาไปถึงศอก… อันนี้ของแท้เด้อพี่น้อง! ของแท้แท้ ๆ!"},
   {n:"npc",who:"เซียนมวยข้างเวที",t:"…ของแท้"},
   {n:"pailin",f:"sad",t:"…ข้อมูลของพี่ไม่เคยวัดแรงหมัดนี้ได้เลย"},
   {n:"nar",show:[{id:"pailin"},{id:"ploy",l:"casual",f:"sad"}],t:"ไพลินหันหลังเดินออกไปกับเวกา แต่หยุดมองพลอยอีกครั้งก่อนลับประตู",choice:[
     {t:"\"หมัดนั้นเป็นของพลอยเอง ไม่ใช่ของใคร\"",fx:G2=>add(G2,"ploy","bond",2),then:[{n:"ploy",f:"flustered",l:"casual",t:"…ไม่ต้องพูดก็รู้ค่ะ แต่ได้ยินแล้วก็… ขอบคุณค่ะ"}]},
     {t:"\"พี่สาวเธอยังห่วงเธออยู่นะ\"",fx:G2=>add(G2,"ploy","bond",1),then:[{n:"ploy",f:"sad",l:"casual",t:"รู้ค่ะ… พี่ไพลินห่วงแบบที่ห่วงข้อมูลชุดหนึ่ง วันไหนพี่ห่วงแบบห่วงน้อง ฉันถึงจะกลับไปคุย"}]}]},
   {fx:G2=>{const p=G2.F.ploy;if(p)p.morale=Math.min(100,(p.morale||0)+5);rgMeet(G2,"tabtim",1);G2.flags.ployKorat=1;}},
   {n:"nar",t:"พลอย กำลังใจ +5"}]
  :[{n:"pailin",f:"happy",t:"ค่ายศิริชัยไปได้ไกลกว่าที่ข้อมูลของฉันบอกนะคะ …น่าสนใจ"},
   {n:"tabtim",f:"happy",l:"casual",t:"ข้อมูล ๆ ๆ คนกรุงเทพฯ นี่ชอบข้อมูลแท้เด้อ ทับทิมว่ากินส้มตำดีกว่า ฮ่า ๆ"},
   {fx:G2=>rgMeet(G2,"tabtim",1)}])];}};
RG_POST.isan="เถิง พี่ผู้จัดการ\n\nพ่อกลับบ้านมาแล้วกะบ่เว้าหยังเลยเด้อ สามมื้อ\n\nมื้อที่สี่ พ่อเอาผ้าคาดเอวเก่าของพ่อมาวางไว้หัวนอนทับทิม ผ้าผืนที่พ่อใช้ชกตอนหนุ่ม ๆ พ่อบอกแค่ว่า \"เตะกะเตะสิ แต่เตะให้สุด\"\n\nทับทิมฮ้องไห้ทั้งคืนเลยเด้อ บ่ต้องบอกไผ\n\nถ้วยอยู่ค่ายศิริชัยแล้ว ดูแลให้ดีเด้อ ทับทิมสิไปเอาคืนจักมื้อ ฮ่า ๆ\n\n— ทับทิม";
RG_CHAT.tabtim=[
 {id:"tt_fee",x:[
  ["พี่ผู้จัดการ! น้องคนเล็กทับทิมสอบติดมหาลัยแล้วเด้อ!!",[["ยินดีด้วย! ทับทิมเก่งมากที่ส่งน้องเรียนมาถึงนี่",2,"…เอ้า พี่ชมทับทิมแทนชมน้องซะงั้น ทับทิมน้ำตาสิไหลแล้วเด้อ"],["เลี้ยงฉลองเลยไหม",1,"เลี้ยงหมูกระทะทั้งหมู่บ้านเลย! พี่ออกครึ่งนึงเด้อ ฮ่า ๆ"],["คณะอะไรเหรอ",1,"นิติฯ เด้อ! คนเดียวกับที่อ่านสัญญาซองเขียวให้นั่นแหละ"]]],
  ["แต่ค่าเทอมแพงหลายเด้อ… ทับทิมต้องชนะอีกหลายไฟต์",[["อย่าแบกคนเดียว มีอะไรบอกได้นะ",2,"…พี่ใจดีแท้ ทับทิมบ่ชินเลยเด้อ"],["ชนะได้อยู่แล้ว เตะทับทิมหนักจะตาย",1,"ฮ่า ๆ แม่นแล้ว! เตะทับทิมจ่ายค่าเทอมได้เด้อ"],["ทุนการศึกษาก็มีนะ",1,"เออ! ทับทิมสิไปถามน้องเบิ่ง"]]],
  ["ไปซ้อมก่อนเด้อ! เตะสิบลูก หนึ่งลูกเท่ากับค่าหนังสือหนึ่งเล่ม ฮ่า ๆ",[["สู้ ๆ นะ",1,"สู้เด้อ!"],["เตะเผื่อฉันด้วย",2,"ได้เลย! ลูกที่สิบเอ็ดเตะให้พี่ผู้จัดการเด้อ"],["อย่าลืมพัก",1,"รู้แล้ว ๆ พี่นี่ห่วงแท้"]]]]},
 {id:"tt_somtam",x:[
  ["ทับทิมสอนน้องในค่ายตำส้มตำ ใส่พริกยี่สิบเม็ด น้องร้องไห้เลยเด้อ ฮ่า ๆ",[["ยี่สิบเม็ดมันโหดไปแล้ว!",1,"โหดอีหยัง! คนอีสานกินสามสิบเม็ดเป็นเรื่องปกติ"],["ส่งสูตรมาให้ค่ายบ้างสิ",2,"ได้เลย! แต่ห้ามบอกป้าแต๋วเด้อ สูตรลับตระกูลทับทิม"],["น้องโอเคไหม",1,"โอเค ๆ ดื่มน้ำไปสามขวด ตอนนี้แซวทับทิมคืนแล้ว"]]],
  ["พี่ผู้จัดการกินเผ็ดได้บ่",[["ได้สบาย",1,"แม่นบ่! ครั้งหน้าทับทิมสิตำพริกสิบเม็ดให้ลองเด้อ"],["ได้นิดหน่อย",1,"บ่เป็นหยัง ทับทิมตำแบบเผ็ดน้อยให้ ทำพิเศษให้คนเดียวเด้อ"],["กินได้ถ้าทับทิมตำให้",2,"…โอ๊ย พี่ผู้จัดการ! เว้าจั่งซี้ทับทิมตำบ่ถูกแล้ว"]]],
  ["ไปตำส้มตำขายตลาดเช้าก่อนเด้อ หาค่าเทอมน้อง!",[["ขายดี ๆ นะ",1,"ขายหมดครกเด้อ!"],["เก็บไว้ให้ครกนึง",2,"เก็บไว้ให้แล้ว ใส่ปลาร้าพิเศษเด้อ!"],["โอเค",0,"เด้อ!"]]]]},
 {id:"tt_live",x:[
  ["ทับทิมเปิดไลฟ์ค่ายพี่เบิ่งทุกมื้อ ค่ายพี่ม่วนแท้ ครูแดงนั่นดุแท้บ่เด้อ",[["หน้าดุแต่ใจดี",1,"แม่นแล้ว! หน้าดุแต่แอบยื่นขนมให้เด็ก ๆ ทับทิมเห็นในไลฟ์เด้อ"],["ทับทิมดูไลฟ์ทุกวันเลยเหรอ",2,"…เอ้า ถามจั่งซี้ทับทิมสิตอบแนวได๋ ใช่ เบิ่งทุกมื้อ พอใจแล้วบ่"],["ดุจริง ระวังโดนสั่งวิ่งรอบค่าย",1,"ฮ่า ๆ ทับทิมสิไปวิ่งรอบค่ายพี่เบิ่งจักมื้อ"]]],
  ["มีคนคอมเมนต์ในไลฟ์ว่าทับทิมเตะสวยที่สุดในภาคอีสานเด้อ",[["จริงนี่",2,"…ฮ่า ๆ พี่ผู้จัดการคอมเมนต์เองบ่ เบิ่งชื่อบัญชีน่าสงสัยอยู่"],["คนนั้นตาถึง",1,"ตาถึงแท้! ทับทิมสิไปกดถูกใจให้"],["อย่าไปอ่านคอมเมนต์มาก",1,"ฮ่า ๆ รู้แล้ว แต่คอมเมนต์ดี ๆ กะอ่านได้เด้อ"]]],
  ["มื้อหน้าพี่ออกกล้องในไลฟ์แน่เด้อ ทับทิมสิรอเบิ่ง",[["จะโบกมือให้",2,"โบกมาเลย ทับทิมสิโบกกลับ… ถึงพี่สิบ่เห็นกะตาม"],["อายกล้องอะ",1,"บ่ต้องอายเด้อ หน้าพี่ผู้จัดการกะใช้ได้อยู่ ฮ่า ๆ"],["ไม่รับปากนะ",0,"โธ่!"]]]]},
 {id:"tt_dad",x:[
  ["มื้อนี้พ่อโทรมาถามว่าทับทิมกินข้าวแล้วบ่… พ่อบ่เคยโทรมาก่อนเลยเด้อ",[["พ่อเริ่มเปิดใจแล้วนะ",2,"…ทับทิมกะคิดจั่งซั่น ทับทิมตอบพ่อว่ากินแล้ว ทั้งที่ยังบ่ได้กิน ฮ่า ๆ"],["แล้วกินหรือยังล่ะ",1,"ยังเลย! พี่ถามแบบพ่อเลยเด้อ"],["ดีใจด้วยนะ",1,"ขอบใจเด้อ ทับทิมยิ้มทั้งมื้อเลย"]]],
  ["พี่ว่าสักมื้อพ่อสิมาเบิ่งทับทิมชกบ่",[["ต้องมาแน่ ถ้าทับทิมยังเตะแบบนี้",2,"…ทับทิมสิเตะต่อไปเรื่อย ๆ จนพ่อมาเบิ่งเด้อ"],["ชวนพ่อดูสิ",1,"เออ ทับทิมสิลองชวนเบิ่ง… ถ้าพ่อบ่มา พี่มาแทนเด้อ"],["ไม่แน่ใจนะ",0,"…เด้อ"]]],
  ["ขอบใจที่ฟังเด้อ ทับทิมเว้าเรื่องนี้ได้แต่กับพี่คนเดียว",[["เล่าได้ตลอดเลย",2,"…ฮ่า ๆ บ่ฮาแล้ว ทับทิมเขินเด้อ"],["ยินดีเสมอ",1,"ขอบใจเด้อ!"],["ไม่เป็นไร",0,"เด้อ"]]]]},
 {id:"tt_kick",x:[
  ["ทับทิมฝึกเตะกระโดดได้สูงกว่าเก่าอีกคืบเด้อ! อีกนิดเดียวสิเตะถึงหลอดไฟ",[["อย่าเตะหลอดไฟแตกนะ",1,"แตกไปแล้วดวงนึง ฮ่า ๆ บ่ต้องบอกพ่อเด้อ"],["สูงกว่าบั้งไฟหรือยัง",2,"…พี่ยังจำเรื่องบั้งไฟได้อยู่บ่ ทับทิมดีใจเด้อ"],["เก่งมาก",1,"เก่งแท้เด้อ ชมอีก ๆ"]]],
  ["ถ้าทับทิมเจอพลอยบนเวที พี่ว่าไผสิชนะ",[["ทับทิมชนะเรื่องเตะ พลอยชนะเรื่องหมัด",2,"ตอบแบบนี้บ่มีไผเสียใจเด้อ พี่ฉลาดแท้"],["พลอยสิ เป็นคนค่ายเรา",1,"โอ๊ย! เข้าข้างค่ายตัวเองแท้ ทับทิมสิไปฟ้องพลอย"],["ไม่รู้สิ",0,"ตอบกลาง ๆ จั่งซี้ บ่ม่วนเลย"]]],
  ["ไปซ้อมต่อเด้อ ขอเตะอีกร้อยลูก!",[["เตะเผื่อฉันด้วย",2,"ลูกที่ร้อยเตะให้พี่เด้อ!"],["อย่าหักโหมนะ",1,"รู้แล้ว ๆ"],["โอเค",0,"เด้อ!"]]]]}];
CHAT.tabtim=RG_CHAT.tabtim;
/* v1.90 round 8: the South in full — Chaba's sidecar at the bus terminal, Mali's home at Chaiya and the pier at Don Sak (Mali's story), a richer visit, the letter after the cup and Chaba's chats. Southern lines are drafts for a native speaker to check. */
RG_ARRIVE.south=(G,D)=>{const top=rgTopGirl(G),mali=rgIn(G,"mali"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"bus_terminal",t:"ขับรถกันมาทั้งคืน รถของค่ายเข้าจอดที่สถานีขนส่งตอนฟ้าสาง ข้างประตูทางออกมีมอเตอร์ไซค์พ่วงข้างสีซีดจอดอยู่คันเดียว"},
  {n:"chaba",f:"happy",l:"casual",t:"…ที่พักอยู่ในซอย รถใหญ่เข้าม่ายได้ ขึ้นพ่วงข้าง ทีละคน"},
  {n:"nar",t:"ชบาชี้ที่นั่งพ่วงข้าง แล้วมองมาที่ผู้จัดการคนเดียว ไม่อธิบายอะไรเลย",choice:[
    {t:"นั่งตามที่ชบาชี้",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"nar",t:"ชบาขี่ช้ากว่าที่ควรจะเป็น ตลอดทางไม่พูดสักคำ แต่เลี่ยงหลุมให้ทุกหลุม"}]},
    {t:"ถามว่าทำไมเลือกฉันก่อน",fx:G2=>rgMeet(G2,"chaba",2),then:[{n:"chaba",f:"flustered",l:"casual",t:"…ม่ายต้องถาม ขึ้นหลาว"}]},
    {t:"ให้คนอื่นนั่งไปก่อน",fx:G2=>rgMeet(G2,"chaba",1),then:[{n:"chaba",f:"happy",l:"casual",t:"…ก็ได้ เที่ยวหน้า"},{n:"nar",t:"เที่ยวสุดท้าย ชบากลับมารับผู้จัดการคนเดียว ทั้งที่ทุกคนไปถึงหมดแล้ว"}]}]},
  ...(top&&top.id!=="mali"?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"ชบา")}]:[]),
  ...rgIf(mali,[{n:"mali",f:"happy",l:"casual",with:"chaba",t:"พี่ชบา! มะลิขอนั่งพ่วงข้างเที่ยวที่สองนะ! ตอนเด็ก ๆ พี่ก็เคยพามะลินั่งแบบนี้!"},
    {n:"chaba",f:"happy",l:"casual",t:"…จำผิดคนแล้ว"},{n:"nar",t:"แต่เที่ยวที่สอง คนที่ได้นั่งพ่วงข้างคือมะลิ และชบาขี่อ้อมไปทางชายหาดหนึ่งรอบโดยไม่มีใครขอ"}]),
  {n:"chaba",f:"happy",l:"casual",t:`${D.name}… แชมป์หมัดหนัก แต่ขาช้า …ยกสามค่อยเข้า`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของชบาไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของชบาไว้"},
  {n:"coach",t:"พูดน้อยจริง ๆ เด็กคนนี้… แต่ทุกคำใช้ได้หมด"}];};
RG_TRIPX.surat={bg:"mali_home",steps:G=>{const mali=rgIn(G,"mali");return mali?[
  {n:"nar",t:"เช้าวันรุ่งขึ้นหลังไฟต์ มะลิขอให้รถแวะไชยา \"บ้านมะลิอยู่ทางผ่านพอดีค่ะ!\" ทั้งที่จริงต้องอ้อมไปสี่สิบกิโล"},
  {n:"nar",t:"บ้านไม้สองชั้นริมทะเล น้อง ๆ สามคนวิ่งออกมากอดมะลิ แม่ของมะลิยกข้าวยำมาวางเต็มแคร่"},
  {n:"npc",who:"แม่มะลิ",t:"มาแล้วบ่! กินข้าวก่อนลูก ทุกคนเลย… อ้าว แล้วหนูคนนั้นทำไมยืนอยู่หน้าบ้านล่ะ"},
  {n:"nar",show:[{id:"chaba",l:"casual"}],t:"ชบายืนพิงมอเตอร์ไซค์อยู่หน้าประตูรั้ว ไม่ยอมเดินเข้ามา แม้แม่ของมะลิจะเรียกสองรอบ"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"พี่ชบา… ตอนมะลิหกขวบ พี่หายไปเฉย ๆ ไม่บอกลาสักคำ มะลิรอพี่อยู่หน้าบ้านทุกเย็นเลยนะ"},
  {n:"chaba",f:"sad",l:"casual",t:"…"},
  {n:"nar",bg:"pier_south",t:"บ่ายนั้นที่ท่าเรือดอนสัก ระหว่างรอเรือ ชบาเดินมานั่งข้างมะลิที่ปลายท่า"},
  {n:"chaba",f:"sad",l:"casual",t:"ปีนั้นเรือพี่ชายคว่ำ ขาพี่ม่ายดีอีก แม่พาย้ายไปภูเก็ตคืนนั้นเลย หาหมอ หางาน"},
  {n:"chaba",f:"sad",l:"casual",t:"ม่ายได้ลืมมะลิ …แค่ม่ายรู้จะแหลงพันพรือ ยิ่งนานยิ่งแหลงม่ายออก"},
  {n:"mali",f:"sad",l:"casual",with:"chaba",t:"…ทำไมพี่ไม่ส่งจดหมายมาสักฉบับล่ะ มะลิอ่านหนังสือออกแล้วนะตอนนั้น",choice:[
    {t:"\"ตอนนี้ยังไม่สายนะ ทั้งสองคน\"",fx:G2=>{add(G2,"mali","bond",2);rgMeet(G2,"chaba",1);},then:[{n:"chaba",f:"flustered",l:"casual",t:"…ม่ายสาย"}]},
    {t:"เงียบ ปล่อยให้สองคนคุยกันเอง",fx:G2=>{add(G2,"mali","bond",1);rgMeet(G2,"chaba",2);},then:[{n:"nar",t:"ผู้จัดการถอยออกมายืนห่าง ๆ เสียงคลื่นกระทบเสาท่าเรือดังแทนคำพูดอยู่นาน"}]}]},
  {n:"chaba",f:"flustered",l:"casual",t:"…เขียนแล้ว สิบเอ็ดฉบับ ม่ายได้ส่งสักฉบับ ยังอยู่ในลิ้นชัก"},
  {n:"mali",f:"surprised",l:"casual",t:"สิบเอ็ดฉบับ?! …พี่ชบา ส่งมาให้มะลิหมดเลยนะ! ห้ามเก็บไว้แล้ว!"},
  {n:"nar",t:"มะลิร้องไห้ไปหัวเราะไป ชบายกมือขึ้นลูบหัวมะลิสองที เหมือนตอนที่มะลิยังตัวเล็ก ๆ"},
  {n:"chaba",f:"happy",l:"casual",t:"…ตัวใหญ่ขึ้น มะลิ ขี้แยเท่าเดิม"},
  {n:"mali",f:"happy",l:"casual",t:"ไม่ขี้แยแล้ว! …ก็นิดนึง"},
  {fx:G2=>{add(G2,"mali","bond",2);const m=G2.F.mali;if(m)m.morale=Math.min(100,(m.morale||0)+5);rgMeet(G2,"chaba",2);G2.flags.chabaMali=1;}},
  {n:"nar",t:"มะลิ กำลังใจ +5 · มะลิกับชบาคืนดีกันแล้ว"}]
 :[{n:"nar",bg:"pier_south",t:"ก่อนกลับ ชบาพาผู้จัดการไปนั่งที่ปลายท่าเรือดอนสัก รอเรือข้ามฟากลำสุดท้าย"},
  {n:"chaba",f:"sad",l:"casual",t:"…ตอนเด็กมีน้องข้างบ้านที่ไชยาคนหนึ่ง ร้องไห้เก่ง ย้ายบ้านแล้วม่ายได้บอกลา"},
  {n:"chaba",f:"happy",l:"casual",t:"ป่านนี้คงตัวโตแล้ว …คงชกมวยอยู่ที่ไหนสักที่"},
  {fx:G2=>rgMeet(G2,"chaba",2)}];}};
RG_POST.south="ผู้จัดการ\n\nบอกนาคาแล้ว ให้ถอดโฆษณาที่ใช้เรื่องพี่ชาย\n\nเขาถอดแล้ว\n\nพี่ชายฝากขอบคุณค่ายศิริชัย บอกว่าวันที่นั่งรถเข็นดูข้างเวที เป็นวันที่ดีที่สุดตั้งแต่เรือคว่ำ\n\nถ้วยอยู่กับผู้จัดการแล้ว ดูแลด้วย\n\n— ชบา\n\nป.ล. ส่งจดหมายสิบเอ็ดฉบับให้มะลิแล้ว";
RG_CHAT.chaba=[
 {id:"cb_sea",x:[
  ["…คลื่นวันนี้สูง",[["ออกทะเลระวังด้วยนะ",2,"…ม่ายออก อยู่บ้าน คิด…ช่างเถอะ"],["ซ้อมวิ่งในทรายหรือเปล่า",1,"วิ่งแล้ว สิบรอบ"],["อืม",0,"…"]]],
  ["พี่ชายบอกให้ทักมา",[["พี่ชายใจดีจัง",1,"…บอกเอง ม่ายใช่ฉาน"],["ดีใจที่ทักมานะ",2,"…รู้แล้ว"],["มีอะไรเหรอ",0,"ม่ายมี"]]],
  ["ไปซ้อมแล้ว",[["ไปเถอะ แล้วทักมาอีกนะ",2,"…อือ"],["สู้ ๆ",1,"อือ"],["โอเค",0,"…"]]]]},
 {id:"cb_bro",x:[
  ["พี่ชายลุกยืนได้สิบวินาที วันนี้",[["เก่งมาก! ฝากบอกด้วย",2,"บอกแล้ว พี่ร้องไห้ …ฉานด้วย นิดหนึ่ง"],["ดีขึ้นเรื่อย ๆ แล้วนะ",1,"…อือ หมอบอกงั้น"],["สิบวินาทีเอง",0,"…สิบวินาทีนาน"]]],
  ["พี่อยากมาดูค่ายศิริชัย",[["มาได้ทุกเมื่อ เดี๋ยวทำทางลาดรอ",2,"…ทางลาด จะบอกพี่ พี่ต้องดีใจ"],["ยินดีต้อนรับเลย",1,"อือ ขอบใจ"],["ไกลนะ",0,"…รู้"]]],
  ["ขอบใจ ผู้จัดการ",[["ไม่ต้องขอบใจหรอก",1,"…ขอบใจอยู่ดี"],["ชบาก็ทักมาบ่อย ๆ สิ",2,"…จะลอง"],["ไม่เป็นไร",0,"อือ"]]]]},
 {id:"cb_food",x:[
  ["กินแกงไตปลายัง",[["ยังไม่เคยกินเลย",1,"…ม่ายเคย? มาภูเก็ต จะพาไป"],["เผ็ดเกินไปสำหรับฉัน",1,"อ่อนแอ"],["ส่งมาให้ค่ายบ้างสิ",2,"…ส่งแล้ว สองกระปุก พรุ่งนี้ถึง"]]],
  ["ร้านโกปี้หน้าบ้าน ชาร้อนหรอยที่สุด",[["อยากไปนั่งด้วยจัง",2,"…ที่ว่าง มีหนึ่งที่ ข้างฉาน"],["ชาร้อนตอนเช้าดีนะ",1,"อือ ทุกเช้า"],["ชอบกาแฟมากกว่า",0,"…ก็ได้"]]],
  ["หิว ไปกินก่อน",[["กินเยอะ ๆ นะ",1,"อือ"],["ถ่ายรูปมาให้ดูด้วย",2,"…(ส่งรูปข้าวมันไก่มาหนึ่งรูป ไม่มีข้อความ)"],["โอเค",0,"…"]]]]},
 {id:"cb_mali",x:[
  ["มะลิส่งข้อความมาวันละยี่สิบข้อความ",[["ตอบบ้างหรือเปล่า",1,"ตอบ …วันละข้อความ"],["มะลิรอพี่มาสิบปีเลยนะ",2,"…รู้ จะตอบเพิ่ม เป็นสองข้อความ"],["เยอะไปไหม",0,"…ม่ายเยอะ"]]],
  ["มะลิชกดีขึ้นมาก ผู้จัดการสอนดี",[["มะลิเก่งเองต่างหาก",2,"…พูดเหมือนกัน กับที่มะลิพูดถึงผู้จัดการ"],["ครูแดงสอนนะ",1,"ครูแดงด้วย"],["ขอบใจที่ชม",0,"อือ"]]],
  ["ฝากดูแลมะลิ",[["ดูแลอยู่แล้ว",2,"…เชื่อ"],["ชบาก็มาดูเองบ้างสิ",1,"…จะมา"],["มะลิโตแล้วนะ",0,"…ยังเด็กอยู่"]]]]},
 {id:"cb_naka",x:[
  ["นาคาส่งสัญญามาอีก",[["อย่าเพิ่งเซ็นนะ ให้รินดูก่อน",2,"…ส่งให้รินแล้ว ขีดแดงสิบสองจุด"],["เงินเยอะไหม",0,"…ม่ายสนเงิน"],["ไม่อยากเซ็นก็ไม่ต้องเซ็น",1,"ม่ายเซ็น"]]],
  ["คุณเกริกยิ้มตลอด …ม่ายชอบ",[["คนยิ้มตลอดน่ากลัวที่สุด",2,"…ผู้จัดการคิดเหมือนกัน"],["เขาก็ใจดีนะ",0,"…ม่ายใช่"],["ระวังตัวด้วยนะ",1,"ระวังอยู่"]]],
  ["…คุยกับผู้จัดการ แล้วนอนหลับ",[["งั้นทักมาทุกคืนเลย",2,"…ได้"],["ฝันดีนะ",1,"อือ ฝันดี"],["ไปนอนเถอะ",0,"…"]]]]}];
CHAT.chaba=RG_CHAT.chaba;
/* v1.90 round 9: the Central Plains in full — Alicia's live stream on the first trip, Lopburi's monkeys, the draft Naka League contract (Rin's story) at Suphan, a richer visit, her post after the cup and Alicia's chats. */
RG_ARRIVE.central=(G,D)=>{const top=rgTopGirl(G),rin=rgIn(G,"rin"),me=G.F[(G.region.trip||{}).fid];return [
  {n:"nar",bg:"camp_hanuman",t:`ระหว่างทางไป${D.name} อลิเซียส่งพิกัดมาให้แวะค่ายหนุมานลพบุรีก่อน \"แค่ทางผ่านค่ะ ไม่ได้ตั้งใจเชิญ\"`},
  {n:"nar",t:"ประตูรถยังไม่ทันเปิดสุด กล้องมือถือบนไม้เซลฟี่ก็จ่อเข้ามาแล้ว ไฟวงแหวนสว่างจ้า"},
  {n:"alicia",f:"happy",l:"casual",t:"Hi everyone~ วันนี้มีแขกพิเศษค่ะ! นี่คือค่ายที่ทุกคนในคอมเมนต์พูดถึง… ค่ายศิริชัย!"},
  {n:"nar",t:"อลิเซียหันกล้องกวาดไปทั้งรถ แล้วค้างไว้ที่หน้าผู้จัดการนานเกินไปหลายวินาที คอมเมนต์ในไลฟ์ไหลรัว",choice:[
    {t:"โบกมือให้กล้อง",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"happy",l:"casual",t:"เห็นไหมคะทุกคน ผู้จัดการตัวจริงยิ้มเก่งกว่าในคลิปอีก …หมายถึงคอมเมนต์บอกนะ ไม่ใช่ฉัน"}]},
    {t:"\"กล้องค้างที่ฉันนานแล้วนะ\"",fx:G2=>rgMeet(G2,"alicia",2),then:[{n:"alicia",f:"flustered",l:"casual",t:"…! สัญญาณกระตุกค่ะ! เน็ตลพบุรีไม่ดี ไม่ใช่ฉันตั้งใจ!"}]},
    {t:"เอามือบังกล้อง",fx:G2=>rgMeet(G2,"alicia",1),then:[{n:"alicia",f:"pout",l:"casual",t:"อ้าว! คนดูหายไปสามร้อยคนเลยนะ …ก็ได้ ไม่ถ่ายแล้วก็ได้"}]}]},
  ...(top?[{n:top.id,f:"pout",l:"casual",t:rgJeal(top.id,"อลิเซีย")}]:[]),
  ...rgIf(rin,[{n:"rin",f:"happy",l:"casual",with:"alicia",t:"คนดูไลฟ์ตอนนี้ 4,812 คนค่ะ อัตราคอมเมนต์ต่อนาทีสูงกว่าไลฟ์ปกติของคุณ 2.3 เท่า"},
    {n:"alicia",f:"happy",l:"casual",t:"…เธอนับได้ยังไงตั้งแต่ลงจากรถ ฉันชักชอบเธอแล้วนะ"}]),
  {n:"alicia",f:"happy",l:"casual",t:`แชมป์จังหวัดนี้ซ้อมที่ค่ายฉันมาก่อนค่ะ เธอเก่งหมัดตรง แต่ไม่ชอบโดนเตะต่ำ …ฉันไม่ได้บอกนะ คุณเดาเอง`},
  {fx:G2=>{if(me)me.morale=Math.min(100,(me.morale||0)+3);}},
  {n:"nar",t:me?`${me.name}จำคำแนะนำของอลิเซียไว้ · กำลังใจ +3`:"ทุกคนจำคำแนะนำของอลิเซียไว้"},
  {n:"coach",t:"ไลฟ์เสร็จแล้วใช่ไหม ครูจะได้เอาแว่นดำออก"}];};
RG_TRIPX.lopburi={bg:"lopburi_monkeys",steps:G=>{const top=rgTopGirl(G),fah=rgIn(G,"fah");return [
  {n:"nar",t:"เย็นนั้นทั้งค่ายแวะพระปรางค์สามยอดซื้อของฝาก ยังไม่ทันลงรถ ลิงฝูงใหญ่ก็กระโดดขึ้นหลังคามาเป็นสิบตัว"},
  {n:"nar",t:"ลิงตัวโตที่สุดคว้าถุงขนมของฝากไปทั้งถุง แล้วนั่งแกะกินบนเสาไฟต่อหน้าทุกคน"},
  fah?{n:"fah",f:"angry",l:"casual",t:"เฮ้ย! นั่นขนมของฟ้า! ลงมาเดี๋ยวนี้ ฟ้าจะเตะให้ตกเสาเลย!"}:{n:"coach",t:"อย่าไปแย่งคืนนะ เดี๋ยวมันเรียกพวกมาอีกห้าสิบตัว"},
  {n:"nar",t:"ลิงอีกตัวหยิบผ้าพันมือที่ตากไว้หลังรถไปพันหัวตัวเองเหมือนนักมวย แล้วยืนตั้งการ์ดใส่ทุกคน"},
  ...(fah?[{n:"fah",f:"surprised",l:"casual",t:"…มันตั้งการ์ดดีกว่าเด็กใหม่ในค่ายอีกนะ"}]:[]),
  ...(top?[{n:top.id,f:"happy",l:"casual",t:"ถ่ายรูปไว้ก่อนค่ะ! คลิปนี้ต้องขึ้นเพจค่ายแน่ ๆ"}]:[]),
  {n:"coach",t:"ช่างมัน… ปีหน้าค่อยมาเอาผ้าพันมือคืน มันคงเป็นแชมป์ลพบุรีไปแล้ว"},
  {fx:G2=>{for(const f of roadRiders(G2))f.morale=Math.min(100,(f.morale||0)+2);}},
  {n:"nar",t:"ทุกคนหัวเราะกันจนท้องแข็ง · กำลังใจทุกคน +2 · ผ้าพันมือหายไปหนึ่งคู่"}];}};
RG_TRIPX.suphan={bg:"hotel_room",steps:G=>{const rin=rgIn(G,"rin");return rin?[
  {n:"nar",t:"สี่ทุ่ม มีคนเคาะประตูห้องพัก อลิเซียยืนอยู่หน้าห้อง ใส่ฮู้ดคลุมหัว ในมือถือแฟ้มหนาเตอะ"},
  {n:"alicia",f:"sad",l:"casual",t:"ขอโทษที่มาดึกค่ะ… ฉันขอยืมตัวรินได้ไหม แค่ชั่วโมงเดียว"},
  {n:"alicia",f:"sad",l:"casual",with:"rin",t:"นี่สัญญานาคาลีกฉบับร่าง ผู้จัดการส่วนตัวฉันบอกว่าดีมาก ให้เซ็นภายในสัปดาห์นี้ เธออ่านสัญญาเก่งใช่ไหม ช่วยดูให้หน่อย"},
  {n:"rin",f:"happy",l:"casual",t:"ได้ค่ะ ขอปากกาแดงกับกาแฟหนึ่งแก้ว"},
  {n:"nar",t:"หนึ่งชั่วโมงกลายเป็นสามชั่วโมง กระดาษสี่สิบหน้ากระจายเต็มเตียง รินขีดแดงไปยี่สิบสามจุด"},
  {n:"rin",f:"sad",l:"casual",t:"ข้อ 9 ค่ะ รายได้จากภาพและคอนเทนต์ของนักสู้ บริษัทได้เจ็ดสิบเปอร์เซ็นต์ นักสู้ได้สามสิบ ตลอดอายุสัญญา"},
  {n:"rin",f:"sad",l:"casual",t:"ข้อ 21 ค่ะ อายุสัญญาสิบปี ต่ออัตโนมัติ ถ้าจะยกเลิกต้องจ่ายค่าปรับเท่ารายได้สามปีย้อนหลัง"},
  {n:"rin",f:"sad",l:"casual",t:"และข้อ 14.3 ค่ะ… ประโยคเดียวกับในซองเขียวทุกตัวอักษร ข้อมูลการชก ภาพ และเสียง เป็นของบริษัทในเครือตลอดไป"},
  {n:"alicia",f:"sad",l:"casual",t:"…สามสิบเปอร์เซ็นต์ สิบปี ตลอดไป ผู้จัดการของฉันบอกว่ามัน \"มาตรฐานวงการ\""},
  {n:"rin",f:"happy",l:"casual",t:"ฉันอ่านตัวเลขได้ค่ะ แต่ฉันไม่รู้ว่าในวงการเขาเซ็นกันแบบนี้จริงไหม คุณรู้ดีกว่าฉัน"},
  {n:"alicia",f:"happy",l:"casual",t:"…ไม่มีใครเซ็นแบบนี้หรอก ค่ายดี ๆ ให้นักมวยอย่างน้อยครึ่งหนึ่ง แล้วไม่มีใครกล้าเขียนคำว่า \"ตลอดไป\" ลงในสัญญานักกีฬา"},
  {n:"nar",t:"อลิเซียหยิบปากกาแดงจากมือริน แล้ววงข้อ 9 ข้อ 21 กับข้อ 14.3 ซ้ำอีกรอบด้วยมือตัวเอง",choice:[
    {t:"\"สองคนรวมกันอ่านสัญญาเก่งที่สุดในประเทศแล้วนะ\"",fx:G2=>{add(G2,"rin","bond",2);rgMeet(G2,"alicia",1);},then:[{n:"rin",f:"flustered",l:"casual",t:"…ข้อมูลยังไม่พอจะสรุปแบบนั้นค่ะ แต่ฉันจะไม่เถียง"}]},
    {t:"\"อลิเซีย จะเอายังไงกับมันต่อ\"",fx:G2=>{rgMeet(G2,"alicia",2);add(G2,"rin","bond",1);},then:[{n:"alicia",f:"happy",l:"casual",t:"ส่งกลับไปพร้อมรอยปากกาแดงนี่แหละค่ะ แล้วก็… อาจจะต้องหาผู้จัดการส่วนตัวคนใหม่"}]}]},
  {n:"alicia",f:"flustered",l:"casual",with:"rin",t:"ริน… ขอบคุณนะ ฉันไม่เคยมีเพื่อนที่ฉลาดแบบนี้ ทุกคนรอบตัวฉันฉลาดแค่เรื่องยอดวิว"},
  {n:"rin",f:"flustered",l:"casual",t:"เพื่อน… บันทึกไว้แล้วค่ะ"},
  {fx:G2=>{add(G2,"rin","bond",2);const r=G2.F.rin;if(r)r.morale=Math.min(100,(r.morale||0)+5);rgMeet(G2,"alicia",2);G2.flags.rinAlicia=1;}},
  {n:"nar",t:"ริน กำลังใจ +5 · รินกับอลิเซียกลายเป็นเพื่อนกัน"}]
 :[{n:"nar",t:"สี่ทุ่ม อลิเซียมาเคาะประตูห้องพัก ในมือถือแฟ้มสัญญาหนาเตอะ"},
  {n:"alicia",f:"sad",l:"casual",t:"สัญญานาคาลีกค่ะ ผู้จัดการส่วนตัวบอกให้เซ็นภายในสัปดาห์นี้ …คุณช่วยอ่านข้อ 14.3 ให้ฟังหน่อยได้ไหม ฉันอ่านแล้วมือสั่น"},
  {n:"nar",t:"ผู้จัดการอ่านออกเสียงช้า ๆ ประโยคเดียวกับในซองเขียวทุกตัวอักษร อลิเซียปิดแฟ้มเงียบ ๆ"},
  {n:"alicia",f:"happy",l:"casual",t:"…ขอบคุณค่ะ ฉันรู้แล้วว่าจะทำยังไงกับมัน"},
  {fx:G2=>rgMeet(G2,"alicia",2)}];}};
RG_POST.central="📱 แจ้งเตือน: อลิเซีย (@alicia.hanuman) โพสต์ใหม่\n\n\"ขอบคุณทุกคนที่เชียร์ศึกชิงแชมป์ภาคกลางนะคะ ถ้วยไปอยู่กับค่ายศิริชัยแล้ว และพวกเขาสมควรได้มันทุกหมัด\n\nมีข่าวลือว่าฉันเซ็นสัญญากับลีกใหม่แล้ว ขอตอบตรงนี้เลยค่ะ: ฉันยังไม่ได้เซ็นกับใครทั้งนั้น\n\nและจะไม่เซ็นอะไรที่มีคำว่า 'ตลอดไป'\"\n\n— ยอดไลก์ 48,000 ภายในหนึ่งชั่วโมง\n\n📩 ข้อความส่วนตัวตามมาอีกหนึ่งข้อความ: \"เห็นโพสต์แล้วใช่ไหม …ไม่ต้องตอบก็ได้ แค่อยากให้คุณเห็นก่อนคนอื่น\"";
RG_CHAT.alicia=[
 {id:"al_live",x:[
  ["ไลฟ์เมื่อคืนคนดูสองหมื่น แต่คอมเมนต์ครึ่งหนึ่งถามว่า \"ผู้จัดการศิริชัยอยู่ไหน\"",[["บอกเขาว่าฉันกำลังทำงาน",1,"…บอกไปแล้ว คนดูกดผิดหวังรัวเลย"],["งั้นไลฟ์หน้าชวนฉันสิ",2,"ไม่ได้! …เดี๋ยวคนดูจะคิดไปเองว่าเรา… ไม่ได้ ๆ"],["ช่างคอมเมนต์เถอะ",0,"ช่างไม่ได้ค่ะ นั่นคืองานฉัน"]]],
  ["ทีมสปอนเซอร์ให้ฉันยิ้มใส่กล้องวันละสามชั่วโมง",[["เหนื่อยแย่เลย พักบ้างนะ",2,"…คุณเป็นคนแรกที่บอกให้ฉันพัก แทนที่จะบอกให้ยิ้มอีก"],["ยิ้มสวยอยู่แล้วนี่",1,"รู้ค่ะ …แต่ขอบคุณ"],["งานก็คืองาน",0,"…ใช่ งานก็คืองาน"]]],
  ["ไปซ้อมก่อนนะ ซ้อมจริง ไม่ได้ซ้อมถ่ายคลิป",[["ซ้อมดี ๆ",1,"แน่นอนค่ะ"],["ส่งคลิปซ้อมจริงมาให้ดูด้วย",2,"…คลิปที่ไม่มีใครเคยเห็น ส่งให้คุณคนเดียวนะ"],["โอเค",0,"บาย"]]]]},
 {id:"al_rin",x:[
  ["รินส่งตารางวิเคราะห์หมัดของฉันมาให้ สิบเจ็ดหน้า",[["รินชอบเธอนะ ถึงทำให้ขนาดนั้น",2,"…จริงเหรอ งั้นฉันจะอ่านทั้งสิบเจ็ดหน้าเลย"],["อ่านไหวเหรอ",1,"อ่านไปสองหน้า แล้วโทรถามรินที่เหลือ"],["เยอะไปไหม",0,"รินบอกว่านี่คือฉบับย่อ"]]],
  ["ฉันชวนรินไปกินบุฟเฟต์ เธอนับแคลอรี่ทุกจานเลย",[["นั่นคือรินแหละ",1,"ใช่ค่ะ แล้วเธอยังกินเยอะกว่าฉันอีก"],["เธอสองคนเข้ากันดีนะ",2,"…ฉันไม่เคยมีเพื่อนที่ไม่สนยอดวิวมาก่อน มันสบายใจดี"],["แล้วอร่อยไหม",0,"อร่อยค่ะ"]]],
  ["อย่าบอกรินนะว่าฉันเล่าให้ฟัง",[["ไม่บอกแน่นอน",1,"สัญญานะ"],["ช้าไปแล้ว รินรู้ทุกอย่าง",2,"…จริงด้วย รินคงคำนวณไว้ตั้งแต่แรกแล้ว"],["บอกไปแล้ว",0,"ผู้จัดการ!!"]]]]},
 {id:"al_hanuman",x:[
  ["ค่ายหนุมานมีลิงมาขโมยนวมทุกวัน วันนี้มันเอาไปทั้งคู่",[["ลิงลพบุรีขโมยผ้าพันมือค่ายเราไปเหมือนกัน",2,"ฮ่า ๆ งั้นตอนนี้ลิงที่นั่นคงตั้งค่ายมวยเองได้แล้ว"],["ค่ายชื่อหนุมานก็สมควรแล้ว",1,"…ตลกค่ะ ฉันหัวเราะออกเสียงเลยนะ"],["ทำไมไม่ไล่ไป",0,"ไล่ไม่ได้ค่ะ ลิงที่นี่เป็นเจ้าของเมือง"]]],
  ["ท่าหนุมานถวายแหวนของค่ายเรา ครูบอกว่าฉันทำสวยที่สุดในรอบสิบปี",[["สวยและแรงด้วย",2,"…คุณพูดคำว่าแรงก่อนสวย ฉันจะจำไว้"],["ครูตาถึง",1,"ครูตาถึงค่ะ"],["สวยอย่างเดียวชนะไม่ได้นะ",0,"…รู้ค่ะ ไม่ต้องย้ำ"]]],
  ["ว่าง ๆ มาค่ายหนุมานบ้างสิ ฉันจะพาเดินดู …ในฐานะเจ้าบ้านเฉย ๆ",[["ไปแน่นอน",2,"…ฉันจะไม่บอกทีมงาน จะได้ไม่มีกล้อง"],["พาทั้งค่ายไปได้ไหม",1,"ได้ค่ะ แต่ลิงจะชอบคุณมากกว่าฉันแน่ ๆ"],["ถ้าว่างนะ",0,"…ก็ได้"]]]]},
 {id:"al_mgr",x:[
  ["ฉันไล่ผู้จัดการส่วนตัวออกแล้ว คนที่บอกให้เซ็นสัญญานาคาลีก",[["ตัดสินใจถูกแล้ว",2,"…ฉันกลัวมาก แต่พอได้ยินคุณพูดแบบนี้ก็ดีขึ้น"],["แล้วใครจะดูแลงานต่อ",1,"ตอนนี้ฉันทำเองค่ะ รินช่วยดูสัญญาให้"],["กล้ามาก",1,"ใช่ไหมล่ะ!"]]],
  ["…ผู้จัดการค่ายศิริชัยรับดูแลนักมวยนอกค่ายบ้างไหมคะ ถามเล่น ๆ",[["ถ้าเป็นเธอ ยินดีเสมอ",2,"…ถามเล่น ๆ เฉย ๆ นะ! อย่าเข้าใจผิด! …แต่จำไว้แล้ว"],["ค่ายเราเล็กนะ",1,"ค่ายเล็กที่ชนะฉันได้ค่ะ"],["ไม่รับ",0,"…ก็แค่ถามเล่น"]]],
  ["ลืมที่ฉันถามไปเลยนะ!",[["ลืมไม่ได้แล้วล่ะ",2,"…งั้นก็จำไว้ก็ได้"],["โอเค ลืมแล้ว",0,"…ลืมเร็วจังนะ"],["ลืมแล้ว แต่จดไว้",1,"ผู้จัดการ!"]]]]},
 {id:"al_night",x:[
  ["คืนนี้ฉันไม่ได้ไลฟ์ นั่งดูหิ่งห้อยที่ริมน้ำคนเดียว",[["เหมือนคืนที่ล่องเรือเลย",2,"…คุณยังจำได้ ฉันนึกว่ามีแต่ฉันที่จำ"],["ไม่ไลฟ์ก็ดีนะ",1,"ใช่ค่ะ เงียบดี"],["ระวังยุงนะ",1,"ทายากันยุงแล้ว ฮ่า ๆ"]]],
  ["ถ้าวันหนึ่งไม่มีใครดูไลฟ์ฉันแล้ว คุณจะยังดูไหม",[["ดูอยู่แล้ว ถึงจะเป็นคนดูคนเดียว",2,"…คนดูคนเดียวก็พอแล้วค่ะ"],["คนดูไม่หายหรอก",1,"ตอบเลี่ยงนะ แต่ก็ขอบคุณ"],["ไม่รู้สิ",0,"…ตอบตรงไปไหม"]]],
  ["ไปนอนแล้ว อย่าส่งสติกเกอร์ตอบนะ ฉันจะได้ไม่ต้องตอบกลับ",[["(ส่งสติกเกอร์)",1,"…ตอบแล้ว พอใจไหม (สติกเกอร์หัวใจ)"],["ฝันดีนะ",2,"…ฝันดีค่ะ ผู้จัดการ"],["โอเค",0,"ราตรีสวัสดิ์"]]]]}];
CHAT.alicia=RG_CHAT.alicia;
/* ---------- v1.90 limit break: a fighter with every stat at 20 (Lv.20+) leaves camp for two weeks of training and comes back with a ceiling of 25 ---------- */
const LB_CAP=25;
const lbFull=f=>!!f&&ATTRS.every(([k])=>f.a[k]>=19.95);
function lbBlock(G,f){if(!G.region)return "บทศึกชิงเจ้าสี่ภาคยังไม่เปิด";if(stCap(f)>=LB_CAP)return "ทะลุขีดจำกัดแล้ว";if(!lbFull(f))return "ค่าพลังต้องเต็ม 20 ทุกช่อง";
  if((f.lvl||1)<20)return "ต้อง Lv.20 ขึ้นไป";if(isAway(G,f.id))return "ยังไม่อยู่ค่าย";if(f.injury)return "รอหายเจ็บก่อน";
  if(G.bookings.some(b=>(b.a===f.id||b.b===f.id)&&b.week>=G.week&&b.week<=G.week+2))return "มีไฟต์ในอีก 2 สัปดาห์ ยกเลิกหรือชกให้จบก่อน";
  const T=G.region.trip;if(T&&T.abs!=null&&T.abs-absWeek(G)<=2)return "ทั้งค่ายมีทริปภาคในอีก 2 สัปดาห์";return "";}
function lbCardHTML(f){if(!G.region||f.camp!=="player")return "";
  if(isAway(G,f.id)&&f.lbTrip)return `<div class="lbcard"><h4>✦ กำลังฝึกวิชา</h4><p class="meta">${esc(f.name)}กลับค่ายอีก ${awayLeft(G,f.id)} สัปดาห์ · ไม่ซ้อม ไม่รับไฟต์</p></div>`;
  if(stCap(f)>=LB_CAP||!lbFull(f))return "";const why=lbBlock(G,f);
  return `<div class="lbcard"><h4>✦ ทะลุขีดจำกัด</h4><p class="meta">ค่าพลังเต็ม 20 ทุกช่องแล้ว · ไปฝึกวิชานอกค่าย 2 สัปดาห์ (ไม่ซ้อม ไม่รับไฟต์) แล้วขีดจำกัดค่าพลังจะขึ้นเป็น ${LB_CAP}</p>
    <p class="meta">ส่วนที่เกิน 20 โตช้ากว่าปกติ ต้องซ้อมกันอีกนาน</p>${why?`<p class="meta redt">${why}</p>`:""}<button class="btn primary" data-act="lbgo" data-v="${f.id}" ${why?"disabled":""}>ส่งไปฝึกวิชา ▸</button></div>`;}
const LB_GO={
 kati:[{n:"coach",t:"กะทิ ค่าพลังเต็มทุกช่องแล้ว ซ้อมที่ค่ายต่อก็ได้แค่รักษาไว้"},{n:"coach",t:"ครูรู้จักหลวงตารูปหนึ่งที่วัดบนดอยแถวอมก๋อย สมัยหนุ่มท่านเคยชกกับปู่ชัย ไปอยู่กับท่านสองสัปดาห์"},
  {n:"kati",f:"sad",t:"สองสัปดาห์… หนูไม่เคยห่างค่ายนานขนาดนั้นเลยค่ะ"}],
 mali:[{n:"coach",t:"มะลิ ค่าพลังเต็มทุกช่องแล้ว ที่ไชยามีครูมวยรุ่นเก่าที่ยังสอนย่างสามขุมแบบดั้งเดิมอยู่"},{n:"mali",f:"happy",t:"กลับไชยาเหรอคะ~ ยายต้องดีใจแน่ ๆ แต่มะลิจะคิดถึงทุกคนนะ!"}],
 rin:[{n:"coach",t:"ริน ตัวเลขของเธอสุดแล้ว ซ้อมแบบเดิมไม่ขึ้นอีก"},{n:"rin",f:"happy",t:"ฉันรู้ค่ะ และวางแผนไว้แล้ว กรุงเทพฯ สองสัปดาห์ ที่ค่ายที่ฉันโดนน็อกตอนอายุสิบเก้า"},
  {n:"rin",f:"sad",t:"ฉันจะขึ้นเวทีเดิมอีกครั้ง …ตัวแปรเดียวที่ฉันยังไม่เคยแก้"}],
 ploy:[{n:"coach",t:"พลอย ค่าพลังเต็มทุกช่องแล้ว กลับไปโคราชสักสองสัปดาห์ไหม ครูโทรคุยกับพ่อเธอแล้ว"},{n:"ploy",f:"pout",t:"ไม่ได้อยากกลับหรอก …แต่พ่อโทรมาถามทุกอาทิตย์ว่าลูกยังวิ่งขึ้นเขาไหวไหม"}],
 fah:[{n:"coach",t:"ฟ้า ค่าพลังเต็มทุกช่องแล้ว อยากไปฝึกที่ไหนสักสองสัปดาห์ไหม"},{n:"fah",f:"happy",t:"ดอยอินทนนท์! ฟ้าจะวิ่งขึ้นยอดทุกเช้า ไม่มีใครตามทันแน่นอน!"}]};
const LB_BACK={
 kati:[{n:"nar",t:"สองสัปดาห์ต่อมา กะทิเดินกลับเข้าค่ายตอนเช้ามืด ผิวคล้ำขึ้น มือพันผ้าขาวเก่า ๆ"},{n:"kati",f:"happy",t:"หลวงตาให้หนูตักน้ำขึ้นดอยวันละร้อยเที่ยว ไม่ได้ต่อยกระสอบเลยสักวันค่ะ"},
  {n:"kati",f:"sad",t:"วันสุดท้ายท่านบอกว่าปู่ชัยไม่ได้สอนหนูไม่ครบหรอก ท่าสุดท้ายปู่เก็บไว้ให้หนูหาเอง"},{n:"coach",t:"แล้วเจอหรือยัง"},{n:"kati",f:"happy",t:"ยังค่ะ แต่หนูรู้แล้วว่ามันไม่ได้อยู่ที่ยี่สิบ"}],
 mali:[{n:"nar",t:"มะลิกลับมาพร้อมกล่องโฟมใบใหญ่ ยายทำขนมจีนแกงไตปลาฝากมาทั้งค่าย"},{n:"mali",f:"happy",t:"ครูเฒ่าให้มะลิเดินย่างสามขุมบนคันนาทุกวัน จนวันสุดท้ายไม่ตกลงไปในโคลนเลยสักครั้ง~"},
  {n:"mali",f:"happy",t:"ตอนนี้มะลิเดินเข้าหาคู่ชกได้โดยไม่ต้องคิดแล้ว ขาไปเองเลยค่ะ!"}],
 rin:[{n:"nar",t:"รินกลับมาพร้อมสมุดเล่มใหม่ ทุกหน้าว่างเปล่า"},{n:"rin",f:"happy",t:"ฉันขึ้นเวทีเดิมแล้วค่ะ ครั้งนี้ไม่ได้นับอะไรเลย แค่ชก"},
  {n:"rin",f:"flustered",t:"ผลการทดลอง: ความกลัวลดลงประมาณเก้าสิบเปอร์เซ็นต์ …อีกสิบเปอร์เซ็นต์ฉันจะเก็บไว้เตือนตัวเอง"}],
 ploy:[{n:"nar",t:"พลอยกลับมาด้วยรองเท้าวิ่งคู่ใหม่ คู่เก่าพังคาเขา"},{n:"ploy",f:"happy",t:"พ่อจับเวลาวิ่งขึ้นเขาทุกวัน วันสุดท้ายฉันชนะสถิติที่พ่อทำไว้ตอนหนุ่ม"},
  {n:"ploy",f:"flustered",t:"พ่อไม่ได้ชมหรอก …แค่ลบชื่อตัวเองออกจากกระดานแล้วเขียนชื่อฉันแทน"}],
 fah:[{n:"nar",t:"ฟ้ากลับมาพร้อมกาแฟดอยสิบถุง"},{n:"fah",f:"happy",t:"ฟ้าวิ่งขึ้นยอดดอยสิบสี่รอบ! รอบสุดท้ายเห็นพระอาทิตย์ขึ้นอยู่คนเดียว"},
  {n:"fah",f:"sad",t:"…แล้วก็คิดถึงค่ายมากเลย ห้ามบอกใครนะ"},{n:"fah",f:"happy",t:"กาแฟนี่ฝากทุกคน! ผู้จัดการจ่ายคืนด้วยนะ!"}]};
const lbGo=(f)=>LB_GO[f.id]||[{n:"coach",t:`${f.name}ค่าพลังเต็มทุกช่องแล้ว ครูจะส่งไปฝึกกับครูมวยเก่าที่ครูรู้จักสองสัปดาห์`}];
const lbBack=(f)=>LB_BACK[f.id]||[{n:"nar",t:`${f.name}กลับมาจากการฝึกสองสัปดาห์ สายตานิ่งกว่าเดิม`},{n:"coach",t:"ไม่ต้องเล่า ครูเห็นจากวิธีเดินก็รู้แล้ว"}];
function lbStart(G,id){const f=G.F[id];if(!f||lbBlock(G,f))return;const who=LB_GO[id]?id:"coach";
  playScene([...lbGo(f).map(x=>({l:"casual",...x})),{n:"nar",t:`ให้${f.name}ไปฝึกวิชา 2 สัปดาห์ไหม?`,choice:[
    {t:"ไปเถอะ ค่ายรอได้",fx:G2=>{sendAway(G2,id,2,"train");G2.F[id].lbTrip=1;G2.log.push(`${f.name}ออกไปฝึกวิชานอกค่าย 2 สัปดาห์`);},then:[{n:who==="coach"?"coach":id,f:"happy",l:"casual",t:"แล้วเจอกันอีกสองสัปดาห์!"}]},
    {t:"ยังก่อน",then:[{n:"coach",t:"ได้ ครูไม่รีบ พร้อมเมื่อไรก็บอก"}]}]}],()=>{save();render();},{bg:"camp",look:"casual"});}
/* weekly: the homecoming, else the first time someone hits the ceiling Kru Daeng points it out */
function lbWeek(G,done){const R=roster(G).concat(Object.values(G.F).filter(f=>f.lbTrip&&f.camp==="player"&&!roster(G).includes(f)));
  const back=R.find(f=>f.lbTrip&&!isAway(G,f.id));
  if(back){playScene([...lbBack(back).map(x=>({l:"casual",...x})),{fx:G2=>{const f=G2.F[back.id];f.cap=LB_CAP;f.potential=Math.max(f.potential||14,LB_CAP);f.lbTrip=0;f.awayBack=true;
      for(const [k] of ATTRS)f.a[k]=Math.min(LB_CAP,f.a[k]+.2);f.morale=Math.min(100,(f.morale||0)+10);G2.log.push(`${f.name} ทะลุขีดจำกัด · ขีดจำกัดค่าพลัง 20 → ${LB_CAP}`);}},
    {n:"nar",t:`${back.name}ทะลุขีดจำกัด · ขีดจำกัดค่าพลัง 20 → ${LB_CAP} · ค่าพลังทุกช่อง +0.2 · กำลังใจ +10`}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  const ready=roster(G).find(f=>!f.lbNote&&stCap(f)<LB_CAP&&lbFull(f)&&(f.lvl||1)>=20);
  if(ready){ready.lbNote=1;playScene([{n:"coach",t:`ผู้จัดการ ${ready.name}ซ้อมยังไงค่าพลังก็ไม่ขึ้นแล้ว เต็ม 20 ทุกช่อง`},{n:"coach",t:"ครูมีทางหนึ่ง ไปดูที่หน้าค่าพลังของเธอสิ"},
    {n:"nar",t:"ปลดล็อก: ทะลุขีดจำกัด · ดูได้ที่หน้านักมวย › ค่าพลัง"}],()=>{save();done();},{bg:"camp",look:"casual"});return true;}
  return false;}
/* ---------- v1.90 round 10: the Naka League team (names locked 18 Nov 2026 — see project doc claude/naka-league-team.md) ----------
   "Naka" is the family name of Krerk and Ladda only; the four team members are hired fighters from other disciplines.
   shape = stat offsets from the fitted level · grap/sub = takedown / submission game (0–20) · nlsk = the three skills the AI fires
   spl = special sheets (code effects if none) · td:1 = the throw sheet that plays on a takedown */
const NL={
 nia:{name:"ไนอา โอคาฟอร์",nick:"จังหวะกลองดำ",art:"มวยสากล",col:"#3a7bd5",sprite:"nl_nia",sty:"pressure",
  shape:{punch:3,kick:-6,knee:-5,elbow:-5,clinch:-4,guard:2,foot:3,counter:3,speed:2,iq:1},grap:0,sub:0,pfx:{dmg:{punch:.12},ctr:.04,evade:.02},
  nlsk:[{id:"nl_peek",name:"พีกอะบู",k:"def"},{id:"nl_liver",name:"ลิเวอร์ช็อต",k:"atk",w:"punch"},{id:"nl_dempsey",name:"เดมป์ซีย์โรล",k:"atk",w:"punch"}],
  spl:[{img:"nl_nia_special",w:"punch",def:"เดมป์ซีย์โรล",npc:1,p:.5}],tip:"หมัดไวและสวนเก่ง แต่ไม่เคยรับลูกเตะกับเข่า"},
 varya:{name:"วาร์ยา โซโคโลวา",nick:"หมีแดง",art:"แซมโบ้ + MMA",col:"#d43a3a",sprite:"nl_varya",sty:"inside",
  shape:{clinch:3,power:3,dur:2,stamina:1,kick:-3,foot:-2,speed:-1},grap:18,sub:15,tdName:["ดับเบิลเลก","ทุ่มสะโพก","ซูเพล็กซ์"],subName:["ฮีลฮุก","นีบาร์"],pfx:{gnp:.25},
  nlsk:[{id:"nl_double",name:"ดับเบิลเลก",k:"td"},{id:"nl_suplex",name:"ซูเพล็กซ์",k:"td"},{id:"nl_heelhook",name:"ฮีลฮุก",k:"sub"}],
  spl:[{img:"nl_varya_special",def:"ซูเพล็กซ์",td:1}],tip:"ทุ่มแรงและล็อกขาเก่ง · ถ้าดึงลงพื้นได้จะทุบไม่หยุด"},
 meili:{name:"เหม่ยลี่ แซ่ตั้ง",nick:"มังกรเยาวราช",art:"กังฟู",col:"#e0662a",sprite:"nl_meili",sty:"footwork",
  shape:{kick:4,speed:3,foot:2,punch:1,clinch:-4,knee:-3,dur:-2},grap:0,sub:0,pfx:{dmg:{kick:.12},evade:.02},
  nlsk:[{id:"nl_shadowless",name:"เตะไร้เงา",k:"atk",w:"kick"},{id:"nl_inch",name:"หมัดหนึ่งนิ้ว",k:"atk",w:"punch"},{id:"nl_crane",name:"ท่ากระเรียน",k:"def"}],
  spl:[{img:"nl_meili_kick",w:"kick",def:"เตะไร้เงา",npc:1,p:.5},{img:"nl_meili_special",w:"punch",def:"หมัดหนึ่งนิ้ว",npc:1,p:.5}],tip:"เตะเร็วและไกล · เข้าวงในแล้วเหลือแค่ครึ่งตัว"},
 rosa:{name:"Corazón Rosa",nick:"หัวใจสีชมพู",art:"ลูชาลิเบร",col:"#ea5aa0",sprite:"nl_rosa",sty:"power",
  shape:{clinch:3,stamina:3,dur:3,power:1,guard:-2,counter:-2,iq:-1},grap:15,sub:10,tdName:["เฮอริคานรานา","ดีดีที"],subName:["ลามิสติกา"],pfx:{regen:.05,dmg:{elbow:.08}},
  nlsk:[{id:"nl_hurricanrana",name:"เฮอริคานรานา",k:"td"},{id:"nl_mistica",name:"ลามิสติกา",k:"sub"},{id:"nl_moonsault",name:"มูนซอลต์",k:"atk",w:"elbow"}],
  spl:[{img:"nl_rosa_special",def:"เฮอริคานรานา",td:1}],tip:"อึดและทนมาก ชอบทุ่มโชว์คนดู · การ์ดเปิดบ่อย"},
 /* boss: three forms, one per round (Man 18 Nov 2026) — 1 hood: heavy · 2 hood off: fast and sharp · 3 blood mode: the Naka family's sports medicine,
    she punches herself to boil the blood — red skin, red eyes, furious, very fast */
 ladda:{name:"ลดา",nick:"เครื่องจักรสังหารแห่งมวยหญิง",art:"MMA + มวยไทยสมัยใหม่",col:"#f2f2f2",sprite:"nl_ladda_hood",phR:[1,1,2,2,3]/* v1.91.9 (Man): 5 rounds — hood 1–2 · no hood 3–4 · blood mode 5 */,hpX:45,hurt:{def:.4,ev:.1,sta:.5,rec:1.1,rnd:14},
  shape:{elbow:2,knee:1,clinch:2,iq:2,comp:2},grap:16,sub:16,tdName:["ดับเบิลเลก","จับขาล้ม"],subName:["รัดคอจากด้านหลัง","กิโยติน"],pfx:{dmg:{elbow:.1},gnp:.15},
  nlsk:[{id:"nl_ld_double",name:"ดับเบิลเลก",k:"td"},{id:"nl_ld_superman",name:"ซูเปอร์แมนพันช์",k:"atk",w:"punch"},{id:"nl_ld_rnc",name:"รัดคอจากด้านหลัง",k:"sub"}],
  phases:[{n:1,fst:"power",sprite:"nl_ladda_hood",dmg:1.18,hit:-.01,ini:-1,say:"ลดาดึงฮู้ดลงปิดครึ่งหน้า ยืนนิ่งไม่ขยับ… ทุกหมัดที่ออกมาหนักเหมือนค้อน"},
   {n:2,fst:"read",fall:"footwork",sprite:"nl_ladda",dmg:1,hit:.05,ini:3,ev:.04,say:"ลดาสะบัดฮู้ดทิ้ง ผมขาวปลายแดงสยายออกมา — ความเร็วเปลี่ยนไปทันที!"},
   {n:3,fst:"pressure",lvUp:1,sprite:"nl_ladda_blood",dmg:1.3,hit:.08,ini:4,ev:.03,self:5,blood:1,say:"ลดาต่อยหน้าตัวเองสองหมัด — วิชาแพทย์ของนาคากระตุ้นเลือด! ตัวแดง ตาแดงก่ำ… โหมดเลือดเดือด!"}],
  spl:[{img:"nl_ladda_sp_superman",w:"punch",def:"ซูเปอร์แมนพันช์",npc:1,p:.55,ph:1},{img:"nl_ladda_sp_headkick",w:"kick",def:"เฮดคิก",npc:1,p:.55,ph:1},
   {img:"nl_ladda_sp_spinkick",w:"kick",def:"สปินนิงแบ็กคิก",npc:1,p:.55,ph:2},{img:"nl_ladda_sp_backfist",w:"punch",def:"สปินนิงแบ็กฟิสต์",npc:1,p:.55,ph:2},
   {img:"nl_ladda_sp_bloodfist",w:"punch",def:"หมัดโลหิตนาคา",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodkick",w:"kick",def:"สปินนิงวีลคิก",npc:1,p:.6,ph:3},{img:"nl_ladda_sp_bloodslam",def:"ทุ่มเลือดเดือด",td:1,ph:3},{img:"nl_ladda_sp_awaken",def:"โหมดเลือดเดือด",awaken:1,ph:3}],
  tip:"เปลี่ยนร่างระหว่างไฟต์ · ยก 1–2 คลุมฮู้ดหนักแน่น · ยก 3–4 ถอดฮู้ดเร็วมาก · ยก 5 โหมดเลือดเดือด"}};
const NL_ORDER=["nia","varya","meili","rosa","ladda"];
/* build (or refresh) a team member sized against `me`: she wins about `p` of 5-round bouts, never above the ceiling `ceil` */
function nlFighter(G,k,me,p,ceil){const D=NL[k],id="nl_"+k;let f=G.F[id];
  if(!f){f=baseFighter(id,mkNPC(id,D.name,"X",14,mulberry32(hashStr(id)),2));f.camp="quest";f.div="X";G.F[id]=f;}
  Object.assign(f,{name:D.name,full:D.name,color:D.col,grap:D.grap,sub:D.sub,tdName:D.tdName,subName:D.subName,pfx:D.pfx,nlsk:D.nlsk,spl:D.spl.length?D.spl:null,nl:k,lvUpd:0,phases:D.phases||null,phR:D.phR||null,rgSty:D.sty||null,hpX:D.hpX||0,hurt:D.hurt||null});
  if(D.sprite)f.sprite=D.sprite;f.fatigue=0;f.injury=0;f.morale=75;f.lvl=Math.max(me&&me.lvl||1,1)+(k==="ladda"?9:NL_ORDER.indexOf(k)<2?7:8)/* v1.90.20 (Man): members +7–8, Ladda +9 (+10 in blood mode) — the label only, strength comes from the fit */;
  const setT=T=>{f.vet=0;for(const [a] of ATTRS)f.a[a]=Math.max(1,Math.min(20,T-.6+(D.shape[a]||0)));liftOpponent(f,T,20);};
  {const T=RG_FIX.nl[k];setT(T);f.nlT=T;}return f;} /* v1.90.21: fixed strength (p and ceil kept only for the old dev calls) */
function nlTest(k){const me=roster(G).filter(f=>!isAway(G,f.id)).sort((a,b)=>effOvr(G,b)-effOvr(G,a))[0];if(!me)return;
  const o=nlFighter(G,k,me,k==="ladda"?.25:.4,RG_LADDER.champ(3,0)+(k==="ladda"?.5:0));
  const b={id:"nltest"+Date.now(),a:me.id,b:o.id,week:G.week,tier:"exhibition",rounds:5,win:0,lose:0,bg:"bg_naka_underground.webp",nltest:1};G.bookings.push(b);save();openFight(b,()=>{G.bookings=G.bookings.filter(x=>x.id!==b.id);save();render();});}
const REGION={
  /* end of week (after the weekly events): the gala the week after the invitation, the contract beat the week after the first cup */
  weekScene(G,done){const R=G.region;if(!R){done();return;}const now=gameWeek(G);if(lbWeek(G,done))return;
    if(!R.gala){if(R.galaAbs==null)R.galaAbs=now+1;if(now>=R.galaAbs){R.gala=1;AU.startMusic&&AU.startMusic("hub");playScene(rgGala(G),()=>{save();done();},{bg:"gala",look:"casual"});return;}}
    const r=(R.cups||[])[0],c=r&&R.champ[r];
    if(r&&!R.c1&&c&&now>=(c.wonAbs||0)+1){R.c1="seen";playScene(rgCup1(G,r),()=>{save();done();},{bg:"camp",look:"casual"});return;}
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
    const f=baseFighter(id,mkNPC(id,RG_OPP[dest]||"แชมป์ประจำจังหวัด","X",Math.min(19,Math.round(target-1)),rng,RG_ORDER.indexOf(r)+2)),base={...f.a};
    const setT=T=>{f.a={...base};f.vet=0;for(const [k,v] of Object.entries(tilt))f.a[k]=Math.min(20,f.a[k]+v);liftOpponent(f,T,20);
      for(let i=0;i<80&&ovr(f.a)>T+.05;i++)for(const k in f.a)if(!(k in tilt))f.a[k]=Math.max(1,f.a[k]-.15);};
    f.rg=dest;rgDress(f);f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;setT(RG_FIX.belt(n));f.rgT=+RG_FIX.belt(n).toFixed(2);f.camp="quest";f.div="X";f.rg=dest;f.rgSty=rgBeltSty(r,id);rgDress(f);f.sprite="rgp_"+dest;/* v1.89.14: high-level sheet dyed in the province colour */f.color=RG[r].col;f.lvl=(me.lvl||1)+(n<8?1:2);/* v1.90.20 (Man): province champions 1–2 levels above */f.fatigue=0;f.morale=70;
    G.F[id]=f;syncFighterAges(G);return id;},
  purse(G){const n=this.beltTotal(G),w=Math.round((10000+n*800)*(1+Math.min(G.rep,50)/100)/100)*100;return {win:w,lose:Math.round(w*.4/100)*100};},
  book(G,dest,fid){const R=G.region,D=ROAD_DEST[dest],me=G.F[fid];if(!R||!D||!me)return {ok:false,why:"ข้อมูลไม่ครบ"};
    if(R.trip)return {ok:false,why:"มีทริปที่นัดไว้แล้ว"};if((R.belts[D.r]||{})[dest])return {ok:false,why:"ได้เข็มขัดจังหวัดนี้แล้ว"};
    const wk=this.tripWeek(G);if(!wk)return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว"};
    if(!this.riders(G,wk).some(f=>f.id===fid))return {ok:false,why:`${me.name}ไม่พร้อมเดินทาง`};
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs);if(G.cash<P.total)return {ok:false,why:"เงินไม่พอค่าเดินทาง"};
    const opp=this.makeOpp(G,dest,me,abs),pay=this.purse(G),bid=`rg${abs}_${dest}`;
    G.bookings.push({id:bid,a:fid,b:opp,week:wk,tier:"region",rounds:3,win:pay.win,lose:pay.lose,region:{r:D.r,dest},bg:dest==="chanthaburi"?"bg_region_east.webp":`bg_ring_${dest}.webp`});
    G.cash-=P.total;G.offers=(G.offers||[]).filter(o=>o.week!==wk);
    R.trip={abs,season:G.season||1,wk,dest,fid,opp,bid,cost:P.total,car:P.car,fat:P.fat};
    G.log=G.log||[];G.log.push(`วางแผนเดินทางไป${D.name} สัปดาห์ ${wk} · ค่าเดินทาง ${fmt(P.total)}`);return {ok:true,wk,cost:P.total};},
  cancel(G){const R=G.region,T=R&&R.trip;if(!T)return false;G.bookings=G.bookings.filter(b=>b.id!==T.bid);G.cash+=T.cost;
    (R.gc=R.gc||[]).push(T.opp);R.trip=null;return true;},

  /* ---------- results + weekly upkeep ---------- */
  flush(G){const R=G.region;if(!R||!R.pend||!R.pend.length)return;const done=R.pend.splice(0);
    for(const p of done){const rg=p.region||{},r=rg.r,dest=rg.dest,D=ROAD_DEST[dest];if(!D||!RG[r])continue;
      if(rg.series){this.seriesResult(G,r,p);continue;}
      rgTouch(G,RG_CID[r]);const T=R.trip,abs=T&&T.bid===p.bid?T.abs:gameWeek(G);
      if(p.res==="W"){R.belts[r]=R.belts[r]||{};R.belts[r][dest]=1;G.log=G.log||[];G.log.push(`${G.F[p.a]?G.F[p.a].name:""}คว้าเข็มขัดจังหวัด${D.name}!`);
        if(this.beltCount(G,r)===4&&R.champ[r].state==="locked"){R.champ[r].state="letter";this.champFighter(G,r);
          addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: ครบสี่เข็มขัดแล้ว`,body:RG_CH[r].letter});}}
      R.trip=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+1);(R.gc=R.gc||[]).push(p.b);}},
  /* weekly: post-cup letters and champion chats */
  letters(G){const R=G.region,now=gameWeek(G);R.postDone=R.postDone||{};
    for(const r of RG_ORDER){if(R.post&&R.post[r]!=null&&now>=R.post[r]&&!R.postDone[r]&&RG_POST[r]){R.postDone[r]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_POST[r]});}
      const cid=RG_CID[r],c=R.champ[r]||{},open=RG_CHAT[cid]&&G.F[cid]&&(c.visit==="done"||c.state==="won");G.chatIn=G.chatIn||{};
      if(open&&!G.chatIn[cid]&&now-((G.chatLastAbs||{})[cid]??-999)>=2&&mulberry32((G.seed||1)+now*31+cid.length)()<.45)G.chatIn[cid]=G.week;}},
  fade(G){const R=G.region,now=gameWeek(G),m=R.meet||{};R.meetT=R.meetT||{};R.miss=R.miss||{};
    for(const r of RG_ORDER){const cid=RG_CID[r];if(!(m[cid]>0))continue;if(R.meetT[cid]==null){R.meetT[cid]=now;continue;}if(R.joined&&R.joined[cid])continue;
      const gap=now-R.meetT[cid];
      if(gap>=3&&!R.miss[cid]){R.miss[cid]=1;addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`จดหมายจาก${RG[r].champ}`,body:RG_MISS[r]});}
      if(gap>=4){const pk=(R.meetPk||{})[cid]||m[cid],fl=RG_FLOOR.find(t=>pk>=t)||0;if(m[cid]>fl)m[cid]=Math.max(fl,Math.round((m[cid]-.25)*100)/100);}}},
  weekly(G){const R=G.region;this.flush(G);this.seriesWeekly(G);this.fade(G);this.letters(G);const T=R.trip;
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
    G.log=G.log||[];G.log.push(`ทั้งค่ายเดินทางถึง${ROAD_DEST[T.dest].name} · ความล้า +${fat}`);},
  /* night n of the trip. Far trips stay over (1–2 nights); a day trip may stay one extra night if you pay for the rooms */
  night(T,P,n,done){const D=ROAD_DEST[T.dest],r=D.r,nights=P.nights||0;
    /* after the cup: the champion's private night takes the place of the first hotel night (even on a day trip) */
    if(T.cupNight&&n===1){playScene(RG_CH[r].night(G,T),()=>{T.cupNight=0;this.night(T,P,2,done);},{bg:RG_CH[r].nightBg,look:"casual"});return;}
    {const X=RG_TRIPX[T.dest],tx=G.region.tx=G.region.tx||{};if(n===1&&X&&!tx[T.dest]&&!T.series){tx[T.dest]=1;rgTouch(G,RG_CID[r]);playScene(X.steps(G,T),()=>this.night(T,P,n,done),{bg:X.bg,look:"casual"});return;}}
    if(n>nights){if(nights===0&&n===1&&!T.extra&&!T.series){const rooms=Math.ceil((P.people||roadRiders(G).length)/2),cost=rooms*ROAD_ROOM;
        playScene([{n:"nar",t:`ไฟต์ที่${D.name}จบแล้ว ทุกคนยืนรออยู่ข้างรถ`,choice:[
          {t:"กลับค่ายเลย",then:[{n:"nar",t:"รถเลี้ยวออกจากเมือง ทุกคนหลับกันตั้งแต่ยังไม่พ้นเขตจังหวัด"}]},
          {t:`อยู่เที่ยวต่ออีก 1 คืน (ค่าห้อง ${fmt(cost)})`,fx:G2=>{if(G2.cash<cost){T.extraNo=1;return;}G2.cash-=cost;T.extra=1;}}]}],
          ()=>{if(T.extra)this.night(T,{...P,nights:1},1,done);else{if(T.extraNo)toast("เงินไม่พอค่าห้อง กลับค่ายกันก่อน");this.home(T,done);}},{bg:this.hotelBg[r],look:"casual"});return;}
      return this.home(T,done);}
    const cid=this.champId[r],C=RG[r],girls=roadRiders(G).filter(f=>CANON_IDS.includes(f.id)).sort((a,b)=>(b.bond||0)-(a.bond||0)).slice(0,3);
    const top=girls[0],jeal=top&&(top.bond||0)>=40?top:null;
    const choice=[{t:`ไปเดินเล่นกับ${C.champ} (แชมป์${C.name})`,fx:G2=>{rgMeet(G2,cid,3);if(jeal)jeal.morale=Math.max(0,(jeal.morale||0)-3);},
        then:[...this.dateLines(cid,D),...(jeal?[{n:jeal.id,f:"pout",l:"casual",t:this.jealLine(jeal.id,C.champ)}]:[])]},
      ...girls.map(g=>({t:`พา${g.name}ไปเที่ยว${D.name}`,fx:G2=>{add(G2,g.id,"bond",2);g.morale=Math.min(100,(g.morale||0)+4);},then:[{n:g.id,f:"happy",l:"casual",t:this.girlLine(g.id,D.name)}]})),
      {t:"พักผ่อนให้หายล้า",fx:G2=>{for(const f of roadRiders(G2))f.fatigue=Math.max(0,(f.fatigue||0)-10);},then:[{n:"nar",t:"ทุกคนเข้านอนแต่หัวค่ำ เช้ามาร่างกายสดชื่นขึ้น · ความล้า −10"}]},
      {t:"ซ้อมเบา ๆ ที่ลานจอดรถโรงแรม",fx:G2=>{for(const f of roadRiders(G2)){f.exp=(f.exp||0)+6;f.fatigue=Math.min(100,(f.fatigue||0)+2);}},then:[{n:"nar",t:"เตะเป้าใต้ไฟลานจอดรถจนยามโรงแรมมาดู · ประสบการณ์ +6"}]}];
    playScene([{n:"nar",t:nights>1?`คืนที่ ${n} ที่${D.name}`:`คืนนี้ทั้งค่ายพักที่${D.name}`},{n:"nar",t:"คืนนี้ทำอะไรดี?",choice}],()=>this.night(T,P,n+1,done),{bg:this.hotelBg[r],look:"casual"});},
  home(T,done){if(!T.shopDone){T.shopDone=1;this.shop(T,()=>this.home(T,done),1);return;}G.log=G.log||[];G.log.push(`กลับถึงค่ายจาก${ROAD_DEST[T.dest].name}`);save();done();},
  /* v1.89.23: the souvenir shop on the way out of town — the only place regional souvenirs are sold; keep buying until you get back on the bus */
  shopIntro:{north:"ก่อนออกจากเมือง รถแวะร้านของฝากริมถนน ร่มกระดาษสาแขวนเรียงเป็นแถว ผ้าทอผืนงามพับวางอยู่บนโต๊ะไม้",
    isan:"ก่อนออกจากเมือง รถแวะศูนย์ผ้าไหมประจำจังหวัด หมอนขวานกองสูงเป็นภูเขา ผ้าไหมแพรวาแขวนอยู่ในตู้กระจก",
    central:"ก่อนกลับ รถแวะร้านงานช่างไทยริมทาง หัวโขนจ้องลงมาจากผนัง ถ้วยเบญจรงค์เรียงอยู่บนชั้น",
    south:"ก่อนออกจากเมือง รถแวะร้านของฝากริมทะเล รูปหนังตะลุงแขวนโปร่งแสงอยู่หน้าร้าน ไข่มุกวางอยู่ในตู้กระจก"},
  shop(T,next,first){const r=ROAD_DEST[T.dest].r,L=SOUV_IDS.filter(k=>GIFTS[k].souv===r);if(!L.length){next();return;}
    G.souv=G.souv||{};const st={};
    const choice=[...L.map(k=>({t:`ซื้อ${GIFTS[k].name} (${fmt(GIFTS[k].price)}${G.souv[k]?` · มีอยู่ ${G.souv[k]}`:""})`,
        fx:G2=>{if(G2.cash<GIFTS[k].price){st.no=1;return;}G2.cash-=GIFTS[k].price;G2.souv=G2.souv||{};G2.souv[k]=(G2.souv[k]||0)+1;st.got=k;}})),
      {t:first?"ไม่ซื้อ ขึ้นรถกลับค่าย":"พอแล้ว ขึ้นรถกลับค่าย",fx:()=>{st.end=1;}}];
    const head=first?[{n:"nar",t:this.shopIntro[r]},{n:"nar",t:"ของฝากแพงหน่อย แต่ได้ใจสาว ๆ มาก · ซื้อเก็บไว้แล้วค่อยให้ทีหลังได้ (ร้านแบบนี้มีแค่ตอนมาทริป)"}]:[];
    playScene([...head,{n:"nar",t:first?"จะซื้ออะไรติดมือกลับไปไหม?":"ซื้ออะไรเพิ่มไหม?",choice}],()=>{
      if(st.end){next();return;}if(st.no)toast("เงินไม่พอ");if(st.got)toast(`ซื้อแล้ว: ${GIFTS[st.got].name} · ให้ได้จากปุ่มของขวัญ`);this.shop(T,next,0);},{bg:this.hotelBg[r],look:"casual"});},
  dateLines(cid,D){const L={
    baibua:[{n:"npc",who:"ใบบัว",t:`ถนนคนเดินคืนนี้คนเยอะเจ้า… ถ้าหลงกัน จับแขนเสื้อหนูไว้ก็ได้เจ้า`},{n:"nar",t:"ใบบัวเดินช้า ๆ ให้ผู้จัดการเดินทัน มือเกือบชนกันหลายครั้ง แต่ไม่มีใครพูดอะไร"}],
    tabtim:[{n:"npc",who:"ทับทิม",t:"ไปกินส้มตำกันเด้อ! ร้านนี้แซบหลาย… ฮ่า ๆ ๆ เผ็ดจนน้ำตาไหลแล้วอ้าย"},{n:"nar",t:"ทับทิมหัวเราะเสียงดังทั้งร้าน แต่พอผู้จัดการยื่นทิชชูให้ เธอเงียบไปครู่หนึ่ง"}],
    alicia:[{n:"npc",who:"อลิเซีย",t:"อย่าเข้าใจผิดนะ ฉันแค่อยากมีคนเดินเป็นเพื่อน คืนนี้กล้องปิดแล้ว…"},{n:"nar",t:"อลิเซียคว่ำโทรศัพท์ไว้บนโต๊ะทั้งคืน ไม่ได้หยิบขึ้นมาเลยสักครั้ง"}],
    chaba:[{n:"npc",who:"ชบา",t:"…ทะเลตอนกลางคืนสวย"},{n:"nar",t:"ชบาไม่พูดอะไรอีก แต่ยืนอยู่ข้าง ๆ จนน้ำขึ้นถึงข้อเท้า"}]};
    return L[cid]||[{n:"nar",t:`เดินเล่นยามค่ำที่${D.name}`}];},
  jealLine(id,champ){const L={kati:`ครูไปเดินกับ${champ}มาเหรอคะ… เปล่าค่ะ หนูไม่ได้ถาม`,mali:`มะลิเห็นนะ~ ไปกับ${champ}มาใช่ไหม… มะลิก็อยากไปบ้าง`,
    rin:`ไปกับ${champ}สองชั่วโมงสิบสองนาที รินไม่ได้จับเวลานะ แค่บังเอิญดูนาฬิกา`,ploy:`ไปกับ${champ}มาเหรอ ก็ดีนี่ …ทำไมต้องถามด้วย`,fah:`อ๋อ ไปกับ${champ}มาล่ะสิ! ฟ้าไม่ได้งอนนะ! แค่…หิว!`};return L[id]||"…";},
  girlLine(id,city){const L={kati:`ตลาดคืนนี้ของ${city}มีขนมเยอะจัง… ซื้อให้หนูชิ้นนึงได้ไหมคะ แค่ชิ้นเดียวจริง ๆ`,mali:`${city}ตอนกลางคืนสวยจัง~ ขอบคุณที่พามะลิมานะ จะจำไว้เลย`,
    rin:`รินจดร้านอร่อยของ${city}ไว้สามร้าน ไปร้านแรกก่อนนะคะ เหลือเวลาพอดี`,ploy:`ไม่ได้ขอให้พามานะ …แต่ก็ ขอบใจ`,fah:`${city}มีของกินแปลก ๆ เพียบ! ฟ้าจะลองให้หมดเลย ผู้จัดการจ่ายนะ!`};return L[id]||`คืนนี้ที่${city}สนุกดี`;},

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
  startSeries(G,r,fid){const c=G.region.champ[r],me=G.F[fid];if(!c||c.state!=="letter"||!me||me.camp!=="player")return {ok:false,why:"เลือกนักมวยไม่ได้"};
    Object.assign(c,{state:"series",fid,w:0,l:0,n:0,next:null});this.champFighter(G,r,me);
    const s=this.schedule(G,r,gameWeek(G)+1);if(!s){c.state="letter";c.fid=null;return {ok:false,why:"ปีนี้ไม่มีสัปดาห์ว่างพอสำหรับศึกแชมป์แล้ว"};}
    G.log=G.log||[];G.log.push(`${RG_TITLE[r]}: ${me.name} vs ${RG[r].champ} · นัดที่ 1 สัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`);
    return {ok:true,s};},
  seriesResult(G,r,p){const R=G.region,c=R.champ[r];if(!c||c.state!=="series")return;rgTouch(G,RG_CID[r]);const abs=c.next?c.next.abs:gameWeek(G),me=G.F[c.fid];
    c.n=(c.n||0)+1;if(p.res==="W")c.w++;else if(p.res==="L")c.l++;c.next=null;R.nextTripAbs=Math.max(R.nextTripAbs||0,abs+1);G.log=G.log||[];
    if(c.w>=2){c.state="won";c.wonAbs=abs;(R.post=R.post||{})[r]=abs+1;R.cups=R.cups||[];if(!R.cups.includes(r))R.cups.push(r);G.cash+=RG_CUP_PRIZE;G.rep+=4;
      if(me){G.honors=G.honors||[];const key=`${G.season||1}:rg_${r}:${me.div}::${me.id}`;if(!G.honors.some(h=>h.key===key))G.honors.push({key,season:G.season||1,week:G.week,id:me.id,div:me.div,kind:"rg_"+r});}
      rgMeet(G,this.champId[r],4);R.just={r,kind:"cup",res:p.res,w:c.w,l:c.l};
      G.log.push(`${HONOR_LABEL["rg_"+r]}: ${me?me.name:""} ${c.w}-${c.l} ${RG[r].champ} · เงินรางวัล ${fmt(RG_CUP_PRIZE)}`);return;}
    if(c.l>=2){c.state="lost";c.tries=(c.tries||0)+1;c.letterAbs=abs+2;R.just={r,kind:"lost",res:p.res,w:c.w,l:c.l};
      G.log.push(`${RG_TITLE[r]}: ${RG[r].champ} ป้องกันแชมป์ไว้ได้ ${c.l}-${c.w}`);return;}
    R.just={r,kind:"bout",res:p.res,w:c.w,l:c.l,n:c.n};const s=this.schedule(G,r,abs+2); /* v1.90.17 (Man): bouts two weeks apart */
    /* between bout 1 and bout 2 the champion drops by the camp (round 4) — missed if bout 2 comes first */
    if(c.n===1&&!c.visit){c.visit="due";addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG[r].champ}จะแวะมาที่ค่าย`,body:`${RG[r].champ}ฝากข่าวมาว่าจะแวะมาเยี่ยมค่ายก่อนนัดที่ 2\n\nไปต้อนรับได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค`});}
    else if(c.n>=2&&c.visit==="due")c.visit="missed";
    G.log.push(`${RG_TITLE[r]} นัดที่ ${c.n}: ${p.res==="W"?"ชนะ":p.res==="L"?"แพ้":"เสมอ"} · สกอร์ ${c.w}-${c.l}${s?` · นัดต่อไปสัปดาห์ ${s.wk}`:""}`);},
  /* weekly: a hurt fighter gets the bout moved, a dropped bout is rescheduled, a lost series sends a new letter later */
  seriesWeekly(G){const R=G.region,now=gameWeek(G);
    for(const r of RG_ORDER){const c=R.champ[r];if(!c)continue;
      if(c.state==="lost"&&now>=(c.letterAbs||0)){c.state="letter";c.fid=null;c.w=0;c.l=0;c.n=0;
        addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`${RG_TITLE[r]}: คำท้าครั้งใหม่`,body:RG_CH[r].again});continue;}
      if(c.state!=="series")continue;const me=G.F[c.fid];
      if(!me||me.camp!=="player"){G.bookings=G.bookings.filter(b=>!(c.next&&b.id===c.next.bid));Object.assign(c,{state:"letter",fid:null,w:0,l:0,n:0,next:null});continue;}
      const x=c.next;
      if(!x){this.schedule(G,r,now+1);continue;}
      const booked=G.bookings.find(b=>b.id===x.bid),pend=(R.pend||[]).some(p=>p.bid===x.bid);
      if(x.abs<now&&!booked&&!pend){this.postpone(G,r,now+2,"ไฟต์ไม่ได้ชกตามนัด");continue;}
      if(x.abs===now&&me.injury>0){G.bookings=G.bookings.filter(b=>b.id!==x.bid);this.postpone(G,r,now+me.injury+1,`${me.name}ยังเจ็บอยู่`);continue;}
      this.ensureBooking(G,r);}},
  postpone(G,r,from,why){const c=G.region.champ[r];c.next=null;const s=this.schedule(G,r,from);
    addMail(G,{kind:"letter",from:`${RG[r].champ} · แชมป์${RG[r].name}`,title:`เลื่อนนัด: ${RG_TITLE[r]}`,
      body:`${why} · ผู้จัดเลื่อนนัดที่ ${(c.n||0)+1}${s?` ไปเป็นสัปดาห์ ${s.wk}${s.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}\n\n${RG_CH[r].wait}`});},
  /* the championship trip: drive (paid by the sponsor) → the champion before the bell → the bout → cup or hotel → home */
  seriesTrip(b,done){const r=b.region.r,c=G.region.champ[r],dest=RG[r].fin;
    if(!c||!ROAD_DEST[dest]||typeof ROAD==="undefined"){openFight(b,done);return;}
    this.css();const abs=c.next?c.next.abs:gameWeek(G),P=roadPlan(G,dest,null,abs),T={abs,dest,fid:b.a,series:1,bid:b.id};G.region.just=null;
    ROAD.open(dest,{paid:true,sponsor:true,plan:P,onArrive:(P2,front)=>{const PP=P2||P;this.arrive(G,T,PP,front);
      playScene(this.preBout(r,b),()=>openFight2(b,()=>this.afterBout(T,PP,done)),{bg:"rg_"+RG_CH[r].ring,look:"fight"});}});},
  preBout(r,b){const c=G.region.champ[r],H=RG_CH[r],cid=this.champId[r],me=G.F[b.a],n=b.region.series,sc=`${c.w}-${c.l}`;
    const head={n:"nar",t:`${H.venue} · ${RG_TITLE[r]} นัดที่ ${n}${n>1?` · สกอร์ ${me.name} ${sc} ${RG[r].champ}`:""}`};
    const line=n===1?H.pre[0]:c.w===1&&c.l===1?H.pre[2]:H.pre[1];
    const mine=CANON_IDS.includes(me.id)?[{n:me.id,f:"angry",l:"fight",with:cid,t:me.id===H.pair?H.pairLine:H.reply}]:[{n:"nar",t:`${me.name}พยักหน้ารับ แล้วเดินกลับมุมแดง`}];
    return [head,{n:cid,f:n===1?"happy":"angry",l:"fight",t:line(me.name)},...mine];},
  afterBout(T,P,done){const R=G.region,J=R.just;R.just=null;const r=ROAD_DEST[T.dest].r,H=RG_CH[r],cid=this.champId[r];
    if(!J){this.home(T,done);return;}
    if(J.kind==="cup"){AU.startMusic&&AU.startMusic("victory");AU.sfx&&AU.sfx("champ");
      playScene(H.cup(G,J),()=>{T.cupNight=1;this.night(T,P,1,done);},{bg:"rg_"+H.ring,look:"fight"});return;}
    const steps=J.kind==="lost"?H.lost(G,J):[{n:cid,f:J.res==="W"?"sad":"happy",l:"fight",t:(J.res==="W"?H.lose:H.win)[Math.min(2,(J.n||1)-1)]},
      {n:"nar",t:`สกอร์ตอนนี้ ${J.w}-${J.l} · นัดต่อไปอีกราว 2 สัปดาห์`}];
    playScene(steps,()=>this.night(T,P,1,done),{bg:"rg_"+H.ring,look:"fight"});},
  /* the series fighter picker (modal) */
  seriesHTML(r){const C=RG[r],H=RG_CH[r],c=G.region.champ[r],R=roster(G).filter(f=>!f.injury);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const pay=this.seriesPurse(G);
    return `<h2>${esc(RG_TITLE[r])}</h2><p class="meta">${esc(C.champ)} · ${esc(C.nick)} · เวที ${esc(ROAD_DEST[C.fin].name)}</p>
     <div class="kv-row"><span>รูปแบบ</span><b>3 นัด ชนะ 2 · นัดละ 5 ยก · ห่างกันราว 2 สัปดาห์</b></div>${(G.region.champ[r].tries||0)?`<div class="kv-row"><span>นัดล้างตา</span><b class="goldt">แพ้ซีรีส์มาแล้ว ${G.region.champ[r].tries} ครั้ง · ทีมเรารู้ทางแชมป์คนนี้มากขึ้น</b></div>`:""}
     <div class="kv-row"><span>จุดเด่นของ${esc(C.champ)}</span><b>${esc(H.perk.name)}</b></div><p class="meta">${esc(H.perk.desc)}</p>
     <div class="kv-row"><span>ค่าตัวต่อนัด</span><b class="num">${fmt(pay.win)} / แพ้ ${fmt(pay.lose)}</b></div><div class="kv-row"><span>ได้ถ้วย</span><b class="num">${fmt(RG_CUP_PRIZE)}</b></div>
     <h3>ใครขึ้นชกทั้งซีรีส์</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgsfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมชก</p>`}
     <p class="meta">เลือกแล้วเปลี่ยนตัวไม่ได้จนจบซีรีส์ · บาดเจ็บ = เลื่อนนัด · ผู้จัดออกค่าเดินทางให้ทุกนัด${c.tries?` · ครั้งที่ ${c.tries+1}`:""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rgsgo" data-v="${r}" ${UI.rgFid?"":"disabled"}>รับคำท้า</button></div>`;},
  finRow(r){const C=RG[r],c=G.region.champ[r]||{},n=this.beltCount(G,r),F=ROAD_DEST[C.fin],me=G.F[c.fid];
    const st=c.state==="won"?`<span class="rg-belt">🏆 ได้ถ้วย</span>`:n<4?`<span class="meta">🔒 ครบ 4 เข็มขัดก่อน (${n}/4)</span>`
      :c.state==="letter"?`<button class="btn sm gold" data-act="rgser" data-v="${r}">เลือกนักมวยชิงแชมป์</button>`
      :c.state==="series"?`<span class="meta">${me?esc(me.name):""} ${c.w}-${c.l}${c.next?` · นัด ${c.next.n} สัปดาห์ ${c.next.wk}${c.next.season!==(G.season||1)?` (ปีหน้า)`:""}`:""}</span>${c.visit==="due"?`<button class="btn sm gold" data-act="rgvisit" data-v="${r}">ต้อนรับ${esc(C.champ)}ที่ค่าย</button>`:c.visit==="done"?`<button class="btn sm" data-act="rgduel" data-v="${r}">ดวลซ้อม</button>`:""}`
      :c.state==="lost"?`<span class="meta">${esc(C.champ)}ป้องกันแชมป์ไว้ได้ · รอจดหมายท้าครั้งใหม่</span>`:`<span class="meta">✉️ รอจดหมายนัดจากแชมป์</span>`;
    const chat=G.chatIn&&G.chatIn[RG_CID[r]]&&G.F[RG_CID[r]]?`<button class="btn sm gold" data-act="rgchat" data-v="${RG_CID[r]}">💬 ${esc(C.champ)}ทักแชตมา</button>`:"";
    const R=G.region,cid=RG_CID[r],gap=(R.meet||{})[cid]>0&&(R.meetT||{})[cid]!=null?gameWeek(G)-R.meetT[cid]:0;
    return `<div class="rg-prov rg-fin"><span><b>${esc(F.name)}</b> <small>เวทีชิงแชมป์ภาค</small>${gap>=3?`<small class="rg-miss">💭 ${gap} สัปดาห์แล้วที่ไม่ได้เจอ${esc(C.champ)}</small>`:""}</span>${chat}${st}</div>`;},

  /* ---------- screens ---------- */
  css(){if(typeof document==="undefined"||document.getElementById("rg-css"))return;const st=document.createElement("style");st.id="rg-css";
    st.textContent=`.rg-head{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:center;justify-content:space-between}.rg-head h3{margin:0}
.rg-stats{display:flex;gap:.4rem;flex-wrap:wrap}.rg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem}
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
    return `<p class="meta">ราคาน้ำมันสัปดาห์นี้ <b class="rg-fuel ${b}">฿${p.toFixed(2)}/ลิตร · ${b==="cheap"?"ถูก":b==="high"?"แพง":"ปกติ"}</b> · ${esc(roadFuelHint(G))}</p>`;},
  html(){this.css();
    if(!G.region){const t=(G.honors||[]).filter(h=>h.kind==="province").length;
      return `<section class="px card"><h3>ศึกชิงเจ้าสี่ภาค</h3><p>ทัวร์นาเมนต์ระดับภาคจะส่งจดหมายเชิญมา เมื่อจบปีที่ 5 และค่ายได้แชมป์จังหวัดครบ 3 ครั้ง</p>
       <div class="kv-row"><span>ปีที่</span><b>${G.season||1} / 6</b></div><div class="kv-row"><span>แชมป์จังหวัด</span><b>${t} / 3</b></div>
       ${!REGION_LIVE?`<div class="mfoot"><button class="btn gold" data-act="rgdevstart">เปิดบทเลย (โหมดทดสอบ)</button></div>`:""}</section>`;}
    const R=G.region,T=R.trip,cups=(R.cups||[]).length,belts=this.beltTotal(G),nx=T?null:this.tripWeek(G);
    const tripCard=T?`<section class="px card rg-trip"><h3>ทริปที่นัดไว้</h3><div class="kv-row"><span>${esc(ROAD_DEST[T.dest].name)} · ${esc(RG[ROAD_DEST[T.dest].r].name)}</span><b>สัปดาห์ ${T.wk}</b></div>
       <div class="kv-row"><span>นักมวย</span><b>${G.F[T.fid]?esc(G.F[T.fid].name):"-"}</b></div><div class="kv-row"><span>คู่ชก</span><b>${G.F[T.opp]?esc(G.F[T.opp].name):"-"}</b></div>
       <div class="kv-row"><span>ค่าเดินทาง (จ่ายแล้ว)</span><b class="num">${fmt(T.cost)}</b></div>
       <p class="meta">สัปดาห์นั้นทั้งค่ายไปด้วยกัน จึงไม่รับไฟต์อื่น</p><div class="mfoot"><button class="btn" data-act="rgcancel">ยกเลิกทริป (คืนเงิน)</button></div></section>`:"";
    const regs=RG_ORDER.map(r=>{const C=RG[r],b=R.belts[r]||{},n=this.beltCount(G,r),ch=R.champ[r]||{},F=ROAD_DEST[C.fin];
      const rows=C.prov.map(p=>{const D=ROAD_DEST[p],got=b[p],nights=roadNights(D.km);
        return `<div class="rg-prov"><span><b>${esc(D.name)}</b> <small>${D.km} กม. · ${nights?`ค้าง ${nights} คืน`:"ไปกลับวันเดียว"}</small></span>${got?`<span class="rg-belt">🏅 ได้เข็มขัด</span>`:`<button class="btn sm${T||!nx?"":" primary"}" data-act="rgplan" data-v="${p}" ${T||!nx?"disabled":""}>วางแผน</button>`}</div>`;}).join("");
      const fin=this.finRow(r);
      return `<section class="px card rg-reg" style="--rc:${C.col}"><h3>${esc(C.name)}</h3><div class="rg-champ">แชมป์ภาค: <b>${esc(C.champ)}</b> · ${esc(C.nick)}</div>${rows}${fin}</section>`;}).join("");
    return `<section class="px card rg-head"><div><h3>ศึกชิงเจ้าสี่ภาค</h3><span class="meta">ครั้งที่ ${R.edition||1}</span></div>
       <div class="rg-stats"><span class="pill gold">ถ้วย ${cups}/4</span><span class="pill">เข็มขัด ${belts}/16</span><span class="pill ${T?"red":nx?"green":""}">${T?`ทริป: ${esc(ROAD_DEST[T.dest].name)} · สัปดาห์ ${T.wk}`:nx?`เดินทางได้สัปดาห์ ${nx}`:"ปีนี้เดินทางไม่ได้แล้ว"}</span></div></section>
     ${!R.gala?`<p class="meta rg-gala">🎉 งานเปิดตัวศึกชิงเจ้าสี่ภาคที่กรุงเทพฯ ${R.galaAbs!=null&&gameWeek(G)<R.galaAbs?"จัดปลายสัปดาห์หน้า":"จัดปลายสัปดาห์นี้"} · ทั้งค่ายได้รับเชิญ</p>`:""}${!REGION_LIVE?`<p class="meta">โหมดทดสอบ: <button class="btn sm" data-act="rggala" data-v="gala">ดูงานเปิดตัว</button> ไฟต์ใต้ดินทดสอบ (กติกาเปิด): ${NL_ORDER.map(k=>`<button class="btn sm" data-act="nltest" data-v="${k}">${esc(NL[k].name)}</button>`).join(" ")}${(R.cups||[]).length?` <button class="btn sm" data-act="rggala" data-v="c1">ดูฉากซองเขียว</button>`:""}</p>`:""}
     ${tripCard}${this.fuelLine(G)}<div class="rg-grid">${regs}</div>`;},
  planHTML(dest){const D=ROAD_DEST[dest],C=RG[D.r],wk=this.tripWeek(G);if(!wk)return `<h2>${esc(D.name)}</h2><p>ปีนี้ไม่มีสัปดาห์ว่างให้เดินทางแล้ว</p>`;
    const abs=this.base(G)+wk,P=roadPlan(G,dest,null,abs),R=this.riders(G,wk);if(!UI.rgFid||!R.some(f=>f.id===UI.rgFid))UI.rgFid=R[0]?R[0].id:null;
    const me=UI.rgFid&&G.F[UI.rgFid],poor=G.cash<P.total,line=(k,v)=>v?`<div class="kv-row"><span>${k}</span><b class="num">${fmt(v)}</b></div>`:"";
    return `<h2>${esc(D.name)} <small class="meta">· ${esc(C.name)}</small></h2>
     <p class="meta">เดินทางสัปดาห์ <b>${wk}</b> · ${D.km} กม. · ${P.nights?`ค้าง ${P.nights} คืน`:"ไปกลับวันเดียว"} · คู่ชก: <b>${esc(RG_OPP[dest]||"แชมป์ประจำจังหวัด")}</b> แชมป์ประจำจังหวัด</p>
     <h3>ใครขึ้นชก</h3>${R.length?`<div class="rg-pick">${R.map(f=>`<button class="btn sm" data-act="rgfid" data-v="${f.id}" aria-pressed="${f.id===UI.rgFid}">${faceImg(f,"sm")}${esc(f.name)} <small>Lv.${f.lvl||1}</small></button>`).join("")}</div>`:`<p class="redt">ไม่มีนักมวยที่พร้อมเดินทางสัปดาห์นี้</p>`}
     <h3>ค่าเดินทาง ไป-กลับ</h3><div class="rg-bill"><div class="kv-row"><span>รถ</span><b>${esc(roadCarName(P.car))}</b></div>
      ${line(`น้ำมัน ${Math.round(P.litres)} ลิตร × ฿${P.price.toFixed(2)}`,P.fuel)}${line("ทางด่วน",P.toll)}${line(`ตั๋วรถทัวร์ × ${P.onBus}`,P.bus)}${line(`ที่พัก ${P.nights} คืน`,P.lodge)}${line(`ค่ากิน × ${P.people}`,P.food)}
      <div class="kv-row"><span><b>รวม</b></span><b class="num ${poor?"redt":"goldt"}">${fmt(P.total)}</b></div></div>
     <p class="meta">ทั้งค่าย ${P.people} คนไปด้วยกัน สัปดาห์นั้นไม่รับไฟต์อื่น · ความล้าระหว่างทางราว +${P.fat} ต่อคน${P.car==="none"?" · ยังไม่มีรถประจำค่าย ต้องนั่งรถทัวร์ (แพงและล้ากว่า)":""}</p>
     <div class="mfoot"><button class="btn" data-act="closeModal">ไว้ก่อน</button><button class="btn primary" data-act="rggo" data-v="${dest}" ${me&&!poor?"":"disabled"}>${poor?"เงินไม่พอ":"ยืนยันการเดินทาง"}</button></div>`;}
};

if(typeof XMODAL!=="undefined"){XMODAL.rgplan=m=>({body:REGION.planHTML(m.dest),foot:false});XMODAL.rgser=m=>({body:REGION.seriesHTML(m.r),foot:false});}
if(typeof ACT!=="undefined")Object.assign(ACT,{
  lbgo:d=>{UI.modal=null;lbStart(G,d.v);},
  nltest:d=>{if(REGION_LIVE)return;nlTest(d.v);},
  rgplan:d=>{UI.rgFid=null;UI.modal={type:"rgplan",dest:d.v};render();},
  rgfid:d=>{UI.rgFid=d.v;render();},
  rggo:d=>{const r=REGION.book(G,d.v,UI.rgFid);if(!r.ok){toast(r.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`นัดเดินทางสัปดาห์ ${r.wk} แล้ว · จ่ายค่าเดินทาง ${fmt(r.cost)}`);save();render();},
  rgvisit:d=>{const r=d.v,c=G.region.champ[r],cid=REGION.champId[r];if(!c||c.visit!=="due")return;
    playScene(RG_VISIT[r](G),()=>DUEL.open(r,false,res=>{if(!res){render();return;}c.visit="done";const T=DUEL_TALK[r];
      playScene([{n:cid,f:res.w>=2?"flustered":"happy",l:"casual",t:res.w>=2?T.win:T.lose},{n:"nar",t:`${RG[r].champ}กลับไปตอนค่ำ · นัดที่ 2 เจอกันที่เวทีภาค`}],()=>{const g=typeof cardCheck==="function"?cardCheck(G):[];if(g.length){G.cardPend=(G.cardPend||[]).concat(g);UI.modal={type:"cardnew"};}save();render();},{bg:"camp",look:"casual"});}),{bg:"camp",look:"casual"});},
  rgduel:d=>{DUEL.open(d.v,true,()=>render());},
  rgser:d=>{UI.rgFid=null;UI.modal={type:"rgser",r:d.v};render();},
  rgsfid:d=>{UI.rgFid=d.v;render();},
  rgsgo:d=>{const x=REGION.startSeries(G,d.v,UI.rgFid);if(!x.ok){toast(x.why);return;}UI.modal=null;AU.sfx&&AU.sfx("level");toast(`รับคำท้าแล้ว · นัดที่ 1 สัปดาห์ ${x.s.wk}${x.s.season!==(G.season||1)?" ปีหน้า":""}`);save();render();},
  rgcancel:()=>{if(REGION.cancel(G)){toast("ยกเลิกทริปแล้ว ได้เงินค่าเดินทางคืน");save();render();}},
  rgdevstart:()=>{if(REGION_LIVE)return;regionStart(G);save();render();},
  rgchat:d=>{const f=G.F[d.v];if(!f)return;f.met=true;rgTouch(G,d.v);chatOpen(d.v);},
  rggala:d=>{if(REGION_LIVE)return;const R=G.region;if(d.v==="c1"){const r=R.cups[0];playScene(rgCup1(G,r),()=>{R.c1=R.c1||"seen";save();render();},{bg:"camp",look:"casual"});return;}
    playScene(rgGala(G),()=>{R.gala=1;save();render();},{bg:"gala",look:"casual"});}});
if(typeof G!=="undefined"&&G&&G.region)REGION.flush(G);


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
      const P=roadPlan(G,S.dest,S.car);if(S.opts.charge!==false){if(G.cash<P.total){toast("เงินไม่พอค่าเดินทาง");return;}G.cash-=P.total;}
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
    if(S.phase==="sheet"){const P=roadPlan(G,S.dest,S.car),D=P.D,poor=S.opts.charge!==false&&G.cash<P.total;
      el.innerHTML=`<div class="mbox px"><h2>🚐 เดินทางไป${esc(D.name)}</h2><p class="meta center">${ROAD_REGION[D.r].name} · ${D.km} กม.${D.final?" · เวทีชิงแชมป์ภาค":""}</p>
       ${this.sheetHTML(P,S)}${this.frontHTML(S)}
       <div class="mfoot roadbtns"><button class="btn" data-rd="close">ไว้ก่อน</button><button class="btn primary" data-rd="go" ${poor?"disabled":""}>${poor?"เงินไม่พอ":`ออกเดินทาง · ${fmt(P.total)}`}</button></div></div>`;return;}
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
    if(S.demo){S.phase="demo";this.draw();return;}this.close();if(cb&&P)cb(P);},
  close(){cancelAnimationFrame(this.raf);const el=document.getElementById("roadtrip");if(el)el.remove();this.st=null;try{AU.startMusic&&AU.startMusic("hub");}catch(e){}if(typeof render==="function"&&G)render();}};
try{if(/roaddemo/.test(location.hash||""))setTimeout(()=>ROAD.demo(),600);}catch(e){}

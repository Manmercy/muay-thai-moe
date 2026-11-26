// ================= MUAY THAI MOE — SIM ENGINE (pure logic, no DOM) =================
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pickW=(rng,items)=>{const tot=items.reduce((s,i)=>s+Math.max(0,i[1]),0);let r=rng()*tot;for(const i of items){r-=Math.max(0,i[1]);if(r<=0)return i[0];}return items[items.length-1][0];};
const fmt=n=>(n<0?"-":"")+"฿"+Math.abs(Math.round(n)).toLocaleString("en-US");

const ATTRS=[["punch","หมัด"],["kick","เตะ"],["knee","เข่า"],["elbow","ศอก"],["clinch","คลินช์"],["guard","การ์ด"],["foot","ฟุตเวิร์ก"],
  ["counter","สวนกลับ"],["power","พลัง"],["speed","ความเร็ว"],["stamina","ความอึด"],["dur","ความทนทาน"],["iq","ไหวพริบ"],["comp","ใจนิ่ง"]];
const ATTR_GROUPS=[["อาวุธ",["punch","kick","knee","elbow","clinch"]],["เชิงมวย",["guard","foot","counter"]],["ร่างกาย",["power","speed","stamina","dur"]],["จิตใจ",["iq","comp"]]];
const ATTR_LABEL=Object.fromEntries(ATTRS);
const STYLES={mat:"มวยหมัด",tae:"มวยเตะ",khao:"มวยเข่า",sok:"มวยศอก",femur:"มวยฝีมือ"};

function styleOf(a){
  const s={mat:(a.punch*2+a.power+a.counter)/4,tae:(a.kick*2+a.foot+a.speed)/4,khao:(a.knee*2+a.clinch+a.stamina)/4,
    sok:(a.elbow*2+a.clinch+a.power)/4,femur:(a.iq*1.5+a.counter+a.guard*.75+a.foot*.75)/4};
  const top=Object.entries(s).sort((x,y)=>y[1]-x[1]);
  return top[0][1]-top[1][1]<.35?STYLES[top[0][0]]+" / "+STYLES[top[1][0]]:STYLES[top[0][0]];
}
function ovr(a){let s=0;for(const [k] of ATTRS)s+=a[k];return s/ATTRS.length;}

const CANON={
  kati:{name:"กะทิ",full:"กะทิ ศิริชัย",div:"A",camp:"player",color:"#d23246",potential:19,wage:1200,
    a:{punch:11,kick:8,knee:7,elbow:6,clinch:6,guard:7,foot:9,counter:9,power:9,speed:12,stamina:9,dur:9,iq:7,comp:6}},
  mali:{name:"มะลิ",full:"มะลิ",div:"B",camp:"free",color:"#2f62c8",potential:19,wage:1500,fee:8000,
    a:{punch:8,kick:13,knee:8,elbow:6,clinch:6,guard:9,foot:12,counter:8,power:9,speed:12,stamina:13,dur:9,iq:9,comp:8}},
  rin:{name:"ริน",full:"ริน",div:"A",camp:"free",color:"#2f8a50",potential:18.5,wage:2000,fee:15000,
    a:{punch:9,kick:10,knee:8,elbow:8,clinch:8,guard:12,foot:12,counter:13,power:8,speed:10,stamina:10,dur:9,iq:15,comp:12}},
  ploy:{name:"พลอย",full:"พลอย พยัคฆ์ทอง",div:"A",camp:"rival",color:"#7a3fc0",potential:17.5,
    a:{punch:10.5,kick:10.5,knee:16,elbow:11.5,clinch:16,guard:12.5,foot:9.5,counter:9.5,power:13.5,speed:10.5,stamina:14.5,dur:13.5,iq:12.5,comp:14.5}},
  fah:{name:"ฟ้า",full:"ฟ้า พยัคฆ์ทอง",div:"B",camp:"rival",color:"#d9a21b",potential:17,
    a:{punch:11.6,kick:10.6,knee:11.1,elbow:15.1,clinch:10.1,guard:9.1,foot:10.1,counter:8.1,power:14.1,speed:12.1,stamina:10.6,dur:12.1,iq:10.1,comp:9.1}},
};
const NPC_NAMES={
  A:[["น้ำผึ้ง ส.วิไลพร",7],["เพชรดาว ลูกแม่ปิง",8],["ทับทิม เกียรติสยาม",8],["แพรวา ศิษย์ครูหน่อง",9],["จันทร์เพ็ญ ต.ประเสริฐ",10]],
  B:[["ฝนทิพย์ พ.พงษ์ไทย",8],["ลำไย ศิษย์ดอยคำ",8],["ขวัญข้าว ช.ชัยวัฒน์",9],["บุษบา แสงทองยิม",10],["ใบเตย ส.เมืองเหนือ",10]],
};
const NPC_DISTRICT={A:[["สายฟ้า ว.วันทวี",11],["มุกดา เพชรยินดี",11]],B:[["แก้วกัลยา ก.กิตติ",11],["อรุณี ศ.ศรีสุข",11]]};
const STAGE_NPCS={
 local:{A:[["แสงดาว ศิษย์แม่ริม",8],["มินตรา ก.กำแพง",9]],B:[["สายรุ้ง ลูกน้ำปิง",8],["ข้าวหอม ว.วัดเหนือ",9]]},
 district:{A:[["นิลวรรณ ศิษย์แม่ปิง",11],["เดือนเพ็ญ ว.ล้านนา",12],["แพรไหม เพชรดอย",12]],B:[["วาริน ศ.วายุ",11],["พิมพ์ดาว ค่ายเหนือฟ้า",12],["กิ่งแก้ว เมืองแก้ว",12]]},
 province:{A:[["ชลธิชา ศิษย์นคร",13],["นภัสสร พยัคฆ์เมือง",14],["ศศิพร เพชรหลวง",14],["มณีรัตน์ ก.กรุงเก่า",15]],B:[["ธาราทิพย์ ศิษย์เวียง",13],["รวีวรรณ ลูกเจ้าพระยา",14],["ศิรินภา เพชรตะวัน",14],["บุษกร ศ.สนามใหญ่",15]]}
};
const NPC_COLORS=["#8a6f5a","#5a7a8a","#7a5a8a","#5a8a6a","#8a5a5a","#6a6a8a"];

// v1.43: the field keeps improving through the season so mid/late fights stay honest
const NPC_POT=5,NPC_RATE=w=>w>16?.055:.022;
function mkNPC(id,name,div,lvl,rng,i){
  const a={};for(const [k] of ATTRS)a[k]=clamp(Math.round(lvl+(rng()*4-2)),3,18);
  const fav=pickW(rng,[["punch",1],["kick",1],["knee",1],["elbow",1]]);a[fav]=clamp(a[fav]+3,3,19);
  return {id,name,full:name,div,camp:"npc",color:NPC_COLORS[i%NPC_COLORS.length],potential:lvl+NPC_POT,a};
}
// ---------- SKILLS (unique per canon) ----------
// v1.3: skills rooted in the old regional schools — "หมัดหนักโคราช ฉลาดลพบุรี ท่วงทีไชยา ไวกว่าท่าเสา"
const SCHOOLS={thasao:{name:"มวยท่าเสา",motto:"ไวกว่าท่าเสา",color:"#e23b4e"},chaiya:{name:"มวยไชยา",motto:"ท่าดีไชยา",color:"#4a7fe0"},
  lopburi:{name:"มวยลพบุรี",motto:"ฉลาดลพบุรี",color:"#3fae6a"},korat:{name:"มวยโคราช",motto:"หมัดหนักโคราช",color:"#9b62e0"},modern:{name:"มวยร่วมสมัย",motto:"บุกไม่ถอย",color:"#e7b443"}};
const SKILLS={
 // v1.29 skill trees: 3 lines × (basic → mid → mid/passive → high). row 0..3, line 0..2, req = [main stat, cross stat?], pre = skill needed first
 kati:[
  {id:"ts_fast",line:0,row:0,req:["kick"],school:"thasao",name:"นาคาสะบัดหาง",desc:"ลูกไม้ท่าเสา หมัดนำแล้วเอนตัวเตะตาม · เตะแม่น +3% คะแนนเตะ +8%",fx:r=>({hit:{kick:.03*r},pts:{kick:.08*r}})},
  {id:"ts_low",line:0,row:1,pre:"ts_fast",req:["kick","power"],school:"thasao",name:"เถรกวาดลาน",desc:"ลูกไม้มวยไทย ก้มหลบเตะสูงแล้วกวาดขาหลัก · แรงเตะ +8% เตะแม่น +1.5%",fx:r=>({dmg:{kick:.08*r},hit:{kick:.015*r}})},
  {id:"k_shin",line:0,row:2,pre:"ts_fast",passive:1,req:["kick"],school:"thasao",name:"แข้งเหล็ก",desc:"ติดตัว · ฝึกโปรแกรมเตะแล้วล้าน้อยลง 12%",fx:r=>({}),px:r=>({fatKick:.12*r})},
  {id:"ts_croc",line:0,row:3,pre:"ts_low",req:["kick","foot"],school:"thasao",name:"จระเข้ฟาดหาง",desc:"แม่ไม้มวยไทย หลบหมัดแล้วหมุนตัวฟาดส้นเท้า · เตะแม่น +3% แรงเตะ +10% คะแนนเตะ +8%",fx:r=>({hit:{kick:.03*r},dmg:{kick:.1*r},pts:{kick:.08*r}})},
  {id:"ts_jab",line:1,row:0,req:["punch"],school:"thasao",name:"หมัดหน้าไม้ท่าเสา",desc:"หมัดนำไวแบบท่าเสา · หมัดแม่น +3% คะแนนหมัด +6%",fx:r=>({hit:{punch:.03*r},pts:{punch:.06*r}})},
  {id:"ts_elbow",line:1,row:1,pre:"ts_jab",req:["elbow","clinch"],school:"thasao",name:"ศอกเฉือนท่าเสา",desc:"หมุนตัวกลับศอกระยะประชิด · แรงศอก +10% แม่น +1%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.01*r}})},
  {id:"k_blood",line:1,row:2,pre:"ts_jab",passive:1,req:["comp"],school:"thasao",name:"เลือดนักสู้",desc:"ติดตัว · ได้ EXP จากไฟต์ที่แพ้เพิ่ม 20%",fx:r=>({}),px:r=>({lossXp:.2*r})},
  {id:"ts_ring",line:1,row:3,pre:"ts_elbow",req:["punch","elbow"],school:"thasao",name:"หนุมานถวายแหวน",desc:"ลูกไม้มวยไทย ย่อหลบแล้วเสยสองหมัดเข้าคาง · หมัดแม่น +3% แรงหมัด +10% คะแนนหมัด +8%",fx:r=>({hit:{punch:.03*r},dmg:{punch:.1*r},pts:{punch:.08*r}})},
  {id:"ts_step",line:2,row:0,req:["foot"],school:"thasao",name:"จดมวยกว้างท่าเสา",desc:"ท่าจดกว้าง น้ำหนักอยู่หลัง · หลบ +1.5% สวนกลับ +3%",fx:r=>({evade:.015*r,ctr:.03*r})},
  {id:"heart",line:2,row:1,pre:"ts_step",req:["stamina"],school:"thasao",name:"ใจเกินร้อย",desc:"ร่างกายต่ำกว่า 45 แม่นขึ้น 4%",fx:r=>({clutch:.04*r})},
  {id:"k_grind",line:2,row:2,pre:"ts_step",passive:1,req:["stamina"],school:"thasao",name:"ซ้อมหนักไม่ท้อ",desc:"ติดตัว · ล้าจากการฝึกทุกโปรแกรมลดลง 7%",fx:r=>({}),px:r=>({fatAll:.07*r})},
  {id:"ts_iron",line:2,row:3,pre:"heart",req:["guard","iq"],school:"thasao",name:"กำแพงท่าเสา",desc:"ตั้งการ์ดแน่นแล้วสวน · หลบ +2% สวนกลับ +3% ป้องกันวงใน +0.8",fx:r=>({evade:.02*r,ctr:.03*r,clDef:.8*r})}],
 mali:[
  {id:"cy_kick",line:0,row:0,req:["elbow"],school:"chaiya",name:"กระโดดตบศอก",desc:"แม่ไม้ไชยา · ศอกแม่น +2% คะแนนศอก +10%",fx:r=>({hit:{elbow:.02*r},pts:{elbow:.1*r}})},
  {id:"cy_spin",line:0,row:1,pre:"cy_kick",req:["elbow","foot"],school:"chaiya",name:"ฝานลูกบวบ",desc:"ลูกไม้มวยไทย ปัดหมัดแล้วศอกเสยปลายคาง · แรงศอก +10% ศอกแม่น +1.5%",fx:r=>({dmg:{elbow:.1*r},hit:{elbow:.015*r}})},
  {id:"m_heart",line:0,row:2,pre:"cy_kick",passive:1,req:["comp"],school:"chaiya",name:"ตัวเล็กแต่ใจใหญ่",desc:"ติดตัว · ได้ EXP จากทุกไฟต์เพิ่ม 8%",fx:r=>({}),px:r=>({fightXp:.08*r})},
  {id:"cy_erawan",line:0,row:3,pre:"cy_spin",req:["elbow","clinch"],school:"chaiya",name:"หักคอเอราวัณ",desc:"แม่ไม้มวยไทย จับคอดึงลง ตีเข่าตามด้วยศอก · แรงศอก +12% ศอกแม่น +3% ป้องกันวงใน +0.5",fx:r=>({dmg:{elbow:.12*r},hit:{elbow:.03*r},clDef:.5*r})},
  {id:"cy_tee",line:1,row:0,req:["kick"],school:"chaiya",name:"เตะเปิดประตูไชยา",desc:"เตะกลางลำตัวเปิดการ์ด · เตะแม่น +3% คะแนนเตะ +6%",fx:r=>({hit:{kick:.03*r},pts:{kick:.06*r}})},
  {id:"cy_poise",line:1,row:1,pre:"cy_tee",req:["foot"],school:"chaiya",name:"ย่างสามขุม",desc:"ท่าครูไชยา ก้าวสามจังหวะ · ฟื้นแรงระหว่างยก +20% กำลังใจมีผล +1%",fx:r=>({regen:.2*r,mor:.01*r})},
  {id:"cy_breath",line:1,row:2,pre:"cy_tee",passive:1,req:["stamina"],school:"chaiya",name:"ลมหายใจครูไชยา",desc:"ติดตัว · ฟื้นแรงระหว่างยก +8% ทุกไฟต์",fx:r=>({regen:.08*r})},
  {id:"cy_hanuman",line:1,row:3,pre:"cy_poise",req:["foot","speed"],school:"chaiya",name:"หนุมานแหวกฟอง",desc:"มุดต่ำแหวกการ์ดเข้าวงใน · หลบ +2.5% สวนกลับ +3% เข่าแม่น +2%",fx:r=>({evade:.025*r,ctr:.03*r,hit:{knee:.02*r}})},
  {id:"cy_guard",line:2,row:0,req:["guard"],school:"chaiya",name:"ป้อง ปัด ปิด เปิด",desc:"หลักป้องกันของไชยา · ป้องกันวงใน +1 หลบ +1%",fx:r=>({clDef:1*r,evade:.01*r})},
  {id:"cy_knee",line:2,row:1,pre:"cy_guard",req:["knee","clinch"],school:"chaiya",name:"เข่าลอยไชยา",desc:"กระโดดเข่าจากระยะกลาง · แรงเข่า +10% แม่น +1%",fx:r=>({dmg:{knee:.1*r},hit:{knee:.01*r}})},
  {id:"m_smile",line:2,row:2,pre:"cy_guard",passive:1,req:["comp"],school:"chaiya",name:"ยิ้มสู้",desc:"ติดตัว · กำลังใจตกจากการแพ้น้อยลง 25%",fx:r=>({}),px:r=>({moraleLoss:.25*r})},
  {id:"cy_root",line:2,row:3,pre:"cy_knee",req:["guard","dur"],school:"chaiya",name:"ปักหลักไชยา",desc:"ยืนหลักแน่น แทบไม่เสียคะแนน · หลบ +2% ป้องกันวงใน +1 ฟื้นแรงระหว่างยก +10%",fx:r=>({evade:.02*r,clDef:1*r,regen:.1*r})}],
 rin:[
  {id:"lb_read",line:0,row:0,req:["counter"],school:"lopburi",name:"ฉลาดลพบุรี",desc:"ขยับตัวตลอด หลบแล้วสวน · สวนกลับ +4% หลบ +1.5%",fx:r=>({ctr:.04*r,evade:.015*r})},
  {id:"lb_jab",line:0,row:1,pre:"lb_read",req:["punch","counter"],school:"lopburi",name:"เอราวัณเสยงา",desc:"ลูกไม้มวยไทย เอี้ยวหลบ ปัดหมัด แล้วสวนเข้าคาง · แรงหมัดสวน +12% หมัดแม่น +1%",fx:r=>({ctrDmg:.12*r,hit:{punch:.01*r}})},
  {id:"lb_calm",line:0,row:2,pre:"lb_read",passive:1,req:["comp"],school:"lopburi",name:"ใจนิ่งนักคำนวณ",desc:"ติดตัว · ร่างกายต่ำกว่า 45 แม่นขึ้น 2% ทุกไฟต์",fx:r=>({clutch:.02*r})},
  {id:"lb_kris",line:0,row:3,pre:"lb_jab",req:["counter","speed"],school:"lopburi",name:"ตาเถรค้ำฝัก",desc:"แม่ไม้มวยไทย ปัดหมัดขึ้นแล้วชกสวนเข้าปลายคาง · สวนกลับ +4% แรงหมัดสวน +15% หมัดแม่น +2%",fx:r=>({ctr:.04*r,ctrDmg:.15*r,hit:{punch:.02*r}})},
  {id:"lb_plan",line:1,row:0,req:["iq"],school:"lopburi",name:"มวยเกี้ยว",desc:"ใช้ชั้นเชิงหลอกล่อ · คำสั่งพักยกได้ผลแรงขึ้น 25% ความแม่นพื้นฐาน +1%",fx:r=>({corner:.25*r,prep:.01*r})},
  {id:"lb_feint",line:1,row:1,pre:"lb_plan",req:["iq"],school:"lopburi",name:"ดับชวาลา",desc:"แม่ไม้มวยไทย กดแขนคู่ชกลงแล้วชกสวนเข้าหน้า · หลบ +1.5% สวนกลับ +2%",fx:r=>({evade:.015*r,ctr:.02*r})},
  {id:"r_note",line:1,row:2,pre:"lb_plan",passive:1,req:["iq"],school:"lopburi",name:"สมุดบันทึกคู่ชก",desc:"ติดตัว · ความแม่นพื้นฐาน +0.8% ทุกไฟต์",fx:r=>({prep:.008*r})},
  {id:"lb_giant",line:1,row:3,pre:"lb_feint",req:["iq","comp"],school:"lopburi",name:"ขุนยักษ์จับลิง",desc:"แม่ไม้มวยไทย ปัดหมัด เตะ ศอก ด้วยก้าวเดียว · คำสั่งพักยกได้ผล +30% ความแม่นพื้นฐาน +1.2% หลบ +1%",fx:r=>({corner:.3*r,prep:.012*r,evade:.01*r})},
  {id:"lb_teep",line:2,row:0,req:["kick"],school:"lopburi",name:"มอญยันหลัก",desc:"แม่ไม้มวยไทย ยกแขนกันหมัดแล้วถีบเข้าอก · เตะแม่น +2% คะแนนเตะ +8%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r}})},
  {id:"lb_range",line:2,row:1,pre:"lb_teep",req:["kick","foot"],school:"lopburi",name:"ตัดวงนอก",desc:"คุมระยะด้วยลูกถีบและฟุตเวิร์ก · เตะแม่น +2% คะแนนเตะ +8% หลบ +1%",fx:r=>({hit:{kick:.02*r},pts:{kick:.08*r},evade:.01*r})},
  {id:"r_pace",line:2,row:2,pre:"lb_teep",passive:1,req:["stamina"],school:"lopburi",name:"นับจังหวะ",desc:"ติดตัว · ใช้แรงออกอาวุธน้อยลง 4% ทุกไฟต์",fx:r=>({staSave:.04*r})},
  {id:"lb_tiger",line:2,row:3,pre:"lb_range",req:["kick","foot"],school:"lopburi",name:"เสือลากหาง",desc:"ถอยหลอกแล้วเตะกลับ · แรงเตะ +10% เตะแม่น +3% สวนกลับ +2%",fx:r=>({dmg:{kick:.1*r},hit:{kick:.03*r},ctr:.02*r})}],
};
// v1.82.3: deeper trees — every school line gets a Lv.14 signature move and a Lv.22 master move,
// Ploy and Fah get full trees, and three shared "build" paths (pick one per fighter)
const SKX=(id,line,row,pre,req,school,name,desc,fx,more)=>Object.assign({id,line,row,pre,req,school,name,desc,fx},more||{});
SKILLS.kati.push(
 SKX("ts_thunder",0,4,"ts_croc",["kick","power"],"thasao","ฟ้าลั่นท่าเสา","Lv.14 · เตะก้านคอเต็มแรงหมุนตัว · เตะแม่น +4% แรงเตะ +12% คะแนนเตะ +10%",r=>({hit:{kick:.04*r},dmg:{kick:.12*r},pts:{kick:.1*r}}),{lv:14}),
 SKX("ts_wind",0,5,"ts_thunder",["kick","speed"],"thasao","แข้งพระพาย","Lv.22 · ขั้นปรมาจารย์ · แรงเตะ +16% เตะแม่น +4% หลบ +1%",r=>({dmg:{kick:.16*r},hit:{kick:.04*r},evade:.01*r}),{lv:22}),
 SKX("ts_bolt",1,4,"ts_ring",["elbow","punch"],"thasao","ศอกกลับฟ้าผ่า","Lv.14 · หมัดนำแล้วหมุนศอกกลับ · แรงศอก +14% ศอกแม่น +3% แรงหมัด +6%",r=>({dmg:{elbow:.14*r,punch:.06*r},hit:{elbow:.03*r}}),{lv:14}),
 SKX("ts_trunk",1,5,"ts_bolt",["punch","power"],"thasao","หักงวงไอยรา","Lv.22 · ขั้นปรมาจารย์ · แม่ไม้มวยไทย รับเตะแล้วศอกโคนขา · แรงหมัด +12% แรงศอก +12% หมัดแม่น +3%",r=>({dmg:{punch:.12*r,elbow:.12*r},hit:{punch:.03*r}}),{lv:22}),
 SKX("ts_heart",2,4,"ts_iron",["guard","comp"],"thasao","ใจศิริชัย","Lv.14 · ยิ่งเจ็บยิ่งแม่น · เลือดต่ำแม่นขึ้น 5% หลบ +2% ป้องกันวงใน +0.6",r=>({clutch:.05*r,evade:.02*r,clDef:.6*r}),{lv:14}),
 SKX("ts_fort",2,5,"ts_heart",["guard","dur"],"thasao","กำแพงเหล็กท่าเสา","Lv.22 · ขั้นปรมาจารย์ · หลบ +3% สวนกลับ +5% ป้องกันวงใน +1 ฟื้นแรง +10%",r=>({evade:.03*r,ctr:.05*r,clDef:1*r,regen:.1*r}),{lv:22}));
SKILLS.mali.push(
 SKX("cy_flash",0,4,"cy_erawan",["elbow","speed"],"chaiya","ศอกกลับฟ้าแลบ","Lv.14 · ศอกเร็วจนคู่ชกมองไม่ทัน · แรงศอก +14% ศอกแม่น +3%",r=>({dmg:{elbow:.14*r},hit:{elbow:.03*r}}),{lv:14}),
 SKX("cy_soar",0,5,"cy_flash",["elbow","knee"],"chaiya","ทะยานฟ้าไชยา","Lv.22 · ขั้นปรมาจารย์ · แรงศอก +16% แรงเข่า +8% ศอกแม่น +3%",r=>({dmg:{elbow:.16*r,knee:.08*r},hit:{elbow:.03*r}}),{lv:22}),
 SKX("cy_bloom",1,4,"cy_hanuman",["kick","foot"],"chaiya","ดอกมะลิร่ายรำ · เตะต่อเนื่อง","Lv.14 · เตะต่อเนื่องเหมือนร่ายรำ · เตะแม่น +4% คะแนนเตะ +10% ฟื้นแรง +10%",r=>({hit:{kick:.04*r},pts:{kick:.1*r},regen:.1*r}),{lv:14}),
 SKX("cy_gale",1,5,"cy_bloom",["speed","kick"],"chaiya","ลมกรดไชยา","Lv.22 · ขั้นปรมาจารย์ · หลบ +2.5% เตะแม่น +4% แรงเตะ +10% ใช้แรงน้อยลง 3%",r=>({evade:.025*r,hit:{kick:.04*r},dmg:{kick:.1*r},staSave:.03*r}),{lv:22}),
 SKX("cy_gate",2,4,"cy_root",["guard","clinch"],"chaiya","สักพวงมาลัย","Lv.14 · ลูกไม้มวยไทย ปัดหมัดแล้วกระแทกศอกเข้าอก · ป้องกันวงใน +1 หลบ +2% สวนกลับ +3%",r=>({clDef:1*r,evade:.02*r,ctr:.03*r}),{lv:14}),
 SKX("cy_meru",2,5,"cy_gate",["guard","dur"],"chaiya","เขาพระสุเมรุ","Lv.22 · ขั้นปรมาจารย์ · ป้องกันวงใน +1.4 หลบ +3% ฟื้นแรง +12% เลือดต่ำแม่นขึ้น 3%",r=>({clDef:1.4*r,evade:.03*r,regen:.12*r,clutch:.03*r}),{lv:22}));
SKILLS.rin.push(
 SKX("lb_shadow",0,4,"lb_kris",["counter","speed"],"lopburi","สวนกลับไร้เงา","Lv.14 · สวนก่อนคู่ชกจะออกอาวุธจบ · สวนกลับ +5% แรงหมัดสวน +16%",r=>({ctr:.05*r,ctrDmg:.16*r}),{lv:14}),
 SKX("lb_proof",0,5,"lb_shadow",["counter","iq"],"lopburi","สมการปิดเกม · หมัดสวน","Lv.22 · ขั้นปรมาจารย์ · สวนกลับ +6% แรงหมัดสวน +20% หมัดแม่น +2%",r=>({ctr:.06*r,ctrDmg:.2*r,hit:{punch:.02*r}}),{lv:22}),
 SKX("lb_three",1,4,"lb_giant",["iq","comp"],"lopburi","อ่านใจสามยก · อ่านเชิงมวย","Lv.14 · วางแผนล่วงหน้าทั้งไฟต์ · คำสั่งพักยก +35% ความแม่นพื้นฐาน +1.2% หลบ +1%",r=>({corner:.35*r,prep:.012*r,evade:.01*r}),{lv:14}),
 SKX("lb_book",1,5,"lb_three",["iq","counter"],"lopburi","ตำราลพบุรี","Lv.22 · ขั้นปรมาจารย์ · คำสั่งพักยก +45% ความแม่นพื้นฐาน +1.6% สวนกลับ +3%",r=>({corner:.45*r,prep:.016*r,ctr:.03*r}),{lv:22}),
 SKX("lb_fold",2,4,"lb_tiger",["kick","power"],"lopburi","บาทาลูบพักตร์","Lv.14 · ลูกไม้มวยไทย ชิงถีบหน้าก่อนคู่ชกจะออกอาวุธ · เตะแม่น +3% คะแนนเตะ +10% หลบ +1.5%",r=>({hit:{kick:.03*r},pts:{kick:.1*r},evade:.015*r}),{lv:14}),
 SKX("lb_circle",2,5,"lb_fold",["foot","kick"],"lopburi","วงนอกไม่มีวันแตก","Lv.22 · ขั้นปรมาจารย์ · เตะแม่น +4% แรงเตะ +12% หลบ +2% สวนกลับ +3%",r=>({hit:{kick:.04*r},dmg:{kick:.12*r},evade:.02*r,ctr:.03*r}),{lv:22}));
SKILLS.ploy=[
 SKX("kr_swing",0,0,null,["punch"],"korat","หมัดเหวี่ยงควาย","หมัดวงกว้างหนักหน่วง · แรงหมัด +12% คะแนนหมัด +5%",r=>({dmg:{punch:.12*r},pts:{punch:.05*r}})),
 SKX("kr_hook",0,1,"kr_swing",["punch","power"],"korat","หมัดเหวี่ยงสองจังหวะ","เหวี่ยงซ้ำทันทีที่คู่ชกเปิด · แรงหมัด +8% หมัดแม่น +1.5%",r=>({dmg:{punch:.08*r},hit:{punch:.015*r}})),
 SKX("p_iron",0,2,"kr_swing",["dur"],"korat","แขนเหล็กโคราช","ติดตัว · ล้าจากการฝึกทุกโปรแกรมลดลง 6%",r=>({}),{passive:1,px:r=>({fatAll:.06*r})}),
 SKX("kr_buffalo",0,3,"kr_hook",["punch","power"],"korat","ควายเผือกชนเสา","พุ่งเข้าพร้อมหมัดหนัก · หมัดแม่น +3% แรงหมัด +12% คะแนนหมัด +6%",r=>({hit:{punch:.03*r},dmg:{punch:.12*r},pts:{punch:.06*r}})),
 SKX("kr_thunder",0,4,"kr_buffalo",["punch","speed"],"korat","ยอเขาพระสุเมรุ","Lv.14 · แม่ไม้มวยไทย ก้มหลบหมัดแล้วสวนเข้าปลายคาง · แรงหมัด +15% หมัดแม่น +4%",r=>({dmg:{punch:.15*r},hit:{punch:.04*r}}),{lv:14}),
 SKX("kr_genius",0,5,"kr_thunder",["punch","iq"],"korat","อัจฉริยะไร้พ่าย","Lv.22 · ขั้นปรมาจารย์ · แรงหมัด +12% หมัดแม่น +3% เลือดต่ำแม่นขึ้น 4% สวนกลับ +3%",r=>({dmg:{punch:.12*r},hit:{punch:.03*r},clutch:.04*r,ctr:.03*r}),{lv:22}),
 SKX("kr_knee",1,0,null,["kick"],"korat","เตะคอขาด","เตะตัดคอแบบโคราช · เตะแม่น +3% คะแนนเตะ +8%",r=>({hit:{kick:.03*r},pts:{kick:.08*r}})),
 SKX("kr_sweep",1,1,"kr_knee",["kick","foot"],"korat","ทะแยค้ำเสา","ลูกไม้มวยไทย ยกแขนกันเตะแล้วถีบขาหลัก · เตะแม่น +2% แรงเตะ +8%",r=>({hit:{kick:.02*r},dmg:{kick:.08*r}})),
 SKX("p_cold",1,2,"kr_knee",["comp"],"korat","ใจเย็นเฉียบ","ติดตัว · กำลังใจตกจากการแพ้น้อยลง 20%",r=>({}),{passive:1,px:r=>({moraleLoss:.2*r})}),
 SKX("kr_clinch",1,3,"kr_sweep",["knee","clinch"],"korat","ปล้ำคอโคราช","ล็อกคอแล้วตีเข่าไม่ยั้ง · แรงเข่า +10% แม่น +2%",r=>({dmg:{knee:.1*r},hit:{knee:.02*r}})),
 SKX("kr_neck",1,4,"kr_clinch",["kick","power"],"korat","เตะก้านคอ","Lv.14 · เตะสูงเต็มวง · แรงเตะ +14% เตะแม่น +4% คะแนนเตะ +8%",r=>({dmg:{kick:.14*r},hit:{kick:.04*r},pts:{kick:.08*r}}),{lv:14}),
 SKX("kr_tiger",1,5,"kr_neck",["kick","knee"],"korat","พยัคฆ์ทองฟาดหาง","Lv.22 · ขั้นปรมาจารย์ · แรงเตะ +16% แรงเข่า +10% เตะแม่น +3%",r=>({dmg:{kick:.16*r,knee:.1*r},hit:{kick:.03*r}}),{lv:22}),
 SKX("captain",2,0,null,["guard"],"korat","คาดเชือกถึงศอก","แขนแกร่งรับลูกเตะ · หลบ/รับ +1% ใจนิ่ง +1% ป้องกันวงใน +0.5",r=>({evade:.01*r,mor:.01*r,clDef:.5*r})),
 SKX("p_read",2,1,"captain",["iq"],"korat","อ่านเกมพยัคฆ์","จดทุกจังหวะของคู่ชก · สวนกลับ +3% หลบ +1%",r=>({ctr:.03*r,evade:.01*r})),
 SKX("p_note",2,2,"captain",["iq"],"korat","สมุดแผนไฟต์","ติดตัว · ได้ EXP จากทุกไฟต์เพิ่ม 6%",r=>({}),{passive:1,px:r=>({fightXp:.06*r})}),
 SKX("p_wall",2,3,"p_read",["guard","iq"],"korat","พระรามน้าวศร","ลูกไม้มวยไทย ย่อหลบ ยกแขนรับ แล้วชกสวน · หลบ +2% ป้องกันวงใน +0.8 สวนกลับ +3%",r=>({evade:.02*r,clDef:.8*r,ctr:.03*r})),
 SKX("p_sister",2,4,"p_wall",["iq","counter"],"korat","เงาพี่สาว · หลบแล้วสวน","Lv.14 · ท่าที่ไพลินเคยสอน · สวนกลับ +5% คำสั่งพักยก +25% หลบ +1.5%",r=>({ctr:.05*r,corner:.25*r,evade:.015*r}),{lv:14}),
 SKX("p_crown",2,5,"p_sister",["guard","comp"],"korat","มงกุฎพยัคฆ์ · การ์ดสวน","Lv.22 · ขั้นปรมาจารย์ · หลบ +3% ป้องกันวงใน +1 สวนกลับ +5% เลือดต่ำแม่นขึ้น 3%",r=>({evade:.03*r,clDef:1*r,ctr:.05*r,clutch:.03*r}),{lv:22})];
SKILLS.fah=[
 SKX("tiger",0,0,null,["elbow"],"modern","ศอกพยัคฆ์","แรงศอก +12% แม่น +2%",r=>({dmg:{elbow:.12*r},hit:{elbow:.02*r}})),
 SKX("f_cut",0,1,"tiger",["elbow","speed"],"modern","ศอกเฉียงฟ้า","ฟันศอกเฉียงขึ้น · แรงศอก +8% ศอกแม่น +1.5%",r=>({dmg:{elbow:.08*r},hit:{elbow:.015*r}})),
 SKX("f_flex",0,2,"tiger",["foot"],"modern","ยืดหยุ่นนักเต้น","ติดตัว · ล้าจากการฝึกทุกโปรแกรมลดลง 5%",r=>({}),{passive:1,px:r=>({fatAll:.05*r})}),
 SKX("f_storm",0,3,"f_cut",["elbow","clinch"],"modern","ศอกพายุ","ศอกต่อเนื่องในวงใน · แรงศอก +12% ศอกแม่น +3% คะแนนศอก +6%",r=>({dmg:{elbow:.12*r},hit:{elbow:.03*r},pts:{elbow:.06*r}})),
 SKX("f_thunder",0,4,"f_storm",["elbow","power"],"modern","ฟ้าคำรามศอกคู่","Lv.14 · ศอกซ้ายขวาไม่เว้นจังหวะ · แรงศอก +14% ศอกแม่น +4%",r=>({dmg:{elbow:.14*r},hit:{elbow:.04*r}}),{lv:14}),
 SKX("f_sky",0,5,"f_thunder",["elbow","speed"],"modern","ฟ้าสีทอง","Lv.22 · ขั้นปรมาจารย์ · แรงศอก +16% แรงหมัด +8% ศอกแม่น +3%",r=>({dmg:{elbow:.16*r,punch:.08*r},hit:{elbow:.03*r}}),{lv:22}),
 SKX("fah_rush",1,0,null,["punch"],"modern","พายุหมัดชุด","บุกปล่อยหมัดชุด · หมัดแม่น +2% คะแนนหมัด +8%",r=>({hit:{punch:.02*r},pts:{punch:.08*r}})),
 SKX("f_blitz",1,1,"fah_rush",["punch","stamina"],"modern","บุกไม่ถอย","เดินหน้าตลอดยก · หมัดแม่น +1.5% คะแนนหมัด +6% ใช้แรงน้อยลง 2%",r=>({hit:{punch:.015*r},pts:{punch:.06*r},staSave:.02*r})),
 SKX("reckless",1,2,"fah_rush",["stamina"],"modern","บ้าบิ่น","ติดตัว · ใช้แรงบุกน้อยลง 8%",r=>({staSave:.08*r}),{passive:1}),
 SKX("f_tornado",1,3,"f_blitz",["punch","speed"],"modern","พายุหมัดชุดใหญ่","หมัดชุดยาวไม่หยุด · หมัดแม่น +3% แรงหมัด +10% คะแนนหมัด +8%",r=>({hit:{punch:.03*r},dmg:{punch:.1*r},pts:{punch:.08*r}})),
 SKX("f_hurricane",1,4,"f_tornado",["punch","stamina"],"modern","เฮอริเคนฟ้า","Lv.14 · บุกทั้งยกแรงไม่ตก · หมัดแม่น +4% แรงหมัด +12% ใช้แรงน้อยลง 3%",r=>({hit:{punch:.04*r},dmg:{punch:.12*r},staSave:.03*r}),{lv:14}),
 SKX("f_heaven",1,5,"f_hurricane",["punch","power"],"modern","ฟ้าถล่ม","Lv.22 · ขั้นปรมาจารย์ · แรงหมัด +16% หมัดแม่น +4% คะแนนหมัด +8%",r=>({dmg:{punch:.16*r},hit:{punch:.04*r},pts:{punch:.08*r}}),{lv:22}),
 SKX("grin",2,0,null,["comp"],"modern","ยิ้มเยาะ","ร่างกายต่ำกว่า 45 แม่นขึ้น 3%",r=>({clutch:.03*r})),
 SKX("f_taunt",2,1,"grin",["iq"],"modern","ยั่วให้บุก","ยั่วจนคู่ชกพุ่งเข้ามาเอง · สวนกลับ +3% หลบ +1%",r=>({ctr:.03*r,evade:.01*r})),
 SKX("f_party",2,2,"grin",["comp"],"modern","ปาร์ตี้หลังไฟต์","ติดตัว · ได้ EXP จากทุกไฟต์เพิ่ม 6%",r=>({}),{passive:1,px:r=>({fightXp:.06*r})}),
 SKX("f_show",2,3,"f_taunt",["comp","foot"],"modern","โชว์ไทม์","ยิ่งคนเชียร์ยิ่งมา · กำลังใจมีผล +2% คะแนนหมัด +4% คะแนนเตะ +4% เลือดต่ำแม่นขึ้น 2%",r=>({mor:.02*r,pts:{punch:.04*r,kick:.04*r},clutch:.02*r})),
 SKX("f_smile",2,4,"f_show",["comp","counter"],"modern","ยิ้มทั้งสนาม","Lv.14 · ยิ้มสู้ทุกสถานการณ์ · เลือดต่ำแม่นขึ้น 5% สวนกลับ +4% กำลังใจมีผล +2%",r=>({clutch:.05*r,ctr:.04*r,mor:.02*r}),{lv:14}),
 SKX("f_star",2,5,"f_smile",["comp","speed"],"modern","ดาวค้างฟ้า","Lv.22 · ขั้นปรมาจารย์ · หลบ +3% สวนกลับ +5% เลือดต่ำแม่นขึ้น 4% ฟื้นแรง +10%",r=>({evade:.03*r,ctr:.05*r,clutch:.04*r,regen:.1*r}),{lv:22})];
// shared build paths: line 3..5; once a fighter learns one, the other two are closed until reset
const SHARED_SKILLS=[
 SKX("sh_ko1",3,0,null,["power"],"build","ลงน้ำหนักทุกดอก","สายปั้นนักน็อก · แรงหมัด +5% แรงเตะ +4%",r=>({dmg:{punch:.05*r,kick:.04*r}}),{shared:1}),
 SKX("sh_ko2",3,1,"sh_ko1",["power","punch"],"build","ปิดฉากไว","สายปั้นนักน็อก · แรงเข่า +5% แรงศอก +5% แรงหมัด +4%",r=>({dmg:{knee:.05*r,elbow:.05*r,punch:.04*r}}),{shared:1,lv:4}),
 SKX("sh_ko3",3,2,"sh_ko1",["power"],"build","กล้ามเนื้อสปริง","สายปั้นนักน็อก · ติดตัว · ล้าจากการฝึกลดลง 4%",r=>({}),{shared:1,passive:1,lv:4,px:r=>({fatAll:.04*r})}),
 SKX("sh_ko4",3,3,"sh_ko2",["power","speed"],"build","หมัดเดียวจอด","สายปั้นนักน็อก · Lv.10 · แรงหมัด +10% แรงศอก +6% แรงเข่า +6%",r=>({dmg:{punch:.1*r,elbow:.06*r,knee:.06*r}}),{shared:1,lv:10}),
 SKX("sh_tc1",4,0,null,["iq"],"build","ออกอาวุธสวย","สายปั้นเก็บแต้ม · คะแนนหมัด +5% คะแนนเตะ +5%",r=>({pts:{punch:.05*r,kick:.05*r}}),{shared:1}),
 SKX("sh_tc2",4,1,"sh_tc1",["iq","foot"],"build","แม่นทุกดอก","สายปั้นเก็บแต้ม · หมัดแม่น +1.5% เตะแม่น +1.5%",r=>({hit:{punch:.015*r,kick:.015*r}}),{shared:1,lv:4}),
 SKX("sh_tc3",4,2,"sh_tc1",["iq"],"build","การบ้านทุกคืน","สายปั้นเก็บแต้ม · ติดตัว · ได้ EXP จากไฟต์เพิ่ม 6%",r=>({}),{shared:1,passive:1,lv:4,px:r=>({fightXp:.06*r})}),
 SKX("sh_tc4",4,3,"sh_tc2",["iq","comp"],"build","ครองเกมทุกยก","สายปั้นเก็บแต้ม · Lv.10 · คะแนนเข่า/ศอก +6% คำสั่งพักยก +20% ความแม่นพื้นฐาน +0.6%",r=>({pts:{knee:.06*r,elbow:.06*r},corner:.2*r,prep:.006*r}),{shared:1,lv:10}),
 SKX("sh_ir1",5,0,null,["dur"],"build","รับได้ทุกดอก","สายปั้นถึกอึด · ป้องกันวงใน +0.6 หลบ +0.8%",r=>({clDef:.6*r,evade:.008*r}),{shared:1}),
 SKX("sh_ir2",5,1,"sh_ir1",["stamina","dur"],"build","ลมหายใจยาว","สายปั้นถึกอึด · ฟื้นแรงระหว่างยก +12% ใช้แรงน้อยลง 3%",r=>({regen:.12*r,staSave:.03*r}),{shared:1,lv:4}),
 SKX("sh_ir3",5,2,"sh_ir1",["stamina"],"build","ฟื้นตัวไว","สายปั้นถึกอึด · ติดตัว · กำลังใจตกจากการแพ้น้อยลง 15% ล้าจากการฝึกลดลง 3%",r=>({}),{shared:1,passive:1,lv:4,px:r=>({moraleLoss:.15*r,fatAll:.03*r})}),
 SKX("sh_ir4",5,3,"sh_ir2",["dur","stamina"],"build","ไม่มีวันล้ม","สายปั้นถึกอึด · Lv.10 · เลือดต่ำแม่นขึ้น 4% ป้องกันวงใน +0.8 ฟื้นแรง +10%",r=>({clutch:.04*r,clDef:.8*r,regen:.1*r}),{shared:1,lv:10})];
/* v1.89 skill roots — generated by tools/skills/gen_roots.py from roots_data.py (edit those, not this block) */
const _rsch=(fid,id)=>((SKILLS[fid]||[]).find(s=>s.id===id)||{}).school;
const SK_ROOTS={"kati":[[{"n":"แข้งพายุ","m":"แข้งหนัก ปิดเกมไว"},{"n":"แข้งเชิงครู","m":"เตะแม่น เก็บแต้ม"}],[{"n":"ศอกกลับหัก","m":"ศอกหนักระยะประชิด"},{"n":"หมัดเร็วท่าเสา","m":"หมัดไว เก็บแต้มรัว"}],[{"n":"ใจไม่ถอย","m":"ยิ่งเจ็บยิ่งสู้"},{"n":"การ์ดเหล็กสวนไว","m":"รับให้อยู่ แล้วคืนทันที"}]],"mali":[[{"n":"ศอกเหินฟ้า","m":"กระโดดศอกจากระยะไกล"},{"n":"ศอกเข่าวงใน","m":"จับคอ ตีเข่า ปิดด้วยศอก"}],[{"n":"ลมเตะไชยา","m":"เตะเร็ว เตะเบา เตะไม่หยุด"},{"n":"ร่ายรำไม่เหนื่อย","m":"เคลื่อนไหวทั้งไฟต์แรงไม่ตก"}],[{"n":"ป้อมไชยา","m":"ปิดทุกช่อง ไม่เสียแต้ม"},{"n":"ยิ้มรับทุกดอก","m":"ยิ้มไว้ แล้วสวนกลับ"}]],"rin":[[{"n":"สวนตัดคม","m":"สวนเร็ว สวนหนัก"},{"n":"ม่านลวง","m":"หลบให้พลาด แล้วสวนที่ช่องว่าง"}],[{"n":"ตำราลับ","m":"วางแผนก่อนเสียงระฆัง"},{"n":"อ่านแล้วเล่น","m":"อ่านเกมแล้วตอบทันที"}],[{"n":"ถีบเป็นกำแพง","m":"ถีบกันระยะ เก็บแต้มสะอาด"},{"n":"วนรอบนอก","m":"วนรอบ ไม่ให้ตั้งหลัก"}]],"ploy":[[{"n":"หมัดเหวี่ยงทลาย","m":"หมัดวงกว้างที่หนักที่สุด"},{"n":"หมัดอัจฉริยะ","m":"หมัดแม่นที่คำนวณมาแล้ว"}],[{"n":"เตะคอขาด","m":"เตะสูง เตะหนัก"},{"n":"ปล้ำคอโคราช","m":"ล็อกคอแล้วไม่ปล่อย"}],[{"n":"กำแพงสวนหนัก","m":"รับให้อยู่ แล้วคืนหนัก"},{"n":"แผนพี่สาว","m":"แผนไฟต์ที่ไพลินทิ้งไว้"}]],"fah":[[{"n":"ศอกสายฟ้า","m":"ศอกเร็ว ศอกแรง"},{"n":"ศอกโชว์","m":"ศอกสวยที่คนดูกรี๊ด"}],[{"n":"บุกไม่หยุด","m":"บุกตั้งแต่ระฆังถึงระฆัง"},{"n":"บ้าบิ่นถึงที่สุด","m":"แลกได้ ไม่ถอยสักก้าว"}],[{"n":"ยั่วจนพัง","m":"ยั่วให้พลาด แล้วสวน"},{"n":"ยิ่งเจ็บยิ่งยิ้ม","m":"ไม่ยอมล้มต่อหน้าคนดู"}]],"build":[[{"n":"ปิดไว","m":"จบให้ไวที่สุด"},{"n":"หนักแต่ทน","m":"แลกได้เพราะทนกว่า"}],[{"n":"เก็บทุกแต้ม","m":"ทุกดอกต้องเป็นแต้ม"},{"n":"คุมเกม","m":"เดินเกมตามแผนมุม"}],[{"n":"อึดไม่จบ","m":"แรงไม่ตกทั้งไฟต์"},{"n":"ถึกไม่ล้ม","m":"รับได้ทุกอย่าง"}]]};
SKILLS.kati.push(SKX("kati_0a1",0,6,"ts_wind",["kick", "power"],_rsch("kati","ts_wind"),"แข้งฟาดฟ้า","Lv.26 · แข้งพายุ · เตะกลางลำตัวเต็มสะโพก · แรงเตะ +14% คะแนนเตะ +6%",r=>({dmg:{kick:0.14*r},pts:{kick:0.06*r}}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_0a2",0,7,"kati_0a1",["kick"],_rsch("kati","ts_wind"),"หน้าแข้งหินผา","ติดตัว · Lv.30 · แรงเตะ +3% ใช้แรงน้อยลง 1%",r=>({dmg:{kick:0.03*r},staSave:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_0a3",0,8,"kati_0a2",["kick", "speed"],_rsch("kati","ts_wind"),"เตะเปิดฟ้าสามดอก","Lv.34 · แข้งพายุ · เตะซ้ำที่เดิมสามครั้ง · เตะแม่น +4% แรงเตะ +12%",r=>({hit:{kick:0.04*r},dmg:{kick:0.12*r}}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_0a4",0,9,"kati_0a3",["kick", "elbow"],_rsch("kati","ts_wind"),"แข้งส่งศอก","ติดตัว · หนุนสายหมัดศอก · Lv.38 · แรงศอก +3% หมัดแม่น +1%",r=>({dmg:{elbow:0.03*r},hit:{punch:0.01*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.kati.push(SKX("kati_0a5",0,10,"kati_0a4",["kick", "power"],_rsch("kati","ts_wind"),"พระพายกวาดสังเวียน","Lv.42 · ขั้นตำนาน · แข้งที่ทั้งค่ายรอดู · แรงเตะ +20% เตะแม่น +5% คะแนนเตะ +8%",r=>({dmg:{kick:0.2*r},hit:{kick:0.05*r},pts:{kick:0.08*r}}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_0b1",0,6,"ts_wind",["kick", "foot"],_rsch("kati","ts_wind"),"เตะตัดจังหวะ","Lv.26 · แข้งเชิงครู · เตะดักก่อนคู่ชกออกอาวุธ · เตะแม่น +4% คะแนนเตะ +10%",r=>({hit:{kick:0.04*r},pts:{kick:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_0b2",0,7,"kati_0b1",["kick"],_rsch("kati","ts_wind"),"ตาไวเห็นช่อง","ติดตัว · Lv.30 · เตะแม่น +1.5% ความแม่นพื้นฐาน +0.4%",r=>({hit:{kick:0.015*r},prep:0.004*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_0b3",0,8,"kati_0b2",["kick", "iq"],_rsch("kati","ts_wind"),"เตะสลับเท้าท่าเสา","Lv.34 · แข้งเชิงครู · สลับเท้าแล้วเตะอีกข้าง · คะแนนเตะ +12% หลบ +1.5%",r=>({pts:{kick:0.12*r},evade:0.015*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_0b4",0,9,"kati_0b3",["kick", "guard"],_rsch("kati","ts_wind"),"ระยะแข้งคุมเกม","ติดตัว · หนุนสายการ์ดและใจ · Lv.38 · หลบ +1% ป้องกันวงใน +0.3",r=>({evade:0.01*r,clDef:0.3*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.kati.push(SKX("kati_0b5",0,10,"kati_0b4",["kick", "iq"],_rsch("kati","ts_wind"),"ครูเสาสอนเตะ","Lv.42 · ขั้นตำนาน · ทุกดอกตามตำราครู · เตะแม่น +5% คะแนนเตะ +12% สวนกลับ +3%",r=>({hit:{kick:0.05*r},pts:{kick:0.12*r},ctr:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.kati.push(SKX("kati_1a1",1,6,"ts_trunk",["elbow", "power"],_rsch("kati","ts_trunk"),"หิรัญม้วนแผ่นดิน","Lv.26 · ศอกกลับหัก · ลูกไม้มวยไทย รับเตะแล้วหมุนตัวตีศอก · แรงศอก +14% ศอกแม่น +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_1a2",1,7,"kati_1a1",["elbow"],_rsch("kati","ts_trunk"),"ข้อศอกเหล็ก","ติดตัว · Lv.30 · แรงศอก +3% ป้องกันวงใน +0.2",r=>({dmg:{elbow:0.03*r},clDef:0.2*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_1a3",1,8,"kati_1a2",["elbow", "clinch"],_rsch("kati","ts_trunk"),"ศอกตัดเหนือคิ้ว","Lv.34 · ศอกกลับหัก · ศอกเฉียงเหนือคิ้ว · แรงศอก +12% คะแนนศอก +10%",r=>({dmg:{elbow:0.12*r},pts:{elbow:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_1a4",1,9,"kati_1a3",["elbow", "guard"],_rsch("kati","ts_trunk"),"วงในใจถึง","ติดตัว · หนุนสายการ์ดและใจ · Lv.38 · ป้องกันวงใน +0.4 เลือดต่ำแม่นขึ้น 1%",r=>({clDef:0.4*r,clutch:0.01*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.kati.push(SKX("kati_1a5",1,10,"kati_1a4",["elbow", "punch"],_rsch("kati","ts_trunk"),"ไอยราหักศอก","Lv.42 · ขั้นตำนาน · ศอกที่จบไฟต์ได้ · แรงศอก +20% แรงหมัด +8% ศอกแม่น +4%",r=>({dmg:{elbow:0.2*r,punch:0.08*r},hit:{elbow:0.04*r}}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_1b1",1,6,"ts_trunk",["punch", "speed"],_rsch("kati","ts_trunk"),"หมัดหน้าสายฟ้า","Lv.26 · หมัดเร็วท่าเสา · หมัดนำไวกว่าที่ตาเห็น · หมัดแม่น +4% คะแนนหมัด +10%",r=>({hit:{punch:0.04*r},pts:{punch:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_1b2",1,7,"kati_1b1",["punch"],_rsch("kati","ts_trunk"),"มือไวตาไว","ติดตัว · Lv.30 · หมัดแม่น +1.5% สวนกลับ +1%",r=>({hit:{punch:0.015*r},ctr:0.01*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_1b3",1,8,"kati_1b2",["punch", "stamina"],_rsch("kati","ts_trunk"),"หมัดชุดห้าดอก","Lv.34 · หมัดเร็วท่าเสา · ชุดยาวไม่ให้ตั้งตัว · แรงหมัด +10% คะแนนหมัด +10% ใช้แรงน้อยลง 2%",r=>({dmg:{punch:0.1*r},pts:{punch:0.1*r},staSave:0.02*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_1b4",1,9,"kati_1b3",["punch", "kick"],_rsch("kati","ts_trunk"),"หมัดเปิดทางแข้ง","ติดตัว · หนุนสายแข้ง · Lv.38 · เตะแม่น +1.5% คะแนนเตะ +4%",r=>({hit:{kick:0.015*r},pts:{kick:0.04*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.kati.push(SKX("kati_1b5",1,10,"kati_1b4",["punch", "power"],_rsch("kati","ts_trunk"),"หมัดฟ้าผ่าท่าเสา","Lv.42 · ขั้นตำนาน · หมัดเดียวที่ทั้งสนามได้ยิน · แรงหมัด +18% หมัดแม่น +4% คะแนนหมัด +8%",r=>({dmg:{punch:0.18*r},hit:{punch:0.04*r},pts:{punch:0.08*r}}),{lv:42,br:1,nd:5}));
SKILLS.kati.push(SKX("kati_2a1",2,6,"ts_fort",["dur", "comp"],_rsch("kati","ts_fort"),"ยืนสู้กลางพายุ","Lv.26 · ใจไม่ถอย · ไม่ถอยแม้เลือดเหลือน้อย · เลือดต่ำแม่นขึ้น 4% ฟื้นแรง +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:0,nd:1}));
SKILLS.kati.push(SKX("kati_2a2",2,7,"kati_2a1",["comp"],_rsch("kati","ts_fort"),"ใจศิริชัย","ติดตัว · Lv.30 · กำลังใจมีผล +1% เลือดต่ำแม่นขึ้น 1%",r=>({mor:0.01*r,clutch:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_2a3",2,8,"kati_2a2",["stamina", "dur"],_rsch("kati","ts_fort"),"ล้มแล้วลุกท่าเสา","Lv.34 · ใจไม่ถอย · ลุกขึ้นมาแรงกว่าเดิม · ฟื้นแรง +15% เลือดต่ำแม่นขึ้น 3% ใช้แรงน้อยลง 2%",r=>({regen:0.15*r,clutch:0.03*r,staSave:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.kati.push(SKX("kati_2a4",2,9,"kati_2a3",["comp", "kick"],_rsch("kati","ts_fort"),"ใจหนุนแข้ง","ติดตัว · หนุนสายแข้ง · Lv.38 · แรงเตะ +3%",r=>({dmg:{kick:0.03*r}}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.kati.push(SKX("kati_2a5",2,10,"kati_2a4",["comp", "stamina"],_rsch("kati","ts_fort"),"ใจเกินร้อยห้าสิบ","Lv.42 · ขั้นตำนาน · ยกสุดท้ายแรงกว่ายกแรก · เลือดต่ำแม่นขึ้น 6% ฟื้นแรง +15% กำลังใจมีผล +2%",r=>({clutch:0.06*r,regen:0.15*r,mor:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.kati.push(SKX("kati_2b1",2,6,"ts_fort",["guard", "counter"],_rsch("kati","ts_fort"),"ชวาซัดหอก","Lv.26 · การ์ดเหล็กสวนไว · แม่ไม้มวยไทย ก้าวออกวงนอกแล้วสวนเข้าชายโครง · สวนกลับ +4% หลบ +1.5%",r=>({ctr:0.04*r,evade:0.015*r}),{lv:26,br:1,nd:1}));
SKILLS.kati.push(SKX("kati_2b2",2,7,"kati_2b1",["guard"],_rsch("kati","ts_fort"),"การ์ดไม่ตก","ติดตัว · Lv.30 · หลบ +0.8% ป้องกันวงใน +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.kati.push(SKX("kati_2b3",2,8,"kati_2b2",["guard", "elbow"],_rsch("kati","ts_fort"),"ปักลูกทอย","Lv.34 · การ์ดเหล็กสวนไว · แม่ไม้มวยไทย ตั้งศอกรับลูกเตะแล้วสวน · สวนกลับ +3% แรงหมัดสวน +12% ป้องกันวงใน +0.4",r=>({ctr:0.03*r,ctrDmg:0.12*r,clDef:0.4*r}),{lv:34,br:1,nd:3}));
SKILLS.kati.push(SKX("kati_2b4",2,9,"kati_2b3",["guard", "punch"],_rsch("kati","ts_fort"),"การ์ดส่งหมัด","ติดตัว · หนุนสายหมัดศอก · Lv.38 · แรงหมัดสวน +5% หมัดแม่น +1%",r=>({ctrDmg:0.05*r,hit:{punch:0.01*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.kati.push(SKX("kati_2b5",2,10,"kati_2b4",["guard", "iq"],_rsch("kati","ts_fort"),"กำแพงสวนฟ้า","Lv.42 · ขั้นตำนาน · ทุกดอกที่รับ คืนเป็นสองเท่า · หลบ +3% สวนกลับ +5% แรงหมัดสวน +15%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.15*r}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_0a1",0,6,"cy_soar",["elbow", "speed"],_rsch("mali","cy_soar"),"กระโดดศอกฟ้าแลบ","Lv.26 · ศอกเหินฟ้า · กระโดดเข้าพร้อมศอก · แรงศอก +14% ศอกแม่น +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_0a2",0,7,"mali_0a1",["elbow"],_rsch("mali","cy_soar"),"สปริงขาไชยา","ติดตัว · Lv.30 · แรงเข่า +2% แรงศอก +2%",r=>({dmg:{knee:0.02*r,elbow:0.02*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_0a3",0,8,"mali_0a2",["elbow", "foot"],_rsch("mali","cy_soar"),"ศอกกลับกลางอากาศ","Lv.34 · ศอกเหินฟ้า · หมุนศอกกลับตอนลอยตัว · แรงศอก +12% คะแนนศอก +10%",r=>({dmg:{elbow:0.12*r},pts:{elbow:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_0a4",0,9,"mali_0a3",["elbow", "kick"],_rsch("mali","cy_soar"),"เหินแล้วเตะ","ติดตัว · หนุนสายเตะและความไว · Lv.38 · เตะแม่น +1.5% แรงเตะ +2%",r=>({hit:{kick:0.015*r},dmg:{kick:0.02*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.mali.push(SKX("mali_0a5",0,10,"mali_0a4",["elbow", "knee"],_rsch("mali","cy_soar"),"ครุฑพ่าห์ศอก","Lv.42 · ขั้นตำนาน · ศอกที่ตัวเล็กแต่หนักที่สุด · แรงศอก +20% แรงเข่า +10% ศอกแม่น +3%",r=>({dmg:{elbow:0.2*r,knee:0.1*r},hit:{elbow:0.03*r}}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_0b1",0,6,"cy_soar",["knee", "clinch"],_rsch("mali","cy_soar"),"จับคอตีเข่าไชยา","Lv.26 · ศอกเข่าวงใน · ล็อกคอแล้วตีเข่าตรง · แรงเข่า +14% ป้องกันวงใน +0.3",r=>({dmg:{knee:0.14*r},clDef:0.3*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_0b2",0,7,"mali_0b1",["clinch"],_rsch("mali","cy_soar"),"คอแข็งไชยา","ติดตัว · Lv.30 · ป้องกันวงใน +0.3 เข่าแม่น +1%",r=>({clDef:0.3*r,hit:{knee:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_0b3",0,8,"mali_0b2",["knee", "elbow"],_rsch("mali","cy_soar"),"เข่าโทนศอกตาม","Lv.34 · ศอกเข่าวงใน · เข่าเปิดแล้วศอกตาม · แรงเข่า +10% แรงศอก +8% คะแนนเข่า +8%",r=>({dmg:{knee:0.1*r,elbow:0.08*r},pts:{knee:0.08*r}}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_0b4",0,9,"mali_0b3",["clinch", "guard"],_rsch("mali","cy_soar"),"วงในปิดประตู","ติดตัว · หนุนสายป้องกัน · Lv.38 · ป้องกันวงใน +0.3 หลบ +0.8%",r=>({clDef:0.3*r,evade:0.008*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.mali.push(SKX("mali_0b5",0,10,"mali_0b4",["knee", "elbow"],_rsch("mali","cy_soar"),"หักคอเอราวัณคู่","Lv.42 · ขั้นตำนาน · ดึงคอลงสองจังหวะ · แรงเข่า +16% แรงศอก +12% เข่าแม่น +3%",r=>({dmg:{knee:0.16*r,elbow:0.12*r},hit:{knee:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_1a1",1,6,"cy_gale",["kick", "speed"],_rsch("mali","cy_gale"),"เตะลมพัดใบไม้","Lv.26 · ลมเตะไชยา · เตะเบาแต่ไม่พลาด · เตะแม่น +4% แรงเตะ +10%",r=>({hit:{kick:0.04*r},dmg:{kick:0.1*r}}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_1a2",1,7,"mali_1a1",["foot"],_rsch("mali","cy_gale"),"ก้าวเบาเหมือนลม","ติดตัว · Lv.30 · หลบ +0.8% ใช้แรงน้อยลง 1%",r=>({evade:0.008*r,staSave:0.01*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_1a3",1,8,"mali_1a2",["kick", "foot"],_rsch("mali","cy_gale"),"เตะเปิดดอกมะลิ","Lv.34 · ลมเตะไชยา · เตะเปิดการ์ดให้กรรมการเห็น · คะแนนเตะ +12% เตะแม่น +3%",r=>({pts:{kick:0.12*r},hit:{kick:0.03*r}}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_1a4",1,9,"mali_1a3",["foot", "guard"],_rsch("mali","cy_gale"),"ลมหลบเข้าป้อง","ติดตัว · หนุนสายป้องกัน · Lv.38 · หลบ +1.2%",r=>({evade:0.012*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.mali.push(SKX("mali_1a5",1,10,"mali_1a4",["kick", "speed"],_rsch("mali","cy_gale"),"มะลิพายุ","Lv.42 · ขั้นตำนาน · เตะต่อเนื่องจนคู่ชกตามไม่ทัน · แรงเตะ +16% เตะแม่น +5% หลบ +2%",r=>({dmg:{kick:0.16*r},hit:{kick:0.05*r},evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_1b1",1,6,"cy_gale",["foot", "stamina"],_rsch("mali","cy_gale"),"ย่างสามขุมเร็ว","Lv.26 · ร่ายรำไม่เหนื่อย · ก้าวสามขุมเร็วขึ้นเท่าตัว · ฟื้นแรง +15% หลบ +1.5%",r=>({regen:0.15*r,evade:0.015*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_1b2",1,7,"mali_1b1",["stamina"],_rsch("mali","cy_gale"),"ลมหายใจยาวไชยา","ติดตัว · Lv.30 · ฟื้นแรง +5% ใช้แรงน้อยลง 1%",r=>({regen:0.05*r,staSave:0.01*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_1b3",1,8,"mali_1b2",["foot", "kick"],_rsch("mali","cy_gale"),"รำแล้วรุก","Lv.34 · ร่ายรำไม่เหนื่อย · ร่ายรำหลอกแล้วรุกเข้า · คะแนนเตะ +8% ฟื้นแรง +10% กำลังใจมีผล +1%",r=>({pts:{kick:0.08*r},regen:0.1*r,mor:0.01*r}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_1b4",1,9,"mali_1b3",["stamina", "elbow"],_rsch("mali","cy_gale"),"เบาแรงส่งศอก","ติดตัว · หนุนสายศอก · Lv.38 · แรงศอก +3%",r=>({dmg:{elbow:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.mali.push(SKX("mali_1b5",1,10,"mali_1b4",["foot", "stamina"],_rsch("mali","cy_gale"),"นาฏลีลาไชยา","Lv.42 · ขั้นตำนาน · มวยที่สวยเหมือนการแสดง · ฟื้นแรง +20% หลบ +2.5% ใช้แรงน้อยลง 3%",r=>({regen:0.2*r,evade:0.025*r,staSave:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.mali.push(SKX("mali_2a1",2,6,"cy_meru",["guard", "dur"],_rsch("mali","cy_meru"),"ปิดการ์ดสามชั้น","Lv.26 · ป้อมไชยา · การ์ดซ้อนสามชั้น · ป้องกันวงใน +0.6 หลบ +1.5%",r=>({clDef:0.6*r,evade:0.015*r}),{lv:26,br:0,nd:1}));
SKILLS.mali.push(SKX("mali_2a2",2,7,"mali_2a1",["guard"],_rsch("mali","cy_meru"),"ยืนหลักไม่สะเทือน","ติดตัว · Lv.30 · ป้องกันวงใน +0.3 ฟื้นแรง +3%",r=>({clDef:0.3*r,regen:0.03*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_2a3",2,8,"mali_2a2",["guard", "elbow"],_rsch("mali","cy_meru"),"อิเหนาแทงกริช","Lv.34 · ป้อมไชยา · แม่ไม้มวยไทย ปัดหมัดแล้วกระแทกศอกเข้าชายโครง · สวนกลับ +3% แรงหมัดสวน +10% ป้องกันวงใน +0.4",r=>({ctr:0.03*r,ctrDmg:0.1*r,clDef:0.4*r}),{lv:34,br:0,nd:3}));
SKILLS.mali.push(SKX("mali_2a4",2,9,"mali_2a3",["guard", "elbow"],_rsch("mali","cy_meru"),"ป้อมส่งศอก","ติดตัว · หนุนสายศอก · Lv.38 · ศอกแม่น +1.5% แรงหมัดสวน +3%",r=>({hit:{elbow:0.015*r},ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.mali.push(SKX("mali_2a5",2,10,"mali_2a4",["guard", "dur"],_rsch("mali","cy_meru"),"สุเมรุไม่สั่น","Lv.42 · ขั้นตำนาน · ภูเขาที่ไม่มีวันขยับ · ป้องกันวงใน +1 หลบ +3% ฟื้นแรง +10%",r=>({clDef:1*r,evade:0.03*r,regen:0.1*r}),{lv:42,br:0,nd:5}));
SKILLS.mali.push(SKX("mali_2b1",2,6,"cy_meru",["comp", "counter"],_rsch("mali","cy_meru"),"ยิ้มแล้วสวน","Lv.26 · ยิ้มรับทุกดอก · ยิ้มให้คู่ชกแล้วสวน · สวนกลับ +4% กำลังใจมีผล +1%",r=>({ctr:0.04*r,mor:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.mali.push(SKX("mali_2b2",2,7,"mali_2b1",["comp"],_rsch("mali","cy_meru"),"ใจใหญ่กว่าตัว","ติดตัว · Lv.30 · เลือดต่ำแม่นขึ้น 1.5% กำลังใจมีผล +0.5%",r=>({clutch:0.015*r,mor:0.005*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.mali.push(SKX("mali_2b3",2,8,"mali_2b2",["comp", "dur"],_rsch("mali","cy_meru"),"ล้มไม่ได้ เพราะยิ้มอยู่","Lv.34 · ยิ้มรับทุกดอก · ยังยิ้มได้ก็ยังสู้ได้ · เลือดต่ำแม่นขึ้น 4% ฟื้นแรง +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:34,br:1,nd:3}));
SKILLS.mali.push(SKX("mali_2b4",2,9,"mali_2b3",["comp", "foot"],_rsch("mali","cy_meru"),"ใจเบาเท้าเบา","ติดตัว · หนุนสายเตะและความไว · Lv.38 · เตะแม่น +1% ฟื้นแรง +3%",r=>({hit:{kick:0.01*r},regen:0.03*r}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.mali.push(SKX("mali_2b5",2,10,"mali_2b4",["comp", "stamina"],_rsch("mali","cy_meru"),"มะลิไม่มีวันเหี่ยว","Lv.42 · ขั้นตำนาน · ยิ่งยกท้ายยิ่งสดใส · เลือดต่ำแม่นขึ้น 5% สวนกลับ +4% กำลังใจมีผล +2%",r=>({clutch:0.05*r,ctr:0.04*r,mor:0.02*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_0a1",0,6,"lb_proof",["counter", "speed"],_rsch("rin","lb_proof"),"สวนก่อนสาม","Lv.26 · สวนตัดคม · สวนก่อนคู่ชกนับจังหวะจบ · สวนกลับ +4% แรงหมัดสวน +12%",r=>({ctr:0.04*r,ctrDmg:0.12*r}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_0a2",0,7,"rin_0a1",["counter"],_rsch("rin","lb_proof"),"จังหวะครึ่งวินาที","ติดตัว · Lv.30 · สวนกลับ +1.2%",r=>({ctr:0.012*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_0a3",0,8,"rin_0a2",["counter", "punch"],_rsch("rin","lb_proof"),"แทงกริชสองชั้น","Lv.34 · สวนตัดคม · หมัดตรงสวนสองดอกติด · แรงหมัดสวน +16% หมัดแม่น +2%",r=>({ctrDmg:0.16*r,hit:{punch:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_0a4",0,9,"rin_0a3",["counter", "iq"],_rsch("rin","lb_proof"),"สวนแล้วจด","ติดตัว · หนุนสายอ่านเกม · Lv.38 · คำสั่งพักยก +8% ความแม่นพื้นฐาน +0.3%",r=>({corner:0.08*r,prep:0.003*r}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.rin.push(SKX("rin_0a5",0,10,"rin_0a4",["counter", "iq"],_rsch("rin","lb_proof"),"ทฤษฎีบทสวนกลับ","Lv.42 · ขั้นตำนาน · พิสูจน์แล้วว่าสวนได้ทุกดอก · สวนกลับ +6% แรงหมัดสวน +22% หมัดแม่น +3%",r=>({ctr:0.06*r,ctrDmg:0.22*r,hit:{punch:0.03*r}}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_0b1",0,6,"lb_proof",["counter", "foot"],_rsch("rin","lb_proof"),"ปักษาแหวกรัง","Lv.26 · ม่านลวง · แม่ไม้มวยไทย ก้าวเข้าวงใน ปัดหมัดแล้วสวน · หลบ +2% สวนกลับ +3%",r=>({evade:0.02*r,ctr:0.03*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_0b2",0,7,"rin_0b1",["counter", "guard"],_rsch("rin","lb_proof"),"ไม่เปิดช่อง","ติดตัว · Lv.30 · หลบ +0.8% ป้องกันวงใน +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_0b3",0,8,"rin_0b2",["counter", "knee"],_rsch("rin","lb_proof"),"ล่อแล้วสวนเข่า","Lv.34 · ม่านลวง · ล่อให้เข้าแล้วสวนเข่า · สวนกลับ +3% แรงเข่า +10%",r=>({ctr:0.03*r,dmg:{knee:0.1*r}}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_0b4",0,9,"rin_0b3",["counter", "kick"],_rsch("rin","lb_proof"),"หลบแล้วถีบ","ติดตัว · หนุนสายคุมระยะ · Lv.38 · เตะแม่น +1.5% คะแนนเตะ +3%",r=>({hit:{kick:0.015*r},pts:{kick:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.rin.push(SKX("rin_0b5",0,10,"rin_0b4",["counter", "speed"],_rsch("rin","lb_proof"),"เงาลพบุรี","Lv.42 · ขั้นตำนาน · คู่ชกตีได้แค่เงา · หลบ +3% สวนกลับ +5% แรงหมัดสวน +12%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.12*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_1a1",1,6,"lb_book",["iq", "comp"],_rsch("rin","lb_book"),"บทที่หนึ่ง: อ่านคู่ชก","Lv.26 · ตำราลับ · อ่านคู่ชกตั้งแต่ยกแรก · คำสั่งพักยก +30% ความแม่นพื้นฐาน +1%",r=>({corner:0.3*r,prep:0.01*r}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_1a2",1,7,"rin_1a1",["iq"],_rsch("rin","lb_book"),"จดทุกยก","ติดตัว · Lv.30 · ความแม่นพื้นฐาน +0.4% คำสั่งพักยก +5%",r=>({prep:0.004*r,corner:0.05*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_1a3",1,8,"rin_1a2",["iq", "foot"],_rsch("rin","lb_book"),"บทที่สาม: ตัดทางหนี","Lv.34 · ตำราลับ · บีบคู่ชกเข้ามุม · คำสั่งพักยก +25% หลบ +1.5% สวนกลับ +2%",r=>({corner:0.25*r,evade:0.015*r,ctr:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_1a4",1,9,"rin_1a3",["iq", "kick"],_rsch("rin","lb_book"),"คำนวณระยะ","ติดตัว · หนุนสายคุมระยะ · Lv.38 · เตะแม่น +1.5% หลบ +0.6%",r=>({hit:{kick:0.015*r},evade:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.rin.push(SKX("rin_1a5",1,10,"rin_1a4",["iq", "comp"],_rsch("rin","lb_book"),"ภาคผนวก: ชนะก่อนชก","Lv.42 · ขั้นตำนาน · ชนะตั้งแต่ในสมุด · คำสั่งพักยก +50% ความแม่นพื้นฐาน +1.8% สวนกลับ +3%",r=>({corner:0.5*r,prep:0.018*r,ctr:0.03*r}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_1b1",1,6,"lb_book",["iq", "counter"],_rsch("rin","lb_book"),"หลอกสองชั้น","Lv.26 · อ่านแล้วเล่น · หลอกซ้อนหลอก · สวนกลับ +3% หลบ +1.5% คำสั่งพักยก +10%",r=>({ctr:0.03*r,evade:0.015*r,corner:0.1*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_1b2",1,7,"rin_1b1",["iq"],_rsch("rin","lb_book"),"ตาไม่กะพริบ","ติดตัว · Lv.30 · สวนกลับ +0.8% ความแม่นพื้นฐาน +0.2%",r=>({ctr:0.008*r,prep:0.002*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_1b3",1,8,"rin_1b2",["iq", "counter"],_rsch("rin","lb_book"),"ล่อเข้ากับดัก","Lv.34 · อ่านแล้วเล่น · เปิดช่องให้ แล้วปิดกับดัก · แรงหมัดสวน +14% สวนกลับ +3%",r=>({ctrDmg:0.14*r,ctr:0.03*r}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_1b4",1,9,"rin_1b3",["iq", "counter"],_rsch("rin","lb_book"),"อ่านแล้วสวน","ติดตัว · หนุนสายสวนกลับ · Lv.38 · สวนกลับ +1.2% แรงหมัดสวน +3%",r=>({ctr:0.012*r,ctrDmg:0.03*r}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.rin.push(SKX("rin_1b5",1,10,"rin_1b4",["iq", "comp"],_rsch("rin","lb_book"),"หมากรุกในสังเวียน","Lv.42 · ขั้นตำนาน · เดินหมากล่วงหน้าห้าตา · คำสั่งพักยก +35% สวนกลับ +5% แรงหมัดสวน +10%",r=>({corner:0.35*r,ctr:0.05*r,ctrDmg:0.1*r}),{lv:42,br:1,nd:5}));
SKILLS.rin.push(SKX("rin_2a1",2,6,"lb_circle",["kick", "foot"],_rsch("rin","lb_circle"),"ถีบหน้าตัดทาง","Lv.26 · ถีบเป็นกำแพง · ถีบตัดทางเดินหน้า · เตะแม่น +4% คะแนนเตะ +10%",r=>({hit:{kick:0.04*r},pts:{kick:0.1*r}}),{lv:26,br:0,nd:1}));
SKILLS.rin.push(SKX("rin_2a2",2,7,"rin_2a1",["kick"],_rsch("rin","lb_circle"),"ขายาวคุมวง","ติดตัว · Lv.30 · หลบ +0.8% คะแนนเตะ +2%",r=>({evade:0.008*r,pts:{kick:0.02*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_2a3",2,8,"rin_2a2",["kick", "power"],_rsch("rin","lb_circle"),"ถีบกระโดดลพบุรี","Lv.34 · ถีบเป็นกำแพง · กระโดดถีบเต็มแรง · แรงเตะ +14% เตะแม่น +2%",r=>({dmg:{kick:0.14*r},hit:{kick:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.rin.push(SKX("rin_2a4",2,9,"rin_2a3",["kick", "counter"],_rsch("rin","lb_circle"),"ระยะสวนพอดี","ติดตัว · หนุนสายสวนกลับ · Lv.38 · สวนกลับ +1% แรงหมัดสวน +3%",r=>({ctr:0.01*r,ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.rin.push(SKX("rin_2a5",2,10,"rin_2a4",["kick", "foot"],_rsch("rin","lb_circle"),"ประตูเมืองลพบุรี","Lv.42 · ขั้นตำนาน · ไม่มีใครผ่านลูกถีบไปได้ · เตะแม่น +5% คะแนนเตะ +12% หลบ +2%",r=>({hit:{kick:0.05*r},pts:{kick:0.12*r},evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.rin.push(SKX("rin_2b1",2,6,"lb_circle",["foot", "speed"],_rsch("rin","lb_circle"),"วนซ้ายหลบหมัด","Lv.26 · วนรอบนอก · วนออกจากหมัดหนัก · หลบ +2.5% ใช้แรงน้อยลง 2%",r=>({evade:0.025*r,staSave:0.02*r}),{lv:26,br:1,nd:1}));
SKILLS.rin.push(SKX("rin_2b2",2,7,"rin_2b1",["foot"],_rsch("rin","lb_circle"),"ก้าวประหยัด","ติดตัว · Lv.30 · ใช้แรงน้อยลง 1.5%",r=>({staSave:0.015*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.rin.push(SKX("rin_2b3",2,8,"rin_2b2",["foot", "kick"],_rsch("rin","lb_circle"),"วิรุฬหกกลับ","Lv.34 · วนรอบนอก · แม่ไม้มวยไทย พลิกหลบเตะแล้วส้นเท้ากระแทกต้นขา · แรงเตะ +10% หลบ +1.5% สวนกลับ +2%",r=>({dmg:{kick:0.1*r},evade:0.015*r,ctr:0.02*r}),{lv:34,br:1,nd:3}));
SKILLS.rin.push(SKX("rin_2b4",2,9,"rin_2b3",["foot", "iq"],_rsch("rin","lb_circle"),"ระยะให้เวลาคิด","ติดตัว · หนุนสายอ่านเกม · Lv.38 · คำสั่งพักยก +8% ความแม่นพื้นฐาน +0.2%",r=>({corner:0.08*r,prep:0.002*r}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.rin.push(SKX("rin_2b5",2,10,"rin_2b4",["foot", "speed"],_rsch("rin","lb_circle"),"วงโคจรลพบุรี","Lv.42 · ขั้นตำนาน · คู่ชกหมุนตามจนเวียนหัว · หลบ +3.5% ใช้แรงน้อยลง 3% เตะแม่น +3%",r=>({evade:0.035*r,staSave:0.03*r,hit:{kick:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_0a1",0,6,"kr_genius",["punch", "power"],_rsch("ploy","kr_genius"),"เหวี่ยงควายสามดอก","Lv.26 · หมัดเหวี่ยงทลาย · เหวี่ยงซ้ำสามดอก · แรงหมัด +14% คะแนนหมัด +6%",r=>({dmg:{punch:0.14*r},pts:{punch:0.06*r}}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_0a2",0,7,"ploy_0a1",["punch"],_rsch("ploy","kr_genius"),"ไหล่โคราช","ติดตัว · Lv.30 · แรงหมัด +3%",r=>({dmg:{punch:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_0a3",0,8,"ploy_0a2",["punch", "speed"],_rsch("ploy","kr_genius"),"หมัดเหวี่ยงก้านคอ","Lv.34 · หมัดเหวี่ยงทลาย · เหวี่ยงเข้าก้านคอ · แรงหมัด +14% หมัดแม่น +3%",r=>({dmg:{punch:0.14*r},hit:{punch:0.03*r}}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_0a4",0,9,"ploy_0a3",["punch", "kick"],_rsch("ploy","kr_genius"),"หมัดเปิดคอ","ติดตัว · หนุนสายเตะคอขาด · Lv.38 · แรงเตะ +2.5% เตะแม่น +1%",r=>({dmg:{kick:0.025*r},hit:{kick:0.01*r}}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.ploy.push(SKX("ploy_0a5",0,10,"ploy_0a4",["punch", "power"],_rsch("ploy","kr_genius"),"ควายเผือกถล่มเสา","Lv.42 · ขั้นตำนาน · หมัดที่ทำให้โคราชลือ · แรงหมัด +22% หมัดแม่น +3% คะแนนหมัด +6%",r=>({dmg:{punch:0.22*r},hit:{punch:0.03*r},pts:{punch:0.06*r}}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_0b1",0,6,"kr_genius",["punch", "iq"],_rsch("ploy","kr_genius"),"หมัดเดียวรู้ผล","Lv.26 · หมัดอัจฉริยะ · หมัดเดียววัดเกม · หมัดแม่น +4% คะแนนหมัด +10%",r=>({hit:{punch:0.04*r},pts:{punch:0.1*r}}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_0b2",0,7,"ploy_0b1",["punch"],_rsch("ploy","kr_genius"),"คำนวณหมัด","ติดตัว · Lv.30 · หมัดแม่น +1.2% ความแม่นพื้นฐาน +0.2%",r=>({hit:{punch:0.012*r},prep:0.002*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_0b3",0,8,"ploy_0b2",["punch", "counter"],_rsch("ploy","kr_genius"),"สวนหมัดเหวี่ยง","Lv.34 · หมัดอัจฉริยะ · สวนด้วยหมัดเหวี่ยง · สวนกลับ +3% แรงหมัดสวน +12%",r=>({ctr:0.03*r,ctrDmg:0.12*r}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_0b4",0,9,"ploy_0b3",["punch", "iq"],_rsch("ploy","kr_genius"),"อ่านจากหมัด","ติดตัว · หนุนสายกำแพงพยัคฆ์ · Lv.38 · สวนกลับ +1% คำสั่งพักยก +5%",r=>({ctr:0.01*r,corner:0.05*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.ploy.push(SKX("ploy_0b5",0,10,"ploy_0b4",["punch", "iq"],_rsch("ploy","kr_genius"),"พรสวรรค์ไร้พ่าย","Lv.42 · ขั้นตำนาน · หมัดของคนที่ไม่เคยแพ้ · หมัดแม่น +5% แรงหมัด +14% สวนกลับ +3%",r=>({hit:{punch:0.05*r},dmg:{punch:0.14*r},ctr:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_1a1",1,6,"kr_tiger",["kick", "power"],_rsch("ploy","kr_tiger"),"เตะก้านคอสองข้าง","Lv.26 · เตะคอขาด · เตะก้านคอซ้ายขวา · แรงเตะ +14% เตะแม่น +2%",r=>({dmg:{kick:0.14*r},hit:{kick:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_1a2",1,7,"ploy_1a1",["kick"],_rsch("ploy","kr_tiger"),"แข้งโคราช","ติดตัว · Lv.30 · แรงเตะ +3%",r=>({dmg:{kick:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_1a3",1,8,"ploy_1a2",["kick", "foot"],_rsch("ploy","kr_tiger"),"กวางเหลียวหลัง","Lv.34 · เตะคอขาด · ลูกไม้มวยไทย ถีบข้างแล้วพลิกตัวเตะส้นเท้า · แรงเตะ +12% คะแนนเตะ +10%",r=>({dmg:{kick:0.12*r},pts:{kick:0.1*r}}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_1a4",1,9,"ploy_1a3",["kick", "guard"],_rsch("ploy","kr_tiger"),"แข้งกันวง","ติดตัว · หนุนสายกำแพงพยัคฆ์ · Lv.38 · ป้องกันวงใน +0.3 หลบ +0.6%",r=>({clDef:0.3*r,evade:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.ploy.push(SKX("ploy_1a5",1,10,"ploy_1a4",["kick", "power"],_rsch("ploy","kr_tiger"),"พยัคฆ์ทองตะปบ","Lv.42 · ขั้นตำนาน · เตะที่ปิดเกมในดอกเดียว · แรงเตะ +20% เตะแม่น +4% คะแนนเตะ +8%",r=>({dmg:{kick:0.2*r},hit:{kick:0.04*r},pts:{kick:0.08*r}}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_1b1",1,6,"kr_tiger",["knee", "clinch"],_rsch("ploy","kr_tiger"),"ล็อกคอตีเข่าเฉียง","Lv.26 · ปล้ำคอโคราช · ล็อกคอตีเข่าเฉียงเข้าซี่โครง · แรงเข่า +14% ป้องกันวงใน +0.3",r=>({dmg:{knee:0.14*r},clDef:0.3*r}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_1b2",1,7,"ploy_1b1",["clinch"],_rsch("ploy","kr_tiger"),"แขนเหล็กล็อกคอ","ติดตัว · Lv.30 · ป้องกันวงใน +0.3 เข่าแม่น +1%",r=>({clDef:0.3*r,hit:{knee:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_1b3",1,8,"ploy_1b2",["knee", "power"],_rsch("ploy","kr_tiger"),"เข่าโค้งโคราช","Lv.34 · ปล้ำคอโคราช · เข่าโค้งเข้าข้างลำตัว · แรงเข่า +14% คะแนนเข่า +8%",r=>({dmg:{knee:0.14*r},pts:{knee:0.08*r}}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_1b4",1,9,"ploy_1b3",["clinch", "punch"],_rsch("ploy","kr_tiger"),"ดึงคอส่งหมัด","ติดตัว · หนุนสายหมัดโคราช · Lv.38 · แรงหมัด +3%",r=>({dmg:{punch:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.ploy.push(SKX("ploy_1b5",1,10,"ploy_1b4",["knee", "clinch"],_rsch("ploy","kr_tiger"),"ล็อกคอพยัคฆ์","Lv.42 · ขั้นตำนาน · ใครโดนล็อกก็หมดแรง · แรงเข่า +20% ป้องกันวงใน +0.6 เข่าแม่น +3%",r=>({dmg:{knee:0.2*r},clDef:0.6*r,hit:{knee:0.03*r}}),{lv:42,br:1,nd:5}));
SKILLS.ploy.push(SKX("ploy_2a1",2,6,"p_crown",["guard", "counter"],_rsch("ploy","p_crown"),"ปิดสูงสวนเหวี่ยง","Lv.26 · กำแพงสวนหนัก · ปิดการ์ดสูงแล้วเหวี่ยงสวน · สวนกลับ +4% แรงหมัดสวน +10%",r=>({ctr:0.04*r,ctrDmg:0.1*r}),{lv:26,br:0,nd:1}));
SKILLS.ploy.push(SKX("ploy_2a2",2,7,"ploy_2a1",["guard"],_rsch("ploy","p_crown"),"การ์ดโคราช","ติดตัว · Lv.30 · หลบ +0.8% ป้องกันวงใน +0.2",r=>({evade:0.008*r,clDef:0.2*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_2a3",2,8,"ploy_2a2",["guard", "power"],_rsch("ploy","p_crown"),"นาคาบิดหาง","Lv.34 · กำแพงสวนหนัก · แม่ไม้มวยไทย จับขาที่เตะมา บิดออกแล้วตีเข่า · แรงหมัดสวน +18% สวนกลับ +2%",r=>({ctrDmg:0.18*r,ctr:0.02*r}),{lv:34,br:0,nd:3}));
SKILLS.ploy.push(SKX("ploy_2a4",2,9,"ploy_2a3",["guard", "punch"],_rsch("ploy","p_crown"),"สวนด้วยหมัดเหวี่ยง","ติดตัว · หนุนสายหมัดโคราช · Lv.38 · แรงหมัด +2% แรงหมัดสวน +3%",r=>({dmg:{punch:0.02*r},ctrDmg:0.03*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.ploy.push(SKX("ploy_2a5",2,10,"ploy_2a4",["guard", "comp"],_rsch("ploy","p_crown"),"กำแพงพยัคฆ์ทอง","Lv.42 · ขั้นตำนาน · กำแพงที่กัดกลับ · หลบ +3% สวนกลับ +5% แรงหมัดสวน +15%",r=>({evade:0.03*r,ctr:0.05*r,ctrDmg:0.15*r}),{lv:42,br:0,nd:5}));
SKILLS.ploy.push(SKX("ploy_2b1",2,6,"p_crown",["iq", "comp"],_rsch("ploy","p_crown"),"แผนยกแรก","Lv.26 · แผนพี่สาว · เปิดเกมตามแผน · คำสั่งพักยก +30% ความแม่นพื้นฐาน +1%",r=>({corner:0.3*r,prep:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.ploy.push(SKX("ploy_2b2",2,7,"ploy_2b1",["iq"],_rsch("ploy","p_crown"),"สมุดไพลิน","ติดตัว · Lv.30 · คำสั่งพักยก +5% ความแม่นพื้นฐาน +0.3%",r=>({corner:0.05*r,prep:0.003*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.ploy.push(SKX("ploy_2b3",2,8,"ploy_2b2",["iq", "stamina"],_rsch("ploy","p_crown"),"แผนยกสุดท้าย","Lv.34 · แผนพี่สาว · แผนสำหรับยกที่เหนื่อยที่สุด · คำสั่งพักยก +25% เลือดต่ำแม่นขึ้น 3% ฟื้นแรง +8%",r=>({corner:0.25*r,clutch:0.03*r,regen:0.08*r}),{lv:34,br:1,nd:3}));
SKILLS.ploy.push(SKX("ploy_2b4",2,9,"ploy_2b3",["iq", "kick"],_rsch("ploy","p_crown"),"แผนเปิดเตะ","ติดตัว · หนุนสายเตะคอขาด · Lv.38 · เตะแม่น +1.5% คะแนนเตะ +3%",r=>({hit:{kick:0.015*r},pts:{kick:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.ploy.push(SKX("ploy_2b5",2,10,"ploy_2b4",["iq", "comp"],_rsch("ploy","p_crown"),"มรดกพยัคฆ์","Lv.42 · ขั้นตำนาน · สิ่งที่พี่สาวอยากเห็น · คำสั่งพักยก +45% ความแม่นพื้นฐาน +1.5% สวนกลับ +4%",r=>({corner:0.45*r,prep:0.015*r,ctr:0.04*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_0a1",0,6,"f_sky",["elbow", "speed"],_rsch("fah","f_sky"),"ศอกฟ้าแลบคู่","Lv.26 · ศอกสายฟ้า · ศอกซ้ายขวาเร็วจนเห็นแสง · แรงศอก +14% ศอกแม่น +2%",r=>({dmg:{elbow:0.14*r},hit:{elbow:0.02*r}}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_0a2",0,7,"fah_0a1",["elbow"],_rsch("fah","f_sky"),"ข้อศอกคม","ติดตัว · Lv.30 · แรงศอก +3%",r=>({dmg:{elbow:0.03*r}}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_0a3",0,8,"fah_0a2",["elbow", "power"],_rsch("fah","f_sky"),"ศอกพุ่งฝ่าการ์ด","Lv.34 · ศอกสายฟ้า · พุ่งศอกทะลุการ์ด · แรงศอก +14% คะแนนศอก +8%",r=>({dmg:{elbow:0.14*r},pts:{elbow:0.08*r}}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_0a4",0,9,"fah_0a3",["elbow", "punch"],_rsch("fah","f_sky"),"ศอกเปิดทางบุก","ติดตัว · หนุนสายบุกบ้าบิ่น · Lv.38 · แรงหมัด +2.5% ใช้แรงน้อยลง 0.5%",r=>({dmg:{punch:0.025*r},staSave:0.005*r}),{lv:38,br:0,nd:4,passive:1,feed:1}));
SKILLS.fah.push(SKX("fah_0a5",0,10,"fah_0a4",["elbow", "power"],_rsch("fah","f_sky"),"ฟ้าฟาดศอก","Lv.42 · ขั้นตำนาน · ศอกเดียวเหมือนฟ้าผ่า · แรงศอก +22% ศอกแม่น +4%",r=>({dmg:{elbow:0.22*r},hit:{elbow:0.04*r}}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_0b1",0,6,"f_sky",["elbow", "foot"],_rsch("fah","f_sky"),"ศอกหมุนโชว์","Lv.26 · ศอกโชว์ · หมุนศอกให้กล้องจับ · คะแนนศอก +14% กำลังใจมีผล +1%",r=>({pts:{elbow:0.14*r},mor:0.01*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_0b2",0,7,"fah_0b1",["elbow"],_rsch("fah","f_sky"),"ท่าสวยต้องโชว์","ติดตัว · Lv.30 · คะแนนศอก +3% กำลังใจมีผล +0.4%",r=>({pts:{elbow:0.03*r},mor:0.004*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_0b3",0,8,"fah_0b2",["elbow", "foot"],_rsch("fah","f_sky"),"ศอกเต้นรำ","Lv.34 · ศอกโชว์ · ขยับเหมือนเต้นแล้วศอก · หลบ +1.5% แรงศอก +10% คะแนนศอก +6%",r=>({evade:0.015*r,dmg:{elbow:0.1*r},pts:{elbow:0.06*r}}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_0b4",0,9,"fah_0b3",["elbow", "comp"],_rsch("fah","f_sky"),"โชว์แล้วยิ้ม","ติดตัว · หนุนสายยิ้มเยาะ · Lv.38 · เลือดต่ำแม่นขึ้น 1% กำลังใจมีผล +0.5%",r=>({clutch:0.01*r,mor:0.005*r}),{lv:38,br:1,nd:4,passive:1,feed:2}));
SKILLS.fah.push(SKX("fah_0b5",0,10,"fah_0b4",["elbow", "comp"],_rsch("fah","f_sky"),"เวทีของฟ้า","Lv.42 · ขั้นตำนาน · ทั้งสนามเป็นเวทีของเธอ · คะแนนศอก +16% แรงศอก +12% กำลังใจมีผล +2%",r=>({pts:{elbow:0.16*r},dmg:{elbow:0.12*r},mor:0.02*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_1a1",1,6,"f_heaven",["punch", "stamina"],_rsch("fah","f_heaven"),"หมัดชุดเจ็ดดอก","Lv.26 · บุกไม่หยุด · ชุดยาวจนนับไม่ทัน · คะแนนหมัด +10% แรงหมัด +10% ใช้แรงน้อยลง 2%",r=>({pts:{punch:0.1*r},dmg:{punch:0.1*r},staSave:0.02*r}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_1a2",1,7,"fah_1a1",["stamina"],_rsch("fah","f_heaven"),"ปอดเหล็ก","ติดตัว · Lv.30 · ใช้แรงน้อยลง 1.5% ฟื้นแรง +3%",r=>({staSave:0.015*r,regen:0.03*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_1a3",1,8,"fah_1a2",["punch", "power"],_rsch("fah","f_heaven"),"บุกชนมุม","Lv.34 · บุกไม่หยุด · ไล่ต้อนจนติดมุม · แรงหมัด +16% หมัดแม่น +2%",r=>({dmg:{punch:0.16*r},hit:{punch:0.02*r}}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_1a4",1,9,"fah_1a3",["punch", "comp"],_rsch("fah","f_heaven"),"บุกจนคู่ชกกลัว","ติดตัว · หนุนสายยิ้มเยาะ · Lv.38 · เลือดต่ำแม่นขึ้น 1% สวนกลับ +0.6%",r=>({clutch:0.01*r,ctr:0.006*r}),{lv:38,br:0,nd:4,passive:1,feed:2}));
SKILLS.fah.push(SKX("fah_1a5",1,10,"fah_1a4",["punch", "stamina"],_rsch("fah","f_heaven"),"พายุไม่มีวันสงบ","Lv.42 · ขั้นตำนาน · บุกทั้งไฟต์แรงไม่ตก · แรงหมัด +18% คะแนนหมัด +10% ใช้แรงน้อยลง 4%",r=>({dmg:{punch:0.18*r},pts:{punch:0.1*r},staSave:0.04*r}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_1b1",1,6,"f_heaven",["punch", "comp"],_rsch("fah","f_heaven"),"หมัดเสี่ยงตาย","Lv.26 · บ้าบิ่นถึงที่สุด · ทุ่มหมดตัวในดอกเดียว · แรงหมัด +18% เลือดต่ำแม่นขึ้น 2%",r=>({dmg:{punch:0.18*r},clutch:0.02*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_1b2",1,7,"fah_1b1",["comp"],_rsch("fah","f_heaven"),"เลือดร้อน","ติดตัว · Lv.30 · เลือดต่ำแม่นขึ้น 1.2% แรงหมัด +1%",r=>({clutch:0.012*r,dmg:{punch:0.01*r}}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_1b3",1,8,"fah_1b2",["punch", "dur"],_rsch("fah","f_heaven"),"แลกหมัดไม่ถอย","Lv.34 · บ้าบิ่นถึงที่สุด · แลกหมัดกลางวง · แรงหมัด +14% ป้องกันวงใน +0.3",r=>({dmg:{punch:0.14*r},clDef:0.3*r}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_1b4",1,9,"fah_1b3",["comp", "elbow"],_rsch("fah","f_heaven"),"บ้าพอจะศอก","ติดตัว · หนุนสายศอกพยัคฆ์ · Lv.38 · แรงศอก +3%",r=>({dmg:{elbow:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:0}));
SKILLS.fah.push(SKX("fah_1b5",1,10,"fah_1b4",["punch", "power"],_rsch("fah","f_heaven"),"ฟ้าผ่าฟ้า","Lv.42 · ขั้นตำนาน · หมัดที่ไม่มีใครกล้ารับ · แรงหมัด +24% หมัดแม่น +3% เลือดต่ำแม่นขึ้น 3%",r=>({dmg:{punch:0.24*r},hit:{punch:0.03*r},clutch:0.03*r}),{lv:42,br:1,nd:5}));
SKILLS.fah.push(SKX("fah_2a1",2,6,"f_star",["comp", "iq"],_rsch("fah","f_star"),"ยิ้มยั่วกลางยก","Lv.26 · ยั่วจนพัง · ยิ้มยั่วให้คู่ชกพุ่งเข้ามา · สวนกลับ +4% หลบ +1.5%",r=>({ctr:0.04*r,evade:0.015*r}),{lv:26,br:0,nd:1}));
SKILLS.fah.push(SKX("fah_2a2",2,7,"fah_2a1",["comp"],_rsch("fah","f_star"),"ยิ้มไม่หุบ","ติดตัว · Lv.30 · กำลังใจมีผล +0.5% สวนกลับ +0.6%",r=>({mor:0.005*r,ctr:0.006*r}),{lv:30,br:0,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_2a3",2,8,"fah_2a2",["comp", "counter"],_rsch("fah","f_star"),"ชี้หน้าแล้วสวน","Lv.34 · ยั่วจนพัง · ชี้หน้าแล้วสวนตอนพุ่งเข้า · สวนกลับ +3% แรงหมัดสวน +14%",r=>({ctr:0.03*r,ctrDmg:0.14*r}),{lv:34,br:0,nd:3}));
SKILLS.fah.push(SKX("fah_2a4",2,9,"fah_2a3",["comp", "elbow"],_rsch("fah","f_star"),"ยั่วให้เข้าระยะศอก","ติดตัว · หนุนสายศอกพยัคฆ์ · Lv.38 · ศอกแม่น +1.5% แรงหมัดสวน +2%",r=>({hit:{elbow:0.015*r},ctrDmg:0.02*r}),{lv:38,br:0,nd:4,passive:1,feed:0}));
SKILLS.fah.push(SKX("fah_2a5",2,10,"fah_2a4",["comp", "counter"],_rsch("fah","f_star"),"ราชินียิ้มเยาะ","Lv.42 · ขั้นตำนาน · ยิ้มเดียวทำคู่ชกเสียทรง · สวนกลับ +6% แรงหมัดสวน +16% หลบ +2%",r=>({ctr:0.06*r,ctrDmg:0.16*r,evade:0.02*r}),{lv:42,br:0,nd:5}));
SKILLS.fah.push(SKX("fah_2b1",2,6,"f_star",["comp", "dur"],_rsch("fah","f_star"),"ยิ้มทั้งที่เลือดออก","Lv.26 · ยิ่งเจ็บยิ่งยิ้ม · ยิ้มสู้ทั้งที่เจ็บ · เลือดต่ำแม่นขึ้น 4% ฟื้นแรง +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:1,nd:1}));
SKILLS.fah.push(SKX("fah_2b2",2,7,"fah_2b1",["comp"],_rsch("fah","f_star"),"ไม่ยอมล้มต่อหน้าแฟนคลับ","ติดตัว · Lv.30 · เลือดต่ำแม่นขึ้น 1.5%",r=>({clutch:0.015*r}),{lv:30,br:1,nd:2,passive:1}));
SKILLS.fah.push(SKX("fah_2b3",2,8,"fah_2b2",["comp", "stamina"],_rsch("fah","f_star"),"ลุกขึ้นมาโชว์ต่อ","Lv.34 · ยิ่งเจ็บยิ่งยิ้ม · ลุกขึ้นมาเหมือนไม่เป็นไร · ฟื้นแรง +15% กำลังใจมีผล +1.5%",r=>({regen:0.15*r,mor:0.015*r}),{lv:34,br:1,nd:3}));
SKILLS.fah.push(SKX("fah_2b4",2,9,"fah_2b3",["comp", "punch"],_rsch("fah","f_star"),"ยิ้มแล้วบุก","ติดตัว · หนุนสายบุกบ้าบิ่น · Lv.38 · ใช้แรงน้อยลง 1% คะแนนหมัด +3%",r=>({staSave:0.01*r,pts:{punch:0.03*r}}),{lv:38,br:1,nd:4,passive:1,feed:1}));
SKILLS.fah.push(SKX("fah_2b5",2,10,"fah_2b4",["comp", "stamina"],_rsch("fah","f_star"),"ดาวไม่มีวันดับ","Lv.42 · ขั้นตำนาน · ยกสุดท้ายสว่างที่สุด · เลือดต่ำแม่นขึ้น 6% ฟื้นแรง +18% กำลังใจมีผล +2%",r=>({clutch:0.06*r,regen:0.18*r,mor:0.02*r}),{lv:42,br:1,nd:5}));
SHARED_SKILLS.push(SKX("sh3a1",3,4,"sh_ko4",["power", "punch"],"build","ดอกแรกต้องจุก","Lv.16 · ปิดไว · เปิดด้วยดอกหนัก · แรงหมัด +10% แรงเตะ +6%",r=>({dmg:{punch:0.1*r,kick:0.06*r}}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3a2",3,5,"sh3a1",["power"],"build","แรงระเบิด","ติดตัว · Lv.20 · แรงหมัด +2% แรงเตะ +2%",r=>({dmg:{punch:0.02*r,kick:0.02*r}}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3a3",3,6,"sh3a2",["power", "speed"],"build","ชุดปิดจ็อบ","Lv.26 · ปิดไว · ชุดปิดที่ผสมทุกอาวุธ · แรงหมัด +10% แรงศอก +8% แรงเข่า +8%",r=>({dmg:{punch:0.1*r,elbow:0.08*r,knee:0.08*r}}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh3a4",3,7,"sh3a3",["power"],"build","แรงทุกอาวุธ","ติดตัว · หนุนสายสำนัก · Lv.32 · แรงหมัด +1.5% แรงเตะ +1.5% แรงศอก +1.5% แรงเข่า +1.5%",r=>({dmg:{punch:0.015*r,kick:0.015*r,elbow:0.015*r,knee:0.015*r}}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh3a5",3,8,"sh3a4",["power", "speed"],"build","น็อกในยกแรก","Lv.38 · ขั้นตำนาน · ไม่ต้องรอยกสอง · แรงหมัด +16% แรงเตะ +10% หมัดแม่น +2%",r=>({dmg:{punch:0.16*r,kick:0.1*r},hit:{punch:0.02*r}}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh3b1",3,4,"sh_ko4",["power", "dur"],"build","แลกแล้วชนะ","Lv.16 · หนักแต่ทน · ยอมโดนหนึ่ง เพื่อคืนหนัก · แรงหมัด +8% ป้องกันวงใน +0.4",r=>({dmg:{punch:0.08*r},clDef:0.4*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3b2",3,5,"sh3b1",["dur"],"build","กระดูกหนา","ติดตัว · Lv.20 · ป้องกันวงใน +0.2 เลือดต่ำแม่นขึ้น 0.8%",r=>({clDef:0.2*r,clutch:0.008*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh3b3",3,6,"sh3b2",["power", "clinch"],"build","เข่าศอกถล่ม","Lv.26 · หนักแต่ทน · เข่าศอกในวงใน · แรงเข่า +12% แรงศอก +12%",r=>({dmg:{knee:0.12*r,elbow:0.12*r}}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh3b4",3,7,"sh3b3",["power"],"build","แม่นทุกอาวุธ","ติดตัว · หนุนสายสำนัก · Lv.32 · หมัดแม่น +0.8% เตะแม่น +0.8% ศอกแม่น +0.8% เข่าแม่น +0.8%",r=>({hit:{punch:0.008*r,kick:0.008*r,elbow:0.008*r,knee:0.008*r}}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh3b5",3,8,"sh3b4",["power", "dur"],"build","รถถังนักน็อก","Lv.38 · ขั้นตำนาน · เดินหน้าแล้วไม่มีใครหยุด · แรงหมัด +12% แรงเข่า +10% ป้องกันวงใน +0.6",r=>({dmg:{punch:0.12*r,knee:0.1*r},clDef:0.6*r}),{lv:38,br:1,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh4a1",4,4,"sh_tc4",["iq", "foot"],"build","แต้มสวยทุกดอก","Lv.16 · เก็บทุกแต้ม · ออกอาวุธให้กรรมการเห็น · คะแนนหมัด +8% คะแนนเตะ +8%",r=>({pts:{punch:0.08*r,kick:0.08*r}}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4a2",4,5,"sh4a1",["iq"],"build","สายตากรรมการ","ติดตัว · Lv.20 · คะแนนเตะ +2% คะแนนหมัด +2%",r=>({pts:{kick:0.02*r,punch:0.02*r}}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4a3",4,6,"sh4a2",["iq", "clinch"],"build","เก็บแต้มวงใน","Lv.26 · เก็บทุกแต้ม · เก็บแต้มด้วยเข่าศอก · คะแนนเข่า +10% คะแนนศอก +10% ป้องกันวงใน +0.3",r=>({pts:{knee:0.1*r,elbow:0.1*r},clDef:0.3*r}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh4a4",4,7,"sh4a3",["iq"],"build","แต้มทุกอาวุธ","ติดตัว · หนุนสายสำนัก · Lv.32 · คะแนนหมัด +2% คะแนนเตะ +2% คะแนนศอก +2% คะแนนเข่า +2%",r=>({pts:{punch:0.02*r,kick:0.02*r,elbow:0.02*r,knee:0.02*r}}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh4a5",4,8,"sh4a4",["iq", "comp"],"build","ผู้ชนะบนใบคะแนน","Lv.38 · ขั้นตำนาน · ชนะขาดทุกยก · คะแนนหมัด +12% คะแนนเตะ +12% ความแม่นพื้นฐาน +1%",r=>({pts:{punch:0.12*r,kick:0.12*r},prep:0.01*r}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh4b1",4,4,"sh_tc4",["iq", "comp"],"build","เดินเกมตามแผน","Lv.16 · คุมเกม · ทำตามแผนทุกยก · คำสั่งพักยก +25% ความแม่นพื้นฐาน +0.8%",r=>({corner:0.25*r,prep:0.008*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4b2",4,5,"sh4b1",["iq"],"build","ฟังเสียงมุม","ติดตัว · Lv.20 · คำสั่งพักยก +6%",r=>({corner:0.06*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh4b3",4,6,"sh4b2",["iq", "foot"],"build","ปรับเกมกลางยก","Lv.26 · คุมเกม · เปลี่ยนแผนกลางยก · คำสั่งพักยก +20% หลบ +1.5% สวนกลับ +2%",r=>({corner:0.2*r,evade:0.015*r,ctr:0.02*r}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh4b4",4,7,"sh4b3",["iq"],"build","เชิงมวยรอบด้าน","ติดตัว · หนุนสายสำนัก · Lv.32 · ความแม่นพื้นฐาน +0.4% สวนกลับ +0.6%",r=>({prep:0.004*r,ctr:0.006*r}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh4b5",4,8,"sh4b4",["iq", "comp"],"build","เจ้าแห่งเกมห้ายก","Lv.38 · ขั้นตำนาน · คุมเกมได้ทั้งห้ายก · คำสั่งพักยก +40% ความแม่นพื้นฐาน +1.5% หลบ +2%",r=>({corner:0.4*r,prep:0.015*r,evade:0.02*r}),{lv:38,br:1,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh5a1",5,4,"sh_ir4",["stamina", "dur"],"build","หายใจลึก","Lv.16 · อึดไม่จบ · คุมลมหายใจระหว่างยก · ฟื้นแรง +15% ใช้แรงน้อยลง 2%",r=>({regen:0.15*r,staSave:0.02*r}),{lv:16,br:0,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5a2",5,5,"sh5a1",["stamina"],"build","ปอดนักวิ่ง","ติดตัว · Lv.20 · ฟื้นแรง +4% ใช้แรงน้อยลง 0.8%",r=>({regen:0.04*r,staSave:0.008*r}),{lv:20,br:0,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5a3",5,6,"sh5a2",["stamina", "foot"],"build","ห้ายกเต็มแรง","Lv.26 · อึดไม่จบ · ยกห้าเหมือนยกหนึ่ง · ฟื้นแรง +12% ใช้แรงน้อยลง 4%",r=>({regen:0.12*r,staSave:0.04*r}),{lv:26,br:0,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh5a4",5,7,"sh5a3",["stamina"],"build","แรงไม่ตก","ติดตัว · หนุนสายสำนัก · Lv.32 · ใช้แรงน้อยลง 1% ฟื้นแรง +3%",r=>({staSave:0.01*r,regen:0.03*r}),{lv:32,br:0,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh5a5",5,8,"sh5a4",["stamina", "dur"],"build","เครื่องยนต์ไม่ดับ","Lv.38 · ขั้นตำนาน · ยิ่งนานยิ่งได้เปรียบ · ฟื้นแรง +22% ใช้แรงน้อยลง 5%",r=>({regen:0.22*r,staSave:0.05*r}),{lv:38,br:0,nd:5,shared:1}));
SHARED_SKILLS.push(SKX("sh5b1",5,4,"sh_ir4",["dur", "guard"],"build","รับเต็มแรง","Lv.16 · ถึกไม่ล้ม · รับดอกหนักแบบไม่ถอย · ป้องกันวงใน +0.6 หลบ +1%",r=>({clDef:0.6*r,evade:0.01*r}),{lv:16,br:1,nd:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5b2",5,5,"sh5b1",["dur"],"build","ผิวหนังเหล็ก","ติดตัว · Lv.20 · ป้องกันวงใน +0.2 เลือดต่ำแม่นขึ้น 0.8%",r=>({clDef:0.2*r,clutch:0.008*r}),{lv:20,br:1,nd:2,passive:1,shared:1}));
SHARED_SKILLS.push(SKX("sh5b3",5,6,"sh5b2",["dur", "comp"],"build","ล้มแล้วลุก","Lv.26 · ถึกไม่ล้ม · ลุกขึ้นมาทุกครั้ง · เลือดต่ำแม่นขึ้น 4% ฟื้นแรง +10%",r=>({clutch:0.04*r,regen:0.1*r}),{lv:26,br:1,nd:3,shared:1}));
SHARED_SKILLS.push(SKX("sh5b4",5,7,"sh5b3",["dur"],"build","ใจไม่แตก","ติดตัว · หนุนสายสำนัก · Lv.32 · เลือดต่ำแม่นขึ้น 1% กำลังใจมีผล +0.5%",r=>({clutch:0.01*r,mor:0.005*r}),{lv:32,br:1,nd:4,passive:1,feed:"school",shared:1}));
SHARED_SKILLS.push(SKX("sh5b5",5,8,"sh5b4",["dur", "guard"],"build","ภูเขาไม่ล้ม","Lv.38 · ขั้นตำนาน · ไม่มีใครล้มภูเขาได้ · ป้องกันวงใน +1 เลือดต่ำแม่นขึ้น 5% หลบ +2%",r=>({clDef:1*r,clutch:0.05*r,evade:0.02*r}),{lv:38,br:1,nd:5,shared:1}));
/* end v1.89 skill roots */
/* v1.91.166: Baiyok has a tree now (xlove.js) but as a rival she still fights without skills, as she always has — the tree opens when she moves into the camp */
const skInert=f=>!!f&&f.id==="prod_B"&&f.camp!=="player";
const skillList=fid=>(SKILLS[fid]||[]).concat(SKILLS[fid]&&SKILLS[fid][0]&&SKILLS[fid][0].line!=null?SHARED_SKILLS:[]);
const sharedPathOf=f=>{for(const s of SHARED_SKILLS)if((f.skills&&f.skills[s.id])>0)return s.line;return null;};
// v1.83: full skill reset — every point spent comes back so a fighter can move to another line. First reset per fighter is free.
const skPointsSpent=f=>Object.values(f.skills||{}).reduce((a,b)=>a+(b||0),0)+Math.max(0,((f&&f.trLv)||1)-((f&&f.trBase)||1))*TR_COST;
const skResetCost=f=>Math.min(3,f.skReset||0)*10000;
function resetAllSkills(G,id){const f=G.F[id];if(!f||!f.skills)return 0;const n=skPointsSpent(f);if(!n)return 0;f.skills={};if(f.trLv)f.trLv=f.trBase||1;f.sp=(f.sp||0)+n;f.equip=[];f.skReset=(f.skReset||0)+1;return n;}
function resetSharedPath(G,id){const f=G.F[id];if(!f||!f.skills)return false;let n=0;for(const s of SHARED_SKILLS){n+=f.skills[s.id]||0;delete f.skills[s.id];}if(!n)return false;f.sp+=n;if(Array.isArray(f.equip))f.equip=f.equip.filter(k=>!k.startsWith("sh_"));return n;}
// v1.12: a deep bond unlocks each heroine's signature move (bond 60+, player's camp only)
/* v1.87: every girl has two innate traits — the player picks one on the skill page */
const TRAITS={
 kati:[{id:"grit",name:"ความมุ่งมั่น",desc:"ซ้อมจริงจังทุกสัปดาห์ สะสมโบนัสไว้ใช้วันชก แม่นขึ้น หลบดีขึ้น และเลือดเริ่มต้นมากขึ้น สะสมได้สูงสุด +10%"},{id:"surge",name:"พลังฮึด",desc:"ซ้อมได้ผลเร็วขึ้น 15% แต่ล้าเร็วขึ้น 5%"}],
 mali:[{id:"flow",name:"เคลื่อนไหวดั่งสายน้ำ",desc:"คู่ชกออกอาวุธโดนยากขึ้น 15% แต่มะลิแม่นลดลง 5%"},{id:"wits",name:"ไหวพริบพิเศษ",desc:"เมื่อเลือดต่ำกว่า 45% คู่ชกออกอาวุธโดนยากขึ้น 30%"}],
 rin:[{id:"eye",name:"สายตาพิเศษ",desc:"สวนกลับบ่อยขึ้น 30% แต่หลบได้น้อยลง 5%"},{id:"lib",name:"คลังความรู้",desc:"ถ้าดูเทปคู่ชกหรือซ้อมแก้ทางมาแล้ว ออกอาวุธแม่นขึ้น 8% และหนักขึ้น 10%"}],
 fah:[{id:"fury",name:"ยิ่งเจ็บยิ่งอันตราย",desc:"ยิ่งเลือดน้อย อาวุธยิ่งแม่นขึ้นสูงสุด 15% และหนักขึ้นสูงสุด 20%"},{id:"rock",name:"แข็งอย่างหิน",desc:"โดนอาวุธแล้วเสียแต้มน้อยลง 40% และเจ็บน้อยลง 10% แต่ออกอาวุธเบาลง 5%"}],
 ploy:[{id:"talent",name:"พรสวรรค์",desc:"ซ้อมได้ผลเร็วขึ้น 10% และล้าช้าลง 5%"},{id:"tempo",name:"จังหวะเทพ",desc:"ยกสุดท้าย หรือเมื่อเลือดต่ำกว่า 50% พลอยจะปรับจังหวะแก้ทางคู่ชกเองกลางไฟต์ อาวุธหลักของคู่ชกโดนยากขึ้น และอ่านเกมเขาขาด"}]};
let TRV={flowAtk:.95,flowDef:.85,wits:.7,witsHp:45,eyeDef:1.05,eyeCtr:1.3,lib:1.1,libHit:1.08,furyHit:.15,furyDmg:.2,rockAtk:.95,rockDef:.9,rockPts:.6};
const traitOf=f=>{const L=f&&TRAITS[f.id];if(!L)return null;return L.find(t=>t.id===f.trait)?f.trait:L[0].id;};
/* v1.91.45 (Man): hidden power has 10 levels, 5 skill points each — Lv.3 = the old full strength, then a little more each level (Lv.10 = 135%). Old saves start at Lv.1. Rivals (not in our camp) fight at the old strength */
const TR_MAX=10,TR_COST=5,TR_K=[.6,.8,1,1.1,1.2,1.3,1.4,1.5,1.6,1.7]; /* v1.91.80 (Man): past Lv.3 each level adds 10% (was 5%) — Lv.10 = 170% — so points there are worth about as much as on moves */
const traitLv=f=>clamp(Math.round((f&&f.trLv)||1),1,TR_MAX);
const traitK=f=>!f||f.camp!=="player"?1:TR_K[traitLv(f)-1];
const trm=(m,S)=>1+(m-1)*(S&&S.trk!=null?S.trk:1);
const isLvPerk=f=>!!(f&&f.pfx&&f.camp==="player"&&!TRAITS[f.id]&&hasTree(f.id)); /* a joined regional champion's signature perk levels like a hidden power */
function traitBlock(f){if(!f||!TRAITS[f.id]||f.camp!=="player")return "none";if(traitLv(f)>=TR_MAX)return "max";if((f.sp||0)<TR_COST)return "sp";return "";}
function traitUp(G,id){const f=G.F[id];if(traitBlock(f))return false;f.trLv=traitLv(f)+1;f.sp-=TR_COST;return true;}
const SIGNATURE={kati:{name:"ศอกกลับใจศิริชัย",desc:"ความสนิท ♥ Lv.7+ · ศอกแรง +15% · ตอนเลือดต่ำแม่นขึ้นอีก 3%",fx:{dmg:{elbow:.15},clutch:.03}},
  mali:{name:"เตะดอกมะลิบาน",desc:"ความสนิท ♥ Lv.7+ · เตะแม่น +3% · ฟื้นแรงระหว่างยก +15%",fx:{hit:{kick:.03},regen:.15}},
  rin:{name:"สมการชนะ",desc:"ความสนิท ♥ Lv.7+ · คำสั่งพักยกได้ผล +30% · สวนกลับ +3%",fx:{corner:.3,ctr:.03}},
  ploy:{name:"กำแพงพยัคฆ์",desc:"ความสนิท ♥ Lv.7+ · หลบ/รับ +2% · ป้องกันวงใน +1",fx:{evade:.02,clDef:1}},
  fah:{name:"พายุฟ้าคำราม",desc:"ความสนิท ♥ Lv.7+ · หมัดแรง +12% · ใช้แรงน้อยลง 6%",fx:{dmg:{punch:.12},staSave:.06}}};
const hasSignature=f=>!!SIGNATURE[f.id]&&f.camp==="player"&&(f.bond||0)>=60;
function skillMods(f){const m={hit:{},pts:{},dmg:{},ctr:0,ctrDmg:0,clutch:0,regen:0,mor:0,evade:0,corner:0,prep:0,clDef:0,staSave:0,sprawl:0,tdTry:0,gnp:0,sub:0};
  if(hasSignature(f)){const e=SIGNATURE[f.id].fx;for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  {const T=f.camp==="player"&&TRAITS[f.id]&&TRAITS[f.id][0].fx?TRAITS[f.id].find(t=>t.id===traitOf(f)):null;const e=T?T.fx:f.pfx,pk=T?traitK(f):1;if(e){for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w]*pk;else m[k]+=e[k]*pk;}}} /* v1.90: a regional champion's own perk */
  const list=skInert(f)?[]:skillList(f.id);if(!list.length||!f.skills)return m;const eq=equipped(f);
  for(const sk of list){if(!sk.passive&&!eq.includes(sk.id))continue;const r=f.skills[sk.id]||0;if(!r)continue;const e=sk.fx(r);
    for(const k in e){if(typeof e[k]==="object")for(const w in e[k])m[k][w]=(m[k][w]||0)+e[k][w];else m[k]+=e[k];}}
  return m;}
const MAX_LV=99; // v1.82.3: level cap lifted (was 10); past Lv.10 each level costs more and raises potential a little
const xpNeed=lvl=>50+lvl*30+Math.max(0,lvl-10)*20;
const lvBeyond=f=>{if(f.lvl>10)f.potential=Math.min(21,(f.potential||14)+.12);};
function gainXP(G,f,x){if(!f.canon)return;if(f.camp==="player"&&G.fac&&G.fac.ring)x=Math.round(x*(1+G.fac.ring*.15));f.xp+=x;f.xpGain=(f.xpGain||0)+x;
  while(f.lvl<MAX_LV&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;f.sp+=SP_PER_LV(f);lvBeyond(f);if(f.camp==="player"){G.levelUps=G.levelUps||[];G.levelUps.push(f.id);}}}
const skillDef=(fid,sk)=>skillList(fid).find(s=>s.id===sk);
// v1.29: stat requirements scale from each fighter's starting stats, so every line asks for real training
const hasTree=fid=>!!(SKILLS[fid]&&SKILLS[fid][0]&&SKILLS[fid][0].line!=null);
const SP_PER_LV=f=>hasTree(f.id)?3:1;
/* v1.91.73 (Man): a girl who levelled outside our camp (rival/NPC weeks, Ploy's Lv.5 and Fah's Lv.3 start) never got her skill points —
   make sure every skill-tree fighter has earned at least 3 per level beyond Lv.1 (points she already has or spent are kept) */
/* v1.91.80 (Man): every 4 weeks a light record of each opponent's numbers (ovr, punch, kick, knee/elbow, guard, endurance x10; 14 points ≈ a year) — Rin reads it with a tape */
function oppRow(a){return [ovr(a),a.punch,a.kick,(a.knee+a.elbow)/2,(a.guard+a.counter)/2,(a.stamina+a.dur)/2].map(x=>Math.round(x*10));}
function oppHistTick(G,force){const w=gameWeek(G);if(w%4&&!force)return;G.oppHist=G.oppHist||{};for(const f of Object.values(G.F)){if(f.camp==="player"||!f.a)continue;
  const H=G.oppHist[f.id]=G.oppHist[f.id]||[];if(H.length&&H[H.length-1][0]===w)continue;H.push([w,...oppRow(f.a)]);if(H.length>14)H.splice(0,H.length-14);}}
function spFloor(f){if(!f||!hasTree(f.id))return 0;const need=SP_PER_LV(f)*Math.max(0,(f.lvl||1)-1),have=(f.sp||0)+(typeof skPointsSpent==="function"?skPointsSpent(f):0);
  if(have>=need)return 0;f.sp=(f.sp||0)+(need-have);return need-have;}
// thresholds are written in "weeks of focused training" and converted with each fighter's measured growth (8 / 14 weeks of the best programme)
const GROW={"kati":{"punch":[3.1,4.8],"counter":[2.6,4.5],"power":[1.8,3.2],"speed":[1.7,2.7],"kick":[3.5,5.6],"foot":[2.1,3.3],"knee":[3.5,5.9],"clinch":[3.7,5.9],"stamina":[3.2,5],"elbow":[3.7,6.1],"guard":[3.9,6.2],"iq":[2.6,4.2],"comp":[1.3,2.2],"dur":[1.7,2.8]},"mali":{"punch":[2.9,4.6],"counter":[2.3,4.1],"power":[1.5,2.7],"speed":[1.4,2.3],"kick":[2.3,3.7],"foot":[1.6,2.5],"knee":[2.8,4.8],"clinch":[3.2,5],"stamina":[2,3.1],"elbow":[3.1,5.2],"guard":[3,4.8],"iq":[2,3.2],"comp":[1,1.7],"dur":[1.4,2.3]},"rin":{"punch":[2.7,4.3],"counter":[1.7,3.1],"power":[1.5,2.8],"speed":[1.6,2.6],"kick":[2.6,4.2],"foot":[1.4,2.2],"knee":[2.8,4.7],"clinch":[2.9,4.5],"stamina":[2.5,4],"elbow":[2.8,4.7],"guard":[2.6,4.1],"iq":[1.1,1.7],"comp":[0.8,1.3],"dur":[1.4,2.3]}};
const REQ_WK={main:[[0,2,4],[3,5,7],[3,5,7],[6,8,10],[8,10,12],[10,12,14],[11,12,13],[11,12,13],[12,13,14],[12,13,14],[13,14,15]],cross:[[0,0,0],[1,2,3],[0,0,0],[2,3,4],[3,4,5],[4,5,6],[4,5,6],[4,5,6],[5,6,7],[5,6,7],[6,7,8]],scale:{kati:1,mali:.85,rin:.7,ploy:.75,fah:.8}};
const REQ_EASE=.75; /* v1.91.45 (Man): stat gates ask for 25% less training, so skill points stop piling up */
GROW.ploy=GROW.ploy||GROW.kati;GROW.fah=GROW.fah||GROW.mali;
const REQ_ALIAS={}; /* v1.91.45: a joined champion is gated like her lineage partner (set by region.js) */
function skillReqs(fid,sk,rank){const d=skillDef(fid,sk),gid=REQ_ALIAS[fid]||fid;if(!d||!d.req||!CANON[gid]||!GROW[gid])return [];const base=CANON[gid].a,r=clamp(rank,1,3)-1,sc=REQ_WK.scale[gid]||1;
  return d.req.map((k,i)=>{const w=(i?REQ_WK.cross:REQ_WK.main)[d.row][r]*sc*REQ_EASE,g=GROW[gid][k]||[2,3.2];const up=w<=8?g[0]*w/8:g[0]+(g[1]-g[0])*(w-8)/6;return {k,v:Math.min(19.5,Math.floor((base[k]+up)*2)/2)};});} // v1.89: roots (rows 6-10) never ask for more than 19.5
// why a skill can't be raised right now ([] = ok). Each entry: {t:"sp"|"max"|"lv"|"pre"|"stat", ...}
function skillBlock(f,sk){const d=skillDef(f.id,sk),r=(f.skills&&f.skills[sk])||0,B=[];if(!d)return [{t:"none"}];
  if(r>=3)return [{t:"max"}];if((d.lv||1)>f.lvl)B.push({t:"lv",v:d.lv});
  if(d.pre&&!((f.skills[d.pre]||0)>0))B.push({t:"pre",id:d.pre});
  /* v1.91.45 (Man): build lines are no longer locked to one — the player mixes them freely */
  for(const q of skillReqs(f.id,sk,r+1))if(f.a[q.k]+1e-6<q.v)B.push({t:"stat",k:q.k,v:q.v,have:f.a[q.k]});
  if(f.sp<1)B.push({t:"sp"});return B;}
function learnSkill(G,id,sk){const f=G.F[id],d=skillDef(id,sk);if(!d||skillBlock(f,sk).length)return false;f.skills[sk]=(f.skills[sk]||0)+1;f.sp--;
  if(d.passive)return true;f.equip=equipped(f);if(!f.equip.includes(sk)&&f.equip.length<3)f.equip.push(sk);return true;}
function passiveMods(f){const m={fatKick:0,fatAll:0,lossXp:0,fightXp:0,moraleLoss:0};if(skInert(f))return m;for(const sk of skillList(f.id)){const r=(f.skills&&f.skills[sk.id])||0;if(!r||!sk.px)continue;const e=sk.px(r);for(const k in e)m[k]+=e[k];}return m;}
// v1.20: only 3 techniques are carried into the ring (player picks; rivals carry their best 3)
const MAX_EQUIP=3;
function equipped(f){const pas=k=>{const d=skillDef(f.id,k);return !!(d&&d.passive);};const has=k=>(f.skills&&f.skills[k])>0&&!pas(k);if(Array.isArray(f.equip))return f.equip.filter(has).slice(0,MAX_EQUIP);
  return skillList(f.id).filter(s=>has(s.id)).sort((a,b)=>f.skills[b.id]-f.skills[a.id]).slice(0,MAX_EQUIP).map(s=>s.id);}
function toggleEquip(G,id,sk){const f=G.F[id];const dd=skillDef(id,sk);if(!(f.skills[sk]>0)||(dd&&dd.passive))return false;let e=equipped(f);if(e.includes(sk))e=e.filter(x=>x!==sk);else{if(e.length>=MAX_EQUIP)return false;e.push(sk);}f.equip=e;return true;}

function baseFighter(id,d){return {id,name:d.name,full:d.full,div:d.div,camp:d.camp,color:d.color,potential:d.potential,wage:d.wage||0,fee:d.fee||0,
  canon:!!CANON[id],a:{...d.a},fatigue:10,injury:0,morale:60,trust:id==="kati"?40:20,bond:id==="kati"?20:0,
  rec:{w:0,l:0,d:0},form:[],plan:{preset:"balanced",intensity:"normal"},lastFight:-9,gains:{},met:id==="kati",
  xp:0,lvl:1,sp:0,skills:id==="ploy"?{kr_swing:2,captain:1}:id==="fah"?{tiger:1,reckless:1}:{},know:{}};}

// One clock for effects that can survive the end of a season.
const gameWeek=G=>((G.season||1)-1)*52+G.week;
const stableHash=s=>{let h=2166136261;for(const c of String(s)){h=Math.imul(h^c.charCodeAt(0),16777619);}return h>>>0;};
const CANON_BIRTH_DATES={kati:[13,3],mali:[2,4],rin:[9,8],ploy:[1,0],fah:[31,9]};
const CANON_AGES={kati:21,mali:20,rin:24,ploy:26,fah:22};
function fighterBirthdayWeek(id){const x=CANON_BIRTH_DATES[id];if(!x)return 1+stableHash(id+"birthday")%52;
  const start=new Date(2026,4,25),year=x[1]<4||x[1]===4&&x[0]<25?2027:2026;
  return Math.floor((new Date(year,x[1],x[0])-start)/604800000)+1;}
function syncFighterAges(G){
  const now=gameWeek(G);
  for(const f of Object.values(G.F||{})){if(!f)continue;
    if(!Number.isInteger(f.birthdayWeek)||f.birthdayWeek<1||f.birthdayWeek>52)
      f.birthdayWeek=fighterBirthdayWeek(f.id);
    if(!Number.isInteger(f.ageAnchorWeek)){f.ageAnchorWeek=now;f.ageAnchor=Number.isFinite(f.age)?f.age:
      (typeof PROFILES!=="undefined"&&PROFILES[f.id]?PROFILES[f.id].age:CANON_AGES[f.id]||18+stableHash(f.id+"age")%13);}
    const birthdays=Math.floor((now-f.birthdayWeek)/52)-Math.floor((f.ageAnchorWeek-f.birthdayWeek)/52);
    f.age=Math.max(0,f.ageAnchor+birthdays);
  }
}

// ---------- TRAINING ----------
const PRESETS={
  balanced:{name:"สมดุล",w:Object.fromEntries(ATTRS.map(([k])=>[k,.22])),load:2,desc:"พัฒนาทุกด้านเท่า ๆ กัน แต่ช้ากว่าโปรแกรมเน้น"},
  punch:{name:"เน้นหมัด",w:{punch:1,power:.5,counter:.5,speed:.3},load:2,desc:"สายมวยหมัด: หมัด พลัง สวนกลับ"},
  kick:{name:"เน้นเตะ",w:{kick:1,foot:.6,speed:.4},load:2,desc:"สายมวยเตะ: เตะ ฟุตเวิร์ก ความเร็ว"},
  knee:{name:"เข่า-คลินช์",w:{knee:1,clinch:1,stamina:.4},load:2.5,desc:"สายมวยเข่า: ล็อกคอ ตีเข่า ความอึด"},
  elbow:{name:"ศอก-วงใน",w:{elbow:1,clinch:.5,power:.5},load:2.5,desc:"สายมวยศอก: ระยะประชิด พลังระเบิด"},
  defense:{name:"ป้องกัน-สวน",w:{guard:1,counter:.8,iq:.6,comp:.3},load:1.5,desc:"สายมวยฝีมือ: การ์ด อ่านเกม ใจนิ่ง"},
  cond:{name:"ฟิตร่างกาย",w:{stamina:1,power:.6,speed:.6,dur:.5},load:3,desc:"วิ่ง กระโดดเชือก เวท เหนื่อยมาก"},
  prep:{name:"เตรียมไฟต์",w:{iq:.4,comp:.4},load:.7,desc:"ลดโหลด ซ้อมแผน (+ความพร้อมในไฟต์ถัดไป)"},
  rest:{name:"พักฟื้น",w:{},load:0,desc:"ลดความล้าเร็ว ขวัญกำลังใจดีขึ้น"},
};
const INTENSITY={light:{name:"เบา",g:.6,l:.6},normal:{name:"ปกติ",g:1,l:1},heavy:{name:"หนัก",g:1.4,l:1.5}};

// v1.32: one formula for "fatigue after this week", used by both the engine and the UI (training card, coach advice)
function fatigueAfter(G,f,preset,intensity){const fx=G.fac,clin=fx.clinic||0,hill=fx.hill||0,st=G.staff||[];let v=f.fatigue;
  if(st.includes("jan"))v-=4;if(fx.sauna)v-=3*fx.sauna;v=clamp(v,0,100);
  if(f.injury>0)return clamp(v-15-fx.recovery*5-fx.kitchen*2-clin*3,0,100);
  const p=PRESETS[preset],it=INTENSITY[intensity]||INTENSITY.normal;let load=p.load*it.l*7*(preset==="cond"?1-hill*.08-(st.includes("tong")?.1:0):1);
  {const pm=passiveMods(f);load*=clamp(1-pm.fatAll-(preset==="kick"?pm.fatKick:0),.4,1);}
  return clamp(v+load-(10+fx.recovery*5+fx.kitchen*2+clin*3)-(preset==="rest"?22:0),0,100);}
/* v1.90 limit break: a fighter's stat ceiling (20; 25 after the regional limit break, 30 later at national level).
   Past 20 a stat grows at LB_RATE of the normal pace, so the extra five points take years, not weeks. */
const stCap=f=>f&&f.cap>20?f.cap:20,LB_RATE=.6;
/* v1.91.12 (Man): past the 20 ceiling a point counts only LB_FIGHT in the ring (limit break still grows a fighter, but no longer runs away with fights) */
let LB_FIGHT=.35;const lbV=v=>v>20?20+(v-20)*LB_FIGHT:v;
function lbA(a){let o=null;for(const k in a)if(a[k]>20){o=o||{...a};o[k]=lbV(a[k]);}return o||a;}
function lbView(f){if(!f||!f.a)return f;const a=lbA(f.a);if(a===f.a)return f;const v=Object.create(f);v.a=a;v.__base=f;return v;}
function trainWeek(G,f,rng){
  const p=PRESETS[f.plan.preset],it=INTENSITY[f.plan.intensity];f.gains={};
  f.xpGain=0;
  const fx=G.fac,clin=fx.clinic||0,hill=fx.hill||0,st=G.staff||[];
  if(f.camp==="player")f.facPrep=(fx.video||0)*.008+(st.includes("wit")?.012:0);
  if(st.includes("jan"))f.fatigue=clamp(f.fatigue-4,0,100),f.morale=clamp(f.morale+1,0,100);
  if(fx.shrine)f.morale=clamp(f.morale+2*fx.shrine,0,100);
  if(fx.sauna)f.fatigue=clamp(f.fatigue-3*fx.sauna,0,100),f.morale=clamp(f.morale+fx.sauna,0,100);
  if(fx.hall)f.morale=clamp(f.morale+fx.hall,0,100);
  if(f.injury>0){f.injury--;if(f.injury>0&&clin&&rng()<.3*clin)f.injury--;f.fatigue=clamp(f.fatigue-15-G.fac.recovery*5-G.fac.kitchen*2-clin*3,0,100);gainXP(G,f,2);if(f.injury===0)G.log.push(`${f.name} หายบาดเจ็บแล้ว`);return;}
  gainXP(G,f,f.plan.preset==="rest"?3:Math.round(6+8*it.g));
  f.trainLog=(f.trainLog||[]).concat([f.plan.preset]).slice(-4);
  // v1.15: Kati's answer to talent — every honest training week builds "grit" that shows on fight night
  if(f.id==="kati"&&traitOf(f)==="grit"&&f.plan.preset!=="rest"&&f.plan.preset!=="prep")f.grit=Math.min(.1,(f.grit||0)+(f.plan.intensity==="heavy"?.004:f.plan.intensity==="normal"?.003:.0015));
  const pr=f.plan.preset,spec=st.some(k=>STAFF[k].pre===pr||STAFF[k].pre2===pr);
  const coach=dif(G).train*(1+st.length*.02+(G.fac.daeng-1)*.05+(spec?.1:0))+(pr==="cond"?hill*.2:0),fac=1+G.fac.gym*.1+(G.fac.lights||0)*.06+(G.fac.airgym||0)*.03;
  const ms=mainStyle(f),core=pr===ms?STYLE_ATTRS[ms]:[];
  const ready=1-f.fatigue/160,mot=.8+f.morale/250;
  for(const [k,w] of Object.entries(p.w)){
    // v1.18: training your own style's core weapons fights diminishing returns less (style mastery path)
    const dim=1-Math.pow(f.a[k]/(f.potential+(core.includes(k)?CK:1.5)),2.2);
    const g=.5*w*it.g*coach*fac*ready*mot*clamp(dim,.04,1)*(.75+rng()*.5)*(traitOf(f)==="surge"?1+.15*traitK(f):traitOf(f)==="talent"?1+.1*traitK(f):1)*(1+(f.drillBonus||0))*ytTrainMul(G,f);
    if(g>0){const g2=f.a[k]>=20?g*LB_RATE:g,b4=f.a[k];f.a[k]=Math.max(b4,Math.min(stCap(f),b4+g2));f.gains[k]=f.a[k]-b4;}
  }
  f.drillBonus=0;
  let load=p.load*it.l*7*(pr==="cond"?1-hill*.08-(st.includes("tong")?.1:0):1);{const pm=passiveMods(f);load*=clamp(1-pm.fatAll-(pr==="kick"?pm.fatKick:0),.4,1);}{const tr=traitOf(f);if(tr==="surge")load*=1+.05*traitK(f);if(tr==="talent")load*=1-.05*traitK(f);}
  f.fatigue=clamp(f.fatigue+load-(10+G.fac.recovery*5+G.fac.kitchen*2+clin*3)-(f.plan.preset==="rest"?22:0),0,100);
  if(f.plan.preset==="rest")f.morale=clamp(f.morale+3,0,100);
  // v1.38: a rest week is one week: once recovered she goes back to what she was training before
  if(pr!=="rest"&&pr!=="prep")f.lastWork=pr;
  else if(pr==="rest"&&f.fatigue<=25&&!f.injury){f.plan.preset=f.lastWork||"balanced";G.log.push(`${f.name}หายล้าแล้ว กลับไปซ้อม "${PRESETS[f.plan.preset].name}" ต่อ`);}
  f.prepBonus=f.plan.preset==="prep";
  {const nb=G.bookings.filter(b=>b.a===f.id&&b.week>=G.week).sort((x,y)=>x.week-y.week)[0];const sc=!!(nb&&G.scoutAbs&&G.scoutAbs[nb.b]!=null&&gameWeek(G)-G.scoutAbs[nb.b]<=8);const hit=!!(nb&&sc&&f.plan.preset===counterPreset(G.F[nb.b]));
   // v1.14: counter work done before fight week carries into fight night if that week is spent on fight prep
   f.counterPrep=hit||!!(nb&&nb.week===G.week&&f.plan.preset==="prep"&&f.counterPrep);}
  if(f.fatigue>70&&rng()<(f.fatigue-70)/110*(1-G.fac.kitchen*.2)*(G.waiBless&&gameWeek(G)<=G.waiBless?.5:1)){f.injury=2+Math.floor(rng()*2);G.log.push(`⚠ ${f.name} บาดเจ็บเล็กน้อยจากการซ้อมหนัก (พัก ${f.injury} สัปดาห์)`);
    if(f.plan.intensity==="heavy")f.trust=clamp(f.trust-4,0,100);}
  if(f.fatigue>80&&f.plan.intensity==="heavy")f.trust=clamp(f.trust-2,0,100);
  f.morale+=(60-f.morale)*.08;
}
function npcGrow(f,rng,rate){for(const [k] of ATTRS){if(f.a[k]<f.potential&&rng()<rate)f.a[k]=Math.min(20,f.a[k]+.5);} }
function condition(f){return clamp(Math.round(100-f.fatigue*.7-(f.injury?40:0)),0,100);}

// ---------- FIGHT ENGINE ----------
const PLANS={
  balanced:{name:"สมดุล",aggr:0,ctr:.04,evade:.02,desc:"ปรับตามสถานการณ์"}, /* v1.87.2: adapting on the fly is worth a little */
  pressure:{name:"บุกกดดัน",aggr:.25,w:{punch:1.3,elbow:1.3},sta:1.25,desc:"เดินหน้าไล่ต้อน กินแรงมาก"},
  counter:{name:"รอสวน",aggr:-.15,ctr:.12,desc:"ให้คู่ต่อสู้เข้ามาแล้วสวน"},
  outside:{name:"คุมระยะ",aggr:0,w:{kick:1.6},evade:.06,desc:"ใช้ลูกเตะ รักษาระยะห่าง"},
  clinch:{name:"เข้าคลินช์",aggr:.1,w:{knee:1.6,elbow:1.1},cl:.25,desc:"ปล้ำวงใน ตีเข่า"},
};
// v1.7 FM-style pre-fight tactics
const TAC={focus:{auto:"ตามสถานการณ์",punch:"หมัด",kick:"เตะ",knee:"เข่า",elbow:"ศอก"},
  pace:{steady:"คงที่ทั้งไฟต์",fast:"เปิดเร็ว ปิดเกมไว",late:"เก็บแรงไว้ยกท้าย"},
  target:{head:"เล่นหัว (แรงแต่เข้ายาก)",body:"เล่นลำตัว (ดูดแรงคู่ชก)",legs:"เตะขา (คู่ชกช้าลง)"}};
function aiTac(f,rng){const a=f.a;const w=[["punch",a.punch],["kick",a.kick],["knee",a.knee],["elbow",a.elbow]].sort((x,y)=>y[1]-x[1])[0][0];
  return {focus:rng()<.5?"auto":w,pace:["steady","steady","fast","late"][Math.floor(rng()*4)],target:["head","body","legs"][Math.floor(rng()*3)]};}
const CORNER={
  none:{name:"ทำตามแผนเดิม"},
  push:{name:"บุกเพิ่มแรงกดดัน",aggr:.2,sta:1.2,hint:"ได้คะแนนมากขึ้น แต่เหนื่อยเร็ว"},
  counter:{name:"รอดักสวน",aggr:-.1,ctr:.1,hint:"ปลอดภัยขึ้น ออกอาวุธน้อยลง"},
  range:{name:"รักษาระยะ เน้นเตะ",w:{kick:1.5},evade:.05,hint:"ดีกับคู่ที่ชอบวงใน"},
  clinch:{name:"เข้าคลินช์",w:{knee:1.5},cl:.2,hint:"ดีกับคู่ที่เตะเก่ง"},
  defend:{name:"ป้องกัน เก็บคะแนน",aggr:-.25,guard:.08,sta:.8,hint:"ใช้เมื่อนำอยู่ ฟื้นแรง"},
};
const W_INFO={punch:{imp:5,pts:2,cost:1.6},kick:{imp:6,pts:3,cost:2.4},knee:{imp:6.5,pts:3,cost:2.2},elbow:{imp:7.5,pts:2.5,cost:1.8}};
const TXT={
  punch:["ปล่อยหมัดตรงเข้าหน้า","ซัดหมัดฮุกเข้าคาง","ต่อยหมัดชุดเข้าเป้า","อัปเปอร์คัตสวนขึ้น"],
  kick:["เตะเข้าลำตัวดังสนั่น","เตะต่ำเข้าต้นขา","เตะก้านคอเฉียดหน้า","ถีบตรงกลางลำตัว"],
  knee:["ตีเข่าเข้าลิ้นปี่","ล็อกคอตีเข่าเข้าซี่โครง","กระโดดเข่าเข้ากลางลำตัว"],
  elbow:["สับศอกลงกลางหน้าผาก","เหวี่ยงศอกตัดเข้าโหนกแก้ม","ศอกกลับเฉียดคิ้ว"],
  miss:["หลบได้ทัน","ยกการ์ดรับไว้","ถอยออกนอกระยะ","เบี่ยงตัวหลบ"],
};
// v1.12: training the right counter for the next opponent pays off on fight night
let CTR_W=.12,CTR_READ=.1;
function oppTop(op){return [["punch",op.a.punch],["kick",op.a.kick],["knee",op.a.knee],["elbow",op.a.elbow]].sort((x,y)=>y[1]-x[1])[0][0];}
const COUNTER_OF={punch:"defense",kick:"knee",knee:"kick",elbow:"kick"};
// v1.15: the counter is read from the whole opponent, not just her top weapon
const COUNTER_WHY={defense:"หมัดหนัก ต้องการ์ดแน่นแล้วสวน",knee:"เตะคุมระยะ ต้องเข้าประชิดตัดลูกเตะ",kick:"ชอบวงใน ต้องเตะรักษาระยะ",elbow:"การ์ดหลวม ศอกวงในเข้าง่าย",cond:"ชกแบบกดดันไม่หยุด ต้องฟิตให้ทัน"};
function counterScores(op){const a=op.a;return {defense:(a.punch+a.power)/2,knee:a.kick*.9+(15-a.clinch)*.3,kick:(a.knee+a.clinch)/2,elbow:a.elbow*.6+(15-a.guard)*.6,cond:(a.stamina+a.power)/2*.88};}
function counterPreset(op){if(!op)return null;const S=counterScores(op);return Object.keys(S).sort((x,y)=>S[y]-S[x])[0];}
// v1.18 style mastery: once a fighter's own style weapon is good enough, it lands cleaner and harder (player camp)
const STYLE_MAIN={kati:"punch",mali:"kick",rin:"defense",ploy:"punch",fah:"elbow"}; /* v1.91.0: Ploy's mastery was on the knee while her Korat kit is all punches */
const STYLE_ATTRS={punch:["punch","power"],kick:["kick","foot"],knee:["knee","clinch"],elbow:["elbow","power"],defense:["guard","counter"]};
const STYLE_NAME={punch:"หมัด",kick:"เตะ",knee:"เข่า-คลินช์",elbow:"ศอก",defense:"ป้องกัน-สวน"};
function styleVal(f,s){const A=STYLE_ATTRS[s];return (f.a[A[0]]*2+f.a[A[1]])/3;}
function mainStyle(f){if(STYLE_MAIN[f.id])return STYLE_MAIN[f.id];return Object.keys(STYLE_ATTRS).sort((x,y)=>styleVal(f,y)-styleVal(f,x))[0];}
const MASTERY_AT=13,MK=2,CK=3.5;
/* v1.91.0 (Man) fight styles: every fighter has one, and each style beats two others and loses to two (a five-way wheel).
   The main heroines take it from the school line they've invested in most (skills ranked + those carried into the ring), so a build can change it;
   their home line is who they are. Everyone else takes it from their best weapon. */
const FSTYLE={power:"หมัดหนัก",pressure:"บุกกดดัน",counter:"รอสวน",footwork:"ฟุตเวิร์ก",inside:"วงใน"};
const FSTYLE_BEATS={power:["pressure","footwork"],pressure:["counter","inside"],counter:["power","footwork"],footwork:["pressure","inside"],inside:["counter","power"]};
const LINE_STYLE={thasao:["footwork","inside","counter"],chaiya:["pressure","footwork","counter"],lopburi:["counter","footwork","inside"],korat:["power","footwork","inside"],modern:["inside","pressure","power"]}; /* v1.91.2: every heroine's three lines can answer any style */
const HOME_STYLE={kati:"inside",mali:"footwork",rin:"counter",ploy:"power",fah:"pressure"};
const HOME_LINE={kati:1,mali:1,rin:0,ploy:0,fah:1};
/* v1.91.2: per-line kit offset so every line of every heroine stands about level (some lines' skills were much weaker or stronger than others) */
let LINE_KR={kati:[.052,.048,-.036],mali:[.091,-.081,.004],rin:[-.033,.011,-.022],ploy:[.07,-.037,-.033],fah:[.064,-.025,-.039],baibua:[-.006,.085,-.046],tabtim:[.086,-.021,-.033],alicia:[-.015,.025,-.029],chaba:[.036,-.112,.01]},LINE_K={kati:[.158,.088,.032],mali:[.018,.025,.031],rin:[.059,.08,.198],ploy:[-.103,.132,.038],fah:[-.134,-.139,-.061],baibua:[.131,.057,.016],tabtim:[-.066,.148,.048],alicia:[.022,.129,.15],chaba:[.054,.081,.003]}, /* v1.91.45 (Man: five equal, the build decides): retuned per line with all 27 builds (5 heroines + 4 joined champions × 3 school lines) fighting each other — LINE_KR fades in from Lv.25 to Lv.32 as the roots open */STY_PAIR={"inside>power":1.8}; /* v1.91.4: the heroine offset now lives here per line (HERO_K emptied) */
const STAT_STYLE={punch:"power",kick:"footwork",knee:"inside",elbow:"pressure",defense:"counter"};
/* v1.91.0 tuning (Man: Ploy strongest, Kati next, Mali/Rin/Fah level; each beats and loses to someone; any of them can win with the right build).
   Equal builds at Lv.18/25 (stats 20, home-line skills, 300 bouts each), v1.91.2: all five 48–53% vs the other four; vs any rival's home build each heroine has a line that wins 55–76%.
   STY_K: the style-wheel edge · MDEF: Rin's defense mastery (was .04/.06/.25 — it guarded every attack and made her win 78%) · MWPN: weapon mastery
   HERO_K: heroine kit offset on landing (player camp) · HERO_D: Ploy hits harder rather than more often, so a counter-puncher can still read her */
let STY_POW=0,STY_K=.11,MDEF={ev:.015,ctr:.025,cd:.1},MWPN={hit:.05,dmg:.2},HERO_K={},HERO_D={ploy:.11}; /* v1.91.2 (Man): all five level — the build, training, level and bonuses decide */
/* the school line a main heroine has built most (skill ranks + skills carried into the ring); -1 = none yet → her home line */
function heroLine(f){if(!HOME_STYLE[f.id])return -1;const sc=[0,0,0],eq=f.skills?equipped(f):[];for(const s of skillList(f.id)){const r=(f.skills&&f.skills[s.id])||0;if(!r||!s.school||s.school==="build"||s.line>2)continue;sc[s.line]+=r+(eq.includes(s.id)?1:0);}
  const h=HOME_LINE[f.id];let best=h,bv=sc[h];for(let i=0;i<3;i++)if(sc[i]>bv){best=i;bv=sc[i];}return best;}
function fightStyle(f){if(!f)return "power";if(f.fstyle)return f.fstyle;if(f.rgSty&&f.camp!=="player")return f.rgSty; /* v1.91.9: regional opponents fight in a style their story sets */const home=HOME_STYLE[f.id];
  if(home){const L=heroLine(f),sch=(skillList(f.id).find(s=>s.school&&s.school!=="build")||{}).school;return (LINE_STYLE[sch]||[])[L]||home;}
  const statStyle=STAT_STYLE[Object.keys(STYLE_ATTRS).sort((x,y)=>styleVal(f,y)-styleVal(f,x))[0]]||"power";
  if(f.camp==="player")return statStyle; /* your own non-heroine fighters follow their training */
  /* v1.91.7 (Man): every other fighter keeps one style for life, set the first time she is seen — her best weapon counts double, so the field spreads
     across all five (before, late-game NPCs drifted to ~half power punchers as punching became their best stat) */
  if(!f.fstyleN){const K=Object.keys(FSTYLE),w=K.map(k=>k===statStyle?2:1),tot=w.reduce((a,b)=>a+b,0);let r=((stableHash(String(f.id))>>>0)%1000)/1000*tot,pick=K[0];for(let i=0;i<K.length;i++){r-=w[i];if(r<0){pick=K[i];break;}}f.fstyleN=pick;}
  return f.fstyleN;}
/* v1.91.5 (Man) hot-form titles: win HOT_AT in a row and the fighter earns her title until she loses or draws. Each is worth roughly +3–5% to win */
const HOT_AT=5;
const HOT_TITLES={ploy:{name:"อัจฉริยะไร้พ่าย",desc:"แม่นขึ้น หลบดีขึ้นนิดหน่อย",prep:.028,ev:.012},kati:{name:"ใจเหล็กท่าเสา",desc:"เลือดเริ่มต้นมากขึ้น ยืนระยะได้นานขึ้น",hp:14,prep:.012},
  mali:{name:"สายน้ำไชยา",desc:"หลบดีขึ้น",ev:.035},rin:{name:"ทฤษฎีไร้ที่ติ",desc:"สวนกลับบ่อยขึ้น อ่านทางขาดขึ้น",ctr:.08,prep:.01},fah:{name:"เสือไฟลุก",desc:"ออกอาวุธหนักขึ้น",dmg:.12},
  _:{name:"ฟอร์มร้อนแรง",desc:"แม่นขึ้นนิดหน่อย",prep:.035}};
const hotForm=f=>!!f&&f.camp==="player"&&(f.wst||0)>=HOT_AT;
const hotTitle=f=>HOT_TITLES[f&&f.id]||HOT_TITLES._;
function styleEdge(a,b){return FSTYLE_BEATS[a].includes(b)?1:FSTYLE_BEATS[b].includes(a)?-1:0;}
/* v1.91.9: the style-wheel edge, kept as a removable bonus so a fighter can switch style mid-fight (Ladda's forms) */
function styleApply(SA,SB){for(const S of [SA,SB])if(S.styB){S.prep-=S.styB.p;S.sk.evade-=S.styB.e;S.sk.ctr-=S.styB.c;S.styB=null;S.styleUp=0;}
  const e=styleEdge(SA.fst,SB.fst),W=e>0?SA:e<0?SB:null;if(!W)return;const L=W===SA?SB:SA,k=STY_K*(STY_PAIR[W.fst+">"+L.fst]||1);
  W.styleUp=1;W.styB={p:k*.6,e:k*.4,c:W.fst==="counter"?k*.5:0};W.prep+=W.styB.p;W.sk.evade+=W.styB.e;W.sk.ctr+=W.styB.c;}
/* Ladda's "read": a form that switches to the style beating yours — more likely the more fights of yours are on tape; Fah's instinct can't be read */
const READ_K=60,READ_MAX=.85;
function readStyle(F,S,O,fall){if(S.readSty)return S.readSty;const n=O.f.rec?(O.f.rec.w||0)+(O.f.rec.l||0)+(O.f.rec.d||0):0,p=O.f.id==="fah"?0:Math.min(READ_MAX,n/READ_K),r=mulberry32((F.seed||1)+911);
  const beat=Object.keys(FSTYLE_BEATS).filter(k=>FSTYLE_BEATS[k].includes(O.fst));S.readHit=r()<p;const lose=(FSTYLE_BEATS[O.fst]||[]);S.readSty=S.readHit?beat[Math.floor(r()*beat.length)]:lose.length?lose[Math.floor(r()*lose.length)]:fall||S.fst; /* a wrong read leaves her in a style yours beats */return S.readSty;}
function mastery(f){if(f.camp!=="player")return 0;const v=styleVal(f,mainStyle(f));return v<MASTERY_AT?0:.3+.7*clamp((v-MASTERY_AT)/4,0,1);}
/* v1.83.3: veterans past the stat ceiling (20) keep improving through ring craft instead — f.vet is measured in stat points */
const VET_FX={hit:.08,dmg:.25,ev:.06}; // calibrated: vet 1 ≈ +1 stat point
/* v1.90.13 "the more she bleeds, the harder she gets" (Ladda): f.hpX adds starting hp; f.hurt={def,ev,sta,rec,rnd} scale with how much hp is gone (0 fresh → 1 empty) */
const hurtW=s=>s&&s.f.hurt?clamp(1-s.hp/(s.hp0||100),0,1):0;
function fightSide(f,plan,rng){const sk=skillMods(f);{const m=mastery(f)*MK,s=mainStyle(f);if(m){if(s==="defense"){sk.evade+=MDEF.ev*m;sk.ctr+=MDEF.ctr*m;sk.ctrDmg+=MDEF.cd*m;}else{const w=s;sk.hit[w]=(sk.hit[w]||0)+MWPN.hit*m;sk.dmg[w]=(sk.dmg[w]||0)+MWPN.dmg*m;sk.pts[w]=(sk.pts[w]||0)+.1*m;}}}if(f.aura)sk.evade+=f.aura*.5;if(f.vet>0){const v=f.vet;for(const w of ["punch","kick","knee","elbow"]){sk.hit[w]=(sk.hit[w]||0)+VET_FX.hit*v;sk.dmg[w]=(sk.dmg[w]||0)+VET_FX.dmg*v;}sk.evade+=VET_FX.ev*v;}const gr=f.id==="kati"&&traitOf(f)!=="grit"?0:(f.grit||0)*(f.id==="kati"?traitK(f):1);if(gr)sk.evade+=gr*.4;
  const hp0=100-(f.injury?15:0)+Math.round(gr*30)+(f.hpX||0),tl=f.trainLog||[];const brk=STA.brk+f.a.stamina*STA.brkK+(tl[tl.length-1]==="prep"?STA.prep:0)+(tl.slice(-2).includes("cond")?STA.cond:0)+(f.id==="fah"?STA.fah:0)+(f.camp==="player"&&typeof lovePerk==="function"?lovePerk(f).brk:0); /* Fah: hot-blooded and tireless, gets her breath back faster */
  return {f,id:f.id,name:f.name,plan,instr:"none",hp:hp0,hp0,brk,staMax:STA_TANK(f),sta:clamp(100-f.fatigue*.4,40,100),pts:0,rpts:0,kd:0,cuts:0,
    thrown:0,landed:0,dmgDealt:0,legs:0,tac:{focus:"auto",pace:"steady",target:"head"},sk,prep:(f.camp==="player"?(HERO_K[f.id]||0)+(LINE_K[f.id]?(LINE_K[f.id][heroLine(f)]||0)+(LINE_KR[f.id]?(LINE_KR[f.id][heroLine(f)]||0)*clamp(((f.lvl||1)-25)/7,0,1):0):0):0)+(f.prepBonus?.04:0)+(f.counterPrep?.05:0)+sk.prep+(f.aura||0)+gr+(f.labPrep||0)+(f.camp==="player"?(f.facPrep||0):0)+(f.camp==="player"&&typeof lovePerk==="function"?lovePerk(f).prep:0),counterPrep:!!f.counterPrep,trait:traitOf(f),trk:traitK(f),mor:(f.morale-60)/400+sk.mor,wl:{punch:0,kick:0,knee:0,elbow:0}};
}
function aiPlan(f,opp,rng){
  const a=f.a;const opts=[["balanced",1],["pressure",(a.punch+a.elbow+a.power)/30],["counter",(a.counter+a.iq)/22],["outside",(a.kick+a.foot)/22],["clinch",(a.knee+a.clinch)/22]];
  return pickW(rng,opts.map(([k,v])=>[k,Math.pow(v,3)]));
}
function newFight(fa,fb,o){fa=lbView(fa);fb=lbView(fb);
  const rng=mulberry32(o.seed);const SA=fightSide(fa,o.planA||aiPlan(fa,fb,rng),rng),SB=fightSide(fb,o.planB||aiPlan(fb,fa,rng),rng);
  // v1.20: a canon rival fights a level above herself on final night
  if(o.tier==="final"){for(const S of [SA,SB])if(S.f.canon&&S.f.camp==="rival")S.prep+=.05;}
  /* v1.87: counter-training reads the opponent's best weapon — it lands less often on fight night */
  if(SA.counterPrep){SA.ctrW=oppTop(fb);SB.prep-=CTR_READ;}if(SB.counterPrep){SB.ctrW=oppTop(fa);SA.prep-=CTR_READ;}
  for(const S of [SA,SB])if(hotForm(S.f)){const T=hotTitle(S.f);S.hot=1;S.prep+=T.prep||0;S.sk.evade+=T.ev||0;S.sk.ctr+=T.ctr||0;S.titleD=T.dmg||0;if(T.hp){S.hp+=T.hp;S.hp0+=T.hp;}} /* v1.91.5 hot-form title */
  SA.fst=fightStyle(fa);SB.fst=fightStyle(fb);styleApply(SA,SB);
  for(const [S,O] of [[SA,SB],[SB,SA]])if(S.fst==="power")O.sk.ctr+=STY_POW; /* big swings leave openings: everyone counters a power puncher a little more, a counter-puncher most of all */ /* v1.91.0 style wheel: the favoured side lands cleaner, slips more, and a counter-puncher counters more */
  /* v1.87 traits: Rin's library needs a scouted or counter-trained opponent */
  const scout=(me,op)=>me.counterPrep||!!(me.f.camp==="player"&&typeof G!=="undefined"&&G&&G.scoutAbs&&G.scoutAbs[op.id]!=null&&gameWeek(G)-G.scoutAbs[op.id]<=8);
  for(const [S1,S2] of [[SA,SB],[SB,SA]])if(S1.trait==="lib"&&scout(S1,S2.f))S1.libOn=1;
  if(fa.ployNotes&&fb.id==="ploy")SA.prep+=.025;if(fb.ployNotes&&fa.id==="ploy")SB.prep+=.025; // Rin's notebook on Ploy
  if(o.gprepA){SA.gprep=o.gprepA;if(o.gprepA==="strike")SA.prep+=.03;} /* v1.91.20: the stand-and-trade plan sharpens the strikes instead */
  return {seed:o.seed,rng,rounds:o.rounds,round:0,tier:o.tier,A:SA,B:SB,open:!!(fa.grap||fb.grap),
    cards:[],logs:[],over:false,result:null,forceRage:!!o.forceRage};
}
function setTactics(F,tA){F.A.tac={focus:"auto",pace:"steady",target:"body",...(tA||{})};F.B.tac=aiTac(F.B.f,F.rng);}
/* v1.87.2: the fight plan still matters, but a little less than before (PLAN_K scales every plan effect) */
let PLAN_K=.75;
function mods(s,F){const p0=PLANS[s.plan],c=CORNER[s.instr]||{};const cm=1+((s.sk&&s.sk.corner)||0);const K=PLAN_K;
  const p={aggr:(p0.aggr||0)*K,ctr:(p0.ctr||0)*K,evade:(p0.evade||0)*K,cl:(p0.cl||0)*K,sta:p0.sta?1+(p0.sta-1)*K:undefined,w:p0.w?Object.fromEntries(Object.entries(p0.w).map(([k,v])=>[k,1+(v-1)*K])):undefined};
  const w={punch:1,kick:1,knee:1,elbow:1};if(p.w)for(const k in p.w)w[k]*=p.w[k];if(c.w)for(const k in c.w)w[k]*=1+(c.w[k]-1)*cm;
  const t=s.tac||{};if(t.focus&&t.focus!=="auto")w[t.focus]*=1.7;
  let pa=0,ps=1;if(F){const r=F.round,n=F.rounds;if(t.pace==="fast"){pa=r<=2?.15:-.08;ps=r<=2?1.15:1;}if(t.pace==="late"){pa=r>=n-1?.2:-.1;ps=r>=n-1?1.1:.85;}}
  return {aggr:(p.aggr||0)+(c.aggr||0)*cm+pa,ctr:(p.ctr||0)+(c.ctr||0)*cm,evade:(p.evade||0)+(c.evade||0)*cm,cl:(p.cl||0)+(c.cl||0)*cm,guard:(c.guard||0)*cm,sta:(p.sta||1)*(c.sta?1+(c.sta-1)*cm:1)*ps,w};}
// v1.10 corner care: what the fighter needs this break, in order (water · massage · wipe · cheer)
const CARE={water:{icon:"💧",name:"ให้น้ำ"},rub:{icon:"💆",name:"นวดน้ำมันมวย"},wipe:{icon:"🧻",name:"เช็ดหน้า"},cheer:{icon:"💪",name:"ให้กำลังใจ"}};
function careNeeds(F){const A=F.A,B=F.B,r=mulberry32(F.seed+F.round*977);const sc=k=>({water:100-A.sta,rub:(A.sta<60?20:0)+B.rw.kick*4,wipe:B.rdmg*1.5+B.rlanded*3,cheer:(F.cards.reduce((s,c)=>s+c[1]-c[0],0))*25+(A.hp<50?20:0)}[k])+r()*30;
  return Object.keys(CARE).sort((a,b)=>sc(b)-sc(a)).slice(0,3);}
// v1.89.1: corner care on one scale — a missed mini-game still gives 60% of a normal corner, coach Daeng / quick fights give a normal corner,
// a great mini-game is a small bonus on top (not the thing that decides the fight)
const careMult=q=>q<=1?STA.cNorm*(STA.cMin+(1-STA.cMin)*Math.max(0,q)):STA.cNorm*(1+(q-1)*STA.cBonus);
const CARE_STA=20; /* v1.91.60: the corner refills the skill "mana" — perfect +20, two of three +10 (was +9/+4.5) */
function applyCare(F,q){const A=F.A;staAddPts(A,q*CARE_STA);A.hp=clamp(A.hp+q*4,0,Math.max(100,A.hp0||100));A.careMor=q>=1?.02:0;return q;} /* v1.89.1: back to the single order puzzle — a small bonus on top of the normal between-round recovery (as in v1.87.5) */
function throwTowel(F){if(F.over)return;F.over=true;F.result={win:"B",type:"มุมโยนผ้ายอมแพ้",round:F.round,towel:true};}
function aiCorner(F,me,op){ if(F.round===0)return "none";
  const lead=me.pts-op.pts;if(me.sta<35)return "defend";if(lead>4)return "defend";if(lead<-3)return "push";
  if(op.f.a.kick>op.f.a.knee+2)return "clinch";if(op.f.a.clinch>op.f.a.kick+2)return "range";return "none";}
// v1.19: a round is simulated exchange by exchange so a skill pressed mid-round changes what comes next
// a stat far above the fighter's own average gives back less accuracy/speed (power keeps its punch, and a power build lands more flash KOs)
const BAL={flashPow:.025,specPow:0,wdef:.15,spec:4,specK:.4,clGap:9,clK:.03,repFree:.5,repPen:.7,chkBase:5,chkK:.016,chkMax:.3,chkLegs:4,chkSta:5,chkHp:1.2};
function effA(s,k){const a=s.f.a,o=s.ov!=null?s.ov:(s.ov=ovr(a)),v=a[k],c=o+BAL.spec;return v>c?c+(v-c)*BAL.specK:v;}
const EX_PER_ROUND=12;
function roundBegin(F){F.round++;F.gnd=null;
  /* v1.90: a boss changes form every round (Ladda: hood → no hood → blood mode) */
  for(const s of [F.A,F.B])if(s.f.phases){const P=s.f.phases[(s.f.phR?s.f.phR[Math.min(F.round,s.f.phR.length)-1]:Math.min(F.round,s.f.phases.length))-1];s.phNew=!s.ph||s.ph.n!==P.n;s.ph=P;
    if(s.phNew&&P.fst){const o=s===F.A?F.B:F.A;s.fst=P.fst==="read"?readStyle(F,s,o,P.fall):P.fst;styleApply(F.A,F.B);}
    if(P.fst==="read"&&s.readSty&&!s.readHit)s.ph={...P,hit:0,ev:0,ini:0};} /* a wrong read also takes the edge off her fast form: she was fast because she knew */ /* v1.91.9: 5-round bosses hold a form over several rounds (phR) and each form can fight in its own style */F.A.rpts=0;F.B.rpts=0;F.kd0={A:F.A.kd,B:F.B.kd};F.ex=0;F.rlog=[];
  F.mA=mods(F.A,F);F.mB=mods(F.B,F);for(const s of [F.A,F.B]){s.rw={punch:0,kick:0,knee:0,elbow:0};s.rtw={punch:0,kick:0,knee:0,elbow:0};s.rdmg=0;s.rthrown=0;s.rlanded=0;s.skRound=false;}}
const roundDone=F=>F.over||F.ex>=EX_PER_ROUND;
function fightRound(F){roundBegin(F);while(!roundDone(F))fightEx(F);return roundFinish(F);}
// ---------- active skills (v1.19) ----------
// every learned school skill: attack burst, guard burst or second wind — max one per round; since v1.91.60 a skill rests one round after use and costs stamina
function skillKind(sk){const e=sk.fx(1);const wk=e.hit||e.pts||e.dmg;if(wk)return {k:"atk",w:Object.keys(wk)[0]};if(e.evade||e.ctr||e.clDef||e.ctrDmg)return {k:"def"};return {k:"rec"};}
const SKILL_KIND_NAME={atk:"ไม้เด็ดโจมตี",def:"ตั้งรับสวนกลับ",rec:"เรียกแรงคืน"};
function fightSkills(s){if(s.f.nlsk)return s.f.nlsk.map(k=>({...k,r:3}));if(skInert(s.f))return [];const L=skillList(s.f.id),eq=equipped(s.f);return L.filter(k=>eq.includes(k.id)).map(k=>({...k,r:s.f.skills[k.id],...skillKind(k)}));}
// v1.89.6: classic mae mai / look mai techniques get called by name from the booth (keyed by skill id so it works in every language)
const MAEMAI={"ts_low":"l","ts_croc":"m","ts_ring":"l","ts_trunk":"m","kati_1a1":"l","kati_2b1":"m","kati_2b3":"m","cy_spin":"l","cy_erawan":"m","cy_gate":"l","mali_2a3":"m","lb_jab":"l","lb_kris":"m","lb_feint":"m","lb_giant":"m","lb_teep":"m","lb_fold":"l","rin_0b1":"m","rin_2b3":"m","kr_thunder":"m","kr_sweep":"l","p_wall":"l","ploy_1a3":"l","ploy_2a3":"m"};
function skillCall(F,s,sk){const k=MAEMAI[sk.id];if(!k)return `${s.name} ใช้ "${sk.name}"!`;const kn=k==="m"?"แม่ไม้มวยไทย":"ลูกไม้มวยไทย";
  const L=[`${kn}! ${s.name} ออกท่า "${sk.name}"!`,`"${sk.name}"! ${kn}แท้ ๆ จาก${s.name}!`,`${s.name} งัด${kn} "${sk.name}" ออกมาแล้วครับท่านผู้ชม!`];
  return L[((F.round||1)+(F.ex||0))%L.length];}
/* v1.91.60 (Man): skills cost stamina like mana — the higher the rank the more it costs; not enough stamina, no skill. The corner mini-game between rounds is how it comes back */
const SK_COST={atk:[8,11,14],td:[8,11,14],sub:[8,11,14],def:[5,7,9],rec:[0,0,0]}; /* sims (5 girls × 4 player tiers, live fight with a perfect corner): main-game/belt bouts within 1–4 pts of v1.91.55, champions and Naka about level — 10/14/18 cost ~5 more */
const skCost=sk=>{const c=SK_COST[sk.k]||SK_COST.atk;return c[clamp((sk.r||1)-1,0,2)];};
/* v1.91.64 (Man): the stamina tank grows with the stamina stat — a fitter fighter (or a stronger NPC) has more "mana" for skills.
   The bar itself stays 0–100% (fatigue effects read it as a share); skill costs, the corner refill and the AI corner are in points of the tank */
const STA_TANK=f=>Math.round(clamp(100+(((f&&f.a&&f.a.stamina)||0)+((f&&f.vet)||0)-15)*2,100,140)); /* stamina stat + ring craft (strength above the stat ceiling, how the strong NPCs carry their edge) */
const staMaxOf=s=>s.staMax||100,staPts=s=>s.sta*staMaxOf(s)/100,staAddPts=(s,v)=>{s.sta=clamp(s.sta+v*100/staMaxOf(s),0,100);};
const skAfford=(s,sk)=>staPts(s)>=skCost(sk)-1e-9;
const AI_CORNER_BACK=.6; /* a side without the player's corner mini-game gets this share of the stamina it spent on skills back between rounds (an average corner) */
function aiCornerBack(s){const b=(s.skSpent||0)*AI_CORNER_BACK;s.skSpent=0;staAddPts(s,b);}
/* v1.91.60 (Man): no more "once per fight" — a skill rests one round after use (cooldown), then can fire again if the stamina is there. Still one skill per round */
const SK_CD=1;const skCdLeft=(F,s,id)=>{const r=s.skUsed&&s.skUsed[id];return r==null||r===true?(r===true?99:0):Math.max(0,r+SK_CD+1-F.round);};
function useSkill(F,s,id){const o=s===F.A?F.B:F.A;s.skUsed=s.skUsed||{};if(F.over||s.skRound||skCdLeft(F,s,id))return null;const sk=fightSkills(s).find(k=>k.id===id);if(!sk||!skAfford(s,sk))return null;
  s.skUsed[id]=F.round;s.skRound=true;const pw=(.7+.15*sk.r)*(s.f.camp==="player"?1.1:F.dai||.8);{const c=skCost(sk);staAddPts(s,-c);s.skSpent=(s.skSpent||0)+c;}
  if(sk.k==="atk")s.burst={k:"atk",w:sk.w,left:4,pw};
  if(sk.k==="def")s.burst={k:"def",left:4,pw};
  if(sk.k==="rec"){s.sta=clamp(s.sta+22*pw,0,100);s.hp=clamp(s.hp+6*pw,0,100);s.mor+=.01;s.burst=null;}
  if(sk.k==="td"||sk.k==="sub")s.burst={k:sk.k,left:sk.k==="td"?3:4,pw}; /* v1.90: grappling bursts (Naka League) */
  return {ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:skillCall(F,s,sk),k:"big",ev:"skill",rid:s.f.id,an:s.name,dn:o.name,skn:sk.name,skk:sk.k,w:sk.w,skid:sk.id,skrow:sk.row};}
function aiSkill(F,s,rng){if(s.skRound||F.over)return null;const L=fightSkills(s).filter(k=>!skCdLeft(F,s,k.id)&&skAfford(s,k));if(!L.length)return null;
  const o=s===F.A?F.B:F.A,ex=F.ex,last=F.round>=F.rounds;const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0;
  const rec=L.find(k=>k.k==="rec"),atk=L.find(k=>k.k==="atk"),def=L.find(k=>k.k==="def");
  if(rec&&s.sta<38&&ex>=2)return useSkill(F,s,rec.id);
  if(def&&o.burst&&o.burst.k==="atk"&&rng()<.5)return useSkill(F,s,def.id);
  if(ex<3)return null;
  const p=(last?.3:.1)+(behind?.12:0)+(F.round>=2?.05:0);
  const gk=L.find(k=>k.k==="sub"&&F.gnd&&F.gnd.top===s)||L.find(k=>k.k==="td"&&!F.gnd);if(gk&&rng()<(gk.k==="sub"?.6:p*2.5))return useSkill(F,s,gk.id);
  if(rng()<p){const k=atk||def||rec;if(k)return useSkill(F,s,k.id);}
  return null;}
/* ---------- v1.90 open rules (Naka League underground): takedowns, ground-and-pound, submissions ----------
   Only a fighter with f.grap (takedown skill 0–20) shoots; f.sub (0–20) is her submission game. Muay Thai answers with
   the clinch, footwork, power and knees — no new stats for our fighters. A tap ends the bout like a knockout.
   s.gprep: the underground training plan ("sprawl" | "escape" | "strike"). */
const GR={tdTry:.16,tdK:.012,tdMax:.5,tdBase:.38,tdD:.035,escBase:.2,escK:.03,subTry:.3,subBase:.06,subK:.022,reset:4,gnp:1.1,knee:.2};
function grapEx(F,at,df,rng,log,md){const nm=v=>Array.isArray(v)?v[Math.floor(rng()*v.length)]:v;
  const L=(s,t,k,ev,x)=>log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":s===F.B?"B":"x",t,k,ev,...x});
  const g=F.gnd;
  if(g){const T=g.top,B=g.bot,ta=T.f.a,ba=B.f.a;g.t++;
    const bS=T.burst&&T.burst.k==="sub"?T.burst:null;
    const esc=ba.power*.3+ba.clinch*.25+ba.iq*.2+ba.foot*.15+ba.stamina*.1+(B.gprep==="escape"?3:0),ctl=(T.f.grap||ta.clinch)*.8+ta.power*.2;
    const escP=clamp(GR.escBase+(esc-ctl)*GR.escK+(B.sta-T.sta)/400-(bS?.08:0),.06,.6);
    if(rng()<escP){F.gnd=null;B.sta=clamp(B.sta-3,0,100);L(B,`${B.name} ดันตัวหนีออกมาได้ ลุกขึ้นยืน!`,"hit","standup",{an:B.name,dn:T.name});return true;}
    if(g.t>=GR.reset){F.gnd=null;L(null,`ทั้งคู่นิ่งอยู่บนพื้นนานเกินไป กรรมการจับแยกให้ลุกขึ้นยืน`,"miss","reset",{an:T.name,dn:B.name});return true;}
    T.sta=clamp(T.sta-2,0,100);B.sta=clamp(B.sta-4,0,100);
    if(T.f.sub&&rng()<GR.subTry+(B.hp<40?.1:0)+(bS?.3:0)){const def=ba.iq*.4+ba.power*.3+ba.stamina*.3+(B.gprep==="escape"?3:0);
      const p=clamp(GR.subBase+(T.f.sub-def)*GR.subK+(100-B.sta)/600+(B.hp<40?.06:0)+(T.sk.sub||0)+(bS?.12*bS.pw:0),.02,.45);
      if(rng()<p){F.over=true;F.gnd=null;F.result={win:T===F.A?"A":"B",type:"ซับมิชชัน (ตบพื้นยอมแพ้)",round:F.round,sub:true};
        L(T,`${T.name} ${g.sub=nm(T.f.subName)||"ล็อกแขน"}แน่น! ${B.name} ตบพื้นยอมแพ้!`,"big","tap",{an:T.name,dn:B.name});return true;}
      B.sta=clamp(B.sta-6,0,100);T.sta=clamp(T.sta-4,0,100);T.pts+=.5;T.rpts+=.5;
      L(T,`${T.name} หาจังหวะ${nm(T.f.subName)||"ล็อกแขน"} — ${B.name} บิดตัวหลุดออกมาได้!`,"hit","subtry",{an:T.name,dn:B.name});return true;}
    const dmg=GR.gnp*(.6+ta.power/25)*(1.25-ba.dur/40)*(.7+rng()*.6)*(1+(T.sk.gnp||0));
    B.hp-=dmg;B.sta=clamp(B.sta-dmg*STA.hit,0,100);T.pts+=.7;T.rpts+=.7;T.landed++;T.thrown++;T.dmgDealt+=dmg;T.rdmg+=dmg;T.rlanded++;T.rthrown++;
    L(T,`${T.name} ขึ้นคร่อมแล้วทุบลงมาจากด้านบน!`,"hit","gnp",{an:T.name,dn:B.name,w:"punch"});
    if(B.hp<=0){F.over=true;F.gnd=null;F.result={win:T===F.A?"A":"B",type:"TKO (ทุบบนพื้น)",round:F.round};L(T,`${B.name} ป้องกันตัวไม่ได้แล้ว กรรมการเข้ามายุติ!`,"big","ko",{an:T.name,dn:B.name});}
    return true;}
  if(!at.f.grap)return false;
  const a=at.f.a,d=df.f.a,bT=at.burst&&at.burst.k==="td"?at.burst:null;
  if(rng()>=clamp(GR.tdTry+at.f.grap*GR.tdK+(at.sk.tdTry||0)+(bT?.35:0),0,bT?.85:GR.tdMax))return false;
  const defv=d.clinch*.35+d.foot*.25+d.power*.2+d.iq*.2+(df.gprep==="sprawl"?3:0)+(df.sk.sprawl||0);
  const p=clamp(GR.tdBase+(at.f.grap-defv)*GR.tdD-(100-at.sta)/400+(100-df.sta)/500-(md.evade||0)+(bT?.12*bT.pw:0),.08,.85);
  at.sta=clamp(at.sta-4,0,100);at.thrown++;at.rthrown++;
  if(rng()<p){F.gnd={top:at,bot:df,t:0};const dmg=2+a.power*.15;df.hp-=dmg;df.sta=clamp(df.sta-5,0,100);at.pts+=1.5;at.rpts+=1.5;at.landed++;at.rlanded++;at.dmgDealt+=dmg;at.rdmg+=dmg;
    const TN=at.f.tdName,tdi=Array.isArray(TN)?Math.floor(rng()*TN.length):-1; /* v1.91.65: the throw picked for the commentary also tells the ring how the victim flies */
    L(at,`${at.name} ${(tdi>=0?TN[tdi]:TN)||"พุ่งจับขา"} ทุ่ม${df.name}ลงพื้น!`,"big","takedown",{an:at.name,dn:df.name,tdSt:(at.f.tdSty&&at.f.tdSty[tdi])||null});
    if(df.hp<=0){F.over=true;F.gnd=null;F.result={win:at===F.A?"A":"B",type:"KO",round:F.round};L(at,`${df.name} กระแทกพื้นแล้วลุกไม่ไหว!`,"big","ko",{an:at.name,dn:df.name});}
    return true;}
  /* the sprawl — and Muay Thai's answer: grab the neck and knee the shooter */
  const kneeP=clamp(GR.knee+(d.knee+d.clinch-a.clinch*1.2)*.015+(df.gprep==="sprawl"?.08:0),.05,.5);
  if(rng()<kneeP){const dmg=1.3*W_INFO.knee.imp*(.7+rng()*.5)*(.6+d.power/25)*(1.25-a.dur/40)*(1+(df.sk.dmg.knee||0));at.hp-=dmg;at.sta=clamp(at.sta-dmg*STA.hit,0,100);
    df.pts+=1;df.rpts+=1;df.landed++;df.thrown++;df.wl.knee++;df.dmgDealt+=dmg;df.rw.knee++;df.rdmg+=dmg;df.rlanded++;df.rthrown++;
    L(df,`${at.name} พุ่งเข้าจับ — ${df.name} กดคอตีเข่าสวนเต็ม ๆ!`,"hit","counter",{an:df.name,dn:at.name,w:"knee",mw:"knee"});
    if(at.hp<=0){F.over=true;F.result={win:df===F.A?"A":"B",type:"KO",round:F.round};L(df,`${at.name} ล้มลงไม่ลุก! เข่ามวยไทยจบเกม`,"big","ko",{an:df.name,dn:at.name,koSide:df===F.A?"A":"B"});}}
  else L(df,`${df.name} ถีบขาหนี กันการทุ่มของ${at.name}ไว้ได้!`,"miss","sprawl",{an:at.name,dn:df.name});
  return true;}
function fightEx(F){const rng=F.rng,log=[],ex=F.ex,mA=F.mA,mB=F.mB;
  for(const s of [F.A,F.B])if(s.f.hurt&&!F.over&&s.hp>0){const w=hurtW(s),H=s.f.hurt;s.hp=Math.min(s.hp0,s.hp+H.rec*w);s.sta=clamp(s.sta+H.rec*w*1.5,0,100);
    if(w>.45&&!s.hurtSaid){s.hurtSaid=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name}ยิ่งเลือดออกยิ่งนิ่ง — การ์ดแน่นขึ้น หลบคมขึ้น และหายใจกลับมาเร็วผิดคน`,k:"big",ev:"wake",an:s.name,dn:s.name});}}
  for(const s of [F.A,F.B])if(s.autoSkill!==false){const e=aiSkill(F,s,rng);if(e)log.push(e);}
  {
    // v1.5 "blood boiling" mode: a canon fighter who is hurt and behind can snap once per fight
    for(const s of [F.A,F.B]){{const o=s===F.A?F.B:F.A;if(s.f.canon&&(s.f.camp==="player"||o.f.canon)&&!s.rageUsed&&ex>2){const behind=F.cards.reduce((x,c)=>x+(s===F.A?c[0]-c[1]:c[1]-c[0]),0)<0||s.kd>0;
      // v1.10: easier to trigger (hurt OR behind), and guaranteed in round 2 of the player's first fight
      const forced=F.forceRage&&s===F.A&&s.f.camp==="player"&&F.round>=2&&ex>=4;
      const need=(s.hp<62&&behind)||s.hp<45||(F.round>=2&&behind&&s.hp<75);
      if(forced||(need&&rng()<(s.f.camp==="player"?.03+(s.f.bond||0)/1500+(s.f.morale||60)/2400:.08))){s.rageUsed=true;s.rage=4;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:`${s.name} ตาเปลี่ยน! โหมดเลือดเดือด!`,k:"big",ev:"rage",rid:s.f.id,an:s.name,dn:o.name});}}}}
    for(const s of [F.A,F.B])if(s.phNew&&!F.over){s.phNew=false;const P=s.ph,o=s===F.A?F.B:F.A;if(P.self){s.hp-=P.self;s.rage=Math.max(s.rage||0,5);}
      if(P.say)log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",t:P.say,k:"big",ev:"phase",ph:P.n,an:s.name,dn:o.name});
      if(P.fst==="read"&&s.readSty)log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:s===F.A?"A":"B",k:"big",an:s.name,dn:o.name,
        t:s.readHit?`${s.name}กวาดตามองแค่ครั้งเดียว แล้วเปลี่ยนจังหวะทันที… เหมือนรู้ทางของ${o.name}มาก่อนแล้ว`:`${s.name}ขยับไปดักตามข้อมูล… แต่${o.name}ไม่ได้อยู่ตรงนั้น — ข้อมูลอ่าน${o.name}ไม่ออก!`});}
    const ini=s=>{const a=s.f.a,m=s===F.A?mA:mB;return (s.ph&&s.ph.ini||0)-s.legs/12+effA(s,"speed")*.3+a.foot*.15+a.iq*.2+a.comp*.1+m.aggr*10+rng()*9+(s.sta-60)/12;};
    const initiativeGap=ini(F.A)-ini(F.B);const [at,df]=rng()<clamp(.5+initiativeGap/30,.2,.8)?[F.A,F.B]:[F.B,F.A];const ma=at===F.A?mA:mB,md=at===F.A?mB:mA;
    const a=at.f.a,d=df.f.a;
    if(F.gnd||at.f.grap){if(grapEx(F,at,df,rng,log,md)){for(const s of [F.A,F.B])s.sta=clamp(s.sta+STA.ex+s.f.a.stamina*STA.exK+s.sk.regen,0,100);
      for(const s of [F.A,F.B])if(s.burst&&--s.burst.left<=0)s.burst=null;F.ex++;F.rlog.push(...log);return log;}}
    // clinch?
    const clinch=rng()<clamp(.12+ma.cl+(a.clinch-d.foot)*.02+Math.max(0,BAL.clGap-d.clinch)*BAL.clK,.03,.55); // v1.87.4: a fighter who never trained the clinch gets tied up more
    const items=clinch?[["knee",a.knee*ma.w.knee],["elbow",a.elbow*ma.w.elbow*.8]]:
      [["punch",a.punch*ma.w.punch],["kick",a.kick*ma.w.kick],["knee",a.knee*ma.w.knee*.5],["elbow",a.elbow*ma.w.elbow*.6]];
    const bA=at.burst&&at.burst.k==="atk"?at.burst:null,bD=df.burst&&df.burst.k==="def"?df.burst:null;
    const wpn=pickW(rng,items.map(([k,v])=>[k,Math.pow(v,1.6)*(bA&&bA.w===k?4:1)]));
    const atk=effA(at,wpn)*.7+effA(at,"speed")*.15+a.iq*.15;
    // v1.87.4: knowing a weapon helps to defend it, so dumping punches/knees/elbows leaves a hole
    const def=clinch?((d.clinch+df.sk.clDef)*.5+d.guard*.3+d.iq*.2):(d.guard*.42+d.foot*.25+d.iq*.18+d[wpn]*BAL.wdef);
    const fatA=(100-at.sta)/100*.22,fatD=(100-df.sta)/100*.12;
    const fury=at.trait==="fury"?clamp((70-at.hp)/50,0,1)*(at.trk!=null?at.trk:1):0; // v1.38 → v1.87 trait: the more she is hurt, the more dangerous
    /* v1.87 traits that fire mid-fight */
    if(df.trait==="wits"&&df.hp<TRV.witsHp&&!df.witsOn){df.witsOn=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${df.name}ตั้งสติได้ทั้งที่เจ็บหนัก ไหวพริบพิเศษ! หลบพลิ้วกว่าเดิม`,k:"big",ev:"wake",an:df.name,dn:at.name});}
    for(const S of [at,df])if(S.trait==="tempo"&&!S.tempoOn&&(F.round>=F.rounds||S.hp<50)){S.tempoOn=1;const O=S===at?df:at;if(!S.ctrW){S.ctrW=oppTop(O.f);S.ctrK=S.trk;O.prep-=CTR_READ*(S.trk!=null?S.trk:1);}log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:S===F.A?"A":"B",t:`${S.name}เปลี่ยนจังหวะ! จังหวะเทพ อ่านทาง${O.name}ขาดแล้ว`,k:"big",ev:"wake",an:S.name,dn:O.name});}
    if(fury>.4&&!at.wake){at.wake=1;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${at.name}ยิ้มทั้งที่เลือดออก… ยิ่งเจ็บยิ่งดุ! สายตาเปลี่ยนไปแล้ว!`,k:"big",ev:"wake",an:at.name,dn:df.name});}
    /* v1.87.4 balance: one weapon thrown again and again gets read inside the round, and a kick can be checked by a tight guard and good feet */
    const rtw=at.rtw||(at.rtw={punch:0,kick:0,knee:0,elbow:0}),rep=at.rthrown>=3?Math.max(0,(rtw[wpn]||0)/at.rthrown-BAL.repFree)*BAL.repPen:0;
    const chkP=wpn==="kick"&&!clinch?clamp((d.guard*.55+d.foot*.45-effA(at,"speed")*.3-BAL.chkBase)*BAL.chkK+rep*.6,0,BAL.chkMax):0;
    const hitP=clamp(.42-rep+fury*.04+(atk-def)*.03+at.prep+at.mor+(at.careMor||0)-fatA+fatD-md.evade-md.guard-df.sk.evade-(df.ctrW===wpn?CTR_W*(df.ctrK!=null?df.ctrK:1):0)+(at.sk.hit[wpn]||0)+(at.hp<45?at.sk.clutch:0)+(at.rage?.1:0)+(at.gprep==="strike"&&F.open?.04:0)+(at.ph&&at.ph.hit||0)-(df.ph&&df.ph.ev||0)-(df.f.hurt?df.f.hurt.ev*hurtW(df):0)-(at.tac.target==="head"?.015:0)+df.legs/400+(bA&&bA.w===wpn?.12*bA.pw:0)-(bD?.12*bD.pw:0),.12,.9)*(at.trait==="flow"?trm(TRV.flowAtk,at):1)*(df.trait==="flow"?trm(TRV.flowDef,df):1)*(df.witsOn?trm(TRV.wits,df):1)*(df.trait==="eye"?trm(TRV.eyeDef,df):1)*(1+fury*TRV.furyHit)*(at.libOn?trm(TRV.libHit,at):1);
    at.thrown++;at.rthrown++;rtw[wpn]=(rtw[wpn]||0)+1;at.sta=clamp(at.sta-STA.drain*W_INFO[wpn].cost*(STA.cA-a.stamina/STA.cB)*ma.sta*(1+Math.max(0,ma.aggr))*(1-at.sk.staSave),0,100);
    const tx=TXT[wpn][Math.floor(rng()*TXT[wpn].length)];
    const checked=chkP>0&&rng()<chkP;
    if(checked){at.legs=Math.min(60,at.legs+BAL.chkLegs);at.sta=clamp(at.sta-BAL.chkSta,0,100);at.hp-=BAL.chkHp;df.pts+=.3;df.rpts+=.3;
      log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${df.name} ยกแข้งรับลูกเตะของ${at.name}ไว้ได้ แข้งปะทะแข้ง!`,k:"miss",ev:"miss",w:wpn,cl:clinch,mside:at===F.A?"A":"B",an:at.name,dn:df.name});}
    else if(rng()<hitP){
      const crit=rng()<(at.rage?.35:.07);const q=crit?1.6:.6+rng()*.6;if(at.rage)at.rage--;
      let dmg=1.35*W_INFO[wpn].imp*q*(.6+(BAL.specPow?effA(at,"power"):a.power)/25)*(1-d.guard/70)*(1.25-d.dur/40)*(1+(at.sk.dmg[wpn]||0))*(bA&&bA.w===wpn?1+.3*bA.pw:1)*(1+fury*TRV.furyDmg)*(at.libOn?trm(TRV.lib,at):1)*(at.trait==="rock"?trm(TRV.rockAtk,at):1)*(df.trait==="rock"?trm(TRV.rockDef,df):1)*(at.ph&&at.ph.dmg||1)*(at.f.camp==="player"?1+(HERO_D[at.f.id]||0):1)*(1+(at.titleD||0))*(df.f.hurt?1-df.f.hurt.def*hurtW(df):1);const tg=at.tac.target;
      if(tg==="head")dmg*=1.1;if(tg==="body"){dmg*=.9;df.sta=clamp(df.sta-dmg*.9,0,100);}if(tg==="legs"&&(wpn==="kick"||wpn==="knee")){dmg*=.85;df.legs=Math.min(60,df.legs+dmg*.8);}
      // v1.32 "flash knockout": a clean crit to the head can drop anyone early — rarer for durable/guarded fighters, likelier when the attacker clearly outclasses
      if(crit&&tg!=="body"&&(wpn!=="punch"||a.power>=10)&&rng()<clamp(.16+(ovr(a)-ovr(d))*.06-(d.dur-8)*.012+Math.max(0,a.power-12)*BAL.flashPow,.05,.45)){dmg+=10+rng()*8;at.flash=1;}
      at.rw[wpn]++;at.rdmg+=dmg;at.rlanded++;
      df.hp-=dmg;df.sta=clamp(df.sta-dmg*STA.hit*(df.f.hurt?1-df.f.hurt.sta*hurtW(df):1),0,100);at.landed++;at.wl[wpn]++;at.dmgDealt+=dmg;const p=W_INFO[wpn].pts*q*(1+(at.sk.pts[wpn]||0))*(df.trait==="rock"?trm(TRV.rockPts,df):1);at.pts+=p;at.rpts+=p;
      log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${at.name} ${tx}${crit?" — เข้าเต็ม ๆ!":""}`,k:crit?"big":"hit",ev:"hit",w:wpn,cl:clinch,crit,an:at.name,dn:df.name});
      if(wpn==="elbow"&&q>1.3&&rng()<.25){df.cuts++;log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${df.name} โดนศอกแตก เลือดออกที่คิ้ว`,k:"warn",ev:"cut",an:at.name,dn:df.name});
        if(df.cuts>=2&&rng()<.5){F.over=true;F.result={win:at===F.A?"A":"B",type:"TKO (แพทย์สั่งยุติ)",round:F.round};}}
      if(!F.over&&df.hp<=0){at.flash=0;F.over=true;F.result={win:at===F.A?"A":"B",type:rng()<.5?"KO":"TKO",round:F.round};
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} ล้มลงและลุกไม่ไหว! กรรมการโบกมือยุติการชก`,k:"big",ev:"ko",an:at.name,dn:df.name});}
      else if(!F.over&&at.flash){at.flash=0;df.kd++;at.pts+=3;at.rpts+=3;
        if(df.hp<62||df.kd>=2||rng()<.18){F.over=true;F.result={win:at===F.A?"A":"B",type:"KO",round:F.round};
          log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} ร่วงลงไปทันที! กรรมการนับครบสิบ น็อกเอาต์ยก ${F.round}!`,k:"big",ev:"ko",an:at.name,dn:df.name});}
        else log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} ล้มลง! ลุกขึ้นมาได้ทันก่อนนับครบ`,k:"big",ev:"kd",an:at.name,dn:df.name});}
      else if(!F.over&&df.hp<40&&dmg>6&&rng()<.35){df.kd++;df.hp+=8;at.pts+=3;at.rpts+=3;
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:at===F.A?"A":"B",t:`${df.name} ล้มลง! กรรมการเริ่มนับ… ลุกขึ้นมาได้`,k:"big",ev:"kd",an:at.name,dn:df.name});
        if(df.kd>=3){F.over=true;F.result={win:at===F.A?"A":"B",type:"TKO (ล้ม 3 ครั้ง)",round:F.round};}}
    } else {
      const ctrP=clamp(d.counter/20*.32+md.ctr-fatD+df.sk.ctr+(df.rage?.2:0)+(bD?.18*bD.pw:0),0,.8)*(df.trait==="eye"?trm(TRV.eyeCtr,df):1);
      if(rng()<ctrP){const cw=d.kick>d.punch&&!clinch?"kick":"punch";
        const rc=!!df.rage;if(df.rage)df.rage--;const dmg=1.3*W_INFO[cw].imp*(rc?1.5:.7+rng()*.5)*(.6+(BAL.specPow?effA(df,"power"):d.power)/25)*(1-a.guard/70)*(1.25-a.dur/40)*(1+df.sk.ctrDmg)*(df.libOn?trm(TRV.lib,df):1)*(df.trait==="rock"?trm(TRV.rockAtk,df):1)*(at.trait==="rock"?trm(TRV.rockDef,at):1);
        at.hp-=dmg;at.sta=clamp(at.sta-dmg*STA.hit,0,100);df.landed++;df.thrown++;df.wl[cw]++;df.dmgDealt+=dmg;df.rw[cw]++;df.rdmg+=dmg;df.rlanded++;df.rthrown++;const p=W_INFO[cw].pts*.9;df.pts+=p;df.rpts+=p;
        log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:df===F.A?"A":"B",t:`${at.name} พลาดเป้า — ${df.name} สวนกลับด้วย${cw==="kick"?"ลูกเตะ":"หมัด"}เข้าเต็ม!${rc?" คริติคอล!":""}`,k:rc?"big":"hit",ev:"counter",crit:rc,w:cw,mw:wpn,an:df.name,dn:at.name});
        if(at.hp<=0){F.over=true;F.result={win:df===F.A?"A":"B",type:"KO",round:F.round};log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} ล้มลงไม่ลุก! ชนะน็อก`,k:"big",ev:"ko",an:df.name,dn:at.name,koSide:df===F.A?"A":"B"});}
      } else if(rng()<.45) log.push({ha:F.A.hp,hb:F.B.hp,sa:F.A.sta,sb:F.B.sta,s:"x",t:`${at.name} ${tx} แต่ ${df.name} ${TXT.miss[Math.floor(rng()*4)]}`,k:"miss",ev:"miss",w:wpn,cl:clinch,mside:at===F.A?"A":"B",an:at.name,dn:df.name});
    }
    for(const s of [F.A,F.B])s.sta=clamp(s.sta+STA.ex+s.f.a.stamina*STA.exK+s.sk.regen,0,100);
    for(const s of [F.A,F.B])if(s.burst&&--s.burst.left<=0)s.burst=null;
  }
  F.ex++;F.rlog.push(...log);return log;}
let RND_REC={b:6,d:.3},RND_REC_EV=RND_REC; /* v1.90.4: HP back between rounds is 3/4 of the old amount (KOs ~25% → ~31% in sims) — the Loy brawl uses the same rate and gets a little more back between bouts instead */
const STA={cNorm:.6,cMin:.6,cBonus:.5,qf:.4,fah:7,hit:.25,drain:1.15,cA:1.15,cB:70,ex:0,exK:1/120,brk:16,brkK:.8,prep:4,cond:3,care:20,careHp:5,ai:.3};
function careSide(s,q){s.sta=clamp(s.sta+q*STA.care,0,100);s.hp=clamp(s.hp+q*STA.careHp,0,Math.max(100,s.hp0||100));}
function roundFinish(F){const log=F.rlog,kd0=F.kd0;for(const s of [F.A,F.B])s.burst=null;
  // judges
  const dif=(F.A.rpts-F.B.rpts)+(F.B.kd-kd0.B-(F.A.kd-kd0.A))*3;
  let card=[10,10];if(dif>.4)card=[10,9];if(dif<-.4)card=[9,10];
  if(F.B.kd>kd0.B&&dif>4)card=[10,8];if(F.A.kd>kd0.A&&dif<-4)card=[8,10];
  F.cards.push(card);F.logs.push(log);
  /* v1.87.2: a fighter gets her breath back between rounds — tougher fighters recover more — so long bouts are not just a slow knockout
     v1.88: stamina no longer refills by itself. A break gives back a little (conditioning, last week's fight prep), the corner does the rest:
     the player's corner mini-game in a live fight, an average corner for everyone else. */
  if(!F.over){aiCornerBack(F.B);if(!F.live)aiCornerBack(F.A);else F.A.skSpent=0;}
  for(const s of [F.A,F.B]){s.sta=clamp(s.sta+(s.brk||0),0,100);if(s.f.hurt)s.hp+=s.f.hurt.rnd*hurtW(s);s.hp=clamp(s.hp+(F.ev?RND_REC_EV:RND_REC).b+s.f.a.dur*(F.ev?RND_REC_EV:RND_REC).d,0,Math.max(100,s.hp0||100));
    } /* v1.89.1: corner mini-games are off — everyone gets her breath back between rounds again (16 + stamina×0.8, plus conditioning / fight prep / Fah's bonus); careSide/applyCare stay for a mini-game later */
  if(!F.over&&F.round>=F.rounds){F.over=true;const tA=F.cards.reduce((x,c)=>x+c[0],0),tB=F.cards.reduce((x,c)=>x+c[1],0);
    const pd=F.A.pts-F.B.pts;const tie=tA===tB;
    F.result=tie&&Math.abs(pd)<1?{win:"D",type:"เสมอ",round:F.round}:tie?{win:pd>0?"A":"B",type:"ชนะคะแนน (ตัดสินจากความเหนือกว่า)",round:F.round,score:`${tA}–${tB}`}:{win:tA>tB?"A":"B",type:"ชนะคะแนน",round:F.round,score:`${Math.max(tA,tB)}–${Math.min(tA,tB)}`};}
  return log;
}
function quickFight(fa,fb,seed,rounds,tacA){const F=newFight(fa,fb,{seed,rounds});F.A.tac=tacA||aiTac(fa,F.rng);F.B.tac=aiTac(fb,F.rng);
  while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}return F;}

// ---------- WORLD ----------
const TIER={local:{name:"ระดับตำบล",win:4000,lose:2000,rep:1.5},district:{name:"ระดับอำเภอ",win:9000,lose:4500,rep:3},
  semi:{name:"รองชิงจังหวัด",win:18000,lose:8000,rep:4},final:{name:"ชิงแชมป์จังหวัด",win:50000,lose:20000,rep:8},exhibition:{name:"ไฟต์งานวัด",win:2500,lose:1500,rep:.5},pro:{name:"มวยงานวัดคืนแรก",win:1500,lose:1000,rep:.5,off:1},evloy:{name:"ศึกริมน้ำคืนลอยกระทง",win:0,lose:0,rep:.3,off:1},special:{name:"ศึกพิเศษข้ามรุ่น",win:8000,lose:4000,rep:2},
  quest:{name:"ไฟต์นอกตาราง",win:0,lose:0,rep:.4,off:1},dm:{name:"ศึก Death Match",win:0,lose:0,rep:.5,off:1},beast:{name:"ศึกพิสดาร",win:7000,lose:2500,rep:1,off:1},lab:{name:"ศึกท้าค่ายเวกเตอร์",win:18000,lose:8000,rep:3}};
// v1.90 (hidden): ศึกชิงเจ้าสี่ภาค — the regional chapter lives in region.js (+ road.js) and loads only once the chapter opens.
// Off for players until the whole chapter ships; #regiondev turns it on for testing on this device.
const REGION_LIVE=false;
TIER.region={name:"ศึกชิงเจ้าสี่ภาค",win:12000,lose:5000,rep:2.5,off:1};
function regionOn(){if(REGION_LIVE)return true;try{if(typeof location!=="undefined"&&/regiondev/.test(location.hash||""))localStorage.setItem("mtm_regiondev","1");return localStorage.getItem("mtm_regiondev")==="1";}catch(e){return false;}}
const regionReady=G=>(G.season||1)>=6&&(G.honors||[]).filter(h=>h.kind==="province").length>=3; /* year 5 is over + three provincial titles */
const regionBlock=(G,wk)=>{const R=G.region;if(!R)return false;const s=G.season||1;if(R.trip&&R.trip.season===s&&R.trip.wk===wk)return true; /* the whole camp is on the road that week */
  return Object.values(R.champ||{}).some(c=>c&&c.next&&c.next.season===s&&c.next.wk===wk);}; /* …or at a regional championship bout */
let REGION_P=null;
function regionLoad(){if(typeof REGION!=="undefined")return Promise.resolve(REGION);if(REGION_P)return REGION_P;
  if(typeof window==="undefined"||!window.MTM_JS)return Promise.reject(new Error("no loader"));
  REGION_P=window.MTM_JS((window.LANG==="en"?"region-en.js":"region.js")+"?v="+(window.MTM_BUILD||"")).then(()=>{if(typeof REGION==="undefined")throw new Error("region.js did not run");return REGION;},e=>{REGION_P=null;throw e;});return REGION_P;}
function regionStart(G){if(G.region)return;const now=gameWeek(G),R=["north","isan","central","south"];
  G.region={edition:1,startAbs:now,belts:Object.fromEntries(R.map(r=>[r,{}])),trip:null,nextTripAbs:now+1,
    champ:Object.fromEntries(R.map(r=>[r,{state:"locked",fid:null,w:0,l:0}])),cups:[],meet:{},hall:[],pend:[],gc:[]};
  addMail(G,{kind:"letter",tone:"naka",from:"นาคาเอเนอร์จี้ดริงค์",title:"จดหมายเชิญ: ศึกชิงเจ้าสี่ภาค",
    body:`เรียน ผู้จัดการค่ายศิริชัย\n\nด้วยผลงานแชมป์จังหวัดถึงสามสมัย นาคาเอเนอร์จี้ดริงค์ขอเชิญค่ายของท่านร่วม "ศึกชิงเจ้าสี่ภาค" ทัวร์นาเมนต์ระดับภาคครั้งแรกของประเทศ\n\nเก็บเข็มขัดจังหวัดให้ครบสี่จังหวัดในแต่ละภาค แล้วท้าชิงถ้วยกับแชมป์ประจำภาค เหนือ อีสาน กลาง ใต้\n\nเปิดดูรายละเอียดและวางแผนการเดินทางได้ที่หน้าไฟต์ › ศึกชิงเจ้าสี่ภาค\n\nด้วยความนับถือ\nเกริก ประธานนาคาเอเนอร์จี้ดริงค์`});}
/* weekly: send the invitation once the camp qualifies, tidy finished trips */
function regionWeek(G){if(!regionOn())return;if(!G.region){if(regionReady(G))regionStart(G);return;}
  if(typeof REGION!=="undefined"&&REGION.weekly)REGION.weekly(G);}
/* a regional bout just ended: queue it for region.js (it may still be loading) */
function regionAfterFight(G,b,ret,F){if(!G.region)return;G.region.pend=G.region.pend||[];G.region.lastRes={bid:b.id,res:ret?ret.res:null}; /* v1.91.93: the local-ring knockout reads the result straight after the bout */const rt=(F&&F.result&&F.result.type)||"";G.region.pend.push({bid:b.id,a:b.a,b:b.b,region:b.region,res:ret?ret.res:null,kdA:F&&F.A?F.A.kd||0:0,stop:!!rt&&!/^ชนะคะแนน|^เสมอ/.test(rt)});
  if(typeof REGION!=="undefined"&&REGION.flush)REGION.flush(G);}
function stageOf(w){return w<=20?"local":w<=40?"district":w<=50?"final":"off";}
const STAGE_NAME={local:"รอบตำบล",district:"รอบอำเภอ",final:"ชิงแชมป์จังหวัด",off:"ปิดปี"};

function ployAura(w,G){if(G&&G.F&&G.F.ploy&&G.F.ploy.camp==="player")return 0;return G&&(G.season||1)===1?.6:.42;}
function startLv(f){if(f.id==="ploy")f.aura=ployAura(1);if(f.id==="ploy")f.lvl=5;else if(f.id==="fah")f.lvl=3;else if(f.camp==="npc")f.lvl=clamp(Math.round(ovr(f.a)-7),1,6);}
// v1.22 difficulty: easy = rivals grow slower + more class income; hard = rivals grow faster and use skills harder
const DIFF={easy:{rival:.7,ai:.6,inc:1.2,train:1.12,name:"ง่าย"},normal:{rival:1,ai:.8,inc:1,train:1,name:"ปกติ"},hard:{rival:1.12,ai:.95,inc:.9,train:.97,name:"ยาก"}};
const dif=G=>DIFF[(G&&G.diff)||"normal"]||DIFF.normal;
// v1.48: seeded "random" for gameplay rolls outside fights, so a shared seed replays the same
function srand(G,salt){return mulberry32((((G&&G.seed)||1)+((G&&G.week)||0)*7919+(salt|0)*104729)>>>0)();}
function newGame(opts){
  const seed=(opts.seed??Math.floor(Math.random()*1e9))>>>0;const rng=mulberry32(seed);
  const G={v:1,timeV:3,snubV:2,dmSeenSeason:1,dmSeen:{},seed,week:1,diff:opts.diff||"normal",player:{name:opts.name||"ต้น",gender:opts.gender||"m"},cash:60000,debt:120000,rep:5,
    fac:{gym:0,airgym:0,recovery:0,classroom:0,brand:0,dorm:0,kitchen:0,hill:0,video:0,ring:0,clinic:0,shrine:0,van:0,sauna:0,lights:0,hall:0,daeng:1,assistants:0},stu:1,staff:[],rankMove:{A:{},B:{}},camp:{beauty:0},campUsed:null,levelUps:[],avatar:opts.avatar||null,F:{},rank:{A:{},B:{}},qual:{A:[],B:[]},finalists:{A:[],B:[]},semis:{A:[],B:[]},champ:{},
    bookings:[],offers:[],log:[],flags:{},seen:{},freeUsed:false,negWeeks:0,history:[],honors:[],awards:[],ended:null,lastReport:null,romance:null,lovers:[],lovWk:{},cardRd:2};
  for(const [id,d] of Object.entries(CANON))G.F[id]=baseFighter(id,d);
  for(const div of ["A","B"])NPC_NAMES[div].forEach(([n,l],i)=>{const id=`n${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i));});
  for(const f of Object.values(G.F))startLv(f);
  syncFighterAges(G);
  for(const f of Object.values(G.F))if(f.camp!=="player"&&f.camp!=="free"&&G.rank[f.div])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};
  G.rank.A.kati={pts:0,w:0,l:0,d:0};
  ensureStageNPCs(G,"local");
  // v1.22 difficulty also moves where the two stars start
  {const d=G.diff;for(const id of ["ploy","fah"]){const adj=(d==="easy"?-.7:d==="hard"?.35:0)+(id==="ploy"?-.8:-1.5);/* v1.23: stars start lower, grow when beaten */const f=G.F[id];if(!f)continue;for(const [k] of ATTRS)f.a[k]=clamp(f.a[k]+adj,1,20);f.potential+=adj*.8;}}
  return G;
}
const roster=G=>Object.values(G.F).filter(f=>f.camp==="player");
const wageOf=f=>Math.round(f.wage*(1+(Math.min(f.lvl||1,15)-1)*.06)/100)*100; // v1.43: stars ask for more as they level up
const wages=G=>roster(G).reduce((s,f)=>s+wageOf(f),0)+(G.staff?G.staff.reduce((s,k)=>s+STAFF[k].wage,0):G.fac.assistants*2500);
// ---------- CAMP FACILITIES & STUDENTS ----------
// Fixed camp slots: rarity indicates acquisition difficulty, never an extra stat bonus.
const DECOR_RARITY={N:"#aab0ba",R:"#5ba9e8",SR:"#bd83e8",SSR:"#f4c75b",SS:"#ff8f62"};
const CAMP_DECOR={
 tree:{name:"ต้นไม้",items:{none:{name:"ไม่ปลูกต้นไม้",r:"N"},plain:{name:"ต้นไม้พื้นบ้าน",r:"N"},blossom:{name:"ต้นพญาเสือโคร่ง",r:"R",rep:15},sakura:{name:"สวนซากุระ",r:"SR",rep:30,year:2},champion:{name:"ต้นชัยชนะ",r:"SSR",honor:"province"},golden:{name:"ต้นทองแห่งตำนาน",r:"SS",titles:3},flame:{name:"ต้นหางนกยูงฝรั่ง",r:"R",shop:1,price:22000},lilawadee:{name:"ต้นลีลาวดี",r:"R",shop:1,price:28000},rachaphruek:{name:"ต้นราชพฤกษ์",r:"SR",shop:1,price:55000},sritrang:{name:"ต้นศรีตรัง",r:"R",shop:1,price:28000},thongkwao:{name:"ต้นทองกวาว",r:"R",shop:1,price:26000}}},
 gate:{name:"ซุ้มทางเข้า",items:{none:{name:"ไม่มีซุ้ม",r:"N"},plain:{name:"ซุ้มไม้",r:"N"},painted:{name:"ซุ้มสีค่าย",r:"R",fac:["brand",1]},lantern:{name:"ซุ้มโคมไฟ",r:"SR",year:2,rep:18},trophy:{name:"ซุ้มถ้วยรางวัล",r:"SSR",honors:3},gold:{name:"ซุ้มเกียรติยศทอง",r:"SS",honors:8},lanna:{name:"ซุ้มไม้สักล้านนา",r:"SR",shop:1,price:60000},jade:{name:"ซุ้มหยกเขียว",r:"SR",shop:1,price:65000},indigo:{name:"ซุ้มผ้าคราม",r:"SR",shop:1,price:58000},stucco:{name:"ซุ้มปูนปั้นขาว",r:"SR",shop:1,price:62000},bougain:{name:"ซุ้มดอกเฟื่องฟ้า",r:"SR",shop:1,price:60000},marigold:{name:"ซุ้มดาวเรือง",r:"SR",shop:1,price:60000}}},
 ring:{name:"เวทีมวย",items:{plain:{name:"เวทีเดิม",r:"N"},red:{name:"ขอบเวทีแดง",r:"R",fac:["ring",1]},blue:{name:"ขอบเวทีน้ำเงิน",r:"R",fac:["ring",2]},sponsor:{name:"เวทีผู้สนับสนุน",r:"SR",rep:30},gold:{name:"เวทีแชมป์",r:"SSR",honor:"province"},green:{name:"ขอบเวทีเขียวมรกต",r:"R",shop:1,price:30000},purple:{name:"ขอบเวทีม่วงราชา",r:"SR",shop:1,price:60000},black:{name:"เวทีดำมิดไนท์",r:"SR",shop:1,price:75000},pink:{name:"ขอบเวทีชมพูพาสเทล",r:"R",shop:1,price:35000},orange:{name:"ขอบเวทีส้มสด",r:"R",shop:1,price:35000},yellow:{name:"ขอบเวทีเหลืองทานตะวัน",r:"R",shop:1,price:35000}}},
 track:{name:"ลู่วิ่งรอบค่าย",items:{dirt:{name:"ทางดิน",r:"N"},chalk:{name:"เส้นชอล์ก",r:"R",fac:["hill",1]},gravel:{name:"ลู่วิ่งกรวด",r:"SR",fac:["hill",2]},rubber:{name:"ลู่วิ่งยาง",r:"SR",fac:["gym",2],rep:20},lantern:{name:"ลู่วิ่งโคมไฟ",r:"SSR",year:3,rep:35},blue:{name:"ลู่วิ่งสีน้ำเงิน",r:"R",shop:1,price:30000},green:{name:"ลู่วิ่งสีเขียว",r:"R",shop:1,price:30000},pink:{name:"ลู่วิ่งสีชมพู",r:"R",shop:1,price:30000},yellow:{name:"ลู่วิ่งสีเหลือง",r:"R",shop:1,price:30000},goldcarpet:{name:"ลู่วิ่งพรมทอง",r:"SSR",beauty:1}}},
 vehicle:{name:"รถประจำค่าย",items:{none:{name:"ยังไม่มีรถ",r:"N"},songthaew:{name:"รถสองแถว",r:"R",fac:["van",1]},minibus:{name:"รถตู้",r:"SR",fac:["van",2]},tourbus:{name:"รถบัสค่าย",r:"SR",fac:["van",2],rep:35},limo:{name:"ลีมูซีน",r:"SSR",fac:["van",2],rep:45,honor:"province"},goldvan:{name:"รถตู้สีทอง",r:"SS",bossWins:10},rotdaeng:{name:"รถแดงเชียงใหม่",r:"R",shop:1,price:40000},pinkvan:{name:"รถตู้ชมพูพาสเทล",r:"SR",shop:1,price:95000},bluevan:{name:"รถตู้น้ำเงินทะเล",r:"SR",shop:1,price:85000},tuktuk:{name:"รถตุ๊กตุ๊กส้ม",r:"R",shop:1,price:45000},yellowthaew:{name:"รถสองแถวเหลือง",r:"R",shop:1,price:40000},citycar:{name:"รถเก๋ง E20",r:"N",shop:1,price:60000},pickup:{name:"กระบะแคปดีเซล",r:"R",shop:1,price:120000},vipvan:{name:"รถตู้ดีเซลวีไอพี",r:"SR",shop:1,price:180000},evsuv:{name:"รถยนต์ไฟฟ้า SUV",r:"SSR",shop:1,price:380000},evvan:{name:"รถตู้ไฟฟ้า",r:"SSR",shop:1,price:420000}}},
 bags:{name:"กระสอบทราย",items:{plain:{name:"กระสอบเดิม",r:"N"},red:{name:"กระสอบแดง",r:"R",fac:["gym",1]},blue:{name:"กระสอบน้ำเงิน",r:"R",fac:["gym",2]},team:{name:"กระสอบลายค่าย",r:"SR",rep:20},gold:{name:"กระสอบแชมป์",r:"SSR",honors:5},green:{name:"กระสอบเขียวทหาร",r:"N",shop:1,price:8000},black:{name:"กระสอบดำด้าน",r:"R",shop:1,price:15000},pink:{name:"กระสอบชมพูหวาน",r:"R",shop:1,price:15000},white:{name:"กระสอบขาวมุก",r:"N",shop:1,price:8000},orange:{name:"กระสอบส้มสด",r:"R",shop:1,price:15000},yellow:{name:"กระสอบเหลืองสด",r:"R",shop:1,price:15000}}}
};
const campWeekIndex=G=>gameWeek(G);
const goldRematchReady=G=>(G.gang&&G.gang.st>=5)&&campWeekIndex(G)>=(G.gangRematchAt||0);
const goldRematchLabel=G=>{const n=G.gangRematchAt||0;return "ปีที่ "+(Math.floor((n-1)/52)+1)+" สัปดาห์ "+(((n-1)%52)+1);};
const decorDefault=slot=>({tree:"plain",gate:"plain",ring:"plain",track:"dirt",vehicle:"none",bags:"plain"})[slot];
function decorUnlockReason(G,slot,key){const D=CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key];if(!D)return "ไม่มีของชิ้นนี้";if(G.decorUnlocks&&G.decorUnlocks[slot]&&G.decorUnlocks[slot].includes(key))return "";const need=[];
 if(D.shop)need.push("ซื้อได้ในร้าน");
 if(D.rep&&G.rep<D.rep)need.push("ชื่อเสียง "+D.rep+" (ตอนนี้ "+G.rep.toFixed(1)+")");
 if(D.fac&&(G.fac[D.fac[0]]||0)<D.fac[1])need.push("อัปเกรด "+FACILITIES[D.fac[0]].name+" ระดับ "+D.fac[1]);
 if(D.year&&(G.season||1)<D.year)need.push("เล่นถึงปีที่ "+D.year);
 if(D.honor&&!(G.honors||[]).some(h=>h.kind===D.honor))need.push("คว้าแชมป์จังหวัด");
 if(D.honors&&(G.honors||[]).length<D.honors)need.push("สะสมเกียรติยศ "+D.honors+" รายการ (มี "+(G.honors||[]).length+")");
 if(D.titles&&(G.honors||[]).filter(h=>h.kind==="province").length<D.titles)need.push("คว้าแชมป์จังหวัด "+D.titles+" ครั้ง");
 if(D.beauty&&(G.beautyWins||0)<D.beauty)need.push("ชนะเลิศประกวดค่ายสวยประจำปี");
 if(D.bossWins&&(G.goldHelmetWins||0)<D.bossWins)need.push("ชนะเสี่ยหมวกทองคำ "+D.bossWins+" ครั้ง (มี "+(G.goldHelmetWins||0)+")");
 return need.join(" · ");}
function decorUnlocked(G,slot,key){return !!(CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key])&&!decorUnlockReason(G,slot,key);}
function chooseDecor(G,slot,key){if(!decorUnlocked(G,slot,key))return false;G.decor=G.decor||{};G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];if(!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);G.decor[slot]=key;return true;}
function grantDecorUnlocks(G){G.decorUnlocks=G.decorUnlocks||{};for(const [slot,D] of Object.entries(CAMP_DECOR)){G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];for(const key of Object.keys(D.items))if(!decorUnlockReason(G,slot,key)&&!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);}}
// v1.83.1: two separate kinds — earned pieces come only from their condition; shop pieces are bought (late-game money sink)
function decorPrice(G,slot,key){const D=CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key];if(!D||!D.shop||!decorUnlockReason(G,slot,key))return 0;return D.price||0;}
function buyDecor(G,slot,key){const c=decorPrice(G,slot,key);if(!c||G.cash<c)return false;G.cash-=c;G.decorUnlocks=G.decorUnlocks||{};G.decorUnlocks[slot]=G.decorUnlocks[slot]||[];if(!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);G.decor=G.decor||{};G.decor[slot]=key;G.decorSpent=(G.decorSpent||0)+c;return true;}
// ===== v1.86: annual camp beauty contest =====
/* the district chief reads the year's lucky colour at new year; at week 30 he walks the camp and scores seven areas out of 10 */
const YEAR_COLORS=[{k:"red",n:"สีแดง",hex:"#d23246",luck:"สีแดงปีนี้ ใจกล้า สู้ไม่ถอย"},{k:"green",n:"สีเขียว",hex:"#3f9a4f",luck:"สีเขียวปีนี้ ร่มเย็น เติบโตงอกงาม"},
  {k:"blue",n:"สีน้ำเงิน",hex:"#2c5fb3",luck:"สีน้ำเงินปีนี้ ใจนิ่ง คิดการใหญ่สำเร็จ"},{k:"pink",n:"สีชมพู",hex:"#e07aa0",luck:"สีชมพูปีนี้ มีเสน่ห์ คนรักคนหลง"},
  {k:"white",n:"สีขาว",hex:"#f2f2f2",luck:"สีขาวปีนี้ บริสุทธิ์ใจ ผู้ใหญ่เมตตา"},{k:"orange",n:"สีส้ม",hex:"#e8892a",luck:"สีส้มปีนี้ ไฟแรง งานรุ่ง"},
  {k:"yellow",n:"สีเหลือง",hex:"#e0b41b",luck:"สีเหลืองปีนี้ ปัญญาเฉียบ เงินทองไหลมา"},{k:"gold",n:"สีทอง",hex:"#f2c14e",luck:"สีทองปีนี้ บารมีสูง เกียรติยศมาเยือน"}];
const DECOR_COL={tree:{plain:"green",blossom:"pink",sakura:"pink",champion:"gold",golden:"gold",flame:"red",lilawadee:"white",rachaphruek:"yellow",sritrang:"blue",thongkwao:"orange"},
  gate:{plain:"brown",painted:"red",lantern:"orange",trophy:"gold",gold:"gold",lanna:"brown",jade:"green",indigo:"blue",stucco:"white",bougain:"pink",marigold:"yellow"},
  ring:{plain:"white",red:"red",blue:"blue",sponsor:"purple",gold:"gold",green:"green",purple:"purple",black:"black",pink:"pink",orange:"orange",yellow:"yellow"},
  track:{dirt:"brown",chalk:"white",gravel:"brown",rubber:"red",lantern:"orange",blue:"blue",green:"green",pink:"pink",yellow:"yellow",goldcarpet:"gold"},
  vehicle:{songthaew:"green",minibus:"white",tourbus:"red",limo:"black",goldvan:"gold",rotdaeng:"red",pinkvan:"pink",bluevan:"blue",tuktuk:"orange",yellowthaew:"yellow"},
  bags:{plain:"brown",red:"red",blue:"blue",team:"purple",gold:"gold",green:"green",black:"black",pink:"pink",white:"white",orange:"orange",yellow:"yellow"}};
const COLOR_NAME={red:"สีแดง",green:"สีเขียว",blue:"สีน้ำเงิน",pink:"สีชมพู",white:"สีขาว",orange:"สีส้ม",yellow:"สีเหลือง",gold:"สีทอง",brown:"สีน้ำตาล",purple:"สีม่วง",black:"สีดำ"};
const COLOR_HEX={red:"#d23246",green:"#3f9a4f",blue:"#2c5fb3",pink:"#e07aa0",white:"#f2f2f2",orange:"#e8892a",yellow:"#e0b41b",gold:"#f2c14e",brown:"#8a5a32",purple:"#7a3fc0",black:"#24202c"};
const decorColor=(slot,key)=>(DECOR_COL[slot]||{})[key]||null;
function yearColor(G,season){const s=season||G.season||1;return YEAR_COLORS[(stableHash("ycol"+(G.seed||1))+s*3)%YEAR_COLORS.length];}
// v1.90: annual wai kru (week 37 ≈ Muay Thai Day, 6 Feb) — the whole camp pays respect to the teachers; new fighters are taken in as students (khrop khru)
const WAIKHRU_WEEK=37,WAI_SET={s:{n:"ชุดเรียบง่าย",d:"ดอกไม้ ธูป เทียน จากตลาดเช้า",cost:0,mor:4,bless:0},m:{n:"ชุดมาตรฐาน",d:"พานดอกมะลิ ผ้าขาว เงินกำนลครู",cost:2500,mor:7,bless:4},l:{n:"ชุดใหญ่เต็มพิธี",d:"พานบายศรี ปี่กลองสด เลี้ยงข้าวทั้งตำบล",cost:7000,mor:10,bless:8,rep:1}};
function runWaiKhru(G,k){const S=G.season||1;G.waikhru=G.waikhru||{};if(G.waikhru[S])return G.waikhru[S];const W=WAI_SET[k]||WAI_SET.s;if(G.cash<W.cost)return null;G.cash-=W.cost;
  const R=roster(G),krob=R.filter(f=>!f.krob&&f.id!=="kati").map(f=>f.id);R.forEach(f=>{f.morale=clamp(f.morale+W.mor,0,100);f.trust=clamp((f.trust||0)+(W.bless?2:1),0,100);f.krob=f.krob||S;});
  if(W.bless)G.waiBless=gameWeek(G)+W.bless;if(W.rep)G.rep+=W.rep;
  return G.waikhru[S]={k,ids:R.map(f=>f.id),krob,mor:W.mor,bless:W.bless,first:!Object.keys(G.waikhru).length};}
const CONTEST_WEEK=30,BEAUTY_RARITY={N:4,R:6,SR:7,SSR:8,SS:9},CONTEST_PRIZE=[30000,15000,8000];
const BEAUTY_AREAS=[["gate","ซุ้มทางเข้า"],["bags","กระสอบทราย"],["tree","ต้นไม้"],["ring","เวทีมวย"],["vehicle","รถประจำค่าย"],["track","ลู่วิ่ง"],["clean","ความสะอาด"]];
function beautyAreas(G){const yc=yearColor(G).k;return BEAUTY_AREAS.map(([k,n])=>{
  if(k==="clean"){const v=clamp(Math.round((G.camp&&G.camp.beauty)||0),1,10);return {k,n,score:v,base:v,match:false,item:v>=8?"ลานสะอาดเอี่ยม":v>=5?"ลานเรียบร้อย":"ยังรก ๆ อยู่"};}
  const key=decorChoice(G,k),D=CAMP_DECOR[k].items[key]||{},none=key==="none",base=none?1:BEAUTY_RARITY[D.r]||4,match=!none&&decorColor(k,key)===yc;
  return {k,n,score:Math.min(10,base+(match?2:0)),base,match,item:D.name||""};});}
const beautyTotal=G=>beautyAreas(G).reduce((s,a)=>s+a.score,0);
const RIVAL_CAMPS=[["ค่ายพยัคฆ์ทอง",7.1,.25],["ค่ายเพชรลานนา",6.0,.2],["ค่ายส.แม่ปิง",5.4,.18],["ค่ายลูกดอยคำ",4.8,.15]];
function runContest(G){const S=G.season||1;G.contests=G.contests||{};if(G.contests[S])return G.contests[S];const rng=mulberry32((G.seed||1)*17+S*9173);
  const areas=beautyAreas(G),me=areas.reduce((s,a)=>s+a.score,0);
  const field=RIVAL_CAMPS.map(([name,mu,gr])=>{let t=0;for(let i=0;i<7;i++)t+=clamp(Math.round(mu+(S-1)*gr+(rng()-.5)*2.4),2,10);return {name,score:Math.min(t,66)};});
  field.push({name:"ค่ายศิริชัย",score:me,me:true});field.sort((a,b)=>b.score-a.score||(b.me?1:0)-(a.me?1:0));const rank=field.findIndex(x=>x.me)+1;
  const prize=CONTEST_PRIZE[rank-1]||0,rep=[4,2,1][rank-1]||.5;G.cash+=prize;G.rep+=rep;if(rank===1){G.beautyWins=(G.beautyWins||0)+1;}
  const unlock=rank===1&&G.beautyWins===1?"ลู่วิ่งพรมทอง":null;if(unlock)grantDecorUnlocks(G);
  const R={season:S,color:yearColor(G).k,areas,total:me,field,rank,prize,rep,unlock};G.contests[S]=R;return R;}
function decorChoice(G,slot){const key=G.decor&&G.decor[slot];return decorUnlocked(G,slot,key)?key:decorDefault(slot);}
const FACILITIES={
  gym:{name:"อุปกรณ์ซ้อม",cost:[20000,35000,60000],desc:"ผลการฝึก +10% ต่อระดับ"},
  recovery:{name:"ห้องฟื้นฟูและอ่างน้ำแข็ง",cost:[15000,30000,50000],desc:"ฟื้นความล้า +5/สัปดาห์ ต่อระดับ"},
  classroom:{name:"ลานสอนคอร์ส",cost:[8000,14000,22000,32000,45000],desc:"รับนักเรียนได้เพิ่ม 3 คน ต่อระดับ"},
  brand:{name:"ป้ายและโปรโมทค่าย",cost:[8000,20000,40000,50000],desc:"คนอยากมาเรียนเพิ่ม 3 คน ต่อระดับ ชื่อเสียง +0.5"},
  dorm:{name:"ห้องพักนักมวย",cost:[30000,80000,180000,600000,1500000],desc:"ห้องนักมวยหลัก +1 ต่อระดับ (5 → 10 ห้อง) · กำลังใจ +1.5 และความเชื่อใจ +0.3 ทุกสัปดาห์ ต่อระดับ"} /* v1.91.122 (Man): a fifth level, up to ten rooms; levels 4–5 still open with the regional chapter and are priced as late-game money sinks (players hold millions by then) */,
  kitchen:{name:"ครัวโภชนาการ",cost:[10000,25000],desc:"ฟื้นความล้า +2 และลดโอกาสบาดเจ็บ 20% ต่อระดับ"},
  // v1.18: bigger projects that open up as the camp grows (late-game money sinks with real effects)
  hill:{name:"ลู่วิ่งขึ้นเขาหลังค่าย",cost:[20000,45000],desc:"ฝึกฟิตร่างกายได้ผล +20% และล้าน้อยลง ต่อระดับ",req:{week:12}},
  video:{name:"ห้องดูเทปวิเคราะห์",cost:[30000,60000],desc:"ความพร้อมในไฟต์ +0.8% ต่อระดับ · ดูเทปคู่ชกลดครึ่งราคา",req:{rep:15}},
  ring:{name:"เวทีมวยมาตรฐานในค่าย",cost:[45000,90000],desc:"EXP +15% ต่อระดับ · คนอยากเรียน +3 · รับครูเพิ่มได้ 1 คน",req:{lv:2}},
  clinic:{name:"คลินิกกายภาพบำบัด",cost:[35000,70000],desc:"ฟื้นความล้า +3/สัปดาห์ · หายเจ็บเร็วขึ้น ต่อระดับ",req:{week:20}},
  shrine:{name:"ศาลพ่อแก่ประจำค่าย",cost:[30000],desc:"ไหว้ครูทุกเช้า กำลังใจทุกคน +2/สัปดาห์ · ชื่อเสียง +1",req:{rep:22}},
  // v1.23: late-season money sinks, opened week by week so a full camp lands around week 45
  van:{name:"รถสองแถวรับส่งนักเรียน",cost:[20000,35000],desc:"คนอยากเรียน +4 ต่อระดับ",req:{week:24}},
  sauna:{name:"ห้องอบสมุนไพร",cost:[30000,50000],desc:"ฟื้นความล้า +3 · กำลังใจ +1 ทุกสัปดาห์ ต่อระดับ",req:{week:28}},
  lights:{name:"สปอตไลท์ซ้อมกลางคืน",cost:[40000,60000],desc:"ผลการฝึกทุกแบบ +6% ต่อระดับ",req:{week:32}},
  retreat:{name:"แคมป์เก็บตัวที่เชียงดาว",cost:[55000],desc:"ใช้ครั้งเดียว: พานักมวยทุกคนขึ้นดอยสองสัปดาห์ ค่าพลังหลัก +0.4 กำลังใจ +15 ความล้าหายหมด",req:{week:38}},
  airgym:{name:"ห้องซ้อมในร่มระบบกรองฝุ่น",cost:[250000],desc:"ห้องปิดติดแอร์และเครื่องกรองอากาศ ปีฝุ่น PM2.5 ซ้อมได้เต็มที่ · ผลการฝึกทุกแบบ +3%",req:{lv:2}},
  hall:{name:"มุมเกียรติยศปู่ชัย",cost:[50000,80000],desc:"ชื่อเสียง +1.5 · ชื่อเสียงลดช้าลง · กำลังใจ +1/สัปดาห์",req:{week:36}},
};
const facLocked=(G,k)=>{const r=FACILITIES[k].req;if(!r)return "";if(r.lv&&campLevel(G)<r.lv)return `ค่าย Lv.${r.lv}`;if(r.rep&&G.rep<r.rep)return `ชื่อเสียง ${r.rep}`;if(r.week&&G.week<r.week&&!(G.season>1))return `สัปดาห์ ${r.week}`;return "";};
// v1.18: hired trainers, each with a speciality and a face (pixel NPC sprite)
const STAFF={
  nok:{name:"ครูนก",role:"ครูหมัด",pre:"punch",fee:4000,wage:1500,desc:"ฝึกเน้นหมัดได้ผล +10%"},
  paeng:{name:"ครูแป้ง",role:"ครูเตะ",pre:"kick",fee:4000,wage:1500,desc:"ฝึกเน้นเตะได้ผล +10%"},
  yai:{name:"ครูใหญ่",role:"ครูวงใน",pre:"knee",pre2:"elbow",fee:5000,wage:1800,desc:"ฝึกเข่า-คลินช์ และศอก ได้ผล +10%",req:{rep:8}},
  ying:{name:"ครูหญิง",role:"ครูป้องกัน-สวน",pre:"defense",fee:5000,wage:1800,desc:"ฝึกป้องกัน-สวนได้ผล +10%",req:{rep:8}},
  tong:{name:"โค้ชต้อง",role:"เทรนเนอร์ฟิตเนส",pre:"cond",fee:6000,wage:2000,desc:"ฝึกฟิตร่างกายได้ผล +10% ล้าน้อยลง",req:{rep:12}},
  jan:{name:"ป้าจันทร์",role:"หมอนวดประจำค่าย",fee:6000,wage:2000,desc:"ทุกคนล้าลด 4/สัปดาห์ · กำลังใจ +1",req:{rep:16}},
  wit:{name:"อาจารย์วิทย์",role:"นักวิเคราะห์เกม",fee:9000,wage:2500,desc:"ความพร้อมในไฟต์ +1.2% · ดูเทปฟรี",req:{lv:2}},
};
const staffSlots=G=>1+campLevel(G)+((G.fac.ring||0)>=1?1:0);
const hasStaff=(G,k)=>(G.staff||[]).includes(k);
const staffLocked=(G,k)=>{const r=STAFF[k].req;if(!r)return "";if(r.lv&&campLevel(G)<r.lv)return `ค่าย Lv.${r.lv}`;if(r.rep&&G.rep<r.rep)return `ชื่อเสียง ${r.rep}`;return "";};
function hireStaff(G,k){const S=STAFF[k];G.staff=G.staff||[];if(!S||hasStaff(G,k)||G.staff.length>=staffSlots(G)||staffLocked(G,k)||G.cash<S.fee)return false;G.cash-=S.fee;G.staff.push(k);G.fac.assistants=G.staff.length;return true;}
function fireStaff(G,k){G.staff=(G.staff||[]).filter(x=>x!==k);G.fac.assistants=G.staff.length;return true;}
function fixSave(G){if(typeof byCampKit==="function")byCampKit(G); /* v1.91.166: Baiyok in the camp gets her tree *//* v1.91.42: a card counts as read only if its story was ever opened (o.seen is set only there) — v1.91.41 wrongly marked every owned card read */if(G&&(G.cardRd||0)<2){for(const k in (G.cards||{})){const o=G.cards[k];o.rd=o.seen?1:0;}G.cardRd=2;}if(G&&G.F&&typeof hmFix==="function")hmFix(G);if(G&&G.F&&typeof monoFix==="function")monoFix(G);if(G&&G.ev&&G.ev.loy&&typeof thiefFix==="function")thiefFix(G);if(G&&G.F&&G.prodigy)fixProdigies(G);if(G&&G.flags&&G.flags.beat_ploy&&G.flags.beatS_ploy==null)G.flags.beatS_ploy=G.season||1;
  // Legacy saves used week-of-season values. Infer only short, plausible effects;
  // otherwise expire them instead of resurrecting an old effect after New Year.
  const now=gameWeek(G),base=now-G.week;
  const oldExpiry=(w,max=6)=>{if(!Number.isFinite(w))return null;
    for(const t of [base+w,base-52+w])if(t>=now&&t-now<=max)return t;
    return null;};
  const oldPast=(w,max)=>{if(!Number.isFinite(w))return null;
    for(const t of [base+w,base-52+w])if(t<=now&&now-t<=max)return t;
    return null;};
  if(G.disaster){if(!Number.isFinite(G.disaster.untilAbs))G.disaster.untilAbs=oldExpiry(G.disaster.until,4);
    if(G.disaster.untilAbs==null||G.disaster.untilAbs<=now)G.disaster=null;}
  G.scout=G.scout||{};G.scoutAbs=G.scoutAbs||{};
  for(const [id,w] of Object.entries(G.scout)){if(G.scoutAbs[id]==null)G.scoutAbs[id]=oldPast(w,8);delete G.scout[id];}
  if(G.rinTapeWk!=null&&G.rinTapeAbs==null)G.rinTapeAbs=oldPast(G.rinTapeWk,3);
  G.rinTapeWk=null;
  if(G.coachAway&&G.coachAwayAbs==null)G.coachAwayAbs=oldExpiry(G.coachAway,4);
  G.coachAway=null;
  if(!G.timeV){for(const [k,w] of Object.entries(G.mem||{}))G.mem[k]=oldPast(w,52)??0;
    if(G.snap&&G.snap.week!=null)G.snap.week=oldPast(G.snap.week,52)??now;
    if(G.lastBeat)G.lastBeat=oldPast(G.lastBeat,2)??0;
    if(G.lastDilemma)G.lastDilemma=oldPast(G.lastDilemma,2)??0;
    for(const f of Object.values(G.F||{})){if(f.giftWeek!=null)f.giftWeek=oldPast(f.giftWeek,0);
      for(const [k,w] of Object.entries(f.giftL||{})){const t=oldPast(w,6);if(t==null){delete f.giftL[k];if(f.giftN)f.giftN[k]=0;}else f.giftL[k]=t;}}
    for(const p of G.pets||[])if(p.wk!=null)p.wk=oldPast(p.wk,0);
    for(const l of G.losses||[])if(l.absWeek==null)l.absWeek=oldPast(l.wk,6);
    for(const c of G.cal||[])if(c.absWeek==null)c.absWeek=oldPast(c.wk,1);
    for(const m of G.mail||[]){if(m.exp!=null&&m.expAbs==null)m.expAbs=oldExpiry(m.exp,4);
      if(m.exp!=null&&m.expAbs==null&&!m.done)m.expired=true;}
    if(G.gang&&G.gang.next!=null&&G.gang.nextAbs==null)G.gang.nextAbs=oldExpiry(G.gang.next,6);
    if(G.tamNext!=null&&G.tamNextAbs==null)G.tamNextAbs=oldExpiry(G.tamNext,6);
    G.timeV=2;}
  if((G.timeV||0)<3){for(const f of Object.values(G.F||{})){if(f.lastFightAbs==null&&f.lastFight>0)f.lastFightAbs=oldPast(f.lastFight,52);f.lockWeek=null;}
    if(G.romWk!=null)G.romWk=oldPast(G.romWk,52);
    if(G.lastBig&&!G.lastBig.shown){G.lastBig.absWeek=oldPast(G.lastBig.wk,1);if(G.lastBig.absWeek==null)G.lastBig.shown=true;}
    for(const [id,w] of Object.entries(G.tiredAt||{}))G.tiredAt[id]=oldPast(w,3);
    for(const id of ["fah","ploy"]){const key=id+"Joined",old=G.flags?.[key];if(old!=null&&G.flags[key+"Abs"]==null)G.flags[key+"Abs"]=oldPast(old,52);}
    G.seenAbs=G.seenAbs||{};for(const [id,w] of Object.entries(G.seenWk||{}))G.seenAbs[id]=oldPast(w,3);
    G.chatLastAbs=G.chatLastAbs||{};for(const [id,w] of Object.entries(G.chatLast||{}))G.chatLastAbs[id]=oldPast(w,3);
    G.chatWkAbs=G.chatWkAbs||{};for(const [id,w] of Object.entries(G.chatWk||{}))G.chatWkAbs[id]=oldPast(w,52);
    if(G.flags?.maliIn!=null&&G.flags.maliInAbs==null)G.flags.maliInAbs=oldPast(G.flags.maliIn,52);
    if(G.dm?.wk!=null&&G.dm.absWeek==null)G.dm.absWeek=oldPast(G.dm.wk,2);
    G.timeV=3;}
  /* v1.89.11: one lover became a list (several at once, Valentine can catch you) */
  if(!Array.isArray(G.lovers)){G.lovers=G.romance?[G.romance]:[];G.lovWk={};if(G.romance&&G.romWk!=null)G.lovWk[G.romance]=G.romWk;}
  if(!G.snubV){G.snub={};G.declineReason={};G.snubV=2;}
  if(G.dmSeenSeason==null){const played=G.dm&&G.dm.wk===G.week;G.dmSeen=(G.season||1)>1?{}:G.dmSeen||{};if(played)G.dmSeen[G.week]=1;G.dmSeenSeason=G.season||1;}
  syncFighterAges(G);
if(G.F)for(const id in G.F){const f=G.F[id];if(f&&hasTree(id)&&!f.spv){f.sp=(f.sp||0)+2*Math.max(0,(f.lvl||1)-1);f.spv=2;}if(f)spFloor(f);}if(!G.oppHist&&G.F)oppHistTick(G,true); /* v1.91.80: start the record */G.fac=G.fac||{};for(const k of Object.keys(FACILITIES))G.fac[k]=G.fac[k]||0;G.fac.daeng=G.fac.daeng||1;
  if(!G.staff){G.staff=["nok","paeng"].slice(0,G.fac.assistants||0);}G.fac.assistants=G.staff.length;
  if(G.stu==null)G.stu=Math.min(studentCap(G),studentDemand(G));G.mail=G.mail||[];G.cal=G.cal||[];if((G.season||1)>=2&&(!G.yt||G.yt.season!==(G.season||1))&&G.week<=3)pickYearTheme(G);
  if(!Array.isArray(G.honors)){G.honors=[];for(const t of G.titles||[])for(const [div,id] of Object.entries(t.champ||{}))if(G.F[id]?.camp==="player")G.honors.push({key:`${t.season}:province:${div}`,season:t.season,week:49,id,div,kind:"province"});
    for(const [div,id] of Object.entries(G.champ||{}))if(G.F[id]?.camp==="player")G.honors.push({key:`${G.season||1}:province:${div}`,season:G.season||1,week:49,id,div,kind:"province"});
    (G.dmLog||[]).forEach((x,i)=>{if(G.F[x.champ]?.camp==="player")G.honors.push({key:`legacy:dm:${i}`,season:null,week:x.wk,id:x.champ,div:G.F[x.champ].div,kind:"dm"});});
    for(const [div,b] of Object.entries(G.belt||{}))if(G.F[b.id]?.camp==="player")G.honors.push({key:`legacy:belt:${div}`,season:null,week:b.since||0,id:b.id,div,kind:"belt"});
    for(const f of Object.values(G.F))if(f.camp==="player"&&f.belts>0&&!G.honors.some(h=>h.kind==="belt"&&h.id===f.id))G.honors.push({key:`legacy:belt:${f.id}`,season:null,week:0,id:f.id,div:f.div,kind:"belt"});}
  G.awards=Array.isArray(G.awards)?G.awards:[];G.rank=G.rank||{A:{},B:{}};for(const d of ["A","B"])G.rank[d]=G.rank[d]||{};for(const f of Object.values(G.F))if(f.camp!=="free"&&f.camp!=="quest"&&(f.div==="A"||f.div==="B")&&!G.rank[f.div][f.id])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};G.decor=G.decor||{};if(G.goldHelmetWins==null)G.goldHelmetWins=G.gang&&G.gang.st>=5?1:0;grantDecorUnlocks(G);for(const [slot,key] of Object.entries(G.decor))if(CAMP_DECOR[slot]&&CAMP_DECOR[slot].items[key]&&!G.decorUnlocks[slot].includes(key))G.decorUnlocks[slot].push(key);lateSeasonOpposition(G);return G;}
function recordHonor(G,kind,id,div,week=G.week,venue=null,opp=null,oppId=null){if(!G.F[id]||G.F[id].camp!=="player")return null;G.honors=G.honors||[];G.awards=G.awards||[];
  const season=G.season||1,key=`${season}:${kind}:${div}:${venue||""}:${kind==="dm"||kind==="belt"||kind==="defense"?week:id}`;
  if(G.honors.some(h=>h.key===key))return null;const h={key,season,week,id,div,kind,...(venue?{venue}:{}),...(opp?{opp}:{}),...(oppId&&G.F[oppId]&&oppId!==id?{oppId}:{})};G.honors.push(h);G.awards.push(h);return h;}
const DAENG_COST=[0,15000,30000];
function facTotal(G){return Object.keys(FACILITIES).reduce((s,k)=>s+(G.fac[k]||0),0)+(G.fac.daeng-1);}
function campLevel(G){const t=facTotal(G);return t>=13?3:t>=5?2:1;}
const CAMP_LV_NAME=["","ค่ายเก่าทรุดโทรม","ค่ายที่กำลังฟื้นตัว","ค่ายมวยทันสมัย"];
// v1.23: the class starts with one student and grows a person or two a week; a fully built camp holds 30
const STU_MAX=30;
function studentCap(G){return Math.min(STU_MAX,6+G.fac.classroom*3+(G.fac.daeng-1)*2+Math.min(5,G.staff?G.staff.length:G.fac.assistants));}
function studentDemand(G){return Math.round(3+Math.min(G.rep,30)*.4+G.fac.brand*3+(G.fac.ring||0)*2+(G.fac.van||0)*4+campLevel(G)*2+(G.camp?G.camp.beauty:0)*.4);}
function students(G){if(G.stu==null)G.stu=Math.min(studentCap(G),studentDemand(G));return Math.min(G.stu,studentCap(G));}
function growStudents(G){const t=Math.min(studentCap(G),studentDemand(G)),n=students(G);G.stu=n<t?n+(t-n>=8?2:1):n>t?n-1:n;}
const studentFee=G=>Math.round(dif(G).inc*560*(1+(G.fac.daeng-1)*.12)*(1+(campLevel(G)-1)*.2));
const classIncome=G=>Math.round(students(G)*studentFee(G)*(ytKey(G)==="tourist"?1.2:1)*(G.disaster&&gameWeek(G)<G.disaster.untilAbs?(G.disaster.inc||0):1));
function campLook(G){return clamp(Math.round(facTotal(G)+(G.camp?G.camp.beauty:0)/2+Math.min(G.rep,30)/8),0,20);}
/* v1.90: the dorm's fourth level (v1.91.122: and fifth) opens with the regional chapter · main characters get 5 + dorm level rooms */
const facMax=(G,k)=>k==="dorm"&&!G.region?3:FACILITIES[k].cost.length;
const dormRooms=G=>5+((G.fac&&G.fac.dorm)||0);
function buyFacility(G,k){const F=FACILITIES[k],lv=G.fac[k]||0;if(lv>=facMax(G,k)||facLocked(G,k))return false;const c=F.cost[lv];if(G.cash<c)return false;
  G.cash-=c;G.fac[k]=lv+1;if(k==="brand")G.rep+=.5;if(k==="shrine")G.rep+=1;if(k==="hall")G.rep+=1.5;if(k==="retreat")roster(G).forEach(f=>{["punch","kick","knee","elbow","clinch","guard","foot","stamina","power","speed"].forEach(q=>{f.a[q]=Math.min(Math.max(f.a[q],f.potential||18),f.a[q]+.4);});f.morale=Math.min(100,f.morale+15);f.fatigue=0;});return true;}
function upgradeDaeng(G){const lv=G.fac.daeng;if(lv>=3)return false;const c=DAENG_COST[lv];if(G.cash<c)return false;G.cash-=c;G.fac.daeng++;return true;}
const CAMP_ACTIONS={
  rest:{name:"วันหยุดค่าย (ไม่จัดกิจกรรม)",desc:"ไม่เสียเงิน ทุกคนได้พัก ความล้า -4",cost:0},
  // v1.68: minigames live inside camp activities — play it yourself, or skip for an average result
  drum:{name:"ซ้อมเตะกระสอบตามกลองแขก",desc:"มินิเกมจังหวะ · ค่าเตะ/หมัด กำลังใจ เศษดาว",skip:"ค่าเตะ/หมัด +0.1 · กำลังใจ +3 · ✦ +2",cost:0,mg:"bag"},
  somtam:{name:"ช่วยร้านส้มตำป้าแต๋ว",desc:"มินิเกมจังหวะ · ค่าจ้าง ชื่อเสียง เศษดาว",skip:"ได้ ฿550 · กำลังใจ +3 · ✦ +1",cost:0,mg:"somtam",hidden:true},/* v1.69: now arrives as a job letter; kept so old saves still resolve its name */
  class:{name:"สอนคลาสพิเศษวันอาทิตย์",desc:"ได้ ฿1,000 แต่นักมวยต้องช่วยสอน ความล้า +6",cost:0},
  promo:{name:"โปรโมทค่ายออนไลน์",desc:"ชื่อเสียง +0.6",cost:1000},
  run:{name:"วิ่งแข่ง 100 เมตรในค่าย",desc:"มินิเกมวิ่ง · ความเร็ว/ความอึด กำลังใจ เศษดาว",skip:"ความเร็ว +0.05 · กำลังใจ +3 · ✦ +1",cost:0,mg:"run"},
  live:{name:"ไลฟ์ขายของค่าย",desc:"มินิเกมไลฟ์ · กำไรจากยอดขาย ชื่อเสียง เศษดาว",skip:"ขายได้ ฿600 · ✦ +1",cost:0,mg:"live"},
  repair:{name:"ซ่อมแซมค่ายด้วยกัน",desc:"ค่ายสวยขึ้น กำลังใจ +3",cost:1500},
  merit:{name:"ทำบุญตักบาตรเช้า",desc:"กำลังใจทุกคน +5 ความเชื่อใจ +1",cost:300},
  // v1.13: more activities unlock as the camp's name grows
  clip:{name:"ถ่ายคลิปซ้อมลงโซเชียล",desc:"ชื่อเสียง +0.9 · ล้า +3",cost:500,rep:10},
  spar:{name:"จัดชกซ้อมภายในค่าย",desc:"ทุกคนได้ EXP +25 · ล้า +8",cost:0,rep:16},
  ladies:{name:"คลาสมวยฟิตเนสสำหรับผู้หญิง",desc:"ได้ ฿2,500 · ล้า +5",cost:0,rep:24},
  massage:{name:"เชิญหมอนวดแผนไทยมาที่ค่าย",desc:"ความล้า −12 · กำลังใจ +3",cost:2500,rep:32},
  media:{name:"รับสื่อมาทำสกู๊ปค่าย",desc:"ชื่อเสียง +2 · กำลังใจ +4",cost:0,rep:44},
  // v1.21: building the camp opens more things to do
  kids:{name:"คลาสมวยเด็กเล็ก",desc:"ได้ ฿1,800 · ชื่อเสียง +0.4 · ล้า +3",cost:0,fac:["classroom",2]},
  stall:{name:"ออกบูธขนมครกที่ตลาดนัด",desc:"ได้ ฿1,500 · ชื่อเสียง +0.3 · กำลังใจ +2",cost:300,fac:["kitchen",1]},
  tourist:{name:"รับนักท่องเที่ยวมาเรียนมวย",desc:"ได้ ฿3,500 · ล้า +7",cost:0,fac:["brand",1]},
  trail:{name:"วิ่งเทรลขึ้นดอยสุเทพ",desc:"ความอึดทุกคน +0.2 · ล้า +5 · กำลังใจ +2",cost:200,fac:["hill",1]},
  tape:{name:"คืนดูเทปไฟต์เก่าด้วยกัน",desc:"EXP +15 · ดูเทปคู่ชกที่รับไว้ทั้งหมดฟรี",cost:0,fac:["video",1]},
  fightnight:{name:"จัดไฟต์ไนท์ในค่าย ขายตั๋ว",desc:"ได้ ฿4,000 · ชื่อเสียง +1 · ล้า +6",cost:0,fac:["ring",1]},
  clinicday:{name:"วันฟื้นฟูที่คลินิก",desc:"ความล้า −15 · บาดเจ็บหายเร็วขึ้น 1 สัปดาห์",cost:1000,fac:["clinic",1]},
  mask:{name:"แจกหน้ากากกันฝุ่นให้ชาวบ้าน",desc:"ชื่อเสียง +1.5 · กำลังใจ +2 (ช่วงฝุ่น PM2.5 เท่านั้น)",cost:3000,yt:"pm25"},
  waikhru:{name:"พิธีไหว้ครูที่ศาลพ่อแก่",desc:"กำลังใจทุกคน +8 · ความเชื่อใจ +2 · ชื่อเสียง +1",cost:3000,fac:["shrine",1]},
};
const campActLocked=(G,a)=>a.yt&&!ytIn(G,a.yt)?"ช่วงฝุ่น PM2.5 เท่านั้น":a.rep&&G.rep<a.rep?`ชื่อเสียง ${a.rep}`:a.fac&&(G.fac[a.fac[0]]||0)<a.fac[1]?`${FACILITIES[a.fac[0]].name}${a.fac[1]>1?` ระดับ ${a.fac[1]}`:""}`:"";
function doCampAction(G,k){const A=CAMP_ACTIONS[k];if(!A||G.campUsed||G.cash<A.cost||campActLocked(G,A))return null;G.cash-=A.cost;G.campUsed=k;const R=roster(G);let note="";
  if(k==="rest"){R.forEach(f=>f.fatigue=clamp(f.fatigue-4,0,100));note="ทุกคนได้พักหายใจ ความล้าลดลงนิดหน่อย";}
  if(k==="class"){G.cash+=1000;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="ได้เงินเพิ่ม ฿1,000 นักมวยเหนื่อยขึ้นนิดหน่อย";}
  if(k==="promo"){G.rep+=.6;note="ชื่อเสียง +0.6";}
  if(k==="run"){const f=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];if(f)f.a.speed=Math.min(stCap(f),f.a.speed+.05);R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+1;note="วิ่งแข่งกันรอบลานค่าย ความเร็ว +0.05 · ✦ +1";}
  if(k==="live"){G.cash+=600;G.dust=(G.dust||0)+1;note="ไลฟ์สั้น ๆ ขายเสื้อได้ไม่กี่ตัว ได้ ฿600 · ✦ +1";}
  if(k==="drum"){const f=R.slice().sort((a,b)=>(b.bond||0)-(a.bond||0))[0];if(f){f.a.kick=Math.min(stCap(f),f.a.kick+.1);f.a.punch=Math.min(stCap(f),f.a.punch+.1);}R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+2;note="ซ้อมตามกลองแขกกันเบา ๆ ค่าเตะ/หมัด +0.1 · ✦ +2";}
  if(k==="somtam"){G.cash+=550;R.forEach(x=>x.morale=clamp(x.morale+3,0,100));G.dust=(G.dust||0)+1;note="ช่วยป้าแต๋วตำส้มตำ ได้ ฿550 · ✦ +1";}
  if(k==="repair"){G.camp.beauty=Math.min(10,G.camp.beauty+1);R.forEach(f=>f.morale=clamp(f.morale+3,0,100));note=`ค่ายสวยขึ้น (ระดับ ${G.camp.beauty}/10)`;}
  if(k==="clip"){G.rep+=.9;R.forEach(f=>f.fatigue=clamp(f.fatigue+3,0,100));note="คลิปมีคนแชร์ ชื่อเสียง +0.9";}
  if(k==="spar"){R.forEach(f=>{gainXP(G,f,25);f.fatigue=clamp(f.fatigue+8,0,100);});note="ทุกคนได้ประสบการณ์ +25";}
  if(k==="ladies"){G.cash+=2500;R.forEach(f=>f.fatigue=clamp(f.fatigue+5,0,100));note="ได้เงินเพิ่ม ฿2,500";}
  if(k==="massage"){R.forEach(f=>{f.fatigue=clamp(f.fatigue-12,0,100);f.morale=clamp(f.morale+3,0,100);});note="ทุกคนตัวเบาขึ้น ความล้า −12";}
  if(k==="media"){G.rep+=2;R.forEach(f=>f.morale=clamp(f.morale+4,0,100));note="สกู๊ปค่ายออกอากาศ ชื่อเสียง +2";}
  if(k==="merit"){R.forEach(f=>{f.morale=clamp(f.morale+5,0,100);f.trust=clamp(f.trust+1,0,100);});note="ทุกคนอารมณ์ดีขึ้น";}
  if(k==="kids"){G.cash+=1800;G.rep+=.4;R.forEach(f=>f.fatigue=clamp(f.fatigue+3,0,100));note="เด็ก ๆ ไหว้ครูกันน่ารักมาก ได้ ฿1,800";}
  if(k==="stall"){G.cash+=1500;G.rep+=.3;R.forEach(f=>f.morale=clamp(f.morale+2,0,100));note="ขนมครกขายหมดเกลี้ยง ได้ ฿1,500";}
  if(k==="tourist"){G.cash+=3500;R.forEach(f=>f.fatigue=clamp(f.fatigue+7,0,100));note="นักท่องเที่ยวติดใจ ได้ ฿3,500 แต่นักมวยเหนื่อยไม่น้อย";}
  if(k==="trail"){R.forEach(f=>{f.a.stamina=Math.min(stCap(f),f.a.stamina+.2);f.fatigue=clamp(f.fatigue+5,0,100);f.morale=clamp(f.morale+2,0,100);});note="วิวบนดอยสวยมาก ความอึด +0.2";}
  if(k==="tape"){R.forEach(f=>gainXP(G,f,15));G.scoutAbs=G.scoutAbs||{};for(const b of G.bookings)if(G.F[b.a].camp==="player")G.scoutAbs[b.b]=gameWeek(G);note="ดูเทปคู่ชกที่รับไว้ครบทุกคน EXP +15";}
  if(k==="fightnight"){G.cash+=4000;G.rep+=1;R.forEach(f=>f.fatigue=clamp(f.fatigue+6,0,100));note="ตั๋วขายหมด คนดูแน่นเวที ได้ ฿4,000";}
  if(k==="clinicday"){R.forEach(f=>{f.fatigue=clamp(f.fatigue-15,0,100);if(f.injury>0)f.injury--;});note="ทุกคนตัวเบา ความล้า −15";}
  if(k==="mask"){G.rep+=1.5;R.forEach(f=>f.morale=clamp(f.morale+2,0,100));note="ชาวบ้านใส่หน้ากากลายค่ายศิริชัยกันทั้งตำบล ชื่อเสียง +1.5";}
  if(k==="waikhru"){G.rep+=1;R.forEach(f=>{f.morale=clamp(f.morale+8,0,100);f.trust=clamp(f.trust+2,0,100);});note="พิธีไหว้ครูขลังมาก ทุกคนใจฮึกเหิม";}
  return note;}
// advisor: estimate win chance per plan
// v1.32 corner odds: replay the rest of the fight from this break with each order, many times — the coach's "win chance" estimate
function cloneFight(F,seed){const side=s=>{const f=s.f;const c=structuredClone({...s,f:null});c.f=f;return c;};
  return {...F,rng:mulberry32(seed),A:side(F.A),B:side(F.B),cards:F.cards.map(c=>c.slice()),logs:[],rlog:[],result:null,kd0:F.kd0?{...F.kd0}:F.kd0};}
function cornerOdds(F,n=14){const out={};for(const k of Object.keys(CORNER)){let w=0;
    for(let i=0;i<n;i++){let C;try{C=cloneFight(F,(F.seed||1)*31+F.round*977+i*13);}catch(e){return null;}
      C.A.instr=k;C.B.instr=aiCorner(C,C.B,C.A);let first=true;
      while(!C.over){if(!first){C.A.instr=aiCorner(C,C.A,C.B);C.B.instr=aiCorner(C,C.B,C.A);}first=false;fightRound(C);}
      if(C.result.win==="A")w++;else if(C.result.win==="D")w+=.5;}
    out[k]=w/n;}return out;}
function advise(G,a,b,rounds,n=40){const fa=G.F[a],fb=G.F[b];const res={};
  for(const plan of Object.keys(PLANS)){let w=0;for(let i=0;i<n;i++){const F=newFight(fa,fb,{seed:9001+i*7,rounds,planA:plan});
    while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}if(F.result.win==="A")w++;else if(F.result.win==="D")w+=.5;}res[plan]=w/n;}
  const best=Object.entries(res).sort((x,y)=>y[1]-x[1])[0];return {rates:res,best:best[0],bestRate:best[1],base:res.balanced};}
// v1.51: camp pets — they join through little stories, wander the yard, and cheer the team up once a week
const PETS={cat:{name:"แมวส้ม",food:150,eff:"ทุกคนกำลังใจ +2"},dog:{name:"หมาไทยหลังอาน",food:250,eff:"ทุกคนความล้า −3"},rooster:{name:"ไก่ชนปลดระวาง",food:100,eff:"ทุกคนกำลังใจ +1 · ความล้า −1"},turtle:{name:"เต่าวัด",food:80,eff:"ทุกคนกำลังใจ +3 (ใจเย็นลง)"},otter:{name:"ลูกนากริมน้ำ",food:0,eff:"ว่ายน้ำเป็นเพื่อนคนซ้อม · ทุกคนความล้า −1"}};
const PET_NAMES={cat:["ส้มโอ","ขนมปัง","ตูบตู่"],dog:["ไอ้ทอง","ข้าวตู","เจ้าโกโก้"],rooster:["เจ้าเขียว","พญาไก่","โก๊ะ"],turtle:["ช้า ๆ","โมจิ","หลวงปู่"],otter:["น้ำปิง","กระทง","ข้าวเหนียว"]};
const petFood=G=>(G&&G.pets||[]).reduce((s,p)=>s+(PETS[p.k]?PETS[p.k].food:0),0);
function petPlay(G,i){const p=(G.pets||[])[i];if(!p||p.wk===gameWeek(G))return false;p.wk=gameWeek(G);p.joy=Math.min(100,(p.joy||50)+10);const R=roster(G);
  if(p.k==="cat")R.forEach(f=>f.morale=Math.min(100,f.morale+2));if(p.k==="dog")R.forEach(f=>f.fatigue=Math.max(0,f.fatigue-3));
  if(p.k==="rooster")R.forEach(f=>{f.morale=Math.min(100,f.morale+1);f.fatigue=Math.max(0,f.fatigue-1);});if(p.k==="turtle")R.forEach(f=>f.morale=Math.min(100,f.morale+3));
  if(p.k==="otter")R.forEach(f=>f.fatigue=Math.max(0,f.fatigue-1)); /* v1.89.25: the Loy Krathong otter helps a little (Man's call) */
  const fav=p.fav&&G.F[p.fav];if(fav&&fav.camp==="player")fav.morale=Math.min(100,fav.morale+3);return true;}
const upkeep=G=>1800+(G?facTotal(G)*220+[0,0,800,1800][campLevel(G)]+petFood(G):0); // v1.43: a bigger camp costs more to run
function weeklyNet(G){return classIncome(G)-upkeep(G)-wages(G);}

function eligible(G,f){const st=stageOf(G.week);
  if(st==="local")return true; if(st==="district")return G.qual[f.div].includes(f.id); return false;}
function isBooked(G,id,week){return !!(G.dm&&!G.dm.done&&(week==null||week===G.dm.wk)&&(G.dm.slots||[]).includes(id))||G.bookings.some(b=>(b.a===id||b.b===id)&&(week==null||b.week===week));}

const CROSS_OF={kati:"fah",mali:"ploy",rin:"fah"},SPECIAL_WEEKS=[8,13,18,23,28,33,38,42];
const RIVAL_OF={kati:"ploy",mali:"fah"},RIVAL_WEEKS=[25,29,33,36],RIVAL_EARLY={mali:[7,12,17,21]};
// v1.21: promoters keep calling even when a fight is booked (further out), more calls with fame,
// and each batch mixes an easier bout, an even one and (with fame) a step up — a real challenge curve
// v1.43: a plain difficulty label for a matchup
function diffTag(me,op){const d=effGap(typeof G!=="undefined"?G:null,me,op);return d<-.6?["easy","ง่าย"]:d<.35?["even","สูสี"]:d<1.1?["hard","ยาก"]:["vhard","ยากมาก"];}
const OFFER_BANDS=[-.7,.45,1.4,.9],EFF_BANDS=[-.9,-.1,.8,.3];
/* v1.83.1: our fighters are stronger than their stats show — skills, mastery, aura, grit, facilities and the corner picking the right plan.
   Measure that edge (in stat points) by sparring a mirror with none of it but a known ring-craft lead; from year 2 matchmaking, the field and rewards all use it. */
const _edge={};
function hiddenEdge(f){if(!f||f.camp!=="player")return 0;const key=(traitOf(f)||"")+traitLv(f)+":"+(f.lvl||1)+":"+Object.values(f.skills||{}).reduce((s,v)=>s+v,0)+":"+(f.equip||[]).join()+":"+Math.round(ovr(f.a)*2)/2+":"+(f.aura||0)+":"+(f.grit||0)+":"+(f.facPrep||0)+":"+hasSignature(f);
  if(_edge[f.id]&&_edge[f.id].k===key)return _edge[f.id].v;
  /* v1.91.116 (Man): the cache key rounds her stats to half a point (was a tenth) — the panel costs 2.5× the old clone test, so it re-measures only when she has really grown
     v1.91.116 (Man): measured against a panel of five sparring partners, one per fight style, instead of a flat-stat clone of herself.
     The clone always fought one style (counter), so a line whose style beat it looked far stronger than it plays (Mali's elbow line 3.6 vs her kick line 1.8,
     though the kick line wins 75% of league bouts and the elbow line 47%). Panel average tracks real league results (r .88, was .52); EDGE_CAL keeps the overall level */
  const me={...f,a:{...f.a},morale:65,fatigue:0,injury:0},OFF=3,o=ovr(f.a),n=8;let lsum=0;
  for(const st of Object.keys(EDGE_PANEL)){const T=EDGE_PANEL[st],a={};for(const k of Object.keys(f.a))a[k]=o+(T[k]||0);const d=o-ovr(a);for(const k in a)a[k]+=d;
    const op={...f,id:"_panel_"+st,camp:"npc",canon:false,trait:null,fstyle:st,fstyleN:null,rgSty:null,nlsk:null,vet:OFF,a,skills:{},equip:[],aura:0,grit:0,counterPrep:false,prepBonus:false,ployNotes:false,labPrep:0,morale:65,fatigue:0,injury:0};
    let best=0;for(const plan of Object.keys(PLANS)){let w=0;for(let i=0;i<n;i++){const F=newFight(me,op,{seed:7001+i*13,rounds:3,planA:plan});
      while(!F.over){F.A.instr=aiCorner(F,F.A,F.B);F.B.instr=aiCorner(F,F.B,F.A);fightRound(F);}w+=F.result.win==="A"?1:F.result.win==="D"?.5:0;}best=Math.max(best,w/n);}
    const r=clamp(best,.03,.97);lsum+=Math.log(r/(1-r));}
  const v=Math.max(0,OFF+lsum/5/.9-EDGE_CAL);_edge[f.id]={k:key,v};return v;}
const EDGE_PANEL={power:{punch:1.5,power:1.5,speed:-1,foot:-.5},pressure:{elbow:1,stamina:1.5,power:.5,guard:-1,counter:-.5},counter:{counter:1.5,guard:1.5,iq:1,power:-1,stamina:-.5},footwork:{foot:1.5,kick:1.5,speed:1,clinch:-1,power:-.5},inside:{knee:1.5,clinch:1.5,dur:1,foot:-1,speed:-.5}},EDGE_CAL=.55;
const edgeOf=(G,f)=>f&&f.camp!=="player"?(f.vet||0):(G&&(G.season||1)>=2)?hiddenEdge(f):0;
const effOvr=(G,f)=>ovr(lbA(f.a))+edgeOf(G,f);
/* how much harder `op` is than `me` once the hidden edge is counted (positive = tougher) */
/* v1.88: like an RPG enemy level, an opponent's level follows her real strength (stats + ring craft),
   on the same scale our own fighters reach (fitted from long bot runs: our Lv 8 ≈ 12, Lv 15 ≈ 17 effective).
   Our fighters and the five canon girls keep the level they earned. */
const LV_BASE=6,LV_STEP=.75;
function powLv(f){return clamp(Math.round((ovr(f.a)+(f.vet||0)-LV_BASE)/LV_STEP),1,MAX_LV);}
/* v1.88: read against our own camp. An even opponent sits at our best fighter's level in that division; the gap comes from
   simulated fights (the same coach advice the offers use), so hidden edges — Ploy's aura, Vector lab prep, rage — count too.
   Win 50% = same level · ~25% = about +2.5 · ~10% = about +5. The level shown never drops, so an improved opponent reads higher. */
const LV_LOGIT=.44,_lvc={};
function lvRef(G,f){if(!G||!G.F)return null;const P=Object.values(G.F).filter(x=>x.camp==="player"&&x.a);const mine=P.filter(x=>x.div===f.div);const L=mine.length?mine:P;if(!L.length)return null;
  let best=null,be=-1e9;for(const x of L){const e=effOvr(G,x);if(e>be){be=e;best=x;}}return best;}
function lvRate(G,me,op){const k=(G.season||1)+"_"+G.week+"_"+me.id+"_"+op.id;if(_lvc[k]==null){try{_lvc[k]=advise(G,me.id,op.id,3,24).bestRate;}catch(e){_lvc[k]=-1;}}return _lvc[k];}
function lvInfo(f){if(!f)return {lv:1,rate:null};if(f.camp==="player"||f.canon)return {lv:f.lvl||1,rate:null};
  const g=typeof G!=="undefined"?G:null,me=lvRef(g,f);let v=powLv(f),rate=null;
  if(me){rate=lvRate(g,me,f);if(rate>=0){const r=clamp(rate,.03,.97);v=clamp(Math.round((me.lvl||1)-Math.log(r/(1-r))/LV_LOGIT),1,MAX_LV);}else rate=null;}
  if(f.plv&&f.plv>v)v=f.plv;f.plv=v;return {lv:v,rate,me};}
function lvOf(f){return lvInfo(f).lv;}
const effGap=(G,me,op)=>ovr(lbA(op.a))-ovr(lbA(me.a))+((op.lvl||1)-(me.lvl||1))*.15-edgeOf(G,me)+edgeOf(G,op);
function genOffers(G,opt){
  const rng=mulberry32(G.seed+G.week*7919+11);G.snub=G.snub||{};const ignored=new Set();
  /* v1.82.3: only offers the NPC really sent and the player let lapse at week end count as a snub — not temple-fair or Vector bookings, not a mid-week refresh */
  if(!(opt&&opt.midweek))for(const o of G.offers||[])if(!o.beast&&!o.fair&&!o.lab&&o.status!=="conflict"&&!ignored.has(o.b)&&G.F[o.a]?.camp==="player"&&!isBooked(G,o.b)){
    ignored.add(o.b);G.snub[o.b]=(G.snub[o.b]||0)+1;}
  G.offers=[];const st=stageOf(G.week);
  const stageEnd=st==="local"?20:st==="district"?40:0;const nOff=G.week<=8?1:(2+(G.rep>=30?1:0)); // v1.32: one offer per fighter early, a third only once the camp is famous
  for(const f of roster(G)){
    if(f.injury>0||(typeof isAway==="function"&&isAway(G,f.id)))continue;
    const ranked=(st==="local"||st==="district")&&eligible(G,f);
    const myB=G.bookings.filter(b=>b.a===f.id).map(b=>b.week);
    const weeks=[];for(let wk=G.week+2;wk<=Math.min(48,G.week+5);wk++)if(!myB.some(x=>Math.abs(x-wk)<=1))weeks.push(wk);
    if(!weeks.length)continue;
    const n=myB.length?1:nOff;const used=new Set(G.bookings.filter(b=>b.a===f.id).map(b=>b.b));
    for(let i=0;i<n;i++){
      const wk=myB.length?weeks[weeks.length-1-(i%weeks.length)]:weeks[Math.min(i*2,weeks.length-1)-(i===3&&weeks.length>2?1:0)];
      const tier=ranked&&wk<=stageEnd?st:"exhibition";
      const pool=Object.values(G.F).filter(o=>o.div===f.div&&o.camp!=="player"&&o.camp!=="free"&&o.injury===0&&!used.has(o.id)&&!isBooked(G,o.id,wk)&&(tier==="exhibition"||eligible(G,o)));
      if(!pool.length)continue;
      const weakWk=((G.week+f.id.length*7+(G.season||1))%(G.rep>=40?4:3))===0; /* v1.83.1: an easy pick is on the table only some weeks */
      const y2=(G.season||1)>=2,c=(f.mmOff||0)+(G.week<=14&&!y2?[.4,.8,.5][i%3]:y2?(i===0&&weakWk?-1.6:EFF_BANDS[i%EFF_BANDS.length]):(i===0&&!weakWk?.15:OFFER_BANDS[i%OFFER_BANDS.length]))+(i>=3?(rng()-.5)*1.6:0); // early weeks: even fights, losses happen
      const o=pickW(rng,pool.map(x=>{const d=effGap(G,f,x);return [x,Math.exp(-((d-c)**2)/(2*.45*.45))+.01];}));used.add(o.id);
      // v1.15: purse = fee (paid win or lose) + win bonus; a better opponent, a crowd-drawing name or our own fame raise it
      const mult=clamp(1+effGap(G,f,o)*.12,.7,1.6)*(o.canon?1.35:1)*(1+(Math.min(f.lvl,20)-1)*.04)*(1+Math.min(G.rep,40)/200);
      G.offers.push({id:`o${G.week}_${f.id}_${i}`,a:f.id,b:o.id,week:wk,tier,win:Math.round(TIER[tier].win*mult/100)*100,lose:Math.round(TIER[tier].lose*mult/100)*100});
    }
    // v1.26: every 3 weeks a promoter offers a clearly stronger opponent for a bigger purse
    if(G.week>=9&&G.week<=42&&G.week%3===0){const wk=weeks[weeks.length-1],tier=ranked&&wk<=stageEnd?st:"exhibition";
      const hp=Object.values(G.F).filter(o=>o.div===f.div&&o.camp!=="player"&&o.camp!=="free"&&!o.canon&&o.injury===0&&!used.has(o.id)&&!isBooked(G,o.id,wk)&&(tier==="exhibition"||eligible(G,o)))
        .map(o=>[o,effGap(G,f,o)-(f.mmOff||0)]).filter(x=>x[1]>=.8&&x[1]<=2.1).sort((a,b)=>Math.abs(a[1]-1.4)-Math.abs(b[1]-1.4));
      if(hp.length){const o=hp[0][0];used.add(o.id);const mult=1.5*clamp(1+effGap(G,f,o)*.12,.7,1.6)*(1+(Math.min(f.lvl,20)-1)*.04)*(1+Math.min(G.rep,40)/200);
        G.offers.push({id:`o${G.week}_${f.id}_h`,a:f.id,b:o.id,week:wk,tier,hard:1,win:Math.round(TIER[tier].win*mult/100)*100,lose:Math.round(TIER[tier].lose*mult/100)*100});}}
    // v1.16: promoters stage cross-division star bouts a few times a season, so every rival pair can meet
    const X=CROSS_OF[f.id];if(X&&SPECIAL_WEEKS.includes(G.week)){const o=G.F[X],wk=G.week+3;
      if(o&&o.camp==="rival"&&!o.injury&&!isBooked(G,o.id,wk)&&!myB.some(x=>Math.abs(x-wk)<=1)&&wk<=47)G.offers.push({id:`o${G.week}_${f.id}_sp`,a:f.id,b:o.id,week:wk,tier:"special",win:TIER.special.win,lose:TIER.special.lose});}
    // v1.23: grudge match — in the district round the promoter keeps asking for the rivalry everyone wants to see
    const RV0=RIVAL_OF[f.id],RV=RV0&&G.F[RV0]&&G.prodigy&&G.prodigy[G.F[RV0].div]?G.prodigy[G.F[RV0].div]:RV0;if(RV&&(RIVAL_WEEKS.includes(G.week)||(RIVAL_EARLY[f.id]||[]).includes(G.week))){const o=G.F[RV],wk=G.week+3;
      if(o&&o.camp==="rival"&&!o.injury&&!isBooked(G,o.id,wk)&&!myB.some(x=>Math.abs(x-wk)<=1)&&!G.offers.some(x=>x.b===RV&&x.a===f.id)){const tier=eligible(G,f)&&eligible(G,o)&&wk<=40?"district":"special";
        G.offers.push({id:`o${G.week}_${f.id}_rv`,a:f.id,b:o.id,week:wk,tier,rv:1,win:Math.round(TIER[tier].win*1.6/100)*100,lose:Math.round(TIER[tier].lose*1.4/100)*100});}}
  }
  // Bangkok's sports-science camp calls out our strongest available fighter in each division.
  if(arcYear(G,"vector")>=1&&[8,22,35].includes(G.week))for(const opId of (arcYear(G,"vector")>=2?["pailin","vector_A","vector_B"]:["pailin"])){const op=G.F[opId];if(!op||op.injury>0)continue;
    const fighters=roster(G).filter(f=>f.div===op.div&&f.injury===0).sort((a,b)=>ovr(b.a)-ovr(a.a));
    for(const f of fighters){const wk=[G.week+2,G.week+3,G.week+4].find(w=>w<=48&&!isBooked(G,op.id,w)&&!G.bookings.some(b=>b.a===f.id&&Math.abs(b.week-w)<=1));
      if(wk&&!G.offers.some(o=>o.a===f.id&&o.b===op.id)){G.offers.push({id:`o${G.week}_${f.id}_${op.id}`,a:f.id,b:op.id,week:wk,tier:"lab",lab:1,win:TIER.lab.win,lose:TIER.lab.lose});break;}}}
  // v1.89.25: Baiyok's rematch letters to Fah — twice a year from her second season on, before and after she leaves Golden Tiger
  {const pb=G.prodigy&&G.prodigy.B,o=pb&&G.F[pb],fah=G.F.fah;if(o&&o.camp!=="player"/* v1.91.122: not once Baiyok trains with us */&&fah&&fah.camp==="player"&&(G.season||1)>=2&&[14,30].includes(G.week)&&!o.injury&&!fah.injury&&!(typeof isAway==="function"&&isAway(G,"fah"))){
    const wk=[G.week+3,G.week+4,G.week+2].find(w=>w<=48&&!isBooked(G,o.id,w)&&!G.bookings.some(b=>b.a==="fah"&&Math.abs(b.week-w)<=1));
    if(wk){G.offers=G.offers.filter(x=>!(x.a==="fah"&&x.b===o.id));G.offers.push({id:`o${G.week}_fah_by`,a:"fah",b:o.id,week:wk,tier:"special",rv:1,by:1,win:Math.round(TIER.special.win*1.6/100)*100,lose:Math.round(TIER.special.lose*1.4/100)*100});}}}
  // v1.89.27: Petchara's yearly challenge letter to Kati (week 12; the grudge offers at 25/29/33/36 come on top)
  {const pa=G.prodigy&&G.prodigy.A,o=pa&&G.F[pa],k=G.F.kati;if(o&&o.camp==="rival"&&k&&k.camp==="player"&&(G.season||1)>=2&&G.week===12&&!o.injury&&!k.injury&&!(typeof isAway==="function"&&isAway(G,"kati"))){
    const wk=[G.week+3,G.week+4,G.week+2].find(w=>w<=48&&!isBooked(G,o.id,w)&&!G.bookings.some(b=>b.a==="kati"&&Math.abs(b.week-w)<=1));
    if(wk){G.offers=G.offers.filter(x=>!(x.a==="kati"&&x.b===o.id));G.offers.push({id:`o${G.week}_kati_pc`,a:"kati",b:o.id,week:wk,tier:"special",rv:1,pc:1,win:Math.round(TIER.special.win*1.6/100)*100,lose:Math.round(TIER.special.lose*1.4/100)*100});}}}
  // v1.33: temple-fair bouts every other week: off the ranking, paid later by mail, now and then a cross-division star
  if(G.week>=4&&G.week<=46&&G.week%2===0){const R=roster(G).filter(f=>!f.injury);if(R.length){const f=R[Math.floor(rng()*R.length)];
    const myB=G.bookings.filter(b=>b.a===f.id).map(b=>b.week);const wk=[G.week+1,G.week+2,G.week+3].find(w=>!myB.some(x=>Math.abs(x-w)<=1)&&!G.offers.some(x=>x.a===f.id&&x.week===w));
    if(wk){let o=null,cross=false;const X=G.F[CROSS_OF[f.id]];
      if(G.week>=8&&X&&X.camp!=="player"&&!X.injury&&!isBooked(G,X.id,wk)&&rng()<.35){o=X;cross=true;}
      else{const pool=Object.values(G.F).filter(x=>x.div===f.div&&x.camp!=="player"&&!x.canon&&!x.injury&&!isBooked(G,x.id,wk)).map(x=>[x,Math.abs(ovr(x.a)-ovr(f.a)-.1)]).sort((a,b)=>a[1]-b[1]).slice(0,4);if(pool.length)o=pool[Math.floor(rng()*pool.length)][0];}
      if(o){const m=(1+Math.min(G.rep,50)/80)*(cross?1.6:1);G.offers.push({id:`o${G.week}_${f.id}_fair`,a:f.id,b:o.id,week:wk,tier:"exhibition",fair:1,cross:cross?1:0,win:Math.round(TIER.exhibition.win*m/100)*100,lose:Math.round(TIER.exhibition.lose*m/100)*100});}}}}
  if(G.region)G.offers=G.offers.filter(o=>!regionBlock(G,o.week)); /* v1.90: no home bouts while the camp is away */
}
function acceptOffer(G,oid){const o=G.offers.find(x=>x.id===oid);
  if(!o)return {ok:false,reason:"ข้อเสนอนี้ไม่มีแล้ว"};
  if(regionBlock(G,o.week))return {ok:false,reason:"สัปดาห์นี้ทั้งค่ายเดินทางไปศึกชิงเจ้าสี่ภาค"};
  if(typeof isAway==="function"&&isAway(G,o.a)&&G.F[o.a].awayAbs>absWeek(G)+(o.week-G.week))return {ok:false,reason:`${G.F[o.a].name}ยังไม่กลับค่าย รับไฟต์สัปดาห์นั้นไม่ได้`};
  if(o.status==="conflict")return {ok:false,reason:o.reason};
  const clash=(G.bookings||[]).find(b=>b.week===o.week&&[o.a,o.b].some(id=>id===b.a||id===b.b));
  const duplicate=(G.bookings||[]).some(b=>b.id==="b"+oid);
  const bad=duplicate?"รับข้อเสนอนี้ไปแล้ว":clash?`${G.F[clash.a===o.a||clash.b===o.a?o.a:o.b]?.name||"นักมวย"}มีไฟต์ในสัปดาห์ ${o.week} แล้ว`:null;
  if(bad){o.status="conflict";o.reason=bad;return {ok:false,reason:bad};}
  const booking={id:"b"+oid,a:o.a,b:o.b,week:o.week,tier:o.tier,rounds:3,win:o.win,lose:o.lose,...(o.fair?{fair:1,cross:o.cross}:{})};
  G.bookings.push(booking);G.snub=G.snub||{};G.snub[o.b]=0;for(const m of G.mail||[])if(m.q==="challenge"&&m.npc===o.b&&!m.done){m.done=true;m.resolved=true;}
  G.offers=G.offers.filter(x=>!(x.a===o.a&&Math.abs(x.week-o.week)<=1)&&!(x.a===o.a&&x.b===o.b));
  for(const x of G.offers)if(x.week===o.week&&(x.a===o.b||x.b===o.b)){x.status="conflict";x.reason=`${G.F[o.b].name}มีไฟต์ในสัปดาห์ ${o.week} แล้ว`;}
  return {ok:true,booking};}

/* v1.84: career rating — every fighter (ours and NPCs) carries an Elo-style rating that moves with each counted bout;
   tiers turn it into a readable class. NPCs start from their strength; ours start from their stats and record. */
const TIERS=[{k:"rookie",n:"หน้าใหม่",min:0,ic:"🌱"},{k:"rising",n:"ดาวรุ่ง",min:950,ic:"⭐"},{k:"skilled",n:"มวยฝีมือ",min:1100,ic:"🥊"},
  {k:"top",n:"หัวแถว",min:1250,ic:"🔥"},{k:"elite",n:"ยอดมวย",min:1400,ic:"💎"},{k:"legend",n:"ตำนาน",min:1550,ic:"👑"}];
const TIER_BY=Object.fromEntries(TIERS.map((t,i)=>[t.k,{...t,i}]));
function seedRating(f){const r=f.rec||{},recB=clamp(((r.w||0)-(r.l||0))*4,-100,200);
  return Math.round(clamp(1000+(ovr(f.a)+(f.vet||0)+(f.camp==="player"?hiddenEdge(f):0)-10)*45+(f.canon&&f.camp==="rival"?120:0)+(f.lab?60:0)+(f.prodigy?80:0)+recB,700,1750));}
function ratingOf(f){if(!f)return 1000;if(f.elo==null)f.elo=seedRating(f);return f.elo;}
function tierOf(f){const r=ratingOf(f);let t=TIERS[0];for(const x of TIERS)if(r>=x.min)t=x;return TIER_BY[t.k];}
function rateBout(G,a,b,res,tierKey){const ra=ratingOf(a),rb=ratingOf(b),E=1/(1+Math.pow(10,(rb-ra)/400)),S=res==="W"?1:res==="D"?.5:0;
  const K=tierKey==="final"||tierKey==="semi"?36:tierKey==="exhibition"?16:24,d=K*(S-E),t0=[tierOf(a),tierOf(b)];
  a.elo=Math.round(ra+d);b.elo=Math.round(rb-d);
  [[a,t0[0]],[b,t0[1]]].forEach(([f,t])=>{const t1=tierOf(f);if(t1.k!==t.k&&f.camp==="player")G.tierNews=(G.tierNews||[]).concat([{id:f.id,from:t.k,to:t1.k,week:G.week}]).slice(-8);});}
/* tiers at the start of the year, so the ranking page and the year-end can say who moved */
function snapTiers(G){G.tierStart={season:G.season||1,t:{}};for(const f of Object.values(G.F))if(f.camp!=="free"&&f.camp!=="quest"&&(f.div==="A"||f.div==="B"))G.tierStart.t[f.id]=tierOf(f).k;}
function tierMoves(G){if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);const out=[];
  for(const [id,k] of Object.entries(G.tierStart.t)){const f=G.F[id];if(!f)continue;const t=tierOf(f),d=t.i-TIER_BY[k].i;if(d)out.push({f,from:TIER_BY[k],to:t,up:d>0});}
  return out.sort((x,y)=>(y.f.camp==="player")-(x.f.camp==="player")||y.to.i-x.to.i||ratingOf(y.f)-ratingOf(x.f));}
function applyResult(G,F,booking){
  const {A,B}=F;const fa=A.f.__base||A.f,fb=B.f.__base||B.f,r=F.result,tier=TIER[booking.tier];
  if(!tier.off&&!booking.beast){if(!G.tierStart||G.tierStart.season!==(G.season||1))snapTiers(G);rateBout(G,fa,fb,r.win==="D"?"D":r.win==="A"?"W":"L",booking.tier);}
  let ret=null;
  for(const [me,op,side] of [[fa,fb,"A"],[fb,fa,"B"]]){
    const res=r.win==="D"?"D":r.win===side?"W":"L";
    const off=tier.off;
    if(booking.ev){if(me.camp==="player")ret={pay:0,res,upset:false};continue;} /* v1.89.24: event bouts (Loy Krathong) stay inside the event — no EXP, stardust, morale, fatigue, fame or record */
    if(off&&me.camp!=="player"){me.lastFight=G.week;me.lastFightAbs=gameWeek(G);continue;}
    if(me.camp==="player"&&op.camp!=="player"&&!off){G.h2h=G.h2h||{};const h=G.h2h[op.id]=G.h2h[op.id]||{w:0,l:0,d:0};h[res==="W"?"w":res==="L"?"l":"d"]++;}
    if(me.camp==="player"&&res==="W")G.dust=(G.dust||0)+(/KO|น็อก/.test(r.type||"")?4:3); /* v1.58: stardust for wins · v1.87: +1 */
    if(!off){me.rec[res==="W"?"w":res==="L"?"l":"d"]++;me.form.unshift(res);me.form=me.form.slice(0,5);}if(!off&&me.camp==="player"){const had=hotForm(me);me.wst=res==="W"?(me.wst||0)+1:0;const T=hotTitle(me);G.log=G.log||[];
      if(!had&&hotForm(me))G.log.push(`🔥 ${me.name}ชนะติดกัน ${HOT_AT} ไฟต์ ได้ฉายา "${T.name}" · ${T.desc}`);else if(had&&!hotForm(me))G.log.push(`${me.name}เสียฉายา "${T.name}" · ชนะติดกันใหม่อีก ${HOT_AT} ไฟต์เพื่อเอาคืน`);} /* v1.91.5 hot-form titles */me.lastFight=G.week;me.lastFightAbs=gameWeek(G);
    me.fatigue=clamp(me.fatigue+(booking.ev?4:off?14:22),0,100);
    const s=side==="A"?A:B;
    if(r.towel&&side==="A"){if(s.hp<20&&!off)me.injury=Math.max(me.injury,1);me.morale=clamp(me.morale-8,0,100);} /* v1.88: the towel spares her — at most a week off, but it stings */
    else if(s.hp<40&&!off&&mulberry32(F.seed+(side==="A"?1:2))()<.45)me.injury=Math.max(me.injury,2+(s.hp<15?2:0));
    if(res==="L"&&/KO|TKO/.test(r.type)&&!booking.pro&&!booking.ev)me.injury=Math.max(me.injury,booking.dm?1:3); // v1.37.1: a Death Match KO costs one week, not three
    const pmods=passiveMods(me);if(isLov(G,me.id)&&lovSolo(G))pmods.moraleLoss+=.3;if(me.camp==="player"&&me.trust>=60)pmods.moraleLoss+=.25;me.morale=clamp(me.morale+(res==="W"?10:res==="L"?-10*(1-Math.min(.9,pmods.moraleLoss)):2),0,100);
    // v1.21: beating someone stronger is worth more (ranking point, fame, EXP) — a reason to take the hard offers
    const gapR=effGap(G,me,op),upset=res==="W"&&gapR>.4;
    if(!off&&booking.tier!=="exhibition"&&booking.tier!=="special"&&booking.tier!=="lab"&&booking.tier!=="final"){const rk=G.rank[me.div][me.id];if(rk){rk.pts+=res==="W"?(gapR<-.6?2:3)+(upset?1:0):res==="D"?1:0;/* v1.47: farming weaker fighters earns fewer ranking points */rk[res==="W"?"w":res==="L"?"l":"d"]++;}}
    if(me.camp==="player"){
      const nopay=!!(booking.region&&(booking.region.nlfinal||booking.region.nlleg))||!!booking.nltest; /* v1.91.47 (playtest): underground/legend bouts pay nothing (win:0 fell back to the exhibition purse) */const W=nopay?0:booking.win||tier.win,Lo=nopay?0:booking.lose||tier.lose;const pay=res==="W"?W:res==="D"?(W+Lo)/2:Lo;if(booking.fair){G.fairPay=G.fairPay||[];G.fairPay.push({amt:pay,op:op.name,res});}else{G.cash+=pay;G.wkFight=(G.wkFight||0)+pay;}
      G.rep=Math.max(0,G.rep+(res==="W"?tier.rep*clamp(1+gapR*.5,.35,1.6)*(ytKey(G)==="tv"?1.4:1):res==="L"?(ytKey(G)==="tv"?-.4:0):.5)/(1+Math.max(0,G.rep-25)/25));
      /* v1.83.1: promoters read the record — a winning streak brings tougher offers, a loss brings them back down (settles near 2 wins in 3) */
      if(!off)me.mmOff=clamp((me.mmOff||0)+(res==="W"?.2:res==="L"?-.45:0),-1,2);
      if(res==="W"&&!G.flags.firstWin)G.flags.firstWin=me.id;
      if(res==="L"&&!G.flags.firstLoss)G.flags.firstLoss=me.id;
      if(op.id==="fah"||op.id==="ploy"){G.flags[`vs_${op.id}`]=res;
        if(res==="W"){op.surge=(op.surge||0)+7;op.potential=Math.min(20,op.potential+.5);G.flags[`beat_${op.id}`]=(G.flags[`beat_${op.id}`]||0)+1;G.flags[`surgeWk_${op.id}`]=G.week;G.flags[`beatS_${op.id}`]=G.season||1;if(op.id==="ploy")op.aura=ployAura(G.week,G);}}
      /* v1.83.1: a win over a much weaker opponent teaches less, a close or tougher fight teaches more */const xpm=clamp(1+gapR*.3,.5,1.45);
      gainXP(G,me,Math.round((res==="W"?45*xpm:res==="D"?35*clamp(xpm,.75,1.2):30)*(1+pmods.fightXp+(res==="L"?pmods.lossXp:0))*(booking.tier==="district"?1.3:booking.tier==="semi"?1.6:booking.tier==="final"?2:1)));
      G.cal=G.cal||[];G.cal.push({wk:G.week,season:G.season||1,absWeek:gameWeek(G),a:me.id,b:op.id,bn:op.name,tier:booking.tier,res,type:r.type,cards:(F.cards||[]).map(c=>[...c]),pay});
      oppRemember(G,me,op,res,r.type);
      ret={pay,res,upset};
    }
  }
  if(booking.region)regionAfterFight(G,booking,ret,F);
  return ret;
}
// v1.82.3: Kru Daeng's notebook — what we saw of an opponent last time; after a meeting they may go away and add a new weapon
const TRICK_KEYS=["punch","kick","knee","elbow","clinch","counter","guard","foot"];
const attrName=k=>(ATTRS.find(x=>x[0]===k)||[k,k])[1];
const topWeapon=a=>["punch","kick","knee","elbow"].sort((x,y)=>a[y]-a[x])[0];
function oppRemember(G,me,op,res,type){if(!op||op.camp==="player"||op.camp==="quest"||op.div==="X")return;G.oppBook=G.oppBook||{};
  const bk=G.oppBook[op.id]=G.oppBook[op.id]||{n:0};bk.n++;bk.last={season:G.season||1,wk:G.week,abs:gameWeek(G),res,type:type||"",top:topWeapon(op.a),cp:counterPreset(op),ovr:+ovr(op.a).toFixed(1),vs:me.id,
    v:[op.a.punch,op.a.kick,(op.a.knee+op.a.elbow)/2,(op.a.guard+op.a.counter)/2,(op.a.stamina+op.a.dur)/2].map(x=>Math.round(x*10)/10)}; /* v1.91.80: what she looked like in the ring (pre-fight compare, level 1) */bk.trick=null;
  const rng=mulberry32(G.seed+gameWeek(G)*13+stableHash(op.id));if(rng()<(res==="W"?.55:.3)){const top=bk.last.top,mine=topWeapon(me.a);
    const pool=TRICK_KEYS.filter(k=>k!==top&&op.a[k]<19.5);const k=res==="W"&&rng()<.5?(mine==="kick"||mine==="punch"?"guard":"counter"):pool[Math.floor(rng()*pool.length)];
    if(k&&op.a[k]<19.5){op.a[k]=Math.min(20,op.a[k]+.9);bk.trick={k,abs:gameWeek(G)};}}}
const oppKnown=(G,id)=>G.oppBook&&G.oppBook[id]&&G.oppBook[id].last?G.oppBook[id]:null;
function simNPCWeek(G){
  const st=stageOf(G.week);if(st!=="local"&&st!=="district")return;
  const rng=mulberry32(G.seed+G.week*104729);
  for(const div of ["A","B"]){
    let pool=Object.values(G.F).filter(f=>f.div===div&&f.camp!=="player"&&f.camp!=="free"&&f.injury===0&&(f.lastFightAbs==null||gameWeek(G)-f.lastFightAbs>=3)&&!isBooked(G,f.id)&&eligible(G,f));
    pool.sort(()=>rng()-.5);
    let n=0;while(pool.length>=2&&n<2){const a=pool.pop(),b=pool.pop();n++;
      const F=quickFight(a,b,Math.floor(rng()*1e9),3);
      // Year-one Ploy is the unbeaten rival in the story. Keep simulated NPC
      // results aligned with that arc; a player bout still uses its real result.
      if((G.season||1)===1&&G.F.ploy.camp==="rival"&&(a.id==="ploy"||b.id==="ploy")&&F.result.win!==(a.id==="ploy"?"A":"B")){
        F.result.win=a.id==="ploy"?"A":"B";F.result.type="ชนะคะแนน";}
      applyResult(G,F,{tier:st});
      G.log.push(`[${div}] ${a.name} ${F.result.win==="A"?"ชนะ":F.result.win==="B"?"แพ้":"เสมอ"} ${b.name} (${F.result.type})`);}
  }
}
function standings(G,div){
  return Object.entries(G.rank[div]).filter(([id])=>G.F[id])
    .map(([id,r])=>({id,f:G.F[id],...r})).sort((x,y)=>y.pts-x.pts||y.w-x.w||x.l-y.l||ovr(y.f.a)-ovr(x.f.a));
}
function stageTransition(G){ // called after week's results, before week++
  const rng=mulberry32(G.seed+G.week*31);
  if(G.week===20){
    for(const div of ["A","B"]){const table=standings(G,div),lead=table[0];if(lead)recordHonor(G,"local",lead.id,div,G.week,null,lead.pts!=null?`อันดับหนึ่ง ${lead.pts} คะแนน`:null,table[1]?.id);}
    for(const div of ["A","B"]){G.qual[div]=storyTop4(G,div);}
    for(const div of ["A","B"]){NPC_DISTRICT[div].forEach(([n,l],i)=>{const id=`d${div}${i}`;G.F[id]=baseFighter(id,mkNPC(id,n,div,l,rng,i+3));startLv(G.F[id]);G.qual[div].push(id);});
      G.rank[div]={};G.qual[div].forEach((id,i)=>{G.rank[div][id]={pts:id.startsWith("d")?0:[4,3,2,1][i]||0,w:0,l:0,d:0};});}
    G.flags.qualDone=true;ensureStageNPCs(G,"district");
  }
  if(G.week===40){
    for(const div of ["A","B"]){const table=standings(G,div),lead=table[0];if(lead)recordHonor(G,"district",lead.id,div,G.week,null,lead.pts!=null?`อันดับหนึ่ง ${lead.pts} คะแนน`:null,table[1]?.id);}
    // v1.4: top 4 of the district stage go to the provincial semi-finals (1v4, 2v3, week 44); winners meet in the final (week 49)
    G.semis=G.semis||{A:[],B:[]};
    for(const div of ["A","B"]){const t=storyTop4(G,div);G.semis[div]=t;G.finalists[div]=[];
      [[t[0],t[3]],[t[1],t[2]]].forEach(([a,b],i)=>{if(a&&b)bookBracket(G,`semi${div}${i}`,a,b,44,"semi",3);});}
    G.flags.finalDone=true;ensureStageNPCs(G,"province");
  }
}
// v1.23: the story needs its final — our lead heroine and her rival always make the cut (wildcard if needed)
// and are seeded on opposite halves, so they can only meet in the final
const LEADS={A:["kati","ploy"],B:["mali","fah"]};
// v1.53: when a Golden Tiger star joins us, their camp's new prodigy takes over as the division's top rival
const leadRival=(G,div)=>{const p=G.prodigy&&G.prodigy[div];if(p&&G.F[p]&&G.F[p].camp==="rival")return p;return LEADS[div][1];};
/* v1.89.25: the prodigies have their own art (Man) — Petchara stays Golden Tiger; Baiyok leaves and fights unattached in white */
const PROD_SPRITE={A:"petchara",B:"baiyok"};
const byFree=G=>!!(G&&G.flags&&G.flags.byFree!=null);
function fixProdigies(G){const P=G.prodigy||{};
  /* saves from before v1.89.25: count the meetings already fought, so a long rivalry doesn't restart at "first meeting" */
  if(G.flags&&!G.flags.prodN){const PP={fah:"prod_B",mali:"prod_B",ploy:"prod_A",kati:"prod_A"},N={};let last=0;
    for(const c of G.cal||[])if(PP[c.a]&&PP[c.a]===c.b){N[c.a]=(N[c.a]||0)+1;last=Math.max(last,c.absWeek||0);}
    if(Object.keys(N).length){G.flags.prodN=N;G.flags.prodLast=last;}}
  if(P.A&&G.F[P.A]){const f=G.F[P.A];f.sprite="petchara";f.full="เพชรา พยัคฆ์ทอง";}
  if(P.B&&G.F[P.B]){const f=G.F[P.B],fr=byFree(G);f.sprite=fr?"baiyok_white":"baiyok";f.full=fr?"ใบหยก":"ใบหยก พยัคฆ์ทอง";f.indie=fr;}}
function makeProdigy(G,div,from){G.prodigy=G.prodigy||{};if(G.prodigy[div])return G.F[G.prodigy[div]];const id="prod_"+div,src=G.F[from];
  const names={A:["เพชรา พยัคฆ์ทอง","เพชรา"],B:["ใบหยก พยัคฆ์ทอง","ใบหยก"]};
  const f=baseFighter(id,{name:names[div][1],full:names[div][0],div,camp:"rival",color:"#3b3f8f",potential:Math.min(20,(src?src.potential:17)+2),a:{}});
  for(const k in src.a)f.a[k]=Math.min(20,src.a[k]+.8);f.lvl=Math.max(1,(src.lvl||5));f.xp=0;f.canon=false;f.prodigy=true;f.met=true;f.sprite=PROD_SPRITE[div];f.skills={...(src.skills||{})};
  G.F[id]=f;syncFighterAges(G);G.prodigy[div]=id;G.rank=G.rank||{A:{},B:{}};G.rank[div][id]={pts:0,w:0,l:0,d:0};if((G.season||1)>=2)rivalCatchUp(G,id);return f;}
function joinCamp(G,id,wage){const f=G.F[id];if(!f)return;G.joinLog=(G.joinLog||[]).filter(x=>x.id!==id).concat([{id,season:G.season||1,wk:G.week}]);f.camp="player";f.wage=wage;f.met=true;G.bookings=G.bookings.filter(b=>!(b.b===id&&G.F[b.a]&&G.F[b.a].camp==="player"));
  if(id==="mali"){G.flags.maliIn=G.week;G.flags.maliInAbs=gameWeek(G);}
  G.offers=(G.offers||[]).filter(o=>o.b!==id&&o.a!==id);for(const m of G.mail||[])if(!m.done&&m.npc===id&&(m.q==="challenge"||m.q==="belt")){m.done=true;m.expired=true;}if(id==="ploy"){f.aura=0;f.surge=0;}G.rank[f.div]=G.rank[f.div]||{};if(!G.rank[f.div][id])G.rank[f.div][id]={pts:0,w:0,l:0,d:0};}
function storyTop4(G,div){let t=standings(G,div).slice(0,4).map(s=>s.id);const me=LEADS[div][0],rv=leadRival(G,div);G.wild=G.wild||{};
  /* v1.66: only year 1 is story-protected; from year 2 everyone qualifies on points */
  if((G.season||1)===1)for(const id of [rv,me]){const f=G.F[id];if(!f||t.includes(id))continue;if(id===me&&f.camp!=="player")continue;if(id===rv&&f.camp!=="rival")continue;
    const drop=[...t].reverse().find(x=>![me,rv].includes(x));if(!drop)continue;t[t.indexOf(drop)]=id;G.wild[id]=G.week;G.wildDrop=G.wildDrop||{};G.wildDrop[id]=drop;G.wildRank=G.wildRank||{};G.wildRank[id]=standings(G,div).findIndex(x=>x.id===id)+1;
    if(!G.rank[div][id])G.rank[div][id]={pts:0,w:0,l:0,d:0};}
  // seeds: pairs are [0,3] and [1,2]; keep me and rival apart
  const im=t.indexOf(me),ir=t.indexOf(rv),half=i=>i===0||i===3?0:1;
  if(im>=0&&ir>=0&&half(im)===half(ir)){const j=half(ir)===0?1:0;[t[ir],t[j]]=[t[j],t[ir]];}
  return t;}
function bookBracket(G,id,a,b,week,tier,rounds){
  // Championship fixtures take priority over promoter bookings made earlier.
  const conflicts=G.bookings.filter(x=>x.week===week&&[a,b].some(f=>f===x.a||f===x.b));
  if(conflicts.some(x=>x.tier==="semi"||x.tier==="final"))return false;
  if(conflicts.length){G.bookings=G.bookings.filter(x=>!conflicts.includes(x));G.cancelledBookings=(G.cancelledBookings||[]).concat(conflicts.map(x=>({...x,reason:"ตารางชิงแชมป์ชนกับไฟต์นี้"})));
    if(typeof addMail==="function")addMail(G,{kind:"letter",from:"สมาคมมวยจังหวัด",title:"ปรับตารางชกเพื่อศึกชิงแชมป์",body:"ไฟต์ที่รับไว้ก่อนหน้านี้ถูกยกเลิก เพราะนักมวยต้องขึ้นชกรอบชิงแชมป์ในสัปดาห์เดียวกัน ไม่มีการหักค่าตัว"});}
  for(const x of G.offers||[])if(x.week===week&&[a,b].some(f=>f===x.a||f===x.b)){x.status="conflict";x.reason="นักมวยมีศึกชิงแชมป์ในสัปดาห์นี้";}
  if(![a,b].some(x=>G.F[x].camp==="player"))G.bookings.push({id,a,b,week,tier,rounds,npc:true});
  else{const p=G.F[a].camp==="player"?a:b,o=p===a?b:a;G.bookings.push({id,a:p,b:o,week,tier,rounds});}return true;}
function finishBracket(G,booking,F){
  if(booking.tier==="final")return finishFinal(G,booking,F);
  if(booking.tier!=="semi")return;
  const div=G.F[booking.a].div;let w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);
  if(booking.npc&&(G.season||1)===1){const rv=leadRival(G,div);if((booking.a===rv||booking.b===rv)&&G.F[rv].camp==="rival"&&w!==rv){w=rv;F.result.win=rv===booking.a?"A":"B";F.result.type="ชนะคะแนน";}}
  if(!G.finalists[div].includes(w))G.finalists[div].push(w);
  if(G.finalists[div].length===2){const [a,b]=G.finalists[div];bookBracket(G,`final${div}`,a,b,49,"final",5);}}
function finishFinal(G,booking,F){const div=G.F[booking.a].div;const w=F.result.win==="A"?booking.a:F.result.win==="B"?booking.b:(ovr(G.F[booking.a].a)>=ovr(G.F[booking.b].a)?booking.a:booking.b);G.champ[div]=w;const lo=w===booking.a?booking.b:booking.a;recordHonor(G,"province",w,div,G.week,null,G.F[lo]?G.F[lo].name:null,lo);}

// week phase 1: training & upkeep (before fights)
function weekTrain(G){
  const rng=mulberry32(G.seed+G.week*977);G.log=[];
  /* v1.89.27: rivals re-check our camp mid-year and late-year too (the off-season check is in lateSeasonOpposition) */
  if((G.week===24||G.week===40)&&(G.season||1)>=2){G.flags=G.flags||{};const k=(G.season||1)+"_"+G.week;if(G.flags.rcWk!==k){G.flags.rcWk=k;const mv=rivalCatchUp(G);
    if(mv.length)G.lvNews=(G.lvNews||[]).concat([`${mv.slice(0,3).join(" · ")} เร่งซ้อมหนัก ตามให้ทันค่ายศิริชัย`]).slice(-3);}}
  for(const f of roster(G)){if(f.id==="rin"&&G.rinSpyAbs===gameWeek(G)){/* v1.91.80: Rin was out spying this week */f.gains={};f.xpGain=0;f.fatigue=clamp(f.fatigue-5,0,100);if(f.injury>0)f.injury--;continue;}
    if(typeof isAway==="function"&&isAway(G,f.id)){/* v1.89.11: she left camp for a while — no training, just rest */f.gains={};f.xpGain=0;f.fatigue=clamp(f.fatigue-10,0,100);if(f.injury>0)f.injury--;continue;}trainWeek(G,f,rng);}
  // v1.15: Ploy's raw talent makes her near-untouchable early; the edge fades by the district round
  if(G.F.ploy)G.F.ploy.aura=ployAura(G.week,G);
  for(const f of Object.values(G.F))spFloor(f); /* v1.91.73 */
  oppHistTick(G); /* v1.91.80 */
  for(const f of Object.values(G.F)){if(f.camp==="player")continue;
    if(f.injury>0){f.injury--;}f.fatigue=clamp(f.fatigue-8,0,100);
    // v1.23: the two stars coast until someone beats them — a loss lights a fire (surge) that carries them to the final
    const sg=f.surge>0?(f.surge--,f.id==="ploy"?.16:.13):0;
    npcGrow(f,rng,(f.canon&&f.camp==="rival"?dif(G).rival:1)*(f.id==="ploy"?(G.week>40?.07:G.week>30?.022:.012)+sg:f.id==="fah"?(G.week>40?.07:G.week>30?.03:G.week>10&&G.week<=24?.042:.026)+sg:f.camp==="rival"?.035:NPC_RATE(G.week)));f.morale+=(60-f.morale)*.1;
    // v1.15: rivals and NPCs level up too, so the opposition visibly gets stronger over the season
    if(f.camp==="rival"||f.camp==="npc"){f.xp=(f.xp||0)+(f.camp==="rival"?30:18)+Math.floor(rng()*10);
      while(f.lvl<MAX_LV&&f.xp>=xpNeed(f.lvl)){f.xp-=xpNeed(f.lvl);f.lvl++;f.sp=(f.sp||0)+SP_PER_LV(f);lvBeyond(f);if(f.camp==="rival"){const ks=Object.keys(f.a).sort((x,y)=>f.a[y]-f.a[x]).slice(0,2);ks.forEach(k=>f.a[k]=Math.min(20,f.a[k]+.2));}
        if(f.camp==="rival")G.lvNews=(G.lvNews||[]).concat([`${f.name} ${f.lab?"ค่ายเวกเตอร์":f.indie?"นักมวยอิสระ":"ค่ายพยัคฆ์ทอง"} เลเวลอัปเป็น Lv.${f.lvl}`]).slice(-3);}}}
}
// week phase 3: npc sim, economy, transitions, advance
function rankSnapshot(G){const o={};for(const d of ["A","B"]){o[d]={};standings(G,d).forEach((r,i)=>o[d][r.id]=i+1);}return o;}
// v1.82.4 (CM5): camp certificates — awarded once when the camp reaches a milestone, shown in the trophy room
const CAMP_AWARDS={
 clean:{name:"ค่ายสะอาดประจำอำเภอ",from:"ที่ว่าการอำเภอ",hint:"ดูแลค่ายให้สวยงาม (ทำความสะอาด ตกแต่ง)",ok:G=>(G.camp&&G.camp.beauty||0)>=4},
 local:{name:"ค่ายมวยดีเด่นประจำตำบล",from:"องค์การบริหารส่วนตำบล",hint:"ชื่อเสียง 25 และนักมวย 2 คนขึ้นไป",ok:G=>G.rep>=25&&roster(G).length>=2},
 debt:{name:"ปลดหนี้ค่ายศิริชัย",from:"ครูแดงและชาวค่าย",hint:"ปลดหนี้ของปู่ชัยให้หมด",ok:G=>!!(G.flags&&G.flags.debtCleared)||G.debt<=0},
 pretty:{name:"ค่ายสวยงามแห่งปี",from:"ชมรมคนรักมวยไทยเชียงใหม่",hint:"ตกแต่งค่ายอย่างน้อย 3 จุด",ok:G=>typeof CAMP_DECOR!=="undefined"&&Object.keys(CAMP_DECOR).filter(k=>decorChoice(G,k)!==decorDefault(k)&&decorChoice(G,k)!=="none").length>=3},
 school:{name:"โรงเรียนมวยยอดนิยม",from:"สมาคมผู้ปกครองตำบล",hint:"มีนักเรียน 30 คน",ok:G=>students(G)>=30},
 family:{name:"ครอบครัวศิริชัย",from:"ชาวค่ายศิริชัย",hint:"มีนักมวยในค่ายครบ 5 คน",ok:G=>roster(G).length>=5},
 province:{name:"ค่ายแชมป์ประจำจังหวัด",from:"สมาคมมวยจังหวัดเชียงใหม่",hint:"คว้าแชมป์จังหวัด",ok:G=>(G.honors||[]).some(h=>h.kind==="province")},
 legend:{name:"ค่ายมวยในตำนาน",from:"สมาคมมวยจังหวัดเชียงใหม่",hint:"สะสมเกียรติยศ 10 รายการ",ok:G=>(G.honors||[]).length>=10},
 five:{name:"ห้าปีแห่งศิริชัย",from:"ชาวบ้านในตำบล",hint:"ดูแลค่ายครบ 5 ปี",ok:G=>(G.season||1)>=6}};
function checkCampAwards(G){G.campAwards=Array.isArray(G.campAwards)?G.campAwards:[];const got=[];
  for(const [id,A] of Object.entries(CAMP_AWARDS)){if(G.campAwards.some(x=>x.id===id))continue;let ok=false;try{ok=A.ok(G);}catch(e){}
    if(ok){G.campAwards.push({id,season:G.season||1,week:G.week});got.push(id);}}
  if(got.length){G.newCerts=(G.newCerts||[]).concat(got);}return got;}
function weekFinish(G){if(G.rep>55)G.rep=55+(G.rep-55)*(.96+(G.fac.hall||0)*.01);if(G.sponsorWk)G.cash+=G.sponsorWk;
  if(ytKey(G)==="sponsor"&&G.yt.acc&&G.week<=40)G.cash+=2000;if(ytKey(G)==="tourist")for(const f of roster(G))f.fatigue=clamp(f.fatigue+1,0,100); /* v1.88 yearly themes */
 growStudents(G); // v1.22.1: fame above 40 needs upkeep

  const before=rankSnapshot(G);
  simNPCWeek(G);
  const after=rankSnapshot(G);G.rankMove={A:{},B:{}};
  for(const d of ["A","B"])for(const id in after[d]){const b=before[d][id];if(b)G.rankMove[d][id]=b-after[d][id];}
  for(const f of roster(G)){f.morale=clamp(f.morale+G.fac.dorm*1.5,0,100);f.trust=clamp(f.trust+G.fac.dorm*.3,0,100);}
  const inc=classIncome(G),up=upkeep(G),wg=wages(G);
  G.cash+=inc-up-wg;let debtPay=0;
  if(G.week%4===0&&G.debt>0){debtPay=Math.min(5000,G.debt);G.cash-=debtPay;G.debt-=debtPay;}
  if(G.loan>0&&G.week%4===0)G.loan=Math.round(G.loan*(1+LOAN_RATE)/100)*100; // v1.33: the helmet gang's quick cash grows 10% every 4 weeks
  for(const f of roster(G))if(G.cash>=0)f.trust=clamp(f.trust+.5,0,100);
  G.negWeeks=G.cash<0?G.negWeeks+1:0;
  const prog=(()=>{if(!G.snap){G.snap={week:gameWeek(G),a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return null;}
    if(gameWeek(G)-G.snap.week<4)return null;const out=roster(G).filter(f=>G.snap.a[f.id]).map(f=>({id:f.id,before:G.snap.a[f.id]}));
    G.snap={week:gameWeek(G),a:Object.fromEntries(roster(G).map(f=>[f.id,{...f.a}]))};return out.length?out:null;})();
  grantDecorUnlocks(G);checkCampAwards(G);
  G.lastReport={heartUp:(()=>{const m={};for(const x of G.heartNews||[])m[x.id]=x;G.heartNews=[];return Object.values(m);})(),tierUp:(G.tierNews||[]).filter(x=>x.week===G.week),prog,week:G.week,inc,up,wg,debtPay,students:students(G),rank:after,move:G.rankMove,stage:stageOf(G.week),cash:G.cash,log:[...G.log],gains:roster(G).map(f=>({id:f.id,name:f.name,gains:{...f.gains},fatigue:f.fatigue,injury:f.injury,xp:f.xpGain||0,lvl:f.lvl,preset:f.plan.preset}))};
  stageTransition(G);
  {const pv=G.history.length?G.history[G.history.length-1].cash:60000,sp=G.sponsorWk||0;G.history.push({w:G.week,season:G.season||1,cash:Math.round(G.cash),rep:+G.rep.toFixed(1),inc,up,wg,debt:debtPay,sponsor:sp,fight:G.wkFight||0,oth:Math.round(G.cash-pv-(inc+sp-up-wg-debtPay)-(G.wkFight||0))});G.wkFight=0;}
  if((G.negWeeks>=4&&G.cash<-10000)||G.cash<-40000)G.ended="bankrupt";
  if(G.week===21||G.week===41){G.F.ploy.skills.captain=(G.F.ploy.skills.captain||0)+1;G.F.fah.skills.grin=(G.F.fah.skills.grin||0)+1;}
  if(G.week===41){G.F.ploy.skills.kr_knee=Math.max(1,G.F.ploy.skills.kr_knee||0);} // v1.19.2: Ploy brings one more weapon to the semis/final
  G.week++;G.freeUsed=false;G.campUsed=null;
  syncFighterAges(G);
  if(G.week>52&&!G.ended)G.ended="season";
  genOffers(G);
}
// Late-game opponents catch up once per season. Existing saves receive the same
// one-time adjustment on load, without touching the player's fighters.
const VECTOR_SPEC={
 pailin:{name:"ไพลิน",full:"ไพลิน",div:"A",camp:"rival",color:"#392049",potential:20,
   a:{punch:17,kick:15,knee:16,elbow:18,clinch:16,guard:16,foot:15,counter:17,power:18,speed:16,stamina:18,dur:17,iq:16,comp:17}},
 A:{name:"ไนท์",full:"ไนท์ ศิษย์เวกเตอร์",div:"A",camp:"rival",color:"#542478",potential:19,
   a:{punch:13,kick:12,knee:12,elbow:13,clinch:12,guard:15,foot:15,counter:16,power:12,speed:15,stamina:14,dur:13,iq:17,comp:16}},
 B:{name:"เวกา",full:"เวกา ศิษย์เวกเตอร์",div:"B",camp:"rival",color:"#47216b",potential:19,
   a:{punch:14,kick:16,knee:12,elbow:14,clinch:11,guard:13,foot:16,counter:13,power:16,speed:17,stamina:15,dur:13,iq:14,comp:15}}
};
/* v1.87: story arcs count their own years. Saves that were already past the arc's year when it was added
   (or that skipped it) start the arc now, so nobody misses Pailin, Vector or the second-year stories of Fah and Ploy. */
const ARCS={y2:{min:2,win:16,ev:["y2_fah_rooftop","y2_ploy_stands","y2_fah_team","y2_fah_letter","y2_ploy_rehab","y2_ploy_team"]},
  vector:{min:4,win:30,ev:["y4_pailin_arrive","y4_pailin_sister","y4_pailin_warning"],ev2:["y5_vector_arrive","y5_vector_fighters","y5_vector_contract","y5_vector_challenge","y5_vector_resolve"]}};
function arcSync(G){G.arcs=G.arcs||{};const S=G.season||1,seen=k=>!!(G.seen&&G.seen[k]);
  for(const id in ARCS){if(G.arcs[id]!=null)continue;const A=ARCS[id];if(S<A.min)continue;let st;
    if(A.ev2&&A.ev2.some(seen))st=A.min;
    else if(A.ev.some(seen))st=A.ev2?Math.max(A.min,S-1):A.min;
    else if(S===A.min)st=A.min;
    else st=(G.week||1)<=A.win?S:S+1;
    G.arcs[id]=st;}}
const arcYear=(G,id)=>{const s=G.arcs&&G.arcs[id];return s==null?0:(G.season||1)-s+1;};
function ensureVector(G){arcSync(G);const vy=arcYear(G,"vector");if(vy<1)return false;G.rank=G.rank||{A:{},B:{}};let created=false;
  for(const id of (vy>=2?["pailin","vector_A","vector_B"]:["pailin"])){const div=id==="vector_B"?"B":"A",spec=id==="pailin"?VECTOR_SPEC.pailin:VECTOR_SPEC[div];G.rank[div]=G.rank[div]||{};
    if(!G.F[id]){G.F[id]=baseFighter(id,spec);G.F[id].lvl=id==="pailin"?8:6;G.F[id].met=true;created=true;}
    G.F[id].lab=true;G.F[id].gymName="ค่ายเวกเตอร์ กรุงเทพฯ";if(id==="pailin"){G.F[id].name=spec.name;G.F[id].full=spec.full;G.F[id].sprite="pailin";}
    if(!G.rank[div][id])G.rank[div][id]={pts:0,w:0,l:0,d:0};}syncFighterAges(G);return created;}
function liftOpponent(f,target,maxGain){const delta=Math.min(maxGain,Math.max(0,target-ovr(f.a)-(f.vet||0)));if(delta<=0)return;
  const want=ovr(f.a)+(f.vet||0)+delta,goal=Math.min(19.7,want);for(let n=0;n<4;n++){const gap=goal-ovr(f.a),room=ATTRS.filter(([k])=>f.a[k]<19.95);if(gap<=.01||!room.length)break;
    const each=gap*ATTRS.length/room.length;for(const [k] of room)f.a[k]=Math.min(20,f.a[k]+each);}
  f.potential=Math.max(f.potential||14,Math.min(20,goal));
  /* v1.83.3: whatever the stat ceiling cannot hold becomes ring craft */const short=want-ovr(f.a)-(f.vet||0);if(short>.05)f.vet=+Math.min(12,(f.vet||0)+short).toFixed(2);} /* v1.90: 12 (was 8) so the field keeps up with limit-broken fighters */
function lowerOpponent(f,target,maxDrop){let drop=Math.min(maxDrop,ovr(f.a)+(f.vet||0)-target);if(drop<=.05)return;
  const v=Math.min(f.vet||0,drop);if(v>0){f.vet=+((f.vet||0)-v).toFixed(2);drop-=v;}if(drop<=.05)return;
  for(const [k] of ATTRS)f.a[k]=Math.max(3,f.a[k]-drop);}
// v1.82.3: from year 2 the district and provincial fields get fresh names each year (seeded per save);
// last year's best provincial fighter in each division comes back as a familiar face.
const NPC_GIVEN=["กานต์ธิดา","ปิ่นมณี","ชมพู่","รัชนี","สุดารัตน์","น้ำฝน","เกศินี","มะปราง","ดาวเรือง","อัญชัน","พิกุล","ลลิตา","จิราพร","บัวขาว","ทองกวาว","ดอกแก้ว","ศิรินทร์","ปาริชาต","ขิม","แพรพลอย","ณิชา","อรอุมา","สายไหม","ฟ้าใส","เอื้องคำ","นวลจันทร์","ภัทรา","มยุรี","ลำดวน","ยุพิน","ปทุม","รสสุคนธ์","กุหลาบ","บุหงา","ใบบัว","ต้นข้าว"];
const NPC_CAMP=["ศิษย์ดอยสุเทพ","ส.แม่แตง","ลูกเชียงดาว","เพชรฝาง","ก.ลำพูน","ศิษย์พระธาตุ","ว.เวียงพิงค์","ช.ช้างเผือก","ลูกสันทราย","เพชรแม่ริม","ส.หางดง","ศิษย์ฮอด","ลูกจอมทอง","พ.พร้าว","ศ.สะเมิง","เกียรติลำปาง","ส.ดอยเต่า","ลูกแม่แจ่ม","เพชรอมก๋อย","ศิษย์สารภี"];
function stageNpcName(G,stage,div,i){const y=G.season||1;if(y<2)return null;
  if(stage==="province"&&i===0&&G.npcVet&&G.npcVet[div]&&!Object.values(G.F).some(f=>f.name===G.npcVet[div]))return G.npcVet[div];
  const names=Object.values(G.F).map(f=>f.name||""),firsts=new Set(names.map(n=>n.split(" ")[0])),rng=mulberry32(G.seed+y*131+stableHash(stage+div)+i*17);
  for(let t=0;t<40;t++){const g=NPC_GIVEN[Math.floor(rng()*NPC_GIVEN.length)];if(firsts.has(g))continue;return g+" "+NPC_CAMP[Math.floor(rng()*NPC_CAMP.length)];}return null;}
function ensureStageNPCs(G,through=stageOf(G.week)){const stages=["local",...(through==="district"||through==="final"||through==="province"?["district"]:[]),...(through==="final"||through==="province"?["province"]:[])];
  G.rank=G.rank||{A:{},B:{}};for(const stage of stages)for(const div of ["A","B"]){G.rank[div]=G.rank[div]||{};
    STAGE_NPCS[stage][div].forEach(([name,level],i)=>{const id=`${{local:"l",district:"x",province:"p"}[stage]}${div}${i}`;if(G.F[id])return;if(stage!=="local")name=stageNpcName(G,stage,div,i)||name;
      const rng=mulberry32(G.seed+stableHash(id)+((G.season||1)-1)*977),f=G.F[id]=baseFighter(id,mkNPC(id,name,div,level,rng,i+2));
      if((G.season||1)>=2){const best=Math.max(level,...roster(G).filter(x=>x.div===div).map(x=>effOvr(G,x))),gap=stage==="local"?-2:stage==="district"?-1.1:-.3;liftOpponent(f,Math.min(24.5,best+gap),20);}startLv(f);
      if(stage==="district"){G.qual=G.qual||{A:[],B:[]};G.qual[div]=G.qual[div]||[];if(!G.qual[div].includes(id))G.qual[div].push(id);}
      G.rank[div][id]={pts:0,w:0,l:0,d:0};});}syncFighterAges(G);}
/* v1.89.27: story rivals (Golden Tiger, Baiyok, Vector) track our best fighter in their division.
   gap/floor as before; how far they may climb in one check grows with how far behind they are, so a maxed-out camp still meets a real rival */
function storyRivalTarget(G,f,best,bestLab,year,d){const lab=!!f.lab,boss=f.id==="pailin";let gap,floor,max;
  if(lab){gap=d==="easy"?(boss?.5:.3):d==="hard"?(boss?1.3:1):(boss?1:.65);max=20;floor=boss?16.5+(year-4)*.3:15.5+(year-5)*.3;}
  else{gap=d==="easy"?-1.6:d==="hard"?-.2:-.8;/* v1.89.27: a step softer — a camp that built its fighters should still win most of these */floor=year>=4?11.5+(year-4)*.35:10+(year-2)*.5;
    const T=rivalT(f,Math.min(25,Math.max(floor,best+gap))),behind=T-ovr(f.a)-(f.vet||0);max=Math.max(2.4,behind*.6);}
  return {gap,floor,max};}
/* ring craft (vet) wins more fights than the same number of stat points of skills on our side — past the stat ceiling a rival only takes part of the target */
var RIVAL_VET_K=.65;const rivalT=(f,T)=>f.lab||T<=19.7?T:19.7+(T-19.7)*RIVAL_VET_K;
const divBest=(G,div,year)=>{const mine=roster(G).filter(f=>f.div===div),fl=year>=4?12+(year-4)*.6:10.5+(year-2)*.6;
  return {best:Math.max(fl,...mine.map(f=>effOvr(G,f))),bestLab:Math.max(fl,...mine.map(f=>ovr(f.a)+edgeOf(G,f)*.5))};};
/* mid-year (week 24) and late-year (week 40) re-check — rivals only climb, never drop; they get a smaller step than the off-season */
function rivalCatchUp(G,only){const year=G.season||1;if(year<2&&!only)return [];const d=G.diff||"normal",moved=[];
  for(const div of ["A","B"]){const {best,bestLab}=divBest(G,div,year);
    for(const f of Object.values(G.F)){if(f.div!==div||f.camp!=="rival"||(only&&f.id!==only))continue;
      const R=storyRivalTarget(G,f,best,bestLab,year,d),T=rivalT(f,Math.min(f.lab?21.5:25,Math.max(R.floor,(f.lab?bestLab:best)+R.gap))),b0=ovr(f.a)+(f.vet||0);
      liftOpponent(f,T,only?R.max:Math.max(1.2,R.max*.5));if(ovr(f.a)+(f.vet||0)-b0>.3)moved.push(f.name);}}
  return moved;}
function lateSeasonOpposition(G){arcSync(G);const year=G.season||1;ensureStageNPCs(G);if(year<2)return;G.flags=G.flags||{};const created=year>=4?ensureVector(G):false;
  if(G.flags.oppositionSeason===year&&!created)return;
  const d=G.diff||"normal",rng=mulberry32(((G.seed||1)*31+year*7919)>>>0),back=[];
  for(const div of ["A","B"]){const mine=roster(G).filter(f=>f.div===div);const best=Math.max(year>=4?12+(year-4)*.6:10.5+(year-2)*.6,...mine.map(f=>effOvr(G,f))),bestLab=Math.max(year>=4?12+(year-4)*.6:10.5+(year-2)*.6,...mine.map(f=>ovr(f.a)+edgeOf(G,f)*.5));/* story bosses only take half the edge — their fights were tuned by hand */
    for(const f of Object.values(G.F)){if(f.div!==div||f.camp==="player"||f.camp==="free"||f.camp==="quest")continue;
      const lab=!!f.lab,rival=f.camp==="rival",boss=f.id==="pailin";let gap,max,floor,comeback=false;
      if(lab||rival){const R=storyRivalTarget(G,f,best,bestLab,year,d);gap=R.gap;max=R.max;floor=R.floor;}
      else{ // v1.83.1: the field is uneven — most sit a step below our best, a few catch up or overtake us
        const base=d==="easy"?-2.2:d==="hard"?-.5:-1.2,spread=(rng()-.5)*2.4;comeback=rng()<(year>=3?.18:.12);
        gap=comeback?(d==="easy"?0:d==="hard"?1.2:.7):base+spread;max=comeback?3.5:2.2;floor=year>=4?9.5+(year-4)*.4:8.5+(year-1)*.6;
        if(comeback&&ovr(f.a)<best+gap-1&&back.length<3&&f.name)back.push(f.name);}
      const T0=Math.min(lab?21.5:rival?25:24.5,Math.max(floor,(lab?bestLab:best)+gap)),T=rival?rivalT(f,T0):T0;liftOpponent(f,T,max);
      /* v1.83.3: last year's comebacks and old veterans settle back into the pack instead of piling up above us */
      if(!lab&&!rival&&!comeback)lowerOpponent(f,T+.3,1.5);
      if(lab)f.labPrep=Math.min(boss?.09:.07,(boss?.05:.035)+Math.max(0,year-4)*.005);}}
  if(back.length)G.lvNews=(G.lvNews||[]).concat(back.map(n=>`${n} ซุ่มซ้อมช่วงปิดฤดู กลับมาแกร่งกว่าเดิม`)).slice(-3);
  G.flags.oppositionSeason=year;}
// v1.3: keep playing after the season — new season, same camp, fighters and bonds
/* v1.88 yearly themes — from year 2 every season draws one mild theme (seeded per save, never the same twice in a row).
   They nudge money, fatigue or training for a while; they never change how fights work. */
const YEAR_THEMES={
 flood:{ic:"🌊",name:"ปีน้ำท่วม",desc:"หน้าฝนสัปดาห์ 14–16 น้ำเข้าค่าย ซ้อมได้ผล 80% และนักเรียนมาได้ครึ่งเดียว",from:14,to:16},
 sponsor:{ic:"💼",name:"ปีสปอนเซอร์",desc:"ถ้ารับข้อเสนอ ได้ ฿2,000 ทุกสัปดาห์จนถึงสัปดาห์ 40 และถ้าค่ายชนะครบ 8 ไฟต์ภายในสัปดาห์ 40 ได้โบนัสอีก ฿20,000"},
 pm25:{ic:"😷",name:"ปีฝุ่น PM2.5",desc:"สัปดาห์ 37–46 ฝุ่นคลุมเชียงใหม่ ซ้อมได้ผลน้อยลง (ฟิตร่างกายลดมากสุด) ถ้ามีห้องซ้อมในร่มกรองฝุ่นจะซ้อมได้เต็มที่",from:37,to:46},
 tourist:{ic:"🧳",name:"ปีนักท่องเที่ยวบูม",desc:"ค่าเรียนแพงขึ้น 20% ทั้งปี แต่ค่ายวุ่น นักมวยล้าเพิ่มสัปดาห์ละนิด"},
 tv:{ic:"📺",name:"ปีรายการทีวี",desc:"ทีวีตามถ่ายค่ายทั้งปี ชนะได้ชื่อเสียงมากขึ้น แพ้ก็เสียชื่อเสียงนิดหน่อย"}};
const ytKey=G=>G&&G.yt&&G.yt.season===(G.season||1)?G.yt.k:null;
const ytIn=(G,k)=>{if(ytKey(G)!==k)return false;const T=YEAR_THEMES[k];return T.from==null||(G.week>=T.from&&G.week<=T.to);};
function pickYearTheme(G){const S=G.season||1;if(S<2)return null;const last=G.yt&&G.yt.k;const keys=Object.keys(YEAR_THEMES).filter(k=>k!==last);
  const r=mulberry32((G.seed||1)*131+S*7919)();G.yt={season:S,k:keys[Math.floor(r*keys.length)]};return G.yt.k;}
function ytTrainMul(G,f){if(ytIn(G,"flood"))return .8;if(ytIn(G,"pm25")&&!((G.fac&&G.fac.airgym)>0))return f.plan.preset==="cond"?.6:.75;return 1;}
const ytSponsorWins=G=>(G.cal||[]).filter(c=>c.season===(G.season||1)&&c.res==="W"&&c.wk<=40).length;
function newSeason(G){
  G.titles=G.titles||[];G.titles.push({season:G.season||1,champ:{...G.champ}});
  G.season=(G.season||1)+1;G.week=1;G.ended=null;G.qual={A:[],B:[]};G.finalists={A:[],B:[]};G.semis={A:[],B:[]};G.champ={};G.bookings=[];G.log=[];
  G.flags.qualDone=false;G.flags.finalDone=false;G.snub={};G.offers=[];G.dmSeen={};G.dmSeenSeason=G.season;G.dm=null;G.coachAway=null;G.coachAwayAbs=null;G.freeUsed=false;G.campUsed=null;G.rankMove={A:{},B:{}};
  G.npcVet={};for(const div of ["A","B"]){const best=Object.entries((G.rank||{})[div]||{}).filter(([id])=>/^p[AB]\d/.test(id)&&G.F[id]).sort((x,y)=>(y[1].pts||0)-(x[1].pts||0))[0];if(best)G.npcVet[div]=G.F[best[0]].name;}
  for(const id of Object.keys(G.F))if(/^[dxp][AB]\d/.test(id)){delete G.F[id];if(G.oppBook)delete G.oppBook[id];if(G.h2h)delete G.h2h[id];if(G.fam)delete G.fam[id];if(G.snub)delete G.snub[id];}
  const rng=mulberry32(G.seed+G.season*977);
  G.rank={A:{},B:{}};
  for(const f of Object.values(G.F)){f.form=[];f.injury=0;f.fatigue=Math.min(f.fatigue,20);
    // v1.50: the whole field trains through the off-season too, so year 2 is not a walkover
    if(f.camp!=="player"){f.potential=Math.min(20,(f.potential||14)+1.5);for(const k in f.a)f.a[k]=Math.min(20,f.a[k]+(f.canon?.4:.6+rng()*.5));}
    if(f.camp!=="free"&&f.camp!=="quest"&&G.rank[f.div])G.rank[f.div][f.id]={pts:0,w:0,l:0,d:0};} /* v1.81.1: a beast/gang bout booked over new year (div X) used to crash here and block year 6 */
  lateSeasonOpposition(G);syncFighterAges(G);
  /* v1.84: over the off-season every rating drifts part-way toward the fighter's real strength (ours count skills too), so tiers follow growth */
  for(const f of Object.values(G.F))if(f.elo!=null&&f.camp!=="free"&&f.camp!=="quest")f.elo=Math.round(f.elo*.6+seedRating(f)*.4);
  pickYearTheme(G);G.tierNews=[];snapTiers(G);genOffers(G);return G;}
// v1.7 late-game money sinks
const MASTERS={thasao:{name:"ครูมวยท่าเสา",cost:18000,attrs:["speed","foot"]},chaiya:{name:"ครูมวยไชยา",cost:18000,attrs:["guard","counter"]},
  lopburi:{name:"ครูมวยลพบุรี",cost:18000,attrs:["iq","counter"]},korat:{name:"ครูมวยโคราช",cost:18000,attrs:["punch","power"]}};
function hireMaster(G,fid,school){const f=G.F[fid],M=MASTERS[school];if(!f||!M||G.cash<M.cost||G.week<16||f.masterSeason===(G.season||1))return false;
  G.cash-=M.cost;f.masterSeason=G.season||1;f.sp=(f.sp||0)+1;M.attrs.forEach(k=>f.a[k]=Math.max(f.a[k],Math.min(stCap(f),f.a[k]+(f.a[k]>=20?.6*LB_RATE:.6))));f.morale=Math.min(100,f.morale+6);return true;}
const SHOW_COST=25000;
function hostShow(G){const st=stageOf(G.week);if(G.cash<SHOW_COST||G.week<10||G.flags["show_"+st])return false;G.cash-=SHOW_COST;G.flags["show_"+st]=true;
  G.rep+=3;G.camp.beauty=Math.min(10,G.camp.beauty+1);roster(G).forEach(f=>f.morale=Math.min(100,f.morale+8));return true;}
// v1.33: quick loan when cash runs dry; the helmet gang lends, and keeps coming round while it is unpaid
const LOAN_AMT=20000,LOAN_RATE=.1;
const LOAN_LOW=8000; // v1.88: offer opens a bit earlier, before the camp is already scraping zero
const loanOk=G=>!(G.loan>0)&&G.cash<LOAN_LOW&&!G.ended;
function takeLoan(G){if(!loanOk(G))return false;G.loan=LOAN_AMT;G.cash+=LOAN_AMT;G.loanN=(G.loanN||0)+1;G.gang=G.gang||{st:0,next:0};G.gang.nextAbs=Math.min(G.gang.nextAbs||Infinity,gameWeek(G)+2);return true;}
function repayLoan(G){if(!(G.loan>0)||G.cash<G.loan)return false;G.cash-=G.loan;G.loan=0;return true;}
function clearDebt(G){if(G.debt<=0||G.cash<G.debt)return false;G.cash-=G.debt;G.debt=0;G.flags.debtCleared=true;G.rep+=2;return true;}
if(typeof module!=="undefined")module.exports={STA_TANK,staPts,skCost,SK_COST,CARE_STA,takeLoan,repayLoan,loanOk,LOAN_AMT,LOAN_LOW,cornerOdds,cloneFight,trainWeek,passiveMods,skillReqs,skillBlock,hasTree,DIFF,studentCap,studentDemand,studentFee,growStudents,storyTop4,RIVAL_OF,LEADS,upkeep,campActLocked,equipped,toggleEquip,MAX_EQUIP,roundBegin,fightEx,roundDone,roundFinish,useSkill,fightSkills,SKILL_KIND_NAME,fixSave,STAFF,hireStaff,fireStaff,staffSlots,staffLocked,facLocked,mainStyle,mastery,styleVal,STYLE_NAME,STYLE_ATTRS,MASTERY_AT,aiCorner,FACILITIES,SIGNATURE,hasSignature,counterPreset,oppTop,careNeeds,applyCare,throwTowel,CARE,MASTERS,hireMaster,hostShow,clearDebt,SHOW_COST,TAC,setTactics,finishBracket,mulberry32,newGame,weekTrain,weekFinish,genOffers,acceptOffer,buyFacility,upgradeDaeng,students,campLevel,newFight,fightRound,quickFight,applyResult,standings,roster,ovr,styleOf,stageOf,finishFinal,condition,ATTRS,isBooked,PRESETS,CANON,advise,doCampAction,learnSkill,SKILLS,SCHOOLS,campLook,newSeason};

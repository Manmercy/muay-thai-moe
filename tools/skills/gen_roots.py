#!/usr/bin/env python3
"""Generates the v1.89 skill roots block in src/engine.js, the review spec (markdown) and the TH->EN pairs.
usage: python3 tools/skills/gen_roots.py [--spec out.md] [--tr out.json]"""
import sys,os,json,re
sys.path.insert(0,os.path.dirname(__file__))
from roots_data import R,B,SCHOOL_LV,BUILD_LV
ROOT=os.path.join(os.path.dirname(__file__),'..','..')
MASTER={"kati":["ts_wind","ts_trunk","ts_fort"],"mali":["cy_soar","cy_gale","cy_meru"],"rin":["lb_proof","lb_book","lb_circle"],
        "ploy":["kr_genius","kr_tiger","p_crown"],"fah":["f_sky","f_heaven","f_star"]}
BUILD_MASTER=["sh_ko4","sh_tc4","sh_ir4"]
LINES={"kati":["สายแข้ง","สายหมัดศอก","สายการ์ดและใจ"],"mali":["สายศอก","สายเตะและความไว","สายป้องกัน"],"rin":["สายสวนกลับ","สายอ่านเกม","สายคุมระยะ"],
       "ploy":["สายหมัดโคราช","สายเตะคอขาด","สายกำแพงพยัคฆ์"],"fah":["สายศอกพยัคฆ์","สายบุกบ้าบิ่น","สายยิ้มเยาะ"]}
LINES_EN={"kati":["Shin line","Punch & elbow line","Guard & heart line"],"mali":["Elbow line","Kick & speed line","Defence line"],"rin":["Counter line","Ring-reading line","Range line"],
       "ploy":["Korat fist line","Neck-kick line","Tiger wall line"],"fah":["Tiger elbow line","Reckless rush line","Smirk line"]}
BUILDS=["ปั้นนักน็อก","ปั้นเก็บแต้ม","ปั้นถึกอึด"];BUILDS_EN=["Knockout build","Points build","Iron build"]
W={"punch":("หมัด","punch"),"kick":("เตะ","kick"),"elbow":("ศอก","elbow"),"knee":("เข่า","knee")}
def pc(v):
  s=("%.1f"%(v*100)).rstrip('0').rstrip('.');return s
def num(v):
  return ("%.1f"%v).rstrip('0').rstrip('.')
def eff(fx):
  th=[];en=[]
  for k,v in fx.items():
    if k in("dmg","hit","pts"):
      for w,x in v.items():
        t,e=W[w]
        if k=="dmg":th.append(f"แรง{t} +{pc(x)}%");en.append(f"{e} power +{pc(x)}%")
        if k=="hit":th.append(f"{t}แม่น +{pc(x)}%");en.append(f"{e} accuracy +{pc(x)}%")
        if k=="pts":th.append(f"คะแนน{t} +{pc(x)}%");en.append(f"{e} points +{pc(x)}%")
    elif k=="ctr":th.append(f"สวนกลับ +{pc(v)}%");en.append(f"counters +{pc(v)}%")
    elif k=="ctrDmg":th.append(f"แรงหมัดสวน +{pc(v)}%");en.append(f"counter-punch power +{pc(v)}%")
    elif k=="clutch":th.append(f"เลือดต่ำแม่นขึ้น {pc(v)}%");en.append(f"+{pc(v)}% accuracy at low health")
    elif k=="regen":th.append(f"ฟื้นแรง +{pc(v)}%");en.append(f"recovery +{pc(v)}%")
    elif k=="mor":th.append(f"กำลังใจมีผล +{pc(v)}%");en.append(f"morale effect +{pc(v)}%")
    elif k=="evade":th.append(f"หลบ +{pc(v)}%");en.append(f"evade +{pc(v)}%")
    elif k=="corner":th.append(f"คำสั่งพักยก +{pc(v)}%");en.append(f"corner orders +{pc(v)}%")
    elif k=="prep":th.append(f"ความแม่นพื้นฐาน +{pc(v)}%");en.append(f"base accuracy +{pc(v)}%")
    elif k=="clDef":th.append(f"ป้องกันวงใน +{num(v)}");en.append(f"clinch defense +{num(v)}")
    elif k=="staSave":th.append(f"ใช้แรงน้อยลง {pc(v)}%");en.append(f"stamina use -{pc(v)}%")
    else: raise SystemExit("unknown fx "+k)
  return " ".join(th),", ".join(en)
def jsfx(fx):
  parts=[]
  for k,v in fx.items():
    if isinstance(v,dict):parts.append(k+":{"+",".join(f"{w}:{x}*r" for w,x in v.items())+"}")
    else:parts.append(f"{k}:{v}*r")
  return "r=>({"+",".join(parts)+"})"
def js(s):return json.dumps(s,ensure_ascii=False)
out=[];TR={};spec=[];
def node_desc(nd,lv,root_th,root_en,fl_th,fl_en,fx,feed_th,feed_en):
  th,en=eff(fx)
  if nd in(2,):return f"ติดตัว · Lv.{lv} · {th}",f"Always on · Lv.{lv} · {en}"
  if nd==4:return f"ติดตัว · หนุน{feed_th} · Lv.{lv} · {th}",f"Always on · boosts {feed_en} · Lv.{lv} · {en}"
  if nd==5:return f"Lv.{lv} · ขั้นตำนาน · {fl_th} · {th}",f"Lv.{lv} · Legend · {fl_en} · {en}"
  return f"Lv.{lv} · {root_th} · {fl_th} · {th}",f"Lv.{lv} · {root_en} · {fl_en} · {en}"
KIND={1:"แอคทีฟ",2:"ติดตัว",3:"แอคทีฟ",4:"ติดตัว · หนุนสาย",5:"แอคทีฟ · ขั้นตำนาน"}
roots_js={}
def emit(fid,li,lines_th,lines_en,roots,master,lv,row0,shared,target):
  rr=[]
  for br,(rth,ren,mth,men,nodes) in enumerate(roots):
    TR[rth]=ren;TR[mth]=men;rr.append({"n":rth,"m":mth})
    if shared: feed_th,feed_en="สายสำนัก","school lines"
    else:
      ft=(li+1+br)%3;feed_th,feed_en=lines_th[ft],lines_en[ft]
    spec.append(f"\n**รูต {'AB'[br]} · {rth}** — {mth}  \n_{ren} — {men}_\n\n| # | ชนิด | สกิล | Lv | ค่าพลัง | ผลต่อขั้น (สูงสุด 3 ขั้น) |\n|---|---|---|---|---|---|")
    pre=master
    for i,(nth,nen,fth,fen,req,fx) in enumerate(nodes):
      nd=i+1;L=lv[i];sid=(f"{fid}_{li}{'ab'[br]}{nd}" if not shared else f"sh{li}{'ab'[br]}{nd}")
      dth,den=node_desc(nd,L,rth,ren,fth,fen,fx,feed_th,feed_en)
      TR[nth]=nen;TR[dth]=den
      more={"lv":L,"br":br,"nd":nd}
      if nd in(2,4):more["passive"]=1
      if nd==4:more["feed"]=("school" if shared else (li+1+br)%3)
      if shared:more["shared"]=1
      ms=",".join(f"{k}:{js(v)}" for k,v in more.items())
      school='"build"' if shared else f'_rsch("{fid}","{master}")'
      out.append(f'{target}.push(SKX("{sid}",{li},{row0+i},"{pre}",{js(req)},{school},{js(nth)},{js(dth)},{jsfx(fx)},{{{ms}}}));')
      th,_=eff(fx)
      spec.append(f"| {nd} | {KIND[nd]}{(' → '+feed_th) if nd==4 else ''} | **{nth}**<br>_{nen}_ | {L} | {', '.join(req)} | {th} |")
      pre=sid
  return rr
for fid in ["kati","mali","rin","ploy","fah"]:
  spec.append(f"\n## {fid.capitalize()}\n");roots_js[fid]=[]
  for li in range(3):
    spec.append(f"\n### {LINES[fid][li]} (ต่อจาก Lv.22 ขั้นปรมาจารย์)")
    roots_js[fid].append(emit(fid,li,LINES[fid],LINES_EN[fid],R[fid][li],MASTER[fid][li],SCHOOL_LV,6,False,f"SKILLS.{fid}"))
spec.append("\n## สายปั้น (เหมือนกันทุกคน)\n");roots_js["build"]=[]
for j in range(3):
  spec.append(f"\n### {BUILDS[j]} (ต่อจาก Lv.10)")
  roots_js["build"].append(emit("sh",j+3,None,None,B[j],BUILD_MASTER[j],BUILD_LV,4,True,"SHARED_SKILLS"))
block=("/* v1.89 skill roots — generated by tools/skills/gen_roots.py from roots_data.py (edit those, not this block) */\n"
  "const _rsch=(fid,id)=>((SKILLS[fid]||[]).find(s=>s.id===id)||{}).school;\n"
  "const SK_ROOTS="+json.dumps(roots_js,ensure_ascii=False,separators=(',',':'))+";\n"+"\n".join(out)+"\n/* end v1.89 skill roots */\n")
p=os.path.join(ROOT,'src','engine.js');s=open(p,encoding='utf-8').read()
s=re.sub(r"/\* v1\.89 skill roots.*?/\* end v1\.89 skill roots \*/\n","",s,flags=re.S)
anchor="const skillList=fid=>"
assert s.count(anchor)==1;s=s.replace(anchor,block+anchor);open(p,'w',encoding='utf-8').write(s)
args=sys.argv[1:]
if "--spec" in args:open(args[args.index("--spec")+1],'w',encoding='utf-8').write("\n".join(spec)+"\n")
if "--tr" in args:json.dump(TR,open(args[args.index("--tr")+1],'w',encoding='utf-8'),ensure_ascii=False,indent=0)
print("nodes",len(out),"tr",len(TR))

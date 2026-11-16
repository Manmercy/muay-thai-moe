# Muay Thai Moe (เดโม)

เกมบริหารค่ายมวยไทยหญิง ผสมเดทซิม และซอฟต์พาวเวอร์ไทย เล่นต่อได้หลายปีหลังจบเนื้อเรื่องหลักปีแรก โดยคู่ชกและรายการจะท้าทายขึ้นตามความก้าวหน้าของค่าย

## เล่น
เปิด `index.html` ผ่านเว็บเซิร์ฟเวอร์ (เช่น GitHub Pages) หรือรันในเครื่อง:

```bash
python3 -m http.server 8000
# แล้วเปิด http://localhost:8000
```

เซฟเก็บในเบราว์เซอร์ (localStorage) และส่งออก/นำเข้าเป็นไฟล์ได้ในหน้าตั้งค่า
(เซฟคลาวด์ใช้ได้เฉพาะตอนเปิดผ่าน Claude Artifact)

## โครงสร้าง
- `src/` โค้ดเกม: `engine.js` (ระบบจำลองและสมดุล), `data.js` / `story.js` (ข้อมูลและบท), `pixel.js` / `chibi.js` (สไปรต์และฉาก), `audio.js`, `ui.js`, `style.css`
- `a/` รูปภาพและสไปรต์
- `tools/` สคริปต์ทดสอบ (Node + Playwright): `play.js` เล่นทั้งฤดูกาล, `diff3.js` จำลองความยาก

## Build
```bash
./build.sh   # รวม src/ เป็น index.html
```

## License
© 2026 Saharath Kaewwimon (Man). All rights reserved — see [LICENSE](LICENSE). Playing, streaming and sharing screenshots are welcome; copying or re-hosting the game or its art is not.

# บ้านเรา — ระบบจัดการห้องเช่า

เว็บจัดการค่าเช่า ค่าน้ำ ค่าไฟ มิเตอร์ รูปมิเตอร์ บิล และข้อมูลผู้เช่า รองรับมือถือ

## รันบนเครื่อง

ต้องใช้ Node.js 22 ขึ้นไป

```bash
cp .env.example .env
npm ci
npm run dev
```

เปิด `http://localhost:3001`

## Deploy บน VPS ด้วย Docker

VPS ควรเป็น Ubuntu 22.04/24.04 และติดตั้ง Docker Engine กับ Docker Compose plugin แล้ว

```bash
git clone <REPOSITORY_URL> baanrao
cd baanrao
cp .env.example .env
nano .env
docker compose up -d --build
docker compose logs -f app
```

ตั้ง `ADMIN_USERNAME` และ `ADMIN_PASSWORD` ใน `.env` ก่อนเริ่มระบบ โดยใช้รหัสผ่านยาวและไม่ซ้ำกับบริการอื่น

แอปฟังเฉพาะ `127.0.0.1:3001` ควรวาง Nginx หรือ Caddy ด้านหน้าเพื่อเปิด HTTPS

ตัวอย่าง Nginx:

```nginx
server {
    listen 80;
    server_name rent.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 10M;
    }
}
```

จากนั้นติดตั้งใบรับรอง HTTPS ด้วย Certbot:

```bash
sudo certbot --nginx -d rent.example.com
```

## สำรองข้อมูล

ข้อมูลทั้งหมด รวมฐานข้อมูลและรูปมิเตอร์ อยู่ใน Docker volume `baanrao_data`

```bash
docker run --rm -v baanrao_baanrao_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/baanrao-backup-$(date +%F).tar.gz -C /data .
```

## อัปเดตระบบ

```bash
git pull
docker compose up -d --build
```

## ตรวจสอบก่อน push

```bash
npm ci
npm run typecheck
npm run build
```

อย่า commit ไฟล์ `.env`, โฟลเดอร์ `data/`, ฐานข้อมูล หรือรูปมิเตอร์ลง repository

import { getDb } from "../../../db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const seedLocations = [
  [1, "จุด 1", 18, 8],
  [2, "จุด 2", 20, 7.5],
  [3, "จุด 3", 15, 8.5],
] as const;
const tenants = ["สมชาย ใจดี","พรทิพย์ แสงทอง","ณัฐพล มีสุข","สุรีย์พร ขยัน","วินัย คงมั่น","","กานดา พูนผล","วีระชัย มั่นคง","ดวงใจ งามดี","อาทิตย์ พร้อมใจ","นันทนา สุขสันต์","ธนา สมบูรณ์","มาลี รุ่งเรือง","นพดล ตั้งใจ"];
const roomIds = ["A01","A02","A03","A04","A05","A06","B01","B02","B03","B04","B05","C01","C02","C03"];
const rents = [3200,3500,3200,3800,3400,3600,3000,3200,3200,3400,3000,4200,4500,4000];

function ensureSeed() {
  const db = getDb();
  const seedLocation = db.prepare("INSERT OR IGNORE INTO locations (id,name,water_rate,electric_rate) VALUES (?,?,?,?)");
  const seedRoom = db.prepare(`INSERT OR IGNORE INTO rooms
    (id,site,rent,tenant,phone,status,old_water,new_water,old_electric,new_electric,meter_photo_key,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
  const transaction = db.transaction(() => {
    for (const location of seedLocations) seedLocation.run(...location);
    roomIds.forEach((id, i) => seedRoom.run(
      id, i < 6 ? 1 : i < 11 ? 2 : 3, rents[i], tenants[i], "",
      i % 3 === 0 ? "paid" : i % 3 === 1 ? "pending" : "draft",
      70 + i * 5, 77 + i * 5, 420 + i * 27, 468 + i * 27, "", Date.now()
    ));
  });
  transaction();
}

export async function GET() {
  try {
    ensureSeed();
    const db = getDb();
    const locations = db.prepare(`SELECT id,name,water_rate AS waterRate,electric_rate AS electricRate FROM locations ORDER BY id`).all();
    const rooms = db.prepare(`SELECT id,site,rent,tenant,phone,status,old_water AS oldWater,new_water AS newWater,
      old_electric AS oldElectric,new_electric AS newElectric,meter_photo_key AS meterPhotoKey,updated_at AS updatedAt
      FROM rooms ORDER BY id`).all();
    return Response.json({ locations, rooms });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as { type: "room"|"location"; id: string|number; data: Record<string, unknown> };
    const db = getDb();
    if (body.type === "room") {
      const d = body.data;
      db.prepare(`UPDATE rooms SET tenant=?,phone=?,rent=?,status=?,old_water=?,new_water=?,old_electric=?,new_electric=?,
        meter_photo_key=?,updated_at=? WHERE id=?`).run(
        String(d.tenant ?? ""), String(d.phone ?? ""), Number(d.rent), String(d.status),
        Number(d.oldWater), Number(d.newWater), Number(d.oldElectric), Number(d.newElectric),
        String(d.meterPhotoKey ?? ""), Date.now(), String(body.id)
      );
    } else {
      const d = body.data;
      db.prepare("UPDATE locations SET name=?,water_rate=?,electric_rate=? WHERE id=?")
        .run(String(d.name), Number(d.waterRate), Number(d.electricRate), Number(body.id));
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "บันทึกไม่สำเร็จ" }, { status: 500 });
  }
}

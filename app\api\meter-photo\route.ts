import { mkdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { getDataDir } from "../../../db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const mimeTypes: Record<string,string> = { ".jpg":"image/jpeg", ".jpeg":"image/jpeg", ".png":"image/png", ".webp":"image/webp", ".gif":"image/gif" };

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const roomId = String(form.get("roomId") ?? "room").replace(/[^a-zA-Z0-9_-]/g, "");
    if (!(file instanceof File) || !file.type.startsWith("image/")) return Response.json({ error: "รองรับเฉพาะไฟล์รูปภาพ" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return Response.json({ error: "รูปต้องมีขนาดไม่เกิน 8 MB" }, { status: 400 });
    const ext = file.type === "image/png" ? ".png" : file.type === "image/webp" ? ".webp" : ".jpg";
    const relativeKey = `${roomId}/${Date.now()}-${crypto.randomUUID()}${ext}`;
    const uploadDir = join(getDataDir(), "uploads", roomId);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(join(getDataDir(), "uploads", relativeKey), Buffer.from(await file.arrayBuffer()));
    return Response.json({ key: relativeKey, url: `/api/meter-photo?key=${encodeURIComponent(relativeKey)}` });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const uploadsRoot = resolve(join(getDataDir(), "uploads"));
  const filePath = resolve(uploadsRoot, key);
  if (!key || !filePath.startsWith(uploadsRoot + sep)) return new Response("Invalid key", { status: 400 });
  try {
    const body = await readFile(filePath);
    return new Response(body, { headers: { "content-type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream", "cache-control": "private, max-age=3600" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

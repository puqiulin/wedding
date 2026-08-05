import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { MAX_ALBUM_PHOTOS } from "@/lib/album";
import { deletePublicAsset } from "@/lib/public-assets";
import { asc, count, desc, inArray } from "drizzle-orm";

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { src, alt, fileName, fileSize } = await req.json();
  if (typeof src !== "string" || !src.startsWith("/album/")) {
    return NextResponse.json({ error: "Invalid album photo" }, { status: 400 });
  }

  const [photoCount] = await db.select({ value: count() }).from(photos);
  if ((photoCount?.value ?? 0) >= MAX_ALBUM_PHOTOS) {
    return NextResponse.json(
      { error: `Album supports up to ${MAX_ALBUM_PHOTOS} photos` },
      { status: 400 },
    );
  }

  const [maxRow] = await db
    .select({ max: photos.sortOrder })
    .from(photos)
    .orderBy(desc(photos.sortOrder))
    .limit(1);
  const nextOrder = maxRow?.max != null ? maxRow.max + 1 : 0;
  const [row] = await db
    .insert(photos)
    .values({ src, alt: alt || "", fileName: fileName || "", fileSize: fileSize || 0, sortOrder: nextOrder })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const requestedIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [...new Set(
    requestedIds.filter((id): id is number => typeof id === "number" && Number.isInteger(id) && id > 0),
  )];

  if (!ids.length) {
    return NextResponse.json({ error: "No valid photo IDs provided" }, { status: 400 });
  }

  const db = await getDb();
  const rows = await db.select().from(photos).where(inArray(photos.id, ids));

  await Promise.all(rows.map((photo) => deletePublicAsset(photo.src)));
  await db.delete(photos).where(inArray(photos.id, ids));

  return NextResponse.json({ ok: true, deletedIds: rows.map((photo) => photo.id) });
}

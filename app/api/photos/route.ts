import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { MAX_ALBUM_PHOTOS } from "@/lib/album";
import { asc, count, desc } from "drizzle-orm";

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

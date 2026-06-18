import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { asc, desc } from "drizzle-orm";

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { src, alt, fileName, fileSize } = await req.json();
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

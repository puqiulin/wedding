import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { src, alt, fileName, fileSize } = await req.json();
  const [maxRow] = await db
    .select({ max: photos.sortOrder })
    .from(photos)
    .orderBy(asc(photos.sortOrder));
  const nextOrder = maxRow?.max != null ? maxRow.max + 1 : 0;
  const [row] = await db
    .insert(photos)
    .values({ src, alt: alt || "", fileName: fileName || "", fileSize: fileSize || 0, sortOrder: nextOrder })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

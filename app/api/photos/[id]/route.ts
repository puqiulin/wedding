import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deleteS3Object } from "@/lib/s3";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [row] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, Number(id)));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteS3Object(row.src);
  await db.delete(photos).where(eq(photos.id, Number(id)));
  return NextResponse.json({ ok: true });
}

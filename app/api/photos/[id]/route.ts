import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { deletePublicAsset } from "@/lib/public-assets";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = await getDb();
  const { id } = await params;
  const [row] = await db
    .select()
    .from(photos)
    .where(eq(photos.id, Number(id)));
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deletePublicAsset(row.src);
  await db.delete(photos).where(eq(photos.id, Number(id)));
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { coverImages } from "@/lib/db/schema";
import { deletePublicAsset, publicAssetExists } from "@/lib/public-assets";

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(coverImages).limit(1);
  const coverImage = rows[0];
  return NextResponse.json(
    coverImage && await publicAssetExists(coverImage.src) ? coverImage : null
  );
}

export async function POST(req: NextRequest) {
  const { src, fileName, fileSize } = await req.json();
  if (typeof src !== "string" || !src.startsWith("/cover/")) {
    return NextResponse.json({ error: "Invalid cover image" }, { status: 400 });
  }

  const db = await getDb();
  const existing = await db.select().from(coverImages).limit(1);
  if (existing.length > 0) {
    await deletePublicAsset(existing[0].src);
    await db.delete(coverImages);
  }

  const [row] = await db
    .insert(coverImages)
    .values({
      src,
      fileName: typeof fileName === "string" ? fileName : "",
      fileSize: typeof fileSize === "number" ? fileSize : 0,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function DELETE() {
  const db = await getDb();
  const existing = await db.select().from(coverImages).limit(1);
  if (existing.length > 0) {
    await deletePublicAsset(existing[0].src);
    await db.delete(coverImages);
  }
  return NextResponse.json({ ok: true });
}

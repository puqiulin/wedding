import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { music } from "@/lib/db/schema";
import { deletePublicAsset } from "@/lib/public-assets";

export async function GET() {
  const db = await getDb();
  const rows = await db.select().from(music).limit(1);
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const { src, fileName, fileSize } = await req.json();
  // delete existing
  const existing = await db.select().from(music).limit(1);
  if (existing.length > 0) {
    await deletePublicAsset(existing[0].src);
    await db.delete(music);
  }
  const [row] = await db.insert(music).values({ src, fileName, fileSize }).returning();
  return NextResponse.json(row);
}

export async function DELETE() {
  const db = await getDb();
  const existing = await db.select().from(music).limit(1);
  if (existing.length > 0) {
    await deletePublicAsset(existing[0].src);
    await db.delete(music);
  }
  return NextResponse.json({ ok: true });
}

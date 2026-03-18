import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { music } from "@/lib/db/schema";
import { deleteS3Object } from "@/lib/s3";

export async function GET() {
  const rows = await db.select().from(music).limit(1);
  return NextResponse.json(rows[0] ?? null);
}

export async function POST(req: NextRequest) {
  const { src, fileName, fileSize } = await req.json();
  // delete existing
  const existing = await db.select().from(music).limit(1);
  if (existing.length > 0) {
    await deleteS3Object(existing[0].src);
    await db.delete(music);
  }
  const [row] = await db.insert(music).values({ src, fileName, fileSize }).returning();
  return NextResponse.json(row);
}

export async function DELETE() {
  const existing = await db.select().from(music).limit(1);
  if (existing.length > 0) {
    await deleteS3Object(existing[0].src);
    await db.delete(music);
  }
  return NextResponse.json({ ok: true });
}

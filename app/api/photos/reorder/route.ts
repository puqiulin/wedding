import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: number[] };
  await Promise.all(
    ids.map((id, index) =>
      db.update(photos).set({ sortOrder: index }).where(eq(photos.id, id))
    )
  );
  return NextResponse.json({ ok: true });
}

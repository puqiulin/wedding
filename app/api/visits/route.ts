import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { visitorLogs } from "@/lib/db/schema";
import { getVisitorInfo } from "@/lib/visitor-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = req.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select()
    .from(visitorLogs)
    .orderBy(desc(visitorLogs.createdAt))
    .limit(200);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const pathName = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
  const visit = await getVisitorInfo(req.headers, pathName);

  await db.insert(visitorLogs).values(visit);

  return NextResponse.json({ ok: true }, { status: 201 });
}

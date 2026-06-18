import { NextRequest, NextResponse } from "next/server";
import { count, countDistinct, desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { visitorLogs } from "@/lib/db/schema";
import { getVisitorInfo } from "@/lib/visitor-info";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const db = await getDb();
  const session = req.cookies.get("admin_session");
  if (!session || session.value !== "authenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(visitorLogs)
      .orderBy(desc(visitorLogs.createdAt))
      .limit(200),
    db
      .select({
        totalViews: count(),
        uniqueVisitors: countDistinct(visitorLogs.ip),
      })
      .from(visitorLogs),
  ]);

  return NextResponse.json({
    rows,
    stats: {
      totalViews: Number(totals[0]?.totalViews ?? 0),
      uniqueVisitors: Number(totals[0]?.uniqueVisitors ?? 0),
    },
  });
}

export async function POST(req: NextRequest) {
  const db = await getDb();
  const body = await req.json().catch(() => ({}));
  const pathName = typeof body.path === "string" ? body.path.slice(0, 500) : "/";
  const visit = await getVisitorInfo(req.headers, pathName);

  await db.insert(visitorLogs).values(visit);

  return NextResponse.json({ ok: true }, { status: 201 });
}

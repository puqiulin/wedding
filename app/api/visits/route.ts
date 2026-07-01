import { NextRequest, NextResponse } from "next/server";
import { count, countDistinct, desc, sql } from "drizzle-orm";
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

  const pageParam = Number.parseInt(req.nextUrl.searchParams.get("page") ?? "", 10);
  const pageSizeParam = Number.parseInt(req.nextUrl.searchParams.get("pageSize") ?? "", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0
    ? Math.min(pageSizeParam, 100)
    : 20;

  const [rows, totals] = await Promise.all([
    db
      .select()
      .from(visitorLogs)
      .orderBy(desc(visitorLogs.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db
      .select({
        totalViews: count(),
        uniqueVisitors: countDistinct(visitorLogs.ip),
        distinctCountries: sql<number>`count(distinct nullif(${visitorLogs.countryCode}, ''))`,
      })
      .from(visitorLogs),
  ]);

  const totalViews = Number(totals[0]?.totalViews ?? 0);

  return NextResponse.json({
    rows,
    stats: {
      totalViews,
      uniqueVisitors: Number(totals[0]?.uniqueVisitors ?? 0),
      distinctCountries: Number(totals[0]?.distinctCountries ?? 0),
    },
    pagination: {
      page,
      pageSize,
      totalItems: totalViews,
      totalPages: Math.max(1, Math.ceil(totalViews / pageSize)),
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

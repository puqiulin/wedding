import Link from "next/link";
import type { ComponentType } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { asc, count, countDistinct, desc } from "drizzle-orm";
import {
  ArrowLeft,
  Database,
  FileAudio,
  ImageIcon,
  MapPin,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/lib/db";
import { music, photos, visitorLogs } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dash = (value: string | number | boolean | null | undefined) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

const pad = (value: number) => value.toString().padStart(2, "0");

const fmtDate = (value: string | Date) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const fmtBytes = (bytes: number) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const jsonText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const iconLinkClass =
  "inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const outlineLinkClass =
  "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: ComponentType<{ className?: string }>;
};

function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-muted-foreground">
        暂无数据
      </td>
    </tr>
  );
}

async function assertAdmin() {
  const session = (await cookies()).get("admin_session");
  if (!session || session.value !== "authenticated") redirect("/admin/login");
}

export default async function AdminDbPage() {
  await assertAdmin();

  const db = await getDb();
  const [photoRows, musicRows, visitRows, photoTotals, musicTotals, visitTotals] = await Promise.all([
    db.select().from(photos).orderBy(asc(photos.sortOrder), asc(photos.id)),
    db.select().from(music).orderBy(desc(music.createdAt)),
    db.select().from(visitorLogs).orderBy(desc(visitorLogs.createdAt)).limit(200),
    db.select({ total: count() }).from(photos),
    db.select({ total: count() }).from(music),
    db.select({
      total: count(),
      uniqueVisitors: countDistinct(visitorLogs.ip),
    }).from(visitorLogs),
  ]);

  const totalPhotos = Number(photoTotals[0]?.total ?? 0);
  const totalMusic = Number(musicTotals[0]?.total ?? 0);
  const totalVisits = Number(visitTotals[0]?.total ?? 0);
  const uniqueVisitors = Number(visitTotals[0]?.uniqueVisitors ?? 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/admin" className={iconLinkClass} aria-label="返回后台">
              <ArrowLeft className="size-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Database className="size-4 text-muted-foreground" />
              <h1 className="text-lg font-semibold tracking-tight">数据库</h1>
            </div>
          </div>
          <Link href="/admin" className={outlineLinkClass}>
            后台
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 p-4 pt-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="photos" value={totalPhotos} icon={ImageIcon} />
          <StatCard label="music" value={totalMusic} icon={FileAudio} />
          <StatCard label="visitor_logs" value={totalVisits} icon={Users} />
          <StatCard label="unique visitors" value={uniqueVisitors} icon={MapPin} />
        </section>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ImageIcon className="size-4 text-muted-foreground" />
              photos
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                    <th>ID</th>
                    <th>排序</th>
                    <th>文件名</th>
                    <th>大小</th>
                    <th>路径</th>
                    <th>Alt</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {photoRows.length ? photoRows.map((photo) => (
                    <tr key={photo.id} className="border-t align-top [&>td]:px-4 [&>td]:py-2">
                      <td className="font-mono text-xs">{photo.id}</td>
                      <td className="font-mono text-xs">{photo.sortOrder}</td>
                      <td className="max-w-[220px] truncate" title={photo.fileName}>{dash(photo.fileName)}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{fmtBytes(photo.fileSize)}</td>
                      <td className="max-w-[300px] truncate font-mono text-xs" title={photo.src}>
                        <Link href={photo.src} target="_blank" className="hover:underline">
                          {photo.src}
                        </Link>
                      </td>
                      <td className="max-w-[180px] truncate text-muted-foreground" title={photo.alt}>{dash(photo.alt)}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{fmtDate(photo.createdAt)}</td>
                    </tr>
                  )) : <EmptyRow colSpan={7} />}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileAudio className="size-4 text-muted-foreground" />
              music
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                    <th>ID</th>
                    <th>文件名</th>
                    <th>大小</th>
                    <th>路径</th>
                    <th>创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {musicRows.length ? musicRows.map((track) => (
                    <tr key={track.id} className="border-t align-top [&>td]:px-4 [&>td]:py-2">
                      <td className="font-mono text-xs">{track.id}</td>
                      <td className="max-w-[260px] truncate" title={track.fileName}>{track.fileName}</td>
                      <td className="whitespace-nowrap text-muted-foreground">{fmtBytes(track.fileSize)}</td>
                      <td className="max-w-[300px] truncate font-mono text-xs" title={track.src}>
                        <Link href={track.src} target="_blank" className="hover:underline">
                          {track.src}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">{fmtDate(track.createdAt)}</td>
                    </tr>
                  )) : <EmptyRow colSpan={5} />}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Users className="size-4 text-muted-foreground" />
              visitor_logs
              <span className="font-normal text-muted-foreground">最近 {visitRows.length} 条</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1360px] text-left text-sm">
                <thead className="bg-muted/50 text-xs text-muted-foreground">
                  <tr className="[&>th]:px-4 [&>th]:py-2 [&>th]:font-medium">
                    <th>ID</th>
                    <th>时间</th>
                    <th>IP</th>
                    <th>路径</th>
                    <th>来源</th>
                    <th>国家/城市</th>
                    <th>ASN</th>
                    <th>系统</th>
                    <th>浏览器</th>
                    <th>设备</th>
                    <th>风险</th>
                    <th>User-Agent</th>
                    <th>Raw</th>
                  </tr>
                </thead>
                <tbody>
                  {visitRows.length ? visitRows.map((visit) => {
                    const riskFlags = [
                      visit.isAnonymous && "匿名",
                      visit.isAnonymousVpn && "VPN",
                      visit.isHostingProvider && "托管",
                      visit.isPublicProxy && "代理",
                      visit.isTorExitNode && "Tor",
                    ].filter(Boolean).join(" / ");
                    const raw = [
                      jsonText(visit.geoRaw),
                      jsonText(visit.userAgentRaw),
                    ].filter(Boolean).join("\n\n");

                    return (
                      <tr key={visit.id} className="border-t align-top [&>td]:px-4 [&>td]:py-2">
                        <td className="font-mono text-xs">{visit.id}</td>
                        <td className="whitespace-nowrap text-muted-foreground">{fmtDate(visit.createdAt)}</td>
                        <td className="whitespace-nowrap font-mono text-xs">{dash(visit.ip)}</td>
                        <td className="max-w-[160px] truncate" title={visit.path}>{dash(visit.path)}</td>
                        <td className="max-w-[180px] truncate text-muted-foreground" title={visit.referer}>{dash(visit.referer)}</td>
                        <td className="max-w-[220px]">
                          <div className="truncate">{dash([visit.countryName, visit.cityName].filter(Boolean).join(" / "))}</div>
                          <div className="text-xs text-muted-foreground">{dash([visit.countryCode, visit.regionName, visit.timeZone].filter(Boolean).join(" / "))}</div>
                        </td>
                        <td className="max-w-[180px]">
                          <div className="truncate">{dash(visit.autonomousSystemOrganization)}</div>
                          <div className="text-xs text-muted-foreground">{visit.autonomousSystemNumber ? `AS${visit.autonomousSystemNumber}` : "-"}</div>
                        </td>
                        <td className="whitespace-nowrap">{dash([visit.osName, visit.osVersion].filter(Boolean).join(" "))}</td>
                        <td className="whitespace-nowrap">{dash([visit.browserName, visit.browserVersion].filter(Boolean).join(" "))}</td>
                        <td className="max-w-[180px]">
                          <div className="truncate">{dash([visit.deviceVendor, visit.deviceModel].filter(Boolean).join(" "))}</div>
                          <div className="text-xs text-muted-foreground">{dash(visit.deviceType)}</div>
                        </td>
                        <td className="whitespace-nowrap text-xs">
                          {riskFlags ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-1.5 py-0.5 text-destructive">
                              <ShieldAlert className="size-3" />
                              {riskFlags}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="max-w-[280px] truncate text-xs text-muted-foreground" title={visit.userAgent}>
                          {dash(visit.userAgent)}
                        </td>
                        <td className="min-w-[120px]">
                          {raw ? (
                            <details>
                              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">查看</summary>
                              <pre className="mt-2 max-h-56 w-[360px] overflow-auto rounded-lg bg-muted p-3 text-xs leading-relaxed">
                                {raw}
                              </pre>
                            </details>
                          ) : "-"}
                        </td>
                      </tr>
                    );
                  }) : <EmptyRow colSpan={13} />}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

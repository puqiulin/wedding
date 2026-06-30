"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  DndContext, closestCenter, PointerSensor, TouchSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable, rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ImagePlus, Music, Trash2, LogOut, RefreshCw, Upload, X,
  CheckCircle2, AlertCircle, Loader2, Globe2, Flag, Monitor, Smartphone,
  Chrome, CircleUserRound, Eye, Users, ChevronsLeft,
  ChevronLeft, ChevronRight, ChevronsRight,
} from "lucide-react";
import type { CoverImage, Photo, Music as MusicType, VisitorLog } from "@/lib/db/schema";
import { MAX_ALBUM_PHOTOS } from "@/lib/album";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// --- Helpers ---

const fmt = (bytes: number) => {
  if (!bytes) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${u[i]}`;
};

const dash = (value: string | number | null | undefined) =>
  value === null || value === undefined || value === "" ? "—" : value;

const pad = (value: number) => value.toString().padStart(2, "0");

const fmtDate = (value: string | Date) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

const countryFlagEmoji = (countryCode: string | null | undefined) => {
  const code = countryCode?.trim().toUpperCase();
  if (!code || !/^[A-Z]{2}$/.test(code)) return null;

  return Array.from(code)
    .map((letter) => String.fromCodePoint(0x1f1e6 + letter.charCodeAt(0) - 65))
    .join("");
};

type UploadedAsset = {
  src: string;
  fileName: string;
  fileSize: number;
};

function xhrUpload(file: File, folder: "album" | "cover" | "music", onProgress: (p: number) => void) {
  return new Promise<UploadedAsset>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 300) {
        reject();
        return;
      }

      resolve(JSON.parse(xhr.responseText) as UploadedAsset);
    };
    xhr.onerror = () => reject();
    xhr.open("POST", "/api/upload");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    xhr.send(formData);
  });
}

interface UploadItem {
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "done" | "error";
}

type VisitorLogRow = Omit<VisitorLog, "createdAt"> & { createdAt: string };
type VisitStats = {
  totalViews: number;
  uniqueVisitors: number;
};
type VisitPagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

// --- Upload Progress Panel ---

function UploadProgress({ items }: { items: UploadItem[] }) {
  if (!items.length) return null;
  const done = items.filter((i) => i.status === "done").length;
  const total = items.length;
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">上传进度</span>
        <span className="text-muted-foreground">{done}/{total}</span>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs truncate max-w-[60%] text-muted-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">{fmt(item.size)}</span>
              </div>
              <Progress
                value={item.progress}
                className={cn(
                  "h-1.5",
                  item.status === "error" && "[&>div]:bg-destructive",
                  item.status === "done" && "[&>div]:bg-emerald-500",
                )}
              />
            </div>
            <div className="w-5 shrink-0">
              {item.status === "uploading" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
              {item.status === "done" && <CheckCircle2 className="size-4 text-emerald-500" />}
              {item.status === "error" && <AlertCircle className="size-4 text-destructive" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Visitor Table ---

function VisitorTable({
  visits,
  stats,
  pagination,
  loading,
  onPageChange,
}: {
  visits: VisitorLogRow[];
  stats: VisitStats;
  pagination: VisitPagination;
  loading: boolean;
  onPageChange: (page: number) => void;
}) {
  const flagText = (visit: VisitorLogRow) =>
    [
      visit.isAnonymous && "匿名",
      visit.isAnonymousVpn && "VPN",
      visit.isHostingProvider && "托管",
      visit.isPublicProxy && "代理",
      visit.isTorExitNode && "Tor",
    ].filter(Boolean).join(" / ");

  const tableIconClass = "size-3.5 shrink-0 text-muted-foreground";

  const canGoBack = pagination.page > 1;
  const canGoForward = pagination.page < pagination.totalPages;

  return (
    <section className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">总浏览</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{stats.totalViews}</p>
            </div>
            <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
              <Eye className="size-5" />
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">独立访客</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{stats.uniqueVisitors}</p>
            </div>
            <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden" aria-busy={loading}>
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Globe2 className="size-4 text-muted-foreground" />
              访客信息
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {loading && <Loader2 className="size-3.5 animate-spin" />}
              <span>共 {pagination.totalItems} 条</span>
            </div>
          </div>
          <div className={cn("overflow-x-auto transition-opacity", loading && "opacity-55")}>
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-muted/50 text-xs text-muted-foreground">
                <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:font-medium">
                  <th>时间</th>
                  <th>IP</th>
                  <th>
                    <span className="flex items-center gap-1.5">
                      <Flag className={tableIconClass} />
                      国家
                    </span>
                  </th>
                  <th>ASN</th>
                  <th>
                    <span className="flex items-center gap-1.5">
                      <Monitor className={tableIconClass} />
                      系统
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1.5">
                      <Chrome className={tableIconClass} />
                      浏览器
                    </span>
                  </th>
                  <th>
                    <span className="flex items-center gap-1.5">
                      <Smartphone className={tableIconClass} />
                      设备
                    </span>
                  </th>
                  <th>风险</th>
                  <th>路径</th>
                  <th>User-Agent</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  (() => {
                    const countryCode = visit.countryCode || visit.registeredCountryCode;
                    const countryName = visit.countryName || visit.registeredCountryName;
                    const countryIcon = countryFlagEmoji(countryCode);

                    return (
                      <tr key={visit.id} className="border-t align-top [&>td]:px-3 [&>td]:py-2">
                      <td className="whitespace-nowrap text-muted-foreground">{fmtDate(visit.createdAt)}</td>
                      <td className="whitespace-nowrap font-mono text-xs">{dash(visit.ip)}</td>
                      <td className="whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {countryIcon ? (
                            <span className="text-base leading-none" title={countryName || countryCode} aria-hidden="true">
                              {countryIcon}
                            </span>
                          ) : (
                            <Flag className={tableIconClass} />
                          )}
                          <span>
                            {dash(countryName)}
                            {countryCode && <span className="ml-1 text-muted-foreground">({countryCode})</span>}
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[180px]">
                        <div className="truncate">{dash(visit.autonomousSystemOrganization)}</div>
                        {visit.autonomousSystemNumber && (
                          <div className="text-xs text-muted-foreground">AS{visit.autonomousSystemNumber}</div>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Monitor className={tableIconClass} />
                          {dash([visit.osName, visit.osVersion].filter(Boolean).join(" "))}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <Chrome className={tableIconClass} />
                          {dash([visit.browserName, visit.browserVersion].filter(Boolean).join(" "))}
                        </span>
                      </td>
                      <td className="max-w-[160px]">
                        <div className="flex items-start gap-1.5">
                          <Smartphone className={cn(tableIconClass, "mt-0.5")} />
                          <div className="min-w-0">
                            <div className="truncate">{dash([visit.deviceVendor, visit.deviceModel].filter(Boolean).join(" "))}</div>
                            <div className="text-xs text-muted-foreground">{dash(visit.deviceType)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-xs">{dash(flagText(visit))}</td>
                      <td className="max-w-[180px] truncate" title={visit.path}>{dash(visit.path)}</td>
                      <td className="max-w-[280px] truncate text-xs text-muted-foreground" title={visit.userAgent}>
                        {dash(visit.userAgent)}
                      </td>
                      </tr>
                    );
                  })()
                ))}
              </tbody>
            </table>
          </div>
          {!visits.length && (
            <div className="py-10 text-center text-sm text-muted-foreground">暂无访客记录</div>
          )}
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              第 {pagination.page} / {pagination.totalPages} 页 · 本页 {visits.length} 条
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(1)}
                disabled={!canGoBack || loading}
                aria-label="第一页"
                title="第一页"
              >
                <ChevronsLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!canGoBack || loading}
                aria-label="上一页"
                title="上一页"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!canGoForward || loading}
                aria-label="下一页"
                title="下一页"
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={!canGoForward || loading}
                aria-label="最后一页"
                title="最后一页"
              >
                <ChevronsRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// --- Sortable Photo ---

function SortablePhoto({ photo, onDelete, deleting }: { photo: Photo; onDelete: (id: number) => void; deleting: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: photo.id });
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative rounded-xl bg-muted", deleting && "opacity-50 pointer-events-none")}
    >
      {deleting && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-black/30">
          <Loader2 className="size-6 text-white animate-spin" />
        </div>
      )}
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none rounded-xl overflow-hidden">
        <Image src={photo.src} alt={photo.alt} width={200} height={200}
          className="w-full aspect-square object-cover transition-transform group-hover:scale-[1.02] pointer-events-none select-none [-webkit-touch-callout:none]" draggable={false} />
      </div>
      {photo.fileSize > 0 && (
        <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white/80">
          {fmt(photo.fileSize)}
        </span>
      )}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger
          render={
            <button className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/50 p-1.5 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-destructive" />
          }
        >
          <X className="size-3.5" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确定删除这张照片？</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setDialogOpen(false); onDelete(photo.id); }}>删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Main Page ---

export default function AdminPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [coverImage, setCoverImage] = useState<CoverImage | null>(null);
  const [musicFile, setMusicFile] = useState<MusicType | null>(null);
  const [visits, setVisits] = useState<VisitorLogRow[]>([]);
  const [visitStats, setVisitStats] = useState<VisitStats>({ totalViews: 0, uniqueVisitors: 0 });
  const [visitPagination, setVisitPagination] = useState<VisitPagination>({ page: 1, pageSize: 20, totalItems: 0, totalPages: 1 });
  const [visitsLoading, setVisitsLoading] = useState(false);
  const [musicProgress, setMusicProgress] = useState<number | null>(null);
  const [coverProgress, setCoverProgress] = useState<number | null>(null);
  const [deletingCover, setDeletingCover] = useState(false);
  const [deletingMusic, setDeletingMusic] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const fetchPhotos = useCallback(async () => {
    setPhotos(await fetch("/api/photos").then((r) => r.json()));
  }, []);

  const fetchCoverImage = useCallback(async () => {
    setCoverImage(await fetch("/api/cover-image").then((r) => r.json()));
  }, []);

  const fetchVisits = useCallback(async (page = 1) => {
    setVisitsLoading(true);
    try {
      const res = await fetch(`/api/visits?page=${page}&pageSize=20`);
      if (!res.ok) return;

      const data = await res.json();
      setVisits(data.rows ?? []);
      setVisitStats({
        totalViews: data.stats?.totalViews ?? 0,
        uniqueVisitors: data.stats?.uniqueVisitors ?? 0,
      });
      setVisitPagination({
        page: data.pagination?.page ?? page,
        pageSize: data.pagination?.pageSize ?? 20,
        totalItems: data.pagination?.totalItems ?? 0,
        totalPages: data.pagination?.totalPages ?? 1,
      });
    } catch {
      // Keep the current page visible when a refresh fails.
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  useEffect(() => { fetchPhotos(); }, [fetchPhotos]);
  useEffect(() => { fetchCoverImage(); }, [fetchCoverImage]);
  useEffect(() => { fetchVisits(); }, [fetchVisits]);
  useEffect(() => { fetch("/api/music").then((r) => r.json()).then(setMusicFile); }, []);

  async function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const remainingSlots = Math.max(0, MAX_ALBUM_PHOTOS - photos.length);
    const selectedFiles = Array.from(files);
    const uploadableFiles = selectedFiles.slice(0, remainingSlots);
    const items: UploadItem[] = selectedFiles.map((f, index) => ({
      name: f.name,
      size: f.size,
      progress: index < remainingSlots ? 0 : 100,
      status: index < remainingSlots ? "uploading" : "error",
    }));
    setUploadItems(items);
    if (!uploadableFiles.length) {
      e.target.value = "";
      setTimeout(() => setUploadItems([]), 3000);
      return;
    }

    const update = (idx: number, patch: Partial<UploadItem>) =>
      setUploadItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

    for (let i = 0; i < uploadableFiles.length; i++) {
      try {
        const uploaded = await xhrUpload(uploadableFiles[i], "album", (p) => update(i, { progress: p }));
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ src: uploaded.src, alt: "", fileName: uploaded.fileName, fileSize: uploaded.fileSize }),
        });
        if (!res.ok) throw new Error("Failed to save photo");
        update(i, { progress: 100, status: "done" });
      } catch {
        update(i, { status: "error" });
      }
    }
    fetchPhotos();
    e.target.value = "";
    setTimeout(() => setUploadItems([]), 3000);
  }

  async function handleMusic(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setMusicProgress(0);
    try {
      const uploaded = await xhrUpload(file, "music", setMusicProgress);
      const m = await fetch("/api/music", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src: uploaded.src, fileName: uploaded.fileName, fileSize: uploaded.fileSize }),
      }).then((r) => r.json());
      setMusicFile(m);
    } catch { /* noop */ }
    setMusicProgress(null);
    e.target.value = "";
  }

  async function handleCoverImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverProgress(0);
    try {
      const uploaded = await xhrUpload(file, "cover", setCoverProgress);
      const image = await fetch("/api/cover-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploaded),
      }).then((r) => r.json());
      setCoverImage(image);
    } catch { /* noop */ }
    setCoverProgress(null);
    e.target.value = "";
  }

  async function deleteCoverImage() {
    setDeletingCover(true);
    try {
      await fetch("/api/cover-image", { method: "DELETE" });
      setCoverImage(null);
    } finally {
      setDeletingCover(false);
    }
  }

  async function deleteMusic() {
    setDeletingMusic(true);
    try {
      await fetch("/api/music", { method: "DELETE" });
      setMusicFile(null);
    } finally {
      setDeletingMusic(false);
    }
  }

  async function deletePhoto(id: number) {
    setDeletingIds((s) => new Set(s).add(id));
    await fetch(`/api/photos/${id}`, { method: "DELETE" });
    setPhotos((p) => p.filter((x) => x.id !== id));
    setDeletingIds((s) => { const n = new Set(s); n.delete(id); return n; });
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIdx = photos.findIndex((p) => p.id === active.id);
    const newIdx = photos.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(photos, oldIdx, newIdx);
    setPhotos(reordered);
    await fetch("/api/photos/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: reordered.map((p) => p.id) }),
    });
  }

  const uploading = uploadItems.some((i) => i.status === "uploading");
  const canUploadMorePhotos = photos.length < MAX_ALBUM_PHOTOS;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-tight">后台管理</h1>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={() => { fetchPhotos(); fetchCoverImage(); fetchVisits(visitPagination.page); }} aria-label="刷新">
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => { fetch("/api/auth/logout", { method: "POST" }); router.push("/admin/login"); }}>
              <LogOut className="size-3.5 mr-1.5" />退出
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 pt-6">
        {/* Main asset controls */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Cover image card */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CircleUserRound className="size-4 text-muted-foreground" />
                封面头像
              </div>
              <div className={cn("flex items-center gap-3 rounded-lg bg-muted/50 p-3", deletingCover && "pointer-events-none opacity-50")}>
                <Image
                  src={coverImage?.src ?? "/sprite.jpg"}
                  alt="当前封面头像"
                  width={64}
                  height={64}
                  className="size-16 shrink-0 rounded-full object-cover ring-2 ring-background"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{coverImage?.fileName ?? "默认封面"}</p>
                  <p className="text-xs text-muted-foreground">
                    {coverImage ? fmt(coverImage.fileSize) : "未单独配置"}
                  </p>
                </div>
                {coverImage && (
                  deletingCover ? (
                    <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" aria-label="恢复默认封面" />}>
                        <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>恢复默认封面？</AlertDialogTitle>
                          <AlertDialogDescription>当前上传的封面图片将被删除。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteCoverImage}>恢复默认</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )
                )}
              </div>
              <label
                className={cn(
                  "block w-full cursor-pointer rounded-lg border-2 border-dashed py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/30",
                  coverProgress !== null && "pointer-events-none opacity-50",
                )}
              >
                <Upload className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {coverProgress !== null ? "上传中..." : coverImage ? "点击替换封面头像" : "点击选择封面头像"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">支持 JPG、PNG、WebP</p>
                <input type="file" accept="image/*" onChange={handleCoverImage} className="hidden" disabled={coverProgress !== null} />
              </label>
              {coverProgress !== null && (
                <div className="space-y-1">
                  <Progress value={coverProgress} className="h-1.5" />
                  <p className="text-right text-xs text-muted-foreground">{coverProgress}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Music card */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Music className="size-4 text-muted-foreground" />
                背景音乐
              </div>
              {musicFile ? (
                <div className={cn("flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2", deletingMusic && "opacity-50 pointer-events-none")}>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{musicFile.fileName}</p>
                    <p className="text-xs text-muted-foreground">{fmt(musicFile.fileSize)}</p>
                  </div>
                  {deletingMusic ? (
                    <Loader2 className="size-4 animate-spin text-muted-foreground shrink-0" />
                  ) : (
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" size="icon-sm" />}>
                      <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>删除背景音乐？</AlertDialogTitle>
                        <AlertDialogDescription>此操作不可撤销。</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteMusic}>删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">未设置</p>
              )}
              <label
                className={cn(
                  "block w-full cursor-pointer rounded-lg border-2 border-dashed py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/30",
                  musicProgress !== null && "pointer-events-none opacity-50",
                )}
              >
                <Upload className="mx-auto mb-2 size-8 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  {musicProgress !== null ? "上传中..." : musicFile ? "点击替换背景音乐" : "点击选择背景音乐"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground/60">支持 MP3、M4A、WAV</p>
                <input type="file" accept="audio/*" onChange={handleMusic} className="hidden" disabled={musicProgress !== null} />
              </label>
              {musicProgress !== null && (
                <div className="space-y-1">
                  <Progress value={musicProgress} className="h-1.5" />
                  <p className="text-right text-xs text-muted-foreground">{musicProgress}%</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photo upload card */}
          <Card className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImagePlus className="size-4 text-muted-foreground" />
                上传照片
              </div>
              <button
                onClick={() => photoInputRef.current?.click()}
                disabled={uploading || !canUploadMorePhotos}
                className="w-full rounded-lg border-2 border-dashed py-10 text-center transition-colors hover:border-primary/40 hover:bg-muted/30 disabled:opacity-50"
              >
                <Upload className="mx-auto size-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {uploading ? "上传中..." : canUploadMorePhotos ? "点击选择或拖入照片" : "已达到15张上限"}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  已上传 {photos.length}/{MAX_ALBUM_PHOTOS}，支持多选
                </p>
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" disabled={uploading || !canUploadMorePhotos} />
            </CardContent>
          </Card>
        </div>

        {/* Upload progress */}
        <UploadProgress items={uploadItems} />

        {/* Photo grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">
              全部照片 ({photos.length}/{MAX_ALBUM_PHOTOS})
            </h2>
            <p className="text-xs text-muted-foreground">拖拽排序</p>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {photos.map((photo) => (
                  <SortablePhoto key={photo.id} photo={photo} onDelete={deletePhoto} deleting={deletingIds.has(photo.id)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {!photos.length && (
            <div className="rounded-xl border border-dashed py-20 text-center">
              <ImagePlus className="mx-auto size-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">还没有照片，上传一些吧</p>
            </div>
          )}
        </div>

        <VisitorTable
          visits={visits}
          stats={visitStats}
          pagination={visitPagination}
          loading={visitsLoading}
          onPageChange={fetchVisits}
        />
      </main>
    </div>
  );
}

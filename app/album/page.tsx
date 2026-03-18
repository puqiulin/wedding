import Link from "next/link";
import { db } from "@/lib/db";
import { photos, music } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import AlbumClient from "./album-client";

export default async function AlbumPage() {
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  const musicRows = await db.select().from(music).limit(1);
  const bgmSrc = musicRows[0]?.src ?? undefined;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            返回首页
          </Link>
          <h1 className="text-lg font-medium text-gray-800">xxx</h1>
          <div className="w-16" />
        </div>
      </header>
      <AlbumClient photos={rows} bgmSrc={bgmSrc} />
    </div>
  );
}

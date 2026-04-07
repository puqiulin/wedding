import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { photos, music } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import AlbumClient from "./album-client";

export default async function AlbumPage() {
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  const musicRows = await db.select().from(music).limit(1);
  const bgmSrc = musicRows[0]?.src ?? undefined;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg px-2.5 h-7 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground transition-all"
          >
            <ChevronLeft className="size-4" />
          </Link>
          {/* <h1 className="text-lg font-medium">sprite</h1> */}
          <div className="w-16" />
        </div>
      </header>
      <AlbumClient photos={rows} bgmSrc={bgmSrc} />
    </div>
  );
}

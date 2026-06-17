import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { music, photos } from "@/lib/db/schema";

export type GalleryPhoto = {
  id: number;
  src: string;
  alt: string;
};

export async function getInvitationData() {
  const db = getDb();
  const rows = await db.select().from(photos).orderBy(asc(photos.sortOrder));
  const musicRows = await db.select().from(music).limit(1);

  return {
    bgmSrc: musicRows[0]?.src ?? undefined,
    photos: rows.map((photo) => ({
      id: photo.id,
      src: photo.src,
      alt: photo.alt,
    })),
  };
}

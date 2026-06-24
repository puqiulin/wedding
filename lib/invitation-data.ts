import { asc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { coverImages, music, photos } from "@/lib/db/schema";
import { publicAssetExists } from "@/lib/public-assets";

export type GalleryPhoto = {
  id: number;
  src: string;
  alt: string;
};

export async function getInvitationData() {
  const db = await getDb();
  const [rows, musicRows, coverRows] = await Promise.all([
    db.select().from(photos).orderBy(asc(photos.sortOrder)),
    db.select().from(music).limit(1),
    db.select().from(coverImages).limit(1),
  ]);
  const configuredCoverSrc = coverRows[0]?.src;
  const coverSrc = configuredCoverSrc && await publicAssetExists(configuredCoverSrc)
    ? configuredCoverSrc
    : "/sprite.jpg";

  return {
    bgmSrc: musicRows[0]?.src ?? undefined,
    coverSrc,
    photos: rows.map((photo) => ({
      id: photo.id,
      src: photo.src,
      alt: photo.alt,
    })),
  };
}

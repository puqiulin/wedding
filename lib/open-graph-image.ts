import { getDb } from "@/lib/db";
import { openGraphImages } from "@/lib/db/schema";
import { publicAssetExists } from "@/lib/public-assets";

export const DEFAULT_OPEN_GRAPH_IMAGE = "/sprite.jpg";

export async function getOpenGraphImageSrc() {
  const db = await getDb();
  const rows = await db.select().from(openGraphImages).limit(1);
  const configuredSrc = rows[0]?.src;

  return configuredSrc && await publicAssetExists(configuredSrc)
    ? configuredSrc
    : DEFAULT_OPEN_GRAPH_IMAGE;
}

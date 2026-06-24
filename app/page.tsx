import HomeClient from "./home-client";
import { getInvitationData } from "@/lib/invitation-data";
import { getRequestLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [{ photos, bgmSrc, coverSrc }, initialLocale] = await Promise.all([
    getInvitationData(),
    getRequestLocale(),
  ]);

  return <HomeClient photos={photos} bgmSrc={bgmSrc} coverSrc={coverSrc} initialLocale={initialLocale} />;
}

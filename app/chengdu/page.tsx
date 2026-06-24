import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HomeClient from "../home-client";
import { translations } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { getInvitationData } from "@/lib/invitation-data";
import { getVenueBySlug } from "@/lib/venues";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const copy = translations[locale];
  return {
    title: copy.routeTitles.chengdu,
    openGraph: {
      title: copy.routeTitles.chengdu,
      description: copy.metadata.routeDescription,
      images: [{ url: "/sprite.jpg", width: 1080, height: 714, alt: copy.metadata.imageAlt }],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ChengduPage() {
  const event = getVenueBySlug("chengdu");
  if (!event) notFound();
  const [{ photos, bgmSrc, coverSrc }, initialLocale] = await Promise.all([
    getInvitationData(),
    getRequestLocale(),
  ]);

  return <HomeClient photos={photos} bgmSrc={bgmSrc} coverSrc={coverSrc} venueEvents={[event]} initialLocale={initialLocale} />;
}

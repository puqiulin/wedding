import { notFound } from "next/navigation";
import HomeClient from "../home-client";
import { getInvitationData } from "@/lib/invitation-data";
import { getVenueBySlug } from "@/lib/venues";

export const metadata = {
  title: "成都婚礼邀请",
};

export const dynamic = "force-dynamic";

export default async function ChengduPage() {
  const event = getVenueBySlug("chengdu");
  if (!event) notFound();
  const { photos, bgmSrc } = await getInvitationData();

  return <HomeClient photos={photos} bgmSrc={bgmSrc} venueEvents={[event]} />;
}

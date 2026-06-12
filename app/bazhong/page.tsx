import { notFound } from "next/navigation";
import HomeClient from "../home-client";
import { getInvitationData } from "@/lib/invitation-data";
import { getVenueBySlug } from "@/lib/venues";

export const metadata = {
  title: "巴中婚礼邀请",
};

export default async function BazhongPage() {
  const event = getVenueBySlug("bazhong");
  if (!event) notFound();
  const { photos, bgmSrc } = await getInvitationData();

  return <HomeClient photos={photos} bgmSrc={bgmSrc} venueEvents={[event]} />;
}

import HomeClient from "./home-client";
import { getInvitationData } from "@/lib/invitation-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { photos, bgmSrc } = await getInvitationData();

  return <HomeClient photos={photos} bgmSrc={bgmSrc} />;
}

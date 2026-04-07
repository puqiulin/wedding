import { Spinner } from "@/components/ui/spinner";

export default function AlbumLoading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner />
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6">
          <Image alt="" className="avatar" src="/sprite.jpg" width={256} height={256} />
          <Link
            href="/album"
            className="rounded-full border border-gray-300 px-6 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            查看婚礼相册
          </Link>
      </div>
  );
}

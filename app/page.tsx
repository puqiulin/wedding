import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Image alt="" className="rounded-full" src="/sprite.jpg" width={256} height={256} />
      <Link
        href="/album"
        className="inline-flex items-center justify-center rounded-full border border-border bg-background px-4 h-8 text-sm font-medium hover:bg-muted hover:text-foreground transition-all"
      >
        查看相册
      </Link>
    </div>
  );
}

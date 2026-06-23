import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { VisitorTracker } from "./visitor-tracker";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://wedding.sprite3366.cn"),
  title: "我们结婚啦",
  description: "诚挚邀请您参加我们的婚礼",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "我们结婚啦",
    description: "何星朋🩷王培琳",
    type: "website",
    url: "/",
    images: [
      {
        url: "/sprite.jpg",
        width: 1080,
        height: 714,
        alt: "婚礼邀请函",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Geist } from "next/font/google";
import { translations } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/i18n-server";
import { cn } from "@/lib/utils";
import { DEFAULT_OPEN_GRAPH_IMAGE, getOpenGraphImageSrc } from "@/lib/open-graph-image";
import { VisitorTracker } from "./visitor-tracker";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  const [locale, openGraphImageSrc] = await Promise.all([
    getRequestLocale(),
    getOpenGraphImageSrc(),
  ]);
  const copy = translations[locale];
  return {
    metadataBase: new URL("https://wedding.sprite3366.cn"),
    title: copy.siteTitle,
    description: copy.metadata.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: copy.siteTitle,
      description: copy.metadata.socialDescription,
      type: "website",
      url: "/",
      images: [{
        url: openGraphImageSrc,
        ...(openGraphImageSrc === DEFAULT_OPEN_GRAPH_IMAGE
          ? { width: 1080, height: 714 }
          : {}),
        alt: copy.metadata.imageAlt,
      }],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} className={cn("font-sans", geist.variable)}>
      <body className="antialiased">
        <Suspense fallback={null}>
          <VisitorTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

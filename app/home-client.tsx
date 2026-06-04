"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Camera, ExternalLink, Heart, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const weddingEvents = [
  {
    date: "2026.9.28",
    isoDate: "2026-09-28",
    city: "成都",
    address: "成都市双流区广都大道480号",
    position: [103.932975, 30.551881] as const,
  },
  {
    date: "2026.10.5",
    isoDate: "2026-10-05",
    city: "巴中",
    address: "巴中市巴州区回风北路55号宏鼎国际2号楼",
    position: [106.736883, 31.869566] as const,
  },
];

type WeddingEvent = (typeof weddingEvents)[number];

type AMapPosition = readonly [number, number];

type AMapMarker = {
  on: (eventName: string, handler: () => void) => void;
  setMap: (map: AMapMap) => void;
};

type AMapMap = {
  destroy: () => void;
  setFitView: (overlays: AMapMarker[], immediately?: boolean, avoid?: [number, number, number, number]) => void;
  setZoomAndCenter: (zoom: number, center: AMapPosition) => void;
};

type AMapNamespace = {
  Map: new (container: HTMLElement, options: Record<string, unknown>) => AMapMap;
  Marker: new (options: Record<string, unknown>) => AMapMarker;
  Pixel: new (x: number, y: number) => unknown;
};

declare global {
  interface Window {
    AMap?: AMapNamespace;
    _AMapSecurityConfig?: {
      securityJsCode?: string;
    };
  }
}

let amapLoaderPromise: Promise<AMapNamespace> | null = null;

function loadAmap(key: string) {
  if (window.AMap) return Promise.resolve(window.AMap);
  if (amapLoaderPromise) return amapLoaderPromise;

  amapLoaderPromise = new Promise<AMapNamespace>((resolve, reject) => {
    const securityJsCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE;
    if (securityJsCode) {
      window._AMapSecurityConfig = { securityJsCode };
    }

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`;
    script.async = true;
    script.onload = () => {
      if (window.AMap) {
        resolve(window.AMap);
      } else {
        reject(new Error("高德地图脚本已加载，但 AMap 对象不可用"));
      }
    };
    script.onerror = () => reject(new Error("高德地图脚本加载失败"));
    document.head.appendChild(script);
  });

  return amapLoaderPromise;
}

function getAmapNavigationUrl(event: WeddingEvent) {
  const [lng, lat] = event.position;
  const name = encodeURIComponent(`${event.city}婚礼地点 ${event.address}`);
  return `https://uri.amap.com/marker?position=${lng},${lat}&name=${name}&coordinate=gaode&callnative=1`;
}

export default function HomeClient() {
  const [opened, setOpened] = useState(false);
  const [coverHidden, setCoverHidden] = useState(false);
  const reduceMotion = useReducedMotion();

  function openInvitation() {
    if (opened) return;
    setOpened(true);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#fff8f4] text-[#3b1410]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffe5dc_0,transparent_38%),linear-gradient(135deg,#fffaf7_0%,#fceae2_52%,#fff7f0_100%)]" />
      <motion.section
        aria-hidden={!coverHidden}
        className="relative flex min-h-screen flex-col items-center justify-center gap-6 px-6 py-16 text-center"
        initial={false}
        animate={{
          opacity: opened ? 1 : 0,
          scale: opened ? 1 : 0.98,
          filter: opened ? "blur(0px)" : "blur(6px)",
        }}
        transition={{ duration: reduceMotion ? 0 : 0.5, ease: "easeOut", delay: opened ? 0.18 : 0 }}
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-[#a90f1a]/10 blur-2xl" />
          <Image
            alt="婚礼邀请函照片"
            className="relative size-52 rounded-full border-4 border-white object-cover shadow-[0_22px_70px_rgba(138,27,21,0.22)] sm:size-64"
            src="/sprite.jpg"
            width={256}
            height={256}
            priority
          />
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium tracking-[0.24em] text-[#a80f1a]">WEDDING INVITATION</p>
          <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">我们结婚啦</h1>
          <p className="text-base text-[#6b3a32] sm:text-lg">何星朋 &amp; 王培琳</p>
        </div>

        <div className="grid w-full max-w-md gap-3 text-left">
          {weddingEvents.map((event) => (
            <div
              key={event.date}
              className="rounded-lg border border-[#d9aaa0]/55 bg-white/58 px-4 py-3 shadow-[0_12px_34px_rgba(138,27,21,0.08)] backdrop-blur"
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-[#9f101a]">
                <CalendarDays className="size-4" />
                <time dateTime={event.isoDate}>{event.date}</time>
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#6b3a32]">
                <MapPin className="mt-1 size-4 shrink-0 text-[#b9232d]" />
                <span>{event.address}</span>
              </p>
            </div>
          ))}
        </div>

        <VenueMap />

        <Link
          href="/album"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#9f101a] px-5 text-sm font-medium text-white shadow-[0_12px_28px_rgba(159,16,26,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#7f0b13] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/30"
        >
          <Camera className="size-4" />
          查看相册
        </Link>
      </motion.section>

      {!coverHidden && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#65060c]"
          initial={false}
          animate={{
            opacity: opened ? 0 : 1,
          }}
          transition={{
            duration: reduceMotion ? 0.01 : 0.28,
            delay: opened && !reduceMotion ? 0.42 : 0,
            ease: "easeOut",
          }}
          onAnimationComplete={() => {
            if (opened) setCoverHidden(true);
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,rgba(255,223,174,0.28),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(255,154,129,0.18),transparent_36%)]" />
          <motion.div className="relative h-full w-full overflow-hidden text-left [perspective:1400px]">
            <span className="absolute inset-0 bg-[#8f0d15]" />
            <span className="absolute inset-4 border border-[#ffd8a2]/28 sm:inset-6" />

            <motion.span
              className="absolute inset-y-0 left-0 block w-1/2 bg-[linear-gradient(110deg,#c51a27_0%,#8f0d15_64%,#65060c_100%)] shadow-[inset_-32px_0_52px_rgba(57,0,0,0.24)]"
              style={{ transformOrigin: "left center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateY: -84, x: -26, opacity: 0.78 } : { rotateY: 0, x: 0, opacity: 1 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-y-0 right-0 block w-1/2 bg-[linear-gradient(250deg,#d92130_0%,#98101a_62%,#69070d_100%)] shadow-[inset_32px_0_52px_rgba(57,0,0,0.24)]"
              style={{ transformOrigin: "right center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateY: 84, x: 26, opacity: 0.78 } : { rotateY: 0, x: 0, opacity: 1 }}
              transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-x-0 top-0 block h-[58%] bg-[linear-gradient(180deg,#e3343f_0%,#b81522_58%,#8e0d16_100%)] [clip-path:polygon(0_0,100%_0,50%_82%)]"
              style={{ transformOrigin: "top center", transformStyle: "preserve-3d" }}
              animate={opened && !reduceMotion ? { rotateX: -116, y: -36, opacity: 0.86 } : { rotateX: 0, y: 0, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute inset-x-0 bottom-0 block h-[54%] bg-[linear-gradient(0deg,#7c0911_0%,#ad1520_100%)] [clip-path:polygon(0_100%,100%_100%,50%_12%)]"
              animate={opened && !reduceMotion ? { y: 24, opacity: 0.5 } : { y: 0, opacity: 1 }}
              transition={{ duration: 0.44, ease: "easeOut" }}
            />

            <motion.button
              type="button"
              aria-label="打开婚礼邀请函"
              disabled={opened}
              onClick={openInvitation}
              className="absolute left-1/2 top-[52%] z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[#ffe0a5]/70 bg-[#f8c76c] text-5xl font-semibold text-[#850910] shadow-[0_18px_38px_rgba(71,0,0,0.28)] outline-none transition-transform hover:scale-105 focus-visible:ring-4 focus-visible:ring-[#ffd8a2]/55 disabled:cursor-default sm:size-28 sm:text-6xl"
              animate={opened && !reduceMotion ? { scale: 0.78, rotate: -8, opacity: 0 } : { scale: 1, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              whileTap={opened || reduceMotion ? undefined : { scale: 0.94 }}
            >
              囍
            </motion.button>

            <motion.span
              className="pointer-events-none absolute inset-0 text-center text-[#ffefd0]"
              animate={opened && !reduceMotion ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
              transition={{ duration: 0.42, ease: "easeOut" }}
            >
              <span className="absolute left-1/2 top-12 flex -translate-x-1/2 items-center gap-2 text-xs font-medium tracking-[0.34em] text-[#ffd99a]">
                <Heart className="size-4 fill-current" />
                INVITATION
              </span>
              <span className="absolute left-1/2 top-[38%] w-full -translate-x-1/2 -translate-y-1/2 space-y-4 px-8">
                <span className="block text-4xl font-semibold leading-none sm:text-5xl">诚挚邀请</span>
              </span>
              <span className="absolute left-1/2 top-[63%] w-full -translate-x-1/2 -translate-y-1/2 px-8 text-base text-[#ffe7bf]/90">
                何星朋 &amp; 王培琳
              </span>
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </main>
  );
}

function VenueMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMapMap | null>(null);
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY ?? "";
  const [selectedDate, setSelectedDate] = useState(weddingEvents[0].date);
  const [mapError, setMapError] = useState<string | null>(() =>
    amapKey ? null : "缺少 NEXT_PUBLIC_AMAP_KEY"
  );

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;
    if (!amapKey) return;

    let disposed = false;
    loadAmap(amapKey)
      .then((AMap) => {
        if (disposed || !mapContainerRef.current) return;

        const map = new AMap.Map(mapContainerRef.current, {
          center: [105.336, 31.21],
          zoom: 7,
          resizeEnable: true,
          viewMode: "2D",
        });

        const markers = weddingEvents.map((event, index) => {
          const marker = new AMap.Marker({
            position: event.position,
            title: event.address,
            offset: new AMap.Pixel(-14, -34),
            content: `<div style="width:28px;height:34px;border-radius:16px 16px 16px 4px;transform:rotate(-45deg);background:#a80f1a;box-shadow:0 10px 24px rgba(128,11,19,.32);border:2px solid #fff4df;display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff4df;font-size:13px;font-weight:700;">${index + 1}</span></div>`,
          });
          marker.setMap(map);
          marker.on("click", () => setSelectedDate(event.date));
          return marker;
        });

        map.setFitView(markers, false, [56, 28, 56, 28]);
        mapInstanceRef.current = map;
      })
      .catch((error: unknown) => {
        setMapError(error instanceof Error ? error.message : "高德地图加载失败");
      });

    return () => {
      disposed = true;
      mapInstanceRef.current?.destroy();
      mapInstanceRef.current = null;
    };
  }, [amapKey]);

  function focusVenue(event: WeddingEvent) {
    setSelectedDate(event.date);
    mapInstanceRef.current?.setZoomAndCenter(15, event.position);
  }

  return (
    <section className="w-full max-w-md rounded-lg border border-[#d9aaa0]/55 bg-white/62 p-3 text-left shadow-[0_16px_42px_rgba(138,27,21,0.1)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#9f101a]">
          <MapPin className="size-4" />
          婚礼地图
        </p>
        <span className="text-xs text-[#8c5a52]">高德地图</span>
      </div>

      <div
        ref={mapContainerRef}
        className="h-56 w-full overflow-hidden rounded-lg bg-[#f2d9d2] ring-1 ring-[#d9aaa0]/50"
        aria-label="婚礼地点地图"
      />

      {mapError && <p className="mt-2 text-xs leading-5 text-[#9f101a]">{mapError}</p>}

      <div className="mt-3 grid gap-2">
        {weddingEvents.map((event) => {
          const selected = selectedDate === event.date;
          return (
            <div
              key={event.date}
              className="grid gap-2 rounded-md border border-[#d9aaa0]/50 bg-[#fff8f4]/72 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <button
                type="button"
                onClick={() => focusVenue(event)}
                className="min-w-0 text-left outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/25"
                aria-pressed={selected}
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-[#3b1410]">
                  <span
                    className={
                      selected
                        ? "size-2 rounded-full bg-[#a80f1a]"
                        : "size-2 rounded-full bg-[#d9aaa0]"
                    }
                  />
                  {event.date} · {event.city}
                </span>
                <span className="mt-1 block text-xs leading-5 text-[#6b3a32]">{event.address}</span>
              </button>

              <a
                href={getAmapNavigationUrl(event)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-[#9f101a] px-3 text-xs font-medium text-white transition-all hover:bg-[#7f0b13] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/30"
              >
                导航
                <ExternalLink className="size-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}

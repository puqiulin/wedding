"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { weddingEvents, type WeddingEvent } from "@/lib/venues";

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

export function VenueInfo({
  events = weddingEvents,
  className,
}: {
  events?: readonly WeddingEvent[];
  className?: string;
}) {
  const sectionClassName = [
    "relative grid gap-6 bg-[#fff8f4] px-6 py-16 text-left",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={sectionClassName}>
      <div className="mx-auto grid w-full max-w-md gap-3">
        {events.map((event) => (
          <div
            key={event.slug}
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

      <VenueMaps events={events} />
    </section>
  );
}

function VenueMaps({ events }: { events: readonly WeddingEvent[] }) {
  return (
    <section className="mx-auto grid w-full max-w-md gap-3 text-left">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#9f101a]">
          <MapPin className="size-4" />
          婚礼地图
        </p>
        <span className="text-xs text-[#8c5a52]">高德地图</span>
      </div>

      {events.map((event, index) => (
        <VenueMapCard key={event.slug} event={event} markerLabel={String(index + 1)} />
      ))}
    </section>
  );
}

function VenueMapCard({ event, markerLabel }: { event: WeddingEvent; markerLabel: string }) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<AMapMap | null>(null);
  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY ?? "";
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
          center: event.position,
          zoom: 15,
          resizeEnable: true,
          viewMode: "2D",
        });

        const marker = new AMap.Marker({
          position: event.position,
          title: event.address,
          offset: new AMap.Pixel(-14, -34),
          content: `<div style="width:28px;height:34px;border-radius:16px 16px 16px 4px;transform:rotate(-45deg);background:#a80f1a;box-shadow:0 10px 24px rgba(128,11,19,.32);border:2px solid #fff4df;display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff4df;font-size:13px;font-weight:700;">${markerLabel}</span></div>`,
        });
        marker.setMap(map);
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
  }, [amapKey, event.address, event.position, markerLabel]);

  function focusVenue() {
    mapInstanceRef.current?.setZoomAndCenter(15, event.position);
  }

  return (
    <article className="rounded-lg border border-[#d9aaa0]/55 bg-white/62 p-3 shadow-[0_16px_42px_rgba(138,27,21,0.1)] backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#3b1410]">
            <span className="size-2 rounded-full bg-[#a80f1a]" />
            {event.date} · {event.city}
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6b3a32]">{event.address}</p>
        </div>
        <a
          href={getAmapNavigationUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full bg-[#9f101a] px-3 text-xs font-medium text-white transition-all hover:bg-[#7f0b13] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/30"
        >
          导航
          <ExternalLink className="size-3.5" />
        </a>
      </div>

      <div
        ref={mapContainerRef}
        className="h-56 w-full overflow-hidden rounded-lg bg-[#f2d9d2] ring-1 ring-[#d9aaa0]/50"
        aria-label={`${event.city}婚礼地点地图`}
      />

      {mapError && <p className="mt-2 text-xs leading-5 text-[#9f101a]">{mapError}</p>}

      <button
        type="button"
        onClick={focusVenue}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full border border-[#d9aaa0]/60 bg-[#fff8f4]/72 text-xs font-medium text-[#9f101a] transition-all hover:bg-[#f7e5df] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/25"
      >
        定位到{event.city}地点
      </button>
    </article>
  );
}

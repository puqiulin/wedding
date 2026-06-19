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

const weekDays = ["一", "二", "三", "四", "五", "六", "日"];
const lunarMonths = [
  "正月",
  "二月",
  "三月",
  "四月",
  "五月",
  "六月",
  "七月",
  "八月",
  "九月",
  "十月",
  "冬月",
  "腊月",
];
const lunarDays = [
  "初一",
  "初二",
  "初三",
  "初四",
  "初五",
  "初六",
  "初七",
  "初八",
  "初九",
  "初十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
  "廿一",
  "廿二",
  "廿三",
  "廿四",
  "廿五",
  "廿六",
  "廿七",
  "廿八",
  "廿九",
  "三十",
];

function parseIsoDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return { year, month, day };
}

function getLocalDate(isoDate: string) {
  const { year, month, day } = parseIsoDate(isoDate);
  return new Date(year, month - 1, day);
}

function getWeddingDateDetails(isoDate: string) {
  const date = getLocalDate(isoDate);
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "long" }).format(date);
  const lunarParts = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
    month: "numeric",
    day: "numeric",
  }).formatToParts(date);
  const lunarMonth = Number(lunarParts.find((part) => part.type === "month")?.value);
  const lunarDay = Number(lunarParts.find((part) => part.type === "day")?.value);

  return {
    weekday,
    lunarDate:
      Number.isInteger(lunarMonth) && Number.isInteger(lunarDay)
        ? `农历${lunarMonths[lunarMonth - 1]}${lunarDays[lunarDay - 1]}`
        : "农历日期",
  };
}

function getMonthCalendar(isoDate: string) {
  const { year, month, day: weddingDay } = parseIsoDate(isoDate);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay();
  const leadingBlanks = (firstDay + 6) % 7;

  return {
    year,
    month,
    weddingDay,
    slots: [
      ...Array.from({ length: leadingBlanks }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ],
  };
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
            className="rounded-lg bg-white/58 p-4 shadow-[0_12px_34px_rgba(138,27,21,0.08)] backdrop-blur"
          >
            <WeddingCalendar event={event} />
          </div>
        ))}
      </div>

      <VenueMaps events={events} />
    </section>
  );
}

function WeddingCalendar({ event }: { event: WeddingEvent }) {
  const calendar = getMonthCalendar(event.isoDate);
  const weddingDateDetails = getWeddingDateDetails(event.isoDate);

  return (
    <div aria-label={`${event.city}${calendar.year}年${calendar.month}月婚期日历`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-sm font-semibold text-[#9f101a]">
            <CalendarDays className="size-4" />
            <span>
              {calendar.year}年{calendar.month}月
            </span>
          </p>
          <p className="mt-1 text-xs leading-5 text-[#8a554d]">
            {weddingDateDetails.lunarDate} · {weddingDateDetails.weekday}
          </p>
        </div>
        <time
          dateTime={event.isoDate}
          className="shrink-0 rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-medium text-[#9f101a] ring-1 ring-[#e5b4a5]/70"
        >
          {event.city}婚期
        </time>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((weekDay) => (
          <span key={weekDay} className="text-[11px] font-medium text-[#9b6a62]">
            {weekDay}
          </span>
        ))}

        {calendar.slots.map((date, index) => {
          if (date === null) {
            return <span key={`empty-${index}`} aria-hidden className="aspect-square" />;
          }

          const isWeddingDay = date === calendar.weddingDay;

          return (
            <time
              key={date}
              dateTime={`${calendar.year}-${String(calendar.month).padStart(2, "0")}-${String(date).padStart(2, "0")}`}
              className={[
                "flex aspect-square min-h-9 flex-col items-center justify-center rounded-full text-sm leading-none",
                isWeddingDay
                  ? "bg-[#a80f1a] font-semibold text-white shadow-[0_10px_24px_rgba(168,15,26,0.26)] ring-2 ring-[#f5c7b0]"
                  : "text-[#6b3a32]",
              ].join(" ")}
              aria-current={isWeddingDay ? "date" : undefined}
            >
              <span>{date}</span>
              {isWeddingDay && <span className="mt-1 text-[9px] leading-none text-[#ffe4c8]">婚期</span>}
            </time>
          );
        })}
      </div>
    </div>
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
    <article className="rounded-lg bg-white/62 p-3 shadow-[0_16px_42px_rgba(138,27,21,0.1)] backdrop-blur">
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
        className="h-56 w-full overflow-hidden rounded-lg bg-[#f2d9d2]"
        aria-label={`${event.city}婚礼地点地图`}
      />

      {mapError && <p className="mt-2 text-xs leading-5 text-[#9f101a]">{mapError}</p>}

      <button
        type="button"
        onClick={focusVenue}
        className="mt-3 inline-flex h-8 w-full items-center justify-center rounded-full bg-[#fff8f4]/72 text-xs font-medium text-[#9f101a] transition-all hover:bg-[#f7e5df] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#c31b28]/25"
      >
        定位到{event.city}地点
      </button>
    </article>
  );
}

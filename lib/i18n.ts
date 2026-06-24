import type { VenueSlug } from "@/lib/venues";

export type Locale = "zh" | "en";

export const defaultLocale: Locale = "zh";
export const localeStorageKey = "wedding-locale";

export const translations = {
  zh: {
    siteTitle: "我们结婚啦",
    routeTitles: {
      chengdu: "我们结婚啦-成都",
      bazhong: "我们结婚啦-巴中",
    },
    metadata: {
      description: "诚挚邀请您参加我们的婚礼",
      routeDescription: "诚挚邀请您参加我们的婚礼答谢宴",
      socialDescription: "何星朋🩷王培琳",
      imageAlt: "婚礼邀请函",
    },
    hero: {
      photoAlt: "婚礼邀请函照片",
      heading: "我们结婚啦",
      scrollHint: "请下滑查看相册与婚礼地点",
      openInvitation: "打开婚礼邀请函",
      invitationTitle: "诚挚邀请",
    },
    stories: [
      { title: "从遇见，到决定一起走很远", body: "有些时刻不必太盛大，只要身边的人刚好是你。" },
      { title: "最好的我们，在对的时间遇见", body: "那天的阳光很好，你笑得刚刚好。" },
      { title: "把平凡日子，过成我们喜欢的样子", body: "后来每个普通清晨，都有了值得期待的方向。" },
      { title: "有你在身边，每一天都很安心", body: "一起看过的风景，都成了我们的回忆。" },
      { title: "这一程，想邀请你见证", body: "未来的路，我们会一直牵着手，一起走下去。" },
    ],
    album: {
      pauseMusic: "暂停音乐",
      playMusic: "播放音乐",
      empty: "暂无相册照片",
      photoPreview: "照片预览",
      previewPhoto: (index: number) => `预览第${index}张照片`,
      previousPhoto: "上一张照片",
      nextPhoto: "下一张照片",
    },
    venue: {
      calendarLabel: (city: string, year: number, month: number) => `${city}${year}年${month}月婚期日历`,
      monthHeading: (year: number, month: number) => `${year}年${month}月`,
      lunarFallback: "农历日期",
      lunarDate: (month: string, day: string) => `农历${month}${day}`,
      dateSeparator: " · ",
      weddingTag: (city: string) => `${city}婚期`,
      weddingDay: "婚期",
      mapHeading: "婚礼地图",
      navigate: "导航",
      mapLabel: (city: string) => `${city}婚礼地点地图`,
      focusVenue: (city: string) => `定位到${city}地点`,
      missingMapKey: "缺少 NEXT_PUBLIC_AMAP_KEY",
      mapLoadFailed: "地图加载失败",
      navigationName: (city: string, address: string) => `${city}婚礼地点 ${address}`,
      weekDays: ["一", "二", "三", "四", "五", "六", "日"],
    },
  },
  en: {
    siteTitle: "We're Getting Married",
    routeTitles: {
      chengdu: "We're Getting Married - Chengdu",
      bazhong: "We're Getting Married - Bazhong",
    },
    metadata: {
      description: "You are warmly invited to celebrate our wedding",
      routeDescription: "You are warmly invited to our wedding celebration",
      socialDescription: "Xingpeng He & Peilin Wang",
      imageAlt: "Wedding invitation",
    },
    hero: {
      photoAlt: "Wedding invitation portrait",
      heading: "We're Getting Married",
      scrollHint: "Scroll down for our story and wedding details",
      openInvitation: "Open wedding invitation",
      invitationTitle: "You're Invited",
    },
    stories: [
      { title: "From the day we met to forever", body: "Some moments need no grand gesture, only the right person beside you." },
      { title: "The best of us, at just the right time", body: "The sun was warm that day, and your smile was perfect." },
      { title: "Making ordinary days our favorite ones", body: "Every quiet morning now gives us something beautiful to look forward to." },
      { title: "Every day feels like home with you", body: "Every place we've seen together has become part of our story." },
      { title: "We'd love you to witness this chapter", body: "For every road ahead, we'll keep walking hand in hand." },
    ],
    album: {
      pauseMusic: "Pause music",
      playMusic: "Play music",
      empty: "No photos yet",
      photoPreview: "Photo preview",
      previewPhoto: (index: number) => `Preview photo ${index}`,
      previousPhoto: "Previous photo",
      nextPhoto: "Next photo",
    },
    venue: {
      calendarLabel: (city: string, year: number, month: number) => `${city} wedding calendar for ${year}-${month}`,
      monthHeading: (year: number, month: number) => new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(new Date(year, month - 1, 1)),
      lunarFallback: "Chinese lunar date",
      lunarDate: (month: string, day: string) => `Lunar calendar: Month ${month}, Day ${day}`,
      dateSeparator: " · ",
      weddingTag: (city: string) => `${city} Wedding`,
      weddingDay: "DAY",
      mapHeading: "Wedding Map",
      navigate: "Directions",
      mapLabel: (city: string) => `Map of the ${city} wedding venue`,
      focusVenue: (city: string) => `Center on ${city} venue`,
      missingMapKey: "Map configuration is unavailable",
      mapLoadFailed: "Map failed to load",
      navigationName: (city: string, address: string) => `${city} wedding venue ${address}`,
      weekDays: ["M", "T", "W", "T", "F", "S", "S"],
    },
  },
} as const;

const localizedVenues: Record<Locale, Record<VenueSlug, { city: string; address: string }>> = {
  zh: {
    chengdu: { city: "成都", address: "成都市双流区广都大道480号" },
    bazhong: { city: "巴中", address: "巴中市巴州区回风北路55号宏鼎国际2号楼" },
  },
  en: {
    chengdu: { city: "Chengdu", address: "No. 480 Guangdu Avenue, Shuangliu District, Chengdu" },
    bazhong: { city: "Bazhong", address: "Building 2, Hongding International, No. 55 Huifeng North Road, Bazhou District, Bazhong" },
  },
};

export function isLocale(value: string | null): value is Locale {
  return value === "zh" || value === "en";
}

export function getLocalizedVenue(slug: VenueSlug, locale: Locale) {
  return localizedVenues[locale][slug];
}

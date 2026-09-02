export const weddingEvents = [
  {
    slug: "chengdu",
    date: "2026.9.28",
    isoDate: "2026-09-28",
    city: "成都",
    address: "杏花村酒店·宴会厅 四川省成都市双流区东升街道广都大道三段与环港路交叉口东南角",
    position: [103.932975, 30.551881] as const,
  },
  {
    slug: "bazhong",
    date: "2026.10.5",
    isoDate: "2026-10-05",
    city: "巴中",
    address: "巴中市巴州区回风北路55号宏鼎国际2号楼",
    position: [106.736883, 31.869566] as const,
  },
] as const;

export type WeddingEvent = (typeof weddingEvents)[number];
export type VenueSlug = WeddingEvent["slug"];

export function getVenueBySlug(slug: VenueSlug) {
  return weddingEvents.find((event) => event.slug === slug);
}

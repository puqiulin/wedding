import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  fileName: text("file_name").notNull().default(""),
  fileSize: integer("file_size").notNull().default(0),
  alt: text("alt").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Photo = typeof photos.$inferSelect;

export const music = pgTable("music", {
  id: serial("id").primaryKey(),
  src: text("src").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Music = typeof music.$inferSelect;

export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  ip: text("ip").notNull().default(""),
  path: text("path").notNull().default(""),
  referer: text("referer").notNull().default(""),
  countryCode: text("country_code").notNull().default(""),
  countryName: text("country_name").notNull().default(""),
  continentCode: text("continent_code").notNull().default(""),
  continentName: text("continent_name").notNull().default(""),
  registeredCountryCode: text("registered_country_code").notNull().default(""),
  registeredCountryName: text("registered_country_name").notNull().default(""),
  cityName: text("city_name").notNull().default(""),
  regionName: text("region_name").notNull().default(""),
  timeZone: text("time_zone").notNull().default(""),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  autonomousSystemNumber: integer("autonomous_system_number"),
  autonomousSystemOrganization: text("autonomous_system_organization").notNull().default(""),
  rir: text("rir").notNull().default(""),
  isAnonymous: boolean("is_anonymous").notNull().default(false),
  isAnonymousVpn: boolean("is_anonymous_vpn").notNull().default(false),
  isHostingProvider: boolean("is_hosting_provider").notNull().default(false),
  isPublicProxy: boolean("is_public_proxy").notNull().default(false),
  isTorExitNode: boolean("is_tor_exit_node").notNull().default(false),
  browserName: text("browser_name").notNull().default(""),
  browserVersion: text("browser_version").notNull().default(""),
  osName: text("os_name").notNull().default(""),
  osVersion: text("os_version").notNull().default(""),
  deviceType: text("device_type").notNull().default(""),
  deviceVendor: text("device_vendor").notNull().default(""),
  deviceModel: text("device_model").notNull().default(""),
  engineName: text("engine_name").notNull().default(""),
  engineVersion: text("engine_version").notNull().default(""),
  cpuArchitecture: text("cpu_architecture").notNull().default(""),
  userAgent: text("user_agent").notNull().default(""),
  acceptLanguage: text("accept_language").notNull().default(""),
  geoRaw: jsonb("geo_raw"),
  userAgentRaw: jsonb("user_agent_raw"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type VisitorLog = typeof visitorLogs.$inferSelect;

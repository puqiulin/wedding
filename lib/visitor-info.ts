import "server-only";

import path from "node:path";
import maxmind, { type AsnResponse, type CityResponse, type Reader } from "maxmind";
import * as UAParser from "ua-parser-js";
import type { visitorLogs } from "@/lib/db/schema";

type GlobioResponse = CityResponse &
  Partial<AsnResponse> & {
    anonymous_ip?: {
      is_anonymous?: boolean;
      is_anonymous_vpn?: boolean;
      is_hosting_provider?: boolean;
      is_public_proxy?: boolean;
      is_tor_exit_node?: boolean;
    };
    has_anonymous_ip?: boolean;
    rir?: string;
  };

type VisitorInsert = typeof visitorLogs.$inferInsert;

const databasePath = process.env.MAXMIND_DB_PATH ?? path.join(process.cwd(), "data", "ip66.mmdb");

let readerPromise: Promise<Reader<GlobioResponse>> | null = null;

function getReader() {
  readerPromise ??= maxmind.open<GlobioResponse>(databasePath, {
    cache: { max: 10000 },
    watchForUpdates: true,
    watchForUpdatesNonPersistent: true,
  });
  return readerPromise;
}

function cleanJson(value: unknown) {
  return value == null ? null : JSON.parse(JSON.stringify(value));
}

function firstHeaderIp(value: string | null) {
  return value?.split(",")[0]?.trim() ?? "";
}

function normalizeIp(ip: string) {
  const trimmed = ip.trim();
  const withoutPort = trimmed.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/)?.[1] ?? trimmed;
  return withoutPort.startsWith("::ffff:") ? withoutPort.slice(7) : withoutPort;
}

function getClientIp(headers: Headers) {
  return normalizeIp(
    firstHeaderIp(headers.get("cf-connecting-ip")) ||
      firstHeaderIp(headers.get("x-real-ip")) ||
      firstHeaderIp(headers.get("x-forwarded-for")) ||
      "",
  );
}

function isPrivateIp(ip: string) {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "localhost") return true;
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length === 4 && parts.every(Number.isInteger)) {
    return (
      parts[0] === 10 ||
      parts[0] === 127 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      (parts[0] === 169 && parts[1] === 254)
    );
  }
  const lower = ip.toLowerCase();
  return lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80:");
}

async function lookupGeo(ip: string) {
  if (!ip || isPrivateIp(ip) || !maxmind.validate(ip)) return null;

  try {
    const reader = await getReader();
    return reader.get(ip);
  } catch {
    return null;
  }
}

export async function getVisitorInfo(headers: Headers, pathName: string): Promise<VisitorInsert> {
  const ip = getClientIp(headers);
  const userAgent = headers.get("user-agent") ?? "";
  const acceptLanguage = headers.get("accept-language") ?? "";
  const referer = headers.get("referer") ?? "";
  const parsedUserAgent = UAParser.UAParser(userAgent);
  const geo = await lookupGeo(ip);
  const subdivision = geo?.subdivisions?.[0];
  const anonymousIp = geo?.anonymous_ip;
  const traits = geo?.traits;

  return {
    ip,
    path: pathName,
    referer,
    countryCode: geo?.country?.iso_code ?? geo?.registered_country?.iso_code ?? "",
    countryName: geo?.country?.names?.en ?? geo?.registered_country?.names?.en ?? "",
    continentCode: geo?.continent?.code ?? "",
    continentName: geo?.continent?.names?.en ?? "",
    registeredCountryCode: geo?.registered_country?.iso_code ?? "",
    registeredCountryName: geo?.registered_country?.names?.en ?? "",
    cityName: "city" in (geo ?? {}) ? geo?.city?.names?.en ?? "" : "",
    regionName: subdivision?.names?.en ?? "",
    timeZone: "location" in (geo ?? {}) ? geo?.location?.time_zone ?? "" : "",
    latitude: "location" in (geo ?? {}) ? geo?.location?.latitude ?? null : null,
    longitude: "location" in (geo ?? {}) ? geo?.location?.longitude ?? null : null,
    autonomousSystemNumber: geo?.autonomous_system_number ?? traits?.autonomous_system_number ?? null,
    autonomousSystemOrganization:
      geo?.autonomous_system_organization ?? traits?.autonomous_system_organization ?? "",
    rir: geo?.rir ?? "",
    isAnonymous: Boolean(anonymousIp?.is_anonymous ?? traits?.is_anonymous),
    isAnonymousVpn: Boolean(anonymousIp?.is_anonymous_vpn ?? traits?.is_anonymous_vpn),
    isHostingProvider: Boolean(anonymousIp?.is_hosting_provider ?? traits?.is_hosting_provider),
    isPublicProxy: Boolean(anonymousIp?.is_public_proxy ?? traits?.is_public_proxy),
    isTorExitNode: Boolean(anonymousIp?.is_tor_exit_node ?? traits?.is_tor_exit_node),
    browserName: parsedUserAgent.browser.name ?? "",
    browserVersion: parsedUserAgent.browser.version ?? "",
    osName: parsedUserAgent.os.name ?? "",
    osVersion: parsedUserAgent.os.version ?? "",
    deviceType: parsedUserAgent.device.type ?? "desktop",
    deviceVendor: parsedUserAgent.device.vendor ?? "",
    deviceModel: parsedUserAgent.device.model ?? "",
    engineName: parsedUserAgent.engine.name ?? "",
    engineVersion: parsedUserAgent.engine.version ?? "",
    cpuArchitecture: parsedUserAgent.cpu.architecture ?? "",
    userAgent,
    acceptLanguage,
    geoRaw: cleanJson(geo),
    userAgentRaw: cleanJson(parsedUserAgent),
  };
}

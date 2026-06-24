import { cache } from "react";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, localeStorageKey } from "@/lib/i18n";

export const getRequestLocale = cache(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get(localeStorageKey)?.value ?? null;
  return isLocale(locale) ? locale : defaultLocale;
});

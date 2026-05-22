"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function VisitorTracker() {
  const pathname = usePathname();
  const trackedPaths = useRef(new Set<string>());

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const path = `${window.location.pathname}${window.location.search}`;
    if (trackedPaths.current.has(path)) return;
    trackedPaths.current.add(path);

    void fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}

import { NextRequest, NextResponse } from "next/server";

const HEADLESS_BROWSER_PATTERNS = [
  /\bHeadlessChrome\b/i,
  /\bHeadlessFirefox\b/i,
  /\bPhantomJS\b/i,
  /\bSlimerJS\b/i,
  /\bHtmlUnit\b/i,
  /\bPlaywright\b/i,
  /\bPuppeteer\b/i,
  /\bSelenium\b/i,
];

function isHeadlessBrowserRequest(req: NextRequest) {
  const headerValues = [
    req.headers.get("user-agent"),
    req.headers.get("sec-ch-ua"),
    req.headers.get("sec-ch-ua-full-version-list"),
    req.headers.get("x-playwright"),
    req.headers.get("x-puppeteer"),
    req.headers.get("x-selenium"),
  ].filter((value): value is string => Boolean(value));

  return headerValues.some((value) =>
    HEADLESS_BROWSER_PATTERNS.some((pattern) => pattern.test(value)),
  );
}

export function proxy(req: NextRequest) {
  if (isHeadlessBrowserRequest(req)) {
    return new NextResponse("Forbidden", {
      status: 403,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
      },
    });
  }

  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const session = req.cookies.get("admin_session");
    if (!session || session.value !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/webpack-hmr|favicon.ico).*)"],
};

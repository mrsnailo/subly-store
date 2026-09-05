import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  const isAppDomain = (host: string) => {
    return host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host === "subly.store";
  };

  let storeSlug = "";

  if (!isAppDomain(hostname)) {
    storeSlug = hostname.split(".")[0];
  } else {
    const p1 = url.pathname.split("/")[1];
    if (p1 && !["api", "_next", "create", "favicon.ico", "sitemap.xml", "robots.txt", "admin"].includes(p1)) {
      storeSlug = p1;
    }
  }

  // If we are on app domain, missing store slug in path, but hit /admin or similar
  // check if we have a cookie from previous visit
  if (isAppDomain(hostname) && !storeSlug && url.pathname.startsWith("/admin")) {
    const cookieSlug = req.cookies.get("store_slug")?.value;
    if (cookieSlug) {
      return NextResponse.redirect(new URL(`/${cookieSlug}${url.pathname}${url.search}`, req.url));
    }
  }

  const requestHeaders = new Headers(req.headers);
  if (storeSlug) {
    requestHeaders.set("x-store-slug", storeSlug);
  }

  const response = (storeSlug && !isAppDomain(hostname))
    ? NextResponse.rewrite(new URL(`/${storeSlug}${url.pathname}${url.search}`, req.url), {
        request: { headers: requestHeaders },
      })
    : NextResponse.next({
        request: { headers: requestHeaders },
      });

  if (storeSlug && isAppDomain(hostname)) {
    // Save cookie to remember path-based tenant
    response.cookies.set("store_slug", storeSlug, { path: "/", maxAge: 60 * 60 * 24 * 7 });
  }

  return response;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
};

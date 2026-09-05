import "@/lib/env";
import type { NextAuthConfig } from "next-auth";

function getStoreSlugAndPath(nextUrl: URL, host: string) {
  const isAppDomain = host.startsWith("localhost:") || host.startsWith("127.0.0.1:") || host === "subly.store";
  
  if (!isAppDomain) {
    const slug = host.split(".")[0];
    return { storeSlug: slug, mappedPath: nextUrl.pathname };
  } else {
    const p1 = nextUrl.pathname.split("/")[1];
    if (p1 && !["api", "_next", "create", "favicon.ico"].includes(p1)) {
      let mappedPath = nextUrl.pathname.substring(p1.length + 1);
      if (!mappedPath.startsWith("/")) mappedPath = "/" + mappedPath;
      return { storeSlug: p1, mappedPath };
    }
  }
  return { storeSlug: null, mappedPath: nextUrl.pathname };
}

export const authConfig: NextAuthConfig = {
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;
      const host = request.headers.get("host") || "";
      const { storeSlug, mappedPath } = getStoreSlugAndPath(nextUrl, host);

      const isLoggedIn = !!auth?.user;
      const isOnAdmin = mappedPath.startsWith("/admin");
      const isOnLogin = mappedPath === "/admin/login";

      if (isOnLogin) {
        if (isLoggedIn) {
          const dash = nextUrl.clone();
          if (storeSlug && nextUrl.pathname.startsWith(`/${storeSlug}`)) {
            dash.pathname = `/${storeSlug}/admin`;
          } else {
            dash.pathname = `/admin`;
          }
          return Response.redirect(dash);
        }
        return true;
      }
      
      if (isOnAdmin) {
        if (!isLoggedIn) {
          const loginUrl = nextUrl.clone();
          if (storeSlug && nextUrl.pathname.startsWith(`/${storeSlug}`)) {
            loginUrl.pathname = `/${storeSlug}/admin/login`;
          } else {
            loginUrl.pathname = "/admin/login";
          }
          loginUrl.searchParams.set("callbackUrl", nextUrl.href);
          return Response.redirect(loginUrl);
        }
        return true;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.storeId = (user as any).storeId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        (session.user as any).storeId = token.storeId;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import authConfig from "@/auth.config";
import { publicRoutes, apiAuthPrefix, authRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

// Helper to normalize domain names
const normalizeDomain = (domain: string) => {
  return domain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
};

// Helper to check static files
const isStaticPath = (pathname: string) => {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.match(/\.(.*)$/)
  );
};

export default auth(async (req) => {
  const { nextUrl } = req;
  const hostname = req.headers.get("host") || "";

  // Skip middleware for static files
  if (isStaticPath(nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Environment Detection
  const isProduction = process.env.NODE_ENV === "production";
  const isVercelPreview = hostname.endsWith(".vercel.app");

  // Normalize domains
  const mainDomain = normalizeDomain(
    isProduction
      ? process.env.NEXT_PUBLIC_APP_URL || ""
      : process.env.VERCEL_URL || "localhost:3000"
  );

  const normalizedHostname = normalizeDomain(hostname);

  console.log({
    hostname: normalizedHostname,
    mainDomain,
    isProduction,
    isVercelPreview,
    path: nextUrl.pathname,
  });

  // Handle custom domains
  if (normalizedHostname !== mainDomain) {
    const currentPath = nextUrl.pathname;

    // Prevent rewrite loops
    if (!currentPath.startsWith(`/${normalizedHostname}`)) {
      console.log(
        `🔄 Rewriting to custom domain path: /${normalizedHostname}${currentPath}`
      );

      // Create new URL for rewrite
      const rewriteUrl = new URL(
        `/${normalizedHostname}${currentPath}`,
        req.url
      );

      // Preserve query parameters
      rewriteUrl.search = nextUrl.search;

      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // Auth logic only for main domain
  if (normalizedHostname === mainDomain) {
    const isLoggedIn = !!req.auth;
    const secret = process.env.AUTH_SECRET!;
    const token = await getToken({ req, secret, secureCookie: false });
    const role = token?.role as "ADMIN" | "USER" | "CUSTOMER" | undefined;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname);

    // API routes bypass
    if (isApiAuthRoute) return undefined;

    // Registration redirect
    if (isLoggedIn && !role && nextUrl.pathname !== "/auth/register") {
      return NextResponse.redirect(new URL("/auth/register", nextUrl));
    }

    // Role-based routing
    if (isLoggedIn) {
      const isUserRoute = nextUrl.pathname.startsWith("/dashboard");
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (role === "USER" && !isUserRoute && !isPublicRoute) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }

      if (role === "ADMIN" && !isAdminRoute && !isPublicRoute) {
        return NextResponse.redirect(new URL("/admin", nextUrl));
      }
    }

    // Auth routes handling
    if (isAuthRoute) {
      if (isLoggedIn) {
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
      }
      return undefined;
    }

    // Protected routes
    if (!isLoggedIn && !isPublicRoute) {
      const callbackUrl = nextUrl.pathname + nextUrl.search;
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);

      return NextResponse.redirect(
        new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      );
    }
  }

  return undefined;
});

export const config = {
  matcher: [
    // Skip public files and API routes
    "/((?!api|trpc|_next|public|static|favicon.ico).*)",
  ],
};

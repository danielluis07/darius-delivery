import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { apiAuthPrefix } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;

  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";
  const isMaintenancePage = nextUrl.pathname === "/maintenance";

  if (
    isMaintenanceMode &&
    !isMaintenancePage &&
    !nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.rewrite(new URL("/maintenance", req.url));
  }

  const isLoggedIn = !!req.auth;

  const secret = process.env.AUTH_SECRET!;

  const isProd = process.env.NODE_ENV === "production";

  const token = await getToken({
    req,
    secret,
    secureCookie: isProd,
  });

  const role = token?.role as string;

  const isSubscribed = token?.isSubscribed as boolean;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isWebhookRoute = nextUrl.pathname.includes("/api/webhook/asaas");

  // Get domain from request
  const hostname = req.headers.get("host");
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ""
  );

  if (!hostname) {
    return NextResponse.next();
  }

  // Skip middleware for webhook routes
  if (isWebhookRoute) {
    return NextResponse.next(); // Let the request pass through unchanged
  }

  // Protect dashboard and admin routes on the main domain
  if (
    hostname === mainDomain &&
    (nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/admin"))
  ) {
    if (!isLoggedIn) {
      let callbackUrl = nextUrl.pathname;
      if (nextUrl.search) {
        callbackUrl += nextUrl.search;
      }
      const encodedCallbackUrl = encodeURIComponent(callbackUrl);
      return NextResponse.redirect(
        new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
      );
    }

    if (!isSubscribed && role !== "EMPLOYEE") {
      return NextResponse.redirect(new URL("/subscription", nextUrl));
    }

    return NextResponse.next();
  }

  // Rewrite only for custom domains (excluding main domain)
  if (hostname !== mainDomain) {
    const domain = hostname.replace(/^www\./, "");
    if (!nextUrl.pathname.startsWith(`/${domain}`)) {
      nextUrl.pathname = `/${domain}`;
      return NextResponse.rewrite(nextUrl);
    }
  }

  if (isApiAuthRoute) {
    return undefined;
  }

  return NextResponse.next(); // Default case: let the request proceed
});

// Ensure Middleware does not interfere with static assets or API requests
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

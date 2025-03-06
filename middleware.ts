import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { NextResponse } from "next/server";
import { apiAuthPrefix } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isWebhookRoute = nextUrl.pathname === "/api/webhook/asaas";

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

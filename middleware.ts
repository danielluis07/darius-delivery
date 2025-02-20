import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { publicRoutes, apiAuthPrefix, authRoutes } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const secret = process.env.AUTH_SECRET!;
  const token = await getToken({ req, secret, secureCookie: false });

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  const role = token?.role as "ADMIN" | "USER" | undefined;

  // Get domain from request
  const hostname = req.headers.get("host");
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ""
  );

  console.log("Hostname: ", hostname);
  console.log("Main Domain: ", mainDomain);

  if (!hostname) {
    return NextResponse.next();
  }

  // Exclude dashboard, admin, and auth routes from rewrite
  if (hostname === mainDomain) {
    if (
      nextUrl.pathname.startsWith("/dashboard") ||
      nextUrl.pathname.startsWith("/admin") ||
      nextUrl.pathname.startsWith("/auth")
    ) {
      return NextResponse.next();
    }
  }

  // Rewrite only for custom domains (excluding main domain)
  if (hostname !== mainDomain) {
    const domain = hostname.replace(/^www\./, "");
    if (!nextUrl.pathname.startsWith(`/${domain}`)) {
      nextUrl.pathname = `/${domain}`;
      return NextResponse.rewrite(nextUrl);
    }
  }

  // Existing authentication checks
  if (isApiAuthRoute) {
    return undefined;
  }

  if (isLoggedIn && !role && nextUrl.pathname !== "/auth/register") {
    return NextResponse.redirect(new URL("/auth/register", nextUrl));
  }

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

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return NextResponse.redirect(
      new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }
});

// Ensure Middleware does not interfere with static assets or API requests
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

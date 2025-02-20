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

  // Extract hostname from request
  const hostname = req.headers.get("host");
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ""
  );

  if (!hostname) {
    return NextResponse.next();
  }

  console.log("Hostname:", hostname);
  console.log("Main Domain:", mainDomain);

  // Handle custom domain redirection
  if (hostname !== mainDomain) {
    console.log("Redirecting dynamic route");
    const domain = hostname.replace(/^www\./, ""); // Remove 'www.' if present
    nextUrl.pathname = `/${domain}`; // Redirect to dynamic route
    return NextResponse.rewrite(nextUrl);
  }

  // Existing API Auth Route Check
  if (isApiAuthRoute) {
    return undefined;
  }

  // Redirect to /auth/register if role is not set
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

// Apply Middleware to all routes except static assets and API requests
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

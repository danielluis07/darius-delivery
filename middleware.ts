import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import authConfig from "@/auth.config";
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
  const role = token?.role as "ADMIN" | "USER" | "CUSTOMER" | undefined;

  // 🔹 Get Hostname (Domain)
  const hostname = req.headers.get("host") || "";

  // 🔹 Dynamically Detect Main Domain (Production, Preview, or Local)
  const mainDomain =
    process.env.NODE_ENV === "production"
      ? "yourapp.com" // Your actual production domain
      : process.env.VERCEL_URL || "localhost:3000"; // Preview URL or local dev

  console.log("Detected Hostname:", hostname);
  console.log("Main Domain:", mainDomain);

  // 🔹 Handle Custom Domains (Avoid Infinite Loop)
  if (hostname !== mainDomain) {
    const currentPath = nextUrl.pathname;

    // Prevent loop by checking if already rewritten
    if (!currentPath.startsWith(`/${hostname}`)) {
      console.log("🔄 Redirecting custom domain:", hostname);
      return NextResponse.rewrite(
        new URL(`/${hostname}${currentPath}`, req.url)
      );
    }
  }

  // 🔹 Normal Authentication Logic (Only for Main Domain)
  if (isApiAuthRoute) return undefined;

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

// Optionally, don't invoke Middleware on some paths
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

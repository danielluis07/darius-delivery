import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { apiAuthPrefix } from "@/routes";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  const { nextUrl } = req;
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
    // Added safety check for missing hostname
    console.error("Middleware: Hostname is missing");
    return new Response(null, { status: 400 }); // Bad Request
  }

  // Skip middleware for webhook routes
  if (isWebhookRoute) {
    return NextResponse.next();
  }

  // *** MODIFICATION START ***
  // Determine if the request is for the main domain or a Vercel deployment URL
  const isMainDomainOrVercel =
    hostname === mainDomain || hostname.endsWith(".vercel.app");
  // *** MODIFICATION END ***

  // --- Logic for Main Domain and Vercel Deployments ---
  if (
    isMainDomainOrVercel && // Use the new combined check
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

    // Apply subscription check only if user is not an EMPLOYEE
    if (!isSubscribed && role !== "EMPLOYEE") {
      console.log(
        `Redirecting to subscription: user role=${role}, isSubscribed=${isSubscribed}`
      ); // Optional: Debug log
      return NextResponse.redirect(new URL("/subscription", nextUrl));
    }

    // If logged in and authorized (either subscribed or an employee), allow access
    return NextResponse.next();
  }

  // --- Logic for Custom Tenant Domains ---
  // Rewrite only for actual custom domains (i.e., NOT the main domain and NOT Vercel)
  if (!isMainDomainOrVercel) {
    // Use the inverse of the combined check
    const domain = hostname.replace(/^www\./, "");

    // Avoid rewriting if the path already starts with the domain segment
    // or if it's an API route (unless you specifically want to rewrite API routes too)
    if (
      !nextUrl.pathname.startsWith(`/${domain}`) &&
      !nextUrl.pathname.startsWith("/api/")
    ) {
      // Construct the new path, handling the root path case ('/')
      const newPathname = `/${domain}${
        nextUrl.pathname === "/" ? "" : nextUrl.pathname
      }`;
      console.log(
        `Rewriting ${hostname}${req.nextUrl.pathname} to ${newPathname}`
      ); // Optional: Debug log
      nextUrl.pathname = newPathname;
      return NextResponse.rewrite(nextUrl);
    }
  }

  // --- Default Handling ---
  if (isApiAuthRoute) {
    // Let NextAuth.js handle API authentication routes
    return undefined;
  }

  // Allow other requests (e.g., static files, public pages on main/Vercel domain)
  return NextResponse.next();
});

// Ensure Middleware does not interfere with static assets or API requests
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[\\w]+$).*)"],
};

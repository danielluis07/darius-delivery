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

  // Captura o domínio acessado
  const hostname = req.headers.get("host") || "";
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ""
  ); // Remove "https://"
  const isCustomDomain = hostname !== mainDomain;
  console.log("Domínio acessado:", hostname);
  console.log("Domínio principal:", mainDomain);
  console.log("É domínio personalizado?", isCustomDomain);

  if (isCustomDomain) {
    const currentPath = nextUrl.pathname;

    if (currentPath.startsWith(`/${hostname}`)) {
      return NextResponse.next();
    }

    console.log("🔄 Redirecionando domínio personalizado:", hostname);
    return NextResponse.rewrite(new URL(`/${hostname}`, nextUrl));
  }

  // Lógica de autenticação normal (somente para o domínio principal)
  if (isApiAuthRoute) {
    return undefined;
  }

  if (isLoggedIn && !role && nextUrl.pathname !== "/auth/register") {
    return Response.redirect(new URL("/auth/register", nextUrl));
  }

  if (isLoggedIn) {
    const isUserRoute = nextUrl.pathname.startsWith("/dashboard");
    const isAdminRoute = nextUrl.pathname.startsWith("/admin");

    if (role === "USER" && !isUserRoute && !isPublicRoute) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }

    if (role === "ADMIN" && !isAdminRoute && !isPublicRoute) {
      return Response.redirect(new URL("/admin", nextUrl));
    }
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return undefined;
  }

  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/auth/sign-in?callbackUrl=${encodedCallbackUrl}`, nextUrl)
    );
  }
});

// 🔹 Aplica o middleware para todas as rotas
export const config = {
  matcher: "/:path*",
};

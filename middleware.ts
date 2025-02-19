import { NextResponse } from "next/server";
import NextAuth from "next-auth";
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

  // Detecta o domínio ou subdomínio
  const hostname = req.headers.get("host") || "";
  console.log("Hostname:", hostname);
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(
    /^https?:\/\//,
    ""
  ); // Remove "https://" para comparação correta
  console.log("Main Domain:", mainDomain);
  const isCustomDomain = hostname !== mainDomain;
  console.log("Is Custom Domain:", isCustomDomain);

  if (isApiAuthRoute) {
    return undefined;
  }

  // SE O DOMÍNIO FOR PERSONALIZADO, REDIRECIONA PARA A ROTA DINÂMICA
  if (isCustomDomain) {
    const customDomain = hostname.replace(/^www\./, ""); // Remove "www." se existir
    return NextResponse.rewrite(new URL(`/${customDomain}`, nextUrl));
  }

  // Gerenciamento de Autenticação para Admin/Dashboard
  const role = token?.role as "ADMIN" | "USER" | "CUSTOMER" | undefined;

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

// Middleware aplicado a todas as rotas, exceto arquivos estáticos e APIs
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

/**
 * Rotas acessíveis ao público
 * Essas rotas não requerem autenticação
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification", "/api", "/test"];

/**
 * Verifica se uma rota é um subdomínio de restaurante e, portanto, pública
 */
export function isPublicSubdomain(hostname: string): boolean {
  const baseDomain = "seusite.com"; // Alterar para o seu domínio real
  const subdomain = hostname.split(".")[0];

  return subdomain !== "www" && subdomain !== baseDomain;
}

/**
 * Rotas usadas para autenticação
 * Essas rotas redirecionam usuários logados para /dashboard
 * @type {string[]}
 */
export const authRoutes = [
  "/auth/sign-in",
  "/auth/sign-up",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password",
];

/**
 * Prefixo para rotas de API de autenticação
 * @type {string}
 */
export const apiAuthPrefix = "/api";

/**
 * Caminho padrão de redirecionamento após login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/";

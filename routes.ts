/**
 * Rotas acessíveis ao público
 * Essas rotas não requerem autenticação
 * @type {string[]}
 */
export const publicRoutes = ["/", "/auth/new-verification", "/api", "/test"];

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

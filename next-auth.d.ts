import NextAuth, { type DefaultSession } from "next-auth";

type ExtendedUser = DefaultSession["user"] & {
  isTwoFactorEnabled: boolean;
  isOAuth: boolean;
  role: "ADMIN" | "USER";
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

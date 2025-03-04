import NextAuth from "next-auth";
import { db } from "@/db/drizzle";
import authConfig from "@/auth.config";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { users, account, customers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/auth/sign-in",
    signOut: "/",
    newUser: "/auth/register",
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      if (!user.id) {
        throw new Error("User ID is undefined");
      }

      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.id, user.id));
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user || !user.id) {
        return false;
      }

      const [existingUser] = await db
        .select({ isActive: users.isActive })
        .from(users)
        .where(eq(users.id, user.id));

      if (existingUser.isActive === false) {
        return "/auth/error?error=BlockedUser";
      }

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        session.user.image = token.image as string;
        session.user.role = token.role as "ADMIN" | "USER" | "CUSTOMER";
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.isOAuth = token.isOAuth as boolean;
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean;

        // Apenas adiciona o asaasCustomerId se existir no token
        if (token.asaasCustomerId) {
          session.user.asaasCustomerId = token.asaasCustomerId as string;
        }
      }

      return session;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, token.sub));

      if (!existingUser) return token;

      const [existingAccount] = await db
        .select()
        .from(account)
        .where(eq(account.userId, token.sub));

      token.role = existingUser.role || null;
      token.isOAuth = !!existingAccount;
      token.name = existingUser.name;
      token.email = existingUser.email;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.image = existingUser.image;

      // Se o usuário for CUSTOMER, buscar o asaas_customer_id
      if (existingUser.role === "CUSTOMER") {
        const [customer] = await db
          .select({ asaasCustomerId: customers.asaasCustomerId })
          .from(customers)
          .where(eq(customers.userId, token.sub));

        token.asaasCustomerId = customer?.asaasCustomerId || null;
      }

      return token;
    },
  },
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

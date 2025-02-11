import type { NextAuthConfig } from "next-auth";
import { baseUserSchema } from "@/db/schemas";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to hash a password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hashBuffer).toString("hex");
}

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = baseUserSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          if (!email || !password) return null;

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email));

          if (!user || !user.password) return null;

          // Hash the input password to compare with the stored hash
          const hashedInputPassword = await hashPassword(password);

          if (hashedInputPassword === user.password) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            };
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

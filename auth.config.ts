import type { NextAuthConfig } from "next-auth";
import { baseUserSchema } from "@/db/schemas";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch)
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              image: user.image,
            };
        }

        return null;
      },
    }),
  ], // Add providers with an empty array for now
} satisfies NextAuthConfig;

import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUserByDomain = async (
  subdomain: string
): Promise<typeof users.$inferSelect | null> => {
  try {
    const [data] = await db
      .select()
      .from(users)
      .where(eq(users.subdomain, subdomain));

    return data ?? null; // Ensures null is returned if no user is found
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

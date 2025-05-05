import { db } from "@/db/drizzle";
import { stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getStores = async (userId: string) => {
  const data = await db
    .select({
      id: stores.id,
      userId: stores.userId,
      name: stores.name,
    })
    .from(stores)
    .where(eq(stores.userId, userId));

  if (!data) {
    return { error: "No stores found" };
  }

  return { data };
};

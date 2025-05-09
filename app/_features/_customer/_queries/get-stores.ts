import { db } from "@/db/drizzle";
import { customizations, stores, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getStores = async (domain: string) => {
  try {
    const data = await db
      .select({
        id: stores.id,
        name: stores.name,
      })
      .from(stores)
      .innerJoin(users, eq(stores.userId, users.id))
      .innerJoin(customizations, eq(stores.id, customizations.storeId))
      .where(eq(users.domain, domain));

    return data;
  } catch (error) {
    console.error("Error fetching stores:", error);
    return null;
  }
};

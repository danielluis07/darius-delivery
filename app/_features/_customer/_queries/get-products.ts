import { db } from "@/db/drizzle";
import { users, products, stores } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getProductsByDomain = async (
  domain: string
): Promise<typeof products.$inferSelect | null> => {
  try {
    const [data] = await db
      .select({
        products: products,
      })
      .from(users)
      .innerJoin(stores, eq(users.id, stores.userId))
      .innerJoin(products, eq(stores.id, products.storeId))
      .where(eq(users.domain, domain));

    return data?.products ?? null;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};

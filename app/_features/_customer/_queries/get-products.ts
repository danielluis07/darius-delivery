import { db } from "@/db/drizzle";
import { users, products } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getProductsByDomain = async (
  subdomain: string
): Promise<typeof products.$inferSelect | null> => {
  try {
    const [data] = await db
      .select({
        products: products,
      })
      .from(users)
      .innerJoin(products, eq(users.id, products.userId))
      .where(eq(users.subdomain, subdomain));

    return data?.products ?? null;
  } catch (error) {
    console.error("Error fetching products:", error);
    return null;
  }
};

import { db } from "@/db/drizzle";
import { employees, stores, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUser = async (userId: string, storeId: string) => {
  const [data] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      role: users.role,
      subscription: subscriptions,
      employee: employees,
    })
    .from(users)
    .leftJoin(stores, eq(stores.id, storeId))
    .leftJoin(subscriptions, eq(subscriptions.storeId, stores.id))
    .leftJoin(employees, eq(employees.storeId, storeId))
    .where(eq(users.id, userId));

  if (!data) {
    return { error: "User not found" };
  }

  return { data };
};

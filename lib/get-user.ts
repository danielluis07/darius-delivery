import { db } from "@/db/drizzle";
import { employees, subscriptions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getUser = async (userId: string) => {
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
    .leftJoin(subscriptions, eq(users.id, subscriptions.user_id))
    .leftJoin(employees, eq(users.id, employees.userId))
    .where(eq(users.id, userId));

  if (!data) {
    return { error: "User not found" };
  }

  return { data };
};

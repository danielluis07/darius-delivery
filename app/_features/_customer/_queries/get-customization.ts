import { db } from "@/db/drizzle";
import { users, customizations, templates, orderSettings } from "@/db/schema";
import { CustomizationWithTemplate } from "@/types";
import { eq } from "drizzle-orm";

export const getCustomizationByDomain = async (
  domain: string
): Promise<CustomizationWithTemplate | null> => {
  try {
    const [data] = await db
      .select({
        customization: customizations,
        templateName: templates.name,
        orderSettings: {
          delivery_deadline: orderSettings.delivery_deadline,
          pickup_deadline: orderSettings.pickup_deadline,
        },
        apiKey: users.asaasApiKey,
        userId: users.id,
        walletId: users.walletId,
      })
      .from(users)
      .innerJoin(customizations, eq(users.id, customizations.user_id))
      .innerJoin(templates, eq(customizations.template_id, templates.id))
      .innerJoin(orderSettings, eq(users.id, orderSettings.user_id))
      .where(eq(users.domain, domain));

    // @ts-expect-error - open_hours is an array of objects
    return data ?? null;
  } catch (error) {
    console.error("Error fetching customization:", error);
    return null;
  }
};

"use server";

import { db } from "@/db/drizzle";
import {
  users,
  customizations,
  templates,
  orderSettings,
  colors,
  stores,
} from "@/db/schema";
import { CustomizationWithTemplate } from "@/types";
import { eq } from "drizzle-orm";

export const getCustomizationByStoreId = async (
  domain: string
): Promise<CustomizationWithTemplate | null> => {
  try {
    const [data] = await db
      .select({
        storeId: stores.id,
        customization: customizations,
        templateName: templates.name,
        orderSettings: {
          delivery_deadline: orderSettings.delivery_deadline,
          pickup_deadline: orderSettings.pickup_deadline,
        },
        apiKey: users.asaasApiKey,
        userId: users.id,
        walletId: users.walletId,
        googleApiKey: stores.googleApiKey,
        colors: colors,
      })
      .from(users)
      .innerJoin(stores, eq(users.id, stores.userId))
      .innerJoin(customizations, eq(users.id, customizations.userId))
      .innerJoin(templates, eq(customizations.template_id, templates.id))
      .innerJoin(orderSettings, eq(stores.id, orderSettings.storeId))
      .leftJoin(colors, eq(users.id, colors.userId))
      .where(eq(users.domain, domain));

    // @ts-expect-error - open_hours is an array of objects
    return data ?? null;
  } catch (error) {
    console.error("Error fetching customization:", error);
    return null;
  }
};

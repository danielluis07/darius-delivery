import { db } from "@/db/drizzle";
import { users, customizations, templates } from "@/db/schema";
import { CustomizationWithTemplate } from "@/types";
import { eq } from "drizzle-orm";

export const getCustomizationByDomain = async (
  subdomain: string
): Promise<CustomizationWithTemplate | null> => {
  try {
    const [data] = await db
      .select({
        customization: customizations,
        templateName: templates.name,
        userId: users.id,
      })
      .from(users)
      .innerJoin(customizations, eq(users.id, customizations.user_id))
      .innerJoin(templates, eq(customizations.template_id, templates.id))
      .where(eq(users.subdomain, subdomain));

    return data ?? null;
  } catch (error) {
    console.error("Error fetching customization:", error);
    return null;
  }
};

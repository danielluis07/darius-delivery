import { customizations, products } from "@/db/schema";

export type CustomizationWithTemplate = {
  customization: typeof customizations.$inferSelect;
  templateName: string;
  userId: string;
};

export type Product = typeof products.$inferSelect;

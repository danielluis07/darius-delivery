import { customizations, products } from "@/db/schema";

export type CustomizationWithTemplate = {
  customization: typeof customizations.$inferSelect;
  templateName: string;
  userId: string;
};

export type CartItem = {
  id: string;
  name: string;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  userId: string | null;
  price: number;
  description: string | null;
  category_id: string | null;
  quantity: number;
};

export type OrderData = {
  items: CartItem[];
  totalPrice: number;
  customerId: string;
  restaurantOwnerId: string;
};

export type Product = typeof products.$inferSelect;

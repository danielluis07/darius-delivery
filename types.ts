import { customizations, orderSettings, products } from "@/db/schema";

export type CustomizationWithTemplate = {
  customization: typeof customizations.$inferSelect & {
    opening_hours: { day: string; open: string; close: string }[];
  };
  orderSettings: typeof orderSettings.$inferSelect;
  templateName: string;
  apiKey: string;
  userId: string;
};

export type CartItem = {
  id: string;
  name: string;
  image: string | null;
  createdAt: string | Date | null;
  updatedAt: string | Date | null;
  userId: string | null;
  price: number;
  description: string | null;
  category_id: string | null;
  quantity: number;
};

export type CashOnDeliveryOrderData = {
  items: CartItem[];
  totalPrice: number;
  customerId: string;
  restaurantOwnerId: string;
  paymentMethod: "CASH" | "CARD";
};

export type CashOnWebsiteOrderData = {
  items: CartItem[];
  totalPrice: number;
  customerId: string;
  restaurantOwnerId: string;
  asaasCustomerId: string | undefined;
  paymentMethod: "CREDIT_CARD" | "PIX";
};

export type AsaasPayment = {
  customer: string;
  billingType: "PIX" | "CREDIT_CARD" | "BOLETO";
  value: number;
  externalReference: string;
  creditCard:
    | {
        holderName: string;
        number: string;
        expiryMonth: string;
        expiryYear: string;
        ccv: string;
      }
    | undefined;
};

export type PaymentBody = {
  customer: string;
  billingType: string;
  value: number;
  dueDate: string;
  externalReference?: string;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
};

export type Product = typeof products.$inferSelect;

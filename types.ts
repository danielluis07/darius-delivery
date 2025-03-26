import { customizations, orderSettings, products } from "@/db/schema";
import { AuthUser } from "@hono/auth-js";

export type ExtendedAuthUser = AuthUser & {
  token?: AuthUser["token"] & {
    sub: string;
    role: "ADMIN" | "EMPLOYEE" | "USER";
    restaurantOwnerId?: string; // Está presente apenas se for EMPLOYEE
  };
};

export type CustomizationWithTemplate = {
  customization: typeof customizations.$inferSelect & {
    opening_hours: { day: string; open: string; close: string }[];
  };
  orderSettings: typeof orderSettings.$inferSelect;
  templateName: string;
  apiKey: string;
  googleApiKey: string;
  userId: string;
  walletId: string;
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
  split: Array<
    | { walletId: string; fixedValue: number }
    | { walletId: string; percentageValue: number }
  >;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
};

export type Product = typeof products.$inferSelect;

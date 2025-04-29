import { colors, customizations, orderSettings } from "@/db/schema";
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
  colors: typeof colors.$inferSelect;
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
  type: string;
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
    | { walletId: string; percentualValue: number }
  >;
  creditCard?: {
    holderName: string;
    number: string;
    expiryMonth: string;
    expiryYear: string;
    ccv: string;
  };
};

export type Product = {
  id: string;
  name: string;
  allowHalfOption: boolean;
  userId: string | null;
  image: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  category_id: string | null | undefined;
  description: string | null;
  type: string;
  price: number;
  sizes: string[] | null;
  additionalGroups: {
    id: string;
    name: string;
    selectionType: "single" | "multiple";
    isRequired: boolean;
    additionals: {
      id: string;
      name: string;
      priceAdjustment: number;
    }[];
  }[];
};

export type Combo = {
  id: string;
  name: string;
  userId: string | null;
  description: string;
  price: number;
  image: string | null;
  type: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export type PendingDocuments = {
  rejectReasons: string;
  data: Array<{
    id: string;
    status: "NOT_SENT" | "PENDING" | "APPROVED" | "REJECTED" | "IGNORED";
    type:
      | "IDENTIFICATION"
      | "SOCIAL_CONTRACT"
      | "ENTREPRENEUR_REQUIREMENT"
      | "MINUTES_OF_ELECTION"
      | "CUSTOM";
    title: string;
    description: string;
    responsible: {
      name: string;
      type: string;
    };
    onboardingUrl: string | null;
    documents: Array<{
      id: string;
      status: "NOT_SENT" | "PENDING" | "APPROVED" | "REJECTED";
    }>;
  }>;
};

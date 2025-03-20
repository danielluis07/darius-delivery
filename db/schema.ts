import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  serial,
  primaryKey,
  real,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

export const role = pgEnum("role", ["ADMIN", "USER", "CUSTOMER", "EMPLOYEE"]);

export const templateName = pgEnum("template_name", [
  "TEMPLATE_1",
  "TEMPLATE_2",
  "TEMPLATE_3",
  "TEMPLATE_4",
]);

export const subscriptionType = pgEnum("subscription_type", [
  "BASIC",
  "PREMIUM",
]);

export const paymentStatus = pgEnum("payment_status", [
  "PENDING",
  "PAID",
  "CANCELLED",
]);

export const orderStatus = pgEnum("order_status", [
  "ACCEPTED",
  "PREPARING",
  "FINISHED",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
]);

export const orderPaymentType = pgEnum("order_payment_type", [
  "CASH",
  "CREDIT_CARD",
  "PIX",
  "CARD",
]);

export const orderType = pgEnum("order_type", ["LOCAL", "WEBSITE", "WHATSAPP"]);

export const transactionType = pgEnum("transaction_type", [
  "PAYMENT",
  "REFUND",
  "FEE",
]);

export const transactionStatus = pgEnum("transaction_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const freeTestStatus = pgEnum("free_test_status", [
  "ACTIVE",
  "INACTIVE",
  "EXPIRED",
  "CONVERTED",
]);

// TABLES

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  name: text("name"),
  password: varchar("password", { length: 255 }),
  image: text("image"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").default(false),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  phone: varchar("phone", { length: 255 }),
  role: role("role"),
  // asaas fields
  cpfCnpj: varchar("cpf_cnpj", { length: 20 }),
  incomeValue: integer("income_value"),
  address: text("address"),
  addressNumber: text("address_number"),
  province: text("province"),
  postalCode: text("postal_code"),
  companyType: text("company_type"),
  walletId: text("wallet_id"),
  asaasApiKey: text("asaas_api_key"),
  userCustomerId: text("user_customer_id"),
  // asaas bank account
  bankCode: varchar("bank_code", { length: 10 }),
  ownerName: varchar("owner_name", { length: 255 }),
  bankAgency: varchar("bank_agency", { length: 10 }),
  bankAccount: varchar("bank_account", { length: 20 }),
  bankAccountDigit: varchar("bank_account_digit", { length: 2 }),
  bankAccountType: text("bank_account_type"),
  pixAddressKey: varchar("pix_address_key", { length: 255 }),
  // asaas credit card
  creditCardholderName: text("credit_card_holder_name"),
  creditCardnumber: text("credit_card_number"),
  creditCardexpiryMonth: text("credit_card_expiry_month"),
  creditCardexpiryYear: text("credit_card_expiry_year"),
  creditCardccv: text("credit_card_ccv"),
  //
  comissionPercentage: decimal("comission_percentage", {
    precision: 5,
    scale: 2,
  }),
  googleApiKey: varchar("google_api_key", { length: 255 }),
  domain: varchar("domain", { length: 255 }).unique(),
  isSubscribed: boolean("is_subscribed").default(false),
  isTrial: boolean("is_trial").default(true),
  isActive: boolean("is_active").default(true),
  trialEndsAt: timestamp("trial_ends_at", { mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const account = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const session = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationToken = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

export const twoFactorToken = pgTable("two_factor_token", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const passwordResetToken = pgTable("password_reset_token", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expires: timestamp("expires").notNull(),
});

export const twoFactorConfirmation = pgTable("two_factor_confirmation", {
  id: varchar("id")
    .$defaultFn(() => createId())
    .primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const authenticator = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (t) => [primaryKey({ columns: [t.userId, t.credentialID] })]
);

export const categories = pgTable("categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  image: text("image").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const products = pgTable("products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  category_id: text("category_id").references(() => categories.id, {
    onDelete: "cascade",
  }),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const combos = pgTable("combos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Tabela Intermediária: Relaciona Produtos com Combos (Muitos-para-Muitos)
export const comboProducts = pgTable("combo_products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  combo_id: text("combo_id")
    .notNull()
    .references(() => combos.id, { onDelete: "cascade" }),
  product_id: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
});

export const templates = pgTable("templates", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: templateName("name").notNull(),
  description: text("description"),
  preview_image: text("preview_image"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const customers = pgTable("customers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .unique(), // Ensures each customer has one record in customers
  asaasCustomerId: text("asaas_customer_id"),
  restaurantOwnerId: text("restaurantOwnerId").references(() => users.id, {
    onDelete: "cascade",
  }),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood").notNull(),
  street: text("street").notNull(),
  street_number: text("street_number").notNull(),
  postalCode: text("postal_code").notNull(),
  complement: text("complement"),
});

export const employees = pgTable("employee", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  restaurantOwnerId: text("restaurantOwnerId").references(() => users.id, {
    onDelete: "cascade",
  }),
  permissions: text("permissions").array().default([]),
});

export const deliverers = pgTable("deliverers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  vehicle: varchar("vehicle", { length: 100 }).notNull(),
  vehicle_plate: varchar("vehicle_plate", { length: 7 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const customizations = pgTable("customizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Relacionado com usuário
  template_id: text("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  store_name: text("store_name").notNull(),
  store_phone: varchar("store_phone", { length: 255 }),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood").notNull(),
  street: text("street").notNull(),
  street_number: text("street_number").notNull(),
  postalCode: text("postal_code").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  placeId: text("place_id"),
  isOpen: boolean("is_open").default(false).notNull(),
  payment_methods: text("payment_methods").array().default([]),
  logo: text("logo"),
  banner: text("banner"),
  button_color: varchar("button_color", { length: 7 }), // Hexadecimal (ex: #FFFFFF)
  background_color: varchar("background_color", { length: 7 }),
  header_color: varchar("header_color", { length: 7 }),
  font_color: varchar("font_color", { length: 7 }),
  footer_color: varchar("footer_color", { length: 7 }),
  opening_hours: jsonb("opening_hours").default([]).notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  asaas_sub_id: text("asaas_sub_id"),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Relacionamento com usuários
  plan: subscriptionType("subscription_type"), // Planos de assinatura (ajustável conforme necessidade)
  status: text("status").notNull(), // Status da assinatura
  end_date: timestamp("end_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orders = pgTable("orders", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  delivererId: text("deliverer_id").references(() => deliverers.id, {
    onDelete: "set null",
  }),
  customer_id: text("customer_id").references(() => customers.userId, {
    onDelete: "cascade",
  }),
  number: serial("number").notNull().unique(),
  daily_number: integer("daily_number").notNull(),
  status: orderStatus("status").notNull(),
  type: orderType("type").notNull(),
  total_price: integer("total_price").notNull(),
  obs: text("obs"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  placeId: text("place_id"),
  payment_status: paymentStatus("payment_status").notNull(),
  is_closed: boolean().default(false).notNull(),
  need_change: boolean("need_change").default(false).notNull(),
  change_value: integer("change_value"),
  payment_type: orderPaymentType("payment_type").notNull(),
  delivery_deadline: integer("delivery_deadline"), // Tempo máximo para entrega (em minutos)
  pickup_deadline: integer("pickup_deadline"), // Tempo máximo para retirada (em minutos)
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderSettings = pgTable("order_settings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  delivery_deadline: integer("delivery_deadline").notNull().default(30),
  pickup_deadline: integer("pickup_deadline").notNull().default(15),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const orderItems = pgTable("order_items", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  order_id: text("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  product_id: text("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const transactions = pgTable("transactions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  order_id: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  type: transactionType("type").notNull(),
  amount: integer("amount").notNull(),
  status: transactionStatus("status").notNull(),
  //transaction_reference: text("transaction_reference").unique(), // Payment gateway ID
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const receipts = pgTable("receipts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  order_id: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  receipt_number: serial("receipt_number").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const deliveryAreas = pgTable("delivery_areas", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  city: varchar("city", { length: 255 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 255 }).notNull(),
  delivery_fee: integer("delivery_fee").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryAreasKm = pgTable("delivery_areas_km", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const deliveryAreasKmFees = pgTable("delivery_areas_km_fees", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  deliveryAreaId: text("delivery_area_id").references(
    () => deliveryAreasKm.id,
    { onDelete: "cascade" }
  ),
  distance: real("distance"),
  price: integer("price"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const pixels = pgTable("pixels", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  pixel_facebook: varchar("pixel_facebook", { length: 255 }),
  pixel_google: varchar("pixel_google", { length: 255 }),
  pixel_tiktok: varchar("pixel_tiktok", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  adminId: text("admin_id").references(() => users.id, { onDelete: "cascade" }),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(), // Ex: 10.00 para 10%
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const restaurantData = pgTable("restaurant_data", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  menuViews: integer("menu_views").default(0),
  itemsAddedToCart: integer("items_added_to_cart").default(0),
  itemsPurchased: integer("items_purchased").default(0),
  withdrawals: integer("withdrawals").default(0),
});

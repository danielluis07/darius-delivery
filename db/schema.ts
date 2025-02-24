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
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";
import { createId } from "@paralleldrive/cuid2";

export const role = pgEnum("role", ["ADMIN", "USER", "CUSTOMER"]);

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
]);

export const orderPaymentType = pgEnum("order_payment_type", [
  "CASH",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "PIX",
]);

export const orderType = pgEnum("order_type", ["LOCAL", "WEBSITE", "WHATSAPP"]);

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
  googleApiKey: varchar("google_api_key", { length: 255 }),
  domain: varchar("domain", { length: 255 }).unique(),
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
  restaurantOwnerId: text("restaurantOwnerId").references(() => users.id, {
    onDelete: "cascade",
  }),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood").notNull(),
  street: text("street").notNull(),
  street_number: text("street_number").notNull(),
  complement: text("complement"),
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
  payment_methods: text("payment_methods").array().default([]),
  need_change: boolean("need_change").default(false).notNull(),
  logo: text("logo"),
  banner: text("banner"),
  button_color: varchar("button_color", { length: 7 }), // Hexadecimal (ex: #FFFFFF)
  header_color: varchar("header_color", { length: 7 }),
  footer_color: varchar("footer_color", { length: 7 }),
});

export const subscriptions = pgTable("subscriptions", {
  id: text("id"),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Relacionamento com usuários
  plan: subscriptionType("subscription_type"), // Planos de assinatura (ajustável conforme necessidade)
  status: text("status").notNull(), // Status da assinatura
  start_date: timestamp("start_date", { withTimezone: true }),
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
  status: orderStatus("status").notNull(),
  type: orderType("type").notNull(),
  total_price: integer("total_price").notNull(),
  payment_status: paymentStatus("payment_status").notNull(),
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

export const freeTests = pgTable("free_tests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiration_date: timestamp("expiration_date").notNull(),
});

import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
  primaryKey,
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
  "PREPARING",
  "IN_TRANSIT",
  "DELIVERED",
  "CANCELLED",
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
  subdomain: varchar("subdomain", { length: 255 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
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

/*  */

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

// Tabela de Combos
export const combos = pgTable("combos", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
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
  userId: text("userId").references(() => users.id, { onDelete: "cascade" }),
  city: text("city").notNull(),
  state: text("state").notNull(),
  neighborhood: text("neighborhood").notNull(),
  address: text("street").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const deliverers = pgTable("deliverers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 255 }),
  vehicle: varchar("vehicle", { length: 100 }).notNull(),
  vehicle_plate: varchar("vehicle_plate", { length: 20 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(), // Criação automática
});

// Tabela de Personalização
export const customizations = pgTable("customizations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }), // Relacionado com usuário
  template_id: text("template_id")
    .notNull()
    .references(() => templates.id, { onDelete: "cascade" }),
  store_name: text("store_name").notNull(),
  logo_desktop: text("logo_desktop"),
  logo_mobile: text("logo_mobile"),
  banner: text("banner"),
  button_color: varchar("button_color", { length: 7 }), // Hexadecimal (ex: #FFFFFF)
  header_color: varchar("header_color", { length: 7 }),
  footer_color: varchar("footer_color", { length: 7 }),
  active: boolean("active").default(false).notNull(), // Substitui `tinyint(1)`
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
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  user_id: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  status: orderStatus("status"),
  total_price: text("total_price").notNull(),
  payment_status: paymentStatus("payment_status"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  order_id: text("order_id").references(() => orders.id, {
    onDelete: "cascade",
  }),
  product_id: text("product_id").references(() => products.id, {
    onDelete: "cascade",
  }),
  quantity: text("quantity").notNull(),
  price: text("price").notNull(),
});

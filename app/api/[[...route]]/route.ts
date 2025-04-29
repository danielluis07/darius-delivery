import { Hono } from "hono";
import { handle } from "hono/vercel";
import { initAuthConfig } from "@hono/auth-js";
import users from "@/app/api/[[...route]]/users";
import categories from "@/app/api/[[...route]]/categories";
import products from "@/app/api/[[...route]]/products";
import templates from "@/app/api/[[...route]]/templates";
import customizations from "@/app/api/[[...route]]/customizations";
import orders from "@/app/api/[[...route]]/orders";
import deliveryAreas from "@/app/api/[[...route]]/delivery-areas";
import deliveryAreasKm from "@/app/api/[[...route]]/delivery-areas-km";
import deliverers from "@/app/api/[[...route]]/deliverers";
import customers from "@/app/api/[[...route]]/customers";
import receipts from "@/app/api/[[...route]]/receipts";
import combos from "@/app/api/[[...route]]/combos";
import pixels from "@/app/api/[[...route]]/pixels";
import admin from "@/app/api/[[...route]]/admin";
import orderSettings from "@/app/api/[[...route]]/order-settings";
import webhook from "@/app/api/[[...route]]/webhook";
import finances from "@/app/api/[[...route]]/finances";
import commissions from "@/app/api/[[...route]]/commissions";
import transactions from "@/app/api/[[...route]]/transactions";
import restaurantData from "@/app/api/[[...route]]/restaurant-data";
import subscriptions from "@/app/api/[[...route]]/subscriptions";
import additionals from "@/app/api/[[...route]]/additionals";
import colors from "@/app/api/[[...route]]/colors";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

app.use(
  "*",
  initAuthConfig(() => ({
    secret: process.env.AUTH_SECRET,
    providers: [],
  }))
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/users", users)
  .route("/categories", categories)
  .route("/products", products)
  .route("/templates", templates)
  .route("/customizations", customizations)
  .route("/orders", orders)
  .route("/deliveryareas", deliveryAreas)
  .route("/deliveryareaskm", deliveryAreasKm)
  .route("/deliverers", deliverers)
  .route("/customers", customers)
  .route("/receipts", receipts)
  .route("/combos", combos)
  .route("/pixels", pixels)
  .route("/admin", admin)
  .route("/ordersettings", orderSettings)
  .route("/webhook", webhook)
  .route("/finances", finances)
  .route("/commissions", commissions)
  .route("/transactions", transactions)
  .route("/restaurant-data", restaurantData)
  .route("/subscriptions", subscriptions)
  .route("/additionals", additionals)
  .route("/colors", colors);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

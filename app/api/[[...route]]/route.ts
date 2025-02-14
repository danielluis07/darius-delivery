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
  .route("/deliverers", deliverers);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

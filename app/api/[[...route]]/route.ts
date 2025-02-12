import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/app/api/[[...route]]/users";
import categories from "@/app/api/[[...route]]/categories";
import products from "@/app/api/[[...route]]/products";
import templates from "@/app/api/[[...route]]/templates";
import customizations from "@/app/api/[[...route]]/customizations";
import orders from "@/app/api/[[...route]]/orders";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const routes = app
  .route("/users", users)
  .route("/categories", categories)
  .route("/products", products)
  .route("/templates", templates)
  .route("/customizations", customizations)
  .route("/orders", orders);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

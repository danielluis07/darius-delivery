import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "@/app/api/[[...route]]/users";
import categories from "@/app/api/[[...route]]/categories";
import products from "@/app/api/[[...route]]/products";

export const runtime = "nodejs";

const app = new Hono().basePath("/api");
const routes = app
  .route("/users", users)
  .route("/categories", categories)
  .route("/products", products);

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

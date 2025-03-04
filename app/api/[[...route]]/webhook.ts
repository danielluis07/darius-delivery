import { Hono } from "hono";

const app = new Hono().post("/asaas", async (c) => {
  const body = await c.req.json();

  console.log("Webhook recebido:", body);
});

export default app;

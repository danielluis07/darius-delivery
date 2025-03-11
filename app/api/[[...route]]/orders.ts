import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  orders,
  orderItems,
  products,
  customers,
  users,
  deliverers,
  receipts,
  commissions,
  transactions,
} from "@/db/schema";
import {
  asc,
  eq,
  inArray,
  sql,
  isNull,
  lt,
  and,
  gte,
  lte,
  desc,
  count,
} from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";
import { alias } from "drizzle-orm/pg-core";
import { insertOrderSchema } from "@/db/schemas";
import { createPayment, generatePixQrCode, simulatePayment } from "@/lib/asaas";
import { formatAddress, getGeoCode } from "@/lib/google-geocode";

type Products = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description: string;
  image: string;
};

type OrderItem = {
  id: number;
  productName: string;
  quantity: number;
  price: number;
};

const app = new Hono()
  .get(
    "/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(orders)
        .where(eq(orders.user_id, userId))
        .orderBy(asc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/ordersreceipts/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const customersUser = alias(users, "customersUser");

      const data = await db
        .select({
          order: orders,
          receipt: {
            id: receipts.id,
            number: receipts.receipt_number,
            orderNumber: orders.number,
            createdAt: receipts.createdAt,
            customerName: customersUser.name, // Get the actual customer name
            customerEmail: customersUser.email,
            customerPhone: customersUser.phone,
            customerId: customers.id,
            customerCity: customers.city,
            customerState: customers.state,
            customerNeighborhood: customers.neighborhood,
            customerStreet: customers.street,
            customerStreetNumber: customers.street_number,
            customerComplement: customers.complement,
            orderTotalPrice: orders.total_price,
            orderDailyNumber: orders.daily_number,
            orderPaymentType: orders.payment_type,
            orderPaymentStatus: orders.payment_status,
            orderStatus: orders.status,
            orderItems: sql<OrderItem[]>`json_agg(json_build_object(
                      'id', ${orderItems.id}, 
                      'productName', ${products.name}, 
                      'quantity', ${orderItems.quantity}, 
                      'price', ${orderItems.price}
                  ))`.as("orderItems"),
          },
        })
        .from(orders)
        .leftJoin(receipts, eq(receipts.order_id, orders.id))
        .leftJoin(users, eq(orders.user_id, users.id)) // Ensure correct restaurant owner
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .leftJoin(customersUser, eq(customers.userId, customersUser.id)) // Alias for customer users
        .leftJoin(orderItems, eq(orders.id, orderItems.order_id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .where(and(eq(orders.user_id, userId), eq(orders.is_closed, false)))
        .groupBy(
          orders.id,
          receipts.id,
          receipts.receipt_number,
          receipts.createdAt,
          customers.id,
          customersUser.name,
          customersUser.email,
          customersUser.phone,
          customers.city,
          customers.state,
          customers.neighborhood,
          customers.street,
          customers.street_number,
          customers.complement
        )
        .orderBy(asc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/routing/user/:userId",
    zValidator("param", z.object({ userId: z.string().optional() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      const data = await db
        .select()
        .from(orders)
        .where(and(eq(orders.user_id, userId), isNull(orders.delivererId)))
        .orderBy(asc(orders.createdAt));

      if (!data || data.length === 0) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/:orderId",
    verifyAuth(),
    zValidator("param", z.object({ orderId: z.string().optional() })),
    async (c) => {
      const { orderId } = c.req.valid("param");

      if (!orderId) {
        return c.json({ error: "Missing order id" }, 400);
      }

      const [data] = await db
        .select({
          order: {
            id: orders.id,
            number: orders.number,
            createdAt: orders.createdAt,
            totalPrice: orders.total_price,
            dailyNumber: orders.daily_number,
            status: orders.status,
            payment_status: orders.payment_status,
            type: orders.type,
            delivery_deadline: orders.delivery_deadline,
            pickup_deadline: orders.pickup_deadline,
            need_change: orders.need_change,
            change_value: orders.change_value,
            obs: orders.obs,
          },
          customer: {
            id: customers.userId,
            name: users.name,
            email: users.email,
            street: customers.street,
            street_number: customers.street_number,
            postalCode: customers.postalCode,
            phone: users.phone,
            city: customers.city,
            state: customers.state,
            neighborhood: customers.neighborhood,
          },
          deliverer: {
            id: deliverers.id,
            name: deliverers.name,
            phone: deliverers.phone,
          },
          products: sql<Products[]>`
          COALESCE(
            json_agg(
              json_build_object(
                'id', ${products.id},
                'name', ${products.name},
                'price', ${products.price},
                'quantity', ${orderItems.quantity},
                'description', ${products.description},
                'image', ${products.image}
              )
            ) FILTER (WHERE ${products.id} IS NOT NULL), '[]'
          )
        `.as("products"),
        })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.order_id))
        .innerJoin(users, eq(orders.customer_id, users.id))
        .leftJoin(deliverers, eq(orders.delivererId, deliverers.id))
        .leftJoin(products, eq(orderItems.product_id, products.id))
        .leftJoin(customers, eq(orders.customer_id, customers.userId))
        .where(eq(orders.id, orderId))
        .groupBy(
          orders.id,
          users.id,
          deliverers.id,
          customers.userId,
          customers.street,
          customers.city,
          customers.state,
          customers.neighborhood,
          customers.street_number,
          customers.postalCode
        );

      if (!data) {
        return c.json({ error: "Order not found" }, 404);
      }

      return c.json({ data });
    }
  )
  .get(
    "/ordersperday/:userId",
    zValidator("param", z.object({ userId: z.string() })), // Validate userId
    zValidator(
      "query",
      z.object({
        from: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
        to: z.string().refine((val) => !isNaN(Date.parse(val)), {
          message: "Invalid date format",
        }),
      })
    ),
    async (c) => {
      const { userId } = c.req.valid("param");
      const { from, to } = c.req.valid("query");

      if (!userId) {
        return c.json({ error: "Missing user ID" }, 400);
      }

      if (!from || !to) {
        return c.json({ error: "Missing date range" }, 400);
      }

      const data = await db
        .select({
          date: sql`DATE(${orders.createdAt})`.as("date"),
          count: sql<number>`COUNT(*)`.as("order_count"),
        })
        .from(orders)
        .where(
          and(
            eq(orders.user_id, userId),
            gte(orders.createdAt, new Date(from)), // Convert string to Date
            lte(orders.createdAt, new Date(to)) // Convert string to Date
          )
        )
        .groupBy(sql`DATE(${orders.createdAt})`)
        .orderBy(sql`DATE(${orders.createdAt})`);

      return c.json({ data });
    }
  )
  .get(
    "/count/:userId",
    zValidator("param", z.object({ userId: z.string() })),
    async (c) => {
      const { userId } = c.req.valid("param");

      if (!userId) {
        return c.json({ error: "Missing user ID" }, 400);
      }

      const [data] = await db
        .select({ count: count() })
        .from(orders)
        .where(eq(orders.user_id, userId));

      if (!data) {
        return c.json({ error: "No orders found" }, 404);
      }

      return c.json({ data });
    }
  )
  // Abrir caixa
  .post("/cash-register/open", async (c) => {
    const openedAt = new Date();
    return c.json(
      {
        message: "Caixa aberto com sucesso",
        openedAt: openedAt.toISOString(),
      },
      200
    );
  })
  // Fechar caixa
  .post("/cash-register/close", async (c) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // Buscar pedidos do dia atual que ainda não foram fechados
    const dailyOrders = await db
      .select({
        id: orders.id,
        total_price: orders.total_price,
        status: orders.status,
        payment_status: orders.payment_status,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(
        and(
          gte(orders.createdAt, today),
          lte(orders.createdAt, endOfDay),
          eq(orders.is_closed, false) // Apenas pedidos ainda não fechados
        )
      );

    if (!dailyOrders || dailyOrders.length === 0) {
      return c.json(
        { error: "Nenhum pedido encontrado para fechar o caixa" },
        404
      );
    }

    const totalRevenue = dailyOrders
      .filter((order) => order.payment_status.trim().toUpperCase() === "PAID") // Agora pega qualquer pedido pago
      .reduce((sum, order) => sum + (order.total_price || 0), 0);

    const report = {
      date: today.toISOString().split("T")[0],
      totalRevenue,
      orderCount: dailyOrders.length,
      completedOrders: dailyOrders.filter((o) => o.status === "FINISHED")
        .length,
      pendingOrders: dailyOrders.filter((o) => o.status === "PREPARING").length,
    };

    // Atualizar os pedidos para marcar como fechados
    await db
      .update(orders)
      .set({ is_closed: true })
      .where(
        and(
          gte(orders.createdAt, today),
          lte(orders.createdAt, endOfDay),
          eq(orders.is_closed, false)
        )
      );

    return c.json({
      message: "Caixa fechado com sucesso",
      report,
    });
  })
  .post("/", verifyAuth(), zValidator("json", insertOrderSchema), async (c) => {
    const auth = c.get("authUser");
    const {
      customer_id,
      status,
      type,
      payment_status,
      items,
      payment_type,
      delivery_deadline,
      pickup_deadline,
    } = c.req.valid("json");

    if (!auth || !auth.token?.sub) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (
      !customer_id ||
      !status ||
      !type ||
      !payment_status ||
      !payment_type ||
      !delivery_deadline ||
      !pickup_deadline ||
      !items.length
    ) {
      return c.json({ error: "Missing data" }, 400);
    }

    const [userCostumer] = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.userId, customer_id));

    const [customer, user] = await Promise.all([
      db
        .select({
          city: customers.city,
          state: customers.state,
          neighborhood: customers.neighborhood,
          street: customers.street,
          street_number: customers.street_number,
          postalCode: customers.postalCode,
        })
        .from(customers)
        .where(eq(customers.id, userCostumer.id))
        .then(([result]) => result), // Extracting first element

      db
        .select({ googleApiKey: users.googleApiKey })
        .from(users)
        .where(eq(users.id, auth.token.sub))
        .then(([result]) => result), // Extracting first element
    ]);

    console.log("customer", customer);
    console.log("user", user);

    if (!customer || !user || !user.googleApiKey) {
      return c.json({ error: "Failed find order data" }, 500);
    }

    const formattedAddress = formatAddress({
      city: customer.city,
      state: customer.state,
      neighborhood: customer.neighborhood,
      street: customer.street,
      street_number: customer.street_number,
      postalCode: customer.postalCode,
    });

    const { success, latitude, longitude, message, placeId } = await getGeoCode(
      formattedAddress,
      user.googleApiKey
    );

    if (!success) {
      return c.json({ error: message }, 500);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Busca o último pedido do dia atual
    const lastOrder = await db
      .select({
        daily_number: orders.daily_number,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(and(gte(orders.createdAt, today), lt(orders.createdAt, tomorrow)))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    const nextDailyNumber = lastOrder[0] ? lastOrder[0].daily_number + 1 : 1;

    const total_price = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const [order] = await db
      .insert(orders)
      .values({
        user_id: auth.token.sub,
        daily_number: nextDailyNumber,
        customer_id,
        total_price,
        delivery_deadline,
        latitude,
        longitude,
        placeId,
        pickup_deadline,
        type,
        status,
        payment_status,
        payment_type,
      })
      .returning({ id: orders.id });

    if (!order) {
      return c.json({ error: "Failed to create order" }, 500);
    }

    await db.insert(orderItems).values(
      items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        price: item.price,
        quantity: item.quantity,
      }))
    );

    let transactionPaymentStatus = "PENDING" as
      | "PENDING"
      | "FAILED"
      | "COMPLETED";

    if (payment_status === "CANCELLED") {
      transactionPaymentStatus = "FAILED";
    } else if (payment_status === "PAID") {
      transactionPaymentStatus = "COMPLETED";
    }

    const [transaction] = await db
      .insert(transactions)
      .values({
        amount: total_price,
        status: transactionPaymentStatus,
        order_id: order.id,
        user_id: auth.token.sub,
        type: "PAYMENT",
      })
      .returning({
        id: transactions.id,
      });

    if (!transaction) {
      return c.json({ error: "Erro ao registrar a transação" }, 500);
    }

    const receipt = await db.insert(receipts).values({
      order_id: order.id,
      user_id: auth.token.sub,
    });

    if (!receipt) {
      return c.json({ error: "Failed to create receipt" }, 500);
    }

    return c.json({ order, receipt });
  })
  .post(
    "/payment/ondelivery",
    zValidator(
      "json",
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
            createdAt: z.union([z.string(), z.date()]).nullable(),
            updatedAt: z.union([z.string(), z.date()]).nullable(),
            userId: z.string().nullable(),
            price: z.number(),
            description: z.string().nullable(),
            category_id: z.string().nullable(),
            quantity: z.number().optional(),
          })
        ),
        totalPrice: z.number(),
        customerId: z.string(),
        apiKey: z.string().optional(),
        deliveryDeadline: z.number().optional(),
        needChange: z.preprocess((val) => val === "true", z.boolean()),
        changeValue: z.number().optional(),
        obs: z.string().optional(),
        restaurantOwnerId: z.string(),
        paymentMethod: z.enum(["PIX", "CREDIT_CARD", "CASH", "CARD"]),
      })
    ),
    async (c) => {
      const values = c.req.valid("json");

      if (!values) {
        return c.json({ error: "Missing data" }, 400);
      }

      const [userCostumer] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.userId, values.customerId));

      const [customer, user] = await Promise.all([
        db
          .select({
            city: customers.city,
            state: customers.state,
            neighborhood: customers.neighborhood,
            street: customers.street,
            street_number: customers.street_number,
            postalCode: customers.postalCode,
          })
          .from(customers)
          .where(eq(customers.id, userCostumer.id))
          .then(([result]) => result), // Extracting first element

        db
          .select({ googleApiKey: users.googleApiKey })
          .from(users)
          .where(eq(users.id, values.restaurantOwnerId))
          .then(([result]) => result), // Extracting first element
      ]);

      if (!customer || !user || !user.googleApiKey) {
        return c.json({ error: "Failed to create order" }, 500);
      }

      const formattedAddress = formatAddress({
        city: customer.city,
        state: customer.state,
        neighborhood: customer.neighborhood,
        street: customer.street,
        street_number: customer.street_number,
        postalCode: customer.postalCode,
      });

      const { success, latitude, longitude, message, placeId } =
        await getGeoCode(formattedAddress, user.googleApiKey);

      if (!success) {
        return c.json({ error: message }, 500);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Busca o último pedido do dia atual
      const lastOrder = await db
        .select({
          daily_number: orders.daily_number,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          and(gte(orders.createdAt, today), lt(orders.createdAt, tomorrow))
        )
        .orderBy(desc(orders.createdAt))
        .limit(1);

      const nextDailyNumber = lastOrder[0] ? lastOrder[0].daily_number + 1 : 1;

      const [order] = await db
        .insert(orders)
        .values({
          user_id: values.restaurantOwnerId,
          customer_id: values.customerId,
          need_change: values.needChange,
          change_value: values.changeValue,
          obs: values.obs,
          latitude,
          longitude,
          placeId,
          daily_number: nextDailyNumber,
          delivery_deadline: values.deliveryDeadline,
          total_price: values.totalPrice,
          status: "PREPARING",
          payment_status: "PENDING",
          payment_type: values.paymentMethod,
          type: "WEBSITE",
        })
        .returning({
          id: orders.id,
          daily_number: orders.daily_number,
          total_price: orders.total_price,
          delivery_deadline: orders.delivery_deadline,
          status: orders.status,
          payment_status: orders.payment_status,
        });

      if (!order) {
        return c.json({ error: "Failed to create order" }, 500);
      }

      await db.insert(orderItems).values(
        values.items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          price: item.price,
          quantity: item.quantity || 1,
        }))
      );

      return c.json({
        data: {
          dailyNumber: order.daily_number,
          totalPrice: order.total_price,
          deliveryDeadline: order.delivery_deadline,
          status: order.status,
          paymentStatus: order.payment_status,
        },
      });
    }
  )
  .post(
    "/payment/website",
    zValidator(
      "json",
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            name: z.string(),
            image: z.string().nullable(),
            createdAt: z.union([z.string(), z.date()]).nullable(),
            updatedAt: z.union([z.string(), z.date()]).nullable(),
            userId: z.string().nullable(),
            price: z.number(),
            description: z.string().nullable(),
            category_id: z.string().nullable(),
            quantity: z.number(),
          })
        ),
        totalPrice: z.number(),
        customerId: z.string(),
        restaurantOwnerId: z.string(),
        deliveryDeadline: z.number().optional(),
        paymentMethod: z.enum(["PIX", "CREDIT_CARD", "CASH", "CARD"]),
        asaasCustomerId: z.string().optional(),
        walletId: z.string().optional(),
        apiKey: z.string().optional(),
        creditCard: z
          .object({
            holderName: z.string(),
            number: z.string(),
            expiryMonth: z.string(),
            expiryYear: z.string(),
            ccv: z.string(),
          })
          .optional(),
      })
    ),
    async (c) => {
      const values = c.req.valid("json");

      if (
        !values ||
        !values.asaasCustomerId ||
        !values.apiKey ||
        !values.walletId
      ) {
        return c.json({ error: "Missing data" }, 400);
      }

      const [userCostumer] = await db
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.userId, values.customerId));

      const [customer, user, admin] = await Promise.all([
        db
          .select({
            city: customers.city,
            state: customers.state,
            neighborhood: customers.neighborhood,
            street: customers.street,
            street_number: customers.street_number,
            postalCode: customers.postalCode,
          })
          .from(customers)
          .where(eq(customers.id, userCostumer.id))
          .then(([result]) => result),

        db
          .select({ googleApiKey: users.googleApiKey })
          .from(users)
          .where(eq(users.id, values.restaurantOwnerId))
          .then(([result]) => result),

        db
          .select({ id: users.id, walletId: users.walletId })
          .from(users)
          .where(eq(users.id, "e53959ca-df8c-4a67-a755-54da4aaca736"))
          .then(([result]) => result),
      ]);

      if (
        !customer ||
        !user ||
        !user.googleApiKey ||
        !admin ||
        !admin.walletId
      ) {
        return c.json({ error: "Failed to find order data" }, 500);
      }

      const formattedAddress = formatAddress({
        city: customer.city,
        state: customer.state,
        neighborhood: customer.neighborhood,
        street: customer.street,
        street_number: customer.street_number,
        postalCode: customer.postalCode,
      });

      const geoCode = await getGeoCode(formattedAddress, user.googleApiKey);

      if (!geoCode.success) {
        return c.json({ error: geoCode.message }, 500);
      }

      const [comission] = await db
        .select({ percentage: commissions.percentage })
        .from(commissions)
        .where(eq(commissions.adminId, admin.id));

      if (!comission) {
        return c.json({ error: "Failed to find commission" }, 500);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      // Busca o último pedido do dia atual
      const lastOrder = await db
        .select({
          daily_number: orders.daily_number,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(
          and(gte(orders.createdAt, today), lt(orders.createdAt, tomorrow))
        )
        .orderBy(desc(orders.createdAt))
        .limit(1);

      const nextDailyNumber = lastOrder[0] ? lastOrder[0].daily_number + 1 : 1;

      const [order] = await db
        .insert(orders)
        .values({
          user_id: values.restaurantOwnerId,
          customer_id: values.customerId,
          daily_number: nextDailyNumber,
          total_price: values.totalPrice,
          delivery_deadline: values.deliveryDeadline,
          latitude: geoCode.latitude,
          longitude: geoCode.longitude,
          placeId: geoCode.placeId,
          status: "PREPARING",
          payment_status: "PENDING",
          payment_type: values.paymentMethod,
          type: "WEBSITE",
        })
        .returning({
          id: orders.id,
          daily_number: orders.daily_number,
          total_price: orders.total_price,
          delivery_deadline: orders.delivery_deadline,
          payment_type: orders.payment_type,
          status: orders.status,
          payment_status: orders.payment_status,
        });

      if (!order) {
        return c.json({ error: "Failed to create order" }, 500);
      }

      await db.insert(orderItems).values(
        values.items.map((item) => ({
          order_id: order.id,
          product_id: item.id,
          price: item.price,
          quantity: item.quantity,
        }))
      );

      const { successful, netValue } = await simulatePayment(
        order.total_price,
        order.payment_type,
        values.apiKey
      );

      if (!successful) {
        return c.json({ error: "Failed to simulate payment" }, 500);
      }

      const { success, data, message, paymentId } = await createPayment(
        {
          customer: values.asaasCustomerId,
          billingType: values.paymentMethod as "PIX" | "CREDIT_CARD" | "BOLETO",
          value: values.totalPrice,
          externalReference: order.id,
          creditCard: values.creditCard,
        },
        values.apiKey,
        comission.percentage,
        admin.walletId,
        netValue
      );

      if (!success) {
        await db.delete(orders).where(eq(orders.id, order.id));

        return c.json({ error: message }, 500);
      }

      await db
        .update(orders)
        .set({
          payment_status: values.paymentMethod === "PIX" ? "PENDING" : "PAID",
        })
        .where(eq(orders.id, order.id));

      if (values.paymentMethod === "PIX" && paymentId) {
        const { encodedImage, expirationDate, payload } =
          await generatePixQrCode(paymentId, values.apiKey);
        if (!encodedImage || !expirationDate || !payload) {
          return c.json({ error: "Failed to generate PIX QR Code" }, 500);
        }
        return c.json({
          order: { ...order, payment_status: "PENDING" }, // Reflete o status atualizado
          paymentMethod: "PIX",
          payment: data,
          qrCode: { encodedImage, expirationDate, payload },
        });
      }

      return c.json({
        dailyNumber: order.daily_number,
        totalPrice: order.total_price,
        deliveryDeadline: order.delivery_deadline,
        status: order.status,
        paymentMethod: "CREDIT_CARD",
        paymentStatus: "PAID", // Reflete o sucesso do pagamento
      });
    }
  )
  .post(
    "/assignorders",
    verifyAuth(),
    zValidator(
      "json",
      z.object({
        ordersIds: z.array(z.string()),
        delivererId: z.string(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { ordersIds, delivererId } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orders || !delivererId) {
        return c.json({ error: "Missing orders or deliverer id" }, 400);
      }

      const data = await db
        .update(orders)
        .set({ delivererId: delivererId, updatedAt: new Date() })
        .where(inArray(orders.id, ordersIds));

      if (!data) {
        return c.json({ error: "Failed to assign orders" }, 500);
      }

      return c.json({ data });
    }
  )
  .patch(
    "/:orderId",
    verifyAuth(),
    zValidator("param", z.object({ orderId: z.string().optional() })),
    zValidator(
      "json",
      z.object({
        delivererId: z.string(),
        status: z.enum([
          "ACCEPTED",
          "PREPARING",
          "FINISHED",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED",
        ]),
        type: z.enum(["LOCAL", "WEBSITE", "WHATSAPP"]),
        payment_status: z.enum(["PENDING", "PAID", "CANCELLED"]),
        delivery_deadline: z.number().optional(),
        pickup_deadline: z.number().optional(),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { orderId } = c.req.valid("param");
      const {
        delivererId,
        payment_status,
        status,
        type,
        delivery_deadline,
        pickup_deadline,
      } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orderId || !delivererId || !status || !payment_status || !type) {
        return c.json({ error: "Missing data or orderId" }, 400);
      }

      const [data] = await db
        .update(orders)
        .set({
          delivererId,
          status,
          payment_status,
          type,
          delivery_deadline,
          pickup_deadline,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning({ totalPrice: orders.total_price });

      if (!data) {
        return c.json({ error: "Failed to update order" }, 500);
      }

      if (payment_status === "PAID") {
        const transaction = await db.insert(transactions).values({
          amount: data.totalPrice,
          status: "COMPLETED",
          order_id: orderId,
          user_id: auth.token.sub,
          type: "PAYMENT",
        });

        if (!transaction) {
          return c.json({ error: "Failed to create transaction" }, 500);
        }
      }

      return c.json({ data });
    }
  )
  .patch(
    "/status/:orderId",
    verifyAuth(),
    zValidator("param", z.object({ orderId: z.string().optional() })),
    zValidator(
      "json",
      z.object({
        status: z.enum([
          "ACCEPTED",
          "PREPARING",
          "FINISHED",
          "IN_TRANSIT",
          "DELIVERED",
          "CANCELLED",
        ]),
      })
    ),
    async (c) => {
      const auth = c.get("authUser");
      const { orderId } = c.req.valid("param");
      const { status } = c.req.valid("json");

      if (!auth || !auth.token?.sub) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (!orderId || !status) {
        return c.json({ error: "Missing order id or status" }, 400);
      }

      const data = await db
        .update(orders)
        .set({ status: status, updatedAt: new Date() })
        .where(eq(orders.id, orderId));

      if (!data) {
        return c.json({ error: "Failed to update order" }, 500);
      }

      return c.json({ data });
    }
  );

export default app;

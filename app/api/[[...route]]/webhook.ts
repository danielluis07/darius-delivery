import { db } from "@/db/drizzle";
import { orders, transactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

type Body = {
  id: string;
  event: string;
  dateCreated: string;
  payment: {
    object: string;
    id: string;
    dateCreated: string;
    customer: string;
    paymentLink: string | null;
    value: number;
    netValue: number;
    originalValue: number | null;
    interestValue: number | null;
    description: string | null;
    billingType: string;
    confirmedDate: string;
    creditCard?: {
      creditCardNumber: string;
      creditCardBrand: string;
      creditCardToken: string;
    };
    pixTransaction: string | null;
    status: string;
    dueDate: string;
    originalDueDate: string;
    paymentDate: string | null;
    clientPaymentDate: string;
    installmentNumber: number | null;
    invoiceUrl: string;
    invoiceNumber: string;
    externalReference: string;
    deleted: boolean;
    anticipated: boolean;
    anticipable: boolean;
    creditDate: string;
    estimatedCreditDate: string;
    transactionReceiptUrl: string;
    nossoNumero: string | null;
    bankSlipUrl: string | null;
    lastInvoiceViewedDate: string | null;
    lastBankSlipViewedDate: string | null;
    postalService: boolean;
    custody: string | null;
    escrow: string | null;
    refunds: string | null;
  };
};

type SubscriptionBody = {
  id: string;
  event:
    | "SUBSCRIPTION_CREATED"
    | "SUBSCRIPTION_UPDATED"
    | "SUBSCRIPTION_INACTIVATED"
    | "SUBSCRIPTION_DELETED"
    | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK"
    | "SUBSCRIPTION_SPLIT_DIVERGENCE_BLOCK_FINISHED";
  dateCreated: string;
  subscription: {
    object: string;
    id: string;
    dateCreated: string;
    customer: string;
    paymentLink: string | null;
    value: 197;
    nextDueDate: string;
    cycle: string;
    description: string | null;
    billingType: string;
    deleted: boolean;
    status: string;
    externalReference: string;
    sendPaymentByPostalService: boolean;
    fine: { value: number; type: string };
    interest: { value: number; type: string };
    split: {
      fixedFee: number;
      mdr: number;
      fee: number;
      recipient: string;
    } | null;
  };
};

const app = new Hono()
  .post("/asaas/payment", async (c) => {
    const body: Body = await c.req.json();

    const { payment } = body;

    // Verifica se há um externalReference (ID do pedido)
    if (!payment.externalReference) {
      return c.json({ error: "Pagamento sem referência externa" }, 400);
    }

    try {
      let paymentStatus: "PENDING" | "PAID" | "CANCELLED" = "PENDING";
      let transactionStatus: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";

      // Mapeia os eventos do ASAAS para os status do banco
      switch (payment.status) {
        case "CONFIRMED":
          paymentStatus = "PAID";
          transactionStatus = "COMPLETED";
          break;
        case "CANCELED":
          paymentStatus = "CANCELLED";
          transactionStatus = "FAILED";
          break;
        default:
          return c.json({ message: "Evento ignorado" });
      }

      const [order] = await db
        .update(orders)
        .set({
          payment_status: paymentStatus,
        })
        .where(eq(orders.id, payment.externalReference))
        .returning({
          orderId: orders.id,
          payment_status: orders.payment_status,
        });

      if (!order) {
        return c.json({ error: "Erro ao atualizar o pedido" }, 404);
      }

      const existingTransaction = await db
        .select()
        .from(transactions)
        .where(eq(transactions.order_id, order.orderId))
        .limit(1);

      if (existingTransaction.length > 0) {
        return c.json({
          message: "Transaction already exists, skipping duplicate entry",
          transactionId: existingTransaction[0].id,
          orderId: order.orderId,
        });
      }

      const [transaction] = await db
        .insert(transactions)
        .values({
          amount: Math.round(payment.netValue * 100),
          status: transactionStatus,
          order_id: order.orderId,
          type: "PAYMENT",
        })
        .returning({
          id: transactions.id,
        });

      if (!transaction) {
        return c.json({ error: "Erro ao registrar a transação" }, 500);
      }

      return c.json({
        message: "Webhook processado com sucesso",
        paymentType: payment.billingType,
        orderStatus: order.payment_status,
        transactionStatus: transactionStatus,
        transactionId: transaction.id,
        orderId: order.orderId,
      });
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      return c.json({ error: "Erro interno ao processar webhook" }, 500);
    }
  })
  .post("/asaas/subscription", async (c) => {
    const body: SubscriptionBody = await c.req.json();

    console.log("Subscription body:", body);

    try {
      const { event } = body;

      console.log("Event:", event);

      //const data = db.select().from(subscriptions);

      return c.json({
        message: "Webhook processado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
      return c.json({ error: "Erro interno ao processar webhook" }, 500);
    }
  });

export default app;

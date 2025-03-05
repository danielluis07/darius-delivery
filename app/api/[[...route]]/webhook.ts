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
    pixTransaction: any | null;
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
    custody: any | null;
    escrow: any | null;
    refunds: any | null;
  };
};

const app = new Hono().post("/asaas", async (c) => {
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
});

export default app;

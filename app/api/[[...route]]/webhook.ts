import { Hono } from "hono";

const app = new Hono().post("/asaas", async (c) => {
  const body = await c.req.json();

  console.log("Webhook recebido:", body);

  // Verifica se o webhook é um evento de pagamento
  if (!body || !body.event || !body.payment) {
    return c.json({ error: "Evento inválido" }, 400);
  }

  const { event, payment } = body;

  // Verifica se há um externalReference (ID do pedido)
  if (!payment.externalReference) {
    return c.json({ error: "Pagamento sem referência externa" }, 400);
  }

  try {
    let paymentStatus = null;
    let orderStatus = null;

    console.log(orderStatus);

    // Mapeia os eventos do ASAAS para os status do banco
    switch (event) {
      case "PAYMENT_CONFIRMED":
        paymentStatus = "PAID";
        orderStatus = "COMPLETED"; // Pedido finalizado
        break;
      case "PAYMENT_RECEIVED":
        paymentStatus = "RECEIVED";
        orderStatus = "IN_PROGRESS"; // Pedido em andamento
        break;
      case "PAYMENT_REFUNDED":
        paymentStatus = "REFUNDED";
        orderStatus = "CANCELLED"; // Pedido cancelado
        break;
      case "PAYMENT_OVERDUE":
        paymentStatus = "OVERDUE";
        orderStatus = "CANCELLED"; // Pedido cancelado
        break;
      case "PAYMENT_DELETED":
        paymentStatus = "CANCELLED";
        orderStatus = "CANCELLED"; // Pedido cancelado
        break;
      default:
        return c.json({ message: "Evento ignorado" });
    }

    console.log(
      `Pedido ${payment.externalReference} atualizado para ${paymentStatus}`
    );

    return c.json({ message: "Webhook processado com sucesso" });
  } catch (error) {
    console.error("Erro ao processar webhook:", error);
    return c.json({ error: "Erro interno ao processar webhook" }, 500);
  }
});

export default app;

"use client";

import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { formatCurrencyFromCents } from "@/lib/utils";
import { format } from "date-fns";

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":orderId"]["$get"],
  200
>["data"];

export const OrderDetails = ({ data }: { data: ResponseType }) => {
  const { order, item, product, customer } = data;

  const totalPrice = order.totalPrice || 0;
  const productName = product?.name || "N/A";
  const productDescription = product?.description || "N/A";
  const date = new Date(order.createdAt);

  /* traduzir status para portugues */
  const statusMap = {
    CANCELLED: "Cancelado",
    PREPARING: "Preparando",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
  } as const;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Pedido</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <span className="font-medium">Feito em:</span>{" "}
            {format(date, "dd/MM/yyyy")}
          </p>
          <p>
            <span className="font-medium">Preço Total:</span> $
            {formatCurrencyFromCents(totalPrice)}
          </p>
          <p>
            <span className="font-medium">Status:</span>{" "}
            {order.status ? statusMap[order.status] : "Desconhecido"}
          </p>
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Mais Detalhes</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <span className="font-medium">Quantidade:</span> {item.quantity}
          </p>
          <p>
            <span className="font-medium">Preço:</span>{" "}
            {formatCurrencyFromCents(item.price)}
          </p>
        </div>
      </div>

      {/* Product Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Detalhes do Produto</h2>
        <p>
          <span className="font-medium">Nome do Produto:</span> {productName}
        </p>
        <p>
          <span className="font-medium">Descrição:</span> {productDescription}
        </p>
      </div>

      {/* Customer Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Detalhes do Comprador</h2>
        <div className="grid grid-cols-2 gap-4">
          <p>
            <span className="font-medium">Nome:</span> {customer.name}
          </p>
          <p>
            <span className="font-medium">Email:</span> {customer.email}
          </p>
          <p>
            <span className="font-medium">Telefone:</span> {customer.phone}
          </p>
          <p>
            <span className="font-medium">Rua:</span> {customer.address}
          </p>
          <p>
            <span className="font-medium">Cidade:</span> {customer.city}
          </p>
          <p>
            <span className="font-medium">Estado:</span> {customer.state}
          </p>
          <p>
            <span className="font-medium">Bairro:</span> {customer.neighborhood}
          </p>
        </div>
      </div>
    </div>
  );
};

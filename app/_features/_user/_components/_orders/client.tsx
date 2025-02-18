"use client";

import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, ClipboardPen } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { RiMotorbikeFill } from "react-icons/ri";

type ResponseType = InferResponseType<
  (typeof client.api.orders.user)[":userId"]["$get"],
  200
>["data"];

type OrdersProps = {
  data: ResponseType;
};

export const OrdersClient = ({ data }: OrdersProps) => {
  const orders = data.filter((order) => order.status !== "FINISHED");
  const finishedOrders = data.filter((order) => order.status === "FINISHED");
  const router = useRouter();

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-blue-500 text-white",
    PREPARING: "bg-yellow-500 text-white",
    IN_TRANSIT: "bg-orange-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    FINISHED: "bg-gray-500 text-white",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    ACCEPTED: <Clock className="size-4 mr-1" />,
    PREPARING: <Clock className="size-4 mr-1" />,
    IN_TRANSIT: <RiMotorbikeFill className="size-4 mr-1" />,
    DELIVERED: <CheckCircle className="size-4 mr-1" />,
    FINISHED: <CheckCircle className="size-4 mr-1" />,
  };

  const statusTranslations: Record<string, string> = {
    ACCEPTED: "Aceito",
    PREPARING: "Em preparo",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    FINISHED: "Finalizado",
  };

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10">
      {/* Preparing Orders */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Em Preparo</h3>
        <ScrollArea className="h-64">
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} className="p-3 border rounded-lg mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Pedido #{order.number}
                  </span>
                  <Badge className={cn(statusColors[order.status], "px-2")}>
                    {statusIcons[order.status]}{" "}
                    {statusTranslations[order.status]}
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">Total:</span>{" "}
                      {formatCurrencyFromCents(order.total_price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Tipo:</span> {order.type}
                    </p>
                  </div>
                  <div
                    className="cursor-pointer text-gray-500"
                    onClick={() =>
                      router.push(`/dashboard/orders/${order.id}`)
                    }>
                    <ClipboardPen />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum pedido em preparo.</p>
          )}
        </ScrollArea>
      </Card>

      {/* Finished Orders */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">Finalizados</h3>
        <ScrollArea className="h-64">
          {finishedOrders.length > 0 ? (
            finishedOrders.map((order) => (
              <div key={order.id} className="p-3 border rounded-lg mb-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Pedido #{order.number}
                  </span>
                  <Badge className={cn(statusColors["FINISHED"], "px-2")}>
                    {statusIcons["FINISHED"]} Finalizado
                  </Badge>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-800">
                      <span className="font-semibold">Total:</span>{" "}
                      {formatCurrencyFromCents(order.total_price)}
                    </p>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Tipo:</span> {order.type}
                    </p>
                  </div>
                  <div
                    className="cursor-pointer text-gray-500"
                    onClick={() =>
                      router.push(`/dashboard/orders/${order.id}`)
                    }>
                    <ClipboardPen />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">Nenhum pedido finalizado.</p>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
};

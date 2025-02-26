"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  ClipboardPen,
  Ellipsis,
  Plus,
  Route,
} from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { RiMotorbikeFill } from "react-icons/ri";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useUpdateOrderStatus } from "@/app/_features/_user/_queries/_order-routing/use-update-order-status";
import { useGetOrders } from "../../_queries/_orders/use-get-orders";
import Link from "next/link";
import { useState } from "react";

const orderStatus: Array<
  | "ACCEPTED"
  | "PREPARING"
  | "FINISHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
> = [
  "ACCEPTED",
  "PREPARING",
  "IN_TRANSIT",
  "DELIVERED",
  "FINISHED",
  "CANCELLED",
];

export const OrdersClient = ({ userId }: { userId: string }) => {
  const [open, setOpen] = useState<boolean>(false);
  const { data, isLoading } = useGetOrders(userId);
  const { mutate, isPending } = useUpdateOrderStatus(userId);
  const router = useRouter();

  const ordersData = data || [];

  const orders = ordersData.filter((order) => order.status !== "FINISHED");
  const finishedOrders = ordersData.filter(
    (order) => order.status === "FINISHED"
  );

  const [ConfirmStatusDialog, confirmStatus] = useConfirm(
    "Tem certeza?",
    "Você está prestes a mudar o status do pedido"
  );

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-blue-500 text-white",
    PREPARING: "bg-yellow-500 text-white",
    IN_TRANSIT: "bg-orange-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    FINISHED: "bg-gray-500 text-white",
    CANCELLED: "bg-red-500 text-white",
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
    CANCELLED: "Cancelado",
  };

  if (isLoading) return <div>Carregando...</div>;

  if (!data) {
    return (
      <Card className="h-[500px] w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pedidos</h1>
          <Link href="/dashboard/orders/new">
            <Button>
              Novo Pedido <Plus />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">
            Nenhum pedido encontrado
          </span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <ConfirmStatusDialog />
      <div className="w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pedidos</h1>
          <div className="flex items-center gap-x-2">
            <Link href="/dashboard/orders/new">
              <Button>
                Novo Pedido <Plus />
              </Button>
            </Link>
            <Link href="/dashboard/order-routing">
              <Button>
                Roteirização <Route />
              </Button>
            </Link>
          </div>
        </div>
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
                          <span className="font-semibold">Tipo:</span>{" "}
                          {order.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="cursor-pointer text-gray-500 hover:bg-accent hover:text-accent-foreground rounded-sm p-1"
                          onClick={() =>
                            router.push(`/dashboard/orders/${order.id}`)
                          }>
                          <ClipboardPen />
                        </div>
                        <DropdownMenu open={open} onOpenChange={setOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <Ellipsis className="size-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <div className="flex justify-center text-sm font-semibold p-2">
                              Mudar Status
                            </div>
                            <Separator />
                            {orderStatus.map((item, i) => (
                              <DropdownMenuItem
                                key={i}
                                disabled={isPending}
                                className="cursor-pointer text-xs"
                                onClick={async () => {
                                  setOpen(false); // Close dropdown before opening dialog
                                  const ok = await confirmStatus();
                                  if (ok) {
                                    mutate({ orderId: order.id, status: item });
                                  }
                                }}>
                                {statusTranslations[item]}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  Nenhum pedido em preparo.
                </p>
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
                          <span className="font-semibold">Tipo:</span>{" "}
                          {order.type}
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
                <p className="text-sm text-gray-500">
                  Nenhum pedido finalizado.
                </p>
              )}
            </ScrollArea>
          </Card>
        </div>
      </div>
    </>
  );
};

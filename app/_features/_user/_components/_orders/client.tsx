"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
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
  Printer,
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
import { useUpdateOrderStatus } from "@/app/_features/_user/_queries/_order-routing/use-update-order-status";
import Link from "next/link";
import { useState } from "react";
import { useDialogStore } from "@/hooks/use-receipt-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  pdf,
} from "@react-pdf/renderer";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { useGetOrdersReceipts } from "@/app/_features/_user/_queries/_orders/use-get-orders-receipts";
import { CloseCashRegister } from "@/app/_features/_user/_components/_orders/close-cash-register";
import { useConfirmContext } from "@/context/confirm-context";

export type Receipt = InferResponseType<
  (typeof client.api.receipts.store)[":storeId"]["$get"],
  200
>["data"];

const orderStatus: Array<
  | "ACCEPTED"
  | "PREPARING"
  | "FINISHED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"
  | "WITHDRAWN"
  | "CONSUME_ON_SITE"
> = [
  "ACCEPTED",
  "PREPARING",
  "IN_TRANSIT",
  "DELIVERED",
  "FINISHED",
  "CANCELLED",
  "WITHDRAWN",
  "CONSUME_ON_SITE",
];

export const OrdersClient = ({ storeId }: { storeId: string }) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { data, isLoading } = useGetOrdersReceipts(storeId);
  const { mutate, isPending } = useUpdateOrderStatus(storeId);
  const { isOpen, receipt, closeDialog } = useDialogStore();
  const router = useRouter();

  const ordersData = data || [];

  const orders = ordersData.filter(
    (item) =>
      item.order.status !== "FINISHED" &&
      item.order.status !== "IN_TRANSIT" &&
      item.order.status !== "DELIVERED" &&
      item.order.status !== "CANCELLED"
  );
  const ordersInTransit = ordersData.filter(
    (item) => item.order.status === "IN_TRANSIT"
  );
  const finishedOrders = ordersData.filter(
    (item) =>
      item.order.status === "FINISHED" || item.order.status === "DELIVERED"
  );

  const { confirm } = useConfirmContext();

  const printReceipt = async (receiptData: Receipt[number]) => {
    if (!receiptData) {
      console.error("printReceipt: No receiptData provided.");
      return;
    }

    try {
      console.log("Attempting to generate PDF blob...");
      // ... rest of your function
      const blob = await pdf(<ReceiptPDF receipt={receiptData} />).toBlob(); // Make sure pdf and ReceiptPDF are correctly imported/available
      console.log("PDF blob generated:", blob);

      if (!blob || blob.size === 0) {
        console.error("Generated blob is invalid or empty.");
        return;
      }

      const url = URL.createObjectURL(blob);
      console.log("Object URL created:", url);

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = url;
      document.body.appendChild(iframe);
      console.log("Iframe appended to body. src:", iframe.src);

      iframe.onload = () => {
        console.log("Iframe onload event fired.");
        try {
          if (iframe.contentWindow) {
            console.log("Attempting to call iframe.contentWindow.print()");
            iframe.contentWindow.print();
          } else {
            console.error("iframe.contentWindow is not accessible.");
          }
        } catch (printError) {
          console.error(
            "Error during iframe.contentWindow.print():",
            printError
          );
        } finally {
          setTimeout(() => {
            console.log("Cleaning up iframe and object URL.");
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
            URL.revokeObjectURL(url);
          }, 1000);
        }
      };

      // Inside printReceipt, in iframe.onload
      iframe.onload = () => {
        console.log("Iframe onload event fired.");
        try {
          if (iframe.contentWindow) {
            console.log("Attempting to call iframe.contentWindow.print()");
            iframe.contentWindow.print(); // This line triggers the browser's print dialog
            console.log("Called iframe.contentWindow.print()");
          } else {
            console.error("iframe.contentWindow is not accessible.");
          }
        } catch (printError) {
          console.error(
            "Error during iframe.contentWindow.print():",
            printError
          );
        } finally {
          console.log(
            "Print dialog initiated. Iframe cleanup will be significantly delayed for testing."
          );
          setTimeout(() => {
            console.log("Performing cleanup now (after a very long delay).");
            // FOR TESTING, COMMENT THESE LINES OUT TEMPORARILY:
            // if (document.body.contains(iframe)) {
            //   document.body.removeChild(iframe);
            // }
            // URL.revokeObjectURL(url);
          }, 60000); // Increased to 60 seconds. Or comment out the lines above.
        }
      };
    } catch (error) {
      console.error(
        "Error in printReceipt function (outside iframe onload):",
        error
      );
    }
  };

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-blue-500 text-white",
    PREPARING: "bg-yellow-500 text-white",
    IN_TRANSIT: "bg-orange-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    FINISHED: "bg-gray-500 text-white",
    CANCELLED: "bg-red-500 text-white",
    WITHDRAWN: "bg-purple-500 text-white",
    CONSUME_ON_SITE: "bg-teal-500 text-white",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    ACCEPTED: <Clock className="size-4 mr-1" />,
    PREPARING: <Clock className="size-4 mr-1" />,
    IN_TRANSIT: <RiMotorbikeFill className="size-4 mr-1" />,
    DELIVERED: <CheckCircle className="size-4 mr-1" />,
    FINISHED: <CheckCircle className="size-4 mr-1" />,
  };

  const statusTranslations: Record<string, string> = {
    PREPARING: "Em preparo",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    FINISHED: "Finalizado",
    CANCELLED: "Cancelado",
    ACCEPTED: "Aceito",
    WITHDRAWN: "Retirada",
    CONSUME_ON_SITE: "Consumido no local",
  };

  if (isLoading) return <div>Carregando...</div>;

  if (!data) {
    return (
      <Card className="h-[500px] w-full mt-5">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pedidos</h1>
          <Link href={`/dashboard/${storeId}/orders/new`}>
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
      <div className="w-full mt-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pedidos</h1>
          <div className="flex items-center gap-x-2">
            <Link href={`/dashboard/${storeId}/orders/new`}>
              <Button>
                Novo Pedido <Plus />
              </Button>
            </Link>
            <Link href={`/dashboard/${storeId}/order-routing`}>
              <Button>
                Roteirização <Route />
              </Button>
            </Link>
            <CloseCashRegister storeId={storeId} />
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {/* Preparing Orders */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Em Preparo</h3>
            <ScrollArea className="h-96">
              {orders.length > 0 ? (
                orders.map((item) => (
                  <div
                    key={item.order.id}
                    className="p-3 border rounded-lg mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Pedido #{item.order.daily_number}
                      </span>
                      <Badge
                        className={cn(statusColors[item.order.status], "px-2")}>
                        {statusIcons[item.order.status]}{" "}
                        {statusTranslations[item.order.status]}
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">Total:</span>{" "}
                          {formatCurrencyFromCents(item.order.total_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Tipo:</span>{" "}
                          {item.order.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="cursor-pointer text-gray-500 hover:bg-accent hover:text-accent-foreground rounded-sm p-1"
                          onClick={() =>
                            router.push(
                              `/dashboard/${storeId}/orders/${item.order.id}`
                            )
                          }>
                          <ClipboardPen />
                        </div>
                        <div
                          className="cursor-pointer text-gray-500 hover:bg-accent hover:text-accent-foreground rounded-sm p-1"
                          onClick={() => {
                            //@ts-expect-error ignore this error, we know that id is not null
                            printReceipt(item.receipt);
                          }}>
                          <Printer />
                        </div>
                        <DropdownMenu
                          open={openDropdownId === item.order.id}
                          onOpenChange={(isOpen) => {
                            setOpenDropdownId(isOpen ? item.order.id : null);
                          }}>
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
                            {orderStatus.map((status, i) => (
                              <DropdownMenuItem
                                key={i}
                                disabled={isPending}
                                className="cursor-pointer text-xs"
                                onClick={async () => {
                                  setOpenDropdownId(null); // Close dropdown
                                  const ok = await confirm({
                                    title: "Tem certeza?",
                                    message:
                                      "Você está prestes a mudar o status do pedido",
                                  });
                                  if (ok) {
                                    mutate({
                                      orderId: item.order.id,
                                      status: status,
                                    });
                                  }
                                }}>
                                {statusTranslations[status]}
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

          {/* In Transit Orders */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">Em Trânsito</h3>
            <ScrollArea className="h-96">
              {ordersInTransit.length > 0 ? (
                ordersInTransit.map((item) => (
                  <div
                    key={item.order.id}
                    className="p-3 border rounded-lg mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Pedido #{item.order.daily_number}
                      </span>
                      <Badge className={cn(statusColors["IN_TRANSIT"], "px-2")}>
                        {statusIcons["IN_TRANSIT"]} Em Trânsito
                      </Badge>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">Total:</span>{" "}
                          {formatCurrencyFromCents(item.order.total_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Tipo:</span>{" "}
                          {item.order.type}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="cursor-pointer text-gray-500 hover:bg-accent hover:text-accent-foreground rounded-sm p-1"
                          onClick={() =>
                            router.push(`/dashboard/orders/${item.order.id}`)
                          }>
                          <ClipboardPen />
                        </div>
                        <DropdownMenu
                          open={openDropdownId === item.order.id}
                          onOpenChange={(isOpen) => {
                            setOpenDropdownId(isOpen ? item.order.id : null);
                          }}>
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
                            {orderStatus.map((status, i) => (
                              <DropdownMenuItem
                                key={i}
                                disabled={isPending}
                                className="cursor-pointer text-xs"
                                onClick={async () => {
                                  setOpenDropdownId(null); // Close dropdown
                                  const ok = await confirm({
                                    title: "Tem certeza?",
                                    message:
                                      "Você está prestes a mudar o status do pedido",
                                  });
                                  if (ok) {
                                    mutate({
                                      orderId: item.order.id,
                                      status: status,
                                    });
                                  }
                                }}>
                                {statusTranslations[status]}
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
                  Nenhum pedido finalizado.
                </p>
              )}
            </ScrollArea>
          </Card>

          {/* Finished Orders */}
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-3">
              Finalizados/Entregues
            </h3>
            <ScrollArea className="h-96">
              {finishedOrders.length > 0 ? (
                finishedOrders.map((item) => (
                  <div
                    key={item.order.id}
                    className="p-3 border rounded-lg mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Pedido #{item.order.daily_number}
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
                          {formatCurrencyFromCents(item.order.total_price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="font-semibold">Tipo:</span>{" "}
                          {item.order.type}
                        </p>
                      </div>
                      <div
                        className="cursor-pointer text-gray-500"
                        onClick={() =>
                          router.push(`/dashboard/orders/${item.order.id}`)
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
      {/* Dialog for Previewing the Receipt */}
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <VisuallyHidden.Root>
              <DialogTitle>Receipt Preview</DialogTitle>
            </VisuallyHidden.Root>
            <VisuallyHidden.Root>
              <DialogDescription>
                View the full receipt details
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>
          {receipt && (
            <PDFViewer style={{ width: "100%", height: "500px" }}>
              <ReceiptPDF receipt={receipt} />
            </PDFViewer>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 8,
    paddingVertical: 15,
    fontSize: 10,
    fontFamily: "Courier",
    width: 227, // Para 80mm de largura de papel
  },
  section: { marginBottom: 10 },
  header: { textAlign: "center", fontSize: 16, fontWeight: "bold" },
  subheader: { textAlign: "center", fontSize: 10 },
  dashedLine: { borderBottom: "1px dashed black", marginVertical: 5 },
  boldText: { fontWeight: "bold" },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 2, // Adicionado um pequeno espaço entre as linhas de flexRow
  },
  flexChildLeft: {
    width: "65%", // Ajustado para dar um pouco mais de espaço para o valor
    paddingRight: 5, // Pequeno espaço para não colar com o filho da direita
  },
  flexChildRight: {
    width: "35%",
    textAlign: "right",
  },
  // Estilos para a linha de produtos
  productRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 3, // Espaçamento entre os itens da lista de produtos
  },
  productDetails: {
    // Para nome do produto e quantidade x preço unitário
    width: "70%", // Ocupa a maior parte à esquerda
    paddingRight: 5, // Espaço antes do preço total do item
  },
  productItemTotalPrice: {
    // Para o preço total de um item do pedido
    width: "30%",
    textAlign: "right",
    // fontWeight: 'bold', // O boldText já será aplicado no componente <Text>
  },
});

const ReceiptPDF = ({ receipt }: { receipt: Receipt[number] }) => {
  const totalPrice = receipt.orderTotalPrice || 0;
  const paymentTypeTranslation: Record<string, string> = {
    CASH: "Dinheiro",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    PIX: "PIX",
  };

  const paymentStatusTranslations: Record<string, string> = {
    PENDING: "Aguardando",
    PAID: "Pago",
  };

  const statusTranslations: Record<string, string> = {
    ACCEPTED: "Aceito",
    PREPARING: "Em preparo",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    FINISHED: "Finalizado",
    CANCELLED: "Cancelado",
    WITHDRAWN: "Retirada",
    CONSUME_ON_SITE: "Consumido no local",
  };

  // Função auxiliar para formatar moeda (adapte conforme sua necessidade)
  const formatCurrencyFromCents = (valueInCents: number) => {
    const value = valueInCents / 100;
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <Document>
      <Page size={{ width: 227, height: "auto" }} style={styles.page}>
        {" "}
        {/* Altura 'auto' pode funcionar melhor para rolo */}
        <View style={styles.section}>
          <Text style={styles.header}>Nome da Loja</Text>
          <Text style={styles.subheader}>(11) 0000-0000</Text>
        </View>
        <View style={styles.flexRow}>
          <Text
            style={[styles.boldText, styles.flexChildLeft, { fontSize: 12 }]}>
            Pedido
          </Text>
          <Text
            style={[styles.boldText, styles.flexChildRight, { fontSize: 12 }]}>
            No. {receipt.orderNumber} {/* ALTERADO */}
          </Text>
        </View>
        <Text style={{ marginBottom: 5 }}>Origem: Online</Text>{" "}
        {/* Adicionado marginBottom para consistência */}
        <View style={styles.dashedLine}></View>
        <Text>Cliente: {receipt.customerName}</Text>
        <Text>Tel: {receipt.customerPhone}</Text>
        <Text style={{ marginBottom: 5 }}>
          {" "}
          {/* Adicionado marginBottom */}
          Rua: {receipt?.customerStreet || "N/A"} - No. {/* ALTERADO */}
          {receipt?.customerStreetNumber} -{" "}
          {receipt?.customerComplement &&
            `Complemento: ${receipt?.customerComplement} - `}{" "}
          {receipt?.customerNeighborhood || "N/A"} -{" "}
          {receipt?.customerCity || "N/A"} - {receipt?.customerState || "N/A"}
        </Text>
        <View style={styles.dashedLine}></View>
        <Text style={[styles.boldText, { marginBottom: 3 }]}>
          Produtos
        </Text>{" "}
        {/* Adicionado marginBottom */}
        <View style={styles.dashedLine}></View>
        {receipt.orderItems.map((item, index) => (
          <View key={index} style={styles.productRow}>
            <View style={styles.productDetails}>
              <Text style={styles.boldText}>{item.productName}</Text>
              <Text>
                {item.quantity}x {formatCurrencyFromCents(item.price)}
              </Text>
            </View>
            <Text style={[styles.boldText, styles.productItemTotalPrice]}>
              {formatCurrencyFromCents(item.quantity * item.price)}
            </Text>
          </View>
        ))}
        <View style={styles.dashedLine}></View>
        <Text style={{ marginBottom: 5 }}>
          Obs: {receipt.orderObs || "Nenhuma"}
        </Text>{" "}
        {/* Adicionado fallback e marginBottom */}
        <View style={styles.dashedLine}></View>
        <View style={styles.flexRow}>
          <Text
            style={[styles.boldText, styles.flexChildLeft, { fontSize: 12 }]}>
            Total
          </Text>
          <Text
            style={[styles.boldText, styles.flexChildRight, { fontSize: 12 }]}>
            {formatCurrencyFromCents(totalPrice)}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.flexChildLeft}>Forma de Pagamento</Text>
          <Text style={styles.flexChildRight}>
            {paymentTypeTranslation[receipt.orderPaymentType ?? ""] ||
              "Não informado"}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.flexChildLeft}>Status do Pedido</Text>
          <Text style={styles.flexChildRight}>
            {statusTranslations[receipt.orderStatus ?? ""] || "Não informado"}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text style={styles.flexChildLeft}>Status do Pagamento</Text>
          <Text style={styles.flexChildRight}>
            {paymentStatusTranslations[receipt.orderPaymentStatus ?? ""] ||
              "Não informado"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useGetReceipts } from "@/app/_features/_user/_queries/_receipts/use-get-receipts";
import { client } from "@/lib/hono";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { InferResponseType } from "hono";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useDialogStore } from "@/hooks/use-receipt-dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export type Receipt = InferResponseType<
  (typeof client.api.receipts.user)[":userId"]["$get"],
  200
>["data"];

export const ReceiptsClient = ({ userId }: { userId: string }) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const { data, isLoading } = useGetReceipts(userId);
  const { isOpen, receipt, openDialog, closeDialog } = useDialogStore();
  const translatedOrderStatus: Record<string, string> = {
    ACCEPTED: "Aceito",
    PREPARING: "Preparando",
    FINISHED: "Finalizado",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    WITHDRAWN: "Retirada",
    CONSUME_ON_SITE: "Consumir no local",
  };

  const filteredReceipts = useMemo(() => {
    if (!data) return [];
    return data.filter(
      (receipt) =>
        receipt.orderNumber &&
        receipt.orderNumber.toString().includes(searchTerm)
    );
  }, [data, searchTerm]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!data) {
    return <div>Você não gerou nenhuma comanda</div>;
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Comandas</h2>

      <Input
        type="text"
        placeholder="Procure pelo nº do pedido"
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredReceipts.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {filteredReceipts.map((receipt) => {
            const totalPrice = receipt.orderTotalPrice || 0;
            return (
              <Card key={receipt.id}>
                <div>
                  <h3 className="text-lg font-semibold">
                    Pedido nº{receipt.orderNumber}
                  </h3>
                  <p className="text-gray-600">
                    Cliente: {receipt.customerName}
                  </p>
                  <p className="text-gray-600">
                    Email: {receipt.customerEmail}
                  </p>
                  <p className="text-gray-600">
                    Total: {formatCurrencyFromCents(totalPrice)}
                  </p>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span className="font-medium text-primary">
                      {translatedOrderStatus[receipt.orderStatus ?? ""] ||
                        "Não informado"}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => openDialog(receipt)}
                  className="mt-4"
                  variant="secondary">
                  Imprimir
                </Button>
              </Card>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-600">Nenhuma comanda encontrada</p>
      )}

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
    </div>
  );
};

const styles = StyleSheet.create({
  page: { padding: 5, fontSize: 10, fontFamily: "Courier" }, // Menos padding para otimizar espaço
  section: { textAlign: "center", marginBottom: 5 },
  header: { fontSize: 14, fontWeight: "bold" },
  subheader: { fontSize: 10 },
  dashedLine: { borderBottom: "1px dashed black", marginVertical: 3 },
  boldText: { fontWeight: "bold" },
  productRow: { marginBottom: 3 }, // Removido flex para evitar desalinhamento
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

  return (
    <Document>
      <Page size={{ width: 80, height: "auto" }} style={styles.page}>
        {/* Nome da Loja */}
        <View style={styles.section}>
          <Text style={styles.header}>Nome da Loja</Text>
          <Text style={styles.subheader}>(11) 0000-0000</Text>
        </View>

        {/* Informações do Pedido */}
        <Text style={styles.boldText}>Pedido nº {receipt.number}</Text>
        <Text>Origem: Online</Text>
        <View style={styles.dashedLine}></View>

        {/* Informações do Cliente */}
        <Text>Cliente: {receipt.customerName}</Text>
        <Text>Tel: {receipt.customerPhone}</Text>
        <Text>
          Rua: {receipt?.customerStreet || "N/A"} - Nº{" "}
          {receipt?.customerStreetNumber},{" "}
          {receipt?.customerComplement
            ? `Comp: ${receipt?.customerComplement}, `
            : ""}
          {receipt?.customerNeighborhood || "N/A"} -{" "}
          {receipt?.customerCity || "N/A"} - {receipt?.customerState || "N/A"}
        </Text>
        <View style={styles.dashedLine}></View>

        {/* Produtos */}
        <Text style={styles.boldText}>Produtos</Text>
        <View style={styles.dashedLine}></View>
        {receipt.orderItems.map((item, index) => (
          <View key={index} style={styles.productRow}>
            <Text style={styles.boldText}>{item.productName}</Text>
            <Text>
              {item.quantity}x {formatCurrencyFromCents(item.price)}
            </Text>
            <Text>
              Total: {formatCurrencyFromCents(item.quantity * item.price)}
            </Text>
          </View>
        ))}

        <View style={styles.dashedLine}></View>

        {/* Total e Pagamento */}
        <Text style={styles.boldText}>
          Total: {formatCurrencyFromCents(totalPrice)}
        </Text>
        <Text>
          Pagamento:{" "}
          {paymentTypeTranslation[receipt.orderPaymentType ?? ""] ||
            "Não informado"}
        </Text>
        <Text>
          Status:{" "}
          {paymentStatusTranslations[receipt.orderPaymentStatus ?? ""] ||
            "Não informado"}
        </Text>
      </Page>
    </Document>
  );
};

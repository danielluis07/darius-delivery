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
                  Preview
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
  page: { padding: 20, fontSize: 10, fontFamily: "Courier" },
  section: { marginBottom: 10 },
  header: { textAlign: "center", fontSize: 16, fontWeight: "bold" },
  subheader: { textAlign: "center", fontSize: 10 },
  dashedLine: { borderBottom: "1px dashed black", marginVertical: 5 },
  boldText: { fontWeight: "bold" },
  flexRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
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
  return (
    <Document>
      <Page size="A6" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.header}>Nome da Loja</Text>
          <Text style={styles.subheader}>(11) 0000-0000</Text>
        </View>

        <View style={styles.flexRow}>
          <Text style={[styles.boldText, { fontSize: 12 }]}>Pedido</Text>
          <Text style={[styles.boldText, { fontSize: 12 }]}>
            nº {receipt.number}
          </Text>
        </View>
        <Text>Origem: Online</Text>
        <View style={styles.dashedLine}></View>

        <Text>Cliente: {receipt.customerName}</Text>
        <Text>Tel: {receipt.customerPhone}</Text>
        <Text>
          Endereço: {receipt.customerStreet} - {receipt.customerNeighborhood} -{" "}
          {receipt.customerCity} - {receipt.customerState}
        </Text>

        <View style={styles.dashedLine}></View>
        <Text style={styles.boldText}>Produtos</Text>
        <View style={styles.dashedLine}></View>
        {receipt.orderItems.map((item, index) => (
          <View key={index} style={styles.productRow}>
            <View>
              <Text style={styles.boldText}>{item.productName}</Text>
              <Text>
                {item.quantity}x {formatCurrencyFromCents(item.price)}
              </Text>
            </View>
            <Text style={styles.boldText}>
              {formatCurrencyFromCents(item.quantity * item.price)}
            </Text>
          </View>
        ))}

        <View style={styles.dashedLine}></View>
        <View style={styles.flexRow}>
          <Text style={[styles.boldText, { fontSize: 12 }]}>Total</Text>
          <Text style={[styles.boldText, { fontSize: 12 }]}>
            {formatCurrencyFromCents(totalPrice)}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text>Forma de Pagamento</Text>
          <Text>
            {paymentTypeTranslation[receipt.orderPaymentType ?? ""] ||
              "Não informado"}
          </Text>
        </View>
        <View style={styles.flexRow}>
          <Text>Status do Pagamento</Text>
          <Text>
            {paymentStatusTranslations[receipt.orderPaymentStatus ?? ""] ||
              "Não informado"}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

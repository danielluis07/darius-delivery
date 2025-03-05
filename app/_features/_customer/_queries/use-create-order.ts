import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { usePixModal } from "@/hooks/use-pix-dialog";

type RequestTypeCashWebsite = InferRequestType<
  typeof client.api.orders.payment.website.$post
>["json"];

type SuccessResponseCashWebsite = {
  order: { id: string };
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
  qrCode: {
    encodedImage: string;
    expirationDate: string | number;
    payload: string;
  };
};

export const useCreateCashWebsiteOrder = () => {
  const { openModal } = usePixModal();
  const mutation = useMutation<
    SuccessResponseCashWebsite,
    Error,
    RequestTypeCashWebsite
  >({
    mutationFn: async (json) => {
      const res = await client.api.orders.payment.website.$post({ json });
      const data = await res.json();

      if ("error" in data) {
        throw new Error(data.error || "Unknown error from API");
      }

      return data as SuccessResponseCashWebsite;
    },
    onSuccess: (data) => {
      toast.success("Pedido feito com sucesso!");

      console.log(data);

      if (!data.payment.creditCard) {
        openModal(data.qrCode);
      }
    },
    onError: (error) => {
      toast.error(`Houve um erro ao fazer o pedido! ${error.message}`);
    },
  });

  return mutation;
};

type ResponseTypeCashOnDelivery = InferResponseType<
  typeof client.api.orders.payment.ondelivery.$post
>;
type RequestTypeCashOnDelivery = InferRequestType<
  typeof client.api.orders.payment.ondelivery.$post
>["json"];

export const useCreateCashOnDeliveryOrder = () => {
  const mutation = useMutation<
    ResponseTypeCashOnDelivery,
    Error,
    RequestTypeCashOnDelivery
  >({
    mutationFn: async (json) => {
      const res = await client.api.orders.payment.ondelivery.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Pedido feito com sucesso!");
    },
    onError: () => {
      toast.error("Houve um erro ao fazer o pedido!");
    },
  });

  return mutation;
};

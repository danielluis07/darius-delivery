import { InferRequestType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { usePixModal } from "@/hooks/use-pix-dialog";
import { useRouter } from "next/navigation";

type RequestTypeCashWebsite = InferRequestType<
  typeof client.api.orders.payment.website.$post
>["json"];

type SuccessResponseCashWebsite = {
  order?: { id: string };
  paymentMethod?: "PIX" | "CREDIT_CARD";
  payment?: {
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
  qrCode?: {
    encodedImage: string;
    expirationDate: string | number;
    payload: string;
  };
  dailyNumber?: number;
  totalPrice?: number;
  deliveryDeadline?: number | null;
  status?: string;
  paymentStatus?: string;
};

export const useCreateCashWebsiteOrder = (domain: string) => {
  const router = useRouter();
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

      const orderData = data;

      if (orderData.paymentMethod === "PIX" && data.qrCode) {
        openModal(data.qrCode);
        return;
      }

      const isDev = process.env.NODE_ENV === "development";
      const baseUrl = isDev ? `http://localhost:3000` : "";
      const domainPath = isDev ? `/${domain}` : "";
      const redirectUrl = `${baseUrl}${domainPath}/payment-confirmation?dailyNumber=${orderData.dailyNumber}&totalPrice=${orderData.totalPrice}&status=${orderData.status}&paymentStatus=${orderData.paymentStatus}&deliveryDeadline=${orderData.deliveryDeadline}`;

      router.push(redirectUrl);
    },
    onError: (error) => {
      toast.error(`Houve um erro ao fazer o pedido! ${error.message}`);
    },
  });

  return mutation;
};

type ResponseTypeCashOnDelivery = {
  data: {
    dailyNumber: number;
    totalPrice: number;
    deliveryDeadline: number | null;
    status: string;
    paymentStatus: string;
  };
};
type RequestTypeCashOnDelivery = InferRequestType<
  typeof client.api.orders.payment.ondelivery.$post
>["json"];

export const useCreateCashOnDeliveryOrder = (domain: string) => {
  const router = useRouter();
  const mutation = useMutation<
    ResponseTypeCashOnDelivery,
    Error,
    RequestTypeCashOnDelivery
  >({
    mutationFn: async (json) => {
      const res = await client.api.orders.payment.ondelivery.$post({ json });
      const data = await res.json();

      if ("error" in data) {
        throw new Error(data.error || "Unknown error from API");
      }

      return data as ResponseTypeCashOnDelivery;
    },
    onSuccess: (data) => {
      toast.success("Pedido feito com sucesso!");

      const {
        dailyNumber,
        totalPrice,
        status,
        paymentStatus,
        deliveryDeadline,
      } = data.data;

      const isDev = process.env.NODE_ENV === "development";
      const baseUrl = isDev ? `http://localhost:3000` : "";
      const domainPath = isDev ? `/${domain}` : "";
      const redirectUrl = `${baseUrl}${domainPath}/payment-confirmation?dailyNumber=${dailyNumber}&totalPrice=${totalPrice}&status=${status}&paymentStatus=${paymentStatus}&deliveryDeadline=${deliveryDeadline}`;

      router.push(redirectUrl);
    },
    onError: () => {
      toast.error("Houve um erro ao fazer o pedido!");
    },
  });

  return mutation;
};

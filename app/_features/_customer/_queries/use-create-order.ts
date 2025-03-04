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
  payment: string;
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
      openModal(data.qrCode);
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

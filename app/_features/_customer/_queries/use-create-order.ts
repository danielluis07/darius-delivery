import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseTypeCashWebsite = InferResponseType<
  typeof client.api.orders.payment.website.$post
>;
type RequestTypeCashWebsite = InferRequestType<
  typeof client.api.orders.payment.website.$post
>["json"];

export const useCreateCashWebsiteOrder = () => {
  const mutation = useMutation<
    ResponseTypeCashWebsite,
    Error,
    RequestTypeCashWebsite
  >({
    mutationFn: async (json) => {
      const res = await client.api.orders.payment.website.$post({ json });
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

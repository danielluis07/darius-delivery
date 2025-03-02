import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.orders.customer.$post>;
type RequestType = InferRequestType<
  typeof client.api.orders.customer.$post
>["json"];

export const useCreateOrder = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.orders.customer.$post({ json });
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

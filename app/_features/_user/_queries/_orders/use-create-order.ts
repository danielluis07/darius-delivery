import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.orders.$post>;
type RequestType = InferRequestType<typeof client.api.orders.$post>["json"];

export const useCreateOrder = (storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.orders.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Pedido criado com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["orders", storeId],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao criar o pedido!");
    },
  });

  return mutation;
};

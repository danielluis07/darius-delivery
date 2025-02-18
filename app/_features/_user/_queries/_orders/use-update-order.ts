import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders)[":orderId"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.orders)[":orderId"]["$patch"]
>["json"];

export const useUpdateOrder = (orderId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.orders[":orderId"]["$patch"]({
        param: { orderId },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Pedido editado!");
      queryClient.invalidateQueries({ queryKey: ["orders", orderId] });
    },
    onError: () => {
      toast.error("Houve um erro editar o pedido!");
    },
  });

  return mutation;
};

import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.ordersettings)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.ordersettings)[":id"]["$patch"]
>["json"];

export const useUpdateOrderSettings = (
  id: string | undefined,
  storeId: string
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.ordersettings[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Tempo atualizado!");
      queryClient.invalidateQueries({ queryKey: ["orders-settings", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro editar o pedido!");
    },
  });

  return mutation;
};

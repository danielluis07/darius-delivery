import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.deliveryareas)[":id"]["$delete"]
>;

export const useDeleteDeliveryArea = (id: string, storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.deliveryareas[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Área de entrega deletada!");
      queryClient.invalidateQueries({ queryKey: ["delivery-areas", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar a área de entrega!");
    },
  });

  return mutation;
};

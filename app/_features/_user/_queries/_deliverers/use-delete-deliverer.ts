import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.deliverers)[":id"]["$delete"]
>;

export const useDeleteDeliverer = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.deliverers[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Entregador deletado!");
      queryClient.invalidateQueries({ queryKey: ["deliverers"] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o entregador!");
    },
  });

  return mutation;
};

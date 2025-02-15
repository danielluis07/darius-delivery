import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.customers)[":id"]["$delete"]
>;

export const useDeleteCustomer = (id?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.customers[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Cliente deletado!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o cliente!");
    },
  });

  return mutation;
};

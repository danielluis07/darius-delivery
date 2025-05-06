import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.combos)[":id"]["$delete"]
>;

type Combos = InferResponseType<
  (typeof client.api.combos.store)[":storeId"]["$get"],
  200
>["data"];

export const useDeleteCombo = (id: string, storeId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.combos[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Combo deletado!");
      queryClient.setQueryData(
        ["combos", storeId],
        (oldData: Combos | undefined) => {
          return oldData ? oldData.filter((combo) => combo.id !== id) : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["combos", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o combo!");
    },
  });

  return mutation;
};

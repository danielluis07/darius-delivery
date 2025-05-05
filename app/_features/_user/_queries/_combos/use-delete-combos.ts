import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.combos)[":id"]["$delete"]
>;

type Combo = InferResponseType<
  (typeof client.api.combos.store)[":storeId"]["$get"],
  200
>["data"];

export const useDeleteCombos = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.combos.delete.$post({
        json: { ids },
      });
      return await res.json();
    },
    onSuccess: (_data, ids) => {
      toast.success("Combos deletados com sucesso!");
      queryClient.setQueryData(
        ["combos", storeId],
        (oldData: Combo | undefined) => {
          return oldData
            ? oldData.filter((combo) => !ids.includes(combo.id))
            : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["combos", storeId] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os combos!");
      console.error(error);
    },
  });

  return mutation;
};

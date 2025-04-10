import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.combos)[":id"]["$delete"]
>;

type Combos = InferResponseType<
  (typeof client.api.combos.user)[":userId"]["$get"],
  200
>["data"];

export const useDeleteCombo = (id: string, userId: string | undefined) => {
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
        ["combos", userId],
        (oldData: Combos | undefined) => {
          return oldData ? oldData.filter((combo) => combo.id !== id) : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["combos", userId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o combo!");
    },
  });

  return mutation;
};

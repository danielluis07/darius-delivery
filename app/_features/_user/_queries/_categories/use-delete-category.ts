import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>;

type Categories = InferResponseType<
  (typeof client.api.categories.user)[":userId"]["$get"],
  200
>["data"];

export const useDeleteCategory = (id: string, userId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.categories[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Categoria deletada!");
      queryClient.setQueryData(
        ["categories", userId],
        (oldData: Categories | undefined) => {
          return oldData
            ? oldData.filter((category) => category.id !== id)
            : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar a categoria!");
    },
  });

  return mutation;
};

import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.categories)[":id"]["$delete"]
>;

type Category = InferResponseType<
  (typeof client.api.categories.user)[":userId"]["$get"],
  200
>["data"];

export const useDeleteCategories = (userId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.categories.delete.$post({
        json: { ids },
      });
      return await res.json();
    },
    onSuccess: (_data, ids) => {
      toast.success("Categorias deletadas com sucesso!");
      queryClient.setQueryData(
        ["categories", userId],
        (oldData: Category | undefined) => {
          return oldData
            ? oldData.filter((category) => !ids.includes(category.id))
            : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["categories", userId] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar as categorias!");
      console.error(error);
    },
  });

  return mutation;
};

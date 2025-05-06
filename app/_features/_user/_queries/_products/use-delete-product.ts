import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$delete"]
>;

type Products = InferResponseType<
  (typeof client.api.products.store)[":storeId"]["$get"],
  200
>["data"];

export const useDeleteProduct = (id: string, storeId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error>({
    mutationFn: async () => {
      const res = await client.api.products[":id"]["$delete"]({
        param: { id },
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Produto deletado!");
      queryClient.setQueryData(
        ["products", storeId],
        (oldData: Products | undefined) => {
          return oldData ? oldData.filter((product) => product.id !== id) : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o produto!");
    },
  });

  return mutation;
};

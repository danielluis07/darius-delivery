import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$delete"]
>;

type Products = InferResponseType<
  (typeof client.api.products.user)[":userId"]["$get"],
  200
>["data"];

export const useDeleteProduct = (id: string, userId: string | undefined) => {
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
        ["products", userId],
        (oldData: Products | undefined) => {
          return oldData ? oldData.filter((product) => product.id !== id) : [];
        }
      );
      queryClient.invalidateQueries({ queryKey: ["products", userId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar o produto!");
    },
  });

  return mutation;
};

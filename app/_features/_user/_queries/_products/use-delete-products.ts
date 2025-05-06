import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products)[":id"]["$delete"]
>;

type Product = InferResponseType<
  (typeof client.api.products.store)[":storeId"]["$get"],
  200
>["data"];

export const useDeleteProducts = (storeId: string | undefined) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.products.delete.$post({
        json: { ids }, // Envia o array de IDs no corpo da requisição
      });
      return await res.json();
    },
    onSuccess: (_data, ids) => {
      // Adiciona 'ids' como segundo argumento
      toast.success("Produtos deletados com sucesso!");
      // Atualiza o cache removendo os produtos deletados
      queryClient.setQueryData(
        ["products", storeId],
        (oldData: Product | undefined) => {
          return oldData
            ? oldData.filter((product) => !ids.includes(product.id))
            : [];
        }
      );
      // Invalida a query para sincronizar com o backend
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os produtos!");
      console.error(error);
    },
  });

  return mutation;
};

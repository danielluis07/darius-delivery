import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.additionals)[":id"]["$delete"]
>;

type Additionals = InferResponseType<
  (typeof client.api.additionals.store)[":storeId"]["$get"],
  200
>["data"];

export const useDeleteAdditionals = (storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const res = await client.api.additionals.delete.$post({
        json: { ids }, // Envia o array de IDs no corpo da requisição
      });
      return await res.json();
    },
    onSuccess: (_data, ids) => {
      // Adiciona 'ids' como segundo argumento
      toast.success("Adicionais deletados com sucesso!");
      // Atualiza o cache removendo os adicionais deletados
      queryClient.setQueryData(
        ["additionals", storeId],
        (oldData: Additionals | undefined) => {
          return oldData
            ? oldData.filter((additional) => !ids.includes(additional.id))
            : [];
        }
      );
      // Invalida a query para sincronizar com o backend
      queryClient.invalidateQueries({ queryKey: ["additionals", storeId] });
    },
    onError: (error) => {
      toast.error("Houve um erro ao deletar os adicionais!");
      console.error(error);
    },
  });

  return mutation;
};

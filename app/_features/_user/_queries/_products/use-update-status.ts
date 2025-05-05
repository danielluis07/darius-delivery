import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.products.activate)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.products.activate)[":id"]["$patch"]
>["json"];

export const useUpdateProductStatus = (id: string, storeId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.products.activate[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["products", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro mudar o status do produto!");
    },
  });

  return mutation;
};

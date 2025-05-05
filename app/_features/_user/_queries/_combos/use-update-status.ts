import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.combos.activate)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.combos.activate)[":id"]["$patch"]
>["json"];

export const useUpdateComboStatus = (id: string, storeId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.combos.activate[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Combo atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["combos", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro mudar o status do combo!");
    },
  });

  return mutation;
};

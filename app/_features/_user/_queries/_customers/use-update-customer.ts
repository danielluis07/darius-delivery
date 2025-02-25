import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.customers)[":userId"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.customers)[":userId"]["$patch"]
>["json"];

export const useUpdateCustomer = (userId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.customers[":userId"]["$patch"]({
        param: { userId },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Cliente ataulizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["customers", userId] });
    },
    onError: () => {
      toast.error("Houve um erro atualizar as informações do cliente!");
    },
  });

  return mutation;
};

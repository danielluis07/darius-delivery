import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.deliverers)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.deliverers)[":id"]["$patch"]
>["json"];

export const useUpdateDeliverer = (id: string, storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliverers[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Entregador atualizado!");
      queryClient.invalidateQueries({
        queryKey: ["deliverers", storeId],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao atualizar o entregador!");
    },
  });

  return mutation;
};

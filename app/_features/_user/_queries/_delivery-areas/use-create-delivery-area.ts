import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.deliveryareas.$post>;
type RequestType = InferRequestType<
  typeof client.api.deliveryareas.$post
>["json"];

export const useCreateDeliveryArea = (storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliveryareas.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Área de entrega criada!");
      queryClient.invalidateQueries({
        queryKey: ["delivery-areas", storeId],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao criar a área de entrega!");
    },
  });

  return mutation;
};

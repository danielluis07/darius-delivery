import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.deliverers.$post>;
type RequestType = InferRequestType<typeof client.api.deliverers.$post>["json"];

export const useCreateDeliverer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliverers.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Entregador criado!");
      queryClient.invalidateQueries({
        queryKey: ["deliverers"],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao criar o entregador!");
    },
  });

  return mutation;
};

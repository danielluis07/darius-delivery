import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.customers.$post>;
type RequestType = InferRequestType<typeof client.api.customers.$post>["json"];

export const useCreateCustomer = (onClose: () => void) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.customers.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Cliente criado!");
      queryClient.invalidateQueries({
        queryKey: ["customers"],
      });
      onClose();
    },
    onError: () => {
      toast.error("Houve um erro ao criar o cliente!");
    },
  });

  return mutation;
};

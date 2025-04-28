import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.additionals.$post>;
type RequestType = InferRequestType<
  typeof client.api.additionals.$post
>["json"];

export const useCreateAdditional = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.additionals.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Adicional criado!");
      queryClient.invalidateQueries({
        queryKey: ["additionals"],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao criar o adicional!");
    },
  });

  return mutation;
};

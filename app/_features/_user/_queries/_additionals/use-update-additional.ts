import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.additionals)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.additionals)[":id"]["$patch"]
>["json"];

export const useUpdateAdditional = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.additionals[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Adicional atualizado!");
      queryClient.invalidateQueries({
        queryKey: ["additionals"],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao atualizar o adicional!");
    },
  });

  return mutation;
};

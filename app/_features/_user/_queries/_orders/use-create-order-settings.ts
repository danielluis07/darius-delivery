import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.ordersettings.$post>;
type RequestType = InferRequestType<
  typeof client.api.ordersettings.$post
>["json"];

export const useCreateOrderSettings = (userId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.ordersettings.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Tempos definidos com sucesso!");
      queryClient.invalidateQueries({
        queryKey: ["orders-settings", userId],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao inserir od dados!");
    },
  });

  return mutation;
};

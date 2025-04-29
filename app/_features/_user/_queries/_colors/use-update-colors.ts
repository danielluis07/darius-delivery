import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.colors)[":id"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.colors)[":id"]["$patch"]
>["json"];

export const useUpdateColors = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.colors[":id"]["$patch"]({
        param: { id },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Cores atualizado!");
      queryClient.invalidateQueries({
        queryKey: ["colors"],
      });
    },
    onError: () => {
      toast.error("Houve um erro ao atualizar as cores!");
    },
  });

  return mutation;
};

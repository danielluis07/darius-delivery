import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.admin.usercomission)[":userId"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.usercomission)[":userId"]["$patch"]
>["json"];

export const useUpdateUserComission = (userId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.admin.usercomission[":userId"]["$patch"]({
        param: { userId },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Comissão atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["active-users"] });
    },
    onError: () => {
      toast.error("Houve um erro ao atualizar a comissão do lojista!");
    },
  });

  return mutation;
};

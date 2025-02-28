import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.admin.userstatus)[":userId"]["$patch"]
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.userstatus)[":userId"]["$patch"]
>["json"];

export const useUpdateUserStatus = (userId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.admin.userstatus[":userId"]["$patch"]({
        param: { userId },
        json,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Lojista atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast.error("Houve um erro mudar o status do lojista!");
    },
  });

  return mutation;
};

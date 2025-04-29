import { InferRequestType, InferResponseType } from "hono";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<typeof client.api.colors.$post>;
type RequestType = InferRequestType<typeof client.api.colors.$post>["json"];

export const useCreateColors = () => {
  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.colors.$post({ json });
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Cores definidas!");
    },
    onError: () => {
      toast.error("Houve um erro ao definir as cores!");
    },
  });

  return mutation;
};

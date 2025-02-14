import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.deliverers)["delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.deliverers)["delete"]["$post"]
>["json"];

type Data = InferResponseType<
  (typeof client.api.deliverers.user)[":userId"]["$get"],
  200
>["data"];
export const useDeleteDeliverers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliverers["delete"]["$post"]({
        json,
      });
      return await res.json();
    },
    onSuccess: (response, variables) => {
      // Get current cache data
      const currentData = queryClient.getQueryData(["deliverers"]) as Data;

      // If the number of IDs being deleted matches the total number of items
      if (variables.ids?.length === currentData?.length) {
        queryClient.setQueryData(["deliverers"], []);
      }

      toast.success("Entregadores deletados!");
      queryClient.invalidateQueries({ queryKey: ["deliverers"] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar os entregadores!");
    },
  });

  return mutation;
};

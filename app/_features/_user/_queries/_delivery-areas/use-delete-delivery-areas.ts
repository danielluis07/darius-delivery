import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.deliveryareas)["delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.deliveryareas)["delete"]["$post"]
>["json"];

export const useDeleteDeliveryAreas = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliveryareas["delete"]["$post"]({
        json,
      });
      return await res.json();
    },
    onSuccess: (response, variables) => {
      // Get current cache data
      const currentData = queryClient.getQueryData(["delivery-areas"]) as any[];

      // If the number of IDs being deleted matches the total number of items
      if (variables.ids?.length === currentData?.length) {
        queryClient.setQueryData(["delivery-areas"], []);
      }

      toast.success("Áreas de entrega deletadas!");
      queryClient.invalidateQueries({ queryKey: ["delivery-areas"] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar as áreas de entrega!");
    },
  });

  return mutation;
};

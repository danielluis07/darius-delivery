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

type Data = InferResponseType<
  (typeof client.api.deliveryareas.store)[":storeId"]["$get"],
  200
>["data"];
export const useDeleteDeliveryAreas = (storeId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.deliveryareas["delete"]["$post"]({
        json,
      });
      return await res.json();
    },
    onSuccess: (_data, variables) => {
      // Get current cache data
      const currentData = queryClient.getQueryData([
        "delivery-areas",
        storeId,
      ]) as Data;

      // If the number of IDs being deleted matches the total number of items
      if (variables.ids?.length === currentData?.length) {
        queryClient.setQueryData(["delivery-areas", storeId], []);
      }

      toast.success("Áreas de entrega deletadas!");
      queryClient.invalidateQueries({ queryKey: ["delivery-areas", storeId] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar as áreas de entrega!");
    },
  });

  return mutation;
};

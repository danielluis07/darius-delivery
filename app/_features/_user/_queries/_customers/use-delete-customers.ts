import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.customers)["delete"]["$post"]
>;
type RequestType = InferRequestType<
  (typeof client.api.customers)["delete"]["$post"]
>["json"];

type Data = InferResponseType<
  (typeof client.api.customers.store)[":storeId"]["$get"],
  200
>["data"];
export const useDeleteCustomers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const res = await client.api.customers["delete"]["$post"]({
        json,
      });
      return await res.json();
    },
    onSuccess: (response, variables) => {
      // Get current cache data
      const currentData = queryClient.getQueryData(["customers"]) as Data;

      // If the number of IDs being deleted matches the total number of items
      if (variables.ids?.length === currentData?.length) {
        queryClient.setQueryData(["customers"], []);
      }

      toast.success("Clientes deletados!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => {
      toast.error("Houve um erro ao deletar os clientes!");
    },
  });

  return mutation;
};

import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  typeof client.api.orders.assignorders.$post
>;
type RequestType = InferRequestType<
  typeof client.api.orders.assignorders.$post
>["json"];

type Orders = InferResponseType<
  (typeof client.api.orders.store)[":storeId"]["$get"],
  200
>["data"];

export const useAssignDeliverers = (storeId: string) => {
  const queryClient = useQueryClient();
  const mutation = useMutation<
    ResponseType,
    Error,
    RequestType,
    { previousOrders?: Orders }
  >({
    mutationFn: async (json) => {
      const res = await client.api.orders.assignorders.$post({
        json,
      });
      return await res.json();
    },

    onMutate: async (json) => {
      queryClient.cancelQueries({ queryKey: ["routing-orders", storeId] });

      const previousOrders = queryClient.getQueryData<Orders>([
        "orders",
        storeId,
      ]);

      queryClient.setQueryData(
        ["routing-orders", storeId],
        (oldOrders: Orders | undefined) => {
          if (!oldOrders) return [];

          const updatedOrders = oldOrders.map((order) =>
            json.ordersIds.includes(order.id)
              ? { ...order, delivererId: json.delivererId }
              : order
          );

          const remainingOrders = updatedOrders.filter(
            (order) => order.delivererId === null
          );
          return remainingOrders.length > 0 ? remainingOrders : [];
        }
      );

      return { previousOrders };
    },

    onError: (error, _, context) => {
      toast.error("Houve um erro ao enviar os pedidos!");

      if (context?.previousOrders) {
        queryClient.setQueryData(["orders", storeId], context.previousOrders);
      }
    },

    onSuccess: () => {
      toast.success("Pedidos enviados!");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["deliverers", storeId] });
      queryClient.invalidateQueries({ queryKey: ["routing-orders", storeId] });
    },
  });

  return mutation;
};

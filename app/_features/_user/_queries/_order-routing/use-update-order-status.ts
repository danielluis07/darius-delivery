import { InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.orders.status)[":orderId"]["$patch"]
>;

type Orders = InferResponseType<
  (typeof client.api.orders.user)[":userId"]["$get"],
  200
>["data"];

export const useUpdateOrderStatus = (userId?: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    ResponseType,
    Error,
    {
      orderId: string;
      status:
        | "ACCEPTED"
        | "PREPARING"
        | "FINISHED"
        | "IN_TRANSIT"
        | "DELIVERED"
        | "CANCELLED"
        | "WITHDRAWN"
        | "CONSUME_ON_SITE";
    }
  >({
    mutationFn: async ({ orderId, status }) => {
      const res = await client.api.orders.status[":orderId"]["$patch"]({
        param: { orderId },
        json: { status },
      });
      return await res.json();
    },
    onSuccess: (_, { orderId, status }) => {
      toast.success("Pedido atualizado!");
      queryClient.setQueryData(
        ["routing-orders", userId],
        (oldData: Orders) => {
          if (!oldData) return oldData;
          return oldData.map((order) =>
            order.id === orderId ? { ...order, status } : order
          );
        }
      );
      queryClient.invalidateQueries({ queryKey: ["orders-receipts", userId] });
    },
    onError: () => {
      toast.error("Houve um erro ao atualizar o pedido!");
    },
  });

  return mutation;
};

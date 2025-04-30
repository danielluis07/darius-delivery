import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetOrdersReceipts = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["orders-receipts", userId],
    queryFn: async () => {
      const res = await client.api.orders.ordersreceipts.user[":userId"].$get({
        param: { userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

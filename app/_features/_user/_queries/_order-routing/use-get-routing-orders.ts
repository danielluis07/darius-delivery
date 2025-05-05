import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetRoutingOrders = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["routing-orders", storeId],
    queryFn: async () => {
      const res = await client.api.orders.routing.store[":storeId"].$get({
        param: { storeId },
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

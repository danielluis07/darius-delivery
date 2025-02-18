import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetOrder = (orderId: string) => {
  const query = useQuery({
    enabled: !!orderId,
    queryKey: ["orders", orderId],
    queryFn: async () => {
      const res = await client.api.orders[":orderId"].$get({
        param: { orderId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch order");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

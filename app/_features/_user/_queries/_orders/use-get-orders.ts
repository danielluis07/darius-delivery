import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetOrders = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await client.api.orders.user[":userId"].$get({
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

import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetOrdersSettings = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["orders-settings", storeId],
    queryFn: async () => {
      const res = await client.api.ordersettings.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders settings");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

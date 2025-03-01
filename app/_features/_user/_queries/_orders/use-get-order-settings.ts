import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetOrdersSettings = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["orders-settings", userId],
    queryFn: async () => {
      const res = await client.api.ordersettings.user[":userId"].$get({
        param: { userId },
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

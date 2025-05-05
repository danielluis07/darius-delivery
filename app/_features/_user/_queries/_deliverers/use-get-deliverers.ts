import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetDeliverers = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["deliverers", storeId],
    queryFn: async () => {
      const res = await client.api.deliverers.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch deliverers");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

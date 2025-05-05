import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetDeliveryAreas = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["delivery-areas", storeId],
    queryFn: async () => {
      const res = await client.api.deliveryareas.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch delivery area");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

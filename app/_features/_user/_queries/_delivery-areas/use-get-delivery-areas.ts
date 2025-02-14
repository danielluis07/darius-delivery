import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetDeliveryAreas = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["delivery-areas"],
    queryFn: async () => {
      const res = await client.api.deliveryareas.user[":userId"].$get({
        param: { userId },
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

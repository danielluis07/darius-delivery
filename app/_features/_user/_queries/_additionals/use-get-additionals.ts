import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetAdditionals = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["additionals", storeId],
    queryFn: async () => {
      const res = await client.api.additionals.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch additionals");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

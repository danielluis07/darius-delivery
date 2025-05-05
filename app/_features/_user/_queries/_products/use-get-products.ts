import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["products", storeId],
    queryFn: async () => {
      const res = await client.api.products.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

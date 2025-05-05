import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategories = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["categories", storeId],
    queryFn: async () => {
      const res = await client.api.categories.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

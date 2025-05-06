import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = (
  storeId?: string,
  categoryId?: string | null
) => {
  const query = useQuery({
    enabled: !!storeId, // the query will only be executed if we have the storeId
    queryKey: ["products", { storeId, categoryId }],
    queryFn: async () => {
      const res = await client.api.products.customer.store[":storeId"][
        ":categoryId"
      ].$get({
        param: { storeId, categoryId: categoryId || "" },
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

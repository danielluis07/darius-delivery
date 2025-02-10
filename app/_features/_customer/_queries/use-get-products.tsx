import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = (userId?: string, categoryId?: string | null) => {
  const query = useQuery({
    enabled: !!userId, // the query will only be executed if we have the userId
    queryKey: ["products", { userId, categoryId }],
    queryFn: async () => {
      const res = await client.api.products.customer[":userId"][
        ":categoryId"
      ].$get({
        param: { userId, categoryId: categoryId || "" },
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

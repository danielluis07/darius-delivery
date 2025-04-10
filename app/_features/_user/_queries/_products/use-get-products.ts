import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetProducts = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["products", userId],
    queryFn: async () => {
      const res = await client.api.products.user[":userId"].$get({
        param: { userId },
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

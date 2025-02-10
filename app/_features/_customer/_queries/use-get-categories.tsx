import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategories = (userId?: string) => {
  const query = useQuery({
    enabled: !!userId, // the query will only be executed if we have the userId
    queryKey: ["categories", { userId }],
    queryFn: async () => {
      const res = await client.api.categories[":userId"].$get({
        param: { userId },
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

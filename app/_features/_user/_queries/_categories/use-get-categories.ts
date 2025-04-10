import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCategories = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["categories", userId],
    queryFn: async () => {
      const res = await client.api.categories.user[":userId"].$get({
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

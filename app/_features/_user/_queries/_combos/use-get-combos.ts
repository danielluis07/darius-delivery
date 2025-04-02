import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCombos = (userId?: string) => {
  const query = useQuery({
    enabled: !!userId, // the query will only be executed if we have the userId
    queryKey: ["combos", { userId }],
    queryFn: async () => {
      const res = await client.api.combos.user[":userId"].$get({
        param: { userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch combos");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

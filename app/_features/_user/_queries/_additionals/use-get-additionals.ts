import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetAdditionals = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["additionals", userId],
    queryFn: async () => {
      const res = await client.api.additionals.user[":userId"].$get({
        param: { userId },
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

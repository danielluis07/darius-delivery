import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetDeliverers = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["deliverers"],
    queryFn: async () => {
      const res = await client.api.deliverers.user[":userId"].$get({
        param: { userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch deliverers");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

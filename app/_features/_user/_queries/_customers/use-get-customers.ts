import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCustomers = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["customers", userId],
    queryFn: async () => {
      const res = await client.api.customers.user[":userId"].$get({
        param: { userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch customers");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

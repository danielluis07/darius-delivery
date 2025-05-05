import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetCustomers = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["customers", storeId],
    queryFn: async () => {
      const res = await client.api.customers.store[":storeId"].$get({
        param: { storeId },
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

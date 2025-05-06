import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetEmployees = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["employees", storeId],
    queryFn: async () => {
      const res = await client.api.users.employees.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch employees");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

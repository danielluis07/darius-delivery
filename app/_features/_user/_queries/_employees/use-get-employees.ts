import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetEmployees = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["employees", userId],
    queryFn: async () => {
      const res = await client.api.users.employees[":userId"].$get({
        param: { userId },
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

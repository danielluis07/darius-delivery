import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetActiveUsers = () => {
  const query = useQuery({
    queryKey: ["active-users"],
    queryFn: async () => {
      const res = await client.api.admin.users.active.$get();

      if (!res.ok) {
        throw new Error("Failed to fetch active users");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

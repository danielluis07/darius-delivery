import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetAffiliates = () => {
  const query = useQuery({
    queryKey: ["affiliates"],
    queryFn: async () => {
      const res = await client.api.admin.affiliates.$get();

      if (!res.ok) {
        throw new Error("Failed to fetch affiliates");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

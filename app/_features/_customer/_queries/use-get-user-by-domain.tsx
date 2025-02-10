import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetUserByDomain = (subdomain: string) => {
  const query = useQuery({
    enabled: !!subdomain, // the query will only be executed if we have the userId
    queryKey: ["user-by-domain", { subdomain }],
    queryFn: async () => {
      const res = await client.api.customizations.user[":subdomain"].$get({
        param: { subdomain },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

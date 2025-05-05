/* import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetUserByDomain = (domain: string) => {
  const query = useQuery({
    enabled: !!domain, // the query will only be executed if we have the userId
    queryKey: ["user-by-domain", { domain }],
    queryFn: async () => {
      const res = await client.api.customizations.user[":domain"].$get({
        param: { domain },
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
 */

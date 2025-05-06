import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetTemplateCombos = (storeId?: string) => {
  const query = useQuery({
    enabled: !!storeId, // the query will only be executed if we have the userId
    queryKey: ["template-combos", storeId],
    queryFn: async () => {
      const res = await client.api.combos.template.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch combos");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

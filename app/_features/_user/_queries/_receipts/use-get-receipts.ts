import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetReceipts = (storeId: string) => {
  const query = useQuery({
    enabled: !!storeId,
    queryKey: ["receipts", storeId],
    queryFn: async () => {
      const res = await client.api.receipts.store[":storeId"].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch receipts");
      }

      const { data } = await res.json();
      return data;
    },
  });
  return query;
};

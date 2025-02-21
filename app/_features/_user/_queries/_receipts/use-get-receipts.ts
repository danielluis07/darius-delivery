import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetReceipts = (userId: string) => {
  const query = useQuery({
    enabled: !!userId,
    queryKey: ["receipts", userId],
    queryFn: async () => {
      const res = await client.api.receipts.user[":userId"].$get({
        param: { userId },
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

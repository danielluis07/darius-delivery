import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export const useGetOrdersPerDay = (storeId: string, dateRange?: DateRange) => {
  return useQuery({
    enabled: !!storeId && !!dateRange?.from && !!dateRange?.to,
    queryKey: ["orders-per-day", storeId, dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const formattedFrom = format(dateRange.from, "yyyy-MM-dd");
      const formattedTo = format(dateRange.to, "yyyy-MM-dd");

      const res = await client.api.orders.ordersperday.store[":storeId"].$get({
        param: { storeId },
        query: { from: formattedFrom, to: formattedTo },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch orders per day");
      }

      const { data } = await res.json();
      return data;
    },
  });
};

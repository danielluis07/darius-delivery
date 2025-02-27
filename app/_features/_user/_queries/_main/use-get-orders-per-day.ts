import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

export const useGetOrdersPerDay = (userId: string, dateRange?: DateRange) => {
  return useQuery({
    enabled: !!userId && !!dateRange?.from && !!dateRange?.to,
    queryKey: ["orders-per-day", userId, dateRange],
    queryFn: async () => {
      if (!dateRange?.from || !dateRange?.to) return [];

      const formattedFrom = format(dateRange.from, "yyyy-MM-dd");
      const formattedTo = format(dateRange.to, "yyyy-MM-dd");

      const res = await client.api.orders.ordersperday[":userId"].$get({
        param: { userId },
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

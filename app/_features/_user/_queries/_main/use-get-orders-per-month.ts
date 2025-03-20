import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetMonthlyOrdersByYear = (userId: string, year: string) => {
  return useQuery({
    enabled: !!userId && !!year,
    queryKey: ["monthly-orders", userId, year],
    queryFn: async () => {
      const res = await client.api.finances.monthlyorders[":userId"][
        ":year"
      ].$get({
        param: { userId, year },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch monthly orders");
      }

      const { data } = await res.json();

      // Criar um array de 12 meses inicializado com zero pedidos
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: (i + 1).toString().padStart(2, "0"), // "01", "02", ..., "12"
        totalOrders: 0,
      }));

      // Preencher os meses com os dados retornados
      data.forEach((item: { month: string; totalOrders: number }) => {
        const index = parseInt(item.month, 10) - 1;
        months[index].totalOrders = item.totalOrders;
      });

      return months;
    },
  });
};

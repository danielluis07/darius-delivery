import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetSubsByYear = (year: string) => {
  return useQuery({
    enabled: !!year,
    queryKey: ["monthly-subs", year],
    queryFn: async () => {
      const res = await client.api.admin.monthlysubs[":year"].$get({
        param: { year },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch monthly subs");
      }

      const { data } = await res.json();

      // Criar um array de 12 meses inicializado com zero pedidos
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: (i + 1).toString().padStart(2, "0"), // "01", "02", ..., "12"
        totalsubs: 0,
      }));

      // Preencher os meses com os dados retornados
      data.forEach((item: { month: string; totalsubs: number }) => {
        const index = parseInt(item.month, 10) - 1;
        months[index].totalsubs = item.totalsubs;
      });

      return months;
    },
  });
};

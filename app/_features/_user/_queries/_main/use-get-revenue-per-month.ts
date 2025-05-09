import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

type MonthSeriesData = {
  name: string;
  day10: number | null;
  day20: number | null;
  day30: number | null;
};

type ApiDailyProgressionResponse = {
  data: {
    previousMonthSeries: MonthSeriesData;
    currentMonthSeries: MonthSeriesData;
  };
};

export type DailyRevenueChartPoint = {
  dayLabel: string; // "Dia 10", "Dia 20", "Dia 30"
  previousMonth?: number | null; // dataKey para Recharts
  currentMonth?: number | null; // dataKey para Recharts
};

export const useGetDailyRevenueProgression = (storeId: string) => {
  return useQuery<DailyRevenueChartPoint[], Error>({
    enabled: !!storeId,
    queryKey: ["daily-revenue-progression", storeId],
    queryFn: async () => {
      // Substitua pela sua chamada de API real ao novo endpoint
      const res = await client.api.finances["revenue-daily-progression"].store[
        ":storeId"
      ].$get({
        param: { storeId },
      });

      if (!res.ok) {
        throw new Error("Falha ao buscar progressão diária de receita");
      }

      const apiResponse = (await res.json()) as ApiDailyProgressionResponse;
      const { previousMonthSeries, currentMonthSeries } = apiResponse.data;

      const transformedData: DailyRevenueChartPoint[] = [
        {
          dayLabel: "Dia 10",
          previousMonth: previousMonthSeries.day10,
          currentMonth: currentMonthSeries.day10,
        },
        {
          dayLabel: "Dia 20",
          previousMonth: previousMonthSeries.day20,
          currentMonth: currentMonthSeries.day20,
        },
        {
          dayLabel: "Dia 30",
          previousMonth: previousMonthSeries.day30,
          currentMonth: currentMonthSeries.day30,
        },
      ];

      return transformedData;
    },
  });
};

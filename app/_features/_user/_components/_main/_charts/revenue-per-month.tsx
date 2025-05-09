"use client";

import { Card } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDailyRevenueProgression } from "../../../_queries/_main/use-get-revenue-per-month";
import { formatCurrency } from "@/lib/utils";

const dailyProgressionChartConfig = {
  previousMonth: {
    label: "Mês Anterior",
    color: "#8884d8", // roxo azulado
  },
  currentMonth: {
    label: "Mês Atual",
    color: "#82ca9d", // verde claro
  },
};

const formatCurrencyValue = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);

export const RevenueComparisonChart = ({ storeId }: { storeId: string }) => {
  const { data, isLoading } = useGetDailyRevenueProgression(storeId);

  return (
    <Card className="w-full p-4 mt-10">
      {isLoading ? (
        <Skeleton className="w-full h-[300px] mt-10" />
      ) : (
        <ChartContainer
          config={dailyProgressionChartConfig}
          className="h-[400px] w-full">
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="colorCurr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#82ca9d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="dayLabel" />
            <YAxis tickFormatter={formatCurrencyValue} />
            <Tooltip
              formatter={(value: number) => formatCurrencyValue(value)}
            />

            <Legend />
            <Area
              type="monotone"
              dataKey="previousMonth"
              stroke="#8884d8"
              fill="url(#colorPrev)"
              name="Mês anterior"
            />
            <Area
              type="monotone"
              dataKey="currentMonth"
              stroke="#82ca9d"
              fill="url(#colorCurr)"
              name="Mês atual"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </Card>
  );
};

"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useGetOrdersPerDay } from "@/app/_features/_user/_queries/_main/use-get-orders-per-day";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, subDays } from "date-fns";

const chartConfig = {
  date: {
    label: "Data",
    color: "#2563eb",
  },
  count: {
    label: "Pedidos",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const OrdersPerDayChart = ({ userId }: { userId: string }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7), // 7 days ago
    to: addDays(new Date(), 1), // Tomorrow
  });

  const { data: orders, isLoading } = useGetOrdersPerDay(userId, dateRange);
  return (
    <Card className="w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold py-5 pl-5">
          Nº de pedidos (por dia)
        </h1>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-[500px] mt-10" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[500px] mt-10">
          <LineChart accessibilityLayer data={orders}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#8884d8"
              strokeWidth={2}
            />
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  );
};

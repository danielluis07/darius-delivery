"use client";

import { DateRangePicker } from "@/components/date-range-picker";
import { Card, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
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

export const OrdersPerDayChart = ({ storeId }: { storeId: string }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7), // 7 days ago
    to: addDays(new Date(), 1), // Tomorrow
  });

  const { data: orders, isLoading } = useGetOrdersPerDay(storeId, dateRange);
  return (
    <Card className="w-full">
      <div className="flex items-center justify-between">
        <CardTitle>Nº de pedidos (por dia)</CardTitle>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      {isLoading ? (
        <Skeleton className="w-full h-[300px] mt-10" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[320px]">
          <LineChart accessibilityLayer data={orders} className="mt-14">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
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

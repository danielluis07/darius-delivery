"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card } from "@/components/ui/card";

const chartData = [
  { date: "2024-02-01", sales: 120, revenue: 4500 },
  { date: "2024-02-02", sales: 150, revenue: 5200 },
  { date: "2024-02-03", sales: 90, revenue: 3800 },
  { date: "2024-02-04", sales: 200, revenue: 7200 },
  { date: "2024-02-05", sales: 180, revenue: 6700 },
];

const chartConfig = {
  sales: {
    label: "Vendas",
    color: "#2563eb",
  },
  revenue: {
    label: "Receita",
    color: "#82ca9d",
  },
} satisfies ChartConfig;

export const SalesRevenueChart = () => {
  return (
    <Card className="w-full mt-14">
      <h1 className="text-xl font-bold py-5">Vendas e Receita</h1>
      <ChartContainer config={chartConfig} className="h-[500px] w-full">
        <LineChart accessibilityLayer data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="sales"
            stroke="var(--color-sales)"
            name="Vendas"
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="var(--color-revenue)"
            name="Receita"
          />
        </LineChart>
      </ChartContainer>
    </Card>
  );
};

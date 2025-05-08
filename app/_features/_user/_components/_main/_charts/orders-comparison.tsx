"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrdersComparisonType } from "../../../_queries/_main/orders-comparison";

const COLORS = ["#0088FE", "#FFBB28"];

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

export const OrdersComparisonChart = ({
  data,
}: {
  data: OrdersComparisonType;
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Comparação de pedidos</CardTitle>
        <CardDescription>
          Comparação de pedidos de clientes antigos e novos (últimos 30 dias)
        </CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="h-[272px]">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={120}
            dataKey="value">
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip
            content={<ChartTooltipContent hideIndicator hideLabel />}
          />
        </PieChart>
      </ChartContainer>
    </Card>
  );
};

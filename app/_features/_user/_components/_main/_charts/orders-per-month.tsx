"use client";

import { Card } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { useGetMonthlyOrdersByYear } from "../../../_queries/_main/use-get-orders-per-month";

const chartConfig = {
  desktop: {
    label: "Mês",
    color: "#2563eb",
  },
} satisfies ChartConfig;

export const OrdersPerMonthChart = ({ userId }: { userId: string }) => {
  const [year, setYear] = useState(new Date().getFullYear().toString()); // Estado para armazenar o ano selecionado

  const { data, isLoading } = useGetMonthlyOrdersByYear(userId, year);

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  // Mapear os dados corretamente para o gráfico
  const chartData =
    data?.map((item, index) => ({
      month: months[index], // Exibir nomes dos meses no gráfico
      totalOrders: item.totalOrders, // Número de pedidos
    })) || [];

  return (
    <Card className="w-full p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Pedidos por mês</h1>

        {/* Dropdown para selecionar o ano */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border p-2 rounded">
          {[...Array(5)].map((_, i) => {
            const optionYear = (new Date().getFullYear() - i).toString();
            return (
              <option key={optionYear} value={optionYear}>
                {optionYear}
              </option>
            );
          })}
        </select>
      </div>

      {isLoading ? (
        <Skeleton className="w-full h-[300px] mt-10" />
      ) : (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis />
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator hideLabel />}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="totalOrders" fill="#2563eb" radius={4} />
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
};

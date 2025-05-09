import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { db } from "@/db/drizzle";
import { orders, transactions } from "@/db/schema";
import { eq, sum, and, sql, count } from "drizzle-orm";

const app = new Hono()
  .get(
    "/totalrevenue/store/:storeId",
    zValidator("param", z.object({ storeId: z.string().optional() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      // Sum the transaction amounts for completed orders belonging to the user
      const [revenue] = await db
        .select({ totalRevenue: sum(transactions.amount) })
        .from(transactions)
        .innerJoin(orders, eq(transactions.order_id, orders.id))
        .where(
          and(
            eq(orders.storeId, storeId),
            eq(transactions.status, "COMPLETED") // Ensure we're only counting completed transactions
          )
        );

      return c.json({ data: revenue.totalRevenue });
    }
  )
  .get(
    "/revenue-daily-progression/store/:storeId", // << NOVO NOME DE ROTA SUGERIDO
    zValidator(
      "param",
      z.object({
        storeId: z.string(),
      })
    ),
    async (c) => {
      const { storeId } = c.req.valid("param");
      const today = new Date(); // Usaremos 'today' para lógica do mês atual

      const currentYearStr = today.getFullYear().toString();
      const currentMonthStr = (today.getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const currentDayOfMonth = today.getDate();

      let previousYearAsNumber = today.getFullYear();
      let previousMonthAsNumber = today.getMonth(); // 0 para Janeiro
      if (previousMonthAsNumber === 0) {
        previousMonthAsNumber = 12; // Dezembro
        previousYearAsNumber -= 1;
      }
      const previousMonthStr = previousMonthAsNumber
        .toString()
        .padStart(2, "0");
      const previousYearStr = previousYearAsNumber.toString();

      // Nova função para buscar receita ACUMULADA ATÉ UM CERTO DIA do mês
      const getCumulativeRevenueUpToDay = async (
        year: string,
        month: string,
        day: number // Dia do mês (10, 20 ou 30)
      ): Promise<number | null> => {
        // Retorna número ou null
        const result = await db
          .select({
            total: sum(transactions.amount), // transactions.amount em centavos
          })
          .from(transactions)
          .where(
            and(
              eq(transactions.storeId, storeId),
              eq(transactions.status, "COMPLETED"),
              sql`TO_CHAR(${transactions.createdAt}, 'YYYY') = ${year}`,
              sql`TO_CHAR(${transactions.createdAt}, 'MM') = ${month}`,
              sql`EXTRACT(DAY FROM ${transactions.createdAt}) <= ${day}` // Acumula até este dia
            )
          );

        const revenueData = Array.isArray(result) ? result[0] : result;
        const totalInCents =
          revenueData && revenueData.total ? parseFloat(revenueData.total) : 0;

        // Se não houver receita, totalInCents será 0.
        // Considerar se 0 é diferente de 'dados não disponíveis ainda' (null).
        // Para a lógica atual de "se o dia não chegou, é null", este 0 é para quando o dia chegou mas não houve receita.
        return totalInCents / 100; // Converte para unidade principal
      };

      const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
      ];

      const previousMonthFullName = `${monthNames[previousMonthAsNumber - 1]} ${previousYearStr}`; // Ajuste no índice de monthNames
      const prevMonthData: {
        name: string;
        day10: number | null;
        day20: number | null;
        day30: number | null;
      } = {
        name: previousMonthFullName,
        day10: await getCumulativeRevenueUpToDay(
          previousYearStr,
          previousMonthStr,
          10
        ),
        day20: await getCumulativeRevenueUpToDay(
          previousYearStr,
          previousMonthStr,
          20
        ),
        day30: await getCumulativeRevenueUpToDay(
          previousYearStr,
          previousMonthStr,
          30
        ),
      };

      const currentMonthFullName = `${monthNames[today.getMonth()]} ${currentYearStr}`;
      const currMonthData: {
        name: string;
        day10: number | null;
        day20: number | null;
        day30: number | null;
      } = {
        name: currentMonthFullName,
        day10: null,
        day20: null,
        day30: null,
      };

      if (currentDayOfMonth >= 1) {
        if (currentDayOfMonth < 10) {
          currMonthData.day10 = await getCumulativeRevenueUpToDay(
            currentYearStr,
            currentMonthStr,
            currentDayOfMonth
          );
        } else {
          currMonthData.day10 = await getCumulativeRevenueUpToDay(
            currentYearStr,
            currentMonthStr,
            10
          );
        }

        if (currentDayOfMonth >= 10) {
          if (currentDayOfMonth < 20) {
            currMonthData.day20 = await getCumulativeRevenueUpToDay(
              currentYearStr,
              currentMonthStr,
              currentDayOfMonth
            );
          } else {
            currMonthData.day20 = await getCumulativeRevenueUpToDay(
              currentYearStr,
              currentMonthStr,
              20
            );
          }
        }

        if (currentDayOfMonth >= 20) {
          const lastDayOfCurrentMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0
          ).getDate();

          if (
            currentDayOfMonth < lastDayOfCurrentMonth &&
            currentDayOfMonth < 30
          ) {
            currMonthData.day30 = await getCumulativeRevenueUpToDay(
              currentYearStr,
              currentMonthStr,
              currentDayOfMonth
            );
          } else {
            const effectiveEndOfCheckpoint30 = Math.min(
              30,
              lastDayOfCurrentMonth
            );
            currMonthData.day30 = await getCumulativeRevenueUpToDay(
              currentYearStr,
              currentMonthStr,
              effectiveEndOfCheckpoint30
            );
          }
        }
      }

      return c.json({
        data: {
          previousMonthSeries: prevMonthData,
          currentMonthSeries: currMonthData,
        },
      });
    }
  )
  .get(
    "/monthlyorders/store/:storeId/:year",
    zValidator(
      "param",
      z.object({
        storeId: z.string(),
        year: z.string().regex(/^\d{4}$/), // Apenas 4 dígitos (ano)
      })
    ),
    async (c) => {
      const { storeId, year } = c.req.valid("param");

      // Contar o número de pedidos por mês no ano especificado
      const ordersPerMonth = await db
        .select({
          month: sql`TO_CHAR(${orders.createdAt}, 'MM')`.as("month"),
          totalOrders: count(),
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, storeId),
            sql`TO_CHAR(${orders.createdAt}, 'YYYY') = ${year}`
          )
        )
        .groupBy(sql`TO_CHAR(${orders.createdAt}, 'MM')`)
        .orderBy(sql`TO_CHAR(${orders.createdAt}, 'MM')`);

      return c.json({ data: ordersPerMonth });
    }
  )
  .get(
    "/average-ticket/store/:storeId",
    zValidator("param", z.object({ storeId: z.string() })),
    async (c) => {
      const { storeId } = c.req.valid("param");

      if (!storeId) {
        return c.json({ error: "Missing user id" }, 400);
      }

      // Buscar o faturamento total do usuário
      const [revenue] = await db
        .select({
          totalRevenue: sum(transactions.amount).as("totalRevenue"),
        })
        .from(transactions)
        .innerJoin(orders, eq(transactions.order_id, orders.id))
        .where(
          and(
            eq(orders.storeId, storeId),
            eq(transactions.status, "COMPLETED") // Apenas pedidos finalizados
          )
        );

      // Contar o número de pedidos finalizados do usuário
      const [orderCount] = await db
        .select({
          totalOrders: count().as("totalOrders"),
        })
        .from(orders)
        .where(eq(orders.storeId, storeId));

      // Forçar os valores para garantir que sejam números
      const totalRevenue: number = Number(revenue?.totalRevenue) || 0;
      const totalOrders: number = Number(orderCount?.totalOrders) || 0;
      const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return c.json({
        data: Math.round(averageTicket), // Formata para 2 casas decimais
      });
    }
  );

export default app;

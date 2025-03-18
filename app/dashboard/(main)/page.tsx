import { auth } from "@/auth";
import { OrdersPerDayChart } from "@/app/_features/_user/_components/_main/_charts/orders-per-day";
import { TotalCategories } from "@/app/_features/_user/_components/_main/total-categories";
import { TotalOrders } from "@/app/_features/_user/_components/_main/total-orders";
import { TotalProducts } from "@/app/_features/_user/_components/_main/total-products";
import {
  getOrdersCount,
  getCategoriesCount,
  getProductsCount,
} from "@/app/_features/_user/_queries/_main/get-data-count";
import { Card } from "@/components/ui/card";
import { RevenuePerMonthChart } from "@/app/_features/_user/_components/_main/_charts/revenue-per-month";

const DashboardPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [ordersCount, categoriesCount, productsCount] = await Promise.all([
    getOrdersCount(session.user.id),
    getCategoriesCount(session.user.id),
    getProductsCount(session.user.id),
  ]);

  return (
    <div className="w-full">
      <div className="flex justify-between gap-4">
        <TotalOrders totalOrders={ordersCount} />
        <TotalCategories totalCategories={categoriesCount} />
        <TotalProducts totalProducts={productsCount} />
      </div>
      <div className="mt-10">
        <OrdersPerDayChart userId={session.user.id} />
        <RevenuePerMonthChart userId={session.user.id} />
      </div>
    </div>
  );
};

export default DashboardPage;

import { SalesRevenueChart } from "@/app/_features/_user/_components/_main/_charts/sales-revenue";
import { TotalCategories } from "@/app/_features/_user/_components/_main/total-categories";
import { TotalOrders } from "@/app/_features/_user/_components/_main/total-orders";
import { TotalProducts } from "@/app/_features/_user/_components/_main/total-products";

const DashboardPage = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between gap-4">
        <TotalOrders totalOrders={10} />
        <TotalCategories totalCategories={5} />
        <TotalProducts totalProducts={20} />
      </div>
      <SalesRevenueChart />
    </div>
  );
};

export default DashboardPage;

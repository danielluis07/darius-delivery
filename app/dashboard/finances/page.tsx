import { auth } from "@/auth";
import { DailyRevenueChart } from "@/app/_features/_user/_components/_finances/_charts/daily-revenue-chart";
import { TotalRevenue } from "@/app/_features/_user/_components/_finances/total-revenue";
import { TotalSales } from "@/app/_features/_user/_components/_finances/total-sales";

const FinancesPage = async () => {
  const session = await auth();

  if (!session) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <TotalSales totalSales={100} />
        <TotalRevenue totalRevenue={1000} />
      </div>
      <DailyRevenueChart />
    </div>
  );
};

export default FinancesPage;

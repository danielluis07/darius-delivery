import { auth } from "@/auth";
import { DailyRevenueChart } from "@/app/_features/_user/_components/_finances/_charts/daily-revenue-chart";
import { TotalRevenue } from "@/app/_features/_user/_components/_finances/total-revenue";
import { TotalSales } from "@/app/_features/_user/_components/_finances/total-sales";
import { getTotalRevenue } from "@/app/_features/_user/_queries/_finances/get-total-revenue";

const FinancesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const totalRevenue = await getTotalRevenue(storeId);

  return (
    <div className="w-full">
      <div className="flex gap-4">
        <TotalSales totalSales={100} />
        <TotalRevenue totalRevenue={totalRevenue} />
      </div>
      <DailyRevenueChart />
    </div>
  );
};

export default FinancesPage;

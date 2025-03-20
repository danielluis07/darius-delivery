import { SubsPerMonthChart } from "@/app/_features/_admin/_components/_main/_charts/subs-per-month";
import { BalanceCard } from "@/app/_features/_admin/_components/_main/balance-card";
import { getAdminBalance } from "@/lib/asaas";

const AdminPage = async () => {
  const balance = await getAdminBalance();

  return (
    <main>
      <BalanceCard balance={balance.balance} />
      <div>
        <SubsPerMonthChart />
      </div>
    </main>
  );
};

export default AdminPage;

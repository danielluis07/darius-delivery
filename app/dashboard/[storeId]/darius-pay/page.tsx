import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { RequestWithDrawlForm } from "@/app/_features/_user/_components/_darius-pay/_withdrawls/request-withdrawl-form";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import {
  getAccountBalance,
  getPayments,
  getTransferRequests,
} from "@/lib/asaas";
import { TransfersDataTable } from "@/app/_features/_user/_components/_darius-pay/_withdrawls/data-table";
import { withdrawlColumns } from "@/app/_features/_user/_components/_darius-pay/_withdrawls/columns";
import { getTransactions } from "@/app/_features/_user/_queries/_transactions/get-transactions";
import { TransactionsDataTable } from "@/app/_features/_user/_components/_darius-pay/_transactions/data-table";
import { transactionsColumns } from "@/app/_features/_user/_components/_darius-pay/_transactions/columns";
import { paymentsColumns } from "@/app/_features/_user/_components/_darius-pay/_payments/columns";
import { ComparisonTable } from "@/app/_features/_user/_components/_darius-pay/comparison-table";
import { AccountBalance } from "@/app/_features/_user/_components/_darius-pay/account-balance";
import { getTotalRevenue } from "@/app/_features/_user/_queries/_finances/get-total-revenue";
import { TotalBalance } from "@/app/_features/_user/_components/_darius-pay/total-balance";
import { PaymentsDataTable } from "@/app/_features/_user/_components/_darius-pay/_payments/data-table";

const DariusPayPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [user] = await db
    .select({ apiKey: users.asaasApiKey })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user || !user.apiKey) {
    return (
      <div>Você não possui os dados necessários para acessar essa página</div>
    );
  }

  const [
    data,
    transfers,
    transactions,
    accountBalance,
    totalBalance,
    payments,
  ] = await Promise.all([
    getUserData(session.user.id),
    getTransferRequests(user.apiKey),
    getTransactions(session.user.id),
    getAccountBalance(user.apiKey),
    getTotalRevenue(session.user.id),
    getPayments(user.apiKey),
  ]);

  return (
    <div>
      <h1 className="font-bold">Tabela de comparação</h1>
      <ComparisonTable />
      <div className="flex items-center justify-between gap-4">
        <RequestWithDrawlForm
          bankAccount={data?.bankAccount}
          bankAgency={data?.bankAgency}
          bankCode={data?.bankCode}
          cpfCnpj={data?.cpfCnpj}
          bankAccountDigit={data?.bankAccountDigit}
          bankAccountType={data?.bankAccountType}
          ownerName={data?.ownerName}
          pixAddressKey={data?.pixAddressKey}
        />
        <AccountBalance balance={accountBalance.data.balance} />
        <TotalBalance totalBalance={totalBalance} />
      </div>
      <h1 className="font-bold mt-5">Pedidos de Saque</h1>
      <TransfersDataTable
        columns={withdrawlColumns}
        data={transfers.data.data || []}
        searchKey="value"
      />
      <h1 className="font-bold">Vendas</h1>
      <TransactionsDataTable
        columns={transactionsColumns}
        data={transactions || []}
        searchKey="buyerName"
      />
      <PaymentsDataTable
        columns={paymentsColumns}
        data={payments.data.data || []}
        searchKey="value"
      />
    </div>
  );
};

export default DariusPayPage;

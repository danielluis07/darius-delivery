import { auth } from "@/auth";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { RequestWithDrawlForm } from "@/app/_features/_user/_components/_darius-pay/request-withdrawl-form";
import { getUserData } from "@/app/_features/_user/_queries/get-user-data";
import { getTransferRequests } from "@/lib/asaas";
import { TransfersDataTable } from "@/app/_features/_user/_components/_darius-pay/data-table";
import { columns } from "@/app/_features/_user/_components/_darius-pay/columns";

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

  const [data, transfers] = await Promise.all([
    getUserData(session.user.id),
    getTransferRequests(user.apiKey),
  ]);

  return (
    <div>
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
      <TransfersDataTable
        columns={columns}
        data={transfers.data.data || []}
        searchKey="value"
      />
    </div>
  );
};

export default DariusPayPage;

import { ReceiptsClient } from "@/app/_features/_user/_components/_receipts/client";
import { auth } from "@/auth";

const ReceiptsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <ReceiptsClient userId={session.user.id} />;
};

export default ReceiptsPage;

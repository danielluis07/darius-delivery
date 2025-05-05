import { DeliverersClient } from "@/app/_features/_user/_components/_deliverers/client";
import { auth } from "@/auth";

const DeliverersPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <DeliverersClient storeId={storeId} />;
};

export default DeliverersPage;

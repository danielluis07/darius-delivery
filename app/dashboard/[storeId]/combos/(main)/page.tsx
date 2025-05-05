import { CombosClient } from "@/app/_features/_user/_components/_combos/client";
import { auth } from "@/auth";

const CombosPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <CombosClient storeId={storeId} />;
};

export default CombosPage;

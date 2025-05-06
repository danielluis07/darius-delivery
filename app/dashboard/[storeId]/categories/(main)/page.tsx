import { CategoriesClient } from "@/app/_features/_user/_components/_categories/client";
import { auth } from "@/auth";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <CategoriesClient storeId={storeId} />;
};

export default CategoriesPage;

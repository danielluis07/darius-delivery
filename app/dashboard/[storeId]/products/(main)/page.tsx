import { ProductsClient } from "@/app/_features/_user/_components/_products/client";
import { auth } from "@/auth";

const ProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <ProductsClient storeId={storeId} />;
};

export default ProductsPage;

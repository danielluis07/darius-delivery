import { auth } from "@/auth";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { CreateProductForm } from "@/app/_features/_user/_components/_products/create-product-form";

const NewProductPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const categories = await getCategories(storeId);

  if (!categories) {
    return (
      <div>Você precisa adicionar categorias antes de criar um produto</div>
    );
  }

  return <CreateProductForm categories={categories} storeId={storeId} />;
};

export default NewProductPage;

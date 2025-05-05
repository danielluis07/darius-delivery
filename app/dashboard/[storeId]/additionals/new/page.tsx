import { CreateAdditionalsForm } from "@/app/_features/_user/_components/_additionals/create-additionals-form";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { auth } from "@/auth";

const NewAdditionalsPage = async ({
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
      <div>Você precisa adicionar categorias antes de criar um adicional</div>
    );
  }

  return <CreateAdditionalsForm categories={categories} storeId={storeId} />;
};

export default NewAdditionalsPage;

import { UpdateAdditionalsForm } from "@/app/_features/_user/_components/_additionals/update-additionals-form";
import {
  getAdditional,
  getCategoryIdByAdditionalGroup,
} from "@/app/_features/_user/_queries/_additionals/get-additional";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { auth } from "@/auth";

const AdditionalPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) => {
  const session = await auth();
  const { storeId, id } = await params;

  if (!session || !session.user.id) {
    return <p>Not authenticated</p>;
  }

  //promise all
  const [additional, categories, data] = await Promise.all([
    getAdditional(id),
    getCategories(storeId),
    getCategoryIdByAdditionalGroup(storeId, id),
  ]);

  if (!additional) {
    return <p>Additional not found</p>;
  }

  if (!categories) {
    return (
      <div>Você precisa adicionar categorias antes de criar um adicional</div>
    );
  }

  if (!data) {
    return <p>Category not found</p>;
  }

  return (
    <UpdateAdditionalsForm
      id={id}
      data={additional}
      categories={categories}
      categoryId={data.categoryId}
      storeId={storeId}
    />
  );
};

export default AdditionalPage;

import { UpdateComboForm } from "@/app/_features/_user/_components/_combos/update-combo-form";
import { getCategoriesWithProducts } from "@/app/_features/_user/_queries/_categories/get-categories";
import { getCombo } from "@/app/_features/_user/_queries/_combos/get-combo";
import { auth } from "@/auth";

const ComboPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) => {
  const session = await auth();
  const { storeId, id } = await params;

  if (!session) {
    return <p>Not authenticated</p>;
  }

  // promise all
  const [combo, categories] = await Promise.all([
    getCombo(id),
    getCategoriesWithProducts(storeId),
  ]);

  if (!combo) {
    return <p>Combo not found</p>;
  }

  if (!categories) {
    return <p>Você precisa cadastrar ao menos uma categoria</p>;
  }

  return (
    <UpdateComboForm combo={combo} categories={categories} storeId={storeId} />
  );
};

export default ComboPage;

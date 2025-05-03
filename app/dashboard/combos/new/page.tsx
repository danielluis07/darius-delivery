import { CreateComboForm } from "@/app/_features/_user/_components/_combos/create-combo-form";
import { getCategoriesWithProducts } from "@/app/_features/_user/_queries/_categories/get-categories";
import { auth } from "@/auth";

const NewComboPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }
  const categories = await getCategoriesWithProducts(session.user.id);

  if (!categories) {
    return <div>Você precisa cadastrar categorias antes de criar um combo</div>;
  }

  return <CreateComboForm categories={categories} />;
};

export default NewComboPage;

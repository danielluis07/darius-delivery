import { auth } from "@/auth";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { CreateProductForm } from "@/app/_features/_user/_components/_products/create-product-form";

const NewProductPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getCategories(session.user.id);

  if (!data) {
    return (
      <div>Você precisa adicionar categorias antes de criar um produto</div>
    );
  }

  return <CreateProductForm data={data} />;
};

export default NewProductPage;

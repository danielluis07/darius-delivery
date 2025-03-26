import { auth } from "@/auth";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { CreateProductForm } from "@/app/_features/_user/_components/_products/create-product-form";

const NewProductPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const id =
    session.user.role === "EMPLOYEE"
      ? session.user.restaurantOwnerId
      : session.user.id;

  if (!id) {
    return <div>Usuário não encontrado</div>;
  }

  const data = await getCategories(id);

  if (!data) {
    return (
      <div>Você precisa adicionar categorias antes de criar um produto</div>
    );
  }

  return <CreateProductForm data={data} />;
};

export default NewProductPage;

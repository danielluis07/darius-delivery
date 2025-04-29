import { auth } from "@/auth";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { CreateProductForm } from "@/app/_features/_user/_components/_products/create-product-form";
import { getAdditionals } from "@/app/_features/_user/_queries/_additionals/get-additionals";

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

  const [categories, additionals] = await Promise.all([
    getCategories(id),
    getAdditionals(id),
  ]);

  if (!categories) {
    return (
      <div>Você precisa adicionar categorias antes de criar um produto</div>
    );
  }

  return (
    <CreateProductForm
      categories={categories}
      additionals={additionals || []}
    />
  );
};

export default NewProductPage;

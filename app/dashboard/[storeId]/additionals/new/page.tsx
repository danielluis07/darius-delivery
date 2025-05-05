import { CreateAdditionalsForm } from "@/app/_features/_user/_components/_additionals/create-additionals-form";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { auth } from "@/auth";

const NewAdditionalsPage = async () => {
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

  const categories = await getCategories(id);

  if (!categories) {
    return (
      <div>Você precisa adicionar categorias antes de criar um adicional</div>
    );
  }

  return <CreateAdditionalsForm categories={categories} />;
};

export default NewAdditionalsPage;

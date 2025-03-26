import { CustomersClient } from "@/app/_features/_user/_components/_customers/client";
import { auth } from "@/auth";

const CustomersPage = async () => {
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

  return <CustomersClient userId={id} />;
};

export default CustomersPage;

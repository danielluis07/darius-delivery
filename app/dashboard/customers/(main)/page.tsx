import { CustomersClient } from "@/app/_features/_user/_components/_customers/client";
import { auth } from "@/auth";

const CustomersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <CustomersClient userId={session.user.id} />;
};

export default CustomersPage;

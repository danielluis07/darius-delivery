import { DeliverersClient } from "@/app/_features/_user/_components/_deliverers/client";
import { auth } from "@/auth";

const DeliverersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <DeliverersClient userId={session.user.id} />;
};

export default DeliverersPage;

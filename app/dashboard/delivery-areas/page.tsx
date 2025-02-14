import { auth } from "@/auth";
import { DeliveryAreasClient } from "@/app/_features/_user/_components/_delivery-areas/client";

const DeliveryAreasPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você nãa está autorizado a acessar essa página</div>;
  }

  console.log("user id on the server:", session.user.id);

  return <DeliveryAreasClient userId={session.user.id} />;
};

export default DeliveryAreasPage;

import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { auth } from "@/auth";

const OrdersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return (
    <div className="w-full">
      <OrdersClient userId={session.user.id} />
    </div>
  );
};

export default OrdersPage;

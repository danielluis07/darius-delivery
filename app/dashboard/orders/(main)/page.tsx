import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { OrderSettings } from "@/app/_features/_user/_components/_orders/order-settings";
import { auth } from "@/auth";

const OrdersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return (
    <div className="w-full">
      <div className="flex justify-end">
        <OrderSettings userId={session.user.id} />
      </div>
      <OrdersClient userId={session.user.id} />
    </div>
  );
};

export default OrdersPage;

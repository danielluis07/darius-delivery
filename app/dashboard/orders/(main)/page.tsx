import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { getOrders } from "@/app/_features/_user/_queries/_orders/get-orders";
import { auth } from "@/auth";

const OrdersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getOrders(session.user.id);

  if (!data) {
    return (
      <div className="flex items center h-screen">
        Você ainda não possui pedidos
      </div>
    );
  }

  return <OrdersClient data={data} />;
};

export default OrdersPage;

import { auth } from "@/auth";
import { OrderDetails } from "@/app/_features/_user/_components/_orders/order-details";

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const orderId = (await params).orderId;

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

  return <OrderDetails userId={id} orderId={orderId} />;
};

export default OrderDetailsPage;

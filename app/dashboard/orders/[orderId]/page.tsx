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

  return <OrderDetails userId={session.user.id} orderId={orderId} />;
};

export default OrderDetailsPage;

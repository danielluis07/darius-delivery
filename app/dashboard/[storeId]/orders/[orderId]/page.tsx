import { auth } from "@/auth";
import { OrderDetails } from "@/app/_features/_user/_components/_orders/order-details";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";

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

  const products = await getProducts(id);

  return (
    <OrderDetails userId={id} orderId={orderId} products={products || []} />
  );
};

export default OrderDetailsPage;

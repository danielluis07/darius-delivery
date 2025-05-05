import { auth } from "@/auth";
import { OrderDetails } from "@/app/_features/_user/_components/_orders/order-details";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; orderId: string }>;
}) => {
  const { storeId, orderId } = await params;

  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const products = await getProducts(storeId);

  return (
    <OrderDetails
      storeId={storeId}
      orderId={orderId}
      products={products || []}
    />
  );
};

export default OrderDetailsPage;

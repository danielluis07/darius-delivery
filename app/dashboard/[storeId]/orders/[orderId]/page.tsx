import { auth } from "@/auth";
import { OrderDetails } from "@/app/_features/_user/_components/_orders/order-details";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { getCustomers } from "@/app/_features/_user/_queries/_customers/get-customers";
import { getDeliverers } from "@/app/_features/_user/_queries/_deliverers/get-deliverers";
import { getOrder } from "@/app/_features/_user/_queries/_orders/get-order";

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

  const [customers, products, deliverers, data] = await Promise.all([
    getCustomers(storeId),
    getProducts(storeId),
    getDeliverers(storeId),
    getOrder(orderId),
  ]);

  if (!data) {
    return <div>Pedido não encontrado</div>;
  }

  return (
    <OrderDetails
      storeId={storeId}
      data={data}
      orderId={orderId}
      products={products || []}
      customers={customers || []}
      deliverers={deliverers || []}
    />
  );
};

export default OrderDetailsPage;

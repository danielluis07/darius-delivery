import { OrderDetails } from "@/app/_features/_user/_components/_orders/order-details";
import { getOrder } from "@/app/_features/_user/_queries/_orders/get-order";

const OrderDetailsPage = async ({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) => {
  const orderId = (await params).orderId;

  const data = await getOrder(orderId);

  if (!data) {
    return <div>Esse pedido não existe</div>;
  }

  return <OrderDetails data={data} />;
};

export default OrderDetailsPage;

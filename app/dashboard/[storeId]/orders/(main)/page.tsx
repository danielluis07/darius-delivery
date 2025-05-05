import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { OpenRestaurant } from "@/app/_features/_user/_components/_orders/open-restaurant";
import { OrderSettings } from "@/app/_features/_user/_components/_orders/order-settings";
import { getIsRestaurantOpen } from "@/app/_features/_user/_queries/_orders/get-is-restaurant-open";
import { auth } from "@/auth";

const OrdersPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const customizationData = await getIsRestaurantOpen(storeId);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <OpenRestaurant isOpen={customizationData?.isOpen} />
        <OrderSettings storeId={storeId} />
      </div>
      <OrdersClient storeId={storeId} />
    </div>
  );
};

export default OrdersPage;

import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { OpenRestaurant } from "@/app/_features/_user/_components/_orders/open-restaurant";
import { OrderSettings } from "@/app/_features/_user/_components/_orders/order-settings";
import { getIsRestaurantOpen } from "@/app/_features/_user/_queries/_orders/get-is-restaurant-open";
import { auth } from "@/auth";

const OrdersPage = async () => {
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

  const customizationData = await getIsRestaurantOpen(id);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <OpenRestaurant isOpen={customizationData?.isOpen} />
        <OrderSettings userId={id} />
      </div>
      <OrdersClient userId={id} />
    </div>
  );
};

export default OrdersPage;

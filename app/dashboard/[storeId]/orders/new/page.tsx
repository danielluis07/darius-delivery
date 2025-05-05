import { auth } from "@/auth";
import { NewOrderForm } from "@/app/_features/_user/_components/_orders/_new-order/new-order-form";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { getOrderSettings } from "@/app/_features/_user/_queries/_orders/get-order-settings";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";

const NewOrderPage = async () => {
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

  const [products, orderSettings, apiKey] = await Promise.all([
    getProducts(id),
    getOrderSettings(id),
    getGoogleApiKey(id),
  ]);

  return (
    <NewOrderForm
      products={products || []}
      userId={id}
      orderSettings={orderSettings}
      apiKey={apiKey?.googleApiKey}
    />
  );
};

export default NewOrderPage;

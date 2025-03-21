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

  const [products, orderSettings, apiKey] = await Promise.all([
    getProducts(session.user.id),
    getOrderSettings(session.user.id),
    getGoogleApiKey(session.user.id),
  ]);

  return (
    <NewOrderForm
      products={products || []}
      userId={session.user.id}
      orderSettings={orderSettings}
      apiKey={apiKey?.googleApiKey}
    />
  );
};

export default NewOrderPage;

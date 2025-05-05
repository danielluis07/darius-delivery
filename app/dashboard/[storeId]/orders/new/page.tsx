import { auth } from "@/auth";
import { NewOrderForm } from "@/app/_features/_user/_components/_orders/_new-order/new-order-form";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { getOrderSettings } from "@/app/_features/_user/_queries/_orders/get-order-settings";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";

const NewOrderPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [products, orderSettings, apiKey] = await Promise.all([
    getProducts(storeId),
    getOrderSettings(storeId),
    getGoogleApiKey(storeId),
  ]);

  return (
    <NewOrderForm
      products={products || []}
      storeId={storeId}
      orderSettings={orderSettings}
      apiKey={apiKey?.googleApiKey}
    />
  );
};

export default NewOrderPage;

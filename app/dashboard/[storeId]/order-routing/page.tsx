import { OrderRoutingClient } from "@/app/_features/_user/_components/_order-routing/client";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getTemplateAddress } from "@/app/_features/_user/_queries/_customizations/get-template-address";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { auth } from "@/auth";

const OrderRoutingPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [apiKey, customization, address] = await Promise.all([
    getGoogleApiKey(storeId),
    getCustomization(session.user.id),
    getTemplateAddress(storeId),
  ]);

  if (!apiKey?.googleApiKey) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-gray-500">
          Para definir as áreas de entrega, é necessário salvar sua chave API do
          google nas configurações
        </p>
      </div>
    );
  }

  if (!customization || !address.latitude || !address.longitude) {
    return (
      <div>
        Para definir as áreas de entrega, é preciso definir o endereço de sua
        loja
      </div>
    );
  }

  return (
    <OrderRoutingClient
      apiKey={apiKey.googleApiKey}
      storeId={storeId}
      customizationlatitude={address.latitude}
      customizationlongitude={address.longitude}
    />
  );
};

export default OrderRoutingPage;

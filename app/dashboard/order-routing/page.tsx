import { OrderRoutingClient } from "@/app/_features/_user/_components/_order-routing/client";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { auth } from "@/auth";

const OrderRoutingPage = async () => {
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

  const [apiKey, customization] = await Promise.all([
    getGoogleApiKey(id),
    getCustomization(id),
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

  if (!customization || !customization.latitude || !customization.longitude) {
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
      userId={id}
      customizationlatitude={customization.latitude}
      customizationlongitude={customization.longitude}
    />
  );
};

export default OrderRoutingPage;

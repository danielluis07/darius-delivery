import { OrderRoutingClient } from "@/app/_features/_user/_components/_order-routing/client";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { auth } from "@/auth";

const OrderRoutingPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const apiKey = await getGoogleApiKey(session.user.id);

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

  return (
    <OrderRoutingClient apiKey={apiKey.googleApiKey} userId={session.user.id} />
  );
};

export default OrderRoutingPage;

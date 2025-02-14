import { DeliveryAreasKmForm } from "@/app/_features/_user/_components/_delivery-areas-km/delivery-areas-km-form";
import { getDeliveryAreasKm } from "@/app/_features/_user/_queries/_delivery-areas/get-delivery-areas-km";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { auth } from "@/auth";

const DeliveryAreaKmPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [data, apiKey] = await Promise.all([
    getDeliveryAreasKm(session.user.id),
    getGoogleApiKey(session.user.id),
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

  return <DeliveryAreasKmForm data={data} apikey={apiKey.googleApiKey} />;
};

export default DeliveryAreaKmPage;

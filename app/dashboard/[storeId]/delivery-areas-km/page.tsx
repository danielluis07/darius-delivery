import { DeliveryAreasKmForm } from "@/app/_features/_user/_components/_delivery-areas-km/delivery-areas-km-form";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getDeliveryAreasKm } from "@/app/_features/_user/_queries/_delivery-areas-km/get-delivery-areas-km";
import { getGoogleApiKey } from "@/app/_features/_user/_queries/get-google-api-key";
import { auth } from "@/auth";

const DeliveryAreaKmPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const [data, apiKey, customization] = await Promise.all([
    getDeliveryAreasKm(storeId),
    getGoogleApiKey(storeId),
    getCustomization(storeId),
  ]);

  if (!customization || !customization.latitude || !customization.longitude) {
    return (
      <div>
        Para definir as áreas de entrega, é preciso definir o endereço de sua
        loja
      </div>
    );
  }

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
    <DeliveryAreasKmForm
      data={data}
      storeId={storeId}
      apikey={apiKey.googleApiKey}
      customizationlatitude={customization.latitude}
      customizationlongitude={customization.longitude}
    />
  );
};

export default DeliveryAreaKmPage;

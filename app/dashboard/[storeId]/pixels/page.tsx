import { auth } from "@/auth";
import { getPixel } from "@/app/_features/_user/_queries/_pixels/get-pixel";
import { CreatePixelsForm } from "@/app/_features/_user/_components/_pixels/create-pixels-form";

const PixelsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getPixel(storeId);

  return <CreatePixelsForm data={data} storeId={storeId} />;
};

export default PixelsPage;

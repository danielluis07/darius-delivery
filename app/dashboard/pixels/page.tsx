import { auth } from "@/auth";
import { getPixel } from "@/app/_features/_user/_queries/_pixels/get-pixel";
import { CreatePixelsForm } from "@/app/_features/_user/_components/_pixels/create-pixels-form";

const PixelsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getPixel(session.user.id);

  return <CreatePixelsForm data={data} />;
};

export default PixelsPage;

import { auth } from "@/auth";
import { getPixel } from "@/app/_features/_user/_queries/_pixels/get-pixel";
import { CreatePixelsForm } from "@/app/_features/_user/_components/_pixels/create-pixels-form";

const PixelsPage = async () => {
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

  const data = await getPixel(id);

  return <CreatePixelsForm data={data} />;
};

export default PixelsPage;

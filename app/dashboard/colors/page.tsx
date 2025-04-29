import { ColorsForm } from "@/app/_features/_user/_components/_colors/create-colors-form";
import { getColors } from "@/app/_features/_user/_queries/_colors/get-colors";
import { getTemplates } from "@/app/_features/_user/_queries/get-templates";
import { auth } from "@/auth";

const ColorsPage = async () => {
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

  const [colors, templates] = await Promise.all([
    getColors(id),
    getTemplates(),
  ]);

  if (!templates) {
    return <div>Templates não encontrados</div>;
  }

  return <ColorsForm colors={colors} templates={templates} />;
};

export default ColorsPage;

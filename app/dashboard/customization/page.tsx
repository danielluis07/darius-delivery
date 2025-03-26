import { CustomizationForm } from "@/app/_features/_user/_components/_customization/customization-form";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getTemplates } from "@/app/_features/_user/_queries/get-templates";
import { auth } from "@/auth";

const CustomizationPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <p>Você precisa estar logado para acessar essa página</p>;
  }

  const id =
    session.user.role === "EMPLOYEE"
      ? session.user.restaurantOwnerId
      : session.user.id;

  if (!id) {
    return <div>Usuário não encontrado</div>;
  }

  const [customization, templates] = await Promise.all([
    getCustomization(id),
    getTemplates(),
  ]);

  if (!templates) {
    return <p>Não há templates disponíveis</p>;
  }

  return (
    <CustomizationForm templates={templates} customization={customization} />
  );
};

export default CustomizationPage;

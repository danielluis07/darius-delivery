import { CustomizationForm } from "@/app/_features/_user/_components/_customization/customization-form";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getTemplates } from "@/app/_features/_user/_queries/get-templates";
import { auth } from "@/auth";

const CustomizationPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!session || !userId) {
    return <p>Você precisa estar logado para acessar essa página</p>;
  }

  const [customization, templates] = await Promise.all([
    getCustomization(userId),
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

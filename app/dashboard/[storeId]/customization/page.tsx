import { CustomizationForm } from "@/app/_features/_user/_components/_customization/customization-form";
import { getCustomization } from "@/app/_features/_user/_queries/_customizations/get-customization";
import { getTemplateAddress } from "@/app/_features/_user/_queries/_customizations/get-template-address";
import { getTemplates } from "@/app/_features/_user/_queries/get-templates";
import { auth } from "@/auth";

const CustomizationPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <p>Você precisa estar logado para acessar essa página</p>;
  }

  const [customization, templateAddress, templates] = await Promise.all([
    getCustomization(session.user.id),
    getTemplateAddress(storeId),
    getTemplates(),
  ]);

  if (!templates) {
    return <p>Não há templates disponíveis</p>;
  }

  return (
    <CustomizationForm
      templates={templates}
      templateAddress={templateAddress}
      customization={customization}
      storeId={storeId}
    />
  );
};

export default CustomizationPage;

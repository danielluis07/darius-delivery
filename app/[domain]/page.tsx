import { MainClient as Template1 } from "@/app/_features/_customer/_components/_templates/_template-1/main-client";
import { MainClient as Template2 } from "@/app/_features/_customer/_components/_templates/_template-2/main-client";
import { auth } from "@/auth";
import { getCustomizationByDomain } from "@/app/_features/_customer/_queries/get-customization";
import { StoreProvider } from "@/context/store-context";

const DomainPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const domain = (await params).domain;
  const session = await auth();

  const data = await getCustomizationByDomain(domain);

  if (!data) {
    return <div>Customization not found</div>;
  }

  return (
    <StoreProvider session={session} data={data}>
      {data.templateName === "TEMPLATE_1" ? <Template1 /> : <Template2 />}
    </StoreProvider>
  );
};

export default DomainPage;

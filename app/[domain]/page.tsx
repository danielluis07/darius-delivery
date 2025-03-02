import { MainClient } from "@/app/_features/_customer/_components/_templates/_template-1/main-client";
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

  return (
    <StoreProvider session={session} data={data}>
      <MainClient />
    </StoreProvider>
  );
};

export default DomainPage;

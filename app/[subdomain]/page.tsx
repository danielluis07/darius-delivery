import { MainClient } from "@/app/_features/_customer/_components/_templates/_template-1/main-client";
import { auth } from "@/auth";
import { getCustomizationByDomain } from "@/app/_features/_customer/_queries/get-customization";

const SubdomainPage = async ({
  params,
}: {
  params: Promise<{ subdomain: string }>;
}) => {
  const subdomain = (await params).subdomain;
  const session = await auth();

  const data = await getCustomizationByDomain(subdomain);

  return <MainClient session={session} data={data} />;
};

export default SubdomainPage;

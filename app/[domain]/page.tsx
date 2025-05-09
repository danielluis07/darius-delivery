//import { MainClient as Template1 } from "@/app/_features/_customer/_components/_templates/_template-1/main-client";
//import { MainClient as Template2 } from "@/app/_features/_customer/_components/_templates/_template-2/main-client";
import { auth } from "@/auth";
//import { getCustomizationByDomain } from "@/app/_features/_customer/_queries/get-customization";
//import { StoreProvider } from "@/context/store-context";
import StoreManagementClient from "../_features/_customer/_components/select-store-client";
import { getStores } from "../_features/_customer/_queries/get-stores";

const DomainPage = async ({
  params,
}: {
  params: Promise<{ domain: string }>;
}) => {
  const domain = (await params).domain;
  const session = await auth();

  const data = await getStores(domain);

  if (!data) {
    return <div>Customization not found</div>;
  }

  return (
    <StoreManagementClient
      userSession={session}
      domain={domain}
      initialStores={data}
    />
  );
};

export default DomainPage;

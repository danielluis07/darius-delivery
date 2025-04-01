import { AffiliatesClient } from "@/app/_features/_admin/_components/_affiliates/client";
import { auth } from "@/auth";

const AffiliatePage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <AffiliatesClient />;
};

export default AffiliatePage;

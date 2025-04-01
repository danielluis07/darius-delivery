import { UpdateAffiliateForm } from "@/app/_features/_admin/_components/_affiliates/update-affiliate-form";
import { getAffiliate } from "@/app/_features/_admin/_queries/get-affiliate";

const AffiliatePage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const data = await getAffiliate(userId);

  if (!data) {
    return <div>Affiliate not found</div>;
  }

  return <UpdateAffiliateForm userId={userId} data={data} />;
};

export default AffiliatePage;

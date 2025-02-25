import { CustomerDetails } from "@/app/_features/_user/_components/_customers/customer-details";
import { getCustomer } from "@/app/_features/_user/_queries/_customers/get-customer";

const CustomerPage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const userId = (await params).userId;
  const customer = await getCustomer(userId);

  if (!customer) {
    return <div>Cliente não encontrado</div>;
  }

  return <CustomerDetails customer={customer} />;
};

export default CustomerPage;

import { EmployeesClient } from "@/app/_features/_user/_components/_employee/client";
import { auth } from "@/auth";

const EmployeePage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <EmployeesClient storeId={storeId} />;
};

export default EmployeePage;

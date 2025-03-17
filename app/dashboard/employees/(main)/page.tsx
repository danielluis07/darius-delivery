import { EmployeesClient } from "@/app/_features/_user/_components/_employee/client";
import { auth } from "@/auth";

const EmployeePage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  return <EmployeesClient userId={session.user.id} />;
};

export default EmployeePage;

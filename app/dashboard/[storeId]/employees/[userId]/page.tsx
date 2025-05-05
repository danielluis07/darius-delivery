import { UpdateEmployeeForm } from "@/app/_features/_user/_components/_employee/update-employee-form";
import { getEmployee } from "@/app/_features/_user/_queries/_employees/get-employee";

const EmployeePage = async ({
  params,
}: {
  params: Promise<{ storeId: string; userId: string }>;
}) => {
  const { storeId, userId } = await params;

  const data = await getEmployee(userId);

  if (!data) {
    return <div>Employee not found</div>;
  }

  return <UpdateEmployeeForm storeId={storeId} userId={userId} data={data} />;
};

export default EmployeePage;

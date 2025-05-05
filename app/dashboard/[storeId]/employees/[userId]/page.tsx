import { UpdateEmployeeForm } from "@/app/_features/_user/_components/_employee/update-employee-form";
import { getEmployee } from "@/app/_features/_user/_queries/_employees/get-employee";

const EmployeePage = async ({
  params,
}: {
  params: Promise<{ userId: string }>;
}) => {
  const { userId } = await params;

  const data = await getEmployee(userId);

  if (!data) {
    return <div>Employee not found</div>;
  }

  return <UpdateEmployeeForm userId={userId} data={data} />;
};

export default EmployeePage;

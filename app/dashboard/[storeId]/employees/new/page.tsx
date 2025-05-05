import { NewEmployeeForm } from "@/app/_features/_user/_components/_employee/new-employee-form";

const NewEmployeePage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  return <NewEmployeeForm storeId={storeId} />;
};

export default NewEmployeePage;

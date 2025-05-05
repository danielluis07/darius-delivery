import { CreateCategoryForm } from "@/app/_features/_user/_components/_categories/create-category-form";

const CreateCategoryPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  return <CreateCategoryForm storeId={storeId} />;
};

export default CreateCategoryPage;

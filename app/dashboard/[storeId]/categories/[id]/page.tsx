import { UpdateCategoryForm } from "@/app/_features/_user/_components/_categories/update-category-form";
import { getCategory } from "@/app/_features/_user/_queries/_categories/get-category";
import { auth } from "@/auth";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const session = await auth();
  const { id } = await params;

  if (!session || !session.user.id) {
    return <p>Not authenticated</p>;
  }

  const category = await getCategory(id);

  if (!category) {
    return <p>Category not found</p>;
  }

  return <UpdateCategoryForm category={category} />;
};

export default CategoryPage;

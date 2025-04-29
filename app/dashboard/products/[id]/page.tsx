import { UpdateProductForm } from "@/app/_features/_user/_components/_products/update-product-form";
import { getAdditionals } from "@/app/_features/_user/_queries/_additionals/get-additionals";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { getProduct } from "@/app/_features/_user/_queries/_products/get-product";
import { auth } from "@/auth";

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const session = await auth();
  const { id } = await params;

  if (!session) {
    return <p>Not authenticated</p>;
  }

  const userId =
    session.user.role === "EMPLOYEE"
      ? session.user.restaurantOwnerId
      : session.user.id;

  if (!userId) {
    return <p>Not authenticated</p>;
  }
  // primise all
  const [categories, product, additionals] = await Promise.all([
    getCategories(userId),
    getProduct(id),
    getAdditionals(userId),
  ]);

  if (!categories) {
    return <p>Categories not found</p>;
  }

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <UpdateProductForm
      categories={categories}
      product={product.rows[0]}
      additionals={additionals || []}
    />
  );
};

export default ProductPage;

import { UpdateProductForm } from "@/app/_features/_user/_components/_products/update-product-form";
import { getCategories } from "@/app/_features/_user/_queries/_categories/get-categories";
import { getProduct } from "@/app/_features/_user/_queries/_products/get-product";
import { auth } from "@/auth";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; id: string }>;
}) => {
  const session = await auth();
  const { storeId, id } = await params;

  if (!session || !session.user.id) {
    return <p>Not authenticated</p>;
  }

  // primise all
  const [categories, product] = await Promise.all([
    getCategories(storeId),
    getProduct(id),
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
      product={product}
      storeId={storeId}
    />
  );
};

export default ProductPage;

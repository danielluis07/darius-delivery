import { UpdateComboForm } from "@/app/_features/_user/_components/_combos/update-combo-form";
import { getCombo } from "@/app/_features/_user/_queries/_combos/get-combo";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { auth } from "@/auth";

const ComboPage = async ({ params }: { params: Promise<{ id: string }> }) => {
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

  const combo = await getCombo(id);
  const products = await getProducts(userId);

  if (!combo) {
    return <p>Combo not found</p>;
  }

  if (!products) {
    return <p>Products not found</p>;
  }

  return <UpdateComboForm combo={combo} products={products} />;
};

export default ComboPage;

import { auth } from "@/auth";
import { NewOrderForm } from "@/app/_features/_user/_components/_orders/_new-order/new-order-form";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";

const NewOrderPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const products = await getProducts(session.user.id);

  return <NewOrderForm products={products || []} userId={session.user.id} />;
};

export default NewOrderPage;

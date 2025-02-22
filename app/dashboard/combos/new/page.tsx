import { CreateComboForm } from "@/app/_features/_user/_components/_combos/create-combo-form";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { auth } from "@/auth";

const NewComboPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const products = await getProducts(session.user.id);

  if (!products) {
    return <div>Você precisa cadastrar produtos antes de criar um combo</div>;
  }

  return <CreateComboForm products={products} />;
};

export default NewComboPage;

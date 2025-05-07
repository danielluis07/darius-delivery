import { NewEmployeeForm } from "@/app/_features/_user/_components/_employee/new-employee-form";
import { getStores } from "@/app/_features/_user/_queries/_stores/get-stores";
import { auth } from "@/auth";

const NewEmployeePage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Unauthorized</div>;
  }

  const { data } = await getStores(session.user.id);

  const permissions = [
    { id: "Início", userId: session.user.id, name: "Início" },
    { id: "Categorias", userId: session.user.id, name: "Categorias" },
    { id: "Produtos", userId: session.user.id, name: "Produtos" },
    {
      id: "Configuração de Domínio",
      userId: session.user.id,
      name: "Configuração de Domínio",
    },
    { id: "Personalização", userId: session.user.id, name: "Personalização" },
    { id: "Entregadores", userId: session.user.id, name: "Entregadores" },
    { id: "Pedidos", userId: session.user.id, name: "Pedidos" },
    {
      id: "Roteirização de Pedidos",
      userId: session.user.id,
      name: "Roteirização de Pedidos",
    },
    { id: "Combos", userId: session.user.id, name: "Combos" },
    { id: "Clientes", userId: session.user.id, name: "Clientes" },
    { id: "Financeiro", userId: session.user.id, name: "Financeiro" },
    {
      id: "Áreas de Entrega",
      userId: session.user.id,
      name: "Áreas de Entrega",
    },
    {
      id: "Impressão de Comandas",
      userId: session.user.id,
      name: "Impressão de Comandas",
    },
    { id: "Pixels", userId: session.user.id, name: "Pixels" },
    { id: "Darius Pay", userId: session.user.id, name: "Darius Pay" },
  ];

  const combined = [...permissions, ...(data ?? [])];

  return <NewEmployeeForm storeId={storeId} permissions={combined} />;
};

export default NewEmployeePage;

import { OrdersClient } from "@/app/_features/_user/_components/_orders/client";
import { getOrders } from "@/app/_features/_user/_queries/_orders/get-orders";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Route } from "lucide-react";
import Link from "next/link";

const OrdersPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getOrders(session.user.id);

  if (!data) {
    return (
      <Card className="h-[500px] w-full">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Pedidos</h1>
          <Link href="/dashboard/orders/new">
            <Button>
              Novo Pedido <Plus />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">
            Nenhum pedido encontrado
          </span>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Pedidos</h1>
        <div className="flex items-center gap-x-2">
          <Link href="/dashboard/orders/new">
            <Button>
              Novo Pedido <Plus />
            </Button>
          </Link>
          <Link href="/dashboard/order-routing">
            <Button>
              Roteirização <Route />
            </Button>
          </Link>
        </div>
      </div>
      <OrdersClient data={data} />
    </div>
  );
};

export default OrdersPage;

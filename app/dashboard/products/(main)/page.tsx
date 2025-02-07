import { ProductsClient } from "@/app/_features/_user/_components/_products/client";
import { getProducts } from "@/app/_features/_user/_queries/_products/get-products";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

const ProductsPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getProducts(session.user.id);

  if (!data) {
    return (
      <Card className="h-[500px] w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-bold">Produto</h1>
          <Link href="/dashboard/products/new">
            <Button>
              Adicionar Produto
              <Plus />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">
            Nenhum produto encontrado
          </span>
        </div>
      </Card>
    );
  }

  return <ProductsClient data={data} />;
};

export default ProductsPage;

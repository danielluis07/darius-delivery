import { CombosClient } from "@/app/_features/_user/_components/_combos/client";
import { getCombos } from "@/app/_features/_user/_queries/_combos/get-combos";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

const CategoriesPage = async () => {
  const session = await auth();

  if (!session || !session.user.id) {
    return <div>Você não está autorizado a acessar essa página</div>;
  }

  const data = await getCombos(session.user.id);

  if (!data) {
    return (
      <Card className="h-[500px] w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-bold">Combos</h1>
          <Link href="/dashboard/combos/new">
            <Button>
              Adicionar Combo
              <Plus />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">Nenhum combo encontrado</span>
        </div>
      </Card>
    );
  }

  return <CombosClient data={data} />;
};

export default CategoriesPage;

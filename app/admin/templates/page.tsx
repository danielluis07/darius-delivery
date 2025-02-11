import { TemplatesClient } from "@/app/_features/_admin/_components/_templates/client";
import { getTemplates } from "@/app/_features/_admin/_queries/get-templates";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";

const TemplatesPage = async () => {
  const data = await getTemplates();

  if (!data) {
    return (
      <Card className="h-[500px] w-full">
        <div className="flex justify-between items-center w-full">
          <h1 className="text-xl font-bold">Templates</h1>
          <Link href="/admin/templates/new">
            <Button>
              Adicionar Template
              <Plus />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center w-full h-full">
          <span className="text-muted-foreground">
            Nenhum template encontrado
          </span>
        </div>
      </Card>
    );
  }

  return <TemplatesClient data={data} />;
};

export default TemplatesPage;

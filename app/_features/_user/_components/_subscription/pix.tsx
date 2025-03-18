"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronsUpDown } from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { createSubscription } from "../../_actions/create-subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const Pix = ({
  value,
  price,
}: {
  value: "BASIC" | "PREMIUM";
  price: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const onClick = () => {
    startTransition(() => {
      createSubscription("PIX", Number(price), value).then((res) => {
        if (!res.success) {
          toast.error(res.message);
        }

        if (res.success && res.callbackUrl) {
          toast.success(res.message);
          router.push(res.callbackUrl);
        }
      });
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <div className="flex items-center justify-between space-x-4 px-4 py-3 border rounded-md">
        <h4 className="text-sm font-semibold">Pix</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="space-y-2 px-1">
        <div className="flex items-center justify-between border rounded-md p-2">
          <Image src="/pix.png" alt="boleto" width={44} height={44} />
          <Button onClick={onClick} disabled={isPending}>
            Comprar
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingCart } from "lucide-react";

export const CartSheet = () => {
  return (
    <Sheet>
      <SheetTrigger>
        <ShoppingCart />
      </SheetTrigger>
      <SheetContent side="bottom" className="h-96">
        <SheetHeader>
          <SheetTitle className="text-center">Meu carrinho</SheetTitle>
          <VisuallyHidden.Root>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </VisuallyHidden.Root>
        </SheetHeader>
        <div className="flex items-center justify-center h-full">
          <h3 className="text-muted-foreground">
            Você não possui itens no carrinho
          </h3>
        </div>
      </SheetContent>
    </Sheet>
  );
};

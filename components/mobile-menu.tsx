import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export const MobileMenu = () => {
  return (
    <Sheet>
      <SheetTrigger className="text-primary text-3xl cursor-pointer" asChild>
        <Menu />
      </SheetTrigger>
      <SheetContent>
        <VisuallyHidden.Root>
          <SheetTitle>Menu</SheetTitle>
        </VisuallyHidden.Root>
        <div className="flex flex-col gap-4 mt-10">
          <Link
            href="#"
            className="text-primary hover:text-secondary transition">
            Início
          </Link>
          <Link
            href="#planos"
            className="text-primary hover:text-secondary transition">
            Planos
          </Link>
          <Link
            href="#vantagens"
            className="text-primary hover:text-secondary transition">
            Vantagens
          </Link>
          <div className="flex flex-col gap-3 mt-8">
            <Button className="mt-4 bg-primary text-white px-4 py-2 rounded-md hover:bg-secondary hover:text-primary transition">
              Login
            </Button>
            <Button className="bg-secondary text-primary px-4 py-2 rounded-md hover:bg-primary hover:text-white transition">
              Registrar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

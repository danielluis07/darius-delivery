"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";

type CategoriesWithProducts = InferResponseType<
  (typeof client.api.categories)["with-products"]["user"][":userId"]["$get"],
  200
>["data"];

type Product = CategoriesWithProducts[number]["products"][number];

export const ProductsDialog = ({
  categoryName,
  products,
  selectedProductIds,
  onProductSelectionChange,
}: {
  categoryName: string;
  products: Product[];
  selectedProductIds: string[];
  onProductSelectionChange: (productId: string, isSelected: boolean) => void;
}) => {
  return (
    <Dialog>
      {/* Use asChild to avoid rendering an extra button element */}
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Selecionar Produtos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Produtos: {categoryName}</DialogTitle>
          <DialogDescription>
            Marque os produtos desta categoria para incluir no combo.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-60 overflow-y-auto pr-2">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`prod-${categoryName}-${product.id}`} // Create a unique ID
                  // Check if this product's ID is in the main form's selected list
                  checked={selectedProductIds.includes(product.id)}
                  // Callback when the checkbox state changes
                  onCheckedChange={(checked) => {
                    // The 'checked' value can be boolean or 'indeterminate'
                    const isSelected = checked === true;
                    // Call the function passed from the parent form
                    onProductSelectionChange(product.id, isSelected);
                  }}
                />
                <label
                  htmlFor={`prod-${categoryName}-${product.id}`} // Match the checkbox ID
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer" // Added cursor-pointer
                >
                  {product.name}
                </label>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Não há produtos nesta categoria.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

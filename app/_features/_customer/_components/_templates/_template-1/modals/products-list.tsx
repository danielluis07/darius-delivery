"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { useGetProducts } from "@/app/_features/_customer/_queries/use-get-products";
import { Product } from "@/types";
import { MoveLeft } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import { useCartStore } from "@/hooks/template-1/use-cart-store";
import { toast } from "sonner";
import { useFooterSheet } from "@/hooks/template-1/use-template-footer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ProductsList = ({
  categoryId,
}: {
  categoryId: string | null | undefined;
}) => {
  const { data } = useStore();
  const [additionalValue, setAdditionalValue] = useState<string | undefined>(
    undefined
  );
  const addToCart = useCartStore((state) => state.addToCart);
  const { onOpenSheet } = useFooterSheet();
  const [halfOption, setHalfOption] = useState<"Inteira" | "Meio a Meio">(
    "Inteira"
  );
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    data?.userId,
    categoryId
  );

  console.log("products", products);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderDetails(false);
  };

  const handleBack = () => {
    if (showOrderDetails) {
      setShowOrderDetails(false);
    } else {
      setSelectedProduct(null);
    }
  };

  if (isProductsLoading) {
    return <div>Carregando...</div>;
  }

  if (!products) {
    return <div>Não há produtos cadastrados</div>;
  }

  return (
    <div className="relative">
      {selectedProduct ? (
        <motion.div
          key="productDetails"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-10">
          <ScrollArea className="h-[450px] px-3">
            <div className="flex justify-end mb-4">
              <div
                style={{
                  color: data?.customization.font_color || "black",
                }}
                onClick={handleBack}
                className="cursor-pointer">
                <MoveLeft />
              </div>
            </div>{" "}
            <div className="relative w-full h-64">
              <Image
                src={selectedProduct.image || placeholder}
                alt={selectedProduct.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              />
            </div>
            <h2 className="text-2xl font-bold mt-2">{selectedProduct.name}</h2>
            <p
              style={{
                color: data?.customization.font_color || "black",
              }}
              className="text-xs">
              {selectedProduct.description}
            </p>
            {selectedProduct.allowHalfOption && (
              <div className="mt-2">
                <RadioGroup
                  defaultValue={halfOption}
                  onValueChange={(value) =>
                    setHalfOption(value as "Inteira" | "Meio a Meio")
                  }>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      colorClass={data?.customization.font_color || "black"}
                      value="Inteira"
                      id="inteira"
                    />
                    <Label htmlFor="inteira">Inteira</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      colorClass={data?.customization.font_color || "black"}
                      value="Meio a Meio"
                      id="meio-a-meio"
                    />
                    <Label htmlFor="meio-a-meio">Meio a Meio</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            {selectedProduct.additionalGroups.length > 0 && (
              <div className="mt-4 border p-3 rounded-md">
                {selectedProduct.additionalGroups.map((item) => (
                  <div key={item.id}>
                    <span
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      className="font-semibold text-gray-500">
                      {item.name}
                    </span>
                    <div className="mt-3">
                      {item.additionals.map((additional) => (
                        <div
                          key={additional.id}
                          className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={additional.name}
                            name="additional"
                            value={additional.name}
                            checked={additionalValue === additional.name}
                            onChange={() => setAdditionalValue(additional.name)}
                          />
                          <label htmlFor={additional.name}>
                            {additional.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p
              style={{
                color: data?.customization.font_color || "black",
              }}
              className="text-lg font-semibold mt-2">
              {formatCurrencyFromCents(selectedProduct.price)}
            </p>
            <button
              style={{
                backgroundColor: data?.customization.button_color || "white",
                color: data?.customization.font_color || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full whitespace-nowrap rounded-md mt-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => {
                onOpenSheet();
                const wasAdded = addToCart(
                  { ...selectedProduct, halfOption },
                  data?.userId || ""
                );
                if (wasAdded) {
                  toast.success("Produto adicionado ao carrinho");
                } else {
                  toast.error("Esse Produto já está no carrinho");
                }
              }}>
              Adicionar ao carrinho
            </button>
          </ScrollArea>
        </motion.div>
      ) : (
        <motion.div
          key="productList"
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5 }}>
          <div className="space-y-3 mt-5">
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: data?.customization.button_color || "white",
                }}
                onClick={() =>
                  handleProductClick({
                    ...product,
                    createdAt: product.createdAt
                      ? new Date(product.createdAt)
                      : null,
                    updatedAt: product.updatedAt
                      ? new Date(product.updatedAt)
                      : null,
                  })
                }
                className="cursor-pointer rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      className="text-md font-semibold text-xl">
                      {product.name}
                    </h2>
                    <p
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      className="text-sm max-w-52 line-clamp-2">
                      {product.description}
                    </p>
                    <p
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      className="text-sm font-semibold">
                      {formatCurrencyFromCents(product.price)}
                    </p>
                  </div>
                  <div className="relative size-24">
                    <Image
                      src={product.image || placeholder}
                      alt={product.name}
                      sizes="96px"
                      fill
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

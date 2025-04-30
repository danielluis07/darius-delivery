"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { useGetProducts } from "@/app/_features/_customer/_queries/use-get-products";
import { Product } from "@/types";
import { ChevronRight, MoveLeft } from "lucide-react";
import { cn, formatCurrencyFromCents } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import { useCartStore } from "@/hooks/template-1/use-cart-store";
import { toast } from "sonner";
import { useFooterSheet } from "@/hooks/template-1/use-template-footer";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export const ProductsList = ({
  categoryId,
}: {
  categoryId: string | null | undefined;
}) => {
  const { data } = useStore();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    {}
  );
  const addToCart = useCartStore((state) => state.addToCart);
  const { cart } = useCartStore();
  const { onOpenSheet } = useFooterSheet();
  const [halfOption, setHalfOption] = useState<"Inteira" | "Meio a Meio">(
    "Inteira"
  );
  const [openAdditionalsAccordion, setOpenAdditionalsAccordion] = useState<
    string | null
  >(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    data?.userId,
    categoryId
  );

  console.log("cart", cart);

  const handleChange = (groupId: string, value: string) => {
    setSelectedValues((prev) => ({ ...prev, [groupId]: value }));
  };

  const toggleAccordion = (groupId: string) => {
    setOpenAdditionalsAccordion((prev) => (prev === groupId ? null : groupId));
  };

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
          <div className="h-[430px] px-3 custom-scroll-hide overflow-auto">
            <div className="flex justify-end mb-4">
              <div
                style={{
                  color: data?.colors.font || "black",
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
            <h2
              style={{
                color: data?.colors.product_name || "black",
              }}
              className="text-2xl font-bold mt-2">
              {selectedProduct.name}
            </h2>
            <p
              style={{
                color: data?.colors.font || "black",
              }}
              className="text-xs">
              {selectedProduct.description}
            </p>
            {/*  */}
            <div
              style={{
                backgroundColor: data?.colors?.product_details || "white",
              }}
              className="flex items-center justify-between mt-4 p-4 rounded-lg">
              <p
                style={{
                  color: data?.colors.product_price || "black",
                }}
                className="text-lg font-semibold mt-2">
                {formatCurrencyFromCents(selectedProduct.price)}
              </p>
              {selectedProduct.allowHalfOption && (
                <div
                  style={{
                    color: data?.colors.font || "black",
                  }}>
                  <RadioGroup
                    value={halfOption}
                    onValueChange={(value) =>
                      setHalfOption(value as "Inteira" | "Meio a Meio")
                    }>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Inteira"
                        id="inteira"
                        colorClass={data?.colors?.font || "black"}
                        className="size-3.5"
                      />
                      <Label htmlFor="inteira">Inteira</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="Meio a Meio"
                        id="meio-a-meio"
                        colorClass={data?.colors?.font || "black"}
                        className="size-3.5"
                      />
                      <Label htmlFor="meio-a-meio">Meio a Meio</Label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
            {/*  */}
            <div
              style={{
                backgroundColor: data?.colors.additionals || "white",
                color: data?.colors.additionals_font || "black",
              }}
              className="my-4 py-4">
              <p className="text-xs text-center font-semibold">
                Personalize seu produto:
              </p>
              <p className="text-xs text-center font-semibold">
                Toque para abrir/fechar as opções abaixo
              </p>
            </div>
            {/*  */}
            {selectedProduct.additionalGroups.length > 0 && (
              <div className="mt-4 space-y-4">
                {selectedProduct.additionalGroups.map((group) => (
                  <div
                    key={group.id}
                    style={{
                      backgroundColor: data?.colors.additionals || "white",
                      color: data?.colors.additionals_font || "black",
                    }}
                    className="rounded-lg">
                    <button
                      onClick={() => toggleAccordion(group.id)}
                      className="flex items-center gap-1 w-full px-4 py-3 text-left text-lg font-medium rounded-t-lg">
                      <ChevronRight
                        style={{
                          color: data?.colors.additionals_font || "black",
                        }}
                        className={cn(
                          openAdditionalsAccordion === group.id
                            ? "rotate-90"
                            : "",
                          "size-4 transition-transform duration-200"
                        )}
                      />
                      <span
                        style={{
                          color: data?.colors?.additionals_font || "black",
                        }}
                        className="text-xs">
                        {group.name}
                      </span>
                    </button>

                    {openAdditionalsAccordion === group.id && (
                      <div className="px-4 py-3 space-y-2">
                        <RadioGroup
                          value={selectedValues[group.id] || ""}
                          onValueChange={(val) => handleChange(group.id, val)}
                          className="space-y-2">
                          {group.additionals.map((additional) => (
                            <div
                              key={additional.id}
                              className="flex items-center justify-between">
                              <div className="space-x-2">
                                <RadioGroupItem
                                  colorClass={
                                    data?.colors.additionals_font || "black"
                                  }
                                  className="size-3.5"
                                  value={additional.name}
                                  id={`additional-${group.id}-${additional.id}`}
                                />
                                <Label
                                  htmlFor={`additional-${group.id}-${additional.id}`}>
                                  {additional.name}
                                </Label>
                              </div>
                              <div className="text-xs font-semibold">
                                {formatCurrencyFromCents(
                                  additional.priceAdjustment
                                )}
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/*  */}
            <button
              style={{
                backgroundColor: data?.colors.button || "white",
                color: data?.colors.font || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full whitespace-nowrap rounded-md mt-5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => {
                onOpenSheet(); // Opens the sheet as before

                // Call the updated addToCart from your store
                const wasAdded = addToCart(
                  { ...selectedProduct, halfOption }, // 1st arg: Product data (including halfOption if needed)
                  data?.userId || "", // 2nd arg: User ID
                  selectedValues // 3rd arg: Your selected additionals state object
                );

                // Handle the result and show toast messages as before
                if (wasAdded) {
                  toast.success("Produto adicionado ao carrinho");
                  // You might want to reset the selections after adding to cart:
                  // setSelectedValues({}); // Uncomment this line if needed
                } else {
                  toast.error("Esse Produto já está no carrinho");
                }
              }}>
              Adicionar ao carrinho
            </button>
          </div>
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
                  backgroundColor: data?.colors.button || "white",
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
                        color: data?.colors.font || "black",
                      }}
                      className="text-md font-semibold text-xl">
                      {product.name}
                    </h2>
                    <p
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-sm max-w-52 line-clamp-2">
                      {product.description}
                    </p>
                    <p
                      style={{
                        color: data?.colors.font || "black",
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

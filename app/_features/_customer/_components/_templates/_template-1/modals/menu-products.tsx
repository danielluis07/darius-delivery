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

export const MenuProducts = ({
  categoryId,
}: {
  categoryId: string | null | undefined;
}) => {
  const { data } = useStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { onOpenSheet } = useFooterSheet();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    data?.userId,
    categoryId
  );

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
    <div
      style={{
        backgroundColor: data?.colors.background || "white",
      }}
      className="relative">
      {selectedProduct ? (
        <motion.div
          key="productDetails"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 p-6 z-10">
          <div className="pb-5">
            <div className="flex justify-end mb-4">
              <div
                onClick={handleBack}
                style={{
                  color: data?.colors.font || "black",
                }}
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
                className="object-cover"
              />
            </div>
            <h2
              style={{
                color: data?.colors.font || "black",
              }}
              className="text-2xl font-bold mt-2">
              {selectedProduct.name}
            </h2>
            <p
              style={{
                color: data?.colors.font || "black",
              }}
              className="mb-4 text-xs">
              {selectedProduct.description}
            </p>
            <p
              style={{
                color: data?.colors.font || "black",
              }}
              className="text-lg font-semibold mb-4">
              {formatCurrencyFromCents(selectedProduct.price)}
            </p>
            <button
              style={{
                backgroundColor: data?.colors.button || "white",
                color: data?.colors.font || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full whitespace-nowrap rounded-md mt-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => {
                onOpenSheet();
                const wasAdded = addToCart(selectedProduct, data?.userId || "");
                if (wasAdded) {
                  toast.success("Produto adicionado ao carrinho");
                } else {
                  toast.error("Esse produto já está no carrinho");
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
          <div className="space-y-3 pt-14">
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: data?.colors.button || "white",
                  color: data?.colors.font || "black",
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
                className="cursor-pointer rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-md font-semibold">
                      {product.name}
                    </h2>
                    <p
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-sm max-w-52 line-clamp-2">
                      {product.description}
                    </p>
                    {product.additionalGroups.length > 0 && (
                      <div>
                        {product.additionalGroups.map((item) => (
                          <div key={item.id}>
                            <span
                              style={{
                                color: data?.colors.font || "black",
                              }}
                              className="text-xs font-semibold text-gray-500">
                              {item.name}
                            </span>
                            <div>
                              {item.additionals.map((additional) => (
                                <span
                                  key={additional.id}
                                  style={{
                                    color: data?.colors.font || "black",
                                  }}
                                  className="text-xs font-semibold text-gray-500">
                                  {additional.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                      fill
                      sizes="96px"
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

"use client";

import { use, useState } from "react";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { useGetProducts } from "@/app/_features/_customer/_queries/use-get-products";
import { Product } from "@/types";
import { useParams } from "next/navigation";
import { useGetUserByDomain } from "@/app/_features/_customer/_queries/use-get-user-by-domain";
import { MoveLeft } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const ProductsList = ({ categoryId }: { categoryId: string | null }) => {
  const params = useParams<{ subdomain: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { data, isLoading: isUserLoading } = useGetUserByDomain(
    params.subdomain
  );
  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    data?.userId,
    categoryId
  );
  const handleProductClick = (product: Product) => setSelectedProduct(product);
  const handleBack = () => setSelectedProduct(null);

  if (isUserLoading || isProductsLoading) {
    return <div>Carregando...</div>;
  }

  if (!products) {
    return <div>Não há produtos cadastrados</div>;
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {selectedProduct ? (
          <motion.div
            key="productDetails"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-white p-6 z-10">
            <div className="flex justify-end mb-4">
              <div
                onClick={handleBack}
                className="cursor-pointer text-gray-600">
                <MoveLeft />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
            <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
            <p className="text-lg font-semibold mb-4">
              {formatCurrencyFromCents(selectedProduct.price)}
            </p>
            <div className="relative w-full h-64">
              <Image
                src={selectedProduct.image || placeholder}
                alt={selectedProduct.name}
                fill
              />
            </div>
            <Button className="w-full my-3">Comprar Produto</Button>
          </motion.div>
        ) : (
          <motion.div
            key="productList"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.5 }}>
            <div className="space-y-3">
              {products.map((product) => (
                <Card
                  key={product.id}
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
                  className="cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h2 className="text-md font-semibold">{product.name}</h2>
                      <p className="text-sm text-gray-500 max-w-52 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-sm font-semibold">
                        {formatCurrencyFromCents(product.price)}
                      </p>
                    </div>
                    <div className="relative size-24">
                      <Image
                        src={product.image || placeholder}
                        alt={product.name}
                        fill
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

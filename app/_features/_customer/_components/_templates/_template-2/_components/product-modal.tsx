"use client";

import { useProductModal } from "@/hooks/template-2/use-product-modal";
import { X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { formatCurrencyFromCents } from "@/lib/utils"; // ou onde estiver essa função

export const ProductModal = () => {
  const { closeModal, productData } = useProductModal();

  if (!productData) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Close button */}
      <button className="absolute top-4 right-4 z-10" onClick={closeModal}>
        <X size={24} />
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32 flex items-center justify-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-3xl w-full">
          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-2xl font-bold mb-2">{productData.name}</h2>
            <p className="text-muted-foreground mb-4">
              {productData.description}
            </p>
            <p className="text-xl font-semibold">
              {formatCurrencyFromCents(productData.price)}
            </p>
          </div>

          {/* Image */}
          <div className="w-full sm:size-72 relative rounded-lg overflow-hidden shrink-0">
            <Image
              src={productData.image}
              alt={productData.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t z-10">
        <Button className="w-full">Adicionar ao carrinho</Button>
      </div>
    </div>
  );
};

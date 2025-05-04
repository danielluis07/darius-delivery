"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { Combo } from "@/types";
import { MoveLeft, Plus } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import { useCartStore } from "@/hooks/template-1/use-cart-store";
import { toast } from "sonner";
import { useGetTemplateCombos } from "@/app/_features/_user/_queries/_combos/use-get-template-combos";
import { useFooterSheet } from "@/hooks/template-1/use-template-footer";

export const Combos = () => {
  const { data } = useStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [showComboDetails, setShowComboDetails] = useState(false);
  const { onOpenSheet } = useFooterSheet();
  const { data: combosData, isLoading } = useGetTemplateCombos(data?.userId);

  const combos = combosData as Combo[];

  const handleComboClick = (combo: Combo) => {
    setSelectedCombo(combo);
    setShowComboDetails(false);
  };

  const handleBack = () => {
    if (showComboDetails) {
      setShowComboDetails(false);
    } else {
      setSelectedCombo(null);
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!combos || combos.length === 0) {
    return <div>Não há produtos cadastrados</div>;
  }

  return (
    <div className="relative">
      {selectedCombo ? (
        <motion.div
          key="productDetails"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 p-6 z-10">
          <div className="h-[500px] sm:h-[430px] px-3 custom-scroll-hide overflow-auto pb-5">
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
                src={selectedCombo.image || placeholder}
                alt={selectedCombo.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                className="object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold mt-2">{selectedCombo.name}</h2>
            <p
              style={{
                color: data?.colors.font || "black",
              }}
              className="mb-4 text-xs">
              {selectedCombo.description}
            </p>
            <p
              style={{
                color: data?.colors.font || "black",
              }}
              className="text-lg font-semibold mb-4">
              {formatCurrencyFromCents(selectedCombo.price)}
            </p>
            {selectedCombo.products.map((product) => (
              <div
                key={product.id}
                style={{
                  color: data?.colors.font || "black",
                }}
                className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold mb-2">
                  {product.name}
                </span>
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    onOpenSheet();
                    const wasAdded = addToCart(product, data?.userId || "");
                    if (wasAdded) {
                      toast.success("Produto adicionado ao carrinho");
                    } else {
                      toast.error("Esse Produto já está no carrinho");
                    }
                  }}>
                  <Plus className="size-5" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="productList"
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5 }}>
          <div className="space-y-3">
            {combos.map((combo) => (
              <div
                key={combo.id}
                style={{
                  backgroundColor: data?.colors.button || "white",
                }}
                onClick={() =>
                  handleComboClick({
                    ...combo,
                    createdAt: combo.createdAt
                      ? new Date(combo.createdAt)
                      : null,
                    updatedAt: combo.updatedAt
                      ? new Date(combo.updatedAt)
                      : null,
                  })
                }
                className="cursor-pointer rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-md font-semibold text-lg">
                      {combo.name}
                    </h2>
                    <p
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-sm max-w-52 line-clamp-2">
                      {combo.description}
                    </p>
                    <p
                      style={{
                        color: data?.colors.font || "black",
                      }}
                      className="text-sm font-semibold">
                      {formatCurrencyFromCents(combo.price)}
                    </p>
                  </div>
                  <div className="relative size-24">
                    <Image
                      src={combo.image || placeholder}
                      alt={combo.name}
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

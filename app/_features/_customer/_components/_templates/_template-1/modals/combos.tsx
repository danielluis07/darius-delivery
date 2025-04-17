"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { Combo } from "@/types";
import { MoveLeft } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import { useCartStore } from "@/hooks/template-1/use-cart-store";
import { toast } from "sonner";
import { useGetCombos } from "@/app/_features/_user/_queries/_combos/use-get-combos";

export const Combos = () => {
  const { data } = useStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);
  const [showComboDetails, setShowComboDetails] = useState(false);
  const { data: combos, isLoading } = useGetCombos(data?.userId);

  console.log(combos, "combos");

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
          <div className="pb-5">
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
                color: data?.customization.font_color || "black",
              }}
              className="mb-4 text-xs">
              {selectedCombo.description}
            </p>
            <p
              style={{
                color: data?.customization.font_color || "black",
              }}
              className="text-lg font-semibold mb-4">
              {formatCurrencyFromCents(selectedCombo.price)}
            </p>
            <button
              style={{
                backgroundColor: data?.customization.button_color || "white",
                color: data?.customization.font_color || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full whitespace-nowrap rounded-md mt-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
              onClick={() => {
                const wasAdded = addToCart(selectedCombo, data?.userId || "");
                if (wasAdded) {
                  toast.success("Produto adicionado ao carrinho");
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
          <div className="space-y-3">
            {combos.map((combo) => (
              <div
                key={combo.id}
                style={{
                  backgroundColor: data?.customization.button_color || "white",
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
                        color: data?.customization.font_color || "black",
                      }}
                      className="text-md font-semibold text-lg">
                      {combo.name}
                    </h2>
                    <p
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      className="text-sm max-w-52 line-clamp-2">
                      {combo.description}
                    </p>
                    <p
                      style={{
                        color: data?.customization.font_color || "black",
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

"use client";

import { useStore } from "@/context/store-context";
import placeholder from "@/public/placeholder-image.jpg";
import Image from "next/image";
import { CategoriesCarousel } from "./_components/categories-carousel";
import { Combos } from "@/app/_features/_customer/_components/_templates/_template-2/_components/combos";
import { Products } from "./_components/products";
import { Footer } from "./_components/footer";
import { AnimatePresence, motion } from "motion/react";
import { ProductModal } from "./_components/product-modal";
import { useProductModal } from "@/hooks/template-2/use-product-modal";

export const MainClient = () => {
  const { data } = useStore();
  const { isOpen } = useProductModal();

  return (
    <div className="w-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-white z-30 p-6 overflow-y-auto shadow-2xl h-screen">
            <ProductModal />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative max-w-2xl mx-auto pb-14">
        <div className="relative w-full h-96">
          <Image
            src={data?.customization.banner || placeholder}
            alt="banner"
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            className="object-cover"
          />
        </div>
        <CategoriesCarousel />
        <Combos />
        <Products />
        <Footer />
      </div>
    </div>
  );
};

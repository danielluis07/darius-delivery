"use client";

import Image from "next/image";
import { SignUpForm } from "@/app/_features/_customer/_components/_templates/_template-1/_auth/sign-up-form";
import { Card } from "@/components/ui/card";
import { ClipboardList, Key, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useModalStore } from "@/hooks/use-modal-store";
import { SignInForm } from "@/app/_features/_customer/_components/_templates/_template-1/_auth/sign-in-form";
import placeholder from "@/public/placeholder-image.jpg";
import { Session } from "next-auth";
import { ProductsList } from "@/app/_features/_customer/_components/_templates/_template-1/products-list";
import { CustomizationWithTemplate } from "@/types";
import { useGetCategories } from "@/app/_features/_customer/_queries/use-get-categories";
import { ClockLoader } from "react-spinners";

export const MainClient = ({
  data,
  session,
}: {
  data: CustomizationWithTemplate | null;
  session: Session | null;
}) => {
  const { modalType, onOpen, categoryId, onClose } = useModalStore();
  const { data: categories, isLoading } = useGetCategories(data?.userId);

  return (
    <div className="flex h-screen items-center justify-center relative">
      <div
        className="relative h-[600px] w-[450px] overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-white shadow-2xl p-6 bg-cover"
        style={{
          backgroundImage: `url(${data?.customization.banner})`,
        }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <ClockLoader color="#ffffff" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <AnimatePresence>
              {modalType && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 z-10 bg-white p-6 overflow-y-auto shadow-2xl rounded-lg">
                  <div className="flex justify-end mb-4">
                    <div
                      onClick={onClose}
                      className="text-gray-600 cursor-pointer">
                      <X />
                    </div>
                  </div>
                  {modalType === "signIn" && (
                    <h2 className="text-xl text-center font-bold mb-4">
                      Entre em sua Conta
                    </h2>
                  )}
                  {modalType === "signUp" && (
                    <h2 className="text-xl text-center font-bold mb-4">
                      Crie sua Conta
                    </h2>
                  )}
                  <ModalContent modalType={modalType} categoryId={categoryId} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative size-32 mx-auto mb-4">
              <Image
                src={data?.customization.logo_desktop || placeholder}
                alt="logo"
                fill
                sizes="(max-width: 768px) 25vw, (max-width: 1200px) 10vw, 200px"
                className="object-contain"
              />
            </div>

            {/* Main Content */}
            <div className="relative z-0">
              {session ? (
                <div className="space-y-4">
                  {categories?.map((category, i) => (
                    <Card
                      key={i}
                      className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                      onClick={() => onOpen("products", category.id)}>
                      {category.name}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center gap-4">
                  <Card
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("signUp")}>
                    <ClipboardList />
                    Registrar
                  </Card>
                  <Card
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("signIn")}>
                    <Key />
                    Login
                  </Card>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ModalContent = ({
  modalType,
  categoryId,
}: {
  modalType: string;
  categoryId: string | null;
}) => {
  switch (modalType) {
    case "signUp":
      return <SignUpForm />;
    case "signIn":
      return <SignInForm />;
    case "products":
      return <ProductsList categoryId={categoryId} />;
    case "settings":
      return (
        <div className="p-4">
          <p>Settings content goes here.</p>
        </div>
      );
    default:
      return null;
  }
};

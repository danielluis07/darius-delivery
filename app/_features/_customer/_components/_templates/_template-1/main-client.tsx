"use client";

import Image from "next/image";
import { SignUpForm } from "@/app/_features/_customer/_components/_templates/_template-1/_auth/sign-up-form";
import { Card } from "@/components/ui/card";
import {
  ClipboardList,
  Key,
  Sandwich,
  ShoppingCart,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useModalStore } from "@/hooks/use-modal-store";
import { SignInForm } from "@/app/_features/_customer/_components/_templates/_template-1/_auth/sign-in-form";
import placeholder from "@/public/placeholder-image.jpg";
import { ProductsList } from "@/app/_features/_customer/_components/_templates/_template-1/modals/products-list";
import { Menu } from "@/app/_features/_customer/_components/_templates/_template-1/modals/menu";
import { useStore } from "@/context/store-context";
import { MenuProducts } from "@/app/_features/_customer/_components/_templates/_template-1/modals/menu-products";
import { Cart } from "@/app/_features/_customer/_components/_templates/_template-1/modals/cart";
import { Categories } from "@/app/_features/_customer/_components/_templates/_template-1/modals/categories";
import { useEffect } from "react";

const registerMenuView = async (userId: string | undefined) => {
  const lastView = localStorage.getItem(`menuView-${userId}`);
  const now = Date.now(); // Obtém o timestamp atual como número

  // Se `lastView` for null, `parseInt(lastView, 10)` retorna NaN, então tratamos isso
  const lastViewTime = lastView ? parseInt(lastView, 10) : 0;

  // Se a última visualização foi há menos de 10 minutos, não incrementa
  if (now - lastViewTime < 10 * 60 * 1000) {
    return;
  }

  // Salvar nova visualização e enviar para o backend
  localStorage.setItem(`menuView-${userId}`, now.toString()); // Convertendo `now` para string
  await fetch(`/api/restaurant-data/menu-views/user/${userId}`, {
    method: "POST",
  });
};

export const MainClient = () => {
  const { modalStack, onOpen, onClose } = useModalStore();
  const currentModal = modalStack[modalStack.length - 1] || null;
  const { data, session } = useStore();

  const userId = data?.userId;

  useEffect(() => {
    registerMenuView(userId);
  }, [userId]);

  return (
    <div className="flex h-screen items-center justify-center relative">
      <div
        className="relative h-full sm:h-[600px] w-[450px] overflow-hidden rounded-[40px] border-[12px] border-gray-800 bg-white shadow-2xl p-6 bg-cover"
        style={{
          backgroundImage: `url(${data?.customization.banner})`,
        }}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <AnimatePresence>
          {currentModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                backgroundColor:
                  data?.customization.background_color || "white",
                color: data?.customization.font_color || "black",
              }}
              className="absolute inset-0 z-10 p-6 overflow-y-auto shadow-2xl rounded-lg">
              <div className="flex justify-end mb-4">
                <div
                  style={{
                    color: data?.customization.font_color || "black",
                  }}
                  onClick={onClose}
                  className="cursor-pointer">
                  <X />
                </div>
              </div>
              <ModalContent
                modalType={currentModal.type}
                categoryId={currentModal.categoryId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative size-32 mx-auto mb-4">
          <Image
            src={data?.customization.logo || placeholder}
            alt="logo"
            fill
            priority
            sizes="(max-width: 768px) 25vw, (max-width: 1200px) 10vw, 200px"
            className="object-contain"
          />
        </div>

        {!data?.customization.isOpen && (
          <Card
            style={{
              backgroundColor: data?.customization.button_color || "white",
              color: data?.customization.font_color || "black",
            }}
            className="text-center mb-10 relative z-0 text-sm">
            A loja está fechada no momento. Volte mais tarde.
            <div>
              <p className="font-semibold my-2">Horários de funcionamento</p>
              {data?.customization.opening_hours.map((item, index) => (
                <p key={index} className="text-xs">
                  {item.day}: {item.open} - {item.close}
                </p>
              ))}
            </div>
          </Card>
        )}

        {/* Main Content */}

        <div className="relative z-0">
          {!data?.customization.isOpen ? (
            <div className="flex justify-center">
              <Card
                style={{
                  backgroundColor: data?.customization.button_color || "white",
                  color: data?.customization.font_color || "black",
                }}
                className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                onClick={() => onOpen("menu")}>
                <UtensilsCrossed />
                Menu
              </Card>
            </div>
          ) : (
            <div>
              {session ? (
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("categories")}>
                    <Sandwich />
                    Categorias
                  </Card>
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("cart")}>
                    <ShoppingCart />
                    Meu carrinho
                  </Card>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("signUp")}>
                    <ClipboardList />
                    Registrar
                  </Card>
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("signIn")}>
                    <Key />
                    Entrar
                  </Card>
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("menu")}>
                    <UtensilsCrossed />
                    Menu
                  </Card>
                  <Card
                    style={{
                      backgroundColor:
                        data?.customization.button_color || "white",
                      color: data?.customization.font_color || "black",
                    }}
                    className="bg-white text-black flex flex-col items-center min-w-28 cursor-pointer"
                    onClick={() => onOpen("cart")}>
                    <ShoppingCart />
                    Meu carrinho
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ModalContent = ({
  modalType,
  categoryId,
}: {
  modalType: string;
  categoryId: string | null | undefined;
}) => {
  switch (modalType) {
    case "signUp":
      return <SignUpForm />;
    case "signIn":
      return <SignInForm />;
    case "categories":
      return <Categories />;
    case "products":
      return <ProductsList categoryId={categoryId} />;
    case "menu":
      return <Menu />;
    case "menuProducts":
      return <MenuProducts categoryId={categoryId} />;
    case "cart":
      return <Cart />;
    default:
      return null;
  }
};

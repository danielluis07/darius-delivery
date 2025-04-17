"use client";

import { House } from "lucide-react";
import { AuthSheet } from "../auth/auth-sheet";
import { CartSheet } from "./cart-sheet";

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed left-0 bottom-0 right-0 max-w-2xl mx-auto h-14 z-10 shadow-3xl bg-white pt-4">
      <div className="flex">
        <div className="flex-1 flex justify-center items-center">
          <div onClick={scrollToTop} className="cursor-pointer">
            <House />
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <CartSheet />
        </div>
        <div className="flex-1 flex justify-center items-center">
          <AuthSheet />
        </div>
      </div>
    </div>
  );
};

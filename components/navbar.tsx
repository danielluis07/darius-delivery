"use client";

import { ExtendedUser } from "@/next-auth";
import Image from "next/image";
import placeholder from "@/public/placeholder-user.jpg";

export const Navbar = ({ user }: { user: ExtendedUser }) => {
  return (
    <nav className="w-full flex items-center justify-end bg-white shadow-sm px-6 py-3 border-b border-gray-200">
      {/* User Profile */}
      <div className="flex items-center gap-4">
        <span className="text-gray-700 font-medium hidden md:inline">
          Bem vindo, {user.name || "Usuário"}
        </span>
        <div className="relative rounded-full w-10 h-10 overflow-hidden border-2 border-gray-300 hover:border-gray-500 transition">
          <Image
            src={user.image || placeholder}
            alt="Usuário"
            fill
            sizes="40px"
            className="object-cover"
          />
        </div>
      </div>
    </nav>
  );
};

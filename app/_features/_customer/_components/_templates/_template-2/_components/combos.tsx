"use client";

import { useGetCombos } from "@/app/_features/_user/_queries/_combos/use-get-combos";
import { useStore } from "@/context/store-context";
import { formatCurrencyFromCents } from "@/lib/utils";
import Image from "next/image";

const combos = [
  {
    id: "1",
    name: "Combo 1",
    description:
      "Praesent placerat, magna in vehicula vestibulum, felis urna cursus lorem, sed vestibulum quam eros vel libero. Vivamus commodo, odio sed fringilla pretium, sem nulla feugiat odio, in cursus elit dolor et ex.",
    price: 1000,
    userId: "1",
    type: "COMBO",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    name: "Combo 2",
    description:
      "Praesent placerat, magna in vehicula vestibulum, felis urna cursus lorem, sed vestibulum quam eros vel libero. Vivamus commodo, odio sed fringilla pretium, sem nulla feugiat odio, in cursus elit dolor et ex.",
    price: 1000,
    userId: "1",
    type: "COMBO",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
    name: "Combo 3",
    description:
      "Praesent placerat, magna in vehicula vestibulum, felis urna cursus lorem, sed vestibulum quam eros vel libero. Vivamus commodo, odio sed fringilla pretium, sem nulla feugiat odio, in cursus elit dolor et ex.",
    price: 1000,
    userId: "1",
    type: "COMBO",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "4",
    name: "Combo 4",
    description:
      "Praesent placerat, magna in vehicula vestibulum, felis urna cursus lorem, sed vestibulum quam eros vel libero. Vivamus commodo, odio sed fringilla pretium, sem nulla feugiat odio, in cursus elit dolor et ex.",
    price: 1000,
    userId: "1",
    type: "COMBO",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1760&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const Combos = () => {
  const { data } = useStore();
  //const { data: combos, isLoading } = useGetCombos(data?.userId);

  /*   if (isLoading) {
    return <p>Carregando combos...</p>;
  } */

  if (!combos || combos.length === 0) {
    return <p>Nenhum combo encontrado.</p>;
  }

  return (
    <div className="w-full mt-10">
      <h1 className="text-lg font-semibold">Combos</h1>
      <div className="grid grid-cols-2 gap-4 mt-5">
        {combos.map((combo) => (
          <div
            key={combo.id}
            className="border rounded-xl p-3 shadow flex items-center justify-between">
            <div className="flex-1 pr-3">
              <h3 className="font-semibold line-clamp-2">{combo.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {combo.description}
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {formatCurrencyFromCents(combo.price)}
              </p>
            </div>
            {combo.image && (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={combo.image}
                  alt={combo.name}
                  fill
                  sizes="96px"
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

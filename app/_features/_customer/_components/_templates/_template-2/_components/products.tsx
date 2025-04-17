"use client";

//import { useStore } from "@/context/store-context";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/utils";
import { useProductModal } from "@/hooks/template-2/use-product-modal";

const products = [
  {
    id: "1",
    userId: "1",
    name: "Produto 1",
    price: 1000,
    description:
      "Nullam quis arcu in magna pulvinar tincidunt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam hendrerit nulla ut cursus laoreet. Nullam elementum lorem vel facilisis laoreet. Cras ac turpis vel erat vehicula venenatis.",
    image:
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "2",
    userId: "1",
    name: "Produto 2",
    price: 2000,
    description: "Descrição do produto 2",
    image:
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "3",
    userId: "1",
    name: "Produto 3",
    price: 3000,
    description: "Descrição do produto 3",
    image:
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
  {
    id: "4",
    userId: "1",
    name: "Produto 4",
    price: 4000,
    description: "Descrição do produto 4",
    image:
      "https://images.unsplash.com/photo-1544982503-9f984c14501a?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2023-01-01T00:00:00Z",
  },
];

export const Products = () => {
  //const { data } = useStore();
  const { openModal } = useProductModal();
  // const { data: products, isLoading } = useGetProducts();
  return (
    <div className="w-full mt-10">
      <h1 className="text-lg font-semibold">Produtos</h1>
      <div className="space-y-4 mt-5">
        {products.map((product) => (
          <div
            key={product.id}
            onClick={() => openModal(product)}
            className="border rounded-xl p-3 shadow flex items-center justify-between cursor-pointer">
            <div className="flex-1 pr-3">
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.description}
              </p>
              <p className="text-sm text-gray-800 font-medium mt-1">
                {formatCurrencyFromCents(product.price)}
              </p>
            </div>
            {product.image && (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={product.image}
                  alt={product.name}
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

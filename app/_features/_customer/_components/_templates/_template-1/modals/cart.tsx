"use client";

import Image from "next/image";
import { useCartStore } from "@/hooks/use-cart-store";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrencyFromCents } from "@/lib/utils";
import { CartItem, OrderData } from "@/types";
import { useStore } from "@/context/store-context";
import { useCreateOrder } from "@/app/_features/_customer/_queries/use-create-order";

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useCartStore();
  const { data, session } = useStore();
  const { mutate, isPending } = useCreateOrder();

  const onSubmit = async (values: CartItem[]) => {
    const orderData: OrderData = {
      items: values,
      totalPrice: values.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      customerId: session?.user?.id || "",
      restaurantOwnerId: data?.userId || "",
    };

    mutate(orderData);
  };

  return (
    <div className="p-4">
      {cart.length === 0 ? (
        <p>Você não possui itens no carrinho</p>
      ) : (
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center border-b py-4 gap-4">
              {/* Image Container */}
              <div className="relative w-24 h-24">
                <Image
                  src={item.image || "/placeholder.png"} // Use a default placeholder if no image
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                  className="object-cover rounded"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-600">
                  {formatCurrencyFromCents(item.price * item.quantity)}
                </p>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    className="px-2 py-1 bg-gray-200 rounded"
                    onClick={() =>
                      updateQuantity(item.id, Math.max(1, item.quantity - 1))
                    }>
                    -
                  </button>
                  <span className="px-2">{item.quantity}</span>
                  <div
                    className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    +
                  </div>
                </div>
              </div>

              {/* Remove Button */}

              <div
                className="text-error cursor-pointer"
                onClick={() => removeFromCart(item.id)}>
                <X />
              </div>
            </div>
          ))}
          <p className="flex justify-between text-lg font-semibold mt-5">
            <span>Total:</span>
            <span>
              {" "}
              {formatCurrencyFromCents(
                cart.reduce(
                  (total, item) => total + item.price * item.quantity,
                  0
                )
              )}
            </span>
          </p>
          <Button
            className="w-full mt-4"
            variant="secondary"
            onClick={() => onSubmit(cart)}>
            Finalizar Compra
          </Button>
        </div>
      )}
    </div>
  );
};

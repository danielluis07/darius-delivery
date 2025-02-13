"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { insertOrderSchema } from "@/db/schemas";
import { Card } from "@/components/ui/card";
import { motion } from "motion/react";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import { useGetProducts } from "@/app/_features/_customer/_queries/use-get-products";
import { Product } from "@/types";
import { useParams } from "next/navigation";
import { useGetUserByDomain } from "@/app/_features/_customer/_queries/use-get-user-by-domain";
import { MoveLeft } from "lucide-react";
import { formatCurrencyFromCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createOrder } from "@/app/_features/_customer/_actions/create-order";
import { LoadingButton } from "@/components/ui/loading-button";
import { useModalStore } from "@/hooks/use-modal-store";

type FormData = z.infer<typeof insertOrderSchema>;

export const ProductsList = ({ categoryId }: { categoryId: string | null }) => {
  const params = useParams<{ subdomain: string }>();
  const { onClose } = useModalStore();
  const [isPending, startTransition] = useTransition();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { data, isLoading: isUserLoading } = useGetUserByDomain(
    params.subdomain
  );
  const { data: products, isLoading: isProductsLoading } = useGetProducts(
    data?.userId,
    categoryId
  );
  const form = useForm<FormData>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      productId: "",
      user_id: data?.userId,
      quantity: 1,
      price: 0,
    },
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setShowOrderDetails(false);
  };

  const handleBack = () => {
    if (showOrderDetails) {
      setShowOrderDetails(false);
    } else {
      setSelectedProduct(null);
    }
  };

  const handleBuyClick = () => {
    setShowOrderDetails(true);
  };

  console.log("selectedProduct price:", selectedProduct?.price);

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    const productId = selectedProduct?.id;
    const price = selectedProduct?.price;

    if (!productId || !price) {
      toast.error("Produto inválido");
      return;
    }

    startTransition(() => {
      createOrder({ ...values, productId, price, user_id: data?.userId })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error creating category:", error);
          toast.error("Erro ao criar categoria");
        });
    });
  };

  if (isUserLoading || isProductsLoading) {
    return <div>Carregando...</div>;
  }

  if (!products) {
    return <div>Não há produtos cadastrados</div>;
  }

  return (
    <div className="relative">
      {showOrderDetails ? (
        <motion.div
          key="orderDetails"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white p-6 z-20">
          <div className="flex justify-end mb-4">
            <div onClick={handleBack} className="cursor-pointer text-gray-600">
              <MoveLeft />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">Detalhes do Pedido</h2>

          {/* Order details form */}
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">{selectedProduct?.name}</h3>
                <p className="text-gray-600">
                  {formatCurrencyFromCents(selectedProduct?.price ?? 0)}
                </p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="text-center"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value
                              ? parseInt(e.target.value, 10)
                              : 0;
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                          max={999}
                          min={0}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <LoadingButton
                type="submit"
                className="w-full"
                label="Finalizar Pedido"
                loadingLabel="Finalizando Pedido..."
                disabled={isPending}
                isPending={isPending}
              />
            </form>
          </Form>
        </motion.div>
      ) : selectedProduct ? (
        <motion.div
          key="productDetails"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-white p-6 z-10">
          <div className="flex justify-end mb-4">
            <div onClick={handleBack} className="cursor-pointer text-gray-600">
              <MoveLeft />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">{selectedProduct.name}</h2>
          <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
          <p className="text-lg font-semibold mb-4">
            {formatCurrencyFromCents(selectedProduct.price)}
          </p>
          <div className="relative w-full h-64">
            <Image
              src={selectedProduct.image || placeholder}
              alt={selectedProduct.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover"
            />
          </div>

          <Button className="w-full my-3" onClick={handleBuyClick}>
            Comprar Produto
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="productList"
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5 }}>
          <div className="space-y-3">
            {products.map((product) => (
              <Card
                key={product.id}
                onClick={() =>
                  handleProductClick({
                    ...product,
                    createdAt: product.createdAt
                      ? new Date(product.createdAt)
                      : null,
                    updatedAt: product.updatedAt
                      ? new Date(product.updatedAt)
                      : null,
                  })
                }
                className="cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-md font-semibold">{product.name}</h2>
                    <p className="text-sm text-gray-500 max-w-52 line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-sm font-semibold">
                      {formatCurrencyFromCents(product.price)}
                    </p>
                  </div>
                  <div className="relative size-24">
                    <Image
                      src={product.image || placeholder}
                      alt={product.name}
                      fill
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

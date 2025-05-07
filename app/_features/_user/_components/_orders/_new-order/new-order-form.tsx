"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { cn, formatCurrency, formatPhoneNumber } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { LoadingButton } from "@/components/ui/loading-button";
import { insertOrderSchema } from "@/db/schemas";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetCustomers } from "@/app/_features/_user/_queries/_customers/use-get-customers";
import { NewOrderSkeleton } from "@/components/skeletons/new-order";
import { NewCustomerForm } from "./new-customer-form";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useCreateOrder } from "@/app/_features/_user/_queries/_orders/use-create-order";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type Products = InferResponseType<
  (typeof client.api.products.store)[":storeId"]["$get"],
  200
>["data"];

type OrderSettings = InferResponseType<
  (typeof client.api.ordersettings.store)[":storeId"]["$get"],
  200
>["data"];

type Customer =
  | {
      id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      street: string | null;
      street_number: string | null;
      complement: string | null;
      neighborhood: string | null;
      city: string | null;
      state: string | null;
      createdAt: string;
    }
  | undefined;

type Items = {
  productId: string;
  quantity: number;
  price: number;
  name: string | null | undefined;
}[];

type FormData = z.infer<typeof insertOrderSchema>;

export const NewOrderForm = ({
  products,
  orderSettings,
  storeId,
  apiKey,
}: {
  products: Products;
  storeId: string;
  orderSettings: OrderSettings | null;
  apiKey: string | null | undefined;
}) => {
  const { data, isLoading } = useGetCustomers(storeId);
  const { mutate, isPending } = useCreateOrder(storeId);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(undefined);
  const form = useForm<FormData>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      storeId,
      price: 0,
      quantity: 1,
      items: [
        {
          productId: "",
          quantity: 1,
          price: 0,
          name: "",
        },
      ],
      obs: "",
      customer_id: "",
      status: "PREPARING",
      payment_status: "PENDING",
      type: "LOCAL",
      payment_type: "CASH",
    },
  });

  const router = useRouter();

  const customers = data || [];

  const selectedProductIds = form.watch("items").map((item) => item.productId);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    if (!orderSettings) {
      toast.error(
        "Você precisa definir os tempos de entrega e retirada do pedido"
      );
      return;
    }

    if (!apiKey) {
      toast.error("Você precisa definir a chave da API do Google Maps");
      return;
    }

    mutate(
      {
        ...values,
        pickup_deadline: orderSettings?.pickup_deadline,
        delivery_deadline: orderSettings?.delivery_deadline,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/${storeId}/orders`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="pt-20">
        <NewOrderSkeleton />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* divs */}
      <div className="flex gap-8">
        <Card className="w-full relative">
          <div className="absolute top-2 right-2">
            <NewCustomerForm storeId={storeId} isOrderPending={isPending} />
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
              <div className="space-y-5">
                <div className="w-[300px]">
                  <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-[300px] justify-between",
                                  !field.value && "text-muted-foreground"
                                )}>
                                {field.value
                                  ? customers.find(
                                      (customer) => customer.id === field.value
                                    )?.name
                                  : "Selecione um cliente"}
                                <ChevronsUpDown className="opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-0">
                            <Command>
                              <CommandInput
                                placeholder="Procurar cliente por nome ou telefone..."
                                className="h-9"
                              />
                              <CommandList>
                                <CommandEmpty>
                                  Nenhum cliente encontrado.
                                </CommandEmpty>
                                <CommandGroup>
                                  {customers.map((customer) => (
                                    <CommandItem
                                      value={`${customer.name} ${customer.phone}`} // Inclui nome e telefone no filtro
                                      key={customer.id}
                                      onSelect={() => {
                                        form.setValue(
                                          "customer_id",
                                          customer.id
                                        );
                                        setSelectedCustomer(customer);
                                      }}>
                                      {/* Exibe nome e telefone na lista */}
                                      <div>
                                        <span>{customer.name}</span>
                                        <span className="text-muted-foreground text-sm ml-2">
                                          {customer.phone}
                                        </span>
                                      </div>
                                      <Check
                                        className={cn(
                                          "ml-auto",
                                          customer.id === field.value
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Produtos */}
                <div className="mt-5 space-y-3">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-4 items-center border p-3 rounded">
                      {/* Produto */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.productId`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col w-[300px]">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between",
                                      !field.value && "text-muted-foreground"
                                    )}>
                                    {field.value
                                      ? products.find(
                                          (product) =>
                                            product.id === field.value
                                        )?.name
                                      : "Selecione um produto"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Buscar produto..."
                                    className="h-9"
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      Nenhum produto encontrado.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {products
                                        .filter(
                                          (product) =>
                                            !selectedProductIds.includes(
                                              product.id
                                            ) || product.id === field.value
                                        )
                                        .map((product) => (
                                          <CommandItem
                                            value={product.name}
                                            key={product.id}
                                            onSelect={() => {
                                              field.onChange(product.id);
                                              const selectedProduct =
                                                products.find(
                                                  (p) => p.id === product.id
                                                );
                                              form.setValue(
                                                `items.${index}.price`,
                                                selectedProduct
                                                  ? selectedProduct.price
                                                  : 0,
                                                {
                                                  shouldValidate: true,
                                                  shouldDirty: true,
                                                }
                                              );
                                            }}>
                                            {product.name}
                                            <Check
                                              className={cn(
                                                "ml-auto h-4 w-4",
                                                product.id === field.value
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantidade */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                className="border p-2 w-16 text-center"
                                min={1}
                                max={999}
                                readOnly={
                                  !form.watch(`items.${index}.productId`)
                                }
                                onChange={(e) => {
                                  const quantity =
                                    parseInt(e.target.value, 10) || 1;
                                  const productId = form.getValues(
                                    `items.${index}.productId`
                                  );
                                  const selectedProduct = products.find(
                                    (product) => product.id === productId
                                  );

                                  // Store only the unit price, not total price
                                  const unitPrice = selectedProduct
                                    ? selectedProduct.price
                                    : 0;
                                  form.setValue(
                                    `items.${index}.price`,
                                    unitPrice
                                  );

                                  field.onChange(quantity);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Preço */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="text"
                                className="border p-2 w-24 text-center"
                                readOnly
                                value={formatCurrency(field.value)}
                                placeholder="R$ 0,00"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Remover Produto */}
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}>
                        <Trash2 />
                      </Button>
                    </div>
                  ))}
                  {/* Botão para Adicionar Produto */}
                  <Button
                    type="button"
                    onClick={() =>
                      append({ productId: "", quantity: 1, price: 0, name: "" })
                    }
                    disabled={
                      selectedProductIds.length >= products.length || isPending
                    }
                    variant="secondary">
                    Adicionar Produto
                  </Button>
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="obs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observação</FormLabel>
                        <FormControl>
                          <Textarea
                            className="resize-none h-24"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo do pedido" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="LOCAL">Local</SelectItem>
                            <SelectItem value="WHATSAPP">Whatsapp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="payment_status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status do Pagamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status do pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PENDING">
                              Aguardando Pagamento
                            </SelectItem>
                            <SelectItem value="PAID">Pago</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="payment_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Pagamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CASH">Dinheiro</SelectItem>
                            <SelectItem value="CREDIT_CARD">Crédito</SelectItem>
                            <SelectItem value="DEBIT_CARD">Débito</SelectItem>
                            <SelectItem value="PIX">PIX</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status do pedido" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PREPARING">
                              Preparando
                            </SelectItem>
                            <SelectItem value="WITHDRAWN">Retirada</SelectItem>
                            <SelectItem value="CONSUME_ON_SITE">
                              Consumir no local
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <LoadingButton
                className="w-full mt-5"
                label="Criar Pedido"
                loadingLabel="Criando"
                disabled={isPending}
                isPending={isPending}
              />
            </form>
          </Form>
        </Card>
        <Receipt
          type={form.watch("type")}
          paymentType={form.watch("payment_type")}
          customer={selectedCustomer}
          items={form.watch("items")}
          obs={form.watch("obs")}
          paymentStatus={form.watch("payment_status")}
        />
      </div>
    </div>
  );
};

const Receipt = ({
  type,
  paymentType,
  customer,
  items,
  obs,
  paymentStatus,
}: {
  type: string;
  paymentType: string;
  customer: Customer;
  items: Items;
  obs: string | null | undefined;
  paymentStatus: string;
}) => {
  const paymentTypeTranslation: Record<string, string> = {
    CASH: "Dinheiro",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    PIX: "PIX",
  };

  const paymentStatusTranslations: Record<string, string> = {
    PENDING: "Aguardando",
    PAID: "Pago",
  };

  const totalPrice = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <div className="w-[450px] border p-4 text-xs font-mono">
      {/* header */}
      <div>
        <h1 className="text-center text-xl font-bold">Nome da Loja</h1>
        <p className="text-center text-sm">(11) 0000-0000</p>
      </div>

      {/* pedido */}
      <div className="flex justify-between mt-5">
        <p className="font-bold text-lg">Pedido</p>
        <p className="font-bold text-lg">nº</p>
      </div>

      {/* origem */}
      <p className="mt-1">Origem: {type}</p>
      <div className="border-t border-dashed border-black my-2"></div>

      {/* cliente */}
      <div>
        <p>Cliente: {customer?.name || "N/A"}</p>
        <p>Tel: {formatPhoneNumber(customer?.phone || "") || "N/A"}</p>
        <p className="w-full break-words overflow-hidden">
          Rua: {customer?.street || "N/A"} - nº {customer?.street_number} -{" "}
          {customer?.complement && `Complemento: ${customer?.complement} - `}{" "}
          {customer?.neighborhood || "N/A"} - {customer?.city || "N/A"} -{" "}
          {customer?.state || "N/A"}
        </p>
      </div>

      {/* produtos */}
      <div className="border-t border-dashed border-black my-2"></div>
      <p className="font-bold">Produtos</p>
      <div className="border-t border-dashed border-black my-1"></div>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item, i) => (
            <div key={i} className="flex justify-between">
              <div>
                <p className="font-bold">{item.name}</p>
                <p>
                  {item.quantity}x {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-bold">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhum produto adicionado</p>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>
      <p>Obs: {obs}</p>

      {/* total */}

      {/* Total */}
      <div className="border-t border-dashed border-black my-2"></div>
      <div className="flex justify-between font-bold text-lg">
        <p>Total</p>
        <p>{formatCurrency(totalPrice)}</p>
      </div>
      <div className="flex justify-between">
        <p>Forma de Pagamento</p>
        <p>{paymentTypeTranslation[paymentType]}</p>
      </div>
      <div className="flex justify-between">
        <p>Status do Pagamento</p>
        <p>{paymentStatusTranslations[paymentStatus]}</p>
      </div>
    </div>
  );
};

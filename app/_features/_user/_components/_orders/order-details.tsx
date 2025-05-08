"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import {
  cn,
  formatCurrency,
  formatCurrencyFromCents,
  formatPhoneNumber,
} from "@/lib/utils";
import { format } from "date-fns";
import {
  Check,
  CheckCircle,
  ChevronsUpDown,
  Clock,
  Trash2,
} from "lucide-react";
import { updateOrderSchema } from "@/db/schemas";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RiMotorbikeFill } from "react-icons/ri";
import Image from "next/image";
import placeholder from "@/public/placeholder-image.jpg";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/components/ui/loading-button";
import { useUpdateOrder } from "@/app/_features/_user/_queries/_orders/use-update-order";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { useRouter } from "next/navigation";

type Products = InferResponseType<
  (typeof client.api.products.store)[":storeId"]["$get"],
  200
>["data"];

type Customers = InferResponseType<
  (typeof client.api.customers.store)[":storeId"]["$get"],
  200
>["data"];

type Deliverers = InferResponseType<
  (typeof client.api.deliverers.store)[":storeId"]["$get"],
  200
>["data"];

type Order = InferResponseType<
  (typeof client.api.orders)[":orderId"]["$get"],
  200
>["data"];

type Customer =
  | {
      id: string | null;
      name: string | null;
      email: string | null;
      phone: string | null;
      street: string | null;
      street_number: string | null;
      complement: string | null;
      neighborhood: string | null;
      city: string | null;
      state: string | null;
      createdAt?: string;
    }
  | undefined;

type FormData = z.infer<typeof updateOrderSchema>;

export const OrderDetails = ({
  storeId,
  orderId,
  products,
  deliverers,
  customers,
  data,
}: {
  storeId: string;
  orderId: string;
  products: Products;
  deliverers: Deliverers;
  customers: Customers;
  data: Order;
}) => {
  const { mutate, isPending } = useUpdateOrder(orderId, storeId);
  const [changeCustomer, setChangeCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(undefined);
  const form = useForm<FormData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      storeId,
      status: data.order.status,
      delivererId: data.deliverer?.id,
      payment_status: data.order.payment_status,
      type: data.order.type,
      delivery_deadline: data.order.delivery_deadline || 0,
      pickup_deadline: data.order.pickup_deadline || 0,
      items: data.products,
      obs: data.order.obs || "",
      city: data.order.city || "",
      state: data.order.state || "",
      neighborhood: data.order.neighborhood || "",
      street: data.order.street || "",
      street_number: data.order.street_number || "",
      postalCode: data.order.postalCode || "",
    },
  });

  const router = useRouter();

  const items = form.watch("items");

  const totalPrice = items.reduce((total, item) => {
    return total + item.quantity * item.price;
  }, 0);

  const selectedProductIds = form.watch("items").map((item) => item.productId);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-blue-500 text-white",
    PREPARING: "bg-yellow-500 text-white",
    IN_TRANSIT: "bg-orange-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    FINISHED: "bg-gray-500 text-white",
    WITHDRAWN: "bg-purple-500 text-white",
    CONSUME_ON_SITE: "bg-green-500 text-white",
  };

  const statusIcons: Record<string, React.ReactNode> = {
    ACCEPTED: <Clock className="w-4 h-4 mr-1" />,
    PREPARING: <Clock className="w-4 h-4 mr-1" />,
    IN_TRANSIT: <RiMotorbikeFill className="w-4 h-4 mr-1" />,
    DELIVERED: <CheckCircle className="w-4 h-4 mr-1" />,
    FINISHED: <CheckCircle className="w-4 h-4 mr-1" />,
  };

  const paymentStatusColors: Record<string, string> = {
    PENDING: "bg-yellow-500 text-white",
    PAID: "bg-green-500 text-white",
  };

  const paymentStatusIcons: Record<string, React.ReactNode> = {
    PENDING: <Clock className="w-4 h-4 mr-1" />,
    PAID: <CheckCircle className="w-4 h-4 mr-1" />,
  };

  const paymentStatusTranslations: Record<string, string> = {
    PENDING: "Aguardando Pagamento",
    PAID: "Pago",
  };

  const statusTranslations: Record<string, string> = {
    ACCEPTED: "Aceito",
    PREPARING: "Em preparo",
    IN_TRANSIT: "Em trânsito",
    DELIVERED: "Entregue",
    FINISHED: "Finalizado",
    WITHDRAWN: "Retirada",
    CONSUME_ON_SITE: "Consumir no local",
  };

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate(
      {
        ...values,
        total_price: totalPrice,
        customerId: values.customer_id,
      },
      {
        onSuccess: () => {
          router.push(`/dashboard/${storeId}/orders`);
        },
      }
    );
  };

  useEffect(() => {
    if (customers && data) {
      const customer = customers.find(
        (customer) => customer.id === data.customer.id
      );
      if (customer) {
        setSelectedCustomer(customer);
        form.setValue("customer_id", customer.id);
      }
    }
  }, [customers, data, form]);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Detalhes do Pedido</h3>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Pedido #{data.order.dailyNumber}
                </span>
                <div className="flex flex-col gap-y-2">
                  <Badge
                    className={cn(
                      paymentStatusColors[data.order.payment_status],
                      "px-2"
                    )}>
                    {paymentStatusIcons[data.order.payment_status]}{" "}
                    {paymentStatusTranslations[data.order.payment_status]}
                  </Badge>
                  <Badge
                    className={cn(statusColors[data.order.status], "px-2")}>
                    {statusIcons[data.order.status]}{" "}
                    {statusTranslations[data.order.status]}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Data:</span>{" "}
                {format(new Date(data.order.createdAt), "dd/MM/yyyy")}
              </p>
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Total:</span>{" "}
                {formatCurrencyFromCents(totalPrice)}
              </p>
              {data.order.change_value && (
                <p className="text-sm text-gray-500">
                  {" "}
                  <span className="font-semibold">
                    Precisa de Troco para:
                  </span>{" "}
                  {formatCurrencyFromCents(data.order.change_value)}
                </p>
              )}
              <FormField
                control={form.control}
                name="obs"
                render={({ field }) => (
                  <FormItem>
                    <p className="text-sm text-gray-500 font-semibold">
                      Observação:
                    </p>
                    <FormControl>
                      <Textarea
                        placeholder="Adicione alguma informação sobre esse pedido"
                        className="resize-none"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Produtos</h3>
              <Separator className="my-2" />
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
                        <FormItem className="w-[300px]">
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedProduct = products.find(
                                (product) => product.id === value
                              );
                              form.setValue(
                                `items.${index}.price`,
                                selectedProduct ? selectedProduct.price : 0
                              );
                            }}
                            value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products
                                .filter(
                                  (product) =>
                                    !selectedProductIds.includes(product.id) ||
                                    product.id === field.value
                                )
                                .map((product) => (
                                  <SelectItem
                                    key={product.id}
                                    value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>

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
                              readOnly={!form.watch(`items.${index}.productId`)}
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
              {/*  */}
              <div className="space-y-4 mt-2">
                {data.combos.length > 0
                  ? data.combos.map((product, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="relative w-28 h-20 rounded-lg overflow-hidden">
                          <Image
                            src={product.image || placeholder}
                            alt={product.name || "Product Image"}
                            fill
                            sizes="(max-width: 640px) 50px, (max-width: 1024px) 80px, 100px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-500">
                            {product.description || "Sem descrição"}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Quantidade:</span>{" "}
                            {product.quantity || 1}
                          </p>
                          <p className="text-sm text-gray-500">
                            <span className="font-semibold">Preço:</span>{" "}
                            {formatCurrencyFromCents(product.price)}
                          </p>
                        </div>
                      </div>
                    ))
                  : null}
              </div>
            </div>

            <div className="w-full">
              <div className="flex items-center gap-x-2">
                <h3 className="text-lg font-semibold">
                  Informações do Cliente
                </h3>
                <Button
                  type="button"
                  className="text-xs"
                  variant="outline"
                  onClick={() => setChangeCustomer(!changeCustomer)}>
                  {changeCustomer ? "Cancelar" : "Alterar Cliente"}
                </Button>
              </div>
              <Separator className="my-2" />
              <div>
                {changeCustomer && (
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
                                        form.setValue(
                                          "city",
                                          customer.city || ""
                                        );
                                        form.setValue(
                                          "state",
                                          customer.state || ""
                                        );
                                        form.setValue(
                                          "neighborhood",
                                          customer.neighborhood || ""
                                        );
                                        form.setValue(
                                          "street",
                                          customer.street || ""
                                        );
                                        form.setValue(
                                          "street_number",
                                          customer.street_number || ""
                                        );
                                        form.setValue(
                                          "postalCode",
                                          customer.postalCode || ""
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
                )}
                <div className="mt-3 pl-1">
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Nome:</span>{" "}
                    {selectedCustomer?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Email:</span>{" "}
                    {selectedCustomer?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Telefone:</span>{" "}
                    {formatPhoneNumber(selectedCustomer?.phone || "")}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 mt-5 gap-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="street_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </Card>
          <Card className="p-6 mt-6">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FormField
                  control={form.control}
                  name="delivery_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tempo máximo para entrega (em minutos)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                  name="pickup_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Tempo máximo para retirada (em minutos)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          min="0"
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
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
                  name="delivererId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Associar a um entregador</FormLabel>
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
                                ? deliverers.find(
                                    (deliverer) => deliverer.id === field.value
                                  )?.name
                                : "Selecione um entregador"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Procurar entregador..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum entregador encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {deliverers.map((deliverer) => (
                                  <CommandItem
                                    value={deliverer.name ?? ""}
                                    key={deliverer.id}
                                    onSelect={() => {
                                      form.setValue(
                                        "delivererId",
                                        deliverer.id
                                      );
                                    }}>
                                    {deliverer.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
                                        deliverer.id === field.value
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
                            <SelectValue />
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
                            <SelectValue />
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
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PREPARING">Preparando</SelectItem>
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
              label="Salvar"
              loadingLabel="Salvando"
              className="w-full mt-5"
              disabled={isPending}
              isPending={isPending}
            />
          </Card>
        </form>
      </Form>
    </div>
  );
};

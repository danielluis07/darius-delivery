"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
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
import { useForm, FieldErrors } from "react-hook-form";
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
import { createOrder } from "@/app/_features/_user/_actions/create-order";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Products = InferResponseType<
  (typeof client.api.products)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertOrderSchema>;

export const NewOrderForm = ({
  products,
  userId,
}: {
  products: Products;
  userId: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const { data, isLoading } = useGetCustomers(userId);
  const form = useForm<FormData>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      price: 0,
      quantity: 1,
      productId: "",
      customer_id: "",
      status: "PREPARING",
      payment_status: "PENDING",
      type: "LOCAL",
    },
  });

  const router = useRouter();

  const customers = data || [];

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(() => {
      createOrder(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push(`${res.url}`);
          }
        })
        .catch((error) => {
          console.error("Error creating order:", error);
          toast.error("Erro ao criar o pedido");
        });
    });
  };

  if (isLoading) {
    return (
      <div className="pt-20">
        <NewOrderSkeleton />
      </div>
    );
  }

  return (
    <Card className="relative max-w-4xl mx-auto">
      <div className="absolute top-2 right-2">
        <NewCustomerForm />
      </div>
      <Form {...form}>
        <form
          className="pt-20"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <div className="flex items-center gap-5 h-[300px]">
            <div className="flex flex-col justify-between size-full">
              <div className="w-[300px]">
                <FormField
                  control={form.control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Cliente</FormLabel>
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
                              placeholder="Procurar cliente..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum cliente encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {customers.map((customer) => (
                                  <CommandItem
                                    value={customer.name ?? ""}
                                    key={customer.id}
                                    onSelect={() => {
                                      form.setValue("customer_id", customer.id);
                                    }}>
                                    {customer.name}
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

              <div className="w-[300px]">
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Produto</FormLabel>
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
                                ? products.find(
                                    (product) => product.id === field.value
                                  )?.name
                                : "Selecione um produto"}
                              <ChevronsUpDown className="opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Procurar produto..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>
                                Nenhum produto encontrado.
                              </CommandEmpty>
                              <CommandGroup>
                                {products.map((product) => (
                                  <CommandItem
                                    value={product.name ?? ""}
                                    key={product.id}
                                    onSelect={() => {
                                      const selectedProduct = products.find(
                                        (product) => product.id === product.id
                                      );
                                      if (selectedProduct) {
                                        form.setValue("productId", product.id);
                                        form.setValue(
                                          "price",
                                          selectedProduct.price
                                        );
                                      }
                                    }}>
                                    {product.name}
                                    <Check
                                      className={cn(
                                        "ml-auto",
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
              </div>

              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={formatCurrency(field.value)}
                          placeholder="R$ 0,00"
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            const numericValue = rawValue
                              ? parseInt(rawValue, 10)
                              : 0;
                            field.onChange(numericValue);
                          }}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            const productId = form.getValues("productId");
                            const selectedProduct = products.find(
                              (product) => product.id === productId
                            );
                            if (selectedProduct) {
                              const totalPrice = selectedProduct.price * value;
                              form.setValue("price", totalPrice);
                            }
                            field.onChange(isNaN(value) ? 0 : value);
                          }}
                          max={999}
                          min={1}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* div 2 */}
            <div className="flex flex-col justify-between size-full">
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
                          <SelectItem value="WEBSITE">Site</SelectItem>
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
                          <SelectItem value="PREPARING">Preparando</SelectItem>
                          <SelectItem value="DELIVERING">
                            Em trânsito
                          </SelectItem>
                          <SelectItem value="DELIVERED">Entregue</SelectItem>
                          <SelectItem value="CANCELED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
  );
};

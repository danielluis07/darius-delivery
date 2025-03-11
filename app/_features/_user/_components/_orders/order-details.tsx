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
import { useForm, FieldErrors } from "react-hook-form";
import { cn, formatCurrencyFromCents, formatPhoneNumber } from "@/lib/utils";
import { format } from "date-fns";
import { Check, CheckCircle, ChevronsUpDown, Clock } from "lucide-react";
import { updateOrderSchema } from "@/db/schemas";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RiMotorbikeFill } from "react-icons/ri";
import { useGetOrder } from "@/app/_features/_user/_queries/_orders/use-get-order";
import { useGetDeliverers } from "@/app/_features/_user/_queries/_deliverers/use-get-deliverers";
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
import { useEffect } from "react";
import { Input } from "@/components/ui/input";

type FormData = z.infer<typeof updateOrderSchema>;

export const OrderDetails = ({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}) => {
  const { data, isLoading } = useGetOrder(orderId);
  const { data: deliverersData, isLoading: isDeliverersLoading } =
    useGetDeliverers(userId);
  const { mutate, isPending } = useUpdateOrder(orderId);
  const form = useForm<FormData>({
    resolver: zodResolver(updateOrderSchema),
    defaultValues: {
      status: undefined,
      delivererId: "",
      payment_status: undefined,
      type: undefined,
      delivery_deadline: 0,
      pickup_deadline: 0,
    },
  });

  const { reset } = form;

  const deliverers = deliverersData || [];

  useEffect(() => {
    if (data) {
      reset({
        status: data.order.status,
        delivererId: data.deliverer?.id,
        payment_status: data.order.payment_status,
        type: data.order.type,
        delivery_deadline: data.order.delivery_deadline || 0,
        pickup_deadline: data.order.pickup_deadline || 0,
      });
    }
  }, [data, reset]);

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-blue-500 text-white",
    PREPARING: "bg-yellow-500 text-white",
    IN_TRANSIT: "bg-orange-500 text-white",
    DELIVERED: "bg-green-500 text-white",
    FINISHED: "bg-gray-500 text-white",
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
  };

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate(values);
  };

  if (isLoading || isDeliverersLoading) {
    return <div>Carregando...</div>;
  }

  if (!data) {
    return <div>Pedido não encontrado</div>;
  }

  return (
    <div className="w-full">
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
              <Badge className={cn(statusColors[data.order.status], "px-2")}>
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
            {formatCurrencyFromCents(data.order.totalPrice)}
          </p>
          {data.order.change_value && (
            <p className="text-sm text-gray-500">
              {" "}
              <span className="font-semibold">Precisa de Troco para:</span>{" "}
              {formatCurrencyFromCents(data.order.change_value)}
            </p>
          )}
          {data.order.obs && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold">Observações:</span>{" "}
              {data.order.obs}
            </p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold">Produtos</h3>
          <Separator className="my-2" />
          <div className="space-y-4">
            {data.products.length > 0 ? (
              data.products.map((product, index) => (
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
            ) : (
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold">Informações do Cliente</h3>
          <Separator className="my-2" />
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Nome:</span> {data.customer.name}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Email:</span> {data.customer.email}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Telefone:</span>{" "}
            {formatPhoneNumber(data.customer.phone || "")}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold">Endereço:</span>{" "}
            {data.customer.street}, nº{data.customer.street_number},{" "}
            {data.customer.neighborhood}, {data.customer.city} -{" "}
            {data.customer.state}, {data.customer.postalCode}
          </p>
        </div>
      </Card>
      <Card className="p-6 mt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
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
                          <SelectItem value="IN_TRANSIT">
                            Em trânsito
                          </SelectItem>
                          <SelectItem value="DELIVERED">Entregue</SelectItem>
                          <SelectItem value="FINISHED">Finalizado</SelectItem>
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
          </form>
        </Form>
      </Card>
    </div>
  );
};

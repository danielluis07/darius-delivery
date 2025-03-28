"use client";

import { z } from "zod";
import { InputMask } from "@react-input/mask";
import Image from "next/image";
import { FaPix, FaCreditCard, FaMoneyBill1Wave } from "react-icons/fa6";
import { useCartStore } from "@/hooks/use-cart-store";
import { X } from "lucide-react";
import { formatCurrency, formatCurrencyFromCents } from "@/lib/utils";
import { useStore } from "@/context/store-context";
import {
  useCreateCashOnDeliveryOrder,
  useCreateCashWebsiteOrder,
} from "@/app/_features/_customer/_queries/use-create-order";
import { JSX, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PixModal } from "@/components/pix-modal";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { checkDeliveryArea } from "@/app/_features/_customer/_actions/check-delivery-area";
import { useCheckDeliveryAreaDialog } from "@/hooks/use-check-delivery-area";
import { CheckDeliveryAreaDialog } from "@/app/_features/_customer/_components/_templates/_template-1/delivery-area-dialog";
import { useDeliveryFeeAlert } from "@/hooks/use-delivery-areas-fee-alert";
import { FeeAlertDialog } from "@/app/_features/_customer/_components/_templates/_template-1/fee-alert-dialog";

enum STEPS {
  FIRST = 0,
  SECOND = 1,
}

const orderSchema = z
  .object({
    items: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string().nullable(),
        createdAt: z.union([z.string(), z.date()]).nullable(),
        updatedAt: z.union([z.string(), z.date()]).nullable(),
        userId: z.string().nullable(),
        price: z.number(),
        description: z.string().nullable(),
        category_id: z.string().nullable(),
        quantity: z.number(),
      })
    ),
    totalPrice: z.number(),
    obs: z.string().optional(),
    customerId: z.string(),
    needChange: z.preprocess((val) => val === "true", z.boolean()),
    changeValue: z.number().optional(),
    restaurantOwnerId: z.string(),
    paymentMethod: z.enum(["PIX", "CREDIT_CARD", "CASH", "CARD"]),
    deliveryDeadline: z.number().optional(),
    fee: z.number().optional(),
    pickupDeadline: z.number().optional(),
    apiKey: z.string(),
    googleApiKey: z.string().optional(),
    walletId: z.string().optional(),
    asaasCustomerId: z.string().optional(),
    creditCard: z
      .object({
        holderName: z.string(),
        number: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        ccv: z.string(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentMethod === "CREDIT_CARD") {
      if (!data.creditCard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Os dados do cartão de crédito são obrigatórios",
          path: ["creditCard"],
        });
        return;
      }

      // Validate each field and add specific issues
      if (data.creditCard.holderName.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome do titular é obrigatório",
          path: ["creditCard", "holderName"],
        });
      }

      if (data.creditCard.number.length < 13) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número do cartão deve ter pelo menos 13 dígitos",
          path: ["creditCard", "number"],
        });
      }

      if (!/^(0[1-9]|1[0-2])$/.test(data.creditCard.expiryMonth)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mês deve ser entre 01 e 12",
          path: ["creditCard", "expiryMonth"],
        });
      }

      if (!/^\d{4}$/.test(data.creditCard.expiryYear)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano deve ter 4 dígitos",
          path: ["creditCard", "expiryYear"],
        });
      }

      if (!/^\d{3,4}$/.test(data.creditCard.ccv)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CCV deve ter 3 ou 4 dígitos",
          path: ["creditCard", "ccv"],
        });
      }
    }
    // No issues added for other payment methods, so validation passes
  });

export type OrderData = z.infer<typeof orderSchema>;

export const Cart = () => {
  const params = useParams<{ domain: string }>();
  const { cart, removeFromCart, updateQuantity } = useCartStore();
  const { onOpen } = useCheckDeliveryAreaDialog();
  const { onOpenAlert } = useDeliveryFeeAlert();
  const [step, setStep] = useState<STEPS>(STEPS.FIRST);
  const { data, session } = useStore();

  const form = useForm<OrderData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      items: cart,
      totalPrice: cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      customerId: session?.user?.id || "",
      restaurantOwnerId: data?.userId || "",
      asaasCustomerId: session?.user.asaasCustomerId,
      paymentMethod: undefined,
      needChange: false,
      apiKey: data?.apiKey,
      googleApiKey: data?.googleApiKey,
      walletId: data?.walletId,
      changeValue: undefined,
      obs: "",
      creditCard: {
        holderName: "",
        number: "",
        expiryMonth: "",
        expiryYear: "",
        ccv: "",
      },
    },
  });

  const { mutate: mutateCashOnWebsite, isPending: isPendingCashOnWebsite } =
    useCreateCashWebsiteOrder(params.domain);
  const { mutate: mutateCashOnDelivery, isPending: isPendingCashOnDelivery } =
    useCreateCashOnDeliveryOrder(params.domain);

  const paymentMethods = data?.customization.payment_methods || [];

  // Mapeamento de ícones
  const paymentIcons: Record<string, JSX.Element> = {
    PIX: <FaPix className="text-[#00BDAE]" />,
    CREDIT_CARD: <FaCreditCard className="text-blue-700" />,
    CASH: <FaMoneyBill1Wave className="text-green-600" />,
    CARD: <FaCreditCard className="text-blue-700" />,
  };

  // Mapeamento de tradução
  const paymentTranslations: Record<string, string> = {
    PIX: "PIX",
    CREDIT_CARD: "Cartão de Crédito",
    CASH: "Dinheiro",
    CARD: "Cartão",
  };

  const onlinePayments = ["PIX", "CREDIT_CARD"];
  const offlinePayments = ["CASH", "CARD"];

  // Separar métodos entre os grupos
  const sitePayments = paymentMethods.filter((method) =>
    onlinePayments.includes(method)
  );
  const deliveryPayments = paymentMethods.filter((method) =>
    offlinePayments.includes(method)
  );

  const handleNextStep = () => {
    setStep(STEPS.SECOND);
  };

  const handlePreviousStep = () => {
    setStep(STEPS.FIRST);
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = async (values: OrderData) => {
    if (!session?.user) {
      toast.error("Você precisa estar logado para finalizar o pedido");
      return;
    }

    const cleanedCreditCard =
      values.paymentMethod === "CREDIT_CARD" && values.creditCard
        ? {
            ...values.creditCard,
            number: values.creditCard.number.replace(/\s/g, ""), // Remove all spaces
          }
        : undefined;

    const { success, message, fee } = await checkDeliveryArea(
      values.customerId,
      values.restaurantOwnerId,
      values.googleApiKey || ""
    );

    if (!success) {
      onOpen();
      return;
    }

    const orderData: OrderData = {
      items: cart,
      totalPrice: cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
      customerId: values.customerId,
      needChange: values.needChange,
      obs: values.obs || "",
      changeValue: values.changeValue || undefined,
      apiKey: values.apiKey,
      deliveryDeadline: data?.orderSettings.delivery_deadline || undefined,
      restaurantOwnerId: data?.userId || "",
      walletId: values.walletId,
      fee,
      paymentMethod: values.paymentMethod,
      asaasCustomerId: values.asaasCustomerId,
      creditCard: cleanedCreditCard,
    };

    if (success && fee) {
      onOpenAlert(orderData, message, params.domain);
    }

    if (
      orderData?.paymentMethod === "CASH" ||
      orderData?.paymentMethod === "CARD"
    ) {
      mutateCashOnDelivery(orderData);
    } else {
      mutateCashOnWebsite(orderData);
    }
  };

  console.log(cart);

  return (
    <>
      <PixModal />
      <CheckDeliveryAreaDialog />
      <FeeAlertDialog />
      <div
        style={{
          backgroundColor: data?.customization.background_color || "white",
          color: data?.customization.font_color || "black",
        }}
        className="p-4">
        {cart.length === 0 ? (
          <p>Você não possui itens no carrinho</p>
        ) : (
          <div>
            {step === STEPS.FIRST && (
              <ScrollArea className="h-72 px-2 rounded-md border">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center border-b py-4 gap-4">
                    <div className="relative w-24 h-24">
                      <Image
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100px, (max-width: 1200px) 150px, 200px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p
                        style={{
                          color: data?.customization.font_color || "black",
                        }}>
                        {formatCurrencyFromCents(item.price * item.quantity)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          style={{
                            backgroundColor:
                              data?.customization.button_color || "white",
                            color: data?.customization.font_color || "black",
                          }}
                          className="px-2 py-1 rounded"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              Math.max(1, item.quantity - 1)
                            )
                          }>
                          -
                        </button>
                        <span className="px-2">{item.quantity}</span>
                        <button
                          style={{
                            backgroundColor:
                              data?.customization.button_color || "white",
                            color: data?.customization.font_color || "black",
                          }}
                          className="px-2 py-1 bg-gray-200 rounded cursor-pointer"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }>
                          +
                        </button>
                      </div>
                    </div>
                    <div
                      className="text-error cursor-pointer"
                      style={{
                        color: data?.customization.font_color || "black",
                      }}
                      onClick={() =>
                        removeFromCart(item.id, data?.userId || "")
                      }>
                      <X />
                    </div>
                  </div>
                ))}
              </ScrollArea>
            )}

            {step === STEPS.SECOND && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, onInvalid)}
                  className="w-full">
                  <h3 className="text-lg font-semibold mb-5 text-center">
                    Forma de Pagamento
                  </h3>
                  <div className="space-y-4">
                    {/* Pagamento pelo site */}
                    {sitePayments.length > 0 && (
                      <div className="border border-gray-200 p-4 rounded-md">
                        <h3 className="font-semibold mb-5">Darius Pay</h3>
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2">
                                  {sitePayments.map((method) => (
                                    <FormItem
                                      key={method}
                                      className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem
                                          value={method}
                                          id={method}
                                        />
                                      </FormControl>
                                      {paymentIcons[method]}
                                      <FormLabel
                                        className="font-normal"
                                        htmlFor={method}>
                                        {paymentTranslations[method] ?? method}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Pagamento na entrega */}
                    {deliveryPayments.length > 0 && (
                      <div className="border border-gray-200 p-4 rounded-md">
                        <h3 className="font-semibold mb-5">
                          Pagamento na entrega
                        </h3>
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value}
                                  className="space-y-2">
                                  {deliveryPayments.map((method) => (
                                    <FormItem
                                      key={method}
                                      className="flex items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <RadioGroupItem
                                          value={method}
                                          id={method}
                                        />
                                      </FormControl>
                                      {paymentIcons[method]}
                                      <FormLabel
                                        className="font-normal"
                                        htmlFor={method}>
                                        {paymentTranslations[method] ?? method}
                                      </FormLabel>
                                    </FormItem>
                                  ))}
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {form.watch("paymentMethod") === "CREDIT_CARD" && (
                      <div className="border border-gray-200 p-4 rounded-md mt-4">
                        <h3 className="font-semibold mb-5">
                          Detalhes do Cartão de Crédito
                        </h3>
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="creditCard.holderName"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>Nome do Titular</FormLabel>
                                <FormControl>
                                  <input
                                    style={{
                                      color: "black",
                                    }}
                                    {...field}
                                    placeholder="João Silva"
                                    className="w-full p-2 border rounded-md"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div>
                            <FormField
                              control={form.control}
                              name="creditCard.number"
                              render={({ field }) => (
                                <FormItem className="w-full">
                                  <FormLabel>Número do Cartão</FormLabel>
                                  <FormControl>
                                    <InputMask
                                      style={{
                                        color: "black",
                                      }}
                                      mask="____ ____ ____ ____"
                                      replacement={{ _: /\d/ }}
                                      placeholder="1234 5678 9012 3456"
                                      className="w-full p-2 border rounded-md"
                                      onChange={field.onChange}
                                      value={field.value}
                                      showMask={false} // Optional: hides the mask characters when empty
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name="creditCard.expiryMonth"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Mês de Validade</FormLabel>
                                    <FormControl>
                                      <input
                                        style={{
                                          color: "black",
                                        }}
                                        {...field}
                                        placeholder="12"
                                        className="w-full p-2 border rounded-md"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <FormField
                                control={form.control}
                                name="creditCard.expiryYear"
                                render={({ field }) => (
                                  <FormItem className="w-full">
                                    <FormLabel>Ano de Validade</FormLabel>
                                    <FormControl>
                                      <input
                                        style={{
                                          color: "black",
                                        }}
                                        {...field}
                                        placeholder="2025"
                                        className="w-full p-2 border rounded-md"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                          <FormField
                            control={form.control}
                            name="creditCard.ccv"
                            render={({ field }) => (
                              <FormItem className="w-full">
                                <FormLabel>CCV</FormLabel>
                                <FormControl>
                                  <input
                                    style={{
                                      color: "black",
                                    }}
                                    {...field}
                                    placeholder="123"
                                    className="w-full p-2 border rounded-md"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {form.watch("paymentMethod") === "CASH" && (
                      <div>
                        <FormField
                          control={form.control}
                          name="needChange"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Precisa de troco?</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  value={field.value?.toString()}
                                  className="flex flex-col space-y-1">
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="true" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Sim
                                    </FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="false" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Não
                                    </FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {form.watch("needChange")?.toString() === "true" && (
                          <FormField
                            control={form.control}
                            name="changeValue"
                            render={({ field }) => (
                              <FormItem className="w-full mt-5">
                                <FormControl>
                                  <input
                                    {...field}
                                    placeholder="Informe o valor"
                                    value={formatCurrency(field.value || 0)}
                                    onChange={(e) => {
                                      const rawValue = e.target.value.replace(
                                        /\D/g,
                                        ""
                                      );
                                      const numericValue = rawValue
                                        ? parseInt(rawValue, 10)
                                        : 0;
                                      field.onChange(numericValue);
                                    }}
                                    className="w-full p-2 border rounded-md"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  <FormField
                    control={form.control}
                    name="obs"
                    render={({ field }) => (
                      <FormItem className="mt-5 w-full">
                        <FormControl>
                          <textarea
                            style={{
                              color: "black",
                            }}
                            placeholder="Insira alguma observação ou detalhe (opcional)"
                            className="resize-none text-sm w-full p-2 border rounded-md"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <p className="flex justify-between text-lg font-semibold mt-5">
                    <span>Total:</span>
                    <span>
                      {formatCurrencyFromCents(
                        cart.reduce(
                          (total, item) => total + item.price * item.quantity,
                          0
                        )
                      )}
                    </span>
                  </p>

                  <div className="flex justify-between mt-4">
                    <button
                      type="button"
                      onClick={handlePreviousStep}
                      style={{
                        backgroundColor:
                          data?.customization.button_color || "white",
                        color: data?.customization.font_color || "black",
                      }}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-40 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                      Voltar
                    </button>
                    <button
                      type="submit"
                      disabled={
                        isPendingCashOnWebsite || isPendingCashOnDelivery
                      }
                      style={{
                        backgroundColor:
                          data?.customization.button_color || "white",
                        color: data?.customization.font_color || "black",
                      }}
                      className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-40 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                      Finalizar Pedido
                    </button>
                  </div>
                </form>
              </Form>
            )}

            {step === STEPS.FIRST && (
              <button
                onClick={handleNextStep}
                style={{
                  backgroundColor: data?.customization.button_color || "white",
                  color: data?.customization.font_color || "black",
                }}
                className="inline-flex items-center justify-center gap-2 h-9 mt-3 px-4 py-2 w-full whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
                Continuar
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

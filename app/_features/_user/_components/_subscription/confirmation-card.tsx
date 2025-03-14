"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputMask } from "@react-input/mask";
import { createSubscription } from "../../_actions/create-subscription";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const creditCardSchema = z.object({
  holderName: z
    .string()
    .nonempty({ message: "O nome do titular é obrigatório." })
    .min(3, { message: "O nome do titular deve ter pelo menos 3 caracteres." })
    .regex(/^[a-zA-Z\s]+$/, {
      message: "O nome do titular deve conter apenas letras e espaços.",
    }),

  number: z.string(),

  expiryMonth: z
    .string()
    .nonempty({ message: "O mês de expiração é obrigatório." })
    .regex(/^(0[1-9]|1[0-2])$/, {
      message: "O mês de expiração deve estar entre 01 e 12.",
    }),

  expiryYear: z
    .string()
    .nonempty({ message: "O ano de expiração é obrigatório." })
    .regex(/^\d{4}$/, {
      message: "O ano de expiração deve ter 4 dígitos.",
    })
    .refine(
      (year) => {
        const currentYear = new Date().getFullYear();
        return parseInt(year, 10) >= currentYear;
      },
      { message: "O ano de expiração deve ser maior ou igual ao ano atual." }
    ),

  ccv: z
    .string()
    .nonempty({ message: "O código de segurança (CCV) é obrigatório." })
    .regex(/^\d{3,4}$/, {
      message: "O CCV deve ter 3 ou 4 dígitos numéricos.",
    }),
});

type FormData = z.infer<typeof creditCardSchema>;

export const ConfirmationCard = ({
  value,
  price,
}: {
  value: "BASIC" | "PREMIUM";
  price: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      holderName: "",
      number: "",
      expiryMonth: "",
      expiryYear: "",
      ccv: "",
    },
  });
  const router = useRouter();
  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const priceToNumber = Number(price);

  const handleSubmit = (values: FormData) => {
    startTransition(() => {
      createSubscription(
        { ...values, number: values.number.replace(/\s/g, "") },
        priceToNumber,
        value
      ).then((res) => {
        if (!res.success) {
          toast.error(res.message);
        }

        if (res.success && res.callbackUrl) {
          toast.success(res.message);
          router.push(res.callbackUrl);
        }
      });
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme sua Assinatura</CardTitle>
        <CardDescription>
          Insira as informações do seu cartão abaixo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="holderName"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Nome do Titular</FormLabel>
                    <FormControl>
                      <Input
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
                  name="number"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <div className="flex items-center justify-between">
                        <FormLabel>Número do Cartão</FormLabel>
                        <div className="flex gap-2">
                          <Image
                            src="/logo-visa.png"
                            alt="Visa"
                            width={40}
                            height={40}
                          />
                          <Image
                            src="/logo-mastercard.png"
                            alt="Mastercard"
                            width={40}
                            height={40}
                          />
                        </div>
                      </div>
                      <FormControl>
                        <InputMask
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
                    name="expiryMonth"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Mês de Validade</FormLabel>
                        <FormControl>
                          <Input
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
                    name="expiryYear"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Ano de Validade</FormLabel>
                        <FormControl>
                          <Input
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
                name="ccv"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>CCV</FormLabel>
                    <FormControl>
                      <Input
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

            <Button disabled={isPending} className="w-full mt-5">
              Confirmar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

"use client";

import { z } from "zod";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { requestWithdrawlSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestWithDrawl } from "@/app/_features/_user/_actions/request-withdrawl";

// Define o tipo de dados do formulário
type FormData = z.infer<typeof requestWithdrawlSchema>;

export const RequestWithDrawlForm = ({
  bankAccount,
  bankAgency,
  cpfCnpj,
  bankCode,
  bankAccountDigit,
  bankAccountType,
  ownerName,
  pixAddressKey,
}: {
  bankAccount: string | null | undefined;
  bankAgency: string | null | undefined;
  cpfCnpj: string | null | undefined;
  bankCode: string | null | undefined;
  bankAccountDigit: string | null | undefined;
  bankAccountType: string | null | undefined;
  ownerName: string | null | undefined;
  pixAddressKey: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(requestWithdrawlSchema),
    defaultValues: {
      value: undefined,
      cpfCnpj: cpfCnpj || "",
      bankAccount: bankAccount || "",
      bankAgency: bankAgency || "",
      bankCode: bankCode || "",
      bankAccountDigit: bankAccountDigit || "",
      bankAccountType: bankAccountType || "",
      ownerName: ownerName || "",
      pixAddressKey: pixAddressKey || "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      requestWithDrawl(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }
          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while updating requesting withdrawl:", error);
          toast.error("Erro ao solicitar o saque");
        });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Solicitar Saque</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="bg-white space-y-10"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            {/* Nome do titular */}
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={
                        field.value
                          ? new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(Number(field.value))
                          : "R$ 0,00"
                      }
                      type="text"
                      placeholder="R$ 0,00"
                      onChange={(e) => {
                        // Remove tudo que não for número
                        const rawValue = e.target.value.replace(/\D/g, "");

                        // Converte para número e divide por 100 para obter centavos corretamente
                        const numericValue = rawValue
                          ? (parseInt(rawValue, 10) / 100).toFixed(2)
                          : "0.00";

                        // Atualiza o campo no formato esperado pelo Asaas (ex: 100.00)
                        field.onChange(numericValue);
                      }}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Botão de envio */}
            <LoadingButton
              label="Solicitar"
              loadingLabel="Solicitando..."
              className="w-full mt-4"
              disabled={isPending}
              isPending={isPending}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

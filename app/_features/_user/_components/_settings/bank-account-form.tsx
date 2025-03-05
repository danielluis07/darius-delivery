"use client";

import { z } from "zod";
import { useTransition } from "react";
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
import { insertBankAccountSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { insertBankAccount } from "@/app/_features/_user/_actions/insert-bank-account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define o tipo de dados do formulário
type FormData = z.infer<typeof insertBankAccountSchema>;

export const BankAccountForm = ({
  bankAccount,
  bankAgency,
  bankCode,
  bankAccountDigit,
  bankAccountType,
  ownerName,
}: {
  bankAccount: string | null | undefined;
  bankAgency: string | null | undefined;
  bankCode: string | null | undefined;
  bankAccountDigit: string | null | undefined;
  bankAccountType: string | null | undefined;
  ownerName: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertBankAccountSchema),
    defaultValues: {
      bankAccount: bankAccount || "",
      bankAgency: bankAgency || "",
      bankCode: bankCode || "",
      bankAccountDigit: bankAccountDigit || "",
      bankAccountType: bankAccountType || "",
      ownerName: ownerName || "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    console.log(values);
    startTransition(() => {
      insertBankAccount(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }
          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while inserting bank account data:", error);
          toast.error("Erro ao inserir os dados");
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Conta Bancária</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="bg-white space-y-10"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-3 gap-4">
              {/* Nome do titular */}
              <FormField
                control={form.control}
                name="ownerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Nome do Titular
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de conta */}
              <FormField
                control={form.control}
                name="bankAccountType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Tipo de Conta
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      required>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o nome do template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CONTA_CORRENTE">
                          Conta Corrente
                        </SelectItem>
                        <SelectItem value="CONTA_POUPANCA">
                          Conta Poupança
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Código do banco */}
              <FormField
                control={form.control}
                name="bankCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Código do Banco
                    </FormLabel>
                    <FormControl>
                      <Input
                        required
                        placeholder="Ex: 001 (Banco do Brasil)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Agência bancária */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bankAgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Agência
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número da agência"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Número da conta */}
              <FormField
                control={form.control}
                name="bankAccount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Conta Bancária
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Número da conta"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dígito da conta */}
              <FormField
                control={form.control}
                name="bankAccountDigit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium">
                      Dígito da Conta
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Dígito verificador"
                        {...field}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Botão de envio */}
            <LoadingButton
              label="Cadastrar Conta"
              loadingLabel="Cadastrando..."
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

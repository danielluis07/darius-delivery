"use client";

import { z } from "zod";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { credentialsSignUpSchema } from "@/db/schemas";
import { credentialsSignUp } from "@/app/auth/_actions/credentials-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import Image from "next/image";
import {
  formatCnpj,
  formatCurrency,
  formatPhoneNumber,
  formatPostalCode,
  removeFormatting,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

enum STEPS {
  FIRST = 0,
  SECOND = 1,
}

type FormData = z.infer<typeof credentialsSignUpSchema>;

const companyTypes = ["ASSOCIATION", "MEI", "LIMITED", "INDIVIDUAL"];

const translatedCompanyTypes: Record<string, string> = {
  ASSOCIATION: "Associação",
  MEI: "Microempreendedor Individual",
  LIMITED: "Limitada",
  INDIVIDUAL: "Individual",
};

export const SignUpForm = () => {
  const [step, setStep] = useState<STEPS>(STEPS.FIRST);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      domain: "",
      password: "",
      repeat_password: "",
      phone: "",
      // asaas fields
      address: "",
      addressNumber: "",
      companyType: "",
      cpfCnpj: "",
      province: "",
      incomeValue: null,
      postalCode: "",
    },
  });
  const router = useRouter();

  const handleNextStep = () => {
    setStep(STEPS.SECOND);
  };

  const handlePreviousStep = () => {
    setStep(STEPS.FIRST);
  };

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignUp({
        ...values,
        phone: removeFormatting(values.phone || ""),
        cpfCnpj: removeFormatting(values.cpfCnpj || ""),
      })
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
          console.error("Error during user sign-up:", error);
          toast.error("Um erro inesperado aconteceu. Tente novamente.");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <Card className="w-[400px]">
          <CardHeader>
            <Image
              src="/darius.png"
              width={180}
              height={180}
              alt="logo"
              className="mx-auto"
              priority
            />
            <CardTitle className="text-center text-primary pt-3">
              Crie sua Conta
            </CardTitle>
          </CardHeader>
          {step === STEPS.FIRST && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="Nome"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="Email"
                        type="email"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const formattedPhoneNumber = formatPhoneNumber(
                            event.target.value
                          );
                          field.onChange(formattedPhoneNumber);
                        }}
                        disabled={isPending}
                        placeholder="Telefone"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="Endereço"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="addressNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="Número"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        disabled={isPending}
                        placeholder="Bairro"
                        required
                      />
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
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          const formattedValue = formatPostalCode(value);
                          field.onChange(formattedValue);
                        }}
                        disabled={isPending}
                        placeholder="CEP"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}

          {step === STEPS.SECOND && (
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyType"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? ""}
                      disabled={isPending}
                      required>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companyTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {translatedCompanyTypes[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpfCnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        onChange={(event) => {
                          const value = event.target.value;
                          const formattedValue = formatCnpj(value);
                          field.onChange(formattedValue);
                        }}
                        disabled={isPending}
                        placeholder="CNPJ"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="incomeValue"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={formatCurrency(field.value ?? "")}
                        placeholder="Renda Mensal"
                        disabled={isPending}
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
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="Seu domínio (exemplo: meusite.com)"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        value={field.value}
                        disabled={isPending}
                        placeholder="Senha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="repeat_password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        value={field.value}
                        disabled={isPending}
                        placeholder="Repita a senha"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          )}

          <CardFooter>
            {step === STEPS.FIRST && (
              <Button
                className="w-full"
                type="button"
                variant="secondary"
                onClick={handleNextStep}>
                Continuar
              </Button>
            )}
            {step === STEPS.SECOND && (
              <div className="flex justify-between w-full">
                <Button
                  className="w-40"
                  type="button"
                  variant="secondary"
                  disabled={isPending}
                  onClick={handlePreviousStep}>
                  Voltar
                </Button>
                <LoadingButton
                  type="submit"
                  className="w-40"
                  isPending={isPending}
                  disabled={isPending}
                  label="Finalizar Cadastro"
                  loadingLabel="Finalizando"
                />
              </div>
            )}
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

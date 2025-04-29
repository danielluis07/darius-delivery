"use client";

import { z } from "zod";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { insertCustomerSchema, state } from "@/db/schemas";
import { credentialsSignUp } from "@/app/_features/_customer/_actions/credentials-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/hooks/template-1/use-modal-store";
import {
  formatCpf,
  formatPhoneNumber,
  formatPostalCode,
  removeFormatting,
} from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useStore } from "@/context/store-context";

enum STEPS {
  FIRST = 0,
  SECOND = 1,
}

type FormData = z.infer<typeof insertCustomerSchema>;

export const SignUpForm = () => {
  const [step, setStep] = useState<STEPS>(STEPS.FIRST);
  const [isPending, startTransition] = useTransition();
  const { onClose } = useModalStore();
  const { data } = useStore();
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
      restaurantOwnerId: data?.userId || "",
      phone: "",
      postalCode: "",
      street: "",
      cpfCnpj: "",
      street_number: "",
      complement: "",
      city: "",
      state: "",
      neighborhood: "",
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
      credentialsSignUp(
        { ...values, phone: removeFormatting(values.phone) },
        data?.apiKey ?? ""
      )
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.refresh();
            onClose();
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
      <form
        style={{
          color: "black",
        }}
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        {step === STEPS.FIRST && (
          <div className="w-full space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      value={field.value}
                      disabled={isPending}
                      placeholder="Nome"
                      className="h-9 px-4 py-2 w-full"
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
                    <input
                      {...field}
                      value={field.value}
                      disabled={isPending}
                      placeholder="Email"
                      type="email"
                      className="h-9 px-4 py-2 w-full"
                      required
                    />
                  </FormControl>
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
                    <input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        const formattedValue = formatCpf(value);
                        field.onChange(formattedValue);
                      }}
                      disabled={isPending}
                      placeholder="CPF"
                      className="h-9 px-4 py-2 w-full"
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
                    <input
                      {...field}
                      value={field.value}
                      onChange={(event) => {
                        const formattedPhoneNumber = formatPhoneNumber(
                          event.target.value
                        );
                        field.onChange(formattedPhoneNumber);
                      }}
                      disabled={isPending}
                      className="h-9 px-4 py-2 w-full"
                      placeholder="Telefone"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === STEPS.SECOND && (
          <div className="w-full space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        className="h-9 px-4 py-2 w-full"
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
                name="street_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        className="h-9 px-4 py-2 w-full"
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
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        className="h-9 px-4 py-2 w-full"
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
                name="complement"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <input
                        {...field}
                        className="h-9 px-4 py-2 w-full"
                        placeholder="Complemento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      className="h-9 px-4 py-2 w-full"
                      placeholder="Cidade"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="bg-white">
                  <Select
                    disabled={isPending}
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {state.map((state, index) => (
                        <SelectItem key={index} value={state}>
                          {state}
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
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      className="h-9 px-4 py-2 w-full"
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
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <input
                      {...field}
                      type="password"
                      className="h-9 px-4 py-2 w-full"
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
                    <input
                      {...field}
                      type="password"
                      className="h-9 px-4 py-2 w-full"
                      value={field.value}
                      disabled={isPending}
                      placeholder="Repita a senha"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {step === STEPS.FIRST && (
          <button
            type="button"
            onClick={handleNextStep}
            style={{
              backgroundColor: data?.colors.button || "white",
              color: data?.colors.font || "black",
            }}
            className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full mt-5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
            Continuar
          </button>
        )}

        {step === STEPS.SECOND && (
          <div className="flex justify-between w-full mt-5">
            <button
              type="button"
              onClick={handlePreviousStep}
              style={{
                backgroundColor: data?.colors.button || "white",
                color: data?.colors.font || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-44 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
              Voltar
            </button>
            <button
              style={{
                backgroundColor: data?.colors.button || "white",
                color: data?.colors.font || "black",
              }}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-44 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
              {isPending ? (
                <div className="flex items-center justify-center gap-2 w-full">
                  <Loader2 className="animate-spin" />
                  Entrando
                </div>
              ) : (
                <span>Entrar</span>
              )}
            </button>
          </div>
        )}
      </form>
    </Form>
  );
};

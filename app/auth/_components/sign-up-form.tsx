"use client";

import { z } from "zod";
import { useTransition } from "react";
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

type FormData = z.infer<typeof credentialsSignUpSchema>;

export const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
      phone: "",
    },
  });
  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, "");

    // Initialize an empty string for the formatted number
    let formattedNumber = "";

    // Apply conditional formatting based on the number of digits
    if (digits.length > 2) {
      formattedNumber += `(${digits.slice(0, 2)}) `;
    } else {
      formattedNumber += digits;
    }

    if (digits.length > 7) {
      formattedNumber += digits.slice(2, 7) + "-" + digits.slice(7, 11);
    } else if (digits.length > 2) {
      formattedNumber += digits.slice(2, 7);
    }

    return formattedNumber;
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignUp(values)
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
        <Card className="w-[350px]">
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
          <CardFooter>
            <LoadingButton
              type="submit"
              className="w-full"
              isPending={isPending}
              disabled={isPending}
              label="Finalizar Cadastro"
              loadingLabel="Finalizando"
            />
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
};

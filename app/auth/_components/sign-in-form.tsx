"use client";

import { z } from "zod";
import { useEffect, useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import { credentialsSignInSchema } from "@/db/schemas";
import { toast } from "sonner";
import { credentialsSignIn } from "../_actions/credentials-sign-in";
import { cn } from "@/lib/utils";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

type FormData = z.infer<typeof credentialsSignInSchema>;

export const SignInForm = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  /*   const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Esse email já está em uso com outro provedor!"
      : ""; */

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignIn(values, callbackUrl).then((res) => {
        if (!res.success) {
          toast.error(res.message);
        }
      });
    });
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
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
        <CardTitle className="text-center">Entre em sua Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      type="email"
                      {...field}
                      value={field.value}
                      placeholder="Email"
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
                    <PasswordInput placeholder="Senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <LoadingButton
              className="w-full mt-5"
              label="Entrar"
              loadingLabel="Entrando"
              disabled={isPending}
              isPending={isPending}
              type="submit"
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        <Link
          href="/auth/sign-up"
          className={cn(
            "text-muted-foreground underline-offset-4 text-sm hover:underline",
            isPending && "pointer-events-none"
          )}>
          Não tem uma conta? Cadastre-se aqui
        </Link>
      </CardFooter>
    </Card>
  );
};

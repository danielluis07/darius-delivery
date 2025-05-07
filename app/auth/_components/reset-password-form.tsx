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
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { resetPasswordSchema } from "@/db/schemas";
import { resetPassword } from "@/app/_features/_user/_actions/reset-password";
import Link from "next/link";

type FormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = ({ token }: { token: string }) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      resetPassword(values, token).then((res) => {
        if (!res.success) {
          toast.error(res.message);
        }

        if (res.success) {
          setSuccess(res.message);
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
        <CardTitle className="text-center pt-5">
          Informe sua nova senha
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      disabled={isPending}
                      placeholder="Senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              className="w-full mt-5"
              label="Salvar"
              loadingLabel="Salvando"
              disabled={isPending}
              isPending={isPending}
              type="submit"
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="justify-center">
        {success && (
          <div className="flex flex-col gap-y-2">
            <span className="text-center text-green-500 font-semibold text-sm">
              {success}
            </span>
            <Link
              href={"/auth/sign-in"}
              className="text-center text-muted-foreground underline-offset-4 hover:underline text-sm">
              Voltar para o login
            </Link>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

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
import { updatePasswordSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "@/app/_features/_admin/_actions/update-password";

type FormData = z.infer<typeof updatePasswordSchema>;

export const UpdatePasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      new_password: "",
      repeat_new_password: "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      updatePassword(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while updating password:", error);
          toast.error("Erro ao atualizar a senha");
        });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mudar Senha</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput placeholder="Senha atual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput placeholder="Nova senha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="repeat_new_password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder="Repita a nova senha"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton
              label="Salvar"
              loadingLabel="Salvando"
              className="w-full"
              disabled={isPending}
              isPending={isPending}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

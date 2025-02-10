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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { credentialsSignInSchema } from "@/db/schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";
import { credentialsSignIn } from "@/app/_features/_customer/_actions/credentials-sign-in";
import { useModalStore } from "@/hooks/use-modal-store";

type FormData = z.infer<typeof credentialsSignInSchema>;

export const SignInForm = ({
  buttonColor,
}: {
  buttonColor: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useModalStore();
  const form = useForm<FormData>({
    resolver: zodResolver(credentialsSignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignIn(values)
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
                <Input
                  disabled={isPending}
                  type="password"
                  {...field}
                  value={field.value}
                  placeholder="Senha"
                />
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
  );
};

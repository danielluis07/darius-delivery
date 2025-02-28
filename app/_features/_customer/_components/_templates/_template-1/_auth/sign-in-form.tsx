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
import { credentialsSignInSchema } from "@/db/schemas";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { credentialsSignIn } from "@/app/_features/_customer/_actions/credentials-sign-in";
import { useModalStore } from "@/hooks/use-modal-store";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof credentialsSignInSchema>;

export const SignInForm = ({
  fontColor,
  buttonColor,
}: {
  fontColor: string;
  buttonColor: string;
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
        <Button
          className="w-full"
          style={{ backgroundColor: buttonColor, color: fontColor }}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2 w-full mt-5">
              <Loader2 className="animate-spin" />
              Entrando
            </div>
          ) : (
            <span>Entrar</span>
          )}
        </Button>
      </form>
    </Form>
  );
};

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
import { useStore } from "@/context/store-context";

type FormData = z.infer<typeof credentialsSignInSchema>;

export const SignInForm = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useModalStore();
  const { data } = useStore();
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
        <button
          style={{
            backgroundColor: data?.customization.button_color || "white",
            color: data?.customization.font_color || "black",
          }}
          className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 w-full whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" />
              Entrando
            </div>
          ) : (
            <span>Entrar</span>
          )}
        </button>
      </form>
    </Form>
  );
};

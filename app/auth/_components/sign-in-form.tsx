"use client";

import { z } from "zod";
import { useActionState, useEffect, useState, useTransition } from "react";
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
import { sendPasswordResetLink } from "@/app/_features/_user/_actions/send-password-reset-link";

type FormData = z.infer<typeof credentialsSignInSchema>;

enum STEPS {
  SIGN_IN = "SIGN_IN",
  FORGOT_PASSWORD = "FORGOT_PASSWORD",
}

export const SignInForm = () => {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [state, formAction, isResetLinkPending] = useActionState(
    sendPasswordResetLink,
    null
  );
  const [isPending, startTransition] = useTransition();
  const [step, setStep] = useState<STEPS>(STEPS.SIGN_IN);
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
        <CardTitle className="text-center pt-5">
          {step === STEPS.SIGN_IN ? "Entrar" : "Recuperar Senha"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {step === STEPS.SIGN_IN ? (
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
                      <PasswordInput
                        placeholder="Senha"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Link para recuperação de senha */}
              <div
                onClick={() => setStep(STEPS.FORGOT_PASSWORD)}
                className="text-right text-sm text-muted-foreground hover:underline hover:cursor-pointer">
                Esqueceu a senha?
              </div>

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
        ) : (
          <form action={formAction}>
            <p className="text-sm text-muted-foreground mb-4">
              Enviaremos um link para redefinir sua senha para o seu email.
            </p>
            <div className="space-y-4">
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Email"
                disabled={isPending}
              />
              {state?.success && (
                <p className="text-sm text-success mb-4">{state.message}</p>
              )}
              {state?.error && (
                <p className="text-sm text-error mb-4">{state.message}</p>
              )}
              <LoadingButton
                className="w-full mt-5"
                label="Enviar Link"
                loadingLabel="Enviando"
                disabled={isResetLinkPending}
                isPending={isResetLinkPending}
                type="submit"
              />
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        {step === STEPS.SIGN_IN ? (
          <Link
            href="/auth/sign-up"
            className={cn(
              "text-muted-foreground underline-offset-4 text-sm",
              isPending && "pointer-events-none"
            )}>
            Não tem uma conta?{" "}
            <span className="hover:underline">Cadastre-se aqui</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep(STEPS.SIGN_IN)}
            className={cn(
              "text-muted-foreground underline-offset-4 text-sm",
              isResetLinkPending && "pointer-events-none"
            )}>
            Voltar para o login
          </button>
        )}
      </CardFooter>
    </Card>
  );
};

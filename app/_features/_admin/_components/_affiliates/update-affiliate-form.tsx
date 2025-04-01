"use client";

import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors } from "react-hook-form";
import { updateAffiliateSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateEmployee } from "@/app/_features/_user/_actions/update-employee";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { Check, Copy } from "lucide-react";

type FormData = z.infer<typeof updateAffiliateSchema>;

type Affiliate = InferResponseType<
  (typeof client.api.admin.affiliates)[":userId"]["$get"],
  200
>["data"];

export const UpdateAffiliateForm = ({
  userId,
  data,
}: {
  userId: string;
  data: Affiliate;
}) => {
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const textToCopy = `https://dariusdelivery.com.br/${data.referralCode}`;
  const form = useForm<FormData>({
    resolver: zodResolver(updateAffiliateSchema),
    defaultValues: {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      password: "",
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta após 2s
    } catch (err) {
      console.error("Falha ao copiar:", err);
      toast.error("Falha ao copiar o link de afiliado.");
    }
  };

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(() => {
      updateEmployee(userId, {
        ...values,
        phone: removeFormatting(values.phone),
      })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/employees");
          }
        })
        .catch((error) => {
          console.error("Error while updating affiliate:", error);
          toast.error(
            "Erro ao atualizar afiliado. Tente novamente mais tarde."
          );
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <CardTitle>Atualizar Afiliado</CardTitle>
          <div className="relative w-96">
            <Input type="text" readOnly value={textToCopy} />
            <div
              className="absolute top-1/2 -translate-y-1/2 right-1"
              onClick={handleCopy}>
              {copied ? (
                <Check size={15} className="text-green-500" />
              ) : (
                <Copy size={15} className="cursor-pointer" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome"
                        disabled={isPending}
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
                        type="email"
                        placeholder="Email"
                        disabled={isPending}
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
                        value={field.value}
                        onChange={(event) => {
                          const formattedPhoneNumber = formatPhoneNumber(
                            event.target.value
                          );
                          field.onChange(formattedPhoneNumber);
                        }}
                        className="h-9 px-4 py-2 w-full"
                        placeholder="Telefone"
                        disabled={isPending}
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
                        placeholder="Senha"
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LoadingButton
              type="submit"
              label="Atualizar Afiliado"
              isPending={isPending}
              disabled={isPending}
              loadingLabel="Atualizando..."
              className="w-full mt-5"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

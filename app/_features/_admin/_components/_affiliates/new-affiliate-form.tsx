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
import { createAffiliateSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createAffiliate } from "../../_actions/create-affiliate";

type FormData = z.infer<typeof createAffiliateSchema>;

export const NewAffiliateForm = () => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(createAffiliateSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(() => {
      createAffiliate({ ...values, phone: removeFormatting(values.phone) })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/admin/affiliates");
          }
        })
        .catch((error) => {
          console.error("Error while creating affiliate:", error);
          toast.error("Erro ao criar afiliado. Tente novamente mais tarde.");
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Afiliado</CardTitle>
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
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LoadingButton
              type="submit"
              label="Criar Afiliado"
              isPending={isPending}
              disabled={isPending}
              loadingLabel="Criando..."
              className="w-full mt-5"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

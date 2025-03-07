"use client";

import { z } from "zod";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { insertAdminCommissionSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createComission } from "@/app/_features/_admin/_actions/create-commission";

type FormData = z.infer<typeof insertAdminCommissionSchema>;

export const ComissionForm = ({
  percentage,
}: {
  percentage: string | undefined;
}) => {
  console.log(percentage);
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertAdminCommissionSchema),
    defaultValues: {
      percentage,
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      createComission(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.refresh();
          }
        })
        .catch((error) => {
          console.error("Error while creating/updating comission:", error);
          toast.error("Erro ao definir a comissão");
        });
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Definir Comissão (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <FormField
              control={form.control}
              name="percentage"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      className="text-center"
                      {...field}
                      placeholder="Valor (%)"
                      required
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

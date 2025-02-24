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
import { insertUserDomainSchema } from "@/db/schemas";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { updateDomain } from "@/app/_features/_user/_actions/update-domain";
import { Input } from "@/components/ui/input";

type FormData = z.infer<typeof insertUserDomainSchema>;

export const DomainForm = ({
  domain,
}: {
  domain: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertUserDomainSchema),
    defaultValues: {
      domain: domain || "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      updateDomain(values, domain)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while updating domain:", error);
          toast.error("Erro ao atualizar o domínio");
        });
    });
  };

  return (
    <Form {...form}>
      <form
        className="p-6 rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <h1 className="font-semibold">Domínio</h1>
        <div className="flex items-center gap-5 mt-5">
          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Insira o domínio aqui..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            label="Atualizar"
            loadingLabel="Atualizando..."
            className="min-w-[200px]"
            disabled={isPending}
            isPending={isPending}
          />
        </div>
      </form>
    </Form>
  );
};

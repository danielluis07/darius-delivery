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
import { insertApiKeySchema } from "@/db/schemas";
import { insertGoogleApiKey } from "@/app/_features/_user/_actions/insert-google-api-key";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

type FormData = z.infer<typeof insertApiKeySchema>;

export const GoogleApiKeyForm = ({
  userApiKey,
}: {
  userApiKey: string | null | undefined;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertApiKeySchema),
    defaultValues: {
      apiKey: userApiKey || "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      insertGoogleApiKey(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while saving google api key:", error);
          toast.error("Erro ao salvar a chave do Google Maps");
        });
    });
  };

  return (
    <Form {...form}>
      <form
        className="bg-white p-6 rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chave do Google Maps</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder="Insira a chave aqui..."
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
          className="w-full mt-5"
          disabled={isPending}
          isPending={isPending}
        />
      </form>
    </Form>
  );
};

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
import { insertApiKeySchema } from "@/db/schemas";
import { insertGoogleApiKey } from "@/app/_features/_user/_actions/insert-google-api-key";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { PasswordInput } from "@/components/ui/password-input";

type FormData = z.infer<typeof insertApiKeySchema>;

export const GoogleApiKeyForm = ({
  userApiKey,
  storeId,
}: {
  userApiKey: string | null | undefined;
  storeId: string;
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
      insertGoogleApiKey(values, storeId)
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
        <h1 className="font-semibold">Chave do Google Maps</h1>
        <div className="flex items-center gap-5 mt-5">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem className="w-full">
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
            label={userApiKey ? "Atualizar" : "Salvar"}
            loadingLabel="Salvando..."
            className="min-w-[200px]"
            disabled={isPending}
            isPending={isPending}
          />
        </div>
      </form>
    </Form>
  );
};

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
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors } from "react-hook-form";
import { insertPixelsSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { toast } from "sonner";
import { createPixels } from "@/app/_features/_user/_actions/create-pixels";
import { Card } from "@/components/ui/card";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type Pixel = InferResponseType<
  (typeof client.api.pixels.user)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertPixelsSchema>;

export const CreatePixelsForm = ({ data }: { data: Pixel | null }) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertPixelsSchema),
    defaultValues: {
      pixel_facebook: data?.pixel_facebook ?? "",
      pixel_google: data?.pixel_google ?? "",
      pixel_tiktok: data?.pixel_tiktok ?? "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      createPixels(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error creating category:", error);
          toast.error("Erro ao criar categoria");
        });
    });
  };
  return (
    <Card>
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <FormField
            control={form.control}
            name="pixel_facebook"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pixel do Facebook</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Insira o pixel aqui"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pixel_google"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pixel do Google</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Insira o pixel aqui"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pixel_tiktok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pixel do TikTok</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    placeholder="Insira o pixel aqui"
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
            type="submit"
          />
        </form>
      </Form>
    </Card>
  );
};

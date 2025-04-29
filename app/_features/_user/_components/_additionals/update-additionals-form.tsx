"use client";

import { z } from "zod";
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
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { additionalGroupSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { useUpdateAdditional } from "../../_queries/_additionals/use-update-additional";

type ResponseType = InferResponseType<
  (typeof client.api.additionals)[":id"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof additionalGroupSchema>;

export const UpdateAdditionalsForm = ({
  id,
  data,
}: {
  id: string;
  data: ResponseType;
}) => {
  const { mutate, isPending } = useUpdateAdditional(id);
  const form = useForm<FormData>({
    resolver: zodResolver(additionalGroupSchema),
    defaultValues: {
      name: data.name ?? "",
      additionals: data.additionals.map((a) => ({
        id: a.id ?? undefined, // se você quiser manter o ID (não é obrigatório)
        name: a.name ?? "",
        priceAdjustment: a.priceAdjustment ?? 0,
      })),
    },
  });

  const router = useRouter();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additionals",
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate(values, {
      onSuccess: () => {
        router.push("/dashboard/additionals");
      },
    });
  };

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Bordas"
                  {...field}
                  value={field.value}
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <h3 className="text-md font-medium mb-2">Opções para esse grupo:</h3>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-end gap-2 mb-2 border rounded-lg px-2 py-3">
              <FormField
                control={form.control}
                name={`additionals.${index}.name`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Opção {index + 1}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`additionals.${index}.priceAdjustment`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Preço</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={formatCurrency(field.value)}
                        placeholder="R$ 0,00"
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, "");
                          const numericValue = rawValue
                            ? parseInt(rawValue, 10)
                            : 0;
                          field.onChange(numericValue);
                        }}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 1 || isPending}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isPending}
            onClick={() => append({ name: "", priceAdjustment: 0 })}>
            Adicionar opção
          </Button>
        </div>

        <LoadingButton
          label="Atualizar"
          loadingLabel="Atualizando..."
          className="w-full"
          disabled={isPending}
          isPending={isPending}
          type="submit"
        />
      </form>
    </Form>
  );
};

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
import { useForm, FieldErrors } from "react-hook-form";
import { insertColorsSchema } from "@/db/schemas";

import { LoadingButton } from "@/components/ui/loading-button";
import { ColorPicker } from "@/components/color-picker";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { useCreateColors } from "../../_queries/_colors/use-create-colors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateColors } from "../../_queries/_colors/use-update-colors";

type TemplatesResponseType = InferResponseType<
  typeof client.api.templates.$get,
  200
>["data"];

type ColorsResponseType = InferResponseType<
  (typeof client.api.colors.user)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertColorsSchema>;

export const ColorsForm = ({
  colors,
  templates,
}: {
  colors: ColorsResponseType | null;
  templates: TemplatesResponseType;
}) => {
  const create = useCreateColors();
  const update = useUpdateColors(colors?.id || "");

  const form = useForm<FormData>({
    resolver: zodResolver(insertColorsSchema),
    defaultValues: {
      id: colors?.id,
      template_id: colors?.template_id,
      background: colors?.background,
      header: colors?.header,
      button: colors?.button,
      font: colors?.font,
      footer: colors?.footer,
      footer_button: colors?.footer_button,
      product_name: colors?.product_name,
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    if (colors) {
      update.mutate(values);
    } else {
      create.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="template_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template</FormLabel>
              <Select onValueChange={field.onChange} required>
                <FormControl>
                  <SelectTrigger className="w-1/2">
                    <SelectValue placeholder="Selecione um template" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-3 gap-4 mt-8">
          <FormField
            control={form.control}
            name="background"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor de Fundo</FormLabel>
                <FormControl>
                  <ColorPicker
                    className="size-28"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="header"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor do Header</FormLabel>
                <FormControl>
                  <ColorPicker
                    className="size-28"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="button"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor do botão</FormLabel>
                <FormControl>
                  <ColorPicker
                    className="size-28"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="font"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor da Fonte</FormLabel>
                <FormControl>
                  <ColorPicker
                    className="size-28"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="footer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor do Footer</FormLabel>
                <FormControl>
                  <ColorPicker
                    className="size-28"
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <LoadingButton
          label="Definir Cores"
          loadingLabel="Salvando..."
          className="w-full mt-5"
          disabled={create.isPending || update.isPending}
          isPending={create.isPending || update.isPending}
          type="submit"
        />
      </form>
    </Form>
  );
};

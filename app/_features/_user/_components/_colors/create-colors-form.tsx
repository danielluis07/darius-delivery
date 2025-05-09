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
      background: colors?.background || "#ffffff",
      header: colors?.header || "#ffffff",
      button: colors?.button || "#ffffff",
      font: colors?.font || "#000000",
      product_details: colors?.product_details || "#ffffff",
      footer: colors?.footer || "#ffffff",
      footer_font: colors?.footer_font || "#000000",
      footer_button: colors?.footer_button || "#ffffff",
      product_name: colors?.product_name || "#000000",
      product_description: colors?.product_description || "#000000",
      product_price: colors?.product_price || "#000000",
      product_card_name: colors?.product_card_name || "#000000",
      product_card_price: colors?.product_card_price || "#000000",
      product_card_description: colors?.product_card_description || "#000000",
      additionals: colors?.additionals || "#ffffff",
      additionals_font: colors?.additionals_font || "#000000",
      cart: colors?.cart || "#000000",
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
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                required>
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
        <div className="grid grid-cols-4 gap-3 mt-8">
          <FormField
            control={form.control}
            name="background"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fundo</FormLabel>
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
                <FormLabel>Header</FormLabel>
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
                <FormLabel>Botões</FormLabel>
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
                <FormLabel>Fonte (geral)</FormLabel>
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
                <FormLabel>Rodapé</FormLabel>
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
            name="footer_font"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte do Rodapé</FormLabel>
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
            name="footer_button"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Botão do Footer</FormLabel>
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
            name="product_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
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
            name="product_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do Produto</FormLabel>
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
            name="product_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço do Produto</FormLabel>
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
            name="additionals"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adicionais</FormLabel>
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
            name="additionals_font"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fonte dos Adicionais</FormLabel>
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
            name="cart"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ícone do Carrinho</FormLabel>
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
            name="product_card_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título do botão do produto</FormLabel>
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
            name="product_card_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço do botão do produto</FormLabel>
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
            name="product_card_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição do botão do produto</FormLabel>
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
            name="product_details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Detalhes do Produto</FormLabel>
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

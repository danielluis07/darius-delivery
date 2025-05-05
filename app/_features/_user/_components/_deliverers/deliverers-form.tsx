"use client";

import { z } from "zod";
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
import { insertDeliverersSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCreateDeliverer } from "@/app/_features/_user/_queries/_deliverers/use-create-deliverer";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";

type FormData = z.infer<typeof insertDeliverersSchema>;

export const DeliverersForm = ({
  isLoading,
  storeId,
}: {
  isLoading: boolean;
  storeId: string;
}) => {
  const { mutate, isPending } = useCreateDeliverer(storeId);
  const form = useForm<FormData>({
    resolver: zodResolver(insertDeliverersSchema),
    defaultValues: {
      storeId,
      name: "",
      phone: "",
      vehicle: "",
      vehicle_plate: "",
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate({ ...values, phone: removeFormatting(values.phone) });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="flex items-center gap-4">
          <div className="w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Nome"
                      required
                      disabled={isPending || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const formattedPhoneNumber = formatPhoneNumber(
                          event.target.value
                        );
                        field.onChange(formattedPhoneNumber);
                      }}
                      disabled={isPending || isLoading}
                      placeholder="Telefone"
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Veículo"
                      required
                      disabled={isPending || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="vehicle_plate"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Placa do veículo"
                      maxLength={7} // Limita a 7 caracteres
                      onChange={(e) => {
                        let value = e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, ""); // Remove caracteres inválidos
                        value = value.replace(
                          /^([A-Z]{3})([0-9]{1})([A-Z]{1})([0-9]{2})$/,
                          "$1$2$3$4"
                        ); // Mantém no padrão Mercosul
                        field.onChange(value); // Atualiza o campo formatado
                      }}
                      required
                      disabled={isPending || isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <LoadingButton
          type="submit"
          label="Salvar"
          loadingLabel="Salvando"
          disabled={isPending || isLoading}
          isPending={isPending}
          className="w-full mt-5"
        />
      </form>
    </Form>
  );
};

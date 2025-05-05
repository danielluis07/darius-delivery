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
import { insertDeliveryAreasSchema, state } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCreateDeliveryArea } from "@/app/_features/_user/_queries/_delivery-areas/use-create-delivery-area";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormData = z.infer<typeof insertDeliveryAreasSchema>;

export const DeliveryAreasForm = ({
  isLoading,
  storeId,
}: {
  isLoading: boolean;
  storeId: string;
}) => {
  const { mutate, isPending } = useCreateDeliveryArea(storeId);
  const form = useForm<FormData>({
    resolver: zodResolver(insertDeliveryAreasSchema),
    defaultValues: {
      storeId,
      city: "",
      state: "",
      neighborhood: "",
      delivery_fee: 0,
    },
  });

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="flex items-center gap-4">
          <div className="w-full">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Cidade"
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
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Bairro"
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
              name="state"
              render={({ field }) => (
                <FormItem>
                  <Select
                    disabled={isPending || isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="">
                      {state.map((state, index) => (
                        <SelectItem key={index} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-full">
            <FormField
              control={form.control}
              name="delivery_fee"
              render={({ field }) => (
                <FormItem>
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

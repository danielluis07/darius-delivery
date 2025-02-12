"use client";

import { z } from "zod";
import { GoogleMapComponent } from "@/components/google-map";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm, FieldErrors, useFieldArray } from "react-hook-form";
import { insertDeliveryAreaKmSchema } from "@/db/schemas";
import { Plus, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type FormData = z.infer<typeof insertDeliveryAreaKmSchema>;

export const DeliveryAreasKmForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(insertDeliveryAreaKmSchema),
    defaultValues: {
      apiKey: "",
      latitude: null,
      longitude: null,
      fees: [{ distance: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "fees",
  });

  const radiusKmList = form
    .watch("fees")
    .map((fee) => fee.distance)
    .filter(Boolean);

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form
        className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Chave do Google Maps" required />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="mt-4">
          <GoogleMapComponent
            apiKey={form.watch("apiKey")}
            setLatitude={(lat) => form.setValue("latitude", lat)}
            setLongitude={(lng) => form.setValue("longitude", lng)}
            radiusKmList={radiusKmList}
          />
        </div>

        <div className="mt-6">
          <p className="block mb-2 font-medium">Taxas por Distância (KM)</p>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-3 mt-2">
              <FormField
                control={form.control}
                name={`fees.${index}.distance`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder={`${index + 1} KM`}
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`fees.${index}.price`}
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(index)}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ distance: fields.length + 1, price: 0 })}
            className="mt-2">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Taxa
          </Button>
        </div>

        <Button type="submit" variant="secondary" className="mt-6 w-full">
          Salvar
        </Button>
      </form>
    </Form>
  );
};

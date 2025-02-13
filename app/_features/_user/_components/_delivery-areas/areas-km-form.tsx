"use client";

import { z } from "zod";
import { useTransition } from "react";
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
import { client } from "@/lib/hono";
import { InferResponseType } from "hono";
import { createDeliveryAreasKm } from "@/app/_features/_user/_actions/create-delivery-areas-km";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoadingButton } from "@/components/ui/loading-button";

type ResponseType = InferResponseType<
  (typeof client.api.deliveryareas.km)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertDeliveryAreaKmSchema>;

export const DeliveryAreasKmForm = ({
  data,
  apikey,
}: {
  data: ResponseType | null;
  apikey: string;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(insertDeliveryAreaKmSchema),
    defaultValues: {
      latitude: data?.latitude || null,
      longitude: data?.longitude || null,
      fees:
        data?.fees?.map((fee) => ({
          distance: fee.distance ?? 0,
          price: fee.price ?? 0,
        })) || [],
    },
  });

  const router = useRouter();

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
    startTransition(() => {
      createDeliveryAreasKm(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard");
          }
        })
        .catch((error) => {
          console.error("Error creating category:", error);
          toast.error("Erro ao criar categoria");
        });
    });
  };

  return (
    <Form {...form}>
      <form
        className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="mt-4">
          <GoogleMapComponent
            key={radiusKmList.length}
            apiKey={apikey}
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

        <LoadingButton
          type="submit"
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

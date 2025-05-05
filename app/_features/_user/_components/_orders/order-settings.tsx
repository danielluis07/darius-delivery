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
import { insertOrderSettingsSchema } from "@/db/schemas";
import { useGetOrdersSettings } from "@/app/_features/_user/_queries/_orders/use-get-order-settings";
import { useUpdateOrderSettings } from "@/app/_features/_user/_queries/_orders/use-update-order-settings";
import { useCreateOrderSettings } from "../../_queries/_orders/use-create-order-settings";
import { Card } from "@/components/ui/card";
import { ClipboardPen, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof insertOrderSettingsSchema>;

export const OrderSettings = ({ storeId }: { storeId: string }) => {
  const { data, isLoading } = useGetOrdersSettings(storeId);
  const [edit, setEdit] = useState<boolean>(false);
  const { mutate: createOrderSettings, isPending: isPendingCreation } =
    useCreateOrderSettings(storeId);
  const { mutate: updateOrderSettings, isPending: isPendingUpdate } =
    useUpdateOrderSettings(data?.id, storeId);
  const form = useForm<FormData>({
    resolver: zodResolver(insertOrderSettingsSchema),
    defaultValues: {
      storeId: storeId,
      delivery_deadline: 0,
      pickup_deadline: 0,
    },
  });

  const { reset } = form;

  useEffect(() => {
    if (data) {
      reset({
        delivery_deadline: data.delivery_deadline,
        pickup_deadline: data.pickup_deadline,
      });
    }
  }, [data, reset, form]);

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    if (data) {
      updateOrderSettings(values, {
        onSuccess: () => {
          setEdit(false);
        },
      });
    } else {
      createOrderSettings(values, {
        onSuccess: () => {
          setEdit(false);
        },
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="w-[300px] h-[185px]" />;
  }

  return (
    <Card className="w-[300px] h-[185px] text-xs pt-8 relative">
      <div
        className={cn(
          "absolute top-1 right-1 cursor-pointer",
          edit && "text-secondary"
        )}
        onClick={() => setEdit(!edit)}>
        <ClipboardPen className="size-5" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
          <div className="flex justify-between">
            {/* left */}
            <div className="flex items-center justify-center">
              <Clock className="size-14" />
            </div>
            {/* right */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="delivery_deadline"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <div className="relative">
                          <Input
                            readOnly={!edit}
                            {...field}
                            className="pr-12"
                            onChange={(e) => {
                              const newValue = e.target.value
                                ? parseInt(e.target.value, 10)
                                : "";
                              field.onChange(newValue);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            min
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-[10px]">PARA ENTREGA</span>
              </div>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="pickup_deadline"
                  render={({ field }) => (
                    <FormItem className="w-24">
                      <FormControl>
                        <div className="relative">
                          <Input
                            readOnly={!edit}
                            {...field}
                            className="pr-12"
                            onChange={(e) => {
                              const newValue = e.target.value
                                ? parseInt(e.target.value, 10)
                                : "";
                              field.onChange(newValue);
                            }}
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            min
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="text-[10px]">PARA RETIRADA</span>
              </div>
            </div>
          </div>
          <Separator className="my-3" />
          {edit ? (
            <LoadingButton
              type="submit"
              label="Salvar"
              className="w-full"
              loadingLabel="Salvando"
              disabled={isPendingCreation || isPendingUpdate}
              isPending={isPendingCreation || isPendingUpdate}
            />
          ) : (
            <p className="text-center">TEMPO ESTIMADO EXIBIDO NO SITE</p>
          )}
        </form>
      </Form>
    </Card>
  );
};

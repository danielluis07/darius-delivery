"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm, FieldErrors } from "react-hook-form";
import { Switch } from "@/components/ui/switch";
import { useTransition } from "react";
import { openRestaurant } from "@/app/_features/_user/_actions/open-restaurant";
import { toast } from "sonner";

const formSchema = z.object({
  isOpen: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

export const OpenRestaurant = ({ isOpen }: { isOpen: boolean | undefined }) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isOpen,
    },
  });

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      openRestaurant(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
          }
        })
        .catch((error) => {
          console.error("Error while opening restaurante", error);
          toast.error("Erro ao abrir a loja. Tente novamente mais tarde.");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
        <div className="w-full">
          <FormField
            control={form.control}
            name="isOpen"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm w-[300px] h-[130px] mt-8">
                <div className="space-y-0.5">
                  <FormLabel>Loja está aberta?</FormLabel>
                  <FormDescription>
                    Escolha se a loja está aberta ou fechada para os clientes
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      form.handleSubmit(onSubmit, onInvalid)();
                    }}
                    disabled={isPending}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

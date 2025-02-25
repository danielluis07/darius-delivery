"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FieldErrors } from "react-hook-form";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { insertCustomerByUserSchema, state } from "@/db/schemas";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCustomer } from "@/app/_features/_user/_queries/_customers/use-create-customer";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCreateCustomerDialog } from "@/hooks/use-customer-dialog";

type FormData = z.infer<typeof insertCustomerByUserSchema>;

export const NewCustomerForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomerByUserSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      complement: "",
      street_number: "",
      neighborhood: "",
      street: "",
    },
  });

  const { isOpen, onOpen, onClose } = useCreateCustomerDialog();
  const { mutate, isPending } = useCreateCustomer(onClose);

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    const formattedValues = {
      ...values,
      phone: removeFormatting(values.phone),
    };

    mutate(formattedValues);
    form.reset();
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <DrawerTrigger className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-white shadow hover:bg-secondary hover:text-primary">
        Registrar Cliente <Plus />
      </DrawerTrigger>
      <DrawerContent className="h-[380px] p-5">
        <DrawerHeader>
          <VisuallyHidden.Root>
            <DrawerTitle>Are you absolutely sure?</DrawerTitle>
          </VisuallyHidden.Root>
          <VisuallyHidden.Root>
            <DrawerDescription>This action cannot be undone.</DrawerDescription>
          </VisuallyHidden.Root>
        </DrawerHeader>
        <Form {...form}>
          <form
            className="flex flex-col justify-between h-full"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Nome"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Email"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Telefone"
                        disabled={isPending}
                        required
                        onChange={(event) => {
                          const formattedPhoneNumber = formatPhoneNumber(
                            event.target.value
                          );
                          field.onChange(formattedPhoneNumber);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="street"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Rua"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="street_number"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Número"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Bairro"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complement"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Complemento (opcional)"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="Cidade"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      disabled={isPending}
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
            <LoadingButton
              type="submit"
              label="Registrar"
              className="w-full"
              loadingLabel="Registrando"
              disabled={isPending}
              isPending={isPending}
            />
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

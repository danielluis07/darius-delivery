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
import { useForm, FieldErrors } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { insertCustomerByUserSchema } from "@/db/schemas";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";
import { LoadingButton } from "@/components/ui/loading-button";
import { useRouter } from "next/navigation";
import { useUpdateCustomer } from "@/app/_features/_user/_queries/_customers/use-update-customer";

type Customer = InferResponseType<
  (typeof client.api.customers)[":userId"]["$get"],
  200
>["data"];

type FormData = z.infer<typeof insertCustomerByUserSchema>;

export const CustomerDetails = ({ customer }: { customer: Customer }) => {
  const { mutate, isPending } = useUpdateCustomer(customer.id);
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomerByUserSchema),
    defaultValues: {
      userId: customer.id,
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      street: customer.street || "",
      street_number: customer.street_number || "",
      complement: customer.complement || "",
      neighborhood: customer.neighborhood || "",
      city: customer.city || "",
      state: customer.state || "",
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    mutate(
      { ...values, phone: removeFormatting(values.phone) },
      {
        onSuccess: () => {
          router.push("/dashboard/customers");
        },
      }
    );
  };

  return (
    <Card className="p-6 shadow-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={formatPhoneNumber(field.value)}
                      onChange={(event) => {
                        const formattedPhoneNumber = formatPhoneNumber(
                          event.target.value
                        );
                        field.onChange(formattedPhoneNumber);
                      }}
                      disabled={isPending}
                      placeholder="Telefone"
                      required
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cidade</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
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
                  <FormLabel>Estado</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      value={field.value}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <LoadingButton
            type="submit"
            className="w-full mt-5"
            label="Atualizar"
            loadingLabel="Atualizando"
            disabled={isPending}
            isPending={isPending}
          />
        </form>
      </Form>
    </Card>
  );
};

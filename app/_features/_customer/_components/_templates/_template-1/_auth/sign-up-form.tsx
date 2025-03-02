"use client";

import { z } from "zod";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldErrors, useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { insertCustomerSchema, state } from "@/db/schemas";
import { credentialsSignUp } from "@/app/_features/_customer/_actions/credentials-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/hooks/use-modal-store";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useStore } from "@/context/store-context";

type FormData = z.infer<typeof insertCustomerSchema>;

export const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();
  const { onClose } = useModalStore();
  const { data } = useStore();
  const form = useForm<FormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      repeat_password: "",
      restaurantOwnerId: data?.userId || "",
      phone: "",
      street: "",
      street_number: "",
      complement: "",
      city: "",
      state: "",
      neighborhood: "",
    },
  });
  const router = useRouter();

  const onInvalid = (errors: FieldErrors) => {
    console.log(errors);
  };

  const onSubmit = (values: FormData) => {
    startTransition(() => {
      credentialsSignUp({ ...values, phone: removeFormatting(values.phone) })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.refresh();
            onClose();
          }
        })
        .catch((error) => {
          console.error("Error during user sign-up:", error);
          toast.error("Um erro inesperado aconteceu. Tente novamente.");
        });
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  value={field.value}
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
                  value={field.value}
                  disabled={isPending}
                  placeholder="Email"
                  type="email"
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
                  value={field.value}
                  onChange={(event) => {
                    const formattedPhoneNumber = formatPhoneNumber(
                      event.target.value
                    );
                    field.onChange(formattedPhoneNumber);
                  }}
                  disabled={isPending}
                  placeholder="Telefone"
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} placeholder="Endereço" required />
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
                  <Input {...field} placeholder="Número" required />
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
                  <Input {...field} placeholder="Bairro" required />
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
                  <Input {...field} placeholder="Complemento (opcional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="Cidade" required />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  value={field.value}
                  disabled={isPending}
                  placeholder="Senha"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="repeat_password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  value={field.value}
                  disabled={isPending}
                  placeholder="Repita a senha"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="w-full"
          style={{
            backgroundColor: data?.customization.button_color || "white",
            color: data?.customization.font_color || "black",
          }}>
          {isPending ? (
            <div className="flex items-center justify-center gap-2 w-full mt-5">
              <Loader2 className="animate-spin" />
              Entrando
            </div>
          ) : (
            <span>Entrar</span>
          )}
        </Button>
      </form>
    </Form>
  );
};

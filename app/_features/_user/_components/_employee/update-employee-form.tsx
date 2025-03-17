"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { createEmployeeSchema } from "@/db/schemas";
import { LoadingButton } from "@/components/ui/loading-button";
import { formatPhoneNumber, removeFormatting } from "@/lib/utils";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select-permission";
import { useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateEmployee } from "@/app/_features/_user/_actions/update-employee";
import { InferResponseType } from "hono";
import { client } from "@/lib/hono";

type FormData = z.infer<typeof createEmployeeSchema>;

const permissions = [
  "Categorias",
  "Produtos",
  "Configuração de Domínio",
  "Personalização",
  "Entregadores",
  "Pedidos",
  "Roteirização de Pedidos",
  "Combos",
  "Clientes",
  "Financeiro",
  "Áreas de Entrega",
  "Impressão de Comandas",
  "Pixels",
  "Darius Pay",
];

type Employee = InferResponseType<
  (typeof client.api.users.employee)[":employeeId"]["$get"],
  200
>["data"];

export const UpdateEmployeeForm = ({
  userId,
  data,
}: {
  userId: string;
  data: Employee;
}) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      password: data.password || "",
      permissions: data.permissions || [],
    },
  });

  const router = useRouter();

  const onInvalid = (errors: FieldErrors<FormData>) => {
    console.log(errors);
  };

  const onSubmit = async (values: FormData) => {
    startTransition(() => {
      updateEmployee(userId, {
        ...values,
        phone: removeFormatting(values.phone),
      })
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
          }

          if (res.success) {
            toast.success(res.message);
            router.push("/dashboard/employees");
          }
        })
        .catch((error) => {
          console.error("Error while creating/updating comission:", error);
          toast.error("Erro ao definir a comissão");
        });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atualizar Funcionário</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)}>
            <div className="grid grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome"
                        disabled={isPending}
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
                        type="email"
                        placeholder="Email"
                        disabled={isPending}
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
                        className="h-9 px-4 py-2 w-full"
                        placeholder="Telefone"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
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
                        placeholder="Senha"
                        disabled={isPending}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissões</FormLabel>
                    <FormControl>
                      <MultiSelector
                        values={field.value as string[]}
                        onValuesChange={field.onChange}
                        loop>
                        <MultiSelectorTrigger>
                          <MultiSelectorInput placeholder="Selecionar" />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {permissions.map((permission, i) => (
                              <MultiSelectorItem key={i} value={permission}>
                                {permission}
                              </MultiSelectorItem>
                            ))}
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <LoadingButton
              type="submit"
              label="Atualizar Funcionário"
              isPending={isPending}
              disabled={isPending}
              loadingLabel="Atualizando..."
              className="w-full mt-5"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
